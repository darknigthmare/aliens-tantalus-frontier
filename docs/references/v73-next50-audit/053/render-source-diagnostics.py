"""Generate diagnostic annotations only. Never alter a source or game sprite."""
import hashlib
import json
import argparse
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PROFILE = "enemy-053-albino-ovomorph"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--revision", choices=("r1", "r2"), default="r2")
    args = parser.parse_args()
    records = json.loads((HERE / f"source-inspection-{args.revision}.json").read_text(encoding="utf-8"))["sources"]
    for record in records:
        path = ROOT / f"assets/openai/sprites/frames/v66/batch-004/{PROFILE}/{record['clip']}.png"
        if hashlib.sha256(path.read_bytes()).hexdigest() != record["sha256"]:
            path = ROOT / f"assets/openai/sprites/frames/v73/{PROFILE}/{record['clip']}-{args.revision}-rejected.png"
        assert hashlib.sha256(path.read_bytes()).hexdigest() == record["sha256"]
        with Image.open(path) as source:
            canvas = Image.new("RGB", (source.width, source.height + 90), (15, 20, 28))
            canvas.paste(source.convert("RGB"), (0, 90))
            draw = ImageDraw.Draw(canvas)
            draw.text((12, 10), f"{PROFILE} {record['clip']} - DIAGNOSTIC PROPOSALS, NOT ACCEPTANCE", fill="white")
            draw.text((12, 30), "Green: visible shell support; yellow: lower-shell median center; cyan: section 100px above support.", fill="white")
            draw.text((12, 50), record["sha256"], fill="white")
            for frame in record["frames"]:
                index = frame["frame"]
                ox = round((index % 4) * source.width / 4)
                oy = round((index // 4) * source.height / 2) + 90
                x, floor = frame["lowerShellCenterX"], frame["supportY"]
                for gx in range(0, 444, 100):
                    draw.line((ox + gx, oy, ox + gx, oy + round(source.height / 2)), fill=(120, 60, 100), width=1)
                draw.line((ox + 20, oy + floor, ox + 420, oy + floor), fill="#44ff88", width=2)
                draw.line((ox + x, oy + floor - 60, ox + x, oy + floor), fill="yellow", width=2)
                draw.ellipse((ox + x - 5, oy + floor - 65, ox + x + 5, oy + floor - 55), outline="yellow", width=2)
                row = next(item for item in frame["shellCrossSections"] if item["aboveFloor"] == 100)
                draw.line((ox + row["left"], oy + row["y"], ox + row["right"], oy + row["y"]), fill="cyan", width=2)
                draw.text((ox + 8, oy + 8), f"pose{index + 1} root{x},{floor} section{row['width']}px", fill="white", stroke_width=1, stroke_fill="black")
            canvas.save(HERE / f"{record['clip']}-source-diagnostic-{args.revision}.jpg", "JPEG", quality=92)
        assert hashlib.sha256(path.read_bytes()).hexdigest() == record["sha256"]
    print("Four diagnostic overlays written; source pixels changed:0; accepted automatically:0.")

if __name__ == "__main__":
    main()
