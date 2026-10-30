/** Typed, source-conscious weapon attachment contract.
 * All parts are *Tantalus adaptations*, not claims that source weapons had
 * these exact detachable fittings. Gameplay stats require a separate tuning
 * review before runtime application.
 */
export const WEAPON_MODULE_SCHEMA_V168 = 168;
const id = x => typeof x === 'string' && x.length > 0 && x.length <= 128 && /^[a-z0-9:-]+$/.test(x);
const validOwner = x => x === 'player' || x === 'coop';
const weapon = x => typeof x === 'string' && /^weapon-\d{3}-[a-z0-9-]+$/.test(x);
const number = x => Number.isInteger(x) && x >= 1 && x <= 30;
const MAX_RECORDS = 128, MAX_RECEIPTS = 2048;
const canonical = {
  m41a: 'weapon-001-m41a-pulse-rifle',
  m41a2: 'weapon-002-m41a2-pulse-rifle',
  m56: 'weapon-005-m56-smartgun',
  m240: 'weapon-006-m240-incinerator-unit'
};
export const WEAPON_MODULE_SLOTS_V168 = Object.freeze([
  'optic', 'muzzle', 'underbarrel', 'stock', 'grip', 'magwell', 'chamber', 'belt_harness',
  'cell_port', 'tank_mount', 'fire_control', 'side_rail', 'cosmetic', 'projectile_head', 'shield_arm'
]);
const MODULES = [
  { id: 'tantalus-m41a-optic', slot: 'optic', minLevel: 5, supported: [canonical.m41a, canonical.m41a2],
    cosmeticOnly: true, art: 'missing', sourceStatus: 'game-adaptation' },
  { id: 'tantalus-m41a-stock', slot: 'stock', minLevel: 7, supported: [canonical.m41a, canonical.m41a2],
    cosmeticOnly: true, art: 'missing', sourceStatus: 'game-adaptation' },
  { id: 'tantalus-m41a-rail', slot: 'side_rail', minLevel: 3, supported: [canonical.m41a, canonical.m41a2],
    cosmeticOnly: true, art: 'missing', sourceStatus: 'game-adaptation' },
  { id: 'tantalus-m41a-grip', slot: 'grip', minLevel: 11, supported: [canonical.m41a, canonical.m41a2],
    cosmeticOnly: true, art: 'missing', sourceStatus: 'game-adaptation' },
  { id: 'tantalus-m56-harness', slot: 'belt_harness', minLevel: 6, supported: [canonical.m56],
    cosmeticOnly: true, art: 'missing', sourceStatus: 'game-adaptation' },
  { id: 'tantalus-m240-tank', slot: 'tank_mount', minLevel: 9, supported: [canonical.m240],
    cosmeticOnly: true, art: 'missing', sourceStatus: 'game-adaptation' },
  { id: 'tantalus-uscm-finish', slot: 'cosmetic', minLevel: 2,
    supported: [canonical.m41a, canonical.m41a2, canonical.m56, canonical.m240],
    cosmeticOnly: true, art: 'missing', sourceStatus: 'game-adaptation' }
];
export const WEAPON_MODULE_CATALOG_V168 = Object.freeze(MODULES.map(m =>
  Object.freeze({ ...m, supported: Object.freeze([...m.supported]) })));
const byId = new Map(WEAPON_MODULE_CATALOG_V168.map(m => [m.id, m]));
const clone = x => JSON.parse(JSON.stringify(x));

export function createWeaponModuleInventoryV168() {
  return { schema: 168, equips: [], receipts: [] };
}

