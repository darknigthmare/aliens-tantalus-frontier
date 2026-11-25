#!/usr/bin/env python3
"""Inspect PNG sprite files without changing or saving any image.

Pillow only decodes pixels and creates temporary alpha masks in memory. The
only file written by this program is the requested JSON report, outside the
project. Anatomy, identity and resemblance require a separate visual review.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import tempfile
from datetime import datetime, timezone

from PIL import Image, UnidentifiedImageError


PROJECT_ROOT = Path(__file__).resolve().parent.parent
ALPHA_THRESHOLDS = (16, 200)


def inside(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def label(path: Path) -> str:
    """Use portable project-relative labels, not private machine paths."""
    if inside(path, PROJECT_ROOT):
        return path.relative_to(PROJECT_ROOT).as_posix()
    return "external/" + path.name


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def alpha_geometry(alpha: Image.Image | None, width: int, height: int,
                   threshold: int, histogram: list[int]) -> dict:
    """Bounds use alpha >= threshold and exclusive right/bottom coordinates."""
    visible_pixels = sum(histogram[threshold:])
    if alpha is None:
        # An image without alpha or PNG transparency metadata is fully opaque.
        bounds = (0, 0, width, height)
        contacts = {"top": width, "right": height,
                    "bottom": width, "left": height}
    else:
        # This derived mask never leaves memory; the source image is unmodified.
        mask = alpha.point([255 if value >= threshold else 0
                            for value in range(256)])
        try:
            bounds = mask.getbbox()
            rectangles = {
                "top": (0, 0, width, 1),
                "right": (width - 1, 0, width, height),
                "bottom": (0, height - 1, width, height),
                "left": (0, 0, 1, height),
            }
            contacts = {}
            for edge, rectangle in rectangles.items():
                strip = mask.crop(rectangle)
                try:
                    contacts[edge] = strip.histogram()[255]
                finally:
                    strip.close()
        finally:
            mask.close()

    if bounds is None:
        useful_size = None
        margins = None
    else:
        left, top, right, bottom = bounds
        useful_size = {"width": right - left, "height": bottom - top}
        margins = {"left": left, "top": top,
                   "right": width - right, "bottom": height - bottom}
    return {
        "threshold_inclusive": threshold,
        "pixels": visible_pixels,
        "canvas_fraction": round(visible_pixels / (width * height), 8),
        "bbox_ltrb_exclusive": list(bounds) if bounds else None,
        "useful_size": useful_size,
        "transparent_margin_pixels": margins,
        "edge_contacts_pixels": contacts,
        "touched_edges": [edge for edge, count in contacts.items() if count],
        "touches_any_edge": any(contacts.values()),
    }


def inspect_png(path: Path) -> dict:
    before = sha256_file(path)
    result = {"path": label(path), "bytes": path.stat().st_size,
              "sha256": before, "status": "ok", "warnings": []}
    with Image.open(path) as source:
        if source.format != "PNG":
            raise ValueError("File is not a PNG, despite its filename")
        source.load()
        width, height = source.size
        if width < 1 or height < 1:
            raise ValueError("PNG has no pixel area")
        bands = list(source.getbands())
        has_channel = "A" in bands
        has_metadata = "transparency" in source.info
        frame_count = getattr(source, "n_frames", 1)
        result.update({
            "format": source.format,
            "mode": source.mode,
            "bands": bands,
            "width": width,
            "height": height,
            "frames": frame_count,
            "analysed_frame": 0,
            "has_alpha_channel": has_channel,
            "has_png_transparency_metadata": has_metadata,
        })
        alpha = None
        converted = None
        try:
            if has_channel:
                alpha = source.getchannel("A")
            elif has_metadata:
                # Decode indexed/tRNS transparency for measurement only.
                converted = source.convert("RGBA")
                alpha = converted.getchannel("A")

            pixels = width * height
            if alpha is None:
                histogram = [0] * 256
                histogram[255] = pixels
            else:
                histogram = alpha.histogram()
            present_values = [value for value, count in enumerate(histogram)
                              if count]
            result["alpha"] = {
                "min": min(present_values),
                "max": max(present_values),
                "transparent_pixels": histogram[0],
                "faint_pixels_1_to_15": sum(histogram[1:16]),
                "partial_pixels_1_to_254": sum(histogram[1:255]),
                "opaque_pixels": histogram[255],
                "transparent_fraction": round(histogram[0] / pixels, 8),
                "histogram_0_to_255": histogram,
            }
            result["useful_bounds"] = {
                str(threshold): alpha_geometry(alpha, width, height,
                                               threshold, histogram)
                for threshold in ALPHA_THRESHOLDS
            }
        finally:
            if alpha is not None:
                alpha.close()
            if converted is not None:
                converted.close()

    if frame_count != 1:
        result["warnings"].append("animated_png_only_frame_0_measured")
    if result["alpha"]["transparent_pixels"] == 0:
        result["warnings"].append("no_fully_transparent_pixels")
    if result["useful_bounds"]["16"]["pixels"] == 0:
        result["warnings"].append("no_useful_pixels_at_alpha_16")
    for threshold in ALPHA_THRESHOLDS:
        if result["useful_bounds"][str(threshold)]["touches_any_edge"]:
            result["warnings"].append(f"edge_contact_at_alpha_{threshold}")
    if sha256_file(path) != before:
        raise ValueError("Source bytes changed during inspection; rerun on a stable file")
    result["source_bytes_unchanged_during_read"] = True
    return result


def collect_pngs(inputs: list[Path]) -> tuple[list[Path], list[dict]]:
    paths = set()
    errors = []
    for supplied in inputs:
        path = supplied.expanduser().resolve()
        if path.is_dir():
            discovered = [child.resolve() for child in path.rglob("*")
                          if child.is_file() and child.suffix.lower() == ".png"]
            if not discovered:
                errors.append({"path": label(path), "error": "No PNG files found"})
            paths.update(discovered)
        elif path.is_file() and path.suffix.lower() == ".png":
            paths.add(path)
        else:
            errors.append({"path": label(path),
                           "error": "Expected an existing PNG file or directory"})
    return sorted(paths, key=lambda path: (label(path), str(path))), errors


def write_report(path: Path, report: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8",
                                         dir=path.parent,
                                         prefix=".river-sprite-inspection-",
                                         suffix=".json", delete=False) as stream:
            temporary = Path(stream.name)
            json.dump(report, stream, ensure_ascii=False, indent=2)
            stream.write("\n")
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", type=Path, nargs="+",
                        help="PNG files or directories to inspect recursively")
    parser.add_argument("--report", type=Path, required=True,
                        help="Absolute JSON output path outside this project")
    args = parser.parse_args()
    if not args.report.is_absolute():
        parser.error("--report must be an absolute path outside this project")
    report_path = args.report.resolve()
    if inside(report_path, PROJECT_ROOT):
        parser.error("--report must be outside this project")
    if report_path.suffix.lower() != ".json":
        parser.error("--report must use a .json extension; images are never written")

    paths, errors = collect_pngs(args.inputs)
    files = []
    for path in paths:
        try:
            files.append(inspect_png(path))
        except (OSError, ValueError, UnidentifiedImageError,
                Image.DecompressionBombError) as error:
            message = str(error).replace(str(path), label(path))
            files.append({"path": label(path), "status": "error", "error": message})
    successful = [item for item in files if item["status"] == "ok"]
    failed = len(files) - len(successful) + len(errors)
    summary = {
        "png_files": len(files),
        "successfully_inspected": len(successful),
        "errors": failed,
        "with_transparent_pixels": sum(item["alpha"]["transparent_pixels"] > 0
                                       for item in successful),
        "with_warnings": sum(bool(item["warnings"]) for item in successful),
        "touching_edges_at_alpha_16": sum(item["useful_bounds"]["16"]["touches_any_edge"]
                                          for item in successful),
        "touching_edges_at_alpha_200": sum(item["useful_bounds"]["200"]["touches_any_edge"]
                                           for item in successful),
    }
    report = {
        "schema": "river-of-pain-sprite-inspection-v1",
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "method": {
            "operation": "read_only_png_inspection",
            "alpha_thresholds_inclusive": list(ALPHA_THRESHOLDS),
            "bbox_coordinates": "left/top inclusive; right/bottom exclusive",
            "edge_counting": "Each edge counted independently; corners can occur on two edges",
            "warnings_are_not_failures": True,
            "limitation": "Pixel metrics do not certify anatomy, resemblance or canonical fidelity",
        },
        "summary": summary,
        "input_errors": errors,
        "files": files,
    }
    write_report(report_path, report)
    print(json.dumps(summary, ensure_ascii=False))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
