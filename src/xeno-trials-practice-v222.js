import { XENO_TRIALS_CARGO_OPERATION_V213 } from './xeno-trials-cargo-interlock-v213.js';
import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsStageHazardViewV188 } from './xeno-trials-stage-hazards-v188.js';
import { getXenoTrialsSuperV148, XENO_TRIALS_SUPER_METER_V148 } from './xeno-trials-supers-v148.js';

const warden = 'import-game-afe2-warden';
const cargo = XENO_TRIALS_CARGO_OPERATION_V213;
const [westCrate] = cargo.objectives;
const faceCue = 'GARDEZ PENDANT LE SAUT';
const pivotCue = 'RELÂCHEZ GARDE POUR PIVOTER';
const newGuardCue = 'REPRENEZ GARDE DU NOUVEAU CÔTÉ';
const barrageCue = 'GARDEZ CONTRE LE BARRAGE';
const holdBarrageCue = 'MAINTENEZ GARDE POUR LA SECONDE SALVE';
const pickupCue = 'CHARGEZ LE CAISSON OUEST';
const waitRampCue = 'ATTENDEZ HORS DE LA RAMPE';
const crossRampCue = 'DÉCHARGE TERMINÉE · TRAVERSEZ';
const deliverCue = 'DÉPOSEZ LE CAISSON POUR COUPER LA RAMPE';

function drill(id, title, briefing, objectives, options) {
  return Object.freeze({ id, title, briefing, objectives: Object.freeze(objectives), ...options });
}

export const XENO_TRIALS_NEW_DRILLS_V222 = Object.freeze([
  drill('pivot-guard', 'Pivoter après un franchissement',
    'Tenez Garde en place avec le Crusher pendant que le Runner vous saute par-dessus. Relâchez Garde pour pivoter, puis reprenez-la face à sa frappe.',
    ['Laisser le Runner passer derrière votre garde', 'Pivoter au sol en relâchant Garde', 'Bloquer sa frappe du nouveau côté'],
    { playerId: 'crusher-acm' }),
  drill('barrage-guard', 'Tenir face à un Super en deux salves',
    'Le Warden dispose d’une jauge pleine. Restez face à lui et maintenez Garde dès qu’il arme le barrage jusqu’au passage de sa deuxième salve.',
    ['Repérer le Super du Warden', 'Bloquer le premier projectile', 'Tenir Garde jusqu’au blocage du second projectile'],
    { playerId: 'synth-guard', opponentId: warden }),
  drill('cargo-interlock', 'Livrer un caisson sous tension',
    'Maintenez Interaction au départ pour prendre le caisson. Attendez à gauche de la rampe pendant la décharge, traversez au signal puis déposez le caisson au dépôt.',
    ['Prendre le caisson ouest et armer sa rampe', 'Attendre la décharge hors de la zone', 'Franchir la rampe après la décharge', 'Déposer le caisson et désarmer sa rampe'],
    { playerId: 'prowler', operationIdV212: cargo.id, hordeProtocolId: cargo.hordeProtocolId }),
]);

const contacts = new Set(['hit', 'block', 'guard-break', 'parry-v208']);
const contactBy = (events, side) => events.find(event => event.attacker === side && contacts.has(event.type));
const startedAttack = (events, fighter, kind) => fighter.attack?.kind === kind && events.some(event => event.type === 'attack'
  && event.side === fighter.side && event.kind === kind && event.id === fighter.attack.id + 1);
const move = direction => direction > 0 ? { right: true } : { left: true };

