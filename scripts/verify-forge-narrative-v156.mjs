import test from 'node:test';
import assert from 'node:assert/strict';
import { ForgeModel, parseProject } from '../src/forge-model-v130.js';
import { createForgeSessionV141, commitForgeTransitionV141, outgoingForgeLinksV141 } from '../src/forge-journey-v141.js';
import { parseForgeNarrativeV156, openForgeNarrativeV156, chooseForgeNarrativeV156, forgeNarrativeViewV156 } from '../src/forge-narrative-v156.js';
import { editForgeNarrativeV156, forgeNarrativeFieldsV156 } from '../src/forge-narrative-ui-v156.js';
import { ForgeVersionStoreV136, parseForgeVersionsV136, compareForgeDocumentsV136 } from '../src/forge-versions-v136.js';
import { missionV136, hostV136 } from './forge-native-host-v136.mjs';
import { HubGame as PhysicalHub } from '../src/hub-v51-runtime.js';
import { withForgeShipRuntimeV141 } from '../src/forge-ship-runtime-v141.js';

function project(kind = 'mission') {
  const floor = kind === 'mission' ? 16 : 15;
  const room = id => ({ id, name: `Salle ${id}`, size: [32, 18], cells: [
    ...Array.from({ length: 32 }, (_, x) => ({ id: `${id}-floor-${x}`, type: 'floor', layer: 'structure', x, y: floor })),
    { id: `${id}-spawn`, type: 'spawn', layer: 'gameplay', x: 1, y: floor - 1 },
    { id: `${id}-goal`, type: 'objective', layer: 'gameplay', x: 3, y: floor - 1 },
    { id: `${id}-door`, type: 'door', layer: 'gameplay', x: id === 'a' ? 10 : 2, y: floor - 1 }
  ] });
  const a = room('a'), b = room('b');
  a.cells.push({ id: 'a-terminal', type: 'terminal', layer: 'gameplay', x: 6, y: floor - 1, narrative: {
    schema: 1, title: 'Ordre du relais', start: 'start', nodes: [
      { id: 'start', text: 'Le relevé du secteur A est-il terminé ?', choices: [
        { id: 'transmit', label: 'Transmettre et valider le relais B', next: 'done', requiresObjectiveId: 'a-goal', rewardObjectiveId: 'b-goal' },
        { id: 'wait', label: 'Lire les consignes', next: 'instructions' }
      ] },
      { id: 'done', text: 'Le relais B confirme la réception.', choices: [] },
      { id: 'instructions', text: 'Validez le relevé dans cette salle.', choices: [] }
    ]
  } });
  return { schema: 3, kind, name: 'Narrative V156', activeRoomId: 'a', rooms: [a, b], links: [
    { id: 'ab', from: { roomId: 'a', cellId: 'a-door' }, to: { roomId: 'b', cellId: 'b-door' }, bidirectional: true }
  ] };
}
const story = input => input.rooms[0].cells.find(cell => cell.id === 'a-terminal').narrative;
function editorFor(input = project()) {
  const model = new ForgeModel(input), editor = { model, selection: new Set(['a-terminal']),
    selected: () => model.room.cells.filter(cell => editor.selection.has(cell.id)),
    assertSelectionEditable() { if (editor.selected().some(cell => cell.locked)) throw new Error('verrouillé'); },
    edit: (label, fn) => model.transaction(label, fn) };
  return editor;
}
function walk(engine, until, direction = 1) {
  const code = direction > 0 ? 'KeyD' : 'KeyA'; engine.keys.add(code);
  for (let frame = 0; frame < 2200 && !until(); frame++) engine.update(1 / 60);
  engine.keys.delete(code); assert.ok(until(), `native walk reached target at ${engine.player.x}`);
}
function tap(runtime, code = 'KeyE') {
  for (const type of ['keydown', 'keyup']) {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, altKey: false, metaKey: false });
    runtime.events.dispatchEvent(event);
  }
}

