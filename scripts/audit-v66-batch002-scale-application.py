"""Independent read-only before/after audit of V66 batch002 scale application.

Only diagnostic reports/contact images are written. Sources, atlases, metadata,
production state, reference locks and the normalizer are never modified.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import statistics

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json"
EVIDENCE = ROOT / "docs/references/V66_BATCH_002_SCALE_A.json"
OUT = ROOT / "docs/references"
BEFORE = OUT / "V66_BATCH_002_SCALE_APPLICATION_BEFORE.json"
AFTER = OUT / "V66_BATCH_002_SCALE_APPLICATION_AFTER.json"
TARGETS = ("enemy-010-spitter", "enemy-011-lurker")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def scoped(value: str) -> Path:
    path = (ROOT / value).resolve()
    if Path(value).is_absolute() or not path.is_relative_to(ROOT):
        raise ValueError("Audit input path must remain repository-relative")
    return path


def canonical_sha(value: object) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def protected_records(queue: dict) -> list[dict]:
    records = []
    for job in queue["jobs"]:
        if job["batchId"] == "batch-001":
            for field, kind in (("normalizedPath", "pilot-atlas"), ("metadataPath", "pilot-metadata")):
                path = scoped(job[field])
                records.append({"kind": kind, "profileId": job["profileId"], "path": relative(path), "bytes": path.stat().st_size, "sha256": sha(path)})
        if job["batchId"] == "batch-002":
            for clip in job["clips"]:
                path = scoped(clip["sourcePath"])
                records.append({"kind": "batch002-original-source", "profileId": job["profileId"], "clip": clip["id"], "path": relative(path), "bytes": path.stat().st_size, "sha256": sha(path)})
            if job["profileId"] not in TARGETS:
                for field, kind in (("normalizedPath", "untouched-batch002-atlas"), ("metadataPath", "untouched-batch002-metadata")):
                    path = scoped(job[field])
                    records.append({"kind": kind, "profileId": job["profileId"], "path": relative(path), "bytes": path.stat().st_size, "sha256": sha(path)})
    counts = {kind: sum(r["kind"] == kind for r in records) for kind in {r["kind"] for r in records}}
    expected = {"pilot-atlas": 5, "pilot-metadata": 5, "batch002-original-source": 87, "untouched-batch002-atlas": 18, "untouched-batch002-metadata": 18}
    if counts != expected:
        raise ValueError(f"Protected scope changed: {counts}")
    return records


def audit_profile(job: dict, evidence: dict, phase: str) -> dict:
    metadata_path = scoped(job["metadataPath"])
    atlas_path = scoped(job["normalizedPath"])
    metadata_bytes = metadata_path.read_bytes()
    atlas_digest = sha(atlas_path)
    meta = json.loads(metadata_bytes)
    if meta["profileId"] != job["profileId"] or meta["normalizedSha256"] != atlas_digest:
        raise ValueError("Atlas/metadata identity or checksum mismatch")
    if meta["acceptanceStatus"] != "pending-visual-review" or meta["runtimeIntegrated"] or meta["canonExact"]:
        raise ValueError("Audit must not silently accept or integrate candidate art")
    if phase == "before" and any(value != 1 for value in meta["sourceScaleByClip"].values()):
        raise ValueError("Cannot capture an uncalibrated BEFORE after factors were applied")
    post_review = meta.get("postGenerationScaleReview")
    verified_scale_evidence_count = 0
    if phase == "after":
        if not post_review or post_review.get("status") != "reviewed" or post_review.get("profileId") != job["profileId"]:
            raise ValueError("Applied calibration is missing its separately reviewed post-generation proof")
        if sha(scoped(post_review["path"])) != post_review["sha256"]:
            raise ValueError("Active post-generation scale review hash changed")
        if post_review.get("sourceSha256ByClip") != evidence["sourceSha256ByClip"] or post_review.get("sourceScaleByClip") != evidence["sourceScaleByClip"]:
            raise ValueError("Applied calibration proof differs from independently measured inputs")
        for scale_evidence in post_review["evidence"]:
            if sha(scoped(scale_evidence["path"])) != scale_evidence["sha256"]:
                raise ValueError("An applied calibration evidence image changed")
            verified_scale_evidence_count += 1
    for clip in job["clips"]:
        source_digest = sha(scoped(clip["sourcePath"]))
        expected = evidence["sourceSha256ByClip"][clip["id"]]
        recorded = next(s["sha256"] for s in meta["sources"] if s["clip"] == clip["id"])
        if source_digest != expected or source_digest != recorded:
            raise ValueError(f"Manual measurements refer to another source: {clip['id']}")
    placements = {(p["clip"], p["clipFrame"]): p for p in meta["placements"]}
    source_measurements = evidence["measurements"]
    measured_clips = [c["id"] for c in job["clips"] if any(m["clip"] == c["id"] for m in source_measurements)]
    cell_display, label_height = 384, 44
    contact = Image.new("RGB", (cell_display * 3, (cell_display + label_height) * len(measured_clips)), (8, 14, 18))
    draw = ImageDraw.Draw(contact)
    records = []
    with Image.open(atlas_path) as opened:
        atlas = opened.convert("RGBA")
        grid = meta["grid"]
        if atlas.size != (grid["columns"] * grid["cellWidth"], grid["rows"] * grid["cellHeight"]):
            raise ValueError("Atlas dimensions do not match recorded grid")
        for row, clip_id in enumerate(measured_clips):
            measurements = [m for m in source_measurements if m["clip"] == clip_id]
            if len(measurements) not in (2, 3):
                raise ValueError("This bounded audit expects two or three manual skull samples per clip")
            for col, manual in enumerate(measurements):
                p = placements[(clip_id, manual["frame"])]
                sb, rb, size = p["sourceBounds"], p["renderedBounds"], p["sourceSize"]
                if size != [sb[2] - sb[0], sb[3] - sb[1]]:
                    raise ValueError("Cropped source dimensions changed")
                ratios = [(rb[2] - rb[0]) / size[0], (rb[3] - rb[1]) / size[1]]
                endpoints = manual["endpoints"]
                if abs(math.dist(*endpoints) - manual["lengthPx"]) > 1:
                    raise ValueError("Manual source chord no longer agrees with endpoints")
                mapped = [[rb[0] + (point[0] - sb[0]) * ratios[0], rb[1] + (point[1] - sb[1]) * ratios[1]] for point in endpoints]
                length = math.dist(*mapped)
                ox = (p["index"] % grid["columns"]) * grid["cellWidth"]
                oy = (p["index"] // grid["columns"]) * grid["cellHeight"]
                frame = atlas.crop((ox, oy, ox + grid["cellWidth"], oy + grid["cellHeight"]))
                alpha = frame.getchannel("A")
                nearby = []
                for mx, my in mapped:
                    x, y = round(mx), round(my)
                    neighborhood = alpha.crop((max(0, x - 2), max(0, y - 2), min(frame.width, x + 3), min(frame.height, y + 3)))
                    nearby.append(neighborhood.getextrema()[1])
                uncertainty = manual.get("uncertaintyPx", 4) * max(ratios)
                record = {
                    "clip": clip_id, "frame": manual["frame"], "landmark": manual["landmark"],
                    "sourceEndpoints": endpoints, "sourceChordLengthPx": manual["lengthPx"],
                    "sourceBounds": sb, "sourceCroppedSize": size, "renderedBounds": rb,
                    "exactRasterResizeRatioXY": ratios, "finalPackScale": p["scale"],
                    "sourceScale": p["sourceScale"], "appliedScaleBeforeRounding": p["appliedScale"],
                    "renderedEndpointsCellPx": mapped, "renderedEndpointsAtlasPx": [[x + ox, y + oy] for x, y in mapped],
                    "renderedChordLengthPx": length, "mappedMeasurementUncertaintyPx": uncertainty,
                    "endpointNeighborhoodAlphaMaximum": nearby,
                    "renderedCellRgbaSha256": hashlib.sha256(frame.tobytes()).hexdigest(),
                    "sourceAnchorStatus": p["anchorStatus"], "renderedPhysicalAnchor": p.get("renderedAnchor")
                }
                records.append(record)
                panel = Image.new("RGBA", frame.size, (8, 14, 18, 255))
                panel.alpha_composite(frame)
                x0, y0 = col * cell_display, row * (cell_display + label_height)
                contact.paste(panel.convert("RGB").resize((cell_display, cell_display), Image.Resampling.NEAREST), (x0, y0 + label_height))
                draw.text((x0 + 6, y0 + 4), f'{phase.upper()} {job["profileId"]} {clip_id}/{manual["frame"]}', fill=(226, 230, 240))
                draw.text((x0 + 6, y0 + 19), f'cranial chord {length:.3f}px | source factor {p["sourceScale"]:.6f}', fill=(226, 230, 240))
                dx, dy = cell_display / frame.width, cell_display / frame.height
                q0, q1 = [(x0 + x * dx, y0 + label_height + y * dy) for x, y in mapped]
                draw.line((*q0, *q1), fill=(0, 245, 180), width=2)
                for x, y in (q0, q1):
                    draw.ellipse((x - 3, y - 3, x + 3, y + 3), outline=(255, 238, 60), width=2)
    # Detect concurrent rewrite rather than attributing mixed versions.
    if sha(atlas_path) != atlas_digest or metadata_path.read_bytes() != metadata_bytes:
        raise ValueError("Atlas or metadata changed during independent audit")
    medians = {clip: statistics.median(r["renderedChordLengthPx"] for r in records if r["clip"] == clip) for clip in measured_clips}
    baseline = medians[evidence["baselineClip"]]
    target = OUT / "v66-batch-002-scale-application" / f'{job["profileId"]}-{phase}.jpg'
    target.parent.mkdir(parents=True, exist_ok=True)
    contact.save(target, quality=88)
    return {
        "profileId": job["profileId"], "atlasPath": relative(atlas_path), "atlasSha256": atlas_digest,
        "metadataPath": relative(metadata_path), "metadataSha256": hashlib.sha256(metadata_bytes).hexdigest(),
        "metadataFinalPackScale": meta["scale"], "sourceScaleByClip": meta["sourceScaleByClip"],
        "physicalAnchorReview": meta["physicalAnchorReview"], "scaleCalibrationReview": meta.get("scaleCalibrationReview"),
        "postGenerationScaleReview": post_review,
        "postGenerationScaleEvidenceHashesVerified": verified_scale_evidence_count,
        "sourceMeasurementsCanonicalSha256": canonical_sha({"sources": evidence["sourceSha256ByClip"], "measurements": source_measurements}),
        "renderedMedianCranialLengthPxByClip": medians,
        "renderedMedianRatioToIdleByClip": {clip: value / baseline for clip, value in medians.items()},
        "measurements": records, "diagnosticContactPath": relative(target), "diagnosticContactSha256": sha(target),
        "artisticallyAccepted": False, "runtimeIntegrated": meta["runtimeIntegrated"], "canonExact": meta["canonExact"]
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--phase", choices=("before", "after"), required=True)
    args = parser.parse_args()
    target = BEFORE if args.phase == "before" else AFTER
    if args.phase == "before" and target.exists():
        raise ValueError("Refusing to overwrite immutable before snapshot")
    queue = json.loads(QUEUE.read_text(encoding="utf8"))
    evidence = json.loads(EVIDENCE.read_text(encoding="utf8"))
    proof = {
        "schema": 1, "batchId": "batch-002", "phase": args.phase,
        "auditedAtUtc": datetime.now(timezone.utc).isoformat(),
        "method": "Independently project fixed manually measured source cranial endpoints through exact integer renderedBounds/sourceSize ratios. Lengths measure a rigid visible dome chord, not body/queue bounds. Marked diagnostic images contain actual current atlas cell pixels. No art acceptance inferred.",
        "writes": "Only this phase JSON report and two diagnostic JPEG contacts; no game asset, metadata, source, queue or production state writes.",
        "measurementDocument": relative(EVIDENCE), "measurementDocumentSha256": sha(EVIDENCE),
        "measurementDocumentHashSemantics": "Raw-byte historical fingerprint of the working-copy document at this phase. A past CRLF/mixed-newline document can have a different raw SHA256 from its Git LF blob without changed measurements. Cross-phase measurement identity is compared using sourceMeasurementsCanonicalSha256, which hashes the parsed source SHA map and manual measurement records, not document formatting. The immutable BEFORE snapshot is preserved.",
        "protectedFiles": protected_records(queue), "profiles": []
    }
    for pid in TARGETS:
        job = next(j for j in queue["jobs"] if j["profileId"] == pid)
        proof["profiles"].append(audit_profile(job, evidence["profiles"][pid], args.phase))
    counts = {kind: sum(r["kind"] == kind for r in proof["protectedFiles"]) for kind in {r["kind"] for r in proof["protectedFiles"]}}
    proof["protectedCounts"] = counts
    if args.phase == "after":
        previous = json.loads(BEFORE.read_text(encoding="utf8"))
        previous_files = {r["path"]: r for r in previous["protectedFiles"]}
        current_files = {r["path"]: r for r in proof["protectedFiles"]}
        changed = [path for path, old in previous_files.items() if path not in current_files or (old["bytes"], old["sha256"]) != (current_files[path]["bytes"], current_files[path]["sha256"])]
        extra = sorted(set(current_files) - set(previous_files))
        proof["nonRegression"] = {"protectedFileCount": len(previous_files), "changedProtectedFiles": changed, "addedProtectedPaths": extra, "allProtectedBytesUnchanged": not changed and not extra}
        comparison = []
        for new in proof["profiles"]:
            old = next(p for p in previous["profiles"] if p["profileId"] == new["profileId"])
            if old["sourceMeasurementsCanonicalSha256"] != new["sourceMeasurementsCanonicalSha256"]:
                raise ValueError("Manual source measurements changed between before/after")
            expected = evidence["profiles"][new["profileId"]]["sourceScaleByClip"]
            if new["sourceScaleByClip"] != expected:
                raise ValueError("Applied scale factors do not match independently measured proposal")
            ratios = new["renderedMedianRatioToIdleByClip"]
            corrected = {clip: abs(ratio - 1) for clip, ratio in ratios.items() if expected[clip] != 1}
            old_cells = {(m["clip"], m["frame"]): m["renderedCellRgbaSha256"] for m in old["measurements"]}
            changed_cells = [{"clip": m["clip"], "frame": m["frame"]} for m in new["measurements"] if old_cells[(m["clip"], m["frame"])] != m["renderedCellRgbaSha256"]]
            comparison.append({
                "profileId": new["profileId"], "beforeAtlasSha256": old["atlasSha256"], "afterAtlasSha256": new["atlasSha256"],
                "atlasFileBytesChanged": old["atlasSha256"] != new["atlasSha256"],
                "sampledCellsWithVerifiedPixelChanges": changed_cells,
                "sampledCellPixelChangeCount": len(changed_cells),
                "pixelComparisonScope": "Exact decoded RGBA hashes of every cranial measurement's complete 256px cell; a file-byte change alone is not treated as proof of changed pixels.",
                "beforeFinalPackScale": old["metadataFinalPackScale"], "afterFinalPackScale": new["metadataFinalPackScale"],
                "finalPackScaleRatio": new["metadataFinalPackScale"] / old["metadataFinalPackScale"],
                "beforeMedianCranialLengthPxByClip": old["renderedMedianCranialLengthPxByClip"],
                "afterMedianCranialLengthPxByClip": new["renderedMedianCranialLengthPxByClip"],
                "beforeMedianRatioToIdleByClip": old["renderedMedianRatioToIdleByClip"],
                "afterMedianRatioToIdleByClip": ratios,
                "correctedMedianRelativeErrorToIdle": corrected,
                "allCorrectedMedianRatiosWithinOnePercent": all(error <= 0.01 for error in corrected.values()),
                "artworkAcceptance": "pending; registration and scale evidence are not fidelity or fluidity certification"
            })
        proof["beforeAfterComparison"] = comparison
    # New reports are deliberately LF; never rewrite the immutable historical BEFORE.
    target.write_text(json.dumps(proof, indent=2) + "\n", encoding="utf8", newline="\n")
    print(json.dumps({"phase": args.phase, "report": relative(target), "protectedCounts": counts, "profiles": [{"profileId": p["profileId"], "packScale": p["metadataFinalPackScale"], "cranialMediansPx": p["renderedMedianCranialLengthPxByClip"], "ratiosToIdle": p["renderedMedianRatioToIdleByClip"]} for p in proof["profiles"]], "nonRegression": proof.get("nonRegression"), "comparison": proof.get("beforeAfterComparison")}, indent=2))
    if args.phase == "after" and (not proof["nonRegression"]["allProtectedBytesUnchanged"] or not all(c["allCorrectedMedianRatiosWithinOnePercent"] for c in proof["beforeAfterComparison"])):
        raise SystemExit("Before/after audit found a protected-file change or cranial scale mismatch")


if __name__ == "__main__":
    main()
