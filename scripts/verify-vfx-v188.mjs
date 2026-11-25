// V188 mission VFX pass: effects spawn on accepted events only, the pool is
// capped, reduced motion calms everything, slots fall back to primitives and
// nothing is drawn outside the viewport. Production engine (engine-host-v188)
// plus a recording 2D context; scenes are built by placing actors, as declared.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, tick } from './engine-host-v188.mjs';
import { VFX_V188, VFX_KINDS_V188, createVfxPoolV188, spawnVfxParticleV188, stepVfxPoolV188, addVfxDecalV188,
  drawVfxParticlesV188, drawVfxDecalsV188, isSmartgunRoundV188 } from '../src/vfx-v188.js';
import { VFX_SLOTS_V188, VFX_SLOT_IDS_V188, VFX_SLOT_FILES_PRESENT_V188, VFX_FALLBACKS_V188, VFX_SLOT_LAYERS_V188,
  drawVfxSlotV188, getVfxSlotV188 } from '../src/vfx-slots-v188.js';

/** Records every call with its arguments; property writes are kept. */
function recorder() {
  const calls = [], state = { globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1 };
  const gradient = { addColorStop() {} };
  const ctx = new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return (...args) => { calls.push({ name: key, args }); return gradient; };
      return (...args) => { calls.push({ name: key, args, alpha: target.globalAlpha }); };
    },
    set(target, key, value) { target[key] = value; calls.push({ name: `set:${String(key)}`, args: [value] }); return true; }
  });
  return { ctx, calls, painted: () => calls.filter(c => /^(fill|stroke|fillRect|strokeRect|drawImage)$/.test(c.name)).length };
}

async function scene({ reducedMotion = false, enabled = true, biology = 'xenomorph', health = 400 } = {}) {
  const run = await fixture();
  const { engine } = run;
  engine.vfxV188Enabled = enabled;
  if (reducedMotion) engine.accessibilityRuntime = { ...engine.accessibilityRuntime, reducedMotion: true, screenShake: 0 };
  const p = engine.player; Object.assign(p, { facing: 1, grounded: true, alive: true, ammo: 99, ammoReserve: 400 });
  const enemy = { ...structuredClone(engine.spawnedEnemiesV188?.[0] || {}), id: 'vfx-target', x: p.x + 260, y: p.y + p.h - 60, w: 40, h: 60,
    alive: true, health, maxHealth: health, armor: 0, grounded: true, isBoss: false, staggerClock: 0, hurtClock: 0, revealed: 0,
    biology, vx: 0, vy: 0, speed: 0, damage: 0 };
  engine.enemies = [enemy];
  return { ...run, p, enemy };
}
function shoot(engine, p, seconds) {
  for (let t = 0; t < seconds; t += 1 / 60) {
    if (!(p.fireClock > 0)) engine.fire(p);
    tick(engine, 1 / 60); Object.assign(p, { alive: true, health: 100 });
  }
}

test('slots: one named slot per effect, same shape as the other V188 slot registries, primitive fallback for each', () => {
  assert.equal(new Set(VFX_SLOT_IDS_V188).size, VFX_SLOTS_V188.length);
  for (const slot of VFX_SLOTS_V188) {
    for (const key of ['id', 'purpose', 'width', 'height', 'layer', 'brief', 'path']) assert.ok(slot[key], `${slot.id}.${key}`);
    assert.ok(VFX_SLOT_LAYERS_V188.includes(slot.layer), slot.id);
    assert.equal(slot.path, `/assets/vfx/v188/${slot.id}.png`);
    assert.equal(typeof VFX_FALLBACKS_V188[slot.id], 'function', slot.id);
    const { ctx, painted } = recorder();
    assert.equal(drawVfxSlotV188(ctx, slot.id, .3, 20, { seed: 1, width: 1280, height: 720 }), 'primitive');
    assert.ok(painted() > 0, `${slot.id} fallback paints`);
  }
  for (const def of Object.values(VFX_KINDS_V188)) assert.ok(getVfxSlotV188(def.slot), def.slot);
  assert.deepEqual([...VFX_SLOT_FILES_PRESENT_V188], [], 'no image is requested before it is committed');
  assert.throws(() => drawVfxSlotV188(recorder().ctx, 'nope', 0, 1), /Unknown VFX slot/);
  // A committed image replaces the primitive only when listed as present.
  class Loaded { complete = true; naturalWidth = 34; set src(value) { this._src = value; } get src() { return this._src; } }
  const { ctx, calls } = recorder();
  assert.equal(drawVfxSlotV188(ctx, 'muzzle-star', 0, 22, null, { present: ['muzzle-star'], ImageCtor: Loaded }), 'image');
  assert.equal(calls.find(c => c.name === 'drawImage').args[0].src, '/assets/vfx/v188/muzzle-star.png');
  // Frames A and B of the muzzle star are different shapes (flicker of sustained fire).
  const a = recorder(), b = recorder();
  VFX_FALLBACKS_V188['muzzle-star'](a.ctx, 0, 22, { seed: 2 }); VFX_FALLBACKS_V188['muzzle-star'](b.ctx, 0, 22, { seed: 3 });
  assert.notDeepEqual(a.calls.map(c => c.name), b.calls.map(c => c.name));
});

