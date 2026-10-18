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
import { ENEMIES, WEAPONS, EQUIPMENT } from '../src/content.js';
import { captureAssemblyV133, normalizeAssemblyV133, transformAssemblyV133, placementPreviewV133, stampAssemblyV133,
  ForgeAssemblyLibraryV133, parseAssemblyLibraryV133, ASSEMBLY_KEY_V133 } from '../src/forge-authoring-v133.js';

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


test('P2: terminal-only assembly capture preserves real external objectives through library export/load and transforms', () => {
  const model = new ForgeModel(project()), before = structuredClone(model.data);
  const assembly = captureAssemblyV133(model, ['a-terminal'], 'Terminal seul');
  assert.deepEqual(model.data, before);
  const storage = new Map(), adapter = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const first = new ForgeAssemblyLibraryV133(adapter); first.load(); first.add(assembly);
  const loaded = new ForgeAssemblyLibraryV133(adapter); loaded.load(); assert.equal(loaded.protected, false);
  const exported = parseAssemblyLibraryV133(loaded.export());
  const normalized = normalizeAssemblyV133(exported.entries[0]);
  let rotated = normalized;
  for (let turn = 0; turn < 4; turn++) rotated = transformAssemblyV133(rotated, { turns: 1 });
  assert.deepEqual(rotated, normalized);
  const mirrored = transformAssemblyV133(transformAssemblyV133(normalized, { flipX: true }), { flipX: true });
  assert.deepEqual(mirrored, normalized);
  const response = normalized.cells[0].narrative.nodes[0].choices[0];
  assert.equal(response.requiresObjectiveId, 'a-goal'); assert.equal(response.rewardObjectiveId, 'b-goal');
  assert.equal(loaded.merge(first.export()), 1); assert.equal(loaded.data.entries.length, 2);
});

test('P2: terminal-only stamping keeps external bindings and each copy remains independently undoable', () => {
  const model = new ForgeModel(project()), original = structuredClone(model.data);
  const assembly = captureAssemblyV133(model, ['a-terminal'], 'Terminal seul');
  const one = stampAssemblyV133(model, assembly, 16, 12), afterOne = structuredClone(model.data);
  const two = stampAssemblyV133(model, assembly, 18, 12);
  assert.notEqual(one[0], two[0]);
  for (const cellId of [...one, ...two]) {
    const response = model.room.cells.find(cell => cell.id === cellId).narrative.nodes[0].choices[0];
    assert.equal(response.requiresObjectiveId, 'a-goal'); assert.equal(response.rewardObjectiveId, 'b-goal');
  }
  model.undo(); assert.deepEqual(model.data, afterOne);
  model.undo(); assert.deepEqual(model.data, original);
  model.redo(); assert.deepEqual(model.data, afterOne);
});

test('P2: assembly stamping remaps selected objectives while preserving external rewards', () => {
  const model = new ForgeModel(project());
  const assembly = captureAssemblyV133(model, ['a-terminal', 'a-goal'], 'Terminal et relevé');
  const inserted = stampAssemblyV133(model, assembly, 16, 12);
  const terminal = model.room.cells.find(cell => inserted.includes(cell.id) && cell.narrative);
  const goal = model.room.cells.find(cell => inserted.includes(cell.id) && cell.type === 'objective');
  const response = terminal.narrative.nodes[0].choices[0];
  assert.equal(response.requiresObjectiveId, goal.id); assert.notEqual(goal.id, 'a-goal');
  assert.equal(response.rewardObjectiveId, 'b-goal');
});

test('P2: external cell-N objectives never alias canonical assembly cells or paste remapping', () => {
  const input = project(); input.rooms[0].cells.find(cell => cell.id === 'a-goal').id = 'cell-1';
  story(input).nodes[0].choices[0].requiresObjectiveId = 'cell-1';
  const model = new ForgeModel(input), assembly = captureAssemblyV133(model, ['a-terminal'], 'Liaison cell-1');
  assert.notEqual(assembly.cells[0].id, 'cell-1');
  assert.deepEqual(normalizeAssemblyV133(assembly), assembly);
  const [inserted] = stampAssemblyV133(model, assembly, 16, 12);
  assert.equal(model.room.cells.find(cell => cell.id === inserted).narrative.nodes[0].choices[0].requiresObjectiveId, 'cell-1');
});

test('P2: assembly preview and stamp reject unresolved, non-objective or decorative target bindings atomically', () => {
  const source = new ForgeModel(project()), assembly = captureAssemblyV133(source, ['a-terminal'], 'Terminal seul');
  for (const disposition of ['absent', 'wall', 'decorative']) {
    const input = project(); delete input.rooms[0].cells.find(cell => cell.id === 'a-terminal').narrative;
    if (disposition === 'absent') input.rooms[0].cells = input.rooms[0].cells.filter(cell => cell.id !== 'a-goal');
    if (disposition === 'wall') input.rooms[0].cells.find(cell => cell.id === 'a-goal').type = 'wall';
    if (disposition === 'decorative') input.rooms[0].cells.find(cell => cell.id === 'a-goal').layer = 'background';
    const target = new ForgeModel(input), before = structuredClone(target.data);
    const preview = placementPreviewV133(target, assembly, 16, 12);
    assert.equal(preview.ok, false); assert.ok(preview.errors.some(error => error.includes('a-goal')));
    assert.throws(() => stampAssemblyV133(target, assembly, 16, 12), /objectif externe introuvable/);
    assert.deepEqual(target.data, before); assert.equal(target.history.length, 0);
  }
});

test('P2: assembly library keeps strict story admission, local objective types and prior bytes on invalid import', () => {
  const model = new ForgeModel(project()), captured = captureAssemblyV133(model, ['a-terminal'], 'Terminal seul');
  const storage = new Map(), adapter = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const library = new ForgeAssemblyLibraryV133(adapter); library.load(); library.add(captured);
  const before = library.export(), disk = storage.get(ASSEMBLY_KEY_V133);
  for (const mutate of [
    input => input.cells[0].narrative.nodes[0].choices[0].next = 'start',
    input => input.cells[0].narrative.nodes[0].text = 'x'.repeat(601),
    input => input.cells[0].narrative.nodes[0].choices[0].rewardObjectiveId = 'a-goal',
    input => { input.cells.push({ id: 'a-goal', x: 1, y: 0, type: 'wall', layer: 'structure' }); },
    input => { input.cells.push({ id: input.cells[0].id, x: 1, y: 0, type: 'objective', layer: 'gameplay' }); },
  ]) {
    const invalid = structuredClone(captured); invalid.id = 'invalid'; mutate(invalid);
    assert.throws(() => library.merge({ schema: 1, entries: [invalid] }));
    assert.equal(library.export(), before); assert.equal(storage.get(ASSEMBLY_KEY_V133), disk);
  }
  const untrusted = structuredClone(captured); untrusted.cells[0].script = 'execute';
  untrusted.cells[0].narrative.script = 'execute'; untrusted.cells[0].narrative.nodes[0].script = 'execute';
  const clean = normalizeAssemblyV133(untrusted);
  assert.equal(clean.cells[0].script, undefined); assert.equal(clean.cells[0].narrative.script, undefined);
  assert.equal(clean.cells[0].narrative.nodes[0].script, undefined);
});

