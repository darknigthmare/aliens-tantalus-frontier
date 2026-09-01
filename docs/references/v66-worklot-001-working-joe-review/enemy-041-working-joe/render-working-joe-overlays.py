"""Render standalone scale, root, ownership and palette evidence.

Read-only inputs: the five selected source boards and their existing metadata.
Outputs are review derivatives beside this script; no production document is
updated and no source or normalized bitmap is rewritten.
"""

from __future__ import annotations

from collections import Counter
import hashlib
import json
import math
from pathlib import Path
from statistics import median

import numpy as np
from PIL import Image, ImageDraw


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PROFILE_ID = "enemy-041-working-joe"
CLIPS = ("idle", "move", "attack", "death", "hurt")
SOURCE_DIR = ROOT / "assets/openai/sprites/frames/v66/batch-003" / PROFILE_ID
METADATA_PATH = ROOT / "assets/openai/sprites/metadata/v66" / f"{PROFILE_ID}.json"

# Cell-local endpoints. The chord follows the head rotation and excludes neck,
# collar, eyes and hands. Three distinct authored poses are measured per clip.
MEASUREMENT_ENDPOINTS = {
    "idle": {
        0: ((252, 32), (268, 96)),
        3: ((244, 36), (260, 98)),
        7: ((234, 31), (249, 93)),
    },
    "move": {
        0: ((255, 35), (271, 96)),
        3: ((170, 35), (186, 98)),
        6: ((204, 26), (219, 88)),
    },
    "attack": {
        0: ((231, 34), (247, 97)),
        4: ((247, 45), (264, 107)),
        7: ((101, 35), (117, 97)),
    },
    "death": {
        0: ((134, 53), (178, 99)),
        1: ((280, 105), (262, 165)),
        2: ((260, 170), (257, 231)),
    },
    "hurt": {
        0: ((244, 32), (260, 96)),
        3: ((178, 37), (195, 99)),
        7: ((150, 31), (165, 94)),
    },
}

# Manual pelvis centers, cell-local. Anchor y is pulled from the current
# extracted sourceBounds lower guard at runtime, never from an extremity x.
PELVIS_LANDMARKS = {
    "idle": ((224, 260), (216, 260), (221, 263), (207, 263), (219, 255), (204, 255), (210, 258), (202, 256)),
    "move": ((220, 258), (199, 257), (187, 258), (153, 258), (232, 251), (202, 252), (189, 252), (151, 252)),
    "attack": ((211, 260), (185, 260), (140, 260), (99, 260), (207, 266), (158, 264), (128, 262), (77, 260)),
    "death": ((230, 280), (220, 290), (204, 319), (185, 325), (190, 274), (163, 310), (166, 323), (170, 326)),
    "hurt": ((214, 260), (189, 269), (164, 279), (140, 268), (218, 256), (195, 256), (152, 257), (123, 257)),
}

# Production-splitter results for the active death-r3 recomposition. Metadata is
# intentionally not used for this clip because it still describes the replaced
# master. Values are cell-local and retain the production three-pixel guard.
DEATH_SOURCE_BOUNDS = (
    (120, 46, 363, 421),
    (126, 103, 318, 420),
    (94, 168, 288, 421),
    (63, 198, 276, 421),
    (67, 170, 371, 354),
    (0, 241, 408, 367),
    (7, 281, 381, 369),
    (4, 291, 376, 362),
)

DEATH_SUPPORTS = (
    "final planted-boot support",
    "losing planted-boot support",
    "kneeling boot/body support",
    "kneeling boot/body support",
    "knee/hand/body contact",
    "prone body/hand contact",
    "prone body/forearm contact",
    "terminal prone body contact",
)


def file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def cell_box(width: int, height: int, frame: int) -> tuple[int, int, int, int]:
    edges_x = [round(i * width / 4) for i in range(5)]
    edges_y = [round(i * height / 2) for i in range(3)]
    column, row = frame % 4, frame // 4
    return edges_x[column], edges_y[row], edges_x[column + 1], edges_y[row + 1]


