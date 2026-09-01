"""Deterministic, profile-local source processing for enemy-047.

The six immutable OpenAI raw captures are the only art inputs.  All writes are
limited to the enemy-047 frame directory and this standalone review directory.
The processor never edits the global queue/reference/state, normalization or
runtime manifests, and it never invokes Git.

Run once with ``--stage-only`` to build derived/QA evidence without active
promotion.  After reviewing that evidence, run without the flag to promote the
five byte-identical recomposed boards and create the local documentary bundle.
"""

from __future__ import annotations

import argparse
from collections import deque
from dataclasses import dataclass
import hashlib
import json
import math
from pathlib import Path
import shutil
import statistics
from typing import Iterable

import numpy as np
from PIL import Image, ImageDraw, ImageFont


PROFILE_ID = "enemy-047-atarax-controller"
BATCH_ID = "batch-004"
CLIPS = ("idle", "move", "attack", "death", "command")
SELECTED = {
    "idle": "idle-r1-imagegen.png",
    "move": "move-r1-imagegen.png",
    "attack": "attack-r2-imagegen.png",
    "death": "death-r1-imagegen.png",
    "command": "command-r1-imagegen.png",
}
CANDIDATE_TAG = {
    "idle": "idle-r1",
    "move": "move-r1",
    "attack": "attack-r2",
    "death": "death-r1",
    "command": "command-r1",
}
PLAYBACK = {
    "idle": {"fps": 6, "loop": True},
    "move": {"fps": 12, "loop": True},
    "attack": {"fps": 12, "loop": False},
    "death": {"fps": 10, "loop": False},
    "command": {"fps": 8, "loop": False},
}
EXPECTED_RAW_SIZE = (1536, 1024)
EXPECTED_TARGET_SIZE = (1774, 887)
RAW_GRID = (4, 2)
DESIRED_IDLE_MEDIAN_HEIGHT_PX = 375.0
DESIGN_MARGIN_PX = 24
REQUIRED_CLEARANCE_PX = 20
MIN_FREE_BYTES = 650 * 1024 * 1024
CHROMA = np.array([255, 0, 255], dtype=np.uint8)
GENERATION_AT = "2026-09-01T00:00:00.000Z"
REVIEWER = "Codex /root/process_profile_047"
HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[4]
PROFILE_DIR = ROOT / "assets/openai/sprites/frames/v66/batch-004" / PROFILE_ID
RAW_DIR = PROFILE_DIR / "raw"
DERIVED_DIR = PROFILE_DIR / "derived"
EXTRACTED_DIR = DERIVED_DIR / "extracted"
REJECTED_DIR = PROFILE_DIR / "rejected"
QA_DIR = PROFILE_DIR / "qa"
PROMPT_DIR = HERE / "prompts"
EVENT_DIR = HERE / "events"
QUEUE_PATH = ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json"
SOURCE_QA_PATH = HERE / "source-qa.json"
ANCHOR_PATH = HERE / "anchor-review.fragment.json"
SCALE_PATH = HERE / "scale-review.fragment.json"
RECEIPTS_PATH = HERE / "generation-receipts.json"
EVENT_VALIDATION_PATH = HERE / "production-event-validation.json"
ARTIFACT_VALIDATION_PATH = HERE / "artifact-validation.json"
FONT = ImageFont.load_default()


@dataclass(frozen=True)
class Component:
    label: int
    area: int
    x0: int
    y0: int
    x1: int
    y1: int
    sum_x: int
    sum_y: int

    @property
    def centroid(self) -> tuple[float, float]:
        return self.sum_x / self.area, self.sum_y / self.area

    @property
    def width(self) -> int:
        return self.x1 - self.x0

    @property
    def height(self) -> int:
        return self.y1 - self.y0

    @property
    def fill_ratio(self) -> float:
        return self.area / (self.width * self.height)

    def bounds(self) -> list[int]:
        return [self.x0, self.y0, self.x1, self.y1]


@dataclass
class ExtractedPose:
    clip: str
    frame: int
    row: int
    column: int
    raw_bounds: tuple[int, int, int, int]
    nominal_bounds: tuple[int, int, int, int]
    rgb: np.ndarray
    mask: np.ndarray
    landmark: tuple[int, int]
    component_labels: list[int]
    primary_component_area: int
    auxiliary_component_count: int
    crosses_nominal_cell: bool
    foreground_sha256: str
    extracted_path: Path


def guard_disk(step: str) -> int:
    free = shutil.disk_usage(ROOT).free
    if free < MIN_FREE_BYTES:
        raise RuntimeError(f"disk threshold crossed before {step}: {free} bytes")
    return free


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def rel(path: Path) -> str:
    return str(path.resolve().relative_to(ROOT)).replace("\\", "/")


def assert_owned_write(path: Path) -> None:
    resolved = path.resolve()
    allowed = (PROFILE_DIR.resolve(), HERE.resolve())
    if not any(resolved == base or base in resolved.parents for base in allowed):
        raise RuntimeError(f"refusing out-of-scope write: {resolved}")


def save_png(image: Image.Image, path: Path) -> None:
    assert_owned_write(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=False, compress_level=6)


