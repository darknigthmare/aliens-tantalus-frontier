"""Synthetic-only regression fixtures; never game production art."""
import importlib.util
import sys
import unittest
import copy
import json
import tempfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location("v66_batch_normalizer", SCRIPTS / "process-v66-enemy-batch.py")
pipeline = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pipeline)
GRID = {"columns": 4, "rows": 2, "frameCount": 8}

def source_board(alpha=True, offset=0):
    board = Image.new("RGBA" if alpha else "RGB", (1024, 512), (0, 0, 0, 0) if alpha else (255, 0, 255))
    draw = ImageDraw.Draw(board)
    for index in range(8):
        x, y = (index % 4) * 256 + 70, (index // 4) * 256 + 80
        draw.rectangle((x, y, x + 45 + index, y + 90), fill=(45, 160, 55 + index + offset, 190) if alpha else (45, 160, 55 + index + offset))
    return board

class EnemyBatchNormalization(unittest.TestCase):
    def test_json_provenance_write_uses_canonical_lf_on_every_platform(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "proof.json"
            pipeline.json_write(path, {"proof": "sprite", "values": [1, 2]})
            encoded = path.read_bytes()
            self.assertTrue(encoded.endswith(b"\n"))
            self.assertNotIn(b"\r", encoded)
            self.assertEqual(encoded, (json.dumps({"proof": "sprite", "values": [1, 2]}, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))

    @staticmethod
    def physical_anchors(reports, lift=0):
        return [{"frame": report["clipFrame"], "anchor": [90, report["sourceBounds"][3] + lift],
                 "landmark": [90, 120], "reviewed": True, "confidence": "high", "evidence": "Synthetic visible body root fixture, not production art."}
                for report in reports]

    def test_native_alpha_and_purple_anatomy_are_preserved(self):
        source = source_board()
        ImageDraw.Draw(source).rectangle((80, 90, 90, 100), fill=(210, 30, 210, 128))
        frames, reports = pipeline.split_source(source, "idle", GRID)
        self.assertEqual(len(frames), 8)
        self.assertTrue(all(report["alphaProcessing"] == "native-alpha-preserved" for report in reports))
        self.assertTrue(any(np.array_equal(pixel, [210, 30, 210, 128]) for pixel in np.array(frames[0]).reshape(-1, 4)))
        self.assertTrue(all(report["discardedForegroundPixels"] == 0 for report in reports))

    def test_magenta_key_reuses_v65_border_connected_method(self):
        frames, reports = pipeline.split_source(source_board(False), "move", GRID)
        self.assertTrue(all(report["alphaProcessing"] == "v65-border-connected-magenta-key" for report in reports))
        self.assertTrue(all(report["mattePixels"] > 1000 for report in reports))
        self.assertTrue(all(frame.getchannel("A").getextrema()[0] == 0 for frame in frames))

    def test_white_background_and_overflow_rejected_by_default(self):
        with self.assertRaisesRegex(ValueError, "no proven magenta"):
            pipeline.split_source(Image.new("RGB", (1024, 512), "white"), "idle", GRID)
        source = source_board()
        ImageDraw.Draw(source).rectangle((0, 80, 100, 100), fill=(40, 120, 120, 255))
        with self.assertRaisesRegex(ValueError, "touches cell border"):
            pipeline.split_source(source, "idle", GRID)

    def test_enclosed_magenta_is_strict_opt_in_and_preserves_authored_colors(self):
        source = source_board(False)
        draw = ImageDraw.Draw(source)
        draw.rectangle((88, 108, 103, 123), fill=(255, 0, 255))
        colors = {(80, 90): (245, 108, 155), (82, 92): (45, 130, 245), (84, 94): (210, 30, 210)}
        for point, color in colors.items():
            draw.point(point, fill=color)
        original = np.array(source.convert("RGBA"))
        exterior, enclosed, proof = pipeline.source_matte_masks(original, False, True)
        self.assertEqual(proof["removedPixelCount"], 256)
        self.assertEqual(proof["referenceRgb"], [255, 0, 255])
        self.assertEqual(proof["recoloredPixels"], 0)
        self.assertEqual(proof["inpaintedPixels"], 0)
        for global_assignment in (False, True):
            before, before_reports = pipeline.split_source(source, "idle", GRID, global_assignment)
            after, after_reports = pipeline.split_source(source, "idle", GRID, global_assignment, True)
            self.assertEqual(before_reports[0]["sourceBounds"], after_reports[0]["sourceBounds"])
            x0, y0 = after_reports[0]["sourceBounds"][:2]
            before_pixels, after_pixels = np.array(before[0]), np.array(after[0])
            self.assertEqual(before_pixels[115 - y0, 95 - x0, 3], 255)
            self.assertEqual(after_pixels[115 - y0, 95 - x0, 3], 0)
            changed = np.any(before_pixels != after_pixels, axis=2)
            self.assertEqual(int(changed.sum()), 256)
            self.assertTrue(np.array_equal(before_pixels[~changed], after_pixels[~changed]))
            for (x, y), color in colors.items():
                self.assertEqual(after_pixels[y - y0, x - x0].tolist(), [*color, 255])
        self.assertFalse(pipeline.source_matte_masks(original, False, False)[1].any())
        self.assertEqual(pipeline.source_matte_proof(source, True), proof)

    def test_enclosed_option_never_keys_native_alpha_or_unproven_background(self):
        source = source_board(True)
        ImageDraw.Draw(source).rectangle((88, 108, 103, 123), fill=(255, 0, 255, 190))
        before, _ = pipeline.split_source(source, "idle", GRID)
        after, _ = pipeline.split_source(source, "idle", GRID, remove_enclosed_magenta_matte=True)
        self.assertTrue(all(np.array_equal(np.array(a), np.array(b)) for a, b in zip(before, after)))
        proof = pipeline.source_matte_proof(source, True)
        self.assertTrue(proof["requested"])
        self.assertFalse(proof["applied"])
        self.assertTrue(proof["nativeAlphaPreserved"])
        self.assertEqual(proof["removedPixelCount"], 0)
        with self.assertRaisesRegex(ValueError, "proven exterior magenta"):
            pipeline.source_matte_proof(Image.new("RGB", (1024, 512), "white"), True)

    def test_enclosed_matte_proof_binds_coordinates_colors_and_options(self):
        first = source_board(False)
        ImageDraw.Draw(first).rectangle((88, 108, 103, 123), fill=(255, 0, 255))
        second = source_board(False)
        ImageDraw.Draw(second).rectangle((89, 108, 104, 123), fill=(255, 0, 255))
        one, two = pipeline.source_matte_proof(first, True), pipeline.source_matte_proof(second, True)
        self.assertEqual(one["removedPixelCount"], two["removedPixelCount"])
        self.assertNotEqual(one["removedCoordinatesSha256"], two["removedCoordinatesSha256"])
        ImageDraw.Draw(second).rectangle((89, 108, 104, 123), fill=(250, 0, 250))
        recolored = pipeline.source_matte_proof(second, True)
        self.assertNotEqual(two["removedRgbaSha256"], recolored["removedRgbaSha256"])
        sources = [{"clip": "idle", "enclosedMagentaMatte": one}]
        summary = pipeline.matte_proof_summary(sources, True)
        self.assertEqual(summary["removedPixelCount"], 256)
        self.assertNotEqual(summary, pipeline.matte_proof_summary(sources, False))

    def test_cell_key_uses_the_same_full_source_reference_as_its_proof(self):
        pixels = np.array(source_board(False))
        for index in range(8):
            x, y = (index % 4) * 256, (index // 4) * 256
            cell = pixels[y:y + 256, x:x + 256]
            background = np.all(cell == [255, 0, 255], axis=2)
            cell[background] = [232 + index * 3, 0, 255]
            cell[108:124, 88:104] = [220, 0, 244]
        source = Image.fromarray(pixels, "RGB")
        proof = pipeline.source_matte_proof(source, True)
        self.assertEqual(proof["removedPixelCount"], 8 * 256)
        before, _ = pipeline.split_source(source, "idle", GRID)
        after, _ = pipeline.split_source(source, "idle", GRID, remove_enclosed_magenta_matte=True)
        changed = sum(int(np.any(np.array(a) != np.array(b), axis=2).sum()) for a, b in zip(before, after))
        self.assertEqual(changed, proof["removedPixelCount"])

    def test_aa_extension_is_two_source_pixels_only_and_preserves_other_colors(self):
        source = source_board(False)
        draw = ImageDraw.Draw(source)
        draw.rectangle((93, 111, 102, 120), fill=(110, 20, 110))
        draw.rectangle((94, 112, 101, 119), fill=(160, 20, 160))
        draw.rectangle((96, 114, 99, 117), fill=(255, 0, 255))
        draw.point((95, 113), fill=(245, 108, 155))
        draw.point((100, 118), fill=(45, 130, 245))
        draw.point((80, 90), fill=(160, 20, 160))
        raw = np.array(source.convert("RGBA"))
        _, core, core_proof = pipeline.source_matte_masks(raw, False, True, False)
        _, expanded, proof = pipeline.source_matte_masks(raw, False, True, True)
        self.assertEqual(core_proof["removedPixelCount"], 16)
        self.assertEqual(proof["strictCorePixelCount"], 16)
        self.assertEqual(proof["aaFringePixelCount"], 44)
        self.assertEqual(proof["removedPixelCount"], 60)
        self.assertFalse(expanded[113, 95])  # warm pink next to the core
        self.assertFalse(expanded[118, 100])  # blue next to the core
        self.assertFalse(expanded[90, 80])  # non-adjacent purple artwork
        self.assertFalse(expanded[111, 93])  # matching color, three pixels away
        self.assertTrue(expanded[112, 96])  # two-pixel vertical fringe
        self.assertFalse(expanded[112, 94])  # pink interrupts the diagonal propagation
        native = source.convert("RGBA")
        native.putpixel((0, 0), (0, 0, 0, 0))
        self.assertEqual(pipeline.source_matte_proof(native, True, True)["removedPixelCount"], 0)
        with self.assertRaisesRegex(ValueError, "requires the explicit strict"):
            pipeline.source_matte_masks(raw, False, False, True)
        with self.assertRaisesRegex(ValueError, "requires the explicit strict"):
            pipeline.split_source(source, "idle", GRID, remove_enclosed_magenta_aa_fringe=True)

    def test_all_clips_share_one_scale_and_dynamic_grid(self):
        frames, reports = [], []
        for ordinal, clip in enumerate(("sealed", "opening", "hatch", "destroyed")):
            local, local_reports = pipeline.split_source(source_board(offset=ordinal * 12), clip, GRID)
            frames.extend(local)
            reports.extend(local_reports)
        grid = {"columns": 4, "rows": 8, "cellWidth": 256, "cellHeight": 256, "guard": 16}
        atlas, placements = pipeline.normalize_frames(frames, reports, grid, {"x": 128, "y": 240})
        self.assertEqual(atlas.size, (1024, 2048))
        self.assertEqual(len({placement["scale"] for placement in placements}), 1)
        validation = pipeline.validate_atlas(atlas, grid)
        self.assertEqual(validation["uniqueFrameCount"], 32)
        self.assertFalse(validation["visualFidelityCertified"])
        self.assertEqual(validation["findings"], [])

    def test_duplicates_and_unsafe_paths_fail(self):
        frames, reports = pipeline.split_source(source_board(), "idle", GRID)
        grid = {"columns": 4, "rows": 2, "cellWidth": 256, "cellHeight": 256, "guard": 16}
        frames[1] = frames[0].copy()
        atlas, _ = pipeline.normalize_frames(frames, reports, grid, {"x": 128, "y": 240})
        with self.assertRaisesRegex(ValueError, "Duplicated authored"):
            pipeline.validate_atlas(atlas, grid)
        with self.assertRaisesRegex(ValueError, "escapes"):
            pipeline.scoped_path(SCRIPTS, "../../outside.png")

    def test_connected_short_spill_is_reassigned_without_pixel_loss(self):
        source = source_board()
        draw = ImageDraw.Draw(source)
        draw.line((326, 100, 252, 100), fill=(80, 180, 80, 190), width=3)
        with self.assertRaisesRegex(ValueError, "touches cell border"):
            pipeline.split_source(source, "idle", GRID)
        frames, reports = pipeline.split_source(source, "idle", GRID, allow_cell_reassignment=True)
        self.assertEqual(sum(report["foregroundPixels"] for report in reports), np.count_nonzero(np.array(source)[..., 3]))
        transfer = reports[1]["sourceOwnershipTransfers"][0]
        self.assertEqual(transfer["ownerCell"], 1)
        self.assertEqual(transfer["fromCells"], [0])
        self.assertEqual(transfer["pixels"], 12)
        self.assertTrue(transfer["pixelValuesPreserved"])
        self.assertEqual(frames[1].getchannel("A").getextrema()[1], 190)

    def test_connected_two_subjects_remain_ambiguous_and_rejected(self):
        source = source_board()
        ImageDraw.Draw(source).line((80, 100, 330, 100), fill=(45, 160, 55, 190), width=3)
        with self.assertRaisesRegex(ValueError, "ambiguous ownership"):
            pipeline.split_source(source, "idle", GRID, allow_cell_reassignment=True)

    def test_manual_clip_calibration_has_one_final_scale_and_no_auto_pose_resize(self):
        first, first_reports = pipeline.split_source(source_board(), "idle", GRID)
        second, second_reports = pipeline.split_source(source_board(offset=20), "death", GRID)
        grid = {"columns": 4, "rows": 4, "cellWidth": 256, "cellHeight": 256, "guard": 16}
        atlas, placements = pipeline.normalize_frames(first + second, first_reports + second_reports, grid, {"x": 128, "y": 240}, {"death": 0.5})
        self.assertEqual(len({placement["scale"] for placement in placements}), 1)
        self.assertTrue(all(placement["sourceScale"] == 1 for placement in placements[:8]))
        self.assertTrue(all(placement["sourceScale"] == 0.5 for placement in placements[8:]))
        self.assertEqual(placements[8]["appliedScale"], placements[0]["appliedScale"] / 2)
        self.assertEqual(atlas.size, (1024, 1024))
        with self.assertRaisesRegex(ValueError, "finite positive"):
            pipeline.normalize_frames(first, first_reports, {**grid, "rows": 2}, {"x": 128, "y": 240}, {"idle": float("nan")})
        with self.assertRaisesRegex(ValueError, "unknown clip"):
            pipeline.normalize_frames(first, first_reports, {**grid, "rows": 2}, {"x": 128, "y": 240}, {"jump": 2})

    def test_physical_root_does_not_follow_tail_or_claw_bounds(self):
        source = source_board()
        draw = ImageDraw.Draw(source)
        # Extend the first pose leftward without moving its visible body root.
        draw.line((72, 125, 20, 125), fill=(45, 160, 55, 190), width=3)
        frames, reports = pipeline.split_source(source, "idle", GRID)
        grid = {"columns": 4, "rows": 2, "cellWidth": 256, "cellHeight": 256, "guard": 16}
        anchors = self.physical_anchors(reports)
        atlas, placements = pipeline.normalize_frames(frames, reports, grid, {"x": 128, "y": 240}, source_anchors=anchors)
        self.assertEqual(len({placement["scale"] for placement in placements}), 1)
        for placement in placements:
            self.assertEqual(placement["anchorStatus"], "reviewed-physical-root")
            self.assertLessEqual(abs(placement["renderedAnchor"][0] - 128), 0.5)
            self.assertLessEqual(abs(placement["renderedAnchor"][1] - 240), 0.5)
        self.assertNotEqual(placements[0]["renderedBounds"][0], placements[1]["renderedBounds"][0])
        self.assertEqual(pipeline.validate_atlas(atlas, grid)["findings"], [])

    def test_airborne_anchor_below_pose_preserves_suspension(self):
        frames, reports = pipeline.split_source(source_board(), "move", GRID)
        anchors = self.physical_anchors(reports)
        anchors[3]["anchor"][1] += 24
        grid = {"columns": 4, "rows": 2, "cellWidth": 256, "cellHeight": 256, "guard": 16}
        _, placements = pipeline.normalize_frames(frames, reports, grid, {"x": 128, "y": 240}, source_anchors=anchors)
        self.assertLess(placements[3]["renderedBounds"][3], 240)
        self.assertEqual(placements[0]["renderedBounds"][3], 240)
        self.assertLessEqual(abs(placements[3]["renderedAnchor"][1] - 240), 0.5)

    def test_physical_root_uses_negative_spill_bounds_without_clamping(self):
        source = source_board()
        ImageDraw.Draw(source).line((326, 100, 252, 100), fill=(80, 180, 80, 190), width=3)
        frames, reports = pipeline.split_source(source, "idle", GRID, allow_cell_reassignment=True)
        anchors = self.physical_anchors(reports)
        grid = {"columns": 4, "rows": 2, "cellWidth": 256, "cellHeight": 256, "guard": 16}
        _, placements = pipeline.normalize_frames(frames, reports, grid, {"x": 128, "y": 240}, source_anchors=anchors)
        self.assertLess(reports[1]["sourceBounds"][0], 0)
        self.assertEqual(placements[1]["anchorOffsetInCroppedSource"][0], 90 - reports[1]["sourceBounds"][0])
        self.assertGreater(placements[1]["anchorOffsetInCroppedSource"][0], 90)

    def test_physical_root_calibration_has_one_final_scale(self):
        frames, reports = [], []
        for clip in ("idle", "attack"):
            local, local_reports = pipeline.split_source(source_board(offset=20 if clip == "attack" else 0), clip, GRID)
            frames.extend(local)
            reports.extend(local_reports)
        anchors = self.physical_anchors(reports)
        grid = {"columns": 4, "rows": 4, "cellWidth": 256, "cellHeight": 256, "guard": 16}
        _, placements = pipeline.normalize_frames(frames, reports, grid, {"x": 128, "y": 240}, {"attack": 1.5}, anchors)
        self.assertEqual(len({placement["scale"] for placement in placements}), 1)
        self.assertAlmostEqual(placements[8]["appliedScale"], placements[0]["appliedScale"] * 1.5, places=8)
        self.assertTrue(all(abs(placement["renderedAnchor"][0] - 128) <= 0.5 for placement in placements))

    def test_physical_root_invalid_coordinates_and_unfit_floor_fail(self):
        frames, reports = pipeline.split_source(source_board(), "idle", GRID)
        grid = {"columns": 4, "rows": 2, "cellWidth": 256, "cellHeight": 256, "guard": 16}
        for bad in ([float("nan"), 174], [90, float("inf")], [True, 174], [90]):
            anchors = self.physical_anchors(reports)
            anchors[0]["anchor"] = bad
            with self.assertRaisesRegex(ValueError, "finite source coordinates"):
                pipeline.normalize_frames(frames, reports, grid, {"x": 128, "y": 240}, source_anchors=anchors)
        anchors = self.physical_anchors(reports)
        with self.assertRaisesRegex(ValueError, "count"):
            pipeline.normalize_frames(frames, reports, grid, {"x": 128, "y": 240}, source_anchors=anchors[:7])
        anchors[0]["anchor"][1] = 100
        with self.assertRaisesRegex(ValueError, "no guarded space"):
            pipeline.normalize_frames(frames, reports, grid, {"x": 128, "y": 240}, source_anchors=anchors)

    def test_anchor_review_requires_all_individual_poses_and_source_hashes(self):
        _, reports = pipeline.split_source(source_board(), "idle", GRID)
        job = {"profileId": "fixture", "batchId": "batch-001"}
        sources = [{"clip": "idle", "sha256": "a" * 64, "size": [1024, 512]}]
        entry = {"status": "reviewed", "reviewer": "synthetic-fixture", "reviewedAt": "2026-08-31", "method": "visible root",
                 "clips": {"idle": {"sourceSha256": "a" * 64, "sourceSize": [1024, 512], "frames": self.physical_anchors(reports)}}}
        document = {"schema": 1, "coordinates": "nominal-source-cell", "batchId": "batch-001", "profiles": {"fixture": entry}}
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            path = root / pipeline.ANCHOR_REVIEW_PATH
            self.assertIsNone(pipeline.reviewed_source_anchors(job, reports, sources, root)[0])
            pipeline.json_write(path, document)
            anchors, proof = pipeline.reviewed_source_anchors(job, reports, sources, root)
            self.assertEqual(len(anchors), 8)
            self.assertEqual(proof["reviewedPoseCount"], 8)
            self.assertEqual(proof["sha256"], pipeline.hash_file(path))
            changed_sources = [{**sources[0], "sha256": "b" * 64}]
            with self.assertRaisesRegex(ValueError, "evidence changed"):
                pipeline.reviewed_source_anchors(job, reports, changed_sources, root)
            for wrong in ("missing", "duplicate", "unreviewed", "invalid-index"):
                damaged = copy.deepcopy(document)
                values = damaged["profiles"]["fixture"]["clips"]["idle"]["frames"]
                if wrong == "missing":
                    values.pop()
                elif wrong == "duplicate":
                    values[1]["frame"] = 0
                elif wrong == "invalid-index":
                    values[0]["frame"] = None
                else:
                    values[0]["reviewed"] = False
                pipeline.json_write(path, damaged)
                with self.assertRaises(ValueError):
                    pipeline.reviewed_source_anchors(job, reports, sources, root)
            pending = copy.deepcopy(document)
            pending["profiles"]["fixture"]["status"] = "pending"
            pipeline.json_write(path, pending)
            self.assertEqual(pipeline.reviewed_source_anchors(job, reports, sources, root)[1]["status"], "pending")

class EnemyBatchPostGenerationScaleCalibration(unittest.TestCase):
    """All assets below are disposable synthetic fixtures, never production art."""

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.job = {"profileId": "fixture", "name": "Synthetic fixture", "batchId": "batch-002",
                    "reference": {"status": "reviewed", "urls": []}, "referenceLockSha256": "a" * 64,
                    "animationFamily": "test", "sourceFacing": "right", "sourceGrid": copy.deepcopy(GRID),
                    "grid": {"columns": 4, "rows": 6, "cellWidth": 256, "cellHeight": 256, "guard": 16},
                    "pivot": {"x": 128, "y": 240}, "normalizedPath": "out/all.webp", "previewPath": "out/all.gif",
                    "metadataPath": "out/metadata.json", "clips": []}
        self.sources = []
        for index, clip in enumerate(("idle", "attack", "move")):
            source_path = f"sources/{clip}.png"
            path = self.root / source_path
            path.parent.mkdir(parents=True, exist_ok=True)
            source_board(offset=index * 20).save(path)
            self.job["clips"].append({"id": clip, "sourcePath": source_path, "promptSha256": str(index) * 64,
                                     "frames": list(range(index * 8, (index + 1) * 8)), "fps": 10, "loop": True,
                                     "normalizedPath": f"out/{clip}.webp", "previewPath": f"out/{clip}.gif"})
            self.sources.append({"clip": clip, "path": source_path, "size": [1024, 512], "sha256": pipeline.hash_file(path)})
        self.evidence_path = "proof/manual-measurements.txt"
        evidence = self.root / self.evidence_path
        evidence.parent.mkdir(parents=True)
        evidence.write_text("Synthetic endpoint comparison, explicitly reviewed.\n", encoding="utf-8")
        measurements = [{"clip": clip, "frame": frame, "endpoints": [[70, 100], [70 + length, 100]],
                         "lengthPx": length, "landmark": "rigid-synthetic-segment", "note": "Synthetic comparable endpoint fixture."}
                        for clip, length in (("idle", 40), ("attack", 20)) for frame in (0, 1)]
        self.entry = {"status": "reviewed", "reviewer": "synthetic-test", "reviewedAt": "2026-08-31", "note": "Manually compared rigid synthetic segments.",
                      "baselineClip": "idle", "sourceScaleByClip": {"idle": 1, "attack": 2, "move": 1},
                      "sourceSha256ByClip": {source["clip"]: source["sha256"] for source in self.sources},
                      "measurements": measurements, "evidencePaths": [self.evidence_path]}
        self.document = {"schema": 1, "batchId": "batch-002", "coordinates": "nominal-source-cell", "profiles": {"fixture": self.entry}}
        self.review_path = self.root / pipeline.batch_scale_review_path(self.job)

    def write_review(self, document=None):
        pipeline.json_write(self.review_path, self.document if document is None else document)

    def resolve(self):
        return pipeline.reviewed_source_scale(self.job, self.sources, self.root)

    def check(self):
        return pipeline.check_profile(self.job, self.root)

    def test_absent_or_other_profile_review_preserves_legacy_metadata_exactly(self):
        self.job["batchId"] = "batch-001"
        self.review_path = self.root / pipeline.batch_scale_review_path(self.job)
        self.job["reference"]["sourceScaleByClip"] = {"attack": 0.5}
        self.job["reference"]["scaleCalibrationReview"] = {"note": "Legacy pilot invariant.", "reviewer": "fixture", "reviewedAt": "2026-08-31", "evidencePaths": [self.evidence_path]}
        original_job = copy.deepcopy(self.job)
        before = pipeline.process_profile(self.job, self.root)
        metadata_bytes = (self.root / self.job["metadataPath"]).read_bytes()
        atlas_hash = pipeline.hash_file(self.root / self.job["normalizedPath"])
        self.assertNotIn("postGenerationScaleReview", before)
        self.assertEqual(before["sourceScaleByClip"], {"idle": 1, "attack": 0.5, "move": 1})
        self.assertEqual(before["scaleCalibrationEvidence"], [{"path": self.evidence_path, "sha256": pipeline.hash_file(self.root / self.evidence_path)}])
        self.check()
        other = {**self.document, "batchId": "batch-001", "profiles": {"another-profile": self.entry}}
        self.write_review(other)
        self.assertIsNone(self.resolve())
        self.check()
        after = pipeline.process_profile(self.job, self.root)
        self.assertEqual(before, after)
        self.assertEqual(metadata_bytes, (self.root / self.job["metadataPath"]).read_bytes())
        self.assertEqual(atlas_hash, pipeline.hash_file(self.root / self.job["normalizedPath"]))
        self.assertEqual(original_job, self.job)

    def test_measured_two_times_correction_has_exact_proof_one_scale_and_no_mutation(self):
        self.write_review()
        original_job, original_sources = copy.deepcopy(self.job), copy.deepcopy(self.sources)
        proof = self.resolve()
        self.assertEqual(set(proof), {"path", "sha256", "status", "profileId", "reviewer", "reviewedAt", "coordinates", "baselineClip", "sourceScaleByClip", "sourceSha256ByClip", "measurementCount", "evidence"})
        self.assertEqual(proof["measurementCount"], 4)
        self.assertEqual(proof["sha256"], pipeline.hash_file(self.review_path))
        self.assertEqual(proof["evidence"], [{"path": self.evidence_path, "sha256": pipeline.hash_file(self.root / self.evidence_path)}])
        metadata = pipeline.process_profile(self.job, self.root)
        self.assertEqual(self.check(), metadata)
        self.assertEqual(metadata["postGenerationScaleReview"], proof)
        self.assertIsNone(metadata["scaleCalibrationReview"])
        self.assertEqual(metadata["scaleCalibrationEvidence"], [])
        self.assertEqual(len({placement["scale"] for placement in metadata["placements"]}), 1)
        for placement in metadata["placements"]:
            factor = 2 if placement["clip"] == "attack" else 1
            self.assertEqual(placement["sourceScale"], factor)
            self.assertAlmostEqual(placement["appliedScale"], placement["scale"] * factor, places=8)
            self.assertGreaterEqual(min(placement["renderedBounds"][:2]), 16)
            self.assertLessEqual(max(placement["renderedBounds"][2:]), 240)
        self.assertEqual(metadata["acceptanceStatus"], "pending-visual-review")
        self.assertFalse(metadata["runtimeIntegrated"])
        self.assertEqual(metadata["interpolatedFrames"], 0)
        self.assertEqual(self.job, original_job)
        self.assertEqual(self.sources, original_sources)
        for source in self.sources:
            self.assertEqual(source["sha256"], pipeline.hash_file(self.root / source["path"]))

    def test_check_rejects_changed_or_missing_review_and_evidence(self):
        self.write_review()
        pipeline.process_profile(self.job, self.root)
        for defect in ("missing-review", "review-note", "review-factor", "review-source-sha", "missing-evidence", "empty-evidence", "stale-evidence"):
            with self.subTest(defect=defect):
                self.write_review()
                evidence = self.root / self.evidence_path
                evidence.write_text("Synthetic endpoint comparison, explicitly reviewed.\n", encoding="utf-8")
                if defect == "missing-review":
                    self.review_path.unlink()
                elif defect.startswith("review-"):
                    document = copy.deepcopy(self.document)
                    entry = document["profiles"]["fixture"]
                    if defect == "review-note":
                        entry["note"] += " Changed."
                    elif defect == "review-factor":
                        entry["sourceScaleByClip"]["attack"] = 2.01
                    else:
                        entry["sourceSha256ByClip"]["attack"] = "f" * 64
                    self.write_review(document)
                elif defect == "missing-evidence":
                    evidence.unlink()
                else:
                    evidence.write_text("" if defect == "empty-evidence" else "Changed proof.", encoding="utf-8")
                with self.assertRaises((ValueError, FileNotFoundError)):
                    self.check()

    def test_check_rejects_forged_metadata_factors_proof_or_pose_placements(self):
        self.write_review()
        original = pipeline.process_profile(self.job, self.root)
        for defect in ("missing-proof", "proof-path", "proof-hash", "proof-extra-field", "proof-factor", "metadata-factor", "bool-factor", "bool-pose-factor", "legacy-evidence", "per-pose-factor", "pack-scale", "applied-scale", "clip-id", "clip-frame", "frame-index"):
            with self.subTest(defect=defect):
                damaged = copy.deepcopy(original)
                if defect == "missing-proof":
                    damaged.pop("postGenerationScaleReview")
                elif defect == "metadata-factor":
                    damaged["sourceScaleByClip"]["attack"] = 1
                elif defect == "bool-factor":
                    damaged["sourceScaleByClip"]["idle"] = True
                elif defect == "bool-pose-factor":
                    damaged["placements"][0]["sourceScale"] = True
                elif defect == "legacy-evidence":
                    damaged["scaleCalibrationEvidence"] = damaged["postGenerationScaleReview"]["evidence"]
                elif defect == "per-pose-factor":
                    damaged["placements"][8]["sourceScale"] = 1
                elif defect == "pack-scale":
                    damaged["scale"] = 0.3
                elif defect == "applied-scale":
                    damaged["placements"][8]["appliedScale"] = 0.3
                elif defect in ("clip-id", "clip-frame", "frame-index"):
                    key, value = {"clip-id": ("clip", "jump"), "clip-frame": ("clipFrame", 7), "frame-index": ("index", 99)}[defect]
                    damaged["placements"][0][key] = value
                else:
                    key, value = {"proof-path": ("path", "proof/wrong.json"), "proof-hash": ("sha256", "f" * 64),
                                  "proof-extra-field": ("automaticallyAccepted", True), "proof-factor": ("sourceScaleByClip", {"idle": 1, "attack": 1, "move": 1})}[defect]
                    damaged["postGenerationScaleReview"][key] = value
                pipeline.json_write(self.root / self.job["metadataPath"], damaged)
                with self.assertRaises(ValueError):
                    self.check()
        pipeline.json_write(self.root / self.job["metadataPath"], original)
        self.check()

    def test_resolver_rejects_invalid_factors_and_arbitrary_measured_ratios(self):
        for bad in (0, -1, 0.2499, 4.0001, float("nan"), float("inf"), -float("inf"), True, "2", [2] * 8, {"frame0": 2}, 1.5):
            with self.subTest(factor=bad):
                document = copy.deepcopy(self.document)
                document["profiles"]["fixture"]["sourceScaleByClip"]["attack"] = bad
                self.write_review(document)
                with self.assertRaises(ValueError):
                    self.resolve()
        for field in ("sourceScaleByClip", "sourceSha256ByClip"):
            for defect in ("missing", "extra"):
                with self.subTest(field=field, defect=defect):
                    document = copy.deepcopy(self.document)
                    values = document["profiles"]["fixture"][field]
                    if defect == "missing":
                        values.pop("move")
                    else:
                        values["jump"] = 1 if field == "sourceScaleByClip" else "a" * 64
                    self.write_review(document)
                    with self.assertRaises(ValueError):
                        self.resolve()

    def test_measurements_require_distinct_comparable_poses_and_bounded_endpoints(self):
        defects = ("missing-baseline", "one-baseline", "one-corrected", "duplicate", "unknown-clip", "bad-frame", "bool-frame", "fractional-frame",
                   "unmeasured-correction", "unpaired-unchanged", "different-landmark", "missing-note", "missing-endpoint", "outside", "nan-coordinate",
                   "bool-coordinate", "wrong-length", "zero-length", "bool-length", "nan-length", "inf-length", "missing-measurements")
        for defect in defects:
            with self.subTest(defect=defect):
                document = copy.deepcopy(self.document)
                entry = document["profiles"]["fixture"]
                values = entry["measurements"]
                if defect == "missing-baseline":
                    entry["measurements"] = values[2:]
                elif defect == "one-baseline":
                    values.pop(0)
                elif defect == "one-corrected":
                    values.pop()
                elif defect == "duplicate":
                    values[1]["frame"] = 0
                elif defect == "unknown-clip":
                    values[0]["clip"] = "jump"
                elif defect in ("bad-frame", "bool-frame", "fractional-frame"):
                    values[0]["frame"] = {"bad-frame": 8, "bool-frame": True, "fractional-frame": 0.5}[defect]
                elif defect == "unmeasured-correction":
                    entry["sourceScaleByClip"]["move"] = 2
                elif defect == "unpaired-unchanged":
                    values.append({**values[0], "clip": "move"})
                elif defect == "different-landmark":
                    values[2]["landmark"] = "bounding-box-tail"
                elif defect == "missing-note":
                    values[0]["note"] = " "
                elif defect == "missing-endpoint":
                    values[0]["endpoints"] = [[70, 100]]
                elif defect == "outside":
                    values[0]["endpoints"] = [[-50, 100], [-10, 100]]
                elif defect in ("nan-coordinate", "bool-coordinate"):
                    values[0]["endpoints"][0][0] = float("nan") if defect == "nan-coordinate" else True
                elif defect == "missing-measurements":
                    entry.pop("measurements")
                else:
                    values[0]["lengthPx"] = {"wrong-length": 42, "zero-length": 0, "bool-length": True, "nan-length": float("nan"), "inf-length": float("inf")}[defect]
                self.write_review(document)
                with self.assertRaises(ValueError):
                    self.resolve()

    def test_factor_limits_median_ratio_and_one_pixel_measurement_tolerance(self):
        for factor in (0.25, 4):
            document = copy.deepcopy(self.document)
            entry = document["profiles"]["fixture"]
            entry["sourceScaleByClip"]["attack"] = factor
            for measurement in entry["measurements"]:
                if measurement["clip"] == "attack":
                    length = 40 / factor
                    measurement["endpoints"] = [[70, 100], [70 + length, 100]]
                    measurement["lengthPx"] = length
            self.write_review(document)
            self.assertEqual(self.resolve()["sourceScaleByClip"]["attack"], factor)
        for factor, accepted in ((2.05, True), (2.07, False)):
            document = copy.deepcopy(self.document)
            document["profiles"]["fixture"]["sourceScaleByClip"]["attack"] = factor
            self.write_review(document)
            if accepted:
                self.resolve()
            else:
                with self.assertRaisesRegex(ValueError, "median ratio"):
                    self.resolve()
        # Declared measurements, not rounded crop bounds, drive the median.
        document = copy.deepcopy(self.document)
        for measurement in document["profiles"]["fixture"]["measurements"]:
            if measurement["clip"] == "idle":
                measurement["lengthPx"] = 41  # exactly +1px accepted
        document["profiles"]["fixture"]["sourceScaleByClip"]["attack"] = 2.05
        self.write_review(document)
        self.resolve()

    def test_sources_must_match_actual_bytes_paths_size_and_complete_order(self):
        self.write_review()
        originals = copy.deepcopy(self.sources)
        for defect in ("source-sha", "source-path", "source-size", "source-clip", "missing-source", "duplicate-source", "reordered"):
            with self.subTest(defect=defect):
                self.sources = copy.deepcopy(originals)
                if defect == "missing-source":
                    self.sources.pop()
                elif defect == "duplicate-source":
                    self.sources[1] = copy.deepcopy(self.sources[0])
                elif defect == "reordered":
                    self.sources.reverse()
                else:
                    key, value = {"source-sha": ("sha256", "f" * 64), "source-path": ("path", "sources/move.png"),
                                  "source-size": ("size", [2048, 1024]), "source-clip": ("clip", "jump")}[defect]
                    self.sources[0][key] = value
                with self.assertRaises(ValueError):
                    self.resolve()
        self.sources = originals
        path = self.root / self.sources[0]["path"]
        with Image.open(path) as source:
            changed = source.copy()
        changed.putpixel((80, 100), (90, 140, 80, 190))
        changed.save(path)
        with self.assertRaisesRegex(ValueError, "source evidence changed"):
            self.resolve()
        # Updating only claimed metadata hashes cannot bypass the reviewed SHA.
        self.sources[0]["sha256"] = pipeline.hash_file(path)
        with self.assertRaisesRegex(ValueError, "source evidence changed"):
            self.resolve()

    def test_odd_source_dimensions_use_python_ties_even_nominal_cells(self):
        for source in self.sources:
            path = self.root / source["path"]
            with Image.open(path) as original:
                resized = original.resize((1774, 887))
            resized.save(path)
            source["sha256"], source["size"] = pipeline.hash_file(path), [1774, 887]
            self.entry["sourceSha256ByClip"][source["clip"]] = source["sha256"]
        for index, measurement in enumerate(self.entry["measurements"]):
            measurement["frame"] = index % 2 + 1  # both columns have width443
            length = measurement["lengthPx"]
            measurement["endpoints"] = [[443 * 1.15 - length, 100], [443 * 1.15, 100]]
        self.write_review()
        self.resolve()
        self.entry["measurements"][0]["endpoints"][1][0] += 0.01
        self.write_review()
        with self.assertRaisesRegex(ValueError, "short-spill envelope"):
            self.resolve()

    def test_evidence_paths_are_portable_nonempty_unique_files(self):
        for value in ([], [self.evidence_path, self.evidence_path], [""], [None], ["../outside.txt"], ["proof/../manual.txt"],
                      ["/absolute.txt"], ["C:/outside.txt"], ["proof\\manual-measurements.txt"], ["proof/missing.txt"], ["proof"]):
            with self.subTest(paths=value):
                document = copy.deepcopy(self.document)
                document["profiles"]["fixture"]["evidencePaths"] = value
                self.write_review(document)
                with self.assertRaises(ValueError):
                    self.resolve()
        (self.root / self.evidence_path).write_bytes(b"")
        self.write_review()
        with self.assertRaisesRegex(ValueError, "missing or empty"):
            self.resolve()

    def test_present_malformed_review_never_silently_falls_back(self):
        for document in ([], {**self.document, "schema": True}, {**self.document, "schema": 2}, {**self.document, "batchId": "batch-003"},
                         {**self.document, "coordinates": "crop"}, {**self.document, "profiles": []}, {**self.document, "profiles": {"fixture": None}},
                         {"schema": 2, "profiles": {}}):
            with self.subTest(document=document):
                self.write_review(document)
                with self.assertRaises(ValueError):
                    self.resolve()
        self.review_path.write_text("{invalid-json", encoding="utf-8")
        with self.assertRaises(ValueError):
            self.resolve()
        self.review_path.unlink()
        self.review_path.mkdir()
        with self.assertRaises(ValueError):
            self.resolve()

    def test_legacy_and_post_generation_calibrations_never_have_silent_priority(self):
        self.write_review()
        for field, value in (("sourceScaleByClip", {"attack": 0.5}), ("scaleCalibrationReview", {"note": "legacy"}),
                             ("scaleCalibrationReview", {}), ("scaleCalibrationReview", False), ("scaleCalibrationReview", "")):
            self.job["reference"] = {"status": "reviewed", "urls": [], field: value}
            with self.assertRaisesRegex(ValueError, "conflict"):
                self.resolve()

    def test_old_pixels_cannot_claim_a_new_measured_calibration(self):
        baseline = pipeline.process_profile(self.job, self.root)
        old_atlas = (self.root / self.job["normalizedPath"]).read_bytes()
        self.write_review()
        calibrated = pipeline.process_profile(self.job, self.root)
        self.assertNotEqual(baseline["normalizedSha256"], calibrated["normalizedSha256"])
        (self.root / self.job["normalizedPath"]).write_bytes(old_atlas)
        calibrated["normalizedSha256"] = baseline["normalizedSha256"]
        calibrated["validation"] = baseline["validation"]
        pipeline.json_write(self.root / self.job["metadataPath"], calibrated)
        with self.assertRaisesRegex(ValueError, "Atlas pixels do not apply"):
            self.check()

    def test_review_requires_explicit_identity_valid_date_and_idle_baseline(self):
        defects = {"status": "pending", "profileId": "someone-else", "reviewer": " ", "reviewedAt": "2026-02-30", "note": "", "baselineClip": "attack"}
        for key, value in defects.items():
            with self.subTest(key=key):
                document = copy.deepcopy(self.document)
                document["profiles"]["fixture"][key] = value
                self.write_review(document)
                with self.assertRaises(ValueError):
                    self.resolve()
        for bad in ("20260831", "2026-8-31", "2026-08-31T00:00:00Z", None, 20260831):
            document = copy.deepcopy(self.document)
            document["profiles"]["fixture"]["reviewedAt"] = bad
            self.write_review(document)
            with self.assertRaises(ValueError):
                self.resolve()
        self.entry["sourceScaleByClip"]["idle"] = 1.01
        self.write_review()
        with self.assertRaisesRegex(ValueError, "idle baseline"):
            self.resolve()


if __name__ == "__main__":
    unittest.main()
