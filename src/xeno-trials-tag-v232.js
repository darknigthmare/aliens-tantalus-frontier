import { XENO_TRIALS_FIGHTERS_V96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { createXenoTrialsBrainV119 } from './xeno-trials-ai-v119.js';
import { isXenoTrialsParryingV208 } from './xeno-trials-defense-v208.js';

// Original exhibition rules. Existing poses and individually admitted identities
// are reused as themselves; a relay does not invent a third combatant or rig.
export const XENO_TRIALS_TAG_V232 = Object.freeze({ version: 232, members: 2,
  windupTicks: 30, recoveryTicks: 24, automaticRecoveryTicks: 24, cooldownTicks: 480 });
const sides = ['player', 'opponent'];
const controlNames = ['left', 'right', 'jump', 'guard', 'light', 'heavy', 'special', 'super',
  'crouch', 'evade', 'antiAir', 'parry', 'signature2', 'signature3', 'interact', 'tag', 'assist'];
const canonicalControls = value => Object.fromEntries(controlNames.filter(name => value?.[name] === true).map(name => [name, true]));
const admitted = new Set(XENO_TRIALS_FIGHTERS_V96.map(fighter => fighter.id));
const copy = value => JSON.parse(JSON.stringify(value));

function identity(value) {
  if (!value || !admitted.has(value.id)) return null;
  const definition = getXenoTrialsFighterV96(value.id), variant = value.variant ?? definition.variants[0] ?? null;
  if (definition.variants.length ? !definition.variants.includes(variant) : variant !== null) return null;
  return { id: value.id, variant };
}
/** Deliberately opt-in and disjoint from every progression/practice activity. */
export function normalizeXenoTrialsExhibitionV232(config = {}) {
  const value = config.exhibitionV232;
  if (!value || !['duel', 'tag'].includes(value.mode) || config.activityV119 || config.hordeV180 || config.operationV188
    || config.practice || config.practiceV164 || config.practiceV207 || config.practiceV208 || config.practiceV232
    || config.training || config.trainingV164) return null;
  const count = value.mode === 'tag' ? 2 : 1, result = { mode: value.mode,
    assists: value.mode === 'tag' && value.assists === true, controls: value.controls === 'local' ? 'local' : 'cpu' };
  for (const side of sides) {
    const supplied = value[`${side}Team`] || [{ id: config[`${side}Id`], variant: config[`${side}Variant`] }];
    if (!Array.isArray(supplied) || (count === 2 ? supplied.length !== 2 : supplied.length < 1)) return null;
    const members = supplied.slice(0, count).map(identity);
    if (members.some(member => !member)) return null;
    result[`${side}Team`] = members;
  }
  return result;
}
export function initializeXenoTrialsTagV232(match, native) {
  if (match.config.exhibitionV232?.mode !== 'tag') return false;
  const teams = {};
  for (const [slot, side] of sides.entries()) {
    const members = match.config.exhibitionV232[`${side}Team`].map((member, index) => {
      const actor = index === 0 ? match.fighters[slot] : native.makeFighter(side, member.id, member.variant);
      actor.instanceIdV232 = `${side}-${index}`;
      if (match.config.rulesV119?.initialHp === 1) actor.hp = 1;
      return actor;
    });
    teams[side] = { activeIndex: 0, members, cooldown: 0, cooldownUntilTick: 0,
      transition: null, tagHeld: false, tagRearm: false, lastControls: {},
      status: 'ready', changes: 0, automaticChanges: 0,
      ...(side === 'opponent' ? { brains: [match.ai, createXenoTrialsBrainV119()] } : {}) };
  }
  match.tagV232 = { version: 232, teams };
  return true;
}
/** Reconnect JSON snapshots without relying on object identity surviving JSON. */
export function reconnectXenoTrialsTagV232(match) {
  if (!match?.tagV232) return false;
  for (const [slot, side] of sides.entries()) {
    const team = match.tagV232.teams[side];
    team.members[team.activeIndex] = match.fighters[slot];
    if (side === 'opponent') team.brains[team.activeIndex] = match.ai;
  }
  return true;
}
function busyReason(match, side) {
  const team = match.tagV232?.teams[side], actor = match.fighters[sides.indexOf(side)];
  if (!team) return 'unavailable';
  if (match.phase !== 'active' || match.paused) return 'phase';
  if (team.transition) return 'changing';
  if (team.members[1 - team.activeIndex].hp <= 0) return 'reserve-ko';
  if (team.members[1 - team.activeIndex].stun > 0) return 'reserve-stun';
  if (team.members.some(member => member.assistV232)) return 'assist';
  if (team.cooldownUntilTick > match.tick) return 'cooldown';
  if (match.grappleV153) return 'grapple';
  if (actor.hp <= 0 || actor.stun > 0) return 'stun';
  if (actor.y !== 0 || actor.vy !== 0) return 'air';
  if (actor.guard || actor.attack || actor.movesetV207?.evade || isXenoTrialsParryingV208(match, actor) || actor.groundRecoveryV211
    || actor.movementV210) return 'action';
  return null;
}
function hasRoom(match, side) {
  const team = match.tagV232.teams[side], actor = match.fighters[sides.indexOf(side)], enemy = match.fighters[1 - sides.indexOf(side)];
  const reserve = team.members[1 - team.activeIndex];
  const own = getXenoTrialsBodyBoundsV105({ ...reserve, x: actor.x, y: 0, facing: actor.facing });
  const target = getXenoTrialsBodyBoundsV105(enemy);
  return enemy.y >= own.pushTop || (actor.x <= enemy.x ? own.right + 4 <= target.left : own.left >= target.right + 4);
}
export function requestXenoTrialsTagV232(match, side, native) {
  const team = match?.tagV232?.teams[side];
  if (!team) return false;
  const reason = busyReason(match, side) || (!hasRoom(match, side) ? 'space' : null);
  if (reason) { team.status = reason; return false; }
  const actor = match.fighters[sides.indexOf(side)];
  team.transition = { stage: 'out', remainingTicks: XENO_TRIALS_TAG_V232.windupTicks,
    remaining: XENO_TRIALS_TAG_V232.windupTicks / 120, from: team.activeIndex, to: 1 - team.activeIndex,
    bornTick: match.tick, automatic: false };
  team.cooldownUntilTick = match.tick + XENO_TRIALS_TAG_V232.cooldownTicks;
  team.cooldown = XENO_TRIALS_TAG_V232.cooldownTicks / 120;
  actor.guard = false; actor.attack = null; team.status = 'changing';
  native.event('tag-start-v232', { side, fromMemberV232: actor.instanceIdV232,
    toMemberV232: team.members[1 - team.activeIndex].instanceIdV232 });
  return true;
}
function retireEffects(match, member) {
  match.projectiles = match.projectiles.filter(projectile => projectile.ownerMemberV232 !== member.instanceIdV232);
  for (const key of ['acidDropsV152', 'acidPoolsV152']) if (match[key])
    match[key] = match[key].filter(effect => effect.ownerMemberV232 !== member.instanceIdV232);
}
function exchange(match, side, automatic, native) {
  const slot = sides.indexOf(side), team = match.tagV232.teams[side], outgoing = match.fighters[slot];
  const targetIndex = 1 - team.activeIndex, incoming = team.members[targetIndex];
  if (incoming.hp <= 0) return false;
  // A manual change keeps the exact floor pivot and cannot push the opponent
  // with a larger replacement. If the opponent closes the gap, the change fails.
  if (!automatic && !hasRoom(match, side)) {
    team.transition = null; team.status = 'space';
    native.event('tag-cancel-v232', { side, reason: 'space' }); return false;
  }
  retireEffects(match, outgoing);
  outgoing.attack = null; outgoing.guard = false; outgoing.stun = 0;
  incoming.x = outgoing.x; incoming.y = 0; incoming.vy = 0; incoming.facing = outgoing.facing;
  incoming.attack = null; incoming.guard = false;
  native.clearFighter(outgoing); native.clearFighter(incoming);
  native.gateFighter(incoming, team.lastControls);
  if (side === 'opponent') { team.brains[team.activeIndex] = match.ai; match.ai = team.brains[targetIndex]; }
  team.activeIndex = targetIndex; match.fighters[slot] = incoming;
  team.changes++; if (automatic) team.automaticChanges++;
  team.transition = { stage: 'in', remainingTicks: automatic ? XENO_TRIALS_TAG_V232.automaticRecoveryTicks : XENO_TRIALS_TAG_V232.recoveryTicks,
    remaining: (automatic ? XENO_TRIALS_TAG_V232.automaticRecoveryTicks : XENO_TRIALS_TAG_V232.recoveryTicks) / 120,
    from: 1 - targetIndex, to: targetIndex, bornTick: match.tick, automatic };
  team.status = 'changing';
  native.event(automatic ? 'tag-auto-v232' : 'tag-change-v232', { side,
    fromMemberV232: outgoing.instanceIdV232, toMemberV232: incoming.instanceIdV232, x: incoming.x, y: 0 });
  return true;
}
function aiWantsTag(match) {
  const team = match.tagV232.teams.opponent, actor = team.members[team.activeIndex], reserve = team.members[1 - team.activeIndex];
  const enemy = match.fighters[0], ownRatio = actor.hp / getXenoTrialsFighterV96(actor.id).hp;
  const reserveRatio = reserve.hp / getXenoTrialsFighterV96(reserve.id).hp;
  return match.tick % 24 === 0 && ownRatio <= .32 && reserveRatio > ownRatio + .15
    && (!enemy.attack && Math.abs(actor.x - enemy.x) > 180 || enemy.stun > .15);
}
export function stepXenoTrialsTagV232(match, inputsBySide, native) {
  if (!match.tagV232) return;
  for (const side of sides) {
    const team = match.tagV232.teams[side], controls = inputsBySide[side] || {};
    const reserve = team.members[1 - team.activeIndex];
    if (!reserve.assistV232) {
      reserve.stun = Math.max(0, reserve.stun - native.dt);
      reserve.specialCooldown = Math.max(0, reserve.specialCooldown - native.dt);
    }
    team.lastControls = canonicalControls(controls);
    team.cooldown = Math.max(0, team.cooldownUntilTick - match.tick) / 120;
    if (!controls.tag) { team.tagHeld = false; team.tagRearm = false; }
    const pressed = controls.tag === true && !team.tagHeld && !team.tagRearm;
    team.tagHeld = controls.tag === true;
    if (pressed || side === 'opponent' && inputsBySide.opponent === null && aiWantsTag(match))
      requestXenoTrialsTagV232(match, side, native);
    if (!team.transition) { if (team.status !== 'space') team.status = busyReason(match, side) || 'ready'; continue; }
    const transition = team.transition;
    if (transition.bornTick < match.tick) transition.remainingTicks--;
    transition.remaining = transition.remainingTicks / 120;
    if (transition.remainingTicks <= 0) {
      if (transition.stage === 'out') exchange(match, side, false, native);
      else { team.transition = null; team.status = busyReason(match, side) || 'ready'; }
    }
    if (team.transition) {
      const actor = match.fighters[sides.indexOf(side)];
      native.gateFighter(actor, controls);
      actor.stun = Math.max(actor.stun, 2 / 120); actor.guard = false;
    }
  }
}
export function notifyXenoTrialsTagImpactV232(match, actor, native) {
  const team = match.tagV232?.teams[actor.side];
  if (!team?.transition || team.members[team.activeIndex] !== actor) return;
  team.transition = null; team.status = 'interrupted';
  native.event('tag-cancel-v232', { side: actor.side, memberInstanceV232: actor.instanceIdV232, reason: 'hit' });
}
export function afterXenoTrialsTagV232(match, native) {
  if (!match.tagV232) return;
  for (const side of sides) {
    const team = match.tagV232.teams[side], actor = team.members[team.activeIndex];
    if (actor.hp <= 0 && team.members[1 - team.activeIndex].hp > 0) {
      native.clearGrapple(); exchange(match, side, true, native);
    }
  }
}
export function getXenoTrialsTagVerdictV232(match) {
  if (!match.tagV232) return null;
  const ratios = {}, alive = {}, stats = {};
  for (const side of sides) {
    const members = match.tagV232.teams[side].members;
    ratios[side] = members.reduce((sum, member) => sum + member.hp, 0)
      / members.reduce((sum, member) => sum + (match.config.rulesV119?.initialHp || getXenoTrialsFighterV96(member.id).hp), 0);
    alive[side] = members.some(member => member.hp > 0);
    stats[side] = {};
    for (const member of members) for (const [key, value] of Object.entries(member.stats))
      if (Number.isFinite(value)) stats[side][key] = (stats[side][key] || 0) + value;
  }
  return { ratios, alive, stats };
}
export function resetXenoTrialsTagV232(match, native) {
  if (!match.tagV232) return false;
  const old = match.tagV232;
  initializeXenoTrialsTagV232(match, native);
  for (const side of sides) {
    const team = match.tagV232.teams[side], previous = old.teams[side];
    team.lastControls = canonicalControls(previous.lastControls); team.tagHeld = previous.tagHeld; team.tagRearm = previous.tagHeld || previous.tagRearm;
    team.members.forEach((member, index) => {
      member.stats = previous.members[index].stats;
      if ('superMeterV148' in member) member.superMeterV148 = previous.members[index].superMeterV148 || 0;
      native.gateFighter(member, previous.lastControls);
    });
  }
  return true;
}
export function gateXenoTrialsTagV232(match, inputsBySide = null) {
  if (!match?.tagV232) return;
  for (const side of sides) {
    const team = match.tagV232.teams[side], held = inputsBySide?.[side] || team.lastControls;
    team.tagRearm = team.tagRearm || held.tag === true; team.tagHeld = held.tag === true;
    if (inputsBySide) team.lastControls = canonicalControls(held);
  }
}
export function releaseXenoTrialsTagControlsV232(match, side, controls) {
  const team = match?.tagV232?.teams[side];
  if (!team) return;
  if (!controls.tag) { team.tagHeld = false; team.tagRearm = false; }
  team.lastControls = canonicalControls(controls);
}
export function getXenoTrialsTagViewV232(match) {
  if (!match?.tagV232) return null;
  const teams = {};
  for (const side of sides) {
    const team = match.tagV232.teams[side];
    teams[side] = { activeIndex: team.activeIndex, cooldown: Math.max(0, team.cooldownUntilTick - match.tick) / 120,
      status: busyReason(match, side) || (!hasRoom(match, side) ? 'space' : 'ready'), transition: team.transition ? { ...team.transition } : null,
      changes: team.changes, automaticChanges: team.automaticChanges,
      members: team.members.map((member, index) => ({ id: member.id, variant: member.variant,
        instanceIdV232: member.instanceIdV232, active: index === team.activeIndex, hp: member.hp,
        maxHp: match.config.rulesV119?.initialHp || getXenoTrialsFighterV96(member.id).hp,
        stamina: member.stamina, maxStamina: getXenoTrialsFighterV96(member.id).stamina,
        meter: member.superMeterV148 || 0, alive: member.hp > 0, assisting: Boolean(member.assistV232) })) };
  }
  return copy({ version: 232, teams });
}
