import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_STEP_V96 } from './xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207, getXenoTrialsStrikeBandV207 } from './xeno-trials-moveset-v207.js';
import { getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';

const id = 'spacing-punish';
const contactTypes = new Set(['hit', 'block', 'guard-break', 'parry-v208']);
export const XENO_TRIALS_NEW_DRILLS_V217 = Object.freeze([Object.freeze({
  id,
  title: 'Punir une frappe manquée',
  briefing: 'Laissez le Warrior armer sa frappe lourde. Reculez juste hors de portée, puis revenez frapper avec Rapide avant la fin de sa récupération.',
  objectives: Object.freeze([
    'Attendre une frappe lourde à portée',
    'Reculer hors de portée avant le contact',
    'Toucher avec Rapide pendant la récupération',
  ]),
  playerId: 'runner', opponentId: 'warrior', pressure: 'heavy', approachV212: 76, noSpecial: true,
})]);

export function createXenoTrialsPracticeGoalsV217(lessonId, match, { index, advance, retry }) {
  if (lessonId !== id) return null;
  const [player, opponent] = match.fighters;
  const definition = getXenoTrialsFighterV96(opponent.id);
  const heavy = getXenoTrialsAttackV147(definition, 'heavy', XENO_TRIALS_ATTACKS_V96.heavy);
  const reach = heavy.reach * definition.reach;
  const contactEnd = heavy.startup + heavy.active;
  const recoveryEnd = contactEnd + heavy.recovery;
  let lastEvent = match.serial;
  let incoming = null, before = null, punishId = null;

  function inReach(direction) {
    const body = getXenoTrialsBodyBoundsV105(opponent);
    const hurt = getXenoTrialsHurtBoundsV207(player);
    const band = getXenoTrialsStrikeBandV207(body, heavy);
    return (hurt.center - body.center) * direction >= 0
      && getXenoTrialsBodyGapV105(opponent, player, direction) <= reach
      && band.bottom <= hurt.top && hurt.bottom <= band.top;
  }

  function beforeStep() {
    const attack = opponent.attack;
    before = index() === 2 && attack && attack.id === incoming?.id && attack.age >= contactEnd
      && attack.age + XENO_TRIALS_STEP_V96 < recoveryEnd ? match.tick + 1 : null;
  }

  function observe(_input, activeTick) {
    if (!activeTick) return;
    for (const event of match.events) {
      if (event.id <= lastEvent) continue;
      lastEvent = event.id;
      if (index() === 0 && event.type === 'attack' && event.side === 'opponent' && event.kind === 'heavy') {
        const attack = opponent.attack;
        if (!attack || attack.kind !== 'heavy' || player.y > 0 || !inReach(attack.facing)) continue;
        incoming = { id: attack.id, x: player.x, direction: attack.facing };
        advance();
      }
      if (!incoming) continue;
      // Taking, blocking, or parrying the heavy is contact. Only a clean miss
      // followed by a fresh light during that attack's recovery can count.
      if (event.side === 'player' && event.attacker === 'opponent' && contactTypes.has(event.type)) {
        retry();
        return;
      }
      if (index() !== 2 || before !== match.tick) continue;
      if (event.type === 'attack' && event.side === 'player' && event.kind === 'light'
        && player.attack?.kind === 'light' && player.attack.id === event.id - 1) punishId = player.attack.id;
      if (event.type === 'hit' && event.side === 'opponent' && event.attacker === 'player'
        && punishId !== null && player.attack?.id === punishId && player.attack.hit) {
        advance();
        return;
      }
    }
    if (match.phase === 'match-over') { retry(); return; }
    if (!incoming) return;
    const attack = opponent.attack;
    if (attack?.id !== incoming.id) { retry(); return; }
    if (index() === 1 && attack.age >= contactEnd) {
      const distance = (player.x - incoming.x) * incoming.direction;
      const gap = getXenoTrialsBodyGapV105(opponent, player, incoming.direction);
      if (!attack.hit && distance >= 6 && gap > reach && player.y === 0) advance();
      else retry();
    }
  }

  function cue() {
    if (index() === 1) return 'RECULEZ';
    if (index() === 2) return 'RAPIDE MAINTENANT';
    return '';
  }

  return { beforeStep, observe, cue };
}
