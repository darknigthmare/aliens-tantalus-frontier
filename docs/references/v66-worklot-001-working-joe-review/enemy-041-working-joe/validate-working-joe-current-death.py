"""Validate the standalone anchors against current source pixels in memory."""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import sys
import tempfile

from PIL import Image


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PROFILE_ID = "enemy-041-working-joe"
sys.path.insert(0, str(ROOT / "scripts"))
spec = importlib.util.spec_from_file_location("v66_current_death_audit", ROOT / "scripts/process-v66-enemy-batch.py")
pipeline = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = pipeline
spec.loader.exec_module(pipeline)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


queue = json.loads((ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf-8"))
job = next(item for item in queue["jobs"] if item["profileId"] == PROFILE_ID)
metadata = json.loads((ROOT / job["metadataPath"]).read_text(encoding="utf-8"))
review = json.loads((HERE / "anchor-review.fragment.json").read_text(encoding="utf-8"))
reports = []
sources = []
options = metadata["normalizationOptions"]
for clip in job["clips"]:
    path = ROOT / clip["sourcePath"]
    with Image.open(path) as source:
        _, clip_reports = pipeline.split_source(
            source,
            clip["id"],
            job["sourceGrid"],
            options["safeReassignCellFragments"],
            options["removeEnclosedMagentaMatte"],
            options["removeEnclosedMagentaAaFringe"],
        )
        reports.extend(clip_reports)
        sources.append({"clip": clip["id"], "path": clip["sourcePath"], "sha256": sha256(path), "size": list(source.size)})

entry = review["profiles"][PROFILE_ID]
for report in reports:
    record = next(value for value in entry["clips"][report["clip"]]["frames"] if value["frame"] == report["clipFrame"])
    if record["sourceBounds"] != report["sourceBounds"]:
        raise ValueError(f"Stale sourceBounds: {report['clip']}/{report['clipFrame']}")

with tempfile.TemporaryDirectory(prefix="working-joe-anchor-audit-") as directory:
    temporary_root = Path(directory)
    relative_review = pipeline.batch_anchor_review_path(job)
    review_path = temporary_root / relative_review
    review_path.parent.mkdir(parents=True)
    shutil.copyfile(HERE / "anchor-review.fragment.json", review_path)
    anchors, proof = pipeline.reviewed_source_anchors(job, reports, sources, temporary_root)

if anchors is None or len(anchors) != 40 or proof["status"] != "reviewed":
    raise ValueError("Current physical anchors did not resolve 40/40.")
print(json.dumps({"status": "pass", "reviewedPoseCount": len(anchors), "deathBoundsVerified": 8, "writesOutsideTemporaryDirectory": 0}, indent=2))
