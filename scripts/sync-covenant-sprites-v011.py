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
ASSETS_V013 = ROOT / 'assets/openai/sprites/alien-covenant-v013'
ASSETS_V014 = ROOT / 'assets/openai/sprites/alien-covenant-v014'
ASSETS_V016 = ROOT / 'assets/openai/sprites/alien-covenant-v016'
ASSETS_V017 = ROOT / 'assets/openai/sprites/alien-covenant-v017'
LEGACY_BINDINGS_SHA256 = '883270a99e8da81eced7bbd848d46133dd6647ac9fb3f46bb14ace4f2b3b8bc0'
CUMULATIVE_BINDINGS_SHA256_V012 = '57ac46b9d02623da13d0064792af862189fac9da1698be5c6229ba2e4922383f'
CUMULATIVE_BINDINGS_SHA256_V013 = '92e49e5dfb5b7ff435272af996d479d8482179ea27c94db7850ae386805061bf'
CUMULATIVE_BINDINGS_SHA256_V014 = '4b8de98270f6ca3d6805a3f3e85b5a5e038a2ef30d6f8e0853ca90c252f0a9d2'
CUMULATIVE_CYCLES_SHA256_V014 = '3a8b96d053d38e84dc8dd60aa211706769deba4364dde57106f75e58d3266226'
INVENTORY = ROOT / 'docs/covenant/INVENTORY_V011.json'
PROVENANCE = ASSETS / 'manifest.json'
OVERRIDES = ROOT / 'docs/covenant/SPRITE_PROVENANCE_V011.json'
TARGET = ROOT / 'dlc/covenant/sprites-v011.json'


def measured_continuation(source, file, kind, key, state):
    raw = file.read_bytes()
    expected = source.get('sha256', source.get('alphaQA', {}).get('sha256'))
    if not expected or hashlib.sha256(raw).hexdigest() != expected:
        raise ValueError('Continuation image differs from its reviewed provenance: ' + file.stem)
    with Image.open(file) as original:
        background = kind == 'background'
        if not background and 'A' not in original.getbands() and 'transparency' not in original.info:
            raise ValueError('Missing continuation transparency: ' + file.stem)
        image = original.convert('RGBA')
        alpha = image.getchannel('A')
        if background and alpha.getextrema() != (255, 255):
            raise ValueError('Distant background must be fully opaque: ' + file.stem)
        if not background and alpha.getextrema()[0] != 0:
            raise ValueError('No transparent continuation background: ' + file.stem)
        bounds = alpha.point(lambda value: 255 if value >= 32 else 0).getbbox()
        if bounds is None:
            raise ValueError('Empty continuation sprite: ' + file.stem)
        left, top, right, bottom = bounds
        if kind == 'human' and ('anchor' not in source or 'logicalHeight' not in source):
            raise ValueError('Walk frames require reviewed pivots and scale: ' + file.stem)
        entry = {
            'id': file.stem, 'kind': kind, 'key': key, 'state': state,
            'path': '/assets/openai/sprites/' + file.parent.name + '/' + file.name,
            'width': image.width, 'height': image.height, 'bytes': len(raw),
            'sha256': expected, 'alphaBounds': list(bounds), 'alphaThreshold': 0 if background else 32,
            'anchor': source.get('anchor', [(left + right) / 2, bottom]),
            'logicalHeight': source.get('logicalHeight', 100),
            'sourceFacing': source.get('sourceFacing', 1), 'verified1to1': False,
            'note': 'Generated pose; only the declared state and consumer are available. Film fidelity is not certified.',
            'rooms': source['rooms']
        }
        for name in ('actors', 'imagePolicy', 'renderLayer', 'backgroundFit'):
            if name in source:
                entry[name] = source[name]
        if background:
            entry['note'] = 'Generated distant scenery, limited to the sky layer; native playable geometry is unchanged. Film fidelity is not certified.'
        return entry


