import { XENO_TRIALS_FIGHTERS_V96 as FIGHTERS, XENO_TRIALS_STAGES_V96 as STAGES } from './xeno-trials-data-v96.js';

// Exhibition preparation owns transient choices only. It neither borrows route
// fighters nor opens a progression ticket; playback and recording stay with UI.
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const identityValue = (id, variant) => `${id}::${variant ?? ''}`;
const defaults = Object.freeze({ mode: 'duel', controls: 'cpu', assists: false,
  stageId: 'containment-deck', difficulty: 'normal', roundsToWin: 2, roundSeconds: 99, seed: 1969, record: true });
const fields = Object.freeze(['mode', 'controls', 'assists', 'player0', 'player1', 'opponent0', 'opponent1',
  'stageId', 'difficulty', 'roundsToWin', 'roundSeconds', 'seed', 'record']);
const selected = value => value ? ' selected' : '';
const checked = value => value ? ' checked' : '';
const integer = (value, minimum, maximum) => {
  if (typeof value === 'string' && !/^\d+$/.test(value)) return null;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= minimum && number <= maximum ? number : null;
};
const strictBoolean = value => value === undefined ? false : typeof value === 'boolean' ? value : null;

/** Every variant of an owned fighter is admitted exactly as in the roster.
 * Unknown IDs, duplicated ownership rows and borrowed campaign identities never
 * add another option. A fighter without variants has the explicit null variant.
 */
export function getXenoTrialsExhibitionCatalogV232(state) {
  const owned = new Set(Array.isArray(state?.unlocked) ? state.unlocked : []);
  return FIGHTERS.filter(fighter => owned.has(fighter.id)).flatMap(fighter =>
    (fighter.variants.length ? fighter.variants : [null]).map(variant => ({
      value: identityValue(fighter.id, variant), id: fighter.id, variant,
      label: `${fighter.label}${variant ? ` · ${variant}` : ''}`,
    })));
}

/** Accept either plain transient choices or a form/container exposing
 * querySelector(). Checkboxes are read through checked, never through value.
 * No global DOM/FormData access is needed, so fixtures can inject a form reader.
 */
export function readXenoTrialsExhibitionSelectionV232(selection = {}) {
  if (typeof selection?.querySelector !== 'function') return Object.fromEntries(fields
    .filter(field => selection?.[field] !== undefined).map(field => [field, selection[field]]));
  return Object.fromEntries(fields.flatMap(field => {
    const element = selection.querySelector(`[data-xt-exhibition="${field}"]`);
    return element ? [[field, ['assists', 'record'].includes(field) ? element.checked === true : element.value]] : [];
  }));
}

/** Strict launch boundary. Invalid submitted identities/settings fail closed;
 * display defaults belong to render(), never silently replace a submitted team.
 * All engine settings are canonical and recording-compatible, with no activity,
 * reward, checkpoint or campaign fields copied from caller-owned data.
 */
export function buildExhibitionConfigV232(selection, state) {
  const value = readXenoTrialsExhibitionSelectionV232(selection), catalog = getXenoTrialsExhibitionCatalogV232(state);
  if (!['duel', 'tag'].includes(value.mode) || !['cpu', 'local'].includes(value.controls)) return null;
  const assists = strictBoolean(value.assists);
  if (assists === null || value.mode === 'duel' && assists) return null;
  const count = value.mode === 'tag' ? 2 : 1, teams = {};
  for (const side of ['player', 'opponent']) {
    const team = [];
    for (let index = 0; index < count; index++) {
      const member = catalog.find(entry => entry.value === value[`${side}${index}`]);
      if (!member || team.some(entry => entry.id === member.id)) return null;
      team.push({ id: member.id, variant: member.variant });
    }
    teams[`${side}Team`] = team;
  }
  const roundsToWin = integer(value.roundsToWin, 1, 3), roundSeconds = integer(value.roundSeconds, 15, 180);
  const seed = integer(value.seed, 1, 0xffffffff);
  if (!roundsToWin || !roundSeconds || !seed || !STAGES.some(stage => stage.id === value.stageId)
    || !['easy', 'normal', 'hard'].includes(value.difficulty)) return null;
  const player = teams.playerTeam[0], opponent = teams.opponentTeam[0];
  return { playerId: player.id, playerVariant: player.variant, opponentId: opponent.id, opponentVariant: opponent.variant,
    factionId: 'hive', stageId: value.stageId, difficulty: value.difficulty, roundsToWin, roundSeconds, seed,
    rulesV119: { noSpecial: false, specialLockSeconds: 0, initialHp: null, goal: 'eliminate', timeLimitSeconds: null },
    introSeconds: 0, holdRoundTransition: true, matchId: `exhibition-v232-${seed}`,
    exhibitionV232: { mode: value.mode, controls: value.controls, assists: value.mode === 'tag' && assists, ...teams } };
}

