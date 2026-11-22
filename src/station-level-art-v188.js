// V188 — named art slots of the dedicated Asphodèle station levels S1-S4 (bible §7.2,
// §7.4, §42; spec 009). No image was generated for this lot. A slot either reuses an
// inspected PNG already admitted by the Asphodèle hub (`source`, drawn through the
// hub loader with its measured source window) or stays a Canvas placeholder. A
// placeholder slot becomes an image only when a PNG is committed at its path AND the
// id is listed in STATION_LEVEL_ART_FILES_PRESENT_V188. Logical boxes follow the
// project scale, 1 m ≈ 51 px (marine 44 × 92 px).
//
// fidelity: 'documented' (look seen in a cited work), 'adapted' (project adaptation of
// a documented element), 'to-define'. Asphodèle, CASSIUS, Echo-8, Kessler, Grue and
// Crucible are project creations; no slot claims a 1:1 franchise fidelity.
import { ASPHODELE_HUB_IMAGE_SOURCE_RECTS_V188, ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188, getAsphodeleHubSlotV188, ASPHODELE_HUB_FILES_PRESENT_V188 } from './asphodele-hub-slots-v188.js';
import { ASPHODELE_MISSION_IMAGE_SOURCE_RECTS_V188 } from './asphodele-mission-dressing-v188.js';

export const STATION_LEVEL_ART_ROOT_V188 = '/assets/asphodele/levels/v188/';
const slot = (id, layer, width, height, purpose, fidelity, source = null) => Object.freeze({ id, layer, width, height, purpose, fidelity, source,
  path: source ? getAsphodeleHubSlotV188(source)?.path || null : `${STATION_LEVEL_ART_ROOT_V188}${id}.png`, status: source ? 'reused-png' : 'placeholder' });

export const STATION_LEVEL_ART_SLOTS_V188 = Object.freeze([
  // —— Reused, inspected PNGs of the Asphodèle hub (spec 007, §7.9) ——
  slot('station-echo8-dropship', 'wall', 360, 180, 'S1: Echo-8’s UD-4L still docked at the collar, seen through the collar window (reuses the docked UD-4L image).', 'adapted', 'asph-ud4l-docked'),
  slot('station-echo8-barricade', 'wall', 281, 132, 'S1, S3: Echo-8 barricade (welded door, sandbags, chalk); the chalk count is drawn by the game.', 'adapted', 'asph-echo8-barricade'),
  slot('station-cassius-core', 'wall', 160, 200, 'S2: CASSIUS core on the control deck, green CRT wall, one waveform, no face.', 'adapted', 'asph-cassius-core'),
  slot('station-control-map', 'wall', 240, 150, 'S1, S4: QZ network map console of the control deck.', 'to-define', 'asph-qz-map'),
  slot('station-qz17-cradles', 'floor', 402, 76, 'S3: open QZ17 cradles of the transit laboratory, restraints cut.', 'adapted', 'asph-cradles'),
  slot('station-pressure-valve', 'wall', 153, 102, 'S4: sector pressure gauges and valve wheel (one per sector to repressurise).', 'to-define', 'asph-msn-gauge'),
  slot('station-nest-resin', 'wall', 153, 102, 'S4: the last resin nest over a sealed hatch of the junction.', 'documented', 'asph-msn-resin'),
  slot('station-technician', 'actor', 44, 89, 'S4: technicians of the Tantalus arriving at the dock (reused station technician figure).', 'to-define', 'asph-npc-technician'),
  slot('station-salvager', 'actor', 44, 89, 'S1: Grue’s salvagers at the cargo bulkhead (reused Crucible merchant figure).', 'to-define', 'asph-npc-merchant'),
  slot('station-grue', 'actor', 52, 92, 'S4: Grue, when the salvagers are allied.', 'to-define', 'asph-grue'),
  // —— Canvas placeholders (no image) ——
  slot('station-manual-crank', 'wall', 46, 61, 'S1: manual cycling crank of the docking airlock, beside the door (0.9 × 1.2 m).', 'adapted'),
  slot('station-ventilation-fan', 'wall', 102, 102, 'S1: running ventilation fan whose moving air saturates the motion tracker (2 × 2 m).', 'adapted'),
  slot('station-chalk-marks', 'wall', 61, 41, 'S1, S3: Echo-8 chalk marks counting the hours (1.2 × 0.8 m).', 'to-define'),
  slot('station-sector-breaker', 'wall', 31, 51, 'S2: sector breaker box restored with Idris Kwan on the radio (0.6 × 1 m).', 'to-define'),
  slot('station-reactor-restart', 'wall', 76, 64, 'S2: auxiliary reactor restart panel on the reactor deck (1.5 × 1.25 m).', 'to-define'),
  slot('station-airlock3-seal', 'door', 64, 132, 'S3: CASSIUS seal over airlock 3 (lamp, stencil; door height).', 'adapted'),
  slot('station-xeno-egg', 'floor', 41, 46, 'S3: an egg of the transit laboratory, closed, opening or spent (0.8 × 0.9 m).', 'documented'),
  slot('station-survivor-log', 'wall', 41, 41, 'S3: survivors’ log terminal, entries stop on day four (0.8 m).', 'to-define'),
  slot('station-kessler-tag', 'floor', 20, 12, 'S3: Sergeant Dario Kessler’s tag and the team’s last recording (0.4 m).', 'to-define'),
  slot('station-power-router', 'wall', 76, 72, 'S3: power routing panel, three circuits for two feeds (1.5 × 1.4 m).', 'to-define')
]);
export const STATION_LEVEL_ART_SLOT_IDS_V188 = Object.freeze(STATION_LEVEL_ART_SLOTS_V188.map(entry => entry.id));
/** Placeholder slots with an authored PNG physically present (none yet). */
export const STATION_LEVEL_ART_FILES_PRESENT_V188 = Object.freeze([]);
/** Hub PNGs this lot reuses (each one is admitted by the hub loader). */
export const STATION_LEVEL_REUSED_PNGS_V188 = Object.freeze(STATION_LEVEL_ART_SLOTS_V188.filter(entry => entry.source).map(entry => entry.source));
export const stationLevelArtSlotV188 = id => STATION_LEVEL_ART_SLOTS_V188.find(entry => entry.id === id) || null;

