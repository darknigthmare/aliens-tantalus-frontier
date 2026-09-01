"""Safe cell-local recomposition for the reviewed Working Joe death candidate.

The largest connected subject component in every source cell is retained.
Top-row subjects are raised by 26 pixels to restore the established baseline;
small disconnected row-boundary matte fragments are discarded. No anatomy is
redrawn and the original ImageGen candidate remains preserved.
"""

from __future__ import annotations

from collections import deque
import hashlib
import json
from pathlib import Path
import sys

import numpy as np
from PIL import Image


MAGENTA = np.array([255, 0, 255, 255], dtype=np.uint8)


def magenta_mask(rgba: np.ndarray) -> np.ndarray:
    rgb = rgba[..., :3].astype(np.int16)
    return (
        (np.minimum(rgb[..., 0], rgb[..., 2]) >= 190)
        & (rgb[..., 1] <= 70)
        & ((np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1]) >= 120)
        & (np.abs(rgb[..., 0] - rgb[..., 2]) <= 50)
    )


def components(mask: np.ndarray) -> list[list[tuple[int, int]]]:
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=np.bool_)
    found: list[list[tuple[int, int]]] = []
    for y0, x0 in zip(*np.where(mask & ~seen), strict=True):
        if seen[y0, x0]:
            continue
        queue = deque([(int(x0), int(y0))])
        seen[y0, x0] = True
        points: list[tuple[int, int]] = []
        while queue:
            x, y = queue.popleft()
            points.append((x, y))
            for yy in range(max(0, y - 1), min(height, y + 2)):
                for xx in range(max(0, x - 1), min(width, x + 2)):
                    if mask[yy, xx] and not seen[yy, xx]:
                        seen[yy, xx] = True
                        queue.append((xx, yy))
        found.append(points)
    return sorted(found, key=len, reverse=True)


def main(source_path: Path, output_path: Path) -> None:
    source = Image.open(source_path).convert("RGBA")
    if source.size != (1774, 887):
        raise ValueError(f"Expected 1774x887 source, received {source.size}")
    rgba = np.asarray(source, dtype=np.uint8)
    output = np.empty_like(rgba)
    output[...] = MAGENTA
    x_edges = [round(index * source.width / 4) for index in range(5)]
    y_edges = [round(index * source.height / 2) for index in range(3)]
    report = []
    for row in range(2):
        for column in range(4):
            x0, x1 = x_edges[column], x_edges[column + 1]
            y0, y1 = y_edges[row], y_edges[row + 1]
            cell = rgba[y0:y1, x0:x1]
            foreground = (cell[..., 3] > 0) & ~magenta_mask(cell)
            found = components(foreground)
            if not found:
                raise ValueError(f"Missing subject in frame {row * 4 + column}")
            subject = found[0]
            shift_y = -26 if row == 0 else 0
            copied = 0
            for x, y in subject:
                target_y = y + shift_y
                if not 0 <= target_y < cell.shape[0]:
                    raise ValueError(f"Frame {row * 4 + column} shift would crop subject")
                output[y0 + target_y, x0 + x] = cell[y, x]
                copied += 1
            report.append({
                "frame": row * 4 + column,
                "shiftY": shift_y,
                "copiedPixels": copied,
                "discardedComponents": [len(component) for component in found[1:]],
            })
    output_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(output, "RGBA").save(output_path, optimize=False)
    print(json.dumps({
        "sourcePath": source_path.as_posix(),
        "sourceSha256": hashlib.sha256(source_path.read_bytes()).hexdigest(),
        "outputPath": output_path.as_posix(),
        "outputSha256": hashlib.sha256(output_path.read_bytes()).hexdigest(),
        "frames": report,
    }, indent=2))


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
