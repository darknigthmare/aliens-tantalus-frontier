import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { AudioDirector } from '../src/audio.js';
import { bindHubControlV133 } from '../src/hub-control-bindings-v133.js';
import { GameEngine as ProductionGame } from '../src/game-production-runtime.js';
import { HubGame as NativeHub } from '../src/hub-opening-v88.js';
import { createDefaultSave } from '../src/save.js';
import { withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { withHubNpcCirculationV158 } from '../src/npc-circulation-v158.js';
import { withHubNpcAnnexCirculationV159 } from '../src/npc-annex-circulation-v159.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES } from '../src/content.js';
import { MOTION_TRACKER_V160 as C, createMotionTrackerStateV160, observeMotionTrackerBodiesV160,
  beginMotionTrackerPulseV160, advanceMotionTrackerSweepV160, motionTrackerSnapshotV160,
  motionTrackerPingIntervalV160, withMotionTrackerV160, withHubMotionTrackerV160, canUseHubMotionTrackerV160 } from '../src/motion-tracker-v160.js';
import { drawMotionTrackerDisplayV160, motionTrackerLayoutV160, motionTrackerActorBoundsV160 } from '../src/motion-tracker-display-v160.js';

const observer = (x = 0, y = 0, heading = 1, depth = 0) => ({ position: { x, y, depth }, heading });
const body = (entity, x, y = 0, extra = {}) => ({ entity, id: entity.id, position: { x, y, depth: 0 }, context: 'same', ...extra });
function step(state, bodies, time, watch = observer(), context = 'same') {
  observeMotionTrackerBodiesV160(state, { context, time, bodies });
  advanceMotionTrackerSweepV160(state, watch);
  return motionTrackerSnapshotV160(state, watch);
}
function movingFixture(entities = [{ id: 'body' }]) {
  const state = createMotionTrackerStateV160('same');
  observeMotionTrackerBodiesV160(state, { context: 'same', time: 0, bodies: entities.map((e, i) => body(e, 180 + i * 10)) });
  observeMotionTrackerBodiesV160(state, { context: 'same', time: .1, bodies: entities.map((e, i) => body(e, 185 + i * 10)) });
  beginMotionTrackerPulseV160(state, observer()); return { state, entities };
}

test('first samples and velocity intentions cannot invent observed motion', () => {
  const actor = { id: 'stationary', vx: 400 }, state = createMotionTrackerStateV160('same');
  observeMotionTrackerBodiesV160(state, { context: 'same', time: 0, bodies: [body(actor, 150)] });
  beginMotionTrackerPulseV160(state, observer());
  for (let t = .05; t < 2; t += .05) assert.equal(step(state, [body(actor, 150)], t).contacts.length, 0);
  assert.equal(state.observations.get(actor).moving, false);
});

test('an expanding sweep acquires real motion after reaching its measured position', () => {
  const { state, entities: [entity] } = movingFixture();
  assert.equal(motionTrackerSnapshotV160(state, observer()).contacts.length, 0);
  assert.equal(step(state, [body(entity, 190)], .2).contacts.length, 0);
  const acquired = step(state, [body(entity, 195)], .4);
  assert.equal(acquired.contacts.length, 1); assert.equal(acquired.contacts[0].x, 195);
  assert.equal(acquired.contacts[0].distance, 195); assert.equal(acquired.contacts[0].sector, 'front');
});

test('allied and hostile object metadata have the same anonymous echo contract', () => {
  const allies = [{ id: 'friendly', faction: 'marines' }, { id: 'hostile', isBoss: true, biology: 'xenomorph' }];
  const { state } = movingFixture(allies);
  step(state, allies.map((e, i) => body(e, 190 + i * 10)), .2);
  const model = step(state, allies.map((e, i) => body(e, 195 + i * 10)), .4);
  assert.equal(model.contacts.length, 2); assert.equal(model.identityAvailable, false); assert.equal(model.factionAvailable, false);
  for (const contact of model.contacts) for (const key of ['faction', 'species', 'isBoss', 'threat', 'biology', 'name']) assert.equal(Object.hasOwn(contact, key), false);
});

test('a measured echo does not follow its unobserved source and stops reporting current motion when stationary', () => {
  const { state, entities: [entity] } = movingFixture();
  step(state, [body(entity, 190)], .2);
  const seen = step(state, [body(entity, 195)], .4); assert.equal(seen.contacts.length, 1);
  const moved = step(state, [body(entity, 205)], .5);
  assert.equal(moved.contacts[0].x, 195); assert.equal(moved.contacts[0].sampledAt, .4);
  const stopped = step(state, [body(entity, 205)], .6);
  assert.equal(stopped.contacts[0].currentMotion, false); assert.equal(stopped.currentMovement, false);
  for (let t = .65; t < 2.1; t += .05) step(state, [body(entity, 205)], t);
  assert.equal(motionTrackerSnapshotV160(state, observer()).contacts.length, 0);
});

test('walking the observer past a stationary body produces no phantom target', () => {
  const entity = { id: 'still' }, state = createMotionTrackerStateV160('same');
  observeMotionTrackerBodiesV160(state, { context: 'same', time: 0, bodies: [body(entity, 400)] });
  beginMotionTrackerPulseV160(state, observer());
  for (let i = 1; i <= 30; i++) assert.equal(step(state, [body(entity, 400)], i * .05, observer(i * 8)).contacts.length, 0);
});

test('different charts and a rewound simulation clear the old scan and echo ownership', () => {
  const { state, entities: [entity] } = movingFixture(); step(state, [body(entity, 190)], .2); step(state, [body(entity, 195)], .4);
  let model = step(state, [body(entity, 200, 0, { context: 'annex' })], .5, observer(), 'annex');
  assert.equal(model.active, false); assert.equal(model.contacts.length, 0); assert.equal(state.observations.get(entity).moving, false);
  beginMotionTrackerPulseV160(state, observer());
  model = step(state, [body(entity, 200, 0, { context: 'annex' })], .1, observer(), 'annex');
  assert.equal(model.active, false);
});

test('reused runtime IDs, teleport jumps and long gaps cannot become motion debt', () => {
  const { state, entities: [entity] } = movingFixture(); step(state, [body(entity, 190)], .2); step(state, [body(entity, 195)], .4);
  const fresh = { id: entity.id };
  assert.equal(step(state, [body(fresh, 205)], .5).contacts.length, 0);
  assert.equal(state.observations.get(fresh).moving, false);
  step(state, [body(fresh, 210)], .6); assert.equal(state.observations.get(fresh).moving, true);
  step(state, [body(fresh, 1600)], .62); assert.equal(state.observations.get(fresh).moving, false);
  step(state, [body(fresh, 1620)], 1.2); assert.equal(state.observations.get(fresh).moving, false);
});

test('range uses both screen axes and projected depth; reversing facing changes only the coarse bearing', () => {
  const { state, entities: [entity] } = movingFixture(); step(state, [body(entity, 190)], .2); step(state, [body(entity, 195)], .4);
  const right = motionTrackerSnapshotV160(state, observer()), left = motionTrackerSnapshotV160(state, observer(0, 0, -1));
  assert.equal(right.contacts[0].sector, 'front'); assert.equal(left.contacts[0].sector, 'rear');
  assert.equal(right.contacts[0].distance, left.contacts[0].distance);
  const distantObserver = motionTrackerSnapshotV160(state, observer(0, 1000)); assert.equal(distantObserver.contacts.length, 0);
  const depthObserver = motionTrackerSnapshotV160(state, observer(0, 0, 1, 100));
  assert.equal(depthObserver.contacts[0].sector, 'depth'); assert.ok(Math.abs(depthObserver.contacts[0].distance - Math.hypot(195, 100)) < 1e-8);
});

test('invalid, foreign-chart and removed bodies never enter or retain the measured set', () => {
  const { state, entities: [entity] } = movingFixture(); step(state, [body(entity, 190)], .2); step(state, [body(entity, 195)], .4);
  step(state, [body(entity, 200, 0, { active: false }), body({ id: 'foreign' }, 120, 0, { context: 'other' }),
    body({ id: 'bad' }, NaN)], .5);
  assert.equal(state.observations.size, 0); assert.equal(state.echoes.size, 0);
});

test('sensor observations and retained echoes stay bounded independently of a large source array', () => {
  const entities = Array.from({ length: 200 }, (_, i) => ({ id: `body-${i}` })), state = createMotionTrackerStateV160('same');
  observeMotionTrackerBodiesV160(state, { context: 'same', time: 0, bodies: entities.map(e => body(e, 180)) });
  observeMotionTrackerBodiesV160(state, { context: 'same', time: .1, bodies: entities.map(e => body(e, 185)) });
  beginMotionTrackerPulseV160(state, observer()); step(state, entities.map(e => body(e, 190)), .2); step(state, entities.map(e => body(e, 195)), .4);
  assert.equal(state.observations.size, C.maximumBodies); assert.equal(state.echoes.size, C.maximumEchoes);
});

test('re-reading the same pure frame does not erase observed speed or mutate the public projection', () => {
  const { state, entities: [entity] } = movingFixture(); step(state, [body(entity, 190)], .2); step(state, [body(entity, 195)], .4);
  const previous = motionTrackerSnapshotV160(state, observer());
  observeMotionTrackerBodiesV160(state, { context: 'same', time: .4, bodies: [body(entity, 195)] });
  assert.deepEqual(motionTrackerSnapshotV160(state, observer()), previous);
  for (let i = 0; i < 10; i++) assert.deepEqual(motionTrackerSnapshotV160(state, observer()), previous);
});

test('unactivated sensors make no contacts and the five-second view expires without a wall-clock timer', () => {
  const entity = { id: 'mobile' }, state = createMotionTrackerStateV160('same');
  for (let i = 0; i < 10; i++) assert.equal(step(state, [body(entity, 100 + i)], i * .1).active, false);
  beginMotionTrackerPulseV160(state, observer());
  for (let i = 10; i < 65; i++) step(state, [body(entity, 100 + i)], i * .1);
  assert.equal(motionTrackerSnapshotV160(state, observer()).active, false);
  assert.ok(motionTrackerPingIntervalV160(20) < motionTrackerPingIntervalV160(700));
});

const root = fileURLToPath(new URL('../', import.meta.url));
function host() {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(source) {
      this._src = source;
      try { const b = readFileSync(resolve(root, '.' + new URL(source, 'http://fixture.invalid').pathname));
        if (b.subarray(1, 4).toString() === 'PNG') { this.naturalWidth = b.readUInt32BE(16); this.naturalHeight = b.readUInt32BE(20); }
        else if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(12, 16).toString() === 'VP8X') {
          this.naturalWidth = b.readUIntLE(24, 3) + 1; this.naturalHeight = b.readUIntLE(27, 3) + 1; }
      } catch {}
      queueMicrotask(() => { const e = new Event(this.naturalWidth ? 'load' : 'error'); this.dispatchEvent(e); this[`on${e.type}`]?.(e); });
    }
    get src() { return this._src; } async decode() { if (!this.naturalWidth) throw Error('Missing declared fixture image'); }
  };
  const words = [], ctx = new Proxy({ measureText: t => ({ width: String(t).length * 6 }), fillText: t => words.push(String(t)),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) }, { get: (o, k) => k in o ? o[k] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  return { canvas, ctx, words };
}
function production() {
  const h = host(), audio = { enabled: true, volumes: { master: 1, effects: 1 }, pings: 0, tracker() { this.pings++; } };
  const events = [], Game = withMotionTrackerV160(ProductionGame), e = new Game(h.canvas, { audio, onEvent: event => events.push(event) });
  e.start({ world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1), equipment: [], crew: [], seed: 426 });
  Object.assign(e, { platforms: [{ id: 'fixture-floor', x: -200, y: 930, w: 6800, h: 200, floor: true }],
    ladders: [], lifts: [], walls: [], covers: [], doors: [], hazards: [], enemies: [], missionLevelRuntime: null });
  Object.assign(e.player, { x: 160, y: 838, vx: 0, vy: 0, grounded: true });
  const enemy = e.createEnemy(ENEMIES.find(x => x.id === 'enemy-005-warrior'), 0, 650, 930);
  e.enemies = [enemy]; return { ...h, e, enemy, audio, events };
}
function advance(e, seconds) { for (let left = seconds; left > 1e-8; left -= .025) e.update(Math.min(.025, left)); }

