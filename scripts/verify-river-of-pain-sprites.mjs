import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { buildRiverOfPainVisuals, renderRiverOfPainVisuals, RIVER_ORIGINAL_SHA256 } from './build-river-of-pain-visuals.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dlc = join(root, 'dlc/fleuve-de-la-douleur');
const src = join(dlc, 'src/river-of-pain'), visual = join(dlc, 'visual-v1');
const require = createRequire(import.meta.url);
const { validateManifest, createRegistry } = require(join(visual, 'sprite-loader.js'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const empty = () => ({ schema: 1, id: 'river-of-pain-visual-v1', assets: [] });
function asset(overrides = {}) {
  return { id: 'brackett-idle', file: 'assets/brackett-idle.png', targetIds: ['brackett'],
    category: 'person', pose: 'idle', facing: 1, height: 90,
    bounds: { x: 10, y: 10, w: 80, h: 180 }, anchor: { x: 50, y: 190 },
    weapon: 'pulse', state: 'normal', fidelity: { status: 'test-fixture', note: 'Synthetic unit fixture, not production art.' },
    sha256: 'a'.repeat(64), ...overrides };
}
class FakeImage {
  constructor() { this.naturalWidth = 100; this.naturalHeight = 200; }
  set src(value) { this.url = value; queueMicrotask(() => this.onload && this.onload()); }
  get src() { return this.url; }
  decode() { return Promise.resolve(); }
}
function canvas() {
  const calls = [];
  const context = new Proxy({}, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'createLinearGradient' || key === 'createRadialGradient')
        return () => ({ addColorStop() {} });
      return (...args) => { calls.push({ method: key, args }); };
    },
    set(target, key, value) { target[key] = value; return true; }
  });
  return { calls, context, element: { getContext: () => context,
    getBoundingClientRect: () => ({ width: 1440, height: 810 }) } };
}
const beforeRender = ['data.js', 'colony.js', 'exploration.js', 'passages.js', 'life.js',
  'defense.js', 'ducts.js', 'mobility.js', 'armory.js', 'core.js', 'persistence.js', 'render.js'];
const afterRender = ['architecture.js', 'field-visuals.js', 'passage-visuals.js', 'life-visuals.js',
  'life-ui.js', 'defense-visuals.js', 'defense-ui.js', 'ducts-visuals.js', 'ducts-ui.js',
  'mobility-visuals.js', 'mobility-ui.js', 'fidelity-visuals.js', 'fidelity-ui.js'];
