"""Release V64 gate for the three exact-reference hybrid enemy atlases."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

from PIL import Image

from v64_sprite_cell_quality import validate_v64_cells


ROOT = Path(__file__).resolve().parents[1]
BASE_GATE = Path(__file__).with_name("check-sprite-alpha-v56.py")
MANIFEST = ROOT / "assets" / "openai" / "sprites" / "manifest.json"
EXPECTED_ATLASES = 195
EXPECTED_CELLS = 2772
SHEET_IDS = {
    "enemy.newborn.action.v64",
    "enemy.offspring.action.v64",
    "enemy.predalien.action.v64",
}


def load_base_gate():
    spec = importlib.util.spec_from_file_location("sprite_alpha_v64", BASE_GATE)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load the shared sprite alpha gate")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    gate = load_base_gate()
    gate.EXPECTED_RELEASE = "v64"
    gate.EXPECTED_ATLASES = EXPECTED_ATLASES
    gate.EXPECTED_CELLS = EXPECTED_CELLS
    gate.main()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    sheets = [sheet for sheet in manifest["sheets"] if sheet.get("wave") == "v64"]
    if {sheet["id"] for sheet in sheets} != SHEET_IDS:
        raise ValueError(f"unexpected V64 sheet set: {[sheet['id'] for sheet in sheets]}")
    for sheet in sheets:
        path = ROOT / sheet["files"]["normalized"].lstrip("/")
        with Image.open(path) as source:
            image = source.convert("RGBA")
        validate_v64_cells(image, sheet["id"])
        alpha = image.getchannel("A")
        for seam in (255, 256, 511, 512, 767, 768):
            if alpha.crop((seam, 0, seam + 1, image.height)).getbbox():
                raise ValueError(f"{sheet['id']}: occupied vertical grid seam {seam}")
            if alpha.crop((0, seam, image.width, seam + 1)).getbbox():
                raise ValueError(f"{sheet['id']}: occupied horizontal grid seam {seam}")
        spill = sum(
            1
            for red, green, blue, pixel_alpha in image.get_flattened_data()
            if pixel_alpha >= 16 and red > 160 and blue > 160 and green + 35 < min(red, blue)
        )
        if spill:
            raise ValueError(f"{sheet['id']}: {spill} magenta spill pixels remain")
    print("Validated V64 hybrids: 48 substantial guarded cells, balanced rows, clear seams and zero magenta spill.")


if __name__ == "__main__":
    main()
