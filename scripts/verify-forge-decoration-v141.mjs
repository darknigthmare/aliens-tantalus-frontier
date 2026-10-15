import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ForgeModel, parseProject, serializeProject, nativeTiles } from '../src/forge-model-v130.js';
import { ForgeSaveSystemV62 } from '../src/forge-save-v62.js';
import { compileEditorGridV136 } from '../src/editor-spatial-v136.js';
import { compileShipProject } from '../src/hub-v51-runtime.js';
import { GameEngine as NativeMission } from '../src/game-v51-runtime.js';
import { FORGE_DECORATION_ASSETS_V141, parseForgeDecorationV141, forgeDecorationPlanV141,
  withForgeDecorationV141 } from '../src/forge-decoration-v141.js';

function project(kind = 'mission', size = [32, 18]) {
  const model = new ForgeModel({ schema: 2, kind, size, tiles: [
    { position: '2:15', type: 'spawn' }, { position: '6:15', type: 'objective' },
    ...Array.from({ length: size[0] }, (_, x) => ({ position: `${x}:16`, type: 'floor' }))
  ] });
  model.transaction('Décors', () => {
    for (const [layer, assetId] of [['background', 'sterile-cabinet'], ['foreground', 'engine-pump']]) {
      model.paint(3, 15, 'wall', layer);
      const cell = model.room.cells.find(entry => entry.layer === layer);
      cell.decoration = { assetId, opacity: .65, flipX: true, parallax: .1 };
    }
  });
  return model;
}
const memory = () => { const map = new Map(); return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)) }; };

