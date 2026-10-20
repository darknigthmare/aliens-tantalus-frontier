import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine } from '../src/game-production-runtime.js';
import { BioforgeRuntimeV80 } from '../src/bioforge-runtime-v80.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, EQUIPMENT, CREW, NEURO_XENO_PROFILES } from '../src/content.js';
import { attachCrewDeploymentV85 } from '../src/crew-runtime-v85.js';
import { resolveCombatAimV83 } from '../src/combat-aim-v83.js';
import { getPlayerAimGuideV124 } from '../src/player-control-v124.js';
import { resolveWeaponVisualProfileV63 } from '../src/weapon-visual-runtime-v63.js';
import { getCostumeV119 } from '../src/franchise-costumes-v119.js';
import { getPlayerArmReachV160, getPlayerArmAxesV160,
  PLAYER_ARM_SHOULDER_LIMITS_V160 } from '../src/player-arm-constraints-v160.js';
import { resolveWeaponActionProfileV131 } from '../src/weapon-actions-v131.js';

// The shipped production engine owns all simulation and equipment changes.
// Only DOM, image loading and canvas drawing are replaced by observable hosts.
// Draw-call checks are integration evidence; raster appearance is reviewed by
// the separate browser script with real PNGs and real UI input.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const imageDimensions = new Map();
const ID = Object.freeze({ pistol: 'weapon-003-m4a3-service-pistol', rifle: 'weapon-001-m41a-pulse-rifle',
  pump: 'weapon-007-m37a2-pump-shotgun', vp70: 'weapon-004-vp70-combat-pistol' });
const RIGHT = resolveCombatAimV83({ x: 1, y: 0, facing: 1 });
const finitePoint = (point, label) => assert.ok(Number.isFinite(point?.x) && Number.isFinite(point?.y), `${label} must be a finite world point.`);
const near = (actual, expected, label, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) <= tolerance,
  `${label}: ${actual} differs from ${expected}.`);

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
    set src(value) { this._src = String(value); requests.push(this._src); if (!deferred) this.finish(); }
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

function equipPickup(fixture) {
  const { engine, actor } = fixture;
  Object.assign(engine.weaponPickup, { x: actor.x, y: actor.y, taken: false });
  assert.equal(engine.interact(actor), true, 'The actual field pickup must equip the selected catalogue weapon.');
  assert.equal(actor.weaponMode, 'rifle');
  advance(engine, 0.7);
}

async function readyPose(fixture, actor = fixture.actor, aim = RIGHT, options = {}) {
  const { engine } = fixture;
  assert.equal(typeof engine.resolvePlayerWeaponRigV125, 'function');
  assert.equal(typeof engine.resolvePlayerWeaponPoseV125, 'function');
  assert.equal(typeof engine.drawPlayerWeaponRigV125, 'function');
  let pose;
  for (let count = 0; count < 4; count++) {
    engine.resolvePlayerWeaponRigV125(actor, options);
    pose = engine.resolvePlayerWeaponPoseV125(actor, aim, options);
    await fixture.flush();
    if (pose) break;
  }
  assert.ok(pose, 'The registered body and equipped-weapon images must resolve a production pose.');
  finitePoint(pose.grip, 'grip'); finitePoint(pose.muzzle, 'muzzle');
  return pose;
}

function catalogueImage(id) {
  const item = WEAPONS.find(entry => entry.id === id); assert.ok(item, `Catalogue fixture ${id} must exist.`);
  return resolveWeaponVisualProfileV63(item).path;
}

function drawnSourcePoint(draw, pivot) {
  const { args, image, matrix: [a, b, c, d, e, f] } = draw;
  let x, y;
  if (args.length === 2) { x = args[0] + pivot.x * image.naturalWidth; y = args[1] + pivot.y * image.naturalHeight; }
  else if (args.length === 4) { x = args[0] + pivot.x * args[2]; y = args[1] + pivot.y * args[3]; }
  else {
    assert.equal(args.length, 8);
    x = args[4] + (pivot.x * image.naturalWidth - args[0]) / args[2] * args[6];
    y = args[5] + (pivot.y * image.naturalHeight - args[1]) / args[3] * args[7];
  }
  return { x: a * x + c * y + e, y: b * x + d * y + f };
}

function heldDraws(subject, actor = subject.actor) {
  subject.drawing.reset();
  subject.engine.drawActor(subject.drawing.ctx, actor);
  subject.drawing.assertBalanced();
  return subject.drawing.draws.filter(draw => /\/weapons\/|\/equipment\/|\/user-equipment-v95\//.test(draw.source || ''));
}

test('the production rig follows the selected deployment and a restored sidearm field pickup', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.pump) });
  const deployed = await readyPose(subject);
  assert.equal(deployed.profile.path, catalogueImage(ID.pump));
  assert.equal(subject.engine.weaponPickup.taken, true, 'A new deployment already carries its selected catalogue weapon.');
  // Older mission saves can still carry the base sidearm. This is a physical
  // fixture; the transition back to the selected gun uses the actual pickup.
  Object.assign(subject.actor, { weaponMode: 'sidearm', ammo: 12, magazineSize: 12 });
  advance(subject.engine, 1 / 120);
  const before = await readyPose(subject);
  assert.equal(before.profile.path, catalogueImage(ID.pistol));
  equipPickup(subject);
  const after = await readyPose(subject);
  assert.equal(after.profile.path, catalogueImage(ID.pump));
  assert.equal(subject.engine.weaponDescriptorV124(subject.actor).id, ID.pump);
  assert.notEqual(after.profile.path, before.profile.path);
  assert.equal(subject.actor.reloading, false);
});

