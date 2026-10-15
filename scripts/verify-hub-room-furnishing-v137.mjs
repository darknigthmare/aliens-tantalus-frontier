import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_DECKS,HUB_WORLD } from '../src/hub-game.js';
import { HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { HUB_SHIP_SPACES_V137 } from '../src/hub-ship-layout-v137.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { HUB_PROP_ATLAS_V136 } from '../src/hub-prop-atlas-v136.js';
import { HUB_FURNISHING_ATLAS_V137 as atlas,getHubFurnishingCellV137 } from '../src/hub-furnishing-atlas-v137.js';
import { HUB_ROOM_FURNISHING_V137,enrichHubRoomCompositionV137,drawHubFurnishingMountsV137 } from '../src/hub-room-furnishing-v137.js';
import { HUB_FURNISHING_CRITICAL_OVERRIDES_V138 } from '../src/hub-furnishing-critical-v138.js';
import { getHubRoomLifePlanV136,drawHubRoomLifeV136 } from '../src/hub-room-life-v136.js';
import { getHubRoomParallaxPlanV134,getHubRearEquipmentLayoutV134 } from '../src/hub-room-parallax-v134.js';
import { HUB_ENVIRONMENT_ATLAS_V134 } from '../src/hub-environment-atlas-v134.js';

const rooms=[...HUB_DECKS.flatMap(deck=>deck.rooms),...HUB_ANNEXES_V87,...HUB_SHIP_SPACES_V137];
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
function optionsFor(room){
  const deck=HUB_DECKS.findIndex(deck=>deck.rooms.includes(room));
  if(deck<0)return{ladders:room.ladders,platforms:room.platforms};
  const geometry=buildHubTraversalGeometryV87(deck);
  return{doors:buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck),ladders:geometry.ladders,platforms:geometry.platforms};
}
function canvas(){
  const calls=[],ctx=new Proxy({save(){calls.push(['save']);},restore(){calls.push(['restore']);},
    drawImage(...args){calls.push(['image',...args]);},fillRect(...args){calls.push(['fill',...args]);}
  },{get:(object,key)=>key in object?object[key]:()=>{}});
  return{ctx,calls};
}
const original=structuredClone(rooms);

test('nine original separated furnishings retain the admitted RGBA bytes and complete non-overlapping crops',()=>{
  const png=auditWeaponPngV120(fileURLToPath(new URL(`..${atlas.asset}`,import.meta.url)));
  assert.equal(png.sha256,atlas.sha256);assert.equal(png.width,atlas.width);assert.equal(png.height,atlas.height);
  assert.ok(png.transparentPixels>png.width*png.height*.45);
  for(const [x,y]of [[0,0],[1535,0],[0,1023],[1535,1023]])assert.ok(png.pixelAlpha(x,y)<=1);
  const crops=Object.values(atlas.cells).map(cell=>cell.source),counts=crops.map(()=>0);
  assert.equal(crops.length,9);
  for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++){
    if(png.pixelAlpha(x,y)<=32)continue;
    const indices=crops.flatMap((c,index)=>x>=c.x&&x<c.x+c.w&&y>=c.y&&y<c.y+c.h?[index]:[]);
    assert.equal(indices.length,1,`Clipped furnishing or crop overlap at ${x},${y}`);counts[indices[0]]++;
  }
  for(const count of counts)assert.ok(count>40000);
});

test('functional sizes use the source object and a standing human rather than a shared arbitrary height',()=>{
  for(const [id,cell]of Object.entries(atlas.cells)){
    assert.equal(getHubFurnishingCellV137(id),cell);near(cell.width/cell.height,cell.source.w/cell.source.h);
    assert.ok(cell.width>=40&&cell.width<=180);assert.ok(cell.height>=30&&cell.height<=128);
    assert.ok(cell.maximumWidth>=cell.width&&cell.maximumWidth<=cell.source.w);
    assert.equal(cell.collidable,false);assert.equal(cell.interactive,false);
  }
  // The berth includes its locker; the actual mattress still fits an adult.
  assert.ok(338*atlas.cells['crew-berth'].width/atlas.cells['crew-berth'].source.w>96.5*1.1);
  // The shower's clear glazed opening has adult standing headroom.
  assert.ok(254*atlas.cells['sanitary-unit'].width/atlas.cells['sanitary-unit'].source.w>96.5+8);
  assert.ok(atlas.cells['cockpit-seat'].height<96.5*.7,'A seated cockpit must not become a standing-size throne');
  assert.equal(getHubFurnishingCellV137('__proto__'),null);assert.equal(getHubFurnishingCellV137('unknown'),null);
});

