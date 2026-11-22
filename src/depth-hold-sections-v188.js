// V188 — data-driven depth sections for mission holds (specs/004-cales-profondeur-suite).
//
// Each hold is a definition: which campaigns it belongs to, how its x range and floor are
// measured on the generated level, its depth bounds, its floor objects (number, size, lanes)
// and the depths where its sleepers wait. One builder turns a definition into the section
// object used by withMissionDepthRoomsV188 (mission-depth-v188.js). QZ-17 (spec 002) is the
// first definition and builds exactly the section it built before.
//
// Rules shared by every hold (spec 004, FR-003 … FR-006):
// - doors, ladders and every interaction stay on the rail (z = 0), reached from |z| ≤ 20/24;
// - every floor object leaves a lane of at least 20 depth units on each side, or reaches the
//   front edge (no squeezed pocket);
// - an object taller than its depth offset hides the wall: it only stands where the wall
//   shows no door frame, vent, doorway, pickup, cover, ladder or station;
// - depth scale: floor depth is foreshortened, ≈ 22 z units per metre (a 10-ft container,
//   2.44 m deep, spans 54 units in QZ-17); widths and heights stay at 1 m ≈ 51 px.
import { qz17HoldLayoutV188, unfitForHoldV188 } from './qz17-level-dressing-v188.js';
import { blockedByFootprintV188 } from './hub-depth-rooms-v188.js';
import { selectMissionTemplateV52 } from './mission-levels-v52.js';
import { colonyC1PlacesV188 } from './colony-level-places-v188.js';

export const DEPTH_HOLD_LANE_MIN_V188 = 20;
export const DEPTH_HOLD_Z_PER_METRE_V188 = 22;
export const DEPTH_HOLD_DOOR_FRAME_REACH_V188 = 57; // a closed bulkhead is drawn 157 px wide: 57 px into the hold
const SHIP_TEMPLATE = 'ship-interior-vertical';
const list = value => Array.isArray(value) ? value : [];
const footprint = (id, x0, x1, z0, z1) => Object.freeze({ id, x0, x1, z0, z1 });
const prop = (id, kind, x, w, h, z, z0, z1, extra = {}) => Object.freeze({ id, kind, x, w, h, z, ...extra, footprint: footprint(id, x, x + w, z0, z1) });

/** The cargo floor between the dock and cargo bulkheads, on the lowest deck of zone ship-cargo. */
export function shipCargoHoldBoundsV188(engine) {
  const doors = list(engine?.doors), dock = doors.find(door => door.id === 'dock-bulkhead'), cargo = doors.find(door => door.id === 'cargo-bulkhead');
  const decks = list(engine?.platforms).filter(entry => entry.zoneId === 'ship-cargo' && Number.isFinite(entry.y));
  if (!dock || !cargo || !decks.length) return null;
  const floorY = Math.max(...decks.map(entry => entry.y)), x0 = dock.x + dock.w, x1 = cargo.x;
  return x1 - x0 > 300 ? { x0, x1, floorY } : null;
}

/** Everything that stands against the back wall of the hold, on its floor (x ranges). */
export function holdWallFeaturesV188(engine, bounds) {
  if (!bounds) return [];
  const { x0, x1, floorY } = bounds, reach = DEPTH_HOLD_DOOR_FRAME_REACH_V188, out = [
    { id: 'frame:west', kind: 'door', x0: x0 - 1, x1: x0 + reach }, { id: 'frame:east', kind: 'door', x0: x1 - reach, x1: x1 + 1 }];
  const onFloor = entity => entity && Number.isFinite(Number(entity.x)) && Math.abs(Number(entity.y) + (Number(entity.h) || 0) - floorY) < 6;
  const add = (kind, entity) => {
    const a = Number(entity.x), b = a + (Number(entity.w) || 0);
    if (b > x0 && a < x1) out.push({ id: `${kind}:${entity.id || kind}`, kind, x0: a, x1: b });
  };
  for (const [kind, entries] of [['vent', engine.vents], ['doorway', engine.rearEntrancesV130], ['supply', engine.supplies], ['cover', engine.covers],
    ['evidence', engine.narrativeCollectableActorsV68], ['station', engine.alienSurvivalStationsV70], ['camera', engine.alienSurvivalCameraFeedsV70]]) {
    for (const entity of list(entries)) if (onFloor(entity) && !entity.destroyed) add(kind, entity);
  }
  for (const entity of [engine.toolPickup, engine.powerNode, engine.archiveTerminal]) if (onFloor(entity)) add('pickup', entity);
  for (const ladder of list(engine.ladders)) if (Number(ladder.bottom) >= floorY - 4 && Number(ladder.top) < floorY) add('ladder', { id: ladder.id, x: ladder.x, w: ladder.w || 42 });
  return out.sort((a, b) => a.x0 - b.x0);
}

