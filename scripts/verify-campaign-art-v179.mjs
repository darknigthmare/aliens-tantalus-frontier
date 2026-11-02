import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { CAMPAIGN_ART_V179, resolveCampaignArtV179 } from '../src/campaign-art-v179.js';
import { createMissionInsertionV62, applyMissionInsertionActionV62 } from '../src/mission-insertion-v62.js';
import { getMissionInsertionUiModelV62, normalizeMissionInsertionMediaV62, resolveMissionInsertionMediaV62 } from '../src/mission-insertion-ui-v62.js';

const fallback = Object.freeze({
  id: 'fixture-existing-media', path: '/assets/openai/mission/insertion/tantalus-foot-approach-v62.png',
  alt: 'Illustration existante de marche à pied', provenance: 'test-fixture'
});
const mediaRegistry = { default: fallback };
const resolveMedia = ({ state, phase }) => resolveCampaignArtV179({ state, phase })
  || resolveMissionInsertionMediaV62({ state, phase, mediaRegistry });
const insertion = campaignId => {
  const campaign = CAMPAIGNS.find(entry => entry.id === campaignId);
  return createMissionInsertionV62({ operation: { id: `operation-1-${campaign.id}`,
    campaignId: campaign.id, worldId: campaign.worldId }, campaign,
  world: WORLDS.find(world => world.id === campaign.worldId) });
};
function advance(state) {
  const result = applyMissionInsertionActionV62(state, state.phases[state.currentIndex].requiredAction, { now: state.updatedAt + 100 });
  assert.equal(result.ok, true); return result.state;
}

test('forty illustration bindings retain twenty exact campaign/world pairs and existing image provenance', () => {
  assert.equal(CAMPAIGN_ART_V179.length, 40);
  assert.equal(new Set(CAMPAIGN_ART_V179.map(entry => entry.id)).size, 40);
  const ids = [...new Set(CAMPAIGN_ART_V179.map(entry => entry.campaignId))];
  assert.equal(ids.length, 20);
  for (const id of ids) {
    const campaign = CAMPAIGNS.find(entry => entry.id === id);
    assert.equal(campaign.mode, 'FRONTIER');
    const entries = CAMPAIGN_ART_V179.filter(entry => entry.campaignId === id);
    assert.deepEqual(entries.map(entry => entry.phaseKind), ['approach', 'deployment']);
    for (const entry of entries) {
      assert.equal(entry.worldId, campaign.worldId);
      assert.equal(entry.canonExact, false); assert.equal(entry.newImage, false);
      assert.equal(entry.provenance, 'existing-openai-project-art');
      assert.ok(Object.isFrozen(entry)); assert.match(entry.credit, /illustration d’ambiance du projet/u);
    }
  }
});

test('the existing insertion transitions resolve all forty images through the production UI model', () => {
  for (const id of new Set(CAMPAIGN_ART_V179.map(entry => entry.campaignId))) {
    let state = insertion(id);
    assert.equal(getMissionInsertionUiModelV62(state, { resolveMedia }).media.id, fallback.id);
    while (state.phases[state.currentIndex].kind !== 'approach') state = advance(state);
    for (const kind of ['approach', 'deployment']) {
      assert.equal(state.phases[state.currentIndex].kind, kind);
      const before = structuredClone(state);
      const model = getMissionInsertionUiModelV62(state, { resolveMedia });
      const expected = CAMPAIGN_ART_V179.find(entry => entry.campaignId === id && entry.phaseKind === kind);
      assert.equal(model.media.source, expected.path); assert.equal(model.media.type, 'image');
      assert.equal(model.media.credit, expected.credit); assert.equal(model.media.alt, expected.alt);
      assert.equal(model.storyScene, null); assert.deepEqual(state, before);
      state = advance(state);
    }
    assert.equal(getMissionInsertionUiModelV62(state, { resolveMedia }).media.id, fallback.id);
  }
});

test('foreign worlds, historical MIRE campaigns and future phase requests cannot borrow illustrations', () => {
  const state = advance(advance(insertion('pair-001-frontier')));
  assert.equal(state.phases[state.currentIndex].kind, 'approach');
  assert.equal(resolveCampaignArtV179({ state: { ...state, worldId: 'world-05-lethe' } }), null);
  assert.equal(resolveCampaignArtV179({ state: { ...state, campaignId: 'pair-001-mire' } }), null);
  assert.equal(resolveCampaignArtV179({ state, phase: { kind: 'deployment' } }), null);
  assert.equal(resolveCampaignArtV179({ state: { ...state, currentIndex: -1 } }), null);
  assert.equal(resolveCampaignArtV179({ state: { ...state, phases: null } }), null);
  assert.equal(resolveCampaignArtV179(), null);
  assert.equal(resolveCampaignArtV179({ state: insertion('pair-021-frontier') }), null);
});

test('native QZ-18 composition and special campaign media remain owned by their existing presentation', () => {
  let state = insertion('special-archive-relay');
  while (state.phases[state.currentIndex].kind !== 'deployment') state = advance(state);
  assert.equal(resolveCampaignArtV179({ state }), null);
  const model = getMissionInsertionUiModelV62(state, { resolveMedia });
  assert.equal(model.storyScene.kind, 'native-qz18-scene');
  assert.equal(model.media, null);
});

test('every referenced source is a real full-size project PNG, never a missing path or animation sheet', () => {
  for (const path of new Set(CAMPAIGN_ART_V179.map(entry => entry.path))) {
    assert.match(path, /^\/assets\/openai\/metroidvania\/zones\/.+-far\.png$/u);
    const bytes = readFileSync(new URL(`..${path}`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.ok(bytes.readUInt32BE(16) >= 1280); assert.ok(bytes.readUInt32BE(20) >= 720);
  }
});

test('composed media resolvers preserve normalized fallbacks and retain source admission guards', () => {
  const normalized = normalizeMissionInsertionMediaV62(fallback);
  assert.deepEqual(normalizeMissionInsertionMediaV62(normalized), normalized);
  assert.equal(normalizeMissionInsertionMediaV62({ ...normalized, source: 'javascript:alert(1)' }), null);
  assert.equal(normalizeMissionInsertionMediaV62({ ...normalized, source: 'data:text/html,<script></script>' }), null);
  assert.equal(normalizeMissionInsertionMediaV62({ source: normalized.source }), null);
  assert.equal(normalizeMissionInsertionMediaV62({ ...normalized, path: '/assets/explicit.png' }).source, '/assets/explicit.png');
});
