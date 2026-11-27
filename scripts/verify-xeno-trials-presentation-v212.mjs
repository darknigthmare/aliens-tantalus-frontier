import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import {
  createXenoTrialsPilotOutroV197, createXenoTrialsPilotReturnV212, getXenoTrialsPilotSequenceV197,
  XENO_TRIALS_PILOT_RETURNS_V212,
} from '../src/xeno-trials-pilot-sequences-v197.js';
import { getXenoTrialsRigV154 } from '../src/xeno-trials-rig-v154.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { advanceXenoTrialsOutroV155, createXenoTrialsTerminalV156, skipXenoTrialsOutroV155 } from '../src/xeno-trials-sequences-v155.js';

const WARDEN = 'import-game-afe2-warden';
const rigFor = id => getXenoTrialsRigV154(getXenoTrialsFighterV96(id), getXenoTrialsArtV96(id));
const image = rig => ({ naturalWidth: rig.sourceWidth, naturalHeight: rig.sourceHeight, complete: true });
const sameFrame = (a, b) => {
  assert.deepEqual(a.vertices, b.vertices);
  assert.deepEqual(a.contacts, b.contacts);
};

function terminalFixture(id, winner = 'player', airborne = 0) {
  const match = createXenoTrialsMatchV96({ playerId: id, opponentId: 'warrior', introSeconds: 0 });
  const pilot = match.fighters[0];
  pilot.y = airborne;
  match.phase = 'match-over';
  match.result = {
    completed: true, winner, reason: 'time', matchId: match.config.matchId, durationTicks: match.tick,
  };
  return { match, pilot, rig: rigFor(id) };
}

test('five missing Bible outro IDs start from the exact verdict pose in either result', () => {
  const { rows } = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url))).tables['09_Presentations'];
  assert.equal(XENO_TRIALS_PILOT_RETURNS_V212.length, 5);
  for (const entry of XENO_TRIALS_PILOT_RETURNS_V212) {
    const row = rows.find(row => row[0] === entry.id);
    assert.ok(row && row[1] === entry.fighterId, entry.id);
    for (const winner of ['player', 'opponent']) for (const airborne of [0, 42]) {
      const { match, pilot, rig } = terminalFixture(entry.fighterId, winner, airborne);
      const before = structuredClone(match);
      const original = createXenoTrialsPilotOutroV197(match);
      const completed = { ...original, phase: 'complete', elapsedMs: original.durationMs };
      const clock = createXenoTrialsPilotReturnV212(match, null, completed, new Map([[rig.path, image(rig)]]));
      const previous = getXenoTrialsPilotSequenceV197(rig, match, pilot, null, completed);
      const first = getXenoTrialsPilotSequenceV197(rig, match, pilot, null, completed, false, clock);
      assert.equal(first.sequenceIdV212, entry.id);
      sameFrame(first, previous);
      const next = advanceXenoTrialsOutroV155(clock, 85);
      const moving = getXenoTrialsPilotSequenceV197(rig, match, pilot, null, completed, false, next);
      assert.notDeepEqual(moving.vertices, first.vertices);
      const neutral = { ...clock, phase: 'complete', elapsedMs: clock.durationMs };
      const final = getXenoTrialsPilotSequenceV197(rig, match, pilot, null, completed, false, neutral);
      const skipped = getXenoTrialsPilotSequenceV197(rig, match, pilot, null, completed, false, skipXenoTrialsOutroV155(next));
      sameFrame(final, skipped);
      assert.ok(Object.values(final.angles).every(value => value === 0));
      assert.deepEqual(match, before);
    }
  }
});

test('pilot return requires the signed, decoded living verdict and merges existing participants', () => {
  const { match, pilot, rig } = terminalFixture(WARDEN);
  const original = createXenoTrialsPilotOutroV197(match);
  const completed = { ...original, phase: 'complete', elapsedMs: original.durationMs };
  for (const previous of [original, { ...completed, terminalTick: 17 }, { ...completed, skipped: true },
    { ...completed, participants: [{ ...completed.participants[0], sequenceId: 'wrong' }] }])
    assert.equal(createXenoTrialsPilotReturnV212(match, null, previous), null);
  assert.equal(createXenoTrialsPilotReturnV212(match, null, completed, new Map()), null);
  assert.equal(createXenoTrialsPilotReturnV212(match, null, completed, undefined, true), null);
  const other = { ...completed, kind: 'outro', participants: [{ side: 'opponent', sequenceId: 'warrior::outro' }] };
  const merged = createXenoTrialsPilotReturnV212(match, other, completed);
  assert.deepEqual(merged.participants.map(row => row.sequenceId), ['warrior::outro', WARDEN + '::outro']);
  const foreign = { ...merged, matchId: 'wrong' };
  assert.equal(getXenoTrialsPilotSequenceV197(rig, match, pilot, null, completed, false, foreign).sequenceIdV212, undefined);
  const down = terminalFixture(WARDEN, 'opponent');
  down.pilot.hp = 0;
  down.match.result.reason = 'ko';
  const ko = createXenoTrialsPilotOutroV197(down.match);
  assert.equal(createXenoTrialsPilotReturnV212(down.match, null, { ...ko, phase: 'complete' }), null);
});

