// V188 — named art slots for the content-gap scenes (Asphodèle station front,
// crew quests). Only listed, committed PNGs are requested, lazily by the scene
// dialog. Original primitive drawings remain the loading/error fallback.
// Exact narrative text and evidence geometry are drawn natively above either
// source, preserving French/English and keeping generated pixels data-free.
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
// Add only inspected PNG files that are present at the paths above.
export const CONTENT_GAP_FILES_PRESENT_V188 = Object.freeze([
  'asphodele-exterior', 'cassius-core', 'echo8-recording', 'order-documents', 'seal-fragment', 'david-memory'
]);
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
  'cassius-core': frame,
  'echo8-recording': frame,
  'order-documents'(ctx, w, h) {
    ctx.fillStyle = '#17140f'; ctx.fillRect(0, 0, w, h);
    for (const [x, tint] of [[50, '#d8d2c2'], [328, '#cfd6d8']]) { ctx.fillStyle = tint; ctx.fillRect(w * x / 640, h * 42 / 280, w * 264 / 640, h * 203 / 280); }
  },
  'seal-fragment'(ctx, w, h) {
    ctx.fillStyle = '#0d1114'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#8a9298'; ctx.beginPath(); ctx.moveTo(w * .3, h * .3); ctx.lineTo(w * .7, h * .25); ctx.lineTo(w * .66, h * .7); ctx.lineTo(w * .34, h * .74); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1c2a22'; ctx.beginPath(); ctx.ellipse(w * .5, h * .5, w * .12, h * .14, .3, 0, Math.PI * 2); ctx.fill();
  },
  'david-memory'(ctx, w, h) {
    frame(ctx, w, h);
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = '#65766c'; ctx.fillRect(w * .765, h * (.18 + i * .19), w * .12, h * .12);
      ctx.fillStyle = '#1b3023'; ctx.fillRect(w * .78, h * (.195 + i * .19), w * .09, h * .065);
      ctx.strokeStyle = '#86978c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * .765, h * (.24 + i * .19)); ctx.lineTo(w * .71, h * (.24 + i * .19)); ctx.stroke();
    }
  }
});

const t = (fr, en) => Object.freeze({ fr, en });
export const CONTENT_GAP_CAPTIONS_V188 = Object.freeze({
  'asphodele-exterior': t('STATION ASPHODÈLE', 'ASPHODÈLE STATION'),
  'cassius-core': t('CASSIUS · CONSIGNES ARCHIVÉES', 'CASSIUS · ARCHIVED DIRECTIVES'),
  'echo8-recording': t('ECHO-8 · ENREGISTREMENT CASQUE', 'ECHO-8 · HELMET RECORDING'),
  'order-documents': t('LA LIGNE DE COMMANDEMENT', 'THE CHAIN OF COMMAND'),
  'seal-fragment': t('QZ17-04 · FRAGMENT INTÉRIEUR', 'QZ17-04 · INNER FRAGMENT'),
  'david-memory': t('DAVID-8R · SECTEUR MÉMOIRE', 'DAVID-8R · MEMORY SECTOR')
});
export const CONTENT_GAP_EVIDENCE_IDS_V188 = Object.freeze(CONTENT_GAP_SLOT_IDS_V188.filter(id => id !== 'asphodele-exterior'));
const evidenceIds = new Set(CONTENT_GAP_EVIDENCE_IDS_V188);
const ink = (ctx, text, x, y, { color = GREEN, size = 13, bold = false, maxWidth = null } = {}) => {
  ctx.fillStyle = color; ctx.font = `${bold ? 'bold ' : ''}${size}px monospace`;
  if (maxWidth > 0) ctx.fillText(text, x, y, maxWidth); else ctx.fillText(text, x, y);
};
function paragraph(ctx, text, x, y, width, { color = '#24251f', size = 11, leading = 13 } = {}) {
  ctx.fillStyle = color; ctx.font = `${size}px monospace`;
  let line = '', row = 0;
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) { ctx.fillText(line, x, y + row * leading); row += 1; line = word; }
    else line = next;
  }
  if (line) ctx.fillText(line, x, y + row * leading);
  return row + 1;
}
function nativeScreen(ctx, x, y, width, height, paintSurface) {
  if (!paintSurface) return;
  ctx.fillStyle = '#07100b'; ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = '#436651'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, width - 1, height - 1);
}
const markLine = (ctx, x, y, width) => { ctx.strokeStyle = '#a63e2d'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + width, y); ctx.stroke(); };