test('a live draw submits the actual held weapon once and restores the canvas state', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.vp70) });
  equipPickup(subject);
  const pose = await readyPose(subject);
  subject.drawing.reset();
  subject.engine.drawActor(subject.drawing.ctx, subject.actor);
  const weaponDraws = subject.drawing.draws.filter(draw => draw.source === pose.profile.path);
  assert.equal(weaponDraws.length, 1, 'The equipped PNG must be drawn once on the actor.');
  const draw = weaponDraws[0];
  if (draw.args.length === 8) {
    assert.equal(draw.args[0], 0); assert.equal(draw.args[1], 0);
    assert.equal(draw.args[2], draw.image.naturalWidth); assert.equal(draw.args[3], draw.image.naturalHeight);
  } else assert.ok([2, 4].includes(draw.args.length), 'Native weapon art must use its full source canvas.');
  subject.drawing.assertBalanced();
});

test('deferred or broken images leave the new layer unavailable without changing combat state', async () => {
  for (const broken of [false, true]) {
    const subject = fixture({}, { holdImages: true });
    const { engine, actor } = subject;
    const before = { ammo: actor.ammo, reserve: actor.ammoReserve, shots: actor.shots, x: actor.x, y: actor.y };
    assert.equal(engine.resolvePlayerWeaponPoseV125(actor, RIGHT), null);
    if (broken) { subject.failImages(); await subject.flush(); assert.equal(engine.resolvePlayerWeaponPoseV125(actor, RIGHT), null); }
    assert.deepEqual({ ammo: actor.ammo, reserve: actor.ammoReserve, shots: actor.shots, x: actor.x, y: actor.y }, before);
    assert.ok(!engine.drawPlayerWeaponRigV125(subject.drawing.ctx, actor));
    subject.drawing.assertBalanced();
    if (!broken) { subject.releaseImages(); await subject.flush(); await readyPose(subject); }
  }
});

test('loading or failed body and weapon PNGs never change the production guide or accepted-shot origin', async () => {
  for (const pending of ['body', 'weapon']) for (const failed of [false, true]) {
    const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) }, { holdImages: true });
    const { engine, actor } = subject;
    const weaponPath = catalogueImage(ID.rifle);
    const affected = image => pending === 'body' ? image.src.includes('/rig-v125/') : image.src === weaponPath;
    // The standard scene is ready: only the optional held presentation is
    // deferred or broken, so actual gameplay admission stays enabled.
    for (const image of subject.images) if (!affected(image) || failed) image.finish(affected(image) && failed);
    await subject.flush();
    Object.assign(actor, { pointerAimV83: RIGHT, combatAimV83: RIGHT, aimingV124: true });
    assert.equal(engine.resolvePlayerWeaponPoseV125(actor, RIGHT), null);
    assert.equal(engine.drawPlayerWeaponRigV125(subject.drawing.ctx, actor), null);
    assert.ok(getPlayerAimGuideV124(engine, actor));
    assert.equal(engine.fire(actor), true, `${pending}/${failed}: the real shot is admitted without its PNGs.`);
    const first = engine.bullets.at(-1);
    const cold = engine.resolvePlayerMuzzleV124(actor, RIGHT);
    const coldGuide = getPlayerAimGuideV124(engine, actor);
    near(first.x, cold.x, 'Unavailable-image projectile x');
    near(first.y, cold.y, 'Unavailable-image projectile y');

    // Recover the same image requests without advancing time, actor posture or
    // aim. Recoil is the same accepted-shot observation for both queries.
    for (const image of subject.images) if (affected(image)) image.finish();
    subject.releaseImages(); await subject.flush();
    const warm = await readyPose(subject);
    near(cold.x, warm.muzzle.x, 'Readiness-independent shot x');
    near(cold.y, warm.muzzle.y, 'Readiness-independent shot y');
    const warmGuide = getPlayerAimGuideV124(engine, actor);
    near(warmGuide.x, coldGuide.x, 'Readiness-independent guide x');
    near(warmGuide.y, coldGuide.y, 'Readiness-independent guide y');
    near(warmGuide.endX, coldGuide.endX, 'Readiness-independent guide end x');
    near(warmGuide.endY, coldGuide.endY, 'Readiness-independent guide end y');
    actor.fireClock = 0;
    assert.equal(engine.fire(actor), true);
    const second = engine.bullets.at(-1);
    near(second.x, first.x, 'Loading/ready accepted-shot x');
    near(second.y, first.y, 'Loading/ready accepted-shot y');

    const guideAfter = getPlayerAimGuideV124(engine, actor);
    near(guideAfter.x, second.x, 'Ready guide uses the accepted shot x');
    near(guideAfter.y, second.y, 'Ready guide uses the accepted shot y');
    assert.equal(actor.ammo, actor.magazineSize - 2);
  }
});

test('each operator uses their own issued weapon and unarmed crew receive no held gun', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) });
  equipPickup(subject); subject.engine.setCoop(true);
  assert.equal(attachCrewDeploymentV85(subject.engine.coop, { ...CREW[1],
    gearV85: [{ instanceId: 'qa-bravo-pistol-v125', catalogId: ID.pistol, kind: 'weapon' }] }), true);
  const primary = await readyPose(subject), secondary = await readyPose(subject, subject.engine.coop);
  assert.equal(primary.profile.path, catalogueImage(ID.rifle)); assert.equal(secondary.profile.path, catalogueImage(ID.pistol));
  assert.equal(attachCrewDeploymentV85(subject.engine.coop, { ...CREW[1], gearV85: [] }), true);
  assert.equal(subject.engine.weaponProfile(subject.engine.coop).ammo, 0);
  assert.equal(subject.engine.resolvePlayerWeaponPoseV125(subject.engine.coop, RIGHT), null);
});

