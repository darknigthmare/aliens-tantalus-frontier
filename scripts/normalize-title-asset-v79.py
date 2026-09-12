"""Normalize one generated title layer without overwriting its source receipt."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageOps


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--width", type=int, required=True)
    parser.add_argument("--height", type=int, required=True)
    parser.add_argument("--alpha", choices=("opaque", "transparent"), required=True)
    parser.add_argument("--padding", type=float, default=0.0)
    parser.add_argument(
        "--preserve-canvas",
        action="store_true",
        help="Resize the complete transparent canvas instead of cropping to the alpha bounds.",
    )
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def clear_hidden_rgb(image: Image.Image) -> Image.Image:
    red, green, blue, alpha = image.split()
    visible_mask = alpha.point(lambda value: 255 if value else 0)
    zero = Image.new("L", image.size, 0)
    return Image.merge(
        "RGBA",
        (
            Image.composite(red, zero, visible_mask),
            Image.composite(green, zero, visible_mask),
            Image.composite(blue, zero, visible_mask),
            alpha,
        ),
    )


def normalize_transparent(
    source: Image.Image,
    size: tuple[int, int],
    padding: float,
    preserve_canvas: bool = False,
) -> Image.Image:
    if not 0 <= padding < 0.25:
        raise ValueError("padding must be between 0 and 0.25")
    rgba = source.convert("RGBA")
    bounds = rgba.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError("transparent source has no visible pixels")
    subject = rgba if preserve_canvas else rgba.crop(bounds)
    margin_x = round(size[0] * padding)
    margin_y = round(size[1] * padding)
    available = (max(1, size[0] - margin_x * 2), max(1, size[1] - margin_y * 2))
    ratio = min(available[0] / subject.width, available[1] / subject.height)
    resized_size = (max(1, round(subject.width * ratio)), max(1, round(subject.height * ratio)))
    subject = subject.resize(resized_size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    origin = ((size[0] - subject.width) // 2, (size[1] - subject.height) // 2)
    canvas.alpha_composite(subject, origin)
    return clear_hidden_rgb(canvas)


def normalize_opaque(source: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(source.convert("RGB"), size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def main() -> None:
    args = parse_args()
    source = args.input.resolve()
    output = args.output.resolve()
    if source == output:
        raise SystemExit("Refusing to overwrite the generation receipt in place.")
    if not source.is_file():
        raise SystemExit(f"Input does not exist: {source}")
    if output.exists() and not args.force:
        raise SystemExit(f"Output exists; pass --force to replace the normalized derivative: {output}")
    if args.width < 1 or args.height < 1:
        raise SystemExit("Target dimensions must be positive.")

    with Image.open(source) as opened:
        source_mode = opened.mode
        source_size = opened.size
        if args.alpha == "transparent":
            result = normalize_transparent(
                opened,
                (args.width, args.height),
                args.padding,
                preserve_canvas=args.preserve_canvas,
            )
        else:
            result = normalize_opaque(opened, (args.width, args.height))

    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output, format="PNG", optimize=True)
    alpha = result.getchannel("A") if result.mode == "RGBA" else None
    print(json.dumps({
        "source": source.as_posix(),
        "sourceMode": source_mode,
        "sourceSize": list(source_size),
        "sourceSha256": file_hash(source),
        "output": output.as_posix(),
        "outputMode": result.mode,
        "outputSize": list(result.size),
        "outputSha256": file_hash(output),
        "alphaExtrema": list(alpha.getextrema()) if alpha else None,
        "alphaBounds": list(alpha.getbbox()) if alpha and alpha.getbbox() else None,
        "padding": args.padding,
        "preserveCanvas": args.preserve_canvas,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
