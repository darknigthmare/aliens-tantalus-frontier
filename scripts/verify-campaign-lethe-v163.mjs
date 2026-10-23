import test from 'node:test';
import assert from 'node:assert/strict';
import { openSync, readSync, closeSync, readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS, VEHICLES, CREW, EQUIPMENT } from '../src/content.js';
import { SaveSystem, createDefaultSave, beginOperation, recordOperationResumeState, resolveOperation, migrateSave, getOperationBrief } from '../src/save.js';
import { buildC12HordeLevelV121 } from '../src/c12-horde-runtime-v121.js';
import { buildBlackCocoonLevelV121 } from '../src/black-cocoon-runtime-v121.js';
import { createMissionInsertionV62, applyMissionInsertionActionV62 } from '../src/mission-insertion-v62.js';
import { ARCHIVE_RELAY_DOCUMENT_IDS_V122 } from '../src/archive-relay-state-v122.js';
import { campaignInsertionStoryV163, chooseLetheStoryProtocolV163, letheStoryProtocolV163 } from '../src/campaign-lethe-story-v163.js';
import { createLetheContinuityV163, normalizeLetheContinuityV163, preserveLetheContinuityV163,
  letheContinuityModelV163, recordLetheContinuityReviewV163 } from '../src/campaign-lethe-continuity-v163.js';
import { mountLetheContinuityV163 } from '../src/campaign-lethe-continuity-ui-v163.js';
import { preserveCampaignStoryReturnV160, recordCampaignStoryReviewV160 } from '../src/campaign-story-v160.js';
import { recordCampaignStoryReviewV161 } from '../src/campaign-convoy-story-v161.js';
import { preserveConvoyReturnHistoryV162 } from '../src/campaign-convoy-history-v162.js';
import { mountConvoyReturnHistoryV162 } from '../src/campaign-convoy-history-ui-v162.js';
import { mountCampaignDebriefV160 } from '../src/campaign-story-ui-v160.js';
import { mountCampaignDebriefV161 } from '../src/campaign-convoy-story-ui-v161.js';

const clone = value => structuredClone(value);
const campaign = id => CAMPAIGNS.find(c => c.id === id);
const world = WORLDS.find(w => w.id === 'world-05-lethe');
const withoutNotebook = value => { const out = clone(value); delete out.letheContinuityV163; return out; };

function insertion(selected, id, protocolId = null) {
  let state = createMissionInsertionV62({ operation: { id, campaignId: selected.id, worldId: world.id }, campaign: selected, world });
  while (state.status !== 'completed') {
    if (state.phases[state.currentIndex].kind === 'preparation' && protocolId)
      state = chooseLetheStoryProtocolV163(state, protocolId).state;
    const result = applyMissionInsertionActionV62(state, state.phases[state.currentIndex].requiredAction, { now: state.updatedAt + 100 });
    assert.equal(result.ok, true); state = result.state;
  }
  return state;
}

function host() {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(value) {
      this._src = value; let descriptor, valid = false;
      try {
        descriptor = openSync(new URL(`..${new URL(value, 'http://qa.invalid').pathname}`, import.meta.url), 'r');
        const b = Buffer.alloc(32); readSync(descriptor, b, 0, 32, 0);
        if (b.subarray(1, 4).toString() === 'PNG') { this.naturalWidth = b.readUInt32BE(16); this.naturalHeight = b.readUInt32BE(20); valid = true; }
        else if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(12, 16).toString() === 'VP8X') {
          this.naturalWidth = b.readUIntLE(24, 3) + 1; this.naturalHeight = b.readUIntLE(27, 3) + 1; valid = true;
        }
      } catch {} finally { if (descriptor !== undefined) closeSync(descriptor); }
      queueMicrotask(() => { const e = new Event(valid ? 'load' : 'error'); this.dispatchEvent(e); this[`on${e.type}`]?.(e); });
    }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw Error('Missing shipped source bitmap.'); }
  };
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ measureText: t => ({ width: String(t).length * 8 }), createLinearGradient: () => gradient,
    createRadialGradient: () => gradient }, { get: (target, key) => target[key] ?? (() => {}) });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, style: {}, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    setPointerCapture() {}, hasPointerCapture() { return false; }, releasePointerCapture() {} });
  const pointer = (type, x, y) => {
    const e = new Event(type, { cancelable: true });
    Object.assign(e, { clientX: x, clientY: y, button: 2, buttons: 2, pointerId: 1, pointerType: 'mouse', isPrimary: true });
    canvas.dispatchEvent(e);
  };
  return { canvas, pointer };
}

