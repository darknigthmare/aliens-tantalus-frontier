import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { autoTranslateV185, loadCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { getXenoTrialsAnimationCoverageV197 as coverage } from '../src/xeno-trials-animation-coverage-v197.js';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, getXenoTrialsArtV96 as art } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { drawXenoTrialsSpriteAtlasV191, getXenoTrialsSpriteAtlasV191, getXenoTrialsSpriteAtlasV197,
  XENO_TRIALS_SPRITE_ATLASES_V197 as atlases } from '../src/xeno-trials-sprite-atlas-v191.js';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { verifyXenoSpriteAdmissionsV197 } from './public-xeno-sprite-admissions-v197.mjs';

test('all six V146 P0 identities have admitted drawn gestures and all 189 stay selectable', async () => {
  const plan = JSON.parse(await readFile(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url)));
  const rows = plan.tables['02_Roster'].rows, priority = new Map(rows.map(row => [row[0], row[9]]));
  const p0 = rows.filter(row => row[9] === 'P0').map(row => row[0]);
  assert.equal(p0.length, 6);
  assert.ok(p0.every(id => coverage(id)?.hasDrawnGestures));
  const admissions = fighters.map(({ id }) => coverage(id));
  assert.equal(admissions.length, 189);
  assert.equal(admissions.filter(entry => entry.hasDrawnGestures).length, 24);
  assert.ok(admissions.every(entry => entry.canonExact === false && entry.fullAnimation === false));
  const authoredRigs = admissions.filter(entry => entry.states.presentation.sources.some(source => source.revision === 197));
  assert.equal(authoredRigs.length, 12);
  for (const entry of authoredRigs) {
    assert.equal(priority.get(entry.id), 'P2');
    for (const action of ['light', 'heavy', 'special']) assert.ok(entry.states[action].sources.some(source =>
      source.revision === 197 && source.renderKind === 'mesh' && source.frameIds.includes('recovery')));
  }
});

test('priority atlases are identity-bound, included in public distribution and limited to the reviewed PNGs', async () => {
  const info = await verifyXenoSpriteAdmissionsV197(fileURLToPath(new URL('../', import.meta.url)));
  assert.equal(info.images, 3);
  assert.equal(info.poses, 30);
  assert.equal(isPublicDistributionPathV86('assets/openai/sprites/xeno-trials-v197/source.png', { built: true }), false);
  for (const atlas of atlases) {
    const fighter = { id: atlas.fighterId, profileId: atlas.profileId };
    const source = art(atlas.fighterId);
    assert.equal(isPublicDistributionPathV86(atlas.texture.path.slice(1), { built: true }), true);
    assert.equal(getXenoTrialsSpriteAtlasV197(fighter, source), atlas);
    assert.equal(getXenoTrialsSpriteAtlasV197(fighter, { ...source, sha256: '0'.repeat(64) }), null);
    assert.equal(getXenoTrialsSpriteAtlasV191(fighter, source), null);
  }
});

test('an accepted native primary attack drives the new combat atlas without writing back to the match', () => {
  for (const atlas of atlases) {
    const match = createXenoTrialsMatchV96({ playerId: atlas.fighterId, opponentId: 'warrior', roundSeconds: 30, introSeconds: 0 });
    stepXenoTrialsMatchV96(match, 1 / 120, { light: true });
    const fighter = match.fighters[0];
    assert.equal(fighter.attack?.kind, 'light');
    const before = JSON.stringify(match), calls = [];
    const ctx = { save() {}, restore() {}, translate() {}, scale() {}, drawImage(...args) { calls.push(args); } };
    const image = { naturalWidth: atlas.texture.width, naturalHeight: atlas.texture.height, complete: true };
    const media = new Map([[atlas.texture.path, image]]);
    const opts = { includeV197: true, spec: XENO_TRIALS_ATTACKS_V96.light, tick: match.tick, metrics: getXenoTrialsRenderMetricsV110(atlas.fighterId) };
    const receipt = drawXenoTrialsSpriteAtlasV191(ctx, fighter, art(atlas.fighterId), media, opts)?.spriteAtlasV197;
    assert.equal(receipt?.frameId, 'attack-windup');
    assert.equal(receipt.attackId, fighter.attack.id);
    assert.equal(receipt.renderTick, match.tick);
    assert.deepEqual(calls[0].slice(0, 5), [image, ...receipt.sourceRect]);
    assert.equal(JSON.stringify(match), before);
    assert.equal(drawXenoTrialsSpriteAtlasV191(ctx, fighter, art(atlas.fighterId), new Map(), opts), null);
  }
});

test('the checkpoint and new round controls have matching French and English labels', async () => {
  await loadCatalogV185();
  const labels = { 'REPRENDRE LE DUEL CONSERVÉ': 'RESUME SAVED DUEL',
    'RECOMMENCER DEPUIS LA PREMIÈRE MANCHE': 'RESTART FROM ROUND ONE' };
  try {
    setLanguageV185('en', { persist: false, document: null });
    for (const [fr, en] of Object.entries(labels)) assert.equal(autoTranslateV185(fr), en);
  } finally {
    setLanguageV185('fr', { persist: false, document: null });
  }
  for (const fr of Object.keys(labels)) assert.equal(autoTranslateV185(fr), fr);
});
