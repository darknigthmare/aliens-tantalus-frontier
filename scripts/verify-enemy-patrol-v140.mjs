import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine as ProductionEngine } from '../src/game-production-runtime.js';
import { ENEMIES, WORLDS, CAMPAIGNS, WEAPONS } from '../src/content.js';
import { withEnemyTacticsV130, ENEMY_TACTICS_V130 } from '../src/enemy-tactics-v130.js';
import { ENEMY_PATROL_V140 } from '../src/enemy-patrol-v140.js';
import { sanitizeBioforgeTacticsV132 } from '../src/bioforge-tactics-state-v132.js';

// Browser APIs are substituted, not the engine, projectile collision or combat.
// Raster quality is intentionally left to the browser screenshot review.
const Engine = withEnemyTacticsV130(ProductionEngine);
const root = fileURLToPath(new URL('../', import.meta.url));
const dimensions = new Map();
function pngSize(source) {
  if (dimensions.has(source)) return dimensions.get(source);
  let descriptor;
  try {
    descriptor = openSync(resolve(root, `.${new URL(source, 'http://qa.invalid').pathname}`), 'r');
    const header = Buffer.alloc(24); readSync(descriptor, header, 0, 24, 0);
    const size = { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
    dimensions.set(source, size); return size;
  } catch { return null; } finally { if (descriptor !== undefined) closeSync(descriptor); }
}
function host() {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(value) { this._src = value; const size = pngSize(value); this.naturalWidth = size?.width || 0; this.naturalHeight = size?.height || 0;
      queueMicrotask(() => { const event = new Event(size ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); }); }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw new Error('Missing real fixture image'); }
  };
  const draws = [], stack = [], transforms = [];
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1, save() { stack.push(this.globalAlpha); }, restore() { assert.ok(stack.length); this.globalAlpha = stack.pop(); },
    drawImage(image, ...args) { draws.push({ source: image.src, args, alpha: this.globalAlpha }); },
    translate(...args) { transforms.push(['translate', ...args]); }, scale(...args) { transforms.push(['scale', ...args]); },
    createLinearGradient: () => gradient, createRadialGradient: () => gradient, measureText: text => ({ width: String(text).length * 7 }),
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) },
  { get(target, property) { return property in target ? target[property] : () => {}; } });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  return { canvas, ctx, draws, stack, transforms };
}
async function fixture() {
  const browser = host(), events = [], engine = new Engine(browser.canvas, { onEvent: event => events.push(event) });
  const options = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1), equipment: [], crew: [], seed: 426 };
  engine.start(options);
  for (let n = 0; n < 6; n++) await Promise.resolve();
  Object.assign(engine, { platforms: [{ id: 'qa-floor', x: 0, y: 930, w: 6000, h: 150, floor: true }],
    ladders: [], lifts: [], walls: [], covers: [], doors: [], hazards: [], enemies: [], missionLevelRuntime: null,
    missionLevelBounds: { width: 6000, height: 1080 }, userCasteCampaignActiveV88: false,
    userCasteLoadingV88: false, enemyAtlasLoadingPausedV65: false, rearEntrancesV130: [], running: true, paused: false });
  Object.assign(engine.player, { x: 150, y: 838, w: 42, h: 92, alive: true, health: 100, grounded: true, vx: 0, vy: 0 });
  engine.mission.state = 'active'; engine.coopEnabled = false;
  return { ...browser, engine, actor: engine.player, events, options };
}
function enemy(subject, profile = 'enemy-004-drone-big-chap', x = 650, patch = {}) {
  const source = ENEMIES.find(entry => entry.id === profile); assert.ok(source, profile);
  const actor = Object.assign(subject.engine.createEnemy(source, subject.engine.enemies.length + 70, x, 930), { facing: 1, ...patch });
  subject.engine.enemies.push(actor); return actor;
}
function tick(engine, actor, seconds, rate = 60) {
  let remaining = seconds;
  while (remaining > 1e-9) { const delta = Math.min(1 / rate, remaining); engine.updateEnemy(actor, delta); remaining -= delta; }
}

