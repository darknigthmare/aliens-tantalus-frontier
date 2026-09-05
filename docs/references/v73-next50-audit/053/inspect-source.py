"""Read-only source measurements for human review; never production art edits."""
import importlib.util
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / "scripts"))
spec = importlib.util.spec_from_file_location("normalizer", ROOT / "scripts/process-v66-enemy-batch.py")
pipeline = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pipeline)
PROFILE = "enemy-053-albino-ovomorph"

def main():
    queue = json.loads((ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf-8"))
    job = next(item for item in queue["jobs"] if item["profileId"] == PROFILE)
    output = []
    for clip in job["clips"]:
        path = ROOT / clip["sourcePath"]
        with Image.open(path) as source:
            frames, reports = pipeline.split_source(source, clip["id"], job["sourceGrid"], True, True, True)
            record = {"clip": clip["id"], "sha256": pipeline.hash_file(path), "size": list(source.size), "frames": []}
        for frame, report in zip(frames, reports):
            alpha = np.asarray(frame.getchannel("A"))
            bounds = frame.getchannel("A").getbbox()
            ox, oy = report["sourceBounds"][:2]
            floor = oy + bounds[3]
            rows = []
            for above_floor in (40, 60, 80, 100, 120):
                y = bounds[3] - above_floor
                if y < 0: continue
                xs = np.flatnonzero(alpha[y] > 0)
                if xs.size:
                    rows.append({"aboveFloor": above_floor, "y": oy + y, "left": ox + int(xs.min()), "right": ox + int(xs.max()) + 1, "width": int(xs.max() - xs.min() + 1)})
            centers = []
            for y in range(max(bounds[1], bounds[3] - 45), bounds[3] - 8):
                xs = np.flatnonzero(alpha[y] > 0)
                if xs.size: centers.append(ox + (int(xs.min()) + int(xs.max()) + 1) / 2)
            record["frames"].append({"frame": report["clipFrame"], "alphaBounds": [ox + bounds[0], oy + bounds[1], ox + bounds[2], floor], "lowerShellCenterX": float(np.median(centers)), "supportY": floor, "shellCrossSections": rows})
        output.append(record)
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
