import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_ARENA_V105 as ARENA, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';
import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';

/** Original MIRE team rules. Reserve actors use their existing native bodies,
 * stamina, light contacts and hurt reactions. No new franchise power is added. */
export const XENO_TRIALS_TEAM_RULES_V208 = Object.freeze({
  tagCooldownTicks: 480, assistCooldownTicks: 960, assistDurationTicks: 156,
  assistApproachTicks: 72, entryRecovery: .20, tagCost: 12, reserveStaminaPerSecond: 6
});
export const XENO_TRIALS_TEAM_CONTROLS_V208 = Object.freeze(['tag', 'assist']);
const SIDES = ['player', 'opponent'];
const slot = side => side === 'player' ? 0 : 1;
const mask = input => Number(input?.tag === true) | (Number(input?.assist === true) << 1);
const clamp = value => Math.max(ARENA.left, Math.min(ARENA.right, value));
const neutral = () => ({ left: false, right: false, jump: false, guard: false,
  light: false, heavy: false, special: false, super: false });

export function normalizeXenoTrialsTeamV208(value) {
  if (!value || value.mode !== 'laboratory') return null;
  const output = { mode: 'laboratory' };
  for (const side of SIDES) {
    const ids = value[`${side}Ids`];
    if (!Array.isArray(ids) || ids.length !== 2 || ids[0] === ids[1]
      || ids.some(id => typeof id !== 'string' || !getXenoTrialsFighterV96(id))) return null;
    output[`${side}Ids`] = [...ids];
  }
  return output;
}

export function attachXenoTrialsTeamV208(match, config, makeFighter) {
  const definition = normalizeXenoTrialsTeamV208(config);
  if (!definition || match.hordeV180 || match.operationV188) return false;
  match.config.teamV208 = definition;
  match.config.roundsToWin = 1;
  match.teamV208 = { schema: 208, mode: 'laboratory', reserve: {}, assist: {},
    tagCooldown: {}, assistCooldown: {}, controls: {}, tags: { player: 0, opponent: 0 },
    assists: { player: 0, opponent: 0 }, automaticRelays: { player: 0, opponent: 0 } };
  for (const side of SIDES) {
    match.fighters[slot(side)].teamSlotV208 = 0;
    const reserve = makeFighter(side, definition[`${side}Ids`][1]);
    reserve.teamSlotV208 = 1;
    match.teamV208.reserve[side] = reserve;
    match.teamV208.assist[side] = null;
    match.teamV208.tagCooldown[side] = match.teamV208.assistCooldown[side] = 0;
    match.teamV208.controls[side] = { held: 0, rearm: 0 };
  }
  return true;
}

export function gateXenoTrialsTeamV208(match, side, input) {
  const controls = match.teamV208?.controls[side];
  if (!controls) return;
  if (input === undefined) { controls.rearm |= controls.held; return; }
  controls.held = controls.rearm = mask(input);
}

export function releaseXenoTrialsTeamV208(match, side, input) {
  const controls = match.teamV208?.controls[side];
  if (controls) { controls.held &= mask(input); controls.rearm &= mask(input); }
}

function freshControls(match, side, input) {
  const controls = match.teamV208.controls[side], held = mask(input);
  controls.rearm &= held;
  const fresh = held & ~controls.held & ~controls.rearm;
  controls.held = held;
  return { tag: Boolean(fresh & 1), assist: Boolean(fresh & 2) };
}

function hasOwnedField(match, side) {
  return match.projectiles.some(projectile => projectile.owner === side)
    || (match.acidDropsV152 || []).some(effect => effect.owner === side)
    || (match.acidPoolsV152 || []).some(effect => effect.owner === side);
}

function readyActor(fighter) {
  return fighter.hp > 0 && fighter.y === 0 && fighter.vy === 0 && fighter.stun <= 0
    && !fighter.attack && !fighter.movesetV207?.evade;
}

export function getXenoTrialsTeamReadinessV208(match, side) {
  const team = match.teamV208, fighter = match.fighters[slot(side)], reserve = team?.reserve[side];
  if (!team || !reserve) return { tag: false, assist: false };
  const eligible = match.phase === 'active' && !match.paused && !match.grappleV153
    && readyActor(fighter) && reserve.hp > 0 && !team.assist[side];
  const spec = getXenoTrialsAttackV147(getXenoTrialsFighterV96(reserve.id), 'light', XENO_TRIALS_ATTACKS_V96.light);
  return { tag: eligible && team.tagCooldown[side] === 0 && fighter.stamina >= XENO_TRIALS_TEAM_RULES_V208.tagCost
      && !hasOwnedField(match, side),
    assist: eligible && team.assistCooldown[side] === 0 && reserve.stamina >= spec.cost };
}

