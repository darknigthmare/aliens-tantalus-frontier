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


def is_chroma_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    return alpha >= 16 and green >= 100 and green - red >= 30 and green - blue >= 30


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    if alpha < 16:
        return True
    return min(red, green, blue) >= 190 and max(red, green, blue) - min(red, green, blue) <= 36


def clear_connected_background(cell: Image.Image) -> Image.Image:
    image = cell.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    border = [pixels[x, 0] for x in range(width)] + [pixels[x, height - 1] for x in range(width)]
    border += [pixels[0, y] for y in range(height)] + [pixels[width - 1, y] for y in range(height)]
    chroma_keyed = sum(is_chroma_background(pixel) for pixel in border) >= max(1, len(border) // 2)
    matches_background = is_chroma_background if chroma_keyed else is_background
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        index = y * width + x
        if visited[index] or not matches_background(pixels[x, y]):
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

    if chroma_keyed:
        return image

    island_visited = bytearray(width * height)
    for start in range(width * height):
        if island_visited[start]:
            continue
        start_x = start % width
        start_y = start // width
        red, green, blue, alpha = pixels[start_x, start_y]
        if alpha < 16 or not is_background((red, green, blue, alpha)):
            island_visited[start] = 1
            continue
        island_visited[start] = 1
        component = [start]
        queue.append((start_x, start_y))
        while queue:
            x, y = queue.popleft()
            for neighbour_x, neighbour_y in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if neighbour_x < 0 or neighbour_y < 0 or neighbour_x >= width or neighbour_y >= height:
                    continue
                index = neighbour_y * width + neighbour_x
                if island_visited[index]:
                    continue
                colour = pixels[neighbour_x, neighbour_y]
                if colour[3] < 16 or not is_background(colour):
                    island_visited[index] = 1
                    continue
                island_visited[index] = 1
                component.append(index)
                queue.append((neighbour_x, neighbour_y))
        if len(component) >= 64:
            for index in component:
                pixels[index % width, index // width] = (0, 0, 0, 0)
    return image


def clear_tiny_components(image: Image.Image, minimum_pixels: int = 48) -> Image.Image:
    pixels = image.load()
    width, height = image.size
    mask = bytearray(1 if value >= 16 else 0 for value in image.getchannel("A").getdata())
    visited = bytearray(width * height)
    for start, present in enumerate(mask):
        if not present or visited[start]:
            continue
        visited[start] = 1
        component = [start]
        queue = deque([start])
        while queue:
            index = queue.popleft()
            x = index % width
            y = index // width
            for neighbour in (index - 1 if x else -1, index + 1 if x + 1 < width else -1, index - width if y else -1, index + width if y + 1 < height else -1):
                if neighbour >= 0 and mask[neighbour] and not visited[neighbour]:
                    visited[neighbour] = 1
                    component.append(neighbour)
                    queue.append(neighbour)
        if len(component) < minimum_pixels:
            for index in component:
                pixels[index % width, index // width] = (0, 0, 0, 0)
    return image


def uses_chroma_background(image: Image.Image) -> bool:
    pixels = image.load()
    width, height = image.size
    border = [pixels[x, 0] for x in range(width)] + [pixels[x, height - 1] for x in range(width)]
    border += [pixels[0, y] for y in range(height)] + [pixels[width - 1, y] for y in range(height)]
    return sum(is_chroma_background(pixel) for pixel in border) >= max(1, len(border) // 2)


def chroma_component_cells(image: Image.Image) -> list[Image.Image]:
    cleaned = image.convert("RGBA")
    pixels = cleaned.load()
    width, height = cleaned.size
    mask = bytearray(width * height)
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if is_chroma_background((red, green, blue, alpha)):
                pixels[x, y] = (0, 0, 0, 0)
            elif alpha >= 16:
                if green > max(red, blue):
                    pixels[x, y] = (red, max(red, blue), blue, alpha)
                mask[y * width + x] = 1

    visited = bytearray(width * height)
    components = []
    for start, present in enumerate(mask):
        if not present or visited[start]:
            continue
        visited[start] = 1
        queue = deque([start])
        indices = []
        minimum_x = width
        minimum_y = height
        maximum_x = maximum_y = 0
        while queue:
            index = queue.popleft()
            indices.append(index)
            x = index % width
            y = index // width
            minimum_x = min(minimum_x, x)
            minimum_y = min(minimum_y, y)
            maximum_x = max(maximum_x, x)
            maximum_y = max(maximum_y, y)
            neighbours = (
                index - 1 if x else -1,
                index + 1 if x + 1 < width else -1,
                index - width if y else -1,
                index + width if y + 1 < height else -1,
            )
            for neighbour in neighbours:
                if neighbour >= 0 and mask[neighbour] and not visited[neighbour]:
                    visited[neighbour] = 1
                    queue.append(neighbour)
        if len(indices) >= 48:
            components.append({
                "indices": indices,
                "box": (minimum_x, minimum_y, maximum_x + 1, maximum_y + 1),
                "centre": ((minimum_x + maximum_x) / 2, (minimum_y + maximum_y) / 2),
            })

    selected = sorted(components, key=lambda component: len(component["indices"]), reverse=True)[: GRID * GRID]
    if len(selected) != GRID * GRID:
        raise ValueError(f"Expected 16 chroma-keyed subjects, found {len(selected)}")
    by_row = sorted(selected, key=lambda component: component["centre"][1])
    ordered = []
    for row in range(GRID):
        ordered.extend(sorted(by_row[row * GRID:(row + 1) * GRID], key=lambda component: component["centre"][0]))

    cells = []
    for component in ordered:
        left, top, right, bottom = component["box"]
        cell = Image.new("RGBA", (right - left, bottom - top), (0, 0, 0, 0))
        cell_pixels = cell.load()
        for index in component["indices"]:
            x = index % width
            y = index // width
            cell_pixels[x - left, y - top] = pixels[x, y]
        cells.append(cell)
    return cells


def source_cells(image: Image.Image) -> list[Image.Image]:
    if uses_chroma_background(image):
        return chroma_component_cells(image)
    cells: list[Image.Image] = []
    for row in range(GRID):
        top = round(row * image.height / GRID)
        bottom = round((row + 1) * image.height / GRID)
        for column in range(GRID):
            left = round(column * image.width / GRID)
            right = round((column + 1) * image.width / GRID)
            cleaned = clear_connected_background(image.crop((left, top, right, bottom)))
            cells.append(clear_tiny_components(cleaned))
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


def despill_green(image: Image.Image) -> None:
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha and green > max(red, blue):
                pixels[x, y] = (red, max(red, blue), blue, alpha)


def normalize_atlas(source: Path, destination: Path) -> dict:
    master = Image.open(source).convert("RGBA")
    chroma_keyed = uses_chroma_background(master)
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
        if chroma_keyed:
            despill_green(resized)
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
        "pipeline": "OpenAI ImageGen + deterministic neutral/chroma extraction, connected-component cell recovery, stable-scale repack and guard validation",
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
