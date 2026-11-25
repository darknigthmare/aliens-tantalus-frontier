// V188 — named art slots of the dedicated colony levels C1-C4 (bible §6.4, §43).
// Every slot is a Canvas placeholder today: no image was generated for this lot.
// When an image is produced, commit it at the slot path AND list the slot id in
// COLONY_LEVEL_ART_FILES_PRESENT_V188; only listed slots are ever requested and
// the primitive below stays the loading/error fallback. Logical boxes follow the
// project scale, 1 m ≈ 51 px; a larger raster fits inside the same box.
// Player text drawn here is French and goes through the reviewed EN catalog.
//
// Reused shipped art (not new art): the three colonists of the cargo-brutal
// survivors sheet (cargo-brutal-visuals-v67.js, columns idle / walk / cower / run)
// stand in for patients, M577 arrivals and the « élu »; the M577 silhouette is the
// level dropship primitive (level-dropship-slots-v188.js). Both are placeholders
// for colonists of Port-Méridien, never their final look.
import { CARGO_BRUTAL_SURVIVORS_SHEET_V67 } from './cargo-brutal-visuals-v67.js';
import { drawM577TransportV188 } from './level-dropship-slots-v188.js';
import { M577_SCALE_V188 } from './m577-scale-v188.js';

export const COLONY_LEVEL_ART_ROOT_V188 = '/assets/colony/levels/v188/';
const slot = (id, layer, width, height, purpose, fidelity) => Object.freeze({ id, layer, width, height, purpose, fidelity,
  path: `${COLONY_LEVEL_ART_ROOT_V188}${id}.png`, status: 'placeholder' });
/** fidelity: 'documented' (look seen in a cited film), 'adapted' (project adaptation of a documented element), 'to-define'. */
export const COLONY_LEVEL_ART_SLOTS_V188 = Object.freeze([
  slot('colony-qz17-04-container', 'wall', 128, 133, 'C1: the opened QZ17-04 container in the quay warehouse (2.5 × 2.6 m, door bent outwards, resin on the sill).', 'adapted'),
  slot('colony-warehouse-shutter', 'wall', 153, 122, 'C1: the warehouse roller shutter and its lock panel (3 × 2.4 m).', 'to-define'),
  slot('colony-airlock-weld', 'door', 64, 132, 'C1: weld seam and scorched edge over a closed airlock leaf (door height).', 'documented'),
  slot('colony-sentry-ua571c', 'actor', 56, 61, 'C1: UA 571-C sentry gun on its tripod, ammo counter (1.1 × 1.2 m).', 'documented'),
  slot('colony-infirmary-front', 'wall', 204, 128, 'C1: Lucia Ferro’s infirmary frontage, red cross, triage beds (4 × 2.5 m).', 'to-define'),
  slot('colony-north-airlock', 'wall', 92, 132, 'C1: airlock B in the north wall, drawn on the back wall (1.8 × 2.6 m).', 'adapted'),
  slot('colony-scanner-arch', 'wall', 102, 133, 'C3: walk-through medical scanner of the triage post (2 × 2.6 m).', 'adapted'),
  slot('colony-heat-exchanger', 'wall', 153, 153, 'C2: heat-exchanger stack of the processor, resin over the fins (3 × 3 m).', 'adapted'),
  slot('colony-nest-resin', 'wall', 204, 122, 'C2: resin nest with cocoons against the exchangers (4 × 2.4 m).', 'documented'),
  slot('colony-breaker', 'wall', 31, 51, 'C2: control-room breaker box (0.6 × 1 m).', 'to-define'),
  slot('colony-restart-console', 'wall', 76, 61, 'C2: processor restart console (1.5 × 1.2 m).', 'to-define'),
  slot('colony-cocoon-elu', 'wall', 61, 112, 'C4: an « élu » held in a resin cocoon on the wall (1.2 × 2.2 m).', 'documented'),
  slot('colony-cult-sign', 'wall', 102, 41, 'C4: hand-painted « ÉLUS » sign (2 × 0.8 m).', 'adapted'),
  slot('colony-airlock-log', 'wall', 41, 41, 'C4: airlock log screen beside a door (0.8 m).', 'to-define'),
  slot('colony-tampered-seal', 'wall', 51, 31, 'C4: forced vent seal (1 × 0.6 m).', 'to-define'),
  slot('colony-lore-cache', 'floor', 46, 31, 'C4: a convert’s hidden bag at the dead end of the duct (0.9 × 0.6 m).', 'to-define'),
  slot('colony-npc-noor', 'actor', 42, 92, 'C3: Noor Okafor at the infirmary block (placeholder silhouette, marine scale).', 'to-define'),
  slot('colony-npc-lucia', 'actor', 42, 92, 'C1: Lucia Ferro at her infirmary (placeholder silhouette, marine scale).', 'to-define'),
  // Owner decision 2026-11-22: in C4 the vents are the only way to the gathering; these close the two walks around them.
  slot('colony-utility-grate-sealed', 'wall', 40, 258, 'C4: service grate of the utility gallery, welded shut from the gathering side (0.8 × 5 m, floor to ceiling of the gallery).', 'adapted'),
  slot('colony-roof-hatch-sealed', 'wall', 40, 160, 'C4: roof access door of the comms block, chained and welded (0.8 × 3.1 m).', 'adapted')
]);
export const COLONY_LEVEL_ART_SLOT_IDS_V188 = Object.freeze(COLONY_LEVEL_ART_SLOTS_V188.map(entry => entry.id));
/** Authored PNGs physically present under COLONY_LEVEL_ART_ROOT_V188 (none yet). */
export const COLONY_LEVEL_ART_FILES_PRESENT_V188 = Object.freeze([]);
export const colonyLevelArtSlotV188 = id => COLONY_LEVEL_ART_SLOTS_V188.find(entry => entry.id === id) || null;
/** The reused survivors sheet: 4 columns (idle, walk, cower, run) × 3 rows. */
export const COLONY_CIVILIAN_SHEET_V188 = Object.freeze({ path: CARGO_BRUTAL_SURVIVORS_SHEET_V67.path, columns: 4, rows: 3, cell: 256, draw: 116, feetInset: 7 });

