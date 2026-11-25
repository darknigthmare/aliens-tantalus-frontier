import test from 'node:test';
import assert from 'node:assert/strict';
import { createXenoTrialsAudioV189, XENO_TRIALS_AUDIO_LIMITS_V189 as limits } from '../src/xeno-trials-audio-v189.js';
import { AudioDirector } from '../src/audio.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, getXenoTrialsSnapshotV96 } from '../src/xeno-trials-engine-v96.js';

// WebAudio scheduling/decoding hardware is substituted only. Tests observe the
// actual controller and, where stated, the production global AudioDirector and
// fixed-step combat. These mocks do not establish audible quality in Chromium.
class Param {
  constructor(value = 0) { this.value = value; }
  setValueAtTime(value) { this.value = value; }
  exponentialRampToValueAtTime(value) { this.value = value; }
  linearRampToValueAtTime(value) { this.value = value; }
}
class Node {
  constructor(context) { this.context = context; this.connections = new Set(); this.gain = new Param(1); context.nodes.push(this); }
  connect(node) { this.connections.add(node); return node; }
  disconnect() { this.connections.clear(); }
}
class Oscillator extends Node {
  constructor(context) { super(context); this.frequency = new Param(); this.onended = null; this.started = false; this.ended = false; this.endsAt = Infinity; }
  start() { this.started = true; }
  stop(when = this.context.currentTime) {
    this.endsAt = when;
    if (when <= this.context.currentTime && !this.ended) { this.ended = true; this.onended?.(); }
  }
}
class Context {
  constructor() { this.nodes = []; this.currentTime = 0; this.state = 'suspended'; this.destination = new Node(this); this.closeCalls = 0; this.suspendCalls = 0; this.resumeCalls = 0; }
  createGain() { return new Node(this); }
  createOscillator() { return new Oscillator(this); }
  async resume() { this.resumeCalls++; this.state = 'running'; }
  async suspend() { this.suspendCalls++; this.state = 'suspended'; }
  async close() { this.closeCalls++; this.state = 'closed'; }
  advance(seconds) {
    this.currentTime += seconds;
    for (const node of this.nodes) if (node instanceof Oscillator && !node.ended && node.endsAt <= this.currentTime) {
      node.ended = true; node.onended?.();
    }
  }
}
function shared(options = {}) {
  const context = new Context(); context.state = 'running';
  const master = context.createGain(); master.connect(context.destination); master.gain.value = .182;
  const director = { context, master, enabled: true, disposed: false, volumes: { master: 1, effects: .7, music: .4 },
    unlock() { return context.resume(); } };
  const audio = createXenoTrialsAudioV189({ audioDirector: director, ...options });
  return { context, master, director, audio };
}
function snapshot({ tick = 0, serial = 0, events = [], ...extra } = {}) {
  return { config: { matchId: 'xt96-1', seed: 96001, stageId: 'containment-deck' }, tick, serial,
    phase: 'active', paused: false, result: null, events, ...extra };
}
function packet(base, tick, events, extra = {}) {
  let serial = base.serial;
  const appended = events.map(event => ({ id: ++serial, tick, ...event }));
  return snapshot({ ...base, tick, events: appended, serial, ...extra });
}

test('creation and observation cannot create or unlock a context; only a trusted input creates the optional owned fallback', async () => {
  let created = 0; class CountedContext extends Context { constructor() { super(); created++; } }
  const audio = createXenoTrialsAudioV189({ AudioContextCtor: CountedContext });
  const initial = snapshot(); audio.observeState(initial);
  assert.equal(created, 0); assert.equal(audio.getState().activeVoices, 0);
  assert.equal(await audio.unlock({ type: 'keydown', isTrusted: false }), false); assert.equal(created, 0);
  assert.equal(await audio.unlock({ type: 'visibilitychange', isTrusted: true }), false); assert.equal(created, 0);
  assert.equal(await audio.unlock({ type: 'pointerdown', isTrusted: true }), true); assert.equal(created, 1);
  audio.observeState(packet(initial, 1, [{ type: 'attack', side: 'player', kind: 'light' }]));
  assert.equal(audio.getState().counts.light, 1); assert.equal(audio.getState().humActive, true);
  audio.stop(); assert.equal(audio.getState().contextState, 'closed'); assert.equal(audio.getState().activeVoices, 0);
});

