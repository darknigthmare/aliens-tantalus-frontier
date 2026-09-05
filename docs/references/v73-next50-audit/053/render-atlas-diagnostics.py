"""Diagnostic render/measurements from existing atlas pixels, not sprite editing."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PROFILE = "enemy-053-albino-ovomorph"

def frame(atlas, index):
    return atlas.crop((index % 4 * 256, index // 4 * 256, (index % 4 + 1) * 256, (index // 4 + 1) * 256))

def montage(atlas, indices, columns, title, path, background):
    board = Image.new("RGB", (columns * 256, ((len(indices) + columns - 1) // columns) * 282 + 40), background)
    draw = ImageDraw.Draw(board)
    draw.text((8, 12), title, fill="#d3eae2" if background[0] < 100 else "black")
    for ordinal, index in enumerate(indices):
        x, y = ordinal % columns * 256, ordinal // columns * 282 + 40
        rgba = frame(atlas, index)
        board.paste(rgba, (x, y + 24), rgba)
        label = ["sealed", "opening", "hatch", "destroyed"][index // 8]
        draw.text((x + 6, y + 4), f"{label} pose{index % 8 + 1}/8", fill="#d3eae2" if background[0] < 100 else "black")
        draw.line((x + 123, y + 264, x + 133, y + 264), fill="#33b390")
        draw.line((x + 128, y + 259, x + 128, y + 269), fill="#33b390")
    board.save(path, "JPEG", quality=95)

def main():
    metadata = json.loads((ROOT / f"assets/openai/sprites/metadata/v66/{PROFILE}.json").read_text(encoding="utf-8"))
    path = ROOT / metadata["normalized"]
    assert hashlib.sha256(path.read_bytes()).hexdigest() == metadata["normalizedSha256"]
    with Image.open(path) as source:
        atlas = source.convert("RGBA")
    montage(atlas, list(range(32)), 4, f"{PROFILE}: actual256px cells / dark matte QA", HERE / "atlas-dark.jpg", (11, 20, 26))
    montage(atlas, list(range(32)), 4, f"{PROFILE}: actual256px cells / pale matte QA", HERE / "atlas-pale.jpg", (234, 232, 226))
    montage(atlas, [6, 7, 8, 9, 14, 15, 16, 17, 22, 23, 24, 25, 26, 27, 30, 31], 4, "053 transition boundaries: same canvas, scale and physical pivot", HERE / "transitions.jpg", (11, 20, 26))
    bounds = [list(frame(atlas, index).getchannel("A").getbbox()) for index in range(32)]
    details = {"profileId": PROFILE, "atlasSha256": metadata["normalizedSha256"], "packScale": metadata["scale"], "clipFactors": metadata["sourceScaleByClip"], "alphaBoundsByFrame": bounds, "uniqueFrameCount": metadata["validation"]["uniqueFrameCount"], "strictMagenta": metadata["magentaSpill"], "findingCount": len(metadata["validation"]["findings"]), "rawSourcePreserved": True, "artAccepted": False, "runtimeIntegrated": False}
    print(json.dumps(details, indent=2))

if __name__ == "__main__":
    main()
