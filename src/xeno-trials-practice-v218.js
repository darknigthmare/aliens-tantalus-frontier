import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_STEP_V96 } from './xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207, getXenoTrialsLowScaleV207 } from './xeno-trials-moveset-v207.js';
import { getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';

function drill(id, title, briefing, objectives, options) {
  return Object.freeze({ id, title, briefing, objectives: Object.freeze(objectives), ...options });
}

export const XENO_TRIALS_NEW_DRILLS_V218 = Object.freeze([
  drill('air-interrupt', 'Couper une attaque en descente',
    'Laissez la Reine sauter. Préparez Anti-air pendant sa descente pour toucher au début de son attaque.',
    ['Attendre le saut de la Reine', 'Laisser commencer la frappe en descente', 'Interrompre cette frappe avec Anti-air'],
    { playerId: 'warrior', opponentId: 'queen', noSpecial: true }),
  drill('pulse-duck', 'Se baisser sous un tir',
    'Restez sur place. Quand le Xenoborg tire, maintenez Bas jusqu’à ce que le projectile ait traversé votre position.',
    ['Observer le départ du tir', 'Laisser passer le projectile en restant accroupi'],
    { playerId: 'synth-trooper', opponentId: 'xenoborg', pressure: 'special', stationary: true }),
  drill('shield-punish', 'Riposter sous le bouclier',
    'Bloquez la frappe du synthétique de confinement. Quand il récupère, relâchez Garde, maintenez Bas puis appuyez sur Rapide.',
    ['Laisser le synthétique armer sa frappe de bouclier', 'Bloquer la frappe avec Garde', 'Toucher sous le bouclier avec Bas et Rapide'],
    { playerId: 'runner', opponentId: 'synth-containment', pressure: 'special', approachV212: 28 }),
]);

const contactKinds = new Set(['hit', 'block', 'guard-break', 'parry-v208']);
function contactBy(events, attacker) {
  return events.find(event => event.attacker === attacker && contactKinds.has(event.type));
}

// An actual attack start emits a receipt immediately after the native attack ID.
function attackStarted(events, fighter, kind) {
  return fighter.attack?.kind === kind && events.some(event => event.type === 'attack' && event.kind === kind
    && event.side === fighter.side && event.id === fighter.attack.id + 1);
}

function createAirInterruption(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const air = getXenoTrialsAttackV147(getXenoTrialsFighterV96(opponent.id), 'air-hit');
  const descentCueHeight = 101, launchHeight = 86;
  let launched = false, descentSent = false, incomingId = null, interruptTick = null;

  function opponentInput() {
    if (match.phase !== 'active') return {};
    if (!launched) {
      if (getXenoTrialsBodyGapV105(opponent, player) > 26)
        return player.x < opponent.x ? { left: true } : { right: true };
      if (opponent.y === 0 && opponent.stun === 0 && !opponent.attack) {
        launched = true;
        return { jump: true };
      }
    } else if (!descentSent && opponent.y > 0 && opponent.y <= launchHeight && opponent.vy < 0) {
      descentSent = true;
      return { light: true };
    }
    return {};
  }

  function beforeStep() {
    const attack = opponent.attack;
    interruptTick = incomingId !== null && attack?.id === incomingId && opponent.y > 0
      && attack.age + XENO_TRIALS_STEP_V96 < air.startup ? match.tick + 1 : null;
  }

  function observe(events) {
    if (index() === 0 && launched && opponent.y > 0 && opponent.vy > 0) advance();
    if (index() === 1 && attackStarted(events, opponent, 'air-hit')) {
      incomingId = opponent.attack.id;
      advance();
    }
    if (contactBy(events, 'opponent')) { retry(); return; }
    const strike = contactBy(events, 'player');
    if (strike) {
      if (index() === 2 && strike.type === 'hit' && interruptTick === match.tick
        && player.attack?.kind === 'anti-air' && player.attack.hit && opponent.attack === null) advance();
      else retry();
      return;
    }
    if (index() > 0 && (opponent.y === 0 || index() === 2 && opponent.attack?.age >= air.startup)) retry();
  }

  function cue() {
    if (index() === 2 || (index() === 1 && opponent.vy < 0 && opponent.y <= descentCueHeight)) return 'PRÉPAREZ L’ANTI-AIR';
    return '';
  }

  return { beforeStep, opponentInput, observe, cue };
}

function createPulseDuck(match, { index, advance, retry }) {
  const [player] = match.fighters;
  let flight = null;

  function observe(events) {
    if (contactBy(events, 'opponent')) { retry(); return; }
    const standing = getXenoTrialsBodyBoundsV105(player);
    if (index() === 0 && player.y === 0) {
      const pulse = match.projectiles.find(shot => shot.owner === 'opponent' && shot.style === 'pulse'
        && shot.y > standing.height * getXenoTrialsLowScaleV207(standing) && shot.y <= standing.top
        && (shot.direction > 0 ? shot.x < standing.left - 9 : shot.x > standing.right + 9));
      if (pulse) {
        flight = { id: pulse.id, x: player.x };
        advance();
      }
    }
    if (!flight) return;
    const shot = match.projectiles.find(projectile => projectile.id === flight.id);
    if (!shot || player.y !== 0 || Math.abs(player.x - flight.x) > 3) { retry(); return; }
    if (shot.direction > 0 ? shot.x <= standing.right + 9 : shot.x >= standing.left - 9) return;
    const low = getXenoTrialsHurtBoundsV207(player);
    if (player.movesetV207?.low && shot.y > low.top && shot.y <= standing.top) advance();
    else retry();
  }

  return { observe, cue: () => index() === 1 ? 'MAINTENEZ BAS' : '' };
}

function createShieldPunish(match, { index, advance, retry }) {
  const [player, opponent] = match.fighters;
  const shield = getXenoTrialsAttackV147(getXenoTrialsFighterV96(opponent.id), 'special', XENO_TRIALS_ATTACKS_V96.special);
  const recovery = shield.startup + shield.active;
  const end = recovery + shield.recovery;
  let incomingId = null, recoveryTick = null, lowId = null;

  function beforeStep() {
    const attack = opponent.attack;
    recoveryTick = incomingId !== null && attack?.id === incomingId && attack.age >= recovery
      && attack.age + XENO_TRIALS_STEP_V96 < end ? match.tick + 1 : null;
  }

  function observe(events) {
    if (index() === 0 && attackStarted(events, opponent, 'special')) {
      incomingId = opponent.attack.id;
      advance();
    }
    if (incomingId === null) return;
    const bash = contactBy(events, 'opponent');
    if (bash) {
      if (index() === 1 && bash.type === 'block' && opponent.attack?.id === incomingId) advance();
      else { retry(); return; }
    }
    const recoveryOpen = recoveryTick === match.tick;
    if (index() === 2 && recoveryOpen && attackStarted(events, player, 'low')) lowId = player.attack.id;
    const strike = contactBy(events, 'player');
    if (strike) {
      if (index() === 2 && recoveryOpen && strike.type === 'hit' && player.attack?.id === lowId
        && player.attack.hit && opponent.attack === null) advance();
      else retry();
      return;
    }
    if (opponent.attack?.id !== incomingId) retry();
  }

  function cue() {
    if (index() === 1) return 'MAINTENEZ GARDE';
    if (index() === 2 && opponent.attack?.age >= recovery) return 'BAS ET RAPIDE MAINTENANT';
    return '';
  }

  return { beforeStep, observe, cue };
}

const exercises = new Map([
  ['air-interrupt', createAirInterruption], ['pulse-duck', createPulseDuck], ['shield-punish', createShieldPunish],
]);

export function createXenoTrialsPracticeGoalsV218(id, match, progress) {
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
