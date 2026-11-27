import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import {
  XENO_TRIALS_PRESENTATIONS_V211, getXenoTrialsPresentationPoseV211, getXenoTrialsPresentationRigV211
} from '../src/xeno-trials-presentation-v211.js';
import { drawXenoTrialsRigV154, sampleXenoTrialsSequenceAnglesV211 } from '../src/xeno-trials-rig-v154.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { createXenoTrialsOutroV155, createXenoTrialsTerminalV156, skipXenoTrialsOutroV155 } from '../src/xeno-trials-sequences-v155.js';

const makeMatch = (playerId = 'warrior', opponentId = 'runner', extra = {}) =>
  createXenoTrialsMatchV96({ playerId, opponentId, matchId: 'presentation-v211', introSeconds: 0, ...extra });

const actorRig = actor => getXenoTrialsPresentationRigV211(getXenoTrialsFighterV96(actor.id), getXenoTrialsArtV96(actor.id, actor.variant));
const pose = (match, fighter, clocks, reduced = false) =>
  getXenoTrialsPresentationPoseV211(actorRig(fighter), match, fighter, clocks, reduced);
const owner = (state, side) => state.rigViewsV154.find(row => row.side === side);
const context = () => new Proxy({
  measureText: value => ({ width: String(value).length * 7 }),
  createLinearGradient: () => ({ addColorStop() {} }),
}, { get: (object, key) => object[key] ?? (() => {}) });
const image = rig => ({ naturalWidth: rig.sourceWidth, naturalHeight: rig.sourceHeight, complete: true });
const mirrors = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, [a, b]);
const intro = (elapsedMs, fighterSlot = 0) => ({ blocksSimulation: true, phase: fighterSlot === 0 ? 'intro-player' : 'intro-opponent', fighterSlot, elapsedMs });

test('all admitted names correspond to exact sheet 09 rows and distinct source-bound rigs', () => {
  const { rows } = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url))).tables['09_Presentations'];
  const byId = new Map(rows.map(([id, fighter]) => [id, fighter]));
  const catalog = XENO_TRIALS_PRESENTATIONS_V211;
  assert.equal(catalog.length, 1820);
  assert.equal(new Set(catalog.map(row => row.id)).size, catalog.length);
  assert.equal(new Set(catalog.map(row => row.fighterId)).size, 185);
  for (const entry of catalog) {
    assert.equal(entry.fighterId, byId.get(entry.id), entry.id);
    const exact = actorRig({ id: entry.fighterId, variant: 'grey' });
    assert.equal(exact?.id, entry.rigId);
    assert.equal(exact.path, entry.sourcePath);
    assert.equal(exact.sourceSha256, entry.sourceSha256);
    assert.equal(entry.canonExact, false);
  }
});

test('the complete admitted set can render a finite keyed opponent reaction on the correct plate', () => {
  const ctx = context();
  const rows = XENO_TRIALS_PRESENTATIONS_V211.filter(row => row.kind === 'intro-rival');
  for (const row of rows) {
    const match = makeMatch('warrior', row.fighterId);
    const fighter = match.fighters[1], rig = actorRig(fighter);
    const frame = pose(match, fighter, { presentation: intro(672) });
    assert.equal(frame?.sequenceIdV211, row.id);
    assert.ok(frame.active, row.id);
    const projected = drawXenoTrialsRigV154(ctx, rig, image(rig), frame,
      { width: rig.sourceWidth / 5, height: rig.sourceHeight / 5, pivotX: .5, bottom: 1 }, fighter.x, 450, fighter.facing);
    assert.ok(projected?.drawn, row.id);
    for (const contact of Object.values(frame.contacts)) assert.ok(contact.every(Number.isFinite), row.id);
    assert.equal(getXenoTrialsPresentationRigV211(getXenoTrialsFighterV96(fighter.id), { ...getXenoTrialsArtV96(fighter.id), path: '/wrong.png' }), null);
  }
});

