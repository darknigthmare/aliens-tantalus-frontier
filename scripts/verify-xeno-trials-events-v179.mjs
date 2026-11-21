import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_EVENTS_V179 as EVENTS, getXenoTrialsEventV179, getXenoTrialsEventWaveV179 } from '../src/xeno-trials-events-v179.js';
import { XENO_TRIALS_FIGHTERS_V96 as FIGHTERS, XENO_TRIALS_STAGES_V96 as STAGES } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_CHALLENGES_V119 as CHALLENGES, normalizeXenoTrialsRulesV119, resolveXenoTrialsActivityV119 } from '../src/xeno-trials-modes-v119.js';
import { createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96, beginXenoTrialsV96, settleXenoTrialsV96, abandonXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';

// The settlement matrix uses declared finished-result fixtures to isolate the
// native ticket/progression API. Separate tests below run the actual engine with
// explicit neutral opponent controls, without DOM, RAF or image decoding.
function finished(ticket, winner = 'player') {
  const config = ticket.config;
  return { ...config, completed: true, winner, rounds: 2, wins: { player: winner === 'player' ? 2 : 0, opponent: winner === 'opponent' ? 2 : 0 },
    durationTicks: 7200, reason: 'time', playerVariant: config.playerId === 'arachnoid' ? config.playerVariant : null,
    opponentVariant: config.opponentId === 'arachnoid' ? config.opponentVariant : null,
    playerStats: { hits: 2, damage: 20, blocks: 1, specials: 0 }, opponentStats: { hits: 0, damage: 0, blocks: 0, specials: 0 } };
}
const start = (state, id) => beginXenoTrialsV96(state, { playerId: 'warrior', activityV119: { branch: 'challenges', id } });
const reload = state => normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(state)));

test('forty event routes have eight distinct families and 160 admitted native waves', () => {
  assert.equal(EVENTS.length, 40);
  assert.equal(new Set(EVENTS.map(event => event.id)).size, 40);
  assert.equal(new Set(EVENTS.map(event => event.eventFamily)).size, 8);
  assert.equal(EVENTS.reduce((total, event) => total + event.waves.length, 0), 160);
  const fighters = new Set(FIGHTERS.map(fighter => fighter.id)), stages = new Set(STAGES.map(stage => stage.id));
  for (const event of EVENTS) {
    assert.deepEqual(CHALLENGES.find(challenge => challenge.id === event.id), event, `${event.id} must be available in the active challenge catalog`);
    assert.deepEqual(event.opponentIds, event.waves.map(wave => wave.opponentId));
    assert.match(event.description, /vagues successives/);
    assert.match(event.description, /Récupération complète/);
    assert.equal(event.canonStatus, 'original-tantalus-simulation');
    for (const wave of event.waves) {
      assert.ok(fighters.has(wave.opponentId), wave.opponentId);
      assert.ok(stages.has(wave.stageId), wave.stageId);
      assert.ok(wave.briefing);
      assert.deepEqual(normalizeXenoTrialsRulesV119(wave.rules), { ...normalizeXenoTrialsRulesV119(), ...wave.rules });
    }
  }
});

test('event wave lookup rejects unknown IDs, invalid saved indices and final-wave overflow', () => {
  assert.equal(getXenoTrialsEventV179('missing'), null);
  const event = EVENTS[0];
  for (const bout of [-1, 1.5, '0', NaN, Infinity, event.waves.length]) assert.equal(getXenoTrialsEventWaveV179(event.id, bout), null);
  assert.equal(getXenoTrialsEventWaveV179('missing', 0), null);
  assert.equal(getXenoTrialsEventWaveV179(event.id, 0), event.waves[0]);
});

test('protocol families enforce their advertised mechanics and every royal route ends in a boss', () => {
  for (const event of EVENTS) {
    if (event.eventFamily === 'quarantine') assert.ok(event.waves.every(wave => wave.rules.noSpecial));
    if (event.eventFamily === 'extraction') assert.ok(event.waves.every(wave => wave.rules.goal === 'survive'));
    if (event.eventFamily === 'pursuit') assert.ok(event.waves.every(wave => wave.rules.timeLimitSeconds === 30));
    if (event.eventFamily === 'blackout') assert.ok(event.waves.every(wave => wave.rules.specialLockSeconds === 20));
    if (event.eventFamily === 'sudden-death') assert.ok(event.waves.every(wave => wave.rules.initialHp === 1));
    if (event.eventFamily === 'royal') assert.equal(event.waves.at(-1).opponentId, 'queen');
    if (event.eventFamily === 'acid') assert.ok(event.waves.some(wave => wave.rules.goal === 'survive'));
  }
});

for (const event of EVENTS) test(`${event.id}: native tickets survive reload, apply each wave and pay the event bonus only once at completion`, () => {
  let state = createXenoTrialsProgressV96();
  for (let bout = 0; bout < event.waves.length; bout++) {
    const wave = event.waves[bout], ticket = start(reload(state), event.id);
    assert.equal(ticket.applied, true);
    assert.equal(ticket.config.opponentId, wave.opponentId);
    assert.equal(ticket.config.stageId, wave.stageId);
    assert.equal(ticket.config.difficulty, wave.difficulty);
    assert.deepEqual(ticket.config.rulesV119, normalizeXenoTrialsRulesV119(wave.rules));
    assert.deepEqual(reload(ticket.state).pending.config, ticket.config);
    const result = finished(ticket), settled = settleXenoTrialsV96(reload(ticket.state), result);
    assert.equal(settled.applied, true);
    const last = bout === event.waves.length - 1;
    assert.equal(settled.receipt.modeReward.bonus, last ? event.reward : 0);
    assert.equal(settled.receipt.modeReward.continuing, !last);
    assert.equal(settled.state.modesV119.challengesCleared.includes(event.id), last);
    assert.equal(settled.state.modesV119.challengeRun?.bout ?? null, last ? null : bout + 1);
    const replay = settleXenoTrialsV96(settled.state, result);
    assert.equal(replay.applied, false);
    assert.equal(replay.state.credits, settled.state.credits);
    state = reload(settled.state);
  }
  // Replaying a fully completed event still allows combat, never a second bonus.
  for (let bout = 0; bout < event.waves.length; bout++) {
    const ticket = start(state, event.id), settled = settleXenoTrialsV96(ticket.state, finished(ticket));
    assert.equal(settled.applied, true);
    assert.equal(settled.receipt.modeReward.bonus, 0);
    state = settled.state;
  }
});

