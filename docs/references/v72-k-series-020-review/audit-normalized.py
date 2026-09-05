"""Reproducible image diagnostics only; never writes source or normalized art."""
import hashlib
import json
from pathlib import Path
import statistics
import numpy as np
from PIL import Image, ImageSequence

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PROFILE = "enemy-020-k-series-yellow-xenomorph"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    metadata_path = ROOT / f"assets/openai/sprites/metadata/v66/{PROFILE}.json"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    atlas_path = ROOT / metadata["normalized"]
    assert sha(atlas_path) == metadata["normalizedSha256"]
    for source in metadata["sources"]:
        assert sha(ROOT / source["path"]) == source["sha256"]
    atlas = np.array(Image.open(atlas_path).convert("RGBA")).astype(np.int16)
    clips = {}
    for row, clip in enumerate(["idle", "move", "attack", "death"]):
        frames = [atlas[(row * 2 + i // 4) * 256:(row * 2 + i // 4 + 1) * 256,
                        (i % 4) * 256:(i % 4 + 1) * 256] for i in range(8)]
        strict = [int(((f[:, :, 3] >= 16) & (f[:, :, 0] > 160) & (f[:, :, 2] > 160)
                      & (f[:, :, 1] + 35 < np.minimum(f[:, :, 0], f[:, :, 2]))).sum()) for f in frames]
        assert sum(strict) == 0
        step = [float(np.abs(frames[i] - frames[i - 1]).mean()) for i in range(1, 8)]
        seam = float(np.abs(frames[0] - frames[-1]).mean())
        gif_path = ROOT / f"assets/openai/sprites/previews/v66/{PROFILE}/{clip}.gif"
        with Image.open(gif_path) as gif:
            durations = [frame.info.get("duration") for frame in ImageSequence.Iterator(gif)]
        clips[clip] = {"uniqueRgbaFrames": len({hashlib.sha256(f.tobytes()).hexdigest() for f in frames}),
                       "strictMagentaPixelsByFrame": strict, "gifFrames": len(durations), "gifDurationsMs": durations,
                       "loopSeamOverMedianStepRgba": round(seam / statistics.median(step), 6),
                       "loopExpected": clip in ["idle", "move"]}
        if clip == "idle":
            sizes = []
            for i, f in enumerate(frames):
                # These observed head/body ROIs exclude the raised tail tip.
                top = int(np.where(f[:, 110:195, 3] >= 128)[0].min())
                bottom = int(np.where(f[:, 100:195, 3] >= 128)[0].max())
                sizes.append({"frame": i, "craniumTopY": top, "supportBottomY": bottom, "inclusiveHeight": bottom-top+1})
    registry_paths = ["docs/references/V66_BATCH_002_ANCHOR_REVIEW.json", "docs/references/V66_BATCH_002_SCALE_REVIEW.json"]
    queue = json.loads((ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf-8"))
    stale = []
    for job in queue["jobs"]:
        if job["batchId"] != "batch-002" or job["profileId"] == PROFILE:
            continue
        path = ROOT / f"assets/openai/sprites/metadata/v66/{job['profileId']}.json"
        other = json.loads(path.read_text(encoding="utf-8"))
        fields = [key for key in ["physicalAnchorReview", "postGenerationScaleReview"]
                  if other.get(key, {}).get("path") and other[key]["sha256"] != sha(ROOT / other[key]["path"])]
        if fields:
            stale.append({"profileId": job["profileId"], "staleProofFields": fields})
    files = [atlas_path, metadata_path] + [ROOT / p for p in registry_paths]
    files += [ROOT / source["path"] for source in metadata["sources"]]
    files += [p for p in HERE.iterdir() if p.suffix in [".jpg", ".json", ".py"] and p.name != "normalization-diagnostics.json"]
    files += list((ROOT / f"assets/openai/sprites/normalized/enemy-clips-v66/{PROFILE}").glob("*.webp"))
    files += list((ROOT / f"assets/openai/sprites/previews/v66/{PROFILE}").glob("*.gif"))
    files += [ROOT / f"docs/references/v66-batch-002-atlas-review/{PROFILE}.{ext}" for ext in ["jpg", "json"]]
    report = {"schema": 1, "profileId": PROFILE, "reviewedAt": "2026-09-05", "acceptedAutomatically": 0,
              "runtimeIntegratedByThisReview": False, "clips": clips, "idleOpaqueBody": {"alphaThreshold": 128,
              "heightExcludesTail": True, "frames": sizes, "medianHeight": statistics.median([s["inclusiveHeight"] for s in sizes]),
              "firstFrameApproximateWidthExcludingTail": 84, "manualWidthUncertaintyPx": 4},
              "strictSpillNeutralizedPixels": metadata["magentaSpill"]["neutralizedPixelCount"],
              "staleOtherCandidateProofs": stale, "fileSha256": {str(p.relative_to(ROOT)).replace(chr(92), "/"): sha(p) for p in files},
              "limits": ["Image-sequence diagnostics are not a live motion or combat acceptance.",
                         "Width is manually observed; height is a thresholded ROI measurement, not canonical metres."]}
    (HERE / "normalization-diagnostics.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"clips": clips, "idleOpaqueBody": report["idleOpaqueBody"], "staleCandidates": len(stale)}, indent=2))


if __name__ == "__main__":
    main()
