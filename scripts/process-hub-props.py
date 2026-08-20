"""Normalize the OpenAI hub prop atlas and export one transparent PNG per prop.

The ImageGen master is deliberately kept untouched for provenance.  This script
only performs deterministic production processing: checkerboard removal,
normalization to a 4x4 1024px atlas, guard-band clearing, and lossless crops.
"""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/openai/hub/props/hub-modular-props-atlas.png"
CLEAN_ATLAS = ROOT / "assets/openai/hub/props/hub-modular-props-atlas-clean.png"
REPORT = ROOT / "assets/openai/hub/props/hub-modular-props-report.json"

PROP_NAMES = (
    "bulkhead-door",
    "lift-door",
    "bridge-terminal",
    "briefing-table",
    "cryopod",
    "bunk-module",
    "mess-table",
    "medical-bed",
    "lab-console",
    "quarantine-unit",
    "armory-rack",
    "workbench",
    "vehicle-lift",
    "reactor-column",
    "life-support-scrubber",
    "sensor-console",
)


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    return alpha < 16 or (min(red, green, blue) >= 214 and max(red, green, blue) - min(red, green, blue) <= 24)


def remove_embedded_checkerboard(source: Image.Image) -> Image.Image:
    image = source.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if visited[index] or not is_background(pixels[x, y]):
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
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    # Checker pixels inside closed silhouettes cannot be reached from the image
    # edge.  Remove only the near-neutral highlights that match the generated
    # checker palette; coloured lamps and metallic highlights stay intact.
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha and min(red, green, blue) >= 240 and max(red, green, blue) - min(red, green, blue) <= 10:
                pixels[x, y] = (0, 0, 0, 0)
    return image


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source atlas: {SOURCE}")

    cleaned = remove_embedded_checkerboard(Image.open(SOURCE))
    normalized = cleaned.resize((1024, 1024), Image.Resampling.LANCZOS)
    pixels = normalized.load()
    guard = 5
    boundaries = (0, 256, 512, 768, 1024)
    for y in range(1024):
        for x in range(1024):
            if any(abs(x - boundary) < guard or abs(y - boundary) < guard for boundary in boundaries):
                pixels[x, y] = (0, 0, 0, 0)
    normalized.save(CLEAN_ATLAS, optimize=True)

    exports: list[dict[str, object]] = []
    for index, name in enumerate(PROP_NAMES):
        column = index % 4
        row = index // 4
        cell = normalized.crop((column * 256, row * 256, (column + 1) * 256, (row + 1) * 256))
        bounds = cell.getbbox()
        if bounds is None:
            raise SystemExit(f"Empty prop cell: {name}")
        left, top, right, bottom = bounds
        padding = 8
        left = max(0, left - padding)
        top = max(0, top - padding)
        right = min(256, right + padding)
        bottom = min(256, bottom + padding)
        prop = cell.crop((left, top, right, bottom))
        destination = SOURCE.parent / f"{name}.png"
        prop.save(destination, optimize=True)
        alpha = prop.getchannel("A")
        transparent = sum(1 for value in alpha.getdata() if value == 0)
        exports.append(
            {
                "name": name,
                "file": destination.relative_to(ROOT).as_posix(),
                "sourceCell": {"column": column, "row": row},
                "width": prop.width,
                "height": prop.height,
                "transparentRatio": round(transparent / (prop.width * prop.height), 4),
            }
        )

    REPORT.write_text(
        json.dumps(
            {
                "pipeline": "OpenAI ImageGen master + deterministic Pillow alpha cleanup and 4x4 crop",
                "source": SOURCE.relative_to(ROOT).as_posix(),
                "cleanAtlas": CLEAN_ATLAS.relative_to(ROOT).as_posix(),
                "sourceDimensions": list(cleaned.size),
                "normalizedDimensions": [1024, 1024],
                "cellSize": 256,
                "guard": guard,
                "exports": exports,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps(exports, indent=2))


if __name__ == "__main__":
    main()
