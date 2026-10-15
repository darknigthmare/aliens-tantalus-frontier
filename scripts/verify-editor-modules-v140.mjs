import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LevelEditor } from '../src/editor.js';
import { ForgeSaveSystemV62 } from '../src/forge-save-v62.js';
import { compileEditorGridV136 } from '../src/editor-spatial-v136.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES } from '../src/content.js';

const tile = (x, y, type) => ({ position: `${x}:${y}`, type });
const project = (tiles, kind = 'mission') => ({ schema: 2, kind, size: [64, 36], tiles });
const lane = () => project([...Array.from({ length: 12 }, (_, x) => tile(x, 28, 'floor')), tile(1, 27, 'spawn'), tile(10, 27, 'objective')]);

function fixture(t) {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024; async decode() {}
    set src(value) { this._src = value; queueMicrotask(() => this.dispatchEvent(new Event('load'))); }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const context = new Proxy({}, { get: (target, key) => target[key] ?? (() => {}) }), attributes = new Map();
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, style: {},
    getContext: () => context, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    hasAttribute: key => attributes.has(key), setAttribute: (key, value) => attributes.set(key, value),
    focus() { document.activeElement = this; } });
  const changes = [], editor = new LevelEditor(canvas, value => changes.push(structuredClone(value)));
  t.after(() => editor.destroy());
  const pointer = (name, x, y, options = {}) => {
    const event = new Event(name, { cancelable: true });
    Object.assign(event, { pointerId: 1, button: 0, isPrimary: true, clientX: (x + .5) / editor.cols * 1280, clientY: (y + .5) / editor.rows * 720, ...options });
    (['pointerup', 'pointercancel'].includes(name) ? events : canvas).dispatchEvent(event);
  };
  const key = (value, options = {}) => { const event = new Event('keydown', { cancelable: true }); Object.assign(event, { key: value, ...options }); canvas.dispatchEvent(event); };
  const select = (from, to = from) => { editor.setBrushMode('select'); pointer('pointerdown', ...from); pointer('pointermove', ...to); pointer('pointerup', ...to); };
  return { editor, changes, canvas, key, pointer, select };
}

test('rectangle selection and cancelled pointer gestures never persist or destroy redo', t => {
  const { editor, select, pointer, changes } = fixture(t); editor.load(lane()); editor.paintCellV135(20, 5); editor.undo();
  const before = editor.serialize(), history = structuredClone(editor.history), future = structuredClone(editor.future), count = changes.length;
  select([0, 27], [11, 28]); const selected = editor.getSnapshot().moduleV140;
  assert.deepEqual(selected.selection, { left: 0, top: 27, right: 11, bottom: 28 }); assert.equal(selected.count, 14);
  pointer('pointerdown', 5, 5); pointer('pointermove', 7, 7); pointer('pointercancel', 7, 7);
  assert.deepEqual(editor.getSnapshot().moduleV140.selection, selected.selection);
  assert.deepEqual(editor.serialize(), before); assert.deepEqual(editor.history, history); assert.deepEqual(editor.future, future); assert.equal(changes.length, count);
  editor.redo(); assert.equal(editor.tiles.get('20:5'), 'floor');
});

test('moving an overlapping module retains marker priority and records exactly one complete undo transaction', t => {
  const { editor, select, changes } = fixture(t);
  editor.load(project([tile(1, 1, 'spawn'), tile(2, 1, 'floor'), tile(15, 1, 'spawn'), tile(3, 1, 'objective')]));
  select([1, 1], [3, 1]); const before = editor.serialize(), count = changes.length, depth = editor.history.length;
  editor.beginModulePlacementV140('move'); assert.equal(editor.placeModuleV140([2, 1]), true);
  assert.deepEqual(editor.serialize().tiles, [tile(2, 1, 'spawn'), tile(3, 1, 'floor'), tile(15, 1, 'spawn'), tile(4, 1, 'objective')]);
  assert.equal(editor.history.length, depth + 1); assert.equal(changes.length, count + 1);
  const after = editor.serialize(); editor.undo(); assert.deepEqual(editor.serialize(), before); editor.redo(); assert.deepEqual(editor.serialize(), after);
});

