import { HUB_ANNEXES_V87 } from './hub-annex-registry-v87.js';
import { HUB_ANNEX_ENTRANCES_V133 } from './hub-navigation-layout-v133.js';
import { HUB_AUTHORED_COMPOSITIONS_V133 } from './hub-authored-composition-v133.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const item = (kind, x, y, w, h, options = {}) => ({ kind, x, y, w, h, ...options, plane: 'rear', collidable: false, interactive: false });
const floor = (kind, x, w, h, options) => item(kind, x, 608 - h, w, h, { support: 'rear-floor', ...options });
const wall = (kind, x, y, w, h, options) => item(kind, x, y, w, h, { support: 'rear-wall', ...options });
const bitmap = (asset, x, w, h) => {
  const source = { cryopod: [241, 131], 'bunk-module': [228, 170] }[asset];
  return floor('bitmap', x, source ? source[0] * h / source[1] : w, h, { asset: `/assets/openai/hub/props/${asset}.png` });
};
const profile = (purpose, accent, clusters) => ({ purpose, accent, clusters, items: clusters.flatMap(cluster => cluster.items) });
const cluster = (role, items) => ({ role, items: items.map(entry => ({ ...entry, role })) });

/** Room-local equipment is authored by task, rather than scattered by a seed.
 * The service station keeps its own native prop and interaction. These smaller
 * cupboards, tools and supplies live behind the pedestrian rail and never add
 * a collision, prompt or invented service. Local coordinates are world fixed. */
