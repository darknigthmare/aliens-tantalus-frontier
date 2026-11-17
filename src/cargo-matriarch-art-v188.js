// Dedicated project art for the Cargo boss. The existing queen controller owns
// clips, frame events and time; these sources only replace its sixteen pictures.
const freeze = Object.freeze;
export const CARGO_MATRIARCH_ART_IDS_V188 = freeze(['idle', 'advance', 'claw-tail', 'roar-hurt']);
export const CARGO_MATRIARCH_ART_V188 = freeze(Object.fromEntries(CARGO_MATRIARCH_ART_IDS_V188.map(id => [id, freeze({
  path: `/assets/cargo/v188/matriarch-${id}.png`, imageKey: `cargo-matriarch-${id}-v188`,
  width: 1254, height: 1254, sourceFacing: 1
})])));
// Measured RGBA sources, 2026-11-17: full 627 px cells retain the low-alpha
// margins. Bounds below use alpha >= 128 and exclusive right/bottom edges.
// The common x=350 pivot is the reference stance's centre between the soles;
// only y follows each measured supporting sole. Swinging feet keep their lift.
// One uniform factor per clip, never per picture: idle/advance use the 515 px
// reference stature; action extensions are capped by their 537/541 px maxima,
// matching the native scale rule that other poses cannot exceed idle stature.
const measuredFrames = {
  idle: { referenceHeight: 515, bounds: [[53,35,546,549],[53,34,547,549],[53,35,547,549],[53,39,546,549]] },
  advance: { referenceHeight: 515, bounds: [[61,35,590,547],[58,35,563,546],[57,35,564,547],[63,35,572,548]] },
  'claw-tail': { referenceHeight: 537, bounds: [[54,24,526,561],[14,39,611,562],[31,48,569,556],[29,22,613,556]] },
  'roar-hurt': { referenceHeight: 541, bounds: [[52,24,549,553],[51,13,536,554],[51,54,560,554],[51,45,562,553]] }
};
export const CARGO_MATRIARCH_ART_FRAMES_V188 = freeze(Object.fromEntries(CARGO_MATRIARCH_ART_IDS_V188.map(id => [id,
  freeze(measuredFrames[id].bounds.map((bounds,index) => freeze({
    rect: freeze([index % 2 * 627, Math.floor(index / 2) * 627, 627, 627]),
    foot: freeze([350,bounds[3]]), opaqueBounds: freeze(bounds), referenceHeight: measuredFrames[id].referenceHeight
  })))])));
// Visual attestation of the corrected source, not an automatic pose detector.
// The first candidate put its raised tail in cell3 and recovered in cell4.
// These reviewed pixels place forward claws at native frame9 and the complete
// forward tail strike at frame11. Tests bind real emitted markers and actual
// source windows to this review; they cannot classify anatomy from labels.
export const CARGO_MATRIARCH_ATTACK_REVIEW_V188 = freeze({
  sourcePath: '/assets/cargo/v188/matriarch-claw-tail.png',
  sourceSha256: '37ec3207b6aa4bdffd214b79f7f34b557892760b5ad54ca337067218e8fd4298',
  markers: freeze([
    freeze({ event: 'combat:claw-hit', frame: 9, sourceRect: freeze([627,0,627,627]), observedPose: 'forward-claws' }),
    freeze({ event: 'combat:tail-hit', frame: 11, sourceRect: freeze([627,627,627,627]), observedPose: 'complete-tail-arcing-forward' })
  ])
});
const loading = new WeakMap();

function ownsSource(image, id) {
  const source = image?.currentSrc || image?.src, entry = CARGO_MATRIARCH_ART_V188[id];
  if (!entry || typeof source !== 'string' || source.includes('\\')) return false;
  try {
    const origin = globalThis.location?.origin;
    const url = new URL(source, origin && origin !== 'null' ? `${origin}/` : 'https://cargo.invalid/');
    return ['http:', 'https:'].includes(url.protocol) && !url.search && !url.hash && !url.username && !url.password
      && (!origin || origin === 'null' || url.origin === origin) && url.pathname === entry.path;
  } catch { return false; }
}

/** A complete image from another path, or a partial/foreign source window,
 * cannot substitute for one of the four reviewed sheets. */
export function cargoMatriarchSourceReadyV188(image, id) {
  const entry = CARGO_MATRIARCH_ART_V188[id], frames = CARGO_MATRIARCH_ART_FRAMES_V188[id];
  if (!entry || !frames || frames.length !== 4 || !image?.complete || image.naturalWidth !== entry.width
    || image.naturalHeight !== entry.height || !ownsSource(image, id)) return false;
  return frames.every(frame => {
    const { rect, foot, referenceHeight } = frame;
    if (!Array.isArray(rect) || rect.length !== 4 || !Array.isArray(foot) || foot.length !== 2
      || ![...rect, ...foot, referenceHeight].every(Number.isFinite)) return false;
    const [x, y, w, h] = rect;
    return x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= entry.width && y + h <= entry.height
      && foot[0] >= 0 && foot[0] <= w && foot[1] > 0 && foot[1] <= h && referenceHeight > 0;
  });
}

