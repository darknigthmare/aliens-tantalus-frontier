import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsReplayRecorderV232, verifyXenoTrialsReplayV232,
  hashXenoTrialsReplayStateV232 } from '../src/xeno-trials-replay-v232.js';

// Production runtime, native renderer/engine and actual UI launch method.
// Explicit host doubles: DOM listeners/focus, RAF clock, Canvas paint calls,
// image decoding (PNG dimensions read from disk), keyboard and standard pads.
// This suite does not claim Chromium rendering or physical-controller QA.
const copy = value => JSON.parse(JSON.stringify(value));
function emitter(extra = {}) {
  const listeners = new Map();
  return Object.assign({
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    emit(type, supplied = {}) {
      const event = { type, defaultPrevented: false, isTrusted: true,
        preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...supplied };
      for (const callback of [...listeners.get(type) || []]) callback(event);
      return event;
    },
    listenerCount() { return [...listeners.values()].reduce((sum, set) => sum + set.size, 0); },
  }, extra);
}
const pad = index => ({ id: `V232 declared standard pad ${index}`, index, connected: true, mapping: 'standard',
  axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) });
function decoded(path) {
  try {
    const bytes = readFileSync(new URL(`..${path}`, import.meta.url));
    if (bytes.subarray(1, 4).toString() === 'PNG') return { naturalWidth: bytes.readUInt32BE(16), naturalHeight: bytes.readUInt32BE(20), complete: true, src: path };
  } catch {}
  return { naturalWidth: 1024, naturalHeight: 1024, complete: true, src: path };
}
function config({ mode = 'tag', controls = 'local', assists = true, ...patch } = {}) {
  const count = mode === 'tag' ? 2 : 1;
  return { playerId: 'warrior', opponentId: 'warrior', seed: 232, roundsToWin: 2,
    roundSeconds: 180, introSeconds: 0, holdRoundTransition: true,
    exhibitionV232: { mode, controls, assists: mode === 'tag' && assists,
      playerTeam: [{ id: 'warrior' }, { id: 'defender' }].slice(0, count),
      opponentTeam: [{ id: 'warrior' }, { id: 'xenoborg' }].slice(0, count) }, ...patch };
}
function host(options = {}) {
  const window = emitter(), document = emitter({ hidden: false, focused: true,
    hasFocus() { return this.focused; }, documentElement: { classList: { contains: () => false } } });
  const queue = new Map(), loaded = new Set(), draws = [], states = [], results = [], checkpoints = [], replays = [];
  let serial = 0, now = 0, pads = options.pads || [], runtime = null;
  const ctx = new Proxy({ globalAlpha: 1, measureText: value => ({ width: String(value).length * 7 }),
    drawImage(...args) { draws.push(args); }, createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }) }, { get: (object, key) => object[key] ?? (() => {}) });
  const canvas = emitter({ tagName: 'CANVAS', width: 800, height: 600, ownerDocument: document,
    getContext: () => ctx, closest: () => null, setAttribute() {},
    focus() { document.activeElement = this; } });
  document.activeElement = canvas;
  const root = emitter({ contains: item => item === canvas });
  const requestAnimationFrame = callback => { queue.set(++serial, callback); return serial; };
  const cancelAnimationFrame = id => queue.delete(id);
  Object.assign(window, { requestAnimationFrame, cancelAnimationFrame, navigator: { getGamepads: () => pads },
    Image: class { set src(path) { loaded.add(path); const { src, ...size } = decoded(path); this.path = src; Object.assign(this, size); queueMicrotask(() => this.onload?.()); } get src() { return this.path; } } });
  const loadImage = async path => { loaded.add(path); return decoded(path); };
  const owner = { window, document, canvas, root, queue, loaded, draws, states, results, checkpoints, replays,
    get runtime() { return runtime; }, attach(value) { runtime = value; },
    state: () => runtime.getState(), set pads(value) { pads = value; },
    frames(count = 1, ms = 1000 / 120) {
      for (let i = 0; i < count; i++) {
        now += ms; const callbacks = [...queue.values()]; queue.clear();
        for (const callback of callbacks) callback(now);
      }
    },
    key(code, down = true, target = canvas) { return window.emit(down ? 'keydown' : 'keyup', { code, target }); },
    async start() {
      assert.equal(await runtime.start(), true); runtime.skipSequence();
      for (let i = 0; i < 900 && owner.state().presentation.blocksSimulation && !owner.state().paused; i++) owner.frames();
      assert.equal(owner.state().presentation.blocksSimulation, false);
      owner.frames(3); return owner;
    },
  };
  if (options.create !== false) runtime = createXenoTrialsRuntimeV96({ canvas, window, document, controlsRoot: root,
    config: options.config || config(), audioEnabled: false, reducedMotion: true, loadImage,
    getGamepads: () => pads, requestAnimationFrame, cancelAnimationFrame,
    onState: snapshot => states.push(snapshot), onResult: result => results.push(result),
    onCheckpoint: snapshot => { checkpoints.push(snapshot); return true; }, onReplayV232: replay => replays.push(replay), ...options });
  return owner;
}
function approach(h, gap = 25) {
  h.runtime.setInput('right', true);
  let budget = 800;
  while (getXenoTrialsBodyGapV105(...h.state().fighters, 1) > gap && budget-- > 0) h.frames();
  h.runtime.setInput('right', false); h.frames(2);
  assert.ok(budget > 0);
}
function earnAssist(h) {
  approach(h);
  for (let hit = 0; hit < 3; hit++) {
    h.runtime.setInput('light', true); h.frames(2); h.runtime.setInput('light', false); h.frames(55);
    if (getXenoTrialsBodyGapV105(...h.state().fighters, 1) > 35) approach(h);
  }
  assert.ok(h.state().fighters[0].superMeterV148 >= 25);
}
function terminalReplay() {
  const match = createXenoTrialsMatchV96(config({ mode: 'duel', roundsToWin: 1, rulesV119: { initialHp: 1 } }));
  const recorder = createXenoTrialsReplayRecorderV232(match); assert.ok(recorder);
  let budget = 1000;
  while (!match.result && budget-- > 0) {
    const close = getXenoTrialsBodyGapV105(...match.fighters, 1) < 35;
    const input = close ? { light: true } : { right: true };
    assert.equal(recorder.beforeStep(match, 1 / 120, input, {}), true);
    stepXenoTrialsMatchV96(match, 1 / 120, input, {}); assert.equal(recorder.afterStep(match), true);
  }
  assert.ok(match.result); const replay = recorder.finish(match); assert.ok(replay);
  assert.equal(verifyXenoTrialsReplayV232(replay).valid, true); return replay;
}
function boundaryReplay() {
  const match = createXenoTrialsMatchV96(config({ mode: 'duel' }));
  const recorder = createXenoTrialsReplayRecorderV232(match); assert.ok(recorder);
  let hit = null, impactPosition = null, budget = 4000, tail = 10;
  while (budget-- > 0 && (!hit || tail-- > 0)) {
    const [player, opponent] = match.fighters;
    const travel = opponent.x < 1780;
    const close = getXenoTrialsBodyGapV105(player, opponent, 1) < 35;
    const input = !travel && close ? { heavy: true } : { right: true };
    assert.equal(recorder.beforeStep(match, 1 / 120, input, travel ? { right: true } : {}), true);
    stepXenoTrialsMatchV96(match, 1 / 120, input, travel ? { right: true } : {});
    assert.equal(recorder.afterStep(match), true);
    if (!hit) {
      hit = match.events.find(row => row.type === 'hit');
      if (hit) impactPosition = recorder.getState().operations;
    }
  }
  assert.ok(hit?.damage >= 20); assert.ok(match.fighters[1].x >= 1704);
  const replay = recorder.finish(match); assert.ok(replay);
  assert.equal(verifyXenoTrialsReplayV232(replay).valid, true);
  return { replay, hit: copy(hit), impactPosition };
}

