import { validateWeaponFeedV167, weaponFeedLoadedRoundsV167, weaponFeedReserveRoundsV167,
  captureWeaponFeedV167, restoreWeaponFeedV167 } from './weapon-magazine-inventory-v167.js';

/** World receipts for actual detachable magazines. These are visual/gameplay
 * instances of rounds that already existed in a V167 feed, never new ammo.
 * State is saved inside its owning actor's weaponFeedV167 snapshot.
 */
export const WEAPON_MAGAZINE_WORLD_SCHEMA_V168 = 168;
const validId = x => typeof x === 'string' && x.length > 0 && x.length <= 160 && !/\s/.test(x);
const finite = x => Number.isFinite(x) && Math.abs(x) <= 1000000;
const plane = x => x === 'gameplay' || x === 'foreground' || x === 'rear';
const maxReceipts = 2048;
const validWorld = m => {
  const v = m?.worldV168;
  return v && validId(v.levelId) && v.ownerId && validId(v.ownerId)
    && plane(v.plane) && finite(v.x) && finite(v.y)
    && v.schema === WEAPON_MAGAZINE_WORLD_SCHEMA_V168;
};

export function validateMagazineWorldV168(feed, { requirePosition = false } = {}) {
  if (!validateWeaponFeedV167(feed)) return false;
  for (const m of feed.magazines) {
    if (m.location !== 'world' && m.worldV168 !== undefined) return false;
    if (m.location === 'world' && (requirePosition || m.worldV168 !== undefined)
      && (!validWorld(m) || m.worldV168.ownerId !== feed.ownerId)) return false;
  }
  return true;
}

/** Ejection position is bound once to the actual scene/actor and survives save.
 * A duplicate observer tick never relocates a previously dropped magazine.
 */
/** Snapshot boundary: reject world magazines without a physical position.
 * The V167 numeric fields are still checked by its original validator. */
export function captureMagazineFeedV168(feed) {
  return validateMagazineWorldV168(feed, { requirePosition: true }) ? captureWeaponFeedV167(feed) : null;
}
export function restoreMagazineFeedV168(snapshot, options = {}) {
  const feed = restoreWeaponFeedV167(snapshot, options);
  return feed && validateMagazineWorldV168(feed, { requirePosition: true }) ? feed : null;
}

export function stampEjectedMagazinesV168(feed, { ownerId, levelId, plane: targetPlane = 'gameplay', x, y } = {}) {
  if (!validateMagazineWorldV168(feed) || ownerId !== feed.ownerId
    || !validId(levelId) || !plane(targetPlane) || !finite(x) || !finite(y)) return 0;
  let stamped = 0;
  for (const m of feed.magazines) if (m.location === 'world' && m.worldV168 === undefined) {
    m.worldV168 = { schema: 168, levelId, ownerId, plane: targetPlane, x, y };
    stamped++;
  }
  return stamped;
}
export function visibleDroppedMagazinesV168(feed, levelId, targetPlane = 'gameplay') {
  if (!validateMagazineWorldV168(feed, { requirePosition: true }) || !validId(levelId)) return [];
  return feed.magazines.filter(m => m.location === 'world' && m.worldV168.levelId === levelId
    && m.worldV168.plane === targetPlane)
    .map(m => ({ id: m.id, ownerId: feed.ownerId, weaponDefinitionId: feed.weaponDefinitionId,
      rounds: m.rounds, capacity: m.capacity, x: m.worldV168.x, y: m.worldV168.y, plane: targetPlane }));
}

export function nearestDroppedMagazineV168(feed, { ownerId, levelId, plane: targetPlane = 'gameplay',
  x, y, maxDistance = 72, lineOfSight = null } = {}) {
  if (!validateMagazineWorldV168(feed, { requirePosition: true })
    || ownerId !== feed.ownerId || !validId(levelId)
    || !plane(targetPlane) || !finite(x) || !finite(y)
    || !Number.isFinite(maxDistance) || maxDistance <= 0 || maxDistance > 150) return null;
  const possible = visibleDroppedMagazinesV168(feed, levelId, targetPlane)
    .filter(m => m.rounds > 0)
    .map(m => ({ ...m, distance: Math.hypot(m.x - x, m.y - y) }))
    .filter(m => m.distance <= maxDistance && (typeof lineOfSight !== 'function' || lineOfSight(m)))
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
  return possible[0] || null;
}

export function recoverDroppedMagazineV168(feed, { ownerId, levelId, plane: targetPlane = 'gameplay',
  x, y, magazineId, maxDistance = 72, lineOfSight = null } = {}) {
  if (!validId(magazineId)) return null;
  const nearby = nearestDroppedMagazineV168(feed, { ownerId, levelId,
    plane: targetPlane, x, y, maxDistance, lineOfSight });
  if (!nearby || nearby.id !== magazineId) return null;
  const mag = feed.magazines.find(m => m.id === magazineId && m.location === 'world');
  if (!mag) return null;
  const receipt = 'pickup:' + magazineId + ':' + mag.revision;
  if (!validId(receipt) || feed.receipts.includes(receipt)) return null;
  const rounds = mag.rounds;
  mag.location = 'inventory'; mag.revision++;
  delete mag.worldV168;
  feed.receipts.push(receipt);
  if (feed.receipts.length > maxReceipts) feed.receipts.shift();
  if (!validateMagazineWorldV168(feed, { requirePosition: true })) return null;
  return { magazineId, rounds, ownerId, receipt,
    loaded: weaponFeedLoadedRoundsV167(feed), reserve: weaponFeedReserveRoundsV167(feed) };
}
