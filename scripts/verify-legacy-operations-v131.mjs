import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content-core-v50.js';
import { buildLegacyMissionV131, withLegacyMissionsV131, LEGACY_CAMPAIGNS_V131 } from '../src/legacy-operations-v131.js';
import { LEGACY_STATIONS_V131, createLegacyOperationStateV131, validateLegacyOperationStateV131 } from '../src/legacy-operation-state-v131.js';
import { beginOperation, createDefaultSave, recordOperationResumeState, resolveOperation, migrateSave } from '../src/save.js';

// The shipped engine, combat, collision and real raster files are used. Only
// browser host APIs are supplied here. No production progression is mocked.
const dimensions = new Map();
function host() {
  const window = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = window[name].bind(window);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(path) {
      this._src = path; let size = dimensions.get(path);
      if (!size) try {
        const bytes = readFileSync(new URL(`..${new URL(path, 'http://qa.invalid').pathname}`, import.meta.url));
        if (bytes.subarray(1, 4).toString() === 'PNG') size = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
        else if (bytes.subarray(0, 4).toString() === 'RIFF') {
          for (let offset = 12; offset + 8 < bytes.length;) {
            const chunk = bytes.subarray(offset, offset + 4).toString(), length = bytes.readUInt32LE(offset + 4), data = offset + 8;
            if (chunk === 'VP8X') size = [bytes.readUIntLE(data + 4, 3) + 1, bytes.readUIntLE(data + 7, 3) + 1];
            if (chunk === 'VP8L' && bytes[data] === 0x2f) { const packed = bytes.readUInt32LE(data + 1); size = [(packed & 0x3fff) + 1, (packed >>> 14 & 0x3fff) + 1]; }
            if (chunk === 'VP8 ' && bytes.subarray(data + 3, data + 6).equals(Buffer.from([0x9d, 0x01, 0x2a]))) size = [bytes.readUInt16LE(data + 6) & 0x3fff, bytes.readUInt16LE(data + 8) & 0x3fff];
            if (size) break; offset = data + length + (length & 1);
          }
        }
        if (size) dimensions.set(path, size);
      } catch {}
      this.naturalWidth = size?.[0] || 0; this.naturalHeight = size?.[1] || 0;
      queueMicrotask(() => { const event = new Event(size ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); });
    }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw Error('Missing shipped bitmap'); }
  };
  const text = [], drawings = [], stack = [], gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1, save() { stack.push(this.globalAlpha); }, restore() { assert.ok(stack.length); this.globalAlpha = stack.pop(); },
    fillText(value) { text.push(String(value)); }, drawImage(image, ...args) { assert.ok(image.naturalWidth); drawings.push({ path: image.src, args }); },
    measureText: value => ({ width: String(value).length * 7 }), createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) }, { get: (target, property) => property in target ? target[property] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const key = (type, code) => { const event = new Event(type, { cancelable: true }); Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false, isComposing: false }); window.dispatchEvent(event); };
  return { canvas, ctx, text, drawings, stack, key };
}
async function fixture(kind = 'nostromo', resumeState = null) {
  const browser = host(), events = [], campaign = LEGACY_CAMPAIGNS_V131.find(entry => entry.kind === kind);
  assert.ok(campaign);
  const options = { campaign, world: WORLDS.find(entry => entry.id === campaign.worldId), weapon: WEAPONS[0], enemyCatalog: ENEMIES,
    equipment: [], crew: [], seed: 131, resumeState };
  options.missionLevel = buildLegacyMissionV131({ ...options, levelSeeds: LEVEL_SEEDS });
  const engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) }); engine.start(options);
  for (let n = 0; n < 40; n++) await Promise.resolve();
  assert.equal(engine.enemyAtlasLoadingPausedV65, false);
  return { ...browser, engine, events, options };
}
function tick(engine, seconds, rate = 60) { for (let left = seconds; left > 1e-9;) { const dt = Math.min(left, 1 / rate); engine.update(dt); left -= dt; } }
function atStation(engine, index = engine.legacyMissionV131.stage) {
  // Direct placement is a proximity unit fixture, never a progress assignment.
  const station = LEGACY_STATIONS_V131[engine.legacyMissionV131.kind][index], actor = engine.legacyMissionV131.aboard ? engine.vehicle : engine.player;
  actor.x = station.x - actor.w / 2; actor.y = station.y - actor.h / 2;
  if (engine.legacyMissionV131.aboard) engine.pinLegacyDriverV131();
  return station;
}
function hold(engine, seconds) { engine.keys.add('KeyE'); tick(engine, seconds + 0.04); engine.keys.delete('KeyE'); }
async function prepareEnemies(engine) {
  for (let n = 0; n < 8; n++) await Promise.resolve();
  await Promise.all((engine.getVisibleEnemyAtlasSheetsV65?.() || []).map(sheet => engine.ensureEnemyAtlas(sheet)));
  for (let n = 0; n < 8; n++) await Promise.resolve(); engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.enemyAtlasLoadingPausedV65, false, 'Visible encounter assets load from their shipped bytes.');
}
async function fight(engine, seconds, targetRole) {
  await prepareEnemies(engine);
  engine.keys.add('KeyF');
  for (let n = 0; n < seconds * 60 && engine.mission.state === 'active'; n++) {
    const target = engine.enemies.find(actor => actor.alive && (!targetRole || actor.legacyRoleV131 === targetRole));
    if (!target) break;
    engine.player.pointerAimV83 = { x: target.x + target.w / 2 - engine.player.x - engine.player.w / 2,
      y: target.y + target.h / 2 - engine.player.y - engine.player.h * 0.4 };
    const length = Math.hypot(engine.player.pointerAimV83.x, engine.player.pointerAimV83.y);
    engine.player.pointerAimV83.x /= length; engine.player.pointerAimV83.y /= length;
    engine.update(1 / 60);
  }
  engine.keys.delete('KeyF'); engine.player.pointerAimV83 = null;
}
function steer(subject, point, seconds = 20) {
  const { engine: e, key } = subject, held = new Set();
  for (let frame = 0; frame < seconds * 60 && e.mission.state === 'active'; frame++) {
    const body = e.legacyMissionV131.aboard ? e.vehicle : e.player, x = body.x + body.w / 2, y = body.y + body.h / 2;
    const next = new Set();
    if (Math.abs(point.x - x) > 14) next.add(point.x > x ? 'KeyD' : 'KeyA');
    if (Math.abs(point.y - y) > 14) next.add(point.y > y ? 'KeyS' : 'KeyW');
    for (const code of held) if (!next.has(code)) { key('keyup', code); held.delete(code); }
    for (const code of next) if (!held.has(code)) { key('keydown', code); held.add(code); }
    if (!next.size) break;
    e.update(1 / 60);
  }
  for (const code of held) key('keyup', code);
  const body = e.legacyMissionV131.aboard ? e.vehicle : e.player;
  assert.ok(Math.hypot(body.x + body.w / 2 - point.x, body.y + body.h / 2 - point.y) < 25,
    `Input route blocked: ${JSON.stringify({ kind: e.legacyMissionV131.kind, target: point, body: { x: body.x, y: body.y }, reason: e.mission.failureReason })}`);
}
function keyboardHold(subject, seconds) { subject.key('keydown', 'KeyE'); tick(subject.engine, seconds + 0.04); subject.key('keyup', 'KeyE'); }

