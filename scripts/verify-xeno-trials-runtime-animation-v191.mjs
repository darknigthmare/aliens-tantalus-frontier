import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { XENO_TRIALS_HORDE_PROTOCOLS_V180 } from '../src/xeno-trials-horde-v180.js';
import { getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_SPRITE_ATLASES_V191 as atlases } from '../src/xeno-trials-sprite-atlas-v191.js';

// The production controller and native engine run unchanged. DOM, RAF, image
// decoding and Canvas below are explicitly declared host doubles, not Chromium
// or physical inputs. No running fighter, HP, position, clock or result is set.
const clone = value => JSON.parse(JSON.stringify(value));
function target(extra = {}) {
  const listeners = new Map();
  return Object.assign({ addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    emit(type, event = {}) { for (const fn of [...(listeners.get(type) || [])]) fn({ preventDefault() {}, stopPropagation() {}, ...event }); },
    count() { return [...listeners.values()].reduce((count, list) => count + list.size, 0); }
  }, extra);
}
function dimensions(path) {
  try {
    const bytes = readFileSync(new URL(`..${path}`, import.meta.url));
    if (bytes.subarray(1, 4).toString() === 'PNG') return { naturalWidth: bytes.readUInt32BE(16), naturalHeight: bytes.readUInt32BE(20), complete: true };
  } catch { /* Legacy non-PNG host decoding is declared below. */ }
  return { naturalWidth: 1024, naturalHeight: 1024, complete: true };
}
function host(options = {}) {
  const window = target(), document = target({ hidden: false, hasFocus: () => true });
  const draws = [], ctx = new Proxy({ globalAlpha: 1, drawImage(...args) { draws.push(args); },
    measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (object, key) => object[key] ?? (() => {}) });
  const canvas = target({ tagName: 'CANVAS', width: 800, height: 600, getContext: () => ctx,
    setAttribute() {}, focus() { document.activeElement = this; }, closest: () => null });
  document.activeElement = canvas;
  const queue = new Map(), checkpoints = [], results = [], loads = []; let serial = 0, time = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window, document,
    config: { playerId: 'warrior', opponentId: 'queen', difficulty: 'hard', roundsToWin: 2, roundSeconds: 120, ...options.config },
    loadImage: async path => { loads.push(path); if (options.failNew && path.includes('/xeno-trials-v191/')) throw new Error('Declared missing optional sprite'); return dimensions(path); },
    requestAnimationFrame: callback => { queue.set(++serial, callback); return serial; }, cancelAnimationFrame: id => queue.delete(id),
    onCheckpoint: (raw, reason) => { checkpoints.push({ raw: clone(raw), reason }); return true; }, onResult: value => results.push(value),
    ...options });
  const frames = (count = 1) => {
    for (let index = 0; index < count; index++) {
      time += 1000 / 120; const callbacks = [...queue.values()]; queue.clear(); for (const callback of callbacks) callback(time);
    }
  };
  return { runtime, window, document, canvas, queue, checkpoints, results, draws, loads, frames,
    state: () => runtime.getState(),
    async start() {
      assert.equal(await runtime.start(), true); runtime.skipSequence();
      for (let i = 0; i < 1600 && runtime.getState().presentation.blocksSimulation; i++) frames();
      assert.equal(runtime.getState().presentation.blocksSimulation, false); frames(2);
    } };
}
const playerReceipt = state => state.rigViewsV154.find(view => view.side === 'player');
const allReceipts = state => state.rigViewsV154.map(view => view.spriteAtlasV191).filter(Boolean);