test('local runtime supplies direct neutral P2, with keyboard directions and attacks owned by one human', async () => {
  const h = host({ config: config({ mode: 'duel' }) }); await h.start();
  const initial = h.state(); assert.equal(initial.opponentInputSourceV163, 'direct');
  h.frames(100); assert.equal(h.state().ai.decisions, initial.ai.decisions);
  const before = h.state().fighters.map(fighter => fighter.x);
  h.key('ArrowRight'); h.frames(16); h.key('ArrowRight', false);
  assert.equal(h.state().fighters[0].x, before[0]); assert.ok(h.state().fighters[1].x > before[1]);
  const p2 = h.state().fighters[1].x;
  h.key('KeyA'); h.frames(16); h.key('KeyA', false);
  assert.ok(h.state().fighters[0].x < before[0]); assert.equal(h.state().fighters[1].x, p2);
  h.key('Numpad1'); h.frames(2);
  assert.equal(h.state().fighters[1].attack.kind, 'light'); assert.equal(h.state().fighters[0].attack, null);
  h.key('Numpad1', false); h.frames(55); h.key('KeyJ'); h.frames(2);
  assert.equal(h.state().fighters[0].attack.kind, 'light'); assert.equal(h.state().fighters[1].attack, null);
  h.runtime.stop(); assert.deepEqual(h.checkpoints, []);
});

