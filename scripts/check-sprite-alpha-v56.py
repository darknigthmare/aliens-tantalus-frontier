"""Release v56 gate for mixed-grid sprite transparency and cell guards."""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "openai" / "sprites" / "manifest.json"
EXPECTED_ATLASES = 178
EXPECTED_RELEASE = "v56"
EXPECTED_CELLS = 2500
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


def assert_hidden_rgb_clear(sheet_id: str, image: Image.Image) -> None:
    red, green, blue, alpha = image.split()
    transparent = alpha.point(lambda value: 255 if value == 0 else 0)
    for name, channel in (("red", red), ("green", green), ("blue", blue)):
        if ImageChops.multiply(channel, transparent).getbbox():
            raise ValueError(f"{sheet_id}: hidden {name} RGB under fully transparent pixels")


def assert_cell_guard(
    sheet_id: str,
    alpha: Image.Image,
    columns: int,
    rows: int,
    cell_width: int,
    cell_height: int,
    guard: int,
) -> None:
    for index in range(columns * rows):
        column = index % columns
        row = index // columns
        bounds = (
            column * cell_width,
            row * cell_height,
            (column + 1) * cell_width,
            (row + 1) * cell_height,
        )
        occupied = alpha.crop(bounds).point(lambda value: 255 if value >= 16 else 0)
        box = occupied.getbbox()
        if box is None:
            raise ValueError(f"{sheet_id} cell {index}: empty cell")
        left, top, right, bottom = box
        if left < guard or top < guard or right > cell_width - guard or bottom > cell_height - guard:
            raise ValueError(f"{sheet_id} cell {index}: sprite crosses the {guard}px guard with bounds {box}")


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if manifest.get("release") != EXPECTED_RELEASE:
        raise ValueError(f"expected sprite release {EXPECTED_RELEASE}, received {manifest.get('release')}")
    if len(manifest.get("sheets", [])) != EXPECTED_ATLASES:
        raise ValueError(f"expected {EXPECTED_ATLASES} atlases, received {len(manifest.get('sheets', []))}")

    checked_cells = 0
    black_xeno_cells = 0
    chroma_cells = 0
    grids = manifest.get("contracts", {}).get("grids", {})
    for sheet in manifest["sheets"]:
        sheet_id = sheet["id"]
        grid = grids.get(sheet.get("grid"))
        if not grid:
            raise ValueError(f"{sheet_id}: missing grid contract {sheet.get('grid')}")
        columns = int(grid["columns"])
        rows = int(grid["rows"])
        cell_width = int(grid["cellWidth"])
        cell_height = int(grid["cellHeight"])
        guard = int(grid["guard"])
        expected_size = (columns * cell_width, rows * cell_height)

        path = ROOT / sheet["files"]["normalized"].lstrip("/")
        with Image.open(path) as source:
            image = source.convert("RGBA") if source.mode != "RGBA" else source.copy()
        if source.mode != "RGBA" or image.size != expected_size:
            raise ValueError(f"{sheet_id}: expected {expected_size} RGBA, received {source.size} {source.mode}")

        assert_hidden_rgb_clear(sheet_id, image)
        assert_cell_guard(sheet_id, image.getchannel("A"), columns, rows, cell_width, cell_height, guard)
        checked_cells += columns * rows

        if sheet_id in BLACK_XENO_IDS:
            for index in range(columns * rows):
                column = index % columns
                row = index // columns
                cell = image.crop((
                    column * cell_width,
                    row * cell_height,
                    (column + 1) * cell_width,
                    (row + 1) * cell_height,
                ))
                islands = large_light_islands(cell)
                if islands:
                    raise ValueError(f"{sheet_id} cell {index}: trapped light islands {islands}")
                black_xeno_cells += 1

        if sheet_id in CHROMA_RECOVERED_IDS:
            for red, green, blue, alpha in image.get_flattened_data():
                if alpha >= 16 and green > max(red, blue):
                    raise ValueError(f"{sheet_id}: green chroma spill remains")
            chroma_cells += columns * rows

    if checked_cells != EXPECTED_CELLS:
        raise ValueError(f"expected {EXPECTED_CELLS} cells, received {checked_cells}")
    print(
        f"Validated {EXPECTED_ATLASES} RGBA atlases / {checked_cells} guarded cells; "
        f"{black_xeno_cells} black-xenomorph cells have no trapped light islands; "
        f"{chroma_cells} chroma cells have no green spill."
    )


if __name__ == "__main__":
    main()
