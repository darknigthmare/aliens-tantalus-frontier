import test from 'node:test';
import assert from 'node:assert/strict';
import { ForgeModel, parseProject } from '../src/forge-model-v130.js';
import { createForgeSessionV141 } from '../src/forge-journey-v141.js';
import { parseForgeNarrativeV156, openForgeNarrativeV156, chooseForgeNarrativeV156,
  forgeNarrativeViewV156, advanceForgeNarrativeTimeV157, forgeNarrativeItemsV157 } from '../src/forge-narrative-v156.js';
import { editForgeNarrativeV156, forgeNarrativeFieldsV156 } from '../src/forge-narrative-ui-v156.js';
import { captureAssemblyV133, placementPreviewV133, stampAssemblyV133, ForgeAssemblyLibraryV133 } from '../src/forge-authoring-v133.js';
import { ForgeVersionStoreV136, parseForgeVersionsV136 } from '../src/forge-versions-v136.js';
import { missionV136, hostV136 } from './forge-native-host-v136.mjs';
import { HubGame as PhysicalHub } from '../src/hub-v51-runtime.js';
import { withForgeShipRuntimeV141 } from '../src/forge-ship-runtime-v141.js';

function project(kind = 'mission') {
  const floor = kind === 'mission' ? 16 : 15;
  const story = (title, choice, items) => ({ schema: 1, title, start: 'start', ...(items ? { items } : {}), nodes: [
    { id: 'start', text: title, choices: [choice] }, { id: 'done', text: 'Rapport enregistré.', choices: [] }
  ] });
  return { schema: 3, kind, name: 'Objets et temps V157', activeRoomId: 'a', links: [], rooms: [
    { id: 'a', name: 'Relais', size: [32, 18], cells: [
      ...Array.from({ length: 32 }, (_, x) => ({ id: `floor-${x}`, x, y: floor, type: 'floor', layer: 'structure' })),
      { id: 'spawn', x: 1, y: floor - 1, type: 'spawn', layer: 'gameplay' },
      { id: 'goal', x: 28, y: floor - 1, type: 'objective', layer: 'gameplay' },
      { id: 'supply', x: 4, y: floor - 1, type: 'terminal', layer: 'gameplay', narrative: story('Délivrance du badge',
        { id: 'take', label: 'Prendre le badge de récit', next: 'done', rewardItemId: 'badge' }, [{ id: 'badge', label: 'Badge du relais' }]) },
      { id: 'relay', x: 9, y: floor - 1, type: 'terminal', layer: 'gameplay', narrative: story('Relais différé',
        { id: 'exchange', label: 'Remettre le badge et transmettre', next: 'done', requiresItemId: 'badge', consumeRequiredItem: true,
          rewardItemId: 'report', requiresPlaySeconds: 10, rewardObjectiveId: 'goal' }, [{ id: 'report', label: 'Accusé de réception' }]) }
    ] }
  ] };
}
const cell = (input, id) => input.rooms[0].cells.find(entry => entry.id === id);
const response = (input, id = 'relay') => cell(input, id).narrative.nodes[0].choices[0];
function editorFor(input = project()) {
  const model = new ForgeModel(input), editor = { model, selection: new Set(['relay']),
    selected: () => model.room.cells.filter(entry => editor.selection.has(entry.id)), assertSelectionEditable() {},
    edit: (label, fn) => model.transaction(label, fn) };
  return editor;
}
const storage = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; };

test('V157 canonical exports, named versions and terminal copies preserve shared tokens and time thresholds', () => {
  const canonical = parseProject(project());
  assert.deepEqual(parseProject(JSON.stringify(canonical)), canonical);
  const versions = new ForgeVersionStoreV136(storage()); versions.load(); versions.capture(canonical, 'Relais différé', 'conditions', 17);
  assert.deepEqual(parseForgeVersionsV136(versions.export()).entries[0].project, canonical);
  const model = new ForgeModel(canonical), clip = model.copy(['supply', 'relay']);
  let ids; model.transaction('Copier le relais', () => { ids = model.paste(clip, 15, 10); });
  const copied = model.room.cells.filter(entry => ids.includes(entry.id));
  assert.equal(copied.find(entry => entry.narrative.title === 'Délivrance du badge').narrative.items[0].id, 'badge');
  assert.equal(copied.find(entry => entry.narrative.title === 'Relais différé').narrative.nodes[0].choices[0].requiresPlaySeconds, 10);
  assert.deepEqual(forgeNarrativeItemsV157(model.data), [{ id: 'badge', label: 'Badge du relais' }, { id: 'report', label: 'Accusé de réception' }]);
});

