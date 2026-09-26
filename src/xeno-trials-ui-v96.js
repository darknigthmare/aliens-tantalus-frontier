import { XENO_TRIALS_FIGHTERS_V96 as FIGHTERS, XENO_TRIALS_FACTIONS_V96 as FACTIONS,
  XENO_TRIALS_STAGES_V96 as STAGES, XENO_TRIALS_LORE_NOTICE_V96, getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { normalizeXenoTrialsProgressV96, getXenoTrialsUnlockCostV96,
  beginXenoTrialsV96, settleXenoTrialsV96, abandonXenoTrialsV96, unlockXenoTrialsFighterV96 } from './xeno-trials-progress-v96.js';
import { createXenoTrialsRuntimeV96 } from './xeno-trials-runtime-v96.js';
import { filterXenoTrialsRosterV97 } from './xeno-trials-selection-v97.js';

const options = entries => entries.map(e => `<option value="${e.id}">${e.label}</option>`).join('');
const roleLabel = { balanced: 'Polyvalent', agile: 'Mobile', tank: 'Défensif', ranged: 'Distance' };
const specialLabel = { tail: 'Fouet caudal', pounce: 'Bond', ram: 'Charge', slash: 'Lacération', acid: 'Salve acide', pulse: 'Impulsion' };
const controlLabel = { left: 'Aller à gauche', right: 'Aller à droite', jump: 'Sauter', guard: 'Maintenir la garde', light: 'Frappe rapide', heavy: 'Frappe lourde', special: 'Attaque spéciale' };

/** UI owns no campaign money and never writes outside its current save owner. */
export class XenoTrialsUiV96 {
  constructor({ root, getProgress, onCommit, canCommit, onReturn }) {
    Object.assign(this, { root, getProgress, onCommit, canCommit, onReturn });
    this.runtime = null; this.generation = 0; this.selected = 'warrior'; this.active = false;
    this.selectionStep = 'fighters';
    root.innerHTML = `<div class="section-intro"><div><p class="eyebrow">WEYLAND-YUTANI // ÉVALUATION COMPARATIVE</p><h2>Xeno Trials</h2></div><button class="button" data-xt="return">RETOUR AU VAISSEAU</button></div>
      <p class="xt-notice">${XENO_TRIALS_LORE_NOTICE_V96}</p>
      <div class="xt-dashboard" data-xt="progress"></div>
      <nav class="xt-steps" aria-label="Préparation du duel" data-xt="steps"></nav>
      <a class="button xt-lab-link" href="/depth-lab-v97.html" target="_blank" rel="noopener">LABORATOIRE VISUEL · COMPARER 2D / 2.5D ↗</a>
      <div class="xt-layout" data-xt="layout"><aside class="xt-roster" data-xt="stable"><h3>Votre écurie</h3>
      <div class="xt-filters">
        <label>Rechercher<input type="search" data-xt="search" placeholder="Nom du spécimen" maxlength="80"></label>
        <label>Famille<select data-xt="family"><option value="all">Toutes les familles</option><option value="xenomorph">Xénomorphes</option><option value="synthetic">Synthétiques / machines</option><option value="pathogen">Pathogènes</option></select></label>
        <label>Rôle<select data-xt="role"><option value="all">Tous les rôles</option>${Object.entries(roleLabel).map(([id,label]) => `<option value="${id}">${label}</option>`).join('')}</select></label>
        <label>Disponibilité<select data-xt="ownership"><option value="all">Toute l’écurie</option><option value="owned">Acquis</option><option value="locked">À débloquer</option></select></label>
        <label>Trier<select data-xt="sort"><option value="catalog">Catalogue</option><option value="name">Nom A–Z</option><option value="health">Santé décroissante</option><option value="speed">Vitesse décroissante</option></select></label>
      </div><p data-xt="count" class="xt-help" role="status"></p><div data-xt="roster" class="xt-fighters"></div></aside>
      <div class="xt-main"><form data-xt="form" class="xt-config">
        <section class="xt-selection-fields" data-xt="fighter-config"><h3>01 / Choisissez les combattants</h3>
        <div data-xt="portraits" class="xt-portraits"></div>
        <label>Cellule adverse<select name="factionId">${options(FACTIONS)}</select></label>
        <label>Spécimen adverse<select name="opponentId"></select></label>
        <label>Niveau<select name="difficulty"><option value="easy">Acclimatation</option><option value="normal" selected>Standard</option><option value="hard">Élite</option></select></label>
        <label>Votre Arachnoid<select name="playerVariant"><option value="grey">Grey</option><option value="purple">Purple</option></select></label>
        <label>Arachnoid adverse<select name="opponentVariant"><option value="grey">Grey</option><option value="purple">Purple</option></select></label>
        <p data-xt="doctrine" class="xt-doctrine"></p>
        <button type="button" class="button primary" data-xt="confirm-fighters">CONFIRMER · CHOISIR L’ARÈNE →</button>
        </section>
        <section class="xt-selection-fields" data-xt="arena-config" hidden><h3>02 / Choisissez l’arène</h3>
        <label>Environnement<select name="stageId">${options(STAGES)}</select></label>
        <label>Durée d’une manche<select name="roundSeconds"><option value="60">60 secondes</option><option value="75">75 secondes</option><option value="99" selected>99 secondes · The Pit</option><option value="120">120 secondes</option></select></label>
        <div data-xt="stage-preview" class="xt-stage-preview"></div>
        <p class="xt-doctrine">Deux manches gagnantes. Présentation des deux spécimens, puis décompte 3–2–1. Le chrono ne démarre qu’au signal de combat.</p>
        <button type="button" class="button" data-xt="back-fighters">← MODIFIER LES COMBATTANTS</button>
        <button type="submit" class="button primary" data-xt="start">LANCER LE DUEL</button>
        </section>
        <button type="button" class="button" data-xt="restart" hidden>RECOMMENCER LE DUEL SAUVEGARDÉ</button>
        <button type="button" class="button danger-outline" data-xt="abandon" hidden>ANNULER LE DUEL · SANS GAIN</button>
      </form>
      <p data-xt="status" class="xt-status" role="status" aria-live="polite">Choisissez votre spécimen puis une cellule adverse.</p>
      <section data-xt="combat-panel" hidden><div class="xt-arena"><canvas width="1000" height="560" tabindex="0" data-xt="canvas" aria-label="Arène de combat Xeno Trials" aria-describedby="xeno-trials-help-v96"></canvas>
      <p data-xt="health" class="xt-help" aria-label="Santé et endurance des combattants"></p></div>
      <div class="xt-actions"><button class="button" data-xt="pause" disabled>PAUSE / REPRENDRE</button><button class="button" data-xt="next" hidden>MANCHE SUIVANTE</button><button class="button" data-xt="retry-save" hidden>RÉESSAYER LA SAUVEGARDE DU RÉSULTAT</button></div>
      <div data-xt="controls" class="xt-controls" role="group" aria-label="Commandes de combat tactiles">
        ${[['left','←'],['right','→'],['jump','SAUT'],['guard','GARDE'],['light','J · RAPIDE'],['heavy','K · LOURD'],['special','L · SPÉCIAL']].map(([key,label]) => `<button type="button" data-xeno-action="${key}" aria-label="${controlLabel[key]}">${label}</button>`).join('')}
      </div><p id="xeno-trials-help-v96" class="xt-help">Déplacement : Q/D ou flèches · Saut : Z/↑/Espace · Garde : S/↓ · Attaques : J/K/L · Pause : P. Deux manches gagnantes. La garde consomme de l’endurance. Coups lourds pour briser une garde épuisée. Les poses sont fixes ; déplacements et collisions sont simulés.</p></section>
      <button type="button" class="button" data-xt="new-duel" hidden>PRÉPARER UN AUTRE DUEL</button>
      <div data-xt="result" class="xt-result" role="status" aria-live="polite"></div>
      <details class="xt-history"><summary>Journal des évaluations</summary><div data-xt="history"></div></details></div></div>`;
    this.el = key => root.querySelector(`[data-xt="${key}"]`);
    this.form = this.el('form');
    this.form.addEventListener('submit', event => { event.preventDefault(); this.begin(); });
    this.form.elements.factionId.addEventListener('change', () => this.updateOpponents());
    this.form.elements.opponentId.addEventListener('change', () => { this.updateVariants(); this.renderPreviews(); });
    this.form.elements.opponentVariant.addEventListener('change', () => this.renderPreviews());
    this.form.elements.stageId.addEventListener('change', () => this.renderPreviews());
    this.form.elements.playerVariant.addEventListener('change', () => { if (!this.isRunning()) this.render(); });
    root.addEventListener('click', event => {
      const fighter = event.target.closest('[data-xt-fighter]');
      if (fighter && this.active && !this.isRunning() && !this.state().pending) { this.selected = fighter.dataset.xtFighter; this.render(); }
      const unlock = event.target.closest('[data-xt-unlock]');
      if (unlock) this.commit(unlockXenoTrialsFighterV96(this.getProgress(), unlock.dataset.xtUnlock));
    });
    this.el('return').onclick = () => { this.close(); this.onReturn(); };
    this.el('confirm-fighters').onclick = () => this.confirmFighters();
    this.el('back-fighters').onclick = () => this.showFighters();
    this.el('new-duel').onclick = () => this.showFighters();
    for (const key of ['family', 'role', 'ownership', 'sort']) this.el(key).addEventListener('change', () => this.render());
    this.el('search').addEventListener('input', () => this.render());
    this.el('restart').onclick = () => this.launch(this.state().pending?.config);
    this.el('abandon').onclick = () => { if (this.commit(abandonXenoTrialsV96(this.getProgress()))) { this.closeRuntime(); this.selectionStep = 'fighters'; this.render(); } };
    this.el('pause').onclick = () => { if (!this.runtime || this.unsavedResult) return; this.runtime.getState().paused ? this.runtime.resume() : this.runtime.pause(); };
    this.el('next').onclick = () => this.runtime?.nextRound();
    this.el('retry-save').onclick = () => this.finish(this.unsavedResult);
    this.updateOpponents(); this.restorePendingSelection(); this.render();
  }
  state() { return normalizeXenoTrialsProgressV96(this.getProgress()); }
  isRunning() { return Boolean(this.loading || this.runtime && this.runtime.getState().phase !== 'match-over'); }
  message(text) { this.el('status').textContent = text; }
  updateOpponents() {
    const faction = FACTIONS.find(f => f.id === this.form.elements.factionId.value) || FACTIONS[0];
    this.form.elements.opponentId.innerHTML = options(FIGHTERS.filter(f => faction.roster.includes(f.id)));
    this.el('doctrine').textContent = faction.description; this.updateVariants(); this.renderPreviews();
  }
  updateVariants() {
    this.form.elements.playerVariant.disabled = this.selected !== 'arachnoid' || this.isRunning();
    this.form.elements.opponentVariant.disabled = this.form.elements.opponentId.value !== 'arachnoid' || this.isRunning();
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
  open() { this.active = true; this.restorePendingSelection(); this.render(); }
  confirmFighters() {
    if (!this.active || this.isRunning() || this.state().pending || this.unsavedResult || !this.state().unlocked.includes(this.selected)) return false;
    this.selectionStep = 'arena'; this.render(); this.form.elements.stageId.focus(); return true;
  }
  showFighters() {
    if (this.isRunning() || this.state().pending || this.unsavedResult) return false;
    this.closeRuntime(); this.selectionStep = 'fighters'; this.render(); this.el('confirm-fighters').focus(); return true;
  }
  renderPreviews() {
    const ids = [this.selected, this.form.elements.opponentId.value];
    this.el('portraits').innerHTML = ids.map((id, i) => {
      const f = FIGHTERS.find(entry => entry.id === id); if (!f) return '';
      const art = getXenoTrialsArtV96(id, this.form.elements[i ? 'opponentVariant' : 'playerVariant'].value);
      return `<figure><figcaption>${i ? 'ADVERSAIRE' : 'VOTRE SPÉCIMEN'}</figcaption><img src="${art.path}" alt="${f.label}"><strong>${f.label}</strong><span>${roleLabel[f.role]} · ${f.hp} PV</span></figure>`;
    }).join('<span class="xt-versus" aria-hidden="true">VS</span>');
    const stage = STAGES.find(s => s.id === this.form.elements.stageId.value) || STAGES[0];
    this.el('stage-preview').innerHTML = `<div class="xt-stage-scene" style="--xt-back:${stage.background};--xt-floor:${stage.floor};--xt-accent:${stage.accent}"><span>${stage.label}</span><i></i><i></i><i></i><i></i><i></i></div><p>${ids.map(id => FIGHTERS.find(f => f.id === id)?.label || '').join(' contre ')} · Arène simulée, sans danger de décor.</p>`;
  }
  closeRuntime() { this.generation++; this.runtime?.stop(); this.runtime = null; this.loading = false; }
  close() {
    this.active = false; this.closeRuntime(); this.unsavedResult = null; this.lastStatus = null;
    this.el('retry-save').hidden = true; this.el('next').hidden = true;
    this.el('result').textContent = '';
  }
  begin() {
    if (this.selectionStep !== 'arena' || this.isRunning() || this.unsavedResult) return;
    const config = Object.fromEntries(new FormData(this.form)); config.playerId = this.selected;
    const transaction = beginXenoTrialsV96(this.getProgress(), config);
    if (this.commit(transaction)) { this.el('result').textContent = ''; void this.launch(transaction.config); }
  }
  async launch(config) {
    if (!config || !this.active || !this.canCommit() || this.isRunning() || this.unsavedResult) return false;
    this.closeRuntime(); const generation = this.generation;
    this.selectionStep = 'combat'; this.loading = true; this.render(); this.message('Chargement des deux sprites dédiés…');
    try {
    const runtime = createXenoTrialsRuntimeV96({ canvas: this.el('canvas'), config,
      controlsRoot: this.el('controls'), statusElement: null,
      onState: snapshot => { if (this.active && generation === this.generation) this.updateMatch(snapshot); },
      onResult: result => { if (this.active && generation === this.generation && this.canCommit()) this.finish(result); },
      onExit: () => this.runtime?.pause(),
      onAssetError: () => { if (this.active && generation === this.generation) this.message('Sprite indisponible. Duel conservé : recommencez après rechargement.'); }
    });
    this.runtime = runtime;
      const ready = await runtime.start();
      if (generation !== this.generation || !this.active || !this.canCommit()) {
        runtime.stop();
        if (generation === this.generation) { this.closeRuntime(); this.render(); }
        return false;
      }
      this.loading = false;
      if (ready === false) { this.closeRuntime(); this.render(); this.message('Sprite indisponible. Duel conservé : recommencez après rechargement.'); return false; }
      this.render(); this.el('canvas').focus({ preventScroll: true }); return true;
    } catch (error) {
      if (generation !== this.generation) return false;
      this.closeRuntime(); this.render(); this.message(`Duel non lancé : ${error.message}`); return false;
    }
  }
  updateMatch(snapshot) {
    this.el('health').textContent = snapshot.fighters.map((f, i) => `${i === 0 ? 'Vous' : 'Adversaire'} : ${Math.ceil(f.hp)} PV · ${Math.floor(f.stamina)} endurance`).join(' / ');
    const phase = snapshot.paused ? 'PAUSE' : snapshot.presentation?.blocksSimulation ? snapshot.presentation.countdown ? `DÉPART DANS ${snapshot.presentation.countdown}` : 'PRÉSENTATION DES SPÉCIMENS' : { intro: 'PRÉPARATION', active: 'COMBAT', 'round-over': 'FIN DE MANCHE', 'match-over': 'ÉVALUATION TERMINÉE' }[snapshot.phase];
    const text = `${phase} · Manche ${snapshot.round} · ${snapshot.wins.player} — ${snapshot.wins.opponent} · ${Math.ceil(snapshot.timeRemaining)} s`;
    if (this.lastStatus !== text && !this.unsavedResult) { this.message(text); this.lastStatus = text; }
    this.el('next').hidden = snapshot.phase !== 'round-over';
    this.el('pause').disabled = snapshot.phase === 'match-over' || Boolean(this.unsavedResult);
  }
  finish(result) {
    if (!result || !this.active || !this.canCommit()) return false;
    const transaction = settleXenoTrialsV96(this.getProgress(), result);
    if (!transaction.applied) { this.message('Résultat non applicable à ce duel. Aucun gain ajouté.'); return false; }
    this.unsavedResult = result;
    if (!this.commit(transaction)) { this.el('retry-save').hidden = false; return false; }
    this.unsavedResult = null; this.el('retry-save').hidden = true;
    const outcome = { player: 'VICTOIRE', opponent: 'DÉFAITE', draw: 'ÉGALITÉ' }[result.winner];
    this.el('result').textContent = `${outcome} · Résultat sauvegardé · +${transaction.receipt.credits} crédits de simulation · +${transaction.receipt.xp} XP`;
    this.render(); return true;
  }
  render() {
    const state = this.state(), running = this.isRunning();
    this.el('progress').textContent = `DIVISION ${Math.floor(state.xp / 300) + 1} · ${state.xp} XP · ${state.credits} crédits de simulation · ${state.wins} V / ${state.losses} D / ${state.draws} N · ${state.unlocked.length}/${FIGHTERS.length} spécimens`;
    const filtered = filterXenoTrialsRosterV97(FIGHTERS, { family: this.el('family').value || 'all', role: this.el('role').value || 'all', ownership: this.el('ownership').value || 'all', sort: this.el('sort').value || 'catalog', query: this.el('search').value, unlocked: state.unlocked });
    this.el('count').textContent = `${filtered.length} / ${FIGHTERS.length} spécimens · Sélection : ${FIGHTERS.find(f => f.id === this.selected).label}`;
    this.el('roster').innerHTML = filtered.map(f => {
      const unlocked = state.unlocked.includes(f.id), art = getXenoTrialsArtV96(f.id, f.id === 'arachnoid' ? this.form.elements.playerVariant.value : null), cost = getXenoTrialsUnlockCostV96(f.id);
      return `<article class="xt-fighter ${this.selected === f.id ? 'selected' : ''}"><button type="button" data-xt-fighter="${f.id}" aria-pressed="${this.selected === f.id}" ${running || state.pending ? 'disabled' : ''}><img src="${art.path}" alt="${f.label}" loading="lazy"><strong>${f.label}</strong><small>${roleLabel[f.role]} · ${f.hp} PV</small><small>${specialLabel[f.special]}</small></button>${unlocked ? '<span class="xt-owned">ACQUIS</span>' : `<button type="button" class="xt-unlock" data-xt-unlock="${f.id}" ${state.pending || state.credits < cost ? 'disabled' : ''}>DÉBLOQUER · ${cost}</button>`}</article>`;
    }).join('') || '<p class="xt-help">Aucun spécimen ne correspond à ces filtres. Votre sélection est conservée.</p>';
    const unavailable = !this.active || running || Boolean(state.pending) || Boolean(this.unsavedResult) || !state.unlocked.includes(this.selected);
    this.el('start').disabled = unavailable || this.selectionStep !== 'arena';
    this.el('confirm-fighters').disabled = unavailable;
    this.el('back-fighters').disabled = running || Boolean(state.pending);
    this.el('stable').hidden = this.selectionStep !== 'fighters';
    this.el('fighter-config').hidden = this.selectionStep !== 'fighters';
    this.el('arena-config').hidden = this.selectionStep !== 'arena';
    this.el('combat-panel').hidden = this.selectionStep !== 'combat';
    this.el('layout').setAttribute('data-step', this.selectionStep);
    this.el('steps').innerHTML = [['fighters','01 · COMBATTANTS'],['arena','02 · ARÈNE'],['combat','03 · DUEL']].map(([id,label]) => `<span ${id === this.selectionStep ? 'aria-current="step"' : ''}>${label}</span>`).join('');
    this.el('new-duel').hidden = this.selectionStep !== 'combat' || running || Boolean(state.pending) || Boolean(this.unsavedResult);
    this.el('restart').hidden = !state.pending || running;
    this.el('abandon').hidden = !state.pending;
    this.el('abandon').disabled = Boolean(this.unsavedResult);
    for (const element of this.form.elements) if (element.tagName === 'SELECT') element.disabled = running || Boolean(state.pending);
    if (!state.pending) this.updateVariants();
    this.renderPreviews();
    this.el('pause').disabled = !running || this.loading;
    this.el('history').replaceChildren();
    for (const e of state.ledger.slice(-8).reverse()) {
      const row = document.createElement('p'); row.textContent = `${e.matchId} · ${e.playerId} / ${e.opponentId} · ${e.winner === 'abandoned' ? 'annulé' : { player: 'victoire', opponent: 'défaite', draw: 'égalité' }[e.winner]} · +${e.credits} crédits`;
      this.el('history').append(row);
    }
    if (!running && state.pending) this.message('Duel sauvegardé en attente. Recommencez depuis la première manche ou annulez sans gain.');
  }
}
