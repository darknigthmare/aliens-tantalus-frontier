import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { GameEngine } from '../src/game-production-runtime.js';
import { WEAPONS, ENEMIES, WORLDS, LEVEL_SEEDS } from '../src/content.js';
import { ARCHIVE_RELAY_CAMPAIGN_V122 as campaign } from '../src/archive-relay-state-v122.js';
import { ARCHIVE_RELAY_PROPS_V122, archiveRelayGeometryV122, buildArchiveRelayLevelV122 } from '../src/archive-relay-runtime-v122.js';
import { ARCHIVE_RELAY_ART_V160, loadArchiveRelayArtV160, archiveRelayPresentationLayoutV160,
  drawArchiveRelayEnvironmentV160, drawArchiveRelayGateV160, drawArchiveRelayInsertionShotV160,
  withArchiveRelayPresentationV160 } from '../src/archive-relay-presentation-v160.js';
import { hostV136 } from './forge-native-host-v136.mjs';

class HeaderImage {
  complete = false; naturalWidth = 0; naturalHeight = 0;
  set src(path) {
    this._src = path;
    const data = readFileSync(new URL('..' + path, import.meta.url));
    assert.equal(data.subarray(1, 4).toString(), 'PNG');
    this.naturalWidth = data.readUInt32BE(16); this.naturalHeight = data.readUInt32BE(20); this.complete = true;
    queueMicrotask(() => this.onload?.());
  }
  get src() { return this._src; }
}
function context() {
  const draws = [], fills = [], stack = []; let offset = { x: 0, y: 0 };
  const ctx = new Proxy({
    save() { stack.push({ ...offset }); }, restore() { assert.ok(stack.length); offset = stack.pop(); },
    translate(x, y) { offset.x += x; offset.y += y; },
    drawImage(image, sx, sy, sw, sh, x, y, w, h) { draws.push({ path: image.src,
      source: { x: sx, y: sy, w: sw, h: sh }, target: { x: x + offset.x, y: y + offset.y, w, h } }); },
    fillRect(x, y, w, h) { fills.push({ x: x + offset.x, y: y + offset.y, w, h, color: this.fillStyle }); },
    measureText(text) { return { width: String(text).length * 6 }; },
    createLinearGradient() { return { addColorStop() {} }; }, createRadialGradient() { return { addColorStop() {} }; }
  }, { get(object, key) { return key in object ? object[key] : () => {}; } });
  return { ctx, draws, fills, stack };
}
async function loaded() { const art = loadArchiveRelayArtV160(HeaderImage); await art.promise; assert.equal(art.ready, true); return art; }
const world = WORLDS.find(entry => entry.id === campaign.worldId);
async function native() {
  const browser = hostV136(); globalThis.Image = HeaderImage;
  const Engine = withArchiveRelayPresentationV160(GameEngine), engine = new Engine(browser.canvas);
  const level = buildArchiveRelayLevelV122({ campaign, world, levelSeeds: LEVEL_SEEDS, seed: 160 });
  engine.start({ campaign, world, missionLevel: level, levelSeed: level.levelSeed,
    weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [], seed: 160 });
  await engine.archiveRelayArtV160.promise;
  return engine;
}

test('all five presentation atlases exist with their admitted source dimensions and unchanged SHA', () => {
  assert.equal(Object.keys(ARCHIVE_RELAY_ART_V160).length, 5);
  for (const art of Object.values(ARCHIVE_RELAY_ART_V160)) {
    const data = readFileSync(new URL('..' + art.path, import.meta.url));
    assert.equal(createHash('sha256').update(data).digest('hex'), art.sha256);
    assert.equal(data.readUInt32BE(16), art.width); assert.equal(data.readUInt32BE(20), art.height);
  }
});

test('primary props rest on the actual upper gallery or floor and inherit each exact native interaction center', () => {
  const layout = archiveRelayPresentationLayoutV160(); assert.equal(layout.mixedProjectionAllowed, false);
  assert.equal(layout.projection, 'whole-room-2d'); assert.equal(layout.primary.length, 6);
  for (const prop of layout.primary) {
    const anchor = ARCHIVE_RELAY_PROPS_V122[prop.role];
    assert.equal(prop.x + prop.w / 2, anchor.x); assert.equal(prop.contactY, anchor.groundY);
    assert.equal(prop.plane, 'rear'); assert.equal(prop.collidable, false);
    assert.ok(prop.w < prop.source.w && prop.h < prop.source.h, 'No source prop is enlarged into a room.');
  }
  assert.equal(layout.primary.filter(item => item.contactY === 355).length, 2);
  assert.equal(layout.pdaScreen.y + layout.pdaScreen.h, layout.pdaScreen.contactY);
});

test('shared geometry preserves the pre-existing floor, gallery, ladder and full-height gate without adding colliders', async () => {
  const engine = await native(), geometry = archiveRelayGeometryV122();
  assert.deepEqual(engine.platforms.map(item => [item.x, item.y, item.w, item.h]), [[0, 570, 1800, 38], [350, 355, 750, 20]]);
  assert.deepEqual(engine.ladders.map(item => [item.x, item.top, item.bottom, item.w]), [[420, 355, 570, 50]]);
  assert.deepEqual(engine.doors.map(item => [item.x, item.y, item.w, item.h]), [[1390, 0, 50, 570]]);
  assert.deepEqual(engine.platforms, geometry.platforms); assert.deepEqual(engine.missionLevelBounds, geometry.missionLevelBounds);
  assert.equal(engine.covers.length, 0); assert.equal(engine.walls.length, 0); engine.stop();
});

