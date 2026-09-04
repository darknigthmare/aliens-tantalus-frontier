"""Normalize the OpenAI Alpha/Bravo console atlas for the V69 runtime.

The RGB ImageGen master is preserved verbatim. This deterministic pass removes
only the border-connected neutral checker, scales the authored 4x2 board to a
1024x512 RGBA atlas, clears cell guards and records reproducible QA metadata.
"""

from __future__ import annotations

from collections import deque
import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/openai/sprites/frames/v69/alpha-bravo-task-consoles-atlas-openai-v69.png"
OUTPUT = ROOT / "assets/openai/sprites/normalized/props/alpha-bravo-task-consoles-atlas-v69.png"
REPORT = ROOT / "assets/openai/sprites/metadata/v69/alpha-bravo-task-consoles-v69.json"
WIDTH = 1024
HEIGHT = 512
COLUMNS = 4
ROWS = 2
CELL = 256
GUARD = 10


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def is_checker(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    return alpha < 16 or (
        min(red, green, blue) >= 212
        and max(red, green, blue) - min(red, green, blue) <= 26
    )


def remove_checker(source: Image.Image) -> tuple[Image.Image, int]:
    image = source.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    queue: deque[tuple[int, int]] = deque()
    visited = bytearray(width * height)
    removed = 0

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if visited[index] or not is_checker(pixels[x, y]):
            return
        visited[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (0, 0, 0, 0)
        removed += 1
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    # Remove enclosed squares that exactly match the bright neutral checker.
    # Coloured lamps and darker metal highlights cannot match this predicate.
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha and min(red, green, blue) >= 238 and max(red, green, blue) - min(red, green, blue) <= 12:
                pixels[x, y] = (0, 0, 0, 0)
                removed += 1
    return image, removed


def clear_transparent_rgb(image: Image.Image) -> None:
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0 and (red or green or blue):
                pixels[x, y] = (0, 0, 0, 0)


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing ImageGen master: {SOURCE}")
    with Image.open(SOURCE) as source:
        source_size = list(source.size)
        source_mode = source.mode
        cleaned, removed = remove_checker(source)

    normalized = cleaned.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    pixels = normalized.load()
    boundaries_x = [column * CELL for column in range(COLUMNS + 1)]
    boundaries_y = [row * CELL for row in range(ROWS + 1)]
    for y in range(HEIGHT):
        for x in range(WIDTH):
            if any(abs(x - boundary) < GUARD for boundary in boundaries_x) or any(abs(y - boundary) < GUARD for boundary in boundaries_y):
                pixels[x, y] = (0, 0, 0, 0)
    clear_transparent_rgb(normalized)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    normalized.save(OUTPUT, optimize=True)

    cells = []
    for row in range(ROWS):
        for column in range(COLUMNS):
            cell = normalized.crop((column * CELL, row * CELL, (column + 1) * CELL, (row + 1) * CELL))
            alpha = cell.getchannel("A")
            opaque = sum(1 for value in alpha.get_flattened_data() if value > 0)
            cells.append({"column": column, "row": row, "occupiedPixels": opaque, "bounds": list(cell.getbbox() or ())})
            if opaque < 500 or not cell.getbbox():
                raise SystemExit(f"Empty console cell {column},{row}")

    alpha = normalized.getchannel("A")
    transparent = sum(1 for value in alpha.get_flattened_data() if value == 0)
    REPORT.write_text(json.dumps({
        "schema": 69,
        "pipeline": "OpenAI ImageGen master + deterministic border-connected checker cleanup",
        "canonExact": False,
        "originalProjectAsset": True,
        "source": SOURCE.relative_to(ROOT).as_posix(),
        "sourceSha256": sha256(SOURCE),
        "sourceDimensions": source_size,
        "sourceMode": source_mode,
        "removedCheckerPixels": removed,
        "output": OUTPUT.relative_to(ROOT).as_posix(),
        "outputSha256": sha256(OUTPUT),
        "dimensions": [WIDTH, HEIGHT],
        "mode": normalized.mode,
        "grid": {"columns": COLUMNS, "rows": ROWS, "cellWidth": CELL, "cellHeight": CELL, "guard": GUARD},
        "transparentRatio": round(transparent / (WIDTH * HEIGHT), 6),
        "cells": cells,
    }, indent=2) + "\n", encoding="utf-8")
    print(REPORT.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
