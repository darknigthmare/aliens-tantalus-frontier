import { HUB_DECKS } from './hub-game.js';
import { HUB_SHIP_CONNECTIONS_V137 } from './hub-ship-layout-v137.js';
import { getArmoryStorefrontPlanV169 } from './hub-armory-storefront-v169.js';
import { buildHubTraversalGeometryV87 } from './hub-v51-runtime.js';
import { getHubCirculationPlanV137, getHubServiceConduitPlanV137 } from './hub-circulation-v137.js';
import { HUB_COMMAND_DETAILS_V177 } from './hub-batch-command-v177.js';
import { HUB_HABITAT_DETAILS_V177 } from './hub-batch-habitat-v177.js';
import { HUB_INDUSTRIAL_DETAILS_V177 } from './hub-batch-industrial-v177.js';
import { HUB_ENGINEERING_DETAILS_V177 } from './hub-batch-engineering-v177.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const valid = b => b && [b.x, b.y, b.w, b.h].every(Number.isFinite) && b.w > 0 && b.h > 0;
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const grow = (b, margin) => ({ x: b.x - margin, y: b.y - margin, w: b.w + margin * 2, h: b.h + margin * 2 });

export const HUB_ENRICHMENT_KINDS_V177 = freeze([
  'intercom', 'status-beacon', 'inspection-hatch', 'safety-callpoint',
  'vent-return', 'pressure-station', 'cable-tray', 'emergency-lamp',
  'sensor-head', 'spill-kit', 'hose-reel', 'sealed-record',
  'power-socket', 'oxygen-readout', 'sanitation-unit', 'tool-shadowboard'
]);
export const HUB_ENRICHMENT_SECTORS_V177 = freeze({
  command: HUB_COMMAND_DETAILS_V177, habitat: HUB_HABITAT_DETAILS_V177,
  industrial: HUB_INDUSTRIAL_DETAILS_V177, engineering: HUB_ENGINEERING_DETAILS_V177
});
export const HUB_ROOM_ENRICHMENT_V177 = freeze(Object.entries(HUB_ENRICHMENT_SECTORS_V177)
  .flatMap(([sector, entries]) => entries.map(entry => ({ ...entry, bounds: { ...entry.bounds }, sector }))));
const kinds = new Set(HUB_ENRICHMENT_KINDS_V177);
const manualKinds = new Set(['intercom', 'safety-callpoint', 'spill-kit', 'hose-reel',
  'power-socket', 'sanitation-unit', 'tool-shadowboard']);
export const HUB_ENRICHMENT_SERVICE_HEIGHT_V177 = freeze({
  actorPhysicsHeight: 92, maximumRise: 120, minimumRise: 44, actorHalfWidth: 22,
  scope: 'project-service-height-envelope-not-a-universal-anatomical-measurement'
});
const byRoom = new Map();
for (const entry of HUB_ROOM_ENRICHMENT_V177) {
  if (!byRoom.has(entry.roomId)) byRoom.set(entry.roomId, []);
  byRoom.get(entry.roomId).push(entry);
}
const defaultTraversal = new Map();
function roomPlatforms(room, options) {
  if (options.platforms) return options.platforms;
  if (room.world) return room.platforms || [];
  const index = HUB_DECKS.findIndex(deck => deck.rooms.some(candidate => candidate.id === room.id));
  if (index < 0) return [];
  if (!defaultTraversal.has(index)) defaultTraversal.set(index, buildHubTraversalGeometryV87(index));
  return defaultTraversal.get(index).platforms.filter(platform => platform.roomId === room.id);
}

/** A project height check on an actual support. It does not claim a complete
 * journey to that support, a usable new interaction, or medical anatomy. */
