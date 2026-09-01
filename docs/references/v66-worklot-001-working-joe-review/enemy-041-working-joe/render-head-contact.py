"""Render the fifteen selected skull-landmark crops for manual review."""

from pathlib import Path
import importlib.util

from PIL import Image, ImageDraw


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
helper_spec = importlib.util.spec_from_file_location(
    "working_joe_components", HERE / "audit-working-joe-profile.py"
)
helper = importlib.util.module_from_spec(helper_spec)
helper_spec.loader.exec_module(helper)

MEASUREMENT_FRAMES = {
    "idle": (0, 3, 7),
    "move": (0, 3, 6),
    "attack": (0, 4, 7),
    "death": (0, 1, 2),
    "hurt": (0, 2, 7),
}

tile_width, tile_height = 320, 240
canvas = Image.new("RGB", (tile_width * 3, tile_height * 5), (20, 24, 30))
draw = ImageDraw.Draw(canvas)
source_dir = ROOT / "assets/openai/sprites/frames/v66/batch-003/enemy-041-working-joe"
for row, clip in enumerate(helper.CLIPS):
    source = Image.open(source_dir / f"{clip}.png").convert("RGB")
    for column, frame in enumerate(MEASUREMENT_FRAMES[clip]):
        cell = source.crop(helper.cell_box(source.width, source.height, frame))
        component = helper.pale_components(cell)[0]
        x0, y0, x1, y1 = component["bounds"]
        region = cell.crop(
            (
                max(0, x0 - 18),
                max(0, y0 - 18),
                min(cell.width, x1 + 18),
                min(cell.height, y1 + 18),
            )
        )
        region.thumbnail((tile_width - 16, tile_height - 42), Image.Resampling.NEAREST)
        left = column * tile_width + (tile_width - region.width) // 2
        top = row * tile_height + 32 + (tile_height - 36 - region.height) // 2
        canvas.paste(region, (left, top))
        draw.text(
            (column * tile_width + 8, row * tile_height + 8),
            f"{clip} pose {frame + 1} | head {component['bounds']}",
            fill=(255, 255, 255),
        )
canvas.save(HERE / "head-landmark-contact.png")
