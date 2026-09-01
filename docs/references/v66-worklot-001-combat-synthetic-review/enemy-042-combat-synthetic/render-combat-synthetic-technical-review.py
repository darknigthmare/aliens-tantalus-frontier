"""Render deterministic, read-only technical evidence for enemy-042.

The five selected RGB boards are immutable inputs. Outputs remain standalone
review derivatives beside this script; no source, normalized asset, registry,
runtime file or other profile is rewritten.
"""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
import math
from pathlib import Path
import statistics

from PIL import Image, ImageDraw, ImageFont


PROFILE_ID = "enemy-042-combat-synthetic"
CLIPS = ("idle", "move", "attack", "death", "reload")
HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[4]
SOURCE_DIR = ROOT / "assets/openai/sprites/frames/v66/batch-003" / PROFILE_ID
FONT = ImageFont.load_default()


@dataclass(frozen=True)
class Cell:
    frame: int
    row: int
    column: int
    box: tuple[int, int, int, int]


# Local nominal-cell coordinates. The landmark is the reviewed pelvis / hip-ring
# centre. The anchor is its vertical projection onto current physical support.
# Anchor y uses the lower exclusive source bound, matching extraction convention.
ANCHORS: dict[str, list[dict[str, object]]] = {
    "idle": [
        {"landmark": (212, 242), "anchor": (212, 423), "uncertaintyPx": 8},
        {"landmark": (168, 242), "anchor": (168, 423), "uncertaintyPx": 8},
        {"landmark": (140, 240), "anchor": (140, 423), "uncertaintyPx": 8},
        {"landmark": (113, 242), "anchor": (113, 423), "uncertaintyPx": 8},
        {"landmark": (209, 220), "anchor": (209, 395), "uncertaintyPx": 8},
        {"landmark": (169, 221), "anchor": (169, 396), "uncertaintyPx": 8},
        {"landmark": (141, 221), "anchor": (141, 396), "uncertaintyPx": 8},
        {"landmark": (113, 221), "anchor": (113, 396), "uncertaintyPx": 8},
    ],
    "move": [
        {"landmark": (199, 262), "anchor": (199, 414), "uncertaintyPx": 9},
        {"landmark": (162, 262), "anchor": (162, 413), "uncertaintyPx": 9},
        {"landmark": (121, 262), "anchor": (121, 414), "uncertaintyPx": 9},
        {"landmark": (115, 262), "anchor": (115, 413), "uncertaintyPx": 9},
        {"landmark": (186, 198), "anchor": (186, 351), "uncertaintyPx": 9},
        {"landmark": (178, 198), "anchor": (178, 351), "uncertaintyPx": 9},
        {"landmark": (124, 199), "anchor": (124, 351), "uncertaintyPx": 9},
        {"landmark": (124, 198), "anchor": (124, 351), "uncertaintyPx": 9},
    ],
    "attack": [
        {"landmark": (164, 257), "anchor": (164, 425), "uncertaintyPx": 8},
        {"landmark": (123, 257), "anchor": (123, 425), "uncertaintyPx": 8},
        {"landmark": (91, 257), "anchor": (91, 425), "uncertaintyPx": 8},
        {"landmark": (54, 257), "anchor": (54, 425), "uncertaintyPx": 8},
        {"landmark": (161, 202), "anchor": (161, 366), "uncertaintyPx": 8},
        {"landmark": (145, 202), "anchor": (145, 366), "uncertaintyPx": 8},
        {"landmark": (82, 202), "anchor": (82, 366), "uncertaintyPx": 8},
        {"landmark": (85, 202), "anchor": (85, 366), "uncertaintyPx": 8},
    ],
    "death": [
        {"landmark": (190, 258), "anchor": (190, 416), "uncertaintyPx": 10},
        {"landmark": (163, 264), "anchor": (163, 416), "uncertaintyPx": 10},
        {"landmark": (128, 294), "anchor": (128, 415), "uncertaintyPx": 11},
        {"landmark": (81, 313), "anchor": (81, 415), "uncertaintyPx": 11},
        {"landmark": (185, 227), "anchor": (185, 289), "uncertaintyPx": 12},
        {"landmark": (148, 232), "anchor": (148, 288), "uncertaintyPx": 12},
        {"landmark": (145, 243), "anchor": (145, 288), "uncertaintyPx": 13},
        {"landmark": (144, 248), "anchor": (144, 289), "uncertaintyPx": 14},
    ],
    "reload": [
        {"landmark": (152, 232), "anchor": (152, 412), "uncertaintyPx": 8},
        {"landmark": (128, 232), "anchor": (128, 412), "uncertaintyPx": 8},
        {"landmark": (102, 232), "anchor": (102, 412), "uncertaintyPx": 8},
        {"landmark": (68, 232), "anchor": (68, 412), "uncertaintyPx": 8},
        {"landmark": (133, 200), "anchor": (133, 379), "uncertaintyPx": 9},
        {"landmark": (143, 200), "anchor": (143, 378), "uncertaintyPx": 9},
        {"landmark": (112, 200), "anchor": (112, 378), "uncertaintyPx": 9},
        {"landmark": (88, 200), "anchor": (88, 378), "uncertaintyPx": 8},
    ],
}


