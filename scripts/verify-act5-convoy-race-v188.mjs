// V188 Act V dedicated convoy race (src/act5-convoy-race-v188.js rules,
// src/act5-convoy-race-runtime-v188.js runtime; bible §5.6 steps 4-6, §5.11, spec 006).
// Declared fixtures: a stub Canvas 2D context (Proxy), a stub Image reading the
// repository PNGs, the catalogue CAMPAIGNS/WORLDS/ENEMIES and an Act V save built
// in memory (council held, line « Tenir », M577 manifest of 2 containers).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, ENEMIES, WEAPONS, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { ACT5_RACE_V188, ACT5_QUEEN_TRANSITIONS_V188, ACT5_RACE_SLOTS_V188, createAct5RaceStateV188, stepAct5RaceV188, engageAct5RaceV188,
  dropAct5TrailerV188, act5RacePhaseV188, act5QueenAdmissibleV188, act5RaceCueV188, sanitizeAct5RaceStateV188, act5RaceRearV188,
  drawAct5QueenPlaceholderV188 } from '../src/act5-convoy-race-v188.js';
import { ACT5_RACE_OPERATION_V188 } from '../src/act5-convoy-race-runtime-v188.js';
import { act5ConvoySetupV188, recordAct5TrailerDropV188, markAct5BridgeCrossedV188, recordAct5QueenKilledV188, act5StateV188,
  act5LateColonistsSavedV188, act5ConvoyDropsV188, act5BridgeDueV188 } from '../src/story-act5-v188.js';
import { normalizeAct5V188 } from '../src/story-act5-state-v188.js';
import { AUDIO_CUE_IDS_V188 } from '../src/audio-cues-v188.js';
import { CREATURE_SCALE_V188 } from '../src/creature-scale-v188.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const queen = ENEMIES.find(entry => entry.id === 'enemy-008-queen');
const run = (state, seconds, controls = { throttle: 1, fire: true }, onEvent = () => {}) => {
  for (let n = 0; n < seconds * 60 && !state.complete && !state.failed; n++) for (const event of stepAct5RaceV188(state, 1 / 60, controls)) onEvent(event, state);
  return state;
};
const both = [{ id: 'colonists', people: 4 }, { id: 'freight', containers: 2 }];

test('drawbar chain: trailers follow on sprung hitches, keep order, and dropping one raises the top speed', () => {
  const state = createAct5RaceStateV188({ campaignId: 'act5-last-run', trailers: both });
  assert.deepEqual(state.trailers.map(entry => entry.id), ['colonists', 'freight']);
  const rest = state.trailers.map(entry => state.apc.s - entry.s);
  engageAct5RaceV188(state); run(state, 3);
  const stretched = state.trailers.map(entry => state.apc.s - entry.s);
  assert.ok(stretched[0] > rest[0] && stretched[0] - rest[0] < ACT5_RACE_V188.trailer.slack + .2, 'the drawbar stretches under acceleration, within its end stops');
  assert.ok(stretched[1] > stretched[0]);
  run(state, 30); const twoTrailers = state.apc.v;
  assert.ok(dropAct5TrailerV188(state, 'freight', 'road')); run(state, 15);
  assert.ok(state.apc.v > twoTrailers + .5, `lighter convoy is faster (${twoTrailers.toFixed(1)} → ${state.apc.v.toFixed(1)} m/s)`);
  assert.equal(state.dropped[0].id, 'freight'); assert.ok(state.dropped[0].v < .1, 'the dropped trailer brakes to a stop on the road');
  assert.equal(dropAct5TrailerV188(state, 'freight'), false, 'a trailer is dropped once');
});