function host(config = {}, stall = false) {
  const listeners = new Map();
  const window = { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  const document = { hidden: false, ownsFocus: true, hasFocus() { return this.ownsFocus; } };
  const context = new Proxy({
    measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }),
  }, { get: (obj, key) => obj[key] ?? (() => {}) });
  const canvas = { tagName: 'CANVAS', width: 1000, height: 560, getContext: () => context, setAttribute() {},
    closest: () => null, focus() { document.activeElement = this; } };
  const queue = new Map(), results = [];
  let serial = 0, now = 0, releaseMedia;
  const ready = stall ? new Promise(resolve => { releaseMedia = resolve; }) : Promise.resolve();
  const roster = [config.playerId ?? 'warrior', config.opponentId ?? 'runner'].map(rigFor);
  const runtime = createXenoTrialsRuntimeV96({
    canvas, window, document, config: { playerId: 'warrior', opponentId: 'runner', stageId: 'containment-deck',
      difficulty: 'easy', seed: 96001, roundsToWin: 1, rulesV119: { noSpecial: true, initialHp: 1 }, ...config },
    async loadImage(path) {
      await ready;
      return image(roster.find(rig => rig?.path === path) || { sourceWidth: 1024, sourceHeight: 1024 });
    },
    requestAnimationFrame(callback) { queue.set(++serial, callback); return serial; },
    cancelAnimationFrame(token) { queue.delete(token); },
    onResult: result => results.push(result),
  });
  function frame(count = 1) {
    for (let i = 0; i < count; i++) {
      now += 1000 / 120;
      for (const [id, callback] of [...queue]) if (queue.delete(id)) callback(now);
      assert.ok(queue.size <= 1);
    }
  }
  return { runtime, canvas, document, frame, releaseMedia, results, queue };
}

test('skip signals actual readiness, restores canvas focus and cannot run behind a modal or in the countdown', async () => {
  const h = host({}, true), { runtime, document } = h;
  const button = { tagName: 'BUTTON' };
  try {
    const pending = runtime.start();
    document.activeElement = button;
    assert.equal(runtime.getState().canSkipSequenceV212, false);
    assert.equal(runtime.skipSequence(), false);
    assert.equal(document.activeElement, button);
    h.releaseMedia();
    assert.equal(await pending, true);
    assert.equal(runtime.getState().canSkipSequenceV212, true);
    document.ownsFocus = false;
    assert.equal(runtime.getState().canSkipSequenceV212, false);
    assert.equal(runtime.skipSequence(), false);
    document.ownsFocus = true;
    runtime.pause();
    assert.equal(runtime.getState().canSkipSequenceV212, false);
    assert.equal(runtime.resume(), true);
    document.activeElement = button;
    assert.equal(runtime.getState().canSkipSequenceV212, true);
    assert.equal(runtime.skipSequence(), true);
    assert.equal(document.activeElement, h.canvas);
    assert.equal(runtime.getState().presentation.phase, 'intro-opponent');
    assert.equal(runtime.skipSequence(), true);
    assert.equal(runtime.getState().presentation.countdown, 3);
    assert.equal(runtime.getState().canSkipSequenceV212, false);
    assert.equal(runtime.skipSequence(), false);
    assert.equal(runtime.getState().tick, 0);
  } finally { runtime.stop(); }
});

test('a native Warden KO settles once, reaches the return, pauses and can be skipped', async () => {
  const h = host({ playerId: WARDEN, opponentId: 'import-game-dd-wy-commando', seed: 17 }), { runtime } = h;
  try {
    assert.equal(await runtime.start(), true);
    runtime.skipSequence(); runtime.skipSequence(); h.frame(450);
    for (let i = 0; i < 850 && runtime.getState().phase === 'active'; i++) {
      const [player, opponent] = runtime.getState().fighters, gap = getXenoTrialsBodyGapV105(player, opponent);
      runtime.setInput('right', gap > 52 && opponent.x > player.x);
      runtime.setInput('left', gap > 52 && opponent.x < player.x);
      runtime.setInput('light', gap <= 52 && i % 3 === 0);
      h.frame();
    }
    const verdict = runtime.getState();
    assert.equal(verdict.result?.winner, 'player');
    assert.equal(h.results.length, 1);
    for (let i = 0; i < 840 && !runtime.getState().terminalV156?.participants.some(row => row.revision === 212); i++) h.frame();
    h.frame(16);
    const returning = runtime.getState();
    assert.equal(returning.terminalV156?.kind, 'outro');
    assert.ok(returning.rigViewsV154.some(row => row.sequenceIdV212 === WARDEN + '::outro'));
    assert.equal(runtime.getState().canSkipSequenceV212, true);
    const clock = returning.terminalV156.elapsedMs;
    assert.equal(runtime.pause(), true);
    h.frame(55);
    assert.equal(runtime.getState().terminalV156.elapsedMs, clock);
    assert.equal(runtime.getState().canSkipSequenceV212, false);
    assert.equal(runtime.skipSequence(), false);
    assert.equal(runtime.resume(), true);
    assert.equal(runtime.skipSequence(), true);
    h.frame(180);
    assert.equal(h.queue.size, 0);
    assert.equal(runtime.getState().terminalV156.phase, 'complete');
    assert.equal(runtime.getState().canSkipSequenceV212, false);
    assert.deepEqual(runtime.getState().result, verdict.result);
    assert.deepEqual(runtime.getState().fighters, verdict.fighters);
    assert.equal(h.results.length, 1);
  } finally { runtime.stop(); }
});
