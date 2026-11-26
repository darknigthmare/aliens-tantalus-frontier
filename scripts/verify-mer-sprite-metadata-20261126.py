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
WALK_PNGS = {
    'characters/decker-walk-a': {
        'sha256': '5346662681f590e25e53dbd75da3360c345284254942cea9f717c5095317987d',
        'sizeBytes': 1867661,
    },
    'characters/decker-walk-b': {
        'sha256': 'd5a1922de8ec49f2609a02c654ec0204df45b29c26d8107da813217d4d84625e',
        'sizeBytes': 1766518,
    },
}
COMPLETION_PNGS = {
    "creatures/queen": {
        "sha256": "0f882eff7928bcd130d09676e3117616656de7dc9c8e401c85b2ded8857f6251",
        "sizeBytes": 2208282
    },
    "weapons/flame": {
        "sha256": "81166877f76721c6316f0eeeeca2cbf5b0f87f8741c7002db241aa3444075f97",
        "sizeBytes": 1558386
    },
    "characters/carlyle-physician": {
        "sha256": "a357b23a4509b913f8467f7efd98815c64b4b5b58f8b9851b94f60c325ec52f7",
        "sizeBytes": 1560708
    },
    "characters/decker-medical-gown": {
        "sha256": "b2b55de00f85e0bc2df551e88ec3dbe3fa64782f10516771689a261b6a3476d4",
        "sizeBytes": 1516131
    },
    "objectives/icc-handheld": {
        "sha256": "f659a2c161942a3eaf7704dc41fc24f6d67b1d08bf9a071e3187302a672683c4",
        "sizeBytes": 1773875
    }
}
STATE_PNGS = {
    "characters/decker-focus": {
        "sha256": "8659b23dbb7ecc99dc9dfd1937b1020c5b38a95482c268be8461977451151f6f",
        "sizeBytes": 1725805
    },
    "characters/decker-medical-report": {
        "sha256": "004e6ca5b3208f83d97c1641c537fb6ea80a6ffeefb8d1b5431cb44a22d9647d",
        "sizeBytes": 1562846
    },
    "characters/decker-walk-pass-a": {
        "sha256": "ad724f2c102a874976a4ac90ff15ae9bdf1f6feecee713335a76e1cf7492c4a0",
        "sizeBytes": 1696702
    },
    "characters/decker-walk-pass-b": {
        "sha256": "67a33165abeb8bb8ee8bcdff148ab3ecf19872c455e5d24556022bff57b503ac",
        "sizeBytes": 1726714
    },
    "decor/medical-chart": {
        "sha256": "97ebe16bfdb18696e229ddcfef4e6e72b4fb0fcddc2559c8644872ef9bdabff5",
        "sizeBytes": 2305126
    },
    "decor/medical-cups": {
        "sha256": "fc27ce0faa84b419885cbd3006b491ab3b8658782b7b9037c566b969c2ce8471",
        "sizeBytes": 1703691
    },
    "devices/parts-empty": {
        "sha256": "6297a0ffa45e87ac4dab75f4330152d6b6be1ee3579a77798c31081616ec6684",
        "sizeBytes": 2330186
    },
    "doors/lift-cage": {
        "sha256": "554ffcf5dce6a5652474a5bf1b36b7e696cf3a7f14621c5720407799e1ccd0f5",
        "sizeBytes": 1344816
    },
    "equipment/locker-stocked": {
        "sha256": "1d52abe726fa1cef6dc02544514046ccca9415ba4a0413ab2a568d7af4e2e6e9",
        "sizeBytes": 2310254
    },
    "equipment/supply-empty": {
        "sha256": "197acef18a7082229c4d4e91b175c60f809b83b6d356fc3fcfd85029c8262f42",
        "sizeBytes": 2195513
    },
    "planets/lv178-orbital": {
        "sha256": "14aabbcdea3fcf7330a391e20752c138fe049a1e7e7fc9f0d6935e0e079cb196",
        "sizeBytes": 1893668
    },
    "terrain/sand": {
        "sha256": "abb35029ec62424e8c9f13b4f2f05ff4e3ade0a3ff15750e2e3168324bedd276",
        "sizeBytes": 1722927
    },
    "terrain/silica": {
        "sha256": "1bc859b5800d8db432aa9848ebef16f45ce026309aa16845607a66b2d50e87ac",
        "sizeBytes": 1597263
    }
}
CONTINUATION_PNGS = {
    "characters/decker-walk-a-ready": {
        "sha256": "3fbbea74e01378c3da240aa9f6c3443d6c24313fa52724a6486e18161e264f52",
        "sizeBytes": 1764629
    },
    "characters/decker-walk-b-ready": {
        "sha256": "5e2053595a8a3c8ad2be198b0f673f2f0223a4fbc0635f9ca2714564b667b1a5",
        "sizeBytes": 1764986
    },
    "characters/manning-walk-a-ready": {
        "sha256": "2a596789d0447a4d9207872c9e727b882cbc5fed22a6be523608d1c993f1faf1",
        "sizeBytes": 1853882
    },
    "characters/manning-walk-b-ready": {
        "sha256": "2ea4fee779b7216efe38f557d1efc07fa0e99be3289febd091fcfb4cb565111e",
        "sizeBytes": 1816517
    },
    "characters/manning-walk-pass-a-ready": {
        "sha256": "2bad7edbaeb6737c6237220bb825e976126ee09b44440b60dcc5128b1bca2aff",
        "sizeBytes": 1713000
    },
    "characters/manning-walk-pass-b-ready": {
        "sha256": "3d947888368c21c4ef77880335650d7023ff293727c8fdc33994e83243559481",
        "sizeBytes": 1679099
    },
    "devices/console-complete": {
        "sha256": "9cdfa8e39afde7165180591af5432165fd9b073226fe4954a612fd079d33922e",
        "sizeBytes": 1874678
    },
    "devices/isolation-closed": {
        "sha256": "19df65f100687ad47fac328a4fe3273de189ca5209fc0c2a77065e730e8f38c6",
        "sizeBytes": 903057
    },
    "doors/boarding-ramp": {
        "sha256": "bb223fc2a0963d0d9707805e92f1fdc2dbf0f419bf123e8205264436def36d44",
        "sizeBytes": 1669244
    },
    "doors/rock-breach": {
        "sha256": "148bd0426393027befd6399f8f55267a03cfeaa2c41f11d775b5ce7ef923da3b",
        "sizeBytes": 777778
    },
    "equipment/sensor-off": {
        "sha256": "1ac6df767ac033e86123e917d401505c2b4093ab10879b7ef83602f83facf54b",
        "sizeBytes": 1660847
    },
    "equipment/weakpoint-destroyed": {
        "sha256": "28fd32af2e78a8b716bfeb4381606c43493864ef9b310ab4a956b6d7f702efef",
        "sizeBytes": 570761
    },
    "terrain/hive": {
        "sha256": "63d4d08fc5963c8d7d71d01c0e75e17f1b63da70bb19db39656e150ba51c0179",
        "sizeBytes": 1457136
    }
}
NEW_PNGS = {**WALK_PNGS, **COMPLETION_PNGS, **STATE_PNGS, **CONTINUATION_PNGS}
PUBLISHED_0_10_4_ROWS_SHA256 = '2335f0c8d687753d567479510b5208180b1f1724aa22070a3649a825b7d66f43'
PREVIOUS_ASSET_ROWS_SHA256 = 'b7458b3d7667db1e2acd819ca18a83267e637ab3351b31b4e3818a3bcd86be34'


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
    require(len(rows) == len(entries) == len(actual) == 152, 'Expected 152 individual PNG assets')
    require(pack['spriteCount'] == manifest['counts']['pngFiles'] == 152, 'Declared PNG counts differ')
    require(len({r['id'] for r in rows}) == len(rows), 'Duplicate asset identifiers')
    require({r['metadata']['src'] for r in rows} == set(actual), 'PNG inventory is not exact')
    require(manifest['canonicalOneToOneCertified'] is False, 'Unsupported canon certification')
    require(manifest['completeAnimationCycles'] is False, 'Unsupported animation completion')

    historical = [row for row in rows if row['id'] not in NEW_PNGS]
    records = ''.join(f"{row['id']}\t{row['sha256']}\t{row['sizeBytes']}\n"
                      for row in sorted(historical, key=lambda row: row['id'])).encode('utf-8')
    require(len(historical) == HISTORICAL_COUNT, 'Historical 119-asset inventory changed')
    require(sum(row['sizeBytes'] for row in historical) == HISTORICAL_BYTES, 'Historical PNG byte total changed')
    require(sha256(records).hexdigest() == HISTORICAL_DIGEST, 'Historical PNG hashes or identifiers changed')
    require(manifest['historicalIntegrity']['sha256'] == HISTORICAL_DIGEST, 'Historical digest declaration differs')
    previous_rows = sorted([row for row in rows if row['id'] not in STATE_PNGS and row['id'] not in CONTINUATION_PNGS], key=lambda row: row['id'])
    require(len(previous_rows) == 126, 'Published 0.10.3 inventory changed')
    previous_bytes = json.dumps(previous_rows, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    require(sha256(previous_bytes).hexdigest() == PREVIOUS_ASSET_ROWS_SHA256, 'A published 0.10.3 asset row or metadata changed')
    require(manifest['priorEdition0_10_3Integrity']['assetRowsSha256'] == PREVIOUS_ASSET_ROWS_SHA256, '0.10.3 metadata preservation pin differs')
    published_rows = sorted([row for row in rows if row['id'] not in CONTINUATION_PNGS], key=lambda row: row['id'])
    require(len(published_rows) == 139, 'Published 0.10.4 inventory changed')
    published_bytes = json.dumps(published_rows, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    require(sha256(published_bytes).hexdigest() == PUBLISHED_0_10_4_ROWS_SHA256, 'A published 0.10.4 asset row or metadata changed')
    require(manifest['priorEdition0_10_4Integrity']['assetRowsSha256'] == PUBLISHED_0_10_4_ROWS_SHA256, '0.10.4 metadata preservation pin differs')
    by_id = {row['id']: row for row in rows}
    for key, expected in NEW_PNGS.items():
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
            if key in WALK_PNGS:
                require(provenance.get('promptId') == key.split('/')[1] and
                        provenance.get('promptSource') == 'docs/mer-des-chagrins-20261126/CONTINUATION_PROMPTS.json' and
                        provenance.get('referenceSourcePath') == 'dlc/sea-of-sorrows-visual/sprites/characters/decker.png',
                        f'{key}: walking prompt/reference provenance missing')
            elif key in CONTINUATION_PNGS:
                require(provenance.get('promptId') == key and
                        provenance.get('promptSource') == 'docs/mer-des-chagrins-20261126/GENERATION_0_10_5.json',
                        f'{key}: armed gait/state/portal prompt provenance missing')
            elif key in STATE_PNGS:
                require(provenance.get('promptId') == key and
                        provenance.get('promptSource') == 'docs/mer-des-chagrins-20261126/GENERATION_0_10_4.json',
                        f'{key}: state/environment prompt provenance missing')
            else:
                require(provenance.get('promptId') == key and
                        provenance.get('promptSource') == 'docs/mer-des-chagrins-20261126/GENERATION_0_10_3.json',
                        f'{key}: completion prompt provenance missing')
        require(source_path and (repo / source_path).is_file(), f'{key}: original source file missing')
        require((repo / source_path).read_bytes() == data, f'{key}: original PNG bytes were changed')

    require(len(hashes) == 152, 'Duplicate PNG content assigned to different assets')
    require(total == manifest['counts']['bytes'] == 290100077, 'Unexpected PNG byte total')
    require(manifest['counts']['recoveredOriginalPng'] == 110 and manifest['counts']['preservedNewPng'] == 9 and
            manifest['counts']['newContinuationPng'] == 33 and manifest['counts']['newThisPassPng'] == 13, 'Recovery and new-generation counts are conflated')
    require(dict(sorted(Counter(key.split('/')[0] for key in entries).items())) == manifest['counts']['categories'], 'Category inventory differs')
    for key in ['characters/decker-ready', 'characters/decker-crouch-ready', 'characters/decker-dodge-ready', 'characters/manning-ready']:
        require('handAnchor' in entries[key], f'{key}: primary grip attachment missing')
    for key in ['characters/decker', 'characters/decker-ready', 'characters/decker-crouch', 'characters/decker-crouch-ready', 'characters/decker-dodge', 'characters/decker-dodge-ready']:
        require('lampAnchor' in entries[key], f'{key}: lamp attachment missing')
    for key in ['weapons/pistol', 'weapons/pulse', 'weapons/foam', 'weapons/flame']:
        require('gripAnchor' in entries[key], f'{key}: weapon grip missing')
    for key in ['stretchers/adams', 'stretchers/elway']:
        require(entries[key]['facing'] == 'none' and 'faceAnchor' in entries[key], f'{key}: invalid patient orientation/attachment')
    require(entries['parasites/normal']['worldHeight'] == 25, 'Normal parasite scale changed')
    require(entries['parasites/royal']['worldHeight'] == 31.75, 'Royal parasite scale changed')
    for key in [*WALK_PNGS, 'characters/decker-walk-pass-a', 'characters/decker-walk-pass-b']:
        entry = entries[key]
        require(entry.get('unarmedOnly') is True and 'handAnchor' not in entry,
                f'{key}: walking pose must remain explicitly unarmed')
        require(entry['worldHeight'] == 110 and entry['facing'] == 'right' and 'lampAnchor' in entry,
                f'{key}: walking scale/orientation/lamp attachment differs')
        require(entry['pivot'][1] == by_id[key]['visibleBoundsAlpha8'][3], f'{key}: walking footprint not grounded')
    for key in ['characters/carlyle-physician', 'characters/decker-medical-gown', 'objectives/icc-handheld']:
        require(entries[key].get('sceneScope') == ['s03'], f'{key}: medical scene scope differs')
    require(entries['characters/decker-medical-gown'].get('unarmedOnly') is True,
            'Medical gown must remain unarmed')
    for key in ['characters/decker-medical-report', 'decor/medical-chart', 'decor/medical-cups']:
        require(entries[key].get('sceneScope') == ['s03'], f'{key}: new medical scene scope differs')
    report = entries['characters/decker-medical-report']
    require(report.get('heldProp') == 'objectives/icc-handheld' and report.get('actionScope') == ['o02-01'] and report.get('unarmedOnly') is True, 'Medical report reader/action contract differs')
    for kind in ['sand', 'silica', 'hive']:
        require(entries['terrain/' + kind].get('terrainScope') == [kind], f'{kind}: terrain scope differs')
    require(entries['planets/lv178-orbital'].get('sceneScope') == ['s39'], 'Orbital globe scene scope differs')
    for key in [key for key in CONTINUATION_PNGS if key.startswith('characters/')]:
        entry = entries[key]
        role = 'decker' if '/decker-' in key else 'manning'
        require(entry.get('armedOnly') is True and entry.get('weaponScope') == ['pistol'] and
                entry.get('roleScope') == [role] and entry.get('motionScope') == ['walk'], f'{key}: armed gait scope differs')
        require(entry['worldHeight'] == 110 and entry['facing'] == 'right' and
                'handAnchor' in entry and 'supportHandAnchor' in entry, f'{key}: scale/orientation/grips missing')
        if role == 'decker':
            require('lampAnchor' in entry, f'{key}: lamp attachment missing')
        require(entry['pivot'][1] == by_id[key]['visibleBoundsAlpha8'][3], f'{key}: sole not grounded')
    for key, kind in [('doors/rock-breach', 'apertureBounds'), ('doors/boarding-ramp', 'rampBounds')]:
        entry = entries[key]
        a = entry.get(kind, [])
        require(len(a) == 4 and all(isinstance(n, (int, float)) and math.isfinite(n) for n in a), f'{key}: projection bounds missing')
        x, y, w, h = a
        require(0 <= x < entry['width'] and 0 <= y < entry['height'] and
                0 < w <= entry['width'] - x and 0 < h <= entry['height'] - y, f'{key}: projection outside source')
        require(entry.get('portalScope') == [key.split('/')[1]] and
                set(entry.get('mountScope', [])) == {'front', 'back'} and entry['facing'] == 'none', f'{key}: portal scope differs')
    rock = entries['doors/rock-breach']
    x, y, w, h = rock['apertureBounds']
    polygon = rock.get('aperturePolygon', [])
    require(len(polygon) >= 3 and all(isinstance(p, list) and len(p) == 2 and
            all(isinstance(v, (int, float)) and math.isfinite(v) for v in p) and
            x <= p[0] <= x+w and y <= p[1] <= y+h for p in polygon), 'Rock aperture polygon differs')
    require(entries['doors/boarding-ramp'].get('sceneScope') == ['s11', 's37'], 'Boarding ramp scene scope differs')
    for key, source in {'devices/isolation-closed': 'devices/isolation', 'devices/console-complete': 'devices/console',
                        'equipment/sensor-off': 'equipment/sensor', 'equipment/weakpoint-destroyed': 'equipment/weakpoint'}.items():
        require(entries[key].get('stateSource') == source and entries[key]['worldHeight'] == entries[source]['worldHeight'],
                f'{key}: source state/height differs')
    lift = entries['doors/lift-cage']
    aperture = lift.get('apertureBounds', [])
    require(len(aperture) == 4 and all(isinstance(n, (int, float)) and math.isfinite(n) for n in aperture), 'Lift aperture missing')
    ax, ay, aw, ah = aperture
    require(lift['facing'] == 'none' and 0 <= ax < lift['width'] and 0 <= ay < lift['height'] and 0 < aw <= lift['width'] - ax and 0 < ah <= lift['height'] - ay, 'Lift aperture outside image')
    require('creatures/adult' not in entries and 'weapons/plasma' not in entries,
            'Refused generations must not be counted as produced PNGs')
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
            'previousEditionPngAndMetadataUnchanged': 139, 'previousEditionAssetRowsSha256': PUBLISHED_0_10_4_ROWS_SHA256, 'newThisEditionPngFiles': len(CONTINUATION_PNGS), 'newSourcePngFiles': len(NEW_PNGS), 'categories': manifest['counts']['categories'], 'browserGameplayCertified': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    print(json.dumps(verify(args.repo.resolve()), ensure_ascii=False, indent=2))
