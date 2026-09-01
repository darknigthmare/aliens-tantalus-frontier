"""Profile-local V66 technical audit for enemy-039-abomination.

This script reads the four unchanged source boards and writes only standalone,
merge-compatible review fragments plus diagnostic evidence. It never mutates a
source board, global review, queue/state/reference document, metadata, runtime
asset, or acceptance flag.
"""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path
from statistics import median

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PROFILE = "enemy-039-abomination"
BATCH = "batch-003"
REVIEWER = "Codex /root/generate_profile_039"
REVIEWED_AT = "2026-09-01"
SOURCE_ROOT = Path("assets/openai/sprites/frames/v66/batch-003/enemy-039-abomination")
QA_ROOT = Path("docs/references/v66-worklot-001-abomination-qa")
SCALE_FRAGMENT = Path("docs/references/V66_WORKLOT_001_ABOMINATION_SCALE_REVIEW.json")
ANCHOR_FRAGMENT = Path("docs/references/V66_WORKLOT_001_ABOMINATION_ANCHOR_REVIEW.json")
TECHNICAL_QA = Path("docs/references/V66_WORKLOT_001_ABOMINATION_TECHNICAL_QA.json")
REPORT = Path("docs/references/V66_WORKLOT_001_ABOMINATION_TECHNICAL_AUDIT.md")
PROVENANCE = Path("docs/references/V66_WORKLOT_001_ABOMINATION_QA_PROVENANCE.json")
VALIDATION = Path("docs/references/V66_WORKLOT_001_ABOMINATION_FRAGMENT_VALIDATION.json")

CLIPS = {
    "idle": {
        "fps": 6,
        "loop": True,
        "sourceSha256": "0cea773831438d31343e338f5341b0293b0908b65a190bd02dc94326ff3c423e",
        "poses": [
            "heavy neutral rest",
            "torso inhale",
            "shoulders rise slightly",
            "one growth tightens near the ground",
            "peak alert without turning",
            "weight shifts to the opposite leg",
            "shoulders settle",
            "near-neutral loop closure",
        ],
        "landmarks": [[220, 330], [220, 330], [215, 333], [220, 330], [220, 330], [218, 330], [216, 330], [220, 330]],
        "confidence": "medium",
        "uncertaintyPx": 7,
    },
    "move": {
        "fps": 12,
        "loop": True,
        "sourceSha256": "cc85915ba81c5a1346f7710e4eeafe9df8023c37765ba7464219bae359b3a8b1",
        "poses": [
            "rear-foot contact",
            "opposite growth reaches for support",
            "growth plants without sliding",
            "body mass passes over support",
            "rear foot recovers",
            "opposite foot contacts",
            "growth unloads",
            "return to cycle alignment",
        ],
        "landmarks": [[190, 330], [185, 325], [180, 325], [190, 330], [165, 325], [170, 325], [200, 330], [218, 332]],
        "confidence": "medium",
        "uncertaintyPx": 8,
    },
    "attack": {
        "fps": 12,
        "loop": False,
        "sourceSha256": "6866ee637342b1d0ed0f8184cfc4e7433254228ac5f0d9010cc9de7a3cc94caf",
        "poses": [
            "braced neutral",
            "weight shifts rearward",
            "both growths draw up",
            "peak double-arm wind-up",
            "downward acceleration",
            "two-growth ground impact",
            "compressed follow-through",
            "controlled recovery",
        ],
        "landmarks": [[195, 335], [190, 337], [225, 335], [250, 325], [210, 360], [195, 370], [198, 368], [200, 345]],
        "confidence": "medium",
        "uncertaintyPx": 9,
    },
    "death": {
        "fps": 10,
        "loop": False,
        "sourceSha256": "ec99381b0a967b6bc7099e95476d8b6529e01418d1eeb58073b7e2d02c204d44",
        "poses": [
            "lethal hit",
            "upper-body recoil",
            "one arm-growth support buckles",
            "knees lose load",
            "torso descends",
            "side impact",
            "growths settle",
            "terminal motionless body",
        ],
        "landmarks": [[220, 340], [205, 350], [195, 360], [190, 370], [190, 375], [188, 380], [190, 382], [190, 385]],
        "confidence": "medium",
        "uncertaintyPx": 10,
    },
}

# Same internal seam-to-seam diameter on the least-occluded forward terminal
# fist growth. Whole arm reach and global pose/corpse bounds are excluded.
PRIMARY_MEASUREMENTS = [
    ("idle", 0, [[286, 313], [286, 394]]),
    ("idle", 2, [[281, 319], [281, 401]]),
    ("idle", 4, [[283, 318], [283, 399]]),
    ("move", 0, [[320, 316], [320, 398]]),
    ("move", 1, [[337, 315], [337, 399]]),
    ("move", 3, [[326, 330], [328, 413]]),
    ("attack", 0, [[350, 320], [350, 399]]),
    ("attack", 1, [[330, 316], [330, 396]]),
    ("attack", 7, [[350, 350], [350, 410]]),
    ("death", 1, [[361, 332], [361, 411]]),
    ("death", 2, [[361, 337], [361, 411]]),
    ("death", 3, [[385, 334], [385, 414]]),
]

