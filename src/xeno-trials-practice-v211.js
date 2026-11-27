import { getXenoTrialsGroundRecoveryV211 } from './xeno-trials-defense-v211.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsSuperV148, XENO_TRIALS_SUPER_METER_V148 } from './xeno-trials-supers-v148.js';

const drill = (id, title, briefing, objectives, options = {}) => Object.freeze({
  id, title, briefing, objectives: Object.freeze(objectives), ...options,
});
export const XENO_TRIALS_NEW_DRILLS_V211 = Object.freeze([
  drill('super-interrupt', 'Interrompre le barrage', 'Le Warden a la jauge pleine. Interrompez son super par une frappe légère avant le premier tir.',
    ['Observer le débit du super', 'Interrompre le Warden', 'Attendre la fin de la fenêtre sans dégât tardif'],
    { opponentId: 'import-game-afe2-warden', pressure: 'super' }),
  drill('outro-skip', 'Clore une victoire', 'Remportez le duel à un point de vie, puis passez la présentation finale.',
    ['Obtenir un verdict de victoire', 'Passer la présentation finale'],
    { singleHit: true, playerId: 'prowler', opponentId: 'import-game-dd-wy-commando' }),
  drill('horde-reinforcements', 'Tenir jusqu’aux renforts', 'Neutralisez les cinq contacts de la première vague. Restez dans l’arène jusqu’à l’arrivée de la seconde.',
    ['Neutraliser la première vague', 'Voir les renforts entrer dans l’arène'], { hordeProtocolId: 'xth180-incoming-1' }),
  drill('air-contact', 'Frappe en descente', 'Approchez la Reine avec le Runner. Sautez à portée, puis frappez léger pendant la descente.',
    ['Déclencher une frappe en descente', 'Toucher la cible avec cette frappe'], { playerId: 'runner', opponentId: 'queen' }),
  drill('guard-recovery', 'Se relever après une rupture', 'Tenez la garde jusqu’à sa rupture. Relâchez ensuite Garde et réarmez-la à l’approche du redressement.',
    ['Subir la rupture de garde', 'Se relever par un nouvel appui sur Garde'], { pressure: 'heavy' }),
]);
const ids = new Set(XENO_TRIALS_NEW_DRILLS_V211.map(entry => entry.id));
const FIXED_STEP = 1 / 120;

export function createXenoTrialsPracticeGoalsV211(id, match, { index, advance, retry }) {
  if (!ids.has(id)) return null;
  const [player, opponent] = match.fighters;
  if (id === 'super-interrupt') opponent.superMeterV148 = XENO_TRIALS_SUPER_METER_V148.maximum;
  if (id === 'guard-recovery') player.stamina = 34;
  const superSpec = id === 'super-interrupt' ? getXenoTrialsSuperV148(getXenoTrialsFighterV96(opponent.id)).spec : null;
  let lastEvent = match.serial, queued = null, before = null, airAttackId = null;
  let outroResolved = false;

  function beforeStep() {
    if (id === 'super-interrupt' && opponent.attack?.kind === 'super') {
      before = { id: opponent.attack.id, age: opponent.attack.age };
    } else before = null;
  }
  function observeEvent(event) {
    if (id === 'super-interrupt') {
      if (index() === 0 && event.type === 'attack' && event.side === 'opponent' && event.kind === 'super' && opponent.superMeterV148 === 0) {
        queued = { id: event.id - 1, closes: event.tick + Math.ceil((superSpec.startup + superSpec.active) / FIXED_STEP) };
        advance();
      }
      if (index() === 1 && event.type === 'hit' && event.attacker === 'player' && event.side === 'opponent'
        && before && before.id === queued?.id && before.age + FIXED_STEP < superSpec.startup && !opponent.attack) advance();
      if (index() > 0 && event.side === 'player' && event.attacker === 'opponent' && event.damage > 0) retry();
    }
    if (id === 'air-contact') {
      if (event.type === 'attack' && event.side === 'player') {
        airAttackId = event.kind === 'air-hit' ? event.id - 1 : null;
        if (airAttackId && index() === 0) advance();
      }
      if (index() === 1 && airAttackId && player.attack?.id === airAttackId && event.type === 'hit'
        && event.attacker === 'player' && event.side === 'opponent') advance();
    }
    if (id === 'guard-recovery') {
      if (index() === 0 && event.type === 'guard-break' && event.side === 'player' && event.attacker === 'opponent') advance();
      if (index() === 1 && event.type === 'get-up-v211' && event.side === 'player') advance();
    }
  }
  function observe() {
    if (id === 'horde-reinforcements') {
      const horde = match.hordeV180;
      if (index() === 0 && horde.wavesCleared >= 1 && horde.phase === 'intermission') advance();
      if (index() === 1 && horde.wave === 2 && horde.alive > 0) advance();
    }
    if (id === 'outro-skip' && match.result) {
      if (match.result.winner !== 'player') retry();
      else if (index() === 0) advance();
      return;
    }
    for (const event of match.events) {
      if (event.id <= lastEvent) continue;
      lastEvent = event.id;
      observeEvent(event);
    }
    if (id === 'super-interrupt' && index() > 0 && match.projectiles.some(projectile => projectile.owner === 'opponent')) retry();
    if (id === 'super-interrupt' && queued && match.tick >= queued.closes) {
      if (index() === 2) advance();
      else retry();
    }
    if (match.phase === 'match-over') retry();
  }
  function terminalReady() { return id === 'outro-skip' && index() === 1 && !outroResolved && match.result?.winner === 'player'; }
  function closeOutro() {
    if (!terminalReady()) return false;
    outroResolved = true; advance(); return true;
  }
  function cue() {
    if (id === 'super-interrupt' && opponent.attack?.kind === 'super') return 'SUPER ADVERSE EN PRÉPARATION';
    if (id === 'air-contact' && player.y > 0 && player.vy < 0) return 'DESCENTE EN COURS';
    if (id === 'guard-recovery' && index() === 1) {
      const recovery = getXenoTrialsGroundRecoveryV211(match, player);
      if (recovery?.ready) return 'GARDE · MAINTENANT';
      if (recovery) return 'RELÂCHEZ GARDE';
    }
    if (id === 'horde-reinforcements' && match.hordeV180.phase === 'intermission') return 'RENFORTS EN APPROCHE';
    return '';
  }
  return { beforeStep, observe, terminalReady, closeOutro, cue,
    opponentInput: () => id === 'horde-reinforcements' ? null : id === 'guard-recovery' && player.groundRecoveryV211 ? {} : undefined };
}
