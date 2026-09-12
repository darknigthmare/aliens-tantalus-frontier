#!/usr/bin/env python3
"""Freeze the reviewed physical evidence used by the V81 009/010 wave.

The generated JSON documents are deliberately single-profile. This prevents
later edits to the aggregate V66 batch reviews from invalidating a normalized
V81 atlas whose source boards did not change.
"""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ANCHOR_AGGREGATE = ROOT / "docs/references/V66_BATCH_002_ANCHOR_REVIEW.json"
SCALE_AGGREGATE = ROOT / "docs/references/V66_BATCH_002_SCALE_REVIEW.json"
OUT_009_ANCHOR = ROOT / "docs/references/V81_ENEMY_009_ANCHOR_REVIEW.json"
OUT_010_ANCHOR = ROOT / "docs/references/V81_ENEMY_010_ANCHOR_REVIEW.json"
OUT_010_SCALE = ROOT / "docs/references/V81_ENEMY_010_SCALE_REVIEW.json"
EVIDENCE_ROOT = ROOT / "docs/references/v81-enemy-wave-review/enemy-010-spitter"
SOURCE_ROOT = ROOT / "assets/openai/sprites/frames/v66/batch-002/enemy-010-spitter"

SPITTER_ROOTS = {
    "idle": [((252, 244), (252, 404)), ((240, 246), (240, 405)), ((212, 249), (212, 405)), ((199, 248), (199, 406)),
             ((251, 211), (251, 369)), ((242, 210), (242, 368)), ((218, 211), (218, 369)), ((198, 211), (198, 368))],
    "move": [((225, 241), (225, 394)), ((206, 250), (206, 397)), ((211, 245), (211, 395)), ((204, 244), (204, 397)),
             ((221, 229), (221, 381)), ((218, 229), (218, 380)), ((214, 221), (214, 380)), ((216, 221), (216, 378))],
    "attack": [((276, 239), (276, 403)), ((249, 236), (249, 402)), ((236, 241), (236, 402)), ((194, 234), (194, 402)),
               ((255, 221), (255, 389)), ((249, 226), (249, 389)), ((238, 235), (238, 391)), ((240, 230), (240, 391))],
    "death": [((256, 267), (256, 359)), ((237, 270), (237, 356)), ((202, 275), (202, 353)), ((165, 284), (165, 349)),
              ((251, 226), (251, 272)), ((238, 239), (238, 275)), ((213, 246), (213, 277)), ((168, 249), (168, 275))],
}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def single_profile(source: dict, profile_id: str, review_scope: str) -> dict:
    profile = source.get("profiles", {}).get(profile_id)
    if not isinstance(profile, dict) or profile.get("status") != "reviewed":
        raise ValueError(f"{profile_id}: aggregate review is not complete")
    return {
        "schema": 1,
        "batchId": "batch-002",
        "coordinates": "nominal-source-cell",
        "reviewScope": review_scope,
        "profiles": {profile_id: copy.deepcopy(profile)},
    }


def draw_spitter_evidence(clip: str, source: Path, roots: list[tuple[tuple[int, int], tuple[int, int]]]) -> str:
    EVIDENCE_ROOT.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        canvas = original.convert("RGB")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    width, height = canvas.size
    for frame, (landmark, anchor) in enumerate(roots):
        column, row = frame % 4, frame // 4
        left, top = round(column * width / 4), round(row * height / 2)
        right, bottom = round((column + 1) * width / 4) - 1, round((row + 1) * height / 2) - 1
        lx, ly = left + landmark[0], top + landmark[1]
        ax, ay = left + anchor[0], top + anchor[1]
        draw.rectangle((left, top, right, bottom), outline=(80, 220, 255), width=2)
        draw.line((lx, ly, ax, ay), fill=(255, 220, 32), width=4)
        draw.ellipse((lx - 8, ly - 8, lx + 8, ly + 8), outline=(255, 80, 80), width=4)
        draw.ellipse((ax - 8, ay - 8, ax + 8, ay + 8), outline=(80, 255, 120), width=4)
        draw.text((left + 8, top + 8), f"{clip} {frame} L{landmark} A{anchor}", font=font, fill=(255, 255, 255),
                  stroke_width=2, stroke_fill=(0, 0, 0))
    relative = f"docs/references/v81-enemy-wave-review/enemy-010-spitter/anchor-{clip}.jpg"
    output = ROOT / relative
    canvas.save(output, "JPEG", quality=90, subsampling=0, optimize=True)
    return relative


