"""Read-only technical audit of authored V66 candidate boards; never acceptance.

Only JSON/diagnostic contacts are written. Source pixels, production state,
reference reviews, normalized atlases and runtime manifests remain untouched.
Eight nominal cell hashes cannot prove eight valid poses or canon fidelity.
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sys

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
_spec = importlib.util.spec_from_file_location("v66_source_audit_normalizer", Path(__file__).with_name("process-v66-enemy-batch.py"))
_pipeline = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_pipeline)
GRID = {"columns": 4, "rows": 2, "frameCount": 8}


def matte_evidence(rgba: np.ndarray, source_has_alpha: bool) -> tuple[dict, np.ndarray | None]:
    """Classify observed edge colors only; no pixels are removed or recolored."""
    rgb = rgba[..., :3].astype(np.int16)
    alpha = rgba[..., 3]
    native_alpha = source_has_alpha and bool(np.any(alpha < 255))
    edge = np.concatenate((rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]))
    magenta = (rgb[..., 0] >= 190) & (rgb[..., 2] >= 190) & (rgb[..., 1] <= 60) & (np.abs(rgb[..., 0] - rgb[..., 2]) <= 32)
    edge_magenta = np.concatenate((magenta[0], magenta[-1], magenta[:, 0], magenta[:, -1]))
    neutral = np.max(edge, axis=1) - np.min(edge, axis=1) <= 12
    neutral_luma = np.mean(edge[neutral], axis=1) if np.any(neutral) else np.array([])
    quantized = Counter((neutral_luma // 8).astype(int).tolist())
    dominant = quantized.most_common(4)
    two_tones = len(dominant) >= 2 and abs(dominant[0][0] - dominant[1][0]) >= 2 and dominant[1][1] / len(edge) >= 0.10
    checker_candidate = not native_alpha and float(neutral.mean()) >= 0.80 and two_tones
    if native_alpha:
        kind = "native-alpha"
        foreground = alpha > 0
    elif float(edge_magenta.mean()) >= 0.80 and float(magenta.mean()) >= 0.10:
        kind = "opaque-magenta"
        # Conservative diagnostic mask only, never a source extraction method.
        foreground = ~magenta
    else:
        kind = "opaque-checkerboard-candidate" if checker_candidate else "opaque-unproven-background"
        foreground = None
    return {"kind": kind, "nativeAlpha": native_alpha, "alphaMin": int(alpha.min()), "alphaMax": int(alpha.max()),
            "transparentPixelCount": int(np.sum(alpha == 0)), "partialAlphaPixelCount": int(np.sum((alpha > 0) & (alpha < 255))),
            "strictMagentaRatio": round(float(magenta.mean()), 6), "edgeMagentaRatio": round(float(edge_magenta.mean()), 6),
            "edgeNeutralRatio": round(float(neutral.mean()), 6), "edgeNeutralLumaBins": [{"lumaBin8": tone, "count": count} for tone, count in dominant],
            "checkerboardStatus": "suspected-from-edge-tones-requires-visual-review" if checker_candidate else "not-established",
            "foregroundMaskPurpose": "border-contact-clues-only-not-anatomy-segmentation"}, foreground


def audit_image(source: Image.Image, clip_id: str, probe_safe_reassignment: bool = False) -> dict:
    rgba = np.array(source.convert("RGBA"), dtype=np.uint8)
    matte, foreground = matte_evidence(rgba, "A" in source.getbands() or "transparency" in source.info)
    edges_x = [round(i * source.width / 4) for i in range(5)]
    edges_y = [round(i * source.height / 2) for i in range(3)]
    cells = []
    for index in range(8):
        x0, x1 = edges_x[index % 4:index % 4 + 2]
        y0, y1 = edges_y[index // 4:index // 4 + 2]
        pixels = rgba[y0:y1, x0:x1]
        mask = foreground[y0:y1, x0:x1] if foreground is not None else None
        contact = None if mask is None else {"top": int(mask[0].sum()), "bottom": int(mask[-1].sum()), "left": int(mask[:, 0].sum()), "right": int(mask[:, -1].sum())}
        occupied = None
        if mask is not None:
            ys, xs = np.where(mask)
            occupied = [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1] if xs.size else None
        cells.append({"frame": index, "cell": [x0, y0, x1, y1], "rgbaSha256": hashlib.sha256(pixels.tobytes()).hexdigest(),
                      "foregroundPixelsHeuristic": int(mask.sum()) if mask is not None else None,
                      "foregroundBoundsHeuristic": occupied, "borderContactPixelClues": contact})
    findings = []
    if source.width != source.height * 2:
        findings.append("source-aspect-not-exactly-2-to-1")
    if matte["kind"] not in ("native-alpha", "opaque-magenta"):
        findings.append("opaque-background-not-proven-magenta-or-native-alpha")
    distinct = len({cell["rgbaSha256"] for cell in cells})
    if distinct != 8:
        findings.append("duplicate-nominal-cell-pixels")
    touched = [cell["frame"] for cell in cells if cell["borderContactPixelClues"] and any(cell["borderContactPixelClues"].values())]
    if touched:
        findings.append("nominal-cell-border-contact-needs-ownership-review")
    try:
        frames, _ = _pipeline.split_source(source, clip_id, GRID)
        normalizer = {"defaultExtraction": "pass", "extractedFrames": len(frames), "distinctExtractedPoseHashes": len({hashlib.sha256(frame.tobytes()).hexdigest() for frame in frames}), "error": None}
    except ValueError as error:
        normalizer = {"defaultExtraction": "blocked", "extractedFrames": 0, "error": str(error)}
        findings.append("default-normalizer-extraction-blocked")
    reassignment = {"status": "not-probed", "sourcesModified": 0, "outputsNormalized": 0, "accepted": False}
    if probe_safe_reassignment and normalizer["defaultExtraction"] == "blocked":
        try:
            reassigned, reports = _pipeline.split_source(source, clip_id, GRID, allow_cell_reassignment=True)
            reassignment = {**reassignment, "status": "proven-short-spill-extraction-pass", "extractedFrames": len(reassigned),
                            "distinctExtractedPoseHashes": len({hashlib.sha256(frame.tobytes()).hexdigest() for frame in reassigned}),
                            "sourceOwnershipReports": reports, "error": None,
                            "meaning": "Existing 90-percent component ownership and 15-percent spill rules passed in memory; visual continuity/roots/acceptance remain pending."}
        except ValueError as error:
            reassignment = {**reassignment, "status": "blocked", "error": str(error)}
    return {"status": "candidate-technical-audit-only", "accepted": False, "runtimeIntegrated": False, "canonExact": False,
            "size": [source.width, source.height], "mode": source.mode,
            "grid": {**GRID, "nominalCellsInspected": 8, "distinctCellHashes": distinct, "aspectExact2To1": source.width == source.height * 2,
                     "subjectCountVisuallyVerified": False, "animationContinuityVerified": False},
            "matte": matte, "borderContactFrames": touched, "normalizer": normalizer, "safeReassignmentProbe": reassignment, "findings": findings, "cells": cells}


def save_contact(source: Image.Image, path: Path, title: str, result: dict) -> None:
    """Create a labelled QA derivative, never replace or modify its master."""
    width = min(1200, source.width)
    height = round(source.height * width / source.width)
    preview = source.convert("RGBA")
    preview.thumbnail((width, height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (width, height + 72), (22, 26, 32))
    canvas.paste(preview, (0, 72), preview)
    draw = ImageDraw.Draw(canvas)
    draw.text((10, 10), title, fill=(255, 255, 255))
    draw.text((10, 30), f"CANDIDATE / NOT ACCEPTED | {source.width}x{source.height} {source.mode} | {result['matte']['kind']}", fill=(255, 214, 128))
    draw.text((10, 49), f"Nominal 4x2 cells; subject count and animation continuity NOT verified. Extraction: {result['normalizer']['defaultExtraction']}", fill=(205, 217, 228))
    for column in range(1, 4):
        x = round(width * column / 4)
        draw.line((x, 72, x, height + 71), fill=(255, 210, 30), width=1)
    draw.line((0, 72 + round(height / 2), width, 72 + round(height / 2)), fill=(255, 210, 30), width=1)
    for index in range(8):
        x, y = round(index % 4 * width / 4) + 5, 77 + round(index // 4 * height / 2)
        draw.rectangle((x - 2, y - 2, x + 48, y + 13), fill=(22, 26, 32))
        draw.text((x, y), f"pose {index + 1}", fill=(255, 255, 255))
    path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(path, format="JPEG", quality=92)


def audit_batch(queue: dict, batch_id: str, root: Path, contact_root: str | None, probe_safe_reassignment: bool = False) -> dict:
    jobs = [job for job in queue["jobs"] if job["batchId"] == batch_id]
    if not jobs:
        raise ValueError("No matching batch jobs.")
    entries = []
    for job in jobs:
        for clip in job["clips"]:
            path = _pipeline.scoped_path(root, clip["sourcePath"])
            entry = {"profileId": job["profileId"], "clipId": clip["id"], "sourcePath": clip["sourcePath"]}
            if not path.is_file():
                entries.append({**entry, "status": "missing-source", "accepted": False, "runtimeIntegrated": False})
                continue
            before = _pipeline.hash_file(path)
            with Image.open(path) as source:
                result = audit_image(source, clip["id"], probe_safe_reassignment)
                if contact_root:
                    contact_relative = f"{contact_root}/{job['profileId']}/{clip['id']}.jpg"
                    save_contact(source, _pipeline.scoped_path(root, contact_relative), f"{job['profileId']} / {clip['id']}", result)
                    result["contactPath"] = contact_relative
            if _pipeline.hash_file(path) != before:
                raise ValueError(f"Source changed during audit: {clip['sourcePath']}")
            entries.append({**entry, "sourceSha256": before, "bytes": path.stat().st_size, **result})
    present = [entry for entry in entries if entry["status"] != "missing-source"]
    return {"schema": 1, "release": "v66", "batchId": batch_id, "generatedBy": "scripts/audit-v66-batch-sources.py",
            "generatedAt": datetime.now(timezone.utc).isoformat(), "auditOnly": True, "sourcePixelsModified": 0, "acceptedAutomatically": 0,
            "scope": "Current queue source paths only; archived rejects and unassigned generation outputs are excluded.",
            "limitations": ["A 4x2 partition and distinct hashes do not prove valid subjects, correct facing, fidelity, pose continuity or anatomy.",
                            "Border contacts are conservative clues. Safe fragment reassignment requires separate recorded ownership evidence.",
                            "Passing extraction is not normalization acceptance or runtime integration.",
                            "Sources may be added after this timestamp; rerun the audit to refresh coverage."],
            "summary": {"profiles": len(jobs), "requiredBoards": len(entries), "presentBoards": len(present), "missingBoards": len(entries) - len(present),
                        "defaultExtractionPass": sum(entry["normalizer"]["defaultExtraction"] == "pass" for entry in present),
                        "defaultExtractionBlocked": sum(entry["normalizer"]["defaultExtraction"] == "blocked" for entry in present),
                        "boardsWithBorderClues": sum(bool(entry["borderContactFrames"]) for entry in present),
                        "safeReassignmentProbePass": sum(entry["safeReassignmentProbe"]["status"] == "proven-short-spill-extraction-pass" for entry in present),
                        "safeReassignmentProbeBlocked": sum(entry["safeReassignmentProbe"]["status"] == "blocked" for entry in present),
                        "matteKinds": dict(Counter(entry["matte"]["kind"] for entry in present))}, "sources": entries}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json")
    parser.add_argument("--batch", required=True)
    parser.add_argument("--no-contacts", action="store_true")
    parser.add_argument("--probe-safe-reassignment", action="store_true", help="Read-only in-memory probe using unchanged existing 90-percent/15-percent ownership rules; never accept or normalize output")
    args = parser.parse_args()
    if not re.fullmatch(r"batch-[0-9]{3}", args.batch):
        raise ValueError("Expected batch-NNN.")
    number = args.batch.removeprefix("batch-")
    report_path = f"docs/references/V66_BATCH_{number}_SOURCE_AUDIT.json"
    contacts = None if args.no_contacts else f"assets/openai/sprites/previews/v66/{args.batch}/source-audit"
    queue = json.loads(args.manifest.read_text(encoding="utf-8"))
    result = audit_batch(queue, args.batch, ROOT, contacts, args.probe_safe_reassignment)
    _pipeline.json_write(_pipeline.scoped_path(ROOT, report_path), result)
    print(json.dumps({"report": report_path, **result["summary"], "acceptedAutomatically": 0}, indent=2))


if __name__ == "__main__":
    main()
