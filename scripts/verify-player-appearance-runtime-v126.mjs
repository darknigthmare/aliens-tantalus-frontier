import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine } from '../src/game-production-runtime.js';
import { BioforgeRuntimeV80 } from '../src/bioforge-runtime-v80.js';
import { createBioforgeV80 } from '../src/bioforge-session-v80.js';
import { HubGame } from '../src/hub-opening-v88.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, EQUIPMENT, CREW, NEURO_XENO_PROFILES } from '../src/content.js';
import { attachCrewDeploymentV85 } from '../src/crew-runtime-v85.js';
import { resolveCombatAimV83 } from '../src/combat-aim-v83.js';
import { getCostumeV119 } from '../src/franchise-costumes-v119.js';
import { normalizePlayerAppearanceV126, PLAYER_APPEARANCE_SLOTS_V126 } from '../src/player-appearance-v126.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_BODY_RIG_ASSETS_V125 } from '../src/player-body-rig-v125.js';

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

test('real medical and sentry actions retain the selected pieces and restore them on completion', async () => {
  const sentry = EQUIPMENT.find(item => item.id === 'equipment-020-portable-sentry'); assert.ok(sentry);
  const subject = fixture({ equipment: [sentry], playerAppearanceV126: alternate() });
  await readyAppearance(subject);
  subject.actor.health = 30;
  subject.key('keydown', 'KeyH'); subject.key('keyup', 'KeyH');
  assert.equal(subject.engine.isFieldActionBusyV124(subject.actor), true);
  let action = drawActor(subject);
  assert.equal(action.supported, false); assert.equal(action.reason, 'authored-action');
  assert.deepEqual(action.selected, alternate());
  assert.equal(subject.drawing.draws.filter(draw => modularPaths.has(draw.source)).length, 0);
  advance(subject.engine, 2.3);
  assert.ok(subject.actor.health > 30); assert.equal(subject.engine.isFieldActionBusyV124(subject.actor), false);
  await readyAppearance(subject);
  assert.equal(subject.engine.useEquipment(sentry.id, subject.actor), true);
  assert.equal(subject.engine.confirmPlaceableV86(subject.actor), true);
  assert.equal(subject.engine.isPlaceableBusyV86(subject.actor), true);
  action = drawActor(subject); assert.equal(action.supported, false); assert.deepEqual(action.selected, alternate());
  assert.equal(subject.drawing.draws.filter(draw => modularPaths.has(draw.source)).length, 0);
  advance(subject.engine, 2.6);
  assert.equal(subject.engine.placeablesV86.instances[0].status, 'deployed');
  await readyAppearance(subject);
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