test('pool: preallocated, capped, recycled; decals capped, merged and evicted', () => {
  const pool = createVfxPoolV188();
  assert.equal(pool.items.length, VFX_V188.particleCap);
  const objects = new Set(pool.items);
  for (let i = 0; i < 400; i++) spawnVfxParticleV188(pool, 'spark', i, 0, 10, 0, .1, 4);
  assert.equal(pool.count, VFX_V188.particleCap); assert.equal(pool.stats.dropped, 400 - VFX_V188.particleCap);
  assert.equal(spawnVfxParticleV188(pool, 'nope', 0, 0), null);
  stepVfxPoolV188(pool, .2); assert.equal(pool.count, 0, 'expired particles are swap-removed');
  assert.equal(pool.items.length, VFX_V188.particleCap); assert.ok(pool.items.every(item => objects.has(item)), 'no allocation after creation');
  for (let i = 0; i < 100; i++) spawnVfxParticleV188(pool, 'spark', i, 0, 0, 0, 1, 4, { limit: VFX_V188.reducedParticleCap });
  assert.equal(pool.count, VFX_V188.reducedParticleCap);
  const decals = createVfxPoolV188();
  addVfxDecalV188(decals, 100, 500, 16); addVfxDecalV188(decals, 106, 500, 16);
  assert.equal(decals.decals.length, 1); assert.equal(decals.stats.decalsMerged, 1);
  for (let i = 0; i < 40; i++) addVfxDecalV188(decals, 1000 + i * 100, 500, 16);
  assert.equal(decals.decals.length, VFX_V188.decalCap); assert.ok(decals.stats.decalsEvicted > 0);
  // A landing acid drop calls back exactly once.
  const landing = createVfxPoolV188(); let landed = 0;
  spawnVfxParticleV188(landing, 'acid', 0, 0, 0, 50, 2, 3, { floorY: 20 });
  for (let i = 0; i < 60; i++) stepVfxPoolV188(landing, 1 / 60, { onLand: () => landed++ });
  assert.equal(landed, 1); assert.equal(landing.count, 0);
});

