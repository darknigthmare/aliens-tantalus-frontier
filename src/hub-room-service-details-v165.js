const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const bounds = value => value && [value.x, value.y, value.w, value.h].every(Number.isFinite) && value.w > 0 && value.h > 0;
const expanded = (b, margin) => ({ x: b.x - margin, y: b.y - margin, w: b.w + margin * 2, h: b.h + margin * 2 });
const service = (kind, purpose, code, x, y = 320, w = 104, h = 46) => ({ kind, purpose, code, x, y, w, h });
const keep = reason => ({ omissionReason: reason });

/** A named wall assembly serves the actual compartment, in a measured empty
 * bay. These are deliberately authored centres, not a search for any gap that
 * happens to accept a prop. A panel and its bolts, fittings and short closed
 * connections are one physical assembly; nothing is scattered on the floor.
 * Flight observation envelopes and the furnished refuge stay unobstructed. */
export const HUB_ROOM_SERVICE_DETAILS_V165 = freeze({
  bridge: keep('Preserve the native navigation observation envelope and existing watch desks.'),
  briefing: service('signal', 'meeting-room-intercom-and-acoustic-return', 'COM 01', 1060, 320, 96, 42),
  'combat-information': service('signal', 'recording-line-distribution-and-watch-intercom', 'SIG 02', 1000),
  'cryo-bay': service('hygiene', 'stasis-bay-clean-gas-and-pressure-isolation', 'CRY 01', 460, 320, 96),
  'crew-quarters': service('habitat', 'berth-air-return-and-call-point', 'HAB 01', 460, 320, 96, 42),
  mess: service('habitat', 'dining-air-return-and-service-call', 'HAB 02', 860),
  medical: service('hygiene', 'bedside-clean-gas-isolation-and-service-access', 'MED 01', 1080, 424, 96, 42),
  'science-lab': service('hygiene', 'analysis-clean-gas-isolation-and-extraction', 'LAB 01', 1000),
  quarantine: service('air', 'sealed-room-extraction-and-filter-access', 'ISO 01', 750, 320, 96),
  armory: service('electrical', 'secure-issue-lighting-and-test-circuit-isolation', 'ARM 01', 880, 320, 96, 42),
  workshop: service('electrical', 'bench-power-isolation-and-test-sockets', 'MNT 01', 800, 320, 96, 42),
  'vehicle-bay': service('pipe', 'inspection-bay-compressed-air-service', 'VEH 01', 460),
  'dropship-hangar': keep('Preserve the aircraft, flight-control booth and gantry working envelope.'),
  reactor: service('electrical', 'power-conversion-service-isolation', 'PWR 01', 800),
  'life-support': service('air', 'air-loop-sampling-and-replaceable-filter-access', 'AIR 01', 240, 320, 96, 42),
  'sensor-array': service('signal', 'receiver-cable-termination-and-local-call', 'SIG 03', 460, 320, 96, 42),
  'arrival-airlock': service('air', 'airlock-return-air-and-pressure-sampling', 'SAS 01', 1200, 248),
  logistics: service('electrical', 'freight-inspection-lighting-and-utility-power', 'FRT 01', 820, 248),
  'mire-archives': service('air', 'evidence-storage-conditioned-air-return', 'ARC 01', 1240),
  'synthetic-bay': service('electrical', 'clean-diagnostic-power-isolation', 'SYN 01', 640),
  cctv: service('signal', 'camera-line-termination-and-recording-backup', 'SEC 01', 800, 248),
  'proving-ground': service('signal', 'range-observation-intercom-and-safety-call', 'TIR 01', 1040, 248),
  morgue: service('hygiene', 'forensic-room-extraction-and-water-isolation', 'MED 02', 1200, 248),
  'escape-pods': service('electrical', 'evacuation-service-lighting-and-local-isolation', 'EVA 01', 1080, 400),
  durandal: service('air', 'processor-cooling-return-and-filter-access', 'CPU 01', 1400, 400),
  bioforge: service('hygiene', 'specimen-bay-clean-gas-and-extraction-isolation', 'BIO 01', 1200, 248),
  'animal-care': service('air', 'habitat-conditioned-air-return-and-filter-access', 'HAB 03', 1500),
  'frontier-civil-counter': service('habitat', 'reception-air-return-and-service-call', 'CIV 01', 1420),
  'personal-refuge': keep('Preserve the authored apertures, personal portrait, reading group and quiet rear wall.'),
  'flight-control-cockpit': keep('Preserve the native pilot observation envelope and instrument approach.'),
  'galley-service': service('hygiene', 'food-preparation-clean-water-and-extraction-isolation', 'GAL 01', 840),
  'sanitary-bay': service('pipe', 'washroom-water-loop-isolation-and-service-access', 'EAU 01', 700),
  'engine-room': service('pipe', 'drive-room-cooling-loop-isolation', 'DRV 01', 1720),
  'water-recycling': service('pipe', 'water-return-sampling-and-filter-isolation', 'EAU 02', 900),
  'maintenance-spine': service('electrical', 'longitudinal-utility-circuit-isolation', 'MNT 02', 1440)
});

