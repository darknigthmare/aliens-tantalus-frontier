"""Release V59 gate for all atlases plus access-sheet frame distinctness."""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BASE_GATE = Path(__file__).with_name("check-sprite-alpha-v56.py")
MANIFEST = ROOT / "assets" / "openai" / "sprites" / "manifest.json"
EXPECTED_ATLASES = 182
EXPECTED_CELLS = 2564
EXPECTED_V59_IDS = {
    "vehicle.m577-apc.access-damage",
    "vehicle.m577-command-apc.access-damage",
    "vehicle.p5000-powered-work-loader.access-damage",
    "vehicle.ud4l-cheyenne-dropship.access-damage",
}


def load_base_gate():
    spec = importlib.util.spec_from_file_location("sprite_alpha_v56", BASE_GATE)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load the shared sprite alpha gate")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def frame_hashes(image: Image.Image, columns: int, rows: int) -> list[str]:
    cell_width = image.width // columns
    cell_height = image.height // rows
    return [
        hashlib.sha256(image.crop((
            column * cell_width,
            row * cell_height,
            (column + 1) * cell_width,
            (row + 1) * cell_height,
        )).tobytes()).hexdigest()
        for row in range(rows)
        for column in range(columns)
    ]


def main() -> None:
    gate = load_base_gate()
    gate.EXPECTED_RELEASE = "v59"
    gate.EXPECTED_ATLASES = EXPECTED_ATLASES
    gate.EXPECTED_CELLS = EXPECTED_CELLS
    gate.main()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    v59_sheets = {sheet["id"]: sheet for sheet in manifest["sheets"] if sheet.get("wave") == "v59"}
    if set(v59_sheets) != EXPECTED_V59_IDS:
        raise ValueError(f"unexpected V59 sheet set: {sorted(v59_sheets)}")
    grids = manifest["contracts"]["grids"]
    for sheet_id, sheet in v59_sheets.items():
        grid = grids[sheet["grid"]]
        path = ROOT / sheet["files"]["normalized"].lstrip("/")
        with Image.open(path) as source:
            image = source.convert("RGBA")
        hashes = frame_hashes(image, int(grid["columns"]), int(grid["rows"]))
        if len(set(hashes)) != 16:
            raise ValueError(f"{sheet_id}: expected 16 distinct cells, received {len(set(hashes))}")
    print("Validated 4 V59 vehicle access atlases with 16 distinct cells each.")


if __name__ == "__main__":
    main()