test('P2: unresolved assembly bindings never weaken complete project import or playtest admission', () => {
  const model = new ForgeModel(project()), assembly = captureAssemblyV133(model, ['a-terminal'], 'Terminal seul');
  assert.ok(assembly.cells[0].narrative);
  const invalid = project(); invalid.rooms[1].cells = invalid.rooms[1].cells.filter(cell => cell.id !== 'b-goal');
  assert.throws(() => parseProject(invalid), /objectif.*b-goal.*introuvable/);
  const before = structuredClone(model.data); assert.throws(() => model.load(invalid), /introuvable/);
  assert.deepEqual(model.data, before); assert.equal(model.history.length, 0);
});

function closeObjectiveProjectV156({ size = [32, 18], spawnX = 4, goalX = 5, terminalX = 6, secondTerminalX = null } = {}) {
  const [columns, rows] = size, ground = rows - 2;
  const cell = (id, x, type, layer = 'gameplay') => ({ id, x, y: ground - 1, type, layer });
  const narrative = { schema: 1, title: 'Journal voisin', start: 'read', nodes: [
    { id: 'read', text: 'Consulter le relevé voisin.', choices: [{ id: 'finish', label: 'Terminer la lecture', next: 'done' }] },
    { id: 'done', text: 'Lecture achevée.', choices: [] }
  ] };
  return { schema: 3, kind: 'mission', name: 'Objectif et lecture voisins', activeRoomId: 'close', links: [], rooms: [
    { id: 'close', name: 'Poste de relevé', size, cells: [
      ...Array.from({ length: columns }, (_, x) => ({ id: `floor-${x}`, x, y: ground, type: 'floor', layer: 'structure' })),
      cell('spawn', spawnX, 'spawn'), cell('goal', goalX, 'objective'),
      { ...cell('terminal', terminalX, 'terminal'), narrative },
      ...(secondTerminalX === null ? [] : [{ ...cell('archive', secondTerminalX, 'terminal'), narrative: structuredClone(narrative) }])
    ] }
  ] };
}
const centerDistanceV156 = (actor, target) => Math.hypot(actor.x + actor.w / 2 - target.x - target.w / 2,
  actor.y + actor.h / 2 - target.y - target.h / 2);

test('review P2: native E reads pending power then validates and extracts at the same overlapping objective position', t => {
  const input = closeObjectiveProjectV156(), runtime = missionV136({ editorProject: input, forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop()); walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156()));
  assert.ok(centerDistanceV156(engine.player, engine.objective) < 125);
  assert.ok(centerDistanceV156(engine.player, engine.powerNode) < 130);
  assert.ok(centerDistanceV156(engine.player, engine.objective) < centerDistanceV156(engine.player, engine.powerNode));
  assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.equal(engine.powerNode.active, true);
  engine.closeForgeNarrativeV156(); const position = { x: engine.player.x, y: engine.player.y };
  assert.equal(engine.forgeNarrativeTerminalV156(), null); assert.match(engine.getInteractionPrompt(), /VALIDER L’OBJECTIF/);
  tap(runtime); assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal']);
  assert.equal(engine.forgeNarrativeOpenV156, null); assert.match(engine.getInteractionPrompt(), /CONFIRMER L’EXTRACTION/);
  tap(runtime); assert.equal(engine.mission.state, 'complete'); assert.deepEqual({ x: engine.player.x, y: engine.player.y }, position);
  assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal']);
});

test('review P2: the nearer narrative terminal remains readable when its ready objective shares the reach range', t => {
  const runtime = missionV136({ editorProject: closeObjectiveProjectV156(), forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop()); walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156())); tap(runtime); engine.closeForgeNarrativeV156();
  walk(engine, () => centerDistanceV156(engine.player, engine.powerNode) < centerDistanceV156(engine.player, engine.objective));
  assert.ok(centerDistanceV156(engine.player, engine.objective) < 125); assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/);
  tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.deepEqual(engine.forgeSessionV141.completedObjectives, []);
  engine.closeForgeNarrativeV156(); walk(engine, () => centerDistanceV156(engine.player, engine.objective) < centerDistanceV156(engine.player, engine.powerNode), -1);
  assert.match(engine.getInteractionPrompt(), /VALIDER L’OBJECTIF/); tap(runtime);
  assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal']);
});

test('review P2: two overlapping stories select the nearest physical terminal before the objective is ready', t => {
  const input = closeObjectiveProjectV156({ size: [128, 72], spawnX: 12, goalX: 6, terminalX: 10, secondTerminalX: 14 });
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop()); walk(engine, () => centerDistanceV156(engine.player, engine.archiveTerminal) < centerDistanceV156(engine.player, engine.powerNode));
  assert.ok(centerDistanceV156(engine.player, engine.powerNode) < 130);
  assert.equal(engine.forgeNarrativeTerminalV156().forgeCellIdV141, 'archive'); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'archive'); assert.equal(engine.archiveTerminal.recovered, true); assert.equal(engine.powerNode.active, false);
  engine.closeForgeNarrativeV156();
  walk(engine, () => centerDistanceV156(engine.player, engine.powerNode) < centerDistanceV156(engine.player, engine.archiveTerminal), -1);
  assert.equal(engine.forgeNarrativeTerminalV156().forgeCellIdV141, 'terminal'); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.equal(engine.powerNode.active, true);
});

test('review P2: prompt and E ignore a nearer target across a newly sealed partition', t => {
  const runtime = missionV136({ editorProject: closeObjectiveProjectV156(), forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop()); walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156())); tap(runtime); engine.closeForgeNarrativeV156();
  const original = structuredClone(engine.forgeSessionV141.project), position = { x: engine.player.x, y: engine.player.y };
  // Explicit runtime fixture: a thin emergency partition seals one hand path
  // after the player has genuinely read and activated the native power node.
  const partition = { id: 'runtime-partition', x: engine.player.x - 12, y: engine.player.y - 10, w: 6, h: engine.player.h + 20 };
  engine.walls.push(partition);
  assert.equal(engine.forgeInteractionClearV141(engine.player, engine.objective), false);
  assert.equal(engine.forgeInteractionClearV141(engine.player, engine.powerNode), true);
  assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.deepEqual(engine.forgeSessionV141.completedObjectives, []);
  engine.closeForgeNarrativeV156(); partition.x = engine.player.x + engine.player.w + 2;
  assert.equal(engine.forgeInteractionClearV141(engine.player, engine.objective), true);
  assert.equal(engine.forgeInteractionClearV141(engine.player, engine.powerNode), false);
  assert.match(engine.getInteractionPrompt(), /VALIDER L’OBJECTIF/); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, null); assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal']);
  assert.deepEqual({ x: engine.player.x, y: engine.player.y }, position);
  assert.deepEqual(engine.forgeSessionV141.project, original);
});

