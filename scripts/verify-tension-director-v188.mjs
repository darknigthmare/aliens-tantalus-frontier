import { MISSION_REGISTER_PROFILES_V188, resolveMissionRegisterV188, evaluateFreeSaveV188, evaluateTerminalSaveV188,
  measureThreatV188, SAVE_RULES_V188 } from '../src/mission-register-v188.js';
import { TENSION_DIRECTOR_V188, createTensionStateV188, advanceTensionV188, tensionAllowsSpawnV188,
  seededRandomV188, scheduleFalseEchoV188 } from '../src/tension-director-v188.js';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content-core-v50.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';

// Production composition, admitted sprites, actual combat and physical maps.
// Only browser APIs are replaced; real PNG/WebP byte dimensions are preserved.
const sizes = new Map();
function size(path) {
  if (sizes.has(path)) return sizes.get(path);
  let result;
  try {
    const bytes = readFileSync(new URL(`..${new URL(path, 'http://qa.invalid').pathname}`, import.meta.url));
    if (bytes.subarray(1, 4).toString() === 'PNG') result = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
    else if (bytes.subarray(0, 4).toString() === 'RIFF') for (let offset = 12; offset + 8 < bytes.length;) {
      const kind = bytes.subarray(offset, offset + 4).toString(), length = bytes.readUInt32LE(offset + 4), data = offset + 8;
      if (kind === 'VP8X') result = [bytes.readUIntLE(data + 4, 3) + 1, bytes.readUIntLE(data + 7, 3) + 1];
      if (kind === 'VP8L' && bytes[data] === 0x2f) { const packed = bytes.readUInt32LE(data + 1); result = [(packed & 0x3fff) + 1, (packed >>> 14 & 0x3fff) + 1]; }
      if (kind === 'VP8 ' && bytes.subarray(data + 3, data + 6).equals(Buffer.from([0x9d, 1, 0x2a]))) result = [bytes.readUInt16LE(data + 6) & 0x3fff, bytes.readUInt16LE(data + 8) & 0x3fff];
      if (result) break; offset = data + length + (length & 1);
    }
  } catch {}
  if (result) sizes.set(path, result); return result;
}
function host() {
  const window = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = window[name].bind(window);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(path) { this._src = path; const dimensions = size(path); this.naturalWidth = dimensions?.[0] || 0; this.naturalHeight = dimensions?.[1] || 0;
      queueMicrotask(() => { const event = new Event(dimensions ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); }); }
    get src() { return this._src; } async decode() { if (!this.naturalWidth) throw Error('Missing shipped bitmap'); }
  };
  const text = [], draws = [], stack = [], gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1, save() { stack.push(this.globalAlpha); }, restore() { assert.ok(stack.length); this.globalAlpha = stack.pop(); },
    fillText(value) { text.push(String(value)); }, drawImage(image, ...args) { assert.ok(image.naturalWidth > 0); draws.push({ path: image.src, args }); },
    measureText: value => ({ width: String(value).length * 7 }), createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) }, { get: (object, key) => key in object ? object[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  return { canvas, ctx, text, draws, stack };
}
async function prepare(engine) {
  for (let n = 0; n < 8; n++) await Promise.resolve();
  await Promise.all((engine.getVisibleEnemyAtlasSheetsV65?.() || []).map(sheet => engine.ensureEnemyAtlas(sheet)));
  for (let n = 0; n < 8; n++) await Promise.resolve(); engine.refreshEnemyAtlasAvailabilityV65();
  assert.equal(engine.enemyAtlasLoadingPausedV65, false);
}
function tick(engine, seconds, rate = 60) {
  for (let remaining = seconds; remaining > 1e-9;) { const dt = Math.min(remaining, 1 / rate); engine.update(dt); remaining -= dt; }
}
async function fixture({ campaign = CAMPAIGNS[0], seed = 1321 } = {}) {
  const browser = host(), events = [];
  const options = { world: WORLDS[0], campaign, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [], seed };
  options.missionLevel = buildMissionLevelV52({ ...options, templateId: 'ship-interior-vertical', levelSeeds: LEVEL_SEEDS });
  const engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) }); engine.start(options); await prepare(engine);
  engine.enemies = []; engine.squadActors = []; engine.hazards = []; engine.coopEnabled = false;
  return { ...browser, engine, events };
}
const enemyAt = (player, dx, extra = {}) => ({ id: 'e-' + dx, x: player.x + dx, y: player.y, w: 40, h: 60, alive: true, ...extra });

