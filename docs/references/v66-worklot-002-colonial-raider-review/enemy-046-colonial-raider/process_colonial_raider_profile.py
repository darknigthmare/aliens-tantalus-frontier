"""Profile-local lossless chroma/recomposition and technical QA for enemy-046.

Only the five selected raw candidates are read. All writes stay under the
enemy-046 source directory or this standalone review directory. No queue,
state, reference registry, normalization target, runtime file or Git metadata
is touched.
"""

from __future__ import annotations

from collections import deque
import hashlib
import json
import math
from pathlib import Path
import shutil
import statistics

import numpy as np
from PIL import Image, ImageDraw, ImageFont


PROFILE_ID = "enemy-046-colonial-raider"
CLIPS = ("idle", "move", "attack", "death", "reload")
SELECTED = {
    "idle": "idle-r1-imagegen.png",
    "move": "move-r1-imagegen.png",
    "attack": "attack-r1-imagegen.png",
    "death": "death-r2-imagegen.png",
    "reload": "reload-r2-imagegen.png",
}
CANDIDATE_TAG = {
    "idle": "idle-r1",
    "move": "move-r1",
    "attack": "attack-r1",
    "death": "death-r2",
    "reload": "reload-r2",
}
PLAYBACK = {
    "idle": {"fps": 6, "loop": True},
    "move": {"fps": 12, "loop": True},
    "attack": {"fps": 12, "loop": False},
    "death": {"fps": 10, "loop": False},
    "reload": {"fps": 10, "loop": False},
}
EXPECTED_SIZE = (1774, 887)
RELOAD_TARGET_HEIGHT_PX = 375.0
MIN_FREE_BYTES = 650 * 1024 * 1024
CHROMA = np.array([255, 0, 255], dtype=np.uint8)
HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[4]
PROFILE_DIR = ROOT / "assets/openai/sprites/frames/v66/batch-003" / PROFILE_ID
RAW_DIR = PROFILE_DIR / "raw"
DERIVED_DIR = PROFILE_DIR / "derived"
REJECTED_DIR = PROFILE_DIR / "rejected"
QA_DIR = PROFILE_DIR / "qa"
FONT = ImageFont.load_default()


def guard_disk(step: str) -> int:
    free = shutil.disk_usage(ROOT).free
    if free < MIN_FREE_BYTES:
        raise RuntimeError(f"disk threshold crossed before {step}: {free} bytes")
    return free


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=False, compress_level=6)


def promote_exact(source: Path, destination: Path, *, allow_authorized_replace: bool = False) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and sha256_file(destination) != sha256_file(source):
        if not allow_authorized_replace:
            raise RuntimeError(f"refusing to overwrite different existing active: {destination}")
        shutil.copyfile(source, destination)
    elif not destination.exists():
        shutil.copyfile(source, destination)