test('review P2: a completed nearby objective yields E to its conditional story until the remote reward permits extraction', t => {
  const input = closeObjectiveProjectV156(), room = input.rooms[0];
  room.cells.find(cell => cell.id === 'terminal').narrative = { schema: 1, title: 'Relais conditionnel', start: 'read', nodes: [
    { id: 'read', text: 'Transmettre après le relevé local.', choices: [
      { id: 'transmit', label: 'Valider le relais B', next: 'done', requiresObjectiveId: 'goal', rewardObjectiveId: 'b-goal' }
    ] }, { id: 'done', text: 'Relais B validé.', choices: [] }
  ] };
  room.cells.push({ id: 'close-exit', x: 10, y: 15, type: 'door', layer: 'gameplay' });
  input.rooms.push(project().rooms[1]);
  input.links.push({ id: 'ab', from: { roomId: 'close', cellId: 'close-exit' }, to: { roomId: 'b', cellId: 'b-door' }, bidirectional: true });
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop()); walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156()));
  const position = { x: engine.player.x, y: engine.player.y };
  tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'terminal');
  assert.equal(engine.chooseForgeNarrativeV156('transmit').reason, 'objective-required');
  assert.deepEqual(engine.forgeSessionV141.completedObjectives, []); engine.closeForgeNarrativeV156();
  assert.match(engine.getInteractionPrompt(), /VALIDER L’OBJECTIF/); tap(runtime);
  assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal']); assert.equal(engine.mission.state, 'active');
  assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal');
  assert.equal(engine.chooseForgeNarrativeV156('transmit').rewardedObjectiveId, 'b-goal');
  engine.closeForgeNarrativeV156(); assert.match(engine.getInteractionPrompt(), /CONFIRMER L’EXTRACTION/);
  tap(runtime); assert.equal(engine.mission.state, 'complete');
  assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal', 'b-goal']);
  assert.equal(engine.forgeSessionV141.transitions, 0);
  assert.deepEqual({ x: engine.player.x, y: engine.player.y }, position);
});

test('review native admission: a boss-locked nearer archive cannot mask its admissible narrative power node', t => {
  const input = closeObjectiveProjectV156({ spawnX: 4, goalX: 2, terminalX: 5, secondTerminalX: 6 });
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop());
  walk(engine, () => centerDistanceV156(engine.player, engine.archiveTerminal) < centerDistanceV156(engine.player, engine.powerNode));
  assert.ok(centerDistanceV156(engine.player, engine.powerNode) < 130);
  // Explicit native prerequisite fixture; no combat outcome is fabricated.
  engine.mission.objectives.boss = false;
  assert.equal(engine.forgeNarrativeTerminalV156(), engine.powerNode); assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/);
  tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'terminal');
  assert.equal(engine.powerNode.active, true); assert.equal(engine.archiveTerminal.recovered, false); assert.equal(engine.mission.objectives.boss, false);
});

test('review native admission: an isolated locked archive reports the boss gate, becomes readable after it, and retains the gate on reread', t => {
  const runtime = missionV136({ editorProject: closeObjectiveProjectV156({ spawnX: 4, goalX: 2, terminalX: 5, secondTerminalX: 6 }), forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop());
  walk(engine, () => centerDistanceV156(engine.player, engine.powerNode) >= 130 && centerDistanceV156(engine.player, engine.archiveTerminal) < 100);
  engine.mission.objectives.boss = false;
  assert.equal(engine.forgeNarrativeTerminalV156(), null); assert.match(engine.getInteractionPrompt(), /NEUTRALISER LA MENACE ALPHA/);
  const before = structuredClone(engine.forgeSessionV141); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156 || null, null); assert.equal(engine.archiveTerminal.recovered, false); assert.deepEqual(engine.forgeSessionV141, before);
  engine.mission.objectives.boss = true;
  assert.equal(engine.forgeNarrativeTerminalV156(), engine.archiveTerminal); assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/);
  tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'archive'); assert.equal(engine.archiveTerminal.recovered, true);
  engine.closeForgeNarrativeV156(); engine.mission.objectives.boss = false;
  assert.equal(engine.forgeNarrativeTerminalV156(), null); assert.match(engine.getInteractionPrompt(), /NEUTRALISER LA MENACE ALPHA/); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156 || null, null); assert.equal(engine.archiveTerminal.recovered, true);
  engine.mission.objectives.boss = true; tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'archive');
});

test('review native admission: ordinary pending power keeps its native priority before a boss-locked narrative archive', t => {
  const input = closeObjectiveProjectV156({ spawnX: 4, goalX: 2, terminalX: 5, secondTerminalX: 6 });
  delete input.rooms[0].cells.find(cell => cell.id === 'terminal').narrative;
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop());
  walk(engine, () => centerDistanceV156(engine.player, engine.archiveTerminal) < centerDistanceV156(engine.player, engine.powerNode));
  engine.mission.objectives.boss = false;
  assert.equal(engine.forgeNarrativeTerminalV156(), null); assert.match(engine.getInteractionPrompt(), /RÉTABLIR LE CIRCUIT/);
  tap(runtime); assert.equal(engine.powerNode.active, true); assert.equal(engine.forgeNarrativeOpenV156 || null, null);
  assert.match(engine.getInteractionPrompt(), /NEUTRALISER LA MENACE ALPHA/); tap(runtime);
  assert.equal(engine.archiveTerminal.recovered, false); assert.equal(engine.mission.objectives.boss, false);
});

test('review native admission: a sealed power approach and locked archive produce a truthful refusal without opening either story', t => {
  const runtime = missionV136({ editorProject: closeObjectiveProjectV156({ spawnX: 4, goalX: 2, terminalX: 5, secondTerminalX: 6 }), forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop());
  walk(engine, () => centerDistanceV156(engine.player, engine.archiveTerminal) < centerDistanceV156(engine.player, engine.powerNode));
  engine.mission.objectives.boss = false;
  // Explicit runtime partition fixture seals the left-hand power reach only.
  const partition = { id: 'admission-partition', x: engine.player.x - 12, y: engine.player.y - 10, w: 6, h: engine.player.h + 20 };
  engine.walls.push(partition);
  assert.equal(engine.forgeInteractionClearV141(engine.player, engine.powerNode), false);
  assert.equal(engine.forgeInteractionClearV141(engine.player, engine.archiveTerminal), true);
  assert.equal(engine.forgeNarrativeTerminalV156(), null); assert.match(engine.getInteractionPrompt(), /TERMINAL BLOQUÉ PAR UNE CLOISON/);
  tap(runtime); assert.equal(engine.forgeNarrativeOpenV156 || null, null); assert.equal(engine.powerNode.active, false); assert.equal(engine.archiveTerminal.recovered, false);
  engine.walls.splice(engine.walls.indexOf(partition), 1);
  assert.equal(engine.forgeNarrativeTerminalV156(), engine.powerNode); tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'terminal');
});

test('review native admission: every unmet native objective requirement matches the prompt and refuses E before validation', t => {
  const input = project(); input.rooms[0].cells.push(
    { id: 'a-archive', x: 12, y: 15, type: 'terminal', layer: 'gameplay' },
    { id: 'a-alpha', x: 24, y: 15, type: 'enemy', layer: 'gameplay' });
  const alpha = ENEMIES.find(enemy => enemy.id === 'enemy-112-armored-queen');
  assert.ok(alpha);
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true, enemyCatalog: [alpha] }), { engine } = runtime;
  t.after(() => engine.stop());
  walk(engine, () => centerDistanceV156(engine.player, engine.objective) < 80);
  assert.equal(engine.forgeNarrativeTerminalV156(), null);
  const boss = engine.enemies.find(enemy => enemy.isBoss); assert.ok(boss);
  assert.deepEqual([...engine.objectiveRuntime.requirements].sort(), ['archive', 'boss', 'power']);
  const cases = [ ['power', 'ALIMENTATION AUXILIAIRE MANQUANTE'],
    ['boss', 'MENACE ALPHA ENCORE ACTIVE'], ['archive', 'DONNÉES NON RÉCUPÉRÉES'] ];
  for (const [blocked, message] of cases) {
    // Declare one missing native condition at a time, without editing a save.
    Object.assign(engine.mission.objectives, { power: true, route: true, boss: true, archive: true, [blocked]: false });
    engine.powerNode.active = engine.mission.objectives.power; engine.archiveTerminal.recovered = engine.mission.objectives.archive;
    boss.alive = blocked === 'boss'; boss.health = boss.alive ? boss.maxHealth : 0;
    const before = structuredClone(engine.forgeSessionV141);
    assert.equal(engine.getInteractionPrompt(), `E  ${message}`); tap(runtime);
    assert.deepEqual(engine.forgeSessionV141, before); assert.equal(engine.forgeNarrativeOpenV156 || null, null);
    assert.ok(runtime.messages.some(event => event.type === 'locked' && event.requirement === message));
  }
  // The published Forge compiler does not require route: preserve that native
  // admission instead of inventing an extra gate from the older V51 class.
  Object.assign(engine.mission.objectives, { power: true, route: false, boss: true, archive: true });
  engine.powerNode.active = true; engine.archiveTerminal.recovered = true; boss.alive = false; boss.health = 0;
  assert.match(engine.getInteractionPrompt(), /VALIDER L’OBJECTIF/); tap(runtime);
  assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['a-goal']);
});

