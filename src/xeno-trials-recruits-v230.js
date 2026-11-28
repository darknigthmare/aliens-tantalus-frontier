import { XENO_TRIALS_RESEARCH_V210, getXenoTrialsResearchArtV210, getXenoTrialsResearchFighterV210 } from './xeno-trials-research-v210.js';

const approved = [
  ['BIGCHAP', 'mire-v209-bigchap', 'dedicated-pose', 'hive'],
  ['SCORCHED', 'mire-v210-scorched', 'original-mire-model', 'pursuit', 'Scorched · étude MIRE', 'Scorched · MIRE study'],
  ['DEACON', 'mire-v209-deacon', 'reference-adaptation', 'pursuit'],
  ['NEOMORPH', 'mire-v209-neomorph', 'reference-adaptation', 'pursuit'],
  ['PREDALIEN-AVPR', 'mire-v210-predalien-avpr', 'original-mire-model', 'hive'],
  ['PRAETORIAN', 'mire-v209-praetorian', 'comparison-model', 'containment', 'Praetorian · comparaison MIRE', 'Praetorian · MIRE comparison'],
  ['PRAETORIAN-AVP', 'mire-v210-praetorian-avp', 'original-mire-model', 'containment', 'Praetorian · AvP Classic 2000', 'Praetorian · AvP Classic 2000'],
  ['PRAETORIAN-AFE', 'mire-v210-praetorian-afe', 'original-mire-model', 'containment'],
  ['PRAETORIAN-AFE2', 'mire-v210-praetorian-afe2', 'original-mire-model', 'containment'],
  ['SIX', 'mire-v209-six', 'lineage-model', 'pursuit', 'Lignée Specimen Six · modèle MIRE', 'Specimen Six lineage · MIRE model'],
  ['SIREN', 'mire-v210-siren', 'original-mire-model', 'hive'],
  ['STRIKER', 'mire-v210-striker', 'original-mire-model', 'containment', 'Striker · modèle MIRE', 'Striker · MIRE model'],
  ['BLIGHT', 'mire-v209-blight', 'reference-adaptation', 'rival-lab']
];
const dossiers = new Map(XENO_TRIALS_RESEARCH_V210
  .flatMap(dossier => [dossier, ...(dossier.editions || [])]).map(dossier => [dossier.id, dossier]));
const sheetSizes = new Map([
  ['/assets/openai/sprites/normalized/enemy-profiles-v66/enemy-004-drone-big-chap.webp', [1024, 2048]],
  ['/assets/openai/sprites/normalized/enemies/xenomorph-praetorian-action-sheet.png', [1024, 1024]],
  ['/assets/openai/sprites/normalized/enemies/specimen-six-line-action-sheet-v56.png', [1024, 1024]],
  ['/assets/openai/xeno-trials-v210/research/specimen-plates.png', [1536, 1024]],
  ['/assets/openai/xeno-trials-v210/research/guard-plates.png', [1261, 1247]]
]);

const recruitsById = new Map(approved.map(([dossierId, fighterId, modelKind, factionId, label, labelEn]) => {
  const dossier = dossiers.get(dossierId);
  const fighter = getXenoTrialsResearchFighterV210(fighterId);
  const art = getXenoTrialsResearchArtV210(fighterId);
  if (dossier?.kind !== 'duel' || dossier.fighterId !== fighterId || !fighter || !art?.path || art.profileId !== fighter.profileId)
    throw new Error(`MIRE recruit requires the admitted dossier and model: ${fighterId}`);
  const [width, height] = sheetSizes.get(art.path) || [art.sourceWidth, art.sourceHeight];
  const preview = Object.freeze({ path: art.path, width, height, rect: art.sourceRectV209 || Object.freeze([0, 0, width, height]) });
  return [fighterId, Object.freeze({ fighterId, dossierId, fighter, dossier, art, modelKind, factionId, preview,
    label: label ?? fighter.label, labelEn: labelEn ?? fighter.label, authorization: 'mire-simulation' })];
}));

export const XENO_TRIALS_RECRUITS_V230 = Object.freeze([...recruitsById.values()].map(recruit => recruit.fighter));
export const getXenoTrialsRecruitV230 = fighterId => recruitsById.get(fighterId) ?? null;

const romulusReference = 'https://www.motionpictures.org/2024/08/alien-romulus-images-reveal-last-look-at-the-legendary-xenomorph-cinemas-gnarliest-monster/';
export const XENO_TRIALS_RECRUIT_PROPOSALS_V230 = Object.freeze([
  ['andy', 'Andy', 'synthetic', 'Alien: Romulus (2024)', 'Protection rapprochée et ripostes courtes.', 'Close protection and quick counters.', romulusReference],
  ['bishop', 'Bishop', 'synthetic', 'Aliens (1986)', 'Défense et couverture pendant une extraction.', 'Defense and cover during an extraction.', 'https://catalog.afi.com/Film/68347-ALIENS'],
  ['ash', 'Ash', 'synthetic', 'Alien (1979)', 'Feintes, garde et pression rapprochée.', 'Feints, guarding and close-range pressure.', 'https://www.bfi.org.uk/lists/10-great-robot-films'],
  ['walter', 'Walter', 'synthetic', 'Alien: Covenant (2017)', 'Interception et protection à courte portée.', 'Interception and protection at close range.', 'https://www.bfi.org.uk/interviews/ridley-scott-alien-covenant-michael-fassbender'],
  ['call', 'Annalee Call', 'synthetic', 'Alien Resurrection (1997)', 'Intervention technique et retraits rapides.', 'Technical support and quick disengagements.', 'https://www.20thcenturystudios.com/movies/alien-resurrection'],
  ['rain', 'Rain Carradine', 'human', 'Alien: Romulus (2024)', 'Déplacements agiles et gestion de la distance.', 'Agile movement and spacing.', romulusReference],
  ['ellen-ripley', 'Ellen Ripley', 'human', 'Alien (1979)', 'Survie, contrôle de la distance et repli.', 'Survival, spacing and retreat.', 'https://www.20thcenturystudios.com/movies/alien']
].map(([id, label, family, source, proposal, proposalEn, sourceUrl]) =>
  Object.freeze({ id, label, family, source, proposal, proposalEn, sourceUrl })));
