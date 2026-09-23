import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { SaveSystem } from '../src/save.js';
import { buildBioforgeUiModelV80 } from '../src/bioforge-ui-v80.js';
import { startBioforgeSessionV80, advanceBioforgeSessionV80, appendBioforgeReinforcementsV87,
  cancelBioforgePendingV87, beginBioforgePurgeV80, completeBioforgePurgeV80 } from '../src/bioforge-session-v80.js';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
test('page unload checkpoints BIOFORGE instead of purging the active laboratory', () => {
  const listener = source.match(/globalThis\.addEventListener\('beforeunload', \(\) => \{([^]*?)\n  \}\);/);
  assert.ok(listener, 'real beforeunload listener');
  const stops = [];
  const context = {
    creatorOwnerV84: null, standaloneContext: false, sessionStart: Date.now(),
    hubDialogueUiV76: { destroy() {} }, audio: { dispose() {} },
    hubEngine: { stop() {} }, engine: { stop() {} },
    bioforgeRuntimeV80: { stop: options => stops.push(JSON.parse(JSON.stringify(options))) },
    persistMissionResumeState() {},
    saveSystem: { data: { statistics: { playSeconds: 0 } }, commit() {} }
  };
  vm.runInNewContext(`(() => {${listener[1]}\n})()`, context);
  assert.deepEqual(stops, [{ purge: false, reason: 'page-unload' }]);
});
const fn = name => {
  const single = source.match(new RegExp(`^function ${name}\\([^\\n]*\\}\\r?$`, 'm'));
  const block = source.match(new RegExp(`^function ${name}\\([^]*?^\\}`, 'm'));
  assert.ok(single || block, `real function ${name}`);
  return single?.[0] || block[0];
};
const messages = source.match(/const BIOFORGE_EVENT_MESSAGES_V80 = Object\.freeze\(\{[^]*?\r?\n\}\);/)[0];
const functions = ['currentOwnerV84', 'ownsTimelineV84', 'renderBioforgeUiV87', 'bioforgeCommandReceiptV87',
  'persistBioforgeV80', 'handleBioforgeEventV80', 'prepareBioforgeViewV80', 'startBioforgeFromTerminalV80',
  'purgeBioforgeFromTerminalV80', 'reinforceBioforgeFromTerminalV87', 'cancelBioforgeFromTerminalV87',
  'returnBioforgeToHubV80', 'setupBioforgeUiV80'];
const A = 'enemy-002-facehugger', B = 'enemy-006-runner';
const configuration = { composition: [{ lineId: 'first', profileId: A, quantity: 3 }], maxConcurrent: 2 };
const zero = { remainingEntities: 0, remainingProjectiles: 0, remainingHazards: 0, remainingEffects: 0, remainingTimers: 0 };

