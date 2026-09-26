import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { TITLE_SHIP_ANGLE_ASSETS_V88 } from '../src/title-scene-angle-assets-v88.js';
import { buildTitleSceneModelV79, resolveTitleSceneContextV88, getTitleSceneShipAnglesV88,
  validateTitleShipAngleV88, chooseTitleShipAngleV88, getTitleSceneRuntimeAssetsV79 } from '../src/title-scene-catalog-v79.js';
import { TitleSceneControllerV79 } from '../src/title-scene-v79.js';
import { createTitleFlightClockV88, advanceTitleFlightV88, sampleTitleFlightV88, pauseTitleFlightV88 } from '../src/title-scene-motion-v88.js';

const save = () => ({ worldId: 'world-01-acheron-lv-426', settings: { quality: 'high' },
  presentation: { titleScene: { shipId: 'uss-sulaco', shipName: 'TANTALUS' } } });
const roles = model => model.layers.map(layer => layer.role);
const event = { active: true, kind: 'wreck-field', sourceType: 'event', sourceId: 'orbital-wreckage-01' };

test('exterior default never paints an interior frame or unjustified debris, even if docked/quarantined', () => {
  for (const presetId of ['frontier-night', 'storm-terminator', 'ember-quarantine']) {
    const state = { ...save(), scene: 'mission', strategy: { currentOperation: 'random' }, shipPortV1: { phase: 'docked' },
      presentation: { titleScene: { presetId } } };
    const before = structuredClone(state), model = buildTitleSceneModelV79(state);
    assert.equal(model.sceneContext.viewpoint, 'exterior');
    assert.equal(model.sceneContext.debris, null);
    assert.ok(!roles(model).includes('foreground'));
    assert.ok(!roles(model).includes('debris'));
    assert.deepEqual(state, before);
  }
});

test('station-observer requires a station identity; debris requires explicit active mission/event evidence', () => {
  for (const sceneContext of [null, {}, { viewpoint: 'station-observer' }, { viewpoint: 'interior', stationId: 'relay' },
    { viewpoint: 'station-observer', stationId: '<station>' }, { debris: {} },
    { debris: { ...event, active: false } }, { debris: { ...event, sourceType: 'theme' } },
    { debris: { ...event, sourceId: '' } }, { debris: { ...event, kind: 'cosmetic' } }]) {
    const model = buildTitleSceneModelV79(save(), { sceneContext });
    assert.ok(!roles(model).includes('foreground'));
    assert.ok(!roles(model).includes('debris'));
  }
  for (const mode of ['full', 'reduced', 'static']) {
    const state = save(); state.presentation.titleScene.motionMode = mode;
    const station = buildTitleSceneModelV79(state, { sceneContext: { viewpoint: 'station-observer', stationId: 'station-01' } });
    assert.ok(roles(station).includes('foreground'));
    assert.ok(!roles(station).includes('debris'));
    const wreckage = buildTitleSceneModelV79(state, { sceneContext: { debris: event } });
    assert.ok(roles(wreckage).includes('debris'));
    assert.ok(!roles(wreckage).includes('foreground'));
  }
  assert.equal(resolveTitleSceneContextV88({ debris: { ...event, sourceType: 'mission' } }).debris.sourceType, 'mission');
});

const authored = (patch = {}) => ({ id: 'orbitals-uss-sulaco-front-quarter-v88', runtimeId: 'title.v88.ship.uss-sulaco.front-quarter',
  shipId: 'uss-sulaco', angleId: 'front-quarter', label: 'Test metadata only',
  src: '/assets/openai/ui/title/v88/orbitals/uss-sulaco-front-quarter-v88.png', sha256: '1'.repeat(64),
  sourceWidth: 1024, sourceHeight: 768, hullRegistration: { x: 0, y: 0, width: 1024, height: 768, sourceWidth: 1024, sourceHeight: 768 },
  namePlate: null, status: 'ready', viewAuthorship: 'native-authored-angle', ...patch });