function resetEntry(fighter, x, facing, input) {
  fighter.x = clamp(x); fighter.y = 0; fighter.vy = 0; fighter.facing = facing;
  fighter.attack = null; fighter.guard = false; fighter.stun = Math.max(fighter.stun, XENO_TRIALS_TEAM_RULES_V208.entryRecovery);
  fighter.previousInput = neutral();
  fighter.rearmControls = Object.fromEntries(Object.keys(neutral()).map(key => [key, input?.[key] === true]));
  delete fighter.movesetV207;
}

function swap(match, side, input, emit, automatic = false) {
  const team = match.teamV208, index = slot(side), outgoing = match.fighters[index], incoming = team.reserve[side];
  if (!automatic) outgoing.stamina -= XENO_TRIALS_TEAM_RULES_V208.tagCost;
  resetEntry(incoming, outgoing.x, outgoing.facing, input);
  outgoing.attack = null; outgoing.guard = false; outgoing.stun = 0;
  outgoing.previousInput = outgoing.rearmControls = neutral();
  delete outgoing.movesetV207;
  match.fighters[index] = incoming;
  team.reserve[side] = outgoing;
  team.assist[side] = null;
  team.tagCooldown[side] = XENO_TRIALS_TEAM_RULES_V208.tagCooldownTicks;
  team[automatic ? 'automaticRelays' : 'tags'][side]++;
  emit(match, automatic ? 'team-relay-v208' : 'team-tag-v208', { side, outgoing: outgoing.id, incoming: incoming.id });
}

export function prepareXenoTrialsTeamV208(match, playerControls, opponentControls, dt, emit) {
  const team = match.teamV208;
  if (!team) return;
  for (const side of SIDES) {
    team.tagCooldown[side] = Math.max(0, team.tagCooldown[side] - 1);
    team.assistCooldown[side] = Math.max(0, team.assistCooldown[side] - 1);
    const fighter = match.fighters[slot(side)], reserve = team.reserve[side];
    if (!team.assist[side] && reserve.hp > 0) {
      reserve.stamina = Math.min(getXenoTrialsFighterV96(reserve.id).stamina,
        reserve.stamina + XENO_TRIALS_TEAM_RULES_V208.reserveStaminaPerSecond * dt);
      reserve.stun = Math.max(0, reserve.stun - dt);
      reserve.specialCooldown = Math.max(0, reserve.specialCooldown - dt);
    }
    let input = side === 'player' ? playerControls : opponentControls;
    if (input === null) {
      const target = match.fighters[0], hp = getXenoTrialsFighterV96(fighter.id).hp;
      input = { tag: match.tick % 30 === 0 && fighter.hp / hp < .35 && reserve.hp > fighter.hp,
        assist: match.tick % 180 === 0 && getXenoTrialsBodyGapV105(fighter, target) < 180 };
    }
    const fresh = freshControls(match, side, input);
    const ready = getXenoTrialsTeamReadinessV208(match, side);
    if (fresh.tag && ready.tag) { swap(match, side, input, emit); continue; }
    if (fresh.assist && ready.assist) {
      resetEntry(reserve, fighter.x - fighter.facing * 120, fighter.facing, {});
      reserve.stun = 0;
      team.assist[side] = { ticks: 0, phase: 'approach', attempted: false };
      team.assistCooldown[side] = XENO_TRIALS_TEAM_RULES_V208.assistCooldownTicks;
      team.assists[side]++;
      emit(match, 'team-assist-v208', { side, fighterId: reserve.id });
    }
  }
}

export function getXenoTrialsAssistActorsV208(match) {
  return match.teamV208 ? SIDES.filter(side => match.teamV208.assist[side] && match.teamV208.reserve[side].hp > 0)
    .map(side => match.teamV208.reserve[side]) : [];
}