def preserve_rejected(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and sha256_file(destination) != sha256_file(source):
        raise RuntimeError(f"refusing to overwrite different rejected candidate: {destination}")
    if not destination.exists():
        shutil.copyfile(source, destination)


def scale_reload_cells(array: np.ndarray, factor: float) -> tuple[np.ndarray, list[dict[str, object]]]:
    """Uniformly resize each reload silhouette around its body root and support bottom."""
    output = np.empty_like(array)
    output[:, :] = CHROMA
    x_edges, y_edges = nominal_edges(*EXPECTED_SIZE)
    transforms: list[dict[str, object]] = []
    for frame in range(8):
        row, column = divmod(frame, 4)
        x0, x1 = x_edges[column], x_edges[column + 1]
        y0, y1 = y_edges[row], y_edges[row + 1]
        cell = array[y0:y1, x0:x1]
        mask = ~np.all(cell == CHROMA, axis=2)
        bbox = bbox_from_mask(mask)
        bx0, by0, bx1, by1 = bbox
        landmark_x, _landmark_y = reviewed_landmark(mask, bbox)
        crop = cell[by0:by1, bx0:bx1].copy()
        crop_mask = mask[by0:by1, bx0:bx1]
        rgba = np.zeros((crop.shape[0], crop.shape[1], 4), dtype=np.uint8)
        rgba[:, :, :3] = crop
        rgba[:, :, 3] = crop_mask.astype(np.uint8) * 255
        source = Image.fromarray(rgba, mode="RGBA")
        new_size = (max(1, round(source.width * factor)), max(1, round(source.height * factor)))
        resized = source.resize(new_size, Image.Resampling.LANCZOS)
        anchor_in_crop = landmark_x - bx0
        resized_anchor = round(anchor_in_crop * factor)
        paste_x = landmark_x - resized_anchor
        paste_y = by1 - resized.height
        if paste_x < 0 or paste_y < 0 or paste_x + resized.width > cell.shape[1] or paste_y + resized.height > cell.shape[0]:
            raise RuntimeError(f"reload scale calibration leaves cell {frame + 1}")
        cell_canvas = Image.new("RGBA", (cell.shape[1], cell.shape[0]), (255, 0, 255, 255))
        cell_canvas.alpha_composite(resized, (paste_x, paste_y))
        calibrated = np.array(cell_canvas.convert("RGB"))
        calibrated[magenta_like(calibrated)] = CHROMA
        output[y0:y1, x0:x1] = calibrated
        calibrated_mask = ~np.all(calibrated == CHROMA, axis=2)
        calibrated_bbox = bbox_from_mask(calibrated_mask)
        transforms.append({
            "frame": frame,
            "factor": round(factor, 9),
            "sourceBounds": list(bbox),
            "sourceHeightPx": by1 - by0,
            "calibratedBounds": list(calibrated_bbox),
            "calibratedHeightPx": calibrated_bbox[3] - calibrated_bbox[1],
            "supportBottomPreserved": calibrated_bbox[3] == by1,
            "placement": [paste_x, paste_y],
        })
    return output, transforms


def magenta_like(array: np.ndarray) -> np.ndarray:
    red = array[:, :, 0].astype(np.int16)
    green = array[:, :, 1].astype(np.int16)
    blue = array[:, :, 2].astype(np.int16)
    return (
        (red > 190)
        & (blue > 170)
        & (green < 110)
        & (np.abs(red - blue) < 100)
    )


def nominal_edges(width: int, height: int) -> tuple[list[int], list[int]]:
    return (
        [round(index * width / 4) for index in range(5)],
        [round(index * height / 2) for index in range(3)],
    )


def foreground_hash(array: np.ndarray, mask: np.ndarray) -> str:
    yy, xx = np.nonzero(mask)
    digest = hashlib.sha256()
    digest.update(np.column_stack((yy, xx)).astype("<i4", copy=False).tobytes())
    digest.update(array[mask].tobytes())
    return digest.hexdigest()


def bbox_from_mask(mask: np.ndarray) -> tuple[int, int, int, int]:
    yy, xx = np.nonzero(mask)
    if len(xx) == 0:
        raise RuntimeError("empty nominal cell")
    return int(xx.min()), int(yy.min()), int(xx.max() + 1), int(yy.max() + 1)


def significant_components(mask: np.ndarray, minimum: int = 24) -> list[int]:
    height, width = mask.shape
    visited = np.zeros(mask.shape, dtype=np.bool_)
    sizes: list[int] = []
    for start_y, start_x in zip(*np.nonzero(mask & ~visited)):
        if visited[start_y, start_x]:
            continue
        queue: deque[tuple[int, int]] = deque([(int(start_y), int(start_x))])
        visited[start_y, start_x] = True
        size = 0
        while queue:
            y, x = queue.popleft()
            size += 1
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < height and 0 <= nx < width and mask[ny, nx] and not visited[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))
        if size >= minimum:
            sizes.append(size)
    return sorted(sizes, reverse=True)