test('angle validation excludes missing/unapproved/mirrored views, invalid geometry, paths and unknown ships', () => {
  assert.equal(validateTitleShipAngleV88(authored()), true);
  for (const patch of [{ status: 'generated-unreviewed' }, { status: 'missing' }, { viewAuthorship: 'mirrored-reference' },
    { shipId: 'unknown' }, { angleId: 'flip' }, { sourceWidth: 0 }, { sourceHeight: NaN }, { sha256: 'todo' },
    { src: 'https://example.com/angle.png' }, { src: '/assets/openai/ui/title/v88/orbitals/../private.png' },
    { hullRegistration: { x: 0, y: 0, width: 1025, height: 768, sourceWidth: 1024, sourceHeight: 768 } },
    { namePlate: { x: 1000, y: 0, width: 50, height: 10 } }]) assert.equal(validateTitleShipAngleV88(authored(patch)), false, JSON.stringify(patch));
  assert.equal(getTitleSceneShipAnglesV88('unknown', [authored()]).length, 0);
  const views = getTitleSceneShipAnglesV88('uss-sulaco', [authored(), authored(), authored({ id: 'orbitals-duplicate-v88' }), authored({ status: 'missing' })]);
  assert.equal(views.length, 2);
  assert.equal(views[0].angleId, 'reference');
  assert.equal(views[1].angleId, 'front-quarter');
});

test('rotation chooses only approved authored files, and never fakes a second angle when only reference exists', () => {
  let calls = 0;
  const random = () => { calls++; return .999; };
  const reference = chooseTitleShipAngleV88('uss-sulaco', null, random, []);
  assert.equal(reference, 'orbitals-uss-sulaco-reference-v87');
  assert.equal(calls, 0);
  assert.equal(chooseTitleShipAngleV88('uss-sulaco', reference, random, [authored()]), authored().id);
  assert.equal(chooseTitleShipAngleV88('uss-sulaco', authored().id, random, [authored()]), reference);
  assert.equal(chooseTitleShipAngleV88('uss-sulaco', null, () => NaN, [authored()]), reference);
  assert.equal(chooseTitleShipAngleV88('uss-sulaco', null, () => { throw Error(); }, [authored()]), reference);
  assert.equal(buildTitleSceneModelV79(save(), { shipAngleAssetId: 'unreviewed' }).shipAngleId, 'reference');
});

test('every shipped angle entry must have real immutable PNG bytes and exact native dimensions', async () => {
  const paths = getTitleSceneRuntimeAssetsV79();
  for (const asset of TITLE_SHIP_ANGLE_ASSETS_V88) {
    assert.equal(validateTitleShipAngleV88(asset), true, asset.id);
    const bytes = await readFile(asset.src.slice(1));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), asset.sourceWidth);
    assert.equal(bytes.readUInt32BE(20), asset.sourceHeight);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
    assert.ok(paths.includes(asset.src));
  }
});

test('flight position is frame-rate independent at 30, 60 and 144 Hz, including smooth quality transitions', () => {
  const run = fps => {
    const clock = createTitleFlightClockV88(); advanceTitleFlightV88(clock, 0);
    for (let frame = 1; frame <= fps * 20; frame++) advanceTitleFlightV88(clock, frame * 1000 / fps, frame <= fps * 10 ? 'full' : 'reduced');
    return clock;
  };
  const expected = run(60);
  for (const fps of [30, 144]) {
    const actual = run(fps);
    assert.ok(Math.abs(actual.elapsed - expected.elapsed) < 1e-9);
    assert.ok(Math.abs(actual.speed - expected.speed) < 1e-9);
  }
  for (let t = 0; t < 10000; t += .113) {
    const p = sampleTitleFlightV88(t);
    assert.ok(Math.abs(p.x) <= 2.8 && Math.abs(p.y) <= 1.1);
  }
});

test('a long frame is clamped; pause/resume and static preserve the exact phase without a teleport', () => {
  const clock = createTitleFlightClockV88();
  advanceTitleFlightV88(clock, 0); advanceTitleFlightV88(clock, 1000);
  assert.equal(clock.elapsed, .05);
  const before = sampleTitleFlightV88(clock.elapsed);
  assert.deepEqual(advanceTitleFlightV88(clock, 60000, 'static'), before);
  pauseTitleFlightV88(clock);
  assert.deepEqual(advanceTitleFlightV88(clock, 90000), before);
  assert.deepEqual(advanceTitleFlightV88(clock, NaN), before);
});

