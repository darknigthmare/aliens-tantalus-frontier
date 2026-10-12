import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine } from '../src/game-production-runtime.js';
import { BioforgeRuntimeV80 } from '../src/bioforge-runtime-v80.js';
import { createBioforgeV80 } from '../src/bioforge-session-v80.js';
import { HubGame, HUB_DECKS } from '../src/hub-opening-v88.js';
import { createPlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { DROPSHIP_HANGAR_ART_V55, ELECTRICAL_HAZARD_ART_V55 } from '../src/hub-art-runtime-v55.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, EQUIPMENT, CREW, NEURO_XENO_PROFILES } from '../src/content.js';
import { attachCrewDeploymentV85 } from '../src/crew-runtime-v85.js';
import { resolveCombatAimV83 } from '../src/combat-aim-v83.js';
import { getCostumeV119 } from '../src/franchise-costumes-v119.js';
import { normalizePlayerAppearanceV126, PLAYER_APPEARANCE_SLOTS_V126 } from '../src/player-appearance-v126.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125 } from '../src/player-body-rig-v125.js';
import { PLAYER_ACTION_PROP_ASSETS_V127 } from '../src/player-action-rig-v127.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128 } from '../src/player-transit-rig-v128.js';

// Actual production, Bioforge and hub runtimes own all gameplay. The observable
// host substitutes browser APIs only; dimensions come from shipped PNG headers.
// Geometry/draw assertions do not claim raster quality; the UI browser smoke
// separately inspects the authored pieces in real frames with no state injection.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const imageDimensions = new Map();
const RIGHT = resolveCombatAimV83({ x: 1, y: 0, facing: 1 });
const near = (actual, expected, label, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) <= tolerance,
  label + ': ' + actual + ' differs from ' + expected + '.');

function dimensions(source) {
  if (imageDimensions.has(source)) return imageDimensions.get(source);
  let descriptor;
  try {
    const path = new URL(source, 'http://qa.invalid').pathname;
    descriptor = openSync(resolve(repository, `.${path}`), 'r');
    const header = Buffer.alloc(24);
    readSync(descriptor, header, 0, header.length, 0);
    assert.equal(header.subarray(1, 4).toString(), 'PNG', `Unsupported fixture image ${path}.`);
    const value = { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
    imageDimensions.set(source, value);
    return value;
  } catch {
    return null;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function canvasContext() {
  const draws = [], operations = [], stack = [];
  let matrix = [1, 0, 0, 1, 0, 0];
  const multiply = ([a, b, c, d, e, f]) => {
    const [aa, bb, cc, dd, ee, ff] = matrix;
    matrix = [aa * a + cc * b, bb * a + dd * b, aa * c + cc * d, bb * c + dd * d,
      aa * e + cc * f + ee, bb * e + dd * f + ff];
  };
  const gradient = { addColorStop() {} };
  const context = {
    globalAlpha: 1, globalCompositeOperation: 'source-over',
    save() { stack.push({ matrix: [...matrix], alpha: this.globalAlpha, composite: this.globalCompositeOperation }); },
    restore() { const state = stack.pop(); assert.ok(state, 'Balanced canvas save/restore.');
      matrix = state.matrix; this.globalAlpha = state.alpha; this.globalCompositeOperation = state.composite; },
    translate(x, y) { multiply([1, 0, 0, 1, x, y]); }, scale(x, y) { multiply([x, 0, 0, y, 0, 0]); },
    rotate(angle) { const c = Math.cos(angle), s = Math.sin(angle); multiply([c, s, -s, c, 0, 0]); },
    transform(...value) { multiply(value); },
    setTransform(...value) { matrix = value.length === 1 ? [value[0].a, value[0].b, value[0].c, value[0].d, value[0].e, value[0].f] : value; },
    resetTransform() { matrix = [1, 0, 0, 1, 0, 0]; },
    getTransform() { return Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f'].map((key, index) => [key, matrix[index]])); },
    drawImage(image, ...args) { draws.push({ image, source: image?.src, args, matrix: [...matrix], alpha: this.globalAlpha,
      composite: this.globalCompositeOperation }); },
    createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    measureText: text => ({ width: String(text).length * 7 }),
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
  };
  const ctx = new Proxy(context, { get(target, property) {
    if (property in target) return target[property];
    return (...args) => operations.push({ method: property, args, matrix: [...matrix] });
  } });
  return { ctx, draws, operations, reset() { draws.length = 0; operations.length = 0; },
    assertBalanced() { assert.equal(stack.length, 0, 'A draw must restore the caller canvas state.'); } };
}

function browserHost({ holdImages = false } = {}) {
  const windowEvents = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = windowEvents[name].bind(windowEvents);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  const images = [], requests = [];
  let deferred = holdImages;
  globalThis.Image = class extends EventTarget {
    complete = false; naturalWidth = 0; naturalHeight = 0; width = 0; height = 0;
    constructor() { super(); images.push(this); }
    set src(value) {
      this._src = String(value); requests.push(this._src);
      const held = typeof deferred === 'function' ? deferred(this._src) : deferred;
      if (!held) this.finish();
    }
    get src() { return this._src; }
    finish(failed = false) {
      const size = !failed && dimensions(this.src);
      this.complete = true;
      this.naturalWidth = this.width = size?.width || 0;
      this.naturalHeight = this.height = size?.height || 0;
      queueMicrotask(() => {
        const type = size ? 'load' : 'error', event = new Event(type);
        this.dispatchEvent(event); this[`on${type}`]?.(event);
      });
    }
    async decode() { if (!this.complete || !this.naturalWidth) throw new Error(`Image not ready: ${this.src}`); }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const drawing = canvasContext();
  const capturedPointers = new Set();
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => drawing.ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    setPointerCapture(id) { capturedPointers.add(id); }, hasPointerCapture(id) { return capturedPointers.has(id); },
    releasePointerCapture(id) { capturedPointers.delete(id); } });
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false, isComposing: false });
    windowEvents.dispatchEvent(event);
  };
  return { canvas, drawing, key, images, requests,
    releaseImages() { deferred = false; for (const image of images) if (!image.complete) image.finish(); },
    failImages() { for (const image of images) if (!image.complete) image.finish(true); },
    async flush() { for (let count = 0; count < 4; count++) await Promise.resolve(); } };
}

function fixture(options = {}, hostOptions = {}) {
  const host = browserHost(hostOptions);
  const events = [], engine = new GameEngine(host.canvas, { onEvent: event => events.push(event) });
  const start = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1),
    equipment: [], crew: [], seed: 426, ...options };
  engine.start(start);
  Object.assign(engine, { platforms: [{ id: 'qa-floor', x: -200, y: 930, w: 6800, h: 200, floor: true }],
    ladders: [], lifts: [], walls: [], covers: [], doors: [], hazards: [], enemies: [], missionLevelRuntime: null });
  Object.assign(engine.player, { x: 160, y: 838, vx: 0, vy: 0, grounded: true, operatorId: 'echo-9' });
  Object.assign(engine.coop, { x: 110, y: 838, vx: 0, vy: 0, grounded: true, operatorId: 'bravo-2' });
  return { ...host, engine, actor: engine.player, start, events };
}

function advance(engine, seconds, rate = 120) {
  let remaining = seconds;
  while (remaining > 1e-10) { const delta = Math.min(1 / rate, remaining); engine.update(delta); remaining -= delta; }
}

const standard = () => normalizePlayerAppearanceV126();
const alternate = () => normalizePlayerAppearanceV126({ schema: 126, slots: {
  helmet: 'helmet-patrol-v126', mask: 'mask-rebreather-v126', torso: 'torso-utility-v126',
  arms: 'arms-utility-v126', legs: 'legs-utility-v126', back: 'back-radio-v126'
} });
const bare = () => normalizePlayerAppearanceV126({ schema: 126,
  slots: { ...alternate().slots, helmet: null, mask: null, back: null } });
const modularPaths = new Set(PLAYER_MODULAR_RIG_ASSETS_V126.map(asset => asset.path));
const oldBodyPaths = new Set(PLAYER_BODY_RIG_ASSETS_V125.filter(asset => asset.kind.startsWith('body-')).map(asset => asset.path));
const point = value => value ? { x: value.x, y: value.y } : null;

function operatorSnapshot(subject, actor = subject.actor) {
  const role = actor === subject.engine.player ? 'player' : 'coop';
  const snapshot = subject.engine.playerAppearanceSnapshotV126();
  assert.equal(snapshot.schema, 126);
  const operator = snapshot.operators.find(entry => entry.role === role);
  assert.ok(operator, `${role} must have its own appearance status.`);
  assert.deepEqual(operator.selected, operator.visual.selected);
  return operator;
}