test('body posture and aim feed the same muzzle used by the guide and real projectile', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.vp70) });
  equipPickup(subject);
  for (const [label, posture, vector] of [
    ['standing-right', { vx: 0, crouching: false, grounded: true }, [1, 0]],
    ['moving-left', { vx: -155, crouching: false, grounded: true }, [-1, 0]],
    ['crouched-diagonal', { vx: 0, crouching: true, grounded: true }, [1, -1]],
    ['airborne-left', { vx: 0, vy: -100, crouching: false, grounded: false }, [-1, -1]]
  ]) {
    Object.assign(subject.actor, posture, { facing: vector[0] < 0 ? -1 : 1, aimingV124: true,
      fireClock: 0, v52FireClock: 0, reloading: false, tacticalReload: null });
    const aim = resolveCombatAimV83({ x: vector[0], y: vector[1], facing: subject.actor.facing });
    subject.actor.pointerAimV83 = { x: aim.x, y: aim.y };
    subject.actor.combatAimV83 = aim;
    const pose = await readyPose(subject, subject.actor, aim);
    const muzzle = subject.engine.resolvePlayerMuzzleV124(subject.actor, aim);
    near(muzzle.x, pose.muzzle.x, `${label} muzzle x`); near(muzzle.y, pose.muzzle.y, `${label} muzzle y`);
    const guide = getPlayerAimGuideV124(subject.engine, subject.actor); assert.ok(guide);
    near(guide.x, muzzle.x, `${label} guide x`); near(guide.y, muzzle.y, `${label} guide y`);
    const first = subject.engine.bullets.length;
    assert.equal(subject.engine.fire(subject.actor), true, label);
    const bullet = subject.engine.bullets.slice(first).find(entry => entry.owner === subject.actor); assert.ok(bullet, label);
    // The accepted-shot hook starts recoil before computing the physical tip.
    // Compare the same event/time, not the earlier ready-to-fire hand position.
    const shotPose = await readyPose(subject, subject.actor, aim);
    near(bullet.x, shotPose.muzzle.x, `${label} projectile x`); near(bullet.y, shotPose.muzzle.y, `${label} projectile y`);
    const light = subject.engine.weaponEffectsV124.lights.at(-1); assert.ok(light);
    near(light.x, bullet.x, `${label} light x`); near(light.y, bullet.y, `${label} light y`);
    finitePoint(shotPose.ejectionPort, `${label} ejection port`);
    const casing = subject.engine.weaponEffectsV124.casings.at(-1); assert.ok(casing);
    near(casing.x, shotPose.ejectionPort.x, `${label} case port x`, 1.01);
    near(casing.y, shotPose.ejectionPort.y, `${label} case port y`, 1.01);
  }
});

test('accepted shots and drawn hands share the final articulated locomotion body before rendering', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) });
  equipPickup(subject);
  subject.key('keydown', 'KeyD'); advance(subject.engine, .37); subject.key('keyup', 'KeyD');
  Object.assign(subject.actor, { aimingV124: true, pointerAimV83: RIGHT, combatAimV83: RIGHT });
  const before = await readyPose(subject);
  assert.ok(before.bodyRig.locomotionV129, 'Simulation resolves the final articulated body before any canvas draw.');
  const render = subject.engine.drawPlayerWeaponRigV125(subject.drawing.ctx, subject.actor);
  assert.ok(render?.drawn);
  assert.deepEqual(render.bodyRig.shoulders, before.bodyRig.shoulders);
  assert.deepEqual(render.bodyRig.matrix, before.bodyRig.matrix);
  assert.deepEqual(render.bodyRig.locomotionV129.alignmentV142, before.bodyRig.locomotionV129.alignmentV142);
  near(render.arms.near.hand.x, before.grip.x, 'drawn trigger hand x');
  near(render.arms.near.hand.y, before.grip.y, 'drawn trigger hand y');
  assert.equal(subject.engine.fire(subject.actor), true);
  const after = await readyPose(subject), bullet = subject.engine.bullets.at(-1);
  near(bullet.x, after.muzzle.x, 'articulated accepted-shot muzzle x');
  near(bullet.y, after.muzzle.y, 'articulated accepted-shot muzzle y');
  const guide = getPlayerAimGuideV124(subject.engine, subject.actor);
  near(guide.x, after.muzzle.x, 'articulated guide muzzle x');
  near(guide.y, after.muzzle.y, 'articulated guide muzzle y');
  subject.drawing.assertBalanced();
});

test('the native left-facing weapon maps its photographed grip and muzzle to the rendered world pose', async () => {
  const weapon = WEAPONS.find(item => [-1, 'left'].includes(resolveWeaponVisualProfileV63(item)?.sourceFacing));
  assert.ok(weapon, 'The catalogue contains a reviewed native weapon facing left.');
  const subject = fixture({ weapon }); equipPickup(subject);
  for (const [x, y] of [[1, 0], [-1, -1]]) {
    const aim = resolveCombatAimV83({ x, y, facing: x });
    Object.assign(subject.actor, { facing: aim.facing, combatAimV83: aim, pointerAimV83: aim, aimingV124: true });
    const pose = await readyPose(subject, subject.actor, aim);
    const draw = heldDraws(subject).find(entry => entry.source === pose.profile.path); assert.ok(draw);
    const grip = drawnSourcePoint(draw, pose.profile.gripPivot), muzzle = drawnSourcePoint(draw, pose.profile.muzzlePivot);
    near(grip.x, pose.grip.x, 'Native image grip x'); near(grip.y, pose.grip.y, 'Native image grip y');
    near(muzzle.x, pose.muzzle.x, 'Native image muzzle x'); near(muzzle.y, pose.muzzle.y, 'Native image muzzle y');
  }
});

