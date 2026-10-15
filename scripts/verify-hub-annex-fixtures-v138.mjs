import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { HUB_SHIP_SPACES_V137 } from '../src/hub-ship-layout-v137.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { HubGame, HUB_ANNEX_MODULE_ART_V82 as nativeSources } from '../src/hub-v71-runtime.js';
import { HUB_ANNEX_MODULE_ART_V82, HUB_ANNEX_FIXTURE_STANDARD_V138 as standard,
  getHubAnnexFixturePlanV138, drawHubAnnexFixturesV138 } from '../src/hub-annex-fixtures-v138.js';
import { getHubSpatialPlanV136 } from '../src/hub-spatial-design-v136.js';
import { getHubRoomLifePlanV136, withHubRoomLifeV136 } from '../src/hub-room-life-v136.js';
import { getHubCirculationSolidReservationsV138 } from '../src/hub-circulation-v137.js';
import { HUB_ANNEX_STATION_IDS_V139, getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';

const annexes=[...HUB_ANNEXES_V87,...HUB_SHIP_SPACES_V137].map(getHubAnnexRuntimeGeometryV139);
const rooms=[...HUB_DECKS.flatMap(deck=>deck.rooms),...annexes];
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
const box=([x,y,w,h])=>({x,y,w,h});
const mockImage={complete:true,naturalWidth:8192,naturalHeight:8192};
function optionsFor(room){
  const deck=HUB_DECKS.findIndex(deck=>deck.rooms.includes(room));
  if(deck<0)return{ladders:room.ladders,platforms:room.platforms};
  const geometry=buildHubTraversalGeometryV87(deck);
  return{doors:buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck),ladders:geometry.ladders,platforms:geometry.platforms};
}
function painter(){const calls=[];return{calls,ctx:{drawImage(...args){calls.push(args);},save(){},restore(){},fillRect(){}}};}

test('the canonical source pieces have one owner and the crate crop contains every native alpha pixel',()=>{
  assert.equal(nativeSources,HUB_ANNEX_MODULE_ART_V82,'Native drawing and clearance must use the same data');
  const png=auditWeaponPngV120(fileURLToPath(new URL(`..${standard.crateAsset}`,import.meta.url)));
  assert.equal(png.width,175);assert.equal(png.height,160);
  assert.deepEqual(png.alphaBounds,standard.crateSource);
  const [left,top,right,bottom]=standard.crateSource;
  for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++)
    if(x<left||x>=right||y<top||y>=bottom)assert.equal(png.pixelAlpha(x,y),0,`Crop clips alpha at ${x},${y}`);
  assert.equal(png.pixelEdits,false);
});

test('native cargo and task-specific storage retain uniform source scale, real boxes, floor contact and interaction geometry',()=>{
  let cargo=0,stations=0,assemblies=0;
  for(const room of annexes){
    const before=structuredClone(room),plan=getHubAnnexFixturePlanV138(room);
    const replaced=HUB_ANNEX_STATION_IDS_V139.includes(room.id);
    assert.equal(plan.registryPreserved,true);assert.equal(plan.physicalStationRelocated,replaced);assert.equal(plan.geometryPreserved,!replaced);
    if(!['personal-refuge','maintenance-spine'].includes(room.id))near(plan.stationSupport.supportY,624);
    for(const prop of plan.props){
      const original=room.props.find(entry=>entry.id===prop.id);assert.ok(original);
      if(prop.role==='cargo'){
        cargo++;near(prop.target.y+prop.target.h,624);
        if(prop.assembly){
          assemblies++;assert.deepEqual(prop.target,prop.declaredBounds);
          near(prop.assembly.contentTarget.w/prop.assembly.contentTarget.h,prop.source.w/prop.source.h);
          near(prop.assembly.supportY,624);assert.equal(prop.support,'native-physical-work-bay');
        }else near(prop.target.w/prop.target.h,167/152);
        assert.ok(prop.target.x>=original.x&&(prop.target.x+prop.target.w)<=original.x+original.w+1e-8);
        assert.ok(prop.target.y>=original.y-1e-8);assert.ok(prop.target.h<=original.h+1e-8);
      }
    }
    const console=room.props?.find(entry=>entry.role==='console');
    if(console){
      stations++;for(const key of ['x','y','w','h'])near(console[key],room.station.bounds[key]);
      assert.ok(getHubSpatialPlanV136(room).reservations.some(entry=>entry.role==='native-service'&&overlap(entry,room.station.bounds)));
    }
    assert.deepEqual(room,before);
  }
  assert.equal(cargo,20);assert.equal(assemblies,6);assert.equal(stations,10);
});

test('pipe bodies and ceiling-anchored shafts use the exact drawn source and isotropic tiles without altering solids',()=>{
  let count=0;
  for(const room of annexes){
    const before=structuredClone(room),plan=getHubAnnexFixturePlanV138(room);
    for(const pipe of plan.structures){
      count++;const collider=room.colliders.find(entry=>entry.id===pipe.id);
      assert.deepEqual(pipe.nativeCollider,collider);near(pipe.body.h,collider.h);
      near(pipe.body.w/pipe.body.h,64/174);near(pipe.shaft.w/pipe.body.w,50/64);
      assert.equal(pipe.shaft.y,standard.ceilingY);near(pipe.shaft.y+pipe.shaft.h,pipe.body.y);
      let y=standard.ceilingY;
      for(const tile of pipe.tiles){
        near(tile.target.y,y);near(tile.source.w/tile.source.h,tile.target.w/tile.target.h);
        assert.ok(tile.source.h<=86);y+=tile.target.h;
      }
      near(y,pipe.body.y);
      for(const part of ['body','shaft']){
        assert.ok(plan.reservations.some(entry=>entry.sourceId===pipe.id&&['x','y','w','h'].every(key=>entry[key]===pipe[part][key])));
        for(const prop of plan.props)assert.ok(!overlap(prop.target,pipe[part]),`${room.id}:${prop.id} crosses ${pipe.id}:${part}`);
      }
    }
    assert.deepEqual(room,before);
  }
  assert.equal(count,20);
});

