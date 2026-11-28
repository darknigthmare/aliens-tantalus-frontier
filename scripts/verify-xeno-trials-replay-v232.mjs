import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, nextXenoTrialsRoundV96,
  setXenoTrialsPausedV96, releaseXenoTrialsControlsV150, getXenoTrialsSnapshotV96 } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_STAGES_V96 } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_REPLAY_SOURCE_HASH_V232, XENO_TRIALS_REPLAY_ACTIONS_V232,
  XENO_TRIALS_REPLAY_LIMITS_V232, XENO_TRIALS_REPLAY_STORAGE_KEY_V232,
  hashXenoTrialsReplayStateV232, createXenoTrialsReplayRecorderV232, createXenoTrialsReplayPlayerV232,
  normalizeXenoTrialsReplayV232, importXenoTrialsReplayV232, exportXenoTrialsReplayV232,
  verifyXenoTrialsReplayV232, listXenoTrialsReplaysV232, appendXenoTrialsReplayV232,
  removeXenoTrialsReplayV232 } from '../src/xeno-trials-replay-v232.js';
import { createXenoTrialsProgressV96, beginXenoTrialsV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function nativeSourceHash() {
  const files = new Map();
  function visit(relative) {
    if (files.has(relative)) return;
    const content = fs.readFileSync(path.join(root, relative), 'utf8');
    files.set(relative, content);
    for (const match of content.matchAll(/(?:\bfrom\s*|\bimport\s*)['"]([^'"]+\.js)['"]/g)) {
      if (!match[1].startsWith('.')) continue;
      visit(path.posix.normalize(path.posix.join(path.posix.dirname(relative), match[1])));
    }
  }
  visit('src/xeno-trials-engine-v96.js');
  const digest = createHash('sha256');
  for (const [name, content] of [...files].sort(([a], [b]) => a.localeCompare(b, 'en'))) digest.update(name + '\0' + content + '\0');
  return { hash: digest.digest('hex'), files: files.size };
}
if (process.argv.includes('--update-source-hash')) {
  const { hash, files } = nativeSourceHash(), target = path.join(root, 'src/xeno-trials-replay-v232.js');
  const source = fs.readFileSync(target, 'utf8');
  fs.writeFileSync(target, source.replace(/(export const XENO_TRIALS_REPLAY_SOURCE_HASH_V232 = ')[a-f0-9]{64}(';)/, '$1' + hash + '$2'));
  console.log(`Replay source identity updated: ${hash} (${files} native ES modules).`);
  process.exit(0);
}

// Fixtures: native exhibition configuration and deterministic scripted buttons.
// No injected HP, damage, positions, CPU decisions, clock, DOM, images, profile
// receipts or match snapshots. The one-HP option is an existing native rule.
const dt = 1 / 120;
const clone = value => JSON.parse(JSON.stringify(value));
const config = (extra = {}) => ({ playerId: 'warrior', opponentId: 'arachnoid', seed: 2321969,
  introSeconds: 0, holdRoundTransition: true, roundsToWin: 2, roundSeconds: 15, ...extra });
function capture(options = {}) {
  const match = createXenoTrialsMatchV96(config(options.config));
  const recorder = createXenoTrialsReplayRecorderV232(match); assert.ok(recorder);
  const states = new Map([[0, hashXenoTrialsReplayStateV232(match)]]);
  const invoke = (duration, p1 = {}, p2 = null) => {
    const accepted = recorder.beforeStep(match, duration, p1, p2);
    stepXenoTrialsMatchV96(match, duration, p1, p2);
    if (accepted) assert.equal(recorder.afterStep(match), true);
    return accepted;
  };
  const pause = value => {
    assert.equal(setXenoTrialsPausedV96(match, value), true);
    assert.equal(recorder.recordPause(match, value), true);
  };
  const release = (side, controls = {}) => {
    assert.equal(releaseXenoTrialsControlsV150(match, side, controls), true);
    assert.equal(recorder.recordRelease(match, side, controls), true);
  };
  const next = () => {
    assert.equal(nextXenoTrialsRoundV96(match), true);
    assert.equal(recorder.recordRoundTransition(match), true);
  };
  for (let i = 0; i < (options.calls ?? 8000) && match.phase !== 'match-over'; i++) {
    if (i === 41 || i === 172) { pause(true); release('player'); if (options.direct) release('opponent'); pause(false); }
    if (options.physicalRelease && i === 233) {
      release('player', { ...Object.fromEntries(XENO_TRIALS_REPLAY_ACTIONS_V232.map(action => [action, false])), interact: true });
      release('opponent', Object.fromEntries(XENO_TRIALS_REPLAY_ACTIONS_V232.map(action => [action, false])));
    }
    if (match.phase === 'round-over' && match.phaseTime <= 0) next();
    const duration = options.variable ? [dt, 1 / 60, 1 / 30, .004][i % 4] : dt;
    const p1 = options.playerInput ? options.playerInput(i, match) : options.idle ? {} : { right: i % 240 < 150, left: i % 240 > 210,
      light: i % 51 < 2, heavy: i % 79 < 2, special: i % 293 < 2, jump: i % 191 < 2,
      crouch: i % 211 > 200, parry: i % 179 > 170 };
    const p2 = options.opponentInput ? options.opponentInput(i, match) : options.direct
      ? { left: i % 230 < 130, guard: i % 150 > 115, heavy: i % 71 < 2, special: i % 311 < 2 } : null;
    invoke(duration, p1, p2);
    if (i % 137 === 0) states.set(recorder.getState().operations, hashXenoTrialsReplayStateV232(match));
  }
  const replay = recorder.finish(match); assert.ok(replay, JSON.stringify(recorder.getState()));
  states.set(replay.operations, hashXenoTrialsReplayStateV232(match));
  return { match, replay, states };
}
function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), data };
}

