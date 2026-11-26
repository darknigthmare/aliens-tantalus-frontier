#!/usr/bin/env python3
"""Measure original delivered PNGs and rebuild the exact runtime admission list.

This script never edits, crops, recolors, resizes or synthesizes imagery.
Optional provenance rows can provide reviewed anchor/grip/room overrides.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets/openai/sprites/alien-covenant-v011'
ASSETS_V012 = ROOT / 'assets/openai/sprites/alien-covenant-v012'
LEGACY_BINDINGS_SHA256 = '883270a99e8da81eced7bbd848d46133dd6647ac9fb3f46bb14ace4f2b3b8bc0'
INVENTORY = ROOT / 'docs/covenant/INVENTORY_V011.json'
PROVENANCE = ASSETS / 'manifest.json'
OVERRIDES = ROOT / 'docs/covenant/SPRITE_PROVENANCE_V011.json'
TARGET = ROOT / 'dlc/covenant/sprites-v011.json'


def measured_v012(source, file, kind, key, state):
    raw = file.read_bytes()
    expected = source.get('sha256', source.get('alphaQA', {}).get('sha256'))
    if not expected or hashlib.sha256(raw).hexdigest() != expected:
        raise ValueError('V012 image differs from its reviewed provenance: ' + file.stem)
    with Image.open(file) as original:
        if 'A' not in original.getbands() and 'transparency' not in original.info:
            raise ValueError('Missing V012 transparency: ' + file.stem)
        image = original.convert('RGBA')
        alpha = image.getchannel('A')
        if alpha.getextrema()[0] != 0:
            raise ValueError('No transparent V012 background: ' + file.stem)
        bounds = alpha.point(lambda value: 255 if value >= 32 else 0).getbbox()
        if bounds is None:
            raise ValueError('Empty V012 sprite: ' + file.stem)
        left, top, right, bottom = bounds
        if kind == 'human' and ('anchor' not in source or 'logicalHeight' not in source):
            raise ValueError('Walk frames require reviewed pivots and scale: ' + file.stem)
        return {
            'id': file.stem, 'kind': kind, 'key': key, 'state': state,
            'path': '/assets/openai/sprites/alien-covenant-v012/' + file.name,
            'width': image.width, 'height': image.height, 'bytes': len(raw),
            'sha256': expected, 'alphaBounds': list(bounds), 'alphaThreshold': 32,
            'anchor': source.get('anchor', [(left + right) / 2, bottom]),
            'logicalHeight': source.get('logicalHeight', 100),
            'sourceFacing': source.get('sourceFacing', 1), 'verified1to1': False,
            'note': 'Generated pose; only the declared state and consumer are available. Film fidelity is not certified.',
            'rooms': source['rooms']
        }


def continuation_assets():
    file = ASSETS_V012 / 'manifest.json'
    if not file.exists():
        return [], [], False
    source = json.loads(file.read_text())
    if source.get('schemaVersion') != 1 or not isinstance(source.get('assets'), list):
        raise ValueError('Invalid V012 production manifest')
    content = (ROOT / 'modules/covenant/dlc/covenant/content.js').read_text()
    prefix = '(function(root){const data='
    data = json.loads(content[len(prefix):content.rfind(';if(typeof module')])
    props = {prop['id']: room['id'] for room in data['rooms'] for prop in room['props']}
    work_rooms = {'cryo', 'service', 'cabin', 'funeralairlock', 'evaprep', 'bridge', 'comms'}
    entries, identities = [], set()
    for row in sorted(source['assets'], key=lambda item: item['id']):
        identity = row['id']
        if not re.fullmatch(r'[a-z][a-zA-Z0-9-]{0,79}', identity) or identity in identities:
            raise ValueError('Invalid or duplicate V012 sprite ID: ' + identity)
        identities.add(identity)
        expected_path = 'assets/openai/sprites/alien-covenant-v012/' + identity + '.png'
        if row.get('path', '').lstrip('/') != expected_path:
            raise ValueError('Invalid V012 production path: ' + identity)
        admission = row.get('runtimeAdmission')
        if admission == 'catalogue-only':
            continue
        rooms = row.get('rooms')
        if not isinstance(rooms, list) or not rooms or len(set(rooms)) != len(rooms):
            raise ValueError('V012 runtime images require explicit rooms: ' + identity)
        if admission == 'instance-scoped':
            key = row.get('instance')
            if row.get('kind') != 'prop' or key not in props or rooms != [props[key]]:
                raise ValueError('V012 prop does not match its exact existing instance: ' + identity)
            kind, state = 'prop', 'idle'
        elif admission == 'cycle-frame':
            key, kind, state = row.get('rendererKey'), row.get('kind'), row.get('state')
            if kind != 'human' or key != 'daniels-work' or state != 'walk' or not set(rooms) <= work_rooms:
                raise ValueError('V012 walk frame does not match the existing player consumer: ' + identity)
        else:
            raise ValueError('Unreviewed V012 runtime admission: ' + identity)
        entries.append(measured_v012(row, ASSETS_V012 / (identity + '.png'), kind, key, state))
    cycles = source.get('cycles', [])
    return entries, cycles, True


def main():
    inventory = json.loads(INVENTORY.read_text())
    profiles = {row['id']: row for row in inventory['profiles']}
    families = {row['id']: row for row in inventory['propFamilies']}
    references = {}
    for provenance_file in (PROVENANCE, OVERRIDES):
        if provenance_file.exists():
            source = json.loads(provenance_file.read_text())
            rows = source.get('assets', source.get('sprites', [])) if isinstance(source, dict) else source
            for row in rows:
                references[row['id']] = {**references.get(row['id'], {}), **row}
    assets = []
    for file in sorted(ASSETS.glob('*.png')):
        identity = file.stem
        if not re.fullmatch(r'[a-z][a-zA-Z0-9-]{0,79}', identity):
            raise ValueError('Invalid sprite ID: ' + identity)
        source = references.get(identity, {})
        if source.get('runtimeAdmission') == 'catalogue-only':
            continue
        state = 'idle'
        key = identity
        if identity in profiles:
            kind = 'human'
            logical_height = profiles[identity]['logicalHeight']
        elif identity.removesuffix('-attack') in ('neomorph', 'xenomorph', 'facehugger'):
            kind = 'creature'
            key = identity.removesuffix('-attack')
            state = 'attack' if identity.endswith('-attack') else 'idle'
            logical_height = {'neomorph': 176, 'xenomorph': 195, 'facehugger': 42}[key]
        elif identity.startswith('weapon-'):
            kind, key, logical_height = 'weapon', identity[7:], 36
        elif identity.startswith('prop-'):
            kind, key, logical_height = 'prop', identity[5:], 100
            camel = {re.sub(r'([a-z])([A-Z])', r'\1-\2', key).lower(): key for key in families}
            key = camel.get(key, key)
        else:
            raise ValueError('Sprite has no recognized runtime category: ' + identity)
        if source.get('kind'):
            kind = source['kind']
        key = source.get('rendererKey', source.get('key', key))
        state = source.get('state', state)
        raw = file.read_bytes()
        with Image.open(file) as original:
            if 'A' not in original.getbands() and 'transparency' not in original.info:
                raise ValueError('Missing transparency: ' + identity)
            image = original.convert('RGBA')
            alpha = image.getchannel('A')
            if alpha.getextrema()[0] != 0:
                raise ValueError('No fully transparent background: ' + identity)
            mask = alpha.point(lambda value: 255 if value >= 32 else 0)
            bounds = mask.getbbox()
            if bounds is None:
                raise ValueError('Empty sprite: ' + identity)
            left, top, right, bottom = bounds
            # Find the support band, not the centre of a tail-heavy full canvas.
            band_top = max(top, bottom - max(3, round((bottom - top) * .035)))
            support = mask.crop((left, band_top, right, bottom)).getbbox()
            anchor_x = left + (support[0] + support[2]) / 2 if support else (left + right) / 2
            if kind in ('weapon', 'prop'):
                anchor_x = (left + right) / 2
            row = {
                'id': identity, 'kind': kind, 'key': key, 'state': state,
                'path': '/assets/openai/sprites/alien-covenant-v011/' + file.name,
                'width': image.width, 'height': image.height, 'bytes': len(raw),
                'sha256': hashlib.sha256(raw).hexdigest(), 'alphaBounds': list(bounds),
                'alphaThreshold': 32, 'anchor': source.get('anchor', [anchor_x, bottom]),
                'logicalHeight': source.get('logicalHeight', logical_height),
                'sourceFacing': source.get('sourceFacing', 1), 'verified1to1': False,
                'note': 'Generated pose; only the declared state is available. Film fidelity is not certified.'
            }
            for name in ('grip', 'muzzle', 'heldGrip', 'heldAngle', 'rooms'):
                if name in source:
                    row[name] = source[name]
            if key == 'console' and 'rooms' not in row:
                row['rooms'] = ['bridge', 'comms', 'landercockpit']
            if key == 'cryopod' and 'rooms' not in row:
                row['rooms'] = ['cryo']
            if key == 'cargoLifter' and 'rooms' not in row:
                row['rooms'] = ['plaza']
            assets.append(row)
    manifest = {'schemaVersion': 1, 'release': '0.11.0', 'sourceModuleVersion': '0.10.0',
                'verified1to1': False, 'assets': assets}
    legacy = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode()
    if hashlib.sha256(legacy).hexdigest() != LEGACY_BINDINGS_SHA256:
        raise ValueError('The 29 reviewed V011 bindings must remain byte-identical')
    additions, cycles, continuation = continuation_assets()
    if continuation:
        manifest['release'] = '0.12.0'
        manifest['assets'] = assets + additions
        manifest['cycles'] = cycles
    serialized = json.dumps(manifest, ensure_ascii=False, indent=2) + '\n'
    # Validate the complete candidate before replacing the last working registry.
    subprocess.run(['node', '-e',
                    "const {compileManifest}=require('./modules/covenant/dlc/covenant/sprite-registry-v011.js');"
                    "compileManifest(JSON.parse(require('node:fs').readFileSync(0,'utf8')));"],
                   input=serialized, text=True, cwd=ROOT, check=True)
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(serialized)
    subprocess.run(['node', str(ROOT / 'scripts/build-covenant-v011.mjs')], cwd=ROOT, check=True)
    print(json.dumps({'sprites': len(manifest['assets']), 'legacyBindings': len(assets),
                      'cycles': len(cycles), 'manifest': str(TARGET)}))


if __name__ == '__main__':
    main()
