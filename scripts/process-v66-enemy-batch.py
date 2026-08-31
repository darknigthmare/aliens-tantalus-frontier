"""Normalize authored V66 enemy batches without generating or redrawing images.

Every clip is an eight-pose 4x2 source. All clips of a profile share one physical
scale and one pivot. Native alpha is retained; opaque magenta masters use the
V65 border-connected matte key. Acceptance remains a separate visual decision.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

from v64_sprite_cell_quality import analyze_v64_cells

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json"
ANCHOR_REVIEW_PATH = "docs/references/V66_BATCH_001_ANCHOR_REVIEW.json"  # Legacy pilot path; retained for callers/tests.
ENCLOSED_MATTE_METHOD = "strict-exterior-matched-magenta-v1"
ENCLOSED_MATTE_THRESHOLDS = {"minimumRedBlue": 190, "maximumGreen": 60, "minimumChroma": 150, "maximumRedBlueDifference": 32, "maximumReferenceChannelDistance": 24}
ENCLOSED_AA_THRESHOLDS = {"minimumRedBlue": 35, "minimumChroma": 20, "maximumRedBlueDifference": 32, "maximumSourceRadius": 2}
_spec = importlib.util.spec_from_file_location("v65_enemy_batch_base", Path(__file__).with_name("process-v65-enemy-profile-art.py"))
if _spec is None or _spec.loader is None:
    raise ImportError("V65 normalization primitives are unavailable.")
_pipeline = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = _pipeline
_spec.loader.exec_module(_pipeline)


def scoped_path(root: Path, value: str) -> Path:
    if not isinstance(value, str) or not value or "\\" in value or Path(value).is_absolute():
        raise ValueError(f"Expected repository-relative path: {value}")
    candidate = (root / value).resolve()
    if not candidate.is_relative_to(root.resolve()):
        raise ValueError(f"Path escapes repository: {value}")
    return candidate


def hash_file(path: Path) -> str:
    return _pipeline.sha256(path)


def json_write(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")


def source_matte_masks(rgba: np.ndarray, native_alpha: bool, remove_enclosed_magenta_matte: bool = False, remove_enclosed_magenta_aa_fringe: bool = False) -> tuple[np.ndarray, np.ndarray, dict]:
    """Key only proven matte colors; never fill holes or invent anatomy.

    The opt-in interior key requires an exact high-chroma color match to the
    existing exterior matte. Pink flesh, blue light and darker purple remain
    untouched. Native-alpha sources bypass every color key, even when enabled.
    """
    if remove_enclosed_magenta_aa_fringe and not remove_enclosed_magenta_matte:
        raise ValueError("Enclosed AA fringe removal requires the explicit strict magenta core option.")
    empty = np.zeros(rgba.shape[:2], dtype=bool)
    exterior = empty if native_alpha else _pipeline.border_connected_magenta(rgba[..., :3])
    enclosed = empty.copy()
    core = empty.copy()
    fringe = empty.copy()
    reference = None
    if remove_enclosed_magenta_matte and not native_alpha:
        if int(exterior.sum()) < exterior.size * 0.10:
            raise ValueError("Enclosed matte removal requires proven exterior magenta matte.")
        working = rgba[..., :3].astype(np.int16)
        red, green, blue = working[..., 0], working[..., 1], working[..., 2]
        strict = (np.minimum(red, blue) >= ENCLOSED_MATTE_THRESHOLDS["minimumRedBlue"]) & (green <= ENCLOSED_MATTE_THRESHOLDS["maximumGreen"]) & (np.minimum(red, blue) - green >= ENCLOSED_MATTE_THRESHOLDS["minimumChroma"]) & (np.abs(red - blue) <= ENCLOSED_MATTE_THRESHOLDS["maximumRedBlueDifference"])
        proven = strict & exterior
        if int(proven.sum()) < max(64, int(exterior.size * 0.01)):
            raise ValueError("Enclosed matte removal has no sufficiently strong exterior color reference.")
        reference = np.median(working[proven], axis=0).astype(np.int16)
        matched = np.max(np.abs(working - reference), axis=2) <= ENCLOSED_MATTE_THRESHOLDS["maximumReferenceChannelDistance"]
        core = strict & matched & ~exterior & (rgba[..., 3] > 0)
        enclosed = core.copy()
        if remove_enclosed_magenta_aa_fringe:
            soft = (np.minimum(red, blue) >= ENCLOSED_AA_THRESHOLDS["minimumRedBlue"]) & (np.minimum(red, blue) - green >= ENCLOSED_AA_THRESHOLDS["minimumChroma"]) & (np.abs(red - blue) <= ENCLOSED_AA_THRESHOLDS["maximumRedBlueDifference"])
            # Bounded eight-neighbour expansion from the proven enclosed core.
            # Two iterations mean <=2 source pixels, never a global flood fill.
            for _ in range(ENCLOSED_AA_THRESHOLDS["maximumSourceRadius"]):
                padded = np.pad(enclosed, 1, mode="constant")
                adjacent = np.zeros_like(enclosed)
                for dy in range(3):
                    for dx in range(3):
                        adjacent |= padded[dy:dy + enclosed.shape[0], dx:dx + enclosed.shape[1]]
                enclosed |= adjacent & soft & ~exterior & (rgba[..., 3] > 0)
            fringe = enclosed & ~core
    ys, xs = np.where(enclosed)
    coordinates = np.column_stack((xs, ys)).astype("<i4")
    proof = {"requested": bool(remove_enclosed_magenta_matte), "applied": bool(remove_enclosed_magenta_matte and not native_alpha),
             "aaFringeRequested": bool(remove_enclosed_magenta_aa_fringe), "aaFringeApplied": bool(remove_enclosed_magenta_aa_fringe and not native_alpha),
             "aaThresholds": ENCLOSED_AA_THRESHOLDS, "strictCorePixelCount": int(core.sum()), "aaFringePixelCount": int(fringe.sum()),
             "strictCoreMaskSha256": hashlib.sha256(np.packbits(core).tobytes()).hexdigest(), "aaFringeMaskSha256": hashlib.sha256(np.packbits(fringe).tobytes()).hexdigest(),
             "method": ENCLOSED_MATTE_METHOD, "nativeAlphaPreserved": bool(native_alpha), "sourceSize": [rgba.shape[1], rgba.shape[0]],
             "thresholds": ENCLOSED_MATTE_THRESHOLDS, "referenceRgb": reference.tolist() if reference is not None else None,
             "removedPixelCount": int(enclosed.sum()), "removedCoordinatesSha256": hashlib.sha256(coordinates.tobytes()).hexdigest(),
             "removedRgbaSha256": hashlib.sha256(rgba[enclosed].tobytes()).hexdigest(),
             "sourceRgbaSha256": hashlib.sha256(rgba.tobytes()).hexdigest(), "recoloredPixels": 0, "inpaintedPixels": 0}
    return exterior, enclosed, proof


def source_matte_proof(source: Image.Image, remove_enclosed_magenta_matte: bool = False, remove_enclosed_magenta_aa_fringe: bool = False) -> dict:
    rgba = np.array(source.convert("RGBA"), dtype=np.uint8)
    has_alpha = "A" in source.getbands() or "transparency" in source.info
    native_alpha = has_alpha and int(rgba[..., 3].min()) < 255
    return source_matte_masks(rgba, native_alpha, remove_enclosed_magenta_matte, remove_enclosed_magenta_aa_fringe)[2]


def matte_proof_summary(sources: list[dict], enabled: bool, aa_fringe_enabled: bool = False) -> dict:
    proofs = [{"clip": source["clip"], "proof": source["enclosedMagentaMatte"]} for source in sources]
    return {"enabled": enabled, "aaFringeEnabled": aa_fringe_enabled, "method": ENCLOSED_MATTE_METHOD,
            "strictCorePixelCount": sum(item["proof"]["strictCorePixelCount"] for item in proofs),
            "aaFringePixelCount": sum(item["proof"]["aaFringePixelCount"] for item in proofs),
            "removedPixelCount": sum(item["proof"]["removedPixelCount"] for item in proofs),
            "sourceProofSha256": hashlib.sha256(json.dumps(proofs, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()}


def extract_cell(source: Image.Image, box: tuple[int, int, int, int], native_alpha: bool, remove_enclosed_magenta_matte: bool = False, enclosed_mask: np.ndarray | None = None, remove_enclosed_magenta_aa_fringe: bool = False) -> tuple[Image.Image, dict]:
    rgba = np.array(source.crop(box).convert("RGBA"), dtype=np.uint8)
    matte_count = 0
    if native_alpha:
        mode = "native-alpha-preserved"
    else:
        if enclosed_mask is None:
            exterior, enclosed, _ = source_matte_masks(rgba, native_alpha, remove_enclosed_magenta_matte, remove_enclosed_magenta_aa_fringe)
        else:
            if enclosed_mask.shape != rgba.shape[:2]:
                raise ValueError("Source-cell enclosed matte mask dimensions differ.")
            exterior, enclosed = _pipeline.border_connected_magenta(rgba[..., :3]), enclosed_mask
        matte = exterior | enclosed
        matte_count = int(matte.sum())
        if matte_count < rgba.shape[0] * rgba.shape[1] * 0.10:
            raise ValueError("Opaque source has no proven magenta matte. Supply true alpha or regenerate; no guessed background removal.")
        rgba[matte] = 0
        mode = "v65-border-connected-magenta-key"
    foreground = rgba[..., 3] > 0
    ys, xs = np.where(foreground)
    if xs.size < 64:
        raise ValueError(f"Empty or implausibly small source pose at {box}.")
    # Do not discard detached anatomy or silently move fragments between poses.
    if foreground[0].any() or foreground[-1].any() or foreground[:, 0].any() or foreground[:, -1].any():
        raise ValueError(f"Authored pose touches cell border at {box}; ownership/cropping needs visual review or regeneration.")
    bounds = [max(0, int(xs.min()) - 3), max(0, int(ys.min()) - 3), min(rgba.shape[1], int(xs.max()) + 4), min(rgba.shape[0], int(ys.max()) + 4)]
    rgba[rgba[..., 3] == 0, :3] = 0
    cropped = rgba[bounds[1]:bounds[3], bounds[0]:bounds[2]].copy()
    return Image.fromarray(cropped, "RGBA"), {
        "sourceCell": list(box), "sourceBounds": bounds, "sourceSize": [bounds[2] - bounds[0], bounds[3] - bounds[1]],
        "foregroundPixels": int(xs.size), "mattePixels": matte_count, "alphaProcessing": mode,
        "discardedForegroundPixels": 0, "sourcePoseRgbaSha256": hashlib.sha256(cropped.tobytes()).hexdigest(),
    }


def extract_globally_connected_cells(source: Image.Image, clip_id: str, x_edges: list[int], y_edges: list[int], native_alpha: bool, remove_enclosed_magenta_matte: bool = False, remove_enclosed_magenta_aa_fringe: bool = False) -> tuple[list[Image.Image], list[dict]]:
    """Reassign only proven, short, connected cell spill; never redraw pixels.

    A component must have >=90% of its pixels in one cell and extend at most
    15% of a cell dimension across a boundary. A component spanning subjects,
    or any foreground touching the outer board border, remains a hard error.
    """
    rgba = np.array(source.convert("RGBA"), dtype=np.uint8)
    if not native_alpha:
        exterior, enclosed, _ = source_matte_masks(rgba, native_alpha, remove_enclosed_magenta_matte, remove_enclosed_magenta_aa_fringe)
        matte = exterior | enclosed
        if int(matte.sum()) < rgba.shape[0] * rgba.shape[1] * 0.10:
            raise ValueError("Opaque source has no proven magenta matte.")
        rgba[matte] = 0
    rgba[rgba[..., 3] == 0, :3] = 0
    foreground = rgba[..., 3] > 0
    if foreground[0].any() or foreground[-1].any() or foreground[:, 0].any() or foreground[:, -1].any():
        raise ValueError("Authored foreground touches the outer source border; pixels may be cropped.")
    columns, rows = len(x_edges) - 1, len(y_edges) - 1
    owners = np.full(foreground.shape, -1, dtype=np.int16)
    transfers = {index: [] for index in range(columns * rows)}
    for component in _pipeline.connected_components(foreground):
        mask = _pipeline.component_mask(foreground.shape, [component])
        ys, xs = np.where(mask)
        cells = np.searchsorted(y_edges[1:], ys, side="right") * columns + np.searchsorted(x_edges[1:], xs, side="right")
        counts = np.bincount(cells, minlength=columns * rows)
        owner = int(counts.argmax())
        box = (x_edges[owner % columns], y_edges[owner // columns], x_edges[owner % columns + 1], y_edges[owner // columns + 1])
        if np.count_nonzero(counts) > 1:
            max_x = max(8, round((box[2] - box[0]) * 0.15))
            max_y = max(8, round((box[3] - box[1]) * 0.15))
            if counts[owner] / component.area < 0.90 or component.left < box[0] - max_x or component.right > box[2] + max_x or component.top < box[1] - max_y or component.bottom > box[3] + max_y:
                raise ValueError("Cross-cell component has ambiguous ownership or spans multiple authored subjects.")
            spill = cells != owner
            transfers[owner].append({"ownerCell": owner, "fromCells": [int(index) for index in np.flatnonzero(counts) if index != owner],
                "pixels": int(spill.sum()), "componentPixels": component.area, "ownerShare": round(float(counts[owner] / component.area), 6),
                "sourceBoundsGlobal": [component.left, component.top, component.right, component.bottom],
                "rgbaSha256": hashlib.sha256(rgba[ys[spill], xs[spill]].tobytes()).hexdigest(), "pixelValuesPreserved": True,
                "ownershipEvidence": "single eight-connected component; >=90% owner cell; <=15% cell-boundary excursion"})
        owners[mask] = owner
    frames, reports = [], []
    for index in range(columns * rows):
        mask = owners == index
        ys, xs = np.where(mask)
        if xs.size < 64:
            raise ValueError(f"Cell {index} has no complete authored subject.")
        box = [x_edges[index % columns], y_edges[index // columns], x_edges[index % columns + 1], y_edges[index // columns + 1]]
        bounds = [max(0, int(xs.min()) - 3), max(0, int(ys.min()) - 3), min(source.width, int(xs.max()) + 4), min(source.height, int(ys.max()) + 4)]
        local = rgba[bounds[1]:bounds[3], bounds[0]:bounds[2]].copy()
        local_mask = mask[bounds[1]:bounds[3], bounds[0]:bounds[2]]
        local[~local_mask] = 0
        if not np.array_equal(local[local_mask], rgba[ys, xs]):
            raise ValueError("Global cell ownership changed authored source pixels.")
        frames.append(Image.fromarray(local, "RGBA"))
        reports.append({"clip": clip_id, "clipFrame": index, "sourceRow": index // columns, "sourceCell": box,
            "sourceBounds": [bounds[0] - box[0], bounds[1] - box[1], bounds[2] - box[0], bounds[3] - box[1]],
            "sourceGlobalBounds": bounds, "sourceSize": [bounds[2] - bounds[0], bounds[3] - bounds[1]], "foregroundPixels": int(xs.size),
            "alphaProcessing": "native-alpha-preserved" if native_alpha else "v65-border-connected-magenta-key",
            "discardedForegroundPixels": 0, "sourcePoseRgbaSha256": hashlib.sha256(local.tobytes()).hexdigest(),
            "sourceOwnershipTransfers": transfers[index]})
    if sum(report["foregroundPixels"] for report in reports) != int(foreground.sum()):
        raise ValueError("Source pixel ownership is not conserved.")
    return frames, reports


def split_source(source: Image.Image, clip_id: str, source_grid: dict, allow_cell_reassignment: bool = False, remove_enclosed_magenta_matte: bool = False, remove_enclosed_magenta_aa_fringe: bool = False) -> tuple[list[Image.Image], list[dict]]:
    columns, rows = source_grid["columns"], source_grid["rows"]
    if remove_enclosed_magenta_aa_fringe and not remove_enclosed_magenta_matte:
        raise ValueError("Enclosed AA fringe removal requires the explicit strict magenta core option.")
    if columns != 4 or rows != 2 or source_grid.get("frameCount") != 8:
        raise ValueError("V66 authored sources require exactly eight poses in a 4x2 grid.")
    if source.width != source.height * 2:
        raise ValueError(f"A 4x2 source must have exact 2:1 proportions, got {source.size}.")
    if source.width < 256:
        raise ValueError("Source resolution is insufficient for eight authored poses.")
    has_alpha = "A" in source.getbands() or "transparency" in source.info
    native_alpha = has_alpha and source.convert("RGBA").getchannel("A").getextrema()[0] < 255
    x_edges = [round(index * source.width / columns) for index in range(columns + 1)]
    y_edges = [round(index * source.height / rows) for index in range(rows + 1)]
    if allow_cell_reassignment:
        return extract_globally_connected_cells(source, clip_id, x_edges, y_edges, native_alpha, remove_enclosed_magenta_matte, remove_enclosed_magenta_aa_fringe)
    # Use the full-sheet color reference even with independent cell extraction;
    # source provenance must describe the exact mask applied, not eight local
    # approximations that could disagree near a threshold on an uneven matte.
    enclosed_sheet = source_matte_masks(np.array(source.convert("RGBA"), dtype=np.uint8), native_alpha, True, remove_enclosed_magenta_aa_fringe)[1] if remove_enclosed_magenta_matte and not native_alpha else None
    frames, reports = [], []
    for row in range(rows):
        for column in range(columns):
            box = (x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])
            local_enclosed = enclosed_sheet[box[1]:box[3], box[0]:box[2]] if enclosed_sheet is not None else None
            frame, report = extract_cell(source, box, native_alpha, remove_enclosed_magenta_matte, local_enclosed, remove_enclosed_magenta_aa_fringe)
            frames.append(frame)
            reports.append({"clip": clip_id, "clipFrame": row * columns + column, "sourceRow": row, **report})
    return frames, reports


def atlas_frames(atlas: Image.Image, grid: dict) -> list[Image.Image]:
    width, height, columns, rows = grid["cellWidth"], grid["cellHeight"], grid["columns"], grid["rows"]
    return [atlas.crop(((index % columns) * width, (index // columns) * height, (index % columns + 1) * width, (index // columns + 1) * height)) for index in range(columns * rows)]


def finite_pair(value: object, label: str) -> tuple[float, float]:
    if not isinstance(value, (list, tuple)) or len(value) != 2 or any(not isinstance(item, (int, float)) or isinstance(item, bool) or not math.isfinite(item) for item in value):
        raise ValueError(f"{label} must be two finite source coordinates.")
    return float(value[0]), float(value[1])


def batch_anchor_review_path(job: dict) -> str:
    """Keep physical review evidence isolated to its exact production batch."""
    batch_id = job.get("batchId")
    match = re.fullmatch(r"batch-([0-9]{3})", batch_id) if isinstance(batch_id, str) else None
    if match is None or int(match.group(1)) == 0:
        raise ValueError("Physical anchor review requires a valid batch-NNN identifier.")
    return f"docs/references/V66_BATCH_{match.group(1)}_ANCHOR_REVIEW.json"


def reviewed_source_anchors(job: dict, reports: list[dict], sources: list[dict], root: Path = ROOT) -> tuple[list[dict] | None, dict]:
    """Load only complete, individually reviewed physical roots; never guess them.

    Coordinates are relative to the nominal source cell, not the cropped pose.
    Thus a short, proven component spill keeps exactly the same physical root.
    Unmeasured profiles remain explicit pending work, not automatic approvals.
    """
    review_path = batch_anchor_review_path(job)
    path = scoped_path(root, review_path)
    if not path.is_file():
        return None, {"status": "pending", "reason": "No source-anchor review file."}
    document = json.loads(path.read_text(encoding="utf-8"))
    proof = {"path": review_path, "sha256": hash_file(path), "status": "pending"}
    if document.get("schema") != 1 or document.get("coordinates") != "nominal-source-cell":
        raise ValueError("Unsupported source-anchor review schema or coordinate system.")
    entry = document.get("profiles", {}).get(job["profileId"])
    if document.get("batchId") != job["batchId"] or not entry or entry.get("status") != "reviewed":
        return None, {**proof, "reason": "Profile anchors have not all been physically reviewed."}
    if not entry.get("reviewer") or not entry.get("reviewedAt") or not entry.get("method"):
        raise ValueError("Reviewed physical anchors require an explicit reviewer, date and measurement method.")
    clip_entries = entry.get("clips", {})
    if set(clip_entries) != {source["clip"] for source in sources}:
        raise ValueError("Reviewed physical anchors must cover every source clip exactly once.")
    by_key = {}
    for source in sources:
        clip = clip_entries[source["clip"]]
        if clip.get("sourceSha256") != source["sha256"] or clip.get("sourceSize") != source["size"]:
            raise ValueError(f"Source-anchor evidence changed for {source['clip']}.")
        values = clip.get("frames", [])
        expected = [report["clipFrame"] for report in reports if report["clip"] == source["clip"]]
        indices = [value.get("frame") for value in values]
        if any(not isinstance(index, int) or isinstance(index, bool) for index in indices) or sorted(indices) != sorted(expected) or len(set(indices)) != len(indices):
            raise ValueError("Reviewed physical anchors must cover every authored pose exactly once.")
        for value in values:
            anchor = finite_pair(value.get("anchor"), "Physical anchor")
            landmark = finite_pair(value.get("landmark"), "Reviewed body landmark")
            if value.get("reviewed") is not True or not value.get("evidence") or value.get("confidence") not in ("high", "medium"):
                raise ValueError("Every physical anchor needs individual visual evidence and review confidence.")
            report = next(report for report in reports if report["clip"] == source["clip"] and report["clipFrame"] == value["frame"])
            cell_width = report["sourceCell"][2] - report["sourceCell"][0]
            cell_height = report["sourceCell"][3] - report["sourceCell"][1]
            if not (-0.15 * cell_width <= anchor[0] <= 1.15 * cell_width and -0.15 * cell_height <= anchor[1] <= 1.15 * cell_height):
                raise ValueError("Physical anchor is outside the reviewed cell/short-spill coordinate envelope.")
            bounds = report["sourceBounds"]
            if not (bounds[0] <= landmark[0] <= bounds[2] and bounds[1] <= landmark[1] <= bounds[3]):
                raise ValueError("Reviewed body landmark lies outside its complete source pose.")
            by_key[(source["clip"], value["frame"])] = value
    return [by_key[(report["clip"], report["clipFrame"])] for report in reports], {
        **proof, "status": "reviewed", "reviewer": entry["reviewer"], "reviewedAt": entry["reviewedAt"],
        "method": entry["method"], "reviewedPoseCount": len(reports), "coordinates": "nominal-source-cell",
    }


def normalize_frames(frames: list[Image.Image], reports: list[dict], grid: dict, pivot: dict, source_scale_by_clip: dict | None = None, source_anchors: list[dict] | None = None) -> tuple[Image.Image, list[dict]]:
    width, height, columns, rows, guard = (grid[key] for key in ("cellWidth", "cellHeight", "columns", "rows", "guard"))
    if not all(isinstance(value, int) and value > 0 for value in (width, height, columns, rows, guard)):
        raise ValueError("Grid dimensions must be positive integers.")
    if len(frames) != len(reports) or len(frames) != rows * columns:
        raise ValueError("Dynamic atlas grid must contain every authored pose exactly once.")
    if not (guard <= pivot["x"] <= width - guard and guard < pivot["y"] <= height - guard):
        raise ValueError("The shared pivot must remain within the guarded cell.")
    maximum_width = 2 * min(pivot["x"] - guard, width - guard - pivot["x"])
    maximum_height = pivot["y"] - guard
    calibration = source_scale_by_clip or {}
    source_scales = [calibration.get(report["clip"], 1.0) for report in reports]
    if any(not isinstance(value, (int, float)) or isinstance(value, bool) or not math.isfinite(value) or value <= 0 for value in source_scales):
        raise ValueError("Source scale calibration must contain finite positive factors.")
    if set(calibration) - {report["clip"] for report in reports}:
        raise ValueError("Source calibration refers to an unknown clip.")
    offsets = None
    if source_anchors is not None:
        if len(source_anchors) != len(frames):
            raise ValueError("Physical anchor count must match every authored pose.")
        offsets = []
        limits = [1.0]
        available = (pivot["x"] - guard, width - guard - pivot["x"], pivot["y"] - guard, height - guard - pivot["y"])
        for frame, report, factor, reviewed in zip(frames, reports, source_scales, source_anchors):
            anchor_x, anchor_y = finite_pair(reviewed.get("anchor"), "Physical anchor")
            offset_x, offset_y = anchor_x - report["sourceBounds"][0], anchor_y - report["sourceBounds"][1]
            offsets.append((offset_x, offset_y))
            for extent, space in zip((offset_x, frame.width - offset_x, offset_y, frame.height - offset_y), available):
                if extent > 0:
                    if space <= 0:
                        raise ValueError("Physical anchor leaves no guarded space for complete source pixels; review the measured floor/root.")
                    # Reserve one pixel for integer resize/placement rounding.
                    limits.append(max(0.5, space - 1) / (extent * factor))
        scale = min(limits)
    else:
        scale = min(1.0, maximum_width / max(frame.width * factor for frame, factor in zip(frames, source_scales)), maximum_height / max(frame.height * factor for frame, factor in zip(frames, source_scales)))
    atlas = Image.new("RGBA", (columns * width, rows * height), (0, 0, 0, 0))
    placements = []
    for index, (frame, report, source_scale) in enumerate(zip(frames, reports, source_scales)):
        applied_scale = scale * source_scale
        target_width, target_height = max(1, round(frame.width * applied_scale)), max(1, round(frame.height * applied_scale))
        resized = frame.resize((target_width, target_height), Image.Resampling.LANCZOS)
        pixels = np.array(resized, dtype=np.uint8)
        # Native alpha anatomy/colors are not subjected to the magenta despill.
        if report["alphaProcessing"] != "native-alpha-preserved":
            pixels = _pipeline.remove_edge_spill(pixels)
        pixels[pixels[..., 3] == 0, :3] = 0
        resized = Image.fromarray(pixels, "RGBA")
        if offsets is None:
            x, y = round(pivot["x"] - target_width / 2), pivot["y"] - target_height
            anchor_fields = {"anchorStatus": "pending-body-root-review", "anchorMethod": "legacy-bounds-center-bottom"}
        else:
            # Use the exact rounded resize ratio, not the pre-rounding float:
            # the measured root stays on the same output pixel to within 0.5 px.
            offset_x, offset_y = offsets[index]
            mapped_offset = (offset_x * target_width / frame.width, offset_y * target_height / frame.height)
            x, y = round(pivot["x"] - mapped_offset[0]), round(pivot["y"] - mapped_offset[1])
            anchor_fields = {"anchorStatus": "reviewed-physical-root", "anchorMethod": "measured-source-body-landmark",
                "sourceAnchor": list(source_anchors[index]["anchor"]), "sourceLandmark": list(source_anchors[index]["landmark"]),
                "sourceAnchorEvidence": source_anchors[index]["evidence"], "sourceAnchorConfidence": source_anchors[index]["confidence"],
                "anchorOffsetInCroppedSource": [offset_x, offset_y], "renderedAnchor": [x + mapped_offset[0], y + mapped_offset[1]]}
        if x < guard or y < guard or x + target_width > width - guard or y + target_height > height - guard:
            raise ValueError("Rounded physical-root placement violates atlas guard; no authored pixels were clipped.")
        atlas.alpha_composite(resized, ((index % columns) * width + x, (index // columns) * height + y))
        placements.append({**report, **anchor_fields, "index": index, "scale": round(scale, 9), "sourceScale": source_scale, "appliedScale": round(applied_scale, 9), "renderedBounds": [x, y, x + target_width, y + target_height]})
    pixels = np.array(atlas, dtype=np.uint8)
    pixels[pixels[..., 3] == 0, :3] = 0
    return Image.fromarray(pixels, "RGBA"), placements


def validate_atlas(atlas: Image.Image, grid: dict) -> dict:
    expected_size = (grid["columns"] * grid["cellWidth"], grid["rows"] * grid["cellHeight"])
    if atlas.size != expected_size:
        raise ValueError(f"Atlas has wrong dimensions: {atlas.size}, expected {expected_size}.")
    rgba = atlas.convert("RGBA")
    report = analyze_v64_cells(rgba, columns=grid["columns"], rows=grid["rows"], guard=grid["guard"])
    if report["findings"]:
        raise ValueError("; ".join(finding["message"] for finding in report["findings"]))
    pixels = np.asarray(rgba)
    if np.any(pixels[pixels[..., 3] == 0, :3]):
        raise ValueError("Hidden RGB remains under transparent pixels.")
    hashes = [hashlib.sha256(frame.tobytes()).hexdigest() for frame in atlas_frames(rgba, grid)]
    if len(set(hashes)) != len(hashes):
        raise ValueError("Duplicated authored poses detected; cannot count repeated frames as new animation.")
    return {**report, "uniqueFrameCount": len(set(hashes)), "cellRgbaSha256": hashes, "visualFidelityCertified": False}


def save_lossless(atlas: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(path, format="WEBP", lossless=True, method=6, exact=True)
    with Image.open(path) as persisted:
        if persisted.convert("RGBA").tobytes() != atlas.convert("RGBA").tobytes():
            raise ValueError("Lossless WebP changed normalized RGBA pixels.")


def save_preview(atlas: Image.Image, path: Path, grid: dict, fps: int, loop: bool) -> None:
    frames = []
    for frame in atlas_frames(atlas, grid):
        background = Image.new("RGBA", frame.size, (8, 14, 18, 255))
        background.alpha_composite(frame)
        frames.append(background.convert("RGB"))
    path.parent.mkdir(parents=True, exist_ok=True)
    options = {"loop": 0} if loop else {}
    frames[0].save(path, format="GIF", save_all=True, append_images=frames[1:], duration=max(10, round(1000 / fps / 10) * 10), disposal=2, optimize=False, **options)
    with Image.open(path) as persisted:
        if persisted.n_frames != len(frames):
            raise ValueError("Preview lost authored frames.")


def process_profile(job: dict, root: Path = ROOT, allow_cell_reassignment: bool = False, remove_enclosed_magenta_matte: bool = False, remove_enclosed_magenta_aa_fringe: bool = False) -> dict:
    if not job.get("reference") or job["reference"].get("status") != "reviewed":
        raise ValueError(f'{job["profileId"]}: reviewed design references are required before normalization.')
    frames, reports, sources = [], [], []
    for clip in job["clips"]:
        source_path = scoped_path(root, clip["sourcePath"])
        original_hash = hash_file(source_path)
        with Image.open(source_path) as source:
            clip_frames, clip_reports = split_source(source, clip["id"], job["sourceGrid"], allow_cell_reassignment, remove_enclosed_magenta_matte, remove_enclosed_magenta_aa_fringe)
            sources.append({"clip": clip["id"], "path": clip["sourcePath"], "sha256": original_hash, "size": list(source.size), "mode": source.mode,
                            "promptSha256": clip["promptSha256"], "referenceLockSha256": job["referenceLockSha256"],
                            "enclosedMagentaMatte": source_matte_proof(source, remove_enclosed_magenta_matte, remove_enclosed_magenta_aa_fringe)})
        frames.extend(clip_frames)
        reports.extend(clip_reports)
    if len({tuple(source["size"]) for source in sources}) != 1:
        raise ValueError("All clips of a profile must share source resolution; mixed physical scales need visual review.")
    source_scale_by_clip = job["reference"].get("sourceScaleByClip", {})
    calibration_review = job["reference"].get("scaleCalibrationReview")
    calibration_evidence = []
    if source_scale_by_clip:
        if not calibration_review or not calibration_review.get("note") or not calibration_review.get("reviewer") or not calibration_review.get("reviewedAt") or not calibration_review.get("evidencePaths"):
            raise ValueError("Manual source scale changes require an explicit measurement review and evidence.")
        calibration_evidence = [{"path": path, "sha256": hash_file(scoped_path(root, path))} for path in calibration_review["evidencePaths"]]
    source_anchors, anchor_review = reviewed_source_anchors(job, reports, sources, root)
    atlas, placements = normalize_frames(frames, reports, job["grid"], job["pivot"], source_scale_by_clip, source_anchors)
    validation = validate_atlas(atlas, job["grid"])
    atlas_path = scoped_path(root, job["normalizedPath"])
    save_lossless(atlas, atlas_path)
    save_preview(atlas, scoped_path(root, job["previewPath"]), job["grid"], 10, True)
    clips = []
    for ordinal, clip in enumerate(job["clips"]):
        clip_grid = {**job["grid"], "rows": 2}
        offset = ordinal * 2 * job["grid"]["cellHeight"]
        local = atlas.crop((0, offset, atlas.width, offset + 2 * job["grid"]["cellHeight"]))
        validate_atlas(local, clip_grid)
        clip_path = scoped_path(root, clip["normalizedPath"])
        save_lossless(local, clip_path)
        save_preview(local, scoped_path(root, clip["previewPath"]), clip_grid, clip["fps"], clip["loop"])
        clips.append({"id": clip["id"], "frames": clip["frames"], "fps": clip["fps"], "loop": clip["loop"], "path": clip["normalizedPath"],
                      "sha256": hash_file(clip_path), "previewPath": clip["previewPath"], "previewSha256": hash_file(scoped_path(root, clip["previewPath"]))})
    for source in sources:
        if hash_file(scoped_path(root, source["path"])) != source["sha256"]:
            raise ValueError("Source changed during normalization.")
    metadata = {"schema": 1, "release": "v66", "profileId": job["profileId"], "subject": job["name"], "batchId": job["batchId"],
        "generatedBy": "scripts/process-v66-enemy-batch.py", "generationProvider": "OpenAI ImageGen", "normalizationStatus": "validated",
        "acceptanceStatus": "pending-visual-review", "runtimeIntegrated": False, "canonExact": False,
        "promptProvenance": "Source prompt hashes identify the production contract; actual ImageGen prompts are separately preserved in the production state.",
        "referenceUrls": job["reference"]["urls"], "referenceLockSha256": job["referenceLockSha256"],
        "animationFamily": job["animationFamily"], "grid": job["grid"], "pivot": job["pivot"], "sourceFacing": job["sourceFacing"],
        "normalized": job["normalizedPath"], "normalizedSha256": hash_file(atlas_path), "preview": job["previewPath"],
        "previewSha256": hash_file(scoped_path(root, job["previewPath"])), "runtimeFormat": "image/webp", "encoding": "lossless-rgba",
        "scale": placements[0]["scale"], "scaleScope": "all-profile-clips", "scaleInterpretation": "single-final-pack-scale",
        "sourceScaleByClip": {clip["id"]: source_scale_by_clip.get(clip["id"], 1.0) for clip in job["clips"]},
        "scaleCalibrationReview": calibration_review, "scaleCalibrationEvidence": calibration_evidence,
        "physicalAnchorReview": anchor_review,
        "normalizationOptions": {"safeReassignCellFragments": allow_cell_reassignment, "removeEnclosedMagentaMatte": remove_enclosed_magenta_matte, "removeEnclosedMagentaAaFringe": remove_enclosed_magenta_aa_fringe},
        "enclosedMagentaMatte": matte_proof_summary(sources, remove_enclosed_magenta_matte, remove_enclosed_magenta_aa_fringe),
        "rawPreserved": True, "interpolatedFrames": 0, "duplicatedFrames": 0,
        "frameCount": len(frames), "sources": sources, "clips": clips, "placements": placements, "validation": validation}
    json_write(scoped_path(root, job["metadataPath"]), metadata)
    return metadata


def check_profile(job: dict, root: Path = ROOT, remove_enclosed_magenta_matte: bool | None = None, remove_enclosed_magenta_aa_fringe: bool | None = None) -> dict:
    metadata = json.loads(scoped_path(root, job["metadataPath"]).read_text(encoding="utf-8"))
    recorded_matte_option = metadata.get("normalizationOptions", {}).get("removeEnclosedMagentaMatte")
    recorded_aa_option = metadata.get("normalizationOptions", {}).get("removeEnclosedMagentaAaFringe")
    if not isinstance(recorded_matte_option, bool) or (remove_enclosed_magenta_matte is not None and recorded_matte_option != remove_enclosed_magenta_matte):
        raise ValueError("Explicit enclosed-magenta normalization option is missing or changed.")
    if not isinstance(recorded_aa_option, bool) or (remove_enclosed_magenta_aa_fringe is not None and recorded_aa_option != remove_enclosed_magenta_aa_fringe):
        raise ValueError("Explicit enclosed-magenta AA option is missing or changed.")
    if metadata["profileId"] != job["profileId"] or metadata["referenceLockSha256"] != job["referenceLockSha256"]:
        raise ValueError("Identity or reviewed reference changed since normalization.")
    if metadata["grid"] != job["grid"] or metadata["pivot"] != job["pivot"] or metadata["frameCount"] != len(job["clips"]) * 8:
        raise ValueError("Animation contract changed since normalization.")
    expected_calibration = {clip["id"]: job["reference"].get("sourceScaleByClip", {}).get(clip["id"], 1.0) for clip in job["clips"]}
    if metadata.get("sourceScaleByClip") != expected_calibration or metadata.get("scaleCalibrationReview") != job["reference"].get("scaleCalibrationReview"):
        raise ValueError("Reviewed inter-clip scale calibration changed.")
    _, expected_anchor_review = reviewed_source_anchors(job, metadata["placements"], metadata["sources"], root)
    if metadata.get("physicalAnchorReview") != expected_anchor_review:
        raise ValueError("Physical source-anchor review changed since normalization.")
    for evidence in metadata.get("scaleCalibrationEvidence", []):
        if hash_file(scoped_path(root, evidence["path"])) != evidence["sha256"]:
            raise ValueError("Scale measurement evidence changed after normalization.")
    if len(metadata["sources"]) != len(job["clips"]) or len(metadata["clips"]) != len(job["clips"]):
        raise ValueError("Recorded clip provenance is incomplete.")
    for clip, source in zip(job["clips"], metadata["sources"]):
        if source["clip"] != clip["id"] or source["path"] != clip["sourcePath"] or source["promptSha256"] != clip["promptSha256"] or hash_file(scoped_path(root, source["path"])) != source["sha256"]:
            raise ValueError(f'Source or prompt provenance changed for {clip["id"]}.')
        with Image.open(scoped_path(root, source["path"])) as original:
            expected_matte = source_matte_proof(original, recorded_matte_option, recorded_aa_option)
        if source.get("enclosedMagentaMatte") != expected_matte:
            raise ValueError(f'Enclosed magenta pixel evidence changed for {clip["id"]}.')
    if metadata.get("enclosedMagentaMatte") != matte_proof_summary(metadata["sources"], recorded_matte_option, recorded_aa_option):
        raise ValueError("Enclosed magenta summary does not match its source pixel evidence.")
    for key, path_key in (("normalizedSha256", "normalizedPath"), ("previewSha256", "previewPath")):
        if hash_file(scoped_path(root, job[path_key])) != metadata[key]:
            raise ValueError(f"Published normalization checksum differs: {path_key}")
    with Image.open(scoped_path(root, job["normalizedPath"])) as atlas:
        if validate_atlas(atlas, job["grid"]) != metadata["validation"]:
            raise ValueError("Stored cell validation differs from current pixels.")
        for ordinal, (clip, recorded) in enumerate(zip(job["clips"], metadata["clips"])):
            if recorded["id"] != clip["id"] or recorded["frames"] != clip["frames"] or recorded["fps"] != clip["fps"] or recorded["loop"] != clip["loop"]:
                raise ValueError("Clip semantics or timing diverged from reviewed contract.")
            if hash_file(scoped_path(root, clip["normalizedPath"])) != recorded["sha256"] or hash_file(scoped_path(root, clip["previewPath"])) != recorded["previewSha256"]:
                raise ValueError("Standalone clip checksum differs.")
            offset = ordinal * 2 * job["grid"]["cellHeight"]
            with Image.open(scoped_path(root, clip["normalizedPath"])) as local:
                if local.convert("RGBA").tobytes() != atlas.crop((0, offset, atlas.width, offset + 2 * job["grid"]["cellHeight"])).convert("RGBA").tobytes():
                    raise ValueError("Standalone clip pixels differ from combined atlas.")
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    selector = parser.add_mutually_exclusive_group(required=True)
    selector.add_argument("--profile")
    selector.add_argument("--batch")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--safe-reassign-cell-fragments", action="store_true", help="Preserve short connected spill with recorded source ownership proof; ambiguous overlap still fails")
    parser.add_argument("--remove-enclosed-magenta-matte", action="store_true", help="Opt in to strict exterior-color-matched removal of enclosed RGB magenta matte; native alpha and nonmatching colors stay untouched")
    parser.add_argument("--remove-enclosed-magenta-aa-fringe", action="store_true", help="Separately opt in to at most two source pixels of magenta AA fringe adjacent to a proven enclosed core; requires --remove-enclosed-magenta-matte")
    parser.add_argument("--dry-run", action="store_true", help="List required inputs without writing anything")
    args = parser.parse_args()
    queue = json.loads(args.manifest.read_text(encoding="utf-8"))
    jobs = [job for job in queue["jobs"] if job["profileId"] == args.profile or (args.batch and job["batchId"] == args.batch)]
    if not jobs:
        raise ValueError("No matching production job.")
    if args.dry_run:
        print(json.dumps({"writes": 0, "apiCalls": 0, "jobs": [{"profileId": job["profileId"], "sources": [clip["sourcePath"] for clip in job["clips"]], "normalized": job["normalizedPath"]} for job in jobs]}, indent=2))
        return
    # A batch is atomic with respect to missing masters: preflight every source
    # before normalizing any profile. A rejected source never becomes ready.
    for job in jobs:
        for clip in job["clips"]:
            if not scoped_path(ROOT, clip["sourcePath"]).is_file():
                raise FileNotFoundError(clip["sourcePath"])
    results = [check_profile(job, remove_enclosed_magenta_matte=True if args.remove_enclosed_magenta_matte else None, remove_enclosed_magenta_aa_fringe=True if args.remove_enclosed_magenta_aa_fringe else None) if args.check else process_profile(job, allow_cell_reassignment=args.safe_reassign_cell_fragments, remove_enclosed_magenta_matte=args.remove_enclosed_magenta_matte, remove_enclosed_magenta_aa_fringe=args.remove_enclosed_magenta_aa_fringe) for job in jobs]
    print(json.dumps({"profiles": len(results), "poses": sum(result["frameCount"] for result in results), "acceptedAutomatically": 0,
                      "results": [{"profileId": result["profileId"], "path": result["normalized"], "findings": result["validation"]["findings"]} for result in results]}, indent=2))


if __name__ == "__main__":
    main()
