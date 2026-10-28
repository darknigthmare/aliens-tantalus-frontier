import { getHubRoomProjectionV139 } from './hub-room-projection-v139.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const valid = box => box && [box.x, box.y, box.w, box.h].every(Number.isFinite) && box.w > 0 && box.h > 0;
const intersect = (a, b) => {
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.w, b.x + b.w), bottom = Math.min(a.y + a.h, b.y + b.h);
  return right > x && bottom > y ? { x, y, w: right - x, h: bottom - y } : null;
};
const profile = (purpose, lining, pitch, datum, light, service, policy = 'compartment-wall') => ({
  purpose, lining, pitch, datum, light, service, policy,
  layer: 'rear-shell', mount: 'architectural-wall-and-ceiling',
  collidable: false, interactive: false, countedAsProp: false
});

/** Every profile belongs to an actual compartment. These are architectural
 * lining, joint and light schedules, not loose objects or another level map.
 * Native room art is still cropped and repeated isotropically by V134/V138. */
export const HUB_ROOM_BACKGROUNDS_V168 = freeze({
  bridge: profile('night-navigation-watch', 'observation', 256, .58, '#9bb7bc', 'signal', 'preserve-native-envelope'),
  briefing: profile('speech-intelligibility-and-planning', 'acoustic', 224, .62, '#c2b89a', 'signal'),
  'combat-information': profile('screen-legibility-and-radio-watch', 'signal', 192, .57, '#92b2aa', 'signal'),
  'cryo-bay': profile('sealed-insulated-stasis-bays', 'insulated', 240, .74, '#a5c2c8', 'coolant'),
  'crew-quarters': profile('quiet-berth-lining', 'habitat', 208, .66, '#c5b394', 'air'),
  mess: profile('washable-shared-dining-lining', 'habitat', 256, .61, '#d0bb8c', 'air'),
  medical: profile('sealed-clean-treatment-surfaces', 'sealed', 192, .74, '#b6cbbf', 'clean-air'),
  'science-lab': profile('clean-analysis-workflow', 'sealed', 208, .67, '#a9c3c6', 'clean-air'),
  quarantine: profile('pressure-boundary-and-isolation', 'containment', 192, .72, '#bdc39b', 'extract'),
  armory: profile('secured-issue-and-safe-maintenance', 'secured', 224, .67, '#bbb18d', 'power'),
  workshop: profile('repair-bench-service-distribution', 'service', 240, .59, '#bdb293', 'power'),
  'vehicle-bay': profile('wide-vehicle-inspection-bays', 'reinforced', 320, .76, '#b8bea3', 'hydraulic'),
  'dropship-hangar': profile('flight-clearance-and-aircraft-envelope', 'observation', 320, .66, '#b4bdac', 'flight', 'preserve-native-envelope'),
  reactor: profile('heat-and-power-service-enclosure', 'thermal', 256, .63, '#c4b88b', 'power'),
  'life-support': profile('airflow-and-filter-service', 'plenum', 224, .72, '#a4bfad', 'air'),
  'sensor-array': profile('low-noise-signal-equipment', 'signal', 208, .56, '#9bb9c7', 'signal'),
  'arrival-airlock': profile('wash-down-and-pressure-boundary', 'containment', 256, .73, '#b3c4be', 'clean-air'),
  logistics: profile('reinforced-freight-handling-bays', 'reinforced', 320, .69, '#c1b393', 'freight'),
  'mire-archives': profile('conditioned-evidence-storage', 'archive', 176, .64, '#afc3bc', 'air'),
  'synthetic-bay': profile('clean-repair-and-diagnostic-distribution', 'sealed', 224, .69, '#b3c8c1', 'power'),
  cctv: profile('dim-camera-review-and-recording', 'acoustic', 192, .58, '#9cb49f', 'signal'),
  'proving-ground': profile('range-visibility-and-control-lines', 'secured', 288, .67, '#bdba96', 'power', 'preserve-native-envelope'),
  morgue: profile('washable-cold-forensic-enclosure', 'sealed', 208, .76, '#abc1bb', 'coolant'),
  'escape-pods': profile('protected-launch-service-bays', 'reinforced', 256, .71, '#cab995', 'emergency'),
  durandal: profile('cooled-computation-service-aisles', 'archive', 160, .61, '#adb9ce', 'coolant'),
  bioforge: profile('sealed-biological-access-lining', 'containment', 208, .72, '#b0c19c', 'extract'),
  'animal-care': profile('washable-low-stimulus-habitat', 'habitat', 240, .69, '#b6bfa1', 'clean-air'),
  'frontier-civil-counter': profile('welcoming-legible-civil-reception', 'habitat', 288, .60, '#c9b99e', 'signal'),
  'personal-refuge': profile('quiet-private-lining-and-authored-glass', 'habitat', 256, .67, '#b5bca5', 'air', 'preserve-authored-apertures'),
  'flight-control-cockpit': profile('pilot-low-glare-observation', 'observation', 224, .62, '#a3c0c9', 'flight', 'preserve-native-envelope'),
  'galley-service': profile('washable-food-preparation', 'wet', 192, .68, '#c9b995', 'water'),
  'sanitary-bay': profile('sealed-wet-service-lining', 'wet', 176, .75, '#b2c9c1', 'water'),
  'engine-room': profile('mechanical-heat-and-vibration-isolation', 'thermal', 288, .64, '#c4b78e', 'hydraulic'),
  'water-recycling': profile('washable-water-treatment-distribution', 'plenum', 208, .72, '#9fc2ba', 'water'),
  'maintenance-spine': profile('continuous-longitudinal-service-route', 'service', 256, .68, '#b4bda5', 'power')
});

