import { WORLDS, ENEMIES } from './content-core-v50.js';
import { ENEMY_STATIC_POSES_V96 as ENEMY_USER_CASTES_V87, getEnemyStaticPoseV96 as getEnemyUserCasteV87, sanitizeEnemyStaticPoseStateV96 as sanitizeEnemyStaticPoseStateV95 } from './enemy-static-poses-v96.js';
import { ENEMY_STATIC_POSE_IDS_V94 } from './enemy-static-poses-v94.js';
import { getLegacyEnemyAlteredLabelV87 } from './enemy-user-castes-v87.js';

// Gameplay encounter assignments, not claims that every crossover happened in canon.
// Source-specific variants stay separate. Project worlds host displaced arcade/crossover dossiers.
const WORLD_GROUPS = Object.freeze({
  nostromo: [15], fiorina: [3], acheron: [1], engineer: [2],
  avp2: [20], avp2010: [21], colonial: [1, 16], fireteam: [6, 7],
  pathogen: [6, 29], frontierPathogen: [29], crossover: [26], engineered: [32], cetoAquatic: [10]
});
const LEGACY_POSE_IDS_V95 = new Set(ENEMY_STATIC_POSE_IDS_V94);
const REGISTERED_POSE_IDS_V95 = new Set(ENEMY_USER_CASTES_V87.map(definition => definition.id));
/** New references require explicit admission; no inferred name/family fallback. */
export function isUserCasteCampaignAdmittedV95(d) {
  return Boolean(d && REGISTERED_POSE_IDS_V95.has(d.id) && (LEGACY_POSE_IDS_V95.has(d.id) || (d.automaticEncounter === true
    && Object.hasOwn(WORLD_GROUPS, d.encounterGroup)
    && ['ground', 'flying', 'aquatic'].includes(d.locomotion)
    && (d.locomotion !== 'aquatic' || d.encounterGroup === 'cetoAquatic'))));
}
const assignment = (d) => {
  if (Object.hasOwn(WORLD_GROUPS, d.encounterGroup)) return d.encounterGroup;
  if (!LEGACY_POSE_IDS_V95.has(d.id)) return null;
  const b = d.basename;
  if (/^film_(chestburster_alien_|facehugger_alien_)/.test(b)) return 'nostromo';
  if (/^film_(runner|queen_chestburster)/.test(b)) return 'fiorina';
  if (/^film_(ovomorphe|queen_aliens|warrior)/.test(b)) return 'acheron';
  if (b === 'film_deacon_2012') return 'engineer';
  if (b === 'film_neomorph_2017') return 'frontierPathogen';
  if (b === 'game_predalien_avp2_primal_hunt') return 'avp2';
  if (b === 'game_abomination_avp2010') return 'avp2010';
  if (b.startsWith('game_acm_')) return 'colonial';
  if (d.group === 'Pathogen') return 'pathogen';
  if (b.startsWith('game_afe_')) return 'fireteam';
  if (/xenoborg|avp_extinction/.test(b)) return 'engineered';
  return 'crossover';
};
const caste = (d) => d.visualRevision === 103 ? d.caste : d.combatRole === 'idle' ? 'egg' : /chestburster|juvenile/.test(d.basename) ? 'juvenile'
  : /facehugger/.test(d.basename) ? 'parasite' : /queen_aliens|pathogen_queen/.test(d.basename) ? 'royal'
    : d.combatRole === 'ranged' ? 'ranged' : 'stalker';

// Source-grounded partial behaviours, with explicitly project-authored 2D tuning.
// No anatomy/animation claim and no change to the contextual encounter budget.
export const USER_CASTE_BEHAVIORS_V89 = Object.freeze({
  game_afe_burster: Object.freeze({ kind: 'acid-burst', label: 'Explosion acide', windup: .65, cooldown: 1.4,
    summary: 'Prépare une explosion de proximité unique ; le tuer avant la fin interrompt cette attaque.',
    range: 105, radius: 150, damageScale: 1.35,
    source: 'https://www.aliensfireteamelite.com/en/releasenotes/' }),
  game_pathogen_blight: Object.freeze({ kind: 'timed-acid', label: 'Projectile acide temporisé', windup: .55, cooldown: 2.4,
    summary: 'Projette un globule temporisé destructible par balle, puis laisse une flaque acide temporaire.',
    range: 540, radius: 110, damageScale: .8, fuse: 1.05, poolLife: 2.4,
    source: 'https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/' }),
  game_pathogen_brute: Object.freeze({ kind: 'ground-slam', label: 'Frappe au sol', windup: .85, cooldown: 1.8,
    summary: 'Annonce une frappe de zone au sol ; sauter ou se placer derrière un obstacle permet de l’éviter.',
    range: 175, radius: 210, damageScale: 1.1,
    source: 'https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/' })
});

