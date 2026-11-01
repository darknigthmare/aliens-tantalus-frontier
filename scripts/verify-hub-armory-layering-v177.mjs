import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { withHubRoomDressingV134 } from '../src/hub-room-dressing-v134.js';
import { withHubRoomLifeV136 } from '../src/hub-room-life-v136.js';
import { withHubArmoryStorefrontV169 } from '../src/hub-armory-scene-v169.js';
import { drawArmoryStorefrontV169, getArmoryStorefrontPlanV169 } from '../src/hub-armory-storefront-v169.js';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const sameRect = (args, rect) => args.length === 4
  && args.every((value, index) => Math.abs(value - [rect.x, rect.y, rect.w, rect.h][index]) < 1e-8);
const image = () => ({ complete: true, naturalWidth: 1448, naturalHeight: 1086 });
function canvas() {
  const calls = [], stack = [];
  const target = { calls, canvas: { width: 1280, height: 720 }, fillStyle: '#000', globalAlpha: 1,
    save() { stack.push({ fillStyle: this.fillStyle, globalAlpha: this.globalAlpha }); },
    restore() { assert.ok(stack.length, 'Canvas restore has a matching save'); Object.assign(this, stack.pop()); },
    drawImage(asset, ...args) { calls.push({ kind: 'image', asset, args }); },
    fillRect(...args) { calls.push({ kind: 'fill', fill: this.fillStyle, args }); },
    fillText(...args) { calls.push({ kind: 'text', args }); },
    measureText(text) { return { width: String(text).length * 5 }; },
    createLinearGradient() { return { addColorStop() {} }; },
    balanced() { assert.equal(stack.length, 0); }
  };
  return new Proxy(target, { get(object, key) { return key in object ? object[key] : () => {}; } });
}

// The adapter supplies only the lower native wall and final NPC hook. The
// production RoomDressing and RoomLife mixins run their actual plans/painters,
// including the V165 code plate and V168 I09 that the shop wall used to cover.
class NativeWallAdapter {
  constructor(room) {
    this.room = room; this.editorPlaytest = false; this.reducedMotion = true;
    this.hubLifeImagesV136 = new Map(); this.propImages = new Map();
    this.armoryStorefrontImagesV169 = new Map(['tantalus', 'station', 'colony'].map(key => [key, image()]));
    this.nativeReturn = { owner: 'native-room' };
    const deck = HUB_DECKS.findIndex(value => value.rooms.includes(room));
    const geometry = deck < 0 ? room : buildHubTraversalGeometryV87(deck);
    this.v51Ladders = geometry.ladders || []; this.v51Vents = geometry.vents || [];
    this.v51Platforms = geometry.platforms || [];
    this.doorStates = deck < 0 ? [] : buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck);
  }
  drawRoomModule(ctx) { ctx.calls.push({ kind: 'native-wall' }); return this.nativeReturn; }
  drawAnnexGeometryV71(ctx) { ctx.calls.push({ kind: 'native-annex-wall' }); return this.nativeReturn; }
  drawAnnexNpcsV141(ctx) { ctx.calls.push({ kind: 'native-npcs' }); return this.nativeReturn; }
  currentAnnexV71() { return this.room.world ? this.room : null; }
}
const IntegratedHub = withHubArmoryStorefrontV169(withHubRoomLifeV136(withHubRoomDressingV134(NativeWallAdapter)));
const armory = HUB_DECKS.flatMap(deck => deck.rooms).find(room => room.id === 'armory');
const logistics = getHubAnnexRuntimeGeometryV139(HUB_ANNEXES_V137.find(room => room.id === 'logistics'));

function shopCalls(ctx, asset, plan) {
  return ctx.calls.flatMap((call, index) => {
    if (call.kind !== 'image' || call.asset !== asset) return [];
    const entry = plan.assets.find(item => sameRect(call.args.slice(0, 4), item.src));
    assert.ok(entry, 'Every shop draw uses an actual authored atlas crop');
    return [{ ...entry, index, args: call.args }];
  });
}

