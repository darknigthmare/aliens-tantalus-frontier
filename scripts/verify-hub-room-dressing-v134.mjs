import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { REFUGE_PROPS_LAYOUT_V87 } from '../src/refuge-art-v87.js';
import { getHubSpatialPlanV136 } from '../src/hub-spatial-design-v136.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { HUB_ROOM_DRESSING_V134, resolveHubRoomDressingV134, drawHubRoomDressingV134, drawHubRoomPlaqueV134, getHubRoomPlaqueBoundsV134,
  withHubRoomDressingV134 } from '../src/hub-room-dressing-v134.js';

const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const rooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V87];
function renderer() {
  const calls = [], ctx = new Proxy({
    save(){calls.push(['save']);}, restore(){calls.push(['restore']);},
    fillRect(...bounds){calls.push(['fill', ...bounds]);}, rect(...bounds){calls.push(['clip', ...bounds]);},
    fillText(...args){calls.push(['text', ...args]);}, drawImage(...args){calls.push(['image', ...args]);},
    translate(...args){calls.push(['translate', ...args]);}
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  return { ctx, calls, balanced() {assert.equal(calls.filter(call => call[0] === 'save').length,calls.filter(call => call[0] === 'restore').length);} };
}
const optionsFor = room => {
  const deck = HUB_DECKS.findIndex(entry => entry.rooms.includes(room));
  return deck < 0 ? { ladders: room.ladders } : { doors: buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck), ladders: buildHubTraversalGeometryV87(deck).ladders };
};

test('all production rooms receive task-specific passive equipment, while their native walking geometry stays unchanged', () => {
  assert.deepEqual(Object.keys(HUB_ROOM_DRESSING_V134).sort(),rooms.map(room => room.id).sort());
  assert.equal(new Set(Object.values(HUB_ROOM_DRESSING_V134).map(entry => entry.purpose)).size,29);
  for (const room of rooms) {
    const before = structuredClone(room), composition = resolveHubRoomDressingV134(room,optionsFor(room));
    assert.ok(composition.items.length >= 4, `${room.id} has too little usable equipment`);
    assert.ok(new Set(composition.items.map(entry => entry.role)).size >= 2, room.id);
    const plaque=getHubRoomPlaqueBoundsV134(room);
    for (const entry of composition.items) {
      assert.equal(entry.collidable,false);assert.equal(entry.interactive,false);assert.equal(entry.plane,'rear');
      assert.ok(entry.x >= (room.xStart || 0) + 128 && entry.x + entry.w <= (room.xStart || 0) + composition.width - 128, room.id);
      if (entry.support === 'rear-floor') assert.equal(entry.y + entry.h,608,room.id);
      assert.ok(entry.y >= 186 && entry.y + entry.h <= 608,room.id);
      if (room.propRenderBounds) assert.ok(!intersects(entry,room.propRenderBounds),`${room.id}: native station is covered`);
      if (room.station?.bounds) assert.ok(!intersects(entry,room.station.bounds),`${room.id}: annex station is covered`);
      assert.ok(!intersects(entry,plaque),`${room.id}: the nameplate is covered`);
      if (room.viewport && entry.support === 'rear-wall') assert.ok(!intersects(entry,room.viewport),`${room.id}: the viewport glass is covered`);
      for (const prop of room.props || []) if (prop.asset) assert.ok(!intersects(entry,prop),`${room.id}: native cargo or furnishing is covered`);
    }
    for(let a=0;a<composition.items.length;a++)for(let b=a+1;b<composition.items.length;b++)
      assert.ok(!intersects(composition.items[a],composition.items[b]),`${room.id}: two authored furnishings overlap`);
    assert.deepEqual(room,before);
  }
});

test('rendered equipment leaves the actual lift doors and climbing corridors clear', () => {
  for (let deck=0;deck<HUB_DECKS.length;deck++) {
    const doors=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck), ladders=buildHubTraversalGeometryV87(deck).ladders;
    for(const room of HUB_DECKS[deck].rooms) for(const entry of resolveHubRoomDressingV134(room,{doors,ladders}).items) {
      for (const door of doors) assert.ok(!intersects(entry,{x:door.x-(door.lift?65:40),y:432,w:door.lift?130:80,h:192}),`${room.id}: ${entry.kind} covers a door`);
      for (const ladder of ladders) assert.ok(!intersects(entry,{x:ladder.x,y:ladder.top,w:ladder.w || 44,h:ladder.bottom-ladder.top}),`${room.id}: ${entry.kind} covers ladder rungs`);
    }
  }
});

