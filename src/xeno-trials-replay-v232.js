import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_STAGES_V96, XENO_TRIALS_FACTIONS_V96 } from './xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, nextXenoTrialsRoundV96,
  setXenoTrialsPausedV96, releaseXenoTrialsControlsV150, getXenoTrialsSnapshotV96 } from './xeno-trials-engine-v96.js';

/** Match replay, deliberately separate from the eight-second training loop V209.
 * The only imported simulation state is a canonical initial configuration. Every
 * later state is produced by the native engine, including its CPU brain and RNG.
 * No profile, progression transaction, callback, DOM or wall clock is used here.
 */
export const XENO_TRIALS_REPLAY_VERSION_V232 = 232;
export const XENO_TRIALS_REPLAY_STORAGE_KEY_V232 = 'atf:xeno-trials:replays:v232';
export const XENO_TRIALS_REPLAY_LIMITS_V232 = Object.freeze({
  bytes: 768 * 1024, seconds: 20 * 60, operations: 160000, runs: 16000,
  lifecycle: 2048, checks: 3000, stored: 4, checkInterval: 240,
});
// SHA-256 of the sorted, transitive ES-module source closure of the native
// engine. The verifier can refresh this line with --update-source-hash after a
// deliberate engine change; older source identities are never played silently.
export const XENO_TRIALS_REPLAY_SOURCE_HASH_V232 = '8e98772f1c698e8079e7c9a869df8cb6014e57aad77f4854b0b3b93861b20f5f';
export const XENO_TRIALS_REPLAY_ACTIONS_V232 = Object.freeze([
  'left', 'right', 'jump', 'guard', 'light', 'heavy', 'special', 'super',
  'crouch', 'evade', 'antiAir', 'parry', 'signature2', 'signature3', 'tag', 'assist', 'interact',
]);
const LIMITS = XENO_TRIALS_REPLAY_LIMITS_V232;
const FORMAT = 'atf-xeno-trials-match-replay';
const SIDES = ['player', 'opponent'];
const MAX_MASK = 2 ** XENO_TRIALS_REPLAY_ACTIONS_V232.length - 1;
const HEX = /^[a-f0-9]{64}$/;
const IDS = new Set(XENO_TRIALS_FIGHTERS_V96.map(f => f.id));
const CONFIG_KEYS = ['playerId', 'opponentId', 'playerVariant', 'opponentVariant', 'factionId', 'stageId',
  'difficulty', 'roundsToWin', 'roundSeconds', 'seed', 'rulesV119', 'introSeconds', 'holdRoundTransition', 'matchId'];
const RULE_KEYS = ['noSpecial', 'specialLockSeconds', 'initialHp', 'goal', 'timeLimitSeconds'];
const TOP_KEYS = ['format', 'version', 'sourceHash', 'id', 'config', 'runs', 'checks', 'operations', 'durationSeconds', 'ticks', 'complete', 'finalHash'];
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const number = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
const keys = (value, names) => record(value) && Object.keys(value).length === names.length
  && names.every(name => Object.hasOwn(value, name));
const copy = value => JSON.parse(JSON.stringify(value));
const bytes = value => new TextEncoder().encode(value).byteLength;
const maskFor = controls => XENO_TRIALS_REPLAY_ACTIONS_V232.reduce((mask, key, index) =>
  mask + (controls?.[key] === true ? 2 ** index : 0), 0);
const inputFor = mask => Object.fromEntries(XENO_TRIALS_REPLAY_ACTIONS_V232
  .filter((_, index) => (mask & 2 ** index) !== 0).map(key => [key, true]));
const sorted = value => Array.isArray(value) ? value.map(sorted) : record(value)
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])])) : value;
const canonical = value => JSON.stringify(sorted(copy(value)));