function assertNativeComposition(room, draw) {
  const hub = new IntegratedHub(room), ctx = canvas(), before = JSON.stringify(room);
  const plan = getArmoryStorefrontPlanV169(room.id), asset = hub.armoryStorefrontImagesV169.get(plan.variant);
  assert.equal(draw(hub, ctx), hub.nativeReturn);
  const report = hub.hubRoomLifeRenderedV136.get(room.id);
  const service = report.serviceDetailsV165.items.find(item => item.id === room.id + '-wall-service-v165');
  assert.ok(service, 'The real RoomLife service assembly is admitted');
  const b = service.bounds, plate = { x: b.x + 7, y: b.y + b.h - 7, w: Math.min(47, b.w - 14), h: 6 };
  const plateIndex = ctx.calls.findIndex(call => call.kind === 'fill' && call.fill === '#b1b6a3' && sameRect(call.args, plate));
  assert.ok(plateIndex >= 0, 'The actual V165 painter emits the code plate, not a test marker');
  const painted = shopCalls(ctx, asset, plan), rearWall = painted.filter(item => item.layer === 'architecture');
  assert.equal(rearWall.length, plan.assets.filter(item => item.layer === 'architecture').length);
  assert.ok(rearWall.every(item => item.index < plateIndex), 'Shop architecture precedes the actual native service plate');
  assert.ok(painted.filter(item => item.layer !== 'architecture').every(item => item.index > plateIndex),
    'Only real shop props and facades follow dressing');
  assert.equal(painted.length, plan.assets.length, 'Each authored shop piece is drawn exactly once');
  for (const item of painted) assert.ok(sameRect(item.args.slice(4), { ...item.dest, x: item.dest.x + (room.xStart || 0) }));
  assert.equal(hub.armoryStorefrontPaintV169.drawn, plan.assets.length);
  assert.equal(hub.armoryStorefrontPaintV169.architectureDrawn, rearWall.length);
  assert.equal(hub.armoryStorefrontArchitecturePaintV177.size, 0, 'A later frame cannot reuse an old background count');
  assert.equal(JSON.stringify(room), before); ctx.balanced();
  return { hub, ctx, report, painted, plateIndex, asset, plan };
}

test('production composition puts RoomLife inside the final armory owner', () => {
  const list = app.match(/const NativeHubGame = \[([\s\S]*?)\]\.reduce/)[1];
  assert.ok(list.indexOf('withHubRoomDressingV134') < list.indexOf('withHubRoomLifeV136'));
  assert.match(app, /const HubGame = withHubArmoryStorefrontV169\([\s\S]*?NativeHubGame\)\)\)\)/);
});

test('layer selection composes each original atlas crop once and keeps the default standalone API', () => {
  for (const roomId of ['armory', 'logistics', 'port-meridien-quay']) {
    const plan = getArmoryStorefrontPlanV169(roomId), asset = image(), normal = canvas(), split = canvas();
    drawArmoryStorefrontV169(normal, asset, plan);
    drawArmoryStorefrontV169(normal, asset, plan, { phase: 'front' });
    const first = drawArmoryStorefrontV169(split, asset, plan, { layers: ['architecture'] });
    assert.equal(first.drawn, plan.assets.filter(item => item.layer === 'architecture').length);
    drawArmoryStorefrontV169(split, asset, plan, { excludeLayers: ['architecture'] });
    drawArmoryStorefrontV169(split, asset, plan, { phase: 'front', excludeLayers: ['architecture'] });
    assert.deepEqual(shopCalls(split, asset, plan).map(item => item.id).sort(), shopCalls(normal, asset, plan).map(item => item.id).sort());
    normal.balanced(); split.balanced();
  }
});

test('native armory paints its original rear wall before the real service code plate and V168 test isolator', () => {
  const { ctx, report, painted } = assertNativeComposition(armory, (hub, c) => hub.drawRoomModule(c, armory));
  const isolator = report.batchDetailsV168.painted.find(item => item.id === 'T168-I09');
  assert.ok(isolator, 'The actual V168 painter still admits I09');
  const panelIndex = ctx.calls.findIndex(call => call.kind === 'fill' && sameRect(call.args, isolator.bounds));
  assert.ok(panelIndex >= 0 && painted.filter(item => item.layer === 'architecture').every(item => item.index < panelIndex));
});

test('native logistics draws architecture before service plates and the shop facade before its actual NPC phase', () => {
  const result = assertNativeComposition(logistics, (hub, ctx) => {
    hub.drawAnnexGeometryV71(ctx, logistics);
    return hub.drawAnnexNpcsV141(ctx);
  });
  const index = result.ctx.calls.findIndex(call => call.kind === 'native-npcs');
  assert.ok(result.painted.every(item => item.index < index));
});

test('loading and editor guards preserve native drawing without stale shop counts or a late background', () => {
  const hub = new IntegratedHub(armory), first = canvas();
  hub.drawRoomModule(first, armory); first.balanced();
  for (const picture of hub.armoryStorefrontImagesV169.values()) picture.complete = false;
  const loading = canvas(); hub.drawRoomModule(loading, armory); loading.balanced();
  assert.equal(loading.calls.some(call => call.kind === 'image'), false);
  assert.equal(hub.armoryStorefrontPaintV169.drawn, 0);
  assert.equal(hub.armoryStorefrontPaintV169.reason, 'unavailable-or-unverified-atlas');
  assert.ok(hub.hubRoomLifeRenderedV136.get('armory').serviceDetailsV165.paintedIds.includes('armory-wall-service-v165'));
  for (const room of [armory, logistics]) {
    const editorHub = new IntegratedHub(room), ctx = canvas(); editorHub.editorPlaytest = true;
    if (room.world) { editorHub.drawAnnexGeometryV71(ctx, room); editorHub.drawAnnexNpcsV141(ctx); }
    else editorHub.drawRoomModule(ctx, room);
    assert.equal(ctx.calls.some(call => call.kind === 'image' || call.kind === 'fill'), false);
    assert.equal(editorHub.armoryStorefrontArchitecturePaintV177, undefined); ctx.balanced();
  }
});
