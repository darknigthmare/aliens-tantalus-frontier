// V188 — creature scale aligned on the documented franchise sizes (owner decision 2026-11-16,
// bible docs/narrative/CAMPAGNE_PRINCIPALE.md §56.4, « Échelle des créatures »). [PROPOSÉ]
//
// Project scale: 1 m ≈ 51 px, the marine is 92 px tall (1.8 m). A warrior (≈ 2.3 m) is drawn
// 118 px tall, the queen (≈ 4.8 m) 245 px. Every other caste keeps the proportion to the warrior
// that ENEMY_DISPLAY_STATURES_V110 already declared (warrior 156 there): factor 118 / 156.
// A creature without a declared stature keeps its current drawn height times the same factor.
// Humans and synthetics already follow the human visual contract (V133) in missions and are not
// rescaled there; in the catalogue they follow the marine reference (126 → 92).
//
// The sizes are a project adaptation of what the films and games show, never a 1:1 claim.
// Images are not edited: missions scale them at draw time, the catalogue through its world unit.
//
// Mission contract (withCreatureScaleV188):
// - drawing: one measured scale per creature visual, around the feet/centre anchor, so the idle
//   pose stands at its target height; another pose (alert, attack, hurt) never stands taller;
// - hitbox: height = drawn opaque height; width = the central half of the drawn opaque width
//   (tail, crest and outstretched limbs excluded, as the legacy warrior box already did; an egg
//   keeps 90 %, a slim upright silhouette at least 0.3 × its height, never wider than before); the
//   feet and the horizontal centre are kept. Two existing size rules keep their verdict: the
//   depth holds' "wider than 120 px" big-caste rule and the large-actor placement (≥ 300 × 200).
//   Sprite-cell collision boxes (V52) are replaced by this box for a rescaled creature.
// - ids, content and the save format are unchanged: a resumed legacy save (top-left saved with
//   the old body height) is put back on its floor.
import { ENEMIES } from './content-core-v50.js';
import { ENEMY_DISPLAY_STATURES_V110, getEnemyDisplayStatureV110, getEnemyDisplayDimensionsV110 } from './enemy-display-scale-v110.js';
import { ENEMY_DISPLAY_ALPHA_V110 } from './enemy-display-alpha-v110.js';
import { ENEMY_DEDICATED_POSES_V99 } from './enemy-dedicated-poses-v99.js';
import { ENEMY_STATIC_POSES_V96 } from './enemy-static-poses-v96.js';
import { getEnemyUserCasteV87 } from './enemy-user-castes-v87.js';
import { ENEMY_AFE2_ADAPTATIONS_V113 } from './enemy-afe2-adaptations-v113.js';
import { ENEMY_USER_RECONSTRUCTIONS_V113 } from './enemy-user-reconstructions-v113.js';

export const CREATURE_SCALE_V188 = Object.freeze({
  schema: 188, status: 'PROPOSÉ', pixelsPerMetre: 51,
  marine: Object.freeze({ metres: 1.8, height: 92, legacyCatalogueHeight: 126 }),
  warrior: Object.freeze({ metres: 2.3, height: 118, legacyHeight: 156, referenceId: 'enemy-005-warrior' }),
  queen: Object.freeze({ metres: 4.8, height: 245 }),
  creatureFactor: 118 / 156,
  humanFactor: 92 / 126,
  hitbox: Object.freeze({ widthShare: .5, widthShareByCaste: Object.freeze({ egg: .9 }), slimFloor: .3, minWidth: 12, holdWidthLimit: 120, largeActor: Object.freeze({ w: 300, h: 200 }) }),
  /** [PROPOSÉ] Aim-assist compensation (see applyAimAssist): reach of the legacy-silhouette test, aim point (share of height from the top). */
  legacyAssist: Object.freeze({ reach: 950, aimHeight: .3 }),
  tolerance: 4
});

