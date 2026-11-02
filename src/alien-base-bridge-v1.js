/** Read-only cross-game documentary lookup.
 * Never merges source stats into runtime or promotes proposed weapons. */
import { WEAPONS, ENEMIES, VEHICLES, EQUIPMENT, CREW, WORLDS, FACTIONS } from './content-core-v50.js';
import {
  ALIEN_BASE_SNAPSHOT_INFO_V1,
  ALIEN_BASE_ENTITIES_V1,
  ALIEN_BASE_WEAPONS_V1,
  ALIEN_BASE_MASTER_ENTITIES_V1,
  ALIEN_BASE_MASTER_LINKS_V1
} from './alien-base-snapshot-v1.js';

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
const byMaster = new Map(ALIEN_BASE_MASTER_ENTITIES_V1.map(e => [e.id,e]));
if (byMaster.size !== ALIEN_BASE_MASTER_ENTITIES_V1.length) throw new Error('Duplicate Alien_base master ID');
const proposalForDossier = new Map();
const proposedMasterIds = new Set();
for (const link of ALIEN_BASE_MASTER_LINKS_V1) {
  const dossier = byCanonical.get(link.dossierId);
  if (!dossier || !byMaster.has(link.sharedEntityId) || link.autoMergeStats !== false) {
    throw new Error('Invalid Alien_base shared identity link ' + link.dossierId);
  }
  if (proposalForDossier.has(link.dossierId) || proposedMasterIds.has(link.sharedEntityId)) {
    throw new Error('Ambiguous Alien_base master identity link ' + link.dossierId);
  }
  if (link.status !== 'source-version-review-pending') throw new Error('Unreviewed identity-link status ' + link.dossierId);
  proposalForDossier.set(link.dossierId, link);
  proposedMasterIds.add(link.sharedEntityId);
}
/** V2 documentary suggestions observed by exact Tantalus local ID; no active identity alias. */
export const ALIEN_BASE_REGISTRY_V2_SOURCE_REVIEW_V1 = Object.freeze({
  repository: 'darknigthmare/alien_base',
  prNumber: 21,
  commit: 'd2ff9fef4df40934f35796b9fe361e65315d1ac2',
  status: 'unmerged-source-review-pending',
  suggestedLocalBindings: 38,
  approvedCanonicalIdentityMerges: 0
});
const registryV2ByGameRef = new Map([
  [
    "enemy-001-ovomorph",
    "bio.xenomorph.ovomorph"
  ],
  [
    "enemy-002-facehugger",
    "bio.xenomorph.facehugger"
  ],
  [
    "enemy-003-chestburster",
    "bio.xenomorph.chestburster"
  ],
  [
    "enemy-004-drone-big-chap",
    "bio.xenomorph.big-chap"
  ],
  [
    "enemy-005-warrior",
    "bio.xenomorph.warrior"
  ],
  [
    "enemy-006-runner",
    "bio.xenomorph.runner"
  ],
  [
    "enemy-007-praetorian",
    "bio.xenomorph.praetorian"
  ],
  [
    "enemy-008-queen",
    "bio.xenomorph.queen"
  ],
  [
    "enemy-009-crusher",
    "bio.xenomorph.crusher"
  ],
  [
    "enemy-010-spitter",
    "bio.xenomorph.spitter"
  ],
  [
    "enemy-014-boiler",
    "bio.xenomorph.boiler"
  ],
  [
    "enemy-015-prowler",
    "bio.xenomorph.prowler"
  ],
  [
    "enemy-016-burster",
    "bio.xenomorph.burster"
  ],
  [
    "enemy-035-trilobite-echo",
    "bio.pathogen.trilobite-echo"
  ],
  [
    "enemy-036-deacon-line",
    "bio.pathogen.deacon-line"
  ],
  [
    "enemy-037-neomorph",
    "bio.pathogen.neomorph"
  ],
  [
    "enemy-038-protomorph",
    "bio.pathogen.protomorph"
  ],
  [
    "enemy-041-working-joe",
    "bio.synthetic.working-joe"
  ],
  [
    "vehicle-001-m577-armored-personnel-carrier",
    "vehicle.m577-armored-personnel-carrier"
  ],
  [
    "vehicle-007-p-5000-powered-work-loader",
    "vehicle.p-5000-powered-work-loader"
  ],
  [
    "vehicle-009-ud-4l-cheyenne-dropship",
    "vehicle.ud-4l-cheyenne-dropship"
  ],
  [
    "vehicle-013-uscss-nostromo-shuttle",
    "vehicle.narcissus-nostromo-lifeboat"
  ],
  [
    "equipment-001-motion-tracker",
    "item.motion-tracker"
  ],
  [
    "equipment-009-m3-personnel-armor",
    "item.m3-personnel-armor"
  ],
  [
    "weapon-001-m41a-pulse-rifle",
    "item.m41a-pulse-rifle"
  ],
  [
    "weapon-005-m56-smartgun",
    "item.m56-smartgun"
  ],
  [
    "weapon-006-m240-incinerator-unit",
    "item.m240-incinerator-unit"
  ],
  [
    "weapon-015-ua-571-c-sentry-gun",
    "item.ua-571-c-sentry-gun"
  ],
  [
    "weyland-yutani",
    "faction.weyland-yutani"
  ],
  [
    "seegson",
    "faction.seegson"
  ],
  [
    "uscm",
    "faction.uscm"
  ],
  [
    "atarax",
    "faction.atarax"
  ],
  [
    "crew-01-mara-vega",
    "character.tantalus.mara-vega"
  ],
  [
    "crew-05-bishop-9",
    "character.tantalus.bishop-9"
  ],
  [
    "crew-10-david-8r",
    "character.tantalus.david-8r"
  ],
  [
    "enemy-569-newborn",
    "bio.hybrid.newborn"
  ],
  [
    "enemy-570-offspring",
    "bio.pathogen.offspring"
  ],
  [
    "enemy-571-predalien",
    "bio.xenomorph.predalien"
  ]
]);
if (registryV2ByGameRef.size !== ALIEN_BASE_REGISTRY_V2_SOURCE_REVIEW_V1.suggestedLocalBindings
  || [...registryV2ByGameRef.keys()].some(id => !byGameRef.has(id))) {
  throw new Error('Alien_base v2 review candidates are ambiguous or lack a reviewed v1 dossier');
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

/** Master IDs can be read exactly. Pending proposals never become active aliases. */
export function resolveAlienBaseMasterEntityV1(value) {
  const id = idOf(value);
  if (typeof id !== 'string') return null;
  return byMaster.get(id) || null;
}

/** Developer reference only: the source-version review has not approved this alias.
 * Returning a proposal never activates the candidate master for gameplay or saves. */
export function resolveAlienBaseIdentityProposalV1(value) {
  const dossier = resolveAlienBaseDossierV1(value);
  return proposalForDossier.get(dossier?.id) || null;
}

/** Observed V2 proposal only. Cannot modify save IDs, NPC admission or combat tuning. */
export function resolveAlienBaseRegistryV2CandidateV1(value) {
  const id = idOf(value);
  if (typeof id !== 'string' || !registryV2ByGameRef.has(id)) return null;
  const dossier = byGameRef.get(id);
  const legacyProposal = proposalForDossier.get(dossier?.id);
  if (!legacyProposal) throw new Error('Alien_base v2 proposal lacks a v1 dossier link for '+id);
  return Object.freeze({
    localId: id,
    dossierId: dossier.id,
    legacyMasterCandidateId: legacyProposal.sharedEntityId,
    registryV2CandidateId: registryV2ByGameRef.get(id),
    status: ALIEN_BASE_REGISTRY_V2_SOURCE_REVIEW_V1.status,
    sourceCommit: ALIEN_BASE_REGISTRY_V2_SOURCE_REVIEW_V1.commit,
    approvedCanonicalIdentity: false,
    autoMergeStats: false,
    visualFidelityCertified: false
  });
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
  const master = resolveAlienBaseMasterEntityV1(id);
  const weapon = resolveAlienBaseWeaponReferenceV1(id);
  const proposal = resolveAlienBaseIdentityProposalV1(id);
  const registryV2Candidate = resolveAlienBaseRegistryV2CandidateV1(id);
  const runtime = runtimeById.get(id) || null;
  if (!canonical && !master && !weapon && !runtime) return null;
  return Object.freeze({
    gameId: id,
    dossierId: canonical?.id || null,
    canonicalIdentityApproved: false,
    masterId: master?.id || null,
    candidateMasterId: proposal?.sharedEntityId || null,
    candidateRegistryV2Id: registryV2Candidate?.registryV2CandidateId || null,
    candidateRegistryV2Status: registryV2Candidate?.status || null,
    identityLinkStatus: proposal?.status || null,
    identityLinkRelation: proposal?.relation || null,
    identitySource: canonical?.sourceWork || weapon?.work || null,
    sourceStatus: canonical?.status || weapon?.gameStatus || 'no-shared-dossier',
    visualFidelity: canonical?.visualFidelity || weapon?.visualFidelity || 'not-1to1-certified',
    category: runtime?.kind || canonical?.kind || 'research',
    runtimePresent: Boolean(runtime),
    researchOnly: weapon?.admission === 'research-only',
    referencedByAlienBase: Boolean(canonical || master || weapon)
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
    masterEntities: ALIEN_BASE_MASTER_ENTITIES_V1.length,
    masterLinks: ALIEN_BASE_MASTER_LINKS_V1.length,
    pendingMasterLinks: proposalForDossier.size,
    activeMasterAliases: 0,
    registryV2CandidateLocalBindings: registryV2ByGameRef.size,
    registryV2ApprovedCanonicalAliases: 0,
    unlinkedDossiers: ALIEN_BASE_ENTITIES_V1.length - ALIEN_BASE_MASTER_LINKS_V1.length,
    weaponDossiers: ALIEN_BASE_WEAPONS_V1.length,
    researchOnlyWeapons: proposed.length,
    linkedRuntimeRecords: linked.length,
    documentaryOnlyGameRefs: Object.freeze(pending),
    assertion: 'Identity/works/links only; gameplay untouched, no canonical 1:1 claim.'
  });
}

export { ALIEN_BASE_SNAPSHOT_INFO_V1, ALIEN_BASE_ENTITIES_V1, ALIEN_BASE_WEAPONS_V1, ALIEN_BASE_MASTER_ENTITIES_V1, ALIEN_BASE_MASTER_LINKS_V1 };
