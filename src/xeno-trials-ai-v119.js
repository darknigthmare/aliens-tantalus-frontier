import { resolveEnemyBehaviorV119 } from './enemy-behavior-registry-v119.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105, XENO_TRIALS_ARENA_V105 } from './xeno-trials-geometry-v105.js';
import { getSynthTrialAttackV110 } from './synth-combat-v110.js';

export const XENO_TRIALS_AI_STATES_V119 = Object.freeze(['OBSERVE', 'APPROACH', 'PROBE', 'PRESSURE', 'RETREAT', 'EVADE', 'DEFEND', 'PUNISH', 'COMMIT_ATTACK', 'RECOVERY', 'REPOSITION', 'SPECIAL_SETUP']);
const empty = () => ({ left: false, right: false, jump: false, guard: false, light: false, heavy: false, special: false });
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
export function getXenoTrialsAIProfileV119(definition) {
  const resolved = resolveEnemyBehaviorV119({ ...definition, id: definition.profileId, biology: definition.family });
  const profile = { ...resolved.trials, aiProfile: resolved.aiProfile, behaviorStatus: resolved.behaviorStatus };
  // Arena attacks are known gameplay mechanics, not evidence of a species' lore.
  const ranged = ['pulse', 'acid', 'flame'].includes(definition.special);
  if (ranged) Object.assign(profile, { preferredRange: definition.special === 'flame' ? 150 : 275, minimumRange: definition.special === 'flame' ? 45 : 110,
    // A cone is not a projectile. Its real, unscaled reach is the shared attack
    // contract, so the Incinerator must close instead of firing beyond 190 px.
    maximumRange: definition.special === 'flame' ? getSynthTrialAttackV110(definition, 'special', {}).reach : 580, specialUsage: .8 });
  if (['ram', 'pounce'].includes(definition.special)) profile.specialUsage = Math.max(profile.specialUsage, .7);
  if (definition.role === 'tank') profile.jumpUsage = 0;
  return Object.freeze({ ...profile, ranged, canGuard: profile.guardProbability > 0, jumpUsage: definition.role === 'tank' ? 0 : profile.jumpUsage });
}
export function createXenoTrialsBrainV119() {
  return { schema: 119, state: 'OBSERVE', stateTime: 0, decisionIn: 0, input: empty(), observation: null,
    guardRemaining: 0, lastAttackId: null, decisions: 0, stateVisits: { OBSERVE: 1 } };
}
const transition = (brain, state) => {
  if (brain.state !== state) { brain.state = state; brain.stateTime = 0; brain.stateVisits[state] = (brain.stateVisits[state] || 0) + 1; }
};
function observe(match, specs) {
  const [target, cpu] = match.fighters, own = getXenoTrialsFighterV96(cpu.id), other = getXenoTrialsFighterV96(target.id);
  const selfBody = getXenoTrialsBodyBoundsV105(cpu), targetBody = getXenoTrialsBodyBoundsV105(target);
  const direction = targetBody.center >= selfBody.center ? 1 : -1;
  const gap = Math.max(0, getXenoTrialsBodyGapV105(cpu, target, direction));
  const overlap = selfBody.bottom <= targetBody.top && targetBody.bottom <= selfBody.top;
  const shotY = cpu.y + selfBody.height * .55;
  const coneSpread = own.special === 'flame' ? 12 + getSynthTrialAttackV110(own, 'special', {}).reach * .22 : 0;
  const lane = shotY + coneSpread >= targetBody.bottom && shotY - coneSpread <= targetBody.top;
  const attackSpec = target.attack ? getSynthTrialAttackV110(other, target.attack.kind, specs[target.attack.kind]) : null;
  const attack = target.attack ? { id: target.attack.id, kind: target.attack.kind, age: target.attack.age,
    startup: attackSpec.startup, active: attackSpec.active, recovery: attackSpec.recovery,
    reach: attackSpec.reach * other.reach, facing: target.attack.facing } : null;
  const projectileThreat = match.projectiles.some(p => p.owner !== cpu.side && p.life > 0
    && p.y >= selfBody.bottom && p.y <= selfBody.top && (selfBody.center - p.x) * p.direction > 0
    && Math.abs(selfBody.center - p.x) < 300);
  return { gap, direction, overlap, lane, attack, projectileThreat, targetAirborne: target.y > 1,
    frontOffset: direction > 0 ? selfBody.right - cpu.x : cpu.x - selfBody.left,
    detonationVerticalGap: Math.max(0, targetBody.bottom - (cpu.y + selfBody.height * .5), (cpu.y + selfBody.height * .5) - targetBody.top),
    heightRatio: targetBody.height / Math.max(1, selfBody.height), selfHeight: selfBody.height,
    roomBehind: direction > 0 ? cpu.x - XENO_TRIALS_ARENA_V105.left : XENO_TRIALS_ARENA_V105.right - cpu.x,
    own, targetHp: target.hp, ownHp: cpu.hp, ownStamina: cpu.stamina, grounded: cpu.y === 0,
    targetRecovering: Boolean(attack && attack.age >= attack.startup + attack.active), tick: match.tick };
}

