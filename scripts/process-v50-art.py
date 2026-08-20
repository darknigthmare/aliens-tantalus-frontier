"""Normalize v50 ImageGen atlases and extract the traversal kit.

The generated masters are intentionally kept in the OpenAI generated-images
archive. Project copies are converted to exact 4x4 RGBA atlases with stable
per-sheet scale, shared foot baselines, and transparent cell guards.
"""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SPRITE_ROOT = ROOT / "assets" / "openai" / "sprites"
METROIDVANIA_ROOT = ROOT / "assets" / "openai" / "metroidvania"
ATLAS_SIZE = 1024
GRID = 4
CELL_SIZE = ATLAS_SIZE // GRID
GUARD = 16

TRAVERSAL_NAMES = (
    "floor-segment",
    "overhead-catwalk",
    "short-ledge",
    "drop-platform",
    "wall-ladder",
    "maintenance-pipe",
    "vent-entrance",
    "breakable-panel",
    "locked-bulkhead",
    "open-bulkhead",
    "cargo-cover",
    "supply-crates",
    "ceiling-cables",
    "foreground-pipes",
    "warning-lamp",
    "acid-floor-hazard",
)


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    if alpha < 16:
        return True
    return min(red, green, blue) >= 190 and max(red, green, blue) - min(red, green, blue) <= 36


def clear_connected_background(cell: Image.Image) -> Image.Image:
    image = cell.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        index = y * width + x
        if visited[index] or not is_background(pixels[x, y]):
            return
        visited[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        enqueue(x - 1, y)
        enqueue(x + 1, y)
        enqueue(x, y - 1)
        enqueue(x, y + 1)

    for y in range(height):
        for x in range(width):
            if visited[y * width + x]:
                pixels[x, y] = (0, 0, 0, 0)
    return image


def source_cells(image: Image.Image) -> list[Image.Image]:
    cells: list[Image.Image] = []
    for row in range(GRID):
        top = round(row * image.height / GRID)
        bottom = round((row + 1) * image.height / GRID)
        for column in range(GRID):
            left = round(column * image.width / GRID)
            right = round((column + 1) * image.width / GRID)
            cells.append(clear_connected_background(image.crop((left, top, right, bottom))))
    return cells


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int] | None:
    return image.getchannel("A").point(lambda value: 255 if value >= 16 else 0).getbbox()


def clear_hidden_rgb(image: Image.Image) -> None:
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0 and (red or green or blue):
                pixels[x, y] = (0, 0, 0, 0)


def normalize_atlas(source: Path, destination: Path) -> dict:
    master = Image.open(source).convert("RGBA")
    cells = source_cells(master)
    boxes = [alpha_bbox(cell) for cell in cells]
    if any(box is None for box in boxes):
        raise ValueError(f"{source.name}: empty cell after background removal")

    widths = [box[2] - box[0] for box in boxes if box]
    heights = [box[3] - box[1] for box in boxes if box]
    scale = min((CELL_SIZE - GUARD * 2) / max(widths), (CELL_SIZE - GUARD * 2) / max(heights))
    atlas = Image.new("RGBA", (ATLAS_SIZE, ATLAS_SIZE), (0, 0, 0, 0))
    reports = []

    for index, (cell, box) in enumerate(zip(cells, boxes, strict=True)):
        assert box is not None
        cropped = cell.crop(box)
        target_width = max(1, round(cropped.width * scale))
        target_height = max(1, round(cropped.height * scale))
        resized = cropped.resize((target_width, target_height), Image.Resampling.LANCZOS)
        column = index % GRID
        row = index // GRID
        left = column * CELL_SIZE + (CELL_SIZE - target_width) // 2
        top = row * CELL_SIZE + CELL_SIZE - GUARD - target_height
        atlas.alpha_composite(resized, (left, top))
        reports.append({
            "cell": index,
            "sourceBox": list(box),
            "renderBox": [left, top, target_width, target_height],
        })

    clear_hidden_rgb(atlas)
    destination.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(destination, optimize=True)

    alpha = atlas.getchannel("A")
    occupied = sum(1 for value in alpha.getdata() if value >= 16)
    guard_violations = 0
    alpha_pixels = alpha.load()
    for y in range(ATLAS_SIZE):
        for x in range(ATLAS_SIZE):
            local_x = x % CELL_SIZE
            local_y = y % CELL_SIZE
            if alpha_pixels[x, y] >= 16 and (
                local_x < GUARD or local_y < GUARD or local_x >= CELL_SIZE - GUARD or local_y >= CELL_SIZE - GUARD
            ):
                guard_violations += 1

    if guard_violations:
        raise ValueError(f"{destination.name}: {guard_violations} guard pixels")
    return {
        "file": destination.relative_to(ROOT).as_posix(),
        "sourceSize": list(master.size),
        "size": [ATLAS_SIZE, ATLAS_SIZE],
        "mode": atlas.mode,
        "scale": round(scale, 5),
        "occupiedPixels": occupied,
        "guardViolations": guard_violations,
        "cells": reports,
    }


def extract_traversal_props(clean_atlas: Path) -> list[dict]:
    atlas = Image.open(clean_atlas).convert("RGBA")
    output_dir = clean_atlas.parent
    reports = []
    for index, name in enumerate(TRAVERSAL_NAMES):
        column = index % GRID
        row = index // GRID
        cell = atlas.crop((column * CELL_SIZE, row * CELL_SIZE, (column + 1) * CELL_SIZE, (row + 1) * CELL_SIZE))
        box = alpha_bbox(cell)
        if box is None:
            raise ValueError(f"{name}: empty normalized prop")
        margin = 4
        left = max(0, box[0] - margin)
        top = max(0, box[1] - margin)
        right = min(CELL_SIZE, box[2] + margin)
        bottom = min(CELL_SIZE, box[3] + margin)
        prop = cell.crop((left, top, right, bottom))
        clear_hidden_rgb(prop)
        destination = output_dir / f"{name}.png"
        prop.save(destination, optimize=True)
        reports.append({"name": name, "file": destination.relative_to(ROOT).as_posix(), "size": list(prop.size)})
    return reports


def main() -> None:
    reports = []
    for source in sorted(SPRITE_ROOT.rglob("*.png")):
        reports.append(normalize_atlas(source, source))

    traversal_source = METROIDVANIA_ROOT / "props" / "tantalus-traversal-kit-atlas.png"
    traversal_clean = METROIDVANIA_ROOT / "props" / "tantalus-traversal-kit-atlas-clean.png"
    traversal_report = normalize_atlas(traversal_source, traversal_clean)
    props = extract_traversal_props(traversal_clean)

    report = {
        "pipeline": "OpenAI ImageGen + deterministic Pillow flood-fill, stable-scale repack and guard validation",
        "grid": {"columns": GRID, "rows": GRID, "cellSize": CELL_SIZE, "guard": GUARD},
        "spriteAtlases": reports,
        "traversalAtlas": traversal_report,
        "traversalProps": props,
    }
    destination = ROOT / "assets" / "openai" / "v50-art-normalization-report.json"
    destination.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"sprites": len(reports), "props": len(props), "report": destination.relative_to(ROOT).as_posix()}))


if __name__ == "__main__":
    raise SystemExit(
        "Direct execution is disabled because main() rewrites sprite masters in place. "
        "Run scripts/process-v50-art-safe.py instead."
    )
