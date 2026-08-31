"""Render technical review contact sheets from existing V66 atlases; no art synthesis."""
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
queue = json.loads((ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json").read_text(encoding="utf-8"))
out = ROOT / "docs/references/v66-atlas-review"
out.mkdir(parents=True, exist_ok=True)
for job in queue["jobs"]:
    if job["batchId"] != "batch-001":
        continue
    with Image.open(ROOT / job["normalizedPath"]) as source:
        atlas = source.convert("RGBA")
    cell, label = 192, 23
    board = Image.new("RGB", (cell * 4, (cell + label) * 8 + 26), (10, 17, 22))
    draw = ImageDraw.Draw(board)
    draw.text((8, 7), job["profileId"] + " / normalized authored poses / QA only", fill=(218, 239, 231))
    for index in range(32):
        x = (index % 4) * cell
        y = 26 + (index // 4) * (cell + label)
        frame = atlas.crop(((index % 4) * 256, (index // 4) * 256, (index % 4 + 1) * 256, (index // 4 + 1) * 256))
        frame = frame.resize((cell, cell), Image.Resampling.NEAREST)
        board.paste(frame, (x, y + label), frame)
        clip = job["clips"][index // 8]["id"]
        draw.text((x + 5, y + 5), str(index) + " / " + clip, fill=(164, 191, 204))
        baseline = y + label + round(240 * cell / 256)
        anchor = x + cell // 2
        draw.line((anchor - 3, baseline, anchor + 3, baseline), fill=(64, 233, 174))
        draw.line((anchor, baseline - 3, anchor, baseline + 3), fill=(64, 233, 174))
        draw.rectangle((x, y + label, x + cell - 1, y + label + cell - 1), outline=(29, 44, 53))
    path = out / (job["profileId"] + ".jpg")
    board.save(path, quality=93)
    print(path.relative_to(ROOT).as_posix())