function drawActor(subject, actor = subject.actor) {
  subject.drawing.reset();
  if (subject.engine.bioforgeLevelV80) subject.engine.drawBioforgePlayerV80(subject.drawing.ctx);
  else subject.engine.drawActor(subject.drawing.ctx, actor);
  subject.drawing.assertBalanced();
  return operatorSnapshot(subject, actor).visual;
}

function assertComposed(subject, visual, expected, label = 'Appearance') {
  assert.deepEqual(visual.selected, expected, `${label}: the rendered selection is retained.`);
  assert.equal(visual.supported, true, `${label}: this ordinary human pose is admitted.`);
  assert.equal(visual.ready, true, `${label}: the actual registered images are ready.`);
  assert.equal(visual.drawn, true, `${label}: the modular composition was drawn.`);
  assert.ok(subject.drawing.draws.some(draw => modularPaths.has(draw.source)), `${label}: new authored pixels are submitted.`);
  for (const draw of subject.drawing.draws.filter(draw => oldBodyPaths.has(draw.source))) {
    // Marine legs retain a reviewed anatomical crop of V125 below the waist.
    // That exact crop is admitted; a second complete head/torso/body is not.
    const matchingLeg = visual.layers.find(layer => layer.slot === 'legs' && layer.itemId === 'legs-marine-v126'
      && PLAYER_BODY_RIG_ASSETS_V125.find(asset => asset.imageKey === layer.imageKey)?.path === draw.source
      && draw.args.length === 8 && [layer.sourceRect?.x, layer.sourceRect?.y, layer.sourceRect?.width,
        layer.sourceRect?.height].every((value, index) => value === draw.args[index]));
    assert.ok(matchingLeg, `${label}: a V125 image may supply only the declared Marine leg crop.`);
  }
  for (const slot of PLAYER_APPEARANCE_SLOTS_V126) {
    const itemId = expected.slots[slot.id];
    const layers = visual.layers.filter(layer => layer.slot === slot.id);
    if (itemId === null) assert.equal(layers.length, 0, `${label}: removed ${slot.id} has no rendered layer.`);
    else {
      assert.ok(layers.length > 0, `${label}: selected ${slot.id} has a rendered layer.`);
      assert.ok(layers.every(layer => layer.itemId === itemId), `${label}: ${slot.id} uses only its own selected item.`);
    }
  }
}

async function readyAppearance(subject, actor = subject.actor) {
  let visual;
  for (let attempt = 0; attempt < 4; attempt++) {
    subject.engine.preparePlayerWeaponAssetsV125();
    await subject.flush();
    visual = drawActor(subject, actor);
    if (visual.drawn) break;
  }
  assertComposed(subject, visual, normalizePlayerAppearanceV126(actor.appearanceV126));
  return visual;
}

async function readyPose(subject, actor = subject.actor, aim = RIGHT, options = {}) {
  let pose;
  for (let attempt = 0; attempt < 4; attempt++) {
    pose = subject.engine.resolvePlayerWeaponPoseV125(actor, aim, options);
    await subject.flush();
    if (pose) break;
  }
  assert.ok(pose, 'The production weapon/body pose is ready.');
  return pose;
}

function assertTransit(subject, visual, actor, kind) {
  assertComposed(subject, visual, normalizePlayerAppearanceV126(actor.appearanceV126), `V128 ${kind}`);
  assert.equal(visual.transit?.kind, kind);
  assert.equal(visual.transit.drawn, true);
  assert.equal(visual.transit.firing, false);
  assert.equal(visual.action, null);
  assert.equal(actor.heldWeaponVisualV125, null);
  const legs = visual.layers.filter(layer => layer.slot === 'legs');
  assert.equal(legs.length, 7, 'The pelvis, both thighs, shins and boots are independently rendered.');
  assert.ok(legs.every(layer => layer.imageKey === PLAYER_TRANSIT_RIG_ASSETS_V128[0].imageKey));
  assert.ok(subject.drawing.draws.some(draw => draw.source === PLAYER_TRANSIT_RIG_ASSETS_V128[0].path));
  return visual.transit;
}

for (const role of ['player', 'coop']) test(`${role} wears its seven leg pieces on a real ladder, holds its rungs and exits through real input`, async () => {
  const subject = fixture({ playerAppearanceV126: alternate(), coopAppearanceV126: bare() });
  const { engine } = subject; engine.setCoop(true);
  const actor = engine[role], up = role === 'player' ? 'KeyW' : 'KeyI', down = role === 'player' ? 'KeyS' : 'KeyK';
  const ladder = { id: `qa-${role}-ladder`, x: actor.x + actor.w / 2, top: 500, bottom: 930, w: 32 };
  engine.ladders = [ladder]; await readyAppearance(subject, actor);
  subject.key('keydown', up); advance(engine, .45); subject.key('keyup', up);
  assert.equal(actor.climbing, true); assert.ok(actor.y < 838);
  const climbing = assertTransit(subject, await readyAppearance(subject, actor), actor, 'climb');
  assert.equal(climbing.contacts.ladderId, ladder.id);
  const planted = [...Object.values(climbing.contacts.feet), ...Object.values(climbing.contacts.hands)].filter(contact => contact.planted);
  assert.ok(planted.length > 0, 'At least one reachable limb has a true ladder contact.');
  for (const contact of planted) near(contact.point.y, ladder.top + 11 + contact.rungIndex * 22, 'A planted limb meets an actual rung');

  advance(engine, .025); const holding = assertTransit(subject, drawActor(subject, actor), actor, 'climb');
  assert.equal(holding.phase, 'holding');
  const position = combatState(actor), state = structuredClone(actor.playerTransitStateV128);
  for (let read = 0; read < 4; read++) { drawActor(subject, actor); operatorSnapshot(subject, actor); }
  assert.deepEqual(combatState(actor), position); assert.deepEqual(actor.playerTransitStateV128, state);
  advance(engine, .4);
  const still = assertTransit(subject, drawActor(subject, actor), actor, 'climb');
  assert.deepEqual(still.contacts, holding.contacts, 'Time alone cannot slide a hand or boot along a ladder.');
  assert.deepEqual(still.legs, holding.legs);
  subject.key('keydown', down); advance(engine, .16);
  const descending = assertTransit(subject, drawActor(subject, actor), actor, 'climb');
  assert.equal(descending.phase, 'descending'); subject.key('keyup', down);
  subject.key('keydown', role === 'player' ? 'Space' : 'KeyU'); advance(engine, .03);
  subject.key('keyup', role === 'player' ? 'Space' : 'KeyU');
  assert.equal(actor.climbing, false); assert.equal(actor.grounded, false);
  advance(engine, 1.2);
  const normal = await readyAppearance(subject, actor);
  assert.equal(normal.transit, null); assert.equal(actor.playerTransitVisualV128, null);
});

test('a real airborne casualty gains its modular grounded pose only after collision, and pause cannot advance the fall gesture', async () => {
  const subject = fixture({ playerAppearanceV126: alternate() }), { engine, actor } = subject;
  engine.setCoop(true); await readyAppearance(subject);
  subject.key('keydown', 'Space'); advance(engine, .12); subject.key('keyup', 'Space');
  engine.damagePlayer(actor, 10000, { bypassCover: true, source: 'qa-v128-impact' });
  advance(engine, .04); assert.equal(actor.grounded, false);
  assert.equal(engine.resolvePlayerAppearanceTransitV128(actor).reason, 'no-ground-support');
  assert.equal(drawActor(subject).transit, null, 'An airborne casualty cannot claim a floor contact.');
  for (let tick = 0; !actor.grounded && tick < 200; tick++) engine.update(1 / 120);
  assert.equal(actor.y + actor.h, 930);
  const landing = assertTransit(subject, await readyAppearance(subject), actor, 'downed');
  assert.equal(landing.phase, 'settling'); assert.ok(landing.progress < 1);
  advance(engine, .12); engine.togglePause();
  const paused = drawActor(subject), state = structuredClone(actor.playerTransitStateV128), physical = combatState(actor);
  advance(engine, 2); for (let read = 0; read < 4; read++) drawActor(subject);
  assert.deepEqual(drawActor(subject).transit, paused.transit);
  assert.deepEqual(actor.playerTransitStateV128, state); assert.deepEqual(combatState(actor), physical);
  engine.togglePause(); advance(engine, .7);
  const settled = assertTransit(subject, drawActor(subject), actor, 'downed');
  assert.equal(settled.phase, 'settled'); assert.equal(settled.progress, 1);
  assert.equal(settled.contacts.floorY, actor.y + actor.h);
});

