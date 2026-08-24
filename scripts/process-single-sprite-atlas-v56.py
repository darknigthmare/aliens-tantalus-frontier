"""Normalize one v56 ImageGen atlas with global component recovery.

Unlike the legacy cell-first pipeline, this pass removes the neutral/chroma
background before assigning subjects to cells. A wide corpse, ladder or tail
may therefore cross a source grid boundary without being cut in two.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import math
from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PIPELINE_PATH = Path(__file__).with_name("process-v50-art.py")
REPORT_PATH = ROOT / "assets" / "openai" / "v56-art-normalization-report.json"
ATLAS_SIZE = 1024
GRID = 4
CELL = ATLAS_SIZE // GRID
GUARD = 16


def load_pipeline():
    spec = importlib.util.spec_from_file_location("v56_sprite_pipeline", PIPELINE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load background extraction pipeline")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def project_path(value: str) -> Path:
    path = (ROOT / value).resolve()
    if path != ROOT and ROOT not in path.parents:
        raise ValueError(f"Path escapes project root: {value}")
    return path


def dark_background_key(image: Image.Image) -> tuple[int, int, int] | None:
    pixels = image.load()
    width, height = image.size
    border = [pixels[x, 0] for x in range(width)] + [pixels[x, height - 1] for x in range(width)]
    border += [pixels[0, y] for y in range(height)] + [pixels[width - 1, y] for y in range(height)]
    dark_neutral = [
        pixel for pixel in border
        if pixel[3] >= 16 and max(pixel[:3]) <= 240 and max(pixel[:3]) - min(pixel[:3]) <= 12
    ]
    if len(dark_neutral) < max(1, len(border) // 2):
        return None
    midpoint = len(dark_neutral) // 2
    return tuple(sorted(pixel[channel] for pixel in dark_neutral)[midpoint] for channel in range(3))


def clear_dark_connected_background(source: Image.Image) -> Image.Image | None:
    image = source.convert("RGBA")
    key = dark_background_key(image)
    if key is None:
        return None
    pixels = image.load()
    width, height = image.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def matches(pixel: tuple[int, int, int, int]) -> bool:
        red, green, blue, alpha = pixel
        return alpha < 16 or (
            max(abs(red - key[0]), abs(green - key[1]), abs(blue - key[2])) <= 14
            and max(red, green, blue) - min(red, green, blue) <= 12
        )

    def enqueue(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        index = y * width + x
        if visited[index] or not matches(pixels[x, y]):
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
    for index, present in enumerate(visited):
        if present:
            pixels[index % width, index // width] = (0, 0, 0, 0)

    return image


def components(image: Image.Image) -> list[dict[str, object]]:
    width, height = image.size
    mask = bytearray(1 if value >= 16 else 0 for value in image.getchannel("A").getdata())
    visited = bytearray(width * height)
    output: list[dict[str, object]] = []
    for start, present in enumerate(mask):
        if not present or visited[start]:
            continue
        visited[start] = 1
        queue = deque([start])
        indices: list[int] = []
        left = right = start % width
        top = bottom = start // width
        while queue:
            index = queue.popleft()
            indices.append(index)
            x = index % width
            y = index // width
            left, right = min(left, x), max(right, x)
            top, bottom = min(top, y), max(bottom, y)
            for neighbour in (
                index - 1 if x else -1,
                index + 1 if x + 1 < width else -1,
                index - width if y else -1,
                index + width if y + 1 < height else -1,
            ):
                if neighbour >= 0 and mask[neighbour] and not visited[neighbour]:
                    visited[neighbour] = 1
                    queue.append(neighbour)
        if len(indices) < 24:
            continue
        box = (left, top, right + 1, bottom + 1)
        output.append({
            "indices": indices,
            "pixels": len(indices),
            "box": box,
            "center": ((left + right + 1) / 2, (top + bottom + 1) / 2),
        })
    return output


def box_gap(left: tuple[int, int, int, int], right: tuple[int, int, int, int]) -> float:
    horizontal = max(left[0] - right[2], right[0] - left[2], 0)
    vertical = max(left[1] - right[3], right[1] - left[3], 0)
    return math.hypot(horizontal, vertical)


def related(component: dict[str, object], main: dict[str, object], source_size: tuple[int, int]) -> bool:
    box = component["box"]
    main_box = main["box"]
    assert isinstance(box, tuple) and isinstance(main_box, tuple)
    main_height = main_box[3] - main_box[1]
    vertical_overlap = box[1] <= main_box[3] - max(4, round(main_height * 0.08)) and box[3] >= main_box[1]
    size_floor = max(24, round(int(main["pixels"]) * 0.003))
    distance_limit = max(24, round(min(source_size) * 0.055))
    large_part = int(component["pixels"]) >= int(main["pixels"]) * 0.12
    return int(component["pixels"]) >= size_floor and box_gap(box, main_box) <= distance_limit and (
        vertical_overlap or large_part
    )


def recover_cells(master: Image.Image, pipeline) -> tuple[list[Image.Image], list[dict[str, object]]]:
    dark_cleaned = clear_dark_connected_background(master)
    cleaned = dark_cleaned if dark_cleaned is not None else pipeline.clear_connected_background(master.convert("RGBA"))
    found = components(cleaned)
    width, height = cleaned.size
    grouped: list[list[dict[str, object]]] = [[] for _ in range(GRID * GRID)]
    for component in found:
        center = component["center"]
        assert isinstance(center, tuple)
        column = min(GRID - 1, max(0, int(center[0] * GRID / width)))
        row = min(GRID - 1, max(0, int(center[1] * GRID / height)))
        grouped[row * GRID + column].append(component)

    source_pixels = cleaned.load()
    cells: list[Image.Image] = []
    recovery: list[dict[str, object]] = []
    for index, candidates in enumerate(grouped):
        if not candidates:
            raise ValueError(f"Source cell {index} has no recovered subject")
        candidates.sort(key=lambda item: int(item["pixels"]), reverse=True)
        main = candidates[0]
        selected = [main, *(item for item in candidates[1:] if related(item, main, cleaned.size))]
        boxes = [item["box"] for item in selected]
        left = min(box[0] for box in boxes)
        top = min(box[1] for box in boxes)
        right = max(box[2] for box in boxes)
        bottom = max(box[3] for box in boxes)
        cell = Image.new("RGBA", (right - left, bottom - top), (0, 0, 0, 0))
        cell_pixels = cell.load()
        for component in selected:
            for source_index in component["indices"]:
                x, y = source_index % width, source_index // width
                cell_pixels[x - left, y - top] = source_pixels[x, y]
        cells.append(cell)
        recovery.append({
            "cell": index,
            "candidateComponents": len(candidates),
            "keptComponents": len(selected),
            "sourceBox": [left, top, right, bottom],
            "sourcePixels": sum(int(item["pixels"]) for item in selected),
        })
    return cells, recovery


def normalize(source: Path, destination: Path) -> dict[str, object]:
    pipeline = load_pipeline()
    master = Image.open(source).convert("RGBA")
    cells, recovery = recover_cells(master, pipeline)
    boxes = [pipeline.alpha_bbox(cell) for cell in cells]
    if any(box is None for box in boxes):
        raise ValueError(f"{source.name}: empty recovered cell")
    widths = [box[2] - box[0] for box in boxes if box]
    heights = [box[3] - box[1] for box in boxes if box]
    scale = min((CELL - GUARD * 2) / max(widths), (CELL - GUARD * 2) / max(heights))
    atlas = Image.new("RGBA", (ATLAS_SIZE, ATLAS_SIZE), (0, 0, 0, 0))
    rendered = []
    for index, (cell, box) in enumerate(zip(cells, boxes, strict=True)):
        assert box is not None
        crop = cell.crop(box)
        target_width = max(1, round(crop.width * scale))
        target_height = max(1, round(crop.height * scale))
        resized = crop.resize((target_width, target_height), Image.Resampling.LANCZOS)
        column, row = index % GRID, index // GRID
        left = column * CELL + (CELL - target_width) // 2
        top = row * CELL + CELL - GUARD - target_height
        atlas.alpha_composite(resized, (left, top))
        rendered.append({"cell": index, "renderBox": [left, top, target_width, target_height]})
    pipeline.clear_hidden_rgb(atlas)
    destination.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(destination, optimize=True)
    alpha = atlas.getchannel("A")
    occupied = sum(1 for value in alpha.getdata() if value >= 16)
    guard_violations = 0
    alpha_pixels = alpha.load()
    for y in range(ATLAS_SIZE):
        for x in range(ATLAS_SIZE):
            local_x, local_y = x % CELL, y % CELL
            if alpha_pixels[x, y] >= 16 and (
                local_x < GUARD or local_y < GUARD or local_x >= CELL - GUARD or local_y >= CELL - GUARD
            ):
                guard_violations += 1
    if guard_violations:
        raise ValueError(f"{destination.name}: {guard_violations} guard pixels")
    return {
        "file": destination.relative_to(ROOT).as_posix(),
        "source": source.relative_to(ROOT).as_posix(),
        "sourceSize": list(master.size),
        "size": [ATLAS_SIZE, ATLAS_SIZE],
        "mode": "RGBA",
        "scale": round(scale, 5),
        "occupiedPixels": occupied,
        "guardViolations": guard_violations,
        "recovery": recovery,
        "cells": rendered,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("destination")
    args = parser.parse_args()
    source = project_path(args.source)
    destination = project_path(args.destination)
    entry = normalize(source, destination)
    report = {"release": "v56", "pipeline": "global component recovery", "spriteAtlases": []}
    if REPORT_PATH.exists():
        report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
    entries = report.setdefault("spriteAtlases", [])
    matching = [index for index, item in enumerate(entries) if item.get("file") == entry["file"]]
    if matching:
        entries[matching[0]] = entry
    else:
        entries.append(entry)
    entries.sort(key=lambda item: item.get("file", ""))
    report["release"] = "v56"
    report["pipeline"] = (
        "OpenAI ImageGen + global neutral/chroma extraction, source-boundary-safe component recovery, "
        "stable-scale 4x4 repack and transparent guard validation"
    )
    report["spriteAtlasCount"] = len(entries)
    report["spriteCellCount"] = len(entries) * 16
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(entry, ensure_ascii=False))


if __name__ == "__main__":
    main()
