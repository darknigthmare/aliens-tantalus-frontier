"""Synthetic regression fixtures only; no game image or production state writes."""
import copy
import json
from pathlib import Path
import subprocess
import sys
import unittest

import test_enemy_batch_normalizer_v66 as fixtures

pipeline = fixtures.pipeline


class StandaloneReviewTests(unittest.TestCase):
    def setUp(self):
        fixtures.EnemyBatchPostGenerationScaleCalibration.setUp(self)
        self.anchor_path = "proof/fixture-anchors.json"
        self.scale_path = "proof/fixture-scales.json"
        self.anchor_evidence = "proof/physical.txt"
        (self.root / self.anchor_evidence).write_text("Synthetic anchor overlay evidence.\n", encoding="utf-8")
        clips = {}
        for source in self.sources:
            with fixtures.Image.open(self.root / source["path"]) as image:
                _, reports = pipeline.split_source(image, source["clip"], self.job["sourceGrid"])
            clips[source["clip"]] = {
                "sourceSha256": source["sha256"], "sourceSize": source["size"],
                "frames": fixtures.EnemyBatchNormalization.physical_anchors(reports)
            }
        self.anchors = {
            "schema": 1, "batchId": self.job["batchId"], "coordinates": "nominal-source-cell",
            "profiles": {self.job["profileId"]: {
                "status": "reviewed", "reviewer": "synthetic-test", "reviewedAt": "2026-09-05",
                "method": "Synthetic complete physical support test fixture.",
                "evidencePaths": [self.anchor_evidence], "clips": clips
            }}
        }
        pipeline.json_write(self.root / self.anchor_path, self.anchors)
        pipeline.json_write(self.root / self.scale_path, self.document)

    def process(self):
        return pipeline.process_profile(self.job, self.root, anchor_review=self.anchor_path, scale_review=self.scale_path)

    def check(self, **options):
        return pipeline.check_profile(self.job, self.root, **options)

    def test_standalone_proofs_roundtrip_without_modifying_job_or_shared_reviews(self):
        original_job = copy.deepcopy(self.job)
        shared_anchor = self.root / pipeline.batch_anchor_review_path(self.job)
        shared_scale = self.root / pipeline.batch_scale_review_path(self.job)
        pipeline.json_write(shared_anchor, {"unrelated": "deliberately invalid global ignored"})
        pipeline.json_write(shared_scale, {"unrelated": "deliberately invalid global ignored"})
        protected = {path: path.read_bytes() for path in (shared_anchor, shared_scale)}
        metadata = self.process()
        self.assertEqual(metadata["normalizationReviewPaths"], {"anchor": self.anchor_path, "scale": self.scale_path})
        self.assertEqual(self.check(), metadata)
        self.assertEqual(self.check(anchor_review=self.anchor_path, scale_review=self.scale_path), metadata)
        self.assertEqual(metadata["physicalAnchorReview"]["reviewedPoseCount"], 24)
        self.assertEqual(metadata["physicalAnchorReview"]["evidence"], [{"path": self.anchor_evidence, "sha256": pipeline.hash_file(self.root / self.anchor_evidence)}])
        self.assertEqual(metadata["postGenerationScaleReview"]["path"], self.scale_path)
        self.assertEqual(self.job, original_job)
        for path, encoded in protected.items():
            self.assertEqual(path.read_bytes(), encoded)
        # Unrelated global review changes cannot invalidate a per-profile atlas.
        pipeline.json_write(shared_anchor, {"changed": True})
        pipeline.json_write(shared_scale, {"changed": True})
        self.assertEqual(self.check(), metadata)
        self.assertFalse(metadata["runtimeIntegrated"])
        self.assertEqual(metadata["acceptanceStatus"], "pending-visual-review")

    def test_defaults_keep_the_existing_metadata_contract(self):
        metadata = pipeline.process_profile(self.job, self.root)
        self.assertNotIn("normalizationReviewPaths", metadata)
        self.assertNotIn("trimTransparentPadding", metadata["normalizationOptions"])
        self.assertTrue(all("transparentPaddingTrim" not in item for item in metadata["placements"]))
        self.assertEqual(pipeline.check_profile(self.job, self.root), metadata)
        with self.assertRaisesRegex(ValueError, "differs from recorded"):
            self.check(anchor_review=self.anchor_path)

    def test_check_cannot_silently_switch_or_remove_recorded_paths(self):
        metadata = self.process()
        with self.assertRaisesRegex(ValueError, "differs from recorded"):
            self.check(scale_review="proof/another.json")
        for forged in (None, [], {}, {"unknown": self.scale_path}, {"anchor": "../escape.json"}):
            with self.subTest(forged=forged):
                changed = copy.deepcopy(metadata)
                changed["normalizationReviewPaths"] = forged
                pipeline.json_write(self.root / self.job["metadataPath"], changed)
                with self.assertRaises((ValueError, FileNotFoundError)):
                    self.check()
        changed = copy.deepcopy(metadata)
        changed.pop("normalizationReviewPaths")
        pipeline.json_write(self.root / self.job["metadataPath"], changed)
        with self.assertRaisesRegex(ValueError, "review|evidence"):
            self.check()

    def test_paths_are_confined_and_require_existing_nonempty_json(self):
        bad = ["../outside.json", "proof/../fixture-anchors.json", "/absolute.json", "C:/absolute.json", "proof\\fixture-anchors.json", "https://example.com/review.json", "", "proof/physical.txt", self.job["metadataPath"], "proof/missing.json"]
        (self.root / "proof/empty.json").write_bytes(b"")
        bad.append("proof/empty.json")
        for value in bad:
            with self.subTest(path=value):
                with self.assertRaises((ValueError, FileNotFoundError)):
                    pipeline.standalone_review_paths(self.job, self.root, anchor_review=value)
        self.assertFalse((self.root / self.job["normalizedPath"]).exists())

    def test_identity_scope_pending_and_missing_physical_evidence_are_rejected(self):
        for defect in ("batch", "profile", "extra-profile", "pending", "empty-evidence", "missing-evidence", "bad-date", "boolean-schema"):
            with self.subTest(defect=defect):
                doc = copy.deepcopy(self.anchors)
                entry = doc["profiles"][self.job["profileId"]]
                if defect == "batch": doc["batchId"] = "batch-999"
                elif defect == "profile": doc["profiles"] = {"other": entry}
                elif defect == "extra-profile": doc["profiles"]["other"] = entry
                elif defect == "pending": entry["status"] = "pending"
                elif defect == "empty-evidence": entry["evidencePaths"] = []
                elif defect == "missing-evidence": entry["evidencePaths"] = ["proof/nonexistent.jpg"]
                elif defect == "bad-date": entry["reviewedAt"] = "2026-02-30"
                else: doc["schema"] = True
                pipeline.json_write(self.root / self.anchor_path, doc)
                with self.assertRaises(ValueError):
                    pipeline.standalone_review_paths(self.job, self.root, anchor_review=self.anchor_path)

    def test_stale_source_and_incomplete_pose_review_still_fail_before_writes(self):
        for defect in ("source", "missing-pose", "unreviewed-pose"):
            with self.subTest(defect=defect):
                doc = copy.deepcopy(self.anchors)
                idle = doc["profiles"][self.job["profileId"]]["clips"]["idle"]
                if defect == "source": idle["sourceSha256"] = "f" * 64
                elif defect == "missing-pose": idle["frames"].pop()
                else: idle["frames"][0]["reviewed"] = False
                pipeline.json_write(self.root / self.anchor_path, doc)
                with self.assertRaises(ValueError):
                    self.process()
                self.assertFalse((self.root / self.job["normalizedPath"]).exists())

    def test_all_artifact_proofs_are_bound_to_their_current_bytes(self):
        for kind, relative in (("anchor-overlay", self.anchor_evidence), ("scale-overlay", self.evidence_path), ("anchor-review", self.anchor_path), ("scale-review", self.scale_path)):
            with self.subTest(kind=kind):
                before = (self.root / relative).read_bytes()
                self.process()
                (self.root / relative).write_bytes(before + b"\n")
                with self.assertRaisesRegex(ValueError, "evidence|review"):
                    self.check()
                (self.root / relative).write_bytes(before)

    def test_cli_requires_profile_for_standalone_options(self):
        script = Path(__file__).resolve().parents[1] / "scripts/process-v66-enemy-batch.py"
        result = subprocess.run([sys.executable, str(script), "--batch", "batch-002", "--anchor-review", self.anchor_path, "--dry-run"], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("require --profile", result.stderr)

    def test_padding_trim_uses_exact_alpha_without_moving_physical_roots(self):
        frame = fixtures.Image.new("RGBA", (40, 50), (0, 0, 0, 0))
        fixtures.ImageDraw.Draw(frame).rectangle((3, 3, 36, 46), fill=(70, 140, 55, 255))
        frame.putpixel((1, 1), (20, 80, 10, 1))  # Faint authored pixels remain.
        report = {"clip": "idle", "clipFrame": 0, "sourceBounds": [60, 70, 100, 120], "alphaProcessing": "native-alpha-preserved"}
        frames = [frame.copy() for _ in range(8)]
        reports = [{**report, "clipFrame": index} for index in range(8)]
        anchors = [{"anchor": [80, 117], "landmark": [80, 95], "evidence": "Synthetic physical footplane.", "confidence": "high"} for _ in frames]
        grid = {"columns": 4, "rows": 2, "cellWidth": 256, "cellHeight": 256, "guard": 16}
        pivot = {"x": 128, "y": 240}
        before_reports = copy.deepcopy(reports)
        before_pixels = [item.tobytes() for item in frames]
        with self.assertRaisesRegex(ValueError, "no guarded space"):
            pipeline.normalize_frames(frames, reports, grid, pivot, source_anchors=anchors)
        atlas, placements = pipeline.normalize_frames(frames, reports, grid, pivot, source_anchors=anchors, trim_transparent_padding=True)
        for item in placements:
            self.assertEqual(item["sourceAnchor"], [80, 117])
            self.assertEqual(item["renderedAnchor"], [128, 240])
            self.assertEqual(item["sourceBounds"], [60, 70, 100, 120])
            self.assertEqual(item["transparentPaddingTrim"], {"method": "exact-zero-alpha-bbox-v1", "sourceBounds": [61, 71, 97, 117], "removedMargins": [1, 1, 3, 3], "removedVisiblePixelCount": 0})
        # The alpha=1 pixel was inside the retained crop, not discarded by a threshold.
        self.assertEqual(atlas.getpixel((109, 194)), (20, 80, 10, 1))
        self.assertEqual(reports, before_reports)
        self.assertEqual([item.tobytes() for item in frames], before_pixels)
        with self.assertRaisesRegex(ValueError, "reviewed physical roots"):
            pipeline.normalize_frames(frames, reports, grid, pivot, trim_transparent_padding=True)
        # Default and explicitFalse are identical for established padded-root callers.
        padded_anchors = [{**item, "anchor": [80, 120]} for item in anchors]
        legacy = pipeline.normalize_frames(frames, reports, grid, pivot, source_anchors=padded_anchors)
        explicit_false = pipeline.normalize_frames(frames, reports, grid, pivot, source_anchors=padded_anchors, trim_transparent_padding=False)
        self.assertEqual(legacy[0].tobytes(), explicit_false[0].tobytes())
        self.assertEqual(legacy[1], explicit_false[1])

    def test_egg_family_requires_sealed_baseline_and_other_families_keep_idle(self):
        self.job["animationFamily"] = "egg"
        next(clip for clip in self.job["clips"] if clip["id"] == "idle")["id"] = "sealed"
        next(source for source in self.sources if source["clip"] == "idle")["clip"] = "sealed"
        entry = self.document["profiles"][self.job["profileId"]]
        entry["baselineClip"] = "sealed"
        for key in ("sourceScaleByClip", "sourceSha256ByClip"):
            entry[key]["sealed"] = entry[key].pop("idle")
        for measurement in entry["measurements"]:
            if measurement["clip"] == "idle": measurement["clip"] = "sealed"
        anchors = self.anchors["profiles"][self.job["profileId"]]["clips"]
        anchors["sealed"] = anchors.pop("idle")
        pipeline.json_write(self.root / self.anchor_path, self.anchors)
        pipeline.json_write(self.root / self.scale_path, self.document)
        metadata = self.process()
        self.assertEqual(metadata["postGenerationScaleReview"]["baselineClip"], "sealed")
        self.assertEqual(metadata["sourceScaleByClip"]["sealed"], 1)
        self.assertEqual(self.check(), metadata)
        self.job["animationFamily"] = "quadruped"
        with self.assertRaisesRegex(ValueError, "baseline must be idle"):
            self.check()
        self.job["animationFamily"] = "egg"
        entry["sourceScaleByClip"]["sealed"] = 2
        pipeline.json_write(self.root / self.scale_path, self.document)
        with self.assertRaisesRegex(ValueError, "sealed baseline factor"):
            self.check()

    def test_padding_option_and_per_pose_proofs_are_replayed_not_silently_trusted(self):
        metadata = pipeline.process_profile(self.job, self.root, anchor_review=self.anchor_path, scale_review=self.scale_path, trim_transparent_padding=True)
        self.assertIs(metadata["normalizationOptions"]["trimTransparentPadding"], True)
        self.assertTrue(all(item["transparentPaddingTrim"]["removedVisiblePixelCount"] == 0 for item in metadata["placements"]))
        self.assertEqual(self.check(), metadata)
        self.assertEqual(self.check(trim_transparent_padding=True), metadata)
        with self.assertRaisesRegex(ValueError, "padding trim option"):
            self.check(trim_transparent_padding=False)
        for defect in ("removed-option", "invalid-option", "changed-proof", "missing-proof"):
            with self.subTest(defect=defect):
                forged = copy.deepcopy(metadata)
                if defect == "removed-option": forged["normalizationOptions"].pop("trimTransparentPadding")
                elif defect == "invalid-option": forged["normalizationOptions"]["trimTransparentPadding"] = 1
                elif defect == "changed-proof": forged["placements"][0]["transparentPaddingTrim"]["sourceBounds"][0] += 1
                else: forged["placements"][0].pop("transparentPaddingTrim")
                pipeline.json_write(self.root / self.job["metadataPath"], forged)
                with self.assertRaisesRegex(ValueError, "padding|placements"):
                    self.check()


if __name__ == "__main__":
    unittest.main()