const images = new Map();
function image(path, ImageCtor = globalThis.Image) {
  if (!ImageCtor) return null;
  let entry = images.get(path);
  if (!entry) { entry = new ImageCtor(); try { entry.decoding = 'async'; } catch {} entry.src = path; images.set(path, entry); }
  return entry.complete && entry.naturalWidth > 0 ? entry : null;
}
function slotImage(id, present, ImageCtor) {
  return present.includes(id) ? image(colonyLevelArtSlotV188(id).path, ImageCtor) : null;
}

/** Draws a slot into its box (feet on `bottom`): the committed PNG when listed, the primitive otherwise. */
export function drawColonyLevelSlotV188(ctx, id, x, bottom, options = {}) {
  const entry = colonyLevelArtSlotV188(id);
  if (!entry) throw new Error(`Unknown colony level slot: ${id}`);
  const { present = COLONY_LEVEL_ART_FILES_PRESENT_V188, ImageCtor = globalThis.Image } = options;
  const w = options.w || entry.width, h = options.h || entry.height, y = bottom - h;
  const picture = slotImage(id, present, ImageCtor);
  ctx.save();
  try {
    if (picture) { ctx.drawImage(picture, x, y, w, h); drawSlotOverlay(ctx, id, x, y, w, h, options); return 'image'; }
    drawSlotPrimitive(ctx, id, x, y, w, h, options); drawSlotOverlay(ctx, id, x, y, w, h, options);
    return 'primitive';
  } finally { ctx.restore(); }
}

