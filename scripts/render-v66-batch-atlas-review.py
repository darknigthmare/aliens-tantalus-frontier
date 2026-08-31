"""Render numbered contacts from candidate atlas pixels, never author or accept art."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]


def scoped(root: Path, value: str) -> Path:
    path = (root / value).resolve()
    if not isinstance(value, str) or Path(value).is_absolute() or not path.is_relative_to(root.resolve()):
        raise ValueError("Expected a repository-relative review path")
    return path


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def render_contact(job: dict, root: Path = ROOT) -> dict:
    metadata_path = scoped(root, job["metadataPath"])
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    atlas_path = scoped(root, job["normalizedPath"])
    atlas_hash = sha256(atlas_path)
    if metadata["profileId"] != job["profileId"] or metadata["normalizedSha256"] != atlas_hash:
        raise ValueError("Candidate atlas identity or checksum changed")
    grid = job["grid"]
    count = len(job["clips"]) * 8
    if metadata["grid"] != grid or metadata["frameCount"] != count or grid["columns"] * grid["rows"] != count:
        raise ValueError("Candidate grid does not cover the complete clip contract")
    cell, label, header = 192, 24, 52
    board = Image.new("RGB", (cell * grid["columns"], header + (cell + label) * grid["rows"]), (10, 17, 22))
    draw = ImageDraw.Draw(board)
    draw.text((8, 7), job["profileId"] + " / CANDIDATE - NO ACCEPTANCE", fill=(238, 222, 167))
    anchors = metadata.get("physicalAnchorReview", {}).get("status", "pending")
    draw.text((8, 27), f"{count} poses | roots: {anchors} | atlas: {atlas_hash[:16]}", fill=(170, 197, 207))
    with Image.open(atlas_path) as atlas:
        if atlas.size != (grid["columns"] * grid["cellWidth"], grid["rows"] * grid["cellHeight"]):
            raise ValueError("Unexpected atlas dimensions")
        atlas = atlas.convert("RGBA")
        for index in range(count):
            column, row = index % grid["columns"], index // grid["columns"]
            frame = atlas.crop((column * grid["cellWidth"], row * grid["cellHeight"], (column + 1) * grid["cellWidth"], (row + 1) * grid["cellHeight"]))
            frame = frame.resize((cell, cell), Image.Resampling.NEAREST)
            x, y = column * cell, header + row * (cell + label)
            board.paste(frame, (x, y + label), frame)
            clip = job["clips"][index // 8]
            draw.text((x + 5, y + 5), f"{clip['id']} / {index % 8 + 1} / {clip['fps']}fps", fill=(169, 196, 206))
            px = x + round(job["pivot"]["x"] * cell / grid["cellWidth"])
            py = y + label + round(job["pivot"]["y"] * cell / grid["cellHeight"])
            draw.line((px - 4, py, px + 4, py), fill=(72, 235, 172))
            draw.line((px, py - 4, px, py + 4), fill=(72, 235, 172))
            draw.rectangle((x, y + label, x + cell - 1, y + label + cell - 1), outline=(30, 45, 54))
    relative = f"docs/references/v66-{job['batchId']}-atlas-review/{job['profileId']}.jpg"
    output = scoped(root, relative)
    output.parent.mkdir(parents=True, exist_ok=True)
    board.save(output, quality=94)
    if sha256(atlas_path) != atlas_hash:
        raise ValueError("Atlas changed during read-only contact rendering")
    return {"profileId": job["profileId"], "atlasPath": job["normalizedPath"], "atlasSha256": atlas_hash,
            "metadataSha256": sha256(metadata_path), "contactPath": relative, "contactSha256": sha256(output),
            "frameCount": count, "anchorStatus": anchors, "visualReviewStatus": "pending-inspection", "sourcePixelsModified": 0}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--batch", required=True)
    parser.add_argument("--profile")
    args = parser.parse_args()
    if not re.fullmatch(r"batch-[0-9]{3}", args.batch):
        raise ValueError("Expected batch-NNN")
    queue = json.loads((ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf-8"))
    jobs = [job for job in queue["jobs"] if job["batchId"] == args.batch and (not args.profile or job["profileId"] == args.profile)]
    if not jobs:
        raise ValueError("No matching review profiles")
    results, missing = [], []
    for job in jobs:
        if not scoped(ROOT, job["metadataPath"]).is_file() or not scoped(ROOT, job["normalizedPath"]).is_file():
            missing.append(job["profileId"])
            continue
        results.append(render_contact(job))
    report = {"schema": 1, "batchId": args.batch, "acceptedAutomatically": 0, "profiles": results, "missingCandidates": missing}
    # Per-profile invocations never overwrite the whole-batch index during parallel review.
    name = f"{args.profile}.json" if args.profile else "index.json"
    path = scoped(ROOT, f"docs/references/v66-{args.batch}-atlas-review/{name}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"rendered": len(results), "poses": sum(row["frameCount"] for row in results), "missing": missing, "report": path.relative_to(ROOT).as_posix(), "acceptedAutomatically": 0}))


if __name__ == "__main__":
    main()