async function runtime(save, selected, protocolId) {
  const browser = host(), operation = beginOperation(save, selected, world).operation, events = [];
  operation.insertionState = insertion(selected, operation.id, protocolId);
  const engine = new GameEngine(browser.canvas, { onEvent: e => events.push(e) });
  engine.start({ operationId: operation.id, campaign: selected, world, weapon: WEAPONS[0], enemyCatalog: ENEMIES,
    crew: [], equipment: [], seed: 163, missionLevel: (selected.id === 'special-c12-horde' ? buildC12HordeLevelV121 : buildBlackCocoonLevelV121)
      ({ campaign: selected, world, levelSeeds: LEVEL_SEEDS }) });
  browser.canvas.focus(); for (let i = 0; i < 80; i++) await Promise.resolve();
  return { ...browser, engine, events, operation };
}

async function nativeC12(save = createDefaultSave(), { success = true } = {}) {
  const fixture = await runtime(save, campaign('special-c12-horde'), 'lift-review'), e = fixture.engine;
  fixture.pointer('pointerdown', 0, 520);
  for (let frame = 0; frame < (success ? 70 * 60 : 120) && e.mission.state === 'active'; frame++) {
    const state = e.c12HordeV121, keys = new Set();
    if (!state.activated) keys.add('KeyE');
    else if (e.player.x < 1110) keys.add('KeyD');
    if (state.activated) {
      keys.add('KeyF'); if (e.player.ammo === 0) keys.add('KeyR');
      if (state.defenceElapsed >= 45) keys.add('KeyE');
    }
    const target = e.enemies.filter(n => n.alive).sort((a, b) => Math.abs(a.x - e.player.x) - Math.abs(b.x - e.player.x))[0];
    if (target) fixture.pointer('pointermove', target.x + target.w / 2, target.y + target.h / 2);
    e.keys = keys; e.update(1 / 60);
  }
  e.keys.clear();
  if (success) assert.equal(e.mission.state, 'complete');
  assert.equal(recordOperationResumeState(save, e.captureResumeState()), true);
  const result = resolveOperation(save, { success, reason: success ? 'objective' : 'retreat',
    ...(success ? { rewards: fixture.events.find(x => x.type === 'mission-complete').rewards } : {}) });
  assert.equal(result.ok, true); e.stop(); return save;
}

let c12;
const winningC12 = async () => { c12 ||= await nativeC12(); return clone(c12); };

test('Lethe does not grant a chapter from catalogue completion flags or bare success objects', () => {
  const save = createDefaultSave();
  save.galaxy.completedCampaignIds = ['special-c12-horde', 'special-black-cocoon', 'special-archive-relay', 'special-apc-convoy'];
  save.strategy.lastOperation = { id: 'operation-1-special-c12-horde', campaignId: 'special-c12-horde', worldId: world.id, success: true };
  const before = clone(save);
  assert.equal(preserveLetheContinuityV163(save).changed, false); assert.deepEqual(save, before);
  assert.equal(letheContinuityModelV163(save).completed, 0);
  assert.equal(letheContinuityModelV163(save).recommendedCampaignId, 'special-archive-relay');
  assert.deepEqual(normalizeLetheContinuityV163({ schema: 162, chapters: {} }), createLetheContinuityV163());
});

test('both new openings own five authored phases and preparation choices without changing insertion ownership or payment', () => {
  for (const [id, protocol] of [['special-c12-horde', 'pressure-review'], ['special-black-cocoon', 'quarantine-review']]) {
    const selected = campaign(id), operationId = `operation-1-${id}`;
    let state = createMissionInsertionV62({ operation: { id: operationId, campaignId: id, worldId: world.id }, campaign: selected, world });
    assert.equal(chooseLetheStoryProtocolV163(state, protocol).ok, false);
    const observed = [];
    while (state.status !== 'completed') {
      const kind = state.phases[state.currentIndex].kind, model = campaignInsertionStoryV163(state);
      if (model) {
        observed.push(kind); assert.equal(model.canonExact, false); assert.ok(model.lines.length >= 2); assert.ok(model.objective.length > 20);
      }
      if (kind === 'preparation') {
        const before = clone(state); state = chooseLetheStoryProtocolV163(state, protocol, { now: state.updatedAt + 1 }).state;
        assert.equal(state.operationId, before.operationId); assert.deepEqual(state.deployment, before.deployment);
        assert.equal(letheStoryProtocolV163(state).id, protocol);
        assert.equal(chooseLetheStoryProtocolV163({ ...state, paused: true }, protocol).ok, false);
        assert.equal(chooseLetheStoryProtocolV163(state, 'foreign-protocol').ok, false);
      }
      state = applyMissionInsertionActionV62(state, state.phases[state.currentIndex].requiredAction, { now: state.updatedAt + 100 }).state;
    }
    assert.deepEqual(observed, ['briefing', 'preparation', 'approach', 'deployment', 'player-control']);
    assert.equal(state.controlGranted, true); assert.equal(letheStoryProtocolV163(state).id, protocol);
  }
});

