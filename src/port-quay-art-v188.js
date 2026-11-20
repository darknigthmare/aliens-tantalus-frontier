// The playable arrival quay reuses four reviewed prologue sources. These
// adapters only paint/load art; the quay owns the actors, depth, posts and save.
import { PROLOGUE_ART_V188, PROLOGUE_ART_SOURCE_RECTS_V188, PROLOGUE_ART_ANCHORS_V188 } from './prologue-art-v188.js';

export const PORT_QUAY_ART_IDS_V188 = Object.freeze([
  'tomas-wren-standing', 'lucia-ferro-standing', 'north-quay-patient', 'medical-stretcher'
]);
const sizes = [[1024, 1536], [1024, 1536], [2172, 724], [1923, 818]];
export const PORT_QUAY_ART_V188 = Object.freeze(Object.fromEntries(PORT_QUAY_ART_IDS_V188.map((id, index) => [id,
  Object.freeze({ path: PROLOGUE_ART_V188[id].path, width: sizes[index][0], height: sizes[index][1] })])));
export const PORT_QUAY_ART_SOURCE_RECTS_V188 = Object.freeze(Object.fromEntries(PORT_QUAY_ART_IDS_V188.map(id => [id, PROLOGUE_ART_SOURCE_RECTS_V188[id]])));
export const PORT_QUAY_ART_ANCHORS_V188 = Object.freeze(Object.fromEntries(PORT_QUAY_ART_IDS_V188.map(id => [id, PROLOGUE_ART_ANCHORS_V188[id]])));
export const PORT_QUAY_TRIAGE_LAYOUT_V188 = Object.freeze({
  mattressMetres: 2, patientMetres: 1.75,
  // Preserve the already reviewed position across the mattress at the quay's
  // own scale (the cinematic uses a 25 px inset at 180 px/m).
  patientInsetMetres: 25 / 180,
  chestLeft: 1200, chestRight: 1840, chestStep: 80, fixedLowerY: 448
});
const PERSON_IDS = Object.freeze({ 'tomas-wren': 'tomas-wren-standing', 'lucia-ferro': 'lucia-ferro-standing' });
const loading = new WeakMap();

function ownsSource(image, id) {
  const source = image?.currentSrc || image?.src, entry = PORT_QUAY_ART_V188[id];
  if (!entry || typeof source !== 'string' || source.includes('\\')) return false;
  try {
    const origin = globalThis.location?.origin;
    const url = new URL(source, origin && origin !== 'null' ? `${origin}/` : 'https://quay.invalid/');
    return ['http:', 'https:'].includes(url.protocol) && !url.search && !url.hash && !url.username && !url.password
      && (!origin || origin === 'null' || url.origin === origin) && url.pathname === entry.path;
  } catch { return false; }
}

/** Never admit another cached picture merely because it is marked complete. */
export function portQuayArtReadyV188(image, id) {
  const entry = PORT_QUAY_ART_V188[id], rect = PORT_QUAY_ART_SOURCE_RECTS_V188[id];
  if (!entry || !rect || !image?.complete || image.naturalWidth !== entry.width || image.naturalHeight !== entry.height || !ownsSource(image, id)) return false;
  const [x, y, w, h] = rect;
  return rect.every(Number.isFinite) && x >= 0 && y >= 0 && w > 0 && h > 0
    && x + w <= image.naturalWidth && y + h <= image.naturalHeight;
}

/** Called only when the quay starts. Pending/ready images survive re-entry;
 * an error is retried there, never from draw() or from a load callback. */
export function preloadPortQuayArtV188(images, { ImageCtor = globalThis.Image } = {}) {
  if (!(images instanceof Map) || typeof ImageCtor !== 'function') return;
  for (const id of PORT_QUAY_ART_IDS_V188) {
    const prior = images.get(id);
    if (portQuayArtReadyV188(prior, id)
      || (prior && ownsSource(prior, id) && loading.get(prior) !== 'error' && !prior.complete)) continue;
    let image;
    try { image = new ImageCtor(); } catch { continue; }
    images.set(id, image); loading.set(image, 'loading'); image.decoding = 'async';
    const finish = state => {
      if (loading.get(image) !== 'loading') return;
      loading.set(image, state);
      image.removeEventListener?.('load', loaded); image.removeEventListener?.('error', failed);
      if (!image.addEventListener) { image.onload = null; image.onerror = null; }
    };
    const loaded = () => finish(portQuayArtReadyV188(image, id) ? 'ready' : 'error'), failed = () => finish('error');
    if (image.addEventListener) { image.addEventListener('load', loaded); image.addEventListener('error', failed); }
    else { image.onload = loaded; image.onerror = failed; }
    try { image.src = PORT_QUAY_ART_V188[id].path; } catch { failed(); }
    if (portQuayArtReadyV188(image, id)) loaded();
  }
}

export function portQuayPersonFitV188(person, feetY) {
  const id = PERSON_IDS[person?.id], rect = PORT_QUAY_ART_SOURCE_RECTS_V188[id], foot = PORT_QUAY_ART_ANCHORS_V188[id]?.foot;
  if (!rect || !foot || ![person.x, person.h, feetY].every(Number.isFinite) || person.h <= 0) return null;
  return { id, sx: rect[0], sy: rect[1], sw: rect[2], sh: rect[3], foot,
    x: person.x, feetY, scale: person.h / (foot[1] - rect[1]), facing: person.facing < 0 ? -1 : 1 };
}