# Secondary skull chord used only as a cross-check. It is not mixed into the
# merge factor because head occlusion and rotation are materially higher.
CRANIAL_CROSSCHECKS = [
    ("idle", 0, [[247, 164], [298, 190]]),
    ("idle", 4, [[247, 160], [299, 187]]),
    ("move", 0, [[244, 161], [299, 190]]),
    ("move", 7, [[247, 158], [300, 189]]),
    ("attack", 0, [[218, 191], [254, 224]]),
    ("attack", 7, [[235, 205], [265, 225]]),
    ("death", 1, [[245, 185], [273, 210]]),
    ("death", 2, [[232, 242], [262, 265]]),
]

RESERVATIONS = [
    "Idle far-arm shoulder-to-elbow-to-growth continuity is strongly occluded in several poses even though the second terminal mass remains visible.",
    "Move frames 4-5 carry a much longer horizontal silhouette; the rigid fist and cranial checks indicate pose extension rather than a whole-actor scale change, but the transition into frame 4 deserves runtime cadence review.",
    "Attack frames 2-3 hide most of the far arm behind the overhead growth. The double-growth wind-up remains readable as an action sequence, but full two-arm topology is not equally legible in every silhouette.",
    "Death frame 0 reads as an already reared post-impact pose, and the cranial chord becomes rotation-sensitive during collapse.",
    "The secondary cranial chord contracts sharply in late attack and early death compared with idle. Occlusion and rotation contribute, but the available pixels do not certify fully stable head scale; this blocks automatic artistic acceptance and makes the fist-derived factors low-confidence calibration candidates.",
    "All merge factors and roots are physical-registration candidates only. They do not grant artistic acceptance, normalization approval, or runtime integration.",
]


def repo(path: Path | str) -> Path:
    value = Path(path)
    target = (ROOT / value).resolve()
    if value.is_absolute() or not target.is_relative_to(ROOT):
        raise ValueError(f"Repository-relative path required: {path}")
    return target


def relative(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path: Path, value: object) -> None:
    target = repo(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")


def edges(length: int, count: int) -> list[int]:
    return [round(index * length / count) for index in range(count + 1)]


def exact_foreground(rgba: np.ndarray) -> np.ndarray:
    magenta = np.all(rgba == np.array([255, 0, 255, 255], dtype=np.uint8), axis=2)
    return ~magenta


def length(points: list[list[int]]) -> float:
    return round(math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]), 3)


def endpoint_near_foreground(mask: np.ndarray, point: list[int], radius: int = 8) -> bool:
    x, y = point
    x0, x1 = max(0, x - radius), min(mask.shape[1], x + radius + 1)
    y0, y1 = max(0, y - radius), min(mask.shape[0], y + radius + 1)
    return bool(mask[y0:y1, x0:x1].any())


def load_sources() -> tuple[dict[str, Image.Image], dict[str, list[dict]], dict[str, list[np.ndarray]]]:
    sources: dict[str, Image.Image] = {}
    frames: dict[str, list[dict]] = {}
    masks: dict[str, list[np.ndarray]] = {}
    for clip, spec in CLIPS.items():
        path = repo(SOURCE_ROOT / f"{clip}.png")
        if sha256(path) != spec["sourceSha256"]:
            raise ValueError(f"Stale source SHA-256: {clip}")
        source = Image.open(path).convert("RGBA")
        if source.size != (1774, 887):
            raise ValueError(f"Unexpected source size: {clip} {source.size}")
        rgba = np.asarray(source, dtype=np.uint8)
        if int(rgba[..., 3].min()) != 255 or int(rgba[..., 3].max()) != 255:
            raise ValueError(f"Expected opaque chroma source: {clip}")
        x_edges, y_edges = edges(source.width, 4), edges(source.height, 2)
        clip_frames: list[dict] = []
        clip_masks: list[np.ndarray] = []
        for index in range(8):
            column, row = index % 4, index // 4
            cell_rgba = rgba[y_edges[row]:y_edges[row + 1], x_edges[column]:x_edges[column + 1]]
            mask = exact_foreground(cell_rgba)
            ys, xs = np.where(mask)
            if not len(xs):
                raise ValueError(f"Empty pose: {clip}/{index}")
            bounds = [int(xs.min()), int(ys.min()), int(xs.max() + 1), int(ys.max() + 1)]
            touches = bool(mask[0].any() or mask[-1].any() or mask[:, 0].any() or mask[:, -1].any())
            if touches:
                raise ValueError(f"Cell contact: {clip}/{index}")
            landmark = spec["landmarks"][index]
            if not endpoint_near_foreground(mask, landmark, 4):
                raise ValueError(f"Physical landmark is not on the actor: {clip}/{index} {landmark}")
            anchor = [landmark[0], bounds[3]]
            clip_frames.append({
                "frame": index,
                "chronology": spec["poses"][index],
                "sourceBounds": bounds,
                "foregroundPixels": int(mask.sum()),
                "foregroundSize": [bounds[2] - bounds[0], bounds[3] - bounds[1]],
                "centroid": [round(float(xs.mean()), 3), round(float(ys.mean()), 3)],
                "supportLineYInclusive": bounds[3] - 1,
                "cellBoundaryContact": touches,
                "facing": "right",
                "orientationReviewed": True,
                "orientationConfidence": "high" if clip in {"idle", "move"} else "medium",
                "landmark": landmark,
                "anchor": anchor,
                "anchorConfidence": spec["confidence"],
                "anchorUncertaintyPx": spec["uncertaintyPx"],
                "bodyRootRule": "pelvis/central-body-mass vertical projection; terminal fist growth excluded as body root",
            })
            padded = np.zeros((444, 444), dtype=bool)
            padded[:mask.shape[0], :mask.shape[1]] = mask
            clip_masks.append(padded)
        sources[clip] = source
        frames[clip] = clip_frames
        masks[clip] = clip_masks
    return sources, frames, masks


