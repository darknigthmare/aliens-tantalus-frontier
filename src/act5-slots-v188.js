// V188 — named art slots for Act V « Non viable », the endings and the epilogue
// (spec 006). Fourteen active slots compose inspected art and existing project
// assets. The unused relay-room slot keeps its primitive and requests nothing.
// Text, counts, choices, lights and labels stay native above either art or its
// fallback. Images are loaded by slot; no story state is changed by rendering.
import { STATION_CINEMATIC_ART_SOURCE_RECTS_V188, STATION_CINEMATIC_ART_ANCHORS_V188, drawStationBackgroundV188 } from './station-cinematics-v188.js';
import { ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188, drawAsphodeleActorV188 } from './asphodele-hub-slots-v188.js';

export const ACT5_ASSET_ROOT_V188 = '/assets/act5/v188/';
const slot = (id, use, width, height, purpose, brief) => Object.freeze({ id, use, width, height, purpose, brief, path: `${ACT5_ASSET_ROOT_V188}${id}.png` });

export const ACT5_SLOTS_V188 = Object.freeze([
  // —— Scene dialogs at the briefing table (640×280, the content-scene box) ——
  slot('war-council-table', 'dialog', 640, 280, 'War council around the Tantalus tactical table (bible §5.6 step 1).',
    'Project design: the Tantalus briefing room seen from above the tactical table, a glowing map of Cocyte (complex, road, port) under low light, six to eight crew silhouettes around it; reference for the mood: the briefing and planning scenes of Aliens (1986), not their set.'),
  slot('halloran-order', 'dialog', 640, 280, 'Halloran’s non-viability order on a CRT (bible §5.6 situation).',
    'Project design: a company order on a monochrome terminal, header "CHARTER · NON-VIABILITY", a clause number and a recovery-team ETA; logo-free letterhead (no real company mark).'),
  slot('bridge-collapse', 'dialog', 640, 280, 'The bridge giving way under the convoy: drop the freight trailer or the late colonists’ trailer (bible §5.6 step 5).',
    'Project adaptation: an M577-type APC towing two trailers over a metal road bridge at night in the rain, the far span sagging, one coupling lit in red; side view.'),
  slot('quay-standoff', 'dialog', 640, 280, 'The standoff at the Port-Méridien quay with the company recovery team (bible §5.6 step 8).',
    'Project adaptation: colonists and marines behind a quay gate facing a line of corporate commandos in grey armour with lamps, rain, nobody aiming; the commandos are the catalogue’s Weyland-Yutani commandos, no real logo.'),
  slot('relay-room', 'dialog', 640, 280, 'Asphodèle’s relay room sending the QZ17 file (ending « Le relais parle »).',
    'Project design (bible §7.3): a station relay room with a dish feed console, a transmission bar filling, the file pieces listed on a green CRT.'),
  slot('tantalus-epilogue', 'dialog', 640, 280, 'Crew members’ last lines aboard the Tantalus (epilogue).',
    'Project design: a Tantalus corridor with the cryo bay hatch open in the background, warm light coming back on; one crew silhouette in the foreground.'),
  // —— Cinematic plates (1280×720, drawn under the cinemascope bars) ——
  slot('m577-rain-departure', 'cinematic', 1280, 720, 'CIN-60 « Dernier départ »: the M577 leaves the complex in the rain with the last workers.',
    'Documented reference: the M577 APC of Aliens (1986), long low wedge hull, two wheels visible on each flank (four total), central side door between the wheels and separate front and rear turrets; project adaptation: wet industrial gate, workers and native rain.'),
  slot('port-gates-rollcall', 'cinematic', 1280, 720, 'CIN-61 « Les portes du port »: Rook calls the roll of the colonists who arrived.',
    'Project design: the Port-Méridien wall gate at dawn, a column of colonists walking in, a clipboard and a counter in the foreground; cold rain easing.'),
  slot('ending-relay-transmit', 'cinematic', 1280, 720, 'Ending « Le relais parle »: the file leaves Asphodèle for the ICC and the Colonial Marshals.',
    'Project design: Asphodèle station in orbit of Cocyte, a relay dish aimed away from the planet, a thin signal line leaving the frame; the planet at dawn below.'),
  slot('ending-freight-handover', 'cinematic', 1280, 720, 'Ending « Le fret d’abord »: the colony passes under company administration.',
    'Project design: the Port-Méridien quay under company floodlights, sealed containers loaded onto a company shuttle, colonists held behind a line; grey and sodium light.'),
  slot('ending-living-dawn', 'cinematic', 1280, 720, 'Ending « Les vivants, sans preuve »: the colony held the night; the clause still applies.',
    'Project design: dawn over the Port-Méridien wall after the siege, smoke, colonists on the wall, a company shuttle landing in the distance.'),
  slot('port-meridien-epilogue', 'cinematic', 1280, 720, 'Epilogue fixed shot: Port-Méridien after the ending (owner Q5: fixed shots outside the Tantalus).',
    'Project design: Port-Méridien seen from the landing pad, atmosphere processor tower, lit windows; the state of the colony is written by the game over the plate.'),
  slot('asphodele-epilogue', 'cinematic', 1280, 720, 'Epilogue fixed shot: Asphodèle, retaken or still silent.',
    'Project design (bible §7.1): the station’s ring and spokes, some lights back on if it was retaken.'),
  slot('echo8-locker-epilogue', 'cinematic', 1280, 720, 'Epilogue: the ECHO-8 locker in the cryo bay, « RETOUR CONFIRMÉ » or « POSTE LIBÉRÉ » (bible §5.8, §7.4).',
    'Project design: a single sealed locker in the Tantalus cryo bay with a stencilled label; the cryo pods behind it opening; the label text is drawn by the game.'),
  slot('credits-starfield', 'cinematic', 1280, 720, 'End credits: same style as the opening credit « A fan game by Darknigthmare ».',
    'Deep starfield in the colours of the opening credit (#010304 background, pale stars); no text in the image, the game writes the credits.')
]);
export const ACT5_SLOT_IDS_V188 = Object.freeze(ACT5_SLOTS_V188.map(entry => entry.id));
export const ACT5_ACTIVE_SLOT_IDS_V188 = Object.freeze(ACT5_SLOT_IDS_V188.filter(id => id !== 'relay-room'));
// Slot admission is separate from physical files: several slots share an image
// at its original path. The catalogue below is the exact file inventory.
export const ACT5_FILES_PRESENT_V188 = Object.freeze([...ACT5_ACTIVE_SLOT_IDS_V188]);
export const getAct5SlotV188 = id => ACT5_SLOTS_V188.find(entry => entry.id === id) || null;