test('every sampled source crop remains inside its admitted atlas and no wall tile is magnified', async () => {
  const art = await loaded(), { ctx, draws, stack } = context(); drawArchiveRelayEnvironmentV160(ctx, { art });
  assert.ok(draws.length > 15); assert.equal(stack.length, 0);
  for (const draw of draws) {
    const atlas = Object.values(ARCHIVE_RELAY_ART_V160).find(item => item.path === draw.path); assert.ok(atlas);
    assert.ok(draw.source.x >= 0 && draw.source.y >= 0 && draw.source.x + draw.source.w <= atlas.width && draw.source.y + draw.source.h <= atlas.height);
    assert.ok(draw.target.w <= draw.source.w && draw.target.h <= draw.source.h);
  }
});

test('actual production backdrop follows the same camera as the body and colliders, including the far return bay', async () => {
  const engine = await native(), first = context(), second = context();
  engine.camera.x = 0; engine.drawBackdrop(first.ctx); engine.camera.x = 520; engine.drawBackdrop(second.ctx);
  assert.equal(first.stack.length, 0); assert.equal(second.stack.length, 0);
  assert.equal(first.draws.length, second.draws.length);
  for (let index = 0; index < first.draws.length; index++) {
    assert.equal(first.draws[index].target.x - second.draws[index].target.x, 520);
    assert.equal(first.draws[index].target.y, second.draws[index].target.y);
    assert.deepEqual(first.draws[index].source, second.draws[index].source);
  }
  assert.equal(engine.getSnapshot().archiveRelayPresentationV160.ready, true);
  assert.equal(engine.getSnapshot().archiveRelayPresentationV160.canonicalArtCertified, false); engine.stop();
});

test('modular bulkhead opening tracks its real physical aperture instead of stretching a door bitmap', async () => {
  for (const progress of [0, .5, 1]) {
    const recording = context(), door = { ...archiveRelayGeometryV122().doors[0], progress };
    const rendered = drawArchiveRelayGateV160(recording.ctx, door);
    const leaves = recording.fills.filter(item => item.color === '#34443f'); assert.equal(leaves.length, 2);
    assert.equal(leaves.reduce((width, item) => width + item.w, 0), door.w * (1 - progress));
    assert.equal(rendered.x, door.x); assert.equal(rendered.h, door.h); assert.equal(recording.draws.length, 0);
    assert.equal(recording.stack.length, 0);
  }
  const engine = await native(), rendered = engine.getDoorRenderState(engine.doors[0]);
  assert.equal(rendered.visualMode, 'modular-mobile-bulkhead'); assert.equal(rendered.image, null);
  assert.deepEqual(rendered.physicalOpening, { x: 1390, y: 0, w: 50, h: 570 }); engine.stop();
});

test('insertion and native environment share the same crops, support geometry and entry camera without invented occupants', async () => {
  const art = await loaded(), environment = context(), shot = context();
  drawArchiveRelayEnvironmentV160(environment.ctx, { art });
  const result = drawArchiveRelayInsertionShotV160(shot.ctx, { art });
  assert.deepEqual(shot.draws, environment.draws); assert.deepEqual(result.geometry, archiveRelayGeometryV122());
  assert.equal(result.occupantsInvented, false); assert.equal(result.cameraX, 0); assert.equal(result.width, 1280);
  assert.equal(result.projection, 'whole-room-2d'); assert.equal(shot.stack.length, 0);
});

test('missing source art stays explicit and does not pause the mission or fabricate an admitted atlas', async () => {
  class MissingImage { complete = true; naturalWidth = 1; naturalHeight = 1; set src(_) {} }
  const art = loadArchiveRelayArtV160(MissingImage); await art.promise;
  assert.equal(art.ready, false); assert.equal(art.missing.length, 5);
  const recording = context(); drawArchiveRelayEnvironmentV160(recording.ctx, { art });
  assert.equal(recording.draws.length, 0); assert.equal(recording.stack.length, 0);
});

test('ordinary missions retain their native presentation and applying the wrapper twice is a no-op', () => {
  let called = 0;
  class Ordinary { start() { return 'started'; } isArchiveRelayV122() { return false; }
    drawBackdrop() { called++; } drawDoor() { called++; } getDoorRenderState() { return 'native'; } getSnapshot() { return { native: true }; } }
  const Wrapped = withArchiveRelayPresentationV160(Ordinary); assert.equal(withArchiveRelayPresentationV160(Wrapped), Wrapped);
  const engine = new Wrapped(); assert.equal(engine.start({ campaign: { id: 'ordinary' } }), 'started');
  engine.drawBackdrop({}); engine.drawDoor({}, {}); assert.equal(called, 2);
  assert.equal(engine.getDoorRenderState({}), 'native'); assert.deepEqual(engine.getSnapshot(), { native: true });
});
