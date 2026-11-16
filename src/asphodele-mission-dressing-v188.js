// V188 — Asphodèle station dressing for the station side missions, the local
// contracts and the night mission (spec 007 follow-up; bible §7.2, §39.2).
// Same contract as `qz17-level-dressing-v188.js`: a coherence overlay applied
// only to the Asphodèle campaigns (`isAsphodeleCampaignV188`); the shared ship
// template (mission-levels-v52.js) and every other mission built from it are left
// untouched. Nothing here changes geometry, enemies, pickups or objectives: it
// draws a background layer, before covers, doors and actors.
//
// What the overlay draws, once the level is built:
// - on each structural deck, a station wall rhythm every 6 m (1 m ≈ 51 px):
//   riveted Seegson panels, CRT status boxes, cable trays and station signs
//   (« ASPHODÈLE · ANNEAU / RAYON / MOYEU / PONTS INFÉRIEURS »), with a hazard band
//   at the wall base that stops at every door, ladder, lift and vent;
// - one feature per mission (black-box racks, resin warning, salvage, pressure
//   gauges, surveillance camera), placed on the widest clear stretch.
// Documented look, cited only: the corridors of Sevastopol in Alien: Isolation
// (2014) — riveted plating, yellow-black bands, CRT boxes — and the operations
// room of Hadley's Hope in Aliens (1986) for the monitor banks. Adaptation:
// Asphodèle is a Seegson QZ relay station (project creation). To define: final art
// behind the `asph-msn-*` slots. No claim of 1:1 fidelity; placeholders in Canvas
// primitives, no generated image. Sizes [PROPOSÉ].
import { isAsphodeleCampaignV188, asphodeleContractKeyV188 } from './asphodele-missions-v188.js';
import { AsphodeleHubAssetLoaderV188 } from './asphodele-hub-slots-v188.js';

export const ASPHODELE_MISSION_PX_PER_METRE_V188 = 51;
/** [PROPOSÉ] sizes in px from 51 px/m. */
export const ASPHODELE_MISSION_SIZES_V188 = Object.freeze({
  panel: Object.freeze({ w: 128, h: 112 }), // 2.5 × 2.2 m riveted wall panel
  crt: Object.freeze({ w: 51, h: 41 }), // 1.0 × 0.8 m CRT status box
  sign: Object.freeze({ w: 153, h: 26 }), // 3.0 × 0.5 m station sign
  conduit: Object.freeze({ w: 306, h: 12 }), // 6 m cable tray
  feature: Object.freeze({ w: 153, h: 102 }) // 3.0 × 2.0 m mission feature
});
export const ASPHODELE_MISSION_RHYTHM_PX_V188 = 306; // a rib every 6 m, as in the hub walls
const CLEARANCE = 18; // px kept free on each side of a door, ladder, lift or vent
export const ASPHODELE_MISSION_CEILING_Y_V188 = 110; // nothing is drawn above the top of the level band

/** Feature slot per mission (side missions by id, contracts by key). */
const FEATURE_BY_CAMPAIGN = Object.freeze({
  'station-a-echo8': 'blackbox', 'station-a-sonde': 'blackbox', 'station-a-grue': 'salvage', 'station-a-journaux': 'camera',
  'station-a-hydro': 'gauge', 'station-a-cassius': 'camera', 'station-a-bishop': 'camera'
});
const FEATURE_BY_KEY = Object.freeze({ 'relay-drift': 'blackbox', vents: 'resin', nest: 'resin', night: 'resin', wreck: 'salvage', synthetic: 'salvage', module: 'gauge' });
export function asphodeleMissionFeatureV188(campaignId) {
  return FEATURE_BY_CAMPAIGN[campaignId] || FEATURE_BY_KEY[asphodeleContractKeyV188(campaignId)] || null;
}
/** Sector named on the signs, by mission [PROPOSÉ]. */
const SECTOR = Object.freeze({ 'station-a-grue': 'ring', 'station-a-hydro': 'ring', 'station-a-journaux': 'ring', 'station-a-echo8': 'lower', 'station-a-cassius': 'hub', 'station-a-bishop': 'hub', 'station-a-sonde': 'ring',
  'station-c-conduits': 'spoke', 'station-c-relais': 'hub', 'station-c-epave': 'ring', 'station-c-pression': 'spoke', 'station-c-nid': 'lower', 'station-c-synthetique': 'lower', 'orig-asphodele-2': 'lower' });
const SECTOR_TEXT = Object.freeze({ ring: ['ANNEAU EXTÉRIEUR', 'OUTER RING'], spoke: ['RAYON A', 'SPOKE A'], hub: ['MOYEU', 'HUB'], lower: ['PONTS INFÉRIEURS', 'LOWER DECKS'] });
export const asphodeleMissionSectorV188 = campaignId => SECTOR[campaignId] || 'ring';

