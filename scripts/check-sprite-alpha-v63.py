"""Release V63 gate for the complete manifest and ASSO-400 atlas."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BASE_GATE = Path(__file__).with_name("check-sprite-alpha-v56.py")
MANIFEST = ROOT / "assets" / "openai" / "sprites" / "manifest.json"
EXPECTED_ATLASES = 192
EXPECTED_CELLS = 2724
SHEET_ID = "weapon.asso-400-harpoon-gun.action.v63"


def load_base_gate():
    spec = importlib.util.spec_from_file_location("sprite_alpha_v63", BASE_GATE)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load the shared sprite alpha gate")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    gate = load_base_gate()
    gate.EXPECTED_RELEASE = "v63"
    gate.EXPECTED_ATLASES = EXPECTED_ATLASES
    gate.EXPECTED_CELLS = EXPECTED_CELLS
    gate.main()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    sheets = [sheet for sheet in manifest["sheets"] if sheet.get("wave") == "v63"]
    if len(sheets) != 1 or sheets[0]["id"] != SHEET_ID:
        raise ValueError(f"unexpected V63 sheet set: {[sheet['id'] for sheet in sheets]}")
    path = ROOT / sheets[0]["files"]["normalized"].lstrip("/")
    with Image.open(path) as source:
        image = source.convert("RGBA")
    alpha = image.getchannel("A")
    for seam in (255, 256, 511, 512, 767, 768):
        if alpha.crop((seam, 0, seam + 1, image.height)).getbbox():
            raise ValueError(f"{SHEET_ID}: occupied vertical grid seam {seam}")
        if alpha.crop((0, seam, image.width, seam + 1)).getbbox():
            raise ValueError(f"{SHEET_ID}: occupied horizontal grid seam {seam}")
    spill = sum(
        1 for red, green, blue, pixel_alpha in image.get_flattened_data()
        if pixel_alpha >= 16 and abs(red - blue) <= 28 and min(red, blue) - green > 4
    )
    if spill:
        raise ValueError(f"{SHEET_ID}: {spill} magenta spill pixels remain")
    print("Validated V63 ASSO-400: 16 guarded right-facing cells, clear seams and zero magenta spill.")


if __name__ == "__main__":
    main()
