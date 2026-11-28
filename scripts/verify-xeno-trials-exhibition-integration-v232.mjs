import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96, beginXenoTrialsV96,
  settleXenoTrialsV96, checkpointXenoTrialsDuelV197 } from '../src/xeno-trials-progress-v96.js';
import { buildExhibitionConfigV232, getXenoTrialsExhibitionCatalogV232 } from '../src/xeno-trials-exhibition-ui-v232.js';
import { XENO_TRIALS_CHARACTER_ROUTES_V232 } from '../src/xeno-trials-character-routes-v232.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, nextXenoTrialsRoundV96,
  releaseXenoTrialsControlsV150, getXenoTrialsSnapshotV96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsLocalInputV232 } from '../src/xeno-trials-local-input-v232.js';
import { createXenoTrialsReplayRecorderV232, verifyXenoTrialsReplayV232 } from '../src/xeno-trials-replay-v232.js';

// Cross-system transactions use real profiles/tickets/configuration boundaries.
// The completed legacy receipt below injects only KO HP to test economy admission;
// controller callbacks and recorder calls remain the actual production modules.
const choices = { mode: 'tag', controls: 'local', assists: false,
  player0: 'warrior::', player1: 'runner::', opponent0: 'arachnoid::purple', opponent1: 'runner::',
  stageId: 'containment-deck', difficulty: 'normal', roundsToWin: 2, roundSeconds: 99, seed: 232 };

test('preparing or rejecting free exhibitions preserves a live pending ticket and every journal field', () => {
  const begun = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: 'runner' });
  assert.equal(begun.applied, true);
  const profile = begun.state, original = JSON.stringify(profile);
  const config = buildExhibitionConfigV232(choices, profile); assert.ok(config);
  assert.equal(JSON.stringify(profile), original);
  for (const patch of [config, { ...begun.config, replayV232: true }, { ...begun.config, readOnly: true }]) {
    const rejected = beginXenoTrialsV96(profile, patch);
    assert.equal(rejected.applied, false); assert.equal(rejected.reason, 'exhibition-no-progression');
    assert.deepEqual(rejected.state, normalizeXenoTrialsProgressV96(profile));
    assert.equal(JSON.stringify(profile), original);
  }
  assert.equal(profile.pending.matchId, begun.config.matchId); assert.equal(profile.ledger.length, 0);
});

test('free/read-only markers reject even an otherwise valid native progression receipt', () => {
  const begun = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: 'runner' });
  const match = createXenoTrialsMatchV96({ ...begun.config, introSeconds: 0, holdRoundTransition: true });
  for (let round = 0; round < 2; round++) {
    match.fighters[1].hp = 0; stepXenoTrialsMatchV96(match, 1 / 120, {}, {});
    if (round === 0) assert.equal(nextXenoTrialsRoundV96(match), true);
  }
  assert.ok(match.result); assert.equal(settleXenoTrialsV96(begun.state, match.result).applied, true);
  const original = JSON.stringify(begun.state);
  for (const marker of [{ exhibitionV232: { mode: 'duel' } }, { replayV232: true }, { rewardEligible: false }, { readOnly: true }]) {
    const rejected = settleXenoTrialsV96(begun.state, { ...match.result, ...marker });
    assert.equal(rejected.applied, false); assert.equal(rejected.reason, 'invalid-or-replayed-result');
    assert.equal(JSON.stringify(begun.state), original);
    assert.deepEqual(rejected.state, normalizeXenoTrialsProgressV96(begun.state));
  }
});

test('free duel/team snapshots cannot become checkpoints of a matching pending legacy duel', () => {
  const begun = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: 'runner' });
  const match = createXenoTrialsMatchV96({ ...begun.config, introSeconds: 0, holdRoundTransition: true });
  stepXenoTrialsMatchV96(match, .25, {});
  const accepted = checkpointXenoTrialsDuelV197(begun.state, getXenoTrialsSnapshotV96(match)); assert.equal(accepted.applied, true);
  const original = JSON.stringify(accepted.state);
  for (const mode of ['duel', 'tag']) {
    const count = mode === 'tag' ? 2 : 1;
    const free = createXenoTrialsMatchV96({ ...begun.config, introSeconds: 0, holdRoundTransition: true,
      exhibitionV232: { mode, controls: 'cpu', assists: false,
        playerTeam: [{ id: 'warrior' }, { id: 'arachnoid', variant: 'purple' }].slice(0, count),
        opponentTeam: [{ id: 'runner' }, { id: 'warrior' }].slice(0, count) } });
    stepXenoTrialsMatchV96(free, .25, {});
    const rejected = checkpointXenoTrialsDuelV197(accepted.state, getXenoTrialsSnapshotV96(free));
    assert.equal(rejected.applied, false, mode); assert.equal(JSON.stringify(accepted.state), original);
    assert.deepEqual(rejected.state.pending.duelCheckpointV197, accepted.state.pending.duelCheckpointV197);
  }
});

test('temporary route loans never enter the owned exhibition catalog or displace a route ticket', () => {
  const route = XENO_TRIALS_CHARACTER_ROUTES_V232.find(entry => entry.id === 'neomorph');
  const begun = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: route.fighterId,
    activityV119: { branch: 'character-routes', id: route.chapters[0].id } });
  assert.equal(begun.applied, true); assert.equal(begun.state.unlocked.includes(route.fighterId), false);
  assert.equal(getXenoTrialsExhibitionCatalogV232(begun.state).some(entry => entry.id === route.fighterId), false);
  assert.equal(buildExhibitionConfigV232({ ...choices, player0: `${route.fighterId}::` }, begun.state), null);
  const original = JSON.stringify(begun.state), free = buildExhibitionConfigV232(choices, begun.state);
  assert.ok(free); assert.equal(beginXenoTrialsV96(begun.state, free).applied, false);
  assert.equal(JSON.stringify(begun.state), original); assert.equal(begun.state.pending.config.playerId, route.fighterId);
});

test('physical full-boolean controller releases replay exactly like their sparse recorded masks', () => {
  const match = createXenoTrialsMatchV96(buildExhibitionConfigV232(choices, createXenoTrialsProgressV96()));
  const recorder = createXenoTrialsReplayRecorderV232(match); assert.ok(recorder);
  const controller = createXenoTrialsLocalInputV232({ onRelease(side, input) {
    assert.equal(releaseXenoTrialsControlsV150(match, side, input), true);
    assert.equal(recorder.recordRelease(match, side, input), true);
  } });
  const player = controller.getPlayerInput(), opponent = controller.getOpponentInput();
  assert.equal(recorder.beforeStep(match, 1 / 120, player, opponent), true);
  stepXenoTrialsMatchV96(match, 1 / 120, player, opponent); assert.equal(recorder.afterStep(match), true);
  controller.release('presentation');
  // E/interact can be held during a keyboard release even though the exhibition
  // itself has no interact action. Its captured physical state must still agree.
  releaseXenoTrialsControlsV150(match, 'player', { interact: true, light: false });
  recorder.recordRelease(match, 'player', { interact: true, light: false });
  controller.stop();
  const replay = recorder.finish(match); assert.ok(replay);
  const verified = verifyXenoTrialsReplayV232(replay); assert.equal(verified.valid, true, verified.issue);
  assert.deepEqual(match.tagV232.teams.player.lastControls, {});
});