test('two orientations mirror the drawn points, preserve supports and reject foreign or reduced motion', () => {
  const round = makeMatch('user-rhino', 'synth-heavy');
  for (const fighter of round.fighters) {
    const rig = actorRig(fighter);
    const p = { presentation: intro(540, round.fighters.indexOf(fighter)) };
    const frame = pose(round, fighter, p), ctx = context();
    assert.ok(frame?.active);
    const metrics = { width: 175, height: 170, pivotX: .45, bottom: 1 };
    const left = drawXenoTrialsRigV154(ctx, rig, image(rig), frame, metrics, 500, 450, -1);
    const right = drawXenoTrialsRigV154(ctx, rig, image(rig), frame, metrics, 500, 450, 1);
    assert.ok(left && right);
    for (const bone of Object.keys(right.contacts)) {
      mirrors(left.contacts[bone][0] + right.contacts[bone][0], 1000);
      mirrors(left.contacts[bone][1], right.contacts[bone][1]);
    }
    for (const [name, anchor] of Object.entries(rig.contacts)) {
      if (anchor.bone === 'hips') {
        mirrors(frame.contacts[name][0], anchor.point[0]);
        mirrors(frame.contacts[name][1], anchor.point[1]);
      }
    }
    assert.equal(pose(round, fighter, p, true), null);
    assert.equal(sampleXenoTrialsSequenceAnglesV211({ ...rig }, { progress: .5, elapsed: .5 }, {}), null);
  }
});

function physical(match) {
  return structuredClone({
    tick: match.tick, timeRemaining: match.timeRemaining, fighters: match.fighters,
    wins: match.wins, result: match.result, events: match.events, projectiles: match.projectiles,
  });
}

function winByControls(match) {
  for (let i = 0; i < 500 && match.phase === 'active'; i++) {
    const [player, opponent] = match.fighters;
    const gap = getXenoTrialsBodyGapV105(player, opponent);
    const movement = gap > 28 ? { right: player.x < opponent.x, left: player.x > opponent.x } : { light: i % 3 === 0 };
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, movement, {});
  }
  assert.equal(match.result?.winner, 'player');
  return match.result;
}

test('a real KO joins the signed terminal clock without new damage or score, and stays down after an ellipsis', () => {
  const match = makeMatch('warrior', 'runner', { roundsToWin: 1, rulesV119: { initialHp: 1 } });
  const result = winByControls(match), before = physical(match);
  const clock = createXenoTrialsOutroV155(match);
  assert.deepEqual(clock.participants.map(row => row.sequenceId), ['warrior::win-final', 'runner::lose-final']);
  const decoded = new Map(match.fighters.map(fighter => {
    const rig = actorRig(fighter);
    return [rig.path, image(rig)];
  }));
  assert.deepEqual(createXenoTrialsOutroV155(match, false, decoded), clock);
  assert.equal(createXenoTrialsOutroV155(match, false, new Map()), null);
  for (const plate of decoded.values()) plate.naturalWidth--;
  assert.equal(createXenoTrialsOutroV155(match, false, decoded), null);
  const fixed = skipXenoTrialsOutroV155(clock);
  assert.equal(fixed.phase, 'complete');
  assert.equal(pose(match, match.fighters[0], { outro: fixed }), null);
  const down = pose(match, match.fighters[1], { outro: fixed });
  assert.ok(down?.settledV211);
  assert.equal(pose(match, match.fighters[1], { outro: { ...fixed, terminalTick: match.tick + 1 } }), null);
  assert.equal(pose(match, match.fighters[1], { outro: { ...fixed, matchId: 'different' } }), null);
  assert.equal(createXenoTrialsTerminalV156(match, 'outro', false, fixed), null);
  const playing = { ...clock, elapsedMs: 900 };
  assert.equal(pose(match, match.fighters[0], { outro: playing })?.sequenceIdV211, 'warrior::win-final');
  assert.equal(pose(match, match.fighters[1], { outro: playing })?.sequenceIdV211, 'runner::lose-final');
  const fake = { ...playing, participants: playing.participants.map(row => ({ ...row, sequenceId: 'fake' })) };
  assert.equal(pose(match, match.fighters[0], { outro: fake }), null);
  assert.equal(match.result, result);
  assert.deepEqual(physical(match), before);
});

