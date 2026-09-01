"""Standalone, read-only QA for V66 enemy-041 Working Joe masters.

The script reads the queue, metadata, reference receipt and five source boards.
It only writes review derivatives beside itself. It never updates queue/state,
metadata, normalized assets, runtime data or source pixels.
"""

from __future__ import annotations

from collections import deque
import json
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[4]
PROFILE_ID = "enemy-041-working-joe"
CLIPS = ("idle", "move", "attack", "death", "hurt")


def cell_box(width: int, height: int, frame: int) -> tuple[int, int, int, int]:
    edges_x = [round(i * width / 4) for i in range(5)]
    edges_y = [round(i * height / 2) for i in range(3)]
    column, row = frame % 4, frame // 4
    return edges_x[column], edges_y[row], edges_x[column + 1], edges_y[row + 1]


def pale_components(cell: Image.Image) -> list[dict[str, object]]:
    """Return connected pale-synthetic regions for manual landmark QA."""
    rgb = np.asarray(cell.convert("RGB"), dtype=np.int16)
    high = rgb.max(axis=2)
    low = rgb.min(axis=2)
    mask = (
        (rgb[..., 0] >= 90)
        & (rgb[..., 1] >= 80)
        & (rgb[..., 2] >= 95)
        & ((high - low) <= 105)
        & ~((rgb[..., 0] >= 190) & (rgb[..., 2] >= 190) & (rgb[..., 1] <= 80))
    )
    height, width = mask.shape
    seen = np.zeros(mask.shape, dtype=np.bool_)
    components: list[dict[str, object]] = []
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
        if len(points) >= 20:
            xs = [point[0] for point in points]
            ys = [point[1] for point in points]
            components.append(
                {
                    "area": len(points),
                    "bounds": [min(xs), min(ys), max(xs) + 1, max(ys) + 1],
                }
            )
    return sorted(components, key=lambda component: int(component["area"]), reverse=True)


def debug_head_components() -> None:
    rows = []
    source_dir = ROOT / "assets/openai/sprites/frames/v66/batch-003" / PROFILE_ID
    for clip in CLIPS:
        source = Image.open(source_dir / f"{clip}.png")
        for frame in range(8):
            cell = source.crop(cell_box(source.width, source.height, frame))
            rows.append(
                {
                    "clip": clip,
                    "frame": frame,
                    "components": pale_components(cell)[:6],
                }
            )
    print(json.dumps(rows, indent=2))


if __name__ == "__main__":
    debug_head_components()
