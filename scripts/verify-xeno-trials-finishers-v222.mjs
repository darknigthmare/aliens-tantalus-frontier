import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { activateXenoTrialsFinisherV207, advanceXenoTrialsFinisherV207, createXenoTrialsFinisherV207,
  getXenoTrialsFinisherStateV207, getXenoTrialsFinisherViewV207, pauseXenoTrialsFinisherV207,
  skipXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { getXenoTrialsFinisherCopyV208 } from '../src/xeno-trials-finishers-v208.js';
import { drawXenoTrialsNeutralFinisherV211, getXenoTrialsIsolationFixturesV211 } from '../src/xeno-trials-finishers-v211.js';
import { XENO_TRIALS_ARENA_V105, getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsRigV154, getXenoTrialsRuntimeArticulatedRig, getXenoTrialsRuntimeDefenseRig } from '../src/xeno-trials-rig-v154.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { XENO_TRIALS_SPRITE_ATLASES_V191, XENO_TRIALS_SPRITE_ATLASES_V197 } from '../src/xeno-trials-sprite-atlas-v191.js';

const routes = [
  ['containment-deck', 'warrior', 'smasher', 23, 88, 'heavy'],
  ['containment-deck', 'warrior', 'user-brute', 23, 88, 'heavy'],
  ['containment-deck', 'runner', 'mecha', 96001, 4, 'light'],
  ['containment-deck', 'prowler', 'chrysalis', 96001, 58, 'heavy'],
  ['containment-deck', 'prowler', 'xenoborg', 96001, 88, 'light'],
  ['containment-deck', 'synth-trooper', 'synth-automated-powerloader', 96001, 70, 'heavy'],
  ['reactor-ring', 'warrior', 'queen', 96001, 4, 'light'],
  ['reactor-ring', 'warrior', 'smasher', 96001, 35, 'light'],
  ['reactor-ring', 'warrior', 'chrysalis', 96001, 4, 'light'],
  ['reactor-ring', 'warrior', 'defender', 96001, 4, 'light'],
  ['reactor-ring', 'warrior', 'user-brute', 96001, 4, 'light'],
  ['reactor-ring', 'warrior', 'combat-synth', 96001, 58, 'light'],
  ['reactor-ring', 'warrior', 'synth-automated-powerloader', 96001, 10, 'light'],
  ['reactor-ring', 'warrior', 'mecha', 1, 88, 'light'],
  ['reactor-ring', 'runner', 'mechanoid', 96001, 4, 'light'],
  ['tantalus-bridge', 'warrior', 'queen', 96001, 4, 'light'],
  ['tantalus-bridge', 'warrior', 'smasher', 96001, 35, 'light'],
  ['tantalus-bridge', 'warrior', 'chrysalis', 96001, 4, 'light'],
  ['tantalus-bridge', 'warrior', 'defender', 96001, 4, 'light'],
  ['tantalus-bridge', 'warrior', 'user-brute', 96001, 4, 'light'],
  ['tantalus-bridge', 'warrior', 'synth-heavy', 1, 88, 'light'],
  ['tantalus-bridge', 'warrior', 'combat-synth', 96001, 58, 'light'],
  ['tantalus-bridge', 'warrior', 'synth-automated-powerloader', 96001, 4, 'light'],
  ['tantalus-bridge', 'runner', 'mechanoid', 96001, 4, 'light'],
  ['tantalus-cargo', 'warrior', 'queen', 96001, 88, 'light'],
  ['tantalus-cargo', 'warrior', 'smasher', 96001, 35, 'light'],
  ['tantalus-cargo', 'warrior', 'chrysalis', 96001, 4, 'light'],
  ['tantalus-cargo', 'warrior', 'defender', 96001, 4, 'light'],
  ['tantalus-cargo', 'warrior', 'user-brute', 96001, 4, 'light'],
  ['tantalus-cargo', 'warrior', 'combat-synth', 96001, 58, 'light'],
  ['tantalus-cargo', 'warrior', 'mecha-2', 96001, 70, 'heavy'],
  ['tantalus-cargo', 'runner', 'xenoborg', 96001, 22, 'light'],
  ['tantalus-cargo', 'runner', 'mechanoid', 96001, 4, 'light'],
];
const { floor } = XENO_TRIALS_ARENA_V105;
const decoded = (naturalWidth, naturalHeight) => ({ complete: true, naturalWidth, naturalHeight });
const atlases = [...XENO_TRIALS_SPRITE_ATLASES_V188, ...XENO_TRIALS_SPRITE_ATLASES_V189, ...XENO_TRIALS_SPRITE_ATLASES_V191,
  ...XENO_TRIALS_SPRITE_ATLASES_V197].map(({ texture }) => [texture.path, decoded(texture.width, texture.height)]);

function availableImages(id) {
  const art = getXenoTrialsArtV96(id), definition = getXenoTrialsFighterV96(id);
  const rig = getXenoTrialsRuntimeArticulatedRig(definition, art) || getXenoTrialsRuntimeDefenseRig(definition, art)
    || getXenoTrialsRigV154(definition, art);
  return new Map(rig ? [...atlases, [rig.path, decoded(rig.sourceWidth, rig.sourceHeight)]] : atlases);
}

function play([stageId, playerId, opponentId, seed, reach, action], overrides = {}) {
  const match = createXenoTrialsMatchV96({ stageId, playerId, opponentId, seed, difficulty: 'easy', introSeconds: 0,
    roundsToWin: 1, rulesV119: { initialHp: 1 }, ...overrides });
  drive(match, reach, action);
  return match;
}

function drive(match, reach, action, reachSecondRound = reach) {
  for (let tick = 0; !match.result && tick < 650; tick++) {
    if (match.config.holdRoundTransition && match.phase === 'round-over') break;
    const [attacker, target] = match.fighters;
    const direction = attacker.x <= target.x ? 1 : -1;
    const range = match.round === 1 ? reach : reachSecondRound;
    const moving = getXenoTrialsBodyGapV105(attacker, target, direction) > range && !attacker.attack;
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96,
      moving ? { [direction > 0 ? 'right' : 'left']: true } : { [action]: tick % 3 === 0 });
  }
}

