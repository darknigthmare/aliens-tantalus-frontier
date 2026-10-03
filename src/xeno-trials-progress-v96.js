import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_FACTIONS_V96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';
import { createXenoTrialsModesProgressV119, normalizeXenoTrialsModesProgressV119, normalizeXenoTrialsRulesV119,
  resolveXenoTrialsActivityV119, settleXenoTrialsActivityV119 } from './xeno-trials-modes-v119.js';

const fighterIds = new Set(XENO_TRIALS_FIGHTERS_V96.map(f => f.id));
const factionIds = new Set(XENO_TRIALS_FACTIONS_V96.map(f => f.id));
const stageIds = new Set(XENO_TRIALS_STAGES_V96.map(f => f.id));
export const XENO_TRIALS_STARTERS_V96 = Object.freeze(['warrior', 'runner', 'arachnoid']);
const integer = (value, max = 1000000) => Number.isFinite(value) ? Math.max(0, Math.min(max, Math.floor(value))) : 0;
const record = value => value && typeof value === 'object' && !Array.isArray(value);

/** This is an isolated simulation economy, never campaign money or canonical lore. */
export function createXenoTrialsProgressV96() {
  return { schema: 96, serial: 0, credits: 150, xp: 0, wins: 0, losses: 0, draws: 0,
    unlocked: [...XENO_TRIALS_STARTERS_V96], factionWins: {}, ledger: [], pending: null, modesV119: createXenoTrialsModesProgressV119() };
}

export function normalizeXenoTrialsConfigV96(value = {}) {
  return {
    playerId: fighterIds.has(value.playerId) ? value.playerId : 'warrior',
    opponentId: fighterIds.has(value.opponentId) ? value.opponentId : 'runner',
    playerVariant: value.playerId === 'arachnoid' && value.playerVariant === 'purple' ? 'purple' : 'grey',
    opponentVariant: value.opponentId === 'arachnoid' && value.opponentVariant === 'purple' ? 'purple' : 'grey',
    factionId: factionIds.has(value.factionId) ? value.factionId : 'containment',
    stageId: stageIds.has(value.stageId) ? value.stageId : 'containment-deck',
    difficulty: ['easy', 'normal', 'hard'].includes(value.difficulty) ? value.difficulty : 'normal',
    roundsToWin: 2, roundSeconds: [30, 60, 75, 99, 120].includes(Number(value.roundSeconds)) ? Number(value.roundSeconds) : 99,
    ...(record(value.activityV119) ? { activityV119: {
      branch: ['campaign', 'contracts', 'challenges', 'on-demand'].includes(value.activityV119.branch) ? value.activityV119.branch : 'on-demand',
      id: typeof value.activityV119.id === 'string' ? value.activityV119.id.slice(0, 64) : 'on-demand',
      ...(value.activityV119.branch === 'on-demand' ? { rules: normalizeXenoTrialsRulesV119(value.activityV119.rules) } : {})
    }, rulesV119: normalizeXenoTrialsRulesV119(value.rulesV119) } : {})
  };
}