/** Wall intervals with nothing on them, inside the hold. */
export function clearWallIntervalsV188(features, bounds, margin = 4) {
  const out = []; let cursor = bounds.x0;
  for (const entry of features) {
    if (entry.x0 - margin > cursor) out.push({ x0: cursor, x1: entry.x0 - margin });
    cursor = Math.max(cursor, entry.x1 + margin);
  }
  if (bounds.x1 > cursor) out.push({ x0: cursor, x1: bounds.x1 });
  return out.filter(entry => entry.x1 > entry.x0);
}

/** True when an object drawn at depth z rises above the floor line, in front of the wall. */
export const hidesWallV188 = entry => entry.h > -entry.z;

/** Lane rule: every pair of footprints that overlap in x (plus a marine width) are ≥ 20 apart in z or touch; edges too. */
export function depthLaneIssuesV188(section, { minimum = DEPTH_HOLD_LANE_MIN_V188, marine = 36 } = {}) {
  const issues = [], prints = section.props.map(entry => entry.footprint);
  for (const entry of prints) {
    if (entry.z0 > section.zMin && entry.z0 - section.zMin < minimum) issues.push(`${entry.id}: front lane ${entry.z0 - section.zMin}`);
    if (entry.z1 < section.zMax && section.zMax - entry.z1 < minimum) issues.push(`${entry.id}: wall lane ${section.zMax - entry.z1}`);
  }
  for (let i = 0; i < prints.length; i++) for (let j = i + 1; j < prints.length; j++) {
    const a = prints[i], b = prints[j];
    if (!(a.x0 < b.x1 + marine && b.x0 < a.x1 + marine)) continue;
    const gap = Math.max(a.z0 - b.z1, b.z0 - a.z1);
    if (gap > 0 && gap < minimum) issues.push(`${a.id} / ${b.id}: lane ${gap}`);
  }
  return issues;
}

/**
 * Physical passage on a grid (2 px × 1 unit), with the marine's half width: every free cell must be
 * reachable from the west bulkhead on the rail, and the east bulkhead's rail band must be reached.
 */
export function depthPassageV188(section, { halfWidth = 18, doorBand = section.doorBand } = {}) {
  const xs = [], zs = [];
  for (let x = section.x0 + halfWidth + 2; x <= section.x1 - halfWidth - 2; x += 2) xs.push(x);
  for (let z = section.zMin; z <= section.zMax; z += 1) zs.push(z);
  const free = xs.map(x => zs.map(z => !blockedByFootprintV188(section, x, z, halfWidth)));
  const seen = xs.map(() => zs.map(() => false)), queue = [];
  const zi0 = zs.indexOf(0);
  if (free[0][zi0]) { seen[0][zi0] = true; queue.push([0, zi0]); }
  for (let head = 0; head < queue.length; head++) {
    const [i, k] = queue[head];
    for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + di, nk = k + dk;
      if (ni < 0 || nk < 0 || ni >= xs.length || nk >= zs.length || seen[ni][nk] || !free[ni][nk]) continue;
      seen[ni][nk] = true; queue.push([ni, nk]);
    }
  }
  let freeCells = 0, pockets = 0;
  for (let i = 0; i < xs.length; i++) for (let k = 0; k < zs.length; k++) if (free[i][k]) { freeCells++; if (!seen[i][k]) pockets++; }
  const last = xs.length - 1, eastDoor = zs.some((z, k) => Math.abs(z) <= doorBand && seen[last][k]);
  const westDoor = zs.some((z, k) => Math.abs(z) <= doorBand && seen[0][k]);
  return { westDoor, eastDoor, freeCells, pockets };
}

