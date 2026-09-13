import { EQUIPMENT } from './content-core-v50.js';

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const list = value => Array.isArray(value) ? value : [];
const finite = value => typeof value === 'number' && Number.isFinite(value);
const bound = (value, fallback, min, max) => Math.max(min, Math.min(max, finite(value) ? value : fallback));
const integer = (value, fallback, min, max) => Math.floor(bound(value, fallback, min, max));
const clone = value => JSON.parse(JSON.stringify(value));
const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9:_-]{1,120}$/.test(value) ? value : null;
const statuses = new Set(['carried', 'deployed', 'destroyed', 'spent']);

// Only T01 ammunition/cadence/install/fold come from the readable source.
// Hit points and the four physical footprints are explicit V86 gameplay tuning.
export const PLACEABLE_RULES_V86 = Object.freeze({ maxInstances: 64, maxDistance: 120, supportTolerance: 2 });
export const PLACEABLE_DEFINITIONS_V86 = Object.freeze(Object.fromEntries(Object.entries({
  sentry: { action: 'deploy-sentry', w: 72, h: 70, maxHealth: 100, maxAmmo: 150, range: 620, fireInterval: 0.2, coneHalfAngle: Math.PI / 3, installSeconds: 2.5, foldSeconds: 2 },
  'cryo-trap': { action: 'cryo-trap', w: 64, h: 34, maxHealth: 20, maxAmmo: 0, installSeconds: 1.5, foldSeconds: 1 },
  'shock-trap': { action: 'shock-trap', w: 64, h: 48, maxHealth: 30, maxAmmo: 0, installSeconds: 1.5, foldSeconds: 1 },
  containment: { action: 'containment-field', w: 96, h: 84, maxHealth: 60, maxAmmo: 0, installSeconds: 2.5, foldSeconds: 2 }
}).map(([kind, definition]) => [kind, Object.freeze({ kind, ...definition })])));

// Explicit authored IDs AND names: the catalogue's cycling utility is never authority.
const approved = [
  ['equipment-020-portable-sentry', 'Portable Sentry', 'sentry'],
  ['equipment-050-portable-sentry-field', 'Portable Sentry — Field', 'sentry'],
  ['equipment-080-portable-sentry-military', 'Portable Sentry — Military', 'sentry'],
  ['equipment-024-cryo-mine', 'Cryo Mine', 'cryo-trap'],
  ['equipment-054-cryo-mine-field', 'Cryo Mine — Field', 'cryo-trap'],
  ['equipment-084-cryo-mine-military', 'Cryo Mine — Military', 'cryo-trap'],
  ['equipment-026-electroshock-trap', 'Electroshock Trap', 'shock-trap'],
  ['equipment-056-electroshock-trap-field', 'Electroshock Trap — Field', 'shock-trap'],
  ['equipment-086-electroshock-trap-military', 'Electroshock Trap — Military', 'shock-trap'],
  ['equipment-028-portable-quarantine', 'Portable Quarantine', 'containment'],
  ['equipment-058-portable-quarantine-field', 'Portable Quarantine — Field', 'containment'],
  ['equipment-088-portable-quarantine-military', 'Portable Quarantine — Military', 'containment']
];
export const PLACEABLE_CATALOG_V86 = Object.freeze(approved.flatMap(([catalogId, name, kind]) =>
  EQUIPMENT.some(item => item.id === catalogId && item.name === name)
    ? [Object.freeze({ catalogId, name, ...PLACEABLE_DEFINITIONS_V86[kind] })] : []));
const catalog = new Map(PLACEABLE_CATALOG_V86.map(definition => [definition.catalogId, definition]));

export function getPlaceableDefinitionV86(catalogId) { return catalog.get(catalogId) || null; }
export function isPlaceableEquipmentV86(item) {
  const definition = catalog.get(typeof item === 'string' ? item : item?.id || item?.catalogId);
  return Boolean(definition && (typeof item === 'string' ||
    (item.name === undefined || item.name === definition.name) && (item.action === undefined || item.action === definition.action)));
}

