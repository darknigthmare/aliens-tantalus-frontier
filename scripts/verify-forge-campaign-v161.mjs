import test from 'node:test';
import assert from 'node:assert/strict';
import { ForgeCampaignStoreV161, ForgeCampaignControllerV161, FORGE_CAMPAIGN_KEY_V161,
  parseForgeCampaignV161, createForgeCampaignV161, forgeCampaignCursorV161 } from '../src/forge-campaign-v161.js';
import { missionV136, hostV136 } from './forge-native-host-v136.mjs';
import { HubGame } from '../src/hub-v51-runtime.js';
import { withForgeShipRuntimeV141 } from '../src/forge-ship-runtime-v141.js';
import { openForgeNarrativeV156, chooseForgeNarrativeV156 } from '../src/forge-narrative-v156.js';

function project(kind = 'mission', name = kind) {
  const floor = kind === 'mission' ? 16 : 15;
  return { id: `project-${kind}`, schema: 3, kind, name, activeRoomId: 'a', links: [], rooms: [
    { id: 'a', name: 'Relais', size: [32, 18], cells: [
      ...Array.from({ length: 32 }, (_, x) => ({ id: `f-${x}`, x, y: floor, type: 'floor', layer: 'structure' })),
      { id: 'spawn', x: 1, y: floor - 1, type: 'spawn', layer: 'gameplay' },
      { id: 'goal', x: 4, y: floor - 1, type: 'objective', layer: 'gameplay' }
    ] } ] };
}
function storage() { const data = new Map(); return { data, getItem: key => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) }; }
function fresh() { const disk = storage(), store = new ForgeCampaignStoreV161(disk); store.load();
  store.create('Relais local', [project(), project('ship')], { now: 100, campaignId: 'run-1' }); return { disk, store }; }
function nativeController(t, store) {
  let current = null; const events = [];
  const controller = new ForgeCampaignControllerV161(store, {
    getEngine: () => current,
    launch(input) {
      current?.stop(false);
      if (input.kind === 'mission') {
        const fixture = missionV136({ editorProject: input, forgeJourneyV141: true });
        current = fixture.engine; events.push(...fixture.messages);
      } else {
        const host = hostV136(); current = new (withForgeShipRuntimeV141(HubGame))(host.canvas, { onAction: event => events.push(event) });
        current.start({}, { editorProject: input, forgeJourneyV141: true });
      }
      for (let i = 0; i < 40; i++) current.update(1 / 60);
      t.after(() => current?.stop(false)); return current;
    }
  });
  return { controller, get engine() { return current; }, events };
}
function walkToGoal(engine) {
  engine.keys.add('KeyD');
  for (let i = 0; i < 2000; i++) {
    const goal = engine.objective || engine.v51Objectives[0];
    if (Math.abs(engine.player.x + engine.player.w / 2 - goal.x - goal.w / 2) < 65) break;
    engine.update(1 / 60);
  }
  engine.keys.delete('KeyD');
}
function finish(runtime) { walkToGoal(runtime.engine); runtime.engine.interact(); if (runtime.engine.mission?.state === 'active') runtime.engine.interact(); }

test('recipe admits every native stage, freezes source documents and enforces 2–16/8MiB limits', () => {
  const a = project(), b = project('ship'), recipe = createForgeCampaignV161('Les relais', [a,b], { now: 5, campaignId: 'run' });
  a.rooms[0].cells.length = 0; assert.ok(recipe.stages[0].project.rooms[0].cells.length);
  assert.equal(recipe.stages[0].project.id, undefined); assert.equal(recipe.stages[0].workspaceProjectId, a.id);
  assert.throws(() => createForgeCampaignV161('Court', [b]), /2 à 16/);
  assert.throws(() => createForgeCampaignV161('Long', Array(17).fill(b)), /2 à 16/);
  const invalid = project(); invalid.rooms[0].cells = invalid.rooms[0].cells.filter(cell => cell.type !== 'floor');
  assert.throws(() => createForgeCampaignV161('Invalide', [b,invalid]), /refus|support|sol|objectif/i);
  assert.throws(() => parseForgeCampaignV161(' '.repeat(8 * 1024 * 1024 + 1)), /8 Mio/);
});

