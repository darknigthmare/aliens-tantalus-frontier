/** Optional images for existing Tantalus simulations and accepted combat events.
 * These are project adaptations, not new powers or certified franchise replicas.
 * No state, collisions, hit timings or saved identifiers are owned here. */
const root = '/assets/openai/xeno-trials-v205';
export const XENO_TRIALS_STAGE_BACKDROPS_V205 = Object.freeze(Object.fromEntries(
  ['containment-deck', 'reactor-ring', 'hive-vault'].map(id => [id, `${root}/stages/${id}.png`])));
// Contact edges measured in the generated 1672 × 941 backdrops. This moves
// scenery only; the native fighting floor and camera remain unchanged.
export const XENO_TRIALS_STAGE_FLOORS_V205 = Object.freeze({
  'containment-deck': 808 / 941, 'reactor-ring': 834 / 941, 'hive-vault': 867 / 941
});
export const XENO_TRIALS_PROJECTILE_IMAGES_V205 = Object.freeze(Object.fromEntries(
  ['acid-cluster', 'aimed-acid', 'pulse-bolt', 'ground-wave', 'acid-drop'].map(id => [id, `${root}/projectiles/${id}.png`])));
export const XENO_TRIALS_EFFECT_IMAGES_V205 = Object.freeze(Object.fromEntries(
  ['acid-splash', 'acid-pool', 'steam-jet', 'cryo-burst', 'electric-arc', 'debris-impact', 'detonation', 'synth-flame-cone']
    .map(id => [id, `${root}/vfx/${id}.png`])));
const optionalPaths = new Set([...Object.values(XENO_TRIALS_PROJECTILE_IMAGES_V205), ...Object.values(XENO_TRIALS_EFFECT_IMAGES_V205)]);
const imageReady = image => Number.isFinite(image?.naturalWidth) && image.naturalWidth > 0
  && Number.isFinite(image?.naturalHeight) && image.naturalHeight > 0;
// Source rectangles trim only near-transparent framing (alpha > 4/255 plus
// two pixels of margin), without editing the source PNG or changing aspect.
// A different decoded size keeps its whole canvas instead of reusing a stale
// frame. Character poses are deliberately absent from this runtime registry.
const frames = Object.freeze(Object.fromEntries([
  ['projectiles/acid-cluster', [1774, 887, 44, 159, 1730, 700]],
  ['projectiles/aimed-acid', [2172, 724, 70, 201, 2072, 493]],
  ['projectiles/pulse-bolt', [2172, 724, 420, 232, 1765, 502]],
  ['projectiles/ground-wave', [2172, 724, 26, 26, 2156, 691]],
  ['projectiles/acid-drop', [1024, 1536, 331, 378, 692, 1098]],
  ['vfx/acid-pool', [2172, 724, 54, 386, 2119, 467]],
  ['vfx/acid-splash', [1774, 887, 181, 73, 1586, 827]],
  ['vfx/steam-jet', [887, 1774, 91, 31, 800, 1749]],
  ['vfx/cryo-burst', [1774, 887, 50, 82, 1716, 778]],
  ['vfx/electric-arc', [2172, 724, 23, 155, 2144, 614]],
  ['vfx/debris-impact', [1774, 887, 130, 34, 1640, 821]],
  ['vfx/detonation', [1254, 1254, 156, 154, 1095, 1029]],
  ['vfx/synth-flame-cone', [1774, 887, 55, 119, 1701, 728]]
].map(([id, frame]) => [`${root}/${id}.png`, Object.freeze(frame)])));

/** Request a recognized effect only when it is encountered. One attempt per
 * runtime, including failures; late completions never revive a stopped game. */
export function createXenoTrialsOptionalImagesV205(images, loadImage, alive, onReady = () => {}) {
  const requested = new Set();
  return path => {
    if (!optionalPaths.has(path) || !alive()) return null;
    const existing = images.get(path);
    if (imageReady(existing)) return existing;
    if (!requested.has(path)) {
      requested.add(path);
      Promise.resolve().then(() => alive() ? loadImage(path) : null).then(image => {
        if (!alive() || !imageReady(image)) return;
        images.set(path, image); onReady();
      }).catch(() => { /* The existing procedural rendering remains visible. */ });
    }
    return null;
  };
}