def transition_metrics(masks: list[np.ndarray], loop: bool) -> list[dict]:
    pairs = [(index, index + 1) for index in range(7)]
    if loop:
        pairs.append((7, 0))
    output = []
    for left, right in pairs:
        intersection = int(np.logical_and(masks[left], masks[right]).sum())
        union = int(np.logical_or(masks[left], masks[right]).sum())
        output.append({
            "from": left,
            "to": right,
            "maskIoU": round(intersection / union if union else 1.0, 6),
            "areaRatio": round(float(masks[right].sum()) / float(masks[left].sum()), 6),
        })
    return output


def build_measurements(raw: list[tuple[str, int, list[list[int]]]], masks: dict[str, list[np.ndarray]], landmark: str, uncertainty: int) -> list[dict]:
    output = []
    for clip, frame, points in raw:
        if any(not endpoint_near_foreground(masks[clip][frame], point) for point in points):
            raise ValueError(f"Scale endpoint misses actor: {clip}/{frame} {points}")
        output.append({
            "clip": clip,
            "frame": frame,
            "endpoints": points,
            "lengthPx": length(points),
            "landmark": landmark,
            "uncertaintyPx": uncertainty,
            "note": (
                "Same internal seam-to-seam diameter on the least-occluded forward terminal fist growth; "
                "whole arm reach, global pose bounds and corpse width excluded."
                if landmark == "terminal-fist-growth-seam-diameter"
                else "Posterior skull root to jaw-tip chord; secondary occlusion/rotation cross-check only."
            ),
        })
    return output


def medians_by_clip(measurements: list[dict]) -> dict[str, float]:
    return {
        clip: round(median([record["lengthPx"] for record in measurements if record["clip"] == clip]), 3)
        for clip in CLIPS
    }


def factors(medians: dict[str, float]) -> dict[str, float]:
    baseline = medians["idle"]
    return {clip: 1.0 if clip == "idle" else round(baseline / value, 6) for clip, value in medians.items()}


def font() -> ImageFont.ImageFont:
    return ImageFont.load_default()


