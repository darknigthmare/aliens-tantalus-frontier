#!/usr/bin/env python3
"""Verify unchanged PNG bytes and the reconstructed source-pixel placement data.

Requires Pillow. This checks the art metadata, not browser gameplay or canon.
"""
from collections import Counter
from hashlib import sha1, sha256
from pathlib import Path
import argparse
import json
import math
import re
import struct

from PIL import Image


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def verify(repo):
    base = repo / 'dlc/sea-of-sorrows-visual'
    manifest = json.loads((base / 'SPRITE_MANIFEST.json').read_text())
    source = (base / 'src/art-pack.js').read_text()
    match = re.search(r'root\.SoSArtPack = (\{.*\});\s*\}\)\(globalThis\);', source, re.S)
    require(match is not None, 'Cannot locate the JSON art registry')
    pack = json.loads(match.group(1))
    actual = {p.relative_to(base).as_posix(): p for p in (base / 'sprites').rglob('*.png')}
    entries = {f'{category}/{ident}': entry for category, group in pack['assets'].items() for ident, entry in group.items()}
    rows = manifest['assets']
    require(pack['version'] == 1, 'Unexpected coordinate contract')
    require(len(rows) == len(entries) == len(actual) == 119, 'Expected 119 individual PNG assets')
    require(len({r['id'] for r in rows}) == len(rows), 'Duplicate asset identifiers')
    require({r['metadata']['src'] for r in rows} == set(actual), 'PNG inventory is not exact')
    require(manifest['canonicalOneToOneCertified'] is False, 'Unsupported canon certification')
    require(manifest['completeAnimationCycles'] is False, 'Unsupported animation completion')

    total = 0
    hashes = set()
    for row in rows:
        key = row['id']
        entry = entries[key]
        require(row['metadata'] == entry, f'{key}: manifest/registry mismatch')
        rel = Path(entry['src'])
        require(not rel.is_absolute() and '..' not in rel.parts and rel.parts[0] == 'sprites', f'{key}: unsafe source path')
        data = actual[entry['src']].read_bytes()
        digest = sha256(data).hexdigest()
        require(digest == row['sha256'], f'{key}: SHA256 differs')
        require(sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest() == row['gitBlobSha'], f'{key}: Git blob SHA differs')
        require(len(data) == row['sizeBytes'], f'{key}: byte length differs')
        require(data[:8] == b'\x89PNG\r\n\x1a\n', f'{key}: invalid PNG signature')
        width, height, depth, color = struct.unpack('>IIBB', data[16:26])
        require((depth, color) == (8, 6), f'{key}: expected RGBA8 PNG')
        require((width, height) == (entry['width'], entry['height']), f'{key}: dimensions differ')
        hashes.add(digest)
        total += len(data)
        with Image.open(actual[entry['src']]) as im:
            im.load()
            require(im.mode == 'RGBA', f'{key}: expected RGBA pixels')
            alpha = im.getchannel('A')
            hist = alpha.histogram()
            require(hist[0] == row['transparentPixelCount'] and hist[0] > 0, f'{key}: transparency changed')
            require(sum(hist[8:]) == row['visiblePixelCountAlpha8'] and sum(hist[8:]) > 0, f'{key}: visible pixels changed')
            require(list(alpha.getbbox()) == row['alphaBounds'], f'{key}: alpha bounds differ')
            bounds = alpha.point(lambda v: 255 if v >= 8 else 0).getbbox()
            require(list(bounds) == row['visibleBoundsAlpha8'], f'{key}: visible bounds differ')
        x, y, w, h = entry['crop']
        require(all(isinstance(n, int) for n in [x, y, w, h]), f'{key}: crop is not in integer pixels')
        require(0 <= x < width and 0 <= y < height and 0 < w <= width-x and 0 < h <= height-y, f'{key}: crop outside image')
        require(x <= bounds[0] and y <= bounds[1] and x+w >= bounds[2] and y+h >= bounds[3], f'{key}: crop clips visible pixels')
        require(entry['facing'] in ['left', 'right', 'none'], f'{key}: invalid facing')
        require(math.isfinite(entry['worldHeight']) and 0 < entry['worldHeight'] <= 2000, f'{key}: invalid world scale')
        for name, value in entry.items():
            if name == 'pivot' or name.endswith('Anchor'):
                require(isinstance(value, list) and len(value) == 2, f'{key}: invalid {name}')
                px, py = value
                require(all(isinstance(n, (int, float)) and math.isfinite(n) for n in value), f'{key}: nonfinite {name}')
                require(0 <= px <= width and 0 <= py <= height, f'{key}: {name} is not a source pixel coordinate')
        provenance = row['provenance']
        source_path = provenance.get('restoredSourcePath', provenance.get('sourcePath'))
        require(source_path and (repo / source_path).is_file(), f'{key}: original source file missing')
        require((repo / source_path).read_bytes() == data, f'{key}: original PNG bytes were changed')

    require(len(hashes) == 119, 'Duplicate PNG content assigned to different assets')
    require(total == manifest['counts']['bytes'] == 234227391, 'Unexpected PNG byte total')
    require(dict(sorted(Counter(key.split('/')[0] for key in entries).items())) == manifest['counts']['categories'], 'Category inventory differs')
    for key in ['characters/decker-ready', 'characters/decker-crouch-ready', 'characters/decker-dodge-ready', 'characters/manning-ready']:
        require('handAnchor' in entries[key], f'{key}: primary grip attachment missing')
    for key in ['characters/decker', 'characters/decker-ready', 'characters/decker-crouch', 'characters/decker-crouch-ready', 'characters/decker-dodge', 'characters/decker-dodge-ready']:
        require('lampAnchor' in entries[key], f'{key}: lamp attachment missing')
    for key in ['weapons/pistol', 'weapons/pulse', 'weapons/foam']:
        require('gripAnchor' in entries[key], f'{key}: weapon grip missing')
    for key in ['stretchers/adams', 'stretchers/elway']:
        require(entries[key]['facing'] == 'none' and 'faceAnchor' in entries[key], f'{key}: invalid patient orientation/attachment')
    require(entries['parasites/normal']['worldHeight'] == 25, 'Normal parasite scale changed')
    require(entries['parasites/royal']['worldHeight'] == 31.75, 'Royal parasite scale changed')
    return {'verifiedPngFiles': len(rows), 'verifiedBytes': total, 'uniquePngHashes': len(hashes), 'categories': manifest['counts']['categories'], 'browserGameplayCertified': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    print(json.dumps(verify(args.repo.resolve()), ensure_ascii=False, indent=2))
