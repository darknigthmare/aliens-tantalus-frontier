import assert from 'node:assert/strict';
import test from 'node:test';
import { getXenoTrialsFighterV96, XENO_TRIALS_FACTIONS_V96, XENO_TRIALS_STAGES_V96 } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_CHARACTER_ROUTES_BRANCH_V231 as branch, XENO_TRIALS_BIG_CHAP_ROUTE_V231 as route,
  getXenoTrialsCharacterRouteViewV231 as board } from '../src/xeno-trials-character-routes-v231.js';
import { XENO_TRIALS_BRANCHES_V119, XENO_TRIALS_CAMPAIGN_V119, resolveXenoTrialsActivityV119 } from '../src/xeno-trials-modes-v119.js';
import { abandonXenoTrialsV96, beginXenoTrialsV96, checkpointXenoTrialsDuelV197, createXenoTrialsProgressV96,
  getXenoTrialsUnlockCostV96, normalizeXenoTrialsProgressV96, settleXenoTrialsV96, unlockXenoTrialsFighterV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, nextXenoTrialsRoundV96, setXenoTrialsPausedV96, stepXenoTrialsMatchV96,
  XENO_TRIALS_STEP_V96 as STEP } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';

const playerId = route.fighterId;
const chapterIds = route.chapters.map(chapter => chapter.id);
const currentBoard = state => board(route.id, state.modesV119);
const activity = id => ({ branch, id });
const begin = (state, index, config = {}) => beginXenoTrialsV96(state, { playerId, activityV119: activity(chapterIds[index]), ...config });
const reload = state => normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(state)));
const startMatch = config => createXenoTrialsMatchV96({ ...config, introSeconds: 0, holdRoundTransition: true });

function pressToward(driver, target, tick, attack) {
  const gap = getXenoTrialsBodyGapV105(driver, target);
  return { left: target.x < driver.x && gap > 19, right: target.x > driver.x && gap > 19,
    [attack]: gap <= (attack === 'heavy' ? 38 : 19) && tick % 3 === 0 };
}

/** Receive the full verdict from the engine. A direct neutral rival makes the
 * save and timer fixtures independent of AI behavior. */
function finishMatch(match, { driver = 'player', attack = 'light', cpu = false } = {}) {
  if (match.paused) setXenoTrialsPausedV96(match, false);
  for (let step = 0; step < 120 * 180 && !match.result; step++) {
    if (match.phase === 'round-over') {
      if (match.phaseTime <= 0) nextXenoTrialsRoundV96(match);
      stepXenoTrialsMatchV96(match, STEP, {}, cpu ? null : {});
      continue;
    }
    const [player, opponent] = match.fighters;
    stepXenoTrialsMatchV96(match, STEP, driver === 'player' ? pressToward(player, opponent, step, attack) : {},
      cpu ? null : driver === 'opponent' ? pressToward(opponent, player, step, attack) : {});
  }
  assert.ok(match.result?.completed, match.config.activityV119.id);
  return match.result;
}

