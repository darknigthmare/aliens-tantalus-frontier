import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_FACTIONS_V96, XENO_TRIALS_STAGES_V96,
  getXenoTrialsFighterV96, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, setXenoTrialsPausedV96,
  getXenoTrialsSnapshotV96, nextXenoTrialsRoundV96, XENO_TRIALS_STEP_V96 as STEP, XENO_TRIALS_ARENA_V96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsRuntimeV96, getXenoTrialsRenderMetricsV96 } from '../src/xeno-trials-runtime-v96.js';

const advance = (match, seconds, a = {}, b = {}) => {
  for (let t = 0; t < Math.round(seconds / STEP); t++) stepXenoTrialsMatchV96(match, STEP, a, b);
  return match;
};
const activeMatch = (config = {}) => {
  const match = createXenoTrialsMatchV96(config); advance(match, 1);
  match.fighters[0].x = 450; match.fighters[1].x = 550;
  return match;
};

test('V99 roster has 53 unique admitted dedicated images and 4 explicit fictional doctrines', () => {
  assert.equal(XENO_TRIALS_FIGHTERS_V96.length, 53);
  assert.equal(new Set(XENO_TRIALS_FIGHTERS_V96.map(f => f.id)).size, 53);
  for (const entry of XENO_TRIALS_FIGHTERS_V96) {
    const art = getXenoTrialsArtV96(entry.id);
    assert.ok(art?.path.endsWith('.png'));
    assert.ok(existsSync(fileURLToPath(new URL(`../${art.path.slice(1)}`, import.meta.url))), art.path);
    assert.equal(entry.artStatus, 'dedicated-static-pose');
    assert.equal(entry.canonExact, false);
    assert.ok(entry.hp > 0 && entry.speed > 0 && entry.stamina > 0);
  }
  assert.equal(XENO_TRIALS_FACTIONS_V96.length, 4);
  assert.ok(XENO_TRIALS_FACTIONS_V96.every(f => f.projectOriginal && f.roster.every(getXenoTrialsFighterV96)));
  assert.equal(XENO_TRIALS_STAGES_V96.length, 6);
  assert.equal(getXenoTrialsArtV96('not-admitted'), null);
});
test('V96 Grey and Purple keep one Arachnoid identity and equal gameplay statistics', () => {
  const a = createXenoTrialsMatchV96({ playerId: 'arachnoid', playerVariant: 'grey' });
  const b = createXenoTrialsMatchV96({ playerId: 'arachnoid', playerVariant: 'purple' });
  assert.equal(a.fighters[0].id, b.fighters[0].id);
  assert.equal(a.fighters[0].hp, b.fighters[0].hp);
  assert.equal(a.fighters[0].stamina, b.fighters[0].stamina);
  assert.notEqual(getXenoTrialsArtV96('arachnoid', 'grey').path, getXenoTrialsArtV96('arachnoid', 'purple').path);
  assert.equal(createXenoTrialsMatchV96({ playerId: 'arachnoid', playerVariant: 'foreign' }).fighters[0].variant, 'grey');
});
test('V96 all complete PNG silhouettes fit the two walls in both directions and their maximum jump', () => {
  for (const fighter of XENO_TRIALS_FIGHTERS_V96) {
    for (const variant of fighter.variants.length ? fighter.variants : [null]) {
      const layout = getXenoTrialsRenderMetricsV96(fighter.id, variant);
      assert.ok(layout.height <= 220);
      for (const x of [XENO_TRIALS_ARENA_V96.left, XENO_TRIALS_ARENA_V96.right]) {
        for (const flip of [-1, 1]) {
          const ends = [x + (-layout.width * layout.pivotX) * flip, x + (layout.width * (1 - layout.pivotX)) * flip];
          assert.ok(Math.min(...ends) >= 0, `${fighter.id}: left clipping`);
          assert.ok(Math.max(...ends) <= 1000, `${fighter.id}: right clipping`);
        }
      }
      const headAtPeak = 450 - fighter.jump ** 2 / (2 * 1450) - layout.height * layout.bottom;
      assert.ok(headAtPeak >= 110, `${fighter.id}: HUD overlap ${headAtPeak}`);
    }
  }
});
test('V96 configuration rejects unknown IDs and clamps non-finite/oversized tuning', () => {
  const m = createXenoTrialsMatchV96({ playerId: '../../not', opponentId: 'x', roundsToWin: 200, roundSeconds: Infinity, difficulty: 'cheat', matchId: '<script>', seed: 0 });
  assert.equal(m.config.playerId, 'warrior'); assert.equal(m.config.opponentId, 'arachnoid');
  assert.equal(m.config.roundsToWin, 3); assert.equal(m.config.roundSeconds, 99);
  assert.equal(m.config.difficulty, 'normal'); assert.equal(m.config.matchId, 'trial-1969');
  assert.equal(createXenoTrialsMatchV96({ roundSeconds: -5, roundsToWin: 0 }).config.roundSeconds, 15);
});
test('V96 presentation does not move fighters or consume the round timer and requires release', () => {
  const m = createXenoTrialsMatchV96();
  advance(m, .6, { right: true, light: true });
  assert.equal(m.phase, 'intro'); assert.equal(m.fighters[0].x, 310); assert.equal(m.timeRemaining, 99);
  advance(m, .4, { right: true, light: true });
  assert.equal(m.phase, 'active'); assert.equal(m.fighters[0].x, 310); assert.equal(m.fighters[0].attack, null);
  advance(m, .05); advance(m, .05, { right: true, light: true });
  assert.ok(m.fighters[0].x > 310); assert.ok(m.fighters[0].attack);
});
test('V96 fixed-step state is identical at 60Hz and 120Hz', () => {
  const a = activeMatch(), b = activeMatch();
  for (let n = 0; n < 120; n++) stepXenoTrialsMatchV96(a, STEP, { left: true }, {});
  for (let n = 0; n < 60; n++) stepXenoTrialsMatchV96(b, STEP * 2, { left: true }, {});
  assert.deepEqual(a, b);
});
test('V96 invalid dt is ignored; a large stall is limited to 250ms', () => {
  const m = activeMatch(), tick = m.tick;
  for (const dt of [NaN, Infinity, -1, 0, undefined]) stepXenoTrialsMatchV96(m, dt, { left: true });
  assert.equal(m.tick, tick);
  stepXenoTrialsMatchV96(m, 60, {}, {});
  assert.equal(m.tick - tick, 30);
});
test('V96 pause freezes every simulation field and clears accumulator', () => {
  const m = activeMatch(); stepXenoTrialsMatchV96(m, STEP / 2);
  setXenoTrialsPausedV96(m, true); const before = getXenoTrialsSnapshotV96(m);
  advance(m, 3, { right: true, heavy: true }, null);
  assert.deepEqual(m, before); assert.equal(m.accumulator, 0);
  setXenoTrialsPausedV96(m, false); advance(m, .1); assert.ok(m.tick > before.tick);
});
test('V96 light attack respects startup, hits once, consumes stamina and recovers', () => {
  const m = activeMatch(), hp = m.fighters[1].hp;
  advance(m, .05, { light: true }); assert.equal(m.fighters[1].hp, hp);
  advance(m, .1, { light: true }); assert.equal(m.fighters[1].hp, hp - 14);
  advance(m, 1, { light: true }); assert.equal(m.fighters[1].hp, hp - 14);
  assert.equal(m.fighters[0].stats.hits, 1); assert.equal(m.fighters[0].attack, null);
  assert.ok(m.fighters[0].stamina <= 100 && m.fighters[0].stamina > 88);
});
test('V96 release/new press permits a second attack, not a held-button auto-repeat', () => {
  const m = activeMatch(); advance(m, .5, { light: true }); advance(m, .05); advance(m, .2, { light: true });
  assert.equal(m.fighters[0].stats.hits, 2);
});
test('V96 distance and opposing vertical lanes prevent phantom melee damage', () => {
  const m = activeMatch(); m.fighters[1].x = 850; advance(m, .4, { heavy: true });
  assert.equal(m.fighters[0].stats.hits, 0);
  const n = activeMatch(); n.fighters[1].y = 240; n.fighters[1].vy = 0; advance(n, .15, { light: true });
  assert.equal(n.fighters[0].stats.hits, 0);
});
test('V96 frontal guard reduces damage and costs stamina', () => {
  const m = activeMatch(); const target = m.fighters[1], before = target.hp;
  advance(m, .2, { light: true }, { guard: true });
  assert.equal(before - target.hp, 1); assert.equal(target.stats.blocks, 1); assert.ok(target.stamina < 89);
});
test('V96 guard does not stop an attack arriving from behind', () => {
  const m = activeMatch(), target = m.fighters[1]; target.guard = true; target.facing = 1;
  const hp = target.hp; advance(m, .2, { light: true }, { guard: true });
  assert.equal(hp - target.hp, 14); assert.equal(target.stats.blocks, 0);
});
test('V96 low-stamina guard breaks and produces a stagger event', () => {
  const m = activeMatch(); m.fighters[1].stamina = 10;
  advance(m, .32, { heavy: true }, { guard: true });
  assert.ok(m.events.some(e => e.type === 'guard-break')); assert.ok(m.fighters[1].stun > .5);
  assert.equal(m.fighters[1].stamina, 0); assert.equal(m.fighters[1].guard, false);
});
test('V96 Defender is an independent defensive fighter with cheaper guard', () => {
  const m = activeMatch({ opponentId: 'defender' }); m.fighters[1].stamina = 24;
  advance(m, .3, { heavy: true }, { guard: true });
  assert.equal(m.fighters[1].stats.blocks, 1); assert.ok(!m.events.some(e => e.type === 'guard-break'));
  assert.equal(m.fighters[1].hp, 269);
});
test('V96 insufficient stamina prevents an attack and recovery is capped', () => {
  const m = activeMatch(); m.fighters[0].stamina = 0;
  advance(m, .3, { heavy: true }); assert.equal(m.fighters[0].attack, null);
  advance(m, 5); assert.equal(m.fighters[0].stamina, 100);
});
test('V96 heavy recovery cannot be cancelled into a second attack', () => {
  const m = activeMatch(); advance(m, .03, { heavy: true }); advance(m, .1, { light: true, special: true });
  assert.equal(m.fighters[0].attack.kind, 'heavy'); assert.equal(m.fighters[0].stats.specials, 0);
});
test('V96 special projectile travels, misses a jump, and cannot hit twice', () => {
  const m = activeMatch({ playerId: 'spitter' }); m.fighters[1].x = 780;
  advance(m, .32, { special: true }); assert.equal(m.projectiles.length, 1); assert.equal(m.fighters[0].stats.hits, 0);
  advance(m, .7, { special: true }); assert.equal(m.fighters[0].stats.hits, 1); assert.equal(m.projectiles.length, 0);
  advance(m, 1, { special: true }); assert.equal(m.fighters[0].stats.hits, 1);
  const n = activeMatch({ playerId: 'spitter' }); n.fighters[1].x = 780;
  advance(n, .32, { special: true }); n.fighters[1].y = 230; n.fighters[1].vy = 250;
  advance(n, .42); assert.equal(n.fighters[0].stats.hits, 0);
});
test('V96 projectiles consume frontal guard exactly once', () => {
  const m = activeMatch({ playerId: 'xenoborg' }); m.fighters[1].x = 780;
  advance(m, 1, { special: true }, { guard: true });
  assert.equal(m.fighters[1].stats.blocks, 1); assert.equal(m.fighters[0].stats.hits, 1);
});
test('V96 jump is physical, cannot retrigger in air, and lands on the floor', () => {
  const m = activeMatch(); advance(m, .1, { jump: true }); assert.ok(m.fighters[0].y > 0);
  advance(m, 1.2, { jump: true }); assert.equal(m.fighters[0].y, 0); assert.equal(m.fighters[0].vy, 0);
  advance(m, .05); advance(m, .1, { jump: true }); assert.ok(m.fighters[0].y > 0);
});
test('V96 walls and body separation remain bounded under sustained pressure', () => {
  const m = activeMatch(); advance(m, 4, { right: true }, { right: true });
  assert.ok(m.fighters.every(f => f.x >= 100 && f.x <= 900));
  assert.ok(Math.abs(m.fighters[0].x - m.fighters[1].x) >= 60);
});
test('V96 timeout compares remaining health percentage, not asymmetric maximum HP', () => {
  const m = activeMatch({ opponentId: 'queen' }); m.timeRemaining = .01;
  advance(m, .03); assert.equal(m.roundWinner, 'draw'); assert.equal(m.roundReason, 'time');
  assert.deepEqual(m.wins, { player: 0, opponent: 0 });
});
test('V96 simultaneous lethal melee hits produce a real double KO', () => {
  const m = activeMatch({ opponentId: 'warrior' }); m.fighters.forEach(f => { f.hp = 10; });
  advance(m, .2, { light: true }, { light: true });
  assert.equal(m.roundWinner, 'draw'); assert.equal(m.roundReason, 'double-ko');
  assert.equal(m.fighters[0].hp, 0); assert.equal(m.fighters[1].hp, 0);
  assert.equal(m.fighters[0].stats.damage, 10);
});
test('V96 round transition resets health and retains aggregate statistics', () => {
  const m = activeMatch(); m.fighters[1].hp = 10; advance(m, .2, { light: true });
  assert.equal(m.phase, 'round-over'); assert.equal(m.wins.player, 1);
  assert.equal(nextXenoTrialsRoundV96(m), true); assert.equal(m.round, 2); assert.equal(m.phase, 'intro');
  assert.equal(m.fighters[0].stats.hits, 1); assert.equal(m.fighters[1].hp, 215); assert.equal(m.projectiles.length, 0);
  assert.equal(nextXenoTrialsRoundV96(m), false);
});
test('V96 match result is terminal, completed and side-specific even in a mirror match', () => {
  const m = activeMatch({ opponentId: 'warrior', matchId: 'xt96-77' });
  m.fighters[1].hp = 10; advance(m, .2, { light: true }); nextXenoTrialsRoundV96(m); advance(m, 1);
  m.fighters[0].x = 450; m.fighters[1].x = 550; m.fighters[1].hp = 10; advance(m, .2, { light: true });
  assert.equal(m.phase, 'match-over'); assert.equal(m.result.completed, true); assert.equal(m.result.matchId, 'xt96-77');
  assert.equal(m.result.winner, 'player'); assert.deepEqual(m.result.wins, { player: 2, opponent: 0 });
  const final = getXenoTrialsSnapshotV96(m); advance(m, 5, { heavy: true }, null); assert.deepEqual(m, final);
  assert.equal(nextXenoTrialsRoundV96(m), false); assert.equal(setXenoTrialsPausedV96(m, true), false);
});
test('V96 five draws terminate the default first-to-two match rather than loop forever', () => {
  const m = activeMatch();
  for (let round = 0; round < 5; round++) {
    m.timeRemaining = STEP; advance(m, STEP); if (round < 4) { nextXenoTrialsRoundV96(m); advance(m, 1); }
  }
  assert.equal(m.phase, 'match-over'); assert.equal(m.result.rounds, 5); assert.equal(m.result.winner, 'draw');
});
test('V96 repeated seed and input timeline reproduce the full deterministic AI state', () => {
  const a = activeMatch({ seed: 445, difficulty: 'hard' }), b = activeMatch({ seed: 445, difficulty: 'hard' });
  for (let n = 0; n < 1400; n++) {
    const controls = { right: n < 300, light: n % 60 < 10, guard: n % 160 > 130 };
    stepXenoTrialsMatchV96(a, STEP, controls, null); stepXenoTrialsMatchV96(b, STEP, controls, null);
  }
  assert.deepEqual(a, b); assert.ok(a.events.some(e => e.type === 'hit' || e.type === 'block'));
});
test('V96 snapshots are detached from engine state, including config, result and nested stats', () => {
  const m = activeMatch(), snapshot = getXenoTrialsSnapshotV96(m);
  snapshot.fighters[0].hp = -500; snapshot.config.playerId = 'none'; snapshot.fighters[0].stats.hits = 100;
  assert.equal(m.fighters[0].hp, 220); assert.equal(m.config.playerId, 'warrior'); assert.equal(m.fighters[0].stats.hits, 0);
});