// Synchronous SHA-256 keeps capture/verification available in the same browser
// and Node environments as the engine, without an asynchronous frame race.
const SHA_K = Object.freeze([
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
]);
function sha256(source) {
  const data = new TextEncoder().encode(source), length = Math.ceil((data.length + 9) / 64) * 64;
  const buffer = new Uint8Array(length); buffer.set(data); buffer[data.length] = 128;
  const view = new DataView(buffer.buffer);
  view.setUint32(length - 8, Math.floor(data.length / 0x20000000)); view.setUint32(length - 4, data.length * 8);
  const h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const w = new Uint32Array(64), rotate = (v, n) => (v >>> n) | (v << (32 - n));
  for (let offset = 0; offset < length; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15], b = w[i - 2];
      w[i] = w[i - 16] + (rotate(a, 7) ^ rotate(a, 18) ^ (a >>> 3)) + w[i - 7]
        + (rotate(b, 17) ^ rotate(b, 19) ^ (b >>> 10));
    }
    let [a,b,c,d,e,f,g,j] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (j + (rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25)) + ((e & f) ^ (~e & g)) + SHA_K[i] + w[i]) >>> 0;
      const t2 = ((rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      j=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
    }
    [a,b,c,d,e,f,g,j].forEach((v, i) => { h[i] = (h[i] + v) >>> 0; });
  }
  return h.map(value => value.toString(16).padStart(8, '0')).join('');
}
export const hashXenoTrialsReplayStateV232 = match => sha256(canonical(match));

function validMember(member) {
  if (!keys(member, ['id', 'variant']) || !IDS.has(member.id)) return false;
  const definition = XENO_TRIALS_FIGHTERS_V96.find(f => f.id === member.id);
  return definition.variants.length ? definition.variants.includes(member.variant) : member.variant === null;
}
function validExhibition(value) {
  if (!keys(value, ['mode', 'assists', 'controls', 'playerTeam', 'opponentTeam']) || !['duel', 'tag'].includes(value.mode)
    || typeof value.assists !== 'boolean' || value.mode === 'duel' && value.assists || !['cpu', 'local'].includes(value.controls)) return false;
  const count = value.mode === 'tag' ? 2 : 1;
  return [value.playerTeam, value.opponentTeam].every(team => Array.isArray(team) && team.length === count && team.every(validMember));
}
function normalizedConfig(value) {
  const names = value?.exhibitionV232 ? [...CONFIG_KEYS, 'exhibitionV232'] : CONFIG_KEYS;
  if (!keys(value, names) || !IDS.has(value.playerId) || !IDS.has(value.opponentId)
    || !validMember({ id: value.playerId, variant: value.playerVariant })
    || !validMember({ id: value.opponentId, variant: value.opponentVariant })
    || !XENO_TRIALS_STAGES_V96.some(s => s.id === value.stageId)
    || !XENO_TRIALS_FACTIONS_V96.some(f => f.id === value.factionId)
    || !['easy', 'normal', 'hard'].includes(value.difficulty)
    || !integer(value.seed, 1, 0xffffffff) || !integer(value.roundsToWin, 1, 3)
    || !number(value.roundSeconds, 15, 180) || !number(value.introSeconds, 0, 5)
    || typeof value.holdRoundTransition !== 'boolean' || typeof value.matchId !== 'string' || !/^[a-zA-Z0-9_-]{1,96}$/.test(value.matchId)
    || !keys(value.rulesV119, RULE_KEYS) || value.exhibitionV232 && !validExhibition(value.exhibitionV232)) return null;
  // Canonicalization also checks all rules and the active/team identities.
  const config = createXenoTrialsMatchV96(copy(value)).config;
  return canonical(config) === canonical(value) ? config : null;
}

/** Structural admission is cheap and bounded. It does not claim that a file's
 * hashes prove honest play; full native resimulation is the verification step. */