export function cargoMatriarchArtReadyV188(images) {
  return images instanceof Map && CARGO_MATRIARCH_ART_IDS_V188.every(id => cargoMatriarchSourceReadyV188(images.get(CARGO_MATRIARCH_ART_V188[id].imageKey), id));
}

/** Cargo entry is the sole request site. Re-entry shares pending/ready images;
 * errors retry there. A callback only settles its own image, never the game. */
export function preloadCargoMatriarchArtV188(images, { ImageCtor = globalThis.Image } = {}) {
  if (!(images instanceof Map) || typeof ImageCtor !== 'function') return;
  for (const id of CARGO_MATRIARCH_ART_IDS_V188) {
    const entry = CARGO_MATRIARCH_ART_V188[id], prior = images.get(entry.imageKey);
    if (cargoMatriarchSourceReadyV188(prior, id)
      || (prior && ownsSource(prior, id) && loading.get(prior) !== 'error' && !prior.complete)) continue;
    let image;
    try { image = new ImageCtor(); } catch { continue; }
    images.set(entry.imageKey, image); loading.set(image, 'loading'); image.decoding = 'async';
    const finish = state => {
      if (loading.get(image) !== 'loading') return;
      loading.set(image, state);
      image.removeEventListener?.('load', loaded); image.removeEventListener?.('error', failed);
      if (!image.addEventListener) { image.onload = null; image.onerror = null; }
    };
    const loaded = () => finish(cargoMatriarchSourceReadyV188(image, id) ? 'ready' : 'error'), failed = () => finish('error');
    if (image.addEventListener) { image.addEventListener('load', loaded); image.addEventListener('error', failed); }
    else { image.onload = loaded; image.onerror = failed; }
    try { image.src = entry.path; } catch { failed(); }
    if (cargoMatriarchSourceReadyV188(image, id)) loaded();
  }
}

export function cargoMatriarchFrameFitV188(enemy, sample) {
  if (sample?.sheet?.id !== 'enemy.xenomorph-queen.combat' || !Number.isInteger(sample.frame)
    || sample.frame < 0 || sample.frame >= 16 || !enemy || ![enemy.x, enemy.y, enemy.w, enemy.h].every(Number.isFinite)
    || enemy.w <= 0 || enemy.h <= 0) return null;
  const id = CARGO_MATRIARCH_ART_IDS_V188[Math.floor(sample.frame / 4)], index = sample.frame % 4;
  if (sample.clip?.id !== id) return null;
  const frame = CARGO_MATRIARCH_ART_FRAMES_V188[id]?.[index];
  if (!frame) return null;
  // CreatureScale supplies a virtual body under its uniform outer transform.
  // Using its height here preserves the real body/feet without stretching art
  // to the collision AABB, including the uncatalogued emergency Cargo actor.
  return { id, index, ...frame, scale: enemy.h / frame.referenceHeight,
    x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h, facing: (enemy.facing < 0 ? -1 : 1) * CARGO_MATRIARCH_ART_V188[id].sourceFacing };
}

export function drawCargoMatriarchArtV188(ctx, images, enemy, sample) {
  if (!cargoMatriarchArtReadyV188(images)) return false;
  const fit = cargoMatriarchFrameFitV188(enemy, sample);
  if (!fit) return false;
  const [sx, sy, sw, sh] = fit.rect, image = images.get(CARGO_MATRIARCH_ART_V188[fit.id].imageKey);
  ctx.save();
  if (!enemy.alive) ctx.globalAlpha = Math.max(.25, Math.min(1, (Number(enemy.deathClock) || 0) / 1.2));
  if (enemy.revealed > 0) { ctx.shadowColor = '#8fe7a8'; ctx.shadowBlur = 16; }
  ctx.translate(fit.x, fit.y); ctx.scale(fit.scale * fit.facing, fit.scale);
  ctx.drawImage(image, sx, sy, sw, sh, -fit.foot[0], -fit.foot[1], sw, sh);
  ctx.restore();
  // Identical to the historical animated renderer, outside the sprite mirror.
  if (enemy.alive && (enemy.alert || enemy.isBoss)) {
    ctx.fillStyle = '#2b1616'; ctx.fillRect(enemy.x, enemy.y - 10, enemy.w, 4);
    ctx.fillStyle = enemy.isBoss ? '#d27662' : '#be5551';
    ctx.fillRect(enemy.x, enemy.y - 10, enemy.w * (enemy.health / enemy.maxHealth), 4);
  }
  return true;
}