test('intro and native-control focus consume held local commands until an actual source release', async () => {
  const h = host({ config: config({ mode: 'duel' }) }); assert.equal(await h.runtime.start(), true);
  const x = h.state().fighters[1].x;
  h.key('ArrowRight'); h.key('KeyE'); h.frames(5); h.runtime.skipSequence();
  for (let i = 0; i < 900 && h.state().presentation.blocksSimulation; i++) h.frames();
  h.frames(25); assert.equal(h.state().fighters[1].x, x);
  h.key('ArrowRight', false); h.key('KeyE', false); h.key('ArrowRight'); h.frames(10); h.key('ArrowRight', false);
  assert.ok(h.state().fighters[1].x > x);
  const button = { tagName: 'BUTTON', closest: () => ({}) }; h.document.activeElement = button;
  h.key('Numpad1', true, button); h.frames(3); assert.equal(h.state().fighters[1].attack, null);
  h.canvas.focus(); h.frames(3); assert.equal(h.state().fighters[1].attack, null);
  h.key('Numpad1', false); h.key('Numpad1'); h.frames(2); assert.equal(h.state().fighters[1].attack.kind, 'light');
  h.runtime.stop(); assert.equal(verifyXenoTrialsReplayV232(h.replays[0]).valid, true);
});

test('two standard pads drive distinct live humans and disconnect pauses without a CPU takeover', async () => {
  const pads = [pad(0), pad(1)], h = host({ pads }); await h.start();
  const start = h.state().fighters.map(fighter => fighter.x);
  pads[1].axes[0] = 1; h.frames(20);
  assert.equal(h.state().fighters[0].x, start[0]); assert.ok(h.state().fighters[1].x > start[1]);
  pads[0].axes[0] = -1; h.frames(20);
  assert.ok(h.state().fighters[0].x < start[0]);
  assert.equal(h.state().opponentInputSourceV163, 'direct');
  h.pads = [pads[0]]; h.frames(); assert.equal(h.state().paused, true);
  const tick = h.state().tick; h.frames(50); assert.equal(h.state().tick, tick);
  assert.equal(h.state().opponentInputSourceV163, 'direct');
  h.runtime.stop(); assert.equal(h.queue.size, 0);
});

test('tag preloads all four native fighter assets and draws the actual replacement on either team', async () => {
  const supplied = config(); supplied.exhibitionV232.opponentTeam[0] = { id: 'arachnoid', variant: 'grey' };
  const h = host({ config: supplied }); await h.start();
  for (const member of [...supplied.exhibitionV232.playerTeam, ...supplied.exhibitionV232.opponentTeam])
    assert.ok(h.loaded.has(getXenoTrialsArtV96(member.id, member.variant).path), member.id);
  h.key('KeyR'); h.frames(80); h.key('KeyR', false);
  assert.equal(h.state().fighters[0].id, 'defender'); assert.equal(h.state().tagV232.teams.player.activeIndex, 1);
  h.key('NumpadAdd'); h.frames(80); h.key('NumpadAdd', false);
  assert.equal(h.state().fighters[1].id, 'xenoborg'); assert.equal(h.state().tagV232.teams.opponent.activeIndex, 1);
  const paints = h.state().rigViewsV154;
  assert.equal(paints.filter(view => view.side === 'player').length, 1);
  // Xenoborg has a native static image here, not a rig-frame receipt. Its exact
  // original art must still be painted after the physical reserve exchange.
  assert.ok(h.draws.some(([image]) => image.src === getXenoTrialsArtV96('xenoborg').path));
  assert.ok(h.draws.length > 0);
  h.runtime.stop(); assert.deepEqual(h.checkpoints, []);
});