test('draw reports contain only painted objects and expose inspectable floor and wall anchors', () => {
  for(const room of rooms){
    const subject=renderer(), before=structuredClone(room), report=drawHubRoomDressingV134(subject.ctx,room,optionsFor(room));
    assert.equal(report.roomId,room.id);
    const expected=resolveHubRoomDressingV134(room,optionsFor(room)).items.filter(entry=>entry.kind!=='bitmap');
    assert.equal(report.items.length,expected.length,room.id);
    assert.ok(subject.calls.filter(call=>call[0]==='fill').length>report.items.length*3,room.id);
    for(const painted of report.items){
      assert.equal(painted.source,'original-canvas-equipment');assert.equal(painted.collidable,false);assert.equal(painted.interactive,false);
      assert.equal(painted.anchor.y,painted.bounds.y+painted.bounds.h);assert.ok(painted.role);
      assert.ok(['rear-floor','rear-wall'].includes(painted.anchor.support));
    }
    assert.deepEqual(room,before);subject.balanced();
  }
});

test('reused cryopods and berths preserve the measured PNG aspect and consume the alpha-corrected drawable', () => {
  for(const definition of Object.values(HUB_ROOM_DRESSING_V134))for(const entry of definition.items.filter(item=>item.asset)){
    const source=readFileSync(fileURLToPath(new URL(`../.${entry.asset}`,import.meta.url)));
    assert.equal(source.subarray(1,4).toString(),'PNG');
    assert.ok(Math.abs(entry.w/entry.h-source.readUInt32BE(16)/source.readUInt32BE(20))<1e-12,entry.asset);
  }
  const subject=renderer(), room=HUB_DECKS[0].rooms.find(entry=>entry.id==='cryo-bay');
  const image={complete:true,naturalWidth:241,naturalHeight:131}, corrected={kind:'verified-drawable'}, seen=[];
  const report=drawHubRoomDressingV134(subject.ctx,room,{images:new Map([['/assets/openai/hub/props/cryopod.png',image]]),
    resolveDrawable:original=>{seen.push(original);return corrected;}});
  const paints=subject.calls.filter(call=>call[0]==='image');assert.ok(paints.length);
  assert.equal(paints.length,seen.length);assert.ok(seen.every(source=>source===image));assert.ok(paints.every(call=>call[1]===corrected));
  assert.equal(report.items.filter(entry=>entry.material==='native-bitmap').length,paints.length);subject.balanced();
});

test('room identification is a small mounted nameplate rather than a giant diagnostic panel', () => {
  for(const room of rooms){
    const subject=renderer(), report=drawHubRoomPlaqueV134(subject.ctx,room);
    assert.equal(report.bounds.w,260);assert.equal(report.bounds.h,40);
    assert.equal(subject.calls.filter(call=>call[0]==='text').length,2);
    assert.ok(report.bounds.y+report.bounds.h<=376);subject.balanced();
  }
  const subject=renderer(), report=drawHubRoomPlaqueV134(subject.ctx,{id:'proving-ground',xStart:900,world:{width:1280,floorY:624}},{top:148});
  assert.equal(report.bounds.y,148);assert.ok(report.bounds.y+report.bounds.h<370);subject.balanced();
});

