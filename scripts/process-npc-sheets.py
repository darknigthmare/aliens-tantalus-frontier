"""Turn an ImageGen 4x4 NPC sheet into a runtime-safe transparent atlas.

ImageGen can return a baked checkerboard and poses that cross the nominal cell
edges.  This deterministic pass removes the edge-connected checker, isolates
the dominant pose in every cell, applies one scale to the full sheet, and
anchors every pose to the same feet baseline with a 16 px guard band.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


GRID = 4
TARGET_SIZE = 1024
CELL_SIZE = TARGET_SIZE // GRID
MARGIN = 16


def is_checker(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    return alpha < 16 or (
        min(red, green, blue) >= 214
        and max(red, green, blue) - min(red, green, blue) <= 24
    )


def remove_checker(source: Image.Image) -> Image.Image:
    image = source.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

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
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)
    return image


def dominant_component(image: Image.Image) -> tuple[Image.Image, tuple[int, int, int, int]]:
    """Return the largest connected non-transparent component and its bounds."""

    alpha = image.getchannel("A")
    width, height = image.size
    mask = bytearray(1 if value > 16 else 0 for value in alpha.getdata())
    visited = bytearray(width * height)
    best: list[int] = []

    for start, present in enumerate(mask):
        if not present or visited[start]:
            continue
        visited[start] = 1
        queue = deque([start])
        component: list[int] = []
        while queue:
            index = queue.popleft()
            component.append(index)
            x = index % width
            y = index // width
            neighbours = []
            if x:
                neighbours.append(index - 1)
            if x + 1 < width:
                neighbours.append(index + 1)
            if y:
                neighbours.append(index - width)
            if y + 1 < height:
                neighbours.append(index + width)
            for neighbour in neighbours:
                if mask[neighbour] and not visited[neighbour]:
                    visited[neighbour] = 1
                    queue.append(neighbour)
        if len(component) > len(best):
            best = component

    if not best:
        raise ValueError("No sprite component found")

    component_mask = Image.new("L", image.size, 0)
    component_pixels = component_mask.load()
    xs: list[int] = []
    ys: list[int] = []
    for index in best:
        x = index % width
        y = index // width
        component_pixels[x, y] = alpha.getpixel((x, y))
        xs.append(x)
        ys.append(y)
    bounds = (min(xs), min(ys), max(xs) + 1, max(ys) + 1)
    isolated = Image.new("RGBA", image.size, (0, 0, 0, 0))
    isolated.paste(image, (0, 0), component_mask)
    return isolated.crop(bounds), bounds


def extract_frames(cleaned: Image.Image) -> list[Image.Image]:
    source_width, source_height = cleaned.size
    overlap = round(min(source_width, source_height) / GRID * 0.16)
    frames: list[Image.Image] = []
    for row in range(GRID):
        for column in range(GRID):
            left = round(column * source_width / GRID)
            top = round(row * source_height / GRID)
            right = round((column + 1) * source_width / GRID)
            bottom = round((row + 1) * source_height / GRID)
            extended = (
                max(0, left - overlap),
                max(0, top - overlap),
                min(source_width, right + overlap),
                min(source_height, bottom + overlap),
            )
            crop = cleaned.crop(extended)
            frame, _ = dominant_component(crop)
            frames.append(frame)
    return frames


def normalize(source: Image.Image) -> Image.Image:
    frames = extract_frames(remove_checker(source))
    maximum_width = max(frame.width for frame in frames)
    maximum_height = max(frame.height for frame in frames)
    usable = CELL_SIZE - MARGIN * 2
    scale = min(usable / maximum_width, usable / maximum_height)
    atlas = Image.new("RGBA", (TARGET_SIZE, TARGET_SIZE), (0, 0, 0, 0))

    for index, frame in enumerate(frames):
        width = max(1, round(frame.width * scale))
        height = max(1, round(frame.height * scale))
        resized = frame.resize((width, height), Image.Resampling.LANCZOS)
        column = index % GRID
        row = index // GRID
        x = column * CELL_SIZE + (CELL_SIZE - width) // 2
        y = row * CELL_SIZE + CELL_SIZE - MARGIN - height
        atlas.alpha_composite(resized, (x, y))
    return atlas


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    if not args.source.exists():
        raise SystemExit(f"Missing source: {args.source}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    atlas = normalize(Image.open(args.source))
    atlas.save(args.output, optimize=True)
    print(f"{args.output}: {atlas.size[0]}x{atlas.size[1]} {atlas.mode}")


if __name__ == "__main__":
    main()