export const HUB_ROOM_DRESSING_V134 = freeze({
  bridge: profile('navigation-and-watch', '#799d9e', [
    cluster('watch-officer-storage', [floor('locker', 168, 68, 144), floor('chair', 262, 44, 72), floor('chart-cart', 340, 88, 67)]),
    cluster('navigation-reference', [wall('document-rack', 170, 270, 142, 98), wall('chronometers', 170, 220, 144, 50), wall('handset', 1034, 328, 26, 68), floor('case', 1062, 78, 43)]),
    cluster('bridge-services', [wall('vent', 890, 204, 202, 34), wall('lamp', 208, 192, 92, 15)])]),
  briefing: profile('planning-and-meeting', '#a3a181', [
    cluster('briefing-materials', [floor('locker', 172, 72, 122), floor('chart-cart', 272, 88, 69), floor('case', 1080, 66, 38)]),
    cluster('meeting-seats', [floor('chair', 368, 42, 74), floor('chair', 1050, 42, 74), wall('document-rack', 900, 282, 164, 100)]),
    cluster('meeting-wall', [wall('clock', 382, 260, 38, 38), wall('lamp', 390, 196, 90, 15), wall('vent', 780, 210, 136, 32)])]),
  'combat-information': profile('communications-and-tracking', '#78a698', [
    cluster('radio-spares', [floor('radio-rack', 180, 84, 152), floor('case', 286, 74, 45), floor('chair', 1030, 42, 74)]),
    cluster('tactical-reference', [wall('document-rack', 1000, 280, 150, 86), wall('handset', 470, 336, 24, 66), wall('chronometers', 170, 218, 174, 50)]),
    cluster('signal-routing', [wall('vent', 896, 202, 142, 34), wall('lamp', 490, 192, 82, 15), floor('cable-spool', 1100, 40, 49)])]),
  'cryo-bay': profile('stasis-and-capsule-maintenance', '#89a9b0', [
    cluster('capsule-bank', [bitmap('cryopod', 494, 160, 87), bitmap('cryopod', 680, 160, 87)]),
    cluster('stasis-supplies', [floor('medical-cart', 150, 82, 86), wall('capsule-readout', 506, 332, 140, 58), wall('capsule-readout', 690, 332, 140, 58)]),
    cluster('oxygen-lines', [wall('valves', 1030, 250, 74, 130), wall('vent', 816, 202, 148, 34), wall('lamp', 562, 192, 88, 15), wall('cable-run', 810, 402, 144, 24)])]),
  'crew-quarters': profile('sleep-and-personal-storage', '#aba080', [
    cluster('crew-berths', [bitmap('bunk-module', 164, 166, 124), floor('locker', 362, 72, 148), floor('locker', 462, 72, 148)]),
    cluster('shared-rest-area', [floor('bench', 654, 142, 58), floor('case', 816, 66, 38), wall('shelf', 648, 374, 168, 60)]),
    cluster('personal-effects', [wall('document-rack', 184, 348, 122, 72), wall('clock', 476, 246, 36, 36), wall('lamp', 672, 196, 92, 15)]),
    cluster('crew-keepsakes', [floor('stool', 564, 40, 54), wall('shelf', 794, 318, 152, 66), wall('document-rack', 1026, 290, 104, 84)])]),
  mess: profile('galley-and-crew-dining', '#ada184', [
    cluster('galley', [floor('galley', 166, 224, 110), wall('shelf', 182, 364, 194, 72), floor('bin', 420, 42, 60)]),
    cluster('dining-seats', [floor('bench', 1036, 112, 60), floor('chair', 586, 44, 72), floor('drink-dispenser', 952, 66, 134)]),
    cluster('mess-equipment', [wall('vent', 878, 206, 194, 34), wall('clock', 618, 258, 36, 36), wall('lamp', 528, 194, 94, 15)])]),
  medical: profile('treatment-and-sterile-supply', '#9abab0', [
    cluster('sterile-storage', [floor('medical-cabinet', 168, 82, 152), floor('medical-cart', 294, 90, 88), floor('bin', 418, 38, 62)]),
    cluster('diagnostic-supplies', [floor('cylinder', 1038, 32, 112), wall('shelf', 188, 334, 192, 70), wall('medical-sign', 1048, 302, 50, 52)]),
    cluster('clinical-services', [wall('vent', 888, 202, 194, 34), wall('lamp', 486, 196, 86, 15), floor('stool', 598, 42, 58)])]),
  'science-lab': profile('specimen-preparation-and-analysis', '#89a9b5', [
    cluster('preparation-bench', [floor('lab-bench', 164, 204, 111), floor('medical-cart', 404, 76, 87), floor('bin', 510, 36, 58)]),
    cluster('sample-storage', [floor('sample-fridge', 688, 76, 147), wall('sample-shelf', 184, 342, 160, 88), wall('specimen-cabinet', 1080, 294, 68, 128)]),
    cluster('lab-services', [wall('vent', 836, 206, 198, 32), wall('lamp', 484, 196, 90, 15), floor('cylinder', 786, 30, 110)])]),
  quarantine: profile('sealed-containment-and-decontamination', '#ada47b', [
    cluster('decontamination-equipment', [floor('medical-cabinet', 164, 78, 149), floor('cylinder', 276, 30, 110), floor('medical-cart', 346, 82, 86)]),
    cluster('containment-wall', [wall('specimen-cabinet', 624, 270, 86, 160), wall('medical-sign', 1024, 274, 50, 52), wall('valves', 1058, 364, 70, 110)]),
    cluster('sterile-waste', [floor('bin', 648, 40, 65), floor('case', 1082, 58, 40), wall('vent', 816, 202, 148, 34)])]),
  armory: profile('secured-dotation-and-maintenance', '#a8a17f', [
    cluster('spare-equipment', [floor('equipment-rack', 150, 72, 151), floor('case', 280, 86, 48), floor('case', 488, 56, 43)]),
    cluster('armorer-storage', [wall('tool-board', 364, 250, 168, 118), floor('locker', 1080, 66, 142), wall('document-rack', 1010, 274, 122, 90)]),
    cluster('secure-services', [wall('lamp', 342, 194, 92, 15), wall('vent', 864, 208, 178, 32), wall('handset', 1120, 394, 24, 64)])]),
  workshop: profile('fabrication-and-repair', '#a8a17d', [
    cluster('maintenance-bench', [floor('tool-chest', 164, 82, 94), floor('cable-spool', 488, 52, 61), floor('cylinder', 550, 30, 106)]),
    cluster('fabrication-tools', [wall('tool-board', 630, 248, 170, 130), floor('parts-bin', 600, 108, 98), floor('case', 722, 74, 42)]),
    cluster('shop-services', [wall('vent', 850, 202, 202, 34), wall('valves', 1052, 308, 66, 132), wall('lamp', 464, 196, 94, 15)])]),
  'vehicle-bay': profile('vehicle-inspection-and-heavy-maintenance', '#9da68c', [
    cluster('service-carts', [floor('tool-chest', 176, 102, 91), floor('cable-spool', 324, 60, 61), floor('case', 1050, 88, 44)]),
    cluster('inspection-wall', [wall('tool-board', 610, 260, 166, 118), wall('hose-reel', 980, 282, 72, 74), wall('valves', 1048, 404, 70, 86)]),
    cluster('vehicle-bay-services', [wall('vent', 780, 214, 194, 34), wall('lamp', 846, 194, 90, 15), wall('lamp', 390, 194, 88, 15)])]),
  'dropship-hangar': profile('flight-preparation-and-ground-support', '#89a9ad', [
    cluster('flight-ground-equipment', [floor('tool-chest', 166, 110, 94), floor('cable-spool', 306, 62, 65), floor('case', 404, 80, 46)]),
    cluster('hangar-wall-services', [wall('hose-reel', 210, 300, 78, 78), wall('document-rack', 1032, 408, 112, 76), wall('vent', 680, 254, 170, 34)]),
    cluster('flight-safety', [wall('lamp', 442, 192, 88, 15), wall('lamp', 860, 192, 86, 15), wall('handset', 590, 350, 24, 62)])]),
  reactor: profile('power-conversion-and-isolation', '#aca77b', [
    cluster('electrical-isolation', [floor('electrical-cabinet', 166, 96, 155), floor('electrical-cabinet', 290, 96, 155), floor('case', 428, 82, 42)]),
    cluster('reactor-maintenance', [floor('tool-chest', 1064, 84, 88), wall('valves', 1000, 260, 82, 154), wall('warning-sign', 502, 274, 78, 58)]),
    cluster('power-services', [wall('vent', 660, 202, 190, 34), wall('lamp', 900, 194, 94, 15), wall('cable-run', 164, 422, 210, 26)])]),
  'life-support': profile('air-treatment-and-filtration', '#8da893', [
    cluster('air-storage', [floor('cylinder', 166, 32, 116), floor('cylinder', 220, 32, 116), floor('filter-stack', 310, 108, 123)]),
    cluster('air-treatment-services', [wall('valves', 166, 266, 88, 136), wall('filter-panel', 624, 292, 130, 112), floor('tool-chest', 660, 84, 82)]),
    cluster('ventilation', [wall('vent', 806, 202, 244, 36), wall('lamp', 534, 196, 88, 15), wall('hose-reel', 1064, 352, 72, 74)])]),
  'sensor-array': profile('array-calibration-and-signal-analysis', '#83a6b1', [
    cluster('signal-equipment', [floor('radio-rack', 168, 82, 155), floor('case', 284, 88, 42), floor('chair', 1030, 42, 74)]),
    cluster('array-calibration', [floor('tool-chest', 1090, 60, 86), wall('chronometers', 374, 270, 182, 50), wall('document-rack', 1010, 292, 130, 87)]),
    cluster('signal-routing', [wall('cable-run', 450, 338, 144, 24), wall('vent', 842, 202, 194, 34), wall('lamp', 550, 196, 88, 15)])]),
  'arrival-airlock': profile('boarding-and-contamination-check', '#91acae', [
    cluster('arrival-storage', [floor('locker', 172, 82, 154), floor('bench', 292, 110, 59), floor('bin', 1660, 40, 66)]),
    cluster('decontamination-supplies', [floor('medical-cart', 1290, 92, 86), floor('cylinder', 1440, 32, 112), wall('medical-sign', 1560, 310, 48, 52)]),
    cluster('airlock-controls', [wall('valves', 678, 270, 84, 128), wall('vent', 1300, 218, 190, 34), wall('lamp', 496, 196, 96, 15)]),
    cluster('returning-crew-equipment', [floor('bench', 676, 122, 60), floor('locker', 1494, 78, 141), wall('medical-sign', 1218, 300, 48, 52)])]),
  logistics: profile('freight-classification-and-handling', '#aca07e', [
    cluster('freight-packing', [floor('cargo-rack', 180, 174, 147), floor('case', 404, 82, 48), floor('case', 512, 94, 44)]),
    cluster('loading-supplies', [floor('cable-spool', 1180, 62, 65), floor('parts-bin', 1690, 110, 96), wall('document-rack', 1330, 306, 156, 86)]),
    cluster('freight-wall', [wall('vent', 210, 210, 198, 34), wall('lamp', 564, 196, 94, 15), wall('lamp', 1530, 196, 94, 15)])]),
  'mire-archives': profile('physical-records-and-evidence-catalogue', '#84a7ad', [
    cluster('archive-shelves', [floor('archive-rack', 170, 138, 156), floor('archive-rack', 1260, 140, 156), floor('archive-rack', 1450, 140, 156)]),
    cluster('evidence-handling', [floor('chart-cart', 1640, 92, 69), floor('case', 1770, 64, 42), wall('document-rack', 1274, 292, 284, 90)]),
    cluster('archive-services', [wall('vent', 310, 218, 174, 34), wall('lamp', 550, 196, 96, 15), wall('clock', 1710, 318, 36, 36)]),
    cluster('evidence-reference', [wall('document-rack', 680, 268, 238, 106), floor('case', 680, 62, 43), wall('shelf', 1630, 230, 134, 58)])]),
  'synthetic-bay': profile('synthetic-maintenance-and-components', '#91aaaa', [
    cluster('synthetic-components', [floor('equipment-rack', 174, 92, 151), floor('parts-bin', 310, 124, 95), floor('tool-chest', 488, 100, 90)]),
    cluster('repair-services', [wall('tool-board', 180, 270, 234, 131), floor('cylinder', 1720, 32, 112), wall('capsule-readout', 1690, 320, 132, 60)]),
    cluster('diagnostic-room-services', [wall('vent', 1370, 212, 194, 34), wall('lamp', 570, 196, 92, 15), wall('lamp', 1610, 196, 92, 15)]),
    cluster('diagnostic-spares', [floor('parts-bin', 614, 86, 87), wall('tool-board', 584, 274, 178, 124), floor('cylinder', 1760, 30, 106)])]),
  cctv: profile('security-watch-and-recording', '#83a895', [
    cluster('security-equipment', [floor('radio-rack', 170, 84, 153), floor('locker', 302, 70, 148), floor('chair', 470, 42, 74)]),
    cluster('recording-storage', [floor('archive-rack', 1660, 120, 153), wall('chronometers', 172, 252, 188, 50), wall('document-rack', 1654, 300, 168, 92)]),
    cluster('watch-services', [wall('handset', 540, 334, 24, 68), wall('lamp', 600, 196, 92, 15), wall('vent', 1330, 212, 198, 34)]),
    cluster('security-records', [wall('chronometers', 534, 264, 172, 50), floor('archive-rack', 606, 96, 153), wall('document-rack', 1684, 224, 130, 50)])]),
  'proving-ground': profile('range-safety-and-exercise-equipment', '#a7a17d', [
    cluster('safety-equipment', [floor('equipment-rack', 170, 82, 145), floor('case', 292, 82, 46), floor('bench', 1260, 138, 57)]),
    cluster('range-supplies', [floor('parts-bin', 1480, 110, 93), floor('case', 1660, 90, 46), wall('document-rack', 1280, 288, 160, 92)]),
    cluster('range-services', [wall('warning-sign', 174, 274, 80, 58), wall('vent', 1510, 208, 198, 34), wall('lamp', 596, 196, 90, 15)]),
    cluster('range-protection-stock', [floor('locker', 640, 68, 132), wall('warning-sign', 1460, 274, 78, 58), wall('tool-board', 1260, 402, 180, 92)])]),
  morgue: profile('forensics-and-cold-storage', '#91aaa7', [
    cluster('forensic-supplies', [floor('medical-cabinet', 172, 80, 152), floor('medical-cart', 1260, 92, 87), floor('bin', 1400, 38, 64)]),
    cluster('cold-storage', [floor('cold-storage', 1500, 162, 147), floor('cylinder', 1740, 32, 112), wall('sample-shelf', 1280, 316, 174, 83)]),
    cluster('forensic-services', [wall('medical-sign', 180, 276, 48, 52), wall('lamp', 552, 196, 92, 15), wall('vent', 1430, 208, 212, 34)])]),
  'escape-pods': profile('emergency-evacuation-supplies', '#aaa180', [
    cluster('evacuation-equipment', [floor('equipment-rack', 172, 92, 154), floor('case', 314, 86, 47), floor('case', 454, 84, 44)]),
    cluster('survival-storage', [floor('locker', 1660, 78, 147), floor('cylinder', 1784, 32, 112), wall('document-rack', 1680, 284, 146, 96)]),
    cluster('emergency-services', [wall('warning-sign', 176, 284, 76, 58), wall('vent', 1330, 212, 190, 34), wall('lamp', 562, 196, 92, 15)]),
    cluster('evacuation-checklist', [floor('locker', 604, 84, 147), wall('document-rack', 594, 274, 164, 108), wall('medical-sign', 1760, 224, 48, 50)])]),
  durandal: profile('computing-and-core-maintenance', '#91a0b1', [
    cluster('core-services', [floor('server-rack', 170, 92, 159), floor('server-rack', 300, 92, 159), floor('case', 452, 88, 45)]),
    cluster('cooling-maintenance', [floor('filter-stack', 1680, 100, 121), wall('cable-run', 174, 332, 216, 28), wall('valves', 1730, 300, 80, 114)]),
    cluster('computer-room-services', [wall('vent', 1260, 212, 236, 34), wall('lamp', 554, 196, 94, 15), wall('lamp', 1580, 196, 94, 15)]),
    cluster('processing-and-cooling-spares', [floor('server-rack', 608, 88, 153), wall('filter-panel', 592, 272, 140, 116), wall('cable-run', 1720, 210, 80, 28)])]),
  bioforge: profile('biological-entry-and-specimen-preparation', '#a0aa80', [
    cluster('entry-preparation', [floor('medical-cabinet', 170, 82, 152), floor('medical-cart', 1260, 94, 87), floor('bin', 1406, 40, 64)]),
    cluster('biological-storage', [floor('sample-fridge', 1510, 90, 151), wall('specimen-cabinet', 1660, 286, 96, 160), floor('cylinder', 1790, 30, 111)]),
    cluster('biological-services', [wall('medical-sign', 180, 278, 48, 52), wall('vent', 1380, 212, 194, 34), wall('lamp', 564, 196, 92, 15)]),
    cluster('biological-staging', [floor('medical-cabinet', 670, 76, 147), wall('specimen-cabinet', 1280, 260, 88, 160), wall('medical-sign', 1620, 222, 48, 50)])]),
  'animal-care': profile('animal-food-and-habitat-care', '#94a582', [
    cluster('feed-preparation', [floor('galley', 168, 188, 104), floor('bin', 402, 40, 64), floor('parts-bin', 498, 94, 86)]),
    cluster('habitat-supplies', [wall('shelf', 184, 326, 160, 76), floor('locker', 1210, 74, 142), floor('case', 1350, 78, 44)]),
    cluster('animal-care-services', [wall('vent', 1130, 214, 194, 34), wall('lamp', 618, 196, 92, 15), wall('clock', 1370, 304, 36, 36)]),
    cluster('habitat-hygiene-storage', [wall('medical-cabinet', 638, 292, 78, 150), wall('shelf', 816, 340, 156, 72), wall('hose-reel', 1430, 262, 70, 74)])]),
  'frontier-civil-counter': profile('port-registration-and-waiting', '#ada184', [
    cluster('port-reception', [floor('bench', 170, 140, 58), floor('bin', 360, 40, 60), wall('document-rack', 174, 302, 146, 96)]),
    cluster('civilian-waiting', [floor('bench', 940, 150, 60), floor('drink-dispenser', 1170, 66, 132), floor('case', 1290, 84, 44)]),
    cluster('east-shelter-services', [floor('locker', 2010, 78, 146), floor('bench', 2150, 144, 59), wall('shelf', 2030, 332, 188, 62), wall('vent', 1070, 212, 194, 34), wall('lamp', 760, 196, 94, 15)])]),
  'personal-refuge': profile('private-rest-and-personal-effects', '#98aa99', [
    cluster('private-storage', [floor('locker', 150, 72, 142), floor('case', 274, 76, 44), wall('shelf', 168, 350, 174, 68)]),
    cluster('rest-area', [floor('bench', 1210, 144, 58), floor('drink-dispenser', 1430, 62, 130), floor('bin', 1520, 38, 59)]),
    cluster('refuge-services', [wall('clock', 1280, 352, 36, 36), wall('vent', 710, 342, 150, 34), wall('lamp', 1250, 334, 70, 15)]),
    cluster('personal-stories', [wall('document-rack', 540, 346, 156, 78), floor('stool', 722, 42, 53), wall('shelf', 1230, 400, 166, 66)])])
});

