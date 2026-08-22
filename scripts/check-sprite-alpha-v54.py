"""Release gate for normalized sprite transparency and trapped checker islands."""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "openai" / "sprites" / "manifest.json"
CELL = 256
GUARD = 16
BLACK_XENO_IDS = {
    "enemy.xenomorph-drone.locomotion",
    "enemy.xenomorph-drone.combat",
    "enemy.xenomorph-warrior.combat",
    "enemy.xenomorph-queen.combat",
    "enemy.xenomorph-runner.action",
}

CHROMA_RECOVERED_IDS = {
    "enemy.pathogen-mimic.action",
    "enemy.pale-crucible-hunter.action",
}

def bright_neutral(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    return alpha >= 16 and min(red, green, blue) >= 190 and max(red, green, blue) - min(red, green, blue) <= 36


def large_light_islands(cell: Image.Image, minimum: int = 96) -> list[int]:
    pixels = cell.load()
    width, height = cell.size
    mask = bytearray(1 if bright_neutral(pixels[index % width, index // width]) else 0 for index in range(width * height))
    visited = bytearray(width * height)
    islands: list[int] = []
    for start, present in enumerate(mask):
        if not present or visited[start]:
            continue
        visited[start] = 1
        queue = deque([start])
        size = 0
        while queue:
            index = queue.popleft()
            size += 1
            x = index % width
            y = index // width
            for neighbour in (
                index - 1 if x else -1,
                index + 1 if x + 1 < width else -1,
                index - width if y else -1,
                index + width if y + 1 < height else -1,
            ):
                if neighbour >= 0 and mask[neighbour] and not visited[neighbour]:
                    visited[neighbour] = 1
                    queue.append(neighbour)
        if size >= minimum:
            islands.append(size)
    return islands


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    checked_cells = 0
    chroma_cells = 0
    for sheet in manifest["sheets"]:
        path = ROOT / sheet["files"]["normalized"].lstrip("/")
        image = Image.open(path)
        if image.size != (1024, 1024) or image.mode != "RGBA":
            raise ValueError(f"{sheet['id']}: expected 1024x1024 RGBA, received {image.size} {image.mode}")
        pixels = image.load()
        for y in range(image.height):
            for x in range(image.width):
                red, green, blue, alpha = pixels[x, y]
                local_x = x % CELL
                local_y = y % CELL
                if alpha == 0 and (red or green or blue):
                    raise ValueError(f"{sheet['id']}: hidden RGB at {x},{y}")
                if alpha >= 16 and (local_x < GUARD or local_y < GUARD or local_x >= CELL - GUARD or local_y >= CELL - GUARD):
                    raise ValueError(f"{sheet['id']}: sprite crosses the {GUARD}px guard at {x},{y}")
                if sheet["id"] in CHROMA_RECOVERED_IDS and alpha >= 16 and green > max(red, blue):
                    raise ValueError(f"{sheet['id']}: green chroma spill at {x},{y}")
        if sheet["id"] in BLACK_XENO_IDS:
            for index in range(16):
                column = index % 4
                row = index // 4
                cell = image.crop((column * CELL, row * CELL, (column + 1) * CELL, (row + 1) * CELL))
                islands = large_light_islands(cell)
                if islands:
                    raise ValueError(f"{sheet['id']} cell {index}: trapped light islands {islands}")
                checked_cells += 1
        if sheet["id"] in CHROMA_RECOVERED_IDS:
            chroma_cells += 16
    print(
        f"Validated {len(manifest['sheets'])} RGBA atlases; "
        f"{checked_cells} black-xenomorph cells have no trapped checker islands; "
        f"{chroma_cells} chroma cells have no green spill."
    )


if __name__ == "__main__":
    main()