export function portQuayTriageFitV188(bed, metrePx = 51) {
  if (!bed || ![bed.x, bed.y, bed.w, bed.h, metrePx].every(Number.isFinite) || bed.w <= 0 || bed.h <= 0 || metrePx <= 0) return null;
  const layout = PORT_QUAY_TRIAGE_LAYOUT_V188, anchor = PORT_QUAY_ART_ANCHORS_V188['medical-stretcher'];
  const groundX = bed.x + bed.w / 2, groundY = bed.y + bed.h, scale = layout.mattressMetres * metrePx / anchor.mattress[2];
  const [sx, sy, sw, sh] = PORT_QUAY_ART_SOURCE_RECTS_V188['medical-stretcher'];
  const stretcher = { id: 'medical-stretcher', sx, sy, sw, sh, scale,
    x: groundX + (sx - anchor.ground[0]) * scale, y: groundY + (sy - anchor.ground[1]) * scale, w: sw * scale, h: sh * scale };
  const mattress = { x: groundX + (anchor.mattress[0] - anchor.ground[0]) * scale,
    y: groundY + (anchor.mattress[1] - anchor.ground[1]) * scale, w: anchor.mattress[2] * scale, h: anchor.mattress[3] * scale };
  const supportY = groundY + (anchor.support[1] - anchor.ground[1]) * scale;
  const [px, py, pw, ph] = PORT_QUAY_ART_SOURCE_RECTS_V188['north-quay-patient'], patientScale = layout.patientMetres * metrePx / pw;
  const patient = { id: 'north-quay-patient', sx: px, sy: py, sw: pw, sh: ph, scale: patientScale,
    x: mattress.x + layout.patientInsetMetres * metrePx,
    y: supportY - (PORT_QUAY_ART_ANCHORS_V188['north-quay-patient'].support[1] - py) * patientScale,
    w: pw * patientScale, h: ph * patientScale };
  return { stretcher, patient, mattress, ground: [groundX, groundY], supportY };
}

export function drawPortQuayPersonV188(ctx, images, person, feetY) {
  const fit = portQuayPersonFitV188(person, feetY), image = fit && images?.get(fit.id);
  if (!fit || !portQuayArtReadyV188(image, fit.id)) return false;
  ctx.save();
  // Same ground shadow and depth pass as the original silhouette.
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(person.x, feetY + 1, person.h * .27 * .75, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(fit.x, fit.feetY); ctx.scale(fit.scale * fit.facing, fit.scale);
  ctx.drawImage(image, fit.sx, fit.sy, fit.sw, fit.sh, fit.sx - fit.foot[0], fit.sy - fit.foot[1], fit.sw, fit.sh);
  ctx.restore(); return true;
}

/** The two support planes must arrive together: mixing the old bed/patient
 * with one new image would separate the patient's head and heels from the deck. */
export function drawPortQuayTriageV188(ctx, images, bed, { time = 0, reducedMotion = false, metrePx = 51 } = {}) {
  const pair = portQuayTriageFitV188(bed, metrePx);
  if (!pair || ![pair.stretcher, pair.patient].every(fit => portQuayArtReadyV188(images?.get(fit.id), fit.id))) return false;
  const deck = pair.stretcher, patient = pair.patient, image = images.get(patient.id), layout = PORT_QUAY_TRIAGE_LAYOUT_V188;
  ctx.drawImage(images.get(deck.id), deck.sx, deck.sy, deck.sw, deck.sh, deck.x, deck.y, deck.w, deck.h);
  // The playable quay has always used a positive 0–1 px breath, unlike CIN.
  const breath = reducedMotion ? 0 : Math.max(0, Math.sin((Number.isFinite(time) ? time : 0) * 2.2));
  const edges = [patient.sx];
  for (let x = layout.chestLeft; x <= layout.chestRight; x += layout.chestStep) edges.push(x);
  edges.push(patient.sx + patient.sw);
  for (let i = 0; i < edges.length - 1; i++) {
    const left = edges[i], width = edges[i + 1] - left;
    const weight = i === 0 || i === edges.length - 2 ? 0
      : Math.max(0, Math.sin((left + width / 2 - layout.chestLeft) / (layout.chestRight - layout.chestLeft) * Math.PI));
    const lift = breath * weight, upperHeight = layout.fixedLowerY - patient.sy;
    ctx.drawImage(image, left, patient.sy, width, upperHeight,
      patient.x + (left - patient.sx) * patient.scale, patient.y - lift, width * patient.scale, upperHeight * patient.scale + lift);
  }
  ctx.drawImage(image, patient.sx, layout.fixedLowerY, patient.sw, patient.sy + patient.sh - layout.fixedLowerY,
    patient.x, patient.y + (layout.fixedLowerY - patient.sy) * patient.scale, patient.w, (patient.sy + patient.sh - layout.fixedLowerY) * patient.scale);
  return true;
}
