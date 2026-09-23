import test from 'node:test';
import assert from 'node:assert/strict';
import { BioforgeRuntimeV80 } from '../src/bioforge-runtime-v80.js';
import { COMBAT_AIM_DIRECTIONS_V83, resolveCombatMuzzleV83 } from '../src/combat-aim-v83.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);
const shotHealth = enemy => enemy.maxHealth - Math.max(1, 28 - enemy.armor * .35);

class EventTargetFixture {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(callback);
  }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  emit(type, event = {}) { for (const callback of [...(this.listeners.get(type) || [])]) callback(event); }
}

function fixture(t, quantity = 1) {
  const events = [], pads = [], globals = new EventTargetFixture();
  const document = Object.assign(new EventTargetFixture(), {
    hidden: false, activeElement: null, focused: true, hasFocus() { return this.focused; }
  });
  const noop = () => {};
  const context = new Proxy({
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    measureText: text => ({ width: String(text).length * 8 }),
    globalAlpha: 1
  }, { get: (target, key) => key in target ? target[key] : noop });
  const canvas = Object.assign(new EventTargetFixture(), {
    width: 1280, height: 720, captures: new Set(),
    getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    focus() { document.activeElement = canvas; },
    setPointerCapture(id) { this.captures.add(id); },
    hasPointerCapture(id) { return this.captures.has(id); },
    releasePointerCapture(id) {
      if (this.captures.delete(id)) this.emit('lostpointercapture', { pointerId: id });
    }
  });
  class TestImage {
    constructor() {
      this.complete = true;
      this.naturalWidth = this.width = 1600;
      this.naturalHeight = this.height = 900;
    }
    set src(value) {
      this.currentSrc = value;
      if (value.includes('/echo9-marine-') && value.endsWith('-sheet.png')) {
        this.naturalWidth = this.naturalHeight = this.width = this.height = 1024;
      }
    }
    get src() { return this.currentSrc; }
  }
  const replacements = {
    document, Image: TestImage, requestAnimationFrame: () => 1,
    navigator: { getGamepads: () => pads },
    addEventListener: globals.addEventListener.bind(globals),
    removeEventListener: globals.removeEventListener.bind(globals)
  };
  const previous = new Map(Object.keys(replacements).map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const [name, value] of Object.entries(replacements)) Object.defineProperty(globalThis, name, { configurable: true, value });
  let clock = 1000;
  const engine = new BioforgeRuntimeV80(canvas, {
    assets: {}, testMode: true, autoLoop: false,
    now: () => { clock += 100; return clock; }, onEvent: event => events.push(event)
  });
  t.after(() => {
    engine.stop();
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  canvas.focus();
  engine.start({ configuration: { profileId: 'enemy-002-facehugger', quantity }, assets: {}, autoLoop: false, testMode: true });

  // Exercise the real configuration, double airlock, printer and sealing lifecycle.
  const control = engine.doors.find(({ id }) => id === 'control-seal');
  const inner = engine.doors.find(({ id }) => id === 'inner-interlock');
  const printer = engine.bioforgeLevelV80.stations.find(({ type }) => type === 'printer');
  Object.assign(engine.player, { x: control.x - engine.player.w - 10, y: 528 });
  assert.equal(engine.interact(), true);
  Object.assign(engine.player, { x: inner.x - engine.player.w - 45, y: 528 });
  assert.equal(engine.interact(), true);
  Object.assign(engine.player, { x: printer.x - 20, y: 528 });
  assert.equal(engine.interact(), true);
  Object.assign(engine.player, { x: engine.bioforgeLevelV80.arenaBounds.x + 8, y: 528, vx: 0, vy: 0, grounded: true });
  engine.update(0.016);
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'sealing');
  assert.equal(engine.getBioforgeQaHooksV80().advance().event.type, 'bioforge-printer-ready');
  for (let index = 0; index < quantity; index += 1) {
    assert.equal(engine.getBioforgeQaHooksV80().advance().event.type, 'bioforge-specimen-printed');
  }
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'combat');
  assert.equal(engine.enemies.length, quantity);
  Object.assign(engine.player, { x: 1850, y: 290, vx: 0, vy: 0, facing: 1, fireClock: 0, crouching: false });
  return { engine, canvas, document, globals, events, pads };
}

