import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createXenoTrialsMatchV96 as create, nextXenoTrialsRoundV96, stepXenoTrialsMatchV96 as step,
  XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { activateXenoTrialsFinisherV207 as activate, advanceXenoTrialsFinisherV207 as advance, createXenoTrialsFinisherV207 as offer,
  getXenoTrialsFinisherStateV207 as state, getXenoTrialsFinisherViewV207 as view, pauseXenoTrialsFinisherV207 as pause,
  skipXenoTrialsFinisherV207 as skip } from '../src/xeno-trials-finishers-v207.js';
import { getXenoTrialsFinisherCopyV208 } from '../src/xeno-trials-finishers-v208.js';
import { drawXenoTrialsFinisherFixturesV210 as drawFixtures, getXenoTrialsFinisherFixturesV210 as fixtures } from '../src/xeno-trials-finishers-v210.js';
import { drawXenoTrialsNeutralFinisherV211 } from '../src/xeno-trials-finishers-v211.js';
import { drawXenoTrialsIsolationApproachV212 as drawWithdrawal } from '../src/xeno-trials-finishers-v212.js';
import { XENO_TRIALS_ARENA_V105, getXenoTrialsBodyBoundsV105 as body, getXenoTrialsBodyGapV105 as gap } from '../src/xeno-trials-geometry-v105.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsRenderMetricsV110 as metrics } from '../src/xeno-trials-scale-v110.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { XENO_TRIALS_SPRITE_ATLASES_V191, XENO_TRIALS_SPRITE_ATLASES_V197 } from '../src/xeno-trials-sprite-atlas-v191.js';

const images = new Map([...XENO_TRIALS_SPRITE_ATLASES_V188, ...XENO_TRIALS_SPRITE_ATLASES_V189,
  ...XENO_TRIALS_SPRITE_ATLASES_V191, ...XENO_TRIALS_SPRITE_ATLASES_V197]
  .map(({ texture }) => [texture.path, { complete: true, naturalWidth: texture.width, naturalHeight: texture.height }]));
const { floor } = XENO_TRIALS_ARENA_V105;
const docking = 'xt179-ship-docking', quarantine = 'xt179-quarantine';
const installations = [[docking, 'shutter'], [quarantine, 'drain']];
const near = (a, b) => Math.abs(a - b) < 1e-7;

function canvas() {
  const calls = [];
  return new Proxy({ globalAlpha: 1, calls }, { get: (obj, key) => obj[key] ?? ((...args) => calls.push([key, ...args])) });
}

function cpuVerdict(stageId, config = {}) {
  const match = create({ playerId: 'synth-trooper', opponentId: 'runner', seed: 37, stageId, difficulty: 'easy', introSeconds: 0,
    roundsToWin: 1, rulesV119: { initialHp: 1 }, ...config });
  for (let tick = 0; !match.result && tick < 510; tick++) {
    const [a, b] = match.fighters;
    const direction = a.x <= b.x ? 1 : -1;
    const approach = gap(a, b, direction) > 47 && !a.attack;
    step(match, dt, approach ? { [direction > 0 ? 'right' : 'left']: true } : { heavy: tick % 3 === 0 });
  }
  return match;
}

function fromRight(stageId, config = {}) {
  // Cross the opponent with a real jump, then position both actors with normal
  // local controls. The latch target and all final roots come from combat.
  const match = create({ playerId: 'runner', opponentId: 'synth-trooper', seed: 221, stageId, difficulty: 'easy', introSeconds: 0,
    roundsToWin: 1, rulesV119: { initialHp: 1 }, ...config });
  playFromRight(match);
  return match;
}

function playFromRight(match) {
  const since = match.tick;
  const [a, b] = match.fighters;
  while (gap(a, b, 1) > 28 && match.tick - since < 310) step(match, dt, { right: true }, {});
  step(match, dt, { jump: true, right: true }, {});
  for (let tick = 0; tick < 155; tick++) step(match, dt, { right: true }, {});
  assert.ok(a.x > b.x && a.y === 0);
  const fixture = fixtures(match.config.stageId).find(value => value.x > 650);
  const readyX = fixture.right - (fixture.right - fixture.left) * .35;
  while (a.x < fixture.right + 140 && match.tick - since < 730) step(match, dt, { right: true }, {});
  while (b.x < readyX && match.tick - since < 990) step(match, dt, {}, { right: true });
  while (gap(a, b, -1) > 5 && match.tick - since < 1300) step(match, dt, { left: true }, {});
  for (let tick = 0; match.phase === 'active' && tick < 110; tick++) step(match, dt, { light: tick % 3 === 0 }, {});
}

function frameId(drawing) {
  return Object.entries(drawing).find(([key]) => key.startsWith('spriteAtlasV'))?.[1].frameId;
}

