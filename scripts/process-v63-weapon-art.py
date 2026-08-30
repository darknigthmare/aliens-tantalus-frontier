"""Normalize the V63 ASSO-400 weapon atlas and freeze its production report."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BASE_PIPELINE = Path(__file__).with_name("process-single-sprite-atlas-v56.py")
SOURCE = ROOT / "assets" / "openai" / "sprites" / "weapons" / "asso-400-harpoon-gun-action-sheet-v63.png"
DESTINATION = ROOT / "assets" / "openai" / "sprites" / "normalized" / "weapons" / "asso-400-harpoon-gun-action-sheet-v63.png"
REPORT = ROOT / "assets" / "openai" / "v63-art-normalization-report.json"
CLEAN_SOURCE = ROOT / ".tmp" / "v63-asso-400-harpoon-clean.png"


def load_pipeline():
    spec = importlib.util.spec_from_file_location("v63_weapon_pipeline", BASE_PIPELINE)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load the shared sprite normalization pipeline")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def chroma_key(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    data = bytearray(image.tobytes())
    for offset in range(0, len(data), 4):
        red, green, blue = data[offset], data[offset + 1], data[offset + 2]
        dominance = min(red, blue) - green
        # The source matte is deliberately pure magenta. A hard dominance cut
        # removes both the matte and its anti-aliased spill; the later Lanczos
        # repack recreates neutral edge alpha from the retained weapon pixels.
        if red > 30 and blue > 30 and dominance > 12:
            data[offset + 3] = 0
        elif abs(red - blue) <= 28 and dominance > 2:
            neutral_ceiling = min(255, green + 2)
            data[offset] = min(red, neutral_ceiling)
            data[offset + 2] = min(blue, neutral_ceiling)
        if data[offset + 3] == 0:
            data[offset] = data[offset + 1] = data[offset + 2] = 0
    destination.parent.mkdir(parents=True, exist_ok=True)
    Image.frombytes("RGBA", image.size, bytes(data)).save(destination, optimize=True)


def despill_normalized_atlas(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    data = bytearray(image.tobytes())
    for offset in range(0, len(data), 4):
        red, green, blue, alpha = data[offset], data[offset + 1], data[offset + 2], data[offset + 3]
        dominance = min(red, blue) - green
        if alpha and abs(red - blue) <= 28 and dominance > 2:
            neutral_ceiling = min(255, green + 2)
            data[offset] = min(red, neutral_ceiling)
            data[offset + 2] = min(blue, neutral_ceiling)
        if not alpha:
            data[offset] = data[offset + 1] = data[offset + 2] = 0
    Image.frombytes("RGBA", image.size, bytes(data)).save(path, optimize=True)


def main() -> None:
    pipeline = load_pipeline()
    chroma_key(SOURCE, CLEAN_SOURCE)
    try:
        entry = pipeline.normalize(CLEAN_SOURCE, DESTINATION)
    finally:
        CLEAN_SOURCE.unlink(missing_ok=True)
    despill_normalized_atlas(DESTINATION)
    entry["source"] = SOURCE.relative_to(ROOT).as_posix()
    report = {
        "release": "v63",
        "producer": "OpenAI ImageGen + deterministic chroma extraction",
        "contract": "4x4 weapon-action-v56, right-facing, 16 px transparent guard",
        "spriteAtlasCount": 1,
        "spriteCellCount": 16,
        "spriteAtlases": [entry],
    }
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(entry, ensure_ascii=False))


if __name__ == "__main__":
    main()
