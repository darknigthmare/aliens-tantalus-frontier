// V188 — mission visual effects pass (game-feel). Presentation only: every
// emitter is called from an event the gameplay already accepted (a shot that
// produced a projectile, damage that was applied, a kill, a hit on a wall, an
// accepted tracker pulse, a counted footstep) and nothing here changes an
// actor, a projectile, a target, a collision or a save. Effects are routed
// through the named slots of vfx-slots-v188.js (Canvas primitives until images
// exist). Particles live in a preallocated, capped pool; floor burns in a small
// capped decal list. Reduced motion: no muzzle star, no strobe sweep, no hit-stop,
// a calmer damage tint, fewer, shorter and slower particles. Shapes (star,
// streak, diamond, round drop, ring) keep the effects apart in colour-blind modes.
// Muzzle lights and shell casings stay with weapon-effects-v124; hit markers and
// camera kicks with combat-feel-v188.
import { drawVfxSlotV188 } from './vfx-slots-v188.js';

export const VFX_V188 = Object.freeze({
  schema: 188, particleCap: 320, reducedParticleCap: 48, decalCap: 24,
  reducedLife: .6, reducedSpeed: .5, hitStopSeconds: .05, vignetteSeconds: .45,
  decalSeconds: 14, decalSmokeSeconds: 5, decalMergePx: 14, decalMaxWidth: 64,
  viewportMargin: 48, maxStep: .1, logicalWidth: 1280, logicalHeight: 720
});

const TAU = Math.PI * 2;
const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;

// slot, gravity (px/s²), drag (1/s), base alpha, additive, oriented along velocity/angle, lands (acid burn)
const kind = (slot, gravity, drag, alpha, additive = false, oriented = false, lands = false) => Object.freeze({ slot, gravity, drag, alpha, additive, oriented, lands });
export const VFX_KINDS_V188 = Object.freeze({
  'muzzle-star': kind('muzzle-star', 0, 0, 1, true, true),
  'muzzle-flame': kind('muzzle-flame', 0, 0, .95, true, true),
  'muzzle-arc': kind('muzzle-arc', 0, 0, .9, true),
  smoke: kind('muzzle-smoke', -30, 1.6, .32),
  spark: kind('impact-spark', 640, 2.2, 1, true, true),
  'panel-spark': kind('panel-spark', 520, .6, 1, true, true),
  acid: kind('impact-acid', 900, .4, 1, false, false, true),
  blood: kind('impact-blood', 900, .4, .95),
  synthetic: kind('impact-synthetic', 900, .4, .95),
  'acid-smoke': kind('acid-smoke', -42, 1.2, .3),
  fireball: kind('explosion-fireball', 0, 0, 1, true),
  'explosion-smoke': kind('explosion-smoke', -26, 1.1, .5),
  debris: kind('debris-chunk', 900, .3, 1),
  ember: kind('ember', -70, .8, 1, true),
  steam: kind('steam-puff', -55, 1.4, .16),
  dust: kind('footstep-dust', -6, 2.5, .42),
  splash: kind('footstep-splash', 0, 0, .8),
  ping: kind('tracker-ping', 0, 0, .55, false, true),
  // V188 Bioforge lab (spec 013): rising bubbles in stasis-tank liquid.
  bubble: kind('liquid-bubble', -120, 1.1, .75)
});

/** Bounded pool: `cap` particle objects are allocated once and recycled (swap-remove). */
export function createVfxPoolV188({ cap = VFX_V188.particleCap, decalCap = VFX_V188.decalCap } = {}) {
  const items = Array.from({ length: cap }, () => ({ kind: 'spark', x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 0, size: 0, angle: 0, floorY: null, seed: 0 }));
  return { cap, items, count: 0, decals: [], decalCap, freeze: 0, serial: 0,
    stats: { spawned: 0, dropped: 0, landed: 0, decals: 0, decalsMerged: 0, decalsEvicted: 0, drawn: 0, culled: 0, tracers: 0, byKind: {} } };
}