function canvas() {
  const calls = [];
  return new Proxy({ globalAlpha: 1, calls }, { get: (object, key) => object[key] ?? ((...args) => calls.push([key, ...args])) });
}

for (const route of routes) {
  const [stage, initiator, defeated] = route;
  test(`${stage} ${initiator} → ${defeated}: terminal CPU verdict can arm both actual scanner pads`, () => {
    const match = play(route);
    assert.equal(match.result?.winner, 'player');
    assert.equal(match.result.reason, 'ko');
    const untouched = structuredClone(match);
    const [, target] = match.fighters;
    const fixtures = getXenoTrialsIsolationFixturesV211(stage);
    const [first, second] = fixtures;
    const targetX = getXenoTrialsBodyBoundsV105(target).center;
    const images = availableImages(initiator);
    const offer = createXenoTrialsFinisherV207(match, images, false, true);
    assert.equal(offer.kind, 'seal');
    assert.equal(offer.alternatives.length, 1);
    assert.equal(offer.alternatives[0].kind, 'isolation');
    assert.match(getXenoTrialsFinisherCopyV208('isolation').button, /ISOLER LE SECTEUR/);
    const sequence = activateXenoTrialsFinisherV207(offer, initiator + '::fin2');
    const lock = sequence.lock.crossScanV222;
    assert.ok(lock);
    assert.equal(lock.fixtures[0], first);
    assert.equal(lock.fixtures[1], second);
    assert.equal(lock.left, first.right);
    assert.equal(lock.right, second.left);
    assert.ok(targetX > lock.left && targetX < lock.right);
    assert.equal(lock.center, targetX);
    assert.deepEqual(getXenoTrialsFinisherStateV207(sequence).crossScanV222, fixtures.map(fixture => fixture.id));
    const half = advanceXenoTrialsFinisherV207(sequence, sequence.timing.approachMs / 2);
    const ctx = canvas(), moving = drawXenoTrialsNeutralFinisherV211(ctx, stage, getXenoTrialsFinisherViewV207(half), false);
    assert.equal(moving.contact, false);
    assert.deepEqual(ctx.calls.filter(([name]) => name === 'moveTo'),
      [['moveTo', first.right - 4.5, floor - 4], ['moveTo', second.left + 4.5, floor - 4]]);
    const [left, right] = moving.crossScanV222.heads;
    assert.ok(lock.left < left && left < targetX && targetX < right && right < lock.right);
    const converged = getXenoTrialsFinisherViewV207(advanceXenoTrialsFinisherV207(sequence, sequence.timing.approachMs));
    const drawn = drawXenoTrialsNeutralFinisherV211(canvas(), stage, converged, false);
    assert.equal(drawn.contact, true);
    assert.deepEqual(drawn.crossScanV222.heads, [targetX, targetX]);
    assert.equal(drawn.targetX, target.x);
    assert.equal(drawXenoTrialsNeutralFinisherV211(canvas(), 'hive-vault', converged, false), null);
    assert.equal(drawXenoTrialsNeutralFinisherV211(canvas(), stage, converged, true), null);
    const paused = pauseXenoTrialsFinisherV207(half, true);
    assert.equal(advanceXenoTrialsFinisherV207(paused, 200), paused);
    assert.equal(skipXenoTrialsFinisherV207(paused), paused);
    const skipped = getXenoTrialsFinisherViewV207(skipXenoTrialsFinisherV207(half));
    assert.equal(drawXenoTrialsNeutralFinisherV211(canvas(), stage, skipped, false), null);
    const ended = getXenoTrialsFinisherViewV207(advanceXenoTrialsFinisherV207(sequence, sequence.durationMs));
    assert.equal(drawXenoTrialsNeutralFinisherV211(canvas(), stage, ended, false), null);
    assert.deepEqual(match, untouched);
  });
}

