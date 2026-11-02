import test from 'node:test';
import assert from 'node:assert/strict';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_HORDE_PROTOCOLS_V180 } from '../src/xeno-trials-horde-v180.js';
import { getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsStageAssetsV180 } from '../src/xeno-trials-stage-depth-v180.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96,
  settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';

// Host integration tests, not Chromium, physical controllers or human gameplay.
// DOM event listeners, RAF clock, Canvas paint methods and decoded image objects
// are explicit doubles. Combat, spawning, presentation and receipts are native.
const protocol = XENO_TRIALS_HORDE_PROTOCOLS_V180[0];
const config = { playerId: 'warrior', activityV119: { branch: 'horde', id: protocol.id } };
const clone = value => structuredClone(value);
function commands(snapshot, tick) {
  const player = snapshot.fighters[0];
  const enemy = snapshot.fighters.slice(1).filter(fighter => fighter.hp > 0)
    .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  const distance = enemy ? enemy.x - player.x : 0;
  return { right: distance > 80, left: distance < -80,
    heavy: Boolean(enemy) && Math.abs(distance) < 170 && tick % 90 < 45 };
}
function nativeResult(ticket, { loseAfterFirstKill = false } = {}) {
  const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 });
  let observedIntermission = false;
  for (let tick = 0; tick < 35000 && !match.result; tick++) {
    const losing = loseAfterFirstKill && match.hordeV180.totalKills > 0;
    // A controlled idle opponent input isolates victory/receipt integration;
    // the partial-loss case returns the CPUs to their native AI after a kill.
    stepXenoTrialsMatchV96(match, 1 / 120, losing ? {} : commands(match, tick), losing ? null : {});
    observedIntermission ||= match.hordeV180.phase === 'intermission';
  }
  assert.ok(match.result, 'The native engine must supply the terminal receipt');
  return { match, result: clone(match.result), observedIntermission };
}
function begin(state = createXenoTrialsProgressV96()) {
  const ticket = beginXenoTrialsV96(state, config); assert.equal(ticket.applied, true);
  return { ...ticket, state: normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(ticket.state))) };
}

test('a persisted horde ticket launches real simultaneous low-HP fighters and settles the native clear only once', () => {
  const ticket = begin(); assert.deepEqual(ticket.state.pending.config, ticket.config);
  const opening = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 });
  assert.ok(opening.fighters.length >= 4);
  assert.ok(opening.fighters.slice(1).every(fighter => fighter.hp >= 15 && fighter.hp <= 35));
  assert.equal(new Set(opening.fighters.slice(1).map(fighter => fighter.instanceIdV180)).size, opening.fighters.length - 1);
  const { result, observedIntermission } = nativeResult(ticket);
  assert.equal(observedIntermission, true); assert.equal(result.winner, 'player');
  assert.equal(result.hordeV180.kills, protocol.totalEnemies);
  const settled = settleXenoTrialsV96(ticket.state, result);
  assert.equal(settled.applied, true); assert.equal(settled.state.pending, null);
  assert.equal(settled.receipt.modeReward.bonus, protocol.reward);
  assert.deepEqual(settled.state.modesV119.hordeCleared, [protocol.id]);
  const persisted = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(settled.state)));
  const replay = settleXenoTrialsV96(persisted, result);
  assert.equal(replay.applied, false); assert.deepEqual(replay.state, persisted);
  const secondTicket = begin(persisted), second = settleXenoTrialsV96(secondTicket.state, nativeResult(secondTicket).result);
  assert.equal(second.applied, true); assert.equal(second.receipt.modeReward.bonus, 0);
  assert.equal(second.state.credits - secondTicket.state.credits, 80);
});

test('altered horde wave, kill, total, identity and difficulty receipts cannot consume a ticket or grant a partial bonus', () => {
  const ticket = begin(), { result } = nativeResult(ticket), before = clone(ticket.state);
  const mutations = [
    value => { value.hordeV180.wavesCleared--; },
    value => { value.hordeV180.kills--; },
    value => { value.hordeV180.totalEnemies++; },
    value => { value.hordeV180.protocolId = XENO_TRIALS_HORDE_PROTOCOLS_V180[1].id; },
    value => { value.activityV119.id = XENO_TRIALS_HORDE_PROTOCOLS_V180[1].id; },
    value => { value.difficulty = 'hard'; },
    value => { value.stageId = 'hive-vault'; },
    value => { value.rounds = 2; },
    value => { value.wins.player = 2; },
    value => { value.reason = 'ko'; }
  ];
  for (const mutate of mutations) {
    const forged = clone(result); mutate(forged);
    const denied = settleXenoTrialsV96(ticket.state, forged);
    assert.equal(denied.applied, false); assert.deepEqual(denied.state, before);
    assert.deepEqual(ticket.state, before);
  }
  for (const [key, value] of [['difficulty', 'hard'], ['stageId', 'hive-vault'], ['opponentId', 'queen']]) {
    const forged = clone(ticket.state); forged.pending.config[key] = value;
    const normalized = normalizeXenoTrialsProgressV96(forged);
    assert.equal(normalized.pending, null); assert.equal(normalized.credits, before.credits);
  }
});

