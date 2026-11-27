import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_STEP_V96 } from './xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { XENO_TRIALS_EVADE_V207 } from './xeno-trials-moveset-v207.js';
import { getXenoTrialsAlternateSignatureV208 } from './xeno-trials-signature-kit-v208.js';
import { getXenoTrialsSignatureV147 } from './xeno-trials-signatures-v147.js';

const commando = 'import-game-dd-wy-commando';
const loader = 'synth-automated-powerloader';
const distanceCue = 'PLACEZ-VOUS HORS DE PORTÉE DE RAPIDE';
const missCue = 'ESSAYEZ RAPIDE DEPUIS CETTE DISTANCE';
const advanceCue = 'ESQUIVE AVANT, PUIS RAPIDE';
const clampCue = 'ESQUIVE ARRIÈRE SANS MARCHER';
const punishCue = 'PERCUSSION CAUDALE PENDANT LA RÉCUPÉRATION';
const midrangeCue = 'REJOIGNEZ LA MOYENNE PORTÉE';
const tailCue = 'PERCUSSION CAUDALE À DISTANCE';
const closeCue = 'RAPPROCHEZ-VOUS POUR LA MORSURE';
const rechargeCue = 'ATTENDEZ LE RÉARMEMENT DES SIGNATURES';
const biteCue = 'MORSURE INTERNE AU CONTACT';

function drill(id, title, briefing, objectives, options) {
  return Object.freeze({ id, title, briefing, objectives: Object.freeze(objectives), ...options });
}

export const XENO_TRIALS_NEW_DRILLS_V223 = Object.freeze([
  drill('range-advance', 'Convertir une distance en attaque',
    'Approchez jusqu’au signal puis essayez Rapide. Quand le coup tombe court, faites une Esquive vers le Commando et appuyez sur Rapide pendant le mouvement.',
    ['Se placer juste hors de portée de Rapide', 'Faire manquer Rapide à cette distance', 'Toucher depuis cette distance avec Esquive avant et Rapide'],
    { playerId: 'runner', opponentId: commando, noSpecial: true }),
  drill('clamp-punish', 'Punir la fermeture de pince',
    'Attendez la fermeture de pince du Chargeur. Appuyez sur Esquive sans tenir de direction pour reculer. Au signal de récupération, touchez avec Percussion caudale.',
    ['Repérer la fermeture de pince à portée', 'Sortir de portée avec une esquive arrière', 'Toucher avec Percussion caudale avant la fin de la récupération'],
    { opponentId: loader, pressure: 'special', approachV212: 42 }),
  drill('signature-range', 'Choisir une signature selon la distance',
    'Touchez le Commando à moyenne portée avec Percussion caudale. Après le recul de la cible, rapprochez-vous et attendez le réarmement pour toucher avec Morsure interne.',
    ['Se placer à portée de la queue et hors de portée de la mâchoire', 'Toucher avec Percussion caudale à moyenne portée', 'Toucher avec Morsure interne au contact après le réarmement'],
    { opponentId: commando }),
]);

const contacts = new Set(['hit', 'block', 'guard-break', 'parry-v208']);
const contactBy = (events, side) => events.find(event => event.attacker === side && contacts.has(event.type));
const started = (events, fighter, kind) => fighter.attack?.kind === kind && events.some(event => event.type === 'attack'
  && event.side === fighter.side && event.kind === kind && event.id === fighter.attack.id + 1);
const hasHit = (event, fighter, id) => event?.type === 'hit' && fighter.attack?.id === id && fighter.attack.hit;

function createRangeAdvance(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const lightReach = XENO_TRIALS_ATTACKS_V96.light.reach * getXenoTrialsFighterV96(player.id).reach;
  let beforeGap = null, beforeEvadeTicks = null, whiffId = null, forwardDash = false, advanceId = null;
  const gap = () => getXenoTrialsBodyGapV105(player, opponent, player.facing);
  const fromBand = distance => distance > lightReach + 4 && distance <= lightReach + 58;

  function beforeStep() {
    beforeGap = gap();
    beforeEvadeTicks = player.movesetV207?.evade?.ticks ?? XENO_TRIALS_EVADE_V207.travelTicks;
  }

  function observe(events) {
    if (index() === 0 && player.y === 0 && !player.attack && fromBand(gap())) advance();
    if (index() === 1 && player.y === 0 && fromBand(beforeGap) && started(events, player, 'light')) whiffId = player.attack.id;
    const hit = contactBy(events, 'player');
    if (hit) {
      if (index() === 2 && advanceId !== null && hasHit(hit, player, advanceId)) advance();
      else retry();
      return;
    }
    if (index() === 1 && whiffId !== null && player.attack?.id !== whiffId) advance();
    if (index() !== 2) return;
    const dash = events.find(event => event.type === 'evade-v207' && event.side === 'player');
    if (dash) forwardDash = fromBand(beforeGap) && dash.direction === player.facing && !dash.sourceV210 && !dash.variantV213;
    if (forwardDash && beforeEvadeTicks < XENO_TRIALS_EVADE_V207.travelTicks && started(events, player, 'advance'))
      advanceId = player.attack.id;
    else if (advanceId !== null && player.attack?.id !== advanceId) advanceId = null;
    if (!player.movesetV207?.evade) forwardDash = false;
  }

  function cue() {
    if (index() === 0) return distanceCue;
    if (index() === 1) return whiffId !== null || fromBand(gap()) ? missCue : distanceCue;
    if (index() === 2) return forwardDash || advanceId !== null || fromBand(gap()) ? advanceCue : distanceCue;
    return '';
  }

  return { beforeStep, observe, cue };
}

