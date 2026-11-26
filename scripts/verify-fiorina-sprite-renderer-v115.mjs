import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateAlien3SpriteManifestV115, createAlien3SpriteBankV115, drawAlien3SpriteV115,
  selectAlien3HumanSpriteV115, selectAlien3RunnerSpriteV115 } from '../src/alien3-sprites-v115.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS, WEAPONS, ENEMIES } from '../src/content.js';
import { buildFiorinaMissionV114 } from '../src/fiorina-campaign-v114.js';
import { stationV105 } from '../src/alien3-encounter-v105.js';
import { compileEvidencePropsV113 } from '../src/alien3-fidelity-v113.js';
import { hostV136 } from './forge-native-host-v136.mjs';

// Unit fixtures below substitute Image/Canvas only to verify contracts and
// fallback. Actual PNG alpha/composition is covered by qa-fiorina-sprites-v115.
const prefix = 'assets/openai/sprites/alien3-fiorina-v115/';
const asset = (extra = {}) => ({ src: prefix + 'fixture-a.png', frame: { x: 0, y: 0, w: 100, h: 200 },
  pivot: { x: 40, y: 180 }, world: { w: 50, h: 100 }, facing: 'right', state: 'idle', ...extra });
const manifest = (assets = { 'ripley-prison-idle': asset() }) => ({ schemaVersion: 1, assets });
function factory({ sizes = {}, failures = [], requests = [] } = {}) {
  return () => ({
    naturalWidth: 0, naturalHeight: 0,
    set src(value) {
      this._src = value; requests.push(value);
      const name = value.split('/').at(-1), size = sizes[name] || [100, 200];
      this.naturalWidth = size[0]; this.naturalHeight = size[1];
      queueMicrotask(() => failures.includes(name) ? this.onerror?.() : this.onload?.());
    }, get src() { return this._src; }
  });
}
async function loaded(data, options = {}) {
  const bank = createAlien3SpriteBankV115(data, { imageFactory: factory(options), loadTimeoutMs: 50,
    baseURL: 'https://fixture.invalid/', preloadAll: true });
  await bank.ready;
  return bank;
}
function context({ failDraw = false } = {}) {
  const calls = [], stack = [];
  return { calls, stack, save() { stack.push(1); }, restore() { assert.ok(stack.pop()); },
    translate(...args) { calls.push(['translate', ...args]); }, scale(...args) { calls.push(['scale', ...args]); },
    drawImage(...args) { if (failDraw) throw new Error('decode lost'); calls.push(['drawImage', ...args]); } };
}

test('measured manifest rejects outside paths, non-finite geometry and malformed per-file frames', () => {
  assert.equal(validateAlien3SpriteManifestV115(manifest()).ok, true);
  for (const changed of [asset({ src: 'https://example.invalid/actor.png' }), asset({ src: prefix + '../escape.png' }),
    asset({ world: { w: Infinity, h: 20 } }), asset({ pivot: { x: 101, y: 10 } }),
    asset({ frames: [null], fps: 6 }), asset({ frames: [asset().frame, asset().frame] })]) {
    assert.equal(validateAlien3SpriteManifestV115(manifest({ actor: changed })).ok, false);
  }
});

test('separate PNG frames load once and are validated against each own decoded image', async () => {
  const requests = [];
  const data = manifest({
    idle: asset(), walk: asset({ fps: 6, frames: [
      { ...asset().frame },
      { src: prefix + 'fixture-b.png', x: 0, y: 0, w: 120, h: 240, pivot: { x: 48, y: 216 }, world: { w: 50, h: 100 } }
    ] })
  });
  const bank = await loaded(data, { sizes: { 'fixture-b.png': [120, 240] }, requests });
  assert.equal(bank.report().total, 2); assert.equal(bank.report().ready, 2);
  assert.equal(bank.report().loading, 0); assert.deepEqual(bank.report().errors, []);
  assert.equal(requests.length, 2, 'Shared first PNG must not be decoded twice');
  assert.equal(bank.get('walk').frameImages[1].naturalWidth, 120);
  const c = context(), receipt = drawAlien3SpriteV115(c, bank, 'walk', { x: 5, y: 6, time: .2, requireAnimation: true });
  assert.equal(receipt.frameIndex, 1);
  assert.equal(c.calls.find((x) => x[0] === 'drawImage')[1], bank.get('walk').frameImages[1]);
  assert.equal(receipt.destination.y, -90, 'Each measured pivot must reach the same contact point');
});

