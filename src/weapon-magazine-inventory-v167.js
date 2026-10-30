/** Physical detachable feed model: opt-in bridge for the V77 legacy ammo contract.
 * Pure state transitions. No VFX or weapons are produced by this module.
 * The pre-existing M41A/M56 caseless visual profiles remain authoritative.
 */
export const WEAPON_MAGAZINE_SCHEMA_V167 = 167;
const int = x => Number.isSafeInteger(x) && x >= 0;
const id = x => typeof x === 'string' && x.length > 0 && x.length <= 160 && !/\s/.test(x);
const deep = x => JSON.parse(JSON.stringify(x));
const FEEDS = new Set(['box', 'drum', 'belt', 'cell', 'tank']);
const LOCATIONS = new Set(['mounted', 'inventory', 'world']);
const PHASES = new Set(['started', 'ejected', 'inserted', 'chambered']);
const RECEIPT_LIMIT = 2048;
const MAX_SPARES = 128;

const remember = (feed, receipt) => {
  if (!id(receipt) || feed.receipts.includes(receipt)) return false;
  feed.receipts.push(receipt);
  if (feed.receipts.length > RECEIPT_LIMIT) feed.receipts.shift();
  return true;
};
const mounted = state => state.magazines.find(x => x.id === state.mountedMagazineId) || null;
const selected = state => state.magazines.find(x => x.id === state.reload?.selectedId) || null;
const unique = xs => new Set(xs).size === xs.length;

export function validateWeaponFeedV167(s) {
  if (!s || s.schema !== 167 || !id(s.weaponDefinitionId) || !id(s.weaponInstanceId)
    || !id(s.ownerId) || !id(s.ammoTypeId) || !FEEDS.has(s.feed)
    || !int(s.magazineSize) || !s.magazineSize || s.magazineSize > 99999
    || !int(s.chamber) || s.chamber > 1 || !int(s.looseRounds) || s.looseRounds > 99999
    || !int(s.nextSerial) || s.nextSerial > 10000000 || !int(s.nextTransactionSerial)
    || s.nextTransactionSerial > 10000000 || !Array.isArray(s.magazines)
    || s.magazines.length > MAX_SPARES + 1 || !Array.isArray(s.receipts)
    || s.receipts.length > RECEIPT_LIMIT || !unique(s.receipts) || !s.receipts.every(id)) return false;
  if (!unique(s.magazines.map(m => m.id))) return false;
  let mountedCount = 0;
  for (const m of s.magazines) {
    if (!id(m.id) || m.ammoTypeId !== s.ammoTypeId || !LOCATIONS.has(m.location)
      || !int(m.capacity) || !m.capacity || m.capacity > s.magazineSize
      || !int(m.rounds) || m.rounds > m.capacity || !int(m.revision) || m.revision > 10000000) return false;
    if (m.location === 'mounted') {
      mountedCount++;
      if (m.id !== s.mountedMagazineId) return false;
    }
  }
  if (mountedCount !== (s.mountedMagazineId === null ? 0 : 1)) return false;
  if (s.mountedMagazineId !== null && !id(s.mountedMagazineId)) return false;
  const tx = s.reload;
  if (tx !== null) {
    if (!tx || !id(tx.id) || !id(tx.selectedId) || !['tactical', 'speed'].includes(tx.policy)
      || !PHASES.has(tx.phase) || !Number.isFinite(tx.progress) || tx.progress < 0 || tx.progress > 1
      || !selected(s) || !id(tx.oldId) && tx.oldId !== null) return false;
    if (tx.phase === 'started' && (tx.progress >= .35 || s.mountedMagazineId !== tx.oldId)) return false;
    if (tx.phase === 'ejected' && (tx.progress < .35 || tx.progress >= .75 || s.mountedMagazineId !== null)) return false;
    if (['inserted', 'chambered'].includes(tx.phase) && s.mountedMagazineId !== tx.selectedId) return false;
    if (selected(s).location !== (tx.phase === 'started' || tx.phase === 'ejected' ? 'inventory' : 'mounted')) return false;
  }
  return true;
}

export function createLegacyWeaponFeedV167({ weaponId, ownerId, ammoTypeId = 'unknown',
  ammo, reserve, magazineSize, feed = 'box' } = {}) {
  if (!id(weaponId) || !id(ownerId) || !id(ammoTypeId) || !FEEDS.has(feed)
    || !int(ammo) || !int(reserve) || !int(magazineSize) || magazineSize < 1
    || magazineSize > 99999 || ammo > magazineSize || reserve > 99999) return null;
  const state = { schema: 167, weaponDefinitionId: weaponId,
    weaponInstanceId: ownerId + ':' + weaponId + ':legacy:1', ownerId, ammoTypeId, feed,
    magazineSize, chamber: 0, looseRounds: reserve, mountedMagazineId: null,
    magazines: [], receipts: [], nextSerial: 0, nextTransactionSerial: 0, reload: null };
  const make = (location, rounds) => {
    const m = { id: state.weaponInstanceId + ':mag:' + ++state.nextSerial,
      ammoTypeId, capacity: magazineSize, rounds, location, revision: 0 };
    state.magazines.push(m); return m;
  };
  if (ammo) state.mountedMagazineId = make('mounted', ammo).id;
  // Reserve rounds become separate, fully trackable physical magazines;
  // oversized older reserves stay as loose rounds rather than vanishing.
  while (state.looseRounds && state.magazines.length < MAX_SPARES + 1) {
    const count = Math.min(magazineSize, state.looseRounds);
    make('inventory', count); state.looseRounds -= count;
  }
  return validateWeaponFeedV167(state) ? state : null;
}