async function runtime(assets = [], document = null, { ImageClass = FakeImage } = {}) {
  const doc = document || { baseURI: 'https://example.test/dlc/fleuve-de-la-douleur/visual-v1/JOUER.html',
    querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
  const context = vm.createContext({ URL, Promise, Image: ImageClass, document: doc,
    ROP_SPRITE_MANIFEST: { ...empty(), assets }, devicePixelRatio: 1 });
  const load = async (directory, file) => vm.runInContext(await readFile(join(directory, file), 'utf8'),
    context, { filename: file });
  await load(visual, 'sprite-loader.js');
  for (const file of beforeRender) await load(src, file);
  await load(visual, 'creature-png.js');
  for (const file of afterRender) await load(src, file);
  const nativePerson = context.ROP_Renderer.prototype.person;
  const nativeResident = context.ROP_Renderer.prototype.resident;
  const nativeLifeDraws = context.ROP_Renderer.prototype.lifeDraws;
  await load(visual, 'actors-props-png.js');
  await context.ROP_SPRITES.settled;
  const surface = canvas(), renderer = new context.ROP_Renderer(surface.element);
  renderer.fidelitySim = new context.ROP_CORE.Simulation();
  renderer.fidelitySim.s.character = 'brackett';
  return { ...surface, context, renderer, nativePerson, nativeResident, nativeLifeDraws,
    sim: renderer.fidelitySim };
}
const pngs = calls => calls.filter(call => call.method === 'drawImage');
const words = calls => calls.filter(call => call.method === 'fillText').map(call => call.args[0]);
const person = changes => ({ x: 330, z: .7, facing: 1, walk: 0, hp: 100, ...changes });

// Inject a failure in the fixture's Canvas boundary, not in the registry API.
// The native call stream is captured independently from a runtime with no PNGs.
function verifyNativeAfterCanvasError(fixture, draw, nativeCalls) {
  const ctx = fixture.renderer.ctx;
  const originalSave = ctx.save, originalRestore = ctx.restore, originalDraw = ctx.drawImage;
  let depth = 0, failedDepth = 0, attempts = 0;
  ctx.save = function (...args) { depth++; return originalSave.apply(this, args); };
  ctx.restore = function (...args) {
    assert.ok(depth > 0, 'No Canvas restore underflow.');
    depth--; return originalRestore.apply(this, args);
  };
  ctx.drawImage = function (...args) {
    attempts++; failedDepth = depth;
    originalDraw.apply(this, args);
    throw new Error('Injected Canvas drawImage failure');
  };
  const before = JSON.stringify(fixture.sim.s);
  fixture.calls.length = 0;
  assert.doesNotThrow(draw);
  assert.equal(attempts, 1, 'Exactly one PNG draw was attempted.');
  assert.equal(depth, 0, 'The Canvas stack is restored after the failed draw and native fallback.');
  const failedAt = fixture.calls.findIndex(call => call.method === 'drawImage');
  const afterFailure = fixture.calls.slice(failedAt + 1);
  assert.deepEqual(afterFailure.slice(0, failedDepth).map(call => call.method),
    Array(failedDepth).fill('restore'), 'All PNG transforms are restored before the native body begins.');
  assert.equal(JSON.stringify(afterFailure.slice(failedDepth)), JSON.stringify(nativeCalls),
    'One complete native draw follows the failure, with no missing or duplicate geometry.');
  const entry = fixture.context.ROP_SPRITES.entries[0];
  assert.equal(entry.status, 'error');
  assert.match(entry.error, /Injected Canvas drawImage failure/);
  fixture.calls.length = 0;
  draw();
  assert.equal(attempts, 1, 'A failed PNG is not retried or retained as a frozen pose.');
  assert.equal(pngs(fixture.calls).length, 0);
  assert.equal(JSON.stringify(fixture.calls), JSON.stringify(nativeCalls));
  assert.equal(depth, 0);
  assert.equal(JSON.stringify(fixture.sim.s), before, 'Fallback does not modify simulation or save state.');
}

test('manifest declares one whole PNG and refuses ambiguous coverage, paths and unsupported poses', () => {
  assert.equal(validateManifest({ ...empty(), assets: [asset()] }).assets.length, 1);
  assert.throws(() => validateManifest({ ...empty(), assets: [asset({ file: 'assets/../original.png' })] }), /paths/);
  assert.throws(() => validateManifest({ ...empty(), assets: [asset(), asset({ id: 'duplicate-coverage' })] }), /ambiguous/);
  assert.throws(() => validateManifest({ ...empty(), assets: [asset({ pose: 'walk' })] }), /unsupported/);
  assert.throws(() => validateManifest({ ...empty(), assets: [asset({ anchor: { x: 200, y: 190 } })] }), /anchor/);
  assert.equal(validateManifest({ ...empty(), assets: [asset({ id: 'cell', targetIds: ['cell'],
    category: 'item', pose: 'inventory', facing: 0, weapon: 'none' })] }).assets.length, 1);
  assert.throws(() => validateManifest({ ...empty(), assets: [asset({ id: 'unknown-item', targetIds: ['free-health'],
    category: 'item', pose: 'inventory', facing: 0, weapon: 'none' })] }), /native life item/);
});

test('alpha bounds calibrate size, foot anchor stays at the projected point and mirroring draws the whole image', async () => {
  const registry = createRegistry({ ...empty(), assets: [asset()] },
    { Image: FakeImage, baseURL: 'file:///game/visual-v1/JOUER.html' });
  await registry.settled;
  const entry = registry.select({ category: 'person', targetId: 'brackett', pose: 'idle',
    weapon: 'pulse', state: 'normal', facing: -1 });
  const { context, calls } = canvas();
  registry.draw(context, entry, { x: 400, y: 600, scale: 2, facing: -1 });
  assert.deepEqual(calls.find(call => call.method === 'translate').args, [400, 600]);
  assert.deepEqual(calls.find(call => call.method === 'scale').args, [-2, 2]);
  assert.deepEqual(pngs(calls)[0].args.slice(1), [-25, -95, 50, 100]);
  assert.equal(pngs(calls)[0].args.length, 5, 'No source cell is cropped from an atlas.');
  assert.equal(-95 + asset().anchor.y * .5, 0, 'Authored foot anchor is the local origin.');
  assert.equal(entry.image.src, 'file:///game/visual-v1/assets/brackett-idle.png');
});

test('failed decoding and dimension mismatch select no image and remain safe fallbacks', async () => {
  class Failed extends FakeImage { decode() { return Promise.reject(new Error('decode failed')); } }
  const query = { category: 'person', targetId: 'brackett', pose: 'idle', weapon: 'pulse', state: 'normal', facing: 1 };
  const failed = createRegistry({ ...empty(), assets: [asset()] }, { Image: Failed, baseURL: 'https://example.test/' });
  await failed.settled;
  assert.equal(failed.select(query), null);
  assert.match(failed.entries[0].error, /decode failed/);
  const oversized = createRegistry({ ...empty(), assets: [asset({ bounds: { x: 0, y: 0, w: 200, h: 200 } })] },
    { Image: FakeImage, baseURL: 'https://example.test/' });
  await oversized.settled;
  assert.equal(oversized.select(query), null);
});

test('a Canvas PNG exception restores the complete native person once and leaves the context balanced', async () => {
  const baseline = await runtime(), body = person();
  baseline.calls.length = 0;
  baseline.renderer.person(body, 'anne', false);
  assert.ok(baseline.calls.some(call => call.method === 'lineTo'), 'The reference contains a real native body.');
  const fixture = await runtime([asset({ id: 'anne-idle', targetIds: ['anne'], weapon: 'none' })]);
  const before = JSON.stringify(body);
  verifyNativeAfterCanvasError(fixture, () => fixture.renderer.person(body, 'anne', false), baseline.calls);
  assert.equal(JSON.stringify(body), before);
});

test('a Canvas PNG exception restores the native resident, tool and labels exactly once', async () => {
  const baseline = await runtime();
  const definition = baseline.context.ROP_DATA.life.residents.find(row => row.id === 'vale');
  const body = person({ x: baseline.sim.s.player.x + 60, wait: 1, alarm: 0 });
  baseline.calls.length = 0;
  baseline.renderer.resident(body, definition, baseline.sim);
  assert.ok(words(baseline.calls).includes(definition.name));
  assert.ok(baseline.calls.some(call => call.method === 'lineTo'), 'The reference includes the professional tool.');
  const fixture = await runtime([asset({ id: 'vale-idle', targetIds: ['vale'], weapon: 'none', accessory: 'tools' })]);
  const before = JSON.stringify(body);
  verifyNativeAfterCanvasError(fixture,
    () => fixture.renderer.resident(body, definition, fixture.sim), baseline.calls);
  assert.equal(JSON.stringify(body), before);
});

test('a Canvas PNG exception restores a real noncollidable prop once and preserves its world state', async () => {
  const baseline = await runtime();
  const room = baseline.context.ROP_DATA.rooms.find(row => row.id === 'armory');
  const prop = room.props.find(row => row.kind === 'case' && !row.collidable && !row.footprint);
  assert.ok(prop, 'Exercise a real prop eligible for PNG replacement.');
  baseline.calls.length = 0;
  baseline.renderer.prop(prop, room, baseline.sim.s);
  assert.ok(baseline.calls.some(call => call.method === 'fillRect'), 'The reference contains the original crate.');
  const fixture = await runtime([asset({ id: 'armory-case', targetIds: ['case'],
    category: 'prop', pose: 'static', facing: 0, weapon: 'none' })]);
  const before = JSON.stringify(prop);
  verifyNativeAfterCanvasError(fixture, () => fixture.renderer.prop(prop, room, fixture.sim.s), baseline.calls);
  assert.equal(JSON.stringify(prop), before);
});

test('covered idle player uses a PNG while motion, aim, missing crouch/stowed and reload retain original body', async () => {
  const { renderer, calls, sim } = await runtime([asset()]);
  const before = JSON.stringify(sim.s);
  renderer.person(person(), 'brackett', true);
  assert.equal(pngs(calls).length, 1);
  for (const body of [person({ x: 350, walk: .3 }), person({ x: 350, walk: .3, aim: { x: 1, z: 0 } }),
    person({ x: 350, walk: .3, crouch: true }), person({ x: 350, walk: .3, stowed: true }),
    person({ x: 350, walk: .3, reload: 1 })]) {
    calls.length = 0; renderer.person(body, 'brackett', true);
    assert.equal(pngs(calls).length, 0);
  }
  calls.length = 0; renderer.person(person({ x: 350, walk: .3 }), 'brackett', true);
  assert.equal(pngs(calls).length, 1, 'An accumulated walk phase does not freeze the actor in a moving state after stopping.');
  assert.equal(JSON.stringify(sim.s), before, 'Presentation did not mutate simulation or save state.');
});

test('a baked M41A body is never displayed with M240 selected; an explicitly covered pose can be used', async () => {
  const { renderer, calls, sim } = await runtime([asset(),
    asset({ id: 'brackett-crouch', file: 'assets/brackett-crouch.png', pose: 'crouch', height: 65 })]);
  renderer.person(person({ crouch: true }), 'brackett', true);
  assert.equal(pngs(calls).length, 1);
  sim.s.armory.kits.brackett.selected = 'flame';
  calls.length = 0; renderer.person(person(), 'brackett', true);
  assert.equal(pngs(calls).length, 0);
});

test('resident appearance identity wins over its anne call argument; uncovered residents remain original', async () => {
  const { renderer, calls, context } = await runtime([
    asset({ id: 'anne-idle', targetIds: ['anne'], weapon: 'none' }),
    asset({ id: 'vale-idle', file: 'assets/vale.png', targetIds: ['vale'], weapon: 'none' })
  ]);
  const vale = context.ROP_DATA.life.residents.find(def => def.id === 'vale');
  renderer.person(person({ appearance: vale }), 'anne');
  assert.equal(pngs(calls).length, 1);
  assert.match(pngs(calls)[0].args[0].src, /vale\.png$/);
  const rhee = context.ROP_DATA.life.residents.find(def => def.id === 'rhee');
  calls.length = 0; renderer.person(person({ appearance: rhee }), 'anne');
  assert.equal(pngs(calls).length, 0);
});

test('unarmed stowed portraits share native idle geometry while Marines keep strict pose and weapon coverage', async () => {
  const unarmed = ['anne', 'newt', 'russ', 'komiskey', 'luisa', 'civilian',
    'mori', 'tim', 'simpson', 'hansard', 'joel', 'bronagh'];
  const assets = unarmed.map(id => asset({ id: id + '-idle', file: 'assets/' + id + '-idle.png',
    targetIds: [id], weapon: 'none' }));
  const { renderer, nativePerson, calls, sim } = await runtime(assets.concat([
    asset(), asset({ id: 'paris-idle', targetIds: ['paris'], file: 'assets/paris-idle.png' })
  ]));
  const before = JSON.stringify(sim.s);
  for (const id of unarmed) {
    calls.length = 0; nativePerson.call(renderer, person(), id, false);
    const nativeIdle = JSON.stringify(calls);
    calls.length = 0; nativePerson.call(renderer, person({ stowed: true }), id, false);
    assert.equal(JSON.stringify(calls), nativeIdle, id + ': native idle and stowed geometry is identical.');
    calls.length = 0; renderer.person(person({ stowed: true }), id, false);
    assert.equal(pngs(calls).length, 1, id + ': standing unarmed portrait uses its idle PNG.');
    assert.ok(pngs(calls)[0].args[0].src.endsWith('/' + id + '-idle.png'));
    calls.length = 0; renderer.person(person({ stowed: true, crouch: true }), id, false);
    assert.equal(pngs(calls).length, 0, id + ': no standing PNG for a crouched portrait.');
    calls.length = 0; renderer.person(person({ stowed: true, x: 350, walk: .3 }), id, false);
    assert.equal(pngs(calls).length, 0, id + ': no standing PNG during movement.');
  }
  for (const id of ['brackett', 'paris']) {
    sim.s.character = id;
    sim.s.armory.kits[id].selected = 'pulse';
    calls.length = 0; renderer.person(person(), id, true);
    assert.equal(pngs(calls).length, 1, id + ': matching M41A idle accepted.');
    calls.length = 0; renderer.person(person({ stowed: true }), id, true);
    assert.equal(pngs(calls).length, 0, id + ': M41A idle cannot represent stowed.');
    sim.s.armory.kits[id].selected = 'flame';
    calls.length = 0; renderer.person(person(), id, true);
    assert.equal(pngs(calls).length, 0, id + ': M41A idle cannot represent M240.');
  }
  // The presentation assertions above use a fixture selection only; the native
  // selector's initial state is restored before testing renderer immutability.
  sim.s.character = 'brackett';
  sim.s.armory.kits.brackett.selected = 'pulse';
  sim.s.armory.kits.paris.selected = 'pulse';
  assert.equal(JSON.stringify(sim.s), before);
  const covered = await runtime([
    asset({ id: 'anne-stowed', targetIds: ['anne'], file: 'assets/anne-stowed.png', pose: 'stowed', weapon: 'none' }),
    assets[0],
    asset({ id: 'brackett-stowed', file: 'assets/brackett-stowed.png', pose: 'stowed', weapon: 'none' })
  ]);
  covered.renderer.person(person({ stowed: true }), 'anne');
  assert.ok(pngs(covered.calls)[0].args[0].src.endsWith('/anne-stowed.png'), 'Explicit stowed art wins.');
  covered.calls.length = 0; covered.renderer.person(person({ stowed: true }), 'brackett', true);
  assert.equal(pngs(covered.calls).length, 1, 'A declared unarmed Marine stowed pose is still admitted.');
  covered.calls.length = 0; covered.renderer.person(person(), 'brackett', true);
  assert.equal(pngs(covered.calls).length, 0, 'A stowed Marine PNG never hides an equipped weapon.');
});

test('resident accessory admission matches all twelve frozen native tools and rejects inconsistent composites', async () => {
  const { context } = await runtime();
  const residents = context.ROP_DATA.life.residents;
  assert.equal(residents.length, 12);
  for (const definition of residents) {
    const row = asset({ id: definition.id + '-idle', targetIds: [definition.id],
      weapon: 'none', accessory: definition.tool });
    assert.equal(validateManifest({ ...empty(), assets: [row] }).assets.length, 1);
    assert.throws(() => validateManifest({ ...empty(), assets: [{ ...row,
      accessory: definition.tool === 'tablet' ? 'tools' : 'tablet' }] }), /native tool/);
  }
  const valid = asset({ id: 'vale-idle', targetIds: ['vale'], weapon: 'none', accessory: 'tools' });
  for (const mismatch of [
    { targetIds: ['anne'] }, { targetIds: ['brackett'] }, { targetIds: ['vale', 'rhee'] },
    { pose: 'crouch' }, { pose: 'stowed' }, { weapon: 'pulse' }, { accessory: null },
    { category: 'prop', pose: 'static', facing: 0 }
  ]) assert.throws(() => validateManifest({ ...empty(), assets: [{ ...valid, ...mismatch }] }), /native tool/);
});

test('resident PNGs include their own tool only after a real draw and retain native labels, alarm and fallbacks', async () => {
  const dataContext = vm.createContext({});
  vm.runInContext(await readFile(join(src, 'data.js'), 'utf8'), dataContext);
  const rows = Array.from(dataContext.ROP_DATA.life.residents, definition => asset({
    id: definition.id + '-idle', file: 'assets/' + definition.id + '.png',
    targetIds: [definition.id], weapon: 'none', accessory: definition.tool
  }));
  const { context, renderer, calls, nativeResident, nativeLifeDraws, sim } = await runtime(rows);
  assert.equal(renderer.lifeDraws, nativeLifeDraws, 'Residents keep the native depth-sorted draw registration.');
  const originalState = JSON.stringify(sim.s);
  for (const definition of context.ROP_DATA.life.residents) {
    const body = person({ x: sim.s.player.x + 60, wait: 1, alarm: 0 });
    calls.length = 0; nativeResident.call(renderer, body, definition, sim);
    const nativeLabels = calls.filter(call => call.method === 'fillText').map(call => call.args);
    calls.length = 0; renderer.resident(body, definition, sim);
    assert.equal(pngs(calls).length, 1, definition.id + ': one integrated body/tool PNG.');
    assert.ok(pngs(calls)[0].args[0].src.endsWith('/' + definition.id + '.png'));
    assert.equal(calls.some(call => ['fillRect', 'lineTo', 'arc'].includes(call.method)), false,
      definition.id + ': no second vector tool on top of the PNG.');
    assert.deepEqual(calls.filter(call => call.method === 'fillText').map(call => call.args), nativeLabels,
      definition.id + ': same proximity names and prompts at native coordinates.');
    assert.ok(words(calls).includes(definition.name));
    assert.ok(words(calls).includes('E / P · ÉCHANGER'));
  }
  assert.equal(JSON.stringify(sim.s), originalState, 'Resident rendering does not mutate simulation or saves.');
  const definition = context.ROP_DATA.life.residents.find(row => row.id === 'vale');
  const nativeFallback = body => {
    calls.length = 0; nativeResident.call(renderer, body, definition, sim);
    const expected = JSON.stringify(calls);
    calls.length = 0; renderer.resident(body, definition, sim);
    assert.equal(pngs(calls).length, 0);
    assert.equal(JSON.stringify(calls), expected, 'Full native body and professional tool return.');
  };
  nativeFallback(person({ x: sim.s.player.x + 200, wait: 0, walk: .3, alarm: 0 }));
  nativeFallback(person({ x: sim.s.player.x + 220, wait: 0, walk: .6, alarm: 0 }));
  nativeFallback(person({ x: definition.refuge.x, wait: 1, walk: 0, alarm: 1 }));
  // Alarm away from the refuge retains a standing pose and its warning label.
  const alarmBody = person({ x: definition.refuge.x + 80, wait: 1, alarm: 1 });
  sim.s.player.x = alarmBody.x - 60;
  renderer.resident(alarmBody, definition, sim); // first positional observation retains the native body
  calls.length = 0; renderer.resident(alarmBody, definition, sim);
  assert.equal(pngs(calls).length, 1);
  assert.ok(words(calls).includes('CHERCHE UN ABRI'));
  const farBody = { ...alarmBody, x: sim.s.player.x + 1000, alarm: 0 };
  renderer.resident(farBody, definition, sim);
  calls.length = 0; renderer.resident(farBody, definition, sim);
  assert.equal(pngs(calls).length, 1);
  assert.equal(words(calls).length, 0, 'Distant residents keep native label visibility.');

  class FailedImage extends FakeImage { decode() { return Promise.reject(new Error('resident PNG failed')); } }
  const failed = await runtime([rows[0]], null, { ImageClass: FailedImage });
  const failedDef = failed.context.ROP_DATA.life.residents[0];
  const failedBody = person({ x: failed.sim.s.player.x + 60, wait: 1, alarm: 0 });
  failed.nativeResident.call(failed.renderer, failedBody, failedDef, failed.sim);
  const expected = JSON.stringify(failed.calls);
  failed.calls.length = 0; failed.renderer.resident(failedBody, failedDef, failed.sim);
  assert.equal(pngs(failed.calls).length, 0);
  assert.equal(JSON.stringify(failed.calls), expected, 'Decode failure restores the full native person/tool.');

  const undrawn = await runtime([rows[0]]), undrawnDef = undrawn.context.ROP_DATA.life.residents[0];
  undrawn.context.ROP_SPRITES.draw = () => false;
  undrawn.renderer.resident(person({ wait: 1, alarm: 0 }), undrawnDef, undrawn.sim);
  assert.equal(pngs(undrawn.calls).length, 0);
  assert.ok(undrawn.calls.some(call => call.method === 'lineTo'), 'A failed draw never suppresses native tools.');
  assert.ok(words(undrawn.calls).includes(undrawnDef.name));

  const { accessory, ...withoutTool } = rows[0];
  const bare = await runtime([withoutTool]), bareDef = bare.context.ROP_DATA.life.residents[0];
  bare.renderer.resident(person({ wait: 1, alarm: 0 }), bareDef, bare.sim);
  assert.equal(pngs(bare.calls).length, 1);
  assert.ok(bare.calls.some(call => call.method === 'lineTo'), 'Without an integrated accessory, the native tool remains.');
});

test('creature hook retains native windup, shutter bash and duct entry warnings through the real extension chain', async () => {
  const { renderer, calls } = await runtime([asset({ id: 'adult-idle', targetIds: ['adult'],
    category: 'creature', weapon: 'none' })]);
  const enemy = { id: 'qa-adult', kind: 'adult', x: 500, z: .7, facing: 1, hp: 72, state: 'patrol' };
  renderer.creature(enemy);
  assert.equal(pngs(calls).length, 1);
  calls.length = 0; renderer.creature({ ...enemy, state: 'windup' });
  assert.equal(pngs(calls).length, 0);
  assert.ok(words(calls).includes('!'));
  calls.length = 0; renderer.creature({ ...enemy, bash: { timer: .3 } });
  assert.ok(words(calls).includes('FRAPPE IMMINENTE'));
  calls.length = 0; renderer.creature({ ...enemy, ductEntry: { stage: 'entering', remaining: .2 } });
  assert.ok(words(calls).includes('DANS LA GAINE'));
  calls.length = 0; renderer.creature({ ...enemy, hp: 0, state: 'dead' });
  assert.equal(pngs(calls).length, 0);
  calls.length = 0; renderer.creature({ ...enemy, x: 530 });
  assert.equal(pngs(calls).length, 0, 'No invented locomotion animation.');
  const baseline = await runtime();
  baseline.calls.length = 0;
  baseline.renderer.creature(enemy);
  assert.ok(baseline.calls.some(call => call.method === 'lineTo'), 'The reference contains the native creature.');
  const failed = await runtime([asset({ id: 'adult-idle', targetIds: ['adult'],
    category: 'creature', weapon: 'none' })]);
  const before = JSON.stringify(enemy);
  verifyNativeAfterCanvasError(failed, () => failed.renderer.creature(enemy), baseline.calls);
  assert.equal(JSON.stringify(enemy), before);
});

test('actor projection remains identical in lateral and depth positions, including connector multiplier', async () => {
  const { renderer, calls } = await runtime([asset({ id: 'anne-idle', targetIds: ['anne'], weapon: 'none' })]);
  renderer.scale = 1.5; renderer.cam = 100; renderer.h = 760;
  for (const [index, z] of [.7, .25, .88].entries()) {
    const body = person({ z });
    // First observation can detect a real position change; the second is still.
    renderer.person(body, 'anne', false, 1.02);
    calls.length = 0; renderer.person(body, 'anne', false, 1.02);
    assert.equal(pngs(calls).length, 1);
    const expected = renderer.project(body.x, z);
    assert.deepEqual(calls.find(call => call.method === 'translate').args, [expected.x, expected.y]);
    const scale = 1.5 * (.82 + z * .28) * 1.02;
    assert.deepEqual(calls.find(call => call.method === 'scale').args, [scale, scale], 'projection ' + index);
  }
});

test('only static noncollidable props change; physical cover, portal and object dispatch remain native', async () => {
  const { renderer, calls, sim } = await runtime([asset({ id: 'specimen', targetIds: ['specimen'],
    category: 'prop', pose: 'static', facing: 0, weapon: 'none' })]);
  const base = { id: 'specimen-qa', kind: 'specimen', x: 500, z: .45, collidable: false };
  const room = sim.room, state = sim.s, before = JSON.stringify(state);
  renderer.prop(base, room, state);
  assert.equal(pngs(calls).length, 1);
  calls.length = 0; renderer.prop({ ...base, collidable: true, footprint: { w: 175, d: .12 } }, room, state);
  assert.equal(pngs(calls).length, 0);
  assert.ok(calls.some(call => call.method === 'fillRect'), 'Footprint geometry remains drawn.');
  assert.equal(JSON.stringify(state), before);
  assert.match(String(renderer.portal), /cfg=p\.architecture/);
  assert.match(String(renderer.object), /o\.actorId/);
});

test('inventory PNGs decorate the real armory factory without replacing its controls or granting supplies', async () => {
  const images = [], buttons = ['pulse', 'flame', 'grenade'].map(weapon => {
    const label = { before(image) { images.push(image); } };
    const article = { querySelector(selector) {
      return selector === '.weapon-symbol' ? label
        : images.find(image => image.dataset.spriteId === 'weapon-' + weapon) || null;
    } };
    return { dataset: { armory: weapon }, closest: () => article };
  });
  const document = {
    baseURI: 'file:///local/visual-v1/JOUER.html',
    querySelector(selector) { return buttons.find(button => selector === '[data-armory="' + button.dataset.armory + '"]'); },
    querySelectorAll: () => buttons,
    createElement: () => ({ style: {}, dataset: {} })
  };
  const assets = ['pulse', 'flame'].map(weapon => asset({ id: 'weapon-' + weapon, file: 'assets/' + weapon + '.png',
    targetIds: [weapon], category: 'weapon', pose: 'inventory', facing: 0, weapon }));
  const { context, sim } = await runtime(assets, document), before = JSON.stringify(sim.s);
  let opened = null;
  const ui = context.ROP_FIDELITY_UI({ getSim: () => sim,
    openDialog(kind) { opened = kind; }, closeDialog() {}, events() {}, esc: String });
  ui.arsenal();
  assert.equal(opened, 'armory');
  assert.equal(images.length, 2);
  assert.ok(images.every(image => image.src.startsWith('file:///local/visual-v1/assets/')));
  assert.ok(buttons.every(button => typeof button.onclick === 'function'));
  assert.equal(JSON.stringify(sim.s), before, 'Viewing images does not grant or select a weapon.');
});

test('all eight native life items get icons in real pockets or supply markup without changing amounts', async () => {
  const itemIds = ['cell', 'wire', 'casing', 'decoy', 'ration', 'medkit', 'ammo', 'flare'];
  const assets = itemIds.map(id => asset({ id, file: 'assets/' + id + '.png', targetIds: [id],
    category: 'item', pose: 'inventory', facing: 0, weapon: 'none' }));
  const { context, sim } = await runtime(assets);
  let dialog = '';
  const ui = context.ROP_LIFE_UI({ getSim: () => sim, openDialog(kind, title, body) { dialog = body; },
    closeDialog() {}, events() {}, esc: String });
  const beforePockets = JSON.stringify(sim.s), pockets = ui.pockets();
  for (const id of ['cell', 'wire', 'casing', 'decoy']) assert.ok(pockets.includes('data-river-item="' + id + '"'));
  assert.equal(JSON.stringify(sim.s), beforePockets);
  const seen = new Set(['cell', 'wire', 'casing', 'decoy']);
  for (const definition of context.ROP_DATA.life.containers) {
    sim.s.room = definition.room;
    sim.s.player.x = definition.x; sim.s.player.z = definition.z;
    sim.s.life.containers[definition.id] = { open: true, remaining: { ...definition.items } };
    const before = JSON.stringify(sim.s);
    ui.supplies(definition.id);
    for (const id of Object.keys(definition.items)) {
      assert.ok(dialog.includes('data-river-item="' + id + '"'), id + ' in ' + definition.id);
      seen.add(id);
    }
    assert.equal(JSON.stringify(sim.s), before, 'Inspecting reserves does not take an item.');
  }
  assert.deepEqual([...seen].sort(), [...itemIds].sort());
});

test('equipment icons attach to existing disabled controls and ammo readout without enabling or granting tools', async () => {
  const makeElement = () => ({ children: [], style: {}, querySelector(selector) {
    if (selector === '.kit-icon') return this.icon;
    return this.children.find(child => selector === '[data-river-item="' + child.dataset.riverItem + '"]') || null;
  }, prepend(child) { this.children.unshift(child); } });
  const buttons = ['light', 'tracker', 'weld', 'heal', 'flare', 'decoy'].map(key => {
    const button = makeElement();button.dataset = { kit: key };button.disabled = true;button.icon = { style: {} };return button;
  });
  const ammo = makeElement();
  const document = { baseURI: 'file:///local/visual-v1/JOUER.html', addEventListener() {},
    querySelector: selector => selector === '.kit-top > b' ? ammo : null,
    querySelectorAll: selector => selector === '[data-kit]' ? buttons : [],
    createElement: () => ({ dataset: {}, style: {}, setAttribute() {} }) };
  const ids = ['light', 'tracker', 'weld', 'medkit', 'flare', 'decoy', 'ammo'];
  const assets = ids.map(id => asset({ id, file: 'assets/' + id + '.png', targetIds: [id],
    category: 'item', pose: 'inventory', facing: 0, weapon: 'none' }));
  const { context, sim } = await runtime(assets, document);
  context.ROP_APP = { simulation: sim };
  const before = JSON.stringify(sim.s);
  const ui = context.ROP_LIFE_UI({ getSim: () => sim, openDialog() {}, closeDialog() {}, events() {}, esc: String });
  ui.pockets();
  await Promise.resolve();
  assert.deepEqual(buttons.map(button => button.children[0].dataset.riverItem),
    ['light', 'tracker', 'weld', 'medkit', 'flare', 'decoy']);
  assert.ok(buttons.every(button => button.disabled));
  assert.equal(ammo.children[0].dataset.riverItem, 'ammo');
  assert.equal(JSON.stringify(sim.s), before);
});

test('sealed caveau eggs are covered while the broad collision bed keeps its original floor geometry', async () => {
  const { context, renderer, calls, sim } = await runtime([
    asset({ id: 'closed-egg', targetIds: ['egg', 'sealed-egg', 'egg-bed'], category: 'prop',
      pose: 'static', facing: 0, weapon: 'none' })
  ]);
  const room = context.ROP_DATA.rooms.find(room => room.id === 'egg_vault');
  const eggs = room.props.filter(prop => prop.kind === 'sealed-egg');
  assert.equal(eggs.length, 8);
  for (const egg of eggs) renderer.prop(egg, room, sim.s);
  assert.equal(pngs(calls).length, 8);
  calls.length = 0;
  renderer.prop(room.props.find(prop => prop.kind === 'egg-bed'), room, sim.s);
  assert.equal(pngs(calls).length, 0, 'A vertical egg is not stretched across the collision floor.');
  assert.ok(calls.some(call => call.method === 'ellipse'));
  calls.length = 0;
  assert.equal(renderer.extraProp(eggs[0], room, sim.s), true);
  assert.equal(pngs(calls).length, 1);
});

test('the isolation glass frame stays mounted above the floor at its original world anchor', async () => {
  const { context, renderer, calls, sim } = await runtime([
    asset({ id: 'isolation-glass', targetIds: ['glass'], category: 'prop',
      pose: 'static', facing: 0, weapon: 'none' })
  ]);
  const room = context.ROP_DATA.rooms.find(room => room.id === 'isolation');
  const prop = room.props.find(prop => prop.kind === 'glass'), before = JSON.stringify(prop);
  const position = renderer.project(prop.x, prop.z), scale = renderer.scale * (.8 + prop.z * .28);
  renderer.prop(prop, room, sim.s);
  assert.deepEqual(calls.find(call => call.method === 'translate').args, [position.x, position.y - 53 * scale]);
  assert.equal(JSON.stringify(prop), before);
});

test('derived build preserves the original bytes and inserts adapters before native wrappers and UI startup', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'river-sprite-build-'));
  try {
    const fixtureDlc = join(directory, 'dlc/fleuve-de-la-douleur'), fixtureVisual = join(fixtureDlc, 'visual-v1');
    await mkdir(join(fixtureDlc, 'src/river-of-pain'), { recursive: true });
    await mkdir(fixtureVisual, { recursive: true });
    await cp(join(dlc, 'JOUER.html'), join(fixtureDlc, 'JOUER.html'));
    for (const file of ['render.js', 'fidelity-ui.js'])
      await cp(join(src, file), join(fixtureDlc, 'src/river-of-pain', file));
    for (const file of ['sprite-loader.js', 'creature-png.js', 'actors-props-png.js'])
      await cp(join(visual, file), join(fixtureVisual, file));
    await writeFile(join(fixtureVisual, 'sprite-manifest.json'), JSON.stringify(empty()));
    const recomposed = await renderRiverOfPainVisuals({ root: directory });
    await assert.rejects(readFile(join(fixtureVisual, 'JOUER.html')), { code: 'ENOENT' },
      'Canonical rendering must not write a derived file.');
    const report = await buildRiverOfPainVisuals({ root: directory });
    const html = await readFile(join(fixtureVisual, 'JOUER.html'), 'utf8');
    assert.equal(recomposed.html, html);
    assert.equal(recomposed.htmlSha256, report.htmlSha256);
    assert.equal(report.sourceSha256, RIVER_ORIGINAL_SHA256);
    assert.equal(digest(await readFile(join(fixtureDlc, 'JOUER.html'))), RIVER_ORIGINAL_SHA256);
    const early = html.indexOf('data-rop-visual="creature-png"');
    const defense = html.indexOf('const base=P.creature;');
    const late = html.indexOf('data-rop-visual="actors-props-png"');
    const startup = html.indexOf("const renderer=new root.ROP_Renderer($('scene'))");
    assert.ok(early > html.indexOf('root.ROP_Renderer=Renderer;') && early < defense);
    assert.ok(late > html.indexOf('root.ROP_FIDELITY_UI=function') && late < startup);
    assert.equal((html.match(/<script src=/g) || []).length, 0, 'Derived scripts remain inline.');
    assert.match(html, /COLONIE HADLEY’S HOPE/);
    await assert.rejects(buildRiverOfPainVisuals({ root: directory, outputPath: join(fixtureDlc, 'JOUER.html') }),
      /only be written inside/);
    // A real, tiny PNG tests the filesystem/media admission separately from the
    // controlled image decoder used by Canvas unit tests.
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aM8sAAAAASUVORK5CYII=', 'base64');
    await mkdir(join(fixtureVisual, 'assets'));
    await writeFile(join(fixtureVisual, 'assets/unit.png'), png);
    const media = asset({ file: 'assets/unit.png', height: 1,
      bounds: { x: 0, y: 0, w: 1, h: 1 }, anchor: { x: .5, y: 1 }, sha256: digest(png) });
    await writeFile(join(fixtureVisual, 'sprite-manifest.json'), JSON.stringify({ ...empty(), assets: [media] }));
    const withMedia = await buildRiverOfPainVisuals({ root: directory });
    assert.deepEqual([withMedia.assets[0].width, withMedia.assets[0].height], [1, 1]);
    assert.match(await readFile(join(fixtureVisual, 'JOUER.html'), 'utf8'), /assets\/unit\.png/);
    await writeFile(join(fixtureVisual, 'sprite-manifest.json'),
      JSON.stringify({ ...empty(), assets: [{ ...media, bounds: { x: 0, y: 0, w: 2, h: 1 } }] }));
    await assert.rejects(buildRiverOfPainVisuals({ root: directory }), /Alpha bounds exceed PNG/);
    await writeFile(join(fixtureVisual, 'sprite-manifest.json'),
      JSON.stringify({ ...empty(), assets: [{ ...media, sha256: '0'.repeat(64) }] }));
    await assert.rejects(buildRiverOfPainVisuals({ root: directory }), /PNG hash differs/);
    await writeFile(join(fixtureVisual, 'sprite-manifest.json'), JSON.stringify(empty()));
    await writeFile(join(fixtureDlc, 'JOUER.html'), html);
    await assert.rejects(buildRiverOfPainVisuals({ root: directory }), /Original v0\.9 bytes failed/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