/** Fit preserves the visible source aspect and never enlarges a native zone. */
function fit(image, width, height, path) {
  if (!imageReady(image) || ![width, height].every(value => Number.isFinite(value) && value > 0)) return null;
  const frame = frames[path];
  const [left, top, right, bottom] = frame?.[0] === image.naturalWidth && frame?.[1] === image.naturalHeight
    ? frame.slice(2) : [0, 0, image.naturalWidth, image.naturalHeight];
  const sourceWidth = right - left, sourceHeight = bottom - top;
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  return { left, top, sourceWidth, sourceHeight, width: sourceWidth * scale, height: sourceHeight * scale };
}
function draw(ctx, image, size, x, y) {
  ctx.drawImage(image, size.left, size.top, size.sourceWidth, size.sourceHeight, x, y, size.width, size.height);
}

export function getXenoTrialsProjectileImageV205(projectile) {
  if (projectile?.style === 'ground-wave') return XENO_TRIALS_PROJECTILE_IMAGES_V205['ground-wave'];
  if (projectile?.style === 'pulse') return XENO_TRIALS_PROJECTILE_IMAGES_V205['pulse-bolt'];
  if (projectile?.style !== 'acid') return null;
  return XENO_TRIALS_PROJECTILE_IMAGES_V205[projectile.signatureIdV147 === 'pathogen-queen-acid-cluster' ? 'acid-cluster' : 'aimed-acid'];
}

export function drawXenoTrialsProjectileV205(ctx, projectile, getImage, floor = 450) {
  const path = getXenoTrialsProjectileImageV205(projectile);
  if (!path || ![projectile.x, projectile.y, floor].every(Number.isFinite)) return false;
  const image = getImage(path), ground = projectile.style === 'ground-wave';
  const radius = Number.isFinite(projectile.radiusV147) ? Math.max(1, projectile.radiusV147) : 7;
  const size = fit(image, ground ? radius * 3 : projectile.signatureIdV147 ? 38 : 48, ground ? radius * 2 : 20, path);
  if (!size) return false;
  ctx.save(); ctx.translate(projectile.x, ground ? floor : floor - projectile.y);
  if (ground) {
    ctx.scale((projectile.vx ?? projectile.direction ?? 1) < 0 ? -1 : 1, 1);
    draw(ctx, image, size, -size.width / 2, -size.height);
  } else {
    // Physics y is up; Canvas y is down. Never aim toward a live target here.
    const vx = Number.isFinite(projectile.vx) ? projectile.vx : (projectile.direction || 1) * 560;
    const vy = Number.isFinite(projectile.vy) ? projectile.vy : 0;
    ctx.rotate(Math.atan2(-vy, vx));
    draw(ctx, image, size, -size.width / 2, -size.height / 2);
  }
  ctx.restore(); return true;
}

/** Decorative overlay clipped to the native active zone; floor borders and
 * warning fixtures are still drawn by V188 before/after the actors. */
export function drawXenoTrialsHazardImageV205(ctx, view, getImage, floor = 450) {
  if (view?.phase !== 'active' || !view.zones?.length) return false;
  const id = ({ steam: 'steam-jet', cryo: 'cryo-burst', arc: 'electric-arc', debris: 'debris-impact', corrosive: 'acid-pool' })[view.kind];
  if (!id) return false;
  const zone = view.zones[0], width = zone.right - zone.left, height = zone.top - zone.bottom;
  if (![zone.left, zone.right, zone.top, zone.bottom, floor].every(Number.isFinite)) return false;
  const path = XENO_TRIALS_EFFECT_IMAGES_V205[id], image = getImage(path);
  const size = fit(image, width, height, path);
  if (!size) return false;
  ctx.save(); ctx.beginPath(); ctx.rect(zone.left, floor - zone.top, width, height); ctx.clip();
  ctx.globalAlpha *= view.kind === 'steam' ? .45 : .65;
  draw(ctx, image, size, (zone.left + zone.right - size.width) / 2, floor - zone.bottom - size.height);
  ctx.restore(); return true;
}

