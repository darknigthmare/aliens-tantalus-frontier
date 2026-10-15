import assert from 'node:assert/strict';
import { test } from 'node:test';
import { editorHostV140 } from './editor-native-host-v140.mjs';
import { ForgeSaveSystemV62, FORGE_SAVE_KEY_V62, FORGE_LEGACY_SAVE_KEY_V62 } from '../src/forge-save-v62.js';
import { compileEditorGridV136 } from '../src/editor-spatial-v136.js';
import { normalizeEditorProjectV135 } from '../src/editor-authoring-v135.js';
import { parseProject, nativeTiles, projectRoom } from '../src/forge-model-v130.js';
import { admittedForgeProjectV136 } from '../src/forge-playtest-v136.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES } from '../src/content.js';
const tile = (x, y, type) => ({ position: `${x}:${y}`, type });
const project = (tiles, kind = 'mission') => ({ schema: 2, kind, size: [64, 36], tiles });
const lane = () => project([...Array.from({ length: 12 }, (_, x) => tile(x, 28, 'floor')), tile(1, 27, 'spawn'), tile(10, 27, 'objective')]);
const storage = () => { const bytes = new Map(); return { bytes, getItem: key => bytes.get(key) ?? null, setItem: (key, value) => bytes.set(key, value) }; };

test('visible-layer rectangle selection and cancelled gestures do not edit or persist a document or consume redo', t => {
  const { editor, select, pointer, paint, changes } = editorHostV140(t); editor.load(lane()); paint(20, 5); editor.undo();
  const before = editor.serialize(), history = structuredClone(editor.history), future = structuredClone(editor.future), count = changes.length;
  select([0, 27], [11, 28]); assert.equal(editor.selection.size, 14);
  pointer('pointerdown', 5, 5); pointer('pointermove', 7, 7); pointer('pointercancel', 7, 7);
  assert.deepEqual(editor.serialize(), before); assert.deepEqual(editor.history, history); assert.deepEqual(editor.future, future); assert.equal(changes.length, count);
  editor.redo(); assert.equal(editor.tiles.get('20:5'), 'floor');
});

test('overlapping module moves preserve cell IDs and marker order with one complete undo command', t => {
  const { editor, select, changes } = editorHostV140(t);
  editor.load(project([tile(1, 1, 'spawn'), tile(2, 1, 'floor'), tile(15, 1, 'spawn'), tile(3, 1, 'objective')]));
  select([1, 1], [3, 1]); const before = editor.serialize(), ids = editor.room.cells.map(c => c.id), count = changes.length, depth = editor.history.length;
  editor.move(1, 0);
  assert.deepEqual(editor.serialize().tiles, [tile(2, 1, 'spawn'), tile(3, 1, 'floor'), tile(15, 1, 'spawn'), tile(4, 1, 'objective')]);
  assert.deepEqual(editor.room.cells.map(c => c.id), ids); assert.equal(editor.history.length, depth + 1); assert.equal(changes.length, count + 1);
  const after = editor.serialize(); editor.undo(); assert.deepEqual(editor.serialize(), before); editor.redo(); assert.deepEqual(editor.serialize(), after);
});

test('touch cancellation and Escape roll back whole move/selection gestures before saving', t => {
  const { editor, select, pointer, key, changes } = editorHostV140(t); editor.load(lane()); select([0, 27], [11, 28]);
  const before = editor.serialize(), count = changes.length;
  pointer('pointerdown', 1, 27, { pointerType: 'touch' }); pointer('pointermove', 51, 34, { pointerType: 'touch' });
  assert.deepEqual(editor.serialize(), before); pointer('pointercancel', 51, 34, { pointerType: 'touch' });
  assert.deepEqual(editor.serialize(), before); assert.equal(changes.length, count);
  pointer('pointerdown', 1, 27, { pointerType: 'touch' }); pointer('pointermove', 51, 34, { pointerType: 'touch' }); pointer('pointerup', 51, 34, { pointerType: 'touch' });
  assert.equal(editor.tiles.get('51:34'), 'spawn'); assert.equal(changes.length, count + 1);
  pointer('pointerdown', 0, 0); pointer('pointermove', 5, 5); key('Escape'); pointer('pointermove', 8, 8); pointer('pointerup', 8, 8);
  assert.equal(editor.selection.size, 0); assert.equal(editor.gesture, null);
});