test('bridge: both trailers bog the deck down; no answer in time → the rear (freight) coupling gives way; the convoy crosses', () => {
  const state = createAct5RaceStateV188({ campaignId: 'act5-last-run', trailers: both, bridgeSeconds: 15 }); engageAct5RaceV188(state);
  const seen = [];
  run(state, 200, { throttle: 1, fire: true }, event => seen.push(event.type === 'trailer-dropped' ? `drop:${event.trailer}:${event.cause}` : event.type));
  assert.ok(seen.includes('bridge-strain') && seen.includes('bridge-collapse') && seen.includes('bridge-crossed'));
  assert.ok(seen.includes('drop:freight:timeout'), seen.join(','));
  assert.equal(state.complete, true); assert.deepEqual(state.trailers.map(entry => entry.id), ['colonists']);
  assert.ok(state.bridge.segments.every(segment => segment.fall >= 0), 'the whole span collapsed behind the convoy');
});

test('bridge: dropping the colonists keeps the freight; stopping on the deck sends the convoy into the ravine', () => {
  const kept = createAct5RaceStateV188({ campaignId: 'act5-last-run', trailers: both }); engageAct5RaceV188(kept);
  run(kept, 200, { throttle: 1, fire: true }, (event, state) => { if (event.type === 'bridge-strain') dropAct5TrailerV188(state, 'colonists', 'bridge'); });
  assert.equal(kept.complete, true); assert.deepEqual(kept.trailers.map(entry => entry.id), ['freight']);
  // Braking on the bridge: the collapse front catches the convoy.
  const slow = createAct5RaceStateV188({ campaignId: 'act5-last-run', trailers: both }); engageAct5RaceV188(slow);
  for (let n = 0; n < 200 * 60 && !slow.failed && !slow.complete; n++) stepAct5RaceV188(slow, 1 / 60, { throttle: act5RacePhaseV188(slow) === 'bridge' ? -1 : 1, fire: true });
  assert.equal(slow.failed, 'bridge');
});

test('Queen: admission before shared logic, explicit transitions, 245 px at the documented scale', () => {
  assert.equal(act5QueenAdmissibleV188(queen).admitted, true);
  assert.equal(act5QueenAdmissibleV188(queen).height, 245); assert.equal(CREATURE_SCALE_V188.queen.height, 245);
  assert.equal(act5QueenAdmissibleV188(ENEMIES.find(entry => entry.id === 'enemy-005-warrior')).admitted, false);
  assert.equal(act5QueenAdmissibleV188({ ...queen, behaviorProfileV119: { id: 'drone' } }).admitted, false);
  assert.equal(createAct5RaceStateV188({ campaignId: 'act5-depot-queen', trailers: [], queenProfile: null }), null);
  for (const [from, targets] of Object.entries(ACT5_QUEEN_TRANSITIONS_V188)) for (const to of targets) assert.ok(ACT5_QUEEN_TRANSITIONS_V188[to], `${from}→${to}`);
  const state = createAct5RaceStateV188({ campaignId: 'act5-depot-queen', trailers: [{ id: 'colonists', people: 4 }], queenProfile: queen }); engageAct5RaceV188(state);
  const visited = new Set();
  for (let n = 0; n < 200 * 60 && !state.complete && !state.failed; n++) {
    stepAct5RaceV188(state, 1 / 60, { throttle: 1, fire: true });
    for (const [from, to] of state.queen.trail || []) { assert.ok(ACT5_QUEEN_TRANSITIONS_V188[from].includes(to), `${from}→${to}`); visited.add(to); }
    state.queen.trail = [];
  }
  assert.equal(state.complete, true); assert.equal(state.queen.state, 'dead');
  for (const id of ['stalk', 'windup', 'lunge', 'recover', 'staggered']) assert.ok(visited.has(id), id);
  // The placeholder reaches exactly `height` px above the feet.
  let top = Infinity; const m = { ty: 0, k: 1 };
  const probe = new Proxy({}, { get: (target, key) => key === 'translate' ? (x, y) => { m.ty = y; } : key === 'scale' ? k => { m.k = k; }
    : ['moveTo', 'lineTo'].includes(key) ? (x, y) => { top = Math.min(top, m.ty + y * m.k); } : () => {} });
  drawAct5QueenPlaceholderV188(probe, 0, 600, { height: 245 }); assert.equal(Math.round(600 - top), 245);
});

