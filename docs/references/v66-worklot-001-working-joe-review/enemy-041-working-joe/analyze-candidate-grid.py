"""Read-only per-cell component QA for Working Joe source candidates."""

from __future__ import annotations

from collections import deque
import json
from pathlib import Path
import sys

import numpy as np
from PIL import Image


def magenta_mask(rgba: np.ndarray) -> np.ndarray:
    rgb = rgba[..., :3].astype(np.int16)
    return (
        (np.minimum(rgb[..., 0], rgb[..., 2]) >= 190)
        & (rgb[..., 1] <= 70)
        & ((np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1]) >= 120)
        & (np.abs(rgb[..., 0] - rgb[..., 2]) <= 50)
    )


def components(mask: np.ndarray) -> list[dict[str, object]]:
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=np.bool_)
    records: list[dict[str, object]] = []
    for y0, x0 in zip(*np.where(mask & ~seen), strict=True):
        if seen[y0, x0]:
            continue
        queue = deque([(int(x0), int(y0))])
        seen[y0, x0] = True
        xs: list[int] = []
        ys: list[int] = []
        while queue:
            x, y = queue.popleft()
            xs.append(x)
            ys.append(y)
            for yy in range(max(0, y - 1), min(height, y + 2)):
                for xx in range(max(0, x - 1), min(width, x + 2)):
                    if mask[yy, xx] and not seen[yy, xx]:
                        seen[yy, xx] = True
                        queue.append((xx, yy))
        records.append({
            "area": len(xs),
            "bounds": [min(xs), min(ys), max(xs) + 1, max(ys) + 1],
            "touches": {
                "top": min(ys) == 0,
                "bottom": max(ys) == height - 1,
                "left": min(xs) == 0,
                "right": max(xs) == width - 1,
            },
        })
    return sorted(records, key=lambda item: int(item["area"]), reverse=True)


def main(path: Path) -> None:
    source = Image.open(path).convert("RGBA")
    rgba = np.asarray(source, dtype=np.uint8)
    foreground = (rgba[..., 3] > 0) & ~magenta_mask(rgba)
    x_edges = [round(index * source.width / 4) for index in range(5)]
    y_edges = [round(index * source.height / 2) for index in range(3)]
    frames = []
    for row in range(2):
        for column in range(4):
            cell = foreground[y_edges[row]:y_edges[row + 1], x_edges[column]:x_edges[column + 1]]
            frames.append({
                "frame": row * 4 + column,
                "edgePixels": {
                    "top": int(cell[0].sum()),
                    "bottom": int(cell[-1].sum()),
                    "left": int(cell[:, 0].sum()),
                    "right": int(cell[:, -1].sum()),
                },
                "components": components(cell)[:8],
            })
    print(json.dumps({
        "path": path.as_posix(),
        "size": [source.width, source.height],
        "frames": frames,
    }, indent=2))


if __name__ == "__main__":
    main(Path(sys.argv[1]))