test('occupied, out-of-bounds and locked module destinations reject atomically without save or history changes', t => {
  const { editor, select, changes } = editorHostV140(t); editor.load(project([...lane().tiles, tile(21, 31, 'wall')])); select([0, 27], [11, 28]);
  const before = editor.serialize(), history = structuredClone(editor.history), count = changes.length;
  editor.copy();
  for (const action of [() => editor.move(20, 3), () => editor.move(63, 8), () => editor.paste({ x: 20, y: 30 }), () => editor.paste({ x: -1, y: 0 })]) {
    assert.throws(action); assert.deepEqual(editor.serialize(), before); assert.deepEqual(editor.history, history); assert.equal(changes.length, count);
  }
  editor.lockedLayers.add('structure'); assert.throws(() => editor.move(1, 1), /verrouillé/); assert.deepEqual(editor.serialize(), before);
});

test('all tile types and four layers round-trip through Forge storage and compile only the active physical room', t => {
  const { editor, paint } = editorHostV140(t);
  const types = ['floor', 'platform', 'wall', 'door', 'vent', 'ladder', 'lift', 'spawn', 'objective', 'enemy', 'vehicle', 'terminal', 'hazard'];
  editor.load(project(types.map((type, x) => tile(x, 5, type)))); paint(1, 1, 'wall', 'background'); paint(1, 1, 'wall', 'foreground');
  editor.edit('Deuxième salle', () => { editor.model.addRoom(); editor.model.resize(128, 72); editor.model.paint(127, 71, 'objective', 'gameplay'); });
  const document = editor.serialize(), bytes = storage(), forge = new ForgeSaveSystemV62(bytes); forge.load(); forge.upsert({ ...document, id: 'module-roundtrip' });
  const exported = JSON.parse(forge.export()).projects[0], reloaded = new ForgeSaveSystemV62(bytes); reloaded.load(); editor.load(exported);
  assert.deepEqual(parseProject(editor.serialize()), parseProject(document)); assert.deepEqual(parseProject(reloaded.data.projects[0]), parseProject(document));
  const grid = compileEditorGridV136(editor.serialize()); assert.equal(grid.columns, 128); assert.equal(grid.rows, 72);
  assert.deepEqual(grid.tiles.map(entry => [entry.position, entry.type, entry.x, entry.y]), [['127:71', 'objective', 6151.5625, 1065]]);
  editor.setRoom(document.rooms[0].id); assert.deepEqual(compileEditorGridV136(editor.serialize()).tiles.map(c => c.type), types);
  for (const transient of ['selection', 'clipboard', 'gesture', 'viewport']) assert.equal(Object.hasOwn(exported, transient), false);
});

test('schema3 runtime projection ignores forged tiles while validating the complete document before a running mission changes', t => {
  const { editor, canvas } = editorHostV140(t); editor.load(lane()); editor.edit('Autre salle', () => { editor.model.addRoom(); editor.model.resize(128, 72); editor.model.paint(127, 71, 'wall', 'structure'); });
  const authored = editor.serialize(), before = structuredClone(authored);
  const forged = { ...authored, size: [8, 8], tiles: [tile(0, 0, 'spawn')] };
  assert.deepEqual(normalizeEditorProjectV135(forged).tiles, [['127:71', 'wall']]); assert.deepEqual(authored, before);
  const engine = new GameEngine(canvas); t.after(() => engine.stop());
  const options = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1), crew: [], equipment: [], editorProject: lane(), qaMode: true, testMode: true };
  engine.start(options); const player = engine.player, geometry = engine.platforms, campaign = engine.campaign;
  for (const invalid of [{ ...authored, activeRoomId: 'missing' }, { ...authored, rooms: [...authored.rooms, authored.rooms[0]] }, { ...authored, links: [{ id: 'bad-link', from: {}, to: {} }] }]) {
    assert.throws(() => engine.start({ ...options, editorProject: invalid })); assert.equal(engine.player, player); assert.equal(engine.platforms, geometry); assert.equal(engine.campaign, campaign);
  }
});