test('V157 invalid definitions, references, consumption and clocks reject whole imports without altering the document', () => {
  for (const mutate of [
    p => cell(p, 'supply').narrative.items[0].id = '../weapon',
    p => cell(p, 'supply').narrative.items[0].label = '',
    p => cell(p, 'supply').narrative.items[0].label = 'Un nom\nune autre ligne',
    p => cell(p, 'supply').narrative.items[0].weapon = 'pulse-rifle',
    p => cell(p, 'supply').narrative.items.push({ id: 'badge', label: 'Encore' }),
    p => cell(p, 'relay').narrative.items.push({ id: 'badge', label: 'Autre nom' }),
    p => response(p).requiresItemId = 'absent',
    p => response(p).rewardItemId = 'absent',
    p => response(p).rewardItemId = 'badge',
    p => response(p).consumeRequiredItem = 1,
    p => { delete response(p).requiresItemId; },
    ...[-1, 3601, .5, '10', NaN, Infinity].map(value => p => { response(p).requiresPlaySeconds = value; }),
    p => { cell(p, 'supply').narrative.items = Array.from({ length: 17 }, (_, i) => ({ id: `item-${i}`, label: `Objet ${i}` })); }
  ]) {
    const editor = new ForgeModel(project()), before = structuredClone(editor.data), bad = project(); mutate(bad);
    assert.throws(() => editor.load(bad), /Récit Forge/); assert.deepEqual(editor.data, before); assert.equal(editor.history.length, 0);
  }
  const tooMany = project();
  for (let i = 0; i < 3; i++) tooMany.rooms[0].cells.push({ id: `extra-${i}`, x: 15 + i, y: 15, type: 'terminal', layer: 'gameplay', narrative: {
    schema: 1, title: 'Inventaire', start: 'start', items: Array.from({ length: 16 }, (_, j) => ({ id: `token-${i}-${j}`, label: `Objet ${i}/${j}` })),
    nodes: [{ id: 'start', text: 'Objets', choices: [] }]
  } });
  assert.throws(() => parseProject(tooMany), /32 objets/);
});

test('V157 assembly libraries retain external item bindings while preview and stamping enforce the real project declarations', () => {
  const model = new ForgeModel(project()), assembly = captureAssemblyV133(model, ['relay'], 'Relais externe');
  const library = new ForgeAssemblyLibraryV133(storage()); library.load(); library.add(assembly);
  const restored = JSON.parse(library.export()).entries[0];
  assert.equal(restored.cells[0].narrative.nodes[0].choices[0].requiresItemId, 'badge');
  assert.equal(placementPreviewV133(model, restored, 17, 10).ok, true);
  const ids = stampAssemblyV133(model, restored, 17, 10);
  assert.equal(model.room.cells.find(entry => ids.includes(entry.id)).narrative.nodes[0].choices[0].requiresItemId, 'badge');
  model.undo();
  const absent = project(); absent.rooms[0].cells = absent.rooms[0].cells.filter(entry => !['supply', 'relay'].includes(entry.id));
  const target = new ForgeModel(absent), before = structuredClone(target.data);
  assert.match(placementPreviewV133(target, restored, 17, 10).errors[0], /objet de récit externe introuvable : badge/);
  assert.throws(() => stampAssemblyV133(target, restored, 17, 10), /badge/); assert.deepEqual(target.data, before);
  const conflicting = project(); cell(conflicting, 'relay').narrative.items[0].label = 'Nom étranger';
  const conflictTarget = new ForgeModel(conflicting);
  assert.match(placementPreviewV133(conflictTarget, restored, 17, 10).errors[0], /nom d’objet de récit différent : report/);
});

test('V157 assembly preview rejects a 33rd unique token before stamping but admits copies of the existing 32 identities', () => {
  const input = project();
  for (const terminalId of ['supply', 'relay']) cell(input, terminalId).narrative.items.push(...Array.from({ length: 15 }, (_, index) => ({
    id: `${terminalId}-token-${index}`, label: `${terminalId} / objet ${index}`
  })));
  const model = new ForgeModel(input), before = structuredClone(model.data);
  assert.equal(forgeNarrativeItemsV157(model.data).length, 32);
  const extra = { name: 'Objet supplémentaire', cells: [{ id: 'extra-terminal', type: 'terminal', layer: 'gameplay', x: 0, y: 0,
    narrative: { schema: 1, title: 'Objet supplémentaire', start: 'start', items: [{ id: 'token-33', label: 'Trente-troisième objet' }],
      nodes: [{ id: 'start', text: 'Nouveau jeton.', choices: [] }] } }] };
  const refused = placementPreviewV133(model, extra, 17, 10);
  assert.equal(refused.ok, false); assert.match(refused.errors[0], /32 objets de récit uniques maximum/);
  assert.throws(() => stampAssemblyV133(model, extra, 17, 10), /32 objets de récit uniques maximum/);
  assert.deepEqual(model.data, before); assert.equal(model.history.length, 0);
  const copied = captureAssemblyV133(model, ['supply', 'relay'], 'Copie des mêmes objets');
  assert.equal(placementPreviewV133(model, copied, 17, 10).ok, true);
  assert.equal(stampAssemblyV133(model, copied, 17, 10).length, 2);
  assert.equal(forgeNarrativeItemsV157(model.data).length, 32);
  model.undo(); assert.deepEqual(model.data, before);
});