test('all 35 compartments accept their authored functional groups with no hidden rejected sockets or blocked routes',()=>{
  assert.deepEqual(Object.keys(HUB_ROOM_FURNISHING_V137).sort(),rooms.map(room=>room.id).sort());
  let count=0,added=0,authored=0;
  for(const room of rooms){
    const options=optionsFor(room),plan=getHubRoomLifePlanV136(room,options);
    assert.deepEqual(getHubRoomLifePlanV136(room,options),plan);assert.equal(plan.schema,137);
    assert.deepEqual(plan.furnishingV137.rejected,[],room.id);
    const definition=HUB_FURNISHING_CRITICAL_OVERRIDES_V138[room.id]||HUB_ROOM_FURNISHING_V137[room.id];
    assert.equal(plan.furnishingV137.added.length,definition.items.length,room.id);
    authored+=definition.items.length;
    assert.ok(plan.furnishingV137.added.length>=1,room.id);count+=plan.items.length;added+=plan.furnishingV137.added.length;
    for(const item of plan.items){
      assert.equal(item.collidable,false);assert.equal(item.interactive,false);assert.equal(item.plane,'rear');
      assert.ok([item.x,item.y,item.w,item.h].every(Number.isFinite));assert.ok(item.w>0&&item.h>0);
      assert.ok(item.x>=plan.start&&item.x+item.w<=plan.start+plan.width);
      assert.ok(!plan.spatial.reservations.some(reservation=>overlap(item,reservation)),`${room.id}:${item.role} blocks ${JSON.stringify(plan.spatial.reservations.filter(r=>overlap(item,r)))}`);
      if(item.support==='rear-floor')near(item.y+item.h,plan.spatial.planes.rearServiceY);
      if(item.source)near(item.w/item.h,item.source.w/item.source.h);
    }
    for(let i=0;i<plan.items.length;i++)for(let j=i+1;j<plan.items.length;j++)assert.ok(!overlap(plan.items[i],plan.items[j]),`${room.id}: ${plan.items[i].role}/${plan.items[j].role}`);
  }
  assert.equal(added,authored);assert.ok(count>=added);
  assert.deepEqual(rooms,original);
});

test('medical, crew berths and mess contain the corrected real support groups',()=>{
  const find=id=>{const room=rooms.find(room=>room.id===id);return getHubRoomLifePlanV136(room,optionsFor(room));};
  const medical=find('medical'),quarters=find('crew-quarters'),mess=find('mess');
  for(const role of ['bedside-sterile-cabinet','upper-sterile-preparation-supply','clinical-emergency-kit'])assert.ok(medical.items.some(item=>item.role===role));
  assert.ok(medical.items.some(item=>item.cell==='medical-trolley'&&item.support==='rear-floor'));
  const cabinet=medical.items.find(item=>item.role==='bedside-sterile-cabinet'),supply=medical.items.find(item=>item.role==='upper-sterile-preparation-supply');
  assert.ok(supply.y+supply.h<376-8,'Sterile stock is above the actual upper landing');
  assert.ok(cabinet.x>rooms.find(room=>room.id==='medical').propRenderBounds.x,'Cabinet belongs beside the bed');
  const berth=quarters.items.find(item=>item.role==='upper-crew-berth');
  assert.equal(berth.cell,'crew-berth');assert.equal(berth.support,'rear-wall');assert.ok(berth.y+berth.h<498,'Mounted berth remains above the original refuge door');
  assert.ok(mess.items.some(item=>item.role==='mess-tray-return-bench'&&item.kind==='bench'));
  assert.ok(mess.items.some(item=>item.role==='mess-tray-return-stock'&&item.cell==='galley-rack'));
  assert.ok(!mess.items.some(item=>item.cell==='galley-unit'),'Cooking belongs in the separate galley-service compartment');
  assert.ok(mess.items.some(item=>item.role==='chilled-drink-storage'&&item.cell==='food-refrigerator'));
  assert.ok(!mess.items.some(item=>item.kind==='galley'),'Old counter must not remain behind the new kitchen entrance');
});

test('actual near and far camera views never drag a rear equipment panel through composed furniture',()=>{
  const image={complete:true,naturalWidth:HUB_ENVIRONMENT_ATLAS_V134.width,naturalHeight:HUB_ENVIRONMENT_ATLAS_V134.height};
  for(const room of rooms){
    const options=optionsFor(room),composition=getHubRoomLifePlanV136(room,options),start=room.xStart||0;
    const cameras=room.world?[0,Math.max(0,room.world.width-1280)]:[start-1280,start,start+1280];
    for(const camera of cameras){
      const clip=room.id==='personal-refuge'?{x:start,y:334,w:room.world.width,h:270}:null;
      const model=getHubRoomParallaxPlanV134(room,camera,{clip});assert.ok(model,room.id);
      for(const panel of getHubRearEquipmentLayoutV134(room,model,image,options))for(const item of composition.items)
        assert.ok(!overlap(item,panel.target),`${room.id}:${item.role} overlaps moving rear equipment at ${camera}`);
    }
  }
});