test('real rescue rises in the selected kit and an accepted response shot immediately returns to its authoritative weapon', async () => {
  for (const fireDuringRise of [false, true]) {
    const subject = fixture({ playerAppearanceV126: alternate() }), { engine, actor } = subject;
    engine.setCoop(true); await readyAppearance(subject);
    engine.damagePlayer(actor, 10000, { bypassCover: true, source: 'qa-v128-impact' }); advance(engine, .6);
    assertTransit(subject, await readyAppearance(subject), actor, 'downed');
    assert.equal(engine.interact(engine.coop), true); advance(engine, .1);
    const rising = assertTransit(subject, drawActor(subject), actor, 'revive');
    assert.equal(rising.phase, 'rising'); assert.ok(rising.progress > 0 && rising.progress < 1);
    const physical = combatState(actor), health = actor.health, ammo = actor.ammo, shots = actor.shots;
    for (let read = 0; read < 3; read++) drawActor(subject);
    assert.deepEqual(combatState(actor), physical, 'Drawing a rising operator cannot heal or move it.');
    if (fireDuringRise) {
      assert.equal(engine.fire(actor), true, 'A cosmetic rise cannot delay an otherwise legal response shot.');
      const visual = await readyAppearance(subject), pose = actor.heldWeaponVisualV125;
      assert.equal(visual.transit, null); assert.equal(actor.playerTransitVisualV128, null);
      assert.ok(pose, 'An accepted shot has its actual firearm in hand in the same simulation instant.');
      assert.equal(actor.ammo, ammo - 1); assert.equal(actor.shots, shots + 1);
      const light = engine.weaponEffectsV124.lights.at(-1);
      assert.ok(light); near(light.x, pose.muzzle.x, 'Response-shot flash X'); near(light.y, pose.muzzle.y, 'Response-shot flash Y');
    } else {
      advance(engine, .6);
      const visual = await readyAppearance(subject); assert.equal(visual.transit, null);
      assert.equal(actor.health, health); assert.equal(actor.ammo, ammo); assert.equal(actor.shots, shots);
    }
  }
});

test('resume initializes a grounded casualty already settled without replaying the old impact or losing its loadout', async () => {
  const subject = fixture({ playerAppearanceV126: alternate(), coopAppearanceV126: bare() });
  subject.engine.setCoop(true); await readyAppearance(subject);
  subject.engine.damagePlayer(subject.actor, 10000, { bypassCover: true, source: 'qa-v128-impact' }); advance(subject.engine, .12);
  const saved = subject.engine.captureResumeState();
  assert.equal(Object.hasOwn(saved.player, 'playerTransitStateV128'), false, 'Presentation clocks do not enter the mission checkpoint.');
  const restored = fixture({ ...subject.start, resumeState: saved });
  assert.equal(restored.engine.lastResumeResult.applied, true); assert.equal(restored.actor.downed, true);
  const initial = assertTransit(restored, await readyAppearance(restored), restored.actor, 'downed');
  assert.equal(initial.phase, 'settled'); assert.equal(initial.progress, 1); assert.equal(initial.state.observed, false);
  const snapshot = structuredClone(initial); drawActor(restored);
  assert.deepEqual(drawActor(restored).transit, snapshot);
  assert.deepEqual(restored.actor.appearanceV126, alternate());
});

test('a delayed segmented-leg atlas uses the complete fallback and cannot restore the old transit after exit or scene stop', async () => {
  const asset = PLAYER_TRANSIT_RIG_ASSETS_V128[0];
  for (const ending of ['exit', 'stop']) {
    const subject = fixture({ playerAppearanceV126: alternate() }, { holdImages: path => path === asset.path });
    const { engine, actor } = subject; await readyAppearance(subject);
    engine.ladders = [{ id: 'qa-delayed-ladder', x: actor.x + actor.w / 2, top: 500, bottom: 930, w: 32 }];
    subject.key('keydown', 'KeyW'); advance(engine, .4); subject.key('keyup', 'KeyW');
    const waiting = drawActor(subject); assert.equal(waiting.supported, true); assert.equal(waiting.ready, false);
    assert.equal(waiting.drawn, false); assert.equal(waiting.reason, 'transit-images-unavailable');
    assert.equal(waiting.layers.length, 0);
    assert.equal(subject.drawing.draws.some(draw => modularPaths.has(draw.source) || draw.source === asset.path), false,
      'A missing limb atlas cannot paint a partial modular body over the native fallback.');
    if (ending === 'exit') {
      subject.key('keydown', 'Space'); advance(engine, .03); subject.key('keyup', 'Space'); advance(engine, 1.2);
      assert.equal(actor.climbing, false);
    } else engine.stop();
    const requests = subject.requests.length;
    subject.releaseImages(); await subject.flush();
    if (ending === 'exit') {
      const normal = await readyAppearance(subject); assert.equal(normal.transit, null);
      assert.equal(actor.playerTransitVisualV128, null);
      assert.equal(subject.drawing.draws.some(draw => draw.source === asset.path), false);
    } else {
      engine.draw(); await subject.flush();
      assert.equal(subject.requests.length, requests);
      assert.equal(engine.playerAppearanceSnapshotV126().images.retained, 0);
      assert.equal(actor.playerTransitStateV128, undefined); assert.equal(actor.playerTransitVisualV128, null);
    }
  }
});

function combatState(actor) {
  return structuredClone(Object.fromEntries(['x', 'y', 'w', 'h', 'vx', 'vy', 'grounded', 'health', 'maxHealth',
    'armor', 'ammo', 'ammoReserve', 'magazineSize', 'weaponMode', 'shots', 'kills', 'reloading', 'tacticalReload',
    'fieldActionV124', 'fieldProtectionV124', 'fieldWeaponBoostShotsV124', 'userEquipmentV95'].map(key => [key, actor[key]])));
}

function geometry(pose) {
  return { feet: point(pose.bodyRig.pivot), shoulders: pose.bodyRig.shoulders, scale: pose.bodyRig.scale,
    bodyMatrix: pose.bodyRig.matrix, bodyHeight: pose.bodyRig.bodyHeight, arms: pose.bodyRig.armLengths,
    grip: pose.grip, support: pose.support, muzzle: pose.muzzle, ejection: pose.ejectionPort,
    reload: pose.reloadPort, matrix: pose.matrix, recoil: pose.recoil, reloadPhase: pose.reloadPhase,
    reloadProgress: pose.reloadProgress };
}

test('deployment creates independent J1 and J2 slots and a changed helmet leaves the other pieces intact', async () => {
  const primary = alternate(), secondary = standard();
  const subject = fixture({ playerAppearanceV126: primary, coopAppearanceV126: secondary });
  const { engine, actor } = subject; engine.setCoop(true);
  assert.deepEqual(actor.appearanceV126, primary); assert.deepEqual(engine.coop.appearanceV126, secondary);
  assert.notEqual(actor.appearanceV126.slots, primary.slots);
  assert.notEqual(engine.coop.appearanceV126.slots, secondary.slots);
  assert.notEqual(actor.appearanceV126.slots, engine.coop.appearanceV126.slots);
  await readyAppearance(subject); await readyAppearance(subject, engine.coop);

  const before = structuredClone(actor.appearanceV126);
  // This is a physical fixture, not a runtime equip command: the actual UI
  // deliberately locks both loadouts while an operation is active.
  actor.appearanceV126 = normalizePlayerAppearanceV126({ schema: 126, slots: { ...before.slots, helmet: null } });
  primary.slots.torso = 'torso-marine-v126'; // caller-owned input is not aliased
  await readyAppearance(subject);
  assert.equal(actor.appearanceV126.slots.helmet, null);
  for (const { id } of PLAYER_APPEARANCE_SLOTS_V126.filter(slot => slot.id !== 'helmet')) {
    assert.equal(actor.appearanceV126.slots[id], before.slots[id], `${id} remains independent of helmet removal.`);
  }
  assert.deepEqual(operatorSnapshot(subject, engine.coop).selected, secondary);
  const snapshot = engine.playerAppearanceSnapshotV126();
  snapshot.operators[0].selected.slots.arms = 'arms-marine-v126';
  assert.equal(actor.appearanceV126.slots.arms, before.slots.arms, 'Observing a snapshot does not expose mutable actor data.');
});