def write_json(path: Path, payload: object) -> None:
    assert_owned_write(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def write_exact_text(path: Path, text: str) -> None:
    assert_owned_write(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def preserve_exact(source: Path, destination: Path) -> None:
    assert_owned_write(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and sha256_file(destination) != sha256_file(source):
        raise RuntimeError(f"refusing to overwrite different provenance copy: {destination}")
    if not destination.exists():
        shutil.copyfile(source, destination)


def promote_exact(source: Path, destination: Path) -> None:
    assert_owned_write(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    source_hash = sha256_file(source)
    if destination.exists() and sha256_file(destination) != source_hash:
        raise RuntimeError(f"refusing to overwrite different existing active: {destination}")
    if not destination.exists():
        shutil.copyfile(source, destination)
    if sha256_file(destination) != source_hash:
        raise RuntimeError(f"active promotion is not byte-identical: {destination}")


def nominal_edges(width: int, height: int) -> tuple[list[int], list[int]]:
    return (
        [round(index * width / 4) for index in range(5)],
        [round(index * height / 2) for index in range(3)],
    )


def strict_magenta(array: np.ndarray) -> np.ndarray:
    """Strict generated-backdrop key; connectivity decides exterior removal."""
    red = array[:, :, 0].astype(np.int16)
    green = array[:, :, 1].astype(np.int16)
    blue = array[:, :, 2].astype(np.int16)
    return (
        (red >= 185)
        & (blue >= 170)
        & (green <= 110)
        & ((red - green) >= 120)
        & ((blue - green) >= 110)
        & (np.abs(red - blue) <= 100)
    )


def border_connected(mask: np.ndarray) -> np.ndarray:
    """Return only strict-key pixels connected to the outer board border."""
    height, width = mask.shape
    connected = np.zeros(mask.shape, dtype=np.bool_)
    queue: deque[tuple[int, int]] = deque()

    def seed(y: int, x: int) -> None:
        if mask[y, x] and not connected[y, x]:
            connected[y, x] = True
            queue.append((y, x))

    for x in range(width):
        seed(0, x)
        seed(height - 1, x)
    for y in range(1, height - 1):
        seed(y, 0)
        seed(y, width - 1)

    while queue:
        y, x = queue.popleft()
        if y > 0 and mask[y - 1, x] and not connected[y - 1, x]:
            connected[y - 1, x] = True
            queue.append((y - 1, x))
        if y + 1 < height and mask[y + 1, x] and not connected[y + 1, x]:
            connected[y + 1, x] = True
            queue.append((y + 1, x))
        if x > 0 and mask[y, x - 1] and not connected[y, x - 1]:
            connected[y, x - 1] = True
            queue.append((y, x - 1))
        if x + 1 < width and mask[y, x + 1] and not connected[y, x + 1]:
            connected[y, x + 1] = True
            queue.append((y, x + 1))
    return connected


def label_components(mask: np.ndarray) -> tuple[np.ndarray, list[Component]]:
    """Deterministic 4-neighbour connected-component labelling using NumPy storage."""
    height, width = mask.shape
    labels = np.zeros(mask.shape, dtype=np.int32)
    components: list[Component] = []
    label = 0
    points_y, points_x = np.nonzero(mask)
    for start_y_raw, start_x_raw in zip(points_y, points_x):
        start_y = int(start_y_raw)
        start_x = int(start_x_raw)
        if labels[start_y, start_x] != 0:
            continue
        label += 1
        queue: deque[tuple[int, int]] = deque([(start_y, start_x)])
        labels[start_y, start_x] = label
        area = 0
        x0 = x1 = start_x
        y0 = y1 = start_y
        sum_x = 0
        sum_y = 0
        while queue:
            y, x = queue.popleft()
            area += 1
            sum_x += x
            sum_y += y
            x0 = min(x0, x)
            x1 = max(x1, x)
            y0 = min(y0, y)
            y1 = max(y1, y)
            if y > 0 and mask[y - 1, x] and labels[y - 1, x] == 0:
                labels[y - 1, x] = label
                queue.append((y - 1, x))
            if y + 1 < height and mask[y + 1, x] and labels[y + 1, x] == 0:
                labels[y + 1, x] = label
                queue.append((y + 1, x))
            if x > 0 and mask[y, x - 1] and labels[y, x - 1] == 0:
                labels[y, x - 1] = label
                queue.append((y, x - 1))
            if x + 1 < width and mask[y, x + 1] and labels[y, x + 1] == 0:
                labels[y, x + 1] = label
                queue.append((y, x + 1))
        components.append(Component(label, area, x0, y0, x1 + 1, y1 + 1, sum_x, sum_y))
    return labels, components


def bbox_distance(first: Component, second: Component) -> float:
    dx = max(first.x0 - second.x1, second.x0 - first.x1, 0)
    dy = max(first.y0 - second.y1, second.y0 - first.y1, 0)
    return math.hypot(dx, dy)


def bbox_from_mask(mask: np.ndarray) -> tuple[int, int, int, int]:
    yy, xx = np.nonzero(mask)
    if len(xx) == 0:
        raise RuntimeError("empty pose mask")
    return int(xx.min()), int(yy.min()), int(xx.max() + 1), int(yy.max() + 1)


def reviewed_landmark(mask: np.ndarray) -> tuple[int, int]:
    """Body-mass root proxy snapped to an actual foreground pixel."""
    x0, y0, x1, y1 = bbox_from_mask(mask)
    height = y1 - y0
    band_y0 = y0 + round(height * 0.30)
    band_y1 = min(y1, y0 + round(height * 0.72))
    yy, xx = np.nonzero(mask[band_y0:band_y1, :])
    if len(xx) == 0:
        yy, xx = np.nonzero(mask)
    else:
        yy = yy + band_y0
    target_x = int(round(float(np.median(xx))))
    target_y = int(round(float(np.median(yy))))
    all_y, all_x = np.nonzero(mask)
    distances = (all_x - target_x) ** 2 + (all_y - target_y) ** 2
    index = int(np.argmin(distances))
    return int(all_x[index]), int(all_y[index])


def foreground_hash(rgb: np.ndarray, mask: np.ndarray) -> str:
    yy, xx = np.nonzero(mask)
    digest = hashlib.sha256()
    digest.update(np.column_stack((yy, xx)).astype("<i4", copy=False).tobytes())
    digest.update(rgb[mask].tobytes())
    return digest.hexdigest()


def cell_pixel_hash(array: np.ndarray) -> str:
    return hashlib.sha256(array.tobytes()).hexdigest()


def image_record(path: Path) -> dict[str, object]:
    with Image.open(path) as image:
        return {
            "path": rel(path),
            "sha256": sha256_file(path),
            "bytes": path.stat().st_size,
            "size": list(image.size),
            "format": image.format,
            "mode": image.mode,
            "frames": int(getattr(image, "n_frames", 1)),
        }


def file_record(path: Path) -> dict[str, object]:
    return {"path": rel(path), "sha256": sha256_file(path), "bytes": path.stat().st_size}


def load_queue_contract() -> tuple[dict[str, object], dict[str, dict[str, object]]]:
    queue = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))
    matches = [job for job in queue["jobs"] if job.get("profileId") == PROFILE_ID]
    if len(matches) != 1:
        raise RuntimeError(f"expected exactly one queue job for {PROFILE_ID}, found {len(matches)}")
    profile = matches[0]
    clips = {clip["id"]: clip for clip in profile["clips"]}
    if tuple(clips) != CLIPS:
        raise RuntimeError(f"queue clips changed: {tuple(clips)}")
    for clip_id, clip in clips.items():
        raw_file_hash = sha256_bytes(clip["prompt"].encode("utf-8"))
        content_hash = sha256_bytes(
            json.dumps(clip["prompt"], ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        )
        if content_hash != clip["promptSha256"]:
            raise RuntimeError(f"queue contentHash mismatch for {clip_id}: {content_hash}")
        clip["_rawPromptFileSha256"] = raw_file_hash
        clip["_contentHashSha256"] = content_hash
        clip["_contractHashVerified"] = True
    return profile, clips


def extract_board_poses(clip: str, raw_path: Path) -> tuple[np.ndarray, list[ExtractedPose], dict[str, object]]:
    """Extract eight complete components, including death poses crossing nominal cells."""
    raw_image = Image.open(raw_path).convert("RGB")
    if raw_image.size != EXPECTED_RAW_SIZE:
        raise RuntimeError(f"unexpected raw canvas for {clip}: {raw_image.size}")
    raw = np.array(raw_image)
    strict = strict_magenta(raw)
    exterior = border_connected(strict)

    # Preserve small/elongated enclosed strict-magenta details.  Large dense
    # enclosed regions are backdrop holes inside cable/body contours.
    enclosed = strict & ~exterior
    enclosed_labels, enclosed_components = label_components(enclosed)
    background = exterior.copy()
    enclosed_background_labels: list[int] = []
    preserved_detail_labels: list[int] = []
    for component in enclosed_components:
        if component.area >= 64 and component.fill_ratio >= 0.45:
            background[enclosed_labels == component.label] = True
            enclosed_background_labels.append(component.label)
        else:
            preserved_detail_labels.append(component.label)

    foreground = ~background
    labels, components = label_components(foreground)
    primary = sorted(components, key=lambda component: (-component.area, component.y0, component.x0))[:8]
    if len(primary) != 8 or min(component.area for component in primary) < 5000:
        raise RuntimeError(f"could not find eight complete primary poses for {clip}")

    primary_by_row: dict[int, list[Component]] = {0: [], 1: []}
    for component in primary:
        _cx, cy = component.centroid
        row = 0 if cy < EXPECTED_RAW_SIZE[1] / 2 else 1
        primary_by_row[row].append(component)
    if any(len(primary_by_row[row]) != 4 for row in (0, 1)):
        raise RuntimeError(f"primary component row split is not 4+4 for {clip}")

    ordered_primary: list[Component] = []
    for row in (0, 1):
        ordered_primary.extend(sorted(primary_by_row[row], key=lambda component: component.centroid[0]))

    primary_labels = {component.label for component in ordered_primary}
    assigned: dict[int, list[int]] = {frame: [component.label] for frame, component in enumerate(ordered_primary)}
    ignored_components: list[dict[str, object]] = []
    for component in components:
        if component.label in primary_labels:
            continue
        cx, cy = component.centroid
        source_row = 0 if cy < EXPECTED_RAW_SIZE[1] / 2 else 1
        candidates = [
            (frame, main)
            for frame, main in enumerate(ordered_primary)
            if frame // 4 == source_row
        ]
        frame, nearest = min(
            candidates,
            key=lambda item: (bbox_distance(component, item[1]), abs(cx - item[1].centroid[0]), item[0]),
        )
        distance = bbox_distance(component, nearest)
        if component.area >= 3 and distance <= 72:
            assigned[frame].append(component.label)
        else:
            ignored_components.append({
                "label": component.label,
                "area": component.area,
                "bounds": component.bounds(),
                "distanceToNearestPosePx": round(distance, 3),
            })

    pose_lookup = np.zeros(len(components) + 1, dtype=np.int16)
    for frame, component_labels in assigned.items():
        for label in component_labels:
            pose_lookup[label] = frame + 1
    pose_map = pose_lookup[labels]
    assigned_mask = pose_map > 0
    keyed = np.empty_like(raw)
    keyed[:, :] = CHROMA
    keyed[assigned_mask] = raw[assigned_mask]

    raw_x_edges, raw_y_edges = nominal_edges(*EXPECTED_RAW_SIZE)
    poses: list[ExtractedPose] = []
    for frame, main in enumerate(ordered_primary):
        row, column = divmod(frame, 4)
        pose_mask_global = pose_map == frame + 1
        gx0, gy0, gx1, gy1 = bbox_from_mask(pose_mask_global)
        crop_rgb = raw[gy0:gy1, gx0:gx1].copy()
        crop_mask = pose_mask_global[gy0:gy1, gx0:gx1].copy()
        landmark = reviewed_landmark(crop_mask)
        nominal = (
            raw_x_edges[column],
            raw_y_edges[row],
            raw_x_edges[column + 1],
            raw_y_edges[row + 1],
        )
        crosses = gx0 < nominal[0] or gy0 < nominal[1] or gx1 > nominal[2] or gy1 > nominal[3]
        rgba = np.zeros((crop_rgb.shape[0], crop_rgb.shape[1], 4), dtype=np.uint8)
        rgba[:, :, :3] = crop_rgb
        rgba[:, :, 3] = crop_mask.astype(np.uint8) * 255
        extracted_path = EXTRACTED_DIR / clip / f"frame-{frame + 1:02d}-raw-keyed.png"
        save_png(Image.fromarray(rgba, mode="RGBA"), extracted_path)
        reloaded = np.array(Image.open(extracted_path).convert("RGBA"))
        if not np.array_equal(reloaded, rgba):
            raise RuntimeError(f"extracted pose PNG round-trip mismatch: {clip} frame {frame + 1}")
        poses.append(ExtractedPose(
            clip=clip,
            frame=frame,
            row=row,
            column=column,
            raw_bounds=(gx0, gy0, gx1, gy1),
            nominal_bounds=nominal,
            rgb=crop_rgb,
            mask=crop_mask,
            landmark=landmark,
            component_labels=assigned[frame],
            primary_component_area=main.area,
            auxiliary_component_count=len(assigned[frame]) - 1,
            crosses_nominal_cell=crosses,
            foreground_sha256=foreground_hash(crop_rgb, crop_mask),
            extracted_path=extracted_path,
        ))

    if sum(int(pose.mask.sum()) for pose in poses) != int(assigned_mask.sum()):
        raise RuntimeError(f"assigned foreground accounting mismatch for {clip}")
    if len({pose.foreground_sha256 for pose in poses}) != 8:
        raise RuntimeError(f"duplicate extracted poses for {clip}")

    diagnostics = {
        "strictMagentaPixels": int(strict.sum()),
        "borderConnectedBackgroundPixels": int(exterior.sum()),
        "enclosedStrictMagentaPixels": int(enclosed.sum()),
        "enclosedBackdropComponents": len(enclosed_background_labels),
        "preservedEnclosedDetailComponents": len(preserved_detail_labels),
        "assignedForegroundPixels": int(assigned_mask.sum()),
        "componentCount": len(components),
        "ignoredComponents": ignored_components,
        "ignoredForegroundPixels": int(sum(item["area"] for item in ignored_components)),
        "completePrimaryPoses": 8,
    }
    return keyed, poses, diagnostics


def determine_shared_scale(all_poses: dict[str, list[ExtractedPose]]) -> dict[str, object]:
    idle_heights = [pose.mask.shape[0] for pose in all_poses["idle"]]
    idle_median = float(statistics.median(idle_heights))
    idle_factor = DESIRED_IDLE_MEDIAN_HEIGHT_PX / idle_median
    x_edges, y_edges = nominal_edges(*EXPECTED_TARGET_SIZE)
    constraints: list[dict[str, object]] = []
    for clip in CLIPS:
        for pose in all_poses[clip]:
            cell_width = x_edges[pose.column + 1] - x_edges[pose.column]
            cell_height = y_edges[pose.row + 1] - y_edges[pose.row]
            root_x = cell_width // 2
            support_y = cell_height - DESIGN_MARGIN_PX
            landmark_x, _landmark_y = pose.landmark
            left_extent = max(1, landmark_x)
            right_extent = max(1, pose.mask.shape[1] - landmark_x)
            top_extent = pose.mask.shape[0]
            limits = {
                "left": (root_x - DESIGN_MARGIN_PX) / left_extent,
                "right": (cell_width - DESIGN_MARGIN_PX - root_x) / right_extent,
                "top": (support_y - DESIGN_MARGIN_PX) / top_extent,
            }
            side, factor = min(limits.items(), key=lambda item: item[1])
            constraints.append({
                "clipId": clip,
                "frame": pose.frame,
                "side": side,
                "factor": float(factor),
                "limits": {key: round(value, 9) for key, value in limits.items()},
            })
    limiting = min(constraints, key=lambda item: item["factor"])
    shared = min(idle_factor, float(limiting["factor"]), 1.0)
    if shared <= 0:
        raise RuntimeError("invalid shared scale")
    return {
        "desiredIdleMedianHeightPx": DESIRED_IDLE_MEDIAN_HEIGHT_PX,
        "rawIdleHeightsPx": idle_heights,
        "rawIdleMedianHeightPx": idle_median,
        "idleDerivedFactor": round(idle_factor, 9),
        "fitLimitFactor": round(float(limiting["factor"]), 9),
        "fitLimitingPose": limiting,
        "sharedPhysicalScale": round(shared, 9),
        "designMarginPx": DESIGN_MARGIN_PX,
        "requiredClearancePx": REQUIRED_CLEARANCE_PX,
        "selection": "minimum of idle-derived target factor, all-pose root-relative fit limit, and 1.0",
    }


def resize_pose_rgba(pose: ExtractedPose, factor: float) -> tuple[Image.Image, dict[str, object]]:
    rgba = np.zeros((pose.rgb.shape[0], pose.rgb.shape[1], 4), dtype=np.uint8)
    rgba[:, :, :3] = pose.rgb
    rgba[:, :, 3] = pose.mask.astype(np.uint8) * 255
    source = Image.fromarray(rgba, mode="RGBA")
    new_size = (max(1, round(source.width * factor)), max(1, round(source.height * factor)))
    resized = source.resize(new_size, Image.Resampling.LANCZOS)
    alpha = np.array(resized.getchannel("A"))
    if not np.any(alpha):
        raise RuntimeError(f"empty scaled pose: {pose.clip} frame {pose.frame + 1}")
    return resized, {
        "requestedUniformScale": round(factor, 9),
        "sourceSize": list(source.size),
        "scaledSize": list(new_size),
        "effectiveScaleX": round(new_size[0] / source.width, 9),
        "effectiveScaleY": round(new_size[1] / source.height, 9),
        "roundingAspectErrorPercent": round(abs((new_size[0] / source.width) / (new_size[1] / source.height) - 1) * 100, 6),
    }


def compose_clip(clip: str, poses: list[ExtractedPose], factor: float) -> tuple[np.ndarray, list[dict[str, object]]]:
    board = Image.new("RGB", EXPECTED_TARGET_SIZE, tuple(int(value) for value in CHROMA))
    x_edges, y_edges = nominal_edges(*EXPECTED_TARGET_SIZE)
    reviews: list[dict[str, object]] = []
    for pose in poses:
        resized, transform = resize_pose_rgba(pose, factor)
        cell_width = x_edges[pose.column + 1] - x_edges[pose.column]
        cell_height = y_edges[pose.row + 1] - y_edges[pose.row]
        root_x = cell_width // 2
        support_y = cell_height - DESIGN_MARGIN_PX
        raw_landmark_x, raw_landmark_y = pose.landmark
        scaled_landmark_x = round(raw_landmark_x * factor)
        scaled_landmark_y = round(raw_landmark_y * factor)
        paste_x_local = root_x - scaled_landmark_x
        paste_y_local = support_y - resized.height
        if paste_x_local < 0 or paste_y_local < 0 or paste_x_local + resized.width > cell_width or paste_y_local + resized.height > cell_height:
            raise RuntimeError(f"shared scale leaves target cell: {clip} frame {pose.frame + 1}")
        board.paste(
            resized,
            (x_edges[pose.column] + paste_x_local, y_edges[pose.row] + paste_y_local),
            resized,
        )
        reviews.append({
            "frame": pose.frame,
            "row": pose.row,
            "column": pose.column,
            "rawSourceBoundsGlobal": list(pose.raw_bounds),
            "rawNominalCellBounds": list(pose.nominal_bounds),
            "rawCrossesNominalCellBoundary": pose.crosses_nominal_cell,
            "rawLandmark": [raw_landmark_x, raw_landmark_y],
            "targetRoot": [root_x, support_y],
            "targetScaledLandmark": [scaled_landmark_x, scaled_landmark_y],
            "targetLandmark": [paste_x_local + scaled_landmark_x, paste_y_local + scaled_landmark_y],
            "targetPlacement": [paste_x_local, paste_y_local],
            "sourceForegroundSha256": pose.foreground_sha256,
            "sourceComponentLabels": pose.component_labels,
            "primaryComponentArea": pose.primary_component_area,
            "auxiliaryComponentCount": pose.auxiliary_component_count,
            "extractedPath": rel(pose.extracted_path),
            "extractedSha256": sha256_file(pose.extracted_path),
            "transform": transform,
        })

    array = np.array(board)
    for review in reviews:
        row = int(review["row"])
        column = int(review["column"])
        x0, x1 = x_edges[column], x_edges[column + 1]
        y0, y1 = y_edges[row], y_edges[row + 1]
        cell = array[y0:y1, x0:x1]
        mask = ~np.all(cell == CHROMA, axis=2)
        bx0, by0, bx1, by1 = bbox_from_mask(mask)
        margins = {
            "left": bx0,
            "top": by0,
            "right": cell.shape[1] - bx1,
            "bottom": cell.shape[0] - by1,
        }
        landmark_x, landmark_y = review["targetLandmark"]
        review.update({
            "targetBounds": [bx0, by0, bx1, by1],
            "targetMarginsPx": margins,
            "minimumBoundaryClearancePx": min(margins.values()),
            "touchesTargetCellBoundary": min(margins.values()) <= 0,
            "meetsRequiredClearance": min(margins.values()) >= REQUIRED_CLEARANCE_PX,
            "foregroundPixels": int(mask.sum()),
            "silhouetteWidthPx": bx1 - bx0,
            "silhouetteHeightPx": by1 - by0,
            "anchor": [int(review["targetRoot"][0]), by1],
            "landmarkInsideForeground": bool(mask[int(landmark_y), int(landmark_x)]),
            "anchorAtPhysicalSupportBottom": by1 == int(review["targetRoot"][1]),
            "cellPixelSha256": cell_pixel_hash(cell),
        })
    return array, reviews


def matte_exact_magenta(cell: Image.Image) -> Image.Image:
    rgba = np.array(cell.convert("RGBA"))
    exact = np.all(rgba[:, :, :3] == CHROMA, axis=2)
    rgba[exact, 3] = 0
    return Image.fromarray(rgba, mode="RGBA")


def draw_overlay(clip: str, image: Image.Image, reviews: list[dict[str, object]], output: Path) -> None:
    canvas = image.convert("RGBA")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    x_edges, y_edges = nominal_edges(*image.size)
    for review in reviews:
        row = int(review["row"])
        column = int(review["column"])
        x0, x1 = x_edges[column], x_edges[column + 1]
        y0, y1 = y_edges[row], y_edges[row + 1]
        bx0, by0, bx1, by1 = review["targetBounds"]
        root_x, root_y = review["targetRoot"]
        landmark_x, landmark_y = review["targetLandmark"]
        draw.rectangle((x0, y0, x1 - 1, y1 - 1), outline=(40, 235, 255, 230), width=2)
        draw.rectangle((x0 + bx0, y0 + by0, x0 + bx1 - 1, y0 + by1 - 1), outline=(255, 220, 45, 245), width=2)
        anchor = (x0 + root_x, y0 + root_y)
        landmark = (x0 + landmark_x, y0 + landmark_y)
        draw.line((landmark, anchor), fill=(40, 255, 220, 245), width=3)
        draw.ellipse((landmark[0] - 5, landmark[1] - 5, landmark[0] + 5, landmark[1] + 5), outline=(40, 240, 255, 255), width=3)
        draw.line((anchor[0] - 10, anchor[1], anchor[0] + 10, anchor[1]), fill=(80, 255, 100, 255), width=3)
        draw.line((anchor[0], anchor[1] - 10, anchor[0], anchor[1] + 10), fill=(80, 255, 100, 255), width=3)
        label = f"F{int(review['frame']) + 1} root=({root_x},{root_y}) clr={review['minimumBoundaryClearancePx']}"
        draw.rectangle((x0 + 4, y0 + 4, x0 + 230, y0 + 23), fill=(8, 12, 18, 220))
        draw.text((x0 + 8, y0 + 7), label, fill=(255, 255, 255, 255), font=FONT)
    save_png(Image.alpha_composite(canvas, overlay).convert("RGB"), output)


def draw_playback(clip: str, image: Image.Image, reviews: list[dict[str, object]], output: Path) -> None:
    x_edges, y_edges = nominal_edges(*image.size)
    frames: list[Image.Image] = []
    target = (320, 475)
    for review in reviews:
        row = int(review["row"])
        column = int(review["column"])
        cell = matte_exact_magenta(image.crop((x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])))
        canvas = Image.new("RGBA", (640, 520), (15, 20, 27, 255))
        draw = ImageDraw.Draw(canvas)
        for yy in range(0, 520, 32):
            for xx in range(0, 640, 32):
                if (xx // 32 + yy // 32) % 2 == 0:
                    draw.rectangle((xx, yy, xx + 31, yy + 31), fill=(23, 30, 38, 255))
        root_x, root_y = review["targetRoot"]
        canvas.paste(cell, (target[0] - root_x, target[1] - root_y), cell)
        draw = ImageDraw.Draw(canvas)
        draw.line((target[0] - 12, target[1], target[0] + 12, target[1]), fill=(80, 255, 100, 255), width=2)
        draw.line((target[0], target[1] - 12, target[0], target[1] + 12), fill=(80, 255, 100, 255), width=2)
        draw.text((12, 10), f"{PROFILE_ID} / {clip} / F{int(review['frame']) + 1} / RIGHT", fill=(255, 255, 255, 255), font=FONT)
        draw.text((12, 496), "shared uniform physical scale; target root registered", fill=(215, 230, 240, 255), font=FONT)
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
    assert_owned_write(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(output, **save_args)


def draw_contact(images: dict[str, Image.Image], reviews: dict[str, list[dict[str, object]]], output: Path) -> None:
    tile_w, tile_h, label_w = 170, 175, 105
    canvas = Image.new("RGBA", (label_w + 8 * tile_w, len(CLIPS) * tile_h), (12, 17, 23, 255))
    draw = ImageDraw.Draw(canvas)
    x_edges, y_edges = nominal_edges(*EXPECTED_TARGET_SIZE)
    scale = 0.34
    for clip_index, clip in enumerate(CLIPS):
        draw.text((8, clip_index * tile_h + 12), f"{clip}\n{PLAYBACK[clip]['fps']} fps\n{'loop' if PLAYBACK[clip]['loop'] else 'one-shot'}", fill=(255, 255, 255, 255), font=FONT)
        for review in reviews[clip]:
            frame = int(review["frame"])
            row = int(review["row"])
            column = int(review["column"])
            cell = matte_exact_magenta(images[clip].crop((x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])))
            resized = cell.resize((round(cell.width * scale), round(cell.height * scale)), Image.Resampling.LANCZOS)
            tile_x = label_w + frame * tile_w
            tile_y = clip_index * tile_h
            draw.rectangle((tile_x, tile_y, tile_x + tile_w - 1, tile_y + tile_h - 1), outline=(45, 78, 93, 255), width=1)
            root_x, root_y = review["targetRoot"]
            target_x, target_y = tile_x + 78, tile_y + 158
            canvas.paste(resized, (target_x - round(root_x * scale), target_y - round(root_y * scale)), resized)
            draw.line((target_x - 5, target_y, target_x + 5, target_y), fill=(80, 255, 100, 255), width=1)
            draw.line((target_x, target_y - 5, target_x, target_y + 5), fill=(80, 255, 100, 255), width=1)
            draw.text((tile_x + 4, tile_y + 4), f"F{frame + 1} RIGHT", fill=(255, 226, 85, 255), font=FONT)
    save_png(canvas.convert("RGB"), output)


def draw_attack_weapon_review(image: Image.Image, reviews: list[dict[str, object]], output: Path) -> None:
    labels = (
        "HOLSTERED",
        "DRAW TRANSITION",
        "HELD / EMPTY HOLSTER",
        "HELD / EMPTY HOLSTER",
        "HELD / EMPTY HOLSTER",
        "HELD / EMPTY HOLSTER",
        "HELD LOW / EMPTY HOLSTER",
        "REHOLSTERED",
    )
    x_edges, y_edges = nominal_edges(*image.size)
    tile_w, tile_h = 420, 430
    canvas = Image.new("RGBA", (4 * tile_w, 2 * tile_h), (14, 18, 24, 255))
    draw = ImageDraw.Draw(canvas)
    for review, state in zip(reviews, labels):
        frame = int(review["frame"])
        row, column = divmod(frame, 4)
        cell = matte_exact_magenta(image.crop((x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])))
        resized = cell.resize((400, 400), Image.Resampling.LANCZOS)
        x = column * tile_w + 10
        y = row * tile_h + 26
        canvas.paste(resized, (x, y), resized)
        draw.rectangle((column * tile_w, row * tile_h, (column + 1) * tile_w - 1, (row + 1) * tile_h - 1), outline=(52, 91, 106, 255), width=2)
        draw.text((column * tile_w + 8, row * tile_h + 6), f"F{frame + 1} {state}", fill=(255, 235, 100, 255), font=FONT)
    draw.rectangle((6, 831, 970, 855), fill=(8, 12, 18, 230))
    draw.text((12, 836), "Manual best-effort review: exactly one pistol per pose; held poses show the thigh holster empty.", fill=(255, 255, 255, 255), font=FONT)
    save_png(canvas.convert("RGB"), output)


def validate_composed(clips: dict[str, list[dict[str, object]]], boards: dict[str, np.ndarray]) -> dict[str, object]:
    total = 0
    hashes: list[str] = []
    clear = 0
    support = 0
    landmarks = 0
    for clip in CLIPS:
        if boards[clip].shape != (EXPECTED_TARGET_SIZE[1], EXPECTED_TARGET_SIZE[0], 3):
            raise RuntimeError(f"wrong composed array shape for {clip}: {boards[clip].shape}")
        if len(clips[clip]) != 8:
            raise RuntimeError(f"wrong pose count for {clip}")
        for pose in clips[clip]:
            total += 1
            hashes.append(str(pose["cellPixelSha256"]))
            clear += int(bool(pose["meetsRequiredClearance"]))
            support += int(bool(pose["anchorAtPhysicalSupportBottom"]))
            landmarks += int(bool(pose["landmarkInsideForeground"]))
    duplicates = sorted({value for value in hashes if hashes.count(value) > 1})
    if total != 40 or clear != 40 or support != 40 or landmarks != 40 or duplicates:
        raise RuntimeError({
            "poses": total,
            "clear": clear,
            "support": support,
            "landmarks": landmarks,
            "duplicateCellHashes": duplicates,
        })
    return {
        "expectedPoses": 40,
        "populatedPoses": total,
        "clearTargetCellPoses": clear,
        "supportBottomChecks": support,
        "landmarksInsideForeground": landmarks,
        "distinctCellPixelHashes": len(set(hashes)),
        "exactDuplicateCellHashes": duplicates,
    }


def build_anchor_fragment(reviews: dict[str, list[dict[str, object]]], factor: float) -> dict[str, object]:
    clip_payload: dict[str, list[dict[str, object]]] = {}
    for clip in CLIPS:
        clip_payload[clip] = []
        for pose in reviews[clip]:
            clip_payload[clip].append({
                "frame": pose["frame"],
                "sourceBounds": pose["targetBounds"],
                "landmark": pose["targetLandmark"],
                "anchor": pose["anchor"],
                "uncertaintyPx": 8 if clip != "death" else min(14, 9 + int(pose["frame"])),
                "marginsPx": pose["targetMarginsPx"],
                "landmarkInsideForeground": pose["landmarkInsideForeground"],
                "anchorAtPhysicalSupportBottom": pose["anchorAtPhysicalSupportBottom"],
                "rawSourceBoundsGlobal": pose["rawSourceBoundsGlobal"],
                "rawCrossesNominalCellBoundary": pose["rawCrossesNominalCellBoundary"],
            })
    return {
        "schema": 1,
        "batchId": BATCH_ID,
        "coordinates": "target-nominal-cell-local",
        "profiles": {
            PROFILE_ID: {
                "status": "reviewed-technical-candidate-art-not-accepted",
                "reviewer": REVIEWER,
                "reviewedAt": "2026-09-01",
                "method": "Body-mass landmark in the middle-height band, snapped to actual foreground, then projected to the lower-exclusive physical support bound. One shared scale and cell-centred root are used for all 40 poses.",
                "sharedPhysicalScale": round(factor, 9),
                "clips": clip_payload,
                "validation": {
                    "requiredAnchors": 40,
                    "reviewedAnchors": 40,
                    "landmarksInsideForeground": 40,
                    "supportBottomChecks": 40,
                    "clearNominalCellPoses": 40,
                },
                "accepted": False,
                "canonExact": False,
                "integrationStatus": "standalone-reviewed-candidate-not-merged",
            }
        },
    }


def build_scale_fragment(
    all_poses: dict[str, list[ExtractedPose]],
    reviews: dict[str, list[dict[str, object]]],
    scale: dict[str, object],
) -> dict[str, object]:
    factor = float(scale["sharedPhysicalScale"])
    measurements: dict[str, object] = {}
    idle_active_median = float(statistics.median(pose["silhouetteHeightPx"] for pose in reviews["idle"]))
    for clip in CLIPS:
        raw_heights = [pose.mask.shape[0] for pose in all_poses[clip]]
        active_heights = [int(pose["silhouetteHeightPx"]) for pose in reviews[clip]]
        comparison = float(statistics.median(active_heights))
        method = "eight-pose silhouette-height median"
        if clip == "death":
            comparison = float(active_heights[0])
            method = "death onset frame 1 only; later height loss is intended collapse"
        measurements[clip] = {
            "rawHeightsPx": raw_heights,
            "rawMedianPx": float(statistics.median(raw_heights)),
            "activeHeightsPx": active_heights,
            "activeMedianPx": float(statistics.median(active_heights)),
            "comparisonHeightPx": comparison,
            "comparisonMethod": method,
            "vsIdlePercent": round((comparison / idle_active_median - 1.0) * 100.0, 3),
            "appliedSharedSourceScale": round(factor, 9),
        }
    return {
        "schema": 1,
        "batchId": BATCH_ID,
        "coordinates": "raw-extracted-pose and target-cell pixels",
        "profiles": {
            PROFILE_ID: {
                "status": "measured-shared-scale-evidence-art-not-accepted",
                "reviewer": REVIEWER,
                "reviewedAt": "2026-09-01",
                "baselineClip": "idle",
                "method": "One uniform factor is derived from the idle eight-pose median and clamped by root-relative fit constraints across all 40 complete extracted poses. Width and height use the same requested factor; integer raster dimensions are rounded independently and their subpixel rounding error is recorded per pose. Silhouette height remains pose-sensitive and is not claimed as a rigid anatomical ruler.",
                "scaleDerivation": scale,
                "measurements": measurements,
                "decisions": {clip: "retain one shared physical scale; no per-clip factor" for clip in CLIPS},
                "factorsAppliedToActive": {clip: round(factor, 9) for clip in CLIPS},
                "materialTechnicalScaleDefectsOpen": [],
                "normalizationRun": False,
                "accepted": False,
                "canonExact": False,
                "integrationStatus": "standalone-reviewed-candidate-not-merged",
            }
        },
    }


def build_source_qa(
    queue_profile: dict[str, object],
    queue_clips: dict[str, dict[str, object]],
    keyed_paths: dict[str, Path],
    derived_paths: dict[str, Path],
    active_paths: dict[str, Path],
    all_poses: dict[str, list[ExtractedPose]],
    diagnostics: dict[str, dict[str, object]],
    reviews: dict[str, list[dict[str, object]]],
    scale: dict[str, object],
    asset_outputs: list[Path],
    validation: dict[str, object],
) -> dict[str, object]:
    selected_sources: list[dict[str, object]] = []
    clip_checks: list[dict[str, object]] = []
    for clip in CLIPS:
        raw_path = RAW_DIR / SELECTED[clip]
        pose_rows = reviews[clip]
        cell_hashes = [str(pose["cellPixelSha256"]) for pose in pose_rows]
        raw_foreground_digest = hashlib.sha256()
        for pose in all_poses[clip]:
            raw_foreground_digest.update(bytes.fromhex(pose.foreground_sha256))
        selected_sources.append({
            "clipId": clip,
            "rawPath": rel(raw_path),
            "rawSha256": sha256_file(raw_path),
            "rawBytes": raw_path.stat().st_size,
            "rawSize": list(Image.open(raw_path).size),
            "keyedSourcePath": rel(keyed_paths[clip]),
            "keyedSourceSha256": sha256_file(keyed_paths[clip]),
            "sharedScaleRecompositionPath": rel(derived_paths[clip]),
            "sharedScaleRecompositionSha256": sha256_file(derived_paths[clip]),
            "activePath": rel(active_paths[clip]),
            "activeSha256": sha256_file(active_paths[clip]),
            "activeBytes": active_paths[clip].stat().st_size,
            "activeSize": list(Image.open(active_paths[clip]).size),
            "activeByteIdenticalToRecomposition": sha256_file(active_paths[clip]) == sha256_file(derived_paths[clip]),
            "completeExtractedPoseCount": len(all_poses[clip]),
            "completeExtractedPosePaths": [rel(pose.extracted_path) for pose in all_poses[clip]],
            "combinedExtractedForegroundSha256": raw_foreground_digest.hexdigest(),
            "rawPosesCrossingNominalSourceCells": [pose.frame + 1 for pose in all_poses[clip] if pose.crosses_nominal_cell],
            "chromaDiagnostics": diagnostics[clip],
            "sharedPhysicalScale": scale["sharedPhysicalScale"],
            "poseQa": pose_rows,
        })
        comparison_height = float(statistics.median(int(pose["silhouetteHeightPx"]) for pose in pose_rows))
        comparison_method = "eight-pose median"
        if clip == "death":
            comparison_height = float(pose_rows[0]["silhouetteHeightPx"])
            comparison_method = "death onset frame 1 only; later frames are intentional collapse"
        clip_check: dict[str, object] = {
            "clipId": clip,
            "fps": PLAYBACK[clip]["fps"],
            "loop": PLAYBACK[clip]["loop"],
            "posesReviewed": 8,
            "populatedCells": 8,
            "cellBoundaryContacts": sum(int(bool(pose["touchesTargetCellBoundary"])) for pose in pose_rows),
            "minimumClearancePx": min(int(pose["minimumBoundaryClearancePx"]) for pose in pose_rows),
            "facingRight": "8/8 manually reviewed",
            "identityContinuity": "8/8 manually reviewed",
            "scaleComparisonHeightPx": comparison_height,
            "scaleComparisonMethod": comparison_method,
            "cellPixelHashesDistinct": len(set(cell_hashes)) == 8,
            "chronology": {
                "idle": "restrained breathing/alert loop closes coherently",
                "move": "eight distinct running phases form a coherent cycle",
                "attack": "draw, aim, fire, recoil, lower and reholster chronology",
                "death": "irreversible hit-to-terminal-prone chronology",
                "command": "hardware gesture/device operation then recovery",
            }[clip],
        }
        if clip == "attack":
            clip_check.update({
                "singlePistolContinuity": "8/8 manual best-effort review",
                "heldPoseHolsterState": "frames 3-7 held pistol with thigh holster appearing empty; frames 1-2 draw transition; frame 8 reholstered",
                "weaponDuplicationDetected": 0,
            })
        clip_checks.append(clip_check)

    rejected_path = REJECTED_DIR / "attack-r1-duplicated-holstered-and-held-pistol.png"
    output_validation = [image_record(path) for path in sorted(set(asset_outputs), key=rel)]
    manual_identity = {
        "reviewBasis": "manual review of all six generated boards, high-resolution attack r1/r2 comparison, root-registered playbacks and the 40-pose contact sheet",
        "sameRightFacingAdultMale": "40/40 selected poses pass manual review",
        "headsetAndAntenna": "40/40 selected poses retain the compact headset and antenna",
        "darkQuiltedSuit": "40/40 selected poses retain the dark quilted industrial suit",
        "compactBackpackAndCableLoop": "40/40 selected poses retain the compact backpack and protected cable loop",
        "chestAndForearmController": "controller hardware remains readable across the selected profile; command emphasizes chest/forearm operation",
        "commandHardwareGestures": "8/8 command poses use deliberate human hand/controller hardware gestures",
        "deathTerminalProne": "death frame 8 is a fully prone motionless terminal body",
        "attackR2SinglePistol": "best-effort 8/8 manual pass; held poses show one pistol and an empty thigh holster",
        "attackR1Rejected": "held firing poses retain an additional holstered pistol, creating duplicated weapon state",
        "automaticAcceptance": False,
    }
    return {
        "schema": 1,
        "release": "v66",
        "worklotId": "worklot-002",
        "batchId": BATCH_ID,
        "profileId": PROFILE_ID,
        "generatedAt": "2026-09-01",
        "status": "technical-source-qa-complete-art-not-accepted",
        "method": {
            "chroma": "Strict magenta candidates use r>=185, b>=170, g<=110, r-g>=120, b-g>=110 and abs(r-b)<=100. Exterior background must be four-neighbour connected to the raw board border. Large dense enclosed strict-magenta regions are treated as backdrop holes; small or elongated enclosed regions are preserved as potential authored details.",
            "poseExtraction": "Eight largest complete connected foreground components are grouped 4+4 by row and sorted by centroid x. Nearby auxiliary components are attached to the nearest primary pose. This preserves complete death poses that cross raw nominal cell divisions; naive 384x512 cropping is not used.",
            "recomposition": "Each complete RGBA pose is uniformly resized by one profile-wide factor and placed into an exact 1774x887 4x2 opaque-magenta board. Torso/body-mass landmarks share the target cell centre root; the lower-exclusive physical support is fixed DESIGN_MARGIN_PX above the cell bottom.",
            "scale": "One shared factor is derived from the idle median target height and clamped by root-relative left/right/top fit constraints for all 40 poses. No per-clip factor or non-uniform anatomy stretch is used.",
            "visual": "Manual identity/direction/weapon review plus deterministic overlays, root-registered playback GIFs, a 40-pose contact sheet and a dedicated attack pistol-state sheet.",
            "noNormalization": True,
        },
        "queueContract": {
            "path": rel(QUEUE_PATH),
            "referenceLockSha256": queue_profile["referenceLockSha256"],
            "contentHashAlgorithm": "SHA256(JSON.stringify(prompt))",
            "contractPromptSha256ByClip": {clip: queue_clips[clip]["promptSha256"] for clip in CLIPS},
            "rawUtf8PromptFileSha256ByClip": {clip: queue_clips[clip]["_rawPromptFileSha256"] for clip in CLIPS},
            "contractContentHashesVerified": {clip: queue_clips[clip]["_contractHashVerified"] for clip in CLIPS},
            "readOnly": True,
        },
        "sharedScale": scale,
        "selectedSources": selected_sources,
        "clipChecks": clip_checks,
        "manualIdentityReview": manual_identity,
        "rejectedCandidates": [{
            "clipId": "attack",
            "reason": "attack-r1 firing poses duplicate the sidearm: a pistol is held while a second pistol remains visibly holstered",
            "rawPath": rel(RAW_DIR / "attack-r1-imagegen.png"),
            "path": rel(rejected_path),
            "sha256": sha256_file(rejected_path),
            "bytes": rejected_path.stat().st_size,
            "byteIdenticalToRaw": sha256_file(rejected_path) == sha256_file(RAW_DIR / "attack-r1-imagegen.png"),
        }],
        "visualEvidence": [record for record in output_validation if "/qa/" in record["path"]],
        "outputValidation": output_validation,
        "summary": {
            "boards": 5,
            **validation,
            "rightFacingPoses": 40,
            "identityReviewedPoses": 40,
            "attackSinglePistolPoses": 8,
            "uniformOpaqueExactMagentaBoards": 5,
            "technicalSourceDefectsOpen": 0,
            "artAccepted": False,
            "runtimeIntegrated": False,
            "canonExact": False,
        },
        "processor": file_record(Path(__file__).resolve()),
        "scope": {
            "accepted": False,
            "runtimeIntegrated": False,
            "canonExact": False,
            "normalizationRun": False,
            "globalQueueEdited": False,
            "globalStateEdited": False,
            "globalReferenceEdited": False,
            "globalScaleEdited": False,
            "globalAnchorEdited": False,
            "metadataEdited": False,
            "runtimeManifestEdited": False,
            "gitTouched": False,
        },
    }


def build_event(
    clip: str,
    queue_profile: dict[str, object],
    queue_clip: dict[str, object],
    raw_path: Path,
    derived_path: Path,
    active_path: Path,
    prompt_path: Path,
    source_qa_hash: str,
    review: list[dict[str, object]],
    scale_factor: float,
) -> dict[str, object]:
    raw_hash = sha256_file(raw_path)
    source_hash = sha256_file(active_path)
    prompt_hash = sha256_file(prompt_path)
    if prompt_hash != queue_clip["_rawPromptFileSha256"] or prompt_path.read_text(encoding="utf-8") != queue_clip["prompt"]:
        raise RuntimeError(f"local prompt text does not exactly match decoded queue text for {clip}")
    event: dict[str, object] = {
        "schema": 1,
        "kind": "generated-and-source-repaired",
        "profileId": PROFILE_ID,
        "clipId": clip,
        "provider": "OpenAI ImageGen",
        "generationId": f"sha256:{raw_hash}",
        "providerGenerationIdReturned": False,
        "generationIdProvenance": "No durable provider generation ID was retained; the immutable raw-capture SHA-256 identifies this generation candidate.",
        "actor": REVIEWER,
        "actualPromptPath": rel(prompt_path),
        "actualPromptFileSha256": prompt_hash,
        "promptSha256": prompt_hash,
        "sourcePath": rel(active_path),
        "savedSourcePath": rel(active_path),
        "sourceSha256": source_hash,
        "sourceBytes": active_path.stat().st_size,
        "contractPromptSha256": queue_clip["promptSha256"],
        "queuePromptSha256": queue_clip["promptSha256"],
        "promptContentHashAlgorithm": "SHA256(JSON.stringify(prompt))",
        "promptContentHashSha256": queue_clip["_contentHashSha256"],
        "contractPromptHashVerified": queue_clip["_contractHashVerified"],
        "referenceLockSha256": queue_profile["referenceLockSha256"],
        "rawCapture": {
            "path": rel(raw_path),
            "sha256": raw_hash,
            "bytes": raw_path.stat().st_size,
            "pixelEdits": 0,
        },
        "sourceRepairs": [{
            "kind": "border-connected-chroma-extraction-and-shared-uniform-scale-recomposition",
            "result": "Eight complete poses extracted, uniformly scaled with the single profile factor, root/support aligned, and recomposed into an exact opaque-magenta 1774x887 board.",
            "inputPath": rel(raw_path),
            "inputSha256": raw_hash,
            "outputPath": rel(derived_path),
            "outputSha256": sha256_file(derived_path),
            "sharedPhysicalScale": round(scale_factor, 9),
            "receiptPath": rel(SOURCE_QA_PATH),
            "receiptSha256": source_qa_hash,
        }],
        "generationAttempts": 2 if clip == "attack" else 1,
        "qa": {
            "size": list(EXPECTED_TARGET_SIZE),
            "grid": [4, 2],
            "poseCount": 8,
            "facing": "right-manually-reviewed",
            "cellBoundaryContacts": 0,
            "minimumClearancePx": min(int(pose["minimumBoundaryClearancePx"]) for pose in review),
            "uniformOpaqueExactMagenta": True,
            "sharedPhysicalScale": round(scale_factor, 9),
            "technicalReview": "technical-source-gates-pass-art-not-accepted",
        },
        "accepted": False,
        "runtimeIntegrated": False,
        "canonExact": False,
        "note": f"Profile-local {clip} candidate only; technical source QA passes, but no art acceptance, normalization, runtime integration or global state write is implied.",
        "at": GENERATION_AT,
        "actualPromptText": queue_clip["prompt"],
    }
    if clip == "attack":
        rejected = REJECTED_DIR / "attack-r1-duplicated-holstered-and-held-pistol.png"
        event["rejectedCandidates"] = [{
            "path": rel(rejected),
            "sha256": sha256_file(rejected),
            "bytes": rejected.stat().st_size,
            "reason": "attack-r1 duplicated the sidearm by showing held and holstered pistols simultaneously",
        }]
        event["qa"]["singlePistolContinuity"] = "8/8 manual best-effort review"
        event["qa"]["heldPoseHolsterState"] = "appears empty"
    return event


def artifact_manifest(paths: Iterable[Path]) -> dict[str, object]:
    records: list[dict[str, object]] = []
    for path in sorted({path.resolve() for path in paths}, key=rel):
        if path == ARTIFACT_VALIDATION_PATH.resolve():
            continue
        record = file_record(path)
        try:
            with Image.open(path) as image:
                record.update({
                    "size": list(image.size),
                    "format": image.format,
                    "mode": image.mode,
                    "frames": int(getattr(image, "n_frames", 1)),
                })
        except Exception:
            pass
        records.append(record)
    return {
        "schema": 1,
        "profileId": PROFILE_ID,
        "validatedFiles": len(records),
        "files": records,
        "allPathsExist": all((ROOT / record["path"]).is_file() for record in records),
        "manifestSelfExcluded": "Self-hash is excluded to avoid an impossible recursive digest; hash this file externally for final verification.",
        "accepted": False,
        "runtimeIntegrated": False,
        "canonExact": False,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stage-only", action="store_true", help="build derived and QA evidence, but do not promote active boards or write final documentary JSON")
    args = parser.parse_args()
    started_free = guard_disk("profile-local processing")
    for directory in (DERIVED_DIR, EXTRACTED_DIR, REJECTED_DIR, QA_DIR, HERE):
        assert_owned_write(directory)
        directory.mkdir(parents=True, exist_ok=True)

    queue_profile, queue_clips = load_queue_contract()
    rejected_path = REJECTED_DIR / "attack-r1-duplicated-holstered-and-held-pistol.png"
    preserve_exact(RAW_DIR / "attack-r1-imagegen.png", rejected_path)

    keyed_paths: dict[str, Path] = {}
    derived_paths: dict[str, Path] = {}
    active_paths: dict[str, Path] = {clip: PROFILE_DIR / f"{clip}.png" for clip in CLIPS}
    all_poses: dict[str, list[ExtractedPose]] = {}
    diagnostics: dict[str, dict[str, object]] = {}
    asset_outputs: list[Path] = [rejected_path]

    for clip in CLIPS:
        guard_disk(f"{clip} extraction")
        raw_path = RAW_DIR / SELECTED[clip]
        if not raw_path.is_file():
            raise RuntimeError(f"missing selected raw: {raw_path}")
        keyed, poses, clip_diagnostics = extract_board_poses(clip, raw_path)
        keyed_path = DERIVED_DIR / f"{CANDIDATE_TAG[clip]}-border-keyed-source.png"
        save_png(Image.fromarray(keyed, mode="RGB"), keyed_path)
        keyed_paths[clip] = keyed_path
        all_poses[clip] = poses
        diagnostics[clip] = clip_diagnostics
        asset_outputs.append(keyed_path)
        asset_outputs.extend(pose.extracted_path for pose in poses)

    scale = determine_shared_scale(all_poses)
    shared_factor = float(scale["sharedPhysicalScale"])
    boards: dict[str, np.ndarray] = {}
    reviews: dict[str, list[dict[str, object]]] = {}
    active_images: dict[str, Image.Image] = {}
    for clip in CLIPS:
        guard_disk(f"{clip} shared-scale recomposition")
        board, pose_reviews = compose_clip(clip, all_poses[clip], shared_factor)
        derived_path = DERIVED_DIR / f"{CANDIDATE_TAG[clip]}-shared-scale-recomposed.png"
        save_png(Image.fromarray(board, mode="RGB"), derived_path)
        derived_paths[clip] = derived_path
        boards[clip] = board
        reviews[clip] = pose_reviews
        active_images[clip] = Image.open(derived_path).convert("RGB")
        overlay_path = QA_DIR / f"{clip}-technical-overlay.png"
        playback_path = QA_DIR / f"{clip}-anchor-playback.gif"
        draw_overlay(clip, active_images[clip], pose_reviews, overlay_path)
        draw_playback(clip, active_images[clip], pose_reviews, playback_path)
        asset_outputs.extend([derived_path, overlay_path, playback_path])

    validation = validate_composed(reviews, boards)
    contact_path = QA_DIR / "identity-orientation-anchor-contact.png"
    attack_review_path = QA_DIR / "attack-single-pistol-review.png"
    draw_contact(active_images, reviews, contact_path)
    draw_attack_weapon_review(active_images["attack"], reviews["attack"], attack_review_path)
    asset_outputs.extend([contact_path, attack_review_path])

    stage_summary = {
        "profileId": PROFILE_ID,
        "stageOnly": bool(args.stage_only),
        "sharedPhysicalScale": shared_factor,
        "fitLimitingPose": scale["fitLimitingPose"],
        "validation": validation,
        "deathRawCrossingFrames": [pose.frame + 1 for pose in all_poses["death"] if pose.crosses_nominal_cell],
        "minimumClearanceByClip": {clip: min(int(pose["minimumBoundaryClearancePx"]) for pose in reviews[clip]) for clip in CLIPS},
        "derivedSha256ByClip": {clip: sha256_file(derived_paths[clip]) for clip in CLIPS},
    }
    if args.stage_only:
        stage_summary["activePromoted"] = False
        print(json.dumps(stage_summary, indent=2))
        return

    # Promotion occurs only after all 40 derived cells and visual evidence have
    # passed the deterministic gates above.
    for clip in CLIPS:
        promote_exact(derived_paths[clip], active_paths[clip])
        asset_outputs.append(active_paths[clip])

    anchor_fragment = build_anchor_fragment(reviews, shared_factor)
    scale_fragment = build_scale_fragment(all_poses, reviews, scale)
    write_json(ANCHOR_PATH, anchor_fragment)
    write_json(SCALE_PATH, scale_fragment)

    source_qa = build_source_qa(
        queue_profile,
        queue_clips,
        keyed_paths,
        derived_paths,
        active_paths,
        all_poses,
        diagnostics,
        reviews,
        scale,
        asset_outputs,
        validation,
    )
    write_json(SOURCE_QA_PATH, source_qa)
    source_qa_hash = sha256_file(SOURCE_QA_PATH)

    prompt_paths: dict[str, Path] = {}
    event_paths: dict[str, Path] = {}
    events: list[dict[str, object]] = []
    for clip in CLIPS:
        prompt_path = PROMPT_DIR / f"{clip}.txt"
        write_exact_text(prompt_path, str(queue_clips[clip]["prompt"]))
        if (
            sha256_file(prompt_path) != queue_clips[clip]["_rawPromptFileSha256"]
            or prompt_path.read_text(encoding="utf-8") != queue_clips[clip]["prompt"]
        ):
            raise RuntimeError(f"written prompt text mismatch for {clip}")
        prompt_paths[clip] = prompt_path
        event = build_event(
            clip,
            queue_profile,
            queue_clips[clip],
            RAW_DIR / SELECTED[clip],
            derived_paths[clip],
            active_paths[clip],
            prompt_path,
            source_qa_hash,
            reviews[clip],
            shared_factor,
        )
        event_path = EVENT_DIR / f"{clip}.production-event.json"
        write_json(event_path, event)
        event_paths[clip] = event_path
        events.append(event)

    event_validation = {
        "schema": 1,
        "validation": "profile-local-event-contract-check",
        "wroteGlobalState": False,
        "jobStatus": "generated",
        "generatedClips": 5,
        "requiredClips": 5,
        "issues": [],
        "events": [{
            "clipId": event["clipId"],
            "kind": event["kind"],
            "sourceSha256": event["sourceSha256"],
            "promptSha256": event["promptSha256"],
            "contractPromptSha256": event["contractPromptSha256"],
            "referenceLockSha256": event["referenceLockSha256"],
            "eventPath": rel(event_paths[str(event["clipId"])]),
            "eventSha256": sha256_file(event_paths[str(event["clipId"])]),
            "accepted": event["accepted"],
            "runtimeIntegrated": event["runtimeIntegrated"],
            "canonExact": event["canonExact"],
        } for event in events],
    }
    if any(event["accepted"] or event["runtimeIntegrated"] or event["canonExact"] for event in events):
        raise RuntimeError("event acceptance/runtime/canon flags must all remain false")
    write_json(EVENT_VALIDATION_PATH, event_validation)

    receipts = {
        "schema": 1,
        "profileId": PROFILE_ID,
        "provider": "OpenAI ImageGen",
        "referenceLockSha256": queue_profile["referenceLockSha256"],
        "receipts": [{
            "clipId": clip,
            "promptPath": rel(prompt_paths[clip]),
            "promptSha256": sha256_file(prompt_paths[clip]),
            "contractPromptSha256": queue_clips[clip]["promptSha256"],
            "promptContentHashAlgorithm": "SHA256(JSON.stringify(prompt))",
            "promptContentHashSha256": queue_clips[clip]["_contentHashSha256"],
            "contractPromptHashVerified": queue_clips[clip]["_contractHashVerified"],
            "rawCapture": file_record(RAW_DIR / SELECTED[clip]),
            "keyedSource": file_record(keyed_paths[clip]),
            "completeExtractedPoses": [file_record(pose.extracted_path) for pose in all_poses[clip]],
            "sharedScaleDerivative": file_record(derived_paths[clip]),
            "sharedPhysicalScale": round(shared_factor, 9),
            "sourcePath": rel(active_paths[clip]),
            "sourceSha256": sha256_file(active_paths[clip]),
            "sourceBytes": active_paths[clip].stat().st_size,
            "eventPath": rel(event_paths[clip]),
            "eventSha256": sha256_file(event_paths[clip]),
        } for clip in CLIPS],
        "sourceQa": file_record(SOURCE_QA_PATH),
        "anchorFragment": file_record(ANCHOR_PATH),
        "scaleFragment": file_record(SCALE_PATH),
        "processor": file_record(Path(__file__).resolve()),
        "eventValidation": file_record(EVENT_VALIDATION_PATH),
        "rejectedCandidates": [file_record(rejected_path)],
        "accepted": False,
        "runtimeIntegrated": False,
        "canonExact": False,
        "stateWrites": 0,
        "normalizationRuns": 0,
    }
    write_json(RECEIPTS_PATH, receipts)

    manifest_paths = [
        Path(__file__).resolve(),
        QUEUE_PATH,
        SOURCE_QA_PATH,
        ANCHOR_PATH,
        SCALE_PATH,
        RECEIPTS_PATH,
        EVENT_VALIDATION_PATH,
        *(RAW_DIR / name for name in SELECTED.values()),
        RAW_DIR / "attack-r1-imagegen.png",
        *asset_outputs,
        *prompt_paths.values(),
        *event_paths.values(),
    ]
    manifest = artifact_manifest(manifest_paths)
    write_json(ARTIFACT_VALIDATION_PATH, manifest)

    stage_summary.update({
        "activePromoted": True,
        "activeSha256ByClip": {clip: sha256_file(active_paths[clip]) for clip in CLIPS},
        "sourceQa": file_record(SOURCE_QA_PATH),
        "anchorFragment": file_record(ANCHOR_PATH),
        "scaleFragment": file_record(SCALE_PATH),
        "generationReceipts": file_record(RECEIPTS_PATH),
        "eventValidation": file_record(EVENT_VALIDATION_PATH),
        "artifactValidation": file_record(ARTIFACT_VALIDATION_PATH),
        "completedFreeBytes": guard_disk("documentary bundle completion"),
        "startedFreeBytes": started_free,
        "accepted": False,
        "runtimeIntegrated": False,
        "canonExact": False,
    })
    print(json.dumps(stage_summary, indent=2))


if __name__ == "__main__":
    main()
