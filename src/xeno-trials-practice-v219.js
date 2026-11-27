import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_PARRY_V208 } from './xeno-trials-defense-v208.js';
import { XENO_TRIALS_STEP_V96 } from './xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { XENO_TRIALS_GROUND_RELEASE_V218 } from './xeno-trials-grapple-v153.js';
import { getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsStageHazardViewV188 } from './xeno-trials-stage-hazards-v188.js';

const commando = 'import-game-dd-wy-commando';
const grabId = 'warrior::grab';
const release = XENO_TRIALS_GROUND_RELEASE_V218;
const parry = XENO_TRIALS_PARRY_V208;
const low = XENO_TRIALS_ATTACKS_V96.low;
const grabCue = 'GARDE + LOURDE POUR RELÂCHER';
const retreatCue = 'RECULEZ HORS DE PORTÉE';
const edgeCue = 'PLACEZ-VOUS AU BORD DE LA FUITE';
const vaultCue = 'SAUTEZ PAR-DESSUS LA FUITE';
const parryCue = 'BAS + PARADE MAINTENANT';
const counterCue = 'RELÂCHEZ BAS, PUIS RAPIDE';

function drill(id, title, briefing, objectives, options) {
  return Object.freeze({ id, title, briefing, objectives: Object.freeze(objectives), ...options });
}

export const XENO_TRIALS_NEW_DRILLS_V219 = Object.freeze([
  drill('grab-disengage', 'Rompre sa propre prise',
    'Saisissez le Commando avec Garde et Lourde. Relâchez Lourde, puis appuyez de nouveau au signal en tenant Garde. Reculez après la prise.',
    ['Immobiliser le Commando au sol', 'Relâcher volontairement la même prise', 'Reculer hors de portée de sa frappe rapide'],
    { opponentId: commando }),
  drill('active-hazard-vault', 'Sauter une fuite active',
    'Placez-vous au bord de la fuite. Au signal, sautez vers l’autre bord et maintenez la direction. La garde ne protège pas du sol corrosif.',
    ['Atteindre un bord sûr pendant l’alerte', 'Attendre que la fuite soit active', 'Franchir la bande en un saut sans dégâts au sol'],
    { playerId: 'prowler', operationIdV212: 'xto188-relay-6', hordeProtocolId: 'xth180-blackout-2' }),
  drill('low-parry-counter', 'Parade basse sans capacités spéciales',
    'Gardez Bas pendant que le Runner prépare sa frappe. Appuyez sur Parade juste avant le contact. Relâchez Bas, puis ripostez avec Rapide.',
    ['Lire la préparation de la frappe basse', 'Parer la frappe en restant accroupi', 'Toucher avec Rapide avant la fermeture de l’ouverture'],
    { pressure: 'low', approachV212: 18, noSpecial: true }),
]);

function createGrabDisengage(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const defender = getXenoTrialsFighterV96(opponent.id);
  const reach = getXenoTrialsAttackV147(defender, 'light', XENO_TRIALS_ATTACKS_V96.light).reach * defender.reach;
  let hold = null;

  function observe(events) {
    if (index() === 0 && events.some(event => event.type === 'grapple-start-v153'
      && event.attacker === 'player' && event.side === 'opponent' && event.grabIdV212 === grabId)) {
      const restraint = match.grappleV153;
      hold = { id: restraint.id, facing: restraint.facingV212, born: restraint.bornTick,
        gap: getXenoTrialsBodyGapV105(player, opponent, restraint.facingV212) };
      advance();
    }
    if (index() === 1) {
      const ended = events.find(event => event.type === 'grapple-end-v153' && event.grappleId === hold.id);
      if (!ended) return;
      if (ended.reason !== 'released' || getXenoTrialsBodyGapV105(player, opponent, hold.facing) <= hold.gap) {
        retry();
        return;
      }
      advance();
    }
    if (index() === 2 && !match.grappleV153 && player.y === 0 && player.stun === 0
      && getXenoTrialsBodyGapV105(player, opponent, hold.facing) > reach) advance();
  }

  function cue() {
    if (index() === 1 && match.tick - hold.born >= release.minimumHeldTicks) return grabCue;
    if (index() === 2) return retreatCue;
    return '';
  }

  return { observe, cue, opponentInput: () => match.grappleV153 ? null : {} };
}

