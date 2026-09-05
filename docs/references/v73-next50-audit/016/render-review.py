"""Diagnostic overlays only, adapted from the existing V72 review renderer."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PROFILE = "enemy-016-burster"


def main():
    anchors = json.loads((HERE / "anchor-review.fragment.json").read_text(encoding="utf-8"))["profiles"][PROFILE]
    scales = json.loads((HERE / "scale-review.fragment.json").read_text(encoding="utf-8"))["profiles"][PROFILE]
    outputs = []
    for clip, record in anchors["clips"].items():
        source_path = ROOT / f"assets/openai/sprites/frames/v66/batch-002/{PROFILE}/{clip}.png"
        before = hashlib.sha256(source_path.read_bytes()).hexdigest()
        assert before == record["sourceSha256"] == scales["sourceSha256ByClip"][clip]
        with Image.open(source_path) as source:
            assert list(source.size) == record["sourceSize"]
            canvas = Image.new("RGB", (source.width, source.height + 90), (17, 24, 30))
            canvas.paste(source.convert("RGB"), (0, 90))
            draw = ImageDraw.Draw(canvas)
            draw.text((10, 10), f"{PROFILE} / {clip} / PHYSICAL AND SCALE REVIEW ONLY - NOT ART ACCEPTANCE", fill="white")
            draw.text((10, 30), "Yellow: observed ribcage. Green: support plus 3px extraction guard. Cyan: rigid cranial shell chord (+/-6px).", fill="white")
            draw.text((10, 50), f"Source SHA256 {before}", fill="white")
            for frame in record["frames"]:
                index = frame["frame"]
                ox = round((index % 4) * source.width / 4)
                oy = round((index // 4) * source.height / 2) + 90
                x, y = frame["landmark"]
                ax, ay = frame["anchor"]
                draw.line((ox, oy, ox, oy + round(source.height / 2)), fill="#aaa060")
                draw.text((ox + 8, oy + 8), f"pose{index + 1} root{ax},{ay} +/-10px", fill="white", stroke_width=1, stroke_fill="black")
                draw.line((ox + x, oy + y, ox + ax, oy + ay), fill="yellow", width=2)
                draw.ellipse((ox + x - 6, oy + y - 6, ox + x + 6, oy + y + 6), outline="yellow", width=2)
                draw.line((ox + 55, oy + ay, ox + 400, oy + ay), fill="#88ff88", width=2)
                for measure in scales["measurements"]:
                    if measure["clip"] == clip and measure["frame"] == index:
                        (x0, y0), (x1, y1) = measure["endpoints"]
                        draw.line((ox + x0, oy + y0, ox + x1, oy + y1), fill="cyan", width=2)
                        for px, py in [(x0, y0), (x1, y1)]:
                            draw.ellipse((ox + px - 3, oy + py - 3, ox + px + 3, oy + py + 3), outline="cyan", width=2)
            output = HERE / f"{clip}-physical-scale-review.jpg"
            canvas.save(output, "JPEG", quality=92)
            outputs.append(str(output.relative_to(ROOT)).replace("\\", "/"))
        assert hashlib.sha256(source_path.read_bytes()).hexdigest() == before
    print(json.dumps({"diagnosticOverlays": outputs, "sourcePixelsModified": 0, "acceptedAutomatically": 0}, indent=2))


if __name__ == "__main__":
    main()
