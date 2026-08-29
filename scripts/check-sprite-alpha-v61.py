"""Release V61 gate for every atlas plus the Excel-linked weapon sheets."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BASE_GATE = Path(__file__).with_name("check-sprite-alpha-v56.py")
MANIFEST = ROOT / "assets" / "openai" / "sprites" / "manifest.json"
EXPECTED_ATLASES = 191
EXPECTED_CELLS = 2708
EXPECTED_V61_IDS = {
    "weapon.ak-4047-pulse-rifle.action",
    "weapon.f44aa-pulse-rifle.action",
    "weapon.m39-submachine-gun.action",
    "weapon.m42a-scope-rifle.action",
    "weapon.m5-rpg.action",
    "weapon.m6b-rocket-launcher.action",
    "weapon.m83-sadar.action",
    "weapon.m94-impact-grenade.action",
    "weapon.type-88-heavy-assault-rifle.action",
}


def load_base_gate():
    spec = importlib.util.spec_from_file_location("sprite_alpha_v56", BASE_GATE)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load the shared sprite alpha gate")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    gate = load_base_gate()
    gate.EXPECTED_RELEASE = "v61"
    gate.EXPECTED_ATLASES = EXPECTED_ATLASES
    gate.EXPECTED_CELLS = EXPECTED_CELLS
    gate.main()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    sheets = {sheet["id"]: sheet for sheet in manifest["sheets"] if sheet.get("wave") == "v61"}
    if set(sheets) != EXPECTED_V61_IDS:
        raise ValueError(f"unexpected V61 sheet set: {sorted(sheets)}")
    for sheet_id, sheet in sheets.items():
        path = ROOT / sheet["files"]["normalized"].lstrip("/")
        with Image.open(path) as source:
            image = source.convert("RGBA")
        alpha = image.getchannel("A")
        for seam in (255, 256, 511, 512, 767, 768):
            if alpha.crop((seam, 0, seam + 1, image.height)).getbbox():
                raise ValueError(f"{sheet_id}: occupied vertical grid seam {seam}")
            if alpha.crop((0, seam, image.width, seam + 1)).getbbox():
                raise ValueError(f"{sheet_id}: occupied horizontal grid seam {seam}")
    print("Validated 9 V61 weapon atlases: 16 guarded cells, right-facing contract and clear seams each.")


if __name__ == "__main__":
    main()
