import { SPRITE_GRID, SPRITE_PIVOTS } from './sprite-animation-runtime.js';

const freezeEvents = (events = []) => Object.freeze(events.map((event) => Object.freeze({ ...event })));
const freezeClip = (clip) => Object.freeze({
  ...clip,
  frames: Object.freeze([...clip.frames]),
  events: freezeEvents(clip.events)
});
const freezeClipSet = (id, clips) => Object.freeze({ id, clips: Object.freeze(clips.map(freezeClip)) });

export const VEHICLE_VISUAL_IDENTITY = Object.freeze({
  exact: 'exact',
  family: 'authored-family',
  missing: 'missing-dedicated-art'
});

export const VEHICLE_VISUAL_HITBOXES = Object.freeze({
  'm577-command-hull': Object.freeze({ x: 20, y: 104, width: 216, height: 136 }),
  'm22a3-tank-hull': Object.freeze({ x: 16, y: 108, width: 224, height: 132 }),
  'p5000-loader-frame': Object.freeze({ x: 64, y: 42, width: 128, height: 198 }),
  'ud4l-dropship-hull': Object.freeze({ x: 18, y: 112, width: 220, height: 128 })
});

export const VEHICLE_VISUAL_CLIP_SETS = Object.freeze({
  'm577-command-action-v55': freezeClipSet('m577-command-action-v55', [
    { id: 'command-idle', row: 0, frames: [0, 1, 2, 3], fps: 3, loop: true, events: [{ frame: 2, type: 'vehicle:sensor-mast' }, { frame: 3, type: 'vehicle:command-online' }] },
    { id: 'roll', row: 1, frames: [4, 5, 6, 7], fps: 9, loop: true, events: [{ frame: 5, type: 'vehicle:wheel-cycle' }] },
    { id: 'command-action', row: 2, frames: [8, 9, 10, 11], fps: 7, loop: false, events: [{ frame: 8, type: 'vehicle:sensor-scan' }, { frame: 10, type: 'vehicle:defensive-shot' }] },
    { id: 'damage', row: 3, frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'vehicle:wreck-lock' }] }
  ]),
  'm22a3-tank-action-v55': freezeClipSet('m22a3-tank-action-v55', [
    { id: 'idle', row: 0, frames: [0, 1, 2, 3], fps: 3, loop: true, events: [{ frame: 1, type: 'vehicle:engine-start' }] },
    { id: 'roll', row: 1, frames: [4, 5, 6, 7], fps: 9, loop: true, events: [{ frame: 6, type: 'vehicle:track-cycle' }] },
    { id: 'cannon', row: 2, frames: [8, 9, 10, 11], fps: 7, loop: false, events: [{ frame: 10, type: 'vehicle:cannon-shot' }, { frame: 11, type: 'vehicle:cannon-recoil' }] },
    { id: 'damage', row: 3, frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'vehicle:wreck-lock' }] }
  ]),
  'p5000-loader-action-v55': freezeClipSet('p5000-loader-action-v55', [
    { id: 'idle', row: 0, frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'vehicle:hydraulic-idle' }] },
    { id: 'walk', row: 1, frames: [4, 5, 6, 7], fps: 8, loop: true, events: [{ frame: 4, type: 'audio:loader-step-right' }, { frame: 6, type: 'audio:loader-step-left' }] },
    { id: 'work', row: 2, frames: [8, 9, 10, 11], fps: 7, loop: false, events: [{ frame: 9, type: 'vehicle:claw-close' }, { frame: 10, type: 'vehicle:load-lift' }] },
    { id: 'damage', row: 3, frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'vehicle:wreck-lock' }] }
  ]),
  'ud4l-dropship-action-v55': freezeClipSet('ud4l-dropship-action-v55', [
    { id: 'hangar', row: 0, frames: [0, 1, 2, 3], fps: 3, loop: true, events: [{ frame: 2, type: 'vehicle:ramp-opening' }, { frame: 3, type: 'vehicle:boarding-ready' }] },
    { id: 'launch', row: 1, frames: [4, 5, 6, 7], fps: 7, loop: false, events: [{ frame: 5, type: 'vehicle:engine-spool' }, { frame: 7, type: 'vehicle:gear-retract' }] },
    { id: 'flight', row: 2, frames: [8, 9, 10, 11], fps: 9, loop: true, events: [{ frame: 10, type: 'vehicle:boost' }, { frame: 11, type: 'vehicle:nose-shot' }] },
    { id: 'damage', row: 3, frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'vehicle:wreck-lock' }] }
  ])
});

