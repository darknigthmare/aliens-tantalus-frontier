import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MissionGamepadInputV77,
  bindCombatPointerAimV83,
  refreshCombatPointerAimV83
} from '../src/mission-input-v77.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
const pad = (index = 0, axes = [0, 0, 0, 0]) => ({
  index, id: 'aim-pad-' + index, mapping: 'standard', connected: true, axes,
  buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }))
});

function fixture(t) {
  class Target {
    constructor() { this.listeners = new Map(); }
    addEventListener(type, listener) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set());
      this.listeners.get(type).add(listener);
    }
    removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
    emit(type, event = {}) { for (const listener of [...(this.listeners.get(type) || [])]) listener(event); }
    count() { return [...this.listeners.values()].reduce((sum, entries) => sum + entries.size, 0); }
  }
  const globalEvents = new Target();
  const document = Object.assign(new Target(), { hidden: false, activeElement: null, focused: true, hasFocus() { return this.focused; } });
  const names = ['document', 'addEventListener', 'removeEventListener'];
  const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  Object.defineProperties(globalThis, {
    document: { value: document, configurable: true },
    addEventListener: { value: globalEvents.addEventListener.bind(globalEvents), configurable: true },
    removeEventListener: { value: globalEvents.removeEventListener.bind(globalEvents), configurable: true }
  });
  const canvas = Object.assign(new Target(), {
    width: 2560, height: 1440,
    rect: { left: 100, top: 50, width: 640, height: 360 },
    captures: new Set(),
    focus() { document.activeElement = canvas; },
    getBoundingClientRect() { return { ...this.rect }; },
    setPointerCapture(id) { this.captures.add(id); },
    hasPointerCapture(id) { return this.captures.has(id); },
    releasePointerCapture(id) {
      if (this.captures.delete(id)) this.emit('lostpointercapture', { pointerId: id });
    }
  });
  const player = { x: 200, y: 400, w: 42, h: 92, facing: 1, alive: true };
  const coop = { x: 150, y: 400, w: 42, h: 92, facing: -1, alive: true, coop: true };
  const engine = {
    canvas, player, coop, running: true, paused: false, enemyAtlasLoadingPausedV65: false,
    coopEnabled: true, mission: { state: 'active' }, camera: { x: 300, y: 200 },
    keys: new Set(), held: new Map(), fires: 0,
    setHeldGameplayKeyV77(code, active, source) {
      const sources = this.held.get(code) || new Set();
      if (active) sources.add(source); else sources.delete(source);
      if (sources.size) { this.held.set(code, sources); this.keys.add(code); }
      else { this.held.delete(code); this.keys.delete(code); }
    },
    togglePause() { this.paused = !this.paused; },
    fire() { this.fires += 1; }
  };
  document.activeElement = canvas;
  const gamepads = new MissionGamepadInputV77(engine);
  const dispose = bindCombatPointerAimV83(canvas, engine);
  const event = (overrides = {}) => ({
    pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 1,
    clientX: 420, clientY: 230, target: canvas, ...overrides
  });
  t.after(() => {
    dispose();
    for (const [name, descriptor] of previous) descriptor
      ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name];
  });
  return { engine, canvas, document, globalEvents, gamepads, event, dispose };
}

test('le stick droit appartient à chaque acteur et ne synthétise pas les touches déplacement ou saut', t => {
  const m = fixture(t);
  const first = pad(0), second = pad(1);
  m.gamepads.poll([first, second]);
  first.axes[2] = 0.8; first.axes[3] = -0.8;
  second.axes[2] = -0.9; second.axes[3] = 0.9;
  m.gamepads.poll([first, second]);
  assert.deepEqual(m.engine.player.gamepadAimV83, { x: 0.8, y: -0.8, source: 'gamepad' });
  assert.deepEqual(m.engine.coop.gamepadAimV83, { x: -0.9, y: 0.9, source: 'gamepad' });
  assert.deepEqual([...m.engine.keys], []);
  assert.equal(m.engine.player.jumpBuffer, undefined);
  assert.equal(m.engine.coop.jumpBuffer, undefined);
});

test('connexion et reconnexion avec stick droit tenu exigent un retour au neutre', t => {
  const m = fixture(t);
  const first = pad(0, [0, 0, 0.8, -0.8]);
  m.gamepads.poll([first]);
  assert.equal(m.engine.player.gamepadAimV83, null);
  m.gamepads.poll([first]);
  assert.equal(m.engine.player.gamepadAimV83, null);
  first.axes[2] = 0; first.axes[3] = 0;
  m.gamepads.poll([first]);
  first.axes[2] = 0.8; m.gamepads.poll([first]);
  assert.equal(m.engine.player.gamepadAimV83.x, 0.8);
  m.gamepads.poll([]);
  assert.equal(m.engine.player.gamepadAimV83, null);
  m.gamepads.poll([first]);
  assert.equal(m.engine.player.gamepadAimV83, null);
});