test('forged opponent, activity or rules cannot redirect a saved event wave or collect a bonus', () => {
  const event = getXenoTrialsEventV179('xte179-quarantine-2'), ticket = start(createXenoTrialsProgressV96(), event.id);
  const opponent = JSON.parse(JSON.stringify(ticket.state)); opponent.pending.config.opponentId = 'queen';
  assert.equal(reload(opponent).pending, null);
  const activity = JSON.parse(JSON.stringify(ticket.state)); activity.pending.config.activityV119.id = 'xte179-missing-1';
  assert.equal(reload(activity).pending, null);
  const rules = JSON.parse(JSON.stringify(ticket.state)); rules.pending.config.rulesV119 = {};
  assert.equal(reload(rules).pending.config.rulesV119.noSpecial, true);
  const result = finished(ticket); result.rulesV119 = normalizeXenoTrialsRulesV119();
  assert.equal(settleXenoTrialsV96(ticket.state, result).applied, false);
});

test('loss, draw or abandonment reset event progress and do not pay the event bonus', () => {
  const event = EVENTS[4], first = start(createXenoTrialsProgressV96(), event.id);
  const passed = settleXenoTrialsV96(first.state, finished(first));
  assert.equal(passed.state.modesV119.challengeRun.bout, 1);
  const next = start(passed.state, event.id), defeat = settleXenoTrialsV96(next.state, finished(next, 'opponent'));
  assert.equal(defeat.applied, true); assert.equal(defeat.receipt.modeReward.bonus, 0);
  assert.equal(defeat.state.modesV119.challengeRun, null);
  const drawResult = { ...finished(next), winner: 'draw', rounds: 5, wins: { player: 0, opponent: 0 } };
  const draw = settleXenoTrialsV96(next.state, drawResult);
  assert.equal(draw.applied, true); assert.equal(draw.receipt.modeReward.bonus, 0);
  assert.equal(draw.state.modesV119.challengeRun, null);
  const abandoned = abandonXenoTrialsV96(next.state);
  assert.equal(abandoned.applied, true); assert.equal(abandoned.state.modesV119.challengeRun, null);
  assert.equal(abandoned.state.pending, null); assert.equal(abandoned.state.modesV119.challengesCleared.includes(event.id), false);
});

test('the real survival engine completes both waves and settles the extraction event through native APIs', () => {
  const event = getXenoTrialsEventV179('xte179-extraction-1'); let state = createXenoTrialsProgressV96();
  for (const wave of event.waves) {
    const ticket = start(state, event.id), match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 });
    for (let frame = 0; frame < 1400 && !match.result; frame++) stepXenoTrialsMatchV96(match, .05, {}, {});
    assert.equal(match.result?.winner, 'player');
    assert.equal(match.result.reason, 'time');
    assert.equal(match.fighters[0].hp > 0, true);
    assert.equal(match.config.opponentId, wave.opponentId);
    const settled = settleXenoTrialsV96(ticket.state, match.result);
    assert.equal(settled.applied, true);
    state = reload(settled.state);
  }
  assert.equal(state.modesV119.challengesCleared.includes(event.id), true);
});

test('the real sudden-death event applies one HP and blocks specials while ordinary contact still wins', () => {
  const ticket = start(createXenoTrialsProgressV96(), 'xte179-sudden-death-1');
  const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 });
  assert.deepEqual(match.fighters.map(fighter => fighter.hp), [1, 1]);
  for (let frame = 0; frame < 2000 && !match.result; frame++)
    stepXenoTrialsMatchV96(match, .05, match.phase === 'active' ? { right: true, light: frame % 12 < 2, special: frame % 12 < 2 } : {}, {});
  assert.equal(match.result?.winner, 'player');
  assert.equal(match.result.playerStats.specials, 0);
  assert.ok(match.result.playerStats.hits > 0);
  const settled = settleXenoTrialsV96(ticket.state, match.result);
  assert.equal(settled.applied, true);
  assert.equal(settled.receipt.modeReward.bonus, 0);
  assert.equal(settled.state.modesV119.challengeRun.bout, 1);
});

test('a different event or specimen cannot replace a resumed native wave', () => {
  const first = start(createXenoTrialsProgressV96(), EVENTS[0].id), passed = settleXenoTrialsV96(first.state, finished(first));
  const state = reload(passed.state);
  assert.equal(start(state, EVENTS[1].id).applied, false);
  assert.equal(beginXenoTrialsV96(state, { playerId: 'runner', activityV119: { branch: 'challenges', id: EVENTS[0].id } }).applied, false);
  const resolved = resolveXenoTrialsActivityV119({ branch: 'challenges', id: EVENTS[0].id }, state.modesV119);
  assert.equal(resolved.bout, 1);
  assert.equal(resolved.opponentId, EVENTS[0].waves[1].opponentId);
});