const art = path => Object.freeze({ path });
const crewArt = slug => art(`/assets/openai/sprites/normalized/npcs/${slug}-locomotion-sheet.png`);
export const ACT5_NEW_ART_IDS_V188 = Object.freeze(['m577-rain-departure', 'bridge-collapse', 'quay-standoff', 'port-gates-rollcall', 'port-meridien-epilogue', 'freight-trailer', 'colonist-trailer', 'echo8-locker-epilogue', 'm577-side-corrected']);
export const ACT5_ART_V188 = Object.freeze({
  ...Object.fromEntries(ACT5_NEW_ART_IDS_V188.map(id => [id, art(`${ACT5_ASSET_ROOT_V188}${id}.png`)])),
  'briefing-room': art('/assets/openai/hub/rooms/command-briefing.png'),
  'tactical-table': art('/assets/openai/hub/props/operations-table-v61.png'),
  'cryo-room': art('/assets/openai/hub/rooms/command-cryo.png'),
  'cryopod': art('/assets/openai/hub/props/cryopod.png'),
  'company-shuttle': art('/assets/openai/equipment/v121-vehicles/weyland-yutani-executive-shuttle-native-v121.png'),
  'colony-walls': art('/assets/content/v188/colony/colony-walls.png'),
  'crt-bezel': art('/assets/insertion/v188/crt-bezel.png'),
  'starfield': art('/assets/insertion/v188/starfield-deep.png'),
  'planet': art('/assets/insertion/v188/planet-limb.png'),
  'asph-ring': art('/assets/asphodele/v188/cinematics/asph-cin-ring.png'),
  'asph-hub': art('/assets/asphodele/v188/cinematics/asph-cin-hub.png'),
  'rook-quarters': art('/assets/asphodele/v188/cinematics/asph-cin-rook-quarters.png'),
  'marine': art('/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png'),
  'commando': art('/assets/openai/sprites/normalized/enemies/weyland-yutani-commando-action-sheet-v56.png'),
  'asph-npc-docker': art('/assets/asphodele/v188/asph-npc-docker.png'),
  'asph-npc-merchant': art('/assets/asphodele/v188/asph-npc-merchant.png'),
  'asph-npc-technician': art('/assets/asphodele/v188/asph-npc-technician.png'),
  'crew-vega': crewArt('mara-vega'), 'crew-sanaa': crewArt('sanaa-doyle'), 'crew-cal': crewArt('cal-mercer'),
  'crew-leila': crewArt('leila-s-rensen'), 'crew-orlov': crewArt('maksim-orlov'), 'crew-rook': crewArt('rook')
});
const deps = (...ids) => Object.freeze(ids);
export const ACT5_CIVILIAN_ART_IDS_V188 = deps('asph-npc-docker', 'asph-npc-merchant', 'asph-npc-technician');
export const ACT5_ACTOR_LAYOUTS_V188 = Object.freeze(Object.fromEntries(ACT5_CIVILIAN_ART_IDS_V188.map(id => [id, ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188[id]])));
export const ACT5_ART_BY_SLOT_V188 = Object.freeze({
  'war-council-table': deps('briefing-room', 'tactical-table', 'crew-vega', 'crew-sanaa', 'crew-cal', 'crew-leila', 'crew-orlov', 'crew-rook'),
  'halloran-order': deps('crt-bezel'),
  'bridge-collapse': deps('bridge-collapse', 'm577-side-corrected', 'colonist-trailer', 'freight-trailer', ...ACT5_CIVILIAN_ART_IDS_V188),
  'quay-standoff': deps('quay-standoff', 'marine', 'commando', ...ACT5_CIVILIAN_ART_IDS_V188),
  'relay-room': deps(),
  'tantalus-epilogue': deps('cryo-room'),
  'm577-rain-departure': deps('m577-rain-departure', 'm577-side-corrected', ...ACT5_CIVILIAN_ART_IDS_V188),
  'port-gates-rollcall': deps('port-gates-rollcall', ...ACT5_CIVILIAN_ART_IDS_V188),
  'ending-relay-transmit': deps('starfield', 'planet', 'asph-ring', 'asph-hub'),
  'ending-freight-handover': deps('quay-standoff', 'company-shuttle', 'freight-trailer', 'commando', ...ACT5_CIVILIAN_ART_IDS_V188),
  'ending-living-dawn': deps('colony-walls', 'company-shuttle', ...ACT5_CIVILIAN_ART_IDS_V188),
  'port-meridien-epilogue': deps('port-meridien-epilogue'),
  'asphodele-epilogue': deps('starfield', 'asph-ring', 'asph-hub'),
  'echo8-locker-epilogue': deps('cryo-room', 'cryopod', 'echo8-locker-epilogue'),
  'credits-starfield': deps('starfield')
});
export const ACT5_CINEMATIC_SLOTS_V188 = Object.freeze({
  'cin-60': deps('m577-rain-departure'), 'cin-61': deps('port-gates-rollcall'),
  'cin-90-relay': deps('ending-relay-transmit'), 'cin-90-freight': deps('ending-freight-handover'), 'cin-90-living': deps('ending-living-dawn'),
  'cin-92': deps('port-meridien-epilogue', 'asphodele-epilogue', 'echo8-locker-epilogue'), 'cin-99-credits': deps('credits-starfield')
});
export function act5CinematicSourcesV188(id) {
  const slots = ACT5_CINEMATIC_SLOTS_V188[id]; if (!slots) return null;
  const ids = [...slots.flatMap(slot => ACT5_ART_BY_SLOT_V188[slot]), ...(id === 'cin-61' ? ['rook-quarters'] : [])];
  return [...new Set(ids.map(key => ACT5_ART_V188[key].path))];
}
// Windows retain the complete inspected silhouettes, including the last tyre
// pixels. Coordinates below are measured in the untouched source PNGs.
export const ACT5_ART_SOURCE_RECTS_V188 = Object.freeze({
  'm577-side-corrected': Object.freeze([19, 18, 2124, 706]),
  'colonist-trailer': Object.freeze([27, 47, 2134, 662]), 'freight-trailer': Object.freeze([28, 50, 2126, 658]),
  'echo8-locker-epilogue': Object.freeze([116, 118, 567, 1734]),
  'tactical-table': Object.freeze([57, 60, 932, 402]), 'cryopod': Object.freeze([8, 9, 224, 114]),
  'company-shuttle': Object.freeze([155, 186, 1215, 713]),
  'asph-ring': STATION_CINEMATIC_ART_SOURCE_RECTS_V188['asph-cin-ring'], 'asph-hub': STATION_CINEMATIC_ART_SOURCE_RECTS_V188['asph-cin-hub'],
  'planet': STATION_CINEMATIC_ART_SOURCE_RECTS_V188['planet-limb'],
  'marine': Object.freeze([68, 45, 119, 197]), 'commando': Object.freeze([76, 63, 103, 179]),
  'crew-vega': Object.freeze([92, 21, 71, 221]), 'crew-sanaa': Object.freeze([70, 15, 115, 227]),
  'crew-cal': Object.freeze([83, 30, 89, 212]), 'crew-leila': Object.freeze([79, 14, 98, 228]),
  'crew-orlov': Object.freeze([86, 14, 83, 228]), 'crew-rook': Object.freeze([70, 14, 116, 228])
});
export const ACT5_ART_ANCHORS_V188 = Object.freeze({
  'm577-rain-departure': Object.freeze({ ground: Object.freeze([958, 720]) }),
  'port-gates-rollcall': Object.freeze({ aperture: Object.freeze([831, 399, 403, 286]), leftPocket: Object.freeze([640, 407, 177, 272]), rightPocket: Object.freeze([1293, 408, 183, 274]) }),
  'echo8-locker-epilogue': Object.freeze({ label: Object.freeze([220, 565, 362, 106]) }),
  'cryopod': Object.freeze({ lid: Object.freeze([44, 15, 136, 56]), hinge: Object.freeze([174, 66]) }),
  'crt-bezel': STATION_CINEMATIC_ART_ANCHORS_V188['crt-bezel'],
  'asph-ring': STATION_CINEMATIC_ART_ANCHORS_V188['asph-cin-ring'], 'asph-hub': STATION_CINEMATIC_ART_ANCHORS_V188['asph-cin-hub'],
  'marine': Object.freeze({ foot: Object.freeze([128, 240]) }), 'commando': Object.freeze({ foot: Object.freeze([118, 240]) }),
  ...Object.fromEntries(['crew-vega', 'crew-sanaa', 'crew-cal', 'crew-leila', 'crew-orlov', 'crew-rook'].map(id => [id, Object.freeze({ foot: Object.freeze([128, 240]) })]))
});

