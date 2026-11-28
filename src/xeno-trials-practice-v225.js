import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207, getXenoTrialsStrikeBandV207 } from './xeno-trials-moveset-v207.js';
import { getXenoTrialsGroundingDoorV223, XENO_TRIALS_GROUNDING_OPERATION_V223 } from './xeno-trials-operations-v188.js';
import { getXenoTrialsSignatureV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsStageHazardViewV188 } from './xeno-trials-stage-hazards-v188.js';
import { getXenoTrialsSuperV148, XENO_TRIALS_SUPER_METER_V148 } from './xeno-trials-supers-v148.js';

const spitter = 'drive-v123-afe-spitter';
const loader = 'synth-automated-powerloader';
const reactor = XENO_TRIALS_GROUNDING_OPERATION_V223;
const [groundPost, exitPost] = reactor.objectives;
const aimCue = 'RESTEZ AU SOL PENDANT LA VISÉE';
const shotCue = 'TIR PARTI · SAUTEZ SUR PLACE';
const groupCue = 'LAISSEZ TROIS CONTACTS SE REGROUPER DEVANT VOUS';
const sweepCue = 'TROIS CONTACTS À PORTÉE · SUPER';
const reactorCue = 'RESTEZ PRÈS DE LA BORNE';
const arcCue = 'LAISSEZ UN CONTACT ENTRER DANS LA BANDE';
const doorCue = 'ATTENDEZ L’OUVERTURE DU SAS';
const exitCue = 'REJOIGNEZ LE SAS ET MAINTENEZ INTERACTION';
const acidRetryCue = 'ATTENDEZ LE DÉPART DU TIR AVANT DE SAUTER';
const hordeRetryCue = 'ATTENDEZ TROIS CONTACTS AVANT DE LANCER SUPER';
const reactorRetryCue = 'RESTEZ HORS DE LA BANDE ET LAISSEZ PASSER UN CONTACT';

function drill(id, title, briefing, objectives, options) {
  return Object.freeze({ id, title, briefing, objectives: Object.freeze(objectives), ...options });
}

export const XENO_TRIALS_NEW_DRILLS_V225 = Object.freeze([
  drill('aimed-acid-timing', 'Sauter après le tir visé',
    'Restez au sol pendant que le Spitter vous vise. Sautez sur place dès le départ du projectile. Le tir conserve l’angle choisi à l’émission.',
    ['Repérer la préparation du Spitter', 'Laisser le tir partir vers votre position au sol', 'Sauter après le départ et laisser passer le tir en dessous'],
    { playerId: 'runner', opponentId: spitter, pressure: 'special', stationary: true }),
  drill('horde-sweep', 'Balayer trois contacts avec un seul Super',
    'Le Chargeur industriel dispose d’une jauge pleine. Laissez les contacts de la horde se regrouper devant lui et lancez Super quand trois sont à portée.',
    ['Laisser trois contacts entrer dans la portée du Super', 'Engager le Super dans leur direction', 'Toucher les trois contacts avec le même Super'],
    { playerId: loader, hordeProtocolId: 'xth213-airlock-relay' }),
  drill('reactor-lure', 'Alimenter le sas avec un contact hostile',
    'Restez près de la borne hors de la bande signalée. Attirez un contact jusque dans la décharge. Après l’ouverture, rejoignez le sas et maintenez Interaction pour valider la sortie.',
    ['Repérer la bande avant la décharge', 'Faire alimenter le sas par une décharge sur un contact', 'Attendre l’ouverture puis valider le sas du réacteur'],
    { operationIdV212: reactor.id, hordeProtocolId: reactor.hordeProtocolId }),
]);

function attackReceipt(events, fighter, kind) {
  return fighter.attack?.kind === kind && events.find(event => event.type === 'attack' && event.kind === kind
    && event.side === fighter.side && event.id === fighter.attack.id + 1);
}

const contactTypes = new Set(['hit', 'block', 'guard-break', 'parry-v208']);

function createAimedAcidTiming(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const signature = getXenoTrialsSignatureV147(getXenoTrialsFighterV96(opponent.id));
  let aiming = null, flight = null, airborneClearance = false;
  const fail = () => retry(acidRetryCue);

  function observe(events) {
    if (events.some(event => contactTypes.has(event.type) && (event.attacker === 'player' || event.attacker === 'opponent'))) { fail(); return; }
    if (index() === 0 && attackReceipt(events, opponent, 'special')?.signatureIdV147 === signature.id) {
      aiming = opponent.attack.id;
      advance();
    }
    const body = getXenoTrialsBodyBoundsV105(player);
    if (index() === 1) {
      const shot = match.projectiles.find(projectile => projectile.owner === 'opponent' && projectile.groupIdV147 === aiming
        && projectile.signatureIdV147 === signature.id);
      if (shot) {
        const travel = (body.center - shot.x) / shot.vx;
        const projectedY = shot.y + travel * shot.vy;
        if (body.bottom !== 0 || travel <= 0 || projectedY < body.bottom || projectedY > body.top) { fail(); return; }
        flight = { id: shot.id, x: player.x, vx: shot.vx, vy: shot.vy };
        advance();
      } else if (opponent.attack?.id !== aiming) { fail(); return; }
    }
    if (index() !== 2) return;
    const shot = match.projectiles.find(projectile => projectile.id === flight.id);
    if (!shot || Math.abs(player.x - flight.x) > 3 || shot.vx !== flight.vx || shot.vy !== flight.vy) { fail(); return; }
    const radius = shot.radiusV147;
    if (shot.x >= body.left - radius && shot.x <= body.right + radius && body.bottom > shot.y + radius) airborneClearance = true;
    const passed = shot.direction < 0 ? shot.x < body.left - radius : shot.x > body.right + radius;
    if (passed) {
      if (airborneClearance) advance();
      else fail();
    }
  }

  return { observe, opponentInput: () => index() === 0 ? undefined : {}, cue: () => index() === 2 ? shotCue : index() < 2 ? aimCue : '' };
}

