import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDefaultSave, migrateSave, SaveSystem } from '../src/save.js';
import { createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96, normalizeXenoTrialsConfigV96,
  getXenoTrialsUnlockCostV96, unlockXenoTrialsFighterV96, beginXenoTrialsV96,
  abandonXenoTrialsV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';

const fresh = () => beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'arachnoid', opponentId: 'defender', playerVariant: 'purple' });

test('V97 timer normalization supports the new 99s default and historical 75s tickets', () => {
  assert.equal(normalizeXenoTrialsConfigV96().roundSeconds, 99);
  for (const seconds of [60, 75, 99, 120]) {
    assert.equal(normalizeXenoTrialsConfigV96({ roundSeconds: seconds }).roundSeconds, seconds);
    assert.equal(normalizeXenoTrialsConfigV96({ roundSeconds: String(seconds) }).roundSeconds, seconds);
  }
  for (const seconds of [undefined, null, '', 0, 59, 100, Infinity, NaN, '99 seconds'])
    assert.equal(normalizeXenoTrialsConfigV96({ roundSeconds: seconds }).roundSeconds, 99);
  const old = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'arachnoid', playerVariant: 'purple', opponentId: 'defender', roundSeconds: 75 });
  const reloaded = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(old.state)));
  assert.deepEqual(reloaded.pending.config, old.config); assert.equal(reloaded.schema, 96);
  assert.equal(reloaded.pending.config.roundSeconds, 75); assert.equal(reloaded.pending.config.playerVariant, 'purple');
});
function result(config, patch = {}) { return { ...config,
  playerVariant: config.playerId === 'arachnoid' ? config.playerVariant : null,
  opponentVariant: config.opponentId === 'arachnoid' ? config.opponentVariant : null,
  completed: true, winner: 'player', wins: { player: 2, opponent: 0 }, durationTicks: 1200, rounds: 2, reason: 'ko', ...patch }; }

test('V96 simulation progression migrates independently of campaign resources', () => {
  const save = createDefaultSave();
  assert.deepEqual(save.xenoTrialsV96, createXenoTrialsProgressV96());
  const strategic = structuredClone({ strategy: save.strategy, galaxy: save.galaxy, player: save.player });
  const duel = fresh(), done = settleXenoTrialsV96(duel.state, result(duel.config));
  const migrated = migrateSave({ ...save, xenoTrialsV96: done.state });
  assert.equal(migrated.xenoTrialsV96.wins, 1);
  assert.equal(migrated.xenoTrialsV96.credits, 250);
  assert.deepEqual({ strategy: migrated.strategy, galaxy: migrated.galaxy, player: migrated.player }, strategic);
  delete save.xenoTrialsV96;
  assert.deepEqual(migrateSave(save).xenoTrialsV96, createXenoTrialsProgressV96());
});
test('V96 normalization clamps malformed data and whitelists admitted fighters', () => {
  assert.deepEqual(normalizeXenoTrialsProgressV96(null), createXenoTrialsProgressV96());
  const s = normalizeXenoTrialsProgressV96({ schema: 96, serial: -1, credits: Infinity, xp: 1e30,
    unlocked: ['queen', 'missing', 'queen'], ledger: [{ winner: 'player', matchId: 'not-a-duel' }], pending: { matchId: 'xt96-1', config: {} } });
  assert.equal(s.serial, 0); assert.equal(s.credits, 0); assert.equal(s.xp, 1000000);
  assert.deepEqual(s.unlocked, ['warrior', 'runner', 'arachnoid', 'queen']); assert.equal(s.pending, null); assert.equal(s.ledger.length, 0);
});
test('V96 ticket freezes exact configuration and blocks another duel or unlock', () => {
  const d = fresh(); assert.equal(d.applied, true); assert.equal(d.config.playerVariant, 'purple');
  assert.equal(d.config.matchId, 'xt96-1'); assert.equal(d.config.seed, 96001);
  assert.equal(beginXenoTrialsV96(d.state, {}).applied, false);
  assert.equal(unlockXenoTrialsFighterV96({ ...d.state, credits: 5000 }, 'queen').applied, false);
  assert.deepEqual(normalizeXenoTrialsProgressV96(d.state).pending.config, d.config);
});
test('V96 unlock requires own credits and never duplicates a fighter', () => {
  const base = createXenoTrialsProgressV96(), cost = getXenoTrialsUnlockCostV96('defender');
  assert.equal(beginXenoTrialsV96(base, { playerId: 'defender' }).applied, false);
  assert.equal(unlockXenoTrialsFighterV96({ ...base, credits: cost - 1 }, 'defender').applied, false);
  const unlocked = unlockXenoTrialsFighterV96({ ...base, credits: cost }, 'defender');
  assert.equal(unlocked.state.credits, 0); assert.ok(unlocked.state.unlocked.includes('defender'));
  assert.equal(unlockXenoTrialsFighterV96(unlocked.state, 'defender').applied, false);
  assert.equal(unlockXenoTrialsFighterV96(base, '__proto__').applied, false);
});

test('V96 imported malformed seeds cannot create a duel whose result can never settle', () => {
  for (const seed of [undefined, null, 0, -1, 1.5, '96001', Infinity, 0x80000000]) {
    const d = fresh(); d.state.pending.config.seed = seed;
    const normalized = normalizeXenoTrialsProgressV96(d.state);
    assert.equal(normalized.pending, null);
    assert.equal(normalized.credits, d.state.credits);
    assert.equal(normalized.wins, 0);
    assert.equal(beginXenoTrialsV96(normalized, {}).applied, true);
  }
  const d = fresh();
  const normalized = normalizeXenoTrialsProgressV96(d.state);
  assert.equal(createXenoTrialsMatchV96(normalized.pending.config).config.seed, d.config.seed);
});

