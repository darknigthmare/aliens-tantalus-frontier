import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96, XENO_TRIALS_FIGHTERS_V96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as step } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-combat-contract-v186.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { XENO_TRIALS_PRIORITY_ATLASES_V201 as atlases, getXenoTrialsRuntimeActionAtlases,
  getXenoTrialsRuntimeActionAtlas, getXenoTrialsActionAtlasV199 } from '../src/xeno-trials-action-atlas-v199.js';
import { drawXenoTrialsRuntimeActionAtlas, requestXenoTrialsRuntimeActionAtlas } from '../src/xeno-trials-sprite-atlas-v191.js';
import { getXenoTrialsRuntimeAnimationCoverage } from '../src/xeno-trials-animation-coverage-v199.js';
import { verifyXenoPriorityAdmissionsV201 } from './public-xeno-priority-admissions-v201.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

test('variant assets, source digests and public paths are verified for all four priority sheets', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const receipt = await verifyXenoPriorityAdmissionsV201(root);
  assert.deepEqual([receipt.images, receipt.poses], [4, 24]);
  assert.equal(isPublicDistributionPathV86('assets/openai/sprites/xeno-trials-v201/unreviewed.png', { built: true }), false);
  for (const atlas of atlases) {
    const definition = getXenoTrialsFighterV96(atlas.fighterId), art = getXenoTrialsArtV96(atlas.fighterId);
    assert.ok(getXenoTrialsRuntimeActionAtlases(definition, art).includes(atlas));
    assert.equal(getXenoTrialsRuntimeActionAtlases(definition, { ...art, path: '/foreign.png' }).length, 0);
    assert.equal(getXenoTrialsRuntimeActionAtlases(definition, { ...art, sha256: '0'.repeat(64) }).length, 0);
    assert.equal(isPublicDistributionPathV86(atlas.texture.path.slice(1), { built: true }), true);
  }
});

test('Warden preloads his two eligible sheets once and the historical selector preserves its prior result', async () => {
  const id = 'import-game-afe2-warden', definition = getXenoTrialsFighterV96(id), art = getXenoTrialsArtV96(id);
  const bound = getXenoTrialsRuntimeActionAtlases(definition, art);
  assert.deepEqual(bound.map(atlas => atlas.kind), ['super', 'air-combat']);
  assert.equal(getXenoTrialsRuntimeActionAtlas(definition, art), bound[0]);
  assert.equal(getXenoTrialsActionAtlasV199(definition, art), null);
  const images = new Map(), loaded = [];
  const loadImage = async path => {
    const { width, height } = bound.find(atlas => atlas.texture.path === path).texture;
    loaded.push(path);
    return { naturalWidth: width, naturalHeight: height };
  };
  const results = await Promise.all([requestXenoTrialsRuntimeActionAtlas(images, definition, art, loadImage),
    requestXenoTrialsRuntimeActionAtlas(images, definition, art, loadImage)]);
  assert.deepEqual(results, [true, true]);
  assert.deepEqual(loaded, bound.map(atlas => atlas.texture.path));
});

for (const atlas of atlases) {
  const inAir = atlas.kind === 'air-combat';
  for (const action of inAir ? ['light', 'heavy'] : ['special']) test(`${atlas.fighterId} draws the native ${action} windows`, () => {
    const id = atlas.fighterId;
    const match = createXenoTrialsMatchV96({ playerId: id, opponentId: 'runner', introSeconds: 0 });
    const fighter = match.fighters[0], art = getXenoTrialsArtV96(id), definition = getXenoTrialsFighterV96(id);
    const spec = getXenoTrialsAttackV147(definition, action, XENO_TRIALS_ATTACKS_V96[action]);
    const metrics = getXenoTrialsRenderMetricsV110(id), expected = atlas.frames.filter(frame => !inAir || frame.id.startsWith(`air-${action}-`));
    const image = { naturalWidth: atlas.texture.width, naturalHeight: atlas.texture.height, complete: true };
    const images = new Map([[atlas.texture.path, image]]), seen = new Set();
    let drawnRect;
    const canvas = { save() {}, restore() {}, translate() {}, scale() {}, drawImage(...args) { drawnRect = args.slice(0, 5); } };
    // Native inputs on a deterministic match against an idle second actor. Only
    // the Canvas and its decoded texture are doubled here.
    for (let frame = 0; frame < 240; frame++) {
      stepXenoTrialsMatchV96(match, step, { jump: inAir && frame === 0, [action]: frame === (inAir ? 10 : 0) }, {});
      const before = JSON.stringify(match);
      const options = { spec, metrics, tick: match.tick };
      const draw = drawXenoTrialsRuntimeActionAtlas(canvas, fighter, art, images, options);
      assert.equal(JSON.stringify(match), before);
      if (!draw) continue;
      const receipt = draw.spriteAtlasV201;
      assert.equal(receipt.kind, atlas.kind);
      assert.equal(receipt.attackId, fighter.attack.id);
      assert.equal(receipt.renderTick, match.tick);
      assert.equal(receipt.grounded, !inAir);
      assert.deepEqual(drawnRect, [image, ...receipt.sourceRect]);
      assert.ok(draw.bounds.bottom <= 450 + 1e-8);
      if (!inAir) {
        assert.equal(drawXenoTrialsRuntimeActionAtlas(canvas, fighter, art, images, { ...options, spec: { ...spec } }), null);
        const reduced = drawXenoTrialsRuntimeActionAtlas(canvas, fighter, art, images, { ...options, reducedMotion: true });
        assert.match(reduced.spriteAtlasV201.frameId, /-0$/);
      }
      seen.add(receipt.frameId);
    }
    assert.deepEqual([...seen], expected.map(frame => frame.id));
    if (!inAir) assert.equal(fighter.stats.specials, 1);
  });
}

test('player coverage advertises V201 gestures by action and retains the Warden super', () => {
  const all = XENO_TRIALS_FIGHTERS_V96.map(fighter => getXenoTrialsRuntimeAnimationCoverage(fighter));
  assert.equal(all.filter(entry => entry.hasDrawnGestures).length, 30);
  assert.equal(all.filter(entry => entry.states.presentation.sources.some(source => source.revision === 201)).length, 20);
  assert.ok(all.every(entry => !entry.fullAnimation && !entry.canonExact));
  const warden = getXenoTrialsRuntimeAnimationCoverage('import-game-afe2-warden');
  assert.ok(warden.states.super.sources.some(source => source.revision === 200));
  assert.ok(warden.states.light.sources.some(source => source.revision === 201));
  for (const id of ['mantis', 'synth-sniper']) {
    const state = getXenoTrialsRuntimeAnimationCoverage(id).states.special;
    assert.equal(state.renderKind, 'drawn');
    assert.ok(state.limitations.includes('grounded-only'));
  }
});