test('draws and time-limit returns preserve their roles and keep living and KO recovery separate', () => {
  const draw = makeMatch('warrior', 'runner', { roundsToWin: 1, roundSeconds: 15, rulesV119: { initialHp: 1 } });
  for (let i = 0; i < 6500 && draw.phase !== 'match-over'; i++) stepXenoTrialsMatchV96(draw, XENO_TRIALS_STEP_V96, {}, {});
  assert.equal(draw.result?.winner, 'draw');
  const clock = createXenoTrialsTerminalV156(draw, 'draw');
  assert.deepEqual(clock.participants.map(row => row.sequenceId), ['warrior::draw', 'runner::draw']);
  assert.equal(createXenoTrialsOutroV155(draw), null);
  const timeWin = makeMatch('warrior', 'runner');
  timeWin.phase = 'match-over';
  timeWin.result = {
    completed: true, matchId: timeWin.config.matchId, durationTicks: timeWin.tick, winner: 'player', reason: 'time',
  };
  const before = physical(timeWin), outcome = createXenoTrialsOutroV155(timeWin);
  const settled = { ...outcome, phase: 'complete', elapsedMs: outcome.durationMs };
  const vigilance = createXenoTrialsTerminalV156(timeWin, 'outro', false, settled);
  assert.deepEqual(vigilance.participants.map(row => row.sequenceId), ['warrior::outro', 'runner::outro']);
  for (const fighter of timeWin.fighters) {
    const last = pose(timeWin, fighter, { outro: settled });
    const first = pose(timeWin, fighter, { terminal: vigilance });
    assert.deepEqual(first.vertices, last.vertices);
  }
  assert.deepEqual(physical(timeWin), before);
});

function createHost(extra = {}) {
  const handlers = new Map();
  const window = { addEventListener: (type, listener) => handlers.set(type, listener), removeEventListener: type => handlers.delete(type) };
  const document = { hidden: false, hasFocus: () => true };
  const display = { tagName: 'CANVAS', width: 1000, height: 560, getContext: context, setAttribute() {},
    closest: () => null, focus() { document.activeElement = this; } };
  document.activeElement = display;
  const queue = new Map(), results = [];
  let serial = 0, time = 0;
  const assets = [actorRig({ id: 'warrior' }), actorRig({ id: 'runner' })];
  const runtime = createXenoTrialsRuntimeV96({
    canvas: display, window, document,
    config: { playerId: 'warrior', opponentId: 'runner', stageId: 'containment-deck', difficulty: 'easy', seed: 96001,
      roundsToWin: 2, rulesV119: { initialHp: 1, noSpecial: true }, ...extra },
    loadImage: async path => image(assets.find(rig => rig.path === path) || { sourceWidth: 1024, sourceHeight: 1024 }),
    requestAnimationFrame(callback) { queue.set(++serial, callback); return serial; },
    cancelAnimationFrame(token) { queue.delete(token); },
    onResult: result => results.push(result),
  });
  const frame = (count = 1) => {
    for (let i = 0; i < count; i++) {
      time += 1000 / 120;
      for (const [id, callback] of [...queue]) if (queue.delete(id)) callback(time);
      assert.ok(queue.size <= 1);
    }
  };
  return { runtime, queue, results, frame, key(code, pressed = true) {
    handlers.get(pressed ? 'keydown' : 'keyup')?.({ code, target: display, preventDefault() {} });
  } };
}

