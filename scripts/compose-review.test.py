import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("compose_review", Path(__file__).with_name("compose-review.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PreservationTests(unittest.TestCase):
    def setUp(self):
        self.data = {"index.html": b"submitted index", "deployment.json": b'{"commit":"old"}', ".nojekyll": b""}
        self.manifest = {"root_commit": "old", "files": [{"path": p, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()} for p, b in self.data.items()]}

    def test_composition_preserves_exact_root_and_isolates_candidate(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            candidate = root / "candidate"
            candidate.mkdir()
            (candidate / "index.html").write_text("review index")
            output = root / "output"
            with patch.object(module, "fetch", side_effect=lambda _, e: self.data[e["path"]]):
                module.compose("https://example.test/", self.manifest, candidate, output)
            module.verify_disk(output, self.manifest)
            self.assertEqual((output / "index.html").read_bytes(), b"submitted index")
            self.assertEqual(json.loads((output / module.REVIEW_PATH / "deployment.json").read_text())["commit"], module.CANDIDATE)
            (output / "index.html").write_text("changed")
            with self.assertRaisesRegex(ValueError, "hash mismatch"):
                module.verify_disk(output, self.manifest)

    def test_rejects_unexpected_root_file(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for name, data in self.data.items():
                (root / name).write_bytes(data)
            (root / "unexpected.txt").write_text("extra root file")
            with self.assertRaisesRegex(ValueError, "file set"):
                module.verify_disk(root, self.manifest)

    def test_hash_checks_fail_closed(self):
        for changed in (b"submitted indeX", b"submitted index plus extra"):
            with self.assertRaisesRegex(ValueError, "hash mismatch"):
                module.check(changed, self.manifest["files"][0])

    def test_rejects_traversal_duplicate_and_namespace_collision(self):
        for name in ("../secret", "/absolute", "C:/secret", "a\\b", "a//b", "./index.html"):
            with self.assertRaises(ValueError):
                module.relative(name)
        for name in ("review/old/index.html", "index.html"):
            fixture = {**self.manifest, "files": self.manifest["files"] + [{"path": name}]}
            with self.assertRaises(ValueError):
                module.entries(fixture)


if __name__ == "__main__":
    unittest.main()