/** Exclusion spans [x0, x1] of the level: doors, ladders, lifts and vents, with clearance. */
export function asphodeleMissionExclusionsV188({ doors = [], ladders = [], lifts = [], vents = [] } = {}) {
  const spans = [];
  for (const door of doors) if (Number.isFinite(door?.x) && Number.isFinite(door?.w)) spans.push([door.x - CLEARANCE, door.x + door.w + CLEARANCE, door.y, (door.y ?? 0) + (door.h ?? 0)]);
  for (const ladder of ladders) if (Number.isFinite(ladder?.x)) spans.push([ladder.x - (ladder.w || 42) / 2 - CLEARANCE, ladder.x + (ladder.w || 42) / 2 + CLEARANCE, ladder.top, ladder.bottom]);
  for (const lift of lifts) if (Number.isFinite(lift?.x)) spans.push([lift.x - CLEARANCE, lift.x + (lift.w || 120) + CLEARANCE, lift.topY, lift.baseY]);
  for (const vent of vents) if (Number.isFinite(vent?.x) && Number.isFinite(vent?.w)) spans.push([vent.x - CLEARANCE, vent.x + vent.w + CLEARANCE, vent.y, (vent.y ?? 0) + (vent.h ?? 0)]);
  return spans;
}
const overlaps = (spans, x0, x1, top, bottom) => spans.some(([s0, s1, st, sb]) => x0 < s1 && x1 > s0
  && !(Number.isFinite(st) && Number.isFinite(sb) && (sb < top || st > bottom)));

/**
 * The layout of the overlay from the level geometry: decks (structural platforms
 * at least 240 px wide), per-deck wall props on a 6 m rhythm clear of every
 * exclusion, base hazard segments and one mission feature.
 */
export function asphodeleMissionLayoutV188({ platforms = [], doors = [], ladders = [], lifts = [], vents = [] } = {}, campaignId = null) {
  const doorSpans = asphodeleMissionExclusionsV188({ doors, ladders, lifts, vents });
  // Structural surfaces (lift cabins excluded); co-planar pieces (a node deck and its steps) merge into one floor run.
  const surfaces = platforms.filter(entry => entry && entry.art !== 'drop' && entry.kind !== 'lift' && [entry.x, entry.y, entry.w].every(Number.isFinite) && entry.w > 0)
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const runs = [];
  for (const entry of surfaces) {
    const run = runs.find(item => Math.abs(item.y - entry.y) <= 2 && entry.x <= item.x + item.w + 8 && entry.x + entry.w >= item.x - 8);
    if (run) { const x1 = Math.max(run.x + run.w, entry.x + entry.w); run.x = Math.min(run.x, entry.x); run.w = x1 - run.x; }
    else runs.push({ x: entry.x, y: entry.y, w: entry.w });
  }
  const decks = runs.filter(entry => entry.w >= 240);
  const props = [], bands = [], { panel, crt, sign, conduit, feature } = ASPHODELE_MISSION_SIZES_V188;
  let best = null;
  decks.forEach((deck, deckIndex) => {
    const bottom = deck.y, x0 = deck.x + 24, x1 = deck.x + deck.w - 24;
    // A surface above the deck is an exclusion too: a wall prop never shows through a deck over it.
    const spans = [...doorSpans, ...surfaces.filter(entry => entry.y < deck.y - 2).map(entry => [entry.x, entry.x + entry.w, entry.y, entry.y + (Number(entry.h) || 22)])];
    // Hazard band segments at the wall base, cut by every exclusion that reaches the deck.
    let start = null;
    for (let x = x0; x <= x1; x += 8) {
      const free = !overlaps(spans, x, x + 8, bottom - 40, bottom);
      if (free && start === null) start = x;
      if ((!free || x + 8 > x1) && start !== null) { if (x - start >= 24) bands.push(Object.freeze({ x: start, w: x - start, y: bottom - 10 })); start = null; }
    }
    // Wall props on a 6 m rhythm; a slot that would cover an exclusion is skipped.
    let index = 0;
    for (let x = x0 + 40; x + panel.w <= x1; x += ASPHODELE_MISSION_RHYTHM_PX_V188, index += 1) {
      const kind = ['panel', 'crt', 'sign', 'panel', 'conduit'][(index + deckIndex) % 5];
      const size = { panel, crt, sign, conduit }[kind], y = kind === 'panel' ? bottom - 40 - size.h : kind === 'crt' ? bottom - 120 : kind === 'sign' ? bottom - 196 : bottom - 214;
      const w = Math.min(size.w, x1 - x);
      if (y < ASPHODELE_MISSION_CEILING_Y_V188 || overlaps(spans, x, x + w, y, y + size.h)) continue;
      props.push(Object.freeze({ id: `asph-msn-${deckIndex}-${index}`, kind, x, y, w, h: size.h, deck: deckIndex }));
    }
    // Widest clear stretch of the deck for the feature.
    let runStart = null;
    for (let x = x0; x <= x1; x += 16) {
      const free = x + 16 <= x1 && !overlaps(spans, x, x + 16, bottom - feature.h - 40, bottom);
      if (free && runStart === null) runStart = x;
      if (!free && runStart !== null) { if (bottom - 40 - feature.h >= ASPHODELE_MISSION_CEILING_Y_V188 && (!best || x - runStart > best.w)) best = { x: runStart, w: x - runStart, bottom }; runStart = null; }
    }
  });
  const kind = asphodeleMissionFeatureV188(campaignId);
  const featureBox = kind && best && best.w >= feature.w + 40
    ? Object.freeze({ id: `asph-msn-feature-${kind}`, kind, x: Math.round(best.x + (best.w - feature.w) / 2), y: best.bottom - 40 - feature.h, w: feature.w, h: feature.h }) : null;
  // The feature takes its stretch: a wall prop under it is dropped.
  const visible = featureBox ? props.filter(entry => entry.x + entry.w <= featureBox.x || entry.x >= featureBox.x + featureBox.w || entry.y + entry.h < featureBox.y || entry.y > featureBox.y + featureBox.h) : props;
  return Object.freeze({ decks: decks.length, props: Object.freeze(visible), bands: Object.freeze(bands), feature: featureBox, sector: asphodeleMissionSectorV188(campaignId), exclusions: doorSpans });
}

