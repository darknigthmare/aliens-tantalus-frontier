"""Normalize and verify the original OpenAI Proving Ground V81 assets.

The ImageGen masters remain untouched under docs/references. Runtime atlases
are deterministic RGBA PNGs with fixed cells, clean transparent RGB and hashes.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "docs/references/v81-proving-ground-art/source-receipts"
OUTPUT_ROOT = ROOT / "assets/openai/hub/proving-ground/v81"
REPORT_PATH = ROOT / "docs/references/v81-proving-ground-art/art-audit.json"

SOURCES = {
    "target": "exec-dd0ed932-9f0f-4a49-be62-b6540c9e483b.png",
    "impact": "exec-659f1605-c7fb-4226-868f-13343802a819.png",
    "console": "exec-02a8be9a-c609-4dde-932f-c1ed58a4d1b0.png",
}
OUTPUTS = {
    "target": "proving-ground-target-cycle-v81.png",
    "impact": "proving-ground-impact-cycle-v81.png",
    "console": "proving-ground-range-console-v81.png",
}
SOURCE_HASHES = {
    "target": "5f42d5829c4c4e0b7cbe2a120a9f58893570a768c11069a5920428c5e2a69e27",
    "impact": "b80f60efc17135420a498918319fb25de320e3262f549079ad91524a06034cda",
    "console": "25fa5d64af26481c2f89984fecde1ac49a0a0280cdca05159b1f4b92eed1ec14",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def clean_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha <= 2:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def split_edges(length: int, parts: int) -> list[int]:
    return [round(index * length / parts) for index in range(parts + 1)]


def normalize_atlas(source: Image.Image, *, kind: str) -> Image.Image:
    x_edges = split_edges(source.width, 4)
    y_edges = split_edges(source.height, 2)
    atlas = Image.new("RGBA", (2048, 1024), (0, 0, 0, 0))
    for row in range(2):
        for column in range(4):
            cell = clean_alpha(source.crop((x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])))
            if kind == "target":
                ratio = min(448 / cell.width, 448 / cell.height)
                size = (max(1, round(cell.width * ratio)), max(1, round(cell.height * ratio)))
            else:
                size = (448, 448)
            resized = cell.resize(size, Image.Resampling.LANCZOS)
            x = column * 512 + (512 - resized.width) // 2
            y = row * 512 + (512 - resized.height) // 2
            atlas.alpha_composite(resized, (x, y))
    return clean_alpha(atlas)


def normalize_console(source: Image.Image) -> Image.Image:
    cleaned = clean_alpha(source)
    bbox = cleaned.getchannel("A").point(lambda value: 255 if value > 2 else 0).getbbox()
    if not bbox:
        raise ValueError("Console master has no visible pixels")
    crop = cleaned.crop((max(0, bbox[0] - 8), max(0, bbox[1] - 8), min(cleaned.width, bbox[2] + 8), min(cleaned.height, bbox[3] + 8)))
    ratio = min(900 / crop.width, 936 / crop.height)
    resized = crop.resize((round(crop.width * ratio), round(crop.height * ratio)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((1024 - resized.width) // 2, 1000 - resized.height))
    return clean_alpha(canvas)


def metrics(image: Image.Image) -> dict[str, Any]:
    rgba = image.convert("RGBA")
    histogram = rgba.getchannel("A").histogram()
    hidden = sum(1 for red, green, blue, alpha in rgba.get_flattened_data() if alpha == 0 and (red or green or blue))
    return {
        "mode": rgba.mode,
        "dimensions": list(rgba.size),
        "transparentPixels": histogram[0],
        "partialAlphaPixels": sum(histogram[1:255]),
        "opaquePixels": histogram[255],
        "visibleRatio": round((rgba.width * rgba.height - histogram[0]) / (rgba.width * rgba.height), 6),
        "contentBounds": list(rgba.getchannel("A").getbbox() or ()),
        "hiddenRgbPixels": hidden,
    }


def build() -> dict[str, Any]:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    records = []
    for kind, filename in SOURCES.items():
        source_path = SOURCE_ROOT / filename
        if sha256(source_path) != SOURCE_HASHES[kind]:
            raise ValueError(f"Source drift: {relative(source_path)}")
        with Image.open(source_path) as source:
            source.load()
            if source.format != "PNG" or source.mode != "RGBA":
                raise ValueError(f"Invalid ImageGen master: {source_path}")
            output = normalize_console(source) if kind == "console" else normalize_atlas(source, kind=kind)
            source_size = list(source.size)
        output_path = OUTPUT_ROOT / OUTPUTS[kind]
        output.save(output_path, format="PNG", optimize=True)
        records.append({
            "id": f"proving-ground-{kind}-v81",
            "kind": kind,
            "source": relative(source_path),
            "sourceSha256": SOURCE_HASHES[kind],
            "sourceDimensions": source_size,
            "output": relative(output_path),
            "outputSha256": sha256(output_path),
            "metrics": metrics(output),
        })
    report = {
        "schema": 81,
        "contractId": "proving-ground-original-art-v81",
        "provider": "OpenAI ImageGen",
        "toolMode": "built-in",
        "rightsPolicy": "original-ai-generated-no-official-copy",
        "canonExact": False,
        "perspective": "strict-side-on-orthographic",
        "marineReferenceHeightPx": 92,
        "assets": records,
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def check() -> dict[str, Any]:
    if not REPORT_PATH.is_file():
        raise FileNotFoundError(REPORT_PATH)
    report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
    if report.get("schema") != 81 or report.get("canonExact") is not False:
        raise ValueError("Invalid V81 art contract")
    if report.get("rightsPolicy") != "original-ai-generated-no-official-copy":
        raise ValueError("Rights policy drift")
    for record in report.get("assets", []):
        source = ROOT / record["source"]
        output = ROOT / record["output"]
        if sha256(source) != record["sourceSha256"] or sha256(output) != record["outputSha256"]:
            raise ValueError(f"Hash drift: {record['id']}")
        with Image.open(output) as image:
            image.load()
            current = metrics(image)
        if current != record["metrics"] or current["hiddenRgbPixels"] != 0:
            raise ValueError(f"Alpha or geometry drift: {record['id']}")
        expected = [1024, 1024] if record["kind"] == "console" else [2048, 1024]
        if current["dimensions"] != expected or current["mode"] != "RGBA":
            raise ValueError(f"Unexpected runtime image: {record['id']}")
    if len(report.get("assets", [])) != 3:
        raise ValueError("Expected exactly three V81 assets")
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    report = check() if args.check else build()
    print(f"V81 Proving Ground art verified: {len(report['assets'])} assets")


if __name__ == "__main__":
    main()
