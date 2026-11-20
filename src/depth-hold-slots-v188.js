// V188 — named art slots for the floor objects of the mission holds in depth
// (specs/004-cales-profondeur-suite). The owner's resumed art pass supplies
// raster objects; every slot retains its Canvas primitive fallback. When an image is
// produced for a slot, commit it at the slot's path AND add the slot id to
// DEPTH_HOLD_SLOT_FILES_PRESENT_V188: only listed slots are ever requested.
// Logical boxes follow the project scale, 1 m ≈ 51 px. Larger source rasters
// fit inside those same boxes; physical sizes and footprints never change.
// Markings are codes and pictograms only (no player text to translate).

export const DEPTH_HOLD_SLOT_ROOT_V188 = '/assets/depth-holds/v188/';

const slot = (id, layer, width, height, purpose, brief) => Object.freeze({
  id, purpose, width, height, layer, brief, path: `${DEPTH_HOLD_SLOT_ROOT_V188}${id}.png`
});

export const DEPTH_HOLD_SLOTS_V188 = Object.freeze([
  slot('freighter-crate-stack', 'midground', 61, 92, 'Freighter hold: two 0.9 m crates strapped on a 1.2 m pallet (1.8 m high).',
    'Two stacked wooden-and-steel freight crates on a pallet, orange ratchet strap, stencilled code only, side view, worn industrial; transparent background.'),
  slot('freighter-drum-rack', 'midground', 96, 52, 'Freighter hold: three 200 L drums on a low rack (0.88 m high).',
    'Three steel 200-litre drums side by side on a low rack, faded hazard bands, side view; transparent background.'),
  slot('quarantine-crate', 'midground', 92, 61, 'Quarantine hold (Lethe): sealed biohazard crate 1.8 × 1.2 m.',
    'Sealed white-grey biohazard transport crate with the biohazard pictogram and a UN 3373 marking, frost on the seams, side view; transparent background.'),
  slot('quarantine-cart', 'midground', 76, 40, 'Quarantine hold (Lethe): overturned sample cart 1.5 × 0.8 m.',
    'Low steel sample cart tipped on its side, a cracked sample case, side view; transparent background.')
]);
export const DEPTH_HOLD_SLOT_IDS_V188 = Object.freeze(DEPTH_HOLD_SLOTS_V188.map(entry => entry.id));
// Authored PNGs physically present under DEPTH_HOLD_SLOT_ROOT_V188.
export const DEPTH_HOLD_SLOT_FILES_PRESENT_V188 = Object.freeze(['freighter-crate-stack', 'freighter-drum-rack', 'quarantine-crate', 'quarantine-cart']);
// Measured useful alpha bounds remove export margins at draw time. The native
// size guard keeps another source revision from receiving the wrong crop.
export const DEPTH_HOLD_SLOT_SOURCE_RECTS_V188 = Object.freeze({
  'freighter-crate-stack': Object.freeze({ width: 1022, height: 1538, rect: Object.freeze([74, 32, 873, 1469]) }),
  'freighter-drum-rack': Object.freeze({ width: 1705, height: 923, rect: Object.freeze([50, 43, 1600, 850]) }),
  'quarantine-crate': Object.freeze({ width: 1536, height: 1024, rect: Object.freeze([15, 37, 1504, 950]) }),
  'quarantine-cart': Object.freeze({ width: 1728, height: 910, rect: Object.freeze([30, 18, 1684, 873]) })
});

export function getDepthHoldSlotV188(id) { return DEPTH_HOLD_SLOTS_V188.find(entry => entry.id === id) || null; }

const images = new WeakMap();
function slotImage(id, present, ImageCtor) {
  if (!present.includes(id) || !ImageCtor) return null;
  let cache = images.get(ImageCtor);
  if (!cache) { cache = new Map(); images.set(ImageCtor, cache); }
  let image = cache.get(id);
  if (!image) { image = new ImageCtor(); image.src = getDepthHoldSlotV188(id).path; cache.set(id, image); }
  return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0 ? image : null;
}

/** Draws a slotted floor object into its box: the committed image when there is one, the primitive fallback otherwise. */
export function drawDepthHoldSlotV188(ctx, prop, box, { present = DEPTH_HOLD_SLOT_FILES_PRESENT_V188, ImageCtor = globalThis.Image } = {}) {
  if (!getDepthHoldSlotV188(prop.slot)) throw new Error(`Unknown depth hold slot: ${prop.slot}`);
  const image = slotImage(prop.slot, present, ImageCtor);
  ctx.save();
  try {
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(box.x + box.w / 2, box.y + box.h + 2, box.w * .55, 6, 0, 0, Math.PI * 2); ctx.fill();
    if (image) {
      const frame = DEPTH_HOLD_SLOT_SOURCE_RECTS_V188[prop.slot];
      const crop = frame && image.naturalWidth === frame.width && image.naturalHeight === frame.height ? frame.rect : [0, 0, image.naturalWidth, image.naturalHeight];
      const scale = Math.min(box.w / crop[2], box.h / crop[3]), width = crop[2] * scale, height = crop[3] * scale;
      const x = box.x + (box.w - width) / 2, y = box.y + box.h - height;
      ctx.drawImage(image, ...crop, x, y, width, height);
      // Codes belong to each placed stack, not to a shared generated bitmap.
      if (prop.slot === 'freighter-crate-stack') {
        ctx.font = '700 6px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const [index, code] of (prop.labels || ['C-21', 'C-22']).slice(0, 2).entries()) {
          const ly = y + height * (index ? .291 : .715);
          ctx.fillStyle = '#292a24'; ctx.fillRect(x + width * .32, ly - 3.5, width * .36, 7);
          ctx.fillStyle = '#c9a54a'; ctx.fillText(code, x + width / 2, ly, width * .34);
        }
      }
      return 'image';
    }
    // The primitive drawing is rendered once per object into an offscreen canvas, then blitted (frame cost).
    const cached = fallbackCanvas(prop, box);
    if (cached) ctx.drawImage(cached, 0, 0, cached.width, cached.height, box.x - PAD, box.y - PAD, cached.width, cached.height);
    else FALLBACKS[prop.slot](ctx, box, prop);
    return 'primitive';
  } finally { ctx.restore(); }
}