test('Queen: without fire she wins at the port junction; a dropped trailer stops her to feed', () => {
  const lost = createAct5RaceStateV188({ campaignId: 'act5-depot-queen', trailers: [{ id: 'colonists', people: 4 }], queenProfile: queen }); engageAct5RaceV188(lost);
  run(lost, 300, { throttle: 1, fire: false });
  assert.equal(lost.failed, 'hull'); assert.equal(lost.dropped[0].dropCause, 'queen', 'she tore the trailer loose first');
  const decoy = createAct5RaceStateV188({ campaignId: 'act5-depot-queen', trailers: [{ id: 'colonists', people: 4 }], queenProfile: queen }); engageAct5RaceV188(decoy);
  const seen = [];
  run(decoy, 300, { throttle: 1, fire: true }, (event, state) => { seen.push(event.type); if (event.type === 'queen-lunge' && state.trailers.length) dropAct5TrailerV188(state, 'colonists', 'decoy'); });
  assert.ok(seen.includes('queen-feeding')); assert.equal(decoy.complete, true);
});

test('runners: pursuers from behind are stopped by a dropped trailer and fall with the bridge', () => {
  const state = createAct5RaceStateV188({ campaignId: 'act5-last-run', trailers: both }); engageAct5RaceV188(state);
  const seen = [];
  run(state, 200, { throttle: 1, fire: false }, (event, s) => { seen.push(event.type); if (event.type === 'wave' && s.trailers.length === 2) dropAct5TrailerV188(s, 'freight', 'road'); });
  assert.ok(seen.includes('wave')); assert.ok(seen.includes('runner-blocked'));
});

test('resume data is validated; the cues are existing V188 cues; the Queen slot requests no missing file', () => {
  const state = createAct5RaceStateV188({ campaignId: 'act5-last-run', trailers: both }); engageAct5RaceV188(state); run(state, 5);
  assert.deepEqual(sanitizeAct5RaceStateV188(structuredClone(state)).apc, state.apc);
  assert.equal(sanitizeAct5RaceStateV188({ ...structuredClone(state), trailers: [{ id: 'x' }] }), null);
  assert.equal(sanitizeAct5RaceStateV188({ ...structuredClone(state), campaignId: 'special-apc-convoy' }), null);
  for (const type of ['act5-race-turret-v188', 'act5-race-wave-v188', 'act5-trailer-dropped-v188']) assert.ok(AUDIO_CUE_IDS_V188.includes(act5RaceCueV188({ type })));
  assert.ok(AUDIO_CUE_IDS_V188.includes(act5RaceCueV188({ type: 'act5-race-queen-v188', id: 'lunge' })));
  const queenSlot = ACT5_RACE_SLOTS_V188.find(entry => entry.id === 'act5-queen-chase-side');
  assert.equal(queenSlot.present, false); assert.equal(queenSlot.height, 245);
  for (const entry of ACT5_RACE_SLOTS_V188.filter(entry => entry.present)) assert.ok(readFileSync(new URL(`..${entry.path}`, import.meta.url)).length > 0, entry.path);
});