async function patrolSubject(profile = 'enemy-004-drone-big-chap', patch = {}) {
  const subject = await fixture(); subject.engine.player.x = 5000;
  const contact = enemy(subject, profile, 650, patch);
  subject.engine.updateEnemy(contact, .001);
  return { ...subject, contact };
}

test('production patrol accelerates, brakes, observes its endpoint, then starts the return leg', async () => {
  const { engine, contact } = await patrolSubject();
  const maximum = contact.speed * ENEMY_TACTICS_V130.xeno.patrolSpeed;
  tick(engine, contact, .1);
  assert.ok(contact.vx > 0 && contact.vx < maximum / 2, 'Departure ramps up from rest');
  tick(engine, contact, .3); assert.ok(Math.abs(contact.vx - maximum) < 1e-6);
  let braking = false;
  for (let n = 0; n < 3000 && contact.tacticsV130.patrolV140.phase !== 'observe'; n++) {
    engine.updateEnemy(contact, 1 / 120);
    if (contact.vx > 0 && contact.vx < maximum * .8) braking = true;
  }
  assert.equal(braking, true, 'Arrival decelerates before changing direction');
  assert.equal(contact.tacticsV130.patrolV140.phase, 'observe');
  assert.ok(Math.abs(contact.x - contact.tacticsV130.right) < 1e-6);
  assert.equal(contact.vx, 0);
  const position = contact.x, direction = contact.tacticsV130.direction;
  tick(engine, contact, .2);
  assert.equal(contact.x, position); assert.equal(contact.tacticsV130.direction, direction);
  const remaining = contact.tacticsV130.patrolV140.remaining;
  tick(engine, contact, remaining + .1);
  assert.equal(contact.tacticsV130.direction, -direction);
  assert.ok(contact.x < position && contact.vx < 0 && contact.vx > -maximum / 2);
  assert.equal(engine.enemyTacticsSnapshotV130().enemies[0].patrol.schema, 140);
});

test('patrol travel and endpoint observation consume the same full time at 30/60/120Hz and one large delta', async () => {
  const subjects = await Promise.all([30, 60, 120, 0].map(() => patrolSubject()));
  for (const [index, rate] of [30, 60, 120, 0].entries()) {
    const { engine, contact } = subjects[index];
    if (rate) tick(engine, contact, 21.371, rate); else engine.updateEnemy(contact, 21.371);
  }
  const reference = subjects[0].contact;
  for (const { contact } of subjects.slice(1)) {
    assert.ok(Math.abs(contact.x - reference.x) < 1e-6);
    assert.ok(Math.abs(contact.vx - reference.vx) < 1e-6);
    assert.equal(contact.tacticsV130.direction, reference.tacticsV130.direction);
    assert.equal(contact.tacticsV130.patrolV140.phase, reference.tacticsV130.patrolV140.phase);
    assert.ok(Math.abs(contact.tacticsV130.clock - reference.tacticsV130.clock) < 1e-6);
  }
});

test('pause and loading freeze travel and observation while an enemy still perceives danger during an endpoint stop', async () => {
  const { engine, contact } = await patrolSubject();
  const state = contact.tacticsV130;
  contact.x = state.right; state.patrolV140 = null; engine.updateEnemy(contact, .1);
  assert.equal(state.patrolV140.phase, 'observe');
  for (const flag of ['paused', 'enemyAtlasLoadingPausedV65', 'userCasteLoadingV88']) {
    const before = structuredClone(state), position = contact.x;
    engine[flag] = true; engine.updateEnemy(contact, 10); engine.update(10);
    assert.deepEqual(state, before); assert.equal(contact.x, position); engine[flag] = false;
  }
  engine.player.x = contact.x + 180;
  engine.updateEnemy(contact, .05);
  assert.equal(state.mode, 'suspicion'); assert.equal(state.patrolV140, null);
  tick(engine, contact, .3); assert.equal(state.mode, 'pursuit');
});