test('review native priority: ordinary power beats a farther archive story before an overlapping locked objective', t => {
  const input = closeObjectiveProjectV156({ size: [128, 72], spawnX: 8, goalX: 10, terminalX: 11, secondTerminalX: 12 });
  delete input.rooms[0].cells.find(cell => cell.id === 'terminal').narrative;
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop());
  walk(engine, () => centerDistanceV156(engine.player, engine.archiveTerminal) < 130
    && centerDistanceV156(engine.player, engine.powerNode) < centerDistanceV156(engine.player, engine.archiveTerminal));
  assert.ok(centerDistanceV156(engine.player, engine.objective) < 125);
  assert.equal(engine.forgePreferredUseV156().kind, 'native-terminal'); assert.match(engine.getInteractionPrompt(), /RÉTABLIR LE CIRCUIT/);
  tap(runtime); assert.equal(engine.powerNode.active, true); assert.equal(engine.archiveTerminal.recovered, false);
  assert.equal(engine.forgeNarrativeOpenV156 || null, null); assert.deepEqual(engine.forgeSessionV141.completedObjectives, []);
  tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'archive'); engine.closeForgeNarrativeV156();
  assert.equal(engine.archiveTerminal.recovered, true);
  // Explicit power-loss fixture: a relistenable recovered archive must still
  // yield to its nearer ordinary power node when that native action returns.
  engine.powerNode.active = false; engine.mission.objectives.power = false;
  assert.match(engine.getInteractionPrompt(), /RÉTABLIR LE CIRCUIT/); tap(runtime);
  assert.equal(engine.powerNode.active, true); assert.equal(engine.forgeNarrativeOpenV156 || null, null);
  assert.match(engine.getInteractionPrompt(), /VALIDER L’OBJECTIF/); tap(runtime);
  assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal']);
});

test('review native priority: narrative power retains its first native activation, then ordinary archive takes the nearer action', t => {
  const input = closeObjectiveProjectV156({ size: [128, 72], spawnX: 8, goalX: 10, terminalX: 11, secondTerminalX: 12 });
  delete input.rooms[0].cells.find(cell => cell.id === 'archive').narrative;
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop());
  walk(engine, () => centerDistanceV156(engine.player, engine.archiveTerminal) < centerDistanceV156(engine.player, engine.powerNode));
  assert.ok(centerDistanceV156(engine.player, engine.powerNode) < 130);
  // V51 consumes pending power before archive: do not delegate and silently
  // activate the power terminal without showing its authored narrative.
  assert.equal(engine.forgePreferredUseV156().kind, 'narrative'); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.equal(engine.powerNode.active, true);
  assert.equal(engine.archiveTerminal.recovered, false); engine.closeForgeNarrativeV156();
  const intel = engine.inventory.intel;
  assert.equal(engine.forgePreferredUseV156().kind, 'native-terminal'); assert.match(engine.getInteractionPrompt(), /EXTRAIRE LES ARCHIVES/);
  tap(runtime); assert.equal(engine.archiveTerminal.recovered, true); assert.equal(engine.inventory.intel, intel + 3);
  assert.equal(engine.forgeNarrativeOpenV156 || null, null);
});

test('review native priority: either operator can revive the other through real E/Y before a neighboring story', t => {
  const boundaryActor = { x: 0, y: 0, w: 42, h: 92, alive: true };
  const boundaryAlly = { x: 86, y: 0, w: 42, h: 92, downed: true };
  const boundaryOwner = { player: boundaryActor, coop: boundaryAlly, coopEnabled: true, drops: [], forgePendingTerminalV156: () => ({}) };
  const productionSelector = missionV136({ editorProject: closeObjectiveProjectV156(), forgeJourneyV141: true }).engine;
  t.after(() => productionSelector.stop());
  // Read-only reach fixtures match the V51 revive predicate at <= 86, without
  // moving either live operator used in the keyboard integration below.
  assert.equal(productionSelector.forgeUrgentNativeUseV156.call(boundaryOwner, boundaryActor), 'revive');
  boundaryAlly.x = 86.001;
  assert.equal(productionSelector.forgeUrgentNativeUseV156.call(boundaryOwner, boundaryActor), null);
  productionSelector.stop();
  for (const helperRole of ['player', 'coop']) {
    const runtime = missionV136({ editorProject: closeObjectiveProjectV156(), forgeJourneyV141: true }), { engine } = runtime;
    t.after(() => engine.stop()); engine.setCoop(true);
    walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156()));
    engine.keys.add('KeyL');
    for (let frame = 0; frame < 1800 && centerDistanceV156(engine.player, engine.coop) > 50; frame++) engine.update(1 / 60);
    engine.keys.delete('KeyL'); assert.ok(centerDistanceV156(engine.player, engine.coop) <= 50);
    const helper = engine[helperRole], target = helperRole === 'player' ? engine.coop : engine.player;
    engine.damagePlayer(target, 999, { bypassCover: true, source: 'qa-native-revive-priority' });
    assert.equal(target.downed, true); assert.equal(engine.mission.state, 'active');
    assert.equal(engine.forgeUrgentNativeUseV156(helper), 'revive'); assert.match(engine.getInteractionPrompt(helper), /RÉANIMER LE COÉQUIPIER/);
    tap(runtime, helperRole === 'player' ? 'KeyE' : 'KeyY');
    assert.equal(target.downed, false); assert.equal(target.alive, true); assert.equal(target.health, 38);
    assert.equal(engine.powerNode.active, false); assert.equal(engine.forgeNarrativeOpenV156 || null, null);
    assert.deepEqual(engine.forgeSessionV141.narrativeV156 || [], []);
    assert.equal(runtime.messages.filter(event => event.type === 'marine-revived').length, 1);
    engine.stop();
  }
});

