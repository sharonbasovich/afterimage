"""Compose a pinned review subtree without rebuilding the submitted Pages root."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import shutil
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

CANDIDATE = "6b317b62a7751a2bf79d5c0a19990121f23d7b00"
REVIEW_PATH = f"review/{CANDIDATE}"


def relative(name):
    if not name or "\\" in name or any(p in ("", ".", "..") for p in name.split("/")):
        raise ValueError(f"Unsafe path: {name!r}")
    path = PurePosixPath(name)
    if path.is_absolute() or ":" in name or any(ord(c) < 32 for c in name):
        raise ValueError(f"Unsafe path: {name!r}")
    return path


def entries(manifest):
    files = manifest["files"]
    names = [str(relative(f["path"])) for f in files]
    if len(set(names)) != len(names) or any(n == "review" or n.startswith("review/") for n in names):
        raise ValueError("Duplicate path or existing review namespace")
    if "index.html" not in names or "deployment.json" not in names:
        raise ValueError("Incomplete submitted-root manifest")
    return files


def check(data, entry):
    if len(data) != entry["bytes"] or hashlib.sha256(data).hexdigest() != entry["sha256"]:
        raise ValueError(f"Submitted root hash mismatch: {entry['path']}")


def fetch(root, entry):
    # Pages' build-control file is retained from the authenticated artifact's
    # manifest; it is not a public route. Only its known empty content is allowed.
    if entry["path"] == ".nojekyll":
        data = b""
    else:
        request = Request(root + quote(entry["path"], safe="/"), headers={"Accept-Encoding": "identity", "Cache-Control": "no-cache"})
        with urlopen(request, timeout=90) as response:
            if response.geturl() != request.full_url:
                raise ValueError("Unexpected root-file redirect")
            data = response.read(entry["bytes"] + 1)
    check(data, entry)
    return data


def verify_host(root, manifest):
    for entry in entries(manifest):
        fetch(root, entry)
    return {"root_commit": manifest["root_commit"], "files_verified": len(manifest["files"]), "public_files_verified": len(manifest["files"]) - 1, "unchanged": True}


def verify_disk(output, manifest):
    expected = {entry["path"] for entry in entries(manifest)}
    actual = set()
    for path in output.rglob("*"):
        if path.is_symlink():
            raise ValueError("Symlinks are forbidden")
        if path.is_file():
            name = path.relative_to(output).as_posix()
            if not name.startswith(REVIEW_PATH + "/"):
                actual.add(name)
    if actual != expected:
        raise ValueError("Composed root file set differs from submitted artifact")
    for entry in entries(manifest):
        check((output / entry["path"]).read_bytes(), entry)


def compose(root, manifest, candidate, output):
    if output.exists():
        raise ValueError("Output must be a new directory; refusing to overwrite")
    source_files = list(candidate.rglob("*"))
    if not (candidate / "index.html").is_file() or any(p.is_symlink() for p in source_files):
        raise ValueError("Missing candidate index or unsupported symlink")
    output.mkdir(parents=True)
    for entry in entries(manifest):
        data = fetch(root, entry)
        path = output / entry["path"]
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    target = output / REVIEW_PATH
    shutil.copytree(candidate, target)
    identity = {"commit": CANDIDATE, "mode": "hosted-review-candidate", "submitted_root_commit": manifest["root_commit"], "review_path": REVIEW_PATH}
    (target / "deployment.json").write_text(json.dumps(identity) + "\n", encoding="utf-8")
    (target / "root-preservation.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    verify_disk(output, manifest)
    return {**identity, "root_files_preserved": len(manifest["files"])}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--candidate", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--verify-host", action="store_true")
    args = parser.parse_args()
    url = urlsplit(args.root)
    if url.scheme not in ("http", "https") or not args.root.endswith("/") or url.query or url.fragment:
        raise ValueError("Root must be an HTTP(S) directory URL without query/fragment")
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    result = verify_host(args.root, manifest) if args.verify_host else compose(args.root, manifest, args.candidate, args.output)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
