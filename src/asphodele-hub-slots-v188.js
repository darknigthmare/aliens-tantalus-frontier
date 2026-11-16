// V188 — named art slots for the Asphodèle second hub (spec 007). Same contract
// as `insertion-asset-slots-v188.js`: Canvas primitives remain the fallback for
// every named slot. When an image is produced for a slot, commit it at the
// slot's path AND add the slot id to
// ASPHODELE_HUB_FILES_PRESENT_V188: only listed slots are ever requested.
// Scale: 1 m ≈ 51 px; the marine is 44 × 92 px; floor at y = 624.
// Briefs separate the documented franchise references (cited) from the
// project's own design. Asphodèle, CASSIUS, Echo-8 and Kessler are project
// creations; no slot claims a 1:1 fidelity.

export const ASPHODELE_HUB_ASSET_ROOT_V188 = '/assets/asphodele/v188/';
const slot = (id, layer, width, height, purpose, brief) => Object.freeze({ id, layer, width, height, purpose, brief, path: `${ASPHODELE_HUB_ASSET_ROOT_V188}${id}.png` });
const WALL = 'Back wall of a profile room, 1280 × 504 px above the floor line (y 120 → 624), tileable horizontally, no door drawn (doors are their own slot)';

export const ASPHODELE_HUB_SLOTS_V188 = Object.freeze([
  slot('asph-wall-docks', 'background', 1280, 504, 'Docking quays: the station side of the docking collars.',
    `${WALL}. Reference cited, not copied: the hangar and airlock look of Sevastopol in Alien: Isolation (2014) — heavy riveted plating, yellow-black hazard bands, CRT status boxes beside each collar. Project design: Asphodèle is a Seegson relay station (bible §7.1); three numbered collars.`),
  slot('asph-wall-ring', 'background', 1280, 504, 'Outer ring corridor (V2): the floor curves up out of sight at both ends.',
    `${WALL}. Project design (bible §42.1): a rotating outer ring, ceiling arches every 6 m, signs to the modules; tone of the Sevastopol concourses (Alien: Isolation, 2014) — cited reference only.`),
  slot('asph-wall-spoke', 'background', 1280, 504, 'Spoke A between the ring and the hub.',
    `${WALL}. Project design: a narrower service corridor with handrails and cable trays, gravity markers decreasing towards the hub [PROPOSÉ].`),
  slot('asph-wall-control', 'background', 1280, 504, 'Control deck: the station operations room.',
    `${WALL}. Reference cited: the operations room of Hadley’s Hope in Aliens (1986) — banks of monitors, a large wall map, low ceiling. Project design: Seegson consoles and the QZ network map.`),
  slot('asph-wall-relay', 'background', 1280, 504, 'Relay room: transmission bays and the held-message queue.',
    `${WALL}. Project design (bible §42.2): tall transmission racks with status lamps, a scrolling list of held messages on green CRTs.`),
  slot('asph-wall-lab', 'background', 1280, 504, 'Transit laboratory: benches and empty QZ17 cradles.',
    `${WALL}. Project design (bible §7.4): cold white light, inspection benches, wall racks of cradle clamps; the cradles themselves are a separate slot.`),
  slot('asph-wall-memorial', 'background', 1280, 504, 'Memorial: plaques and electric candles.',
    `${WALL}. Project design (bible §42.2): rows of stamped metal name plates, a shelf of electric candles; quiet amber light.`),
  slot('asph-wall-greenhouse', 'background', 1280, 504, 'Greenhouse: hydroponic bays under growth lights.',
    `${WALL}. Project design (bible §42.2): stacked hydroponic trays, magenta-white growth lamps, misting pipes.`),
  slot('asph-wall-market', 'background', 1280, 504, 'Ring market: Crucible stalls.',
    `${WALL}. Project design (bible §42.2): improvised salvage stalls, hand-painted signs, hanging parts; Crucible is a project faction.`),
  slot('asph-door', 'midground', 96, 132, 'Bulkhead door, 1.9 × 2.6 m, with a status lamp above (open: green; sealed: red).',
    'Project adaptation of a station bulkhead door (cited reference: the chunky doors of Alien: Isolation, 2014): two-leaf door, hazard edge, small window; transparent background; lamp drawn separately.'),
  slot('asph-ud4l-docked', 'midground', 360, 180, 'The Tantalus UD-4L seen through the collar window of airlock 1.',
    'UD-4L Cheyenne dropship (as seen in Aliens, 1986) nose-on to a docking collar, seen through a thick window; olive-drab; transparent background.'),
  slot('asph-crucible-shuttle', 'midground', 360, 180, 'Grue’s Crucible shuttle seen through the window of airlock 3.',
    'Project design: a battered civilian salvage shuttle, patched plating, spot welds, a crane arm; transparent background.'),
  slot('asph-cassius-core', 'prop', 160, 200, 'CASSIUS core: a wall of green CRTs with one waveform.',
    'Project design (bible §7.1): low-cost Seegson management system (Seegson and its obedient station AI are documented in Alien: Isolation, 2014; CASSIUS is a project creation). No face, no avatar.'),
  slot('asph-qz-map', 'prop', 240, 150, 'The QZ network map console of the control deck.',
    'Project design: a vector map of Cocyte, Asphodèle and the QZ relays on a green CRT, relays offline drawn as hollow squares.'),
  slot('asph-relay-bays', 'prop', 300, 260, 'Transmission bays of the relay room.',
    'Project design: three tall racks of transmitters with amber lamps, cables to the ceiling.'),
  slot('asph-cradles', 'prop', 360, 90, 'Empty QZ17 cradles in the transit laboratory.',
    'Project design (bible §7.4, consistent with CIN-11): refrigerated human-sized cradles, lids open, restraints cut; QZ17 stencils.'),
  slot('asph-memorial-plaques', 'prop', 360, 200, 'The memorial wall of names.',
    'Project design: stamped name plates in rows, one empty row for Echo-8; electric candles below.'),
  slot('asph-hydro-bays', 'prop', 360, 220, 'Hydroponic bays of the greenhouse.',
    'Project design: three stacked trays of green shoots under growth lamps.'),
  slot('asph-crucible-stall', 'prop', 320, 200, 'Crucible stall of the ring market.',
    'Project design: a counter made of a cargo crate, a rack of salvaged parts, a hand-painted sign.'),
  slot('asph-grue', 'actor', 52, 92, 'Grue, leader of the salvagers (placeholder silhouette, 1.80 m).',
    'Project character (bible §7.2): salvager in a patched vacuum suit without helmet, tool belt; transparent background; scale matches the 44 × 92 marine.'),
  // —— Spec 007 follow-up: the four reopened modules (bible §42.2) ——
  slot('asph-wall-quarters', 'background', 1280, 504, 'Quarters: bunk cabins with individual lights.',
    `${WALL}. Project design (bible §42.2): stacked crew cabins along a corridor wall, each with its own reading lamp and curtain; tone of the Sevastopol habitation decks (Alien: Isolation, 2014) — cited reference only.`),
  slot('asph-wall-medbay', 'background', 1280, 504, 'Station medbay: beds, monitors and the quarantine scanner.',
    `${WALL}. Reference cited, not copied: the medical labs of Hadley’s Hope in Aliens (1986) and the San Cristobal medical wing of Alien: Isolation (2014) — white panels, green monitors. Project design: a small Seegson station infirmary.`),
  slot('asph-wall-lower', 'background', 1280, 504, 'Lower decks: Echo-8’s barricades under emergency lamps.',
    `${WALL}. Project design (bible §7.4, §42.2): bare service deck, open ducts, red emergency lamps every 6 m, chalk marks of Echo-8.`),
  slot('asph-wall-repair', 'background', 1280, 504, 'Repair hangar (V2): a dropship cradle, an overhead crane, welding light.',
    `${WALL}. Reference cited: the Sulaco hangar of Aliens (1986) — crane rails, hazard bands. Project design: a station repair bay sized for a UD-4L.`),
  slot('asph-bunks', 'prop', 360, 220, 'Quarters: two tiers of bunk cabins and the cabin register terminal.',
    'Project design: 2 m bunks in two tiers (each tier ≈ 1.1 m), curtains, small lamps; a register terminal at chest height.'),
  slot('asph-medbay-beds', 'prop', 360, 160, 'Station medbay: two beds with monitors.',
    'Project design: 2.0 × 0.9 m beds, vital-sign monitors on arms; green CRT traces (cited look: Aliens, 1986).'),
  slot('asph-medbay-scanner', 'prop', 200, 220, 'Quarantine scanner arch of the medbay.',
    'Project design: a walk-through scanner arch 2.2 m high with an amber sweep bar; no franchise claim.'),
  slot('asph-echo8-barricade', 'prop', 300, 140, 'Echo-8’s barricade in the lower decks.',
    'Project design (bible §7.4): welded door, sandbags, crates, chalk arrow and the time 05:52; Echo-8 is a project creation.'),
  slot('asph-night-board', 'prop', 220, 160, 'Night-round board of the lower decks.',
    'Project design: a duty board with the round count and emergency-light status lamps.'),
  slot('asph-repair-cradle', 'prop', 420, 200, 'Repair hangar: the Cheyenne overhaul bench and parts rack.',
    'Project design: a workbench with thruster parts and a hoist; the UD-4L itself (Aliens, 1986) is only suggested behind it.'),
  // —— Ambient crowds of bible §42.2 (dockers, merchants, technicians), 1.75 m ≈ 89 px ——
  slot('asph-npc-docker', 'actor', 44, 89, 'Docker of the quays (placeholder silhouette).',
    'Project design: work overalls, hi-vis vest, gloves; transparent background; marine scale (44 × 92 px).'),
  slot('asph-npc-merchant', 'actor', 44, 89, 'Crucible merchant of the ring (placeholder silhouette).',
    'Project design: salvager coat with patches, satchel; Crucible is a project faction.'),
  slot('asph-npc-technician', 'actor', 44, 89, 'Station technician (placeholder silhouette).',
    'Project design: Seegson-style coverall with tool belt and tablet (cited look: Sevastopol technicians, Alien: Isolation, 2014).'),
  // —— Station dressing of the side missions, contracts and night mission (asphodele-mission-dressing-v188.js) ——
  slot('asph-msn-panel', 'background', 128, 112, 'Mission wall: riveted Seegson panel, 2.5 × 2.2 m.',
    'Reference cited, not copied: the riveted corridor plating of Sevastopol (Alien: Isolation, 2014). Project design: Asphodèle panels with a hazard strip; transparent background.'),
  slot('asph-msn-crt', 'background', 51, 41, 'Mission wall: CRT status box, 1.0 × 0.8 m.',
    'Reference cited: the green CRT terminals of Alien: Isolation (2014) and of the Hadley’s Hope operations room (Aliens, 1986). Project design: station status lines.'),
  slot('asph-msn-sign', 'background', 153, 26, 'Mission wall: station sector sign, 3.0 × 0.5 m (text drawn by the game, FR/EN).',
    'Project design: a blank sign plate with frame; the sector name is drawn in code so both languages stay readable.'),
  slot('asph-msn-conduit', 'background', 306, 12, 'Mission wall: 6 m cable tray under the ceiling.',
    'Project design: cable tray with orange clamps every 0.8 m.'),
  slot('asph-msn-blackbox', 'background', 153, 102, 'Mission feature: rack of QZ relay recorders (Drifting relay, Echo-8, Red beacon).',
    'Project design: three orange crash recorders in a wall rack; QZ relays are project creations.'),
  slot('asph-msn-resin', 'background', 153, 102, 'Mission feature: resin growth over a sealed hatch (nest, vents, night round).',
    'Reference cited: the resin-coated walls of the colony complex in Aliens (1986). Project design: a restricted-access hatch half covered.'),
  slot('asph-msn-salvage', 'background', 153, 102, 'Mission feature: Crucible salvage crates (wreck, Grue, synthetic).',
    'Project design: tagged salvage crates at 1.2 m; Crucible is a project faction.'),
  slot('asph-msn-gauge', 'background', 153, 102, 'Mission feature: sector pressure gauges (repressurisation, greenhouse).',
    'Project design: three analogue gauges and a valve wheel.'),
  slot('asph-msn-camera', 'background', 153, 102, 'Mission feature: CASSIUS surveillance camera and monitor (crew logs, CASSIUS, BISHOP-9).',
    'Project design (bible §7.1): CASSIUS camera with a red lamp, no face; CASSIUS is a project creation.')
]);
export const ASPHODELE_HUB_SLOT_IDS_V188 = Object.freeze(ASPHODELE_HUB_SLOTS_V188.map(entry => entry.id));
// A hub visit must not fetch the nine mission-only images. Missions pass their
// own explicit list to preload; the hub's existing no-argument call stays local.
const HUB_ROOM_SLOT_IDS_V188 = Object.freeze(ASPHODELE_HUB_SLOT_IDS_V188.filter(id => !id.startsWith('asph-msn-')));
// Only inspected files present in the repository are admitted. Other slots
// remain primitive-only; tests verify every admitted path exists.
export const ASPHODELE_HUB_FILES_PRESENT_V188 = Object.freeze([
  'asph-msn-panel', 'asph-msn-crt', 'asph-msn-sign', 'asph-msn-conduit',
  'asph-msn-blackbox', 'asph-msn-resin', 'asph-msn-salvage', 'asph-msn-gauge', 'asph-msn-camera'
]);
export const getAsphodeleHubSlotV188 = id => ASPHODELE_HUB_SLOTS_V188.find(entry => entry.id === id) || null;

