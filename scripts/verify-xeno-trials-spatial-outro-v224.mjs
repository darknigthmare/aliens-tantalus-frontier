import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105, XENO_TRIALS_ARENA_V105 } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { createXenoTrialsCameraV119, getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { advanceXenoTrialsOutroV155, createXenoTrialsExitV157, createXenoTrialsLandingV157,
  getXenoTrialsExitViewV157, getXenoTrialsLandingViewV157, skipXenoTrialsOutroV155 } from '../src/xeno-trials-sequences-v155.js';
import { drawXenoTrialsSpatialOutroV220, drawXenoTrialsWinnerLandingV224 } from '../src/xeno-trials-spatial-outro-v220.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsSpriteLayoutV189, XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';

const routes = [
  ['warrior', 'player', 'easy', 96001, 52],
  ['runner', 'player', 'easy', 96001, 65],
  ['spitter', 'player', 'easy', 23, 83],
  ['prowler', 'player', 'easy', 23, 83],
  ['warrior', 'opponent', 'hard', 52, 42],
  ['runner', 'opponent', 'hard', 918, 82],
  ['prowler', 'opponent', 'hard', 95, 60],
];
const { floor } = XENO_TRIALS_ARENA_V105;
const atlases = [...XENO_TRIALS_SPRITE_ATLASES_V188, ...XENO_TRIALS_SPRITE_ATLASES_V189];
const texture = (naturalWidth, naturalHeight) => ({ complete: true, naturalWidth, naturalHeight });
const assertedAtlases = new Set();
const textures = () => new Map(atlases.map(({ texture: record }) => [record.path, texture(record.width, record.height)]));

function config([id, side, difficulty, seed], extra = {}) {
  return { playerId: side === 'player' ? id : 'runner', opponentId: side === 'opponent' ? id : 'runner',
    matchId: `v224-${id}-${side}`, stageId: 'containment-deck', introSeconds: 0, roundsToWin: 1,
    difficulty, seed, rulesV119: { initialHp: 1, noSpecial: true }, ...extra };
}

// Every route calls the stock CPU. On the left the player wins with a jumping
// light. On the right the player approaches and jumps, giving the CPU a real
// chance to intercept in the air.
function input([, side, , , reach], state, tick = state.tick) {
  const [player, opponent] = state.fighters;
  const direction = player.x <= opponent.x ? 1 : -1;
  const near = getXenoTrialsBodyGapV105(player, opponent, direction) <= reach;
  if (!near && !player.attack) return { [direction === 1 ? 'right' : 'left']: true };
  return { jump: near && player.y === 0 && !player.attack && !player.previousInput.jump,
    light: side === 'player' && near && player.y > 0 && tick % 3 === 0 };
}

function duel(route, extra = {}) {
  const match = createXenoTrialsMatchV96(config(route, extra));
  for (let tick = 0; tick < 400 && match.phase === 'active'; tick++) stepXenoTrialsMatchV96(match, dt, input(route, match, tick));
  return match;
}

function finish(state) {
  while (state.phase === 'playing') state = advanceXenoTrialsOutroV155(state, 100);
  return state;
}

function verifyTexture(path) {
  const atlas = atlases.find(entry => entry.texture.path === path);
  if (!assertedAtlases.has(path)) {
    const file = readFileSync(new URL(`..${path}`, import.meta.url));
    assert.equal(createHash('sha256').update(file).digest('hex'), atlas.texture.sha256);
    assert.equal(file.readUInt32BE(16), atlas.texture.width);
    assert.equal(file.readUInt32BE(20), atlas.texture.height);
    assertedAtlases.add(path);
  }
  return atlas;
}

function canvas() {
  return new Proxy({ globalAlpha: 1 }, { get(object, key) {
    if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
    return object[key] ?? (() => {});
  } });
}

for (const route of routes) {
  const [id, side] = route;
  test(`${id}: native ${side} KO lands on the admitted support, then only the winner walks out`, () => {
    const match = duel(route), before = structuredClone(match), images = textures();
    assert.equal(match.result?.reason, 'ko');
    assert.equal(match.result.winner, side);
    const winner = match.fighters.find(actor => actor.side === side), loser = match.fighters.find(actor => actor.side !== side);
    assert.ok(winner.y > 0 && loser.hp === 0);
    const inputHeight = winner.y;
    const camera = createXenoTrialsCameraV119(match.fighters).getState();
    const metrics = getXenoTrialsRenderMetricsV110(id, winner.variant);
    const context = canvas();
    let landing = createXenoTrialsLandingV157(match, false, images);
    const initial = getXenoTrialsLandingViewV157(match, winner, landing);
    assert.equal(initial.startX, winner.x);
    assert.equal(initial.startVy, winner.vy);
    assert.equal(initial.renderY, inputHeight);
    const motion = verifyTexture(initial.airAtlasPathV224);
    const idle = verifyTexture(initial.idleAtlasPathV224);
    assert.equal(motion.fighterId, id);
    assert.equal(idle.fighterId, id);
    assert.equal(createXenoTrialsExitV157(match, null, camera, false, landing, images), null);
    const firstDraw = drawXenoTrialsWinnerLandingV224(context, match, winner, images, initial, metrics);
    assert.equal(firstDraw.spriteAtlasV189.frameId, winner.vy > 0 ? 'air-rise' : 'air-fall');
    let previous = initial.renderY;
    let fell = false;
    while (landing.phase === 'playing') {
      const view = getXenoTrialsLandingViewV157(match, winner, landing);
      const drawn = drawXenoTrialsWinnerLandingV224(context, match, winner, images, view, metrics);
      assert.equal(drawn.winnerLandingV224.startX, winner.x);
      assert.ok(view.renderY <= previous && view.renderY > 0);
      assert.ok(drawn.bounds.bottom < floor);
      fell ||= drawn.spriteAtlasV189.frameId === 'air-fall';
      previous = view.renderY;
      landing = advanceXenoTrialsOutroV155(landing, 20);
    }
    assert.equal(fell, true);
    const settled = getXenoTrialsLandingViewV157(match, winner, landing);
    assert.equal(settled.ground, floor);
    assert.equal(settled.settled, true);
    const still = drawXenoTrialsWinnerLandingV224(context, match, winner, images, settled, metrics);
    assert.equal(still.spriteAtlasV188.frameId, 'idle');
    assert.ok(still.supports.every(([, y]) => Math.abs(y - floor) < 5));

    let exit = createXenoTrialsExitV157(match, null, camera, false, landing, images);
    assert.deepEqual(exit.participants.map(actor => actor.side), [winner.side]);
    const participant = exit.participants[0];
    assert.deepEqual(participant.fromLandingV224, { y: inputHeight, vy: winner.vy });
    assert.equal(participant.direction, winner.x < loser.x ? -1 : 1);
    assert.equal(getXenoTrialsExitViewV157(match, loser, exit), null);
    const start = getXenoTrialsExitViewV157(match, winner, exit);
    assert.equal(start.x, winner.x);
    assert.deepEqual(drawXenoTrialsSpatialOutroV220(context, match, winner, images, start, metrics).bounds, still.bounds);
    const steps = new Set();
    while (exit.phase === 'playing') {
      const view = getXenoTrialsExitViewV157(match, winner, exit);
      const drawn = drawXenoTrialsSpatialOutroV220(context, match, winner, images, view, metrics);
      if (drawn.spriteAtlasV189) steps.add(drawn.spriteAtlasV189.frameId);
      exit = advanceXenoTrialsOutroV155(exit, 20);
    }
    assert.equal(steps.size, 8);
    const end = getXenoTrialsExitViewV157(match, winner, exit);
    assert.equal(end.visible, false);
    for (const frame of motion.frames.slice(0, 8)) {
      const { bounds } = getXenoTrialsSpriteLayoutV189(motion, frame, metrics, { x: end.x, y: floor, facing: end.direction });
      assert.ok(end.direction < 0 ? bounds.right * camera.zoom + camera.translateX <= -12 + 1e-8
        : bounds.left * camera.zoom + camera.translateX >= 1012 - 1e-8);
    }
    assert.deepEqual(match, before);
  });
}

test('airborne admission requires a decisive signed terminal KO and the exact loaded sprites', () => {
  const route = routes[0], match = duel(route), winner = match.fighters[0], images = textures();
  const landing = createXenoTrialsLandingV157(match, false, images);
  const [entry] = landing.participants;
  const camera = createXenoTrialsCameraV119(match.fighters).getState();
  const complete = finish(landing);
  const release = receipt => createXenoTrialsExitV157(match, null, camera, false, receipt, images);
  for (const change of [{ id: 'foreign' }, { terminalTick: match.tick + 1 }, { matchId: 'wrong' }, { paused: true },
    { elapsedMs: landing.durationMs / 2 }, { participants: [{ ...entry, startVy: 0 }] },
    { participants: [{ ...entry, idleAtlasPathV224: entry.airAtlasPathV224 }] }]) assert.equal(release({ ...complete, ...change }), null);
  assert.ok(release(complete));
  assert.equal(release(skipXenoTrialsOutroV155(landing)), null);
  const reduced = createXenoTrialsLandingV157(match, true, images);
  assert.equal(getXenoTrialsLandingViewV157(match, winner, reduced).ground, floor);
  assert.equal(release(reduced), null);
  assert.equal(getXenoTrialsLandingViewV157(match, winner, skipXenoTrialsOutroV155(landing)).ground, floor);
  assert.equal(createXenoTrialsLandingV157(match, false, images, false), null);
  images.set(entry.airAtlasPathV224, texture(1, 1));
  assert.equal(createXenoTrialsLandingV157(match, false, images), null);
  assert.equal(release(complete), null);

  const openingRound = duel(route, { roundsToWin: 2, holdRoundTransition: true });
  assert.equal(openingRound.phase, 'round-over');
  assert.ok(openingRound.fighters[0].y > 0);
  assert.equal(createXenoTrialsLandingV157(openingRound, false, textures()), null);
  for (const changed of [{ reason: 'time' }, { reason: 'double-ko', winner: 'draw' }, { durationTicks: match.tick + 1 }]) {
    const altered = { ...match, result: { ...match.result, ...changed } };
    assert.equal(createXenoTrialsLandingV157(altered, false, textures()), null);
  }
});

async function runRuntime(route, exercise) {
  const images = textures(), results = [], queue = new Map();
  for (const id of [config(route).playerId, config(route).opponentId]) {
    const art = getXenoTrialsArtV96(id);
    images.set(art.path, texture(art.sourceWidth, art.sourceHeight));
  }
  const eventTarget = { addEventListener() {}, removeEventListener() {} };
  let counter = 0, time = 0, reduced = false;
  const runtime = createXenoTrialsRuntimeV96({ canvas: { width: 1000, height: 560, getContext: canvas, focus() {} },
    document: { ...eventTarget, hasFocus: () => true }, window: { ...eventTarget, matchMedia: () => ({ matches: reduced }) },
    config: config(route), loadImage: async path => images.get(path) || texture(1024, 1024),
    requestAnimationFrame(callback) { queue.set(++counter, callback); return counter; },
    cancelAnimationFrame(id) { queue.delete(id); }, onResult(result) { results.push(result); } });
  const frame = () => {
    time += dt * 1000;
    for (const [id, callback] of [...queue]) if (queue.delete(id)) callback(time);
  };
  try {
    assert.equal(await runtime.start(), true);
    for (let frames = 0; frames < 1700 && runtime.getState().phase !== 'match-over'; frames++) {
      const state = runtime.getState();
      if (state.phase === 'active' && !state.presentation.blocksSimulation) {
        const keys = input(route, state);
        for (const action of ['left', 'right', 'jump', 'light']) runtime.setInput(action, Boolean(keys[action]));
      }
      frame();
    }
    const verdict = runtime.getState();
    assert.equal(verdict.result?.reason, 'ko');
    assert.equal(verdict.result.winner, route[1]);
    assert.equal(results.length, 1);
    assert.equal(verdict.canActivateFinisherV207, false);
    assert.ok(verdict.landingViewsV157.some(view => view.airAtlasPathV224 && view.side === route[1]));
    assert.equal(verdict.exitV157, null);
    exercise(runtime, frame, queue, verdict, () => { reduced = true; });
    const end = runtime.getState();
    assert.equal(results.length, 1);
    assert.deepEqual(end.result, verdict.result);
    assert.deepEqual(end.fighters, verdict.fighters);
    assert.equal(end.tick, verdict.tick);
    assert.equal(queue.size, 0);
  } finally { runtime.stop(); }
}

test('production runtime draws CPU air and KO receipts together, freezes on pause, then completes the exit', async () => {
  await runRuntime(routes[5], (runtime, frame, queue, verdict) => {
    assert.ok(verdict.rigViewsV154.some(row => row.winnerLandingV224 && row.spriteAtlasV189.frameId === 'air-fall'));
    assert.ok(verdict.rigViewsV154.some(row => row.landingV219 && row.spriteAtlasV188.frameId === 'ko-fall'));
    assert.equal(runtime.pause(), true);
    const paused = runtime.getState();
    assert.equal(queue.size, 0);
    frame();
    assert.deepEqual(runtime.getState(), paused);
    assert.equal(runtime.resume(), true);
    for (let i = 0; i < 1000 && queue.size; i++) frame();
    const complete = runtime.getState();
    assert.equal(complete.landingV157.phase, 'complete');
    assert.equal(complete.exitV157.phase, 'complete');
    assert.deepEqual(complete.exitV157.participants.map(actor => actor.side), ['opponent']);
    assert.ok(complete.rigViewsV154.some(row => row.side === 'player' && row.spriteAtlasV188.frameId === 'ko-ground'));
  });
});

test('production runtime sends the player out after the grounded loser alone has completed the older verdict pose', async () => {
  await runRuntime(routes[0], (runtime, frame, queue, verdict) => {
    assert.deepEqual(verdict.outroV155.participants.map(actor => actor.side), ['opponent']);
    while (runtime.getState().landingV157.phase === 'playing') frame();
    const landed = runtime.getState();
    assert.equal(landed.outroV155.phase, 'playing');
    assert.equal(landed.exitV157, null);
    assert.ok(landed.rigViewsV154.some(row => row.side === 'player' && row.winnerLandingV224?.settled));
    for (let i = 0; i < 1000 && queue.size; i++) frame();
    const complete = runtime.getState();
    assert.equal(complete.outroV155.phase, 'complete');
    assert.equal(complete.terminalV156, null);
    assert.equal(complete.exitV157.phase, 'complete');
    assert.deepEqual(complete.exitV157.participants.map(actor => actor.side), ['player']);
  });
});

for (const action of ['skip', 'reduced-motion']) {
  test(`production runtime applies ${action} during the descent without replaying the verdict`, async () => {
    await runRuntime(routes[0], (runtime, frame, queue, verdict, reduce) => {
      if (action === 'skip') assert.equal(runtime.skipSequence(), true);
      else { reduce(); frame(); }
      const complete = runtime.getState();
      assert.equal(complete.landingV157.phase, 'complete');
      assert.equal(complete.exitV157, null);
      assert.ok(complete.rigViewsV154.some(row => row.winnerLandingV224?.settled && row.spriteAtlasV188.frameId === 'idle'));
    });
  });
}