const materials = freeze({
  observation: { wash: '#253640', edge: '#5d7780', dark: '#101f28' },
  acoustic: { wash: '#34403a', edge: '#849081', dark: '#1a2b29' },
  signal: { wash: '#203b40', edge: '#66868a', dark: '#11262b' },
  insulated: { wash: '#59696a', edge: '#a2b4ad', dark: '#354b4e' },
  habitat: { wash: '#514f40', edge: '#9b997c', dark: '#32382e' },
  sealed: { wash: '#647568', edge: '#b4c1b1', dark: '#3b514b' },
  containment: { wash: '#4e5c48', edge: '#a2ad8a', dark: '#293f35' },
  secured: { wash: '#4a5142', edge: '#8a947d', dark: '#24362f' },
  service: { wash: '#3f5048', edge: '#879580', dark: '#213a32' },
  reinforced: { wash: '#4a5140', edge: '#92977b', dark: '#25392f' },
  thermal: { wash: '#4e4935', edge: '#a59d78', dark: '#2b332a' },
  plenum: { wash: '#3f5a4c', edge: '#8ca99a', dark: '#233e36' },
  archive: { wash: '#304c47', edge: '#6f978c', dark: '#152e29' },
  wet: { wash: '#586c62', edge: '#a5b8aa', dark: '#344f48' }
});

function subtract(bounds, holes) {
  let pieces = [{ ...bounds }];
  for (const hole of holes) pieces = pieces.flatMap(piece => {
    const hit = intersect(piece, hole); if (!hit) return [piece];
    return [
      { x: piece.x, y: piece.y, w: piece.w, h: hit.y - piece.y },
      { x: piece.x, y: hit.y + hit.h, w: piece.w, h: piece.y + piece.h - hit.y - hit.h },
      { x: piece.x, y: hit.y, w: hit.x - piece.x, h: hit.h },
      { x: hit.x + hit.w, y: hit.y, w: piece.x + piece.w - hit.x - hit.w, h: hit.h }
    ].filter(valid);
  });
  return pieces;
}