test('actual medical work and deployable installation release the weapon and return to the equipped gun', async () => {
  const sentry = EQUIPMENT.find(item => item.id === 'equipment-020-portable-sentry'); assert.ok(sentry);
  const subject = fixture({ equipment: [sentry] });
  const pose = await readyPose(subject);
  assert.equal(heldDraws(subject).filter(draw => draw.source === pose.profile.path).length, 1);
  subject.actor.health = 30;
  subject.key('keydown', 'KeyH'); subject.key('keyup', 'KeyH');
  assert.equal(subject.engine.isFieldActionBusyV124(subject.actor), true);
  assert.equal(heldDraws(subject).filter(draw => draw.source === pose.profile.path).length, 0);
  advance(subject.engine, 2.3);
  assert.ok(subject.actor.health > 30); assert.equal(subject.engine.isFieldActionBusyV124(subject.actor), false);
  assert.equal(heldDraws(subject).filter(draw => draw.source === pose.profile.path).length, 1);
  assert.equal(subject.engine.useEquipment(sentry.id, subject.actor), true);
  assert.equal(subject.engine.confirmPlaceableV86(subject.actor), true);
  assert.equal(subject.engine.isPlaceableBusyV86(subject.actor), true);
  assert.equal(heldDraws(subject).filter(draw => draw.source === pose.profile.path).length, 0);
  advance(subject.engine, 2.6);
  assert.equal(subject.engine.placeablesV86.instances[0].status, 'deployed');
  assert.equal(heldDraws(subject).filter(draw => draw.source === pose.profile.path).length, 1);
});

test('reload presentation advances with real simulation, freezes on pause, and clears on a weapon pickup', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.pump) });
  await readyPose(subject);
  assert.equal(subject.engine.fire(subject.actor), true); advance(subject.engine, 0.3);
  subject.key('keydown', 'KeyR'); subject.key('keyup', 'KeyR');
  assert.equal(subject.actor.reloading, true);
  advance(subject.engine, 0.5);
  const loading = await readyPose(subject);
  assert.ok(loading.reloadProgress > 0 && loading.reloadProgress < 1);
  subject.engine.togglePause(); advance(subject.engine, 2);
  const paused = await readyPose(subject);
  near(paused.reloadProgress, loading.reloadProgress, 'Paused reload presentation');
  near(paused.grip.x, loading.grip.x, 'Paused weapon grip x'); near(paused.grip.y, loading.grip.y, 'Paused weapon grip y');
  subject.engine.togglePause(); equipPickup(subject);
  const changed = await readyPose(subject);
  assert.equal(changed.profile.path, catalogueImage(ID.pump)); assert.equal(subject.actor.reloading, false);
  assert.equal(changed.reloadProgress, 0);
});

test('a long held barrel still stops at a thin wall for the actual guide and shot', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) }); equipPickup(subject);
  Object.assign(subject.actor, { aimingV124: true, combatAimV83: RIGHT, pointerAimV83: RIGHT });
  const pose = await readyPose(subject);
  const wallX = pose.muzzle.pivotX + (pose.muzzle.x - pose.muzzle.pivotX) * .97;
  assert.ok(Number.isFinite(wallX));
  subject.engine.walls = [{ id: 'held-rifle-wall', x: wallX, y: subject.actor.y - 100, w: 3, h: subject.actor.h + 200 }];
  const guide = getPlayerAimGuideV124(subject.engine, subject.actor); assert.ok(guide?.blocked);
  assert.ok(guide.x < wallX);
  assert.equal(subject.engine.fire(subject.actor), true);
  const bullet = subject.engine.bullets.at(-1);
  const shotGuide = getPlayerAimGuideV124(subject.engine, subject.actor);
  assert.ok(shotGuide.blocked); assert.ok(bullet.x < wallX);
  near(bullet.x, shotGuide.x, 'Blocked guide/projectile x'); near(bullet.y, shotGuide.y, 'Blocked guide/projectile y');
  subject.engine.updateBullets(1 / 60);
  assert.ok(bullet.hit || !subject.engine.bullets.includes(bullet), 'The projectile must hit, not spawn behind the wall.');
});

test('obstacle retraction preserves both actual arm envelopes and one rigid source in all aim sectors', async () => {
  for (let sector = 0; sector < 8; sector++) {
    const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) }); equipPickup(subject);
    const angle = sector * Math.PI / 4, x = Math.cos(angle), y = Math.sin(angle);
    const aim = resolveCombatAimV83({ x, y, facing: x < -.1 ? -1 : 1 });
    Object.assign(subject.actor, { facing: aim.facing, aimingV124: true, combatAimV83: aim, pointerAimV83: aim });
    const initial = await readyPose(subject, subject.actor, aim);
    const shoulder = initial.bodyRig.shoulders.near;
    if (Math.abs(x) > Math.abs(y)) {
      const edge = shoulder.x + (initial.muzzle.x - shoulder.x) * .65;
      subject.engine.walls = [{ x: x > 0 ? edge : edge - 4, y: shoulder.y - 300, w: 4, h: 600 }];
    } else {
      const edge = shoulder.y + (initial.muzzle.y - shoulder.y) * .65;
      subject.engine.walls = [{ x: shoulder.x - 300, y: y > 0 ? edge : edge - 4, w: 600, h: 4 }];
    }
    const held = await readyPose(subject, subject.actor, aim);
    assert.equal(held.armReachV160.feasible, true, `sector${sector}`);
    assert.equal(held.armReachV160.obstacleConstrained, true, `sector${sector}`);
    const render = subject.engine.drawPlayerWeaponRigV125(subject.drawing.ctx, subject.actor);
    assert.ok(render?.drawn, `sector${sector}`);
    for (const side of ['near', 'far']) {
      const arm = render.arms[side], reach = getPlayerArmReachV160(held.bodyRig.armLengths[side]);
      assert.ok(arm.reachError < 1e-6, `sector${sector} ${side} hand contact`);
      assert.ok(arm.requestedDistance >= reach.min - 1e-6 && arm.requestedDistance <= reach.max + 1e-6,
        `sector${sector} ${side} anatomical elbow envelope`);
      const axes = getPlayerArmAxesV160(held.bodyRig.torsoAxisV160, held.bodyRig.facing);
      const upper = { x: arm.elbow.x - arm.shoulder.x, y: arm.elbow.y - arm.shoulder.y };
      const shoulderAngle = Math.atan2(upper.x * axes.down.x + upper.y * axes.down.y,
        upper.x * axes.forward.x + upper.y * axes.forward.y) * 180 / Math.PI;
      assert.ok(shoulderAngle >= PLAYER_ARM_SHOULDER_LIMITS_V160.minDegrees - 1e-6
        && shoulderAngle <= PLAYER_ARM_SHOULDER_LIMITS_V160.maxDegrees + 1e-6,
        `sector${sector} ${side} actual shoulder angle ${shoulderAngle}`);
      near(subject.actor.heldWeaponVisualV125.armJointAnglesV160[side].shoulderDegrees, shoulderAngle,
        `sector${sector} ${side} observation measures actual drawn arm`);
    }
    const guide = getPlayerAimGuideV124(subject.engine, subject.actor);
    assert.ok(guide.blocked); near(guide.x, held.muzzle.x, `sector${sector} guide x`);
    near(guide.y, held.muzzle.y, `sector${sector} guide y`);
    const determinant = held.matrix.a * held.matrix.d - held.matrix.b * held.matrix.c;
    near(Math.abs(determinant), held.scale ** 2, `sector${sector} rigid weapon scale`);
  }
});