test('pause, UI, perte de focus et atlas suspendu neutralisent la visée et exigent un neutre', t => {
  const m = fixture(t);
  const first = pad();
  for (const [suspend, resume] of [
    [() => { m.engine.paused = true; }, () => { m.engine.paused = false; }],
    [() => { m.engine.enemyAtlasLoadingPausedV65 = true; }, () => { m.engine.enemyAtlasLoadingPausedV65 = false; }],
    [() => { m.document.hidden = true; }, () => { m.document.hidden = false; }],
    [() => { m.document.focused = false; }, () => { m.document.focused = true; }],
    [() => { m.document.activeElement = { closest: () => ({}) }; }, () => { m.document.activeElement = m.canvas; }]
  ]) {
    first.axes[2] = 0; m.gamepads.poll([first]);
    first.axes[2] = 0.8; m.gamepads.poll([first]);
    assert.equal(m.engine.player.gamepadAimV83.x, 0.8);
    suspend(); m.gamepads.poll([first]);
    assert.equal(m.engine.player.gamepadAimV83, null);
    resume(); m.gamepads.poll([first]);
    assert.equal(m.engine.player.gamepadAimV83, null);
  }
});

test('le relâchement applique la deadzone radiale et conserve les entrées clavier de même code', t => {
  const m = fixture(t);
  const first = pad();
  m.gamepads.poll([first]);
  first.axes[2] = 0.2; first.axes[3] = -0.2; first.axes[0] = 1;
  m.engine.setHeldGameplayKeyV77('KeyD', true, 'keyboard');
  m.gamepads.poll([first]);
  assert.ok(m.engine.player.gamepadAimV83, '0.2/0.2 est hors du rayon 0.25');
  first.axes[2] = 0.1; first.axes[3] = 0.1; first.axes[0] = 0;
  m.gamepads.poll([first]);
  assert.equal(m.engine.player.gamepadAimV83, null);
  m.gamepads.release(0);
  assert.equal(m.engine.keys.has('KeyD'), true);
  assert.deepEqual([...m.engine.held.get('KeyD')], ['keyboard']);
});

test('le contact établit la visée et KeyF avant le callback autorisé, sans appeler fire lui-même', t => {
  const m = fixture(t);
  m.canvas.emit('pointerdown', m.event());
  assert.equal(m.engine.fires, 0);
  assert.equal(m.engine.keys.has('KeyF'), true);
  assert.deepEqual(m.engine.player.pointerAimV83, { x: 719, y: 123, source: 'pointer' });
  assert.equal(m.engine.coop.pointerAimV83, undefined);
  m.canvas.emit('pointerup', m.event());
  let observed = null;
  const dispose = bindCombatPointerAimV83(m.canvas, m.engine, event => {
    observed = { aim: m.engine.player.pointerAimV83, held: m.engine.keys.has('KeyF'), event };
    m.engine.fire();
  });
  t.after(dispose);
  const event = m.event();
  m.canvas.emit('pointerdown', event);
  assert.equal(observed.held, true);
  assert.equal(observed.aim.source, 'pointer');
  assert.equal(observed.event, event);
  assert.equal(m.engine.fires, 1);
  m.canvas.emit('pointerdown', m.event({ pointerId: 2 }));
  assert.equal(m.engine.fires, 1, 'le callback ne contourne pas la capture existante');
  m.canvas.emit('pointerup', event);
  m.engine.canRouteGameplayKey = () => false;
  m.canvas.emit('pointerdown', event);
  assert.equal(m.engine.fires, 1, 'une entrée refusée ne déclenche jamais le callback');
});

test('projection DPR/mobile et caméra mobile recalculées depuis la position écran sans pointermove', t => {
  const m = fixture(t);
  m.canvas.emit('pointerdown', m.event());
  close(m.engine.player.pointerAimV83.x, 719);
  close(m.engine.player.pointerAimV83.y, 123);
  m.engine.camera.x += 100; m.engine.camera.y -= 50;
  m.engine.player.x += 30; m.engine.player.y += 10;
  const refreshed = refreshCombatPointerAimV83(m.canvas, m.engine);
  close(refreshed.x, 789);
  close(refreshed.y, 63);
  m.canvas.rect = { left: 30, top: 90, width: 320, height: 180 };
  m.canvas.emit('pointermove', m.event({ clientX: 190, clientY: 180 }));
  close(m.engine.player.pointerAimV83.x, 789);
  close(m.engine.player.pointerAimV83.y, 63);
});