test('initial, checkpoint and restart snapshots prime their cursors without playing historical contacts', () => {
  const { audio } = shared();
  const restored = snapshot({ tick: 1200, serial: 90, events: [{ id: 90, tick: 1200, type: 'hit', side: 'opponent', damage: 12 }] });
  audio.observeState(restored); assert.equal(audio.getState().emittedCues, 0); assert.equal(audio.getState().consumedSerial, 90);
  const fresh = packet(restored, 1201, [{ type: 'hit', side: 'opponent', damage: 12 }]);
  audio.observeState(fresh); assert.equal(audio.getState().counts.hit, 1);
  audio.observeState(fresh); assert.equal(audio.getState().counts.hit, 1);
  audio.resume(packet(fresh, 1400, [{ type: 'hit', side: 'opponent', damage: 12 }]));
  audio.observeState(packet(fresh, 1400, [{ type: 'hit', side: 'opponent', damage: 12 }]));
  assert.equal(audio.getState().counts.hit, 1);
  audio.observeState(snapshot()); assert.equal(audio.getState().emittedCues, 1, 'a restarted ticket cannot replay the previous buffer');
  audio.stop();
});

test('pause, blur and inactive presentation gates release nodes and consume suppressed events without a catch-up burst', () => {
  for (const gate of ['pause', 'blur', 'inactive']) {
    const { audio, context } = shared(); let state = snapshot(); audio.observeState(state);
    state = packet(state, 12, [{ type: 'hit', side: 'opponent', damage: 20 }]); audio.observeState(state);
    assert.ok(audio.getState().activeVoices > 0);
    if (gate === 'pause') audio.pause();
    const hidden = packet(state, 100, [{ type: 'attack', side: 'opponent', kind: 'heavy' }, { type: 'hit', side: 'player', damage: 8 }]);
    audio.observeState(hidden, { focused: gate !== 'blur', active: gate !== 'inactive' });
    assert.equal(audio.getState().activeVoices, 0); assert.equal(audio.getState().gain, 0);
    assert.equal(context.closeCalls, 0); assert.equal(context.suspendCalls, 0, 'a shared context belongs to its director');
    audio.resume(hidden); audio.observeState(hidden);
    assert.equal(audio.getState().counts.hurt, 0); assert.equal(audio.getState().counts.heavy, 0);
    audio.observeState(packet(hidden, 120, [{ type: 'hit', side: 'player', damage: 6 }]));
    assert.equal(audio.getState().counts.hurt, 1); audio.stop();
  }
});

test('local mute is transient, independent of the global director, and cannot replay muted effects on unmute', () => {
  const { audio, director } = shared(); let state = snapshot(); audio.observeState(state);
  audio.setEnabled(false); assert.equal(audio.getState().activeVoices, 0); assert.equal(director.enabled, true);
  state = packet(state, 20, [{ type: 'attack', side: 'player', kind: 'special' }]); audio.observeState(state);
  audio.setEnabled(true); audio.observeState(state); assert.equal(audio.getState().counts.special, 0);
  audio.observeState(packet(state, 50, [{ type: 'attack', side: 'player', kind: 'special' }]));
  assert.equal(audio.getState().counts.special, 1); audio.stop();
});

test('the production AudioDirector controls the shared effects gain, music independence, global mute and context ownership', async () => {
  const director = new AudioDirector({ AudioContextCtor: Context, AudioCtor: null,
    fetchImpl: async () => ({ ok: true, headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ schema: 1, tracks: { sfx: {}, music: {} } }) }) });
  const audio = createXenoTrialsAudioV189({ audioDirector: director });
  assert.equal(director.context, null); audio.observeState(snapshot()); assert.equal(director.context, null);
  assert.equal(await audio.unlock({ type: 'keydown', isTrusted: true }), true); await director.prepare();
  let state = snapshot({ tick: 1 }); audio.observeState(state);
  assert.ok(Math.abs(audio.getState().gain - .182) < 1e-10);
  assert.equal(director.effectVoices.size, audio.getState().activeVoices);
  director.setVolumes({ master: .3, effects: .25, music: 0 }); audio.observeState(state);
  assert.ok(Math.abs(audio.getState().gain - .0195) < 1e-10); assert.equal(audio.getState().humActive, true);
  director.setVolumes({ effects: 0 });
  state = packet(state, 50, [{ type: 'hit', side: 'opponent', damage: 5 }]); audio.observeState(state);
  assert.equal(audio.getState().activeVoices, 0); assert.equal(audio.getState().gain, 0);
  director.setVolumes({ effects: .25 }); audio.observeState(state); assert.equal(audio.getState().counts.hit, 0);
  director.enabled = false; audio.observeState(state); assert.equal(audio.getState().activeVoices, 0);
  director.enabled = true; audio.observeState(state);
  director.tone(250, .2, 'sine', .02);
  assert.equal(director.effectVoices.size, audio.getState().activeVoices + 1);
  audio.stop(); assert.equal(director.effectVoices.size, 1, 'stopping Trials preserves another owner’s sound');
  director.context.advance(1); assert.equal(director.effectVoices.size, 0);
  assert.equal(director.context.closeCalls, 0); assert.equal(director.context.suspendCalls, 0);
  director.dispose(); assert.equal(director.context.closeCalls, 1);
});