test('mission checkpoints restore both selections and legacy checkpoints preserve current start options', async () => {
  const subject = fixture({ playerAppearanceV126: alternate(), coopAppearanceV126: bare() });
  subject.engine.setCoop(true);
  const resume = subject.engine.captureResumeState();
  assert.deepEqual(resume.player.appearanceV126, alternate()); assert.deepEqual(resume.coop.appearanceV126, bare());
  const restored = fixture({ ...subject.start, playerAppearanceV126: standard(), coopAppearanceV126: standard(), resumeState: resume });
  assert.equal(restored.engine.lastResumeResult.applied, true);
  assert.equal(restored.engine.coopEnabled, true);
  assert.deepEqual(restored.actor.appearanceV126, alternate()); assert.deepEqual(restored.engine.coop.appearanceV126, bare());
  await readyAppearance(restored); await readyAppearance(restored, restored.engine.coop);
  resume.player.appearanceV126.slots.mask = null;
  assert.equal(restored.actor.appearanceV126.slots.mask, 'mask-rebreather-v126');

  const legacy = structuredClone(resume);
  delete legacy.player.appearanceV126; delete legacy.coop.appearanceV126;
  const old = fixture({ ...subject.start, resumeState: legacy });
  assert.equal(old.engine.lastResumeResult.applied, true);
  assert.deepEqual(old.actor.appearanceV126, alternate()); assert.deepEqual(old.engine.coop.appearanceV126, bare());
});

test('swapping cosmetic pieces during a real reload preserves resources, transaction progress and weapon geometry', async () => {
  const weapon = WEAPONS.find(item => item.id === 'weapon-004-vp70-combat-pistol');
  assert.ok(weapon);
  const subject = fixture({ weapon, playerAppearanceV126: alternate() });
  await readyAppearance(subject);
  assert.equal(subject.engine.fire(subject.actor), true); advance(subject.engine, .3);
  subject.key('keydown', 'KeyR'); subject.key('keyup', 'KeyR'); advance(subject.engine, .35);
  assert.equal(subject.actor.reloading, true);
  const before = combatState(subject.actor), pose = await readyPose(subject);
  assert.ok(pose.reloadProgress > 0 && pose.reloadProgress < 1);
  for (const appearance of [standard(), bare(), alternate()]) {
    subject.actor.appearanceV126 = appearance;
    await readyAppearance(subject);
    assert.deepEqual(combatState(subject.actor), before, 'Appearance drawing cannot spend, refill or cancel a reload.');
    assert.deepEqual(geometry(await readyPose(subject)), geometry(pose), 'Clothing does not own the weapon or body transform.');
  }
});

test('separated clothes preserve mirrored and crouched IK and the actual accepted-shot muzzle', async () => {
  const weapon = WEAPONS.find(item => item.id === 'weapon-004-vp70-combat-pistol');
  assert.ok(weapon);
  const subject = fixture({ weapon });
  for (const [label, stance, direction] of [
    ['standing', { crouching: false, grounded: true, vx: 0, vy: 0 }, [1, 0]],
    ['crouched-left', { crouching: true, grounded: true, vx: 0, vy: 0 }, [-1, -.5]],
    ['airborne-left', { crouching: false, grounded: false, vx: -40, vy: -100 }, [-1, -1]]
  ]) {
    const aim = resolveCombatAimV83({ x: direction[0], y: direction[1], facing: direction[0] });
    Object.assign(subject.actor, stance, { aimingV124: true, facing: aim.facing, combatAimV83: aim, pointerAimV83: aim });
    let reference, emitted;
    for (const appearance of [standard(), bare()]) {
      subject.actor.appearanceV126 = appearance;
      const pose = await readyPose(subject, subject.actor, aim);
      await readyAppearance(subject);
      const held = subject.actor.heldWeaponVisualV125;
      assert.ok(held); near(held.nearHand.x, held.grip.x, `${label} near hand x`);
      near(held.nearHand.y, held.grip.y, `${label} near hand y`);
      assert.ok(held.nearReachError < .02 && held.farReachError < .02, `${label}: both arm targets remain reachable.`);
      if (!reference) reference = geometry(pose);
      else assert.deepEqual(geometry(pose), reference, `${label}: optional parts cannot move joints or the barrel.`);
      Object.assign(subject.actor, { fireClock: 0, v52FireClock: 0 });
      assert.equal(subject.engine.fire(subject.actor), true, `${label}: a real shot was accepted.`);
      const bullet = subject.engine.bullets.at(-1), accepted = await readyPose(subject, subject.actor, aim);
      near(bullet.x, accepted.muzzle.x, `${label} emitted muzzle x`); near(bullet.y, accepted.muzzle.y, `${label} emitted muzzle y`);
      if (emitted) { near(bullet.x, emitted.x, `${label} clothing-invariant shot x`); near(bullet.y, emitted.y, `${label} clothing-invariant shot y`); }
      emitted = point(bullet);
      // The accepted shot creates recoil before the origin is computed. The
      // comparison for the next outfit uses that same simulation event time.
      reference = geometry(accepted);
    }
  }
});

test('deferred or failed clothing images keep a complete fallback and retain selection without moving the gun', async () => {
  for (const failed of [false, true]) {
    const subject = fixture({ playerAppearanceV126: alternate() }, { holdImages: source => modularPaths.has(source) });
    const pose = await readyPose(subject), before = combatState(subject.actor);
    if (failed) { subject.failImages(); await subject.flush(); }
    const fallback = drawActor(subject);
    assert.equal(fallback.supported, true); assert.equal(fallback.ready, false); assert.equal(fallback.drawn, false);
    assert.ok(fallback.reason); assert.deepEqual(fallback.selected, alternate());
    assert.equal(subject.drawing.draws.filter(draw => modularPaths.has(draw.source)).length, 0,
      'No floating part is submitted while a required structural image is unavailable.');
    assert.ok(subject.drawing.draws.some(draw => oldBodyPaths.has(draw.source)), 'A complete authored V125 body remains visible.');
    assert.deepEqual(combatState(subject.actor), before);
    assert.deepEqual(geometry(await readyPose(subject)), geometry(pose));
    if (!failed) {
      subject.releaseImages(); await subject.flush(); await readyAppearance(subject);
      assert.deepEqual(geometry(await readyPose(subject)), geometry(pose), 'Image completion does not move the muzzle or joints.');
    }
  }
});

test('real medical, sentry installation and recovery keep the selected pieces throughout their transactions', async () => {
  const sentry = EQUIPMENT.find(item => item.id === 'equipment-020-portable-sentry'); assert.ok(sentry);
  const subject = fixture({ equipment: [sentry], playerAppearanceV126: alternate() });
  await readyAppearance(subject);
  subject.actor.health = 30;
  subject.key('keydown', 'KeyH'); subject.key('keyup', 'KeyH');
  assert.equal(subject.engine.isFieldActionBusyV124(subject.actor), true);
  const resources = combatState(subject.actor), kits = subject.engine.inventory.medkits;
  let action = await readyAppearance(subject);
  assert.equal(action.action.kind, 'medical'); assert.equal(action.action.phase, 'prepare');
  assert.equal(action.action.props[0].itemId, 'tool.medkit'); assert.equal(action.action.firing, false);
  assert.equal(subject.actor.heldWeaponVisualV125, null);
  assert.equal(subject.engine.resolvePlayerWeaponPoseV125(subject.actor), null, 'The actual firing rig still rejects occupied hands.');
  for (let frame = 0; frame < 12; frame++) drawActor(subject);
  assert.deepEqual(combatState(subject.actor), resources, 'Rendering the kit never advances or commits its transaction.');
  assert.equal(subject.engine.inventory.medkits, kits);
  advance(subject.engine, 1.1); action = await readyAppearance(subject);
  assert.equal(action.action.phase, 'work'); assert.equal(subject.actor.health, 30);
  advance(subject.engine, 2.3);
  assert.ok(subject.actor.health > 30); assert.equal(subject.engine.isFieldActionBusyV124(subject.actor), false);
  assert.equal(subject.engine.inventory.medkits, kits - 1);
  action = await readyAppearance(subject); assert.equal(action.action, null);
  assert.equal(subject.actor.playerActionVisualV127, null);
  assert.equal(subject.engine.useEquipment(sentry.id, subject.actor), true);
  assert.equal(subject.engine.confirmPlaceableV86(subject.actor), true);
  assert.equal(subject.engine.isPlaceableBusyV86(subject.actor), true);
  action = await readyAppearance(subject); assert.equal(action.action.kind, 'deploy');
  assert.deepEqual(action.action.props, [], 'The world-owned sentry is not duplicated as an object in the hands.');
  advance(subject.engine, 2.6);
  const instance = subject.engine.placeablesV86.instances[0];
  assert.equal(instance.status, 'deployed');
  action = await readyAppearance(subject); assert.equal(action.action, null);
  assert.equal(subject.engine.recoverPlaceableV86(instance.instanceId, subject.actor), true);
  action = await readyAppearance(subject); assert.equal(action.action.kind, 'recover');
  advance(subject.engine, 2.1);
  assert.equal(instance.onGround, false);
  action = await readyAppearance(subject); assert.equal(action.action, null);
});