# Three head-readable poses per clip. The second x is the exclusive right edge
# of an uninterrupted shell interval, so Euclidean length equals occupied width.
# This rigid cranial-shell proxy excludes gun reach, stance and corpse width.
SCALE_MEASUREMENTS: dict[str, list[dict[str, object]]] = {
    "idle": [
        {"frame": 0, "endpoints": ((195, 86), (268, 86)), "uncertaintyPx": 3},
        {"frame": 2, "endpoints": ((115, 88), (189, 88)), "uncertaintyPx": 3},
        {"frame": 4, "endpoints": ((193, 69), (265, 69)), "uncertaintyPx": 3},
    ],
    "move": [
        {"frame": 0, "endpoints": ((204, 131), (264, 131)), "uncertaintyPx": 3},
        {"frame": 2, "endpoints": ((138, 131), (199, 131)), "uncertaintyPx": 3},
        {"frame": 4, "endpoints": ((205, 65), (265, 65)), "uncertaintyPx": 3},
    ],
    "attack": [
        {"frame": 0, "endpoints": ((162, 113), (229, 113)), "uncertaintyPx": 4},
        {"frame": 2, "endpoints": ((108, 113), (175, 113)), "uncertaintyPx": 4},
        {"frame": 4, "endpoints": ((178, 62), (245, 62)), "uncertaintyPx": 4},
    ],
    "death": [
        {"frame": 0, "endpoints": ((175, 122), (238, 122)), "uncertaintyPx": 4},
        {"frame": 1, "endpoints": ((120, 137), (184, 137)), "uncertaintyPx": 4},
        {"frame": 2, "endpoints": ((114, 173), (175, 173)), "uncertaintyPx": 5},
    ],
    "reload": [
        {"frame": 0, "endpoints": ((148, 77), (218, 77)), "uncertaintyPx": 3},
        {"frame": 2, "endpoints": ((106, 75), (176, 75)), "uncertaintyPx": 3},
        {"frame": 4, "endpoints": ((155, 47), (225, 47)), "uncertaintyPx": 3},
    ],
}


PLAYBACK = {
    "idle": {"fps": 6, "loop": True},
    "move": {"fps": 12, "loop": True},
    "attack": {"fps": 12, "loop": False},
    "death": {"fps": 10, "loop": False},
    "reload": {"fps": 10, "loop": False},
}


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def nominal_cells(size: tuple[int, int]) -> list[Cell]:
    width, height = size
    cells: list[Cell] = []
    for row in range(2):
        for column in range(4):
            x0 = round(column * width / 4)
            x1 = round((column + 1) * width / 4)
            y0 = round(row * height / 2)
            y1 = round((row + 1) * height / 2)
            cells.append(Cell(row * 4 + column, row, column, (x0, y0, x1, y1)))
    return cells


def is_generated_matte(rgb: tuple[int, int, int]) -> bool:
    red, green, blue = rgb
    return red > 190 and blue > 170 and green < 110 and abs(red - blue) < 100


