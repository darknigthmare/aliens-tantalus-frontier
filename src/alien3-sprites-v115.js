/** Measured raster contracts for Fiorina. Presentation only; no actor physics. */
export const ALIEN3_SPRITE_DIRECTORY_V115 = 'assets/openai/sprites/alien3-fiorina-v115/';
export const ALIEN3_SPRITE_MANIFEST_URL_V115 = new URL('../' + ALIEN3_SPRITE_DIRECTORY_V115 + 'manifest.json', import.meta.url).href;

const finite = (n) => typeof n === 'number' && Number.isFinite(n);
const positive = (n) => finite(n) && n > 0;
const rectValid = (r) => r && [r.x, r.y, r.w, r.h].every(Number.isInteger)
  && r.x >= 0 && r.y >= 0 && r.w > 0 && r.h > 0;
const pivotValid = (p, r) => p && finite(p.x) && finite(p.y)
  && p.x >= 0 && p.y >= 0 && p.x <= r.w && p.y <= r.h;
const localAsset = (src) => typeof src === 'string'
  && /^assets\/openai\/sprites\/alien3-fiorina-v115\/[a-z0-9][a-z0-9._/-]*\.(png|webp)$/.test(src)
  && !src.includes('..') && !src.includes('//');

/** Pixel pivots are relative to each source frame, never normalized fractions. */
export function validateAlien3SpriteManifestV115(raw) {
  const errors = [];
  if (!raw || raw.schemaVersion !== 1 || !raw.assets || typeof raw.assets !== 'object' || Array.isArray(raw.assets)) {
    return { ok: false, errors: ['manifest-schema'], manifest: null };
  }
  const assets = Object.create(null);
  const entries = Object.entries(raw.assets);
  if (!entries.length || entries.length > 512) errors.push('asset-count');
  for (const [id, entry] of entries) {
    const fail = (reason) => errors.push(id + ':' + reason);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !entry || typeof entry !== 'object') { fail('entry'); continue; }
    if (!localAsset(entry.src)) fail('asset-path');
    if (!rectValid(entry.frame)) { fail('frame'); continue; }
    if (!pivotValid(entry.pivot, entry.frame)) fail('pivot');
    if (!entry.world || !positive(entry.world.w) || !positive(entry.world.h)
      || entry.world.w > 2048 || entry.world.h > 2048) fail('world-size');
    if (!['left', 'right'].includes(entry.facing)) fail('facing');
    if (entry.fps !== undefined && (!positive(entry.fps) || entry.fps > 60)) fail('fps');
    if (entry.frames !== undefined && (!Array.isArray(entry.frames) || !entry.frames.length || entry.frames.length > 120)) { fail('frames'); continue; }
    if ((entry.frames || [entry.frame]).some((r) => !rectValid(r))) { fail('frame-bounds'); continue; }
    const frames = (entry.frames || [entry.frame]).map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h,
      src: r.src || entry.src, pivot: r.pivot || entry.pivot, world: r.world || entry.world }));
    if (frames.some((r) => !pivotValid(r.pivot, r) || !localAsset(r.src)
      || !r.world || !positive(r.world.w) || !positive(r.world.h) || r.world.w > 2048 || r.world.h > 2048)) fail('frame-bounds');
    if (frames.length > 1 && !positive(entry.fps)) fail('animation-fps');
    assets[id] = { ...entry, id, frame: { ...entry.frame }, pivot: { ...entry.pivot },
      world: { ...entry.world }, frames, fps: entry.fps || 1, loop: entry.loop !== false };
  }
  return { ok: !errors.length, errors, manifest: errors.length ? null : { schemaVersion: 1, assets } };
}

/**
 * Each bank owns its decoded images. Runtime requests only visible poses;
 * preloadAll is reserved for tools that inspect the complete delivered pack.
 */
