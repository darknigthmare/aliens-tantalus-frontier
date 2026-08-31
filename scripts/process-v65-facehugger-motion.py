"""Pack eight authored Facehugger poses into a guarded 4x2 RGBA atlas.

This is a deterministic production step, not an image generator: the original
OpenAI source is preserved, keyed and scaled once across all eight poses. No
frames are invented, interpolated, mirrored or duplicated. Each clip needs its
own reviewed ``frames/v65/facehugger-{clip}-reference-v65.png`` source.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

from v64_sprite_cell_quality import analyze_v64_cells


ROOT = Path(__file__).resolve().parents[1]
SPRITES = ROOT / "assets" / "openai" / "sprites"
SOURCE_ROOT = SPRITES / "frames" / "v65"
NORMALIZED_ROOT = SPRITES / "normalized" / "facehugger-motion-v65"
METADATA_ROOT = SPRITES / "metadata" / "v65" / "facehugger-motion"
PREVIEW_ROOT = SPRITES / "previews" / "v65" / "facehugger-motion"
CLIP_FPS = {"scuttle": 12, "idle": 6, "attack": 12, "death": 10}
REFERENCE_URL = "https://necaonline.com/2016/05/aliens-foam-prop-replica-life-size-facehugger/"
COLUMNS, ROWS, CELL, GUARD = 4, 2, 256, 16
CLIP_ORDER = ("idle", "scuttle", "attack", "death")
COMBINED_ROOT = SPRITES / "normalized" / "enemy-profiles-v65"

# Reuse the existing vetted magenta key, edge cleanup and single-scale packing.
_spec = importlib.util.spec_from_file_location(
    "v65_enemy_profile_art", Path(__file__).with_name("process-v65-enemy-profile-art.py")
)
if _spec is None or _spec.loader is None:
    raise ImportError("Cannot load the V65 enemy profile normalization pipeline.")
_pipeline = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = _pipeline
_spec.loader.exec_module(_pipeline)


def public_path(path: Path) -> str:
    return "/" + path.relative_to(ROOT).as_posix()


def clip_paths(clip: str) -> dict[str, Path]:
    stem = f"facehugger-{clip}-v65"
    return {
        "source": SOURCE_ROOT / f"facehugger-{clip}-reference-v65.png",
        "normalized": NORMALIZED_ROOT / f"{stem}.webp",
        "metadata": METADATA_ROOT / f"{stem}.json",
        "preview": PREVIEW_ROOT / f"{stem}.gif",
    }


def transfer_left_border_fragment(rgba: np.ndarray, report: dict, box: tuple, component, previous_frame: Image.Image, previous_report: dict, source_index: int) -> tuple[Image.Image, dict, dict]:
    fragment_mask = _pipeline.component_mask(rgba.shape[:2], [component])
    ys, xs = np.where(fragment_mask)
    current_origin = (box[0] + report["sourceBounds"][0], box[1] + report["sourceBounds"][1])
    previous_origin = (previous_report["sourceCell"][0] + previous_report["sourceBounds"][0], previous_report["sourceCell"][1] + previous_report["sourceBounds"][1])
    previous_pixels = np.asarray(previous_frame, dtype=np.uint8)
    connected = False
    for x, y in zip(xs, ys):
        global_x, global_y = current_origin[0] + int(x), current_origin[1] + int(y)
        if global_x != box[0]:
            continue
        px, py = global_x - 1 - previous_origin[0], global_y - previous_origin[1]
        if 0 <= px < previous_frame.width and any(0 <= py + dy < previous_frame.height and previous_pixels[py + dy, px, 3] > 0 for dy in (-1, 0, 1)):
            connected = True
            break
    if not connected:
        raise ValueError(f"Cell {source_index}: border fragment has no proven connection to the preceding authored pose.")
    fragment_bounds = [current_origin[0] + component.left, current_origin[1] + component.top, current_origin[0] + component.right, current_origin[1] + component.bottom]
    bounds = [min(previous_origin[0], fragment_bounds[0] - 3), min(previous_origin[1], fragment_bounds[1] - 3), max(previous_origin[0] + previous_frame.width, fragment_bounds[2] + 3), max(previous_origin[1] + previous_frame.height, fragment_bounds[3] + 3)]
    expanded = np.zeros((bounds[3] - bounds[1], bounds[2] - bounds[0], 4), dtype=np.uint8)
    px, py = previous_origin[0] - bounds[0], previous_origin[1] - bounds[1]
    expanded[py:py + previous_frame.height, px:px + previous_frame.width] = previous_pixels
    target_x = xs + current_origin[0] - bounds[0]
    target_y = ys + current_origin[1] - bounds[1]
    if np.any(expanded[target_y, target_x, 3]):
        raise ValueError("Fragment reassignment would overwrite existing anatomy.")
    expanded[target_y, target_x] = rgba[ys, xs]
    if not np.array_equal(expanded[target_y, target_x], rgba[ys, xs]):
        raise ValueError("Fragment reassignment changed the extracted source pixels.")
    transfer = {"sourceCellIndex": source_index, "targetCellIndex": source_index - 1, "sourceBoundsGlobal": fragment_bounds, "pixels": int(xs.size), "rgbaSha256": hashlib.sha256(rgba[ys, xs].tobytes()).hexdigest(), "pixelValuesPreserved": True, "ownershipEvidence": "eight-connected across original source cell boundary"}
    updated_report = {**previous_report, "sourceBoundsBeforeFragmentReassignment": previous_report["sourceBounds"], "sourceBounds": [bounds[0] - previous_report["sourceCell"][0], bounds[1] - previous_report["sourceCell"][1], bounds[2] - previous_report["sourceCell"][0], bounds[3] - previous_report["sourceCell"][1]], "sourceSize": [bounds[2] - bounds[0], bounds[3] - bounds[1]], "receivedSourceFragments": [*previous_report.get("receivedSourceFragments", []), transfer]}
    return Image.fromarray(expanded, "RGBA"), updated_report, transfer


def split_source(source: Image.Image, clip: str) -> tuple[list[Image.Image], list[dict]]:
    if source.width != source.height * 2:
        raise ValueError(f"Expected a precise 2:1 source for a 4x2 grid, got {source.size}.")
    x_edges = [round(index * source.width / COLUMNS) for index in range(COLUMNS + 1)]
    y_edges = [round(index * source.height / ROWS) for index in range(ROWS + 1)]
    frames, reports = [], []
    for row in range(ROWS):
        for column in range(COLUMNS):
            box = (x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])
            frame, report = _pipeline.extract_cell(source, box)
            # These four reviewed beige Facehugger masters contain no purple
            # anatomy. Key enclosed matte pockets between fingers as well as
            # the border-connected background handled by the shared pipeline.
            rgba = np.asarray(frame, dtype=np.uint8).copy()
            rgb = rgba[..., :3].astype(np.int16)
            red, green, blue = rgb[..., 0], rgb[..., 1], rgb[..., 2]
            enclosed_matte = (rgba[..., 3] > 0) & (red >= 80) & (blue >= 80) & (np.minimum(red, blue) - green >= 25) & (np.abs(red - blue) <= 140)
            rgba[enclosed_matte] = 0
            components = sorted(_pipeline.connected_components(rgba[..., 3] > 0), key=lambda component: component.area, reverse=True)
            border_fragments = [component for component in components[1:] if component.area < max(48, components[0].area * 0.025) and (component.left <= 3 or component.right >= rgba.shape[1] - 3)]
            fragment_mask = _pipeline.component_mask(rgba.shape[:2], border_fragments)
            transfers = []
            for component in border_fragments:
                if column == 0 or report["sourceBounds"][0] + component.left != 0:
                    raise ValueError("A detached border component needs source ownership review; no anatomy may be discarded.")
                previous_index = row * COLUMNS + column - 1
                frames[previous_index], reports[previous_index], transfer = transfer_left_border_fragment(rgba, report, box, component, frames[previous_index], reports[previous_index], previous_index + 1)
                transfers.append(transfer)
            rgba[fragment_mask] = 0
            frame = Image.fromarray(rgba, "RGBA")
            if border_fragments:
                left, top, right, bottom = frame.getbbox()
                cropped = (max(0, left - 3), max(0, top - 3), min(frame.width, right + 3), min(frame.height, bottom + 3))
                original_bounds = report["sourceBounds"]
                report = {**report, "sourceBoundsBeforeCellIsolation": original_bounds, "sourceBounds": [original_bounds[0] + cropped[0], original_bounds[1] + cropped[1], original_bounds[0] + cropped[2], original_bounds[1] + cropped[3]], "sourceSize": [cropped[2] - cropped[0], cropped[3] - cropped[1]]}
                frame = frame.crop(cropped)
            frames.append(frame)
            reports.append({"index": row * COLUMNS + column, "clip": clip, "sourceRow": row, "removedEnclosedMattePixels": int(enclosed_matte.sum()), "removedBorderFragmentPixels": 0, "reassignedBorderFragmentPixels": int(fragment_mask.sum()), "sourceFragmentTransfers": transfers, **report})
    return frames, reports


def normalize_motion_frames(frames: list[Image.Image], reports: list[dict]) -> tuple[Image.Image, list[dict]]:
    if len(frames) != len(reports) or len(frames) % COLUMNS:
        raise ValueError("Motion frames must form complete four-column rows.")
    # Row-local ground references remove source-board row layout drift while
    # retaining the attack's authored rise and descent (not frame interpolation).
    attack_baselines = {
        row: max(report["sourceBounds"][3] for report in reports if report["clip"] == "attack" and report["sourceRow"] == row)
        for row in {report["sourceRow"] for report in reports if report["clip"] == "attack"}
    }
    lifts = [max(0, attack_baselines[report["sourceRow"]] - report["sourceBounds"][3]) if report["clip"] == "attack" else 0 for report in reports]
    scale = min(1.0, (CELL - 2 * GUARD) / max(frame.width for frame in frames), (240 - GUARD) / max(frame.height + lift for frame, lift in zip(frames, lifts)))
    atlas = Image.new("RGBA", (COLUMNS * CELL, len(frames) // COLUMNS * CELL), (0, 0, 0, 0))
    placements = []
    for index, (frame, report, lift) in enumerate(zip(frames, reports, lifts)):
        width, height = max(1, round(frame.width * scale)), max(1, round(frame.height * scale))
        resized = frame.resize((width, height), Image.Resampling.LANCZOS)
        resized = Image.fromarray(_pipeline.remove_edge_spill(np.asarray(resized, dtype=np.uint8)), "RGBA")
        lift_pixels = round(lift * scale)
        x, y = (CELL - width) // 2, 240 - height - lift_pixels
        atlas.alpha_composite(resized, ((index % COLUMNS) * CELL + x, (index // COLUMNS) * CELL + y))
        placements.append({**report, "index": index, "renderedBounds": [x, y, x + width, y + height], "scale": round(scale, 6), "sourceLift": lift, "renderedLift": lift_pixels})
    pixels = np.asarray(atlas, dtype=np.uint8).copy()
    pixels[pixels[..., 3] == 0, :3] = 0
    return Image.fromarray(pixels, "RGBA"), placements


def atlas_frames(atlas: Image.Image) -> list[Image.Image]:
    return [atlas.crop((
        (index % COLUMNS) * CELL,
        (index // COLUMNS) * CELL,
        (index % COLUMNS + 1) * CELL,
        (index // COLUMNS + 1) * CELL,
    )) for index in range(COLUMNS * (atlas.height // CELL))]


def validate_atlas(atlas: Image.Image, rows: int = ROWS) -> dict:
    rgba = atlas.convert("RGBA")
    report = analyze_v64_cells(rgba, columns=COLUMNS, rows=rows, guard=GUARD)
    if report["findings"]:
        raise ValueError("; ".join(finding["message"] for finding in report["findings"]))
    pixels = np.asarray(rgba, dtype=np.uint8)
    if np.any(pixels[pixels[..., 3] == 0, :3]):
        raise ValueError("Hidden RGB remains under transparent atlas pixels.")
    hashes = [hashlib.sha256(frame.tobytes()).hexdigest() for frame in atlas_frames(rgba)]
    if len(set(hashes)) != COLUMNS * rows:
        raise ValueError(f"The atlas must contain {COLUMNS * rows} byte-distinct authored frames.")
    return {**report, "uniqueFrameCount": len(set(hashes)), "cellRgbaSha256": hashes}


def save_preview(atlas: Image.Image, path: Path, fps: int, loop: bool) -> None:
    previews = []
    for frame in atlas_frames(atlas):
        background = Image.new("RGBA", (CELL, CELL), (8, 14, 18, 255))
        background.alpha_composite(frame)
        previews.append(background.convert("RGB"))
    options = {"loop": 0} if loop else {}
    previews[0].save(
        path, format="GIF", save_all=True, append_images=previews[1:],
        duration=round(1000 / fps / 10) * 10, disposal=2, optimize=False, **options,
    )
    with Image.open(path) as preview:
        if preview.n_frames != len(previews):
            raise ValueError(f"Preview lost animation frames: {preview.n_frames}.")


def process_clip(clip: str) -> dict:
    paths = clip_paths(clip)
    # Fail before making output directories if the requested authored clip is absent.
    with Image.open(paths["source"]) as original:
        source_size, source_mode = list(original.size), original.mode
        frames, reports = split_source(original.convert("RGB"), clip)
    raw_hash = _pipeline.sha256(paths["source"])
    atlas, placements = normalize_motion_frames(frames, reports)
    validate_atlas(atlas)
    for kind in ("normalized", "metadata", "preview"):
        paths[kind].parent.mkdir(parents=True, exist_ok=True)
    atlas.save(paths["normalized"], format="WEBP", lossless=True, method=6, exact=True)
    with Image.open(paths["normalized"]) as persisted:
        validation = validate_atlas(persisted)
        if persisted.convert("RGBA").tobytes() != atlas.tobytes():
            raise ValueError("Lossless WebP changed the packed RGBA pixels.")
    loop = clip in ("idle", "scuttle")
    save_preview(atlas, paths["preview"], CLIP_FPS[clip], loop)
    if _pipeline.sha256(paths["source"]) != raw_hash:
        raise ValueError("The source master changed during normalization.")
    metadata = {
        "schema": 1,
        "release": "v65",
        "subject": "Facehugger",
        "clip": clip,
        "frameOrder": "row-major",
        "frameCount": COLUMNS * ROWS,
        "fps": CLIP_FPS[clip],
        "loop": loop,
        "grid": {"columns": COLUMNS, "rows": ROWS, "cellWidth": CELL, "cellHeight": CELL, "guard": GUARD},
        "pivot": {"id": "creature-ground", "x": 128, "y": 240},
        "sourceFacing": "right",
        "referenceStatus": "CANON_REFERENCE_ADAPTATION",
        "referenceUrls": [REFERENCE_URL],
        "canonExact": False,
        "fullCharacterComplete": False,
        "identityReview": "Source reviewed by main agent against NECA reference; no 1:1 or full-character-completion claim.",
        "generationProvider": "OpenAI ImageGen",
        "generatedBy": "scripts/process-v65-facehugger-motion.py",
        "raw": public_path(paths["source"]),
        "rawSha256": raw_hash,
        "rawPreserved": True,
        "sourceSize": source_size,
        "sourceMode": source_mode,
        "normalized": public_path(paths["normalized"]),
        "normalizedSha256": _pipeline.sha256(paths["normalized"]),
        "runtimeFormat": "image/webp",
        "encoding": "lossless-rgba",
        "scaleScope": "single-clip",
        "preview": public_path(paths["preview"]),
        "previewSha256": _pipeline.sha256(paths["preview"]),
        "pipeline": ["existing-v65-border-connected-magenta-key", "per-cell-authored-pose-extraction", "single-board-scale", "pivot-128-240", "guarded-4x2-pack", "lossless-webp"],
        "interpolatedFrames": 0,
        "duplicatedFrames": 0,
        "placements": placements,
        "validation": validation,
    }
    paths["metadata"].write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    return metadata


def combined_paths() -> dict[str, Path]:
    return {
        "normalized": COMBINED_ROOT / "enemy-002-facehugger.webp",
        "metadata": METADATA_ROOT / "enemy-002-facehugger.json",
        "preview": PREVIEW_ROOT / "enemy-002-facehugger.gif",
    }


def process_all() -> dict:
    frames, reports, sources = [], [], []
    for clip in CLIP_ORDER:
        source_path = clip_paths(clip)["source"]
        with Image.open(source_path) as original:
            clip_frames, clip_reports = split_source(original.convert("RGB"), clip)
            sources.append({"clip": clip, "path": public_path(source_path), "sha256": _pipeline.sha256(source_path), "size": list(original.size), "mode": original.mode})
        frames.extend(clip_frames)
        reports.extend(clip_reports)
    if len({tuple(source["size"]) for source in sources}) != 1:
        raise ValueError("The four source boards must use the same resolution to share a physical scale.")
    atlas, placements = normalize_motion_frames(frames, reports)
    validation = validate_atlas(atlas, rows=ROWS * len(CLIP_ORDER))
    paths = combined_paths()
    for path in paths.values():
        path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(paths["normalized"], format="WEBP", lossless=True, method=6, exact=True)
    with Image.open(paths["normalized"]) as persisted:
        persisted_validation = validate_atlas(persisted, rows=ROWS * len(CLIP_ORDER))
        if persisted.convert("RGBA").tobytes() != atlas.tobytes() or persisted_validation != validation:
            raise ValueError("Combined lossless WebP changed packed pixels or cell validation.")
    save_preview(atlas, paths["preview"], 10, True)
    clips = []
    for ordinal, clip in enumerate(CLIP_ORDER):
        start = ordinal * COLUMNS * ROWS
        clips.append({"id": clip, "frames": list(range(start, start + COLUMNS * ROWS)), "fps": CLIP_FPS[clip], "loop": clip in ("idle", "scuttle")})
        local_atlas = atlas.crop((0, ordinal * ROWS * CELL, COLUMNS * CELL, (ordinal + 1) * ROWS * CELL))
        clip_output = clip_paths(clip)
        for kind in ("normalized", "metadata", "preview"):
            clip_output[kind].parent.mkdir(parents=True, exist_ok=True)
        local_atlas.save(clip_output["normalized"], format="WEBP", lossless=True, method=6, exact=True)
        save_preview(local_atlas, clip_output["preview"], CLIP_FPS[clip], clip in ("idle", "scuttle"))
        clip_metadata = {
            "schema": 1, "release": "v65", "subject": "Facehugger", "clip": clip,
            "generationProvider": "OpenAI ImageGen", "raw": sources[ordinal]["path"], "rawSha256": sources[ordinal]["sha256"],
            "normalized": public_path(clip_output["normalized"]), "normalizedSha256": _pipeline.sha256(clip_output["normalized"]),
            "preview": public_path(clip_output["preview"]), "previewSha256": _pipeline.sha256(clip_output["preview"]),
            "sourceFacing": "right", "encoding": "lossless-rgba", "scaleScope": "all-four-clips", "scale": placements[0]["scale"],
            "grid": {"columns": COLUMNS, "rows": ROWS, "cellWidth": CELL, "cellHeight": CELL, "guard": GUARD},
            "pivot": {"x": 128, "y": 240}, "fps": CLIP_FPS[clip], "loop": clip in ("idle", "scuttle"),
            "canonExact": False, "referenceUrls": [REFERENCE_URL], "frameCount": COLUMNS * ROWS,
            "combinedAtlas": public_path(paths["normalized"]), "placements": placements[start:start + COLUMNS * ROWS],
            "validation": validate_atlas(local_atlas),
        }
        clip_output["metadata"].write_text(json.dumps(clip_metadata, indent=2) + "\n", encoding="utf-8")
    for source in sources:
        if _pipeline.sha256(ROOT / source["path"].lstrip("/")) != source["sha256"]:
            raise ValueError("A source master changed while assembling the full atlas.")
    metadata = {
        "schema": 1, "release": "v65", "subject": "Facehugger", "profileId": "enemy-002-facehugger",
        "sheetId": "enemy.profile.enemy-002-facehugger.v65", "generationProvider": "OpenAI ImageGen",
        "generatedBy": "scripts/process-v65-facehugger-motion.py", "sourceFacing": "right",
        "referenceStatus": "CANON_REFERENCE_ADAPTATION", "referenceUrls": [REFERENCE_URL],
        "identityReview": "Four source boards reviewed by main agent against NECA reference; no 1:1 claim.",
        "canonExact": False, "fullCharacterComplete": False, "normalizationStatus": "validated",
        "grid": {"columns": COLUMNS, "rows": ROWS * len(CLIP_ORDER), "cellWidth": CELL, "cellHeight": CELL, "guard": GUARD},
        "pivot": {"id": "creature-ground", "x": 128, "y": 240}, "clips": clips,
        "frameOrder": "idle-8,scuttle-8,attack-8,death-8;row-major", "frameCount": len(frames),
        "scale": placements[0]["scale"], "scaleScope": "all-four-clips", "interpolatedFrames": 0, "duplicatedFrames": 0,
        "attackVerticalMotion": "Row-local source ground reference preserves authored rise/descent; grounded clips share the contact pivot.",
        "rawPreserved": True, "sources": sources, "runtimeFormat": "image/webp", "encoding": "lossless-rgba",
        "normalized": public_path(paths["normalized"]), "normalizedSha256": _pipeline.sha256(paths["normalized"]),
        "preview": public_path(paths["preview"]), "previewSha256": _pipeline.sha256(paths["preview"]),
        "placements": placements, "validation": validation,
    }
    paths["metadata"].write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    return metadata


def check_all() -> dict:
    paths = combined_paths()
    metadata = json.loads(paths["metadata"].read_text(encoding="utf-8"))
    for source in metadata["sources"]:
        if _pipeline.sha256(ROOT / source["path"].lstrip("/")) != source["sha256"]:
            raise ValueError("Source provenance checksum differs.")
    for kind in ("normalized", "preview"):
        if _pipeline.sha256(paths[kind]) != metadata[f"{kind}Sha256"]:
            raise ValueError(f"Combined {kind} provenance checksum differs.")
    with Image.open(paths["normalized"]) as atlas:
        if validate_atlas(atlas, rows=ROWS * len(CLIP_ORDER)) != metadata["validation"]:
            raise ValueError("Combined cell validation differs from provenance.")
        for ordinal, clip in enumerate(CLIP_ORDER):
            clip_metadata = check_clip(clip)
            if clip_metadata["scaleScope"] != "all-four-clips" or clip_metadata["scale"] != metadata["scale"]:
                raise ValueError(f"{clip}: clip scale diverges from combined atlas.")
            with Image.open(clip_paths(clip)["normalized"]) as clip_atlas:
                expected = atlas.crop((0, ordinal * ROWS * CELL, COLUMNS * CELL, (ordinal + 1) * ROWS * CELL)).convert("RGBA")
                if clip_atlas.convert("RGBA").tobytes() != expected.tobytes():
                    raise ValueError(f"{clip}: standalone clip differs from combined atlas pixels.")
    return metadata


def check_clip(clip: str) -> dict:
    paths = clip_paths(clip)
    metadata = json.loads(paths["metadata"].read_text(encoding="utf-8"))
    for kind, key in (("source", "rawSha256"), ("normalized", "normalizedSha256"), ("preview", "previewSha256")):
        if _pipeline.sha256(paths[kind]) != metadata[key]:
            raise ValueError(f"{clip}: {kind} checksum differs from the recorded provenance.")
    with Image.open(paths["normalized"]) as atlas:
        validation = validate_atlas(atlas)
    if validation != metadata["validation"]:
        raise ValueError(f"{clip}: per-cell validation differs from provenance.")
    with Image.open(paths["preview"]) as preview:
        if preview.n_frames != COLUMNS * ROWS:
            raise ValueError(f"{clip}: preview does not contain eight frames.")
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--clip", choices=tuple(CLIP_FPS))
    mode.add_argument("--all", action="store_true", help="Pack all four authored clips with one shared scale into a 4x8 atlas")
    parser.add_argument("--check", action="store_true", help="Check recorded hashes and cell quality without changing files")
    args = parser.parse_args()
    metadata = (check_all() if args.check else process_all()) if args.all else (check_clip(args.clip) if args.check else process_clip(args.clip))
    print(json.dumps({
        "clip": "all" if args.all else args.clip,
        "normalized": metadata["normalized"],
        "frameCount": metadata["validation"]["uniqueFrameCount"],
        "findings": metadata["validation"]["findings"],
        "bounds": [cell["alphaBounds"] for cell in metadata["validation"]["cells"]],
        "scale": metadata["placements"][0]["scale"],
    }, indent=2))


if __name__ == "__main__":
    main()
