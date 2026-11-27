import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsStageHazardViewV188 } from './xeno-trials-stage-hazards-v188.js';
import { XENO_TRIALS_SUPER_METER_V148 } from './xeno-trials-supers-v148.js';

const drill = (id, title, briefing, objectives, options = {}) => Object.freeze({
  id, title, briefing, objectives: Object.freeze(objectives), ...options,
});
const commando = 'import-game-dd-wy-commando';
const grabId = 'warrior::grab';
const counterId = 'razor-claws::super2';
export const XENO_TRIALS_NEW_DRILLS_V212 = Object.freeze([
  drill('ground-grab', 'Prise de proximité', 'Approchez le Commando au contact. Maintenez Garde et appuyez sur Lourde, puis laissez la cible résister.',
    ['Saisir le Commando au sol', 'Observer sa libération'], { opponentId: commando }),
  drill('ground-grab-escape', 'Sortir de la prise au sol', 'Laissez le Warrior vous saisir. Une fois immobilisé, maintenez Garde sans relâcher jusqu’à la libération.',
    ['Subir la prise du Warrior', 'Se libérer en maintenant Garde'], { playerId: commando, opponentId: 'warrior' }),
  drill('counter-whiff', 'Mesurer la portée du Super II', 'Restez en place. Essayez Garde + Super sans parade, puis parez la frappe de la Reine et recommencez. Sa portée dépasse la vôtre.',
    ['Confirmer le refus sans débiter la jauge', 'Parer une frappe puis lancer le Super II', 'Laisser passer la riposte hors portée'],
    { playerId: 'razor-claws', opponentId: 'queen', pressure: 'heavy', approachV212: 94 }),
  drill('hazard-crossing', 'Dégager la zone annoncée', 'Rejoignez la zone marquée dès l’alerte. Sortez avant son activation et restez à l’abri jusqu’à la fin du danger.',
    ['Repérer et atteindre la zone d’alerte', 'Quitter la zone avant l’activation', 'Attendre la fin du cycle sans exposition'],
    { operationIdV212: 'xto188-beacon-2', hordeProtocolId: 'xth180-quarantine-1' }),
]);
const ids = new Set(XENO_TRIALS_NEW_DRILLS_V212.map(entry => entry.id));
const heldBy = match => match.grappleV153?.target;

function intersects(body, zone) {
  return body.right > zone.left && body.left < zone.right && body.bottom < zone.top && body.top > zone.bottom;
}

export function createXenoTrialsPracticeGoalsV212(id, match, { index, advance, retry }) {
  if (!ids.has(id)) return null;
  const [player, opponent] = match.fighters;
  const fullMeter = XENO_TRIALS_SUPER_METER_V148.maximum;
  if (id === 'counter-whiff') player.superMeterV148 = fullMeter;
  let lastEvent = match.serial, confirmedParry = false, attemptedOn = null, queuedCounter = null, hazard = null;

  function beforeStep(input) {
    if (id !== 'counter-whiff' || index() !== 0) return;
    if (input.guard === true && input.super === true && !player.previousInput.super && !player.attack && player.specialCooldown === 0)
      attemptedOn = match.tick + 1;
  }
  function opponentInput() {
    if (id === 'hazard-crossing') return null;
    if (id === 'ground-grab') return heldBy(match) === 'opponent' ? { guard: true } : {};
    if (id === 'counter-whiff' && index() !== 1) return {};
    if (id !== 'ground-grab-escape') return undefined;
    if (heldBy(match) || index() > 0 || opponent.stun > 0 || opponent.attack) return {};
    if (getXenoTrialsBodyGapV105(opponent, player) > 6) return player.x < opponent.x ? { left: true } : { right: true };
    return { guard: true, heavy: !opponent.previousInput.heavy };
  }
  function observeEvent(event) {
    if (['ground-grab', 'ground-grab-escape'].includes(id)) {
      const target = id === 'ground-grab' ? 'opponent' : 'player';
      if (event.grabIdV212 !== grabId || event.side !== target) return;
      if (index() === 0 && event.type === 'grapple-start-v153') advance();
      else if (index() === 1 && event.type === 'grapple-end-v153' && event.reason === 'escaped') advance();
      else if (index() === 1 && event.type === 'grapple-end-v153') retry();
    }
    if (id !== 'counter-whiff') return;
    if (index() === 1 && event.type === 'parry-v208' && event.side === 'player' && event.attacker === 'opponent') confirmedParry = true;
    if (index() === 1 && confirmedParry && event.type === 'attack' && event.side === 'player'
      && event.riposteIdV208 === counterId && player.superMeterV148 === 0) {
      queuedCounter = event.id - 1;
      advance();
    }
    if (index() === 2 && event.side === 'opponent' && event.attacker === 'player' && event.damage > 0) retry();
  }
  function observeHazard() {
    const view = getXenoTrialsStageHazardViewV188(match);
    if (!view) return;
    const body = getXenoTrialsBodyBoundsV105(player);
    if (index() === 0 && view.phase === 'warning' && intersects(body, view.zones[0])) {
      hazard = { cycle: view.cycle, end: view.endsTick, priorDamage: view.playerDamage, zone: view.zones[0] };
      advance();
    }
    if (!hazard) return;
    if (view.playerDamage !== hazard.priorDamage) { retry(); return; }
    if (index() === 1 && view.cycle === hazard.cycle && view.phase === 'active') {
      if (intersects(body, hazard.zone)) retry();
      else advance();
    }
    if (index() === 2 && match.tick >= hazard.end) advance();
  }
  function observe(_input, activeTick) {
    if (id === 'counter-whiff' && index() === 0 && activeTick && attemptedOn === match.tick && player.guard
      && !player.attack && player.superMeterV148 === fullMeter) advance();
    for (const event of match.events) {
      if (event.id <= lastEvent) continue;
      lastEvent = event.id;
      observeEvent(event);
    }
    if (id === 'counter-whiff' && index() === 2 && queuedCounter && player.attack?.id !== queuedCounter) {
      if (player.stun > 0) retry();
      else advance();
    }
    if (id === 'hazard-crossing') observeHazard();
    if (match.phase === 'match-over') retry();
  }
  function cue() {
    if (id === 'ground-grab' || id === 'ground-grab-escape') return heldBy(match) ? 'PRISE EN COURS' : '';
    if (id === 'counter-whiff' && opponent.attack?.kind === 'heavy') return 'FRAPPE LOURDE EN COURS';
    if (id === 'hazard-crossing' && hazard && index() === 1) return 'QUITTER LA ZONE';
    return '';
  }
  return { beforeStep, opponentInput, observe, cue };
}