test('the existing single-station option and the terminal, motion and stage gates precede the two-pad scan', () => {
  const config = ['containment-deck', 'warrior', 'queen', 23, 35, 'light'];
  const old = play(config), images = availableImages('warrior');
  const candidate = createXenoTrialsFinisherV207(old, images, false, true);
  assert.equal(candidate.alternatives[0].lock.fixture.id, 'containment-deck-mire-isolation-2');
  assert.equal(candidate.alternatives[0].lock.crossScanV222, undefined);
  const [first] = routes;
  const accepted = play(first);
  const native = availableImages(first[1]);
  assert.equal(createXenoTrialsFinisherV207(accepted, native, true, true), null);
  assert.equal(createXenoTrialsFinisherV207(accepted, native, false, false), null);
  const beforeFinal = play(first, { roundsToWin: 2, holdRoundTransition: true });
  assert.equal(beforeFinal.phase, 'round-over');
  assert.equal(createXenoTrialsFinisherV207(beforeFinal, native, false, true), null);
  const outside = play(['hive-vault', ...first.slice(1)]);
  assert.ok(createXenoTrialsFinisherV207(outside, native, false, true).alternatives.every(option => !option.lock.crossScanV222));
});

test('a fresh paid on-demand ticket earns the two-pad option after two native wins and settles once', () => {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: 'smasher',
    stageId: 'reactor-ring', difficulty: 'easy', activityV119: { branch: 'on-demand', id: 'on-demand', rules: { initialHp: 1 } } });
  assert.equal(ticket.applied, true);
  assert.equal(ticket.config.seed, 96001);
  const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0, holdRoundTransition: false });
  drive(match, 35, 'light', 88);
  assert.deepEqual(match.result?.wins, { player: 2, opponent: 0 });
  const settled = settleXenoTrialsV96(ticket.state, match.result);
  assert.equal(settled.applied, true);
  const offer = createXenoTrialsFinisherV207(match, availableImages('warrior'), false, true);
  const sequence = activateXenoTrialsFinisherV207(offer, 'warrior::fin2');
  assert.deepEqual(getXenoTrialsFinisherStateV207(sequence).crossScanV222,
    ['reactor-ring-mire-isolation-1', 'reactor-ring-mire-isolation-2']);
  assert.equal(advanceXenoTrialsFinisherV207(sequence, sequence.durationMs).phase, 'complete');
  assert.equal(settleXenoTrialsV96(settled.state, match.result).applied, false);
});