test('effects spawn on accepted events: shot, hit material, kill, wall impact, explosion, damage, steps, tracker', async () => {
  const { engine, p, enemy } = await scene({ health: 60 });
  shoot(engine, p, 1.2);
  let stats = engine.getVfxSnapshotV188().stats;
  assert.ok(p.shots > 2);
  assert.equal(stats.byKind['muzzle-star'], p.shots, 'one muzzle star per accepted shot');
  assert.ok(stats.byKind.acid > 0, 'xenomorph hits spray acid');
  assert.equal(enemy.alive, false);
  tick(engine, 2);
  stats = engine.getVfxSnapshotV188().stats;
  assert.ok(stats.landed > 0 && engine.vfxV188.decals.length > 0, 'acid that reaches the deck leaves a burn');
  assert.ok(stats.byKind['acid-smoke'] > 2, 'the burn smokes');
  engine.stop();

  for (const [biology, material] of [['human', 'blood'], ['synthetic', 'synthetic']]) {
    const run = await scene({ biology });
    shoot(run.engine, run.p, .5);
    assert.ok(run.engine.getVfxSnapshotV188().stats.byKind[material] > 0, `${biology} → ${material}`);
    assert.equal(run.engine.getVfxSnapshotV188().stats.byKind.acid || 0, 0);
    run.engine.stop();
  }

  const wall = await scene(); wall.engine.enemies = [];
  wall.engine.walls = [...(wall.engine.walls || []), { x: wall.p.x + 140, y: wall.p.y - 80, w: 24, h: 260 }];
  shoot(wall.engine, wall.p, .5);
  assert.ok(wall.engine.getVfxSnapshotV188().stats.byKind.spark > 0, 'rounds stopped by a wall throw sparks');
  const explosion = wall.engine;
  explosion.enemies = [{ ...wall.enemy, alive: true, health: 999 }];
  explosion.applyEnemyDamage(explosion.enemies[0], 20, { owner: explosion.player, splash: 150, x: 400, y: 400, vx: 1 });
  assert.equal(explosion.getVfxSnapshotV188().stats.byKind.fireball, 1);
  const health = explosion.player.health; explosion.damagePlayer(explosion.player, 12, { source: 'vfx-test' });
  if (explosion.player.health < health) assert.ok(explosion.vfxScreenV188.vignette > 0, 'hurt marine → edge tint');
  explosion.footstepSurfaceV188 = 'step-water'; explosion.footstepsV188 = (explosion.footstepsV188 || 0) + 1; tick(explosion, 1 / 60);
  assert.ok(explosion.getVfxSnapshotV188().stats.byKind.splash > 0, 'a counted step in water splashes');
  explosion.stop();
});

test('presentation only: same shots and same damage with and without the VFX layer', async () => {
  const results = [];
  for (const enabled of [false, true]) {
    const { engine, p, enemy } = await scene({ enabled });
    shoot(engine, p, 1.5);
    results.push({ shots: p.shots, health: enemy.health, x: enemy.x, ammo: p.ammo, snapshot: engine.getVfxSnapshotV188() });
    engine.stop();
  }
  assert.equal(results[0].snapshot.stats.spawned, 0, 'disabled layer emits nothing');
  assert.ok(results[1].snapshot.stats.spawned > 0);
  for (const key of ['shots', 'health', 'x', 'ammo']) assert.equal(results[1][key], results[0][key], key);
});

test('reduced motion: no muzzle star, no hit-stop, smaller cap, shorter particles, steady damage tint', async () => {
  const { engine, p, enemy } = await scene({ reducedMotion: true, health: 60 });
  let peak = 0, frozen = false;
  for (let t = 0; t < 1.5; t += 1 / 60) {
    if (!(p.fireClock > 0)) engine.fire(p);
    tick(engine, 1 / 60); Object.assign(p, { alive: true, health: 100 });
    peak = Math.max(peak, engine.vfxV188.count); frozen ||= engine.vfxV188.freeze > 0;
  }
  const stats = engine.getVfxSnapshotV188().stats;
  assert.equal(stats.byKind['muzzle-star'] || 0, 0); assert.equal(enemy.alive, false); assert.equal(frozen, false);
  assert.ok(peak <= VFX_V188.reducedParticleCap);
  for (let i = 0; i < 80; i++) engine.vfxEmitV188('spark', 100, 100, { count: 4, speed: 100, life: 1 });
  assert.ok(engine.vfxV188.count <= VFX_V188.reducedParticleCap, 'reduced cap holds under a flood');
  const life = engine.vfxV188.items[0].life; assert.ok(life <= 1 * VFX_V188.reducedLife * 1.2 + 1e-9, 'shorter particles');
  engine.vfxScreenV188.vignette = VFX_V188.vignetteSeconds; engine.vfxScreenV188.vignetteStrength = 1;
  engine.tensionV188 = { ...(engine.tensionV188 || {}), phase: 'peak' };
  const { ctx, calls } = recorder(); engine.drawVfxScreenV188(ctx);
  const alphas = calls.filter(c => /^(fill|fillRect)$/.test(c.name)).map(c => c.alpha);
  assert.ok(alphas.length > 0 && alphas.every(a => a <= .16 + 1e-9), 'tints stay low and steady');
  assert.equal(calls.filter(c => c.name === 'createLinearGradient').length, 0, 'no beacon sweep');
  engine.stop();
  // Full motion keeps the hit-stop beat on a kill, scaled out when screen shake is 0.
  const full = await scene({ health: 30 }); let held = false;
  for (let t = 0; t < 1.5 && !held; t += 1 / 60) { if (!(full.p.fireClock > 0)) full.engine.fire(full.p); tick(full.engine, 1 / 60); held = full.engine.vfxV188.freeze > 0; }
  assert.ok(held, 'kill → presentation hit-stop'); full.engine.stop();
});