def runs(row: np.ndarray) -> list[tuple[int, int]]:
    padded = np.pad(row.astype(np.int8), (1, 1))
    changes = np.diff(padded)
    starts = np.flatnonzero(changes == 1)
    ends = np.flatnonzero(changes == -1)
    return [(int(start), int(end)) for start, end in zip(starts, ends)]


def reviewed_landmark(mask: np.ndarray, bbox: tuple[int, int, int, int]) -> tuple[int, int]:
    x0, y0, x1, y1 = bbox
    height = y1 - y0
    band_y0 = y0 + round(height * 0.34)
    band_y1 = min(y1, y0 + round(height * 0.72))
    yy, xx = np.nonzero(mask[band_y0:band_y1, :])
    if len(xx) == 0:
        yy, xx = np.nonzero(mask)
        yy = yy + y0 * 0
    else:
        yy = yy + band_y0
    target_x = int(round(float(np.median(xx))))
    target_y = int(round(float(np.median(yy))))
    all_y, all_x = np.nonzero(mask)
    distances = (all_x - target_x) ** 2 + (all_y - target_y) ** 2
    index = int(np.argmin(distances))
    return int(all_x[index]), int(all_y[index])


def hood_chord(mask: np.ndarray, bbox: tuple[int, int, int, int], body_x: int) -> dict[str, object]:
    x0, y0, x1, y1 = bbox
    height = y1 - y0
    scan_y0 = y0 + max(3, round(height * 0.07))
    scan_y1 = min(y1, y0 + max(12, round(height * 0.25)))
    candidates: list[tuple[float, int, int, int]] = []
    for y in range(scan_y0, scan_y1):
        for start, end in runs(mask[y]):
            width = end - start
            if width < 18 or width > 150:
                continue
            centre = (start + end - 1) / 2
            distance = abs(centre - body_x)
            if distance <= 110:
                score = distance + abs(y - (scan_y0 + scan_y1) / 2) * 0.15
                candidates.append((score, y, start, end))
    if not candidates:
        return {"pass": False, "reason": "no stable hood chord"}
    candidates.sort(key=lambda item: item[0])
    chosen_pool = candidates[: min(12, len(candidates))]
    widths = [end - start for _score, _y, start, end in chosen_pool]
    target_width = statistics.median(widths)
    selected = min(chosen_pool, key=lambda item: abs((item[3] - item[2]) - target_width))
    _score, y, start, end = selected
    return {
        "pass": True,
        "endpoints": [[start, y], [end, y]],
        "lengthPx": int(end - start),
        "uncertaintyPx": 5,
        "note": "automatic hood/head continuous foreground chord; right endpoint exclusive; weapon excluded by upper scan band",
    }


