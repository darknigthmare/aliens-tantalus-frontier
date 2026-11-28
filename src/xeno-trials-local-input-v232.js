/** Two human input owners for a local exhibition. All dependencies are injected;
 * this module never creates a match, selects an AI or reads/writes progression.
 * The runtime must pass getOpponentInput() as the engine's fourth argument even
 * when it is neutral: null would select the native CPU instead.
 */
export const XENO_TRIALS_LOCAL_ACTIONS_V232 = Object.freeze([
  'left', 'right', 'jump', 'guard', 'light', 'heavy', 'special', 'super',
  'crouch', 'evade', 'antiAir', 'parry', 'signature2', 'signature3', 'interact', 'tag', 'assist',
]);
export const XENO_TRIALS_LOCAL_OPPONENT_KEYS_V232 = Object.freeze({
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'jump', ArrowDown: 'guard',
  Numpad1: 'light', Numpad2: 'heavy', Numpad3: 'special', Numpad0: 'super',
  Numpad4: 'parry', Numpad5: 'signature2', Numpad6: 'signature3',
  Numpad7: 'crouch', Numpad8: 'evade', Numpad9: 'antiAir',
  NumpadDecimal: 'interact', NumpadAdd: 'tag', NumpadSubtract: 'assist',
});
export const XENO_TRIALS_LOCAL_PLAYER_TEAM_KEYS_V232 = Object.freeze({ KeyR: 'tag', KeyG: 'assist' });
export const XENO_TRIALS_LOCAL_PAD_ASSIGNMENTS_V232 = Object.freeze({ player: 0, opponent: 1 });
export const XENO_TRIALS_LOCAL_GAMEPAD_MAPPING_V232 = Object.freeze({
  left: 'Left stick / D-pad left', right: 'Left stick / D-pad right', jump: 'A / D-pad up',
  guard: 'LT / LB / D-pad down', light: 'X', heavy: 'Y', special: 'B', super: 'RT / RB',
  crouch: 'Left stick down', evade: 'R3', antiAir: 'Right stick up', parry: 'Right stick down',
  signature2: 'Right stick left', signature3: 'Right stick right', tag: 'L3', assist: 'Back', pause: 'Start',
});
const empty = () => Object.fromEntries(XENO_TRIALS_LOCAL_ACTIONS_V232.map(action => [action, false]));
const owns = (mapping, code) => Object.hasOwn(mapping, code);
const normal = value => {
  const result = Object.fromEntries(XENO_TRIALS_LOCAL_ACTIONS_V232.map(action => [action, value?.[action] === true]));
  if (result.left && result.right) result.left = result.right = false;
  return result;
};
const axis = value => Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0;
const button = (pad, index, threshold = .5) => {
  const value = pad.buttons?.[index];
  return value?.value !== undefined ? Number.isFinite(value.value) && value.value >= threshold : value?.pressed === true;
};
const compatible = pad => pad && pad.connected !== false && pad.mapping === 'standard'
  && Number.isInteger(pad.index) && pad.index >= 0;
const nativeControl = target => {
  const tag = String(target?.tagName || '').toLowerCase();
  return ['input', 'select', 'textarea', 'button', 'a', 'summary'].includes(tag) || target?.isContentEditable === true
    || Boolean(target?.closest?.('input, select, textarea, button, a[href], summary, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"]'));
};
const safeBool = (callback, fallback) => {
  if (typeof callback !== 'function') return fallback;
  try { return callback() === true; } catch { return false; }
};
const padInput = pad => {
  const x = axis(pad.axes?.[0]), rightX = axis(pad.axes?.[2]), rightY = axis(pad.axes?.[3]);
  const vertical = Math.abs(rightY) >= Math.abs(rightX);
  return normal({ left: x < -.30 || button(pad, 14), right: x > .30 || button(pad, 15),
    jump: button(pad, 0) || button(pad, 12), guard: button(pad, 6, .55) || button(pad, 4) || button(pad, 13),
    light: button(pad, 2), heavy: button(pad, 3), special: button(pad, 1), super: button(pad, 7, .55) || button(pad, 5),
    crouch: axis(pad.axes?.[1]) > .55, evade: button(pad, 11), antiAir: vertical && rightY < -.55,
    parry: vertical && rightY > .55, signature2: !vertical && rightX < -.55,
    signature3: !vertical && rightX > .55, tag: button(pad, 10), assist: button(pad, 8),
  });
};

