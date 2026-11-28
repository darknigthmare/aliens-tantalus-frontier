import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';
import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { XENO_TRIALS_ARENA_V105, getXenoTrialsBodyGapV105,
  getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsSuperMeterV148 } from './xeno-trials-supers-v148.js';
import { clearXenoTrialsMovePoseV207, XENO_TRIALS_MOVE_CONTROLS_V207 } from './xeno-trials-moveset-v207.js';
import { clearXenoTrialsMovementV210 } from './xeno-trials-movement-v210.js';
import { clearXenoTrialsGroundRecoveryV211 } from './xeno-trials-defense-v211.js';
import { clearXenoTrialsParryV208, isXenoTrialsParryingV208 } from './xeno-trials-defense-v208.js';

/** A MIRE exhibition rule, not a canonical ability or an additional fighter.
 * A reserve member enters once, performs its existing grounded light, and
 * withdraws. The engine supplies the SAME stepping/contact/impact algorithms
 * used by active fighters. This module never computes or deducts hit damage.
 * All durations below are simulation steps at the native 120 Hz. */
export const XENO_TRIALS_ASSISTS_V232 = Object.freeze({
  version: 232, meterCost: 25, cooldownTicks: 480, entryTicks: 12,
  exitTicks: 18, maximumTicks: 156, retreatDistance: 86, entryAdvance: 42,
  maximumEntryTravel: 150, exitDistance: 116, attackKind: 'light',
  evidence: 'original-mire-exhibition-rule', canonExact: false
});
const SIDES = ['player', 'opponent'];
const CONTROLS = ['left', 'right', 'jump', 'guard', 'light', 'heavy', 'special', 'super'];
const neutral = () => Object.fromEntries(CONTROLS.map(key => [key, false]));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const opposite = side => side === 'player' ? 'opponent' : 'player';
const teamOf = (match, side) => match?.tagV232?.teams?.[side];
const activeOf = (match, side) => {
  const team = teamOf(match, side);
  return team?.members?.[team.activeIndex] || null;
};
const actorOf = (match, side) => {
  const deployment = match?.assistsV232?.sides?.[side]?.deployment;
  return deployment ? teamOf(match, side)?.members?.[deployment.memberIndex] || null : null;
};
const isExhibition = match => match?.config?.exhibitionV232?.mode === 'tag'
  && match.config.exhibitionV232.assists === true && Boolean(match.tagV232)
  && !match.config.activityV119 && !match.hordeV180 && !match.operationV188
  && !match.practiceV207 && !match.practiceV208 && !match.config.practiceV207;
const stats = () => ({ requests: 0, accepted: 0, rejected: 0, meterSpent: 0,
  attacks: 0, hits: 0, damage: 0, blocksReceived: 0, parriesReceived: 0,
  receivedDamage: 0, interruptions: 0, knockouts: 0, whiffs: 0, completed: 0, cancelled: 0 });
function emit(match, native, type, details) {
  if (native?.event) native.event(type, details);
  else {
    match.events.push({ id: ++match.serial, tick: match.tick, type, ...details });
    if (match.events.length > 32) match.events.shift();
  }
}
function clearPose(actor) {
  actor.attack = null; actor.guard = false;
  actor.previousInput = neutral(); actor.rearmControls = neutral();
  clearXenoTrialsMovePoseV207(actor); clearXenoTrialsMovementV210(actor);
  clearXenoTrialsGroundRecoveryV211(actor); clearXenoTrialsParryV208(actor, true);
}
function observe(actor) {
  return { hp: actor.hp, hits: actor.stats.hits || 0, damage: actor.stats.damage || 0 };
}

export function initializeXenoTrialsAssistsV232(match) {
  if (!isExhibition(match)) return null;
  if (!match.assistsV232) match.assistsV232 = { version: 232, serial: 0,
    sides: Object.fromEntries(SIDES.map(side => [side, { held: false, rearm: false,
      cooldown: 0, deployment: null, lastReceipt: null, stats: stats() }])) };
  return match.assistsV232;
}

/** A new round restores availability without replaying a held input. Contact
 * statistics belong to the whole exhibition and survive the round boundary. */
