// V188 — named art slots for Act V « Non viable », the endings and the epilogue
// (spec 006). Same contract as `insertion-asset-slots-v188.js` and
// `content-gap-slots-v188.js`: image generation is deferred, every picture is
// drawn with Canvas primitives as a PLACEHOLDER and routed through one of these
// slots. When an image is produced for a slot, commit it at the slot's path AND
// add the slot id to ACT5_FILES_PRESENT_V188; only listed slots are ever
// requested, so the game never asks the network for a missing file.
// Briefs separate what the films document from the project's adaptation; a
// generated image would not certify any franchise fidelity.

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
    'Documented reference: the M577 APC of Aliens (1986), long low wedge hull, four road wheels per side, roof turret; project adaptation: night, heavy rain, an industrial complex gate behind, workers climbing aboard; side view.'),
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
// Empty until art is produced; a test checks that every listed file exists.
export const ACT5_FILES_PRESENT_V188 = Object.freeze([]);
export const getAct5SlotV188 = id => ACT5_SLOTS_V188.find(entry => entry.id === id) || null;

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
function apc(ctx, x, y, s = 1) { // M577 silhouette in side view (low wedge, four wheels, rear turret)
  ctx.fillStyle = '#3d4636'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40 * s, y - 34 * s); ctx.lineTo(x + 230 * s, y - 34 * s); ctx.lineTo(x + 250 * s, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2e3529'; ctx.fillRect(x + 160 * s, y - 52 * s, 50 * s, 18 * s); ctx.fillRect(x + 205 * s, y - 47 * s, 34 * s, 5 * s);
  ctx.fillStyle = '#111'; for (let i = 0; i < 4; i += 1) { ctx.beginPath(); ctx.arc(x + (40 + i * 56) * s, y + 4 * s, 15 * s, 0, Math.PI * 2); ctx.fill(); }
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
    ctx.fillStyle = '#3a3226'; ctx.fillRect(w * .32, h * .58, 90, 26); // freight trailer
    ctx.fillStyle = '#2c3640'; ctx.fillRect(w * .5, h * .58, 90, 26); // colonists' trailer
    ctx.fillStyle = '#e15b4f'; ctx.fillRect(w * .31, h * .65, 6, 6); ctx.fillRect(w * .49, h * .65, 6, 6);
    ctx.fillStyle = '#d8e6d8'; ctx.font = '11px monospace'; ctx.fillText(en(o) ? 'FREIGHT' : 'FRET', w * .34, h * .56); ctx.fillText(en(o) ? 'LATE COLONISTS' : 'COLONS EN RETARD', w * .5, h * .56);
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
    const total = Math.max(0, Math.min(40, Number(o?.context?.rollCall) || 0)), shown = Math.ceil(total * Math.min(1, (o?.progress || 0) * 1.4));
    people(ctx, w * .1, h * .92, Math.min(24, shown), 44);
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

/** Real image when one is committed for the slot, the primitive drawing otherwise. */
export class Act5AssetLoaderV188 {
  constructor({ ImageCtor = globalThis.Image, present = ACT5_FILES_PRESENT_V188 } = {}) {
    this.ImageCtor = ImageCtor; this.present = new Set(present); this.images = new Map(); this.requested = []; this.usage = Object.create(null);
  }
  preload(ids = ACT5_SLOT_IDS_V188) {
    for (const id of ids) {
      const entry = getAct5SlotV188(id);
      if (!entry || !this.present.has(id) || this.images.has(id) || !this.ImageCtor) continue;
      const image = new this.ImageCtor(); image.src = entry.path; this.images.set(id, image); this.requested.push(entry.path);
    }
    return this.requested.slice();
  }
  image(id) { const image = this.images.get(id); return image?.complete && image.naturalWidth > 0 ? image : null; }
  /** Draws the slot over the (0, 0, width, height) box; returns 'image' or 'primitive'.
   * Same signature as ContentGapAssetLoaderV188.draw, so it can be passed to the scene dialog. */
  draw(ctx, id, width, height, options = {}) {
    if (!getAct5SlotV188(id)) throw new Error(`Unknown Act V art slot: ${id}`);
    const image = this.image(id);
    let source = 'primitive';
    if (image) { ctx.drawImage(image, 0, 0, width, height); source = 'image'; }
    else { ctx.save(); PRIMITIVES[id](ctx, width, height, options); ctx.restore(); }
    this.usage[id] = source;
    return source;
  }
}