// —— Save consequences (additive storyCampaignV188.act5.convoyV188) ——
function act5Save(option = 'hold') {
  const save = { galaxy: { completedCampaignIds: ['special-archive-relay', 'special-apc-convoy', 'special-c12-horde', 'special-black-cocoon'] },
    crew: [{ id: 'crew-01-mara-vega', loyalty: 80 }, { id: 'crew-15-leila-s-rensen', loyalty: 80 }],
    storyCampaignV188: { schema: 188, debriefSeen: ['special-black-cocoon'], cinematicsSeen: [], beatsSeen: [], m577Manifest: { containers: 2, colonists: 2, resolved: true }, interlude: null } };
  save.storyCampaignV188.act5 = { phase: 'final', decision: { option, ending: option === 'cede' ? 'freight-first' : 'living-without-proof' }, advantages: [] };
  return save;
}
test('setup reads the manifest; a drop during « Dernier départ » is the bridge decision; later losses are additive', () => {
  const save = act5Save();
  const setup = act5ConvoySetupV188(save, 'act5-last-run');
  assert.deepEqual(setup.trailers.map(entry => entry.id), ['colonists', 'freight']); assert.equal(setup.trailers[1].containers, 2); assert.equal(setup.apcColonists, 2);
  assert.ok(act5BridgeDueV188(save, 'act5-last-run'));
  assert.equal(recordAct5TrailerDropV188(save, { trailer: 'freight', campaignId: 'act5-last-run', cause: 'road', metres: 312 }), true);
  assert.equal(act5StateV188(save).bridge, 'freight'); assert.equal(act5BridgeDueV188(save, 'act5-last-run'), false);
  assert.equal(recordAct5TrailerDropV188(save, { trailer: 'freight', campaignId: 'act5-last-run', cause: 'road' }), false, 'once per trailer');
  assert.equal(markAct5BridgeCrossedV188(save), true);
  assert.equal(act5LateColonistsSavedV188(save), 4);
  save.galaxy.completedCampaignIds.push('act5-last-run');
  assert.deepEqual(act5ConvoySetupV188(save, 'act5-depot-queen').trailers.map(entry => entry.id), ['colonists']);
  assert.equal(recordAct5TrailerDropV188(save, { trailer: 'colonists', campaignId: 'act5-depot-queen', cause: 'decoy', metres: 640 }), true);
  assert.equal(act5LateColonistsSavedV188(save), 0, 'colonists left to the Queen do not reach the port');
  assert.equal(recordAct5QueenKilledV188(save), true);
  assert.deepEqual(act5ConvoyDropsV188(save).map(drop => `${drop.trailer}:${drop.mission}:${drop.cause}`), ['freight:act5-last-run:road', 'colonists:act5-depot-queen:decoy']);
  const round = normalizeAct5V188(JSON.parse(JSON.stringify(act5StateV188(save))));
  assert.deepEqual(round.convoyV188, { drops: act5StateV188(save).convoyV188.drops, bridgeCrossed: true, queen: 'killed' });
  assert.equal(normalizeAct5V188({ phase: 'final', decision: { option: 'hold', ending: 'living-without-proof' } }).convoyV188, undefined, 'older saves gain no field');
  assert.equal(normalizeAct5V188({ phase: 'final', decision: { option: 'hold', ending: 'living-without-proof' }, convoyV188: { drops: [{ trailer: 'tank', mission: 'act5-last-run', cause: 'road' }] } }).convoyV188, undefined);
});
test('timeout cause only applies to the freight; a replay records nothing', () => {
  const save = act5Save();
  assert.equal(recordAct5TrailerDropV188(save, { trailer: 'colonists', campaignId: 'act5-last-run', cause: 'timeout' }), false);
  assert.equal(recordAct5TrailerDropV188(save, { trailer: 'freight', campaignId: 'act5-last-run', cause: 'timeout' }), true);
  assert.equal(act5StateV188(save).bridgeTimedOut, true);
  const replay = act5Save(); replay.galaxy.completedCampaignIds.push('act5-last-run');
  assert.equal(act5ConvoySetupV188(replay, 'act5-last-run').replay, true);
  assert.equal(recordAct5TrailerDropV188(replay, { trailer: 'freight', campaignId: 'act5-last-run', cause: 'road' }), false);
});

