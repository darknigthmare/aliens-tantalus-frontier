import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { GameEngine } from '../src/game-production-resume.js';
import { SaveSystem, beginOperation, recordOperationResumeState } from '../src/save.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { createPlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { createPlayerOpeningV88, applyOpeningMissionSuppliesV88 } from '../src/player-opening-v88.js';

// Exercise the real application wiring, native inventory restore and save transaction.
// Only rendering/startup ports are stubbed; all storage is an in-memory Map.
const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
function appFunction(name) {
  const match = source.match(new RegExp(`^function ${name}\\([^]*?^\\}`, 'm'));
  assert.ok(match, `missing application function ${name}`);
  return match[0];
}
const appFunctions = ['startMissionRuntimeV62', 'applyMissionResumeState',
  'captureMissionResumeState', 'commitCurrentRuntimeV78'].map(appFunction).join('\n');

function harness({ resume = null, denyCheckpoint = false } = {}) {
  const values = new Map(), calls = [];
  const backend = {
    getItem: key => values.get(key) ?? null,
    setItem(key, value) { if (this.denied) throw new Error('quota'); values.set(key, value); },
    removeItem: key => values.delete(key), denied: false
  };
  const saveSystem = new SaveSystem(backend);
  saveSystem.data.onboardingV84 = { ...createPlayerOnboardingV84({ name: 'Alex Moreau', callsign: 'FOX-9' }), phase: 'complete', dialogueNode: 0 };
  saveSystem.data.openingV88 = { ...createPlayerOpeningV88(), phase: 'ready', freight: 'medical',
    qualificationId: 'm41a-qualification-v81:session-1:qualification' };
  const campaign = CAMPAIGNS.find(entry => saveSystem.data.galaxy.unlockedWorldIds.includes(entry.worldId));
  const world = WORLDS.find(entry => entry.id === campaign.worldId);
  beginOperation(saveSystem.data, campaign, world);
  saveSystem.commit();
  const commit = saveSystem.commit.bind(saveSystem);
  saveSystem.commit = candidate => { calls.push('checkpoint'); return commit(candidate); };
  backend.denied = denyCheckpoint;
  const identity = { seed: 8801, worldId: world.id, campaignId: campaign.id, levelSeedId: 'opening-v88' };
  const engine = {
    setCoop() {},
    start(options) {
      calls.push('start');
      this.resumeIdentity = { ...identity };
      this.inventory = { medkits: 1, salvage: 0, intel: 0, securityKeys: 0, cutter: false };
      this.mission = { state: 'active', phase: 'restore-power', elapsed: 0, retries: 0, casualties: 0, objectives: {} };
      this.enemies = []; this.doors = []; this.vents = []; this.supplies = [];
      this.lastResumeResult = options.resumeState
        ? GameEngine.prototype.applyResumeState.call(this, options.resumeState)
        : { applied: false, reason: 'not-requested', restored: 0 };
    },
    captureResumeState() { return GameEngine.prototype.captureResumeState.call(this); }
  };
  const resumeState = resume?.({ ...identity }) ?? null;
  const scope = {
    engine, saveSystem, ENEMIES: [], structuredClone, clone: structuredClone,
    applyOpeningMissionSuppliesV88, recordOperationResumeState,
    profileEpochV78: 1, pendingMissionLaunchV62: {}, missionOwnerV78: null,
    standaloneContext: null, creatorOwnerV84: null,
    destroyMissionInsertionUiV62() {}, getSpecialOperationByCampaignIdV67: () => null,
    captureHubPoseV84: () => ({}),
    setupAlphaBravoCommandDockV69: () => ({ refresh() {} }),
    setupAlienSurvivalDockV70: () => ({ refresh() {} }),
    renderMissionEquipment() { calls.push('render'); },
    byId: () => ({ focus() { calls.push('focus'); } }),
    toast: message => calls.push(['toast', message]),
    context: { campaign, world, worldState: {}, levelSeed: { id: identity.levelSeedId, seed: identity.seed },
      deployment: { operation: structuredClone(saveSystem.data.strategy.currentOperation) },
      operationLoadout: { resumeState } }
  };
  runInNewContext(appFunctions, scope);
  const launch = () => scope.startMissionRuntimeV62(scope.context);
  const reload = () => { const loaded = new SaveSystem(backend); loaded.load(saveSystem.profile); return loaded.data; };
  return { scope, engine, saveSystem, backend, calls, launch, reload, identity };
}

for (const rejected of [false, true]) {
  test(`V88 medical freight checkpoints +2 immediately after ${rejected ? 'rejected native checkpoint' : 'fresh insertion'}`, () => {
    const h = harness({ resume: rejected ? identity => ({ schema: 1, identity: { ...identity, seed: identity.seed - 1 }, inventory: { medkits: 0 } }) : null });
    h.launch();
    assert.equal(h.engine.lastResumeResult.applied, false);
    assert.equal(h.engine.lastResumeResult.reason, rejected ? 'identity-mismatch' : 'not-requested');
    assert.equal(h.engine.inventory.medkits, 3);
    assert.equal(h.calls.filter(call => call === 'checkpoint').length, 1);
    assert.ok(h.calls.indexOf('checkpoint') < h.calls.indexOf('render'), 'allocation is saved before mission controls are focused');
    const saved = h.reload().strategy.currentOperation.resumeState;
    assert.equal(saved.inventory.medkits, 3);
    assert.equal(saved.identity.seed, h.identity.seed, 'rejected identity cannot contaminate the new checkpoint');
    h.scope.context.operationLoadout.resumeState = saved;
    h.launch();
    assert.equal(h.engine.lastResumeResult.applied, true);
    assert.equal(h.engine.inventory.medkits, 3, 'reloading the immediate checkpoint must not allocate again');
    assert.equal(h.calls.filter(call => call === 'checkpoint').length, 1);
  });
}

for (const medkits of [0, 2, 3]) {
  test(`V88 valid native resume preserves ${medkits} remaining medical supplies without another allocation`, () => {
    const h = harness({ resume: identity => ({ schema: 1, identity, inventory: { medkits } }) });
    h.launch();
    assert.equal(h.engine.lastResumeResult.applied, true);
    assert.equal(h.engine.inventory.medkits, medkits);
    assert.equal(h.calls.includes('checkpoint'), false, 'unchanged restored supplies do not trigger an allocation checkpoint');
  });
}

test('V88 successful compatibility restore is also treated as consumed freight', () => {
  const h = harness({ resume: () => ({ schema: 2, inventory: { medkits: 0 } }) });
  h.launch();
  assert.equal(h.engine.lastResumeResult.applied, false, 'native engine rejects compatibility schema');
  assert.equal(h.engine.lastResumeResult.reason, 'schema-mismatch');
  assert.equal(h.engine.inventory.medkits, 0, 'actual application compatibility restore succeeds and prevents a refill');
  assert.equal(h.calls.includes('checkpoint'), false);
});

test('V88 failed immediate checkpoint keeps the allocated live inventory and reports the save failure', () => {
  const h = harness({ denyCheckpoint: true });
  assert.doesNotThrow(h.launch);
  assert.equal(h.engine.inventory.medkits, 3);
  assert.equal(h.reload().strategy.currentOperation.resumeState, null, 'failed writes cannot claim persisted freight');
  assert.equal(h.calls.filter(call => call === 'checkpoint').length, 1);
  assert.ok(h.calls.some(call => Array.isArray(call) && call[0] === 'toast' && call[1].startsWith('Fret chargé, sauvegarde en attente :')));
  assert.ok(h.calls.includes('focus'), 'recoverable storage failure does not discard the mission');
});