export function withAsphodeleMissionDressingV188(Base) {
  if (Base.asphodeleMissionDressingV188) return Base;
  return class AsphodeleMissionDressingV188 extends Base {
    static asphodeleMissionDressingV188 = true;

    start(options = {}) {
      const campaignId = options.campaign?.id || null;
      this.asphMissionDressingActiveV188 = isAsphodeleCampaignV188(campaignId);
      const result = super.start(options);
      this.asphMissionDressingV188 = this.asphMissionDressingActiveV188
        ? asphodeleMissionLayoutV188({ platforms: this.platforms, doors: this.doors, ladders: this.ladders, lifts: this.lifts, vents: this.vents }, campaignId) : null;
      if (this.asphMissionDressingV188) { this.asphMissionLoaderV188 ||= new AsphodeleHubAssetLoaderV188(); this.asphMissionLoaderV188.preload(ASPHODELE_MISSION_SLOT_IDS_V188); }
      return result;
    }

    drawWorld(ctx) {
      const dressing = this.asphMissionDressingV188;
      if (dressing && ctx) {
        const left = (this.camera?.x || 0) - 64, right = left + 1280 + 128, english = globalThis.document?.documentElement?.lang === 'en';
        const loader = this.asphMissionLoaderV188, time = this.elapsed || this.time || 0;
        ctx.save();
        try {
          for (const band of dressing.bands) if (band.x + band.w >= left && band.x <= right) drawAsphodeleHazardBandV188(ctx, band);
          for (const entry of dressing.props) {
            if (entry.x + entry.w < left || entry.x > right) continue;
            loader.draw(ctx, `asph-msn-${entry.kind}`, entry.x, entry.y, entry.w, entry.h, () => drawAsphodeleMissionPropV188(ctx, entry, { sector: dressing.sector, english, time }));
          }
          const feature = dressing.feature;
          if (feature && feature.x + feature.w >= left && feature.x <= right)
            loader.draw(ctx, `asph-msn-${feature.kind}`, feature.x, feature.y, feature.w, feature.h, () => drawAsphodeleMissionFeatureV188(ctx, feature, { english, time }));
        } finally { ctx.restore(); }
      }
      return super.drawWorld(ctx);
    }
  };
}
export const ASPHODELE_MISSION_SLOT_IDS_V188 = Object.freeze(['asph-msn-panel', 'asph-msn-crt', 'asph-msn-sign', 'asph-msn-conduit',
  'asph-msn-blackbox', 'asph-msn-resin', 'asph-msn-salvage', 'asph-msn-gauge', 'asph-msn-camera']);