function harness() {
  const bytes = new Map(), backend = {
    fail: false,
    getItem: key => bytes.get(key) ?? null,
    setItem(key, value) { if (this.fail) throw new Error('quota denied'); bytes.set(key, value); },
    removeItem: key => bytes.delete(key)
  };
  const saveSystem = new SaveSystem(backend);
  saveSystem.newPlayerTimelineV84({ name: 'Operator test', callsign: 'MIX-7' }, 1);
  const calls = [], nodes = new Map();
  const context = {
    saveSystem, clone: structuredClone, Object, JSON, buildBioforgeUiModelV80,
    bioforgeOwnerV84: null, creatorOwnerV84: null, profileEpochV78: 1, activeView: 'bioforge',
    toast: message => calls.push(['toast', message]), showView: view => calls.push(['view', view]),
    byId(id) {
      if (!nodes.has(id)) nodes.set(id, { textContent: '', focus: options => calls.push(['focus', id, options]) });
      return nodes.get(id);
    },
    BioforgeUiV80: class {
      constructor(options) { Object.assign(this, options); calls.push(['ui-setup', options]); }
      render(state, options) { calls.push(['render', structuredClone(state), options]); return buildBioforgeUiModelV80(state, options); }
    },
    bioforgeUiV80: { render(state, options) { calls.push(['render', structuredClone(state), options]); } },
    bioforgeRuntimeV80: {
      bioforgeRootV80: saveSystem.data.bioforgeV80, bioforgeLastErrorV80: null,
      population: { activeCount: 2, activeCost: 4, reservedCount: 0, reservedCost: 0 },
      getBioforgePopulationV87() { return this.population; },
      prepare(state) { this.bioforgeRootV80 = state; calls.push(['prepare']); },
      start({ configuration: candidate, resumeState }) {
        calls.push(['start', candidate]);
        const result = startBioforgeSessionV80(resumeState, candidate, { now: 100 });
        this.accept(result); return { ...result, started: result.applied };
      },
      reinforceBioforgeV87(candidate, options) {
        calls.push(['reinforce', candidate, options]);
        return this.accept(appendBioforgeReinforcementsV87(this.bioforgeRootV80, candidate, { ...options, now: 110 }));
      },
      cancelBioforgeQueueV87(options) {
        calls.push(['cancel', options]);
        return this.accept(cancelBioforgePendingV87(this.bioforgeRootV80, { ...options, now: 111 }));
      },
      purgeBioforgeV80(reason) {
        calls.push(['purge', reason]);
        const begun = beginBioforgePurgeV80(this.bioforgeRootV80, reason, { now: 112 });
        const receipt = completeBioforgePurgeV80(begun.state, zero, { now: 113 });
        this.accept(receipt); return { completed: receipt.applied };
      },
      stop(options) { calls.push(['stop', options]); },
      // These ports call the real domain; this is application wiring QA, not physical runtime QA.
      accept(result) {
        if (!result.applied) return result;
        this.bioforgeRootV80 = result.state;
        if (!context.persistBioforgeV80(result.state)) this.bioforgeLastErrorV80 = 'persistence-failed';
        return result;
      }
    }
  };
  vm.createContext(context);
  vm.runInContext(messages + '\n' + functions.map(fn).join('\n'), context);
  context.bioforgeOwnerV84 = context.currentOwnerV84();
  const startActive = () => {
    assert.equal(context.startBioforgeFromTerminalV80(configuration).started, true);
    let receipt = advanceBioforgeSessionV80(saveSystem.data.bioforgeV80, { now: 101 });
    receipt = advanceBioforgeSessionV80(receipt.state, { now: 102 });
    receipt = advanceBioforgeSessionV80(receipt.state, { now: 103 });
    context.bioforgeRuntimeV80.accept(receipt);
    calls.length = 0;
  };
  return { context, backend, bytes, calls, nodes, saveSystem, startActive };
}

test('application callbacks are wired to real reinforcement and cancellation operations', () => {
  const { context, calls, startActive, saveSystem } = harness();
  context.setupBioforgeUiV80();
  assert.equal(typeof context.bioforgeUiV80.onReinforce, 'function');
  assert.equal(typeof context.bioforgeUiV80.onCancelPending, 'function');
  startActive();
  const candidate = { composition: [{ lineId: 'second', profileId: B, quantity: 2 }] };
  const receipt = context.bioforgeUiV80.onReinforce(candidate, { requestId: 'button-request' });
  assert.equal(receipt.applied, true); assert.equal(saveSystem.data.bioforgeV80.activeSession.quantity, 5);
  assert.equal(calls.find(call => call[0] === 'reinforce')[2].requestId, 'button-request');
  const replay = context.bioforgeUiV80.onReinforce(candidate, { requestId: 'button-request' });
  assert.equal(replay.event.type, 'bioforge-reinforcements-replayed');
  assert.equal(saveSystem.data.bioforgeV80.activeSession.quantity, 5);
  const alive = [...receipt.session.aliveIds];
  const cancelled = context.bioforgeUiV80.onCancelPending({ lineId: 'second' });
  assert.equal(cancelled.applied, true); assert.equal(cancelled.event.cancelled, 2);
  assert.deepEqual(cancelled.session.aliveIds, alive);
  assert.equal(saveSystem.data.bioforgeV80.activeSession.quantity, 5);
});

for (const [name, mutate] of [
  ['epoch', context => { context.profileEpochV78 += 1; }],
  ['profile', context => { context.saveSystem.profile = 2; }],
  ['timeline', context => { context.saveSystem.data.createdAt = 'new-timeline'; }],
  ['view', context => { context.activeView = 'hub'; }],
  ['creator', context => { context.creatorOwnerV84 = {}; }]
]) test(`stale ${name} blocks all operator commands before any runtime call`, () => {
  const { context, calls, startActive, bytes } = harness(); startActive();
  const before = [...bytes]; mutate(context);
  for (const operation of [() => context.startBioforgeFromTerminalV80(configuration),
    () => context.reinforceBioforgeFromTerminalV87({ composition: [{ lineId: 'new', profileId: B, quantity: 1 }] }, { requestId: 'new' }),
    () => context.cancelBioforgeFromTerminalV87({}), () => context.purgeBioforgeFromTerminalV80()]) {
    const receipt = operation(); assert.equal(receipt.applied, false); assert.equal(receipt.reason, 'stale-bioforge-owner');
  }
  assert.equal(context.returnBioforgeToHubV80(), false);
  assert.deepEqual(calls, []); assert.deepEqual([...bytes], before);
});