/** Places a definition's objects: wall-hiding ones only on a clear stretch of wall; lane rule enforced. */
export function placeHoldPropsV188(specs, bounds, features, { zMin = -80, zMax = 0 } = {}) {
  const clear = clearWallIntervalsV188(features, bounds), placed = [], skipped = [];
  const draft = { zMin, zMax, props: [] };
  for (const spec of specs) {
    const tall = spec.h > -spec.z;
    let x = null;
    // Wall-hiding objects stand in the middle of the first (west) or last (east) clear stretch of wall wide enough for them.
    const centre = entry => entry ? (entry.x0 + entry.x1 - spec.w) / 2 : null;
    if (spec.place === 'west-clear') x = centre(clear.find(entry => entry.x1 - entry.x0 >= spec.w + 12));
    else if (spec.place === 'east-clear') x = centre([...clear].reverse().find(entry => entry.x1 - entry.x0 >= spec.w + 12));
    else if (Number.isFinite(spec.at)) x = bounds.x0 + spec.at;
    if (!Number.isFinite(x)) { skipped.push({ id: spec.id, reason: 'no clear wall' }); continue; }
    x = Math.round(x);
    if (tall && !clear.some(entry => x >= entry.x0 && x + spec.w <= entry.x1)) { skipped.push({ id: spec.id, reason: 'hides the wall' }); continue; }
    const entry = prop(spec.id, spec.kind, x, spec.w, spec.h, spec.z, spec.z0, spec.z1, { slot: spec.slot, ...(spec.labels ? { labels: Object.freeze([...spec.labels]) } : {}) });
    const trial = { ...draft, props: [...draft.props, entry] };
    if (depthLaneIssuesV188(trial).length) { skipped.push({ id: spec.id, reason: 'lane' }); continue; }
    draft.props.push(entry); placed.push(entry);
  }
  return { placed, skipped };
}

// V188 colony levels: C2 « L'air du port » is an interior of Port-Méridien, played in V1 (bible §43.1).
const V1_INTERIOR_CAMPAIGNS = Object.freeze(['colony-c2']);
const isShipCampaignOfItsOwn = (campaign, world) => {
  if (!campaign || campaign.specialOperationId || String(campaign.id || '').startsWith('special-') || V1_INTERIOR_CAMPAIGNS.includes(campaign.id)) return false;
  return selectMissionTemplateV52({ campaign: { ...campaign, templateId: campaign.templateId }, world: world || {} }) === SHIP_TEMPLATE;
};