export function drawAsphodeleHazardBandV188(ctx, band) {
  for (let x = band.x; x < band.x + band.w; x += 16) { ctx.fillStyle = Math.floor((x - band.x) / 16) % 2 ? '#15171a' : '#b8933f'; ctx.fillRect(x, band.y, Math.min(16, band.x + band.w - x), 5); }
}
/** Generic station wall props (placeholders behind asph-msn-panel / crt / sign / conduit). */
export function drawAsphodeleMissionPropV188(ctx, entry, { sector = 'ring', english = false, time = 0 } = {}) {
  const { x, y, w, h } = entry;
  switch (entry.kind) {
    case 'panel': ctx.fillStyle = 'rgba(38,46,50,.88)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.fillStyle = 'rgba(150,160,150,.5)'; for (let i = 0; i < 4; i++) { ctx.fillRect(x + 6, y + 8 + i * (h - 16) / 3, 3, 3); ctx.fillRect(x + w - 9, y + 8 + i * (h - 16) / 3, 3, 3); } // rivets
      ctx.fillStyle = 'rgba(184,147,63,.65)'; ctx.fillRect(x + 14, y + h - 18, w - 28, 6); break;
    case 'crt': ctx.fillStyle = '#20272a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#06140b'; ctx.fillRect(x + 5, y + 5, w - 10, h - 14);
      ctx.fillStyle = 'rgba(125,255,154,.6)'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 9, y + 10 + i * 7, (w - 22) * (.4 + ((i * 37 + Math.floor(time)) % 5) / 8), 2); break;
    case 'sign': ctx.fillStyle = '#0e1517'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#d8e2da'; ctx.font = '700 10px ui-monospace, monospace'; ctx.textAlign = 'left';
      ctx.fillText(`ASPHODÈLE · ${SECTOR_TEXT[sector][english ? 1 : 0]}`, x + 8, y + 17); break;
    case 'conduit': ctx.fillStyle = '#2b3135'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#d06b2a'; for (let px = x + 10; px < x + w - 10; px += 40) ctx.fillRect(px, y + 2, 18, h - 4); break;
    default: break;
  }
}
/** Mission features (placeholders behind asph-msn-blackbox / resin / salvage / gauge / camera). */
export function drawAsphodeleMissionFeatureV188(ctx, feature, { english = false, time = 0 } = {}) {
  const { x, y, w, h, kind } = feature, label = (fr, en) => english ? en : fr;
  ctx.fillStyle = '#121a1d'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#3a4448'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.font = '700 9px ui-monospace, monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#d8e2da';
  if (kind === 'blackbox') { for (let i = 0; i < 3; i++) { ctx.fillStyle = '#d06b2a'; ctx.fillRect(x + 14 + i * 44, y + 30, 34, 44); ctx.fillStyle = '#111'; ctx.fillRect(x + 20 + i * 44, y + 40, 22, 6); }
    ctx.fillStyle = '#e2b53a'; ctx.fillText(label('ENREGISTREURS QZ', 'QZ RECORDERS'), x + 10, y + 18); }
  else if (kind === 'resin') { ctx.fillStyle = '#2a2a24'; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.quadraticCurveTo(x + w * .3, y + 20, x + w * .55, y + h); ctx.quadraticCurveTo(x + w * .8, y + 30, x + w, y + h); ctx.fill();
    ctx.fillStyle = '#e15b4f'; ctx.fillText(label('ACCÈS RESTREINT · BIO', 'RESTRICTED · BIO'), x + 10, y + 18); }
  else if (kind === 'salvage') { ctx.fillStyle = '#4a3a28'; ctx.fillRect(x + 12, y + 46, 61, 46); ctx.fillRect(x + 80, y + 58, 61, 34); ctx.fillStyle = '#e0873a'; ctx.fillText(label('CRUCIBLE · RÉCUPÉRATION', 'CRUCIBLE · SALVAGE'), x + 10, y + 18); }
  else if (kind === 'gauge') { for (let i = 0; i < 3; i++) { const cx = x + 30 + i * 46, cy = y + 56; ctx.strokeStyle = '#8fb3a8'; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.stroke();
      const a = -Math.PI * .75 + (i + 1) * .6 + Math.sin(time + i) * .05; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13); ctx.stroke(); }
    ctx.fillStyle = '#8fb3a8'; ctx.fillText(label('PRESSION · SECTEUR', 'PRESSURE · SECTOR'), x + 10, y + 18); }
  else if (kind === 'camera') { ctx.fillStyle = '#2b3236'; ctx.fillRect(x + w / 2 - 22, y + 34, 44, 20); ctx.fillStyle = '#e15b4f'; ctx.fillRect(x + w / 2 + 14, y + 40, 5, 5);
    ctx.fillStyle = '#06140b'; ctx.fillRect(x + 12, y + 62, w - 24, 30); ctx.fillStyle = '#7dff9a'; ctx.fillText(label('CASSIUS · SURVEILLANCE', 'CASSIUS · SURVEILLANCE'), x + 10, y + 18); }
}