/** Optional host/document listeners and RAF have exactly this controller's
 * lifetime. Without a scheduler, call poll() from the runtime (also while
 * paused). Reads return independent, normalized snapshots and never poll.
 * onRelease(side, input, reason) lets the runtime clear its native input edges;
 * onPauseToggle({side,index}) and onDisconnect({side,index}) leave pause ownership
 * with the runtime. Numeric pad assignments never fall back to another pad.
 */
export function createXenoTrialsLocalInputV232(options = {}) {
  const host = options.window, doc = options.document, canvas = options.canvas;
  // CPU exhibitions can reuse the player's complete pad/team adapter while
  // leaving arrows, numeric keys and the second pad with their existing owner.
  const opponentEnabled = options.opponentEnabled !== false;
  const indexes = {
    player: options.playerGamepadIndex === undefined ? 0 : options.playerGamepadIndex,
    opponent: opponentEnabled ? options.opponentGamepadIndex === undefined ? 1 : options.opponentGamepadIndex : null,
  };
  for (const index of Object.values(indexes)) if (index !== null && (!Number.isInteger(index) || index < 0))
    throw new RangeError('Local gamepad ownership requires a nonnegative index or null');
  if (indexes.player !== null && indexes.player === indexes.opponent)
    throw new RangeError('Local players cannot share a gamepad');
  const slots = Object.fromEntries(Object.entries(indexes).map(([side, index]) => [side,
    { index, connected: false, identity: null, needsNeutral: true, pauseArmed: false, input: empty() }]));
  const held = new Set(), blocked = new Set(), listeners = [];
  const requestFrame = options.requestAnimationFrame, cancelFrame = options.cancelAnimationFrame;
  if (typeof requestFrame === 'function' && typeof cancelFrame !== 'function')
    throw new TypeError('Local input scheduling requires cancellation');
  let stopped = false, releasing = false, raf = null, unavailable = null;
  const sideForKey = code => opponentEnabled && owns(XENO_TRIALS_LOCAL_OPPONENT_KEYS_V232, code) ? 'opponent'
    : owns(XENO_TRIALS_LOCAL_PLAYER_TEAM_KEYS_V232, code) ? 'player' : null;
  const ownsKey = code => sideForKey(code) !== null;
  const focusTarget = target => {
    if (typeof options.isFocusTarget === 'function') {
      try { return options.isFocusTarget(target) === true; } catch { return false; }
    }
    return !nativeControl(target) && (!canvas || target === canvas);
  };
  function focused() {
    return doc?.hidden !== true && doc?.hasFocus?.() !== false && safeBool(options.isFocused, true)
      && (!canvas || !doc?.activeElement || focusTarget(doc.activeElement));
  }
  function available() {
    return !stopped && focused() && !safeBool(options.isPaused, false) && safeBool(options.acceptsControls, true);
  }
  function getInput(side, latch = true) {
    if (side === 'opponent' && !opponentEnabled) return empty();
    if (!available()) {
      if (!stopped && latch) synchronizeAvailability();
      return empty();
    }
    const result = { ...slots[side].input };
    const mapping = side === 'opponent' ? XENO_TRIALS_LOCAL_OPPONENT_KEYS_V232 : XENO_TRIALS_LOCAL_PLAYER_TEAM_KEYS_V232;
    for (const code of held) if (owns(mapping, code)) result[mapping[code]] = true;
    return normal(result);
  }
  function emitRelease(reason, side = null) {
    for (const name of side ? [side] : opponentEnabled ? ['player', 'opponent'] : ['player'])
      if (name !== 'opponent' || opponentEnabled) options.onRelease?.(name, getInput(name, false), reason);
  }
  function release(reason = 'release') {
    if (stopped || releasing) return false;
    releasing = true;
    try {
      for (const code of held) blocked.add(code);
      held.clear();
      for (const slot of Object.values(slots)) {
        slot.input = empty(); slot.needsNeutral = true; slot.pauseArmed = false;
      }
      emitRelease(reason);
    } finally { releasing = false; }
    return true;
  }
  function synchronizeAvailability() {
    const reason = !focused() ? 'focus' : safeBool(options.isPaused, false) ? 'pause'
      : !safeBool(options.acceptsControls, true) ? 'inactive' : null;
    const previous = unavailable;
    unavailable = reason;
    if (reason && reason !== previous) release(reason);
    return reason === null;
  }
  function keydown(event) {
    if (stopped || !ownsKey(event.code)) return;
    const accepted = synchronizeAvailability();
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || !focusTarget(event.target)) {
      held.delete(event.code); blocked.add(event.code); emitRelease('key-target', sideForKey(event.code)); return;
    }
    event.preventDefault?.();
    if (!accepted || event.repeat && !held.has(event.code)) blocked.add(event.code);
    else if (!blocked.has(event.code)) held.add(event.code);
  }
  function keyup(event) {
    if (stopped || !ownsKey(event.code)) return;
    held.delete(event.code); blocked.delete(event.code); emitRelease('keyup', sideForKey(event.code));
  }
  function disconnect(slot, side, notify = true) {
    if (!slot.connected) return false;
    slot.connected = false; slot.identity = null;
    if (notify) { release('disconnect'); options.onDisconnect?.({ side, index: slot.index }); }
    return true;
  }
  function poll(gamepads) {
    if (stopped) return view();
    const active = synchronizeAvailability();
    let pads = gamepads;
    if (pads === undefined) {
      try { pads = options.readGamepads?.() || []; } catch { pads = []; }
    }
    try { pads = Array.from(pads || []).filter(compatible); } catch { pads = []; }
    const events = [], disconnected = [];
    for (const [side, slot] of Object.entries(slots)) {
      const pad = slot.index === null ? null : pads.find(value => value.index === slot.index);
      if (!pad) {
        if (disconnect(slot, side, false)) disconnected.push({ side, index: slot.index });
        continue;
      }
      const identity = String(pad.id || '');
      if (!slot.connected || slot.identity !== identity) {
        slot.connected = true; slot.identity = identity; slot.needsNeutral = true; slot.pauseArmed = false;
      }
      const input = padInput(pad), pausePressed = button(pad, 9);
      // Raw opposing directions still count as physically held for rearming.
      const controlsHeld = Object.values(input).some(Boolean) || button(pad, 14) || button(pad, 15)
        || Math.abs(axis(pad.axes?.[0])) > .30;
      const neutral = !pausePressed && !controlsHeld;
      if (!focused()) {
        slot.input = empty(); slot.needsNeutral = true; slot.pauseArmed = false; continue;
      }
      const pauseToggle = pausePressed && slot.pauseArmed;
      if (pausePressed) slot.pauseArmed = false;
      else if (neutral) slot.pauseArmed = true;
      if (!active || pauseToggle) slot.needsNeutral = true;
      if (neutral) slot.needsNeutral = false;
      slot.input = active && !slot.needsNeutral && !pauseToggle ? input : empty();
      if (pauseToggle) events.push({ side, index: slot.index });
    }
    if (disconnected.length) {
      release('disconnect');
      for (const lost of disconnected) options.onDisconnect?.(lost);
      return view();
    }
    // Two simultaneous Start presses are one pause transition.
    if (events.length) { release('pause-toggle'); options.onPauseToggle?.(events[0]); }
    return view();
  }
  function view() {
    return { stopped, padAssignments: { ...indexes }, player: getInput('player'), opponent: getInput('opponent'),
      gamepads: Object.fromEntries(Object.entries(slots).map(([side, slot]) => [side,
        { index: slot.index, connected: slot.connected, needsNeutral: slot.needsNeutral }])) };
  }
  function listen(target, type, callback) {
    if (!target?.addEventListener) return;
    target.addEventListener(type, callback); listeners.push(() => target.removeEventListener(type, callback));
  }
  function frame() {
    raf = null;
    if (stopped) return;
    poll();
    if (!stopped) raf = requestFrame(frame);
  }
  function stop() {
    if (stopped) return false;
    release('stop'); stopped = true;
    if (raf !== null) cancelFrame(raf);
    raf = null;
    for (const remove of listeners.splice(0)) remove();
    held.clear(); blocked.clear();
    return true;
  }
  listen(host, 'keydown', keydown); listen(host, 'keyup', keyup);
  for (const type of ['blur', 'pagehide']) listen(host, type, () => release(type));
  listen(doc, 'visibilitychange', () => { if (doc.hidden) release('visibility'); });
  listen(doc, 'focusin', event => { if (!focusTarget(event.target)) release('focus'); });
  listen(host, 'gamepaddisconnected', event => {
    for (const [side, slot] of Object.entries(slots)) if (event.gamepad?.index === slot.index) disconnect(slot, side);
  });
  listen(host, 'gamepadconnected', event => {
    for (const slot of Object.values(slots)) if (event.gamepad?.index === slot.index) {
      slot.needsNeutral = true; slot.pauseArmed = false; slot.input = empty();
    }
  });
  if (typeof requestFrame === 'function') raf = requestFrame(frame);
  return Object.freeze({ getOpponentInput: () => getInput('opponent'), getPlayerInput: () => getInput('player'),
    ownsKey, ownsOpponentKey: code => opponentEnabled && owns(XENO_TRIALS_LOCAL_OPPONENT_KEYS_V232, code),
    release, stop, poll, view });
}