// V90 stays separate: older partial contracts and save identities do not change.
export const USER_CASTE_BEHAVIORS_V90 = Object.freeze({
  game_pathogen_queen: Object.freeze({ kind: 'cluster-acid', label: 'Salve acide', windup: .9, cooldown: 2.8,
    summary: 'Annonce une salve de trois projectiles acides dirigés vers une zone verrouillée ; aucun nouveau tir après sa neutralisation.',
    range: 850, radius: 72, damageScale: .45, fuse: 1.05, preferredRange: 340,
    clusterOffsets: Object.freeze([-68, 0, 68]),
    source: 'https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/' }),
  game_pathogen_runner: Object.freeze({ kind: 'erratic-stalk', label: 'Approche irrégulière', windup: .35, cooldown: .85,
    summary: 'Avance par changements de rythme et brèves pauses, à une allure réduite ; conserve une attaque de proximité annoncée.',
    range: 86, radius: 92, damageScale: 1,
    strideScales: Object.freeze([.35, .85, 0, .65]), strideDurations: Object.freeze([.2, .45, .2, .45]),
    source: 'https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/' })
});

export const ENEMY_USER_CAMPAIGN_V88 = Object.freeze(ENEMY_USER_CASTES_V87.map(d => {
  const admitted = isUserCasteCampaignAdmittedV95(d);
  const encounterGroup = assignment(d), worlds = admitted ? WORLD_GROUPS[encounterGroup].map(index => WORLDS[index - 1]) : [];
  const behavior = USER_CASTE_BEHAVIORS_V89[d.basename];
  const behaviorV90 = USER_CASTE_BEHAVIORS_V90[d.basename];
  return Object.freeze({ ...d, name: `${d.name} — ${d.work}`, source: d.work, caste: caste(d),
    modifier: 'Standard', behavior: d.combatRole === 'ranged' ? 'control' : ['idle', 'defensive-melee'].includes(d.combatRole) ? 'guard' : 'stalk',
    frequency: 'contextual', acid: 0, automaticEncounter: admitted, encounterGroup,
    encounterWorldIds: Object.freeze(worlds.map(world => world.id)),
    habitats: Object.freeze(worlds.map(world => world.name)),
    encounterStatus: admitted ? 'project-adaptation' : 'bioforge-only', encounterNote: admitted
      ? 'Rencontre adaptée au projet ; ne constitue pas une affirmation de continuité canonique.'
      : 'Référence admise au laboratoire ; aucun placement de campagne compatible validé.',
    specializedBehaviorStatus: d.specializedBehaviorV95 ? 'source-grounded-partial-v95' : behaviorV90 ? 'source-grounded-partial-v90' : behavior ? 'source-grounded-partial-v89' : 'simplified-campaign-behavior',
    behaviorContractV90: behaviorV90 || null,
    specializedBehaviorV90: behaviorV90 ? Object.freeze({ id: behaviorV90.kind, label: behaviorV90.label, summary: behaviorV90.summary,
      sourceUrls: Object.freeze([behaviorV90.source]),
      adaptationNote: 'Adaptation 2D partielle : cadence, trajectoires, projectiles neutralisables, annonce de proximité et dégâts réglés pour le projet. Salve seulement pour la Reine, sans armure destructible ni nouveau modèle. Pose fixe, animations manquantes ; aucune fidélité canonique intégrale revendiquée.' }) : null,
    behaviorContractV89: behavior || null,
    specializedBehaviorV89: behavior ? Object.freeze({ id: behavior.kind, label: behavior.label, summary: behavior.summary,
      sourceUrls: Object.freeze([behavior.source]),
      adaptationNote: 'Adaptation 2D partielle : annonces, portées, dégâts et interruptions réglés pour le projet. Pose fixe, animations manquantes ; aucune fidélité canonique intégrale revendiquée.' }) : null
  });
}));
const BY_ID = new Map(ENEMY_USER_CAMPAIGN_V88.map(d => [d.id, d]));
export function getEnemyUserCampaignV88(id) { return BY_ID.get(id) || null; }
export const ENEMY_ENCYCLOPEDIA_CATALOG_V88 = Object.freeze([
  ...ENEMIES.map(d => Object.freeze({ ...d, name: getLegacyEnemyAlteredLabelV87(d.id, d.name) })),
  ...ENEMY_USER_CAMPAIGN_V88
]);
export const USER_CASTE_MISSION_QUOTA_V88 = 2;

