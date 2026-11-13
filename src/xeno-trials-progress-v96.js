import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_FACTIONS_V96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';
import { createXenoTrialsModesProgressV119, normalizeXenoTrialsModesProgressV119, normalizeXenoTrialsRulesV119,
  resolveXenoTrialsActivityV119, settleXenoTrialsActivityV119 } from './xeno-trials-modes-v119.js';
import { getXenoTrialsHordeProtocolV180 } from './xeno-trials-horde-v180.js';
import { createXenoTrialsHordeCheckpointV186, normalizeXenoTrialsHordeCheckpointV186,
  isXenoTrialsCheckpointForwardV186 } from './xeno-trials-horde-checkpoint-v186.js';
import { getXenoTrialsOperationV188, validateXenoTrialsOperationSnapshotV188,
  getXenoTrialsOperationReceiptV188, isXenoTrialsOperationForwardV188 } from './xeno-trials-operations-v188.js';
import { validateXenoTrialsStageHazardsV188, isXenoTrialsStageHazardsForwardV188 } from './xeno-trials-stage-hazards-v188.js';
import { getArbiterProgramV191, getArbiterArchiveAccessV191 } from './xeno-arbiter-protocols-v191.js';

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
  const operation = value.activityV119?.branch === 'operations' && getXenoTrialsOperationV188(value.activityV119.id);
  const horde = getXenoTrialsHordeProtocolV180(operation ? operation.hordeProtocolId : value.activityV119?.branch === 'horde' ? value.activityV119.id : null);
  return {
    playerId: fighterIds.has(value.playerId) ? value.playerId : 'warrior',
    opponentId: fighterIds.has(value.opponentId) ? value.opponentId : 'runner',
    playerVariant: value.playerId === 'arachnoid' && value.playerVariant === 'purple' ? 'purple' : 'grey',
    opponentVariant: value.opponentId === 'arachnoid' && value.opponentVariant === 'purple' ? 'purple' : 'grey',
    factionId: factionIds.has(value.factionId) ? value.factionId : 'containment',
    stageId: stageIds.has(value.stageId) ? value.stageId : 'containment-deck',
    difficulty: ['easy', 'normal', 'hard'].includes(value.difficulty) ? value.difficulty : 'normal',
    roundsToWin: horde ? 1 : 2, roundSeconds: operation?.roundSeconds || (horde ? horde.roundSeconds : [30, 60, 75, 99, 120].includes(Number(value.roundSeconds)) ? Number(value.roundSeconds) : 99),
    ...(horde ? { hordeV180: { protocolId: horde.id } } : {}),
    ...(operation ? { operationV188: { id: operation.id } } : {}),
    ...(record(value.activityV119) ? { activityV119: {
      branch: ['campaign', 'contracts', 'challenges', 'on-demand', 'horde', 'operations'].includes(value.activityV119.branch) ? value.activityV119.branch : 'on-demand',
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
    const run = base.modesV119.challengeRun;
    const runMismatch = run && (!activity || activity.branch !== 'challenges' || activity.id !== run.id || ticket.config.playerId !== run.playerId);
    // A resumed series belongs to its current authored wave. A stale ticket
    // must not bring another arena, faction or difficulty into that wave.
    const settingMismatch = activity && ['opponentId', 'stageId', 'factionId', 'difficulty']
      .some(key => activity[key] && activity[key] !== ticket.config[key]);
    if (runMismatch || ticket.config.activityV119 && (!activity || settingMismatch
      || (activity.forcedPlayerId && activity.forcedPlayerId !== ticket.config.playerId)
      || (activity.requiredFamily && XENO_TRIALS_FIGHTERS_V96.find(f => f.id === ticket.config.playerId)?.family !== activity.requiredFamily)
      || (activity.branch === 'challenges' && base.modesV119.challengeRun?.id === activity.id && base.modesV119.challengeRun.playerId !== ticket.config.playerId))) base.pending = null;
    else if (activity) {
      base.pending.config.rulesV119 = normalizeXenoTrialsRulesV119(activity.rules);
      if (base.pending.config.rulesV119.timeLimitSeconds) base.pending.config.roundSeconds = base.pending.config.rulesV119.timeLimitSeconds;
    }
    if (base.pending && ticket.checkpointV186) {
      const checkpoint = normalizeXenoTrialsHordeCheckpointV186(ticket.checkpointV186, base.pending.config);
      if (checkpoint) base.pending.checkpointV186 = checkpoint;
    }
  }
  return base;
}

/** A save-owner guarded caller supplies a live snapshot. The transaction never
 * creates a ticket, grants a reward, changes economy or consumes a result. */
export function checkpointXenoTrialsV186(value, snapshot) {
  const state = normalizeXenoTrialsProgressV96(value), ticket = state.pending;
  if (!ticket || !['horde', 'operations'].includes(ticket.config.activityV119?.branch))
    return { applied: false, state, reason: 'checkpoint-ticket-unavailable' };
  const checkpoint = createXenoTrialsHordeCheckpointV186(snapshot, ticket.config);
  if (!checkpoint) return { applied: false, state, reason: 'invalid-horde-checkpoint' };
  if (!isXenoTrialsCheckpointForwardV186(ticket.checkpointV186, checkpoint))
    return { applied: false, state, reason: 'stale-horde-checkpoint' };
  ticket.checkpointV186 = checkpoint;
  return { applied: true, state };
}

/** Explicit restart keeps the existing ticket/seed and gives no refund or gain. */
export function clearXenoTrialsCheckpointV186(value) {
  const state = normalizeXenoTrialsProgressV96(value);
  if (!state.pending?.checkpointV186) return { applied: false, state, reason: 'checkpoint-unavailable' };
  delete state.pending.checkpointV186;
  return { applied: true, state };
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

export function beginXenoTrialsV96(value, configuration, { arbiterProgressV190 } = {}) {
  const state = normalizeXenoTrialsProgressV96(value);
  if (state.pending) return { applied: false, state, reason: 'pending-duel' };
  const config = normalizeXenoTrialsConfigV96(configuration);
  const archive = getArbiterProgramV191(config.activityV119?.id);
  if (archive && archive.branch !== config.activityV119.branch)
    return { applied: false, state, reason: 'activity-unavailable' };
  if (archive && !getArbiterArchiveAccessV191(arbiterProgressV190).available)
    return { applied: false, state, reason: 'arbiter-archives-locked' };
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

function validHordeResultV180(config, result) {
  const protocol = getXenoTrialsHordeProtocolV180(config.activityV119?.id), receipt = result.hordeV180;
  if (!protocol || !record(receipt) || receipt.protocolId !== protocol.id
    || receipt.totalEnemies !== protocol.totalEnemies || result.rounds !== 1
    || !record(result.wins) || !['player', 'opponent'].includes(result.winner)
    || !Number.isInteger(receipt.wavesCleared) || receipt.wavesCleared < 0 || receipt.wavesCleared > protocol.waves.length
    || !Number.isInteger(receipt.kills) || receipt.kills < 0 || receipt.kills > protocol.totalEnemies
    || result.durationTicks > (protocol.roundSeconds + 5) * 120) return false;
  const boss = protocol.bossFinaleV186, bossReceipt = receipt.bossFinaleV186;
  if (!boss && bossReceipt !== undefined) return false;
  if (boss) {
    if (!record(bossReceipt) || bossReceipt.fighterId !== boss.fighterId || bossReceipt.maxHp !== boss.hp
      || bossReceipt.wave !== boss.wave || typeof bossReceipt.defeated !== 'boolean'
      || !['pending', 'incoming', 'active', 'defeated'].includes(bossReceipt.phase)
      || !Number.isInteger(bossReceipt.hp) || bossReceipt.hp < 0 || bossReceipt.hp > boss.hp) return false;
    const beforeBoss = protocol.waves.slice(0, -1).reduce((sum, wave) => sum + wave.total, 0);
    if (bossReceipt.defeated) {
      if (bossReceipt.phase !== 'defeated' || bossReceipt.hp !== 0 || bossReceipt.instanceId !== null
        || receipt.kills <= beforeBoss || receipt.wavesCleared < boss.wave - 1) return false;
    } else if (bossReceipt.phase === 'defeated' || bossReceipt.hp <= 0) return false;
    else if (['pending', 'incoming'].includes(bossReceipt.phase)) {
      if (bossReceipt.hp !== boss.hp || bossReceipt.instanceId !== null || receipt.kills > beforeBoss
        || receipt.wavesCleared >= boss.wave
        || (bossReceipt.phase === 'pending' ? receipt.wavesCleared >= boss.wave - 1 : receipt.wavesCleared < boss.wave - 1)) return false;
    } else if (bossReceipt.instanceId !== `horde-${beforeBoss + 1}` || receipt.wavesCleared !== boss.wave - 1
      || receipt.kills < beforeBoss) return false;
    if (result.winner === 'player' && (!bossReceipt.defeated || bossReceipt.phase !== 'defeated')) return false;
  }
  if (result.winner === 'player') return result.reason === 'horde-cleared'
    && receipt.wavesCleared === protocol.waves.length && receipt.kills === protocol.totalEnemies
    && result.wins.player === 1 && result.wins.opponent === 0;
  return ['horde-ko', 'horde-time'].includes(result.reason) && result.wins.player === 0 && result.wins.opponent === 1;
}

const equalJson = (a, b) => a === b || a !== null && b !== null && typeof a === 'object' && typeof b === 'object'
  && Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(key => Object.hasOwn(b, key) && equalJson(a[key], b[key]));
function validOperationResultV188(config, result) {
  const operation = getXenoTrialsOperationV188(config.activityV119?.id), receipt = result?.operationV188;
  const protocol = getXenoTrialsHordeProtocolV180(operation?.hordeProtocolId), horde = result?.hordeV180;
  if (!operation || !protocol || !record(receipt?.state) || !record(horde) || result.rounds !== 1
    || !record(result.wins) || !['player', 'opponent'].includes(result.winner)
    || result.durationTicks > (operation.roundSeconds + 5) * 120
    || horde.protocolId !== protocol.id || horde.totalEnemies !== protocol.totalEnemies
    || !Number.isInteger(horde.kills) || horde.kills < 0 || horde.kills > protocol.totalEnemies
    || !Number.isInteger(horde.wavesCleared) || horde.wavesCleared < 0 || horde.wavesCleared > protocol.waves.length
    || horde.kills < protocol.waves.slice(0, horde.wavesCleared).reduce((sum, wave) => sum + wave.total, 0)
    || !validateXenoTrialsOperationSnapshotV188(receipt.state, config, { tick: result.durationTicks })
    || !validateXenoTrialsStageHazardsV188(result.stageHazardsV188, { stageId: config.stageId, seed: config.seed, tick: result.durationTicks })) return false;
  const { state, ...summary } = receipt;
  if (!equalJson(getXenoTrialsOperationReceiptV188(state, config), summary)) return false;
  if (result.winner === 'player') return result.reason === 'operation-complete' && state.status === 'completed'
    && result.wins.player === 1 && result.wins.opponent === 0;
  return ({ 'operation-failed': 'structure-destroyed', 'operation-time': 'time', 'operation-ko': 'player-ko' })[result.reason] === state.failureReason
    && state.status === 'failed'
    && result.wins.player === 0 && result.wins.opponent === 1;
}

/** Consume the saved ticket once, only for a finished matching engine result. */
export function settleXenoTrialsV96(value, result) {
  const state = normalizeXenoTrialsProgressV96(value), ticket = state.pending;
  const checkpoint = ticket?.checkpointV186?.snapshot;
  const checkpointMatches = !checkpoint || result && result.durationTicks >= checkpoint.tick
    && result.hordeV180?.kills >= checkpoint.hordeV180.totalKills
    && result.hordeV180?.wavesCleared >= checkpoint.hordeV180.wavesCleared
    && Object.entries(checkpoint.fighters[0].stats).every(([key, amount]) => (result.playerStats?.[key] || 0) >= amount)
    && (!checkpoint.operationV188 || isXenoTrialsOperationForwardV188(checkpoint.operationV188, result.operationV188?.state)
      && isXenoTrialsStageHazardsForwardV188(checkpoint.stageHazardsV188, result.stageHazardsV188));
  const operation = ticket?.config.activityV119?.branch === 'operations';
  const horde = ticket?.config.activityV119?.branch === 'horde';
  const outcomeValid = operation ? result && validOperationResultV188(ticket.config, result)
    : horde ? result && !result.operationV188 && !result.stageHazardsV188 && validHordeResultV180(ticket.config, result)
    : result && !result.hordeV180 && Number.isInteger(result.rounds) && result.rounds >= 2 && result.rounds <= 5
      && ['ko', 'double-ko', 'time'].includes(result.reason)
      && record(result.wins) && ['player', 'opponent'].every(k => Number.isInteger(result.wins[k]) && result.wins[k] >= 0 && result.wins[k] <= 2)
      && result.wins.player + result.wins.opponent <= result.rounds
      && (result.winner === 'draw' ? result.rounds === 5 && result.wins.player === result.wins.opponent && result.wins.player < 2
        : result.wins[result.winner] > result.wins[result.winner === 'player' ? 'opponent' : 'player']
          && (result.wins[result.winner] === 2 || result.rounds === 5));
  const modeMatches = !ticket?.config.activityV119 || result?.activityV119?.branch === ticket.config.activityV119.branch
    && result?.activityV119?.id === ticket.config.activityV119.id
    && record(result?.rulesV119) && JSON.stringify(normalizeXenoTrialsRulesV119(result.rulesV119)) === JSON.stringify(ticket.config.rulesV119)
    && record(result?.playerStats) && ['hits', 'damage', 'blocks', 'specials'].every(k => Number.isInteger(result.playerStats[k]) && result.playerStats[k] >= 0);
  if (!ticket || result?.completed !== true || result.matchId !== ticket.matchId
    || !modeMatches || !checkpointMatches
    || !['player', 'opponent', 'draw'].includes(result.winner)
    || !['playerId', 'opponentId', 'factionId', 'stageId', 'difficulty', 'seed'].every(k => result[k] === ticket.config[k])
    || !['player', 'opponent'].every(side => result[`${side}Variant`] === (ticket.config[`${side}Id`] === 'arachnoid' ? ticket.config[`${side}Variant`] : null))
    || !Number.isInteger(result.durationTicks) || result.durationTicks <= 0
    || !outcomeValid)
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
