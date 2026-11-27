import { getXenoTrialsCasteV151 } from './xeno-trials-castes-v151.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsOperationViewV188, XENO_TRIALS_BEACON_OPERATION_V219 } from './xeno-trials-operations-v188.js';
import { getXenoTrialsSuperReadinessV148, getXenoTrialsSuperV148, XENO_TRIALS_SUPER_METER_V148 } from './xeno-trials-supers-v148.js';

const warden = 'import-game-afe2-warden';
const battery = XENO_TRIALS_BEACON_OPERATION_V219;
const jumpCue = 'SAUTEZ SUR PLACE';
const holdSuperCue = 'APPUYEZ SUR SUPER ET MAINTENEZ';
const waitLandingCue = 'MAINTENEZ SUPER JUSQU’À LA RÉCEPTION';
const rearmSuperCue = 'RELÂCHEZ PUIS RÉAPPUYEZ SUR SUPER';
const burstCue = 'TIREZ À DISTANCE DE LA GERBE';
const backCue = 'ÉLOIGNEZ-VOUS DU BURSTER';
const watchBurstCue = 'RESTEZ HORS DE PORTÉE DE LA GERBE';
const greenCue = 'BALISE VERTE · MAINTENEZ INTERACTION';
const closedCue = 'BALISE FERMÉE · ATTENDEZ OU CHANGEZ DE POSTE';

function drill(id, title, briefing, objectives, options) {
  return Object.freeze({ id, title, briefing, objectives: Object.freeze(objectives), ...options });
}

export const XENO_TRIALS_NEW_DRILLS_V224 = Object.freeze([
  drill('super-rearm', 'Réarmer un Super après le saut',
    'Sautez sur place et maintenez Super en l’air jusqu’à la réception. Une fois au sol, relâchez la commande puis appuyez de nouveau pour toucher avec le barrage.',
    ['Sauter avec la jauge de Super pleine', 'Tenter Super en l’air sans dépenser la jauge', 'Atterrir avec Super maintenu et la jauge intacte', 'Réappuyer au sol et toucher avec le barrage'],
    { playerId: warden, opponentId: 'warrior' }),
  drill('burster-range', 'Neutraliser le Burster hors de sa gerbe',
    'Avec le Synth Trooper, lancez Spécial depuis la ligne de départ. Restez à distance pendant le trajet du projectile et la gerbe qui suit le KO.',
    ['Lancer le tir hors de portée de la gerbe', 'Laisser le projectile atteindre le Burster', 'Survivre à sa gerbe après le KO'],
    { playerId: 'synth-trooper', opponentId: 'burster', singleHit: true }),
  drill('battery-route', 'Synchroniser trois balises sur batterie',
    'Choisissez votre première balise et maintenez Interaction pendant sa fenêtre verte. Une fois la batterie lancée, synchronisez les deux autres avant son épuisement.',
    ['Synchroniser une balise pour démarrer la batterie', 'Synchroniser une autre balise pendant sa fenêtre verte', 'Verrouiller la dernière balise avant l’épuisement'],
    { operationIdV212: battery.id, hordeProtocolId: battery.hordeProtocolId }),
]);

function attackReceipt(events, fighter, kind) {
  if (fighter.attack?.kind !== kind) return null;
  return events.find(event => event.type === 'attack' && event.kind === kind
    && event.side === fighter.side && event.id === fighter.attack.id + 1);
}

const isHitBy = (event, side) => event.type === 'hit' && event.attacker === side;

function createSuperRearm(match, { index, advance, retry }) {
  const [player] = match.fighters;
  const definition = getXenoTrialsFighterV96(player.id);
  const move = getXenoTrialsSuperV148(definition);
  const fullMeter = XENO_TRIALS_SUPER_METER_V148.maximum;
  player.superMeterV148 = fullMeter;
  let attemptedInAir = false, released = false, cast = null, approaching = [];
  const shots = () => match.projectiles.filter(shot => shot.owner === 'player' && shot.superIdV148 === move.id);

  function beforeStep(input) {
    attemptedInAir = player.y > 0 && input?.super === true && !player.previousInput.super
      && getXenoTrialsSuperReadinessV148(match, player, definition).reason === 'busy';
    approaching = cast === null ? [] : shots();
  }

  function observe(events) {
    if (index() < 3 && player.superMeterV148 !== fullMeter) { retry(); return; }
    if (index() === 0 && player.y > 0 && player.vy > 0) advance();
    if (index() === 1 && attemptedInAir && player.y > 0 && player.previousInput.super && !player.attack) advance();
    if (index() === 2) {
      if (!player.previousInput.super || player.attack) { retry(); return; }
      if (getXenoTrialsSuperReadinessV148(match, player, definition).ready) advance();
    }
    if (index() === 3) {
      if (!player.previousInput.super) released = true;
      const attack = attackReceipt(events, player, 'super');
      if (released && attack?.superIdV148 === move.id && player.y === 0 && player.superMeterV148 === 0) cast = player.attack.id;
    }
    if (events.some(event => isHitBy(event, 'player'))) {
      if (index() === 3 && player.attack?.id === cast && approaching.some(shot => !match.projectiles.includes(shot))) advance();
      else retry();
    } else if (cast !== null && player.attack?.id !== cast && !shots().length) retry();
  }

  function cue() {
    if (index() === 0 || (index() === 1 && player.y === 0)) return jumpCue;
    if (index() === 1) return holdSuperCue;
    if (index() === 2) return waitLandingCue;
    if (index() === 3 && cast === null) return rearmSuperCue;
    return '';
  }

  return { beforeStep, observe, cue };
}

