import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMBAT_AIM_DEADZONE_V83,
  COMBAT_AIM_DIRECTIONS_V83,
  COMBAT_AIM_KEY_BINDINGS_V83,
  resolveCombatAimV83,
  readKeyboardCombatAimV83,
  readGamepadCombatAimV83,
  readTouchCombatAimV83,
  resolveCombatMuzzleV83,
  buildCombatShotVectorsV83,
  buildCombatRayV83
} from '../src/combat-aim-v83.js';

const close = (actual, expected, message = '') => assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} != ${expected}`);
const vectorClose = (actual, expected) => { close(actual.x, expected.x, 'x'); close(actual.y, expected.y, 'y'); };
const inputs = {
  right: [1, 0], 'down-right': [1, 1], down: [0, 1], 'down-left': [-1, 1],
  left: [-1, 0], 'up-left': [-1, -1], up: [0, -1], 'up-right': [1, -1]
};
const marine = Object.freeze({ x: 100, y: 200, w: 42, h: 92, facing: 1, crouching: false });

test('les huit directions ont une norme unitaire sans accélération diagonale', () => {
  assert.equal(Object.keys(COMBAT_AIM_DIRECTIONS_V83).length, 8);
  for (const [direction, [x, y]] of Object.entries(inputs)) {
    const aim = resolveCombatAimV83({ x, y, facing: -1 });
    assert.equal(aim.direction, direction);
    assert.equal(aim.active, true);
    close(Math.hypot(aim.x, aim.y), 1, direction);
    vectorClose(aim, COMBAT_AIM_DIRECTIONS_V83[direction]);
    close(Math.cos(aim.angleRadians), aim.x);
    close(Math.sin(aim.angleRadians), aim.y);
    assert.equal(aim.facing, x === 0 ? -1 : Math.sign(x));
    assert.equal(Object.isFrozen(aim), true);
  }
});

test('la quantification suit le secteur le plus proche de part et d’autre des limites et de π', () => {
  const angleAim = angle => resolveCombatAimV83({ x: Math.cos(angle), y: Math.sin(angle) });
  assert.equal(angleAim(Math.PI / 8 - 1e-7).direction, 'right');
  assert.equal(angleAim(Math.PI / 8 + 1e-7).direction, 'down-right');
  assert.equal(angleAim(-Math.PI / 8 - 1e-7).direction, 'up-right');
  assert.equal(angleAim(-Math.PI / 8 + 1e-7).direction, 'right');
  assert.equal(angleAim(Math.PI - 1e-7).direction, 'left');
  assert.equal(angleAim(-Math.PI + 1e-7).direction, 'left');
});

test('la deadzone radiale élimine la dérive de stick sans supprimer les diagonales utiles', () => {
  assert.equal(COMBAT_AIM_DEADZONE_V83, 0.25);
  assert.equal(resolveCombatAimV83({ x: 0.25, y: 0, facing: -1 }).active, false);
  assert.equal(resolveCombatAimV83({ x: 0.25001, y: 0 }).active, true);
  assert.equal(resolveCombatAimV83({ x: 0.2, y: -0.2 }).direction, 'up-right');
  assert.equal(resolveCombatAimV83({ x: 0.1, y: -0.1, facing: -1 }).direction, 'left');
  assert.equal(resolveCombatAimV83({ x: 0.1, deadzone: 0 }).active, true);
  assert.equal(resolveCombatAimV83({ x: 0.1, deadzone: Number.NaN }).active, false);
  const malformed = resolveCombatAimV83({ x: Number.POSITIVE_INFINITY, y: Number.NaN, facing: -1 });
  assert.equal(malformed.active, false);
  assert.equal(malformed.direction, 'left');
  const large = resolveCombatAimV83({ x: 1e308, y: -1e308 });
  assert.equal(large.direction, 'up-right');
  close(Math.hypot(large.x, large.y), 1);
});

test('les tirs verticaux et le relâchement conservent le dernier facing fourni par le runtime', () => {
  let facing = 1;
  for (const [input, expectedDirection, expectedFacing] of [
    [{ x: -1, y: 0 }, 'left', -1],
    [{ x: 0, y: -1 }, 'up', -1],
    [{ x: 0, y: 1 }, 'down', -1],
    [{ x: 0, y: 0 }, 'left', -1],
    [{ x: 1, y: -1 }, 'up-right', 1],
    [{ x: 0, y: 0 }, 'right', 1]
  ]) {
    const aim = resolveCombatAimV83({ ...input, facing });
    assert.equal(aim.direction, expectedDirection);
    assert.equal(aim.facing, expectedFacing);
    facing = aim.facing;
  }
});

test('les directions numériques opposées se neutralisent sans arbitrage aléatoire', () => {
  assert.equal(resolveCombatAimV83({ left: true, right: true, facing: -1 }).direction, 'left');
  assert.equal(resolveCombatAimV83({ left: true, right: true, facing: -1 }).active, false);
  assert.equal(resolveCombatAimV83({ up: true, down: true, facing: 1 }).active, false);
  assert.equal(resolveCombatAimV83({ x: -1, y: 1, right: true, up: true }).direction, 'up-right');
  assert.equal(resolveCombatAimV83({ left: true, right: true, up: true, facing: -1 }).direction, 'up');
});

test('les adaptateurs clavier J1/J2 lisent leurs touches sans consommer saut ou échelle', () => {
  const keys = new Set(['KeyD', 'KeyW', 'Space', 'KeyU', 'KeyJ', 'KeyK']);
  const before = [...keys];
  assert.equal(resolveCombatAimV83(readKeyboardCombatAimV83(keys)).direction, 'up-right');
  assert.equal(resolveCombatAimV83(readKeyboardCombatAimV83(keys, COMBAT_AIM_KEY_BINDINGS_V83.coop)).direction, 'down-left');
  assert.deepEqual([...keys], before);
  assert.equal(resolveCombatAimV83(readKeyboardCombatAimV83(new Set(['Space', 'KeyU']))).active, false);
  assert.equal(resolveCombatAimV83(readKeyboardCombatAimV83(['ArrowLeft', 'ArrowDown'])).direction, 'down-left');
  const custom = readKeyboardCombatAimV83(new Set(['Numpad8']), { up: 'Numpad8' });
  assert.equal(resolveCombatAimV83(custom).direction, 'up');
  assert.equal(Object.isFrozen(custom), true);
});

test('la manette vise avec le stick droit et laisse stick gauche, D-pad et saut intacts', () => {
  const pad = { mapping: 'standard', connected: true, axes: [-1, 1, 0.8, -0.8], buttons: [{ pressed: true }] };
  const before = structuredClone(pad);
  assert.equal(resolveCombatAimV83(readGamepadCombatAimV83(pad)).direction, 'up-right');
  assert.deepEqual(pad, before);
  assert.equal(resolveCombatAimV83(readGamepadCombatAimV83({ ...pad, axes: [-1, 1, 0, 0] })).active, false);
  assert.equal(resolveCombatAimV83(readGamepadCombatAimV83({ ...pad, connected: false })).active, false);
  assert.equal(resolveCombatAimV83(readGamepadCombatAimV83({ ...pad, mapping: '' })).active, false);
  assert.equal(resolveCombatAimV83(readGamepadCombatAimV83(null)).active, false);
  assert.equal(resolveCombatAimV83(readGamepadCombatAimV83({ ...pad, axes: [1, -1] })).active, false);
  assert.equal(resolveCombatAimV83(readGamepadCombatAimV83(pad, { xAxis: 0, yAxis: 1 })).direction, 'down-left');
});

test('le pad tactile et le joystick virtuel représentent les mêmes huit directions', () => {
  for (const [direction, [x, y]] of Object.entries(inputs)) {
    const digital = resolveCombatAimV83(readTouchCombatAimV83(direction));
    const analog = resolveCombatAimV83(readTouchCombatAimV83({ x, y }));
    assert.equal(digital.direction, direction);
    assert.equal(analog.direction, direction);
  }
  assert.equal(resolveCombatAimV83(readTouchCombatAimV83('unknown')).active, false);
  assert.equal(resolveCombatAimV83(readTouchCombatAimV83('__proto__')).active, false);
  assert.equal(resolveCombatAimV83(readTouchCombatAimV83(null)).active, false);
  const frozenInput = Object.freeze({ x: -0.9, y: -0.9 });
  assert.equal(resolveCombatAimV83(readTouchCombatAimV83(frozenInput)).direction, 'up-left');
});

test('la bouche d’arme conserve le placement historique horizontal debout et accroupi', () => {
  for (const facing of [-1, 1]) {
    const aim = resolveCombatAimV83({ x: facing });
    const standing = resolveCombatMuzzleV83(marine, aim);
    const crouched = resolveCombatMuzzleV83({ ...marine, crouching: true }, aim);
    close(standing.x, marine.x + marine.w / 2 + facing * 24);
    close(standing.y, marine.y + 37);
    close(crouched.x, standing.x);
    close(crouched.y, marine.y + 51);
  }
  assert.deepEqual(marine, { x: 100, y: 200, w: 42, h: 92, facing: 1, crouching: false });
});

test('les huit bouches tournent autour de l’épaule sans allonger les diagonales', () => {
  for (const [x, y] of Object.values(inputs)) {
    const aim = resolveCombatAimV83({ x, y });
    const muzzle = resolveCombatMuzzleV83(marine, aim);
    close(Math.hypot(muzzle.x - muzzle.pivotX, muzzle.y - muzzle.pivotY), 24);
    close((muzzle.x - muzzle.pivotX) / 24, aim.x);
    close((muzzle.y - muzzle.pivotY) / 24, aim.y);
    close(muzzle.pivotX, 121);
    close(muzzle.pivotY, 237);
  }
  const turret = resolveCombatMuzzleV83(marine, resolveCombatAimV83({ x: -1, y: -1 }), { pivotX: 700, pivotY: 300, barrelLength: 62 });
  close(Math.hypot(turret.x - 700, turret.y - 300), 62);
  const scaled = resolveCombatMuzzleV83({ ...marine, w: 84, h: 184 }, resolveCombatAimV83({ x: 1 }), { barrelLength: 48 });
  close(scaled.x, marine.x + 42 + 48);
  close(scaled.y, marine.y + 74);
});

test('un éventail de plombs est symétrique et garde la vitesse de chaque projectile dans les huit visées', () => {
  for (const [x, y] of Object.values(inputs)) {
    const aim = resolveCombatAimV83({ x, y });
    const shots = buildCombatShotVectorsV83(aim, { count: 5, spreadRadians: Math.PI / 6, speed: 890 });
    assert.equal(shots.length, 5);
    close(shots[0].spreadOffsetRadians, -Math.PI / 12);
    close(shots[4].spreadOffsetRadians, Math.PI / 12);
    for (const shot of shots) {
      close(Math.hypot(shot.vx, shot.vy), 890);
      close(Math.hypot(shot.direction.x, shot.direction.y), 1);
      assert.equal(Object.hasOwn(shot, 'x'), false, 'ne pas écraser le muzzle en fusionnant les objets');
      assert.equal(Object.hasOwn(shot, 'y'), false);
      assert.equal(Object.isFrozen(shot), true);
    }
    vectorClose(shots[2].direction, aim);
    const leftProjection = shots[0].direction.x * aim.x + shots[0].direction.y * aim.y;
    const rightProjection = shots[4].direction.x * aim.x + shots[4].direction.y * aim.y;
    close(leftProjection, rightProjection);
  }
});

test('rayons et projectiles partent du même muzzle et suivent la même direction et portée', () => {
  for (const [x, y] of Object.values(inputs)) {
    const aim = resolveCombatAimV83({ x, y, facing: -1 });
    const muzzle = resolveCombatMuzzleV83(marine, aim);
    const [shot] = buildCombatShotVectorsV83(aim, { speed: 500 });
    const ray = buildCombatRayV83(muzzle, aim, 1250);
    vectorClose(ray.start, muzzle);
    close(Math.hypot(ray.end.x - ray.start.x, ray.end.y - ray.start.y), 1250);
    close(ray.start.x + shot.vx * 2.5, ray.end.x);
    close(ray.start.y + shot.vy * 2.5, ray.end.y);
    vectorClose(ray.direction, shot.direction);
  }
});

test('les limites des helpers ne produisent ni éventails infinis ni NaN pour une entrée absente', () => {
  assert.equal(buildCombatShotVectorsV83({}, { count: 100000 }).length, 64);
  assert.equal(buildCombatShotVectorsV83({}, { count: 0 }).length, 1);
  const [single] = buildCombatShotVectorsV83({ x: 0, y: -1 }, { count: 1, spreadRadians: 2, speed: 0 });
  assert.equal(single.spreadOffsetRadians, 0);
  assert.equal(single.vx, 0);
  assert.equal(Math.abs(single.vy), 0);
  const ray = buildCombatRayV83({ x: Number.NaN, y: Number.POSITIVE_INFINITY }, {}, -1);
  assert.deepEqual(ray.start, { x: 0, y: 0 });
  assert.deepEqual(ray.end, { x: 0, y: 0 });
  assert.equal(ray.range, 0);
  const muzzle = resolveCombatMuzzleV83(null, {}, { barrelLength: -10 });
  assert.ok(Number.isFinite(muzzle.x) && Number.isFinite(muzzle.y));
  assert.equal(muzzle.barrelLength, 0);
});