test('registers follow the bible §0.3 table and fall back to tension', () => {
  assert.equal(resolveMissionRegisterV188('special-narrative-qz17'), 'horror');
  assert.equal(resolveMissionRegisterV188({ id: 'special-archive-relay' }), 'tension');
  assert.equal(resolveMissionRegisterV188('special-apc-convoy'), 'action');
  assert.equal(resolveMissionRegisterV188('special-c12-horde'), 'tension');
  assert.equal(resolveMissionRegisterV188('special-black-cocoon'), 'horror');
  assert.equal(resolveMissionRegisterV188({ id: 'x', registerV188: 'calm' }), 'calm');
  assert.equal(resolveMissionRegisterV188({ id: 'x', registerV188: 'bogus' }), 'tension');
  assert.equal(resolveMissionRegisterV188(null), 'tension');
  assert.deepEqual(Object.fromEntries(Object.entries(MISSION_REGISTER_PROFILES_V188).map(([id, p]) => [id, p.save])), {
    horror: { checkpoint: true, terminal: true, free: false }, tension: { checkpoint: true, terminal: true, free: true },
    action: { checkpoint: true, terminal: false, free: true }, calm: { checkpoint: false, terminal: false, free: true } });
});

test('free save is refused near a threat, after damage and in horror; accepted when clear', () => {
  const player = { x: 1000, y: 500, w: 40, h: 80 };
  assert.equal(evaluateFreeSaveV188({ register: 'tension', enemies: [], player }).allowed, true);
  assert.equal(evaluateFreeSaveV188({ register: 'tension', enemies: [enemyAt(player, 500)], player }).reason, 'threat');
  assert.equal(evaluateFreeSaveV188({ register: 'tension', enemies: [enemyAt(player, 900)], player }).allowed, true);
  assert.equal(evaluateFreeSaveV188({ register: 'tension', enemies: [enemyAt(player, 2000, { tacticsV130: { mode: 'pursuit' } })], player }).reason, 'threat');
  assert.equal(evaluateFreeSaveV188({ register: 'tension', enemies: [enemyAt(player, 500, { alive: false })], player }).allowed, true);
  assert.equal(evaluateFreeSaveV188({ register: 'action', enemies: [], player, secondsSinceDamage: 3 }).reason, 'recent-damage');
  const horror = evaluateFreeSaveV188({ register: 'horror', enemies: [], player });
  assert.equal(horror.allowed, false); assert.equal(horror.mode, 'terminal');
  assert.equal(evaluateFreeSaveV188({ register: 'calm', enemies: [], player }).allowed, true);
  assert.equal(measureThreatV188([enemyAt(player, 100), enemyAt(player, 700)], player).near, 1);
});

test('terminal save needs reach, a terminal register and no threat', () => {
  const player = { x: 1000, y: 500, w: 40, h: 80 }, terminal = { x: 1020, y: 500 };
  assert.equal(evaluateTerminalSaveV188({ register: 'horror', enemies: [], player, terminal }).allowed, true);
  assert.equal(evaluateTerminalSaveV188({ register: 'horror', enemies: [], player, terminal: { x: 1500, y: 500 } }).reason, 'out-of-reach');
  assert.equal(evaluateTerminalSaveV188({ register: 'action', enemies: [], player, terminal }).reason, 'register');
  assert.equal(evaluateTerminalSaveV188({ register: 'horror', enemies: [enemyAt(player, 300)], player, terminal }).reason, 'threat');
  assert.equal(SAVE_RULES_V188.terminalSeconds, 3);
});

test('tension rises with damage and contact, peaks, then guarantees the register relax time', () => {
  const state = createTensionStateV188('tension');
  assert.equal(tensionAllowsSpawnV188(state), true);
  assert.equal(advanceTensionV188(state, { damage: 90 }, .1), 'peak');
  assert.equal(tensionAllowsSpawnV188(state), false);
  let phase = null; for (let n = 0; n < 200 && !phase; n++) phase = advanceTensionV188(state, {}, .1);
  assert.equal(phase, 'relax'); assert.equal(state.relaxRemaining, 20); assert.equal(tensionAllowsSpawnV188(state), false);
  for (let n = 0; n < 199; n++) advanceTensionV188(state, {}, .1);
  assert.equal(state.phase, 'relax');
  for (let n = 0; n < 2; n++) advanceTensionV188(state, {}, .1);
  assert.equal(state.phase, 'build'); assert.equal(tensionAllowsSpawnV188(state), true);
  const contact = createTensionStateV188('horror');
  advanceTensionV188(contact, { nearby: 10 }, .25); assert.equal(contact.intensity, 3, 'nearby rise is capped per second');
  assert.equal(tensionAllowsSpawnV188(createTensionStateV188('calm')), false);
  assert.equal(TENSION_DIRECTOR_V188.peakAt, 85);
});