function supplies(equipmentActions) {
  const items = equipmentActions instanceof Map ? [...equipmentActions.values()] : list(equipmentActions);
  const seen = new Set();
  let capacity = PLACEABLE_RULES_V86.maxInstances;
  return items.filter(item => record(item) && isPlaceableEquipmentV86(item)).sort((a, b) => String(a.id || a.catalogId).localeCompare(String(b.id || b.catalogId))).flatMap(item => {
    const catalogId = item.id || item.catalogId;
    if (seen.has(catalogId) || capacity <= 0) return [];
    seen.add(catalogId);
    const charges = integer(item.charges, 0, 0, 99);
    const quantity = Math.min(charges, integer(item.maxCharges, charges, 0, 99), capacity);
    capacity -= quantity;
    // A missing legacy deployment is spent, never a reason to refill the bag.
    const used = Math.min(quantity, Math.max(integer(item.uses, 0, 0, 999999), charges - integer(item.remaining, charges, 0, charges)));
    return quantity ? [{ catalogId, quantity, used, magnitude: bound(item.magnitude, 12, 0, 999) }] : [];
  });
}

function freshInstance(source, ordinal) {
  const definition = catalog.get(source.catalogId);
  const used = ordinal <= source.used;
  const duration = definition.kind === 'containment' ? 8 + source.magnitude / 4 : 0;
  const instanceId = `${source.catalogId}:${ordinal}`;
  return {
    instanceId, id: instanceId, catalogId: source.catalogId, kind: definition.kind, name: definition.name,
    status: used ? 'spent' : 'carried', sourceUseRecorded: used, onGround: false,
    health: definition.maxHealth, maxHealth: definition.maxHealth,
    ammo: used ? 0 : definition.maxAmmo, maxAmmo: definition.maxAmmo,
    ownerCrewId: null, x: 0, y: 0, w: definition.w, h: definition.h, facing: 1,
    range: definition.range || 0, fireInterval: definition.fireInterval || 0,
    damage: definition.kind === 'sentry' ? 8 + source.magnitude * 0.45 : definition.kind === 'shock-trap' ? source.magnitude : 0,
    slow: definition.kind === 'cryo-trap' ? 0.38 : definition.kind === 'shock-trap' ? 0.65 : 0.45,
    cooldown: 0, armed: !used && ['cryo-trap', 'shock-trap'].includes(definition.kind),
    duration: used ? 0 : duration, maxDuration: duration, supportSurface: null, legacyV72: false
  };
}

function worldBounds(value) {
  return { x: bound(value?.x, 0, -100000, 100000), y: bound(value?.y, 0, -100000, 100000),
    w: bound(value?.width ?? value?.w, 6200, 1, 100000), h: bound(value?.height ?? value?.h, 1080, 1, 100000) };
}
function rectangle(value) {
  if (!record(value) || ![value.x, value.y, value.w, value.h].every(finite) || value.w <= 0 || value.h <= 0) return null;
  return { x: value.x, y: value.y, w: value.w, h: value.h };
}
function surface(value) {
  const box = rectangle(value);
  return box && ['floor', 'platform'].includes(value.kind) && safeId(value.id) ? { id: value.id, kind: value.kind, ...box } : null;
}