test('runtime draws an earned assist under its own instance receipt while preserving the active side receipt', async () => {
  const h = host(); await h.start(); earnAssist(h);
  const meter = h.state().fighters[0].superMeterV148;
  h.key('KeyG'); h.frames(3);
  const state = h.state(), assist = state.exhibitionViewV232.assists.sides.player.actor;
  assert.ok(assist); assert.match(assist.instanceId, /^assist-player-/);
  const paintings = state.rigViewsV154.filter(view => view.side === 'player');
  assert.equal(paintings.length, 2);
  assert.equal(paintings.filter(view => !view.assistInstanceId).length, 1);
  const helper = paintings.find(view => view.assistInstanceId === assist.instanceId);
  assert.ok(helper); assert.equal(helper.memberInstanceId, assist.memberInstanceId);
  assert.equal(state.fighters[0].id, 'warrior');
  assert.equal(state.fighters[0].superMeterV148, Math.round((meter - 25) * 100) / 100);
  assert.equal(state.exhibitionViewV232.assists.sides.player.stats.accepted, 1);
  assert.ok(state.events.some(row => row.type === 'assist-start-v232' && row.instanceId === helper.assistInstanceId));
  h.key('KeyG', false); h.frames(170);
  assert.equal(h.state().rigViewsV154.filter(view => view.side === 'player').length, 1);
  h.runtime.stop(); assert.deepEqual(h.checkpoints, []);
});

test('stop removes local/runtime RAF and listeners, restores canvas and rejects late keyboard or image work', async () => {
  const h = host(); await h.start();
  assert.ok(h.window.listenerCount() > 0); assert.ok(h.document.listenerCount() > 0); assert.ok(h.queue.size > 0);
  h.runtime.stop(); h.runtime.stop();
  assert.equal(h.queue.size, 0); assert.equal(h.window.listenerCount(), 0);
  assert.equal(h.document.listenerCount(), 0); assert.equal(h.root.listenerCount(), 0); assert.equal(h.canvas.listenerCount(), 0);
  assert.deepEqual([h.canvas.width, h.canvas.height], [800, 600]);
  const frozen = h.state(); h.key('KeyD'); h.frames(100); await Promise.resolve();
  assert.equal(h.state().tick, frozen.tick); assert.deepEqual(h.state().fighters, frozen.fighters);
  assert.equal(await h.runtime.start(), false);
});

test('stop during pending team image loads releases both owners and rejects late start completion', async () => {
  const pending = [], h = host({ loadImage: path => new Promise(resolve => pending.push({ path, resolve })) });
  const starting = h.runtime.start(); assert.ok(pending.length >= 4);
  h.runtime.stop(); assert.equal(h.queue.size, 0); assert.equal(h.window.listenerCount(), 0); assert.equal(h.document.listenerCount(), 0);
  for (const task of pending) task.resolve(decoded(task.path));
  assert.equal(await starting, false); await Promise.resolve();
  assert.equal(h.queue.size, 0); assert.deepEqual(h.results, []); assert.deepEqual(h.checkpoints, []); assert.deepEqual(h.replays, []);
});

test('runtime factory rejects mixed exhibition/replay practice or checkpoint sessions before installing owners', () => {
  const replay = terminalReplay();
  for (const source of [{ config: config() }, { replayV232: replay }]) {
    for (const incompatible of [{ practiceV207: 'practice-fixture' }, { practiceSandboxV208: {} },
      { resumeSnapshot: {} }, { resumeDuelSnapshot: {} }]) {
      const h = host({ create: false });
      assert.throws(() => createXenoTrialsRuntimeV96({ canvas: h.canvas, window: h.window, document: h.document,
        ...source, ...incompatible }), /exhibition.*reprendre/i);
      assert.equal(h.queue.size, 0); assert.equal(h.window.listenerCount(), 0); assert.equal(h.document.listenerCount(), 0);
    }
  }
});

