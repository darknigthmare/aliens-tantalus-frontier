"""Synthetic fixtures for diagnostics only; no game assets generated here."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest

from PIL import Image, ImageDraw

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location("v66_source_audit", SCRIPTS / "audit-v66-batch-sources.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
pipeline = audit._pipeline


def board(background="alpha", duplicate=False):
    source = Image.new("RGBA" if background == "alpha" else "RGB", (512, 256), (0, 0, 0, 0) if background == "alpha" else (255, 0, 255))
    draw = ImageDraw.Draw(source)
    for index in range(8):
        x, y = index % 4 * 128 + 40, index // 4 * 128 + 30
        draw.rectangle((x, y, x + 25, y + 60), fill=(30, 140, 70 if duplicate else 70 + index, 255))
    return source


class SourceAuditTests(unittest.TestCase):
    def test_native_alpha_and_magenta_are_candidates_not_acceptance(self):
        for background, expected in (("alpha", "native-alpha"), ("magenta", "opaque-magenta")):
            source = board(background)
            original = source.tobytes()
            result = audit.audit_image(source, "idle")
            self.assertEqual(source.tobytes(), original)
            self.assertEqual(result["matte"]["kind"], expected)
            self.assertEqual(result["grid"]["distinctCellHashes"], 8)
            self.assertEqual(result["normalizer"]["defaultExtraction"], "pass")
            self.assertFalse(result["accepted"])
            self.assertFalse(result["runtimeIntegrated"])
            self.assertFalse(result["canonExact"])
            self.assertFalse(result["grid"]["subjectCountVisuallyVerified"])

    def test_wrong_aspect_is_explicit_even_with_eight_nominal_partitions(self):
        result = audit.audit_image(board().resize((512, 300)), "idle")
        self.assertIn("source-aspect-not-exactly-2-to-1", result["findings"])
        self.assertEqual(result["normalizer"]["defaultExtraction"], "blocked")
        self.assertEqual(len(result["cells"]), 8)

    def test_duplicate_cells_are_flagged(self):
        result = audit.audit_image(board(duplicate=True), "idle")
        self.assertEqual(result["grid"]["distinctCellHashes"], 1)
        self.assertIn("duplicate-nominal-cell-pixels", result["findings"])

    def test_checkerboard_is_suspected_not_silently_keyed(self):
        source = Image.new("RGB", (512, 256), (200, 200, 200))
        draw = ImageDraw.Draw(source)
        for y in range(0, 256, 16):
            for x in range(0, 512, 16):
                if (x // 16 + y // 16) % 2:
                    draw.rectangle((x, y, x + 15, y + 15), fill=(160, 160, 160))
        original = source.tobytes()
        result = audit.audit_image(source, "idle")
        self.assertEqual(result["matte"]["kind"], "opaque-checkerboard-candidate")
        self.assertEqual(result["normalizer"]["defaultExtraction"], "blocked")
        self.assertTrue(all(cell["borderContactPixelClues"] is None for cell in result["cells"]))
        self.assertEqual(original, source.tobytes())

    def test_cell_border_contact_is_diagnostic_and_blocks_default_extraction(self):
        source = board()
        ImageDraw.Draw(source).rectangle((125, 60, 140, 70), fill=(30, 140, 70, 255))
        result = audit.audit_image(source, "attack")
        self.assertEqual(result["borderContactFrames"], [0, 1])
        self.assertEqual(result["normalizer"]["defaultExtraction"], "blocked")
        self.assertIn("nominal-cell-border-contact-needs-ownership-review", result["findings"])

    def test_short_spill_probe_never_modifies_source_or_accepts_output(self):
        source = board()
        ImageDraw.Draw(source).rectangle((60, 60, 132, 65), fill=(30, 140, 70, 255))
        original = source.tobytes()
        result = audit.audit_image(source, "attack", probe_safe_reassignment=True)
        self.assertEqual(result["normalizer"]["defaultExtraction"], "blocked")
        probe = result["safeReassignmentProbe"]
        self.assertEqual(probe["status"], "proven-short-spill-extraction-pass")
        self.assertEqual(probe["extractedFrames"], 8)
        self.assertEqual(probe["sourcesModified"], 0)
        self.assertEqual(probe["outputsNormalized"], 0)
        self.assertFalse(probe["accepted"])
        self.assertEqual(original, source.tobytes())
        ImageDraw.Draw(source).rectangle((125, 90, 140, 100), fill=(30, 140, 70, 255))
        ambiguous = audit.audit_image(source, "attack", probe_safe_reassignment=True)
        self.assertEqual(ambiguous["safeReassignmentProbe"]["status"], "blocked")

    def test_batch_report_accounts_for_missing_inputs_and_preserves_source_file(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source_path = root / "sources/fixture/idle.png"
            source_path.parent.mkdir(parents=True)
            board().save(source_path)
            original = hashlib.sha256(source_path.read_bytes()).hexdigest()
            queue = {"jobs": [{"batchId": "batch-002", "profileId": "fixture", "clips": [
                {"id": "idle", "sourcePath": "sources/fixture/idle.png"}, {"id": "move", "sourcePath": "sources/fixture/move.png"}]}]}
            result = audit.audit_batch(queue, "batch-002", root, "previews")
            self.assertEqual(result["summary"]["requiredBoards"], 2)
            self.assertEqual(result["summary"]["presentBoards"], 1)
            self.assertEqual(result["summary"]["missingBoards"], 1)
            self.assertEqual(result["acceptedAutomatically"], 0)
            self.assertEqual(result["sourcePixelsModified"], 0)
            self.assertEqual(original, hashlib.sha256(source_path.read_bytes()).hexdigest())
            self.assertEqual(result["sources"][0]["sourceSha256"], original)
            self.assertTrue((root / "previews/fixture/idle.jpg").is_file())
            self.assertEqual(result["sources"][1]["status"], "missing-source")

    def test_anchor_paths_are_batch_specific_and_pilot_path_is_unchanged(self):
        self.assertEqual(pipeline.batch_anchor_review_path({"batchId": "batch-001"}), pipeline.ANCHOR_REVIEW_PATH)
        self.assertEqual(pipeline.batch_anchor_review_path({"batchId": "batch-002"}), "docs/references/V66_BATCH_002_ANCHOR_REVIEW.json")
        self.assertEqual(pipeline.batch_anchor_review_path({"batchId": "batch-030"}), "docs/references/V66_BATCH_030_ANCHOR_REVIEW.json")
        for value in (None, "", "batch-000", "batch-1", "../batch-002", "batch-002/extra", "batch-abc", 2):
            with self.assertRaises(ValueError):
                pipeline.batch_anchor_review_path({"batchId": value})

    def test_reviewed_batch_two_uses_its_own_valid_physical_roots(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            _, reports = pipeline.split_source(board(), "idle", audit.GRID)
            sources = [{"clip": "idle", "sha256": "a" * 64, "size": [512, 256]}]
            frames = [{"frame": index, "anchor": [50, 94], "landmark": [50, 50], "reviewed": True,
                       "confidence": "high", "evidence": "Synthetic fixture, not game art."} for index in range(8)]
            entry = {"status": "reviewed", "reviewer": "synthetic-fixture", "reviewedAt": "2026-08-31", "method": "fixture coordinates",
                     "clips": {"idle": {"sourceSha256": "a" * 64, "sourceSize": [512, 256], "frames": frames}}}
            job = {"batchId": "batch-002", "profileId": "fixture"}
            document = {"schema": 1, "coordinates": "nominal-source-cell", "batchId": "batch-002", "profiles": {"fixture": entry}}
            pipeline.json_write(root / pipeline.batch_anchor_review_path(job), document)
            anchors, proof = pipeline.reviewed_source_anchors(job, reports, sources, root)
            self.assertEqual(len(anchors), 8)
            self.assertEqual(proof["status"], "reviewed")
            self.assertEqual(proof["path"], "docs/references/V66_BATCH_002_ANCHOR_REVIEW.json")
            self.assertFalse((root / pipeline.ANCHOR_REVIEW_PATH).exists())

    def test_batch_two_does_not_consume_pilot_review_and_document_must_match_batch(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            job = {"batchId": "batch-002", "profileId": "fixture"}
            document = {"schema": 1, "coordinates": "nominal-source-cell", "batchId": "batch-001", "profiles": {}}
            pipeline.json_write(root / pipeline.ANCHOR_REVIEW_PATH, document)
            anchors, proof = pipeline.reviewed_source_anchors(job, [], [], root)
            self.assertIsNone(anchors)
            self.assertNotIn("path", proof)
            path = root / pipeline.batch_anchor_review_path(job)
            pipeline.json_write(path, document)
            anchors, proof = pipeline.reviewed_source_anchors(job, [], [], root)
            self.assertIsNone(anchors)
            self.assertEqual(proof["path"], "docs/references/V66_BATCH_002_ANCHOR_REVIEW.json")
            self.assertEqual(proof["status"], "pending")


if __name__ == "__main__":
    unittest.main()
