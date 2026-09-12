import { COMBAT_AIM_DEADZONE_V83, readGamepadCombatAimV83, resolveCombatMuzzleV83 } from './combat-aim-v83.js';

const combatPointerBindingsV83 = new WeakMap();
const down = (pad, index) => Boolean(pad.buttons?.[index]?.pressed || Number(pad.buttons?.[index]?.value) > 0.55);
const axis = (pad, index) => Number.isFinite(pad.axes?.[index]) ? pad.axes[index] : 0;
const controls = [
  { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', fire: 'KeyF' },
  { left: 'KeyJ', right: 'KeyL', up: 'KeyI', down: 'KeyK', fire: 'KeyO' }
];

/** Two stable player slots; a held/reconnected button cannot synthesize a fresh action. */
export class MissionGamepadInputV77 {
  constructor(engine) { this.engine = engine; this.slots = [null, null]; }

  reset() {
    for (const slot of this.slots) if (slot) slot.suppressed = true;
    for (let index = 0; index < 2; index += 1) this.release(index);
    const pointer = combatPointerBindingsV83.get(this.engine.canvas);
    if (pointer?.engine === this.engine) pointer.clear();
    for (const actor of [this.engine.player, this.engine.coop]) if (actor) actor.pointerAimV83 = null;
  }

  poll(pads) {
    if (pads === undefined) {
      try { pads = globalThis.navigator?.getGamepads?.() || []; }
      catch { pads = []; }
    }
    const connected = Array.from(pads).filter((pad) => pad && pad.connected !== false && pad.mapping === 'standard');
    for (let index = 0; index < 2; index += 1) {
      const slot = this.slots[index];
      if (slot && !connected.some((pad) => pad.index === slot.index && pad.id === slot.id)) {
        this.release(index);
        this.slots[index] = null;
      }
    }
    for (const pad of connected) {
      if (this.slots.some((slot) => slot?.index === pad.index && slot.id === pad.id)) continue;
      const index = this.slots.indexOf(null);
      if (index >= 0) this.slots[index] = { index: pad.index, id: pad.id, previous: Array.from({ length: 17 }, (_, button) => down(pad, button)), suppressed: true };
    }
    let pauseConsumed = false;
    for (let index = 0; index < 2; index += 1) {
      const slot = this.slots[index];
      if (!slot) continue;
      const pad = connected.find((entry) => entry.index === slot.index && entry.id === slot.id);
      const buttons = Array.from({ length: 17 }, (_, button) => down(pad, button));
      const edge = (button) => buttons[button] && !slot.previous[button];
      const actor = index === 0 ? this.engine.player : this.engine.coop;
      const focus = globalThis.document?.activeElement;
      const uiOwnsInput = Boolean(focus && focus !== this.engine.canvas && focus.closest?.('input,textarea,select,button,a[href],[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="button"],[role="slider"],[role="dialog"],[aria-modal="true"]'));
      const available = this.engine.running && globalThis.document?.hidden !== true && globalThis.document?.hasFocus?.() !== false
        && !uiOwnsInput && (index === 0 || this.engine.coopEnabled);
      if (available && edge(9) && !pauseConsumed) { this.engine.togglePause(); pauseConsumed = true; }
      const active = available && !this.engine.paused && !this.engine.enemyAtlasLoadingPausedV65 && this.engine.mission?.state === 'active' && actor?.alive;
      const aim = readGamepadCombatAimV83(pad);
      const aimNeutral = Math.hypot(aim.x, aim.y) <= COMBAT_AIM_DEADZONE_V83;
      const neutral = Math.abs(axis(pad, 0)) < 0.25 && Math.abs(axis(pad, 1)) < 0.25
        && aimNeutral && !buttons.some((pressed, button) => pressed && button !== 9);
      if (!active) slot.suppressed = true;
      else if (slot.suppressed && neutral) slot.suppressed = false;
      if (!active || slot.suppressed) this.release(index);
      else {
        actor.gamepadAimV83 = aimNeutral ? null : aim;
        const held = { left: axis(pad, 0) < -0.25 || buttons[14], right: axis(pad, 0) > 0.25 || buttons[15], up: axis(pad, 1) < -0.25 || buttons[12], down: axis(pad, 1) > 0.25 || buttons[13] || buttons[1], fire: buttons[7] };
        for (const [action, code] of Object.entries(controls[index])) this.engine.setHeldGameplayKeyV77(code, held[action], 'gamepad-' + index);
        if (edge(0)) actor.jumpBuffer = 0.14;
        for (const [button, method] of [[2, 'reload'], [3, 'interact'], [4, 'activateTracker'], [5, 'toggleVehicle'], [8, 'useMedkit']]) {
          if (edge(button)) this.engine[method]?.(actor);
        }
      }
      slot.previous = buttons;
    }
  }

  release(index) {
    for (const code of Object.values(controls[index])) this.engine.setHeldGameplayKeyV77(code, false, 'gamepad-' + index);
    const actor = index === 0 ? this.engine.player : this.engine.coop;
    if (actor) actor.gamepadAimV83 = null;
  }
}

function pointerGameplayAvailableV83(engine, actor) {
  const focus = globalThis.document?.activeElement;
  const uiOwnsInput = Boolean(focus && focus !== engine.canvas
    && focus.closest?.('input,textarea,select,button,a[href],[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="button"],[role="slider"],[role="dialog"],[aria-modal="true"]'));
  return Boolean(engine.running && !engine.paused && !engine.enemyAtlasLoadingPausedV65
    && engine.mission?.state === 'active' && actor?.alive
    && globalThis.document?.hidden !== true && globalThis.document?.hasFocus?.() !== false && !uiOwnsInput
    && (typeof engine.canPerformGameplayAction !== 'function' || engine.canPerformGameplayAction(actor)));
}

/** Re-project the last held pointer against the current camera and shoulder.
 * Call before resolving aim on a frame/shot: a stationary cursor stays attached
 * to its screen position while actor/camera motion changes the world beneath it.
 */
export function refreshCombatPointerAimV83(canvas, engine) {
  const binding = combatPointerBindingsV83.get(canvas);
  return binding?.engine === engine ? binding.refresh() : null;
}

/** Captures aim and held fire, then delegates the accepted contact to its owner.
 * The optional callback runs only after all input guards and projection succeed;
 * this module never fires autonomously or creates a second unguarded listener.
 */
export function bindCombatPointerAimV83(canvas, engine, onStart) {
  combatPointerBindingsV83.get(canvas)?.dispose();
  let disposed = false;
  let pointer = null;
  let owner = null;
  const listeners = [];
  const listen = (target, type, callback) => {
    target?.addEventListener?.(type, callback);
    listeners.push(() => target?.removeEventListener?.(type, callback));
  };
  const clear = () => {
    const released = pointer;
    pointer = null;
    if (owner) owner.pointerAimV83 = null;
    owner = null;
    if (engine.player) engine.player.pointerAimV83 = null;
    engine.setHeldGameplayKeyV77?.('KeyF', false, 'pointer-v83');
    if (released) {
      try { canvas.releasePointerCapture?.(released.id); } catch {}
    }
  };
  const refresh = () => {
    if (disposed || !pointer) return null;
    const actor = engine.player;
    if (actor !== owner || !pointerGameplayAvailableV83(engine, actor)) { clear(); return null; }
    const rect = canvas.getBoundingClientRect?.();
    if (!rect || !(rect.width > 0) || !(rect.height > 0)
      || !Number.isFinite(rect.left) || !Number.isFinite(rect.top)) { clear(); return null; }
    // The renderer scales a 1280x720 logical viewport, independent of backing-store DPR.
    const worldX = (Number(engine.camera?.x) || 0) + (pointer.clientX - rect.left) / rect.width * 1280;
    const worldY = (Number(engine.camera?.y) || 0) + (pointer.clientY - rect.top) / rect.height * 720;
    const vehicle = actor.inVehicle && engine.vehicle;
    const options = vehicle ? { barrelLength: 0, pivotX: vehicle.x + vehicle.w / 2, pivotY: vehicle.y + 28 } : { barrelLength: 0 };
    const shoulder = resolveCombatMuzzleV83(actor, { facing: actor.facing }, options);
    actor.pointerAimV83 = Object.freeze({ x: worldX - shoulder.x, y: worldY - shoulder.y, source: 'pointer' });
    return actor.pointerAimV83;
  };
  const start = (event) => {
    // A first finger may own a movement button outside the canvas. The aiming
    // finger need not be globally primary, but the canvas still owns one pointer.
    if (disposed || event.isPrimary === false && event.pointerType !== 'touch' || event.button !== undefined && event.button !== 0
      || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    const id = Number.isInteger(event.pointerId) ? event.pointerId : 0;
    if (pointer && pointer.id !== id) return;
    canvas.focus?.({ preventScroll: true });
    if (!pointerGameplayAvailableV83(engine, engine.player)
      || typeof engine.canRouteGameplayKey === 'function' && !engine.canRouteGameplayKey(event)) return;
    owner = engine.player;
    pointer = { id, clientX: event.clientX, clientY: event.clientY, type: event.pointerType || 'mouse', captured: false };
    try { canvas.setPointerCapture?.(id); pointer.captured = typeof canvas.setPointerCapture === 'function'; } catch {}
    if (refresh()) {
      engine.setHeldGameplayKeyV77?.('KeyF', true, 'pointer-v83');
      if (typeof onStart === 'function') onStart(event);
    }
  };
  const move = (event) => {
    if (disposed || !pointer || event.pointerId !== pointer.id || event.isPrimary === false && pointer.type !== 'touch') return;
    const held = pointer.type === 'touch'
      ? (typeof canvas.hasPointerCapture === 'function' ? canvas.hasPointerCapture(pointer.id) : pointer.captured)
      : Boolean(event.buttons & 1);
    if (!held) { clear(); return; }
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    refresh();
  };
  const end = (event) => { if (!disposed && pointer && event.pointerId === pointer.id) clear(); };
  const onBlur = () => { if (!disposed) clear(); };
  const onVisibility = () => { if (globalThis.document?.hidden) onBlur(); };
  const onFocus = () => { if (pointer && !pointerGameplayAvailableV83(engine, owner)) onBlur(); };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    clear();
    listeners.splice(0).forEach(remove => remove());
    if (combatPointerBindingsV83.get(canvas) === binding) combatPointerBindingsV83.delete(canvas);
  };
  const binding = { engine, clear, refresh, dispose };
  combatPointerBindingsV83.set(canvas, binding);
  for (const [type, callback] of [['pointerdown', start], ['pointermove', move], ['pointerup', end], ['pointercancel', end], ['lostpointercapture', end]]) {
    listen(canvas, type, callback);
  }
  listen(globalThis, 'pointerup', end);
  listen(globalThis, 'pointercancel', end);
  listen(globalThis, 'blur', onBlur);
  listen(globalThis.document, 'visibilitychange', onVisibility);
  listen(globalThis.document, 'focusin', onFocus);
  return dispose;
}

/** Pointer timing is sampled on contact. Detail-zero clicks preserve keyboard/AT activation. */
export function bindTacticalReloadButtonV77(button, engine, audio) {
  const activate = () => { audio?.unlock?.(); if (engine.reload(engine.player)) engine.canvas?.focus?.({ preventScroll: true }); };
  const pointer = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    activate();
  };
  const click = (event) => { if (event.detail === 0) { event.preventDefault(); activate(); } };
  button.addEventListener('pointerdown', pointer);
  button.addEventListener('click', click);
  button.setAttribute?.('aria-label', 'Recharger. Appuyer une seconde fois dans la fenêtre pour accélérer.');
  button.title = 'R / X / □ · seconde pression dans la zone claire';
  return () => { button.removeEventListener('pointerdown', pointer); button.removeEventListener('click', click); };
}