export function resolveHubRoomDressingV134(room, { doors = [], ladders = [] } = {}) {
  const definition = HUB_ROOM_DRESSING_V134[room?.id];
  if (!definition) return null;
  const start = finite(room.xStart), width = finite(room.profile?.worldWidth || room.world?.width, 1280), floorY = finite(room.world?.floorY, 624);
  const local = bounds => ({ ...bounds, x: bounds.x - start });
  const expanded = (bounds, margin = 20) => ({ x: bounds.x - margin, y: bounds.y - margin, w: bounds.w + margin * 2, h: bounds.h + margin * 2 });
  const reserve = [expanded({ x: width / 2 - 130, y: room.id === 'personal-refuge' ? 336 : 190, w: 260, h: 40 }, 4)];
  if (room.propRenderBounds) reserve.push(expanded(local(room.propRenderBounds), 18));
  if (room.station?.bounds) reserve.push(expanded(room.station.bounds, 22));
  if (room.viewport) reserve.push(expanded(local(room.viewport), 4));
  for (const door of doors) if (door.x >= start - 100 && door.x <= start + width + 100)
    reserve.push({ x: door.x - start - (door.lift ? 78 : 112), y: 390, w: door.lift ? 156 : 224, h: floorY - 370 });
  for (const annex of HUB_ANNEXES_V87.filter(entry => entry.parentRoomId === room.id)) {
    const authored = HUB_ANNEX_ENTRANCES_V133[annex.id];
    const bounds = annex.parentDoorBounds ? local(annex.parentDoorBounds) : authored && {
      x: authored.centerX - annex.entrance.w / 2, y: authored.bottom - annex.entrance.h, w: annex.entrance.w, h: annex.entrance.h
    };
    if (bounds) reserve.push(expanded(bounds, 24));
  }
  if (room.entrance) reserve.push(expanded({ ...room.entrance, x: room.entranceLocalX - room.entrance.w / 2 }, 24));
  for (const prop of room.props || []) if (prop.asset) reserve.push(expanded(prop, 14));
  for (const ladder of ladders) {
    const x = ladder.x - start, w = finite(ladder.w, 44);
    if (x >= 0 && x <= width) reserve.push({ x: x - 14, y: finite(ladder.top, 360), w: w + 28, h: finite(ladder.bottom, floorY) - finite(ladder.top, 360) });
  }
  const items = definition.items.map(entry => ({ ...entry, y: entry.y + floorY - 624 }))
    .filter(entry => entry.x >= 128 && entry.x + entry.w <= width - 128 && !reserve.some(bounds => overlap(entry, bounds)))
    .map(entry => ({ ...entry, x: entry.x + start }));
  return { ...definition, items, start, width, floorY, top: room.id === 'personal-refuge' ? 334 : 186, reserved: reserve };
}

