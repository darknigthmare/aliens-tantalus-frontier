"""Exercise the served Isolation raster presentation and its SVG fallback.

The main journey uses public buttons and real keyboard input. A separate,
explicitly declared offscreen renderer fixture covers roles that do not appear
in the opening room. That fixture has its own engine and never writes storage.
Run the existing qa-alien-isolation-integration.py for the longer save-terminal
and host-navigation journey as well.
"""
from __future__ import annotations

import argparse
import base64
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


RENDERER_FIXTURES = r"""async () => {
  const live = window.__isolation;
  const moduleURL = new URL('./fidelity/adapter.js', location.href);
  const manifestURL = new URL('./manifest.json', moduleURL);
  const {installIsolationRasterPresentation} = await import(moduleURL);
  const manifest = await (await fetch(manifestURL)).json();
  const beforeStorage = JSON.stringify(Object.fromEntries(Object.entries(localStorage)));
  const beforeLive = JSON.stringify(live.engine.s);
  const engine = new live.engine.constructor('recit', 20141007);
  const canvas = document.createElement('canvas');
  const renderer = new live.renderer.constructor(canvas, engine);
  await renderer.ready;
  const originalFlightObjects = renderer.flightObjects;
  // Restrict this fixture to world presentation; the real modal is never used.
  const fixtureManifest = {...manifest, bindings: {
    characters: manifest.bindings.characters || [], props: manifest.bindings.props || [],
    ui: manifest.bindings.ui || []
  }};
  const presentation = await installIsolationRasterPresentation(
    {renderer, engine, CONTENT: live.CONTENT}, fixtureManifest, {manifestURL}
  );
  const calls = [];
  const originalDrawImage = renderer.c.drawImage;
  renderer.c.drawImage = function(image, ...coordinates) {
    calls.push({image, coordinates});
    return originalDrawImage.call(this, image, ...coordinates);
  };
  const rows = [], frameIds = new WeakMap();
  let nextFrameId = 0;
  const identify = image => {
    if (!frameIds.has(image)) frameIds.set(image, ++nextFrameId);
    return frameIds.get(image);
  };
  const bodyBounds = image => {
    if (!(image instanceof HTMLCanvasElement)) return null;
    const pixels = image.getContext('2d').getImageData(0, 0, image.width, image.height).data;
    let top = image.height, bottom = -1, fingerprint = 2166136261;
    for (const value of pixels) fingerprint = Math.imul(fingerprint ^ value, 16777619);
    for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
      if (pixels[(y * image.width + x) * 4 + 3] > 127) {
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
    return {top, bottom, height: bottom - top + 1, pixelFingerprint: (fingerprint >>> 0).toString(16)};
  };
  const originalImages = {...renderer.images};
  for (const binding of fixtureManifest.bindings.characters) {
    const moving = binding.pose.endsWith('walk');
    const crouched = binding.pose.startsWith('crouch');
    engine.s.room = binding.kind === 'eva'
      ? live.CONTENT.rooms.find(room => room.exterior).id : 't_cryo';
    engine.s.crouched = crouched;
    engine.s.hidden = null;
    engine.s.stats.distance = 0;
    engine.frameTravel = 0;
    const kind = binding.kind === 'eva' ? 'amanda' : binding.kind;
    const reference = originalImages[binding.kind === 'facehugger' ? 'characters/facehugger.svg'
      : 'characters/' + binding.kind + '_' + (crouched ? 'crouch' : 'walk') + '_0.svg'];
    const entity = kind === 'amanda' ? engine.s : {
      x: 600, y: 300, face: 1, mode: 'hunt', hp: 100,
      stepDistance: 0, travelled: 0, careful: crouched, lowPose: crouched
    };
    entity.x = 600; entity.y = 300;
    renderer.character(entity, kind); // Establish this fixture's motion history.
    const observed = [];
    for (let i = 0; i < (moving ? binding.frames.length : 1); i++) {
      if (moving) {
        entity.x += 23; entity.travelled = (i + 1) * 23;
        entity.stepDistance = 23;
        engine.s.stats.distance = (i + 1) * 23; engine.frameTravel = 23;
      }
      calls.length = 0;
      renderer.character(entity, kind);
      observed.push(...calls.map(call => ({
        raster: call.image instanceof HTMLCanvasElement,
        frame: identify(call.image), width: call.image.width, height: call.image.height,
        body: bodyBounds(call.image)
      })));
    }
    rows.push({role: binding.kind, pose: binding.pose, suppliedFrames: binding.frames.length,
      observedFrames: new Set(observed.map(row => row.frame)).size,
      observedPixelFrames: new Set(observed.map(row => row.body?.pixelFingerprint)).size,
      allRaster: observed.length > 0 && observed.every(row => row.raster),
      bodyBounds: observed.map(row => row.body),
      frameCanvasCorrect: observed.every(row => row.width === reference.naturalWidth && row.height === reference.naturalHeight)});
  }
  // A missing EVA or crouch-walk pose must not borrow Amanda's still picture.
  const fallbacks = [];
  for (const [role, pose] of [['eva', 'idle'], ['eva', 'walk'], ['eva', 'crouch'], ['eva', 'crouch-walk'], ['amanda', 'crouch-walk']]) {
    if (fixtureManifest.bindings.characters.some(row => row.kind === role && row.pose === pose)) continue;
    engine.s.room = role === 'eva' ? live.CONTENT.rooms.find(room => room.exterior).id : 't_cryo';
    engine.s.crouched = pose.startsWith('crouch'); engine.s.stats.distance = 46;
    engine.frameTravel = pose.endsWith('walk') ? 23 : 0;
    calls.length = 0; renderer.character(engine.s, 'amanda');
    fallbacks.push({role, pose, originalSVG: calls.length === 1 && calls[0].image instanceof HTMLImageElement
      && calls[0].image.src.startsWith('data:image/svg+xml')});
  }
  calls.length = 0;
  renderer.character({x: 600, y: 300, mode: 'vent'}, 'alien');
  const ventInvisible = calls.length === 0;
  engine.s.room = live.CONTENT.rooms.find(room => room.sector === 'SOUVENIR' && room.exterior).id;
  engine.s.crouched = false; engine.frameTravel = 0;
  calls.length = 0; renderer.character(engine.s, 'marlow');
  const marlowIdentityPreserved = calls.length === 1 && calls[0].image instanceof HTMLImageElement
    && calls[0].image.src.startsWith('data:image/svg+xml');
  const bankRestored = Object.entries(originalImages).every(([key, image]) => renderer.images[key] === image);
  const projectiles = [];
  for (const kind of ['noise', 'flare', 'emp']) {
    if (!fixtureManifest.bindings.ui.some(row => row.key === kind)) continue;
    const thrown = new live.engine.constructor('recit', 20141007);
    const accepted = thrown.deploy(kind, {x:400, y:300});
    const duration = thrown.s.projectiles[0]?.duration;
    renderer.engine = thrown;
    for (const phase of ['flight', 'armed']) {
      const until = phase === 'flight' ? duration * .5 : duration + live.CONTENT.flight.fuse[kind] * .5;
      while (thrown.s.time < until - 1e-7) thrown.step(Math.min(.02, until - thrown.s.time));
      const before = JSON.stringify(thrown.s), rect = renderer.rect;
      const trace = fn => {
        const output = [], methods = {};
        for (const name of ['save', 'restore', 'translate', 'rotate', 'ellipse']) {
          methods[name] = renderer.c[name];
          renderer.c[name] = function(...args) {output.push([name, ...args]); return methods[name].apply(this, args);};
        }
        try {fn.call(renderer);} finally {for (const [name, method] of Object.entries(methods)) renderer.c[name] = method;}
        return output;
      };
      const native = trace(originalFlightObjects); calls.length = 0;
      const raster = trace(renderer.flightObjects);
      projectiles.push({kind, phase, accepted,
        pngDraws:calls.filter(call => call.image instanceof HTMLImageElement && call.image.src.startsWith(new URL('./assets/',manifestURL).href)).length,
        transformsPreserved:JSON.stringify(native) === JSON.stringify(raster),
        stateUnchanged:before === JSON.stringify(thrown.s), rectRestored:renderer.rect === rect});
    }
  }
  renderer.engine = engine;
  const props = [];
  const fingerprint = pixels => {
    let hash = 2166136261;
    for (const value of pixels) hash = Math.imul(hash ^ value, 16777619);
    return (hash >>> 0).toString(16);
  };
  for (const binding of fixtureManifest.bindings.props) {
    const candidates = live.CONTENT.rooms.flatMap(room => room.props.filter(prop => prop.kind === binding.kind).map(prop => ({room, prop})));
    for (const {room, prop} of candidates) {
      engine.s.room = room.id;
      renderer.camera = Math.max(0, Math.min(prop.x - 650, room.w - 1440));
      const propState = JSON.stringify(engine.s), reference = originalImages['props/' + binding.kind + '.svg'];
      calls.length = 0; renderer.prop(prop);
      const image = calls.find(call => call.image instanceof HTMLCanvasElement)?.image;
      const allowed = !binding.propIds || binding.propIds.includes(prop.id);
      const row = {kind: binding.kind, id: prop.id, room: room.id, allowed, drawn: !!image,
        originalSVGDrawn: calls.some(call => call.image === reference),
        stateUnchanged: propState === JSON.stringify(engine.s),
        originalBankRestored: renderer.images['props/' + binding.kind + '.svg'] === reference};
      if (binding.kind === 'terminal' && allowed && image) {
        const native = document.createElement('canvas');
        native.width = reference.naturalWidth; native.height = reference.naturalHeight;
        const context = native.getContext('2d'); context.drawImage(reference, 0, 0);
        const y = Math.round(native.height * 166 / 256), height = native.height - y;
        const nativePixels = context.getImageData(0, y, native.width, height).data;
        const rasterPixels = image.getContext('2d').getImageData(0, y, native.width, height).data;
        let differingPixels = 0;
        for (let i = 0; i < nativePixels.length; i += 4) {
          if (nativePixels[i] !== rasterPixels[i] || nativePixels[i + 1] !== rasterPixels[i + 1]
            || nativePixels[i + 2] !== rasterPixels[i + 2] || nativePixels[i + 3] !== rasterPixels[i + 3]) differingPixels++;
        }
        row.nativeDeskComparison = {width:native.width, height:native.height,
          rasterWidth:image.width, rasterHeight:image.height, startY:y, comparedRows:height,
          comparedPixels:nativePixels.length / 4, differingPixels,
          nativeFingerprint:fingerprint(nativePixels), rasterFingerprint:fingerprint(rasterPixels)};
        row.nativeDeskPreserved = native.width === image.width && native.height === image.height
          && differingPixels === 0;
      }
      props.push(row);
    }
  }
  const propStateUnchanged = props.every(row => row.stateUnchanged);
  // Exercise the real hold/use/rewire methods on an independent seeded engine.
  // Room and position are fixture setup, never a claimed campaign journey.
  const rewires = [], rewireCaptures = [];
  const rewireBinding = fixtureManifest.bindings.props.find(binding => binding.asset === 'rewire-panel');
  if (rewireBinding) for (const room of live.CONTENT.rooms) for (const prop of room.props) {
    if (prop.interactive !== 'rewire') continue;
    const circuit = new live.engine.constructor('recit', 20141007);
    circuit.s.room = room.id; circuit.s.x = prop.x; circuit.s.y = prop.y;
    const inventoryBefore = JSON.stringify(circuit.s.inventory);
    const progressBefore = JSON.stringify([circuit.s.chapter,circuit.s.goal,circuit.s.completed,circuit.s.flags]);
    const modes = [0], held = [], drawn = [];
    renderer.engine = circuit;
    renderer.camera = Math.max(0, Math.min(prop.x - 650, room.w - 1440));
    for (let turn = 0; turn < 3; turn++) {
      while (circuit.cooldown > 0) circuit.step(.08, {interact:false});
      const target = circuit.targets()[0];
      const before = circuit.s.systems[room.id]?.mode || 0;
      circuit.interact(.54); circuit.interact(.55);
      const beforeThreshold = circuit.s.systems[room.id]?.mode || 0;
      circuit.interact(.02);
      modes.push(circuit.s.systems[room.id]?.mode || 0);
      held.push(target?.id === prop.id && beforeThreshold === before);
      calls.length = 0;
      const state = JSON.stringify(circuit.s);
      renderer.prop(prop);
      drawn.push({raster:calls.some(call => call.image instanceof HTMLCanvasElement),
        svg:calls.some(call => call.image === originalImages['props/relay.svg']),
        stateUnchanged:state === JSON.stringify(circuit.s)});
      if (!rewires.length && [0,1].includes(turn)) {
        circuit.s.x = prop.x - 110;
        renderer.render();
        rewireCaptures.push({file:'rewire-fixture-mode-'+modes.at(-1)+'.png',
          meaning:'Independent native renderer fixture in '+room.id+', circuit mode '+modes.at(-1)+'; no campaign teleport or storage write',
          png:canvas.toDataURL('image/png')});
        circuit.s.x = prop.x;
      }
    }
    const cyclesComplete = circuit.s.stats.rewires === 3;
    circuit.s.x = prop.x + 150;
    const farState = JSON.stringify(circuit.s);
    const farRejected = circuit.rewire(prop) === false && farState === JSON.stringify(circuit.s);
    circuit.s.x = prop.x;
    let timedReturn = null;
    if (!rewires.length) {
      circuit.rewire(prop); circuit.rewire(prop);
      const expiry = circuit.s.systems[room.id].until;
      const duration = expiry - circuit.s.time;
      while (circuit.s.time < expiry - .04) circuit.step(Math.min(.08, expiry - .04 - circuit.s.time));
      const activeBefore = circuit.s.systems[room.id].mode === 2;
      circuit.step(.08);
      timedReturn = {duration, activeBefore, normalAfter:circuit.s.systems[room.id].mode === 0};
    }
    rewires.push({id:prop.id,room:room.id,admitted:rewireBinding.propIds.includes(prop.id),modes,
      holdThresholdPreserved:held.every(Boolean),cyclesComplete,farRejected,drawn,timedReturn,
      inventoryUnchanged:inventoryBefore === JSON.stringify(circuit.s.inventory),
      progressUnchanged:progressBefore === JSON.stringify([circuit.s.chapter,circuit.s.goal,circuit.s.completed,circuit.s.flags])});
  }
  renderer.engine = engine;
  presentation.uninstall();
  return {rows, fallbacks, props, projectiles, rewires, rewireCaptures, ventInvisible, marlowIdentityPreserved, bankRestored, propStateUnchanged,
    liveStateUnchanged: beforeLive === JSON.stringify(live.engine.s),
    storageUnchanged: beforeStorage === JSON.stringify(Object.fromEntries(Object.entries(localStorage)))};
}"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument('--source-root', type=Path)
    parser.add_argument('--base')
    parser.add_argument('--output', type=Path, default=Path.cwd() / '.qa/alien-isolation-fidelity')
    args = parser.parse_args()
    root = args.root.resolve()
    source = (args.source_root or Path(__file__).resolve().parent.parent).resolve()
    output = args.output.resolve()
    original = source / 'modules/alien-isolation/v0.8'
    if output == original or original in output.parents:
        parser.error('Evidence must not overwrite the recovered source')
    output.mkdir(parents=True, exist_ok=True)
    spec = importlib.util.spec_from_file_location('isolation_integration_qa', source / 'scripts/qa-alien-isolation-integration.py')
    helpers = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helpers)
    report = {
        'schema': 1, 'startedAt': datetime.now(timezone.utc).isoformat(),
        'mainJourney': 'Public UI, real keyboard movement, read-only state/storage observation',
        'rendererFixture': 'Independent seeded engine and offscreen native renderer; role, position and pose fields set only on that fixture; no writes to main engine or storage',
        'limits': ['Not a franchise likeness certification', 'Two-frame walks remain two-frame walks', 'Native host campaign is outside this check'],
        'checks': [], 'captures': [], 'pageErrors': [],
    }

    def flush():
        (output / 'browser-fidelity.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')

    def check(name, success, detail=None):
        report['checks'].append({'name': name, 'ok': bool(success), 'detail': detail})
        flush()
        print(('PASS ' if success else 'FAIL ') + name, flush=True)
        if not success:
            raise AssertionError(name)

    def capture(page, name, meaning):
        destination = output / name
        page.screenshot(path=str(destination))
        report['captures'].append({'file': name, 'meaning': meaning,
                                  'sha256': hashlib.sha256(destination.read_bytes()).hexdigest(), 'imageEdited': False})
        flush()

    def child_frame(page):
        child = page.locator('iframe#isolation-game').element_handle().content_frame()
        child.locator('body[data-ready="true"]').wait_for(state='attached')
        child.wait_for_function("['ready','partial','failed'].includes(document.body.dataset.visualPack)")
        return child

    def visual(child):
        return child.evaluate('__isolationVisualV1.snapshot()')

    def close_panel(child):
        child.locator('#closeModal').click()
        child.locator('#modal').wait_for(state='hidden')

    def walk_to(page, child, x, y):
        for _ in range(80):
            position = child.evaluate('({x:__isolation.engine.s.x,y:__isolation.engine.s.y})')
            dx, dy = x - position['x'], y - position['y']
            if abs(dx) < 6 and abs(dy) < 6:
                return
            # The first-room route below uses the clear lane at y=250. All
            # movement still goes through native keyboard handling/collisions.
            horizontal = abs(dx) >= abs(dy)
            key = ('d' if dx > 0 else 'a') if horizontal else ('s' if dy > 0 else 'w')
            distance = abs(dx) if horizontal else abs(dy)
            try:
                page.keyboard.down(key)
                page.wait_for_timeout(min(160, max(30, distance / 205 * 1000)))
            finally:
                page.keyboard.up(key)
        raise AssertionError('Real keyboard route did not reach its waypoint')

    try:
        with helpers.static_site(root, args.base) as base, sync_playwright() as pw:
            launch = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
            if os.environ.get('ATF_CHROMIUM_EXECUTABLE'):
                launch['executable_path'] = os.environ['ATF_CHROMIUM_EXECUTABLE']
            browser = pw.chromium.launch(**launch)
            report['browserVersion'] = browser.version
            context = browser.new_context(viewport={'width': 1440, 'height': 1000})
            page = context.new_page()
            page.set_default_timeout(30000)
            page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
            page.goto(base + '/dlc/alien-isolation/index.html', wait_until='load')
            child = child_frame(page)
            manifest = child.evaluate("fetch('./fidelity/manifest.json').then(r=>r.json())")
            status = visual(child)
            check('Toutes les images du manifeste sont chargées', not status['failed']
                  and set(status['loaded']) == {asset['id'] for asset in manifest['assets']}, status)
            check('Le chargement du pack ne crée pas de sauvegarde', child.evaluate('localStorage.length===0'))
            child.locator('#difficulty').select_option('recit')
            child.locator('#newGame').click()
            child.wait_for_function('__isolation.started')
            child.wait_for_function("__isolationVisualV1.snapshot().renderedCharacters.includes('amanda/idle')")
            checkpoint = child.evaluate('localStorage.getItem(__isolation.CONTENT.meta.saveKey)')
            capture(page, '01-amanda-idle.png', 'Amanda immobile dans la vraie première salle')
            start_x = child.evaluate('__isolation.engine.s.x')
            try:
                page.keyboard.down('d')
                page.wait_for_timeout(420)
                check('La marche utilise la pose prévue et déplace Amanda',
                      child.evaluate('__isolation.engine.s.x') > start_x + 15
                      and 'amanda/walk' in visual(child)['renderedCharacters'])
                capture(page, '02-amanda-walk.png', 'Marche au clavier dans le runtime servi')
            finally:
                page.keyboard.up('d')
            page.keyboard.press('c')
            child.wait_for_function('__isolation.engine.s.crouched')
            child.wait_for_function("__isolationVisualV1.snapshot().renderedCharacters.includes('amanda/crouch')")
            capture(page, '03-amanda-crouch.png', 'Accroupissement réel, sans modification de l’état par le test')
            if any(binding['kind'] == 'amanda' and binding['pose'] == 'crouch-walk' for binding in manifest['bindings']['characters']):
                crouch_x = child.evaluate('__isolation.engine.s.x')
                try:
                    page.keyboard.down('a')
                    page.wait_for_timeout(350)
                    check('La progression accroupie utilise ses deux poses prévues',
                          child.evaluate('__isolation.engine.s.x') < crouch_x - 12
                          and 'amanda/crouch-walk' in visual(child)['renderedCharacters'])
                    capture(page, '03b-amanda-crouch-walk.png', 'Déplacement accroupi réel au clavier')
                finally:
                    page.keyboard.up('a')
            page.keyboard.press('c')
            goal = child.evaluate('({id:__isolation.engine.goal.id,x:__isolation.engine.goal.x,y:__isolation.engine.goal.y})')
            check('Le premier équipement conserve son acquisition native', goal['id'] == 'C01_01'
                  and not child.evaluate('__isolation.engine.s.tools.torch'))
            walk_to(page, child, child.evaluate('__isolation.engine.s.x'), 250)
            walk_to(page, child, goal['x'], 250)
            walk_to(page, child, goal['x'], goal['y'])
            try:
                page.keyboard.down('e')
                child.wait_for_function('__isolation.engine.s.tools.torch && __isolation.engine.s.goal===1')
            finally:
                page.keyboard.up('e')
            child.wait_for_function('old=>localStorage.getItem(__isolation.CONTENT.meta.saveKey)!==old', arg=checkpoint)
            checkpoint = child.evaluate('localStorage.getItem(__isolation.CONTENT.meta.saveKey)')
            report['nativeAcquisition'] = {'goal': goal['id'], 'tool': 'torch', 'method': 'Real movement and held E; native Récit autosave'}
            child.locator('[data-panel="inventory"]').click()
            child.wait_for_function(r"""() => {
              const images = [...document.querySelectorAll('.equipment-item .item-art img')];
              return images.length === 4 && images.every(image => image.complete && image.naturalWidth > 0);
            }""")
            item_images = child.evaluate(r"""manifest=>{
              const assets=Object.fromEntries(manifest.assets.map(asset=>[asset.id,asset.src]));
              const bindings=manifest.bindings.ui||[];
              const url=asset=>new URL(assets[asset],new URL('./fidelity/manifest.json',location.href)).href;
              return [...document.querySelectorAll('.equipment-item .item-art img')].map(img=>{
                const key=img.closest('.equipment-item').querySelector('[data-select-item]').dataset.selectItem;
                const binding=bindings.find(row=>row.key===key);
                return {key,bound:!!binding,matches:!!binding&&img.src===url(binding.asset),loaded:img.complete&&img.naturalWidth>0};
              });
            }""", manifest)
            check('Les quatre objets utilisables affichent leurs vrais PNG dans l’équipement',
                  len(item_images) == 4 and all(row['bound'] and row['matches'] and row['loaded'] for row in item_images), item_images)
            quick_images = child.evaluate(r"""manifest=>{
              const assets=Object.fromEntries(manifest.assets.map(asset=>[asset.id,asset.src]));
              return [...document.querySelectorAll('[data-icon]')].map(img=>{
                const binding=(manifest.bindings.ui||[]).find(row=>row.key===img.dataset.icon);
                return {key:img.dataset.icon,matches:!!binding&&img.src===new URL(assets[binding.asset],new URL('./fidelity/manifest.json',location.href)).href};
              });
            }""", manifest)
            check('La roue rapide reprend les mêmes images sans changer les quatre IDs',
                  bool(quick_images) and all(row['matches'] for row in quick_images), quick_images)
            equipped = child.evaluate('({...__isolation.engine.s.tools})')
            displayed = child.locator('[data-isolation-tool]').evaluate_all('(nodes)=>nodes.map(node=>node.dataset.isolationTool)')
            check('Les illustrations d’outils restent conditionnées à leur acquisition',
                  all(equipped[key] for key in displayed)
                  and set(displayed) == {binding['key'] for binding in manifest['bindings'].get('tools', []) if equipped[binding['key']]})
            close_panel(child)
            child.locator('[data-panel="codex"]').click()
            child.locator('[data-codex="people"]').click()
            portraits = [binding['name'] for binding in manifest['bindings'].get('portraits', [])]
            for name in portraits:
                child.wait_for_function('name=>[...document.querySelectorAll("[data-isolation-portrait]")].some(node=>node.dataset.isolationPortrait===name)', arg=name)
                child.evaluate('name=>[...document.querySelectorAll("[data-isolation-portrait]")].find(node=>node.dataset.isolationPortrait===name).scrollIntoView({block:"center"})', name)
                child.wait_for_function('name=>[...document.querySelectorAll("[data-isolation-portrait]")].some(node=>node.dataset.isolationPortrait===name && node.complete && node.naturalWidth>0)', arg=name)
            check('Les portraits correspondent aux dossiers exacts',
                  child.locator('[data-isolation-portrait]').evaluate_all('(nodes)=>nodes.every(node=>node.alt===node.closest(".codex-card").querySelector("h3").textContent.trim())'))
            capture(page, '04-codex-portraits.png', 'Dossiers narratifs : ces portraits ne créent pas de PNJ physiques')
            fixture = child.evaluate(RENDERER_FIXTURES)
            for native_capture in fixture.pop('rewireCaptures', []):
                destination = output / native_capture['file']
                destination.write_bytes(base64.b64decode(native_capture['png'].split(',', 1)[1]))
                report['captures'].append({'file':native_capture['file'], 'meaning':native_capture['meaning'],
                    'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(), 'imageEdited':False,
                    'source':'Unmodified PNG export of the independent native renderer canvas'})
            report['offscreenRenderer'] = fixture
            if any(binding.get('asset') == 'rewire-panel' for binding in manifest['bindings']['props']):
                rewire_rows = [row for row in fixture['props'] if row['kind'] == 'relay']
                check('Le boîtier est limité aux 23 dérivations et les 30 autres relais gardent leur SVG',
                      sum(row['drawn'] for row in rewire_rows) == 23
                      and sum(row['originalSVGDrawn'] for row in rewire_rows) == 30
                      and all(row['drawn'] == row['allowed'] for row in rewire_rows), rewire_rows)
                check('Les 23 interactions natives gardent leur maintien, cycle, distance et progression',
                      len(fixture['rewires']) == 23 and all(row['admitted'] and row['modes'] == [0,1,2,0]
                        and row['holdThresholdPreserved'] and row['cyclesComplete'] and row['farRejected']
                        and row['inventoryUnchanged'] and row['progressUnchanged']
                        and all(draw['raster'] and draw['stateUnchanged'] for draw in row['drawn'])
                        for row in fixture['rewires']), fixture['rewires'])
                timer = next(row['timedReturn'] for row in fixture['rewires'] if row['timedReturn'])
                check('La ventilation revient au mode normal après ses 24 secondes natives',
                      abs(timer['duration'] - 24) < 1e-8 and timer['activeBefore'] and timer['normalAfter'], timer)
            check('Chaque pose fournie est dessinée avec ses vrais cadres distincts',
                  all(row['allRaster'] and row['frameCanvasCorrect'] and row['observedFrames'] == row['suppliedFrames']
                      and row['observedPixelFrames'] == row['suppliedFrames'] for row in fixture['rows']), fixture['rows'])
            for walk in (row for row in fixture['rows'] if row['pose'].endswith('walk')):
                check('Hauteur et ligne des pieds communes : ' + walk['role'] + '/' + walk['pose'],
                      max(row['height'] for row in walk['bodyBounds']) - min(row['height'] for row in walk['bodyBounds']) <= 3
                      and max(row['bottom'] for row in walk['bodyBounds']) - min(row['bottom'] for row in walk['bodyBounds']) <= 2,
                      walk['bodyBounds'])
            check('Les poses absentes gardent leurs SVG et l’alien en conduit reste caché',
                  all(row['originalSVG'] for row in fixture['fallbacks']) and fixture['ventInvisible'], fixture['fallbacks'])
            check('Marlow conserve son identité dans le souvenir extérieur', fixture['marlowIdentityPreserved'])
            check('Tous les vrais IDs d’objets respectent leurs images autorisées et les exclusions',
                  all(row['drawn'] == row['allowed'] and row['originalBankRestored'] for row in fixture['props'])
                  and fixture['bankRestored'], fixture['props'])
            terminals = [row for row in fixture['props'] if row['kind'] == 'terminal' and row['allowed']]
            check('Les CRT Sevastolink conservent les pixels des claviers, bureaux, pieds et ombres d’origine',
                  bool(terminals) and all(row.get('nativeDeskPreserved')
                      and row['nativeDeskComparison']['differingPixels'] == 0 for row in terminals),
                  [{'id':row['id'], **row.get('nativeDeskComparison', {})} for row in terminals])
            check('Les objets réellement lancés conservent trajectoire, rotation, ombre, amorce et état natifs',
                  len(fixture['projectiles']) == 6 and all(row['accepted'] and row['pngDraws'] == 1
                    and row['transformsPreserved'] and row['stateUnchanged'] and row['rectRestored'] for row in fixture['projectiles']), fixture['projectiles'])
            check('Le rendu ne modifie ni la partie réelle ni ses sauvegardes',
                  fixture['liveStateUnchanged'] and fixture['storageUnchanged'] and fixture['propStateUnchanged'])
            check('Les changements de présentation ne réécrivent pas le point de reprise',
                  child.evaluate('localStorage.getItem(__isolation.CONTENT.meta.saveKey)') == checkpoint)
            page.reload(wait_until='load')
            child = child_frame(page)
            check('Un rechargement conserve les octets de sauvegarde',
                  child.evaluate('localStorage.getItem(__isolation.CONTENT.meta.saveKey)') == checkpoint)
            child.locator('#continueGame').click()
            check('Reprendre garde la salle, l’objectif et la lampe acquis réellement',
                  child.evaluate("__isolation.engine.s.room==='t_cryo' && __isolation.engine.s.goal===1 && __isolation.engine.s.tools.torch"))
            check('Le parcours et les fixtures ne déclenchent aucune erreur JavaScript', not report['pageErrors'], report['pageErrors'])

            # A separate empty context exercises a genuinely failed image request.
            failed_context = browser.new_context(viewport={'width': 1440, 'height': 1000})
            idle = next(binding for binding in manifest['bindings']['characters'] if binding['kind'] == 'amanda' and binding['pose'] == 'idle')
            missing = next(asset for asset in manifest['assets'] if asset['id'] == idle['frames'][0])
            await_pattern = '**/fidelity/' + missing['src'].removeprefix('./')
            failed_context.route(await_pattern, lambda route: route.abort())
            rewire_asset = next((asset for asset in manifest['assets'] if asset['id'] == 'rewire-panel'), None)
            if rewire_asset:
                failed_context.route('**/fidelity/' + rewire_asset['src'].removeprefix('./'), lambda route: route.abort())
            failed_page = failed_context.new_page()
            failed_page.set_default_timeout(30000)
            failed_page.goto(base + '/dlc/alien-isolation/index.html', wait_until='load')
            failed_child = child_frame(failed_page)
            partial = visual(failed_child)
            check('Une image absente est signalée sans remplacer son SVG par du vide',
                  any(row['id'] == missing['id'] for row in partial['failed'])
                  and not any(row['kind'] == 'amanda' and row['pose'] == 'idle' for row in partial['characters'])
                  and failed_child.evaluate("__isolation.renderer.images['characters/amanda_walk_0.svg'].complete"))
            failed_child.locator('#newGame').click()
            if rewire_asset:
                failed_fixture = failed_child.evaluate(RENDERER_FIXTURES)
                failed_relays = [row for row in failed_fixture['props'] if row['kind'] == 'relay']
                check('Le PNG de dérivation absent laisse 53 relais SVG et leurs interactions utilisables',
                      any(row['id'] == 'rewire-panel' for row in partial['failed'])
                      and len(failed_relays) == 53 and all(row['originalSVGDrawn'] and not row['drawn'] for row in failed_relays)
                      and all(row['modes'] == [0,1,2,0] and row['cyclesComplete'] for row in failed_fixture['rewires']),
                      {'relays':failed_relays, 'cycles':[{'id':row['id'],'modes':row['modes']} for row in failed_fixture['rewires']]})
            x = failed_child.evaluate('__isolation.engine.s.x')
            try:
                failed_page.keyboard.down('d')
                failed_page.wait_for_timeout(300)
            finally:
                failed_page.keyboard.up('d')
            check('Le jeu reste utilisable après cet échec de chargement', failed_child.evaluate('__isolation.engine.s.x') > x + 10)
            capture(failed_page, '05-missing-image-fallback.png', 'Échecs réseau volontaires des images ciblées : SVG conservés pour Amanda et, si présent, le boîtier de dérivation')
            failed_context.close()
            context.close()
            browser.close()
        report['ok'] = True
    except Exception as error:
        report['ok'] = False
        report['error'] = str(error)
        raise
    finally:
        report['finishedAt'] = datetime.now(timezone.utc).isoformat()
        flush()


if __name__ == '__main__':
    main()
