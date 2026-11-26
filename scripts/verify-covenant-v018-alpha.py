#!/usr/bin/env python3
"""Measure native PNGs without changing or saving image pixels."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'assets/openai/sprites/alien-covenant-v018/manifest.json').read_text())
rows = manifest['assets'] + manifest['documentaryCandidates']
for row in rows:
    path = ROOT / row['path']
    raw = path.read_bytes()
    assert len(raw) == row['bytes']
    assert hashlib.sha256(raw).hexdigest() == row['sha256']
    with Image.open(path) as image:
        assert image.format == 'PNG' and image.mode == 'RGBA'
        assert image.size == (row['width'], row['height'])
        alpha = image.getchannel('A')
        expected = row['alphaQA']
        assert list(alpha.getextrema()) == expected['alphaExtrema'] == [0, 255]
        assert alpha.histogram()[0] == expected['alphaZeroPixels']
        bounds = alpha.point(lambda n: 255 if n >= 32 else 0).getbbox()
        assert list(bounds) == expected['bboxAlphaGe32']
        ratio = (bounds[2] - bounds[0]) / (bounds[3] - bounds[1])
        assert abs(ratio - expected['visibleAspectRatio']) < 1e-12
        edges = [alpha.getpixel((x, y)) for y in (0, image.height - 1) for x in range(image.width)]
        edges += [alpha.getpixel((x, y)) for x in (0, image.width - 1) for y in range(image.height)]
        assert max(edges) == expected['edgeAlphaMaximum']
        assert sum(n > 16 for n in edges) == expected['edgeAlphaAbove16'] == 0
        probe = row['visualReview'].get('passageProbe', row['visualReview'].get('closedCenterProbe'))
        assert alpha.getpixel(tuple(probe['pixel'])) == probe['alpha']
        assert probe['alpha'] == (0 if row['productionSelected'] else 253)
    assert path.read_bytes() == raw
print(json.dumps({'ok': True, 'nativeRgbaPngsMeasured': len(rows), 'pixelWrites': 0,
                  'transparentPassageVerified': True, 'closedCandidateCenterAlpha': 253,
                  'originalBytesUnchanged': True, 'edgePixelsAbove16': 0}))