export function normalizeXenoTrialsReplayV232(value) {
  try {
    if (!keys(value, TOP_KEYS) || value.format !== FORMAT || value.version !== 232
      || value.sourceHash !== XENO_TRIALS_REPLAY_SOURCE_HASH_V232
      || typeof value.id !== 'string' || !/^xtr232-[a-f0-9]{24}$/.test(value.id)
      || !integer(value.operations, 1, LIMITS.operations) || !number(value.durationSeconds, Number.MIN_VALUE, LIMITS.seconds)
      || !integer(value.ticks, 0, LIMITS.seconds * 120) || typeof value.complete !== 'boolean' || !HEX.test(value.finalHash)
      || !Array.isArray(value.runs) || !value.runs.length || value.runs.length > LIMITS.runs
      || !Array.isArray(value.checks) || !value.checks.length || value.checks.length > LIMITS.checks) return null;
    const config = normalizedConfig(value.config); if (!config) return null;
    let operations = 0, seconds = 0, lifecycle = 0, stepCalls = 0;
    const runs = [];
    for (const run of value.runs) {
      if (!Array.isArray(run)) return null;
      if (typeof run[0] === 'number') {
        if (run.length !== 4 || !integer(run[0], 1, LIMITS.operations) || !number(run[1], Number.MIN_VALUE, .25)
          || !integer(run[2], 0, MAX_MASK) || run[3] !== null && !integer(run[3], 0, MAX_MASK)) return null;
        if (config.exhibitionV232 && (config.exhibitionV232.controls === 'cpu' ? run[3] !== null : run[3] === null)) return null;
        operations += run[0]; stepCalls += run[0];
        // Preserve the exact addition order used by capture; do not replace it
        // with multiplication, which changes floating-point duration residues.
        for (let n = 0; n < run[0]; n++) seconds += run[1];
      } else {
        if (++lifecycle > LIMITS.lifecycle) return null;
        operations++;
        if (run[0] === 'pause') { if (run.length !== 2 || typeof run[1] !== 'boolean') return null; }
        else if (run[0] === 'release') { if (run.length !== 3 || !SIDES.includes(run[1]) || !integer(run[2], 0, MAX_MASK)) return null; }
        else if (run[0] !== 'round' || run.length !== 1) return null;
      }
      if (operations > LIMITS.operations || seconds > LIMITS.seconds) return null;
      runs.push([...run]);
    }
    if (!stepCalls || operations !== value.operations || seconds !== value.durationSeconds) return null;
    let previous = 0;
    for (const check of value.checks) {
      if (!Array.isArray(check) || check.length !== 2 || !integer(check[0], previous + 1, operations) || !HEX.test(check[1])) return null;
      previous = check[0];
    }
    if (previous !== operations || value.checks.at(-1)[1] !== value.finalHash) return null;
    const result = { format: FORMAT, version: 232, sourceHash: value.sourceHash, id: value.id,
      config: copy(config), runs, checks: value.checks.map(check => [...check]), operations,
      durationSeconds: seconds, ticks: value.ticks, complete: value.complete, finalHash: value.finalHash };
    if (bytes(JSON.stringify(result)) > LIMITS.bytes) return null;
    if (value.id !== replayId(result)) return null;
    return result;
  } catch { return null; }
}
function replayId(replay) {
  return 'xtr232-' + sha256(canonical([replay.sourceHash, replay.config, replay.runs, replay.checks, replay.finalHash])).slice(0, 24);
}
export function importXenoTrialsReplayV232(source) {
  if (typeof source !== 'string' || source.length > LIMITS.bytes || bytes(source) > LIMITS.bytes) return null;
  try { return normalizeXenoTrialsReplayV232(JSON.parse(source)); } catch { return null; }
}
export function exportXenoTrialsReplayV232(value) {
  const replay = normalizeXenoTrialsReplayV232(value); return replay ? JSON.stringify(replay) : null;
}

/** Call beforeStep/afterStep around each real native call. Lifecycle recorders
 * are called immediately AFTER an accepted native mutation, including releases
 * while presentation blocks simulation. A failed/aborted recording is unsavable.
 */
