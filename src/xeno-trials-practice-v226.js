import { XENO_TRIALS_ACID_POOL_V152 } from './xeno-trials-acid-pools-v152.js';
import { getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { XENO_TRIALS_DECOMPRESSION_OPERATION_V224, XENO_TRIALS_OPERATION_LIMITS_V188,
  getXenoTrialsCollectorViewV224 } from './xeno-trials-operations-v188.js';

const collector = XENO_TRIALS_DECOMPRESSION_OPERATION_V224;
const crossupCues = ['APPROCHEZ · RAPIDE FACE À LA GARDE', 'SAUTEZ PAR-DESSUS LE CONTACT', 'ATTERRISSEZ DERRIÈRE LUI · RAPIDE'];
const acidCues = ['LANCEZ LA GRAPPE ACIDE · SPÉCIAL', 'RECULEZ POUR ATTIRER LE RUNNER', 'LAISSEZ LE RUNNER GARDER DANS L’ACIDE'];
const collectorCues = {
  choose: 'CHOISISSEZ UN CONDUIT · MAINTENEZ INTERACTION',
  left: 'PRESSION REPORTÉE À L’OUEST', right: 'PRESSION REPORTÉE À L’EST',
  seal: 'SCELLEZ LE CONDUIT ENCORE OUVERT', waiting: 'ATTENDEZ LA DÉCOMPRESSION DU SAS',
  exit: 'SAS OUVERT · MAINTENEZ INTERACTION',
};

function drill(id, title, briefing, objectives, options) {
  return Object.freeze({ id, title, briefing, objectives: Object.freeze(objectives), ...options });
}

export const XENO_TRIALS_NEW_DRILLS_V226 = Object.freeze([
  drill('guard-crossup', 'Passer derrière une garde',
    'Avec le Runner, approchez le synthétique en garde et frappez avec Rapide. Sautez par-dessus lui, atterrissez derrière lui puis frappez de nouveau avec Rapide.',
    ['Faire bloquer une frappe rapide de face', 'Franchir la garde en sautant', 'Toucher la cible au sol par l’arrière'],
    { playerId: 'runner', opponentId: 'synth-guard', noSpecial: true, roundSeconds: 25 }),
  drill('acid-lane', 'Attirer un contact dans une flaque',
    'Lancez Spécial avec la Reine. Quand l’acide s’étale au sol, reculez pour attirer le Runner dans les flaques. Laissez-le garder pendant deux pulsations.',
    ['Former une flaque avec la grappe acide', 'Reculer pour attirer le contact dans l’acide', 'Observer deux pulsations malgré sa garde'],
    { playerId: XENO_TRIALS_ACID_POOL_V152.fighterId, roundSeconds: 25 }),
  drill('collector-vent', 'Lire la pression du collecteur',
    'Scellez le conduit de votre choix avec Interaction. Repérez le côté où la pression se reporte, scellez le second conduit puis attendez l’ouverture du sas central pour sortir.',
    ['Sceller l’un des deux conduits', 'Repérer la perte de confinement du côté encore ouvert', 'Sceller le conduit restant',
      'Valider le sas central après son ouverture'],
    { operationIdV212: collector.id, hordeProtocolId: collector.hordeProtocolId }),
]);

function createGuardCrossup(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const fail = () => retry('FAITES BLOQUER VOTRE FRAPPE, PUIS PASSEZ DERRIÈRE');
  const side = () => Math.sign(player.x - opponent.x);
  const startingSide = side();
  let before = null, light = null;

  function beforeStep() {
    before = { guarding: opponent.guard, facing: opponent.facing, side: side(), grounded: player.y === 0 };
  }

  function observe(events) {
    if (events.some(event => event.type === 'attack' && event.kind === 'light' && event.side === 'player'
      && event.id === player.attack?.id + 1)) light = player.attack.id;
    const strike = events.find(event => ['hit', 'block', 'guard-break'].includes(event.type)
      && event.side === 'opponent' && event.attacker === 'player');
    if (strike) {
      const ready = before?.guarding && before.grounded && before.facing === startingSide && player.attack?.id === light;
      if (index() === 0 && ready && strike.type === 'block' && before.side === startingSide) advance();
      else if (index() === 2 && ready && strike.type === 'hit' && before.side === -startingSide
        && player.y === 0 && player.attack.facing === startingSide) advance();
      else if (strike.type !== 'block') { fail(); return; }
    }
    if (player.y > 0 && side() === -startingSide && opponent.guard && opponent.facing === startingSide) {
      if (index() === 0) fail();
      if (index() === 1) advance();
    }
    if (match.result) fail();
  }

  return { beforeStep, observe, opponentInput: () => ({ guard: true }), cue: () => crossupCues[index()] || '' };
}

function createAcidLane(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const fail = () => retry('RECULEZ APRÈS LA FORMATION DE LA FLAQUE');
  const ownPools = () => (match.acidPoolsV152 || []).filter(pool => pool.owner === 'player');
  const armedPools = () => ownPools().filter(pool => match.tick >= pool.armedTick);
  let cast = null, launched = false, retreatFrom = null;
  let lureStart = null, firstPulse = null;
  const inFlight = () => match.projectiles.some(shot => shot.owner === 'player' && shot.groupIdV147 === cast);
  const hasDrops = () => match.acidDropsV152?.some(drop => drop.owner === 'player');

  function opponentInput() {
    if (index() === 0) return launched ? { right: true } : {};
    const body = getXenoTrialsBodyBoundsV105(opponent);
    if (lureStart === null) {
      if (inFlight() || hasDrops() || ownPools().some(pool => body.left < pool.right + 36)) return { right: true };
      if (player.x > retreatFrom - 36) return {};
      lureStart = opponent.x;
    }
    if (firstPulse || armedPools().some(pool => body.right > pool.left && body.left < pool.right)) return { guard: true };
    return { left: true };
  }

  function observe(events) {
    const attack = events.find(event => event.type === 'attack' && event.side === 'player');
    if (attack) {
      if (cast !== null || attack.signatureIdV147 !== XENO_TRIALS_ACID_POOL_V152.signatureId) { fail(); return; }
      cast = attack.id - 1;
    }
    if (inFlight()) launched = true;
    if (index() === 0 && launched && ownPools().length) {
      retreatFrom = player.x;
      advance();
    }
    for (const event of events) {
      if (event.type !== 'acid-contact-v152' || event.side !== 'opponent' || event.attacker !== 'player' || event.damage <= 0) continue;
      if (lureStart === null || opponent.x > lureStart - 32 || !armedPools().some(pool => pool.id === event.poolId)) continue;
      if (index() === 1) {
        if (!opponent.guard) continue;
        firstPulse = event;
        advance();
      } else if (index() === 2 && opponent.guard && event.poolId === firstPulse.poolId
        && event.tick >= firstPulse.tick + XENO_TRIALS_ACID_POOL_V152.intervalTicks) advance();
    }
    if (match.result || (cast !== null && (launched || player.attack?.id !== cast) && !inFlight() && !hasDrops() && !ownPools().length)) fail();
  }

  return { observe, opponentInput, cue: () => acidCues[index()] || '' };
}

function createCollectorVent(match, { index, advance, retry }) {
  const limits = XENO_TRIALS_OPERATION_LIMITS_V188;
  const state = match.operationV188;
  const fail = () => retry('SCELLEZ LE CONDUIT OUVERT AVANT LA PERTE DE CONFINEMENT');
  let integrity = state.integrity, first = null;

  function observe(events) {
    const view = getXenoTrialsCollectorViewV224(match);
    const loss = integrity - state.integrity;
    integrity = state.integrity;
    const receipt = events.find(event => event.type === 'operation-objective-v188' && event.operationId === collector.id);
    if (index() === 0 && receipt?.index < 2 && view.phase === 'diverted' && view.sealed[receipt.index]) {
      first = receipt;
      advance();
    }
    if (index() === 1 && view.phase === 'diverted' && match.tick > first.tick
      && state.elapsedTicks % limits.purgePressureTicks === 0 && loss === view.pressureLoss) advance();
    if (index() === 2 && receipt?.index === 1 - first.index && view.phase === 'opening') advance();
    if (index() === 3 && receipt?.index === 2 && view.phase === 'open'
      && match.result?.winner === 'player' && match.result.reason === 'operation-complete') advance();
    else if (match.result) fail();
  }

  function cue() {
    const view = getXenoTrialsCollectorViewV224(match);
    return [collectorCues.choose, collectorCues[view.openSide], collectorCues.seal,
      view.phase === 'open' ? collectorCues.exit : collectorCues.waiting][index()] || '';
  }

  return { observe, cue, opponentInput: () => null };
}

const exercises = new Map([
  ['guard-crossup', createGuardCrossup], ['acid-lane', createAcidLane], ['collector-vent', createCollectorVent],
]);

export function createXenoTrialsPracticeGoalsV226(id, match, progress) {
  const create = exercises.get(id);
  if (!create) return null;
  const exercise = create(match, progress);
  let lastEvent = match.serial;
  function observe(_input, activeTick) {
    if (!activeTick) return;
    const events = match.events.filter(event => event.id > lastEvent);
    lastEvent = match.serial;
    exercise.observe(events);
  }
  return { ...exercise, observe };
}
