import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { SaveSystem, createDefaultSave, beginOperation, recordOperationResumeState } from '../src/save.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const functions = ['captureMissionResumeState', 'commitCurrentRuntimeV78', 'handleQuickSaveV86'].map(name => {
  const source = app.match(new RegExp(`^function ${name}\\([^]*?^\\}`, 'm'))?.[0];
  assert.ok(source, `missing real application function ${name}`); return source;
});
function harness() {
  const values = new Map();
  const backend = { denied: false, attempts: 0, getItem: key => values.get(key) ?? null,
    setItem(key, value) { this.attempts++; if (this.denied) throw new Error('QuotaExceededError'); values.set(key, value); },
    removeItem: key => values.delete(key) };
  const save = createDefaultSave(1); save.needsPlayerCreationV84 = false;
  const campaign = CAMPAIGNS.find(item => !item.specialOperationId && save.galaxy.unlockedWorldIds.includes(item.worldId));
  const world = WORLDS.find(item => item.id === campaign.worldId);
  beginOperation(save, campaign, world);
  const saveSystem = new SaveSystem(backend); saveSystem.commit(save);
  const before = { schema: 1, identity: { campaignId: campaign.id }, mission: { elapsed: 1 } };
  recordOperationResumeState(saveSystem.data, before); saveSystem.commit(); backend.attempts = 0;
  const current = { ...before, mission: { elapsed: 99 }, placeablesV86: { schema: 86,
    instances: [{ instanceId: 'equipment-020-portable-sentry:1', status: 'deployed', onGround: true, ammo: 61, health: 73 }] } };
  const toasts = [], rendered = [];
  const context = { saveSystem, recordOperationResumeState, clone: structuredClone,
    Date: { now: () => 41000 }, sessionStart: 1000, standaloneContext: null, creatorOwnerV84: null,
    profileEpochV78: 1, missionOwnerV78: { profile: 1, epoch: 1, operationId: saveSystem.data.strategy.currentOperation.id },
    engine: { running: true, paused: true, mission: { state: 'active' }, captureResumeState: () => structuredClone(current) },
    captureHubPoseV84: () => ({}), renderClock: () => rendered.push(true), toast: message => toasts.push(message) };
  vm.createContext(context); vm.runInContext(functions.join('\n'), context);
  return { context, saveSystem, backend, values, current, toasts, rendered };
}

test('quick-save and the pause dock use the exact same application handler', () => {
  assert.match(app, /byId\('quick-save'\)\.onclick = handleQuickSaveV86;/);
  assert.match(app, /new PlaceablesDockV86\([^\n]*onSave: handleQuickSaveV86/);
});

test('shared manual save commits the current mission once and confirms only after a successful write', () => {
  const h = harness(), root = h.saveSystem.data, seconds = root.statistics.playSeconds;
  assert.equal(h.context.handleQuickSaveV86(), true);
  assert.equal(h.backend.attempts, 1); assert.equal(h.saveSystem.data, root);
  assert.deepEqual(root.strategy.currentOperation.resumeState, h.current);
  assert.equal(root.statistics.playSeconds, seconds + 40); assert.equal(h.context.sessionStart, 41000);
  assert.deepEqual(h.rendered, [true]); assert.deepEqual(h.toasts, ['Sauvegarde locale confirmée.']);
  const reloaded = new SaveSystem(h.backend); reloaded.load(1);
  assert.deepEqual(reloaded.data.strategy.currentOperation.resumeState, h.current);
});

test('quota refuses manual save without publishing resume, session time or false confirmation; retry succeeds', () => {
  const h = harness(), root = h.saveSystem.data, previous = root.strategy.currentOperation.resumeState;
  const bytes = h.values.get(h.saveSystem.key(1)), seconds = root.statistics.playSeconds;
  h.backend.denied = true;
  assert.equal(h.context.handleQuickSaveV86(), false);
  assert.equal(h.values.get(h.saveSystem.key(1)), bytes); assert.equal(root.strategy.currentOperation.resumeState, previous);
  assert.equal(root.statistics.playSeconds, seconds); assert.equal(h.context.sessionStart, 1000);
  assert.deepEqual(h.rendered, []); assert.deepEqual(h.toasts, ['Sauvegarde impossible. La partie active et le profil précédent sont conservés.']);
  h.backend.denied = false; assert.equal(h.context.handleQuickSaveV86(), true);
  assert.deepEqual(root.strategy.currentOperation.resumeState, h.current);
  assert.equal(h.toasts.at(-1), 'Sauvegarde locale confirmée.');
});

for (const [reason, invalidate] of [
  ['profile', h => { h.context.missionOwnerV78.profile = 2; }],
  ['epoch', h => { h.context.profileEpochV78++; }],
  ['operation', h => { h.context.missionOwnerV78.operationId = 'other'; }],
  ['creator', h => { h.context.creatorOwnerV84 = { profile: 1 }; }],
  ['Forge', h => { h.context.standaloneContext = 'forge-playtest'; }]
]) test(`shared manual save rejects ${reason} ownership before any write or success feedback`, () => {
  const h = harness(), bytes = h.values.get(h.saveSystem.key(1)), previous = h.saveSystem.data.strategy.currentOperation.resumeState;
  invalidate(h); assert.equal(h.context.handleQuickSaveV86(), false);
  assert.equal(h.backend.attempts, 0); assert.equal(h.context.sessionStart, 1000);
  assert.equal(h.values.get(h.saveSystem.key(1)), bytes); assert.equal(h.saveSystem.data.strategy.currentOperation.resumeState, previous);
  assert.equal(h.toasts.length, 1); assert.doesNotMatch(h.toasts[0], /confirmée/); assert.deepEqual(h.rendered, []);
});

test('protected profile preserves its original recovery error and cannot be falsely reported as saved', () => {
  const h = harness(), bytes = h.values.get(h.saveSystem.key(1));
  h.saveSystem.recoveryNeeded = { profile: 1, status: 'unavailable' };
  assert.equal(h.context.handleQuickSaveV86(), false); assert.equal(h.backend.attempts, 0);
  assert.equal(h.values.get(h.saveSystem.key(1)), bytes);
  assert.deepEqual(h.toasts, ['Récupération requise : les sauvegardes automatiques sont bloquées pour préserver les données originales.']);
  assert.deepEqual(h.rendered, []);
});
