import assert from 'node:assert/strict';
import test from 'node:test';
import { getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, nextXenoTrialsRoundV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import {
  advanceXenoTrialsOutroV155, createXenoTrialsLandingV157, getXenoTrialsLandingViewV157, skipXenoTrialsOutroV155
} from '../src/xeno-trials-sequences-v155.js';
import { getXenoTrialsSpriteAtlasV188, sampleXenoTrialsSpriteAtlasV188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsSpriteAtlasV189, sampleXenoTrialsSpriteAtlasV189 } from '../src/xeno-trials-sprite-atlas-v189.js';

function finishInAir(id) {
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
    stepXenoTrialsMatchV96(match, .05, { left: player.x > opponent.x, right: player.x <= opponent.x, light: strike, jump }, { jump });
  }
  assert.equal(match.phase, 'match-over', id);
  const opponent = match.fighters[1];
  assert.equal(match.result.winner, id === 'burster' ? 'draw' : 'player', id);
  assert.equal(match.result.reason, id === 'burster' ? 'double-ko' : 'ko', id);
  assert.equal(opponent.hp, 0, id);
  assert.ok(opponent.y > 0, id);
  return match;
}

for (const id of ['warrior', 'runner', 'spitter', 'queen', 'ravager', 'burster']) {
  test(`${id} lands a genuine terminal aerial KO on its admitted ground drawing`, () => {
    const match = finishInAir(id), before = structuredClone(match), [winner, loser] = match.fighters;
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
  assert.equal(createXenoTrialsLandingV157(finishInAir('synth-trooper')), null);
});