test('la visée de véhicule utilise le pivot réel de tourelle', t => {
  const m = fixture(t);
  m.engine.player.inVehicle = true;
  m.engine.vehicle = { x: 600, y: 500, w: 190 };
  m.canvas.emit('pointerdown', m.event());
  assert.deepEqual(m.engine.player.pointerAimV83, { x: 245, y: 32, source: 'pointer' });
});

test('le déplacement souris/stylet exige le bouton gauche maintenu et le même pointeur', t => {
  const m = fixture(t);
  m.canvas.emit('pointermove', m.event());
  assert.equal(m.engine.player.pointerAimV83, undefined);
  m.canvas.emit('pointerdown', m.event({ pointerType: 'pen' }));
  const original = m.engine.player.pointerAimV83;
  m.canvas.emit('pointermove', m.event({ pointerId: 2, clientX: 200 }));
  assert.equal(m.engine.player.pointerAimV83, original);
  m.canvas.emit('pointermove', m.event({ pointerType: 'pen', clientX: 500 }));
  close(m.engine.player.pointerAimV83.x, 879);
  m.canvas.emit('pointermove', m.event({ pointerType: 'pen', buttons: 0 }));
  assert.equal(m.engine.player.pointerAimV83, null);
  assert.equal(m.engine.keys.has('KeyF'), false);
});

test('toucher capturé accepte le drag, ignore le deuxième doigt et efface sur perte de capture', t => {
  const m = fixture(t);
  m.canvas.emit('pointerdown', m.event({ pointerType: 'touch' }));
  assert.equal(m.canvas.hasPointerCapture(1), true);
  const original = m.engine.player.pointerAimV83;
  m.canvas.emit('pointerdown', m.event({ pointerType: 'touch', pointerId: 2, isPrimary: false, clientX: 160 }));
  assert.equal(m.engine.player.pointerAimV83, original);
  m.canvas.emit('pointermove', m.event({ pointerType: 'touch', buttons: 0, clientX: 500 }));
  close(m.engine.player.pointerAimV83.x, 879);
  m.canvas.releasePointerCapture(1);
  assert.equal(m.engine.player.pointerAimV83, null);
  assert.equal(m.engine.keys.has('KeyF'), false);
  m.canvas.emit('pointermove', m.event({ pointerType: 'touch', clientX: 300 }));
  assert.equal(m.engine.player.pointerAimV83, null);
});

test('le doigt tactile non primaire peut viser si le premier doigt appartient au déplacement hors canvas', t => {
  const m = fixture(t);
  m.engine.setHeldGameplayKeyV77('KeyA', true, 'touch-controls');
  const event = m.event({ pointerId: 2, pointerType: 'touch', isPrimary: false });
  m.canvas.emit('pointerdown', event);
  assert.equal(m.canvas.hasPointerCapture(2), true);
  assert.equal(m.engine.keys.has('KeyA'), true);
  assert.equal(m.engine.keys.has('KeyF'), true);
  close(m.engine.player.pointerAimV83.x, 719);
  m.canvas.emit('pointermove', { ...event, clientX: 500, buttons: 0 });
  close(m.engine.player.pointerAimV83.x, 879);
  const aim = m.engine.player.pointerAimV83;
  m.canvas.emit('pointerdown', m.event({ pointerId: 3, pointerType: 'touch', isPrimary: false }));
  assert.equal(m.engine.player.pointerAimV83, aim);
  assert.equal(m.canvas.hasPointerCapture(3), false);
  m.canvas.emit('pointerup', event);
  assert.equal(m.engine.keys.has('KeyF'), false);
  assert.equal(m.engine.keys.has('KeyA'), true, 'relâcher la visée ne relâche pas le doigt de déplacement');
});

test('pointerup externe et cancel retirent seulement la source pointeur du tir', t => {
  const m = fixture(t);
  m.engine.setHeldGameplayKeyV77('KeyF', true, 'keyboard');
  m.canvas.emit('pointerdown', m.event());
  m.globalEvents.emit('pointerup', m.event());
  assert.equal(m.engine.player.pointerAimV83, null);
  assert.equal(m.engine.keys.has('KeyF'), true);
  assert.deepEqual([...m.engine.held.get('KeyF')], ['keyboard']);
  m.engine.setHeldGameplayKeyV77('KeyF', false, 'keyboard');
  m.canvas.emit('pointerdown', m.event());
  m.canvas.emit('pointercancel', m.event());
  assert.equal(m.engine.keys.has('KeyF'), false);
});