test('reloading against a real wall keeps the service hand on the body pouch while the receiver retracts', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) }); equipPickup(subject);
  Object.assign(subject.actor, { aimingV124: true, combatAimV83: RIGHT, pointerAimV83: RIGHT });
  await readyPose(subject);
  assert.equal(subject.engine.fire(subject.actor), true);
  advance(subject.engine, .3);
  assert.equal(subject.engine.reload(subject.actor), true);
  const duration = subject.actor.tacticalReload.completeAt;
  advance(subject.engine, duration * .53 + 1e-6);
  const unconstrained = await readyPose(subject);
  const wallX = subject.actor.x + subject.actor.w + 4;
  assert.ok(unconstrained.muzzle.x > wallX, 'A physical wall outside the actor intersects its carried barrel.');
  subject.engine.walls = [{ x: wallX, y: subject.actor.y - 200, w: 5, h: subject.actor.h + 400 }];
  const held = await readyPose(subject);
  assert.equal(held.reloadPhase, 'insert');
  assert.equal(held.armReachV160.feasible, true);
  assert.ok(Math.hypot(held.translation.x, held.translation.y) > 1);
  near(held.serviceHand.x, held.bodyRig.pouch.x, 'service hand stays on anatomical pouch x', 1e-6);
  near(held.serviceHand.y, held.bodyRig.pouch.y, 'service hand stays on anatomical pouch y', 1e-6);
  assert.ok(held.muzzle.x < wallX, 'No round originates beyond the wall face.');
  const render = subject.engine.drawPlayerWeaponRigV125(subject.drawing.ctx, subject.actor);
  assert.ok(render?.drawn);
  near(render.arms.far.hand.x, held.serviceHand.x, 'actual service hand x');
  near(render.arms.far.hand.y, held.serviceHand.y, 'actual service hand y');
  assert.ok(render.arms.far.reachError < 1e-6);
});

test('a close wall withdraws the rigid rifle continuously with both hands attached and refuses the shot', async () => {
  for (const facing of [1, -1]) {
    const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) }); equipPickup(subject);
    const aim = resolveCombatAimV83({ x: facing, y: 1, facing });
    Object.assign(subject.actor, { facing, aimingV124: true, pointerAimV83: aim, combatAimV83: aim });
    const first = await readyPose(subject, subject.actor, aim), shoulder = first.bodyRig.shoulders.near;
    let previous = null, withdrew = false;
    for (let step = 0; step <= 230; step++) {
      const edge = shoulder.x + facing * (40 - step * .1);
      subject.engine.walls = [{ x: facing > 0 ? edge : edge - 4, y: shoulder.y - 300, w: 4, h: 600 }];
      const held = subject.engine.resolvePlayerWeaponPoseV125(subject.actor, aim, { requireReady: false });
      assert.equal(held.armReachV160.feasible, true);
      assert.equal(held.armBendsV160.far, 1, 'No phase or facing branch flip.');
      if (previous) assert.ok(Math.hypot(held.grip.x - previous.grip.x, held.grip.y - previous.grip.y) < 1,
        'A subpixel obstacle change cannot teleport the weapon to another arm pocket.');
      if (held.weaponWithdrawalV160?.active) {
        withdrew = true;
        assert.ok(facing > 0 ? held.visibleBounds.right < edge : held.visibleBounds.left > edge,
          'The entire transformed alpha rectangle stays in front of the wall.');
        const rendered = subject.engine.drawPlayerWeaponRigV125(subject.drawing.ctx, subject.actor);
        assert.ok(rendered.arms.near.reachError < 1e-6 && rendered.arms.far.reachError < 1e-6);
      }
      previous = held;
    }
    assert.equal(withdrew, true);
    const ammo = subject.actor.ammo, shots = subject.actor.shots, bullets = subject.engine.bullets.length;
    assert.equal(subject.engine.fire(subject.actor), false);
    assert.equal(subject.actor.ammo, ammo); assert.equal(subject.actor.shots, shots);
    assert.equal(subject.engine.bullets.length, bullets);
    subject.engine.walls = [];
    assert.equal(subject.engine.fire(subject.actor), true, 'Moving away restores the requested firing direction.');
  }
});