export function spawnVfxParticleV188(pool, type, x, y, vx = 0, vy = 0, life = .3, size = 4, { angle = null, floorY = null, limit = pool?.cap } = {}) {
  if (!pool || !VFX_KINDS_V188[type] || !Number.isFinite(x) || !Number.isFinite(y) || !(life > 0)) return null;
  if (pool.count >= Math.min(pool.cap, finite(limit, pool.cap))) { pool.stats.dropped++; return null; }
  const p = pool.items[pool.count++];
  p.kind = type; p.x = x; p.y = y; p.vx = finite(vx); p.vy = finite(vy); p.age = 0; p.life = life; p.size = size;
  p.angle = angle ?? Math.atan2(p.vy, p.vx); p.floorY = Number.isFinite(floorY) ? floorY : null; p.seed = ++pool.serial;
  pool.stats.spawned++; pool.stats.byKind[type] = (pool.stats.byKind[type] || 0) + 1; return p;
}

export function addVfxDecalV188(pool, x, y, width = 18) {
  if (!pool || !Number.isFinite(x) || !Number.isFinite(y) || pool.decalCap <= 0) return null;
  const near = pool.decals.find(d => Math.abs(d.y - y) < 3 && Math.abs(d.x - x) < VFX_V188.decalMergePx + d.w / 2);
  if (near) { // a second drop widens and re-heats the same burn instead of stacking a new one
    near.w = Math.min(VFX_V188.decalMaxWidth, near.w + width * .35); near.age = Math.min(near.age, 1); pool.stats.decalsMerged++; return near;
  }
  if (pool.decals.length >= pool.decalCap) { pool.decals.shift(); pool.stats.decalsEvicted++; }
  const decal = { x, y, w: width, age: 0, smoke: 0, seed: ++pool.serial };
  pool.decals.push(decal); pool.stats.decals++; return decal;
}

/** Advances particles and decals. `onLand(p)` is called once for a landing particle (acid). */
export function stepVfxPoolV188(pool, dt, { onLand = null, onDecalSmoke = null } = {}) {
  if (!pool || !(dt > 0)) return;
  if (pool.freeze > 0) { pool.freeze = Math.max(0, pool.freeze - dt); return; } // presentation hit-stop
  const items = pool.items;
  for (let i = 0; i < pool.count;) {
    const p = items[i], def = VFX_KINDS_V188[p.kind];
    p.age += dt;
    let dead = p.age >= p.life;
    if (!dead) {
      p.vy += def.gravity * dt;
      if (def.drag) { const k = Math.max(0, 1 - def.drag * dt); p.vx *= k; p.vy *= def.gravity ? 1 : k; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (def.oriented && (p.vx || p.vy) && p.kind !== 'muzzle-star' && p.kind !== 'muzzle-flame') p.angle = Math.atan2(p.vy, p.vx);
      if (p.floorY !== null && p.vy > 0 && p.y >= p.floorY) { p.y = p.floorY; dead = true; if (def.lands) { pool.stats.landed++; onLand?.(p); } }
    }
    if (dead) { items[i] = items[pool.count - 1]; items[pool.count - 1] = p; pool.count--; continue; }
    i++;
  }
  for (let i = pool.decals.length - 1; i >= 0; i--) {
    const d = pool.decals[i]; d.age += dt;
    if (d.age >= VFX_V188.decalSeconds) { pool.decals.splice(i, 1); continue; }
    if (d.age < VFX_V188.decalSmokeSeconds && (d.smoke -= dt) <= 0) { d.smoke = .28; onDecalSmoke?.(d); }
  }
}

const inView = (x, y, r, view) => x + r >= view.x && x - r <= view.x + view.w && y + r >= view.y && y - r <= view.y + view.h;

/** Draws live particles in world space; anything outside the viewport (plus margin) is skipped. */
export function drawVfxParticlesV188(ctx, pool, view, options = {}) {
  if (!ctx || !pool) return 0;
  let drawn = 0; const margin = VFX_V188.viewportMargin;
  // One save for the batch; each particle resets the transform instead of save/restore,
  // and the two blend passes (normal, then additive) switch the composite mode once.
  const base = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
  ctx.save();
  try {
    for (const additive of [false, true]) {
      ctx.globalCompositeOperation = additive ? 'lighter' : 'source-over';
      for (let i = 0; i < pool.count; i++) {
        const p = pool.items[i], def = VFX_KINDS_V188[p.kind];
        if (def.additive !== additive) continue;
        const t = Math.min(1, p.age / p.life), reach = p.kind === 'ping' ? p.size : p.size * 1.5;
        if (!inView(p.x, p.y, reach + margin, view)) { pool.stats.culled++; continue; }
        const fade = p.kind.startsWith('muzzle') ? 1 : p.kind === 'ping' ? 1 - t : 1 - t * t;
        if (!base) ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, def.alpha * fade));
        ctx.translate(p.x, p.y); if (def.oriented) ctx.rotate(p.angle);
        drawVfxSlotV188(ctx, def.slot, t, p.size, p, options);
        if (base) ctx.setTransform(base); else ctx.restore();
        drawn++;
      }
    }
  } finally { ctx.restore(); }
  pool.stats.drawn += drawn; return drawn;
}