test('three admitted partial chapters build their own stations; wrong builders fail; mixin is idempotent', async () => {
  assert.equal(withLegacyMissionsV131(GameEngine), GameEngine);
  for (const campaign of LEGACY_CAMPAIGNS_V131) {
    const { engine: e, options } = await fixture(campaign.kind);
    assert.equal(campaign.status, 'partial'); assert.equal(campaign.playable, true);
    assert.equal(options.missionLevel.legacyMissionV131.validation.valid, true);
    assert.equal(e.legacyMissionV131.stage, 0); assert.equal(e.completeMission(), false);
    assert.equal(validateLegacyOperationStateV131(e.captureResumeState().specialOperation.legacyMissionV131).valid, true);
    assert.throws(() => e.start({ ...options, missionLevel: { ...options.missionLevel, legacyMissionV131: null } }), /require/);
  }
});
test('pause, loading, input admission and interrupted holds freeze or reset without advancing', async () => {
  for (const kind of ['nostromo', 'abyss', 'broodstorm']) {
    const { engine: e } = await fixture(kind); atStation(e); e.keys.add('KeyE'); tick(e, 0.5);
    const elapsed = e.legacyMissionV131.elapsed, progress = e.legacyMissionV131.hold;
    e.paused = true; tick(e, 5); assert.equal(e.legacyMissionV131.elapsed, elapsed); assert.equal(e.legacyMissionV131.hold, progress);
    assert.equal(e.interact(), false); assert.equal(e.dropLegacyBombV131(), false); e.paused = false;
    e.enemyAtlasLoadingPausedV65 = true; tick(e, 3); assert.equal(e.legacyMissionV131.hold, progress); e.enemyAtlasLoadingPausedV65 = false;
    e.keys.delete('KeyE'); e.update(1 / 60); assert.equal(e.legacyMissionV131.hold, 0);
    e.player.reloading = true; e.keys.add('KeyE'); tick(e, 1); assert.equal(e.legacyMissionV131.stage, 0);
  }
});
test('save identity and forged chronologies reject atomically, including malformed checkpoint', async () => {
  for (const kind of ['nostromo', 'abyss', 'broodstorm']) {
    const { engine: e, options } = await fixture(kind), saved = JSON.parse(JSON.stringify(e.captureResumeState()));
    assert.equal(e.validateLegacyResumeV131(saved).valid, true);
    const restored = await fixture(kind, saved); assert.equal(restored.engine.lastResumeResult.applied, true);
    const baseline = JSON.stringify(e.captureResumeState());
    for (const mutate of [raw => raw.identity.campaignId = 'foreign', raw => raw.specialOperation.legacyMissionV131.stage = 4,
      raw => raw.specialOperation.legacyMissionV131.oxygen = NaN, raw => raw.specialOperation.legacyCheckpointV131.identity.seed++,
      raw => raw.missionLevel.signature += ':foreign', raw => raw.specialOperation.legacyMissionV131.complete = true]) {
      const invalid = structuredClone(saved); mutate(invalid); assert.equal(e.applyResumeState(invalid).applied, false);
      assert.equal(JSON.stringify(e.captureResumeState()), baseline, kind);
    }
    const wrongSeat = structuredClone(saved); wrongSeat.player.inVehicle = !saved.player.inVehicle;
    assert.equal(e.applyResumeState(wrongSeat).applied, false); assert.equal(JSON.stringify(e.captureResumeState()), baseline);
    if (kind !== 'nostromo') { const wrongVehicle = structuredClone(saved); wrongVehicle.vehicle.id = 'foreign-vehicle';
      assert.equal(e.applyResumeState(wrongVehicle).applied, false); assert.equal(JSON.stringify(e.captureResumeState()), baseline); }
    assert.equal(options.campaign.specialOperationId, e.legacyMissionV131.operationId);
  }
});
test('Nostromo gates collide before script milestones and canonical compatible costume renders from shipped atlas', async () => {
  const subject = await fixture(), e = subject.engine;
  e.keys.add('KeyD'); tick(e, 4); e.keys.clear(); assert.ok(e.player.x + e.player.w <= 720.01);
  for (let index = 0; index < 3; index++) { const station = atStation(e); hold(e, station.seconds); assert.equal(e.legacyMissionV131.stage, index + 1); }
  assert.equal(e.doors[0].open, true); assert.equal(e.doors[1].open, true); assert.equal(e.doors[2].open, false);
  assert.ok(e.enemies.some(enemy => enemy.legacyRoleV131 === 'hunt' && enemy.alive));
  atStation(e); hold(e, 3); assert.equal(e.legacyMissionV131.stage, 3, 'Chasse cannot be bypassed by terminal holding.');
  e.drawActor(subject.ctx, e.player); assert.ok(subject.drawings.some(draw => /nostromo/i.test(draw.path)), 'Existing dedicated adapted Nostromo costume was actually drawn.');
});
test('Nostromo real combat, hold sequence, return countdown and terminal event produce one valid isolated receipt', async () => {
  const { engine: e, events } = await fixture();
  for (let index = 0; index < 3; index++) { const station = atStation(e); hold(e, station.seconds); }
  const hunter = e.enemies[0]; e.player.x = hunter.x - 320; e.player.y = 570 - e.player.h;
  e.player.pointerAimV83 = { x: 1, y: 0 }; e.keys.add('KeyF'); tick(e, 5); e.keys.clear();
  assert.equal(hunter.alive, false, 'Real admitted bullets kill the hunter.');
  for (let index = 3; index < 6; index++) { const station = atStation(e); hold(e, station.seconds); assert.equal(e.legacyMissionV131.stage, index + 1); }
  const countdown = e.legacyMissionV131.countdown; e.paused = true; tick(e, 10); assert.equal(e.legacyMissionV131.countdown, countdown); e.paused = false;
  let terminalSave; const sink = e.onEvent; e.onEvent = event => { if (event.type === 'mission-complete') { terminalSave = e.captureResumeState(); assert.equal(e.validateLegacyResumeV131(terminalSave).valid, true); } sink(event); };
  const station = atStation(e); hold(e, station.seconds); assert.equal(e.mission.state, 'complete');
  assert.ok(terminalSave); assert.equal(e.completeMission(), false); assert.equal(events.filter(event => event.type === 'mission-complete').length, 1);
  assert.equal(terminalSave.specialOperation.operationId, 'mire-archive-001'); assert.equal(terminalSave.specialOperation.legacyMissionV131.status, undefined);
  const resumed = await fixture('nostromo', terminalSave); assert.equal(resumed.engine.lastResumeResult.applied, true); assert.equal(resumed.engine.mission.state, 'complete');
});
test('Nostromo deadline actually fails and retry restores the authored checkpoint without queued hold', async () => {
  const { engine: e } = await fixture(); e.legacyMissionV131.countdown = 0.02;
  // Clock behavior is tested on a final-act fixture with real validated stage progression above.
  e.legacyMissionV131.stage = 6; e.update(0.04); assert.equal(e.mission.state, 'failed');
  assert.equal(e.restartFromCheckpoint(), true); assert.equal(e.legacyMissionV131.stage, 0); assert.equal(e.legacyMissionV131.hold, 0);
});
test('Abysse free swimming travels both axes at 30/60/144 Hz; pressure, air bells and modes have real effects', async () => {
  const outcomes = [];
  for (const rate of [30, 60, 144]) {
    const { engine: e } = await fixture('abyss'); e.player.x = 350; e.player.y = 300;
    const start = { x: e.player.x, y: e.player.y }; e.keys.add('KeyD'); e.keys.add('KeyS'); tick(e, 1, rate); e.keys.clear();
    assert.ok(e.player.x > start.x + 120 && e.player.y > start.y + 120); outcomes.push([e.player.x, e.player.y, e.legacyMissionV131.oxygen]);
    e.player.x = 1100; e.player.y = 780; tick(e, 2, rate); assert.ok(e.legacyMissionV131.pressure > 15);
    assert.equal(e.activateTracker(), true); assert.equal(e.legacyMissionV131.hadalMode, 'weighted'); const pressure = e.legacyMissionV131.pressure;
    tick(e, 1, rate); assert.ok(e.legacyMissionV131.pressure < pressure);
    e.player.x = 145; e.player.y = 110; const oxygen = e.legacyMissionV131.oxygen; tick(e, 1, rate); assert.ok(e.legacyMissionV131.oxygen > oxygen);
  }
  outcomes.forEach(outcome => outcome.forEach((value, index) => assert.ok(Math.abs(value - outcomes[0][index]) < 0.01)));
});
test('HADAL gating, MANTA boarding, two-axis collision and interrupted resume preserve resources', async () => {
  const { engine: e, key } = await fixture('abyss');
  e.player.x = e.vehicle.x - 45; e.player.y = e.vehicle.y; key('keydown', 'KeyE'); e.update(1 / 60); key('keyup', 'KeyE');
  assert.equal(e.legacyMissionV131.aboard, true, 'Keyboard E does not toggle twice.');
  const y = e.vehicle.y; e.keys.add('KeyS'); tick(e, 1); e.keys.clear(); assert.ok(e.vehicle.y > y + 200);
  assert.equal(e.toggleVehicle(), true); assert.equal(e.player.inVehicle, false);
  for (let index = 0; index < 3; index++) { const station = atStation(e); hold(e, station.seconds); assert.equal(e.legacyMissionV131.stage, index + 1); }
  atStation(e); hold(e, 3.1); assert.equal(e.legacyMissionV131.stage, 3);
  e.activateTracker(); const station = atStation(e); hold(e, station.seconds); assert.equal(e.legacyMissionV131.stage, 4);
  assert.equal(e.doors[0].open, true); assert.ok(e.enemies.some(enemy => enemy.legacyRoleV131 === 'predator'));
  const raw = e.captureResumeState(); assert.equal(e.validateLegacyResumeV131(raw).valid, true);
  const oxygen = e.legacyMissionV131.oxygen; e.applyResumeState(raw); assert.equal(e.legacyMissionV131.oxygen, oxygen); assert.equal(e.legacyMissionV131.hold, 0);
});
test('BROODSTORM finite bombs hit actual nests, cliffs block them, director and ally fire protect actual escort', async () => {
  const { engine: e, ctx, drawings, text } = await fixture('broodstorm'); const station = atStation(e); hold(e, station.seconds);
  assert.equal(e.legacyMissionV131.stage, 1); e.vehicle.x = 820; e.vehicle.y = 590; e.pinLegacyDriverV131();
  for (let n = 0; n < 2; n++) { assert.equal(e.dropLegacyBombV131(), true); tick(e, 1.2); }
  assert.equal(e.legacyMissionV131.nests[0], 0); e.vehicle.x = 1420;
  for (let n = 0; n < 2; n++) { assert.equal(e.dropLegacyBombV131(), true); tick(e, 1.2); }
  assert.equal(e.legacyMissionV131.nests[1], 0); assert.equal(e.legacyMissionV131.stage, 2); assert.equal(e.legacyMissionV131.bombs, 2);
  assert.ok(e.legacyMissionV131.wave >= 1); const escortX = e.legacyMissionV131.escort.x;
  e.vehicle.x = 2650; tick(e, 1); assert.equal(e.legacyMissionV131.escort.x, escortX, 'Abandoned escort waits.');
  e.vehicle.x = e.legacyMissionV131.escort.x; tick(e, 1); assert.ok(e.legacyMissionV131.escort.x > escortX);
  assert.equal(e.activateTracker(), true); assert.equal(e.legacyMissionV131.wingMode, 'suppress');
  e.drawWorld(ctx); e.drawHud(ctx); assert.ok(drawings.some(draw => /dropship/i.test(draw.path))); assert.ok(text.some(line => /ADAPTATION|adaptation/.test(line)));
  const saved = e.captureResumeState(); assert.equal(e.validateLegacyResumeV131(saved).valid, true); assert.equal(e.applyResumeState(saved).applied, true);
});
test('resources create actual failure; dead pilot, oxygen, escort and battery never produce success', async () => {
  for (const [kind, mutate] of [['abyss', e => { e.legacyMissionV131.oxygen = 0; e.player.x = 500; e.player.y = 600; }],
    ['abyss', e => { e.toggleVehicle(); e.legacyMissionV131.aboard = true; e.legacyMissionV131.battery = 0; }],
    ['broodstorm', e => { e.legacyMissionV131.escort.hull = 0; }], ['nostromo', e => { e.player.alive = false; }]]) {
    const { engine: e } = await fixture(kind); mutate(e); e.update(1 / 60); assert.equal(e.mission.state, 'failed'); assert.equal(e.completeMission(), false);
  }
});
test('Abysse aquatic boss is fought with admitted bullets; returning physically commits a valid terminal save', async () => {
  const { engine: e, events } = await fixture('abyss');
  for (let index = 0; index < 3; index++) { const station = atStation(e); hold(e, station.seconds); }
  e.activateTracker(); const valve = atStation(e); hold(e, valve.seconds);
  assert.equal(e.legacyMissionV131.stage, 4); e.activateTracker(); e.activateTracker();
  const boss = e.enemies.find(actor => actor.legacyRoleV131 === 'predator');
  e.player.x = boss.x - 310; e.player.y = boss.y + boss.h / 2 - e.player.h / 2;
  await fight(e, 14, 'predator'); assert.equal(boss.alive, false); assert.equal(e.legacyMissionV131.stage, 5);
  let raw; const sink = e.onEvent; e.onEvent = event => { if (event.type === 'mission-complete') { raw = e.captureResumeState(); assert.equal(e.validateLegacyResumeV131(raw).valid, true); } sink(event); };
  const station = atStation(e); hold(e, station.seconds); assert.equal(e.mission.state, 'complete'); assert.ok(raw);
  assert.equal(events.filter(event => event.type === 'mission-complete').length, 1);
  const resumed = await fixture('abyss', raw); assert.equal(resumed.engine.lastResumeResult.applied, true);
});
test('BROODSTORM escort reaches its actual destination, FlyingQueen takes real damage, extraction validates synchronously', async () => {
  const { engine: e } = await fixture('broodstorm'); const launch = atStation(e); hold(e, launch.seconds); e.activateTracker();
  for (const x of [820, 1420]) {
    e.vehicle.x = x; e.vehicle.y = 590; e.pinLegacyDriverV131();
    for (let n = 0; n < 2; n++) { e.dropLegacyBombV131(); tick(e, 1.2); }
  }
  assert.equal(e.legacyMissionV131.stage, 2);
  // Follow the real moving escort with held controls, protecting it with the
  // same finite turret and wing rounds used by the production runtime.
  e.vehicle.x = e.legacyMissionV131.escort.x; e.vehicle.y = 290; e.pinLegacyDriverV131();
  e.keys.add('KeyF');
  for (let n = 0; n < 60 * 28 && e.legacyMissionV131.stage === 2 && e.mission.state === 'active'; n++) {
    const goal = e.legacyMissionV131.escort.x + 100;
    if (e.vehicle.x < goal - 10) e.keys.add('KeyD'); else e.keys.delete('KeyD');
    const target = e.enemies.find(actor => actor.alive);
    if (target) {
      const dx = target.x + target.w / 2 - e.player.x - e.player.w / 2, dy = target.y + target.h / 2 - e.player.y - e.player.h / 2;
      const length = Math.hypot(dx, dy); e.player.pointerAimV83 = { x: dx / length, y: dy / length };
    }
    e.update(1 / 60);
  }
  e.keys.clear(); e.player.pointerAimV83 = null;
  assert.equal(e.mission.state, 'active'); assert.equal(e.legacyMissionV131.stage, 3); assert.equal(e.legacyMissionV131.escort.x, 2110);
  const queen = e.enemies.find(actor => actor.legacyRoleV131 === 'queen'); assert.ok(queen.visualApproximation);
  e.vehicle.x = queen.x - 300; e.vehicle.y = queen.y; e.pinLegacyDriverV131(); await fight(e, 16, 'queen');
  assert.equal(queen.alive, false); assert.equal(e.legacyMissionV131.stage, 4);
  let raw; const sink = e.onEvent; e.onEvent = event => { if (event.type === 'mission-complete') { raw = e.captureResumeState(); assert.equal(e.validateLegacyResumeV131(raw).valid, true); } sink(event); };
  const station = atStation(e); hold(e, station.seconds); assert.equal(e.mission.state, 'complete'); assert.ok(raw);
  const resumed = await fixture('broodstorm', raw); assert.equal(resumed.engine.lastResumeResult.applied, true);
});
test('state validators reject forged success, duplicated contacts and unclaimed rewards', () => {
  for (const campaign of LEGACY_CAMPAIGNS_V131) {
    const state = createLegacyOperationStateV131(campaign.kind); assert.equal(validateLegacyOperationStateV131(state).valid, true);
    const forgery = { ...state, complete: true, rewardClaimed: true, rewards: { credits: 620, intel: 0, salvage: 0, operationId: state.operationId } };
    assert.equal(validateLegacyOperationStateV131(forgery).valid, false);
  }
});
test('free-swim keyboard route clears actual canyon passages, valve gate, aquatic boss and return bell', async () => {
  const subject = await fixture('abyss'), e = subject.engine;
  keyboardHold(subject, LEGACY_STATIONS_V131.abyss[0].seconds);
  steer(subject, { x: 510, y: 430 }); steer(subject, LEGACY_STATIONS_V131.abyss[1]); keyboardHold(subject, 2);
  assert.equal(e.legacyMissionV131.stage, 2); steer(subject, LEGACY_STATIONS_V131.abyss[2]); keyboardHold(subject, 3);
  assert.equal(e.legacyMissionV131.stage, 3);
  subject.key('keydown', 'KeyQ'); subject.key('keyup', 'KeyQ'); assert.equal(e.legacyMissionV131.hadalMode, 'weighted');
  steer(subject, { x: 1660, y: 765 }); steer(subject, LEGACY_STATIONS_V131.abyss[3]); keyboardHold(subject, 3);
  assert.equal(e.legacyMissionV131.stage, 4); const boss = e.enemies.find(actor => actor.legacyRoleV131 === 'predator');
  steer(subject, { x: 2050, y: 870 }); await fight(e, 15, 'predator'); assert.equal(boss.alive, false);
  subject.key('keydown', 'KeyQ'); subject.key('keyup', 'KeyQ'); subject.key('keydown', 'KeyQ'); subject.key('keyup', 'KeyQ');
  steer(subject, { x: 1650, y: 740 }); steer(subject, { x: 1160, y: 700 });
  steer(subject, { x: 950, y: 460 }); steer(subject, { x: 510, y: 430 }); steer(subject, LEGACY_STATIONS_V131.abyss[5]); keyboardHold(subject, 3);
  assert.equal(e.mission.state, 'complete'); assert.equal(e.validateLegacyResumeV131(e.captureResumeState()).valid, true);
});
test('magnetic HADAL attaches to an actual canyon wall; large steps cannot cross sealed volume gates', async () => {
  const { engine: e } = await fixture('abyss'); e.activateTracker(); e.activateTracker();
  e.player.x = 660 - e.player.w; e.player.y = 110; const y = e.player.y; tick(e, 0.5);
  assert.equal(e.player.y, y); assert.equal(e.player.magneticAttachedV131, true);
  e.activateTracker(); e.player.x = 1880; e.player.y = 400;
  e.keys.add('KeyD'); e.update(5); e.keys.clear(); assert.ok(e.player.x + e.player.w <= 1940);
  assert.deepEqual({ x: e.getDoorRenderState(e.doors[0]).x, w: e.getDoorRenderState(e.doors[0]).w }, { x: 1940, w: 34 });
});
test('spent bombardment cannot leave an unwinnable active chapter and retry restores issued resources', async () => {
  const { engine: e } = await fixture('broodstorm'); const launch = atStation(e); hold(e, launch.seconds);
  e.vehicle.x = 20; e.vehicle.y = 200;
  for (let n = 0; n < 6 && e.mission.state === 'active'; n++) { e.dropLegacyBombV131(); tick(e, 2.5); }
  assert.equal(e.mission.state, 'failed'); assert.match(e.mission.failureReason, /bombes/);
  assert.equal(e.restartFromCheckpoint(), true); assert.equal(e.legacyMissionV131.bombs, 6); assert.equal(e.legacyMissionV131.stage, 1);
});
test('BROODSTORM save migration preserves the final finite bomb in flight and its real collision after reload', async () => {
  const subject = await fixture('broodstorm'), e = subject.engine;
  keyboardHold(subject, 1.5);
  // Two legal missed drops leave exactly the four charges needed by the nests.
  e.vehicle.x = 20; e.vehicle.y = 200; e.pinLegacyDriverV131();
  for (let index = 0; index < 2; index++) { assert.equal(e.dropLegacyBombV131(), true); tick(e, 2.5); }
  for (const [x, drops] of [[820, 2], [1420, 1]]) {
    e.vehicle.x = x; e.vehicle.y = 590; e.pinLegacyDriverV131();
    for (let index = 0; index < drops; index++) { assert.equal(e.dropLegacyBombV131(), true); tick(e, 1.2); }
  }
  assert.deepEqual(e.legacyMissionV131.nests, [0, 70]); assert.equal(e.legacyMissionV131.bombs, 1);
  assert.equal(e.dropLegacyBombV131(), true); tick(e, 0.1);
  assert.equal(e.legacyMissionV131.bombs, 0); assert.equal(e.legacyBombsV131.length, 1);
  const expectedBomb = structuredClone(e.legacyBombsV131[0]);
  const save = createDefaultSave(); save.galaxy.unlockedWorldIds.push(subject.options.world.id);
  const deployment = beginOperation(save, subject.options.campaign, subject.options.world).operation;
  deployment.missionLevelSignature = subject.options.missionLevel.signature; deployment.levelSeedId = e.resumeIdentity.levelSeedId;
  assert.equal(recordOperationResumeState(save, e.captureResumeState()), true);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
  const resumed = await fixture('broodstorm', migrated.strategy.currentOperation.resumeState);
  assert.equal(resumed.engine.lastResumeResult.applied, true);
  assert.deepEqual(resumed.engine.legacyBombsV131, [expectedBomb]);
  assert.equal(resumed.engine.legacyMissionV131.bombs, 0, 'Reload never refunds a finite bomb.');
  resumed.engine.paused = true; tick(resumed.engine, 2);
  assert.deepEqual(resumed.engine.legacyBombsV131, [expectedBomb], 'Pause freezes the restored trajectory.');
  resumed.engine.paused = false; tick(resumed.engine, 1.2);
  assert.deepEqual(resumed.engine.legacyMissionV131.nests, [0, 0]);
  assert.equal(resumed.engine.legacyMissionV131.stage, 2);
  assert.equal(resumed.engine.mission.state, 'active', 'The restored charge actually strikes the remaining nest.');
  assert.equal(resumed.engine.legacyBombsV131.length, 0);
  const restored = resumed.engine;
  resumed.key('keydown', 'KeyQ'); resumed.key('keyup', 'KeyQ');
  steer(resumed, { x: restored.legacyMissionV131.escort.x + 110, y: 360 });
  for (let frame = 0; frame < 35 * 60 && restored.mission.state === 'active' && restored.legacyMissionV131.stage === 2; frame++) {
    const targetX = restored.legacyMissionV131.escort.x + 160;
    if (restored.vehicle.x + restored.vehicle.w / 2 < targetX - 12) restored.keys.add('KeyD'); else restored.keys.delete('KeyD');
    const enemy = restored.enemies.find(actor => actor.alive);
    if (enemy) {
      const dx = enemy.x + enemy.w / 2 - restored.player.x - restored.player.w / 2;
      const dy = enemy.y + enemy.h / 2 - restored.player.y - restored.player.h * 0.4;
      const distance = Math.hypot(dx, dy); restored.player.pointerAimV83 = { x: dx / distance, y: dy / distance };
      restored.keys.add('KeyF');
    }
    restored.update(1 / 60);
  }
  restored.keys.clear(); restored.player.pointerAimV83 = null;
  assert.equal(restored.mission.state, 'active'); assert.equal(restored.legacyMissionV131.stage, 3);
  await fight(restored, 20, 'queen'); assert.equal(restored.legacyMissionV131.stage, 4);
  steer(resumed, LEGACY_STATIONS_V131.broodstorm[4]); keyboardHold(resumed, 3);
  assert.equal(restored.mission.state, 'complete');
  assert.equal(restored.validateLegacyResumeV131(restored.captureResumeState()).valid, true);
  assert.equal(resumed.events.filter(event => event.type === 'mission-complete').length, 1);
  assert.equal(restored.legacyMissionV131.bombs, 0, 'Extraction preserves the exhausted finite payload.');
});
test('legacy flight checkpoints reject malformed charges atomically and keep older no-flight saves compatible', async () => {
  const subject = await fixture('broodstorm'), e = subject.engine;
  keyboardHold(subject, 1.5); e.vehicle.x = 820; e.vehicle.y = 590; e.pinLegacyDriverV131();
  assert.equal(e.dropLegacyBombV131(), true); tick(e, 0.1);
  const saved = e.captureResumeState(), before = JSON.stringify(saved);
  assert.equal(e.validateLegacyResumeV131(saved).valid, true);
  for (const mutate of [
    raw => { raw.specialOperation.legacyBombsV157 = {}; },
    raw => { raw.specialOperation.legacyBombsV157.push(structuredClone(raw.specialOperation.legacyBombsV157[0])); },
    raw => { raw.specialOperation.legacyBombsV157[0].w = 180; },
    raw => { raw.specialOperation.legacyBombsV157[0].vy += 10; },
    raw => { raw.specialOperation.legacyBombsV157[0].vx = 100; },
    raw => { raw.specialOperation.legacyBombsV157[0].life = Infinity; },
    raw => { raw.specialOperation.legacyBombsV157[0].x = -500; },
    raw => { raw.specialOperation.legacyBombsV157[0].owner = 'other-player'; },
    raw => { raw.specialOperation.legacyMissionV131.bombs = 6; },
    raw => { raw.specialOperation.legacyCheckpointV131.specialOperation.legacyBombsV157 = [structuredClone(raw.specialOperation.legacyBombsV157[0])]; }
  ]) {
    const invalid = structuredClone(saved); mutate(invalid);
    assert.equal(e.applyResumeState(invalid).applied, false);
    assert.equal(JSON.stringify(e.captureResumeState()), before, 'Invalid flight data changes neither charge nor target state.');
  }
  assert.equal(e.applyResumeState(saved).applied, true);
  assert.equal(e.applyResumeState(saved).applied, true);
  assert.equal(e.legacyBombsV131.length, 1, 'Applying a checkpoint twice replaces its flight; it never duplicates damage.');
  tick(e, 1.2); assert.deepEqual(e.legacyMissionV131.nests, [70, 140]);
  for (const kind of ['nostromo', 'abyss', 'broodstorm']) {
    const old = await fixture(kind), oldSave = old.engine.captureResumeState();
    delete oldSave.specialOperation.legacyBombsV157;
    delete oldSave.specialOperation.legacyCheckpointV131.specialOperation.legacyBombsV157;
    assert.equal(old.engine.applyResumeState(oldSave).applied, true, `${kind}: pre-V157 checkpoint remains admitted.`);
    const foreignCharge = structuredClone(oldSave);
    foreignCharge.specialOperation.legacyBombsV157 = [structuredClone(saved.specialOperation.legacyBombsV157[0])];
    assert.equal(old.engine.applyResumeState(foreignCharge).applied, false, `${kind}: an unspent or foreign charge is rejected.`);
  }
});
test('Nostromo held keyboard journey pays 620 once, archives chapter/synchronization and survives migration', async () => {
  const { engine: e, key, options } = await fixture();
  const save = createDefaultSave(); save.galaxy.unlockedWorldIds.push(options.world.id);
  const deployment = beginOperation(save, options.campaign, options.world).operation;
  deployment.missionLevelSignature = options.missionLevel.signature; deployment.levelSeedId = e.resumeIdentity.levelSeedId;
  let completedEvent = null, recorded = false, terminal;
  e.onEvent = event => { if (event.type === 'mission-complete') {
    completedEvent = event; const raw = e.captureResumeState();
    assert.deepEqual(raw.mission.rewards, raw.specialOperation.legacyMissionV131.rewards);
    recorded = recordOperationResumeState(save, raw); terminal = structuredClone(save.strategy.currentOperation);
  } };
  const held = new Set(), controls = codes => {
    const wanted = new Set(codes);
    for (const code of held) if (!wanted.has(code)) { key('keyup', code); held.delete(code); }
    for (const code of wanted) if (!held.has(code)) { key('keydown', code); held.add(code); }
  };
  const prepared = new Set();
  for (let frame = 0; frame < 90 * 60 && e.mission.state === 'active'; frame++) {
    const state = e.legacyMissionV131, station = LEGACY_STATIONS_V131.nostromo[state.stage];
    const x = e.player.x + e.player.w / 2, hunter = e.enemies.find(actor => actor.legacyRoleV131 === 'hunt' && actor.alive);
    const next = [];
    if (hunter) {
      if (!prepared.has(hunter.id)) { await prepareEnemies(e); prepared.add(hunter.id); }
      const dx = hunter.x + hunter.w / 2 - x, dy = hunter.y + hunter.h / 2 - e.player.y - e.player.h * 0.4, distance = Math.hypot(dx, dy);
      e.player.pointerAimV83 = { x: dx / distance, y: dy / distance };
      if (Math.abs(dx) > 450) next.push(dx > 0 ? 'KeyD' : 'KeyA');
      else next.push('KeyF');
    } else {
      e.player.pointerAimV83 = null;
      if (Math.abs(station.x - x) > 45) next.push(station.x > x ? 'KeyD' : 'KeyA'); else next.push('KeyE');
    }
    controls(next); e.update(1 / 60);
  }
  const finalKeys = [...e.keys], finalHeld = [...held];
  controls([]); assert.equal(e.mission.state, 'complete', JSON.stringify({ phase: e.mission.phase, failure: e.mission.failureReason, finalKeys, finalHeld,
    player: { x: e.player.x, y: e.player.y, w: e.player.w, h: e.player.h, vx: e.player.vx, vy: e.player.vy, alive: e.player.alive, downed: e.player.downed,
      ground: e.player.grounded, interaction: e.player.interactionClock, reloading: e.player.reloading }, stage: e.legacyMissionV131.stage,
    walls: e.walls, doors: e.doors, scenery: e.destructibleSceneryV130?.objects, running: e.running, paused: e.paused, atlas: e.enemyAtlasLoadingPausedV65,
    aimLocked: e.player.aimLockedV124, fieldBusy: e.isFieldActionBusyV124(e.player), placeableBusy: e.isPlaceableBusyV86(e.player) }));
  assert.ok(completedEvent); assert.equal(recorded, true);
  const credits = save.galaxy.resources.credits, result = resolveOperation(save, { success: true, kills: e.player.kills, rewards: completedEvent.rewards });
  assert.equal(result.ok, true, result.reason); assert.equal(save.galaxy.resources.credits - credits, 620);
  const receipt = save.strategy.lastOperation.operationResultV131;
  assert.equal(receipt.chapter, 'nostromo'); assert.equal(receipt.synchronization, e.legacyMissionV131.synchronization);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save))); assert.deepEqual(migrated.strategy.lastOperation.operationResultV131, receipt);
  const paid = migrated.galaxy.resources.credits; migrated.strategy.currentOperation = terminal;
  assert.equal(resolveOperation(migrated, { success: true, rewards: completedEvent.rewards }).reason, 'operation-already-resolved');
  assert.equal(migrated.galaxy.resources.credits, paid);
});
test('BROODSTORM keyboard flight and bombing clear a real escort route and return the pilot alive', async () => {
  const subject = await fixture('broodstorm'), e = subject.engine;
  keyboardHold(subject, 1.5); subject.key('keydown', 'KeyQ'); subject.key('keyup', 'KeyQ');
  for (const x of [960, 1560]) {
    steer(subject, { x, y: 550 }); tick(e, 0.1);
    for (let n = 0; n < 2; n++) {
      subject.key('keydown', 'KeyB'); tick(e, 0.05); subject.key('keyup', 'KeyB'); tick(e, 1.25);
    }
  }
  assert.deepEqual(e.legacyMissionV131.nests, [0, 0]); assert.equal(e.legacyMissionV131.stage, 2);
  steer(subject, { x: e.legacyMissionV131.escort.x + 110, y: 360 });
  for (let frame = 0; frame < 35 * 60 && e.mission.state === 'active' && e.legacyMissionV131.stage === 2; frame++) {
    const body = e.vehicle, targetX = e.legacyMissionV131.escort.x + 160;
    if (body.x + body.w / 2 < targetX - 12) e.keys.add('KeyD'); else e.keys.delete('KeyD');
    const enemy = e.enemies.find(actor => actor.alive);
    if (enemy) {
      const dx = enemy.x + enemy.w / 2 - e.player.x - e.player.w / 2, dy = enemy.y + enemy.h / 2 - e.player.y - e.player.h * 0.4;
      const length = Math.hypot(dx, dy); e.player.pointerAimV83 = { x: dx / length, y: dy / length }; e.keys.add('KeyF');
    }
    e.update(1 / 60);
  }
  e.keys.clear(); e.player.pointerAimV83 = null; assert.equal(e.mission.state, 'active'); assert.equal(e.legacyMissionV131.stage, 3);
  await fight(e, 20, 'queen'); assert.equal(e.legacyMissionV131.stage, 4);
  steer(subject, LEGACY_STATIONS_V131.broodstorm[4]); keyboardHold(subject, 3);
  assert.equal(e.mission.state, 'complete'); assert.equal(e.validateLegacyResumeV131(e.captureResumeState()).valid, true);
});
