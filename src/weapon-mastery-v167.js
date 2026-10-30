/** Persisted, receipt-based weapon model mastery (LV1–30).
 * No XP on fire input, dry fire, scenery or unverified damage.
 * Gameplay balance here is original Tantalus tuning, never franchise canon.
 */
export const WEAPON_MASTERY_SCHEMA_V167 = 167;
export const WEAPON_MASTERY_MAX_LEVEL_V167 = 30;
const validId = x => typeof x === 'string' && x.length > 0 && x.length <= 160 && !/\s/.test(x);
const validOwner = x => x === 'player' || x === 'coop' || /^squad:[a-zA-Z0-9_-]{1,60}$/.test(x || '');
const validWeapon = x => typeof x === 'string' && /^weapon-\d{3}-[a-z0-9-]+$/.test(x);
const safeInt = x => Number.isSafeInteger(x) && x >= 0;
const deep = x => JSON.parse(JSON.stringify(x));
const RECEIPT_WINDOW = 4096;
const ENTRY_LIMIT = 512;
const XP_CAP = 1000000000;

export function requiredWeaponXpV167(level) {
  return Number.isInteger(level) && level >= 1 && level < 30
    ? Math.round(100 * level ** 1.45) : 0;
}
export function weaponLevelFromXpV167(xp) {
  if (!safeInt(xp)) return 1;
  let level = 1, spent = 0;
  while (level < 30 && spent + requiredWeaponXpV167(level) <= xp) {
    spent += requiredWeaponXpV167(level++);
  }
  return level;
}
export function createWeaponMasteryV167() {
  return { schema: 167, entries: [], receipts: [] };
}
export function validWeaponMasteryV167(s) {
  if (!s || s.schema !== 167 || !Array.isArray(s.entries) || s.entries.length > ENTRY_LIMIT
    || !Array.isArray(s.receipts) || s.receipts.length > RECEIPT_WINDOW) return false;
  const keys = new Set();
  for (const e of s.entries) {
    if (!validOwner(e.ownerId) || !validWeapon(e.weaponId) || !safeInt(e.xp)
      || e.xp > XP_CAP || !safeInt(e.hitCount) || e.hitCount > XP_CAP
      || e.level !== weaponLevelFromXpV167(e.xp)) return false;
    const key = e.ownerId + '|' + e.weaponId;
    if (keys.has(key)) return false; keys.add(key);
  }
  return s.receipts.every(validId) && new Set(s.receipts).size === s.receipts.length;
}

/** Each damage receipt must name the accepted projectile/beam and enemy.
 * The limit is defensive: a prior receipt outside the 4096-event window
 * cannot be proven unique by this ledger alone.
 */
export function awardAcceptedWeaponDamageV167(ledger, { ownerId, weaponId, receiptId,
  targetId, appliedDamage } = {}) {
  if (!validWeaponMasteryV167(ledger) || !validOwner(ownerId) || !validWeapon(weaponId)
    || !validId(receiptId) || !validId(targetId)
    || !Number.isFinite(appliedDamage) || appliedDamage <= 0) return null;
  const identity = 'hit:' + ownerId + ':' + receiptId + ':' + targetId;
  if (identity.length > 160 || ledger.receipts.includes(identity)) return null;
  let entry = ledger.entries.find(e => e.ownerId === ownerId && e.weaponId === weaponId);
  if (!entry) {
    if (ledger.entries.length >= ENTRY_LIMIT) return null;
    entry = { ownerId, weaponId, xp: 0, level: 1, hitCount: 0 };
    ledger.entries.push(entry);
  }
  const gain = Math.min(100, Math.max(1, Math.ceil(appliedDamage / 4)));
  const priorLevel = entry.level;
  entry.xp = Math.min(XP_CAP, entry.xp + gain);
  entry.level = weaponLevelFromXpV167(entry.xp);
  entry.hitCount++;
  ledger.receipts.push(identity);
  if (ledger.receipts.length > RECEIPT_WINDOW) ledger.receipts.shift();
  return { ownerId, weaponId, receiptId: identity, gained: gain,
    level: entry.level, levelUp: entry.level > priorLevel, xp: entry.xp };
}
export function captureWeaponMasteryV167(state) {
  return validWeaponMasteryV167(state) ? deep(state) : null;
}
export function restoreWeaponMasteryV167(raw) {
  // Legacy save without a ledger starts with an empty mastery; never guesses XP.
  return validWeaponMasteryV167(raw) ? deep(raw) : createWeaponMasteryV167();
}
export function weaponMasterySummaryV167(state, ownerId, weaponId) {
  if (!validWeaponMasteryV167(state) || !validOwner(ownerId) || !validWeapon(weaponId)) return null;
  const e = state.entries.find(x => x.ownerId === ownerId && x.weaponId === weaponId)
    || { ownerId, weaponId, xp: 0, level: 1, hitCount: 0 };
  const spent = Array.from({ length: e.level - 1 }, (_, i) => requiredWeaponXpV167(i + 1))
    .reduce((a, b) => a + b, 0);
  return { ...e, xpInLevel: e.xp - spent,
    xpNextLevel: requiredWeaponXpV167(e.level), maxLevel: 30 };
}
