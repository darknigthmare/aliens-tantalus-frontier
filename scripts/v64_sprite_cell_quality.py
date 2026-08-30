"""Shared per-cell quality contract for V64 hybrid sprite atlases."""

from __future__ import annotations

from statistics import median

import numpy as np
from PIL import Image


ALPHA_THRESHOLD = 16
MIN_FOREGROUND_PIXELS = 512
MIN_CELL_DIMENSION = 16
MIN_ROW_RELATIVE_AREA = 0.45
MAX_ROW_RELATIVE_AREA = 1.65


def analyze_v64_cells(
    image: Image.Image,
    *,
    columns: int = 4,
    rows: int = 4,
    cell_width: int = 256,
    cell_height: int = 256,
    guard: int = 16,
) -> dict:
    """Measure every cell and report tiny, missing or likely fused poses."""

    rgba = image.convert("RGBA")
    expected_size = (columns * cell_width, rows * cell_height)
    findings: list[dict] = []
    if rgba.size != expected_size:
        findings.append({
            "code": "grid-dimension-mismatch",
            "message": f"atlas size {rgba.size} does not match {expected_size}",
            "evidence": {"actual": list(rgba.size), "expected": list(expected_size)},
        })
        return {"cells": [], "rowMedianForegroundPixels": [], "findings": findings}

    cells: list[dict] = []
    for index in range(columns * rows):
        column, row = index % columns, index // columns
        alpha = np.asarray(
            rgba.getchannel("A").crop((
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            )),
            dtype=np.uint8,
        )
        foreground = alpha >= ALPHA_THRESHOLD
        ys, xs = np.where(foreground)
        if xs.size == 0:
            cell = {
                "index": index,
                "alphaBounds": None,
                "foregroundPixels": 0,
                "width": 0,
                "height": 0,
            }
        else:
            left, top = int(xs.min()), int(ys.min())
            right, bottom = int(xs.max()) + 1, int(ys.max()) + 1
            cell = {
                "index": index,
                "alphaBounds": [left, top, right, bottom],
                "foregroundPixels": int(foreground.sum()),
                "width": right - left,
                "height": bottom - top,
            }
        cells.append(cell)

    row_medians: list[float] = []
    for row in range(rows):
        members = cells[row * columns:(row + 1) * columns]
        row_median = float(median(cell["foregroundPixels"] for cell in members))
        row_medians.append(row_median)
        for cell in members:
            index = cell["index"]
            pixels = cell["foregroundPixels"]
            relative = pixels / row_median if row_median else 0.0
            cell["relativeToRowMedian"] = round(relative, 6)
            bounds = cell["alphaBounds"]
            if bounds is None:
                findings.append({
                    "code": "empty-cell",
                    "message": f"cell {index} is empty",
                    "evidence": {"index": index},
                })
                continue
            if pixels < MIN_FOREGROUND_PIXELS:
                findings.append({
                    "code": "tiny-cell",
                    "message": f"cell {index} contains only {pixels} foreground pixels",
                    "evidence": {
                        "index": index,
                        "foregroundPixels": pixels,
                        "minimum": MIN_FOREGROUND_PIXELS,
                    },
                })
            if cell["width"] < MIN_CELL_DIMENSION or cell["height"] < MIN_CELL_DIMENSION:
                findings.append({
                    "code": "tiny-cell-bounds",
                    "message": f"cell {index} has implausibly small bounds {cell['width']}x{cell['height']}",
                    "evidence": {
                        "index": index,
                        "width": cell["width"],
                        "height": cell["height"],
                        "minimumDimension": MIN_CELL_DIMENSION,
                    },
                })
            left, top, right, bottom = bounds
            if left < guard or top < guard or right > cell_width - guard or bottom > cell_height - guard:
                findings.append({
                    "code": "guard-crossing",
                    "message": f"cell {index} crosses the {guard}px guard: {bounds}",
                    "evidence": {"index": index, "alphaBounds": bounds, "guard": guard},
                })
            if row_median and relative < MIN_ROW_RELATIVE_AREA:
                findings.append({
                    "code": "row-area-underflow",
                    "message": f"cell {index} is only {relative:.3f}x its row median",
                    "evidence": {
                        "index": index,
                        "ratio": round(relative, 6),
                        "minimum": MIN_ROW_RELATIVE_AREA,
                        "rowMedianForegroundPixels": row_median,
                    },
                })
            if row_median and relative > MAX_ROW_RELATIVE_AREA:
                findings.append({
                    "code": "row-area-overflow",
                    "message": f"cell {index} is {relative:.3f}x its row median and may contain fused poses",
                    "evidence": {
                        "index": index,
                        "ratio": round(relative, 6),
                        "maximum": MAX_ROW_RELATIVE_AREA,
                        "rowMedianForegroundPixels": row_median,
                    },
                })

    return {
        "cells": cells,
        "rowMedianForegroundPixels": [round(value, 3) for value in row_medians],
        "findings": findings,
    }


def validate_v64_cells(image: Image.Image, label: str) -> dict:
    report = analyze_v64_cells(image)
    if report["findings"]:
        summary = "; ".join(finding["message"] for finding in report["findings"])
        raise ValueError(f"{label}: {summary}")
    return report