test('actual C12 firing, reloading, floor movement and evacuation produce the only accepted fresh chapter receipt', async () => {
  const save = await winningC12(); save.letheContinuityV163 = createLetheContinuityV163();
  const protectedBefore = withoutNotebook(save);
  assert.equal(preserveLetheContinuityV163(save).changed, true);
  const model = letheContinuityModelV163(save), chapter = model.chapters.find(c => c.id === 'c12');
  assert.equal(model.completed, 1); assert.equal(chapter.complete, true);
  assert.equal(chapter.latestReturn.summary.defenceSeconds, 45); assert.equal(chapter.latestReturn.summary.evacuated, true);
  assert.equal(chapter.latestReturn.protocolId, 'lift-review'); assert.deepEqual(withoutNotebook(save), protectedBefore);
  assert.match(chapter.latestReturn.questions.find(q => q.id === 'conduct').answer, /ne signifie pas que tous les contacts/);
  assert.equal(preserveLetheContinuityV163(save).changed, false);
});

test('native terminal identity, owner, result and payout mutations cannot become another chapter', async () => {
  for (const [label, mutate] of [
    ['no resolution', s => { s.strategy.specialOperationResolutionSerialV121 = 0; }],
    ['foreign world', s => { s.strategy.lastOperation.worldId = 'world-elsewhere'; }],
    ['foreign checkpoint', s => { s.strategy.lastOperation.resumeState.specialOperation.deploymentOperationIdV121 = 'operation-2-special-c12-horde'; }],
    ['foreign geometry signature', s => { s.strategy.lastOperation.missionLevelSignature = 'foreign-layout'; }],
    ['no receipt', s => { delete s.strategy.lastOperation.missionRewardsV121; }],
    ['changed payment', s => { s.strategy.lastOperation.missionRewardsV121.credits += 1; }],
    ['premature victory', s => { s.strategy.lastOperation.resumeState.mission.state = 'active'; }],
    ['dead operator', s => { s.strategy.lastOperation.resumeState.player.alive = false; }],
    ['foreign insertion', s => { s.strategy.lastOperation.insertionState.operationId = 'operation-2-special-c12-horde'; }],
    ['still active', s => { s.strategy.currentOperation = clone(s.strategy.lastOperation); }]
  ]) {
    const save = await winningC12(); save.letheContinuityV163 = createLetheContinuityV163(); mutate(save);
    const before = clone(save); assert.equal(preserveLetheContinuityV163(save).changed, false, label); assert.deepEqual(save, before, label);
  }
});

test('a real later C12 retreat retains earlier completion while its own partial facts remain distinct', async () => {
  const save = await winningC12(); preserveLetheContinuityV163(save);
  const first = save.letheContinuityV163.chapters.c12.firstSuccess.operationId;
  await nativeC12(save, { success: false });
  const protectedBefore = withoutNotebook(save); preserveLetheContinuityV163(save);
  const model = letheContinuityModelV163(save), chapter = model.chapters.find(c => c.id === 'c12');
  assert.equal(model.completed, 1); assert.equal(chapter.firstSuccessOperationId, first);
  assert.equal(chapter.latestReturn.success, false); assert.equal(chapter.latestReturn.summary.evacuated, false);
  assert.notEqual(chapter.latestReturn.operationId, first); assert.deepEqual(withoutNotebook(save), protectedBefore);
});

