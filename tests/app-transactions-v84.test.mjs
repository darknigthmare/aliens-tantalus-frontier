import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { SaveSystem, SAVE_PREFIX, createDefaultSave } from '../src/save.js';
import { WORLDS } from '../src/content.js';
import { ONBOARDING_DIALOGUES_V84, advancePlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { ShipCompanionControllerV87 } from '../src/ship-companion-controller-v87.js';

// Run the real application functions with an in-memory SaveSystem and UI/engine ports.
// No copied transaction implementation, filesystem writes, DOM or browser global is needed.
const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
function functionSource(name) {
  const single = source.match(new RegExp(`^function ${name}\\([^\\n]*\\}\\r?$`, 'm'));
  const block = source.match(new RegExp(`^function ${name}\\([^]*?^\\}`, 'm'));
  const result = single?.[0] || block?.[0];
  assert.ok(result, `missing application function ${name}`);
  return result;
}
const creatorSource = source.match(/const playerCreatorUiV84 = new PlayerCreatorUiV84\(\{[^]*?\r?\n\}\);/)?.[0];
const importSource = source.match(/  byId\('save-import'\)\.onchange = async \(event\) => \{[^]*?\r?\n  \};/)?.[0];
const unloadBody = source.match(/globalThis\.addEventListener\('beforeunload', \(\) => \{([^]*?)\r?\n  \}\);/)?.[1];
assert.ok(creatorSource && importSource && unloadBody, 'application transaction handlers must remain present');
const bioforgeMessagesSource = source.match(/const BIOFORGE_EVENT_MESSAGES_V80 = Object\.freeze\(\{[^]*?\r?\n\}\);/)?.[0];
assert.ok(bioforgeMessagesSource, 'BIOFORGE event messages must remain present');

function harness() {
  const values = new Map();
  const backend = {
    denied: null, values,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { if (this.denied === key) throw new Error('quota denied'); values.set(key, value); },
    removeItem(key) { values.delete(key); }
  };
  const saveSystem = new SaveSystem(backend);
  saveSystem.newPlayerTimelineV84({ name: 'Alex Moreau', callsign: 'FOX-9' }, 1);
  saveSystem.commit({ onboardingV84: advancePlayerOnboardingV84(saveSystem.data.onboardingV84, 'wake-confirmed').state });
  const nodes = new Map();
  const calls = [];
  const context = {
    saveSystem, WORLDS, Date, Object, JSON, Math, structuredClone, clone: structuredClone,
    ONBOARDING_DIALOGUES_V84, advancePlayerOnboardingV84,
    standaloneContext: null, forgePlaytest: null, activeView: 'hub', activeHubStation: null,
    profileEpochV78: 1, profileImportRequestV78: 0, creatorOwnerV84: null, hubOwnerV84: null, bioforgeOwnerV84: null,
    pendingOnboardingDialogV84: null, pendingHubInteraction: null, pendingNpcConversationV62: null,
    pendingMissionLaunchV62: {}, missionOwnerV78: {}, sessionStart: Date.now(), activeWorld: WORLDS[0],
    byId(id) {
      if (!nodes.has(id)) nodes.set(id, { hidden: false, value: '', textContent: '', replaceChildren() {}, classList: { add() {} } });
      return nodes.get(id);
    },
    hubDialogueUiV76: {
      openState: false,
      close(options) { calls.push(['close-dialogue', options]); const previous = this.openState; this.openState = false; return previous; },
      destroy() { calls.push(['destroy-dialogue']); this.openState = false; }
    },
    hubEngine: {
      state: { deck: 0, visited: ['cryo-bay'] }, player: { x: 4500, facing: -1 },
      currentRoom: () => ({ id: 'cryo-bay' }), stop: (...args) => calls.push(['hub-stop', ...args]),
      resume: () => calls.push(['hub-resume']), setOnboardingV84: () => calls.push(['set-onboarding']),
      onboardingContactV84: () => ({ phase: 'medical', crewId: 'crew-10-david-8r' }),
      pause() { context.persistHub({ positionX: 4500 }); calls.push(['hub-pause']); }
    },
    engine: { stop: () => calls.push(['mission-stop']) },
    bioforgeRuntimeV80: {
      stop(options) {
        calls.push(['bioforge-stop', options]);
        // This mirrors stop -> purge -> persist in the actual BIOFORGE runtime.
        if (context.oldBioforgeActive && options.purge !== false) context.persistBioforgeV80(context.oldBioforgeState);
      }
    },
    oldBioforgeActive: false, oldBioforgeState: null, bioforgeUiV80: null,
    titleScreen: { hide: () => calls.push(['title-hide']), show: () => calls.push(['title-show']), openMenu: () => calls.push(['title-menu']) },
    PlayerCreatorUiV84: class {
      constructor(options) {
        Object.assign(this, options);
        this.dialog = { open: false, close: () => { this.dialog.open = false; calls.push(['creator-close']); } };
      }
      open() { this.dialog.open = true; }
    },
    closeHubStation(options) { calls.push(['close-station', options]); context.activeHubStation = null; },
    destroyMissionInsertionUiV62: () => calls.push(['destroy-insertion']),
    ensureAdvancedState() {}, applyRuntimeSettings() {}, renderAll() {}, renderProfiles() {}, renderHubStatus() {},
    showView: (view) => calls.push(['show-view', view]), toast: (message) => calls.push(['toast', message]),
    captureMissionResumeState: () => null, recordOperationResumeState() {}, persistMissionResumeState() {},
    audio: { dispose: () => calls.push(['audio-dispose']) }
  };
  // Exercise the actual controller close method: it must clear its active-time
  // remainder and close silently, never resume a runtime owned by the old profile.
  context.shipCompanionControllerV87 = Object.assign(Object.create(ShipCompanionControllerV87.prototype), {
    tickRemainder: .15,
    previousActors: [{ animalId: 'old-profile-moka', x: 600 }],
    ui: { isOpen: false, close(options) {
      calls.push(['close-companions', options]); this.isOpen = false;
      if (options?.notify !== false) context.hubEngine.resume();
    } }
  });
  vm.createContext(context);
  const names = ['currentOwnerV84', 'ownsTimelineV84', 'captureHubPoseV84', 'closeHubDialogue', 'persistHub',
    'persistBioforgeV80', 'handleBioforgeEventV80', 'discardProfileRuntimeV78', 'openPlayerCreatorV84', 'commitOnboardingEventV84',
    'openOnboardingDialogueV84', 'handleHubAction', 'commitCurrentRuntimeV78'];
  vm.runInContext(bioforgeMessagesSource + '\n' + names.map(functionSource).join('\n') + '\n' + creatorSource
    + '\nglobalThis.creatorUI=playerCreatorUiV84;\n' + importSource
    + '\nglobalThis.beforeUnload=()=>{' + unloadBody + '\n};', context);
  context.hubOwnerV84 = context.currentOwnerV84();
  context.bioforgeOwnerV84 = context.currentOwnerV84();
  return { context, backend, calls, nodes, saveSystem };
}
const importBytes = (name) => {
  const save = createDefaultSave();
  save.needsPlayerCreationV84 = false;
  save.player.name = name;
  save.bioforgeV80.serial = 3;
  return JSON.stringify(save);
};
function deferredImport(nodes) {
  let resolve;
  const read = new Promise((done) => { resolve = done; });
  const event = { target: { files: [{ text: () => read }], value: 'selected-file' } };
  const completion = nodes.get('save-import').onchange(event);
  return { resolve, completion, event };
}

test('application persistHub keeps both in-memory hub and bytes unchanged on write failure', () => {
  const { context, backend, saveSystem } = harness();
  const root = saveSystem.data;
  const before = JSON.stringify(root);
  const bytes = backend.values.get(SAVE_PREFIX + '1');
  backend.denied = SAVE_PREFIX + '1';
  assert.throws(() => context.persistHub({ positionX: 777 }), (error) => error.code === 'SAVE_WRITE_FAILED');
  assert.equal(saveSystem.data, root);
  assert.equal(JSON.stringify(root), before);
  assert.equal(backend.values.get(SAVE_PREFIX + '1'), bytes);
});

test('stale hub callbacks and creator-time autosaves cannot modify the active profile', () => {
  const { context, backend } = harness();
  const before = [...backend.values];
  context.profileEpochV78 += 1;
  context.persistHub({ positionX: 777 });
  assert.deepEqual([...backend.values], before);
  context.hubOwnerV84 = context.currentOwnerV84();
  context.creatorOwnerV84 = { ...context.currentOwnerV84(), target: 2 };
  context.persistHub({ positionX: 888 });
  context.commitCurrentRuntimeV78({ includeSessionTime: true });
  assert.deepEqual([...backend.values], before);
});

test('failed pause-write while talking to DAVID is caught and explained without opening the dialogue', () => {
  const { context, backend, calls, saveSystem } = harness();
  const before = JSON.stringify(saveSystem.data);
  backend.denied = SAVE_PREFIX + '1';
  assert.equal(context.handleHubAction({ action: 'hub:onboarding-dialogue', crewId: 'crew-10-david-8r' }), false);
  assert.equal(JSON.stringify(saveSystem.data), before);
  assert.equal(context.pendingOnboardingDialogV84, null);
  assert.equal(context.hubDialogueUiV76.openState, false);
  assert.ok(calls.some(([kind, text]) => kind === 'toast' && /Sauvegarde impossible/.test(text)));
});

test('creator submit rejects changed owner or foreign-tab target bytes without replacing a slot', () => {
  for (const change of ['owner', 'foreign-target']) {
    const { context, backend, saveSystem } = harness();
    context.openPlayerCreatorV84(2);
    if (change === 'owner') context.profileEpochV78 += 1;
    else backend.values.set(SAVE_PREFIX + '2', importBytes('Autre onglet'));
    const before = [...backend.values];
    const root = saveSystem.data;
    assert.throws(() => context.creatorUI.onSubmit({ name: 'Morgan Shaw', callsign: 'FOX-2' }), /profil a changé/i);
    assert.equal(saveSystem.data, root);
    assert.deepEqual([...backend.values], before);
  }
});

test('creator submit write failure preserves its owner, draft modal and original active timeline', () => {
  const { context, backend, saveSystem } = harness();
  context.openPlayerCreatorV84(2);
  const owner = context.creatorOwnerV84;
  const root = saveSystem.data;
  const before = [...backend.values];
  backend.denied = SAVE_PREFIX + '2';
  assert.throws(() => context.creatorUI.onSubmit({ name: 'Morgan Shaw', callsign: 'FOX-2' }), (error) => error.code === 'SAVE_WRITE_FAILED');
  assert.equal(context.creatorOwnerV84, owner);
  assert.equal(context.creatorUI.dialog.open, true);
  assert.equal(saveSystem.data, root);
  assert.equal(saveSystem.profile, 1);
  assert.deepEqual([...backend.values], before);
});

test('successful creator submit switches only after writing and completion invalidates old runtimes without cancellation', () => {
  const { context, backend, calls, saveSystem } = harness();
  const primary = backend.values.get(SAVE_PREFIX + '1');
  context.openPlayerCreatorV84(2);
  context.creatorUI.onSubmit({ name: 'Morgan Shaw', callsign: 'FOX-2' });
  context.creatorUI.onComplete();
  assert.equal(saveSystem.profile, 2);
  assert.equal(saveSystem.data.player.name, 'Morgan Shaw');
  assert.equal(backend.values.get(SAVE_PREFIX + '1'), primary);
  assert.equal(context.creatorOwnerV84, null);
  assert.equal(context.hubOwnerV84, null);
  assert.equal(context.creatorUI.dialog.open, false);
  assert.equal(context.shipCompanionControllerV87.tickRemainder, 0);
  assert.deepEqual(context.shipCompanionControllerV87.previousActors, []);
  assert.deepEqual(calls.filter(([kind]) => kind === 'close-companions'), [['close-companions', { notify: false }]]);
  assert.equal(calls.some(([kind]) => kind === 'title-menu'), false);
  assert.ok(calls.some(([kind, view]) => kind === 'show-view' && view === 'hub'));
});

test('discard closes stale hub/native modals without resume or cancellation when owner changes', () => {
  const { context, calls } = harness();
  context.hubDialogueUiV76.openState = true;
  context.pendingOnboardingDialogV84 = { owner: context.currentOwnerV84(), phase: 'medical', node: 0 };
  context.creatorOwnerV84 = { ...context.currentOwnerV84(), target: 2 };
  context.creatorUI.dialog.open = true;
  context.shipCompanionControllerV87.ui.isOpen = true;
  context.discardProfileRuntimeV78();
  assert.equal(context.hubDialogueUiV76.openState, false);
  assert.equal(context.creatorUI.dialog.open, false);
  assert.equal(context.pendingOnboardingDialogV84, null);
  assert.equal(context.creatorOwnerV84, null);
  assert.equal(context.hubOwnerV84, null);
  assert.equal(context.profileEpochV78, 2);
  assert.equal(context.shipCompanionControllerV87.ui.isOpen, false);
  assert.equal(context.shipCompanionControllerV87.tickRemainder, 0);
  assert.deepEqual(calls.filter(([kind]) => kind === 'close-companions'), [['close-companions', { notify: false }]]);
  assert.equal(calls.some(([kind]) => ['hub-resume', 'title-menu'].includes(kind)), false);
});

test('a file import completed while an old dialogue is open closes that dialogue and rejects old autosave callbacks', async () => {
  const { context, nodes, backend, saveSystem, calls } = harness();
  const pending = deferredImport(nodes);
  context.hubDialogueUiV76.openState = true;
  context.shipCompanionControllerV87.ui.isOpen = true;
  context.pendingOnboardingDialogV84 = { owner: context.currentOwnerV84(), phase: 'medical', node: 0 };
  pending.resolve(importBytes('Imported operator'));
  await pending.completion;
  assert.equal(saveSystem.data.player.name, 'Imported operator');
  assert.equal(context.hubDialogueUiV76.openState, false);
  assert.equal(context.pendingOnboardingDialogV84, null);
  assert.equal(context.shipCompanionControllerV87.ui.isOpen, false);
  assert.equal(context.shipCompanionControllerV87.tickRemainder, 0);
  assert.deepEqual(calls.filter(([kind]) => kind === 'close-companions'), [['close-companions', { notify: false }]]);
  assert.equal(calls.some(([kind]) => kind === 'hub-resume'), false);
  const bytes = backend.values.get(SAVE_PREFIX + '1');
  context.persistHub({ positionX: 777 });
  assert.equal(backend.values.get(SAVE_PREFIX + '1'), bytes);
  assert.equal(pending.event.target.value, '');
});

test('a file import completed during a creator draft invalidates the draft without submitting it', async () => {
  const { context, nodes, backend, saveSystem } = harness();
  const pending = deferredImport(nodes);
  context.openPlayerCreatorV84(2);
  assert.equal(context.creatorUI.dialog.open, true);
  pending.resolve(importBytes('Imported operator'));
  await pending.completion;
  assert.equal(saveSystem.data.player.name, 'Imported operator');
  assert.equal(context.creatorUI.dialog.open, false);
  assert.equal(context.creatorOwnerV84, null);
  assert.equal(backend.values.has(SAVE_PREFIX + '2'), false);
});

test('an old import cannot replace a newly selected active profile', async () => {
  const { context, nodes, backend, saveSystem, calls } = harness();
  backend.values.set(SAVE_PREFIX + '2', importBytes('Second profile'));
  const pending = deferredImport(nodes);
  saveSystem.load(2);
  context.discardProfileRuntimeV78();
  const bytes = [...backend.values];
  pending.resolve(importBytes('Late import'));
  await pending.completion;
  assert.equal(saveSystem.profile, 2);
  assert.equal(saveSystem.data.player.name, 'Second profile');
  assert.deepEqual([...backend.values], bytes);
  assert.ok(calls.some(([kind, text]) => kind === 'toast' && /changé pendant la lecture/.test(text)));
});

test('out-of-order file reads retain only the newest import request', async () => {
  const { nodes, saveSystem, backend } = harness();
  const first = deferredImport(nodes);
  const second = deferredImport(nodes);
  second.resolve(importBytes('Newest import'));
  await second.completion;
  const bytes = [...backend.values];
  first.resolve(importBytes('Obsolete import'));
  await first.completion;
  assert.equal(saveSystem.data.player.name, 'Newest import');
  assert.deepEqual([...backend.values], bytes);
});

test('profile discard must stop old BIOFORGE without persisting its purge into the imported timeline', async () => {
  const { context, nodes, saveSystem } = harness();
  const pending = deferredImport(nodes);
  context.oldBioforgeActive = true;
  context.oldBioforgeState = structuredClone(saveSystem.data.bioforgeV80);
  context.oldBioforgeState.serial = 77;
  pending.resolve(importBytes('Imported operator'));
  await pending.completion;
  assert.equal(saveSystem.data.player.name, 'Imported operator');
  assert.equal(saveSystem.data.bioforgeV80.serial, 3, 'old BIOFORGE purge must not replace imported BIOFORGE state');
  assert.equal(context.bioforgeOwnerV84, null);
});

test('owned BIOFORGE persistence commits a detached root before rendering its saved state', () => {
  const { context, backend, saveSystem } = harness();
  const candidate = structuredClone(saveSystem.data.bioforgeV80);
  candidate.serial = 7;
  let renders = 0;
  context.bioforgeUiV80 = { render(state) {
    renders += 1;
    assert.equal(state, saveSystem.data.bioforgeV80);
    assert.equal(JSON.parse(backend.values.get(SAVE_PREFIX + '1')).bioforgeV80.serial, 7);
  } };
  assert.equal(context.persistBioforgeV80(candidate), true);
  candidate.serial = 99;
  assert.equal(saveSystem.data.bioforgeV80.serial, 7);
  assert.equal(renders, 1);
});

test('BIOFORGE write failure preserves active data and bytes without rendering an unsaved state', () => {
  const { context, backend, calls, saveSystem } = harness();
  const root = saveSystem.data;
  const before = JSON.stringify(root);
  const bytes = [...backend.values];
  let renders = 0;
  context.bioforgeUiV80 = { render() { renders += 1; } };
  backend.denied = SAVE_PREFIX + '1';
  const candidate = structuredClone(root.bioforgeV80);
  candidate.serial = 99;
  assert.equal(context.persistBioforgeV80(candidate), false);
  assert.equal(saveSystem.data, root);
  assert.equal(JSON.stringify(root), before);
  assert.deepEqual([...backend.values], bytes);
  assert.equal(renders, 0);
  assert.ok(calls.some(([kind, message]) => kind === 'toast' && /BIOFORGE non sauvegardé/.test(message)));
});

test('stale BIOFORGE callbacks cannot persist or replace status after a timeline owner changes', () => {
  const { context, backend, calls, saveSystem } = harness();
  const status = context.byId('bioforge-status-v80');
  status.textContent = 'NEW PROFILE STATUS';
  const bytes = [...backend.values];
  const before = JSON.stringify(saveSystem.data);
  context.profileEpochV78 += 1;
  assert.equal(context.persistBioforgeV80({ serial: 99 }), false);
  context.handleBioforgeEventV80({ type: 'bioforge-asset-error', assetId: 'stale-image' });
  context.handleBioforgeEventV80({ type: 'bioforge-exit-locked' });
  assert.deepEqual([...backend.values], bytes);
  assert.equal(JSON.stringify(saveSystem.data), before);
  assert.equal(status.textContent, 'NEW PROFILE STATUS');
  assert.deepEqual(calls, []);
});

test('unload during creation or a first-visit options save cannot commit the provisional timeline', () => {
  for (const mode of ['creator', 'needs-creation']) {
    const { context, backend, calls, saveSystem } = harness();
    if (mode === 'creator') context.creatorOwnerV84 = { ...context.currentOwnerV84(), target: 2 };
    else saveSystem.data.needsPlayerCreationV84 = true;
    const bytes = [...backend.values];
    context.beforeUnload();
    assert.deepEqual([...backend.values], bytes);
    assert.deepEqual(calls, []);
  }
});