class Bus {
  events = new Map(); hidden = false;
  addEventListener(type, fn) { if (!this.events.has(type)) this.events.set(type, new Set()); this.events.get(type).add(fn); }
  removeEventListener(type, fn) { this.events.get(type)?.delete(fn); }
  dispatch(type, extra = {}) { for (const fn of this.events.get(type) || []) fn({ type, preventDefault() {}, ...extra }); }
  count() { return [...this.events.values()].reduce((sum, handlers) => sum + handlers.size, 0); }
}
function runtimeFixture(extra = {}) {
  const win = new Bus(), doc = new Bus(), canvas = new Bus(), root = new Bus(), frames = new Map();
  let serial = 0, time = 0;
  const context = new Proxy({}, { get: (target, key) => target[key] || (() => {}), set: (target, key, value) => { target[key] = value; return true; } });
  Object.assign(canvas, { width: 960, height: 540, ownerDocument: doc, tagName: 'CANVAS', getContext: () => context,
    setAttribute() {}, focus() { doc.activeElement = canvas; } });
  root.contains = () => true;
  const states = [], results = [], errors = [];
  const runtime = createXenoTrialsRuntimeV96({ canvas, window: win, document: doc, controlsRoot: root,
    requestAnimationFrame: fn => { frames.set(++serial, fn); return serial; }, cancelAnimationFrame: id => frames.delete(id),
    loadImage: async () => ({ naturalWidth: 1536, naturalHeight: 1024 }),
    onState: state => states.push(state), onResult: result => results.push(result), onAssetError: error => errors.push(error), ...extra });
  return { runtime, win, doc, canvas, context, root, frames, states, results, errors,
    run(count = 1, deltaMs = 1000 / 60) { for (let i = 0; i < count; i++) { const entry = frames.entries().next().value; if (!entry) break; frames.delete(entry[0]); time += deltaMs; entry[1](time); } } };
}