const profile = ({
  key,
  catalogBaseId,
  catalogName,
  catalogBaseNumber,
  catalogSlug,
  family,
  sheetId,
  imageKey,
  filename,
  clipSet,
  hitbox,
  scale,
  renderWidth,
  renderHeight,
  clipRoles
}) => Object.freeze({
  key,
  catalogBaseId,
  catalogName,
  catalogBaseNumber,
  catalogSlug,
  family,
  sheetId,
  imageKey,
  masterPath: `/assets/openai/sprites/vehicles/${filename}`,
  path: `/assets/openai/sprites/normalized/vehicles/${filename}`,
  clipSet,
  clips: VEHICLE_VISUAL_CLIP_SETS[clipSet].clips,
  pivot: 'vehicle-ground',
  pivotPoint: SPRITE_PIVOTS['vehicle-ground'],
  hitbox,
  hitboxBounds: VEHICLE_VISUAL_HITBOXES[hitbox],
  scale,
  renderWidth,
  renderHeight,
  drawSize: Object.freeze({ width: renderWidth, height: renderHeight }),
  sourceFacing: 1,
  identityStatus: VEHICLE_VISUAL_IDENTITY.exact,
  identityVerified: true,
  fallbackSheetId: null,
  fallbackReason: null,
  clipRoles: Object.freeze({ ...clipRoles })
});

export const VEHICLE_VISUAL_PROFILES = Object.freeze({
  m577Command: profile({
    key: 'm577Command',
    catalogBaseId: 'vehicle-002-m577-command-apc',
    catalogName: 'M577 Command APC',
    catalogBaseNumber: 2,
    catalogSlug: 'm577-command-apc',
    family: 'ground',
    sheetId: 'vehicle.m577-command-apc.action',
    imageKey: 'm577Command',
    filename: 'm577-command-apc-action-sheet.png',
    clipSet: 'm577-command-action-v55',
    hitbox: 'm577-command-hull',
    scale: 1,
    renderWidth: 250,
    renderHeight: 148,
    clipRoles: { idle: 'command-idle', move: 'roll', action: 'command-action', damage: 'damage' }
  }),
  m22a3Jackson: profile({
    key: 'm22a3Jackson',
    catalogBaseId: 'vehicle-004-m22a3-jackson-tank',
    catalogName: 'M22A3 Jackson Tank',
    catalogBaseNumber: 4,
    catalogSlug: 'm22a3-jackson-tank',
    family: 'ground',
    sheetId: 'vehicle.m22a3-jackson-tank.action',
    imageKey: 'm22a3Jackson',
    filename: 'm22a3-jackson-tank-action-sheet.png',
    clipSet: 'm22a3-tank-action-v55',
    hitbox: 'm22a3-tank-hull',
    scale: 1.16,
    renderWidth: 292,
    renderHeight: 150,
    clipRoles: { idle: 'idle', move: 'roll', action: 'cannon', damage: 'damage' }
  }),
  p5000Loader: profile({
    key: 'p5000Loader',
    catalogBaseId: 'vehicle-007-p-5000-powered-work-loader',
    catalogName: 'P-5000 Powered Work Loader',
    catalogBaseNumber: 7,
    catalogSlug: 'p-5000-powered-work-loader',
    family: 'exosuit',
    sheetId: 'vehicle.p5000-powered-work-loader.action',
    imageKey: 'p5000Loader',
    filename: 'p-5000-powered-work-loader-action-sheet.png',
    clipSet: 'p5000-loader-action-v55',
    hitbox: 'p5000-loader-frame',
    scale: 0.94,
    renderWidth: 150,
    renderHeight: 192,
    clipRoles: { idle: 'idle', move: 'walk', action: 'work', damage: 'damage' }
  }),
  ud4lCheyenne: profile({
    key: 'ud4lCheyenne',
    catalogBaseId: 'vehicle-009-ud-4l-cheyenne-dropship',
    catalogName: 'UD-4L Cheyenne Dropship',
    catalogBaseNumber: 9,
    catalogSlug: 'ud-4l-cheyenne-dropship',
    family: 'air',
    sheetId: 'vehicle.ud4l-cheyenne-dropship.action',
    imageKey: 'ud4lCheyenne',
    filename: 'ud-4l-cheyenne-dropship-action-sheet.png',
    clipSet: 'ud4l-dropship-action-v55',
    hitbox: 'ud4l-dropship-hull',
    scale: 1.28,
    renderWidth: 320,
    renderHeight: 154,
    clipRoles: { idle: 'hangar', move: 'flight', action: 'launch', damage: 'damage' }
  })
});