test('a missing image or out-of-bounds crop settles to fallback without drawImage', async () => {
  const bank = await loaded(manifest({ missing: asset({ src: prefix + 'missing.png' }),
    invalid: asset({ frame: { x: 2, y: 0, w: 100, h: 200 } }) }), { failures: ['missing.png'] });
  assert.equal(bank.report().ready, 0); assert.equal(bank.report().errors.length, 2);
  const c = context();
  assert.equal(drawAlien3SpriteV115(c, bank, 'missing', { x: 0, y: 0 }).drawn, false);
  assert.equal(drawAlien3SpriteV115(c, bank, 'invalid', { x: 0, y: 0 }).drawn, false);
  assert.equal(c.calls.length, 0);
});

test('a ready actor is drawable while optional images queue; requests are bounded', async () => {
  const pending = [], data = manifest(Object.fromEntries(['one','two','three'].map((id) => [id, asset({ src: prefix + id + '.png' })])));
  const bank = createAlien3SpriteBankV115(data, { maxConcurrentImages: 1, loadTimeoutMs: 100, preloadAll: true,
    imageFactory: () => ({ naturalWidth: 100, naturalHeight: 200, set src(value) { this._src = value; pending.push(this); } }) });
  await Promise.resolve();
  assert.equal(pending.length, 1, 'Only the admitted request starts its timeout');
  pending[0].onload();
  for (let i = 0; i < 12; i++) await Promise.resolve();
  assert.equal(bank.status('one').state, 'ready');
  assert.equal(bank.status('two').state, 'loading');
  assert.equal(drawAlien3SpriteV115(context(), bank, 'one', { x: 0, y: 0 }).drawn, true);
  assert.equal(pending.length, 2);
  pending[1].onload();
  for (let i = 0; i < 12; i++) await Promise.resolve();
  assert.equal(pending.length, 3); pending[2].onload();
  await bank.ready;
  assert.equal(bank.report().ready, 3);
});

test('runtime banks request only selected images and share a PNG within one bank', async () => {
  const requests = [];
  const bank = createAlien3SpriteBankV115(manifest({ one: asset(), alias: asset(),
    distant: asset({ src: prefix + 'distant.png' }) }), { imageFactory: factory({ requests }) });
  assert.equal(requests.length, 0); assert.equal(bank.report().unrequested, 3);
  assert.equal(drawAlien3SpriteV115(context(), bank, 'one', { x: 0, y: 0 }).drawn, false);
  await bank.ready;
  assert.equal(drawAlien3SpriteV115(context(), bank, 'one', { x: 0, y: 0 }).drawn, true);
  await bank.request('alias');
  assert.equal(requests.length, 1, 'A selected alias reuses the same decoded PNG');
  assert.equal(bank.status('distant').state, 'unrequested');
  bank.dispose();
});

test('LRU evicts old images, releases their frame references and reloads only on demand', async () => {
  const requests = [], data = manifest(Object.fromEntries(['one', 'two', 'three'].map(id => [id, asset({ src: prefix + id + '.png' })])));
  const bank = createAlien3SpriteBankV115(data, { imageFactory: factory({ requests }), maxCachedImages: 2, maxDecodedBytes: 160000 });
  await bank.request('one'); await bank.request('two');
  assert.equal(bank.get('one').state, 'ready');
  await bank.request('three');
  assert.equal(bank.status('two').state, 'unrequested');
  assert.equal(bank.status('two').reason, 'cache-evicted');
  assert.equal(bank.report().cachedImages, 2);
  assert.equal(bank.report().estimatedRgbaBytes, 160000);
  assert.equal(bank.report().cacheEvictions, 1);
  await bank.request('two');
  assert.equal(bank.status('two').state, 'ready');
  assert.equal(requests.filter(path => path.endsWith('/two.png')).length, 2);
  bank.dispose(); assert.equal(bank.report().cachedImages, 0);
});