test('new service compartments keep the unique native hero and coherent adjacent supporting equipment',()=>{
  const heroCells={ 'flight-control-cockpit':'cockpit-seat','galley-service':'galley-unit','sanitary-bay':'sanitary-unit',
    'engine-room':'engine-pump','water-recycling':'filtration-skid' };
  for(const room of HUB_SHIP_SPACES_V137){
    const plan=getHubRoomLifePlanV136(room,optionsFor(room));assert.ok(plan.items.length>=5,room.id);
    if(heroCells[room.id])assert.ok(!plan.items.some(item=>item.cell===heroCells[room.id]),`${room.id} duplicates its inspection hero`);
    assert.ok(plan.items.some(item=>item.role.includes('emergency')||item.role.includes('fire-safety')),room.id);
    assert.ok(!plan.items.some(item=>overlap(item,room.station.bounds)),room.id);
  }
  const cockpit=HUB_SHIP_SPACES_V137.find(room=>room.id==='flight-control-cockpit'),plan=getHubRoomLifePlanV136(cockpit,optionsFor(cockpit));
  const console=plan.items.find(item=>item.role==='pilot-forward-instrument-console');assert.ok(console);
  const seat=cockpit.station.bounds;assert.ok(console.x>seat.x+seat.w&&console.x-seat.x-seat.w<36);
  assert.ok(console.y+console.h>seat.y&&console.y<seat.y+seat.h,'Controls stay near the seated pilot, rather than the ceiling');
  for(const id of ['engine-room','water-recycling','flight-control-cockpit']){
    const room=HUB_SHIP_SPACES_V137.find(room=>room.id===id),plan=getHubRoomLifePlanV136(room,optionsFor(room));
    assert.equal(plan.furnishingV137.links.length,1,id);
    const link=plan.furnishingV137.links[0],feed=plan.items.find(item=>item.role===link.from);
    assert.ok(feed);assert.ok(link.points[0][0]>=feed.x&&link.points[0][0]<=feed.x+feed.w);
    assert.ok(link.points[0][1]>=feed.y&&link.points[0][1]<=feed.y+feed.h);
    assert.equal(link.collidable,false);assert.equal(link.interactive,false);
  }
});

test('render evidence reports actual loaded crops and mounted supports without changing gameplay or engine state',()=>{
  const native={complete:true,naturalWidth:HUB_PROP_ATLAS_V136.width,naturalHeight:HUB_PROP_ATLAS_V136.height},
    originalAtlas={complete:true,naturalWidth:atlas.width,naturalHeight:atlas.height},
    images=new Map([[HUB_PROP_ATLAS_V136.asset,native],[atlas.asset,originalAtlas]]);
  let atlasDraws=0,expectedAtlasDraws=0;
  for(const room of rooms){
    const before=structuredClone(room),subject=canvas(),report=drawHubRoomLifeV136(subject.ctx,room,{...optionsFor(room),images});
    const painted=subject.calls.filter(call=>call[0]==='image'&&call[1]===originalAtlas);atlasDraws+=painted.length;
    expectedAtlasDraws+=getHubRoomLifePlanV136(room,optionsFor(room)).items.filter(item=>item.asset===atlas.asset).length;
    assert.deepEqual(report.furnishingV137.pendingImageRoles,[],room.id);
    assert.equal(report.furnishingV137.paintedRoles.length,report.furnishingV137.added.length,room.id);
    assert.equal(report.items.filter(item=>item.source===atlas.asset).length,painted.length,room.id);
    for(const call of painted){const [sx,sy,sw,sh,x,y,w,h]=call.slice(2);near(sw/sh,w/h);assert.ok(sx>=0&&sy>=0&&sx+sw<=atlas.width&&sy+sh<=atlas.height);assert.ok([x,y,w,h].every(Number.isFinite));}
    assert.equal(subject.calls.filter(call=>call[0]==='save').length,subject.calls.filter(call=>call[0]==='restore').length);
    assert.deepEqual(room,before);
  }
  assert.equal(atlasDraws,expectedAtlasDraws);assert.ok(atlasDraws>0);assert.deepEqual(rooms,original);
  const unloadedRoom=HUB_SHIP_SPACES_V137.find(room=>room.id==='galley-service'),unloaded=drawHubRoomLifeV136(canvas().ctx,unloadedRoom,optionsFor(unloadedRoom));
  assert.ok(unloaded.furnishingV137.pendingImageRoles.length>0);
  assert.ok(!unloaded.items.some(item=>item.source===atlas.asset),'An unloaded image must not be reported as painted');
  const subject=canvas();assert.equal(drawHubFurnishingMountsV137(subject.ctx,null),undefined);assert.equal(subject.calls.length,0);
  assert.equal(enrichHubRoomCompositionV137({id:'unknown'}),null);
});
