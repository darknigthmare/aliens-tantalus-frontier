import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGNS, WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { buildApcConvoyLevelV121 } from '../src/apc-convoy-runtime-v121.js';
import { createDefaultSave, beginOperation, recordOperationResumeState, resolveOperation, migrateSave } from '../src/save.js';
import { createMissionInsertionV62, applyMissionInsertionActionV62, pauseMissionInsertionV62 } from '../src/mission-insertion-v62.js';
import { getMissionInsertionUiModelV62 } from '../src/mission-insertion-ui-v62.js';
import { campaignInsertionStoryV161, chooseConvoyStoryProtocolV161, convoyStoryProtocolV161,
  campaignStoryReturnV161, recordCampaignStoryReviewV161 } from '../src/campaign-convoy-story-v161.js';
import { hostV136 } from './forge-native-host-v136.mjs';

const campaign = CAMPAIGNS.find(value => value.id === 'special-apc-convoy');
const world = WORLDS.find(value => value.id === campaign.worldId);
const clone = value => structuredClone(value);
const insertion = (id = 'operation-1-special-apc-convoy') => createMissionInsertionV62({
  operation: { id, campaignId: campaign.id, worldId: world.id }, campaign, world });
const advance = state => {
  const result = applyMissionInsertionActionV62(state, state.phases[state.currentIndex].requiredAction, { now: state.updatedAt + 100 });
  assert.equal(result.ok, true); return result.state;
};
function completedInsertion(id, protocolId = 'hull-review') {
  let state = advance(insertion(id));
  if (protocolId) state = chooseConvoyStoryProtocolV161(state, protocolId).state;
  while (state.status !== 'completed') state = advance(state);
  return state;
}
function protectedState(save) {
  const state = clone(save);
  const preparation = state.strategy.lastOperation?.insertionState?.phases.find(phase => phase.kind === 'preparation');
  if (preparation) delete preparation.payload.convoyReturnV161;
  return state;
}

test('APC story dispatch is exact, original and never borrows the QZ18 deployment picture', () => {
  let state = insertion();
  assert.equal(campaignInsertionStoryV161(state).canonExact, false);
  assert.equal(campaignInsertionStoryV161(state).provenance, 'tantalus-project-original');
  while (state.phases[state.currentIndex].kind !== 'deployment') state = advance(state);
  const model = getMissionInsertionUiModelV62(state);
  assert.match(model.story.title, /Dernier contrôle/); assert.equal(model.storyScene, null);
  for (const [key, value] of [['worldId', 'world-other'], ['campaignId', 'special-archive-relay'], ['operationId', 'operation-other']]) {
    const foreign = clone(state); foreign[key] = value; assert.equal(campaignInsertionStoryV161(foreign), null);
  }
});

test('optional preparation choice is detached, bounded, persisted and cannot be accepted while paused or after deployment', () => {
  const first = insertion(), before = clone(first);
  assert.equal(chooseConvoyStoryProtocolV161(first, 'hull-review').ok, false); assert.deepEqual(first, before);
  const prep = advance(first), selected = chooseConvoyStoryProtocolV161(prep, 'route-review', { now: 500 });
  assert.equal(selected.ok, true); assert.equal(convoyStoryProtocolV161(prep), null);
  assert.equal(convoyStoryProtocolV161(selected.state).id, 'route-review');
  assert.equal(chooseConvoyStoryProtocolV161(selected.state, 'route-review').changed, false);
  assert.equal(chooseConvoyStoryProtocolV161(pauseMissionInsertionV62(prep).state, 'hull-review').ok, false);
  assert.equal(chooseConvoyStoryProtocolV161(completedInsertion(), 'hull-review').ok, false);
  const save = createDefaultSave(), operation = beginOperation(save, campaign, world).operation;
  operation.insertionState = chooseConvoyStoryProtocolV161(advance(insertion(operation.id)), 'route-review').state;
  assert.equal(convoyStoryProtocolV161(migrateSave(save).strategy.currentOperation.insertionState).id, 'route-review');
});