// —— Primitive drawings (deterministic; `time` only moves rain and lights) ——
const GREEN = '#7dff9a', DIM = 'rgba(125,255,154,.35)';
const en = options => options?.language === 'en';
function stars(ctx, w, h, n = 90, seed = 1) {
  for (let i = 0; i < n; i += 1) { ctx.fillStyle = `rgba(220,232,240,${.2 + ((i * 37 + seed) % 60) / 100})`; ctx.fillRect((i * 97 + seed * 13) % w, (i * 53 + seed * 7) % h, 1.6, 1.6); }
}
function rain(ctx, w, h, time = 0, still = false, alpha = .28) {
  ctx.strokeStyle = `rgba(170,200,214,${alpha})`; ctx.lineWidth = 1; ctx.beginPath();
  const shift = still ? 0 : time * 900;
  for (let i = 0; i < 140; i += 1) { const x = (i * 89) % w, y = ((i * 131) + shift) % h; ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 18); }
  ctx.stroke();
}
function crt(ctx, w, h) {
  ctx.fillStyle = '#050a07'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = DIM; ctx.globalAlpha = .18; for (let y = 0; y < h; y += 4) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.strokeRect(.5, .5, w - 1, h - 1);
}
function apc(ctx, x, y, s = 1) { // M577 side silhouette: two wheels, a central door, separate turrets
  ctx.fillStyle = '#3d4636'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40 * s, y - 34 * s); ctx.lineTo(x + 230 * s, y - 34 * s); ctx.lineTo(x + 250 * s, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2e3529'; ctx.fillRect(x + 160 * s, y - 52 * s, 50 * s, 18 * s); ctx.fillRect(x + 205 * s, y - 47 * s, 34 * s, 5 * s);
  ctx.fillStyle = '#111'; for (const wheel of [48, 198]) { ctx.beginPath(); ctx.arc(x + wheel * s, y + 4 * s, 20 * s, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#66705c'; ctx.lineWidth = s; ctx.strokeRect(x + 100 * s, y - 31 * s, 38 * s, 31 * s);
  ctx.fillStyle = 'rgba(255,214,150,.8)'; ctx.fillRect(x + 4 * s, y - 14 * s, 8 * s, 5 * s);
}
function people(ctx, x, y, n, gap = 22, tone = '#b8b0a0') {
  ctx.fillStyle = tone;
  for (let i = 0; i < n; i += 1) { const px = x + i * gap; ctx.fillRect(px, y - 34, 10, 34); ctx.beginPath(); ctx.arc(px + 5, y - 40, 6, 0, Math.PI * 2); ctx.fill(); }
}
function station(ctx, cx, cy, r, lit) {
  ctx.strokeStyle = '#59606a'; ctx.lineWidth = Math.max(4, r * .06); ctx.beginPath(); ctx.ellipse(cx, cy, r, r * .32, -.12, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 3; for (let i = 0; i < 4; i += 1) { const a = i * Math.PI / 2 + .3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .32); ctx.stroke(); }
  ctx.fillStyle = '#3b4047'; ctx.fillRect(cx - r * .14, cy - r * .18, r * .28, r * .36);
  if (lit) { ctx.fillStyle = 'rgba(255,220,150,.85)'; for (let i = 0; i < 10; i += 1) { const a = i / 10 * Math.PI * 2; ctx.fillRect(cx + Math.cos(a) * r - 2, cy + Math.sin(a) * r * .32 - 2, 4, 4); } }
}
function planet(ctx, w, h, tint = '#2a3a44') {
  const g = ctx.createRadialGradient?.(w * .5, h * 1.6, h * .4, w * .5, h * 1.6, h * 1.25);
  if (g) { g.addColorStop(0, tint); g.addColorStop(.92, '#0d1418'); g.addColorStop(1, 'rgba(120,170,200,.45)'); ctx.fillStyle = g; } else ctx.fillStyle = tint;
  ctx.beginPath(); ctx.arc(w * .5, h * 1.6, h * 1.25, 0, Math.PI * 2); ctx.fill();
}
function wall(ctx, w, h, top) {
  ctx.fillStyle = '#20262b'; ctx.fillRect(0, top, w, h - top);
  ctx.fillStyle = '#2c343a'; for (let x = 0; x < w; x += 80) ctx.fillRect(x, top - 14, 50, 14);
}

const PRIMITIVES = Object.freeze({
  'war-council-table'(ctx, w, h, o) {
    ctx.fillStyle = '#0a0e10'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#10241a'; ctx.beginPath(); ctx.ellipse(w / 2, h * .58, w * .36, h * .26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = GREEN; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * .26, h * .6); ctx.bezierCurveTo(w * .4, h * .4, w * .58, h * .76, w * .74, h * .54); ctx.stroke(); // the road
    ctx.fillStyle = GREEN; ctx.font = '11px monospace';
    ctx.fillText(en(o) ? 'COMPLEX' : 'COMPLEXE', w * .2, h * .66); ctx.fillText('PORT-MÉRIDIEN', w * .66, h * .5);
    ctx.fillStyle = '#e15b4f'; ctx.fillRect(w * .47, h * .56, 8, 8); // the bridge
    for (let i = 0; i < 8; i += 1) { const a = Math.PI + i / 7 * Math.PI; ctx.fillStyle = '#1c2226'; const x = w / 2 + Math.cos(a) * w * .42, y = h * .58 + Math.sin(a) * h * .4;
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 12, y + 10, 24, 30); }
  },
  'halloran-order'(ctx, w, h, o) {
    crt(ctx, w, h); ctx.fillStyle = GREEN; ctx.font = '14px monospace';
    (en(o) ? ['COMPANY · REGIONAL OFFICE · R. HALLORAN', 'CHARTER · NON-VIABILITY CLAUSE', 'PORT-MÉRIDIEN · NON-VIABLE', 'EFFECTIVE ON ARRIVAL OF THE RECOVERY TEAM', 'ASSETS: DEPOT, COLONY']
      : ['COMPAGNIE · DIRECTION RÉGIONALE · R. HALLORAN', 'CHARTE · CLAUSE DE NON-VIABILITÉ', 'PORT-MÉRIDIEN · NON VIABLE', 'EFFET À L’ARRIVÉE DE L’ÉQUIPE DE RÉCUPÉRATION', 'ACTIFS : DÉPÔT, COLONIE']).forEach((line, i) => ctx.fillText(line, 24, 40 + i * 26));
    ctx.fillStyle = '#e9d07a'; ctx.fillRect(24, h - 44, (w - 48) * .62, 10);
  },
  'bridge-collapse'(ctx, w, h, o) {
    ctx.fillStyle = '#070b0e'; ctx.fillRect(0, 0, w, h); rain(ctx, w, h, o?.time, o?.reducedMotion, .22);
    ctx.strokeStyle = '#4a5258'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, h * .7); ctx.lineTo(w * .62, h * .7); ctx.lineTo(w, h * .86); ctx.stroke(); // sagging span
    ctx.lineWidth = 2; for (let x = 20; x < w * .62; x += 40) { ctx.beginPath(); ctx.moveTo(x, h * .7); ctx.lineTo(x + 20, h * .9); ctx.stroke(); }
    apc(ctx, w * .08, h * .66, .55);
    ctx.fillStyle = '#2c3640'; ctx.fillRect(w * .32, h * .58, 90, 26); // colonists' trailer
    ctx.fillStyle = '#3a3226'; ctx.fillRect(w * .5, h * .58, 90, 26); // rear freight trailer (§5.11)
    people(ctx, w * .33, h * .66, 4, 19, '#8d9b94');
    ctx.fillStyle = '#e15b4f'; ctx.fillRect(w * .31, h * .65, 6, 6); ctx.fillRect(w * .49, h * .65, 6, 6);
    ctx.fillStyle = '#d8e6d8'; ctx.font = '11px monospace'; ctx.fillText(en(o) ? 'LATE COLONISTS' : 'COLONS EN RETARD', w * .32, h * .56); ctx.fillText(en(o) ? 'FREIGHT' : 'FRET', w * .53, h * .56);
  },
  'quay-standoff'(ctx, w, h, o) {
    ctx.fillStyle = '#0a0e12'; ctx.fillRect(0, 0, w, h); rain(ctx, w, h, o?.time, o?.reducedMotion, .18);
    ctx.fillStyle = '#2a3036'; ctx.fillRect(w * .48, h * .3, 12, h * .6); // the gate
    people(ctx, w * .1, h * .88, 7, 26);
    people(ctx, w * .58, h * .88, 6, 30, '#5e6670');
    ctx.fillStyle = 'rgba(255,240,200,.75)'; for (let i = 0; i < 6; i += 1) ctx.fillRect(w * .58 + i * 30 - 2, h * .88 - 32, 4, 4); // helmet lamps
  },
  'relay-room'(ctx, w, h, o) {
    crt(ctx, w, h); ctx.fillStyle = GREEN; ctx.font = '13px monospace';
    ctx.fillText(en(o) ? 'ASPHODÈLE · RELAY ROOM · ICC / COLONIAL MARSHALS' : 'ASPHODÈLE · SALLE DES RELAIS · ICC / MARSHALS COLONIAUX', 24, 34);
    for (let i = 0; i < 7; i += 1) { ctx.fillStyle = i < 5 ? GREEN : DIM; ctx.fillRect(24, 56 + i * 22, 14, 14); ctx.fillRect(48, 61 + i * 22, 180 + (i * 37) % 120, 4); }
    ctx.strokeStyle = GREEN; ctx.strokeRect(w * .5, h * .32, w * .42, 18); ctx.fillStyle = GREEN; ctx.fillRect(w * .5 + 2, h * .32 + 2, (w * .42 - 4) * .78, 14);
  },
  'tantalus-epilogue'(ctx, w, h) {
    ctx.fillStyle = '#0d1517'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#152226'; for (let x = 0; x < w; x += 70) ctx.fillRect(x, 0, 3, h);
    ctx.fillStyle = 'rgba(255,214,160,.35)'; ctx.fillRect(w * .62, h * .18, w * .2, h * .62); // the cryo hatch, open, lit
    ctx.fillStyle = '#0a0f10'; ctx.fillRect(0, h * .86, w, h * .14);
    people(ctx, w * .3, h * .86, 1);
  },
  'm577-rain-departure'(ctx, w, h, o) {
    ctx.fillStyle = '#080c10'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#121a20'; ctx.fillRect(w * .58, h * .2, w * .4, h * .55); ctx.fillStyle = 'rgba(233,160,90,.25)'; ctx.fillRect(w * .62, h * .26, w * .3, 18); // complex
    ctx.fillStyle = '#0b1013'; ctx.fillRect(0, h * .74, w, h * .26);
    const drive = o?.reducedMotion ? .3 : Math.min(1, o?.progress || 0);
    apc(ctx, w * .52 - drive * w * .4, h * .76, 1.4);
    people(ctx, w * .72, h * .76, Math.max(0, 5 - Math.floor(drive * 6)), 26);
    rain(ctx, w, h, o?.time, o?.reducedMotion);
  },
  'port-gates-rollcall'(ctx, w, h, o) {
    const sky = ctx.createLinearGradient?.(0, 0, 0, h); if (sky) { sky.addColorStop(0, '#1d2a33'); sky.addColorStop(1, '#0a0f12'); ctx.fillStyle = sky; } else ctx.fillStyle = '#121a20';
    ctx.fillRect(0, 0, w, h); wall(ctx, w, h, h * .45);
    ctx.fillStyle = '#0e1418'; ctx.fillRect(w * .44, h * .45, w * .12, h * .4); // the open gate
    const total = rollCallCount(o?.context?.rollCall), shown = o?.closing ? total : Math.ceil(total * Math.min(1, (o?.progress || 0) * 1.4));
    people(ctx, w * .1, h * .92, Math.min(24, shown), 44);
    if (o?.closing) gateLeaves(ctx, { aperture: [w * .44, h * .45, w * .12, h * .4] }, o?.reducedMotion ? 1 : Math.min(1, Math.max(0, o?.progress || 0)));
    ctx.fillStyle = '#e6efe6'; ctx.font = '600 44px monospace'; ctx.textAlign = 'center'; ctx.fillText(String(o?.reducedMotion ? total : shown), w / 2, h * .32); ctx.textAlign = 'left';
    rain(ctx, w, h, o?.time, o?.reducedMotion, .12);
  },
  'ending-relay-transmit'(ctx, w, h, o) {
    ctx.fillStyle = '#020305'; ctx.fillRect(0, 0, w, h); stars(ctx, w, h, 140, 3); planet(ctx, w, h);
    station(ctx, w * .42, h * .38, 180, true);
    const p = o?.reducedMotion ? 1 : Math.min(1, (o?.progress || 0) * 1.3);
    ctx.strokeStyle = GREEN; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * .42 + 120, h * .34); ctx.lineTo(w * .42 + 120 + p * w * .5, h * .34 - p * h * .3); ctx.stroke();
  },
  'ending-freight-handover'(ctx, w, h, o) {
    ctx.fillStyle = '#0c0d0e'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,196,110,.18)'; ctx.beginPath(); ctx.moveTo(w * .2, 0); ctx.lineTo(w * .05, h); ctx.lineTo(w * .45, h); ctx.closePath(); ctx.fill(); // floodlight
    ctx.fillStyle = '#4c5056'; ctx.fillRect(w * .55, h * .4, w * .36, h * .2); // company shuttle
    for (let i = 0; i < 3; i += 1) { ctx.fillStyle = '#3a3226'; ctx.fillRect(w * .3 + i * 90, h * .62, 70, 54); ctx.strokeStyle = '#e9d07a'; ctx.strokeRect(w * .3 + i * 90 + 4, h * .62 + 4, 62, 46); }
    ctx.fillStyle = '#e9d07a'; ctx.fillRect(0, h * .84, w, 4); // the line
    people(ctx, w * .06, h * .98, 10, 30);
  },
  'ending-living-dawn'(ctx, w, h, o) {
    const sky = ctx.createLinearGradient?.(0, 0, 0, h); if (sky) { sky.addColorStop(0, '#2b2a33'); sky.addColorStop(.6, '#6a4a3a'); sky.addColorStop(1, '#1a1412'); ctx.fillStyle = sky; } else ctx.fillStyle = '#3a2f2a';
    ctx.fillRect(0, 0, w, h); wall(ctx, w, h, h * .55);
    ctx.fillStyle = 'rgba(40,40,44,.6)'; for (let i = 0; i < 5; i += 1) { ctx.beginPath(); ctx.arc(w * (.2 + i * .15), h * (.45 - (o?.reducedMotion ? 0 : (o?.progress || 0) * .1)) - i * 8, 40 + i * 6, 0, Math.PI * 2); ctx.fill(); } // smoke
    people(ctx, w * .18, h * .55, 9, 70);
    ctx.fillStyle = '#4c5056'; ctx.fillRect(w * .82, h * .22, 80, 18); // a company shuttle in the distance
  },
  'port-meridien-epilogue'(ctx, w, h, o) {
    ctx.fillStyle = '#0a1014'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#04070a'; ctx.beginPath(); ctx.moveTo(0, h * .55); for (let x = 0; x <= w; x += 80) ctx.lineTo(x, h * .5 + Math.sin(x * .013) * 30); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    ctx.fillStyle = '#121a1e'; ctx.fillRect(w * .6, h * .3, 60, h * .3); ctx.fillRect(w * .42, h * .46, w * .4, h * .16);
    ctx.fillStyle = 'rgba(255,214,150,.75)'; for (let i = 0; i < 46; i += 1) ctx.fillRect(w * .43 + (i * 53) % (w * .38), h * .48 + (i * 29) % (h * .12), 4, 3);
    ctx.strokeStyle = 'rgba(140,220,200,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(w * .25, h * .82, 200, 34, 0, 0, Math.PI * 2); ctx.stroke();
  },
  'asphodele-epilogue'(ctx, w, h, o) {
    ctx.fillStyle = '#020305'; ctx.fillRect(0, 0, w, h); stars(ctx, w, h, 120, 5);
    station(ctx, w * .55, h * .48, 230, Boolean(o?.context?.asphodeleRetaken));
  },
  'echo8-locker-epilogue'(ctx, w, h, o) {
    ctx.fillStyle = '#0d1517'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let x = 0; x < w; x += 120) ctx.fillRect(x, 0, 2, h * .85);
    const open = o?.reducedMotion ? 1 : Math.min(1, (o?.progress || 0) * 1.5);
    for (let i = 0; i < 4; i += 1) { const x = 120 + i * 150; ctx.fillStyle = '#1a2a30'; ctx.fillRect(x, h * .32, 110, h * .5); ctx.fillStyle = `rgba(150,220,235,${.15 + open * .35})`; ctx.fillRect(x + 10, h * .34, 90, h * .46 * (1 - open * .6)); }
    ctx.fillStyle = '#1d2a2e'; ctx.fillRect(w * .68, h * .26, 150, h * .58); ctx.strokeStyle = '#3e5157'; ctx.lineWidth = 3; ctx.strokeRect(w * .68 + 2, h * .26 + 2, 146, h * .58 - 4);
    ctx.fillStyle = '#d8e6d8'; ctx.font = '700 15px monospace'; ctx.textAlign = 'center'; ctx.fillText('ECHO-8', w * .68 + 75, h * .26 + 40);
    ctx.fillStyle = '#e9d07a'; ctx.font = '700 13px monospace'; ctx.fillText(String(o?.context?.lockerLabel || ''), w * .68 + 75, h * .26 + 66); ctx.textAlign = 'left';
    ctx.fillStyle = '#0a1113'; ctx.fillRect(0, h * .85, w, h * .15);
  },
  'credits-starfield'(ctx, w, h, o) {
    ctx.fillStyle = '#010304'; ctx.fillRect(0, 0, w, h); stars(ctx, w, h, 160, 9);
    ctx.fillStyle = 'rgba(143,213,162,.05)'; ctx.fillRect(0, h * .4, w, h * .2);
  }
});

