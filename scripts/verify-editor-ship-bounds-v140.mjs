import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HubGame as NativeHub } from '../src/hub-opening-v88.js';
import { compileShipProject, HUB_WORLD } from '../src/hub-v51-runtime.js';
import { withHubTrainingV132 } from '../src/hub-training-v132.js';
import { withHubAuthoredCompositionV133 } from '../src/hub-authored-composition-v133.js';
import { withHubRoomParallaxV134 } from '../src/hub-room-parallax-v134.js';
import { withHubSpatialDesignV136 } from '../src/hub-spatial-design-v136.js';
import { withHubRoomDressingV134 } from '../src/hub-room-dressing-v134.js';
import { withHubRoomLifeV136 } from '../src/hub-room-life-v136.js';
import { withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { withHubCirculationV137 } from '../src/hub-circulation-v137.js';
import { withHubRoomIdentityV137 } from '../src/hub-room-identity-v137.js';
import { withHubDestinationSignsV138 } from '../src/hub-destination-signage-runtime-v138.js';

// This is the same production hub stack used by app.js, with browser APIs only
// substituted. Start, entity creation, collision, gravity and first update run.
const ProductionHub = [withHubTrainingV132, withHubAuthoredCompositionV133, withHubRoomParallaxV134,
  withHubSpatialDesignV136, withHubRoomDressingV134, withHubRoomLifeV136, withHubNpcLifeV136,
  withHubCirculationV137, withHubRoomIdentityV137, withHubDestinationSignsV138]
  .reduce((Base, decorate) => decorate(Base), NativeHub);
const tile = (col, row, type, extra = {}) => ({ position: `${col}:${row}`, type, ...extra });
const project = (tiles, size = [128, 72]) => ({ schema: 2, kind: 'ship', size, tiles });
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} differs from ${b}`);
const rectangles = ['floors', 'platforms', 'walls', 'doors', 'vents', 'objectives', 'enemies', 'terminals', 'hazards'];
function inside(bounds, margin = 0) {
  assert.ok(['x', 'y', 'w', 'h'].every(key => Number.isFinite(bounds[key])), JSON.stringify(bounds));
  assert.ok(bounds.x >= margin - 1e-8 && bounds.y >= -1e-8, JSON.stringify(bounds));
  assert.ok(bounds.x + bounds.w <= HUB_WORLD.width - margin + 1e-8 && bounds.y + bounds.h <= 720 + 1e-8, JSON.stringify(bounds));
}
function allBounds(compiled) {
  for (const field of rectangles) for (const bounds of compiled[field]) inside(bounds, field === 'enemies' ? 10 : 0);
  if (compiled.spawn) inside({ ...compiled.spawn, w: 44, h: 92 }, 24);
  for (const link of [...compiled.ladders, ...compiled.lifts]) {
    assert.ok([link.x, link.top, link.bottom, link.w].every(Number.isFinite));
    assert.ok(link.x - link.w / 2 >= -1e-8 && link.x + link.w / 2 <= HUB_WORLD.width + 1e-8);
    assert.ok(link.top >= 0 && link.bottom <= 720 && link.bottom > link.top);
  }
}
function host() {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget { complete = false; naturalWidth = 0; naturalHeight = 0; };
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ measureText: text => ({ width: String(text).length * 7 }),
    createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) },
  { get: (target, key) => key in target ? target[key] : () => {} });
  return Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
}

test('maximum ship grid contains the full spawn, door, enemy and bottom platform without shrinking their physical sizes', () => {
  const compiled = compileShipProject(project([tile(0, 0, 'spawn'), tile(0, 0, 'door'),
    tile(0, 0, 'enemy'), tile(127, 71, 'enemy', { enemyType: 'synthetic' }), tile(127, 71, 'platform')]));
  assert.deepEqual(compiled.spawn, { x: 24, y: 0 });
  assert.equal(compiled.doors[0].y, 0); assert.equal(compiled.doors[0].h, 116);
  assert.deepEqual(compiled.enemies.map(enemy => [enemy.x, enemy.y, enemy.w, enemy.h]), [[10, 0, 52, 76], [5068, 632, 42, 88]]);
  assert.deepEqual([compiled.platforms[0].y, compiled.platforms[0].h], [706, 14]);
  allBounds(compiled);
});

test('every supported integer ship size preserves complete physical rectangles and centered traversal links at all four corners', () => {
  const types = ['floor', 'platform', 'wall', 'door', 'vent', 'ladder', 'lift', 'objective', 'terminal', 'hazard'];
  let checked = 0;
  // The compiler retains its legacy 4-cell minimum; the current editor starts
  // at 8. Verify both contracts, including every odd/intermediate grid size.
  for (let cols = 4; cols <= 128; cols++) for (let rows = 4; rows <= 72; rows++) {
    const corners = [[0, 0], [cols - 1, 0], [0, rows - 1], [cols - 1, rows - 1]];
    const tiles = corners.flatMap(([x, y]) => [...types.map(type => tile(x, y, type)),
      ...['xenomorph', 'synthetic', 'pathogen'].map(enemyType => tile(x, y, 'enemy', { enemyType }))]);
    const compiled = compileShipProject(project([...tiles, tile(cols - 1, rows - 1, 'spawn')], [cols, rows]));
    allBounds(compiled);
    for (const enemy of compiled.enemies) assert.deepEqual([enemy.w, enemy.h],
      enemy.kind === 'synthetic' ? [42, 88] : enemy.kind === 'pathogen' ? [50, 72] : [52, 76]);
    assert.equal(compiled.floors.length, 4); assert.equal(compiled.platforms.length, 4);
    for (const floor of compiled.floors) { near(floor.w, HUB_WORLD.width / cols); near(floor.h, 720 / rows); }
    checked++;
  }
  assert.equal(checked, 8625);
});

test('all corner spawn markers and implicit floor spawns respect the native 24px player margin', () => {
  for (const size of [[4, 4], [8, 8], [32, 18], [64, 36], [127, 71], [128, 72]]) {
    const [cols, rows] = size;
    for (const [x, y] of [[0, 0], [cols - 1, 0], [0, rows - 1], [cols - 1, rows - 1]]) {
      for (const type of ['spawn', 'floor']) {
        const compiled = compileShipProject(project([tile(x, y, type)], size));
        assert.ok(compiled.spawn); allBounds(compiled);
      }
    }
  }
  assert.equal(compileShipProject(project([])).spawn, null);
});

test('invalid coordinate arrays and strings never produce NaN geometry or consume valid entity IDs', () => {
  const invalid = [[NaN, 1], [1, Infinity], [-Infinity, 1], [undefined, 0], [null, 0], [true, 0],
    [Symbol('coordinate'), 1], [0], [], Array(2), [, 1], [{}, 0], ['', '1'], [[], 1],
    'NaN:0', '0:Infinity', ':', ' :1', '0:1:2', '-1:0', '128:0', '0:72', null, undefined, {}];
  const tiles = invalid.flatMap(position => ['spawn', 'wall', 'door', 'enemy', 'ladder'].map(type => ({ position, type })));
  tiles.push({ position: ['2', '3'], type: 'DOOR' }, { position: [3.8, 4.9], type: 'enemy' }, tile(4, 5, 'spawn'));
  const compiled = compileShipProject(project(tiles));
  assert.equal(compiled.walls.length, 0); assert.equal(compiled.ladders.length, 0);
  assert.equal(compiled.doors.length, 1); assert.equal(compiled.doors[0].id, 'editor-door-1');
  assert.equal(compiled.enemies.length, 1); assert.equal(compiled.enemies[0].id, 'editor-enemy-1');
  assert.deepEqual(compiled.spawn, { x: 158, y: 0 }); allBounds(compiled);
});

test('invalid project shapes return null and malformed dimensions fall back to a finite legacy grid', () => {
  for (const value of [null, undefined, {}, { kind: 'mission', tiles: [] }, { kind: 'ship', tiles: null }]) assert.equal(compileShipProject(value), null);
  for (const size of [undefined, null, [], [NaN, Infinity], [{}, Symbol('size')], ['', false], [0, 0]]) {
    const compiled = compileShipProject({ ...project([tile(0, 0, 'spawn')]), size });
    assert.equal(compiled.grid.cols, 32); assert.equal(compiled.grid.rows, 18); allBounds(compiled);
  }
  const limited = compileShipProject(project([tile(0, 0, 'spawn')], [-10, 1e10]));
  assert.equal(limited.grid.cols, 4); assert.equal(limited.grid.rows, 72); allBounds(limited);
});

test('interior authored positions, sizes, metadata and route counts remain unchanged', () => {
  const compiled = compileShipProject(project(['floor', 'platform', 'wall', 'door', 'vent', 'ladder', 'lift', 'spawn',
    'objective', 'enemy', 'terminal', 'hazard'].map(type => tile(10, 8, type)), [32, 18]));
  assert.deepEqual(compiled.spawn, { x: 1658, y: 268 });
  assert.deepEqual(compiled.floors, [{ x: 1600, y: 320, w: 160, h: 40, type: 'floor', tile: '10:8' }]);
  assert.deepEqual(compiled.platforms, [{ x: 1600, y: 320, w: 160, h: 14, type: 'platform', tile: '10:8', art: 'catwalk' }]);
  assert.deepEqual(compiled.doors[0], { id: 'editor-door-1', x: 1646, y: 244, w: 68, h: 116, open: false, progress: 0 });
  assert.deepEqual(compiled.enemies[0], { id: 'editor-enemy-1', kind: 'xenomorph', x: 1654, y: 284, w: 52, h: 76 });
  assert.deepEqual(compiled.ladders, [{ x: 1680, top: 320, bottom: 360, w: 54, type: 'ladder' }]);
  assert.deepEqual(compiled.lifts, [{ x: 1680, top: 320, bottom: 360, w: 82, type: 'lift' }]);
  assert.equal(compiled.route.nodeCount, 4); assert.equal(compiled.route.verticalLinks, 2);
  assert.equal(compiled.route.doorCount, 1); assert.equal(compiled.route.objectiveCount, 1); assert.equal(compiled.route.hazardCount, 1);
  allBounds(compiled);
});

test('compilation is pure, deterministic and returns independently owned geometry for a frozen authored project', () => {
  const authored = project([tile(0, 0, 'spawn'), tile(127, 71, 'platform'),
    { position: Object.freeze([127, 0]), type: 'enemy', variant: 'pathogen' }]);
  authored.tiles.forEach(Object.freeze); Object.freeze(authored.tiles); Object.freeze(authored.size); Object.freeze(authored);
  const before = structuredClone(authored), a = compileShipProject(authored), b = compileShipProject(authored);
  assert.deepEqual(a, b); assert.deepEqual(authored, before);
  a.spawn.x = -999; a.enemies[0].w = 1; a.platforms[0].y = -999;
  assert.deepEqual(compileShipProject(authored), b); assert.deepEqual(authored, before);
});

test('the real production hub starts and performs its first update at the same compiled X for every corner and representative grid size', t => {
  const hub = new ProductionHub(host()); t.after(() => hub.stop());
  for (const size of [[4, 4], [8, 8], [32, 18], [64, 36], [127, 71], [128, 72], [128, 8], [8, 72]]) {
    const [cols, rows] = size;
    for (const [col, row] of [[0, 0], [cols - 1, 0], [0, rows - 1], [cols - 1, rows - 1]]) {
      const authored = project([tile(col, row, 'spawn'), tile(col === 0 ? cols - 1 : 0, row, 'enemy')], size);
      const compiled = compileShipProject(authored);
      hub.start({}, { editorProject: authored });
      assert.equal(hub.editorPlaytest, true); assert.equal(hub.player.w, 44); assert.equal(hub.player.h, 92);
      assert.equal(hub.player.x, compiled.spawn.x); assert.equal(hub.player.y, compiled.spawn.y);
      const enemyX = hub.enemies[0].x;
      assert.equal(enemyX, compiled.enemies[0].x); inside(hub.player, 24); inside(hub.enemies[0], 10);
      hub.update(1 / 60);
      assert.equal(hub.player.x, compiled.spawn.x, `First update displaced the ${size} spawn at ${col}:${row}`);
      assert.equal(hub.enemies[0].x, enemyX, 'A distant enemy must not jump into its movement clamp on its first update');
      inside(hub.player, 24); inside(hub.enemies[0], 10);
      hub.stop();
    }
  }
});

test('edge enemies entering actual pursuit move only by physical speed on their first production update', t => {
  const hub = new ProductionHub(host()); t.after(() => hub.stop());
  for (const enemyType of ['xenomorph', 'synthetic', 'pathogen']) for (const side of ['left', 'right']) {
    const authored = project([tile(side === 'left' ? 4 : 123, 25, 'spawn'),
      tile(side === 'left' ? 0 : 127, 25, 'enemy', { enemyType })]);
    hub.start({}, { editorProject: authored });
    const enemy = hub.enemies[0], before = enemy.x;
    assert.ok(Math.abs(hub.player.x - before) > 54 && Math.abs(hub.player.x - before) < 560);
    hub.update(1 / 60);
    const displacement = enemy.x - before;
    assert.ok(side === 'left' ? displacement > 0 : displacement < 0);
    assert.ok(Math.abs(displacement) <= enemy.speed / 60 + 1e-8, 'Entering the enemy clamp cannot create a 16px positional jump.');
    inside(enemy, 10); hub.stop();
  }
});

test('schema-3 ships compile the validated active room and ignore forged preview tiles, dimensions and decorative cells', t => {
  const cell = (id, x, y, type, layer = 'gameplay') => ({ id, x, y, type, layer });
  const authored = { schema: 3, kind: 'ship', name: 'Bounds schema 3', activeRoomId: 'active-room', links: [],
    rooms: [{ id: 'other-room', name: 'Inactive', size: [32, 18], cells: [cell('other-spawn', 15, 10, 'spawn')] },
      { id: 'active-room', name: 'Active', size: [128, 72], cells: [cell('active-spawn', 0, 0, 'spawn'),
        cell('edge-platform', 127, 71, 'platform', 'structure'), cell('edge-door', 127, 0, 'door'),
        cell('edge-enemy', 126, 71, 'enemy'), cell('decoration', 20, 20, 'enemy', 'background')] }],
    size: [8, 8], tiles: [tile(7, 7, 'spawn'), tile(2, 2, 'hazard')], validation: { errors: [] } };
  const before = structuredClone(authored), compiled = compileShipProject(authored);
  assert.deepEqual([compiled.grid.cols, compiled.grid.rows], [128, 72]);
  assert.deepEqual(compiled.spawn, { x: 24, y: 0 });
  assert.equal(compiled.platforms[0].x, 5080); assert.equal(compiled.platforms[0].y, 706);
  assert.equal(compiled.doors.length, 1); assert.equal(compiled.doors[0].y, 0);
  assert.equal(compiled.enemies.length, 1); assert.equal(compiled.hazards.length, 0); allBounds(compiled);
  assert.deepEqual(authored, before);
  const withoutPreview = structuredClone(authored); delete withoutPreview.tiles; delete withoutPreview.size;
  assert.deepEqual(compileShipProject(withoutPreview), compiled);
  const hub = new ProductionHub(host()); t.after(() => hub.stop());
  hub.start({}, { editorProject: withoutPreview });
  assert.equal(hub.editorPlaytest, true); assert.equal(hub.player.x, 24); assert.equal(hub.player.y, 0);
  hub.update(1 / 60); assert.equal(hub.player.x, 24); inside(hub.player, 24);
  for (const change of [raw => raw.activeRoomId = 'missing-room', raw => raw.rooms[1].cells[0].x = Infinity,
    raw => raw.rooms[1].cells[0].y = 72, raw => raw.links.push({ id: 'invalid-link', from: {}, to: {} })]) {
    const malformed = structuredClone(authored); change(malformed);
    assert.throws(() => compileShipProject(malformed)); assert.deepEqual(authored, before);
  }
});