test('V157 actual inspector creates definitions and edits token/time conditions transactionally with undo and escaping', () => {
  const editor = editorFor(), initial = structuredClone(editor.model.data);
  editForgeNarrativeV156(editor, 'story-items-save', key => key === 'story-items' ? 'report | Accusé de réception\nseal | <sceau>' : '');
  assert.ok(forgeNarrativeFieldsV156(editor, editor.selected()[0], 'start').includes('&lt;sceau&gt;'));
  const fields = { 'story-node': 'start', 'story-title': 'Rapport du relais', 'story-text': 'Échange différé',
    'story-choice-0-label': 'Transmettre', 'story-choice-0-next': 'done', 'story-choice-0-item-requires': 'badge',
    'story-choice-0-item-consume': 'yes', 'story-choice-0-item-reward': 'seal', 'story-choice-0-seconds': '12' };
  editForgeNarrativeV156(editor, 'story-save', key => fields[key] || '');
  const edited = response(editor.model.data);
  assert.equal(edited.requiresItemId, 'badge'); assert.equal(edited.consumeRequiredItem, true); assert.equal(edited.rewardItemId, 'seal'); assert.equal(edited.requiresPlaySeconds, 12);
  const valid = structuredClone(editor.model.data);
  assert.throws(() => editForgeNarrativeV156(editor, 'story-items-save', key => key === 'story-items' ? 'report | Accusé de réception' : ''), /seal|introuvable/);
  // Removing an unused declaration is allowed. Removing the referenced one is not.
  assert.deepEqual(editor.model.data, valid);
  while (editor.model.undo()) {} assert.deepEqual(editor.model.data, initial);
});

test('V157 all requirements precede atomic token consumption, objective rewards and cursor advancement', () => {
  const input = project(); response(input).requiresObjectiveId = 'goal'; delete response(input).rewardObjectiveId;
  const session = createForgeSessionV141(input);
  openForgeNarrativeV156(session, 'supply'); assert.equal(chooseForgeNarrativeV156(session, 'supply', 'take').rewardedItemId, 'badge');
  openForgeNarrativeV156(session, 'relay');
  let before = structuredClone(session), result = chooseForgeNarrativeV156(session, 'relay', 'exchange');
  assert.equal(result.reason, 'objective-required'); assert.deepEqual(result.blockedReasons.map(entry => entry.reason), ['objective-required', 'play-time-required']); assert.deepEqual(session, before);
  session.completedObjectives.push('goal'); before = structuredClone(session);
  assert.equal(chooseForgeNarrativeV156(session, 'relay', 'exchange').reason, 'play-time-required'); assert.deepEqual(session, before);
  for (let i = 0; i < 600; i++) advanceForgeNarrativeTimeV157(session, 1 / 60);
  result = chooseForgeNarrativeV156(session, 'relay', 'exchange');
  assert.equal(result.ok, true); assert.equal(result.consumedItemId, 'badge'); assert.equal(result.rewardedItemId, 'report');
  assert.deepEqual(session.narrativeInventoryV157, ['report']);
  before = structuredClone(session); assert.equal(chooseForgeNarrativeV156(session, 'relay', 'exchange').ok, false); assert.deepEqual(session, before);
  assert.equal(chooseForgeNarrativeV156(session, 'supply', 'take').ok, false); assert.deepEqual(session, before);
});

test('V157 missing inventory refuses before time, and duplicate grants remain unique without a native equipment API', () => {
  const input = project(); response(input, 'supply').next = null;
  const extra = structuredClone(cell(input, 'supply')); extra.id = 'duplicate-supply'; extra.x = 12; input.rooms[0].cells.push(extra);
  const session = createForgeSessionV141(input); openForgeNarrativeV156(session, 'relay');
  const before = structuredClone(session); assert.equal(chooseForgeNarrativeV156(session, 'relay', 'exchange').reason, 'item-required'); assert.deepEqual(session, before);
  for (const id of ['supply', 'duplicate-supply']) { openForgeNarrativeV156(session, id); assert.equal(chooseForgeNarrativeV156(session, id, 'take').ok, true); }
  assert.deepEqual(session.narrativeInventoryV157, ['badge']);
  assert.equal(Object.hasOwn(session, 'weapons'), false); assert.equal(Object.hasOwn(session, 'resources'), false);
});