/** Whitelist persisted fields; malformed tickets cannot settle a different duel. */
export function normalizeXenoTrialsProgressV96(value) {
  const base = createXenoTrialsProgressV96();
  if (!record(value) || value.schema !== 96) return base;
  for (const key of ['serial', 'credits', 'xp', 'wins', 'losses', 'draws']) base[key] = integer(value[key]);
  base.unlocked = [...new Set([...base.unlocked, ...(Array.isArray(value.unlocked) ? value.unlocked.filter(id => fighterIds.has(id)) : [])])];
  for (const id of factionIds) base.factionWins[id] = integer(value.factionWins?.[id]);
  base.modesV119 = normalizeXenoTrialsModesProgressV119(value.modesV119);
  if (base.modesV119.challengeRun && !base.unlocked.includes(base.modesV119.challengeRun.playerId)) base.modesV119.challengeRun = null;
  base.ledger = (Array.isArray(value.ledger) ? value.ledger : []).filter(e => record(e)
    && /^xt96-\d+$/.test(e.matchId) && ['player', 'opponent', 'draw', 'abandoned'].includes(e.winner))
    .slice(-50).map(e => ({ matchId: e.matchId, winner: e.winner,
      playerId: fighterIds.has(e.playerId) ? e.playerId : 'warrior',
      opponentId: fighterIds.has(e.opponentId) ? e.opponentId : 'runner',
      factionId: factionIds.has(e.factionId) ? e.factionId : 'containment',
      credits: integer(e.credits, 1200), xp: integer(e.xp, 200),
      ...(record(e.activityV119) ? { activityV119: { branch: String(e.activityV119.branch).slice(0, 20), id: String(e.activityV119.id).slice(0, 64) } } : {}),
      ...(record(e.modeReward) ? { modeReward: { bonus: integer(e.modeReward.bonus, 1200), secondary: e.modeReward.secondary === true,
        dossierId: fighterIds.has(e.modeReward.dossierId) ? e.modeReward.dossierId : null,
        unlockId: fighterIds.has(e.modeReward.unlockId) ? e.modeReward.unlockId : null, continuing: e.modeReward.continuing === true } } : {}) }));
  const ticket = value.pending;
  if (record(ticket) && ticket.matchId === `xt96-${base.serial}` && base.serial > 0
    && record(ticket.config) && base.unlocked.includes(ticket.config.playerId)
    && Number.isInteger(ticket.config.seed) && ticket.config.seed > 0 && ticket.config.seed <= 0x7fffffff
    && !base.ledger.some(e => e.matchId === ticket.matchId)) {
    base.pending = { matchId: ticket.matchId, config: { ...normalizeXenoTrialsConfigV96(ticket.config),
      seed: ticket.config.seed, matchId: ticket.matchId } };
    const activity = ticket.config.activityV119 && resolveXenoTrialsActivityV119(ticket.config.activityV119, base.modesV119);
    if (ticket.config.activityV119 && (!activity || (activity.opponentId && activity.opponentId !== ticket.config.opponentId)
      || (activity.forcedPlayerId && activity.forcedPlayerId !== ticket.config.playerId)
      || (activity.requiredFamily && XENO_TRIALS_FIGHTERS_V96.find(f => f.id === ticket.config.playerId)?.family !== activity.requiredFamily)
      || (activity.branch === 'challenges' && base.modesV119.challengeRun?.id === activity.id && base.modesV119.challengeRun.playerId !== ticket.config.playerId))) base.pending = null;
    else if (activity) {
      base.pending.config.rulesV119 = normalizeXenoTrialsRulesV119(activity.rules);
      if (base.pending.config.rulesV119.timeLimitSeconds) base.pending.config.roundSeconds = base.pending.config.rulesV119.timeLimitSeconds;
    }
  }
  return base;
}

export function getXenoTrialsUnlockCostV96(id) {
  const fighter = XENO_TRIALS_FIGHTERS_V96.find(f => f.id === id);
  if (!fighter) return null;
  if (XENO_TRIALS_STARTERS_V96.includes(id)) return 0;
  // Simulation prices reflect threat, never insertion order or canonical value.
  const identity = `${fighter.id} ${fighter.profileId} ${fighter.label}`.toLowerCase();
  if (/queen|reine/.test(identity)) return 1400;
  if (/praetorian|prétorien|royal|crusher|bulwark/.test(identity)) return 900;
  if (/drone/.test(identity)) return 100;
  if (/runner|coureur/.test(identity)) return 120;
  if (/warrior|guerrier/.test(identity)) return 200;
  if (fighter.role === 'tank') return 600;
  return fighter.hp >= 250 ? 450 : fighter.hp >= 180 ? 300 : 180;
}

export function unlockXenoTrialsFighterV96(value, id) {
  const state = normalizeXenoTrialsProgressV96(value), cost = getXenoTrialsUnlockCostV96(id);
  if (cost === null || state.pending || state.unlocked.includes(id) || state.credits < cost)
    return { applied: false, state, reason: 'locked-or-unavailable' };
  state.credits -= cost; state.unlocked.push(id);
  return { applied: true, state };
}

export function beginXenoTrialsV96(value, configuration) {
  const state = normalizeXenoTrialsProgressV96(value);
  if (state.pending) return { applied: false, state, reason: 'pending-duel' };
  const config = normalizeXenoTrialsConfigV96(configuration);
  if (!state.unlocked.includes(config.playerId)) return { applied: false, state, reason: 'fighter-locked' };
  if (state.modesV119.challengeRun && !config.activityV119) return { applied: false, state, reason: 'activity-unavailable' };
  if (config.activityV119) {
    const activity = resolveXenoTrialsActivityV119(config.activityV119, state.modesV119);
    if (!activity || (activity.branch === 'contracts' && activity.cycle !== state.modesV119.contractCycle)
      || (state.modesV119.challengeRun && (activity.branch !== 'challenges' || activity.id !== state.modesV119.challengeRun.id))
      || (activity.forcedPlayerId && activity.forcedPlayerId !== config.playerId)
      || (activity.requiredFamily && XENO_TRIALS_FIGHTERS_V96.find(f => f.id === config.playerId)?.family !== activity.requiredFamily)
      || (activity.branch === 'challenges' && state.modesV119.challengeRun?.id === activity.id && state.modesV119.challengeRun.playerId !== config.playerId))
      return { applied: false, state, reason: 'activity-unavailable' };
    for (const key of ['opponentId', 'factionId', 'stageId', 'difficulty']) if (activity[key]) config[key] = activity[key];
    config.rulesV119 = normalizeXenoTrialsRulesV119(activity.rules);
    if (config.rulesV119.timeLimitSeconds) config.roundSeconds = config.rulesV119.timeLimitSeconds;
  }
  if (state.serial >= 1000000) return { applied: false, state, reason: 'serial-limit' };
  state.serial += 1;
  const matchId = `xt96-${state.serial}`;
  state.pending = { matchId, config: { ...config, matchId, seed: 96000 + state.serial } };
  return { applied: true, state, config: state.pending.config };
}