/** Real image when one is committed for the slot, the primitive drawing otherwise. */
export class AsphodeleHubAssetLoaderV188 {
  constructor({ ImageCtor = globalThis.Image, present = ASPHODELE_HUB_FILES_PRESENT_V188 } = {}) {
    this.ImageCtor = ImageCtor; this.present = new Set(present); this.images = new Map(); this.requested = []; this.usage = Object.create(null);
  }
  preload(ids = HUB_ROOM_SLOT_IDS_V188) {
    for (const id of ids) {
      const entry = getAsphodeleHubSlotV188(id);
      if (!entry || !this.present.has(id) || this.images.has(id) || !this.ImageCtor) continue;
      const image = new this.ImageCtor(); image.src = entry.path; this.images.set(id, image); this.requested.push(entry.path);
    }
    return this.requested.slice();
  }
  image(id) { const image = this.images.get(id); return image?.complete && image.naturalWidth > 0 ? image : null; }
  /** Returns 'image' or 'primitive'. Existing hub callers retain their sizing;
   * mission cutouts opt into a proportional fit and an optional source window.
   * A source window changes sampling only: the admitted PNG is never rewritten. */
  draw(ctx, id, x, y, width, height, fallback, { fit = 'stretch', sourceRect = null } = {}) {
    if (!getAsphodeleHubSlotV188(id)) throw new Error(`Unknown Asphodèle hub art slot: ${id}`);
    const image = this.image(id); let source = 'primitive';
    if (image && fit === 'contain') {
      const rect = sourceRect || [0, 0, image.naturalWidth, image.naturalHeight];
      const valid = Array.isArray(rect) && rect.length === 4 && rect.every(Number.isFinite)
        && rect[0] >= 0 && rect[1] >= 0 && rect[2] > 0 && rect[3] > 0
        && rect[0] + rect[2] <= image.naturalWidth && rect[1] + rect[3] <= image.naturalHeight
        && Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
      if (valid) {
        const [sx, sy, sw, sh] = rect, scale = Math.min(width / sw, height / sh), dw = sw * scale, dh = sh * scale;
        ctx.drawImage(image, sx, sy, sw, sh, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh); source = 'image';
      }
    } else if (image) { ctx.drawImage(image, x, y, width, height); source = 'image'; }
    if (source === 'primitive') fallback?.(ctx, x, y, width, height);
    this.usage[id] = source; return source;
  }
}