test('one independent route uses four authored stages, localized beats and a recurring comparison rival', () => {
  assert.equal(XENO_TRIALS_CAMPAIGN_V119.length, 19);
  assert.equal(XENO_TRIALS_BRANCHES_V119.filter(entry => entry.id === branch).length, 1);
  assert.equal(route.sourceWork, 'Alien (1979)');
  assert.equal(route.canonStatus, 'original-tantalus-simulation');
  assert.ok(route.prologue && route.prologueEn && route.epilogue && route.epilogueEn);
  assert.ok(getXenoTrialsFighterV96(playerId));
  assert.equal(route.chapters.length, 4);
  assert.equal(route.chapters[1].opponentId, route.chapters[3].opponentId);
  assert.equal(route.chapters[2].rules.goal, 'survive');
  assert.equal(route.chapters[3].difficulty, 'hard');
  assert.deepEqual(route.chapters.map(chapter => chapter.unlockId ?? null), [null, null, null, playerId]);
  assert.equal(new Set(route.chapters.map(chapter => chapter.stageId)).size, 4);
  for (const chapter of route.chapters) {
    assert.ok(chapter.title && chapter.titleEn && chapter.briefing && chapter.briefingEn && chapter.event && chapter.eventEn);
    assert.equal(chapter.forcedPlayerId, playerId);
    assert.ok(getXenoTrialsFighterV96(chapter.opponentId));
    assert.ok(XENO_TRIALS_STAGES_V96.find(stage => stage.id === chapter.stageId)?.backdrop);
    assert.ok(XENO_TRIALS_FACTIONS_V96.find(faction => faction.id === chapter.factionId)?.roster.includes(chapter.opponentId));
    assert.ok(!XENO_TRIALS_CAMPAIGN_V119.some(mission => mission.id === chapter.id));
  }
  assert.equal(board('other-route'), null);
  const fresh = createXenoTrialsProgressV96();
  assert.deepEqual(currentBoard(fresh).chapters.map(chapter => chapter.open), [true, false, false, false]);
  assert.equal(currentBoard(fresh).nextChapterId, chapterIds[0]);
  assert.equal(resolveXenoTrialsActivityV119({ branch: 'campaign', id: chapterIds[0] }, fresh.modesV119), null);
  assert.equal(resolveXenoTrialsActivityV119(activity(chapterIds[1]), fresh.modesV119), null);
  const old = reload(fresh);
  assert.equal(Object.hasOwn(old.modesV119, 'characterRoutesClearedV231'), false);
  const forged = reload({ ...fresh, modesV119: { ...fresh.modesV119, characterRoutesClearedV231: [chapterIds[0], chapterIds[2], chapterIds[2], 'unknown'] } });
  assert.deepEqual(forged.modesV119.characterRoutesClearedV231, [chapterIds[0]]);
  assert.equal(currentBoard(forged).nextChapterId, chapterIds[1]);
});

test('a loan accepts only the assigned specimen, canonical open chapter and ticket scope', () => {
  const fresh = createXenoTrialsProgressV96();
  assert.equal(begin(fresh, 2).applied, false);
  assert.equal(begin(fresh, 0, { playerId: 'warrior' }).reason, 'activity-unavailable');
  assert.equal(beginXenoTrialsV96(fresh, { playerId, activityV119: { branch: 'on-demand', id: 'on-demand' } }).reason, 'fighter-locked');
  const transfer = begin(fresh, 0, { opponentId: 'queen', stageId: 'hive-vault', factionId: 'hive', difficulty: 'hard', roundSeconds: 120 });
  assert.equal(transfer.applied, true);
  assert.equal(transfer.config.playerId, playerId);
  assert.equal(transfer.config.opponentId, route.chapters[0].opponentId);
  assert.equal(transfer.config.stageId, route.chapters[0].stageId);
  assert.equal(transfer.config.difficulty, 'easy');
  assert.equal(transfer.config.roundSeconds, 60);
  assert.equal(transfer.config.roundsToWin, 2);
  assert.equal(transfer.config.rulesV119.noSpecial, true);
  assert.ok(!transfer.state.unlocked.includes(playerId));
  assert.equal(begin(transfer.state, 0).reason, 'pending-duel');

  const parked = reload(transfer.state);
  assert.deepEqual(parked.pending.config, transfer.config);
  const mutate = patch => reload({ ...parked, pending: { ...parked.pending, config: { ...parked.pending.config, ...patch } } });
  assert.equal(mutate({ playerId: 'warrior' }).pending, null);
  assert.equal(mutate({ stageId: 'hive-vault' }).pending, null);
  assert.equal(mutate({ activityV119: activity(chapterIds[2]) }).pending, null);
  assert.equal(mutate({ activityV119: { branch: 'on-demand', id: chapterIds[0] } }).pending, null);
  const challengeRun = { id: 'hunter-pack', bout: 1, playerId: 'warrior' };
  const withSeries = { ...fresh, modesV119: { ...fresh.modesV119, challengeRun } };
  assert.equal(begin(withSeries, 0).reason, 'activity-unavailable');
  assert.equal(reload({ ...parked, modesV119: { ...parked.modesV119, challengeRun } }).pending, null);
});