test('shot admission previews the accepted torso and cosmetic hurt transition without actor or image mutation', async () => {
  for (const hurt of [false, true]) {
    const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) }); equipPickup(subject);
    subject.engine.animationTime = 1;
    Object.assign(subject.actor, { aimingV124: false, pointerAimV83: RIGHT, combatAimV83: RIGHT,
      v52HurtClock: hurt ? .2 : 0, shockClock: 0,
      weaponRigMotionV125: { ...subject.actor.weaponRigMotionV125, shotAt: -Infinity, time: 1 } });
    subject.engine.walls = [{ x: 215, y: 540, w: 4, h: 600 }];
    const originalActor = structuredClone(subject.actor);
    const originalImages = [...subject.engine.images.entries()];
    const originalCache = subject.engine.weaponImageCacheV125.snapshot();
    const before = subject.engine.resolvePlayerWeaponPoseV125(subject.actor, RIGHT, { requireReady: false });
    const accepted = subject.engine.resolvePlayerWeaponPoseV125(subject.actor, RIGHT,
      { requireReady: false, shotPreviewV160: true });
    if (hurt) assert.equal(before, null); else {
      assert.equal(before.armReachV160.feasible, true);
      assert.equal(before.weaponWithdrawalV160, undefined, 'The pre-shot idle pose alone would have admitted this shot.');
    }
    assert.equal(accepted.bodyRig.atlas, 'combat');
    assert.equal(accepted.weaponWithdrawalV160.active, true);
    assert.equal(subject.engine.fire(subject.actor), false);
    assert.deepEqual(subject.actor, originalActor, 'A refused transaction leaves all actor/action clocks intact.');
    assert.deepEqual([...subject.engine.images.entries()], originalImages);
    assert.deepEqual(subject.engine.weaponImageCacheV125.snapshot(), originalCache,
      'The admission query does not acquire, retain, evict or reorder images.');
  }
});

test('a newly obstructed delayed charge or burst cannot commit a round or consume its pending resources', async () => {
  for (const name of ['Compound Bow', '4C2 Astra']) {
    const weapon = WEAPONS.find(item => item.name === name);
    const subject = fixture({ weapon }); equipPickup(subject);
    Object.assign(subject.actor, { aimingV124: true, pointerAimV83: RIGHT, combatAimV83: RIGHT });
    await readyPose(subject);
    const profile = resolveWeaponActionProfileV131(weapon);
    assert.equal(subject.engine.fire(subject.actor), true);
    assert.equal(subject.engine.weaponCyclesV131.has(subject.actor), true);
    const held = subject.engine.resolvePlayerWeaponPoseV125(subject.actor, RIGHT, { requireReady: false });
    const edge = held.bodyRig.shoulders.near.x + 20;
    subject.engine.walls = [{ x: edge, y: 540, w: 4, h: 600 }];
    assert.equal(subject.engine.playerWeaponFireBlockedV160(subject.actor, RIGHT), true);
    const ammo = subject.actor.ammo, reserve = subject.actor.ammoReserve, shots = subject.actor.shots;
    const acceptedShots = subject.engine.weaponEffectsV124.stats.acceptedShots;
    subject.engine.updateBullets((profile.charge || profile.spacing) + .02);
    assert.equal(subject.actor.ammo, ammo); assert.equal(subject.actor.ammoReserve, reserve);
    assert.equal(subject.actor.shots, shots);
    assert.equal(subject.engine.weaponEffectsV124.stats.acceptedShots, acceptedShots);
    assert.equal(subject.engine.weaponCyclesV131.has(subject.actor), false);
  }
});

for (const name of ['Compound Bow', '4C2 Astra']) test(`left-facing ${name} commits its real delayed rounds with the stored x/y aim`, async () => {
  const weapon = WEAPONS.find(item => item.name === name);
  const subject = fixture({ weapon }); equipPickup(subject);
  const aim = resolveCombatAimV83({ x: -1, y: 0, facing: -1 });
  Object.assign(subject.actor, { x: 800, facing: -1, aimingV124: true, pointerAimV83: aim, combatAimV83: aim,
    vx: name === 'Compound Bow' ? -155 : 0 });
  await readyPose(subject, subject.actor, aim);
  if (name === 'Compound Bow') {
    // The collider is wholly outside the moving operator. Its real left-facing
    // arms can hold the short bow here; a right-facing preview rejects it.
    const held = subject.engine.resolvePlayerWeaponPoseV125(subject.actor, aim,
      { requireReady: false, shotPreviewV160: true });
    const edge = held.bodyRig.shoulders.near.x - 30;
    assert.ok(edge < subject.actor.x);
    subject.engine.walls = [{ x: edge - 4, y: 540, w: 4, h: 600 }];
    assert.equal(subject.engine.playerWeaponFireBlockedV160(subject.actor, aim), false);
  }
  const profile = resolveWeaponActionProfileV131(weapon);
  const ammo = subject.actor.ammo, shots = subject.actor.shots;
  const acceptedShots = subject.engine.weaponEffectsV124.stats.acceptedShots;
  assert.equal(subject.engine.fire(subject.actor), true);
  const cycle = subject.engine.weaponCyclesV131.get(subject.actor);
  assert.ok(cycle, 'The native trigger must create the real charge or burst cycle.');
  assert.deepEqual(cycle.aim, { x: -1, y: 0 }, 'Deferred rounds deliberately store direction without a facing field.');
  subject.engine.updateBullets((profile.charge || profile.spacing * (profile.rounds - 1)) + .02);
  const rounds = profile.rounds || 1;
  assert.equal(subject.actor.ammo, ammo - rounds, 'Every accepted deferred round spends its own cartridge.');
  assert.equal(subject.actor.shots, shots + rounds);
  assert.equal(subject.engine.weaponEffectsV124.stats.acceptedShots, acceptedShots + rounds);
  assert.equal(subject.engine.weaponCyclesV131.has(subject.actor), false);
  assert.equal(subject.actor.facing, -1);
  const deferredPose = subject.engine.resolvePlayerWeaponPoseV125(subject.actor, cycle.aim,
    { requireReady: false, shotPreviewV160: true });
  assert.equal(deferredPose.bodyRig.facing, -1, 'Admission must use the same body side as the stored firing direction.');
  if (name === 'Compound Bow') {
    const recovered = subject.engine.recoverableWeaponsV131;
    assert.equal(recovered.length, 1, 'The actual charged arrow reaches the first left-side wall.');
    assert.equal(recovered[0].owner, subject.actor);
    assert.equal(recovered[0].weaponId, weapon.id);
    near(recovered[0].x, subject.engine.walls[0].x + subject.engine.walls[0].w, 'arrow impact on the near wall face');
  } else assert.equal(subject.engine.weaponProjectilesV131.length, rounds);
  for (const projectile of subject.engine.weaponProjectilesV131) {
    assert.equal(projectile.owner, subject.actor);
    assert.ok(projectile.vx < 0, 'The actual deferred projectile must travel to the left.');
    assert.ok(projectile.sourceX < subject.actor.x + subject.actor.w / 2,
      'Its accepted muzzle stays on the left-facing body side.');
  }
});

