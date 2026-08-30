"""Assemble the V64 ImageGen keyframe strips into guarded 4x4 runtime atlases.

The generator outputs deliberately remain preserved under frames/v64. This pass
only performs deterministic chroma removal, connected-component isolation,
ground-pivot alignment, atlas packing and animation-preview generation.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import deque
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

from v64_sprite_cell_quality import validate_v64_cells


ROOT = Path(__file__).resolve().parents[1]
FRAME_ROOT = ROOT / "assets" / "openai" / "sprites" / "frames" / "v64"
RAW_ROOT = ROOT / "assets" / "openai" / "sprites" / "enemies"
NORMALIZED_ROOT = ROOT / "assets" / "openai" / "sprites" / "normalized" / "enemies"
PREVIEW_ROOT = ROOT / "assets" / "openai" / "sprites" / "previews" / "v64"
METADATA_ROOT = ROOT / "assets" / "openai" / "sprites" / "metadata" / "v64"
REPORT_PATH = ROOT / "assets" / "openai" / "v64-art-normalization-report.json"

CELL = 256
GRID = 4
GUARD = 16
GROUND_Y = 240
MAX_WIDTH = CELL - GUARD * 2
MAX_HEIGHT = GROUND_Y - GUARD
CLIPS = ("idle", "chase", "attack", "death")


@dataclass(frozen=True)
class Creature:
    slug: str
    name: str
    sheet_id: str
    clip_set: str
    hitbox: str
    continuity: str
    excel_ids: tuple[str, ...]
    reference_urls: tuple[str, ...]


CREATURES = (
    Creature(
        "newborn",
        "Newborn",
        "enemy.newborn.action.v64",
        "newborn-action-v64",
        "newborn-tall",
        "Alien Resurrection (1997)",
        ("CAS-0037", "RAC-0040"),
        ("https://necaonline.com/2019/02/alien-resurrection-7-scale-action-figure-deluxe-newborn/",),
    ),
    Creature(
        "offspring",
        "Offspring",
        "enemy.offspring.action.v64",
        "offspring-action-v64",
        "offspring-tall",
        "Alien: Romulus (2024)",
        ("CAS-0038", "RAC-0041"),
        ("https://www.legacyefx.com/alien-romulus",),
    ),
    Creature(
        "predalien",
        "Predalien",
        "enemy.predalien.action.v64",
        "predalien-action-v64",
        "predalien-large",
        "Aliens vs. Predator: Requiem (2007)",
        ("CAS-0036",),
        (
            "https://necaonline.com/2011/03/just-in-time-for-halloween-the-hybrid/",
            "https://designstudiopress.com/products/avp-requiem",
        ),
    ),
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def foreground_mask(image: Image.Image) -> np.ndarray:
    rgb = np.asarray(image.convert("RGB"), dtype=np.int16)
    red, green, blue = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    minimum_magenta = np.minimum(red, blue)
    chroma = (
        (red >= 115)
        & (blue >= 115)
        & (minimum_magenta - green >= 38)
        & (np.abs(red - blue) <= 115)
    )
    return ~chroma


def row_runs(mask: np.ndarray) -> tuple[list[tuple[int, int, int, int]], list[int]]:
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
        left_root = find(left)
        right_root = find(right)
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
            prev_index = 0
            for run in current:
                _, start, end, run_id = run
                while prev_index < len(previous) and previous[prev_index][2] + 1 < start:
                    prev_index += 1
                candidate = prev_index
                while candidate < len(previous) and previous[candidate][1] - 1 <= end:
                    union(run_id, previous[candidate][3])
                    candidate += 1
        runs.extend(current)
        previous = current

    roots = [find(index) for index in range(len(parents))]
    return runs, roots


def connected_components(mask: np.ndarray) -> list[dict]:
    runs, roots = row_runs(mask)
    components: dict[int, dict] = {}
    for y, start, end, run_id in runs:
        root = roots[run_id]
        component = components.setdefault(
            root,
            {"area": 0, "left": start, "top": y, "right": end + 1, "bottom": y + 1, "runs": []},
        )
        component["area"] += end - start + 1
        component["left"] = min(component["left"], start)
        component["top"] = min(component["top"], y)
        component["right"] = max(component["right"], end + 1)
        component["bottom"] = max(component["bottom"], y + 1)
        component["runs"].append((y, start, end))
    return list(components.values())


def balanced_pose_seeds(components: list[dict], source_width: int) -> list[dict] | None:
    meaningful = [component for component in components if component["area"] >= 24]
    if len(meaningful) < 4:
        return None
    seeds = sorted(meaningful, key=lambda component: component["area"], reverse=True)[:4]
    areas = [component["area"] for component in seeds]
    area_median = float(np.median(areas))
    if not area_median:
        return None
    if min(areas) / area_median < 0.45 or max(areas) / area_median > 1.65:
        return None
    seeds.sort(key=lambda component: (component["left"] + component["right"]) / 2)
    centers = [(component["left"] + component["right"]) / 2 for component in seeds]
    if any(right - left < source_width * 0.08 for left, right in zip(centers, centers[1:])):
        return None
    expected = [(index + 0.5) * source_width / 4 for index in range(4)]
    if any(abs(actual - target) > source_width * 0.16 for actual, target in zip(centers, expected)):
        return None
    return seeds


def eroded_geodesic_assignments(mask: np.ndarray) -> tuple[list[list[dict]], int]:
    """Split touching poses from four eroded body seeds, then regrow their full masks."""

    seed_components: list[dict] | None = None
    erosion_kernel = 0
    binary = Image.fromarray(mask.astype(np.uint8) * 255, "L")
    for kernel in (3, 5, 7, 9, 11, 13, 15):
        eroded = np.asarray(binary.filter(ImageFilter.MinFilter(kernel)), dtype=np.uint8) > 0
        candidate = balanced_pose_seeds(connected_components(eroded), mask.shape[1])
        if candidate is not None:
            seed_components = candidate
            erosion_kernel = kernel
            break
    if seed_components is None:
        raise ValueError("Unable to split the source into four balanced pose seeds.")

    height, width = mask.shape
    labels = np.full(mask.shape, -1, dtype=np.int8)
    queue: deque[int] = deque()
    for label, component in enumerate(seed_components):
        for y, start, end in component["runs"]:
            for x in range(start, end + 1):
                labels[y, x] = label
                queue.append(y * width + x)

    neighbours = ((-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1))
    while queue:
        packed = queue.popleft()
        y, x = divmod(packed, width)
        label = labels[y, x]
        for dy, dx in neighbours:
            next_y, next_x = y + dy, x + dx
            if (
                0 <= next_y < height
                and 0 <= next_x < width
                and mask[next_y, next_x]
                and labels[next_y, next_x] < 0
            ):
                labels[next_y, next_x] = label
                queue.append(next_y * width + next_x)

    seed_centers = [
        ((component["left"] + component["right"]) / 2, (component["top"] + component["bottom"]) / 2)
        for component in seed_components
    ]
    unassigned = mask & (labels < 0)
    for component in connected_components(unassigned):
        center_x = (component["left"] + component["right"]) / 2
        center_y = (component["top"] + component["bottom"]) / 2
        nearest = min(
            range(4),
            key=lambda index: (center_x - seed_centers[index][0]) ** 2 + (center_y - seed_centers[index][1]) ** 2,
        )
        for y, start, end in component["runs"]:
            labels[y, start:end + 1] = nearest

    assignments = [connected_components(labels == label) for label in range(4)]
    if any(not group for group in assignments):
        raise ValueError("Geodesic pose split produced an empty assignment.")
    return assignments, erosion_kernel


def isolate_four(image: Image.Image) -> tuple[list[Image.Image], list[dict]]:
    source = image.convert("RGB")
    mask = foreground_mask(source)
    meaningful = [component for component in connected_components(mask) if component["area"] >= 24]
    seeds = balanced_pose_seeds(meaningful, source.width)
    isolation_strategy = "connected-components"
    erosion_kernel = None
    if seeds is None:
        assignments, erosion_kernel = eroded_geodesic_assignments(mask)
        isolation_strategy = "eroded-seed-geodesic-split"
    else:
        assignments = [[seed] for seed in seeds]
        seed_ids = {id(seed) for seed in seeds}
        for component in meaningful:
            if id(component) in seed_ids:
                continue
            center_x = (component["left"] + component["right"]) / 2
            center_y = (component["top"] + component["bottom"]) / 2
            nearest = min(
                range(4),
                key=lambda index: (
                    center_x - (seeds[index]["left"] + seeds[index]["right"]) / 2
                ) ** 2 + (
                    center_y - (seeds[index]["top"] + seeds[index]["bottom"]) / 2
                ) ** 2,
            )
            assignments[nearest].append(component)

    rgb = np.asarray(source, dtype=np.uint8).copy()
    # Neutralize generator chroma antialiasing only within a two-pixel
    # foreground edge band shared by Newborn, Offspring and Predalien. Keeping
    # the creature interior untouched preserves authored pink/red anatomy.
    chroma_band = ~mask
    for _ in range(2):
        expanded = chroma_band.copy()
        expanded[1:, :] |= chroma_band[:-1, :]
        expanded[:-1, :] |= chroma_band[1:, :]
        expanded[:, 1:] |= chroma_band[:, :-1]
        expanded[:, :-1] |= chroma_band[:, 1:]
        expanded[1:, 1:] |= chroma_band[:-1, :-1]
        expanded[1:, :-1] |= chroma_band[:-1, 1:]
        expanded[:-1, 1:] |= chroma_band[1:, :-1]
        expanded[:-1, :-1] |= chroma_band[1:, 1:]
        chroma_band = expanded
    edge_band = mask & chroma_band
    working = rgb.astype(np.int16)
    red, green, blue = working[..., 0], working[..., 1], working[..., 2]
    minimum_magenta = np.minimum(red, blue)
    magenta_score = minimum_magenta - green
    spill = edge_band & (minimum_magenta >= 24) & (magenta_score >= 16) & (np.abs(red - blue) <= 120)
    correction = np.maximum(0, magenta_score - 8) * 0.82
    working[..., 0] = np.where(spill, np.maximum(green + 8, red - correction), red)
    working[..., 2] = np.where(spill, np.maximum(green + 8, blue - correction), blue)
    rgb = np.clip(working, 0, 255).astype(np.uint8)
    frames: list[Image.Image] = []
    reports: list[dict] = []
    for index, group in enumerate(assignments):
        left = max(0, min(component["left"] for component in group) - 6)
        top = max(0, min(component["top"] for component in group) - 6)
        right = min(source.width, max(component["right"] for component in group) + 6)
        bottom = min(source.height, max(component["bottom"] for component in group) + 6)
        alpha = np.zeros((bottom - top, right - left), dtype=np.uint8)
        for component in group:
            for y, start, end in component["runs"]:
                if top <= y < bottom:
                    alpha[y - top, max(0, start - left):min(right - left, end - left + 1)] = 255
        rgba = np.zeros((bottom - top, right - left, 4), dtype=np.uint8)
        rgba[..., :3] = rgb[top:bottom, left:right]
        rgba[..., 3] = alpha
        rgba[alpha == 0, :3] = 0
        frame = Image.fromarray(rgba, "RGBA")
        frames.append(frame)
        reports.append({
            "index": index,
            "sourceBounds": [left, top, right, bottom],
            "sourceSize": [right - left, bottom - top],
            "foregroundPixels": int(np.count_nonzero(alpha)),
            "componentCount": len(group),
            "isolationStrategy": isolation_strategy,
            **({"erosionKernel": erosion_kernel} if erosion_kernel is not None else {}),
        })
    return frames, reports


def clear_hidden_rgb(image: Image.Image) -> Image.Image:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    rgba[rgba[..., 3] == 0, :3] = 0
    return Image.fromarray(rgba, "RGBA")


def remove_resample_magenta_fringe(image: Image.Image) -> Image.Image:
    """Neutralize chroma color that Lanczos can reintroduce on soft edge pixels.

    The source matte is removed before resizing, but a narrow fringe can survive
    in very low-alpha pixels after resampling. Restricting this correction to
    alpha below 64 preserves authored pink flesh in the opaque creature while
    keeping blended runtime edges free of the #FF00FF key color.
    """
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    working = rgba[..., :3].astype(np.int16)
    red, green, blue = working[..., 0], working[..., 1], working[..., 2]
    alpha = rgba[..., 3]
    spill = (
        (alpha > 0)
        & (alpha < 64)
        & (red > 150)
        & (blue > 150)
        & (np.minimum(red, blue) - green > 28)
        & (np.abs(red - blue) <= 120)
    )
    ceiling = green + 24
    working[..., 0] = np.where(spill, np.minimum(red, ceiling), red)
    working[..., 2] = np.where(spill, np.minimum(blue, ceiling), blue)
    rgba[..., :3] = np.clip(working, 0, 255).astype(np.uint8)
    rgba[alpha == 0, :3] = 0
    return Image.fromarray(rgba, "RGBA")


def normalized_cell(frame: Image.Image, canonical_scale: float) -> tuple[Image.Image, dict]:
    width, height = frame.size
    scale = min(canonical_scale, MAX_WIDTH / width, MAX_HEIGHT / height)
    output_width = max(1, round(width * scale))
    output_height = max(1, round(height * scale))
    resized = remove_resample_magenta_fringe(
        clear_hidden_rgb(frame.resize((output_width, output_height), Image.Resampling.LANCZOS))
    )
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    x = (CELL - output_width) // 2
    y = GROUND_Y - output_height
    cell.alpha_composite(resized, (x, y))
    cell = clear_hidden_rgb(cell)
    return cell, {
        "renderedBounds": [x, y, x + output_width, y + output_height],
        "scale": round(scale, 6),
    }


def validate_atlas(creature: Creature, atlas: Image.Image) -> dict:
    if atlas.mode != "RGBA" or atlas.size != (1024, 1024):
        raise ValueError(f"{creature.name}: invalid atlas {atlas.mode} {atlas.size}.")
    array = np.asarray(atlas)
    if np.any(array[array[..., 3] == 0, :3]):
        raise ValueError(f"{creature.name}: hidden RGB remains under transparent pixels.")
    return validate_v64_cells(atlas, creature.name)


def save_preview(cells: list[Image.Image], path: Path) -> None:
    background = (5, 13, 11, 255)
    frames = []
    for cell in cells:
        preview = Image.new("RGBA", cell.size, background)
        preview.alpha_composite(cell)
        frames.append(preview.convert("P", palette=Image.Palette.ADAPTIVE, colors=255))
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=110, loop=0, disposal=2)


def process_creature(creature: Creature) -> dict:
    source_frames: list[Image.Image] = []
    strip_reports = []
    for clip in CLIPS:
        path = FRAME_ROOT / creature.slug / f"{clip}-keyframes-v64.png"
        if not path.is_file():
            raise FileNotFoundError(path)
        with Image.open(path) as source:
            frames, component_reports = isolate_four(source)
            strip_size = list(source.size)
            strip_mode = source.mode
        source_frames.extend(frames)
        strip_reports.append({
            "clip": clip,
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "sourceSize": strip_size,
            "sourceMode": strip_mode,
            "sourceSha256": sha256(path),
            "frames": component_reports,
        })

    upright_heights = sorted(frame.height for frame in source_frames[:12])
    median_height = (upright_heights[5] + upright_heights[6]) / 2
    canonical_scale = MAX_HEIGHT / median_height
    cells: list[Image.Image] = []
    placements = []
    for index, frame in enumerate(source_frames):
        cell, placement = normalized_cell(frame, canonical_scale)
        cells.append(cell)
        placements.append({"index": index, "clip": CLIPS[index // 4], **placement})

    atlas = Image.new("RGBA", (CELL * GRID, CELL * GRID), (0, 0, 0, 0))
    for index, cell in enumerate(cells):
        atlas.alpha_composite(cell, ((index % GRID) * CELL, (index // GRID) * CELL))
    atlas = clear_hidden_rgb(atlas)
    validation = validate_atlas(creature, atlas)

    NORMALIZED_ROOT.mkdir(parents=True, exist_ok=True)
    RAW_ROOT.mkdir(parents=True, exist_ok=True)
    PREVIEW_ROOT.mkdir(parents=True, exist_ok=True)
    METADATA_ROOT.mkdir(parents=True, exist_ok=True)
    normalized_path = NORMALIZED_ROOT / f"{creature.slug}-action-sheet-v64.png"
    raw_path = RAW_ROOT / f"{creature.slug}-action-sheet-v64.png"
    preview_path = PREVIEW_ROOT / f"{creature.slug}-animation-preview-v64.gif"
    metadata_path = METADATA_ROOT / f"{creature.slug}-animation-v64.json"
    atlas.save(normalized_path, optimize=True)

    raw = Image.new("RGBA", atlas.size, (255, 0, 255, 255))
    raw.alpha_composite(atlas)
    raw.convert("RGB").save(raw_path, optimize=True)
    save_preview(cells, preview_path)

    metadata = {
        "schema": 1,
        "release": "v64",
        "subject": creature.name,
        "sheetId": creature.sheet_id,
        "clipSet": creature.clip_set,
        "clips": list(CLIPS),
        "grid": {"columns": 4, "rows": 4, "cellWidth": 256, "cellHeight": 256, "guard": 16},
        "pivot": {"id": "creature-ground", "x": 128, "y": 240},
        "hitbox": creature.hitbox,
        "sourceFacing": "right",
        "referenceStatus": "CANON_REFERENCE",
        "continuity": creature.continuity,
        "excelIds": list(creature.excel_ids),
        "referenceUrls": list(creature.reference_urls),
        "generationProvider": "OpenAI ImageGen",
        "modelMaster": f"/assets/openai/sprites/reference-masters/v64/{creature.slug}-model-master-v64.png",
        "normalized": "/" + str(normalized_path.relative_to(ROOT)).replace("\\", "/"),
        "raw": "/" + str(raw_path.relative_to(ROOT)).replace("\\", "/"),
        "preview": "/" + str(preview_path.relative_to(ROOT)).replace("\\", "/"),
        "placements": placements,
        "validation": validation,
    }
    metadata_path.write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return {
        "subject": creature.name,
        "sheetId": creature.sheet_id,
        "strips": strip_reports,
        "canonicalScale": round(canonical_scale, 6),
        "normalized": str(normalized_path.relative_to(ROOT)).replace("\\", "/"),
        "normalizedSha256": sha256(normalized_path),
        "raw": str(raw_path.relative_to(ROOT)).replace("\\", "/"),
        "rawSha256": sha256(raw_path),
        "preview": str(preview_path.relative_to(ROOT)).replace("\\", "/"),
        "metadata": str(metadata_path.relative_to(ROOT)).replace("\\", "/"),
        "validation": validation,
    }


def check_outputs() -> None:
    for creature in CREATURES:
        normalized_path = NORMALIZED_ROOT / f"{creature.slug}-action-sheet-v64.png"
        if not normalized_path.is_file():
            raise FileNotFoundError(normalized_path)
        with Image.open(normalized_path) as source:
            validation = validate_atlas(creature, source.convert("RGBA"))
        if len(validation["cells"]) != 16:
            raise ValueError(f"{creature.name}: incomplete validation.")
    print("V64 enemy art outputs are present and contain 48 substantial guarded cells.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.check:
        check_outputs()
        return
    report = {
        "schema": 1,
        "release": "v64",
        "generatedBy": "scripts/process-v64-enemy-art.py",
        "pipeline": [
            "tolerant-magenta-chroma-key",
            "connected-component-pose-isolation",
            "canonical-scale-normalization",
            "ground-pivot-alignment",
            "guarded-4x4-atlas-pack",
            "animated-preview",
        ],
        "creatures": [process_creature(creature) for creature in CREATURES],
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Assembled 3 V64 enemy atlases / 48 substantial guarded cells with deterministic pivots.")


if __name__ == "__main__":
    main()