test('an interrupted touch destination never moves or saves a module; Escape ends the entire selection gesture', t => {
  const { editor, select, pointer, key, changes } = fixture(t); editor.load(lane()); select([0, 27], [11, 28]);
  const before = editor.serialize(), history = structuredClone(editor.history), count = changes.length;
  editor.beginModulePlacementV140('move'); pointer('pointerdown', 30, 30, { pointerType: 'touch' }); pointer('pointermove', 40, 32, { pointerType: 'touch' });
  assert.deepEqual(editor.serialize(), before); pointer('pointercancel', 40, 32, { pointerType: 'touch' });
  assert.deepEqual(editor.serialize(), before); assert.deepEqual(editor.history, history); assert.equal(changes.length, count); assert.equal(editor.modulePlacementV140, 'move');
  pointer('pointerdown', 50, 34, { pointerType: 'touch' }); pointer('pointerup', 50, 34, { pointerType: 'touch' });
  assert.equal(editor.tiles.get('51:34'), 'spawn'); assert.equal(changes.length, count + 1);
  pointer('pointerdown', 0, 0); pointer('pointermove', 5, 5); key('Escape'); pointer('pointermove', 8, 8); pointer('pointerup', 8, 8);
  assert.equal(editor.selectionV140, null); assert.equal(editor.strokeV135, null);
});

test('occupied and out-of-bounds destinations reject the entire module without any save or history mutation', t => {
  const { editor, select, changes } = fixture(t); editor.load(project([...lane().tiles, tile(21, 30, 'wall')])); select([0, 27], [11, 28]);
  const before = editor.serialize(), history = structuredClone(editor.history), count = changes.length;
  for (const mode of ['move', 'copy']) {
    editor.beginModulePlacementV140(mode);
    for (const destination of [[20, 30], [63, 35], [-1, 10]]) {
      assert.equal(editor.placeModuleV140(destination), false); assert.deepEqual(editor.serialize(), before);
      assert.deepEqual(editor.history, history); assert.equal(changes.length, count); assert.equal(editor.modulePlacementV140, mode);
    }
  }
  assert.match(editor.getSnapshot().moduleV140.message, /dépasse/);
  assert.equal(editor.placeModuleV140([40, 34]), true); assert.equal(editor.tiles.get('41:34'), 'spawn');
});

test('duplicate rejects its own occupied source and copies all physical tile types through actual Forge storage and JSON roundtrip', t => {
  const { editor, select } = fixture(t);
  const types = ['floor', 'platform', 'wall', 'door', 'vent', 'ladder', 'lift', 'spawn', 'objective', 'enemy', 'vehicle', 'terminal', 'hazard'];
  editor.load(project(types.map((type, x) => tile(x, 5, type)))); select([0, 5], [12, 5]);
  editor.beginModulePlacementV140('copy'); assert.equal(editor.placeModuleV140([0, 5]), false); assert.match(editor.getSnapshot().moduleV140.message, /occupée/);
  assert.equal(editor.placeModuleV140([51, 35]), true);
  assert.deepEqual(editor.serialize().tiles.slice(types.length), types.map((type, x) => tile(51 + x, 35, type)));
  const storageBytes = new Map(), storage = { getItem: key => storageBytes.get(key) ?? null, setItem: (key, value) => storageBytes.set(key, value) };
  const forge = new ForgeSaveSystemV62(storage); forge.load(); forge.upsert({ ...editor.serialize(), id: 'module-roundtrip' });
  const exported = JSON.parse(forge.export()).projects[0], reloaded = new ForgeSaveSystemV62(storage); reloaded.load();
  editor.load(exported); assert.deepEqual(editor.serialize().tiles, reloaded.data.projects[0].tiles);
  assert.deepEqual(compileEditorGridV136(editor.serialize()).tiles.slice(types.length).map(entry => [entry.position, entry.type, entry.x, entry.y]),
    types.map((type, x) => [`${51 + x}:35`, type, (51 + x) * 96.875, 1050]));
  for (const transient of ['moduleV140', 'selectionV140', 'modulePlacementV140']) assert.equal(Object.hasOwn(exported, transient), false);
});