test('supplied shot aims derive only missing facing and preserve vertical actor facing without mutation', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) }); equipPickup(subject);
  for (const actorFacing of [-1, 1]) {
    subject.actor.facing = actorFacing;
    for (const [x, y, explicitFacing, expected] of [
      [-1, 0, undefined, -1], [1, 0, undefined, 1],
      [0, -1, undefined, actorFacing], [1e-10, 1, undefined, actorFacing],
      [-1, 0, 1, 1]
    ]) {
      const aim = Object.freeze({ x, y, ...(explicitFacing === undefined ? {} : { facing: explicitFacing }), source: 'deferred-test' });
      const original = structuredClone(subject.actor);
      const projected = subject.engine.previewPlayerWeaponInputV160(subject.actor, aim).aim;
      assert.deepEqual(projected, { ...aim, facing: expected });
      assert.deepEqual(subject.actor, original);
      assert.equal(Object.hasOwn(aim, 'facing'), explicitFacing !== undefined);
    }
  }
});

test('the pure accepted-shot preview matches the real input, cover, injury and recoil chain in every body stance', async () => {
  for (const mode of ['standing', 'crouched', 'covered', 'hurt', 'moving']) {
    const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) }); equipPickup(subject);
    subject.engine.animationTime = 1;
    Object.assign(subject.actor, { aimingV124: false, pointerAimV83: RIGHT, combatAimV83: RIGHT,
      crouching: ['crouched', 'covered'].includes(mode), v52HurtClock: mode === 'hurt' ? .2 : 0,
      vx: mode === 'moving' ? 80 : 0, shockClock: 0,
      weaponRigMotionV125: { ...subject.actor.weaponRigMotionV125, shotAt: -Infinity, time: 1 } });
    if (mode === 'covered') {
      subject.engine.covers = [{ id: 'preview-cover', x: 208, y: 867, w: 60, h: 63 }];
      subject.engine.refreshPlayerCoverV124(subject.actor, { fire: false });
      assert.equal(subject.actor.coverV124.peeking, false);
    }
    const original = structuredClone(subject.actor);
    const preview = subject.engine.resolvePlayerWeaponPoseV125(subject.actor, RIGHT,
      { requireReady: false, shotPreviewV160: true });
    assert.deepEqual(subject.actor, original, `${mode} preview is pure`);
    const actualAim = subject.engine.resolvePlayerCombatAimV83(subject.actor);
    subject.engine.refreshPlayerCoverV124(subject.actor, { fire: true });
    subject.engine.beginPlayerWeaponShotV125(subject.actor);
    const actual = subject.engine.resolvePlayerWeaponPoseV125(subject.actor, actualAim, { requireReady: false });
    for (const key of ['matrix', 'grip', 'support', 'muzzle', 'armReachV160', 'weaponWithdrawalV160'])
      assert.deepEqual(preview[key], actual[key], `${mode} authoritative ${key}`);
    assert.deepEqual(preview.bodyRig.shoulders, actual.bodyRig.shoulders, `${mode} authoritative shoulders`);
    if (mode === 'covered') {
      assert.equal(subject.actor.coverV124.peeking, true);
      assert.equal(preview.weaponWithdrawalV160.active, true);
    }
  }
});

test('a held pointer is reprojected for admission without changing actor or captured gameplay keys', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.rifle) }); equipPickup(subject);
  const event = new Event('pointerdown', { cancelable: true });
  Object.assign(event, { pointerId: 47, pointerType: 'mouse', button: 2, buttons: 2, clientX: 700, clientY: 300 });
  subject.canvas.dispatchEvent(event);
  subject.engine.camera.x += 55; subject.engine.camera.y += 12;
  const original = structuredClone(subject.actor), keys = [...subject.engine.keys];
  const preview = subject.engine.previewPlayerWeaponInputV160(subject.actor);
  assert.deepEqual(subject.actor, original); assert.deepEqual([...subject.engine.keys], keys);
  const actual = subject.engine.resolvePlayerCombatAimV83(subject.actor);
  assert.deepEqual(preview.aim, actual);
  assert.equal(preview.aiming, subject.actor.aimingV124);
});

test('Neuro, climbing, vent travel and downed postures never receive a catalogue weapon overlay', async () => {
  const subject = fixture(); await readyPose(subject);
  for (const status of [{ climbing: true }, { ventTransit: { active: true } }, { downed: true, bleedOut: 10 }]) {
    Object.assign(subject.actor, { climbing: false, ventTransit: null, downed: false, bleedOut: 0 }, status);
    const render = subject.engine.drawPlayerWeaponRigV125(subject.drawing.ctx, subject.actor);
    if (render) {
      assert.equal(render.transitV128?.kind, 'downed', 'Only the new unarmed casualty composition may replace the native body.');
      assert.equal(render.transitV128.firing, false);
    }
    assert.equal(subject.engine.resolvePlayerWeaponPoseV125(subject.actor, RIGHT), null);
    assert.equal(subject.actor.heldWeaponVisualV125, null);
    assert.equal(heldDraws(subject).length, 0);
  }
  const neuroProfile = NEURO_XENO_PROFILES.find(item => item.playerClassCompatible); assert.ok(neuroProfile);
  const neuro = fixture({ neuroProfile }); await neuro.flush();
  assert.equal(neuro.engine.resolvePlayerWeaponPoseV125(neuro.actor, RIGHT), null);
  assert.equal(heldDraws(neuro).length, 0);
});