test('V232 replay identity pins the actual native engine and transitive data sources', () => {
  const identity = nativeSourceHash();
  assert.ok(identity.files > 50);
  assert.equal(XENO_TRIALS_REPLAY_SOURCE_HASH_V232, identity.hash,
    'After an intentional engine change run node scripts/verify-xeno-trials-replay-v232.mjs --update-source-hash');
  for (const value of [{ a: 'abc' }, { unicode: 'Épreuve 🧬', integer: 4294967295 }, createXenoTrialsMatchV96(config())]) {
    const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
      ? Object.fromEntries(Object.keys(v).sort().map(key => [key, canonical(v[key])])) : v;
    assert.equal(hashXenoTrialsReplayStateV232(value), createHash('sha256').update(JSON.stringify(canonical(clone(value)))).digest('hex'));
  }
});

test('V232 full CPU match replays the native brain, RNG, round transitions, gates and exact verdict', () => {
  const { match, replay, states } = capture({ variable: true });
  assert.equal(replay.complete, true);
  assert.ok(replay.runs.some(row => row[0] === 'round'));
  assert.ok(replay.runs.filter(row => typeof row[0] === 'number').every(row => row[3] === null));
  assert.ok(match.ai.decisions > 0);
  const reader = createXenoTrialsReplayPlayerV232(importXenoTrialsReplayV232(exportXenoTrialsReplayV232(replay)));
  for (const [position, expected] of states) {
    assert.equal(reader.seek(position), true, `seek ${position}`);
    assert.equal(reader.getDigest(), expected, `full state at ${position}`);
  }
  assert.equal(reader.getView().verified, true);
  assert.deepEqual(reader.getVerdict(), { ...match.result, version: 232, replayV232: true, rewardEligible: false });
  assert.equal(verifyXenoTrialsReplayV232(replay).valid, true);
});