test('disposing one bank settles pending requests without cancelling another instance', async () => {
  const pending = [];
  const data = manifest({ one: asset(), two: asset({ src: prefix + 'two.png' }) });
  const first = createAlien3SpriteBankV115(data, { maxConcurrentImages: 1, imageFactory: () => ({
    naturalWidth: 100, naturalHeight: 200, set src(value) { if (value) pending.push(this); }
  }) });
  const second = await loaded(data);
  first.preload(['one', 'two']);
  assert.equal(pending.length, 1);
  first.dispose(); await first.ready;
  assert.equal(first.report().disposed, true); assert.equal(first.report().cachedImages, 0);
  assert.equal(first.report().activeImageLoads, 0); assert.equal(first.report().queuedImageLoads, 0);
  assert.equal(first.get('one'), null); assert.equal(pending.length, 1, 'Queued image was never started after disposal');
  assert.equal(drawAlien3SpriteV115(context(), second, 'one', { x: 0, y: 0 }).drawn, true);
  second.dispose();
});

test('a requested timeout settles to fallback and is not retried on every draw', async () => {
  let started = 0;
  const bank = createAlien3SpriteBankV115(manifest(), { loadTimeoutMs: 5, imageFactory: () => ({
    set src(value) { if (value) started++; }
  }) });
  await bank.request('ripley-prison-idle');
  assert.equal(bank.status('ripley-prison-idle').reason, 'image-timeout');
  for (let i = 0; i < 20; i++) assert.equal(drawAlien3SpriteV115(context(), bank, 'ripley-prison-idle', { x: 0, y: 0 }).drawn, false);
  assert.equal(started, 1); bank.dispose();
});

test('pixel pivot, depth scale and native-facing mirror preserve the world anchor', async () => {
  const bank = await loaded(manifest({ left: asset({ facing: 'left' }) }));
  const c = context();
  const receipt = drawAlien3SpriteV115(c, bank, 'left', { x: 300, y: 510, depthScale: .96, facing: 1 });
  assert.equal(receipt.drawn, true);
  assert.deepEqual(c.calls[0], ['translate', 300, 510]);
  assert.deepEqual(c.calls[1], ['scale', -.96, .96]);
  assert.deepEqual(receipt.destination, { x: -20, y: -90, w: 50, h: 100 });
  assert.equal(c.stack.length, 0);
});

test('static and repeated idle frames cannot masquerade as a walking animation', async () => {
  const bank = await loaded(manifest({ idle: asset(), repeated: asset({ fps: 6,
    frames: [asset().frame, asset().frame] }) }));
  for (const id of ['idle', 'repeated']) {
    const c = context(), receipt = drawAlien3SpriteV115(c, bank, id, { x: 0, y: 0, requireAnimation: true });
    assert.equal(receipt.reason, 'animation-unavailable'); assert.equal(c.calls.length, 0);
  }
});

test('movement selects dedicated poses and unknown inmates never borrow a Ripley sprite', () => {
  const at = (actor, options) => selectAlien3HumanSpriteV115('ripley', actor, options).id;
  assert.equal(at({}, { phase: 'wreckage' }), 'ripley-crash-idle');
  assert.equal(at({}, { phase: 'shore' }), 'ripley-coat-idle');
  assert.equal(at({ vx: 100 }, { phase: 'infirmary' }), 'ripley-prison-walk');
  assert.equal(at({ vx: 270 }, { phase: 'infirmary' }), 'ripley-prison-run');
  assert.equal(at({ crouching: true }, {}), 'ripley-prison-crouch');
  assert.equal(at({ climbing: true, vx: 100 }, {}), 'ripley-prison-climb');
  assert.equal(at({ grounded: false, vy: -100 }, {}), 'ripley-prison-jump');
  assert.equal(at({ grounded: false, vy: 0, vx: 100 }, {}), 'ripley-prison-jump');
  assert.equal(at({ grounded: false, vy: .1, crouching: true }, {}), 'ripley-prison-jump');
  assert.equal(at({ grounded: true, vy: 0, vx: 100 }, {}), 'ripley-prison-walk');
  assert.equal(at({ v52HurtClock: .2 }, {}), 'ripley-prison-hurt');
  assert.equal(at({ downed: true, v52HurtClock: .42, shockClock: .2 }, {}), 'ripley-prison-downed');
  assert.equal(at({ interactionClock: .2 }, {}), 'ripley-prison-interact');
  assert.equal(selectAlien3HumanSpriteV115('david', {}, {}).id, 'david-idle');
  assert.equal(selectAlien3RunnerSpriteV115({ moving: true }, null).id, 'runner-walk');
  assert.equal(selectAlien3RunnerSpriteV115({}, { mode: 'windup' }).id, 'runner-windup');
});