for (const id of ['defender', 'chrysalis', 'smasher', 'user-brute']) test(`${id}: native accepted idle, movement, guard and primary contacts use the newly decoded combat atlas`, async () => {
  const h = host({ config: { playerId: id, opponentId: 'queen', difficulty: 'easy', roundSeconds: 120 } });
  await h.start();
  assert.equal(playerReceipt(h.state()).spriteAtlasV191.kind, 'combat');
  assert.equal(playerReceipt(h.state()).spriteAtlasV191.frameId, 'idle');
  const a = atlases.find(atlas => atlas.fighterId === id);
  assert.ok(h.loads.includes(a.texture.path)); assert.ok(h.loads.includes(getXenoTrialsArtV96(id).path));
  h.runtime.setInput('left', true); const steps = new Set();
  for (let i = 0; i < 90; i++) { h.frames(); const receipt = playerReceipt(h.state())?.spriteAtlasV191; if (receipt?.frameId.startsWith('walk-')) steps.add(receipt.frameId); }
  h.runtime.setInput('left', false); assert.deepEqual(steps, new Set(['walk-a', 'walk-b']));
  h.runtime.setInput('guard', true); h.frames(5); assert.equal(playerReceipt(h.state()).spriteAtlasV191.frameId, 'guard');
  h.runtime.setInput('guard', false); h.frames(5); h.runtime.setInput('heavy', true);
  const phases = new Set();
  for (let i = 0; i < 100; i++) {
    h.frames(); const state = h.state(), receipt = playerReceipt(state)?.spriteAtlasV191;
    if (receipt && ['windup', 'contact', 'recovery'].includes(receipt.phase)) {
      phases.add(receipt.phase); assert.equal(receipt.attackId, state.fighters[0].attack.id);
      assert.equal(receipt.renderTick, state.tick); assert.deepEqual(receipt.sourceRect, a.frames.find(frame => frame.id === receipt.frameId).rect);
    }
  }
  assert.deepEqual(phases, new Set(['windup', 'contact', 'recovery']));
  h.runtime.setInput('heavy', false); h.runtime.pause(); const frozen = h.state(); h.frames(60);
  assert.equal(h.state().tick, frozen.tick); assert.deepEqual(h.state().rigViewsV154, frozen.rigViewsV154);
  h.runtime.stop(); assert.equal(h.queue.size, 0); assert.equal(h.window.count(), 0); assert.equal(h.canvas.count(), 0);
});

for (const id of ['warrior', 'runner', 'prowler', 'spitter']) test(`${id}: a real special input owns all three drawn phases, native elevation and a truthful last-draw receipt`, async () => {
  const h = host({ config: { playerId: id, opponentId: 'queen', difficulty: 'easy', roundSeconds: 120 } }); await h.start();
  h.runtime.setInput('left', true); h.frames(90); h.runtime.setInput('left', false); h.frames(2);
  h.runtime.setInput('special', true); const phases = new Set(), keys = new Set(); let accepted = false, airborne = false;
  for (let i = 0; i < 210; i++) {
    h.frames(); const state = h.state(), fighter = state.fighters[0], view = playerReceipt(state), receipt = view?.spriteAtlasV191;
    if (fighter.attack?.kind === 'special') accepted = true;
    if (receipt?.kind !== 'special') continue;
    phases.add(receipt.phase); keys.add(receipt.frameId); assert.equal(receipt.fighterId, id);
    assert.equal(receipt.attackId, fighter.attack.id); assert.equal(receipt.attackAge, fighter.attack.age); assert.equal(receipt.renderTick, state.tick);
    assert.equal(receipt.drawn, true); assert.equal(view.preparationV163, undefined, 'A new drawing cannot borrow an undrawn V163 mesh witness');
    if (receipt.supportMode === 'free') { airborne = true; assert.equal(id, 'prowler'); assert.ok(fighter.y > 0); assert.deepEqual(view.supports, []); }
    else { assert.equal(fighter.y, 0); assert.ok(view.supports.length > 0); }
  }
  assert.equal(accepted, true); assert.deepEqual(phases, new Set(['windup', 'contact', 'recovery'])); assert.equal(keys.size, 10);
  assert.equal(airborne, id === 'prowler'); assert.ok(h.state().fighters[0].stats.specials >= 1);
  h.runtime.setInput('special', false); h.runtime.stop();
});