def draw_anchor_overlays(sources: dict[str, Image.Image], frames: dict[str, list[dict]]) -> list[str]:
    output_paths = []
    for clip, source in sources.items():
        header = 105
        canvas = Image.new("RGB", (source.width, source.height + header), (17, 24, 30))
        canvas.paste(source.convert("RGB"), (0, header))
        draw = ImageDraw.Draw(canvas)
        draw.text((14, 10), f"{PROFILE} / {clip} / 8 physical roots / SOURCE REVIEW ONLY - NOT ART ACCEPTANCE", fill=(255, 255, 255), font=font())
        draw.text((14, 30), "Yellow: pelvis/central mass. White: projected body root. Green: support plane. Orange: foreground bounds.", fill=(255, 225, 130), font=font())
        draw.text((14, 50), f"Source SHA-256 {CLIPS[clip]['sourceSha256']}", fill=(195, 218, 232), font=font())
        draw.line((1450, 26, 1715, 26), fill=(90, 235, 255), width=4)
        draw.polygon([(1715, 26), (1690, 14), (1690, 38)], fill=(90, 235, 255))
        draw.text((1510, 42), "STRICT FACING RIGHT", fill=(90, 235, 255), font=font())
        x_edges, y_edges = edges(source.width, 4), edges(source.height, 2)
        for record in frames[clip]:
            index = record["frame"]
            column, row = index % 4, index // 4
            ox, oy = x_edges[column], y_edges[row] + header
            lx, ly = record["landmark"]
            ax, ay = record["anchor"]
            bx0, by0, bx1, by1 = record["sourceBounds"]
            draw.rectangle((ox + bx0, oy + by0, ox + bx1 - 1, oy + by1 - 1), outline=(255, 170, 60), width=2)
            draw.line((ox + lx, oy + ly, ox + ax, oy + ay), fill=(255, 235, 80), width=3)
            draw.ellipse((ox + lx - 6, oy + ly - 6, ox + lx + 6, oy + ly + 6), outline=(255, 235, 80), width=3)
            draw.line((ox + 24, oy + ay, ox + (x_edges[column + 1] - x_edges[column]) - 24, oy + ay), fill=(90, 255, 130), width=2)
            draw.line((ox + ax - 10, oy + ay, ox + ax + 10, oy + ay), fill=(255, 255, 255), width=3)
            draw.line((ox + ax, oy + ay - 10, ox + ax, oy + ay + 10), fill=(255, 255, 255), width=3)
            draw.text((ox + 8, oy + 8), f"pose {index + 1} L({lx},{ly}) root({ax},{ay}) +/-{record['anchorUncertaintyPx']} px", fill=(255, 255, 255), stroke_width=1, stroke_fill=(20, 20, 20), font=font())
        out = repo(QA_ROOT / f"anchors-{clip}.jpg")
        out.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(out, format="JPEG", quality=94, subsampling=0)
        output_paths.append(relative(out))
    return output_paths


def draw_measurement_contact(sources: dict[str, Image.Image], records: list[dict], name: str, title: str, columns: int) -> str:
    crop_size, header = 330, 72
    rows = math.ceil(len(records) / columns)
    canvas = Image.new("RGB", (columns * crop_size, header + rows * crop_size), (17, 24, 30))
    draw = ImageDraw.Draw(canvas)
    draw.text((12, 10), title, fill=(255, 255, 255), font=font())
    draw.text((12, 30), "Cyan: reviewed rigid endpoints. Diagnostic evidence only; source pixels unchanged.", fill=(120, 230, 255), font=font())
    for slot, record in enumerate(records):
        clip, index = record["clip"], record["frame"]
        source = sources[clip]
        x_edges, y_edges = edges(source.width, 4), edges(source.height, 2)
        column, row = index % 4, index // 4
        cell = source.crop((x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])).convert("RGBA")
        rgba = np.asarray(cell, dtype=np.uint8)
        foreground = exact_foreground(rgba)
        composited = np.zeros_like(rgba)
        composited[..., :3] = np.array([28, 35, 41], dtype=np.uint8)
        composited[..., 3] = 255
        composited[foreground] = rgba[foreground]
        cell_rgb = Image.fromarray(composited, "RGBA").convert("RGB").resize((crop_size, crop_size), Image.Resampling.LANCZOS)
        left, top = (slot % columns) * crop_size, header + (slot // columns) * crop_size
        canvas.paste(cell_rgb, (left, top))
        sx, sy = crop_size / cell.width, crop_size / cell.height
        points = [(left + round(point[0] * sx), top + round(point[1] * sy)) for point in record["endpoints"]]
        draw.line((*points[0], *points[1]), fill=(70, 240, 255), width=4)
        for x, y in points:
            draw.ellipse((x - 6, y - 6, x + 6, y + 6), outline=(255, 255, 255), width=3)
        draw.text((left + 8, top + 8), f"{clip} pose {index + 1} / {record['lengthPx']} px", fill=(255, 255, 255), stroke_width=1, stroke_fill=(10, 10, 10), font=font())
    out = repo(QA_ROOT / name)
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, format="JPEG", quality=94, subsampling=0)
    return relative(out)