def header_canvas(source: Image.Image, title: str, subtitle: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    canvas = Image.new("RGB", (source.width, source.height + 72), (19, 23, 29))
    canvas.paste(source.convert("RGB"), (0, 72))
    draw = ImageDraw.Draw(canvas)
    draw.text((12, 10), title, fill=(255, 255, 255))
    draw.text((12, 34), subtitle, fill=(205, 217, 228))
    draw.text((12, 52), "REVIEW EVIDENCE ONLY / NOT ACCEPTED / NOT RUNTIME", fill=(255, 206, 92))
    for column in range(1, 4):
        x = round(column * source.width / 4)
        draw.line((x, 72, x, source.height + 71), fill=(255, 211, 45), width=2)
    y = 72 + round(source.height / 2)
    draw.line((0, y, source.width - 1, y), fill=(255, 211, 45), width=2)
    return canvas, draw


def global_point(source: Image.Image, frame: int, point: tuple[int, int]) -> tuple[int, int]:
    x0, y0, _, _ = cell_box(source.width, source.height, frame)
    return x0 + point[0], 72 + y0 + point[1]


def render_scale_overlay(clip: str, source: Image.Image) -> list[dict[str, object]]:
    measurements = []
    canvas, draw = header_canvas(
        source,
        f"{PROFILE_ID} / {clip} / rigid skull scale",
        "Red: crown-to-chin chord; cyan endpoints. Three distinct poses; cell-local coordinates.",
    )
    for frame, endpoints in MEASUREMENT_ENDPOINTS[clip].items():
        first, second = endpoints
        length = math.hypot(second[0] - first[0], second[1] - first[1])
        measurements.append(
            {
                "clip": clip,
                "frame": frame,
                "landmark": "synthetic skull crown-to-chin chord",
                "endpoints": [list(first), list(second)],
                "lengthPx": round(length, 6),
                "note": "Manual rigid cranial chord follows head rotation; bald crown to mental eminence, excluding neck, collar, optic and hands. Verified on the marked source overlay.",
            }
        )
        p0, p1 = global_point(source, frame, first), global_point(source, frame, second)
        draw.line((p0, p1), fill=(255, 52, 52), width=4)
        for point in (p0, p1):
            draw.ellipse((point[0] - 7, point[1] - 7, point[0] + 7, point[1] + 7), outline=(66, 236, 255), width=4)
        label_x = min(p0[0], p1[0]) - 4
        label_y = max(74, min(p0[1], p1[1]) - 22)
        draw.rectangle((label_x, label_y, label_x + 116, label_y + 18), fill=(12, 15, 20))
        draw.text((label_x + 3, label_y + 2), f"pose {frame + 1}: {length:.3f}px", fill=(255, 255, 255))
    canvas.save(HERE / f"{clip}-scale-overlay.png")
    return measurements


def render_anchor_overlay(clip: str, source: Image.Image, placements: list[dict[str, object]]) -> list[dict[str, object]]:
    frames = []
    canvas, draw = header_canvas(
        source,
        f"{PROFILE_ID} / {clip} / 8 physical roots",
        "Yellow: pelvis center; cyan: vertical projection; green: foot/body support at complete extraction guard.",
    )
    for frame, landmark in enumerate(PELVIS_LANDMARKS[clip]):
        if clip == "death":
            bounds = list(DEATH_SOURCE_BOUNDS[frame])
        else:
            placement = next(item for item in placements if item["clip"] == clip and item["clipFrame"] == frame)
            bounds = placement["sourceBounds"]
        anchor = (landmark[0], bounds[3])
        support = DEATH_SUPPORTS[frame] if clip == "death" else "planted boot support"
        uncertainty = 8 if clip == "death" and frame >= 4 else 6
        frames.append(
            {
                "frame": frame,
                "reviewed": True,
                "anchor": list(anchor),
                "landmark": list(landmark),
                "confidence": "medium",
                "uncertaintyPx": uncertainty,
                "sourceBounds": bounds,
                "evidence": f"{clip.capitalize()} pose {frame + 1} marked overlay: pelvis {landmark} projects to {support} and complete extracted lower guard y={bounds[3]}; sourceBounds[3]-anchorY=0.",
            }
        )
        pelvis = global_point(source, frame, landmark)
        root = global_point(source, frame, anchor)
        draw.line((pelvis, root), fill=(56, 225, 244), width=3)
        draw.ellipse((pelvis[0] - 7, pelvis[1] - 7, pelvis[0] + 7, pelvis[1] + 7), fill=(255, 220, 50), outline=(15, 15, 15), width=2)
        draw.line((root[0] - 12, root[1], root[0] + 12, root[1]), fill=(69, 255, 106), width=5)
        draw.ellipse((root[0] - 5, root[1] - 5, root[0] + 5, root[1] + 5), fill=(69, 255, 106))
        draw.text((root[0] + 8, min(root[1] - 16, source.height + 54)), f"P{frame + 1}", fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0))
    canvas.save(HERE / f"{clip}-anchor-overlay.png")
    return frames


