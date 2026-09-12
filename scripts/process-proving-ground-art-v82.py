"""Deterministic packaging of the two original OpenAI Proving Ground V82 layers.

No generated artwork is painted, recoloured or background-extracted here.
Masters stay byte-identical; only proportional resize, alpha-bounds crop and
transparent RGB sanitation are permitted. Existing different outputs are refused.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path

import PIL
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "docs/references/v82-proving-ground-art/source-receipts"
OUTPUT_ROOT = ROOT / "assets/openai/hub/proving-ground/v82"
REPORT_PATH = ROOT / "docs/references/v82-proving-ground-art/art-audit.json"
RECIPES = {
    "wall": {
        "source": "exec-5a4477ce-afa1-41fe-ab1b-1e05f088712c.png",
        "sha256": "f91a095a53e411709c8e52d6c22b7f010b34f714f0212d90970b045b12ced016",
        "size": (2048, 768),
        "mode": "RGB",
        "output": "proving-ground-wall-v82.webp",
    },
    "ceiling-beam": {
        "source": "exec-af3b58c0-eedc-4d23-b894-421aff748bc6.png",
        "sha256": "1475549b84483468f952b549a1c29e551598700e4d2cd6f9b2308329ddc985bb",
        "size": (2172, 724),
        "mode": "RGBA",
        "output": "proving-ground-ceiling-beam-v82.png",
    },
}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def clean_hidden_rgb(image: Image.Image) -> Image.Image:
    """Keep every alpha value and every visible RGB value unchanged."""
    rgba = image.convert("RGBA")
    data = bytearray(rgba.tobytes())
    for index in range(0, len(data), 4):
        if data[index + 3] == 0:
            data[index:index + 3] = b"\0\0\0"
    return Image.frombytes("RGBA", rgba.size, bytes(data))


def metrics(image: Image.Image) -> dict:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    histogram = rgba.getchannel("A").histogram()
    border_size = max(1, min(8, min(width, height) // 100))
    hidden_rgb = near_white = border_white = border_count = border_opaque = 0
    for index, (red, green, blue, alpha) in enumerate(rgba.get_flattened_data()):
        hidden_rgb += alpha == 0 and bool(red or green or blue)
        white = alpha >= 250 and min(red, green, blue) >= 245
        near_white += white
        x, y = index % width, index // width
        if x < border_size or y < border_size or x >= width - border_size or y >= height - border_size:
            border_count += 1
            border_white += white
            border_opaque += alpha >= 250
    alpha = rgba.getchannel("A")
    return {
        "mode": image.mode,
        "dimensions": [width, height],
        "alphaMin": min(index for index, count in enumerate(histogram) if count),
        "alphaMax": max(index for index, count in enumerate(histogram) if count),
        "transparentPixels": histogram[0],
        "partialAlphaPixels": sum(histogram[1:255]),
        "opaquePixels": histogram[255],
        "contentBounds": list(alpha.getbbox() or []),
        "solidBounds": list(alpha.point(lambda value: 255 if value >= 128 else 0).getbbox() or []),
        "hiddenRgbPixels": hidden_rgb,
        "nearWhiteOpaquePixels": near_white,
        "nearWhiteOpaqueRatio": round(near_white / (width * height), 8),
        "borderPixels": border_count,
        "opaqueBorderPixels": border_opaque,
        "opaqueNearWhiteBorderPixels": border_white,
    }


def normalize(source: Image.Image, kind: str) -> tuple[Image.Image, dict]:
    if kind == "wall":
        if source.size != (2048, 768) or source.mode != "RGB":
            raise ValueError("Wall master must be RGB 2048x768")
        crop = (0, 0, source.width, source.height)
        output = source.resize((1920, 720), Image.Resampling.LANCZOS)
        pivot = {"role": "background-top-left", "pixels": [0, 0], "normalized": [0, 0]}
    elif kind == "ceiling-beam":
        if source.mode != "RGBA":
            raise ValueError("Ceiling beam requires generated transparency")
        source = clean_hidden_rgb(source)
        bounds = source.getchannel("A").getbbox()
        if not bounds:
            raise ValueError("Ceiling beam master is empty")
        crop = (max(0, bounds[0] - 8), max(0, bounds[1] - 8),
                min(source.width, bounds[2] + 8), min(source.height, bounds[3] + 8))
        image = source.crop(crop)
        scale = min(1.0, 1536 / image.width)
        output = clean_hidden_rgb(image.resize(
            (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
            Image.Resampling.LANCZOS))
        solid = output.getchannel("A").point(lambda value: 255 if value >= 128 else 0).getbbox()
        pivot_x, pivot_y = output.width / 2, solid[1] if solid else 0
        pivot = {"role": "ceiling-mount-top-center", "pixels": [pivot_x, pivot_y],
                 "normalized": [round(pivot_x / output.width, 8), round(pivot_y / output.height, 8)]}
    else:
        raise ValueError(f"Unknown asset kind: {kind}")
    return output, {
        "sourceCropBounds": list(crop),
        "cropPaddingPx": 8 if kind == "ceiling-beam" else 0,
        "resampler": "Pillow LANCZOS",
        "preserveAspectRatio": True,
        "sourceCropDimensions": [crop[2] - crop[0], crop[3] - crop[1]],
        "pivot": pivot,
    }


def validate_output(image: Image.Image, kind: str) -> dict:
    stats = metrics(image)
    if stats["hiddenRgbPixels"]:
        raise ValueError(f"Hidden RGB parasite: {kind}")
    if stats["opaqueNearWhiteBorderPixels"] or stats["nearWhiteOpaqueRatio"] > 0.02:
        raise ValueError(f"Opaque white background/border parasite: {kind}")
    if kind == "wall":
        if image.mode != "RGB" or image.size != (1920, 720) or stats["alphaMin"] != 255:
            raise ValueError("Wall must be an opaque 1920x720 background")
    else:
        if image.mode != "RGBA" or image.width > 1536 or stats["alphaMin"] != 0 or stats["alphaMax"] != 255:
            raise ValueError("Beam must be a bounded independent RGBA layer")
        if stats["transparentPixels"] < image.width * image.height * 0.04:
            raise ValueError("Ceiling beam lost its cutout transparency")
    return stats


def encode(image: Image.Image, kind: str) -> bytes:
    buffer = io.BytesIO()
    if kind == "wall":
        image.save(buffer, format="WEBP", lossless=True, method=6, exact=True)
    else:
        image.save(buffer, format="PNG", optimize=True, compress_level=9)
    return buffer.getvalue()


def prepare() -> tuple[dict, dict[Path, bytes]]:
    records, files = [], {}
    for kind, recipe in RECIPES.items():
        source_path = SOURCE_ROOT / recipe["source"]
        source_bytes = source_path.read_bytes()
        if digest(source_bytes) != recipe["sha256"]:
            raise ValueError(f"Immutable master hash mismatch: {relative(source_path)}")
        with Image.open(io.BytesIO(source_bytes)) as source:
            source.load()
            if source.format != "PNG" or source.mode != recipe["mode"] or source.size != recipe["size"]:
                raise ValueError(f"Unexpected master format: {kind}")
            output, transform = normalize(source, kind)
            source_stats = metrics(source)
        output_bytes = encode(output, kind)
        # Audit the encoded file rather than assuming encoding preserved the raster.
        with Image.open(io.BytesIO(output_bytes)) as decoded:
            decoded.load()
            output_stats = validate_output(decoded, kind)
            if decoded.mode != output.mode or decoded.size != output.size or decoded.tobytes() != output.tobytes():
                raise ValueError(f"Lossless packaging changed pixels: {kind}")
        output_path = OUTPUT_ROOT / recipe["output"]
        files[output_path] = output_bytes
        records.append({
            "id": f"proving-ground-{kind}-v82",
            "kind": kind,
            "source": relative(source_path),
            "sourceSha256": recipe["sha256"],
            "sourceMetrics": source_stats,
            "receiptId": Path(recipe["source"]).stem,
            "output": relative(output_path),
            "outputSha256": digest(output_bytes),
            "outputBytes": len(output_bytes),
            "transform": transform,
            "metrics": output_stats,
            "alphaPolicy": "opaque" if kind == "wall" else "generated-alpha-preserved",
            "qa": {"losslessPixels": True, "whiteBackgroundParasite": False, "hiddenRgbParasite": False},
        })
    report = {
        "schema": 82,
        "contractId": "proving-ground-independent-layers-v82",
        "provider": "OpenAI ImageGen",
        "toolMode": "built-in",
        "rightsPolicy": "original-ai-generated-no-official-copy",
        "canonExact": False,
        "perspective": "strict-side-on-orthographic",
        "normalizationPolicy": "crop-resize-lossless-packaging-only; alpha retained; RGB cleared only at alpha=0",
        "pillowVersion": PIL.__version__,
        "assets": records,
    }
    files[REPORT_PATH] = (json.dumps(report, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    return report, files


def build() -> dict:
    report, files = prepare()
    # Complete preflight before writing anything; never replace someone else's file.
    for path, data in files.items():
        if path.exists() and path.read_bytes() != data:
            raise FileExistsError(f"Refusing to overwrite different existing output: {relative(path)}")
    for path, data in files.items():
        if not path.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open("xb") as destination:
                destination.write(data)
    return report


def check() -> dict:
    report, files = prepare()
    for path, expected in files.items():
        if not path.is_file() or path.read_bytes() != expected:
            raise ValueError(f"Deterministic artifact drift: {relative(path)}")
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify sources, regenerated bytes and decoded pixels; write nothing")
    args = parser.parse_args()
    report = check() if args.check else build()
    print(f"V82 Proving Ground art verified: {len(report['assets'])} assets")
    for asset in report["assets"]:
        print(f"{asset['id']}: {asset['metrics']['dimensions']} pivot={asset['transform']['pivot']['pixels']} sha256={asset['outputSha256']}")


if __name__ == "__main__":
    main()
