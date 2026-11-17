// Broodstorm's winged queen is a project identity derived from source 36.
// Its existing V56 controller still owns clips, time, events and collision.
const freeze = Object.freeze;
export const BROODSTORM_QUEEN_ART_IDS_V188 = freeze(['idle', 'chase', 'death']);
export const BROODSTORM_QUEEN_ART_V188 = freeze(Object.fromEntries([
  ['idle', 0, '9b52e84a350f6739f07338be766fddb7ca010c5f632d421aef934bf982884855'],
  ['chase', 4, '3378038c5c052193b83b5fc9e0daa6b160f1f2d03deec1b7a6ad64ebe23c1cb7'],
  ['death', 12, '660be861f23b3ad0a40c7c5a81cdcde7485f0752a98effda0e0055f77e51b350']
].map(([id, nativeStart, sha256]) => [id, freeze({
  path: `/assets/broodstorm/v188/flying-queen-${id}.png`, imageKey: `broodstorm-queen-${id}-v188`,
  width: 1254, height: 1254, sourceFacing: 1, nativeStart, sha256
})])));
export const BROODSTORM_QUEEN_PLACEMENT_V188 = freeze({
  // CHASE0: crest y151, hip y384, near-foot bottom y561. The body, not
  // the changing wings/tail envelope, establishes the initial world stature.
  referenceBodyHeight: 410, hipFraction: freeze([.5, 233 / 410]),
  sourceBodyRatio: freeze({ idle: .84, chase: 1, death: .89 }),
  // Union of the twelve alpha>=32 silhouettes after family registration.
  // Fixed in CHASE units so the bar never follows the beating wing or a clip.
  healthBarTopFromHipInChasePixels: -372, healthBarGap: 10,
  visualBoundsPadding: 16
});
// Anatomical registration reviewed 2026-11-17. CHASE relative translation is
// corroborated by local patches; IDLE and DEATH use the same hip datum with
// respectively ±4..6 and ±5..8 source-pixel uncertainty. DEATH is articulated:
// its last pose is a manual/rotational estimate, not pixel-exact registration.
// Family scale comes from stable body patches (IDLE .84, DEATH .89 of CHASE),
// never from wing bounds and never fitted anew for an individual pose.
const hips = {
  idle: [[381,352],[368,352],[380,349],[369,345]],
  chase: [[410,384],[379,384],[411,356],[382,357]],
  death: [[367,376],[340,377],[350.5,341.5],[323.5,347.5]]
};
export const BROODSTORM_QUEEN_ART_FRAMES_V188 = freeze(Object.fromEntries(BROODSTORM_QUEEN_ART_IDS_V188.map(id => [id,
  freeze(hips[id].map((hip,index) => freeze({
    rect: freeze([index % 2 * 627, Math.floor(index / 2) * 627, 627, 627]), hip: freeze(hip),
    nativeFrame: BROODSTORM_QUEEN_ART_V188[id].nativeStart + index,
    referenceHeight: BROODSTORM_QUEEN_PLACEMENT_V188.referenceBodyHeight * BROODSTORM_QUEEN_PLACEMENT_V188.sourceBodyRatio[id]
  })))])));
const loading = new WeakMap();

function ownsSource(image, id) {
  const source = image?.currentSrc || image?.src, entry = BROODSTORM_QUEEN_ART_V188[id];
  if (!entry || typeof source !== 'string' || source.includes('\\')) return false;
  try {
    const origin = globalThis.location?.origin;
    const url = new URL(source, origin && origin !== 'null' ? `${origin}/` : 'https://broodstorm.invalid/');
    return ['http:', 'https:'].includes(url.protocol) && !url.search && !url.hash && !url.username && !url.password
      && (!origin || origin === 'null' || url.origin === origin) && url.pathname === entry.path;
  } catch { return false; }
}
export function broodstormQueenSourceReadyV188(image, id) {
  const entry = BROODSTORM_QUEEN_ART_V188[id], frames = BROODSTORM_QUEEN_ART_FRAMES_V188[id];
  if (!entry || !frames || frames.length !== 4 || !image?.complete || image.naturalWidth !== entry.width
    || image.naturalHeight !== entry.height || !ownsSource(image, id)) return false;
  return frames.every(({rect, hip, referenceHeight}) => {
    if (![...rect, ...hip, referenceHeight].every(Number.isFinite)) return false;
    const [x,y,w,h] = rect;
    return x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= entry.width && y + h <= entry.height
      && hip[0] >= 0 && hip[0] <= w && hip[1] >= 0 && hip[1] <= h && referenceHeight > 0;
  });
}
export function broodstormQueenArtReadyV188(images) {
  return images instanceof Map && BROODSTORM_QUEEN_ART_IDS_V188.every(id =>
    broodstormQueenSourceReadyV188(images.get(BROODSTORM_QUEEN_ART_V188[id].imageKey), id));
}

/** Entry owns requests/retries. A late callback settles only its own image;
 * it cannot restart a chapter, replace a newer source or mutate an actor. */