def draw_orientation_bounds(sources: dict[str, Image.Image], frames: dict[str, list[dict]]) -> str:
    board_w, board_h, header = 887, 444, 54
    canvas = Image.new("RGB", (board_w * 2, (board_h + header) * 2), (17, 24, 30))
    draw = ImageDraw.Draw(canvas)
    for slot, (clip, source) in enumerate(sources.items()):
        left, top = (slot % 2) * board_w, (slot // 2) * (board_h + header)
        scaled = source.convert("RGB").resize((board_w, board_h), Image.Resampling.LANCZOS)
        canvas.paste(scaled, (left, top + header))
        draw.text((left + 10, top + 8), f"{clip}: 8/8 RIGHT / grid isolated / SHA {CLIPS[clip]['sourceSha256'][:12]}...", fill=(255, 255, 255), font=font())
        draw.line((left + 620, top + 25, left + 830, top + 25), fill=(70, 235, 255), width=4)
        draw.polygon([(left + 830, top + 25), (left + 808, top + 14), (left + 808, top + 36)], fill=(70, 235, 255))
        x_edges, y_edges = edges(source.width, 4), edges(source.height, 2)
        for record in frames[clip]:
            index = record["frame"]
            column, row = index % 4, index // 4
            ox = left + round(x_edges[column] / 2)
            oy = top + header + round(y_edges[row] / 2)
            bx0, by0, bx1, by1 = record["sourceBounds"]
            draw.rectangle((ox + round(bx0 / 2), oy + round(by0 / 2), ox + round((bx1 - 1) / 2), oy + round((by1 - 1) / 2)), outline=(255, 175, 70), width=1)
            draw.text((ox + 4, oy + 4), str(index + 1), fill=(255, 255, 255), stroke_width=1, stroke_fill=(10, 10, 10), font=font())
    out = repo(QA_ROOT / "orientation-bounds.jpg")
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, format="JPEG", quality=94, subsampling=0)
    return relative(out)


def draw_sequence_gifs(sources: dict[str, Image.Image], frames: dict[str, list[dict]]) -> list[str]:
    output = []
    for clip, source in sources.items():
        x_edges, y_edges = edges(source.width, 4), edges(source.height, 2)
        gif_frames = []
        for record in frames[clip]:
            index = record["frame"]
            column, row = index % 4, index // 4
            cell = source.crop((x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])).convert("RGBA")
            rgba = np.asarray(cell, dtype=np.uint8)
            foreground = exact_foreground(rgba)
            composed = np.zeros((444, 444, 3), dtype=np.uint8)
            composed[:] = np.array([17, 24, 30], dtype=np.uint8)
            composed[:cell.height, :cell.width][foreground] = rgba[..., :3][foreground]
            image = Image.fromarray(composed, "RGB")
            draw = ImageDraw.Draw(image)
            draw.rectangle((0, 0, 443, 30), fill=(17, 24, 30))
            draw.text((8, 8), f"{clip} pose {index + 1}/8 / RIGHT / {record['chronology']}", fill=(255, 255, 255), font=font())
            draw.line((344, 16, 420, 16), fill=(70, 235, 255), width=3)
            draw.polygon([(420, 16), (408, 9), (408, 23)], fill=(70, 235, 255))
            ax, ay = record["anchor"]
            draw.line((ax - 8, ay, ax + 8, ay), fill=(255, 255, 255), width=2)
            draw.line((ax, ay - 8, ax, min(443, ay + 8)), fill=(255, 255, 255), width=2)
            gif_frames.append(image.convert("P", palette=Image.Palette.ADAPTIVE, colors=255))
        durations = [round(1000 / CLIPS[clip]["fps"])] * 8
        if not CLIPS[clip]["loop"]:
            durations[-1] = 650
        kind = "loop" if CLIPS[clip]["loop"] else "sequence"
        out = repo(QA_ROOT / f"{kind}-review-{clip}.gif")
        out.parent.mkdir(parents=True, exist_ok=True)
        gif_frames[0].save(out, save_all=True, append_images=gif_frames[1:], duration=durations, loop=0, disposal=2, optimize=False)
        output.append(relative(out))
    return output


def build_anchor_fragment(frames: dict[str, list[dict]], anchor_evidence: list[str]) -> dict:
    clips = {}
    for clip, records in frames.items():
        evidence = next(path for path in anchor_evidence if path.endswith(f"anchors-{clip}.jpg"))
        clip_records = []
        for record in records:
            note = (
                "Pelvis/central body mass projected to the common authored support plane. A planted terminal growth is load-bearing contact but not the body root."
                if clip != "death"
                else "Pelvis/collapsed torso mass projected to the corpse contact plane; the farthest terminal growth tip is excluded from root x."
            )
            clip_records.append({
                "frame": record["frame"],
                "reviewed": True,
                "anchor": record["anchor"],
                "landmark": record["landmark"],
                "confidence": record["anchorConfidence"],
                "uncertaintyPx": record["anchorUncertaintyPx"],
                "sourceBounds": record["sourceBounds"],
                "evidence": evidence,
                "facing": "right",
                "note": note,
            })
        clips[clip] = {
            "sourcePath": (SOURCE_ROOT / f"{clip}.png").as_posix(),
            "sourceSha256": CLIPS[clip]["sourceSha256"],
            "sourceSize": [1774, 887],
            "frames": clip_records,
        }
    return {
        "schema": 1,
        "batchId": BATCH,
        "coordinates": "nominal-source-cell",
        "reviewScope": "Physical body-root registration only. No source edit, normalization, artistic acceptance or runtime integration.",
        "profiles": {
            PROFILE: {
                "profileId": PROFILE,
                "status": "reviewed",
                "reviewer": REVIEWER,
                "reviewedAt": REVIEWED_AT,
                "reviewedPoseCount": 32,
                "method": "Manual 32-pose review on the unchanged 1774x887 4x2 source masters. The anatomical landmark is the pelvis/central body mass, including a visually estimated centre when the huge near growth occludes it. Anchor x is that landmark's vertical projection. Anchor y is the exclusive lower bound of the complete foreground (local y=429, last authored support pixel y=428). Planted fist growths are secondary contacts, never the body root. Death uses the collapsed torso mass, never the farthest growth tip. Medium confidence and per-clip uncertainty are retained because the arm masses obscure the pelvis.",
                "evidencePaths": anchor_evidence,
                "clips": clips,
                "integrationStatus": "standalone-reviewed-candidate-not-merged",
                "accepted": False,
                "runtimeIntegrated": False,
                "canonExact": False,
            }
        },
    }


