import { getXenoTrialsRigV154 } from './xeno-trials-rig-v154.js';
import { getXenoTrialsSequenceV155 } from './xeno-trials-sequences-v155.js';
import { hasXenoTrialsGrappleV153 } from './xeno-trials-grapple-v153.js';
import { getXenoTrialsSuperV148, getXenoTrialsSuperReadinessV148, getXenoTrialsSuperStatusV148 } from './xeno-trials-supers-v148.js';
import { getXenoTrialsSignatureV147 } from './xeno-trials-signatures-v147.js';
import { XENO_TRIALS_FIGHTERS_V96 as FIGHTERS, XENO_TRIALS_FACTIONS_V96 as FACTIONS,
  XENO_TRIALS_STAGES_V96 as STAGES, getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { normalizeXenoTrialsProgressV96, getXenoTrialsUnlockCostV96,
  beginXenoTrialsV96, settleXenoTrialsV96, abandonXenoTrialsV96, unlockXenoTrialsFighterV96, renewXenoTrialsContractsV119,
  checkpointXenoTrialsV186, clearXenoTrialsCheckpointV186 } from './xeno-trials-progress-v96.js';
import { createXenoTrialsRuntimeV96 } from './xeno-trials-runtime-v96.js';
import { filterXenoTrialsRosterV97, XENO_TRIALS_SELECTION_FAMILIES_V119 as FAMILIES,
  getXenoTrialsSelectionFamilyV119 } from './xeno-trials-selection-v97.js';
import { XENO_TRIALS_BRANCHES_V119 as BRANCHES, XENO_TRIALS_CAMPAIGN_V119 as CAMPAIGN,
  XENO_TRIALS_CHALLENGES_V119 as CHALLENGES, getXenoTrialsContractsV119, isXenoTrialsMissionOpenV119,
  resolveXenoTrialsActivityV119, getXenoTrialsRuleTextV119 } from './xeno-trials-modes-v119.js';
import { renderEnemyImportPreviewV103 } from './enemy-import-admissions-v103.js';
import { getEnemyImportAnimationV107 } from './enemy-import-animation-v107.js';
import { getEnemyImportAttackV109 } from './enemy-import-attacks-v109.js';
import { getXenoTrialsRosterPageV179, getXenoTrialsRosterProfileV179 } from './xeno-trials-roster-v179.js';
import { XENO_TRIALS_HORDE_PROTOCOLS_V186 as HORDE_PROTOCOLS } from './xeno-trials-horde-v180.js';
import { getXenoTrialsProgramPageV186 } from './xeno-trials-programs-v186.js';
import { getXenoTrialsHordeBriefingV180, getXenoTrialsHordeViewV180, isXenoTrialsHordeActivityV180 } from './xeno-trials-horde-ui-v180.js';

const options = entries => entries.map(e => `<option value="${e.id}">${e.label}</option>`).join('');
const requestedRulesV119 = value => ({ 'no-special': { noSpecial: true }, 'one-hp': { initialHp: 1 },
  'thirty-seconds': { timeLimitSeconds: 30 } }[value] || {});
const roleLabel = { balanced: 'Polyvalent', agile: 'Mobile', tank: 'Défensif', ranged: 'Distance' };
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
const controlLabel = { left: 'Aller à gauche', right: 'Aller à droite', jump: 'Sauter', guard: 'Maintenir la garde', light: 'Frappe rapide', heavy: 'Frappe lourde', special: 'Attaque spéciale', super: 'Super chargé' };
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const hordeStatsV180 = view => view ? `<dl class="xt-horde-briefing-grid"><div><dt>VAGUES</dt><dd>${view.waves || '—'}</dd></div><div><dt>POPULATION</dt><dd>${view.total || '—'}</dd></div><div><dt>PV PAR CONTACT</dt><dd>${view.minimum && view.maximum ? `${view.minimum}–${view.maximum}` : '—'}</dd></div><div><dt>SIMULTANÉS MAX.</dt><dd>${view.simultaneous || '—'}</dd></div></dl>` : '';
const activityBranchV179 = branch => branch === 'events' ? 'challenges' : branch;
const challengeBranchV179 = id => CHALLENGES.find(entry => entry.id === id)?.eventV179 ? 'events' : 'challenges';

/** UI owns no campaign money and never writes outside its current save owner. */
export class XenoTrialsUiV96 {
  constructor({ root, getProgress, onCommit, canCommit, onReturn }) {
    Object.assign(this, { root, getProgress, onCommit, canCommit, onReturn });
    this.runtime = null; this.generation = 0; this.selected = 'warrior'; this.active = false;
    this.selectionStep = 'home'; this.branchV119 = null; this.activityV119 = null;
    this.rosterPageV179 = 0; this.rosterSelectionV179 = null;
    this.programPageV186 = 0;
    root.innerHTML = `<div class="section-intro xt-terminal-header"><div class="xt-terminal-brand"><span class="xt-terminal-mark" aria-hidden="true">W<span>Y</span></span><div><p class="eyebrow">WEYLAND-YUTANI · DIVISION DES SYSTÈMES BIOLOGIQUES</p><h2>MIRE <span>/ XENO TRIALS</span></h2></div></div><button class="button" data-xt="return">QUITTER LE TERMINAL</button></div>
      <div class="xt-terminal-link"><span><i aria-hidden="true"></i> LIAISON TANTALUS ÉTABLIE</span><span>ÉVALUATION COMPARATIVE / MIRE</span><span>ACCÈS OPÉRATEUR</span></div>
      <p class="xt-notice">Simulation MIRE. Sélectionnez un programme, préparez votre spécimen puis engagez l’évaluation.</p>
      <div class="xt-dashboard" data-xt="progress"></div>
      <nav class="xt-steps" aria-label="Préparation du duel" data-xt="steps"></nav>
      <section class="xt-home-v119" data-xt="home"><div class="xt-terminal-hero"><div class="xt-terminal-intro"><p class="eyebrow">SYSTÈME MIRE / PROGRAMME D’ÉVALUATION</p><h1>XENO<br><span>TRIALS</span><small>ÉTUDE COMPARATIVE DES ESPÈCES</small></h1><p>Observez. Engagez. Survivez.<br>Chaque contact enrichit le dossier.</p><dl class="xt-terminal-spec"><div><dt>SPÉCIMENS ADMIS</dt><dd>${FIGHTERS.length}</dd></div><div><dt>ENVIRONNEMENTS</dt><dd>${STAGES.length}</dd></div><div><dt>PROTOCOLES HORDE</dt><dd>${HORDE_PROTOCOLS.length}</dd></div></dl></div><div class="xt-containment-monitor"><div class="xt-monitor-heading"><span>OBSERVATION / 001</span><span>CONFINEMENT MIRE</span></div><div class="xt-monitor-specimen">${renderEnemyImportPreviewV103(getXenoTrialsArtV96('warrior'), 'Warrior — observation MIRE', 'clamp(210px, 34vh, 360px)') || `<img src="${getXenoTrialsArtV96('warrior').path}" alt="Warrior — observation MIRE">`}<span class="xt-monitor-reticle" aria-hidden="true"></span></div><div class="xt-monitor-caption"><span>WARRIOR<br><strong>XX121 / SUJET D’ÉTUDE</strong></span><span>OBSERVATION<br><strong>CONTACT VISUEL</strong></span></div></div></div><div data-xt="series-resume" class="xt-series-recovery" hidden><button type="button" class="button primary" data-xt="resume-series">POURSUIVRE LA SÉRIE EN COURS</button><button type="button" class="button danger-outline" data-xt="abandon-series">ABANDONNER LA SÉRIE · SANS PRIME</button></div><div class="xt-program-heading"><span>RÉPERTOIRE DES PROGRAMMES</span><span>SÉLECTIONNEZ UNE LIGNE POUR CONTINUER</span></div><div class="xt-branches-v119" data-xt="branches"></div><div class="xt-terminal-foot"><span>MIRE / INTERFACE D’ÉVALUATION</span><span>WEYLAND-YUTANI · BUILDING BETTER WORLDS</span></div></section>
      <section data-xt="activities" class="xt-activities-v119" hidden><div class="xt-activity-heading"><button type="button" class="button" data-xt="home-return">← PROGRAMME</button><h2><span data-xt="branch-title"></span></h2><button type="button" class="button" data-xt="renew-contracts" hidden>RENOUVELER LES CONTRATS</button></div><div class="xt-program-tools-v186"><label data-xt="program-filter-label">Type de protocole<select data-xt="program-filter"><option value="all">Tous les protocoles</option><option value="standard">Vagues standards</option><option value="boss">Finales avec boss</option></select></label><nav aria-label="Pages des programmes"><button type="button" class="button" data-xt="program-previous">← PAGE PRÉCÉDENTE</button><span data-xt="program-page" role="status" aria-live="polite"></span><button type="button" class="button" data-xt="program-next">PAGE SUIVANTE →</button></nav></div><p class="xt-activity-index" data-xt="activity-count" role="status"></p><div data-xt="activity-board" class="xt-activity-board-v119"></div></section>
      <section data-xt="briefing" class="xt-briefing-v119" hidden></section>
      <div class="xt-layout" data-xt="layout"><aside class="xt-roster" data-xt="stable"><h3>RÉSERVE BIOLOGIQUE</h3>
      <nav class="xt-family-tabs-v119" data-xt="family-tabs" aria-label="Familles de spécimens"></nav>
      <div class="xt-filters">
        <label>Rechercher<input type="search" data-xt="search" placeholder="Nom du spécimen" maxlength="80"></label>
        <label>Famille<select data-xt="family">${options(FAMILIES)}</select></label>
        <label>Rôle<select data-xt="role"><option value="all">Tous les rôles</option>${Object.entries(roleLabel).map(([id,label]) => `<option value="${id}">${label}</option>`).join('')}</select></label>
        <label>Faction simulée<select data-xt="faction-filter"><option value="all">Toutes les factions</option>${options(FACTIONS)}</select></label>
        <label>Disponibilité<select data-xt="ownership"><option value="all">Toute l’écurie</option><option value="owned">Acquis</option><option value="locked">À débloquer</option></select></label>
        <label>Trier<select data-xt="sort"><option value="catalog">Catalogue</option><option value="name">Nom A–Z</option><option value="health">Santé décroissante</option><option value="speed">Vitesse décroissante</option><option value="cost">Coût de déblocage croissant</option></select></label>
      </div><button type="button" class="button" data-xt="reset-filters">RÉINITIALISER LES FILTRES</button><p data-xt="count" class="xt-help" role="status"></p><nav aria-label="Lots de 40 spécimens"><button type="button" class="button" data-xt="roster-previous">← LOT PRÉCÉDENT</button><span data-xt="roster-page" role="status" aria-live="polite"></span><button type="button" class="button" data-xt="roster-next">LOT SUIVANT →</button><button type="button" class="button" data-xt="roster-selection">RETROUVER MA SÉLECTION</button></nav><div data-xt="roster" class="xt-fighters"></div></aside>
      <div class="xt-main"><form data-xt="form" class="xt-config">
        <section class="xt-selection-fields" data-xt="fighter-config"><h3>01 / Choisissez les combattants</h3>
        <div data-xt="portraits" class="xt-portraits"></div>
        <div data-xt="opponent-fields" class="xt-opponent-fields-v119"><label>Famille adverse<select name="opponentFamily">${options(FAMILIES)}</select></label>
        <label>Cellule adverse<select name="factionId">${options(FACTIONS)}</select></label>
        <label>Spécimen adverse<select name="opponentId"></select></label><label>Règles<select name="requestedRules"><option value="standard">Standard</option><option value="no-special">Sans spécial</option><option value="one-hp">1 PV</option><option value="thirty-seconds">30 secondes</option></select></label><button type="button" class="button primary" data-xt="confirm-target">CIBLE CONFIRMÉE · CHOISIR MON SPÉCIMEN →</button></div>
        <label>Niveau<select name="difficulty"><option value="easy">Acclimatation</option><option value="normal" selected>Standard</option><option value="hard">Élite</option></select></label>
        <label>Votre Arachnoid<select name="playerVariant"><option value="grey">Grey</option><option value="purple">Purple</option></select></label>
        <label>Arachnoid adverse<select name="opponentVariant"><option value="grey">Grey</option><option value="purple">Purple</option></select></label>
        <p data-xt="doctrine" class="xt-doctrine"></p>
        <button type="button" class="button primary" data-xt="confirm-fighters">CONFIRMER · CHOISIR L’ARÈNE →</button><button type="button" class="button" data-xt="branch-return">← ÉVALUATIONS</button>
        </section>
        <section class="xt-selection-fields" data-xt="arena-config" hidden><h3>02 / Choisissez l’arène</h3>
        <p class="xt-doctrine" data-xt="arena-matchup"></p>
        <label>Environnement<select name="stageId">${options(STAGES)}</select></label>
        <label>Durée d’une manche<select name="roundSeconds"><option value="30">30 secondes</option><option value="60">60 secondes</option><option value="75">75 secondes</option><option value="99" selected>99 secondes · The Pit</option><option value="120">120 secondes</option></select></label>
        <div data-xt="arena-cards" class="xt-arena-cards" role="group" aria-label="Arènes disponibles"></div>
        <div data-xt="stage-preview" class="xt-stage-preview"></div>
        <p class="xt-doctrine" data-xt="arena-rules">Deux manches gagnantes. Présentation des deux spécimens, puis décompte 3–2–1. Le chrono ne démarre qu’au signal de combat.</p>
        <button type="button" class="button" data-xt="back-fighters">← MODIFIER LES COMBATTANTS</button>
        <button type="submit" class="button primary" data-xt="start">LANCER LE DUEL</button>
        </section>
        <button type="button" class="button" data-xt="restart" hidden>RECOMMENCER LE DUEL SAUVEGARDÉ</button>
        <button type="button" class="button" data-xt="restart-from-start" hidden>RECOMMENCER DEPUIS LA PREMIÈRE VAGUE</button><button type="button" class="button danger-outline" data-xt="abandon" hidden>ANNULER LE DUEL · SANS GAIN</button>
      </form>
      <p data-xt="status" class="xt-status" role="status" aria-live="polite">Choisissez votre spécimen puis une cellule adverse.</p>
      <section data-xt="combat-panel" hidden>
      <div class="xt-match-hud" data-xt="combat-hud" role="group" aria-label="État du duel">
        ${['player', 'opponent'].map((side, i) => `<div class="xt-vitals xt-vitals-${side}" data-xt="${side}-vitals"><span class="xt-side">${i ? 'ADVERSAIRE' : 'VOUS'}</span><strong data-xt="${side}-name"></strong>
        <span class="xt-vital-value" data-xt="${side}-hp-value"></span><progress class="xt-hp-meter" data-xt="${side}-hp" max="1" value="1" aria-label="Santé ${i ? 'adversaire' : 'joueur'}"></progress>
        <span class="xt-vital-value xt-stamina-value" data-xt="${side}-stamina-value"></span><progress class="xt-stamina-meter" data-xt="${side}-stamina" max="1" value="1" aria-label="Endurance ${i ? 'adversaire' : 'joueur'}"></progress>
        <span class="xt-vital-value xt-super-value-v148" data-xt="${side}-super-value" hidden></span><progress class="xt-super-meter-v148" data-xt="${side}-super" max="100" value="0" aria-label="Jauge de super ${i ? 'adversaire' : 'joueur'}" hidden></progress></div>`).join('')}
        <div class="xt-match-clock"><span data-xt="round">MANCHE 1</span><strong data-xt="clock" role="timer" aria-live="off" aria-label="Secondes restantes">99</strong><span class="xt-clock-unit">SECONDES</span><strong data-xt="score" aria-label="Manches gagnées : joueur — adversaire">0 — 0</strong></div>
        <div class="xt-horde-telemetry" data-xt="horde-hud" hidden><span class="xt-horde-link">MIRE / TÉLÉMÉTRIE TACTIQUE</span><div class="xt-horde-counter-row"><div><span>CONTACTS ACTIFS</span><strong data-xt="horde-alive">0</strong></div><div><span>RENFORTS EN ATTENTE</span><strong data-xt="horde-remaining">0</strong></div></div><span data-xt="horde-phase" class="xt-horde-phase"></span><span class="xt-horde-total" data-xt="horde-kills"></span><progress data-xt="horde-progress" class="xt-horde-progress" max="1" value="0" aria-label="Contacts neutralisés sur la population totale"></progress></div>
      <section data-xt="boss-hud" class="xt-boss-hud-v186" hidden><span>CONTACT MAJEUR</span><strong data-xt="boss-name"></strong><span data-xt="boss-phase"></span><progress data-xt="boss-hp" max="1" value="1" aria-label="Santé du contact majeur"></progress><span data-xt="boss-hp-value"></span></section><div class="xt-hud-meta-v186"><p class="xt-input-device-v186" data-xt="input-device" role="status">CLAVIER / TACTILE</p><p data-xt="checkpoint-status" class="xt-checkpoint-v186" role="status" aria-live="polite"></p><button type="button" class="button" data-xt="retry-checkpoint" hidden>RÉESSAYER LA SAUVEGARDE DE REPRISE</button></div></div><p data-xt="horde-announcement" class="xt-sr-only" role="status" aria-live="polite"></p>
      <div class="xt-arena"><canvas width="1000" height="560" tabindex="0" data-xt="canvas" aria-label="Arène de combat Xeno Trials" aria-describedby="xeno-trials-help-v96"></canvas>
      <p data-xt="health" class="xt-sr-only" aria-label="Santé et endurance des combattants"></p></div>
      <div class="xt-actions"><button class="button" data-xt="pause" disabled>PAUSE</button><button type="button" class="button" data-xt="taunt" hidden disabled>T · DÉFI</button><button type="button" class="button" data-xt="skip-sequence" hidden>PASSER LA PRÉSENTATION</button><button class="button" data-xt="next" hidden>MANCHE SUIVANTE</button><button class="button" data-xt="retry-save" hidden>RÉESSAYER LA SAUVEGARDE DU RÉSULTAT</button></div><section data-xt="pause-overlay" class="xt-pause-overlay-v119" role="dialog" aria-modal="true" aria-labelledby="xeno-trials-pause-title-v119" hidden><h2 id="xeno-trials-pause-title-v119">ÉVALUATION SUSPENDUE</h2><p>Q/D ou flèches · Saut Z/↑ · Garde S/↓ · Attaques J/K/L · Super I (jauge pleine) · P ou Échap pour reprendre.</p><p class="xt-input-hint-v186" data-xt="input-hint">CLAVIER / TACTILE / MANETTE STANDARD · Stick ou croix : déplacement · A : saut · LT : garde · X/Y/B : attaques · RT : super · Start/Back : pause. Relâchez les commandes après une reprise.</p><p>La simulation et le chrono sont arrêtés. Reprenez l’évaluation ou abandonnez-la sans gain.</p><button type="button" class="button" data-xt="retry-checkpoint-overlay" hidden>RÉESSAYER LA SAUVEGARDE DE REPRISE</button><button type="button" class="button primary" data-xt="resume-overlay">REPRENDRE</button><button type="button" class="button danger-outline" data-xt="abandon-overlay">ABANDONNER · SANS GAIN</button></section>
      <div data-xt="controls" class="xt-controls" role="group" aria-label="Commandes de combat tactiles">
        ${[['left','←'],['right','→'],['jump','SAUT'],['guard','GARDE'],['light','J · RAPIDE'],['heavy','K · LOURD'],['special','L · SPÉCIAL'],['super','I · SUPER']].map(([key,label]) => `<button type="button" data-xeno-action="${key}" aria-label="${controlLabel[key]}">${label}</button>`).join('')}
      </div><details class="xt-combat-help"><summary>COMMANDES ET CONSIGNES</summary><p data-xt="mode-help" class="xt-help"></p><p id="xeno-trials-help-v96" class="xt-help">Déplacement : Q/D ou flèches · Saut : Z/↑/Espace · Garde : S/↓ · Attaques : J/K/L · Super : I, pour les spécimens compatibles. Jauge gagnée sur les contacts effectifs, conservée entre manches et consommée au départ. Défi : T lorsque disponible ; annulé par déplacement, attaque, garde ou impact. La simulation continue. Pause : P ou Échap. Lors d’une saisie, maintenir GARDE permet le dégagement sans marteler une touche. La garde ordinaire consomme de l’endurance. Coups lourds pour briser une garde épuisée.</p></details></section>
      <button type="button" class="button" data-xt="new-duel" hidden>PRÉPARER UN AUTRE DUEL</button>
      <div data-xt="result" class="xt-result" role="status" aria-live="polite"></div>
      <details class="xt-history"><summary>Journal des évaluations</summary><div data-xt="history"></div></details></div></div>`;
    this.el = key => root.querySelector(`[data-xt="${key}"]`);
    this.form = this.el('form');
    this.form.addEventListener('submit', event => { event.preventDefault(); this.begin(); });
    this.form.elements.factionId.addEventListener('change', () => this.updateOpponents());
    this.form.elements.opponentFamily.addEventListener('change', () => this.updateOpponents());
    this.form.elements.opponentId.addEventListener('change', () => { this.updateVariants(); this.renderPreviews(); });
    this.form.elements.opponentVariant.addEventListener('change', () => this.renderPreviews());
    this.form.elements.stageId.addEventListener('change', () => this.renderPreviews());
    this.form.elements.playerVariant.addEventListener('change', () => { if (!this.isRunning()) this.render(); });
    this.form.elements.requestedRules.addEventListener('change', () => this.updateRequestedRulesV119());
    root.addEventListener('click', event => {
      const branch = event.target.closest('[data-xt-branch]'); if (branch) this.chooseBranchV119(branch.dataset.xtBranch);
      const activity = event.target.closest('[data-xt-activity]'); if (activity) this.chooseActivityV119(activity.dataset.xtActivity);
      const family = event.target.closest('[data-xt-family-tab]');
      if (family && !this.isRunning()) { this.el('family').value = family.dataset.xtFamilyTab; this.rosterPageV179 = 0; this.render(); }
      const fighter = event.target.closest('[data-xt-fighter]');
      if (fighter && this.active && !this.isRunning() && !this.state().pending) {
        const activity = this.activityV119 && resolveXenoTrialsActivityV119(this.activityV119, this.state().modesV119);
        if (!activity?.forcedPlayerId && !this.state().modesV119.challengeRun) this.selected = fighter.dataset.xtFighter;
        this.render();
      }
      const unlock = event.target.closest('[data-xt-unlock]');
      if (unlock && !this.unsavedResult) this.commit(unlockXenoTrialsFighterV96(this.getProgress(), unlock.dataset.xtUnlock));
      const arena = event.target.closest('[data-xt-arena]');
      if (arena) this.selectArena(arena.dataset.xtArena);
    });
    this.el('return').onclick = () => { this.close(); this.onReturn(); };
    this.el('confirm-fighters').onclick = () => this.confirmFighters();
    this.el('back-fighters').onclick = () => this.showFighters();
    this.el('new-duel').onclick = () => this.continueEvaluationV119();
    this.el('home-return').onclick = () => this.showHomeV119();
    this.el('resume-series').onclick = () => { if (this.chooseBranchV119(challengeBranchV179(this.state().modesV119.challengeRun?.id))) this.continueEvaluationV119(); };
    this.el('abandon-series').onclick = () => { if (!this.unsavedResult && this.commit(abandonXenoTrialsV96(this.getProgress()))) this.showHomeV119(); };
    this.el('branch-return').onclick = () => this.branchV119 === 'on-demand' ? this.showHomeV119() : this.chooseBranchV119(this.branchV119 || 'on-demand');
    this.el('renew-contracts').onclick = () => this.commit(renewXenoTrialsContractsV119(this.getProgress()));
    this.el('confirm-target').onclick = () => { if (!this.active || !this.canCommit() || this.isRunning() || this.state().pending || this.unsavedResult) return; this.updateRequestedRulesV119(); this.selectionStep = 'fighters'; this.render(); };
    this.el('resume-overlay').onclick = () => this.runtime?.resume();
    this.el('abandon-overlay').onclick = () => this.el('abandon').onclick();
    this.el('pause-overlay').addEventListener('keydown', event => {
      if (event.code !== 'Tab' || this.el('pause-overlay').hidden) return;
      const actions = [this.el('retry-checkpoint-overlay'), this.el('resume-overlay'), this.el('abandon-overlay')]
        .filter(button => !button.hidden && !button.disabled);
      if (!actions.length) return;
      const first = actions[0], last = actions.at(-1);
      const focused = this.root.ownerDocument?.activeElement || event.target;
      if (event.shiftKey && focused === first || !event.shiftKey && focused === last) {
        event.preventDefault(); (event.shiftKey ? last : first).focus({ preventScroll: true });
      }
    });
    for (const key of ['family', 'role', 'ownership', 'sort', 'faction-filter']) this.el(key).addEventListener('change', () => { this.rosterPageV179 = 0; this.render(); });
    for (const [key, delta] of [['roster-previous', -1], ['roster-next', 1]]) this.el(key).onclick = () => {
      if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult || this.el(key).disabled) return;
      this.rosterPageV179 += delta; this.render();
      this.el(this.el(key).disabled ? delta > 0 ? 'roster-previous' : 'roster-next' : key).focus({ preventScroll: true });
    };
    this.el('reset-filters').onclick = () => {
      for (const key of ['family', 'role', 'ownership', 'faction-filter']) this.el(key).value = 'all';
      this.el('sort').value = 'catalog'; this.el('search').value = ''; this.rosterPageV179 = 0; this.render();
    };
    this.el('roster-selection').onclick = () => {
      if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult) return;
      for (const key of ['family', 'role', 'ownership', 'faction-filter']) this.el(key).value = 'all';
      this.el('sort').value = 'catalog'; this.el('search').value = ''; this.rosterSelectionV179 = null; this.render();
      this.root.querySelector(`[data-xt-fighter="${this.selected}"]`)?.focus({ preventScroll: true });
    };
    this.el('search').addEventListener('input', () => { this.rosterPageV179 = 0; this.render(); });
    this.el('restart').onclick = () => this.launch(this.state().pending?.config);
    this.el('restart-from-start').onclick = () => {
      if (!this.active || this.isRunning() || this.unsavedResult) return;
      if (this.commit(clearXenoTrialsCheckpointV186(this.getProgress()))) void this.launch(this.state().pending?.config);
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
  isRunning() { return Boolean(this.loading || this.runtime && this.runtime.getState().phase !== 'match-over'); }
  message(text) { this.el('status').textContent = text; }
  updateOpponents() {
    const faction = FACTIONS.find(f => f.id === this.form.elements.factionId.value) || FACTIONS[0];
    const family = this.form.elements.opponentFamily.value || 'all';
    const candidates = FIGHTERS.filter(f => (family === 'all' || getXenoTrialsSelectionFamilyV119(f) === family)
      && (family !== 'all' || faction.roster.includes(f.id)));
    this.form.elements.opponentId.innerHTML = options(candidates);
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
  commit(transaction) {
    if (!this.active || !this.canCommit() || !transaction?.applied) return false;
    try { this.onCommit(transaction.state); this.render(); return true; }
    catch (error) { this.runtime?.pause(); this.message(`Sauvegarde refusée : ${error.message}. Aucun gain confirmé.`); return false; }
  }
  restorePendingSelection() {
    // Saved duels retain their historical timer/palette; previews describe that ticket.
    const config = this.state().pending?.config;
    if (!config) return;
    this.activityV119 = config.activityV119 || null; this.branchV119 = config.activityV119?.branch === 'challenges' ? challengeBranchV179(config.activityV119.id) : config.activityV119?.branch || 'on-demand';
    if (FIGHTERS.some(f => f.id === config.playerId)) this.selected = config.playerId;
    if (FACTIONS.some(f => f.id === config.factionId)) this.form.elements.factionId.value = config.factionId;
    this.updateOpponents();
    const opponent = FIGHTERS.find(f => f.id === config.opponentId);
    if (opponent) {
      const faction = FACTIONS.find(f => f.id === this.form.elements.factionId.value);
      if (!faction?.roster.includes(opponent.id)) this.form.elements.opponentId.innerHTML += options([opponent]);
      this.form.elements.opponentId.value = opponent.id;
    }
    if (STAGES.some(stage => stage.id === config.stageId)) this.form.elements.stageId.value = config.stageId;
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
    if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult || !BRANCHES.some(b => b.id === id)) return false;
    if (this.state().modesV119.challengeRun && id !== challengeBranchV179(this.state().modesV119.challengeRun.id)) { this.message('Une série est en cours. Poursuivez-la ou abandonnez-la depuis le programme.'); return false; }
    this.closeRuntime(); this.programPageV186 = 0; this.el('program-filter').value = 'all'; this.branchV119 = id; this.activityV119 = id === 'on-demand' ? { branch: id, id, rules: requestedRulesV119(this.form.elements.requestedRules.value) } : null;
    this.selectionStep = id === 'on-demand' ? 'target' : 'activities'; this.render(); return true;
  }
  chooseActivityV119(id) {
    if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult) return false;
    if (this.state().modesV119.challengeRun && id !== this.state().modesV119.challengeRun.id) return false;
    const activity = resolveXenoTrialsActivityV119({ branch: activityBranchV179(this.branchV119), id }, this.state().modesV119);
    if (!activity) return false;
    this.activityV119 = { branch: activityBranchV179(this.branchV119), id };
    if (activity.forcedPlayerId) this.selected = activity.forcedPlayerId;
    if (this.state().modesV119.challengeRun?.id === id) this.selected = this.state().modesV119.challengeRun.playerId;
    if (activity.requiredFamily) this.el('family').value = activity.requiredFamily;
    this.form.elements.factionId.value = activity.factionId || 'containment'; this.updateOpponents();
    if (!FACTIONS.find(f => f.id === this.form.elements.factionId.value)?.roster.includes(activity.opponentId)) this.form.elements.opponentId.innerHTML += options(FIGHTERS.filter(f => f.id === activity.opponentId));
    this.form.elements.opponentId.value = activity.opponentId;
    if (activity.stageId) this.form.elements.stageId.value = activity.stageId;
    if (activity.difficulty) this.form.elements.difficulty.value = activity.difficulty;
    this.selectionStep = 'fighters'; this.render(); return true;
  }
  renderActivitiesV119(state) {
    this.el('branches').innerHTML = BRANCHES.map((branch, index) => `<button type="button" data-xt-branch="${branch.id}" class="xt-branch-v119${branch.id === 'horde' ? ' xt-branch-horde' : ''}"><span class="xt-branch-code">MIRE / ${String(index + 1).padStart(2, '0')}<i aria-hidden="true">${branch.id === 'horde' ? 'CONFINEMENT' : 'ÉVALUATION'}</i></span><strong>${escapeHtml(branch.label)}</strong><p>${escapeHtml(branch.description)}</p><span class="xt-branch-open">OUVRIR LE PROGRAMME <b aria-hidden="true">↗</b></span></button>`).join('');
    this.el('branch-title').textContent = BRANCHES.find(branch => branch.id === this.branchV119)?.label || '';
    this.el('renew-contracts').hidden = this.branchV119 !== 'contracts';
    const entries = this.branchV119 === 'horde' ? HORDE_PROTOCOLS : this.branchV119 === 'campaign' ? CAMPAIGN : this.branchV119 === 'contracts' ? getXenoTrialsContractsV119(state.modesV119.contractCycle) : ['challenges', 'events'].includes(this.branchV119) ? CHALLENGES.filter(entry => Boolean(entry.eventV179) === (this.branchV119 === 'events')) : [];
    this.el('activity-count').textContent = this.branchV119 === 'horde' ? `${entries.length} PROTOCOLES / CONTACTS SIMULTANÉS / SURVIE CONTINUE` : `${entries.length} DOSSIERS / ${this.branchV119 === 'events' ? 'DUELS SUCCESSIFS' : 'ÉVALUATION COMPARATIVE'}`;
    const page = getXenoTrialsProgramPageV186(entries, { page: this.programPageV186, kind: this.branchV119 === 'horde' ? this.el('program-filter').value : 'all' });
    this.programPageV186 = page.page;
    this.el('program-filter-label').hidden = this.branchV119 !== 'horde';
    this.el('program-page').textContent = `PAGE ${page.page + 1} / ${page.pageCount} · ${page.start}–${page.end} / ${page.total}`;
    this.el('program-previous').disabled = !page.hasPrevious;
    this.el('program-next').disabled = !page.hasNext;
    this.el('activity-board').innerHTML = page.entries.map((entry, index) => {
      const activity = resolveXenoTrialsActivityV119({ branch: activityBranchV179(this.branchV119), id: entry.id }, state.modesV119);
      const horde = getXenoTrialsHordeBriefingV180(activity);
      const cleared = this.branchV119 === 'horde' ? state.modesV119.hordeCleared?.includes(entry.id) : this.branchV119 === 'campaign' ? state.modesV119.campaignCleared.includes(entry.id) : this.branchV119 === 'contracts' ? state.modesV119.claimedContracts.includes(entry.id) : state.modesV119.challengesCleared.includes(entry.id);
      const opponentId = activity?.opponentId || entry.opponentId || entry.opponentIds?.[0], fighter = FIGHTERS.find(fighter => fighter.id === opponentId);
      const locked = this.branchV119 === 'campaign' && !isXenoTrialsMissionOpenV119(entry.id, state.modesV119) || this.branchV119 === 'contracts' && cleared
        || ['challenges', 'events'].includes(this.branchV119) && state.modesV119.challengeRun && state.modesV119.challengeRun.id !== entry.id;
      const passage = !horde && entry.opponentIds?.length > 1 ? ` · Passage ${(activity?.bout || 0) + 1}/${entry.opponentIds.length}` : '';
      const stage = STAGES.find(stage => stage.id === activity?.stageId);
      return `<article class="xt-activity-v119 ${cleared ? 'validated' : ''}${horde ? ' xt-horde-protocol' : ''}"${entry.eventV179 ? ' data-xt-event="true"' : ''}${horde ? ' data-xt-horde="true"' : ''}>${horde && stage?.backdrop ? `<div class="xt-activity-image"><img src="${stage.backdrop}" alt="" loading="lazy"><span>PROTOCOLE ${String(entries.indexOf(entry) + 1).padStart(2, '0')} / ${escapeHtml(stage.label)}</span></div>` : ''}<p class="eyebrow">${escapeHtml(horde ? 'ALERTE MIRE / HORDE SIMULTANÉE' : entry.act || (entry.eventV179 ? 'ALERTE MIRE / DUELS SUCCESSIFS' : this.branchV119 === 'contracts' ? 'CIBLE ASSIGNÉE' : 'ÉPREUVE FIXE'))}</p><h3>${escapeHtml(entry.title || entry.label)}</h3><strong>${escapeHtml(horde ? horde.pressureLabel : fighter?.label || 'Cible à définir')}${passage}</strong><p>${escapeHtml(entry.briefing || entry.description)}</p>${entry.bossFinaleV186 ? `<p class="xt-boss-order-v186">FINALE · ${escapeHtml(FIGHTERS.find(fighter => fighter.id === entry.bossFinaleV186.fighterId)?.label || 'Contact majeur')} · ${entry.bossFinaleV186.hp} PV</p>` : ''}${hordeStatsV180(horde)}${!horde && activity?.waveLabel ? `<p>${escapeHtml(activity.waveLabel)}</p>` : ''}${!horde ? `<p>${escapeHtml(getXenoTrialsRuleTextV119(activity?.rules || entry.rules))}</p>` : ''}${stage && !horde ? `<p>${escapeHtml(stage.label)}</p>` : ''}<span class="xt-activity-reward">${cleared ? 'VALIDÉ · Récompense déjà accordée' : `PRIME DE VALIDATION · ${activity?.reward ?? entry.reward ?? 0} crédits Trials`}</span><button type="button" class="button ${locked ? '' : 'primary'}" data-xt-activity="${entry.id}" ${locked ? 'disabled' : ''}>${locked ? cleared ? 'CONTRAT TERMINÉ' : state.modesV119.challengeRun ? 'SÉRIE EN COURS' : 'ACCRÉDITATION REQUISE' : cleared ? 'REJOUER' : activity?.bout > 0 ? 'POURSUIVRE LA SÉRIE' : horde ? 'OUVRIR LE PROTOCOLE →' : 'BRIEFING · CHOISIR MON SPÉCIMEN'}</button></article>`;
    }).join('');
    const activity = this.activityV119 && resolveXenoTrialsActivityV119(this.activityV119, state.modesV119);
    const horde = getXenoTrialsHordeBriefingV180(activity);
    this.el('briefing').innerHTML = activity ? `<div class="xt-briefing-identity"><p class="eyebrow">${escapeHtml(activity.supervisor || 'MIRE / ORDRES D’ÉVALUATION')}</p><h2>${escapeHtml(activity.title)}</h2><span>${horde ? 'HORDE / CONFINEMENT CONTINU' : 'DOSSIER / ÉVALUATION COMPARATIVE'}</span></div><div class="xt-briefing-orders">${!horde && activity.waveLabel ? `<h3>PASSAGE ${activity.bout + 1}/${activity.opponentIds.length} · ${escapeHtml(activity.waveLabel)}</h3>` : ''}<p>${escapeHtml(activity.briefing || activity.description || 'Cible demandée par l’opérateur.')}</p>${horde ? `${hordeStatsV180(horde)}<p class="xt-horde-orders">${escapeHtml(horde.orders)}</p>` : `<strong>${escapeHtml(getXenoTrialsRuleTextV119(activity.rules))}</strong>`}${activity.secondary ? `<p>OBJECTIF SECONDAIRE · ${escapeHtml(activity.secondary.label)} · +50 crédits à la première validation.</p>` : ''}${activity.event ? `<p>${escapeHtml(activity.event)}</p>` : ''}</div>` : '';
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
  renderPreviews() {
    const activity = this.activityV119 && resolveXenoTrialsActivityV119(this.activityV119, this.state().modesV119);
    const horde = getXenoTrialsHordeBriefingV180(activity);
    const ids = [this.selected, this.form.elements.opponentId.value];
    this.el('portraits').innerHTML = ids.map((id, i) => {
      const f = FIGHTERS.find(entry => entry.id === id); if (!f) return '';
      const art = getXenoTrialsArtV96(id, this.form.elements[i ? 'opponentVariant' : 'playerVariant'].value);
      const portrait = art ? renderEnemyImportPreviewV103(art, f.label, 'clamp(180px, 40vh, 430px)') || `<img src="${art.path}" alt="${escapeHtml(f.label)}">` : '<p>VISUEL À DÉFINIR</p>';
      const walk = getEnemyImportAnimationV107(art);
      const attack = getEnemyImportAttackV109(art);
      const signature = getXenoTrialsSignatureV147(f);
      const rig=getXenoTrialsRigV154(f,art);
      const motionLabel = rig ? (rig.id.startsWith('rig-v154-') ? 'Présentations, défi et réactions disponibles.' : 'Présentations et réactions disponibles.') : attack ? `Marche : 4 poses adaptées · ${attack.label}` : walk?.label;
      const desiredFacing = i ? -1 : 1;
      const sourceFacing = art?.sourceFacing === 1 ? 1 : -1;
      const family = FAMILIES.find(entry => entry.id === getXenoTrialsSelectionFamilyV119(f))?.label || 'À DÉFINIR';
      const profile = getXenoTrialsRosterProfileV179(f);
      return `<figure><figcaption>${i ? horde ? 'CONTACT TYPE' : 'ADVERSAIRE' : 'VOTRE SPÉCIMEN'}</figcaption><div class="xt-facing-preview" data-facing="${desiredFacing}" style="transform:scaleX(${desiredFacing * sourceFacing});width:100%">${portrait}</div><strong>${escapeHtml(f.label)}</strong><span>${family} · ${roleLabel[f.role]} · ${horde && i ? horde.healthLabel : `${f.hp} PV`} · ${f.speed} mobilité</span><small>${escapeHtml(getXenoTrialsFighterSpecialLabelV147(f))}</small>${profile ? `<p class="xt-help">${escapeHtml(profile.tactic)}</p>` : ''}${signature ? `<small data-xt-signature="${signature.id}">${escapeHtml(signature.description.replace('La prise au sol complète reste à produire.', '').trim())}</small>` : ''}${hasXenoTrialsGrappleV153(f) ? '<small>Saisie rapprochée sur Commando WY, Guardian et Cultiste Darwin Era. Maintenir GARDE pour se dégager. Contre les autres spécimens, le bond reste une attaque de contact.</small>' : ''}<small>DOSSIER : ${escapeHtml(art?.sourceWork || art?.sourceName || 'MIRE')}</small>${motionLabel ? `<small>${escapeHtml(motionLabel)}</small>` : ''}</figure>`;
    }).join(`<span class="xt-versus" aria-hidden="true">${horde ? '×' : 'VS'}</span>`);
    const stage = STAGES.find(s => s.id === this.form.elements.stageId.value) || STAGES[0];
    const matchup = ids.map(id => FIGHTERS.find(f => f.id === id)?.label || '').join(' contre ');
    this.el('arena-matchup').textContent = horde ? `${FIGHTERS.find(f => f.id === this.selected)?.label} · ${horde.waveLabel} · ${horde.populationLabel} · ${horde.healthLabel}` : `${matchup} · Deux manches gagnantes`;
    this.el('arena-rules').textContent = horde ? `${horde.orders} Une seule évaluation ; votre santé est conservée entre les vagues.` : 'Deux manches gagnantes. Présentation des deux spécimens, puis décompte 3–2–1. Le chrono ne démarre qu’au signal de combat.';
    const locked = !this.active || this.selectionStep !== 'arena' || this.isRunning() || this.state().pending || this.unsavedResult;
    this.el('arena-cards').innerHTML = (horde ? [stage] : STAGES).map(s => `<button type="button" class="xt-arena-card" data-xt-arena="${s.id}" aria-pressed="${s.id === stage.id}" ${locked || activity?.stageId && activity.stageId !== s.id ? 'disabled' : ''} style="--xt-back:${s.background};--xt-floor:${s.floor};--xt-accent:${s.accent}"><span class="xt-arena-thumbnail">${s.backdrop ? `<img src="${s.backdrop}" alt="" loading="lazy">` : '<i></i><i></i><i></i>'}</span><strong>${s.label}</strong><small>${activity?.stageId ? 'Environnement assigné à l’évaluation' : s.backdrop ? 'SECTEUR RÉPERTORIÉ' : 'SECTEUR MIRE'} · 2D</small></button>`).join('');
    this.el('stage-preview').innerHTML = `<div class="xt-stage-scene" style="--xt-back:${stage.background};--xt-floor:${stage.floor};--xt-accent:${stage.accent}">${stage.backdrop ? `<img src="${stage.backdrop}" alt="Aperçu du décor sélectionné">` : '<i></i><i></i><i></i><i></i><i></i>'}<span>${stage.label}</span></div><p>${horde ? `${horde.pressureLabel} · ${horde.waveLabel} · ${horde.healthLabel}` : matchup} · ${escapeHtml(stage.label)}</p>`;
  }
  closeRuntime() { this.runtime?.stop(); this.root.removeAttribute('data-xt-outro'); this.el('skip-sequence').hidden = true; this.el('taunt').hidden=true; this.el('taunt').disabled=true; this.generation++; this.runtime = null; this.loading = false; this.lastStatus = null; this.lastResumedTickV186 = null; this.lastGamepadHintV186 = null; }
  close() {
    this.closeRuntime(); this.active = false; this.unsavedResult = null; this.lastStatus = null;
    this.root.ownerDocument?.documentElement?.classList?.remove('xt-fullscreen-v119');
    this.el('retry-save').hidden = true; this.el('next').hidden = true;
    this.el('result').textContent = '';
  }
  begin() {
    if (this.selectionStep !== 'arena' || this.isRunning() || this.unsavedResult) return;
    const config = Object.fromEntries(new FormData(this.form)); config.playerId = this.selected;
    if (this.activityV119) {
      config.activityV119 = { ...this.activityV119 };
      if (this.branchV119 === 'on-demand') config.activityV119.rules = requestedRulesV119(this.form.elements.requestedRules.value);
    }
    const transaction = beginXenoTrialsV96(this.getProgress(), config);
    if (this.commit(transaction)) { this.el('result').textContent = ''; void this.launch(transaction.config); }
  }
  async launch(config) {
    if (!config || !this.active || !this.canCommit() || this.isRunning() || this.unsavedResult) return false;
    this.closeRuntime(); const generation = this.generation;
    this.selectionStep = 'combat'; this.loading = true; this.render(); this.message(config.activityV119?.branch === 'horde' || config.hordeV180 ? 'MIRE / PRÉPARATION DU SECTEUR ET DES CONTACTS…' : 'MIRE / PRÉPARATION DES DEUX SPÉCIMENS…');
    try {
    const runtime = createXenoTrialsRuntimeV96({ canvas: this.el('canvas'), config,
      controlsRoot: this.el('controls'), statusElement: null, htmlHud: true,
      resumeSnapshot: this.state().pending?.checkpointV186?.snapshot,
      onCheckpoint: snapshot => this.persistCheckpointV186(snapshot, generation),
      onState: snapshot => { if (this.active && generation === this.generation) this.updateMatch(snapshot); },
      onResult: result => { if (this.active && generation === this.generation && this.canCommit()) this.finish(result); },
      onExit: () => this.runtime?.pause(),
      onAssetError: () => { if (this.active && generation === this.generation) this.message('Liaison visuelle interrompue. Évaluation conservée : recommencez après rechargement.'); }
    });
    this.runtime = runtime;
      const ready = await runtime.start();
      if (generation !== this.generation || !this.active || !this.canCommit()) {
        runtime.stop();
        if (generation === this.generation) { this.closeRuntime(); this.render(); }
        return false;
      }
      this.loading = false;
      if (ready === false) { this.closeRuntime(); this.render(); this.message('Liaison visuelle interrompue. Évaluation conservée : recommencez après rechargement.'); return false; }
      this.render(); this.root.scrollTop = 0;
      if (!runtime.getState().paused && this.root.ownerDocument?.hasFocus?.() !== false) this.el('canvas').focus({ preventScroll: true });
      return true;
    } catch (error) {
      if (generation !== this.generation) return false;
      this.closeRuntime(); this.render(); this.message(`Duel non lancé : ${error.message}`); return false;
    }
  }
  persistCheckpointV186(snapshot, generation) {
    if (!this.active || generation !== this.generation || !this.canCommit() || this.unsavedResult) return false;
    const transaction = checkpointXenoTrialsV186(this.getProgress(), snapshot);
    if (!transaction.applied) return false;
    try {
      this.onCommit(transaction.state);
      this.el('retry-checkpoint').hidden = this.el('retry-checkpoint-overlay').hidden = true;
      this.el('checkpoint-status').textContent = `REPRISE CONSERVÉE · VAGUE ${snapshot.hordeV180.wave} / ${snapshot.hordeV180.waveCount}`;
      return true;
    } catch {
      this.el('retry-checkpoint').hidden = this.el('retry-checkpoint-overlay').hidden = false;
      this.el('checkpoint-status').textContent = 'Reprise non sauvegardée. Réessayez avant de quitter le terminal.';
      return false;
    }
  }
  updateMatch(snapshot) {
    const deviceHint = snapshot.gamepadV186?.connected ? snapshot.gamepadV186.needsNeutral
      ? 'MANETTE CONNECTÉE · Relâchez les commandes pour reprendre.' : 'MANETTE CONNECTÉE' : 'CLAVIER / TACTILE';
    if (deviceHint !== this.lastGamepadHintV186) {
      this.el('input-device').textContent = deviceHint; this.lastGamepadHintV186 = deviceHint;
    }
    if (snapshot.resumedV186 && snapshot.paused && snapshot.checkpointV186?.saved !== false && this.lastResumedTickV186 !== snapshot.tick) {
      this.el('checkpoint-status').textContent = 'Reprise de la vague conservée. Reprenez avec P, Start ou le bouton Reprendre.';
      this.lastResumedTickV186 = snapshot.tick;
    }
    const wasPaused = this.root.getAttribute('data-xt-paused') === 'true';
    const horde = getXenoTrialsHordeViewV180(snapshot);
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
      this.el('horde-phase').textContent = horde.phase;
      this.el('horde-kills').textContent = `${horde.kills} / ${horde.total} NEUTRALISÉS`;
      this.el('horde-progress').max = Math.max(1, horde.total);
      this.el('horde-progress').value = horde.kills;
      if (this.hordeAnnouncementV180 !== horde.announcement) {
        this.el('horde-announcement').textContent = horde.announcement;
        this.hordeAnnouncementV180 = horde.announcement;
      }
    } else if (this.hordeAnnouncementV180) { this.el('horde-announcement').textContent = ''; this.hordeAnnouncementV180 = null; }
    this.el('health').textContent = hudFighters.map((f, i) => `${i === 0 ? 'Vous' : 'Adversaire'} : ${Math.ceil(f.hp)} PV · ${Math.floor(f.stamina)} endurance`).join(' / ');
    // HTML meters retain readable text/touch scale even on a narrow canvas.
    // They only reflect the runtime snapshot; no combat values are written here.
    for (const [i, fighter] of hudFighters.entries()) {
      const side = i === 0 ? 'player' : 'opponent', definition = FIGHTERS.find(f => f.id === fighter.id);
      this.el(`${side}-name`).textContent = definition.label;
      this.el(`${side}-name`).setAttribute('title', definition.label);
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
      const side = i ? 'opponent' : 'player', definition = FIGHTERS.find(f => f.id === fighter.id);
      const state = getXenoTrialsSuperReadinessV148(snapshot, fighter, definition);
      const meter = this.el(`${side}-super`), label = this.el(`${side}-super-value`);
      meter.hidden = label.hidden = !state.supported;
      meter.max = state.maximum; meter.value = state.meter;
      meter.setAttribute('title', getXenoTrialsSuperStatusV148(state));
      label.textContent = `SUPER ${Math.floor(state.meter)} / ${state.maximum}${state.ready ? ' · PRÊT' : ''}`;
      if (!i) {
        const button = this.root.querySelector('[data-xeno-action="super"]');
        button.hidden = !state.supported;
        button.setAttribute('aria-disabled', String(!state.ready));
        button.setAttribute('title', getXenoTrialsSuperStatusV148(state));
        button.setAttribute('aria-label', getXenoTrialsSuperStatusV148(state));
      }
    }
    this.el('clock').textContent = String(Math.ceil(snapshot.timeRemaining));
    this.el('clock').setAttribute('data-low', String(snapshot.timeRemaining <= 10));
    this.el('round').textContent = horde ? horde.waveLabel : `MANCHE ${snapshot.round}`;
    this.el('score').textContent = horde ? `${horde.kills} / ${horde.total}` : `${snapshot.wins.player} — ${snapshot.wins.opponent}`;
    this.el('score').setAttribute('aria-label', horde ? 'Contacts neutralisés sur la population totale' : 'Manches gagnées : joueur — adversaire');
    const phase = snapshot.paused ? 'PAUSE' : snapshot.presentation?.blocksSimulation ? snapshot.presentation.countdown ? `DÉPART DANS ${snapshot.presentation.countdown}` : 'PRÉSENTATION DES SPÉCIMENS' : { intro: 'PRÉPARATION', active: 'COMBAT', 'round-over': 'FIN DE MANCHE', 'match-over': 'ÉVALUATION TERMINÉE' }[snapshot.phase];
    const grapple = snapshot.grappleViewV153;
    const text = horde ? `${horde.phase} · ${horde.waveLabel}` : `${grapple?.target === 'player' ? 'SAISIE · MAINTENIR S / GARDE POUR SE DÉGAGER · ' : ''}${phase} · Manche ${snapshot.round} · ${snapshot.wins.player} — ${snapshot.wins.opponent} · ${Math.ceil(snapshot.timeRemaining)} s`;
    if (this.lastStatus !== text && !this.unsavedResult) { this.message(text); this.lastStatus = text; }
    this.el('next').hidden = Boolean(horde) || snapshot.phase !== 'round-over';
    const outroPlaying = snapshot.outroV155?.phase === 'playing' || snapshot.terminalV156?.phase === 'playing' || snapshot.exitV157?.phase === 'playing' || snapshot.landingV157?.phase === 'playing';
    this.el('taunt').hidden = Boolean(horde) || !getXenoTrialsSequenceV155(getXenoTrialsRigV154(FIGHTERS.find(f=>f.id===snapshot.fighters[0].id),getXenoTrialsArtV96(snapshot.fighters[0].id,snapshot.fighters[0].variant)), 'taunt');
    this.el('taunt').disabled=!snapshot.canTauntV156 || Boolean(this.unsavedResult);
    this.root.setAttribute('data-xt-outro',String(outroPlaying));
    this.el('skip-sequence').hidden = !(outroPlaying || snapshot.presentation?.fighterSlot !== null && snapshot.presentation?.blocksSimulation) || snapshot.paused;
    this.el('skip-sequence').textContent = outroPlaying ? 'PASSER LA SÉQUENCE FINALE' : 'PASSER LA PRÉSENTATION';
    this.el('pause').disabled = snapshot.phase === 'match-over' && !outroPlaying || Boolean(this.unsavedResult);
    this.el('pause').textContent = snapshot.paused ? 'REPRENDRE' : 'PAUSE';
    this.el('pause-overlay').hidden = !snapshot.paused || snapshot.phase === 'match-over' && !outroPlaying;
    // A completed result has already settled its ticket. Its presentation can
    // pause, but offering abandonment here would be an impossible no-op.
    const canAbandon = snapshot.phase !== 'match-over' && Boolean(this.getProgress()?.pending) && !this.unsavedResult;
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
    if (!result || !this.active || !this.canCommit()) return false;
    const transaction = settleXenoTrialsV96(this.getProgress(), result);
    if (!transaction.applied) { this.message('Résultat non applicable à ce duel. Aucun gain ajouté.'); return false; }
    this.unsavedResult = result;
    this.render(); // Lock conflicting actions even when the storage commit below throws.
    if (!this.commit(transaction)) { this.el('retry-save').hidden = false; return false; }
    this.unsavedResult = null; this.el('retry-save').hidden = true;
    const outcome = { player: 'VICTOIRE', opponent: 'DÉFAITE', draw: 'ÉGALITÉ' }[result.winner];
    this.el('result').textContent = `${outcome} · Résultat sauvegardé · +${transaction.receipt.credits} crédits de simulation · +${transaction.receipt.xp} XP${transaction.receipt.modeReward?.continuing ? ' · Série en cours : préparez le passage suivant.' : ''}${transaction.receipt.modeReward?.secondary ? ' · Objectif secondaire validé.' : ''}`;
    this.render();
    this.message('Évaluation terminée. Résultat sauvegardé. Préparez un autre duel pour poursuivre les évaluations.');
    return true;
  }
  render() {
    const state = this.state(), running = this.isRunning();
    if (!state.pending) { this.el('retry-checkpoint').hidden = this.el('retry-checkpoint-overlay').hidden = true; this.el('checkpoint-status').textContent = ''; }
    this.renderActivitiesV119(state);
    this.el('series-resume').hidden = !state.modesV119.challengeRun;
    this.el('home').hidden = this.selectionStep !== 'home'; this.el('activities').hidden = this.selectionStep !== 'activities';
    this.el('layout').hidden = ['home', 'activities'].includes(this.selectionStep);
    this.el('briefing').hidden = !this.activityV119 || !['fighters', 'arena', 'target'].includes(this.selectionStep);
    this.el('family-tabs').innerHTML = FAMILIES.map(family => `<button type="button" data-xt-family-tab="${family.id}" aria-pressed="${this.el('family').value === family.id}">${family.label}</button>`).join('');
    this.el('progress').textContent = `DIVISION ${Math.floor(state.xp / 300) + 1} · ${state.xp} XP · ${state.credits} crédits de simulation · ${state.wins} V / ${state.losses} D / ${state.draws} N · ${state.unlocked.length}/${FIGHTERS.length} spécimens`;
    const filtered = filterXenoTrialsRosterV97(FIGHTERS, { family: this.el('family').value || 'all', role: this.el('role').value || 'all', ownership: this.el('ownership').value || 'all', sort: this.el('sort').value || 'catalog', query: this.el('search').value, unlocked: state.unlocked,
      factionRoster: FACTIONS.find(f => f.id === this.el('faction-filter').value)?.roster || null });
    const page = getXenoTrialsRosterPageV179(filtered, { page: this.rosterPageV179, selectedId: this.selected, revealSelected: this.rosterSelectionV179 !== this.selected });
    this.rosterPageV179 = page.page; this.rosterSelectionV179 = this.selected;
    this.el('count').textContent = `${filtered.length} / ${FIGHTERS.length} spécimens · Sélection : ${FIGHTERS.find(f => f.id === this.selected).label}`;
    this.el('roster-page').textContent = `LOT ${page.page + 1} / ${page.pageCount} · ${page.start}–${page.end}`;
    this.el('roster-previous').disabled = running || Boolean(state.pending) || Boolean(this.unsavedResult) || !page.hasPrevious;
    this.el('roster-next').disabled = running || Boolean(state.pending) || Boolean(this.unsavedResult) || !page.hasNext;
    this.el('roster-selection').disabled = running || Boolean(state.pending) || Boolean(this.unsavedResult);
    this.el('roster').innerHTML = page.fighters.map(f => {
      const unlocked = state.unlocked.includes(f.id), art = getXenoTrialsArtV96(f.id, f.id === 'arachnoid' ? this.form.elements.playerVariant.value : null), cost = getXenoTrialsUnlockCostV96(f.id);
      const portrait = renderEnemyImportPreviewV103(art, f.label, 'clamp(70px, 9vw, 95px)') || `<img src="${art.path}" alt="${f.label}" loading="lazy">`;
      return `<article class="xt-fighter ${this.selected === f.id ? 'selected' : ''}"><button type="button" data-xt-fighter="${f.id}" aria-pressed="${this.selected === f.id}" ${running || state.pending ? 'disabled' : ''}>${portrait}<strong>${f.label}</strong><small>${roleLabel[f.role]} · ${f.hp} PV</small><small>${getXenoTrialsFighterSpecialLabelV147(f)}</small>${getXenoTrialsSuperV148(f) ? `<small>Super : ${getXenoTrialsSuperV148(f).label}</small>` : ''}</button>${unlocked ? '<span class="xt-owned">ACQUIS</span>' : `<button type="button" class="xt-unlock" data-xt-unlock="${f.id}" ${this.unsavedResult || state.pending || state.credits < cost ? 'disabled' : ''}>DÉBLOQUER · ${cost}</button>`}</article>`;
    }).join('') || '<p class="xt-help">Aucun spécimen ne correspond à ces filtres. Votre sélection est conservée.</p>';
    const activity = this.activityV119 && resolveXenoTrialsActivityV119(this.activityV119, state.modesV119);
    const horde = getXenoTrialsHordeBriefingV180(activity);
    if (!running) this.root.setAttribute('data-xt-mode', horde ? 'horde' : 'duel');
    this.el('start').textContent = horde ? 'ENGAGER LE PROTOCOLE HORDE' : 'LANCER LE DUEL';
    this.el('confirm-fighters').textContent = horde ? 'CONFIRMER · VÉRIFIER LE SECTEUR →' : 'CONFIRMER · CHOISIR L’ARÈNE →';
    this.el('restart').textContent = state.pending?.checkpointV186 ? `REPRENDRE LA VAGUE ${state.pending.checkpointV186.snapshot.hordeV180.wave}` : state.pending?.config?.activityV119?.branch === 'horde' ? 'RECOMMENCER LE PROTOCOLE SAUVEGARDÉ' : 'RECOMMENCER LE DUEL SAUVEGARDÉ';
    this.el('restart-from-start').hidden = !state.pending?.checkpointV186 || running;
    this.el('restart-from-start').disabled = Boolean(this.unsavedResult);
    this.el('mode-help').textContent = horde ? horde.orders : 'Deux manches gagnantes. Surveillez votre endurance et punissez les attaques manquées.';
    const wrongCombatant = Boolean(activity?.forcedPlayerId && this.selected !== activity.forcedPlayerId
      || activity?.requiredFamily && FIGHTERS.find(f => f.id === this.selected)?.family !== activity.requiredFamily);
    const unavailable = !this.active || running || Boolean(state.pending) || Boolean(this.unsavedResult) || !state.unlocked.includes(this.selected) || wrongCombatant;
    this.el('start').disabled = unavailable || this.selectionStep !== 'arena';
    this.el('confirm-fighters').disabled = unavailable;
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
    this.el('steps').innerHTML = [['fighters','01 · COMBATTANTS'],['arena','02 · ARÈNE'],['combat',horde ? '03 · HORDE' : '03 · DUEL']].map(([id,label]) => `<span ${id === this.selectionStep ? 'aria-current="step"' : ''}>${label}</span>`).join('');
    this.el('new-duel').hidden = this.selectionStep !== 'combat' || running || Boolean(state.pending) || Boolean(this.unsavedResult);
    this.el('new-duel').textContent = state.modesV119.challengeRun ? 'POURSUIVRE LA SÉRIE' : this.activityV119 && this.branchV119 !== 'on-demand' ? 'RETOUR AUX ÉVALUATIONS' : 'PRÉPARER UN AUTRE DUEL';
    this.el('restart').hidden = !state.pending || running;
    this.el('abandon').hidden = !state.pending;
    this.el('abandon').disabled = Boolean(this.unsavedResult);
    for (const element of this.form.elements) if (element.tagName === 'SELECT') element.disabled = running || Boolean(state.pending);
    if (this.activityV119 && this.branchV119 !== 'on-demand') for (const key of ['opponentId', 'factionId', 'difficulty', 'stageId', 'roundSeconds']) this.form.elements[key].disabled = true;
    if (activity?.rules?.timeLimitSeconds) { this.form.elements.roundSeconds.value=String(activity.rules.timeLimitSeconds); this.form.elements.roundSeconds.disabled=true; }
    if (!state.pending) this.updateVariants();
    this.renderPreviews();
    this.el('pause').disabled = (!running && this.runtime?.getState().outroV155?.phase !== 'playing' && this.runtime?.getState().terminalV156?.phase !== 'playing' && this.runtime?.getState().exitV157?.phase !== 'playing' && this.runtime?.getState().landingV157?.phase !== 'playing') || this.loading || Boolean(this.unsavedResult);
    this.el('history').replaceChildren();
    for (const e of state.ledger.slice(-8).reverse()) {
      const row = document.createElement('p'); row.textContent = `${e.matchId} · ${e.playerId} / ${e.opponentId} · ${e.winner === 'abandoned' ? 'annulé' : { player: 'victoire', opponent: 'défaite', draw: 'égalité' }[e.winner]} · +${e.credits} crédits`;
      this.el('history').append(row);
    }
    // A terminal result awaiting its commit is not a resumable saved duel.
    if (!running && this.unsavedResult) this.message('Évaluation terminée. Résultat en attente de sauvegarde. Réessayez la sauvegarde du résultat.');
    else if (!running && state.pending) this.message(state.pending.checkpointV186 ? 'Reprise conservée. Retrouvez la vague et la santé enregistrées, puis reprenez depuis la pause.' : state.pending.config?.activityV119?.branch === 'horde' ? 'Protocole sauvegardé en attente. Recommencez depuis la première vague ou annulez sans gain.' : 'Duel sauvegardé en attente. Recommencez depuis la première manche ou annulez sans gain.');
  }
}