function sourceRectOf(source) {
  if (ASPHODELE_HUB_IMAGE_SOURCE_RECTS_V188[source]) return ASPHODELE_HUB_IMAGE_SOURCE_RECTS_V188[source];
  if (ASPHODELE_MISSION_IMAGE_SOURCE_RECTS_V188[source]) return ASPHODELE_MISSION_IMAGE_SOURCE_RECTS_V188[source];
  const actor = ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188[source];
  return actor ? actor.frames[0].rect : null;
}

/** Draws a slot into its box (feet on `bottom`): the reused PNG when loaded, the primitive otherwise. */
export function drawStationLevelSlotV188(ctx, loader, id, x, bottom, options = {}) {
  const entry = stationLevelArtSlotV188(id);
  if (!entry) throw new Error(`Unknown station level slot: ${id}`);
  const w = options.w || entry.width, h = options.h || entry.height, y = bottom - h;
  let source = 'primitive';
  ctx.save();
  try {
    if (entry.source && loader && ASPHODELE_HUB_FILES_PRESENT_V188.includes(entry.source)) {
      source = loader.draw(ctx, entry.source, x, y, w, h, () => drawSlotPrimitive(ctx, id, x, y, w, h, options),
        { fit: 'contain', sourceRect: sourceRectOf(entry.source), alignY: 1 });
    } else drawSlotPrimitive(ctx, id, x, y, w, h, options);
    drawSlotOverlay(ctx, id, x, y, w, h, options);
    return source;
  } finally { ctx.restore(); }
}

