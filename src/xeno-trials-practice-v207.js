import { createXenoTrialsPracticeGoalsV212, XENO_TRIALS_NEW_DRILLS_V212 } from './xeno-trials-practice-v212.js';
import { createXenoTrialsPracticeGoalsV211, XENO_TRIALS_NEW_DRILLS_V211 } from './xeno-trials-practice-v211.js';
import { XENO_TRIALS_NEW_DRILLS_V210 } from './xeno-trials-practice-v210.js';
import { createXenoTrialsPracticeObserverV209, XENO_TRIALS_NEW_DRILLS_V209 } from './xeno-trials-practice-v209.js';
import { XENO_TRIALS_ACID_POOL_V152 } from './xeno-trials-acid-pools-v152.js';
import { XENO_TRIALS_PARRY_V208 } from './xeno-trials-defense-v208.js';
import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { getXenoTrialsStrikeBandV207 } from './xeno-trials-moveset-v207.js';
import { getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { XENO_TRIALS_NEW_DRILLS_V208, XENO_TRIALS_SANDBOX_ID_V208, getMirroredXenoTrialsInputV208,
  getXenoTrialsSandboxConfigV208, normalizeXenoTrialsSandboxV208 } from './xeno-trials-practice-v208.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_SUPER_METER_V148 } from './xeno-trials-supers-v148.js';

const lesson = (id, title, briefing, targets, options = {}) => Object.freeze({ id, title, briefing,
  targets: Object.freeze(targets), playerId: 'warrior', opponentId: 'runner', ...options });
export const XENO_TRIALS_PRACTICE_V207 = Object.freeze([
  lesson('distance', 'Calibrage de la portée', 'Frappez d’abord depuis la ligne de départ. Rapprochez-vous ensuite de la cible immobile.',
    ['Faire manquer une attaque légère', 'Toucher avec une attaque légère']),
  lesson('guard', 'Tenir la garde', 'Attendez que le contact s’approche. Maintenez Garde pendant ses frappes.',
    ['Bloquer une frappe', 'Bloquer une seconde frappe'], { pressure: 'light' }),
  lesson('evasion', 'Esquive verticale', 'Laissez le contact approcher. Sautez quand il arme sa frappe lourde.',
    ['Faire manquer une frappe lourde en sautant'], { pressure: 'heavy' }),
  lesson('rupture', 'Rupture de garde', 'Le contact tient sa garde avec une réserve réduite. Approchez et enchaînez deux frappes lourdes.',
    ['Provoquer une rupture de garde'], { opponentId: 'synth-containment', standingGuard: true }),
  lesson('escape', 'Sortie de saisie', 'Attendez la prise du Prowler. Dès la capture, maintenez Garde jusqu’à la libération.',
    ['Subir la saisie', 'Sortir en maintenant Garde'], { playerId: 'import-game-dd-wy-commando', opponentId: 'prowler', pressure: 'special' }),
  lesson('low', 'Attaque basse', 'Rapprochez-vous, maintenez Accroupir et déclenchez une frappe légère face au contact en garde.',
    ['Toucher sous la garde haute'], { opponentId: 'synth-containment', standingGuard: true }),
  lesson('anti-air', 'Interception aérienne', 'Laissez le contact s’approcher. Déclenchez Anti-air lorsqu’il saute près de vous.',
    ['Intercepter un contact en l’air'], { pressure: 'jump' }),
  lesson('advance', 'Attaque en avançant', 'Approchez de la cible. Orientez Esquive vers elle, puis déclenchez une frappe légère avant la fin du déplacement.',
    ['Engager une esquive vers l’avant', 'Toucher en sortie d’esquive']),
  lesson('super', 'Barrage de contrôle', 'Le Warden est prêté avec sa jauge pleine. Restez au sol, alignez la cible et déclenchez le super.',
    ['Dépenser la jauge du super', 'Toucher avec une salve'], { playerId: 'import-game-afe2-warden' })
]);

export const XENO_TRIALS_PRACTICE_DRILLS_V208 = Object.freeze([...XENO_TRIALS_PRACTICE_V207,
  ...XENO_TRIALS_NEW_DRILLS_V208.map(({ id, title, briefing, objectives, ...options }) => lesson(id, title, briefing, objectives, options))]);
export const XENO_TRIALS_PRACTICE_DRILLS_V209 = Object.freeze([...XENO_TRIALS_PRACTICE_DRILLS_V208,
  ...XENO_TRIALS_NEW_DRILLS_V209.map(({ id, title, briefing, objectives, ...options }) => lesson(id, title, briefing, objectives, options))]);
export const XENO_TRIALS_PRACTICE_DRILLS_V210 = Object.freeze([...XENO_TRIALS_PRACTICE_DRILLS_V209,
  ...XENO_TRIALS_NEW_DRILLS_V210.map(({ id, title, briefing, objectives, ...options }) => lesson(id, title, briefing, objectives, options))]);
export const XENO_TRIALS_PRACTICE_DRILLS_V211 = Object.freeze([...XENO_TRIALS_PRACTICE_DRILLS_V210,
  ...XENO_TRIALS_NEW_DRILLS_V211.map(({ id, title, briefing, objectives, ...options }) => lesson(id, title, briefing, objectives, options))]);
export const XENO_TRIALS_PRACTICE_DRILLS_V212 = Object.freeze([...XENO_TRIALS_PRACTICE_DRILLS_V211,
  ...XENO_TRIALS_NEW_DRILLS_V212.map(({ id, title, briefing, objectives, ...options }) => lesson(id, title, briefing, objectives, options))]);
const LESSONS = new Map(XENO_TRIALS_PRACTICE_DRILLS_V212.map(entry => [entry.id, entry]));
export const getXenoTrialsPracticeV207 = id => LESSONS.get(id) || null;
export const normalizeXenoTrialsPracticeV207 = value => XENO_TRIALS_PRACTICE_DRILLS_V212
  .filter(entry => Array.isArray(value) && value.includes(entry.id)).map(entry => entry.id);

export function getXenoTrialsPracticeConfigV207(id, sandboxSettings) {
  if (id === XENO_TRIALS_SANDBOX_ID_V208) return getXenoTrialsSandboxConfigV208(sandboxSettings);
  const entry = getXenoTrialsPracticeV207(id);
  if (!entry) return null;
  return { playerId: entry.playerId, opponentId: entry.opponentId, stageId: 'containment-deck',
    factionId: 'containment', roundsToWin: entry.roundsToWin || 1, roundSeconds: entry.roundSeconds || 60, matchId: `practice-${entry.id}`,
    ...(entry.difficulty ? { difficulty: entry.difficulty } : {}),
    ...(entry.hordeProtocolId ? { hordeV180: { protocolId: entry.hordeProtocolId } } : {}),
    ...(entry.operationIdV212 ? { operationV188: { id: entry.operationIdV212 } } : {}),
    rulesV119: { ...(entry.singleHit ? { initialHp: 1 } : {}), ...(entry.noSpecial ? { noSpecial: true } : {}) } };
}

// This coach drives the same opponent controls and observes contacts from the same fixed-step fight as a duel.
export function createXenoTrialsPracticeV207(id, match, sandboxSettings, recording) {
  const sandbox = id === XENO_TRIALS_SANDBOX_ID_V208 ? normalizeXenoTrialsSandboxV208(sandboxSettings) : null;
  const observer = sandbox ? createXenoTrialsPracticeObserverV209(recording) : null;
  const entry = sandbox ? lesson(id, 'Banc libre', 'Essayez vos techniques dans les conditions sélectionnées.', [], sandbox) : getXenoTrialsPracticeV207(id);
  if (!entry) return null;
  let [player, opponent] = match.fighters;
  if (player.id !== entry.playerId) return null;
  if (entry.hordeProtocolId ? match.hordeV180?.protocolId !== entry.hordeProtocolId : opponent?.id !== entry.opponentId) return null;
  const opponentDefinition = getXenoTrialsFighterV96(entry.opponentId);
  const opponentHeavy = getXenoTrialsAttackV147(opponentDefinition, 'heavy', XENO_TRIALS_ATTACKS_V96.heavy);
  const opponentSignature = id === 'interrupt' ? getXenoTrialsAttackV147(opponentDefinition, 'signature-2') : null;
  if (id === 'super' || id === 'riposte') player.superMeterV148 = XENO_TRIALS_SUPER_METER_V148.maximum;
  if (sandbox?.readySupers) for (const fighter of match.fighters) {
    if (fighter.superMeterV148 !== undefined) fighter.superMeterV148 = XENO_TRIALS_SUPER_METER_V148.maximum;
  }
  if (id === 'rupture') opponent.stamina = 34;

  let index = 0, state = 'active', lastEvent = match.serial, due = null;
  let playerAttack = null, incomingAttack = null, targetWasGuarding = false;
  let armedBeforeStep = null, interruption = null, parryOpeningUntil = 0;
  let acidContact = null, standingGuardBeforeStep = false;
  const hasAttack = (action, side) => action.type === 'attack' && action.side === side;
  const hasImpact = (action, side) => ['hit', 'block', 'guard-break'].includes(action.type) && action.side === side;
  const advance = () => { if (++index === entry.targets.length) state = 'complete'; };
  const progress = { index: () => index, advance, retry: () => { if (state === 'active') state = 'retry'; } };
  const goals = createXenoTrialsPracticeGoalsV212(id, match, progress) || createXenoTrialsPracticeGoalsV211(id, match, progress);

  function opponentInput(playerInput = {}) {
    [player, opponent] = match.fighters;
    goals?.beforeStep(playerInput);
    const programmed = goals?.opponentInput();
    if (programmed !== undefined) return programmed;
    if (entry.behavior === 'mirror') return getMirroredXenoTrialsInputV208(playerInput);
    if (entry.behavior === 'cpu') return null;
    if (sandbox) {
      if (sandbox.behavior === 'recording') return observer.playingInput(match.tick, match.round);
      if (sandbox.behavior === 'guard') return { guard: true };
      if (sandbox.behavior === 'jump') return { jump: opponent.y === 0 && !opponent.previousInput.jump };
      return {};
    }
    const pressure = id === 'rounds' && match.round === 2 ? 'light' : entry.pressure;
    if (id === 'low-defense') standingGuardBeforeStep = player.guard && !player.movesetV207?.low && playerInput.guard === true && playerInput.crouch !== true;
    if (id === 'interrupt') armedBeforeStep = opponent.attack?.kind === 'signature-2'
      ? { id: opponent.attack.id, age: opponent.attack.age } : null;
    if (entry.standingGuard) {
      targetWasGuarding = opponent.guard;
      return { guard: true };
    }
    if (!pressure || match.grappleV153 || id === 'acid-floor' && index >= 1) return {};
    const gap = getXenoTrialsBodyGapV105(player, opponent);
    const approach = entry.approachV212 ?? (pressure === 'special' ? 6 : 26);
    if (!entry.stationary && gap > approach) {
      due = null;
      return player.x < opponent.x ? { left: true } : { right: true };
    }
    due ??= match.tick + 72;
    if (pressure === 'jump' && opponent.y > 0) {
      due = match.tick + 96;
      return {};
    }
    if (match.tick < due || opponent.stun > 0 || opponent.attack || opponent.specialCooldown > 0) return {};
    return pressure === 'low' ? { crouch: true, light: true } : { [pressure]: true };
  }

  function observe(playerInput, activeTick = false) {
    if (state !== 'active') return;
    [player, opponent] = match.fighters;
    if (sandbox) {
      observer.observe(match.events);
      if (activeTick) observer.sample(playerInput);
      if (match.result) { observer.stopRecording(); state = 'finished'; }
      return;
    }
    if (goals) { goals.observe(playerInput, activeTick); return; }
    if (id === 'intro-rearm' && index === 0 && activeTick) { state = 'retry'; return; }
    if (id === 'landing-evasion' && index === 0 && player.y > .001 && player.vy > 0) advance();
    if (id === 'acid-floor' && index === 0 && match.acidPoolsV152?.some(pool => pool.owner === 'opponent')) advance();
    for (const action of match.events) {
      if (action.id <= lastEvent) continue;
      lastEvent = action.id;
      if (id === 'acid-floor' && index >= 1 && action.type === 'acid-contact-v152' && action.side === 'player') {
        const pool = match.acidPoolsV152?.find(item => item.id === action.poolId);
        if (pool) acidContact = { left: pool.left, right: pool.right, tick: action.tick };
        if (index === 1) advance();
      }
      if (action.type === 'round-start') {
        due = null;
        if (id === 'rounds' && index === 2 && action.round === 3 && player.hp === 1 && opponent.hp === 1) advance();
      }
      if (id === 'rounds' && action.type === 'round-end') {
        if (index === 0 && action.round === 1 && action.winner === 'player') advance();
        else if (index === 1 && action.round === 2 && action.winner === 'opponent') advance();
        else state = 'retry';
      }
      if (id === 'draw' && action.type === 'round-end') {
        if (index === 0 && action.winner === 'draw') advance();
        else if (action.winner !== 'draw') state = 'retry';
      }
      if (id === 'draw' && index === 1 && action.type === 'match-end' && action.winner === 'draw') advance();
      if (['parry', 'riposte'].includes(id) && action.type === 'parry-v208' && action.side === 'player' && action.attacker === 'opponent') {
        parryOpeningUntil = action.tick + XENO_TRIALS_PARRY_V208.openingTicks;
        if (index === 0) advance();
      }
      if (id === 'landing-evasion' && index === 1 && action.type === 'evade-v207' && action.side === 'player'
        && action.sourceV210 === 'landing' && player.y === 0) advance();
      if (id === 'advance' && index === 0 && action.type === 'evade-v207' && action.side === 'player'
        && action.direction === player.facing) advance();
      if (hasAttack(action, 'player')) {
        playerAttack = { kind: action.kind, contact: false };
        if (id === 'super' && action.kind === 'super' && player.superMeterV148 === 0 && index === 0) advance();
        if (id === 'riposte' && action.kind === 'super-riposte' && player.superMeterV148 === 0 && index === 1) advance();
      }
      if (hasAttack(action, 'opponent')) {
        due = action.tick + 188;
        incomingAttack = { kind: action.kind, contact: false, above: false, x: player.x };
        if (id === 'interrupt' && action.kind === 'signature-2' && opponentSignature) {
          incomingAttack.id = opponent.attack?.id;
          incomingAttack.closeTick = action.tick + Math.ceil((opponentSignature.startup + opponentSignature.active) * 120);
          if (index === 0) advance();
        }
      }
      if (hasImpact(action, 'opponent') && action.attacker === 'player' && playerAttack) {
        playerAttack.contact = true;
        if (['distance', 'legal-counter', 'intro-rearm'].includes(id) && index === 1 && playerAttack.kind === 'light' && action.type === 'hit') advance();
        if (id === 'rupture' && action.type === 'guard-break') advance();
        if (id === 'parry' && index === 1 && action.tick < parryOpeningUntil && action.type === 'hit') advance();
        if (id === 'interrupt' && action.type === 'hit' && incomingAttack?.id && armedBeforeStep?.id === incomingAttack.id
          && !opponent.attack && armedBeforeStep.age + 1 / 120 < opponentSignature.startup) interruption = incomingAttack;
        if (id === 'low' && targetWasGuarding && playerAttack.kind === 'low' && action.type === 'hit') advance();
        if (id === 'anti-air' && playerAttack.kind === 'anti-air' && action.type === 'hit') advance();
        if (id === 'advance' && index === 1 && playerAttack.kind === 'advance' && action.type === 'hit') advance();
        if (id === 'super' && index === 1 && playerAttack.kind === 'super' && action.type === 'hit') advance();
        if (id === 'riposte' && index === 2 && playerAttack.kind === 'super-riposte' && action.type === 'hit') advance();
      }
      if (hasImpact(action, 'player') && action.attacker === 'opponent') {
        if (incomingAttack) incomingAttack.contact = true;
        if ((id === 'guard' || id === 'legal-counter' && index === 0) && action.type === 'block') advance();
        if (id === 'low-defense' && incomingAttack?.kind === 'low') {
          if (index === 0 && standingGuardBeforeStep && action.type === 'hit') advance();
          else if (index === 1 && player.guard && player.movesetV207?.low && action.type === 'block') advance();
        }
      }
      if (id === 'escape' && index === 0 && action.type === 'grapple-start-v153' && action.side === 'player') advance();
      if (id === 'escape' && index === 1 && action.type === 'grapple-end-v153' && action.reason === 'escaped') advance();
      if (state !== 'active') return;
    }
    if (id === 'distance' && index === 0 && playerAttack?.kind === 'light' && !playerAttack.contact && !player.attack) {
      playerAttack = null;
      advance();
    }
    if (id === 'evasion' && incomingAttack) {
      // The native heavy must reach its effective window while the player is above the contact.
      const active = opponent.attack?.kind === 'heavy' && opponent.attack.age >= opponentHeavy.startup
        && opponent.attack.age < opponentHeavy.startup + opponentHeavy.active;
      if (active && Math.abs(player.x - incomingAttack.x) <= 12) {
        const strike = getXenoTrialsStrikeBandV207(getXenoTrialsBodyBoundsV105(opponent), opponentHeavy);
        if (player.y > strike.top) incomingAttack.above = true;
      }
      if (!opponent.attack) {
        if (incomingAttack.above && !incomingAttack.contact) advance();
        incomingAttack = null;
      }
    }
    if (acidContact && index === 2 && match.tick >= acidContact.tick + XENO_TRIALS_ACID_POOL_V152.intervalTicks) {
      const body = getXenoTrialsBodyBoundsV105(player);
      const exposed = match.acidPoolsV152?.some(pool => pool.owner === 'opponent' && body.right > pool.left && body.left < pool.right);
      if (!exposed && (body.right <= acidContact.left || body.left >= acidContact.right)) advance();
    }
    if (interruption && !interruption.contact && match.tick >= interruption.closeTick) advance();
    if ((id === 'super' && index === 1 || id === 'riposte' && index === 2) && !player.attack
      && !match.projectiles.some(projectile => projectile.owner === 'player')) state = 'retry';
    if (match.phase === 'match-over' && state === 'active') state = 'retry';
  }

  function view() {
    return { id, title: entry.title, briefing: entry.briefing, objectives: entry.targets, index, state,
      ...(sandbox ? { sandbox: true, result: match.result?.winner || null, telemetryV209: observer.view() } : {}),
      ...(goals?.terminalReady?.() ? { awaitingOutroV211: true } : {}),
      cue: goals ? goals.cue() : id === 'low-defense' && opponent.attack?.kind === 'low' ? 'FRAPPE BASSE EN COURS'
        : id === 'landing-evasion' && player.y > .001 && player.vy < 0 ? 'DESCENTE EN COURS'
        : id === 'interrupt' && opponent.attack?.kind === 'signature-2' ? 'PERCUSSION EN COURS'
        : entry.pressure === 'heavy' && opponent.attack?.kind === 'heavy' ? 'FRAPPE LOURDE EN COURS'
        : id === 'anti-air' && opponent.y > 0 ? 'CONTACT EN L’AIR' : '' };
  }
  return { get active() { return state === 'active'; }, opponentInput, observe, view,
    showIntroV210: entry.showIntroV210 === true,
    canCloseOutroV211: () => goals?.terminalReady?.() === true,
    closedOutroV211: () => goals?.closeOutro?.() === true,
    skippedIntroV210() { if (entry.showIntroV210 && index === 0 && match.tick === 0) advance(); },
    recordingV209: observer ? { start: observer.startRecording, stop: observer.stopRecording,
      pending: observer.pendingRecording, acknowledge: observer.acknowledgeRecording } : null };

}