for (const [stage, kind] of installations) {
  for (const [side, play] of [['left', cpuVerdict], ['right', fromRight]]) {
    test(`${kind} ${side}: reach the existing fixture, reverse a native gait and complete once after KO`, () => {
      const match = play(stage);
      assert.equal(match.result?.winner, 'player');
      assert.equal(match.result.reason, 'ko');
      const untouched = structuredClone(match);
      const [victor, target] = match.fighters;
      const facing = side === 'left' ? 1 : -1;
      assert.equal(victor.facing, facing);
      const offerView = offer(match, images, false, true);
      assert.equal(offerView.kind, 'seal');
      const alternative = offerView.alternatives[0];
      assert.equal(alternative.id, `${victor.id}::fin2`);
      assert.equal(alternative.kind, kind);
      assert.match(getXenoTrialsFinisherCopyV208(kind).button, kind === 'shutter' ? /VOLET/ : /DRAIN/);
      const active = activate(offerView, alternative.id);
      const { fixture, withdrawalV221, approachV212 } = active.lock;
      const { offset, gait } = approachV212;
      assert.ok(fixtures(stage).includes(fixture));
      assert.ok(target.x >= fixture.left && target.x <= fixture.right);
      assert.equal(withdrawalV221.padX, fixture.pads[side === 'left' ? 0 : 1][0]);
      assert.ok((withdrawalV221.destination - victor.x) * facing < 0);
      assert.ok(Math.abs(offset) > 10 && Math.abs(offset) <= 108);
      const edge = facing > 0 ? body(victor).right : body(victor).left;
      assert.ok(near((edge + offset - withdrawalV221.padX) * facing, -8));
      const sprite = gait.atlas.texture;
      const bytes = readFileSync(new URL('..' + sprite.path, import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), sprite.sha256);
      assert.equal(bytes.readUInt32BE(16), sprite.width);
      assert.equal(bytes.readUInt32BE(20), sprite.height);
      assert.deepEqual(state(active).withdrawalV221, withdrawalV221);
      const draw = at => drawWithdrawal(canvas(), victor, at, metrics(victor.id, victor.variant), images);
      assert.ok(drawFixtures(canvas(), stage, null).every(value => !value.active));
      const halfway = advance(active, active.timing.approachMs / 2);
      const backing = view(halfway);
      const backPose = draw(backing);
      assert.ok(near(backPose.withdrawalV221.x, victor.x + offset / 2));
      assert.equal(backPose.withdrawalV221.reversing, true);
      assert.match(frameId(backPose), /^walk-/);
      assert.ok(backPose.supports.every(([, y]) => Math.abs(y - floor) <= 6));
      assert.ok(drawFixtures(canvas(), stage, backing).every(value => !value.active));
      const paused = pause(halfway, true);
      assert.equal(advance(paused, 300), paused);
      assert.equal(skip(paused), paused);
      const held = view(advance(active, active.timing.approachMs + 10));
      assert.equal(held.contact, true);
      const seated = draw(held);
      assert.ok(near(seated.withdrawalV221.x, withdrawalV221.destination));
      if (gait.atlas.frames.some(frame => frame.id === 'idle')) assert.equal(frameId(seated), 'idle');
      else assert.match(frameId(seated), /^walk-/);
      assert.equal(frameId(draw(view(advance(active, active.timing.approachMs + 210)))), frameId(seated));
      assert.equal(seated.withdrawalV221.stationary, true);
      assert.deepEqual(drawFixtures(canvas(), stage, held).filter(value => value.active).map(value => value.id), [fixture.id]);
      assert.equal(drawXenoTrialsNeutralFinisherV211(canvas(), stage, held, false), null);
      const returning = view(advance(active, active.durationMs - active.timing.retreatMs / 2));
      assert.ok(near(draw(returning).withdrawalV221.x, backPose.withdrawalV221.x));
      assert.equal(draw(returning).withdrawalV221.reversing, false);
      assert.ok(drawFixtures(canvas(), stage, returning).every(value => !value.active));
      assert.equal(draw(view(skip(active))), null);
      assert.ok(drawFixtures(canvas(), stage, view(advance(active, active.durationMs))).every(value => !value.active));
      assert.deepEqual(match, untouched);
    });
  }
}

test('ordinary options, first rounds, exact atlas availability and reduced motion retain their own gates', () => {
  const match = cpuVerdict(docking);
  const legacy = offer(match, images, false, true);
  assert.equal(legacy.kind, 'seal');
  assert.equal(offer(match, images, true, true), null);
  const { texture } = legacy.alternatives[0].lock.approachV212.gait.atlas;
  const wrongImages = new Map(images);
  wrongImages.delete(texture.path);
  assert.equal(offer(match, wrongImages, false, true).alternatives.length, 0);
  const betweenRounds = fromRight(docking, { roundsToWin: 2, holdRoundTransition: true });
  assert.equal(betweenRounds.roundWinner, 'player');
  assert.equal(betweenRounds.phase, 'round-over');
  assert.equal(offer(betweenRounds, images, false, true), null);
  assert.ok(offer(cpuVerdict('tantalus-bridge'), images, false, true).alternatives.every(value => !value.lock.withdrawalV221));
});

test('the paid duel settles once and a stage withdrawal shares its existing option without paying again', () => {
  const owned = createXenoTrialsProgressV96();
  if (!owned.unlocked.includes('runner')) owned.unlocked.push('runner');
  const started = beginXenoTrialsV96(owned, { playerId: 'runner', opponentId: 'synth-trooper', stageId: docking,
    difficulty: 'easy', activityV119: { branch: 'on-demand', id: 'on-demand', rules: { initialHp: 1 } } });
  assert.equal(started.applied, true);
  const actual = fromRight(docking, { ...started.config, introSeconds: 0, holdRoundTransition: true });
  assert.equal(offer(actual, images, false, true), null);
  assert.equal(nextXenoTrialsRoundV96(actual), true);
  playFromRight(actual);
  assert.deepEqual(actual.result.wins, { player: 2, opponent: 0 });
  const settled = settleXenoTrialsV96(started.state, actual.result);
  assert.equal(settled.applied, true);
  const chosen = activate(offer(actual, images, false, true), 'runner::fin2');
  assert.equal(chosen.phase, 'playing');
  assert.ok(chosen.lock.withdrawalV221);
  assert.equal(advance(chosen, chosen.durationMs).phase, 'complete');
  assert.equal(settleXenoTrialsV96(settled.state, actual.result).applied, false);
});