test('matching production saves preserve a partial departure and endpoint pause; older saves start safely at rest', async () => {
  for (const phase of ['travel', 'observe']) {
    const a = await patrolSubject(), b = await patrolSubject();
    if (phase === 'observe') {
      a.contact.x = a.contact.tacticsV130.right; a.contact.tacticsV130.patrolV140 = null;
    }
    tick(a.engine, a.contact, .127);
    assert.equal(a.contact.tacticsV130.patrolV140.phase, phase);
    const saved = a.engine.captureResumeState(), expected = structuredClone(a.contact.tacticsV130.patrolV140);
    assert.equal(b.engine.applyResumeState(saved).applied, true);
    assert.deepEqual(b.contact.tacticsV130.patrolV140, expected);
    tick(a.engine, a.contact, 1.117, 30); tick(b.engine, b.contact, 1.117, 120);
    assert.ok(Math.abs(a.contact.x - b.contact.x) < 1e-6);
    assert.ok(Math.abs(a.contact.vx - b.contact.vx) < 1e-6);
    const legacy = a.engine.captureResumeState(); delete legacy.enemyTacticsV130.enemies[0].tactics.patrolV140;
    const position = a.contact.x;
    assert.equal(a.engine.applyResumeState(legacy).applied, true);
    assert.equal(a.contact.tacticsV130.patrolV140, null); assert.equal(a.contact.x, position);
    a.engine.updateEnemy(a.contact, 1 / 120);
    assert.ok(Math.abs(a.contact.x - position) < a.contact.speed / 120);
  }
});

test('production support effects restore after tactics without restarting a partly accelerated patrol leg', async () => {
  const a = await patrolSubject(), b = await patrolSubject();
  a.contact.supportSlowClockV72 = 2; a.contact.supportSlowFactorV72 = .2;
  tick(a.engine, a.contact, .127);
  const saved = a.engine.captureResumeState(), expected = structuredClone(a.contact.tacticsV130.patrolV140);
  assert.equal(b.engine.applyResumeState(saved).applied, true);
  assert.deepEqual(b.contact.tacticsV130.patrolV140, expected);
  assert.equal(b.contact.supportSlowFactorV72, .2);
  tick(a.engine, a.contact, .527, 30); tick(b.engine, b.contact, .527, 120);
  assert.ok(Math.abs(a.contact.x - b.contact.x) < 1e-6);
  assert.ok(Math.abs(a.contact.vx - b.contact.vx) < 1e-6);
});

test('thin walls stop a patrol without repeated frame reversals, and destroyed supports never produce travel over a gap', async () => {
  const { engine, contact } = await patrolSubject();
  engine.walls = [{ x: 745, y: 700, w: 3, h: 230 }];
  for (let n = 0; n < 3000 && contact.tacticsV130.patrolV140.phase !== 'observe'; n++) engine.updateEnemy(contact, 1 / 120);
  assert.equal(contact.tacticsV130.patrolV140.phase, 'observe');
  assert.ok(contact.x + contact.w <= 745 + 1e-5);
  const position = contact.x, direction = contact.tacticsV130.direction;
  tick(engine, contact, .2, 120); assert.equal(contact.x, position); assert.equal(contact.tacticsV130.direction, direction);
  tick(engine, contact, .6, 120); assert.ok(contact.x < position);
  engine.platforms = [];
  const safePosition = contact.x; engine.updateEnemy(contact, 5);
  assert.equal(contact.x, safePosition); assert.equal(contact.vx, 0);
  assert.equal(contact.tacticsV130.patrolV140, null);
  engine.platforms = [{ x: safePosition - 15, y: 930, w: contact.w + 30, h: 50 }];
  tick(engine, contact, 20, 30);
  assert.ok(contact.x >= safePosition - 15 && contact.x + contact.w <= safePosition + contact.w + 15);
});

test('patrols use the production door collider and can pass the same door after it opens', async () => {
  const { engine, contact } = await patrolSubject();
  const door = { x: 0, y: 700, w: 3, h: 230, open: false, progress: 0 };
  door.x = contact.x + contact.w + 40 - engine.getDoorRenderState(door, { open: false }).x;
  engine.doors = [door];
  const collider = engine.getDoorRenderState(door, { open: false });
  for (let n = 0; n < 3000 && contact.tacticsV130.patrolV140.phase !== 'observe'; n++) engine.updateEnemy(contact, 1 / 120);
  assert.ok(contact.x + contact.w <= collider.x + 1e-5);
  const position = contact.x;
  door.open = true; door.progress = 1;
  let maximumX = position;
  for (let n = 0; n < 1800; n++) { engine.updateEnemy(contact, 1 / 60); maximumX = Math.max(maximumX, contact.x); }
  assert.ok(maximumX > position + 10, 'An opened door no longer truncates the real patrol leg');
});