test('real Mission extraction and Ship objective unlock an ordered campaign across a fresh JSON/store/controller', t => {
  const { store, disk } = fresh(), first = nativeController(t, store); first.controller.launchCurrent();
  assert.equal(first.controller.completeNative(), false); finish(first);
  assert.equal(first.engine.mission.state, 'complete'); assert.equal(first.engine.mission.rewards.scope, 'forge-playtest');
  assert.equal(first.controller.completeNative(), true); assert.equal(forgeCampaignCursorV161(store.data), 1);
  assert.equal(first.controller.completeNative(), false); assert.equal(store.data.revision, 1);
  const nextStore = new ForgeCampaignStoreV161(disk); nextStore.load(); const next = nativeController(t, nextStore);
  assert.equal(nextStore.data.stages[0].result.objectiveIds[0], 'goal'); next.controller.launchCurrent();
  assert.equal(next.engine.forgeSessionV141.kind, 'ship'); finish(next);
  assert.equal(next.engine.forgeSessionV141.complete, true); assert.equal(next.controller.completeNative(), true);
  assert.equal(forgeCampaignCursorV161(nextStore.data), -1); assert.equal(nextStore.data.revision, 2);
  assert.throws(() => next.controller.launchCurrent(), /aucune étape/);
  assert.ok(next.events.some(event => event.action === 'editor:project-complete'));
  assert.deepEqual([...disk.data.keys()], [FORGE_CAMPAIGN_KEY_V161], 'no campaign profile, authoring or checkpoint key is written');
});

test('a failed or stopped unfinished stage never advances and restart begins the same frozen stage', t => {
  const { store } = fresh(), runtime = nativeController(t, store); runtime.controller.launchCurrent();
  runtime.engine.mission.state = 'failed'; assert.equal(runtime.controller.completeNative(), false);
  runtime.controller.detach(); assert.equal(forgeCampaignCursorV161(store.data), 0);
  runtime.controller.launchCurrent(); assert.equal(runtime.engine.mission.state, 'active'); assert.equal(store.data.revision, 0);
});

test('new playtest/session, wrong engine and restored checkpoint lose ownership before any write', t => {
  const { store, disk } = fresh(), runtime = nativeController(t, store); runtime.controller.launchCurrent(); finish(runtime);
  const raw = disk.getItem(FORGE_CAMPAIGN_KEY_V161);
  assert.equal(runtime.controller.completeNative({ ...runtime.engine }), false);
  const original = runtime.engine.forgeSessionV141; runtime.engine.forgeSessionV141 = structuredClone(original);
  assert.equal(runtime.controller.completeNative(), false); assert.equal(disk.getItem(FORGE_CAMPAIGN_KEY_V161), raw);
  runtime.engine.forgeSessionV141 = original; runtime.controller.detach(); assert.equal(runtime.controller.completeNative(), false);
});

test('quota rejection preserves memory and disk and permits explicit retry from the same completed native stage', t => {
  const { store, disk } = fresh(), runtime = nativeController(t, store); runtime.controller.launchCurrent(); finish(runtime);
  const before = JSON.stringify(store.data), raw = store.export(), set = disk.setItem;
  disk.setItem = () => { throw new Error('quota'); };
  assert.throws(() => runtime.controller.completeNative(), /quota/); assert.equal(JSON.stringify(store.data), before); assert.equal(store.export(), raw);
  assert.equal(disk.getItem(FORGE_CAMPAIGN_KEY_V161), raw); assert.ok(runtime.controller.owner);
  disk.setItem = set; assert.equal(runtime.controller.completeNative(), true); assert.equal(store.data.revision, 1);
});