export function drawVfxDecalsV188(ctx, pool, view, options = {}) {
  if (!ctx || !pool) return 0;
  let drawn = 0;
  for (const d of pool.decals) {
    if (!inView(d.x, d.y, d.w + VFX_V188.viewportMargin, view)) { pool.stats.culled++; continue; }
    const t = d.age / VFX_V188.decalSeconds;
    ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, (1 - t) * 1.4)); ctx.translate(d.x, d.y);
    drawVfxSlotV188(ctx, 'acid-burn', t, d.w, d, options); ctx.restore(); drawn++;
  }
  return drawn;
}

export function isSmartgunRoundV188(bullet) {
  return Boolean(bullet) && (bullet.family === 'smart' || /smart|m56/i.test(String(bullet.weaponId || '')));
}

const scatter = seed => { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; };

export function withVfxV188(Base) {
  if (Base.vfxRuntimeV188) return Base;
  return class VfxV188 extends Base {
    static vfxRuntimeV188 = true;
    start(options = {}) {
      this.vfxV188Enabled = options.vfxV188 !== false;
      this.vfxV188 = createVfxPoolV188();
      this.vfxScreenV188 = { vignette: 0, vignetteStrength: 0, strobe: 0 };
      this.vfxClockV188 = { ambient: 0, storm: 0, shots: 0 };
      this.vfxRandomV188 = scatter(finite(options.seed, 188));
      const result = super.start(options);
      this.vfxFootstepsSeenV188 = this.footstepsV188 || 0; this.vfxGroundedV188 = this.player?.grounded !== false;
      return result;
    }
    vfxReducedV188() { return Boolean(this.accessibilityRuntime?.reducedMotion); }
    vfxLimitV188() { return this.vfxReducedV188() ? VFX_V188.reducedParticleCap : VFX_V188.particleCap; }
    /** n particles of one kind with spread around an angle; reduced motion halves count, life and speed. */
    vfxEmitV188(type, x, y, { count = 1, angle = 0, spread = TAU, speed = 0, speedJitter = .5, life = .3, size = 3, floorY = null, orient = null } = {}) {
      const pool = this.vfxV188; if (!this.vfxV188Enabled || !pool) return 0;
      const reduced = this.vfxReducedV188(), random = this.vfxRandomV188, limit = this.vfxLimitV188();
      const n = reduced ? Math.ceil(count / 2) : count, k = reduced ? VFX_V188.reducedSpeed : 1, lifeK = reduced ? VFX_V188.reducedLife : 1;
      let spawned = 0;
      for (let i = 0; i < n; i++) {
        const a = angle + (random() - .5) * spread, v = speed * k * (1 - speedJitter + random() * speedJitter * 2);
        if (spawnVfxParticleV188(pool, type, x, y, Math.cos(a) * v, Math.sin(a) * v, life * lifeK * (.8 + random() * .4), size * (.8 + random() * .4),
          { angle: orient ?? (speed ? null : a), floorY, limit })) spawned++;
      }
      return spawned;
    }
    vfxFloorBelowV188(x, y) {
      let best = Infinity;
      for (const list of [this.platforms, this.walls]) for (const box of list || []) {
        if (!box || box.destroyed || x < box.x || x > box.x + box.w || box.y < y - 2 || box.y >= best) continue;
        best = box.y;
      }
      const section = this.missionDepthSectionV188;
      if (section && x >= section.x0 && x <= section.x1 && section.floorY >= y - 2 && section.floorY < best) best = section.floorY;
      return Number.isFinite(best) ? best : null;
    }
    // —— accepted-event emitters ——
    fire(actor = this.player) {
      const before = this.bullets?.length ?? 0, result = super.fire(actor);
      if (result === true && this.vfxV188Enabled && (this.bullets?.length ?? 0) > before) this.vfxMuzzleV188(this.bullets[before]);
      return result;
    }
    vfxMuzzleV188(bullet) {
      if (!bullet) return;
      const x = finite(bullet.sourceX, finite(bullet.x)), y = finite(bullet.sourceY, finite(bullet.y));
      const angle = Math.atan2(finite(bullet.vy), finite(bullet.vx) || 1), family = String(bullet.family || 'ballistic');
      const reduced = this.vfxReducedV188(), clock = this.vfxClockV188; clock.shots++;
      if (family === 'flame') {
        if (!reduced) this.vfxEmitV188('muzzle-flame', x, y, { angle, spread: 0, life: .07, size: 42 });
        this.vfxEmitV188('ember', x + Math.cos(angle) * 24, y, { count: 3, angle: angle - .3, spread: 1, speed: 90, life: .5, size: 2 });
        return;
      }
      if (family === 'electric' || family === 'energy' || family === 'sonic') {
        if (!reduced) this.vfxEmitV188('muzzle-arc', x, y, { angle, spread: 0, life: .06, size: 16 });
        return;
      }
      if (family !== 'silent' && family !== 'melee' && family !== 'tool' && !reduced)
        this.vfxEmitV188('muzzle-star', x, y, { angle, spread: 0, life: .05, size: family === 'explosive' ? 30 : 22, orient: angle });
      if (family === 'explosive' || clock.shots % 3 === 0)
        this.vfxEmitV188('smoke', x + Math.cos(angle) * 6, y, { angle: -Math.PI / 2, spread: 1.2, speed: 18, life: .7, size: 7 });
    }
    applyEnemyDamage(enemy, rawDamage, source = {}) {
      const damage = super.applyEnemyDamage(enemy, rawDamage, source);
      if (this.vfxV188Enabled && damage > 0 && enemy) this.vfxEnemyHitV188(enemy, source, damage);
      return damage;
    }
    vfxMaterialV188(enemy) {
      const biology = String(enemy?.biology || '');
      if (/xenomorph|hybrid|pathogen/.test(biology)) return 'acid';
      if (/synthetic|automaton|mech/.test(biology)) return 'synthetic';
      return 'blood';
    }
    vfxEnemyHitV188(enemy, source, damage) {
      const x = finite(source.x, enemy.x + enemy.w / 2), y = finite(source.y, enemy.y + enemy.h * .45);
      const dir = finite(source.vx) ? Math.sign(source.vx) : 1, material = this.vfxMaterialV188(enemy);
      if (source.splash > 0 && source.kind !== 'explosive-splash' && !source.vfxExplodedV188) { source.vfxExplodedV188 = true; this.vfxExplosionV188(x, y); }
      const count = Math.min(7, 2 + Math.round(damage / 8)), floorY = this.vfxFloorBelowV188(x, y);
      // Exit spray along the shot, a smaller back-splash towards the shooter.
      this.vfxEmitV188(material, x, y, { count, angle: dir > 0 ? -.35 : Math.PI + .35, spread: 1.3, speed: 150, life: 1.1, size: material === 'acid' ? 2.6 : 2, floorY });
      this.vfxEmitV188(material, x, y, { count: 1, angle: dir > 0 ? Math.PI - .5 : .5, spread: .6, speed: 90, life: 1, size: 2, floorY });
      if (material === 'acid') this.vfxEmitV188('acid-smoke', x, y, { angle: -Math.PI / 2, spread: .8, speed: 20, life: .6, size: 6 });
    }
    defeatEnemy(enemy, owner) {
      const wasAlive = Boolean(enemy?.alive), result = super.defeatEnemy(enemy, owner);
      if (this.vfxV188Enabled && wasAlive && enemy && !enemy.alive) {
        const x = enemy.x + enemy.w / 2, y = enemy.y + enemy.h * .5, material = this.vfxMaterialV188(enemy);
        this.vfxEmitV188(material, x, y, { count: 10, angle: -Math.PI / 2, spread: 2.4, speed: 200, life: 1.3, size: 3, floorY: this.vfxFloorBelowV188(x, y) });
        if (material === 'acid') this.vfxEmitV188('acid-smoke', x, y, { count: 3, angle: -Math.PI / 2, spread: 1, speed: 26, life: 1, size: 10 });
        // Presentation hit-stop: the effect layer holds one beat on a kill (simulation untouched).
        if (!this.vfxReducedV188() && finite(this.accessibilityRuntime?.screenShake, .65) > 0) this.vfxV188.freeze = VFX_V188.hitStopSeconds;
      }
      return result;
    }
    vfxExplosionV188(x, y) {
      this.vfxEmitV188('fireball', x, y, { spread: 0, life: .32, size: this.vfxReducedV188() ? 34 : 56 });
      this.vfxEmitV188('explosion-smoke', x, y, { count: 4, angle: -Math.PI / 2, spread: 2, speed: 40, life: 1.4, size: 22 });
      this.vfxEmitV188('debris', x, y, { count: 6, angle: -Math.PI / 2, spread: 2.6, speed: 260, life: 1, size: 3, floorY: this.vfxFloorBelowV188(x, y) });
      this.vfxEmitV188('ember', x, y, { count: 5, angle: -Math.PI / 2, spread: 2.2, speed: 120, life: .8, size: 2 });
    }
    applyFireballImpactV122(bullet, directEnemy = null, collision = {}) {
      const already = Boolean(bullet?.impactResolvedV122), result = super.applyFireballImpactV122(bullet, directEnemy, collision);
      if (result && !already && this.vfxV188Enabled && bullet && !bullet.vfxExplodedV188) { bullet.vfxExplodedV188 = true; this.vfxExplosionV188(finite(bullet.x), finite(bullet.y)); }
      return result;
    }
    updateBullets(delta) {
      const live = this.vfxBulletScratchV188 ||= []; live.length = 0;
      if (this.vfxV188Enabled) for (const bullet of this.bullets || []) if (!bullet.hit) live.push(bullet);
      const result = super.updateBullets(delta);
      for (const bullet of live) if (bullet.hit && !(bullet.hitCount > 0) && !bullet.vfxImpactV188) { bullet.vfxImpactV188 = true; this.vfxSurfaceImpactV188(bullet); }
      live.length = 0; return result;
    }
    vfxSurfaceImpactV188(bullet) {
      const x = finite(bullet.x), y = finite(bullet.y), family = String(bullet.family || 'ballistic');
      const back = Math.atan2(-finite(bullet.vy), -finite(bullet.vx) || -1);
      if (family === 'explosive' && !bullet.vfxExplodedV188) { bullet.vfxExplodedV188 = true; this.vfxExplosionV188(x, y); return; }
      if (family === 'flame') { this.vfxEmitV188('ember', x, y, { count: 3, angle: back, spread: 1.6, speed: 70, life: .6, size: 2 }); return; }
      this.vfxEmitV188('spark', x, y, { count: 5, angle: back, spread: 1.7, speed: 260, life: .22, size: 7 });
      this.vfxEmitV188('smoke', x, y, { angle: back, spread: .6, speed: 14, life: .5, size: 5 });
    }
    damagePlayer(player, amount, options = {}) {
      const before = finite(player?.health), result = super.damagePlayer(player, amount, options);
      if (this.vfxV188Enabled && player && (player === this.player || player === this.coop) && finite(player.health) < before) {
        const screen = this.vfxScreenV188; screen.vignette = VFX_V188.vignetteSeconds;
        screen.vignetteStrength = Math.min(1, Math.max(screen.vignetteStrength * .5, .35 + (before - player.health) / 30));
      }
      return result;
    }
    activateTracker(actor = this.player) {
      const accepted = super.activateTracker(actor);
      if (accepted && this.vfxV188Enabled && actor) {
        const reduced = this.vfxReducedV188();
        spawnVfxParticleV188(this.vfxV188, 'ping', actor.x + actor.w / 2, actor.y + actor.h * .4, 0, 0, reduced ? .6 : 1.1, reduced ? 260 : 520,
          { limit: this.vfxLimitV188(), angle: finite(actor.facing, 1) < 0 ? Math.PI : 0 });
      }
      return accepted;
    }
    // —— per-frame: pool, ambient emitters, footsteps ——
    update(delta) {
      const result = super.update(delta);
      if (!this.vfxV188Enabled || !this.vfxV188 || !this.running || this.paused || !(delta > 0)) return result;
      const dt = Math.min(VFX_V188.maxStep, delta), reduced = this.vfxReducedV188();
      stepVfxPoolV188(this.vfxV188, dt, {
        onLand: p => { addVfxDecalV188(this.vfxV188, p.x, p.y, 10 + p.size * 3); },
        onDecalSmoke: d => { if (!reduced || d.seed % 2) this.vfxEmitV188('acid-smoke', d.x + (this.vfxRandomV188() - .5) * d.w * .6, d.y - 2, { angle: -Math.PI / 2, spread: .5, speed: 24, life: .9, size: 5 }); }
      });
      const screen = this.vfxScreenV188; screen.vignette = Math.max(0, screen.vignette - dt); screen.strobe += dt;
      this.vfxFootstepsV188();
      const clock = this.vfxClockV188; clock.ambient -= dt;
      if (clock.ambient <= 0) { clock.ambient = reduced ? .7 : .35; this.vfxAmbientV188(); }
      if (this.missionLevelVisualState?.storm && !reduced && (clock.storm -= dt) <= 0) {
        clock.storm = .12; const cam = this.camera || { x: 0, y: 0 };
        this.vfxEmitV188('dust', cam.x + VFX_V188.logicalWidth + 20, cam.y + 120 + this.vfxRandomV188() * 520, { angle: Math.PI + .1, spread: .3, speed: 380, life: 3.6, size: 6 });
      }
      return result;
    }
    vfxFootstepsV188() {
      const actor = this.player; if (!actor) return;
      const grounded = actor.grounded !== false && !actor.climbing;
      const feetY = actor.y + actor.h, x = actor.x + actor.w / 2, surface = String(this.footstepSurfaceV188 || 'step-metal');
      const landed = grounded && this.vfxGroundedV188 === false && !actor.inVehicle && !actor.ventTransit;
      this.vfxGroundedV188 = grounded;
      const steps = this.footstepsV188 || 0, stepped = steps > (this.vfxFootstepsSeenV188 || 0); this.vfxFootstepsSeenV188 = steps;
      if (!stepped && !landed) return;
      if (surface === 'step-water') this.vfxEmitV188('splash', x, feetY, { spread: 0, life: .3, size: landed ? 14 : 9 });
      else if (surface === 'step-concrete' || surface === 'step-resin' || landed)
        this.vfxEmitV188('dust', x, feetY - 2, { count: landed ? 3 : 1, angle: -Math.PI / 2, spread: 2.6, speed: 24, life: .5, size: landed ? 9 : 6 });
    }
    vfxAmbientV188() {
      const cam = this.camera || { x: 0, y: 0 }, view = { x: cam.x, y: cam.y, w: VFX_V188.logicalWidth, h: VFX_V188.logicalHeight };
      const random = this.vfxRandomV188;
      // Damaged (not destroyed) wall panels shed sparks.
      for (const object of this.destructibleSceneryV130?.objects || []) {
        if (object.destroyed || object.material !== 'panel' || !(object.hp < object.maxHp * .7) || !inView(object.x, object.y, object.w, view)) continue;
        this.vfxEmitV188('panel-spark', object.x + random() * object.w, object.y + object.h * .2, { count: 2, angle: Math.PI / 2, spread: 1, speed: 70, life: .5, size: 6,
          floorY: object.y + object.h });
      }
      // Duct grilles vent steam aboard ships.
      if (/ship|station|interior/.test(String(this.missionLevelRuntime?.templateId || ''))) {
        for (const vent of this.vents || []) {
          if (!inView(vent.x, vent.y, 80, view) || random() < .5) continue;
          this.vfxEmitV188('steam', vent.x + vent.w / 2, vent.y + 4, { angle: -Math.PI / 2, spread: .7, speed: 30, life: 1.4, size: 8 });
        }
      }
    }
    // —— drawing ——
    vfxViewV188() { const cam = this.camera || { x: 0, y: 0 }; return { x: finite(cam.x), y: finite(cam.y), w: VFX_V188.logicalWidth, h: VFX_V188.logicalHeight }; }
    drawWeaponPickup(ctx) {
      // Floor burns go down after the decks, walls and props, before pickups and actors.
      if (this.vfxV188Enabled && this.vfxV188?.decals.length) drawVfxDecalsV188(ctx, this.vfxV188, this.vfxViewV188());
      return super.drawWeaponPickup(ctx);
    }
    drawWorld(ctx) {
      const result = super.drawWorld(ctx);
      if (this.vfxV188Enabled) {
        const view = this.vfxViewV188();
        this.drawSmartgunTracersV188(ctx, view);
        if (this.vfxV188?.count) drawVfxParticlesV188(ctx, this.vfxV188, view);
      }
      return result;
    }
    /** M56 smartgun rounds carry a tracer streak (the bullet sprite itself is unchanged). */
    drawSmartgunTracersV188(ctx, view) {
      const length = this.vfxReducedV188() ? 28 : 48;
      for (const bullet of this.bullets || []) {
        if (bullet.hit || !isSmartgunRoundV188(bullet)) continue;
        const x = finite(bullet.x) + finite(bullet.w) / 2, y = finite(bullet.y) + finite(bullet.h) / 2;
        if (!inView(x, y, length + VFX_V188.viewportMargin, view)) continue;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y); ctx.rotate(Math.atan2(finite(bullet.vy), finite(bullet.vx) || 1));
        drawVfxSlotV188(ctx, 'smartgun-tracer', 0, length); ctx.restore();
        if (this.vfxV188) this.vfxV188.stats.tracers++;
      }
    }
    drawHud(ctx) {
      if (this.vfxV188Enabled && this.vfxScreenV188 && ctx && this.mission?.state === 'active') this.drawVfxScreenV188(ctx);
      return super.drawHud(ctx);
    }
    drawVfxScreenV188(ctx) {
      const screen = this.vfxScreenV188, reduced = this.vfxReducedV188(), size = { width: VFX_V188.logicalWidth, height: VFX_V188.logicalHeight };
      if (screen.vignette > 0) {
        const t = screen.vignette / VFX_V188.vignetteSeconds;
        // Reduced motion: a low, steady tint that only fades out (no flash peak).
        ctx.save(); ctx.globalAlpha = reduced ? .16 * t : .42 * t * t * screen.vignetteStrength;
        drawVfxSlotV188(ctx, 'damage-vignette', 1 - t, screen.vignetteStrength, size); ctx.restore();
      }
      if (this.tensionV188?.phase === 'peak') {
        // Sodium emergency wash; the rotating beacon sweep is left out with reduced motion.
        ctx.save(); ctx.globalAlpha = reduced ? .07 : .09 + .03 * Math.sin(screen.strobe * 2.2);
        drawVfxSlotV188(ctx, 'sodium-wash', 0, 1, size);
        if (!reduced) { ctx.globalAlpha = .22; drawVfxSlotV188(ctx, 'alarm-strobe', screen.strobe * .55, 1, size); }
        ctx.restore();
      }
    }
    getVfxSnapshotV188() {
      const pool = this.vfxV188;
      return pool ? { enabled: this.vfxV188Enabled, particles: pool.count, cap: pool.cap, limit: this.vfxLimitV188(), decals: pool.decals.length,
        frozen: pool.freeze > 0, vignette: this.vfxScreenV188?.vignette || 0, stats: { ...pool.stats, byKind: { ...pool.stats.byKind } },
        kinds: pool.items.slice(0, pool.count).reduce((map, p) => (map[p.kind] = (map[p.kind] || 0) + 1, map), {}) } : null;
    }
  };
}