function createHordeSweep(match, { index, advance, retry }) {
  const [player] = match.fighters;
  const definition = getXenoTrialsFighterV96(player.id);
  const move = getXenoTrialsSuperV148(definition);
  const spec = move.spec;
  const limit = spec.hordeTargetsV209;
  const reach = spec.reach * definition.reach;
  player.superMeterV148 = XENO_TRIALS_SUPER_METER_V148.maximum;
  let cast = null, readyAtStart = false;
  const confirmed = new Set();
  const fail = () => retry(hordeRetryCue);

  function lineReady() {
    const body = getXenoTrialsBodyBoundsV105(player);
    const band = getXenoTrialsStrikeBandV207(body, spec);
    let count = 0;
    for (const target of match.fighters.slice(1)) {
      const hurt = getXenoTrialsHurtBoundsV207(target);
      if (target.hp > 0 && target.y === 0 && (hurt.center - body.center) * player.facing >= 0
        && band.bottom <= hurt.top && hurt.bottom <= band.top
        && getXenoTrialsBodyGapV105(player, target, player.facing) <= reach) count++;
    }
    return player.y === 0 && count >= limit;
  }

  function beforeStep() { readyAtStart = lineReady(); }

  function observe(events) {
    if (index() === 0 && lineReady()) advance();
    const receipt = attackReceipt(events, player, 'super');
    if (cast === null && receipt?.superIdV148 === move.id && player.superMeterV148 === 0) {
      cast = player.attack.id;
      if (index() === 1 && readyAtStart) advance();
    }
    if (cast !== null && player.attack?.id === cast) {
      const targets = player.attack.hitTargetsV180;
      for (const event of events) if (event.type === 'hit' && event.attackerInstanceV180 === 'player'
        && targets?.includes(event.targetInstanceV180)) confirmed.add(event.targetInstanceV180);
      if (index() === 2 && confirmed.size === limit) advance();
      else if (player.attack.age >= spec.startup + spec.active) fail();
    } else if (cast !== null || match.hordeV180.wave > 1) fail();
  }

  return { beforeStep, observe, opponentInput: () => cast === null ? { right: true } : {},
    cue: () => lineReady() && cast === null ? sweepCue : index() < 2 ? groupCue : '' };
}

function createReactorLure(match, { index, advance, retry }) {
  let activation = null;
  const fail = () => retry(reactorRetryCue);

  function observe(events) {
    const state = match.operationV188;
    const hazard = getXenoTrialsStageHazardViewV188(match);
    if (match.stageHazardsV188.playerDamage > 0 || state.groundingActivationV223?.method === 'manual') { fail(); return; }
    if (index() === 0 && hazard?.phase === 'warning') advance();
    if (index() === 1 && state.groundingActivationV223?.method === 'arc') {
      const tick = state.groundingActivationV223.tick;
      const hit = events.find(event => event.type === 'stage-hazard-contact-v188' && event.kind === 'arc'
        && event.tick === tick && /^horde-\d+$/.test(event.actorId) && event.damage > 0);
      const powered = hit && events.some(event => event.type === 'operation-objective-v188' && event.operationId === reactor.id
        && event.objectiveId === groundPost.id && event.tick === tick && event.id > hit.id);
      if (!powered) { fail(); return; }
      activation = tick;
      advance();
    }
    if (index() === 2 && match.result?.winner === 'player' && match.result.reason === 'operation-complete'
      && getXenoTrialsGroundingDoorV223(match)?.phase === 'open' && events.some(event => event.type === 'operation-objective-v188'
        && event.operationId === reactor.id && event.objectiveId === exitPost.id && event.tick >= activation + reactor.groundingOpeningTicksV223)) advance();
    else if (match.result) fail();
  }

  function cue() {
    if (index() === 0) return reactorCue;
    if (index() === 1) return arcCue;
    if (index() === 2) return getXenoTrialsGroundingDoorV223(match).phase === 'open' ? exitCue : doorCue;
    return '';
  }

  return { observe, cue, opponentInput: () => null, observesResult: true };
}

const exercises = new Map([
  ['aimed-acid-timing', createAimedAcidTiming], ['horde-sweep', createHordeSweep], ['reactor-lure', createReactorLure],
]);

export function createXenoTrialsPracticeGoalsV225(id, match, progress) {
  const create = exercises.get(id);
  if (!create) return null;
  const exercise = create(match, progress);
  let lastEvent = match.serial;
  function observe(_input, activeTick) {
    if (!activeTick) return;
    if (match.phase === 'match-over' && !exercise.observesResult) { progress.retry(); return; }
    const events = match.events.filter(event => event.id > lastEvent);
    lastEvent = match.serial;
    exercise.observe(events);
  }
  return { ...exercise, observe };
}