function keyboardAim(engine, direction) {
  engine.clearGameplayInput();
  const { x, y } = COMBAT_AIM_DIRECTIONS_V83[direction];
  if (x) engine.setHeldGameplayKeyV77(x < 0 ? 'KeyA' : 'KeyD', true, 'keyboard');
  if (y) engine.setHeldGameplayKeyV77(y < 0 ? 'KeyW' : 'KeyS', true, 'keyboard');
  return engine.resolvePlayerCombatAimV83(engine.player);
}

function putSpecimenOnRay(engine, enemy, aim, distance) {
  const shoulder = resolveCombatMuzzleV83(engine.player, aim, { barrelLength: 0 });
  Object.assign(enemy, {
    x: shoulder.x + aim.x * distance - enemy.w / 2,
    y: shoulder.y + aim.y * distance - enemy.h / 2
  });
  // This geometric ray fixture relocates the body and its ground anchor
  // together; real Facehugger AI must not snap it back to its old spawn floor.
  enemy.groundY = enemy.y + enemy.h;
  enemy.spawnX = enemy.x;
}

for (const direction of Object.keys(COMBAT_AIM_DIRECTIONS_V83)) {
  test(`BIOFORGE : le vrai tir ${direction} touche un spécimen imprimé à vitesse constante`, t => {
    const { engine, events } = fixture(t);
    const aim = keyboardAim(engine, direction);
    const enemy = engine.enemies[0];
    putSpecimenOnRay(engine, enemy, aim, 115);
    const initialAmmo = engine.player.ammo, initialShots = Number(engine.player.shots || 0);
    assert.equal(engine.fire(), true);
    const bullet = engine.bullets[0];
    const muzzle = resolveCombatMuzzleV83(engine.player, aim);
    close(bullet.x, muzzle.x); close(bullet.y, muzzle.y);
    close(Math.hypot(bullet.vx, bullet.vy), 890);
    close(bullet.vx, aim.x * 890); close(bullet.vy, aim.y * 890);
    assert.equal(bullet.aimExplicitV83, true);
    assert.equal(engine.player.combatAimV83.direction, direction);
    assert.equal(engine.player.ammo, initialAmmo - 1);
    assert.equal(engine.player.shots, initialShots + 1);
    assert.equal(events.filter(event => event.type === 'bioforge-shot').length, 1);
    engine.updateBioforgeCombatV80(0.25);
    close(enemy.health, shotHealth(enemy));
    assert.equal(bullet.hit, true);
    assert.equal(engine.bullets.length, 0);
    assert.equal(engine.getBioforgeIsolationReportV80().secure, true);
  });
}

for (const direction of ['up', 'down']) {
  test(`BIOFORGE : un spécimen éloigné vers ${direction} est atteint sans tir horizontal de secours`, t => {
    const { engine } = fixture(t);
    const aim = keyboardAim(engine, direction);
    const enemy = engine.enemies[0];
    putSpecimenOnRay(engine, enemy, aim, 200);
    assert.equal(engine.fire(), true);
    const bullet = engine.bullets[0], startX = bullet.x;
    assert.equal(bullet.vx, 0);
    engine.updateBioforgeCombatV80(0.1);
    assert.equal(enemy.health, enemy.maxHealth, 'aucun impact anticipé hors portée de cette frame');
    assert.equal(engine.bullets.length, 1);
    close(bullet.x, startX);
    engine.updateBioforgeCombatV80(0.2);
    close(enemy.health, shotHealth(enemy));
    assert.equal(engine.bullets.length, 0);
  });
}

for (const direction of ['right', 'left', 'up', 'down']) {
  test(`BIOFORGE : le balayage arrête le tir sur la borne ${direction}`, t => {
    const { engine } = fixture(t);
    keyboardAim(engine, direction);
    const arena = engine.bioforgeLevelV80.arenaBounds;
    Object.assign(engine.enemies[0], { x: arena.x + 80, y: arena.y + 40 });
    assert.equal(engine.fire(), true);
    const bullet = engine.bullets[0];
    engine.updateBioforgeCombatV80(1.4);
    assert.equal(bullet.hit, true);
    if (direction === 'left') close(bullet.x, arena.x);
    if (direction === 'right') close(bullet.x + bullet.w, arena.x + arena.w);
    if (direction === 'up') close(bullet.y, arena.y);
    if (direction === 'down') close(bullet.y + bullet.h, arena.y + arena.h);
    assert.equal(engine.bullets.length, 0);
    assert.equal(engine.enemies[0].health, engine.enemies[0].maxHealth);
    assert.equal(engine.getBioforgeIsolationReportV80().secure, true);
  });
}