def source_bounds(cell: Image.Image) -> tuple[int, int, int, int]:
    pixels = cell.convert("RGB").load()
    points: list[tuple[int, int]] = []
    for y in range(cell.height):
        for x in range(cell.width):
            if not is_generated_matte(pixels[x, y]):
                points.append((x, y))
    if not points:
        raise RuntimeError("No foreground detected")
    xs = [point[0] for point in points]
    ys = [point[1] for point in points]
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def matte_to_alpha(cell: Image.Image) -> Image.Image:
    rgba = cell.convert("RGBA")
    data = []
    for red, green, blue, _alpha in rgba.getdata():
        alpha = 0 if is_generated_matte((red, green, blue)) else 255
        data.append((red, green, blue, alpha))
    rgba.putdata(data)
    return rgba


def draw_cell_grid(draw: ImageDraw.ImageDraw, cell: Cell) -> None:
    x0, y0, x1, y1 = cell.box
    draw.rectangle((x0, y0, x1 - 1, y1 - 1), outline=(40, 235, 255, 230), width=2)


def render_anchor_review(
    clip: str,
    source: Image.Image,
    bounds: list[tuple[int, int, int, int]],
) -> Path:
    canvas = source.convert("RGBA")
    overlay = Image.new("RGBA", source.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for cell, review, bbox in zip(nominal_cells(source.size), ANCHORS[clip], bounds):
        draw_cell_grid(draw, cell)
        x0, y0, _x1, _y1 = cell.box
        bx0, by0, bx1, by1 = bbox
        draw.rectangle(
            (x0 + bx0, y0 + by0, x0 + bx1 - 1, y0 + by1 - 1),
            outline=(255, 217, 51, 245),
            width=2,
        )
        lx, ly = review["landmark"]
        ax, ay = review["anchor"]
        landmark = (x0 + lx, y0 + ly)
        anchor = (x0 + ax, y0 + ay)
        draw.line((landmark, anchor), fill=(50, 255, 220, 245), width=3)
        draw.ellipse((landmark[0] - 6, landmark[1] - 6, landmark[0] + 6, landmark[1] + 6), outline=(40, 240, 255, 255), width=3)
        draw.polygon(
            ((anchor[0], anchor[1] - 8), (anchor[0] + 8, anchor[1]), (anchor[0], anchor[1] + 8), (anchor[0] - 8, anchor[1])),
            fill=(80, 255, 100, 255),
            outline=(0, 50, 0, 255),
        )
        label = f"F{cell.frame + 1} L({lx},{ly}) A({ax},{ay}) +/-{review['uncertaintyPx']}"
        draw.rectangle((x0 + 4, y0 + 4, x0 + 224, y0 + 24), fill=(8, 12, 18, 220))
        draw.text((x0 + 8, y0 + 8), label, fill=(255, 255, 255, 255), font=FONT)
    output = HERE / f"{clip}-anchor-review.png"
    Image.alpha_composite(canvas, overlay).convert("RGB").save(output)
    return output


def render_scale_review(clip: str, source: Image.Image) -> Path:
    canvas = source.convert("RGBA")
    overlay = Image.new("RGBA", source.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    cells = nominal_cells(source.size)
    for cell in cells:
        draw_cell_grid(draw, cell)
    for measure in SCALE_MEASUREMENTS[clip]:
        cell = cells[measure["frame"]]
        x0, y0, _x1, _y1 = cell.box
        (lx0, ly0), (lx1, ly1) = measure["endpoints"]
        p0 = (x0 + lx0, y0 + ly0)
        p1 = (x0 + lx1, y0 + ly1)
        length = math.dist((lx0, ly0), (lx1, ly1))
        draw.line((p0, p1), fill=(255, 60, 230, 255), width=5)
        for point in (p0, p1):
            draw.ellipse((point[0] - 6, point[1] - 6, point[0] + 6, point[1] + 6), fill=(255, 240, 60, 255), outline=(40, 20, 20, 255), width=2)
        label = f"F{cell.frame + 1} cranial shell {length:.0f}px +/-{measure['uncertaintyPx']}"
        draw.rectangle((x0 + 4, y0 + 4, x0 + 220, y0 + 24), fill=(8, 12, 18, 220))
        draw.text((x0 + 8, y0 + 8), label, fill=(255, 255, 255, 255), font=FONT)
    output = HERE / f"{clip}-scale-review.png"
    Image.alpha_composite(canvas, overlay).convert("RGB").save(output)
    return output


def review_canvas(clip: str, frame: int) -> Image.Image:
    canvas = Image.new("RGBA", (560, 520), (17, 22, 28, 255))
    draw = ImageDraw.Draw(canvas)
    for y in range(0, canvas.height, 32):
        for x in range(0, canvas.width, 32):
            if (x // 32 + y // 32) % 2 == 0:
                draw.rectangle((x, y, x + 31, y + 31), fill=(23, 30, 38, 255))
    draw.text((12, 10), f"{PROFILE_ID} / {clip} / source pose {frame + 1} of 8", fill=(255, 255, 255, 255), font=FONT)
    return canvas


def render_playback(clip: str, source: Image.Image) -> Path:
    frames: list[Image.Image] = []
    target = (280, 470)
    for cell, review in zip(nominal_cells(source.size), ANCHORS[clip]):
        canvas = review_canvas(clip, cell.frame)
        sprite = matte_to_alpha(source.crop(cell.box))
        ax, ay = review["anchor"]
        canvas.paste(sprite, (target[0] - ax, target[1] - ay), sprite)
        draw = ImageDraw.Draw(canvas)
        draw.line((target[0] - 13, target[1], target[0] + 13, target[1]), fill=(80, 255, 100, 255), width=2)
        draw.line((target[0], target[1] - 13, target[0], target[1] + 13), fill=(80, 255, 100, 255), width=2)
        draw.text((12, 492), f"root=({ax},{ay}) | source scale unchanged", fill=(210, 230, 240, 255), font=FONT)
        frames.append(canvas.convert("P", palette=Image.Palette.ADAPTIVE))
    output = HERE / f"{clip}-anchor-playback.gif"
    save_args: dict[str, object] = {
        "save_all": True,
        "append_images": frames[1:],
        "duration": round(1000 / PLAYBACK[clip]["fps"]),
        "disposal": 2,
        "optimize": False,
    }
    if PLAYBACK[clip]["loop"]:
        save_args["loop"] = 0
    frames[0].save(output, **save_args)
    return output


def render_orientation_weapon_contact(sources: dict[str, Image.Image]) -> Path:
    tile_w, tile_h, left = 180, 190, 120
    canvas = Image.new("RGBA", (left + 8 * tile_w, len(CLIPS) * tile_h), (12, 17, 23, 255))
    draw = ImageDraw.Draw(canvas)
    scale = 0.34
    target = (tile_w // 2, 160)
    for row, clip in enumerate(CLIPS):
        draw.text((8, row * tile_h + 12), f"{clip}\n{PLAYBACK[clip]['fps']} fps\n{'loop' if PLAYBACK[clip]['loop'] else 'one-shot'}", fill=(255, 255, 255, 255), font=FONT)
        source = sources[clip]
        for cell, review in zip(nominal_cells(source.size), ANCHORS[clip]):
            tile_x, tile_y = left + cell.frame * tile_w, row * tile_h
            draw.rectangle((tile_x, tile_y, tile_x + tile_w - 1, tile_y + tile_h - 1), outline=(45, 78, 93, 255), width=1)
            sprite = matte_to_alpha(source.crop(cell.box))
            resized = sprite.resize((round(sprite.width * scale), round(sprite.height * scale)), Image.Resampling.LANCZOS)
            ax, ay = review["anchor"]
            px = tile_x + target[0] - round(ax * scale)
            py = tile_y + target[1] - round(ay * scale)
            canvas.paste(resized, (px, py), resized)
            root_x, root_y = tile_x + target[0], tile_y + target[1]
            draw.line((root_x - 6, root_y, root_x + 6, root_y), fill=(80, 255, 100, 255), width=1)
            draw.line((root_x, root_y - 6, root_x, root_y + 6), fill=(80, 255, 100, 255), width=1)
            draw.text((tile_x + 4, tile_y + 4), f"F{cell.frame + 1} RIGHT / WPN", fill=(255, 226, 85, 255), font=FONT)
    output = HERE / "orientation-weapon-anchor-contact.png"
    canvas.convert("RGB").save(output)
    return output


def main() -> None:
    sources: dict[str, Image.Image] = {}
    result: dict[str, object] = {
        "schema": 1,
        "profileId": PROFILE_ID,
        "coordinateSpace": "nominal-source-cell",
        "method": {
            "matte": "r>190 and b>170 and g<110 and abs(r-b)<100",
            "anchor": "reviewed pelvis centre projected to current physical support; y equals exclusive sourceBounds bottom",
            "scale": "three manually reviewed uninterrupted armored cranial-shell lateral intervals; right endpoint exclusive",
            "orientationProxy": "right source-bound extent from anchor strictly exceeds left extent",
        },
        "sources": {},
        "clips": {},
        "outputs": [],
    }
    for clip in CLIPS:
        source_path = SOURCE_DIR / f"{clip}.png"
        source = Image.open(source_path).convert("RGB")
        sources[clip] = source
        cells = nominal_cells(source.size)
        bounds = [source_bounds(source.crop(cell.box)) for cell in cells]
        pose_rows = []
        for cell, bbox, review in zip(cells, bounds, ANCHORS[clip]):
            bx0, by0, bx1, by1 = bbox
            lx, ly = review["landmark"]
            ax, ay = review["anchor"]
            left_extent = ax - bx0
            right_extent = bx1 - ax
            pose_rows.append({
                "frame": cell.frame,
                "sourceBounds": list(bbox),
                "landmark": [lx, ly],
                "anchor": [ax, ay],
                "uncertaintyPx": review["uncertaintyPx"],
                "anchorAtSupportBottom": ay == by1,
                "landmarkInsideForegroundBounds": bx0 <= lx < bx1 and by0 <= ly < by1,
                "leftExtentPx": left_extent,
                "rightExtentPx": right_extent,
                "rightwardDominant": right_extent > left_extent,
            })
        measures = []
        for measure in SCALE_MEASUREMENTS[clip]:
            p0, p1 = measure["endpoints"]
            measures.append({
                "frame": measure["frame"],
                "endpoints": [list(p0), list(p1)],
                "lengthPx": math.dist(p0, p1),
                "uncertaintyPx": measure["uncertaintyPx"],
            })
        result["sources"][clip] = {
            "path": str(source_path.relative_to(ROOT)).replace("\\", "/"),
            "sha256": file_sha256(source_path),
            "size": list(source.size),
            "mode": source.mode,
        }
        result["clips"][clip] = {
            "fps": PLAYBACK[clip]["fps"],
            "loop": PLAYBACK[clip]["loop"],
            "poses": pose_rows,
            "scaleMeasurements": measures,
            "scaleMedianPx": statistics.median(row["lengthPx"] for row in measures),
        }
        for output in (
            render_anchor_review(clip, source, bounds),
            render_scale_review(clip, source),
            render_playback(clip, source),
        ):
            result["outputs"].append(str(output.relative_to(ROOT)).replace("\\", "/"))
    baseline = result["clips"]["idle"]["scaleMedianPx"]
    for clip in CLIPS:
        median = result["clips"][clip]["scaleMedianPx"]
        result["clips"][clip]["sourceScaleRelativeToIdle"] = round(baseline / median, 6)
        result["clips"][clip]["observedRigidSizeVsIdlePercent"] = round((median / baseline - 1) * 100, 3)
    contact = render_orientation_weapon_contact(sources)
    result["outputs"].append(str(contact.relative_to(ROOT)).replace("\\", "/"))
    for relative in result["outputs"]:
        path = ROOT / relative
        with Image.open(path) as image:
            frames = getattr(image, "n_frames", 1)
            result.setdefault("outputValidation", []).append({
                "path": relative,
                "sha256": file_sha256(path),
                "bytes": path.stat().st_size,
                "size": list(image.size),
                "format": image.format,
                "frames": frames,
            })
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