/** Stature keys of the queen class (4.8 m). A queen chestburster is not a queen. */
const QUEEN_KEYS_V188 = new Set(['enemy-008-queen', 'enemy-024-ripper-queen', 'castes-game_pathogen_queen', 'pose-v113-import-xeno-titan-queen-nolegs']);
export const isQueenStatureKeyV188 = key => QUEEN_KEYS_V188.has(String(key || ''));
const CREATURE_BIOLOGIES = new Set(['xenomorph', 'pathogen', 'fauna', 'hybrid']);
const enemiesById = new Map(ENEMIES.map(enemy => [enemy.id, enemy]));
const poseBiology = new Map([...ENEMY_AFE2_ADAPTATIONS_V113, ...ENEMY_USER_RECONSTRUCTIONS_V113].map(p => [p.id, p.biology]));
const HUMAN_KEY = /human|synth|commando|working-joe|peacekeeper|guardian|david|eloise|warden|trooper|sniper|enforcer|containment|incinerator|detonator/;
/** A V110 stature key staged as a human or a machine (catalogue: follows the marine). */
export function isHumanStatureKeyV188(key) {
  const id = String(key || ''), enemy = enemiesById.get(id), biology = enemy?.biology || poseBiology.get(id);
  if (biology) return biology === 'human' || biology === 'synthetic';
  return id.startsWith('pose-v') && HUMAN_KEY.test(id) && !/engineer-hybrid/.test(id);
}

/** New height of a V110 stature key. */
export function statureFromLegacyV188(key, legacyHeight) {
  if (isQueenStatureKeyV188(key)) return CREATURE_SCALE_V188.queen.height;
  const factor = isHumanStatureKeyV188(key) ? CREATURE_SCALE_V188.humanFactor : CREATURE_SCALE_V188.creatureFactor;
  return Math.round(legacyHeight * factor);
}
/** [PROPOSÉ] Every declared stature on the V188 scale (same keys as ENEMY_DISPLAY_STATURES_V110). */
export const ENEMY_DISPLAY_STATURES_V188 = Object.freeze(Object.fromEntries(Object.entries(ENEMY_DISPLAY_STATURES_V110)
  .map(([key, height]) => [key, statureFromLegacyV188(key, height)])));

/** V110 resolution (exact ids, counterparts, modifier variants) mapped on the V188 scale. */
export function getEnemyDisplayStatureV188(pose) {
  const legacy = getEnemyDisplayStatureV110(pose);
  if (!legacy) return null;
  return Object.freeze({ ...legacy, legacyHeight: legacy.height, height: ENEMY_DISPLAY_STATURES_V188[legacy.referenceId],
    basis: 'franchise-documented-scale-v188-proposed', canonVerified: false });
}
/** Catalogue dimensions: the V110 layout (pixels, aspect, ground pivot) at the V188 stature. */
export function getEnemyDisplayDimensionsV188(pose) {
  const display = getEnemyDisplayDimensionsV110(pose), stature = display && getEnemyDisplayStatureV188(pose);
  if (!display || !stature) return display;
  const k = stature.height / stature.legacyHeight;
  return Object.freeze({ ...display, width: display.width * k, height: display.height * k,
    visibleHeight: display.visibleHeight * k, visibleWidth: display.visibleWidth * k, basis: stature.basis });
}

const profileOf = enemy => String(enemy?.profileId || enemy?.id || '').split(':')[0].split('#')[0];
/** Target of a mission enemy: { kind: 'human'|'unlisted'|'queen'|'declared'|'undeclared', height|null, referenceId }. */
export function creatureTargetV188(enemy) {
  const id = profileOf(enemy), source = enemiesById.get(id), caste = getEnemyUserCasteV87(id);
  const biology = String(enemy?.biology || source?.biology || caste?.biology || '');
  if (!CREATURE_BIOLOGIES.has(biology) || /human|synthetic|commando|working-joe/.test(id))
    return Object.freeze({ kind: 'human', height: null, referenceId: null, id });
  // A scripted actor without a catalogue identity keeps the body its author gave it.
  if (!source && !caste) return Object.freeze({ kind: 'unlisted', height: null, referenceId: null, id });
  const stature = getEnemyDisplayStatureV188({ id, profileId: id, legacyCounterpartId: caste?.legacyCounterpartId });
  if (!stature) return Object.freeze({ kind: 'undeclared', height: null, referenceId: null, id });
  if (isHumanStatureKeyV188(stature.referenceId)) return Object.freeze({ kind: 'human', height: null, referenceId: stature.referenceId, id });
  return Object.freeze({ kind: isQueenStatureKeyV188(stature.referenceId) ? 'queen' : 'declared', height: stature.height,
    legacyHeight: stature.legacyHeight, referenceId: stature.referenceId, id });
}