def build_scale_fragment(primary: list[dict], primary_medians: dict[str, float], primary_factors: dict[str, float], cranial: list[dict], cranial_medians: dict[str, float], cranial_factors: dict[str, float], evidence: list[str]) -> dict:
    disagreements = {
        clip: round(abs(primary_factors[clip] / cranial_factors[clip] - 1) * 100, 3)
        for clip in CLIPS
        if clip != "idle"
    }
    return {
        "schema": 1,
        "batchId": BATCH,
        "coordinates": "nominal-source-cell",
        "profiles": {
            PROFILE: {
                "profileId": PROFILE,
                "status": "reviewed",
                "reviewer": REVIEWER,
                "reviewedAt": REVIEWED_AT,
                "note": "Manual post-generation calibration on the four unchanged source masters. The primary rigid metric is the same internal seam-to-seam diameter on the least-occluded forward terminal fist growth in three comparable poses per clip. Whole arm reach, global pose bounds and corpse width are excluded. A secondary skull-root-to-jaw-tip chord was reviewed in two poses per clip; occlusion/rotation makes it less stable, so it is retained as a confidence cross-check rather than mixed into the merge factor. Factors remain standalone technical candidates and grant no artistic or runtime acceptance.",
                "baselineClip": "idle",
                "sourceSha256ByClip": {clip: spec["sourceSha256"] for clip, spec in CLIPS.items()},
                "sourceScaleByClip": primary_factors,
                "medianLengthPxByClip": primary_medians,
                "endpointUncertaintyPx": 7,
                "measurements": primary,
                "cranialCrossCheck": {
                    "landmark": "posterior-skull-root-to-jaw-tip-chord",
                    "measurements": cranial,
                    "medianLengthPxByClip": cranial_medians,
                    "impliedScaleByClip": cranial_factors,
                    "primaryVsCranialDisagreementPercent": disagreements,
                    "interpretation": "All disagreements stay documented. Attack and death chords contract sharply under occlusion/rotation and cannot certify common head scale. The primary fist-derived factors remain low-confidence calibration candidates; no automatic acceptance follows.",
                },
                "scaleConfidence": "low",
                "mergeRecommendation": "Structurally merge-compatible evidence, but hold artistic acceptance and runtime normalization until the cranial-scale discrepancy is retouched or explicitly waived after visual review.",
                "evidencePaths": evidence,
                "integrationStatus": "standalone-reviewed-candidate-not-merged",
                "accepted": False,
                "runtimeIntegrated": False,
                "canonExact": False,
            }
        },
    }