function cleanInstance(template, saved, bounds) {
  if (!record(saved) || saved.instanceId !== template.instanceId || saved.catalogId !== template.catalogId || saved.kind !== template.kind || !statuses.has(saved.status)) return null;
  const definition = catalog.get(template.catalogId);
  const legacyV72 = saved.legacyV72 === true;
  const maxAmmo = legacyV72 ? integer(saved.maxAmmo, 0, 0, definition.maxAmmo) : definition.maxAmmo;
  const maxDuration = bound(template.maxDuration, 0, 0, 257.75);
  const health = bound(saved.health, 0, 0, definition.maxHealth);
  let status = health <= 0 ? 'destroyed' : saved.status;
  const armed = saved.armed === true;
  const duration = bound(saved.duration, 0, 0, maxDuration);
  if (status === 'deployed' && ((['cryo-trap', 'shock-trap'].includes(template.kind) && !armed) || (template.kind === 'containment' && duration <= 0))) status = 'spent';
  const supportSurface = surface(saved.supportSurface);
  return { instanceId: template.instanceId, id: template.instanceId, catalogId: template.catalogId, kind: definition.kind, name: definition.name,
    w: definition.w, h: definition.h, range: definition.range || 0, fireInterval: definition.fireInterval || 0,
    damage: bound(template.damage, 0, 0, 1000), slow: definition.kind === 'cryo-trap' ? 0.38 : definition.kind === 'shock-trap' ? 0.65 : 0.45,
    status, sourceUseRecorded: template.sourceUseRecorded || saved.sourceUseRecorded === true || status !== 'carried',
    onGround: status !== 'carried' && saved.onGround === true,
    health, maxHealth: definition.maxHealth, maxAmmo, ammo: integer(saved.ammo, 0, 0, maxAmmo),
    ownerCrewId: safeId(saved.ownerCrewId), x: bound(saved.x, 0, bounds.x, bounds.x + Math.max(0, bounds.w - definition.w)),
    y: bound(saved.y, 0, bounds.y, bounds.y + Math.max(0, bounds.h - definition.h)), facing: saved.facing === -1 ? -1 : 1,
    cooldown: bound(saved.cooldown, 0, 0, 30), armed: ['carried', 'deployed'].includes(status) && armed,
    duration, maxDuration, supportSurface, legacyV72 };
}

function spent(template) { return { ...template, status: 'spent', sourceUseRecorded: true, onGround: false, ammo: 0, armed: false, duration: 0 }; }

export function createPlaceablesStateV86(equipmentActions, options = {}) {
  const issued = supplies(equipmentActions);
  const state = { schema: 86, sourceIssued: issued.map(({ catalogId, quantity }) => ({ catalogId, quantity })),
    instances: issued.flatMap(source => Array.from({ length: source.quantity }, (_, index) => freshInstance(source, index + 1))) };
  if (!options.legacyV72 && !list(options.legacyDeployables).length) return state;
  state.migration = 'legacy-v72';
  const deployments = list(options.legacyDeployables).slice(0, 256);
  const counts = new Map();
  for (const item of deployments) if (record(item)) counts.set(item.id, (counts.get(item.id) || 0) + 1);
  const bounds = worldBounds(options.bounds);
  state.instances = state.instances.map(template => {
    // A V72 object must refer to an actually consumed ordinal of this mission's source.
    const saved = deployments.find(item => item?.id === template.instanceId);
    if (!template.sourceUseRecorded || !saved || counts.get(saved.id) !== 1 || saved.kind !== template.kind) return template;
    const source = issued.find(item => item.catalogId === template.catalogId);
    const oldMaxAmmo = template.kind === 'sentry' ? Math.min(150, 12 + Math.floor(source.magnitude / 2)) : 0;
    const oldW = template.kind === 'sentry' ? 38 : template.kind === 'containment' ? 180 : 58;
    const oldH = template.kind === 'sentry' ? 42 : template.kind === 'containment' ? bound(saved.h, 152, 1, 360) : 18;
    const raw = { ...template, ...saved, instanceId: template.instanceId, catalogId: template.catalogId, status: 'deployed',
      sourceUseRecorded: true, onGround: true, health: template.maxHealth, legacyV72: true, maxAmmo: oldMaxAmmo,
      ammo: integer(saved.ammo, 0, 0, oldMaxAmmo), duration: bound(saved.duration, 0, 0, template.maxDuration),
      x: (finite(saved.x) ? saved.x : 0) + oldW / 2 - template.w / 2,
      y: (finite(saved.y) ? saved.y : 0) + oldH - template.h,
      supportSurface: null };
    return cleanInstance(template, raw, bounds) || template;
  });
  return state;
}

export function restorePlaceablesStateV86(raw, equipmentActions, options = {}) {
  if (raw === null || raw === undefined) return createPlaceablesStateV86(equipmentActions, { ...options, legacyV72: true });
  const state = createPlaceablesStateV86(equipmentActions);
  if (!record(raw) || raw.schema !== 86 || !Array.isArray(raw.instances)) {
    state.instances = state.instances.map(spent);
    return state;
  }
  const bounds = worldBounds(options.bounds);
  const candidates = raw.instances.slice(0, 256);
  const counts = new Map();
  for (const item of candidates) if (record(item)) counts.set(item.instanceId, (counts.get(item.instanceId) || 0) + 1);
  state.instances = state.instances.map(template => {
    const saved = candidates.find(item => item?.instanceId === template.instanceId);
    if (!saved || counts.get(template.instanceId) !== 1) return spent(template);
    return cleanInstance(template, saved, bounds) || spent(template);
  });
  if (raw.migration === 'legacy-v72') state.migration = raw.migration;
  return state;
}