// —— Definitions ——
// z0..z1 footprints and draw z; widths/heights at 51 px/m, depths at ≈ 22 units/m.
export const DEPTH_HOLD_DEFINITIONS_V188 = Object.freeze([
  Object.freeze({
    id: 'qz17-cargo-hold', spec: '002', campaignIds: Object.freeze(['special-narrative-qz17']),
    zoneId: 'ship-cargo', zMin: -80, zMax: 0, doorBand: 20, interactBand: 24, speed: 150, railCovers: true,
    bigCastes: 'service-deck', // the QZ-17 dressing moves unfit castes to the service deck (spec 002, R8)
    // Fixed layout from the QZ-17 dressing (qz17-level-dressing-v188.js); sleepers placed by the dressing.
    layout(bounds) {
      const layout = qz17HoldLayoutV188(bounds.x0, bounds.x1);
      return { props: layout.blocking.map(entry => prop(entry.id, entry.kind, entry.x, entry.w, entry.h, entry.z, entry.z0, entry.z1,
        entry.labels ? { stack: entry.stack, labels: entry.labels } : {})), bay: layout.bay, skipped: [] };
    }
  }),
  Object.freeze({
    id: 'freighter-cargo-hold', spec: '004',
    // The lower hold of the procedural ship missions (FRONTIER / MIRE pairs whose own template is the ship).
    eligible: ({ campaign, world }) => isShipCampaignOfItsOwn(campaign, world),
    zoneId: 'ship-cargo', zMin: -80, zMax: 0, doorBand: 20, interactBand: 24, speed: 150, railCovers: true, bigCastes: 'span',
    props: Object.freeze([
      // West, between the dock bulkhead frame and the duct: two crates on a pallet (1.2 m deep → 26 units).
      Object.freeze({ id: 'freighter-stack-west', kind: 'crate-stack', slot: 'freighter-crate-stack', w: 61, h: 92, z: -47, z0: -60, z1: -34, place: 'west-clear', labels: ['C-21', 'C-22'] }),
      // In front of the duct and the doorway: a low drum rack against the front edge (0.6 m → 14 units).
      Object.freeze({ id: 'freighter-drums', kind: 'drum-rack', slot: 'freighter-drum-rack', w: 96, h: 52, z: -73, z0: -88, z1: -66, at: 180 }),
      // East, past the wall pickups and the crates cover, clear of the cargo bulkhead frame.
      Object.freeze({ id: 'freighter-stack-east', kind: 'crate-stack', slot: 'freighter-crate-stack', w: 61, h: 92, z: -47, z0: -60, z1: -34, place: 'east-clear', labels: ['C-34', 'C-35'] })
    ]),
    sleeperSlots: Object.freeze([
      Object.freeze({ prop: 'freighter-stack-east', z: -12 }), // behind the east stack, hidden by it
      Object.freeze({ prop: 'freighter-drums', z: -50 }), // behind the drums, in the middle band
      Object.freeze({ prop: 'freighter-stack-west', z: -70 }) // in front of the west stack
    ])
  }),
  Object.freeze({
    id: 'lethe-quarantine-hold', spec: '004', campaignIds: Object.freeze(['special-alien-survival-systems']),
    zoneId: 'ship-cargo', zMin: -80, zMax: 0, doorBand: 20, interactBand: 24, speed: 150, railCovers: true, bigCastes: 'span',
    acidBand: 24, initialAcidZ: -50,
    props: Object.freeze([
      // Low objects only: their tops stay under the wall base line, the welding kit and the welds stay readable.
      Object.freeze({ id: 'quarantine-crate-west', kind: 'quarantine-crate', slot: 'quarantine-crate', w: 92, h: 61, z: -67, z0: -86, z1: -54, at: 70 }),
      Object.freeze({ id: 'quarantine-cart', kind: 'quarantine-cart', slot: 'quarantine-cart', w: 76, h: 40, z: -48, z0: -58, z1: -40, at: 180 }),
      Object.freeze({ id: 'quarantine-crate-east', kind: 'quarantine-crate', slot: 'quarantine-crate', w: 92, h: 61, z: -67, z0: -86, z1: -54, at: 420 })
    ]),
    sleeperSlots: Object.freeze([
      Object.freeze({ prop: 'quarantine-crate-east', z: -30 }),
      Object.freeze({ prop: 'quarantine-cart', z: -70 }),
      Object.freeze({ prop: 'quarantine-crate-west', z: -30 })
    ])
  }),
  // V188 colony levels (bible §43.1: « missions de défense en V2 : rues et murs en couloir de profondeur (C1…) »).
  // C1 « Tenir le port »: the port street from the quay to the landing platform, measured on the colony
  // template (colony-level-places-v188.js); the lifts are parked at street level by the colony level layer.
  // Its objects reuse the shipped hold slots: port freight, a drum rack in the street, a medical crate.
  Object.freeze({
    id: 'colony-c1-port-corridor', spec: 'colony-levels', campaignIds: Object.freeze(['colony-c1']),
    zoneId: null, zMin: -80, zMax: 0, doorBand: 20, interactBand: 24, speed: 150, railCovers: true, railCoversAnyZone: true, bigCastes: 'span',
    // Owner decision 2026-11-22 [PROPOSÉ 640 px, half a screen]: the deck seams never lean more than they do at the
    // edge of a screen centred on the street; before, the ends of the 4 450 px street leaned ≈ 3.5 times more.
    deckPerspectiveSpan: 640,
    bounds(engine) {
      const places = colonyC1PlacesV188(engine), { x0, x1 } = places.corridor;
      const floor = list(engine?.platforms).some(entry => Math.abs(entry.y - places.floorY) < 1 && entry.x <= x0 + 40 && entry.x + entry.w >= x0);
      return floor && x1 - x0 > 300 ? { x0, x1, floorY: places.floorY } : null;
    },
    layout(bounds, engine) {
      const places = colonyC1PlacesV188(engine), at = x => x - bounds.x0, door = places.shutter;
      // The level's own wall art is wall content too: the container, the shutter, the infirmary, airlock B.
      const features = [...holdWallFeaturesV188(engine, bounds),
        { id: 'colony:container', kind: 'wall-art', x0: places.container - 4, x1: places.container + 160 },
        { id: 'colony:shutter', kind: 'wall-art', x0: door.x - 6, x1: door.x + door.w + 36 },
        { id: 'colony:infirmary', kind: 'wall-art', x0: places.infirmary - 120, x1: places.lucia + 40 },
        { id: 'colony:airlock-b', kind: 'wall-art', x0: places.airlockB - 60, x1: places.airlockB + 60 }].sort((a, b) => a.x0 - b.x0);
      const { placed, skipped } = placeHoldPropsV188([
        Object.freeze({ id: 'colony-freight-quay', kind: 'crate-stack', slot: 'freighter-crate-stack', w: 61, h: 92, z: -47, z0: -60, z1: -34, at: at(places.quay - 230), labels: ['PM-12', 'PM-13'] }),
        Object.freeze({ id: 'colony-drums-street', kind: 'drum-rack', slot: 'freighter-drum-rack', w: 96, h: 52, z: -73, z0: -88, z1: -66, at: at(places.plaza + 170) }),
        Object.freeze({ id: 'colony-medical-crate', kind: 'quarantine-crate', slot: 'quarantine-crate', w: 92, h: 61, z: -67, z0: -86, z1: -54, at: at(places.infirmary - 260) }),
        Object.freeze({ id: 'colony-freight-platform', kind: 'crate-stack', slot: 'freighter-crate-stack', w: 61, h: 92, z: -47, z0: -60, z1: -34, at: at(places.pad + 260), labels: ['PM-31', 'PM-32'] })
      ], bounds, features, this);
      return { props: placed, bay: null, skipped };
    },
    sleeperSlots: Object.freeze([])
  })
]);
export const DEPTH_HOLD_IDS_V188 = Object.freeze(DEPTH_HOLD_DEFINITIONS_V188.map(entry => entry.id));
export const depthHoldDefinitionV188 = id => DEPTH_HOLD_DEFINITIONS_V188.find(entry => entry.id === id) || null;