for (const side of ['left', 'right', 'top', 'bottom']) {
  test(`BIOFORGE : l'audit d'isolation détecte aussi une balle échappée par ${side}`, t => {
    const { engine } = fixture(t);
    keyboardAim(engine, 'right');
    assert.equal(engine.fire(), true);
    const bullet = engine.bullets[0], arena = engine.bioforgeLevelV80.arenaBounds;
    if (side === 'left') bullet.x = arena.x - 1;
    if (side === 'right') bullet.x = arena.x + arena.w - bullet.w + 1;
    if (side === 'top') bullet.y = arena.y - 1;
    if (side === 'bottom') bullet.y = arena.y + arena.h - bullet.h + 1;
    const report = engine.getBioforgeIsolationReportV80();
    assert.equal(report.secure, false);
    assert.deepEqual(report.escapedProjectileIds, [bullet.id]);
    engine.updateBioforgeCombatV80(0.01);
    assert.equal(engine.bullets.length, 0);
    assert.equal(engine.getBioforgeIsolationReportV80().secure, true);
  });
}

test('BIOFORGE : un sweep traversant deux spécimens ne facture qu’une balle et ne frappe que le premier', t => {
  const { engine, events } = fixture(t, 2);
  const aim = keyboardAim(engine, 'right');
  const [near, far] = engine.enemies;
  putSpecimenOnRay(engine, near, aim, 120);
  putSpecimenOnRay(engine, far, aim, 270);
  const ammo = engine.player.ammo;
  assert.equal(engine.fire(), true);
  assert.equal(engine.fire(), false, 'le cooldown interdit le doublon du même contact');
  engine.updateBioforgeCombatV80(0.5);
  close(near.health, shotHealth(near));
  assert.equal(far.health, far.maxHealth);
  assert.equal(engine.player.ammo, ammo - 1);
  assert.equal(events.filter(event => event.type === 'bioforge-shot').length, 1);
  assert.equal(engine.bullets.length, 0);
  engine.updateBioforgeCombatV80(0.5);
  close(near.health, shotHealth(near));
  assert.equal(far.health, far.maxHealth);
});