test('keyboard selection, destination cancellation, placement and group deletion work without pointer-only controls', t => {
  const { editor, key, changes } = fixture(t); editor.load(project([tile(0, 0, 'wall'), tile(1, 0, 'door')])); editor.setBrushMode('select');
  key('Enter'); key('ArrowRight', { shiftKey: true }); key('ArrowDown', { shiftKey: true });
  assert.equal(editor.getSnapshot().moduleV140.count, 2); const count = changes.length;
  editor.beginModulePlacementV140('copy'); key('Escape'); assert.equal(changes.length, count); assert.ok(editor.selectionV140); assert.equal(editor.modulePlacementV140, null);
  editor.beginModulePlacementV140('copy'); key('ArrowRight'); key('ArrowRight'); key('Enter');
  assert.equal(editor.tiles.get('3:1'), 'wall'); assert.equal(editor.tiles.get('4:1'), 'door');
  const afterCopy = editor.serialize(); key('Delete'); assert.equal(editor.tiles.size, 2); key('z', { ctrlKey: true }); assert.deepEqual(editor.serialize(), afterCopy);
  assert.equal(editor.selectionV140, null); key('z', { ctrlKey: true }); assert.equal(editor.tiles.size, 2);
});

test('ship modules keep their project kind and dimensions through move, deletion and undo', t => {
  const { editor, select } = fixture(t); editor.load(project([tile(0, 0, 'spawn'), tile(1, 0, 'door'), tile(2, 0, 'floor'), tile(3, 0, 'objective')], 'ship'));
  select([0, 0], [3, 0]); editor.beginModulePlacementV140('move'); editor.placeModuleV140([60, 35]);
  const moved = editor.serialize(); assert.equal(moved.kind, 'ship'); assert.deepEqual(moved.size, [64, 36]); assert.equal(moved.tiles[0].position, '60:35');
  editor.deleteSelectionV140(); assert.equal(editor.tiles.size, 0); editor.undo(); assert.deepEqual(editor.serialize(), moved);
  editor.resize(128, 72); assert.equal(editor.getSnapshot().moduleV140.selection, null);
});

test('a moved and duplicated lane survives export/import and production playtest walks the original-priority module to extraction', t => {
  const { editor, select, canvas } = fixture(t); editor.load(lane()); select([0, 27], [11, 28]);
  editor.beginModulePlacementV140('move'); editor.placeModuleV140([50, 34]);
  editor.beginModulePlacementV140('copy'); editor.placeModuleV140([0, 20]);
  const forge = new ForgeSaveSystemV62({ getItem: () => null, setItem() {} }); forge.load(); forge.upsert({ ...editor.serialize(), id: 'playable-module' });
  const authored = JSON.parse(forge.export()).projects[0]; editor.load(authored);
  const engine = new GameEngine(canvas); t.after(() => engine.stop());
  engine.start({ world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1), crew: [], equipment: [], editorProject: editor.serialize(), qaMode: true, testMode: true });
  assert.ok(engine.player.x > 4900 && engine.player.y > 900); assert.ok(engine.objective.x > 5800);
  assert.equal(engine.editorTileCount, 28); assert.equal(engine.platforms.filter(entry => entry.floor).length, 24);
  const startX = engine.player.x;
  engine.keys.add('KeyD'); for (let frame = 0; frame < 240; frame++) engine.update(1 / 60); engine.keys.delete('KeyD');
  assert.ok(engine.player.x > startX + 750); assert.equal(Math.round(engine.player.y + engine.player.h), 1050); assert.ok(engine.player.alive);
  engine.interact(engine.player); assert.equal(engine.mission.state, 'complete'); assert.equal(engine.mission.rewards.scope, 'forge-playtest');
  for (const key of ['credits', 'salvage', 'intel', 'apex', 'cargo']) assert.equal(engine.mission.rewards[key], 0);
});