def draw_overlay(clip: str, image: Image.Image, poses: list[dict[str, object]], output: Path) -> None:
    canvas = image.convert("RGBA")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    x_edges, y_edges = nominal_edges(*image.size)
    for pose in poses:
        row = int(pose["row"])
        column = int(pose["column"])
        x0, x1 = x_edges[column], x_edges[column + 1]
        y0, y1 = y_edges[row], y_edges[row + 1]
        draw.rectangle((x0, y0, x1 - 1, y1 - 1), outline=(40, 235, 255, 230), width=2)
        bx0, by0, bx1, by1 = pose["sourceBounds"]
        draw.rectangle((x0 + bx0, y0 + by0, x0 + bx1 - 1, y0 + by1 - 1), outline=(255, 220, 45, 245), width=2)
        lx, ly = pose["landmark"]
        ax, ay = pose["anchor"]
        landmark = (x0 + lx, y0 + ly)
        anchor = (x0 + ax, y0 + ay)
        draw.line((landmark, anchor), fill=(40, 255, 220, 245), width=3)
        draw.ellipse((landmark[0] - 5, landmark[1] - 5, landmark[0] + 5, landmark[1] + 5), outline=(40, 240, 255, 255), width=3)
        draw.polygon(((anchor[0], anchor[1] - 7), (anchor[0] + 7, anchor[1]), (anchor[0], anchor[1] + 7), (anchor[0] - 7, anchor[1])), fill=(80, 255, 100, 255), outline=(0, 55, 0, 255))
        chord = pose["scaleProxy"]
        if chord.get("pass"):
            (cx0, cy0), (cx1, cy1) = chord["endpoints"]
            draw.line((x0 + cx0, y0 + cy0, x0 + cx1, y0 + cy1), fill=(255, 70, 230, 255), width=4)
        label = f"F{int(pose['frame']) + 1} A({ax},{ay}) H={chord.get('lengthPx', 'NA')}"
        draw.rectangle((x0 + 4, y0 + 4, x0 + 170, y0 + 22), fill=(8, 12, 18, 220))
        draw.text((x0 + 8, y0 + 7), label, fill=(255, 255, 255, 255), font=FONT)
    save_png(Image.alpha_composite(canvas, overlay).convert("RGB"), output)


def matte_to_alpha(cell: Image.Image) -> Image.Image:
    rgba = cell.convert("RGBA")
    array = np.array(rgba)
    exact = np.all(array[:, :, :3] == CHROMA, axis=2)
    array[exact, 3] = 0
    return Image.fromarray(array, mode="RGBA")


def draw_playback(clip: str, image: Image.Image, poses: list[dict[str, object]], output: Path) -> None:
    x_edges, y_edges = nominal_edges(*image.size)
    frames: list[Image.Image] = []
    target = (300, 470)
    for pose in poses:
        row = int(pose["row"])
        column = int(pose["column"])
        cell = image.crop((x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1]))
        sprite = matte_to_alpha(cell)
        canvas = Image.new("RGBA", (640, 520), (15, 20, 27, 255))
        draw = ImageDraw.Draw(canvas)
        for yy in range(0, 520, 32):
            for xx in range(0, 640, 32):
                if (xx // 32 + yy // 32) % 2 == 0:
                    draw.rectangle((xx, yy, xx + 31, yy + 31), fill=(23, 30, 38, 255))
        ax, ay = pose["anchor"]
        canvas.paste(sprite, (target[0] - ax, target[1] - ay), sprite)
        draw = ImageDraw.Draw(canvas)
        draw.line((target[0] - 12, target[1], target[0] + 12, target[1]), fill=(80, 255, 100, 255), width=2)
        draw.line((target[0], target[1] - 12, target[0], target[1] + 12), fill=(80, 255, 100, 255), width=2)
        draw.text((12, 10), f"{PROFILE_ID} / {clip} / F{int(pose['frame']) + 1} / RIGHT", fill=(255, 255, 255, 255), font=FONT)
        draw.text((12, 496), f"root=({ax},{ay}) source scale unchanged", fill=(215, 230, 240, 255), font=FONT)
        frames.append(canvas.convert("P", palette=Image.Palette.ADAPTIVE))
    save_args: dict[str, object] = {
        "save_all": True,
        "append_images": frames[1:],
        "duration": round(1000 / int(PLAYBACK[clip]["fps"])),
        "disposal": 2,
        "optimize": False,
    }
    if PLAYBACK[clip]["loop"]:
        save_args["loop"] = 0
    frames[0].save(output, **save_args)


def draw_contact(sources: dict[str, Image.Image], reviews: dict[str, list[dict[str, object]]], output: Path) -> None:
    tile_w, tile_h, label_w = 170, 175, 105
    canvas = Image.new("RGBA", (label_w + 8 * tile_w, len(CLIPS) * tile_h), (12, 17, 23, 255))
    draw = ImageDraw.Draw(canvas)
    scale = 0.33
    for row_index, clip in enumerate(CLIPS):
        draw.text((8, row_index * tile_h + 12), f"{clip}\n{PLAYBACK[clip]['fps']} fps\n{'loop' if PLAYBACK[clip]['loop'] else 'one-shot'}", fill=(255, 255, 255, 255), font=FONT)
        image = sources[clip]
        x_edges, y_edges = nominal_edges(*image.size)
        for pose in reviews[clip]:
            frame = int(pose["frame"])
            row = int(pose["row"])
            column = int(pose["column"])
            cell = matte_to_alpha(image.crop((x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])))
            resized = cell.resize((round(cell.width * scale), round(cell.height * scale)), Image.Resampling.LANCZOS)
            tile_x = label_w + frame * tile_w
            tile_y = row_index * tile_h
            draw.rectangle((tile_x, tile_y, tile_x + tile_w - 1, tile_y + tile_h - 1), outline=(45, 78, 93, 255), width=1)
            ax, ay = pose["anchor"]
            target_x, target_y = tile_x + 75, tile_y + 158
            canvas.paste(resized, (target_x - round(ax * scale), target_y - round(ay * scale)), resized)
            draw.line((target_x - 5, target_y, target_x + 5, target_y), fill=(80, 255, 100, 255), width=1)
            draw.line((target_x, target_y - 5, target_x, target_y + 5), fill=(80, 255, 100, 255), width=1)
            draw.text((tile_x + 4, tile_y + 4), f"F{frame + 1} RIGHT/WPN", fill=(255, 226, 85, 255), font=FONT)
    save_png(canvas.convert("RGB"), output)