test('reduced motion freezes an admitted loop and context is restored on image failure', async () => {
  const bank = await loaded(manifest({ walk: asset({ fps: 6, frames: [asset().frame,
    { ...asset().frame, src: prefix + 'fixture-b.png' }] }) }));
  const c = context();
  assert.equal(drawAlien3SpriteV115(c, bank, 'walk', { x: 0, y: 0, time: .2 }).frameIndex, 1);
  assert.equal(drawAlien3SpriteV115(c, bank, 'walk', { x: 0, y: 0, time: .2, reducedMotion: true }).frameIndex, 0);
  const bad = context({ failDraw: true });
  assert.equal(drawAlien3SpriteV115(bad, bank, 'walk', { x: 0, y: 0 }).reason, 'draw-image');
  assert.equal(bad.stack.length, 0);
});

test('only Ripley reads an active operation and higher priority physical states keep their pose', () => {
  const context = { phase: 'infirmary', encounter: 'rabattage', operationActive: true };
  const actor = { grounded: true, vx: 0, vy: 0 };
  const before = structuredClone(actor);
  assert.equal(selectAlien3HumanSpriteV115('ripley', actor, context).id, 'ripley-prison-interact');
  assert.equal(selectAlien3HumanSpriteV115('ripley', actor, { ...context, operationActive: false }).id, 'ripley-prison-idle');
  assert.equal(selectAlien3HumanSpriteV115('ripley', actor, { ...context, operationActive: 'true' }).id, 'ripley-prison-idle');
  assert.equal(selectAlien3HumanSpriteV115('dillon', actor, context).id, 'dillon-idle');
  for (const [changes, pose] of [
    [{ v52HurtClock: .2 }, 'hurt'], [{ downed: true }, 'downed'],
    [{ climbing: true }, 'climb'], [{ grounded: false, vy: 0 }, 'jump'],
    [{ crouching: true }, 'crouch'], [{ vx: 105, moving: true }, 'walk']
  ]) assert.equal(selectAlien3HumanSpriteV115('ripley', { ...actor, ...changes }, context).pose, pose);
  assert.deepEqual(actor, before, 'Pose selection does not add a timer or change the actor');
});

function native() {
  const host = hostV136();
  const engine = new GameEngine(host.canvas, { onEvent() {} });
  const campaign = CAMPAIGNS.find((c) => c.id === 'special-alien3-fiorina-161');
  const world = WORLDS.find((w) => w.id === campaign.worldId) || WORLDS[0];
  const missionLevel = buildFiorinaMissionV114({ campaign, world, levelSeeds: LEVEL_SEEDS, seed: 114 });
  const options = { campaign, world, missionLevel, levelSeed: missionLevel.levelSeed,
    weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [], seed: 114 };
  engine.start(options);
  return { engine, context: host.canvas.getContext('2d'), options };
}