// Pending installs/folds live outside the committed status. Their omission cancels
// them on resume: carried stays carried; deployed stays deployed, with no refund.
export function capturePlaceablesStateV86(state) {
  if (!record(state) || state.schema !== 86) return null;
  const sourceIssued = list(state.sourceIssued).filter(item => catalog.has(item?.catalogId)).slice(0, 12)
    .map(item => ({ catalogId: item.catalogId, quantity: integer(item.quantity, 0, 0, 64) }));
  const authorized = new Set(sourceIssued.flatMap(item => Array.from({ length: item.quantity }, (_, index) => `${item.catalogId}:${index + 1}`)));
  const seen = new Set();
  const instances = list(state.instances).slice(0, 64).flatMap(item => {
    if (!authorized.has(item?.instanceId) || seen.has(item.instanceId) || !catalog.has(item.catalogId)) return [];
    seen.add(item.instanceId);
    const clean = cleanInstance(item, item, worldBounds());
    // Capture must not clip the coordinates to a guessed mission size.
    if (clean) { clean.x = finite(item.x) ? item.x : 0; clean.y = finite(item.y) ? item.y : 0; }
    return clean ? [clean] : [];
  });
  return clone({ schema: 86, sourceIssued, instances, ...(state.migration === 'legacy-v72' ? { migration: state.migration } : {}) });
}

