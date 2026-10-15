import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { HUB_SHIP_SPACES_V137 } from '../src/hub-ship-layout-v137.js';
import { HUB_PROP_ATLAS_V136 } from '../src/hub-prop-atlas-v136.js';
import { HUB_FURNISHING_ATLAS_V137 } from '../src/hub-furnishing-atlas-v137.js';
import { getHubSupportPlanesV139 } from '../src/hub-support-planes-v139.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { getHubDoorDestinationDescriptorsV138 } from '../src/hub-destination-signage-v138.js';
import { getHubRecessedPortalV136 } from '../src/hub-spatial-design-v136.js';
import { getHubCirculationSolidReservationsV138 } from '../src/hub-circulation-v137.js';
import { HUB_ANNEX_CARGO_ASSEMBLIES_V139, getHubAnnexFixtureAssetsV139,
  getHubAnnexFixturePlanV138, drawHubAnnexFixturesV138 } from '../src/hub-annex-fixtures-v138.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const inside=(a,b)=>a.x>=b.x-1e-8&&a.y>=b.y-1e-8&&a.x+a.w<=b.x+b.w+1e-8&&a.y+a.h<=b.y+b.h+1e-8;
const rooms=[...HUB_DECKS.flatMap(deck=>deck.rooms),...HUB_ANNEXES_V137];
const subjectRooms=HUB_ANNEXES_V137.filter(room=>Object.hasOwn(HUB_ANNEX_CARGO_ASSEMBLIES_V139,room.id));
const pngFor=asset=>auditWeaponPngV120(fileURLToPath(new URL(`..${asset}`,import.meta.url)));
function canvas(){
  const calls=[];let depth=0;
  const ctx={save(){depth++;},restore(){assert.ok(depth>0);depth--;},
    fillRect(...bounds){calls.push({kind:'fill',bounds,color:ctx.fillStyle});},
    drawImage(image,...args){calls.push({kind:'image',asset:image.src,args});}};
  return{ctx,calls,balanced:()=>assert.equal(depth,0)};
}
const imageFor=asset=>({src:asset,complete:true,naturalWidth:2048,naturalHeight:2048});

test('the three native storage roles use admitted untouched assets and an isolated specimen jar instead of a human chamber',()=>{
  assert.deepEqual(Object.keys(HUB_ANNEX_CARGO_ASSEMBLIES_V139),['morgue','mire-archives','bioforge']);
  const atlas=pngFor(HUB_PROP_ATLAS_V136.asset);assert.equal(atlas.sha256,HUB_PROP_ATLAS_V136.sha256);
  const biological=HUB_ANNEX_CARGO_ASSEMBLIES_V139.bioforge,png=pngFor(biological.asset),s=biological.source;
  assert.equal(png.sha256,biological.sourceSha256);assert.equal(png.width,biological.sourceWidth);assert.equal(png.height,biological.sourceHeight);
  assert.deepEqual(s,{x:719,y:712,w:102,h:195});
  const measured=[Infinity,Infinity,-Infinity,-Infinity];
  for(let y=700;y<910;y++)for(let x=710;x<825;x++)if(png.pixelAlpha(x,y)>=16){
    measured[0]=Math.min(measured[0],x);measured[1]=Math.min(measured[1],y);
    measured[2]=Math.max(measured[2],x+1);measured[3]=Math.max(measured[3],y+1);
  }
  assert.deepEqual(measured,[s.x,s.y,s.x+s.w,s.y+s.h]);
  assert.equal(png.pixelEdits,false);assert.ok(!biological.asset.includes('quarantine-unit'));
});

