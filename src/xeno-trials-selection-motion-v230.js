import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsPhysicalScaleV119 } from './xeno-trials-physical-scale-v119.js';
import { getXenoTrialsRecruitV230 } from './xeno-trials-recruits-v230.js';
import { drawXenoTrialsRigV154, getXenoTrialsRigV154, getXenoTrialsRuntimeArticulatedRig,
  getXenoTrialsRuntimeDefenseRig, sampleXenoTrialsSequenceAnglesV211 } from './xeno-trials-rig-v154.js';

export const XENO_TRIALS_SELECTION_MS_V230 = 420;
const smooth = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
const finite = values => values.every(Number.isFinite);
const admittedPath = path => typeof path === 'string' && path.startsWith('/assets/') && !path.includes('..');
const validBounds = (bounds, width, height) => Array.isArray(bounds) && bounds.length === 4
  && finite(bounds) && bounds[0] >= 0 && bounds[1] >= 0 && bounds[2] <= width && bounds[3] <= height
  && bounds[0] < bounds[2] && bounds[1] < bounds[3];

export function getXenoTrialsSelectionVisualV230(id, requestedVariant, facing = 1) {
  const actor = getXenoTrialsFighterV96(id);
  if (!actor) return null;
  const variant = actor.variants.includes(requestedVariant) ? requestedVariant : actor.variants[0] || null;
  const art = getXenoTrialsArtV96(id, variant);
  const scale = getXenoTrialsPhysicalScaleV119(id, variant);
  if (!art || !scale || !admittedPath(art.path) || !validBounds(scale.alphaBounds, art.sourceWidth, art.sourceHeight)) return null;
  const rig = getXenoTrialsRuntimeArticulatedRig(actor, art) || getXenoTrialsRuntimeDefenseRig(actor, art)
    || getXenoTrialsRigV154(actor, art);
  const source = art.sourceRectV209 || [0, 0, art.sourceWidth, art.sourceHeight];
  const sheet = art.sourceRectV209 && getXenoTrialsRecruitV230(id)?.preview;
  return { id, variant, facing: facing === -1 ? -1 : 1, profileId: actor.profileId, key: id + ':' + (variant || '') + ':' + facing,
    path: art.path, source, width: art.sourceWidth, height: art.sourceHeight, atlasCrop: Boolean(art.sourceRectV209),
    textureWidth: sheet?.width || art.sourceWidth, textureHeight: sheet?.height || art.sourceHeight,
    sourceFacing: art.sourceFacing, bounds: scale.alphaBounds, rootX: scale.pivotX * art.sourceWidth,
    rootY: scale.alphaBounds[3],
    rig, sourceSha256: art.sha256 || rig?.sourceSha256 || null };
}

export function admitXenoTrialsSelectionPlateV230(base, plate) {
  if (!base || !plate || plate.kind !== 'select' || !admittedPath(plate.path) || plate.fighterId !== base.id
    || (plate.profileId && plate.profileId !== base.profileId) || (plate.variant ?? null) !== base.variant
    || !Number.isInteger(plate.sourceWidth) || !Number.isInteger(plate.sourceHeight)
    || !validBounds(plate.alphaBounds, plate.sourceWidth, plate.sourceHeight)
    || !Number.isFinite(plate.rootX) || plate.rootX < plate.alphaBounds[0] || plate.rootX > plate.alphaBounds[2]
    || !Number.isFinite(plate.rootY) || plate.rootY < plate.alphaBounds[1] || plate.rootY > plate.alphaBounds[3]
    || ![-1, 1].includes(plate.sourceFacing)) return null;
  const { path, sourceWidth: width, sourceHeight: height, sourceFacing, alphaBounds: bounds, rootX, rootY } = plate;
  return { ...base, path, width, height, sourceFacing, bounds, rootX, rootY, source: [0, 0, width, height],
    textureWidth: width, textureHeight: height, sourceSha256: plate.sha256 || null, atlasCrop: false, rig: null, authoredPlate: true };
}

