// V188 — named art slots for the Port-Méridien colony missions and the twelve
// other crew quests (colony and crew lot). Same contract as
// `insertion-asset-slots-v188.js` and `content-gap-slots-v188.js`: the original
// Canvas drawings remain available while an admitted image loads or fails.
// Only listed, committed files are requested. The scene dialog requests its
// current slot lazily; exact narrative evidence remains native Canvas text.
// Briefs describe the project's own designs (bible §6, §8, §43) and name the
// documented franchise reference they lean on; none claims a 1:1 fidelity.

export const COLONY_CREW_ASSET_ROOT_V188 = '/assets/content/v188/colony/';
const slot = (id, motif, purpose, brief, label) => Object.freeze({ id, width: 640, height: 280, motif, purpose, brief, label, path: `${COLONY_CREW_ASSET_ROOT_V188}${id}.png` });
const t = (fr, en) => Object.freeze({ fr, en });

export const COLONY_CREW_SLOTS_V188 = Object.freeze([
  // —— Colony missions (bible §6.2) ——
  slot('colony-quay-warehouse', 'warehouse', 'Port-Méridien quay warehouse, container QZ17-04 (C1, Seegson, Grue).',
    'Project design (bible §6.2, §43.2): a rain-wet colony quay warehouse, stacked containers, one container QZ17-04 open from the inside, welded airlock seams glowing. Reference for welded doors: Aliens (1986), the operations-room door weld; adapted, not reproduced.',
    t('ENTREPÔT DU QUAI · QZ17-04', 'QUAY WAREHOUSE · QZ17-04')),
  slot('colony-processor', 'processor', 'Atmosphere processor technical levels (C2, shelter).',
    'Project design (bible §6.2): tall heat exchangers and catwalks inside a colony atmosphere processor, resin on the warm pipes. Reference: the Hadley’s Hope atmosphere processor, Aliens (1986); the Port-Méridien plant is the project’s own.',
    t('PROCESSEUR ATMOSPHÉRIQUE', 'ATMOSPHERE PROCESSOR')),
  slot('colony-screening', 'screening', 'Biological screening at the infirmary (C3, poisonings).',
    'Project design (bible §6.2): a triage line, a body scanner frame showing a dark embryo silhouette in a chest. Reference: the medical scanner revealing the embryo, Alien 3 (1992); adapted.',
    t('CONTRÔLE BIOLOGIQUE', 'BIOLOGICAL SCREENING')),
  slot('colony-cult', 'cult', 'Night airlock opened from the inside (C4, the convert brother).',
    'Project design (bible §6.2): a colony airlock open at night, candles and scratched symbols, footprints toward a vent. The converts belong to the faction renamed « Enfants de l’Hôte Parfait » (bible §1.5, §1.6); its legacy visuals must be redone as original art (Q47), so no cult figure is drawn.',
    t('SAS OUVERT DE L’INTÉRIEUR', 'AIRLOCK OPENED FROM INSIDE')),
  slot('wren-notebooks', 'notebooks', 'Tomas Wren’s quay notebooks (piece 7 of the QZ17 file).',
    'Project design (bible §6.2, §5.7): hand-written quay logbooks with two waybills per QZ17 container, times circled in red, a high-visibility vest on the chair (Q78 B portrait cue).',
    t('CARNETS DE TOMAS WREN', 'TOMAS WREN’S NOTEBOOKS')),
  slot('colony-beacon', 'beacon', 'The hamlet beacon mast in the rain (side mission, Mbaye quest).',
    'Project design (bible §6.2): a lone colony beacon mast on a ridge, red lamp, rain, distant farm lights. The catalogue item « Colony Beacon » is reused.',
    t('BALISE DU HAMEAU', 'HAMLET BEACON')),
  slot('colony-walls', 'walls', 'The rebuilt north wall at dawn (C5, played as act5-port-walls).',
    'Project design (bible §6.2, §6.3): the north wall with welded airlocks and sentry turrets on top, impacts, dawn light. Reference for sentry guns: UA 571-C, Aliens Special Edition (1991); adapted.',
    t('LE MUR NORD À L’AUBE', 'THE NORTH WALL AT DAWN')),
  // —— Crew quests (bible §8.1) ——
  slot('quest-sentry', 'turret', 'Sanaa Doyle’s sentry turrets (« Les sentinelles »).', 'Two crated sentry turrets on a hangar floor, ammunition belts. Reference: UA 571-C sentry guns, Aliens Special Edition (1991); the catalogue « Portable Sentry » is reused.', t('TOURELLES SENTINELLES', 'SENTRY TURRETS')),
  slot('quest-apc', 'apc', 'Cal Mercer’s M577 under repair (« Remettre le M577 en état »).', 'The M577 APC in the vehicle bay, a wheel off, plates stacked. Reference: M577 APC, Aliens (1986); adapted.', t('M577 EN RÉPARATION', 'M577 UNDER REPAIR')),
  slot('quest-flight-recorder', 'crt', 'The Kappa transport’s flight recorder (« Fenêtre de tir »).', 'A flight-recorder trace on a CRT: altitude flat at 900 m for 22 minutes, a "SLOT RESERVED" tag.', t('KAPPA · 02:14 → 02:36 · CRÉNEAU RÉSERVÉ', 'KAPPA · 02:14 → 02:36 · SLOT RESERVED')),
  slot('quest-route-map', 'map', 'Leila Sørensen’s survival route (« La route des fermes »).', 'A drone survey map: the depot road bridge, a dotted maintenance path under it along the river, contacts on the ridge.', t('ROUTE DES FERMES', 'FARM ROAD')),
  slot('quest-range', 'range', 'The firing range and Echo-8’s sheet (« Ceux d’Echo-8 »).', 'The Tantalus firing range lanes with targets, a chalk-marked range sheet with six names.', t('PAS DE TIR · ECHO-8', 'FIRING RANGE · ECHO-8')),
  slot('quest-colonist-list', 'document', 'Asha Mbaye’s list of the missing (« Les noms de Port-Méridien »).', 'A colony list where "missing" is crossed out and replaced by "call held", beside a QZ-18 register printout.', t('LISTE DES DISPARUS', 'LIST OF THE MISSING')),
  slot('quest-tags', 'tags', 'Noor Okafor’s register of losses (« Le registre des pertes »).', 'Three colonists’ identification tags in a tray beside an open register.', t('REGISTRE DES PERTES', 'REGISTER OF LOSSES')),
  slot('quest-directive', 'crt', 'BISHOP-9’s preservation directive (« Directive de préservation »).', 'A synthetic’s directive on a lab terminal, one line redacted. Theme reference: Special Order 937, Alien (1979); the directive text is the project’s own.', t('DIRECTIVE DE PRÉSERVATION · ███████', 'PRESERVATION DIRECTIVE · ███████')),
  slot('quest-register', 'document', 'Pablo Reyes’s operation register (« La charge de trop »).', 'An evacuation register with times 13:58, 14:01, 14:02 underlined, a motion-tracker printout.', t('REGISTRE · 13:58 · 14:01 · 14:02', 'REGISTER · 13:58 · 14:01 · 14:02')),
  slot('quest-reactor', 'crt', 'Idris Kwan’s reactor readings (« Le réacteur ne ment pas »).', 'Reactor load graph with a night bump on deck 2, from 01:00 to 05:00.', t('PONT 2 · +4 % · 01:00 → 05:00', 'DECK 2 · +4% · 01:00 → 05:00')),
  slot('quest-vents', 'vents', 'Jun Park’s ducts (« Après les conduits »).', 'A duct junction with new grilles bolted in, a work lamp.', t('CONDUITS DU PONT 2', 'DECK 2 DUCTS'))
]);
export const COLONY_CREW_SLOT_IDS_V188 = Object.freeze(COLONY_CREW_SLOTS_V188.map(entry => entry.id));
// The continuation art lot covers all eighteen scene cards. Tests check that
// every entry is a real PNG; this is not an admission of new gameplay actors.
export const COLONY_CREW_FILES_PRESENT_V188 = Object.freeze([...COLONY_CREW_SLOT_IDS_V188]);
export const getColonyCrewSlotV188 = id => COLONY_CREW_SLOTS_V188.find(entry => entry.id === id) || null;