def continuation_assets(folder, version):
    file = folder / 'manifest.json'
    if not file.exists():
        return [], [], False
    source = json.loads(file.read_text())
    if source.get('schemaVersion') != 1 or not isinstance(source.get('assets'), list):
        raise ValueError('Invalid continuation production manifest: ' + version)
    content = (ROOT / 'modules/covenant/dlc/covenant/content.js').read_text()
    prefix = '(function(root){const data='
    data = json.loads(content[len(prefix):content.rfind(';if(typeof module')])
    props = {prop['id']: room['id'] for room in data['rooms'] for prop in room['props']}
    # Execute the real costume selector, without constructing or mutating a game.
    # Ducts are intentionally absent: their movement is crawling, not walking.
    consumers = json.loads(subprocess.run(['node', '-e',
        "const data=require('./modules/covenant/dlc/covenant/content.js');"
        "const {appearance}=require('./modules/covenant/dlc/covenant/fidelity.js');"
        "const rooms={};for(const room of data.rooms){if(room.crawl)continue;"
        "const key=appearance({room,data,actorDefs:new Map()},{},'daniels').id;"
        "(rooms[key]??=[]).push(room.id);}process.stdout.write(JSON.stringify(rooms));"],
        text=True, capture_output=True, cwd=ROOT, check=True).stdout)
    admitted_profiles = ({'daniels-work'} if version == '0.12.0' else
                         {'daniels', 'daniels-eva', 'david-young'} if version == '0.13.0' else set())
    npc_consumers = {}
    if version in ('0.14.0', '0.17.0'):
        npc_consumers = json.loads(subprocess.run(['node', '-e',
            "const data=require('./modules/covenant/dlc/covenant/content.js');"
            "const {appearance}=require('./modules/covenant/dlc/covenant/fidelity.js');"
            "const actorDefs=new Map(data.actors.map(a=>[a.id,a]));"
            "process.stdout.write(JSON.stringify(Object.fromEntries(data.actors.map(actor=>"
            "[actor.id,{room:actor.room,role:actor.role,speed:actor.speed,route:actor.route,"
            "profile:appearance({data,actorDefs,room:data.rooms.find(r=>r.id===actor.room)},actor,actor.role)}]))));"],
            text=True, capture_output=True, cwd=ROOT, check=True).stdout)
    entries, identities = [], set()
    for row in sorted(source['assets'], key=lambda item: item['id']):
        identity = row['id']
        if not re.fullmatch(r'[a-z][a-zA-Z0-9-]{0,79}', identity) or identity in identities:
            raise ValueError('Invalid or duplicate continuation sprite ID: ' + identity)
        identities.add(identity)
        expected_path = 'assets/openai/sprites/' + folder.name + '/' + identity + '.png'
        if row.get('path', '').lstrip('/') != expected_path:
            raise ValueError('Invalid continuation production path: ' + identity)
        admission = row.get('runtimeAdmission')
        if admission == 'catalogue-only':
            continue
        rooms = row.get('rooms')
        if not isinstance(rooms, list) or not rooms or len(set(rooms)) != len(rooms):
            raise ValueError('Continuation runtime images require explicit rooms: ' + identity)
        if admission == 'instance-scoped':
            key = row.get('instance')
            if row.get('kind') != 'prop' or key not in props or rooms != [props[key]]:
                raise ValueError('Continuation prop does not match its exact existing instance: ' + identity)
            kind, state = 'prop', 'idle'
        elif admission == 'cycle-frame':
            key, kind, state = row.get('rendererKey'), row.get('kind'), row.get('state')
            if (kind != 'human' or key not in admitted_profiles or state != 'walk'
                    or set(rooms) != set(consumers.get(key, []))):
                raise ValueError('Walk frame does not match the exact existing player consumer: ' + identity)
        elif admission == 'npc-cycle-frame':
            key, kind, state = row.get('rendererKey'), row.get('kind'), row.get('state')
            expected = {
                '0.14.0': ('walter', 'walter-cryo', 'cryo', 26, [{'x': 450, 'z': .5}, {'x': 535, 'z': .5}]),
                '0.17.0': ('upworth', 'upworth-comms', 'comms', 22, [{'x': 1050, 'z': .5}, {'x': 1120, 'z': .5}])
            }.get(version)
            if expected is None:
                raise ValueError('Unreviewed NPC continuation version: ' + version)
            profile_id, actor_id, room_id, speed, route = expected
            native = npc_consumers.get(actor_id, {})
            if (kind != 'human' or key != profile_id or state != 'walk'
                    or rooms != [room_id] or row.get('actors') != [actor_id]
                    or native.get('room') != room_id or native.get('role') != profile_id
                    or native.get('speed') != speed
                    or native.get('profile', {}).get('id') != key or native.get('profile', {}).get('gun')
                    or native.get('route') != route):
                raise ValueError('NPC walk frame does not match its exact existing actor: ' + identity)
        elif admission == 'room-background':
            key, kind, state = row.get('rendererKey'), row.get('kind'), row.get('state')
            if (version != '0.14.0' or identity != 'background-planet4-lake'
                    or kind != 'background' or key != 'landing' or state != 'idle' or rooms != ['landing']
                    or row.get('imagePolicy') != 'opaque-background' or row.get('renderLayer') != 'sky'
                    or row.get('backgroundFit') != 'cover-bottom' or row.get('logicalHeight') != 555):
                raise ValueError('Background does not match the reviewed sky layer: ' + identity)
        else:
            raise ValueError('Unreviewed continuation runtime admission: ' + identity)
        entries.append(measured_continuation(row, folder / (identity + '.png'), kind, key, state))
    cycles = source.get('cycles', [])
    return entries, cycles, True