test('explicit question readings are bounded, reloadable and cannot spend resources or replay rewards', async () => {
  const save = await winningC12(); preserveLetheContinuityV163(save);
  const protectedBefore = withoutNotebook(save), id = save.strategy.lastOperation.id;
  for (const topic of ['objective', 'conduct', 'return']) {
    assert.equal(recordLetheContinuityReviewV163(save, 'c12', id, topic).ok, true);
    assert.deepEqual(withoutNotebook(save), protectedBefore);
  }
  assert.equal(recordLetheContinuityReviewV163(save, 'c12', id, 'return').changed, false);
  assert.equal(recordLetheContinuityReviewV163(save, 'c12', 'foreign-operation', 'return').ok, false);
  assert.equal(recordLetheContinuityReviewV163(save, 'foreign-chapter', id, 'return').ok, false);
  const restored = migrateSave(JSON.parse(JSON.stringify(save)));
  const chapter = letheContinuityModelV163(restored).chapters.find(c => c.id === 'c12');
  assert.equal(chapter.latestReturn.readingComplete, true); assert.equal(chapter.latestReturn.selectedTopic, 'return');
  assert.equal(chapter.complete, true);
  restored.strategy.currentOperation = { id: 'operation-999-foreign', campaignId: 'foreign' };
  assert.equal(recordLetheContinuityReviewV163(restored, 'c12', id, 'objective').ok, false);
});

test('a genuine legacy QZ18 six-document dossier survives unrelated operations without a made-up reward or identity', () => {
  const save = createDefaultSave(); save.strategy.specialOperationResolutionSerialV121 = 7;
  save.archiveRelayArchivesV122 = { schema: 122, case: { id: 'qz18-last-relay', operationId: 'operation-7-special-archive-relay',
    verdict: 'delayed-distress', documentIds: [...ARCHIVE_RELAY_DOCUMENT_IDS_V122], completedDay: 1, completedHour: 8 } };
  save.strategy.lastOperation = { id: 'operation-8-foreign', campaignId: 'foreign', worldId: world.id, success: true };
  const protectedBefore = withoutNotebook(save); assert.equal(preserveLetheContinuityV163(save).changed, true);
  assert.equal(letheContinuityModelV163(save).completed, 1); assert.deepEqual(withoutNotebook(save), protectedBefore);
  assert.equal(letheContinuityModelV163(save).recommendedCampaignId, 'special-apc-convoy');
  save.archiveRelayArchivesV122.case.documentIds.pop(); save.letheContinuityV163 = createLetheContinuityV163();
  assert.equal(preserveLetheContinuityV163(save).changed, false);
});

test('a disclosed pre-quarantine fixture still requires actual native deposit and scanner completion before its return can close', async () => {
  const save = createDefaultSave(), selected = campaign('special-black-cocoon');
  const { engine: e, events } = await runtime(save, selected, 'quarantine-review');
  // This is an explicit legacy checkpoint fixture, not observed travel through
  // the colony. The real native râtelier/scanner still own final completion.
  Object.assign(e.blackCocoonV121, { freed: true, freedAtV158: 0, equipmentRecovered: true,
    battery: true, power: 'battery', relayContact: true, route: 'industrial', liftProgress: 6,
    surfaceReached: true, deltaAbandoned: true, beacons: [true, true], extractionElapsed: 90,
    boarded: true, elapsed: 100 });
  e.enterBlackCocoonQuarantineV121(true); e.syncBlackCocoonWorldV121();
  let stage = 'deposit';
  for (let frame = 0; frame < 30 * 60 && e.mission.state === 'active'; frame++) {
    const x = e.player.x + e.player.w / 2, target = stage === 'deposit' ? 420 : 850;
    e.keys = new Set(Math.abs(x - target) > 25 ? [x < target ? 'KeyD' : 'KeyA'] : ['KeyE']);
    e.update(1 / 60); if (e.blackCocoonV121.weaponsDeposited) stage = 'scanner';
  }
  e.keys.clear(); assert.equal(e.mission.state, 'complete');
  assert.equal(recordOperationResumeState(save, e.captureResumeState()), true);
  assert.equal(resolveOperation(save, { success: true, rewards: events.find(x => x.type === 'mission-complete').rewards }).ok, true);
  const protectedBefore = withoutNotebook(save); preserveLetheContinuityV163(save);
  const entry = letheContinuityModelV163(save).chapters.find(c => c.id === 'cocoon').latestReturn;
  assert.equal(entry.summary.quarantineComplete, true); assert.equal(entry.summary.boarded, true);
  assert.match(entry.questions.find(q => q.id === 'return').answer, /armes ont été déposées/);
  assert.deepEqual(withoutNotebook(save), protectedBefore); e.stop();
});