// —— Primitive placeholders (no generated image) ——
const PALETTE = Object.freeze({
  docks: ['#1a2125', '#232c31', '#c9a54a'], plan: ['#1b2224', '#252e30', '#8fb3a8'], control: ['#141d1c', '#1d2826', '#7dff9a'],
  relay: ['#17191e', '#22252c', '#e2b53a'], lab: ['#1d2427', '#2a3438', '#cfe6ee'], memorial: ['#1c1814', '#28221b', '#e8ba77'],
  greenhouse: ['#14201a', '#1d2c23', '#d59bd8'], market: ['#221b15', '#2e241b', '#e0873a'],
  quarters: ['#1b1a1d', '#26242a', '#e8c88a'], medbay: ['#1e2528', '#2c373b', '#bfe8e0'], lower: ['#141212', '#1f1a19', '#e15b4f'],
  repair: ['#1a1e20', '#252b2e', '#e2b53a']
});
/**
 * Back wall of a module, drawn in world coordinates across [x, x + width].
 * `gaps` lists [x0, x1] spans (door frames) the floor hazard band must not cross.
 */
export function drawAsphodeleWallV188(ctx, module, x, width, time = 0, gaps = []) {
  const [dark, mid, accent] = PALETTE[module] || PALETTE.plan;
  ctx.fillStyle = dark; ctx.fillRect(x, 96, width, 528);
  ctx.fillStyle = mid; for (let px = x; px < x + width; px += 128) ctx.fillRect(px + 4, 150, 120, 420); // panels
  ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let px = x; px < x + width; px += 128) ctx.fillRect(px, 150, 4, 474);
  ctx.fillStyle = 'rgba(255,255,255,.04)'; for (let px = x; px < x + width; px += 32) ctx.fillRect(px, 560, 2, 64);
  ctx.fillStyle = '#0b0f11'; ctx.fillRect(x, 96, width, 40); // ceiling beam
  ctx.fillStyle = 'rgba(0,0,0,.5)'; for (let px = x; px < x + width; px += 306) { ctx.fillRect(px, 96, 18, 528); } // ribs every 6 m
  ctx.fillStyle = accent; ctx.globalAlpha = .75; for (let px = x + 60; px < x + width; px += 256) ctx.fillRect(px, 140, 60, 4); ctx.globalAlpha = 1; // light strips
  if (module === 'docks' || module === 'plan' || module === 'repair') {
    // Hazard band at the wall base; it stops at each door frame instead of running behind the door.
    const clear = (px, w) => !gaps.some(([g0, g1]) => px < g1 && px + w > g0);
    for (let px = x - (x % 24); px < x + width; px += 24) if (clear(px, 24)) { ctx.fillStyle = Math.floor(px / 24) % 2 ? '#111' : '#c9a54a'; ctx.fillRect(px, 600, 24, 6); }
  }
  if (module === 'lower') { ctx.fillStyle = 'rgba(225,91,79,.10)'; ctx.fillRect(x, 140, width, 470); for (let px = x - (x % 306) + 150; px < x + width; px += 306) { ctx.fillStyle = '#e15b4f'; ctx.fillRect(px, 150, 18, 8); } }
  if (module === 'medbay') { ctx.fillStyle = 'rgba(191,232,224,.06)'; ctx.fillRect(x, 140, width, 470); }
  if (module === 'quarters') { ctx.fillStyle = 'rgba(232,200,138,.05)'; ctx.fillRect(x, 140, width, 470); }
  if (module === 'greenhouse') { ctx.fillStyle = 'rgba(213,155,216,.08)'; ctx.fillRect(x, 140, width, 470); }
  if (module === 'control') { ctx.fillStyle = 'rgba(125,255,154,.05)'; for (let y = 160; y < 560; y += 6) ctx.fillRect(x, y, width, 1); }
}
/** Bulkhead door centred on cx; `state` is 'open', 'locked' or 'shuttle'. */
export function drawAsphodeleDoorV188(ctx, cx, state, time = 0, still = false) {
  const w = 96, h = 132, x = cx - w / 2, y = 624 - h;
  ctx.fillStyle = '#2b3236'; ctx.fillRect(x - 10, y - 14, w + 20, h + 14); // frame
  ctx.fillStyle = state === 'locked' ? '#1a1d20' : '#33414a'; ctx.fillRect(x, y, w / 2 - 1, h); ctx.fillRect(x + w / 2 + 1, y, w / 2 - 1, h);
  ctx.fillStyle = '#c9a54a'; for (let i = 0; i < 6; i++) ctx.fillRect(x + (i % 2 ? w - 8 : 0), y + 8 + i * 20, 8, 10); // hazard edge
  ctx.fillStyle = state === 'locked' ? '#3a2626' : '#0f1a1f'; ctx.fillRect(x + 14, y + 22, 20, 28); ctx.fillRect(x + w - 34, y + 22, 20, 28); // windows
  if (state === 'locked') { ctx.strokeStyle = '#e15b4f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 8, y + 60); ctx.lineTo(x + w - 8, y + 100); ctx.moveTo(x + w - 8, y + 60); ctx.lineTo(x + 8, y + 100); ctx.stroke(); }
  const blink = still ? 1 : (Math.floor(time * 2) % 2 ? 1 : .55);
  ctx.globalAlpha = blink; ctx.fillStyle = state === 'locked' ? '#e15b4f' : state === 'shuttle' ? '#e2b53a' : '#7dff9a'; ctx.fillRect(cx - 10, y - 24, 20, 7); ctx.globalAlpha = 1;
}
/** Wall posts and module props, by post id. Box is the post's screen box (x centre, feet on 624). */
export function drawAsphodelePostV188(ctx, id, cx, { time = 0, still = false, state = {} } = {}) {
  const pulse = still ? .5 : .5 + .5 * Math.sin(time * 3);
  ctx.save();
  switch (id) {
    case 'control-board': { // QZ network map console (asph-qz-map)
      ctx.fillStyle = '#0d1611'; ctx.fillRect(cx - 120, 400, 240, 150); ctx.strokeStyle = 'rgba(125,255,154,.6)'; ctx.strokeRect(cx - 119.5, 400.5, 239, 149);
      ctx.beginPath(); ctx.arc(cx - 30, 475, 34, 0, Math.PI * 2); ctx.stroke(); // Cocyte
      ctx.fillStyle = '#e15b4f'; ctx.fillRect(cx + 36, 438, 8, 8); // Asphodèle
      ctx.strokeStyle = 'rgba(125,255,154,.8)'; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.strokeRect(cx - 30 + Math.cos(a) * 70 - 3, 475 + Math.sin(a) * 50 - 3, 6, 6); }
      ctx.fillStyle = '#2a332e'; ctx.fillRect(cx - 60, 550, 120, 74); break;
    }
    case 'control-cassius': { // CASSIUS core (asph-cassius-core)
      const dark = state.cassius === 'erase';
      ctx.fillStyle = '#0a120d'; ctx.fillRect(cx - 80, 400, 160, 200); ctx.fillStyle = '#1d2826'; ctx.fillRect(cx - 86, 600, 172, 24);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { ctx.fillStyle = dark ? '#050806' : '#06200f'; ctx.fillRect(cx - 70 + c * 72, 410 + r * 62, 64, 52); }
      if (!dark) { ctx.strokeStyle = state.cassius === 'restrain' ? 'rgba(226,181,58,.8)' : 'rgba(125,255,154,.9)'; ctx.lineWidth = 2; ctx.beginPath();
        for (let px = 0; px <= 136; px += 4) ctx.lineTo(cx - 68 + px, 500 + Math.sin(px * .2 + time * 6) * 10 * (still ? .4 : pulse)); ctx.stroke(); }
      break;
    }
    case 'relay-bays': { // transmission racks (asph-relay-bays)
      for (let i = 0; i < 3; i++) { const x = cx - 150 + i * 104; ctx.fillStyle = '#20242b'; ctx.fillRect(x, 364, 92, 260);
        for (let l = 0; l < 8; l++) { ctx.fillStyle = state.relayOnline ? (l % 3 === i % 3 ? '#7dff9a' : '#2f6d45') : (l === 0 ? '#e2b53a' : '#3b3424'); ctx.fillRect(x + 10, 380 + l * 28, 14, 8); ctx.fillStyle = '#14171c'; ctx.fillRect(x + 32, 378 + l * 28, 50, 14); } }
      ctx.fillStyle = '#0b1410'; ctx.fillRect(cx + 170, 360, 150, 130); ctx.fillStyle = 'rgba(125,255,154,.45)';
      const scroll = still ? 0 : Math.floor(time * 3) % 9; for (let i = 0; i < 9; i++) ctx.fillRect(cx + 180, 370 + ((i + scroll) % 9) * 13, 60 + (i * 23) % 70, 5); break;
    }
    case 'lab-archives': { ctx.fillStyle = '#132024'; ctx.fillRect(cx - 50, 470, 100, 154); ctx.fillStyle = '#0b1416'; ctx.fillRect(cx - 40, 480, 80, 60);
      ctx.fillStyle = 'rgba(207,230,238,.5)'; for (let i = 0; i < 5; i++) ctx.fillRect(cx - 34, 488 + i * 10, 40 + (i * 13) % 30, 3); break; }
    case 'memorial-plaques': { ctx.fillStyle = '#2a231b'; ctx.fillRect(cx - 180, 380, 360, 200);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { ctx.fillStyle = r === 4 ? '#3a3226' : '#9a8b6e'; ctx.fillRect(cx - 168 + c * 58, 392 + r * 36, 50, 24); }
      for (let i = 0; i < 8; i++) { ctx.fillStyle = '#d9c9a4'; ctx.fillRect(cx - 150 + i * 40, 594, 6, 18); ctx.fillStyle = `rgba(255,190,110,${.5 + .4 * (still ? .5 : Math.abs(Math.sin(time * 4 + i)))})`; ctx.fillRect(cx - 150 + i * 40, 586, 6, 7); }
      break; }
    case 'greenhouse-bays': { for (let r = 0; r < 3; r++) { const y = 404 + r * 72; ctx.fillStyle = '#26302a'; ctx.fillRect(cx - 180, y + 40, 360, 12);
      ctx.fillStyle = '#3f8f4a'; for (let i = 0; i < 24; i++) ctx.fillRect(cx - 174 + i * 15, y + 22 + (i % 3) * 4, 6, 18 - (i % 3) * 4);
      ctx.fillStyle = 'rgba(213,155,216,.7)'; ctx.fillRect(cx - 180, y, 360, 4); } break; }
    case 'market-counter': { ctx.fillStyle = '#4a3a28'; ctx.fillRect(cx - 160, 540, 320, 84); ctx.fillStyle = '#2e241b'; ctx.fillRect(cx - 160, 420, 8, 120); ctx.fillRect(cx + 152, 420, 8, 120);
      ctx.fillStyle = '#e0873a'; ctx.fillRect(cx - 120, 410, 240, 30); ctx.fillStyle = '#1b130c'; ctx.font = '700 16px monospace'; ctx.fillText('CRUCIBLE', cx - 44, 431);
      ctx.fillStyle = '#7b7f84'; for (let i = 0; i < 7; i++) ctx.fillRect(cx - 130 + i * 38, 470, 20, 30 + (i % 3) * 8); break; }
    case 'ring-plan': { ctx.fillStyle = '#0d1611'; ctx.fillRect(cx - 60, 430, 120, 90); ctx.strokeStyle = 'rgba(143,179,168,.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, 475, 34, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, 475, 8, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, 467); ctx.lineTo(cx, 441); ctx.stroke();
      ctx.fillStyle = '#e2b53a'; ctx.fillRect(cx + 22, 494, 6, 6); ctx.fillStyle = '#2a332e'; ctx.fillRect(cx - 8, 520, 16, 104); break; }
    case 'quarters-register': { // two tiers of bunk cabins (≈ 1.1 m each) and the register terminal (asph-bunks)
      for (let tier = 0; tier < 2; tier++) for (let c = 0; c < 3; c++) { const x = cx - 180 + c * 124, y = 404 + tier * 110;
        ctx.fillStyle = '#2a272e'; ctx.fillRect(x, y, 112, 100); ctx.fillStyle = '#15131a'; ctx.fillRect(x + 6, y + 30, 100, 60);
        ctx.fillStyle = '#5a4d6a'; ctx.fillRect(x + 6, y + 30, 34, 60); // curtain
        const lit = (tier * 3 + c) % 4 !== 3; ctx.fillStyle = lit ? `rgba(232,200,138,${still ? .8 : .6 + .2 * Math.sin(time * 2 + c)})` : '#3a332a'; ctx.fillRect(x + 84, y + 36, 14, 6); }
      ctx.fillStyle = '#0d1611'; ctx.fillRect(cx + 192, 470, 60, 80); ctx.fillStyle = 'rgba(232,200,138,.6)'; for (let i = 0; i < 5; i++) ctx.fillRect(cx + 198, 480 + i * 12, 36 + (i * 7) % 12, 3); break; }
    case 'medbay-beds': { // two 2.0 × 0.9 m beds with monitors (asph-medbay-beds)
      for (let i = 0; i < 2; i++) { const x = cx - 170 + i * 180; ctx.fillStyle = '#c9d6d8'; ctx.fillRect(x, 572, 102, 14); ctx.fillStyle = '#8fa2a6'; ctx.fillRect(x, 586, 6, 38); ctx.fillRect(x + 96, 586, 6, 38);
        ctx.fillStyle = '#e8f0f0'; ctx.fillRect(x + 2, 562, 30, 10); ctx.fillStyle = '#20292c'; ctx.fillRect(x + 110, 470, 50, 40); ctx.fillStyle = '#7dff9a'; ctx.beginPath();
        for (let px = 0; px <= 44; px += 4) ctx.lineTo(x + 113 + px, 492 + (px % 16 === 8 ? -10 : 0) * (still ? 1 : 1)); ctx.strokeStyle = '#7dff9a'; ctx.lineWidth = 2; ctx.stroke(); } break; }
    case 'medbay-scanner': { // walk-through arch 2.2 m high (asph-medbay-scanner)
      ctx.fillStyle = '#2c373b'; ctx.fillRect(cx - 62, 512, 16, 112); ctx.fillRect(cx + 46, 512, 16, 112); ctx.fillRect(cx - 62, 512, 124, 14);
      const sweep = still ? 560 : 530 + ((time * 60) % 90); ctx.fillStyle = 'rgba(226,181,58,.55)'; ctx.fillRect(cx - 46, sweep, 92, 4);
      ctx.fillStyle = '#0b1416'; ctx.fillRect(cx + 80, 470, 70, 50); ctx.fillStyle = 'rgba(191,232,224,.6)'; for (let i = 0; i < 4; i++) ctx.fillRect(cx + 86, 478 + i * 10, 40 + (i * 9) % 18, 3); break; }
    case 'lower-barricade': { // welded door, sandbags, crates, chalk marks (asph-echo8-barricade)
      ctx.fillStyle = '#2b2422'; ctx.fillRect(cx - 60, 492, 120, 132); ctx.strokeStyle = '#e2b53a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 60, 492); ctx.lineTo(cx - 60, 624); ctx.moveTo(cx + 60, 492); ctx.lineTo(cx + 60, 624); ctx.stroke(); // weld seams
      ctx.fillStyle = '#6b5c42'; for (let i = 0; i < 7; i++) ctx.fillRect(cx - 140 + i * 40, 592 - (i % 2) * 12, 38, 20);
      ctx.fillStyle = '#4a3a28'; ctx.fillRect(cx + 80, 566, 61, 58); ctx.strokeStyle = '#e8e2d0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 120, 520); ctx.lineTo(cx - 76, 520); ctx.lineTo(cx - 86, 512); ctx.moveTo(cx - 76, 520); ctx.lineTo(cx - 86, 528); ctx.stroke();
      ctx.fillStyle = '#e8e2d0'; ctx.font = '700 11px monospace'; ctx.fillText('E-8 05:52', cx - 130, 506); break; }
    case 'lower-night': { // duty board and emergency lamps (asph-night-board)
      ctx.fillStyle = '#120d0d'; ctx.fillRect(cx - 80, 430, 160, 110); ctx.strokeStyle = 'rgba(225,91,79,.7)'; ctx.strokeRect(cx - 79.5, 430.5, 159, 109);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = i < (state.nights || 0) ? '#7dff9a' : '#4a2420'; ctx.fillRect(cx - 64 + i * 28, 500, 16, 12); }
      ctx.fillStyle = `rgba(225,91,79,${still ? .8 : .45 + .35 * Math.abs(Math.sin(time * 1.5))})`; ctx.fillRect(cx - 64, 446, 128, 8); ctx.fillStyle = '#2a2020'; ctx.fillRect(cx - 8, 540, 16, 84); break; }
    case 'repair-bench': { // Cheyenne overhaul bench, parts rack and a hoist (asph-repair-cradle)
      ctx.fillStyle = '#3b4246'; ctx.fillRect(cx - 200, 560, 260, 20); ctx.fillRect(cx - 190, 580, 10, 44); ctx.fillRect(cx + 40, 580, 10, 44);
      ctx.fillStyle = '#5b6358'; ctx.beginPath(); ctx.ellipse(cx - 110, 540, 46, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1b2022'; ctx.beginPath(); ctx.ellipse(cx - 110, 540, 26, 12, 0, 0, Math.PI * 2); ctx.fill(); // thruster nozzle
      ctx.fillStyle = '#2a3236'; ctx.fillRect(cx + 90, 420, 110, 204); ctx.fillStyle = '#7b7f84'; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) ctx.fillRect(cx + 98 + c * 34, 432 + r * 46, 26, 18 + (r + c) % 2 * 8);
      ctx.fillStyle = '#c9a54a'; ctx.fillRect(cx - 220, 380, 300, 8); ctx.fillStyle = '#151a1c'; ctx.fillRect(cx - 112, 388, 3, 126);
      if (!still && Math.floor(time * 6) % 3 === 0) { ctx.fillStyle = '#fff2b0'; ctx.fillRect(cx - 60, 548, 4, 4); ctx.fillRect(cx - 54, 542, 2, 2); } // welding sparks
      for (let i = 0; i < (state.cheyenne || 0); i++) { ctx.fillStyle = '#7dff9a'; ctx.fillRect(cx - 190 + i * 20, 566, 12, 6); } break; }
    default: break;
  }
  ctx.restore();
}