test('V232 direct local inputs retain releases, source switches and accumulator residue', () => {
  const match = createXenoTrialsMatchV96(config({ roundsToWin: 1 }));
  const recorder = createXenoTrialsReplayRecorderV232(match);
  for (let n = 0; n < 520; n++) {
    const p1 = { right: n < 180, light: n % 31 === 0, signature2: n % 127 === 0 };
    const p2 = n < 90 || n > 310 ? null : { left: true, guard: n % 39 < 7, light: n % 47 === 0 };
    const interval = [.001, dt, .019][n % 3];
    recorder.beforeStep(match, interval, p1, p2); stepXenoTrialsMatchV96(match, interval, p1, p2); recorder.afterStep(match);
    if (n === 170) {
      setXenoTrialsPausedV96(match, true); recorder.recordPause(match, true);
      releaseXenoTrialsControlsV150(match, 'opponent', { guard: true }); recorder.recordRelease(match, 'opponent', { guard: true });
      setXenoTrialsPausedV96(match, false); recorder.recordPause(match, false);
    }
  }
  const replay = recorder.finish();
  assert.ok(replay.runs.some(row => typeof row[0] === 'number' && row[3] === null));
  assert.ok(replay.runs.some(row => typeof row[0] === 'number' && typeof row[3] === 'number'));
  const reader = createXenoTrialsReplayPlayerV232(replay);
  assert.equal(reader.step(replay.operations), true);
  assert.equal(reader.getDigest(), hashXenoTrialsReplayStateV232(match));
  assert.equal(reader.getView().verified, true);
});

test('V232 pause, resume, restart, detached states and backward seeking preserve the source match', () => {
  const { replay, match } = capture({ calls: 750, direct: true, variable: true });
  const before = getXenoTrialsSnapshotV96(match), reader = createXenoTrialsReplayPlayerV232(replay);
  const origin = reader.getDigest();
  assert.equal(reader.advance(3), false); assert.equal(reader.getDigest(), origin);
  assert.equal(reader.play(), true); assert.equal(reader.advance(100), true);
  reader.pause(); const pausedHash = reader.getDigest();
  assert.equal(reader.advance(100), false); assert.equal(reader.getDigest(), pausedHash);
  const detached = reader.getState(); detached.fighters[0].hp = -99; detached.config.seed = 1;
  assert.equal(reader.getDigest(), pausedHash);
  assert.equal(reader.seek(20), true); const early = reader.getDigest();
  assert.equal(reader.seek(replay.operations), true); assert.equal(reader.seek(20), true); assert.equal(reader.getDigest(), early);
  assert.equal(reader.seek(-1), false); assert.equal(reader.seek(replay.operations + 1), false);
  reader.restart(); assert.equal(reader.getDigest(), origin); assert.equal(reader.getView().paused, true);
  assert.deepEqual(match, before);
});

test('V232 timed reading follows recorded dt at 30/60/120 Hz and clears debt on pause/seek', () => {
  const { replay } = capture({ calls: 780, variable: true, direct: true });
  for (const hz of [30, 60, 120]) {
    const reader = createXenoTrialsReplayPlayerV232(replay); reader.play();
    for (let i = 0; i < replay.durationSeconds * hz + 10 && !reader.getView().ended; i++) assert.equal(reader.advanceTime(1 / hz), true);
    assert.equal(reader.getView().verified, true, `${hz}Hz`);
    assert.equal(reader.getDigest(), replay.finalHash);
  }
  const reader = createXenoTrialsReplayPlayerV232(replay), origin = reader.getDigest();
  reader.play(); reader.advanceTime(.001); reader.pause();
  assert.equal(reader.advanceTime(100), false); assert.equal(reader.getDigest(), origin);
  reader.play(); reader.advanceTime(.001); assert.equal(reader.getDigest(), origin);
  reader.seek(0); reader.play(); reader.advanceTime(.001); assert.equal(reader.getDigest(), origin);
  assert.equal(reader.advanceTime(-1), false);
  assert.equal(reader.advanceTime(Number.NaN), false);
});