export function resetXenoTrialsAssistsV232(match) {
  if (!match?.assistsV232) return initializeXenoTrialsAssistsV232(match);
  for (const side of SIDES) {
    const state = match.assistsV232.sides[side], actor = actorOf(match, side);
    if (actor?.assistV232) { clearPose(actor); delete actor.assistV232; }
    state.deployment = null; state.cooldown = 0;
    state.rearm = state.rearm || state.held;
  }
  return match.assistsV232;
}

/** Read-only shared admission for HUD, deterministic CPU and physical input. */
export function getXenoTrialsAssistReadinessV232(match, side) {
  const state = match?.assistsV232?.sides?.[side], team = teamOf(match, side);
  const owner = activeOf(match, side), reserve = team?.members?.[1 - team.activeIndex];
  const meter = getXenoTrialsSuperMeterV148(owner), limits = XENO_TRIALS_ASSISTS_V232;
  const answer = reason => ({ supported: isExhibition(match) && Boolean(state), ready: reason === null,
    reason, meter, meterCost: limits.meterCost, cooldownTicks: state?.cooldown || 0,
    reserveId: reserve?.id || null, reserveHp: reserve?.hp ?? 0,
    ownerInstanceId: owner?.instanceIdV232 || null,
    reserveInstanceId: reserve?.instanceIdV232 || null });
  if (!isExhibition(match) || !state || team?.members?.length !== 2) return answer('unavailable');
  if (match.paused || match.phase !== 'active' || match.presentation?.blocksSimulation) return answer('inactive');
  if (!owner || owner.hp <= 0 || !activeOf(match, opposite(side))?.hp) return answer('inactive');
  if (!reserve || reserve.hp <= 0) return answer('reserve-ko');
  if (state.deployment || team.transition || team.cooldown > 0) return answer('team-busy');
  if (state.cooldown > 0) return answer('cooldown');
  if (owner.attack || owner.guard || owner.stun > 0 || owner.y !== 0 || owner.vy !== 0
    || owner.movesetV207?.evade || owner.movesetV207?.low || owner.movementV210
    || owner.groundRecoveryV211 || isXenoTrialsParryingV208(match, owner)
    || match.grappleV153) return answer('busy');
  if (reserve.stun > 0 || reserve.attack || reserve.y !== 0 || reserve.vy !== 0) return answer('reserve-busy');
  if (meter < limits.meterCost) return answer('meter');
  const light = getXenoTrialsAttackV147(getXenoTrialsFighterV96(reserve.id), 'light', XENO_TRIALS_ATTACKS_V96.light);
  if (!light || reserve.stamina < light.cost) return answer('stamina');
  return answer(null);
}

/** Presentation gates consume a held command. A release is always physical;
 * cooldown expiry, pause/resume and KO never invent a second rising edge. */
export function gateXenoTrialsAssistsV232(match, inputsBySide) {
  for (const side of SIDES) {
    const state = match?.assistsV232?.sides?.[side];
    if (!state) continue;
    const held = inputsBySide ? inputsBySide[side]?.assist === true : state.held;
    state.held = held; state.rearm = held;
  }
}
export function releaseXenoTrialsAssistControlsV232(match, side, controls = {}) {
  const state = match?.assistsV232?.sides?.[side];
  if (!state || controls.assist === true) return false;
  state.held = false; state.rearm = false; return true;
}
export function getXenoTrialsAssistActorsV232(match) {
  return SIDES.map(side => actorOf(match, side)).filter(actor => actor?.assistV232 && actor.hp > 0);
}