export function getHubRoomBackgroundPlanV168(room, model, { shell = null } = {}) {
  const definition = HUB_ROOM_BACKGROUNDS_V168[room?.id];
  if (!definition || !valid(model?.bounds)) return null;
  const projection = getHubRoomProjectionV139(room), start = finite(room.xStart);
  const b = model.bounds, ceilingY = shell?.ceilingY ?? (room.id === 'personal-refuge' ? 334 : 186);
  const bottom = Math.min(b.y + b.h, finite(room.world?.floorY, 624) - 58);
  const wall = intersect(b, { x: start, y: ceilingY, w: model.roomWidth, h: Math.max(1, bottom - ceilingY) });
  const protectedEnvelope = definition.policy === 'preserve-native-envelope';
  // Flight glass and the authored target wall keep all native pixels below
  // their existing ceiling. Only the opaque upper service lintel is refined.
  const area = protectedEnvelope
    ? intersect(b, { x: start, y: b.y, w: model.roomWidth, h: Math.max(0, ceilingY - b.y) }) : wall;
  if (!area) return { schema: 168, roomId: room.id, ...definition, projection: projection.mode,
    regions: [], lights: [], datumY: null, drift: 0, structuralModules: 0 };
  const holes = shell?.apertures || [];
  const regions = subtract(area, holes);
  const drift = projection.mode === '2.5d' ? finite(model.layers?.find(layer => layer.id === definition.layer)?.drift) : 0;
  const lightWidth = Math.min(76, definition.pitch * .30);
  const lightY = protectedEnvelope ? area.y + Math.max(3, area.h - 9) : area.y + 5;
  const lights = [];
  for (let local = 44; local < model.roomWidth - 44; local += definition.pitch) {
    const rect = { x: start + local + drift, y: lightY, w: lightWidth, h: 3 };
    // Compare the edges directly. Subtracting two large translated world
    // coordinates to recover a fractional width can round differently and
    // incorrectly discard a perfectly contained fitting on another deck.
    if (regions.some(region => rect.x >= region.x && rect.y >= region.y
      && rect.x + rect.w <= region.x + region.w && rect.y + rect.h <= region.y + region.h)) lights.push(rect);
  }
  return { schema: 168, roomId: room.id, ...definition, projection: projection.mode,
    bounds: { ...area }, wallBounds: wall, material: materials[definition.lining], regions,
    pitch: definition.pitch, originX: start + drift,
    datumY: area.y + area.h * definition.datum, lights, drift,
    protectedNativeEnvelope: protectedEnvelope, aperturesPreserved: holes.length,
    structuralModules: Math.ceil(model.roomWidth / definition.pitch),
    sourceStatus: 'room-specific-authored-architectural-overlay', gameplayPlane: '2d',
    physicalCoordinatesChanged: false, nativeImageScalingChanged: false };
}

const rect = (ctx, plan, color, x, y, w, h) => {
  const bounds = { x, y, w, h };
  if (!valid(bounds)) return;
  ctx.fillStyle = color;
  // Keep the emitted paint geometry outside authored glass, independently
  // of Canvas clip state. The surrounding clip remains a second safeguard.
  for (const region of plan.regions) {
    const piece = intersect(bounds, region);
    if (piece) ctx.fillRect(piece.x, piece.y, piece.w, piece.h);
  }
};