export function preloadBroodstormQueenArtV188(images, { ImageCtor = globalThis.Image } = {}) {
  if (!(images instanceof Map) || typeof ImageCtor !== 'function') return;
  for (const id of BROODSTORM_QUEEN_ART_IDS_V188) {
    const entry = BROODSTORM_QUEEN_ART_V188[id], prior = images.get(entry.imageKey);
    if (broodstormQueenSourceReadyV188(prior, id)
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
    const loaded = () => finish(broodstormQueenSourceReadyV188(image, id) ? 'ready' : 'error'), failed = () => finish('error');
    if (image.addEventListener) { image.addEventListener('load', loaded); image.addEventListener('error', failed); }
    else { image.onload = loaded; image.onerror = failed; }
    try { image.src = entry.path; } catch { failed(); }
    if (broodstormQueenSourceReadyV188(image, id)) loaded();
  }
}

/** Membership rejects stale resume owners and the scale normalizer's detached
 * probes. There is deliberately no stage-3-only guard: death enters stage 4. */
export function isBroodstormQueenArtOwnerV188(engine, enemy) {
  return Boolean(engine?.legacyMissionV131?.kind === 'broodstorm' && enemy
    && enemy.id === 'legacy-queen-0' && enemy.legacyIdV131 === 'queen-0' && enemy.legacyRoleV131 === 'queen'
    && enemy.spriteKey === 'xenoQueenV56' && enemy.visualSheetId === 'enemy.xenomorph-queen.action.v56'
    && engine.enemies?.includes(enemy));
}
function frameFit(enemy, id, index) {
  const frame = BROODSTORM_QUEEN_ART_FRAMES_V188[id]?.[index];
  if (!frame || !enemy || ![enemy.x,enemy.y,enemy.w,enemy.h].every(Number.isFinite) || enemy.w <= 0 || enemy.h <= 0) return null;
  const [x,y] = BROODSTORM_QUEEN_PLACEMENT_V188.hipFraction;
  return {id,index,...frame,scale:enemy.h / frame.referenceHeight,
    x:enemy.x + enemy.w * x,y:enemy.y + enemy.h * y,facing:enemy.facing < 0 ? -1 : 1};
}
export function broodstormQueenFrameFitV188(enemy, sample) {
  const id = sample?.clip?.id, entry = BROODSTORM_QUEEN_ART_V188[id];
  if (sample?.sheet?.id !== 'enemy.xenomorph-queen.action.v56' || !entry || !Number.isInteger(sample.frame)
    || sample.frame < entry.nativeStart || sample.frame >= entry.nativeStart + 4) return null;
  return frameFit(enemy,id,sample.frame - entry.nativeStart);
}
/** Conservative union of the twelve complete source cells, including faint
 * edge pixels and the native reveal shadow. This affects culling only. */
export function broodstormQueenVisualBoundsV188(enemy) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const id of BROODSTORM_QUEEN_ART_IDS_V188) for (let index = 0; index < 4; index++) {
    const fit = frameFit(enemy,id,index); if (!fit) return null;
    const [,,w,h] = fit.rect, [hx,hy] = fit.hip;
    const xs = [-hx,w-hx].map(x => fit.x + x * fit.scale * fit.facing);
    left = Math.min(left,...xs); right = Math.max(right,...xs);
    top = Math.min(top,fit.y - hy * fit.scale); bottom = Math.max(bottom,fit.y + (h-hy) * fit.scale);
  }
  const padding = BROODSTORM_QUEEN_PLACEMENT_V188.visualBoundsPadding;
  return {x:left-padding,y:top-padding,w:right-left+padding*2,h:bottom-top+padding*2};
}
export function drawBroodstormQueenArtV188(ctx, images, enemy, sample) {
  if (!broodstormQueenArtReadyV188(images)) return false;
  const fit = broodstormQueenFrameFitV188(enemy,sample); if (!fit) return false;
  const [sx,sy,sw,sh] = fit.rect, image = images.get(BROODSTORM_QUEEN_ART_V188[fit.id].imageKey);
  ctx.save();
  if (!enemy.alive) ctx.globalAlpha = Math.max(.25,Math.min(1,(Number(enemy.deathClock) || 0) / 1.2));
  if (enemy.revealed > 0) { ctx.shadowColor = '#8fe7a8'; ctx.shadowBlur = 16; }
  ctx.translate(fit.x,fit.y); ctx.scale(fit.scale * fit.facing,fit.scale);
  ctx.drawImage(image,sx,sy,sw,sh,-fit.hip[0],-fit.hip[1],sw,sh);
  ctx.restore();
  // Native health presentation remains outside the mirror/scale transform.
  // Its fixed ceiling clears all reviewed wings instead of crossing them.
  if (enemy.alive && (enemy.alert || enemy.isBoss)) {
    const barY = fit.y + BROODSTORM_QUEEN_PLACEMENT_V188.healthBarTopFromHipInChasePixels
      * (enemy.h / BROODSTORM_QUEEN_PLACEMENT_V188.referenceBodyHeight) - BROODSTORM_QUEEN_PLACEMENT_V188.healthBarGap;
    ctx.fillStyle = '#2b1616'; ctx.fillRect(enemy.x,barY,enemy.w,4);
    ctx.fillStyle = enemy.isBoss ? '#d27662' : '#be5551';
    ctx.fillRect(enemy.x,barY,enemy.w * (enemy.health / enemy.maxHealth),4);
  }
  return true;
}