const GREEN = '#7dff9a', DIM = 'rgba(125,255,154,.35)';
const night = (ctx, w, h, top = '#0b1016', bottom = '#151b20') => { const g = ctx.createLinearGradient?.(0, 0, 0, h); if (g) { g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; } else ctx.fillStyle = top; ctx.fillRect(0, 0, w, h); };
const rain = (ctx, w, h) => { ctx.strokeStyle = 'rgba(160,180,200,.18)'; ctx.lineWidth = 1; for (let i = 0; i < 60; i += 1) { const x = (i * 71) % w, y = (i * 43) % h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 14); ctx.stroke(); } };
const caption = (ctx, w, h, text) => { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, h - 30, w, 30); ctx.fillStyle = '#e8e2cf'; ctx.font = 'bold 13px monospace'; ctx.fillText(text, 16, h - 11); };
const crtFrame = (ctx, w, h) => { ctx.fillStyle = '#050a07'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = DIM; for (let y = 0; y < h; y += 4) { ctx.globalAlpha = .16; ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); } ctx.globalAlpha = 1; };
const paper = (ctx, x, y, w, h, lines, mark) => { ctx.fillStyle = '#d8d2c2'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#555'; for (let i = 0; i < lines; i += 1) ctx.fillRect(x + 12, y + 18 + i * 16, w - 24 - (i % 3) * 18, 3); if (mark !== undefined) { ctx.fillStyle = '#c0392b'; ctx.fillRect(x + 8, y + 14 + mark * 16, w - 16, 2); } };

// Deterministic primitive drawings, one per motif (scale: the 640×280 brief box).
const MOTIFS = Object.freeze({
  warehouse(ctx, w, h) {
    night(ctx, w, h); rain(ctx, w, h);
    for (let i = 0; i < 6; i += 1) { ctx.fillStyle = ['#4a3b2a', '#2f3e45', '#55402c'][i % 3]; ctx.fillRect(40 + i * 92, h - 130 - (i % 2) * 40, 84, 90 + (i % 2) * 40); }
    ctx.fillStyle = '#6d7a80'; ctx.fillRect(w * .62, h - 150, 120, 110); ctx.fillStyle = '#0a0d10'; ctx.fillRect(w * .62 + 10, h - 140, 46, 90);
    ctx.fillStyle = '#ffb347'; ctx.fillRect(w * .62 + 58, h - 150, 3, 110);
  },
  processor(ctx, w, h) {
    night(ctx, w, h, '#120d0a', '#1c140e');
    for (let i = 0; i < 5; i += 1) { ctx.fillStyle = '#3a3430'; ctx.fillRect(60 + i * 110, 30, 46, h - 70); ctx.fillStyle = 'rgba(255,120,40,.25)'; ctx.fillRect(60 + i * 110, 60 + i * 10, 46, 20); }
    ctx.strokeStyle = '#5a524a'; ctx.lineWidth = 3; for (let y = 90; y < h - 40; y += 70) { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(w - 20, y); ctx.stroke(); }
    ctx.fillStyle = '#23302a'; ctx.beginPath(); ctx.ellipse(w * .7, h * .45, 60, 30, .2, 0, Math.PI * 2); ctx.fill();
  },
  screening(ctx, w, h) {
    night(ctx, w, h, '#0c1416', '#10191c');
    ctx.strokeStyle = '#8fd3e0'; ctx.lineWidth = 2; ctx.strokeRect(w * .35, 30, w * .3, h - 80);
    ctx.fillStyle = 'rgba(143,211,224,.25)'; ctx.beginPath(); ctx.ellipse(w * .5, h * .38, 34, 44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#05080a'; ctx.beginPath(); ctx.ellipse(w * .5, h * .42, 12, 16, .3, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 5; i += 1) { ctx.fillStyle = '#2b3438'; ctx.fillRect(40 + i * 22, h - 120, 16, 70); }
  },
  cult(ctx, w, h) {
    night(ctx, w, h, '#07080a', '#0e0f12');
    ctx.fillStyle = '#3c4247'; ctx.fillRect(w * .3, 40, w * .4, h - 80); ctx.fillStyle = '#020203'; ctx.fillRect(w * .36, 56, w * .28, h - 110);
    for (let i = 0; i < 7; i += 1) { ctx.fillStyle = '#ffcf6a'; ctx.fillRect(w * .32 + i * 34, h - 52, 4, 8); }
    ctx.strokeStyle = '#8a1f1f'; ctx.lineWidth = 2; for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.arc(w * .2, 80 + i * 50, 14, 0, Math.PI * 1.6); ctx.stroke(); }
  },
  notebooks(ctx, w, h) {
    ctx.fillStyle = '#17140f'; ctx.fillRect(0, 0, w, h);
    paper(ctx, w * .08, 26, w * .38, h - 70, 10, 4); paper(ctx, w * .52, 26, w * .38, h - 70, 10, 7);
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * .3, 120, 22, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#e0c020'; ctx.fillRect(w * .9, h - 90, 40, 50);
  },
  beacon(ctx, w, h) {
    night(ctx, w, h); rain(ctx, w, h);
    ctx.fillStyle = '#20262a'; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w * .4, h * .55); ctx.lineTo(w, h * .7); ctx.lineTo(w, h); ctx.fill();
    ctx.strokeStyle = '#7d868c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * .4, h * .55); ctx.lineTo(w * .4, 40); ctx.stroke();
    ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(w * .4, 36, 7, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 4; i += 1) { ctx.fillStyle = 'rgba(255,210,140,.7)'; ctx.fillRect(w * .7 + i * 30, h * .76, 3, 3); }
  },
  walls(ctx, w, h) {
    night(ctx, w, h, '#3a2a2a', '#1a1a1e');
    ctx.fillStyle = '#4b4f55'; ctx.fillRect(0, h * .4, w, h * .6);
    for (let i = 0; i < 4; i += 1) { ctx.fillStyle = '#2a2d31'; ctx.fillRect(60 + i * 150, h * .4 - 26, 40, 26); ctx.fillStyle = '#15171a'; ctx.fillRect(96 + i * 150, h * .4 - 18, 24, 6); }
    ctx.fillStyle = '#ffb347'; for (let i = 0; i < 5; i += 1) ctx.fillRect(40 + i * 120, h * .55, 60, 2);
    ctx.fillStyle = '#111'; for (let i = 0; i < 18; i += 1) ctx.fillRect((i * 97) % w, h * .45 + (i * 31) % 80, 5, 5);
  },
  turret(ctx, w, h) {
    night(ctx, w, h, '#111417', '#1b1f23');
    for (const x of [w * .25, w * .6]) { ctx.fillStyle = '#4c5a3c'; ctx.fillRect(x, h * .45, 120, 50); ctx.fillStyle = '#2e3527'; ctx.fillRect(x + 80, h * .45 - 20, 90, 18); ctx.fillStyle = '#6b6f73'; ctx.fillRect(x + 20, h * .45 + 50, 8, 50); ctx.fillRect(x + 92, h * .45 + 50, 8, 50); }
    ctx.fillStyle = '#c9a227'; for (let i = 0; i < 12; i += 1) ctx.fillRect(w * .1 + i * 10, h - 50, 6, 10);
  },
  apc(ctx, w, h) {
    night(ctx, w, h, '#14171a', '#1d2125');
    ctx.fillStyle = '#4d5a48'; ctx.beginPath(); ctx.moveTo(w * .15, h * .7); ctx.lineTo(w * .2, h * .35); ctx.lineTo(w * .78, h * .35); ctx.lineTo(w * .86, h * .55); ctx.lineTo(w * .86, h * .7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#111'; for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.arc(w * .28 + i * w * .2, h * .72, 24, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#6b6f73'; ctx.fillRect(w * .86 + 10, h * .6, 34, 60);
  },
  crt(ctx, w, h) { crtFrame(ctx, w, h); },
  map(ctx, w, h) {
    ctx.fillStyle = '#0f1714'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2e5f7a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, h * .7); ctx.bezierCurveTo(w * .3, h * .5, w * .6, h * .9, w, h * .6); ctx.stroke();
    ctx.strokeStyle = '#a88b5a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * .1, 30); ctx.lineTo(w * .9, h * .4); ctx.stroke();
    ctx.setLineDash?.([6, 6]); ctx.strokeStyle = GREEN; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * .1, h * .74); ctx.bezierCurveTo(w * .3, h * .56, w * .6, h * .94, w * .95, h * .64); ctx.stroke(); ctx.setLineDash?.([]);
    ctx.fillStyle = '#ff5050'; for (let i = 0; i < 5; i += 1) ctx.fillRect(w * .55 + i * 18, h * .22 + (i % 2) * 10, 5, 5);
  },
  range(ctx, w, h) {
    night(ctx, w, h, '#121416', '#1a1d20');
    for (let i = 0; i < 4; i += 1) { ctx.fillStyle = '#2b2f33'; ctx.fillRect(40 + i * 150, 40, 120, h - 120); ctx.fillStyle = '#d8d2c2'; ctx.beginPath(); ctx.arc(100 + i * 150, 100, 26, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(100 + i * 150, 100, 8, 0, Math.PI * 2); ctx.fill(); }
    paper(ctx, w * .62, h - 110, w * .3, 80, 4, 1);
  },
  document(ctx, w, h) {
    ctx.fillStyle = '#17140f'; ctx.fillRect(0, 0, w, h);
    paper(ctx, w * .1, 26, w * .36, h - 70, 11, 2); paper(ctx, w * .54, 40, w * .34, h - 90, 9, 5);
  },
  tags(ctx, w, h) {
    ctx.fillStyle = '#121416'; ctx.fillRect(0, 0, w, h); paper(ctx, w * .55, 30, w * .36, h - 70, 10);
    for (let i = 0; i < 3; i += 1) { ctx.fillStyle = '#9aa1a6'; ctx.beginPath(); ctx.ellipse(w * .2 + i * 50, h * .5 + (i % 2) * 20, 18, 28, .2 * i, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#4a4f53'; ctx.fillRect(w * .2 + i * 50 - 8, h * .5 + (i % 2) * 20 - 4, 16, 2); }
  },
  vents(ctx, w, h) {
    night(ctx, w, h, '#0d1012', '#14181b');
    ctx.fillStyle = '#2f353a'; ctx.fillRect(w * .2, h * .2, w * .6, h * .6); ctx.fillStyle = '#0a0c0e'; ctx.fillRect(w * .26, h * .28, w * .48, h * .44);
    ctx.strokeStyle = '#8a9298'; ctx.lineWidth = 3; for (let x = w * .28; x < w * .74; x += 18) { ctx.beginPath(); ctx.moveTo(x, h * .28); ctx.lineTo(x, h * .72); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,220,150,.5)'; ctx.beginPath(); ctx.arc(w * .85, h * .3, 10, 0, Math.PI * 2); ctx.fill();
  }
});

// Facts come from the active colony return scenes and crew-quest steps. Keep
// them as text/geometry so image generation cannot change a time, a quantity,
// a route or the meaning of a redacted directive, and FR/EN stay available.
export const COLONY_CREW_EVIDENCE_IDS_V188 = Object.freeze([
  'wren-notebooks', 'quest-flight-recorder', 'quest-route-map',
  'quest-colonist-list', 'quest-directive', 'quest-register', 'quest-reactor'
]);
const evidenceIds = new Set(COLONY_CREW_EVIDENCE_IDS_V188);
const ink = (ctx, text, x, y, { colour = '#24251f', size = 14, bold = false, maxWidth = null } = {}) => {
  ctx.fillStyle = colour; ctx.font = `${bold ? 'bold ' : ''}${size}px monospace`;
  if (maxWidth > 0) ctx.fillText(text, x, y, maxWidth); else ctx.fillText(text, x, y);
};
const stroke = (ctx, points, colour, width = 2) => {
  ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
};
function sheet(ctx, x, y, w, h, paintSurface = true) {
  if (!paintSurface) return;
  ctx.fillStyle = '#d8d2bc'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#a69c80'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
}
function screen(ctx, paintSurface = true) {
  if (!paintSurface) return;
  ctx.fillStyle = '#07100d'; ctx.fillRect(64, 24, 512, 214);
  ctx.strokeStyle = '#496457'; ctx.lineWidth = 1; ctx.strokeRect(64.5, 24.5, 511, 213);
  ctx.fillStyle = 'rgba(125,255,154,.035)';
  for (let y = 28; y < 236; y += 4) ctx.fillRect(66, y, 508, 1);
}

/** Fixed logical 640×280 evidence plate, independent of the generated pixels. */
export function drawColonyCrewEvidenceV188(ctx, id, width, height, language = 'fr', { paintSurface = true } = {}) {
  if (!ctx || !evidenceIds.has(id) || !(width > 0 && height > 0)) return false;
  const en = language === 'en', text = (fr, english) => en ? english : fr;
  ctx.save(); ctx.scale(width / 640, height / 280); ctx.globalAlpha = 1;
  if (id === 'wren-notebooks') {
    // Reviewed native composition: two open notebooks, four separate pages.
    // Keep ink below the lamp and desk (y≈96) and clear of both book gutters.
    sheet(ctx, 72, 96, 226, 140, paintSurface); sheet(ctx, 330, 96, 226, 140, paintSurface);
    ink(ctx, 'QZ17', 86, 122, { bold: true, size: 20 });
    ink(ctx, 'QZ17', 342, 122, { bold: true, size: 20 });
    ink(ctx, text('BORDEREAU', 'QUAY'), 82, 151, { size: 12 });
    ink(ctx, text('DU QUAI', 'WAYBILL'), 82, 168, { size: 12 });
    ink(ctx, text('MATÉRIEL', 'DRILLING'), 204, 128, { bold: true, size: 13 });
    ink(ctx, text('DE FORAGE', 'EQUIPMENT'), 204, 147, { bold: true, size: 13 });
    ink(ctx, text('HEURES', 'TIMES'), 221, 184, { size: 11 });
    ink(ctx, text('NOTÉES', 'RECORDED'), 213, 200, { size: 11 });
    ctx.strokeStyle = '#a63e2d'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(244, 188, 44, 24, 0, 0, Math.PI * 2); ctx.stroke();
    ink(ctx, text('SECOND', 'SECOND'), 341, 151, { size: 12 });
    ink(ctx, text('BORDEREAU', 'WAYBILL'), 341, 168, { size: 12 });
    ink(ctx, text('SOUS SCELLÉ', 'UNDER SEAL'), 336, 203, { colour: '#923b2b', bold: true, size: 12 });
    stroke(ctx, [[335, 209], [429, 209]], '#923b2b', 1.5);
    ink(ctx, text('PRIORITÉ FRET', 'FREIGHT PRIORITY'), 452, 153, { size: 11, bold: true, maxWidth: 105 });
  } else if (id === 'quest-colonist-list') {
    // The clip occupies the top centre of the sheet; begin below it.
    sheet(ctx, 96, 80, 432, 158, paintSurface);
    ink(ctx, text('FAMILLE OKONJO · FERME 12', 'OKONJO FAMILY · FARM 12'), 107, 101, { bold: true, size: 15, maxWidth: 407 });
    ink(ctx, text('3 PERSONNES', '3 PEOPLE'), 107, 124, { size: 13 });
    ink(ctx, text('DISPARUS', 'MISSING'), 107, 150, { colour: '#55544b', size: 13 });
    stroke(ctx, [[104, 145], [190, 145]], '#a63e2d');
    ink(ctx, text('APPELS RETENUS', 'CALLS HELD'), 224, 150, { colour: '#923b2b', bold: true, size: 13 });
    ink(ctx, text('QZ-18 : 3 appels retenus 6 jours', 'QZ-18: 3 calls held for 6 days'), 107, 181, { size: 13, maxWidth: 407 });
    ink(ctx, text('derrière le fret, puis effacés.', 'behind freight, then erased.'), 107, 202, { size: 13, maxWidth: 407 });
    ink(ctx, text('Hameau de la balise · nord du port', 'Beacon hamlet · north of the port'), 107, 229, { size: 12, maxWidth: 407 });
  } else if (id === 'quest-register') {
    // Keep the written column to the right of the binder rings.
    sheet(ctx, 118, 47, 386, 184, paintSurface);
    ink(ctx, text('REGISTRE D’ÉVACUATION', 'EVACUATION REGISTER'), 126, 72, { bold: true, size: 16, maxWidth: 369 });
    const rows = [
      ['13:58', text('3 signaux civils coupés du groupe', '3 civilian signals cut off')],
      ['14:01', text('Ordre : « Fermez l’accès. »', 'Order: "Close the access."')],
      ['14:02', text('Charge de Reyes', 'Reyes’s charge')]
    ];
    rows.forEach(([time, label], index) => {
      const y = 111 + index * 46; ink(ctx, time, 126, y, { bold: true }); ink(ctx, label, 194, y, { size: 13, maxWidth: 304 });
      stroke(ctx, [[125, y + 5], [173, y + 5]], '#a63e2d');
    });
  } else if (id === 'quest-route-map') {
    // The photographic survey board starts lower than the CRT plates.
    if (paintSurface) { ctx.fillStyle = '#07100d'; ctx.fillRect(90, 60, 464, 162); }
    ink(ctx, text('PORT', 'PORT'), 94, 212, { colour: '#d5e4d4', bold: true, size: 12 });
    ink(ctx, text('FERMES', 'FARMS'), 499, 212, { colour: '#d5e4d4', bold: true, size: 12, maxWidth: 49 });
    stroke(ctx, [[100, 93], [140, 75], [192, 97], [246, 70], [297, 91], [349, 72], [405, 97], [460, 76], [532, 94]], '#686967', 3);
    ink(ctx, text('CRÊTE · CONTACTS', 'RIDGE · CONTACTS'), 337, 117, { colour: '#e4b07d', size: 12, maxWidth: 207 });
    for (const x of [370, 421, 472]) { ctx.strokeStyle = '#e4b07d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, 88, 5, 0, Math.PI * 2); ctx.stroke(); }
    const river = [[100, 154], [175, 139], [269, 158], [365, 150], [456, 167], [542, 151]];
    stroke(ctx, river, '#315e79', 15);
    stroke(ctx, [[284, 94], [298, 121], [327, 178]], '#a78b63', 10);
    stroke(ctx, [[296, 127], [317, 169]], '#d2b98a', 17);
    ink(ctx, text('PONT', 'BRIDGE'), 243, 113, { colour: '#d5e4d4', size: 12 });
    ctx.setLineDash?.([6, 4]); stroke(ctx, river.map(([x, y]) => [x, y + 19]), GREEN, 2); ctx.setLineDash?.([]);
    ink(ctx, text('Sentier de maintenance · rivière', 'Maintenance path · river'), 151, 212, { colour: GREEN, size: 12, maxWidth: 329 });
  } else {
    // Kappa's generated field recorder has a narrower inner screen. Apply a
    // single scale to both lettering and graph, clear of its physical bezel.
    if (id === 'quest-flight-recorder') { ctx.translate(96, 32); ctx.scale(.74, .74); }
    else if (id === 'quest-directive') { ctx.translate(101, 35); ctx.scale(.68, .68); }
    screen(ctx, paintSurface);
    if (id === 'quest-flight-recorder') {
      ink(ctx, 'KAPPA', 81, 49, { colour: GREEN, bold: true, size: 17 });
      ink(ctx, text('CRÉNEAU RÉSERVÉ', 'SLOT RESERVED'), 327, 49, { colour: '#e7c684', bold: true, size: 14 });
      stroke(ctx, [[133, 78], [133, 190], [541, 190]], '#52785e', 1);
      ink(ctx, '900 m', 78, 110, { colour: GREEN, size: 13 });
      stroke(ctx, [[144, 105], [529, 105]], GREEN, 3);
      stroke(ctx, [[144, 99], [144, 111]], GREEN, 2); stroke(ctx, [[529, 99], [529, 111]], GREEN, 2);
      ink(ctx, '22 min', 300, 150, { colour: GREEN, bold: true, size: 19 });
      ink(ctx, '02:14', 133, 213, { colour: GREEN }); ink(ctx, '02:36', 488, 213, { colour: GREEN });
    } else if (id === 'quest-reactor') {
      // This low, wide CRT begins at y≈75; retain readable lettering instead
      // of squeezing the graph over its gauges, bezel or reactor background.
      ink(ctx, text('PONT 2 · QUARANTAINE', 'DECK 2 · QUARANTINE'), 112, 95, { colour: GREEN, bold: true, size: 16, maxWidth: 339 });
      ink(ctx, '+4 %', 476, 95, { colour: '#e7c684', bold: true, size: 18, maxWidth: 52 });
      ink(ctx, '104 %', 108, 135, { colour: GREEN, size: 12, maxWidth: 45 });
      ink(ctx, '100 %', 108, 190, { colour: '#8caa92', size: 12, maxWidth: 45 });
      stroke(ctx, [[162, 117], [162, 193], [530, 193]], '#52785e', 1);
      ctx.setLineDash?.([3, 5]); stroke(ctx, [[170, 185], [525, 185]], '#52785e', 1); ctx.setLineDash?.([]);
      stroke(ctx, [[170, 185], [202, 185], [202, 128], [481, 128], [481, 185], [525, 185]], GREEN, 2);
      ink(ctx, '01:00', 183, 214, { colour: GREEN, size: 12 }); ink(ctx, '05:00', 460, 214, { colour: GREEN, size: 12 });
      ink(ctx, text('Charge relative · chaque nuit', 'Relative load · every night'), 210, 114, { colour: '#8caa92', size: 10, maxWidth: 260 });
    } else {
      ink(ctx, 'BISHOP-9', 85, 54, { colour: GREEN, bold: true, size: 18 });
      ink(ctx, text('DIRECTIVE DE PRÉSERVATION', 'PRESERVATION DIRECTIVE'), 85, 96, { colour: GREEN, size: 18 });
      stroke(ctx, [[85, 113], [554, 113]], '#52785e', 1);
      ctx.fillStyle = '#728a78'; ctx.fillRect(85, 140, 402, 24);
      ctx.fillStyle = '#030705'; ctx.fillRect(87, 142, 398, 20);
      ink(ctx, text('LIGNE MASQUÉE', 'REDACTED LINE'), 85, 206, { colour: '#8caa92', size: 13 });
    }
  }
  ctx.restore(); return true;
}

/** Real image when one is committed for the slot, the primitive drawing otherwise. */
export class ColonyCrewAssetLoaderV188 {
  constructor({ ImageCtor = globalThis.Image, present = COLONY_CREW_FILES_PRESENT_V188 } = {}) {
    this.ImageCtor = ImageCtor; this.present = new Set(present); this.images = new Map(); this.requested = []; this.usage = Object.create(null);
    this.states = new Map(); this.listeners = new Map(); this.frames = Object.create(null);
  }
  preload(ids = COLONY_CREW_SLOT_IDS_V188) {
    for (const id of ids) {
      const entry = getColonyCrewSlotV188(id);
      if (!entry || !this.present.has(id) || this.images.has(id) || !this.ImageCtor) continue;
      const image = new this.ImageCtor(); this.images.set(id, image); this.states.set(id, 'loading'); this.requested.push(entry.path);
      const finish = state => {
        if (this.images.get(id) !== image || this.states.get(id) !== 'loading') return;
        this.states.set(id, state);
        image.removeEventListener?.('load', ready); image.removeEventListener?.('error', failed);
        if (!image.addEventListener) { image.onload = null; image.onerror = null; }
        for (const notify of [...(this.listeners.get(id) || [])]) notify();
      };
      const ready = () => finish('ready'), failed = () => finish('error');
      if (image.addEventListener) { image.addEventListener('load', ready); image.addEventListener('error', failed); }
      else { image.onload = ready; image.onerror = failed; }
      try { image.src = entry.path; } catch { failed(); }
      if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) ready();
    }
    return this.requested.slice();
  }
  subscribe(id, notify) {
    if (!getColonyCrewSlotV188(id) || typeof notify !== 'function') return () => {};
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
    const entry = getColonyCrewSlotV188(id);
    if (!entry) throw new Error(`Unknown colony art slot: ${id}`);
    const image = this.image(id), lang = language === 'en' ? 'en' : 'fr';
    let source = 'primitive', crop = null;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, width, height); ctx.clip();
    if (image) {
      // Uniform cover crop: generated native sizes may differ from the brief.
      // No aspect distortion, neighbouring atlas cells or out-of-bounds read.
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const sw = width / scale, sh = height / scale;
      crop = { x: (image.naturalWidth - sw) / 2, y: (image.naturalHeight - sh) / 2, w: sw, h: sh };
      try { ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, width, height); source = 'image'; }
      catch { crop = null; }
    }
    if (source === 'primitive') MOTIFS[entry.motif](ctx, width, height, entry.label[lang]);
    const evidence = drawColonyCrewEvidenceV188(ctx, id, width, height, lang, { paintSurface: source !== 'image' });
    caption(ctx, width, height, entry.label[lang]);
    ctx.restore();
    this.usage[id] = source;
    this.frames[id] = { source, language: lang, crop, target: { x: 0, y: 0, w: width, h: height }, evidence };
    return source;
  }
}