test('the refuge plaque occupies the clear bay beside both actual observation frames while 34 other plaques retain their exact bounds', () => {
  const currentRooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V137];
  assert.equal(currentRooms.length,35);
  for(const room of currentRooms){
    const before=structuredClone(room), subject=renderer(), bounds=getHubRoomPlaqueBoundsV134(room);
    const report=drawHubRoomPlaqueV134(subject.ctx,room);
    assert.deepEqual(report.bounds,bounds);
    assert.ok(subject.calls.some(call=>call[0]==='fill'&&call.slice(1).every((value,index)=>value===[bounds.x,bounds.y,bounds.w,bounds.h][index])));
    assert.deepEqual(getHubSpatialPlanV136(room).reservations.find(row=>row.role==='room-sign'),
      {x:bounds.x-4,y:bounds.y-4,w:bounds.w+8,h:bounds.h+8,role:'room-sign'});
    if(room.id==='personal-refuge'){
      assert.deepEqual(bounds,{x:675,y:336,w:260,h:40});
      const portholes=REFUGE_PROPS_LAYOUT_V87.filter(prop=>prop.kind==='porthole');assert.equal(portholes.length,2);
      for(const frame of portholes)assert.ok(!intersects(bounds,frame),'The native observation frame covers the room plaque');
      assert.equal(Math.min(...portholes.map(frame=>frame.x))-bounds.x-bounds.w,40);
      assert.ok(resolveHubRoomDressingV134(room).reserved.some(row=>row.x===bounds.x-4&&row.y===bounds.y-4&&row.w===bounds.w+8&&row.h===bounds.h+8));
    }else{
      const width=room.profile?.worldWidth||room.world?.width||1280;
      assert.deepEqual(bounds,{x:(room.xStart||0)+width/2-130,y:190,w:260,h:40},room.id);
    }
    const shifted=getHubRoomPlaqueBoundsV134({...room,xStart:(room.xStart||0)+8000});
    assert.deepEqual({...shifted,x:shifted.x-8000},bounds);
    assert.equal(getHubRoomPlaqueBoundsV134(room,{top:148}).y,148);
    assert.deepEqual(room,before);subject.balanced();
  }
});

test('dressing composes after native background rendering, leaves editor previews untouched and returns detached evidence', () => {
  const subject=renderer(), physics={stock:9,colliders:[{x:7,y:624,w:1280,h:96}],actor:{x:50,y:532}};
  class Base{
    drawRoomModule(){subject.calls.push(['native-room']);return 7;}
    drawAnnexGeometryV71(){subject.calls.push(['native-annex']);return 9;}
    drawHubRoomPurposeV133(){return 'native-purpose';}
    getSnapshot(){return {physics:structuredClone(physics)};}
  }
  const Engine=withHubRoomDressingV134(Base), hub=new Engine(), before=structuredClone(physics);
  assert.equal(withHubRoomDressingV134(Engine),Engine);
  assert.equal(hub.drawRoomModule(subject.ctx,HUB_DECKS[0].rooms[0]),7);assert.equal(subject.calls[0][0],'native-room');
  assert.equal(hub.drawAnnexGeometryV71(subject.ctx,HUB_ANNEXES_V87[0]),9);
  const first=hub.getSnapshot();assert.equal(first.hubRoomDressingV134.rendered.length,2);
  first.hubRoomDressingV134.rendered[0].items[0].bounds.x=-999;
  assert.notEqual(hub.getSnapshot().hubRoomDressingV134.rendered[0].items[0].bounds.x,-999);
  assert.deepEqual(physics,before);const calls=subject.calls.length;
  hub.editorPlaytest=true;hub.drawRoomModule(subject.ctx,HUB_DECKS[0].rooms[0]);
  assert.equal(subject.calls.length,calls+1);assert.equal(hub.drawHubRoomPurposeV133(subject.ctx,HUB_DECKS[0].rooms[0]),'native-purpose');
  assert.deepEqual(hub.getSnapshot().hubRoomDressingV134.rendered,[]);subject.balanced();
});