export function getXenoTrialsSelectionSampleV230(phase, elapsed, reducedMotion = false) {
  const progress = reducedMotion ? 1 : smooth(elapsed / XENO_TRIALS_SELECTION_MS_V230);
  const exiting = phase === 'exit';
  return exiting
    ? { opacity: 1 - progress, slide: progress, gesture: -progress }
    : { opacity: progress, slide: progress - 1, gesture: 1 - progress };
}

// Only the upper structure participates. Support joints and their parents
// retain the admitted frame, including forefeet on low or quadruped bodies.
function previewRigPose(visual, sample) {
  const rig = visual.rig;
  if (!rig) return null;
  const weights = rig.poses.intro || rig.poses.recover || rig.poses.guard;
  if (!weights || sample.gesture === 0) return null;
  const supports = [...new Set([...(rig.supportContactsV165 || []), ...Object.keys(rig.contacts).filter(key =>
    /foot|sole|heel|ankle|pad|base/i.test(key))])].filter(key => rig.contacts[key]);
  const fixed = new Set(['hips']);
  for (const name of supports) {
    let bone = rig.contacts[name].bone;
    while (bone && !fixed.has(bone)) {
      fixed.add(bone);
      bone = rig.bones.find(candidate => candidate.id === bone)?.parent;
    }
  }
  const angles = Object.fromEntries(Object.entries(weights).filter(([id]) => !fixed.has(id)).map(([id, angle]) =>
    [id, Math.max(-8, Math.min(8, angle * sample.gesture))]));
  const frame = sampleXenoTrialsSequenceAnglesV211(rig, { clip: 'menu-selection', elapsed: 0, progress: 1 }, angles);
  if (!frame?.active || supports.some(name => Math.hypot(frame.contacts[name][0] - rig.contacts[name].point[0],
    frame.contacts[name][1] - rig.contacts[name].point[1]) > 2)) return null;
  return frame;
}

function checkImage(visual, image) {
  const width = image?.naturalWidth, height = image?.naturalHeight;
  if (width !== visual.textureWidth || height !== visual.textureHeight) return false;
  if (!visual.atlasCrop) return width === visual.width && height === visual.height;
  const [x, y, w, h] = visual.source;
  return finite([x, y, w, h]) && x >= 0 && y >= 0 && w === visual.width && h === visual.height
    && x + w <= width && y + h <= height;
}

export function drawXenoTrialsSelectionVisualV230(context, visual, image, viewport, sample) {
  if (!context || !checkImage(visual, image) || sample.opacity <= 0) return null;
  const [left, top, right, bottom] = visual.bounds;
  const { width, height } = viewport;
  if (!finite([width, height]) || width <= 0 || height <= 0) return null;
  const scale = Math.min(width * .88 / (right - left + .20 * (bottom - top)), height * .82 / (bottom - top));
  const flip = visual.facing * visual.sourceFacing;
  const x = width / 2 - ((left + right) / 2 - visual.rootX) * scale * flip;
  const y = Math.round(height * .92);
  const metrics = { width: visual.width * scale, height: visual.height * scale,
    pivotX: visual.rootX / visual.width, bottom: visual.rootY / visual.height };
  const plateX = x + visual.facing * Math.min(width * .035, 11) * sample.slide;
  const pose = previewRigPose(visual, sample);
  context.save();
  try {
    context.globalAlpha *= sample.opacity;
    const rig = pose && drawXenoTrialsRigV154(context, visual.rig, image, pose, metrics, x, y, visual.facing);
    if (!rig) {
      context.translate(plateX, y);
      context.scale(flip, 1);
      context.drawImage(image, ...visual.source, -visual.rootX * scale, -visual.rootY * scale, metrics.width, metrics.height);
    }
    return { id: visual.id, variant: visual.variant, profileId: visual.profileId, path: visual.path,
      sha256: visual.sourceSha256, mode: rig ? 'rig' : visual.authoredPlate ? 'drawn-plate' : visual.atlasCrop ? 'atlas-crop' : 'image',
      support: [rig ? x : plateX, y], canonExact: false };
  } finally {
    context.restore();
  }
}

