// V188 — named art slots for the content-gap scenes (Asphodèle station front,
// crew quests). Same contract as `insertion-asset-slots-v188.js`: image
// generation is deferred (owner Q79), every picture is drawn with Canvas
// primitives as a PLACEHOLDER and routed through one of these slots. When an
// image is produced for a slot, commit it at the slot's path AND add the slot id
// to CONTENT_GAP_FILES_PRESENT_V188; only listed slots are ever requested.
// Briefs describe the project's own designs (bible §7, §8); none claims a 1:1
// franchise fidelity.

export const CONTENT_GAP_ASSET_ROOT_V188 = '/assets/content/v188/';

const slot = (id, width, height, purpose, brief) => Object.freeze({ id, width, height, purpose, brief, path: `${CONTENT_GAP_ASSET_ROOT_V188}${id}.png` });

export const CONTENT_GAP_SLOTS_V188 = Object.freeze([
  slot('asphodele-exterior', 640, 280, 'Asphodèle station seen from the dropship (station scenes, briefing panel).',
    'Project design (bible §7.1): a Seegson-built orbital relay station, a slowly turning outer ring on spokes around a dark central hub, lights out, a small shuttle docked on the ring and a dropship clamped at one airlock; cold grey on black space.'),
  slot('cassius-core', 640, 280, 'CASSIUS speaking through a control-deck console (S2 decision).',
    'Project design (bible §7.1, §29.4): a low-cost Seegson station management system shown as a wall of green monochrome CRT text with a single waveform line that moves when it speaks; no face, no humanoid avatar.'),
  slot('echo8-recording', 640, 280, 'Echo-8’s helmet recording on Rook’s sensor screen (quest "Six heures", S3 scene).',
    'Project design (bible §7.2): a helmet-camera audio track as a long green waveform with a time ruler 5:58 → 6:00, a red cut marker at the end; monochrome CRT.'),
  slot('order-documents', 640, 280, 'The two orders laid side by side (quest "La ligne de commandement").',
    'Two printed orders on a desk under a lamp: a Colonial Administration requisition with a stamp, a company directive with a logo-free letterhead; lines marked in red where they contradict.'),
  slot('seal-fragment', 640, 280, 'Seal fragment QZ17-04 under the lab lens (quest "Le sceau").',
    'Close-up of a broken container seal in a lab tray: engraved batch number QZ17-04, a dark resin film on the inner face, an inspection stamp; cold lab light.'),
  slot('david-memory', 640, 280, 'DAVID-8R’s memory sector restored (quest "Mémoire récupérée").',
    'Synthetic memory map as a grid of blocks on a CRT, one sector turning from empty to filled, three relay components plugged beside it; monochrome green.')
]);
export const CONTENT_GAP_SLOT_IDS_V188 = Object.freeze(CONTENT_GAP_SLOTS_V188.map(entry => entry.id));
// Empty until art is produced; a test checks that every listed file exists.
export const CONTENT_GAP_FILES_PRESENT_V188 = Object.freeze([]);
export const getContentGapSlotV188 = id => CONTENT_GAP_SLOTS_V188.find(entry => entry.id === id) || null;