export function getHubEnrichmentServiceHeightV177(room, spatial, kind, bounds, options = {}) {
  if (!manualKinds.has(kind)) return null;
  const supports = [{ id: room.id + '-floor', x: spatial.bounds.x, w: spatial.bounds.w, y: spatial.planes.walkY },
    ...roomPlatforms(room, options).filter(platform => valid(platform) && platform.type !== 'floor' && platform.role !== 'floor')];
  const contactY = bounds.y + (kind === 'sanitation-unit' ? bounds.h * .72
    : kind === 'power-socket' || kind === 'tool-shadowboard' ? bounds.h * .5
      : kind === 'safety-callpoint' ? bounds.h * .45 : bounds.h - 6);
  const centerX = bounds.x + bounds.w / 2, standard = HUB_ENRICHMENT_SERVICE_HEIGHT_V177;
  const maximumRise = kind === 'sanitation-unit' ? 88 : standard.maximumRise;
  const support = supports.find(candidate => centerX >= candidate.x + standard.actorHalfWidth
    && centerX <= candidate.x + candidate.w - standard.actorHalfWidth
    && contactY >= candidate.y - maximumRise && contactY <= candidate.y - standard.minimumRise);
  return support ? { supportId: support.id, supportY: support.y, contactY,
    rise: support.y - contactY, maximumRise, minimumRise: standard.minimumRise,
    kind: 'actual-support-service-height', observedTravel: false } : null;
}

/** Drawn steel and redirected service runs are foreground silhouettes, even
 * though they do not collide. Keep new fittings readable behind neither. */
export function getHubEnrichmentReservationsV177(room, composition, options = {}) {
  if (!room || !composition?.spatial) return [];
  const platforms = roomPlatforms(room, options), ladders = options.ladders || room.ladders || [],
    vents = options.vents || room.vents || [];
  const reserved = [...composition.spatial.reservations, ...composition.items,
    ...(composition.workstationDetailsV139?.items || []).map(item => item.target),
    ...(composition.clinicalBayV139?.parts || []).map(item => item.bounds),
    ...(composition.serviceDetailsV165?.items || []).map(item => item.clearanceBounds),
    ...(composition.batchDetailsV168?.items || []).map(item => ({ ...item.clearanceBounds, role: item.id }))].filter(valid);
  for (const item of getArmoryStorefrontPlanV169(room.id)?.assets || []) {
    // The rear wall is architecture beneath fittings. Display cases, sellers,
    // lamps and the shop facade have an actual foreground silhouette.
    if (item.layer !== 'architecture') reserved.push({ ...item.dest,
      x: composition.spatial.bounds.x + item.dest.x, role: 'storefront-' + item.id });
  }
  for (const platform of platforms) {
    const plan = getHubCirculationPlanV137(platform, { room, platforms, ladders, vents, centeredLadders: !room.world });
    if (!plan) continue;
    reserved.push({ x: plan.sourceBounds.x - 3, y: plan.railY - plan.railHeight - 3,
      w: plan.sourceBounds.w + 6, h: plan.railHeight + platform.h + 10, role: 'visible-guardrail' });
  }
  const deck = HUB_DECKS.find(candidate => candidate.rooms.some(candidateRoom => candidateRoom.id === room.id));
  const portals = deck ? HUB_SHIP_CONNECTIONS_V137.filter(connection => connection.parentDeck === deck.id)
    .map(connection => connection.parentDoorBounds) : [];
  const signs = composition.spatial.reservations.filter(item => item.role === 'destination-sign');
  for (const occlusion of (options.occluders || room.occluders || []).filter(item => !item.roomId || item.roomId === room.id)) {
    const plan = getHubServiceConduitPlanV137(occlusion, portals, { clearanceBounds: [...vents, ...signs] });
    if (!plan) { if (valid(occlusion)) reserved.push({ ...occlusion, role: 'front-occlusion' }); continue; }
    for (const conduit of plan.conduits) for (let index = 1; index < conduit.points.length; index++) {
      const a = conduit.points[index - 1], b = conduit.points[index];
      reserved.push({ x: Math.min(a[0], b[0]) - 4, y: Math.min(a[1], b[1]) - 4,
        w: Math.abs(a[0] - b[0]) + 8, h: Math.abs(a[1] - b[1]) + 8, role: 'visible-conduit' });
    }
    reserved.push(...plan.wallMounts.map(bounds => ({ ...bounds, role: 'conduit-mount' })));
  }
  return reserved;
}

/** Positions are authored in room coordinates. A refused fitting is reported
 * verbatim; the runtime never searches a gap or moves it to another bay. */
