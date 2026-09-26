import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_FACTIONS_V96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';

const fighterIds = new Set(XENO_TRIALS_FIGHTERS_V96.map(f => f.id));
const factionIds = new Set(XENO_TRIALS_FACTIONS_V96.map(f => f.id));
const stageIds = new Set(XENO_TRIALS_STAGES_V96.map(f => f.id));
export const XENO_TRIALS_STARTERS_V96 = Object.freeze(['warrior', 'runner', 'arachnoid']);
const integer = (value, max = 1000000) => Number.isFinite(value) ? Math.max(0, Math.min(max, Math.floor(value))) : 0;
const record = value => value && typeof value === 'object' && !Array.isArray(value);

/** This is an isolated simulation economy, never campaign money or canonical lore. */
export function createXenoTrialsProgressV96() {
  return { schema: 96, serial: 0, credits: 150, xp: 0, wins: 0, losses: 0, draws: 0,
    unlocked: [...XENO_TRIALS_STARTERS_V96], factionWins: {}, ledger: [], pending: null };
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
    roundsToWin: 2, roundSeconds: [60, 75, 99, 120].includes(Number(value.roundSeconds)) ? Number(value.roundSeconds) : 99
  };
}

/** Whitelist persisted fields; malformed tickets cannot settle a different duel. */
export function normalizeXenoTrialsProgressV96(value) {
  const base = createXenoTrialsProgressV96();
  if (!record(value) || value.schema !== 96) return base;
  for (const key of ['serial', 'credits', 'xp', 'wins', 'losses', 'draws']) base[key] = integer(value[key]);
  base.unlocked = [...new Set([...base.unlocked, ...(Array.isArray(value.unlocked) ? value.unlocked.filter(id => fighterIds.has(id)) : [])])];
  for (const id of factionIds) base.factionWins[id] = integer(value.factionWins?.[id]);
  base.ledger = (Array.isArray(value.ledger) ? value.ledger : []).filter(e => record(e)
    && /^xt96-\d+$/.test(e.matchId) && ['player', 'opponent', 'draw', 'abandoned'].includes(e.winner))
    .slice(-50).map(e => ({ matchId: e.matchId, winner: e.winner,
      playerId: fighterIds.has(e.playerId) ? e.playerId : 'warrior',
      opponentId: fighterIds.has(e.opponentId) ? e.opponentId : 'runner',
      factionId: factionIds.has(e.factionId) ? e.factionId : 'containment',
      credits: integer(e.credits, 300), xp: integer(e.xp, 200) }));
  const ticket = value.pending;
  if (record(ticket) && ticket.matchId === `xt96-${base.serial}` && base.serial > 0
    && record(ticket.config) && base.unlocked.includes(ticket.config.playerId)
    && Number.isInteger(ticket.config.seed) && ticket.config.seed > 0 && ticket.config.seed <= 0x7fffffff
    && !base.ledger.some(e => e.matchId === ticket.matchId)) {
    base.pending = { matchId: ticket.matchId, config: { ...normalizeXenoTrialsConfigV96(ticket.config),
      seed: ticket.config.seed, matchId: ticket.matchId } };
  }
  return base;
}

export function getXenoTrialsUnlockCostV96(id) {
  const index = XENO_TRIALS_FIGHTERS_V96.findIndex(f => f.id === id);
  return index < 0 ? null : XENO_TRIALS_STARTERS_V96.includes(id) ? 0 : 100 + index * 20;
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
  if (state.serial >= 1000000) return { applied: false, state, reason: 'serial-limit' };
  state.serial += 1;
  const matchId = `xt96-${state.serial}`;
  state.pending = { matchId, config: { ...config, matchId, seed: 96000 + state.serial } };
  return { applied: true, state, config: state.pending.config };
}

export function abandonXenoTrialsV96(value) {
  const state = normalizeXenoTrialsProgressV96(value);
  if (!state.pending) return { applied: false, state };
  state.ledger.push({ matchId: state.pending.matchId, ...state.pending.config, winner: 'abandoned', credits: 0, xp: 0 });
  state.ledger = state.ledger.slice(-50); state.pending = null;
  return { applied: true, state };
}

/** Consume the saved ticket once, only for a finished matching engine result. */
export function settleXenoTrialsV96(value, result) {
  const state = normalizeXenoTrialsProgressV96(value), ticket = state.pending;
  if (!ticket || result?.completed !== true || result.matchId !== ticket.matchId
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
  const credits = won ? 80 + bonus : draw ? 25 : 15, xp = won ? 60 + bonus : draw ? 20 : 10;
  state.credits = integer(state.credits + credits); state.xp = integer(state.xp + xp);
  state[won ? 'wins' : draw ? 'draws' : 'losses'] += 1;
  if (won) state.factionWins[ticket.config.factionId] = integer(state.factionWins[ticket.config.factionId]) + 1;
  const receipt = { matchId: ticket.matchId, winner: result.winner, playerId: result.playerId,
    opponentId: result.opponentId, factionId: result.factionId, credits, xp };
  state.ledger = [...state.ledger, receipt].slice(-50); state.pending = null;
  return { applied: true, state, receipt };
}