test('production Q uses real native movement, keeps energy/objective accounting and never outlines or identifies the contact', () => {
  const { e, enemy, events } = production(); advance(e, .3);
  assert.ok(e.motionTrackerStateV160.observations.get(enemy)?.moving, 'The native enemy actually walked before the scan.');
  const before = { energy: e.tracker.energy, pulses: e.tracker.pulses, revealed: enemy.revealed, alert: enemy.alert };
  assert.equal(e.activateTracker(e.player), true);
  assert.equal(e.tracker.pulses, before.pulses + 1); assert.equal(e.tracker.energy, before.energy - 24);
  assert.equal(enemy.revealed, before.revealed); assert.equal(enemy.alert, before.alert);
  assert.equal(events.findLast(event => event.type === 'tracker').contacts, 0);
  assert.equal(e.tracker.contacts.length, 0, 'No immediate enemy-only contacts leak before the real sweep.');
  advance(e, 1); const model = e.getSnapshot().motionTrackerV160;
  assert.ok(model.contacts.some(c => c.id === enemy.id));
  assert.ok(e.tracker.contacts.every(c => c.source === 'measured-motion-v160' && !Object.hasOwn(c, 'threat')));
  assert.equal(model.canonical1to1, false); e.stop();
});

test('native vent concealment cannot hide a living moving contact or turn a stale/dead transit into one', () => {
  const { e, enemy } = production();
  const network = e.initializeMissionVentRuntimeV62({ templateId: 'ship-interior-vertical' });
  const entrance = network.entrances[0], exit = network.exits[0], position = entrance.worldPosition;
  Object.assign(enemy, { x: position.x - enemy.w / 2, y: position.y - enemy.h, health: enemy.maxHealth });
  Object.assign(e.player, { x: position.x + 350, y: position.y - e.player.h, grounded: true, vx: 0, vy: 0 });
  e.platforms = [{ id: 'vent-observer-fixture-floor', x: -200, y: position.y, w: 6800, h: 200, floor: true }];
  assert.ok(e.beginMissionVentTraversalV62(enemy, { entranceId: entrance.id, exitId: exit.id, actorKind: 'enemy' }));
  assert.equal(enemy.alive, false); assert.equal(enemy.dormant, true);
  // The authored vent traversal itself advances the projection. This bounded
  // unit fixture leaves automatic world scheduling off, as in production().
  const tickVent = seconds => { for (let left = seconds; left > 1e-8; left -= .025) {
    const dt = Math.min(.025, left); e.updateMissionVentAiActorV62(enemy, dt); e.update(dt);
  } };
  tickVent(.2); assert.ok(e.motionTrackerStateV160.observations.get(enemy)?.moving);
  assert.equal(e.activateTracker(), true); tickVent(.8);
  let model = e.motionTrackerSnapshotV160(); assert.ok(model.contacts.some(c => c.id === enemy.id && c.concealed));
  assert.equal(enemy.alive, false, 'The detector does not reveal or respawn the concealed actor.');
  e.missionVentActorsV62.delete(enemy.id); e.update(.025);
  model = e.motionTrackerSnapshotV160(); assert.ok(!model.contacts.some(c => c.id === enemy.id));
  e.stop();
});

