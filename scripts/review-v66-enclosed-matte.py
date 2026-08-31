"""Technical before/after evidence only; never writes source or runtime art."""
from __future__ import annotations
import hashlib
import argparse
import importlib.util
import json
from pathlib import Path
import sys
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
spec = importlib.util.spec_from_file_location("v66_matte_review", ROOT / "scripts/process-v66-enemy-batch.py")
pipeline = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pipeline)
OUT = ROOT / "docs/references/v66-enclosed-matte-review"

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--aa-fringe", action="store_true", help="Compare strict core alone with strict core plus bounded 2px AA")
    args = parser.parse_args()
    out = ROOT / "docs/references" / ("v66-enclosed-matte-aa-review" if args.aa_fringe else "v66-enclosed-matte-review")
    queue = json.loads((ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf-8"))
    out.mkdir(parents=True, exist_ok=True)
    result = {"schema": 1, "method": pipeline.ENCLOSED_MATTE_METHOD, "thresholds": pipeline.ENCLOSED_MATTE_THRESHOLDS,
              "aaFringe": args.aa_fringe, "aaThresholds": pipeline.ENCLOSED_AA_THRESHOLDS,
              "scope": "batch-001", "sourceWrites": 0, "runtimeAtlasWrites": 0, "profiles": []}
    for job in queue["jobs"]:
        if job["batchId"] != "batch-001":
            continue
        before_frames, after_frames, before_reports, after_reports, sources, chosen = [], [], [], [], [], []
        for clip in job["clips"]:
            path = ROOT / clip["sourcePath"]
            original_hash = pipeline.hash_file(path)
            with Image.open(path) as source:
                raw = np.array(source.convert("RGBA"), dtype=np.uint8)
                native = ("A" in source.getbands() or "transparency" in source.info) and raw[..., 3].min() < 255
                exterior, removed, proof = pipeline.source_matte_masks(raw, native, True, args.aa_fringe)
                before_removed = pipeline.source_matte_masks(raw, native, True, False)[1] if args.aa_fringe else np.zeros_like(removed)
                changed_mask = removed & ~before_removed
                before_raw = raw.copy(); before_raw[exterior | before_removed] = 0
                after_raw = before_raw.copy(); after_raw[removed] = 0
                changed = np.any(before_raw != after_raw, axis=2)
                assert np.array_equal(changed, changed_mask)
                assert np.array_equal(before_raw[~changed_mask], after_raw[~changed_mask])
                before, before_info = pipeline.split_source(source, clip["id"], job["sourceGrid"], True, args.aa_fringe, False)
                after, after_info = pipeline.split_source(source, clip["id"], job["sourceGrid"], True, True, args.aa_fringe)
                assert [p["sourceBounds"] for p in before_info] == [p["sourceBounds"] for p in after_info]
                pixel_counts = []
                for report in before_info:
                    x0, y0, x1, y1 = report["sourceCell"]
                    pixel_counts.append(int(changed_mask[y0:y1, x0:x1].sum()))
                selected = int(np.argmax(pixel_counts))
                chosen.append({"clip": clip["id"], "clipFrame": selected, "removedPixelsInNominalCell": pixel_counts[selected],
                               "atlasIndex": len(before_frames) + selected})
                sources.append({"clip": clip["id"], "path": clip["sourcePath"], "sha256": original_hash,
                                "size": list(source.size), "enclosedMagentaMatte": proof,
                                "unchangedOutsideRemovedMask": True, "removedByNominalCell": pixel_counts})
                before_frames.extend(before); after_frames.extend(after)
                before_reports.extend(before_info); after_reports.extend(after_info)
            assert pipeline.hash_file(path) == original_hash
        anchors, anchor_proof = pipeline.reviewed_source_anchors(job, after_reports, sources)
        calibration = job["reference"].get("sourceScaleByClip", {})
        before_atlas, before_placements = pipeline.normalize_frames(before_frames, before_reports, job["grid"], job["pivot"], calibration, anchors)
        after_atlas, after_placements = pipeline.normalize_frames(after_frames, after_reports, job["grid"], job["pivot"], calibration, anchors)
        assert [p["renderedBounds"] for p in before_placements] == [p["renderedBounds"] for p in after_placements]
        validation = pipeline.validate_atlas(after_atlas, job["grid"])
        before_cells, after_cells = pipeline.atlas_frames(before_atlas, job["grid"]), pipeline.atlas_frames(after_atlas, job["grid"])
        board = Image.new("RGB", (1056, 1184), (8, 14, 18))
        draw = ImageDraw.Draw(board)
        draw.text((12, 8), job["profileId"] + " | strict enclosed matte opt-in | technical diff", fill=(220, 230, 230))
        for ordinal, selected in enumerate(chosen):
            top = 32 + ordinal * 288
            index = selected["atlasIndex"]
            for column, (caption, frame) in enumerate((("BEFORE", before_cells[index]), ("AFTER", after_cells[index]))):
                tile = Image.new("RGBA", (256, 256), (8, 14, 18, 255)); tile.alpha_composite(frame)
                board.paste(tile.convert("RGB"), (16 + column * 352, top + 20))
                draw.text((16 + column * 352, top), caption + " " + selected["clip"] + " F" + str(selected["clipFrame"]), fill=(225, 230, 230))
            before_array, after_array = np.array(before_cells[index]), np.array(after_cells[index])
            delta = np.any(before_array != after_array, axis=2)
            difference = np.zeros_like(before_array)
            difference[delta] = before_array[delta]
            diff_tile = Image.new("RGBA", (256, 256), (8, 14, 18, 255))
            diff_tile.alpha_composite(Image.fromarray(difference, "RGBA"))
            board.paste(diff_tile.convert("RGB"), (720, top + 20))
            draw.text((720, top), "CHANGED ONLY: source key " + str(selected["removedPixelsInNominalCell"]) + "px", fill=(225, 230, 230))
        output = out / (job["profileId"] + ".jpg")
        board.save(output, quality=95)
        profile = {"profileId": job["profileId"], "sources": sources, "selectedReviewPoses": chosen,
                   "summary": pipeline.matte_proof_summary(sources, True, args.aa_fringe), "physicalAnchorReview": anchor_proof,
                   "sourceBoundsUnchanged": True, "renderedBoundsUnchanged": True, "scale": after_placements[0]["scale"],
                   "uniqueFrames": validation["uniqueFrameCount"], "findings": validation["findings"],
                   "reviewImage": output.relative_to(ROOT).as_posix(), "reviewImageSha256": pipeline.hash_file(output),
                   "visualReviewStatus": "pending-human-or-agent-inspection"}
        result["profiles"].append(profile)
        print(json.dumps({"profileId": job["profileId"], "removed": profile["summary"]["removedPixelCount"],
                          "boundsUnchanged": True, "findings": validation["findings"], "proof": profile["reviewImage"]}), flush=True)
    pipeline.json_write(out / "review.json", result)

if __name__ == "__main__":
    main()