test('V157 clock rejects non-finite/negative steps, clamps delayed frames and saturates at the documented threshold', () => {
  const session = createForgeSessionV141(project());
  for (const invalid of [-1, NaN, Infinity, '1']) advanceForgeNarrativeTimeV157(session, invalid);
  assert.equal(session.narrativePlaySecondsV157, undefined);
  advanceForgeNarrativeTimeV157(session, 60); assert.equal(session.narrativePlaySecondsV157, .05);
  session.narrativePlaySecondsV157 = 3599.99; advanceForgeNarrativeTimeV157(session, .05); assert.equal(session.narrativePlaySecondsV157, 3600);
});

function tap(runtime, code = 'KeyE') {
  for (const type of ['keydown', 'keyup']) {
    const event = new Event(type, { cancelable: true }); Object.assign(event, { code, repeat: false, ctrlKey: false, altKey: false, metaKey: false }); runtime.events.dispatchEvent(event);
  }
}
function walkTo(runtime, id) {
  const { engine } = runtime;
  const reached = () => engine.forgeSessionV141.kind === 'mission'
    ? engine.forgeNarrativeTerminalV156()?.forgeCellIdV141 === id : engine.nearestForgeInteractionV141()?.entity.cellId === id;
  engine.keys.add('KeyD');
  for (let i = 0; i < 2200 && !reached(); i++) engine.update(1 / 60);
  engine.keys.delete('KeyD'); assert.ok(reached(), `native walk reaches ${id}`);
}
for (const kind of ['mission', 'ship']) test(`V157 native ${kind} E exchanges authored tokens across terminals after active game time and never advances while reading`, t => {
  let runtime;
  const campaign = { playerHealth: 93, resources: { credits: 782 } }, campaignBefore = structuredClone(campaign), persists = [];
  if (kind === 'mission') runtime = missionV136({ editorProject: project(kind), forgeJourneyV141: true });
  else {
    const browser = hostV136(), Runtime = withForgeShipRuntimeV141(PhysicalHub);
    const engine = new Runtime(browser.canvas, { onAction() {}, onPersist: patch => persists.push(patch) });
    engine.start(campaign, { editorProject: project(kind), forgeJourneyV141: true }); runtime = { ...browser, engine };
  }
  const { engine } = runtime; t.after(() => engine.stop(false));
  const equipmentBefore = kind === 'mission' ? { ammo: engine.player.ammo, reserve: engine.player.reserve, weapon: engine.player.weapon?.id } : null;
  walkTo(runtime, 'supply'); tap(runtime);
  assert.equal(engine.chooseForgeNarrativeV156('take').ok, true); assert.deepEqual(engine.forgeSessionV141.narrativeInventoryV157, ['badge']); engine.closeForgeNarrativeV156();
  walkTo(runtime, 'relay'); tap(runtime);
  const session = engine.forgeSessionV141, observed = { x: engine.player.x, y: engine.player.y, time: session.narrativePlaySecondsV157, history: structuredClone(session.narrativeV156) };
  assert.equal(forgeNarrativeViewV156(session, 'relay').choices[0].available, false);
  assert.equal(engine.chooseForgeNarrativeV156('exchange').reason, 'play-time-required');
  engine.keys.add('KeyD'); engine.keys.add('KeyF'); for (let i = 0; i < 1200; i++) engine.update(1 / 60);
  assert.equal(engine.player.x, observed.x); assert.equal(engine.player.y, observed.y); assert.equal(session.narrativePlaySecondsV157, observed.time); assert.deepEqual(session.narrativeV156, observed.history);
  engine.closeForgeNarrativeV156();
  if (kind === 'mission') {
    tap(runtime, 'KeyP'); const paused = session.narrativePlaySecondsV157; for (let i = 0; i < 120; i++) engine.update(1 / 60); assert.equal(session.narrativePlaySecondsV157, paused); tap(runtime, 'KeyP');
    engine.enemyAtlasLoadingPausedV65 = true; for (let i = 0; i < 120; i++) engine.update(1 / 60); assert.equal(session.narrativePlaySecondsV157, paused); engine.enemyAtlasLoadingPausedV65 = false;
  } else {
    engine.pause(); const paused = session.narrativePlaySecondsV157; for (let i = 0; i < 120; i++) engine.update(1 / 60); assert.equal(session.narrativePlaySecondsV157, paused); engine.resume();
  }
  for (let i = 0; i < 700 && (session.narrativePlaySecondsV157 || 0) < 10.1; i++) engine.update(1 / 60);
  tap(runtime); assert.equal(forgeNarrativeViewV156(session, 'relay').choices[0].available, true);
  const result = engine.chooseForgeNarrativeV156('exchange'); assert.equal(result.ok, true); assert.deepEqual(session.narrativeInventoryV157, ['report']); assert.ok(session.completedObjectives.includes('goal'));
  assert.deepEqual(campaign, campaignBefore);
  if (kind === 'mission') assert.deepEqual({ ammo: engine.player.ammo, reserve: engine.player.reserve, weapon: engine.player.weapon?.id }, equipmentBefore);
  else { engine.persist(); const patch = persists.at(-1); assert.deepEqual(patch.forgeSessionV141.narrativeInventoryV157, ['report']); assert.equal(Object.hasOwn(patch, 'resources'), false); }
});