test('production pause refuses Q and freezes scan, contacts, resource and ping clocks', () => {
  const { e, audio } = production(); advance(e, .3); e.activateTracker(); advance(e, .8); e.togglePause();
  const before = structuredClone(e.motionTrackerSnapshotV160()), resource = { ...e.tracker }, pings = audio.pings;
  assert.equal(e.activateTracker(), false); advance(e, 2);
  assert.deepEqual(e.motionTrackerSnapshotV160(), before); assert.deepEqual(e.tracker, resource); assert.equal(audio.pings, pings); e.stop();
});

test('production Q cannot replace an airborne, climbing, injured, firing, melee or reload pose or spend its resource', () => {
  const { e } = production(); const actor = e.player;
  for (const [key, value] of [['grounded', false], ['climbing', true], ['reloading', true],
    ['fireClock', .4], ['meleeClock', .4], ['toolUseClock', .4], ['v52HurtClock', .4], ['interactionClock', .4]]) {
    const old = actor[key], before = { energy: e.tracker.energy, pulses: e.tracker.pulses, serial: e.motionTrackerStateV160.activationSerial };
    actor[key] = value; assert.equal(e.activateTracker(actor), false);
    assert.deepEqual({ energy: e.tracker.energy, pulses: e.tracker.pulses, serial: e.motionTrackerStateV160.activationSerial }, before);
    actor[key] = old;
  }
  e.stop();
});