function lining(ctx, plan) {
  const b = plan.bounds, p = plan.material, bayTop = b.y + 16, bayHeight = Math.min(84, b.h - 28);
  ctx.globalAlpha = .075; rect(ctx, plan, p.wash, b.x, b.y, b.w, b.h); ctx.globalAlpha = 1;
  if (plan.protectedNativeEnvelope) return;
  for (let x = plan.originX - plan.pitch; x < b.x + b.w; x += plan.pitch) {
    const left = x + 20, right = x + plan.pitch - 20, width = right - left;
    ctx.globalAlpha = .37;
    if (plan.lining === 'acoustic') {
      rect(ctx, plan, p.dark, left, bayTop, width, bayHeight);
      for (let row = 9; row < bayHeight - 5; row += 9) rect(ctx, plan, p.edge, left + 9, bayTop + row, width - 18, 1);
    } else if (plan.lining === 'wet' || plan.lining === 'sealed' || plan.lining === 'insulated') {
      ctx.strokeStyle = p.edge; ctx.lineWidth = 1;
      ctx.strokeRect(left, bayTop, width, bayHeight);
      if (plan.lining === 'wet') for (let row = 24; row < bayHeight; row += 24) rect(ctx, plan, p.edge, left, bayTop + row, width, 1);
      if (plan.lining === 'insulated') rect(ctx, plan, p.dark, left + 5, bayTop + 5, 3, bayHeight - 10);
    } else if (plan.lining === 'thermal') {
      rect(ctx, plan, p.dark, left, bayTop, width, bayHeight);
      for (let fin = 8; fin < width - 5; fin += 12) {
        rect(ctx, plan, p.edge, left + fin, bayTop + 5, 2, bayHeight - 10);
        rect(ctx, plan, p.wash, left + fin + 2, bayTop + 5, 3, bayHeight - 10);
      }
    } else if (plan.lining === 'plenum' || plan.lining === 'archive') {
      rect(ctx, plan, p.dark, left, bayTop, width, bayHeight);
      const rows = plan.lining === 'archive' ? 5 : 3;
      for (let row = 0; row < rows; row++) rect(ctx, plan, p.edge, left + 6, bayTop + 8 + row * (bayHeight - 16) / rows, width - 12, 2);
      if (plan.lining === 'archive') rect(ctx, plan, p.wash, left + width * .48, bayTop + 5, 5, bayHeight - 10);
    } else if (plan.lining === 'habitat') {
      rect(ctx, plan, p.dark, left, bayTop, width, bayHeight);
      rect(ctx, plan, p.edge, left + 2, bayTop + 2, width - 4, 1);
      rect(ctx, plan, p.edge, left + 2, bayTop + bayHeight - 3, width - 4, 1);
      rect(ctx, plan, p.wash, left + width / 2, bayTop + 4, 2, bayHeight - 8);
    } else {
      // Signal/service/security/freight bays use straight front-facing ribs.
      // Their structural strips are not perspective returns or a platform.
      rect(ctx, plan, p.dark, left, bayTop, 6, bayHeight);
      rect(ctx, plan, p.edge, left + 6, bayTop, 1, bayHeight);
      if (plan.lining === 'reinforced' || plan.lining === 'secured') {
        rect(ctx, plan, p.edge, right - 7, bayTop, 7, bayHeight);
        for (const yy of [bayTop + 5, bayTop + bayHeight - 9]) rect(ctx, plan, p.edge, left - 4, yy, 15, 4);
      }
      if (plan.lining === 'signal') for (let run = 0; run < 3; run++) rect(ctx, plan, p.edge, left + 12 + run * 4, bayTop + 4, 1, bayHeight - 8);
      if (plan.lining === 'containment') {
        rect(ctx, plan, p.edge, left + 10, bayTop + 3, width - 13, 2);
        rect(ctx, plan, p.edge, right - 3, bayTop + 3, 2, bayHeight - 6);
      }
    }
  }
  ctx.globalAlpha = .26;
  rect(ctx, plan, p.dark, b.x, plan.datumY, b.w, plan.lining === 'wet' ? 5 : 3);
  rect(ctx, plan, p.edge, b.x, plan.datumY, b.w, 1);
  ctx.globalAlpha = 1;
}

export function drawHubRoomBackgroundV168(ctx, room, model, options = {}) {
  const plan = getHubRoomBackgroundPlanV168(room, model, options);
  if (!plan || !ctx || !plan.regions.length) return plan;
  ctx.save(); ctx.beginPath();
  for (const r of plan.regions) ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip(); lining(ctx, plan);
  for (const light of plan.lights) {
    rect(ctx, plan, '#11242a', light.x - 3, light.y - 3, light.w + 6, light.h + 6);
    rect(ctx, plan, plan.material.edge, light.x - 1, light.y - 1, light.w + 2, light.h + 2);
    rect(ctx, plan, plan.light, light.x, light.y, light.w, light.h);
    ctx.globalAlpha = .12; rect(ctx, plan, plan.light, light.x + 2, light.y + light.h + 1, light.w - 4, 4); ctx.globalAlpha = 1;
  }
  ctx.restore(); return plan;
}
