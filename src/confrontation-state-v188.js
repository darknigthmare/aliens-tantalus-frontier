// V188 — « Face-à-face sans tir, audience à choix de pièces » (spec 010, bible
// §1.3 « elle cite », §5.6 step 8, §5.7, §7.2 S2). Pure rules, no imports, no DOM.
//
// An audience is a sequence of rounds. In each round the interlocutor cites a
// clause, an order or a directive; Echo-9 answers by presenting one piece of the
// QZ17 dossier, or stays silent. The right piece at the right round gains ground
// (« décisive » +2, « partielle » +1) and is then spent; a piece that does not
// answer the citation costs credibility and is not spent. The audience is won as
// soon as the ground reaches its target, lost when credibility reaches 0 or when
// the last round passes. Nothing here grants a piece: the held pieces are always
// read by the caller from the save (story-dossier-v188.js).
//
// Persistence is additive: `storyCampaignV188.confrontationsV188[id]` (absent from
// older saves), normalised by `normalizeConfrontationsV188`, called from
// `normalizeStoryCampaignV188`. The validator of src/save.js is unchanged.

export const CONFRONTATION_SCHEMA_V188 = 188;
export const CONFRONTATION_STATUSES_V188 = Object.freeze(['open', 'won', 'lost']);
export const CONFRONTATION_RESULTS_V188 = Object.freeze(['decisive', 'partial', 'wrong', 'silence']);
export const CONFRONTATION_GAINS_V188 = Object.freeze({ decisive: 2, partial: 1, wrong: 0, silence: 0 }); // [PROPOSÉ]
export const CONFRONTATION_WRONG_COST_V188 = 1; // [PROPOSÉ] credibility lost by a piece that does not answer
const ID = /^[a-z0-9][a-z0-9-]{1,63}$/;
const PIECE = /^[a-z0-9][a-z0-9-]{1,47}$/;
const MAX_ROUNDS = 16;
const MAX_ENTRIES = 16;

const int = (value, min, max, fallback = min) => {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
};

/** Checks a confrontation definition (data entry). Returns the list of problems, empty when valid. */
export function validateConfrontationDefinitionV188(def) {
  const errors = [];
  const text = (value, label) => { if (!value || typeof value.fr !== 'string' || typeof value.en !== 'string' || !value.fr.trim() || !value.en.trim()) errors.push(`${label}: FR and EN text required`); };
  if (!def || typeof def !== 'object') return ['definition: object required'];
  if (!ID.test(def.id || '')) errors.push('id: lowercase id required');
  text(def.title, 'title'); text(def.intro, 'intro');
  if (!def.interlocutor || typeof def.interlocutor !== 'object') errors.push('interlocutor: required');
  else { text(def.interlocutor.name, 'interlocutor.name'); if (!['crt-bust', 'core-eye'].includes(def.interlocutor.portrait)) errors.push('interlocutor.portrait: crt-bust or core-eye'); }
  if (!Array.isArray(def.pieces) || !def.pieces.length || def.pieces.some(id => !PIECE.test(id))) errors.push('pieces: list of piece ids required');
  const pieces = new Set(def.pieces || []);
  if (!Number.isInteger(def.credibility) || def.credibility < 1 || def.credibility > 9) errors.push('credibility: 1 to 9');
  if (!Array.isArray(def.rounds) || !def.rounds.length || def.rounds.length > MAX_ROUNDS) errors.push(`rounds: 1 to ${MAX_ROUNDS}`);
  const decisiveOf = new Map();
  (def.rounds || []).forEach((round, index) => {
    if (!ID.test(round?.id || '')) errors.push(`rounds[${index}].id: required`);
    text(round?.citation, `rounds[${index}].citation`); text(round?.source, `rounds[${index}].source`);
    const counters = round?.counters || {};
    const entries = Object.entries(counters);
    if (!entries.length) errors.push(`rounds[${index}].counters: at least one`);
    for (const [piece, kind] of entries) {
      if (!pieces.has(piece)) errors.push(`rounds[${index}].counters.${piece}: not a piece of this audience`);
      if (kind !== 'decisive' && kind !== 'partial') errors.push(`rounds[${index}].counters.${piece}: decisive or partial`);
      if (kind === 'decisive') { if (decisiveOf.has(piece)) errors.push(`${piece}: decisive in two rounds`); decisiveOf.set(piece, index); }
    }
    if (round?.replies?.decisive) text(round.replies.decisive, `rounds[${index}].replies.decisive`);
  });
  const maxGround = (def.rounds || []).length * CONFRONTATION_GAINS_V188.decisive;
  if (!Number.isInteger(def.target) || def.target < 1 || def.target > maxGround) errors.push(`target: 1 to ${maxGround}`);
  for (const key of ['decisive', 'partial', 'wrong', 'silence']) text(def.replies?.[key], `replies.${key}`);
  for (const key of ['won', 'lost']) { text(def.endings?.[key], `endings.${key}`); if (typeof def.outcomes?.[key] !== 'string') errors.push(`outcomes.${key}: decision value required`); }
  return errors;
}