def main() -> None:
    guard_disk("profile-local processing")
    DERIVED_DIR.mkdir(parents=True, exist_ok=True)
    REJECTED_DIR.mkdir(parents=True, exist_ok=True)
    QA_DIR.mkdir(parents=True, exist_ok=True)
    preserve_rejected(RAW_DIR / "reload-r1-imagegen.png", REJECTED_DIR / "reload-r1-magazine-duplication.png")
    preserve_rejected(RAW_DIR / "death-r1-imagegen.png", REJECTED_DIR / "death-r1-terminal-boundary-contact.png")

    report: dict[str, object] = {
        "schema": 1,
        "profileId": PROFILE_ID,
        "method": {
            "chroma": "all pixels satisfying r>190, b>170, g<110 and abs(r-b)<100 are background and replaced by exact RGB #FF00FF; every non-matching raw pixel remains byte-identical",
            "canvasRepair": "provider reload-r2 width 1773 receives one appended pure-#FF00FF right-edge column; no original coordinate moves",
            "recomposition": "nominal 4x2 crop and paste over exact 1774x887 canvas; pixel equality with chroma-flat board required",
            "anchor": "foreground body-mass landmark in middle-height band, snapped to an actual foreground pixel, projected vertically to the lower-exclusive physical support bound",
            "scale": "automatic continuous hood/head chord in upper body band; frames 1-3 median per clip; proxy excludes weapon reach and terminal corpse width",
            "reloadCalibration": "single profile-local source factor derived from 375 px divided by the eight-pose median silhouette height; per-cell RGBA Lanczos resample around the body landmark with physical support bottom preserved; raw and unscaled lossless derivatives retained",
        },
        "startedFreeBytes": guard_disk("first selected board"),
        "selectedCandidates": {},
        "clips": {},
        "outputs": [],
    }
    active_images: dict[str, Image.Image] = {}
    pose_reviews: dict[str, list[dict[str, object]]] = {}

    for clip in CLIPS:
        guard_disk(f"{clip} chroma/recomposition")
        raw_path = RAW_DIR / SELECTED[clip]
        raw_image = Image.open(raw_path).convert("RGB")
        raw_array = np.array(raw_image)
        raw_height, raw_width = raw_array.shape[:2]
        if raw_height != EXPECTED_SIZE[1] or raw_width not in (EXPECTED_SIZE[0], EXPECTED_SIZE[0] - 1):
            raise RuntimeError(f"unexpected provider canvas for {clip}: {raw_image.size}")
        raw_background = magenta_like(raw_array)
        raw_foreground = ~raw_background
        canvas = np.empty((EXPECTED_SIZE[1], EXPECTED_SIZE[0], 3), dtype=np.uint8)
        canvas[:, :] = CHROMA
        canvas[:raw_height, :raw_width] = raw_array
        canvas_background = np.zeros((EXPECTED_SIZE[1], EXPECTED_SIZE[0]), dtype=np.bool_)
        canvas_background[:raw_height, :raw_width] = raw_background
        if raw_width < EXPECTED_SIZE[0]:
            canvas_background[:, raw_width:] = True
        flat_array = canvas.copy()
        flat_array[canvas_background] = CHROMA
        foreground_preserved = np.array_equal(raw_array[raw_foreground], flat_array[:raw_height, :raw_width][raw_foreground])
        if not foreground_preserved:
            raise RuntimeError(f"foreground changed during chroma flatten for {clip}")

        flat_path = DERIVED_DIR / f"{CANDIDATE_TAG[clip]}-chroma-flat.png"
        recomposed_path = DERIVED_DIR / f"{CANDIDATE_TAG[clip]}-chroma-flat-recomposed.png"
        save_png(Image.fromarray(flat_array, mode="RGB"), flat_path)
        x_edges, y_edges = nominal_edges(*EXPECTED_SIZE)
        recomposed = np.empty_like(flat_array)
        recomposed[:, :] = CHROMA
        for row in range(2):
            for column in range(4):
                x0, x1 = x_edges[column], x_edges[column + 1]
                y0, y1 = y_edges[row], y_edges[row + 1]
                recomposed[y0:y1, x0:x1] = flat_array[y0:y1, x0:x1]
        if not np.array_equal(flat_array, recomposed):
            raise RuntimeError(f"recomposition changed pixels for {clip}")
        save_png(Image.fromarray(recomposed, mode="RGB"), recomposed_path)
        active_master = recomposed
        calibration: dict[str, object] | None = None
        calibrated_path: Path | None = None
        if clip == "reload":
            reload_mask = ~np.all(recomposed == CHROMA, axis=2)
            source_heights = []
            for frame in range(8):
                row, column = divmod(frame, 4)
                x0, x1 = x_edges[column], x_edges[column + 1]
                y0, y1 = y_edges[row], y_edges[row + 1]
                bounds = bbox_from_mask(reload_mask[y0:y1, x0:x1])
                source_heights.append(bounds[3] - bounds[1])
            median_source_height = float(statistics.median(source_heights))
            factor = RELOAD_TARGET_HEIGHT_PX / median_source_height
            active_master, transforms = scale_reload_cells(recomposed, factor)
            calibrated_path = DERIVED_DIR / "reload-r2-scale-calibrated-375px.png"
            save_png(Image.fromarray(active_master, mode="RGB"), calibrated_path)
            calibration = {
                "targetMedianHeightPx": RELOAD_TARGET_HEIGHT_PX,
                "sourceMedianHeightPx": median_source_height,
                "sourceScaleByClip": round(factor, 9),
                "method": "uniform per-cell RGBA Lanczos resample around reviewed body landmark; lower-exclusive physical support y preserved",
                "transforms": transforms,
            }
        active_path = PROFILE_DIR / f"{clip}.png"
        promotion_source = calibrated_path if calibrated_path is not None else recomposed_path
        promote_exact(promotion_source, active_path, allow_authorized_replace=clip in ("death", "reload"))
        if sha256_file(active_path) != sha256_file(promotion_source):
            raise RuntimeError(f"active promotion not byte-identical for {clip}")

        exact_foreground = ~np.all(active_master == CHROMA, axis=2)
        poses: list[dict[str, object]] = []
        cell_hashes: list[str] = []
        for frame in range(8):
            row, column = divmod(frame, 4)
            x0, x1 = x_edges[column], x_edges[column + 1]
            y0, y1 = y_edges[row], y_edges[row + 1]
            cell_mask = exact_foreground[y0:y1, x0:x1]
            bbox = bbox_from_mask(cell_mask)
            lx, ly = reviewed_landmark(cell_mask, bbox)
            chord = hood_chord(cell_mask, bbox, lx)
            components = significant_components(cell_mask)
            bx0, by0, bx1, by1 = bbox
            margins = {"left": bx0, "top": by0, "right": (x1 - x0) - bx1, "bottom": (y1 - y0) - by1}
            cell_pixels = active_master[y0:y1, x0:x1]
            cell_hash = hashlib.sha256(cell_pixels.tobytes()).hexdigest()
            cell_hashes.append(cell_hash)
            uncertainty = 8 if clip != "death" else min(14, 9 + frame)
            poses.append({
                "frame": frame,
                "row": row,
                "column": column,
                "sourceBounds": list(bbox),
                "marginsPx": margins,
                "minimumBoundaryClearancePx": min(margins.values()),
                "touchesNominalCellBoundary": min(margins.values()) <= 0,
                "foregroundPixels": int(cell_mask.sum()),
                "silhouetteHeightPx": by1 - by0,
                "significantConnectedComponents": components,
                "landmark": [lx, ly],
                "anchor": [lx, by1],
                "uncertaintyPx": uncertainty,
                "landmarkInsideForeground": bool(cell_mask[ly, lx]),
                "anchorAtPhysicalSupportBottom": True,
                "scaleProxy": chord,
                "cellPixelSha256": cell_hash,
            })
        duplicates = sorted({value for value in cell_hashes if cell_hashes.count(value) > 1})
        scale_rows = [pose["scaleProxy"] for pose in poses[:3] if pose["scaleProxy"].get("pass")]
        if len(scale_rows) != 3:
            raise RuntimeError(f"insufficient head scale proxies for {clip}")
        scale_median = float(statistics.median(float(row["lengthPx"]) for row in scale_rows))
        active_image = Image.open(active_path).convert("RGB")
        active_images[clip] = active_image
        pose_reviews[clip] = poses
        overlay_path = QA_DIR / f"{clip}-technical-overlay.png"
        playback_path = QA_DIR / f"{clip}-anchor-playback.gif"
        draw_overlay(clip, active_image, poses, overlay_path)
        draw_playback(clip, active_image, poses, playback_path)
        report["outputs"].extend([rel(flat_path), rel(recomposed_path)])
        if calibrated_path is not None:
            report["outputs"].append(rel(calibrated_path))
        report["outputs"].extend([rel(active_path), rel(overlay_path), rel(playback_path)])
        report["selectedCandidates"][clip] = {
            "rawPath": rel(raw_path),
            "rawSha256": sha256_file(raw_path),
            "rawBytes": raw_path.stat().st_size,
            "rawSize": list(raw_image.size),
            "activePath": rel(active_path),
            "activeSha256": sha256_file(active_path),
            "activeBytes": active_path.stat().st_size,
            "activeSize": list(active_image.size),
            "derivedFlatPath": rel(flat_path),
            "derivedFlatSha256": sha256_file(flat_path),
            "derivedRecomposedPath": rel(recomposed_path),
            "derivedRecomposedSha256": sha256_file(recomposed_path),
            "rawForegroundPixelSha256": foreground_hash(raw_array, raw_foreground),
            "derivedForegroundPixelSha256": foreground_hash(flat_array[:raw_height, :raw_width], raw_foreground),
            "foregroundPixelsPreserved": foreground_preserved,
            "backgroundPixelsFlattened": int(np.sum(raw_background & np.any(raw_array != CHROMA, axis=2))),
            "paddedRightEdgePixels": int((EXPECTED_SIZE[0] - raw_width) * EXPECTED_SIZE[1]),
            "recompositionPixelEqual": True,
            "activeByteIdenticalToRecomposition": calibrated_path is None,
            "intentionalScaleCalibration": calibration,
        }
        report["clips"][clip] = {
            "fps": PLAYBACK[clip]["fps"],
            "loop": PLAYBACK[clip]["loop"],
            "poseCount": 8,
            "allCellsPopulated": True,
            "allCellsClearBoundaries": all(not pose["touchesNominalCellBoundary"] for pose in poses),
            "exactDuplicateCellHashes": duplicates,
            "headScaleProxyMedianPxFrames1to3": scale_median,
            "silhouetteHeightMedianPx": float(statistics.median(pose["silhouetteHeightPx"] for pose in poses)),
            "poses": poses,
        }

    baseline = float(report["clips"]["idle"]["silhouetteHeightMedianPx"])
    for clip in CLIPS:
        comparison_height = float(report["clips"][clip]["silhouetteHeightMedianPx"])
        comparison_method = "eight-pose median"
        if clip == "death":
            comparison_height = float(report["clips"][clip]["poses"][0]["silhouetteHeightPx"])
            comparison_method = "death onset frame 1 only; later height loss is intended collapse"
        delta = (comparison_height / baseline - 1.0) * 100.0
        report["clips"][clip]["scaleComparisonHeightPx"] = comparison_height
        report["clips"][clip]["scaleComparisonMethod"] = comparison_method
        report["clips"][clip]["observedSilhouetteHeightVsIdlePercent"] = round(delta, 3)
        report["clips"][clip]["proposedSourceScaleRelativeToIdle"] = round(baseline / comparison_height, 6)
        report["clips"][clip]["materialScaleDeviation"] = abs(delta) > 10.0

    contact_path = QA_DIR / "orientation-weapon-anchor-contact.png"
    draw_contact(active_images, pose_reviews, contact_path)
    report["outputs"].append(rel(contact_path))
    report["rejectedCandidates"] = [
        {
            "clip": "reload",
            "reason": "magazine duplication in source pose 5: inserted and loose magazines visible simultaneously",
            "rawPath": rel(RAW_DIR / "reload-r1-imagegen.png"),
            "preservedPath": rel(REJECTED_DIR / "reload-r1-magazine-duplication.png"),
            "sha256": sha256_file(REJECTED_DIR / "reload-r1-magazine-duplication.png"),
            "bytes": (REJECTED_DIR / "reload-r1-magazine-duplication.png").stat().st_size,
        },
        {
            "clip": "death",
            "reason": "terminal poses 7-8 contact nominal cell boundaries; source pixels are already clipped at those boundaries",
            "rawPath": rel(RAW_DIR / "death-r1-imagegen.png"),
            "preservedPath": rel(REJECTED_DIR / "death-r1-terminal-boundary-contact.png"),
            "sha256": sha256_file(REJECTED_DIR / "death-r1-terminal-boundary-contact.png"),
            "bytes": (REJECTED_DIR / "death-r1-terminal-boundary-contact.png").stat().st_size,
        },
    ]
    output_validation = []
    for path_string in report["outputs"]:
        path = ROOT / path_string
        with Image.open(path) as image:
            output_validation.append({
                "path": path_string,
                "sha256": sha256_file(path),
                "bytes": path.stat().st_size,
                "size": list(image.size),
                "format": image.format,
                "frames": int(getattr(image, "n_frames", 1)),
            })
    report["outputValidation"] = output_validation
    report["completedFreeBytes"] = guard_disk("report completion")
    report["scope"] = {
        "accepted": False,
        "runtimeIntegrated": False,
        "canonExact": False,
        "normalizationRun": False,
        "globalStateWritten": False,
        "globalFilesEdited": False,
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