function loadBrowserImage(view, path, signal) {
  return new Promise((resolve, reject) => {
    const image = new view.Image();
    const reset = () => {
      image.onload = image.onerror = null;
      signal.removeEventListener('abort', cancel);
    };
    const cancel = () => { reset(); image.removeAttribute('src'); reject(new Error('Preview cancelled')); };
    image.onload = () => { reset(); resolve(image); };
    image.onerror = () => { reset(); reject(new Error('Preview image unavailable')); };
    signal.addEventListener('abort', cancel, { once: true });
    image.src = path;
  });
}

/** The owner remembers at most two plates per visible slot. Replaced DOM
 * windows can reattach a canvas without restarting the selected image. */
export function createXenoTrialsSelectionMotionV230({ document, getReducedMotion = () => false,
  getPlate = () => null, loadImage } = {}) {
  const view = document?.defaultView;
  if (!view?.requestAnimationFrame || !view.cancelAnimationFrame || !document.createElement)
    return { sync() {}, stop() {}, snapshot: () => [] };
  const slots = new Map();
  const cache = new Map();
  const media = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reduced = () => getReducedMotion() === true || media?.matches === true
    || document.documentElement?.classList?.contains('reduced-motion');
  const loader = loadImage || ((path, signal) => loadBrowserImage(view, path, signal));
  let pending = null;
  let previousTime = null;
  let listening = false;
  const resize = view.ResizeObserver ? new view.ResizeObserver(() => schedule()) : null;

  function schedule() {
    if (pending !== null || document.hidden || !slots.size) return;
    pending = view.requestAnimationFrame(frame);
  }
  function clearFrame() {
    if (pending !== null) view.cancelAnimationFrame(pending);
    pending = null;
    previousTime = null;
  }
  function showFallback(entry) {
    entry.canvas.hidden = true;
    if (entry.fallback) entry.fallback.style.visibility = '';
    entry.receipt = null;
    for (const attribute of ['xtSelectionPhase', 'xtSelectionIncoming', 'xtSelectionOutgoing', 'xtSelectionMode'])
      delete entry.canvas.dataset[attribute];
  }
  function frame(timestamp) {
    pending = null;
    if (document.hidden) { previousTime = null; return; }
    const elapsed = previousTime === null ? 0 : Math.min(timestamp - previousTime, 32);
    previousTime = timestamp;
    let moving = false;
    for (const entry of slots.values()) {
      if (!entry.host.isConnected) {
        remove(entry.slot);
        continue;
      }
      if (!entry.current) continue;
      const width = Math.min(900, entry.host.clientWidth), height = Math.min(420, entry.host.clientHeight);
      if (!width || !height) { showFallback(entry); continue; }
      if (entry.canvas.width !== width) entry.canvas.width = width;
      if (entry.canvas.height !== height) entry.canvas.height = height;
      if (reduced()) {
        entry.elapsed = XENO_TRIALS_SELECTION_MS_V230;
        entry.outgoing = null;
      } else entry.elapsed += elapsed;
      const still = entry.elapsed >= XENO_TRIALS_SELECTION_MS_V230;
      entry.context.clearRect(0, 0, width, height);
      try {
        const viewport = { width, height };
        const outgoing = !still && entry.outgoing && drawXenoTrialsSelectionVisualV230(entry.context,
          entry.outgoing.visual, entry.outgoing.image, viewport, getXenoTrialsSelectionSampleV230('exit', entry.elapsed));
        const incoming = drawXenoTrialsSelectionVisualV230(entry.context, entry.current.visual, entry.current.image,
          viewport, getXenoTrialsSelectionSampleV230('select', entry.elapsed, reduced()));
        entry.receipt = { slot: entry.slot, phase: still ? 'ready' : 'select', incoming, outgoing: outgoing || null };
        entry.canvas.dataset.xtSelectionPhase = entry.receipt.phase;
        entry.canvas.dataset.xtSelectionIncoming = incoming?.id || '';
        entry.canvas.dataset.xtSelectionOutgoing = outgoing?.id || '';
        entry.canvas.dataset.xtSelectionMode = incoming?.mode || '';
        entry.canvas.hidden = !incoming && !outgoing;
        if (entry.fallback) entry.fallback.style.visibility = entry.canvas.hidden ? '' : 'hidden';
      } catch {
        entry.elapsed = XENO_TRIALS_SELECTION_MS_V230;
        entry.outgoing = null;
        showFallback(entry);
      }
      if (still) entry.outgoing = null;
      else moving ||= entry.elapsed < XENO_TRIALS_SELECTION_MS_V230;
    }
    if (moving) schedule();
    else previousTime = null;
  }

  function visibility() {
    if (document.hidden) clearFrame();
    else schedule();
  }
  function setListening(active) {
    if (listening === active) return;
    listening = active;
    const method = active ? 'addEventListener' : 'removeEventListener';
    document[method]?.('visibilitychange', visibility);
    media?.[method]?.('change', schedule);
  }
  function remove(slot) {
    const entry = slots.get(slot);
    if (!entry) return;
    entry.abort?.abort();
    resize?.unobserve(entry.host);
    showFallback(entry);
    entry.canvas.remove();
    slots.delete(slot);
    if (!slots.size) {
      setListening(false);
      clearFrame();
    }
  }

  async function choose(entry, source) {
    entry.abort?.abort();
    entry.outgoing = reduced() ? null : entry.current || entry.outgoing;
    entry.current = null;
    entry.elapsed = 0;
    entry.source = source;
    const abort = new AbortController();
    entry.abort = abort;
    if (!entry.outgoing || entry.canvas.hidden) showFallback(entry);
    else if (entry.fallback) entry.fallback.style.visibility = 'hidden';
    const plate = reduced() ? null : admitXenoTrialsSelectionPlateV230(source, getPlate('select', source.id, source.variant));
    for (const visual of plate ? [plate, source] : [source]) {
      try {
        const image = cache.get(visual.path) || await loader(visual.path, abort.signal);
        if (abort.signal.aborted) return;
        if (!checkImage(visual, image)) continue;
        cache.delete(visual.path);
        cache.set(visual.path, image);
        while (cache.size > 8) cache.delete(cache.keys().next().value);
        entry.current = { visual, image };
        schedule();
        return;
      } catch {
        if (abort.signal.aborted) return;
      }
    }
    entry.outgoing = null;
    showFallback(entry);
  }
  function sync(requests = []) {
    const visible = new Map(requests.filter(item => item.host?.isConnected).map(item => [item.slot, item]));
    for (const slot of slots.keys()) if (!visible.has(slot)) remove(slot);
    for (const request of visible.values()) {
      const { slot, host, fallback, id, variant, facing } = request;
      const source = getXenoTrialsSelectionVisualV230(id, variant, facing);
      if (!source) { remove(slot); continue; }
      let entry = slots.get(slot);
      if (!entry) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        canvas.setAttribute('aria-hidden', 'true');
        canvas.dataset.xtSelectionCanvas = slot;
        Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%',
          height: '100%', pointerEvents: 'none' });
        canvas.hidden = true;
        entry = { slot, canvas, context };
        slots.set(slot, entry);
      }
      if (entry.host !== host) {
        if (entry.host) resize?.unobserve(entry.host);
        if (entry.fallback) entry.fallback.style.visibility = '';
        entry.host = host;
        entry.fallback = fallback;
        host.append(entry.canvas);
        resize?.observe(host);
      }
      if (entry.source?.key !== source.key) void choose(entry, source);
    }
    setListening(slots.size > 0);
    schedule();
  }
  function stop() {
    for (const slot of slots.keys()) remove(slot);
    cache.clear();
  }
  return { sync, stop, snapshot: () => [...slots.values()].flatMap(entry => entry.receipt ? [entry.receipt] : []) };
}
