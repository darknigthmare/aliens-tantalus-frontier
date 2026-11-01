/** Read-only cross-game documentary lookup.
 * Never merges source stats into runtime or promotes proposed weapons. */
import { WEAPONS, ENEMIES, VEHICLES, EQUIPMENT, CREW, WORLDS, FACTIONS } from './content-core-v50.js';
import {
  ALIEN_BASE_SNAPSHOT_INFO_V1,
  ALIEN_BASE_ENTITIES_V1,
  ALIEN_BASE_WEAPONS_V1
} from './alien-base-snapshot-v1.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
freeze(ALIEN_BASE_ENTITIES_V1);
freeze(ALIEN_BASE_WEAPONS_V1);

const byCanonical = new Map();
const byGameRef = new Map();
for (const dossier of ALIEN_BASE_ENTITIES_V1) {
  if (byCanonical.has(dossier.id)) throw new Error('Duplicate Alien_base ID: ' + dossier.id);
  byCanonical.set(dossier.id, dossier);
  for (const gameId of dossier.gameRefs?.tantalus || []) {
    if (byGameRef.has(gameId)) throw new Error('Ambiguous Alien_base game ID: ' + gameId);
    byGameRef.set(gameId, dossier);
  }
}
const researchById = new Map();
for (const weapon of ALIEN_BASE_WEAPONS_V1) {
  if (researchById.has(weapon.id)) throw new Error('Duplicate Alien_base weapon: ' + weapon.id);
  researchById.set(weapon.id, weapon);
}

const runtimeById = new Map();
for (const [kind, records] of [
  ['weapon',WEAPONS], ['enemy',ENEMIES], ['vehicle',VEHICLES],
  ['equipment',EQUIPMENT], ['character',CREW], ['location',WORLDS], ['faction',FACTIONS]
]) {
  for (const entry of records) {
    if (runtimeById.has(entry.id)) throw new Error('Duplicate game content ID: ' + entry.id);
    runtimeById.set(entry.id, {kind, entry});
  }
}
const idOf = value => typeof value === 'string' ? value
  : value && typeof value === 'object' && !Array.isArray(value)
    ? value.id || value.catalogId || value.enemyId || value.weaponId || value.vehicleId || null
    : null;

/** Read-only cross-media identity record; null for unknown or ambiguous aliases. */
export function resolveAlienBaseDossierV1(value) {
  const id = idOf(value);
  return typeof id === 'string' ? byCanonical.get(id) || byGameRef.get(id) || null : null;
}

/** Includes proposed weapons for documentary use only; never grants inventory access. */
export function resolveAlienBaseWeaponReferenceV1(value) {
  const id = idOf(value);
  return typeof id === 'string' ? researchById.get(id) || null : null;
}

/** Separate source identity, actual game admission and local simulation. */
export function resolveAlienBaseGameMappingV1(value) {
  const id = idOf(value);
  if (typeof id !== 'string') return null;
  const canonical = resolveAlienBaseDossierV1(id);
  const weapon = resolveAlienBaseWeaponReferenceV1(id);
  const runtime = runtimeById.get(id) || null;
  if (!canonical && !weapon && !runtime) return null;
  return Object.freeze({
    gameId: id,
    canonicalId: canonical?.id || null,
    identitySource: canonical?.sourceWork || weapon?.work || null,
    sourceStatus: canonical?.status || weapon?.gameStatus || 'no-shared-dossier',
    visualFidelity: canonical?.visualFidelity || weapon?.visualFidelity || 'not-1to1-certified',
    category: runtime?.kind || canonical?.kind || 'research',
    runtimePresent: Boolean(runtime),
    researchOnly: weapon?.admission === 'research-only',
    referencedByAlienBase: Boolean(canonical || weapon)
  });
}

export function auditAlienBaseBridgeV1() {
  const references = [...byGameRef.keys()];
  const linked = references.filter(id => runtimeById.has(id));
  const pending = references.filter(id => !runtimeById.has(id));
  const proposed = ALIEN_BASE_WEAPONS_V1.filter(x => x.admission === 'research-only');
  return Object.freeze({
    version: ALIEN_BASE_SNAPSHOT_INFO_V1.schemaVersion,
    curatedDossiers: ALIEN_BASE_ENTITIES_V1.length,
    weaponDossiers: ALIEN_BASE_WEAPONS_V1.length,
    researchOnlyWeapons: proposed.length,
    linkedRuntimeRecords: linked.length,
    documentaryOnlyGameRefs: Object.freeze(pending),
    assertion: 'Identity/works/links only; gameplay untouched, no canonical 1:1 claim.'
  });
}

export { ALIEN_BASE_SNAPSHOT_INFO_V1, ALIEN_BASE_ENTITIES_V1, ALIEN_BASE_WEAPONS_V1 };