test('a failed optional V191 sheet retains native control and honest older rendering rather than pausing or emitting fake new receipts', async () => {
  const h = host({ failNew: true, config: { playerId: 'prowler', opponentId: 'queen', difficulty: 'easy' } }); await h.start();
  h.runtime.setInput('special', true); let attack = false, oldPreparation = false;
  for (let i = 0; i < 150; i++) {
    h.frames(); const state = h.state(); if (state.fighters[0].attack?.kind === 'special') attack = true;
    assert.equal(allReceipts(state).length, 0);
    if (playerReceipt(state)?.preparationV163) oldPreparation = true;
  }
  assert.equal(attack, true); assert.equal(oldPreparation, true); assert.equal(h.state().paused, false); h.runtime.stop();
});

test('a naturally earned Prowler capture keeps both paired V163 drawings ahead of the new special atlas', async () => {
  const h = host({ config: { playerId: 'import-game-dd-wy-commando', opponentId: 'prowler', seed: 153,
    difficulty: 'hard', roundSeconds: 120 } }); await h.start();
  let startup = false;
  for (let index = 0; index < 5400 && !h.state().grappleV153; index++) {
    const state = h.state(), receipt = state.rigViewsV154.find(view => view.side === 'opponent')?.spriteAtlasV191;
    if (receipt?.kind === 'special' && receipt.phase === 'windup') startup = true;
    h.frames();
  }
  const hold = h.state().grappleV153; assert.ok(hold, 'The ordinary native CPU must earn the capture');
  assert.equal(hold.attacker, 'opponent'); assert.equal(startup, true);
  let floor = false, paired = false;
  for (let index = 0; index < 90 && h.state().grappleV153?.id === hold.id; index++) {
    const state = h.state();
    assert.equal(allReceipts(state).length, 0, 'A paired capture owns both bodies before any ordinary special drawing');
    // The native Prowler can earn contact while still airborne. V163 begins
    // its paired floor drawing only after that unchanged trajectory lands.
    if (state.fighters.every(fighter => fighter.y === 0)) {
      assert.ok(state.rigViewsV154.some(view => view.side === 'opponent' && view.captureV163?.grappleId === hold.id)); paired = true;
    }
    if (state.captureViewsV163.some(view => view.role === 'captive' && view.fullFloorPin && view.grappleId === hold.id)) floor = true;
    h.frames();
  }
  assert.equal(paired, true); assert.equal(floor, true); h.runtime.stop();
});

test('new drawn poses do not enter a real native horde checkpoint and pause/restart preserve its body, resources and director', async () => {
  const protocol = XENO_TRIALS_HORDE_PROTOCOLS_V180[0];
  const h = host({ config: { playerId: 'user-brute', activityV119: { branch: 'horde', id: protocol.id } } }); await h.start(); h.frames(20);
  h.runtime.pause(); assert.ok(h.checkpoints.length > 0); const saved = h.checkpoints.at(-1).raw;
  assert.equal(saved.hordeV180.protocolId, protocol.id); assert.ok(!JSON.stringify(saved).includes('spriteAtlasV191'));
  assert.equal(Object.hasOwn(saved, 'rigViewsV154'), false); assert.equal(Object.hasOwn(saved, 'audioV189'), false);
  const original = h.state(), body = bounds(original.fighters[0]); h.runtime.stop();
  const resumed = host({ config: original.config, resumeSnapshot: saved }); await resumed.runtime.start();
  const state = resumed.state(); assert.equal(state.paused, true); assert.equal(state.tick, original.tick);
  assert.deepEqual(state.hordeV180, original.hordeV180); assert.deepEqual(bounds(state.fighters[0]), body);
  for (const key of ['hp', 'stamina', 'x', 'y', 'superMeter']) assert.equal(state.fighters[0][key], original.fighters[0][key]);
  resumed.runtime.resume(); resumed.frames(5); assert.ok(resumed.state().tick > state.tick); resumed.runtime.stop();
});