def build_technical_qa(frames: dict[str, list[dict]], masks: dict[str, list[np.ndarray]], scale_fragment: dict, anchor_evidence: list[str], other_evidence: list[str]) -> dict:
    clips = {}
    for clip, records in frames.items():
        transitions = transition_metrics(masks[clip], CLIPS[clip]["loop"])
        clips[clip] = {
            "fps": CLIPS[clip]["fps"],
            "runtimeLoop": CLIPS[clip]["loop"],
            "sourcePath": (SOURCE_ROOT / f"{clip}.png").as_posix(),
            "sourceSha256": CLIPS[clip]["sourceSha256"],
            "sourceSize": [1774, 887],
            "grid": [4, 2],
            "poseCount": 8,
            "rightFacingPoseCount": 8,
            "cellBoundaryContacts": 0,
            "frames": records,
            "transitionMetrics": transitions,
            "closingTransition": transitions[-1] if CLIPS[clip]["loop"] else None,
            "reading": (
                "Subtle grounded breathing closes near neutral; motion amplitude is deliberately low."
                if clip == "idle"
                else "Heavy knuckle-supported trudge reads in order; frames 4-5 create the largest horizontal extension and require cadence review after normalization."
                if clip == "move"
                else "Braced anticipation, overhead double-growth wind-up, slam, compression and recovery read chronologically; source carries no painted shockwave."
                if clip == "attack"
                else "Irreversible recoil-to-collapse progression ends in a stable corpse; frame 0 already reads post-impact and is retained as a reservation."
            ),
        }
    return {
        "schema": 1,
        "release": "v66",
        "batchId": BATCH,
        "profileId": PROFILE,
        "reviewer": REVIEWER,
        "reviewedAt": REVIEWED_AT,
        "status": "standalone-technical-review-not-merged-not-accepted",
        "coordinates": "nominal-source-cell",
        "reviewedPoseCount": 32,
        "orientation": {
            "required": "right",
            "reviewedPoseCount": 32,
            "rightFacingPoseCount": 32,
            "leftFacingPoseCount": 0,
            "perspectiveTurnCount": 0,
            "result": "pass-with-recorded-occlusion-reservations",
        },
        "sourceContract": {
            "dimensions": [1774, 887],
            "exactTwoToOne": True,
            "mode": "RGBA",
            "alphaExtrema": [255, 255],
            "background": "uniform opaque #FF00FF",
            "poseCount": 32,
            "cellBoundaryContacts": 0,
            "commonSupportLineYInclusive": 428,
        },
        "scaleReview": scale_fragment["profiles"][PROFILE],
        "clips": clips,
        "evidencePaths": anchor_evidence + other_evidence,
        "reservations": RESERVATIONS,
        "accepted": False,
        "runtimeIntegrated": False,
        "canonExact": False,
        "globalDocumentsModified": 0,
        "sourcePixelsModified": 0,
    }


