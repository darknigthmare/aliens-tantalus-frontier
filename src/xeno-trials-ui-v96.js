import { getXenoTrialsRecruitV230 } from './xeno-trials-recruits-v230.js';
import { XENO_TRIALS_RESEARCH_LABS_V209 } from './xeno-trials-research-lab-v209.js';
import { createXenoTrialsResearchLabRuntimeV209 } from './xeno-trials-research-lab-ui-v209.js';
import { normalizeXenoTrialsSandboxV208, XENO_TRIALS_SANDBOX_BEHAVIORS_V208, XENO_TRIALS_SANDBOX_ID_V208 } from './xeno-trials-practice-v208.js';
import { getXenoTrialsPracticeConfigV207, XENO_TRIALS_PRACTICE_DRILLS_V226 } from './xeno-trials-practice-v207.js';
import { usesXenoTrialsIndependentProps } from './xeno-trials-franchise-stage-scenes-v192.js';
import { renderArbiterTerminalDossierV190 } from './xeno-arbiter-ui-v190.js';
import { ARBITER_PROGRAMS_V191, ARBITER_HORDE_PROTOCOLS_V191, getArbiterProgramV191 } from './xeno-arbiter-protocols-v191.js';
import { getXenoTrialsArchiveAccessV207 } from './xeno-trials-archive-access-v207.js';
import { XENO_TRIALS_RESEARCH_V210, XENO_TRIALS_RESEARCH_FIGHTERS_V210, getXenoTrialsResearchEvaluationV210 } from './xeno-trials-research-v210.js';
import { createXenoTrialsSelectionMotionV230, getXenoTrialsSelectionVisualV230 } from './xeno-trials-selection-motion-v230.js';
import { getXenoTrialsPresentationPlateV230 } from './xeno-trials-presentation-art-v230.js';
import { currentLanguageV185 } from './i18n-v185.js';
import { getXenoTrialsRigV154 } from './xeno-trials-rig-v154.js';
import { getXenoTrialsSequenceV155 } from './xeno-trials-sequences-v155.js';
import { hasXenoTrialsGrappleV153 } from './xeno-trials-grapple-v153.js';
import { getXenoTrialsGroundGrabPairV212 } from './xeno-trials-grapple-v212.js';
import { getXenoTrialsSuperV148, getXenoTrialsSuperReadinessV148, getXenoTrialsSuperStatusV148 } from './xeno-trials-supers-v148.js';
import { getXenoTrialsSignatureV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsAlternateSignatureV208 } from './xeno-trials-signature-kit-v208.js';
import { getXenoTrialsParryViewV208 } from './xeno-trials-defense-v208.js';
import { hasXenoTrialsGroundTraversalV208 } from './xeno-trials-moveset-v207.js';
import { getXenoTrialsGroundRecoveryHintV218 } from './xeno-trials-defense-v211.js';
import { getXenoTrialsRiposteV208, getXenoTrialsRiposteReadinessV208, getXenoTrialsRiposteStatusV208 } from './xeno-trials-ripostes-v208.js';
import { XENO_TRIALS_FIGHTERS_V96 as FIGHTERS, XENO_TRIALS_FACTIONS_V96 as FACTIONS,
  XENO_TRIALS_STAGES_V96 as STAGES, getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { normalizeXenoTrialsProgressV96, getXenoTrialsUnlockCostV96,
  beginXenoTrialsV96, settleXenoTrialsV96, abandonXenoTrialsV96, unlockXenoTrialsFighterV96, renewXenoTrialsContractsV119,
  checkpointXenoTrialsV186, clearXenoTrialsCheckpointV186,
  checkpointXenoTrialsDuelV197, clearXenoTrialsDuelCheckpointV197, completeXenoTrialsPracticeV207, configureXenoTrialsSandboxV208, saveXenoTrialsRecordingV209, completeXenoTrialsResearchLabV209 } from './xeno-trials-progress-v96.js';
import { createXenoTrialsRuntimeV96, XENO_TRIALS_TOUCH_ZONES_V217 } from './xeno-trials-runtime-v96.js';
import { getXenoTrialsFinisherCopyV208 } from './xeno-trials-finishers-v208.js';
import { filterXenoTrialsRosterV97, XENO_TRIALS_SELECTION_FAMILIES_V119 as FAMILIES,
  getXenoTrialsOpponentCandidatesV119, getXenoTrialsSelectionFamilyV119 } from './xeno-trials-selection-v97.js';
import { XENO_TRIALS_BRANCHES_V119 as BRANCHES, XENO_TRIALS_CAMPAIGN_V119 as CAMPAIGN,
  XENO_TRIALS_CHALLENGES_V119 as CHALLENGES, getXenoTrialsContractsV119, isXenoTrialsMissionOpenV119,
  resolveXenoTrialsActivityV119, getXenoTrialsRuleTextV119 } from './xeno-trials-modes-v119.js';
import { renderEnemyImportPreviewV103 } from './enemy-import-admissions-v103.js';
import { getXenoTrialsMenuTileV222 } from './xeno-trials-menu-media-v222.js';
import { getXenoTrialsOfflineDuelKeyV224, getXenoTrialsOfflineDuelV223 } from './xeno-trials-offline-v223.js';
import { getEnemyImportAnimationV107 } from './enemy-import-animation-v107.js';
import { getEnemyImportAttackV109 } from './enemy-import-attacks-v109.js';
import { getXenoTrialsRuntimeAnimationCoverage } from './xeno-trials-animation-coverage-v199.js';
import { getXenoTrialsRuntimeActionAtlases } from './xeno-trials-action-atlas-v199.js';
import { getXenoTrialsRosterPageV179, getXenoTrialsRosterProfileV179, groupXenoTrialsRosterV227 } from './xeno-trials-roster-v179.js';
import { getXenoTrialsSimulationPowerV227 } from './xeno-trials-power-v227.js';
import { XENO_TRIALS_HORDE_BOARD_V213 as HORDE_PROTOCOLS } from './xeno-trials-horde-v180.js';
import { XENO_TRIALS_OPERATION_BOARD_V213 as OPERATIONS } from './xeno-trials-operations-v188.js';
import { getXenoTrialsOperationBriefingV188, getXenoTrialsOperationHudV188 } from './xeno-trials-operation-presentation-v188.js';
import { getXenoTrialsProgramPageV186 } from './xeno-trials-programs-v186.js';
import { getXenoTrialsHordeBriefingV180, getXenoTrialsHordeViewV180, isXenoTrialsHordeActivityV180 } from './xeno-trials-horde-ui-v180.js';

const fighterLabelV230 = fighter => {
  const recruit = getXenoTrialsRecruitV230(fighter?.id);
  return recruit ? currentLanguageV185() === 'en' ? recruit.labelEn : recruit.label : fighter?.label || '';
};
const options = entries => entries.map(e => `<option value="${e.id}">${fighterLabelV230(e)}</option>`).join('');

// Native rectangular viewport over the admitted whole image. Atlas crops do
// not edit pixels and the offline menu never substitutes a different identity.
export function getXenoTrialsRecruitPreviewV230(id) {
  const recruit = getXenoTrialsRecruitV230(id);
  if (!recruit) return null;
  const { path, width, height, rect } = recruit.preview;
  return `<svg xmlns="http://www.w3.org/2000/svg" data-xt-recruit-preview="${id}" aria-hidden="true" viewBox="${rect.join(' ')}" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;overflow:hidden;pointer-events:none"><image href="${path}" width="${width}" height="${height}"/></svg>`;
}
const requestedRulesV119 = value => ({ 'no-special': { noSpecial: true }, 'one-hp': { initialHp: 1 },
  'thirty-seconds': { timeLimitSeconds: 30 } }[value] || {});
const roleLabel = { balanced: 'Polyvalent', agile: 'Mobile', tank: 'Défensif', ranged: 'Distance' };
const drawnActionLabels = { super: 'Super dessiné', 'air-combat': 'Frappes aériennes dessinées', 'ground-special': 'Spéciale dessinée' };
const isOutroPlaying = state => ['offered', 'playing'].includes(state?.finisherV207?.phase)
  || [state?.outroV155, state?.terminalV156, state?.exitV157, state?.landingV157].some(sequence => sequence?.phase === 'playing');
export const XENO_TRIALS_STAGE_MEDIA_V192 = Object.freeze([
  ['all', 'Tous les supports'], ['film', 'Films'], ['series', 'Série'], ['game', 'Jeux vidéo'],
  ['comic', 'Comics'], ['novel', 'Romans'], ['simulation', 'Simulations Tantalus']
].map(([id, label]) => Object.freeze({ id, label })));

/** The filter and page are transient presentation state; neither selects an
 * arena nor rewrites a saved or activity-owned configuration. */
export function getXenoTrialsStagePageV192(stages, { media = 'all', page = 0, selectedId = null,
  revealSelected = false, assignedStageId = null } = {}) {
  const assigned = assignedStageId && stages.find(stage => stage.id === assignedStageId);
  const entries = assigned ? [assigned] : stages.filter(stage => media === 'all'
    || (stage.media || 'simulation') === media);
  const pageSize = 12, pages = Math.max(1, Math.ceil(entries.length / pageSize));
  let current = Math.max(0, Math.min(pages - 1, Number.isFinite(page) ? Math.floor(page) : 0));
  const selectedIndex = entries.findIndex(stage => stage.id === selectedId);
  if (revealSelected && selectedIndex >= 0) current = Math.floor(selectedIndex / pageSize);
  return Object.freeze({ media, page: current, pages, pageSize, total: entries.length,
    start: entries.length ? current * pageSize + 1 : 0, end: Math.min(entries.length, (current + 1) * pageSize),
    selectedVisible: selectedIndex >= current * pageSize && selectedIndex < (current + 1) * pageSize,
    stages: Object.freeze(entries.slice(current * pageSize, (current + 1) * pageSize)) });
}

/** A viewport, not an edited thumbnail: only the first admitted image plane
 * is visible, including atlases whose three bands have unequal integer heights. */
export function getXenoTrialsStagePreviewCropV192(stage) {
  const revision = stage?.stageRevision;
  const atlas = (revision === 192 || revision === 193 || usesXenoTrialsIndependentProps(revision)) && stage.atlasV192;
  if (!atlas || !Number.isInteger(atlas.width) || !Number.isInteger(atlas.height)
    || atlas.width <= 0 || atlas.height < 3) return null;
  const crop = atlas.sourceRects?.[0] || [0, 0, atlas.width, Math.floor(atlas.height / 3)];
  if (!Array.isArray(crop) || crop.length !== 4 || !crop.every(Number.isInteger)
    || crop[0] < 0 || crop[1] < 0 || crop[2] <= 0 || crop[3] <= 0
    || crop[0] + crop[2] > atlas.width || crop[1] + crop[3] > atlas.height) return null;
  return Object.freeze([...crop]);
}

const stageMediaLabelV192 = stage => XENO_TRIALS_STAGE_MEDIA_V192.find(entry => entry.id === (stage?.media || 'simulation'))?.label || 'Simulations Tantalus';
function menuTileV222(kind, id, variant = null, label = '') {
  const tile = getXenoTrialsMenuTileV222(kind, id, variant);
  if (!tile) return '';
  const x = tile.x * 100 / Math.max(1, tile.columns - 1);
  const y = tile.y * 100 / Math.max(1, tile.rows - 1);
  const aria = label ? `role="img" aria-label="${escapeHtml(label)}"` : 'aria-hidden="true"';
  return `<span class="xt-local-preview-v222" ${aria}><b style="--xt-menu-ratio:${tile.width / tile.height};background-image:url('${tile.path}');background-size:${tile.columns * 100}% ${tile.rows * 100}%;background-position:${x}% ${y}%"></b></span>`;
}
const stagePreviewImageV192 = (stage, alt = '', compact = false) => {
  if (!stage.backdrop) return '<i></i><i></i><i></i>';
  if (compact) return menuTileV222('stage', stage.id, null, alt) || '<i></i><i></i><i></i>';
  const crop = getXenoTrialsStagePreviewCropV192(stage);
  if (!crop) return `<img src="${escapeHtml(stage.backdrop)}" alt="${escapeHtml(alt)}" loading="lazy">`;
  const props = alt && usesXenoTrialsIndependentProps(stage.stageRevision) && stage.propsV194;
  const propsImage = props ? `<image href="${escapeHtml(props.path)}" x="${crop[0]}" y="${crop[1]}" width="${crop[2]}" height="${crop[3]}" preserveAspectRatio="xMidYMax meet"/>` : '';
  return `<svg class="xt-stage-image-v192" viewBox="${crop.join(' ')}" preserveAspectRatio="xMidYMid slice" focusable="false" ${alt ? `role="img" aria-label="${escapeHtml(alt)}"` : 'aria-hidden="true"'}><image href="${escapeHtml(stage.backdrop)}" width="${stage.atlasV192.width}" height="${stage.atlasV192.height}"/>${propsImage}</svg>`;
};
export const XENO_TRIALS_SPECIAL_LABELS_V96 = Object.freeze({
  tail: 'Fouet caudal', pounce: 'Bond', ram: 'Charge', slash: 'Lacération', acid: 'Salve acide',
  pulse: 'Impulsion', baton: 'Frappe de matraque', flame: 'Lance-flammes',
  detonation: 'Détonation', shield: 'Bouclier', dash: 'Ruée'
});
// Keep future roster additions readable without exposing an undefined label.
export const getXenoTrialsSpecialLabelV96 = special => Object.hasOwn(XENO_TRIALS_SPECIAL_LABELS_V96, special)
  ? XENO_TRIALS_SPECIAL_LABELS_V96[special] : 'Attaque spéciale';
export const getXenoTrialsFighterSpecialLabelV147 = fighter => getXenoTrialsSignatureV147(fighter)?.label
  || getXenoTrialsSpecialLabelV96(fighter?.special);
const controlLabel = { left: 'Aller à gauche', right: 'Aller à droite', jump: 'Sauter', guard: 'Maintenir la garde',
  light: 'Frappe rapide', heavy: 'Frappe lourde', special: 'Attaque spéciale', super: 'Super chargé',
  interact: 'Maintenir pour interagir avec l’objectif', crouch: 'S’accroupir', evade: 'Esquiver', antiAir: 'Frappe anti-aérienne',
  parry: 'Parer au dernier moment', signature2: 'Deuxième signature', signature3: 'Troisième signature' };
const moveHint = 'C maintenu pour s’accroupir · C + J pour frapper bas · Maj + direction pour esquiver · J en esquive avant pour avancer en frappant · U pour contrer un saut.';
const movePadHint = 'Manette · Stick gauche vers le bas pour s’accroupir · R3 pour esquiver · Stick droit vers le haut pour contrer un saut.';
const parryHint = 'V pour parer au contact · C + V contre une frappe basse · Après une parade, Garde + Super pour riposter avec un spécimen compatible et la jauge pleine.';
const techniqueHint = 'H / O pour les signatures disponibles · Manette · Stick droit vers le bas pour parer, gauche / droite pour les signatures.';
const signatureControls = [['signature2', 'signature-2', 'H'], ['signature3', 'signature-3', 'O']];
const localizedTechnique = (entry, field) => currentLanguageV185() === 'en' ? entry[field + 'En'] ?? entry[field] : entry[field];
const techniqueNote = (entry, keys) => entry
  ? `<small data-xt-technique="${entry.id}"><b>${keys} · ${escapeHtml(localizedTechnique(entry, 'label'))}</b> — ${escapeHtml(localizedTechnique(entry, 'description'))}</small>`
  : '';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const hordeStatsV180 = view => view ? `<dl class="xt-horde-briefing-grid"><div><dt>VAGUES</dt><dd>${view.waves || '—'}</dd></div><div><dt>POPULATION</dt><dd>${view.total || '—'}</dd></div><div><dt>PV PAR CONTACT</dt><dd>${view.minimum && view.maximum ? `${view.minimum}–${view.maximum}` : '—'}</dd></div><div><dt>SIMULTANÉS MAX.</dt><dd>${view.simultaneous || '—'}</dd></div></dl>` : '';
const combatBriefingV188 = activity => getXenoTrialsOperationBriefingV188(activity) || getXenoTrialsHordeBriefingV180(activity);
const activityBranchV179 = branch => branch === 'events' ? 'challenges' : branch;
const challengeBranchV179 = id => CHALLENGES.find(entry => entry.id === id)?.eventV179 ? 'events' : 'challenges';
const ARCHIVE_BRANCH_V191 = 'arbiter-archives';
const TERMINAL_BRANCHES_V191 = Object.freeze([...BRANCHES, Object.freeze({ id: ARCHIVE_BRANCH_V191, label: 'ARCHIVES ARBITER',
  description: '20 hordes et 20 opérations issues de la copie isolée AB-40. Les six retours de l’enquête ouvrent ces dossiers.' }),
  Object.freeze({ id: 'practice', label: 'ATELIERS DE SIMULATION',
    description: 'Entraînez-vous aux contacts, à la garde et aux techniques spéciales sur les bancs d’essai MIRE.' })]);
const activityBranchV191 = (branch, id) => branch === ARCHIVE_BRANCH_V191 ? getArbiterProgramV191(id)?.branch : activityBranchV179(branch);
const RESULT_RETRY_DELAY_MS = 500;

/** UI owns no campaign money and never writes outside its current save owner. */
export class XenoTrialsUiV96 {
  constructor({ root, getProgress, onCommit, canCommit, onReturn, audioDirector = null, getCampaignProgress = () => null,
    onOpenArbiterDossier = null, standaloneV207 = false, offlineDuels = null, getReducedMotion = () => false }) {
    Object.assign(this, { root, getProgress, onCommit, canCommit, onReturn, audioDirector, getCampaignProgress, onOpenArbiterDossier,
      standaloneV207, offlineDuels, getReducedMotion });
    this.selectionMotionV230 = createXenoTrialsSelectionMotionV230({ document: root.ownerDocument, getReducedMotion,
      getPlate: getXenoTrialsPresentationPlateV230 });
    this.offlineSelectionV223 = null;
    this.offlinePreparationsV224 = new Map();
    this.offlineLibraryMutationV224 = null;
    this.audioEnabledV189 = true;
    this.runtime = null; this.generation = 0; this.selected = 'warrior'; this.active = false;
    this.resultRetryTimer = null;
    this.selectionStep = 'home'; this.branchV119 = null; this.activityV119 = null;
    this.rosterPageV179 = 0; this.rosterSelectionV179 = null;
    this.rosterDrawerV227 = undefined; this.rosterDrawerPagesV227 = new Map();
    this.programPageV186 = 0;
    this.stagePageV192 = 0; this.stageSelectionV192 = null;
    root.innerHTML = `<div class="section-intro xt-terminal-header"><div class="xt-terminal-brand"><span class="xt-terminal-mark" aria-hidden="true">W<span>Y</span></span><div><p class="eyebrow">WEYLAND-YUTANI · DIVISION DES SYSTÈMES BIOLOGIQUES</p><h2>MIRE <span>/ XENO TRIALS</span></h2></div></div><button class="button" data-xt="return">QUITTER LE TERMINAL</button></div>
      <div class="xt-terminal-link"><span><i aria-hidden="true"></i> LIAISON TANTALUS ÉTABLIE</span><span>ÉVALUATION COMPARATIVE / MIRE</span><span>ACCÈS OPÉRATEUR</span></div>
      <p class="xt-notice">Simulation MIRE. Sélectionnez un programme, préparez votre spécimen puis engagez l’évaluation.</p>
      <div class="xt-dashboard" data-xt="progress"></div>
      <nav class="xt-steps" aria-label="Préparation du duel" data-xt="steps"></nav>
      <details class="xt-offline-library-v224" data-xt="offline-library" hidden>
        <summary>Duels hors connexion</summary>
        <p data-xt="offline-library-status" role="status" aria-live="polite"></p>
        <ul data-xt="offline-library-list"></ul>
      </details>
      <section class="xt-home-v119" data-xt="home"><details class="xt-arbiter-dossier-v190"><summary>DOSSIER ARBITER / AB-40</summary><div data-xt="arbiter-dossier"></div></details><div class="xt-terminal-hero"><div class="xt-terminal-intro"><p class="eyebrow">SYSTÈME MIRE / PROGRAMME D’ÉVALUATION</p><h1>XENO<br><span>TRIALS</span><small>ÉTUDE COMPARATIVE DES ESPÈCES</small></h1><p>Observez. Engagez. Survivez.<br>Chaque contact enrichit le dossier.</p><dl class="xt-terminal-spec"><div><dt>SPÉCIMENS ADMIS</dt><dd>${FIGHTERS.length}</dd></div><div><dt>ENVIRONNEMENTS</dt><dd>${STAGES.length}</dd></div><div><dt>PROTOCOLES HORDE</dt><dd>${HORDE_PROTOCOLS.length + ARBITER_HORDE_PROTOCOLS_V191.length}</dd></div></dl></div><div class="xt-containment-monitor"><div class="xt-monitor-heading"><span>OBSERVATION / 001</span><span>CONFINEMENT MIRE</span></div><div class="xt-monitor-specimen">${renderEnemyImportPreviewV103(getXenoTrialsArtV96('warrior'), 'Warrior — observation MIRE', 'clamp(210px, 34vh, 360px)') || `<img src="${getXenoTrialsArtV96('warrior').path}" alt="Warrior — observation MIRE">`}<span class="xt-monitor-reticle" aria-hidden="true"></span></div><div class="xt-monitor-caption"><span>WARRIOR<br><strong>XX121 / SUJET D’ÉTUDE</strong></span><span>OBSERVATION<br><strong>CONTACT VISUEL</strong></span></div></div></div><div data-xt="series-resume" class="xt-series-recovery" hidden><button type="button" class="button primary" data-xt="resume-series">POURSUIVRE LA SÉRIE EN COURS</button><button type="button" class="button danger-outline" data-xt="abandon-series">ABANDONNER LA SÉRIE · SANS PRIME</button></div><div class="xt-program-heading"><span>RÉPERTOIRE DES PROGRAMMES</span><span>SÉLECTIONNEZ UNE LIGNE POUR CONTINUER</span></div><div class="xt-branches-v119" data-xt="branches"></div><div class="xt-terminal-foot"><span>MIRE / INTERFACE D’ÉVALUATION</span><span>WEYLAND-YUTANI · BUILDING BETTER WORLDS</span></div></section>
      <section data-xt="activities" class="xt-activities-v119" hidden><div class="xt-activity-heading"><button type="button" class="button" data-xt="home-return">← PROGRAMME</button><h2><span data-xt="branch-title"></span></h2><button type="button" class="button" data-xt="renew-contracts" hidden>RENOUVELER LES CONTRATS</button></div><div class="xt-program-tools-v186" data-xt="program-tools"><label data-xt="program-filter-label">Type de protocole<select data-xt="program-filter"><option value="all">Tous les protocoles</option><option value="standard">Vagues standards</option><option value="boss">Finales avec boss</option></select></label><nav aria-label="Pages des programmes"><button type="button" class="button" data-xt="program-previous">← PAGE PRÉCÉDENTE</button><span data-xt="program-page" role="status" aria-live="polite"></span><button type="button" class="button" data-xt="program-next">PAGE SUIVANTE →</button></nav></div><p class="xt-activity-index" data-xt="activity-count" role="status"></p><details data-xt="practice-sandbox" class="xt-practice-sandbox-v208" hidden><summary>BANC LIBRE</summary>
      <form data-xt="practice-sandbox-form">
        <p>Choisissez vos spécimens, l’arène et le comportement de la cible. Tous les spécimens sont prêtés pour la séance.</p>
        <div class="xt-practice-sandbox-fields-v208">
          <label>Votre spécimen<select name="sandbox-playerId">${FIGHTERS.map(fighter => `<option value="${fighter.id}">${escapeHtml(fighter.label)}</option>`).join('')}</select></label>
          <label>Spécimen adverse<select name="sandbox-opponentId">${FIGHTERS.map(fighter => `<option value="${fighter.id}">${escapeHtml(fighter.label)}</option>`).join('')}</select></label>
          <label>Arène<select name="sandbox-stageId">${STAGES.map(stage => `<option value="${stage.id}">${escapeHtml(stage.label)}</option>`).join('')}</select></label>
          <label>Comportement adverse<select name="sandbox-behavior">${options(XENO_TRIALS_SANDBOX_BEHAVIORS_V208)}</select></label>
          <label>Difficulté de l’IA<select name="sandbox-difficulty"><option value="easy">Facile</option><option value="normal">Normale</option><option value="hard">Difficile</option></select></label>
          <label>Secondes par manche<select name="sandbox-roundSeconds">${[30,60,99,120].map(seconds => `<option>${seconds}</option>`).join('')}</select></label>
          <label>Manches gagnantes<select name="sandbox-roundsToWin">${[1,2,3].map(rounds => `<option>${rounds}</option>`).join('')}</select></label>
          <label class="xt-practice-checkbox"><input type="checkbox" name="sandbox-readySupers"> Super chargé au départ</label>
          <label class="xt-practice-checkbox"><input type="checkbox" name="sandbox-noSpecial"> Désactiver les attaques spéciales</label>
        </div>
        <button type="submit" class="button primary">LANCER LE BANC LIBRE</button><p data-xt="practice-sandbox-status" role="status"></p>
      </form></details><details data-xt="practice-labs" class="xt-practice-sandbox-v208" hidden><summary>LABORATOIRES MIRE</summary>
        <div data-xt="practice-lab-list" class="xt-activity-board-v119"></div></details><details data-xt="research-dossiers" class="xt-practice-sandbox-v208" hidden>
        <summary>DOSSIERS EXPÉRIMENTAUX MIRE</summary>
        <label>${currentLanguageV185() === 'en' ? 'Model preview' : 'Aperçu du modèle'}
          <select data-xt="research-preview-select">${options(XENO_TRIALS_RESEARCH_FIGHTERS_V210)}</select>
        </label>
        <div data-xt="research-preview" class="xt-specimen-window" style="position:relative;max-width:280px">
          <div data-xt="research-preview-static" class="xt-facing-preview" aria-hidden="true"></div>
        </div>
        <div class="xt-activity-board-v119">${XENO_TRIALS_RESEARCH_V210.map(specimen => `<article class="xt-activity-v119">
          <h3>${escapeHtml(specimen.label)}</h3><strong>${escapeHtml(specimen.source)}</strong><p>${escapeHtml(specimen.briefing)}</p>
          ${specimen.originalModel ? '<small>MODÈLE ORIGINAL MIRE</small>' : ''}
          ${specimen.editions ? `<ul class="xt-research-editions-v210">${specimen.editions.map(edition => `<li>
            <button type="button" class="button" data-xt-research-bout="${edition.id}">${escapeHtml(edition.label)}</button>
            <p>${escapeHtml(edition.briefing)}</p></li>`).join('')}</ul>` : ''}
          ${specimen.fighterId ? `<button type="button" class="button primary" data-xt-research-bout="${specimen.id}">${specimen.kind === 'asymmetric' ? 'LANCER L’ÉPREUVE ASYMÉTRIQUE' : 'ESSAYER LE SPÉCIMEN'}</button>`
          : specimen.kind === 'event' ? `<button type="button" class="button" data-xt-research-lab="${specimen.id}">OBJECTIF DE LABORATOIRE</button>`
            : '<small>MODÈLE À VALIDER</small>'}</article>`).join('')}</div>
      </details><div data-xt="activity-board" class="xt-activity-board-v119"></div></section>
      <section data-xt="practice-lab-panel" hidden></section>
      <section data-xt="briefing" class="xt-briefing-v119" hidden></section>
      <div class="xt-layout" data-xt="layout">
      <div data-xt="portraits" class="xt-portraits" hidden></div>
      <aside class="xt-roster" data-xt="stable" aria-labelledby="xt-roster-heading">
      <header class="xt-roster-heading"><h3 id="xt-roster-heading" tabindex="-1">RÉSERVE BIOLOGIQUE</h3><p data-xt="count" class="xt-help" role="status"></p></header>
      <label class="xt-roster-search"><span class="xt-sr-only">Rechercher</span><input type="search" data-xt="search" placeholder="Nom du spécimen" maxlength="80"></label>
      <details class="xt-roster-filters"><summary>Filtres du registre</summary>
      <div class="xt-filters">
        <label>Famille<select data-xt="family">${options(FAMILIES)}</select></label>
        <label>Rôle<select data-xt="role"><option value="all">Tous les rôles</option>${Object.entries(roleLabel).map(([id,label]) => `<option value="${id}">${label}</option>`).join('')}</select></label>
        <label>Faction simulée<select data-xt="faction-filter"><option value="all">Toutes les factions</option>${options(FACTIONS)}</select></label>
        <label>Animation<select data-xt="animation"><option value="all">Tous les gestes</option><option value="drawn">Gestes dessinés</option><option value="articulated">Gestes articulés</option></select></label><label>Disponibilité<select data-xt="ownership"><option value="all">Toute l’écurie</option><option value="owned">Acquis</option><option value="locked">À débloquer</option></select></label>
        <label>Trier<select data-xt="sort"><option value="power">Puissance croissante</option><option value="power-desc">Puissance décroissante</option><option value="catalog">Catalogue</option><option value="name">Nom A–Z</option><option value="health">Santé décroissante</option><option value="speed">Vitesse décroissante</option><option value="cost">Coût de déblocage croissant</option></select></label>
      </div><button type="button" class="button" data-xt="reset-filters">RÉINITIALISER LES FILTRES</button></details>
      <nav class="xt-roster-pages" aria-label="Lots de 40 spécimens"><button type="button" class="button" data-xt="roster-previous">← LOT PRÉCÉDENT</button><span data-xt="roster-page" role="status" aria-live="polite"></span><button type="button" class="button" data-xt="roster-next">LOT SUIVANT →</button><button type="button" class="button" data-xt="roster-selection">RETROUVER MA SÉLECTION</button></nav><div data-xt="roster" class="xt-roster-drawers"></div></aside>
      <div class="xt-main"><form data-xt="form" class="xt-config">
        <section class="xt-selection-fields" data-xt="fighter-config"><h3 data-xt="fighter-config-title">Autorisation d’essai</h3>
        <p class="xt-selection-rules" data-xt="selection-rules" hidden></p>
        <div data-xt="opponent-fields" class="xt-opponent-fields-v119"><label>Famille adverse<select name="opponentFamily">${options(FAMILIES)}</select></label>
        <label>Cellule adverse<select name="factionId">${options(FACTIONS)}</select></label>
        <label>Spécimen adverse<select name="opponentId"></select></label><label>Règles<select name="requestedRules"><option value="standard">Standard</option><option value="no-special">Sans spécial</option><option value="one-hp">1 PV</option><option value="thirty-seconds">30 secondes</option></select></label><button type="button" class="button primary" data-xt="confirm-target">CIBLE CONFIRMÉE · CHOISIR MON SPÉCIMEN →</button></div>
        <label>Niveau<select name="difficulty"><option value="easy">Acclimatation</option><option value="normal" selected>Standard</option><option value="hard">Élite</option></select></label>
        <label>Votre Arachnoid<select name="playerVariant"><option value="grey">Grey</option><option value="purple">Purple</option></select></label>
        <label>Arachnoid adverse<select name="opponentVariant"><option value="grey">Grey</option><option value="purple">Purple</option></select></label>
        <p data-xt="doctrine" class="xt-doctrine"></p>
        <p data-xt="selection-hold" class="xt-selection-hold" role="status" hidden></p>
        <button type="button" class="button primary" data-xt="confirm-fighters">CONFIRMER · CHOISIR L’ARÈNE →</button><button type="button" class="button" data-xt="branch-return">← ÉVALUATIONS</button>
        </section>
        <section class="xt-selection-fields" data-xt="arena-config" hidden><h3>02 / Choisissez l’arène</h3>
        <p class="xt-doctrine" data-xt="arena-matchup"></p>
        <label>Environnement<select name="stageId">${options(STAGES)}</select></label>
        <label>Durée d’une manche<select name="roundSeconds"><option value="30">30 secondes</option><option value="60">60 secondes</option><option value="75">75 secondes</option><option value="99" selected>99 secondes · The Pit</option><option value="120">120 secondes</option></select></label>
        <div class="xt-stage-tools-v192"><label>Archives d’environnement<select data-xt="stage-media">${options(XENO_TRIALS_STAGE_MEDIA_V192)}</select></label><button type="button" class="button" data-xt="arena-selection">RETROUVER L’ARÈNE SÉLECTIONNÉE</button><nav aria-label="Pages des arènes"><button type="button" class="button" data-xt="stage-previous">← PAGE PRÉCÉDENTE</button><span data-xt="stage-page" role="status" aria-live="polite"></span><button type="button" class="button" data-xt="stage-next">PAGE SUIVANTE →</button></nav><p data-xt="stage-count"></p></div>
        <div data-xt="arena-cards" class="xt-arena-cards" role="group" aria-label="Arènes disponibles"></div>
        <div data-xt="stage-preview" class="xt-stage-preview"></div>
        <p class="xt-doctrine" data-xt="arena-rules">Deux manches gagnantes. Présentation des deux spécimens, puis décompte 3–2–1. Le chrono ne démarre qu’au signal de combat.</p>
        <button type="button" class="button" data-xt="back-fighters">← MODIFIER LES COMBATTANTS</button>
        <button type="submit" class="button primary" data-xt="start">LANCER LE DUEL</button>
        <div class="xt-offline-duel-v223" data-xt="offline-duel" hidden>
          <button type="button" class="button" data-xt="prepare-offline-duel">TÉLÉCHARGER CE DUEL</button>
          <p data-xt="offline-duel-status" role="status" aria-live="polite"></p>
        </div>
        </section>
        <button type="button" class="button" data-xt="restart" hidden>RECOMMENCER LE DUEL SAUVEGARDÉ</button>
        <button type="button" class="button" data-xt="restart-from-start" hidden>RECOMMENCER DEPUIS LA PREMIÈRE VAGUE</button><button type="button" class="button danger-outline" data-xt="abandon" hidden>ANNULER LE DUEL · SANS GAIN</button>
      </form>
      <p data-xt="status" class="xt-status" role="status" aria-live="polite">Choisissez votre spécimen puis une cellule adverse.</p>
      <section data-xt="combat-panel" hidden>
      <header class="xt-tablet-rail">
        <div class="xt-tablet-identity">
          <span class="xt-terminal-mark" aria-hidden="true">W<span>Y</span></span>
          <div><strong>WEYLAND-YUTANI</strong><span>MIRE / XENO TRIALS</span></div>
        </div>
        <button type="button" class="button xt-tablet-fullscreen" data-xt="tablet-fullscreen" aria-pressed="false" hidden>
          <span aria-hidden="true"></span>PLEIN ÉCRAN
        </button>
      </header>
      <div class="xt-arena"><div class="xt-arena-screen">
      <canvas width="1000" height="560" tabindex="0" data-xt="canvas" aria-label="Arène de combat Xeno Trials" aria-describedby="xeno-trials-help-v96"></canvas>
      <div class="xt-match-hud" data-xt="combat-hud" role="group" aria-label="État du duel">
        ${['player', 'opponent'].map((side, i) => `<div class="xt-vitals xt-vitals-${side}" data-xt="${side}-vitals"><span class="xt-side">${i ? 'ADVERSAIRE' : 'VOUS'}</span><strong data-xt="${side}-name"></strong>
        <span class="xt-vital-value" data-xt="${side}-hp-value"></span><progress class="xt-hp-meter" data-xt="${side}-hp" max="1" value="1" aria-label="Santé ${i ? 'adversaire' : 'joueur'}"></progress>
        <span class="xt-vital-value xt-stamina-value" data-xt="${side}-stamina-value"></span><progress class="xt-stamina-meter" data-xt="${side}-stamina" max="1" value="1" aria-label="Endurance ${i ? 'adversaire' : 'joueur'}"></progress>
        ${i ? '' : '<span class="xt-parry-status-v208" data-xt="parry-status" role="status" hidden></span>'}
        <span class="xt-vital-value xt-super-value-v148" data-xt="${side}-super-value" hidden></span><progress class="xt-super-meter-v148" data-xt="${side}-super" max="100" value="0" aria-label="Jauge de super ${i ? 'adversaire' : 'joueur'}" hidden></progress></div>`).join('')}
        <div class="xt-match-clock"><span data-xt="round">MANCHE 1</span><strong data-xt="clock" role="timer" aria-live="off" aria-label="Secondes restantes">99</strong><span class="xt-clock-unit">SECONDES</span><strong data-xt="score" aria-label="Manches gagnées : joueur — adversaire">0 — 0</strong></div>
        <div class="xt-horde-telemetry" data-xt="horde-hud" hidden><span class="xt-horde-link">MIRE / TÉLÉMÉTRIE TACTIQUE</span><div class="xt-horde-counter-row"><div><span>CONTACTS ACTIFS</span><strong data-xt="horde-alive">0</strong></div><div><span>RENFORTS EN ATTENTE</span><strong data-xt="horde-remaining">0</strong></div></div><span data-xt="horde-phase" class="xt-horde-phase"></span><span class="xt-horde-total" data-xt="horde-kills"></span><progress data-xt="horde-progress" class="xt-horde-progress" max="1" value="0" aria-label="Contacts neutralisés sur la population totale"></progress></div>
      <section data-xt="boss-hud" class="xt-boss-hud-v186" hidden><span>CONTACT MAJEUR</span><strong data-xt="boss-name"></strong><span data-xt="boss-phase"></span><progress data-xt="boss-hp" max="1" value="1" aria-label="Santé du contact majeur"></progress><span data-xt="boss-hp-value"></span></section><section data-xt="operation-hud" class="xt-operation-hud-v188" hidden><div><span data-xt="operation-phase"></span><strong data-xt="operation-title"></strong></div><p data-xt="operation-instruction"><span data-xt="operation-task-text"></span><span data-xt="operation-work-value"></span></p><progress data-xt="operation-progress" max="1" value="0" aria-label="Progression de l’objectif"></progress><span data-xt="operation-progress-value"></span><span data-xt="operation-integrity"></span><p data-xt="operation-pressure" hidden><span>PRESSION DU CONFINEMENT</span><span data-xt="operation-pressure-value"></span></p><p data-xt="operation-hint"></p><p data-xt="operation-hazard"></p></section><div class="xt-hud-meta-v186"><p class="xt-input-device-v186" data-xt="input-device" role="status">CLAVIER / TACTILE</p><p data-xt="checkpoint-status" class="xt-checkpoint-v186" role="status" aria-live="polite"></p><button type="button" class="button" data-xt="retry-checkpoint" hidden>RÉESSAYER LA SAUVEGARDE DE REPRISE</button></div></div><p data-xt="horde-announcement" class="xt-sr-only" role="status" aria-live="polite"></p>
      <section data-xt="practice-hud" class="xt-practice-hud-v207" hidden aria-label="Atelier de simulation">
        <div><h3 data-xt="practice-title"></h3><progress data-xt="practice-progress" max="1" value="0" aria-label="Objectifs de l’atelier"></progress></div>
        <p data-xt="practice-tip"></p><p data-xt="practice-target" role="status"></p>
        <details data-xt="practice-telemetry" class="xt-practice-telemetry-v209" hidden><summary data-xt="practice-telemetry-toggle">RELEVÉ DES CONTACTS ET COMMANDES</summary>
          <table><thead><tr><th scope="col">Partie</th><th scope="col">Vous</th><th scope="col">Adversaire</th></tr></thead><tbody>
            ${[['impacts','Impacts infligés'],['damage','PV infligés'],['blocks','Blocages effectués'],['ruptures','Ruptures provoquées'],['parries','Parades effectuées']]
              .map(([key,label]) => `<tr><th scope="row">${label}</th><td data-xt="practice-player-${key}">0</td><td data-xt="practice-opponent-${key}">0</td></tr>`).join('')}
          </tbody></table>
          <p data-xt="practice-last-contact"></p>
          <button type="button" class="button" data-xt="practice-record">ENREGISTRER MES COMMANDES</button>
          <progress data-xt="practice-record-progress" max="960" value="0" aria-label="Durée d’enregistrement" hidden></progress>
          <p data-xt="practice-record-status" role="status"></p>
        </details>
        <div class="xt-actions" data-xt="practice-actions" hidden>
          <button type="button" class="button primary" data-xt="practice-repeat">REJOUER</button>
          <button type="button" class="button" data-xt="practice-list">RETOUR AUX ATELIERS</button>
          <button type="button" class="button" data-xt="practice-save" hidden>RÉESSAYER LA SAUVEGARDE</button>
        </div>
      </section>
      <p data-xt="health" class="xt-sr-only" aria-label="Santé et endurance des combattants"></p>
      </div></div>
      <p data-xt="finisher-status" class="xt-sr-only" role="status"></p>
      <div class="xt-actions"><button class="button" data-xt="pause" disabled>PAUSE</button><button type="button" class="button" data-xt="taunt" hidden disabled>T · DÉFI</button><button type="button" class="button" data-xt="finisher" aria-keyshortcuts="F" hidden disabled>F · VERROU FINAL</button><button type="button" class="button" data-xt="finisher-alternative" hidden disabled>VERROU FINAL</button><button type="button" class="button" data-xt="skip-sequence" hidden>PASSER LA PRÉSENTATION</button><button class="button" data-xt="next" hidden>MANCHE SUIVANTE</button><button class="button" data-xt="retry-save" hidden>RÉESSAYER LA SAUVEGARDE DU RÉSULTAT</button></div>
      <section data-xt="pause-overlay" class="xt-pause-overlay-v119" role="dialog" aria-modal="true" aria-labelledby="xeno-trials-pause-title-v119" hidden>
        <div data-xt="pause-main" class="xt-pause-main">
          <h2 id="xeno-trials-pause-title-v119">ÉVALUATION SUSPENDUE</h2>
          <button type="button" class="button primary" data-xt="resume-overlay">REPRENDRE</button>
          <button type="button" class="button" data-xt="pause-commands" aria-controls="xeno-trials-commands-v217">COMMANDES</button>
          <button type="button" class="button" data-xt="audio-toggle" aria-label="Sons de Trials" aria-pressed="true">COUPER LES SONS DE TRIALS</button>
          <button type="button" class="button" data-xt="retry-checkpoint-overlay" hidden>RÉESSAYER LA SAUVEGARDE DE REPRISE</button>
          <button type="button" class="button" data-xt="practice-restart" hidden>RECOMMENCER L’ATELIER</button>
          <button type="button" class="button danger-outline" data-xt="abandon-overlay">ABANDONNER · SANS GAIN</button>
        </div>
        <section data-xt="controls" id="xeno-trials-commands-v217" class="xt-command-list" hidden>
          <div class="xt-command-heading">
            <h2 id="xeno-trials-commands-title-v217">COMMANDES</h2>
            <button type="button" class="button" data-xt="commands-back">← RETOUR À LA PAUSE</button>
          </div>
          <div id="xeno-trials-help-v96" class="xt-command-columns">
            <section aria-label="Clavier">
              <h3>Clavier</h3>
              <dl>
              ${[['left','Q / A / ←'],['right','D / →'],['jump','Z / W / ↑ / ESPACE'],['guard','S / ↓'],['light','J'],['heavy','K'],['special','L'],['super','I'],['interact','E'],['crouch','C'],['evade','MAJ'],['antiAir','U'],['parry','V'],['signature2','H'],['signature3','O']]
                .map(([key, label]) => `<div data-xeno-action="${key}" ${['interact', 'signature2', 'signature3'].includes(key) ? 'hidden' : ''}><dt>${controlLabel[key]}</dt><dd><kbd>${label}</kbd></dd></div>`).join('')}
              </dl>
              <p>T pour défier, F pour une finition disponible, P ou Échap pour la pause.</p>
            </section>
            <section aria-label="Manette">
              <h3>Manette</h3>
              <p class="xt-input-hint-v186" data-xt="input-hint">CLAVIER / TACTILE / MANETTE STANDARD · Stick ou croix : déplacement · A : saut · LT : garde · X/Y/B : attaques · RT : super · Start/Back : pause. Relâchez les commandes après une reprise.</p>
              <p>${movePadHint}</p><p>${techniqueHint}</p>
              <p data-xt="operation-input-hint" hidden>E / L3 / INTERAGIR : maintenez au sol près de la cible indiquée. Évitez les zones de danger annoncées avant leur activation.</p>
            </section>
            <section aria-label="Tactile">
              <h3>Tactile</h3>
              <p>Touchez ou maintenez une zone directement dans l’arène. Cette carte reprend la position des zones à l’écran.</p>
              <div class="xt-touch-map" aria-label="Carte des zones tactiles">
                ${XENO_TRIALS_TOUCH_ZONES_V217.map(action => `<span>${controlLabel[action]}</span>`).join('')}
              </div>
              <p>Les attaques et interactions dépendent du spécimen et de l’épreuve.</p>
            </section>
          </div>
          <p data-xt="mode-help"></p><p data-xt="operation-orders" hidden></p>
          <p>${moveHint}</p><p>${parryHint}</p>
          <p>Selon le spécimen, maintenez Garde en reculant pour bloquer. Si votre garde cède, relâchez-la et pressez-la de nouveau au signal de redressement.</p>
        </section>
      </section></section>
      <button type="button" class="button" data-xt="new-duel" hidden>PRÉPARER UN AUTRE DUEL</button>
      <div data-xt="result" class="xt-result" role="status" aria-live="polite"></div>
      <details class="xt-history"><summary>Journal des évaluations</summary><div data-xt="history"></div></details></div></div>`;
    this.el = key => root.querySelector(`[data-xt="${key}"]`);
    this.form = this.el('form');
    this.form.addEventListener('submit', event => { event.preventDefault(); this.begin(event); });
    this.el('prepare-offline-duel').onclick = () => this.prepareOfflineDuelV223();
    if (offlineDuels) {
      const library = this.el('offline-library');
      library.addEventListener('toggle', () => { if (library.open) void this.refreshOfflineLibraryV224(); });
      library.addEventListener('click', event => {
        const entry = event.target.closest('[data-xt-remove-duel]');
        if (entry && !entry.disabled) void this.removeOfflineDuelV224(entry.dataset.xtRemoveDuel);
      });
    }
    this.el('start').onclick = event => {
      if (this.form.reportValidity?.() === false) return;
      event.preventDefault(); this.begin(event);
    };
    this.form.elements.factionId.addEventListener('change', () => this.updateOpponents());
    this.form.elements.opponentFamily.addEventListener('change', () => this.updateOpponents());
    this.form.elements.opponentId.addEventListener('change', () => { this.updateVariants(); this.renderPreviews(); });
    this.form.elements.opponentVariant.addEventListener('change', () => this.renderPreviews());
    this.el('research-preview-select')?.addEventListener('change', () => this.syncSelectionMotionV230());
    this.el('research-dossiers')?.addEventListener('toggle', () => this.syncSelectionMotionV230());
    this.form.elements.stageId.addEventListener('change', () => {
      this.el('stage-media').value = 'all'; this.stageSelectionV192 = null; this.renderPreviews();
    });
    this.el('stage-media').addEventListener('change', () => {
      if (!this.active || this.selectionStep !== 'arena' || this.isRunning() || this.state().pending || this.unsavedResult) return;
      this.stagePageV192 = 0; this.renderPreviews();
    });
    for (const [key, delta] of [['stage-previous', -1], ['stage-next', 1]]) this.el(key).onclick = () => {
      if (!this.active || this.selectionStep !== 'arena' || this.isRunning() || this.state().pending || this.unsavedResult || this.el(key).disabled) return;
      this.stagePageV192 += delta; this.renderPreviews();
      this.el(this.el(key).disabled ? delta > 0 ? 'stage-previous' : 'stage-next' : key).focus({ preventScroll: true });
    };
    this.el('arena-selection').onclick = () => {
      if (!this.active || this.selectionStep !== 'arena' || this.isRunning() || this.state().pending || this.unsavedResult) return;
      this.el('stage-media').value = 'all'; this.stageSelectionV192 = null; this.renderPreviews();
      this.root.querySelector(`[data-xt-arena="${this.form.elements.stageId.value}"]`)?.focus({ preventScroll: true });
    };
    this.form.elements.playerVariant.addEventListener('change', () => { if (!this.isRunning()) this.render(); });
    this.form.elements.requestedRules.addEventListener('change', () => {
      if (this.updateRequestedRulesV119()) this.renderPreviews();
    });
    root.addEventListener('click', event => {
      const branch = event.target.closest('[data-xt-branch]'); if (branch) this.chooseBranchV119(branch.dataset.xtBranch);
      const activity = event.target.closest('[data-xt-activity]'); if (activity) this.chooseActivityV119(activity.dataset.xtActivity);
      const practice = event.target.closest('[data-xt-practice]'); if (practice) void this.startPracticeV207(practice.dataset.xtPractice, event);
      const lab = event.target.closest('[data-xt-lab]'); if (lab) this.startResearchLabV209(lab.dataset.xtLab);
      const research = event.target.closest('[data-xt-research-bout]');
      if (research) void this.startResearchEvaluationV209(research.dataset.xtResearchBout, event);
      const researchLab = event.target.closest('[data-xt-research-lab]');
      if (researchLab) this.startResearchLabV209(researchLab.dataset.xtResearchLab);
      const summary = event.target.closest('[data-xt-roster-summary]');
      if (summary) {
        event.preventDefault();
        if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult || summary.getAttribute('aria-disabled') === 'true') return;
        const id = summary.dataset.xtRosterSummary;
        this.rosterDrawerV227 = this.rosterDrawerV227 === id ? null : id;
        this.rosterPageV179 = this.rosterDrawerPagesV227.get(id) || 0;
        this.render();
        this.el('roster').querySelector(`[data-xt-roster-summary="${id}"]`)?.focus();
        return;
      }
      const fighter = event.target.closest('[data-xt-fighter]');
      if (fighter && this.active && !this.isRunning() && !this.state().pending) {
        const activity = this.activityV119 && resolveXenoTrialsActivityV119(this.activityV119, this.state().modesV119);
        if (!activity?.forcedPlayerId && !this.state().modesV119.challengeRun) this.selected = fighter.dataset.xtFighter;
        this.render();
        this.el('roster').querySelector(`[data-xt-fighter="${fighter.dataset.xtFighter}"]`)?.focus({ preventScroll: true });
      }
      const unlock = event.target.closest('[data-xt-unlock]');
      if (unlock && !this.unsavedResult && this.commit(unlockXenoTrialsFighterV96(this.getProgress(), unlock.dataset.xtUnlock))) {
        this.el('roster').querySelector(`[data-xt-fighter="${unlock.dataset.xtUnlock}"]`)?.focus({ preventScroll: true });
      }
      const arena = event.target.closest('[data-xt-arena]');
      if (arena) this.selectArena(arena.dataset.xtArena);
    });
    this.el('roster').addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
        || !event.target.matches('[data-xt-fighter]') || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const cards = [...event.target.closest('.xt-fighters').querySelectorAll('[data-xt-fighter]:enabled')];
      const index = cards.indexOf(event.target);
      if (index < 0) return;
      const firstRow = cards[0].getBoundingClientRect().top;
      const rowSize = cards.findIndex(card => card.getBoundingClientRect().top !== firstRow);
      const columns = rowSize < 0 ? cards.length : rowSize;
      const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key];
      event.preventDefault();
      cards[index + offset]?.focus();
    });
    this.el('return').onclick = () => { this.close(); this.onReturn(); };
    const fullscreen = this.el('tablet-fullscreen');
    const doc = root.ownerDocument;
    fullscreen.hidden = !doc?.fullscreenEnabled || typeof root.requestFullscreen !== 'function';
    root.addEventListener('fullscreenchange', () => {
      fullscreen.setAttribute('aria-pressed', String(doc.fullscreenElement === root));
      if (!this.active || this.selectionStep !== 'combat') return;
      const overlay = this.el('pause-overlay');
      if (!overlay.hidden) {
        if (!overlay.contains(doc.activeElement))
          this.el(this.el('controls').hidden ? 'resume-overlay' : 'commands-back').focus({ preventScroll: true });
      } else if (doc.activeElement === fullscreen) {
        this.el('canvas').focus({ preventScroll: true });
      }
    });
    fullscreen.onclick = async () => {
      if (!this.active || this.selectionStep !== 'combat') return;
      if (doc.fullscreenElement === root) { this.exitTabletFullscreen(); return; }
      try {
        await root.requestFullscreen();
        if (!this.active || this.selectionStep !== 'combat') this.exitTabletFullscreen();
      } catch {
        // The tablet already covers the viewport when native fullscreen is blocked.
      }
    };
    this.el('confirm-fighters').onclick = () => this.confirmFighters();
    this.el('back-fighters').onclick = () => this.showFighters();
    this.el('new-duel').onclick = () => this.continueEvaluationV119();
    this.el('home-return').onclick = () => this.showHomeV119();
    this.el('resume-series').onclick = () => { if (this.chooseBranchV119(challengeBranchV179(this.state().modesV119.challengeRun?.id))) this.continueEvaluationV119(); };
    this.el('abandon-series').onclick = () => { if (!this.unsavedResult && this.commit(abandonXenoTrialsV96(this.getProgress()))) this.showHomeV119(); };
    this.el('branch-return').onclick = () => this.branchV119 === 'on-demand' ? this.showHomeV119() : this.chooseBranchV119(this.branchV119 || 'on-demand');
    this.el('renew-contracts').onclick = () => this.commit(renewXenoTrialsContractsV119(this.getProgress()));
    this.el('confirm-target').onclick = () => {
      if (!this.active || !this.canCommit() || this.isRunning() || this.state().pending || this.unsavedResult) return;
      this.updateRequestedRulesV119(); this.selectionStep = 'fighters'; this.render();
      this.root.scrollTop = 0;
      this.root.querySelector('#xt-roster-heading').focus({ preventScroll: true });
    };
    this.el('resume-overlay').onclick = event => { this.runtime?.unlockAudio?.(event); this.runtime?.resume(); };
    this.el('pause-commands').onclick = () => {
      this.setPauseCommands(true);
      this.el('commands-back').focus({ preventScroll: true });
    };
    this.el('commands-back').onclick = () => {
      this.setPauseCommands(false);
      this.el('pause-commands').focus({ preventScroll: true });
    };
    this.el('audio-toggle').onclick = event => {
      if (!this.runtime || this.unsavedResult) return;
      this.audioEnabledV189 = !this.audioEnabledV189;
      this.runtime.setAudioEnabled?.(this.audioEnabledV189);
      if (this.audioEnabledV189) void this.runtime.unlockAudio?.(event);
      this.updateMatch(this.runtime.getState());
    };
    this.el('abandon-overlay').onclick = () => {
      if (!this.runtime?.getState().practiceV207) { this.el('abandon').onclick(); return; }
      this.closeRuntime(); this.chooseBranchV119('practice');
    };
    this.el('practice-repeat').onclick = event => void this.startPracticeV207(this.runtime?.getState().practiceV207?.id, event);
    this.el('practice-list').onclick = () => this.chooseBranchV119('practice');
    this.el('practice-save').onclick = () => this.persistPracticeV207(this.runtime?.getState().practiceV207);
    this.el('practice-record').onclick = event => this.recordPracticeV209(event);
    this.el('practice-restart').onclick = event => {
      const practice = this.runtime?.getState().practiceV207;
      if (!practice || !this.active || !this.canCommit()) return;
      this.closeRuntime();
      void this.startPracticeV207(practice.id, event);
    };
    this.el('practice-sandbox-form').addEventListener('submit', event => {
      event.preventDefault();
      if (this.branchV119 !== 'practice' || this.selectionStep !== 'activities' || !this.active || !this.canCommit() || this.isRunning()) return;
      const values = Object.fromEntries([...new FormData(event.currentTarget)]
        .map(([name, value]) => [name.slice('sandbox-'.length), value]));
      const transaction = configureXenoTrialsSandboxV208(this.getProgress(), {
        ...values, roundSeconds: Number(values.roundSeconds), roundsToWin: Number(values.roundsToWin),
        readySupers: Object.hasOwn(values, 'readySupers'), noSpecial: Object.hasOwn(values, 'noSpecial'),
      });
      if (transaction.unchanged || this.commit(transaction, { pauseOnFailure: false })) void this.startPracticeV207(XENO_TRIALS_SANDBOX_ID_V208, event);
      else this.el('practice-sandbox-status').textContent = 'Réglages du banc libre non sauvegardés.';
    });
    doc?.addEventListener?.('keydown', event => {
      if (!this.active || this.selectionStep !== 'combat' || !['Escape', 'Tab'].includes(event.code)) return;
      const overlay = this.el('pause-overlay');
      if (overlay.hidden) return;
      const commands = !this.el('controls').hidden;
      if (commands && event.code === 'Escape') {
        event.preventDefault();
        if (!event.repeat) this.el('commands-back').click();
        return;
      }
      if (event.code !== 'Tab') return;
      const actions = (commands ? ['commands-back']
        : ['resume-overlay', 'pause-commands', 'audio-toggle', 'retry-checkpoint-overlay', 'practice-restart', 'abandon-overlay'])
        .map(key => this.el(key)).filter(button => !button.hidden && !button.disabled);
      if (!actions.length) return;
      const first = actions[0], last = actions.at(-1);
      const focused = this.root.ownerDocument?.activeElement || event.target;
      if (!overlay.contains(focused) || event.shiftKey && focused === first || !event.shiftKey && focused === last) {
        event.preventDefault(); (event.shiftKey ? last : first).focus({ preventScroll: true });
      }
    }, true);
    for (const key of ['family', 'role', 'ownership', 'sort', 'faction-filter', 'animation']) this.el(key).addEventListener('change', () => {
      this.resetRosterPagesV227(key !== 'sort'); this.render();
    });
    for (const [key, delta] of [['roster-previous', -1], ['roster-next', 1]]) this.el(key).onclick = () => {
      if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult || this.el(key).disabled) return;
      this.rosterPageV179 += delta; this.render();
      this.el('roster').querySelector('.xt-fighters')?.scrollTo(0, 0);
      this.el(this.el(key).disabled ? delta > 0 ? 'roster-previous' : 'roster-next' : key).focus({ preventScroll: true });
    };
    this.el('reset-filters').onclick = () => {
      for (const key of ['family', 'role', 'ownership', 'faction-filter', 'animation']) this.el(key).value = 'all';
      this.el('sort').value = 'power'; this.el('search').value = ''; this.resetRosterPagesV227(true); this.render();
    };
    this.el('roster-selection').onclick = () => {
      if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult) return;
      for (const key of ['family', 'role', 'ownership', 'faction-filter', 'animation']) this.el(key).value = 'all';
      this.el('search').value = ''; this.rosterSelectionV179 = null; this.render();
      this.el('roster').querySelector(`[data-xt-fighter="${this.selected}"]`)?.focus();
    };
    this.el('search').addEventListener('input', () => { this.resetRosterPagesV227(true); this.render(); });
    this.el('restart').onclick = event => this.launch(this.state().pending?.config, event);
    this.el('restart-from-start').onclick = event => {
      if (!this.active || this.isRunning() || this.unsavedResult) return;
      const clear = this.state().pending?.duelCheckpointV197 ? clearXenoTrialsDuelCheckpointV197 : clearXenoTrialsCheckpointV186;
      if (this.commit(clear(this.getProgress()))) void this.launch(this.state().pending?.config, event);
    };
    this.el('program-filter').addEventListener('change', () => { this.programPageV186 = 0; this.renderActivitiesV119(this.state()); });
    for (const [key, delta] of [['program-previous', -1], ['program-next', 1]]) this.el(key).onclick = () => {
      if (!this.active || this.isRunning() || this.el(key).disabled) return;
      this.programPageV186 += delta; this.renderActivitiesV119(this.state());
      this.el(this.el(key).disabled ? delta > 0 ? 'program-previous' : 'program-next' : key).focus({ preventScroll: true });
    };
    this.el('abandon').onclick = () => {
      // A queued event must not discard a completed result awaiting a storage retry.
      if (this.unsavedResult) return;
      if (this.commit(abandonXenoTrialsV96(this.getProgress()))) {
        this.closeRuntime(); this.selectionStep = 'fighters'; this.render();
        this.message('Duel annulé sans gain. Choisissez vos combattants pour une nouvelle évaluation.');
      }
    };
    this.el('pause').onclick = () => { if (!this.runtime || this.unsavedResult) return; this.runtime.getState().paused ? this.runtime.resume() : this.runtime.pause(); };
    this.el('next').onclick = () => this.runtime?.nextRound();
    this.el('skip-sequence').onclick = () => this.runtime?.skipSequence();
    this.el('finisher').onclick = () => this.runtime?.activateFinisher();
    this.el('finisher-alternative').onclick = () => {
      const alternate = this.runtime?.getState().finisherV207?.alternatives?.[0];
      if (alternate) this.runtime.activateFinisher(alternate.id);
    };
    this.el('taunt').onclick = () => {
      const runtime = this.runtime;
      if (runtime?.taunt() && this.runtime === runtime && !runtime.getState().paused)
        this.el('canvas').focus({ preventScroll: true });
    };
    this.el('retry-save').onclick = () => this.finish(this.unsavedResult);
    this.el('retry-checkpoint').onclick = this.el('retry-checkpoint-overlay').onclick = () => {
      if (this.runtime && !this.unsavedResult) this.runtime.saveCheckpoint?.();
    };
    this.updateOpponents(); this.restorePendingSelection(); this.render();
  }
  state() { return normalizeXenoTrialsProgressV96(this.getProgress()); }
  usesLocalMenuMediaV222() {
    return this.standaloneV207 && this.root.ownerDocument?.defaultView?.navigator?.onLine === false;
  }
  isRunning() {
    const snapshot = this.runtime?.getState();
    return Boolean(this.loading || (snapshot?.practiceV207 ? snapshot.practiceV207.state === 'active' : snapshot && snapshot.phase !== 'match-over'));
  }
  message(text) { this.el('status').textContent = text; }
  updateOpponents(requiredId = null) {
    const faction = FACTIONS.find(f => f.id === this.form.elements.factionId.value) || FACTIONS[0];
    const family = this.form.elements.opponentFamily.value || 'all';
    const candidates = getXenoTrialsOpponentCandidatesV119(FIGHTERS, faction, family);
    const required = requiredId && FIGHTERS.find(fighter => fighter.id === requiredId);
    if (required && !candidates.some(fighter => fighter.id === required.id)) candidates.push(required);
    const select = this.form.elements.opponentId;
    select.innerHTML = options(candidates);
    if (required) select.value = required.id;
    this.el('doctrine').textContent = faction.description; this.updateVariants(); this.renderPreviews();
  }
  updateVariants() {
    this.form.elements.playerVariant.disabled = this.selected !== 'arachnoid' || this.isRunning();
    this.form.elements.opponentVariant.disabled = this.form.elements.opponentId.value !== 'arachnoid' || this.isRunning();
  }
  updateRequestedRulesV119() {
    if (!this.active || this.branchV119 !== 'on-demand' || this.isRunning() || this.state().pending || this.unsavedResult) return false;
    const rules=requestedRulesV119(this.form.elements.requestedRules.value);
    this.activityV119={branch:'on-demand',id:'on-demand',rules};
    if (rules.timeLimitSeconds) this.form.elements.roundSeconds.value=String(rules.timeLimitSeconds);
    this.renderActivitiesV119(this.state()); return true;
  }
  commit(transaction, { pauseOnFailure = true } = {}) {
    if (!this.active || !this.canCommit() || !transaction?.applied) return false;
    try { this.onCommit(transaction.state); this.render(); return true; }
    catch (error) { if (pauseOnFailure) this.runtime?.pause(); this.message(`Sauvegarde refusée : ${error.message}. Aucun gain confirmé.`); return false; }
  }
  restorePendingSelection() {
    // Saved duels retain their historical timer/palette; previews describe that ticket.
    const config = this.state().pending?.config;
    if (!config) return;
    this.activityV119 = config.activityV119 || null; this.branchV119 = getArbiterProgramV191(config.activityV119?.id) ? ARCHIVE_BRANCH_V191 : config.activityV119?.branch === 'challenges' ? challengeBranchV179(config.activityV119.id) : config.activityV119?.branch || 'on-demand';
    if (FIGHTERS.some(f => f.id === config.playerId)) this.selected = config.playerId;
    if (FACTIONS.some(f => f.id === config.factionId)) this.form.elements.factionId.value = config.factionId;
    this.updateOpponents(config.opponentId);
    if (STAGES.some(stage => stage.id === config.stageId)) this.form.elements.stageId.value = config.stageId;
    this.el('stage-media').value = 'all'; this.stageSelectionV192 = null;
    for (const key of ['difficulty', 'playerVariant', 'opponentVariant', 'roundSeconds']) this.form.elements[key].value = String(config[key]);
  }
  open() {
    this.active = true; this.root.ownerDocument?.documentElement?.classList?.add('xt-fullscreen-v119');
    this.restorePendingSelection(); if (this.state().pending) this.selectionStep = 'fighters'; this.render();
  }
  showHomeV119() {
    if (this.isRunning() || this.state().pending || this.unsavedResult) return false;
    this.closeRuntime(); this.selectionStep = 'home'; this.branchV119 = null; this.activityV119 = null; this.render(); return true;
  }
  chooseBranchV119(id) {
    if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult || !TERMINAL_BRANCHES_V191.some(b => b.id === id)) return false;
    if (this.state().modesV119.challengeRun && id !== challengeBranchV179(this.state().modesV119.challengeRun.id)) { this.message('Une série est en cours. Poursuivez-la ou abandonnez-la depuis le programme.'); return false; }
    this.closeRuntime(); this.programPageV186 = 0; this.el('program-filter').value = 'all'; this.branchV119 = id; this.activityV119 = id === 'on-demand' ? { branch: id, id, rules: requestedRulesV119(this.form.elements.requestedRules.value) } : null;
    this.selectionStep = id === 'on-demand' ? 'target' : 'activities'; this.render(); return true;
  }
  chooseActivityV119(id) {
    if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult) return false;
    if (this.state().modesV119.challengeRun && id !== this.state().modesV119.challengeRun.id) return false;
    const archive = getArbiterProgramV191(id), access = this.archiveAccessV207();
    if (archive && !access.available) { this.message(access.notice); return false; }
    const branch = activityBranchV191(this.branchV119, id);
    const activity = resolveXenoTrialsActivityV119({ branch, id }, this.state().modesV119);
    if (!activity) return false;
    this.activityV119 = { branch, id };
    if (activity.forcedPlayerId) this.selected = activity.forcedPlayerId;
    if (this.state().modesV119.challengeRun?.id === id) this.selected = this.state().modesV119.challengeRun.playerId;
    if (activity.requiredFamily) this.el('family').value = activity.requiredFamily;
    this.form.elements.factionId.value = activity.factionId || 'containment';
    this.updateOpponents(activity.opponentId);
    if (activity.stageId) this.form.elements.stageId.value = activity.stageId;
    if (activity.difficulty) this.form.elements.difficulty.value = activity.difficulty;
    this.selectionStep = 'fighters'; this.render(); return true;
  }
  archiveAccessV207(state = this.state()) {
    return getXenoTrialsArchiveAccessV207({
      standaloneV207: this.standaloneV207, trialsProgress: state,
      arbiterProgressV190: this.getCampaignProgress?.(), language: currentLanguageV185(),
    });
  }
  renderActivitiesV119(state) {
    const archiveAccess = this.archiveAccessV207(state);
    const lockedArchiveLabel = this.standaloneV207
      ? (currentLanguageV185() === 'en' ? 'SEALED · COMPLETE THE MIRE CAMPAIGN' : 'SCELLÉS · TERMINER LA CAMPAGNE MIRE')
      : 'SCELLÉS · TERMINER L’ENQUÊTE ARBITER';
    this.el('branches').innerHTML = TERMINAL_BRANCHES_V191.map((branch, index) => `<button type="button" data-xt-branch="${branch.id}" class="xt-branch-v119${branch.id === 'horde' ? ' xt-branch-horde' : ''}"><span class="xt-branch-code">MIRE / ${String(index + 1).padStart(2, '0')}<i aria-hidden="true">${branch.id === 'horde' ? 'CONFINEMENT' : 'ÉVALUATION'}</i></span><strong>${escapeHtml(branch.label)}</strong><p>${escapeHtml(branch.description)}</p>${branch.id === ARCHIVE_BRANCH_V191 ? `<p>${escapeHtml(archiveAccess.notice)}</p>` : ''}<span class="xt-branch-open">OUVRIR LE PROGRAMME <b aria-hidden="true">↗</b></span></button>`).join('');
    this.el('branch-title').textContent = TERMINAL_BRANCHES_V191.find(branch => branch.id === this.branchV119)?.label || '';
    this.el('renew-contracts').hidden = this.branchV119 !== 'contracts';
    this.el('program-tools').hidden = this.branchV119 === 'practice';
    const sandboxForm = this.el('practice-sandbox-form');
    this.el('practice-sandbox').hidden = this.branchV119 !== 'practice';
    this.el('practice-labs').hidden = this.branchV119 !== 'practice';
    this.el('research-dossiers').hidden = this.branchV119 !== 'practice';
    if (this.branchV119 === 'practice') {
      const cleared = state.practiceClearedV207 || [];
      if (sandboxForm.elements) for (const [name, value] of Object.entries(normalizeXenoTrialsSandboxV208(state.practiceSandboxV208))) {
        const field = sandboxForm.elements.namedItem(`sandbox-${name}`);
        if (typeof value === 'boolean') field.checked = value;
        else field.value = String(value);
      }
      const recordingOption = sandboxForm.querySelector?.('option[value="recording"]');
      if (recordingOption) recordingOption.disabled = !state.practiceRecordingV209;
      this.el('practice-sandbox-status').textContent = '';
      this.el('practice-lab-list').innerHTML = XENO_TRIALS_RESEARCH_LABS_V209.map(lab => `<article class="xt-activity-v119${state.practiceLabsClearedV209?.includes(lab.id) ? ' validated' : ''}">
        <h3>${escapeHtml(lab.title)}</h3><p>${escapeHtml(lab.instruction)}</p><button type="button" class="button primary" data-xt-lab="${lab.id}">
        ${state.practiceLabsClearedV209?.includes(lab.id) ? 'VALIDÉ · REJOUER' : 'OUVRIR LE LABORATOIRE'}</button></article>`).join('');
      this.el('activity-count').innerHTML = `<span>${cleared.length} / ${XENO_TRIALS_PRACTICE_DRILLS_V226.length}</span> <span>ATELIERS VALIDÉS · SIMULATION SANS PRIME</span>`;
      this.el('activity-board').innerHTML = XENO_TRIALS_PRACTICE_DRILLS_V226.map(entry => `<article class="xt-activity-v119${cleared.includes(entry.id) ? ' validated' : ''}">
        <h3>${escapeHtml(entry.title)}</h3><strong>${escapeHtml(FIGHTERS.find(fighter => fighter.id === entry.playerId).label)}</strong>
        <p>${escapeHtml(entry.briefing)}</p><button type="button" class="button primary" data-xt-practice="${entry.id}">${cleared.includes(entry.id) ? 'VALIDÉ · REJOUER' : 'LANCER L’ATELIER'}</button></article>`).join('');
      return;
    }
    const entries = this.branchV119 === ARCHIVE_BRANCH_V191 ? ARBITER_PROGRAMS_V191 : this.branchV119 === 'operations' ? OPERATIONS : this.branchV119 === 'horde' ? HORDE_PROTOCOLS : this.branchV119 === 'campaign' ? CAMPAIGN : this.branchV119 === 'contracts' ? getXenoTrialsContractsV119(state.modesV119.contractCycle) : ['challenges', 'events'].includes(this.branchV119) ? CHALLENGES.filter(entry => Boolean(entry.eventV179) === (this.branchV119 === 'events')) : [];
    this.el('activity-count').textContent = this.branchV119 === ARCHIVE_BRANCH_V191 ? `40 DOSSIERS / 20 HORDES / 20 OPÉRATIONS · ${archiveAccess.notice}` : this.branchV119 === 'operations' ? `${entries.length} OPÉRATIONS / OBJECTIFS PHYSIQUES / DANGERS DE TERRAIN` : this.branchV119 === 'horde' ? `${entries.length} PROTOCOLES / CONTACTS SIMULTANÉS / SURVIE CONTINUE` : `${entries.length} DOSSIERS / ${this.branchV119 === 'events' ? 'DUELS SUCCESSIFS' : 'ÉVALUATION COMPARATIVE'}`;
    const page = getXenoTrialsProgramPageV186(entries, { page: this.programPageV186, kind: this.branchV119 === 'horde' ? this.el('program-filter').value : 'all' });
    this.programPageV186 = page.page;
    this.el('program-filter-label').hidden = this.branchV119 !== 'horde';
    this.el('program-page').textContent = `PAGE ${page.page + 1} / ${page.pageCount} · ${page.start}–${page.end} / ${page.total}`;
    this.el('program-previous').disabled = !page.hasPrevious;
    this.el('program-next').disabled = !page.hasNext;
    this.el('activity-board').innerHTML = page.entries.map((entry, index) => {
      const entryBranch = activityBranchV191(this.branchV119, entry.id);
      const archiveLocked = Boolean(getArbiterProgramV191(entry.id)) && !archiveAccess.available;
      const activity = resolveXenoTrialsActivityV119({ branch: entryBranch, id: entry.id }, state.modesV119);
      const horde = combatBriefingV188(activity);
      const cleared = entryBranch === 'operations' ? state.modesV119.operationsCleared?.includes(entry.id) : entryBranch === 'horde' ? state.modesV119.hordeCleared?.includes(entry.id) : this.branchV119 === 'campaign' ? state.modesV119.campaignCleared.includes(entry.id) : this.branchV119 === 'contracts' ? state.modesV119.claimedContracts.includes(entry.id) : state.modesV119.challengesCleared.includes(entry.id);
      const opponentId = activity?.opponentId || entry.opponentId || entry.opponentIds?.[0], fighter = FIGHTERS.find(fighter => fighter.id === opponentId);
      const locked = archiveLocked || this.branchV119 === 'campaign' && !isXenoTrialsMissionOpenV119(entry.id, state.modesV119) || this.branchV119 === 'contracts' && cleared
        || ['challenges', 'events'].includes(this.branchV119) && state.modesV119.challengeRun && state.modesV119.challengeRun.id !== entry.id;
      const passage = !horde && entry.opponentIds?.length > 1 ? ` · Passage ${(activity?.bout || 0) + 1}/${entry.opponentIds.length}` : '';
      const stage = STAGES.find(stage => stage.id === activity?.stageId);
      return `<article class="xt-activity-v119 ${cleared ? 'validated' : ''}${horde ? ' xt-horde-protocol' : ''}"${entry.operationV188 || entryBranch === 'operations' ? ' data-xt-operation="true"' : ''}${entry.eventV179 ? ' data-xt-event="true"' : ''}${horde ? ' data-xt-horde="true"' : ''}>${horde && stage?.backdrop ? `<div class="xt-activity-image${stage.stageRevision === 190 ? ' xt-atlas-preview-v190' : ''}">${this.usesLocalMenuMediaV222() ? menuTileV222('stage', stage.id) : `<img src="${stage.backdrop}" alt="" loading="lazy">`}<span>PROTOCOLE ${String(entries.indexOf(entry) + 1).padStart(2, '0')} / ${escapeHtml(stage.label)}</span></div>` : ''}<p class="eyebrow">${escapeHtml(horde?.operation ? 'MIRE / OPÉRATION DE TERRAIN' : horde ? 'ALERTE MIRE / HORDE SIMULTANÉE' : entry.act || (entry.eventV179 ? 'ALERTE MIRE / DUELS SUCCESSIFS' : this.branchV119 === 'contracts' ? 'CIBLE ASSIGNÉE' : 'ÉPREUVE FIXE'))}</p><h3>${escapeHtml(entry.title || entry.label)}</h3><strong>${escapeHtml(horde ? horde.pressureLabel : fighter?.label || 'Cible à définir')}${passage}</strong><p>${escapeHtml(entry.briefing || entry.description)}</p>${entry.bossFinaleV186 ? `<p class="xt-boss-order-v186">FINALE · ${escapeHtml(FIGHTERS.find(fighter => fighter.id === entry.bossFinaleV186.fighterId)?.label || 'Contact majeur')} · ${entry.bossFinaleV186.hp} PV</p>` : ''}${hordeStatsV180(horde)}${!horde && activity?.waveLabel ? `<p>${escapeHtml(activity.waveLabel)}</p>` : ''}${!horde ? `<p>${escapeHtml(getXenoTrialsRuleTextV119(activity?.rules || entry.rules))}</p>` : ''}${stage && !horde ? `<p>${escapeHtml(stage.label)}</p>` : ''}<span class="xt-activity-reward">${cleared ? 'VALIDÉ · Récompense déjà accordée' : `PRIME DE VALIDATION · ${activity?.reward ?? entry.reward ?? 0} crédits Trials`}</span><button type="button" class="button ${locked ? '' : 'primary'}" data-xt-activity="${entry.id}" ${locked ? 'disabled' : ''}>${locked ? archiveLocked ? lockedArchiveLabel : cleared ? 'CONTRAT TERMINÉ' : state.modesV119.challengeRun ? 'SÉRIE EN COURS' : 'ACCRÉDITATION REQUISE' : cleared ? 'REJOUER' : activity?.bout > 0 ? 'POURSUIVRE LA SÉRIE' : horde ? 'OUVRIR LE PROTOCOLE →' : 'BRIEFING · CHOISIR MON SPÉCIMEN'}</button></article>`;
    }).join('');
    const activity = this.activityV119 && resolveXenoTrialsActivityV119(this.activityV119, state.modesV119);
    const horde = combatBriefingV188(activity);
    this.el('briefing').innerHTML = activity ? `<div class="xt-briefing-identity"><p class="eyebrow">${escapeHtml(activity.supervisor || 'MIRE / ORDRES D’ÉVALUATION')}</p><h2>${escapeHtml(activity.title)}</h2><span>${horde?.operation ? 'OPÉRATION / OBJECTIF DE TERRAIN' : horde ? 'HORDE / CONFINEMENT CONTINU' : 'DOSSIER / ÉVALUATION COMPARATIVE'}</span></div><div class="xt-briefing-orders">${!horde && activity.waveLabel ? `<h3>PASSAGE ${activity.bout + 1}/${activity.opponentIds.length} · ${escapeHtml(activity.waveLabel)}</h3>` : ''}<p>${escapeHtml(activity.briefing || activity.description || 'Cible demandée par l’opérateur.')}</p>${horde ? `${hordeStatsV180(horde)}<p class="xt-horde-orders">${escapeHtml(horde.orders)}</p>` : `<strong>${escapeHtml(getXenoTrialsRuleTextV119(activity.rules))}</strong>`}${activity.secondary ? `<p>OBJECTIF SECONDAIRE · ${escapeHtml(activity.secondary.label)} · +50 crédits à la première validation.</p>` : ''}${activity.event ? `<p>${escapeHtml(activity.event)}</p>` : ''}</div>` : '';
  }

  confirmFighters() {
    if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult || !this.state().unlocked.includes(this.selected)) return false;
    const activity = this.activityV119 && resolveXenoTrialsActivityV119(this.activityV119, this.state().modesV119);
    if (activity?.forcedPlayerId && activity.forcedPlayerId !== this.selected
      || activity?.requiredFamily && FIGHTERS.find(f => f.id === this.selected)?.family !== activity.requiredFamily) return false;
    this.selectionStep = 'arena'; this.render(); this.form.elements.stageId.focus(); return true;
  }
  showFighters() {
    if (this.isRunning() || this.state().pending || this.unsavedResult) return false;
    this.closeRuntime(); this.selectionStep = 'fighters'; this.render(); this.el('confirm-fighters').focus(); return true;
  }
  continueEvaluationV119() {
    if (this.isRunning() || this.state().pending || this.unsavedResult) return false;
    const run = this.state().modesV119.challengeRun;
    if (run) {
      // The UI instance can outlive a save-owner change. A saved series owns
      // its branch, not the previous owner's ephemeral campaign selection.
      this.branchV119 = challengeBranchV179(run.id); return this.chooseActivityV119(run.id);
    }
    if (this.activityV119 && this.branchV119 !== 'on-demand') return this.chooseBranchV119(this.branchV119);
    return this.showFighters();
  }
  selectArena(id) {
    if (!this.active || this.selectionStep !== 'arena' || this.isRunning() || this.state().pending || this.unsavedResult || !STAGES.some(s => s.id === id)) return false;
    const activity = this.activityV119 && resolveXenoTrialsActivityV119(this.activityV119, this.state().modesV119);
    if (activity?.stageId && activity.stageId !== id) return false;
    this.form.elements.stageId.value = id; this.renderPreviews();
    this.root.querySelector(`[data-xt-arena="${id}"]`)?.focus(); return true;
  }
  syncSelectionMotionV230() {
    const motion = this.selectionMotionV230;
    if (!motion) return;
    if (!this.active) { motion.stop(); return; }
    const requests = [];
    if (['fighters', 'target'].includes(this.selectionStep)) {
      for (const slot of ['player', 'target']) {
        const host = this.el('portraits').querySelector?.(`[data-xt-selection-view="${slot}"]`);
        if (!host) continue;
        const target = slot === 'target';
        requests.push({ slot, host, fallback: host.querySelector('.xt-facing-preview'),
          id: target ? this.form.elements.opponentId.value : this.selected,
          variant: this.form.elements[target ? 'opponentVariant' : 'playerVariant'].value, facing: target ? -1 : 1 });
      }
    } else if (this.selectionStep === 'activities' && this.branchV119 === 'practice' && this.el('research-dossiers').open) {
      const id = this.el('research-preview-select').value;
      const host = this.el('research-preview'), fallback = this.el('research-preview-static');
      const visual = XENO_TRIALS_RESEARCH_FIGHTERS_V210.some(model => model.id === id) && getXenoTrialsSelectionVisualV230(id);
      if (visual && host && fallback) {
        if (this.lastResearchPreviewV230 !== id) {
          const [x, y] = visual.source;
          const [left, top, right, bottom] = visual.bounds;
          fallback.innerHTML = `<svg aria-hidden="true" viewBox="${x + left} ${y + top} ${right - left} ${bottom - top}">
            <image href="${escapeHtml(visual.path)}" width="${visual.textureWidth}" height="${visual.textureHeight}"/></svg>`;
          this.lastResearchPreviewV230 = id;
        }
        requests.push({ slot: 'research', host, fallback, id, facing: 1 });
      }
    }
    if (this.usesLocalMenuMediaV222()) motion.stop();
    else motion.sync(requests);
  }
  renderPreviews() {
    const state = this.state();
    const activity = this.activityV119 && resolveXenoTrialsActivityV119(this.activityV119, state.modesV119);
    const horde = combatBriefingV188(activity);
    const rules = state.pending?.config?.rulesV119 || activity?.rules;
    const ids = [this.selected, this.form.elements.opponentId.value];
    const previews = this.el('portraits');
    const openDossiers = new Set([...previews.querySelectorAll('details[open]')].map(dossier => dossier.dataset.profile));
    const showPreviews = ['fighters', 'target'].includes(this.selectionStep);
    const healthUnit = currentLanguageV185() === 'en' ? 'HP' : 'PV';
    previews.hidden = !showPreviews;
    previews.innerHTML = !showPreviews ? '' : ids.map((id, i) => {
      const f = FIGHTERS.find(entry => entry.id === id); if (!f) return '';
      const art = getXenoTrialsArtV96(id, this.form.elements[i ? 'opponentVariant' : 'playerVariant'].value);
      const variant = this.form.elements[i ? 'opponentVariant' : 'playerVariant'].value;
      const portrait = (this.usesLocalMenuMediaV222() && menuTileV222('fighter', f.id, f.variants.includes(variant) ? variant : null))
        || getXenoTrialsRecruitPreviewV230(f.id) || (art ? renderEnemyImportPreviewV103(art) || `<img src="${escapeHtml(art.path)}" alt="">` : '<p>VISUEL À DÉFINIR</p>');
      const walk = getEnemyImportAnimationV107(art);
      const attack = getEnemyImportAttackV109(art);
      const signature = getXenoTrialsSignatureV147(f);
      const grab = horde ? null : getXenoTrialsGroundGrabPairV212(f, FIGHTERS.find(entry => entry.id === ids[1 - i]));
      const techniques = signatureControls.map(([, kind, key]) => techniqueNote(getXenoTrialsAlternateSignatureV208(f, kind), key)).join('')
        + techniqueNote(getXenoTrialsRiposteV208(f), currentLanguageV185() === 'en' ? 'GUARD + I' : 'GARDE + I')
        + techniqueNote(grab, currentLanguageV185() === 'en' ? 'GUARD + K / LT + Y' : 'GARDE + K / LT + Y')
        + (hasXenoTrialsGroundTraversalV208(f) ? '<small>La commande de saut déclenche un franchissement au sol.</small>' : '');
      const rig=getXenoTrialsRigV154(f,art);
      const coverage = getXenoTrialsRuntimeAnimationCoverage(f.id);
      const admittedActions = getXenoTrialsRuntimeActionAtlases(f, art).map(atlas => drawnActionLabels[atlas.kind]);
      const motionLabel = coverage?.playerLabel || (rig ? (rig.id.startsWith('rig-v154-') ? 'Présentations, défi et réactions disponibles.' : 'Présentations et réactions disponibles.') : attack ? `Marche : 4 poses adaptées · ${attack.label}` : walk?.label);
      const gestures = (admittedActions.length ? admittedActions : [motionLabel]).filter(Boolean)
        .map(label => `<small>${escapeHtml(label)}</small>`).join('');
      const desiredFacing = i ? -1 : 1;
      const sourceFacing = art?.sourceFacing === 1 ? 1 : -1;
      const family = FAMILIES.find(entry => entry.id === getXenoTrialsSelectionFamilyV119(f))?.label || 'À DÉFINIR';
      const profile = getXenoTrialsRosterProfileV179(f);
      const playerLocked = !i && !state.unlocked.includes(id);
      const health = rules?.initialHp === 1 ? 1 : f.hp;
      const dossier = `${i}-${id}`;
      return `<figure class="xt-selection-preview" data-slot="${i ? 'target' : 'player'}">
        <div class="xt-specimen-window" data-xt-selection-view="${i ? 'target' : 'player'}" style="position:relative"><div class="xt-facing-preview" data-facing="${desiredFacing}" style="transform:scaleX(${desiredFacing * sourceFacing})">${portrait}</div></div>
        <figcaption class="xt-specimen-identity">
          <span class="xt-specimen-slot">${i ? horde ? 'CONTACT TYPE' : 'CIBLE D’ESSAI' : 'SPÉCIMEN AFFECTÉ'}</span>
          <strong>${escapeHtml(fighterLabelV230(f))}</strong>
          <span class="xt-specimen-family">${family} · ${roleLabel[f.role]}</span>
          <dl class="xt-specimen-stats"><div><dt>${horde && i ? 'Contact' : 'Santé'}</dt><dd>${escapeHtml(horde && i ? horde.healthLabel : `${health} ${healthUnit}`)}</dd></div><div><dt>Mobilité</dt><dd>${f.speed}</dd></div></dl>
          ${playerLocked ? '<span class="xt-specimen-hold">AFFECTATION VERROUILLÉE</span>' : ''}
        </figcaption>
        <details class="xt-specimen-dossier" data-profile="${dossier}" ${openDossiers.has(dossier) ? 'open' : ''}>
          <summary>Dossier de combat</summary>
          <div><strong>${escapeHtml(getXenoTrialsFighterSpecialLabelV147(f))}</strong>
          ${profile ? `<p class="xt-help">${escapeHtml(profile.tactic)}</p>` : ''}
          ${signature ? `<small data-xt-signature="${signature.id}">${escapeHtml(signature.description.replace('La prise au sol complète reste à produire.', '').trim())}</small>` : ''}
          ${hasXenoTrialsGrappleV153(f) ? '<small>Saisie rapprochée sur Commando WY, Guardian et Cultiste Darwin Era. Maintenir GARDE pour se dégager. Contre les autres spécimens, le bond reste une attaque de contact.</small>' : ''}
          <small>DOSSIER : ${escapeHtml(art?.sourceWork || art?.work || art?.sourceName || 'MIRE')}</small>${gestures}${techniques}</div>
        </details>
      </figure>`;
    }).join(`<span class="xt-versus" aria-hidden="true">${horde ? '×' : 'VS'}</span>`);
    this.syncSelectionMotionV230();
    const stage = STAGES.find(s => s.id === this.form.elements.stageId.value) || STAGES[0];
    const matchup = ids.map(id => FIGHTERS.find(f => f.id === id)?.label || '').join(' contre ');
    this.el('arena-matchup').textContent = horde ? `${FIGHTERS.find(f => f.id === this.selected)?.label} · ${horde.waveLabel} · ${horde.populationLabel} · ${horde.healthLabel}` : `${matchup} · Deux manches gagnantes`;
    this.el('arena-rules').textContent = horde?.operation ? horde.orders : horde ? `${horde.orders} Une seule évaluation ; votre santé est conservée entre les vagues.` : 'Deux manches gagnantes. Présentation des deux spécimens, puis décompte 3–2–1. Le chrono ne démarre qu’au signal de combat.';
    const locked = !this.active || this.selectionStep !== 'arena' || this.isRunning() || this.state().pending || this.unsavedResult;
    this.updateOfflineDuelV223(locked);
    const media = XENO_TRIALS_STAGE_MEDIA_V192.some(entry => entry.id === this.el('stage-media').value) ? this.el('stage-media').value : 'all';
    const page = getXenoTrialsStagePageV192(STAGES, { media, page: this.stagePageV192, selectedId: stage.id,
      revealSelected: this.stageSelectionV192 !== stage.id, assignedStageId: activity?.stageId });
    this.stagePageV192 = page.page; this.stageSelectionV192 = stage.id;
    this.el('stage-media').disabled = Boolean(locked || activity?.stageId);
    this.el('arena-selection').disabled = locked;
    this.el('stage-previous').disabled = locked || page.page === 0;
    this.el('stage-next').disabled = locked || page.page + 1 >= page.pages;
    this.el('stage-page').textContent = `ARÈNES · PAGE ${page.page + 1}/${page.pages} · ${page.start}–${page.end}/${page.total}`;
    this.el('stage-count').textContent = `${page.total} arènes répertoriées · Sélection : ${stage.label}`;
    const compact = this.usesLocalMenuMediaV222();
    this.el('arena-cards').innerHTML = page.stages.map(s => `<button type="button" class="xt-arena-card" data-xt-arena="${s.id}" aria-pressed="${s.id === stage.id}" ${locked || activity?.stageId && activity.stageId !== s.id ? 'disabled' : ''} style="--xt-back:${s.background};--xt-floor:${s.floor};--xt-accent:${s.accent}"><span class="xt-arena-thumbnail${s.stageRevision === 190 ? ' xt-atlas-preview-v190' : ''}">${stagePreviewImageV192(s, '', compact)}</span><strong>${escapeHtml(s.label)}</strong><small>${activity?.stageId ? 'Environnement assigné à l’évaluation' : s.backdrop ? 'SECTEUR RÉPERTORIÉ' : 'SECTEUR MIRE'} · 2D</small>${s.media ? `<small>${escapeHtml(stageMediaLabelV192(s))} · ${escapeHtml(s.sourceWork || '')}</small>` : ''}</button>`).join('') || '<p class="xt-help">Aucune arène pour ce support. Votre sélection est conservée.</p>';
    this.el('stage-preview').innerHTML = `<div class="xt-stage-scene${stage.stageRevision === 190 ? ' xt-atlas-preview-v190' : ''}" style="--xt-back:${stage.background};--xt-floor:${stage.floor};--xt-accent:${stage.accent}">${stagePreviewImageV192(stage, 'Aperçu du décor sélectionné', compact)}<span>${escapeHtml(stage.label)}</span></div><p>${horde ? `${horde.pressureLabel} · ${horde.waveLabel} · ${horde.healthLabel}` : matchup} · ${escapeHtml(stage.label)}</p>`;
  }

  updateOfflineDuelV223(locked) {
    if (!this.offlineDuels) return;
    const panel = this.el('offline-duel');
    panel.hidden = Boolean(locked || this.branchV119 !== 'on-demand');
    if (panel.hidden || !this.offlineDuels.available()) this.offlineSelectionV223 = null;
    else {
      const fields = this.form.elements;
      const duel = getXenoTrialsOfflineDuelV223({ playerId: this.selected, playerVariant: fields.playerVariant.value,
        opponentId: fields.opponentId.value, opponentVariant: fields.opponentVariant.value, stageId: fields.stageId.value });
      if (duel.key !== this.offlineSelectionV223?.duel.key) {
        const prepared = this.offlinePreparationsV224.get(duel.key);
        const selection = this.offlineSelectionV223 = prepared || { duel, state: 'checking' };
        if (!prepared) void this.offlineDuels.request('status', duel).then(state => this.finishOfflineDuelRequestV223(selection, state));
      }
    }
    this.renderOfflineDuelStatusV223();
  }

  renderOfflineDuelStatusV223() {
    const state = this.offlineSelectionV223?.state ?? 'unavailable';
    const offline = this.usesLocalMenuMediaV222();
    this.el('prepare-offline-duel').disabled = offline || !['missing', 'error'].includes(state);
    const message = {
      unavailable: 'Rechargez le terminal après son installation pour activer la préparation hors connexion.',
      checking: 'VÉRIFICATION DES MÉDIAS…', preparing: 'TÉLÉCHARGEMENT DU DUEL…',
      ready: 'DUEL PRÊT HORS CONNEXION',
      missing: offline ? 'Reconnectez-vous pour télécharger ce duel.' : 'Conservez les médias de ce duel sur cet appareil.',
      error: 'Téléchargement incomplet. Réessayez quand la connexion est disponible.',
    }[state];
    this.el('offline-duel-status').textContent = message;
    this.el('offline-duel').setAttribute('data-download', state);
  }

  finishOfflineDuelRequestV223(selection, state) {
    if (this.offlineSelectionV223 !== selection) return;
    selection.state = state;
    this.renderOfflineDuelStatusV223();
  }

  prepareOfflineDuelV223() {
    const selection = this.offlineSelectionV223;
    if (!selection || this.el('prepare-offline-duel').disabled) return;
    selection.state = 'preparing';
    this.offlinePreparationsV224.set(selection.duel.key, selection);
    this.renderOfflineDuelStatusV223();
    void this.offlineDuels.request('prepare', selection.duel).then(state => {
      this.offlinePreparationsV224.delete(selection.duel.key);
      this.finishOfflineDuelRequestV223(selection, state);
      const library = this.el('offline-library');
      if (!library.hidden && library.open) void this.refreshOfflineLibraryV224();
    });
  }

  updateOfflineLibraryV224(state, running) {
    if (!this.offlineDuels) return;
    const library = this.el('offline-library');
    const wasHidden = library.hidden;
    const available = this.offlineDuels.available();
    const controllerChanged = available !== this.offlineLibraryAvailableV224;
    this.offlineLibraryAvailableV224 = available;
    const showing = this.active && !running && (this.selectionStep === 'home' || (this.selectionStep === 'fighters' && state.pending));
    library.hidden = !showing;
    if (showing && library.open && (wasHidden || controllerChanged)) void this.refreshOfflineLibraryV224();
  }

  pendingOfflineDuelV224() {
    const config = this.state().pending?.config;
    return config ? getXenoTrialsOfflineDuelKeyV224(config) : null;
  }

  async refreshOfflineLibraryV224(message = '') {
    const list = this.el('offline-library-list'), status = this.el('offline-library-status');
    const request = this.offlineLibraryRequestV224 = {};
    const { state, entries } = await this.offlineDuels.list();
    if (this.offlineLibraryMutationV224 || this.offlineLibraryRequestV224 !== request) return;
    const locked = this.pendingOfflineDuelV224();
    const focused = this.root.ownerDocument.activeElement;
    const focusKey = list.contains(focused) && focused.dataset.xtRemoveDuel;
    const label = (id, variant) => {
      const name = getXenoTrialsFighterV96(id)?.label || id;
      return variant ? `${name} · ${variant === 'purple' ? 'Purple' : 'Grey'}` : name;
    };
    list.innerHTML = state === 'listed' ? entries.map(({ key, selection, ready }, index) => {
      const [player, playerVariant, opponent, opponentVariant, stage] = selection;
      const arena = STAGES.find(item => item.id === stage)?.label || stage;
      return `<li data-xt-offline-duel="${escapeHtml(key)}"><div><strong id="xt-offline-match-${index}">${escapeHtml(label(player, playerVariant))} / ${escapeHtml(label(opponent, opponentVariant))}</strong>
        <span id="xt-offline-arena-${index}">${escapeHtml(arena)}</span><small>${key === locked ? 'Duel en cours · téléchargement conservé' : ready ? 'Prêt hors connexion' : 'Téléchargement incomplet'}</small></div>
        <button type="button" class="button" data-xt-remove-duel="${escapeHtml(key)}" aria-describedby="xt-offline-match-${index} xt-offline-arena-${index}" ${key === locked ? 'disabled' : ''}>Retirer le téléchargement</button></li>`;
    }).join('') : '';
    status.textContent = message || (state === 'listed' ? entries.length ? '' : 'Aucun duel téléchargé sur cet appareil.'
      : state === 'unavailable' ? 'Rechargez le terminal après son installation pour activer la préparation hors connexion.'
        : 'Les téléchargements sont momentanément indisponibles.');
    if (focusKey) {
      const button = [...list.querySelectorAll('[data-xt-remove-duel]:enabled')].find(node => node.dataset.xtRemoveDuel === focusKey);
      (button || this.el('offline-library').querySelector('summary')).focus({ preventScroll: true });
    }
  }

  async removeOfflineDuelV224(key) {
    if (this.offlineLibraryMutationV224 || key === this.pendingOfflineDuelV224()) return;
    this.offlineLibraryMutationV224 = key;
    this.offlineLibraryRequestV224 = null;
    this.el('offline-library-status').textContent = 'Retrait du téléchargement…';
    for (const button of this.el('offline-library-list').querySelectorAll('button')) button.disabled = true;
    const removed = await this.offlineDuels.remove(key);
    this.offlineLibraryMutationV224 = null;
    if (this.offlineSelectionV223?.duel.key === key && !this.offlinePreparationsV224.has(key)) {
      this.offlineSelectionV223 = null;
      this.updateOfflineDuelV223(!this.active || this.selectionStep !== 'arena' || this.isRunning() || this.state().pending || this.unsavedResult);
    }
    const library = this.el('offline-library');
    if (!library.hidden && library.open) {
      await this.refreshOfflineLibraryV224(removed ? 'Téléchargement retiré.' : 'Le téléchargement n’a pas pu être retiré.');
      if (library.contains(this.root.ownerDocument.activeElement) || this.root.ownerDocument.activeElement === this.root.ownerDocument.body)
        library.querySelector('summary').focus({ preventScroll: true });
    }
  }
  cancelResultRetry() {
    if (this.resultRetryTimer == null) return;
    clearTimeout(this.resultRetryTimer);
    this.resultRetryTimer = null;
  }
  closeRuntime() {
    this.selectionMotionV230?.stop();
    this.labRuntimeV209?.stop(); this.labRuntimeV209 = null;
    this.el('practice-hud').hidden = this.el('practice-restart').hidden = true;
    this.practiceAnnouncementV207 = this.practiceContactV209 = this.practiceRecordingStatusV209 = null;
    this.cancelResultRetry();
    this.runtime?.stop();
    this.el('pause-overlay').hidden = true;
    if (!this.el('controls').hidden) this.setPauseCommands(false);
    this.root.removeAttribute('data-xt-paused');
    this.root.removeAttribute('data-xt-outro');
    this.el('skip-sequence').hidden = true;
    this.el('finisher').hidden = this.el('finisher-alternative').hidden = true;
    this.el('finisher').disabled = this.el('finisher-alternative').disabled = true;
    this.el('finisher-status').textContent = ''; this.lastFinisherMessage = '';
    this.el('taunt').hidden = this.el('taunt').disabled = true;
    this.generation++; this.runtime = null; this.loading = false; this.lastStatus = null;
    this.lastResumedTickV186 = null; this.lastGamepadHintV186 = null;
  }
  setPauseCommands(show) {
    this.el('pause-main').hidden = show;
    this.el('controls').hidden = !show;
    const overlay = this.el('pause-overlay');
    overlay.setAttribute('aria-labelledby', show ? 'xeno-trials-commands-title-v217' : 'xeno-trials-pause-title-v119');
    overlay.scrollTop = 0;
  }
  exitTabletFullscreen() {
    const doc = this.root.ownerDocument;
    if (doc?.fullscreenElement === this.root) void doc.exitFullscreen().catch(() => {});
  }
  close() {
    if (this.unsavedResult) this.finish(this.unsavedResult);
    this.closeRuntime(); this.active = false; this.unsavedResult = null; this.lastStatus = null;
    this.exitTabletFullscreen();
    this.root.ownerDocument?.documentElement?.classList?.remove('xt-fullscreen-v119');
    this.el('retry-save').hidden = true; this.el('next').hidden = true;
    this.el('result').textContent = '';
  }
  begin(gesture = null) {
    if (this.selectionStep !== 'arena' || this.isRunning() || this.unsavedResult) return;
    const config = Object.fromEntries(new FormData(this.form)); config.playerId = this.selected;
    if (this.offlineLibraryMutationV224 && this.offlineLibraryMutationV224 === getXenoTrialsOfflineDuelKeyV224(config)) {
      this.message('Attendez la fin du retrait du téléchargement avant de lancer ce duel.');
      return;
    }
    if (this.activityV119) {
      config.activityV119 = { ...this.activityV119 };
      if (this.branchV119 === 'on-demand') config.activityV119.rules = requestedRulesV119(this.form.elements.requestedRules.value);
    }
    const transaction = beginXenoTrialsV96(this.getProgress(), config, {
      arbiterProgressV190: this.getCampaignProgress?.(), standaloneV207: this.standaloneV207,
    });
    if (!transaction.applied && transaction.reason === 'arbiter-archives-locked') this.message(this.archiveAccessV207().notice);
    if (this.commit(transaction)) { this.el('result').textContent = ''; void this.launch(transaction.config, gesture); }
  }
  startResearchLabV209(id) {
    if (!this.active || !this.canCommit() || this.branchV119 !== 'practice' || this.selectionStep !== 'activities'
      || this.state().pending || this.isRunning() || !XENO_TRIALS_RESEARCH_LABS_V209.some(lab => lab.id === id)) return false;
    this.closeRuntime();
    const generation = this.generation;
    this.selectionStep = 'lab'; this.render(); this.root.scrollTop = 0;
    this.labRuntimeV209 = createXenoTrialsResearchLabRuntimeV209(this.el('practice-lab-panel'), id, {
      onLeave: () => {
        if (generation !== this.generation) return;
        this.closeRuntime(); this.selectionStep = 'activities'; this.render();
        this.root.querySelector(`[data-xt-lab="${id}"]`)?.focus({ preventScroll: true });
      },
      onComplete: labId => {
        if (!this.active || generation !== this.generation || !this.canCommit()) return false;
        const transaction = completeXenoTrialsResearchLabV209(this.getProgress(), labId);
        return !transaction.applied || this.commit(transaction, { pauseOnFailure: false });
      },
    });
    return Boolean(this.labRuntimeV209);
  }
  startPracticeV207(id, gesture) {
    if (this.branchV119 !== 'practice' || this.state().pending || !['activities', 'combat'].includes(this.selectionStep)) return false;
    if (this.selectionStep === 'activities') this.researchEvaluationV209 = null;
    const practiceSandboxV208 = id === XENO_TRIALS_SANDBOX_ID_V208
      ? this.researchEvaluationV209 ?? this.state().practiceSandboxV208 : undefined;
    const config = getXenoTrialsPracticeConfigV207(id, practiceSandboxV208);
    if (!config) return false;
    return this.launch(config, gesture, id, practiceSandboxV208, this.state().practiceRecordingV209);
  }
  startResearchEvaluationV209(id, gesture) {
    if (this.branchV119 !== 'practice' || this.selectionStep !== 'activities' || this.state().pending) return false;
    const settings = getXenoTrialsResearchEvaluationV210(id);
    if (!settings) return false;
    this.researchEvaluationV209 = settings;
    return this.launch(getXenoTrialsPracticeConfigV207(XENO_TRIALS_SANDBOX_ID_V208, settings), gesture, XENO_TRIALS_SANDBOX_ID_V208, settings);
  }
  async launch(config, gesture = null, practiceV207 = null, practiceSandboxV208 = undefined, practiceRecordingV209 = undefined) {
    if (!config || !this.active || !this.canCommit() || this.isRunning() || this.unsavedResult) return false;
    this.closeRuntime(); const generation = this.generation;
    if (practiceV207) this.el('result').textContent = '';
    this.selectionStep = 'combat'; this.loading = true; this.render(); this.message(config.activityV119?.branch === 'horde' || config.hordeV180 ? 'MIRE / PRÉPARATION DU SECTEUR ET DES CONTACTS…' : 'MIRE / PRÉPARATION DES DEUX SPÉCIMENS…');
    try {
    const ticket = practiceV207 ? null : this.state().pending;
    const runtime = createXenoTrialsRuntimeV96({ practiceV207, practiceSandboxV208, practiceRecordingV209, canvas: this.el('canvas'), config,
      touchZonesV217: true, statusElement: null, htmlHud: true,
      audioDirector: this.audioDirector, audioEnabled: this.audioEnabledV189, reducedMotion: this.getReducedMotion(),
      canActivateFinisher: () => this.active && generation === this.generation && this.canCommit()
        && !this.unsavedResult && !this.getProgress()?.pending,
      resumeSnapshot: ticket?.checkpointV186?.snapshot,
      resumeDuelSnapshot: ticket?.duelCheckpointV197?.snapshot,
      onCheckpoint: practiceV207 ? null : snapshot => this.persistCheckpointV186(snapshot, generation),
      onState: snapshot => { if (this.active && generation === this.generation) this.updateMatch(snapshot); },
      onResult: practiceV207 ? null : result => { if (this.active && generation === this.generation && this.canCommit()) this.finish(result); },
      onExit: () => this.runtime?.pause(),
    });
    this.runtime = runtime;
      void runtime.unlockAudio?.(gesture);
      const ready = await runtime.start();
      if (generation !== this.generation || !this.active || !this.canCommit()) {
        runtime.stop();
        if (generation === this.generation) { this.closeRuntime(); this.render(); }
        return false;
      }
      this.loading = false;
      if (ready === false) {
        this.closeRuntime();
        if (practiceV207) this.selectionStep = 'activities';
        this.render();
        if (practiceV207) this.el('activity-count').append(' · Liaison visuelle interrompue. Relancez l’atelier.');
        else {
          this.message('Liaison visuelle interrompue. Rétablissez la connexion puis relancez l’évaluation sauvegardée.');
          if (!this.el('restart').hidden && this.root.ownerDocument?.hasFocus?.() !== false)
            this.el('restart').focus({ preventScroll: true });
        }
        return false;
      }
      this.render(); this.root.scrollTop = 0;
      if (!runtime.getState().paused && this.root.ownerDocument?.hasFocus?.() !== false) this.el('canvas').focus({ preventScroll: true });
      return true;
    } catch (error) {
      if (generation !== this.generation) return false;
      this.closeRuntime();
      if (practiceV207) this.selectionStep = 'activities';
      this.render();
      if (practiceV207) this.el('activity-count').append(' · Atelier indisponible.');
      else this.message(`Duel non lancé : ${error.message}`);
      return false;
    }
  }
  persistCheckpointV186(snapshot, generation) {
    if (!this.active || generation !== this.generation || !this.canCommit() || this.unsavedResult) return false;
    const save = snapshot.hordeV180 ? checkpointXenoTrialsV186 : checkpointXenoTrialsDuelV197;
    const transaction = save(this.getProgress(), snapshot);
    if (!transaction.applied) return false;
    try {
      this.onCommit(transaction.state);
      this.el('retry-checkpoint').hidden = this.el('retry-checkpoint-overlay').hidden = true;
      this.el('checkpoint-status').textContent = snapshot.operationV188 ? 'REPRISE CONSERVÉE · OBJECTIFS ET DANGERS ENREGISTRÉS'
        : snapshot.hordeV180 ? `REPRISE CONSERVÉE · VAGUE ${snapshot.hordeV180.wave} / ${snapshot.hordeV180.waveCount}`
          : 'REPRISE CONSERVÉE · ÉTAT DU DUEL ENREGISTRÉ';
      return true;
    } catch {
      this.el('retry-checkpoint').hidden = this.el('retry-checkpoint-overlay').hidden = false;
      this.el('checkpoint-status').textContent = 'Reprise non sauvegardée. Réessayez avant de quitter le terminal.';
      return false;
    }
  }
  persistPracticeV207(practice) {
    if (practice?.state !== 'complete') return false;
    const transaction = completeXenoTrialsPracticeV207(this.getProgress(), practice.id);
    const saved = !transaction.applied || this.commit(transaction, { pauseOnFailure: false });
    this.el('practice-save').hidden = saved;
    this.el('practice-target').textContent = saved ? 'ATELIER VALIDÉ' : 'ATELIER VALIDÉ · SAUVEGARDE À RÉESSAYER';
    return saved;
  }
  recordPracticeV209(event) {
    const runtime = this.runtime, snapshot = runtime?.getState();
    const recording = snapshot?.practiceV207?.telemetryV209?.recording;
    if (!this.active || !recording || !this.canCommit()) return;
    if (recording.ready) {
      const transaction = saveXenoTrialsRecordingV209(this.getProgress(), runtime.getPracticeRecordingV209());
      if (!transaction.unchanged && !this.commit(transaction, { pauseOnFailure: false })) {
        this.el('practice-record-status').textContent = 'Enregistrement non sauvegardé.';
        return;
      }
      runtime.acknowledgePracticeRecordingV209();
    } else if (!snapshot.paused && snapshot.practiceV207.state === 'active') {
      void runtime.unlockAudio?.(event);
      runtime.setPracticeRecordingV209(!recording.active);
      this.el('canvas').focus({ preventScroll: true });
    }
    const next = runtime.getState();
    this.updatePracticeTelemetryV209(next.practiceV207, next.paused);
  }
  updatePracticeTelemetryV209(practice, paused) {
    const panel = this.el('practice-telemetry'), telemetry = practice?.telemetryV209;
    panel.hidden = !telemetry;
    if (!telemetry) return;
    const { lastContact, recording } = telemetry;
    const contact = lastContact ? [lastContact.id, lastContact.tick, lastContact.kind, lastContact.source, lastContact.damage].join('/') : '';
    if (this.practiceContactV209 !== contact) {
      this.practiceContactV209 = contact;
      for (const side of ['player', 'opponent']) for (const [key, value] of Object.entries(telemetry[side]))
        this.el(`practice-${side}-${key}`).textContent = String(value);
      if (lastContact) {
        const kind = { impact: 'IMPACT', block: 'BLOCAGE', rupture: 'RUPTURE', parry: 'PARADE' }[lastContact.kind];
        const actor = lastContact.source === 'player' ? 'VOUS' : 'ADVERSAIRE';
        this.el('practice-last-contact').textContent = `${kind} · ${actor} · ${lastContact.damage} PV · #${lastContact.tick}`;
      } else this.el('practice-last-contact').textContent = '';
    }
    const control = this.el('practice-record'), progress = this.el('practice-record-progress');
    control.disabled = !recording.ready && (paused || practice.state !== 'active');
    control.textContent = recording.ready ? 'SAUVEGARDER LA SÉQUENCE' : recording.active ? 'ARRÊTER L’ENREGISTREMENT' : 'ENREGISTRER MES COMMANDES';
    progress.hidden = !recording.active; progress.value = recording.duration;
    const status = recording.error ? 'Séquence trop courte.' : recording.ready ? 'Séquence prête à sauvegarder.'
      : recording.active ? 'Enregistrement en cours.' : recording.available ? 'Séquence sauvegardée. Sélectionnez Enregistrement en boucle pour la rejouer.'
        : 'Enregistrez jusqu’à huit secondes pour les rejouer en miroir sur la cible.';
    if (this.practiceRecordingStatusV209 !== status) {
      this.practiceRecordingStatusV209 = status;
      this.el('practice-record-status').textContent = status;
    }
  }
  updatePracticeV207(practice) {
    const hud = this.el('practice-hud');
    hud.hidden = !practice;
    if (!practice) return;
    const announcement = [practice.id, practice.index, practice.state, practice.cue, practice.retryCue].join('/');
    if (announcement === this.practiceAnnouncementV207) return;
    this.practiceAnnouncementV207 = announcement;
    hud.dataset.state = practice.state;
    const progress = this.el('practice-progress');
    progress.hidden = Boolean(practice.sandbox);
    progress.max = Math.max(1, practice.objectives.length);
    progress.value = practice.index;
    this.el('practice-title').textContent = practice.title;
    this.el('practice-tip').textContent = practice.briefing;
    const target = this.el('practice-target');
    if (practice.sandbox) {
      target.textContent = { player: 'BANC LIBRE · VICTOIRE', opponent: 'BANC LIBRE · DÉFAITE', draw: 'BANC LIBRE · ÉGALITÉ' }[practice.result] ?? '';
    } else if (practice.state === 'complete') target.textContent = 'ATELIER VALIDÉ';
    else if (practice.state === 'retry') {
      target.textContent = practice.id === 'intro-rearm' && practice.index === 0
        ? 'PRÉSENTATION TERMINÉE · REJOUER POUR LA PASSER' : `${practice.retryCue || 'EXERCICE INTERROMPU'} · REJOUER`;
    } else {
      const objective = escapeHtml(practice.objectives[practice.index]);
      target.innerHTML = `<span>${objective}</span>${practice.cue ? ` · <span>${escapeHtml(practice.cue)}</span>` : ''}`;
    }
    this.el('practice-actions').hidden = practice.state === 'active';
    this.el('practice-save').hidden = true;
    if (practice.state === 'complete') this.persistPracticeV207(practice);
  }
  updateMatch(snapshot) {
    const practice = snapshot.practiceV207;
    this.updatePracticeV207(practice);
    this.updatePracticeTelemetryV209(practice, snapshot.paused);
    const audio = snapshot.audioV189;
    this.el('audio-toggle').disabled = !audio?.supported || Boolean(this.unsavedResult);
    this.el('audio-toggle').setAttribute('aria-pressed', String(audio?.enabled ?? this.audioEnabledV189));
    this.el('audio-toggle').textContent = audio?.enabled === false ? 'ACTIVER LES SONS DE TRIALS' : 'COUPER LES SONS DE TRIALS';
    const deviceHint = snapshot.gamepadV186?.connected ? snapshot.gamepadV186.needsNeutral
      ? 'MANETTE CONNECTÉE · Relâchez les commandes pour reprendre.' : 'MANETTE CONNECTÉE' : 'CLAVIER / TACTILE';
    if (deviceHint !== this.lastGamepadHintV186) {
      this.el('input-device').textContent = deviceHint; this.lastGamepadHintV186 = deviceHint;
    }
    if ((snapshot.resumedV186 || snapshot.resumedV197) && snapshot.paused
      && snapshot.checkpointV186?.saved !== false && this.lastResumedTickV186 !== snapshot.tick) {
      this.el('checkpoint-status').textContent = snapshot.resumedV197 ? 'Duel restauré. Reprenez avec P, Start ou le bouton Reprendre.'
        : snapshot.operationV188 ? 'Reprise de l’opération conservée. Reprenez avec P, Start ou le bouton Reprendre.'
          : 'Reprise de la vague conservée. Reprenez avec P, Start ou le bouton Reprendre.';
      this.lastResumedTickV186 = snapshot.tick;
    }
    const wasPaused = this.root.getAttribute('data-xt-paused') === 'true';
    const horde = getXenoTrialsHordeViewV180(snapshot);
    const operation = snapshot.operationViewV188 || getXenoTrialsOperationHudV188(snapshot);
    this.root.setAttribute('data-xt-operation', String(Boolean(operation)));
    this.el('operation-hud').hidden = !operation;
    this.el('operation-input-hint').hidden = this.el('operation-orders').hidden = !operation;
    if (operation) this.el('operation-orders').textContent = operation.orders;
    const interactControl = this.root.querySelector('[data-xeno-action="interact"]');
    if (interactControl) interactControl.hidden = !operation;
    if (operation) {
      this.el('operation-title').textContent = operation.title;
      this.el('operation-phase').textContent = snapshot.paused ? 'PAUSE' : operation.phase;
      const operationInstruction = this.el('operation-instruction'), beacon = operation.beaconWindow;
      const purge = operation.purgeV204;
      const work = operation.extractionWorkV203 || purge?.work;
      this.el('operation-task-text').textContent = operation.instruction;
      this.el('operation-work-value').textContent = beacon ? ` · ${beacon.seconds} s` : work?.contact ? ` · ${work.percent} %` : '';
      operationInstruction.setAttribute('data-beacon-window', beacon ? beacon.open ? 'open' : 'closed' : '');
      operationInstruction.setAttribute('data-extraction-work', String(Boolean(operation.extractionWorkV203?.contact)));
      operationInstruction.setAttribute('data-purge-work', String(Boolean(purge?.work?.contact)));
      this.el('operation-progress').max = Math.max(1, operation.progress.total);
      this.el('operation-progress').value = operation.progress.done;
      this.el('operation-progress-value').textContent = operation.progress.label;
      this.el('operation-integrity').textContent = operation.integrity === null || operation.integrity === undefined ? '' : `INTÉGRITÉ ${Math.ceil(operation.integrity)} / 100`;
      const pressureLine = this.el('operation-pressure'), pressure = purge?.pressure;
      pressureLine.hidden = !pressure;
      pressureLine.setAttribute('data-phase', pressure?.phase || '');
      this.el('operation-pressure-value').textContent = pressure ? ` · −${pressure.expectedLoss} / ${pressure.seconds} s` : '';
      const operationHint = this.el('operation-hint');
      operationHint.hidden = Boolean(beacon || purge?.work?.contact);
      operationHint.textContent = operation.hint;
      const hazard = snapshot.stageHazardViewV188;
      const escape = purge?.escape;
      const escapeHint = escape ? `SORTIE DE ZONE · ${escape.preferred === 'left' ? '←' : '→'}` : hazard?.hint || 'Quittez la zone balisée.';
      const hazardLabel = hazard && ['warning', 'active'].includes(hazard.phase)
        ? `${hazard.phase === 'warning' ? 'DANGER ANNONCÉ' : 'DANGER ACTIF'} · ${hazard.label} · ${escapeHint}` : '';
      const isolation = hazard?.isolationV212;
      const isolationLabel = isolation ? `CIRCUITS ISOLÉS · ${isolation.isolated}/${isolation.circuits.length}` : '';
      const cargoInterlock = hazard?.cargoInterlockV213;
      const cargoLabel = cargoInterlock ? cargoInterlock.armed ? `RAMPE ARMÉE · ${cargoInterlock.armed}` : 'RAMPES HORS TENSION' : '';
      this.el('operation-hazard').textContent = hazardLabel || isolationLabel || cargoLabel;
      this.el('operation-hazard').setAttribute('data-active', String(hazard?.phase === 'active'));
    }
    if (!horde || snapshot.phase === 'match-over')
      this.el('retry-checkpoint').hidden = this.el('retry-checkpoint-overlay').hidden = true;
    const hudFighters = horde ? snapshot.fighters.slice(0, 1) : snapshot.fighters.slice(0, 2);
    this.root.setAttribute('data-xt-mode', horde ? 'horde' : 'duel');
    this.el('combat-hud').setAttribute('data-horde', String(Boolean(horde)));
    this.el('opponent-vitals').hidden = Boolean(horde);
    this.el('horde-hud').hidden = !horde;
    this.el('boss-hud').hidden = !horde?.boss;
    if (horde?.boss) {
      this.el('boss-name').textContent = FIGHTERS.find(fighter => fighter.id === horde.boss.fighterId)?.label || 'Contact majeur';
      this.el('boss-phase').textContent = horde.bossPhase;
      this.el('boss-hp').max = horde.boss.maxHp;
      this.el('boss-hp').value = horde.boss.hp;
      this.el('boss-hp-value').textContent = `${Math.ceil(horde.boss.hp)} / ${horde.boss.maxHp} PV`;
    }
    if (horde) {
      this.el('horde-alive').textContent = String(horde.alive);
      this.el('horde-remaining').textContent = String(horde.remaining);
      const hordePhase = this.el('horde-phase');
      hordePhase.textContent = horde.reinforcement?.label || (operation ? 'CONTACTS DE TERRAIN' : horde.phase);
      hordePhase.setAttribute('data-reinforcement', String(Boolean(horde.reinforcement)));
      this.el('horde-kills').textContent = `${horde.kills} / ${horde.total} NEUTRALISÉS`;
      this.el('horde-progress').max = Math.max(1, horde.total);
      this.el('horde-progress').value = horde.kills;
      const announcement = operation ? `${snapshot.paused ? 'PAUSE' : operation.phase}${operation.beaconWindow ? ' · ' : '. '}${operation.instruction}` : horde.announcement;
      if (this.hordeAnnouncementV180 !== announcement) {
        this.el('horde-announcement').textContent = announcement;
        this.hordeAnnouncementV180 = announcement;
      }
    } else if (this.hordeAnnouncementV180) { this.el('horde-announcement').textContent = ''; this.hordeAnnouncementV180 = null; }
    this.el('health').textContent = hudFighters.map((f, i) => `${i === 0 ? 'Vous' : 'Adversaire'} : ${Math.ceil(f.hp)} PV · ${Math.floor(f.stamina)} endurance`).join(' / ');
    // HTML meters retain readable text/touch scale even on a narrow canvas.
    // They only reflect the runtime snapshot; no combat values are written here.
    for (const [i, fighter] of hudFighters.entries()) {
      const side = i === 0 ? 'player' : 'opponent', definition = getXenoTrialsFighterV96(fighter.id);
      this.el(`${side}-name`).textContent = fighterLabelV230(definition);
      this.el(`${side}-name`).setAttribute('title', fighterLabelV230(definition));
      for (const key of ['hp', 'stamina']) {
        const maximum=key==='hp' && snapshot.config?.rulesV119?.initialHp===1 ? 1 : definition[key];
        const current = Math.max(0, Math.min(maximum, fighter[key]));
        const meter = this.el(`${side}-${key}`);
        meter.max = maximum; meter.value = current;
        meter.setAttribute('data-low', String(current <= maximum * .25));
        this.el(`${side}-${key}-value`).textContent = key === 'hp' ? `${Math.ceil(current)} / ${maximum} PV` : `Endurance ${Math.floor(current)} / ${maximum}`;
      }
    }
    for (const [i, fighter] of hudFighters.entries()) {
      const side = i ? 'opponent' : 'player', definition = getXenoTrialsFighterV96(fighter.id);
      const state = getXenoTrialsSuperReadinessV148(snapshot, fighter, definition);
      const meter = this.el(`${side}-super`), label = this.el(`${side}-super-value`);
      meter.hidden = label.hidden = !state.supported;
      meter.max = state.maximum; meter.value = state.meter;
      meter.setAttribute('title', getXenoTrialsSuperStatusV148(state));
      label.textContent = `SUPER ${Math.floor(state.meter)} / ${state.maximum}${state.ready ? ' · PRÊT' : ''}`;
      if (!i) {
        const parry = getXenoTrialsParryViewV208(snapshot, fighter);
        const riposte = getXenoTrialsRiposteReadinessV208(snapshot, fighter, definition);
        const crossing = hasXenoTrialsGroundTraversalV208(definition);
        if (this.groundTraversalV208 !== crossing) {
          this.groundTraversalV208 = crossing;
          const jump = this.root.querySelector('[data-xeno-action="jump"]');
          const jumpLabel = jump.querySelector?.('dt') || jump;
          jumpLabel.textContent = crossing ? 'Franchir au sol' : controlLabel.jump;
        }
        const hint = this.el('parry-status');
        const grapple = snapshot.grappleViewV153;
        const counterLesson = !practice || practice.sandbox || practice.id === 'grab-counter';
        const escape = counterLesson && !snapshot.paused && grapple?.target === 'player' ? grapple.escapeV213?.state : null;
        const counter = escape === 'ready' ? 'CONTRE · GARDE + RAPIDE' : escape === 'committed' ? 'MAINTENEZ GARDE'
          : escape === 'failed' ? 'GARDE · SORTIE STANDARD' : '';
        const recoveryHint = getXenoTrialsGroundRecoveryHintV218(snapshot, fighter);
        const notice = counter || recoveryHint || (riposte.ready ? 'RIPOSTE · GARDE + SUPER' : parry.openingTicks > 0 ? 'OUVERTURE' : parry.active ? 'PARADE' : '');
        if (this.lastParryNoticeV208 !== notice) {
          this.lastParryNoticeV208 = notice;
          hint.hidden = !notice;
          hint.textContent = notice;
        }
        for (const [action, kind] of signatureControls) {
          const control = this.root.querySelector(`[data-xeno-action="${action}"]`);
          const technique = getXenoTrialsAlternateSignatureV208(definition, kind);
          control.hidden = !technique || Boolean(snapshot.config?.rulesV119?.noSpecial);
          if (technique) control.setAttribute('title', localizedTechnique(technique, 'label'));
        }
        const button = this.root.querySelector('[data-xeno-action="super"]');
        const superHint = riposte.ready ? getXenoTrialsRiposteStatusV208(riposte, currentLanguageV185()) : getXenoTrialsSuperStatusV148(state);
        button.hidden = !state.supported;
        button.setAttribute('aria-disabled', String(!state.ready && !riposte.ready));
        button.setAttribute('title', superHint);
        button.setAttribute('aria-label', superHint);
      }
    }
    this.el('clock').textContent = String(Math.ceil(snapshot.timeRemaining));
    this.el('clock').setAttribute('data-low', String(snapshot.timeRemaining <= 10));
    this.el('round').textContent = practice && !practice.sandbox && !horde ? `ATELIER · ${snapshot.round}` : operation ? 'OPÉRATION' : horde ? horde.waveLabel : `MANCHE ${snapshot.round}`;
    this.el('score').textContent = practice && !practice.sandbox && !horde ? `${practice.index} / ${practice.objectives.length}` : operation ? `${operation.progress.done} / ${operation.progress.total}` : horde ? `${horde.kills} / ${horde.total}` : `${snapshot.wins.player} — ${snapshot.wins.opponent}`;
    this.el('score').setAttribute('aria-label', practice && !practice.sandbox && !horde || operation ? 'Objectifs validés' : horde ? 'Contacts neutralisés sur la population totale' : 'Manches gagnées : joueur — adversaire');
    const phase = snapshot.paused ? 'PAUSE' : snapshot.presentation?.blocksSimulation ? snapshot.presentation.countdown ? `DÉPART DANS ${snapshot.presentation.countdown}` : 'PRÉSENTATION DES SPÉCIMENS' : { intro: 'PRÉPARATION', active: 'COMBAT', 'round-over': 'FIN DE MANCHE', 'match-over': 'ÉVALUATION TERMINÉE' }[snapshot.phase];
    const grapple = snapshot.grappleViewV153;
    const text = practice ? `${practice.title}${snapshot.paused ? ' · PAUSE' : ''}` : operation ? `${operation.phase} · ${operation.instruction}` : horde ? `${horde.phase} · ${horde.waveLabel}` : `${grapple?.target === 'player' ? 'SAISIE · MAINTENIR S / GARDE POUR SE DÉGAGER · ' : ''}${phase} · Manche ${snapshot.round} · ${snapshot.wins.player} — ${snapshot.wins.opponent} · ${Math.ceil(snapshot.timeRemaining)} s`;
    if (this.lastStatus !== text && !this.unsavedResult) { this.message(text); this.lastStatus = text; }
    this.el('next').hidden = Boolean(horde) || snapshot.phase !== 'round-over';
    const outroPlaying = isOutroPlaying(snapshot);
    const canActivateFinisher = Boolean(snapshot.canActivateFinisherV207 && !this.unsavedResult);
    const finisherButton = this.el('finisher');
    const alternativeButton = this.el('finisher-alternative');
    const alternative = snapshot.finisherV207?.alternatives?.[0];
    const canChooseAlternative = canActivateFinisher && Boolean(alternative);
    const focused = this.root.ownerDocument?.activeElement;
    if (!snapshot.paused && (!canActivateFinisher && focused === finisherButton || !canChooseAlternative && focused === alternativeButton))
      this.el('canvas').focus({ preventScroll: true });
    finisherButton.hidden = finisherButton.disabled = !canActivateFinisher;
    alternativeButton.hidden = alternativeButton.disabled = !canChooseAlternative;
    if (canChooseAlternative) {
      const label = getXenoTrialsFinisherCopyV208(alternative.kind).button.slice('F · '.length);
      if (this.lastFinisherAlternative !== label) {
        this.lastFinisherAlternative = label;
        alternativeButton.textContent = label;
      }
    }
    const finisherStatus = this.el('finisher-status');
    const finisherCopy = getXenoTrialsFinisherCopyV208(snapshot.finisherV207?.kind);
    if (this.lastFinisherButton !== finisherCopy.button) {
      this.lastFinisherButton = finisherCopy.button;
      finisherButton.textContent = finisherCopy.button;
    }
    const finisherMessage = canActivateFinisher ? finisherCopy.offered : snapshot.finisherV207?.phase === 'playing' ? finisherCopy.playing : '';
    if (this.lastFinisherMessage !== finisherMessage) {
      this.lastFinisherMessage = finisherMessage;
      finisherStatus.textContent = finisherMessage;
    }
    this.el('taunt').hidden = Boolean(horde) || snapshot.phase === 'match-over' || !getXenoTrialsSequenceV155(getXenoTrialsRigV154(FIGHTERS.find(f=>f.id===snapshot.fighters[0].id),getXenoTrialsArtV96(snapshot.fighters[0].id,snapshot.fighters[0].variant)), 'taunt');
    this.el('taunt').disabled=!snapshot.canTauntV156 || Boolean(this.unsavedResult);
    this.root.setAttribute('data-xt-outro',String(outroPlaying));
    const skip = this.el('skip-sequence');
    skip.hidden = skip.disabled = !snapshot.canSkipSequenceV212;
    skip.textContent = outroPlaying ? 'PASSER LA SÉQUENCE FINALE'
      : practice?.awaitingOutroV211 ? 'FERMER LA PRÉSENTATION FINALE' : 'PASSER LA PRÉSENTATION';
    this.el('pause').disabled = Boolean(practice && practice.state !== 'active' || snapshot.phase === 'match-over' && !outroPlaying || this.unsavedResult);
    this.el('pause').textContent = snapshot.paused ? 'REPRENDRE' : 'PAUSE';
    this.el('pause-overlay').hidden = !snapshot.paused || snapshot.phase === 'match-over' && !outroPlaying;
    if (!wasPaused || this.el('pause-overlay').hidden) {
      if (!this.el('controls').hidden) this.setPauseCommands(false);
    }
    // A completed result has already settled its ticket. Its presentation can
    // pause, but offering abandonment here would be an impossible no-op.
    const canAbandon = snapshot.phase !== 'match-over' && Boolean(practice?.state === 'active' || this.getProgress()?.pending) && !this.unsavedResult;
    this.el('practice-restart').hidden = practice?.state !== 'active';
    this.el('abandon-overlay').hidden = !canAbandon;
    this.el('abandon-overlay').disabled = !canAbandon;
    // A newly visible modal must own keyboard focus. Background/visibility
    // pauses wait for the next explicit interaction instead of stealing focus.
    if (!this.el('pause-overlay').hidden && !wasPaused && !this.root.ownerDocument?.hidden
      && this.root.ownerDocument?.hasFocus?.() !== false)
      this.el('resume-overlay').focus({ preventScroll: true });
    this.root.setAttribute('data-xt-paused', String(snapshot.paused));
    this.root.setAttribute('data-xt-phase', snapshot.phase);
  }
  finish(result) {
    if (!result || !this.active || !this.canCommit() || this.unsavedResult && this.unsavedResult !== result) return false;
    const firstAttempt = !this.unsavedResult;
    this.cancelResultRetry();
    const transaction = settleXenoTrialsV96(this.getProgress(), result);
    if (!transaction.applied) { this.message('Résultat non applicable à ce duel. Aucun gain ajouté.'); return false; }
    this.unsavedResult = result;
    this.render(); // Lock conflicting actions even when the storage commit below throws.
    if (!this.commit(transaction, { pauseOnFailure: false })) {
      this.el('retry-save').hidden = false;
      if (firstAttempt) {
        const generation = this.generation;
        this.resultRetryTimer = setTimeout(() => {
          this.resultRetryTimer = null;
          if (generation === this.generation && this.unsavedResult === result) this.finish(result);
        }, RESULT_RETRY_DELAY_MS);
      }
      return false;
    }
    this.unsavedResult = null; this.el('retry-save').hidden = true;
    const outcome = { player: 'VICTOIRE', opponent: 'DÉFAITE', draw: 'ÉGALITÉ' }[result.winner];
    this.el('result').textContent = `${outcome} · Résultat sauvegardé · +${transaction.receipt.credits} crédits de simulation · +${transaction.receipt.xp} XP${transaction.receipt.modeReward?.continuing ? ' · Série en cours : préparez le passage suivant.' : ''}${transaction.receipt.modeReward?.secondary ? ' · Objectif secondaire validé.' : ''}`;
    this.render();
    this.message('Évaluation terminée. Résultat sauvegardé. Préparez un autre duel pour poursuivre les évaluations.');
    return true;
  }
  resetRosterPagesV227(reopen = false) {
    this.rosterPageV179 = 0;
    this.rosterDrawerPagesV227.clear();
    if (reopen && this.rosterDrawerV227 === null) this.rosterDrawerV227 = undefined;
  }
  renderRosterV227(state, running) {
    const roster = this.el('roster');
    const focused = this.root.ownerDocument?.activeElement;
    const focusAttribute = ['data-xt-roster-summary', 'data-xt-fighter', 'data-xt-unlock']
      .find(key => roster.contains?.(focused) && focused?.hasAttribute(key));
    const focusId = focusAttribute && focused.getAttribute(focusAttribute);
    const oldGrid = roster.querySelector?.('.xt-fighters');
    const pages = this.rosterDrawerPagesV227 ??= new Map();
    let filtered = filterXenoTrialsRosterV97(FIGHTERS, { family: this.el('family').value || 'all', role: this.el('role').value || 'all',
      ownership: this.el('ownership').value || 'all', sort: this.el('sort').value || 'power', query: this.el('search').value, unlocked: state.unlocked,
      factionRoster: FACTIONS.find(f => f.id === this.el('faction-filter').value)?.roster || null });
    const animation = this.el('animation').value;
    if (animation === 'drawn') filtered = filtered.filter(fighter => getXenoTrialsRuntimeAnimationCoverage(fighter.id)?.hasDrawnGestures);
    if (animation === 'articulated') filtered = filtered.filter(fighter =>
      getXenoTrialsRuntimeAnimationCoverage(fighter.id)?.meshStates.some(action => action !== 'presentation'));
    const groups = groupXenoTrialsRosterV227(filtered);
    const revealSelected = this.rosterSelectionV179 !== this.selected;
    const selectedGroup = revealSelected && groups.find(group => group.fighters.some(fighter => fighter.id === this.selected));
    const open = selectedGroup || (this.rosterDrawerV227 !== null && (
      groups.find(group => group.id === this.rosterDrawerV227 && group.fighters.length)
      || groups.find(group => group.fighters.length)));
    const requestedPage = open && open.id !== this.rosterDrawerV227 ? pages.get(open.id) : this.rosterPageV179;
    const page = getXenoTrialsRosterPageV179(open ? open.fighters : [], { page: requestedPage, selectedId: this.selected, revealSelected });
    this.rosterSelectionV179 = this.selected;
    if (open) {
      this.rosterDrawerV227 = open.id;
      this.rosterPageV179 = page.page;
      pages.set(open.id, page.page);
    }

    const locked = running || Boolean(state.pending) || Boolean(this.unsavedResult);
    for (const key of ['search', 'family', 'role', 'ownership', 'sort', 'faction-filter', 'animation', 'reset-filters']) this.el(key).disabled = locked;
    const language = currentLanguageV185();
    const rosterCountLabel = language === 'en' ? 'specimens' : 'spécimens';
    this.el('count').textContent = `${filtered.length} / ${FIGHTERS.length} ${rosterCountLabel}`;
    this.el('roster-page').textContent = open ? `LOT ${page.page + 1} / ${page.pageCount} · ${page.start}–${page.end}` : '';
    this.el('roster-previous').hidden = this.el('roster-next').hidden = !open || page.pageCount < 2;
    this.el('roster-previous').disabled = locked || !page.hasPrevious;
    this.el('roster-next').disabled = locked || !page.hasNext;
    this.el('roster-selection').disabled = locked;

    const formatPower = new Intl.NumberFormat(language, { maximumFractionDigits: 2 });
    const cards = page.fighters.map(f => {
      const variant = f.id === 'arachnoid' ? this.form.elements.playerVariant.value : null;
      const unlocked = state.unlocked.includes(f.id), art = getXenoTrialsArtV96(f.id, variant), cost = getXenoTrialsUnlockCostV96(f.id);
      const portrait = (this.usesLocalMenuMediaV222() && menuTileV222('fighter', f.id, f.variants.includes(variant) ? variant : null))
        || getXenoTrialsRecruitPreviewV230(f.id) || renderEnemyImportPreviewV103(art) || (art ? `<img src="${escapeHtml(art.path)}" alt="" loading="lazy">` : '');
      const power = getXenoTrialsSimulationPowerV227(f.id);
      return `<article class="xt-fighter ${this.selected === f.id ? 'selected' : ''}" data-owned="${unlocked}">
        <button type="button" data-xt-fighter="${f.id}" aria-pressed="${this.selected === f.id}" ${locked ? 'disabled' : ''}>
          <span class="xt-fighter-thumbnail">${portrait}</span><strong>${escapeHtml(fighterLabelV230(f))}</strong>
          ${power === null ? '' : `<small class="xt-fighter-power" data-xt-power="${power}"><span>Puissance MIRE</span> <b>${formatPower.format(power)}</b></small>`}
          <small class="xt-motion-status-v189 xt-sr-only">${escapeHtml(getXenoTrialsRuntimeAnimationCoverage(f.id)?.playerLabel || '')}</small>
        </button>
        ${unlocked ? '<span class="xt-owned">ACQUIS</span>' : `<button type="button" class="xt-unlock" data-xt-unlock="${f.id}" ${locked || state.credits < cost ? 'disabled' : ''}><span class="xt-lock" aria-hidden="true"></span><span class="xt-sr-only">Débloquer</span>${cost} <abbr title="Crédits de simulation">CR</abbr></button>`}
      </article>`;
    }).join('');
    roster.innerHTML = groups.map(group => {
      const expanded = group.id === open?.id;
      return `<details class="xt-roster-drawer" data-xt-roster-drawer="${group.id}" ${expanded ? 'open' : ''}>
        <summary data-xt-roster-summary="${group.id}" ${group.fighters.length && !locked ? '' : 'aria-disabled="true" tabindex="-1"'}>
          <span>${group.label}</span><span class="xt-roster-drawer-count">${group.fighters.length}</span>
        </summary>
        ${expanded ? `<div class="xt-fighters" data-xt-roster-page="${group.id}:${page.page}">${cards}</div>` : ''}
      </details>`;
    }).join('') + (filtered.length ? '' : '<p class="xt-help">Aucun spécimen ne correspond à ces filtres. Votre sélection est conservée.</p>');

    const grid = roster.querySelector?.('.xt-fighters');
    if (grid && grid.dataset.xtRosterPage === oldGrid?.dataset.xtRosterPage) grid.scrollTop = oldGrid.scrollTop;
    if (focusId) {
      const same = roster.querySelector(`[${focusAttribute}="${focusId}"]`);
      const fallback = open && !locked ? roster.querySelector(`[data-xt-roster-summary="${open.id}"]`)
        : this.root.querySelector('#xt-roster-heading');
      const target = same && !same.matches(':disabled, [aria-disabled="true"]') ? same : fallback;
      target?.focus({ preventScroll: true });
    }
  }
  render() {
    const state = this.state(), running = this.isRunning();
    this.updateOfflineLibraryV224(state, running);
    if (this.selectionStep !== 'combat') this.exitTabletFullscreen();
    if (!state.pending) { this.el('retry-checkpoint').hidden = this.el('retry-checkpoint-overlay').hidden = true; this.el('checkpoint-status').textContent = ''; }
    this.renderActivitiesV119(state);
    this.el('series-resume').hidden = !state.modesV119.challengeRun;
    if (this.selectionStep === 'home' && !this.standaloneV207)
      renderArbiterTerminalDossierV190(this.el('arbiter-dossier'), this.getCampaignProgress(), this.onOpenArbiterDossier);
    this.el('home').hidden = this.selectionStep !== 'home'; this.el('activities').hidden = this.selectionStep !== 'activities';
    this.el('practice-lab-panel').hidden = this.selectionStep !== 'lab';
    this.el('layout').hidden = ['home', 'activities', 'lab'].includes(this.selectionStep);
    this.el('briefing').hidden = !this.activityV119 || !['fighters', 'arena', 'target'].includes(this.selectionStep)
      || this.branchV119 === 'on-demand' && this.selectionStep !== 'arena';
    this.el('progress').textContent = `DIVISION ${Math.floor(state.xp / 300) + 1} · ${state.xp} XP · ${state.credits} crédits de simulation · ${state.wins} V / ${state.losses} D / ${state.draws} N · ${state.unlocked.length}/${FIGHTERS.length} spécimens`;
    this.renderRosterV227(state, running);
    const activity = this.activityV119 && resolveXenoTrialsActivityV119(this.activityV119, state.modesV119);
    const horde = combatBriefingV188(activity);
    if (!running) this.root.setAttribute('data-xt-mode', horde ? 'horde' : 'duel');
    this.el('start').textContent = horde?.operation ? 'ENGAGER L’OPÉRATION' : horde ? 'ENGAGER LE PROTOCOLE HORDE' : 'LANCER LE DUEL';
    this.el('confirm-fighters').textContent = horde ? 'CONFIRMER · VÉRIFIER LE SECTEUR →' : 'CONFIRMER · CHOISIR L’ARÈNE →';
    const duelCheckpoint = state.pending?.duelCheckpointV197;
    this.el('restart').textContent = duelCheckpoint ? 'REPRENDRE LE DUEL CONSERVÉ'
      : state.pending?.config?.operationV188 ? state.pending.checkpointV186 ? 'REPRENDRE L’OPÉRATION CONSERVÉE' : 'RECOMMENCER L’OPÉRATION SAUVEGARDÉE'
        : state.pending?.checkpointV186 ? `REPRENDRE LA VAGUE ${state.pending.checkpointV186.snapshot.hordeV180.wave}`
          : state.pending?.config?.activityV119?.branch === 'horde' ? 'RECOMMENCER LE PROTOCOLE SAUVEGARDÉ' : 'RECOMMENCER LE DUEL SAUVEGARDÉ';
    this.el('restart-from-start').textContent = duelCheckpoint ? 'RECOMMENCER DEPUIS LA PREMIÈRE MANCHE' : 'RECOMMENCER DEPUIS LA PREMIÈRE VAGUE';
    this.el('restart-from-start').hidden = !(duelCheckpoint || state.pending?.checkpointV186) || running;
    this.el('restart-from-start').disabled = Boolean(this.unsavedResult);
    this.el('mode-help').textContent = this.branchV119 === 'practice' ? 'Suivez l’objectif de l’atelier. La pause suspend la simulation.' : horde ? horde.orders : 'Deux manches gagnantes. Surveillez votre endurance et punissez les attaques manquées.';
    const wrongCombatant = Boolean(activity?.forcedPlayerId && this.selected !== activity.forcedPlayerId
      || activity?.requiredFamily && FIGHTERS.find(f => f.id === this.selected)?.family !== activity.requiredFamily);
    const unavailable = !this.active || running || Boolean(state.pending) || Boolean(this.unsavedResult) || !state.unlocked.includes(this.selected) || wrongCombatant;
    this.el('start').disabled = unavailable || this.selectionStep !== 'arena';
    this.el('confirm-fighters').disabled = unavailable;
    this.el('fighter-config-title').textContent = this.selectionStep === 'target' ? 'Désignation de la cible' : 'Autorisation d’essai';
    const selectionRules = this.el('selection-rules');
    selectionRules.hidden = this.selectionStep !== 'fighters' || this.branchV119 !== 'on-demand';
    selectionRules.textContent = selectionRules.hidden ? '' : getXenoTrialsRuleTextV119(activity?.rules);
    const selectionHold = this.el('selection-hold');
    selectionHold.textContent = wrongCombatant ? 'Ce spécimen ne répond pas aux critères de l’évaluation.'
      : !state.unlocked.includes(this.selected) ? 'Débloquez le spécimen dans le registre pour l’affecter.' : '';
    selectionHold.hidden = this.selectionStep !== 'fighters' || !selectionHold.textContent;
    this.el('back-fighters').disabled = running || Boolean(state.pending);
    this.el('stable').hidden = this.selectionStep !== 'fighters';
    this.el('fighter-config').hidden = !['fighters', 'target'].includes(this.selectionStep);
    this.el('opponent-fields').hidden = this.branchV119 !== 'on-demand' || this.selectionStep !== 'target';
    this.el('confirm-fighters').hidden = this.selectionStep === 'target';
    this.el('branch-return').textContent = this.branchV119 === 'on-demand' ? '← PROGRAMME' : '← ÉVALUATIONS';
    this.el('arena-config').hidden = this.selectionStep !== 'arena';
    this.el('combat-panel').hidden = this.selectionStep !== 'combat';
    this.el('combat-hud').hidden = !this.runtime || Boolean(this.loading);
    this.el('layout').setAttribute('data-step', this.selectionStep);
    this.root.setAttribute('data-xt-step', this.selectionStep);
    this.root.setAttribute('data-xt-unsaved', String(Boolean(this.unsavedResult)));
    this.root.setAttribute('data-xt-recovery',String(Boolean(state.pending && !running)));
    const preparationStep = this.selectionStep === 'target' ? 'fighters' : this.selectionStep;
    this.el('steps').innerHTML = [['fighters','01 · COMBATTANTS'],['arena','02 · ARÈNE'],['combat',horde ? horde?.operation ? '03 · OPÉRATION' : '03 · HORDE' : '03 · DUEL']].map(([id,label]) => `<span ${id === preparationStep ? 'aria-current="step"' : ''}>${label}</span>`).join('');
    this.el('new-duel').hidden = this.branchV119 === 'practice' || this.selectionStep !== 'combat' || running || Boolean(state.pending) || Boolean(this.unsavedResult);
    this.el('new-duel').textContent = state.modesV119.challengeRun ? 'POURSUIVRE LA SÉRIE' : this.activityV119 && this.branchV119 !== 'on-demand' ? 'RETOUR AUX ÉVALUATIONS' : 'PRÉPARER UN AUTRE DUEL';
    this.el('restart').hidden = !state.pending || running;
    this.el('abandon').hidden = !state.pending;
    this.el('abandon').disabled = Boolean(this.unsavedResult);
    for (const element of this.form.elements) if (element.tagName === 'SELECT') element.disabled = running || Boolean(state.pending);
    if (this.activityV119 && this.branchV119 !== 'on-demand') for (const key of ['opponentId', 'factionId', 'difficulty', 'stageId', 'roundSeconds']) this.form.elements[key].disabled = true;
    if (activity?.rules?.timeLimitSeconds) { this.form.elements.roundSeconds.value=String(activity.rules.timeLimitSeconds); this.form.elements.roundSeconds.disabled=true; }
    if (!state.pending) this.updateVariants();
    this.renderPreviews();
    this.el('pause').disabled = (!running && !isOutroPlaying(this.runtime?.getState())) || this.loading || Boolean(this.unsavedResult);
    this.el('history').replaceChildren();
    for (const e of state.ledger.slice(-8).reverse()) {
      const row = document.createElement('p'); row.textContent = `${e.matchId} · ${e.playerId} / ${e.opponentId} · ${e.winner === 'abandoned' ? 'annulé' : { player: 'victoire', opponent: 'défaite', draw: 'égalité' }[e.winner]} · +${e.credits} crédits`;
      this.el('history').append(row);
    }
    // A terminal result awaiting its commit is not a resumable saved duel.
    if (!running && this.unsavedResult) this.message('Évaluation terminée. Résultat en attente de sauvegarde. Réessayez la sauvegarde du résultat.');
    else if (!running && state.pending) this.message(duelCheckpoint ? 'Duel sauvegardé. Retrouvez la manche, la santé et le chrono enregistrés.'
      : state.pending.checkpointV186 ? 'Reprise conservée. Retrouvez la vague et la santé enregistrées, puis reprenez depuis la pause.'
        : state.pending.config?.activityV119?.branch === 'horde' ? 'Protocole sauvegardé en attente. Recommencez depuis la première vague ou annulez sans gain.'
          : 'Duel sauvegardé en attente. Recommencez depuis la première manche ou annulez sans gain.');
  }
}