test('support slow effects and stagger remain effective, and malformed patrol saves cannot move a real actor', async () => {
  const { engine, contact } = await patrolSubject();
  const speed = contact.speed;
  contact.supportSlowClockV72 = 2; contact.supportSlowFactorV72 = .2;
  const before = contact.x; tick(engine, contact, 1);
  assert.ok(contact.x - before < speed * ENEMY_TACTICS_V130.xeno.patrolSpeed * .2);
  assert.equal(contact.speed, speed);
  contact.staggerClock = .5;
  const stopped = contact.x, state = structuredClone(contact.tacticsV130.patrolV140);
  tick(engine, contact, .2); assert.equal(contact.x, stopped); assert.deepEqual(contact.tacticsV130.patrolV140, state);
  const saved = engine.captureResumeState();
  saved.enemyTacticsV130.enemies[0].tactics.patrolV140 = { schema: 140, phase: 'travel',
    fromX: -1e15, toX: 1e15, elapsed: 1e15, speed: 1e15 };
  assert.equal(engine.applyResumeState(saved).applied, true);
  assert.equal(contact.x, stopped); assert.equal(contact.tacticsV130.patrolV140, null);
  const humanSource = ENEMIES.find(entry => entry.biology === 'human');
  const human = await patrolSubject(humanSource.id);
  human.contact.x = human.contact.tacticsV130.right; human.contact.tacticsV130.patrolV140 = null;
  human.engine.updateEnemy(human.contact, .01);
  assert.ok(human.contact.tacticsV130.patrolV140.remaining > ENEMY_PATROL_V140.xenoPause);
  assert.equal(ENEMY_PATROL_V140.humanoidPause, .7);
});

test('BIOFORGE accepts a matching physical patrol cursor and rejects malformed, foreign and stale V140 trajectories', async () => {
  const subject = await fixture(), { engine } = subject;
  engine.platforms = [{ x: 0, y: 630, w: 2880, h: 90, floor: true }];
  engine.missionLevelBounds = { width: 2880, height: 720 };
  engine.player.x = 2600; engine.player.y = 630 - engine.player.h;
  const contact = enemy(subject);
  contact.y = 630 - contact.h; contact.groundY = 630;
  tick(engine, contact, .127);
  const cursor = () => ({ ...structuredClone(engine.enemyTacticsV130),
    enemies: [{ id: contact.id, tactics: structuredClone(contact.tacticsV130) }] });
  const physical = () => ({ enemies: [{ id: contact.id, x: contact.x }] });
  assert.ok(sanitizeBioforgeTacticsV132(cursor(), physical()));
  for (const change of [raw => raw.enemies[0].tactics.patrolV140.elapsed = Infinity,
    raw => raw.enemies[0].tactics.patrolV140.fromX += 50,
    raw => raw.enemies[0].tactics.patrolV140.extra = true,
    raw => raw.enemies[0].tactics.mode = 'pursuit']) {
    const raw = cursor(); change(raw);
    assert.equal(sanitizeBioforgeTacticsV132(raw, physical()), null);
  }
  assert.equal(sanitizeBioforgeTacticsV132(cursor(), { enemies: [{ id: contact.id, x: contact.x + 10 }] }), null);
  contact.x = contact.tacticsV130.right; contact.tacticsV130.patrolV140 = null;
  engine.updateEnemy(contact, .1);
  assert.ok(sanitizeBioforgeTacticsV132(cursor(), physical()));
  const malformed = cursor(); malformed.enemies[0].tactics.patrolV140.remaining = 999;
  assert.equal(sanitizeBioforgeTacticsV132(malformed, physical()), null);
  const legacy = cursor(); delete legacy.enemies[0].tactics.patrolV140;
  assert.ok(sanitizeBioforgeTacticsV132(legacy, physical()));
});

