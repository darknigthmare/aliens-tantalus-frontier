import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { canStartXenoTrialsGroundBreakV213, XENO_TRIALS_GROUND_BREAK_FAIL_V213, XENO_TRIALS_GROUND_BREAK_START_V213 } from './xeno-trials-grapple-v213.js';
import { getXenoTrialsHurtBoundsV207, getXenoTrialsStrikeBandV207 } from './xeno-trials-moveset-v207.js';
import { getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';

const commando = 'import-game-dd-wy-commando';
const grabId = 'warrior::grab';
const drill = (id, title, briefing, objectives, options) => Object.freeze({
  id, title, briefing, objectives: Object.freeze(objectives), ...options,
});

export const XENO_TRIALS_NEW_DRILLS_V213 = Object.freeze([
  drill('grab-counter', 'Contrer la prise au sol',
    'Laissez le Warrior vous saisir. Maintenez Garde et appuyez sur Rapide au signal, puis gardez Garde enfoncée.',
    ['Subir la prise au sol', 'Déclencher le contre avec Garde et Rapide', 'Maintenir Garde jusqu’au dégagement'],
    { playerId: commando, opponentId: 'warrior' }),
  drill('low-retreat', 'Reculer sous une frappe',
    'Attendez que le Runner arme sa frappe lourde. Maintenez Bas et appuyez sur Esquive sans direction, puis laissez passer la frappe.',
    ['Laisser le contact armer une frappe à portée', 'Déclencher le recul bas avant la frappe', 'Éviter la frappe lourde'],
    { playerId: 'warrior', opponentId: 'runner', pressure: 'heavy', approachV212: 70 }),
  drill('guarded-retreat', 'Reculer en gardant',
    'Attendez la frappe lourde du Warrior. Maintenez Garde et reculez avec la direction opposée au contact.',
    ['Laisser le contact armer une frappe à portée', 'Reculer en tenant la garde', 'Bloquer la frappe pendant le recul'],
    { playerId: 'runner', opponentId: 'warrior', pressure: 'heavy', approachV212: 10 }),
]);

function createGrabCounter(match, player, opponent, { index, advance, retry }) {
  function opponentInput() {
    if (match.grappleV153 || index() > 0 || opponent.stun > 0 || opponent.attack) return {};
    if (getXenoTrialsBodyGapV105(opponent, player) > 6) return player.x < opponent.x ? { left: true } : { right: true };
    return { guard: true, heavy: !opponent.previousInput.heavy };
  }
  function observeEvent(event) {
    if (event.grabIdV212 !== grabId || event.side !== 'player') return;
    if (index() === 0 && event.type === 'grapple-start-v153') advance();
    else if (index() === 1 && event.type === XENO_TRIALS_GROUND_BREAK_START_V213) advance();
    else if (event.type === XENO_TRIALS_GROUND_BREAK_FAIL_V213) retry();
    else if (event.type === 'grapple-end-v153') {
      if (index() === 2 && event.reason === 'countered') advance();
      else retry();
    }
  }
  function cue() {
    if (index() === 1 && canStartXenoTrialsGroundBreakV213(match, player)) return 'RAPIDE MAINTENANT';
    if (index() === 1) return 'MAINTENEZ GARDE';
    if (index() === 2) return 'CONTRE EN COURS';
    return '';
  }
  return { opponentInput, observeEvent, cue };
}

function createRetreat(id, player, opponent, { index, advance, retry }) {
  const low = id === 'low-retreat';
  const definition = getXenoTrialsFighterV96(opponent.id);
  const heavy = getXenoTrialsAttackV147(definition, 'heavy', XENO_TRIALS_ATTACKS_V96.heavy);
  let incoming = null;
  function beforeStep(input) {
    if (low || index() !== 1 || !incoming) return;
    const backing = incoming.direction < 0 ? input.left && !input.right : input.right && !input.left;
    if (!backing || !input.guard || !player.guard || opponent.attack?.id !== incoming.id) {
      incoming.guardOrigin = null;
      return;
    }
    incoming.guardOrigin ??= player.x;
    if ((player.x - incoming.guardOrigin) * incoming.direction >= 3) advance();
  }
  function observeEvent(event) {
    if (index() === 0 && event.type === 'attack' && event.side === 'opponent' && event.kind === 'heavy'
      && opponent.attack?.kind === 'heavy') {
      const direction = opponent.attack.facing;
      const bounds = getXenoTrialsBodyBoundsV105(opponent), hurt = getXenoTrialsHurtBoundsV207(player);
      const band = getXenoTrialsStrikeBandV207(bounds, heavy);
      if ((hurt.center - bounds.center) * direction < 0 || getXenoTrialsBodyGapV105(opponent, player, direction) > heavy.reach * definition.reach
        || band.bottom > hurt.top || hurt.bottom > band.top) return;
      incoming = { id: opponent.attack.id, origin: player.x, direction };
      advance();
    }
    if (!incoming) return;
    if (low && index() === 1 && event.type === 'evade-v207' && event.side === 'player' && event.variantV213 === 'low-retreat'
      && event.direction === incoming.direction && opponent.attack?.id === incoming.id && opponent.attack.age < heavy.startup) advance();
    if (event.side !== 'player' || event.attacker !== 'opponent') return;
    if (!low && index() === 2 && event.type === 'block' && opponent.attack?.id === incoming.id) advance();
    if (['hit', 'guard-break'].includes(event.type) || low && event.type === 'block') retry();
  }
  function afterStep() {
    if (!incoming) return;
    if (opponent.attack?.id !== incoming.id) { retry(); return; }
    if (opponent.attack.age < heavy.startup + heavy.active) return;
    if (low && index() === 2 && (player.x - incoming.origin) * incoming.direction >= 8) advance();
    else retry();
  }
  return { beforeStep, observeEvent, afterStep,
    cue: () => index() === 1 && incoming ? 'FRAPPE LOURDE EN COURS' : '' };
}

export function createXenoTrialsPracticeGoalsV213(id, match, progress) {
  if (!XENO_TRIALS_NEW_DRILLS_V213.some(entry => entry.id === id)) return null;
  const [player, opponent] = match.fighters;
  const exercise = id === 'grab-counter' ? createGrabCounter(match, player, opponent, progress)
    : createRetreat(id, player, opponent, progress);
  let lastEvent = match.serial;
  function observe() {
    for (const event of match.events) {
      if (event.id <= lastEvent) continue;
      lastEvent = event.id;
      exercise.observeEvent(event);
    }
    exercise.afterStep?.();
    if (match.phase === 'match-over') progress.retry();
  }
  return { beforeStep: exercise.beforeStep, opponentInput: exercise.opponentInput, observe, cue: exercise.cue };
}