function finish(match, side, reason, native) {
  const state = match.assistsV232.sides[side], deployment = state.deployment;
  const actor = actorOf(match, side);
  if (!deployment) return;
  if (reason === 'complete' || reason === 'interrupted' || reason === 'parried') state.stats.completed++;
  else state.stats.cancelled++;
  if (deployment.attackId && !deployment.contact) state.stats.whiffs++;
  state.lastReceipt = { instanceId: deployment.instanceId, side, reason,
    memberInstanceId: actor?.instanceIdV232 || deployment.memberInstanceId,
    ownerInstanceId: deployment.ownerInstanceId, bornTick: deployment.bornTick,
    endedTick: match.tick, attackId: deployment.attackId || null,
    damage: deployment.damage, receivedDamage: deployment.receivedDamage,
    hp: actor?.hp ?? 0, meterSpent: XENO_TRIALS_ASSISTS_V232.meterCost };
  emit(match, native, 'assist-end-v232', { ...state.lastReceipt });
  if (actor) { clearPose(actor); delete actor.assistV232; }
  state.deployment = null;
}
function beginExit(match, side, reason, native) {
  const state = match.assistsV232.sides[side], deployment = state.deployment, actor = actorOf(match, side);
  if (!deployment || deployment.stage === 'exit') return;
  deployment.stage = 'exit'; deployment.stageTicks = 0; deployment.exitReason = reason;
  actor.attack = null; actor.guard = false;
  actor.assistV232.stage = 'exit'; actor.assistV232.stageTicks = 0;
  emit(match, native, 'assist-withdraw-v232', { side, instanceId: deployment.instanceId,
    memberInstanceId: actor.instanceIdV232, reason });
}
export function cancelXenoTrialsAssistsV232(match, reason = 'cancelled', native) {
  if (!match?.assistsV232) return false;
  let changed = false;
  for (const side of SIDES) if (match.assistsV232.sides[side].deployment) {
    finish(match, side, reason, native); changed = true;
  }
  return changed;
}
function start(match, side, native) {
  const limits = XENO_TRIALS_ASSISTS_V232, state = match.assistsV232.sides[side];
  const team = teamOf(match, side), owner = activeOf(match, side), memberIndex = 1 - team.activeIndex;
  const actor = team.members[memberIndex], direction = owner.facing < 0 ? -1 : 1;
  const arena = native?.arena || XENO_TRIALS_ARENA_V105;
  const origin = clamp(owner.x - direction * limits.retreatDistance, arena.left, arena.right);
  const destination = clamp(owner.x + direction * limits.entryAdvance, arena.left, arena.right);
  const travel = clamp((destination - origin) * direction, 0, limits.maximumEntryTravel);
  const instanceId = `assist-${side}-${++match.assistsV232.serial}`;
  clearPose(actor); actor.x = origin; actor.y = 0; actor.vy = 0; actor.facing = direction;
  const meterBefore = getXenoTrialsSuperMeterV148(owner);
  owner.superMeterV148 = Math.round((meterBefore - limits.meterCost) * 100) / 100;
  state.cooldown = limits.cooldownTicks;
  state.stats.accepted++; state.stats.meterSpent += limits.meterCost;
  state.deployment = { instanceId, memberIndex, memberInstanceId: actor.instanceIdV232,
    ownerInstanceId: owner.instanceIdV232, bornTick: match.tick, stage: 'entry', stageTicks: 0,
    ticks: 0, direction, origin, travel, attackId: null, contact: false, interrupted: false,
    damage: 0, receivedDamage: 0, observed: observe(actor), eventAfter: match.serial };
  actor.assistV232 = { instanceId, side, ownerInstanceId: owner.instanceIdV232,
    memberInstanceId: actor.instanceIdV232, memberIndex, bornTick: match.tick,
    stage: 'entry', stageTicks: 0, ticks: 0, attackKind: 'light',
    evidence: limits.evidence, canonExact: false };
  emit(match, native, 'assist-start-v232', { side, instanceId, memberInstanceId: actor.instanceIdV232,
    ownerInstanceId: owner.instanceIdV232, fighterId: actor.id, meterBefore,
    meterAfter: owner.superMeterV148, meterCost: limits.meterCost, cooldownTicks: state.cooldown });
}

/** Engine calls once before contact collection on each active fixed step.
 * Native callbacks are bound to this match; no alternate combat simulator. */