const PAD = 4, rendered = new Map();
function fallbackCanvas(prop, box) {
  const key = `${prop.slot}|${(prop.labels || []).join(',')}|${box.w}x${box.h}`;
  if (rendered.has(key)) return rendered.get(key);
  const canvas = globalThis.document?.createElement?.('canvas'), g = canvas?.getContext?.('2d');
  if (!g) return null; // no offscreen canvas (Node host): drawn directly
  canvas.width = Math.ceil(box.w + PAD * 2); canvas.height = Math.ceil(box.h + PAD * 2);
  FALLBACKS[prop.slot](g, { x: PAD, y: PAD, w: box.w, h: box.h }, prop);
  rendered.set(key, canvas); return canvas;
}

const strap = (ctx, x, y, w) => { ctx.fillStyle = '#d06b2a'; ctx.fillRect(x, y, w, 3); };
function crate(ctx, x, y, w, h, code) {
  ctx.fillStyle = '#4a4434'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x, y, w, 3);
  ctx.strokeStyle = '#1e1b14'; ctx.lineWidth = 2; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  ctx.beginPath(); ctx.moveTo(x + 3, y + 3); ctx.lineTo(x + w - 3, y + h - 3); ctx.stroke();
  ctx.fillStyle = '#c9a54a'; ctx.font = '700 8px monospace'; ctx.fillText(code, x + 6, y + h / 2 + 3);
}
function biohazard(ctx, cx, cy, r) {
  ctx.strokeStyle = '#d7b13a'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 3; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * .45, cy + Math.sin(a) * r * .45, r * .5, 0, Math.PI * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(cx, cy, r * .22, 0, Math.PI * 2); ctx.stroke();
}
const FALLBACKS = Object.freeze({
  'freighter-crate-stack'(ctx, { x, y, w, h }, prop) {
    ctx.fillStyle = '#5a4630'; ctx.fillRect(x, y + h - 8, w, 8); ctx.fillStyle = '#2a2016'; for (let px = x + 6; px < x + w - 4; px += 14) ctx.fillRect(px, y + h - 8, 6, 8);
    const unit = (h - 8) / 2;
    crate(ctx, x + 1, y + unit, w - 2, unit, prop.labels?.[0] || 'C-21'); crate(ctx, x + 4, y, w - 8, unit, prop.labels?.[1] || 'C-22');
    strap(ctx, x, y + unit * .5, w); strap(ctx, x, y + unit * 1.5, w);
  },
  'freighter-drum-rack'(ctx, { x, y, w, h }) {
    ctx.fillStyle = '#2d3536'; ctx.fillRect(x, y + h - 6, w, 6);
    for (let i = 0; i < 3; i++) { const dx = x + i * (w / 3) + 2, dw = w / 3 - 4;
      ctx.fillStyle = i % 2 ? '#3d4a52' : '#34414a'; ctx.fillRect(dx, y + 4, dw, h - 10);
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(dx, y + 4, dw, 3); ctx.fillStyle = '#1a2024'; ctx.fillRect(dx, y + h * .4, dw, 3);
      ctx.fillStyle = '#c9a54a'; ctx.fillRect(dx + 3, y + h * .58, dw - 6, 5); }
  },
  'quarantine-crate'(ctx, { x, y, w, h }) {
    ctx.fillStyle = '#9aa3a3'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#7d8686'; ctx.fillRect(x, y + h - 10, w, 10);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x, y, w, 3);
    ctx.strokeStyle = '#4c5454'; ctx.lineWidth = 2; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    ctx.fillStyle = '#cfe7f2'; for (let i = 0; i < 6; i++) ctx.fillRect(x + 6 + i * 14, y + 2, 7, 2); // frost on the seam
    biohazard(ctx, x + 22, y + h / 2 - 2, 14);
    ctx.fillStyle = '#2b3030'; ctx.font = '700 9px monospace'; ctx.fillText('UN 3373', x + 42, y + h / 2 + 2);
  },
  'quarantine-cart'(ctx, { x, y, w, h }) {
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(-.12);
    ctx.fillStyle = '#2d3536'; ctx.fillRect(-w / 2, -h / 2 + 10, w, 12); // bed, tipped
    ctx.fillStyle = '#5b6466'; ctx.fillRect(-w / 2 + 6, -h / 2 - 2, w * .4, 14);
    ctx.fillStyle = '#121617'; for (const wx of [-w / 2 + 10, w / 2 - 12]) { ctx.beginPath(); ctx.arc(wx, h / 2 - 4, 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = '#b9c7c9'; ctx.fillRect(x + w - 26, y + h - 12, 20, 10); ctx.strokeStyle = '#d7b13a'; ctx.lineWidth = 1; ctx.strokeRect(x + w - 26, y + h - 12, 20, 10); // the cracked sample case
    ctx.strokeStyle = '#e3eef2'; ctx.beginPath(); ctx.moveTo(x + w - 20, y + h - 12); ctx.lineTo(x + w - 14, y + h - 4); ctx.stroke();
  }
});