test('a native defeat after an actual kill grants only the ordinary loss receipt and no horde completion', () => {
  const ticket = begin(), { result } = nativeResult(ticket, { loseAfterFirstKill: true });
  assert.equal(result.winner, 'opponent'); assert.equal(result.reason, 'horde-ko');
  assert.ok(result.hordeV180.kills > 0); assert.ok(result.hordeV180.kills < protocol.totalEnemies);
  const settled = settleXenoTrialsV96(ticket.state, result);
  assert.equal(settled.applied, true); assert.equal(settled.receipt.modeReward.bonus, 0);
  assert.deepEqual(settled.state.modesV119.hordeCleared, []);
  assert.equal(settled.state.credits - ticket.state.credits, 15);
});

function host(runtimeConfig) {
  const emitter = () => ({ handlers: new Map(),
    addEventListener(type, callback) { const list = this.handlers.get(type) || []; list.push(callback); this.handlers.set(type, list); },
    removeEventListener(type, callback) { this.handlers.set(type, (this.handlers.get(type) || []).filter(item => item !== callback)); } });
  const document = { ...emitter(), hidden: false, hasFocus: () => true };
  const window = emitter(), painted = new Set(), loads = [], results = [], states = [];
  const gradient = { addColorStop() {} };
  const context = new Proxy({
    measureText: text => ({ width: String(text).length * 7 }),
    createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    drawImage: image => painted.add(image.fixturePath)
  }, { get: (target, name) => target[name] ?? (() => {}), set: (target, name, value) => { target[name] = value; return true; } });
  const canvas = { ...emitter(), width: 1000, height: 560, getContext: () => context,
    setAttribute() {}, focus() { document.activeElement = this; } };
  const queue = new Map(); let serial = 0, now = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window, document, config: runtimeConfig,
    loadImage: async path => { loads.push(path); return { fixturePath: path, naturalWidth: 1600, naturalHeight: 900 }; },
    requestAnimationFrame: callback => { queue.set(++serial, callback); return serial; },
    cancelAnimationFrame: id => queue.delete(id), onResult: result => results.push(clone(result)),
    onState: state => states.push(state) });
  return { runtime, loads, painted, results, states, queue,
    frame() { now += 1000 / 120; const callbacks = [...queue.values()]; queue.clear(); callbacks.forEach(callback => callback(now)); } };
}

test('the real runtime preloads every horde identity and three scene layers, freezes all actors on pause and emits its result once', async t => {
  const ticket = begin(), h = host(ticket.config);
  try {
    assert.equal(await h.runtime.start(), true);
    assert.ok(h.runtime.getState().fighters.length >= 4);
    for (const id of ['warrior', ...protocol.opponentIds]) assert.ok(h.loads.includes(getXenoTrialsArtV96(id).path), `preloaded ${id}`);
    const layers = getXenoTrialsStageAssetsV180(protocol.stageId);
    assert.equal(layers.length, 3); layers.forEach(path => assert.ok(h.loads.includes(path), `preloaded ${path}`));
    assert.equal(h.runtime.getState().stageDepthV180.layers.length, 3);
    assert.equal(h.runtime.skipSequence(), true); h.frame();
    h.runtime.setInput('right', true); for (let tick = 0; tick < 60; tick++) h.frame();
    assert.equal(h.runtime.pause(), true); const frozen = h.runtime.getState();
    for (let tick = 0; tick < 100; tick++) h.frame();
    assert.deepEqual(h.runtime.getState(), frozen); assert.equal(h.queue.size, 0);
    assert.equal(h.runtime.resume(), true);
    let sawEmptyIntermission = false;
    for (let tick = 0; tick < 12000 && !h.runtime.getState().result; tick++) {
      const state = h.runtime.getState(), input = commands(state, tick);
      for (const [action, pressed] of Object.entries(input)) h.runtime.setInput(action, pressed);
      h.frame();
      const next = h.runtime.getState();
      if (next.hordeV180.phase === 'intermission') {
        sawEmptyIntermission = true; assert.equal(next.fighters.length, 1);
        assert.equal(next.fighters[1], undefined); assert.equal(next.hordeV180.alive, 0);
      }
    }
    assert.equal(sawEmptyIntermission, true, 'An actual empty intermission must render without a second fighter');
    assert.equal(h.results.length, 1); assert.equal(h.results[0].completed, true);
    assert.equal(h.results[0].winner, 'player'); assert.equal(h.results[0].reason, 'horde-cleared');
    assert.equal(h.results[0].hordeV180.kills, protocol.totalEnemies);
    assert.equal(h.runtime.getState().phase, 'match-over'); assert.equal(h.queue.size, 0);
    for (let tick = 0; tick < 300; tick++) h.frame();
    assert.equal(h.results.length, 1);
    assert.equal(settleXenoTrialsV96(ticket.state, h.results[0]).applied, true);
    layers.forEach(path => assert.ok(h.painted.has(path), `painted ${path}`));
    t.diagnostic(`Native runtime clear: ${h.results[0].hordeV180.wavesCleared} waves, ${h.results[0].hordeV180.kills} kills, ${h.results[0].durationTicks} fixed ticks, one result callback; DOM/RAF/Canvas/images are declared doubles.`);
  } finally { h.runtime.stop(); }
});