test('V99 loads only the selected arena backdrop alongside fighter images without changing gameplay', async t => {
  const loaded = [];
  const f = runtimeFixture({ config: { stageId: 'tantalus-cargo' }, loadImage: async path => {
    loaded.push(path); return { naturalWidth: 1600, naturalHeight: 900 };
  } }); t.after(() => f.runtime.stop());
  assert.equal(await f.runtime.start(), true);
  assert.equal(loaded.length, 3);
  assert.equal(loaded.filter(p => p.includes('/metroidvania/')).length, 1);
  assert.ok(loaded.includes('/assets/openai/metroidvania/zones/ship-cargo-far.png'));
  assert.equal(f.runtime.getState().stageVisual, 'backdrop-ready');
  assert.equal(f.runtime.getState().timeRemaining, 99);
  assert.equal(f.runtime.getState().tick, 0);
  assert.equal(f.errors.length, 0);
});

test('V99 long fighter labels remain inside their HUD and introduction panels', async t => {
  const f = runtimeFixture({ config: { playerId: 'albino-combat-synth', opponentId: 'predalien' } });
  t.after(() => f.runtime.stop());
  const labels = [];
  f.context.measureText = value => ({ width: value.length * Number(/(\d+)px/.exec(f.context.font)?.[1] || 16) * .65 });
  f.context.fillText = (value, x, y) => labels.push({ value, x, y, width: f.context.measureText(value).width });
  await f.runtime.start(); f.run(1);
  const hud = labels.filter(l => l.y === 31), intro = labels.filter(l => l.y === 185);
  assert.ok(hud.length && intro.length);
  assert.ok(hud.every(l => l.width <= 385)); assert.ok(intro.every(l => l.width <= 570));
  assert.ok(labels.some(l => l.y === 218 && l.value.includes('SYNTHÉTIQUE') && l.value.includes('POLYVALENT')));
});