function createClampPunish(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const definition = getXenoTrialsFighterV96(opponent.id);
  const clamp = getXenoTrialsSignatureV147(definition);
  const reach = clamp.spec.reach * definition.reach;
  const recovery = clamp.spec.startup + clamp.spec.active;
  const tail = getXenoTrialsAlternateSignatureV208(getXenoTrialsFighterV96(player.id), 'signature-2');
  let incoming = null, evaded = false, recoveryTick = null, punishId = null;
  const gap = facing => getXenoTrialsBodyGapV105(opponent, player, facing);

  function beforeStep() {
    const attack = opponent.attack;
    recoveryTick = index() === 2 && attack?.id === incoming?.id && attack.age >= recovery
      && attack.age + XENO_TRIALS_STEP_V96 < recovery + clamp.spec.recovery ? match.tick + 1 : null;
  }

  function observe(events) {
    if (index() === 0 && started(events, opponent, 'special')
      && events.some(event => event.type === 'attack' && event.side === 'opponent' && event.signatureIdV147 === clamp.id)) {
      const attack = opponent.attack;
      if (player.y !== 0 || gap(attack.facing) > reach) { retry(); return; }
      incoming = { id: attack.id, facing: attack.facing, playerX: player.x };
      advance();
    }
    if (contactBy(events, 'opponent')) { retry(); return; }
    const attack = opponent.attack;
    if (index() === 1) {
      if (events.some(event => event.type === 'evade-v207' && event.side === 'player' && event.direction === incoming.facing
        && !event.variantV213 && !event.sourceV210)) evaded = true;
      if (attack?.id === incoming.id && attack.age >= recovery) {
        if (evaded && !attack.hit && player.y === 0 && gap(incoming.facing) > reach
          && (player.x - incoming.playerX) * incoming.facing > 0) advance();
        else { retry(); return; }
      }
    }
    if (index() === 2 && recoveryTick === match.tick && started(events, player, tail.kind)
      && events.some(event => event.signatureIdV208 === tail.id && event.side === 'player')) punishId = player.attack.id;
    const hit = contactBy(events, 'player');
    if (hit) {
      if (index() === 2 && recoveryTick === match.tick && punishId !== null && hasHit(hit, player, punishId)) advance();
      else retry();
      return;
    }
    if (incoming && attack?.id !== incoming.id) retry();
  }

  return { beforeStep, observe, opponentInput: () => index() === 0 ? undefined : {},
    cue: () => index() === 1 ? clampCue : index() === 2 && !player.movesetV207?.evade ? punishCue : '' };
}

function createSignatureRange(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const definition = getXenoTrialsFighterV96(player.id);
  const tail = getXenoTrialsAlternateSignatureV208(definition, 'signature-2');
  const bite = getXenoTrialsAlternateSignatureV208(definition, 'signature-3');
  const biteReach = bite.spec.reach * definition.reach;
  const tailReach = tail.spec.reach * definition.reach;
  let beforeGap = null, acceptedId = null;
  const gap = () => getXenoTrialsBodyGapV105(player, opponent, player.facing);
  const midrange = distance => distance >= biteReach + 30 && distance <= tailReach - 6;

  function beforeStep() { beforeGap = gap(); }

  function observe(events) {
    if (index() === 0 && player.y === 0 && !player.attack && midrange(gap())) advance();
    const wanted = index() === 1 ? tail : index() === 2 ? bite : null;
    const inRange = index() === 1 ? midrange(beforeGap) : beforeGap <= biteReach;
    if (wanted && inRange && player.y === 0 && opponent.y === 0 && started(events, player, wanted.kind)
      && events.some(event => event.signatureIdV208 === wanted.id && event.side === 'player')) acceptedId = player.attack.id;
    const hit = contactBy(events, 'player');
    if (!hit) return;
    if (acceptedId !== null && hasHit(hit, player, acceptedId)) {
      acceptedId = null;
      advance();
    } else retry();
  }

  function cue() {
    if (index() === 0) return midrangeCue;
    if (index() === 1) return midrange(gap()) ? tailCue : midrangeCue;
    if (index() === 2 && gap() > biteReach) return closeCue;
    if (index() === 2) return player.specialCooldown > 0 ? rechargeCue : biteCue;
    return '';
  }

  return { beforeStep, observe, cue };
}

const exercises = new Map([
  ['range-advance', createRangeAdvance], ['clamp-punish', createClampPunish], ['signature-range', createSignatureRange],
]);

export function createXenoTrialsPracticeGoalsV223(id, match, progress) {
  const create = exercises.get(id);
  if (!create) return null;
  const exercise = create(match, progress);
  let lastEvent = match.serial;
  function observe(_input, activeTick) {
    if (!activeTick) return;
    if (match.phase === 'match-over') { progress.retry(); return; }
    const events = match.events.filter(event => event.id > lastEvent);
    lastEvent = match.serial;
    exercise.observe(events);
  }
  return { ...exercise, observe };
}