test('all 13 catalog entries use reviewed frontal atlas crops and measured physical dimensions', () => {
  assert.equal(FORGE_DECORATION_ASSETS_V141.length, 13);
  assert.equal(new Set(FORGE_DECORATION_ASSETS_V141.map(entry => entry.id)).size, 13);
  for (const entry of FORGE_DECORATION_ASSETS_V141) {
    assert.match(entry.src, /^\/assets\/openai\/hub\/props\/v139\/(furniture|service-front|ship-front)-atlas\.png$/);
    const data = fs.readFileSync(new URL(`..${entry.src}`, import.meta.url));
    assert.equal(data.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(data.readUInt32BE(16), entry.imageWidth);
    assert.equal(data.readUInt32BE(20), entry.imageHeight);
    assert.ok(Object.isFrozen(entry));
    assert.equal(entry.projection, 'strict-side-elevation');
    assert.equal(entry.humanReferenceHeight, 96.5);
    assert.ok(Math.abs(entry.worldSize.w / entry.worldSize.h - entry.source.w / entry.source.h) < 1e-10);
    assert.ok(entry.source.x + entry.source.w <= entry.imageWidth && entry.source.y + entry.source.h <= entry.imageHeight);
  }
});

test('schema 1/2 migration and old schema 3 cells do not gain authoring fields', () => {
  for (const schema of [1, 2]) {
    const result = parseProject({ schema, tiles: [{ position: '1:1', type: 'floor' }] });
    assert.equal(Object.hasOwn(result.rooms[0].cells[0], 'decoration'), false);
  }
  const model = project(); delete model.room.cells.at(-1).decoration;
  const parsed = parseProject(model.data);
  assert.equal(Object.hasOwn(parsed.rooms[0].cells.at(-1), 'decoration'), false);
  assert.equal(forgeDecorationPlanV141(parsed.rooms[0], { width: 6200, height: 1080 }).length, 2);
});

for (const raw of [null, [], {}, { assetId: 'https://evil.invalid/a.png' }, { assetId: '//evil.invalid/a.png' },
  { assetId: 'data:image/svg+xml,<svg onload="alert(1)">' }, { assetId: '../../private' },
  { assetId: '/assets/openai/metroidvania/props/supply-crates.png' },
  { assetId: 'sterile-cabinet', src: '/assets/safe.png' }, { assetId: 'sterile-cabinet', width: 9999 },
  { assetId: 'sterile-cabinet', opacity: '1' }, { assetId: 'sterile-cabinet', opacity: NaN },
  { assetId: 'sterile-cabinet', opacity: Infinity }, { assetId: 'sterile-cabinet', opacity: -.01 },
  { assetId: 'sterile-cabinet', opacity: 1.01 }, { assetId: 'sterile-cabinet', flipX: 1 },
  { assetId: 'sterile-cabinet', parallax: '.1' }, { assetId: 'sterile-cabinet', parallax: .151 },
  { assetId: 'sterile-cabinet', parallax: -.151 }]) {
  test(`invalid decoration fails before mutation: ${JSON.stringify(raw)}`, () => {
    const model = project(), before = structuredClone(model.data), history = model.history.length;
    const input = structuredClone(model.data); input.rooms[0].cells.at(-1).decoration = raw;
    assert.throws(() => model.load(input), /Décor invalide/);
    assert.deepEqual(model.data, before); assert.equal(model.history.length, history);
  });
}
test('physical layers reject decorative configuration and accepted fields get explicit defaults', () => {
  assert.throws(() => parseForgeDecorationV141({ assetId: 'sterile-cabinet' }, 'structure'));
  assert.deepEqual(parseForgeDecorationV141({ assetId: 'sterile-cabinet' }, 'background'),
    { assetId: 'sterile-cabinet', opacity: 1, flipX: false, parallax: 0 });
});

test('save, export, import, copy and undo preserve resource, opacity, flip and parallax', () => {
  const model = project(), before = structuredClone(model.data);
  const storage = memory(), store = new ForgeSaveSystemV62(storage); store.load();
  store.upsert({ ...serializeProject(model.data), id: 'decorated-project' });
  const reopened = new ForgeSaveSystemV62(storage); reopened.load();
  assert.equal(reopened.lastWriteV130.persisted, true);
  assert.deepEqual(parseProject(reopened.data.projects[0]), before);
  const imported = new ForgeSaveSystemV62(memory()); imported.load(); imported.import(store.export());
  assert.deepEqual(parseProject(imported.data.projects[0]), before);
  const decor = model.room.cells.filter(cell => cell.decoration);
  model.transaction('Coller', () => model.paste(model.copy(decor.map(cell => cell.id)), 8, 12));
  assert.deepEqual(model.room.cells.at(-1).decoration, decor.at(-1).decoration);
  model.undo(); assert.deepEqual(model.data, before); model.redo();
  assert.equal(model.room.cells.filter(cell => cell.decoration).length, 4);
});

test('both physics compilers receive identical geometry with and without decorative layers', () => {
  for (const kind of ['mission', 'ship']) {
    const decorated = project(kind).data, plain = structuredClone(decorated);
    plain.rooms[0].cells = plain.rooms[0].cells.filter(cell => !cell.decoration);
    assert.deepEqual(nativeTiles(decorated.rooms[0]), nativeTiles(plain.rooms[0]));
    const compile = kind === 'mission' ? compileEditorGridV136 : compileShipProject;
    assert.deepEqual(compile(serializeProject(decorated)), compile(serializeProject(plain)));
  }
});

test('source ratio, measured-foot anchor, room clipping and bounded parallax hold at every grid density', () => {
  for (const bounds of [{ width: 6200, height: 1080 }, { width: 5120, height: 720 }])
    for (const size of [[32, 18], [64, 36], [128, 72]])
      for (const source of FORGE_DECORATION_ASSETS_V141) {
        const cells = [[0, 0], [size[0] - 1, size[1] - 1], [Math.floor(size[0]/2), Math.floor(size[1]/2)]].map(([x, y], i) => ({
          id: `cell-${i}`, x, y, type: 'wall', layer: 'background',
          decoration: { assetId: source.id, opacity: .7, flipX: true, parallax: .15 }
        }));
        const room = { size, cells };
        for (const camera of [{ x: -1e8 }, { x: 0 }, { x: 1e8 }]) {
          const plans = forgeDecorationPlanV141(room, bounds, { camera });
          for (const plan of plans) {
            assert.ok(Math.abs(plan.w / plan.h - source.sourceWidth / source.sourceHeight) < 1e-10);
            assert.ok(plan.x >= 0 && plan.y >= 0 && plan.x + plan.w <= bounds.width + 1e-8 && plan.y + plan.h <= bounds.height + 1e-8);
            assert.ok(Math.abs(plan.drift) <= Math.min(32, bounds.width / size[0] * .4));
            assert.equal(plan.anchor, 'measured-foot-center');
            assert.ok(Math.abs(plan.w - source.worldSize.w) < 1e-10);
            assert.ok(Math.abs(plan.h - source.worldSize.h) < 1e-10);
          }
        }
        const centered = forgeDecorationPlanV141(room, bounds, { reducedMotion: true })[2];
        assert.equal(centered.drift, 0);
        assert.ok(Math.abs(centered.x + centered.w / 2 - (Math.floor(size[0]/2)+.5) * bounds.width / size[0]) < 1e-8);
        assert.ok(Math.abs(centered.y + centered.footSourceY * centered.h / centered.sourceHeight - (Math.floor(size[1]/2)+1) * bounds.height / size[1]) < 1e-8);
      }
});

class ReadyImage extends EventTarget { complete = true; naturalWidth = 175; naturalHeight = 160; }
const drawingSink = events => new Proxy({ drawImage(image, ...args) { events.push([image.src.split('/').at(-1), args[0]]); },
  createLinearGradient: () => ({ addColorStop() {} }) }, { get: (o, key) => o[key] ?? (() => {}) });

test('real native Mission world body draws background before structure and foreground after actors', () => {
  const previousImage = globalThis.Image; globalThis.Image = ReadyImage;
  try {
    const events = [], Engine = withForgeDecorationV141(NativeMission), engine = Object.create(Engine.prototype);
    Object.assign(engine, { editorMode: true, forgeProjectV141: project().data, forgeActiveRoomIdV141: 'room-1',
      camera: { x: 0, y: 0 }, walls: [], platforms: [], ladders: [], covers: [], hazards: [], vents: [], supplies: [],
      drops: [], doors: [], bullets: [], hostileProjectiles: [], particles: [], player: {},
      getVisibleEnemiesV65: () => [], getVisibleEnemyAtlasSheetsV65: () => [],
      drawFloors: () => events.push('structure'), drawActor: () => events.push('actor') });
    for (const method of ['drawMaintenancePipes', 'drawPowerNode', 'drawArchiveTerminal', 'drawVehicle',
      'drawWeaponPickup', 'drawToolPickup', 'drawObjective']) engine[method] = () => {};
    engine.drawWorld(drawingSink(events));
    assert.deepEqual(events, [['service-front-atlas.png', 47], 'structure', 'actor', ['ship-front-atlas.png', 536]]);
    assert.deepEqual(engine.forgeDecorationDrawsV141.background.cells, [engine.forgeProjectV141.rooms[0].cells.at(-2).id]);
  } finally { globalThis.Image = previousImage; }
});

test('authored Ship renders native traversal/actors, excludes campaign dressing, and uses the current room after travel', () => {
  const previousImage = globalThis.Image; globalThis.Image = ReadyImage;
  try {
    const events = [];
    class Campaign { drawWorld() { events.push('campaign-room'); } drawBackdrop() { events.push('campaign-backdrop'); }
      drawForegroundParallax() { events.push('campaign-foreground'); } drawHud() { events.push('campaign-hud'); } }
    const Engine = withForgeDecorationV141(Campaign), engine = new Engine();
    const document = project('ship').data;
    document.rooms.push({ ...structuredClone(document.rooms[0]), id: 'room-2', name: 'Soute distante',
      cells: [{ id: 'far-decor', x: 10, y: 12, type: 'terminal', layer: 'background',
        decoration: { assetId: 'workbench-side', opacity: 1, flipX: false, parallax: 0 } }] });
    Object.assign(engine, { editorPlaytest: true, forgeProjectV141: document, forgeActiveRoomIdV141: 'room-1',
      editorShipBoundsV141: { width: 5120, height: 720 }, player: { health: 100 }, enemies: [],
      v51Doors: [], projectiles: [], drawTraversal: () => events.push('structure'),
      drawPlayer: () => events.push('actor'), drawTraversalOcclusions: () => events.push('occlusion') });
    const ctx = drawingSink(events);
    engine.drawBackdrop(ctx); engine.drawWorld(ctx); engine.drawForegroundParallax(ctx); engine.drawHud(ctx);
    assert.deepEqual(events, [['service-front-atlas.png', 47], 'structure', 'actor', 'occlusion', ['ship-front-atlas.png', 536]]);
    events.length = 0; engine.forgeActiveRoomIdV141 = 'room-2'; engine.drawWorld(ctx);
    assert.deepEqual(events, [['furniture-atlas.png', 848], 'structure', 'actor', 'occlusion']);
    assert.equal(engine.forgeDecorationDrawsV141.background.roomId, 'room-2');
    events.length = 0; engine.forgeProjectV141 = null;
    engine.drawBackdrop(ctx); engine.drawWorld(ctx); engine.drawForegroundParallax(ctx); engine.drawHud(ctx);
    assert.deepEqual(events, ['campaign-backdrop', 'campaign-room', 'campaign-foreground', 'campaign-hud']);
  } finally { globalThis.Image = previousImage; }
});

test('only an active authored Mission suppresses reference rooms and automatic scenery', () => {
  const events = [];
  class Campaign {
    drawBackdrop() { events.push('reference-rooms'); }
    drawMaintenancePipes() { events.push('maintenance'); }
    drawCeilingCables() { events.push('ceiling'); }
    drawForegroundPipes() { events.push('pipes'); }
    drawForeground() { events.push('reference-foreground'); }
  }
  const Engine = withForgeDecorationV141(Campaign), engine = new Engine(), ctx = drawingSink(events);
  const draw = () => { for (const name of ['drawBackdrop', 'drawMaintenancePipes', 'drawCeilingCables', 'drawForegroundPipes', 'drawForeground']) engine[name](ctx); };
  engine.editorMode = true; engine.forgeProjectV141 = { kind: 'mission' };
  draw(); assert.deepEqual(events, []);
  engine.forgeProjectV141 = null;
  draw(); assert.deepEqual(events, ['reference-rooms', 'maintenance', 'ceiling', 'pipes', 'reference-foreground']);
  events.length = 0; engine.editorMode = false; engine.forgeProjectV141 = { kind: 'mission' };
  draw(); assert.deepEqual(events, ['reference-rooms', 'maintenance', 'ceiling', 'pipes', 'reference-foreground']);
});