test('production snapshots do not mutate measured frames; a restored mission requires a fresh pulse', () => {
  const { e } = production(); advance(e, .3); e.activateTracker(); advance(e, .8);
  const before = structuredClone(e.motionTrackerSnapshotV160());
  for (let i = 0; i < 10; i++) assert.deepEqual(e.getSnapshot().motionTrackerV160, before);
  const resume = e.captureResumeState(), energy = e.tracker.energy, pulses = e.tracker.pulses;
  assert.equal(e.applyResumeState(resume).applied, true);
  assert.equal(e.tracker.energy, energy); assert.equal(e.tracker.pulses, pulses);
  assert.equal(e.motionTrackerSnapshotV160().active, false); assert.equal(e.tracker.contacts.length, 0); e.stop();
});

test('production has no recurring device audio before Q, and muted local audio preserves logical scan timing', () => {
  const { e, audio } = production(); advance(e, 1); assert.equal(audio.pings, 0);
  e.activateTracker(); audio.enabled = false; const pings = audio.pings; advance(e, 1.2);
  assert.equal(audio.pings, pings); assert.ok(e.motionTrackerSnapshotV160().pingCount > 0);
  e.stop(); const stopped = e.motionTrackerSnapshotV160(); assert.equal(stopped.active, false);
});

function hub() {
  const h = host(), save = createDefaultSave(); save.clock.hour = 5;
  const Hub = withHubMotionTrackerV160(withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(withHubNpcLifeV136(NativeHub)))), e = new Hub(h.canvas);
  e.start({ deck: 1, roomId: 'science-lab', positionX: 4500, positionY: 532 },
    { routineContextV62: { save, crew: save.crew, clock: save.clock } });
  return { ...h, e };
}

