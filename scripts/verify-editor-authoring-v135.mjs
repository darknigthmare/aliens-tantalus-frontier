import assert from 'node:assert/strict';
import { test } from 'node:test';
import { editorHostV140 } from './editor-native-host-v140.mjs';
import { normalizeEditorProjectV135, editorLineCellsV135, editorRectangleCellsV135, editorFloodCellsV135 } from '../src/editor-authoring-v135.js';
import { sanitizeForgeProjectV62, ForgeSaveSystemV62 } from '../src/forge-save-v62.js';
const project = (size = [32, 18], tiles = []) => ({ schema: 2, kind: 'mission', size, tiles });
const tile = (x, y, type = 'floor') => ({ position: `${x}:${y}`, type });

test('legacy and extended projects migrate to full Forge documents without losing dimensions, kind or far-edge tiles', t => {
  const { editor } = editorHostV140(t), imported = { ...project([128, 72], [tile(127, 71), tile(0, 0, 'spawn'), tile(2, 0, 'objective')]), kind: 'ship' };
  editor.load(imported); assert.equal(editor.serialize().schema, 3); assert.deepEqual(editor.serialize().size, [128, 72]);
  assert.equal(editor.serialize().kind, 'ship'); assert.deepEqual(editor.serialize().tiles, imported.tiles);
  const stored = sanitizeForgeProjectV62({ ...editor.serialize(), id: 'authoring-roundtrip', name: 'Plan grand format' });
  editor.load(JSON.parse(JSON.stringify(stored))); assert.deepEqual(editor.serialize().tiles, imported.tiles); assert.equal(editor.serialize().rooms.length, 1);
  editor.load({ tiles: [tile(31, 17)] }); assert.deepEqual(editor.serialize().size, [32, 18]);
});
test('invalid imports leave the complete document and both history stacks intact', t => {
  const { editor, paint } = editorHostV140(t); editor.load(project([64, 36], [tile(63, 35)])); paint(2, 2); editor.undo();
  const before = editor.getSnapshot(), history = structuredClone(editor.history), future = structuredClone(editor.future);
  for (const invalid of [null, {}, project([7, 18]), project([32, 73]), project([32.5, 18]), project([32, 18], [tile(32, 0)]),
    project([32, 18], [tile(0, 0, 'script')]), { ...project(), schema: 999 }, { ...editor.serialize(), activeRoomId: 'absent' },
    project([32, 18], [{ position: '../remote', type: 'wall' }]), project([32, 18], [tile(0, 0), tile(0, 0)])]) {
    assert.throws(() => editor.load(invalid)); assert.deepEqual(editor.getSnapshot(), before);
    assert.deepEqual(editor.history, history); assert.deepEqual(editor.future, future);
  }
});
test('resize requires explicit cropping and undo/redo restores dimensions with every removed block', t => {
  const { editor, resize, changes } = editorHostV140(t); editor.load(project([64, 36], [tile(63, 35), tile(1, 1, 'spawn')]));
  const before = editor.serialize(), count = changes.length;
  assert.throws(() => resize(32, 18), /recadrage|supprimés/); assert.deepEqual(editor.serialize(), before); assert.equal(changes.length, count);
  resize(32, 18, { crop: true }); assert.equal(editor.tiles.size, 1); editor.undo(); assert.deepEqual(editor.serialize(), before);
  editor.redo(); assert.deepEqual(editor.serialize().size, [32, 18]); assert.equal(editor.tiles.has('63:35'), false);
  resize(128, 72); assert.equal(editor.tiles.get('1:1'), 'spawn'); assert.throws(() => resize('128', 72)); assert.throws(() => resize(129, 72));
});
test('fast pointer strokes interpolate skipped cells and save exactly one undo command', t => {
  const { editor, pointer, changes, captures } = editorHostV140(t);
  pointer('pointerdown', 2, 3); assert.equal(captures.has(1), true); pointer('pointermove', 29, 3);
  assert.equal(changes.length, 0); pointer('pointerup', 29, 3);
  assert.equal(captures.size, 0); assert.equal(editor.tiles.size, 28); assert.equal(changes.length, 1); assert.equal(editor.history.length, 1);
  for (let x = 2; x <= 29; x++) assert.equal(editor.tiles.get(`${x}:3`), 'floor');
  editor.undo(); assert.equal(editor.tiles.size, 0); editor.redo(); assert.equal(editor.tiles.size, 28);
});
test('pointer cancellation restores the entire gesture without saving a partial plan or destroying redo', t => {
  const { editor, pointer, paint, changes } = editorHostV140(t); paint(1, 1); editor.undo(); const before = editor.serialize(), count = changes.length;
  pointer('pointerdown', 0, 0); pointer('pointermove', 10, 10); pointer('pointercancel', 10, 10);
  assert.deepEqual(editor.serialize(), before); assert.equal(editor.history.length, 0); assert.equal(editor.future.length, 1); assert.equal(changes.length, count);
  editor.redo(); assert.equal(editor.tiles.has('1:1'), true);
});
test('secondary touch pointers cannot continue or finish a gesture; Shift and right-drag erase the whole stroke', t => {
  const { editor, pointer } = editorHostV140(t);
  pointer('pointerdown', 1, 1); pointer('pointermove', 5, 1, { pointerId: 2, isPrimary: false }); pointer('pointerup', 5, 1, { pointerId: 2 });
  assert.ok(editor.gesture); assert.equal(editor.tiles.size, 1); pointer('pointermove', 5, 1); pointer('pointerup', 5, 1);
  pointer('pointerdown', 1, 1, { button: 2 }); pointer('pointermove', 5, 1); pointer('pointerup', 5, 1);
  assert.equal(editor.tiles.size, 0); editor.undo(); assert.equal(editor.tiles.size, 5);
  pointer('pointerdown', 1, 1, { shiftKey: true }); pointer('pointerup', 1, 1); assert.equal(editor.tiles.has('1:1'), false);
});
test('filled rectangle uses its final corners and commits one undo command after shrinking the preview', t => {
  const { editor, pointer, key, changes } = editorHostV140(t); editor.setTool('wall'); key('r');
  pointer('pointerdown', 1, 1); pointer('pointermove', 8, 8); assert.equal(editor.tiles.size, 0);
  pointer('pointermove', 3, 3); pointer('pointerup', 3, 3); assert.equal(editor.tiles.size, 9); assert.equal(changes.length, 1);
  assert.equal(editor.tiles.has('8:8'), false); editor.undo(); assert.equal(editor.tiles.size, 0);
  pointer('pointerdown', 2, 2); pointer('pointerup', 2, 2); assert.equal(editor.tiles.get('2:2'), 'wall');
});
test('fill respects a separating wall and handles the maximum-size empty room without recursion', t => {
  const { editor, pointer, key } = editorHostV140(t); editor.load(project([8, 8], Array.from({ length: 8 }, (_, y) => tile(4, y, 'wall'))));
  key('f'); pointer('pointerdown', 0, 0); pointer('pointerup', 0, 0);
  assert.equal([...editor.tiles.values()].filter(type => type === 'floor').length, 32); assert.equal(editor.tiles.has('5:0'), false);
  editor.undo(); assert.equal(editor.tiles.size, 8); editor.load(project([128, 72])); pointer('pointerdown', 127, 71); pointer('pointerup', 127, 71);
  assert.equal(editor.tiles.size, 9216); editor.undo(); assert.equal(editor.tiles.size, 0);
});
test('keyboard selects and moves real blocks with conventional deletion and undo/redo shortcuts', t => {
  const { editor, key, paint } = editorHostV140(t); paint(1, 1, 'spawn', 'gameplay'); editor.layer = 'gameplay';
  key('v'); key('a', { ctrlKey: true }); key('ArrowRight'); assert.equal(editor.tiles.get('2:1'), 'spawn');
  key('z', { ctrlKey: true }); assert.equal(editor.tiles.get('1:1'), 'spawn'); key('z', { metaKey: true, shiftKey: true }); assert.equal(editor.tiles.get('2:1'), 'spawn');
  key('a', { ctrlKey: true }); key('Delete'); assert.equal(editor.tiles.size, 0); key('z', { ctrlKey: true }); assert.equal(editor.tiles.get('2:1'), 'spawn');
  assert.equal(key('q', { ctrlKey: true }).defaultPrevented, false);
});
test('tool and view choices never persist a document; no-op edits keep redo available', t => {
  const { editor, changes, key, paint, resize } = editorHostV140(t); editor.setTool('objective'); key('p'); key('g'); assert.equal(changes.length, 0);
  paint(0, 0, 'wall', 'structure'); editor.undo(); const count = changes.length; resize(32, 18);
  assert.equal(editor.future.length, 1); assert.equal(changes.length, count); editor.redo(); assert.equal(editor.tiles.get('0:0'), 'wall');
});
test('legacy pure helpers keep discrete geometry, bounded fills and duplicate-cell normalization', () => {
  assert.deepEqual(editorLineCellsV135([0, 0], [3, 3]), [[0, 0], [1, 1], [2, 2], [3, 3]]);
  assert.deepEqual(editorLineCellsV135([3, 0], [0, 0]), [[3, 0], [2, 0], [1, 0], [0, 0]]);
  assert.equal(editorRectangleCellsV135([3, 4], [1, 2]).length, 9); assert.throws(() => editorRectangleCellsV135([0, 0], [128, 0]));
  assert.deepEqual(editorFloodCellsV135(new Map([['0:0', 'floor']]), 8, 8, [0, 0], 'floor'), []);
  assert.equal(normalizeEditorProjectV135(project([8, 8], [tile(0, 0, 'floor'), tile(0, 0, 'wall')])).tiles[0][1], 'wall');
});
test('real Forge persistence exposes quota failure while retaining the editable project for JSON export', () => {
  const storage = { getItem: () => null, setItem() { throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' }); } };
  const forge = new ForgeSaveSystemV62(storage); forge.load(); forge.upsert({ ...project([64, 36], [tile(63, 35)]), id: 'quota-project' });
  assert.equal(forge.data.projects[0].tiles[0].position, '63:35'); assert.deepEqual(JSON.parse(forge.export()).projects[0].size, [64, 36]);
  assert.equal(forge.lastWriteV130.persisted, false); assert.match(forge.lastWriteV130.reason, /quota/);
});