/** The entire assembly, including fastening plate, is checked against the
 * final production furniture and its native architecture reservations. A
 * rejected authored position is reported; it is never silently relocated. */
export function getHubRoomServiceDetailPlanV165(room, composition) {
  const profile = Object.hasOwn(HUB_ROOM_SERVICE_DETAILS_V165, room?.id) ? HUB_ROOM_SERVICE_DETAILS_V165[room.id] : null;
  const spatial = composition?.spatial;
  if (!profile || !spatial || !bounds(spatial.bounds) || !spatial.planes || !spatial.projection
    || !Array.isArray(spatial.reservations) || !Array.isArray(composition.items)) return null;
  const plan = { schema: 165, roomId: room.id, support: 'flush-rear-wall', plane: 'rear',
    projection: spatial.projection.kind, projectionDxPerY: spatial.projection.dxPerY,
    gameplayPlane: '2d', interactive: false, collidable: false, geometryPreserved: true,
    items: [], omitted: [], sourceStatus: 'original-authored-functional-wall-assemblies' };
  if (profile.omissionReason) {
    plan.omitted.push({ role: 'wall-service-assembly', reason: profile.omissionReason, intentional: true });
    return plan;
  }
  const target = { x: spatial.bounds.x + profile.x - profile.w / 2, y: profile.y, w: profile.w, h: profile.h };
  const mount = expanded(target, 3), envelope = expanded(mount, 5);
  const reservations = [...spatial.reservations, ...composition.items,
    ...(composition.workstationDetailsV139?.items || []).map(item => item.target),
    ...(composition.clinicalBayV139?.parts || []).map(part => part.bounds)];
  const conflicts = reservations.filter(reservation => bounds(reservation) && overlap(envelope, reservation));
  const inWall = mount.x >= spatial.bounds.x + 128 && mount.x + mount.w <= spatial.bounds.x + spatial.bounds.w - 128
    && mount.y >= spatial.planes.ceilingY + 54 && mount.y + mount.h <= spatial.planes.walkY - 112;
  if (!inWall || conflicts.length) {
    plan.omitted.push({ role: profile.purpose, reason: inWall ? 'occupied-authored-service-bay' : 'outside-rear-wall-service-band',
      intentional: false, bounds: mount, conflicts: conflicts.map(entry => entry.role || entry.id || 'existing-furnishing') });
    return plan;
  }
  plan.items.push({ id: `${room.id}-wall-service-v165`, role: profile.purpose, kind: profile.kind,
    code: profile.code, bounds: target, mountBounds: mount, clearanceBounds: envelope,
    support: 'flush-rear-wall', plane: 'rear', projectionDxPerY: spatial.projection.dxPerY,
    interactive: false, collidable: false });
  return plan;
}

export function getHubRoomServiceMotionV165(time = 0, { reducedMotion = false } = {}) {
  const t = finite(time);
  return { fanAngle: reducedMotion ? 0 : ((t * .55) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2),
    pilotOpacity: reducedMotion ? .58 : .58 + Math.sin(t * .65) * .035, reducedMotion: !!reducedMotion };
}

function plate(ctx, b) {
  ctx.fillStyle = '#17292b'; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = '#71817a'; ctx.fillRect(b.x, b.y, b.w, 1); ctx.fillRect(b.x, b.y, 1, b.h);
  ctx.fillStyle = '#0a181b'; ctx.fillRect(b.x, b.y + b.h - 1, b.w, 1); ctx.fillRect(b.x + b.w - 1, b.y, 1, b.h);
  for (const x of [b.x + 1, b.x + b.w - 3]) for (const y of [b.y + 3, b.y + b.h - 5]) {
    ctx.fillStyle = '#829087'; ctx.fillRect(x, y, 2, 2); ctx.fillStyle = '#263a38'; ctx.fillRect(x, y, 1, 1);
  }
}
function cabinet(ctx, x, y, w, h, tone = '#4b625d') {
  ctx.fillStyle = '#0b1b1e'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = tone; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = '#8c9b8b'; ctx.fillRect(x + 2, y + 2, w - 4, 1);
  ctx.fillStyle = '#203b3c'; ctx.fillRect(x + w - 6, y + h * .4, 2, Math.max(3, h * .2));
  ctx.fillStyle = '#1b3334'; for (const yy of [y + 5, y + h - 7]) ctx.fillRect(x + 3, yy, 2, 3);
}
function grille(ctx, x, y, w, h) {
  cabinet(ctx, x, y, w, h, '#405953');
  ctx.fillStyle = '#172e30'; for (let yy = y + 5; yy < y + h - 4; yy += 4) ctx.fillRect(x + 5, yy, w - 10, 2);
}
function pipe(ctx, x, y, h, tone) {
  ctx.fillStyle = '#13292c'; ctx.fillRect(x, y, 7, h);
  ctx.fillStyle = tone; ctx.fillRect(x + 1, y, 5, h);
  ctx.fillStyle = '#8b9c8d'; ctx.fillRect(x + 2, y, 1, h);
  for (const yy of [y + 2, y + h - 6]) { ctx.fillStyle = '#2c4846'; ctx.fillRect(x - 2, yy, 11, 4); }
}
function valve(ctx, x, y, color) {
  ctx.fillStyle = '#10292b'; ctx.fillRect(x - 5, y - 5, 10, 10);
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();ctx.arc(x, y, 4, 0, Math.PI * 2);ctx.stroke();
  ctx.fillStyle = color;ctx.fillRect(x - 4, y - 1, 8, 2);ctx.fillRect(x - 1, y - 4, 2, 8);
}