function displaySelection(state, supplied) {
  const value = { ...defaults, ...readXenoTrialsExhibitionSelectionV232(supplied) };
  const catalog = getXenoTrialsExhibitionCatalogV232(state), first = catalog[0];
  const second = catalog.find(entry => entry.id !== first?.id) || first;
  const fallback = { player0: first?.value || '', player1: second?.value || '',
    opponent0: second?.value || '', opponent1: first?.value || '' };
  for (const field of ['player0', 'player1', 'opponent0', 'opponent1'])
    if (!catalog.some(entry => entry.value === value[field])) value[field] = fallback[field];
  if (!['duel', 'tag'].includes(value.mode)) value.mode = defaults.mode;
  if (!['cpu', 'local'].includes(value.controls)) value.controls = defaults.controls;
  if (!STAGES.some(stage => stage.id === value.stageId)) value.stageId = defaults.stageId;
  if (!['easy', 'normal', 'hard'].includes(value.difficulty)) value.difficulty = defaults.difficulty;
  for (const [field, minimum, maximum] of [['roundsToWin', 1, 3], ['roundSeconds', 15, 180], ['seed', 1, 0xffffffff]])
    value[field] = integer(value[field], minimum, maximum) ?? defaults[field];
  value.assists = value.mode === 'tag' && value.assists === true;
  value.record = value.record !== false;
  return { value, catalog };
}

export function renderXenoTrialsExhibitionFormV232(state, selection = {}) {
  const { value, catalog } = displaySelection(state, selection), tag = value.mode === 'tag';
  const hasReserve = new Set(catalog.map(entry => entry.id)).size >= 2;
  const slot = (side, index, label) => {
    const field = `${side}${index}`;
    return `<label${index ? ' data-xt-exhibition-reserve' : ''}>${label}<select name="${field}" data-xt-exhibition="${field}"${index && !tag ? ' disabled' : ''}>${catalog.map(entry =>
      `<option value="${escapeHtml(entry.value)}"${selected(value[field] === entry.value)}>${escapeHtml(entry.label)}</option>`).join('')}</select></label>`;
  };
  return `<form class="xt-exhibition-form-v232" data-xt-exhibition-form>
    <header class="xt-program-heading"><div><p class="eyebrow">MIRE / ÉVALUATION LIBRE</p><h3>PRÉPARER L’EXHIBITION</h3></div><span>CONTACT HORS CLASSEMENT</span></header>
    <p>Choisissez les spécimens de votre registre. Cette évaluation ne délivre ni prime, ni progression de campagne.</p>
    <div class="xt-exhibition-settings-v232"><label>Format<select name="mode" data-xt-exhibition="mode"><option value="duel"${selected(!tag)}>Duel · 1 contre 1</option><option value="tag"${selected(tag)}${!hasReserve ? ' disabled' : ''}>Relais · 2 contre 2</option></select></label>
    <label>Adversaire<select name="controls" data-xt-exhibition="controls"><option value="cpu"${selected(value.controls === 'cpu')}>Simulation MIRE</option><option value="local"${selected(value.controls === 'local')}>Deux opérateurs · même poste</option></select></label>
    <label class="xt-exhibition-check-v232"><input type="checkbox" name="assists" data-xt-exhibition="assists"${checked(value.assists)}${!tag ? ' disabled' : ''}>Interventions du partenaire</label></div>
    <div class="xt-exhibition-teams-v232"><fieldset><legend>OPÉRATEUR 1</legend>${slot('player', 0, 'Spécimen engagé')}${slot('player', 1, 'Spécimen de relève')}</fieldset>
    <fieldset><legend>${value.controls === 'local' ? 'OPÉRATEUR 2' : 'ADVERSAIRE MIRE'}</legend>${slot('opponent', 0, 'Spécimen engagé')}${slot('opponent', 1, 'Spécimen de relève')}</fieldset></div>
    <div class="xt-exhibition-settings-v232"><label>Environnement<select name="stageId" data-xt-exhibition="stageId">${STAGES.map(stage => `<option value="${escapeHtml(stage.id)}"${selected(value.stageId === stage.id)}>${escapeHtml(stage.label)}</option>`).join('')}</select></label>
    <label>Niveau de simulation<select name="difficulty" data-xt-exhibition="difficulty">${[['easy', 'Initiation'], ['normal', 'Standard'], ['hard', 'Avancé']].map(([id, label]) => `<option value="${id}"${selected(value.difficulty === id)}>${label}</option>`).join('')}</select></label>
    <label>Manches gagnantes<select name="roundsToWin" data-xt-exhibition="roundsToWin">${[1, 2, 3].map(rounds => `<option value="${rounds}"${selected(value.roundsToWin === rounds)}>${rounds}</option>`).join('')}</select></label>
    <label>Durée d’une manche · secondes<input type="number" name="roundSeconds" data-xt-exhibition="roundSeconds" min="15" max="180" step="1" value="${value.roundSeconds}" required></label>
    <label>Référence de simulation<input type="number" name="seed" data-xt-exhibition="seed" min="1" max="4294967295" step="1" value="${value.seed}" required></label></div>
    <label class="xt-exhibition-check-v232"><input type="checkbox" name="record" data-xt-exhibition="record"${checked(value.record)}>Conserver l’enregistrement du combat</label>
    ${value.controls === 'local' ? '<p class="xt-notice">Opérateur 1 · Q / D, Z / S, J / K / L. Opérateur 2 · flèches et pavé numérique. Manettes · première pour l’opérateur 1, seconde pour l’opérateur 2.</p>' : ''}
    ${tag ? '<p>Chaque équipe engage deux identités distinctes. Relais · R / + numérique. Intervention · G / − numérique.</p>' : ''}
    ${catalog.length ? '' : '<p role="status">Aucun spécimen acquis n’est disponible pour cette évaluation.</p>'}
    <div class="xt-actions"><button type="submit" class="button primary" data-xt="exhibition-start"${!catalog.length || tag && !hasReserve ? ' disabled' : ''}>ENGAGER L’ÉVALUATION</button><button type="button" class="button" data-xt="exhibition-back">RETOUR AUX PROGRAMMES</button></div>
    <p role="status" aria-live="polite" data-xt="exhibition-status"></p>
  </form>`;
}

