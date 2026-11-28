import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { XENO_TRIALS_CHARACTER_ROUTES_V232 as routes, getXenoTrialsCharacterRouteViewV232 as board,
  normalizeXenoTrialsCharacterRouteClearsV232 as normalizeClears,
  resolveXenoTrialsCharacterRouteChapterV232 as chapterById } from '../src/xeno-trials-character-routes-v232.js';
import { XENO_TRIALS_BIG_CHAP_ROUTE_V231 as legacyRoute,
  getXenoTrialsCharacterRouteViewV231 as legacyBoard } from '../src/xeno-trials-character-routes-v231.js';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, XENO_TRIALS_FACTIONS_V96 as factions,
  XENO_TRIALS_STAGES_V96 as stages, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_BRANCHES_V119, XENO_TRIALS_CAMPAIGN_V119,
  resolveXenoTrialsActivityV119 } from '../src/xeno-trials-modes-v119.js';
import { abandonXenoTrialsV96, beginXenoTrialsV96, checkpointXenoTrialsDuelV197,
  createXenoTrialsProgressV96, getXenoTrialsUnlockCostV96, normalizeXenoTrialsProgressV96,
  settleXenoTrialsV96, unlockXenoTrialsFighterV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, nextXenoTrialsRoundV96, setXenoTrialsPausedV96,
  stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as STEP } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { canUseXenoTrialsCharacterRouteFighterV231 as canUse,
  displayXenoTrialsRouteEntryV231 as display,
  renderXenoTrialsCharacterRouteStoryV231 as story } from '../src/xeno-trials-character-route-ui-v231.js';

const additions = routes.slice(1), branch = 'character-routes';
const activity = chapter => ({ branch, id: chapter.id });
const reload = state => normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(state)));
const begin = (state, route, index, patch = {}) => beginXenoTrialsV96(state,
  { playerId: route.fighterId, activityV119: activity(route.chapters[index]), ...patch });
const start = config => createXenoTrialsMatchV96({ ...config, introSeconds: 0, holdRoundTransition: true });
const view = (route, state) => board(route.id, state.modesV119);
const inputStrategies = {
  neomorph: [{ distance: 8 }, { distance: 0 }, { distance: 0 }, { distance: 0, special: true }],
  deacon: [{ distance: 0 }, { distance: 0 }, { distance: 0 }, { distance: 19 }],
  'specimen-six': [{ distance: 0 }, { distance: 0 }, { distance: 0, jump: true }, { distance: 0 }]
};

function pressToward(driver, target, tick, strategy = { distance: 0 }) {
  const gap = getXenoTrialsBodyGapV105(driver, target);
  return { left: target.x < driver.x && gap > strategy.distance, right: target.x > driver.x && gap > strategy.distance,
    light: gap <= 38 && tick % 3 === 0,
    special: strategy.special === true && gap < 120 && tick % 90 === 0,
    jump: strategy.jump === true && tick % 80 === 0 };
}

function stepMatch(match, { cpu = false, driver = 'player', strategy } = {}) {
  if (match.phase === 'round-over') {
    if (match.phaseTime <= 0) nextXenoTrialsRoundV96(match);
    stepXenoTrialsMatchV96(match, STEP, {}, cpu ? null : {});
    return;
  }
  const [player, opponent] = match.fighters;
  stepXenoTrialsMatchV96(match, STEP,
    driver === 'player' ? pressToward(player, opponent, match.tick, strategy) : {},
    cpu ? null : driver === 'opponent' ? pressToward(opponent, player, match.tick, strategy) : {});
}

/** Every verdict comes from native movement, attacks, timers and round transitions.
 * Neutral direct rivals are declared economy/loss fixtures; CPU routes use no rival input. */
function finish(match, options = {}) {
  if (match.paused) setXenoTrialsPausedV96(match, false);
  for (let tick = 0; tick < 120 * 180 && !match.result; tick++) stepMatch(match, options);
  assert.ok(match.result?.completed, match.config.activityV119.id);
  return match.result;
}