export function createConfrontationRunV188(def) {
  return { schema: CONFRONTATION_SCHEMA_V188, status: 'open', round: 0, ground: 0, credibility: def.credibility, spent: [], log: [] };
}

/** Normalises one stored run against its definition; null when unusable. */
export function normalizeConfrontationRunV188(raw, def = null) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const rounds = def ? def.rounds.length : MAX_ROUNDS, credibility = def ? def.credibility : 9, pieces = def ? new Set(def.pieces) : null;
  const status = CONFRONTATION_STATUSES_V188.includes(raw.status) ? raw.status : 'open';
  const log = [];
  for (const entry of Array.isArray(raw.log) ? raw.log.slice(0, MAX_ROUNDS) : []) {
    const result = CONFRONTATION_RESULTS_V188.includes(entry?.result) ? entry.result : null;
    const piece = entry?.piece === null || entry?.piece === undefined ? null : PIECE.test(entry.piece) && (!pieces || pieces.has(entry.piece)) ? entry.piece : undefined;
    if (!result || piece === undefined || (result === 'silence') !== (piece === null)) continue;
    log.push({ round: int(entry.round, 0, rounds - 1), piece, result });
  }
  const spent = [...new Set((Array.isArray(raw.spent) ? raw.spent : []).filter(id => typeof id === 'string' && PIECE.test(id) && (!pieces || pieces.has(id))))];
  const run = { schema: CONFRONTATION_SCHEMA_V188, status, round: int(raw.round, 0, rounds), ground: int(raw.ground, 0, rounds * 2),
    credibility: int(raw.credibility, 0, credibility, credibility), spent, log };
  if (run.status === 'open' && (run.credibility === 0 || run.round >= rounds)) run.status = 'lost';
  if (def && run.status === 'open' && run.ground >= def.target) run.status = 'won';
  return run;
}

/** `storyCampaignV188.confrontationsV188`: present only once an audience has started. */
export function normalizeConfrontationsV188(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out = {};
  for (const [id, run] of Object.entries(raw).slice(0, MAX_ENTRIES)) {
    if (!ID.test(id)) continue;
    const normalized = normalizeConfrontationRunV188(run);
    if (normalized) out[id] = normalized;
  }
  return Object.keys(out).length ? out : null;
}

/** How a piece answers the current round: 'decisive', 'partial' or 'wrong'. */
export function classifyPieceV188(def, roundIndex, pieceId) {
  const kind = def.rounds[roundIndex]?.counters?.[pieceId];
  return kind === 'decisive' || kind === 'partial' ? kind : 'wrong';
}

/**
 * One exchange. `pieceId` null = stay silent. `heldIds` are the pieces held in
 * the save. Returns { run, result } with a new run object, or null when the move
 * is refused (audience closed, piece not held, already spent, not in this audience).
 */
export function applyConfrontationMoveV188(def, run, pieceId, heldIds = []) {
  if (!run || run.status !== 'open' || run.round >= def.rounds.length) return null;
  const held = new Set(heldIds);
  if (pieceId !== null) {
    if (!def.pieces.includes(pieceId) || !held.has(pieceId) || run.spent.includes(pieceId)) return null;
  }
  const result = pieceId === null ? 'silence' : classifyPieceV188(def, run.round, pieceId);
  const next = { ...run, spent: [...run.spent], log: [...run.log, { round: run.round, piece: pieceId, result }] };
  next.ground += CONFRONTATION_GAINS_V188[result];
  if (result === 'decisive' || result === 'partial') next.spent.push(pieceId);
  if (result === 'wrong') next.credibility = Math.max(0, next.credibility - CONFRONTATION_WRONG_COST_V188);
  next.round += 1;
  if (next.ground >= def.target) next.status = 'won';
  else if (next.credibility <= 0 || next.round >= def.rounds.length) next.status = 'lost';
  return { run: next, result };
}

/** Best ground reachable from this run with these pieces (exhaustive; rounds are few). */
export function bestReachableGroundV188(def, run, heldIds = []) {
  const held = heldIds.filter(id => def.pieces.includes(id) && !run.spent.includes(id));
  const memo = new Map();
  const walk = (round, used) => {
    if (round >= def.rounds.length) return 0;
    const key = `${round}:${[...used].sort().join(',')}`;
    if (memo.has(key)) return memo.get(key);
    let best = walk(round + 1, used); // silence
    for (const piece of held) {
      if (used.has(piece)) continue;
      const kind = classifyPieceV188(def, round, piece);
      if (kind === 'wrong') continue;
      const nextUsed = new Set(used); nextUsed.add(piece);
      best = Math.max(best, CONFRONTATION_GAINS_V188[kind] + walk(round + 1, nextUsed));
    }
    memo.set(key, best); return best;
  };
  return run.ground + walk(run.round, new Set());
}

/** True when the audience can still be won (used by the UI hint and the tests). */
export const confrontationWinnableV188 = (def, run, heldIds) => run.status === 'won' || (run.status === 'open' && bestReachableGroundV188(def, run, heldIds) >= def.target);