class Element {
  constructor(ownerDocument) { Object.assign(this, { ownerDocument, dataset: {}, children: [], hidden: false,
    listeners: new Map(), style: { values: new Map(), setProperty(key, value) { this.values.set(key, value); } } }); }
  setAttribute() {}
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
}
function surface() {
  const listeners = new Map(), frames = new Map(); let id = 0;
  const document = { hidden: false, createElement: () => new Element(document),
    addEventListener: (type, listener) => listeners.set(type, listener), removeEventListener: type => listeners.delete(type) };
  const root = new Element(document), fallback = new Element(document);
  const media = { matches: false, addEventListener: (_type, listener) => listeners.set('motion', listener) };
  const controller = new TitleSceneControllerV79({ root, fallback, matchMedia: () => media, supportsScene: () => true,
    random: () => 0, angleStorage: { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } },
    requestFrame: callback => { frames.set(++id, callback); return id; }, cancelFrame: handle => frames.delete(handle) });
  const tick = timestamp => { const current = [...frames.values()]; frames.clear(); for (const callback of current) callback(timestamp); };
  return { root, document, controller, media, frames, listeners, tick };
}

test('real controller maintains one RAF; hidden/static/disposed stop it and preserve position on return', () => {
  const s = surface(), state = save(), original = structuredClone(state);
  s.controller.show(state); s.controller.show(state);
  assert.equal(s.frames.size, 1);
  s.tick(0); s.tick(16); s.tick(32);
  const position = new Map(s.root.style.values);
  s.media.matches = true; s.listeners.get('motion')();
  assert.equal(s.frames.size, 0);
  assert.deepEqual(s.root.style.values, position);
  s.media.matches = false; s.listeners.get('motion')(); s.tick(50000);
  assert.deepEqual(s.root.style.values, position);
  s.document.hidden = true; s.listeners.get('visibilitychange')();
  assert.equal(s.frames.size, 0);
  s.document.hidden = false; s.listeners.get('visibilitychange')(); s.tick(90000);
  assert.deepEqual(s.root.style.values, position);
  s.controller.hide(); assert.equal(s.frames.size, 0);
  s.controller.preservePlacementOnNextShowV87(); s.controller.show(state); s.tick(100000);
  assert.deepEqual(s.root.style.values, position);
  s.controller.dispose(); assert.equal(s.frames.size, 0);
  assert.equal(s.listeners.has('visibilitychange'), false);
  assert.deepEqual(state, original);
});

test('motion changes reuse pending native images; removed images still cannot affect the new scene', () => {
  const s = surface(), state = save(); s.controller.show(state);
  const ship = s.root.children.find(layer => layer.dataset.role === 'orbitals');
  s.controller.show({ ...state, settings: { quality: 'low' } });
  assert.equal(s.root.children.find(layer => layer.dataset.role === 'orbitals'), ship);
  ship.children[0].listeners.get('load')(); assert.equal(ship.dataset.assetStatus, 'ready');
  s.controller.setSceneContextV88({ viewpoint: 'station-observer', stationId: 'relay-01', debris: event });
  assert.equal(s.controller.getSnapshot().viewpoint, 'station-observer');
  assert.ok(s.controller.getSnapshot().roles.includes('foreground'));
  s.controller.setSceneContextV88(null);
  assert.ok(!s.controller.getSnapshot().roles.includes('foreground'));
  assert.ok(!s.controller.getSnapshot().roles.includes('debris'));
  s.controller.dispose();
});

test('CSS uses only continuous translation for ship motion, with no camera-flip illusion', async () => {
  const css = await readFile('title-scene-v79.css', 'utf8');
  assert.match(css, /transform: translate3d\(var\(--title-flight-x-v88, 0%\), var\(--title-flight-y-v88, 0%\), 0\)/u);
  assert.doesNotMatch(css, /rotateY|scaleX\(-1\)/u);
  assert.match(css, /transition: none !important/u);
});