test('V96 stylesheet and module ship in both build shell and service-worker cache', () => {
  const build = readFileSync(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const worker = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.ok(build.includes("'xeno-trials-v96.css'"));
  assert.ok(index.includes('/xeno-trials-v96.css'));
  for (const p of ['xeno-trials-v96.css', 'src/xeno-trials-ui-v96.js', 'src/xeno-trials-engine-v96.js', 'src/xeno-trials-progress-v96.js'])
    assert.ok(worker.includes('/' + p));
});
test('V96 a completed result pays exactly once and advances faction record', () => {
  const d = fresh(), before = structuredClone(d.state), r = result(d.config), won = settleXenoTrialsV96(d.state, r);
  assert.equal(won.applied, true); assert.equal(won.state.wins, 1); assert.equal(won.state.xp, 80);
  assert.equal(won.state.factionWins.containment, 1); assert.equal(won.state.pending, null);
  assert.equal(settleXenoTrialsV96(won.state, r).applied, false); assert.deepEqual(d.state, before);
});
for (const bad of [{ completed: false }, { completed: 'yes' }, { playerVariant: 'grey' }, { playerId: 'queen' }, { matchId: 'xt96-2' }, { seed: 1 },
  { stageId: 'hive-vault' }, { difficulty: 'hard' }, { rounds: 1 }, { durationTicks: Infinity },
  { wins: { player: 1, opponent: 0 } }, { wins: { player: 2, opponent: 2 } },
  { winner: 'draw', wins: { player: 0, opponent: 0 } }, { winner: 'draw', rounds: 5, wins: { player: 1, opponent: 0 } },
  { winner: 'draw', rounds: 5, wins: { player: 2, opponent: 2 } }]) {
  test('V96 rejects incompatible or nonterminal result ' + JSON.stringify(bad), () => {
    const d = fresh(); assert.equal(settleXenoTrialsV96(d.state, result(d.config, bad)).applied, false);
  });
}
test('V96 round cap accepts a strict leader or genuine draw after five rounds', () => {
  const d = fresh();
  assert.equal(settleXenoTrialsV96(d.state, result(d.config, { rounds: 5, wins: { player: 1, opponent: 0 } })).applied, true);
  const draw = settleXenoTrialsV96(d.state, result(d.config, { winner: 'draw', rounds: 5, wins: { player: 1, opponent: 1 } }));
  assert.equal(draw.applied, true); assert.equal(draw.state.draws, 1); assert.equal(draw.receipt.credits, 25);
});
test('V96 abandoned ticket gives nothing and cannot be settled afterwards', () => {
  const d = fresh(), abandoned = abandonXenoTrialsV96(d.state);
  assert.equal(abandoned.applied, true); assert.equal(abandoned.state.credits, 150);
  assert.equal(abandoned.state.ledger[0].winner, 'abandoned');
  assert.equal(settleXenoTrialsV96(abandoned.state, result(d.config)).applied, false);
  assert.equal(beginXenoTrialsV96(abandoned.state, {}).config.matchId, 'xt96-2');
});
test('V96 actual deterministic engine result is accepted by progression', () => {
  const d = fresh(), match = createXenoTrialsMatchV96(d.config);
  for (let n = 0; !match.result && n < 80000; n++) stepXenoTrialsMatchV96(match, 1 / 60, {});
  assert.ok(match.result, 'normal AI must finish a passive match');
  assert.equal(settleXenoTrialsV96(d.state, match.result).applied, true);
});
test('V96 failed persistent write leaves original ticket and balance intact, retry pays once', () => {
  const map = new Map(); let fail = false;
  const storage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => { if (fail) throw Error('quota'); map.set(key, value); }, removeItem: key => map.delete(key) };
  const save = new SaveSystem(storage); save.newGame(1);
  const d = beginXenoTrialsV96(save.data.xenoTrialsV96, {}); save.commit({ xenoTrialsV96: d.state });
  const before = structuredClone(save.data.xenoTrialsV96), disk = [...map];
  const done = settleXenoTrialsV96(before, result(d.config)); fail = true;
  assert.throws(() => save.commit({ xenoTrialsV96: done.state }));
  assert.deepEqual(save.data.xenoTrialsV96, before); assert.deepEqual([...map], disk);
  fail = false; save.commit({ xenoTrialsV96: done.state });
  assert.equal(save.data.xenoTrialsV96.wins, 1);
  assert.equal(settleXenoTrialsV96(save.data.xenoTrialsV96, result(d.config)).applied, false);
  save.newGame(2); assert.equal(save.data.xenoTrialsV96.wins, 0);
  save.load(1); assert.equal(save.data.xenoTrialsV96.wins, 1);
});
test('V96 admission, owner guards, navigation and cleanup are wired in application', () => {
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /canCommit: \(\) => ownsTimelineV84\(xenoTrialsOwnerV96\) && activeView === 'xenotrials'/);
  assert.match(app, /saveSystem.commit\(\{ xenoTrialsV96: state \}\)/);
  for (const marker of ['title-return', 'profile-change', 'page-unload', 'forge-open', 'player-creation']) {
    const pos = app.indexOf(marker); assert.ok(pos >= 0);
    assert.match(app.slice(Math.max(0, pos - 1600), pos + 500), /xenoTrialsUiV96\?\.close\(\)/);
  }
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /data-view="xenotrials"/); assert.match(html, /data-panel="xenotrials"/);
  assert.equal(normalizeXenoTrialsConfigV96({ playerId: 'warrior', playerVariant: 'purple' }).playerVariant, 'grey');
});