// —— Measuring a drawing (no pixels read: the measured opaque bounds of each shipped image) ——
// The neuro-xeno 4×4 sheet had no V110 measurement: its first cell, measured from the PNG alpha.
const SUPPLEMENTARY_ALPHA_V188 = Object.freeze({
  '/assets/openai/neuro-xeno-animation-sheet.png': Object.freeze({ bounds: Object.freeze([11, 54, 249, 241]), width: 256, height: 256 })
});
const alphaByPath = new Map([
  ...Object.entries(ENEMY_DISPLAY_ALPHA_V110).map(([path, value]) => [path, value]),
  ...Object.entries(SUPPLEMENTARY_ALPHA_V188),
  ...[...ENEMY_DEDICATED_POSES_V99, ...ENEMY_STATIC_POSES_V96].filter(p => p.alphaBounds && p.path)
    .map(p => [p.path, { bounds: p.alphaBounds, width: p.sourceWidth, height: p.sourceHeight }])
]);
const pathOf = image => { try { return new URL(String(image?.src || image?._src || ''), 'http://local.invalid').pathname; } catch { return ''; } };
const multiply = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3],
  a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];

/** A recording 2D context: tracks the transform and the opaque rectangle of every drawImage. */
export function createDrawMeasureContextV188() {
  let m = [1, 0, 0, 1, 0, 0]; const stack = [], draws = [], gradient = { addColorStop() {} };
  const target = {
    globalAlpha: 1, canvas: { width: 1280, height: 720 }, draws,
    save() { stack.push(m); }, restore() { m = stack.pop() || [1, 0, 0, 1, 0, 0]; },
    translate(x, y) { m = multiply(m, [1, 0, 0, 1, x, y]); }, scale(x, y) { m = multiply(m, [x, 0, 0, y, 0, 0]); },
    rotate(r) { const c = Math.cos(r), s = Math.sin(r); m = multiply(m, [c, s, -s, c, 0, 0]); },
    transform(a, b, c, d, e, f) { m = multiply(m, [a, b, c, d, e, f]); },
    setTransform(a, b, c, d, e, f) { m = Number.isFinite(a) ? [a, b, c, d, e, f] : [1, 0, 0, 1, 0, 0]; }, resetTransform() { m = [1, 0, 0, 1, 0, 0]; },
    getTransform: () => ({ a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] }),
    measureText: value => ({ width: String(value).length * 7 }), createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    createPattern: () => null, getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }),
    drawImage(image, ...args) {
      const width = image?.naturalWidth || image?.width || 0, height = image?.naturalHeight || image?.height || 0;
      let dx, dy, dw, dh;
      if (args.length >= 8) [, , , , dx, dy, dw, dh] = args; else if (args.length >= 4) [dx, dy, dw, dh] = args; else { [dx, dy] = args; dw = width; dh = height; }
      if (![dx, dy, dw, dh].every(Number.isFinite)) return;
      const alpha = alphaByPath.get(pathOf(image)), b = alpha?.bounds;
      const [l, t, r, bo] = b ? [b[0] / alpha.width, b[1] / alpha.height, b[2] / alpha.width, b[3] / alpha.height] : [0, 0, 1, 1];
      const corners = [[dx + dw * l, dy + dh * t], [dx + dw * r, dy + dh * bo]].map(([x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]);
      draws.push({ path: pathOf(image), measured: Boolean(b), left: Math.min(corners[0][0], corners[1][0]), right: Math.max(corners[0][0], corners[1][0]),
        top: Math.min(corners[0][1], corners[1][1]), bottom: Math.max(corners[0][1], corners[1][1]), cell: Math.abs(dh * m[3]) });
    }
  };
  return new Proxy(target, { get: (object, key) => key in object ? object[key] : () => {}, set: (object, key, value) => { object[key] = value; return true; } });
}
/** The creature's own sprite in a recorded draw: the tallest image. */
export function measuredSpriteV188(draws) {
  const sprite = (draws || []).filter(d => d.cell > 4 && d.bottom > d.top).sort((a, b) => (b.bottom - b.top) - (a.bottom - a.top))[0];
  return sprite ? Object.freeze({ height: sprite.bottom - sprite.top, width: sprite.right - sprite.left, top: sprite.top, bottom: sprite.bottom,
    left: sprite.left, right: sprite.right, path: sprite.path, measured: sprite.measured }) : null;
}