export function createAlien3SpriteBankV115(raw, {
  imageFactory = () => new globalThis.Image(), baseURL = new URL('../', import.meta.url).href,
  loadTimeoutMs = 45000, maxConcurrentImages = 4, preloadAll = false,
  maxCachedImages = 12, maxDecodedBytes = 80 * 1024 * 1024
} = {}) {
  const valid = validateAlien3SpriteManifestV115(raw);
  const records = new Map(), images = new Map(), jobs = new Set(), queue = [];
  const concurrency = Math.max(1, Math.min(8, Math.floor(maxConcurrentImages) || 4));
  const cacheLimit = Math.max(1, Math.min(120, Math.floor(maxCachedImages) || 12));
  const byteLimit = positive(maxDecodedBytes) ? maxDecodedBytes : 80 * 1024 * 1024;
  let activeLoads = 0, clock = 0, disposed = false, evictions = 0;
  const imageBytes = (row) => row.state === 'ready' ? row.width * row.height * 4 : 0;
  const releaseImage = (row) => {
    row.cancel?.();
    if (row.image) {
      row.image.onload = null; row.image.onerror = null;
      try { if (typeof row.image.close === 'function') row.image.close(); else row.image.src = ''; } catch { /* A host double may reject an empty URL. */ }
    }
    row.image = null;
  };
  const invalidate = (src) => {
    for (const row of records.values()) if (row.sources.includes(src) && row.state === 'ready') {
      row.state = 'unrequested'; row.reason = 'cache-evicted'; row.image = null; row.frameImages = [];
    }
  };
  const prune = (protectedSources = []) => {
    if (preloadAll || disposed) return;
    let resident = [...images.values()].filter((row) => row.state === 'ready');
    let bytes = resident.reduce((sum, row) => sum + imageBytes(row), 0);
    const protectedSet = new Set(protectedSources);
    const candidates = resident.filter((row) => !row.pins && !protectedSet.has(row.src)).sort((a, b) => a.lastUse - b.lastUse);
    while ((resident.length > cacheLimit || bytes > byteLimit) && candidates.length) {
      const old = candidates.shift();
      // Keep a single oversized drawable usable rather than reloading it every frame.
      if (resident.length === 1) break;
      bytes -= imageBytes(old); resident = resident.filter((row) => row !== old);
      images.delete(old.src); invalidate(old.src); releaseImage(old);
      old.state = 'evicted'; evictions++;
    }
  };
  const pump = () => {
    while (!disposed && activeLoads < concurrency && queue.length) {
      const decoded = queue.shift();
      if (decoded.state !== 'queued') continue;
      activeLoads++;
      decoded.state = 'loading';
      let timer = null, settled = false;
      const finish = (reason = null) => {
        if (settled) return;
        settled = true;
        if (timer !== null) clearTimeout(timer);
        decoded.cancel = null;
        decoded.reason = reason;
        decoded.state = reason ? 'error' : 'ready';
        decoded.lastUse = ++clock;
        if (decoded.image) { decoded.image.onload = null; decoded.image.onerror = null; }
        if (reason) releaseImage(decoded);
        decoded.resolve(decoded);
        activeLoads--;
        pump();
      };
      decoded.cancel = () => finish('bank-disposed');
      try {
        const image = imageFactory(); decoded.image = image;
        image.onload = () => {
          decoded.width = Number(image.naturalWidth || image.width);
          decoded.height = Number(image.naturalHeight || image.height);
          if (!positive(decoded.width) || !positive(decoded.height)) return finish('empty-image');
          finish();
        };
        image.onerror = () => finish('image-load');
        if (positive(loadTimeoutMs)) timer = setTimeout(() => finish('image-timeout'), Math.min(loadTimeoutMs, 60000));
        image.src = new URL(decoded.src, baseURL).href;
      } catch { finish('image-unavailable'); }
    }
  };
  const loadImage = (src) => {
    let decoded = images.get(src);
    if (decoded) { decoded.lastUse = ++clock; return decoded; }
    decoded = { src, state: 'queued', reason: null, image: null, width: 0, height: 0, pins: 0, lastUse: ++clock, cancel: null };
    decoded.promise = new Promise((resolve) => { decoded.resolve = resolve; });
    images.set(src, decoded); queue.push(decoded);
    return decoded;
  };
  const request = (id) => {
    const row = records.get(id);
    if (!row || disposed) return Promise.resolve(null);
    if (row.state === 'ready') {
      for (const src of row.sources) { const image = images.get(src); if (image) image.lastUse = ++clock; }
      return Promise.resolve(row);
    }
    if (row.state === 'error') return Promise.resolve(row); // A failure never restarts every render frame.
    if (row.pending) return row.pending;
    row.state = 'loading'; row.reason = null;
    const decoded = row.sources.map(loadImage);
    for (const image of decoded) image.pins++;
    const job = Promise.all(decoded.map((image) => image.promise)).then(() => {
      if (disposed) return null;
      const lookup = new Map(decoded.map((image) => [image.src, image]));
      const failed = decoded.find((image) => image.state !== 'ready');
      const fits = (frame) => {
        const image = lookup.get(frame.src || row.entry.src);
        return image && frame.x + frame.w <= image.width && frame.y + frame.h <= image.height;
      };
      row.reason = failed?.reason || (!fits(row.entry.frame) || row.entry.frames.some((frame) => !fits(frame)) ? 'image-frame-bounds' : null);
      row.state = row.reason ? 'error' : 'ready';
      if (row.state === 'ready') {
        const first = lookup.get(row.entry.frames[0].src);
        row.image = first.image; row.width = first.width; row.height = first.height;
        row.frameImages = row.entry.frames.map((frame) => lookup.get(frame.src).image);
        for (const image of decoded) image.lastUse = ++clock;
      }
      return row;
    }).finally(() => {
      for (const image of decoded) image.pins = Math.max(0, image.pins - 1);
      row.pending = null; jobs.delete(job); prune(row.state === 'ready' ? row.sources : []);
    });
    row.pending = job; jobs.add(job); pump();
    return job;
  };
  for (const entry of Object.values(valid.manifest?.assets || {})) {
    records.set(entry.id, { entry, state: 'unrequested', reason: null, image: null, frameImages: [], width: 0, height: 0,
      sources: [...new Set([entry.src, ...entry.frames.map((frame) => frame.src)])], pending: null });
  }
  const bank = {
    manifest: valid.manifest,
    get(id) { const row = records.get(id); request(id); return !disposed && row?.state === 'ready' ? row : null; },
    request,
    preload(ids = []) { return Promise.all([...new Set(ids)].map(request)).then(() => bank); },
    get ready() { return Promise.all([...jobs]).then(() => bank); },
    status(id) {
      const row = records.get(id);
      return row ? { state: row.state, reason: row.reason, width: row.width || 0, height: row.height || 0 }
        : { state: 'missing', reason: valid.ok ? 'asset-not-listed' : 'invalid-manifest', width: 0, height: 0 };
    },
    report() {
      const rows = [...records.values()], resident = [...images.values()].filter((row) => row.state === 'ready');
      return { total: rows.length, ready: rows.filter((row) => row.state === 'ready').length,
        loading: rows.filter((row) => row.state === 'loading').length,
        unrequested: rows.filter((row) => row.state === 'unrequested').length,
        errors: [...valid.errors, ...rows.filter((row) => row.state === 'error').map((row) => row.entry.id + ':' + row.reason)],
        disposed, preloadAll, cachedImages: resident.length,
        estimatedRgbaBytes: resident.reduce((sum, row) => sum + imageBytes(row), 0),
        activeImageLoads: activeLoads, queuedImageLoads: queue.filter((row) => row.state === 'queued').length,
        cacheEvictions: evictions, maxCachedImages: cacheLimit, maxDecodedBytes: byteLimit };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const image of images.values()) {
        if (image.state === 'queued') { image.state = 'error'; image.reason = 'bank-disposed'; image.resolve(image); }
        releaseImage(image);
      }
      queue.length = 0; images.clear();
      for (const row of records.values()) { row.state = 'disposed'; row.reason = 'bank-disposed'; row.image = null; row.frameImages = []; }
    }
  };
  if (preloadAll) bank.preload([...records.keys()]);
  return bank;
}