export function drawHubRoomServiceDetailsV165(ctx, plan, { time = 0, reducedMotion = false } = {}) {
  if (!ctx || !plan) return null;
  const motion = getHubRoomServiceMotionV165(time, { reducedMotion });
  ctx.save();
  for (const item of plan.items) {
    const { x, y, w, h } = item.bounds;
    // All painted pixels are confined to the admitted mounting footprint.
    ctx.save();ctx.beginPath();ctx.rect(item.mountBounds.x, item.mountBounds.y, item.mountBounds.w, item.mountBounds.h);ctx.clip();
    plate(ctx, item.mountBounds);
    ctx.fillStyle = '#2b4543';ctx.fillRect(x, y, w, h);
    if (item.kind === 'pipe' || item.kind === 'hygiene') {
      pipe(ctx, x + 9, y + 3, h - 12, '#627e78');pipe(ctx, x + 29, y + 3, h - 12, '#596d63');
      valve(ctx, x + 12, y + h * .45, '#92b4a7');valve(ctx, x + 32, y + h * .64, '#b0a17a');
      cabinet(ctx, x + 48, y + 4, w - 53, h - 13, item.kind === 'hygiene' ? '#7b8980' : '#4c6761');
      ctx.fillStyle = '#223d3b';ctx.fillRect(x + 55, y + 10, w - 68, 3);
    } else if (item.kind === 'air') {
      const cx = x + 22, cy = y + (h - 7) / 2;
      cabinet(ctx, x + 4, y + 3, 37, h - 12);
      ctx.fillStyle = '#102a2d';ctx.beginPath();ctx.arc(cx, cy, 12, 0, Math.PI * 2);ctx.fill();
      ctx.save();ctx.translate(cx, cy);ctx.rotate(motion.fanAngle);ctx.fillStyle = '#647c71';
      for (let blade = 0; blade < 4; blade++) { ctx.rotate(Math.PI / 2);ctx.fillRect(1, -2, 9, 4); }
      ctx.restore();ctx.fillStyle = '#a7b3a0';ctx.fillRect(cx - 2, cy - 2, 4, 4);
      grille(ctx, x + 48, y + 3, w - 53, h - 12);
    } else if (item.kind === 'habitat') {
      grille(ctx, x + 4, y + 3, w * .52, h - 12);
      cabinet(ctx, x + w * .62, y + 5, w * .3, h - 16, '#5a6e60');
      ctx.fillStyle = '#193334';for (let yy = y + 10; yy < y + h - 14; yy += 4) ctx.fillRect(x + w * .67, yy, w * .16, 1);
    } else {
      cabinet(ctx, x + 4, y + 3, w * .5, h - 12, item.kind === 'electrical' ? '#5b6a54' : '#48635f');
      cabinet(ctx, x + w * .6, y + 3, w * .33, h - 12);
      ctx.fillStyle = '#16302f';for (let yy = y + 9; yy < y + h - 12; yy += 5) ctx.fillRect(x + 10, yy, w * .28, 2);
      ctx.globalAlpha = motion.pilotOpacity;ctx.fillStyle = '#adc59d';ctx.fillRect(x + w * .69, y + 9, 3, 3);ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#b1b6a3';ctx.fillRect(x + 7, y + h - 7, Math.min(47, w - 14), 6);
    ctx.fillStyle = '#263b35';ctx.font = '600 5px ui-monospace, monospace';ctx.textAlign = 'left';ctx.fillText(item.code, x + 9, y + h - 2, Math.min(43, w - 18));
    ctx.restore();
  }
  ctx.restore();
  return { ...plan, motion, paintedIds: plan.items.map(item => item.id) };
}