const STATES_V188 = Object.freeze({
  idle: { alert: false, attacking: false, hurtClock: 0, pendingMelee: false, attackAnimationClock: 0, attackWindupClock: 0, staggerClock: 0 },
  alert: { alert: true, attacking: false, hurtClock: 0 },
  attack: { alert: true, attacking: true, attackAnimationClock: .2, hurtClock: 0 },
  hurt: { alert: true, attacking: false, hurtClock: .2, v52HurtClock: .2 }
});
export const CREATURE_SCALE_STATES_V188 = Object.freeze(Object.keys(STATES_V188));
export function creatureScaleStateV188(enemy) {
  if (enemy?.hurtClock > 0 || enemy?.v52HurtClock > 0) return 'hurt';
  if (enemy?.attacking || enemy?.pendingMelee || enemy?.attackAnimationClock > 0) return 'attack';
  return enemy?.alert ? 'alert' : 'idle';
}
const visualKey = enemy => [profileOf(enemy), enemy.visualSheetId, enemy.visualImageKey, enemy.spriteKey, enemy.visualStateV95].map(v => v ?? '').join('|');
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
/** Distance along a unit ray to a box, or null (slab test). */
export function rayBoxDistanceV188(origin, dir, box) {
  let near = 0, far = Infinity;
  for (const [o, d, min, max] of [[origin.x, dir.x, box.x, box.x + box.w], [origin.y, dir.y, box.y, box.y + box.h]]) {
    if (Math.abs(d) < 1e-9) { if (o < min || o > max) return null; continue; }
    let t1 = (min - o) / d, t2 = (max - o) / d; if (t1 > t2) [t1, t2] = [t2, t1];
    near = Math.max(near, t1); far = Math.min(far, t2); if (near > far) return null;
  }
  return near;
}

/** Hitbox of a rescaled creature from its target height and drawn opaque width. */
export function creatureHitboxV188({ height, drawnWidth, legacyW, legacyH, caste = null }) {
  const rules = CREATURE_SCALE_V188.hitbox, h = Math.round(height);
  const share = rules.widthShareByCaste[caste] ?? rules.widthShare;
  // A slim upright silhouette keeps a body at least 0.3 × its height wide (never wider than before).
  let w = Math.max(rules.minWidth, Math.round(drawnWidth * share), Math.min(Math.round(legacyW), Math.round(h * rules.slimFloor)));
  // Keep the verdict of the existing size rules on the legacy body.
  if (legacyW <= rules.holdWidthLimit) w = Math.min(w, rules.holdWidthLimit); else w = Math.max(w, rules.holdWidthLimit + 1);
  if (legacyW >= rules.largeActor.w && legacyH >= rules.largeActor.h && h >= rules.largeActor.h) w = Math.max(w, rules.largeActor.w);
  return { w, h };
}

