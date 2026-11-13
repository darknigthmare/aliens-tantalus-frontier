import { createBuildAssetFilter } from './build-asset-filter.mjs';
import { PUBLIC_ARBITER_IMAGES_V190 } from './public-xeno-arbiter-admissions-v190.mjs';
import { resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { CAMPAIGN_ART_ASSETS_V190, CAMPAIGN_ART_V190,
  getXenoArbiterCampaignArtV190, resolveCampaignArtV190 } from '../src/campaign-art-v190.js';

test('the one new ARBITER painting matches its actual PNG dimensions, bytes and hash', async () => {
  assert.equal(CAMPAIGN_ART_ASSETS_V190.length, 1);
  const asset = CAMPAIGN_ART_ASSETS_V190[0];
  const bytes = await readFile(new URL('..' + asset.path, import.meta.url));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [asset.width, asset.height]);
  assert.equal(bytes.length, asset.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  assert.equal(asset.canonExact, false);
});

test('six exact arc associations reuse one painting without inventing six scenes', () => {
  const asset = CAMPAIGN_ART_ASSETS_V190[0];
  assert.equal(new Set(asset.campaignIds).size, 6);
  for (const id of asset.campaignIds) assert.equal(getXenoArbiterCampaignArtV190(id), asset);
  for (const id of [null, undefined, 'special-arbiter-03-custody-copy', 'pair-001-frontier']) {
    assert.equal(getXenoArbiterCampaignArtV190(id), null);
  }
  assert.equal(CAMPAIGN_ART_V190.length, 2);
  assert.deepEqual([...new Set(CAMPAIGN_ART_V190.map(entry => entry.campaignId))], ['special-arbiter-03-custody']);
});

test('insertion art is read-only and restricted to exact recovery mission, world and active phase', () => {
  const state = { campaignId: 'special-arbiter-03-custody', worldId: 'world-05-lethe',
    phases: [{ kind: 'briefing' }, { kind: 'approach' }, { kind: 'deployment' }], currentIndex: 1 };
  const before = JSON.stringify(state);
  assert.equal(resolveCampaignArtV190({ state }).phaseKind, 'approach');
  assert.equal(JSON.stringify(state), before);
  assert.equal(resolveCampaignArtV190({ state, phase: { kind: 'deployment' } }), null);
  assert.equal(resolveCampaignArtV190({ state: { ...state, currentIndex: 2 } }).phaseKind, 'deployment');
  for (const other of [{ ...state, currentIndex: 0 }, { ...state, currentIndex: -1 },
    { ...state, currentIndex: 3 }, { ...state, worldId: 'world-01-acheron-lv-426' },
    { ...state, campaignId: 'special-arbiter-04-arbitration' }, { ...state, phases: null }]) {
    assert.equal(resolveCampaignArtV190({ state: other }), null);
  }
  assert.equal(resolveCampaignArtV190(), null);
});

// This is the fs.cp predicate used by the real release builder. A previous
// build rejected the newly admitted painting at its V180 namespace boundary.
test('the release copy filter descends into exactly the five ARBITER images and rejects candidate neighbors', () => {
  const root = process.cwd(), filter = createBuildAssetFilter(root);
  for (const prefix of ['assets/openai/stages/xeno-trials-v190', 'assets/openai/campaign/xeno-arbiter-v190']) {
    assert.equal(filter(resolve(root, prefix)), true, prefix);
    for (const name of ['candidate.png', 'unreviewed.png', 'nested/extra.png'])
      assert.equal(filter(resolve(root, prefix, name)), false, name);
  }
  for (const image of PUBLIC_ARBITER_IMAGES_V190)
    assert.equal(filter(resolve(root, image.path)), true, image.path);
});