export function stepXenoTrialsAssistsV232(match, inputsBySide = {}, native = {}) {
  if (!match?.assistsV232) return;
  if (!isExhibition(match) || match.paused || match.phase !== 'active' || match.presentation?.blocksSimulation) {
    gateXenoTrialsAssistsV232(match, inputsBySide);
    cancelXenoTrialsAssistsV232(match, 'inactive', native); return;
  }
  for (const side of SIDES) {
    const state = match.assistsV232.sides[side], held = inputsBySide[side]?.assist === true;
    const fresh = held && !state.held && !state.rearm;
    state.held = held;
    if (!held) state.rearm = false;
    state.cooldown = Math.max(0, state.cooldown - 1);
    if (fresh) {
      state.stats.requests++;
      const controls = inputsBySide[side] || {};
      const concurrent = [...CONTROLS, ...XENO_TRIALS_MOVE_CONTROLS_V207, 'parry'].some(key => controls[key] === true);
      const readiness = concurrent ? { ready: false, reason: 'busy' } : getXenoTrialsAssistReadinessV232(match, side);
      if (readiness.ready) start(match, side, native);
      else {
        state.stats.rejected++;
        emit(match, native, 'assist-denied-v232', { side, reason: readiness.reason });
      }
    }
    const deployment = state.deployment, actor = actorOf(match, side);
    if (!deployment || !actor) continue;
    if (activeOf(match, side)?.hp <= 0 || !activeOf(match, opposite(side))?.hp || match.grappleV153
      || teamOf(match, side).transition) { finish(match, side, 'team-inactive', native); continue; }
    const target = activeOf(match, opposite(side)), limits = XENO_TRIALS_ASSISTS_V232;
    const arena = native.arena || XENO_TRIALS_ARENA_V105;
    deployment.ticks++; deployment.stageTicks++;
    const command = neutral();
    if (deployment.stage === 'attack' && !deployment.attackId) command.light = true;
    native.fighterStep(actor, target, command, native.dt || 1 / 120);
    if (deployment.stage === 'entry') {
      if (actor.stun <= 0) actor.x = clamp(actor.x + deployment.direction * deployment.travel / limits.entryTicks, arena.left, arena.right);
      if (deployment.stageTicks >= limits.entryTicks) { deployment.stage = 'attack'; deployment.stageTicks = 0; }
    } else if (deployment.stage === 'attack') {
      if (!deployment.attackId && actor.attack?.kind === 'light') {
        deployment.attackId = actor.attack.id; state.stats.attacks++;
        emit(match, native, 'assist-attack-v232', { side, instanceId: deployment.instanceId,
          memberInstanceId: actor.instanceIdV232, attackId: deployment.attackId, kind: 'light' });
      } else if (!actor.attack) beginExit(match, side, deployment.attackId ? 'complete' : 'action-rejected', native);
    } else if (deployment.stage === 'exit') {
      if (actor.stun <= 0) actor.x = clamp(actor.x - deployment.direction * limits.exitDistance / limits.exitTicks, arena.left, arena.right);
      if (deployment.stageTicks >= limits.exitTicks) { finish(match, side, deployment.exitReason || 'complete', native); continue; }
    }
    if (deployment.ticks >= limits.maximumTicks) { finish(match, side, 'timeout', native); continue; }
    Object.assign(actor.assistV232, { stage: deployment.stage, stageTicks: deployment.stageTicks, ticks: deployment.ticks });
  }
}
export function collectXenoTrialsAssistImpactsV232(match, impacts, native) {
  const exposed = getXenoTrialsAssistActorsV232(match);
  for (const actor of exposed) {
    const target = activeOf(match, opposite(actor.side));
    if (actor.attack?.kind !== 'light' || !target || target.hp <= 0) continue;
    const origin = getXenoTrialsBodyBoundsV105(actor).center;
    const score = receiver => {
      const distance = (getXenoTrialsBodyBoundsV105(receiver).center - origin) * actor.attack.facing;
      return distance < 0 ? Infinity : distance;
    };
    const targets = [target, ...exposed.filter(receiver => receiver.side !== actor.side)]
      .sort((left, right) => score(left) - score(right));
    for (const receiver of targets) native.collectAttack(actor, receiver, impacts);
  }
}
/** Observe actual native receipts after impacts, including reserve HP loss.
 * Stats remain separate from the currently active teammate's ownership. */