test('wreckage controls reach crash jump, crouch, crouch-walk and the authored ladder without advancing the story', () => {
  const selection = engine => selectAlien3HumanSpriteV115('ripley', engine.player,
    { phase: engine.alien3V88.phase, encounter: engine.alien3EncounterV105 }).id;
  const held = (engine, code, pressed) => engine.setHeldGameplayKeyV77(code, pressed, 'sprite-reachability-fixture');
  const reach = (engine, x) => {
    let airborne = false;
    held(engine, 'KeyD', true);
    for (let frame = 0; frame < 400 && engine.player.x < x; frame++) {
      // The coast cover is a low physical obstacle, not a story gate. Use
      // the existing jump input owner; never relocate or pose the actor.
      held(engine, 'Space', engine.player.x > 500 && engine.player.grounded);
      engine.update(1 / 60);
      airborne ||= selection(engine) === 'ripley-crash-jump';
    }
    engine.clearGameplayInput();
    assert.ok(engine.player.x >= x, 'Native movement must reach the requested authored location');
    assert.equal(engine.alien3V88.phase, 'wreckage');
    assert.equal(engine.alien3V88.crashRecorderRead, false);
    assert.equal(airborne, true, 'An actual input-driven jump selects the arrival outfit');
  };
  const first = native().engine;
  try {
    reach(first, 800);
    for (let frame = 0; frame < 55; frame++) first.update(1 / 60);
    assert.equal(first.alien3V97.hybrid.mode, 'side');
    held(first, 'KeyZ', true); first.update(1 / 60);
    assert.equal(selection(first), 'ripley-crash-crouch');
    held(first, 'KeyD', true);
    for (let frame = 0; frame < 15; frame++) first.update(1 / 60);
    assert.equal(selection(first), 'ripley-crash-crouch-walk');
    assert.equal(first.alien3V88.phase, 'wreckage');
  } finally { first.stop(); }
  const second = native().engine;
  try {
    reach(second, 675);
    held(second, 'KeyW', true);
    for (let frame = 0; frame < 30 && !second.player.climbing; frame++) second.update(1 / 60);
    assert.equal(second.player.ladderId, 'f161-e89');
    assert.equal(selection(second), 'ripley-crash-climb');
    assert.equal(second.alien3V88.phase, 'wreckage');
  } finally { second.stop(); }
});

test('the native player renders a real sustained operation and returns to idle when its owner cancels', async () => {
  const { engine, context: c } = native();
  try {
    assert.equal(engine.beginAlien3EncounterV105('traque'), true);
    const placeAt = (key) => {
      const station = stationV105(engine.alien3NavV105, key);
      Object.assign(engine.player, { x: station.x + station.w / 2 - engine.player.w / 2,
        y: station.y + station.h - engine.player.h, depth: 1, moving: false, vx: 0, vy: 0,
        grounded: true, climbing: false, crouching: false, v52HurtClock: 0, shockClock: 0 });
      engine.camera.x = Math.max(0, engine.player.x - 300);
      engine.camera.y = 0;
    };
    placeAt('aaron');
    engine.interact(engine.player);
    assert.equal(engine.alien3EncounterV105.stage, 1, 'Existing Aaron interaction owns progression');
    placeAt('report');
    engine.keys.add('KeyE');
    engine.interact(engine.player);
    assert.equal(engine.alien3OperationsV107.active?.id, 'report', 'Existing operation owner accepted reach and support');
    const bank = engine.registerAlien3SpriteManifestV115(manifest({ 'ripley-prison-interact': asset(),
      'ripley-prison-idle': asset() }), { imageFactory: factory(), preloadAll: true });
    await bank.ready;
    const before = JSON.stringify({ player: engine.player, operation: engine.alien3OperationsV107,
      saved: engine.captureResumeState() });
    engine.drawActor(c, engine.player);
    assert.equal(engine.getAlien3SpriteReportV115().receipts.ripley.id, 'ripley-prison-interact');
    assert.equal(engine.getAlien3SpriteReportV115().receipts.ripley.drawn, true);
    assert.equal(JSON.stringify({ player: engine.player, operation: engine.alien3OperationsV107,
      saved: engine.captureResumeState() }), before, 'Drawing must not complete or advance the operation');
    assert.equal(engine.cancelAlien3OperationV107('release', false), true);
    engine.drawActor(c, engine.player);
    assert.equal(engine.getAlien3SpriteReportV115().receipts.ripley.id, 'ripley-prison-idle');
    assert.equal(engine.getAlien3SpriteReportV115().receipts.ripley.drawn, true);
    assert.equal(engine.alien3EncounterV105.stage, 1, 'Cancelled rendering does not validate the document');
  } finally { engine.stop(); }
});