test('review native priority: a genuine key-carrier drop is taken before a story and uses the inherited resource effects once', t => {
  const input = closeObjectiveProjectV156({ goalX: 2, terminalX: 5 });
  for (const [index, x] of [6, 15, 20].entries()) input.rooms[0].cells.push({ id: `enemy-${index}`, x, y: 15, type: 'enemy', layer: 'gameplay' });
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop()); const carrier = engine.enemies.find(enemy => enemy.keyCarrier); assert.ok(carrier);
  // Defeat through the production method so the key and its pickup identity
  // come from the native drop factory, rather than an injected pickup record.
  engine.defeatEnemy(carrier, engine.player);
  const key = engine.drops.find(drop => drop.type === 'security-key'); assert.ok(key);
  walk(engine, () => centerDistanceV156(engine.player, key) < 95 && Boolean(engine.forgeNarrativeTerminalV156()));
  const before = engine.inventory.securityKeys;
  assert.match(engine.getInteractionPrompt(), /RÉCUPÉRER LE BADGE/); tap(runtime);
  assert.equal(key.taken, true); assert.equal(engine.inventory.securityKeys, before + 1);
  assert.equal(engine.forgeNarrativeOpenV156 || null, null); assert.equal(engine.powerNode.active, false);
  assert.equal(runtime.messages.filter(event => event.type === 'resource' && event.resource === 'security-key').length, 1);
  assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.equal(engine.inventory.securityKeys, before + 1);
});

for (const name of ['Compound Bow', 'Harpoon Gun']) test(`review native priority: ${name} projectile recovery keeps its owner and resource effects before rereading an activated story`, t => {
  const input = closeObjectiveProjectV156({ goalX: 2, terminalX: 5 });
  const weapon = WEAPONS.find(entry => entry.name === name); assert.ok(weapon);
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true, weapon }), { engine } = runtime;
  t.after(() => engine.stop()); walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156())); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); engine.closeForgeNarrativeV156();
  // Start inside the console's reach, so approaching the left-hand impact
  // does not leave the very interaction overlap this regression exercises.
  walk(engine, () => centerDistanceV156(engine.player, engine.powerNode) < 45);
  for (let frame = 0; frame < 90; frame++) engine.update(1 / 60);
  // A declared temporary impact surface creates a native recoverable projectile.
  // Remove it before approach, so the pickup has the same clear LOS as its
  // ordinary-terminal control; no actor/projectile/pickup position is injected.
  const wall = { id: 'qa-recovery-impact', x: engine.player.x - 60, y: 600, w: 3, h: 360 };
  engine.walls.push(wall); engine.player.pointerAimV83 = { x: -1, y: 0 };
  assert.equal(engine.fire(engine.player), true);
  for (let frame = 0; frame < 180 && !engine.recoverableWeaponsV131?.length; frame++) engine.update(1 / 60);
  const item = engine.recoverableWeaponsV131?.[0]; assert.ok(item, `${name} native impact produced a pickup`);
  assert.equal(item.owner, engine.player); assert.equal(item.weaponId, weapon.id);
  engine.walls.splice(engine.walls.indexOf(wall), 1);
  engine.player.pointerAimV83 = null;
  engine.keys.add('KeyA');
  for (let frame = 0; frame < 900 && Math.hypot(item.x - engine.player.x - engine.player.w / 2, item.y - engine.player.y - engine.player.h / 2) > 68; frame++) engine.update(1 / 60);
  engine.keys.delete('KeyA');
  assert.equal(engine.recoverableWeaponIndexV131(engine.player), 0, JSON.stringify({
    actor: { x: engine.player.x, y: engine.player.y, w: engine.player.w, h: engine.player.h, alive: engine.player.alive },
    pickup: { x: item.x, y: item.y }, distance: Math.hypot(item.x-engine.player.x-engine.player.w/2,item.y-engine.player.y-engine.player.h/2),
    profile: engine.weaponActionProfileV131(engine.player)?.weaponId, allowed: engine.canPerformGameplayAction(engine.player), walls: engine.walls.map(wall=>wall.id) }));
  assert.ok(centerDistanceV156(engine.player, engine.powerNode) < 130);
  assert.equal(engine.forgeUrgentNativeUseV156(), 'recoverable-weapon');
  assert.match(engine.getInteractionPrompt(), /RÉCUPÉRER/);
  const reserve = engine.player.ammoReserve;
  tap(runtime); assert.equal(engine.recoverableWeaponsV131.length, 0); assert.equal(engine.player.ammoReserve, reserve + 1);
  assert.equal(engine.forgeNarrativeOpenV156 || null, null); assert.equal(engine.powerNode.active, true);
  assert.equal(runtime.messages.filter(event => event.type === 'weapon-recovered-v131').length, 1);
  assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.equal(engine.player.ammoReserve, reserve + 1);
});

function nativeRecoverableFixtureV156(t, { name = 'Compound Bow', archive = false, journey = true, objective = false, unlinkedDoor = false, nearObjective = false } = {}) {
  const input = closeObjectiveProjectV156(unlinkedDoor || nearObjective ? { size: [128, 72], spawnX: 8, goalX: nearObjective ? 12 : 2, terminalX: 11 }
    : { goalX: objective ? 5 : 2, terminalX: 5, secondTerminalX: archive ? 6 : null });
  if (unlinkedDoor) input.rooms[0].cells.push({ id: 'unlinked-door', x: 12, y: 69, type: 'door', layer: 'gameplay' });
  if (objective) input.rooms[0].cells = input.rooms[0].cells.filter(cell => cell.type !== 'terminal');
  const weapon = WEAPONS.find(entry => entry.name === name); assert.ok(weapon);
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: journey, weapon }), { engine } = runtime;
  t.after(() => engine.stop());
  const target = objective ? engine.objective : archive ? engine.archiveTerminal : engine.powerNode;
  walk(engine, () => centerDistanceV156(engine.player, target) < (unlinkedDoor ? 75 : 45));
  for (let frame = 0; frame < 90; frame++) engine.update(1 / 60);
  const impact = { id: 'qa-admission-projectile-impact', x: engine.player.x - 60, y: engine.player.y - 100, w: 3, h: engine.player.h + 200 };
  engine.walls.push(impact); engine.player.pointerAimV83 = { x: -1, y: 0 };
  assert.equal(engine.fire(engine.player), true);
  for (let frame = 0; frame < 180 && !engine.recoverableWeaponsV131?.length; frame++) engine.update(1 / 60);
  const item = engine.recoverableWeaponsV131?.[0]; assert.ok(item, `${name} native impact produced a pickup`);
  engine.walls.splice(engine.walls.indexOf(impact), 1); engine.player.pointerAimV83 = null;
  engine.keys.add('KeyA');
  for (let frame = 0; frame < 900 && Math.hypot(item.x - engine.player.x - engine.player.w / 2, item.y - engine.player.y - engine.player.h / 2) > 68; frame++) engine.update(1 / 60);
  engine.keys.delete('KeyA');
  assert.equal(engine.recoverableWeaponIndexV131(engine.player), 0);
  assert.equal(item.owner, engine.player); assert.equal(item.weaponId, weapon.id);
  assert.ok(centerDistanceV156(engine.player, target) < 130, JSON.stringify({actor: {x:engine.player.x,y:engine.player.y,w:engine.player.w,h:engine.player.h},target,item:{x:item.x,y:item.y},distance:centerDistanceV156(engine.player,target)}));
  return { ...runtime, item, target };
}

