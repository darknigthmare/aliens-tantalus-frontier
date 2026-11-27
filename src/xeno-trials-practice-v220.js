import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { XENO_TRIALS_STEP_V96 } from './xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { XENO_TRIALS_GROUND_GRAB_KIND_V212, getXenoTrialsGroundGrabPairV212 } from './xeno-trials-grapple-v212.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsOperationViewV188, XENO_TRIALS_RELAY_OPERATION_V218 } from './xeno-trials-operations-v188.js';

const commando = 'import-game-dd-wy-commando';
const operation = XENO_TRIALS_RELAY_OPERATION_V218;
const [westRelay] = operation.objectives;
const guardGrabCue = 'GARDEZ FACE À LA PRISE';
const grabCounterCue = 'RAPIDE PENDANT LA RÉCUPÉRATION';
const switchGuardCue = 'ABAISSEZ LA GARDE';
const lowGuardCue = 'BAS + GARDE CONTRE LA FRAPPE BASSE';
const chargeCue = 'CHARGEZ LE RELAIS OUEST';
const holdChargeCue = 'MAINTENEZ LA CHARGE';
const clearRelayCue = 'NEUTRALISEZ LES CONTACTS DU RELAIS';
const resumeChargeCue = 'REPRENEZ LA CHARGE DU RELAIS';

function drill(id, title, briefing, objectives, options) {
  return Object.freeze({ id, title, briefing, objectives: Object.freeze(objectives), ...options });
}

export const XENO_TRIALS_NEW_DRILLS_V220 = Object.freeze([
  drill('grab-denial', 'Refuser une saisie de face',
    'Laissez le Warrior s’approcher. Tenez Garde quand il arme sa prise. Au signal de récupération, relâchez Garde puis touchez avec Rapide.',
    ['Repérer l’armement de la prise', 'Bloquer la prise avant la capture', 'Toucher avec Rapide pendant la récupération'],
    { playerId: commando, opponentId: 'warrior' }),
  drill('guard-pattern', 'Changer de garde face au Runner',
    'Bloquez deux frappes debout. Au signal, ajoutez Bas sans lâcher Garde. Le Runner cherche une ouverture basse si vous restez debout.',
    ['Bloquer deux frappes debout', 'Lire la réponse du Runner', 'Bloquer la réponse en posture basse'],
    { playerId: 'synth-guard', difficulty: 'hard', noSpecial: true }),
  drill('relay-contest', 'Réarmer un relais contesté',
    'Maintenez Interaction au relais ouest. Si des contacts bloquent la charge, neutralisez-les puis maintenez de nouveau Interaction pour verrouiller le relais.',
    ['Commencer à charger le relais ouest', 'Observer la perte de charge sous pression', 'Neutraliser les contacts du périmètre', 'Verrouiller le même relais après la reprise'],
    { operationIdV212: operation.id, hordeProtocolId: operation.hordeProtocolId }),
]);

const contacts = new Set(['block', 'guard-break', 'hit', 'parry-v208']);
const standingAttacks = new Set(['light', 'heavy']);
const acceptedAttack = (events, fighter) => fighter.attack && events.some(event => event.type === 'attack'
  && event.side === fighter.side && event.id === fighter.attack.id + 1 && event.kind === fighter.attack.kind);
const contactBy = (events, side) => events.find(event => event.attacker === side && contacts.has(event.type));

function createGrabDenial(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const grab = getXenoTrialsGroundGrabPairV212(getXenoTrialsFighterV96(opponent.id), getXenoTrialsFighterV96(player.id));
  const recovery = grab.spec.startup + grab.spec.active;
  let incomingId = null, canPunish = false;

  function beforeStep() {
    canPunish = index() === 2 && opponent.attack?.id === incomingId && opponent.attack.age >= recovery
      && opponent.attack.age + XENO_TRIALS_STEP_V96 < recovery + grab.spec.recovery;
  }

  function opponentInput() {
    if (index() !== 0) return {};
    if (getXenoTrialsBodyGapV105(opponent, player) > grab.contactGap - 2)
      return player.x < opponent.x ? { left: true } : { right: true };
    return { guard: true, heavy: !opponent.previousInput.heavy };
  }

  function observe(events) {
    if (index() === 0 && opponent.attack?.kind === XENO_TRIALS_GROUND_GRAB_KIND_V212 && acceptedAttack(events, opponent)) {
      incomingId = opponent.attack.id;
      advance();
    }
    const attempt = contactBy(events, 'opponent');
    if (attempt) {
      if (index() === 1 && attempt.type === 'block' && opponent.attack?.id === incomingId && !match.grappleV153) advance();
      else { retry(); return; }
    }
    const response = contactBy(events, 'player');
    if (response) {
      if (index() === 2 && canPunish && response.type === 'hit' && player.attack?.kind === 'light' && player.attack.hit) advance();
      else retry();
      return;
    }
    if (index() > 0 && opponent.attack?.id !== incomingId) retry();
  }

  function cue() {
    if (index() === 1) return guardGrabCue;
    if (index() === 2 && opponent.attack?.age >= recovery) return grabCounterCue;
    return '';
  }

  return { beforeStep, opponentInput, observe, cue };
}

