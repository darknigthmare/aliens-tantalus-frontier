// Native campaign entry with the historical identifiers. Authored geometry
// uses the production compiler and its physical/topological validators.
import { ALIEN3_CAMPAIGN_ID_V88, ALIEN3_OPERATION_ID_V88, ALIEN3_ARCHIVE_WORLD_V88 } from './alien3-dlc-v88.js';
import { ALIEN3_FIORINA_TEMPLATE_V102 } from './alien3-dlc-v102.js';
import { buildMissionLevelV52 } from './mission-levels-v52.js';

export const FIORINA_CAMPAIGN_V114 = Object.freeze({
  id: ALIEN3_CAMPAIGN_ID_V88, specialOperationId: ALIEN3_OPERATION_ID_V88,
  name: 'MIRE · FIORINA 161', mode: 'SURVIVAL', worldId: 'world-05-lethe',
  year: 2179, canon: 'Reconstitution MIRE · adaptation partielle', routes: 4,
  source: 'Archives MIRE · Alien 3', templateId: ALIEN3_FIORINA_TEMPLATE_V102.id,
  archiveWorld: ALIEN3_ARCHIVE_WORLD_V88, archiveSolo: true, disableVehicle: true,
  objective: 'Survivre à Fiorina 161, piéger le Runner et sceller l’archive.',
  summary: 'Incarnez Ripley dans le complexe de Fiorina : enquête, galeries, piège au plomb et refus de la récupération corporative.',
  description: 'Reconstitution jouable encore partielle. Ripley agit seule avec les outils de la prison. Les lieux et scènes additionnels restent documentés séparément tant que leur parcours n’est pas construit.'
});

export const FIORINA_OPERATION_V114 = Object.freeze({
  id: ALIEN3_OPERATION_ID_V88, promisedTitle: FIORINA_CAMPAIGN_V114.name, kind: 'mission',
  productionOrder: 22, playable: true, implementationStatus: 'partial', canonExact: false,
  campaignId: FIORINA_CAMPAIGN_V114.id, campaign: FIORINA_CAMPAIGN_V114,
  archiveSolo: true, disableVehicle: true, promiseSummary: FIORINA_CAMPAIGN_V114.summary,
  requiredMechanics: Object.freeze(['single-runner-predator', 'no-firearms', 'physical-fiorina-routes', 'lead-and-water-trap', 'native-resume']),
  remainingMechanics: Object.freeze(['film-exact-geometry', 'traversable-inspection-annexes', 'complete-character-animation']),
  adaptationNotice: FIORINA_CAMPAIGN_V114.description
});

export const FIORINA_CUTS_V114 = Object.freeze([
  Object.freeze({ id: 'theatrical', label: 'Montage cinéma', detail: 'Hôte canin · progression cinéma' }),
  Object.freeze({ id: 'assembly', label: 'Assembly Cut', detail: 'Hôte bovin · séquence de Golic' })
]);
export const isFiorinaCampaignV114 = campaign => (typeof campaign === 'string' ? campaign : campaign?.id) === FIORINA_CAMPAIGN_V114.id;
export function fiorinaArchiveWorldV114(world = {}) {
  return { ...world, ...ALIEN3_ARCHIVE_WORLD_V88, id: world.id || FIORINA_CAMPAIGN_V114.worldId };
}
export function fiorinaCutForOperationV114(operation) {
  const saved = operation?.resumeState?.specialOperation?.alien3V114?.cut;
  return saved === 'assembly' || saved !== 'theatrical' && operation?.flags?.['alien3-assembly-cut'] === true ? 'assembly' : 'theatrical';
}

const FIORINA_SEED_V114 = Object.freeze({
  id: 'fiorina-161-archive', sourceSeedId: 'fiorina-161-archive', schemaVersion: 52,
  worldId: FIORINA_CAMPAIGN_V114.worldId, objective: FIORINA_CAMPAIGN_V114.objective,
  seed: 161114, width: 130, height: 40, hazards: Object.freeze(['steam', 'darkness'])
});
export function buildFiorinaMissionV114(options = {}) {
  const campaign = options.campaign || FIORINA_CAMPAIGN_V114;
  if (!isFiorinaCampaignV114(campaign)) throw new Error('Fiorina requires its own campaign identity.');
  return buildMissionLevelV52({ ...options, campaign, world: fiorinaArchiveWorldV114(options.world),
    templateId: ALIEN3_FIORINA_TEMPLATE_V102.id, levelSeed: FIORINA_SEED_V114 });
}

// Persist meaningful transitions, not per-frame presentation/director signals.
export function fiorinaPersistenceDueV114(event, campaignId) {
  return isFiorinaCampaignV114(campaignId) && typeof event?.type === 'string'
    && /^alien3-(?:v\d+-)?(?:phase|evidence|cache|flare|trap|company-refused|finale|codex-unlocked|cut|achievement|casualty|checkpoint|waste-trap|golic-release|golic-chain|fire-manifold|lead-prep|piston|prisoner-command|shutter|battery|final-transmission|checksum|resource)$/.test(event.type);
}
