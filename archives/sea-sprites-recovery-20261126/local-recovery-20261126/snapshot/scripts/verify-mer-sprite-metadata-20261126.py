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


# Captured from the published manifest at 8cb25462b9b0328b09ae28b278356113d325c603.
# The digest pins every original id, SHA256 and byte length without requiring Git
# history to be present in a shallow CI checkout.
HISTORICAL_COUNT = 119
HISTORICAL_BYTES = 234227391
HISTORICAL_DIGEST = '5aaa154ce42483758ffc2693dd117938f3c50fd4f3b50d01c17c3c99d746ee7e'
NEW_PNGS = {
    'characters/decker-walk-a': {
        'sha256': '5346662681f590e25e53dbd75da3360c345284254942cea9f717c5095317987d',
        'sizeBytes': 1867661,
    },
    'characters/decker-walk-b': {
        'sha256': 'd5a1922de8ec49f2609a02c654ec0204df45b29c26d8107da813217d4d84625e',
        'sizeBytes': 1766518,
    },
}


# New Bible/art continuation; the original 119 digest and two first walk pins stay intact.
BIBLE_PNGS = {'characters/carlyle-medic': {'sha256': '6ba5f9b1efcc16949778360c9ea7b880b7f64e2477bca1301b4fa55462c19b37', 'sizeBytes': 1674214}, 'characters/decker-walk-pass-a': {'sha256': 'cc8353d4b6cbb9619975d8acbeac2f69cfc1baa0f04714b59428005ce908493a', 'sizeBytes': 1688012}, 'characters/decker-walk-pass-b': {'sha256': '47adb7f09bdb75e43b52f728d7474656214356a4edb097b5cf75d5699fc56b41', 'sizeBytes': 1678695}, 'characters/worker': {'sha256': '605c8efe996e3f5dc24f741996bb65ce590606a96b74cd00a55daf29cc0f370d', 'sizeBytes': 1631995}, 'props/medical-clipboard': {'sha256': 'a8fc11da01f96bad34d4cc139ea388481295a4d17fedba99cf1d04db29f436f6', 'sizeBytes': 2349154}, 'props/medicine-cup': {'sha256': '0589a49ba2f96187d362377dd5403b961046d0bcedb759f89d5d01de7278faa6', 'sizeBytes': 600962}, 'props/service-cart': {'sha256': '0358ae69fc22a88660d76993b8d61af04f9e8531b83c20d5dd26fa9405aa683a', 'sizeBytes': 1846044}, 'props/tripod-worklight': {'sha256': '32296e3e0cfb0d2446f1d0798954df918545050cf15e7598079be5827c143bd9', 'sizeBytes': 1469502}, 'props/weather-station': {'sha256': 'dccf7a7345ee51afd05661b5aa3a7a3249d3aacaba061cc1c0d4cecb91d17a27', 'sizeBytes': 1287257}, 'props/windsock': {'sha256': '2e9ec89ff395fa1f6a75552c8895893135431028290bfd3429fa64d92b08a946', 'sizeBytes': 1317966}, 'terrain/toxic-sand': {'sha256': '2bf2c6eca006031cbd7b9476d009191e69360d6c3d84f30c3cb41fa75d8ebbf2', 'sizeBytes': 973732}, 'vehicles/chicago-tram': {'sha256': '321cde54dfcc9b5038f9ef22c2f9a04aca4410def59b29bb3083822e0435cd19', 'sizeBytes': 1717942}}
BIBLE_BYTES = 18235475
BASELINE_121_DIGEST = '7eb9f37d39496f2508b98b5abd32c2b01ba42f7921a288363e81d65dde5fbd20'
BIBLE_PROMPT_SOURCE = 'docs/mer-des-chagrins-20261126/BIBLE_ART_PROMPTS.json'
WALK_IDS = tuple(NEW_PNGS) + ('characters/decker-walk-pass-a', 'characters/decker-walk-pass-b')


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
    receipt = json.loads((repo / BIBLE_PROMPT_SOURCE).read_text())
    prompt_rows = {row['assetId']: row for row in receipt['assets']}
    require(set(prompt_rows) == set(BIBLE_PNGS) and len(receipt['assets']) == 12, 'Bible prompt inventory differs')
    require(pack['version'] == 1, 'Unexpected coordinate contract')
    require(len(rows) == len(entries) == len(actual) == 133, 'Expected 133 individual PNG assets')
    require(pack['spriteCount'] == manifest['counts']['pngFiles'] == 133, 'Declared PNG counts differ')
    require(len({r['id'] for r in rows}) == len(rows), 'Duplicate asset identifiers')
    require({r['metadata']['src'] for r in rows} == set(actual), 'PNG inventory is not exact')
    require(manifest['canonicalOneToOneCertified'] is False, 'Unsupported canon certification')
    require(manifest['completeAnimationCycles'] is False, 'Unsupported animation completion')

    historical = [row for row in rows if row['id'] not in NEW_PNGS and row['id'] not in BIBLE_PNGS]
    records = ''.join(f"{row['id']}\t{row['sha256']}\t{row['sizeBytes']}\n"
                      for row in sorted(historical, key=lambda row: row['id'])).encode('utf-8')
    require(len(historical) == HISTORICAL_COUNT, 'Historical 119-asset inventory changed')
    require(sum(row['sizeBytes'] for row in historical) == HISTORICAL_BYTES, 'Historical PNG byte total changed')
    require(sha256(records).hexdigest() == HISTORICAL_DIGEST, 'Historical PNG hashes or identifiers changed')
    require(manifest['historicalIntegrity']['sha256'] == HISTORICAL_DIGEST, 'Historical digest declaration differs')
    by_id = {row['id']: row for row in rows}
    previous = [row for row in rows if row['id'] not in BIBLE_PNGS]
    previous_records = ''.join(f"{row['id']}\t{row['sha256']}\t{row['sizeBytes']}\n"
                               for row in sorted(previous, key=lambda row: row['id'])).encode('utf-8')
    require(len(previous) == 121 and sum(row['sizeBytes'] for row in previous) == 237861570,
            'Previous 121-PNG baseline changed')
    require(sha256(previous_records).hexdigest() == BASELINE_121_DIGEST, 'Previous 121-PNG identities or hashes changed')
    require(manifest['bibleContinuationIntegrity']['baselineInventorySha256'] == BASELINE_121_DIGEST,
            'Bible baseline declaration differs')
    for key, expected in {**NEW_PNGS, **BIBLE_PNGS}.items():
        require(key in by_id and all(by_id[key][field] == value for field, value in expected.items()),
                f'{key}: new source PNG hash or byte length changed')

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
        if key in NEW_PNGS:
            require(provenance.get('kind') == 'imagegen-new-source' and provenance.get('generator') == 'image_gen',
                    f'{key}: new generation must not be classified as recovered artwork')
            require(source_path == row['path'] and provenance.get('generatedOn') == '2026-11-26',
                    f'{key}: new source provenance differs')
            require(provenance.get('promptId') == key.split('/')[1] and
                    provenance.get('promptSource') == 'docs/mer-des-chagrins-20261126/CONTINUATION_PROMPTS.json' and
                    provenance.get('referenceSourcePath') == 'dlc/sea-of-sorrows-visual/sprites/characters/decker.png',
                    f'{key}: generation prompt/reference provenance missing')
        if key in BIBLE_PNGS:
            prompt = prompt_rows[key]
            require(provenance.get('kind') == 'imagegen-new-source' and provenance.get('generator') == 'image_gen',
                    f'{key}: Bible artwork must be classified as new generation')
            require(source_path == row['path'] and provenance.get('generatedOn') == '2026-11-26',
                    f'{key}: Bible source provenance differs')
            require(provenance.get('promptSource') == BIBLE_PROMPT_SOURCE and
                    provenance.get('promptId') == prompt['promptId'] == key.split('/')[1],
                    f'{key}: Bible prompt identity differs')
            require(prompt['path'] == row['path'] and prompt['sha256'] == digest and
                    prompt['sizeBytes'] == len(data) and prompt['dimensions'] == {'width': width, 'height': height},
                    f'{key}: Bible prompt/image receipt mismatch')
            require(provenance.get('promptSha256') == sha256(prompt['prompt'].encode('utf-8')).hexdigest(),
                    f'{key}: exact generation prompt differs')
            require(provenance.get('referenceSourcePaths') == [by_id[ident]['path'] for ident in prompt['referenceAssetIds']],
                    f'{key}: reference-image provenance differs')
            require(row.get('canonicalOneToOneCertified') is False, f'{key}: unsupported individual canon certification')
        require(source_path and (repo / source_path).is_file(), f'{key}: original source file missing')
        require((repo / source_path).read_bytes() == data, f'{key}: original PNG bytes were changed')

    require(len(hashes) == 133, 'Duplicate PNG content assigned to different assets')
    require(total == manifest['counts']['bytes'] == 256097045, 'Unexpected PNG byte total')
    require(manifest['counts']['recoveredOriginalPng'] == 110 and manifest['counts']['preservedNewPng'] == 9 and
            manifest['counts']['newContinuationPng'] == 2 and manifest['counts']['newBiblePng'] == 12,
            'Recovery and new-generation counts are conflated')
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
    require(sum(by_id[key]['sizeBytes'] for key in BIBLE_PNGS) == BIBLE_BYTES, 'Bible PNG byte total changed')
    for key in WALK_IDS:
        entry = entries[key]
        require(entry.get('unarmedOnly') is True and 'handAnchor' not in entry,
                f'{key}: walking pose must remain explicitly unarmed')
        require(entry['worldHeight'] == 110 and entry['facing'] == 'right' and 'lampAnchor' in entry,
                f'{key}: walking scale/orientation/lamp attachment differs')
        require(entry['pivot'][1] == by_id[key]['visibleBoundsAlpha8'][3], f'{key}: walking footprint not grounded')
    for key, names in {
        'equipment/lamp': ['mountAnchor', 'emitterAnchor'],
        'equipment/light-panel': ['onAnchor', 'offAnchor'],
        'equipment/shutter-control': ['statusAnchor'],
        'effects/acid': ['groundAnchor'],
        'effects/foam': ['groundAnchor'],
        'effects/impact': ['impactAnchor'],
        'effects/spark': ['impactAnchor'],
        'effects/flame': ['emissionAnchor'],
        'effects/muzzle': ['emissionAnchor'],
    }.items():
        require(all(name in entries[key] for name in names), f'{key}: presentation attachment missing')
    for key in ['effects/flame', 'effects/muzzle']:
        require(entries[key]['facing'] == 'right' and entries[key]['pivot'] == entries[key]['emissionAnchor'],
                f'{key}: directional source is not anchored at its emission tip')
    require(entries['equipment/lamp']['facing'] == 'right', 'Lamp lens orientation differs')
    require(entries['equipment/light-panel']['worldHeight'] == 39 and
            entries['equipment/shutter-control']['worldHeight'] == 27, 'Control enclosure scale differs')
    frame, panel = entries['doors/bulkhead-frame'], entries['doors/bulkhead-panel']
    aperture = frame.get('apertureBounds', [])
    require(len(aperture) == 4 and all(isinstance(v, int) for v in aperture), 'Door aperture bounds missing')
    ax, ay, aw, ah = aperture
    require(0 <= ax < frame['width'] and 0 <= ay < frame['height'] and
            0 < aw <= frame['width']-ax and 0 < ah <= frame['height']-ay, 'Door aperture is outside source canvas')
    polygon = frame.get('aperturePolygon', [])
    require(len(polygon) >= 3 and all(isinstance(p, list) and len(p) == 2 and
            all(isinstance(v, (int, float)) and math.isfinite(v) for v in p) and
            ax <= p[0] <= ax+aw and ay <= p[1] <= ay+ah for p in polygon), 'Door aperture polygon differs')
    require(panel.get('canvasMatch') == 'bulkhead-frame' and
            (frame['width'], frame['height']) == (panel['width'], panel['height']), 'Door panel/frame source canvases differ')
    return {'verifiedPngFiles': len(rows), 'verifiedBytes': total, 'uniquePngHashes': len(hashes),
            'historicalPngFilesUnchanged': HISTORICAL_COUNT, 'historicalInventorySha256': HISTORICAL_DIGEST,
            'newSourcePngFiles': len(NEW_PNGS) + len(BIBLE_PNGS),
            'firstContinuationPngFiles': len(NEW_PNGS), 'bibleContinuationPngFiles': len(BIBLE_PNGS),
            'previous121InventorySha256': BASELINE_121_DIGEST,
            'categories': manifest['counts']['categories'], 'browserGameplayCertified': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    print(json.dumps(verify(args.repo.resolve()), ensure_ascii=False, indent=2))
