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
INVENTORY = ROOT / 'docs/covenant/INVENTORY_V011.json'
PROVENANCE = ASSETS / 'manifest.json'
OVERRIDES = ROOT / 'docs/covenant/SPRITE_PROVENANCE_V011.json'
TARGET = ROOT / 'dlc/covenant/sprites-v011.json'


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
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    subprocess.run(['node', str(ROOT / 'scripts/build-covenant-v011.mjs')], cwd=ROOT, check=True)
    print(json.dumps({'sprites': len(assets), 'manifest': str(TARGET)}))


if __name__ == '__main__':
    main()