/** Narrative evidence stays native, on a fixed 640×280 logical frame.
 * CASSIUS and DAVID pictures are reused before and after decisions/collection:
 * archived orders and a target sector do not claim a current quest result.
 * Echo-8 uses the established minute window, leaving the divergent 06:00:05
 * cinematic and 06:00:07 quest cut seconds to their existing narrative text. */
export function drawContentGapEvidenceV188(ctx, id, width, height, language = 'fr', { paintSurface = true } = {}) {
  if (!ctx || !evidenceIds.has(id) || !(width > 0 && height > 0)) return false;
  const lang = language === 'en' ? 'en' : 'fr', text = (fr, en) => lang === 'en' ? en : fr;
  ctx.save();
  try {
    ctx.scale(width / 640, height / 280); ctx.globalAlpha = 1;
    if (id === 'cassius-core') {
      nativeScreen(ctx, 140, 39, 365, 171, paintSurface);
      ink(ctx, 'SEEGSON · CASSIUS', 155, 63, { size: 17, bold: true, maxWidth: 330 });
      ink(ctx, text('CONSIGNES ARCHIVÉES', 'ARCHIVED DIRECTIVES'), 155, 84, { color: '#a9c7ad', size: 11 });
      const lines = [text('1 · QUARANTAINE · STATION ET COCYTE', '1 · QUARANTINE · STATION AND COCYTE'),
        text('2 · PRIORITÉ CARGAISON', '2 · CARGO PRIORITY'), text('3 · PRÉSERVATION DES ACTIFS', '3 · ASSET PRESERVATION')];
      lines.forEach((line, index) => ink(ctx, line, 155, 110 + index * 23, { maxWidth: 330 }));
      wave(ctx, 155, 485, 184, 13, 1.7);
    } else if (id === 'echo8-recording') {
      nativeScreen(ctx, 148, 35, 344, 183, paintSurface);
      ink(ctx, text('ECHO-8 · PISTE CASQUE', 'ECHO-8 · HELMET TRACK'), 163, 61, { size: 14, bold: true, maxWidth: 314 });
      // The waveform is illustrative, not an invented sample-by-sample audio transcript.
      wave(ctx, 163, 477, 126, 27, .4);
      ctx.strokeStyle = '#648e6a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(163, 175); ctx.lineTo(477, 175); ctx.stroke();
      for (const [x, label] of [[163, '05:58'], [320, '05:59'], [477, '06:00']]) {
        ctx.beginPath(); ctx.moveTo(x, 170); ctx.lineTo(x, 181); ctx.stroke();
        ink(ctx, label, x - (x === 477 ? 38 : x === 320 ? 19 : 0), 202, { size: 12 });
      }
      ctx.fillStyle = '#ff6660'; ctx.fillRect(476, 83, 2, 83);
      ink(ctx, text('COUPURE', 'CUT'), 416, 78, { color: '#ff8c80', size: 11, maxWidth: 61 });
    } else if (id === 'order-documents') {
      const dark = '#282820';
      ink(ctx, text('ADMINISTRATION', 'COLONIAL'), 67, 64, { color: dark, bold: true, size: 13, maxWidth: 230 });
      ink(ctx, text('COLONIALE', 'ADMINISTRATION'), 67, 81, { color: dark, bold: true, size: 13, maxWidth: 230 });
      ink(ctx, text('CONSIGNE DE', 'COMPANY'), 344, 64, { color: dark, bold: true, size: 13, maxWidth: 230 });
      ink(ctx, text('LA COMPAGNIE', 'DIRECTIVE'), 344, 81, { color: dark, bold: true, size: 13, maxWidth: 230 });
      ctx.strokeStyle = '#975c43'; ctx.lineWidth = 1; ctx.strokeRect(238.5, 51.5, 60, 32);
      ink(ctx, text('ADMIN.', 'COLONIAL'), 244, 64, { color: '#975c43', bold: true, size: 9, maxWidth: 50 });
      ink(ctx, text('COLONIALE', 'ADMIN.'), 244, 77, { color: '#975c43', bold: true, size: 9, maxWidth: 50 });
      ink(ctx, 'ARTICLE 2', 67, 103, { color: dark, bold: true, size: 11 });
      paragraph(ctx, text('Protéger la population de Cocyte et rendre compte de l’incident.', 'Protect the population of Cocyte and report on the incident.'), 67, 118, 230);
      ink(ctx, text('POINT 4', 'ITEM 4'), 344, 103, { color: dark, bold: true, size: 11 });
      paragraph(ctx, text('Le fret QZ17 garde la priorité sur le réseau jusqu’à nouvel ordre.', 'QZ17 freight keeps priority on the network until further notice.'), 344, 118, 230);
      ink(ctx, 'ARTICLE 5', 67, 171, { color: dark, bold: true, size: 11 });
      paragraph(ctx, text('Le Tantalus peut réquisitionner les moyens civils et industriels de Cocyte.', 'The Tantalus may requisition the civil and industrial means of Cocyte.'), 67, 186, 230);
      ink(ctx, text('POINT 7', 'ITEM 7'), 344, 171, { color: dark, bold: true, size: 11 });
      paragraph(ctx, text('Aucun matériel de la compagnie ne quitte le dépôt sans accord du représentant.', 'No company equipment leaves the depot without the representative’s agreement.'), 344, 186, 230);
      for (const x of [65, 342]) { markLine(ctx, x, 151, 234); markLine(ctx, x, 226, 234); }
    } else if (id === 'seal-fragment') {
      ink(ctx, 'QZ17-04', paintSurface ? 236 : 314, paintSurface ? 98 : 125, { color: '#22292b', bold: true, size: 23, maxWidth: 166 });
      const stamp = paintSurface ? { x: 236, y: 194, color: '#dce8d7', size: 12 } : { x: 64, y: 224, color: '#273329', size: 10 };
      ink(ctx, 'ASPHODÈLE', stamp.x, stamp.y, { color: stamp.color, bold: true, size: stamp.size, maxWidth: 166 });
      ink(ctx, text('TRANSIT VÉRIFIÉ', 'TRANSIT VERIFIED'), stamp.x, stamp.y + (paintSurface ? 17 : 12), { color: stamp.color, size: stamp.size, maxWidth: 166 });
    } else if (id === 'david-memory') {
      nativeScreen(ctx, 83, 45, 325, 157, paintSurface);
      ink(ctx, 'DAVID-8R', 98, 64, { size: 17, bold: true });
      for (let row = 0; row < 5; row += 1) for (let column = 0; column < 12; column += 1) {
        const target = row === 2 && column >= 4 && column <= 7;
        ctx.fillStyle = target ? '#07100b' : (row * 7 + column * 3) % 5 ? DIM : 'rgba(125,255,154,.08)';
        ctx.fillRect(98 + column * 25, 78 + row * 21, 20, 16);
        if (target) { ctx.strokeStyle = '#e5c784'; ctx.lineWidth = 1; ctx.strokeRect(98.5 + column * 25, 78.5 + row * 21, 19, 15); }
      }
      ink(ctx, text('SECTEUR CIBLE', 'TARGET SECTOR'), 98, 195, { color: '#e5c784', size: 12 });
      const relayY = paintSurface ? 213 : 62;
      ink(ctx, text('3 COMPOSANTS', '3 RELAY'), 480, relayY, { color: '#dce8d7', size: 11, bold: true, maxWidth: 110 });
      ink(ctx, text('DE RELAIS', 'COMPONENTS'), 480, relayY + 15, { color: '#dce8d7', size: 11, maxWidth: 110 });
    }
  } finally { ctx.restore(); }
  return true;
}