function createPivotGuard(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const definition = getXenoTrialsFighterV96(opponent.id);
  const heavyReach = getXenoTrialsAttackV147(definition, 'heavy', XENO_TRIALS_ATTACKS_V96.heavy).reach * definition.reach;
  let jumpDirection = 0, crossedDirection = 0, landedAt = null, heavyIssued = false, incomingId = null;

  function opponentInput() {
    if (match.phase !== 'active') return {};
    if (jumpDirection === 0) {
      const toward = player.x < opponent.x ? -1 : 1;
      if (getXenoTrialsBodyGapV105(opponent, player) > 20) return move(toward);
      jumpDirection = toward;
      return { ...move(toward), jump: true };
    }
    if (opponent.y > 0) {
      return (opponent.x - player.x) * jumpDirection < 125 ? move(jumpDirection) : {};
    }
    landedAt ??= match.tick;
    if (heavyIssued) return {};
    if (getXenoTrialsBodyGapV105(opponent, player) > heavyReach * .55) return move(player.x < opponent.x ? -1 : 1);
    if (match.tick < landedAt + 30) return {};
    heavyIssued = true;
    return { heavy: true };
  }

  function observe(events) {
    const side = opponent.x < player.x ? -1 : 1;
    if (index() === 0) {
      if (jumpDirection && opponent.y > 0 && player.guard && side === jumpDirection && player.facing !== side) {
        crossedDirection = side;
        advance();
      } else if (landedAt !== null) { retry(); return; }
    }
    if (index() === 1 && events.some(event => event.type === 'turn-v210' && event.side === 'player'
      && event.direction === crossedDirection)) advance();
    if (startedAttack(events, opponent, 'heavy')) incomingId = opponent.attack.id;
    const hit = contactBy(events, 'opponent');
    if (hit) {
      if (index() === 2 && hit.type === 'block' && opponent.attack?.id === incomingId && player.facing === crossedDirection) advance();
      else retry();
    } else if ((incomingId !== null && opponent.attack?.id !== incomingId) || contactBy(events, 'player')) retry();
  }

  return { opponentInput, observe, cue: () => [faceCue, pivotCue, newGuardCue][index()] || '' };
}

function createBarrageGuard(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const superId = getXenoTrialsSuperV148(getXenoTrialsFighterV96(opponent.id)).id;
  opponent.superMeterV148 = XENO_TRIALS_SUPER_METER_V148.maximum;
  let incomingId = null, approaching = [];
  const barrage = () => match.projectiles.filter(shot => shot.owner === 'opponent' && shot.superIdV148 === superId);

  function beforeStep() {
    approaching = barrage();
  }

  function observe(events) {
    if (index() === 0 && opponent.superMeterV148 === 0 && startedAttack(events, opponent, 'super')) {
      incomingId = opponent.attack.id;
      advance();
    }
    if (contactBy(events, 'player') || (index() === 2 && !player.guard)) { retry(); return; }
    const hit = contactBy(events, 'opponent');
    if (hit) {
      const remaining = barrage();
      const resolved = approaching.find(shot => shot.volleyV148 === index() - 1 && !remaining.includes(shot));
      if (index() > 0 && hit.type === 'block' && player.guard && resolved) advance();
      else retry();
    } else if (incomingId !== null && opponent.attack?.id !== incomingId && !barrage().length) retry();
  }

  return { beforeStep, observe, opponentInput: () => ({ super: index() === 0 && match.tick >= 72 }),
    cue: () => index() === 1 ? barrageCue : index() === 2 ? holdBarrageCue : '' };
}

function createCargoInterlock(match, { index, advance, retry }) {
  const [player] = match.fighters;

  function observe(events) {
    const state = match.operationV188;
    const view = getXenoTrialsStageHazardViewV188(match);
    const ramp = view.cargoInterlockV213.circuits[0];
    const body = getXenoTrialsBodyBoundsV105(player);
    const picked = events.find(event => event.type === 'operation-objective-v188' && event.operationId === cargo.id);
    if (index() === 0 && picked) {
      if (picked.objectiveId !== westCrate.id || state.carrying !== 0 || !ramp.armed) { retry(); return; }
      advance();
    }
    if (view.playerDamage > 0 || (index() === 1 && body.right > ramp.left)
      || (index() === 2 && view.phase === 'active' && body.right > ramp.left)) { retry(); return; }
    if (index() === 1 && ramp.armed && view.phase === 'active' && body.bottom === 0) advance();
    if (index() === 2 && view.phase === 'idle' && ramp.armed && body.left >= ramp.right) advance();
    if (index() === 3 && state.delivered[0] && state.carrying === -1 && view.cargoInterlockV213.armed === null
      && events.some(event => event.type === 'operation-delivery-v188' && event.operationId === cargo.id)) advance();
  }

  function cue() {
    if (index() === 0) return pickupCue;
    if (index() === 1) return waitRampCue;
    if (index() === 2) return getXenoTrialsStageHazardViewV188(match).phase === 'idle' ? crossRampCue : waitRampCue;
    if (index() === 3) return deliverCue;
    return '';
  }

  function opponentInput() {
    if (index() < 2) return {};
    const phase = getXenoTrialsStageHazardViewV188(match)?.phase;
    return phase === 'idle' ? { right: true } : {};
  }

  return { observe, cue, opponentInput };
}

const exercises = new Map([
  ['pivot-guard', createPivotGuard], ['barrage-guard', createBarrageGuard], ['cargo-interlock', createCargoInterlock],
]);

export function createXenoTrialsPracticeGoalsV222(id, match, progress) {
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
