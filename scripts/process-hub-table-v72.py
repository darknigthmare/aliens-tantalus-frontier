"""Package the authored OpenAI orthographic table; never generate/redraw art.

Uses the existing V66 border-connected chroma extractor, preserves every
foreground pixel, adds its existing three-pixel guard and saves lossless WebP.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/openai/sprites/frames/v72/props/operations-table-side-v72-source.png'
OUTPUT = ROOT / 'assets/openai/hub/props/operations-table-side-v72.webp'
REPORT = ROOT / 'assets/openai/hub/props/operations-table-side-v72-report.json'
SOURCE_SHA256 = 'e82aa014e331c4e81a02256b9642d21f726ab58013e5b28d65e36ac051230c03'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    source_bytes = SOURCE.read_bytes()
    if hashlib.sha256(source_bytes).hexdigest() != SOURCE_SHA256:
        raise ValueError('The reviewed OpenAI source changed; review it before processing.')
    spec = importlib.util.spec_from_file_location('hub_table_v66_pipeline', Path(__file__).with_name('process-v66-enemy-batch.py'))
    pipeline = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = pipeline
    spec.loader.exec_module(pipeline)
    source = Image.open(io.BytesIO(source_bytes))
    # Inspection identified magenta matte inside the two closed rail handles.
    # Reuse the existing strict exterior-color match and its bounded AA fringe.
    matte_proof = pipeline.source_matte_proof(source, True, True)
    image, extraction = pipeline.extract_cell(source, (0, 0, source.width, source.height), False, True, None, True)
    pixels = np.array(image)
    pixels, spill = pipeline.apply_magenta_spill_removal(pixels, extraction['alphaProcessing'])
    # The source has binary keyed alpha, so the inherited partial-alpha-only
    # cleanup cannot cover its dark rail-handle fringe. Restrict the same
    # magenta excess neutralization to two pixels beside proven transparency.
    adjacent = pixels[..., 3] == 0
    for _ in range(2):
        padded = np.pad(adjacent, 1)
        adjacent = np.logical_or.reduce([padded[dy:dy + pixels.shape[0], dx:dx + pixels.shape[1]] for dy in range(3) for dx in range(3)])
    rgb = pixels[..., :3].astype(np.int16)
    red, green, blue = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    edge_spill = adjacent & (pixels[..., 3] > 0) & (np.minimum(red, blue) - green > 20) & (np.abs(red - blue) < 40)
    for channel in (0, 2):
        pixels[..., channel] = np.where(edge_spill, np.minimum(rgb[..., channel], green + 8), rgb[..., channel]).astype(np.uint8)
    edge_spill_count = int(edge_spill.sum())
    image = Image.fromarray(pixels, 'RGBA')
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP', lossless=True, exact=True, method=6)
    output_bytes = buffer.getvalue()
    alpha = pixels[..., 3]
    bounds = list(image.getchannel('A').getbbox())
    hidden = int(((alpha == 0) & (pixels[..., :3].max(axis=2) > 0)).sum())
    if hidden or int(pipeline.strict_magenta_spill_mask(pixels).sum()):
        raise ValueError('Output retains chroma or hidden RGB.')
    report = {
        'schema': 72, 'provider': 'OpenAI ImageGen', 'originalProjectAsset': True, 'canonExact': False,
        'source': SOURCE.relative_to(ROOT).as_posix(), 'sourceSha256': SOURCE_SHA256,
        'sourceDimensions': list(source.size), 'output': OUTPUT.relative_to(ROOT).as_posix(),
        'outputSha256': hashlib.sha256(output_bytes).hexdigest(), 'dimensions': list(image.size),
        'contentBounds': bounds, 'extraction': extraction, 'enclosedMatte': matte_proof, 'magentaSpill': spill,
        'edgeSpill': {'neutralizedPixels': edge_spill_count, 'maximumRadiusFromTransparency': 2, 'alphaChangedPixels': 0},
        'transparentPixels': int((alpha == 0).sum()), 'occupiedPixels': int((alpha > 0).sum()),
        'hiddenRgbPixels': hidden, 'opaqueWhitePixels': int(((alpha > 240) & (pixels[..., :3].min(axis=2) > 235)).sum()),
        'guardPixels': 3, 'rescaled': False, 'inpaintedPixels': 0,
        'projection': 'orthographic-front-elevation', 'visualReview': 'pending-runtime-review'
    }
    if args.check:
        if OUTPUT.read_bytes() != output_bytes or json.loads(REPORT.read_text(encoding='utf-8')) != report:
            raise ValueError('Output/report differs from deterministic reviewed-source packaging.')
    else:
        OUTPUT.write_bytes(output_bytes)
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