// Execute the shipped callback against the actual hub and AudioDirector. Only
// the browser's AudioContext backend is controlled; no copied input handler.
function keyboardTracker({ state = 'suspended', existing = false, enabled = true, supported = true, volumes = {} } = {}) {
  const { e } = hub(), cues = []; let finishResume, failResume, resumes = 0;
  class Context {
    state = state; destination = {};
    createGain() { return { gain: { value: 1 }, connect() {} }; }
    createBufferSource() {
      const context = this;
      return { connect() {}, disconnect() {}, stop() {}, start() { cues.push(context.state); } };
    }
    resume() { resumes++; return new Promise((resolve, reject) => {
      finishResume = () => { this.state = 'running'; resolve(); }; failResume = () => reject(new Error('resume denied'));
    }); }
  }
  const audio = new AudioDirector({ AudioContextCtor: supported ? Context : null, AudioCtor: null, fetchImpl: null });
  audio.manifestStatus = 'ready'; audio.effectBuffers.set('tracker', { length: 32, numberOfChannels: 1 }); audio.enabled = enabled;
  audio.setVolumes(volumes);
  if (existing) { audio.context = new Context(); audio.master = audio.context.createGain(); }
  e.audio = audio;
  const owner = {}, scope = { activeView: 'hub', creatorOwnerV84: null, hubOwnerV84: owner,
    standaloneContext: null, hubEngine: e, audio, ownsTimelineV84: candidate => candidate === owner };
  const buttons = Object.fromEntries(['depth','left','up'].map(control => [control,
    Object.assign(new EventTarget(),{dataset:{hubControl:control},disabled:false,hidden:false,setPointerCapture(){}})]));
  const controls=[],lifts=[];let pendingTouch;
  const nativeControl=e.setControl.bind(e),nativeLift=e.useLift.bind(e);
  e.setControl=(control,active)=>{controls.push([control,active]);return nativeControl(control,active);};
  e.useLift=direction=>{lifts.push(direction);return nativeLift(direction);};
  scope.all=selector=>{assert.equal(selector,'[data-hub-control]');return Object.values(buttons);};
  scope.hubControlBindingsV133=[];
  scope.bindHubControlV133=(button,options)=>bindHubControlV133(button,{...options,
    activate:control=>{pendingTouch=options.activate(control);return pendingTouch;}});
  let listener;
  scope.globalThis = { addEventListener(type, callback) { assert.equal(type, 'keydown'); listener = callback; } };
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8'), condition = source.indexOf("event.code !== 'KeyQ'");
  const start = source.lastIndexOf("globalThis.addEventListener('keydown',", condition);
  const end = source.indexOf("\n  byId('mission-vehicle')", start);
  const setup=source.indexOf('function setupRuntimeControls() {')+'function setupRuntimeControls() {'.length;
  const controlsEnd=source.indexOf("\n  all('[data-mission-key]')",setup);
  assert.ok(condition >= 0 && start >= 0 && end > start && controlsEnd>setup);
  runInNewContext(source.slice(setup,controlsEnd)+'\n'+source.slice(start,end),scope);
  const event = overrides => ({ code: 'KeyQ', target: { closest: () => null }, defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; }, ...overrides });
  return { e, audio, scope, cues, event, buttons, controls, lifts, press: overrides => listener(event(overrides)),
    touch(type='pointerdown',fields={},control='depth') {
      const event=new Event(type,{cancelable:true});Object.assign(event,{pointerId:1,button:0,...fields});
      buttons[control].dispatchEvent(event);return pendingTouch;
    },
    finish: () => finishResume(), reject: () => failResume(), get resumes() { return resumes; },
    close() {scope.hubControlBindingsV133.forEach(binding=>binding.destroy());e.stop(false);audio.dispose();} };
}

test('the actual hub Q callback unlocks native audio before the immediate first consultation cue', async () => {
  for (const existing of [false,true]) {
    const f=keyboardTracker({state:'running',existing});
    const pending=f.press();
    assert.equal(f.e.motionTrackerSnapshotV160().active,true,'Already available audio must not delay the input.');
    assert.deepEqual(f.cues,['running']);assert.equal(f.resumes,0);
    await pending;assert.deepEqual(f.cues,['running']);f.close();
  }
});

test('native suspended audio finishes resuming before Q emits one cue; muted, unavailable and denied audio preserve gameplay', async () => {
  for (const existing of [false,true]) {
    const f=keyboardTracker({existing}),pending=f.press();
    assert.equal(f.resumes,1);assert.equal(f.e.motionTrackerSnapshotV160().active,false);assert.deepEqual(f.cues,[]);
    f.finish();await pending;
    assert.equal(f.e.motionTrackerSnapshotV160().active,true);assert.deepEqual(f.cues,['running']);
    const serial=f.e.motionTrackerStateV160.activationSerial;await f.press();
    assert.equal(f.e.motionTrackerStateV160.activationSerial,serial);assert.deepEqual(f.cues,['running']);f.close();
  }
  for (const options of [{enabled:false},{supported:false},{volumes:{master:0}},{volumes:{effects:0}}]) {
    const f=keyboardTracker(options),pending=f.press();
    assert.equal(f.e.motionTrackerSnapshotV160().active,true);assert.equal(f.resumes,options.volumes?1:0);
    if(options.volumes)f.finish();await pending;
    assert.deepEqual(f.cues,[]);f.close();
  }
  const f=keyboardTracker(),pending=f.press();f.reject();await pending;
  assert.equal(f.e.motionTrackerSnapshotV160().active,true);assert.deepEqual(f.cues,[]);f.close();
  const muted=keyboardTracker(),waiting=muted.press();muted.audio.enabled=false;muted.finish();await waiting;
  assert.equal(muted.e.motionTrackerSnapshotV160().active,true);assert.deepEqual(muted.cues,[]);muted.close();
});

test('pending hub Q cannot activate across pause, resume, reload, owner, scene or chart changes', async () => {
  for (const change of ['pause','pause-resume','reload','owner','view','creator','chart','device-state']) {
    const f=keyboardTracker(),pending=f.press();
    if (change==='pause') f.e.pause();
    if (change==='pause-resume') {f.e.pause();f.e.resume();}
    if (change==='reload') {f.e.stop(false);f.e.start({deck:1,roomId:'science-lab',positionX:4500,positionY:532});}
    if (change==='owner') {f.scope.hubOwnerV84={};f.scope.ownsTimelineV84=()=>true;}
    if (change==='view') f.scope.activeView='command';
    if (change==='creator') f.scope.creatorOwnerV84={};
    if (change==='chart') f.e.motionTrackerStateV160.context+=':different-chart';
    if (change==='device-state') f.e.motionTrackerStateV160=createMotionTrackerStateV160();
    f.finish();await pending;
    assert.equal(f.e.motionTrackerSnapshotV160().active,false,change);assert.deepEqual(f.cues,[],change);f.close();
  }
  const f=keyboardTracker(),pending=f.press();assert.equal(f.e.activateTracker(),true);advance(f.e,2.2);
  const serial=f.e.motionTrackerStateV160.activationSerial;f.finish();await pending;
  assert.equal(f.e.motionTrackerStateV160.activationSerial,serial,'A later tactile pulse supersedes the waiting keyboard request.');
  assert.deepEqual(f.cues,[]);f.close();
});

