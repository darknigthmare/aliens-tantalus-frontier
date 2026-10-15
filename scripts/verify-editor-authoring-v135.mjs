import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LevelEditor } from '../src/editor.js';
import { normalizeEditorProjectV135, editorLineCellsV135, editorRectangleCellsV135, editorFloodCellsV135 } from '../src/editor-authoring-v135.js';
import { sanitizeForgeProjectV62, ForgeSaveSystemV62 } from '../src/forge-save-v62.js';

function fixture(t) {
  const events = new EventTarget();
  globalThis.addEventListener = events.addEventListener.bind(events); globalThis.removeEventListener = events.removeEventListener.bind(events);
  const context = new Proxy({}, { get: (target, key) => key in target ? target[key] : () => {} });
  const attributes = new Map(), captures = new Set(), canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, style: {},
    getContext: () => context, getBoundingClientRect: () => ({ left: 10, top: 20, width: 1280, height: 720 }),
    hasAttribute: key => attributes.has(key), setAttribute: (key, value) => attributes.set(key, value),
    setPointerCapture: id => captures.add(id), hasPointerCapture: id => captures.has(id), releasePointerCapture: id => captures.delete(id),
    focus() { globalThis.document = { activeElement: canvas }; } });
  const changes = [], editor = new LevelEditor(canvas, project => changes.push(structuredClone(project)));
  t.after(() => editor.destroy());
  function pointer(name, x, y, overrides = {}) {
    const event = new Event(name, { cancelable: true });
    Object.assign(event, { pointerId: 1, button: 0, isPrimary: true, clientX: 10 + (x + .5) / editor.cols * 1280,
      clientY: 20 + (y + .5) / editor.rows * 720, shiftKey: false, ...overrides });
    (['pointerup', 'pointercancel'].includes(name) ? events : canvas).dispatchEvent(event); return event;
  }
  function key(value, modifiers = {}) { const event = new Event('keydown', { cancelable: true }); Object.assign(event, { key: value, ...modifiers }); canvas.dispatchEvent(event); return event; }
  return { editor, canvas, changes, captures, pointer, key };
}
const project = (size = [32, 18], tiles = []) => ({ schema: 2, kind: 'mission', size, tiles });
const tile = (x, y, type = 'floor') => ({ position: `${x}:${y}`, type });

test('legacy and extended Forge projects round-trip their dimensions, mode and every far-edge tile', t => {
  const { editor } = fixture(t), imported = project([128, 72], [tile(127, 71), tile(0, 0, 'spawn'), tile(2, 0, 'objective')]);
  imported.kind = 'ship'; editor.load(imported);
  assert.deepEqual(editor.serialize().size, [128, 72]); assert.equal(editor.serialize().kind, 'ship'); assert.equal(editor.tiles.get('127:71'), 'floor');
  const stored = sanitizeForgeProjectV62({ ...editor.serialize(), id: 'authoring-roundtrip', name: 'Plan grand format' });
  editor.load(JSON.parse(JSON.stringify(stored))); assert.deepEqual(editor.serialize().tiles, imported.tiles);
  editor.load({ tiles: [tile(31, 17)] }); assert.deepEqual(editor.serialize().size, [32, 18]);
  assert.equal(editor.serialize().schema, 2);
});

test('invalid imports leave the complete workspace and both history stacks untouched', t => {
  const { editor } = fixture(t); editor.load(project([64, 36], [tile(63, 35)])); editor.paintCellV135(2, 2); editor.undo();
  const before = editor.getSnapshot(), history = structuredClone(editor.history), future = structuredClone(editor.future);
  for (const invalid of [null, {}, project([7, 18]), project([32, 73]), project([32.5, 18]), project([32, 18], [tile(32, 0)]),
    project([32, 18], [tile(0, 0, 'script')]), { ...project(), schema: 999 }, { ...project(), kind: 'unknown' },
    project([32, 18], [{ position: '../remote', type: 'wall' }]), project([32, 18], new Array(9217).fill(tile(0, 0)))]) {
    assert.throws(() => editor.load(invalid)); assert.deepEqual(editor.getSnapshot(), before);
    assert.deepEqual(editor.history, history); assert.deepEqual(editor.future, future);
  }
});

