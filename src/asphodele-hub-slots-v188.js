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
  slot('asph-cradles', 'prop', 402, 76, 'Three empty QZ17 cradles in the transit laboratory, separate from the archive terminal.',
    'Project design (bible §7.4, consistent with CIN-11): refrigerated human-sized cradles, lids open, restraints cut; QZ17 stencils.'),
  slot('asph-memorial-plaques', 'prop', 360, 232, 'The memorial panel and its candle shelf, with native candle glows.',
    'Project design: stamped name plates in rows, one empty row for Echo-8; electric candles below.'),
  slot('asph-hydro-bays', 'prop', 360, 220, 'Hydroponic bays of the greenhouse.',
    'Project design: three stacked trays of green shoots under growth lamps.'),
  slot('asph-crucible-stall', 'prop', 320, 214, 'Crucible stall of the ring market; its sign is drawn by the game.',
    'Project design: a counter made of a cargo crate, a rack of salvaged parts, a hand-painted sign.'),
  slot('asph-grue', 'actor', 52, 92, 'Grue, female captain of the salvagers, 1.80 m.',
    'Project character (bible §2.3, §7.2): a female salvage captain in a patched vacuum suit without helmet, tool belt; transparent background; scale matches the 44 × 92 marine.'),
  // —— Spec 007 follow-up: the four reopened modules (bible §42.2) ——
  slot('asph-wall-quarters', 'background', 1280, 504, 'Quarters: bunk cabins with individual lights.',
    `${WALL}. Project design (bible §42.2): stacked crew cabins along a corridor wall, each with its own reading lamp and curtain; tone of the Sevastopol habitation decks (Alien: Isolation, 2014) — cited reference only.`),
  slot('asph-wall-medbay', 'background', 1280, 504, 'Station medbay: beds, monitors and the quarantine scanner.',
    `${WALL}. Reference cited, not copied: the medical labs of Hadley’s Hope in Aliens (1986) and the San Cristobal medical wing of Alien: Isolation (2014) — white panels, green monitors. Project design: a small Seegson station infirmary.`),
  slot('asph-wall-lower', 'background', 1280, 504, 'Lower decks: Echo-8’s barricades under emergency lamps.',
    `${WALL}. Project design (bible §7.4, §42.2): bare service deck, open ducts, red emergency lamps every 6 m, chalk marks of Echo-8.`),
  slot('asph-wall-repair', 'background', 1280, 504, 'Repair hangar (V2): a dropship cradle, an overhead crane, welding light.',
    `${WALL}. Reference cited: the Sulaco hangar of Aliens (1986) — crane rails, hazard bands. Project design: a station repair bay sized for a UD-4L.`),
  slot('asph-bunks', 'prop', 360, 130, 'Quarters: three columns of two-tier bunk cabins; the register terminal stays separate.',
    'Project design: 2 m bunks in two tiers (each tier ≈ 1.1 m), curtains, small lamps; a separate native register terminal at chest height.'),
  slot('asph-medbay-beds', 'prop', 282, 88, 'Station medbay: two separately sampled 102 px beds, spaced 180 px apart, with monitors.',
    'Project design: 2.0 × 0.9 m beds, vital-sign monitors on arms; native green CRT traces (cited look: Aliens, 1986). Each bed is 102 px long at the station scale.'),
  slot('asph-medbay-scanner', 'prop', 124, 112, 'Quarantine scanner arch of the medbay, with a separate native console.',
    'Project design: a walk-through scanner arch 2.2 m high with an amber sweep bar; no franchise claim.'),
  slot('asph-echo8-barricade', 'prop', 281, 132, 'Echo-8’s barricade in the lower decks.',
    'Project design (bible §7.4): welded door, sandbags, crates, chalk arrow and the time 05:52; Echo-8 is a project creation.'),
  slot('asph-night-board', 'prop', 160, 110, 'Night-round board face of the lower decks; its pole and state lamps remain native.',
    'Project design: a duty board with the round count and emergency-light status lamps.'),
  slot('asph-repair-cradle', 'prop', 420, 244, 'Repair hangar: the Cheyenne overhaul bench, hoist and parts rack.',
    'Project design: a workbench with thruster parts and a hoist; the UD-4L itself (Aliens, 1986) is only suggested behind it.'),
  // —— Ambient crowds of bible §42.2 (dockers, merchants, technicians), 1.75 m ≈ 89 px ——
  slot('asph-npc-docker', 'actor', 44, 89, 'Docker of the quays, four authored poses at a common scale.',
    'Project design: work overalls, hi-vis vest, gloves; transparent background; marine scale (44 × 92 px).'),
  slot('asph-npc-merchant', 'actor', 44, 89, 'Crucible merchant of the ring, four authored poses at a common scale.',
    'Project design: salvager coat with patches, satchel; Crucible is a project faction.'),
  slot('asph-npc-technician', 'actor', 44, 89, 'Station technician, four authored poses at a common scale.',
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
// The runtime supplies the current room's explicit list. The default is useful
// to art inspection tools and still excludes all nine mission-only images.
const HUB_ROOM_SLOT_IDS_V188 = Object.freeze(ASPHODELE_HUB_SLOT_IDS_V188.filter(id => !id.startsWith('asph-msn-')));
// Only inspected files present in the repository are admitted. Other slots
// remain primitive-only; tests verify every admitted path exists.
export const ASPHODELE_HUB_FILES_PRESENT_V188 = Object.freeze([
  'asph-msn-panel', 'asph-msn-crt', 'asph-msn-sign', 'asph-msn-conduit',
  'asph-msn-blackbox', 'asph-msn-resin', 'asph-msn-salvage', 'asph-msn-gauge', 'asph-msn-camera',
  'asph-wall-docks', 'asph-wall-ring', 'asph-wall-spoke', 'asph-wall-control',
  'asph-wall-relay', 'asph-wall-lab', 'asph-wall-memorial', 'asph-wall-greenhouse',
  'asph-wall-market', 'asph-wall-quarters', 'asph-wall-medbay', 'asph-wall-lower', 'asph-wall-repair',
  'asph-door', 'asph-ud4l-docked', 'asph-crucible-shuttle', 'asph-cassius-core', 'asph-qz-map',
  'asph-relay-bays', 'asph-cradles', 'asph-memorial-plaques', 'asph-hydro-bays', 'asph-crucible-stall',
  'asph-bunks', 'asph-medbay-beds', 'asph-medbay-scanner', 'asph-echo8-barricade', 'asph-night-board', 'asph-repair-cradle',
  'asph-grue', 'asph-npc-docker', 'asph-npc-merchant', 'asph-npc-technician'
]);
export const getAsphodeleHubSlotV188 = id => ASPHODELE_HUB_SLOTS_V188.find(entry => entry.id === id) || null;

// Measured windows and controls of the original PNGs. Coordinates are source
// pixels; these only change sampling and native overlays, never the PNG bytes.
export const ASPHODELE_HUB_IMAGE_SOURCE_RECTS_V188 = Object.freeze({
  'asph-door': [15, 17, 1040, 1437],
  'asph-cassius-core': [11, 10, 1100, 1379],
  'asph-qz-map': [8, 7, 1570, 975],
  'asph-hydro-bays': [70, 17, 1464, 953],
  'asph-memorial-plaques': [42, 12, 1598, 909],
  'asph-crucible-stall': [45, 9, 1444, 1003],
  'asph-echo8-barricade': [74, 10, 1699, 836],
  'asph-night-board': [14, 12, 1486, 1011],
  'asph-repair-cradle': [80, 7, 1522, 939],
  'asph-relay-bays': [10, 9, 1329, 1149],
  'asph-bunks': [27, 32, 2031, 697],
  'asph-medbay-beds': [13, 38, 1839, 777],
  'asph-cradles': [28, 159, 2109, 422],
  'asph-medbay-scanner': [61, 40, 1198, 1111],
  'asph-ud4l-docked': [43, 116, 1687, 640],
  'asph-crucible-shuttle': [83, 87, 1606, 695]
});
export const ASPHODELE_HUB_IMAGE_ANCHORS_V188 = Object.freeze({
  'asph-cassius-core': {
    screen0: [155, 245, 340, 242], screen1: [630, 245, 338, 242],
    screen2: [155, 621, 340, 243], screen3: [630, 621, 338, 243],
    screen4: [155, 991, 340, 244], screen5: [630, 991, 338, 244]
  },
  'asph-qz-map': { screen: [240, 170, 1100, 580] },
  'asph-hydro-bays': { grow0: [368, 95, 870, 18], grow1: [368, 390, 870, 17], grow2: [368, 647, 870, 16] },
  'asph-memorial-plaques': {
    candle0: [215, 748, 58, 30], candle1: [387, 748, 58, 30], candle2: [558, 748, 58, 30], candle3: [729, 748, 58, 30],
    candle4: [902, 748, 58, 30], candle5: [1073, 748, 58, 30], candle6: [1246, 748, 58, 30], candle7: [1417, 748, 58, 30]
  },
  'asph-crucible-stall': { sign: [355, 45, 824, 108] },
  'asph-echo8-barricade': { markings: [105, 335, 420, 170] },
  'asph-night-board': {
    alarm: [526, 76, 466, 35], round0: [344, 778, 74, 74], round1: [534, 778, 74, 74],
    round2: [723, 778, 74, 74], round3: [912, 778, 74, 74], round4: [1101, 778, 74, 74]
  },
  'asph-repair-cradle': {
    upgrade0: [567, 717, 30, 18], upgrade1: [626, 717, 30, 18], upgrade2: [685, 717, 30, 18],
    spark0: [790, 602, 14, 14], spark1: [813, 584, 7, 7]
  },
  'asph-relay-bays': {
    lamp0: [90, 288, 38, 20], lamp1: [90, 389, 38, 20], lamp2: [90, 488, 38, 20], lamp3: [90, 589, 38, 20],
    lamp4: [90, 688, 38, 20], lamp5: [90, 789, 38, 20], lamp6: [90, 889, 38, 20], lamp7: [90, 983, 38, 20],
    lamp8: [536, 288, 38, 20], lamp9: [536, 389, 38, 20], lamp10: [536, 488, 38, 20], lamp11: [536, 589, 38, 20],
    lamp12: [536, 688, 38, 20], lamp13: [536, 789, 38, 20], lamp14: [536, 889, 38, 20], lamp15: [536, 983, 38, 20],
    lamp16: [982, 288, 38, 20], lamp17: [982, 389, 38, 20], lamp18: [982, 488, 38, 20], lamp19: [982, 589, 38, 20],
    lamp20: [982, 688, 38, 20], lamp21: [982, 789, 38, 20], lamp22: [982, 889, 38, 20], lamp23: [982, 983, 38, 20]
  },
  'asph-bunks': {
    lamp0: [148, 141, 61, 20], lamp1: [820, 141, 61, 20], lamp2: [1492, 141, 61, 20],
    lamp3: [148, 416, 61, 20], lamp4: [820, 416, 61, 20], lamp5: [1492, 416, 61, 20]
  },
  'asph-medbay-beds': {
    unit0: [13, 38, 906, 777], unit1: [945, 38, 907, 777], screen0: [603, 92, 132, 106], screen1: [1575, 92, 132, 106]
  },
  'asph-cradles': { label0: [320, 471, 126, 32], label1: [1025, 471, 126, 32], label2: [1730, 471, 126, 32] },
  'asph-medbay-scanner': { opening: [202, 222, 916, 926] }
});
// Actor frames carry a stable foot pivot and one common pixels-to-height scale.
// Walking frames must be real authored poses; a single idle image is not a gait.
export const ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188 = Object.freeze({
  'asph-npc-docker': { referenceHeight: 756, height: 89, frames: [
    { rect: [130, 71, 161, 760], foot: [221.75, 829] }, { rect: [465, 72, 403, 759], foot: [665.25, 829] },
    { rect: [981, 71, 209, 759], foot: [1108.75, 828] }, { rect: [1340, 72, 400, 758], foot: [1552.25, 828] }
  ] },
  'asph-npc-merchant': { referenceHeight: 766, height: 89, frames: [
    { rect: [126, 59, 179, 770], foot: [221.75, 827] }, { rect: [459, 61, 405, 768], foot: [665.25, 827] },
    { rect: [983, 61, 214, 768], foot: [1108.75, 827] }, { rect: [1332, 64, 427, 765], foot: [1552.25, 827] }
  ] },
  'asph-npc-technician': { referenceHeight: 781, height: 89, frames: [
    { rect: [135, 54, 155, 785], foot: [221.75, 837] }, { rect: [454, 61, 412, 775], foot: [665.25, 834] },
    { rect: [954, 57, 244, 781], foot: [1108.75, 836] }, { rect: [1336, 61, 417, 777], foot: [1552.25, 836] }
  ] },
  'asph-grue': { referenceHeight: 1589, height: 92, frames: [
    { rect: [282, 47, 346, 1593], foot: [471.5, 1638] }
  ] }
});

export function asphodeleImageFitV188(image, x, y, width, height, { sourceRect = null, alignX = .5, alignY = .5 } = {}) {
  if (!image) return null;
  const rect = sourceRect || [0, 0, image.naturalWidth, image.naturalHeight];
  if (!Array.isArray(rect) || rect.length !== 4 || !rect.every(Number.isFinite)
    || rect[0] < 0 || rect[1] < 0 || rect[2] <= 0 || rect[3] <= 0
    || rect[0] + rect[2] > image.naturalWidth || rect[1] + rect[3] > image.naturalHeight
    || ![x, y, width, height, alignX, alignY].every(Number.isFinite) || width <= 0 || height <= 0
    || alignX < 0 || alignX > 1 || alignY < 0 || alignY > 1) return null;
  const [sx, sy, sw, sh] = rect, scale = Math.min(width / sw, height / sh), w = sw * scale, h = sh * scale;
  return { sx, sy, sw, sh, x: x + (width - w) * alignX, y: y + (height - h) * alignY, w, h, scale };
}

/** Real image when one is committed for the slot, the primitive drawing otherwise. */
export class AsphodeleHubAssetLoaderV188 {
  constructor({ ImageCtor = globalThis.Image, present = ASPHODELE_HUB_FILES_PRESENT_V188 } = {}) {
    this.ImageCtor = ImageCtor; this.present = new Set(present); this.images = new Map(); this.requested = []; this.usage = Object.create(null);
    this.wallPatterns = new WeakMap();
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
  /** Repeat a back wall at its own aspect ratio, fixed in world coordinates.
   * The camera only changes the clip: it must never stretch or reposition the
   * texture. All original pixels are sampled; the PNG itself stays unchanged. */
  drawWall(ctx, id, x, y, width, height, fallback) {
    const entry = getAsphodeleHubSlotV188(id);
    if (!entry || !id.startsWith('asph-wall-')) throw new Error(`Unknown Asphodèle wall art slot: ${id}`);
    const image = this.image(id);
    const valid = image && [image.naturalWidth, image.naturalHeight, width, height].every(value => Number.isFinite(value) && value > 0)
      && Number.isFinite(x) && Number.isFinite(y);
    const tileWidth = valid ? image.naturalWidth * height / image.naturalHeight : 0;
    let source = 'primitive';
    if (Number.isFinite(tileWidth) && tileWidth >= 1) {
      ctx.save();
      try {
        ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip();
        let patterns = this.wallPatterns.get(ctx);
        if (!patterns) { patterns = new Map(); this.wallPatterns.set(ctx, patterns); }
        let cached = patterns.get(id);
        if (cached?.image !== image) {
          const pattern = ctx.createPattern?.(image, 'repeat-x');
          cached = pattern ? { image, pattern } : null;
          if (cached) patterns.set(id, cached);
        }
        if (cached) {
          // One repeated surface has no separately antialiased tile edges.
          // This closes fractional-width joins without stretching or cropping.
          const scale = height / image.naturalHeight;
          ctx.translate(0, y); ctx.scale(scale, scale); ctx.fillStyle = cached.pattern;
          const left = Math.floor(x / scale) - 1, right = Math.ceil((x + width) / scale) + 1;
          ctx.fillRect(left, 0, right - left, image.naturalHeight);
        } else {
          // Minimal non-browser hosts may not implement CanvasPattern.
          for (let tileX = Math.floor(x / tileWidth) * tileWidth; tileX < x + width; tileX += tileWidth)
            ctx.drawImage(image, tileX, y, tileWidth, height);
        }
        source = 'image';
      } finally { ctx.restore(); }
    }
    if (source === 'primitive') fallback?.(ctx, x, y, width, height);
    this.usage[id] = source; return source;
  }
  /** Returns 'image' or 'primitive'. Existing hub callers retain their sizing;
   * mission cutouts opt into a proportional fit and an optional source window.
   * A source window changes sampling only: the admitted PNG is never rewritten. */
  draw(ctx, id, x, y, width, height, fallback, { fit = 'stretch', sourceRect = null, alignX = .5, alignY = .5 } = {}) {
    if (!getAsphodeleHubSlotV188(id)) throw new Error(`Unknown Asphodèle hub art slot: ${id}`);
    const image = this.image(id); let source = 'primitive';
    if (image && fit === 'contain') {
      const frame = asphodeleImageFitV188(image, x, y, width, height, { sourceRect, alignX, alignY });
      if (frame) {
        ctx.drawImage(image, frame.sx, frame.sy, frame.sw, frame.sh, frame.x, frame.y, frame.w, frame.h); source = 'image';
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
function drawAsphodeleWallHazardV188(ctx, module, x, width, gaps) {
  if (module !== 'docks' && module !== 'plan' && module !== 'repair') return;
  // World-anchored paint stops at actual door frames in either rendering path.
  const clear = (px, w) => !gaps.some(([g0, g1]) => px < g1 && px + w > g0);
  for (let px = x - (x % 24); px < x + width; px += 24) if (clear(px, 24)) {
    ctx.fillStyle = Math.floor(px / 24) % 2 ? '#111' : '#c9a54a'; ctx.fillRect(px, 600, 24, 6);
  }
}
/** Structural trim remains native, above a loaded wall and below its doors. */
export function drawAsphodeleWallTrimV188(ctx, module, x, width, gaps = []) {
  ctx.fillStyle = '#0b0f11'; ctx.fillRect(x, 96, width, 40);
  drawAsphodeleWallHazardV188(ctx, module, x, width, gaps);
}
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
  drawAsphodeleWallHazardV188(ctx, module, x, width, gaps);
  if (module === 'lower') { ctx.fillStyle = 'rgba(225,91,79,.10)'; ctx.fillRect(x, 140, width, 470); for (let px = x - (x % 306) + 150; px < x + width; px += 306) { ctx.fillStyle = '#e15b4f'; ctx.fillRect(px, 150, 18, 8); } }
  if (module === 'medbay') { ctx.fillStyle = 'rgba(191,232,224,.06)'; ctx.fillRect(x, 140, width, 470); }
  if (module === 'quarters') { ctx.fillStyle = 'rgba(232,200,138,.05)'; ctx.fillRect(x, 140, width, 470); }
  if (module === 'greenhouse') { ctx.fillStyle = 'rgba(213,155,216,.08)'; ctx.fillRect(x, 140, width, 470); }
  if (module === 'control') { ctx.fillStyle = 'rgba(125,255,154,.05)'; for (let y = 160; y < 560; y += 6) ctx.fillRect(x, y, width, 1); }
}
function drawAsphodeleArtV188(ctx, loader, id, box, { alignY = 1, sourceRect = ASPHODELE_HUB_IMAGE_SOURCE_RECTS_V188[id] || null } = {}) {
  if (!loader) return null;
  const [x, y, width, height] = box;
  const source = loader.draw(ctx, id, x, y, width, height, null, { fit: 'contain', sourceRect, alignY });
  if (source !== 'image') return null;
  return { ...asphodeleImageFitV188(loader.image(id), x, y, width, height, { sourceRect, alignY }), id, box };
}
/** Project a measured source control, or its documented logical fallback. */
function asphodeleArtRectV188(art, key, rect) {
  if (!art) return rect;
  const source = ASPHODELE_HUB_IMAGE_ANCHORS_V188[art.id]?.[key];
  if (Array.isArray(source) && source.length === 4) return [art.x + (source[0] - art.sx) * art.scale,
    art.y + (source[1] - art.sy) * art.scale, source[2] * art.scale, source[3] * art.scale];
  const [x, y, w, h] = art.box;
  return [art.x + (rect[0] - x) * art.w / w, art.y + (rect[1] - y) * art.h / h, rect[2] * art.w / w, rect[3] * art.h / h];
}
function drawAsphodeleScreenV188(ctx, art, key, rect, draw, background = '#0b1410') {
  const target = asphodeleArtRectV188(art, key, rect), [x, y, w, h] = target;
  ctx.save();
  if (background) { ctx.fillStyle = background; ctx.fillRect(x, y, w, h); }
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const scale = Math.min(w / rect[2], h / rect[3]);
  ctx.translate(x + (w - rect[2] * scale) / 2, y + (h - rect[3] * scale) / 2);
  ctx.scale(scale, scale); ctx.translate(-rect[0], -rect[1]);
  draw?.(ctx); ctx.restore();
}

/** Bulkhead door centred on cx; its frame, lock mark and lamp remain native. */
export function drawAsphodeleDoorV188(ctx, cx, state, time = 0, still = false, loader = null) {
  const w = 96, h = 132, x = cx - w / 2, y = 624 - h;
  ctx.fillStyle = '#2b3236'; ctx.fillRect(x - 10, y - 14, w + 20, h + 14); // frame
  const art = drawAsphodeleArtV188(ctx, loader, 'asph-door', [x, y, w, h], { alignY: 1 });
  if (!art) {
    ctx.fillStyle = state === 'locked' ? '#1a1d20' : '#33414a'; ctx.fillRect(x, y, w / 2 - 1, h); ctx.fillRect(x + w / 2 + 1, y, w / 2 - 1, h);
    ctx.fillStyle = '#c9a54a'; for (let i = 0; i < 6; i++) ctx.fillRect(x + (i % 2 ? w - 8 : 0), y + 8 + i * 20, 8, 10);
    ctx.fillStyle = state === 'locked' ? '#3a2626' : '#0f1a1f'; ctx.fillRect(x + 14, y + 22, 20, 28); ctx.fillRect(x + w - 34, y + 22, 20, 28);
  }
  if (state === 'locked') { ctx.strokeStyle = '#e15b4f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 8, y + 60); ctx.lineTo(x + w - 8, y + 100); ctx.moveTo(x + w - 8, y + 60); ctx.lineTo(x + 8, y + 100); ctx.stroke(); }
  const blink = still ? 1 : (Math.floor(time * 2) % 2 ? 1 : .55);
  ctx.globalAlpha = blink; ctx.fillStyle = state === 'locked' ? '#e15b4f' : state === 'shuttle' ? '#e2b53a' : '#7dff9a'; ctx.fillRect(cx - 10, y - 24, 20, 7); ctx.globalAlpha = 1;
  return art ? 'image' : 'primitive';
}
/** Wall posts and module props, by post id. Box is the post's screen box (x centre, feet on 624). */
export function drawAsphodelePostV188(ctx, id, cx, { time = 0, still = false, state = {}, loader = null } = {}) {
  const pulse = still ? .5 : .5 + .5 * Math.sin(time * 3);
  const paint = (slotId, box, options) => drawAsphodeleArtV188(ctx, loader, slotId, box, options);
  ctx.save();
  switch (id) {
    case 'control-board': {
      const art = paint('asph-qz-map', [cx - 120, 400, 240, 150]);
      if (!art) { ctx.fillStyle = '#0d1611'; ctx.fillRect(cx - 120, 400, 240, 150); ctx.strokeStyle = 'rgba(125,255,154,.6)'; ctx.strokeRect(cx - 119.5, 400.5, 239, 149); }
      drawAsphodeleScreenV188(ctx, art, 'screen', [cx - 114, 406, 228, 138], () => {
        ctx.strokeStyle = 'rgba(125,255,154,.6)'; ctx.beginPath(); ctx.arc(cx - 30, 475, 34, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#e15b4f'; ctx.fillRect(cx + 36, 438, 8, 8);
        ctx.strokeStyle = 'rgba(125,255,154,.8)'; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.strokeRect(cx - 30 + Math.cos(a) * 70 - 3, 475 + Math.sin(a) * 50 - 3, 6, 6); }
      }, art ? '#0d1611' : null);
      ctx.fillStyle = '#2a332e'; ctx.fillRect(cx - 60, 550, 120, 74); break;
    }
    case 'control-cassius': {
      const art = paint('asph-cassius-core', [cx - 80, 400, 160, 200]), dark = state.cassius === 'erase';
      if (!art) { ctx.fillStyle = '#0a120d'; ctx.fillRect(cx - 80, 400, 160, 200); }
      ctx.fillStyle = '#1d2826'; ctx.fillRect(cx - 86, 600, 172, 24);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
        drawAsphodeleScreenV188(ctx, art, `screen${r * 2 + c}`, [cx - 70 + c * 72, 410 + r * 62, 64, 52], () => {
          if (dark || r !== 1) return;
          ctx.strokeStyle = state.cassius === 'restrain' ? 'rgba(226,181,58,.8)' : 'rgba(125,255,154,.9)'; ctx.lineWidth = 2; ctx.beginPath();
          for (let px = 0; px <= 136; px += 4) ctx.lineTo(cx - 68 + px, 500 + Math.sin(px * .2 + time * 6) * 10 * (still ? .4 : pulse)); ctx.stroke();
        }, dark ? '#050806' : '#06200f');
      }
      break;
    }
    case 'relay-bays': {
      const art = paint('asph-relay-bays', [cx - 150, 364, 300, 260]);
      for (let i = 0; i < 3; i++) { const x = cx - 150 + i * 104;
        if (!art) { ctx.fillStyle = '#20242b'; ctx.fillRect(x, 364, 92, 260); }
        for (let l = 0; l < 8; l++) {
          ctx.fillStyle = state.relayOnline ? (l % 3 === i % 3 ? '#7dff9a' : '#2f6d45') : (l === 0 ? '#e2b53a' : '#3b3424');
          ctx.fillRect(...asphodeleArtRectV188(art, `lamp${i * 8 + l}`, [x + 10, 380 + l * 28, 14, 8]));
          if (!art) { ctx.fillStyle = '#14171c'; ctx.fillRect(x + 32, 378 + l * 28, 50, 14); }
        }
      }
      // The separate held-message terminal keeps its native data and scroll.
      ctx.fillStyle = '#0b1410'; ctx.fillRect(cx + 170, 360, 150, 130); ctx.fillStyle = 'rgba(125,255,154,.45)';
      const scroll = still ? 0 : Math.floor(time * 3) % 9; for (let i = 0; i < 9; i++) ctx.fillRect(cx + 180, 370 + ((i + scroll) % 9) * 13, 60 + (i * 23) % 70, 5); break;
    }
    case 'lab-archives': {
      // This is an archive terminal, not the three separate QZ17 cradles.
      ctx.fillStyle = '#132024'; ctx.fillRect(cx - 50, 470, 100, 154); ctx.fillStyle = '#0b1416'; ctx.fillRect(cx - 40, 480, 80, 60);
      ctx.fillStyle = 'rgba(207,230,238,.5)'; for (let i = 0; i < 5; i++) ctx.fillRect(cx - 34, 488 + i * 10, 40 + (i * 13) % 30, 3); break;
    }
    case 'memorial-plaques': {
      const art = paint('asph-memorial-plaques', [cx - 180, 380, 360, 232]);
      if (!art) { ctx.fillStyle = '#2a231b'; ctx.fillRect(cx - 180, 380, 360, 200);
        for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { ctx.fillStyle = r === 4 ? '#3a3226' : '#9a8b6e'; ctx.fillRect(cx - 168 + c * 58, 392 + r * 36, 50, 24); }
      }
      for (let i = 0; i < 8; i++) {
        if (!art) { ctx.fillStyle = '#d9c9a4'; ctx.fillRect(cx - 150 + i * 40, 594, 6, 18); }
        ctx.fillStyle = `rgba(255,190,110,${.5 + .4 * (still ? .5 : Math.abs(Math.sin(time * 4 + i)))})`;
        ctx.fillRect(...asphodeleArtRectV188(art, `candle${i}`, [cx - 150 + i * 40, 586, 6, 7]));
      }
      break;
    }
    case 'greenhouse-bays': {
      const art = paint('asph-hydro-bays', [cx - 180, 404, 360, 220]);
      for (let r = 0; r < 3; r++) { const y = 404 + r * 72;
        if (!art) { ctx.fillStyle = '#26302a'; ctx.fillRect(cx - 180, y + 40, 360, 12);
          ctx.fillStyle = '#3f8f4a'; for (let i = 0; i < 24; i++) ctx.fillRect(cx - 174 + i * 15, y + 22 + (i % 3) * 4, 6, 18 - (i % 3) * 4); }
        ctx.fillStyle = 'rgba(213,155,216,.7)'; ctx.fillRect(...asphodeleArtRectV188(art, `grow${r}`, [cx - 180, y, 360, 4]));
      } break;
    }
    case 'market-counter': {
      const art = paint('asph-crucible-stall', [cx - 160, 410, 320, 214]);
      if (!art) { ctx.fillStyle = '#4a3a28'; ctx.fillRect(cx - 160, 540, 320, 84); ctx.fillStyle = '#2e241b'; ctx.fillRect(cx - 160, 420, 8, 120); ctx.fillRect(cx + 152, 420, 8, 120);
        ctx.fillStyle = '#e0873a'; ctx.fillRect(cx - 120, 410, 240, 30);
        ctx.fillStyle = '#7b7f84'; for (let i = 0; i < 7; i++) ctx.fillRect(cx - 130 + i * 38, 470, 20, 30 + (i % 3) * 8); }
      drawAsphodeleScreenV188(ctx, art, 'sign', [cx - 120, 410, 240, 30], () => {
        ctx.fillStyle = '#1b130c'; ctx.font = '700 16px monospace'; ctx.fillText('CRUCIBLE', cx - 44, 431);
      }, art ? '#b97538' : null);
      break;
    }
    case 'ring-plan': {
      // This plan represents the station, not the different QZ network map.
      ctx.fillStyle = '#0d1611'; ctx.fillRect(cx - 60, 430, 120, 90); ctx.strokeStyle = 'rgba(143,179,168,.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, 475, 34, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, 475, 8, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, 467); ctx.lineTo(cx, 441); ctx.stroke();
      ctx.fillStyle = '#e2b53a'; ctx.fillRect(cx + 22, 494, 6, 6); ctx.fillStyle = '#2a332e'; ctx.fillRect(cx - 8, 520, 16, 104); break;
    }
    case 'quarters-register': {
      // Two ~1.1 m tiers, instead of the former 4.3 m total placeholder.
      const art = paint('asph-bunks', [cx - 180, 494, 360, 130]);
      for (let tier = 0; tier < 2; tier++) for (let c = 0; c < 3; c++) { const x = cx - 180 + c * 124, y = 494 + tier * 65;
        if (!art) { ctx.fillStyle = '#2a272e'; ctx.fillRect(x, y, 112, 65); ctx.fillStyle = '#15131a'; ctx.fillRect(x + 6, y + 10, 100, 48);
          ctx.fillStyle = '#5a4d6a'; ctx.fillRect(x + 6, y + 10, 34, 48); }
        const lit = (tier * 3 + c) % 4 !== 3; ctx.fillStyle = lit ? `rgba(232,200,138,${still ? .8 : .6 + .2 * Math.sin(time * 2 + c)})` : '#3a332a';
        ctx.fillRect(...asphodeleArtRectV188(art, `lamp${tier * 3 + c}`, [x + 84, y + 16, 14, 4]));
      }
      ctx.fillStyle = '#0d1611'; ctx.fillRect(cx + 192, 470, 60, 80); ctx.fillStyle = 'rgba(232,200,138,.6)'; for (let i = 0; i < 5; i++) ctx.fillRect(cx + 198, 480 + i * 12, 36 + (i * 7) % 12, 3); break;
    }
    case 'medbay-beds': {
      for (let i = 0; i < 2; i++) { const x = cx - 170 + i * 180;
        // Each physical bed is 2 m (102 px). Sampling the two authored units
        // separately keeps their former 180 px spacing and one common floor.
        const sourceRect = ASPHODELE_HUB_IMAGE_ANCHORS_V188['asph-medbay-beds']?.[`unit${i}`];
        const art = sourceRect ? paint('asph-medbay-beds', [x, 536, 102, 88], { sourceRect }) : null;
        if (!art) { ctx.fillStyle = '#c9d6d8'; ctx.fillRect(x, 572, 102, 14); ctx.fillStyle = '#8fa2a6'; ctx.fillRect(x, 586, 6, 38); ctx.fillRect(x + 96, 586, 6, 38);
          ctx.fillStyle = '#e8f0f0'; ctx.fillRect(x + 2, 562, 30, 10); ctx.fillStyle = '#20292c'; ctx.fillRect(x + 110, 470, 50, 40); }
        drawAsphodeleScreenV188(ctx, art, `screen${i}`, [x + 110, 470, 50, 40], () => {
          ctx.beginPath(); for (let px = 0; px <= 44; px += 4) ctx.lineTo(x + 113 + px, 492 + (px % 16 === 8 ? -10 : 0)); ctx.strokeStyle = '#7dff9a'; ctx.lineWidth = 2; ctx.stroke();
        }, art ? '#0b1711' : null);
      } break;
    }
    case 'medbay-scanner': {
      const art = paint('asph-medbay-scanner', [cx - 62, 512, 124, 112]);
      if (!art) { ctx.fillStyle = '#2c373b'; ctx.fillRect(cx - 62, 512, 16, 112); ctx.fillRect(cx + 46, 512, 16, 112); ctx.fillRect(cx - 62, 512, 124, 14); }
      drawAsphodeleScreenV188(ctx, art, 'opening', [cx - 46, 526, 92, 98], () => {
        const sweep = still ? 560 : 530 + ((time * 60) % 90); ctx.fillStyle = 'rgba(226,181,58,.55)'; ctx.fillRect(cx - 46, sweep, 92, 4);
      }, null);
      ctx.fillStyle = '#0b1416'; ctx.fillRect(cx + 80, 470, 70, 50); ctx.fillStyle = 'rgba(191,232,224,.6)'; for (let i = 0; i < 4; i++) ctx.fillRect(cx + 86, 478 + i * 10, 40 + (i * 9) % 18, 3); break;
    }
    case 'lower-barricade': {
      const art = paint('asph-echo8-barricade', [cx - 140, 492, 281, 132]);
      if (!art) { ctx.fillStyle = '#2b2422'; ctx.fillRect(cx - 60, 492, 120, 132); ctx.strokeStyle = '#e2b53a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 60, 492); ctx.lineTo(cx - 60, 624); ctx.moveTo(cx + 60, 492); ctx.lineTo(cx + 60, 624); ctx.stroke();
        ctx.fillStyle = '#6b5c42'; for (let i = 0; i < 7; i++) ctx.fillRect(cx - 140 + i * 40, 592 - (i % 2) * 12, 38, 20);
        ctx.fillStyle = '#4a3a28'; ctx.fillRect(cx + 80, 566, 61, 58); }
      drawAsphodeleScreenV188(ctx, art, 'markings', [cx - 134, 493, 68, 44], () => {
        ctx.strokeStyle = '#e8e2d0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 120, 520); ctx.lineTo(cx - 76, 520); ctx.lineTo(cx - 86, 512); ctx.moveTo(cx - 76, 520); ctx.lineTo(cx - 86, 528); ctx.stroke();
        ctx.fillStyle = '#e8e2d0'; ctx.font = '700 11px monospace'; ctx.fillText('E-8 05:52', cx - 130, 506);
      }, null); break;
    }
    case 'lower-night': {
      const art = paint('asph-night-board', [cx - 80, 430, 160, 110]);
      if (!art) { ctx.fillStyle = '#120d0d'; ctx.fillRect(cx - 80, 430, 160, 110); ctx.strokeStyle = 'rgba(225,91,79,.7)'; ctx.strokeRect(cx - 79.5, 430.5, 159, 109); }
      for (let i = 0; i < 5; i++) { ctx.fillStyle = i < (state.nights || 0) ? '#7dff9a' : '#4a2420'; ctx.fillRect(...asphodeleArtRectV188(art, `round${i}`, [cx - 64 + i * 28, 500, 16, 12])); }
      ctx.fillStyle = `rgba(225,91,79,${still ? .8 : .45 + .35 * Math.abs(Math.sin(time * 1.5))})`; ctx.fillRect(...asphodeleArtRectV188(art, 'alarm', [cx - 64, 446, 128, 8]));
      ctx.fillStyle = '#2a2020'; ctx.fillRect(cx - 8, 540, 16, 84); break;
    }
    case 'repair-bench': {
      const art = paint('asph-repair-cradle', [cx - 220, 380, 420, 244]);
      if (!art) { ctx.fillStyle = '#3b4246'; ctx.fillRect(cx - 200, 560, 260, 20); ctx.fillRect(cx - 190, 580, 10, 44); ctx.fillRect(cx + 40, 580, 10, 44);
        ctx.fillStyle = '#5b6358'; ctx.beginPath(); ctx.ellipse(cx - 110, 540, 46, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1b2022'; ctx.beginPath(); ctx.ellipse(cx - 110, 540, 26, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2a3236'; ctx.fillRect(cx + 90, 420, 110, 204); ctx.fillStyle = '#7b7f84'; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) ctx.fillRect(cx + 98 + c * 34, 432 + r * 46, 26, 18 + (r + c) % 2 * 8);
        ctx.fillStyle = '#c9a54a'; ctx.fillRect(cx - 220, 380, 300, 8); ctx.fillStyle = '#151a1c'; ctx.fillRect(cx - 112, 388, 3, 126); }
      if (!still && Math.floor(time * 6) % 3 === 0) { ctx.fillStyle = '#fff2b0'; ctx.fillRect(...asphodeleArtRectV188(art, 'spark0', [cx - 60, 548, 4, 4])); ctx.fillRect(...asphodeleArtRectV188(art, 'spark1', [cx - 54, 542, 2, 2])); }
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i < (state.cheyenne || 0) ? '#7dff9a' : '#1c2923'; ctx.fillRect(...asphodeleArtRectV188(art, `upgrade${i}`, [cx - 190 + i * 20, 566, 12, 6])); } break;
    }
    default: break;
  }
  ctx.restore();
}

/** Three QZ17 cradles are separate from the archive terminal and its prompt. */
export function drawAsphodeleCradlesV188(ctx, x, loader = null) {
  ctx.save();
  const art = drawAsphodeleArtV188(ctx, loader, 'asph-cradles', [x, 548, 402, 76]);
  for (let i = 0; i < 3; i++) {
    const left = x + i * 140;
    if (!art) {
      ctx.fillStyle = '#26323a'; ctx.fillRect(left, 572, 122, 52); ctx.fillStyle = '#0e1517'; ctx.fillRect(left + 6, 580, 110, 38);
      ctx.fillStyle = '#2f3c44'; ctx.fillRect(left + 4, 548, 60, 10);
    }
    drawAsphodeleScreenV188(ctx, art, `label${i}`, [left + 68, 557, 42, 14], () => {
      ctx.fillStyle = '#e9d07a'; ctx.font = '700 10px monospace'; ctx.fillText('QZ17', left + 70, 568);
    }, null);
  }
  ctx.restore(); return art ? 'image' : 'primitive';
}

/** Authored poses retain one scale and their measured foot pivot in both directions. */
export function drawAsphodeleActorV188(ctx, loader, id, cx, feetY, { facing = 1, phase = 0, moving = false, still = false, role = null } = {}) {
  const slot = getAsphodeleHubSlotV188(id);
  if (slot?.layer !== 'actor') throw new Error(`Unknown Asphodèle actor art slot: ${id}`);
  const layout = ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188[id], image = loader?.image(id);
  const walk = moving && !still && id !== 'asph-grue';
  const step = Math.floor((Number.isFinite(phase) ? phase : 0) / (Math.PI * 2) * 4);
  const frameIndex = walk ? [1, 2, 3, 2][((step % 4) + 4) % 4] : 0;
  const frame = layout?.frames?.[frameIndex];
  const fit = frame && asphodeleImageFitV188(image, 0, 0, 1, 1, { sourceRect: frame.rect });
  const valid = fit && Number.isFinite(layout.referenceHeight) && layout.referenceHeight > 0
    && (!walk || layout.frames.length === 4) && Array.isArray(frame.foot) && frame.foot.length === 2 && frame.foot.every(Number.isFinite)
    && frame.foot[0] >= fit.sx && frame.foot[0] <= fit.sx + fit.sw
    && frame.foot[1] >= fit.sy && frame.foot[1] <= fit.sy + fit.sh;
  if (!valid) {
    if (id === 'asph-grue') drawGrueV188(ctx, cx, feetY);
    else drawAsphodeleWorkerV188(ctx, role || id.slice('asph-npc-'.length), cx, feetY, { facing, phase, moving, still });
    if (loader) loader.usage[id] = 'primitive';
    return 'primitive';
  }
  const scale = slot.height / layout.referenceHeight;
  ctx.save();
  ctx.fillStyle = id === 'asph-grue' ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.32)';
  ctx.beginPath(); ctx.ellipse(cx, feetY + 1, id === 'asph-grue' ? 18 : 16, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(cx, feetY); ctx.scale((facing < 0 ? -1 : 1) * scale, scale);
  ctx.drawImage(image, fit.sx, fit.sy, fit.sw, fit.sh, fit.sx - frame.foot[0], fit.sy - frame.foot[1], fit.sw, fit.sh);
  ctx.restore(); loader.usage[id] = 'image'; return 'image';
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
export function drawDockedVesselV188(ctx, cx, kind, loader = null) {
  ctx.save(); ctx.fillStyle = '#05080b'; ctx.fillRect(cx - 110, 250, 220, 130);
  ctx.save(); ctx.beginPath(); ctx.rect(cx - 107, 253, 214, 124); ctx.clip();
  ctx.fillStyle = 'rgba(230,240,255,.6)'; for (let i = 0; i < 14; i++) ctx.fillRect(cx - 104 + (i * 37) % 208, 256 + (i * 23) % 118, 2, 2);
  const art = drawAsphodeleArtV188(ctx, loader, kind === 'crucible' ? 'asph-crucible-shuttle' : 'asph-ud4l-docked', [cx - 104, 256, 208, 118], { alignY: .5 });
  if (!art) {
    if (kind === 'crucible') { ctx.fillStyle = '#5c5245'; ctx.fillRect(cx - 80, 300, 150, 50); ctx.fillStyle = '#7a6b55'; ctx.fillRect(cx + 40, 280, 10, 30); ctx.fillRect(cx + 40, 280, 40, 6); }
    else { ctx.fillStyle = kind === 'echo8' ? '#3c4232' : '#4a5440'; ctx.beginPath(); ctx.moveTo(cx - 90, 340); ctx.lineTo(cx - 40, 296); ctx.lineTo(cx + 70, 296); ctx.lineTo(cx + 96, 326); ctx.lineTo(cx + 70, 350); ctx.lineTo(cx - 60, 352); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#9fd7e8'; ctx.fillRect(cx + 50, 304, 22, 10); }
  }
  if (kind === 'echo8') { ctx.fillStyle = '#e9d07a'; ctx.font = '700 10px monospace'; ctx.fillText('ECHO-8', cx - 30, 330); }
  ctx.restore(); ctx.strokeStyle = '#3a4448'; ctx.lineWidth = 6; ctx.strokeRect(cx - 110, 250, 220, 130);
  ctx.restore(); return art ? 'image' : 'primitive';
}