test('ignored hub keyboard input cannot unlock sound or start a detector consultation', async () => {
  const f=keyboardTracker();
  for (const overrides of [{code:'KeyE'},{repeat:true},{defaultPrevented:true},{ctrlKey:true},{altKey:true},
    {metaKey:true},{isComposing:true},{target:{closest:()=>({tagName:'INPUT'})}}]) await f.press(overrides);
  f.e.running=false;await f.press();f.e.running=true;
  f.scope.activeView='command';await f.press();f.scope.activeView='hub';
  f.e.isVentActiveV62=()=>true;await f.press();
  assert.equal(f.resumes,0);assert.equal(f.audio.context,null);assert.equal(f.e.motionTrackerSnapshotV160().active,false);
  assert.deepEqual(f.cues,[]);f.close();
});

test('the native tactile binding waits for audio once and preserves two-finger release ownership', async () => {
  const f=keyboardTracker();f.buttons.depth.disabled=true;f.touch();
  assert.equal(f.resumes,0);f.buttons.depth.disabled=false;
  const pending=f.touch();f.touch('pointerdown',{pointerId:2});
  assert.equal(f.resumes,1);assert.equal(f.e.motionTrackerSnapshotV160().active,false);assert.deepEqual(f.cues,[]);
  f.touch('pointerup');assert.deepEqual(f.controls,[]);
  f.touch('pointercancel',{pointerId:2});assert.deepEqual(f.controls,[['depth',false]]);
  f.finish();await pending;
  assert.equal(f.e.motionTrackerSnapshotV160().active,true);assert.deepEqual(f.cues,['running']);f.close();
});

test('focused and assistive detector-button presses share one resumed cue and immediate silent fallbacks', async () => {
  for (const code of ['Enter','Space','assistive-click']) {
    const f=keyboardTracker(),pending=code==='assistive-click'?f.touch('click',{detail:0}):f.touch('keydown',{code,repeat:false});
    if (code!=='assistive-click') {
      f.touch('keydown',{code,repeat:true});f.touch('click',{detail:0});f.touch('keyup',{code});
    }
    assert.equal(f.resumes,1);assert.deepEqual(f.controls,[['depth',false]]);assert.deepEqual(f.cues,[]);
    f.finish();await pending;
    assert.equal(f.e.motionTrackerSnapshotV160().active,true);assert.deepEqual(f.cues,['running']);f.close();
  }
  for (const options of [{state:'running'},{enabled:false},{supported:false},{volumes:{master:0}},{volumes:{effects:0}}]) {
    const f=keyboardTracker(options),pending=f.touch();
    assert.equal(f.e.motionTrackerSnapshotV160().active,true);assert.equal(f.resumes,options.volumes?1:0);
    if(options.volumes)f.finish();
    await pending;assert.deepEqual(f.cues,options.state==='running'?['running']:[]);
    f.touch('pointerup');assert.deepEqual(f.controls,[['depth',false]]);f.close();
  }
});

test('a suspended tactile detector cannot outlive pause, reload, owner or vent changes', async () => {
  for (const change of ['pause-resume','reload','owner','view','chart','vent']) {
    const f=keyboardTracker(),pending=f.touch();f.touch('pointerup');
    if (change==='pause-resume') {f.e.pause();f.e.resume();}
    if (change==='reload') {f.e.stop(false);f.e.start({deck:1,roomId:'science-lab',positionX:4500,positionY:532});}
    if (change==='owner') {f.scope.hubOwnerV84={};f.scope.ownsTimelineV84=()=>true;}
    if (change==='view') f.scope.activeView='command';
    if (change==='chart') f.e.motionTrackerStateV160.context+=':different-chart';
    if (change==='vent') f.e.isVentActiveV62=()=>true;
    f.finish();await pending;
    assert.equal(f.e.motionTrackerSnapshotV160().active,false,change);assert.deepEqual(f.cues,[],change);f.close();
  }
});

test('movement, lift and vent-depth tactile controls remain immediate while audio resumes', async () => {
  for (const control of ['left','up','depth']) {
    const f=keyboardTracker();if(control==='depth')f.e.isVentActiveV62=()=>true;
    f.touch('pointerdown',{},control);
    assert.equal(f.resumes,1);assert.deepEqual(f.controls,[[control,true]]);
    assert.deepEqual(f.lifts,control==='up'?[-1]:[]);assert.equal(f.e.motionTrackerSnapshotV160().active,false);
    f.touch('pointerup',{},control);assert.deepEqual(f.controls,[[control,true],[control,false]]);
    f.finish();await Promise.resolve();assert.deepEqual(f.cues,[]);f.close();
  }
});