test('resize never discards occupied cells implicitly and undo/redo restores dimensions together with cropped cells', t => {
  const { editor, changes } = fixture(t); editor.load(project([64, 36], [tile(63, 35), tile(1, 1, 'spawn')]));
  const before = editor.serialize(), count = changes.length;
  assert.throws(() => editor.resize(32, 18), /explicitement/); assert.deepEqual(editor.serialize(), before); assert.equal(changes.length, count);
  editor.resize(32, 18, { crop: true }); assert.equal(editor.tiles.size, 1); assert.deepEqual(editor.serialize().size, [32, 18]);
  editor.undo(); assert.deepEqual(editor.serialize(), before);
  editor.redo(); assert.deepEqual(editor.serialize().size, [32, 18]); assert.equal(editor.tiles.has('63:35'), false);
  editor.resize(128, 72); assert.equal(editor.tiles.get('1:1'), 'spawn');
  assert.throws(() => editor.resize('128', 72)); assert.throws(() => editor.resize(129, 72));
});

test('a fast pointer stroke interpolates its skipped cells and persists exactly one undo transaction', t => {
  const { editor, pointer, changes, captures } = fixture(t);
  pointer('pointerdown', 2, 3); assert.equal(captures.has(1), true); pointer('pointermove', 29, 3);
  assert.equal(changes.length, 0); pointer('pointerup', 29, 3);
  assert.equal(captures.size, 0); assert.equal(editor.tiles.size, 28); assert.equal(changes.length, 1); assert.equal(editor.history.length, 1);
  for (let x = 2; x <= 29; x += 1) assert.equal(editor.tiles.get(`${x}:3`), 'floor');
  editor.undo(); assert.equal(editor.tiles.size, 0); editor.redo(); assert.equal(editor.tiles.size, 28);
});

test('pointer cancel rolls the whole gesture back without persisting a partial plan or invalidating redo', t => {
  const { editor, pointer, changes } = fixture(t);
  editor.paintCellV135(1, 1); editor.undo(); const before = editor.getSnapshot(), count = changes.length;
  pointer('pointerdown', 0, 0); pointer('pointermove', 10, 10); pointer('pointercancel', 10, 10);
  assert.deepEqual(editor.serialize(), { schema: before.schema, kind: before.kind, size: before.size, tiles: before.tiles, validation: before.validation });
  assert.equal(editor.history.length, 0); assert.equal(editor.future.length, 1); assert.equal(changes.length, count); editor.redo(); assert.equal(editor.tiles.has('1:1'), true);
});

test('secondary touch pointers cannot continue or finish the active gesture and Shift/right click erase whole strokes', t => {
  const { editor, pointer } = fixture(t);
  pointer('pointerdown', 1, 1); pointer('pointermove', 5, 1, { pointerId: 2, isPrimary: false }); pointer('pointerup', 5, 1, { pointerId: 2 });
  assert.equal(editor.dragging, true); assert.equal(editor.tiles.size, 1); pointer('pointermove', 5, 1); pointer('pointerup', 5, 1);
  pointer('pointerdown', 1, 1, { button: 2 }); pointer('pointermove', 5, 1); pointer('pointerup', 5, 1);
  assert.equal(editor.tiles.size, 0); editor.undo(); assert.equal(editor.tiles.size, 5);
  pointer('pointerdown', 1, 1, { shiftKey: true }); pointer('pointerup', 1, 1); assert.equal(editor.tiles.has('1:1'), false);
});

test('filled rectangles preview the current corners and undo as one command even when shrunk before release', t => {
  const { editor, pointer, changes } = fixture(t); editor.setTool('wall'); editor.setBrushMode('rectangle');
  pointer('pointerdown', 1, 1); pointer('pointermove', 8, 8); assert.equal(editor.tiles.size, 64);
  pointer('pointermove', 3, 3); pointer('pointerup', 3, 3); assert.equal(editor.tiles.size, 9); assert.equal(changes.length, 1);
  assert.equal(editor.tiles.has('8:8'), false); editor.undo(); assert.equal(editor.tiles.size, 0);
  pointer('pointerdown', 2, 2); pointer('pointerup', 2, 2); assert.equal(editor.tiles.get('2:2'), 'wall');
});