export function createXenoTrialsReplayRecorderV232(match) {
  try {
    const config = normalizedConfig(match?.config);
    if (!config || hashXenoTrialsReplayStateV232(match) !== hashXenoTrialsReplayStateV232(createXenoTrialsMatchV96(config))) return null;
    let pending = null, stopped = false, issue = null, operations = 0, seconds = 0, lifecycle = 0, steps = 0;
    const runs = [], checks = [];
    const fail = reason => { issue = reason; stopped = true; pending = null; return false; };
    const check = state => {
      if (checks.at(-1)?.[0] === operations) checks.pop();
      checks.push([operations, hashXenoTrialsReplayStateV232(state)]);
      if (checks.length > LIMITS.checks) return fail('check-limit');
      return true;
    };
    const append = (state, row, duration = 0) => {
      if (stopped || ++operations > LIMITS.operations || (seconds += duration) > LIMITS.seconds) return fail('duration-limit');
      const last = runs.at(-1);
      if (typeof row[0] === 'number' && last?.length === 4 && last.slice(1).every((value, i) => value === row[i + 1])) last[0]++;
      else runs.push(row);
      if (runs.length > LIMITS.runs) return fail('volume-limit');
      if (operations % LIMITS.checkInterval === 0 || typeof row[0] !== 'number') check(state);
      return !stopped;
    };
    const lifecycleEntry = (state, row) => {
      if (stopped || pending) return pending ? fail('unfinished-step') : false;
      if (++lifecycle > LIMITS.lifecycle) return fail('lifecycle-limit');
      return append(state, row);
    };
    return Object.freeze({
      beforeStep(state, dt, playerInput = {}, opponentInput = null) {
        if (stopped || !Number.isFinite(dt) || dt <= 0 || state?.paused || state?.phase === 'match-over') return false;
        if (state !== match || pending) return fail('capture-order');
        pending = [1, Math.min(.25, dt), maskFor(playerInput), opponentInput === null ? null : maskFor(opponentInput)];
        return true;
      },
      afterStep(state) {
        if (stopped || !pending) return false;
        if (state !== match) return fail('capture-state');
        const row = pending; pending = null; steps++; return append(state, row, row[1]);
      },
      recordPause(state, paused) {
        if (state !== match || state.phase === 'match-over' || state.paused !== paused) return false;
        return lifecycleEntry(state, ['pause', paused]);
      },
      recordRelease(state, side, controls = {}) {
        if (state !== match || state.phase === 'match-over' || !SIDES.includes(side)) return false;
        return lifecycleEntry(state, ['release', side, maskFor(controls)]);
      },
      recordRoundTransition(state) {
        if (state !== match || state.paused || !['active', 'intro'].includes(state.phase) || state.round < 2) return false;
        return lifecycleEntry(state, ['round']);
      },
      finish(state = match) {
        if (stopped || pending || state !== match || !steps) return null;
        check(state); stopped = true; if (issue) return null;
        const replay = { format: FORMAT, version: 232, sourceHash: XENO_TRIALS_REPLAY_SOURCE_HASH_V232,
          id: '', config: copy(config), runs, checks, operations, durationSeconds: seconds,
          ticks: state.tick, complete: state.phase === 'match-over' && state.result?.completed === true,
          finalHash: checks.at(-1)[1] };
        replay.id = replayId(replay);
        const admitted = normalizeXenoTrialsReplayV232(replay);
        if (!admitted) issue = 'invalid-capture';
        return admitted;
      },
      abort() { return fail('aborted'); },
      getState() { return { active: !stopped, issue, operations, durationSeconds: seconds, runs: runs.length, steps }; },
    });
  } catch { return null; }
}

/** Isolated reader. Seeking always rebuilds from operation zero: no checkpoint
 * can contain stale reserve references, CPU memory, RNG or edge/rearm controls.
 * getState returns detached data, and every exposed verdict has version 232 so
 * it cannot be mistaken for a live V96 progression receipt.
 */
export function createXenoTrialsReplayPlayerV232(value) {
  const replay = normalizeXenoTrialsReplayV232(value); if (!replay) return null;
  let match, position, runIndex, runOffset, checkIndex, timeBudget = 0, paused = true, issue = null;
  const reset = () => { match = createXenoTrialsMatchV96(replay.config); position = 0; runIndex = 0; runOffset = 0; checkIndex = 0; timeBudget = 0; issue = null; };
  reset();
  function advanceOne() {
    if (issue || position >= replay.operations) return false;
    const row = replay.runs[runIndex];
    if (typeof row[0] === 'number') {
      stepXenoTrialsMatchV96(match, row[1], inputFor(row[2]), row[3] === null ? null : inputFor(row[3]));
      if (++runOffset === row[0]) { runOffset = 0; runIndex++; }
    } else {
      let accepted;
      if (row[0] === 'pause') accepted = setXenoTrialsPausedV96(match, row[1]);
      else if (row[0] === 'release') accepted = releaseXenoTrialsControlsV150(match, row[1], inputFor(row[2]));
      else accepted = nextXenoTrialsRoundV96(match);
      runIndex++;
      if (!accepted) { issue = 'lifecycle-divergence'; paused = true; return false; }
    }
    position++;
    if (replay.checks[checkIndex]?.[0] === position) {
      if (hashXenoTrialsReplayStateV232(match) !== replay.checks[checkIndex][1]) { issue = 'state-divergence'; paused = true; return false; }
      checkIndex++;
    }
    if (position === replay.operations) {
      paused = true;
      if (match.tick !== replay.ticks || (match.phase === 'match-over' && match.result?.completed === true) !== replay.complete) issue = 'verdict-divergence';
    }
    return !issue;
  }
  const marker = () => ({ version: 232, id: replay.id, readOnly: true, rewardEligible: false,
    position, operations: replay.operations, paused, ended: position === replay.operations && !issue,
    verified: position === replay.operations && !issue, issue });
  function verdict() {
    return match.result ? { ...copy(match.result), version: 232, replayV232: true, rewardEligible: false } : null;
  }
  return Object.freeze({
    play() { if (issue || position === replay.operations) return false; timeBudget = 0; paused = false; return true; },
    pause() { paused = true; timeBudget = 0; return true; },
    restart() { reset(); paused = true; return true; },
    step(count = 1) {
      if (!integer(count, 1, LIMITS.operations)) return false;
      timeBudget = 0;
      for (let i = 0; i < count && position < replay.operations; i++) if (!advanceOne()) return false;
      return !issue;
    },
    advance(count = 1) {
      if (paused || !integer(count, 1, LIMITS.operations)) return false;
      timeBudget = 0;
      for (let i = 0; i < count && !paused; i++) if (!advanceOne()) return false;
      return !issue;
    },
    advanceTime(dtSeconds) {
      if (paused || issue || !Number.isFinite(dtSeconds) || dtSeconds < 0) return false;
      timeBudget += Math.min(dtSeconds, .25);
      while (!paused && position < replay.operations) {
        const row = replay.runs[runIndex];
        if (typeof row[0] === 'number') {
          if (row[1] > timeBudget + 1e-10) break;
          timeBudget = Math.max(0, timeBudget - row[1]);
        }
        // Native pause/release/round calls have no simulation duration. They
        // retain their recorded order and never accrue browser wall-clock debt.
        if (!advanceOne()) return false;
      }
      return !issue;
    },
    seek(target) {
      if (!integer(target, 0, replay.operations)) return false;
      reset(); paused = true;
      for (let i = 0; i < target; i++) if (!advanceOne()) return false;
      return !issue;
    },
    getState() { return { ...getXenoTrialsSnapshotV96(match), result: verdict(), replayV232: marker() }; },
    getView: marker,
    getVerdict: verdict,
    getDigest() { return hashXenoTrialsReplayStateV232(match); },
  });
}