test('forty simultaneous crowd contacts coalesce into one cue, and sustained mixed events respect voice and rate caps', () => {
  const { audio, context } = shared(); let state = snapshot(); audio.observeState(state);
  state = packet(state, 1, Array.from({ length: 40 }, () => ({ type: 'hit', side: 'opponent', damage: 8 })));
  audio.observeState(state); assert.equal(audio.getState().counts.hit, 1); assert.ok(audio.getState().suppressedCues >= 39);
  let maximum = 0;
  for (let tick = 2; tick < 120; tick++) {
    state = packet(state, tick, [{ type: 'attack', side: 'player', kind: 'light' }, { type: 'attack', side: 'opponent', kind: 'super' },
      { type: 'guard-break', side: 'player' }, { type: 'block', side: 'opponent' }, { type: 'stage-hazard-warning-v188' }]);
    context.advance(1 / 120); audio.observeState(state); maximum = Math.max(maximum, audio.getState().activeVoices);
  }
  assert.ok(maximum <= limits.maxVoices); assert.ok(audio.getState().emittedCues <= limits.maxCuesPerSecond);
  audio.stop(); assert.equal(audio.getState().timers, 0); assert.equal(audio.getState().animationFrames, 0);
});

test('combat, boss, hazard and objective events select their own bounded original cue families', () => {
  for (const [event, cue] of [
    [{ type: 'attack', side: 'player', kind: 'light' }, 'light'],
    [{ type: 'attack', side: 'player', kind: 'heavy' }, 'heavy'],
    [{ type: 'attack', side: 'player', kind: 'special' }, 'special'],
    [{ type: 'attack', side: 'player', kind: 'super' }, 'super'],
    [{ type: 'hit', side: 'player', damage: 5 }, 'hurt'], [{ type: 'block', side: 'player' }, 'block'],
    [{ type: 'guard-break', side: 'player' }, 'guardBreak'],
    [{ type: 'horde-boss-incoming-v186' }, 'boss'], [{ type: 'horde-boss-spawn-v186' }, 'boss'],
    [{ type: 'horde-boss-telegraph-v186' }, 'warning'], [{ type: 'stage-hazard-warning-v188' }, 'warning'],
    [{ type: 'stage-hazard-contact-v188', actorId: 'horde-1', damage: 5 }, 'hazard'],
    [{ type: 'stage-hazard-contact-v188', actorId: 'player', damage: 5 }, 'hurt'],
    [{ type: 'operation-objective-v188' }, 'objective'], [{ type: 'operation-delivery-v188' }, 'objective']
  ]) {
    const { audio } = shared({ ambience: false }); const initial = snapshot(); audio.observeState(initial);
    audio.observeState(packet(initial, 1, [event]));
    assert.equal(audio.getState().counts[cue], 1, event.type); assert.equal(audio.getState().emittedCues, 1);
    assert.ok(audio.getState().activeVoices <= 2); audio.stop();
  }
  for (const [winner, cue] of [['opponent', 'defeat'], ['draw', 'draw']]) {
    const { audio } = shared({ ambience: false }); const initial = snapshot(); audio.observeState(initial);
    audio.observeState(packet(initial, 1, [{ type: 'match-end', winner }], { phase: 'match-over', result: { completed: true, winner } }));
    assert.equal(audio.getState().counts[cue], 1); audio.stop();
  }
});