test('foreign callback, forged success, unfinished choice and legacy returns cannot invent a completed convoy', () => {
  const save = createDefaultSave();
  save.strategy.lastOperation = { id: 'operation-1-special-apc-convoy', campaignId: campaign.id, worldId: world.id,
    success: true, insertionState: completedInsertion() };
  assert.match(campaignStoryReturnV161(save).status, /RELEVÉ INCOMPLET/);
  assert.match(campaignStoryReturnV161(save).questions[0].answer, /relevé de blindage est indisponible/);
  const baseline = clone(save);
  assert.equal(recordCampaignStoryReviewV161(save, 'operation-2-special-apc-convoy', 'vehicle').ok, false);
  assert.equal(recordCampaignStoryReviewV161(save, baseline.strategy.lastOperation.id, '__proto__').ok, false);
  assert.deepEqual(save, baseline);
  save.strategy.lastOperation.insertionState = insertion();
  assert.equal(campaignStoryReturnV161(save).canPersistReview, false);
  delete save.strategy.lastOperation.insertionState;
  assert.equal(campaignStoryReturnV161(save).canPersistReview, false);
  save.strategy.lastOperation.worldId = 'foreign'; assert.equal(campaignStoryReturnV161(save), null);
});

test('failed and busy returns keep losses, distinguish checkpoints from extraction, and permit no reward or healing from reading', () => {
  const save = createDefaultSave();
  save.strategy.lastOperation = { id: 'operation-1-special-apc-convoy', campaignId: campaign.id, worldId: world.id,
    success: false, reason: 'retreat', insertionState: completedInsertion() };
  const before = protectedState(save);
  const model = campaignStoryReturnV161(save);
  assert.match(model.status, /RETOUR NON CONFIRMÉ/);
  assert.match(model.questions[0].answer, /dernières positions reçues/);
  for (const topic of ['vehicle', 'route', 'return']) assert.equal(recordCampaignStoryReviewV161(save, model.operationId, topic).ok, true);
  assert.deepEqual(protectedState(save), before);
  assert.equal(campaignStoryReturnV161(save).readingComplete, true);
  save.strategy.currentOperation = { id: 'new' };
  assert.equal(campaignStoryReturnV161(save).canReview, false);
  assert.equal(recordCampaignStoryReviewV161(save, model.operationId, 'vehicle').ok, false);
});

