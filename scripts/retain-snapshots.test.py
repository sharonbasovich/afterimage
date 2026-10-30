import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location("retain", Path(__file__).with_name("retain-snapshots.py"))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def manifest(identity, files, key):
    return {key: identity, "files": [{"path": p, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()} for p, b in files.items()]}


class SnapshotTests(unittest.TestCase):
    def setUp(self):
        self.old_data = {"index.html": b"old", "deployment.json": json.dumps({"commit": m.OLD}).encode(), ".nojekyll": b""}
        self.review_data = {"index.html": b"review", "deployment.json": json.dumps({"commit": m.REVIEW}).encode()}
        self.old = manifest(m.OLD, self.old_data, "root_commit")
        self.review = manifest(m.REVIEW, self.review_data, "commit")

    def test_promotion_retains_both_exact_snapshots_and_new_root(self):
        with tempfile.TemporaryDirectory() as temp:
            out = Path(temp) / "dist"; out.mkdir()
            (out / "index.html").write_bytes(b"new root")
            def fetch(base, entry):
                data = (self.review_data if "/review/" in base else self.old_data)[entry["path"]]
                m.check(data, entry)
                return data
            with patch.object(m, "fetch", side_effect=fetch):
                m.retain("https://test/", out, self.old, self.review)
            self.assertEqual((out / "index.html").read_bytes(), b"new root")
            m.verify_disk(out / m.ARCHIVE_PATH, self.old)
            m.verify_disk(out / m.REVIEW_PATH, self.review)

    def test_bootstrap_only_on_404_and_exact_old_identity(self):
        def fetch(base, entry):
            if "/archive/" in base:
                raise HTTPError(base, 404, "absent", {}, None)
            return self.old_data[entry["path"]]
        with patch.object(m, "fetch", side_effect=fetch):
            self.assertEqual(m.old_source("https://test/", self.old), "https://test/")
        for error in [HTTPError("url", 403, "denied", {}, None), ValueError("hash mismatch")]:
            with patch.object(m, "fetch", side_effect=error) as mocked:
                with self.assertRaises(type(error)):
                    m.old_source("https://test/", self.old)
                self.assertEqual(mocked.call_count, 1)

    def test_no_namespace_is_published_when_download_fails(self):
        with tempfile.TemporaryDirectory() as temp:
            out = Path(temp); (out / "index.html").write_bytes(b"new")
            with patch.object(m, "fetch", side_effect=ValueError("hash mismatch")):
                with self.assertRaises(ValueError): m.retain("https://test/", out, self.old, self.review)
            self.assertFalse((out / "archive").exists())
            self.assertFalse((out / "review").exists())

    def test_rejects_existing_namespaces_and_symlinks(self):
        for name in ["review", "archive"]:
            with tempfile.TemporaryDirectory() as temp:
                out = Path(temp); (out / "index.html").write_bytes(b"new"); (out / name).mkdir()
                with self.assertRaises(ValueError): m.retain("https://test/", out, self.old, self.review)
        with tempfile.TemporaryDirectory() as temp:
            out = Path(temp); (out / "index.html").write_bytes(b"new"); (out / "link").symlink_to(out / "index.html")
            with self.assertRaises(ValueError): m.retain("https://test/", out, self.old, self.review)

    def test_rejects_unsafe_incomplete_duplicate_and_corrupt_manifests(self):
        for name in ["../escape", "/absolute", "a//b", "a\\b", "C:/secret", "a\n"]:
            with self.assertRaises(ValueError): m.relative(name)
        for files in [self.old["files"][:1], self.old["files"] + [self.old["files"][0]]]:
            with self.assertRaises(ValueError): m.entries({"files": files})
        with self.assertRaises(ValueError): m.check(b"altered", self.old["files"][0])


if __name__ == "__main__":
    unittest.main()