for (const name of ['Compound Bow', 'Harpoon Gun']) for (const blocked of ['power-wall', 'archive-boss']) {
  test(`review blocked-terminal admission: ${name} recovers its real projectile despite ${blocked}, then retains the lock`, t => {
    const runtime = nativeRecoverableFixtureV156(t, { name, archive: blocked === 'archive-boss' }), { engine, item, target } = runtime;
    let partition;
    if (blocked === 'power-wall') {
      // This partition blocks only the console to the right. The actual native
      // pickup to the left keeps its strict, independently asserted clear LOS.
      const actorCenter = engine.player.x + engine.player.w / 2, terminalCenter = target.x + target.w / 2;
      assert.ok(terminalCenter > actorCenter);
      partition = { id: 'qa-admission-sealed-power', x: (actorCenter + terminalCenter) / 2, y: engine.player.y - 10, w: 4, h: engine.player.h + 20 };
      engine.walls.push(partition); assert.equal(engine.forgeInteractionClearV141(engine.player, target), false);
    } else {
      engine.powerNode.active = true; engine.mission.objectives.power = true;
      engine.mission.objectives.boss = false;
      assert.equal(engine.forgeInteractionClearV141(engine.player, target), true);
    }
    assert.equal(engine.admitNativeTerminalInteractionV156(engine.player, target), false);
    assert.equal(engine.forgePendingTerminalV156(), null);
    assert.equal(engine.forgePendingTerminalV156(engine.player, { includeBlocked: true }), target);
    assert.equal(engine.recoverableWeaponIndexV131(engine.player), 0);
    // Reading the selectors and prompt cannot consume or move the pickup.
    const before = { reserve: engine.player.ammoReserve, events: runtime.messages.length, x: item.x, y: item.y };
    assert.equal(engine.forgeUrgentNativeUseV156(), 'recoverable-weapon'); assert.match(engine.getInteractionPrompt(), /RÉCUPÉRER/);
    assert.equal(engine.player.ammoReserve, before.reserve); assert.equal(runtime.messages.length, before.events);
    assert.equal(engine.recoverableWeaponsV131[0], item); assert.deepEqual([item.x, item.y], [before.x, before.y]);
    tap(runtime);
    assert.equal(engine.recoverableWeaponsV131.length, 0); assert.equal(engine.player.ammoReserve, before.reserve + 1);
    assert.equal(runtime.messages.filter(event => event.type === 'weapon-recovered-v131').length, 1);
    assert.equal(engine.forgeNarrativeOpenV156 || null, null);
    assert.equal(blocked === 'power-wall' ? engine.powerNode.active : engine.archiveTerminal.recovered, false);
    const refusal = blocked === 'power-wall' ? /TERMINAL BLOQUÉ PAR UNE CLOISON/ : /NEUTRALISER LA MENACE ALPHA/;
    assert.match(engine.getInteractionPrompt(), refusal); tap(runtime);
    assert.equal(engine.player.ammoReserve, before.reserve + 1); assert.equal(engine.forgeNarrativeOpenV156 || null, null);
    assert.equal(blocked === 'power-wall' ? engine.powerNode.active : engine.archiveTerminal.recovered, false);
    if (partition) engine.walls.splice(engine.walls.indexOf(partition), 1);
    else engine.mission.objectives.boss = true;
    assert.equal(engine.forgePendingTerminalV156(), target); assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/);
    tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, blocked === 'power-wall' ? 'terminal' : 'archive');
    assert.equal(engine.player.ammoReserve, before.reserve + 1);
  });
}

for (const narrativeArchive of [false, true]) test(`review blocked-terminal admission: clear ${narrativeArchive ? 'narrative' : 'ordinary'} archive is used past blocked pending power`, t => {
  const input = closeObjectiveProjectV156({ goalX: 2, terminalX: 5, secondTerminalX: 6 });
  if (!narrativeArchive) delete input.rooms[0].cells.find(cell => cell.id === 'archive').narrative;
  const runtime = missionV136({ editorProject: input, forgeJourneyV141: true }), { engine } = runtime;
  t.after(() => engine.stop());
  walk(engine, () => centerDistanceV156(engine.player, engine.archiveTerminal) < centerDistanceV156(engine.player, engine.powerNode));
  const partition = { id: 'qa-admission-power-only', x: engine.player.x - 12, y: engine.player.y - 10, w: 6, h: engine.player.h + 20 };
  engine.walls.push(partition);
  assert.equal(engine.forgeInteractionClearV141(engine.player, engine.powerNode), false);
  assert.equal(engine.forgeInteractionClearV141(engine.player, engine.archiveTerminal), true);
  assert.equal(engine.mission.objectives.boss, true);
  assert.equal(engine.forgePendingTerminalV156(), engine.archiveTerminal);
  assert.equal(engine.forgePreferredUseV156().target, engine.archiveTerminal);
  assert.match(engine.getInteractionPrompt(), narrativeArchive ? /LIRE LE RÉCIT/ : /EXTRAIRE LES ARCHIVES/);
  const intel = engine.inventory.intel; tap(runtime);
  assert.equal(engine.powerNode.active, false); assert.equal(engine.archiveTerminal.recovered, true);
  assert.equal(engine.forgeNarrativeOpenV156 || null, narrativeArchive ? 'archive' : null);
  assert.equal(engine.inventory.intel, intel + (narrativeArchive ? 0 : 3));
  assert.equal(runtime.messages.filter(event => event.type === 'power-restored').length, 0);
  assert.equal(runtime.messages.filter(event => event.type === 'archive-recovered').length, narrativeArchive ? 0 : 1);
});

test('review blocked-terminal admission: an admitted first narrative activation still precedes a real recoverable projectile', t => {
  const runtime = nativeRecoverableFixtureV156(t), { engine, item } = runtime;
  assert.equal(engine.forgePendingTerminalV156(), engine.powerNode); assert.equal(engine.forgeUrgentNativeUseV156(), null);
  assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/); const reserve = engine.player.ammoReserve;
  tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.equal(engine.powerNode.active, true);
  assert.equal(engine.recoverableWeaponsV131[0], item); assert.equal(engine.player.ammoReserve, reserve);
  engine.closeForgeNarrativeV156(); assert.equal(engine.forgeUrgentNativeUseV156(), 'recoverable-weapon'); tap(runtime);
  assert.equal(engine.recoverableWeaponsV131.length, 0); assert.equal(engine.player.ammoReserve, reserve + 1);
});

test('review blocked-terminal admission: outside the Forge journey native power keeps its historical wall-blind priority', t => {
  const runtime = nativeRecoverableFixtureV156(t, { journey: false }), { engine, item } = runtime;
  assert.equal(engine.forgeSessionV141, null);
  const actorCenter = engine.player.x + engine.player.w / 2, terminalCenter = engine.powerNode.x + engine.powerNode.w / 2;
  const partition = { id: 'qa-native-baseline-partition', x: (actorCenter + terminalCenter) / 2, y: engine.player.y - 10, w: 4, h: engine.player.h + 20 };
  engine.walls.push(partition);
  assert.equal(engine.forgeInteractionClearV141(engine.player, engine.powerNode), false);
  assert.equal(engine.admitNativeTerminalInteractionV156(engine.player, engine.powerNode), true);
  assert.equal(engine.recoverableWeaponIndexV131(), 0); assert.match(engine.getInteractionPrompt(), /RÉTABLIR LE CIRCUIT/);
  tap(runtime); assert.equal(engine.powerNode.active, true); assert.equal(engine.recoverableWeaponsV131[0], item);
  assert.equal(runtime.messages.filter(event => event.type === 'power-restored').length, 1);
});