test('normalization keeps at most four bounded chapters and detaches nested reading data', async () => {
  const save = await winningC12(); preserveLetheContinuityV163(save);
  const normalized = normalizeLetheContinuityV163(save.letheContinuityV163,
    { resolvedSerial: save.strategy.specialOperationResolutionSerialV121 });
  assert.equal(Object.keys(normalized.chapters).length, 4);
  normalized.chapters.c12.latestReturn.readTopics.push('foreign');
  assert.notDeepEqual(normalized, save.letheContinuityV163);
  const model = letheContinuityModelV163(save); model.chapters[2].latestReturn.summary.defenceSeconds = 0;
  assert.equal(save.letheContinuityV163.chapters.c12.latestReturn.summary.defenceSeconds, 45);
  assert.deepEqual(normalizeLetheContinuityV163(save.letheContinuityV163, { resolvedSerial: 0 }), createLetheContinuityV163());
});

test('contradictory imported facts for the same resolved operation cannot invent a second return', async () => {
  const original = await winningC12(), first = clone(original.letheContinuityV163.chapters.c12.firstSuccess);
  for (const mutate of [
    latest => {
      latest.success = false; latest.reason = 'retreat'; latest.receipt.success = false;
      latest.summary.returnConfirmed = false; latest.summary.evacuated = false;
    },
    latest => { latest.summary.cargoRecovered = !latest.summary.cargoRecovered; },
    latest => { latest.protocolId = 'pressure-review'; }
  ]) {
    const save = clone(original), latest = save.letheContinuityV163.chapters.c12.latestReturn;
    mutate(latest); latest.readTopics = ['return']; latest.activeTopic = 'return';
    const before = clone(save), protectedBefore = withoutNotebook(save);
    const normalized = normalizeLetheContinuityV163(save.letheContinuityV163,
      { resolvedSerial: save.strategy.specialOperationResolutionSerialV121 });
    assert.deepEqual(save, before, 'normalization does not mutate the imported source');
    assert.deepEqual(normalized.chapters.c12.firstSuccess, first);
    assert.deepEqual(normalized.chapters.c12.latestReturn, first, 'only the original confirmed return is retained');
    const restored = migrateSave(JSON.parse(JSON.stringify(save)));
    assert.deepEqual(restored.letheContinuityV163, normalized);
    const model = letheContinuityModelV163(restored), chapter = model.chapters.find(c => c.id === 'c12');
    assert.equal(model.completed, 1); assert.equal(chapter.latestReturn.success, true);
    assert.equal(chapter.latestReturn.summary.evacuated, true); assert.equal(chapter.latestReturn.readingComplete, false);
    assert.deepEqual(withoutNotebook(save), protectedBefore);
    assert.deepEqual(normalizeLetheContinuityV163(normalized,
      { resolvedSerial: save.strategy.specialOperationResolutionSerialV121 }), normalized, 'the repair is idempotent');
  }
  const readingsOnly = clone(original.letheContinuityV163);
  readingsOnly.chapters.c12.latestReturn.readTopics = ['conduct'];
  readingsOnly.chapters.c12.latestReturn.activeTopic = 'conduct';
  const retained = normalizeLetheContinuityV163(readingsOnly,
    { resolvedSerial: original.strategy.specialOperationResolutionSerialV121 });
  assert.deepEqual(retained.chapters.c12.latestReturn.readTopics, ['conduct'], 'honest later readings of identical facts are retained');
  assert.equal(retained.chapters.c12.latestReturn.activeTopic, 'conduct');
});

test('native Save hooks retain an older return before an unrelated mission and cannot resolve its payment twice', async () => {
  const save = await winningC12();
  assert.equal(letheContinuityModelV163(save).completed, 1, 'native resolution writes the notebook in the same transaction');
  const owner = save.strategy.lastOperation.id;
  delete save.letheContinuityV163;
  const other = CAMPAIGNS.find(c => !c.specialOperationId && save.galaxy.unlockedWorldIds.includes(c.worldId));
  assert.ok(beginOperation(save, other, WORLDS.find(w => w.id === other.worldId)).operation);
  assert.equal(save.letheContinuityV163.chapters.c12.firstSuccess.operationId, owner);
  assert.equal(resolveOperation(save, { success: false, reason: 'retreat' }).ok, true);
  const paid = clone(save);
  assert.equal(resolveOperation(save, { success: true }).ok, false); assert.deepEqual(save, paid);
  const restored = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.equal(restored.letheContinuityV163.chapters.c12.firstSuccess.operationId, owner);
  assert.equal(restored.letheContinuityV163.chapters.c12.latestReturn.operationId, owner);
});