/** A ship nameplate replaces the old oversized generic diagnostic screen.
 * The room's physical equipment now describes its purpose at human scale. */
export function drawHubRoomPlaqueV134(ctx, room, { top } = {}) {
  const composition = HUB_AUTHORED_COMPOSITIONS_V133[room?.id];
  if (!ctx || !composition) return false;
  const width = finite(room.profile?.worldWidth || room.world?.width, 1280), start = finite(room.xStart);
  const bounds = { x: start + width / 2 - 130, y: finite(top, room.id === 'personal-refuge' ? 336 : 190), w: 260, h: 40 };
  ctx.save();ctx.fillStyle='#203537';ctx.fillRect(bounds.x,bounds.y,bounds.w,bounds.h);
  ctx.fillStyle='#59706e';ctx.fillRect(bounds.x,bounds.y,bounds.w,2);ctx.fillStyle='#0f2226';ctx.fillRect(bounds.x,bounds.y+37,bounds.w,3);
  ctx.fillStyle=composition.accent;ctx.font='bold 12px monospace';ctx.textAlign='left';ctx.fillText(composition.title,bounds.x+12,bounds.y+16,236);
  ctx.fillStyle='#9bac9f';ctx.font='9px monospace';ctx.fillText(composition.purpose,bounds.x+12,bounds.y+30,236);
  ctx.fillStyle='#758784';for(const x of [bounds.x+4,bounds.x+bounds.w-6])for(const y of [bounds.y+5,bounds.y+32])ctx.fillRect(x,y,2,2);
  ctx.restore();return { roomId: room.id, bounds };
}