export function getHubRoomEnrichmentPlanV177(room, composition, options = {}) {
  const spatial = composition?.spatial;
  if (!room?.id || !valid(spatial?.bounds)) return null;
  const reserved = getHubEnrichmentReservationsV177(room, composition, options);
  const plan = { schema: 177, batchId: 'T177-BATCH-002', batchSize: 100, roomId: room.id,
    projection: spatial.projection.kind, projectionDxPerY: spatial.projection.dxPerY,
    items: [], omitted: [], collidable: false, interactive: false, geometryPreserved: true };
  const entries = options.entries ? options.entries.filter(item => item.roomId === room.id) : byRoom.get(room.id) || [];
  const seen = new Set();
  for (const entry of entries) {
    const bounds = valid(entry.bounds) ? { ...entry.bounds, x: spatial.bounds.x + entry.bounds.x } : null;
    const clearance = bounds && grow(bounds, 6);
    const conflicts = clearance ? reserved.filter(item => overlap(clearance, item)) : [];
    const manual = manualKinds.has(entry.kind);
    const serviceHeight = bounds && manual ? getHubEnrichmentServiceHeightV177(room, spatial, entry.kind, bounds, options) : null;
    const maximumBottom = manual ? spatial.planes.rearWallBaseY : 510;
    const wall = bounds && bounds.x >= spatial.bounds.x + 112 && bounds.x + bounds.w <= spatial.bounds.x + spatial.bounds.w - 112
      && bounds.y >= spatial.planes.ceilingY + 4 && bounds.y + bounds.h <= maximumBottom
      && bounds.w >= 40 && bounds.w <= 104 && bounds.h >= 24 && bounds.h <= 72;
    const neighbour = clearance && plan.items.some(item => overlap(grow(clearance, 6), item.clearanceBounds));
    if (!wall || !kinds.has(entry.kind) || entry.mount !== 'rear-wall' || !entry.purpose || seen.has(entry.id) || conflicts.length || neighbour || manual && !serviceHeight) {
      plan.omitted.push({ id: entry.id, kind: entry.kind, bounds,
        reason: !wall ? 'outside-wall-or-scale' : conflicts.length ? 'existing-reservation' : neighbour ? 'batch-neighbour'
          : manual && !serviceHeight ? 'unserved-manual-height' : 'invalid-installation',
        conflicts: conflicts.map(item => item.role || item.id || 'existing-furniture') });
      continue;
    }
    seen.add(entry.id);
    plan.items.push({ ...entry, bounds, clearanceBounds: clearance, support: 'flush-rear-wall', plane: 'rear',
      ...(serviceHeight ? { serviceHeight } : {}),
      projection: plan.projection, projectionDxPerY: plan.projectionDxPerY, collidable: false, interactive: false });
  }
  return plan;
}

