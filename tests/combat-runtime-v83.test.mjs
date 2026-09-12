import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { ALPHA_BRAVO_CAMPAIGN_V69 } from '../src/alpha-bravo-coop-v69.js';
import { CAMPAIGNS, CREW, ENEMIES, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';

// Independent expected geometry: do not reuse the production aiming resolver as an oracle.
const D = Math.SQRT1_2;
const DIRECTIONS = [
  ['right', 1, 0], ['down-right', D, D], ['down', 0, 1], ['down-left', -D, D],
  ['left', -1, 0], ['up-left', -D, -D], ['up', 0, -1], ['up-right', D, -D]
];
const FAMILIES = ['ballistic', 'smart', 'flame', 'explosive', 'electric', 'silent', 'energy',
  'melee', 'tool', 'sonic', 'acid', 'cryo', 'chemical', 'sentry'];
const close = (actual, expected, message, tolerance = 1e-8) => {
  assert.ok(Number.isFinite(actual), `${message}: expected a finite value, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`);
};

function withRuntime(run, family = 'ballistic') {
  const names = ['Image', 'addEventListener', 'requestAnimationFrame', 'document', 'navigator'];
  const previous = new Map(names.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const listeners = new Map();
  const listen = (type, callback) => listeners.set(type, [...(listeners.get(type) || []), callback]);
  const frames = [], pads = [], events = [];
  const document = { hidden: false, activeElement: null, addEventListener: listen };
  const mocks = {
    Image: class {
      constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
      set src(value) { this.currentSrc = value; }
    },
    addEventListener: listen,
    requestAnimationFrame: callback => { frames.push(callback); return frames.length; },
    document, navigator: { getGamepads: () => pads }
  };
  for (const [key, value] of Object.entries(mocks)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const canvas = {
    width: 1280, height: 720, getContext: () => ({}), addEventListener() {},
    focus() { document.activeElement = canvas; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 })
  };
  const engine = new GameEngine(canvas, { onEvent: event => events.push(event) });
  const world = WORLDS.find(entry => entry.biomes.includes('industrial')) || WORLDS[0];
  const weapon = WEAPONS.find(entry => entry.family === family);
  assert.ok(weapon, `Real catalogue weapon required for ${family}`);
  const options = {
    seed: 830083, world, weapon, crew: CREW,
    vehicle: VEHICLES.find(entry => entry.family === 'ground'),
    campaign: { ...CAMPAIGNS[0], id: 'combat-v83', worldId: world.id, objective: 'restore atmospheric processing' },
    levelSeed: { ...LEVEL_SEEDS[0], id: 'combat-level-v83', seed: 830083, worldId: world.id, objective: 'restore atmospheric processing' },
    enemyCatalog: ENEMIES.slice(0, 52), difficulty: 'standard', accessibility: { aimAssist: 'off' }
  };
  const dispatch = (type, options = {}) => {
    const event = { code: '', repeat: false, preventDefault() {}, ...options };
    for (const callback of listeners.get(type) || []) callback(event);
  };
  try {
    engine.start(options);
    engine.setCoop(true);
    engine.enemies = []; engine.hazards = []; engine.walls = []; engine.doors = [];
    engine.accessibilityRuntime = { ...engine.accessibilityRuntime, aimAssistStrength: 0 };
    for (const actor of [engine.player, engine.coop]) Object.assign(actor, {
      x: 1000, y: 500, w: 42, h: 92, facing: 1, weaponMode: 'rifle',
      ammo: 30, ammoReserve: 60, fireClock: 0, reloading: false, meleeClock: 0,
      actionClock: 0, shots: 0, alive: true, inVehicle: false,
      gamepadAimV83: null, pointerAimV83: null
    });
    return run({ engine, options, events, dispatch, pads });
  } finally {
    engine.stop();
    for (const [key, descriptor] of previous) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
  }
}

function expectShot(engine, actor, x, y, { speed = 890, family, explicit = true } = {}) {
  const bulletsBefore = engine.bullets.length;
  const ammoBefore = actor.ammo;
  const reserveBefore = actor.ammoReserve;
  const shotsBefore = actor.shots;
  const profile = engine.weaponProfile(actor);
  assert.equal(engine.fire(actor), true);
  assert.equal(engine.bullets.length, bulletsBefore + 1, 'one actual shot, not an implicit melee replacement');
  const bullet = engine.bullets.at(-1);
  assert.equal(bullet.owner, actor);
  if (family) assert.equal(bullet.family, family);
  close(Math.hypot(bullet.vx, bullet.vy), speed, 'isotropic projectile speed');
  close(bullet.vx / speed, x, 'unit direction x');
  close(bullet.vy / speed, y, 'unit direction y');
  close(Math.cos(bullet.angleRadians), x, 'render angle x');
  close(Math.sin(bullet.angleRadians), y, 'render angle y');
  assert.equal(bullet.aimExplicitV83, explicit, 'explicit aim provenance');
  close(actor.fireClock, profile.interval, 'weapon cooldown');
  assert.equal(actor.shots, shotsBefore + 1);
  if (!actor.inVehicle) assert.equal(actor.ammo, ammoBefore - 1);
  assert.equal(actor.ammoReserve, reserveBefore);
  const state = [engine.bullets.length, actor.ammo, actor.ammoReserve, actor.shots, actor.fireClock];
  assert.equal(engine.fire(actor), false, 'held trigger cannot bypass cooldown');
  assert.deepEqual([engine.bullets.length, actor.ammo, actor.ammoReserve, actor.shots, actor.fireClock], state);
  return bullet;
}

test('coverage contract includes all 14 real catalogue families, eight directions and two players', () => {
  assert.deepEqual([...new Set(WEAPONS.map(entry => entry.family))].sort(), [...FAMILIES].sort());
  assert.equal(FAMILIES.length * DIRECTIONS.length * 2, 224);
});

for (const family of FAMILIES) for (const role of ['player', 'coop']) {
  test(`${family}: ${role} fires all eight physical directions with independent ammo and cooldown`, () => withRuntime(({ engine }) => {
    const actor = engine[role];
    const other = engine[role === 'player' ? 'coop' : 'player'];
    const untouched = [other.ammo, other.ammoReserve, other.fireClock, other.shots, other.facing];
    for (const [direction, x, y] of DIRECTIONS) {
      actor.fireClock = 0;
      actor.gamepadAimV83 = { x, y, source: 'gamepad' };
      const bullet = expectShot(engine, actor, x, y, { family });
      close(bullet.x, actor.x + actor.w / 2 + x * 24, `${direction} muzzle x`);
      close(bullet.y, actor.y + actor.h * 37 / 92 + y * 24, `${direction} muzzle y`);
      assert.deepEqual([other.ammo, other.ammoReserve, other.fireClock, other.shots, other.facing], untouched, 'other player remains independent');
    }
    assert.equal(actor.ammo, 22);
  }, family));
}

for (const role of ['player', 'coop']) {
  test(`${role}: explicit aiming is not stolen by a nearby enemy behind the body`, () => withRuntime(({ engine, events }) => {
    const actor = engine[role];
    const enemy = { id: 'close-behind', x: actor.x - 48, y: actor.y, w: 42, h: 92, alive: true, health: 1000, armor: 0 };
    engine.enemies = [enemy];
    actor.pointerAimV83 = { x: D, y: -D, source: 'touch' };
    expectShot(engine, actor, D, -D);
    assert.equal(enemy.health, 1000);
    assert.equal(actor.meleeClock, 0);
    assert.equal(events.some(event => event.type === 'melee'), false);
    assert.equal(actor.facing, 1);
  }));

  test(`${role}: explicit aiming is not replaced even by a close enemy ahead`, () => withRuntime(({ engine, events }) => {
    const actor = engine[role];
    engine.enemies = [{ id: 'close-ahead', x: actor.x + 48, y: actor.y, w: 42, h: 92, alive: true, health: 1000, armor: 0 }];
    actor.gamepadAimV83 = { x: 0, y: -1 };
    expectShot(engine, actor, 0, -1);
    assert.equal(events.some(event => event.type === 'melee'), false);
  }));

  test(`${role}: mounted turret keeps eight-way speed, angle and vehicle-only ammo consumption`, () => withRuntime(({ engine }) => {
    const actor = engine[role];
    Object.assign(engine.vehicle, {
      active: true, occupied: true, driver: actor, canFire: true, turretAmmo: 20, destroyed: false,
      // This test starts after the separately tested animated embark/secure phase.
      accessTransition: null, squadAccessRuntime: null, accessSecureClock: 0
    });
    actor.inVehicle = true;
    const personalAmmo = actor.ammo;
    for (const [direction, x, y] of DIRECTIONS) {
      actor.fireClock = 0;
      actor.gamepadAimV83 = { x, y };
      const turretBefore = engine.vehicle.turretAmmo;
      const bullet = expectShot(engine, actor, x, y, { speed: 1100, family: 'sentry' });
      assert.equal(bullet.kind, 'apc-turret');
      assert.equal(engine.vehicle.turretAmmo, turretBefore - 1, direction);
      assert.equal(actor.ammo, personalAmmo, 'personal magazine untouched');
      close(bullet.x, engine.vehicle.x + engine.vehicle.w / 2 + x * 62, 'turret muzzle x');
      close(bullet.y, engine.vehicle.y + 28 + y * 62, 'turret muzzle y');
    }
  }));
}

test('neutral forward contextual melee remains available without consuming ammunition', () => withRuntime(({ engine, events }) => {
  const actor = engine.player;
  engine.enemies = [{ id: 'melee-ahead', x: actor.x + 48, y: actor.y, w: 42, h: 92, alive: true, health: 1000, armor: 0 }];
  const ammo = actor.ammo;
  assert.equal(engine.fire(actor), true);
  assert.equal(engine.bullets.length, 0);
  assert.equal(actor.ammo, ammo);
  assert.ok(actor.meleeClock > 0);
  assert.ok(events.some(event => event.type === 'melee'));
}));

test('keyboard J1 and J2 aim are separate; pointer/gamepad aiming never creates movement keys', () => withRuntime(({ engine, dispatch }) => {
  dispatch('keydown', { code: 'KeyW' });
  dispatch('keydown', { code: 'KeyD' });
  dispatch('keydown', { code: 'KeyK' });
  dispatch('keydown', { code: 'KeyJ' });
  expectShot(engine, engine.player, D, -D);
  expectShot(engine, engine.coop, -D, D);
  for (const code of ['KeyW', 'KeyD', 'KeyK', 'KeyJ']) dispatch('keyup', { code });
  const before = [...engine.keys];
  engine.player.gamepadAimV83 = { x: 0, y: -1 };
  engine.coop.pointerAimV83 = { x: 0, y: 1, source: 'touch' };
  const p1 = engine.resolvePlayerCombatAimV83(engine.player);
  const p2 = engine.resolvePlayerCombatAimV83(engine.coop);
  close(p1.y, -1, 'J1 stick aim'); close(p2.y, 1, 'J2 pointer aim');
  assert.deepEqual([...engine.keys], before);
}));

test('aim assist never bends an explicitly requested diagonal or vertical shot', () => withRuntime(({ engine }) => {
  engine.accessibilityRuntime = { ...engine.accessibilityRuntime, aimAssistStrength: 1 };
  const actor = engine.player;
  engine.enemies = [{ id: 'assist-distractor', x: actor.x + 350, y: actor.y + 100, w: 50, h: 90, alive: true }];
  for (const [, x, y] of DIRECTIONS) {
    actor.fireClock = 0; actor.gamepadAimV83 = { x, y };
    const bullet = expectShot(engine, actor, x, y);
    assert.equal(bullet.aimAssistTargetId, undefined);
  }
}));

for (const blocker of ['wall', 'closed-door']) {
  test(`aim assist ignores enemies hidden behind a ${blocker}`, () => withRuntime(({ engine }) => {
    const actor = engine.player;
    const bullet = expectShot(engine, actor, 1, 0, { explicit: false });
    const obstacle = { id: 'assist-blocker', x: bullet.x + 120, y: bullet.y - 250, w: 40, h: 500, destroyed: false, progress: 0, open: false };
    engine.platforms = [];
    engine.enemies = [{ id: 'occluded-enemy', x: bullet.x + 320, y: bullet.y - 20, w: 48, h: 80, alive: true }];
    engine.accessibilityRuntime = { ...engine.accessibilityRuntime, aimAssistStrength: 1 };
    const unobstructed = { ...bullet };
    assert.equal(engine.applyAimAssist(unobstructed, actor), true, 'target is inside the assist cone before adding the blocker');
    assert.equal(unobstructed.aimAssistTargetId, 'occluded-enemy');
    if (blocker === 'wall') engine.walls = [obstacle];
    else engine.doors = [obstacle];
    assert.equal(engine.applyAimAssist(bullet, actor), false);
    close(bullet.vx, 890, 'blocked assistance preserves vx');
    close(bullet.vy, 0, 'blocked assistance preserves vy');
    assert.equal(bullet.aimAssistTargetId, undefined);
  }));
}

test('permitted aim assistance preserves velocity norm and rendering angle', () => withRuntime(({ engine }) => {
  const actor = engine.player;
  const bullet = expectShot(engine, actor, 1, 0, { explicit: false });
  engine.enemies = [{ id: 'visible-enemy', x: bullet.x + 400, y: bullet.y - 15, w: 48, h: 80, alive: true }];
  engine.accessibilityRuntime = { ...engine.accessibilityRuntime, aimAssistStrength: 1 };
  assert.equal(engine.applyAimAssist(bullet, actor), true);
  assert.equal(bullet.aimAssistTargetId, 'visible-enemy');
  assert.ok(bullet.vy > 0);
  close(Math.hypot(bullet.vx, bullet.vy), 890, 'assisted speed');
  close(Math.cos(bullet.angleRadians), bullet.vx / 890, 'assisted angle x');
  close(Math.sin(bullet.angleRadians), bullet.vy / 890, 'assisted angle y');
}));

test('pause, atlas load and disabled J2 cannot create a projectile or consume ammunition', () => withRuntime(({ engine }) => {
  engine.player.gamepadAimV83 = { x: D, y: -D };
  const before = [engine.player.ammo, engine.player.shots, engine.bullets.length];
  for (const flag of ['paused', 'enemyAtlasLoadingPausedV65']) {
    engine[flag] = true;
    assert.equal(engine.fire(engine.player), false);
    assert.deepEqual([engine.player.ammo, engine.player.shots, engine.bullets.length], before);
    engine[flag] = false;
  }
  engine.setCoop(false);
  const coopAmmo = engine.coop.ammo;
  assert.equal(engine.fire(engine.coop), false);
  assert.equal(engine.coop.ammo, coopAmmo);
}));

const PLAYER_CONTROLS = {
  player: { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' },
  coop: { left: 'KeyJ', right: 'KeyL', up: 'KeyI', down: 'KeyK', jump: 'KeyU', fire: 'KeyO' }
};

function placeOnTestDeck(engine, actor) {
  engine.platforms = [{ id: 'test-floor-v83', x: 0, y: 930, w: 6200, h: 150, floor: true }];
  engine.walls = []; engine.doors = []; engine.covers = []; engine.hazards = []; engine.ladders = []; engine.lifts = [];
  Object.assign(actor, {
    x: 1000, y: 930 - actor.h, vx: 0, vy: 0, grounded: true, climbing: false, crouching: false,
    jumpBuffer: 0, coyoteTime: 0, hazardClock: 0, hazardKind: null, fireClock: 0,
    gamepadAimV83: null, pointerAimV83: null
  });
  engine.keys.clear();
}

function holdDirection(engine, controls, x, y) {
  for (const name of ['left', 'right', 'up', 'down']) engine.keys.delete(controls[name]);
  if (x < 0) engine.keys.add(controls.left);
  if (x > 0) engine.keys.add(controls.right);
  if (y < 0) engine.keys.add(controls.up);
  if (y > 0) engine.keys.add(controls.down);
}

for (const role of ['player', 'coop']) {
  const shift = role === 'player' ? 'ShiftLeft' : 'ShiftRight';
  const controls = PLAYER_CONTROLS[role];
  test(role + ': real updatePlayer with ' + shift + ' fires eight directions without walking; release restores movement', () => withRuntime(({ engine }) => {
    const actor = engine[role];
    placeOnTestDeck(engine, actor);
    const origin = { x: actor.x, y: actor.y };
    engine.keys.add(shift);
    engine.keys.add(controls.fire);
    for (const [direction, x, y] of DIRECTIONS) {
      actor.vx = 120; // Lock must stop existing momentum, not merely omit new acceleration.
      actor.fireClock = 0;
      holdDirection(engine, controls, x, y);
      const before = engine.bullets.length;
      const ammo = actor.ammo;
      engine.updatePlayer(actor, 0.05, controls);
      close(actor.x, origin.x, direction + ' stationary x');
      close(actor.y, origin.y, direction + ' stationary feet');
      close(actor.vx, 0, direction + ' cancelled drift');
      assert.equal(actor.climbing, false);
      assert.equal(actor.crouching, false, 'down is an aim direction while Shift is held');
      assert.equal(engine.bullets.length, before + 1);
      const bullet = engine.bullets.at(-1);
      close(bullet.vx, x * 890, direction + ' real update shot vx');
      close(bullet.vy, y * 890, direction + ' real update shot vy');
      assert.equal(bullet.owner, actor);
      assert.equal(actor.ammo, ammo - 1);
    }
    engine.keys.delete(shift); engine.keys.delete(controls.fire);
    holdDirection(engine, controls, 1, 0);
    engine.updatePlayer(actor, 0.05, controls);
    assert.ok(actor.x > origin.x, 'movement resumes in the same player update after releasing Shift');
    assert.ok(actor.vx > 0);
  }));

  test(role + ': ' + shift + ' prevents entering a ladder and release resumes actual climbing', () => withRuntime(({ engine }) => {
    const actor = engine[role];
    placeOnTestDeck(engine, actor);
    engine.ladders = [{ id: 'test-ladder-v83', x: actor.x + actor.w / 2, top: 300, bottom: 930 }];
    const before = { x: actor.x, y: actor.y };
    engine.keys.add(shift); engine.keys.add(controls.up);
    engine.updatePlayer(actor, 0.05, controls);
    assert.equal(actor.climbing, false);
    close(actor.x, before.x, 'locked ladder entry x');
    close(actor.y, before.y, 'locked ladder entry y');
    engine.keys.delete(shift);
    engine.updatePlayer(actor, 0.05, controls);
    assert.equal(actor.climbing, true);
    assert.ok(actor.y < before.y, 'up climbs after unlock');
  }));

  test(role + ': ' + shift + ' freezes an existing ladder climb without snapping sideways; unlock restores ascent', () => withRuntime(({ engine }) => {
    const actor = engine[role];
    placeOnTestDeck(engine, actor);
    Object.assign(actor, { y: 600, climbing: true, grounded: false, vy: -185 });
    engine.ladders = [{ id: 'offset-ladder-v83', x: actor.x + actor.w / 2 + 10, top: 300, bottom: 930 }];
    const before = { x: actor.x, y: actor.y };
    engine.keys.add(shift); engine.keys.add(controls.up);
    engine.updatePlayer(actor, 0.05, controls);
    close(actor.x, before.x, 'locked climb must not align sideways');
    close(actor.y, before.y, 'locked climb height');
    close(actor.vy, 0, 'locked ladder velocity');
    engine.keys.delete(shift);
    engine.updatePlayer(actor, 0.05, controls);
    assert.ok(actor.y < before.y, 'existing ladder ascent resumes after unlock');
  }));

  test(role + ': stationary aim blocks directional walking, not explicit jumping or gravity', () => withRuntime(({ engine }) => {
    const actor = engine[role];
    placeOnTestDeck(engine, actor);
    const before = { x: actor.x, y: actor.y };
    engine.keys.add(shift); engine.keys.add(controls.right); engine.keys.add(controls.jump);
    engine.updatePlayer(actor, 0.05, controls);
    close(actor.x, before.x, 'directional walk stays locked while jumping');
    assert.ok(actor.y < before.y, 'explicit jump remains available');
    assert.ok(actor.vy < 0);
    const risingVelocity = actor.vy;
    engine.keys.delete(controls.jump);
    engine.updatePlayer(actor, 0.05, controls);
    assert.ok(actor.vy > risingVelocity, 'gravity continues while Shift is held');
    close(actor.x, before.x, 'airborne directional walk remains locked');
  }));
}

test('J1 and J2 Shift locks affect only their own movement during real updates', () => withRuntime(({ engine }) => {
  placeOnTestDeck(engine, engine.player); placeOnTestDeck(engine, engine.coop);
  engine.keys.add('ShiftLeft'); engine.keys.add('KeyD'); engine.keys.add('KeyL');
  const x1 = engine.player.x, x2 = engine.coop.x;
  engine.updatePlayer(engine.player, 0.05, PLAYER_CONTROLS.player);
  engine.updatePlayer(engine.coop, 0.05, PLAYER_CONTROLS.coop);
  close(engine.player.x, x1, 'J1 stays locked');
  assert.ok(engine.coop.x > x2, 'J2 is not frozen by J1 Shift');
  engine.keys.delete('ShiftLeft'); engine.keys.add('ShiftRight');
  const nextX1 = engine.player.x, nextX2 = engine.coop.x;
  engine.updatePlayer(engine.player, 0.05, PLAYER_CONTROLS.player);
  engine.updatePlayer(engine.coop, 0.05, PLAYER_CONTROLS.coop);
  assert.ok(engine.player.x > nextX1, 'J1 resumes independently');
  close(engine.coop.x, nextX2, 'J2 lock stops its existing momentum');
}));

function aimSquadAt(engine, member, dx, dy) {
  Object.assign(member, { x: 1000, y: 500, w: 42, h: 92, fireClock: 0, downed: false, alive: true, inVehicle: false });
  const pivot = { x: member.x + member.w / 2, y: member.y + 36 };
  const target = { id: 'squad-target-v83', x: pivot.x + dx - 25, y: pivot.y + dy - 45, w: 50, h: 90, alive: true, alert: true };
  engine.enemies = [target]; engine.walls = []; engine.doors = [];
  const before = engine.bullets.length;
  assert.equal(engine.updateSquadCombat(member), true);
  assert.equal(engine.bullets.length, before + 1);
  const bullet = engine.bullets.at(-1);
  const length = Math.hypot(dx, dy);
  const speed = member.specialty === 'demolition' ? 700 : 850;
  close(bullet.vx / speed, dx / length, 'AI continuous aim x');
  close(bullet.vy / speed, dy / length, 'AI continuous aim y');
  close(Math.hypot(bullet.vx, bullet.vy), speed, 'AI projectile speed');
  close(bullet.angleRadians, Math.atan2(dy, dx), 'AI exact angle (not eight-way quantized)');
  close(bullet.x, pivot.x + dx / length * 22, 'AI muzzle x');
  close(bullet.y, pivot.y + dy / length * 22, 'AI muzzle y');
  assert.equal(bullet.owner, member);
  assert.ok(Math.abs(bullet.angleRadians / (Math.PI / 4) - Math.round(bullet.angleRadians / (Math.PI / 4))) > 0.01, 'fixture exercises a non-cardinal, non-diagonal angle');
  return bullet;
}

for (const specialty of ['assault', 'demolition']) for (const dy of [-110, 110]) {
  test('V52 ' + specialty + ' ally shoots exactly toward a target ' + (dy < 0 ? 'above' : 'below'), () => withRuntime(({ engine, options }) => {
    const definition = CREW.find(entry => entry.specialty === specialty);
    assert.ok(definition, 'real crew definition exists');
    // A mission spawns at most three companions: select this specialist in its real manifest.
    const crew = [CREW[0], definition, ...CREW.filter(entry => entry.id !== CREW[0].id && entry.id !== definition.id).slice(0, 2)];
    engine.stop(); engine.start({ ...options, crew });
    const member = engine.squadActors.find(entry => entry.specialty === specialty);
    assert.ok(member, 'real squad actor exists for ' + specialty);
    const shots = member.shots;
    const bullet = aimSquadAt(engine, member, 260, dy);
    close(bullet.damage, member.profile.damage, 'unmodified profile damage');
    close(member.fireClock, member.profile.interval / engine.squadCommandMultiplier, 'squad cadence');
    assert.equal(member.shots, shots + 1);
    assert.equal(engine.updateSquadCombat(member), false, 'AI cooldown cannot duplicate shots');
  }));
}

test('real Alpha-Bravo mission keeps its damage/cadence multiplier on continuously aimed allied shots', () => withRuntime(({ engine, options }) => {
  engine.stop();
  engine.start({ ...options, crew: CREW.slice(0, 4), campaign: { ...ALPHA_BRAVO_CAMPAIGN_V69, worldId: options.world.id } });
  assert.equal(engine.isAlphaBravoMissionV69(), true);
  const member = engine.squadActors.find(entry => engine.alphaBravoTeamForActorV69(entry));
  assert.ok(member, 'real mission provides an assigned ally');
  const teamId = engine.alphaBravoTeamForActorV69(member);
  const team = engine.alphaBravoV69.teams[teamId];
  engine.squadCommandMultiplier = 1.3;
  for (const [cohesion, stress, multiplier] of [[100, 0, 1.17], [50, 40, 0.825], [0, 100, 0.58]]) {
    Object.assign(team, { cohesion, stress });
    const bullet = aimSquadAt(engine, member, 260, -110);
    close(bullet.damage, Math.max(1, member.profile.damage * multiplier), 'Alpha-Bravo damage multiplier');
    close(member.fireClock, member.profile.interval / (1.3 * multiplier), 'Alpha-Bravo cadence multiplier');
    close(engine.squadCommandMultiplier, 1.3, 'temporary multiplier restored after shot');
    const count = engine.bullets.length;
    assert.equal(engine.updateSquadCombat(member), false);
    assert.equal(engine.bullets.length, count);
    close(engine.squadCommandMultiplier, 1.3, 'temporary multiplier also restored after rejected shot');
  }
}));