test('six complete storage assemblies keep the exact native solid footprint and supported top while their bitmap stays isotropic',()=>{
  assert.equal(subjectRooms.length,3);let count=0;
  for(const room of subjectRooms){
    const original=structuredClone(room),plan=getHubAnnexFixturePlanV138(room);
    assert.deepEqual(getHubAnnexFixtureAssetsV139(room),[HUB_ANNEX_CARGO_ASSEMBLIES_V139[room.id].asset]);
    for(const prop of plan.props.filter(prop=>prop.role==='cargo')){
      count++;const a=prop.assembly,source=room.props.find(entry=>entry.id===prop.id);
      const collider=room.colliders.find(entry=>entry.id===source.id+'-collider');
      const bounds={x:source.x,y:source.y,w:source.w,h:source.h};
      assert.deepEqual(prop.target,bounds);assert.deepEqual(a.bounds,bounds);
      assert.deepEqual({x:collider.x,y:collider.y,w:collider.w,h:collider.h},bounds);
      near(a.contentTarget.w/a.contentTarget.h,prop.source.w/prop.source.h);
      assert.ok(inside(a.contentTarget,bounds));assert.ok(a.mountBounds.every(part=>inside(part,bounds)));
      assert.deepEqual(a.mountBounds.find(part=>part.kind==='physical-top'),{x:bounds.x,y:bounds.y,w:bounds.w,h:3,kind:'physical-top'});
      near(a.supportY,624);assert.equal(prop.support,'native-physical-work-bay');
      assert.ok(plan.reservations.some(box=>box.sourceId===prop.id&&inside(bounds,box)));
    }
    assert.deepEqual(room,original);
  }
  assert.equal(count,6);assert.deepEqual(getHubAnnexFixtureAssetsV139({id:'unknown',props:[]}),[]);
});

test('world translation moves the complete native assembly and station support once while source pixels and floor height stay fixed',()=>{
  const offset=90000;
  for(const room of subjectRooms){
    const before=structuredClone(room),original=getHubAnnexFixturePlanV138(room),translated=getHubAnnexFixturePlanV138({...room,xStart:offset});
    for(const prop of original.props.filter(prop=>prop.assembly)){
      const moved=translated.props.find(entry=>entry.id===prop.id);
      for(const key of ['target','declaredBounds'])assert.deepEqual(moved[key],{...prop[key],x:prop[key].x+offset});
      assert.deepEqual(moved.source,prop.source);
      assert.deepEqual(moved.assembly.contentTarget,{...prop.assembly.contentTarget,x:prop.assembly.contentTarget.x+offset});
      assert.deepEqual(moved.assembly.mountBounds,prop.assembly.mountBounds.map(part=>({...part,x:part.x+offset})));
      assert.equal(moved.supportY,prop.supportY);
    }
    assert.deepEqual(translated.stationSupport.bounds,{...original.stationSupport.bounds,x:original.stationSupport.bounds.x+offset});
    assert.deepEqual(room,before);
  }
});

test('actual painting fills the real storage frame, reports only drawn art and omits the entire assembly while its source is unavailable',()=>{
  for(const room of subjectRooms){
    const original=structuredClone(room),plan=getHubAnnexFixturePlanV138(room),images=new Map();
    for(const prop of [...plan.props,...plan.structures])images.set(prop.asset,imageFor(prop.asset));
    const subject=canvas(),report=drawHubAnnexFixturesV138(subject.ctx,room,{images,resolveDrawable:image=>image});
    subject.balanced();assert.deepEqual(report.missing,[]);assert.equal(report.mounts.length,2);
    for(const prop of plan.props.filter(prop=>prop.assembly)){
      const b=prop.target,s=prop.source,t=prop.assembly.contentTarget;
      assert.ok(subject.calls.some(call=>call.kind==='fill'&&call.color==='#263b3e'
        &&JSON.stringify(call.bounds)===JSON.stringify([b.x,b.y,b.w,b.h])));
      assert.ok(subject.calls.some(call=>call.kind==='image'&&call.asset===prop.asset
        &&JSON.stringify(call.args)===JSON.stringify([s.x,s.y,s.w,s.h,t.x,t.y,t.w,t.h])));
    }
    const unloaded=canvas(),missing=drawHubAnnexFixturesV138(unloaded.ctx,room);
    assert.deepEqual(missing.mounts,[]);assert.deepEqual(missing.painted,[]);
    assert.deepEqual(unloaded.calls,[]);unloaded.balanced();assert.deepEqual(room,original);
  }
});