test('native visibility gates requests and stop/campaign transitions dispose the instance bank', async () => {
  const { engine, context: c, options } = native();
  try {
    const requests = [];
    const bank = engine.registerAlien3SpriteManifestV115(manifest({ 'dillon-idle': asset() }), { imageFactory: factory({ requests }) });
    const actor = { id: 'dillon', alive: true, grounded: true, x: 10000, y: 400, w: 36, h: 90 };
    assert.equal(engine.tryAlien3HumanSpriteV115(c, actor), false);
    assert.equal(requests.length, 0, 'Offscreen roster did not decode its PNG');
    actor.x = engine.camera.x + 200;
    assert.equal(engine.tryAlien3HumanSpriteV115(c, actor), false);
    await bank.ready;
    assert.equal(engine.tryAlien3HumanSpriteV115(c, actor), true);
    const other = CAMPAIGNS.find(campaign => campaign.id !== options.campaign.id);
    const world = WORLDS.find(world => world.id === other.worldId) || WORLDS[0];
    engine.start({ ...options, campaign: other, world, missionLevel: undefined, levelSeed: LEVEL_SEEDS[0] });
    assert.equal(bank.report().disposed, true); assert.equal(engine.alien3SpriteBankV115, null);
    assert.equal(engine.isAlien3ProductionV114(), false);
    engine.start(options);
    const next = engine.registerAlien3SpriteManifestV115(manifest(), { imageFactory: factory() });
    await next.request('ripley-prison-idle'); engine.stop();
    assert.equal(next.report().disposed, true); assert.equal(next.report().cachedImages, 0);
  } finally { engine.stop(); }
});

test('new catalogue images cannot revive deceased prisoners or turn inspection shells into native rooms', async () => {
  const { engine, context: c } = native();
  try {
    const requests = [];
    const ids = ['murphy-idle', 'boggs-idle', 'rains-idle', 'spike-idle', 'ox-assembly-idle'];
    const bank = engine.registerAlien3SpriteManifestV115(manifest(Object.fromEntries(ids.map(id => [id, asset()]))),
      { imageFactory: factory({ requests }) });
    engine.alien3V88.phase = 'trap-prep';
    engine.syncAlien3PrisonerRosterV89();
    for (const id of ['murphy', 'boggs', 'rains']) {
      assert.equal(engine.alien3PrisonersV89.find(actor => actor.id === id)?.status, 'deceased');
    }
    engine.drawAlien3PrisonersV89(c);
    for (const id of ['murphy', 'boggs', 'rains']) assert.equal(engine.getAlien3SpriteReportV115().receipts[id], undefined);
    assert.equal(engine.setAlien3InspectionRoomV114('dog-kennel'), false);
    assert.equal(engine.setAlien3InspectionRoomV114('ox-approach'), false);
    assert.equal(requests.length, 0, 'Catalogue-only actors are not requested by the native render loop');
    assert.equal(bank.report().cachedImages, 0);
  } finally { engine.stop(); }
});

test('the downed player pose draws without admitting dead NPCs or altering incapacity', async () => {
  const { engine, context: c } = native();
  try {
    const bank = engine.registerAlien3SpriteManifestV115(manifest({
      'ripley-prison-downed': asset({ state: 'downed' }),
      'dillon-downed': asset({ state: 'downed' })
    }), { imageFactory: factory(), preloadAll: true });
    await bank.ready;
    engine.alien3V88.phase = 'infirmary';
    engine.damagePlayer(engine.player, 10000, { source: 'incapacity-render-fixture' });
    assert.equal(engine.player.alive, false);
    assert.equal(engine.player.downed, true);
    assert.ok(engine.player.v52HurtClock > 0, 'The fatal hit retains its real hurt timer');
    const before = JSON.stringify({ actor: engine.player, saved: engine.captureResumeState() });
    engine.drawActor(c, engine.player);
    assert.equal(engine.getAlien3SpriteReportV115().receipts.ripley?.id, 'ripley-prison-downed');
    assert.equal(engine.getAlien3SpriteReportV115().receipts.ripley?.drawn, true);
    assert.equal(JSON.stringify({ actor: engine.player, saved: engine.captureResumeState() }), before);
    const dead = { ...engine.player, id: 'dillon' };
    assert.equal(engine.tryAlien3HumanSpriteV115(c, dead, 'dillon'), false);
    assert.equal(engine.tryAlien3HumanSpriteV115(c, dead, 'ripley'), false, 'An identity label cannot impersonate the player object');
    engine.player.downed = false;
    assert.equal(engine.tryAlien3HumanSpriteV115(c, engine.player, 'ripley'), false, 'Only explicit incapacity gets the exception');
  } finally { engine.stop(); }
});