test('real duel checkpoint reload keeps the borrowed body and ticket while settlement pays the chapter only once', () => {
  const issued = begin(createXenoTrialsProgressV96(), 0);
  const live = startMatch(issued.config);
  for (let tick = 0; tick < 30; tick++) stepXenoTrialsMatchV96(live, STEP, { right: true, special: true });
  assert.equal(live.fighters[0].stats.specials, 0);
  const checkpoint = checkpointXenoTrialsDuelV197(issued.state, live);
  assert.equal(checkpoint.applied, true, checkpoint.reason);
  const saved = reload(checkpoint.state);
  const snapshot = saved.pending.duelCheckpointV197.snapshot;
  assert.equal(snapshot.tick, live.tick);
  assert.equal(snapshot.fighters[0].x, live.fighters[0].x);
  assert.equal(snapshot.fighters[0].id, playerId);
  assert.deepEqual(snapshot.config.activityV119, activity(chapterIds[0]));
  assert.equal(snapshot.paused, true);
  assert.ok(!saved.unlocked.includes(playerId));
  const verdict = finishMatch(structuredClone(snapshot));
  assert.equal(verdict.winner, 'player');
  assert.equal(verdict.reason, 'ko');
  assert.deepEqual(verdict.activityV119, activity(chapterIds[0]));
  assert.ok(verdict.durationTicks > live.tick);
  for (const forged of [
    { ...verdict, activityV119: activity(chapterIds[1]) },
    { ...verdict, activityV119: { branch: 'campaign', id: chapterIds[0] } },
    { ...verdict, rulesV119: { ...verdict.rulesV119, noSpecial: false } },
    { ...verdict, stageId: 'hive-vault' },
    { ...verdict, durationTicks: live.tick - 1 }
  ]) assert.equal(settleXenoTrialsV96(saved, forged).applied, false);
  assert.equal(saved.pending.duelCheckpointV197.snapshot.tick, live.tick);
  const committed = settleXenoTrialsV96(saved, verdict);
  assert.equal(committed.applied, true);
  assert.equal(committed.receipt.modeReward.bonus, route.chapters[0].reward);
  assert.equal(committed.receipt.credits, 80 + route.chapters[0].reward);
  assert.equal(committed.receipt.modeReward.unlockId, null);
  assert.equal(settleXenoTrialsV96(committed.state, verdict).applied, false);
  assert.equal(currentBoard(reload(committed.state)).nextChapterId, chapterIds[1]);
  assert.deepEqual(committed.state.modesV119.campaignCleared, []);
  const replay = begin(reload(committed.state), 0);
  const replayVerdict = finishMatch(startMatch(replay.config));
  const repeated = settleXenoTrialsV96(replay.state, replayVerdict);
  assert.equal(repeated.applied, true);
  assert.equal(repeated.receipt.modeReward.bonus, 0);
  assert.equal(repeated.receipt.credits, 80);
  assert.equal(currentBoard(repeated.state).nextChapterId, chapterIds[1]);
});

