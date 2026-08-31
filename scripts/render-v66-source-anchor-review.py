"""Render manual physical-root evidence without modifying sources or review state."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]


def safe_path(value: str) -> Path:
    candidate = (ROOT / value).resolve()
    if Path(value).is_absolute() or not candidate.is_relative_to(ROOT):
        raise ValueError("Expected a repository-relative path")
    return candidate


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def render_profile(batch: str, profile: str, review_path: str | None = None) -> list[str]:
    if not re.fullmatch(r"batch-[0-9]{3}", batch):
        raise ValueError("Expected batch-NNN")
    if not re.fullmatch(r"enemy-[0-9]{3}-[a-z0-9-]+", profile):
        raise ValueError("Expected a stable enemy profile identifier")
    review = json.loads(safe_path(review_path or f"docs/references/V66_BATCH_{batch[-3:]}_ANCHOR_REVIEW.json").read_text(encoding="utf-8"))
    if review.get("batchId") != batch or review.get("coordinates") != "nominal-source-cell":
        raise ValueError("Review fragment belongs to another batch or coordinate system")
    entry = review["profiles"][profile]
    paths = []
    for clip, record in entry["clips"].items():
        if not re.fullmatch(r"[a-z0-9-]+", clip):
            raise ValueError("Invalid clip identifier")
        source_path = safe_path(f"assets/openai/sprites/frames/v66/{batch}/{profile}/{clip}.png")
        if sha256(source_path) != record["sourceSha256"]:
            raise ValueError(f"Review refers to a stale source: {clip}")
        with Image.open(source_path) as source:
            if list(source.size) != record["sourceSize"]:
                raise ValueError("Source dimensions changed")
            header = 90
            canvas = Image.new("RGB", (source.width, source.height + header), (17, 24, 30))
            canvas.paste(source.convert("RGB"), (0, header))
            draw = ImageDraw.Draw(canvas)
            draw.text((14, 12), f"{profile} / {clip} / {entry['status']} / PHYSICAL ROOT REVIEW ONLY - NOT RUNTIME ACCEPTANCE", fill=(255, 255, 255))
            draw.text((14, 33), "Yellow: manually observed ribcage center. Green: its vertical floor projection including the 3px extraction guard.", fill=(255, 223, 131))
            draw.text((14, 53), f"Source SHA256 {record['sourceSha256']}", fill=(198, 218, 233))
            x_edges = [round(i * source.width / 4) for i in range(5)]
            y_edges = [round(i * source.height / 2) for i in range(3)]
            for frame in record["frames"]:
                index = frame["frame"]
                ox, oy = x_edges[index % 4], y_edges[index // 4] + header
                lx, ly = frame["landmark"]
                ax, ay = frame["anchor"]
                draw.line((ox, oy, ox, oy + source.height // 2), fill=(200, 160, 75), width=1)
                draw.text((ox + 8, oy + 8), f"pose {index + 1}  L({lx},{ly}) root({ax},{ay}) +/-{frame['uncertaintyPx']}px", fill=(245, 245, 245), stroke_width=1, stroke_fill=(25, 25, 25))
                draw.line((ox + lx, oy + ly, ox + ax, oy + ay), fill=(230, 230, 110), width=2)
                draw.ellipse((ox + lx - 7, oy + ly - 7, ox + lx + 7, oy + ly + 7), outline=(255, 235, 70), width=3)
                draw.line((ox + 70, oy + ay, ox + 390, oy + ay), fill=(100, 255, 130), width=2)
                draw.line((ox + ax - 10, oy + ay, ox + ax + 10, oy + ay), fill=(255, 255, 255), width=3)
                draw.line((ox + ax, oy + ay - 10, ox + ax, oy + ay + 10), fill=(255, 255, 255), width=3)
            relative = f"docs/references/v66-{batch}-anchor-review/{profile}/{clip}.jpg"
            output = safe_path(relative)
            output.parent.mkdir(parents=True, exist_ok=True)
            canvas.save(output, format="JPEG", quality=94)
        if sha256(source_path) != record["sourceSha256"]:
            raise ValueError("Source changed during diagnostic rendering")
        paths.append(relative)
    return paths


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--batch", required=True)
    parser.add_argument("--profile", required=True)
    parser.add_argument("--review", help="Repository-relative fragment for parallel review; never modifies the shared review")
    args = parser.parse_args()
    print(json.dumps({"diagnosticContacts": render_profile(args.batch, args.profile, args.review), "sourcePixelsModified": 0, "reviewStatesChanged": 0}, indent=2))