test('V232 import rejects foreign versions, unknown identities, code-bearing fields and unbounded JSON', () => {
  const { replay } = capture({ calls: 90 });
  const corruptions = [
    value => { value.version = 209; }, value => { value.sourceHash = 'f'.repeat(64); },
    value => { value.config.playerId = 'not-in-roster'; }, value => { value.config.stageId = 'not-a-stage'; },
    value => { value.config.playerVariant = 'unknown'; }, value => { value.config.seed = 0; },
    value => { value.config.rulesV119.goal = 'award-credits'; }, value => { value.config.rulesV119.extra = true; },
    value => { value.config.activityV119 = { branch: 'campaign', id: 'xt119-certification-1' }; },
    value => { value.eval = 'globalThis.profile.credits = 99999'; }, value => { value.snapshot = {}; },
    value => { value.runs[0][0] = XENO_TRIALS_REPLAY_LIMITS_V232.operations + 1; },
    value => { value.runs[0][1] = 0; }, value => { value.runs[0][1] = .251; },
    value => { value.runs[0][2] = 2 ** XENO_TRIALS_REPLAY_ACTIONS_V232.length; },
    value => { value.runs[0][3] = -1; }, value => { value.durationSeconds = 1201; },
    value => { value.checks[0][0] = 0; }, value => { value.checks[0][1] = 'bad'; },
    value => { value.operations++; }, value => { value.id = 'xtr232-' + '0'.repeat(24); },
    value => { value.config.exhibitionV232 = { mode: 'tag', assists: true, controls: 'local', playerTeam: [], opponentTeam: [] }; },
  ];
  for (const corrupt of corruptions) {
    const value = clone(replay); corrupt(value); assert.equal(normalizeXenoTrialsReplayV232(value), null);
  }
  assert.equal(importXenoTrialsReplayV232('{'), null);
  assert.equal(importXenoTrialsReplayV232(' '.repeat(XENO_TRIALS_REPLAY_LIMITS_V232.bytes + 1)), null);
  assert.equal(importXenoTrialsReplayV232('{"__proto__":{"execute":true}}'), null);
});

test('V232 native re-simulation detects unrecorded state mutations and cannot mint a live receipt', () => {
  const match = createXenoTrialsMatchV96(config()), recorder = createXenoTrialsReplayRecorderV232(match);
  for (let i = 0; i < 4; i++) {
    recorder.beforeStep(match, dt, {}, null); stepXenoTrialsMatchV96(match, dt, {}, null); recorder.afterStep(match);
  }
  // Explicit corruption fixture, not an accepted gameplay or replay snapshot.
  match.fighters[0].hp--;
  const corrupted = recorder.finish();
  assert.equal(verifyXenoTrialsReplayV232(corrupted).valid, false);
  const reader = createXenoTrialsReplayPlayerV232(corrupted);
  assert.equal(reader.step(corrupted.operations), false);
  assert.equal(reader.getView().issue, 'state-divergence');
  assert.equal(reader.getView().verified, false);
  const changed = createXenoTrialsMatchV96(config()); changed.rng++;
  assert.equal(createXenoTrialsReplayRecorderV232(changed), null);
  assert.equal(createXenoTrialsReplayRecorderV232(createXenoTrialsMatchV96(config({ activityV119: { branch: 'campaign', id: 'xt119-certification-1' } }))), null);
  const progress = createXenoTrialsProgressV96(), started = beginXenoTrialsV96(progress, { playerId: 'warrior', opponentId: 'arachnoid' });
  assert.ok(started.applied);
  const { replay, match: live } = capture({ config: started.config, calls: 16000, variable: true });
  const verified = verifyXenoTrialsReplayV232(replay); assert.equal(verified.valid, true); assert.equal(replay.complete, true);
  const before = clone(started.state);
  assert.equal(settleXenoTrialsV96(started.state, live.result).applied, true, 'the native receipt otherwise matches the live ticket');
  const settled = settleXenoTrialsV96(started.state, verified.verdict);
  assert.equal(settled.applied, false);
  assert.deepEqual(settled.state, before);
  for (const marker of [{ replayV232: true }, { rewardEligible: false }, { readOnly: true }, { exhibitionV232: { mode: 'duel' } }])
    assert.equal(settleXenoTrialsV96(started.state, { ...live.result, ...marker }).applied, false);
});