// —— Engine integration ——
async function fixture(campaignId, extra = {}) {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, hasFocus: () => true, documentElement: { lang: 'fr' } });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(value) { this._src = value; let valid = false;
      try { const bytes = readFileSync(new URL(`..${new URL(value, 'http://qa.invalid').pathname}`, import.meta.url));
        if (bytes.subarray(1, 4).toString() === 'PNG') { this.naturalWidth = bytes.readUInt32BE(16); this.naturalHeight = bytes.readUInt32BE(20); valid = true; } } catch {}
      queueMicrotask(() => { const event = new Event(valid ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); }); }
    get src() { return this._src; } async decode() { if (!this.naturalWidth) throw Error('Missing bitmap'); }
  };
  const ctx = new Proxy({ measureText: v => ({ width: String(v).length * 7 }), createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
    { get: (target, p) => p in target ? target[p] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx, focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const campaign = CAMPAIGNS.find(entry => entry.id === campaignId), world = WORLDS.find(entry => entry.id === campaign.worldId);
  const options = { campaign, world, weapon: WEAPONS[0], enemyCatalog: ENEMIES, crew: [], equipment: [], seed: 577, ...extra };
  options.missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS });
  const engine = new GameEngine(canvas); const seen = []; engine.onEvent = event => seen.push(event);
  engine.start(options);
  for (let n = 0; n < 40; n++) await Promise.resolve();
  return { engine, options, seen, ctx };
}
const tick = (engine, seconds) => { for (let n = 0; n < seconds * 60 && engine.mission.state === 'active'; n++) engine.update(1 / 60); };

test('engine: « Dernier départ » runs the race seated in the M577, one checkpoint per phase, X drops the freight, completes', async () => {
  const { engine, seen } = await fixture('act5-last-run');
  assert.equal(engine.isAct5RaceV188(), true); assert.equal(engine.player.inVehicle, true);
  assert.equal(engine.vehicle.id, 'vehicle-001-m577-armored-personnel-carrier');
  assert.equal(engine.enemies.length, 0, 'no generic encounter: the race owns its scene');
  assert.ok(seen.some(event => event.type === 'special-operation-started' && event.operationId === ACT5_RACE_OPERATION_V188));
  assert.equal(engine.interact(), true); assert.equal(engine.act5RaceV188.phase, 'road');
  engine.keys.add('KeyD'); engine.keys.add('KeyF'); tick(engine, 20);
  engine.keys.add('KeyX'); tick(engine, .1); engine.keys.delete('KeyX');
  const drop = seen.find(event => event.type === 'act5-trailer-dropped-v188');
  assert.equal(drop.trailer, 'freight'); assert.equal(drop.cause, 'road');
  tick(engine, 160);
  const checkpoints = seen.filter(event => event.type === 'checkpoint').map(event => event.checkpoint);
  assert.deepEqual(checkpoints, ['act5-race-road', 'act5-race-bridge', 'act5-race-far-side', 'act5-race-arrival']);
  assert.equal(engine.mission.state, 'complete'); assert.ok(seen.some(event => event.type === 'mission-complete'));
  assert.ok(seen.some(event => event.type === 'act5-race-milestone-v188' && event.id === 'bridge-crossed'));
});

test('engine: the Queen chase kills the M577 without fire, restarts from its phase checkpoint, and resumes from a capture', async () => {
  const { engine, seen } = await fixture('act5-depot-queen');
  assert.equal(engine.act5RaceV188.queen.height, 245);
  engine.interact(); engine.keys.add('KeyD'); tick(engine, 300);
  assert.equal(engine.mission.state, 'failed');
  assert.ok(seen.some(event => event.type === 'act5-trailer-dropped-v188' && event.cause === 'queen'));
  assert.equal(engine.restartFromCheckpoint(), true); assert.equal(engine.mission.state, 'active');
  assert.equal(engine.act5RaceV188.trailers.length, 0, 'the trailer already lost is not towed again');
  engine.keys.add('KeyF'); tick(engine, 5);
  const capture = engine.captureResumeState();
  assert.equal(capture.specialOperation.operationId, ACT5_RACE_OPERATION_V188);
  const { engine: resumed } = await fixture('act5-depot-queen', { resumeState: capture });
  assert.equal(Math.round(resumed.act5RaceV188.apc.s), Math.round(engine.act5RaceV188.apc.s));
  assert.equal(resumed.lastResumeResult.applied, true);
});