export function afterXenoTrialsAssistsV232(match, native) {
  if (!match?.assistsV232) return;
  for (const side of SIDES) {
    const state = match.assistsV232.sides[side], deployment = state.deployment, actor = actorOf(match, side);
    if (!deployment || !actor) continue;
    const current = observe(actor), before = deployment.observed;
    const hits = Math.max(0, current.hits - before.hits), damage = Math.max(0, current.damage - before.damage);
    const receivedDamage = Math.max(0, before.hp - current.hp);
    state.stats.hits += hits; state.stats.damage += damage; state.stats.receivedDamage += receivedDamage;
    deployment.damage += damage; deployment.receivedDamage += receivedDamage;
    if (hits) deployment.contact = true;
    // The bounded native event ring still contains this step's light/parry.
    const receipts = match.events.filter(row => row.id > deployment.eventAfter);
    for (const receipt of receipts) {
      if (receipt.type === 'parry-v208' && receipt.attackIdV208 === deployment.attackId) {
        state.stats.parriesReceived++; deployment.contact = true;
        beginExit(match, side, 'parried', native);
      }
      if (receipt.type === 'block' && receipt.attackerInstanceV232 === actor.instanceIdV232) state.stats.blocksReceived++;
    }
    deployment.eventAfter = match.serial;
    deployment.observed = current;
    if (receivedDamage || hits || damage) emit(match, native, 'assist-contact-v232', {
      side, instanceId: deployment.instanceId, memberInstanceId: actor.instanceIdV232,
      ownerInstanceId: deployment.ownerInstanceId, attackId: deployment.attackId,
      hits, damage, receivedDamage, hp: actor.hp });
    if (actor.hp <= 0) { state.stats.knockouts++; finish(match, side, 'reserve-ko', native); continue; }
    if (activeOf(match, side)?.hp <= 0 || activeOf(match, opposite(side))?.hp <= 0 || match.phase !== 'active') {
      finish(match, side, 'team-inactive', native); continue;
    }
    if (actor.stun > 0 && !deployment.interrupted) {
      deployment.interrupted = true; state.stats.interruptions++;
      emit(match, native, 'assist-interrupted-v232', { side, instanceId: deployment.instanceId,
        memberInstanceId: actor.instanceIdV232, hp: actor.hp });
      beginExit(match, side, 'interrupted', native);
    }
  }
}

/** CPU request is deterministic, requires a physical opportunity and shares
 * exactly the HUD/input admission. The tag brain decides when to call it. */
export function askXenoTrialsAssistV232(match, side) {
  if (!getXenoTrialsAssistReadinessV232(match, side).ready) return false;
  const owner = activeOf(match, side), target = activeOf(match, opposite(side));
  const gap = getXenoTrialsBodyGapV105(owner, target, owner.facing);
  const team = teamOf(match, side), partner = team.members[1 - team.activeIndex];
  const light = getXenoTrialsAttackV147(getXenoTrialsFighterV96(partner.id), 'light', XENO_TRIALS_ATTACKS_V96.light);
  return match.tick % 37 === (side === 'player' ? 7 : 19) && target.y === 0
    && gap >= 0 && gap <= light.reach * getXenoTrialsFighterV96(partner.id).reach + XENO_TRIALS_ASSISTS_V232.entryAdvance;
}
export function getXenoTrialsAssistViewV232(match) {
  if (!match?.assistsV232) return null;
  return { version: 232, enabled: isExhibition(match), stepHz: 120,
    evidence: XENO_TRIALS_ASSISTS_V232.evidence, canonExact: false,
    sides: Object.fromEntries(SIDES.map(side => {
      const state = match.assistsV232.sides[side], actor = actorOf(match, side);
      return [side, { ...getXenoTrialsAssistReadinessV232(match, side), held: state.held,
        rearm: state.rearm, stats: { ...state.stats }, lastReceipt: state.lastReceipt ? { ...state.lastReceipt } : null,
        actor: actor ? { ...actor.assistV232, id: actor.id, variant: actor.variant,
          x: actor.x, y: actor.y, facing: actor.facing, hp: actor.hp,
          stamina: actor.stamina, attack: actor.attack ? { ...actor.attack } : null,
          remainingTicks: Math.max(0, XENO_TRIALS_ASSISTS_V232.maximumTicks - state.deployment.ticks) } : null }];
    })) };
}