test('J1 and J2 perform different modular actions independently and a pause freezes their phases', async () => {
  const subject = fixture({ playerAppearanceV126: alternate(), coopAppearanceV126: bare() });
  const { engine, actor } = subject;
  engine.setCoop(true); await readyAppearance(subject); await readyAppearance(subject, engine.coop);
  actor.health = 30;
  assert.equal(engine.useMedkit(actor), true);
  assert.equal(engine.activateTracker(engine.coop), true);
  const primary = await readyAppearance(subject), secondary = await readyAppearance(subject, engine.coop);
  assert.equal(primary.action.mode, 'medical'); assert.equal(secondary.action.mode, 'motion-tracker');
  assert.notEqual(primary.action.props[0].imageKey, secondary.action.props[0].imageKey);
  assert.deepEqual(primary.selected, alternate()); assert.deepEqual(secondary.selected, bare());
  const cache = engine.playerAppearanceSnapshotV126().images;
  assert.ok(cache.retained <= cache.limit && cache.loading === 0 && cache.failed === 0);
  engine.togglePause(); const phases = [actor.fieldActionV124.elapsed, engine.coop.toolUseClock];
  advance(engine, .7);
  assert.deepEqual([actor.fieldActionV124.elapsed, engine.coop.toolUseClock], phases);
  assert.deepEqual((await readyAppearance(subject)).action, primary.action);
  assert.deepEqual((await readyAppearance(subject, engine.coop)).action, secondary.action);
  engine.togglePause();
  const kits = engine.inventory.medkits;
  assert.equal(engine.cancelFieldActionV124(actor), true);
  assert.equal((await readyAppearance(subject)).action, null);
  assert.equal((await readyAppearance(subject, engine.coop)).action.mode, 'motion-tracker');
  assert.equal(actor.health, 30); assert.equal(engine.inventory.medkits, kits);
  advance(engine, .8);
  assert.equal((await readyAppearance(subject, engine.coop)).action, null);
});

test('real field tools render their own implement without committing targets or resources during drawing', async () => {
  const modes = [
    ['Access Tuner', 'access-tuner', 'tool.access-tuner'],
    ['Maintenance Jack', 'maintenance-jack', 'tool.maintenance-jack'],
    ['Cutting Torch', 'cutting-torch', WEAPONS.find(item => item.name === 'Cutting Torch').id]
  ];
  for (const [name, mode, propId] of modes) {
    const equipment = EQUIPMENT.find(item => item.name === name); assert.ok(equipment);
    const subject = fixture({ equipment: [equipment], playerAppearanceV126: alternate() });
    const { engine, actor } = subject;
    await readyAppearance(subject);
    const target = { id: `qa-${mode}`, x: actor.x + actor.w + 18, y: actor.y, w: 24, h: actor.h,
      open: false, lockedBy: 'security', art: 'breakable' };
    if (mode === 'access-tuner') engine.doors = [target];
    if (mode === 'cutting-torch') engine.walls = [target];
    assert.equal(engine.useEquipment(equipment.id, actor), true);
    advance(engine, .5);
    const transaction = combatState(actor), charges = engine.equipmentActions.get(equipment.id).remaining;
    const beforeTarget = structuredClone(target);
    const visual = await readyAppearance(subject);
    assert.equal(visual.action.mode, mode); assert.equal(visual.action.props.length, 1);
    assert.equal(visual.action.props[0].itemId, propId);
    assert.ok(subject.drawing.draws.some(draw => draw.source === visual.action.props[0].path));
    assert.ok(!visual.layers.some(layer => layer.slot === 'weapon'), 'The gun is stowed while the real implement is held.');
    assert.equal(engine.resolvePlayerWeaponPoseV125(actor), null);
    for (let count = 0; count < 8; count++) drawActor(subject);
    assert.deepEqual(combatState(actor), transaction); assert.deepEqual(target, beforeTarget);
    assert.equal(engine.equipmentActions.get(equipment.id).remaining, charges);
    assert.equal(engine.cancelFieldActionV124(actor), true);
    assert.equal((await readyAppearance(subject)).action, null);
    assert.equal(engine.equipmentActions.get(equipment.id).remaining, charges);
  }
});

test('movement, changed targets and an actual impact end field gestures without stale tools', async () => {
  for (const ending of ['movement', 'target', 'impact']) {
    const tuner = EQUIPMENT.find(item => item.name === 'Access Tuner');
    const subject = fixture({ equipment: [tuner], playerAppearanceV126: alternate() });
    const { engine, actor } = subject;
    const door = { id: 'qa-access', x: actor.x + actor.w + 18, y: actor.y, w: 24, h: actor.h,
      open: false, lockedBy: 'security' };
    engine.doors = [door]; await readyAppearance(subject);
    const charges = engine.equipmentActions.get(tuner.id).remaining;
    assert.equal(engine.useEquipment(tuner.id, actor), true);
    advance(engine, .25); assert.equal((await readyAppearance(subject)).action.mode, 'access-tuner');
    if (ending === 'movement') { subject.key('keydown', 'KeyA'); advance(engine, .05); subject.key('keyup', 'KeyA'); }
    if (ending === 'target') { engine.doors = []; advance(engine, .05); }
    if (ending === 'impact') engine.damagePlayer(actor, 12);
    assert.equal(engine.isFieldActionBusyV124(actor), false);
    const visual = await readyAppearance(subject);
    assert.ok(!visual.action || visual.action.mode === 'hurt');
    assert.ok(!visual.layers.some(layer => layer.slot === 'action-prop'));
    assert.equal(door.open, false); assert.equal(engine.equipmentActions.get(tuner.id).remaining, charges);
    advance(engine, .6); assert.equal((await readyAppearance(subject)).action, null);
  }
});

test('a missing active tool keeps the complete fallback and late loads cannot restore cancelled work', async () => {
  const medkit = PLAYER_ACTION_PROP_ASSETS_V127.find(asset => asset.id === 'tool.medkit'); assert.ok(medkit);
  const subject = fixture({ playerAppearanceV126: alternate() }, { holdImages: path => path === medkit.path });
  const { engine, actor } = subject;
  await readyAppearance(subject); actor.health = 30;
  assert.equal(engine.useMedkit(actor), true);
  const before = combatState(actor), kits = engine.inventory.medkits;
  const visual = drawActor(subject);
  assert.equal(visual.supported, true); assert.equal(visual.ready, false); assert.equal(visual.drawn, false);
  assert.equal(visual.reason, 'action-images-unavailable');
  assert.ok(subject.drawing.draws.length > 0, 'The existing complete actor remains visible.');
  assert.equal(subject.drawing.draws.filter(draw => modularPaths.has(draw.source) || draw.source === medkit.path).length, 0,
    'No part of an incomplete action is painted beneath the fallback.');
  assert.deepEqual(combatState(actor), before); assert.equal(engine.inventory.medkits, kits);
  engine.cancelFieldActionV124(actor);
  subject.releaseImages(); await subject.flush();
  assert.equal((await readyAppearance(subject)).action, null);
  assert.equal(actor.health, 30); assert.equal(engine.inventory.medkits, kits);
  engine.stop(); const requests = subject.requests.length;
  await subject.flush(); assert.equal(subject.requests.length, requests);
  assert.equal(engine.playerAppearanceSnapshotV126().images.retained, 0);
});

test('real contextual knife and rifle-bash keep the outfit and do not emit a projectile or spend ammunition', async () => {
  for (const weaponMode of ['sidearm', 'rifle']) {
    const subject = fixture({ playerAppearanceV126: alternate() }), { engine, actor } = subject;
    actor.weaponMode = weaponMode; await readyAppearance(subject);
    const target = engine.createEnemy(ENEMIES[0], 0, actor.x + 45, actor.y + actor.h, { boss: false, keyCarrier: false });
    Object.assign(target, { x: actor.x + 48, y: actor.y, vx: 0, vy: 0, grounded: true });
    engine.enemies = [target];
    const ammo = actor.ammo, shots = actor.shots, bullets = engine.bullets.length;
    assert.equal(engine.performContextualMelee(actor), true);
    const visual = await readyAppearance(subject);
    assert.equal(visual.action.mode, weaponMode === 'rifle' ? 'rifle-bash' : 'knife-attack');
    assert.equal(visual.action.props.length, 1); assert.equal(visual.action.props[0].firing, false);
    if (weaponMode === 'rifle') assert.equal(visual.action.props[0].itemId, engine.heldWeaponDescriptorV125(actor).id);
    else assert.match(visual.action.props[0].itemId, /knife/);
    const healthAfterHit = target.health;
    for (let frame = 0; frame < 12; frame++) drawActor(subject);
    assert.equal(target.health, healthAfterHit); assert.equal(actor.ammo, ammo); assert.equal(actor.shots, shots);
    assert.equal(engine.bullets.length, bullets); assert.equal(engine.weaponEffectsV124.lights.length, 0);
    engine.enemies = []; advance(engine, .6);
    assert.equal((await readyAppearance(subject)).action, null);
  }
});