/** The hold definition of a campaign, or null (2D everywhere). */
export function resolveDepthHoldDefinitionV188({ campaign, world } = {}) {
  const id = String(campaign?.id || '');
  return DEPTH_HOLD_DEFINITIONS_V188.find(entry => entry.campaignIds?.includes(id))
    || DEPTH_HOLD_DEFINITIONS_V188.find(entry => entry.eligible?.({ campaign, world })) || null;
}

/** Builds the section of a definition on the generated level. */
export function buildDepthHoldSectionV188(engine, definition) {
  if (!definition) return null;
  const bounds = typeof definition.bounds === 'function' ? definition.bounds(engine) : shipCargoHoldBoundsV188(engine);
  if (!bounds) return null;
  const { x0, x1, floorY } = bounds;
  let props, bay = null, skipped = [];
  if (definition.layout) ({ props, bay = null, skipped = [] } = definition.layout(bounds, engine));
  else ({ placed: props, skipped } = placeHoldPropsV188(definition.props, bounds, holdWallFeaturesV188(engine, bounds), definition));
  // A rail crates cover left in the hold stays a wall-side object (jumped near the wall, walked around further out).
  const covers = definition.railCovers ? list(engine.covers).filter(cover => (definition.railCoversAnyZone
    ? Math.abs(Number(cover.y) + (Number(cover.h) || 0) - floorY) < 6 : cover.zoneId === definition.zoneId) && cover.x >= x0 && cover.x + cover.w <= x1)
    .map(cover => prop(`cover:${cover.id}`, 'cover', cover.x, cover.w, cover.h, -2, -34, 1)) : [];
  const section = { id: definition.id, roomId: definition.id, zoneId: definition.zoneId, x0, x1, floorY,
    zMin: definition.zMin, zMax: definition.zMax, doorBand: definition.doorBand, interactBand: definition.interactBand, speed: definition.speed,
    dropship: null, bay, props: Object.freeze([...props, ...covers]), containers: Object.freeze(props), coverIds: Object.freeze(covers.map(entry => entry.id.slice(6))),
    ...(Number.isFinite(definition.deckPerspectiveSpan) ? { deckPerspectiveSpan: definition.deckPerspectiveSpan } : {}) };
  // QZ-17 keeps exactly its spec-002 shape; the other holds add their placement report.
  if (!definition.layout || definition.bounds) Object.assign(section, { skipped: Object.freeze(skipped) });
  return Object.freeze(section);
}

/** Whether an enemy fills the whole depth of a hold (too big to steer between its objects). */
export const spansHoldDepthV188 = (definition, enemy) => definition?.bigCastes === 'span' && unfitForHoldV188(enemy);

/** Sleeper spots of a hold: behind or in front of its objects, never inside a footprint. */
export function holdSleeperSlotsV188(section, definition) {
  return list(definition?.sleeperSlots).map(entry => {
    const anchor = section.containers.find(item => item.id === entry.prop);
    if (!anchor) return null;
    const x = anchor.x + anchor.w / 2;
    return blockedByFootprintV188(section, x, entry.z, 22) ? null : { x, z: entry.z };
  }).filter(Boolean);
}
