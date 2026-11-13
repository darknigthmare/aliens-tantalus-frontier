import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SAVE_SCHEMA, createDefaultSave, migrateSave, beginOperation, getOperationBrief,
  recordOperationResumeState, resolveOperation } from '../src/save.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { ARBITER_CAMPAIGNS_V190, ARBITER_MISSIONS_V190, arbiterInsertionStoryV190 } from '../src/xeno-arbiter-campaign-v190.js';
import { getCommandMissionsV110 } from '../src/player-surfaces-v110.js';
import { getArbiterDossierModelV190, mountArbiterDossierV190, renderArbiterTerminalDossierV190 } from '../src/xeno-arbiter-ui-v190.js';
import { createMissionInsertionV62, applyMissionInsertionActionV62 } from '../src/mission-insertion-v62.js';
import { getMissionInsertionUiModelV62 } from '../src/mission-insertion-ui-v62.js';
import { buildArbiterMissionV190 } from '../src/xeno-arbiter-runtime-v190.js';
import { beginXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { previousProgress, fixture, tick, walk, hold, finish } from './xeno-arbiter-test-helpers-v190.mjs';

const world = WORLDS.find(entry => entry.id === 'world-05-lethe');
function saveFixture(index = 0) {
  const save = createDefaultSave(1); save.xenoArbiterV190 = previousProgress(index);
  save.galaxy.resources.pathogen = 13; save.galaxy.worldState[world.id].infestation = 53;
  return save;
}
function deployed(index = 0) {
  const save = saveFixture(index), campaign = ARBITER_CAMPAIGNS_V190[index];
  const deployment = beginOperation(save, campaign, world);
  const native = fixture(index, { operationId: deployment.operation.id, arbiterProgressV190: save.xenoArbiterV190 });
  return { save, campaign, deployment, native };
}
// DOM model below implements only the node construction/append/query/event
// contracts used by the real dossier renderer. It is not a browser layout test.
class NodeDouble extends EventTarget {
  constructor(tag, document) { super(); this.tagName = tag.toUpperCase(); this.ownerDocument = document; this.children = []; this.dataset = {}; this.textContent = ''; this.disabled = false; }
  append(...nodes) { for (const node of nodes) { node.parent = this; this.children.push(node); } }
  replaceChildren(...nodes) { for (const node of this.children) node.parent = null; this.children = []; this.append(...nodes); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); this.parent = null; }
  querySelector(selector) {
    const match = /^\[data-([a-z-]+)\]$/.exec(selector); if (!match) return null;
    const key = match[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return descendants(this).find(node => Object.hasOwn(node.dataset, key)) || null;
  }
}
const descendants = root => root.children.flatMap(child => [child, ...descendants(child)]);
function dom() { const document = { createElement: tag => new NodeDouble(tag, document) }; return new NodeDouble('div', document); }
function click(node) { if (!node || node.disabled) return false; node.dispatchEvent(new Event('click')); return true; }

// Legacy profile input intentionally omits the new optional progress record.
test('schema52 migration initializes ARBITER without changing existing Trials credits, owned fighters or pending match', () => {
  const save = createDefaultSave(1); delete save.xenoArbiterV190;
  save.xenoTrialsV96.credits = 734;
  const ticket = beginXenoTrialsV96(save.xenoTrialsV96, { playerId: 'warrior', opponentId: 'runner' });
  assert.equal(ticket.applied, true); save.xenoTrialsV96 = ticket.state;
  const previous = structuredClone(save.xenoTrialsV96);
  const result = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  assert.equal(SAVE_SCHEMA, 52); assert.equal(result.schema, 52);
  assert.deepEqual(result.xenoTrialsV96, previous);
  assert.deepEqual(result.xenoArbiterV190, { schema: 190, completedCampaignIds: [], returns: [] });
});

test('command and central deployment gates expose only the next chapter, and rejection consumes no resources or clocks', () => {
  const save = saveFixture(), target = ARBITER_CAMPAIGNS_V190[2];
  const before = structuredClone({ resources: save.galaxy.resources, hub: save.hub.systems, clock: save.clock, crew: save.crew, strategy: save.strategy });
  assert.deepEqual(getCommandMissionsV110(save, CAMPAIGNS).filter(c => c.id.startsWith('special-arbiter-')).map(c => c.id), [ARBITER_CAMPAIGNS_V190[0].id]);
  assert.equal(getOperationBrief(save, target, world).ready, false);
  assert.throws(() => beginOperation(save, target, world), /retour précédent/);
  assert.deepEqual({ resources: save.galaxy.resources, hub: save.hub.systems, clock: save.clock, crew: save.crew, strategy: save.strategy }, before);
  save.xenoArbiterV190.completedCampaignIds = ARBITER_CAMPAIGNS_V190.map(c => c.id);
  assert.equal(getOperationBrief(save, target, world).arbiterAccessV190, false);
});

test('ARBITER freezes exactly one operator, no vehicle or biological remote profile, and a resumed departure is free', () => {
  const save = saveFixture(); save.strategy.selectedVehicleId = 'vehicle-001-m577-armored-personnel-carrier';
  const campaign = ARBITER_CAMPAIGNS_V190[0], started = beginOperation(save, campaign, world);
  assert.equal(started.operation.crewIds.length, 1); assert.equal(started.operation.vehicleId, null);
  assert.equal(started.operation.neuroProfileId, null); assert.equal(started.operation.apexDossierId, null);
  const resources = structuredClone(save.galaxy.resources), clock = structuredClone(save.clock);
  const same = beginOperation(save, campaign, world); assert.equal(same.resumed, true);
  assert.equal(same.operation.id, started.operation.id); assert.deepEqual(save.galaxy.resources, resources); assert.deepEqual(save.clock, clock);
});

for (let index = 0; index < 6; index++) test(`strategic chapter ${index + 1}: a persisted native terminal receipt records evidence once, preserves infestation and grants no pathogen`, () => {
  const f = deployed(index); finish(f.native);
  const victory = f.native.victory(), beforePathogen = f.save.galaxy.resources.pathogen;
  const beforeInfestation = f.save.galaxy.worldState[world.id].infestation;
  assert.equal(recordOperationResumeState(f.save, victory.resumeState), true);
  const state = migrateSave(JSON.parse(JSON.stringify(f.save)), 1);
  assert.equal(state.strategy.currentOperation.resumeState.arbiterMissionV190.deploymentId, f.deployment.operation.id);
  assert.equal(f.native.engine.validateArbiterResumeV190(state.strategy.currentOperation.resumeState).valid, true);
  const result = resolveOperation(state, { success: true, kills: 0, rewards: victory.event.rewards });
  assert.equal(result.ok, true, result.reason); assert.equal(result.success, true);
  assert.equal(state.xenoArbiterV190.returns.length, index + 1);
  assert.equal(state.galaxy.resources.pathogen, beforePathogen); assert.equal(state.galaxy.worldState[world.id].infestation, beforeInfestation);
  assert.equal(state.strategy.lastOperation.arbiterV190.complete, true);
  const restored = migrateSave(JSON.parse(JSON.stringify(state)), 1);
  assert.deepEqual(restored.xenoArbiterV190, state.xenoArbiterV190);
  assert.deepEqual(restored.strategy.lastOperation.arbiterV190, state.strategy.lastOperation.arbiterV190);
  const banked = structuredClone(state.galaxy.resources);
  assert.equal(resolveOperation(state, { success: true, kills: 0, rewards: victory.event.rewards }).ok, false);
  assert.deepEqual(state.galaxy.resources, banked); f.native.engine.stop();
});

test('central resolution refuses unpersisted, forged, stale-deployment or nonnumeric reward receipts before changing the save', () => {
  const f = deployed(); finish(f.native); const victory = f.native.victory();
  const base = structuredClone(f.save);
  assert.equal(resolveOperation(f.save, { success: true, rewards: victory.event.rewards }).ok, false);
  assert.deepEqual(f.save, base);
  for (const alter of [
    ({ resume }) => { resume.arbiterMissionV190.state.receipt.evidenceIds = []; },
    ({ resume }) => { resume.arbiterMissionV190.deploymentId = `operation-999-${f.campaign.id}`; },
    ({ rewards }) => { rewards.credits = { arbiter: true }; },
    args => { args.rewards = null; }, args => { args.rewards = {}; }
  ]) {
    const state = structuredClone(base), args = { resume: structuredClone(victory.resumeState), rewards: structuredClone(victory.event.rewards) };
    alter(args); recordOperationResumeState(state, args.resume);
    const before = structuredClone(state); const result = resolveOperation(state, { success: true, rewards: args.rewards });
    assert.equal(result.ok, false); assert.deepEqual(state, before);
  }
  f.native.engine.stop();
});

test('fractional station progress and checkpoint survive recordResume, JSON migration and a second native engine', () => {
  const f = deployed(1); const first = f.native.mission.stations[0]; walk(f.native, first.x);
  f.native.key('keydown', 'KeyE'); tick(f.native.engine, .75); f.native.key('keyup', 'KeyE');
  const raw = f.native.engine.captureResumeState(), fraction = raw.arbiterMissionV190.state.channelProgress;
  assert.ok(fraction > .7 && fraction < .8);
  assert.equal(recordOperationResumeState(f.save, raw), true);
  const loaded = migrateSave(JSON.parse(JSON.stringify(f.save)), 1);
  const saved = loaded.strategy.currentOperation.resumeState;
  assert.equal(f.native.engine.validateArbiterResumeV190(saved).valid, true);
  assert.equal(f.native.engine.validateArbiterResumeV190(saved.arbiterMissionV190.checkpoint).valid, true);
  f.native.engine.stop();
  const replay = fixture(1, { operationId: loaded.strategy.currentOperation.id, arbiterProgressV190: loaded.xenoArbiterV190, resumeState: saved });
  assert.equal(replay.engine.lastResumeResult.applied, true); assert.equal(replay.engine.arbiterV190.channelProgress, fraction);
  tick(replay.engine, .5); assert.equal(replay.engine.arbiterV190.channelProgress, fraction);
  replay.key('keydown', 'KeyE'); tick(replay.engine, 1.4); replay.key('keyup', 'KeyE'); assert.equal(replay.engine.arbiterV190.stage, 1);
  replay.engine.stop();
});

test('dossier model and real DOM renderer expose actual chapter targets while opening grants neither custody nor Trials rewards', () => {
  const progress = previousProgress(0), before = structuredClone(progress), root = dom(); let planned = null, opened = 0;
  const model = mountArbiterDossierV190(root, { progress, worldAvailable: true, onPlan: id => { planned = id; }, onOpenTrials: () => { opened++; } });
  assert.equal(model.recovered, false); assert.equal(model.localMire, false);
  assert.deepEqual(model.chapters.map(ch => ch.stations.map(s => [s.id, s.x, s.groundY])), ARBITER_MISSIONS_V190.map(m => m.stations.map(s => [s.id, s.x, s.groundY])));
  const buttons = descendants(root).filter(node => node.tagName === 'BUTTON');
  assert.equal(buttons.filter(button => !button.disabled).length, 1);
  click(buttons[0]); assert.equal(planned, ARBITER_CAMPAIGNS_V190[0].id);
  assert.equal(descendants(root).some(node => node.dataset.arbiterOpenTrials), false);
  renderArbiterTerminalDossierV190(root, progress, () => { opened++; });
  click(descendants(root).find(node => node.dataset.arbiterConsult));
  assert.equal(opened, 1); assert.deepEqual(progress, before);
  const complete = previousProgress(6), finalRoot = dom();
  mountArbiterDossierV190(finalRoot, { progress: complete, worldAvailable: true, onPlan() {}, onOpenTrials: () => { opened++; } });
  const local = descendants(finalRoot).find(node => node.dataset.arbiterOpenTrials); assert.ok(local); click(local); assert.equal(opened, 2);
  assert.equal(getArbiterDossierModelV190(previousProgress(2)).recovered, false);
  assert.equal(getArbiterDossierModelV190(previousProgress(3)).recovered, true);
});

test('insertion consumes the authored ARBITER scenes and never invents prior custody during preparation', () => {
  const campaign = ARBITER_CAMPAIGNS_V190[0];
  let insertion = createMissionInsertionV62({ operation: { id: `operation-1-${campaign.id}` }, campaign, world, mission: buildArbiterMissionV190({ campaign }) });
  const model = getMissionInsertionUiModelV62(insertion);
  assert.equal(model.story.id, ARBITER_MISSIONS_V190[0].id); assert.equal(model.story.canonExact, false);
  assert.deepEqual(model.story, arbiterInsertionStoryV190(insertion)); assert.equal(model.story.canChoose, false);
  insertion = applyMissionInsertionActionV62(insertion, 'acknowledge-briefing', { now: 1000 }).state;
  const preparation = getMissionInsertionUiModelV62(insertion).story;
  assert.ok(preparation.lines.some(line => line.text.startsWith('Tout module retrouvé')));
  assert.ok(preparation.lines.every(line => !line.text.includes('Le module saisi reste')));
});


test('one campaign save advances through all six real engine extractions and opens the isolated MIRE dossier only after the sixth', () => {
  const save = saveFixture(); const trials = structuredClone(save.xenoTrialsV96);
  for (let index = 0; index < 6; index++) {
    const campaign = ARBITER_CAMPAIGNS_V190[index];
    const started = beginOperation(save, campaign, world);
    const f = fixture(index, { operationId: started.operation.id, arbiterProgressV190: save.xenoArbiterV190 });
    finish(f); const victory = f.victory();
    assert.equal(recordOperationResumeState(save, victory.resumeState), true);
    assert.equal(resolveOperation(save, { success: true, kills: 0, rewards: victory.event.rewards }).ok, true);
    assert.equal(save.xenoArbiterV190.completedCampaignIds.length, index + 1);
    assert.equal(getArbiterDossierModelV190(save.xenoArbiterV190).localMire, index === 5);
    assert.deepEqual(save.xenoTrialsV96, trials); f.engine.stop();
  }
  assert.equal(save.strategy.serial, 6);
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(save)), 1).xenoArbiterV190, save.xenoArbiterV190);
});
