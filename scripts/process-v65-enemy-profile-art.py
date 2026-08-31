"""Normalize dedicated V65 enemy-profile ImageGen sheets for runtime use.

ImageGen masters are preserved under ``frames/v65/enemy-profiles``.  Each
master is a square 4x4 board rendered on a deliberately flat magenta matte.
This script removes only the border-connected matte, isolates every authored
pose, preserves a single scale across the full board, anchors all cells to the
same ground pivot and emits guarded 1024x1024 RGBA atlases plus provenance.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

from v64_sprite_cell_quality import validate_v64_cells


ROOT = Path(__file__).resolve().parents[1]
FRAME_ROOT = ROOT / "assets" / "openai" / "sprites" / "frames" / "v65" / "enemy-profiles"
NORMALIZED_ROOT = ROOT / "assets" / "openai" / "sprites" / "normalized" / "enemy-profiles-v65"
METADATA_ROOT = ROOT / "assets" / "openai" / "sprites" / "metadata" / "v65" / "enemy-profiles"
PREVIEW_ROOT = ROOT / "assets" / "openai" / "sprites" / "previews" / "v65" / "enemy-profiles"
REPORT_PATH = ROOT / "assets" / "openai" / "v65-enemy-profile-normalization-report.json"

CELL = 256
GRID = 4
GUARD = 16
GROUND_Y = 240
MAX_WIDTH = CELL - GUARD * 2
MAX_HEIGHT = GROUND_Y - GUARD
CLIPS = ("idle", "move", "attack", "hurt-death")
PROFILE_RE = re.compile(r"^(enemy-\d{3}-.+)\.png$")


@dataclass(frozen=True)
class Component:
    area: int
    left: int
    top: int
    right: int
    bottom: int
    runs: tuple[tuple[int, int, int], ...]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def connected_components(mask: np.ndarray) -> list[Component]:
    """Return 8-connected components using compact horizontal run unions."""

    parents: list[int] = []
    ranks: list[int] = []
    runs: list[tuple[int, int, int, int]] = []

    def make() -> int:
        index = len(parents)
        parents.append(index)
        ranks.append(0)
        return index

    def find(index: int) -> int:
        while parents[index] != index:
            parents[index] = parents[parents[index]]
            index = parents[index]
        return index

    def union(left: int, right: int) -> None:
        left_root, right_root = find(left), find(right)
        if left_root == right_root:
            return
        if ranks[left_root] < ranks[right_root]:
            left_root, right_root = right_root, left_root
        parents[right_root] = left_root
        if ranks[left_root] == ranks[right_root]:
            ranks[left_root] += 1

    previous: list[tuple[int, int, int, int]] = []
    for y, row in enumerate(mask):
        xs = np.flatnonzero(row)
        current: list[tuple[int, int, int, int]] = []
        if xs.size:
            starts = np.r_[xs[0], xs[1:][np.diff(xs) > 1]]
            ends = np.r_[xs[:-1][np.diff(xs) > 1], xs[-1]]
            current = [(y, int(start), int(end), make()) for start, end in zip(starts, ends)]
            previous_index = 0
            for _, start, end, run_id in current:
                while previous_index < len(previous) and previous[previous_index][2] + 1 < start:
                    previous_index += 1
                candidate = previous_index
                while candidate < len(previous) and previous[candidate][1] - 1 <= end:
                    union(run_id, previous[candidate][3])
                    candidate += 1
        runs.extend(current)
        previous = current

    grouped: dict[int, dict] = {}
    for y, start, end, run_id in runs:
        root = find(run_id)
        group = grouped.setdefault(
            root,
            {"area": 0, "left": start, "top": y, "right": end + 1, "bottom": y + 1, "runs": []},
        )
        group["area"] += end - start + 1
        group["left"] = min(group["left"], start)
        group["top"] = min(group["top"], y)
        group["right"] = max(group["right"], end + 1)
        group["bottom"] = max(group["bottom"], y + 1)
        group["runs"].append((y, start, end))
    return [Component(**{**group, "runs": tuple(group["runs"])}) for group in grouped.values()]


def component_mask(shape: tuple[int, int], components: list[Component]) -> np.ndarray:
    mask = np.zeros(shape, dtype=bool)
    for component in components:
        for y, start, end in component.runs:
            mask[y, start:end + 1] = True
    return mask


def border_connected_magenta(rgb: np.ndarray) -> np.ndarray:
    working = rgb.astype(np.int16)
    red, green, blue = working[..., 0], working[..., 1], working[..., 2]
    minimum = np.minimum(red, blue)
    strong = (
        (red >= 80)
        & (blue >= 80)
        & (minimum - green >= 25)
        & (np.abs(red - blue) <= 140)
    )
    height, width = strong.shape
    background = [
        component
        for component in connected_components(strong)
        if component.left == 0
        or component.top == 0
        or component.right == width
        or component.bottom == height
    ]
    matte = component_mask(strong.shape, background)

    # Absorb the darker two-pixel antialias fringe only when it is adjacent to
    # the already proven, border-connected matte.  Interior purple anatomy is
    # therefore retained even for Neuro-Linked and royal variants.
    soft = (
        (red >= 35)
        & (blue >= 35)
        & (minimum - green >= 10)
        & (np.abs(red - blue) <= 165)
    )
    for _ in range(2):
        dilated = matte.copy()
        dilated[1:, :] |= matte[:-1, :]
        dilated[:-1, :] |= matte[1:, :]
        dilated[:, 1:] |= matte[:, :-1]
        dilated[:, :-1] |= matte[:, 1:]
        dilated[1:, 1:] |= matte[:-1, :-1]
        dilated[1:, :-1] |= matte[:-1, 1:]
        dilated[:-1, 1:] |= matte[1:, :-1]
        dilated[:-1, :-1] |= matte[1:, 1:]
        matte |= dilated & soft
    return matte


def keep_authored_foreground(mask: np.ndarray) -> np.ndarray:
    components = sorted(connected_components(mask), key=lambda component: component.area, reverse=True)
    if not components:
        raise ValueError("No foreground survived the magenta matte removal.")
    largest = components[0]
    margin_x = max(24, round(mask.shape[1] * 0.18))
    margin_y = max(24, round(mask.shape[0] * 0.18))
    vicinity = (
        max(0, largest.left - margin_x),
        max(0, largest.top - margin_y),
        min(mask.shape[1], largest.right + margin_x),
        min(mask.shape[0], largest.bottom + margin_y),
    )
    kept: list[Component] = []
    for component in components:
        center_x = (component.left + component.right) / 2
        center_y = (component.top + component.bottom) / 2
        near_subject = vicinity[0] <= center_x <= vicinity[2] and vicinity[1] <= center_y <= vicinity[3]
        if component is largest or component.area >= max(48, largest.area * 0.025) or (component.area >= 18 and near_subject):
            kept.append(component)
    return component_mask(mask.shape, kept)


def remove_edge_spill(rgba: np.ndarray) -> np.ndarray:
    result = rgba.copy()
    working = result[..., :3].astype(np.int16)
    red, green, blue = working[..., 0], working[..., 1], working[..., 2]
    alpha = result[..., 3]
    minimum = np.minimum(red, blue)
    spill = (
        (alpha > 0)
        & (alpha < 224)
        & (red >= 80)
        & (blue >= 80)
        & (minimum - green >= 18)
        & (np.abs(red - blue) <= 150)
    )
    ceiling = green + 18
    working[..., 0] = np.where(spill, np.minimum(red, ceiling), red)
    working[..., 2] = np.where(spill, np.minimum(blue, ceiling), blue)
    result[..., :3] = np.clip(working, 0, 255).astype(np.uint8)
    result[alpha == 0, :3] = 0
    return result


def extract_cell(source: Image.Image, box: tuple[int, int, int, int]) -> tuple[Image.Image, dict]:
    rgb = np.asarray(source.crop(box).convert("RGB"), dtype=np.uint8)
    matte = border_connected_magenta(rgb)
    foreground = keep_authored_foreground(~matte)
    ys, xs = np.where(foreground)
    if xs.size < 512:
        raise ValueError(f"Cell {box} contains only {xs.size} foreground pixels.")
    left, top, right, bottom = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    pad = 3
    left, top = max(0, left - pad), max(0, top - pad)
    right, bottom = min(rgb.shape[1], right + pad), min(rgb.shape[0], bottom + pad)

    alpha = np.zeros(foreground.shape, dtype=np.uint8)
    alpha[foreground] = 255
    alpha = np.asarray(Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.55)), dtype=np.uint8)
    rgba = np.zeros((*foreground.shape, 4), dtype=np.uint8)
    rgba[..., :3] = rgb
    rgba[..., 3] = alpha
    rgba = remove_edge_spill(rgba)
    cropped = rgba[top:bottom, left:right].copy()
    cropped[cropped[..., 3] == 0, :3] = 0
    return Image.fromarray(cropped, "RGBA"), {
        "sourceCell": list(box),
        "sourceBounds": [left, top, right, bottom],
        "sourceSize": [right - left, bottom - top],
        "foregroundPixels": int(xs.size),
    }


def split_board(source: Image.Image) -> tuple[list[Image.Image], list[dict]]:
    if source.width != source.height:
        raise ValueError(f"Expected a square 4x4 board, got {source.size}.")
    boundaries = [round(index * source.width / GRID) for index in range(GRID + 1)]
    frames: list[Image.Image] = []
    reports: list[dict] = []
    for row in range(GRID):
        for column in range(GRID):
            box = (boundaries[column], boundaries[row], boundaries[column + 1], boundaries[row + 1])
            frame, report = extract_cell(source, box)
            frames.append(frame)
            reports.append({"index": row * GRID + column, "clip": CLIPS[row], **report})
    return frames, reports


def normalize_frames(frames: list[Image.Image], reports: list[dict]) -> tuple[Image.Image, list[dict]]:
    scale = min(
        1.0,
        MAX_WIDTH / max(frame.width for frame in frames),
        MAX_HEIGHT / max(frame.height for frame in frames),
    )
    atlas = Image.new("RGBA", (CELL * GRID, CELL * GRID), (0, 0, 0, 0))
    placements: list[dict] = []
    for index, frame in enumerate(frames):
        width = max(1, round(frame.width * scale))
        height = max(1, round(frame.height * scale))
        resized = frame.resize((width, height), Image.Resampling.LANCZOS)
        rgba = remove_edge_spill(np.asarray(resized.convert("RGBA"), dtype=np.uint8))
        resized = Image.fromarray(rgba, "RGBA")
        x, y = (CELL - width) // 2, GROUND_Y - height
        cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        cell.alpha_composite(resized, (x, y))
        array = np.asarray(cell, dtype=np.uint8).copy()
        array[array[..., 3] == 0, :3] = 0
        cell = Image.fromarray(array, "RGBA")
        atlas.alpha_composite(cell, ((index % GRID) * CELL, (index // GRID) * CELL))
        placements.append({
            **reports[index],
            "renderedBounds": [x, y, x + width, y + height],
            "scale": round(scale, 6),
        })
    output = np.asarray(atlas, dtype=np.uint8).copy()
    output[output[..., 3] == 0, :3] = 0
    return Image.fromarray(output, "RGBA"), placements


def save_preview(atlas: Image.Image, path: Path) -> None:
    preview = Image.new("RGBA", atlas.size, (5, 10, 14, 255))
    preview.alpha_composite(atlas)
    preview.resize((512, 512), Image.Resampling.LANCZOS).convert("RGB").save(path, quality=92)


def profile_name(profile_id: str) -> str:
    return " ".join(part.capitalize() for part in profile_id.split("-")[2:])


def process(path: Path) -> dict:
    match = PROFILE_RE.match(path.name)
    if not match:
        raise ValueError(f"Unexpected V65 master filename: {path.name}")
    profile_id = match.group(1)
    with Image.open(path) as source:
        source_size, source_mode = list(source.size), source.mode
        frames, cell_reports = split_board(source.convert("RGB"))
    atlas, placements = normalize_frames(frames, cell_reports)
    validation = validate_v64_cells(atlas, profile_id)
    array = np.asarray(atlas, dtype=np.uint8)
    if np.any(array[array[..., 3] == 0, :3]):
        raise ValueError(f"{profile_id}: hidden RGB remains below transparent pixels.")

    NORMALIZED_ROOT.mkdir(parents=True, exist_ok=True)
    METADATA_ROOT.mkdir(parents=True, exist_ok=True)
    PREVIEW_ROOT.mkdir(parents=True, exist_ok=True)
    normalized_path = NORMALIZED_ROOT / f"{profile_id}.webp"
    metadata_path = METADATA_ROOT / f"{profile_id}.json"
    preview_path = PREVIEW_ROOT / f"{profile_id}.jpg"
    # Hundreds of 1024px RGBA PNGs would duplicate several hundred MiB in both
    # the checkout and Git object store. WebP keeps the authored alpha and
    # animation-cell contract while making the complete profile wave viable in
    # a web build. Alpha remains lossless; only opaque RGB uses quality 84.
    atlas.save(normalized_path, format="WEBP", quality=84, method=6, exact=True)
    with Image.open(normalized_path) as persisted:
        persisted_validation = validate_v64_cells(persisted.convert("RGBA"), profile_id)
    save_preview(atlas, preview_path)

    metadata = {
        "schema": 1,
        "release": "v65",
        "profileId": profile_id,
        "subject": profile_name(profile_id),
        "sheetId": f"enemy.profile.{profile_id}.v65",
        "grid": {"columns": 4, "rows": 4, "cellWidth": 256, "cellHeight": 256, "guard": GUARD},
        "clips": list(CLIPS),
        "pivot": {"id": "creature-ground", "x": 128, "y": GROUND_Y},
        "sourceFacing": "right",
        "referenceStatus": "DEDICATED_PROFILE_ADAPTATION",
        "generationProvider": "OpenAI ImageGen",
        "raw": "/" + str(path.relative_to(ROOT)).replace("\\", "/"),
        "rawSha256": sha256(path),
        "normalized": "/" + str(normalized_path.relative_to(ROOT)).replace("\\", "/"),
        "normalizedSha256": sha256(normalized_path),
        "runtimeFormat": "image/webp",
        "preview": "/" + str(preview_path.relative_to(ROOT)).replace("\\", "/"),
        "sourceSize": source_size,
        "sourceMode": source_mode,
        "placements": placements,
        "validation": persisted_validation,
    }
    metadata_path.write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return {
        "profileId": profile_id,
        "raw": str(path.relative_to(ROOT)).replace("\\", "/"),
        "normalized": str(normalized_path.relative_to(ROOT)).replace("\\", "/"),
        "metadata": str(metadata_path.relative_to(ROOT)).replace("\\", "/"),
        "preview": str(preview_path.relative_to(ROOT)).replace("\\", "/"),
        "cells": len(validation["cells"]),
    }


def selected_paths(only: str | None, limit: int | None) -> list[Path]:
    paths = sorted(path for path in FRAME_ROOT.glob("*.png") if PROFILE_RE.match(path.name))
    if only:
        requested = {item.strip() for item in only.split(",") if item.strip()}
        paths = [path for path in paths if path.stem in requested or path.name in requested]
        unresolved = requested - {path.stem for path in paths} - {path.name for path in paths}
        if unresolved:
            raise FileNotFoundError(f"Unknown V65 masters: {', '.join(sorted(unresolved))}")
    if limit is not None:
        paths = paths[:limit]
    return paths


def check_outputs(paths: list[Path]) -> None:
    for path in paths:
        normalized = NORMALIZED_ROOT / f"{path.stem}.webp"
        metadata = METADATA_ROOT / f"{path.stem}.json"
        if not normalized.is_file() or not metadata.is_file():
            raise FileNotFoundError(f"Missing V65 output for {path.stem}.")
        with Image.open(normalized) as atlas:
            validate_v64_cells(atlas.convert("RGBA"), path.stem)
    print(f"V65 enemy profile check passed: {len(paths)} atlases / {len(paths) * 16} guarded cells.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", help="Comma-separated profile ids or filenames")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    paths = selected_paths(args.only, args.limit)
    if not paths:
        raise FileNotFoundError(f"No V65 enemy profile masters found below {FRAME_ROOT}.")
    if args.check:
        check_outputs(paths)
        return
    entries = [process(path) for path in paths]
    report = {
        "schema": 1,
        "release": "v65",
        "generatedBy": "scripts/process-v65-enemy-profile-art.py",
        "pipeline": [
            "border-connected-tolerant-magenta-key",
            "per-cell-component-isolation",
            "single-board-canonical-scale",
            "ground-pivot-alignment",
            "guarded-4x4-atlas-pack",
            "hidden-rgb-clear",
        ],
        "atlasCount": len(entries),
        "cellCount": len(entries) * GRID * GRID,
        "entries": entries,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Normalized {len(entries)} V65 enemy profile atlases / {len(entries) * 16} guarded cells.")


if __name__ == "__main__":
    main()