test('V156 authoring survives canonical JSON, named V136 versions and meaningful diffs', () => {
  const input = parseProject(project()), exported = JSON.stringify(input);
  assert.deepEqual(parseProject(exported), input);
  const storage = new Map(), store = new ForgeVersionStoreV136({ getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) });
  store.load(); store.capture(input, 'Avant branchement', 'project-1', 17);
  assert.deepEqual(parseForgeVersionsV136(store.export()).entries[0].project, input);
  const next = structuredClone(input); story(next).nodes[0].text = 'Texte révisé';
  const diff = compareForgeDocumentsV136(input, next);
  assert.equal(diff.identical, false); assert.deepEqual(diff.changes[0].fields, ['narrative']);
});

test('malformed, oversized, looping or unbound stories fail before document mutation', () => {
  for (const mutate of [
    s => s.nodes.push(structuredClone(s.nodes[0])),
    s => s.nodes[0].choices[0].next = 'absent',
    s => s.nodes[1].choices.push({ id: 'loop', label: 'Boucle', next: 'start' }),
    s => s.nodes[0].text = 'a'.repeat(601),
    s => s.nodes[0].choices.push({ id: 'third', label: 'Trois', next: null }),
    s => s.nodes[0].choices[0].rewardObjectiveId = 'absent',
    s => s.nodes[0].choices[0].rewardObjectiveId = 'a-goal',
    s => s.schema = 2,
  ]) {
    const model = new ForgeModel(project()), original = structuredClone(model.data), bad = project(); mutate(story(bad));
    assert.throws(() => model.load(bad), /Récit Forge/); assert.deepEqual(model.data, original); assert.equal(model.history.length, 0);
  }
  assert.throws(() => parseForgeNarrativeV156(story(project()), 'terminal', 'background'), /physique/);
  const bad = project(); bad.rooms[0].cells.find(cell => cell.id === 'a-goal').layer = 'background';
  assert.throws(() => parseProject(bad), /introuvable/);
});

test('document budget limits story count and every node, even disconnected draft loops', () => {
  const input = project(), draft = story(input);
  for (let n = 3; n < 9; n++) draft.nodes.push({ id: `n${n}`, text: 'Draft', choices: [] });
  assert.throws(() => parseProject(input), /8 nœuds/);
  const cyclic = project(); story(cyclic).nodes.push({ id: 'hidden', text: 'Draft', choices: [{ id: 'loop', label: 'Encore', next: 'hidden' }] });
  assert.throws(() => parseProject(cyclic), /boucles/);
  const many = project();
  for (let n = 0; n < 64; n++) many.rooms[0].cells.push({ id: `extra-${n}`, type: 'terminal', layer: n < 32 ? 'gameplay' : 'structure', x: n % 32, y: 5, narrative: structuredClone(story(many)) });
  assert.throws(() => parseProject(many), /64 terminaux/);
});

test('real inspector operations add, edit and remove branches with undo/redo and lock checks', () => {
  const editor = editorFor(), before = structuredClone(editor.model.data);
  editForgeNarrativeV156(editor, 'story-save', key => ({ 'story-node': 'start', 'story-title': 'Ordre révisé', 'story-text': 'Texte révisé',
    'story-choice-0-label': 'Transmettre', 'story-choice-0-next': 'done', 'story-choice-0-requires': 'a-goal', 'story-choice-0-reward': 'b-goal' })[key] || '');
  assert.equal(story(editor.model.data).title, 'Ordre révisé');
  editForgeNarrativeV156(editor, 'story-branch', key => key === 'story-node' ? 'done' : '');
  assert.ok(story(editor.model.data).nodes.some(node => node.id === 'page-1'));
  editForgeNarrativeV156(editor, 'story-delete-page', key => key === 'story-node' ? 'page-1' : '');
  assert.equal(story(editor.model.data).nodes.find(node => node.id === 'done').choices.length, 0);
  assert.throws(() => editForgeNarrativeV156(editor, 'story-delete-page', () => 'start'), /début/);
  while (editor.model.undo()) {} assert.deepEqual(editor.model.data, before);
  while (editor.model.redo()) {} assert.equal(story(editor.model.data).title, 'Ordre révisé');
  editor.selected()[0].locked = true;
  assert.throws(() => editForgeNarrativeV156(editor, 'story-remove', () => ''), /verrouillé/);
});