test('native hub Q observes BISHOP physically walking, holds its actual tool, and excludes stationary duties', () => {
  const { e } = hub(); e.setNpcRoutineContextV62({ clock: { day: 1, hour: 9 } }, { persist: false });
  advance(e, .5); const actor = e.npcAnnexActorV159; assert.ok(actor?.vx < 0, JSON.stringify({actor: actor && {x: actor.x, vx: actor.vx, roomId: actor.roomId}, route: e.getSnapshot().npcAnnexCirculationV159}));
  assert.equal(e.activateTracker(), true); assert.equal(e.player.toolId, 'motion-tracker'); assert.ok(e.player.toolUseClock > 0);
  assert.equal(e.fire(), false); advance(e, 1);
  const model = e.getSnapshot().motionTrackerV160;
  assert.ok(model.contacts.some(c => c.id === actor.id));
  assert.equal(e.player.toolUseClock, 0); assert.equal(model.energy, null);
  e.stop(false); assert.equal(e.motionTrackerSnapshotV160().active, false);
});

test('hub rejects Q while hurt, climbing, paused, in a conduit or while another tool owns its hands', () => {
  const { e } = hub(); const initial = e.getSnapshot().motionTrackerV160;
  for (const [owner, key, value] of [[e.player, 'climbing', true], [e.player, 'grounded', false], [e.player, 'shockClock', .5], [e.player, 'toolUseClock', .5],
    [e.player, 'ventTransit', { phase: 'moving' }], [e, 'ventActorV62', {}], [e, 'running', false]]) {
    const old = owner[key]; owner[key] = value;
    assert.equal(canUseHubMotionTrackerV160(e), false); assert.equal(e.activateTracker(), false);
    owner[key] = old;
  }
  assert.deepEqual(e.getSnapshot().motionTrackerV160, initial); e.stop(false);
});

test('hub pause freezes the scan and a new deck/annex chart cannot retain its previous positions', () => {
  const { e } = hub(); e.setNpcRoutineContextV62({ clock: { day: 1, hour: 9 } }, { persist: false });
  advance(e, .5); e.activateTracker(); advance(e, .9); const before = e.motionTrackerSnapshotV160(); e.pause();
  advance(e, 1); assert.equal(e.motionTrackerStateV160.time, before.time); assert.equal(e.activateTracker(), false);
  e.running = true; e.state.deck = 0;
  assert.equal(e.motionTrackerSnapshotV160().active, false); advance(e, .025);
  assert.equal(e.motionTrackerStateV160.context.startsWith('hub:0:'), true); e.stop(false);
});

test('two Forge ship rooms on the same deck do not share one sensor chart', () => {
  class FixtureHub {
    start() { this.running = true; this.state = { deck: 0 }; this.player = { x: 0, y: 0, w: 44, h: 92, health: 100, alive: true, grounded: true }; }
    update() {} getSnapshot() { return {}; } drawHud() {} fire() { return true; } stop() { this.running = false; }
  }
  const Hub = withHubMotionTrackerV160(FixtureHub), e = new Hub(); e.start();
  e.forgeSessionV141 = { currentRoomId: 'source-room' }; e.update(.025); assert.equal(e.activateTracker(), true);
  assert.equal(e.motionTrackerSnapshotV160().active, true);
  e.forgeSessionV141.currentRoomId = 'destination-room';
  assert.equal(e.motionTrackerSnapshotV160().active, false); e.update(.025);
  assert.equal(e.motionTrackerSnapshotV160().contacts.length, 0); assert.equal(e.motionTrackerStateV160.activationSerial, 0);
});

test('responsive tracker stays inside the logical canvas and the readout never prints actor identity or faction', () => {
  for (const width of [390, 720, 1280, 1600]) {
    const layout = motionTrackerLayoutV160({ viewportWidth: width, vehicle: true });
    assert.ok(layout.x >= 0 && layout.x + layout.width <= 1280); assert.ok(layout.y + layout.height <= 720);
  }
  const { state, entities: [entity] } = movingFixture([{ id: 'secret-queen', isBoss: true, name: 'Alien Queen' }]);
  const model = step(state, [body(entity, 195)], .4), words = []; let saves = 0;
  const ctx = new Proxy({ save() { saves++; }, restore() { saves--; }, fillText(text) { words.push(text); } }, { get: (o, k) => k in o ? o[k] : () => {} });
  const previous = structuredClone(model); assert.equal(drawMotionTrackerDisplayV160(ctx, model), true);
  assert.equal(saves, 0); assert.deepEqual(model, previous);
  assert.ok(words.includes('M314 · DOTATION')); assert.ok(words.includes('PORTÉE RELATIVE'));
  assert.ok(!words.some(s => /queen|alien|boss|hostile|ami|ennemi|secret/i.test(s)));
});