export function abandonXenoTrialsV96(value) {
  const state = normalizeXenoTrialsProgressV96(value);
  if (!state.pending) {
    if (!state.modesV119.challengeRun) return { applied: false, state };
    state.modesV119.challengeRun = null; return { applied: true, state };
  }
  state.ledger.push({ matchId: state.pending.matchId, ...state.pending.config, winner: 'abandoned', credits: 0, xp: 0 });
  state.ledger = state.ledger.slice(-50); state.pending = null;
  state.modesV119.challengeRun = null;
  return { applied: true, state };
}

/** Consume the saved ticket once, only for a finished matching engine result. */
export function settleXenoTrialsV96(value, result) {
  const state = normalizeXenoTrialsProgressV96(value), ticket = state.pending;
  const modeMatches = !ticket?.config.activityV119 || result?.activityV119?.branch === ticket.config.activityV119.branch
    && result?.activityV119?.id === ticket.config.activityV119.id
    && record(result?.rulesV119) && JSON.stringify(normalizeXenoTrialsRulesV119(result.rulesV119)) === JSON.stringify(ticket.config.rulesV119)
    && record(result?.playerStats) && ['hits', 'damage', 'blocks', 'specials'].every(k => Number.isInteger(result.playerStats[k]) && result.playerStats[k] >= 0);
  if (!ticket || result?.completed !== true || result.matchId !== ticket.matchId
    || !modeMatches
    || !['player', 'opponent', 'draw'].includes(result.winner)
    || !['playerId', 'opponentId', 'factionId', 'stageId', 'difficulty', 'seed'].every(k => result[k] === ticket.config[k])
    || !['player', 'opponent'].every(side => result[`${side}Variant`] === (ticket.config[`${side}Id`] === 'arachnoid' ? ticket.config[`${side}Variant`] : null))
    || !Number.isInteger(result.durationTicks) || result.durationTicks <= 0
    || !Number.isInteger(result.rounds) || result.rounds < 2 || result.rounds > 5
    || !['ko', 'double-ko', 'time'].includes(result.reason)
    || !record(result.wins) || !['player', 'opponent'].every(k => Number.isInteger(result.wins[k]) && result.wins[k] >= 0 && result.wins[k] <= 2)
    || result.wins.player + result.wins.opponent > result.rounds
    || (result.winner === 'draw' ? result.rounds !== 5 || result.wins.player !== result.wins.opponent || result.wins.player >= 2
      : result.wins[result.winner] <= result.wins[result.winner === 'player' ? 'opponent' : 'player']
        || (result.wins[result.winner] !== 2 && result.rounds !== 5)))
    return { applied: false, state, reason: 'invalid-or-replayed-result' };
  const won = result.winner === 'player', draw = result.winner === 'draw';
  const bonus = { easy: 0, normal: 20, hard: 50 }[ticket.config.difficulty];
  const extension = settleXenoTrialsActivityV119(state.modesV119, ticket.config, result);
  state.modesV119 = extension.modes;
  const credits = (won ? 80 + bonus : draw ? 25 : 15) + extension.receipt.bonus, xp = won ? 60 + bonus : draw ? 20 : 10;
  if (extension.receipt.unlockId && fighterIds.has(extension.receipt.unlockId) && !state.unlocked.includes(extension.receipt.unlockId)) state.unlocked.push(extension.receipt.unlockId);
  state.credits = integer(state.credits + credits); state.xp = integer(state.xp + xp);
  state[won ? 'wins' : draw ? 'draws' : 'losses'] += 1;
  if (won) state.factionWins[ticket.config.factionId] = integer(state.factionWins[ticket.config.factionId]) + 1;
  const receipt = { matchId: ticket.matchId, winner: result.winner, playerId: result.playerId,
    opponentId: result.opponentId, factionId: result.factionId, credits, xp,
    ...(ticket.config.activityV119 ? { activityV119: { branch: ticket.config.activityV119.branch, id: ticket.config.activityV119.id },
      modeReward: extension.receipt } : {}) };
  state.ledger = [...state.ledger, receipt].slice(-50); state.pending = null;
  return { applied: true, state, receipt };
}

export function renewXenoTrialsContractsV119(value) {
  const state = normalizeXenoTrialsProgressV96(value);
  if (state.pending || state.modesV119.challengeRun || state.modesV119.contractCycle >= 1000000) return { applied: false, state, reason: 'evaluation-in-progress' };
  state.modesV119.contractCycle++; return { applied: true, state };
}