export const VEHICLE_VISUAL_KEYS = Object.freeze(Object.keys(VEHICLE_VISUAL_PROFILES));
export const VEHICLE_VISUAL_CHASSIS_COUNT = VEHICLE_VISUAL_KEYS.length;
export const VEHICLE_VISUAL_FITS = Object.freeze(['Standard', 'Recon', 'Assault', 'Rescue', 'Colonial', 'Frontier', 'Prototype', 'Apex']);

const slug = (value) => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const variantDescriptors = Object.values(VEHICLE_VISUAL_PROFILES).flatMap((entry) => VEHICLE_VISUAL_FITS.map((fit, fitIndex) => {
  const catalogNumber = entry.catalogBaseNumber + fitIndex * 36;
  const fitSuffix = fitIndex === 0 ? '' : `-${slug(fit)}`;
  const catalogId = `vehicle-${String(catalogNumber).padStart(3, '0')}-${entry.catalogSlug}${fitSuffix}`;
  return Object.freeze({
    catalogId,
    catalogName: fitIndex === 0 ? entry.catalogName : `${entry.catalogName} — ${fit}`,
    visualKey: entry.key,
    fit,
    isVariant: fitIndex !== 0,
    baseId: entry.catalogBaseId
  });
}));

export const VEHICLE_VISUAL_VARIANTS = Object.freeze(Object.fromEntries(variantDescriptors.map((entry) => [entry.catalogId, entry])));
export const VEHICLE_VISUAL_PROFILE_IDS = Object.freeze(Object.keys(VEHICLE_VISUAL_VARIANTS));
export const VEHICLE_VISUAL_PROFILE_COUNT = VEHICLE_VISUAL_PROFILE_IDS.length;

const variantByName = new Map(variantDescriptors.map((entry) => [entry.catalogName, entry]));
const variantByKeyAndFit = new Map(variantDescriptors.map((entry) => [`${entry.visualKey}:${entry.fit}`, entry]));
const profileBySheetId = new Map(Object.values(VEHICLE_VISUAL_PROFILES).map((entry) => [entry.sheetId, entry]));

const sourceValue = (source, keys) => {
  if (typeof source === 'string') return source;
  for (const key of keys) if (typeof source?.[key] === 'string' && source[key].trim()) return source[key].trim();
  return '';
};

export function resolveVehicleVisualKey(source = {}) {
  const direct = sourceValue(source, ['visualKey', 'spriteKey']);
  if (VEHICLE_VISUAL_PROFILES[direct]) return direct;
  const bySheet = profileBySheetId.get(sourceValue(source, ['sheetId']));
  if (bySheet) return bySheet.key;

  const id = sourceValue(source, ['id', 'catalogId', 'vehicleId', 'profileId']);
  if (VEHICLE_VISUAL_VARIANTS[id]) return VEHICLE_VISUAL_VARIANTS[id].visualKey;
  if (typeof source === 'string' && VEHICLE_VISUAL_VARIANTS[source]) return VEHICLE_VISUAL_VARIANTS[source].visualKey;

  const name = sourceValue(source, ['name', 'catalogName', 'vehicleName', 'chassis']);
  if (variantByName.has(name)) return variantByName.get(name).visualKey;
  for (const entry of Object.values(VEHICLE_VISUAL_PROFILES)) {
    if (name === entry.catalogName || name.startsWith(`${entry.catalogName} — `)) return entry.key;
  }
  return null;
}

export function resolveVehicleVisualVariant(source = {}) {
  const key = resolveVehicleVisualKey(source);
  if (!key) return null;
  const visual = VEHICLE_VISUAL_PROFILES[key];
  const id = sourceValue(source, ['id', 'catalogId', 'vehicleId', 'profileId']);
  const name = sourceValue(source, ['name', 'catalogName', 'vehicleName', 'chassis']);
  const descriptor = VEHICLE_VISUAL_VARIANTS[id] || variantByName.get(name) || VEHICLE_VISUAL_VARIANTS[visual.catalogBaseId];
  const requestedFit = typeof source === 'object' && typeof source.fit === 'string' && VEHICLE_VISUAL_FITS.includes(source.fit)
    ? source.fit
    : descriptor.fit;
  const canonicalDescriptor = variantByKeyAndFit.get(`${key}:${requestedFit}`) || descriptor;
  return Object.freeze({
    visualKey: key,
    catalogId: canonicalDescriptor.catalogId,
    catalogName: canonicalDescriptor.catalogName,
    baseId: visual.catalogBaseId,
    fit: requestedFit,
    isVariant: canonicalDescriptor.isVariant,
    visual
  });
}