function distanceToBody(x, y, body) {
  const dx = x - Math.max(body.left, Math.min(body.right, x));
  const dy = y - Math.max(body.bottom, Math.min(body.top, y));
  return Math.hypot(dx, dy);
}

function createBursterRange(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const burst = getXenoTrialsCasteV151(getXenoTrialsFighterV96(opponent.id)).deathBurst;
  let launch = null, beforeShot = null;

  function safeDistance() {
    const target = getXenoTrialsBodyBoundsV105(opponent);
    return distanceToBody(target.center, target.bottom + target.height / 2, getXenoTrialsBodyBoundsV105(player)) > burst.radius;
  }

  function beforeStep() {
    beforeShot = launch === null ? null : match.projectiles.find(shot => shot.id === launch && shot.owner === 'player' && shot.style === 'pulse');
  }

  function observe(events) {
    if (index() === 0 && attackReceipt(events, player, 'special') && safeDistance()) {
      launch = player.attack.id;
      advance();
    }
    const currentShot = launch !== null && match.projectiles.some(shot => shot.id === launch && shot.owner === 'player' && shot.style === 'pulse');
    const discharge = events.find(event => event.type === 'burster-death-v151' && event.side === 'opponent');
    if (discharge) {
      const shotContact = index() === 1 && beforeShot && !currentShot && events.some(event => isHitBy(event, 'player')
        && event.side === 'opponent' && event.id < discharge.id && event.tick === discharge.tick);
      if (!shotContact) { retry(); return; }
      advance();
      const body = getXenoTrialsBodyBoundsV105(player);
      if (player.hp > 0 && match.result?.winner === 'player' && distanceToBody(discharge.x, discharge.y, body) > discharge.radius) advance();
      else retry();
      return;
    }
    if (match.result || (index() === 1 && !currentShot && (beforeShot || player.attack?.id !== launch))) retry();
  }

  function cue() {
    if (index() === 0) return safeDistance() ? burstCue : backCue;
    if (index() === 1) return watchBurstCue;
    return '';
  }

  return { beforeStep, observe, cue, observesResult: true };
}

function createBatteryRoute(match, { index, advance, retry }) {
  const synchronized = new Set();

  function observe(events) {
    const objective = events.find(event => event.type === 'operation-objective-v188' && event.operationId === battery.id);
    if (objective && !synchronized.has(objective.objectiveId)) {
      const view = getXenoTrialsOperationViewV188(match);
      if (view.batteryV219.remainingTicks <= 0 || (index() === 0 && match.operationV188.batteryStartedTickV219 !== objective.tick)) {
        retry();
        return;
      }
      synchronized.add(objective.objectiveId);
      if (index() < 2 || (match.result?.winner === 'player' && match.result.reason === 'operation-complete'
        && events.some(event => event.type === 'operation-complete-v188' && event.operationId === battery.id))) advance();
    }
    if (match.result && index() < battery.objectives.length) retry();
  }

  function cue() {
    const view = getXenoTrialsOperationViewV188(match);
    if (match.result || !view.target) return '';
    return view.target.windowOpen ? greenCue : closedCue;
  }

  return { observe, cue, opponentInput: () => null, observesResult: true };
}

const exercises = new Map([
  ['super-rearm', createSuperRearm], ['burster-range', createBursterRange], ['battery-route', createBatteryRoute],
]);

export function createXenoTrialsPracticeGoalsV224(id, match, progress) {
  const create = exercises.get(id);
  if (!create) return null;
  const exercise = create(match, progress);
  let lastEvent = match.serial;
  function observe(input, activeTick) {
    if (!activeTick) return;
    if (match.phase === 'match-over' && !exercise.observesResult) { progress.retry(); return; }
    const events = match.events.filter(event => event.id > lastEvent);
    lastEvent = match.serial;
    exercise.observe(events, input);
  }
  return { ...exercise, observe };
}