export function verifyXenoTrialsReplayV232(value) {
  const player = createXenoTrialsReplayPlayerV232(value);
  if (!player) return { valid: false, issue: 'replay-format' };
  player.step(value.operations);
  const view = player.getView();
  return { valid: view.verified, issue: view.issue, ticks: player.getState().tick, verdict: player.getVerdict() };
}

/** A separate, bounded LOCAL archive. Failure never writes to the campaign or
 * standalone profile. Appending requires complete native verification first. */
export function listXenoTrialsReplaysV232(storage) {
  try {
    const raw = storage?.getItem(XENO_TRIALS_REPLAY_STORAGE_KEY_V232);
    if (raw == null) return [];
    if (typeof raw !== 'string' || raw.length > LIMITS.bytes * LIMITS.stored + 1024 || bytes(raw) > LIMITS.bytes * LIMITS.stored + 1024) return [];
    const archive = JSON.parse(raw);
    if (!keys(archive, ['version', 'replays']) || archive.version !== 232 || !Array.isArray(archive.replays) || archive.replays.length > LIMITS.stored) return [];
    const result = archive.replays.map(normalizeXenoTrialsReplayV232);
    return result.every(Boolean) ? result : [];
  } catch { return []; }
}
export function appendXenoTrialsReplayV232(storage, value) {
  const replay = normalizeXenoTrialsReplayV232(value);
  if (!replay || !verifyXenoTrialsReplayV232(replay).valid) return { saved: false, issue: 'replay-invalid' };
  try {
    const replays = [replay, ...listXenoTrialsReplaysV232(storage).filter(entry => entry.id !== replay.id)].slice(0, LIMITS.stored);
    storage.setItem(XENO_TRIALS_REPLAY_STORAGE_KEY_V232, JSON.stringify({ version: 232, replays }));
    return { saved: true, id: replay.id, count: replays.length, issue: null };
  } catch { return { saved: false, issue: 'storage-unavailable' }; }
}
export function removeXenoTrialsReplayV232(storage, id) {
  if (typeof id !== 'string' || !/^xtr232-[a-f0-9]{24}$/.test(id)) return { removed: false, issue: 'replay-id' };
  try {
    const current = listXenoTrialsReplaysV232(storage), replays = current.filter(replay => replay.id !== id);
    if (replays.length === current.length) return { removed: false, issue: 'replay-missing' };
    storage.setItem(XENO_TRIALS_REPLAY_STORAGE_KEY_V232, JSON.stringify({ version: 232, replays }));
    return { removed: true, count: replays.length, issue: null };
  } catch { return { removed: false, issue: 'storage-unavailable' }; }
}
