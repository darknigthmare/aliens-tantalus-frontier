/** Pure 8-way aiming in canvas coordinates: +x right, +y down.
 * Input adapters only read state. Movement, ladders, jumps and firing stay owned
 * by the runtime; a right-stick aim must never synthesize a movement key.
 */
export const COMBAT_AIM_DEADZONE_V83 = 0.25;
const DIAGONAL = Math.SQRT1_2;
const STEP = Math.PI / 4;
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const bounded = (value, minimum, maximum, fallback) => Math.max(minimum, Math.min(maximum, finite(value, fallback)));
const facingSign = value => finite(value, 1) < 0 ? -1 : 1;

export const COMBAT_AIM_DIRECTIONS_V83 = Object.freeze({
  right: Object.freeze({ x: 1, y: 0, angleRadians: 0 }),
  'down-right': Object.freeze({ x: DIAGONAL, y: DIAGONAL, angleRadians: STEP }),
  down: Object.freeze({ x: 0, y: 1, angleRadians: STEP * 2 }),
  'down-left': Object.freeze({ x: -DIAGONAL, y: DIAGONAL, angleRadians: STEP * 3 }),
  left: Object.freeze({ x: -1, y: 0, angleRadians: Math.PI }),
  'up-left': Object.freeze({ x: -DIAGONAL, y: -DIAGONAL, angleRadians: -STEP * 3 }),
  up: Object.freeze({ x: 0, y: -1, angleRadians: -STEP * 2 }),
  'up-right': Object.freeze({ x: DIAGONAL, y: -DIAGONAL, angleRadians: -STEP })
});
const DIRECTION_NAMES = Object.freeze(Object.keys(COMBAT_AIM_DIRECTIONS_V83));

export const COMBAT_AIM_KEY_BINDINGS_V83 = Object.freeze({
  player: Object.freeze({
    left: Object.freeze(['KeyA', 'ArrowLeft']), right: Object.freeze(['KeyD', 'ArrowRight']),
    up: Object.freeze(['KeyW', 'ArrowUp']), down: Object.freeze(['KeyS', 'ArrowDown'])
  }),
  coop: Object.freeze({
    left: Object.freeze(['KeyJ']), right: Object.freeze(['KeyL']),
    up: Object.freeze(['KeyI']), down: Object.freeze(['KeyK'])
  })
});

/** Neutral input returns horizontal aim using the supplied last facing.
 * Vertical aim preserves that facing. Digital opposing directions cancel;
 * when any digital direction is held it takes precedence over analog x/y.
 */
export function resolveCombatAimV83(input = {}) {
  const state = input || {};
  const facing = facingSign(state.facing);
  const digital = ['left', 'right', 'up', 'down'].some(key => state[key] === true);
  const x = digital ? Number(state.right === true) - Number(state.left === true) : finite(state.x);
  const y = digital ? Number(state.down === true) - Number(state.up === true) : finite(state.y);
  const deadzone = bounded(state.deadzone, 0, 0.95, COMBAT_AIM_DEADZONE_V83);
  const active = Math.hypot(x, y) > deadzone;
  const sector = active ? ((Math.round(Math.atan2(y, x) / STEP) % 8) + 8) % 8 : facing < 0 ? 4 : 0;
  const direction = DIRECTION_NAMES[sector];
  const vector = COMBAT_AIM_DIRECTIONS_V83[direction];
  return Object.freeze({
    ...vector,
    direction,
    facing: vector.x === 0 ? facing : Math.sign(vector.x),
    active
  });
}

export function readKeyboardCombatAimV83(keys, bindings = COMBAT_AIM_KEY_BINDINGS_V83.player) {
  const held = code => Boolean(keys?.has?.(code) || Array.isArray(keys) && keys.includes(code));
  const pressed = action => {
    const codes = bindings?.[action];
    return (Array.isArray(codes) ? codes : typeof codes === 'string' ? [codes] : []).some(held);
  };
  const left = pressed('left'), right = pressed('right'), up = pressed('up'), down = pressed('down');
  return Object.freeze({ x: Number(right) - Number(left), y: Number(down) - Number(up), left, right, up, down, source: 'keyboard' });
}

/** The standard right stick is independent of movement stick/D-pad and jump A.
 * Reconnect/neutral suppression remains the responsibility of MissionGamepadInput.
 */