function path(ctx, points, fill) {
  ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } else ctx.stroke();
}
function body(ctx, w, h, color = '#34494b', depth = 7) {
  // A shallow top and side join the orthographic facade. They project only
  // into the rear service lane, never across the human silhouette.
  path(ctx, [[0, depth], [depth, 0], [w, 0], [w - depth, depth]], '#536265');
  ctx.fillStyle = color; ctx.fillRect(0, depth, w - depth, h - depth);
  path(ctx, [[w - depth, depth], [w, 0], [w, h - depth], [w - depth, h]], '#202f32');
  ctx.fillStyle = '#708080'; ctx.fillRect(2, depth + 1, w - depth - 3, 2);
  ctx.fillStyle = '#182629'; ctx.fillRect(3, h - 7, w - depth - 6, 7);
}
function slats(ctx, x, y, w, h, count = 6) {
  ctx.fillStyle = '#132226'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#465a5d';
  for (let n = 0; n < count; n++) ctx.fillRect(x + 3, y + 3 + n * (h - 6) / count, w - 6, 2);
}
function tinyLight(ctx, x, y, color) {ctx.fillStyle = color; ctx.fillRect(x, y, 3, 3);}
function drawers(ctx, w, h, count = 3, color) {
  body(ctx, w, h); const available = h - 27;
  for (let n = 0; n < count; n++) {
    const y = 14 + n * available / count;
    ctx.fillStyle = '#22373a';ctx.fillRect(8, y, w - 24, available / count - 5);
    ctx.fillStyle = '#69797a';ctx.fillRect(w * .34, y + 5, w * .25, 3);
  }
  tinyLight(ctx, w - 22, 12, color);
}
function bottles(ctx, x, y, width, count = 5) {
  for (let n = 0; n < count; n++) {
    const bx = x + n * width / count, height = n % 2 ? 16 : 22;
    ctx.fillStyle = n % 3 ? '#82928a' : '#668b91';ctx.fillRect(bx, y - height, 7, height);
    ctx.fillStyle = '#c1c6ad';ctx.fillRect(bx + 2, y - height - 3, 3, 3);
    ctx.fillStyle = '#465b5c';ctx.fillRect(bx + 2, y - height + 7, 4, 3);
  }
}