test('review recovery boundary: a ready Forge objective validates then extracts separately while its real projectile stays untouched', t => {
  const runtime = nativeRecoverableFixtureV156(t, { objective: true }), { engine, item } = runtime;
  assert.equal(engine.powerNode, null); assert.equal(engine.archiveTerminal, null);
  assert.ok(centerDistanceV156(engine.player, engine.objective) < 125);
  assert.equal(engine.forgePreferredUseV156().kind, 'objective'); assert.equal(engine.forgeUrgentNativeUseV156(), null);
  const reserve = engine.player.ammoReserve;
  assert.match(engine.getInteractionPrompt(), /VALIDER L’OBJECTIF/); tap(runtime);
  assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal']); assert.equal(engine.mission.state, 'active');
  assert.equal(engine.recoverableWeaponsV131[0], item); assert.equal(engine.player.ammoReserve, reserve);
  assert.match(engine.getInteractionPrompt(), /CONFIRMER L’EXTRACTION FORGE/); tap(runtime);
  assert.equal(engine.mission.state, 'complete'); assert.equal(engine.recoverableWeaponsV131[0], item);
  assert.equal(engine.player.ammoReserve, reserve); assert.equal(runtime.messages.filter(event => event.type === 'weapon-recovered-v131').length, 0);
  assert.equal(runtime.messages.filter(event => event.type === 'forge-objective-complete').length, 1);
});

for (const completed of [false, true]) test(`review recovery boundary: real pickup cannot delegate ${completed ? 'extraction' : 'validation'} through a sealed Forge objective`, t => {
  const runtime = nativeRecoverableFixtureV156(t, { objective: true }), { engine, item } = runtime;
  if (completed) { tap(runtime); assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal']); }
  const actorCenter = engine.player.x + engine.player.w / 2, targetCenter = engine.objective.x + engine.objective.w / 2;
  assert.ok(targetCenter > actorCenter);
  const partition = { id: 'qa-recovery-objective-partition', x: (actorCenter + targetCenter) / 2, y: engine.player.y - 10, w: 4, h: engine.player.h + 20 };
  engine.walls.push(partition);
  assert.equal(engine.recoverableWeaponIndexV131(), 0); assert.equal(engine.forgeInteractionClearV141(engine.player, engine.objective), false);
  assert.equal(engine.forgePreferredUseV156(), null); assert.equal(engine.forgeUrgentNativeUseV156(), null);
  const reserve = engine.player.ammoReserve, ledger = [...engine.forgeSessionV141.completedObjectives];
  assert.match(engine.getInteractionPrompt(), /OBJECTIF BLOQUÉ PAR UNE CLOISON/); tap(runtime);
  assert.equal(engine.mission.state, 'active'); assert.deepEqual(engine.forgeSessionV141.completedObjectives, ledger);
  assert.equal(engine.recoverableWeaponsV131[0], item); assert.equal(engine.player.ammoReserve, reserve);
  assert.equal(runtime.messages.filter(event => event.type === 'weapon-recovered-v131').length, 0);
  engine.walls.splice(engine.walls.indexOf(partition), 1);
  assert.equal(engine.forgePreferredUseV156().kind, 'objective'); tap(runtime);
  assert.equal(engine.mission.state, completed ? 'complete' : 'active'); assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal']);
});

test('review recovery boundary: an ordinary unlinked door behind a partition cannot be opened by recovery delegation', t => {
  const runtime = nativeRecoverableFixtureV156(t, { unlinkedDoor: true }), { engine, item } = runtime;
  // First activation still belongs to the narrative; recovery cannot silently
  // activate it. Closing the story leaves a genuine pending native pickup.
  tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); engine.closeForgeNarrativeV156();
  const door = engine.doors[0]; assert.ok(door); assert.equal(door.open, false);
  assert.equal(engine.forgeLinkedDoorV141(), null);
  const actorCenter = engine.player.x + engine.player.w / 2, doorCenter = door.x + door.w / 2;
  assert.ok(Math.abs(actorCenter - doorCenter) < 118); assert.ok(Math.abs(engine.player.y - door.y) < door.h + 60);
  const partition = { id: 'qa-recovery-unlinked-door-partition', x: (actorCenter + doorCenter) / 2,
    y: engine.player.y - 10, w: 4, h: engine.player.h + 20 };
  engine.walls.push(partition);
  // Seal the story as well so this exercise reaches the legacy door fallback.
  assert.equal(engine.forgeInteractionClearV141(engine.player, engine.powerNode), false);
  assert.equal(engine.forgeInteractionClearV141(engine.player, door), false); assert.equal(engine.recoverableWeaponIndexV131(), 0);
  assert.equal(engine.forgeUrgentNativeUseV156(), null); assert.match(engine.getInteractionPrompt(), /SAS BLOQUÉ PAR UNE CLOISON/);
  const reserve = engine.player.ammoReserve; tap(runtime);
  assert.equal(door.open, false); assert.equal(engine.recoverableWeaponsV131[0], item); assert.equal(engine.player.ammoReserve, reserve);
  assert.equal(engine.mission.state, 'active'); assert.equal(engine.forgeNarrativeOpenV156 || null, null);
  assert.ok(runtime.messages.some(event => event.type === 'locked' && /SAS INACCESSIBLE/.test(event.requirement)));
});

test('review recovery boundary: completed nearby objective cannot extract through native recovery when its rereadable story is nearer', t => {
  const runtime = nativeRecoverableFixtureV156(t, { nearObjective: true }), { engine, item } = runtime;
  tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); engine.closeForgeNarrativeV156();
  walk(engine, () => engine.forgePreferredUseV156()?.kind === 'objective');
  assert.match(engine.getInteractionPrompt(), /VALIDER L’OBJECTIF/); tap(runtime);
  assert.deepEqual(engine.forgeSessionV141.completedObjectives, ['goal']); assert.equal(engine.mission.state, 'active');
  walk(engine, () => engine.recoverableWeaponIndexV131() >= 0 && engine.forgePreferredUseV156()?.kind === 'narrative', -1);
  assert.ok(centerDistanceV156(engine.player, engine.objective) < 125);
  assert.ok(centerDistanceV156(engine.player, engine.powerNode) < centerDistanceV156(engine.player, engine.objective));
  assert.equal(engine.forgeUrgentNativeUseV156(), null); assert.equal(engine.recoverableWeaponIndexV131(), 0);
  const reserve = engine.player.ammoReserve;
  assert.match(engine.getInteractionPrompt(), /LIRE LE RÉCIT/); tap(runtime);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.equal(engine.mission.state, 'active');
  assert.equal(engine.recoverableWeaponsV131[0], item); assert.equal(engine.player.ammoReserve, reserve);
  assert.equal(runtime.messages.filter(event => event.type === 'weapon-recovered-v131').length, 0);
});

const narrativePadV156 = (index, held = [], axes = [0, 0, 0, 0]) => ({ connected: true, mapping: 'standard', index,
  id: `forge-story-pad-${index}`, axes, buttons: Array.from({ length: 17 }, (_, button) => ({ pressed: held.includes(button), value: held.includes(button) ? 1 : 0 })) });