test('generic radar omissions and obsolete under-floor foreground are explicit while native services remain',()=>{
  let omittedRadar=0,foreground=0;
  for(const room of annexes){
    const plan=getHubAnnexFixturePlanV138(room);
    for(const entry of plan.omitted){
      if(entry.reason==='generic-radar-without-local-service-role'){
        omittedRadar++;assert.ok(!plan.props.some(prop=>prop.id===entry.id));
        assert.ok(!plan.reservations.some(reservation=>reservation.sourceId===entry.id));
      }
    }
    if(plan.legacyForeground){
      foreground++;assert.equal(plan.legacyForeground.omitted,true);
      assert.ok(plan.legacyForeground.legacyVisibleStrip.y>plan.floorY);
      const subject=painter();assert.equal(HubGame.prototype.drawAnnexForegroundV72.call({},subject.ctx,room,mockImage),false);
      assert.deepEqual(subject.calls,[]);assert.ok(plan.props.some(prop=>prop.role==='cargo'));
      assert.ok(room.colliders.some(collider=>collider.role==='station'));
    }
  }
  assert.equal(omittedRadar,20);assert.equal(foreground,10);
});

test('the actual native paint calls share their reserved silhouettes and missing images are never claimed as rendered',()=>{
  for(const room of annexes){
    const before=structuredClone(room),plan=getHubAnnexFixturePlanV138(room),images=new Map();
    for(const entry of [...plan.props,...plan.structures])images.set(entry.asset,mockImage);
    const subject=painter(),report=drawHubAnnexFixturesV138(subject.ctx,room,{images,resolveDrawable:image=>image});
    assert.deepEqual(report.missing,[]);assert.equal(report.painted.length,subject.calls.length);
    assert.equal(report.painted.length,plan.props.length+plan.structures.reduce((sum,pipe)=>sum+pipe.tiles.length+1,0));
    for(let i=0;i<report.painted.length;i++){
      const entry=report.painted[i],call=subject.calls[i];
      assert.deepEqual(box(call.slice(-4)),entry.target);
      if(entry.source)assert.deepEqual(box(call.slice(1,5)),entry.source);
      assert.ok(plan.reservations.some(reservation=>entry.target.x>=reservation.x-1e-8&&entry.target.y>=reservation.y-1e-8
        &&entry.target.x+entry.target.w<=reservation.x+reservation.w+1e-8&&entry.target.y+entry.target.h<=reservation.y+reservation.h+1e-8));
    }
    const unloaded=drawHubAnnexFixturesV138(painter().ctx,room);assert.deepEqual(unloaded.painted,[]);
    if(report.painted.length)assert.ok(unloaded.missing.length>0);
    assert.deepEqual(room,before);
  }
});

test('all 35 production groups clear native fittings and real solid deck faces and consoles in both depth settings',()=>{
  assert.equal(rooms.length,35);
  for(const room of rooms){
    const options=optionsFor(room),plan=getHubRoomLifePlanV136(room,options),spatial=getHubSpatialPlanV136(room,options);
    assert.deepEqual(plan.furnishingV137.rejected,[],room.id);
    const native=getHubAnnexFixturePlanV138(room);
    for(const fixture of native.reservations){
      assert.ok(spatial.reservations.some(reservation=>reservation.role===fixture.role&&overlap(fixture,reservation)),`${room.id}:${fixture.sourceId} lacks a reservation`);
      for(const item of plan.items)assert.ok(!overlap(item,fixture),`${room.id}:${item.role} crosses native ${fixture.sourceId}`);
    }
    const platforms=(options.platforms||[]).filter(platform=>room.world||platform.roomId===room.id);
    for(const platform of platforms)for(const depthEnabled of [true,false])
      for(const solid of getHubCirculationSolidReservationsV138(platform,{...options,room,depthEnabled,centeredLadders:!room.world}))
        for(const item of plan.items)assert.ok(!overlap(item,solid),`${room.id}:${item.role} crosses ${solid.sourceId}:${solid.role}`);
  }
});

test('runtime render evidence is detached and editor playtests do not publish stale fixture reports',()=>{
  class Base{getSnapshot(){return{};}currentRoom(){return annexes[0];}}
  const Engine=withHubRoomLifeV136(Base),engine=new Engine();
  const report=drawHubAnnexFixturesV138(painter().ctx,annexes[0]);
  engine.annexFixturesRenderedV138=new Map([[annexes[0].id,report]]);
  const snapshot=engine.getSnapshot();assert.equal(snapshot.hubRoomLifeV136.nativeFixtures.length,1);
  snapshot.hubRoomLifeV136.nativeFixtures[0].missing.length=0;
  assert.ok(engine.getSnapshot().hubRoomLifeV136.nativeFixtures[0].missing.length>0);
  engine.editorPlaytest=true;assert.deepEqual(engine.getSnapshot().hubRoomLifeV136.nativeFixtures,[]);
});