let cachedManifest = null;
/** Share immutable metadata only. Each game instance owns a disposable image bank. */
export async function loadAlien3SpriteBankV115(options = {}) {
  if (typeof globalThis.fetch !== 'function' || typeof globalThis.Image !== 'function') return null;
  if (!cachedManifest) cachedManifest = (async () => {
    try {
      const response = await globalThis.fetch(ALIEN3_SPRITE_MANIFEST_URL_V115, { credentials: 'same-origin' });
      return response.ok ? await response.json() : null;
    } catch { return null; }
  })();
  const manifest = await cachedManifest;
  if (!manifest) { cachedManifest = null; return null; }
  return createAlien3SpriteBankV115(manifest, options);
}

const moving = (actor) => !!actor?.moving || Math.abs(actor?.vx || 0) > 2;
export function alien3SpritePoseV115(actor = {}) {
  // A fatal hit can leave its hurt flash active after the actor is downed.
  // Incapacity must keep its own presentation even if the mission stops ticking.
  if (actor.downed) return 'downed';
  if ((actor.v52HurtClock || 0) > 0 || (actor.shockClock || 0) > 0) return 'hurt';
  if (actor.climbing) return 'climb';
  // Ground contact, not vertical speed, decides whether a pose is airborne.
  // At a jump apex vy can be zero while both feet still lack support.
  if (actor.grounded === false) return 'jump';
  if (actor.crouching) return moving(actor) ? 'crouch-walk' : 'crouch';
  if (moving(actor)) return Math.abs(actor.vx || 0) > 230 ? 'run' : 'walk';
  if ((actor.interactionClock || 0) > 0) return 'interact';
  return 'idle';
}

