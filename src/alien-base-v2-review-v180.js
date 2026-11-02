/** Immutable, source-pinned ALIEN_BASE v2 research review (Tantalus).
 * Staged for development inspection only: NOT imported by the live codex,
 * save-system, combat catalogues, NPCs, or production game services.
 * Upstream PR #21 remains unmerged as of the reviewed commit. */
import { ALIEN_BASE_ENTITIES_V1, ALIEN_BASE_MASTER_LINKS_V1 } from './alien-base-bridge-v1.js';

export const ALIEN_BASE_V2_REVIEW_V180 = Object.freeze({
  repo: 'darknigthmare/alien_base',
  pr: 21,
  sourceCommit: 'd2ff9fef4df40934f35796b9fe361e65315d1ac2',
  reportCommit: '5eea7252d565a91ae42e288a634c03c3d3da3625',
  state: 'STAGED_SOURCE_REVIEW_ONLY',
  approvedIdentityAliases: 0,
  sourceEntityCount: 652,
  sourceTantalusBindings: 1217,
  matchedLocalIds: 38
});
const pairs = [
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
];
const noBinding = [
  {
    "group": "weapons",
    "localId": "weapon-147-ocap-91-volcan",
    "name": "OCAP-91 Volcan"
  },
  {
    "group": "weapons",
    "localId": "weapon-190-type-95-combat-pistol",
    "name": "Type 95 Combat Pistol"
  },
  {
    "group": "weapons",
    "localId": "weapon-171-x1-fireball",
    "name": "X1 Fireball"
  },
  {
    "group": "weapons",
    "localId": "weapon-172-lem-stg24-storm-rifle",
    "name": "LEM StG24 Storm Rifle"
  },
  {
    "group": "weapons",
    "localId": "weapon-173-u1a2-gl-conversion",
    "name": "U1A2 GL Conversion"
  },
  {
    "group": "weapons",
    "localId": "weapon-174-4c2-astra",
    "name": "4C2 Astra"
  },
  {
    "group": "weapons",
    "localId": "weapon-175-2b1-vajra",
    "name": "2B1 Vajra"
  },
  {
    "group": "weapons",
    "localId": "weapon-176-6a-jaipur-smg",
    "name": "6A Jaipur Submachine Gun"
  },
  {
    "group": "weapons",
    "localId": "weapon-177-8a7-dambulla-machine-pistol",
    "name": "8A7 Dambulla Machine Pistol"
  },
  {
    "group": "vehicles",
    "localId": "vehicle-282-covenant-terraforming-truck",
    "name": "Covenant Terraforming Truck"
  }
];
const missingAfe2 = ["siren","gasbag","wey-yu-worker"];
const documentaryGaps = [
  "ab:character:amanda-ripley-alien-isolation",
  "ab:character:dwayne-hicks-aliens-1986",
  "ab:character:bishop-aliens-1986",
  "ab:character:david-8-prometheus-2012",
  "ab:character:rain-carradine-alien-romulus-2024",
  "ab:character:wendy-alien-earth-2025",
  "ab:character:ellen-ripley-alien-1979"
];
const dossiers = new Map(ALIEN_BASE_ENTITIES_V1.flatMap(d => d.gameRefs.tantalus.map(id=>[id,d])));
const proposalByDossier = new Map(ALIEN_BASE_MASTER_LINKS_V1.map(link=>[link.dossierId,link]));
const candidates = new Map();
for(const [localId,registryV2CandidateId] of pairs){
  if(candidates.has(localId)) throw new Error('Alien_base v2: duplicate reviewed local ID '+localId);
  const dossier = dossiers.get(localId);
  const legacy = proposalByDossier.get(dossier?.id);
  if(!dossier || !legacy || legacy.status !== 'source-version-review-pending' || legacy.autoMergeStats !== false) {
    throw new Error('Alien_base v2: candidate lacks pending historical dossier for '+localId);
  }
  candidates.set(localId,Object.freeze({
    localId,
    reviewedDossierId:dossier.id,
    legacyMasterCandidateId:legacy.sharedEntityId,
    registryV2CandidateId,
    sourceCommit:ALIEN_BASE_V2_REVIEW_V180.sourceCommit,
    status:'pending-source-phenotype-review',
    identityApproved:false,
    visual1to1Certified:false,
    gameplayStatsImported:false
  }));
}
if(candidates.size!==ALIEN_BASE_V2_REVIEW_V180.matchedLocalIds) throw new Error('Alien_base v2 review count drift');
if(candidates.get('enemy-004-drone-big-chap')?.registryV2CandidateId!=='bio.xenomorph.big-chap'
  || candidates.get('enemy-004-drone-big-chap')?.legacyMasterCandidateId!=='caste.drone') {
  throw new Error('Alien_base v2: Big Chap phenotype review must stay explicit');
}
for(const item of noBinding) if(candidates.has(item.localId))throw new Error('Alien_base v2: missing binding was auto-admitted');
export function resolveAlienBaseV2CandidateV180(value) {
  const id = typeof value==='string' ? value : value && typeof value==='object' && !Array.isArray(value) ? value.id : null;
  return typeof id==='string'?candidates.get(id)||null:null;
}
export function auditAlienBaseV2ReviewV180(){
  return Object.freeze({
    sourceCommit:ALIEN_BASE_V2_REVIEW_V180.sourceCommit,
    matchedExactLocalIds:candidates.size,
    legacyDocumentaryGaps:Object.freeze([...documentaryGaps]),
    localBindingsMissingV2:Object.freeze(noBinding.map(r=>Object.freeze({...r}))),
    missingAfe2Profiles:Object.freeze([...missingAfe2]),
    approvedIdentityAliases:0,
    note:'Unmerged registry; documentary join by exact local ID only. No save, AI, stat or 1:1 promotion.'
  });
}