test('four routes reuse the admitted roster and locations, with twelve original localized chapters', () => {
  assert.equal(fighters.length, 202);
  assert.equal(stages.length, 131);
  assert.equal(XENO_TRIALS_CAMPAIGN_V119.length, 19);
  assert.equal(XENO_TRIALS_BRANCHES_V119.filter(entry => entry.id === branch).length, 1);
  assert.deepEqual(routes.map(route => route.id), ['big-chap', 'neomorph', 'deacon', 'specimen-six']);
  assert.equal(routes[0], legacyRoute);
  assert.deepEqual(additions.map(route => {
    const fighter = getXenoTrialsFighterV96(route.fighterId);
    return [fighter.id, fighter.hp, fighter.speed, getXenoTrialsUnlockCostV96(fighter.id)];
  }), [['mire-v209-neomorph', 171, 304, 180], ['mire-v209-deacon', 194, 253, 300], ['mire-v209-six', 205, 251, 300]]);
  const allIds = new Set();
  for (const route of additions) {
    assert.equal(route.canonStatus, 'original-tantalus-simulation');
    assert.ok(route.sourceUrls.every(url => /^https:\/\//.test(url)));
    assert.ok(route.sourceUrls.length);
    assert.ok(route.prologue && route.prologueEn && route.epilogue && route.epilogueEn);
    assert.equal(route.chapters.length, 4);
    assert.equal(route.chapters[1].opponentId, route.chapters[3].opponentId);
    assert.equal(route.chapters[2].rules.goal, 'survive');
    assert.deepEqual(route.chapters.map(chapter => chapter.unlockId ?? null), [null, null, null, route.fighterId]);
    for (const chapter of route.chapters) {
      assert.ok(!allIds.has(chapter.id)); allIds.add(chapter.id);
      assert.equal(chapter.branch, branch);
      assert.equal(chapter.forcedPlayerId, route.fighterId);
      assert.equal(chapter.routeId, route.id);
      assert.ok(chapter.title && chapter.titleEn && chapter.briefing && chapter.briefingEn && chapter.event && chapter.eventEn);
      assert.ok(getXenoTrialsFighterV96(chapter.opponentId));
      const stage = stages.find(entry => entry.id === chapter.stageId);
      assert.ok(stage.backdrop);
      assert.equal(stage.sourceWork, route.sourceWork);
      assert.ok(factions.find(entry => entry.id === chapter.factionId).roster.includes(chapter.opponentId));
    }
  }
  assert.equal(allIds.size, 12);
  assert.equal(board('unknown'), null);
  for (const id of [null, {}, '__proto__', 'xt232-neomorph-0', 'xt232-neomorph-1-forged', 'xt231-big-chap-5'])
    assert.equal(chapterById(id), null);
});

test('route keys validate separate contiguous prefixes while the exact V231 field and API stay compatible', () => {
  const fresh = createXenoTrialsProgressV96();
  assert.equal(Object.hasOwn(reload(fresh).modesV119, 'characterRoutesClearedV232'), false);
  assert.equal(Object.hasOwn(reload(fresh).modesV119, 'characterRoutesClearedV231'), false);
  const [neo, deacon, six] = additions;
  const saved = reload({ ...fresh, modesV119: { ...fresh.modesV119,
    characterRoutesClearedV231: [legacyRoute.chapters[0].id, legacyRoute.chapters[2].id],
    characterRoutesClearedV232: {
      neomorph: [neo.chapters[2].id, neo.chapters[0].id, neo.chapters[0].id, six.chapters[1].id, 'unknown'],
      deacon: [deacon.chapters[0].id, deacon.chapters[1].id],
      'specimen-six': [six.chapters[2].id],
      'big-chap': legacyRoute.chapters.map(chapter => chapter.id),
      unknown: ['unknown']
    } } });
  assert.deepEqual(saved.modesV119.characterRoutesClearedV231, [legacyRoute.chapters[0].id]);
  assert.deepEqual(saved.modesV119.characterRoutesClearedV232,
    { neomorph: [neo.chapters[0].id], deacon: deacon.chapters.slice(0, 2).map(chapter => chapter.id) });
  assert.deepEqual(board('big-chap', saved.modesV119), legacyBoard('big-chap', saved.modesV119));
  assert.deepEqual(board('big-chap', fresh.modesV119), legacyBoard('big-chap', fresh.modesV119));
  assert.deepEqual(normalizeClears(Object.create({ neomorph: neo.chapters.map(chapter => chapter.id) })), {});
  for (const malformed of [null, [], 'neomorph', { neomorph: {} }]) assert.deepEqual(normalizeClears(malformed), {});
  assert.equal(view(neo, saved).nextChapterId, neo.chapters[1].id);
  assert.equal(view(deacon, saved).nextChapterId, deacon.chapters[2].id);
  assert.equal(view(six, saved).nextChapterId, six.chapters[0].id);
  for (const route of additions) {
    assert.deepEqual(view(route, fresh).chapters.map(chapter => chapter.open), [true, false, false, false]);
    assert.equal(chapterById(route.chapters[1].id, fresh.modesV119), null);
    assert.equal(resolveXenoTrialsActivityV119({ branch: 'campaign', id: route.chapters[0].id }, saved.modesV119), null);
    assert.equal(resolveXenoTrialsActivityV119({ branch, id: route.chapters[0].id, reward: 999999,
      forcedPlayerId: 'queen' }, fresh.modesV119).reward, route.chapters[0].reward);
  }
});

test('four authentic V231 Big Chap checkpoints retain every saved value and 90 baseline native steps', () => {
  const bytes = readFileSync(new URL('./fixtures/xeno-trials-character-route-v231.json', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),
    '0c39c616014303207ad7f4dcee4c5fbc9141bde7904897b91a29c051a23453fb');
  const fixture = JSON.parse(bytes);
  assert.equal(fixture.producerCommit, '762b9a775312c227af974cae5f49b8bf8ebd475a');
  assert.equal(fixture.fixtures.length, 4);
  for (const [index, entry] of fixture.fixtures.entries()) {
    assert.equal(entry.chapterId, legacyRoute.chapters[index].id);
    assert.equal(createHash('sha256').update(JSON.stringify(entry.state)).digest('hex'), entry.sha256);
    const saved = reload(entry.state);
    assert.deepEqual(saved, entry.state);
    assert.equal(Object.hasOwn(saved.modesV119, 'characterRoutesClearedV232'), false);
    assert.deepEqual(board('big-chap', saved.modesV119), legacyBoard('big-chap', saved.modesV119));
    const live = structuredClone(saved.pending.duelCheckpointV197.snapshot);
    setXenoTrialsPausedV96(live, false);
    for (let tick = 0; tick < 90; tick++)
      stepXenoTrialsMatchV96(live, STEP, { right: tick < 45, light: tick % 3 === 0 });
    assert.equal(createHash('sha256').update(JSON.stringify(live)).digest('hex'), entry.nativeAfter90Sha256);
    const recaptured = checkpointXenoTrialsDuelV197(saved, live);
    assert.equal(recaptured.applied, true, recaptured.reason);
    assert.deepEqual(reload(recaptured.state), recaptured.state);
  }
});

for (const route of additions) {
  test(`${route.id}: exact actor loan and ticket reject cross-route, locked, forged and mismatched chapters`, () => {
    const fresh = createXenoTrialsProgressV96();
    assert.equal(begin(fresh, route, 1).applied, false);
    assert.equal(begin(fresh, route, 0, { playerId: 'warrior' }).reason, 'activity-unavailable');
    assert.equal(beginXenoTrialsV96(fresh, { playerId: route.fighterId,
      activityV119: { branch: 'on-demand', id: route.chapters[0].id } }).reason, 'fighter-locked');
    const issued = begin(fresh, route, 0, { opponentId: 'queen', difficulty: 'hard', stageId: 'hive-vault' });
    assert.equal(issued.applied, true);
    assert.equal(issued.config.playerId, route.fighterId);
    assert.equal(issued.config.opponentId, route.chapters[0].opponentId);
    assert.equal(issued.config.stageId, route.chapters[0].stageId);
    assert.equal(issued.config.difficulty, 'easy');
    assert.equal(issued.config.roundSeconds, 60);
    assert.equal(issued.config.roundsToWin, 2);
    assert.equal(issued.config.rulesV119.noSpecial, true);
    assert.ok(!issued.state.unlocked.includes(route.fighterId));
    assert.equal(begin(issued.state, route, 0).reason, 'pending-duel');
    assert.deepEqual(reload(issued.state).pending.config, issued.config);
    const other = additions.find(entry => entry !== route);
    for (const patch of [
      { playerId: other.fighterId }, { opponentId: 'queen' }, { stageId: 'hive-vault' },
      { activityV119: activity(other.chapters[0]) }, { activityV119: activity(route.chapters[2]) },
      { activityV119: { branch: 'campaign', id: route.chapters[0].id } },
      { activityV119: { branch: 'forged-route', id: route.chapters[0].id } }
    ]) assert.equal(reload({ ...issued.state, pending: { ...issued.state.pending,
      config: { ...issued.config, ...patch } } }).pending, null);
    const run = { id: 'hunter-pack', bout: 1, playerId: 'warrior' };
    assert.equal(begin({ ...fresh, modesV119: { ...fresh.modesV119, challengeRun: run } }, route, 0).reason,
      'activity-unavailable');
    assert.equal(reload({ ...issued.state, modesV119: { ...issued.state.modesV119, challengeRun: run } }).pending, null);
  });

  test(`${route.id}: four fresh native CPU bouts resume, pay each prime once and grant permanent access`, () => {
    let state = createXenoTrialsProgressV96(), beforeFinal;
    for (const [index, chapter] of route.chapters.entries()) {
      assert.ok(!state.unlocked.includes(route.fighterId));
      if (index === 3) beforeFinal = reload(state);
      const issued = begin(reload(state), route, index);
      assert.equal(issued.applied, true);
      assert.equal(issued.config.seed, 96001 + index);
      const match = start(issued.config), options = { cpu: true, strategy: inputStrategies[route.id][index] };
      for (let tick = 0; tick < 30; tick++) stepMatch(match, options);
      const parked = checkpointXenoTrialsDuelV197(issued.state, match);
      assert.equal(parked.applied, true, parked.reason);
      const saved = reload(parked.state), checkpoint = saved.pending.duelCheckpointV197;
      assert.equal(checkpoint.snapshot.tick, match.tick);
      assert.equal(checkpoint.snapshot.fighters[0].id, route.fighterId);
      assert.deepEqual(checkpoint.snapshot.config.activityV119, activity(chapter));
      assert.deepEqual(saved.pending.config, issued.config);
      const resumed = structuredClone(checkpoint.snapshot);
      const verdict = finish(resumed, options);
      assert.equal(verdict.winner, 'player', chapter.id);
      assert.equal(resumed.opponentInputSourceV163, 'cpu');
      assert.ok(resumed.ai.decisions > 0);
      assert.ok(verdict.playerStats.damage > 0);
      assert.equal(verdict.wins.player, 2);
      if (index === 0) assert.equal(verdict.playerStats.specials, 0);
      const other = additions.find(entry => entry !== route);
      for (const patch of [{ activityV119: activity(other.chapters[0]) },
        { activityV119: { branch: 'campaign', id: chapter.id } },
        { rulesV119: { ...verdict.rulesV119, noSpecial: !verdict.rulesV119.noSpecial } },
        { stageId: 'hive-vault' }, { durationTicks: match.tick - 1 }])
        assert.equal(settleXenoTrialsV96(saved, { ...verdict, ...patch }).applied, false);
      const paid = settleXenoTrialsV96(saved, verdict);
      assert.equal(paid.applied, true);
      assert.equal(paid.receipt.modeReward.bonus, chapter.reward);
      assert.equal(paid.receipt.modeReward.unlockId, chapter.unlockId ?? null);
      assert.equal(paid.receipt.credits, [80, 100, 100, 130][index] + chapter.reward);
      assert.equal(paid.state.unlocked.includes(route.fighterId), index === 3);
      assert.equal(settleXenoTrialsV96(paid.state, verdict).applied, false);
      assert.equal(view(route, reload(paid.state)).clearedCount, index + 1);
      assert.deepEqual(paid.state.modesV119.campaignCleared, []);
      assert.equal(Object.hasOwn(paid.state.modesV119, 'characterRoutesClearedV231'), false);
      assert.equal(Object.keys(paid.state.modesV119.characterRoutesClearedV232).length, 1);
      state = paid.state;
    }
    assert.equal(state.credits, 1340);
    assert.equal(state.xp, 330);
    assert.equal(view(route, reload(state)).completed, true);
    assert.equal(view(route, state).nextChapterId, null);
    for (const language of ['fr', 'en']) {
      const markup = story(view(route, state), language);
      assert.ok(markup.includes(language === 'en' ? route.epilogueEn : route.epilogue));
      assert.match(markup, language === 'en' ? /Permanent MIRE authorization/ : /Autorisation permanente MIRE/);
      assert.equal(markup.match(/<li>/g)?.length, 4);
      for (const chapter of route.chapters)
        assert.ok(markup.includes(language === 'en' ? chapter.eventEn : chapter.event));
    }
    assert.equal(state.unlocked.filter(id => id === route.fighterId).length, 1);
    assert.equal(beginXenoTrialsV96(reload(state), { playerId: route.fighterId,
      activityV119: { branch: 'on-demand', id: 'on-demand' } }).applied, true);
    for (const other of additions.filter(entry => entry !== route)) assert.equal(view(other, state).clearedCount, 0);

    // Purchase remains the independent paid alternative; a completed finale cannot tax it again.
    const bought = unlockXenoTrialsFighterV96(beforeFinal, route.fighterId);
    const cost = getXenoTrialsUnlockCostV96(route.fighterId);
    assert.equal(bought.applied, true);
    assert.equal(bought.state.credits, beforeFinal.credits - cost);
    const ownedFinal = begin(reload(bought.state), route, 3);
    const ownedPaid = settleXenoTrialsV96(ownedFinal.state, finish(start(ownedFinal.config)));
    assert.equal(ownedPaid.applied, true);
    assert.equal(ownedPaid.receipt.modeReward.unlockId, null);
    assert.equal(ownedPaid.receipt.modeReward.bonus, route.chapters[3].reward);
    assert.equal(ownedPaid.state.credits, state.credits - cost);
    assert.equal(ownedPaid.state.unlocked.filter(id => id === route.fighterId).length, 1);
    for (const index of [0, 3]) {
      const repeated = begin(reload(state), route, index);
      const replayed = settleXenoTrialsV96(repeated.state, finish(start(repeated.config)));
      assert.equal(replayed.applied, true);
      assert.equal(replayed.receipt.modeReward.bonus, 0);
      assert.equal(replayed.receipt.modeReward.unlockId, null);
      assert.equal(replayed.receipt.credits, index === 0 ? 80 : 130);
      assert.equal(view(route, replayed.state).clearedCount, 4);
    }
  });

  test(`${route.id}: loss, abandonment and future-story masking keep progress and authorization separate`, () => {
    const fresh = createXenoTrialsProgressV96(), issued = begin(fresh, route, 0);
    const lost = settleXenoTrialsV96(issued.state, finish(start(issued.config), { driver: 'opponent' }));
    assert.equal(lost.applied, true);
    assert.equal(lost.receipt.winner, 'opponent');
    assert.equal(lost.receipt.modeReward.bonus, 0);
    assert.equal(view(route, lost.state).clearedCount, 0);
    const abandoned = abandonXenoTrialsV96(begin(lost.state, route, 0).state);
    assert.equal(abandoned.applied, true);
    assert.equal(view(route, reload(abandoned.state)).nextChapterId, route.chapters[0].id);
    assert.ok(!abandoned.state.unlocked.includes(route.fighterId));
    const current = view(route, fresh);
    assert.equal(canUse(fresh, route.fighterId, current.chapters[0]), true);
    assert.equal(canUse(fresh, route.fighterId, current.chapters[1]), false);
    const foreign = additions.find(entry => entry !== route);
    assert.equal(canUse(fresh, foreign.fighterId, { ...current.chapters[0], forcedPlayerId: foreign.fighterId }), false);
    for (const language of ['fr', 'en']) {
      const markup = story(current, language);
      assert.ok(markup.includes(language === 'en' ? route.prologueEn : route.prologue));
      assert.ok(!markup.includes(language === 'en' ? route.epilogueEn : route.epilogue));
      assert.ok(!markup.includes(language === 'en' ? route.chapters[1].eventEn : route.chapters[1].event));
      if (route.id !== 'big-chap') assert.ok(!markup.includes('Big Chap'));
      const masked = display(current.chapters[1], language);
      assert.equal(masked.opponentId, null);
      assert.equal(masked.stageId, null);
      assert.equal(masked.event, '');
      assert.notEqual(masked.title, route.chapters[1].title);
    }
  });
}