for (const kind of ['mission', 'ship']) test(`V157 native ${kind} door travel carries story inventory and game time into a different authored room`, t => {
  const input = project(kind), first = input.rooms[0], floor = kind === 'mission' ? 16 : 15;
  const receiver = cell(input, 'relay'); first.cells = first.cells.filter(entry => entry.id !== 'relay');
  first.cells.push({ id: 'a-door', x: 12, y: floor - 1, type: 'door', layer: 'gameplay' });
  input.rooms.push({ id: 'b', name: 'Réception', size: [32, 18], cells: [
    ...Array.from({ length: 32 }, (_, x) => ({ id: `b-floor-${x}`, x, y: floor, type: 'floor', layer: 'structure' })),
    { id: 'b-spawn', x: 1, y: floor - 1, type: 'spawn', layer: 'gameplay' },
    { id: 'b-door', x: 2, y: floor - 1, type: 'door', layer: 'gameplay' },
    { id: 'b-goal', x: 28, y: floor - 1, type: 'objective', layer: 'gameplay' }, receiver
  ] });
  input.links = [{ id: 'ab', from: { roomId: 'a', cellId: 'a-door' }, to: { roomId: 'b', cellId: 'b-door' }, bidirectional: true }];
  let runtime;
  if (kind === 'mission') runtime = missionV136({ editorProject: input, forgeJourneyV141: true });
  else { const browser = hostV136(), Runtime = withForgeShipRuntimeV141(PhysicalHub), engine = new Runtime(browser.canvas, { onAction() {}, onPersist() {} }); engine.start({}, { editorProject: input, forgeJourneyV141: true }); runtime = { ...browser, engine }; }
  const { engine } = runtime; t.after(() => engine.stop(false));
  walkTo(runtime, 'supply'); tap(runtime); assert.equal(engine.chooseForgeNarrativeV156('take').ok, true); engine.closeForgeNarrativeV156();
  const beforeTime = engine.forgeSessionV141.narrativePlaySecondsV157;
  const atDoor = () => kind === 'mission' ? engine.forgeLinkedDoorV141()?.door.forgeCellIdV141 === 'a-door' : engine.nearestForgeInteractionV141()?.entity.cellId === 'a-door';
  engine.keys.add('KeyD'); for (let i = 0; i < 2200 && !atDoor(); i++) engine.update(1 / 60); engine.keys.delete('KeyD'); assert.ok(atDoor());
  tap(runtime); assert.equal(engine.forgeSessionV141.currentRoomId, 'b'); assert.deepEqual(engine.forgeSessionV141.narrativeInventoryV157, ['badge']);
  assert.ok(engine.forgeSessionV141.narrativePlaySecondsV157 > beforeTime);
  walkTo(runtime, 'relay'); tap(runtime); const view = forgeNarrativeViewV156(engine.forgeSessionV141, 'relay');
  assert.equal(view.inventory[0].label, 'Badge du relais'); assert.equal(view.choices[0].blockedReasons.some(entry => entry.reason === 'item-required'), false);
});

test('V157 standalone schema-1 stories without new fields retain the exact V156 canonical contract', () => {
  const raw = { schema: 1, title: 'Historique', start: 'start', nodes: [{ id: 'start', text: 'Ancien récit', choices: [{ id: 'close', label: 'Fermer', next: null }] }] };
  assert.deepEqual(parseForgeNarrativeV156(raw, 'terminal', 'gameplay'), raw);
});