test('the two real intros, taunt, round intermission and rearm are reachable in the native runtime', async () => {
  const h = createHost(), { runtime } = h;
  try {
    assert.equal(await runtime.start(), true);
    h.frame(45);
    let state = runtime.getState();
    assert.equal(owner(state, 'player')?.sequenceIdV211, 'warrior::intro');
    assert.equal(owner(state, 'opponent')?.sequenceIdV211, 'runner::intro-rival');
    assert.equal(runtime.pause(), true);
    h.frame(30);
    assert.equal(runtime.getState().presentation.elapsedMs, state.presentation.elapsedMs);
    assert.equal(runtime.skipSequence(), false);
    assert.equal(runtime.resume(), true);
    assert.equal(runtime.skipSequence(), true);
    h.frame(30);
    state = runtime.getState();
    assert.equal(owner(state, 'opponent')?.sequenceIdV211, 'runner::intro');
    assert.equal(owner(state, 'player')?.sequenceIdV211, 'warrior::intro-rival');
    assert.equal(runtime.skipSequence(), true);
    assert.equal(runtime.getState().presentation.countdown, 3);
    assert.equal(runtime.skipSequence(), false);
    for (let i = 0; i < 390 && runtime.getState().presentation.blocksSimulation; i++) h.frame();
    assert.equal(runtime.getState().canTauntV156, true);
    h.key('KeyT');
    h.frame(15);
    assert.equal(owner(runtime.getState(), 'player')?.sequenceIdV211, 'warrior::taunt');
    h.key('KeyJ');
    h.frame();
    assert.equal(runtime.getState().tauntV156?.phase, 'cancelled');
    h.key('KeyJ', false);
    for (let i = 0; i < 700 && runtime.getState().phase === 'active'; i++) {
      const live = runtime.getState(), [a,b] = live.fighters;
      const gap = getXenoTrialsBodyGapV105(a,b);
      runtime.setInput('right', gap > 26 && b.x > a.x);
      runtime.setInput('left', gap > 26 && b.x < a.x);
      runtime.setInput('light', gap <= 26 && i % 3 === 0);
      h.frame();
    }
    state = runtime.getState();
    assert.equal(state.phase, 'round-over');
    h.frame(28);
    state = runtime.getState();
    assert.equal(owner(state, state.roundWinner)?.sequenceIdV211.split('::')[1], 'win-r1');
    const defeated = state.roundWinner === 'player' ? 'opponent' : 'player';
    assert.equal(owner(state, defeated)?.sequenceIdV211.split('::')[1], 'lose-r1');
    assert.equal(h.results.length, 0);
    assert.equal(runtime.nextRound(), true);
    h.frame(100);
    state = runtime.getState();
    assert.equal(state.round, 2);
    assert.equal(owner(state, 'player')?.sequenceIdV211, 'warrior::rematch');
    assert.equal(owner(state, 'opponent')?.sequenceIdV211, 'runner::rematch');
    assert.ok(state.fighters.every(fighter => fighter.hp === 1));
  } finally { runtime.stop(); }
});

test('a native terminal callback pays once across pause, resume and skipping', async () => {
  const h = createHost({ roundsToWin: 1 }), { runtime } = h;
  try {
    assert.equal(await runtime.start(), true);
    runtime.skipSequence(); runtime.skipSequence(); h.frame(440);
    for (let i = 0; i < 700 && runtime.getState().phase === 'active'; i++) {
      const [a,b] = runtime.getState().fighters, gap = getXenoTrialsBodyGapV105(a,b);
      runtime.setInput('right', gap > 25 && b.x > a.x);
      runtime.setInput('left', gap > 25 && b.x < a.x);
      runtime.setInput('light', gap <= 25 && i % 3 === 0);
      h.frame();
    }
    const s = runtime.getState();
    assert.equal(s.phase, 'match-over');
    assert.equal(h.results.length, 1);
    assert.ok(s.outroV155?.participants.every(row => row.revision === 211));
    const before = physical(s);
    h.frame(90);
    assert.equal(owner(runtime.getState(), s.result.winner)?.sequenceIdV211.split('::')[1], 'win-final');
    runtime.pause();
    const elapsed = runtime.getState().outroV155.elapsedMs;
    h.frame(120);
    assert.equal(runtime.getState().outroV155.elapsedMs, elapsed);
    assert.equal(runtime.skipSequence(), false);
    assert.equal(runtime.resume(), true);
    assert.equal(runtime.skipSequence(), true);
    h.frame(200);
    assert.equal(runtime.skipSequence(), false);
    assert.equal(h.results.length, 1);
    assert.deepEqual(physical(runtime.getState()), before);
  } finally { runtime.stop(); }
});