test('V99 missing scenery falls back explicitly, while fighter art failures still block combat', async t => {
  const f = runtimeFixture({ config: { stageId: 'tantalus-bridge' }, loadImage: async path => {
    if (path.includes('/metroidvania/')) throw new Error('offline scenery');
    return { naturalWidth: 1536, naturalHeight: 1024 };
  } }); t.after(() => f.runtime.stop());
  assert.equal(await f.runtime.start(), true);
  assert.equal(f.runtime.getState().stageVisual, 'procedural-fallback');
  assert.equal(f.runtime.getState().paused, false);
  assert.equal(f.errors.length, 0);
  f.run(65, 100); assert.ok(f.runtime.getState().tick > 0);
});

test('V97 presentation freezes timer, simulation, AI and stamina through both introductions and countdown', async t => {
  const f = runtimeFixture(); t.after(() => f.runtime.stop()); await f.runtime.start(); f.run(1, 100);
  const initial = f.runtime.getState();
  const simulation = snapshot => { const { presentation, ...rest } = snapshot; return rest; };
  for (const [frames, phase] of [[12, 'intro-opponent'], [12, 'countdown'], [29, 'countdown']]) {
    f.runtime.setInput('right', true); f.runtime.setInput('heavy', true); f.run(frames, 100);
    const state = f.runtime.getState(); assert.equal(state.presentation.phase, phase);
    assert.deepEqual(simulation(state), simulation(initial)); assert.equal(state.timeRemaining, 99);
  }
  f.run(1, 100); const signal = f.runtime.getState();
  assert.equal(signal.presentation.phase, 'fight'); assert.equal(signal.tick, 0); assert.equal(signal.timeRemaining, 99);
  f.run(1, 100); assert.equal(f.runtime.getState().tick, 12);
  assert.ok(Math.abs(f.runtime.getState().timeRemaining - 98.9) < 1e-8);
});