const label = (ctx, text, x, y, color = '#d8e2da', size = 9) => {
  ctx.fillStyle = color; ctx.font = `700 ${size}px ui-monospace, monospace`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x, y);
};
function drawSlotPrimitive(ctx, id, x, y, w, h, o) {
  switch (id) {
    case 'colony-qz17-04-container': {
      ctx.fillStyle = '#5b4a2e'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#2a2116'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 8; i < w - 8; i += 12) ctx.fillRect(x + i, y + 6, 3, h - 12);
      ctx.fillStyle = '#0a0b0b'; ctx.fillRect(x + w * .35, y + 10, w * .5, h - 14); // the open mouth
      ctx.fillStyle = '#6b5a38'; ctx.beginPath(); ctx.moveTo(x + w * .85, y + 10); ctx.lineTo(x + w + 26, y + 20); ctx.lineTo(x + w + 26, y + h - 8); ctx.lineTo(x + w * .85, y + h - 4); ctx.fill(); // bent door
      ctx.fillStyle = 'rgba(40,44,34,.9)'; ctx.beginPath(); ctx.ellipse(x + w * .6, y + h, w * .4, 6, 0, 0, Math.PI * 2); ctx.fill(); // resin on the sill
      break;
    }
    case 'colony-warehouse-shutter': {
      const closed = Math.max(0, Math.min(1, Number(o.progress) || 0));
      ctx.fillStyle = '#111416'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#6d7376'; ctx.fillRect(x, y, w, h * closed);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let yy = y + 6; yy < y + h * closed; yy += 8) ctx.fillRect(x, yy, w, 2);
      ctx.fillStyle = '#c9a54a'; ctx.fillRect(x - 4, y - 6, w + 8, 6);
      ctx.fillStyle = '#20272a'; ctx.fillRect(x + w + 6, y + h - 74, 22, 30); ctx.fillStyle = closed >= 1 ? '#7dff9a' : '#e15b4f'; ctx.fillRect(x + w + 13, y + h - 66, 8, 8);
      break;
    }
    case 'colony-airlock-weld': {
      const p = Math.max(0, Math.min(1, Number(o.progress) || 0));
      ctx.fillStyle = 'rgba(20,16,12,.55)'; ctx.fillRect(x + w / 2 - 5, y + 6, 10, h - 12);
      const top = y + 6, len = (h - 12) * p;
      ctx.fillStyle = '#d8792c'; ctx.fillRect(x + w / 2 - 3, top, 6, len);
      ctx.fillStyle = '#ffe2a0'; ctx.fillRect(x + w / 2 - 1, top, 2, len);
      if (p >= 1) { ctx.fillStyle = 'rgba(70,58,44,.9)'; for (let yy = top; yy < top + len; yy += 14) ctx.fillRect(x + w / 2 - 7, yy, 14, 4); }
      break;
    }
    case 'colony-sentry-ua571c': {
      const f = o.facing || 1, cx = x + w / 2;
      ctx.strokeStyle = '#2b2f2a'; ctx.lineWidth = 4; ctx.beginPath();
      ctx.moveTo(cx, y + 30); ctx.lineTo(x + 4, y + h); ctx.moveTo(cx, y + 30); ctx.lineTo(x + w - 4, y + h); ctx.moveTo(cx, y + 30); ctx.lineTo(cx, y + h); ctx.stroke();
      ctx.fillStyle = '#4a5144'; ctx.fillRect(cx - 18, y + 10, 36, 22);
      ctx.fillStyle = '#272b25'; ctx.fillRect(f > 0 ? cx + 18 : cx - 44, y + 17, 26, 7);
      ctx.fillStyle = '#c9a54a'; ctx.fillRect(cx - 18, y + 6, 36, 4);
      break;
    }
    case 'colony-infirmary-front': {
      ctx.fillStyle = '#d8dcd6'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#9aa29c'; ctx.fillRect(x, y + h - 30, w, 30);
      ctx.fillStyle = '#c23a33'; ctx.fillRect(x + 18, y + 18, 26, 8); ctx.fillRect(x + 27, y + 9, 8, 26);
      ctx.fillStyle = '#1c2428'; ctx.fillRect(x + 64, y + 22, w - 84, 56);
      break;
    }
    case 'colony-north-airlock': {
      ctx.fillStyle = '#2d3336'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#4a5255'; ctx.fillRect(x + 8, y + 10, w - 16, h - 10);
      ctx.fillStyle = '#c9a54a'; for (let i = 0; i < 5; i++) ctx.fillRect(x + 8 + i * ((w - 16) / 5), y + 4, (w - 16) / 10, 4);
      ctx.fillStyle = '#20262a'; ctx.fillRect(x + w / 2 - 1, y + 10, 2, h - 10);
      break;
    }
    case 'colony-scanner-arch': {
      ctx.fillStyle = '#3a4448'; ctx.fillRect(x, y, 14, h); ctx.fillRect(x + w - 14, y, 14, h); ctx.fillRect(x, y, w, 16);
      const tone = o.tone === 'alarm' ? 'rgba(225,91,79,.35)' : o.tone === 'clear' ? 'rgba(125,255,154,.25)' : 'rgba(143,179,168,.12)';
      ctx.fillStyle = tone; ctx.fillRect(x + 14, y + 16, w - 28, h - 16);
      break;
    }
    case 'colony-heat-exchanger': {
      ctx.fillStyle = '#3b3530'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#5b4f45'; for (let yy = y + 8; yy < y + h - 8; yy += 10) ctx.fillRect(x + 8, yy, w - 16, 5);
      ctx.fillStyle = 'rgba(40,44,34,.75)'; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.quadraticCurveTo(x + w * .3, y + h * .3, x + w * .6, y + h); ctx.fill();
      break;
    }
    case 'colony-nest-resin': {
      const burnt = o.burnt === true;
      ctx.fillStyle = burnt ? '#1b1712' : '#2a2c24';
      ctx.beginPath(); ctx.moveTo(x, y + h); ctx.quadraticCurveTo(x + w * .2, y, x + w * .5, y + h * .2); ctx.quadraticCurveTo(x + w * .8, y, x + w, y + h); ctx.fill();
      ctx.fillStyle = burnt ? '#2a221a' : '#4b4a3a';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(x + 30 + i * 46, y + h - 34 - (i % 2) * 18, 12, 24, 0, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'colony-breaker': {
      ctx.fillStyle = '#2a3034'; ctx.fillRect(x, y, w, h); ctx.fillStyle = o.done ? '#7dff9a' : '#e15b4f'; ctx.fillRect(x + w / 2 - 4, y + 8, 8, 8);
      ctx.fillStyle = '#9aa29c'; ctx.fillRect(x + w / 2 - 3, o.done ? y + 22 : y + 30, 6, 14);
      break;
    }
    case 'colony-restart-console': {
      ctx.fillStyle = '#20272a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = o.done ? '#0c2a14' : '#06140b'; ctx.fillRect(x + 6, y + 6, w - 12, h - 26);
      ctx.fillStyle = o.ready ? '#7dff9a' : '#5a6a5f'; ctx.fillRect(x + 10, y + h - 16, w - 20, 6);
      break;
    }
    case 'colony-cocoon-elu': {
      ctx.fillStyle = o.freed ? 'rgba(42,44,36,.55)' : '#2e3027';
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
      if (!o.freed) { ctx.fillStyle = '#6b5d4b'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 24, 9, 11, 0, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'colony-cult-sign': ctx.fillStyle = '#2a201b'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#9b2f28'; ctx.fillRect(x + 4, y + h - 8, w - 8, 3); break;
    case 'colony-airlock-log': ctx.fillStyle = '#20272a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#06140b'; ctx.fillRect(x + 4, y + 4, w - 8, h - 8); break;
    case 'colony-tampered-seal': ctx.fillStyle = '#3a4448'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#d06b2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + w - 4, y + h - 4); ctx.stroke(); break;
    case 'colony-utility-grate-sealed': case 'colony-roof-hatch-sealed': {
      // Frame, bars and weld beads; amber/black hazard band at hand height (no text: the prompt explains it).
      ctx.fillStyle = '#2a3133'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#596468'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      ctx.strokeStyle = '#7b878a'; ctx.lineWidth = 2;
      if (id === 'colony-utility-grate-sealed') for (let bx = x + 8; bx < x + w - 4; bx += 8) { ctx.beginPath(); ctx.moveTo(bx, y + 4); ctx.lineTo(bx, y + h - 4); ctx.stroke(); }
      else { ctx.fillStyle = '#3b4447'; ctx.fillRect(x + 6, y + 10, w - 12, h - 20); ctx.strokeStyle = '#8e8a6a'; ctx.beginPath(); ctx.moveTo(x + 4, y + h * .45); ctx.lineTo(x + w - 4, y + h * .55); ctx.moveTo(x + 4, y + h * .55); ctx.lineTo(x + w - 4, y + h * .45); ctx.stroke(); }
      for (let yy = y + 10; yy < y + h - 6; yy += 22) { ctx.fillStyle = '#e0a33a'; ctx.fillRect(x + 1, yy, 4, 9); ctx.fillRect(x + w - 5, yy + 11, 4, 9); }
      const band = y + h - 70; for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#1b1d1c' : '#d5a531'; ctx.fillRect(x + i * w / 4, band, w / 4, 10); }
      break;
    }
    case 'colony-lore-cache': ctx.fillStyle = '#4a3a28'; ctx.fillRect(x, y + 6, w, h - 6); ctx.fillStyle = '#2b2219'; ctx.fillRect(x + 6, y, w - 12, 8); break;
    case 'colony-npc-noor': case 'colony-npc-lucia': {
      const coat = id === 'colony-npc-noor' ? '#d9dcd2' : '#c6d3d6';
      ctx.fillStyle = '#5b4535'; ctx.beginPath(); ctx.arc(x + w / 2, y + 10, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = coat; ctx.fillRect(x + w / 2 - 12, y + 20, 24, 44);
      ctx.fillStyle = '#2b3236'; ctx.fillRect(x + w / 2 - 10, y + 64, 8, h - 64); ctx.fillRect(x + w / 2 + 2, y + 64, 8, h - 64);
      break;
    }
    default: ctx.fillStyle = '#333'; ctx.fillRect(x, y, w, h);
  }
}
/** Native text and live indicators, drawn after the image or the primitive. */
function drawSlotOverlay(ctx, id, x, y, w, h, o) {
  if (id === 'colony-qz17-04-container') label(ctx, 'QZ17-04', x + 6, y + 14, '#e2b53a');
  else if (id === 'colony-warehouse-shutter') label(ctx, 'ENTREPÔT DU QUAI', x + 4, y - 9, '#e2b53a');
  else if (id === 'colony-north-airlock') label(ctx, o.text || 'SAS B · MUR NORD', x - 4, y - 6, '#e2b53a');
  else if (id === 'colony-infirmary-front') label(ctx, 'INFIRMERIE', x + 64, y + 16, '#c23a33');
  else if (id === 'colony-sentry-ua571c' && Number.isFinite(o.ammo)) label(ctx, String(Math.max(0, Math.round(o.ammo))).padStart(3, '0'), x + w / 2 - 10, y + 2, '#e15b4f');
  else if (id === 'colony-cult-sign') label(ctx, 'LES ÉLUS', x + 10, y + 26, '#d3b8a0', 12);
  else if (id === 'colony-airlock-log' && o.text) label(ctx, o.text, x + 6, y + 24, '#7dff9a', 8);
  else if (id === 'colony-npc-noor') label(ctx, 'NOOR OKAFOR', x - 18, y - 6, '#cfe0d2');
  else if (id === 'colony-npc-lucia') label(ctx, 'LUCIA FERRO', x - 16, y - 6, '#cfe0d2');
  else if (id === 'colony-restart-console') label(ctx, 'PROCESSEUR', x + 8, y + 18, '#7dff9a', 8);
  else if (id === 'colony-scanner-arch') label(ctx, 'CONTRÔLE BIO', x + 4, y - 6, '#8fb3a8');
}

/** One colonist of the reused survivors sheet; a silhouette while the sheet loads. */
export function drawColonyCivilianV188(ctx, { x, feetY, row = 0, pose = 'idle', facing = 1, tint = null } = {}, { ImageCtor = globalThis.Image } = {}) {
  const sheet = COLONY_CIVILIAN_SHEET_V188, column = { idle: 0, walk: 1, cower: 2, run: 3 }[pose] ?? 0;
  const picture = image(sheet.path, ImageCtor), size = sheet.draw, top = feetY - size + sheet.feetInset;
  ctx.save();
  try {
    if (picture) {
      if (facing < 0) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
      ctx.drawImage(picture, column * sheet.cell, (row % sheet.rows) * sheet.cell, sheet.cell, sheet.cell, x - size / 2, top, size, size);
      if (tint) { ctx.globalAlpha = .18; ctx.fillStyle = tint; ctx.fillRect(x - 16, top + 30, 32, size - 40); }
      return 'image';
    }
    ctx.fillStyle = tint || '#8b8f86'; ctx.beginPath(); ctx.arc(x, feetY - 82, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 11, feetY - 72, 22, 40); ctx.fillRect(x - 10, feetY - 32, 8, 32); ctx.fillRect(x + 2, feetY - 32, 8, 32);
    return 'primitive';
  } finally { ctx.restore(); }
}

/** The M577 at the quay (C3), to scale (owner decision 2026-11-22, round 2: 8.8 m [À VÉRIFIER] ≈ 449 px, m577-scale-v188.js):
 *  `centre` is the hull centre, wheels on `bottom`. Scenery: it brought the survivors, nobody drives it. */
export const COLONY_C3_M577_V188 = Object.freeze({ w: M577_SCALE_V188.w, drawnHeight: M577_SCALE_V188.drawnHeight, facing: -1, layer: 'world-back-wall', drivable: false });
export function drawColonyM577V188(ctx, centre, bottom, facing = COLONY_C3_M577_V188.facing) { drawM577TransportV188(ctx, centre - COLONY_C3_M577_V188.w / 2, bottom, facing); }

/** Welding sparks: deterministic from time and seed, never stored. */
export function drawWeldSparksV188(ctx, x, y, time = 0, intensity = 1) {
  ctx.save();
  for (let i = 0; i < 10 * intensity; i++) {
    const a = (i * 2.399 + time * 9) % (Math.PI * 2), r = 6 + ((i * 37 + Math.floor(time * 40)) % 22);
    ctx.fillStyle = i % 3 ? '#ffd27a' : '#fff4d0';
    ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r * .6 + r * .3, 2, 2);
  }
  ctx.fillStyle = 'rgba(255,220,150,.35)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** A guide light of the lit return route (C2). */
export function drawGuideLightV188(ctx, x, y, time = 0, index = 0) {
  const on = (Math.floor(time * 3) - index) % 6 === 0;
  ctx.save(); ctx.fillStyle = on ? '#ffd27a' : '#8a6a2a'; ctx.fillRect(x - 6, y - 4, 12, 4);
  if (on) { ctx.fillStyle = 'rgba(255,210,122,.18)'; ctx.beginPath(); ctx.arc(x, y - 2, 18, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