test('live runtime records accepted pause/release/tag lifecycle once and its archive resimulates natively', async () => {
  const h = host(); await h.start(); h.key('KeyR'); h.frames(70); h.key('KeyR', false); h.frames(5);
  // Release another source while interact remains physically held on each
  // owner. Even outside operations its lifecycle mask must survive replay.
  h.key('KeyE'); h.key('KeyJ', false); h.key('NumpadDecimal'); h.key('Numpad1', false); h.frames(3);
  assert.equal(h.runtime.pause(), true); h.frames(8); assert.equal(h.runtime.resume(), true); h.frames(25);
  h.key('KeyE', false); h.key('NumpadDecimal', false);
  h.key('KeyD'); h.frames(20); h.key('KeyD', false); h.frames(3);
  h.runtime.stop(); assert.equal(h.replays.length, 1);
  assert.equal(h.runtime.getReplayV232().id, h.replays[0].id);
  const replay = h.replays[0], verified = verifyXenoTrialsReplayV232(replay);
  assert.equal(verified.valid, true, JSON.stringify(verified));
  assert.ok(replay.runs.some(row => row[0] === 'pause' && row[1] === true));
  assert.ok(replay.runs.some(row => row[0] === 'pause' && row[1] === false));
  assert.ok(replay.runs.some(row => row[0] === 'release' && row[1] === 'opponent'));
  h.runtime.stop(); assert.equal(h.replays.length, 1); assert.deepEqual(h.results, []); assert.deepEqual(h.checkpoints, []);
});

test('live recording preserves a native round transition and terminal result without an exhibition checkpoint', async () => {
  const h = host({ config: config({ mode: 'duel', roundsToWin: 2, rulesV119: { initialHp: 1 } }) }); await h.start();
  for (let round = 1; round <= 2; round++) {
    approach(h); h.runtime.setInput('light', true);
    let budget = 100;
    while (h.state().phase === 'active' && budget-- > 0) h.frames();
    h.runtime.setInput('light', false); assert.ok(budget > 0);
    if (round === 1) {
      assert.equal(h.state().phase, 'round-over'); assert.equal(h.runtime.nextRound(), true);
      h.runtime.skipSequence();
      while (h.state().presentation.blocksSimulation) h.frames();
      h.frames(2);
    }
  }
  assert.equal(h.state().phase, 'match-over'); assert.equal(h.results.length, 1);
  assert.equal(h.replays.length, 1); assert.ok(h.replays[0].runs.some(row => row[0] === 'round'));
  const checked = verifyXenoTrialsReplayV232(h.replays[0]); assert.equal(checked.valid, true, JSON.stringify(checked));
  assert.equal(h.replays[0].complete, true); assert.deepEqual(h.checkpoints, []);
  h.runtime.stop(); assert.equal(h.results.length, 1); assert.equal(h.replays.length, 1);
});

test('read-only terminal replay ignores live controls; repeated seek/play/pause cannot emit result or checkpoint', async () => {
  const replay = terminalReplay(), h = host({ replayV232: replay }); await h.start();
  assert.equal(h.state().replayV232.readOnly, true); assert.equal(h.state().replayV232.rewardEligible, false);
  assert.equal(h.runtime.seekReplayV232(replay.operations), true);
  const terminal = h.state(); assert.equal(terminal.replayV232.verified, true);
  assert.equal(terminal.result.version, 232); assert.equal(terminal.result.rewardEligible, false);
  const digest = hashXenoTrialsReplayStateV232(terminal.fighters);
  h.runtime.setInput('light', true); h.key('Numpad1'); h.key('KeyR'); h.frames(30);
  assert.equal(hashXenoTrialsReplayStateV232(h.state().fighters), digest);
  assert.equal(h.runtime.seekReplayV232(0), true); assert.equal(h.state().replayV232.position, 0);
  assert.equal(h.runtime.resume(), true); h.frames(2000);
  assert.equal(h.state().replayV232.verified, true);
  assert.equal(h.runtime.seekReplayV232(Math.floor(replay.operations / 2)), true);
  assert.equal(h.runtime.pause(), false); assert.equal(h.runtime.saveCheckpoint(), false);
  assert.deepEqual(h.results, []); assert.deepEqual(h.checkpoints, []); assert.deepEqual(h.replays, []);
  h.runtime.stop(); assert.equal(h.queue.size, 0);
});