test('V95 keeps its own held image and Nostromo keeps its dedicated body sampling', async () => {
  const custom = fixture({ userEquipmentV95: { weaponId: 'item-v95-user-engineer-bone-gun' } });
  await custom.flush();
  const customDraws = heldDraws(custom);
  assert.equal(customDraws.filter(draw => draw.source?.endsWith('/engineer-bone-gun.png')).length, 1);
  assert.equal(customDraws.filter(draw => draw.source === catalogueImage(ID.pistol)).length, 0);
  const costume = getCostumeV119('franchise-nostromo-crew'); assert.ok(costume);
  const dressed = fixture({ costume });
  // The real draw requests this costume's five images on demand.
  dressed.engine.drawActor(dressed.drawing.ctx, dressed.actor); await dressed.flush();
  dressed.drawing.reset(); dressed.engine.drawActor(dressed.drawing.ctx, dressed.actor);
  assert.equal(dressed.actor.playerVisualV81?.skinId, 'player.nostromo-crew-v119');
  const bodyDraw = dressed.drawing.draws.find(draw => draw.source?.includes('/costumes-v119/nostromo-crew/'));
  assert.ok(bodyDraw, 'The dedicated outfit body must not be replaced by an Echo9 layer.');
  assert.equal(bodyDraw.image.naturalWidth, 1254); assert.equal(bodyDraw.image.naturalHeight, 1254);
  assert.equal(bodyDraw.args.length, 8, 'The dedicated costume uses its measured individual source rectangle.');
  assert.notEqual(bodyDraw.args[2], 1254 / 4, 'Nostromo is not a uniform nominal 4x4 atlas.');
});

test('Bioforge draws its own surface and emits from that same held pose without campaign state', async () => {
  const host = browserHost();
  const engine = new BioforgeRuntimeV80(host.canvas, { autoLoop: false });
  const started = engine.start({ profileId: 'enemy-004-drone-big-chap', quantity: 1, autoLoop: false });
  assert.equal(started.started, true);
  const subject = { ...host, engine, actor: engine.player };
  const pose = await readyPose(subject, subject.actor, RIGHT, { surface: 'bioforge' });
  assert.equal(pose.profile.path, catalogueImage(ID.pistol));
  subject.drawing.reset(); engine.drawBioforgePlayerV80(subject.drawing.ctx);
  assert.equal(subject.drawing.draws.filter(draw => draw.source === pose.profile.path).length, 1);
  subject.drawing.assertBalanced();
  engine.bioforgeRootV80.activeSession.phase = 'combat';
  subject.actor.gamepadAimV83 = { x: 1, y: 0 };
  const muzzle = engine.resolvePlayerMuzzleV124(subject.actor, RIGHT);
  near(muzzle.x, pose.muzzle.x, 'Bioforge muzzle x'); near(muzzle.y, pose.muzzle.y, 'Bioforge muzzle y');
  assert.equal(engine.fire(subject.actor), true);
  const bullet = engine.bullets.at(-1), light = engine.weaponEffectsV124.lights.at(-1);
  const shotPose = await readyPose(subject, subject.actor, RIGHT, { surface: 'bioforge' });
  near(bullet.x, shotPose.muzzle.x, 'Bioforge projectile x'); near(bullet.y, shotPose.muzzle.y, 'Bioforge projectile y');
  near(light.x, bullet.x, 'Bioforge light x'); near(light.y, bullet.y, 'Bioforge light y');
});

test('a short live flash follows the carried muzzle while its accepted projectile keeps moving', async () => {
  const subject = fixture();
  Object.assign(subject.actor, { aimingV124: true, combatAimV83: RIGHT, pointerAimV83: RIGHT });
  await readyPose(subject);
  assert.equal(subject.engine.fire(subject.actor), true);
  const bullet = subject.engine.bullets.at(-1), light = subject.engine.weaponEffectsV124.lights.at(-1);
  const origin = { x: bullet.x, y: bullet.y }, bornAt = light.bornAt;
  subject.key('keydown', 'KeyD'); advance(subject.engine, 1 / 120); subject.key('keyup', 'KeyD');
  const pose = await readyPose(subject);
  assert.ok(subject.engine.weaponEffectsV124.lights.includes(light), 'The flash is still within its lifetime.');
  near(light.x, pose.muzzle.x, 'Following flash x'); near(light.y, pose.muzzle.y, 'Following flash y');
  assert.equal(light.bornAt, bornAt, 'Following the operator must not restart a flash.');
  assert.ok(bullet.x > origin.x, 'The accepted projectile continues its independent physical flight.');
});

test('the first hip shot chooses its held combat pose before the accepted muzzle is emitted', async () => {
  const subject = fixture({ weapon: WEAPONS.find(item => item.id === ID.vp70) });
  await readyPose(subject);
  assert.equal(Boolean(subject.actor.aimingV124), false);
  assert.equal(subject.actor.v52FireClock || 0, 0);
  assert.equal(subject.actor.shots, 0);
  assert.equal(subject.engine.fire(subject.actor), true);
  const bullet = subject.engine.bullets.at(-1), pose = await readyPose(subject);
  near(bullet.x, pose.muzzle.x, 'First hip-shot projectile x');
  near(bullet.y, pose.muzzle.y, 'First hip-shot projectile y');
  subject.engine.drawActor(subject.drawing.ctx, subject.actor);
  const rendered = subject.actor.heldWeaponVisualV125;
  assert.ok(rendered);
  near(rendered.muzzle.x, bullet.x, 'First hip-shot drawn muzzle x');
  near(rendered.muzzle.y, bullet.y, 'First hip-shot drawn muzzle y');
  near(rendered.nearHand.x, rendered.grip.x, 'First hip-shot hand/grip x');
  near(rendered.nearHand.y, rendered.grip.y, 'First hip-shot hand/grip y');
});