/** Rotating, deterministic two-contact budget; never a global random-pool expansion. */
export function selectUserCasteEncountersV88(options = {}) {
  if (!options.world?.id || options.editorProject || options.specialOperationId || options.provingGround
    || options.campaign?.nativeEncountersV88 === false || /tutorial|prologue|simulation|bioforge|survival|alpha.bravo/i.test(`${options.campaign?.mode || ''} ${options.campaign?.id || ''}`)) return [];
  const eligible = ENEMY_USER_CAMPAIGN_V88.filter(d => isUserCasteCampaignAdmittedV95(d) && d.encounterWorldIds.includes(options.world.id));
  if (!eligible.length) return [];
  const operationOrdinal = Number(String(options.operationId || '').match(/^operation-(\d+)-/)?.[1]) || 0;
  const seed = Math.abs(Math.trunc(Number(options.levelSeed?.seed ?? options.seed) || 0)) + operationOrdinal;
  const start = seed % eligible.length;
  const selected = [];
  for (let i = 0; i < eligible.length && selected.length < USER_CASTE_MISSION_QUOTA_V88; i++) {
    const entry = eligible[(start + i) % eligible.length];
    if (entry.caste === 'royal' && selected.some(d => d.caste === 'royal')) continue;
    selected.push(entry);
  }
  return selected;
}

/** Save only whitelisted identities and placement receipts, never imported combat stats. */
export function sanitizeUserCasteCampaignV88(raw) {
  if (!raw || raw.schema !== 88 || typeof raw.worldId !== 'string') return null;
  const seen = new Set();
  const entries = (Array.isArray(raw.entries) ? raw.entries : []).slice(0, 2).flatMap(entry => {
    const d = getEnemyUserCampaignV88(entry?.profileId);
    if (!isUserCasteCampaignAdmittedV95(d) || !d.encounterWorldIds.includes(raw.worldId) || seen.has(d.id)
      || !Number.isInteger(entry.slot) || entry.slot < 0 || entry.slot > 199) return [];
    seen.add(d.id);
    const visualStateV95 = sanitizeEnemyStaticPoseStateV95(d.id, entry.visualStateV95);
    return [{ profileId: d.id, slot: entry.slot, ...(visualStateV95 ? { visualStateV95 } : {}) }];
  });
  return { schema: 88, worldId: raw.worldId.slice(0, 120), entries };
}

export function userCasteStaticVisualV88(id, stateId = null) {
  const d = getEnemyUserCasteV87(id, stateId);
  if (!d) return null;
  return Object.freeze({ sheetId: null, imageKey: d.imageKey, path: d.path,
    grid: Object.freeze({ columns: 1, rows: 1, cellWidth: d.sourceWidth, cellHeight: d.sourceHeight }),
    idleClip: Object.freeze({ sheetId: null, clip: Object.freeze({ id: 'static-pose', frames: Object.freeze([0]), fps: 0, loop: false }) }),
    previewClips: Object.freeze([]), renderWidth: d.renderWidth, renderHeight: d.renderHeight,
    archetype: d.name, visualMode: 'static-pose', animationStatus: 'missing',
    identity: Object.freeze({ status: d.identityStatus, referenceStatus: d.assetVerificationStatus,
      exact: false, canonExact: false, approximate: false, fallbackReason: null })
  });
}