export function weaponFeedCarriedRoundsV167(state) {
  if (!validateWeaponFeedV167(state)) return null;
  return state.chamber + state.looseRounds
    + state.magazines.filter(m => m.location !== 'world').reduce((n, m) => n + m.rounds, 0);
}
export function weaponFeedLoadedRoundsV167(state) {
  if (!validateWeaponFeedV167(state)) return null;
  return state.chamber + (mounted(state)?.rounds || 0);
}
export function weaponFeedReserveRoundsV167(state) {
  if (!validateWeaponFeedV167(state)) return null;
  return state.looseRounds + state.magazines.filter(m => m.location === 'inventory').reduce((n, m) => n + m.rounds, 0);
}

export function spendAcceptedRoundV167(state, receipt) {
  if (!validateWeaponFeedV167(state) || !id(receipt) || state.reload && state.reload.phase === 'ejected'
    || state.receipts.includes('shot:' + receipt)) return false;
  const m = mounted(state);
  if (!state.chamber && m?.rounds > 0) { m.rounds--; m.revision++; state.chamber = 1; }
  if (!state.chamber) return false;
  state.chamber--;
  // For a self-loading firearm the next round becomes chambered immediately.
  if (m?.rounds > 0) { m.rounds--; m.revision++; state.chamber = 1; }
  remember(state, 'shot:' + receipt);
  return true;
}

export function beginWeaponReloadV167(state, receipt = null, policy = 'tactical', selectedId = null) {
  if (!validateWeaponFeedV167(state) || state.reload || receipt !== null && !id(receipt)
    || !['tactical', 'speed'].includes(policy) || state.receipts.includes('reload:' + receipt)
    || state.receipts.includes('cancel:' + receipt)) return false;
  const txId = receipt || state.weaponInstanceId + ':reload:' + (state.nextTransactionSerial + 1);
  if (!id(txId)) return false;
  let replacement = selectedId ? state.magazines.find(m => m.id === selectedId) : state.magazines.find(m => m.location === 'inventory' && m.rounds > 0);
  if (!replacement && !selectedId && state.looseRounds > 0 && state.magazines.length < MAX_SPARES + 1) {
    const count = Math.min(state.magazineSize, state.looseRounds);
    replacement = { id: state.weaponInstanceId + ':mag:' + ++state.nextSerial, ammoTypeId: state.ammoTypeId,
      capacity: state.magazineSize, rounds: count, location: 'inventory', revision: 0 };
    state.magazines.push(replacement); state.looseRounds -= count;
  }
  if (!replacement || replacement.location !== 'inventory' || replacement.rounds <= 0) return false;
  if (receipt === null) state.nextTransactionSerial++;
  state.reload = { id: txId, selectedId: replacement.id, oldId: state.mountedMagazineId,
    policy, phase: 'started', progress: 0 };
  return true;
}

export function advanceWeaponReloadV167(state, receipt, progress) {
  if (!validateWeaponFeedV167(state) || !state.reload || state.reload.id !== receipt
    || !Number.isFinite(progress) || progress < state.reload.progress || progress < 0 || progress > 1) return false;
  const tx = state.reload;
  if (progress >= .35 && tx.phase === 'started') {
    const old = mounted(state);
    if (old) { old.location = tx.policy === 'speed' ? 'world' : 'inventory'; old.revision++; }
    state.mountedMagazineId = null; tx.phase = 'ejected';
  }
  if (progress >= .75 && tx.phase === 'ejected') {
    const next = selected(state);
    if (!next || next.location !== 'inventory') return false;
    next.location = 'mounted'; next.revision++; state.mountedMagazineId = next.id; tx.phase = 'inserted';
  }
  if (progress >= .92 && tx.phase === 'inserted') {
    const m = mounted(state);
    if (!state.chamber && m?.rounds > 0) { m.rounds--; m.revision++; state.chamber = 1; }
    tx.phase = 'chambered';
  }
  tx.progress = progress;
  if (progress === 1) { remember(state, 'reload:' + receipt); state.reload = null; }
  return validateWeaponFeedV167(state);
}

export function cancelWeaponReloadV167(state, receipt) {
  if (!validateWeaponFeedV167(state) || !state.reload || state.reload.id !== receipt) return false;
  // No rollback of observed magazine moves: a late interruption leaves a
  // truly absent / already mounted magazine absent / mounted.
  state.reload = null;
  remember(state, 'cancel:' + receipt);
  return true;
}

export function captureWeaponFeedV167(state) {
  return validateWeaponFeedV167(state) ? deep(state) : null;
}
export function restoreWeaponFeedV167(raw, { ownerId = null, weaponId = null,
  expectedCarriedRounds = null } = {}) {
  if (!validateWeaponFeedV167(raw) || ownerId !== null && raw.ownerId !== ownerId
    || weaponId !== null && raw.weaponDefinitionId !== weaponId
    || expectedCarriedRounds !== null && weaponFeedCarriedRoundsV167(raw) !== expectedCarriedRounds) return null;
  return deep(raw);
}