/** A deterministic visible-state brain. It receives no player controls or future
 * inputs, changes no damage/health, and feeds the SAME input/attack engine as J1.
 * Reaction age, resource discipline, spatial reading and mistakes distinguish
 * difficulty. Idle/release decisions explicitly rearm edge-triggered attacks. */
export function stepXenoTrialsBrainV119(match, dt, specs, random) {
  const brain = match.ai?.schema === 119 ? match.ai : (match.ai = createXenoTrialsBrainV119());
  brain.stateTime += dt; brain.decisionIn -= dt; brain.guardRemaining = Math.max(0, brain.guardRemaining - dt);
  const cpu = match.fighters[1], definition = getXenoTrialsFighterV96(cpu.id), profile = getXenoTrialsAIProfileV119(definition);
  if (brain.input.guard && brain.guardRemaining <= 0) brain.input = empty();
  if (brain.decisionIn > 0) return brain.input;
  const difficulty = match.config.difficulty, delay = profile.reactionTime * (difficulty === 'easy' ? 1.6 : difficulty === 'hard' ? .65 : 1);
  brain.decisionIn = clamp(delay, .12, .7); brain.decisions++;
  const view = observe(match, specs), next = empty(); brain.observation = view;
  const move = toward => { next[(toward ? view.direction : -view.direction) > 0 ? 'right' : 'left'] = true; };
  const choose = kind => {
    const spec = getSynthTrialAttackV110(definition, kind, specs[kind]);
    const lock = match.config.rulesV119;
    const specialLocked = kind === 'special' && (lock?.noSpecial || match.config.roundSeconds - match.timeRemaining < (lock?.specialLockSeconds || 0));
    if (specialLocked || cpu.stamina < spec.cost || (kind === 'special' && cpu.specialCooldown > 0) || brain.input[kind]) return false;
    next[kind] = true; transition(brain, kind === 'special' ? 'SPECIAL_SETUP' : 'COMMIT_ATTACK'); return true;
  };
  const light = getSynthTrialAttackV110(definition, 'light', specs.light), heavy = getSynthTrialAttackV110(definition, 'heavy', specs.heavy);
  const reach = light.reach * definition.reach, heavyReach = heavy.reach * definition.reach;
  const withinMelee = view.overlap && view.gap <= heavyReach;
  const special = getSynthTrialAttackV110(definition, 'special', specs.special);
  const detonationHorizontalReach = Math.sqrt(Math.max(0, special.reach ** 2 - view.detonationVerticalGap ** 2));
  const specialReach = definition.special === 'detonation'
    // Radial damage starts at the robot centre, NOT its leading body edge.
    // Account for that measured offset and one decision/step safety margin.
    ? detonationHorizontalReach - view.frontOffset + 410 * special.chargeDuration - 12
    : special.reach * definition.reach + (['ram', 'pounce'].includes(definition.special) ? 420 * special.active : 0);
  const resourceLow = cpu.stamina < Math.max(light.cost * 1.5, 25);
  const error = difficulty === 'easy' ? .2 : difficulty === 'hard' ? .025 : .08;
  if (cpu.attack || cpu.stun > 0) transition(brain, 'RECOVERY');
  else if (random() < error) transition(brain, 'OBSERVE');
  else if (resourceLow || (cpu.hp / definition.hp < profile.retreatThreshold && cpu.stamina < 55 && view.gap < 80)) {
    transition(brain, view.roomBehind > 35 ? 'RETREAT' : 'REPOSITION');
    if (view.roomBehind > 35 && view.gap < 150) move(false);
  } else if ((view.attack && view.attack.age >= delay && view.attack.age < view.attack.startup + view.attack.active
    && view.gap <= view.attack.reach + 25 && (cpu.x - match.fighters[0].x) * view.attack.facing >= 0) || view.projectileThreat) {
    // No permanent guard: finite decision-sized windows drain the ordinary pool.
    if (profile.canGuard && cpu.y === 0 && random() < profile.guardProbability) {
      transition(brain, 'DEFEND'); next.guard = true; brain.guardRemaining = Math.min(.34, delay);
    } else {
      transition(brain, 'EVADE');
      if (view.roomBehind > 35) move(false);
      if (view.grounded && view.selfHeight < 260 && random() < profile.jumpUsage && view.projectileThreat) next.jump = true;
    }
  } else if (view.targetRecovering && withinMelee && random() < profile.punishAwareness * (difficulty === 'easy' ? .5 : 1)) {
    transition(brain, 'PUNISH'); if (!choose(view.gap <= reach ? 'light' : 'heavy')) move(true);
  } else if (profile.ranged && view.lane && view.gap >= profile.minimumRange && view.gap <= profile.maximumRange) {
    transition(brain, 'SPECIAL_SETUP');
    if (!choose('special')) {
      transition(brain, 'REPOSITION');
      if (view.gap < profile.preferredRange - 45 && view.roomBehind > 35) move(false);
      else if (view.gap > profile.preferredRange + 55) move(true);
    }
  } else if (profile.ranged && !view.lane) {
    // A tall rifleman cannot fire forever above a facehugger's body. Close into
    // valid melee instead. Projectiles still keep their real fixed trajectory.
    transition(brain, 'APPROACH');
    if (view.gap > reach || !view.overlap) move(true); else choose('light');
  } else if (view.gap > reach && view.gap <= specialReach && view.overlap && !profile.ranged
    && random() < profile.specialUsage && choose('special')) { /* announced ordinary special */ }
  else if (view.targetAirborne && !view.overlap && view.gap < 180 && profile.antiAirAwareness > .6) {
    transition(brain, 'REPOSITION');
    if (view.roomBehind > 35) move(false);
    // Read the visible jump, not its triggering input. Heavy bodies stay grounded.
    if (view.grounded && view.selfHeight < 260 && random() < profile.jumpUsage) next.jump = true;
  } else if (withinMelee) {
    transition(brain, view.gap <= reach ? 'PRESSURE' : 'PROBE');
    if (view.targetAirborne && view.heightRatio > 1.2 && !view.overlap) transition(brain, 'OBSERVE');
    else if (view.gap <= reach) {
      if (random() < profile.aggression) choose(cpu.stamina > 60 && random() < profile.comboPressure && view.gap <= heavyReach ? 'heavy' : 'light');
      else transition(brain, 'PROBE');
    }
    else choose('heavy');
  } else {
    transition(brain, 'APPROACH'); move(true);
    if (view.grounded && view.selfHeight < 260 && view.gap > 150 && view.gap < 280 && random() < profile.jumpUsage) next.jump = true;
  }
  brain.input = next; return next;
}