export function resolveVehicleVisualProfile(source = {}) {
  const resolved = resolveVehicleVisualVariant(source);
  if (!resolved) return null;
  const identityStatus = resolved.isVariant
    ? VEHICLE_VISUAL_IDENTITY.family
    : VEHICLE_VISUAL_IDENTITY.exact;
  const fallbackReason = resolved.isVariant
    ? `La plaque exacte du châssis ${resolved.visual.catalogName} est réemployée pour le fit ${resolved.fit}; ses marquages et équipements de fit ne sont pas dessinés séparément.`
    : null;
  return Object.freeze({
    ...resolved.visual,
    catalogId: resolved.catalogId,
    resolvedCatalogName: resolved.catalogName,
    fit: resolved.fit,
    isVariant: resolved.isVariant,
    identityStatus,
    profileIdentityVerified: !resolved.isVariant,
    approximate: resolved.isVariant,
    fallbackReason
  });
}

export function resolveVehicleVisualClip(source = {}, clipId = '') {
  const visual = resolveVehicleVisualProfile(source);
  if (!visual) return null;
  const clipSet = VEHICLE_VISUAL_CLIP_SETS[visual.clipSet];
  return clipSet.clips.find((clip) => clip.id === clipId) || null;
}

const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export function resolveVehicleVisualAnimation(source = {}) {
  const visual = resolveVehicleVisualProfile(source);
  if (!visual) return null;
  const clipSet = VEHICLE_VISUAL_CLIP_SETS[visual.clipSet];
  const requested = sourceValue(source, ['visualClip', 'clipId', 'animationState', 'visualState']);
  const directClip = clipSet.clips.find((clip) => clip.id === requested);
  if (directClip) return Object.freeze({ sheetId: visual.sheetId, clipId: directClip.id, visualKey: visual.key });

  const maxHull = finite(source.maxHull);
  const hull = finite(source.hull);
  const damaged = source.destroyed === true
    || finite(source.v52HurtClock) > 0
    || finite(source.hurtClock) > 0
    || (maxHull > 0 && hull / maxHull < 0.28);
  const acting = source.firing === true
    || source.attacking === true
    || source.launching === true
    || source.sensorDeploying === true
    || finite(source.actionClock) > 0
    || finite(source.workClock) > 0
    || finite(source.v52TurretClock) > 0;
  const moving = source.moving === true || Math.abs(finite(source.vx)) > 8 || Math.abs(finite(source.vy)) > 8;
  const role = damaged ? 'damage' : acting ? 'action' : moving ? 'move' : 'idle';
  return Object.freeze({ sheetId: visual.sheetId, clipId: visual.clipRoles[role], visualKey: visual.key });
}

export function vehicleVisualCoverageReport(catalog = []) {
  const byVisualKey = Object.fromEntries(VEHICLE_VISUAL_KEYS.map((key) => [key, 0]));
  const byIdentityStatus = { exact: 0, 'authored-family': 0, 'missing-dedicated-art': 0 };
  const unresolvedIds = [];
  for (const source of catalog) {
    const visual = resolveVehicleVisualProfile(source);
    if (visual) {
      byVisualKey[visual.key] += 1;
      byIdentityStatus[visual.identityStatus] += 1;
    } else {
      byIdentityStatus[VEHICLE_VISUAL_IDENTITY.missing] += 1;
      unresolvedIds.push(sourceValue(source, ['id', 'catalogId', 'vehicleId']) || 'unknown');
    }
  }
  return Object.freeze({
    total: catalog.length,
    dedicated: catalog.length - unresolvedIds.length,
    unresolved: unresolvedIds.length,
    exactProfileCount: byIdentityStatus.exact,
    familyReuseProfileCount: byIdentityStatus['authored-family'],
    missingDedicatedProfileCount: byIdentityStatus['missing-dedicated-art'],
    withoutExactBitmapProfileCount:
      byIdentityStatus['authored-family'] + byIdentityStatus['missing-dedicated-art'],
    byIdentityStatus: Object.freeze(byIdentityStatus),
    byVisualKey: Object.freeze(byVisualKey),
    unresolvedIds: Object.freeze(unresolvedIds),
    genericM577Fallbacks: 0,
    grid: SPRITE_GRID
  });
}
