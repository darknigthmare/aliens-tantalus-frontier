import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { HUB_DECKS, HUB_MODULAR_PROP_FILES, HubGame } from '../src/hub-game.js';
import { HUB_CONSOLE_STATIONS_V142, getHubConsoleStationCellV142 } from '../src/hub-console-stations-v142.js';
import { HUB_ANNEX_STATION_ATLAS_V139 } from '../src/hub-annex-station-atlas-v139.js';
import { getHubNativePropPlacementV139, getHubInteractionPropBoundsV136,
  getHubStationInteractionBoundsV136 } from '../src/hub-prop-placements-v136.js';
import { getHubRoomLifePlanV136 } from '../src/hub-room-life-v136.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { HUB_WORLD } from '../src/hub-game.js';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { drawHubFurnishingMountsV137 } from '../src/hub-room-furnishing-v137.js';
import { getHubFurnishingPlacementBoundsV139 } from '../src/hub-furnishing-contact-v139.js';

const rooms = HUB_DECKS.flatMap(deck => deck.rooms);
const near = (a, b) => assert.ok(Math.abs(a-b) < 1e-8, `${a} differs from ${b}`);
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const ids = Object.keys(HUB_CONSOLE_STATIONS_V142);
const optionsFor = room => {
  const deck = HUB_DECKS.findIndex(deck => deck.rooms.includes(room));
  const geometry = buildHubTraversalGeometryV87(deck);
  return { ...geometry, doors: buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck) };
};

test('the four main-deck consoles use unchanged admitted frontal crops with real hard feet', () => {
  assert.deepEqual(ids.sort(), ['bridge','combat-information','science-lab','sensor-array']);
  const png = auditWeaponPngV120(fileURLToPath(new URL(`..${HUB_ANNEX_STATION_ATLAS_V139.asset}`, import.meta.url)));
  assert.equal(png.sha256, HUB_ANNEX_STATION_ATLAS_V139.sha256);
  assert.equal(png.pixelEdits, false);
  assert.ok(HUB_MODULAR_PROP_FILES.includes(HUB_ANNEX_STATION_ATLAS_V139.asset), 'The native main-deck image cache must preload the frontal station atlas.');
  for (const id of ids) {
    const cell = getHubConsoleStationCellV142(id), room = rooms.find(room => room.id === id), p = room.propPlacementV139;
    assert.equal(cell.projection, 'strict-side-elevation');
    assert.equal(p.artProjection, 'strict-side-elevation'); assert.equal(p.view, 'strict-side');
    assert.equal(p.asset, HUB_ANNEX_STATION_ATLAS_V139.asset); assert.deepEqual(p.source, cell.source);
    assert.equal(p.sourceCellIdV142, HUB_CONSOLE_STATIONS_V142[id].cellId);
    const foot = cell.source.y + cell.footSourceY;
    assert.ok(Array.from({length:cell.source.w}, (_,x) => png.pixelAlpha(cell.source.x+x, foot-1)).some(alpha => alpha >= 192), id);
    for (let y=foot; y<cell.source.y+cell.source.h; y++) for (let x=cell.source.x; x<cell.source.x+cell.source.w; x++)
      assert.ok(png.pixelAlpha(x,y) < 192, `${id}: opaque pixels below the physical foot`);
    near(p.renderBounds.y + cell.footSourceY*p.sizing.scale, 624);
  }
});

test('visible floor contact, 40px operating strip, physical top and access come from one native placement', () => {
  for (const id of ids) {
    const room = rooms.find(room => room.id === id), p = room.propPlacementV139;
    near(p.renderBounds.w/p.source.w, p.renderBounds.h/p.source.h);
    near(p.opaqueFoot.y,624); near(p.footprint.supportY,624); near(p.tableHeight,40);
    assert.equal(p.stationSupportV142, 'opaque-foot-on-native-floor');
    assert.deepEqual(room.propRenderBounds,p.renderBounds);
    assert.deepEqual(getHubInteractionPropBoundsV136(room),p.renderBounds);
    assert.deepEqual(getHubStationInteractionBoundsV136(room),p.interactionBounds);
    assert.deepEqual(p.usefulSurface.occupied,[p.usefulSurface.bounds], `${id}: control buttons are not an empty shelf`);
    for (const collider of p.colliders) {
      near(collider.y,p.usefulSurface.supportY); near(collider.y+collider.h,624);
      assert.equal(collider.physicalPlane,'rear'); assert.equal(collider.collisionMode,'one-way-top');
    }
  }
});