test('an accepted shot interrupts cosmetic hurt and immediately returns to the aligned held weapon', async () => {
  const subject = fixture({ playerAppearanceV126: alternate() }), { engine, actor } = subject;
  await readyAppearance(subject);
  engine.damagePlayer(actor, 10);
  assert.ok(actor.v52HurtClock > 0);
  assert.equal((await readyAppearance(subject)).action.mode, 'hurt');
  const health = actor.health, armor = actor.armor, ammo = actor.ammo;
  assert.equal(engine.fire(actor), true, 'Existing gameplay permits a response shot during the cosmetic injury animation.');
  assert.equal(actor.ammo, ammo - 1); assert.equal(actor.health, health); assert.equal(actor.armor, armor);
  assert.equal(actor.v52HurtClock, 0, 'The accepted response owns the hands; it cannot fire from a holstered injury pose.');
  const visual = await readyAppearance(subject);
  assert.equal(visual.action, null); assert.ok(actor.heldWeaponVisualV125);
  const bullet = engine.bullets.at(-1);
  near(actor.heldWeaponVisualV125.muzzle.x, bullet.x, 'Response shot rendered muzzle x');
  near(actor.heldWeaponVisualV125.muzzle.y, bullet.y, 'Response shot rendered muzzle y');
});

test('native costumes, custom armor and Neuro report unsupported composition without losing either loadout', async () => {
  const neuroProfile = NEURO_XENO_PROFILES.find(item => item.playerClassCompatible); assert.ok(neuroProfile);
  const costume = getCostumeV119('franchise-nostromo-crew'); assert.ok(costume);
  for (const [label, options, reason] of [
    ['Nostromo', { costume }, 'dedicated-costume'],
    ['custom armor', { userEquipmentV95: { armorId: 'item-v95-user-human-xeno-armor-male-full' } }, 'custom-armor'],
    ['Neuro', { neuroProfile }, 'neuro-art']
  ]) {
    const subject = fixture({ ...options, playerAppearanceV126: alternate(), coopAppearanceV126: bare() });
    subject.engine.setCoop(true); await subject.flush();
    drawActor(subject); await subject.flush();
    const visual = drawActor(subject);
    assert.equal(visual.supported, false, label); assert.equal(visual.drawn, false, label); assert.equal(visual.reason, reason, label);
    assert.deepEqual(visual.selected, alternate());
    assert.equal(subject.drawing.draws.filter(draw => modularPaths.has(draw.source)).length, 0, `${label} keeps its complete native renderer.`);
    assert.deepEqual(operatorSnapshot(subject, subject.engine.coop).selected, bare());
    if (label === 'Nostromo') assert.equal(subject.actor.playerVisualV81?.skinId, 'player.nostromo-crew-v119');
    if (label === 'custom armor') assert.equal(subject.actor.playerVisualV95?.worn, true);
  }
});