/** Ambient station worker (docker, merchant, technician), 1.75 m = 89 px, feet at `feetY`, facing ±1. */
export function drawAsphodeleWorkerV188(ctx, role, cx, feetY, { facing = 1, phase = 0, moving = false, still = false } = {}) {
  const h = 89, top = feetY - h, swing = moving && !still ? Math.sin(phase) * 5 : 0;
  const colours = { docker: ['#4f5a3a', '#d8c23a', '#2e3326'], merchant: ['#6a4b33', '#e0873a', '#3a2a1e'], technician: ['#3e5058', '#cfe0d6', '#253238'] }[role] || ['#4a4a4a', '#999', '#2a2a2a'];
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(cx, feetY + 1, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = colours[2]; ctx.fillRect(cx - 10 + swing * .4, top + 56, 9, 33); ctx.fillRect(cx + 1 - swing * .4, top + 56, 9, 33); // legs
  ctx.fillStyle = colours[0]; ctx.fillRect(cx - 12, top + 16, 24, 42); // torso
  ctx.fillStyle = colours[1]; if (role === 'docker') { ctx.fillRect(cx - 12, top + 24, 24, 4); ctx.fillRect(cx - 12, top + 40, 24, 4); }
  else if (role === 'merchant') ctx.fillRect(cx + (facing > 0 ? -14 : 8), top + 30, 6, 18); else ctx.fillRect(cx + facing * 8 - 3, top + 34, 8, 11); // vest bands / satchel / tablet
  ctx.fillStyle = '#9a7a62'; ctx.beginPath(); ctx.arc(cx + facing * 1.5, top + 8, 8, 0, Math.PI * 2); ctx.fill();
  if (role === 'technician') { ctx.fillStyle = '#e2b53a'; ctx.fillRect(cx - 8, top - 1, 16, 5); }
  ctx.restore();
}
/** Grue (placeholder silhouette, 1.80 m = 92 px) standing with feet at `feetY`. */
export function drawGrueV188(ctx, cx, feetY) {
  const h = 92, top = feetY - h;
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(cx, feetY + 1, 18, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a5240'; ctx.fillRect(cx - 13, top + 16, 26, 44); ctx.fillStyle = '#3a362c'; ctx.fillRect(cx - 11, top + 58, 9, 34); ctx.fillRect(cx + 2, top + 58, 9, 34);
  ctx.fillStyle = '#d06b2a'; ctx.fillRect(cx - 13, top + 48, 26, 5); ctx.fillStyle = '#8a6a50'; ctx.beginPath(); ctx.arc(cx, top + 8, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a2620'; ctx.fillRect(cx - 8, top - 1, 16, 5); ctx.restore();
}
/** Window onto a docked vessel above a collar door (UD-4L, Echo-8's UD-4L, Crucible shuttle). */
export function drawDockedVesselV188(ctx, cx, kind) {
  ctx.save(); ctx.fillStyle = '#05080b'; ctx.fillRect(cx - 110, 250, 220, 130); ctx.strokeStyle = '#3a4448'; ctx.lineWidth = 6; ctx.strokeRect(cx - 110, 250, 220, 130);
  ctx.fillStyle = 'rgba(230,240,255,.6)'; for (let i = 0; i < 14; i++) ctx.fillRect(cx - 104 + (i * 37) % 208, 256 + (i * 23) % 118, 2, 2);
  if (kind === 'crucible') { ctx.fillStyle = '#5c5245'; ctx.fillRect(cx - 80, 300, 150, 50); ctx.fillStyle = '#7a6b55'; ctx.fillRect(cx + 40, 280, 10, 30); ctx.fillRect(cx + 40, 280, 40, 6); }
  else { ctx.fillStyle = kind === 'echo8' ? '#3c4232' : '#4a5440'; ctx.beginPath(); ctx.moveTo(cx - 90, 340); ctx.lineTo(cx - 40, 296); ctx.lineTo(cx + 70, 296); ctx.lineTo(cx + 96, 326); ctx.lineTo(cx + 70, 350); ctx.lineTo(cx - 60, 352); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9fd7e8'; ctx.fillRect(cx + 50, 304, 22, 10); if (kind === 'echo8') { ctx.fillStyle = '#e9d07a'; ctx.font = '700 10px monospace'; ctx.fillText('ECHO-8', cx - 30, 330); } }
  ctx.restore();
}