test('no draw outside the viewport: particles, decals and smartgun tracers are culled', async () => {
  const { engine } = await scene();
  const view = engine.vfxViewV188(), pool = engine.vfxV188;
  for (const dx of [-3000, 4000]) for (const kind of ['spark', 'acid', 'smoke', 'ping', 'fireball']) spawnVfxParticleV188(pool, kind, view.x + dx, view.y + 100, 0, 0, 1, 8);
  addVfxDecalV188(pool, view.x - 2500, view.y + 300, 20);
  const off = recorder();
  assert.equal(drawVfxParticlesV188(off.ctx, pool, view), 0); assert.equal(drawVfxDecalsV188(off.ctx, pool, view), 0);
  assert.equal(off.painted(), 0);
  spawnVfxParticleV188(pool, 'spark', view.x + 300, view.y + 200, 0, 0, 1, 8);
  addVfxDecalV188(pool, view.x + 400, view.y + 400, 20);
  const on = recorder();
  assert.equal(drawVfxParticlesV188(on.ctx, pool, view), 1); assert.equal(drawVfxDecalsV188(on.ctx, pool, view), 1);
  for (const call of on.calls.filter(c => c.name === 'translate')) {
    assert.ok(call.args[0] >= view.x - VFX_V188.viewportMargin - 20 && call.args[0] <= view.x + view.w + VFX_V188.viewportMargin + 20);
    assert.ok(call.args[1] >= view.y - VFX_V188.viewportMargin - 20 && call.args[1] <= view.y + view.h + VFX_V188.viewportMargin + 20);
  }
  assert.ok(isSmartgunRoundV188({ family: 'smart' }) && isSmartgunRoundV188({ weaponId: 'm56-smartgun' }) && !isSmartgunRoundV188({ family: 'ballistic' }));
  engine.bullets = [{ family: 'smart', x: view.x + 200, y: view.y + 200, w: 6, h: 2, vx: 900, vy: 0 },
    { family: 'smart', x: view.x + 5000, y: view.y + 200, w: 6, h: 2, vx: 900, vy: 0 }, { family: 'ballistic', x: view.x + 300, y: view.y + 200, w: 6, h: 2, vx: 900 }];
  const tracer = recorder(); engine.drawSmartgunTracersV188(tracer.ctx, view);
  assert.equal(engine.vfxV188.stats.tracers, 1, 'only the on-screen smartgun round gets a tracer');
  engine.stop();
});

test('tracker pulse and hurt marine: a forward ping wedge and an edge tint, only when accepted', async () => {
  const { engine, p } = await scene(); engine.enemies = [];
  Object.assign(p, { fireClock: 0, reloading: false, climbing: false, grounded: true, facing: -1 });
  if (engine.tracker) Object.assign(engine.tracker, { energy: 100, cooldown: 0 });
  const accepted = engine.activateTracker(p);
  const pings = engine.getVfxSnapshotV188().stats.byKind.ping || 0;
  assert.equal(pings, accepted ? 1 : 0, 'ping only for an accepted pulse');
  if (accepted) assert.equal(engine.vfxV188.items.slice(0, engine.vfxV188.count).find(item => item.kind === 'ping').angle, Math.PI, 'wedge faces the operator');
  assert.equal(engine.activateTracker({ ...p, climbing: true }), false);
  assert.equal(engine.getVfxSnapshotV188().stats.byKind.ping || 0, pings, 'a refused pulse draws nothing');
  const before = p.health; p.armor = 0; engine.damagePlayer(p, 15, { source: 'vfx-test' });
  assert.ok(p.health < before, 'fixture damage applies'); assert.ok(engine.vfxScreenV188.vignette > 0);
  console.log('V188 vfx tracker', JSON.stringify({ accepted, pings }));
  engine.stop();
});
