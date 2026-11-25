#!/usr/bin/env python3
"""Regression tests for offline recovery; --real also reconstructs all originals."""
from __future__ import annotations
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

# Keep the source tree unchanged during the validation import.
sys.dont_write_bytecode = True

SCRIPT = Path(__file__).absolute().with_name("restore-mer-des-chagrins-archives.py")
spec = importlib.util.spec_from_file_location("mer_archive_restore", SCRIPT)
restore = importlib.util.module_from_spec(spec)
spec.loader.exec_module(restore)

def sha(data):
    return hashlib.sha256(data).hexdigest()

class RestoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mer-restore-test-")
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name) / "repo"
        self.root = self.repo / restore.ARCHIVE_ROOT
        self.output = Path(self.temp.name) / "restored"
        self.payload = b"part one\x00binary\n" + b"part two\xffend\n"
        self.note = b"historical note\n"
        contents = {
            "README.md": b"fixture\n",
            "INVENTAIRE.json": b"{}\n",
            "artifacts/archives/fixture.zip.part001": b"part one\x00binary\n",
            "artifacts/archives/fixture.zip.part002": b"part two\xffend\n",
            "artifacts/documents/note.txt": self.note,
        }
        members = []
        for name, data in contents.items():
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            members.append({"path": f"{restore.ARCHIVE_ROOT}/{name}",
                            "sizeBytes": len(data), "sha256": sha(data)})
        self.manifest = {
            "schemaVersion": 1, "root": restore.ARCHIVE_ROOT,
            "artifactCount": 2, "totalOriginalBytes": len(self.payload) + len(self.note),
            "files": members,
            "artifacts": [
                {"originalName": "fixture.zip", "sizeBytes": len(self.payload), "sha256": sha(self.payload),
                 "parts": [f"{restore.ARCHIVE_ROOT}/artifacts/archives/fixture.zip.part001",
                           f"{restore.ARCHIVE_ROOT}/artifacts/archives/fixture.zip.part002"]},
                {"originalName": "note.txt", "sizeBytes": len(self.note), "sha256": sha(self.note),
                 "parts": [f"{restore.ARCHIVE_ROOT}/artifacts/documents/note.txt"]},
            ],
        }
        self.write_manifest()

    def write_manifest(self):
        (self.root / "MANIFEST.json").write_text(json.dumps(self.manifest, indent=2) + "\n")

    def run_restore(self):
        return restore.run(self.repo, self.output)

    def test_cli_verify_only_does_not_create_output(self):
        result = subprocess.run([sys.executable, str(SCRIPT), "--repo-root", str(self.repo),
                                 "--verify-only", "--output", str(self.output)],
                                text=True, capture_output=True, timeout=15)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)["artifactsVerified"], 2)
        self.assertFalse(self.output.exists())

    def test_reconstructs_split_and_intact_payloads(self):
        result = self.run_restore()
        self.assertEqual(result["restored"], 2)
        self.assertEqual((self.output / "fixture.zip").read_bytes(), self.payload)
        self.assertEqual((self.output / "note.txt").read_bytes(), self.note)
        self.assertFalse(list(self.output.glob(".restore-mer-*")))

    def test_identical_existing_file_is_preserved(self):
        self.output.mkdir()
        target = self.output / "fixture.zip"
        target.write_bytes(self.payload)
        before = target.stat().st_mtime_ns
        unrelated = self.output / "unrelated.txt"
        unrelated.write_bytes(b"keep")
        result = self.run_restore()
        self.assertEqual((result["restored"], result["alreadyPresent"]), (1, 1))
        self.assertEqual(target.stat().st_mtime_ns, before)
        self.assertEqual(unrelated.read_bytes(), b"keep")

    def test_conflict_preflight_prevents_partial_restore(self):
        self.output.mkdir()
        (self.output / "note.txt").write_bytes(b"different")
        with self.assertRaisesRegex(restore.ArchiveError, "refusing overwrite"):
            self.run_restore()
        self.assertFalse((self.output / "fixture.zip").exists())
        self.assertEqual((self.output / "note.txt").read_bytes(), b"different")

    def test_corrupt_part_refused_before_writes(self):
        part = self.root / "artifacts/archives/fixture.zip.part001"
        part.write_bytes(b"X" + part.read_bytes()[1:])
        with self.assertRaisesRegex(restore.ArchiveError, "checksum mismatch"):
            self.run_restore()
        self.assertFalse(self.output.exists())

    def test_wrong_reconstructed_hash_is_refused(self):
        self.manifest["artifacts"][0]["sha256"] = "0" * 64
        self.write_manifest()
        with self.assertRaisesRegex(restore.ArchiveError, "Reconstructed checksum"):
            self.run_restore()
        self.assertFalse(self.output.exists())

    def test_part_order_is_validated(self):
        self.manifest["artifacts"][0]["parts"].reverse()
        self.write_manifest()
        with self.assertRaisesRegex(restore.ArchiveError, "part name or order"):
            self.run_restore()

    def test_extra_files_and_empty_directories_are_refused(self):
        extra = self.root / "unexpected.txt"
        extra.write_bytes(b"extra")
        with self.assertRaisesRegex(restore.ArchiveError, "inventory mismatch"):
            self.run_restore()
        extra.unlink()
        extra.mkdir()
        with self.assertRaisesRegex(restore.ArchiveError, "Unlisted directory"):
            self.run_restore()

    def test_missing_part_is_refused(self):
        (self.root / "artifacts/archives/fixture.zip.part002").unlink()
        with self.assertRaisesRegex(restore.ArchiveError, "inventory mismatch"):
            self.run_restore()

    def test_original_name_traversal_and_absolute_paths_are_refused(self):
        for value in ("../escaped.zip", "/tmp/escaped.zip", r"..\escaped.zip",
                      "C:escaped.zip", "CON", "alias."):
            with self.subTest(value=value):
                self.manifest["artifacts"][0]["originalName"] = value
                self.write_manifest()
                with self.assertRaises(restore.ArchiveError):
                    self.run_restore()
                self.assertFalse(self.output.exists())

    def test_member_path_traversal_and_aliases_are_refused(self):
        old = self.manifest["files"][0]["path"]
        for value in ("/outside", restore.ARCHIVE_ROOT + "/../../outside",
                      restore.ARCHIVE_ROOT + "//README.md", r"archives\outside",
                      restore.ARCHIVE_ROOT + "/./README.md"):
            with self.subTest(value=value):
                self.manifest["files"][0]["path"] = value
                self.write_manifest()
                with self.assertRaises(restore.ArchiveError):
                    self.run_restore()
        self.manifest["files"][0]["path"] = old

    def test_source_file_symlink_is_refused(self):
        part = self.root / "artifacts/archives/fixture.zip.part001"
        outside = Path(self.temp.name) / "outside"
        outside.write_bytes(part.read_bytes())
        part.unlink()
        part.symlink_to(outside)
        with self.assertRaisesRegex(restore.ArchiveError, "Symlink"):
            self.run_restore()

    def test_source_directory_symlink_is_refused(self):
        directory = self.root / "artifacts"
        outside = Path(self.temp.name) / "outside-artifacts"
        directory.rename(outside)
        directory.symlink_to(outside, target_is_directory=True)
        with self.assertRaisesRegex(restore.ArchiveError, "Symlink"):
            self.run_restore()

    def test_manifest_symlink_is_refused(self):
        path = self.root / "MANIFEST.json"
        outside = Path(self.temp.name) / "outside-manifest"
        path.rename(outside)
        path.symlink_to(outside)
        with self.assertRaisesRegex(restore.ArchiveError, "Symlink"):
            self.run_restore()

    def test_destination_parent_symlink_is_refused(self):
        outside = Path(self.temp.name) / "outside-output"
        outside.mkdir()
        self.output.symlink_to(outside, target_is_directory=True)
        with self.assertRaisesRegex(restore.ArchiveError, "Symlink"):
            self.run_restore()
        self.assertEqual(list(outside.iterdir()), [])

    def test_existing_destination_symlink_is_refused_even_if_identical(self):
        self.output.mkdir()
        outside = Path(self.temp.name) / "outside-payload"
        outside.write_bytes(self.payload)
        (self.output / "fixture.zip").symlink_to(outside)
        with self.assertRaisesRegex(restore.ArchiveError, "Symlink"):
            self.run_restore()
        self.assertEqual(outside.read_bytes(), self.payload)

    @unittest.skipUnless(hasattr(os, "mkfifo"), "FIFO is POSIX-specific")
    def test_existing_fifo_refused_without_opening_or_blocking(self):
        self.output.mkdir()
        os.mkfifo(self.output / "fixture.zip")
        with self.assertRaisesRegex(restore.ArchiveError, "Not a regular file"):
            self.run_restore()

    def test_source_changed_after_verification_leaves_no_partial_file(self):
        manifest, members = restore.verify_archive(self.repo)
        self.output.mkdir()
        part = self.root / "artifacts/archives/fixture.zip.part002"
        part.write_bytes(b"changed")
        with self.assertRaisesRegex(restore.ArchiveError, "Part checksum"):
            restore.restore_one(self.repo, self.output, manifest["artifacts"][0], members)
        self.assertEqual(list(self.output.iterdir()), [])

    def test_atomic_install_refuses_competing_writer(self):
        manifest, members = restore.verify_archive(self.repo)
        self.output.mkdir()
        actual_link = os.link
        def competing_link(source, target, **kwargs):
            Path(target).write_bytes(b"competitor")
            return actual_link(source, target, **kwargs)
        with mock.patch.object(restore.os, "link", side_effect=competing_link):
            with self.assertRaisesRegex(restore.ArchiveError, "refusing overwrite"):
                restore.restore_one(self.repo, self.output, manifest["artifacts"][0], members)
        self.assertEqual((self.output / "fixture.zip").read_bytes(), b"competitor")
        self.assertFalse(list(self.output.glob(".restore-mer-*")))

    def test_output_inside_source_is_refused(self):
        with self.assertRaisesRegex(restore.ArchiveError, "outside the archive"):
            restore.run(self.repo, self.root / "restored")
        self.assertFalse((self.root / "restored").exists())

    def test_duplicate_json_key_is_refused(self):
        path = self.root / "MANIFEST.json"
        path.write_text(path.read_text().replace('"schemaVersion": 1', '"schemaVersion": 1, "schemaVersion": 1'))
        with self.assertRaisesRegex(restore.ArchiveError, "Duplicate JSON key"):
            self.run_restore()