const stroke = (c, points, color = '#8b9c91', width = 1) => {
  c.strokeStyle = color; c.lineWidth = width; c.beginPath();
  points.forEach(([x, y], index) => index ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
};
const face = (c, x, y, w, h, color = '#405657') => {
  c.fillStyle = '#0b1b20'; c.fillRect(x - 1, y, w + 2, h + 2);
  c.fillStyle = color; c.fillRect(x, y, w, h);
  c.fillStyle = '#a3aea0'; c.fillRect(x + 1, y + 1, w - 2, 1);
  c.fillStyle = '#1d3439'; c.fillRect(x + 1, y + h - 3, w - 2, 2);
};
function mount(c, b) {
  for (const x of [b.x + 3, b.x + b.w - 6]) {
    c.fillStyle = '#1a3035'; c.fillRect(x, b.y - 2, 3, b.h + 4);
    c.fillStyle = '#abb5a6'; c.fillRect(x + 1, b.y - 1, 1, 2); c.fillRect(x + 1, b.y + b.h - 1, 1, 2);
  }
}
function gauge(c, x, y, radius, position) {
  c.fillStyle = '#13282c'; c.beginPath(); c.arc(x, y, radius + 1, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#bcc2ab'; c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.fill();
  stroke(c, [[x, y], [x + Math.cos(position) * radius * .75, y + Math.sin(position) * radius * .75]], '#263f42');
}
function drawFitting(c, item) {
  const { bounds: b, kind } = item, { x, y, w, h } = b;
  mount(c, b);
  if (kind === 'intercom') {
    face(c, x, y, w, h); face(c, x + 5, y + 5, w * .53, h - 11, '#213b40');
    for (let row = 0; row < 5; row++) stroke(c, [[x + 8, y + 8 + row * (h - 17) / 5], [x + w * .53, y + 8 + row * (h - 17) / 5]], '#72877d');
    c.fillStyle = '#c0bc93'; c.fillRect(x + w * .73, y + h * .24, Math.max(3, w * .09), 3);
    stroke(c, [[x + w * .76, y + h * .52], [x + w * .76, y + h - 6]], '#a7b4a0', 3);
  } else if (kind === 'status-beacon') {
    face(c, x + w * .15, y, w * .7, h, '#283e42');
    for (let index = 0; index < 3; index++) { c.fillStyle = ['#9eb49d', '#c2aa71', '#805d51'][index];
      c.fillRect(x + w * .25, y + 4 + index * (h - 8) / 3, w * .5, Math.max(3, (h - 14) / 3)); }
  } else if (kind === 'inspection-hatch') {
    face(c, x, y, w, h, '#344d52'); face(c, x + 5, y + 5, w - 10, h - 10, '#425c5b');
    stroke(c, [[x + w - 12, y + h * .35], [x + w - 12, y + h * .65]], '#bec2a8', 2);
    for (const yy of [y + 8, y + h - 10]) { c.fillStyle = '#21363a'; c.fillRect(x + 2, yy, 7, 3); }
  } else if (kind === 'safety-callpoint') {
    face(c, x + w * .17, y, w * .66, h, '#885b4a'); face(c, x + w * .26, y + 5, w * .48, h - 11, '#c0b69a');
    stroke(c, [[x + w * .35, y + h * .45], [x + w * .65, y + h * .45]], '#293e3d', 3);
    stroke(c, [[x + w * .35, y + h * .67], [x + w * .65, y + h * .67]], '#625e50');
  } else if (kind === 'vent-return') {
    face(c, x, y, w, h, '#566966');
    for (let row = 0; row < 5; row++) stroke(c, [[x + 6, y + 6 + row * (h - 12) / 5], [x + w - 6, y + 6 + row * (h - 12) / 5]], '#1a3339', 2);
    stroke(c, [[x + 6, y + h - 5], [x + w - 6, y + h - 5]], '#b0b9a7');
  } else if (kind === 'pressure-station') {
    face(c, x, y + h * .23, w, h * .77, '#324b50');
    gauge(c, x + w * .29, y + h * .38, Math.min(w * .17, h * .25), -1.1);
    gauge(c, x + w * .71, y + h * .38, Math.min(w * .17, h * .25), -.6);
    stroke(c, [[x + 8, y + h - 7], [x + w - 8, y + h - 7]], '#899c8d', 3);
    for (const xx of [x + w * .29, x + w * .71]) stroke(c, [[xx, y + h * .72], [xx, y + h - 4]], '#b3a77e', 2);
  } else if (kind === 'cable-tray') {
    face(c, x, y + 3, w, h - 6, '#304a50');
    for (let row = 0; row < 3; row++) stroke(c, [[x + 3, y + 7 + row * 4], [x + w - 3, y + 7 + row * 4]], ['#7c8f81', '#ad9b72', '#687f7d'][row], 2);
    for (const xx of [x + w * .2, x + w * .5, x + w * .8]) { c.fillStyle = '#abb4a4'; c.fillRect(xx, y + 2, 3, h - 4); }
  } else if (kind === 'emergency-lamp') {
    face(c, x, y + 3, w, h - 6, '#344d4e'); face(c, x + 5, y + 7, w - 10, h - 14, '#c0b78e');
    for (const xx of [x + w * .25, x + w * .5, x + w * .75]) stroke(c, [[xx, y + 4], [xx, y + h - 4]], '#6a8076', 2);
  } else if (kind === 'sensor-head') {
    stroke(c, [[x + 7, y + 3], [x + 7, y + h * .55], [x + w * .45, y + h * .55]], '#8ea294', 3);
    face(c, x + w * .35, y + h * .18, w * .54, h * .54, '#4f6665');
    c.fillStyle = '#142c32'; c.beginPath(); c.arc(x + w * .64, y + h * .46, h * .16, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#b3bda0'; c.fillRect(x + w * .52, y + h * .31, 3, 3);
  } else if (kind === 'spill-kit') {
    face(c, x + w * .1, y, w * .8, h, '#78765c'); face(c, x + w * .19, y + 6, w * .62, h - 12, '#a9ad91');
    stroke(c, [[x + w * .35, y + h * .45], [x + w * .65, y + h * .45]], '#3b5250', 3);
    stroke(c, [[x + w * .5, y + h * .3], [x + w * .5, y + h * .6]], '#3b5250', 3);
    c.fillStyle = '#263d3f'; c.fillRect(x + w * .27, y + h - 10, w * .46, 3);
  } else if (kind === 'hose-reel') {
    const radius = Math.min(w * .32, h * .36), cx = x + w * .47, cy = y + h * .46;
    face(c, x + 5, y + 2, w - 10, h - 4, '#344c51');
    c.strokeStyle = '#b4a47d'; c.lineWidth = 3;
    for (const r of [radius, radius * .66, radius * .32]) { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); }
    stroke(c, [[cx + radius, cy], [cx + radius, y + h - 8], [x + w - 6, y + h - 8]], '#8a9d8c', 3);
  } else if (kind === 'sealed-record') {
    face(c, x, y, w, h, '#3c5555'); face(c, x + 5, y + 5, w - 10, h - 10, '#b2b69b');
    for (let row = 0; row < 3; row++) stroke(c, [[x + 10, y + 10 + row * 5], [x + w - 11 - row * 3, y + 10 + row * 5]], '#576f66');
    c.fillStyle = '#263d40'; c.fillRect(x + w * .43, y + 1, w * .14, 5);
  } else if (kind === 'power-socket') {
    face(c, x + 4, y, w - 8, h, '#546862');
    for (const xx of [x + w * .33, x + w * .67]) { face(c, xx - 6, y + 6, 12, h - 12, '#263f44');
      stroke(c, [[xx - 3, y + h * .43], [xx + 3, y + h * .43]], '#aeb79f', 2); }
  } else if (kind === 'oxygen-readout') {
    face(c, x, y, w, h); face(c, x + 5, y + 5, w - 10, h - 10, '#17343a');
    for (let index = 0; index < 4; index++) { c.fillStyle = index === 3 ? '#b4ac78' : '#a9bca0';
      c.fillRect(x + 9 + index * (w - 20) / 4, y + h - 12 - index * 2, Math.max(3, (w - 27) / 4), 5 + index * 2); }
  } else if (kind === 'sanitation-unit') {
    face(c, x + w * .17, y, w * .66, h, '#a5afa0'); face(c, x + w * .26, y + 5, w * .48, h * .36, '#3b5656');
    stroke(c, [[x + w * .35, y + h * .72], [x + w * .65, y + h * .72]], '#263d41', 3);
    c.fillStyle = '#c2c7af'; c.fillRect(x + w * .34, y + h * .49, w * .32, 3);
  } else if (kind === 'tool-shadowboard') {
    face(c, x, y, w, h, '#3c5656');
    for (let index = 0; index < 4; index++) { const xx = x + 10 + index * (w - 20) / 3;
      stroke(c, [[xx, y + 8], [xx, y + h - 9]], '#b4b79c', 3);
      stroke(c, [[xx - 3, y + 7], [xx, y + 11], [xx + 3, y + 7]], '#b4b79c', 2); }
  }
}

export function drawHubRoomEnrichmentV177(ctx, plan) {
  if (!ctx || !plan) return null;
  const report = { schema: 177, batchId: plan.batchId, roomId: plan.roomId, admitted: plan.items.length,
    projection: plan.projection, projectionDxPerY: plan.projectionDxPerY,
    painted: [], pending: [], omitted: plan.omitted.map(item => ({ ...item })), collidable: false, interactive: false };
  for (const item of plan.items) {
    ctx.save(); const b = item.clearanceBounds; ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
    drawFitting(ctx, item); ctx.restore();
    report.painted.push({ id: item.id, kind: item.kind, role: item.purpose, sector: item.sector,
      source: 'original-canvas-fixtures', bounds: { ...item.bounds }, support: item.support,
      ...(item.serviceHeight ? { serviceHeight: { ...item.serviceHeight } } : {}) });
  }
  return report;
}