const rollCallCount = value => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
const imageReady = image => image?.complete && Number.isFinite(image.naturalWidth) && image.naturalWidth > 0 && Number.isFinite(image.naturalHeight) && image.naturalHeight > 0;
const imageAt = (images, id) => { const image = images?.[ACT5_ART_V188[id]?.path]; return imageReady(image) ? image : null; };
/** Uniform image geometry, also used by native QA. Source pixels are never edited. */
export function act5ArtFitV188(images, id, [x, y, w, h], { cover = false, alignY = .5 } = {}) {
  const image = imageAt(images, id); if (!image || !(w > 0 && h > 0)) return null;
  let [sx, sy, sw, sh] = ACT5_ART_SOURCE_RECTS_V188[id] || [0, 0, image.naturalWidth, image.naturalHeight];
  const scale = (cover ? Math.max : Math.min)(w / sw, h / sh);
  if (cover) { sx += (sw - w / scale) / 2; sy += (sh - h / scale) * alignY; sw = w / scale; sh = h / scale; }
  else { x += (w - sw * scale) / 2; y += (h - sh * scale) * alignY; w = sw * scale; h = sh * scale; }
  return { id, sx, sy, sw, sh, x, y, w, h, scale };
}
export function act5ArtAnchorV188(fit, key) {
  const a = fit && ACT5_ART_ANCHORS_V188[fit.id]?.[key]; if (!a) return null;
  return [fit.x + (a[0] - fit.sx) * fit.scale, fit.y + (a[1] - fit.sy) * fit.scale, ...a.slice(2).map(v => v * fit.scale)];
}
function paint(ctx, images, id, box, options) {
  const fit = act5ArtFitV188(images, id, box, options); if (!fit) return null;
  ctx.drawImage(imageAt(images, id), fit.sx, fit.sy, fit.sw, fit.sh, fit.x, fit.y, fit.w, fit.h); return fit;
}
function flat(ctx, w, h, tone = '#10171b') { ctx.fillStyle = tone; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#0b1012'; ctx.fillRect(0, h * .82, w, h * .18); }
function person(ctx, x, floor, height, tone = '#63716c') {
  const head = height * .105; ctx.fillStyle = tone; ctx.beginPath(); ctx.arc(x, floor - height + head, head, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - head * 1.3, floor - height * .76); ctx.lineTo(x + head * 1.3, floor - height * .76);
  ctx.lineTo(x + head * 1.05, floor - height * .31); ctx.lineTo(x - head * 1.05, floor - height * .31); ctx.closePath(); ctx.fill();
  ctx.lineWidth = Math.max(2, height * .065); ctx.strokeStyle = tone; ctx.beginPath();
  ctx.moveTo(x - head * 1.2, floor - height * .72); ctx.lineTo(x - head * 1.65, floor - height * .34);
  ctx.moveTo(x + head * 1.2, floor - height * .72); ctx.lineTo(x + head * 1.65, floor - height * .34);
  ctx.moveTo(x - head * .55, floor - height * .33); ctx.lineTo(x - head * .75, floor);
  ctx.moveTo(x + head * .55, floor - height * .33); ctx.lineTo(x + head * .85, floor); ctx.stroke();
}
function actor(ctx, images, id, x, floor, height, facing = 1) {
  const image = imageAt(images, id), rect = ACT5_ART_SOURCE_RECTS_V188[id], foot = ACT5_ART_ANCHORS_V188[id]?.foot;
  if (!image || !rect || !foot) { person(ctx, x, floor, height, id === 'commando' ? '#b7b5a3' : '#57645a'); return; }
  const s = height / (foot[1] - rect[1]); ctx.save(); ctx.translate(x, floor); ctx.scale(facing * s, s);
  ctx.drawImage(image, ...rect, rect[0] - foot[0], rect[1] - foot[1], rect[2], rect[3]); ctx.restore();
}
function civilians(ctx, images, w, h, number, { left = .08, right = .4, floor = .9, height = .22, stagger = false, moving = false, facing = 1, time = 0, reducedMotion = false } = {}) {
  const n = Math.min(24, Math.max(0, Math.floor(number)));
  for (let i = 0; i < n; i++) {
    const f = n <= 1 ? .5 : i / (n - 1);
    civilian(ctx, images, i, w * (left + (right - left) * f), h * floor - (stagger ? i % 3 * 3 : 0), h * height * (.88 + i % 3 * .06), { moving, facing, time, reducedMotion });
  }
}
function civilian(ctx, images, index, x, floor, height, { moving = false, facing = 1, time = 0, reducedMotion = false } = {}) {
  const loader = { image: id => imageAt(images, id), usage: Object.create(null) }, scale = height / 89;
  ctx.save(); ctx.translate(x, floor); ctx.scale(scale, scale);
  drawAsphodeleActorV188(ctx, loader, ACT5_CIVILIAN_ART_IDS_V188[index % 3], 0, 0, { facing, phase: time * 6 + index, moving, still: reducedMotion }); ctx.restore();
}
function ink(ctx, value, x, y, size, color = GREEN, maxWidth = undefined) { ctx.fillStyle = color; ctx.font = `600 ${size}px monospace`; ctx.fillText(String(value), x, y, maxWidth); }
function halloran(ctx, images, w, h, o) {
  flat(ctx, w, h, '#030705');
  const fit = paint(ctx, images, 'crt-bezel', [w * .12, 4, w * .76, h - 8]), rect = act5ArtAnchorV188(fit, 'screen') || [w * .08, h * .08, w * .84, h * .84];
  const [x, y, sw, sh] = rect; ctx.fillStyle = '#06110a'; ctx.fillRect(...rect);
  const rows = en(o) ? ['COMPANY · REGIONAL OFFICE · R. HALLORAN', 'CHARTER · NON-VIABILITY CLAUSE', 'PORT-MÉRIDIEN · NON-VIABLE', 'EFFECTIVE ON ARRIVAL OF THE RECOVERY TEAM', 'ASSETS: DEPOT, COLONY']
    : ['COMPAGNIE · DIRECTION RÉGIONALE · R. HALLORAN', 'CHARTE · CLAUSE DE NON-VIABILITÉ', 'PORT-MÉRIDIEN · NON VIABLE', 'EFFET À L’ARRIVÉE DE L’ÉQUIPE DE RÉCUPÉRATION', 'ACTIFS : DÉPÔT, COLONIE'];
  const size = Math.min(14, (sw - 20) / 27); rows.forEach((line, i) => ink(ctx, line, x + 10, y + sh * (.16 + i * .155), size, GREEN, sw - 20));
  ctx.fillStyle = '#e9d07a'; ctx.fillRect(x + 10, y + sh * .9, (sw - 20) * .62, 5);
}
function council(ctx, images, w, h, o) {
  flat(ctx, w, h); paint(ctx, images, 'briefing-room', [0, 0, w, h], { cover: true, alignY: .7 });
  const crew = ['crew-sanaa', 'crew-cal', 'crew-vega', 'crew-rook', 'crew-leila', 'crew-orlov'];
  crew.forEach((id, i) => actor(ctx, images, id, w * (.13 + i * .148), h * .79, h * .55, i < 3 ? 1 : -1));
  const table = paint(ctx, images, 'tactical-table', [w * .18, h * .49, w * .64, h * .49], { alignY: 1 });
  if (!table) { ctx.fillStyle = '#182b25'; ctx.fillRect(w * .18, h * .65, w * .64, h * .32); }
  // The texture on the reused table is illustrative. This route and its labels
  // explicitly locate the three project places and stay translated.
  ctx.fillStyle = 'rgba(3,12,8,.77)'; ctx.fillRect(w * .23, h * .57, w * .54, h * .19);
  ctx.strokeStyle = GREEN; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * .29, h * .69); ctx.lineTo(w * .49, h * .62); ctx.lineTo(w * .71, h * .68); ctx.stroke();
  ink(ctx, en(o) ? 'COMPLEX' : 'COMPLEXE', w * .235, h * .63, 10); ink(ctx, 'PORT-MÉRIDIEN', w * .58, h * .63, 10);
  ctx.fillStyle = '#e15b4f'; ctx.fillRect(w * .49 - 3, h * .62 - 3, 6, 6);
}