def reconstruct_real(repo):
    manifest, members = restore.verify_archive(repo)
    count, byte_count = 0, 0
    with tempfile.TemporaryDirectory(prefix="mer-real-reconstruction-") as temporary:
        output = Path(temporary)
        for artifact in manifest["artifacts"]:
            assert restore.restore_one(repo, output, artifact, members)
            path = output / artifact["originalName"]
            digest, size = hashlib.sha256(), 0
            with path.open("rb") as stream:
                for block in iter(lambda: stream.read(1024 * 1024), b""):
                    digest.update(block)
                    size += len(block)
            assert size == artifact["sizeBytes"], artifact["originalName"]
            assert digest.hexdigest() == artifact["sha256"], artifact["originalName"]
            count += 1
            byte_count += size
            # Only the newly reconstructed, checked test copy is removed.
            path.unlink()
        assert not list(output.iterdir())
    assert count == 59 and byte_count == 593192706, (count, byte_count)
    return {"realOriginalsReconstructed": count, "realBytesChecked": byte_count,
            "sourceOriginalsModified": False}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--real", action="store_true")
    parser.add_argument("--repo-root", type=Path, default=SCRIPT.parent.parent)
    args = parser.parse_args()
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(RestoreTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if not result.wasSuccessful():
        return 1
    summary = {"fixtureTestsPassed": result.testsRun, "fixtureTestsFailed": 0}
    if args.real:
        summary.update(reconstruct_real(args.repo_root))
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