test('compact layout keeps the radar above the grounded player at actual mobile canvas sizes', () => {
  const actor = { x: 632, y: 532, w: 44, h: 92 }, actorScreenBounds = motionTrackerActorBoundsV160(actor);
  for (const viewportWidth of [320, 390, 480, 720]) {
    const layout = motionTrackerLayoutV160({ viewportWidth, actorScreenBounds });
    assert.equal(layout.compact, true);
    assert.ok(Math.abs(layout.width * viewportWidth / 1280 - 176) < 1e-8);
    assert.ok(Math.abs(layout.height * viewportWidth / 1280 - 82) < 1e-8);
    assert.ok(layout.x >= 0 && layout.x + layout.width <= 1280);
    assert.ok(layout.y >= 0 && layout.y + layout.height <= actorScreenBounds.y - 6 * layout.scale);
  }
});

test('compact layout moves to the clear corner when an elevated player cannot fit underneath it', () => {
  for (const viewportWidth of [320, 390, 720]) {
    const actorScreenBounds = { x: 1090, y: 150, width: 130, height: 150 };
    const layout = motionTrackerLayoutV160({ viewportWidth, actorScreenBounds });
    assert.equal(layout.x, 8 * layout.scale);
    assert.ok(layout.x + layout.width < actorScreenBounds.x);
    assert.ok(layout.y >= 0 && layout.y + layout.height <= 720);
  }
});

test('visible body bounds follow the current foot and camera without mutating actor appearance', () => {
  const actor = { x: 650, y: 550, w: 44, h: 80,
    playerAppearanceVisualV126: { humanVisualV133: { poseHeight: 120, pivot: { x: -900, y: -900 } } } };
  const before = structuredClone(actor), camera = { x: 100, y: 120 };
  assert.deepEqual(motionTrackerActorBoundsV160(actor, camera), { x: 514, y: 380, width: 116, height: 140 });
  assert.deepEqual(actor, before); assert.equal(motionTrackerActorBoundsV160(null), null);
});

test('compact readout preserves CSS font sizes, front dots and anonymous coarse rear sectors', () => {
  for (const viewportWidth of [320, 390, 720]) {
    const texts = [], circles = []; let scale = 1, saves = 0;
    const ctx = new Proxy({
      save() { saves++; }, restore() { saves--; }, scale(x) { scale *= x; },
      fillText(text) { texts.push({ text, cssSize: Number(this.font.match(/([\d.]+)px/)[1]) * scale * viewportWidth / 1280 }); },
      arc(x, y, radius) { circles.push({ x, y, radius }); }
    }, { get: (o, k) => k in o ? o[k] : () => {} });
    const model = { active: true, range: 900, sweep: .4, heading: -1, nearestDistance: 180, currentMovement: true,
      contacts: [{ sector: 'rear', distance: 180, alpha: 1, currentMotion: true },
        { sector: 'front', distance: 300, bearing: .2, alpha: 1, currentMotion: true }] };
    const before = structuredClone(model);
    assert.equal(drawMotionTrackerDisplayV160(ctx, model, { viewportWidth }), true);
    assert.ok(texts.every(item => item.cssSize >= 10 - 1e-8));
    assert.ok(Math.abs(texts.find(item => item.text === '~180 u').cssSize - 14) < 1e-8);
    assert.ok(Math.abs(texts.find(item => item.text === 'ARRIÈRE').cssSize - 11) < 1e-8);
    assert.ok(texts.some(item => item.text === 'AVANT ←'));
    assert.ok(texts.some(item => item.text === '←'));
    assert.ok(texts.some(item => item.text === 'PORTÉE RELATIVE'));
    assert.ok(!texts.some(item => /COUPE|2D|ennemi|hostile|allié/i.test(item.text)));
    assert.ok(circles.some(circle => circle.radius === 2.4));
    assert.equal(saves, 0); assert.deepEqual(model, before);
  }
});

test('native hub draw uses the active chart camera to keep an elevated player clear', () => {
  class FixtureHub {
    start() {
      this.running = true; this.state = { deck: 0 }; this.camera = { x: 400, y: 400 };
      this.annexCameraV71 = { x: 400 }; this.canvas = { getBoundingClientRect: () => ({ width: 390 }) };
      this.player = { x: 1480, y: 500, w: 44, h: 92, health: 100, alive: true, grounded: true };
    }
    currentAnnexV71() { return this.annex || null; }
    update() {} drawHud() {} drawAnnexHudV71() {} getSnapshot() { return {}; } fire() {} stop() {}
  }
  const Hub = withHubMotionTrackerV160(FixtureHub), hub = new Hub(); hub.start();
  assert.equal(hub.activateTracker(), true);
  const translations = [], ctx = new Proxy({ translate(x, y) { translations.push({ x, y }); } },
    { get: (o, k) => k in o ? o[k] : () => {} });
  hub.drawHud(ctx);
  assert.equal(translations.at(-1).x, 8 * 1280 / 390);
  hub.annex = { id: 'medical-annex' }; hub.update(.025); hub.hubMotionTrackerCooldownV160 = 0;
  hub.player.toolUseClock = 0; assert.equal(hub.activateTracker(), true); hub.drawAnnexHudV71(ctx);
  const expected = motionTrackerLayoutV160({ viewportWidth: 390,
    actorScreenBounds: motionTrackerActorBoundsV160(hub.player, hub.annexCameraV71) });
  assert.deepEqual(translations.at(-1), { x: expected.x, y: expected.y });
  assert.ok(expected.x > 600);
});