test('the inventory covers 35 rooms,57 native fittings,20 pipes and20 physical cargo bays without confusing decorative rear depth with a collider support',()=>{
  assert.equal(rooms.length,35);let fittings=0,pipes=0,cargo=0,assemblies=0,physicalInLayeredRoom=0;
  for(const room of rooms){
    const before=structuredClone(room),plan=getHubAnnexFixturePlanV138(room),support=getHubSupportPlanesV139(room);
    fittings+=plan.props.length;pipes+=plan.structures.length;
    for(const prop of plan.props.filter(prop=>prop.role==='cargo')){
      cargo++;if(prop.assembly)assemblies++;
      assert.equal(prop.support,'native-physical-work-bay');near(prop.supportY,room.world.floorY);
      near(prop.target.y+prop.target.h,prop.supportY);assert.equal(prop.rearServiceY,support.rearServiceY);
      if(support.presentationMode==='2.5d'){physicalInLayeredRoom++;assert.equal(prop.supportY-prop.rearServiceY,24);}
    }
    assert.deepEqual(room,before);
  }
  assert.deepEqual({fittings,pipes,cargo,assemblies,physicalInLayeredRoom},
    {fittings:57,pipes:20,cargo:20,assemblies:6,physicalInLayeredRoom:0});
  for(const original of HUB_ANNEXES_V87)assert.equal(HUB_ANNEXES_V137.find(room=>room.id===original.id),original);
  for(const room of HUB_ANNEXES_V137){
    const runtime=getHubAnnexRuntimeGeometryV139(room),plan=getHubAnnexFixturePlanV138(room),station=plan.stationSupport;
    near(station.supportY,runtime.propPlacementV139?.supportY??runtime.station.bounds.y+runtime.station.bounds.h);
    if(!['personal-refuge','maintenance-spine'].includes(room.id)){
      assert.equal(station.supportRole,'native-physical-work-bay');
      near(station.supportY,getHubSupportPlanesV139(room).rearServiceY);
    }else assert.equal(station.supportRole,'authored-wall-service');
  }
});

test('all20 physical storage bays and the five original service heroes clear real native pipes, stations, ladders and portal frames',()=>{
  let storage=0,heroes=0;
  for(const source of HUB_ANNEXES_V137){
    const room=getHubAnnexRuntimeGeometryV139(source);
    const plan=getHubAnnexFixturePlanV138(room),portals=getHubDoorDestinationDescriptorsV138(room)
      .map(door=>getHubRecessedPortalV136(door.socket).frame);
    const ladders=(room.ladders||[]).map(ladder=>({x:ladder.x,y:ladder.top,w:ladder.w,h:ladder.bottom-ladder.top}));
    const slabs=(room.platforms||[]).flatMap(platform=>getHubCirculationSolidReservationsV138(platform,{
      room:{...room,xStart:0},ladders:room.ladders||[],centeredLadders:false}));
    const structures=plan.structures.flatMap(pipe=>[pipe.body,pipe.shaft]);
    for(const prop of plan.props.filter(prop=>prop.role==='cargo')){
      storage++;
      for(const obstacle of [...portals,...ladders,...slabs,...structures,room.station.bounds])
        assert.equal(overlap(prop.target,obstacle),false,`${room.id}:${prop.id} crosses a native access or fitting`);
    }
    if(HUB_SHIP_SPACES_V137.includes(source)&&room.id!=='maintenance-spine'){
      heroes++;
      for(const obstacle of [...portals,...ladders,...slabs,...structures])
        assert.equal(overlap(room.station.bounds,obstacle),false,`${room.id}: hero crosses native access or fitting`);
    }
  }
  assert.equal(storage,20);assert.equal(heroes,5);
});

test('the five frontal service hero opaque192 soles stay within one pixel of their unchanged624 support',()=>{
  const png=pngFor(HUB_FURNISHING_ATLAS_V137.asset);assert.equal(png.sha256,HUB_FURNISHING_ATLAS_V137.sha256);
  let heroes=0;
  for(const source of HUB_SHIP_SPACES_V137.filter(room=>room.id!=='maintenance-spine')){
    const room=getHubAnnexRuntimeGeometryV139(source);
    heroes++;const [left,top,right,bottom]=room.art.alphaBounds.prop,b=room.station.bounds;let last=-1;
    for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(png.pixelAlpha(x,y)>=192)last=Math.max(last,y);
    assert.ok(last>=top);const sole=b.y+(last+1-top)/(bottom-top)*b.h;
    const support=getHubSupportPlanesV139(room).rearServiceY;
    near(b.y+b.h,support);assert.ok(sole<=support&&support-sole<1,`${room.id}: actual sole ${sole} leaves support ${support}`);
  }
  assert.equal(heroes,5);assert.equal(png.pixelEdits,false);
});