test('the actual app renderer atomically selects plans and records readings while preserving focus on storage failure', async () => {
  // Reuse only the existing test's generic DOM host; the executed renderer,
  // callbacks, UI module and SaveSystem below are the production functions.
  const domSource = readFileSync(new URL('./verify-campaign-story-v160.mjs', import.meta.url), 'utf8');
  const domStart = domSource.indexOf('function storyDocument() {'), domEnd = domSource.indexOf('\nconst insertion =', domStart);
  const { document, root } = new Function(`${domSource.slice(domStart, domEnd)};return storyDocument();`)();
  const values = new Map(), errors = [], launches = [];
  let rejectStorage = false, launch;
  const system = new SaveSystem({ getItem: k => values.get(k) ?? null, removeItem: k => values.delete(k),
    setItem(k, v) { if (rejectStorage) throw Error('disclosed storage failure'); values.set(k, v); } });
  system.newGame(1); system.commit(await winningC12());
  Object.defineProperty(root, 'innerHTML', { set() {
    root.replaceChildren(); launch = document.createElement('button'); root.append(launch);
  } });
  const dependencies = { saveSystem: system, clone, CAMPAIGNS, WORLDS, CREW, WEAPONS, EQUIPMENT, VEHICLES,
    preserveCampaignStoryReturnV160, preserveConvoyReturnHistoryV162, preserveLetheContinuityV163,
    recordCampaignStoryReviewV160, recordCampaignStoryReviewV161, recordLetheContinuityReviewV163,
    mountCampaignDebriefV160, mountCampaignDebriefV161, mountConvoyReturnHistoryV162, mountLetheContinuityV163,
    getOperationBrief, resolveCrewDefinitionV85: m => m, getSpecialOperationByCampaignIdV67: () => null,
    isSoloSpecialOperationV131: () => true, getAlphaBravoStrategicRecoveryV69: () => ({ canAbandon: false }),
    APC_CONVOY_CAMPAIGN_V121: campaign('special-apc-convoy'), BLACK_COCOON_CAMPAIGN_V121: campaign('special-black-cocoon'),
    ARCHIVE_RELAY_CAMPAIGN_V122: campaign('special-archive-relay'), escapeHtml: String, formatCost: () => '',
    byId: id => id === 'operation-plan' ? root : id === 'operation-launch' ? launch : null,
    launchCampaign: c => launches.push(c.id), abandonBlockedOperationV69() {}, renderCommandMissionsV110() {},
    toast: message => errors.push(message) };
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const start = app.indexOf('function renderOperationPlan() {'), end = app.indexOf('\nfunction procurementActionsV62(', start);
  const render = new Function(...Object.keys(dependencies), `${app.slice(start, end)};return renderOperationPlan;`)(...Object.values(dependencies));
  render();
  assert.equal(root.querySelectorAll('[data-lethe-chapter]').length, 4);
  const before = clone(system.data), button = root.querySelector('[data-lethe-review="conduct"]');
  button.focus(); button.click();
  assert.equal(document.activeElement, button, 'reading does not replace the focus owner');
  assert.equal(root.contains(button), true); assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(system.data.letheContinuityV163.chapters.c12.latestReturn.activeTopic, 'conduct');
  assert.deepEqual(withoutNotebook(system.data).galaxy, withoutNotebook(before).galaxy);
  const previousAnswer = root.querySelector('[data-lethe-answer]').textContent;
  const previousData = clone(system.data), previousRaw = new Map(values);
  rejectStorage = true;
  const failed = root.querySelector('[data-lethe-review="return"]'); failed.focus(); failed.click();
  assert.equal(document.activeElement, failed); assert.equal(failed.getAttribute('aria-pressed'), 'false');
  assert.equal(root.querySelector('[data-lethe-answer]').textContent, previousAnswer);
  assert.deepEqual(system.data, previousData); assert.deepEqual(values, previousRaw); assert.equal(errors.length, 1);
  rejectStorage = false;
  const expected = clone(system.data); expected.strategy.plannedCampaignId = 'special-black-cocoon';
  root.querySelector('[data-lethe-plan="special-black-cocoon"]').click();
  const selected = clone(system.data); delete selected.updatedAt; delete expected.updatedAt;
  assert.deepEqual(selected, expected); assert.equal(launches.length, 0);
  assert.equal(document.activeElement, launch, 'the selected native launch control receives focus without deployment');
});