test('V232 tag teams and native assists retain every reserve, active reference, CPU brain and input edge', () => {
  const exhibitionV232 = { mode: 'tag', assists: true, controls: 'local',
    playerTeam: [{ id: 'warrior', variant: null }, { id: 'runner', variant: null }],
    opponentTeam: [{ id: 'arachnoid', variant: 'grey' }, { id: 'defender', variant: null }] };
  const { replay, match, states } = capture({ config: { exhibitionV232, roundsToWin: 1, roundSeconds: 60 }, calls: 4000, direct: true, physicalRelease: true,
    playerInput: (n, state) => ({ tag: n === 0, right: n > 100 && n < 250,
      light: n > 250 && n % 45 === 0, assist: n > 300 && n % 61 === 0 }),
    opponentInput: n => ({ left: n > 100 && n < 270 }),
  });
  assert.equal(match.tagV232.teams.player.changes > 0, true);
  assert.equal(replay.runs.some(row => typeof row[0] === 'number' && (row[2] & 2 ** 14) !== 0), true);
  assert.equal(replay.runs.some(row => typeof row[0] === 'number' && (row[2] & 2 ** 15) !== 0), true);
  assert.equal(replay.runs.some(row => row[0] === 'release' && row[2] === 2 ** 16), true);
  assert.ok(match.assistsV232.sides.player.stats.requests > 0);
  assert.ok(match.assistsV232.sides.player.stats.accepted > 0, 'meter earned by native contacts admits a real reserve assist');
  const reader = createXenoTrialsReplayPlayerV232(replay);
  for (const [position, expected] of [...states].filter((_, i) => i % 4 === 0)) {
    assert.equal(reader.seek(position), true); assert.equal(reader.getDigest(), expected);
  }
  assert.equal(reader.seek(replay.operations), true);
  assert.equal(reader.getDigest(), hashXenoTrialsReplayStateV232(match));
  const bad = clone(replay); bad.config.exhibitionV232.playerTeam[1].id = 'unknown-reserve';
  assert.equal(normalizeXenoTrialsReplayV232(bad), null);
});

test('V232 idle runs compress without per-tick snapshots and recording has hard volume bounds', () => {
  const { replay } = capture({ idle: true, direct: false, calls: 700, config: { introSeconds: 5 } });
  assert.ok(replay.runs.length < 20);
  assert.ok(bytesOf(replay) < 8000);
  assert.equal(Object.hasOwn(replay, 'snapshot'), false);
  const match = createXenoTrialsMatchV96(config()), recorder = createXenoTrialsReplayRecorderV232(match);
  for (let n = 0; n <= XENO_TRIALS_REPLAY_LIMITS_V232.lifecycle; n++) {
    setXenoTrialsPausedV96(match, true); recorder.recordPause(match, true);
  }
  assert.equal(recorder.getState().active, false);
  assert.equal(recorder.getState().issue, 'lifecycle-limit');
  assert.equal(recorder.finish(), null);
  assert.equal(XENO_TRIALS_STAGES_V96.length >= 131, true);
  assert.equal(XENO_TRIALS_FIGHTERS_V96.length >= 202, true);
});
function bytesOf(value) { return Buffer.byteLength(JSON.stringify(value)); }

test('V232 local archive owns four verified replays and never touches campaign/profile keys', () => {
  const storage = memoryStorage({ 'atf:xeno-trials:standalone:v1': 'profile-preserved', 'atf-save': 'campaign-preserved' });
  for (let seed = 1; seed <= 6; seed++) {
    const { replay } = capture({ calls: 6, config: { seed } });
    assert.equal(appendXenoTrialsReplayV232(storage, replay).saved, true);
  }
  const entries = listXenoTrialsReplaysV232(storage);
  assert.equal(entries.length, 4);
  assert.deepEqual(entries.map(entry => entry.config.seed), [6, 5, 4, 3]);
  assert.equal(appendXenoTrialsReplayV232(storage, entries[0]).count, 4);
  assert.equal(removeXenoTrialsReplayV232(storage, entries[0].id).removed, true);
  assert.deepEqual(listXenoTrialsReplaysV232(storage).map(entry => entry.config.seed), [5, 4, 3]);
  assert.equal(removeXenoTrialsReplayV232(storage, entries[0].id).issue, 'replay-missing');
  assert.equal(storage.getItem('atf:xeno-trials:standalone:v1'), 'profile-preserved');
  assert.equal(storage.getItem('atf-save'), 'campaign-preserved');
  assert.deepEqual([...storage.data.keys()].sort(), ['atf-save', 'atf:xeno-trials:standalone:v1', XENO_TRIALS_REPLAY_STORAGE_KEY_V232].sort());
  const denied = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
  assert.deepEqual(appendXenoTrialsReplayV232(denied, entries[0]), { saved: false, issue: 'storage-unavailable' });
  assert.deepEqual(listXenoTrialsReplaysV232(memoryStorage({ [XENO_TRIALS_REPLAY_STORAGE_KEY_V232]: 'bad' })), []);
});
