import test from 'node:test';
import assert from 'node:assert/strict';
import { ForgeModel, LAYERS, parseProject, clone, validateProject } from '../src/forge-model-v130.js';
import { generateBlueprintV135, normalizeBlueprintV135, inspectBlueprintV135, BLUEPRINTS_V135,
  BLUEPRINT_SHAPES_V135, planBlueprintV135, applyBlueprintV135, readBlueprintRecipeV135, exportBlueprintRecipeV135 } from '../src/forge-blueprints-v135.js';
import { ForgeSaveSystemV62, FORGE_SAVE_KEY_V62 } from '../src/forge-save-v62.js';
import { diagramForgeV134 } from '../src/forge-layout-v134.js';
const model = () => new ForgeModel();
const state = m => JSON.stringify(m.data);
const built = (options = {}, kind = 'mission') => {
  const b = generateBlueprintV135(options, kind);
  return new ForgeModel({ schema: 3, kind, name: 'Banc de test', activeRoomId: b.room.id, rooms: [b.room], links: [] });
};
const door = m => m.room.cells.find(c => c.type === 'door');
const memory = () => { const entries = new Map(); return { entries, getItem: k => entries.get(k) ?? null, setItem: (k, v) => entries.set(k, v) }; };

// Table-driven coverage: same real data generator, no substitute geometry.
for (const kind of ['mission', 'ship']) for (const profile of Object.keys(BLUEPRINTS_V135)) for (const shape of Object.keys(BLUEPRINT_SHAPES_V135)) {
  test(`construction ${kind}/${profile}/${shape}: supports, headroom, deterministic output`, () => {
    const recipe = { profile, shape, levels: 2, height: 24, seed: 135 };
    const blueprint = generateBlueprintV135(recipe, kind);
    assert.equal(blueprint.report.ok, true); assert.equal(blueprint.decks.length, 2);
    assert.deepEqual(generateBlueprintV135(recipe, kind), blueprint);
    const m = built(recipe, kind); assert.equal(validateProject(m.data).ok, true);
    assert.equal(new Set(blueprint.room.cells.map(c => c.id)).size, blueprint.room.cells.length);
    assert.equal(m.room.cells.filter(c => c.type === 'spawn').length, 1);
    assert.equal(m.room.cells.filter(c => c.type === 'objective').length, 1);
    assert.equal(m.room.cells.filter(c => c.type === 'door').length, 2);
  });
}
for (const kind of ['mission', 'ship']) test(`${kind}: all 3 deck silhouettes have connected ladder cells`, () => {
  for (const shape of Object.keys(BLUEPRINT_SHAPES_V135)) {
    const b = generateBlueprintV135({ shape, height: 30, levels: 3 }, kind);
    const map = new Map(b.room.cells.filter(c => !['background', 'foreground'].includes(c.layer)).map(c => [`${c.x}:${c.y}`, c]));
    for (const c of b.room.cells.filter(c => c.type === 'ladder')) {
      assert.ok(['ladder', 'floor'].includes(map.get(`${c.x}:${c.y + 1}`)?.type), `Broken ladder at ${c.x}:${c.y}`);
    }
  }
});
for (const [name, input] of [
  ['null', null], ['array', []], ['future schema', { schema: 2 }], ['string schema', { schema: '1' }],
  ['unknown profile', { profile: 'eval' }], ['unknown shape', { shape: '__proto__' }],
  ['fractional width', { width: 32.5 }], ['string width', { width: '32' }], ['width too small', { width: 15 }], ['width too large', { width: 65 }],
  ['height too small', { height: 11 }], ['height too large', { height: 37 }], ['infinite height', { height: Infinity }],
  ['invalid levels', { levels: 4 }], ['negative seed', { seed: -1 }], ['invalid density', { density: 4 }],
  ['negative enemies', { threats: -1 }], ['enemy budget', { threats: 7 }], ['unknown side', { entry: 'above' }],
  ['invalid vehicle', { vehicle: 'true' }], ['wrong vehicle profile', { vehicle: true }], ['oversized name', { name: 'a'.repeat(101) }]
]) test(`invalid recipe ${name} rejected without touching document`, () => {
  const m = built(), before = state(m); assert.throws(() => planBlueprintV135(m, input)); assert.equal(state(m), before); assert.equal(m.history.length, 0);
});
test('undefined optional fields use documented defaults; unknown fields cannot inject cells', () => {
  const recipe = normalizeBlueprintV135({ cells: [{ type: 'evil' }], script: 'bad', name: '\0  Secteur   ' });
  assert.equal(recipe.name, 'Secteur'); assert.equal(recipe.cells, undefined); assert.equal(recipe.script, undefined); assert.equal(recipe.width, 32);
});
test('unsupported dimensions and dense programs fail instead of dropping required elements', () => {
  assert.throws(() => generateBlueprintV135({ height: 12, levels: 3 }, 'ship'), /Hauteur/);
  assert.throws(() => generateBlueprintV135({ profile: 'laboratory', width: 16, levels: 3, height: 12 }), /Hauteur/);
});
test('entry reversal swaps insertion and goal and chooses the opposite socket', () => {
  const left = generateBlueprintV135(), right = generateBlueprintV135({ entry: 'right' });
  const x = (b, type) => b.room.cells.find(c => c.type === type).x;
  assert.equal(x(left, 'spawn'), x(right, 'objective')); assert.equal(x(right, 'spawn'), x(left, 'objective'));
  assert.notEqual(right.entranceId, left.entranceId);
});
test('variant changes decoration without moving structural supports or insertion', () => {
  const a = generateBlueprintV135({ seed: 10 }), b = generateBlueprintV135({ seed: 999 });
  const physics = b => b.room.cells.filter(c => ['gameplay', 'structure'].includes(c.layer));
  assert.deepEqual(physics(a), physics(b)); assert.notDeepEqual(a.room.cells, b.room.cells);
});
test('density zero creates no decorative cells and is deterministic for every seed', () => {
  for (let seed = 0; seed < 8; seed++) {
    const b = generateBlueprintV135({ density: 0, seed }); assert.ok(b.room.cells.every(c => ['structure', 'gameplay'].includes(c.layer)));
  }
});
test('maintenance creates paired supported conduits; hangar vehicle opt-in is Mission only', () => {
  const maintenance = generateBlueprintV135({ profile: 'maintenance' }); assert.equal(maintenance.report.counts.vent >= 2, true);
  assert.equal(maintenance.room.cells.filter(c => c.type === 'vent' && c.layer === 'structure').length, 2);
  assert.equal(generateBlueprintV135({ profile: 'hangar', vehicle: true }).report.counts.vehicle, 1);
  assert.throws(() => generateBlueprintV135({ profile: 'hangar', vehicle: true }, 'ship'), /Vaisseau/);
  assert.equal(generateBlueprintV135({ profile: 'hangar' }, 'ship').report.counts.vehicle, undefined);
});
test('enemy slots are opt-in, supported and never crowd the insertion', () => {
  const b = generateBlueprintV135({ width: 48, threats: 6 }); const spawn = b.room.cells.find(c => c.type === 'spawn');
  assert.equal(b.room.cells.filter(c => c.type === 'enemy').length, 6);
  assert.ok(b.room.cells.filter(c => c.type === 'enemy').every(c => Math.abs(c.x - spawn.x) > 3));
  assert.equal(b.report.physicsVerified, false); assert.ok(b.report.issues.some(i => i.code === 'enemy-runtime'));
});
test('recipe export/import is canonical and ignores unrelated JSON fields', () => {
  const input = { profile: 'laboratory', width: 40, shape: 'leftWing', name: '<img src=x onerror=bad()>' };
  assert.deepEqual(readBlueprintRecipeV135(exportBlueprintRecipeV135(input)), normalizeBlueprintV135(input));
  assert.throws(() => readBlueprintRecipeV135(JSON.stringify({ ...input, schema: 3 })), /recette/);
  assert.throws(() => readBlueprintRecipeV135('{bad'), /illisible/);
  assert.throws(() => readBlueprintRecipeV135(' '.repeat(16385)), /volumineuse/);
});
test('preview adds no room, link, history or persistence callback', () => {
  const m = built(), before = state(m); const p = planBlueprintV135(m, {});
  assert.equal(state(m), before); assert.equal(m.history.length, 0); assert.equal(m.future.length, 0);
  assert.equal(p.candidate.rooms.length, 2); assert.equal(p.blueprint.report.scope, 'authored-grid');
});
test('apply creates independent room IDs and one undo entry, then redo restores exact bytes', () => {
  const m = built(), before = state(m); const p = planBlueprintV135(m, { profile: 'laboratory', name: 'Nouveau' });
  assert.equal(applyBlueprintV135(m, p).changed, true); const after = state(m);
  assert.equal(m.history.length, 1); assert.equal(m.room.name, 'Nouveau'); assert.equal(m.data.rooms.length, 2);
  const ids = m.data.rooms.flatMap(r => r.cells.map(c => c.id)); assert.equal(ids.length, new Set(ids).size);
  m.undo(); assert.equal(state(m), before); m.redo(); assert.equal(state(m), after);
});
test('connection from free door and generated entrance is added in the same transaction', () => {
  const m = built(), from = { roomId: m.room.id, cellId: door(m).id }; const p = planBlueprintV135(m, { entry: 'right' }, { connectFrom: from });
  applyBlueprintV135(m, p); assert.equal(m.data.links.length, 1); const l = m.data.links[0];
  assert.deepEqual(l.from, from); assert.equal(l.to.roomId, m.room.id); assert.equal(l.bidirectional, true);
  assert.equal(m.room.cells.find(c => c.id === l.to.cellId).x, 30); assert.equal(parseProject(m.data).links.length, 1);
  m.undo(); assert.equal(m.data.rooms.length, 1); assert.equal(m.data.links.length, 0);
});
test('used or stale connection endpoints reject the whole operation', () => {
  const m = built(), from = { roomId: m.room.id, cellId: door(m).id }; applyBlueprintV135(m, planBlueprintV135(m, {}, { connectFrom: from }));
  const before = state(m); assert.throws(() => planBlueprintV135(m, {}, { connectFrom: from }), /déjà/);
  assert.throws(() => planBlueprintV135(m, {}, { connectFrom: { ...from, cellId: 'missing' } }), /sas/); assert.equal(state(m), before);
});
test('replace keeps compatible linked door IDs and cleans no external references', () => {
  const m = built(), from = { roomId: m.room.id, cellId: door(m).id }; applyBlueprintV135(m, planBlueprintV135(m, {}, { connectFrom: from }));
  const beforeLinks = clone(m.data.links); const roomId = m.room.id;
  const p = planBlueprintV135(m, { profile: 'quarters', shape: 'leftWing' }, { destination: 'replace' });
  assert.equal(p.retainedLinks, 1); applyBlueprintV135(m, p);
  assert.equal(m.data.rooms.length, 2); assert.equal(m.room.id, roomId); assert.deepEqual(m.data.links, beforeLinks); assert.doesNotThrow(() => parseProject(m.data));
});
test('moving a linked socket during replace refuses instead of dropping or teleporting the link', () => {
  const m = built(), from = { roomId: m.room.id, cellId: door(m).id }; applyBlueprintV135(m, planBlueprintV135(m, {}, { connectFrom: from }));
  const before = state(m); assert.throws(() => planBlueprintV135(m, { height: 24 }, { destination: 'replace' }), /sas relié/); assert.equal(state(m), before);
});
test('locked cells cannot be discarded on replace; hidden/locked target layers block construction', () => {
  const m = built(); m.transaction('lock', () => { m.room.cells[0].locked = true; }); const before = state(m);
  assert.throws(() => planBlueprintV135(m, {}, { destination: 'replace' }), /verrouillé/);
  assert.throws(() => planBlueprintV135(m, {}, {}, { visible: new Set(['structure', 'gameplay']) }), /masqué/);
  assert.throws(() => planBlueprintV135(m, {}, {}, { locked: new Set(['gameplay']) }), /verrouillé/); assert.equal(state(m), before);
});
test('hidden unrelated layer does not block a density-zero room', () => {
  const m = model(); assert.doesNotThrow(() => applyBlueprintV135(m, planBlueprintV135(m, { density: 0 }, {}, { visible: new Set(['structure', 'gameplay']) }), { visible: new Set(['structure', 'gameplay']) }));
});
test('permissions are checked again after preview', () => {
  const m = built(), p = planBlueprintV135(m, {}), before = state(m);
  assert.throws(() => applyBlueprintV135(m, p, { locked: new Set(['structure']) }), /verrouillé/); assert.equal(state(m), before);
});
test('stale preview after editing, undo, room switching, or foreign model cannot apply', () => {
  const m = built(), p = planBlueprintV135(m, {}); m.transaction('rename', () => { m.room.name = 'changed'; }); m.undo();
  const before = state(m); assert.throws(() => applyBlueprintV135(m, p), /obsolète/); assert.equal(state(m), before);
  assert.throws(() => applyBlueprintV135(built(), planBlueprintV135(m, {})), /obsolète/);
});
test('candidate tampering is ignored and the whitelisted recipe is regenerated on apply', () => {
  const m = model(), p = planBlueprintV135(m, {}); p.candidate.rooms[0].name = 'Tampered'; p.candidate.rooms.at(-1).cells[0].x = 99999;
  applyBlueprintV135(m, p); assert.notEqual(m.data.rooms[0].name, 'Tampered'); assert.ok(m.room.cells.every(c => c.x < 64));
});
test('construction refuses while a gesture is pending and leaves it intact', () => {
  const m = built(), p = planBlueprintV135(m, {}); m.begin(); assert.throws(() => applyBlueprintV135(m, p), /obsolète/); assert.throws(() => planBlueprintV135(m, {}), /geste/); assert.ok(m.pending); m.cancel();
});
test('room budget is checked before and after preview', () => {
  const m = model(); for (let i = 1; i < 32; i++) m.transaction('room', () => m.addRoom());
  const before = state(m); assert.throws(() => planBlueprintV135(m, {}), /32 salles/); assert.equal(state(m), before);
});
test('unsupported spawn, overlap and insufficient headroom are diagnosed rather than certified as physics', () => {
  const b = generateBlueprintV135(), r = clone(b.room), spawn = r.cells.find(c => c.type === 'spawn');
  r.cells = r.cells.filter(c => !(c.x === spawn.x && c.y === spawn.y + 1));
  r.cells.push({ ...spawn, id: 'obstruction', type: 'wall', layer: 'structure', y: spawn.y - 1 });
  const audit = inspectBlueprintV135(r); assert.equal(audit.ok, false); assert.equal(audit.physicsVerified, false);
  assert.ok(audit.issues.some(i => i.code === 'headroom')); assert.ok(audit.issues.some(i => i.code === 'support'));
});
test('generated linked room survives real store sanitization and reload; campaign key untouched', () => {
  const storage = memory(); storage.setItem('atf-v47-profile-1', '{"proof":"unchanged"}'); const store = new ForgeSaveSystemV62(storage); store.load();
  const m = built(), from = { roomId: m.room.id, cellId: door(m).id }; applyBlueprintV135(m, planBlueprintV135(m, { name: 'Lab local' }, { connectFrom: from }));
  store.upsert({ ...m.data, id: 'test' }); assert.equal(store.lastWriteV130.persisted, true);
  const reopened = new ForgeSaveSystemV62(storage); reopened.load(); assert.deepEqual(parseProject(reopened.data.projects[0]), m.data);
  assert.equal(storage.getItem('atf-v47-profile-1'), '{"proof":"unchanged"}'); assert.ok(storage.getItem(FORGE_SAVE_KEY_V62));
});
test('diagram renderer skips dangling draft links without hiding the warning count', () => {
  const m = built(); m.data.links.push({ id: 'draft', from: { roomId: m.room.id }, to: { roomId: 'removed' }, bidirectional: true });
  const d = diagramForgeV134(m.data); assert.equal(d.edges.length, 0); assert.equal(d.invalidEdges, 1); assert.equal(d.nodes.length, 1);
});
test('diagram renderer handles empty/transient project without throwing', () => {
  assert.equal(diagramForgeV134({ rooms: [], links: [], activeRoomId: 'missing' }).nodes.length, 0);
});
test('supported exterior jambs avoid false floating-door diagnostics', () => {
  for (const profile of Object.keys(BLUEPRINTS_V135)) {
    const m = built({ profile }); assert.equal(validateProject(m.data).issues.some(i => i.code === 'floating-door'), false);
  }
});
for (const kind of ['mission', 'ship']) test(`${kind}: minimum and maximum construction dimensions remain valid`, () => {
  for (const recipe of [{ width: 16, height: 12, levels: 1 }, { width: 64, height: 36, levels: 3 }]) {
    const b = generateBlueprintV135(recipe, kind); assert.equal(b.report.ok, true); assert.equal(b.decks.length, recipe.levels);
    assert.ok(b.room.cells.every(c => c.x >= 0 && c.x < recipe.width && c.y >= 0 && c.y < recipe.height));
  }
});