function createGuardPattern(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const blockedAttackIds = new Set();
  let incoming = null;

  function observe(events) {
    const attack = opponent.attack;
    const lowGuard = player.guard && player.movesetV207?.low;
    if (index() === 1 && (attack?.kind === 'low' || lowGuard && standingAttacks.has(attack?.kind))
      && acceptedAttack(events, opponent)) {
      incoming = { id: attack.id, kind: attack.kind };
      advance();
    }
    const contact = contactBy(events, 'opponent');
    if (contact) {
      if (contact.type !== 'block') { retry(); return; }
      if (index() === 0 && standingAttacks.has(attack?.kind) && player.guard && !lowGuard) {
        blockedAttackIds.add(attack.id);
        if (blockedAttackIds.size === 2) advance();
      } else if (index() === 2 && attack?.id === incoming.id) {
        if (lowGuard) advance();
        else retry();
      }
    }
    if (contactBy(events, 'player') || (index() === 2 && attack?.id !== incoming.id)) retry();
  }

  function cue() {
    if (index() === 2 && incoming.kind === 'low') return lowGuardCue;
    if (index() === 1 || index() === 2) return switchGuardCue;
    return '';
  }

  return { opponentInput: () => null, observe, cue };
}

function atRelay(fighter, radius) {
  const body = getXenoTrialsBodyBoundsV105(fighter);
  return fighter.hp > 0 && body.bottom === 0 && body.left <= westRelay.x + radius && body.right >= westRelay.x - radius;
}

function createRelayContest(match, { index, advance, retry }) {
  const [player] = match.fighters;
  const contestingContacts = new Set();
  let previousCharge = 0;

  function opponentInput() {
    if (index() === 1) return { right: true };
    if (index() !== 2) return {};
    const threats = match.fighters.slice(1);
    return threats.some(enemy => getXenoTrialsBodyGapV105(player, enemy) <= 34) ? { light: true } : { right: true };
  }

  function observe(events, input) {
    const target = getXenoTrialsOperationViewV188(match).entities[0];
    const before = previousCharge;
    previousCharge = target.progress;
    if (index() === 0 && target.progress >= 32) advance();
    if (index() === 1 && target.contested && target.progress < before && input?.interact && atRelay(player, target.radius)) advance();
    else if (index() === 1 && target.progress === 0) retry();
    if (index() === 2) {
      const alive = match.fighters.slice(1);
      for (const enemy of alive) if (atRelay(enemy, target.pressureRadius)) contestingContacts.add(enemy.instanceIdV180);
      const expelled = events.some(event => event.type === 'hit' && event.attacker === 'player'
        && contestingContacts.has(event.targetInstanceV180) && !alive.some(enemy => enemy.instanceIdV180 === event.targetInstanceV180));
      if (!target.contested && expelled) advance();
    }
    if (index() === 3 && events.some(event => event.type === 'operation-objective-v188'
      && event.operationId === operation.id && event.objectiveId === westRelay.id) && target.completed) advance();
    if (target.completed && index() < 4) retry();
  }

  function cue() {
    if (index() === 0) return chargeCue;
    if (index() === 1) return holdChargeCue;
    if (index() === 2) return clearRelayCue;
    if (index() === 3) return resumeChargeCue;
    return '';
  }

  return { observe, cue, opponentInput };
}

const exercises = new Map([
  ['grab-denial', createGrabDenial], ['guard-pattern', createGuardPattern], ['relay-contest', createRelayContest],
]);

export function createXenoTrialsPracticeGoalsV220(id, match, progress) {
  const create = exercises.get(id);
  if (!create) return null;
  const exercise = create(match, progress);
  let lastEvent = match.serial;
  function observe(input, activeTick) {
    if (!activeTick) return;
    if (match.phase === 'match-over') { progress.retry(); return; }
    const events = match.events.filter(event => event.id > lastEvent);
    lastEvent = match.serial;
    exercise.observe(events, input);
  }
  return { ...exercise, observe };
}