test('V97 introduction input cannot buffer movement, a jump or an attack across the fight signal', async t => {
  const f = runtimeFixture(); t.after(() => f.runtime.stop()); await f.runtime.start(); f.run(1, 100);
  const right = { getAttribute: () => 'right', setPointerCapture() {} }, jump = { getAttribute: () => 'jump' };
  f.win.dispatch('keydown', { code: 'ArrowRight', target: f.canvas });
  f.win.dispatch('keydown', { code: 'KeyJ', target: f.canvas });
  f.root.dispatch('pointerdown', { pointerId: 1, target: { closest: () => right } });
  f.root.dispatch('keydown', { code: 'Enter', target: { closest: () => jump } });
  f.runtime.setInput('heavy', true); f.runtime.setInput('special', true);
  f.run(54, 100); assert.equal(f.runtime.getState().presentation.phase, 'fight');
  f.win.dispatch('keydown', { code: 'ArrowRight', target: f.canvas, repeat: true });
  f.win.dispatch('keydown', { code: 'KeyJ', target: f.canvas, repeat: true });
  f.run(1, 100);
  let player = f.runtime.getState().fighters[0];
  assert.equal(player.x, 310); assert.equal(player.y, 0); assert.equal(player.attack, null); assert.equal(player.stamina, 100);
  f.win.dispatch('keyup', { code: 'ArrowRight' }); f.win.dispatch('keyup', { code: 'KeyJ' });
  f.win.dispatch('keydown', { code: 'ArrowRight', target: f.canvas });
  f.win.dispatch('keydown', { code: 'KeyJ', target: f.canvas }); f.run(1, 100);
  player = f.runtime.getState().fighters[0]; assert.equal(player.attack?.kind, 'light');
  assert.ok(player.stamina < 100); assert.ok(player.x > 310);
});