test('legacy dedicated workspace migrates without changing source bytes; project-library switches retain rooms and reset document history', t => {
  const bytes = storage(), raw = JSON.stringify({ schema: 1, projects: [{ ...lane(), id: 'old-lane' }], activeProjectId: 'old-lane' }); bytes.bytes.set(FORGE_LEGACY_SAVE_KEY_V62, raw);
  const store = new ForgeSaveSystemV62(bytes); store.load(); assert.equal(bytes.getItem(FORGE_LEGACY_SAVE_KEY_V62), raw); assert.ok(bytes.getItem(FORGE_SAVE_KEY_V62));
  const { editor } = editorHostV140(t, { store }); editor.loadInitialProject(store.data.projects[0]);
  editor.edit('Salle liée', () => { editor.model.paint(4, 27, 'door', 'gameplay'); const a = editor.room.cells.find(c => c.type === 'door').id; editor.model.addRoom({ duplicate: true }); const b = editor.room.cells.find(c => c.type === 'door').id; editor.model.link(b, 'room-1', a); });
  const originalId = editor.workspaceV133.id, canonical = parseProject(editor.serialize());
  const copyId = editor.workspaceV133.duplicate('Copie des deux secteurs'); assert.notEqual(copyId, originalId); assert.equal(editor.history.length, 0);
  assert.equal(editor.model.data.rooms.length, 2); assert.equal(editor.model.data.links.length, 1);
  editor.workspaceV133.open(originalId); assert.deepEqual(parseProject(editor.serialize()), canonical); assert.equal(editor.history.length, 0); assert.equal(editor.undo(), false);
  const reload = new ForgeSaveSystemV62(bytes); reload.load(); assert.equal(reload.data.projects.length, 2); assert.equal(reload.data.projects.every(p => p.rooms.length === 2 && p.links.length === 1), true);
  assert.equal(bytes.getItem(FORGE_LEGACY_SAVE_KEY_V62), raw);
});

test('moved multi-layer lane with copied structure survives full export/import and production playtest walks to extraction', t => {
  const { editor, select, canvas } = editorHostV140(t); editor.load(lane()); select([0, 27], [11, 28]); editor.move(50, 7);
  select([50, 35], [61, 35]); editor.copy(); editor.paste({ x: 0, y: 21 });
  const forge = new ForgeSaveSystemV62(storage()); forge.load(); forge.upsert({ ...editor.serialize(), id: 'playable-module' });
  editor.load(JSON.parse(forge.export()).projects[0]); const authored = admittedForgeProjectV136(editor.serialize());
  assert.deepEqual(authored.tiles, nativeTiles(projectRoom(editor.model.data)));
  const engine = new GameEngine(canvas); t.after(() => engine.stop());
  engine.start({ world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1), crew: [], equipment: [], editorProject: authored, qaMode: true, testMode: true });
  assert.ok(engine.player.x > 4900 && engine.player.y > 900); assert.ok(engine.objective.x > 5800); assert.equal(engine.editorTileCount, 26);
  const startX = engine.player.x; engine.keys.add('KeyD');
  for (let frame = 0; frame < 400 && engine.player.x < engine.objective.x - 30; frame++) engine.update(1 / 60);
  engine.keys.delete('KeyD'); assert.ok(engine.player.x > startX + 750); assert.equal(Math.round(engine.player.y + engine.player.h), 1050); assert.ok(engine.player.alive);
  engine.interact(engine.player); assert.equal(engine.mission.state, 'complete'); assert.equal(engine.mission.rewards.scope, 'forge-playtest');
  for (const key of ['credits', 'salvage', 'intel', 'apex', 'cargo']) assert.equal(engine.mission.rewards[key], 0);
});

test('project adoption refreshes application status once after UI, without an extra document edit or save', t => {
  const bytes = storage(), store = new ForgeSaveSystemV62(bytes); store.load();
  let writes = 0, callbacks = 0, latest, editor;
  const setItem = bytes.setItem; bytes.setItem = (key, value) => { writes++; setItem(key, value); };
  const host = editorHostV140(t, { store, onDocumentChange: () => { callbacks++; latest = editor.validate().ok; } }); editor = host.editor;
  store.upsert({ ...lane(), id: 'valid-lane' }); const count = writes;
  editor.workspaceV133.adopt(store.data.projects[0]);
  assert.equal(callbacks, 1); assert.equal(latest, true); assert.equal(writes, count); assert.equal(editor.history.length, 0); assert.equal(host.changes.length, 0);
  const emptyId = editor.workspaceV133.create('Vide'); assert.equal(latest, false); assert.equal(callbacks, 2);
  editor.workspaceV133.open('valid-lane'); assert.equal(latest, true); assert.equal(callbacks, 3);
  editor.workspaceV133.open(emptyId); assert.equal(latest, false); assert.equal(callbacks, 4);
  const raw = editor.workspaceV133.backupText(), restored = JSON.parse(raw).projects.find(p => p.id === JSON.parse(raw).activeProjectId);
  editor.workspaceV133.restoreBackup(raw); assert.equal(callbacks, 5); assert.equal(editor.model.data.activeRoomId, restored.activeRoomId);
  assert.equal(host.changes.length, 0); assert.equal(editor.history.length, 0);
});