test('flood fill respects a separating wall and can fill a maximum-size empty plan without recursion', t => {
  const { editor } = fixture(t); editor.load(project([8, 8], Array.from({ length: 8 }, (_, y) => tile(4, y, 'wall'))));
  editor.setBrushMode('fill'); editor.setTool('floor'); editor.paintCellV135(0, 0);
  assert.equal([...editor.tiles.values()].filter(type => type === 'floor').length, 32); assert.equal(editor.tiles.has('5:0'), false);
  editor.undo(); assert.equal(editor.tiles.size, 8); editor.load(project([128, 72])); editor.paintCellV135(127, 71);
  assert.equal(editor.tiles.size, 9216); editor.undo(); assert.equal(editor.tiles.size, 0);
});

test('keyboard grid authoring uses the selected cursor and conventional undo/redo without consuming unrelated shortcuts', t => {
  const { editor, key } = fixture(t); editor.setTool('spawn'); key('ArrowRight'); key('ArrowDown'); key('Enter');
  assert.equal(editor.tiles.get('1:1'), 'spawn'); key('z', { ctrlKey: true }); assert.equal(editor.tiles.size, 0);
  key('z', { metaKey: true, shiftKey: true }); assert.equal(editor.tiles.get('1:1'), 'spawn');
  key('Delete'); assert.equal(editor.tiles.size, 0); assert.equal(key('s', { ctrlKey: true }).defaultPrevented, false);
});

test('brush-only changes do not persist a project and no-op actions retain redo history', t => {
  const { editor, changes } = fixture(t); let uiEvents = 0; const unsubscribe = editor.subscribe(() => uiEvents += 1);
  editor.setTool('objective'); editor.setBrushMode('erase'); assert.equal(changes.length, 0); assert.equal(uiEvents, 2);
  assert.equal(editor.setBrushMode('unsupported'), false); editor.paintCellV135(0, 0); assert.equal(changes.length, 0);
  editor.setBrushMode('paint'); editor.paintCellV135(0, 0); editor.undo(); editor.resize(32, 18); assert.equal(editor.future.length, 1);
  unsubscribe(); const count = uiEvents; editor.setTool('wall'); assert.equal(uiEvents, count);
});

test('pure brush helpers preserve discrete geometry, bounded fill and legacy duplicate-cell resolution', () => {
  assert.deepEqual(editorLineCellsV135([0, 0], [3, 3]), [[0, 0], [1, 1], [2, 2], [3, 3]]);
  assert.deepEqual(editorLineCellsV135([3, 0], [0, 0]), [[3, 0], [2, 0], [1, 0], [0, 0]]);
  assert.equal(editorRectangleCellsV135([3, 4], [1, 2]).length, 9);
  assert.throws(() => editorRectangleCellsV135([0, 0], [128, 0]));
  const same = new Map([['0:0', 'floor']]); assert.deepEqual(editorFloodCellsV135(same, 8, 8, [0, 0], 'floor'), []);
  assert.equal(normalizeEditorProjectV135(project([8, 8], [tile(0, 0, 'floor'), tile(0, 0, 'wall')])).tiles[0][1], 'wall');
});

test('Forge persistence failure is visible while the editable plan remains available for explicit JSON export', () => {
  const storage = { getItem: () => null, setItem() { throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' }); } };
  const forge = new ForgeSaveSystemV62(storage); forge.load(); forge.upsert({ ...project([64, 36], [tile(63, 35)]), id: 'quota-project' });
  assert.equal(forge.data.projects[0].tiles[0].position, '63:35');
  assert.deepEqual(JSON.parse(forge.export()).projects[0].size, [64, 36]);
  assert.equal(forge.lastPersistenceV135?.persisted, false);
});