test('V97 blur and hidden-tab pause freeze presentation and resume without wall-clock debt', async t => {
  const f = runtimeFixture(); t.after(() => f.runtime.stop()); await f.runtime.start(); f.run(1, 100); f.run(7, 100);
  f.win.dispatch('blur'); const paused = f.runtime.getState(); f.run(200, 10000);
  assert.deepEqual(f.runtime.getState(), paused); assert.equal(paused.presentation.elapsedMs, 700);
  assert.equal(f.runtime.resume(), true); f.run(1, 10000);
  assert.equal(f.runtime.getState().presentation.elapsedMs, 700); assert.equal(f.runtime.getState().tick, 0);
  f.run(1, 10000); assert.equal(f.runtime.getState().presentation.elapsedMs, 800);
  f.doc.hidden = true; f.doc.dispatch('visibilitychange'); const hidden = f.runtime.getState(); f.run(20, 1000);
  assert.deepEqual(f.runtime.getState(), hidden); assert.equal(f.runtime.resume(), false);
  f.doc.hidden = false; f.doc.dispatch('visibilitychange'); assert.equal(f.runtime.getState().paused, true);
});

test('V97 engine holds a completed round until runtime can install the next countdown', () => {
  const m = activeMatch({ introSeconds: 0, holdRoundTransition: true }); m.fighters[1].hp = 10;
  advance(m, .2, { light: true }); assert.equal(m.phase, 'round-over');
  const timer = m.timeRemaining, fighters = structuredClone(m.fighters), rng = m.rng;
  advance(m, 3); assert.equal(m.round, 1); assert.equal(m.phase, 'round-over'); assert.ok(m.phaseTime < 0);
  assert.equal(m.timeRemaining, timer); assert.equal(m.rng, rng);
  // Rearm bookkeeping may change, but combat state and aggregate damage cannot.
  assert.deepEqual(m.fighters.map(({ rearmControls, ...rest }) => rest), fighters.map(({ rearmControls, ...rest }) => rest));
  assert.equal(nextXenoTrialsRoundV96(m), true); assert.equal(m.round, 2); assert.equal(m.timeRemaining, 99);
});