const points = values => Object.freeze(values.map(value => Object.freeze(value)));
// The corrected M577 has a high rear bumper: its native drop hitch reaches the
// same tow height as the two project trailers. All source profiles face right.
export const ACT5_CONVOY_PROFILES_V188 = Object.freeze({
  'm577-side-corrected': Object.freeze({ ground: Object.freeze([874, 720.5]), front: Object.freeze([2133, 499]), rear: Object.freeze([44, 475]), rearMount: Object.freeze([44, 326]), wheels: points([[283, 718], [1465, 723]]) }),
  'colonist-trailer': Object.freeze({ ground: Object.freeze([1059, 706]), front: Object.freeze([2120, 376]), rear: Object.freeze([77, 370]), wheels: points([[589, 706], [1529, 706]]) }),
  'freight-trailer': Object.freeze({ ground: Object.freeze([1058.5, 705]), front: Object.freeze([2117, 376]), rear: Object.freeze([77, 370]), wheels: points([[589, 705], [1528, 705]]) })
});
export const ACT5_BRIDGE_ROAD_V188 = points([[0, 344], [740, 347], [1238, 354], [1485, 376], [1620, 385], [1745, 373], [1939, 333]]);
export const ACT5_TRAILER_PASSENGERS_V188 = points([[520, 460], [720, 460], [1030, 460], [1480, 460]]);
const trailerWindows = Object.freeze([[438, 135, 382, 190], [892, 136, 370, 188], [1350, 134, 325, 190]].map(rect => Object.freeze(rect)));
function rotatePoint([x, y], [px, py], angle) {
  const c = Math.cos(angle), s = Math.sin(angle), dx = x - px, dy = y - py;
  return [px + dx * c - dy * s, py + dx * s + dy * c];
}
function vehiclePlacement(images, id, x, ground, width, facing = -1, angle = 0) {
  const profile = ACT5_CONVOY_PROFILES_V188[id], [sx, sy, sw, sh] = ACT5_ART_SOURCE_RECTS_V188[id], scale = width / sw;
  const y = ground - (profile.ground[1] - sy) * scale;
  const raw = a => [x + (facing === 1 ? a[0] - sx : sx + sw - a[0]) * scale, y + (a[1] - sy) * scale];
  const pivot = raw(profile.ground), point = a => rotatePoint(raw(a), pivot, angle);
  return { id, x, y, w: width, h: sh * scale, sx, sy, sw, sh, scale, ground, facing, angle, pivot,
    front: point(profile.front), rear: point(profile.rear), rearMount: profile.rearMount ? point(profile.rearMount) : null, wheelContacts: profile.wheels.map(point) };
}
function roadHeight(road, x) {
  for (let i = 1; i < road.length; i++) if (x <= road[i][0]) { const a = road[i - 1], b = road[i]; return a[1] + (b[1] - a[1]) * Math.max(0, (x - a[0]) / (b[0] - a[0])); }
  return road[road.length - 1][1];
}
function onRoad(images, road, id, x, width) {
  let fit = vehiclePlacement(images, id, x, 0, width), angle = 0;
  const raw = [...fit.wheelContacts].sort((a, b) => a[0] - b[0]), sourceAngle = Math.atan2(raw[1][1] - raw[0][1], raw[1][0] - raw[0][0]);
  for (let i = 0; i < 3; i++) {
    const wheels = [...fit.wheelContacts].sort((a, b) => a[0] - b[0]), ys = wheels.map(p => roadHeight(road, p[0]));
    angle = Math.atan2(ys[1] - ys[0], wheels[1][0] - wheels[0][0]) - sourceAngle;
    fit = vehiclePlacement(images, id, x, (ys[0] + ys[1]) / 2, width, -1, angle);
  }
  return fit;
}
export function act5ConvoyLayoutV188(images, w = 640, h = 280) {
  const background = act5ArtFitV188(images, 'bridge-collapse', [0, 0, w, h], { cover: true });
  const road = background ? ACT5_BRIDGE_ROAD_V188.map(([x, y]) => [background.x + (x - background.sx) * background.scale, background.y + (y - background.sy) * background.scale]) : [[0, h * .7], [w * .64, h * .7], [w, h * .86]];
  const m577 = onRoad(images, road, 'm577-side-corrected', w * .06, w * .31);
  const colonists = onRoad(images, road, 'colonist-trailer', w * .39, w * .23);
  const freight = onRoad(images, road, 'freight-trailer', w * .64, w * .23);
  return { vehicles: [m577, colonists, freight], couplings: [[m577.rear, colonists.front], [colonists.rear, freight.front]], road };
}
function passengers(ctx, images) {
  const loader = { image: id => imageAt(images, id), usage: Object.create(null) };
  ctx.save(); ctx.beginPath(); for (const rect of trailerWindows) ctx.rect(...rect); ctx.clip();
  ACT5_TRAILER_PASSENGERS_V188.forEach(([x, floor], i) => {
    ctx.save(); ctx.translate(x, floor); ctx.scale(300 / 89, 300 / 89);
    drawAsphodeleActorV188(ctx, loader, ACT5_CIVILIAN_ART_IDS_V188[i % 3], 0, 0, { facing: 1, moving: false, still: true }); ctx.restore();
  });
  ctx.fillStyle = 'rgba(23,42,46,.14)'; for (const rect of trailerWindows) ctx.fillRect(...rect); ctx.restore();
}
function vehicle(ctx, images, fit, occupied = false) {
  const image = imageAt(images, fit.id);
  ctx.save(); ctx.translate(...fit.pivot); ctx.rotate(fit.angle); ctx.translate(-fit.pivot[0], -fit.pivot[1]);
  if (image) {
    ctx.save(); ctx.translate(fit.x + (fit.facing === -1 ? fit.w : 0), fit.y); ctx.scale(fit.facing * fit.scale, fit.scale); ctx.translate(-fit.sx, -fit.sy);
    ctx.drawImage(image, fit.sx, fit.sy, fit.sw, fit.sh, fit.sx, fit.sy, fit.sw, fit.sh);
    if (occupied) passengers(ctx, images); ctx.restore();
  } else if (fit.id === 'm577-side-corrected') {
    const s = fit.w / 250; ctx.save(); ctx.translate(fit.x + (fit.facing === 1 ? fit.w : 0), fit.ground - 24 * s); ctx.scale(fit.facing === 1 ? -s : s, s); apc(ctx, 0, 0, 1); ctx.restore();
  } else {
    ctx.fillStyle = fit.id === 'freight-trailer' ? '#4a4438' : '#3c4a4b'; ctx.fillRect(fit.x, fit.ground - fit.w * .28, fit.w, fit.w * .21);
    ctx.fillStyle = '#101214'; for (const at of [.2, .78]) { const r = fit.w * .065; ctx.beginPath(); ctx.arc(fit.x + fit.w * at, fit.ground - r, r, 0, Math.PI * 2); ctx.fill(); }
    if (occupied) for (let i = 0; i < 4; i++) person(ctx, fit.x + fit.w * (.25 + i * .15), fit.ground - fit.w * .1, fit.w * .16, '#9ba396');
  }
  ctx.restore();
  if (fit.rearMount) { ctx.strokeStyle = '#727971'; ctx.lineWidth = Math.max(2, fit.w * .012); ctx.beginPath(); ctx.moveTo(...fit.rearMount); ctx.lineTo(...fit.rear); ctx.stroke(); }
}
function bridge(ctx, images, w, h, o) {
  flat(ctx, w, h, '#080d11');
  if (!paint(ctx, images, 'bridge-collapse', [0, 0, w, h], { cover: true })) { ctx.strokeStyle = '#556169'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, h * .7); ctx.lineTo(w * .64, h * .7); ctx.lineTo(w, h * .86); ctx.stroke(); }
  const layout = act5ConvoyLayoutV188(images, w, h);
  for (const [a, b] of layout.couplings) { ctx.strokeStyle = '#7a7770'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.fillStyle = '#e15b4f'; ctx.fillRect((a[0] + b[0]) / 2 - 3, (a[1] + b[1]) / 2 - 3, 6, 6); }
  for (const fit of layout.vehicles) vehicle(ctx, images, fit, fit.id === 'colonist-trailer');
  const colonists = layout.vehicles[1], freight = layout.vehicles[2];
  ink(ctx, en(o) ? 'LATE COLONISTS' : 'COLONS EN RETARD', colonists.x, colonists.y - 9, 11, '#e6efe6', colonists.w);
  ink(ctx, en(o) ? 'FREIGHT' : 'FRET', freight.x + freight.w * .25, freight.y - 9, 11, '#e6efe6');
  rain(ctx, w, h, o.time, o.reducedMotion, .18);
}
function departure(ctx, images, w, h, o) {
  flat(ctx, w, h, '#0b1117'); const background = paint(ctx, images, 'm577-rain-departure', [0, 0, w, h], { cover: true });
  const drive = o.reducedMotion ? .3 : Math.min(1, Math.max(0, o.progress || 0));
  const ground = act5ArtAnchorV188(background, 'ground')?.[1] ?? h * .84;
  const fit = vehiclePlacement(images, 'm577-side-corrected', w * (.48 - drive * .36), ground, w * .4); vehicle(ctx, images, fit);
  civilians(ctx, images, w, h, Math.max(0, 5 - Math.floor(drive * 6)), { left: .77, right: .91, floor: ground / h, height: .22, moving: true, facing: -1, time: o.time, reducedMotion: o.reducedMotion });
  rain(ctx, w, h, o.time, o.reducedMotion);
}
function standoff(ctx, images, w, h, o) {
  flat(ctx, w, h); paint(ctx, images, 'quay-standoff', [0, 0, w, h], { cover: true });
  civilians(ctx, images, w, h, 7, { left: .07, right: .3, floor: .92, height: .36, stagger: true });
  actor(ctx, images, 'marine', w * .37, h * .92, h * .36);
  for (let i = 0; i < 6; i++) actor(ctx, images, 'commando', w * (.59 + i * .057), h * .92, h * .36, -1);
  rain(ctx, w, h, o.time, o.reducedMotion, .13);
}
export const ACT5_GATE_V188 = Object.freeze({ sourceSize: Object.freeze([1939, 811]), ...ACT5_ART_ANCHORS_V188['port-gates-rollcall'], counter: Object.freeze([.5, .15]) });
export function act5GateLayoutV188(images, w, h) {
  const background = act5ArtFitV188(images, 'port-gates-rollcall', [0, 0, w, h], { cover: true });
  return { aperture: act5ArtAnchorV188(background, 'aperture') || [w * .44, h * .45, w * .12, h * .4],
    leftPocket: act5ArtAnchorV188(background, 'leftPocket'), rightPocket: act5ArtAnchorV188(background, 'rightPocket') };
}
function gateLeaves(ctx, { aperture: [ax, ay, aw, ah], leftPocket, rightPocket }, reach, image = null) {
  const leaf = aw / 2, pockets = [leftPocket, rightPocket].filter(Boolean);
  // The painted leaves vacate their parked pockets. Covering those exact source
  // windows prevents the image plus the native sliding leaves from making four.
  for (const [x, y, w, h] of pockets) {
    const shade = ctx.createLinearGradient?.(x, y, x + w, y);
    if (shade) { shade.addColorStop(0, '#05090c'); shade.addColorStop(.45, '#152025'); shade.addColorStop(1, '#060b0e'); }
    ctx.fillStyle = shade || '#0a1216'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#273033'; ctx.fillRect(x + w * .07, y, 2, h); ctx.fillRect(x + w * .92, y, 2, h);
    ctx.fillStyle = 'rgba(110,123,122,.12)'; for (let row = 0; row < 6; row++) ctx.fillRect(x + w * .15, y + h * (.12 + row * .145), w * .7, 1);
  }
  ctx.save(); ctx.beginPath(); ctx.rect(ax, ay, aw, ah); for (const pocket of pockets) ctx.rect(...pocket); ctx.clip();
  for (const side of [0, 1]) {
    const parked = side ? rightPocket?.[0] ?? ax + aw : leftPocket?.[0] ?? ax - leaf;
    const closed = ax + side * leaf, x = parked + (closed - parked) * reach;
    if (image) {
      const source = ACT5_GATE_V188[side ? 'rightPocket' : 'leftPocket'], scale = Math.max(leaf / source[2], ah / source[3]);
      ctx.save(); ctx.beginPath(); ctx.rect(x, ay, leaf, ah); ctx.clip();
      ctx.drawImage(image, ...source, x, ay + ah - source[3] * scale, source[2] * scale, source[3] * scale); ctx.restore(); continue;
    }
    ctx.fillStyle = '#424e4c'; ctx.fillRect(x, ay, leaf, ah); ctx.strokeStyle = '#81877d'; ctx.lineWidth = 2; ctx.strokeRect(x + 2, ay + 2, leaf - 4, ah - 4);
    ctx.fillStyle = '#303c3c'; ctx.fillRect(x + leaf * .12, ay + ah * .12, leaf * .76, ah * .6);
    ctx.strokeStyle = '#6e7770'; ctx.lineWidth = Math.max(2, leaf * .045); ctx.beginPath(); ctx.moveTo(x + leaf * .13, ay + ah * .7); ctx.lineTo(x + leaf * .87, ay + ah * .15); ctx.stroke();
    ctx.fillStyle = '#a58c47'; ctx.fillRect(x + 2, ay + ah * .84, leaf - 4, ah * .065);
    ctx.fillStyle = '#242d2c'; for (let at = .08; at < .9; at += .19) { ctx.beginPath(); ctx.moveTo(x + leaf * at, ay + ah * .905); ctx.lineTo(x + leaf * (at + .1), ay + ah * .84); ctx.lineTo(x + leaf * (at + .19), ay + ah * .84); ctx.lineTo(x + leaf * (at + .09), ay + ah * .905); ctx.closePath(); ctx.fill(); }
  }
  ctx.restore();
}
function rollcall(ctx, images, w, h, o) {
  flat(ctx, w, h); paint(ctx, images, 'port-gates-rollcall', [0, 0, w, h], { cover: true });
  const total = rollCallCount(o.context?.rollCall), p = Math.min(1, Math.max(0, o.progress || 0));
  const shown = o.reducedMotion || o.closing ? total : Math.ceil(total * Math.min(1, p * 1.4));
  const gate = act5GateLayoutV188(images, w, h), [ax, ay, aw, ah] = gate.aperture;
  if (o.closing) {
    ctx.save(); ctx.beginPath(); ctx.rect(ax, ay, aw, ah); ctx.clip();
    civilians(ctx, images, w, h, Math.min(8, total), { left: (ax + aw * .12) / w, right: (ax + aw * .88) / w, floor: (ay + ah * .94) / h, height: ah * .39 / h }); ctx.restore();
    gateLeaves(ctx, gate, o.reducedMotion ? 1 : p, imageAt(images, 'port-gates-rollcall'));
  } else {
    const n = Math.min(24, shown);
    for (let i = n - 1; i >= 0; i--) {
      const depth = n <= 1 ? .3 : i / (n - 1), x = w * .13 + (ax + aw * .48 - w * .13) * depth;
      civilian(ctx, images, i, x, h * .96 + (ay + ah * .96 - h * .96) * depth, h * (.23 - depth * .105), { moving: true, time: o.time, reducedMotion: o.reducedMotion });
    }
  }
  ctx.fillStyle = 'rgba(2,7,8,.8)'; ctx.fillRect(w * .43, h * .04, w * .14, h * .15);
  ctx.textAlign = 'center'; ink(ctx, shown, w * ACT5_GATE_V188.counter[0], h * ACT5_GATE_V188.counter[1], 44 * w / 1280, '#e6efe6'); ctx.textAlign = 'left';
  rain(ctx, w, h, o.time, o.reducedMotion, .09);
}
function orbital(ctx, images, w, h, o, transmit) {
  ctx.fillStyle = '#020305'; ctx.fillRect(0, 0, w, h);
  if (!paint(ctx, images, 'starfield', [0, 0, w, h], { cover: true })) stars(ctx, w, h, 140, 3);
  if (transmit && !paint(ctx, images, 'planet', [w * .58, h * .64, w * .8, w * .8])) planet(ctx, w, h);
  const cx = w * (transmit ? .42 : .55), cy = h * .48, diameter = Math.min(h * .82, w * .39), hubSize = diameter * 96 / 440;
  const ring = paint(ctx, images, 'asph-ring', [cx - diameter / 2, cy - diameter / 2, diameter, diameter]);
  if (!ring) { ctx.strokeStyle = '#59606a'; ctx.lineWidth = diameter * .055; ctx.beginPath(); ctx.arc(cx, cy, diameter * .46, 0, Math.PI * 2); ctx.stroke(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * diameter * .46, cy + Math.sin(a) * diameter * .46); ctx.stroke(); } }
  if (!paint(ctx, images, 'asph-hub', [cx - hubSize / 2, cy - hubSize / 2, hubSize, hubSize])) { ctx.fillStyle = '#3b4047'; ctx.beginPath(); ctx.arc(cx, cy, hubSize / 2, 0, Math.PI * 2); ctx.fill(); }
  if (transmit || o.context?.asphodeleRetaken) { ctx.fillStyle = '#e8d5a8'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.fillRect(cx + Math.cos(a) * diameter * .46 - 1.5, cy + Math.sin(a) * diameter * .46 - 1.5, 3, 3); } }
  else { ctx.fillStyle = '#a7352b'; ctx.fillRect(cx - 1, cy - 1, 2, 2); }
  if (transmit) { const reach = o.reducedMotion ? 1 : Math.min(1, (o.progress || 0) * 1.3); ctx.strokeStyle = GREEN; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + diameter * .46, cy); ctx.lineTo(cx + diameter * .46 + w * .45 * reach, cy - h * .42 * reach); ctx.stroke(); }
}
function freight(ctx, images, w, h, o) {
  flat(ctx, w, h); paint(ctx, images, 'quay-standoff', [0, 0, w, h], { cover: true });
  if (!paint(ctx, images, 'company-shuttle', [w * .52, h * .15, w * .44, h * .56], { alignY: 1 })) { ctx.fillStyle = '#50585a'; ctx.fillRect(w * .57, h * .4, w * .3, h * .22); }
  const trailer = vehiclePlacement(images, 'freight-trailer', w * .31, h * .79, w * .23, 1); vehicle(ctx, images, trailer);
  actor(ctx, images, 'commando', w * .7, h * .86, h * .25, -1);
  civilians(ctx, images, w, h, 10, { left: .04, right: .27, floor: .97, height: .26, stagger: true });
  ctx.fillStyle = '#c1a657'; ctx.fillRect(0, h * .83, w * .47, 3);
  ctx.fillStyle = 'rgba(255,196,110,.12)'; ctx.beginPath(); ctx.moveTo(w * .2, 0); ctx.lineTo(w * .04, h); ctx.lineTo(w * .49, h); ctx.closePath(); ctx.fill();
}
function living(ctx, images, w, h, o) {
  flat(ctx, w, h, '#3e3030'); paint(ctx, images, 'colony-walls', [0, 0, w, h], { cover: true });
  const lift = o.reducedMotion ? 0 : (o.progress || 0) * h * .05; ctx.fillStyle = 'rgba(35,39,42,.42)';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(w * (.13 + i * .18), h * .38 - lift - i % 2 * 10, h * (.055 + i % 3 * .018), 0, Math.PI * 2); ctx.fill(); }
  civilians(ctx, images, w, h, 9, { left: .15, right: .79, floor: .31, height: .075 });
  paint(ctx, images, 'company-shuttle', [w * .64, h * .08, w * .09, h * .12]);
}
const cryopodHood = points([[44, 60], [48, 28], [59, 18], [168, 18], [178, 31], [178, 62], [165, 69], [54, 69]]);
export function act5CryopodLidV188(progress = 0, reducedMotion = false) {
  const open = reducedMotion ? 1 : Math.min(1, Math.max(0, progress) * 1.5);
  return { open, angle: open * .72, hinge: ACT5_ART_ANCHORS_V188.cryopod.hinge };
}
function hoodPath(ctx) { ctx.beginPath(); ctx.moveTo(...cryopodHood[0]); for (const point of cryopodHood.slice(1)) ctx.lineTo(...point); ctx.closePath(); }
function cryopod(ctx, images, box, progress, reducedMotion) {
  const fit = paint(ctx, images, 'cryopod', box, { alignY: 1 }), lid = act5CryopodLidV188(progress, reducedMotion);
  if (!fit) {
    const [x, y, w, h] = box; ctx.fillStyle = '#293b42'; ctx.fillRect(x, y + h * .2, w, h * .8); ctx.fillStyle = '#101b20'; ctx.fillRect(x + 4, y + h * .28, w - 8, h * .48);
    ctx.save(); ctx.translate(x + w, y + h * .7); ctx.rotate(lid.angle); ctx.fillStyle = '#65868e'; ctx.fillRect(-w, -h * .5, w, h * .5); ctx.restore(); return;
  }
  ctx.save(); ctx.translate(fit.x - fit.sx * fit.scale, fit.y - fit.sy * fit.scale); ctx.scale(fit.scale, fit.scale);
  hoodPath(ctx); ctx.fillStyle = '#101c22'; ctx.fill(); ctx.strokeStyle = '#5b7780'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#304a50'; ctx.fillRect(64, 34, 88, 25); ctx.fillStyle = '#698386'; ctx.fillRect(142, 36, 16, 21);
  const end = rotatePoint([52, 58], lid.hinge, lid.angle); ctx.strokeStyle = '#829797'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(49, 75); ctx.lineTo(...end); ctx.stroke();
  // Rotate only the measured glass hood around its end hinge. The untouched
  // body stays planted while the four cavities become visibly open.
  ctx.save(); ctx.translate(...lid.hinge); ctx.rotate(lid.angle); ctx.translate(-lid.hinge[0], -lid.hinge[1]); hoodPath(ctx); ctx.clip();
  ctx.drawImage(imageAt(images, 'cryopod'), 44, 15, 136, 56, 44, 15, 136, 56); ctx.restore(); ctx.restore();
}
function locker(ctx, images, w, h, o) {
  flat(ctx, w, h); paint(ctx, images, 'cryo-room', [0, 0, w, h], { cover: true, alignY: .8 });
  // Two full-length capsules at the near floor, two smaller ones further back.
  // Their floor/scale pairing keeps an adult capsule plausible beside the locker.
  for (const row of [{ xs: [.15, .43], width: .21, floor: .7, height: .3 }, { xs: [.07, .38], width: .27, floor: .95, height: .36 }]) {
    for (const x of row.xs) cryopod(ctx, images, [w * x, h * (row.floor - row.height), w * row.width, h * row.height], o.progress || 0, o.reducedMotion);
  }
  const fit = paint(ctx, images, 'echo8-locker-epilogue', [w * .7, h * .11, w * .19, h * .82], { alignY: 1 });
  const x = fit?.x ?? w * .72, y = fit?.y ?? h * .11, width = fit?.w ?? w * .15, height = fit?.h ?? h * .82;
  if (!fit) { ctx.fillStyle = '#24343b'; ctx.fillRect(x, y, width, height); ctx.strokeStyle = '#536664'; ctx.strokeRect(x + 2, y + 2, width - 4, height - 4); }
  const label = act5ArtAnchorV188(fit, 'label') || [x + width * .08, y + height * .14, width * .84, height * .18];
  if (!fit) { ctx.fillStyle = '#101b1d'; ctx.fillRect(...label); } ctx.textAlign = 'center';
  ink(ctx, 'ECHO-8', label[0] + label[2] / 2, label[1] + label[3] * .4, Math.min(14, label[3] * .43), fit ? '#142320' : '#d8e6d8', label[2] - 4);
  ink(ctx, String(o.context?.lockerLabel || ''), label[0] + label[2] / 2, label[1] + label[3] * .82, Math.min(11, label[3] * .35), fit ? '#1b2d23' : '#e9d07a', label[2] - 4); ctx.textAlign = 'left';
}
/** Draw a complete layered picture. A missing layer retains a native substitute. */
export function drawAct5ArtV188(ctx, id, width, height, { images = {}, ...options } = {}) {
  const entry = getAct5SlotV188(id); if (!entry) throw new Error(`Unknown Act V art slot: ${id}`);
  const any = ACT5_ART_BY_SLOT_V188[id].some(key => imageAt(images, key)); if (!any) return false;
  const band = entry.use === 'cinematic' ? height * 92 / 720 : 0, w = width, h = height - band * 2, o = { time: 0, progress: 0, reducedMotion: false, ...options };
  ctx.fillStyle = '#020405'; ctx.fillRect(0, 0, width, height); ctx.save(); ctx.translate(0, band); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
  try {
    switch (id) {
      case 'halloran-order': halloran(ctx, images, w, h, o); break;
      case 'war-council-table': council(ctx, images, w, h, o); break;
      case 'bridge-collapse': bridge(ctx, images, w, h, o); break;
      case 'quay-standoff': standoff(ctx, images, w, h, o); break;
      case 'tantalus-epilogue': flat(ctx, w, h); paint(ctx, images, 'cryo-room', [0, 0, w, h], { cover: true, alignY: .7 }); break;
      case 'm577-rain-departure': departure(ctx, images, w, h, o); break;
      case 'port-gates-rollcall': rollcall(ctx, images, w, h, o); break;
      case 'ending-relay-transmit': orbital(ctx, images, w, h, o, true); break;
      case 'asphodele-epilogue': orbital(ctx, images, w, h, o, false); break;
      case 'ending-freight-handover': freight(ctx, images, w, h, o); break;
      case 'ending-living-dawn': living(ctx, images, w, h, o); break;
      case 'port-meridien-epilogue': flat(ctx, w, h); paint(ctx, images, 'port-meridien-epilogue', [0, 0, w, h], { cover: true }); break;
      case 'echo8-locker-epilogue': locker(ctx, images, w, h, o); break;
      case 'credits-starfield': paint(ctx, images, 'starfield', [0, 0, w, h], { cover: true }); break;
    }
  } finally { ctx.restore(); }
  return true;
}
/** Rook's existing personal terminal, gated to his Act V dialogue. */
export function drawAct5DialogueV188(ctx, id, scene, { images = {}, time = 0, reducedMotion = false } = {}) {
  return id === 'cin-61' && scene === 'quarters' && drawStationBackgroundV188(ctx, images, 'cin-70', 'quarters', { time, reducedMotion });
}