function distanceToBand(body, zone, side) {
  return side > 0 ? body.left - zone.right : zone.left - body.right;
}

function createHazardVault(match, { index, advance, retry }) {
  const [player] = match.fighters;
  let prepared = null, groundedBeforeStep = false, vaulted = false;

  function beforeStep() {
    groundedBeforeStep = player.y === 0;
  }

  function observe() {
    const hazard = getXenoTrialsStageHazardViewV188(match);
    const zone = hazard?.zones[0];
    if (hazard?.playerDamage > 0) { retry(); return; }
    if (prepared && (hazard?.cycle !== prepared.cycle || hazard.phase === 'idle')) { retry(); return; }
    if (!zone || hazard.kind !== 'corrosive') return;
    const body = getXenoTrialsBodyBoundsV105(player);
    const side = body.center >= (zone.left + zone.right) / 2 ? 1 : -1;
    const edge = distanceToBand(body, zone, side);
    const nearEdge = body.bottom === 0 && edge >= 0 && edge <= 40;
    if (index() === 0 && hazard.phase === 'warning' && nearEdge) {
      prepared = { cycle: hazard.cycle, side };
      advance();
    }
    if (index() === 1 && hazard.phase === 'active') {
      if (!nearEdge || prepared.side !== side) { retry(); return; }
      advance();
      return;
    }
    if (index() !== 2) return;
    if (groundedBeforeStep && body.bottom > 0) vaulted = true;
    if (!vaulted) return;
    if (body.bottom === 0) { retry(); return; }
    if (distanceToBand(body, zone, -prepared.side) >= 0) advance();
  }

  function cue() {
    if (index() === 0 && getXenoTrialsStageHazardViewV188(match)?.phase === 'warning') return edgeCue;
    if (index() === 2) return vaultCue;
    return '';
  }

  return { beforeStep, observe, cue, opponentInput: () => ({}) };
}

const contactTypes = new Set(['hit', 'block', 'guard-break', 'parry-v208']);

function createLowParryCounter(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  let incoming = null, openingEnd = 0;

  function observe(events) {
    if (index() === 0 && opponent.attack?.kind === 'low' && events.some(event => event.type === 'attack'
      && event.side === 'opponent' && event.id === opponent.attack.id + 1)) {
      incoming = opponent.attack.id;
      advance();
    }
    const threat = events.find(event => event.attacker === 'opponent' && contactTypes.has(event.type));
    if (threat) {
      if (index() === 1 && threat.type === 'parry-v208' && threat.attackIdV208 === incoming && player.movesetV207?.low) {
        openingEnd = threat.tick + parry.openingTicks;
        advance();
      } else { retry(); return; }
    }
    const response = events.find(event => event.attacker === 'player' && contactTypes.has(event.type));
    if (response) {
      if (index() === 2 && response.type === 'hit' && match.tick < openingEnd
        && player.attack?.kind === 'light' && player.attack.hit) advance();
      else retry();
      return;
    }
    if ((index() === 1 && opponent.attack?.id !== incoming) || (index() === 2 && match.tick >= openingEnd)) retry();
  }

  function cue() {
    if (index() === 1 && opponent.attack?.id === incoming) {
      if (opponent.attack.age + (parry.activeTicks - 2) * XENO_TRIALS_STEP_V96 >= low.startup) return parryCue;
      return 'FRAPPE BASSE EN COURS';
    }
    if (index() === 2) return counterCue;
    return '';
  }

  return { observe, cue, opponentInput: () => index() === 2 ? {} : undefined };
}

const exercises = new Map([
  ['grab-disengage', createGrabDisengage], ['active-hazard-vault', createHazardVault], ['low-parry-counter', createLowParryCounter],
]);

export function createXenoTrialsPracticeGoalsV219(id, match, progress) {
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
