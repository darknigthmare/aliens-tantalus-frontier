/** Standard Gamepad sampling only. The runtime owns polling, pause and the
 * simulation; this adapter never reads the DOM, RAF, navigator or saved state. */
export const XENO_TRIALS_GAMEPAD_ACTIONS_V186 = Object.freeze(['left', 'right', 'jump', 'guard', 'light', 'heavy', 'special', 'super']);
export const XENO_TRIALS_GAMEPAD_MAPPING_V186 = Object.freeze({ deadzone: .30, triggerThreshold: .55,
  left: 'Left stick / D-pad left', right: 'Left stick / D-pad right', jump: 'A / D-pad up',
  guard: 'LT / LB / D-pad down', light: 'X', heavy: 'Y', special: 'B', super: 'RT / RB', pause: 'Start / Back' });
const empty = () => Object.fromEntries(XENO_TRIALS_GAMEPAD_ACTIONS_V186.map(action => [action, false]));
const axis = value => Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0;
const button = (pad, index, threshold = .5) => {
  const value = pad.buttons?.[index];
  return value?.value !== undefined ? Number.isFinite(value.value) && value.value >= threshold : value?.pressed === true;
};
const compatible = pad => pad && pad.connected !== false && pad.mapping === 'standard'
  && Number.isInteger(pad.index) && pad.index >= 0;

export function createXenoTrialsGamepadV186() {
  let owner = null, needsNeutral = true, pauseArmed = false;
  function reset() { needsNeutral = true; pauseArmed = false; }
  function sample(gamepads, { active = false, paused = false, focused = true, allowInteract = false } = {}) {
    const pads = Array.from(gamepads || []).filter(compatible);
    let pad = owner === null ? null : pads.find(pad => pad.index === owner);
    const disconnected = owner !== null && !pad;
    if (disconnected) { owner = null; reset(); }
    // A disconnect is delivered before another controller can become owner.
    // New ownership always requires a neutral sample, even on the same index.
    if (!pad && !disconnected) {
      pad = pads[0] || null;
      if (pad) { owner = pad.index; reset(); }
    }
    if (!pad) return { input: empty(), pauseToggle: false, connected: false, disconnected,
      index: null, needsNeutral: true };
    const horizontal = axis(pad.axes?.[0]);
    const input = {
      left: horizontal < -.30 || button(pad, 14), right: horizontal > .30 || button(pad, 15),
      jump: button(pad, 0) || button(pad, 12),
      guard: button(pad, 6, .55) || button(pad, 4) || button(pad, 13),
      light: button(pad, 2), heavy: button(pad, 3), special: button(pad, 1),
      super: button(pad, 7, .55) || button(pad, 5),
      ...(allowInteract ? { interact: button(pad, 10) } : {})
    };
    const combatHeld = Object.values(input).some(Boolean);
    if (input.left && input.right) input.left = input.right = false;
    const pausePressed = button(pad, 9) || button(pad, 8);
    const neutral = !pausePressed && !combatHeld;
    if (!focused) { reset(); return { input: empty(), pauseToggle: false, connected: true, disconnected: false,
      index: owner, needsNeutral }; }
    const pauseToggle = pausePressed && pauseArmed;
    if (pausePressed) pauseArmed = false;
    else if (neutral) pauseArmed = true;
    if (!active || paused || pauseToggle) needsNeutral = true;
    // A neutral frame acknowledges release; it never also dispatches an action.
    if (neutral) needsNeutral = false;
    return { input: active && !paused && !needsNeutral && !pauseToggle ? input : empty(), pauseToggle,
      connected: true, disconnected: false, index: owner, needsNeutral };
  }
  return Object.freeze({ sample, reset });
}