/** Lazily loads the actual layers of a selected slot, with late-picture redraw. */
export class Act5AssetLoaderV188 {
  constructor({ ImageCtor = globalThis.Image, present = ACT5_FILES_PRESENT_V188 } = {}) {
    this.ImageCtor = ImageCtor; this.present = new Set(present); this.images = new Map(); this.states = new Map();
    this.listeners = new Map(); this.requested = []; this.usage = Object.create(null);
  }
  preload(ids = ACT5_ACTIVE_SLOT_IDS_V188) {
    const layers = new Set(ids.filter(id => this.present.has(id)).flatMap(id => ACT5_ART_BY_SLOT_V188[id] || []));
    for (const id of layers) {
      const entry = ACT5_ART_V188[id], prior = this.images.get(id);
      if (!entry || !this.ImageCtor || (prior && this.states.get(id) !== 'error')) continue;
      const image = new this.ImageCtor(); this.images.set(id, image); this.states.set(id, 'loading'); this.requested.push(entry.path);
      const finish = state => {
        if (this.images.get(id) !== image || this.states.get(id) !== 'loading') return;
        this.states.set(id, state); image.removeEventListener?.('load', ready); image.removeEventListener?.('error', failed);
        if (!image.addEventListener) { image.onload = null; image.onerror = null; }
        for (const [slot, listeners] of this.listeners) if (ACT5_ART_BY_SLOT_V188[slot]?.includes(id)) for (const notify of [...listeners]) notify();
      };
      const ready = () => finish(imageReady(image) ? 'ready' : 'error'), failed = () => finish('error');
      if (image.addEventListener) { image.addEventListener('load', ready); image.addEventListener('error', failed); }
      else { image.onload = ready; image.onerror = failed; }
      try { image.src = entry.path; } catch { failed(); }
      if (imageReady(image)) ready();
    }
    return this.requested.slice();
  }
  subscribe(id, notify) {
    if (!getAct5SlotV188(id) || typeof notify !== 'function') return () => {};
    let listeners = this.listeners.get(id); if (!listeners) { listeners = new Set(); this.listeners.set(id, listeners); }
    listeners.add(notify);
    return () => { listeners.delete(notify); if (!listeners.size) this.listeners.delete(id); };
  }
  image(id) { const image = this.images.get(id); return this.states.get(id) !== 'error' && imageReady(image) ? image : null; }
  /** Draws the slot over the (0, 0, width, height) box; returns 'image' or 'primitive'.
   * Same signature as ContentGapAssetLoaderV188.draw, so it can be passed to the scene dialog. */
  draw(ctx, id, width, height, options = {}) {
    if (!getAct5SlotV188(id)) throw new Error(`Unknown Act V art slot: ${id}`);
    const images = options.images || Object.fromEntries((ACT5_ART_BY_SLOT_V188[id] || []).map(key => [ACT5_ART_V188[key].path, this.image(key)]));
    let source = 'primitive'; ctx.save();
    try {
      ctx.beginPath(); ctx.rect(0, 0, width, height); ctx.clip();
      if (drawAct5ArtV188(ctx, id, width, height, { ...options, images })) source = 'image';
      else PRIMITIVES[id](ctx, width, height, options);
    } finally { ctx.restore(); }
    this.usage[id] = source;
    return source;
  }
}

/** A one-shot UI picture may finish loading after its first draw. This binding
 * owns only its repaint; disposing it never commits a choice or changes time. */
export function watchAct5PictureV188(loader, ctx, id, width, height, options = {}) {
  let active = true;
  const redraw = () => { if (active && ctx) loader.draw(ctx, id, width, height, options); };
  const release = loader.subscribe(id, redraw); loader.preload([id]); redraw();
  return () => { active = false; release(); };
}