const label = (ctx, text, x, y, color = '#d8e2da', size = 9) => {
  ctx.fillStyle = color; ctx.font = `700 ${size}px ui-monospace, monospace`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x, y);
};
function figure(ctx, x, y, w, h, coat, accent) {
  ctx.fillStyle = coat; ctx.fillRect(x + w * .25, y + h * .2, w * .5, h * .5); ctx.fillRect(x + w * .28, y + h * .68, w * .18, h * .32); ctx.fillRect(x + w * .54, y + h * .68, w * .18, h * .32);
  ctx.fillStyle = '#c9a98a'; ctx.beginPath(); ctx.arc(x + w / 2, y + h * .11, w * .17, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = accent; ctx.fillRect(x + w * .25, y + h * .42, w * .5, 4);
}
function drawSlotPrimitive(ctx, id, x, y, w, h, o) {
  switch (id) {
    case 'station-echo8-dropship': {
      ctx.fillStyle = '#0a0d0f'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#3e4a3a'; ctx.beginPath(); ctx.moveTo(x + 30, y + h * .6); ctx.lineTo(x + w * .7, y + h * .35);
      ctx.lineTo(x + w - 20, y + h * .5); ctx.lineTo(x + w * .7, y + h * .75); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#2b3136'; ctx.lineWidth = 8; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8); break;
    }
    case 'station-echo8-barricade': {
      ctx.fillStyle = '#3a3f40'; ctx.fillRect(x + w * .55, y, w * .4, h); ctx.fillStyle = '#6b5a3a'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 8 + i * 34, y + h - 26 - (i % 2) * 18, 32, 26 + (i % 2) * 18);
      ctx.fillStyle = '#4a4436'; ctx.fillRect(x, y + h - 20, w * .55, 20); break;
    }
    case 'station-cassius-core': {
      ctx.fillStyle = '#121a19'; ctx.fillRect(x, y, w, h);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { ctx.fillStyle = '#06140b'; ctx.fillRect(x + 10 + c * 74, y + 12 + r * 62, 66, 52); }
      break;
    }
    case 'station-control-map': { ctx.fillStyle = '#10181a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#06140b'; ctx.fillRect(x + 14, y + 12, w - 28, h - 40); break; }
    case 'station-qz17-cradles': {
      for (let i = 0; i < 3; i++) { const cx = x + i * (w / 3); ctx.fillStyle = '#9aa7ab'; ctx.fillRect(cx + 6, y + 20, w / 3 - 12, h - 20); ctx.fillStyle = '#1a2224'; ctx.fillRect(cx + 14, y + 26, w / 3 - 28, h - 34);
        ctx.fillStyle = '#c7d2d6'; ctx.fillRect(cx + 6, y, w / 3 - 12, 8); }
      break;
    }
    case 'station-pressure-valve': { ctx.fillStyle = '#121a1d'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#8fb3a8'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + 30 + i * 46, y + 56, 16, 0, Math.PI * 2); ctx.stroke(); } break; }
    case 'station-nest-resin': {
      ctx.fillStyle = '#2a2a24'; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.quadraticCurveTo(x + w * .3, y + 10, x + w * .55, y + h); ctx.quadraticCurveTo(x + w * .8, y + 20, x + w, y + h); ctx.fill();
      ctx.fillStyle = 'rgba(70,76,60,.8)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(x + 30 + i * 46, y + h - 34, 13, 26, 0, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'station-technician': figure(ctx, x, y, w, h, '#556066', '#e0a33a'); break;
    case 'station-salvager': figure(ctx, x, y, w, h, '#5b4630', '#e0873a'); break;
    case 'station-grue': figure(ctx, x, y, w, h, '#4b4a3c', '#c9a54a'); break;
    case 'station-manual-crank': {
      ctx.fillStyle = '#20272a'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#c9a54a'; ctx.lineWidth = 4;
      const a = (Number(o.progress) || 0) * Math.PI * 8; ctx.beginPath(); ctx.moveTo(x + w / 2, y + h / 2); ctx.lineTo(x + w / 2 + Math.cos(a) * 16, y + h / 2 + Math.sin(a) * 16); ctx.stroke(); break;
    }
    case 'station-ventilation-fan': {
      ctx.fillStyle = '#15191b'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#3d4649'; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
      const a = (Number(o.time) || 0) * 9, cx = x + w / 2, cy = y + h / 2; ctx.fillStyle = '#4d5659';
      for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, w * .4, b, b + .5); ctx.closePath(); ctx.fill(); }
      break;
    }
    case 'station-chalk-marks': { ctx.strokeStyle = 'rgba(230,226,210,.85)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x + 6 + i * 8, y + 8); ctx.lineTo(x + 6 + i * 8, y + h - 10); ctx.stroke(); } break; }
    case 'station-sector-breaker': { ctx.fillStyle = '#2a3236'; ctx.fillRect(x, y, w, h); ctx.fillStyle = o.done ? '#7dff9a' : '#e15b4f'; ctx.fillRect(x + w / 2 - 4, y + 8, 8, 8); ctx.fillStyle = '#c9a54a'; ctx.fillRect(x + 8, y + (o.done ? 22 : 34), w - 16, 6); break; }
    case 'station-reactor-restart': { ctx.fillStyle = '#20272a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#06140b'; ctx.fillRect(x + 8, y + 8, w - 16, 24); ctx.fillStyle = o.done ? '#7dff9a' : '#e2b53a'; ctx.fillRect(x + 10, y + 40, (w - 20) * Math.max(0, Math.min(1, Number(o.progress) || 0)), 8); break; }
    case 'station-airlock3-seal': { ctx.fillStyle = 'rgba(225,91,79,.25)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#e15b4f'; ctx.fillRect(x + w / 2 - 6, y - 10, 12, 8); break; }
    case 'station-xeno-egg': {
      const state = o.state || 'closed';
      ctx.fillStyle = state === 'spent' ? '#3a3a30' : '#5b5a48'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * .55, w * .45, h * .45, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = state === 'opening' ? '#d5c56a' : '#2a2a20'; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; ctx.moveTo(x + w / 2, y + h * .2); ctx.lineTo(x + w / 2 + Math.cos(a) * w * .3, y + h * .2 + Math.sin(a) * 8 + (state === 'closed' ? 0 : -6)); } ctx.stroke();
      if (o.burnt) { ctx.fillStyle = 'rgba(20,12,8,.7)'; ctx.fillRect(x, y + h * .2, w, h * .8); }
      break;
    }
    case 'station-survivor-log': { ctx.fillStyle = '#20272a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#06140b'; ctx.fillRect(x + 4, y + 4, w - 8, h - 14); break; }
    case 'station-kessler-tag': { ctx.fillStyle = '#b8b8ae'; ctx.fillRect(x, y + 2, w - 6, h - 4); ctx.strokeStyle = '#8a8a80'; ctx.beginPath(); ctx.moveTo(x + w - 6, y + h / 2); ctx.lineTo(x + w, y); ctx.stroke(); break; }
    case 'station-power-router': {
      ctx.fillStyle = '#20272a'; ctx.fillRect(x, y, w, h);
      ['airlock', 'lights', 'vents'].forEach((key, index) => { ctx.fillStyle = (o.routes || []).includes(key) ? '#7dff9a' : '#3a4448'; ctx.fillRect(x + 10 + index * 20, y + 14, 14, 30); });
      break;
    }
    default: break;
  }
}
/** Native overlays: text and changing indicators, after either the PNG or the placeholder. */
function drawSlotOverlay(ctx, id, x, y, w, h, o) {
  if (id === 'station-echo8-barricade' || id === 'station-chalk-marks') {
    if (o.text) label(ctx, o.text, x + 6, y + 14, '#e6e2d2', 9);
  }
  if (id === 'station-cassius-core') {
    const t = Number(o.time) || 0; ctx.strokeStyle = o.awake ? '#7dff9a' : 'rgba(125,255,154,.25)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const px = x + 14 + i * (w - 28) / 40, py = y + h * .5 + Math.sin(i * .7 + t * 6) * (o.awake ? 10 : 2); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); label(ctx, 'CASSIUS', x + 8, y + h - 8, '#7dff9a', 9);
  }
  if (id === 'station-sector-breaker' && o.text) label(ctx, o.text, x - 4, y - 4, '#d8e2da', 8);
  if (id === 'station-pressure-valve') label(ctx, o.done ? 'PRESSION OK' : 'DÉPRESSURISÉ', x + 10, y + 18, o.done ? '#7dff9a' : '#e15b4f', 9);
  if (id === 'station-airlock3-seal') label(ctx, o.text || 'SAS 3 · QUARANTAINE', x - 30, y - 14, '#e15b4f', 9);
  if (id === 'station-survivor-log') label(ctx, 'J4', x + 8, y + 20, '#7dff9a', 9);
  if (id === 'station-power-router') label(ctx, 'SAS · ÉCL · VENT', x + 2, y + h - 8, '#d8e2da', 7);
}
