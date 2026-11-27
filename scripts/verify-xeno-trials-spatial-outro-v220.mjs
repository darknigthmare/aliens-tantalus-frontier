import assert from 'node:assert/strict';
import test from 'node:test';
import { getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, nextXenoTrialsRoundV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsCameraV119, getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { getXenoTrialsSpriteAtlasV188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsSpriteAtlasV189, getXenoTrialsSpriteLayoutV189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { advanceXenoTrialsOutroV155, createXenoTrialsExitV157, createXenoTrialsOutroV155,
  createXenoTrialsTerminalV156, getXenoTrialsExitViewV157, skipXenoTrialsIntroV155, skipXenoTrialsOutroV155 } from '../src/xeno-trials-sequences-v155.js';
import { createXenoPresentationV97, advanceXenoPresentationV97, getXenoPresentationViewV97 } from '../src/xeno-trials-presentation-v97.js';
import { drawXenoTrialsArrivalV221, drawXenoTrialsSpatialOutroV220, getXenoTrialsArrivalViewV221 } from '../src/xeno-trials-spatial-outro-v220.js';

function duel(playerId, opponentId, play = true) {
  const match = createXenoTrialsMatchV96({ playerId, opponentId, stageId: 'containment-deck', difficulty: 'easy', seed: 96001,
    introSeconds: 0, roundsToWin: 2, holdRoundTransition: true, rulesV119: { initialHp: 1 } });
  for (let i = 0; i < 1600 && !match.result; i++) {
    if (match.phase === 'round-over') {
      assert.equal(createXenoTrialsExitV157(match, null, { translateX: 0, zoom: 1 }), null);
      assert.ok(nextXenoTrialsRoundV96(match));
    }
    const [player, opponent] = match.fighters;
    const close = getXenoTrialsBodyGapV105(player, opponent) <= 55;
    stepXenoTrialsMatchV96(match, 1 / 120, play ? { right: !close && player.x <= opponent.x,
      left: !close && player.x > opponent.x, light: close } : {});
  }
  assert.equal(match.result?.winner, play ? 'player' : 'opponent');
  return match;
}

function finish(clock, frameMs = 100) {
  while (clock.phase === 'playing') clock = advanceXenoTrialsOutroV155(clock, frameMs);
  return clock;
}

function texture(width, height) { return { complete: true, naturalWidth: width, naturalHeight: height }; }

function textures(match) {
  const images = new Map();
  for (const fighter of match.fighters) {
    const art = getXenoTrialsArtV96(fighter.id, fighter.variant);
    images.set(art.path, texture(art.sourceWidth, art.sourceHeight));
    for (const atlas of [getXenoTrialsSpriteAtlasV188(fighter, art), getXenoTrialsSpriteAtlasV189(fighter, art)]) {
      if (atlas) images.set(atlas.texture.path, texture(atlas.texture.width, atlas.texture.height));
    }
  }
  return images;
}

function prepare(match) {
  const images = textures(match);
  const winner = match.fighters.find(f => f.side === match.result.winner);
  const outro = finish(createXenoTrialsOutroV155(match, false, images));
  const terminal = createXenoTrialsTerminalV156(match, 'outro', false, outro, images);
  const camera = createXenoTrialsCameraV119(match.fighters).getState();
  return { winner, terminal, images, camera };
}

for (const [id, rival, play] of [['warrior', 'runner', true], ['runner', 'warrior', true],
  ['spitter', 'warrior', true], ['runner', 'warrior', false]]) {
  test(`V220 sends only the living ${play ? id : rival} ${play ? 'player' : 'CPU'} out after a native terminal win`, () => {
    const match = duel(id, rival, play), snapshot = structuredClone(match);
    const { winner, terminal, images, camera } = prepare(match);
    assert.equal(createXenoTrialsExitV157(match, terminal, camera, false, null, images), null);
    const completed = finish(terminal);
    let exit = createXenoTrialsExitV157(match, completed, camera, false, null, images);
    assert.equal(exit.participants.length, 1);
    const participant = exit.participants[0];
    assert.equal(participant.side, winner.side);
    assert.equal(participant.direction, play ? -1 : 1);
    assert.ok(participant.atlasPathV220.endsWith(`${winner.id}-motion-sheet.png`));
    const sprite = getXenoTrialsSpriteAtlasV189(winner, getXenoTrialsArtV96(winner.id, winner.variant));
    const metrics = getXenoTrialsRenderMetricsV110(winner.id, winner.variant);
    const ctx = { save() {}, restore() {}, translate() {}, scale() {}, globalAlpha: 1,
      drawImage(image) { assert.ok(image.complete); } };
    const frames = new Set();
    let previous = winner.x;
    while (exit.phase === 'playing') {
      const view = getXenoTrialsExitViewV157(match, winner, exit);
      assert.ok((view.x - previous) * view.direction >= 0);
      const drawn = drawXenoTrialsSpatialOutroV220(ctx, match, winner, images, view, metrics);
      assert.equal(drawn.exitV157.stepped, view.turn === 1);
      assert.ok(drawn.supports.some(([, y]) => Math.abs(y - 450) < 5));
      if (drawn.spriteAtlasV189) frames.add(drawn.spriteAtlasV189.frameId);
      previous = view.x;
      exit = advanceXenoTrialsOutroV155(exit, 20);
    }
    const finished = getXenoTrialsExitViewV157(match, winner, exit);
    assert.deepEqual([...frames].sort(), sprite.frames.slice(0, 8).map(frame => frame.id));
    assert.equal(finished.visible, false);
    assert.equal(finished.complete, true);
    for (const frame of sprite.frames.slice(0, 8)) {
      const { bounds } = getXenoTrialsSpriteLayoutV189(sprite, frame, metrics, { x: finished.x, y: 450, facing: finished.direction });
      assert.ok(finished.direction === -1 ? bounds.right * camera.zoom + camera.translateX <= -12 + 1e-8
        : bounds.left * camera.zoom + camera.translateX >= 1012 - 1e-8);
    }
    assert.deepEqual(match, snapshot);
  });
}

test('V220 honors the loaded atlas, signed render participants, pause, skip, and motion preference', () => {
  const match = duel('warrior', 'runner'), snapshot = structuredClone(match);
  const { winner, terminal, images, camera } = prepare(match);
  const completed = finish(terminal, 1000 / 120);
  assert.equal(completed.elapsedMs, completed.durationMs);
  const create = (receipt = completed, motion = false) => createXenoTrialsExitV157(match, receipt, camera, motion, null, images);
  const exit = create();
  assert.equal(create(completed, true), null);
  assert.equal(create(skipXenoTrialsOutroV155(terminal)), null);
  assert.equal(create({ ...completed, terminalTick: completed.terminalTick - 1 }), null);
  assert.equal(create({ ...completed, participants: completed.participants.map(p => ({ ...p, previousKind: 'outro-loss' })) }), null);
  assert.equal(getXenoTrialsExitViewV157(match, match.fighters[1], exit), null);
  const paused = { ...exit, paused: true };
  assert.equal(advanceXenoTrialsOutroV155(paused, 100), paused);
  assert.equal(getXenoTrialsExitViewV157(match, winner, skipXenoTrialsOutroV155(exit)).visible, false);
  assert.equal(getXenoTrialsExitViewV157(match, winner, exit, true).visible, false);
  const [participant] = exit.participants;
  assert.equal(getXenoTrialsExitViewV157(match, winner, { ...exit, participants: [{ ...participant, startX: winner.x + 1 }] }), null);
  images.set(participant.atlasPathV220, texture(1, 1));
  assert.equal(create(), null);
  assert.deepEqual(match, snapshot);
});

for (const [playerId, opponentId] of [['warrior', 'runner'], ['spitter', 'warrior']]) {
  test(`V221 stages both ${playerId}/${opponentId} entrances without advancing the duel`, () => {
    const match = createXenoTrialsMatchV96({ playerId, opponentId, introSeconds: 0 });
    const baseline = structuredClone(match), images = textures(match);
    const [player, opponent] = match.fighters;
    let presentation = createXenoPresentationV97();
    const view = (fighter, reduced = false) => getXenoTrialsArrivalViewV221(match, fighter,
      getXenoPresentationViewV97(presentation), images, reduced);
    const context = { save() {}, restore() {}, translate() {}, scale() {}, drawImage() {} };
    const activeFrames = new Set();
    const waiting = view(opponent);
    assert.ok(waiting.waiting && waiting.x > opponent.x);
    assert.ok(view(player).x < player.x);
    assert.equal(view(player, true), null);
    let previous = view(player).x;
    while (presentation.phase === 'intro-player') {
      const arrival = view(player);
      assert.ok(arrival.x >= previous && arrival.x <= player.x);
      assert.deepEqual(view(opponent), waiting);
      const drawn = drawXenoTrialsArrivalV221(context, player, getXenoTrialsArtV96(player.id), images, arrival,
        getXenoTrialsRenderMetricsV110(player.id));
      assert.ok(drawn.supports.some(([, y]) => Math.abs(y - 450) < 5));
      if (drawn.spriteAtlasV189) activeFrames.add(drawn.spriteAtlasV189.frameId);
      previous = arrival.x;
      const paused = advanceXenoPresentationV97(presentation, 100, true);
      assert.equal(paused, presentation);
      presentation = advanceXenoPresentationV97(presentation, 20);
    }
    assert.ok(activeFrames.size >= 3);
    assert.equal(previous, player.x);
    assert.equal(view(opponent).x, waiting.x);
    assert.equal(view(opponent).waiting, false);
    assert.equal(view(player), null);
    while (presentation.elapsedMs < 400) presentation = advanceXenoPresentationV97(presentation, 100);
    assert.ok(view(opponent).x < waiting.x && view(opponent).x > opponent.x);
    presentation = skipXenoTrialsIntroV155(presentation);
    assert.equal(presentation.phase, 'countdown');
    assert.equal(view(opponent), null);
    assert.deepEqual(match, baseline);
  });
}

test('V221 leaves the previous render available when the admitted walking texture is missing', () => {
  const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner', introSeconds: 0 });
  const images = textures(match);
  const phase = getXenoPresentationViewV97(createXenoPresentationV97());
  const player = match.fighters[0];
  const arrival = getXenoTrialsArrivalViewV221(match, player, phase, images);
  images.delete(arrival.atlasPath);
  assert.equal(getXenoTrialsArrivalViewV221(match, player, phase, images), null);
});