function drawEquipment(ctx, entry, accent) {
  const { kind, w, h } = entry;
  if (['locker', 'medical-cabinet', 'equipment-rack', 'radio-rack', 'electrical-cabinet', 'server-rack', 'sample-fridge', 'cold-storage'].includes(kind)) {
    body(ctx, w, h, kind === 'medical-cabinet' ? '#495c5a' : '#304448');
    ctx.fillStyle = '#223437';ctx.fillRect(9, 16, w - 27, h - 32);
    ctx.strokeStyle = '#536c6d';ctx.lineWidth = 1;ctx.strokeRect(9.5, 16.5, w - 28, h - 33);
    if (kind === 'locker' || kind === 'sample-fridge') {
      ctx.fillStyle = '#82918e';ctx.fillRect(w - 26, h * .42, 3, 13);slats(ctx, 16, 26, w - 40, 18, 3);
    } else if (['radio-rack', 'server-rack', 'electrical-cabinet'].includes(kind)) {
      for (let n = 0; n < 6; n++) {const y = 21 + n * (h - 45) / 6;slats(ctx, 14, y, w - 38, 14, 2);tinyLight(ctx, w - 20, y + 5, n % 3 ? accent : '#ad9760');}
    } else if (kind === 'equipment-rack') {
      for (let n = 0; n < 3; n++) {const y = 28 + n * (h - 48) / 3;ctx.fillStyle='#72817b';ctx.fillRect(17,y,w-42,15);ctx.fillStyle='#b0a175';ctx.fillRect(22,y+3,12,8);}
    } else if (kind === 'cold-storage') {
      for (let n = 0; n < 3; n++) {const y = 20 + n * (h - 34) / 3;ctx.fillStyle='#566b6b';ctx.fillRect(12,y,w-33,(h-38)/3-6);ctx.fillStyle='#81918c';ctx.fillRect(w*.43,y+8,w*.18,3);}
    } else {slats(ctx, 16, h - 42, w - 40, 24, 4);tinyLight(ctx, w - 24, 27, accent);}
  } else if (['tool-chest', 'parts-bin', 'case', 'chart-cart'].includes(kind)) {
    drawers(ctx, w, h, kind === 'case' ? 1 : 3, accent);
    if (kind === 'chart-cart') {ctx.fillStyle='#a1a897';ctx.fillRect(9,5,w-27,6);ctx.fillStyle='#738784';ctx.fillRect(18,7,25,2);}
    if (kind !== 'case') for (const x of [8, w - 21]) {ctx.fillStyle='#0e1d20';ctx.fillRect(x,h-4,10,4);}
  } else if (['bench', 'chair', 'stool'].includes(kind)) {
    const seatY = kind === 'chair' ? h * .5 : 10;
    ctx.fillStyle = '#3f5555';ctx.fillRect(2,seatY,w-4,11);ctx.fillStyle='#77837a';ctx.fillRect(3,seatY,w-6,3);
    ctx.fillStyle='#23393d';for(const x of [7,w-14])ctx.fillRect(x,seatY+11,7,h-seatY-11);
    if(kind==='chair'){body(ctx,w-8,Math.max(20,seatY-4),'#33484c',5);ctx.fillStyle='#24373a';ctx.fillRect(w-8,0,4,seatY);}
  } else if (['medical-cart', 'lab-bench', 'galley'].includes(kind)) {
    const top = kind === 'medical-cart' ? 18 : 30;
    ctx.fillStyle='#607271';ctx.fillRect(0,top,w,8);ctx.fillStyle='#8c9890';ctx.fillRect(0,top,w,2);
    ctx.fillStyle='#30494b';ctx.fillRect(5,top+8,w-15,h-top-16);
    ctx.fillStyle='#192f32';ctx.fillRect(12,top+16,w-30,Math.max(12,h-top-38));
    for(const x of [8,w-18]){ctx.fillStyle='#193033';ctx.fillRect(x,h-8,8,8);}
    if(kind==='galley'){ctx.fillStyle='#101f21';ctx.fillRect(12,top+5,45,14);ctx.fillStyle='#526966';ctx.fillRect(18,top+8,33,8);ctx.strokeStyle='#82938a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(45,top-3,12,Math.PI,0);ctx.stroke();}
    else if(kind==='lab-bench'){bottles(ctx,w*.50,top,w*.43,6);ctx.fillStyle='#2b4246';ctx.fillRect(15,2,19,top-2);ctx.fillStyle='#6d9093';ctx.fillRect(19,6,12,10);}
    else {bottles(ctx,12,top,w-25,5);ctx.fillStyle='#567575';ctx.fillRect(12,top+22,w-36,3);}
  } else if (['archive-rack', 'cargo-rack', 'filter-stack', 'drink-dispenser'].includes(kind)) {
    body(ctx,w,h,'#2e4448');
    if(kind==='drink-dispenser'){ctx.fillStyle='#13292c';ctx.fillRect(10,17,w-30,h*.42);tinyLight(ctx,w-22,26,accent);ctx.fillStyle='#738983';ctx.fillRect(14,h*.62,w-34,14);ctx.fillStyle='#15282b';ctx.fillRect(18,h*.63,w-42,11);}
    else for(let n=0;n<4;n++){const y=15+n*(h-26)/4;ctx.fillStyle='#13272b';ctx.fillRect(10,y,w-30,(h-36)/4);
      if(kind==='archive-rack')for(let z=0;z<5;z++){ctx.fillStyle=z%2?'#74857c':'#9c9274';ctx.fillRect(14+z*(w-37)/5,y+4,(w-46)/5,(h-52)/4);}
      else {ctx.fillStyle='#65766d';ctx.fillRect(16,y+4,w-43,(h-48)/4);ctx.fillStyle='#b0a17b';ctx.fillRect(24,y+9,12,3);}}
  } else if (kind === 'cylinder') {
    ctx.fillStyle='#1b2e31';ctx.fillRect(w*.35,0,w*.3,8);ctx.fillStyle='#6c8583';ctx.beginPath();ctx.ellipse(w*.46,12,w*.4,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4a6668';ctx.fillRect(w*.06,12,w*.80,h-20);ctx.fillStyle='#849b95';ctx.fillRect(w*.18,15,w*.16,h-29);
    ctx.fillStyle='#a99d74';ctx.fillRect(w*.06,h*.58,w*.80,8);ctx.fillStyle='#223a3d';ctx.fillRect(0,h-8,w,8);
  } else if (kind === 'bin') {
    body(ctx,w,h,'#4c5d54',4);ctx.fillStyle='#6e7e71';ctx.fillRect(0,5,w,6);ctx.fillStyle='#263c35';ctx.fillRect(8,h*.42,w-22,16);
  } else if (kind === 'cable-spool' || kind === 'hose-reel') {
    const cx=w/2,cy=h/2,r=Math.min(w,h)/2-4;
    ctx.fillStyle='#1c3033';ctx.fillRect(cx-6,kind==='hose-reel'?0:cy,12,h-cy);
    ctx.fillStyle='#586f6d';ctx.beginPath();ctx.ellipse(cx,cy,r,r,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#233b3f';ctx.lineWidth=5;for(const factor of [.35,.6,.84]){ctx.beginPath();ctx.arc(cx,cy,r*factor,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#84978f';ctx.fillRect(cx-4,cy-4,8,8);
  } else if (kind === 'vent' || kind === 'filter-panel') {
    body(ctx,w,h,'#354b4f',4);slats(ctx,8,9,w-23,h-17,kind==='vent'?4:9);
  } else if (kind === 'lamp') {
    ctx.fillStyle='#33494c';ctx.fillRect(0,0,w,h);ctx.fillStyle='#8fada0';ctx.fillRect(7,5,w-14,3);ctx.fillStyle='#425b59';ctx.fillRect(7,9,w-14,2);
  } else if (kind === 'clock' || kind === 'chronometers') {
    body(ctx,w,h,'#31474b',4);const count=kind==='clock'?1:3;
    for(let n=0;n<count;n++){const cx=(n+.5)*(w-8)/count,cy=h/2,r=Math.min((w-8)/count*.32,h*.32);ctx.fillStyle='#a6b1a0';ctx.beginPath();ctx.ellipse(cx,cy,r,r,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#324c50';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy-r*.65);ctx.lineTo(cx,cy);ctx.lineTo(cx+r*.50,cy);ctx.stroke();}
  } else if (['shelf','sample-shelf','document-rack','specimen-cabinet'].includes(kind)) {
    body(ctx,w,h,'#30484b',5);const rows=kind==='document-rack'?3:2;
    for(let n=0;n<rows;n++){const y=12+n*(h-17)/rows;ctx.fillStyle='#182f32';ctx.fillRect(8,y,w-24,(h-28)/rows);ctx.fillStyle='#71847d';ctx.fillRect(8,y+(h-28)/rows,w-24,3);
      if(kind==='sample-shelf')bottles(ctx,14,y+(h-28)/rows-1,w-28,Math.max(4,Math.floor(w/20)));
      else if(kind==='specimen-cabinet'){for(let z=0;z<2;z++){ctx.fillStyle='#466969';ctx.fillRect(14+z*(w-30)/2,y+6,(w-42)/2,(h-45)/rows);ctx.fillStyle='#839b82';ctx.fillRect(20+z*(w-30)/2,y+11,5,7);}}
      else {for(let z=0;z<4;z++){ctx.fillStyle=z%2?'#9d9c82':'#607e80';ctx.fillRect(14+z*(w-32)/4,y+5,(w-44)/4,(h-47)/rows);}}
    }
  } else if (kind === 'tool-board') {
    body(ctx,w,h,'#364b4c',5);ctx.fillStyle='#22383b';ctx.fillRect(9,11,w-24,h-23);
    for(let n=0;n<6;n++){const x=18+n*(w-43)/6,y=20+(n%2)*12;ctx.fillStyle='#8b9585';ctx.fillRect(x,y,4,h*.43);ctx.fillRect(x-3,y+2,10,8);ctx.fillStyle='#ae9d74';ctx.fillRect(x-2,y+h*.42,8,13);}
    ctx.fillStyle='#667b72';ctx.fillRect(15,h-26,w-40,7);
  } else if (kind === 'valves' || kind === 'cable-run') {
    ctx.strokeStyle='#344c50';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(4,kind==='cable-run'?h/2:0);ctx.lineTo(4,h-10);ctx.lineTo(w-7,h-10);ctx.lineTo(w-7,kind==='cable-run'?h/2:0);ctx.stroke();
    ctx.strokeStyle='#81938a';ctx.lineWidth=3;
    for(const x of [4,w-7]){ctx.beginPath();ctx.arc(x,h*.40,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x-9,h*.40);ctx.lineTo(x+9,h*.40);ctx.stroke();}
  } else if (kind === 'handset') {
    body(ctx,w,h,'#3b5455',4);ctx.fillStyle='#a0aea0';ctx.fillRect(6,13,6,h-30);ctx.fillStyle='#253e41';ctx.fillRect(4,10,10,10);ctx.fillRect(4,h-23,10,10);
  } else if (kind === 'capsule-readout') {
    body(ctx,w,h,'#344c4e',5);ctx.fillStyle='#122a2f';ctx.fillRect(10,12,w-26,h-24);ctx.strokeStyle=accent;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(17,h*.58);for(let n=1;n<9;n++)ctx.lineTo(17+n*(w-40)/8,h*(n%3===0?.32:.58));ctx.stroke();
  } else if (kind === 'medical-sign' || kind === 'warning-sign') {
    body(ctx,w,h,'#3a5050',4);ctx.fillStyle=kind==='medical-sign'?'#a1bbae':'#a99d72';
    if(kind==='medical-sign'){ctx.fillRect(w*.42,h*.23,w*.15,h*.52);ctx.fillRect(w*.23,h*.41,w*.53,h*.16);}
    else {path(ctx,[[w*.22,h*.75],[w*.48,h*.20],[w*.77,h*.75]],'#a99d72');ctx.fillStyle='#2a3e3d';ctx.fillRect(w*.46,h*.39,4,h*.20);ctx.fillRect(w*.46,h*.65,4,4);}
  }
}

export function drawHubRoomDressingV134(ctx, room, { images = new Map(), resolveDrawable = resolveSpriteDrawableV134, doors, ladders } = {}) {
  const composition = resolveHubRoomDressingV134(room, { doors, ladders });
  if (!ctx || !composition) return false;
  ctx.save();ctx.beginPath();ctx.rect(composition.start + 112, composition.top, composition.width - 224, composition.floorY - composition.top - 4);ctx.clip();
  const rendered = [];
  for (const entry of composition.items) {
    const image = entry.asset && images.get(entry.asset);
    if (entry.kind === 'bitmap') {
      if (!(image?.complete && image.naturalWidth > 0)) continue;
      ctx.drawImage(resolveDrawable(image), entry.x, entry.y, entry.w, entry.h);
      rendered.push(entry);
      continue;
    }
    ctx.save();ctx.translate(entry.x, entry.y);
    if (entry.support === 'rear-floor') {
      ctx.fillStyle='rgba(3,12,14,.44)';ctx.beginPath();ctx.ellipse(entry.w/2,entry.h-1,entry.w*.58,3,0,0,Math.PI*2);ctx.fill();
    }
    drawEquipment(ctx, entry, composition.accent);ctx.restore();
    rendered.push(entry);
  }
  ctx.restore();return { roomId: room.id, items: rendered.map(entry => ({ kind: entry.kind, role: entry.role, plane: entry.plane,
    bounds: { x: entry.x, y: entry.y, w: entry.w, h: entry.h }, anchor: { x: entry.x + entry.w / 2, y: entry.y + entry.h, support: entry.support },
    material: entry.asset ? 'native-bitmap' : 'authored-steel-and-supplies', source: entry.asset || 'original-canvas-equipment',
    collidable: entry.collidable, interactive: entry.interactive })) };
}

export function withHubRoomDressingV134(Base) {
  if (Base.hubRoomDressingV134) return Base;
  return class HubRoomDressingV134 extends Base {
    static hubRoomDressingV134 = true;
    drawHubRoomPurposeV133(ctx, room, options) {
      if (this.editorPlaytest) return super.drawHubRoomPurposeV133(ctx, room, options);
      this.roomPlaquesRenderedV134 ||= new Map();
      const result = drawHubRoomPlaqueV134(ctx, room, options);
      if (result) this.roomPlaquesRenderedV134.set(room.id, result);
      return result;
    }
    drawRoomModule(ctx, room, farImage) {
      const result = super.drawRoomModule(ctx, room, farImage);
      if (!this.editorPlaytest) {
        this.roomDressingRenderedV134 ||= new Map();
        this.roomDressingRenderedV134.set(room.id, drawHubRoomDressingV134(ctx, room,
          { images: this.propImages, doors: this.doorStates, ladders: this.v51Ladders }));
      }
      return result;
    }
    drawAnnexGeometryV71(ctx, annex) {
      const result = super.drawAnnexGeometryV71(ctx, annex);
      if (!this.editorPlaytest) {
        this.roomDressingRenderedV134 ||= new Map();
        this.roomDressingRenderedV134.set(annex.id, drawHubRoomDressingV134(ctx, { ...annex, xStart: 0 },
          { images: this.propImages, ladders: annex.ladders }));
      }
      return result;
    }
    getSnapshot() {
      return { ...super.getSnapshot(), hubRoomDressingV134: { active: !this.editorPlaytest, rooms: Object.keys(HUB_ROOM_DRESSING_V134).length,
        plane: 'rear-service-plane', interactive: false, collidable: false, sourceStatus: 'existing-transparent-native-props-and-original-equipment',
        rendered: this.editorPlaytest ? [] : structuredClone([...this.roomDressingRenderedV134?.values() || []].filter(Boolean)),
        plaques: this.editorPlaytest ? [] : structuredClone([...this.roomPlaquesRenderedV134?.values() || []]) } };
    }
  };
}
