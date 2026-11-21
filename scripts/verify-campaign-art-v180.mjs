import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { CAMPAIGN_ART_V179, resolveCampaignArtV179 } from '../src/campaign-art-v179.js';
import { CAMPAIGN_ART_ASSETS_V180, CAMPAIGN_ART_V180, resolveCampaignArtV180 } from '../src/campaign-art-v180.js';
import { createMissionInsertionV62, applyMissionInsertionActionV62 } from '../src/mission-insertion-v62.js';
import { getMissionInsertionUiModelV62 } from '../src/mission-insertion-ui-v62.js';

const provenance = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/campaign-art-v180.json', import.meta.url), 'utf8'));
const insertion = id => {
  const campaign = CAMPAIGNS.find(entry => entry.id === id);
  return createMissionInsertionV62({ campaign, world: WORLDS.find(entry => entry.id === campaign.worldId),
    operation: { id: `operation-1-${campaign.id}`, campaignId: campaign.id, worldId: campaign.worldId } });
};
const advance = state => {
  const result = applyMissionInsertionActionV62(state, state.phases[state.currentIndex].requiredAction, { now: state.updatedAt + 100 });
  assert.equal(result.ok, true); return result.state;
};
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
function dimensionsOfLosslessWebp(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF'); assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const tag = bytes.toString('ascii', offset, offset + 4), length = bytes.readUInt32LE(offset + 4);
    assert.ok(offset + 8 + length <= bytes.length);
    if (tag === 'VP8L') {
      assert.equal(bytes[offset + 8], 0x2f);
      const bits = bytes.readUInt32LE(offset + 9);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    offset += 8 + length + length % 2;
  }
  assert.fail('A VP8L lossless image chunk is required');
}

test('four genuine new paintings have exact source provenance and valid lossless public bytes', () => {
  assert.equal(CAMPAIGN_ART_ASSETS_V180.length, 4);
  assert.equal(provenance.counts.newImages, 4); assert.equal(provenance.fidelity.canonExact, false);
  assert.equal(new Set(CAMPAIGN_ART_ASSETS_V180.map(asset => asset.path)).size, 4);
  let total = 0;
  for (const asset of CAMPAIGN_ART_ASSETS_V180) {
    const metadata = provenance.images.find(entry => `/${entry.path}` === asset.path);
    assert.ok(metadata); assert.equal(metadata.pixelEqual, true);
    const bytes = readFileSync(new URL(`..${asset.path}`, import.meta.url));
    assert.equal(sha256(bytes), metadata.sha256); assert.equal(bytes.length, metadata.bytes);
    for (const key of ['width', 'height', 'bytes', 'sha256']) assert.equal(asset[key], metadata[key]);
    assert.deepEqual(dimensionsOfLosslessWebp(bytes), { width: metadata.width, height: metadata.height });
    assert.ok(metadata.width >= 1536); assert.ok(metadata.height >= 900);
    assert.equal(sha256(readFileSync(new URL(`../${metadata.referencePath}`, import.meta.url))), metadata.referenceSha256);
    assert.match(metadata.sourcePngSha256, /^[a-f0-9]{64}$/u);
    assert.ok(metadata.exactPrompt.length > 500); assert.match(metadata.visualReview, /Inspected/u);
    total += bytes.length;
  }
  assert.equal(total, provenance.publicBytes);
});

test('forty explicit bindings target twenty real campaigns in their exact worlds', () => {
  assert.equal(CAMPAIGN_ART_V180.length, 40); assert.equal(provenance.counts.newBindings, 40);
  assert.equal(new Set(CAMPAIGN_ART_V180.map(entry => entry.id)).size, 40);
  assert.equal(new Set(CAMPAIGN_ART_V180.map(entry => entry.campaignId)).size, 20);
  for (const entry of CAMPAIGN_ART_V180) {
    const campaign = CAMPAIGNS.find(campaign => campaign.id === entry.campaignId);
    assert.ok(campaign); assert.equal(entry.worldId, campaign.worldId);
    assert.equal(entry.canonExact, false); assert.equal(entry.newImage, true);
    assert.equal(entry.provenance, 'openai-imagegen-project-interpretation');
    assert.ok(['approach', 'deployment'].includes(entry.phaseKind)); assert.ok(Object.isFrozen(entry));
  }
});

test('the app resolver gives all forty new paintings priority through native insertion transitions without changing state', () => {
  for (const id of new Set(CAMPAIGN_ART_V180.map(entry => entry.campaignId))) {
    let state = insertion(id);
    assert.equal(resolveCampaignArtV180({ state }), null);
    while (state.phases[state.currentIndex].kind !== 'approach') state = advance(state);
    for (const phaseKind of ['approach', 'deployment']) {
      assert.equal(state.phases[state.currentIndex].kind, phaseKind);
      const before = structuredClone(state), entry = resolveCampaignArtV180({ state });
      assert.ok(entry); assert.equal(resolveCampaignArtV179({ state }).id, entry.id);
      const model = getMissionInsertionUiModelV62(state, { resolveMedia: resolveCampaignArtV179 });
      assert.equal(model.media.source, entry.path); assert.equal(model.media.credit, entry.credit);
      assert.equal(model.storyScene, null); assert.deepEqual(state, before);
      state = advance(state);
    }
    assert.equal(resolveCampaignArtV180({ state }), null);
  }
});

test('foreign campaigns, mismatched worlds and non-active phases retain their existing presentation', () => {
  const state = advance(advance(insertion('pair-001-frontier')));
  assert.equal(resolveCampaignArtV180({ state: { ...state, worldId: 'world-05-lethe' } }), null);
  assert.equal(resolveCampaignArtV180({ state: { ...state, campaignId: 'pair-001-mire' } }), null);
  assert.equal(resolveCampaignArtV180({ state, phase: { kind: 'briefing' } }), null);
  assert.equal(resolveCampaignArtV180({ state: { ...state, currentIndex: -1 } }), null);
  assert.equal(resolveCampaignArtV180(), null);
  const lethe = advance(advance(insertion('pair-005-frontier')));
  const historicalEntry = CAMPAIGN_ART_V179.find(entry => entry.campaignId === lethe.campaignId && entry.phaseKind === 'approach');
  assert.equal(resolveCampaignArtV180({ state: lethe }), null);
  assert.equal(resolveCampaignArtV179({ state: lethe }), historicalEntry);
  assert.equal(CAMPAIGN_ART_V179.length, 40);
});