test('accepted native attacks and contacts sound without changing engine state or paying attention to raw held buttons', () => {
  const { audio, context } = shared();
  const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner', seed: 189, matchId: 'audio-native',
    introSeconds: 0, rulesV119: { initialHp: 1 } });
  audio.observeState(getXenoTrialsSnapshotV96(match));
  // Neutral direct opponent controls isolate genuine attack/contact acceptance.
  // Every hit, round and final verdict is generated by the production engine.
  for (let tick = 0; tick < 120 * 12 && !match.result; tick++) {
    stepXenoTrialsMatchV96(match, 1 / 120, match.phase === 'active' ? { right: true, heavy: tick % 120 === 0 } : {}, {});
    const state = getXenoTrialsSnapshotV96(match), before = JSON.stringify(state);
    context.advance(1 / 120); audio.observeState(state);
    assert.equal(JSON.stringify(getXenoTrialsSnapshotV96(match)), before);
  }
  assert.equal(match.result?.winner, 'player'); assert.ok(audio.getState().counts.heavy > 0);
  assert.ok(audio.getState().counts.hit > 0); assert.equal(audio.getState().counts.victory, 1);
  assert.equal(audio.getState().humActive, false); audio.stop();
});

test('unsupported, unknown, future and old events are silent; result cues require the actual terminal snapshot', () => {
  const { audio } = shared(); const initial = snapshot(); audio.observeState(initial);
  audio.observeState(packet(initial, 100, [{ type: 'fake-input', kind: 'heavy' }, { type: 'attack', side: 'player', kind: 'unknown' },
    { type: 'hit', side: 'player', damage: 0 }, { type: 'hit', side: 'player', damage: 2, tick: 1 },
    { type: 'match-end', winner: 'player' }, { type: 'block', tick: 101 }]));
  assert.equal(audio.getState().emittedCues, 0);
  const unsupported = createXenoTrialsAudioV189({ AudioContextCtor: null }); unsupported.observeState(snapshot());
  assert.equal(unsupported.getState().supported, false); assert.equal(unsupported.getState().activeVoices, 0);
  unsupported.stop(); audio.stop();
});

test('a final cue releases the hum and its completed graph without closing the shared context', () => {
  const { audio, context, master } = shared(); const initial = snapshot(); audio.observeState(initial);
  const terminal = packet(initial, 1, [{ type: 'match-end', winner: 'player' }],
    { phase: 'match-over', result: { completed: true, winner: 'player' } });
  audio.observeState(terminal); assert.equal(audio.getState().counts.victory, 1); assert.equal(audio.getState().humActive, false);
  assert.equal(audio.getState().activeVoices, 2); context.advance(1);
  assert.equal(audio.getState().activeVoices, 0); assert.equal(audio.getState().gain, 0);
  assert.ok(context.nodes.filter(node => node !== master && node !== context.destination).every(node => node.connections.size === 0));
  audio.stop(); assert.equal(context.closeCalls, 0); assert.equal(context.suspendCalls, 0); assert.equal(master.connections.size, 1);
});

test('stop settles an unlock whose shared provider never resolves; a later provider completion cannot recreate audio', async () => {
  let resolve, unlocks = 0;
  const context = new Context(), master = context.createGain(); master.connect(context.destination);
  const director = { context, master, volumes: { master: 1, effects: 1 }, enabled: true,
    unlock: () => { unlocks++; return new Promise(done => { resolve = () => { context.state = 'running'; done(true); }; }); } };
  const audio = createXenoTrialsAudioV189({ audioDirector: director });
  const pending = audio.unlock({ type: 'pointerdown', isTrusted: true });
  const duplicate = audio.unlock({ type: 'keydown', isTrusted: true });
  assert.equal(unlocks, 1); audio.stop();
  // The underlying provider is deliberately STILL unresolved at both awaits.
  assert.equal(await pending, false); assert.equal(await duplicate, false);
  assert.equal(context.state, 'suspended'); assert.equal(context.nodes.length, 2);
  resolve(); await Promise.resolve(); await Promise.resolve();
  audio.observeState(snapshot()); assert.equal(audio.getState().activeVoices, 0);
  assert.equal(audio.getState().status, 'stopped'); assert.equal(context.closeCalls, 0);
  assert.equal(context.suspendCalls, 0); assert.equal(context.nodes.length, 2);
});

test('muting during a pending owned-context unlock leaves no running private audio resource or delayed cue', async () => {
  let finish, context;
  class DelayedContext extends Context {
    constructor() { super(); context = this; }
    resume() { return new Promise(resolve => { finish = () => { this.state = 'running'; resolve(); }; }); }
  }
  const audio = createXenoTrialsAudioV189({ AudioContextCtor: DelayedContext });
  audio.observeState(snapshot());
  const pending = audio.unlock({ type: 'click', isTrusted: true });
  audio.setEnabled(false); finish();
  assert.equal(await pending, false); assert.equal(audio.getState().status, 'muted');
  assert.equal(context.state, 'suspended'); assert.equal(audio.getState().activeVoices, 0);
  audio.stop(); assert.equal(context.state, 'closed');
});