function standardPad() {
  return { index: 0, id: 'bioforge-v83-pad', mapping: 'standard', connected: true, axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
}
const press = (pad, button, held = true) => { pad.buttons[button] = { pressed: held, value: held ? 1 : 0 }; };

test('BIOFORGE : update interroge le pad, tire au stick droit et consomme le saut A sans déplacer latéralement', t => {
  const { engine, pads } = fixture(t);
  Object.assign(engine.player, { x: 1850, y: 528, vx: 0, vy: 0, grounded: true });
  const pad = standardPad(); pads.push(pad);
  engine.update(0.016);
  const beforeX = engine.player.x, ammo = engine.player.ammo;
  pad.axes[3] = -1; press(pad, 0); press(pad, 7);
  engine.update(0.016);
  assert.deepEqual(engine.player.gamepadAimV83, { x: 0, y: -1, source: 'gamepad' });
  assert.equal(engine.player.jumpBuffer, 0);
  assert.ok(engine.player.y < 528 && engine.player.vy < 0);
  close(engine.player.x, beforeX);
  assert.equal(engine.keys.has('Space'), false);
  assert.equal(engine.keys.has('KeyW'), false);
  assert.equal(engine.player.ammo, ammo - 1);
  assert.equal(engine.bullets.length, 1);
  assert.equal(engine.bullets[0].vx, 0);
  assert.ok(engine.bullets[0].vy < 0);
  engine.update(0.016);
  assert.equal(engine.player.ammo, ammo - 1, 'tir automatique soumis au cooldown réel');
});

test('BIOFORGE : pause par Start neutralise le pad et fige balle/saut ; reprise tenue attend un nouveau neutre', t => {
  const { engine, pads } = fixture(t);
  Object.assign(engine.player, { x: 1850, y: 528, grounded: true });
  const pad = standardPad(); pads.push(pad);
  engine.update(0.016);
  pad.axes[3] = -1; press(pad, 0); press(pad, 7);
  engine.update(0.016);
  assert.equal(engine.bullets.length, 1);
  const bullet = engine.bullets[0];
  const frozen = { x: engine.player.x, y: engine.player.y, bx: bullet.x, by: bullet.y, life: bullet.life, ammo: engine.player.ammo, time: engine.animationTime };
  press(pad, 9); engine.update(0.1);
  assert.equal(engine.paused, true);
  assert.equal(engine.player.gamepadAimV83, null);
  assert.equal(engine.player.pointerAimV83, null);
  assert.equal(engine.player.combatAimV83, null);
  assert.equal(engine.player.jumpBuffer, 0);
  assert.equal(engine.keys.has('KeyF'), false);
  assert.equal(engine.fire(), false);
  engine.update(0.1);
  assert.deepEqual({ x: engine.player.x, y: engine.player.y, bx: bullet.x, by: bullet.y, life: bullet.life, ammo: engine.player.ammo, time: engine.animationTime }, frozen);
  press(pad, 9, false); engine.update(0.1);
  press(pad, 9); engine.update(0.016);
  assert.equal(engine.paused, false);
  assert.equal(engine.player.gamepadAimV83, null);
  assert.equal(engine.player.jumpBuffer, 0);
  assert.equal(engine.player.ammo, frozen.ammo);
  pad.axes[3] = 0; press(pad, 0, false); press(pad, 7, false); press(pad, 9, false);
  engine.update(0.1);
  pad.axes[2] = 1; press(pad, 7); engine.update(0.1);
  assert.deepEqual(engine.player.gamepadAimV83, { x: 1, y: 0, source: 'gamepad' });
  assert.equal(engine.player.ammo, frozen.ammo - 1);
});

test('BIOFORGE : purge puis reprise réelle n’emportent aucune visée, touche, buffer de saut ou balle', t => {
  const { engine, canvas, pads } = fixture(t);
  const pad = standardPad(); pads.push(pad);
  engine.update(0.016);
  pad.axes[2] = 1; press(pad, 7); engine.update(0.016);
  assert.equal(engine.bullets.length, 1);
  canvas.emit('pointerdown', { pointerId: 7, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 1,
    clientX: 900, clientY: 150, target: canvas });
  assert.ok(engine.player.pointerAimV83);
  engine.player.jumpBuffer = 0.14;
  const actor = engine.player;
  const resume = engine.captureBioforgeResumeStateV80();
  const serialized = JSON.stringify(resume);
  assert.doesNotMatch(serialized, /pointerAimV83|gamepadAimV83|combatAimV83|bioforge-shot-/);
  assert.equal(resume.state.runtimeV81.physicalV87.player.jumpBuffer, .14, 'le checkpoint physique garde le curseur mais la reprise efface cette intention de commande');
  engine.purgeBioforgeV80('aim-v83-regression');
  assert.equal(engine.bullets.length, 0);
  assert.equal(engine.hostileProjectiles.length, 0);
  assert.equal(engine.keys.size, 0);
  for (const key of ['pointerAimV83', 'gamepadAimV83', 'combatAimV83']) assert.equal(actor[key], null);
  assert.equal(actor.jumpBuffer, 0);
  assert.equal(canvas.hasPointerCapture(7), false);
  engine.start({ resumeState: resume, assets: {}, testMode: true, autoLoop: false });
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'combat');
  assert.notEqual(engine.player, actor);
  assert.equal(engine.player.jumpBuffer, 0);
  assert.equal(engine.bullets.length, 0);
  for (const key of ['pointerAimV83', 'gamepadAimV83', 'combatAimV83']) assert.equal(engine.player[key] ?? null, null);
  const ammo = engine.player.ammo;
  engine.update(0.016);
  assert.equal(engine.bullets.length, 0, 'une gâchette encore tenue ne recrée pas une balle après reprise');
  assert.equal(engine.player.ammo, ammo);
  assert.equal(engine.player.gamepadAimV83, null);
  canvas.emit('pointermove', { pointerId: 7, pointerType: 'mouse', isPrimary: true, buttons: 1, clientX: 900, clientY: 150 });
  assert.equal(engine.player.pointerAimV83 ?? null, null, 'le drag terminé par purge ne ressuscite pas');
  assert.equal(engine.keys.has('KeyF'), false);
});

test('BIOFORGE : une suspension atlas bloque le tir direct sans consommer de munition', t => {
  const { engine } = fixture(t);
  keyboardAim(engine, 'up');
  const ammo = engine.player.ammo;
  engine.enemyAtlasLoadingPausedV65 = true;
  assert.equal(engine.fire(), false);
  assert.equal(engine.player.ammo, ammo);
  assert.equal(engine.bullets.length, 0);
});