test('the existing flare socket requests and draws its lit PNG only during the authored fire state', async () => {
  const { engine, context: c } = native();
  try {
    const prop = compileEvidencePropsV113(engine.alien3SceneV103).find(item => item.id === 'fire-flare-v113');
    assert.equal(prop?.nodeId, 'f161-chemical-store'); assert.equal(prop.condition, 'fire');
    engine.camera.x = prop.x - 300;
    const requests = [];
    const bank = engine.registerAlien3SpriteManifestV115(manifest({ 'fire-flare': asset() }),
      { imageFactory: factory({ requests }) });
    engine.drawAlien3FidelitySceneryV113(c, engine.alien3SceneV103, { flags: {}, time: 0 });
    assert.equal(requests.length, 0, 'The unlit scene does not load an optional lit prop');
    assert.equal(engine.getAlien3SpriteReportV115().receipts[prop.id], undefined);
    engine.drawAlien3FidelitySceneryV113(c, engine.alien3SceneV103, { flags: { fire: true }, time: 0 });
    await bank.ready;
    const before = JSON.stringify(engine.captureResumeState());
    engine.drawAlien3FidelitySceneryV113(c, engine.alien3SceneV103, { flags: { fire: true }, time: 0 });
    assert.equal(engine.getAlien3SpriteReportV115().receipts[prop.id]?.drawn, true);
    assert.equal(engine.getAlien3SpriteReportV115().receipts[prop.id]?.id, 'fire-flare');
    assert.equal(JSON.stringify(engine.captureResumeState()), before);
    engine.alien3SpriteReceiptsV115.clear();
    engine.drawAlien3FidelitySceneryV113(c, engine.alien3SceneV103, { flags: { fire: false }, time: 0 });
    assert.equal(engine.getAlien3SpriteReportV115().receipts[prop.id], undefined, 'A decoded flame still stays hidden without fire');
  } finally { engine.stop(); }
});

test('native production draws the correct sprite without changing the saved actor or campaign state', async () => {
  const { engine, context: c } = native();
  try {
    // The host does not run the physics RAF; establish a grounded idle fixture.
    Object.assign(engine.player, { grounded: true, vy: 0, vx: 0 });
    const before = JSON.stringify(engine.captureResumeState());
    const bank = engine.registerAlien3SpriteManifestV115(manifest({ 'ripley-crash-idle': asset(), 'runner-prowl': asset() }),
      { imageFactory: factory(), loadTimeoutMs: 50, preloadAll: true });
    await bank.ready; await Promise.resolve();
    assert.equal(engine.alien3SpriteBankV115, bank, 'Pending default manifest load must not replace explicit QA bank');
    const drawings = [];
    c.drawImage = (...args) => drawings.push(args);
    engine.drawActor(c, engine.player);
    assert.equal(engine.getAlien3SpriteReportV115().receipts.ripley.drawn, true);
    assert.equal(drawings.filter((a) => a[0] === bank.get('ripley-crash-idle').image).length, 1);
    assert.equal(JSON.stringify(engine.captureResumeState()), before, 'Raster rendering must not mutate resumable state');
    engine.alien3RunnerV88.alien3DormantV88 = true;
    drawings.length = 0;
    engine.drawEnemy(c, engine.alien3RunnerV88);
    assert.equal(drawings.filter((a) => a[0] === bank.get('runner-prowl').image).length, 0, 'Sprites must not reveal the dormant Runner');
  } finally { engine.stop(); }
});

test('a loaded idle sprite yields to native procedural locomotion and remains isolated from other campaigns', async () => {
  const { engine, context: c } = native();
  try {
    const bank = engine.registerAlien3SpriteManifestV115(manifest({ 'ripley-crash-idle': asset() }),
      { imageFactory: factory(), loadTimeoutMs: 50, preloadAll: true });
    await bank.ready;
    const movingActor = { ...engine.player, grounded: true, vx: 100, moving: true };
    assert.equal(engine.tryAlien3HumanSpriteV115(c, movingActor, 'ripley'), false);
    assert.equal(engine.getAlien3SpriteReportV115().receipts.ripley.reason, 'asset-unavailable');
    engine.alien3ProductionActiveV114 = false;
    assert.equal(engine.tryAlien3HumanSpriteV115(c, engine.player, 'ripley'), false);
  } finally { engine.stop(); }
});