const messages = Object.freeze({
  'invalid-instance': 'Objet posable inconnu.', 'not-carried': 'Cet objet n’est pas transporté.',
  'not-deployed': 'Cet objet n’est pas déployé.', 'invalid-actor': 'Aucun opérateur disponible.',
  'actor-airborne': 'Pose impossible : rejoignez un sol stable.', 'actor-busy': 'Pose impossible depuis un véhicule ou une échelle.',
  'invalid-position': 'Position de pose invalide.', 'out-of-bounds': 'Pose hors des limites du niveau.',
  'too-far': 'Objet trop éloigné : portée maximale de 120 unités.', 'no-support': 'Toute la base doit reposer sur une surface stable.',
  'door-blocked': 'Laissez libre le passage de la porte, même ouverte.', 'ladder-blocked': 'Laissez libre l’accès à l’échelle.',
  'vent-blocked': 'Laissez libre l’accès au conduit.', 'lift-blocked': 'Laissez libre le trajet de l’ascenseur.',
  'objective-blocked': 'Laissez libre l’accès à cet objectif.', 'actor-blocked': 'Un personnage occupe cette position.',
  'obstacle-blocked': 'Un obstacle occupe cette position.', 'placeable-blocked': 'Un autre objet occupe cette position.',
  'invalid-placement': 'Le placement doit être validé avant installation.', ok: ''
});
const result = (ok, code, extra = {}) => ({ ok, code, reason: messages[code] || messages['invalid-placement'], ...extra });
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function validatePlaceablePlacementV86({ instance, actor, x, y, facing, world = {} } = {}) {
  const definition = catalog.get(instance?.catalogId);
  if (!definition || instance.kind !== definition.kind) return result(false, 'invalid-instance');
  if (instance.status !== 'carried') return result(false, 'not-carried');
  if (!rectangle(actor) || actor.alive !== true || actor.downed) return result(false, 'invalid-actor');
  if (actor.inVehicle || actor.climbing) return result(false, 'actor-busy');
  if (actor.grounded !== true) return result(false, 'actor-airborne');
  if (!finite(x) || !finite(y)) return result(false, 'invalid-position');
  const bounds = worldBounds(world.bounds);
  const box = { x, y, w: definition.w, h: definition.h };
  if (x < bounds.x || y < bounds.y || x + box.w > bounds.x + bounds.w || y + box.h > bounds.y + bounds.h) return result(false, 'out-of-bounds');
  if (Math.hypot(x + box.w / 2 - (actor.x + actor.w / 2), y + box.h - (actor.y + actor.h)) > 120) return result(false, 'too-far');
  const supports = list(world.platforms).filter(item => rectangle(item) && !item.destroyed && !item.moving && !item.liftId && !item.isLift && item.type !== 'lift' && item.kind !== 'lift'
    && Math.abs(item.y - (y + box.h)) <= PLACEABLE_RULES_V86.supportTolerance);
  let supportSurface = null;
  for (const anchor of supports) {
    const joined = supports.filter(item => Math.abs(item.y - anchor.y) < 0.001).sort((a, b) => a.x - b.x);
    let edge = x;
    for (const item of joined) if (item.x <= edge && item.x + item.w > edge) edge = item.x + item.w;
    if (edge >= x + box.w) {
      const contained = joined.find(item => item.x <= x && item.x + item.w >= x + box.w);
      supportSurface = { id: safeId(contained?.id) || `surface:${Math.round(anchor.x * 1000)}:${Math.round(anchor.y * 1000)}`, kind: anchor.floor ? 'floor' : 'platform',
        x: contained?.x ?? x, y: anchor.y, w: contained?.w ?? box.w, h: contained?.h ?? Math.max(...joined.map(item => item.h)) };
      box.y = anchor.y - box.h;
      break;
    }
  }
  if (!supportSurface) return result(false, 'no-support');
  if (box.y < bounds.y || box.y + box.h > bounds.y + bounds.h) return result(false, 'out-of-bounds');
  if (Math.hypot(box.x + box.w / 2 - (actor.x + actor.w / 2), box.y + box.h - (actor.y + actor.h)) > PLACEABLE_RULES_V86.maxDistance) return result(false, 'too-far');
  const groups = [
    ['door-blocked', world.doors], ['ladder-blocked', world.ladders], ['vent-blocked', world.vents],
    ['lift-blocked', [...list(world.lifts), ...list(world.elevators)]], ['objective-blocked', world.objectives],
    ['actor-blocked', [actor, ...list(world.actors)]],
    ['placeable-blocked', list(world.placeables).filter(item => item.status === undefined || item.status === 'deployed' || item.status === 'spent' && item.onGround === true)],
    ['obstacle-blocked', [...list(world.walls), ...list(world.covers), ...list(world.obstacles), ...list(world.platforms)].filter(item => !item?.destroyed)]
  ];
  for (const [code, objects] of groups) if (list(objects).some(item => rectangle(item) && overlaps(box, item))) return result(false, code);
  return result(true, 'ok', { x: box.x, y: box.y, facing: facing === -1 ? -1 : 1, supportSurface });
}

export function deployPlaceableV86(state, instanceId, placement, { ownerCrewId = null } = {}) {
  const instance = list(state?.instances).find(item => item.instanceId === instanceId);
  if (state?.schema !== 86 || !instance || !catalog.has(instance.catalogId)) return result(false, 'invalid-instance');
  if (instance.status !== 'carried') return result(false, 'not-carried');
  if (placement?.ok !== true || !finite(placement.x) || !finite(placement.y) || !surface(placement.supportSurface)) return result(false, 'invalid-placement');
  const firstDeployment = !instance.sourceUseRecorded;
  Object.assign(instance, { status: 'deployed', sourceUseRecorded: true, onGround: true, x: placement.x, y: placement.y,
    facing: placement.facing === -1 ? -1 : 1, ownerCrewId: safeId(ownerCrewId), supportSurface: clone(placement.supportSurface) });
  return result(true, 'ok', { instance, firstDeployment });
}

export function recoverPlaceableV86(state, instanceId) {
  const instance = list(state?.instances).find(item => item.instanceId === instanceId);
  if (state?.schema !== 86 || !instance || !catalog.has(instance.catalogId)) return result(false, 'invalid-instance');
  if (!['deployed', 'spent'].includes(instance.status) || !instance.onGround || !(instance.health > 0)) return result(false, 'not-deployed');
  instance.status = 'carried';
  instance.onGround = false;
  return result(true, 'ok', { instance, firstDeployment: false });
}