async function narrativePreviewFixtureV156(t, opener = 0) {
  const equipment = EQUIPMENT.find(item => item.name === 'Portable Sentry'); assert.ok(equipment);
  const runtime = missionV136({ editorProject: closeObjectiveProjectV156({ goalX: 2, terminalX: 5 }), forgeJourneyV141: true, equipment: [equipment] });
  const { engine } = runtime; t.after(() => engine.stop());
  await Promise.resolve();
  engine.setCoop(true); walk(engine, () => Boolean(engine.forgeNarrativeTerminalV156()));
  if (opener === 1) {
    engine.keys.add('KeyL');
    for (let frame = 0; frame < 2200 && !engine.forgeNarrativeTerminalV156(engine.coop); frame++) engine.update(1 / 60);
    engine.keys.delete('KeyL'); assert.ok(engine.forgeNarrativeTerminalV156(engine.coop));
  }
  assert.equal(engine.useEquipment(equipment.id, engine.player), true);
  assert.equal(engine.placeablePreviewsV86.size, 1); assert.equal(engine.isPlaceableBusyV86(engine.player), false);
  return runtime;
}
const previewResourcesV156 = engine => structuredClone({ previews: [...engine.placeablePreviewsV86], tasks: [...engine.placeableTasksV86],
  instances: engine.placeablesV86.instances, equipment: [...engine.equipmentActions].map(([id, state]) => [id, state.remaining]), inventory: engine.inventory,
  actors: [engine.player, engine.coop].map(actor => ({ health: actor.health, armor: actor.armor, ammo: actor.ammo, ammoReserve: actor.ammoReserve,
    medkits: actor.medkits, inVehicle: actor.inVehicle })) });

for (const opener of [0, 1]) test(`review narrative gamepad: pad ${opener + 1} stops its action batch and both pads remain suppressed until neutral after closing`, async t => {
  const runtime = await narrativePreviewFixtureV156(t, opener), { engine } = runtime;
  const neutral = [narrativePadV156(0), narrativePadV156(1)]; engine.canvas.focus(); engine.gamepadInputV77.poll(neutral);
  assert.ok(engine.gamepadInputV77.slots.every(slot => slot && !slot.suppressed));
  const before = previewResourcesV156(engine), eventCount = runtime.messages.length;
  // Observe dispatch without replacing its effects: every wrapper invokes the
  // actual production method. Individual action guards must not hide a batch
  // that incorrectly continues after interact opened the dialog.
  const dispatches = [];
  for (const method of ['reload', 'interact', 'activateTracker', 'toggleVehicle', 'useMedkit', 'melee']) {
    const native = engine[method];
    engine[method] = function (...args) { dispatches.push(method); return native.apply(this, args); };
  }
  const pressed = [3, 4, 5, 8, 11], sample = neutral.map((pad, index) => index === opener ? narrativePadV156(index, pressed) : pad);
  // With J1 opening, J2 supplies a later slot of held movement/fire, pause and
  // action edges. J2 must not dispatch after the dialog opened in the first slot.
  if (opener === 0) sample[1] = narrativePadV156(1, [0, 2, 3, 4, 5, 7, 8, 9, 11], [1, 0, 1, 0]);
  engine.gamepadInputV77.poll(sample);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.equal(engine.paused, false);
  assert.deepEqual(dispatches, ['interact']);
  assert.deepEqual(previewResourcesV156(engine), before);
  assert.deepEqual(runtime.messages.slice(eventCount).map(event => event.type), ['forge-narrative-open']);
  assert.equal(engine.keys.size, 0); assert.equal(engine.heldGameplayKeysV77.size, 0);
  assert.ok(engine.gamepadInputV77.slots.every(slot => slot.suppressed));
  for (const actor of [engine.player, engine.coop]) {
    assert.equal(actor.gamepadAimV83, null); assert.equal(actor.gamepadMoveV124, null); assert.equal(actor.jumpBuffer, 0);
  }
  // A canvas focus restoration cannot make either pad active during the story,
  // including Start/button9, which is dispatched before ordinary active checks.
  engine.canvas.focus();
  const held = [narrativePadV156(0, [0, 3, 4, 5, 7, 8, 9, 11], [1, 0, 1, 0]), narrativePadV156(1, [0, 3, 4, 5, 7, 8, 9, 11], [1, 0, 1, 0])];
  const openedCount = runtime.messages.length;
  engine.gamepadInputV77.poll(held); engine.gamepadInputV77.poll(neutral);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.equal(engine.paused, false);
  assert.ok(engine.gamepadInputV77.slots.every(slot => slot.suppressed));
  assert.deepEqual(previewResourcesV156(engine), before); assert.equal(runtime.messages.length, openedCount); assert.equal(engine.keys.size, 0);
  // Sample the physical hold again before closing: Start remains the same held
  // button across the boundary, rather than a fresh pause edge after close.
  engine.gamepadInputV77.poll(held); assert.equal(engine.paused, false);
  assert.equal(runtime.messages.length, openedCount); assert.deepEqual(previewResourcesV156(engine), before);
  engine.closeForgeNarrativeV156(); assert.equal(document.activeElement, engine.canvas);
  engine.gamepadInputV77.poll(held);
  assert.equal(engine.forgeNarrativeOpenV156 || null, null); assert.equal(engine.paused, false);
  assert.ok(engine.gamepadInputV77.slots.every(slot => slot.suppressed));
  assert.deepEqual(previewResourcesV156(engine), before); assert.equal(runtime.messages.length, openedCount); assert.equal(engine.keys.size, 0);
  assert.deepEqual(dispatches, ['interact']);
  engine.gamepadInputV77.poll(neutral); assert.ok(engine.gamepadInputV77.slots.every(slot => !slot.suppressed));
  const fresh = neutral.map((pad, index) => index === opener ? narrativePadV156(index, [3]) : pad);
  engine.gamepadInputV77.poll(fresh);
  assert.equal(engine.forgeNarrativeOpenV156, 'terminal'); assert.deepEqual(previewResourcesV156(engine), before);
  assert.equal(runtime.messages.filter(event => event.type === 'placeable-task-cancelled').length, 0);
  assert.equal(runtime.messages.filter(event => event.type === 'forge-narrative-open').length, 2);
  assert.deepEqual(dispatches, ['interact', 'interact']);
});

test('review narrative gamepad: direct vehicle calls preserve the real sentry preview during a story and keep normal cancellation after close', async t => {
  const runtime = await narrativePreviewFixtureV156(t), { engine } = runtime;
  tap(runtime); assert.equal(engine.forgeNarrativeOpenV156, 'terminal');
  const before = previewResourcesV156(engine), eventCount = runtime.messages.length;
  assert.equal(engine.canPerformGameplayAction(engine.player), false);
  assert.equal(engine.toggleVehicle(engine.player), false); assert.equal(engine.toggleVehicle(engine.coop), false);
  assert.deepEqual(previewResourcesV156(engine), before); assert.equal(runtime.messages.length, eventCount);
  engine.closeForgeNarrativeV156();
  engine.toggleVehicle(engine.player);
  assert.equal(engine.placeablePreviewsV86.size, 0); assert.equal(engine.placeableTasksV86.size, 0);
  assert.deepEqual(engine.placeablesV86.instances, before.instances);
  assert.deepEqual([...engine.equipmentActions].map(([id, state]) => [id, state.remaining]), before.equipment);
  assert.equal(runtime.messages.filter(event => event.type === 'placeable-task-cancelled' && event.reason === 'vehicle').length, 1);
  // Ordinary Start still toggles pause once, and needs a fresh edge to resume.
  engine.gamepadInputV77.poll([narrativePadV156(0)]); engine.gamepadInputV77.poll([narrativePadV156(0, [9])]);
  assert.equal(engine.paused, true); engine.gamepadInputV77.poll([narrativePadV156(0, [9])]); assert.equal(engine.paused, true);
  engine.gamepadInputV77.poll([narrativePadV156(0)]); engine.gamepadInputV77.poll([narrativePadV156(0, [9])]); assert.equal(engine.paused, false);
});