export function renderReplayArchiveV232(records) {
  const rows = Array.isArray(records) ? records.filter(record => /^xtr232-[0-9a-f]{24}$/.test(record?.id || '')).slice(0, 4) : [];
  const label = (id, variant) => {
    const fighter = FIGHTERS.find(entry => entry.id === id);
    return fighter ? `${fighter.label}${fighter.variants.includes(variant) ? ` · ${variant}` : ''}` : 'Spécimen non identifié';
  };
  return `<section class="xt-replay-archive-v232" data-xt-replay-archive><header class="xt-program-heading"><div><p class="eyebrow">MIRE / MÉMOIRE D’OBSERVATION</p><h3>ENREGISTREMENTS DE COMBAT</h3></div><span>${rows.length} / 4</span></header>
    ${rows.length ? `<ul>${rows.map(record => {
      const config = record.config || {}, stage = STAGES.find(entry => entry.id === config.stageId);
      const ticks = Number.isSafeInteger(record.ticks) && record.ticks >= 0 ? record.ticks : 0;
      const seconds = Math.floor(ticks / 120), duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      const format = config.exhibitionV232?.mode === 'tag' ? 'Relais' : 'Duel';
      return `<li data-xt-replay-id="${escapeHtml(record.id)}"><div><strong>${escapeHtml(label(config.playerId, config.playerVariant))} / ${escapeHtml(label(config.opponentId, config.opponentVariant))}</strong><p>${format} · ${escapeHtml(stage?.label || 'Environnement non identifié')} · ${duration} · ${record.complete === true ? 'Combat terminé' : 'Observation interrompue'}</p></div><div class="xt-actions"><button type="button" class="button" data-xt-replay-play="${escapeHtml(record.id)}">REVOIR</button><button type="button" class="button danger-outline" data-xt-replay-delete="${escapeHtml(record.id)}">EFFACER</button></div></li>`;
    }).join('')}</ul>` : '<p>Aucun combat conservé. Activez l’enregistrement avant d’engager une évaluation libre.</p>'}
    <p class="xt-notice">Lecture d’archive uniquement. Les enregistrements ne délivrent aucune récompense.</p></section>`;
}