test('native rendering samples the complete frontal cabinet at the exact physical target', () => {
  const image = {complete:true,naturalWidth:HUB_ANNEX_STATION_ATLAS_V139.width,naturalHeight:HUB_ANNEX_STATION_ATLAS_V139.height};
  for (const id of ids) {
    const room = rooms.find(room => room.id === id), p = room.propPlacementV139, calls=[];
    const ctx = new Proxy({drawImage(...args){calls.push(args);},fillRect(){}}, {get:(target,key) => key in target ? target[key] : ()=>{}});
    HubGame.prototype.drawInteractionProp.call({propImages:new Map([[p.asset,image]]),nearestInteraction:()=>null,animationTime:0},ctx,room);
    assert.equal(calls.length,1,id);
    const [drawn,sx,sy,sw,sh,x,y,w,h] = calls[0]; assert.equal(drawn,image);
    assert.deepEqual({x:sx,y:sy,w:sw,h:sh},p.source); assert.deepEqual({x,y,w,h},p.renderBounds);
  }
});

test('reference objects sit on their separate counters and never cover the new operating strips', () => {
  const hosts = {bridge:'bridge-watch-reference-counter','combat-information':'tactical-watch-reference-counter','sensor-array':'array-calibration-counter'};
  for (const [id,host] of Object.entries(hosts)) {
    const room = rooms.find(room => room.id === id), plan = getHubRoomLifePlanV136(room,optionsFor(room));
    assert.deepEqual(plan.furnishingV137.rejected,[],id); assert.deepEqual(plan.workstationDetailsV139.omitted,[],id);
    const detail = plan.workstationDetailsV139.items.find(item => item.hostRole === host); assert.ok(detail, `${id}: reference item lacks its real worktop`);
    near(detail.contactY,detail.supportY); assert.equal(detail.hostType,'furnishing');
    assert.ok(!overlap(detail.target,room.propPlacementV139.usefulSurface.bounds),id);
    const counter = plan.items.find(item => item.role === host); assert.ok(counter); near(counter.y+counter.h,624);
  }
});

test('main console measurements translate once with the room and unknown stations retain their existing policy', () => {
  for (const id of ids) {
    const base = getHubNativePropPlacementV139({id,asset:'legacy-native.png',sourceSize:{width:239,height:157},xStart:0});
    const translated = getHubNativePropPlacementV139({id,asset:'legacy-native.png',sourceSize:{width:239,height:157},xStart:10000});
    near(translated.renderBounds.x-base.renderBounds.x,10000); near(translated.renderBounds.y,base.renderBounds.y);
    near(translated.interactionBounds.x-base.interactionBounds.x,10000);
  }
  assert.equal(getHubConsoleStationCellV142('maintenance-spine'),null);
  assert.equal(getHubConsoleStationCellV142('constructor'),null);
  const legacy = getHubNativePropPlacementV139({id:'bridge',asset:'legacy-native.png',sourceSize:{width:239,height:157},artCell:null});
  assert.equal(legacy.asset,'legacy-native.png'); assert.equal(legacy.stationSupportV142,undefined);
});

test('the cockpit instrument panel reserves and paints a complete straight pedestal down to its native floor', () => {
  const room = HUB_ANNEXES_V137.find(room => room.id === 'flight-control-cockpit');
  const original = structuredClone(room);
  const plan = getHubRoomLifePlanV136(room, {platforms:room.platforms,ladders:room.ladders,doors:[]});
  assert.deepEqual(plan.furnishingV137.rejected,[]);
  const panel = plan.items.find(item => item.role === 'pilot-forward-instrument-console');
  assert.ok(panel?.consoleSupportV142); assert.equal(panel.mountKindV142,'floor-pedestal-console');
  near(panel.consoleSupportV142.footY,624); near(panel.consoleSupportV142.panelBottomY,panel.y+panel.h);
  assert.equal(panel.consoleSupportV142.projection,'strict-side-elevation');
  const reservation = getHubFurnishingPlacementBoundsV139(panel);
  near(reservation.y+reservation.h,624); assert.ok(reservation.h > panel.h);
  const rects=[];
  const ctx = new Proxy({fillRect(...args){rects.push(args);}}, {get:(target,key) => key in target ? target[key] : ()=>{}});
  drawHubFurnishingMountsV137(ctx,{...plan,items:[panel],furnishingV137:{...plan.furnishingV137,links:[]}});
  assert.ok(rects.some(([x,y,w,h]) => Math.abs(y+h-624)<1e-8 && x<=panel.x+panel.w/2 && x+w>=panel.x+panel.w/2), 'The painted pedestal needs an actual floor contact under its panel.');
  assert.deepEqual(room,original,'The native pilot seat, station interaction and authored compartment stay canonical.');
});
