import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, nextXenoTrialsRoundV96, stepXenoTrialsMatchV96,
  XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsEventWaveV179 } from '../src/xeno-trials-events-v179.js';
import { createXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { getXenoTrialsBodyGapV105, XENO_TRIALS_ARENA_V105 } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { createXenoTrialsCameraV119, getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { advanceXenoTrialsOutroV155, createXenoTrialsSurvivalExitV225, getXenoTrialsExitViewV157,
  skipXenoTrialsOutroV155 } from '../src/xeno-trials-sequences-v155.js';
import { drawXenoTrialsSpatialOutroV220 } from '../src/xeno-trials-spatial-outro-v220.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsSpriteLayoutV189, XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';

const eventId = 'xte179-extraction-1';
const routes = [
  { playerId: 'warrior', bout: 0, play: 'jump-in-place', heights: [true, false] },
  { playerId: 'runner', bout: 0, play: 'jump-at-range', heights: [false, true] },
  { playerId: 'spitter', bout: 0, play: 'jump-in-place', heights: [true, false] },
  { playerId: 'prowler', bout: 1, play: 'guard-and-cross', heights: [false, false] },
];
const { floor } = XENO_TRIALS_ARENA_V105;
const atlases = [...XENO_TRIALS_SPRITE_ATLASES_V188, ...XENO_TRIALS_SPRITE_ATLASES_V189];
const texture = (naturalWidth, naturalHeight) => ({ complete: true, naturalWidth, naturalHeight });
const textures = () => new Map(atlases.map(({ texture: record }) => [record.path, texture(record.width, record.height)]));
const verified = new Set();

function config(route, overrides = {}) {
  const wave = getXenoTrialsEventWaveV179(eventId, route.bout);
  return { playerId: route.playerId, opponentId: wave.opponentId, stageId: wave.stageId, difficulty: wave.difficulty,
    seed: 96001 + route.bout, matchId: `v225-extraction-${route.playerId}-${route.bout}`, introSeconds: 0, roundsToWin: 2,
    holdRoundTransition: true, rulesV119: wave.rules, activityV119: { branch: 'challenges', id: eventId }, ...overrides };
}

function pilot(match, route) {
  const [player, opponent] = match.fighters;
  const releaseJump = !player.previousInput.jump;
  if (route.play === 'jump-in-place') return { jump: player.y === 0 && releaseJump, guard: player.y === 0 && !releaseJump };
  const near = getXenoTrialsBodyGapV105(player, opponent) < 105;
  const left = player.x < opponent.x;
  const patrolEdge = left ? player.x - 115 < 50 : 885 - player.x < 50;
  const travel = left !== patrolEdge ? 'left' : 'right';
  if (route.play === 'guard-and-cross') {
    const elapsed = match.config.roundSeconds - match.timeRemaining;
    return { guard: near && elapsed % 3 < 2, [travel]: true, jump: (!near || player.stamina < 30) && releaseJump };
  }
  return { [travel]: true, jump: near && releaseJump };
}

function duel(route) {
  const match = createXenoTrialsMatchV96(config(route));
  const firstRound = [];
  for (let i = 0; i < 7500 && !match.result; i++) {
    if (match.phase === 'round-over') {
      firstRound.push({ stage: match.config.stageId, winner: match.roundWinner, reason: match.roundReason,
        sequence: createXenoTrialsSurvivalExitV225(match, { zoom: 1, translateX: 0 }, false, textures()) });
      assert.equal(nextXenoTrialsRoundV96(match), true);
      stepXenoTrialsMatchV96(match, dt, {});
    } else stepXenoTrialsMatchV96(match, dt, pilot(match, route));
  }
  assert.deepEqual(firstRound, [{ stage: match.config.stageId, winner: 'player', reason: 'time', sequence: null }]);
  assert.equal(match.result?.winner, 'player');
  assert.equal(match.result.reason, 'time');
  assert.deepEqual(match.result.wins, { player: 2, opponent: 0 });
  assert.equal(match.fighters[0].stats.hits, 0);
  assert.deepEqual(match.fighters.map(fighter => fighter.y > 0), route.heights);
  assert.ok(match.fighters.every(fighter => fighter.hp > 0));
  return match;
}

function canvas() {
  return new Proxy({ globalAlpha: 1 }, { get(object, key) {
    if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
    return object[key] ?? (() => {});
  } });
}

function atlasOf(path) {
  const atlas = atlases.find(entry => entry.texture.path === path);
  assert.ok(atlas);
  if (!verified.has(path)) {
    const source = readFileSync(new URL(`..${path}`, import.meta.url));
    assert.equal(createHash('sha256').update(source).digest('hex'), atlas.texture.sha256);
    assert.equal(source.readUInt32BE(16), atlas.texture.width);
    assert.equal(source.readUInt32BE(20), atlas.texture.height);
    verified.add(path);
  }
  return atlas;
}

for (const route of routes) {
  test(`native Extraction survival for ${route.playerId} ends with the two live specimens exiting their own sides`, () => {
    const match = duel(route), before = structuredClone(match), images = textures();
    const camera = createXenoTrialsCameraV119(match.fighters).getState();
    const initial = createXenoTrialsSurvivalExitV225(match, camera, false, images);
    assert.ok(initial);
    assert.deepEqual(initial.participants.map(entry => entry.survivalV225.role), ['survivor', 'opponent']);
    assert.equal(createXenoTrialsFinisherV207(match, images, false, true), null);
    const context = canvas();
    for (const [index, actor] of match.fighters.entries()) {
      const other = match.fighters[1 - index];
      const metrics = getXenoTrialsRenderMetricsV110(actor.id, actor.variant);
      let sequence = initial;
      const start = getXenoTrialsExitViewV157(match, actor, sequence);
      assert.equal(start.x, actor.x);
      assert.equal(start.settlingV225.renderY, actor.y);
      assert.equal(start.direction, Math.sign(actor.x - other.x));
      const motion = atlasOf(start.atlasPathV220);
      assert.equal(motion.fighterId, actor.id);
      assert.equal(atlasOf(start.idlePathV220).fighterId, actor.id);
      const stepFrames = new Set();
      let previous = start.x, supported = false;
      while (sequence.phase === 'playing') {
        const view = getXenoTrialsExitViewV157(match, actor, sequence);
        assert.ok((view.x - previous) * view.direction >= -1e-8);
        if (view.visible) {
          const rendered = drawXenoTrialsSpatialOutroV220(context, match, actor, images, view, metrics);
          if (!view.settlingV225?.settled && view.settlingV225) {
            assert.ok(rendered.spriteAtlasV189.frameId.startsWith('air-'));
            assert.ok(rendered.bounds.bottom < floor);
          } else {
            assert.ok(rendered.supports.some(([, y]) => Math.abs(y - floor) < 5));
            supported ||= view.settlingV225?.settled === true;
            if (rendered.exitV157.stepped) stepFrames.add(rendered.spriteAtlasV189.frameId);
          }
        }
        previous = view.x;
        sequence = advanceXenoTrialsOutroV155(sequence, 16);
      }
      assert.equal(supported, true);
      assert.equal(stepFrames.size, 8);
      const end = getXenoTrialsExitViewV157(match, actor, sequence);
      assert.equal(end.visible, false);
      for (const frame of motion.frames.slice(0, 8)) {
        const { bounds } = getXenoTrialsSpriteLayoutV189(motion, frame, metrics, { x: end.x, y: floor, facing: end.direction });
        assert.ok(end.direction < 0 ? bounds.right * camera.zoom + camera.translateX <= -12 + 1e-8
          : bounds.left * camera.zoom + camera.translateX >= 1012 - 1e-8);
      }
    }
    assert.deepEqual(match, before);
  });
}

test('survival choreography is atomic and rejects foreign outcomes, missing textures and forged partners', () => {
  const match = duel(routes[0]), images = textures();
  const camera = createXenoTrialsCameraV119(match.fighters).getState();
  const create = (result = match, reduced = false) => createXenoTrialsSurvivalExitV225(result, camera, reduced, images);
  const sequence = create();
  for (const changed of [{ reason: 'ko' }, { winner: 'draw' }, { stageId: 'containment-deck' }, { durationTicks: match.tick - 1 },
    { rulesV119: { ...match.result.rulesV119, goal: 'duel' } }]) {
    assert.equal(create({ ...match, result: { ...match.result, ...changed } }), null);
  }
  assert.equal(create({ ...match, timeRemaining: 1 }), null);
  assert.equal(create({ ...match, fighters: [match.fighters[0], { ...match.fighters[1], hp: 0 }] }), null);
  const [player, opponent] = match.fighters, [first, second] = sequence.participants;
  assert.equal(create({ ...match, fighters: [player, { ...opponent, x: player.x - 3 }] }), null);
  const corrupted = { ...sequence, participants: [first, { ...second, direction: first.direction }] };
  assert.equal(getXenoTrialsExitViewV157(match, player, corrupted), null);
  assert.equal(getXenoTrialsExitViewV157(match, opponent, corrupted), null);
  const missing = new Map(images);
  missing.delete(second.idlePathV220);
  assert.equal(createXenoTrialsSurvivalExitV225(match, camera, false, missing), null);
  images.set(second.atlasPathV220, texture(1, 1));
  assert.equal(create(), null);
});

test('pause holds the time, skip and reduced motion keep both live specimens standing at their marks', () => {
  const match = duel(routes[1]), images = textures(), camera = createXenoTrialsCameraV119(match.fighters).getState();
  const initial = createXenoTrialsSurvivalExitV225(match, camera, false, images);
  const paused = { ...initial, paused: true };
  assert.equal(advanceXenoTrialsOutroV155(paused, 100), paused);
  assert.equal(skipXenoTrialsOutroV155(paused), paused);
  const reduced = createXenoTrialsSurvivalExitV225(match, camera, true, images);
  for (const omitted of [skipXenoTrialsOutroV155(initial), reduced]) {
    assert.equal(omitted.phase, 'complete');
    for (const actor of match.fighters) {
      const view = getXenoTrialsExitViewV157(match, actor, omitted);
      assert.ok(view.visible && view.complete && view.settlingV225.settled);
      assert.equal(view.x, actor.x);
      assert.equal(view.ground, floor);
      const draw = drawXenoTrialsSpatialOutroV220(canvas(), match, actor, images, view, getXenoTrialsRenderMetricsV110(actor.id));
      assert.equal(draw.spriteAtlasV188.frameId, 'idle');
    }
  }
});

test('production runtime moves both specimens after the native timeout while the single verdict stays frozen', async () => {
  const route = routes[0], specification = config(route), images = textures(), results = [], queue = new Map();
  for (const id of [specification.playerId, specification.opponentId]) {
    const art = getXenoTrialsArtV96(id);
    images.set(art.path, texture(art.sourceWidth, art.sourceHeight));
  }
  const status = { textContent: '' };
  const eventTarget = { addEventListener() {}, removeEventListener() {} };
  let serial = 0, timestamp = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas: { width: 1000, height: 560, getContext: canvas, focus() {} },
    document: { ...eventTarget, hasFocus: () => true }, window: eventTarget, statusElement: status,
    config: specification, loadImage: async path => images.get(path) || texture(1024, 1024),
    requestAnimationFrame(callback) { queue.set(++serial, callback); return serial; },
    cancelAnimationFrame(id) { queue.delete(id); }, onResult(result) { results.push(result); } });
  const frame = () => {
    timestamp += 50;
    for (const [id, callback] of [...queue]) if (queue.delete(id)) callback(timestamp);
  };
  try {
    assert.equal(await runtime.start(), true);
    for (let i = 0; i < 1600 && runtime.getState().phase !== 'match-over'; i++) {
      const state = runtime.getState();
      const input = state.phase === 'active' && !state.presentation.blocksSimulation ? pilot(state, route) : {};
      for (const action of ['jump', 'guard']) runtime.setInput(action, Boolean(input[action]));
      frame();
    }
    const initial = runtime.getState();
    assert.equal(initial.result?.reason, 'time');
    assert.deepEqual(initial.result.wins, { player: 2, opponent: 0 });
    assert.equal(initial.finisherV207, null);
    assert.equal(initial.outroV155, null);
    assert.equal(initial.exitV157.id, 'native-survival-disengage-v225');
    assert.equal(initial.rigViewsV154.filter(row => row.exitV157?.settlingV225).length, 2);
    assert.equal(status.textContent, 'Temps de survie validé. Désengagement des spécimens.');
    assert.equal(results.length, 1);
    assert.equal(runtime.pause(), true);
    const paused = runtime.getState();
    frame();
    assert.deepEqual(runtime.getState(), paused);
    assert.equal(runtime.resume(), true);
    let stepsDrawn = false;
    for (let i = 0; i < 350 && queue.size; i++) {
      frame();
      stepsDrawn ||= runtime.getState().rigViewsV154.filter(row => row.exitV157?.stepped).length === 2;
    }
    const complete = runtime.getState();
    assert.ok(stepsDrawn);
    assert.equal(complete.exitV157.phase, 'complete');
    assert.equal(complete.exitViewsV157.filter(view => view.visible).length, 0);
    assert.equal(complete.tick, initial.tick);
    assert.deepEqual(complete.fighters, initial.fighters);
    assert.deepEqual(complete.result, initial.result);
    assert.equal(results.length, 1);
    assert.equal(queue.size, 0);
  } finally { runtime.stop(); }
});