def spitter_anchor_review() -> dict:
    evidence_paths = []
    clips = {}
    for clip, roots in SPITTER_ROOTS.items():
        source = SOURCE_ROOT / f"{clip}.png"
        if not source.is_file():
            raise FileNotFoundError(source)
        with Image.open(source) as image:
            source_size = list(image.size)
            if image.format != "PNG" or image.width != 2 * image.height:
                raise ValueError(f"{source}: expected original 2:1 PNG board")
        evidence_path = draw_spitter_evidence(clip, source, roots)
        evidence_paths.append(evidence_path)
        frames = []
        for frame, (landmark, anchor) in enumerate(roots):
            uncertainty = 12 if clip == "death" else 8
            frames.append({
                "frame": frame,
                "anchor": list(anchor),
                "landmark": list(landmark),
                "reviewed": True,
                "confidence": "medium",
                "uncertaintyPx": uncertainty,
                "evidence": (
                    f"Pose {clip}-{frame} inspected on the full-resolution source and marked overlay. "
                    f"Pelvis/body root {landmark} projects vertically to visible support/rest floor {anchor[1]}; "
                    "dorsal spines and tail extrema are excluded. Physical registration only."
                ),
            })
        clips[clip] = {
            "sourcePath": source.relative_to(ROOT).as_posix(),
            "sourceSha256": sha256(source),
            "sourceSize": source_size,
            "frames": frames,
        }
    profile_id = "enemy-010-spitter"
    return {
        "schema": 1,
        "batchId": "batch-002",
        "coordinates": "nominal-source-cell",
        "reviewScope": "V81 physical registration only; visual identity acceptance is a separate runtime gate.",
        "profiles": {
            profile_id: {
                "profileId": profile_id,
                "status": "reviewed",
                "reviewer": "Codex V81 visual and technical review",
                "reviewedAt": "2026-09-12",
                "reviewedPoseCount": 32,
                "evidencePaths": evidence_paths,
                "visualReview": "All 32 authored source poses were inspected. The same right-facing Spitter identity, four dorsal spines, acid reservoirs, two arms, two digitigrade legs and one tail remain readable. Bright magenta contamination must still be removed by the strict normalization option.",
                "method": "Manual full-resolution inspection of every marked pose. Pelvis or resting body mass was selected inside the silhouette, then projected vertically to the visible support/rest floor. Tail, dorsal spine and jaw extrema never define the root; uncertainty remains explicit.",
                "clips": clips,
            }
        },
    }


def main() -> None:
    anchor_aggregate = load(ANCHOR_AGGREGATE)
    scale_aggregate = load(SCALE_AGGREGATE)
    write(OUT_009_ANCHOR, single_profile(
        anchor_aggregate,
        "enemy-009-crusher",
        "Frozen V81 physical-root evidence for the unchanged reviewed V66 source boards; no 1:1 or official-art claim.",
    ))
    write(OUT_010_SCALE, single_profile(
        scale_aggregate,
        "enemy-010-spitter",
        "Frozen V81 measured inter-clip scale evidence for the unchanged reviewed V66 source boards.",
    ))
    write(OUT_010_ANCHOR, spitter_anchor_review())
    print(json.dumps({
        "profiles": ["enemy-009-crusher", "enemy-010-spitter"],
        "documents": [str(path.relative_to(ROOT)).replace("\\", "/") for path in (OUT_009_ANCHOR, OUT_010_ANCHOR, OUT_010_SCALE)],
        "evidence": 4,
    }, indent=2))


if __name__ == "__main__":
    main()