test('periodic rendering preserves drafts, real population includes descendants, owner change resets once', () => {
  const { context, calls } = harness();
  context.renderBioforgeUiV87(); context.renderBioforgeUiV87();
  const renders = calls.filter(call => call[0] === 'render');
  assert.equal(renders[0][2].resetDraft, true); assert.equal(renders[1][2].resetDraft, false);
  assert.equal(renders[1][2].population.activeCount, 2); assert.equal(renders[1][2].population.activeCost, 4);
  context.profileEpochV78++;
  context.renderBioforgeUiV87(); context.renderBioforgeUiV87();
  const latest = calls.filter(call => call[0] === 'render').slice(-2);
  assert.equal(latest[0][2].resetDraft, true); assert.equal(latest[1][2].resetDraft, false);
  assert.equal(latest[0][2].population, undefined, 'old profile population cannot leak into new UI');
});

test('prepare explicitly reloads draft; command refusals are explained without focus or render success', () => {
  const { context, calls } = harness();
  context.prepareBioforgeViewV80();
  assert.equal(calls.filter(call => call[0] === 'render').at(-1)[2].resetDraft, true);
  calls.length = 0;
  const receipt = context.startBioforgeFromTerminalV80({ composition: [{ lineId: 'bad', profileId: 'enemy-999-boss', quantity: 1 }] });
  assert.equal(receipt.applied, false); assert.match(receipt.message, /onze organismes/);
  assert.equal(calls.some(call => ['focus', 'render'].includes(call[0])), false);
});

test('quota failure keeps saved bytes and cannot appear as a successful reinforcement or unsaved render', () => {
  const { context, calls, backend, bytes, saveSystem, startActive } = harness(); startActive();
  const before = [...bytes], priorState = JSON.stringify(saveSystem.data.bioforgeV80);
  backend.fail = true;
  const receipt = context.reinforceBioforgeFromTerminalV87({ composition: [{ lineId: 'new', profileId: B, quantity: 2 }] }, { requestId: 'quota-request' });
  assert.equal(receipt.applied, false); assert.equal(receipt.reason, 'persistence-failed');
  assert.match(receipt.message, /précédemment enregistrées/);
  assert.deepEqual([...bytes], before); assert.equal(JSON.stringify(saveSystem.data.bioforgeV80), priorState);
  assert.equal(calls.some(call => call[0] === 'render'), false);
});

test('a render exception after durable commit does not falsely claim storage failure', () => {
  const { context, calls, saveSystem } = harness();
  context.bioforgeUiV80.render = () => { throw new Error('DOM failed'); };
  const candidate = structuredClone(saveSystem.data.bioforgeV80); candidate.serial = 9;
  assert.equal(context.persistBioforgeV80(candidate), true);
  assert.equal(saveSystem.data.bioforgeV80.serial, 9);
  assert.ok(calls.some(call => call[0] === 'toast' && /enregistré ; affichage incomplet/.test(call[1])));
  assert.equal(calls.some(call => call[0] === 'toast' && /non sauvegardé/.test(call[1])), false);
});

test('capacity/space events use plain status text, stale events cannot change another timeline', () => {
  const { context, nodes, calls } = harness();
  context.handleBioforgeEventV80({ type: 'bioforge-printer-waiting', reason: 'active-count-capacity' });
  assert.match(nodes.get('bioforge-status-v80').textContent, /CAPACITÉ ACTIVE/);
  context.handleBioforgeEventV80({ type: 'bioforge-printer-blocked' });
  assert.match(nodes.get('bioforge-status-v80').textContent, /EMPLACEMENT SÛR/);
  context.profileEpochV78++; const before = nodes.get('bioforge-status-v80').textContent;
  context.handleBioforgeEventV80({ type: 'bioforge-persistence-failed' });
  assert.equal(nodes.get('bioforge-status-v80').textContent, before); assert.deepEqual(calls, []);
});