test('an unarmed coop operator still wears their modular kit with no hidden or duplicate gun', async () => {
  const subject = fixture({ playerAppearanceV126: standard(), coopAppearanceV126: bare() });
  subject.engine.setCoop(true);
  assert.equal(attachCrewDeploymentV85(subject.engine.coop, { ...CREW[1], gearV85: [] }), true);
  const before = combatState(subject.engine.coop);
  const visual = await readyAppearance(subject, subject.engine.coop);
  assert.equal(visual.surface, 'mission'); assert.equal(subject.engine.coop.heldWeaponVisualV125, null);
  assert.equal(subject.engine.resolvePlayerWeaponPoseV125(subject.engine.coop, RIGHT), null);
  assert.equal(subject.drawing.draws.filter(draw => /\/weapons\/|\/user-equipment-v95\//.test(draw.source || '')).length, 0);
  assert.deepEqual(combatState(subject.engine.coop), before);
});

test('the real hub composes a neutral selected kit and only physical movement advances its gait', async () => {
  const host = browserHost(), hub = new HubGame(host.canvas);
  hub.playerAppearanceV126 = bare(); hub.start(); await host.flush();
  host.drawing.reset(); hub.drawPlayer(host.drawing.ctx); host.drawing.assertBalanced();
  let status = hub.getSnapshot().playerAppearanceV126;
  assertComposed(host, status.visual, bare(), 'Hub');
  assert.equal(status.visual.surface, 'hub'); assert.ok(!hub.player.heldWeaponVisualV125);
  assert.equal(status.images.retained, 6, 'The hub uses the same three modular and three body pages.');
  const x = hub.player.x;
  host.key('keydown', 'KeyD');
  for (let frame = 0; frame < 20; frame++) hub.loop(hub.last + 1000 / 60, hub.loopToken);
  host.key('keyup', 'KeyD');
  assert.ok(hub.player.x > x); assert.ok(hub.player.weaponRigMotionV125?.distance > 0);
  const motion = structuredClone(hub.player.weaponRigMotionV125);
  hub.drawPlayer(host.drawing.ctx); hub.drawPlayer(host.drawing.ctx);
  assert.deepEqual(hub.player.weaponRigMotionV125, motion, 'Drawing cannot advance the walking phase.');
  assert.equal(hub.pause(), true);
  hub.loop(hub.last + 1000, hub.loopToken);
  assert.deepEqual(hub.player.weaponRigMotionV125, motion, 'A paused hub does not advance clothing motion.');
  hub.stop(false); status = hub.getSnapshot().playerAppearanceV126;
  assert.equal(status.images.retained, 0); assert.equal(hub.player.playerAppearanceVisualV126, null);
});

test('a real annex ladder uses its physical rectangle and drawn rungs without requiring a player ladder id', async () => {
  const host = browserHost(), hub = new HubGame(host.canvas);
  hub.playerAppearanceV126 = alternate(); hub.start();
  assert.ok(hub.beginAnnexTransitionV71('logistics', 'enter'));
  const frames = count => { for (let frame = 0; frame < count; frame++) hub.loop(hub.last + 1000 / 60, hub.loopToken); };
  frames(30); await host.flush();
  const annex = hub.currentAnnexV71(), actor = hub.player;
  assert.equal(annex.id, 'logistics'); assert.equal(actor.climbing, false);
  assert.equal(hub.getSnapshot().playerAppearanceV126.visual.transit, null);
  const ladder = annex.ladders[0], axis = ladder.x + ladder.w / 2;
  host.key('keydown', 'KeyD');
  for (let frame = 0; frame < 240 && actor.x + actor.w / 2 < axis; frame++) frames(1);
  host.key('keyup', 'KeyD');
  assert.ok(Math.abs(actor.x + actor.w / 2 - axis) < ladder.w / 2, 'Walking reaches the authored ladder.');
  const floorY = actor.y;
  host.key('keydown', 'KeyW'); frames(20); host.key('keyup', 'KeyW'); await host.flush();
  assert.equal(actor.climbing, true); assert.ok(actor.y < floorY);
  assert.equal(actor.ladderId, undefined, 'Annex physics does not store a mission ladder identifier.');

  host.drawing.reset(); hub.drawAnnexGeometryV71(host.drawing.ctx, annex);
  const rungs = host.drawing.draws.filter(draw => draw.args.length === 8
    && draw.args[4] === ladder.x + 7 && draw.args[6] === ladder.w - 14 && draw.args[7] === 4)
    .map(draw => ({ x: draw.args[4], y: draw.args[5], w: draw.args[6], h: draw.args[7] }));
  assert.ok(rungs.length > 0, 'The real annex renderer submits its authored ladder rungs.');
  host.drawing.reset(); hub.drawPlayer(host.drawing.ctx); host.drawing.assertBalanced();
  const visual = hub.getSnapshot().playerAppearanceV126.visual, climbing = visual.transit;
  assertComposed(host, visual, alternate(), 'Annex ladder');
  assert.equal(climbing?.kind, 'climb'); assert.equal(climbing.drawn, true);
  assert.equal(climbing.contacts.ladderId, ladder.id); assert.equal(climbing.firing, false);
  assert.equal(visual.layers.filter(layer => layer.slot === 'legs').length, 7);
  const planted = [...Object.values(climbing.contacts.feet), ...Object.values(climbing.contacts.hands)]
    .filter(contact => contact.planted);
  assert.ok(planted.length > 0, 'A reachable hand or boot holds a real rung.');
  for (const contact of planted) assert.ok(rungs.some(rung => contact.point.x >= rung.x
    && contact.point.x <= rung.x + rung.w && contact.point.y >= rung.y && contact.point.y <= rung.y + rung.h),
  'The planted contact lies inside a rung drawn at the annex rectangle, not at its left edge.');

  frames(2); host.drawing.reset(); hub.drawPlayer(host.drawing.ctx);
  const holding = hub.getSnapshot().playerAppearanceV126.visual.transit;
  assert.equal(holding.phase, 'holding');
  const state = structuredClone(actor.playerTransitStateV128), position = { x: actor.x, y: actor.y };
  assert.equal(hub.pause(), true); frames(20);
  hub.drawPlayer(host.drawing.ctx); hub.getSnapshot();
  assert.deepEqual(actor.playerTransitStateV128, state); assert.deepEqual({ x: actor.x, y: actor.y }, position);
  assert.deepEqual(hub.getSnapshot().playerAppearanceV126.visual.transit.contacts, holding.contacts);
  assert.equal(hub.resume(), true);
  host.key('keydown', 'KeyD'); frames(2); host.key('keyup', 'KeyD'); frames(60);
  assert.equal(actor.climbing, false); assert.equal(actor.grounded, true);
  host.drawing.reset(); hub.drawPlayer(host.drawing.ctx);
  assert.equal(hub.getSnapshot().playerAppearanceV126.visual.transit, null);
  hub.stop(false);
  assert.equal(actor.playerTransitVisualV128, null);
  assert.equal(hub.getSnapshot().playerAppearanceV126.images.retained, 0);
});

test('the real Port Meridien ladder keeps modular hands and boots on its own authored rung spacing', async () => {
  const host = browserHost(), hub = new HubGame(host.canvas, { onAction: () => true });
  hub.playerAppearanceV126 = alternate();
  hub.start({}, {
    onboardingV84: { ...createPlayerOnboardingV84({ name: 'Alex Ward', callsign: 'ECHO-9' }), phase: 'complete' },
    openingV88: { schema: 88, phase: 'ready', freight: 'energy', qualificationId: 'm41a-qualification-v81:session-1:qualification' },
    portMeridienV90: { schema: 90, phase: 'power', freight: 'energy', x: 1140, y: 532, facing: 1 }
  });
  assert.equal(hub.isPortMeridienV90(), true); await host.flush();
  const annex = hub.currentAnnexV71(), actor = hub.player, ladder = annex.ladders[0];
  const frames = count => { for (let frame = 0; frame < count; frame++) hub.loop(hub.last + 1000 / 60, hub.loopToken); };
  host.key('keydown', 'KeyD');
  for (let frame = 0; frame < 90 && actor.x + actor.w / 2 < ladder.x + ladder.w / 2; frame++) frames(1);
  host.key('keyup', 'KeyD');
  host.key('keydown', 'KeyW'); frames(20); host.key('keyup', 'KeyW'); await host.flush();
  assert.equal(actor.climbing, true); assert.equal(actor.ladderId, undefined);
  assert.ok(actor.y + actor.h < annex.world.floorY, 'Actual quay physics moves the operator up the ladder.');
  host.drawing.reset(); hub.draw(); host.drawing.assertBalanced();
  const rungs = host.drawing.draws.filter(draw => draw.image === hub.portImagesV90.get('ladder')
    && draw.args.length === 8 && draw.args[7] === 4)
    .map(draw => ({ x: draw.args[4], y: draw.args[5], w: draw.args[6], h: draw.args[7] }));
  assert.ok(rungs.length > 1);
  near(rungs[1].y - rungs[0].y, 24, 'The quay draws its own 24 px rung spacing');
  const visual = actor.playerAppearanceVisualV126, climbing = visual.transit;
  assertComposed(host, visual, alternate(), 'Port ladder');
  assert.equal(climbing?.kind, 'climb'); assert.equal(climbing.drawn, true);
  assert.equal(visual.layers.filter(layer => layer.slot === 'legs').length, 7);
  const planted = [...Object.values(climbing.contacts.feet), ...Object.values(climbing.contacts.hands)]
    .filter(contact => contact.planted);
  assert.ok(planted.length > 0);
  for (const contact of planted) assert.ok(rungs.some(rung => contact.point.x >= rung.x
    && contact.point.x <= rung.x + rung.w && contact.point.y >= rung.y && contact.point.y <= rung.y + rung.h),
  'A modular hand or boot plants inside a rung submitted by the real Port Meridien renderer.');
  assert.ok(climbing.contacts.ladderId?.includes(annex.id), 'The anonymous physical ladder receives a stable local identity.');
  assert.equal(hub.getSnapshot().playerAppearanceV126.visual.transit.contacts.ladderId, climbing.contacts.ladderId);
  frames(2); host.drawing.reset(); hub.draw();
  const holding = actor.playerAppearanceVisualV126.transit;
  frames(15); host.drawing.reset(); hub.draw();
  assert.deepEqual(actor.playerAppearanceVisualV126.transit.contacts, holding.contacts,
    'Recreating the port geometry each frame cannot move a held rung or change its identity.');
  host.key('keydown', 'KeyD'); frames(2); host.key('keyup', 'KeyD'); frames(60);
  assert.equal(actor.climbing, false); assert.equal(actor.grounded, true);
  assert.equal(actor.playerTransitVisualV128, null); assert.equal(hub.portStateV90.phase, 'power');
  hub.stop(false);
  assert.equal(actor.playerTransitVisualV128, null);
  assert.equal(hub.getSnapshot().playerAppearanceV126.images.retained, 0);
});

test('a real hangar electrical contact keeps the modular outfit and preserves its gameplay stun', async () => {
  const host = browserHost(), hub = new HubGame(host.canvas);
  hub.playerAppearanceV126 = alternate(); hub.start(); await host.flush();
  hub.state.deck = HUB_DECKS.findIndex(deck => deck.id === 'engineering');
  assert.ok(hub.state.deck >= 0);
  const room = HUB_DECKS[hub.state.deck].rooms.find(entry => entry.id === DROPSHIP_HANGAR_ART_V55.roomId);
  const bounds = ELECTRICAL_HAZARD_ART_V55.collisionBounds;
  hub.player.x = room.xStart + bounds.x + bounds.w / 2 - hub.player.w / 2;
  hub.player.y = bounds.y + Math.min(12, bounds.h) - hub.player.h;
  hub.hangarHazardCooldown = 0;
  assert.equal(hub.applyHangarHazard(), true);
  const health = hub.player.health, shock = hub.player.shockClock, velocity = hub.player.vy;
  assert.ok(shock > 0 && health < hub.player.maxHealth);
  host.drawing.reset(); hub.drawPlayer(host.drawing.ctx); host.drawing.assertBalanced();
  const visual = hub.getSnapshot().playerAppearanceV126.visual;
  assertComposed(host, visual, alternate(), 'Hangar shock');
  assert.equal(visual.action.mode, 'hurt'); assert.equal(visual.action.props.length, 0);
  for (let count = 0; count < 8; count++) hub.drawPlayer(host.drawing.ctx);
  assert.equal(hub.player.health, health); assert.equal(hub.player.shockClock, shock); assert.equal(hub.player.vy, velocity);
  hub.stop(false);
  assert.equal(hub.player.playerActionVisualV127, null);
  assert.equal(hub.getSnapshot().playerAppearanceV126.images.retained, 0);
});

test('Bioforge initializes and restores its own kit while keeping the accepted weapon origin aligned', async () => {
  const host = browserHost(), engine = new BioforgeRuntimeV80(host.canvas, { autoLoop: false });
  const options = { profileId: 'enemy-004-drone-big-chap', quantity: 1, autoLoop: false, playerAppearanceV126: alternate() };
  assert.equal(engine.start(options).started, true);
  const subject = { ...host, engine, actor: engine.player };
  const visual = await readyAppearance(subject); assert.equal(visual.surface, 'bioforge');
  assert.deepEqual(engine.captureBioforgeRuntimeStateV81().player.appearanceV126, alternate());
  const resume = engine.captureBioforgeResumeStateV80();
  const resumedHost = browserHost(), resumed = new BioforgeRuntimeV80(resumedHost.canvas, { autoLoop: false });
  assert.equal(resumed.start({ ...options, playerAppearanceV126: bare(), resumeState: resume }).started, true);
  const restored = { ...resumedHost, engine: resumed, actor: resumed.player };
  await readyAppearance(restored); assert.deepEqual(resumed.player.appearanceV126, alternate());
  resumed.bioforgeRootV80.activeSession.phase = 'combat';
  resumed.player.gamepadAimV83 = { x: 1, y: 0 };
  assert.equal(resumed.fire(resumed.player), true);
  const bullet = resumed.bullets.at(-1), pose = await readyPose(restored, resumed.player, RIGHT, { surface: 'bioforge' });
  near(bullet.x, pose.muzzle.x, 'Bioforge accepted muzzle x'); near(bullet.y, pose.muzzle.y, 'Bioforge accepted muzzle y');
  drawActor(restored); near(resumed.player.heldWeaponVisualV125.muzzle.x, bullet.x, 'Bioforge drawn muzzle x');
  near(resumed.player.heldWeaponVisualV125.muzzle.y, bullet.y, 'Bioforge drawn muzzle y');
});

test('preparing Bioforge after a profile change replaces the previous outfit before any session starts', async () => {
  const host = browserHost(), engine = new BioforgeRuntimeV80(host.canvas, { autoLoop: false });
  const options = { profileId: 'enemy-004-drone-big-chap', quantity: 1, autoLoop: false };
  assert.equal(engine.start({ ...options, playerAppearanceV126: alternate(), costumeId: 'franchise-nostromo-crew' }).started, true);
  await host.flush(); assert.equal(engine.player.costumeId, 'franchise-nostromo-crew');
  engine.stop({ reason: 'view-change' });
  assert.equal(engine.prepare(createBioforgeV80(), { playerAppearanceV126: bare(), costumeId: 'costume-001' }).prepared, true);
  assert.equal(engine.running, false);
  assert.deepEqual(engine.player.appearanceV126, bare());
  assert.notEqual(engine.player.costumeId, 'franchise-nostromo-crew', 'The previous profile cannot lend its native costume to preparation.');
  await readyAppearance({ ...host, engine, actor: engine.player });
  engine.prepare(createBioforgeV80());
  assert.equal(engine.running, false); assert.deepEqual(engine.player.appearanceV126, standard());
  assert.notEqual(engine.player.costumeId, 'franchise-nostromo-crew');
  await readyAppearance({ ...host, engine, actor: engine.player });
});

test('Bioforge purges active work and movement before persisting its final frame, then releases the art', async () => {
  const host = browserHost(), persisted = [], events = [];
  const engine = new BioforgeRuntimeV80(host.canvas, { autoLoop: false,
    onPersist: state => persisted.push(structuredClone(state)), onEvent: event => events.push(event) });
  engine.start({ profileId: 'enemy-004-drone-big-chap', quantity: 1, autoLoop: false, playerAppearanceV126: alternate() });
  await readyAppearance({ ...host, engine, actor: engine.player });
  engine.player.health = 40;
  assert.equal(engine.useMedkit(), true);
  Object.assign(engine.player, { vx: 135, jumpBuffer: .1 });
  assert.ok(engine.player.actionClock > 0 && engine.player.interactionClock > 0);
  engine.purgeBioforgeV80('operator-emergency-purge');
  const physical = persisted.at(-1).runtimeV81.physicalV87.player;
  for (const key of ['actionClock', 'interactionClock', 'vx', 'jumpBuffer']) {
    assert.equal(physical[key], 0, `The persisted ${key} reflects the completed gameplay stop.`);
    assert.equal(engine.player[key], 0);
  }
  assert.equal(engine.player.health, 40); assert.equal(engine.inventory.medkits, 3);
  const cancelled = events.findIndex(event => event.type === 'field-action-cancelled');
  const returned = events.findIndex(event => event.type === 'bioforge-return-ready');
  assert.ok(cancelled >= 0 && returned > cancelled, 'Action cancellation precedes the return-ready event.');
  assert.equal(engine.playerAppearanceSnapshotV126().images.retained, 0);
});

test('prepared Bioforge refreshes the selected outfit when its actual pages finish loading without starting simulation', async () => {
  const host = browserHost({ holdImages: true });
  const engine = new BioforgeRuntimeV80(host.canvas, { autoLoop: false });
  engine.prepare(createBioforgeV80(), { playerAppearanceV126: bare() });
  assert.equal(engine.running, false);
  assert.equal(engine.player.playerAppearanceVisualV126?.drawn, false);
  const before = combatState(engine.player);
  host.releaseImages(); await host.flush();
  assert.equal(engine.running, false, 'Completing the art does not start a laboratory session.');
  assert.equal(engine.player.playerAppearanceVisualV126?.drawn, true, 'A cache completion refreshes the static preparation frame.');
  assert.deepEqual(engine.player.playerAppearanceVisualV126.selected, bare());
  assert.deepEqual(combatState(engine.player), before, 'The completion refresh is presentation-only.');
  engine.stop({ reason: 'view-change' });
  assert.equal(engine.playerAppearanceSnapshotV126().images.retained, 0);
});

test('Bioforge stop releases both ready and pending pages and only a new preparation reopens image loading', async () => {
  for (const holdImages of [false, true]) {
    const host = browserHost({ holdImages }), engine = new BioforgeRuntimeV80(host.canvas, { autoLoop: false });
    const options = { profileId: 'enemy-004-drone-big-chap', quantity: 1, autoLoop: false, playerAppearanceV126: alternate() };
    assert.equal(engine.start(options).started, true);
    if (!holdImages) await readyAppearance({ ...host, engine, actor: engine.player });
    assert.ok(engine.playerAppearanceSnapshotV126().images.retained > 0);
    const lateLoads = host.images.filter(image => typeof image.onload === 'function' && dimensions(image.src))
      .map(image => ({ image, callback: image.onload }));
    assert.ok(lateLoads.length > 0, 'The real loaders installed observable completion callbacks.');
    engine.stop({ reason: 'view-change' });
    assert.equal(engine.running, false); assert.equal(engine.playerAppearanceSnapshotV126().images.retained, 0);
    const requestsAfterStop = host.requests.length;
    host.releaseImages(); await host.flush();
    // A queued old completion must not resurrect a closed laboratory view.
    // Background-art callbacks also used to call draw() after purge.
    for (const { image, callback } of lateLoads) callback.call(image, new Event('load'));
    engine.draw(); await host.flush();
    assert.equal(host.requests.length, requestsAfterStop, 'Late callbacks and a closed-view draw cannot request new rig pages.');
    assert.equal(engine.playerAppearanceSnapshotV126().images.retained, 0);
    engine.prepare(createBioforgeV80(), { playerAppearanceV126: bare() });
    await readyAppearance({ ...host, engine, actor: engine.player });
    assert.deepEqual(engine.player.appearanceV126, bare());
    assert.equal(engine.start({ ...options, playerAppearanceV126: bare() }).started, true);
    await readyAppearance({ ...host, engine, actor: engine.player });
  }
});

test('maximal J1/J2 kits share three pages, avoid repeated loads and release scene-owned images', async () => {
  assert.equal(PLAYER_MODULAR_RIG_ASSETS_V126.length, 3);
  const subject = fixture({ playerAppearanceV126: alternate(), coopAppearanceV126: standard() });
  subject.engine.setCoop(true);
  assert.equal(attachCrewDeploymentV85(subject.engine.coop, { ...CREW[1],
    gearV85: [{ instanceId: 'qa-v126-bravo-pistol', catalogId: 'weapon-003-m4a3-service-pistol', kind: 'weapon' }] }), true);
  await readyAppearance(subject); await readyAppearance(subject, subject.engine.coop);
  const cache = subject.engine.playerAppearanceSnapshotV126().images;
  assert.equal(cache.limit, 12); assert.ok(cache.retained <= 12); assert.equal(cache.loading, 0); assert.equal(cache.failed, 0);
  for (const asset of PLAYER_MODULAR_RIG_ASSETS_V126) {
    assert.equal(cache.assets.find(entry => entry.imageKey === asset.imageKey)?.state, 'ready');
    assert.equal(subject.requests.filter(path => path === asset.path).length, 1, 'Operators share each scene-owned part page.');
  }
  const requested = subject.requests.length;
  for (let frame = 0; frame < 12; frame++) {
    subject.engine.preparePlayerWeaponAssetsV125(); drawActor(subject); drawActor(subject, subject.engine.coop);
  }
  assert.equal(subject.requests.length, requested, 'Repeated actor rendering does not create another image request.');
  subject.engine.stop();
  assert.equal(subject.engine.playerAppearanceSnapshotV126().images.retained, 0);
  assert.equal(subject.actor.playerAppearanceVisualV126, null); assert.equal(subject.engine.coop.playerAppearanceVisualV126, null);
});