test('false echo schedule is deterministic and inside 45–90 s', () => {
  const a = seededRandomV188(42), b = seededRandomV188(42);
  for (let n = 0; n < 20; n++) {
    const next = scheduleFalseEchoV188(100, a); assert.equal(next, scheduleFalseEchoV188(100, b));
    assert.ok(next >= 145 && next <= 190);
  }
});

test('production engine: register, horde gating, quick-save policy and terminal save', async () => {
  const { engine, events } = await fixture({ campaign: { ...CAMPAIGNS[0], registerV188: 'horror' } });
  assert.equal(engine.missionRegisterV188, 'horror');
  assert.equal(engine.getSnapshot().missionRegisterV188, 'horror');
  const policy = engine.missionSavePolicyV188();
  assert.equal(policy.allowed, false); assert.equal(policy.mode, 'terminal');
  engine.checkpoint = { id: 'insertion', x: engine.player.x, y: engine.player.y };
  assert.equal(engine.beginTerminalSaveV188().allowed, true);
  tick(engine, 3.2);
  assert.ok(events.some(event => event.type === 'terminal-save-v188'), 'terminal save completes after 3 s');
  engine.tensionV188.phase = 'peak';
  const original = engine.hordeDirectorV132, state = { elapsed: 10, nextWave: 0, wave: 0 };
  engine.hordeDirectorV132 = state;
  assert.equal(engine.beginHordeWarningV132(), false, 'no horde wave during a peak');
  assert.equal(state.wave, 0); assert.equal(state.nextWave, 12, 'the wave is retried 2 s later');
  engine.hordeDirectorV132 = original;
  engine.stop();
  const action = await fixture({ campaign: { ...CAMPAIGNS[0], registerV188: 'action' } });
  assert.equal(action.engine.missionRegisterV188, 'action');
  assert.equal(action.engine.missionSavePolicyV188().allowed, true);
  action.engine.enemies = [enemyAt(action.engine.player, 200)];
  assert.equal(action.engine.missionSavePolicyV188().allowed, false);
  action.engine.stop();
});

test('production engine: a damaged player cancels a terminal save and raises tension', async () => {
  const { engine, events } = await fixture({ campaign: { ...CAMPAIGNS[0], registerV188: 'horror' } });
  engine.checkpoint = { id: 'insertion', x: engine.player.x, y: engine.player.y };
  assert.equal(engine.beginTerminalSaveV188().allowed, true);
  engine.player.invulnerable = 0; engine.player.hurtClock = 0;
  engine.damagePlayer(engine.player, 20, { source: 'test' });
  assert.equal(engine.terminalSaveV188, null);
  assert.ok(events.some(event => event.type === 'terminal-save-cancelled-v188'));
  tick(engine, .1);
  assert.ok(engine.tensionV188.intensity > 0);
  engine.stop();
});

test('production engine: a horror mission produces a false echo on the tracker and reveals its source', async () => {
  const { engine, events } = await fixture({ campaign: { ...CAMPAIGNS[0], registerV188: 'horror' } });
  engine.nextFalseEchoAtV188 = engine.mission.elapsed + .05; engine.lastRealContactAtV188 = -100;
  tick(engine, .2);
  assert.ok(engine.falseEchoV188, 'false echo scheduled');
  assert.ok(events.some(event => event.type === 'false-echo-v188'));
  engine.activateTracker?.(engine.player);
  tick(engine, .1);
  const model = engine.motionTrackerSnapshotV160();
  assert.equal(model.active, true, 'tracker pulse active');
  assert.ok(model.contacts.some(contact => contact.falseEchoV188), 'false echo shown as a tracker contact');
  const echo = engine.falseEchoV188;
  Object.assign(engine.player, { x: echo.x - engine.player.w / 2, y: echo.y - engine.player.h });
  tick(engine, .1);
  assert.ok(events.some(event => event.type === 'false-echo-revealed-v188'));
  engine.stop();
});