export function stepXenoTrialsAssistsV208(match, dt, fighterStep) {
  const team = match.teamV208;
  if (!team) return;
  for (const side of SIDES) {
    const action = team.assist[side], reserve = team.reserve[side], target = match.fighters[1 - slot(side)];
    if (!action) continue;
    if (reserve.hp <= 0 || match.grappleV153 || ++action.ticks > XENO_TRIALS_TEAM_RULES_V208.assistDurationTicks) {
      reserve.attack = null; reserve.guard = false; team.assist[side] = null; continue;
    }
    const toward = target.x >= reserve.x ? 1 : -1;
    const spec = getXenoTrialsAttackV147(getXenoTrialsFighterV96(reserve.id), 'light', XENO_TRIALS_ATTACKS_V96.light);
    const reach = spec.reach * getXenoTrialsFighterV96(reserve.id).reach;
    let input = {};
    if (action.phase === 'approach') {
      if (getXenoTrialsBodyGapV105(reserve, target, toward) <= reach - 5) {
        input.light = true; action.attempted = true; action.phase = 'strike';
      } else if (action.ticks < XENO_TRIALS_TEAM_RULES_V208.assistApproachTicks) input[toward > 0 ? 'right' : 'left'] = true;
      else action.phase = 'retreat';
    } else if (action.phase === 'strike' && !reserve.attack) action.phase = 'retreat';
    if (action.phase === 'retreat') input[side === 'player' ? 'left' : 'right'] = true;
    fighterStep(match, reserve, target, { ...neutral(), ...input }, dt);
  }
}

/** Resolve reserves before a team verdict. A member KO is never a match win.
 * Timeout compares both remaining health fractions, not only the active pair. */
export function settleXenoTrialsTeamV208(match, playerControls, opponentControls, emit, clearFields) {
  const team = match.teamV208;
  if (!team) return false;
  for (const side of SIDES) if (match.fighters[slot(side)].hp <= 0 && team.reserve[side].hp > 0)
    swap(match, side, side === 'player' ? playerControls : opponentControls, emit, true);
  const totals = SIDES.map(side => [match.fighters[slot(side)], team.reserve[side]]
    .reduce((value, fighter) => value + fighter.hp / getXenoTrialsFighterV96(fighter.id).hp, 0));
  if (totals.every(hp => hp > 0) && match.timeRemaining > 0) return true;
  const reason = totals.every(hp => hp > 0) ? 'time' : totals.every(hp => hp === 0) ? 'double-ko' : 'ko';
  const winner = Math.abs(totals[0] - totals[1]) < .00001 ? 'draw' : totals[0] > totals[1] ? 'player' : 'opponent';
  const sumStats = side => {
    const output = { hits: 0, damage: 0, blocks: 0, specials: 0 };
    for (const fighter of [match.fighters[slot(side)], team.reserve[side]]) for (const [key, value] of Object.entries(fighter.stats))
      output[key] = (output[key] || 0) + value;
    return output;
  };
  match.phase = 'match-over'; match.phaseTime = 0; match.roundWinner = winner; match.roundReason = reason;
  match.wins = { player: Number(winner === 'player'), opponent: Number(winner === 'opponent') };
  match.result = { version: 96, completed: true, matchId: match.config.matchId, seed: match.config.seed,
    winner, reason, rounds: 1, wins: { ...match.wins }, playerId: match.config.playerId,
    opponentId: match.config.opponentId, factionId: match.config.factionId, stageId: match.config.stageId,
    difficulty: match.config.difficulty, rulesV119: { ...match.config.rulesV119 },
    playerStats: sumStats('player'), opponentStats: sumStats('opponent'), durationTicks: match.tick,
    teamV208: { mode: 'laboratory', playerIds: [...match.config.teamV208.playerIds],
      opponentIds: [...match.config.teamV208.opponentIds], tags: { ...team.tags }, assists: { ...team.assists } } };
  for (const fighter of [...match.fighters, ...Object.values(team.reserve)]) { fighter.attack = null; fighter.guard = false; }
  team.assist = { player: null, opponent: null }; match.projectiles = []; clearFields(match);
  emit(match, 'match-end', { winner });
  return true;
}

export function getXenoTrialsTeamViewV208(match) {
  if (!match.teamV208) return null;
  return Object.fromEntries(SIDES.map(side => {
    const team = match.teamV208, reserve = team.reserve[side], definition = getXenoTrialsFighterV96(reserve.id);
    return [side, { reserveId: reserve.id, reserveLabel: definition.label, reserveHp: reserve.hp, maximumHp: definition.hp,
      tagSeconds: Math.ceil(team.tagCooldown[side] / 120), assistSeconds: Math.ceil(team.assistCooldown[side] / 120),
      assisting: Boolean(team.assist[side]), ...getXenoTrialsTeamReadinessV208(match, side) }];
  }));
}
