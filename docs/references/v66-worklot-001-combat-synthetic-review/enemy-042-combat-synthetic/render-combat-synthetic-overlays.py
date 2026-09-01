"""Render read-only technical review derivatives for enemy-042.

The selected RGB source boards are inputs only. This script never rewrites a
source, normalized asset, registry or runtime file. Outputs stay beside this
script and exist only to review source-cell ownership, physical roots, rigid
scale landmarks, orientation, weapon continuity and row-major playback.
"""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


PROFILE_ID = "enemy-042-combat-synthetic"
CLIPS = ("idle", "move", "attack", "death", "reload")
HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[4]
SOURCE_DIR = ROOT / "assets/openai/sprites/frames/v66/batch-003" / PROFILE_ID


@dataclass(frozen=True)
class Cell:
    frame: int
    row: int
    column: int
    box: tuple[int, int, int, int]


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def nominal_cells(size: tuple[int, int]) -> list[Cell]:
    width, height = size
    cells: list[Cell] = []
    for row in range(2):
        for column in range(4):
            x0 = round(column * width / 4)
            x1 = round((column + 1) * width / 4)
            y0 = round(row * height / 2)
            y1 = round((row + 1) * height / 2)
            cells.append(Cell(row * 4 + column, row, column, (x0, y0, x1, y1)))
    return cells


def is_generated_matte(rgb: tuple[int, int, int]) -> bool:
    red, green, blue = rgb
    return red > 190 and blue > 170 and green < 110 and abs(red - blue) < 100


def source_bounds(cell: Image.Image) -> tuple[int, int, int, int]:
    pixels = cell.load()
    points: list[tuple[int, int]] = []
    for y in range(cell.height):
        for x in range(cell.width):
            if not is_generated_matte(pixels[x, y]):
                points.append((x, y))
    if not points:
        raise RuntimeError("No foreground detected")
    xs = [point[0] for point in points]
    ys = [point[1] for point in points]
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def render_coordinate_review(clip: str, source: Image.Image) -> dict[str, object]:
    canvas = source.convert("RGBA")
    overlay = Image.new("RGBA", source.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    cells = nominal_cells(source.size)
    bounds: list[dict[str, object]] = []
    for cell in cells:
        x0, y0, x1, y1 = cell.box
        draw.rectangle((x0, y0, x1 - 1, y1 - 1), outline=(40, 235, 255, 230), width=2)
        for local_x in range(50, x1 - x0, 50):
            draw.line((x0 + local_x, y0, x0 + local_x, y1), fill=(50, 225, 255, 75), width=1)
            draw.text((x0 + local_x + 2, y0 + 4), str(local_x), fill=(235, 255, 255, 220))
        for local_y in range(50, y1 - y0, 50):
            draw.line((x0, y0 + local_y, x1, y0 + local_y), fill=(50, 225, 255, 75), width=1)
            draw.text((x0 + 3, y0 + local_y + 2), str(local_y), fill=(235, 255, 255, 220))
        crop = source.crop(cell.box).convert("RGB")
        bbox = source_bounds(crop)
        bx0, by0, bx1, by1 = bbox
        draw.rectangle((x0 + bx0, y0 + by0, x0 + bx1 - 1, y0 + by1 - 1), outline=(255, 222, 52, 245), width=2)
        draw.rectangle((x0 + 4, y0 + 4, x0 + 128, y0 + 27), fill=(10, 15, 20, 210))
        draw.text((x0 + 9, y0 + 8), f"pose {cell.frame + 1} / local", fill=(255, 255, 255, 255))
        bounds.append({"frame": cell.frame, "sourceBounds": list(bbox)})
    rendered = Image.alpha_composite(canvas, overlay).convert("RGB")
    output = HERE / f"{clip}-coordinate-review.png"
    rendered.save(output)
    return {"clip": clip, "sourceBounds": bounds, "output": str(output.relative_to(ROOT)).replace("\\", "/")}


def main() -> None:
    result: dict[str, object] = {"profileId": PROFILE_ID, "sources": {}, "coordinateReviews": []}
    for clip in CLIPS:
        source_path = SOURCE_DIR / f"{clip}.png"
        source = Image.open(source_path).convert("RGB")
        result["sources"][clip] = {
            "path": str(source_path.relative_to(ROOT)).replace("\\", "/"),
            "sha256": file_sha256(source_path),
            "size": list(source.size),
        }
        result["coordinateReviews"].append(render_coordinate_review(clip, source))
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