export function selectAlien3HumanSpriteV115(actorId, actor, { phase = '', encounter = null, operationActive = false } = {}) {
  let pose = alien3SpritePoseV115(actor);
  // V107 owns sustained operations. Presentation reads that state without
  // inventing an actor timer or outranking damage, air, crouch or locomotion.
  if (actorId === 'ripley' && operationActive === true && pose === 'idle') pose = 'interact';
  let family = actorId;
  if (actorId === 'ripley') {
    const outfit = !encounter && ['wreckage', 'arrival', 'crash'].includes(phase) ? 'crash'
      : !encounter && ['shore', 'coast'].includes(phase) ? 'coat' : 'prison';
    family = 'ripley-' + outfit;
  }
  return { id: family + '-' + pose, pose, requireAnimation: ['walk', 'run', 'crouch-walk', 'climb'].includes(pose) };
}

export function selectAlien3RunnerSpriteV115(actor, pursuit = {}) {
  const pose = pursuit?.mode === 'windup' ? 'windup' : pursuit?.mode === 'recover' ? 'recover'
    : moving(actor) ? (Math.abs(actor.vx || 0) > 230 ? 'run' : 'walk') : 'prowl';
  return { id: 'runner-' + pose, pose, requireAnimation: ['walk', 'run'].includes(pose) };
}

/** x/y are the world contact point. Render-only transforms leave collision intact. */
export function drawAlien3SpriteV115(context, bank, id, {
  x, y, depthScale = 1, facing = 1, time = 0, reducedMotion = false, requireAnimation = false
} = {}) {
  const row = bank?.get?.(id);
  const receipt = { drawn: false, id, reason: 'asset-unavailable', frameIndex: null };
  if (!row) return receipt;
  const entry = row.entry;
  const distinctFrames = new Set(entry.frames.map((frame) => `${frame.src}:${frame.x},${frame.y},${frame.w},${frame.h}`)).size;
  if (requireAnimation && distinctFrames < 2) return { ...receipt, reason: 'animation-unavailable' };
  if (![x, y, depthScale].every(finite) || depthScale <= 0
    || !['drawImage', 'save', 'restore', 'translate', 'scale'].every((method) => typeof context?.[method] === 'function')) return { ...receipt, reason: 'render-contract' };
  const tick = reducedMotion ? 0 : Math.max(0, Math.floor((finite(time) ? time : 0) * entry.fps));
  const frameIndex = entry.loop ? tick % entry.frames.length : Math.min(entry.frames.length - 1, tick);
  const frame = entry.frames[frameIndex];
  const world = frame.world;
  const dx = -frame.pivot.x * world.w / frame.w, dy = -frame.pivot.y * world.h / frame.h;
  const direction = facing < 0 ? -1 : 1;
  const mirror = entry.facing === 'left' ? -direction : direction;
  context.save();
  try {
    context.translate(x, y);
    context.scale(mirror * depthScale, depthScale);
    context.drawImage(row.frameImages[frameIndex], frame.x, frame.y, frame.w, frame.h, dx, dy, world.w, world.h);
    return { drawn: true, id, reason: null, frameIndex, x, y, mirror, depthScale,
      destination: { x: dx, y: dy, w: world.w, h: world.h } };
  } catch { return { ...receipt, reason: 'draw-image' }; }
  finally { context.restore(); }
}