function caption(ctx, id, width, height, language) {
  ctx.fillStyle = 'rgba(1,4,3,.78)'; ctx.fillRect(0, height - 24, width, 24);
  ctx.fillStyle = '#dce8d7'; ctx.font = 'bold 12px monospace';
  ctx.fillText(CONTENT_GAP_CAPTIONS_V188[id][language], 12, height - 8, width - 24);
}

/** Real image when one is committed for the slot, the primitive drawing otherwise. */
export class ContentGapAssetLoaderV188 {
  constructor({ ImageCtor = globalThis.Image, present = CONTENT_GAP_FILES_PRESENT_V188 } = {}) {
    this.ImageCtor = ImageCtor; this.present = new Set(present); this.images = new Map(); this.requested = []; this.usage = Object.create(null);
    this.states = new Map(); this.listeners = new Map(); this.frames = Object.create(null);
  }
  preload(ids = CONTENT_GAP_SLOT_IDS_V188) {
    for (const id of ids) {
      const entry = getContentGapSlotV188(id);
      if (!entry || !this.present.has(id) || this.images.has(id) || !this.ImageCtor) continue;
      const image = new this.ImageCtor(); this.images.set(id, image); this.states.set(id, 'loading'); this.requested.push(entry.path);
      const finish = state => {
        if (this.images.get(id) !== image || this.states.get(id) !== 'loading') return;
        this.states.set(id, state);
        image.removeEventListener?.('load', ready); image.removeEventListener?.('error', failed);
        if (!image.addEventListener) { image.onload = null; image.onerror = null; }
        for (const notify of [...(this.listeners.get(id) || [])]) notify();
      };
      const ready = () => finish(image.complete && image.naturalWidth > 0 && image.naturalHeight > 0 ? 'ready' : 'error');
      const failed = () => finish('error');
      if (image.addEventListener) { image.addEventListener('load', ready); image.addEventListener('error', failed); }
      else { image.onload = ready; image.onerror = failed; }
      try { image.src = entry.path; } catch { failed(); }
      if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) ready();
    }
    return this.requested.slice();
  }
  subscribe(id, notify) {
    if (!getContentGapSlotV188(id) || typeof notify !== 'function') return () => {};
    let listeners = this.listeners.get(id); if (!listeners) { listeners = new Set(); this.listeners.set(id, listeners); }
    listeners.add(notify);
    return () => { listeners.delete(notify); if (!listeners.size) this.listeners.delete(id); };
  }
  image(id) {
    const image = this.images.get(id);
    return this.states.get(id) !== 'error' && image?.complete && Number.isFinite(image.naturalWidth) && image.naturalWidth > 0
      && Number.isFinite(image.naturalHeight) && image.naturalHeight > 0 ? image : null;
  }
  /** Draws the slot over the whole canvas context box; returns 'image' or 'primitive'. */
  draw(ctx, id, width, height, { language = 'fr' } = {}) {
    if (!getContentGapSlotV188(id)) throw new Error(`Unknown content art slot: ${id}`);
    const image = this.image(id), lang = language === 'en' ? 'en' : 'fr';
    let source = 'primitive', crop = null;
    ctx.save();
    try {
      ctx.beginPath(); ctx.rect(0, 0, width, height); ctx.clip();
      if (image) {
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const sw = width / scale, sh = height / scale;
        crop = { x: (image.naturalWidth - sw) / 2, y: (image.naturalHeight - sh) / 2, w: sw, h: sh };
        try { ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, width, height); source = 'image'; }
        catch { crop = null; this.states.set(id, 'error'); }
      }
      if (source === 'primitive') PRIMITIVES[id](ctx, width, height, lang);
      const evidence = drawContentGapEvidenceV188(ctx, id, width, height, lang, { paintSurface: source !== 'image' });
      caption(ctx, id, width, height, lang);
      this.frames[id] = { source, language: lang, crop, target: { x: 0, y: 0, w: width, h: height }, evidence };
    } finally { ctx.restore(); }
    this.usage[id] = source;
    return source;
  }
}
