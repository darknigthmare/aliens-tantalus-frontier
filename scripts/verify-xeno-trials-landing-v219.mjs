import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, nextXenoTrialsRoundV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsPilotOutroV197 } from '../src/xeno-trials-pilot-sequences-v197.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import {
  advanceXenoTrialsOutroV155, createXenoTrialsLandingV157, getXenoTrialsLandingViewV157, skipXenoTrialsOutroV155
} from '../src/xeno-trials-sequences-v155.js';
import { getXenoTrialsSpriteAtlasV188, sampleXenoTrialsSpriteAtlasV188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { drawXenoTrialsSpriteAtlasV189, getXenoTrialsSpriteAtlasV189, sampleXenoTrialsSpriteAtlasV189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { drawXenoTrialsSpriteAtlasV191, getXenoTrialsRuntimeSpriteAtlas } from '../src/xeno-trials-sprite-atlas-v191.js';

function finishMatch(id, { grounded = false, mutual = false } = {}) {
  const match = createXenoTrialsMatchV96({ playerId: id, opponentId: id, matchId: `landing-v219-${id}`, seed: 219,
    introSeconds: 0, roundsToWin: 2, holdRoundTransition: true, rulesV119: { initialHp: 1 } });
  for (let i = 0; i < 3500 && match.phase !== 'match-over'; i++) {
    if (match.phase === 'round-over') {
      assert.ok(nextXenoTrialsRoundV96(match));
      stepXenoTrialsMatchV96(match, .05, {}, {});
      continue;
    }
    const [player, opponent] = match.fighters;
    const near = getXenoTrialsBodyGapV105(player, opponent) <= 28;
    const strike = near && i % 4 === 0;
    const jump = strike && [player, opponent].every(actor => actor.y === 0 && !actor.attack);
    const right = player.x <= opponent.x;
    const response = mutual ? { left: right, right: !right, light: strike, jump } : { jump };
    stepXenoTrialsMatchV96(match, .05, { left: !right, right, light: strike, jump }, response);
  }
  assert.equal(match.phase, 'match-over', id);
  const opponent = match.fighters[1];
  const draw = mutual || id === 'burster';
  assert.equal(match.result.winner, draw ? 'draw' : 'player', id);
  assert.equal(match.result.reason, draw ? 'double-ko' : 'ko', id);
  assert.equal(opponent.hp, 0, id);
  assert.equal(opponent.y > 0, !grounded, id);
  return match;
}

for (const id of ['warrior', 'runner', 'spitter', 'queen', 'ravager', 'burster']) {
  test(`${id} lands a genuine terminal aerial KO on its admitted ground drawing`, () => {
    const match = finishMatch(id), before = structuredClone(match), [winner, loser] = match.fighters;
    const art = getXenoTrialsArtV96(id, loser.variant);
    const base = getXenoTrialsSpriteAtlasV188(loser, art);
    const atlas = base || getXenoTrialsSpriteAtlasV189(loser, art);
    const sample = base ? sampleXenoTrialsSpriteAtlasV188 : sampleXenoTrialsSpriteAtlasV189;
    const images = new Map([[atlas.texture.path, { complete: true, naturalWidth: atlas.texture.width, naturalHeight: atlas.texture.height }]]);
    let landing = createXenoTrialsLandingV157(match, false, images);
    assert.equal(landing?.participants.length, id === 'burster' ? 2 : 1);
    const participant = landing.participants.find(entry => entry.side === 'opponent');
    assert.equal(participant.atlasPathV219, atlas.texture.path);
    if (winner.hp > 0) assert.equal(getXenoTrialsLandingViewV157(match, winner, landing), null);
    assert.equal(createXenoTrialsLandingV157(match, false, new Map()), null);
    let lastHeight = loser.y;
    const visualBody = { ...loser, y: 0 };
    while (landing.phase === 'playing') {
      const view = getXenoTrialsLandingViewV157(match, loser, landing);
      assert.ok(view.renderY > 0 && view.renderY <= lastHeight);
      assert.equal(sample(atlas, visualBody, { cue: { state: 'ko', progress: 0 } }).frame.id, 'ko-fall');
      lastHeight = view.renderY;
      landing = advanceXenoTrialsOutroV155(landing, 50);
    }
    const settled = getXenoTrialsLandingViewV157(match, loser, landing);
    assert.equal(settled.settled, true);
    assert.equal(settled.ground, 450);
    assert.equal(sample(atlas, visualBody, { cue: { state: 'ko', progress: 1 } }).frame.id, 'ko-ground');
    const corrupted = structuredClone(landing);
    corrupted.participants.find(entry => entry.side === 'opponent').startX += 1;
    assert.equal(getXenoTrialsLandingViewV157(match, loser, corrupted), null);
    assert.equal(getXenoTrialsLandingViewV157(match, loser, createXenoTrialsLandingV157(match, true)).renderY, 0);
    const skipped = skipXenoTrialsOutroV155(createXenoTrialsLandingV157(match));
    assert.equal(getXenoTrialsLandingViewV157(match, loser, skipped).renderY, 0);
    assert.deepEqual(match, before);
  });
}

test('an airborne KO without admitted landing drawings does not acquire another profile’s frames', () => {
  assert.equal(createXenoTrialsLandingV157(finishMatch('synth-sniper')), null);
});

const wardenId = 'import-game-afe2-warden';
const profilesV220 = [
  ['crusher-acm', { grounded: true }], ['defender', { grounded: true }], ['chrysalis', {}], ['smasher', {}],
  ['user-brute', {}], ['synth-trooper', {}], ['synth-guard', {}], [wardenId, { mutual: true }]
];

for (const [id, rules] of profilesV220) {
  test(`${id} draws its verified fall and settled pose after a real ${rules.grounded ? 'grounded' : 'aerial'} verdict`, () => {
    const match = finishMatch(id, rules), before = structuredClone(match), loser = match.fighters[1];
    const art = getXenoTrialsArtV96(id, loser.variant);
    const base = getXenoTrialsSpriteAtlasV189(loser, art);
    const atlas = base || getXenoTrialsRuntimeSpriteAtlas(loser, art);
    const { path, sha256, width, height } = atlas.texture;
    const png = readFileSync(new URL(`..${path}`, import.meta.url));
    assert.equal(createHash('sha256').update(png).digest('hex'), sha256);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    const image = { complete: true, naturalWidth: png.readUInt32BE(16), naturalHeight: png.readUInt32BE(20) };
    const images = new Map([[path, image]]);
    assert.equal(image.naturalWidth, width);
    assert.equal(image.naturalHeight, height);
    assert.equal(createXenoTrialsLandingV157(match, false, new Map()), null);
    assert.equal(createXenoTrialsLandingV157(match, false, new Map([[path, { ...image, naturalHeight: height - 1 }]])), null);
    let landing = createXenoTrialsLandingV157(match, false, images);
    assert.equal(landing.participants.length, rules.mutual ? 2 : 1);
    const initial = getXenoTrialsLandingViewV157(match, loser, landing);
    assert.equal(initial.atlasPathV219, path);
    assert.equal(initial.renderY, loser.y);
    assert.equal(initial.settled, false);

    // PNG dimensions and digest are actual; Canvas calls are recorded by a test double.
    const draws = [];
    const context = { save() {}, restore() {}, translate() {}, scale() {}, drawImage(...args) { draws.push(args); } };
    const drawFrame = base ? drawXenoTrialsSpriteAtlasV189 : drawXenoTrialsSpriteAtlasV191;
    const visual = { ...loser, y: 0 };
    const sample = (view, key) => {
      const options = { includeV197: true, cue: { state: 'ko', progress: view.settled ? 1 : 0 },
        metrics: getXenoTrialsRenderMetricsV110(id, loser.variant), x: loser.x, y: view.ground, facing: loser.facing };
      const drawn = drawFrame(context, visual, art, images, options);
      const receipt = Object.entries(drawn).find(([property]) => property.startsWith('spriteAtlasV'))?.[1];
      assert.equal(receipt.frameId, key);
      assert.equal(receipt.sha256, sha256);
      assert.equal(draws.at(-1)[0], image);
      assert.deepEqual(draws.at(-1).slice(1, 5), atlas.frames.find(frame => frame.id === key).rect);
    };
    sample(initial, 'ko-fall');
    while (landing.phase === 'playing') landing = advanceXenoTrialsOutroV155(landing, 50);
    const settled = getXenoTrialsLandingViewV157(match, loser, landing);
    assert.equal(settled.settled, true);
    assert.equal(settled.ground, 450);
    sample(settled, 'ko-ground');
    for (const state of [createXenoTrialsLandingV157(match, true, images), skipXenoTrialsOutroV155(landing)])
      assert.equal(getXenoTrialsLandingViewV157(match, loser, state).ground, 450);
    assert.deepEqual(match, before);
  });
}

test('the Warden keeps its signed V197 pilot fall after a decisive aerial KO', () => {
  const match = finishMatch(wardenId);
  const pilot = createXenoTrialsPilotOutroV197(match);
  assert.equal(pilot.participants.find(entry => entry.side === 'opponent').kind, 'outro-ko');
  assert.equal(createXenoTrialsLandingV157(match), null);
});

test('the live runtime paints the new Synth Trooper landing and holds a single native result on pause and skip', async () => {
  const listeners = { addEventListener() {}, removeEventListener() {} };
  const window = { ...listeners, matchMedia: () => ({ matches: false }) };
  const document = { ...listeners, hidden: false, hasFocus: () => true };
  const calls = [], queue = new Map(), results = [];
  const context = new Proxy({ globalAlpha: 1, measureText: () => ({ width: 42 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    drawImage(image, ...args) { calls.push({ path: image.path, crop: args.slice(0, 4) }); }
  }, { get: (target, key) => target[key] ?? (() => {}) });
  const canvas = { ...listeners, width: 1000, height: 560, getContext: () => context,
    setAttribute() {}, focus() { document.activeElement = this; } };
  let serial = 0, time = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window, document,
    config: { playerId: 'synth-trooper', opponentId: 'runner', seed: 20, difficulty: 'hard', roundsToWin: 1,
      rulesV119: { initialHp: 1 } },
    loadImage: async path => {
      const png = readFileSync(new URL(`..${path}`, import.meta.url));
      return png.subarray(1, 4).toString() === 'PNG'
        ? { path, complete: true, naturalWidth: png.readUInt32BE(16), naturalHeight: png.readUInt32BE(20) }
        : { path, complete: true, naturalWidth: 1024, naturalHeight: 1024 };
    },
    requestAnimationFrame(callback) { queue.set(++serial, callback); return serial; },
    cancelAnimationFrame(id) { queue.delete(id); },
    onResult(result) { results.push(structuredClone(result)); }
  });
  const frame = () => {
    time += 1000 / 120;
    const callbacks = [...queue.values()]; queue.clear(); calls.length = 0;
    for (const callback of callbacks) callback(time);
  };
  try {
    assert.equal(await runtime.start(), true);
    runtime.skipSequence(); runtime.skipSequence();
    for (let i = 0; i < 3600 && runtime.getState().phase !== 'match-over'; i++) {
      runtime.setInput('jump', runtime.getState().fighters[0].y === 0);
      frame();
    }
    const verdict = runtime.getState(), loser = verdict.fighters[0];
    assert.equal(verdict.phase, 'match-over');
    assert.equal(verdict.result.winner, 'opponent');
    assert.ok(loser.hp === 0 && loser.y > 0);
    const atlas = getXenoTrialsRuntimeSpriteAtlas(loser, getXenoTrialsArtV96(loser.id, loser.variant));
    const drawn = state => state.rigViewsV154.find(view => view.side === 'player');
    const fall = drawn(verdict);
    assert.ok(fall.landingV219 && fall.landingV219.renderY === loser.y);
    assert.equal(fall.spriteAtlasV197.frameId, 'ko-fall');
    assert.ok(calls.some(({ path, crop }) => path === atlas.texture.path
      && crop.every((coordinate, i) => coordinate === atlas.frames.find(f => f.id === 'ko-fall').rect[i])));
    assert.ok(runtime.pause());
    const paused = runtime.getState();
    for (let i = 0; i < 8; i++) frame();
    assert.deepEqual(runtime.getState().landingV157, paused.landingV157);
    assert.ok(runtime.resume());
    assert.ok(runtime.skipSequence());
    const final = runtime.getState(), settled = drawn(final);
    assert.equal(settled.landingV219.ground, 450);
    assert.equal(settled.spriteAtlasV197.frameId, 'ko-ground');
    assert.deepEqual(final.fighters, verdict.fighters);
    assert.deepEqual(results, [verdict.result]);
  } finally { runtime.stop(); }
});