test('native M577 finite controls produce the actual same-operation narrative and immutable payout through reading, migration and replay', async () => {
  const host = hostV136();
  // Real shipped bitmap dimensions, no synthesized character/collision image.
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(value) {
      this._src = value; let valid = false;
      try { const bytes = readFileSync(new URL(`..${new URL(value, 'http://qa.invalid').pathname}`, import.meta.url));
        if (bytes.subarray(1, 4).toString() === 'PNG') { this.naturalWidth = bytes.readUInt32BE(16); this.naturalHeight = bytes.readUInt32BE(20); valid = true; } } catch {}
      queueMicrotask(() => { const event = new Event(valid ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); });
    }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw new Error('Missing bitmap'); }
  };
  const save = createDefaultSave(), operation = beginOperation(save, campaign, world).operation;
  operation.insertionState = completedInsertion(operation.id, 'route-review');
  const missionLevel = buildApcConvoyLevelV121({ campaign, world, levelSeeds: LEVEL_SEEDS });
  const events = [], engine = new GameEngine(host.canvas, { onEvent: event => events.push(event) });
  engine.start({ operationId: operation.id, campaign, world, missionLevel, weapon: WEAPONS[0], enemyCatalog: ENEMIES,
    equipment: [], crew: [], seed: 131426 });
  for (let n = 0; n < 80; n++) await Promise.resolve();
  const hudTexts = [], hudPanels = [];
  const hud = new Proxy({ measureText: value => ({ width: String(value).length * 8 }),
    fillText: (value, x, y) => hudTexts.push({ text: String(value), x, y }),
    fillRect: (x, y, w, h) => hudPanels.push({ x, y, w, h }) }, { get: (target, key) => target[key] || (() => {}) });
  engine.drawHud(hud);
  assert.equal(hudTexts.filter(row => row.text.startsWith('CORRIDOR DE FEU')).length, 1);
  assert.equal(hudTexts.some(row => row.text.startsWith('SECTEUR')), false);
  assert.equal(hudPanels.filter(panel => panel.w > 1000 && panel.h > 30).length, 1, 'One instrument band owns the convoy resources, course and instructions.');
  assert.deepEqual(hudTexts.filter(row => row.y < 130).map(row => row.y), [41, 66, 91, 117]);
  assert.equal(hudTexts.some(row => row.text.includes('340/340') && row.text.includes('RÉSERVE 120')), true);
  assert.equal(hudTexts.some(row => row.y > 650 && row.text.includes('ENGAGER')), true);
  engine.interact(); let cooling = false;
  for (let frame = 0; frame < 180 * 60 && engine.mission.state === 'active'; frame++) {
    const convoy = engine.apcConvoyV121, course = engine.apcCourseStateV131;
    if (convoy.heat > 83 || convoy.overheated) cooling = true;
    if (convoy.heat < 33 && !convoy.overheated) cooling = false;
    const target = engine.enemies.find(enemy => enemy.alive && enemy.apcConvoyRoleV121 !== 'horde')
      || engine.enemies.filter(enemy => enemy.alive).sort((a, b) => b.x - a.x)[0];
    const next = new Set(convoy.phase === 'evacuation' ? ['KeyE'] : ['Space']);
    if (target?.apcLaneV131 < course.lane) next.add('KeyW');
    if (target?.apcLaneV131 > course.lane) next.add('KeyS');
    if (target && !cooling && engine.vehicle.turretAmmo > 0) next.add('KeyF');
    if (engine.vehicle.turretAmmo < 18 && engine.vehicle.turretReserve > 0) next.add('KeyR');
    // Explicit semantic Node fixture uses the public held-input set, not a
    // browser journey claim. Root's independent driver exercises actual keys.
    engine.keys = next; engine.update(1 / 60);
  }
  engine.keys.clear();
  assert.equal(engine.mission.state, 'complete');
  const terminal = engine.captureResumeState(); assert.equal(recordOperationResumeState(save, terminal), true);
  const completion = events.find(event => event.type === 'mission-complete'); assert.ok(completion);
  assert.equal(resolveOperation(save, { success: true, rewards: completion.rewards }).ok, true);
  let model = campaignStoryReturnV161(save);
  assert.equal(model.operationId, operation.id); assert.match(model.status, /PASSAGE DU BLINDÉ CONFIRMÉ/);
  assert.equal(model.selectedTopic, 'route'); assert.match(model.questions[1].answer, /progression du parcours 100 %/);
  assert.match(model.questions[1].answer, /2\/2/);
  const departure = events.filter(event => event.type === 'apc-convoy-radio' && event.id === 'depart');
  assert.equal(departure.length, 1); assert.match(departure[0].text, /Rook/);
  const baseline = protectedState(save);
  for (const topic of ['vehicle', 'route', 'return']) {
    assert.equal(recordCampaignStoryReviewV161(save, operation.id, topic).changed, true);
    assert.equal(recordCampaignStoryReviewV161(save, operation.id, topic).changed, false);
  }
  assert.deepEqual(protectedState(save), baseline);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
  model = campaignStoryReturnV161(migrated);
  assert.equal(model.readingComplete, true); assert.match(model.status, /PASSAGE DU BLINDÉ CONFIRMÉ/);
  assert.match(model.questions[0].answer, new RegExp(`${Math.round(terminal.vehicle.hull)}/340`));
  const credits = migrated.galaxy.resources.credits;
  migrated.strategy.currentOperation = clone(save.strategy.lastOperation);
  assert.equal(resolveOperation(migrated, { success: true, rewards: completion.rewards }).reason, 'operation-already-resolved');
  assert.equal(migrated.galaxy.resources.credits, credits);
  engine.stop();
});