const GREEN = '#7dff9a', DIM = 'rgba(125,255,154,.35)', BG = '#050a07';
function frame(ctx, w, h) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = DIM; ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 4) { ctx.globalAlpha = .18; ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.strokeRect(.5, .5, w - 1, h - 1);
}
function wave(ctx, x0, x1, y, amp, seed, cutAt = 1) {
  ctx.strokeStyle = GREEN; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = x0; x <= x1; x += 2) {
    const k = (x - x0) / (x1 - x0), a = k > cutAt ? 0 : amp * (.35 + .65 * Math.abs(Math.sin(seed + x * .043)));
    const yy = y + Math.sin(x * .31 + seed) * a * Math.sin(x * .017 + seed * 2);
    if (x === x0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
  }
  ctx.stroke();
}
// Deterministic primitive drawings, one per slot (scale: the 640×280 brief box).
const PRIMITIVES = Object.freeze({
  'asphodele-exterior'(ctx, w, h) {
    ctx.fillStyle = '#020305'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i += 1) { ctx.fillStyle = `rgba(220,230,255,${.25 + (i * 37 % 60) / 100})`; ctx.fillRect((i * 97) % w, (i * 53) % h, 1.5, 1.5); }
    const cx = w * .55, cy = h * .52, r = Math.min(w, h) * .38;
    ctx.strokeStyle = '#59606a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(cx, cy, r, r * .32, -.12, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 3; for (let i = 0; i < 4; i += 1) { const a = i * Math.PI / 2 + .3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .32); ctx.stroke(); }
    ctx.fillStyle = '#3b4047'; ctx.fillRect(cx - 26, cy - 34, 52, 68);
    ctx.fillStyle = '#20242a'; for (let i = 0; i < 4; i += 1) ctx.fillRect(cx - 18, cy - 26 + i * 15, 36, 6);
    ctx.fillStyle = '#4c5560'; ctx.fillRect(cx + r * .82, cy - 12, 30, 12); // docked shuttle
    ctx.fillStyle = '#5d6b55'; ctx.beginPath(); ctx.moveTo(cx - r - 46, cy + 6); ctx.lineTo(cx - r - 6, cy - 4); ctx.lineTo(cx - r - 6, cy + 12); ctx.closePath(); ctx.fill(); // dropship at the airlock
  },
  'cassius-core'(ctx, w, h, lang) {
    frame(ctx, w, h); ctx.fillStyle = GREEN; ctx.font = '14px monospace';
    (lang === 'en' ? ['SEEGSON · CASSIUS · STATION MANAGEMENT', 'DIRECTIVE 1 · QUARANTINE ACTIVE', 'DIRECTIVE 2 · CARGO PRIORITY', 'DIRECTIVE 3 · ASSET PRESERVATION']
      : ['SEEGSON · CASSIUS · GESTION DE STATION', 'CONSIGNE 1 · QUARANTAINE ACTIVE', 'CONSIGNE 2 · PRIORITÉ CARGAISON', 'CONSIGNE 3 · PRÉSERVATION DES ACTIFS'])
      .forEach((line, i) => ctx.fillText(line, 24, 34 + i * 22));
    wave(ctx, 24, w - 24, h * .72, 26, 1.7);
  },
  'echo8-recording'(ctx, w, h) {
    frame(ctx, w, h); ctx.fillStyle = GREEN; ctx.font = '12px monospace';
    ['5:58', '5:59', '6:00'].forEach((label, i) => ctx.fillText(label, 24 + i * (w - 80) / 2, h - 18));
    wave(ctx, 24, w - 24, h * .48, 40, .4, .9);
    ctx.fillStyle = '#ff5050'; ctx.fillRect(24 + (w - 48) * .9, 24, 2, h - 60);
  },
  'order-documents'(ctx, w, h) {
    ctx.fillStyle = '#17140f'; ctx.fillRect(0, 0, w, h);
    for (const [x, tint] of [[w * .1, '#d8d2c2'], [w * .54, '#cfd6d8']]) {
      ctx.fillStyle = tint; ctx.fillRect(x, 26, w * .36, h - 52); ctx.fillStyle = '#555';
      for (let i = 0; i < 9; i += 1) ctx.fillRect(x + 14, 48 + i * 20, w * .36 - 28 - (i % 3) * 22, 4);
      ctx.fillStyle = '#c0392b'; ctx.fillRect(x + 10, 48 + 3 * 20 - 4, w * .36 - 20, 2);
    }
  },
  'seal-fragment'(ctx, w, h) {
    ctx.fillStyle = '#0d1114'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#8a9298'; ctx.beginPath(); ctx.moveTo(w * .3, h * .3); ctx.lineTo(w * .7, h * .25); ctx.lineTo(w * .66, h * .7); ctx.lineTo(w * .34, h * .74); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1c2a22'; ctx.beginPath(); ctx.ellipse(w * .5, h * .5, w * .12, h * .14, .3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#20262a'; ctx.font = 'bold 16px monospace'; ctx.fillText('QZ17-04', w * .38, h * .36);
  },
  'david-memory'(ctx, w, h) {
    frame(ctx, w, h);
    for (let r = 0; r < 5; r += 1) for (let c = 0; c < 12; c += 1) {
      ctx.fillStyle = r === 2 && c > 3 && c < 8 ? 'rgba(125,255,154,.9)' : (r * 7 + c * 3) % 5 ? DIM : 'rgba(125,255,154,.08)';
      ctx.fillRect(28 + c * 44, 28 + r * 36, 36, 26);
    }
  }
});

/** Real image when one is committed for the slot, the primitive drawing otherwise. */
export class ContentGapAssetLoaderV188 {
  constructor({ ImageCtor = globalThis.Image, present = CONTENT_GAP_FILES_PRESENT_V188 } = {}) {
    this.ImageCtor = ImageCtor; this.present = new Set(present); this.images = new Map(); this.requested = []; this.usage = Object.create(null);
  }
  preload(ids = CONTENT_GAP_SLOT_IDS_V188) {
    for (const id of ids) {
      const entry = getContentGapSlotV188(id);
      if (!entry || !this.present.has(id) || this.images.has(id) || !this.ImageCtor) continue;
      const image = new this.ImageCtor(); image.src = entry.path; this.images.set(id, image); this.requested.push(entry.path);
    }
    return this.requested.slice();
  }
  image(id) { const image = this.images.get(id); return image?.complete && image.naturalWidth > 0 ? image : null; }
  /** Draws the slot over the whole canvas context box; returns 'image' or 'primitive'. */
  draw(ctx, id, width, height, { language = 'fr' } = {}) {
    if (!getContentGapSlotV188(id)) throw new Error(`Unknown content art slot: ${id}`);
    const image = this.image(id);
    let source = 'primitive';
    if (image) { ctx.drawImage(image, 0, 0, width, height); source = 'image'; }
    else { ctx.save(); PRIMITIVES[id](ctx, width, height, language === 'en' ? 'en' : 'fr'); ctx.restore(); }
    this.usage[id] = source;
    return source;
  }
}