test('inspector escapes imported prose and shows real objective choices without executable markup', () => {
  const editor = editorFor(); story(editor.model.data).title = '<img src=x onerror=alert(1)>';
  story(editor.model.data).nodes[0].text = '</textarea><script>alert(1)</script>';
  const html = forgeNarrativeFieldsV156(editor, editor.selected()[0], 'start');
  assert.ok(html.includes('&lt;img')); assert.ok(html.includes('&lt;/textarea&gt;'));
  assert.equal(html.includes('<script>'), false); assert.ok(html.includes('Salle b / b-goal'));
});

test('room duplication rewires only objectives copied with the terminal', () => {
  const model = new ForgeModel(project()); model.transaction('Dupliquer', () => model.addRoom({ duplicate: true }));
  const terminal = model.room.cells.find(cell => cell.narrative), goal = model.room.cells.find(cell => cell.type === 'objective');
  assert.equal(terminal.narrative.nodes[0].choices[0].requiresObjectiveId, goal.id);
  assert.equal(terminal.narrative.nodes[0].choices[0].rewardObjectiveId, 'b-goal');
});

test('missing objectives and stale/foreign choices refuse atomically; rewards are idempotent', () => {
  const session = createForgeSessionV141(project()); openForgeNarrativeV156(session, 'a-terminal');
  const before = structuredClone(session);
  assert.equal(chooseForgeNarrativeV156(session, 'a-terminal', 'transmit').reason, 'objective-required');
  assert.deepEqual(session, before); session.completedObjectives.push('a-goal');
  const result = chooseForgeNarrativeV156(session, 'a-terminal', 'transmit');
  assert.equal(result.rewardedObjectiveId, 'b-goal'); assert.equal(result.view.nodeId, 'done');
  const after = structuredClone(session); assert.equal(chooseForgeNarrativeV156(session, 'a-terminal', 'transmit').ok, false);
  assert.deepEqual(session, after);
  commitForgeTransitionV141(session, outgoingForgeLinksV141(session.project)[0]);
  const away = structuredClone(session); assert.equal(openForgeNarrativeV156(session, 'a-terminal'), null);
  assert.equal(chooseForgeNarrativeV156(session, 'a-terminal', 'wait').ok, false); assert.deepEqual(session, away);
  commitForgeTransitionV141(session, outgoingForgeLinksV141(session.project, 'b')[0]);
  assert.equal(openForgeNarrativeV156(session, 'a-terminal').nodeId, 'done');
  assert.equal(session.completedObjectives.filter(id => id === 'b-goal').length, 1);
});

test('conditional refusal leaves the alternative branch available and cannot replay the other branch', () => {
  const session = createForgeSessionV141(project());
  const view = openForgeNarrativeV156(session, 'a-terminal'); assert.deepEqual(view.choices.map(choice => choice.available), [false, true]);
  chooseForgeNarrativeV156(session, 'a-terminal', 'wait');
  session.completedObjectives.push('a-goal'); assert.equal(chooseForgeNarrativeV156(session, 'a-terminal', 'transmit').ok, false);
  assert.equal(forgeNarrativeViewV156(session, 'a-terminal').text, 'Validez le relevé dans cette salle.'); assert.deepEqual(session.completedObjectives, ['a-goal']);
});