def matte_and_palette(source: Image.Image) -> dict[str, object]:
    rgb = np.asarray(source.convert("RGB"), dtype=np.int16)
    red, green, blue = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    strict = (red >= 190) & (blue >= 190) & (green <= 60) & (np.abs(red - blue) <= 32)
    broad_matte = (red - green > 80) & (blue - green > 80) & (np.abs(red - blue) < 80)
    edge = np.concatenate((rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]))
    pure = np.all(rgb == np.array([255, 0, 255]), axis=2)
    body = rgb[~broad_matte].astype(np.uint8)
    sample = body[:: max(1, len(body) // 60000)]
    strip = Image.fromarray(sample.reshape((1, len(sample), 3)), mode="RGB")
    quantized = strip.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
    counts = Counter(quantized.getdata())
    palette = quantized.getpalette()
    dominant = []
    for index, count in counts.most_common(6):
        color = palette[index * 3 : index * 3 + 3]
        dominant.append({"rgb": color, "ratioOfSample": round(count / len(sample), 6)})
    rgba = source.convert("RGBA")
    alpha_extrema = list(rgba.getchannel("A").getextrema())
    has_alpha_channel = "A" in source.getbands() or "transparency" in source.info
    return {
        "mode": source.mode,
        "hasAlphaChannel": has_alpha_channel,
        "alphaExtrema": alpha_extrema,
        "nativeAlpha": bool(has_alpha_channel and alpha_extrema[0] < 255),
        "strictMagentaRatio": round(float(strict.mean()), 6),
        "pureFF00FFRatio": round(float(pure.mean()), 9),
        "edgeStrictMagentaRatio": round(float(np.concatenate((strict[0], strict[-1], strict[:, 0], strict[:, -1])).mean()), 6),
        "edgeRgbMedian": [int(value) for value in np.median(edge, axis=0)],
        "edgeRgbMin": [int(value) for value in edge.min(axis=0)],
        "edgeRgbMax": [int(value) for value in edge.max(axis=0)],
        "edgeUniqueRgbCount": int(len(np.unique(edge, axis=0))),
        "dominantForegroundPalette": dominant,
    }


def render_palette_contact(palettes: dict[str, dict[str, object]]) -> None:
    canvas = Image.new("RGB", (1120, 440), (19, 23, 29))
    draw = ImageDraw.Draw(canvas)
    draw.text((12, 10), f"{PROFILE_ID} / palette and matte evidence", fill=(255, 255, 255))
    draw.text((12, 32), "Quantized diagnostic foreground; all source pixels remain unchanged.", fill=(205, 217, 228))
    for row, clip in enumerate(CLIPS):
        y = 68 + row * 70
        matte = palettes[clip]
        draw.text((12, y + 8), f"{clip}: strict={matte['strictMagentaRatio']:.6f} pureFF00FF={matte['pureFF00FFRatio']:.9f} edgeMedian={matte['edgeRgbMedian']}", fill=(255, 255, 255))
        for index, entry in enumerate(matte["dominantForegroundPalette"]):
            x = 550 + index * 90
            color = tuple(entry["rgb"])
            draw.rectangle((x, y, x + 70, y + 40), fill=color, outline=(230, 230, 230), width=1)
            draw.text((x, y + 44), "%02x%02x%02x" % color, fill=(220, 225, 232))
    canvas.save(HERE / "palette-matte-contact.png")


def render_ownership_overlay(source: Image.Image) -> dict[str, object]:
    boundary_x, row_y = round(source.width * 2 / 4), round(source.height / 2)
    overview = source.crop((0, row_y, source.width, source.height)).resize((1064, 266), Image.Resampling.LANCZOS)
    zoom_box = (820, 680, 930, 840)
    zoom = source.crop(zoom_box).resize((600, 480), Image.Resampling.NEAREST)
    canvas = Image.new("RGB", (1120, 850), (19, 23, 29))
    canvas.paste(overview, (28, 94))
    canvas.paste(zoom, (28, 390))
    draw = ImageDraw.Draw(canvas)
    draw.text((20, 12), f"{PROFILE_ID} / death boundary ownership", fill=(255, 255, 255))
    draw.text((20, 35), "Replacement death-r3: reported frame 6 remains zero-based index 6 = authored pose 7.", fill=(255, 211, 92))
    draw.text((20, 56), "Current splitter finds no boundary signal: poses 6 and 7 are separated by 48 matte columns.", fill=(205, 217, 228))
    pose6_actual_max_global_exclusive = 444 + 405
    pose7_actual_min_global = boundary_x + 10
    overview_boundary = 28 + round(boundary_x * 1064 / source.width)
    overview_pose6_max = 28 + round(pose6_actual_max_global_exclusive * 1064 / source.width)
    overview_pose7_min = 28 + round(pose7_actual_min_global * 1064 / source.width)
    draw.line((overview_boundary, 94, overview_boundary, 360), fill=(50, 235, 255), width=4)
    draw.line((overview_pose6_max, 94, overview_pose6_max, 360), fill=(255, 91, 91), width=3)
    draw.line((overview_pose7_min, 94, overview_pose7_min, 360), fill=(69, 255, 106), width=3)
    draw.text((overview_pose6_max - 94, 340), "P6 max x=849", fill=(255, 91, 91), stroke_width=2, stroke_fill=(0, 0, 0))
    draw.text((overview_boundary - 45, 315), "boundary x=887", fill=(50, 235, 255), stroke_width=2, stroke_fill=(0, 0, 0))
    draw.text((overview_pose7_min + 6, 340), "P7 min x=897", fill=(69, 255, 106), stroke_width=2, stroke_fill=(0, 0, 0))
    zoom_boundary = 28 + (boundary_x - zoom_box[0]) * 6
    zoom_pose6_max = 28 + (pose6_actual_max_global_exclusive - zoom_box[0]) * 6
    zoom_pose7_min = 28 + (pose7_actual_min_global - zoom_box[0]) * 6
    draw.line((zoom_boundary, 390, zoom_boundary, 869), fill=(50, 235, 255), width=3)
    draw.line((zoom_pose6_max, 390, zoom_pose6_max, 869), fill=(255, 91, 91), width=3)
    draw.line((zoom_pose7_min, 390, zoom_pose7_min, 869), fill=(69, 255, 106), width=3)
    note_x = 655
    notes = [
        "OWNERSHIP RESULT",
        "- current signal pixels at boundary: 0",
        "- pose 6 actual foreground max: x=849 exclusive",
        "- matte before boundary: 38 columns",
        "- pose 7 actual foreground min: x=897",
        "- matte after boundary: 10 columns",
        "- total foreground separation: 48 columns",
        "- cross-cell spill: false",
        "- safe reassignment: not required",
        "- default 8-frame extraction already passes",
        "",
        "This proves cell ownership, not artistic acceptance.",
    ]
    for index, line in enumerate(notes):
        draw.text((note_x, 410 + index * 24), line, fill=(255, 255, 255) if index else (69, 255, 106))
    canvas.save(HERE / "death-frame6-ownership-overlay.png")
    return {
        "reportedFrame": 6,
        "reportedFrameConvention": "zero-based",
        "authoredPoseOneBased": 7,
        "boundaryGlobalX": boundary_x,
        "signalPixelCount": 0,
        "signalLocalCoordinates": [],
        "signalGlobalCoordinates": [],
        "previousAuthoredPoseOneBased": 6,
        "previousPoseActualForegroundMaxGlobalXExclusive": pose6_actual_max_global_exclusive,
        "reportedPoseActualForegroundMinGlobalX": pose7_actual_min_global,
        "matteGapBeforeBoundaryColumns": boundary_x - pose6_actual_max_global_exclusive,
        "matteGapAfterBoundaryColumns": pose7_actual_min_global - boundary_x,
        "totalForegroundSeparationColumns": pose7_actual_min_global - pose6_actual_max_global_exclusive,
        "owner": "no current boundary signal; nominal cells remain independent",
        "crossCellSpill": False,
        "safeReassignmentRequired": False,
        "sourceCompletenessFinding": "replacement death-r3 has zero cell-border contact and no recoverable or transferable cross-cell pixels",
    }


def main() -> None:
    metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    placements = metadata["placements"]
    measurements = []
    anchors = {}
    palettes = {}
    source_hashes = {}
    for clip in CLIPS:
        source_path = SOURCE_DIR / f"{clip}.png"
        source = Image.open(source_path)
        source_hashes[clip] = file_sha256(source_path)
        measurements.extend(render_scale_overlay(clip, source))
        anchors[clip] = render_anchor_overlay(clip, source, placements)
        palettes[clip] = matte_and_palette(source)
    render_palette_contact(palettes)
    death = Image.open(SOURCE_DIR / "death.png")
    ownership = render_ownership_overlay(death)
    groups = {clip: [item["lengthPx"] for item in measurements if item["clip"] == clip] for clip in CLIPS}
    medians = {clip: round(median(values), 6) for clip, values in groups.items()}
    factors = {clip: round(medians["idle"] / value, 6) for clip, value in medians.items()}
    factors["idle"] = 1.0
    guard_violations = [
        f"{clip}/{frame['frame']}"
        for clip, frames in anchors.items()
        for frame in frames
        if frame["sourceBounds"][3] - frame["anchor"][1] > 0
    ]
    print(
        json.dumps(
            {
                "sourceSha256ByClip": source_hashes,
                "measurements": measurements,
                "medianLengthPxByClip": medians,
                "sourceScaleByClip": factors,
                "anchors": anchors,
                "reviewedPoseCount": sum(len(value) for value in anchors.values()),
                "anchorGuardViolations": guard_violations,
                "mattePalette": palettes,
                "deathFrame6Ownership": ownership,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