test('BIOFORGE : une suspension atlas fige la simulation même avec des touches déjà tenues', t => {
  const { engine } = fixture(t);
  keyboardAim(engine, 'right');
  engine.setHeldGameplayKeyV77('KeyF', true, 'keyboard');
  engine.enemyAtlasLoadingPausedV65 = true;
  const before = { x: engine.player.x, y: engine.player.y, ammo: engine.player.ammo, time: engine.animationTime };
  engine.update(0.1);
  assert.deepEqual({ x: engine.player.x, y: engine.player.y, ammo: engine.player.ammo, time: engine.animationTime }, before);
  assert.equal(engine.bullets.length, 0);
});

function pointerContact(canvas, overrides = {}) {
  return { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 1,
    clientX: 900, clientY: 150, target: canvas, ...overrides };
}

for (const [label, override] of [
  ['Ctrl-clic', { ctrlKey: true }],
  ['bouton central', { button: 1 }],
  ['bouton droit', { button: 2 }],
  ['souris non primaire', { isPrimary: false }],
  ['coordonnées invalides', { clientX: Number.NaN }],
  ['cible UI', { target: { closest: () => ({}) } }]
]) {
  test(`BIOFORGE : ${label} ne contourne pas le binder pour consommer une munition`, t => {
    const { engine, canvas, events } = fixture(t);
    const ammo = engine.player.ammo;
    assert.equal(engine.player.fireClock, 0, 'aucun cooldown ne masque le refus attendu');
    canvas.emit('pointerdown', pointerContact(canvas, override));
    assert.equal(engine.player.ammo, ammo);
    assert.equal(engine.bullets.length, 0);
    assert.equal(engine.keys.has('KeyF'), false);
    assert.equal(engine.player.pointerAimV83 ?? null, null);
    assert.equal(events.filter(event => event.type === 'bioforge-shot').length, 0);
  });
}

test('BIOFORGE : une capture existante refuse un autre pointeur même lorsque le cooldown est fini', t => {
  const { engine, canvas, events } = fixture(t);
  const primary = pointerContact(canvas, { pointerType: 'touch' });
  canvas.emit('pointerdown', primary);
  assert.equal(engine.bullets.length, 1);
  const ammo = engine.player.ammo, aim = engine.player.pointerAimV83;
  engine.player.fireClock = 0;
  canvas.emit('pointerdown', pointerContact(canvas, { pointerId: 2, pointerType: 'touch', isPrimary: false, clientX: 100 }));
  assert.equal(engine.player.ammo, ammo);
  assert.equal(engine.bullets.length, 1);
  assert.equal(engine.player.pointerAimV83, aim);
  assert.equal(canvas.hasPointerCapture(1), true);
  assert.equal(canvas.hasPointerCapture(2), false);
  assert.equal(events.filter(event => event.type === 'bioforge-shot').length, 1);
});

test('BIOFORGE : doigt déplacement et second doigt visée donnent un premier tir immédiat dans la bonne diagonale', t => {
  const { engine, canvas } = fixture(t);
  engine.setHeldGameplayKeyV77('KeyA', true, 'touch-controls');
  const shoulder = resolveCombatMuzzleV83(engine.player, { facing: 1 }, { barrelLength: 0 });
  const contact = pointerContact(canvas, {
    pointerId: 2, pointerType: 'touch', isPrimary: false,
    clientX: shoulder.x - engine.camera.x + 200, clientY: shoulder.y - 200
  });
  const ammo = engine.player.ammo;
  canvas.emit('pointerdown', contact);
  assert.equal(engine.player.ammo, ammo - 1);
  assert.equal(engine.bullets.length, 1);
  assert.equal(canvas.hasPointerCapture(2), true);
  assert.equal(engine.player.combatAimV83.direction, 'up-right');
  assert.ok(engine.bullets[0].vx > 0 && engine.bullets[0].vy < 0);
  assert.equal(engine.keys.has('KeyA'), true);
  assert.equal(engine.keys.has('KeyF'), true);
  canvas.emit('pointermove', { ...contact, clientY: shoulder.y + 200, buttons: 0 });
  assert.equal(engine.resolvePlayerCombatAimV83().direction, 'down-right');
  canvas.emit('pointerup', contact);
  assert.equal(engine.player.pointerAimV83, null);
  assert.equal(engine.keys.has('KeyF'), false);
  assert.equal(engine.keys.has('KeyA'), true);
});