def build_report(qa: dict, scale_fragment: dict, anchor_fragment: dict) -> str:
    scale = scale_fragment["profiles"][PROFILE]
    lines = [
        "# V66 — audit technique complet `enemy-039-abomination`",
        "",
        f"Date : `{REVIEWED_AT}`  ",
        "Statut : revue locale autonome, non fusionnée, non acceptée et non intégrée au runtime.",
        "",
        "## Résultat",
        "",
        "- 32/32 poses inspectées individuellement; 32/32 restent tournées à droite.",
        "- Quatre sources 1774×887 RGBA opaques, grille 4×2, zéro contact de cellule et support commun au pixel local y=428.",
        "- 32 racines physiques sont proposées sous le bassin/centre de masse; un poing planté reste un contact secondaire.",
        "- Les facteurs d’échelle sont des candidats de calibration post-génération, jamais une acceptation artistique.",
        "",
        "## Échelle post-génération",
        "",
        "| Clip | Médiane masse-poing | Facteur proposé | Médiane corde crânienne | Facteur crânien indicatif |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    cross = scale["cranialCrossCheck"]
    for clip in CLIPS:
        lines.append(f"| `{clip}` | {scale['medianLengthPxByClip'][clip]:.3f} px | {scale['sourceScaleByClip'][clip]:.6f} | {cross['medianLengthPxByClip'][clip]:.3f} px | {cross['impliedScaleByClip'][clip]:.6f} |")
    lines += [
        "",
        "La mesure primaire suit la même couture interne de la masse-poing terminale avant la moins occultée. L’allonge totale du bras, la boîte englobante, la largeur de l’impact et celle du cadavre sont exclues. La corde crânienne sert de recoupement; sa divergence reste explicitement visible au lieu d’être lissée.",
        "",
        "## Racines et lecture des séquences",
        "",
        "| Clip | Poses | Orientation | Racines | Lecture |",
        "| --- | ---: | --- | --- | --- |",
    ]
    for clip, record in qa["clips"].items():
        lines.append(f"| `{clip}` | 8/8 | droite 8/8 | bassin → y=429, 8/8 | {record['reading']} |")
    lines += [
        "",
        "Les GIF de contrôle bouclent uniquement pour permettre l’inspection. `attack` et `death` restent non bouclés dans le contrat runtime; leur dernière pose est prolongée dans le GIF de diagnostic.",
        "",
        "## Réserves non masquées",
        "",
    ]
    lines.extend(f"- {item}" for item in RESERVATIONS)
    lines += [
        "",
        "## Fragments et preuves",
        "",
        f"- Scale merge-compatible : `{SCALE_FRAGMENT.as_posix()}`",
        f"- Anchor merge-compatible : `{ANCHOR_FRAGMENT.as_posix()}`",
        f"- Données 32 poses : `{TECHNICAL_QA.as_posix()}`",
        f"- Validation merge sans écriture : `{VALIDATION.as_posix()}`",
        f"- Provenance : `{PROVENANCE.as_posix()}`",
        f"- Overlays : `{QA_ROOT.as_posix()}/`",
        "",
        "Aucun global queue/state/reference/scale/anchor, autre profil, V65, metadata, source, normalisé, runtime, commit ou déploiement n’est modifié par cet audit.",
        "",
    ]
    return "\n".join(lines)


def build_provenance(outputs: list[Path], evidence: list[str]) -> dict:
    upstream_receipts = [
        Path(f"docs/references/v66-worklot-001-prompts/{PROFILE}/{clip}.production-event.json")
        for clip in CLIPS
    ]
    return {
        "schema": 1,
        "release": "v66",
        "batchId": BATCH,
        "profileId": PROFILE,
        "reviewedAt": REVIEWED_AT,
        "actor": REVIEWER,
        "kind": "profile-local-technical-review-provenance",
        "generator": {
            "path": relative(Path(__file__)),
            "sha256": sha256(Path(__file__)),
        },
        "sources": [
            {
                "clip": clip,
                "path": (SOURCE_ROOT / f"{clip}.png").as_posix(),
                "sha256": CLIPS[clip]["sourceSha256"],
                "size": [1774, 887],
            }
            for clip in CLIPS
        ],
        "upstreamProductionReceipts": [
            {"path": path.as_posix(), "sha256": sha256(repo(path))}
            for path in upstream_receipts
        ],
        "derivedDocuments": [
            {"path": relative(repo(path)), "sha256": sha256(repo(path)), "bytes": repo(path).stat().st_size}
            for path in outputs
        ],
        "diagnosticEvidence": [
            {"path": path, "sha256": sha256(repo(path)), "bytes": repo(path).stat().st_size}
            for path in evidence
        ],
        "derivation": {
            "sourcePixelsModified": 0,
            "globalDocumentsModified": 0,
            "normalizationRun": False,
            "artAccepted": False,
            "runtimeIntegrated": False,
            "canonExact": False,
            "note": "This provenance intentionally excludes its own hash. All listed derived evidence is diagnostic and profile-local.",
        },
    }


def main() -> None:
    sources, frames, masks = load_sources()
    primary = build_measurements(PRIMARY_MEASUREMENTS, masks, "terminal-fist-growth-seam-diameter", 7)
    cranial = build_measurements(CRANIAL_CROSSCHECKS, masks, "posterior-skull-root-to-jaw-tip-chord", 8)
    primary_medians, cranial_medians = medians_by_clip(primary), medians_by_clip(cranial)
    primary_factors, cranial_factors = factors(primary_medians), factors(cranial_medians)

    anchor_evidence = draw_anchor_overlays(sources, frames)
    primary_contact = draw_measurement_contact(
        sources,
        primary,
        "fist-growth-scale.jpg",
        f"{PROFILE} / rigid terminal fist-growth scale review / 3 poses per clip",
        3,
    )
    cranial_contact = draw_measurement_contact(
        sources,
        cranial,
        "cranial-crosscheck.jpg",
        f"{PROFILE} / secondary cranial chord cross-check / 2 poses per clip",
        4,
    )
    orientation_contact = draw_orientation_bounds(sources, frames)
    sequence_gifs = draw_sequence_gifs(sources, frames)
    other_evidence = [primary_contact, cranial_contact, orientation_contact] + sequence_gifs

    anchor_fragment = build_anchor_fragment(frames, anchor_evidence)
    scale_fragment = build_scale_fragment(primary, primary_medians, primary_factors, cranial, cranial_medians, cranial_factors, [primary_contact, cranial_contact])
    qa = build_technical_qa(frames, masks, scale_fragment, anchor_evidence, other_evidence)
    write_json(ANCHOR_FRAGMENT, anchor_fragment)
    write_json(SCALE_FRAGMENT, scale_fragment)
    write_json(TECHNICAL_QA, qa)
    report_path = repo(REPORT)
    report_path.write_text(build_report(qa, scale_fragment, anchor_fragment), encoding="utf-8", newline="\n")
    documents = [ANCHOR_FRAGMENT, SCALE_FRAGMENT, TECHNICAL_QA, REPORT]
    if repo(VALIDATION).is_file():
        documents.append(VALIDATION)
    provenance = build_provenance(documents, anchor_evidence + other_evidence)
    write_json(PROVENANCE, provenance)

    print(json.dumps({
        "profileId": PROFILE,
        "reviewedPoses": 32,
        "rightFacingPoses": 32,
        "anchorRecords": sum(len(clip["frames"]) for clip in anchor_fragment["profiles"][PROFILE]["clips"].values()),
        "scaleMeasurements": len(primary),
        "cranialCrossChecks": len(cranial),
        "sourceScaleByClip": primary_factors,
        "documents": [path.as_posix() for path in documents] + [PROVENANCE.as_posix()],
        "evidence": anchor_evidence + other_evidence,
        "sourcePixelsModified": 0,
        "globalDocumentsModified": 0,
        "acceptedAutomatically": 0,
    }, indent=2))


if __name__ == "__main__":
    main()