test('native Mission E opens a terminal, freezes gameplay, rewards across rooms and preserves return state', t => {
  const input = project(), before = structuredClone(input), runtime = missionV136({ editorProject: input, forgeJourneyV141: true });
  const { engine } = runtime; t.after(() => engine.stop());
  walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156())); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'a-terminal'); assert.equal(engine.powerNode.active, true);
  const player = structuredClone(engine.player), elapsed = engine.mission.elapsed;
  engine.keys.add('KeyD'); for (let frame = 0; frame < 60; frame++) engine.update(1 / 60);
  assert.deepEqual(engine.player, player); assert.equal(engine.mission.elapsed, elapsed);
  assert.equal(engine.fire(engine.player), false); assert.equal(engine.chooseForgeNarrativeV156('transmit').ok, false);
  engine.closeForgeNarrativeV156();
  walk(engine, () => Math.abs(engine.player.x + engine.player.w / 2 - engine.objective.x - engine.objective.w / 2) < 80, -1); tap(runtime);
  assert.ok(engine.forgeSessionV141.completedObjectives.includes('a-goal'));
  walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156())); tap(runtime);
  assert.equal(engine.chooseForgeNarrativeV156('transmit').rewardedObjectiveId, 'b-goal');
  engine.closeForgeNarrativeV156(); walk(engine, () => Boolean(engine.forgeLinkedDoorV141())); tap(runtime);
  assert.equal(engine.forgeActiveRoomIdV141, 'b'); assert.equal(engine.objective.complete, true);
  tap(runtime); assert.equal(engine.forgeActiveRoomIdV141, 'a');
  walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156()), -1); tap(runtime);
  assert.equal(engine.getSnapshot().forgeJourneyV141.narrativeDialogV156.nodeId, 'done');
  assert.equal(engine.forgeSessionV141.completedObjectives.filter(id => id === 'b-goal').length, 1); assert.deepEqual(input, before);
});

test('native Mission stop/restart closes old controls and starts a clean independent story session', t => {
  const input = project(), runtime = missionV136({ editorProject: input, forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop()); walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156())); tap(runtime);
  const stale = engine.chooseForgeNarrativeV156; engine.stop(); assert.equal(engine.forgeNarrativeOpenV156, null);
  engine.start(runtime.options); assert.equal(stale('wait').reason, 'dialogue-closed');
  assert.deepEqual(engine.forgeSessionV141.narrativeV156 || [], []); assert.equal(engine.chooseForgeNarrativeV156, null);
});

test('native Ship keyboard terminal accepts a story branch without campaign writes and resumes the same page', t => {
  const browser = hostV136(), actions = [], patches = [], Runtime = withForgeShipRuntimeV141(PhysicalHub);
  const engine = new Runtime(browser.canvas, { onAction: action => actions.push(action), onPersist: patch => patches.push(patch) });
  const input = project('ship'), campaign = { playerHealth: 73, roomId: 'bridge' }, before = structuredClone(campaign);
  engine.start(campaign, { editorProject: input, forgeJourneyV141: true }); t.after(() => engine.stop(false));
  walk(engine, () => engine.nearestForgeInteractionV141()?.type === 'objective');
  // The terminal must be activated before the native objective is admitted.
  walk(engine, () => engine.nearestForgeInteractionV141()?.type === 'terminal'); tap({ ...browser, engine });
  assert.equal(engine.forgeNarrativeOpenV156, 'a-terminal');
  const position = engine.player.x; engine.keys.add('KeyD'); engine.update(.05); assert.equal(engine.player.x, position); assert.equal(engine.fire(), false);
  engine.closeForgeNarrativeV156();
  walk(engine, () => engine.nearestForgeInteractionV141()?.type === 'objective', -1); tap({ ...browser, engine });
  assert.ok(engine.forgeSessionV141.completedObjectives.includes('a-goal'));
  walk(engine, () => engine.nearestForgeInteractionV141()?.type === 'terminal'); tap({ ...browser, engine });
  assert.equal(engine.chooseForgeNarrativeV156('transmit').ok, true); assert.equal(engine.forgeSessionV141.complete, true);
  engine.closeForgeNarrativeV156(); tap({ ...browser, engine });
  assert.equal(engine.getSnapshot().narrativeDialogV156.nodeId, 'done'); assert.deepEqual(campaign, before);
  assert.ok(actions.some(action => action.action === 'editor:project-complete'));
  assert.ok(patches.at(-1).forgeSessionV141.narrativeV156.length); assert.equal(patches.some(patch => 'resources' in patch), false);
});

test('group paste rewires both story targets to copied objectives and retains external references', () => {
  const model = new ForgeModel(project()), clip = model.copy(['a-terminal', 'a-goal']);
  let inserted;
  model.transaction('Coller', () => inserted = model.paste(clip, 16, 12));
  const terminal = model.room.cells.find(cell => inserted.includes(cell.id) && cell.narrative), goal = model.room.cells.find(cell => inserted.includes(cell.id) && cell.type === 'objective');
  assert.equal(terminal.narrative.nodes[0].choices[0].requiresObjectiveId, goal.id);
  assert.equal(terminal.narrative.nodes[0].choices[0].rewardObjectiveId, 'b-goal');
});