def reviewed_v017_promotions():
    """Apply an explicit reviewed occurrence without editing its historical manifest."""
    file = ASSETS_V017 / 'manifest.json'
    if not file.exists():
        return []
    source = json.loads(file.read_text())
    promotions = source.get('runtimePromotions', [])
    if not isinstance(promotions, list) or len(promotions) > 1:
        raise ValueError('Invalid V017 runtime promotions')
    entries = []
    for promotion in promotions:
        if (promotion.get('assetId') != 'world-planet4-shore-rock'
                or promotion.get('sourceManifest') != 'assets/openai/sprites/alien-covenant-v016/manifest.json'
                or promotion.get('instance') != 'landing-light2' or promotion.get('rooms') != ['landing']
                or promotion.get('runtimeAdmission') != 'instance-scoped'):
            raise ValueError('Unreviewed V017 promotion target')
        historical_bytes = (ASSETS_V016 / 'manifest.json').read_bytes()
        if hashlib.sha256(historical_bytes).hexdigest() != '6e166985008494e08f2b528368d0ffa53ae299f59634f91a7b0e9941df607c6a':
            raise ValueError('The V016 production manifest must remain byte-identical')
        historical = json.loads(historical_bytes)
        original = next(row for row in historical['assets'] if row['id'] == promotion['assetId'])
        content = (ROOT / 'modules/covenant/dlc/covenant/content.js').read_text()
        data = json.loads(content[len('(function(root){const data='):content.rfind(';if(typeof module')])
        room = next(row for row in data['rooms'] if row['id'] == 'landing')
        occurrence = next(row for row in room['props'] if row['id'] == 'landing-light2')
        expected = {'id': 'landing-light2', 'kind': 'rock', 'x': 1750, 'z': .02, 'w': 110, 'h': 65}
        if any(occurrence.get(key) != value for key, value in expected.items()) or occurrence.get('solid'):
            raise ValueError('The reviewed shore occurrence changed')
        reviewed = {**original, 'rooms': ['landing']}
        entry = measured_continuation(reviewed, ASSETS_V016 / (original['id'] + '.png'), 'prop', 'landing-light2', 'idle')
        entry['note'] = 'V017 promotion of the unchanged V016 shore rock; exact non-solid landing-light2 occurrence only. No film scale or 1:1 fidelity certified.'
        entries.append(entry)
    return entries


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
    cycles = []
    for folder, version in [(ASSETS_V012, '0.12.0'), (ASSETS_V013, '0.13.0'), (ASSETS_V014, '0.14.0'), (ASSETS_V017, '0.17.0')]:
        additions, new_cycles, continuation = continuation_assets(folder, version)
        if continuation:
            if version == '0.13.0':
                previous = json.dumps(manifest['assets'], ensure_ascii=False, separators=(',', ':')).encode()
                if hashlib.sha256(previous).hexdigest() != CUMULATIVE_BINDINGS_SHA256_V012:
                    raise ValueError('The 39 reviewed V012 bindings must remain byte-identical')
            if version == '0.14.0':
                previous = json.dumps(manifest['assets'], ensure_ascii=False, separators=(',', ':')).encode()
                if hashlib.sha256(previous).hexdigest() != CUMULATIVE_BINDINGS_SHA256_V013:
                    raise ValueError('The 63 reviewed V013 bindings must remain byte-identical')
            if version == '0.17.0':
                previous = json.dumps(manifest['assets'], ensure_ascii=False, separators=(',', ':')).encode()
                prior_cycles = json.dumps(cycles, ensure_ascii=False, separators=(',', ':')).encode()
                if (hashlib.sha256(previous).hexdigest() != CUMULATIVE_BINDINGS_SHA256_V014
                        or hashlib.sha256(prior_cycles).hexdigest() != CUMULATIVE_CYCLES_SHA256_V014):
                    raise ValueError('The 72 reviewed V014 bindings and five cycles must remain byte-identical')
                additions += reviewed_v017_promotions()
            manifest['release'] = version
            manifest['assets'] = manifest['assets'] + additions
            cycles += new_cycles
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
