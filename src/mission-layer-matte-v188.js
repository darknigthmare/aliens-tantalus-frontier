// V188 — matte correction of the planet cover layers (graphics audit 2026-11-15, item 15).
//
// The reviewed planet-exterior mid and foreground PNGs keep straight-alpha edge pixels whose
// colour still carries the pale matte they were cut from (semi-transparent edge pixels average
// RGB ≈ 160 against ≈ 65 for the opaque rock). Drawn over the dark sky, the rocks showed a white
// halo. The source files stay untouched: at first use each layer is copied once into an
// offscreen canvas where every semi-transparent pixel takes the colour of its more opaque
// neighbours (colour bleed from the rock inward-out) and the faintest fringe alpha is trimmed.
// The bases of the rock masses also carry a pale, fully opaque band of the painted ground fog,
// cut hard by the alpha mask: within a short reach of the transparent edge, pale pixels are
// faded towards transparency in proportion to their lightness, so the haze feathers out while
// the dark rock stays opaque. The corrected copy replaces the image for drawing only.

export const MATTE_TEMPLATES_V188 = Object.freeze(['planet-exterior']);
export const MATTE_LAYER_KINDS_V188 = Object.freeze(['mid', 'foreground']);
export const MATTE_RADIUS_V188 = 2;
export const MATTE_ALPHA_TRIM_V188 = 0.1;
/** Edge haze: reach in px from the transparent edge, and the lightness (0-255 luma) where fading starts / is full. */
export const MATTE_HAZE_V188 = Object.freeze({ reach: 28, lumaFrom: 112, lumaSpan: 64 });

/** Chamfer distance (px, 1 / 1.41 steps) from every pixel to the nearest fully transparent one, capped at cap. */
export function transparentEdgeDistanceV188(data, width, height, cap = 64) {
  const d = new Float32Array(width * height);
  for (let i = 0; i < d.length; i++) d[i] = data[i * 4 + 3] === 0 ? 0 : cap;
  const D = 1.4142;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = y * width + x; let v = d[i]; if (!v) continue;
    if (x > 0) v = Math.min(v, d[i - 1] + 1);
    if (y > 0) { v = Math.min(v, d[i - width] + 1); if (x > 0) v = Math.min(v, d[i - width - 1] + D); if (x < width - 1) v = Math.min(v, d[i - width + 1] + D); }
    d[i] = v;
  }
  for (let y = height - 1; y >= 0; y--) for (let x = width - 1; x >= 0; x--) {
    const i = y * width + x; let v = d[i]; if (!v) continue;
    if (x < width - 1) v = Math.min(v, d[i + 1] + 1);
    if (y < height - 1) { v = Math.min(v, d[i + width] + 1); if (x < width - 1) v = Math.min(v, d[i + width + 1] + D); if (x > 0) v = Math.min(v, d[i + width - 1] + D); }
    d[i] = v;
  }
  return d;
}

/** Fades pale pixels near the transparent edge (painted fog cut by the mask). Returns the number of pixels faded. */
export function fadeEdgeHazeV188(data, width, height, { reach = MATTE_HAZE_V188.reach, lumaFrom = MATTE_HAZE_V188.lumaFrom, lumaSpan = MATTE_HAZE_V188.lumaSpan } = {}) {
  const distance = transparentEdgeDistanceV188(data, width, height, reach + 1); let faded = 0;
  for (let p = 0; p < distance.length; p++) {
    const dist = distance[p]; if (!dist || dist > reach) continue;
    const i = p * 4, luma = .299 * data[i] + .587 * data[i + 1] + .114 * data[i + 2];
    const light = Math.max(0, Math.min(1, (luma - lumaFrom) / lumaSpan)); if (!light) continue;
    const near = 1 - dist / reach, keep = 1 - light * near * near * (3 - 2 * near);
    data[i + 3] = Math.round(data[i + 3] * keep); faded++;
  }
  return faded;
}

/**
 * Defringes straight-alpha RGBA pixels in place. Each pixel with 0 < alpha < 255 takes the
 * alpha²-weighted mean colour of its neighbours (within radius) that are more opaque than it;
 * then alpha below the trim fades out linearly. Returns the number of edge pixels corrected.
 */
export function defringeStraightAlphaV188(data, width, height, { radius = MATTE_RADIUS_V188, trim = MATTE_ALPHA_TRIM_V188 } = {}) {
  const source = new Uint8ClampedArray(data); let corrected = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4, a = source[i + 3];
    if (a === 0 || a === 255) continue;
    let r = 0, g = 0, b = 0, weight = 0;
    for (let dy = -radius; dy <= radius; dy++) {
      const ny = y + dy; if (ny < 0 || ny >= height) continue;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx; if (nx < 0 || nx >= width || (!dx && !dy)) continue;
        const j = (ny * width + nx) * 4, na = source[j + 3];
        if (na <= a) continue;
        const w = na * na; r += source[j] * w; g += source[j + 1] * w; b += source[j + 2] * w; weight += w;
      }
    }
    if (weight > 0) { data[i] = r / weight; data[i + 1] = g / weight; data[i + 2] = b / weight; corrected++; }
    const t = a / 255; data[i + 3] = Math.round(Math.max(0, Math.min(1, (t - trim) / (1 - trim))) * 255);
  }
  return corrected;
}

const ready = image => Boolean(image?.complete && (image.naturalWidth || image.width) > 0);
const matted = new WeakMap();

/** The matte-corrected copy of a layer image, or null while it is not available (Node, pending, tainted). */
export function mattedLayerV188(image, { schedule = globalThis.setTimeout, documentRef = globalThis.document } = {}) {
  if (!ready(image)) return null;
  const entry = matted.get(image);
  if (entry) return entry.canvas || null;
  const record = { canvas: null }; matted.set(image, record);
  const work = () => {
    const started = globalThis.performance?.now?.() ?? 0;
    try {
      const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
      const canvas = documentRef?.createElement?.('canvas'), ctx = canvas?.getContext?.('2d', { willReadFrequently: true });
      if (!ctx) return;
      canvas.width = width; canvas.height = height; ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, width, height);
      record.corrected = defringeStraightAlphaV188(pixels.data, width, height);
      record.faded = fadeEdgeHazeV188(pixels.data, width, height);
      ctx.putImageData(pixels, 0, 0);
      // The copy answers like the image to the cover renderer.
      Object.assign(canvas, { complete: true, naturalWidth: width, naturalHeight: height, src: image.src, mattedV188: true });
      if (image.missionCoverContractV62) canvas.missionCoverContractV62 = image.missionCoverContractV62;
      record.canvas = canvas; canvas.matteMsV188 = (globalThis.performance?.now?.() ?? 0) - started;
    } catch { record.failed = true; }
  };
  if (typeof schedule === 'function') schedule(work, 0); else work();
  return null;
}

export function withMissionLayerMatteV188(Base) {
  if (Base.missionLayerMatteV188) return Base;
  return class MissionLayerMatteV188 extends Base {
    static missionLayerMatteV188 = true;
    missionLevelLayerImage(kind, ...rest) {
      const image = super.missionLevelLayerImage(kind, ...rest);
      if (!MATTE_LAYER_KINDS_V188.includes(kind) || !MATTE_TEMPLATES_V188.includes(this.missionLevelRuntime?.templateId)) return image;
      return mattedLayerV188(image) || image;
    }
  };
}