test('another tab prevents completion, clear or a replacement write; explicit reload adopts only its valid progress', t => {
  const { store, disk } = fresh(), runtime = nativeController(t, store); runtime.controller.launchCurrent(); finish(runtime);
  const other = new ForgeCampaignStoreV161(disk); other.load(); other.clear();
  assert.throws(() => runtime.controller.completeNative(), /autre onglet/); assert.throws(() => store.clear(), /autre onglet/);
  assert.equal(store.data.revision, 0); assert.equal(disk.getItem(FORGE_CAMPAIGN_KEY_V161), null);
  runtime.controller.detach(); store.load(); assert.equal(store.data, null);
});

test('corrupt/future records are preserved byte-for-byte and cannot be silently replaced', () => {
  for (const raw of ['{broken', JSON.stringify({ schema: 99 }), JSON.stringify({ schema: 1, id: '__proto__' })]) {
    const disk = storage(); disk.setItem(FORGE_CAMPAIGN_KEY_V161, raw); const store = new ForgeCampaignStoreV161(disk); store.load();
    assert.ok(store.error); assert.equal(store.export(), raw); assert.equal(disk.getItem(FORGE_CAMPAIGN_KEY_V161), raw);
    assert.throws(() => store.create('Autre', [project(), project('ship')]), /exportez/);
    store.clear(); assert.equal(disk.getItem(FORGE_CAMPAIGN_KEY_V161), null);
  }
});

test('receipts reject future completion, missing objectives, duplicate sequence and impossible narrative paths', () => {
  const { store } = fresh(), source = structuredClone(store.data);
  source.stages[1].result = { completedAt: 100, objectiveIds: ['goal'], narrative: [] };
  assert.throws(() => parseForgeCampaignV161(source), /hors séquence/);
  source.stages[1].result = null; source.stages[0].result = { completedAt: 100, objectiveIds: [], narrative: [] };
  assert.throws(() => parseForgeCampaignV161(source), /hors séquence/);
  source.stages[0].result.objectiveIds = ['goal']; source.stages[0].result.narrative = [{ cellId: 'unknown', history: [] }];
  assert.throws(() => parseForgeCampaignV161(source), /récit inconnu/);
});

test('completed native bounded dialogue choices are retained as a local result, with no cross-stage item transfer', t => {
  const disk = storage(), store = new ForgeCampaignStoreV161(disk); store.load(); const input = project();
  input.rooms[0].cells.push({ id: 'terminal', x: 8, y: 15, type: 'terminal', layer: 'gameplay', narrative: {
    schema: 1, title: 'Compte rendu', start: 'begin', items: [{ id: 'badge', label: 'Badge local' }], nodes: [
      { id: 'begin', text: 'Votre choix ?', choices: [{ id: 'report', label: 'Rapporter', next: 'done', rewardItemId: 'badge' }] },
      { id: 'done', text: 'Enregistré.', choices: [] } ] } });
  store.create('Choix local', [input, project('ship')], { now: 1, campaignId: 'choices' });
  const runtime = nativeController(t, store); runtime.controller.launchCurrent();
  // Exercise the actual bounded story state machine; physical UI traversal is
  // covered separately by the native browser driver, not claimed here.
  openForgeNarrativeV156(runtime.engine.forgeSessionV141, 'terminal');
  assert.equal(chooseForgeNarrativeV156(runtime.engine.forgeSessionV141, 'terminal', 'report').ok, true);
  runtime.engine.powerNode.active = true; runtime.engine.mission.objectives.power = true;
  finish(runtime); assert.equal(runtime.controller.completeNative(), true);
  assert.deepEqual(store.data.stages[0].result.narrative[0].history, [{ nodeId: 'begin', choiceId: 'report' }]);
  runtime.controller.launchCurrent(); assert.deepEqual(runtime.engine.forgeSessionV141.narrativeInventoryV157 || [], []);
  assert.equal(store.data.stages[0].result.narrative[0].cellId, 'terminal');
});