export function readGamepadCombatAimV83(pad, { xAxis = 2, yAxis = 3 } = {}) {
  const available = pad && pad.connected !== false && pad.mapping === 'standard';
  const readAxis = index => available && Number.isInteger(index) && index >= 0
    ? bounded(pad.axes?.[index], -1, 1, 0) : 0;
  return Object.freeze({ x: readAxis(xAxis), y: readAxis(yAxis), source: 'gamepad' });
}

/** Accepts one canonical direction from a touch aim pad, or virtual-stick x/y. */
export function readTouchCombatAimV83(input) {
  const vector = typeof input === 'string' && Object.hasOwn(COMBAT_AIM_DIRECTIONS_V83, input)
    ? COMBAT_AIM_DIRECTIONS_V83[input] : input && typeof input === 'object' ? input : {};
  return Object.freeze({ x: bounded(vector.x, -1, 1, 0), y: bounded(vector.y, -1, 1, 0), source: 'touch' });
}

function unitDirection(aim = {}, fallbackFacing = 1) {
  const x = finite(aim?.x), y = finite(aim?.y);
  const scale = Math.max(Math.abs(x), Math.abs(y));
  if (!scale) return { x: facingSign(aim?.facing ?? fallbackFacing), y: 0 };
  const scaledX = x / scale, scaledY = y / scale;
  const length = Math.hypot(scaledX, scaledY);
  return { x: scaledX / length, y: scaledY / length };
}

/** Rotate the muzzle around a stable shoulder pivot. The default 42x92 marine
 * exactly retains its original horizontal muzzle (37px standing, 51px crouched).
 * Absolute pivot overrides and barrel length also support a mounted turret.
 */
export function resolveCombatMuzzleV83(actor = {}, aim = {}, options = {}) {
  const body = actor || {};
  const width = Math.max(0, finite(body.w, 42));
  const height = Math.max(0, finite(body.h, 92));
  const pivotX = finite(options.pivotX, finite(body.x) + width / 2);
  const pivotY = finite(options.pivotY, finite(body.y) + height * (body.crouching ? 51 / 92 : 37 / 92));
  const barrelLength = Math.max(0, finite(options.barrelLength, 24));
  const direction = unitDirection(aim, body.facing);
  return Object.freeze({
    x: pivotX + direction.x * barrelLength,
    y: pivotY + direction.y * barrelLength,
    pivotX,
    pivotY,
    barrelLength
  });
}

/** A deterministic symmetric spread. spreadRadians is the total cone width.
 * All pellets keep the requested speed; no random source or time is sampled.
 * Direction lives under its own key so merging a shot cannot overwrite muzzle x/y.
 */
export function buildCombatShotVectorsV83(aim = {}, options = {}) {
  const direction = unitDirection(aim);
  const center = Math.atan2(direction.y, direction.x);
  const count = Math.trunc(bounded(options.count, 1, 64, 1));
  const spread = bounded(options.spreadRadians, 0, Math.PI, 0);
  const speed = Math.max(0, finite(options.speed, 890));
  return Object.freeze(Array.from({ length: count }, (_, index) => {
    const spreadOffsetRadians = count === 1 ? 0 : (index / (count - 1) - 0.5) * spread;
    const angle = center + spreadOffsetRadians;
    const vector = spreadOffsetRadians === 0 ? direction : { x: Math.cos(angle), y: Math.sin(angle) };
    return Object.freeze({
      direction: Object.freeze({ ...vector }),
      vx: vector.x * speed,
      vy: vector.y * speed,
      angleRadians: Math.atan2(vector.y, vector.x),
      spreadOffsetRadians
    });
  }));
}

/** Hitscan/beam geometry shares the exact supplied muzzle and aim with bullets.
 * Collision/occlusion truncation remains owned by the world collision system.
 */
export function buildCombatRayV83(origin = {}, aim = {}, range = 950) {
  const direction = unitDirection(aim);
  const distance = Math.max(0, finite(range, 950));
  const start = Object.freeze({ x: finite(origin?.x), y: finite(origin?.y) });
  return Object.freeze({
    start,
    end: Object.freeze({ x: start.x + direction.x * distance, y: start.y + direction.y * distance }),
    direction: Object.freeze(direction),
    range: distance
  });
}