test('wiring: composition, app launch and save flow, i18n, service worker shell', () => {
  const runtime = read('src/game-production-runtime.js');
  assert.match(runtime, /const V158ProductionEngine = withAct5ConvoyRaceV188\(withBlackCocoonPresentationV158\(V132ProductionEngine\)\);/);
  assert.match(runtime, /withForgeMissionRuntimeV141\(withMissionLayerMatteV188\(V158ProductionEngine\)/);
  const app = read('src/app.js');
  assert.match(app, /act5ConvoySetupV188\(saveSystem\.data, campaign\.id\)/);
  assert.match(app, /act5-trailer-dropped-v188/);
  assert.match(app, /engine\.isAct5RaceV188\?\.\(\)/);
  const sw = read('sw.js');
  for (const file of ['act5-convoy-race-v188.js', 'act5-convoy-race-runtime-v188.js']) assert.ok(sw.includes(`'/src/${file}'`), file);
  void act5RaceRearV188;
});

// —— Owner decisions of 2026-11-22 ——
test('M577 to scale: 8.8 m at 51 px/m [À VÉRIFIER], wheels on the road, hitch and turret on the hull, whole convoy in view', async () => {
  const { M577_SCALE_V188, M577_MISSION_SLOT_V188, m577AnchorsV188, drawM577ScaledPlaceholderV188, m577ScaleCampaignV188 } = await import('../src/m577-scale-v188.js');
  assert.equal(M577_SCALE_V188.status, 'À VÉRIFIER'); assert.equal(M577_SCALE_V188.w, Math.round(M577_SCALE_V188.metres * CREATURE_SCALE_V188.pixelsPerMetre));
  assert.equal(M577_MISSION_SLOT_V188.present, false, 'placeholder only: no file requested');
  for (const id of ['special-apc-convoy', 'act5-last-run', 'act5-depot-queen']) assert.ok(m577ScaleCampaignV188(id), id);
  const { engine } = await fixture('act5-last-run');
  const v = engine.vehicle, snap = engine.act5RaceSnapshotV188();
  assert.equal(v.w, 449); assert.equal(v.h, 112); assert.equal(snap.apcPx.metres, 8.8);
  assert.equal(+engine.act5RaceV188.apc.length.toFixed(2), 8.8, 'the rules use the drawn length (449 / 51)');
  assert.equal(v.y + v.h, 570, 'feet on the road line'); assert.ok(v.x >= 0 && v.x + v.w <= 1280, 'the hull stays in view');
  // Collision box = the hull to scale (no legacy 190 px sprite cell).
  assert.equal(v.spriteHitbox.id, 'm577-scale-v188'); assert.equal(v.spriteHitbox.local.w, 445);
  // The first drawbar hangs on the rear hitch; the trailers keep 4.6 m.
  const a = m577AnchorsV188(v); assert.equal(a.rearHitch.x, v.x); assert.equal(a.rearHitch.y, 570 - 24);
  assert.ok(a.turret.x > v.x && a.turret.x < v.x + v.w / 2, 'rear roof turret'); assert.ok(a.seat.x > v.x + v.w / 2, 'cab behind the nose');
  assert.equal(snap.trailerPx.w, 235);
  const rearScreen = engine.act5ScreenXV188(act5RaceRearV188(engine.act5RaceV188));
  assert.ok(rearScreen > 0, `the two trailers fit behind the M577 (${Math.round(rearScreen)} px)`);
  // The placeholder: tyres touch the feet line, nothing below it, drawn length = 449 px.
  const pts = []; const m = { tx: 0, ty: 0, sx: 1 };
  const probe = new Proxy({}, { get: (target, key) => key === 'translate' ? (x, y) => { m.tx += x * m.sx; m.ty += y; } : key === 'scale' ? (sx) => { m.sx *= sx; }
    : key === 'arc' ? (x, y, r) => pts.push({ x: m.tx + x * m.sx, y: m.ty + y + r }) : ['moveTo', 'lineTo'].includes(key) ? (x, y) => pts.push({ x: m.tx + x * m.sx, y: m.ty + y }) : () => {} });
  drawM577ScaledPlaceholderV188(probe, 100, 600, 1);
  assert.equal(Math.max(...pts.map(p => p.y)), 600, 'wheels on the feet line');
  const xs = pts.map(p => p.x); assert.ok(Math.min(...xs) >= 100 - 1 && Math.max(...xs) <= 100 + 449 + 1, `${Math.min(...xs)}…${Math.max(...xs)}`);
});

test('Queen: hurt, staggered and thrown back during the chase, never killed before the port junction; killable only there', () => {
  const state = createAct5RaceStateV188({ campaignId: 'act5-depot-queen', trailers: [{ id: 'colonists', people: 4 }], queenProfile: queen }); engageAct5RaceV188(state);
  const floor = Math.ceil(state.queen.maxHealth * ACT5_RACE_V188.queen.chaseFloor), seen = [];
  let lowest = Infinity, killedAt = null;
  for (let n = 0; n < 300 * 60 && !state.complete && !state.failed; n++) {
    for (const event of stepAct5RaceV188(state, 1 / 60, { throttle: 1, fire: true })) { seen.push(event.type); if (event.type === 'queen-killed') killedAt = state.apc.s; }
    if (act5RacePhaseV188(state) === 'chase') { lowest = Math.min(lowest, state.queen.health); assert.notEqual(state.queen.state, 'dead', 'alive on the road'); }
    for (const [from, to] of state.queen.trail || []) assert.ok(ACT5_QUEEN_TRANSITIONS_V188[from].includes(to), `${from}→${to}`);
  }
  assert.equal(lowest, floor, 'the road chase brings her down to her floor, not below');
  assert.ok(seen.includes('queen-recoil'), 'she is thrown back under fire at her floor');
  assert.equal(state.complete, true); assert.equal(state.queen.state, 'dead');
  assert.ok(killedAt >= state.length, `killed at the junction (${killedAt} m)`);
  assert.deepEqual(ACT5_QUEEN_TRANSITIONS_V188.recoil, ['stalk'], 'recoil always returns to the chase');
  assert.equal(act5RaceCueV188({ type: 'act5-race-queen-v188', id: 'recoil' }), 'cry-queen');
});

test('freight: a freight trailer lost on the road takes the containers with it (restitution and epilogue)', async () => {
  const { act5FreightLossV188, act5ContainersBroughtBackV188, act5RestitutionHeldV188, act5EpilogueV188 } = await import('../src/story-act5-v188.js');
  const save = act5Save('cede'); save.storyCampaignV188.act5.decision.restitution = true;
  assert.equal(act5ContainersBroughtBackV188(save), 2); assert.equal(act5RestitutionHeldV188(save), true);
  assert.equal(recordAct5TrailerDropV188(save, { trailer: 'colonists', campaignId: 'act5-last-run', cause: 'bridge', metres: 720 }), true);
  save.galaxy.completedCampaignIds.push('act5-last-run');
  assert.equal(act5RestitutionHeldV188(save), true, 'the colonists were left: the freight still rides');
  assert.equal(recordAct5TrailerDropV188(save, { trailer: 'freight', campaignId: 'act5-depot-queen', cause: 'decoy', metres: 900 }), true);
  assert.deepEqual({ ...act5FreightLossV188(save) }, { mission: 'act5-depot-queen', cause: 'decoy', place: 'road' });
  assert.equal(act5ContainersBroughtBackV188(save), 0); assert.equal(act5RestitutionHeldV188(save), false);
  save.storyCampaignV188.act5.phase = 'epilogue';
  assert.match(act5EpilogueV188(save, 'fr').find(fact => fact.id === 'freight').text, /route du port avec 2 conteneur/);
});
