"""Render cell-local coordinate evidence for the replacement death master.

This helper only reads the active source PNG and writes a marked QA derivative
beside the standalone review. It does not alter source or runtime pixels.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
SOURCE = ROOT / "assets/openai/sprites/frames/v66/batch-003/enemy-041-working-joe/death.png"


def cell_box(width: int, height: int, frame: int) -> tuple[int, int, int, int]:
    x_edges = [round(index * width / 4) for index in range(5)]
    y_edges = [round(index * height / 2) for index in range(3)]
    column, row = frame % 4, frame // 4
    return x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1]


def main() -> None:
    source = Image.open(SOURCE).convert("RGB")
    scale = 2
    tile_width, tile_height = 444 * scale, 443 * scale
    header = 36
    canvas = Image.new("RGB", (tile_width * 4, (tile_height + header) * 2), (18, 22, 28))
    for frame in range(8):
        box = cell_box(source.width, source.height, frame)
        cell = source.crop(box).resize(
            ((box[2] - box[0]) * scale, (box[3] - box[1]) * scale),
            Image.Resampling.NEAREST,
        )
        column, row = frame % 4, frame // 4
        left = column * tile_width
        top = row * (tile_height + header)
        canvas.paste(cell, (left, top + header))
        draw = ImageDraw.Draw(canvas)
        draw.text((left + 8, top + 8), f"death pose {frame + 1} / cell-local coordinates", fill=(255, 255, 255))
        cell_width, cell_height = box[2] - box[0], box[3] - box[1]
        for local_x in range(0, cell_width, 20):
            x = left + local_x * scale
            draw.line((x, top + header, x, top + header + cell_height * scale - 1), fill=(45, 205, 230), width=1)
            draw.text((x + 2, top + header + 2), str(local_x), fill=(255, 255, 255), stroke_width=1, stroke_fill=(0, 0, 0))
        for local_y in range(0, cell_height, 20):
            y = top + header + local_y * scale
            draw.line((left, y, left + cell_width * scale - 1, y), fill=(45, 205, 230), width=1)
            draw.text((left + 2, y + 2), str(local_y), fill=(255, 255, 255), stroke_width=1, stroke_fill=(0, 0, 0))
    canvas.save(HERE / "death-coordinate-contact.png")


if __name__ == "__main__":
    main()