export function withCreatureScaleV188(Base) {
  if (Base.creatureScaleV188) return Base;
  return class CreatureScaleV188 extends Base {
    static creatureScaleV188 = true;
    creatureScaleEnabledV188() { return !this.bioforgeLevelV80; } // the BioForge admits its own bodies

    /** One dry draw of `enemy` in `state` with a virtual body (scale k), returned in world pixels. */
    measureCreatureDrawV188(enemy, state = 'idle', k = 1) {
      const clone = { ...enemy, ...STATES_V188[state], alive: true, deathClock: 0, revealed: 0, casteV188: null, depthZ: 0, id: `${enemy.id}#creature-scale-v188:${state}` };
      const ctx = createDrawMeasureContextV188();
      try { this.drawCreatureScaledV188(ctx, clone, k); } catch { return null; }
      return measuredSpriteV188(ctx.draws);
    }
    drawCreatureScaledV188(ctx, enemy, k) {
      if (!(k > 0) || Math.abs(k - 1) < 1e-6) return super.drawEnemy(ctx, enemy);
      const fx = enemy.x + enemy.w / 2, fy = enemy.y + enemy.h, body = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
      ctx.save?.(); ctx.translate?.(fx, fy); ctx.scale?.(k, k); ctx.translate?.(-fx, -fy);
      // Virtual body: once scaled, anything the renderer sizes on the body (health bar, cover
      // outline, vector prototype) lands on the real hitbox.
      enemy.w = body.w / k; enemy.h = body.h / k; enemy.x = fx - enemy.w / 2; enemy.y = fy - enemy.h;
      try { return super.drawEnemy(ctx, enemy); } finally { Object.assign(enemy, body); ctx.restore?.(); }
    }
    /** Scale profile of a visual, measured on the legacy body: idle scale, per-state scales
     * (never taller than idle) and the new body. Cached per visual until confirmed stable. */
    creatureScaleProfileV188(enemy, body = enemy) {
      const cache = this.creatureScaleCacheV188 ||= new Map(), key = visualKey(enemy);
      if (cache.has(key)) return cache.get(key);
      const profile = this.buildCreatureScaleProfileV188(enemy, body, key);
      if (profile) cache.set(key, profile);
      return profile;
    }
    buildCreatureScaleProfileV188(enemy, body, key = visualKey(enemy)) {
      const target = creatureTargetV188(enemy);
      if (target.kind === 'human' || target.kind === 'unlisted') return Object.freeze({ key, target, k: 1, states: null, exempt: true });
      const base = { ...enemy, x: finite(body.x), y: finite(body.y), w: finite(body.w), h: finite(body.h) };
      const legacy = this.measureCreatureDrawV188(base, 'idle', 1);
      if (!legacy) return null; // image not loaded yet: retried later
      const height = target.height ?? legacy.height * CREATURE_SCALE_V188.creatureFactor;
      let k = height / legacy.height;
      const caste = enemy.caste || enemiesById.get(profileOf(enemy))?.caste || null;
      const hitbox = creatureHitboxV188({ height, drawnWidth: legacy.width * k, legacyW: base.w, legacyH: base.h, caste });
      // Re-measure on the new body (a renderer may size the sprite on the body).
      const probe = { ...base, w: hitbox.w, h: hitbox.h, x: base.x + base.w / 2 - hitbox.w / 2, y: base.y + base.h - hitbox.h };
      const check = this.measureCreatureDrawV188(probe, 'idle', k);
      if (check?.height > 0) k *= height / check.height;
      const states = { idle: k };
      for (const state of CREATURE_SCALE_STATES_V188) {
        if (state === 'idle') continue;
        const drawn = this.measureCreatureDrawV188(probe, state, k);
        states[state] = drawn?.height > height ? k * height / drawn.height : k;
      }
      return Object.freeze({ key, target, k, height, legacyHeight: legacy.height, legacyWidth: legacy.width, legacyPath: legacy.path,
        drawnWidth: legacy.width * k, hitbox: Object.freeze(hitbox), states: Object.freeze(states), exempt: false });
    }
    /** Puts the profile's body on an enemy around its current feet and horizontal centre. */
    applyCreatureBodyV188(enemy, profile, legacy) {
      const { w, h } = profile.hitbox, cx = enemy.x + enemy.w / 2, feet = enemy.y + enemy.h, previousW = enemy.w;
      enemy.w = w; enemy.h = h; enemy.x = cx - w / 2; enemy.y = feet - h;
      if (Number.isFinite(enemy.spawnX)) enemy.spawnX += (previousW - w) / 2;
      enemy.spriteHitbox = null;
      enemy.creatureScaleV188 = Object.freeze({ schema: 188, exempt: false, key: profile.key, kind: profile.target.kind,
        referenceId: profile.target.referenceId, target: profile.height, k: profile.k, legacyW: legacy.w, legacyH: legacy.h, w, h });
      return enemy.creatureScaleV188;
    }
    /** Applies the V188 body once per enemy, keeping its feet and horizontal centre. */
    normalizeCreatureV188(enemy) {
      if (!enemy || enemy.creatureScaleV188 || !this.creatureScaleEnabledV188()) return enemy?.creatureScaleV188 || null;
      if (enemy.creatureScaleRetryV188 > finite(this.animationTime)) return null;
      const profile = this.creatureScaleProfileV188(enemy);
      if (!profile) { enemy.creatureScaleRetryV188 = finite(this.animationTime) + .25; return null; }
      const legacy = { w: finite(enemy.w), h: finite(enemy.h) };
      if (profile.exempt) { enemy.creatureScaleV188 = Object.freeze({ schema: 188, exempt: true, legacyW: legacy.w, legacyH: legacy.h, k: 1 }); return enemy.creatureScaleV188; }
      return this.applyCreatureBodyV188(enemy, profile, legacy);
    }
    /** A first measurement can catch a fallback image while the real atlas loads: each profile is
     * re-measured on the legacy body until two later measurements agree; a change rebuilds it. */
    revalidateCreatureProfilesV188() {
      const cache = this.creatureScaleCacheV188, checks = this.creatureScaleChecksV188 ||= new Map(), now = finite(this.animationTime), seen = new Set();
      if (!cache?.size || !Array.isArray(this.enemies)) return 0;
      let rebuilt = 0;
      for (const enemy of this.enemies) {
        const record = enemy?.creatureScaleV188, profile = record && !record.exempt && cache.get(record.key);
        if (!profile || seen.has(record.key)) continue; seen.add(record.key);
        const check = checks.get(record.key) || { count: 0, at: -Infinity };
        if (check.count >= 2 || now - check.at < .2) continue;
        const body = { w: record.legacyW, h: record.legacyH, x: enemy.x + enemy.w / 2 - record.legacyW / 2, y: enemy.y + enemy.h - record.legacyH };
        const measured = this.measureCreatureDrawV188({ ...enemy, ...body }, 'idle', 1);
        if (!measured) continue;
        if (Math.abs(measured.height - profile.legacyHeight) <= .5 && measured.path === profile.legacyPath) { checks.set(record.key, { count: check.count + 1, at: now }); continue; }
        const next = this.buildCreatureScaleProfileV188(enemy, body, record.key); if (!next) continue;
        cache.set(record.key, next); checks.set(record.key, { count: 0, at: now }); rebuilt++;
        for (const other of this.enemies) if (other?.creatureScaleV188?.key === record.key)
          this.applyCreatureBodyV188(other, next, { w: other.creatureScaleV188.legacyW, h: other.creatureScaleV188.legacyH });
      }
      return rebuilt;
    }
    /** Confirms every profile now (tests, previews): repeated until stable or `rounds` exhausted. */
    settleCreatureScaleV188(rounds = 4) {
      for (let round = 0; round < rounds; round++) {
        for (const value of (this.creatureScaleChecksV188 || new Map()).values()) value.at = -Infinity;
        this.revalidateCreatureProfilesV188();
      }
    }
    normalizeCreaturesV188(limit = 48) {
      if (!Array.isArray(this.enemies) || !this.creatureScaleEnabledV188()) return 0;
      let done = 0;
      for (const enemy of this.enemies) {
        if (done >= limit) break;
        if (enemy && !enemy.creatureScaleV188 && this.normalizeCreatureV188(enemy)) done++;
      }
      return done;
    }
    start(options = {}) {
      const result = super.start(options);
      this.creatureScaleCacheV188 = this.creatureScaleCacheV188 || new Map();
      this.normalizeCreaturesV188(Infinity);
      return result;
    }
    update(delta) {
      this.normalizeCreaturesV188();
      this.revalidateCreatureProfilesV188();
      return super.update(delta);
    }
    refreshSpriteCollisionProfiles() {
      const result = super.refreshSpriteCollisionProfiles?.();
      for (const enemy of Array.isArray(this.enemies) ? this.enemies : []) if (enemy?.creatureScaleV188 && !enemy.creatureScaleV188.exempt) enemy.spriteHitbox = null;
      return result;
    }
    drawEnemy(ctx, enemy) {
      const scale = enemy?.creatureScaleV188 || this.normalizeCreatureV188(enemy);
      if (!scale || scale.exempt) return super.drawEnemy(ctx, enemy);
      const profile = this.creatureScaleCacheV188?.get(scale.key);
      const k = profile?.states?.[creatureScaleStateV188(enemy)] ?? scale.k;
      try { return this.drawCreatureScaledV188(ctx, enemy, k); } finally { enemy.spriteHitbox = null; }
    }
    /** [PROPOSÉ] Legacy-silhouette assist: with aim assist on, a shot that would have met the
     * creature's pre-V188 body (same feet and centre) but passes beside its smaller body is bent
     * onto its upper body. Damage is unchanged; with aim assist off nothing changes. */
    applyAimAssist(bullet, player) {
      const assisted = super.applyAimAssist(bullet, player);
      const strength = this.accessibilityRuntime?.aimAssistStrength || 0;
      if (assisted || !strength || !bullet || !player || bullet.aimExplicitV83) return assisted;
      const speed = Math.hypot(finite(bullet.vx), finite(bullet.vy)); if (!speed) return false;
      const origin = { x: finite(bullet.x) + finite(bullet.w) / 2, y: finite(bullet.y) + finite(bullet.h) / 2 }, dir = { x: bullet.vx / speed, y: finite(bullet.vy) / speed };
      const candidates = (Array.isArray(this.enemies) ? this.enemies : []).filter(enemy => enemy?.alive && enemy.creatureScaleV188 && !enemy.creatureScaleV188.exempt)
        .map(enemy => { const s = enemy.creatureScaleV188, cx = enemy.x + enemy.w / 2, feet = enemy.y + enemy.h;
          // Boxes grown by half the projectile (a projectile hits on rectangle overlap).
          const hw = finite(bullet.w) / 2, hh = finite(bullet.h) / 2, grow = box => ({ x: box.x - hw, y: box.y - hh, w: box.w + 2 * hw, h: box.h + 2 * hh });
          const legacyBox = grow({ x: cx - s.legacyW / 2, y: feet - s.legacyH, w: s.legacyW, h: s.legacyH });
          return { enemy, legacy: rayBoxDistanceV188(origin, dir, legacyBox), now: rayBoxDistanceV188(origin, dir, grow(enemy)) }; })
        .filter(entry => entry.legacy !== null && entry.legacy <= CREATURE_SCALE_V188.legacyAssist.reach && entry.now === null)
        .sort((a, b) => a.legacy - b.legacy);
      const target = candidates[0]?.enemy; if (!target) return false;
      const aimY = target.y + target.h * CREATURE_SCALE_V188.legacyAssist.aimHeight, aimX = target.x + target.w / 2;
      const angle = Math.atan2(aimY - origin.y, aimX - origin.x);
      bullet.vx = Math.cos(angle) * speed; bullet.vy = Math.sin(angle) * speed; bullet.angleRadians = angle;
      bullet.aimAssistTargetId = target.id; bullet.creatureScaleAssistV188 = true;
      return true;
    }
    applyResumeState(rawState) {
      const result = super.applyResumeState(rawState);
      // A save written before V188 holds the top-left of the legacy body: put its feet back on
      // the floor they stood on (ids and the save format are unchanged).
      const surfaces = [...(Array.isArray(this.platforms) ? this.platforms : []).map(p => finite(p.y, NaN)), ...(Array.isArray(this.enemies) ? this.enemies : []).map(e => finite(e?.groundY, NaN))].filter(Number.isFinite);
      for (const enemy of Array.isArray(this.enemies) ? this.enemies : []) {
        const scale = enemy?.creatureScaleV188; if (!scale || scale.exempt || scale.legacyH === enemy.h) continue;
        const legacyFeet = enemy.y + scale.legacyH, feet = enemy.y + enemy.h;
        const onLegacy = surfaces.some(y => Math.abs(y - legacyFeet) <= 2), onNew = surfaces.some(y => Math.abs(y - feet) <= 2);
        if (onLegacy && !onNew) { enemy.y = legacyFeet - enemy.h; enemy.x += (scale.legacyW - enemy.w) / 2; }
      }
      return result;
    }
  };
}
