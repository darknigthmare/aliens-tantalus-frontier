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
      const available = this.engine.running && globalThis.document?.hidden !== true && !uiOwnsInput && (index === 0 || this.engine.coopEnabled);
      if (available && edge(9) && !pauseConsumed) { this.engine.togglePause(); pauseConsumed = true; }
      const active = available && !this.engine.paused && !this.engine.enemyAtlasLoadingPausedV65 && this.engine.mission?.state === 'active' && actor?.alive;
      const neutral = Math.abs(axis(pad, 0)) < 0.25 && Math.abs(axis(pad, 1)) < 0.25 && !buttons.some((pressed, button) => pressed && button !== 9);
      if (!active) slot.suppressed = true;
      else if (slot.suppressed && neutral) slot.suppressed = false;
      if (!active || slot.suppressed) this.release(index);
      else {
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
  }
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
