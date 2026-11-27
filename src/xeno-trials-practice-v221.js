import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsSignatureV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsOperationViewV188, XENO_TRIALS_RELIEF_OPERATION_V220 } from './xeno-trials-operations-v188.js';

const brute = 'drive-v123-fte-pathogen-brute-profile-v13';
const relief = XENO_TRIALS_RELIEF_OPERATION_V220;
const [westPost] = relief.objectives;
const terminalCue = 'CHOISISSEZ UNE ACTION OU PASSEZ';
const waveWindupCue = 'RECULEZ OU ATTENDEZ LE DÉPART DE L’ONDE';
const waveFlightCue = 'ONDE AU SOL';
const preparePostCue = 'PRÉPAREZ LE POSTE OUEST';
const clearWaveCue = 'DÉGAGEZ LE POSTE OUEST';
const reliefCue = 'RELÈVE OUVERTE · MAINTENEZ INTERACTION';

function drill(id, title, briefing, objectives, options) {
  return Object.freeze({ id, title, briefing, objectives: Object.freeze(objectives), ...options });
}

export const XENO_TRIALS_NEW_DRILLS_V221 = Object.freeze([
  drill('terminal-choice', 'Choisir après le verdict',
    'Approchez du Runner et mettez-le KO au sol avec Rapide. Choisissez une action terminale, passez la séquence ou laissez l’offre expirer.',
    ['Obtenir un KO avec les deux combattants au sol', 'Clore le choix terminal après le verdict'],
    { singleHit: true }),
  drill('ground-wave-counter', 'Échapper à une onde rasante',
    'Laissez le Brute Pathogen armer son choc au sol. Reculez au-delà de la portée de l’onde ou sautez par-dessus dès son départ.',
    ['Repérer la préparation du choc au sol', 'Repérer le départ de l’onde vers vous', 'Éviter l’onde en sautant ou en sortant de sa portée'],
    { playerId: 'runner', opponentId: brute, pressure: 'special', approachV212: 166 }),
  drill('relief-window', 'Verrouiller un poste pendant la relève',
    'Maintenez Interaction au poste ouest pendant le combat pour vérifier son verrouillage. Neutralisez les éclaireurs près du poste puis chargez-le pendant la première relève.',
    ['Essayer de charger le poste ouest pendant le verrouillage', 'Dégager le poste jusqu’à la pause entre les vagues', 'Verrouiller le poste avant l’arrivée de la relève'],
    { operationIdV212: relief.id, hordeProtocolId: relief.hordeProtocolId }),
]);

function createTerminalChoice(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;

  function observe() {
    if (!match.result || index() !== 0) return;
    if (match.result.winner === 'player' && match.result.reason === 'ko' && player.y === 0 && opponent.y === 0) advance();
    else retry();
  }

  const terminalReady = () => index() === 1 && match.result?.winner === 'player';
  function terminalFinished(sequence, { explicitSkip = false, reducedMotion = false } = {}) {
    if (!terminalReady() || !(sequence?.phase === 'complete' || sequence?.phase === 'declined'
      || sequence === null && explicitSkip && reducedMotion)) return false;
    advance();
    return true;
  }

  return { observe, terminalReady, terminalFinished, cue: () => terminalReady() ? terminalCue : '' };
}

function createGroundWaveCounter(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const impact = getXenoTrialsSignatureV147(getXenoTrialsFighterV96(opponent.id)).spec;
  let launch = null, flight = null, overWave = false;

  function observe(events) {
    if (events.some(event => (event.attacker === 'opponent' && ['block', 'hit', 'guard-break'].includes(event.type))
      || event.attacker === 'player' && event.type === 'hit')) { retry(); return; }
    if (index() === 0 && opponent.attack?.kind === 'special' && events.some(event => event.type === 'attack'
      && event.side === 'opponent' && event.id === opponent.attack.id + 1)) {
      const direction = player.x < opponent.x ? -1 : 1;
      const gap = getXenoTrialsBodyGapV105(opponent, player, direction);
      if (gap > impact.reach || gap <= 0) { retry(); return; }
      launch = { attackId: opponent.attack.id, direction };
      advance();
    }
    if (index() === 1) {
      const wave = match.projectiles.find(shot => shot.owner === 'opponent' && shot.style === 'ground-wave'
        && shot.groupIdV147 === launch.attackId && shot.direction === launch.direction);
      if (wave) {
        flight = { id: wave.id, endX: wave.x + wave.vx * wave.life, radius: wave.radiusV147 };
        advance();
      } else if (opponent.attack?.id !== launch.attackId) retry();
    }
    if (index() !== 2) return;
    const body = getXenoTrialsBodyBoundsV105(player);
    const wave = match.projectiles.find(shot => shot.id === flight.id);
    if (wave) {
      if (wave.x >= body.left - flight.radius && wave.x <= body.right + flight.radius
        && body.bottom > wave.y + flight.radius) overWave = true;
      const cleared = launch.direction < 0 ? wave.x < body.left - flight.radius : wave.x > body.right + flight.radius;
      if (overWave && cleared) advance();
    } else {
      const outside = launch.direction < 0 ? body.right < flight.endX - flight.radius : body.left > flight.endX + flight.radius;
      if (outside && body.bottom === 0) advance();
      else retry();
    }
  }

  function cue() {
    if (index() === 1) return waveWindupCue;
    if (index() === 2) return waveFlightCue;
    return '';
  }

  return { observe, cue, opponentInput: () => index() === 0 ? undefined : {} };
}

function createReliefWindow(match, { index, advance, retry }) {
  const [player] = match.fighters;

  function observe(events, input) {
    const view = getXenoTrialsOperationViewV188(match);
    const horde = match.hordeV180;
    const body = getXenoTrialsBodyBoundsV105(player);
    const atPost = body.bottom === 0 && body.left <= westPost.x + westPost.radius && body.right >= westPost.x - westPost.radius;
    if (index() === 0 && atPost && input?.interact && view.reliefV220.phase === 'combat' && view.target.progress === 0) advance();
    if (index() === 1 && horde.wave === 1 && horde.wavesCleared === 1 && view.reliefV220.phase === 'relief') advance();
    if (index() === 2 && horde.wave === 1 && view.reliefV220.phase === 'relief'
      && events.some(event => event.type === 'operation-objective-v188' && event.operationId === relief.id && event.objectiveId === westPost.id)) advance();
    if (horde.wave > 1) retry();
  }

  function cue() {
    if (index() === 0) return preparePostCue;
    if (index() === 1) return clearWaveCue;
    if (index() === 2) return reliefCue;
    return '';
  }

  return { observe, cue, opponentInput: () => null };
}

const exercises = new Map([
  ['terminal-choice', createTerminalChoice], ['ground-wave-counter', createGroundWaveCounter], ['relief-window', createReliefWindow],
]);

export function createXenoTrialsPracticeGoalsV221(id, match, progress) {
  const create = exercises.get(id);
  if (!create) return null;
  const exercise = create(match, progress);
  let lastEvent = match.serial;
  function observe(input, activeTick) {
    if (!activeTick) return;
    if (match.phase === 'match-over' && !exercise.terminalReady) { progress.retry(); return; }
    const events = match.events.filter(event => event.id > lastEvent);
    lastEvent = match.serial;
    exercise.observe(events, input);
  }
  return { ...exercise, observe };
}