export function drawXenoTrialsAcidPoolImagesV205(ctx, match, getImage, floor = 450) {
  const pools = (match.acidPoolsV152 || []).filter(pool => match.tick >= pool.armedTick && match.tick < pool.expiresTick);
  if (!pools.length) return 0;
  const path = XENO_TRIALS_EFFECT_IMAGES_V205['acid-pool'], image = getImage(path);
  if (!imageReady(image)) return 0;
  let drawn = 0;
  for (const pool of pools) {
    const size = fit(image, pool.right - pool.left, Math.max(1, pool.height), path);
    if (!size || ![pool.left, pool.right, pool.height, floor].every(Number.isFinite)) continue;
    ctx.save(); ctx.globalAlpha *= .7;
    draw(ctx, image, size, (pool.left + pool.right - size.width) / 2, floor - size.height);
    ctx.restore(); drawn++;
  }
  return drawn;
}

export function drawXenoTrialsAcidSplashV205(ctx, effect, getImage, floor = 450) {
  if (effect?.kind !== 'acid-death-v151' || !(effect.life > 0)
    || ![effect.x, effect.y, effect.radius, floor].every(Number.isFinite)) return false;
  const path = XENO_TRIALS_EFFECT_IMAGES_V205['acid-splash'], image = getImage(path);
  const size = fit(image, effect.radius * 2, effect.radius * 2, path);
  if (!size) return false;
  ctx.save(); ctx.globalAlpha *= Math.min(1, effect.life / .4);
  draw(ctx, image, size, effect.x - size.width / 2, floor - effect.y - size.height / 2);
  ctx.restore(); return true;
}

/** V152 residual drops move vertically at the engine's fixed fall speed; they
 * are not aimed projectiles. Keep their existing four-by-six pixel footprint. */
export function drawXenoTrialsAcidDropV205(ctx, drop, getImage, floor = 450) {
  if (![drop?.x, drop?.y, floor].every(Number.isFinite) || drop.y <= 0) return false;
  const path = XENO_TRIALS_PROJECTILE_IMAGES_V205['acid-drop'], image = getImage(path);
  const size = fit(image, 4, 6, path);
  if (!size) return false;
  draw(ctx, image, size, drop.x - size.width / 2, floor - drop.y - size.height / 2);
  return true;
}

/** Existing detonation events only. The original expanding radius and outline
 * are still painted by the caller; this image cannot introduce another blast. */
export function drawXenoTrialsDetonationV205(ctx, effect, getImage, floor = 450) {
  if (effect?.kind !== 'detonation' || !(effect.life > 0)
    || ![effect.x, effect.y, effect.radius, floor].every(Number.isFinite)) return false;
  const radius = effect.radius * Math.max(0, Math.min(1, 1 - effect.life / .4));
  if (!(radius > 0)) return false;
  const path = XENO_TRIALS_EFFECT_IMAGES_V205.detonation, image = getImage(path);
  const size = fit(image, radius * 2, radius * 2, path);
  if (!size) return false;
  ctx.save(); ctx.beginPath(); ctx.arc(effect.x, floor - effect.y, radius, 0, Math.PI * 2); ctx.clip();
  ctx.globalAlpha *= Math.min(1, effect.life / .4) * .8;
  draw(ctx, image, size, effect.x - size.width / 2, floor - effect.y - size.height / 2);
  ctx.restore(); return true;
}

/** Trials-only art. The shared V110 cone remains the fallback; the image is
 * clipped to that same collision envelope during the native active window. */
export function drawXenoTrialsFlameConeV205(ctx, fighter, body, spec, getImage, floor = 450) {
  const attack = fighter?.attack;
  if (!['special', 'super'].includes(attack?.kind) || !(attack.age >= spec?.startup && attack.age < spec.startup + spec.active)
    || ![body?.left, body?.right, body?.height, fighter.y, spec.reach, floor].every(Number.isFinite)
    || ![-1, 1].includes(attack.facing) || !(spec.reach > 0 && body.height > 0)) return false;
  const path = XENO_TRIALS_EFFECT_IMAGES_V205['synth-flame-cone'], image = getImage(path);
  const spread = 12 + spec.reach * .22, size = fit(image, spec.reach, spread * 2, path);
  if (!size) return false;
  const x = attack.facing > 0 ? body.right : body.left, y = floor - fighter.y - body.height * .55;
  ctx.save(); ctx.translate(x, y); ctx.scale(attack.facing, 1);
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(spec.reach, -spread); ctx.lineTo(spec.reach, spread); ctx.lineTo(0, 8); ctx.closePath(); ctx.clip();
  ctx.globalAlpha *= .8; draw(ctx, image, size, 0, -size.height / 2);
  ctx.restore(); return true;
}
