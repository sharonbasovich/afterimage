"""Retain immutable reviewed and initial-entry snapshots in every Pages artifact.

Hashes are pinned in the repository, not accepted from the remote host. The first
promotion may recover the initial snapshot from the old root; later promotions
must recover it from its immutable archive directory. No unverified bytes ship.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import shutil
import tempfile
from urllib.error import HTTPError
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

OLD = "008a75b96a5e63ad3a853c3dcbcc014ed2abed6f"
REVIEW = "6b317b62a7751a2bf79d5c0a19990121f23d7b00"
ARCHIVE_PATH = f"archive/{OLD}"
REVIEW_PATH = f"review/{REVIEW}"


def relative(name):
    if not isinstance(name, str) or not name or "\\" in name or ":" in name:
        raise ValueError("Unsafe path")
    if any(p in ("", ".", "..") for p in name.split("/")) or any(ord(c) < 32 for c in name):
        raise ValueError("Unsafe path")
    path = PurePosixPath(name)
    if path.is_absolute():
        raise ValueError("Absolute path")
    return path


def entries(manifest):
    files = manifest["files"]
    names = [str(relative(f["path"])) for f in files]
    if len(set(names)) != len(names) or not {"index.html", "deployment.json"}.issubset(names):
        raise ValueError("Duplicate or incomplete snapshot")
    for entry in files:
        if not isinstance(entry["bytes"], int) or entry["bytes"] < 0:
            raise ValueError("Invalid length")
        digest = entry["sha256"]
        if not isinstance(digest, str) or len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
            raise ValueError("Invalid digest")
    return files


def check(data, entry):
    if len(data) != entry["bytes"] or hashlib.sha256(data).hexdigest() != entry["sha256"]:
        raise ValueError(f"Pinned snapshot mismatch: {entry['path']}")


def fetch(base, entry):
    if entry["path"] == ".nojekyll":
        data = b""
    else:
        url = base + quote(entry["path"], safe="/")
        with urlopen(Request(url, headers={"Accept-Encoding": "identity", "Cache-Control": "no-cache"}), timeout=90) as response:
            if response.geturl() != url:
                raise ValueError("Unexpected snapshot redirect")
            data = response.read(entry["bytes"] + 1)
    check(data, entry)
    return data


def old_source(root, manifest):
    entry = next(e for e in entries(manifest) if e["path"] == "deployment.json")
    archive = root + ARCHIVE_PATH + "/"
    try:
        data = fetch(archive, entry)
    except HTTPError as error:
        # Only a genuinely absent archive allows the one-time bootstrap. The
        # root identity and every root file must still match the pinned bytes.
        if error.code != 404:
            raise
        data = fetch(root, entry)
        archive = root
    if json.loads(data)["commit"] != OLD:
        raise ValueError("Initial snapshot identity changed")
    return archive


def download(base, manifest, target):
    for entry in entries(manifest):
        path = target / relative(entry["path"])
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(fetch(base, entry))


def verify_disk(target, manifest):
    actual = set()
    for path in target.rglob("*"):
        if path.is_symlink():
            raise ValueError("Symlink in snapshot")
        if path.is_file():
            actual.add(path.relative_to(target).as_posix())
    if actual != {e["path"] for e in entries(manifest)}:
        raise ValueError("Snapshot file set differs")
    for entry in entries(manifest):
        check((target / relative(entry["path"])).read_bytes(), entry)


def retain(root, output, old_manifest, review_manifest):
    if old_manifest.get("root_commit") != OLD or review_manifest.get("commit") != REVIEW:
        raise ValueError("Unexpected manifest identity")
    entries(old_manifest)
    entries(review_manifest)
    if not (output / "index.html").is_file() or any(p.is_symlink() for p in output.rglob("*")):
        raise ValueError("Invalid new root artifact")
    if (output / "archive").exists() or (output / "review").exists():
        raise ValueError("Reserved snapshot namespace already exists")
    before = {p.relative_to(output).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in output.rglob("*") if p.is_file()}
    with tempfile.TemporaryDirectory() as temp:
        staged = Path(temp)
        download(old_source(root, old_manifest), old_manifest, staged / ARCHIVE_PATH)
        download(root + REVIEW_PATH + "/", review_manifest, staged / REVIEW_PATH)
        verify_disk(staged / ARCHIVE_PATH, old_manifest)
        verify_disk(staged / REVIEW_PATH, review_manifest)
        shutil.copytree(staged / "archive", output / "archive")
        shutil.copytree(staged / "review", output / "review")
    for path, digest in before.items():
        if hashlib.sha256((output / path).read_bytes()).hexdigest() != digest:
            raise ValueError("New root unexpectedly altered")
    return {"initial_snapshot": OLD, "review_snapshot": REVIEW, "new_root_files_unchanged": len(before)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--verify-host", action="store_true")
    args = parser.parse_args()
    url = urlsplit(args.root)
    if url.scheme != "https" or not args.root.endswith("/") or url.query or url.fragment or url.username or url.password:
        raise ValueError("Root must be an HTTPS directory without credentials/query/fragment")
    docs = Path(__file__).resolve().parent.parent / "docs"
    old = json.loads((docs / "SUBMITTED-ROOT-008a75b-SHA256.json").read_text())
    review = json.loads((docs / "REVIEW-6b317b6-SHA256.json").read_text())
    if args.verify_host:
        for prefix, manifest in ((ARCHIVE_PATH, old), (REVIEW_PATH, review)):
            for entry in entries(manifest):
                fetch(args.root + prefix + "/", entry)
        print(json.dumps({"snapshots_verified": [OLD, REVIEW]}))
    else:
        if not args.output:
            parser.error("--output is required for composition")
        print(json.dumps(retain(args.root, args.output, old, review)))


if __name__ == "__main__":
    main()