test('a loss or abandonment retains progress and the finale grants permanent access only once', () => {
  const fresh = createXenoTrialsProgressV96();
  // Existing global campaign validation remains independent of this route.
  fresh.modesV119.campaignCleared.push(XENO_TRIALS_CAMPAIGN_V119[0].id);
  let progress = fresh;
  let savedBeforeFinal, finalVerdict;
  for (const [index, chapter] of route.chapters.entries()) {
    if (index === 1) {
      const retry = begin(progress, index);
      const lost = settleXenoTrialsV96(retry.state, finishMatch(startMatch(retry.config), { driver: 'opponent' }));
      assert.equal(lost.applied, true);
      assert.equal(lost.receipt.winner, 'opponent');
      assert.equal(lost.receipt.modeReward.bonus, 0);
      assert.deepEqual(currentBoard(lost.state).chapters.map(chapter => chapter.cleared), [true, false, false, false]);
      const stopped = abandonXenoTrialsV96(begin(lost.state, index).state);
      assert.equal(stopped.applied, true);
      assert.equal(currentBoard(reload(stopped.state)).nextChapterId, chapter.id);
      progress = stopped.state;
    }
    if (chapter.unlockId) savedBeforeFinal = reload(progress);
    const issued = begin(reload(progress), index);
    assert.equal(issued.applied, true);
    const result = finishMatch(startMatch(issued.config), { driver: chapter.rules.goal === 'survive' ? 'survive' : 'player' });
    assert.equal(result.winner, 'player');
    assert.equal(result.reason, chapter.rules.goal === 'survive' ? 'time' : 'ko');
    assert.deepEqual(result.wins, { player: 2, opponent: 0 });
    const paid = settleXenoTrialsV96(issued.state, result);
    assert.equal(paid.applied, true);
    assert.equal(paid.receipt.modeReward.bonus, chapter.reward);
    assert.equal(paid.receipt.modeReward.unlockId, chapter.unlockId ?? null);
    assert.equal(paid.state.unlocked.includes(playerId), Boolean(chapter.unlockId));
    if (chapter.unlockId) finalVerdict = result;
    progress = paid.state;
    assert.equal(currentBoard(progress).clearedCount, index + 1);
  }
  const final = currentBoard(reload(progress));
  assert.equal(final.completed, true);
  assert.equal(final.nextChapterId, null);
  assert.equal(final.epilogue, route.epilogue);
  assert.deepEqual(final.chapters.map(chapter => chapter.cleared), [true, true, true, true]);
  assert.deepEqual(progress.modesV119.campaignCleared, [XENO_TRIALS_CAMPAIGN_V119[0].id]);
  assert.equal(reload(progress).unlocked.filter(id => id === playerId).length, 1);
  assert.equal(settleXenoTrialsV96(progress, finalVerdict).applied, false);
  assert.equal(beginXenoTrialsV96(reload(progress), { playerId, activityV119: { branch: 'on-demand', id: 'on-demand' } }).applied, true);

  const bought = unlockXenoTrialsFighterV96(savedBeforeFinal, playerId);
  assert.equal(bought.applied, true);
  assert.equal(bought.state.credits, savedBeforeFinal.credits - getXenoTrialsUnlockCostV96(playerId));
  const alreadyOwned = begin(bought.state, 3);
  const paidAlreadyOwned = settleXenoTrialsV96(alreadyOwned.state, finishMatch(startMatch(alreadyOwned.config)));
  assert.equal(paidAlreadyOwned.receipt.modeReward.unlockId, null);
  assert.equal(paidAlreadyOwned.state.credits, progress.credits - getXenoTrialsUnlockCostV96(playerId));
  assert.equal(paidAlreadyOwned.state.unlocked.filter(id => id === playerId).length, 1);

  const replay = begin(reload(progress), 3);
  const paidReplay = settleXenoTrialsV96(replay.state, finishMatch(startMatch(replay.config)));
  assert.equal(paidReplay.receipt.modeReward.unlockId, null);
  assert.equal(paidReplay.receipt.modeReward.bonus, 0);
  assert.equal(paidReplay.receipt.credits, 130);
});

test('a fresh route beats all four native CPU opponents through movement and attack inputs only', () => {
  const attacks = ['heavy', 'light', 'light', 'heavy'];
  let progress = createXenoTrialsProgressV96();
  for (let index = 0; index < route.chapters.length; index++) {
    const issued = begin(reload(progress), index);
    assert.equal(issued.applied, true);
    assert.equal(issued.config.seed, 96001 + index);
    const match = startMatch(issued.config), result = finishMatch(match, { cpu: true, attack: attacks[index] });
    assert.equal(match.opponentInputSourceV163, 'cpu');
    assert.ok(match.ai.decisions > 0);
    assert.equal(result.winner, 'player', route.chapters[index].id);
    assert.equal(result.reason, 'ko');
    assert.ok(result.playerStats.damage > 0);
    assert.equal(result.wins.player, 2);
    const paid = settleXenoTrialsV96(issued.state, result);
    assert.equal(paid.applied, true);
    assert.equal(paid.receipt.modeReward.bonus, route.chapters[index].reward);
    assert.equal(paid.state.unlocked.includes(playerId), index === route.chapters.length - 1);
    progress = paid.state;
  }
  const finished = reload(progress);
  assert.equal(currentBoard(finished).completed, true);
  assert.ok(finished.unlocked.includes(playerId));
});