test('adding a branch after removing answer one preserves answer two with a distinct stable id', () => {
  const editor = editorFor();
  editForgeNarrativeV156(editor, 'story-save', key => ({ 'story-node': 'start', 'story-title': 'Ordre', 'story-text': 'Choisir',
    'story-choice-1-label': 'Conserver', 'story-choice-1-next': 'instructions' })[key] || '');
  editForgeNarrativeV156(editor, 'story-branch', key => key === 'story-node' ? 'start' : '');
  const choices = story(editor.model.data).nodes[0].choices;
  assert.equal(choices[0].id, 'answer-2'); assert.equal(choices[0].next, 'instructions');
  assert.equal(choices[1].id, 'answer-1'); assert.equal(choices[1].next, 'page-1');
});

test('dialogue callbacks cannot choose twice or clear input belonging to a replacement scene', async () => {
  const { showForgeNarrativeV156 } = await import('../src/forge-narrative-ui-v156.js');
  const input = project(); story(input).nodes[1].choices = [{ id: 'transmit', label: 'Encore', next: null }];
  const session = createForgeSessionV141(input); session.completedObjectives.push('a-goal');
  hostV136();
  const engine = { running: true, forgeSessionV141: session, keys: new Set(), canvas: { focus() {} } };
  let recursive;
  showForgeNarrativeV156(engine, 'a-terminal', () => { recursive = engine.chooseForgeNarrativeV156('transmit'); });
  assert.equal(engine.chooseForgeNarrativeV156('transmit').ok, true); assert.equal(recursive.reason, 'choice-in-progress');
  assert.equal(session.narrativeV156[0].history.length, 1); engine.closeForgeNarrativeV156();
  const replacement = createForgeSessionV141(project()); replacement.completedObjectives.push('a-goal');
  engine.forgeSessionV141 = replacement;
  showForgeNarrativeV156(engine, 'a-terminal', () => {
    engine.closeForgeNarrativeV156(); engine.forgeSessionV141 = null; engine.keys.add('new-scene');
  });
  assert.equal(engine.chooseForgeNarrativeV156('transmit').ok, true);
  assert.equal(engine.keys.has('new-scene'), true); assert.equal(engine.forgeNarrativeOpenV156, null);
});

test('a refused native Mission replacement preserves the open story transaction', t => {
  const runtime = missionV136({ editorProject: project(), forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop()); walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156())); tap(runtime);
  const session = engine.forgeSessionV141, close = engine.closeForgeNarrativeV156;
  const invalid = project(); invalid.rooms[0].cells = invalid.rooms[0].cells.filter(cell => cell.type !== 'floor');
  assert.throws(() => engine.start({ ...runtime.options, editorProject: invalid }), /refusé/);
  assert.equal(engine.forgeSessionV141, session); assert.equal(engine.closeForgeNarrativeV156, close);
  assert.equal(engine.forgeNarrativeOpenV156, 'a-terminal');
});

test('a refused native Ship replacement preserves the open story transaction', t => {
  const browser = hostV136(), Runtime = withForgeShipRuntimeV141(PhysicalHub);
  const engine = new Runtime(browser.canvas, { onAction() {}, onPersist() {} });
  engine.start({}, { editorProject: project('ship'), forgeJourneyV141: true }); t.after(() => engine.stop(false));
  walk(engine, () => engine.nearestForgeInteractionV141()?.type === 'terminal'); tap({ ...browser, engine });
  const session = engine.forgeSessionV141, close = engine.closeForgeNarrativeV156;
  const invalid = project('ship'); invalid.rooms[0].cells = invalid.rooms[0].cells.filter(cell => cell.type !== 'floor');
  assert.throws(() => engine.start({}, { editorProject: invalid, forgeJourneyV141: true }), /refusé/);
  assert.equal(engine.forgeSessionV141, session); assert.equal(engine.closeForgeNarrativeV156, close);
  assert.equal(engine.forgeNarrativeOpenV156, 'a-terminal');
});