test('V97 automatic round transition restores a full timer and freezes it during the next countdown', async t => {
  const f = runtimeFixture({ config: { roundSeconds: 15, playerId: 'queen', opponentId: 'queen', difficulty: 'easy', seed: 7 } });
  t.after(() => f.runtime.stop()); await f.runtime.start();
  for (let frame = 0; frame < 1000 && f.runtime.getState().round === 1; frame++) f.run(1, 100);
  const first = f.runtime.getState(); assert.equal(first.round, 2); assert.equal(first.presentation.phase, 'countdown');
  assert.equal(first.timeRemaining, 15); assert.equal(first.presentation.elapsedMs, 0);
  f.run(29, 100); const last = f.runtime.getState();
  assert.equal(last.tick, first.tick); assert.equal(last.rng, first.rng); assert.equal(last.timeRemaining, 15);
  assert.deepEqual(last.fighters, first.fighters); assert.equal(last.presentation.countdown, 1);
  f.run(1, 100); assert.equal(f.runtime.getState().presentation.phase, 'fight'); assert.equal(f.runtime.getState().timeRemaining, 15);
  f.run(1, 100); assert.ok(Math.abs(f.runtime.getState().timeRemaining - 14.9) < 1e-8);
});

test('V97 manual next-round refuses paused or stopped runtimes and introduces only one new round', async t => {
  const f = runtimeFixture({ config: { roundSeconds: 15, roundsToWin: 3, playerId: 'queen', opponentId: 'queen', difficulty: 'easy', seed: 7 } });
  t.after(() => f.runtime.stop()); await f.runtime.start();
  for (let frame = 0; frame < 1000 && f.runtime.getState().phase !== 'round-over'; frame++) f.run(1, 100);
  assert.equal(f.runtime.getState().phase, 'round-over'); f.runtime.pause();
  const paused = f.runtime.getState(); assert.equal(f.runtime.nextRound(), false); f.run(20, 100);
  assert.deepEqual(f.runtime.getState(), paused); f.runtime.resume();
  assert.equal(f.runtime.nextRound(), true); assert.equal(f.runtime.getState().round, 2);
  assert.equal(f.runtime.getState().presentation.phase, 'countdown'); assert.equal(f.runtime.nextRound(), false);
  for (let frame = 0; frame < 1000 && f.runtime.getState().phase !== 'round-over'; frame++) f.run(1, 100);
  assert.equal(f.runtime.getState().phase, 'round-over'); f.runtime.stop(); const stopped = f.runtime.getState();
  assert.equal(f.runtime.nextRound(), false); assert.deepEqual(f.runtime.getState(), stopped);
});
test('V96 runtime loads exact two images, starts once and removes all listeners/RAF on stop', async () => {
  const loaded = [], f = runtimeFixture({ loadImage: async path => { loaded.push(path); return { naturalWidth: 1 }; } });
  assert.equal(await f.runtime.start(), true); await f.runtime.start();
  assert.equal(loaded.length, 2); assert.equal(f.frames.size, 1); assert.ok(f.win.count() > 0);
  f.run(80); assert.equal(f.runtime.getState().phase, 'active');
  f.runtime.stop(); f.runtime.stop(); assert.equal(f.win.count(), 0); assert.equal(f.doc.count(), 0); assert.equal(f.root.count(), 0);
  assert.equal(f.frames.size, 0); assert.equal(f.canvas.width, 960); assert.equal(f.canvas.height, 540); assert.equal(await f.runtime.start(), false);
});
test('V96 runtime asset failure pauses, reports exact path and refuses invisible combat', async () => {
  const f = runtimeFixture({ loadImage: async () => { throw new Error('offline'); } });
  assert.equal(await f.runtime.start(), false); assert.equal(f.runtime.getState().paused, true); assert.equal(f.errors[0].length, 2);
  f.run(120); assert.equal(f.runtime.getState().tick, 0); assert.equal(f.runtime.resume(), false); f.runtime.stop();
});
test('V96 runtime blur and visibility pause without auto-resuming or leaked held movement', async () => {
  const f = runtimeFixture(); await f.runtime.start(); f.run(370);
  f.win.dispatch('keydown', { code: 'ArrowRight', target: f.canvas }); f.run(3); f.win.dispatch('blur');
  const x = f.runtime.getState().fighters[0].x, tick = f.runtime.getState().tick; f.run(20);
  assert.equal(f.runtime.getState().tick, tick); f.runtime.resume();
  f.win.dispatch('keydown', { code: 'ArrowRight', target: f.canvas, repeat: true }); f.run(10);
  assert.equal(f.runtime.getState().fighters[0].x, x);
  f.win.dispatch('keyup', { code: 'ArrowRight' }); f.win.dispatch('keydown', { code: 'ArrowRight', target: f.canvas }); f.run(5);
  assert.ok(f.runtime.getState().fighters[0].x > x);
  f.doc.hidden = true; f.doc.dispatch('visibilitychange'); assert.equal(f.runtime.getState().paused, true);
  assert.equal(f.runtime.resume(), false); f.doc.hidden = false; f.doc.dispatch('visibilitychange'); assert.equal(f.runtime.getState().paused, true); f.runtime.stop();
});
test('V96 runtime ignores gameplay in text inputs and permits explicit pause/resume keys', async () => {
  const f = runtimeFixture(); await f.runtime.start(); f.run(370); const x = f.runtime.getState().fighters[0].x;
  f.win.dispatch('keydown', { code: 'ArrowRight', target: { tagName: 'INPUT' } }); f.run(5); assert.equal(f.runtime.getState().fighters[0].x, x);
  f.win.dispatch('keydown', { code: 'KeyP' }); assert.equal(f.runtime.getState().paused, true);
  f.win.dispatch('keydown', { code: 'KeyP', repeat: true }); assert.equal(f.runtime.getState().paused, true);
  f.win.dispatch('keydown', { code: 'Escape' }); assert.equal(f.runtime.getState().paused, false); f.runtime.stop();
});
test('V96 runtime multitouch cancels the released pointer without clearing other held controls', async () => {
  const f = runtimeFixture(); await f.runtime.start(); f.run(370);
  const button = action => ({ getAttribute: () => action, setPointerCapture() {} });
  const right = button('right'), guard = button('guard');
  f.root.dispatch('pointerdown', { pointerId: 1, target: { closest: () => right } });
  f.root.dispatch('pointerdown', { pointerId: 2, target: { closest: () => guard } }); f.run(3);
  assert.equal(f.runtime.getState().fighters[0].guard, true);
  f.root.dispatch('pointercancel', { pointerId: 2 }); const x = f.runtime.getState().fighters[0].x; f.run(4);
  assert.ok(f.runtime.getState().fighters[0].x > x); f.root.dispatch('pointerup', { pointerId: 1 }); f.runtime.stop();
});
test('V96 on-screen controls are keyboard-operable and focus loss releases held buttons', async () => {
  const f = runtimeFixture(); await f.runtime.start(); f.run(370);
  const button = { getAttribute: () => 'right' }, target = { closest: () => button };
  const x = f.runtime.getState().fighters[0].x;
  f.root.dispatch('keydown', { code: 'Enter', target }); f.run(4);
  assert.ok(f.runtime.getState().fighters[0].x > x);
  f.root.dispatch('focusout'); const stoppedX = f.runtime.getState().fighters[0].x; f.run(4);
  assert.equal(f.runtime.getState().fighters[0].x, stoppedX); f.runtime.stop();
});
test('V96 stopping during asynchronous image loading cannot install listeners or schedule a frame', async () => {
  const pending = [], f = runtimeFixture({ loadImage: () => new Promise(resolve => pending.push(resolve)) });
  const started = f.runtime.start(); f.runtime.stop(); for (const resolve of pending) resolve({ naturalWidth: 1 });
  assert.equal(await started, false); assert.equal(f.win.count(), 0); assert.equal(f.frames.size, 0);
});
test('V96 native image loading has a bounded timeout and cannot leave the terminal loading forever', async () => {
  const f = runtimeFixture({ loadImage: null, imageTimeoutMs: 10 });
  f.win.Image = class Image { set src(value) { this.path = value; } };
  assert.equal(await f.runtime.start(), false); assert.equal(f.errors.length, 1); assert.equal(f.runtime.getState().paused, true); f.runtime.stop();
});
test('V96 stop cancels pending native image loaders and their timeout handles', async () => {
  const f = runtimeFixture({ loadImage: null, imageTimeoutMs: 30000 });
  const native = []; f.win.Image = class Image { constructor() { native.push(this); } set src(value) { this.path = value; } };
  const loading = f.runtime.start(); f.runtime.stop();
  assert.equal(await loading, false); assert.equal(native.length, 2);
  assert.ok(native.every(image => image.onload === null && image.onerror === null)); assert.equal(f.frames.size, 0);
});
test('V96 runtime terminal callback emits exactly once without granting itself any rewards', async () => {
  const f = runtimeFixture({ config: { playerId: 'queen', opponentId: 'queen', difficulty: 'easy', roundSeconds: 15, roundsToWin: 1, seed: 7 } });
  await f.runtime.start(); f.run(10000);
  assert.equal(f.runtime.getState().phase, 'match-over'); assert.equal(f.results.length, 1); assert.equal(f.results[0].completed, true);
  f.run(100); assert.equal(f.results.length, 1); assert.equal('credits' in f.results[0], false); f.runtime.stop();
});