export function validateWeaponModuleInventoryV168(s) {
  if (!s || s.schema !== 168 || !Array.isArray(s.equips) || s.equips.length > MAX_RECORDS
    || !Array.isArray(s.receipts) || s.receipts.length > MAX_RECEIPTS
    || s.receipts.some(v => !id(v)) || new Set(s.receipts).size !== s.receipts.length) return false;
  const keys = new Set(), identities = new Map();
  for (const e of s.equips) {
    if (!validOwner(e.ownerId) || !weapon(e.weaponDefinitionId) || !id(e.weaponInstanceId)
      || !WEAPON_MODULE_SLOTS_V168.includes(e.slot) || !id(e.moduleId)) return false;
    const module = byId.get(e.moduleId);
    if (!module || module.slot !== e.slot || !module.supported.includes(e.weaponDefinitionId)) return false;
    const identityKey = e.ownerId + '|' + e.weaponInstanceId;
    if (identities.has(identityKey) && identities.get(identityKey) !== e.weaponDefinitionId) return false;
    identities.set(identityKey, e.weaponDefinitionId);
    const key = identityKey + '|' + e.slot;
    if (keys.has(key)) return false;
    keys.add(key);
  }
  return true;
}

export function installWeaponModuleV168(s, { ownerId, weaponDefinitionId, weaponInstanceId,
  moduleId, masteryLevel, receiptId } = {}) {
  if (!validateWeaponModuleInventoryV168(s) || !validOwner(ownerId) || !weapon(weaponDefinitionId)
    || !id(weaponInstanceId) || !id(moduleId) || !number(masteryLevel) || !id(receiptId)
    || s.receipts.includes(receiptId)) return null;
  const module = byId.get(moduleId);
  if (!module || !module.supported.includes(weaponDefinitionId)
    || masteryLevel < module.minLevel) return null;
  const old = s.equips.find(e => e.ownerId === ownerId && e.weaponInstanceId === weaponInstanceId && e.slot === module.slot);
  if (old?.moduleId === moduleId) return null;
  if (!old && s.equips.length >= MAX_RECORDS) return null;
  const previousModuleId = old?.moduleId || null;
  if (old) old.moduleId = moduleId;
  else s.equips.push({ ownerId, weaponDefinitionId, weaponInstanceId, slot: module.slot, moduleId });
  s.receipts.push(receiptId);
  if (s.receipts.length > MAX_RECEIPTS) s.receipts.shift();
  return { ownerId, weaponDefinitionId, weaponInstanceId, moduleId, slot: module.slot,
    replaced: previousModuleId, cosmeticOnly: true, art: module.art };
}

export function uninstallWeaponModuleV168(s, { ownerId, weaponDefinitionId, weaponInstanceId,
  slot, receiptId } = {}) {
  if (!validateWeaponModuleInventoryV168(s) || !validOwner(ownerId)
    || !weapon(weaponDefinitionId) || !id(weaponInstanceId)
    || !WEAPON_MODULE_SLOTS_V168.includes(slot) || !id(receiptId) || s.receipts.includes(receiptId)) return null;
  const index = s.equips.findIndex(e => e.ownerId === ownerId && e.weaponDefinitionId === weaponDefinitionId
    && e.weaponInstanceId === weaponInstanceId && e.slot === slot);
  if (index < 0) return null;
  const [old] = s.equips.splice(index, 1);
  s.receipts.push(receiptId);
  if (s.receipts.length > MAX_RECEIPTS) s.receipts.shift();
  return { ...old, removed: true };
}

export function equippedWeaponModulesV168(s, ownerId, weaponInstanceId) {
  if (!validateWeaponModuleInventoryV168(s) || !validOwner(ownerId) || !id(weaponInstanceId)) return [];
  return s.equips.filter(e => e.ownerId === ownerId && e.weaponInstanceId === weaponInstanceId)
    .map(e => ({ ...e, artStatus: 'missing', canonExact: false, mechanicalBonusEnabled: false }));
}

export function captureWeaponModulesV168(s) {
  return validateWeaponModuleInventoryV168(s) ? clone(s) : null;
}
export function restoreWeaponModulesV168(raw) {
  return validateWeaponModuleInventoryV168(raw) ? clone(raw) : createWeaponModuleInventoryV168();
}