test('replay stage observer follows frame ticks, native boundary impact and seek/restart without stale effects', async () => {
  const { replay, hit, impactPosition } = boundaryReplay();
  const h = host({ replayV232: replay, reducedMotion: false }); await h.start();
  for (let frame = 0; frame < 20; frame++) {
    h.frames(); const state = h.state();
    assert.equal(state.stageEventsV211.tick, state.tick);
    assert.equal(state.stageEventsV211.phase, 'combat');
  }
  assert.equal(h.runtime.pause(), true); const frozen = h.state().stageEventsV211;
  h.frames(20); assert.deepEqual(h.state().stageEventsV211, frozen);
  assert.equal(h.runtime.seekReplayV232(impactPosition - 3), true);
  assert.equal(h.state().stageEventsV211.tick, h.state().tick);
  assert.equal(h.runtime.resume(), true); h.frames(6);
  const contact = h.state(); assert.equal(contact.stageEventsV211.tick, contact.tick);
  assert.equal(contact.stageEventsV211.impact?.id, hit.id);
  assert.equal(contact.stageEventsV211.impact.side, 'right');
  assert.deepEqual(contact.stageEventsV211.degraded, ['right']);
  h.frames(30); assert.equal(h.state().replayV232.ended, true);
  assert.equal(h.state().stageEventsV211.tick, h.state().tick, 'ending playback still observes the final native tick');
  assert.equal(h.runtime.seekReplayV232(0), true);
  const restarted = h.state(); assert.equal(restarted.tick, 0); assert.equal(restarted.stageEventsV211.tick, 0);
  assert.equal(restarted.stageEventsV211.impact, null); assert.deepEqual(restarted.stageEventsV211.degraded, []);
  assert.equal(h.runtime.resume(), true); h.frames(25);
  const fresh = h.state(); assert.equal(fresh.stageEventsV211.tick, fresh.tick);
  assert.equal(fresh.stageEventsV211.impact, null); assert.deepEqual(fresh.stageEventsV211.degraded, []);
  assert.deepEqual(h.results, []); assert.deepEqual(h.checkpoints, []); h.runtime.stop();
});

test('the real UI replay launch routes terminal playback without settlement or checkpoint callbacks', async () => {
  const replay = terminalReplay(), h = host({ create: false }), beforeWindow = globalThis.window, beforeDocument = globalThis.document;
  globalThis.window = h.window; globalThis.document = h.document;
  const calls = { settlement: 0, checkpoint: 0, commits: 0 }, elements = new Map();
  const ui = Object.create(XenoTrialsUiV96.prototype);
  Object.assign(ui, { active: true, generation: 232, runtime: null, unsavedResult: null,
    root: { ownerDocument: h.document, scrollTop: 0 }, exhibitionSelectionV232: { record: true },
    canCommit: () => true, isRunning: () => false, state: () => ({ pending: null }), getProgress: () => ({ pending: null }),
    getReducedMotion: () => true, audioEnabledV189: false, render() {}, message() {}, updateMatch() {},
    closeRuntime() { this.runtime?.stop(); this.runtime = null; },
    finish() { calls.settlement++; }, persistCheckpointV186() { calls.checkpoint++; },
    onCommit() { calls.commits++; }, replayStorageV232: () => null,
    el(name) { if (name === 'canvas') return h.canvas; if (!elements.has(name)) elements.set(name, { textContent: '', hidden: false, focus() {} }); return elements.get(name); },
  });
  try {
    assert.equal(await ui.launch(replay.config, null, null, undefined, undefined, replay), true);
    h.attach(ui.runtime); assert.equal(ui.runtime.seekReplayV232(replay.operations), true); h.frames(5);
    assert.deepEqual(calls, { settlement: 0, checkpoint: 0, commits: 0 });
    ui.closeRuntime(); assert.equal(h.queue.size, 0);
  } finally {
    ui.closeRuntime(); globalThis.window = beforeWindow; globalThis.document = beforeDocument;
  }
});