test('reset, blur et pause interdisent le retour spontané de la visée ou du tir tenu', t => {
  const m = fixture(t);
  m.canvas.emit('pointerdown', m.event());
  m.engine.player.gamepadAimV83 = { x: 1, y: 0 };
  m.engine.coop.gamepadAimV83 = { x: -1, y: 0 };
  m.gamepads.reset();
  assert.equal(m.engine.player.pointerAimV83, null);
  assert.equal(m.engine.player.gamepadAimV83, null);
  assert.equal(m.engine.coop.gamepadAimV83, null);
  assert.equal(m.engine.keys.has('KeyF'), false);
  assert.equal(refreshCombatPointerAimV83(m.canvas, m.engine), null);
  m.canvas.emit('pointermove', m.event());
  assert.equal(m.engine.keys.has('KeyF'), false);
  m.canvas.emit('pointerdown', m.event());
  m.globalEvents.emit('blur');
  assert.equal(m.engine.keys.has('KeyF'), false);
  m.canvas.emit('pointerdown', m.event());
  m.engine.paused = true;
  assert.equal(refreshCombatPointerAimV83(m.canvas, m.engine), null);
  m.engine.paused = false;
  assert.equal(refreshCombatPointerAimV83(m.canvas, m.engine), null);
  assert.equal(m.engine.keys.has('KeyF'), false);
});

test('UI, tab caché et acteur remplacé invalident le token de capture courant', t => {
  const m = fixture(t);
  m.canvas.emit('pointerdown', m.event());
  m.document.activeElement = { closest: () => ({}) };
  m.document.emit('focusin');
  assert.equal(m.engine.keys.has('KeyF'), false);
  m.canvas.emit('pointerdown', m.event());
  assert.equal(m.document.activeElement, m.canvas, 'un nouveau contact direct rend le focus au canvas');
  assert.equal(m.engine.keys.has('KeyF'), true);
  m.document.hidden = true; m.document.emit('visibilitychange');
  assert.equal(m.engine.keys.has('KeyF'), false);
  m.document.hidden = false;
  m.canvas.emit('pointerdown', m.event());
  const previous = m.engine.player;
  m.engine.player = { ...previous };
  assert.equal(refreshCombatPointerAimV83(m.canvas, m.engine), null);
  assert.equal(previous.pointerAimV83, null);
  assert.equal(m.engine.player.pointerAimV83, null);
  assert.equal(m.engine.keys.has('KeyF'), false);
});

test('les gardes runtime, les boutons secondaires et un canvas sans aire restent inactifs', t => {
  const m = fixture(t);
  for (const override of [{ button: 2 }, { isPrimary: false }, { clientX: Number.NaN }]) {
    m.canvas.emit('pointerdown', m.event(override));
    assert.equal(m.engine.keys.has('KeyF'), false);
  }
  m.engine.canPerformGameplayAction = () => false;
  m.canvas.emit('pointerdown', m.event());
  assert.equal(m.engine.keys.has('KeyF'), false);
  m.engine.canPerformGameplayAction = () => true;
  m.engine.canRouteGameplayKey = () => false;
  m.canvas.emit('pointerdown', m.event());
  assert.equal(m.engine.keys.has('KeyF'), false);
  m.engine.canRouteGameplayKey = () => true;
  m.canvas.rect.width = 0;
  m.canvas.emit('pointerdown', m.event());
  assert.equal(m.engine.keys.has('KeyF'), false);
  assert.equal(m.engine.player.pointerAimV83, null);
});

test('rebind et dispose retirent les listeners et les anciens callbacks ne neutralisent pas la nouvelle capture', t => {
  const m = fixture(t);
  const oldMove = [...m.canvas.listeners.get('pointermove')][0];
  m.canvas.emit('pointerdown', m.event());
  const disposeNew = bindCombatPointerAimV83(m.canvas, m.engine);
  assert.equal(m.engine.player.pointerAimV83, null);
  assert.equal(m.engine.keys.has('KeyF'), false);
  assert.equal(m.canvas.listeners.get('pointerdown').size, 1);
  m.canvas.emit('pointerdown', m.event());
  const active = m.engine.player.pointerAimV83;
  oldMove(m.event({ buttons: 0 }));
  assert.equal(m.engine.player.pointerAimV83, active);
  m.dispose();
  assert.equal(m.engine.keys.has('KeyF'), true, 'un dispose ancien ne touche pas le binder courant');
  disposeNew();
  assert.equal(m.engine.keys.has('KeyF'), false);
  assert.equal(m.canvas.count(), 0);
  assert.equal(m.document.count(), 0);
  assert.equal(m.globalEvents.count(), 0);
  assert.equal(refreshCombatPointerAimV83(m.canvas, m.engine), null);
});
