import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_DECKS, HUB_WORLD, HubGame } from '../src/hub-game.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { getHubDoorBounds } from '../src/hub-profiles-v53.js';
import { getHubRecessedPortalV136, getHubSpatialPlanV136 } from '../src/hub-spatial-design-v136.js';
import { getHubCirculationSolidReservationsV138 } from '../src/hub-circulation-v137.js';
import { getHubSupportPlanesV139 } from '../src/hub-support-planes-v139.js';
import { HUB_FURNITURE_ATLAS_V139 as atlas, getHubFurnitureCellV139 } from '../src/hub-furniture-atlas-v139.js';
import { HUB_NATIVE_PROP_SOURCES_V139, getHubNativePropPlacementV139, projectHubNativePartV139,
  getHubInteractionPropBoundsV136, getHubStationInteractionBoundsV136 } from '../src/hub-prop-placements-v136.js';

const rooms=HUB_DECKS.flatMap(deck=>deck.rooms);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const original=structuredClone(rooms);
const plan=id=>{
  const room=rooms.find(room=>room.id===id);assert.ok(room,id);
  assert.ok(room.propPlacementV139,`${id}: the production native factory must consume the placement contract`);
  return room.propPlacementV139;
};

test('all native crops pin their actual hard foot pixels and the new elevations retain the admitted original PNG',()=>{
  const png=auditWeaponPngV120(fileURLToPath(new URL(`..${atlas.asset}`,import.meta.url)));
  assert.equal(png.sha256,atlas.sha256);assert.equal(png.pixelEdits,false);
  for(const id of ['medical','mess','briefing','workshop']){
    const placement=plan(id),cell=getHubFurnitureCellV139(placement.cellId);assert.ok(cell,id);
    assert.equal(placement.artReady,true);assert.equal(placement.asset,atlas.asset);
    assert.deepEqual(placement.source,cell.source);assert.equal(placement.artProjection,'strict-side-elevation');
    const {source}=cell,foot=source.y+cell.footSourceY;
    assert.ok(Array.from({length:source.w},(_,x)=>png.pixelAlpha(source.x+x,foot-1)).some(alpha=>alpha>=192),id);
    for(let y=foot;y<source.y+source.h;y++)for(let x=source.x;x<source.x+source.w;x++)
      assert.ok(png.pixelAlpha(x,y)<192,`${id}: foot anchor missed hard source pixels`);
  }
  const images=new Map([[atlas.asset,png]]);
  for(const room of rooms){
    const placement=plan(room.id);
    if(!images.has(placement.asset))images.set(placement.asset,auditWeaponPngV120(fileURLToPath(new URL(`..${placement.asset}`,import.meta.url))));
    const original=images.get(placement.asset),source=placement.source,foot=source.y+placement.opaqueFoot.sourceY;
    assert.ok(Array.from({length:source.w},(_,x)=>original.pixelAlpha(source.x+x,foot-1)).some(alpha=>alpha>=192),room.id);
    for(let y=foot;y<source.y+source.h;y++)for(let x=source.x;x<source.x+source.w;x++)
      assert.ok(original.pixelAlpha(x,y)<192,`${room.id}: the legacy foot must come from hard pixels, never source.h`);
  }
});

test('all native rendering, access and physical supports are generated once from uniform source scale and the shared foot plane',()=>{
  assert.equal(rooms.length,16);
  for(const room of rooms){
    const placement=plan(room.id),planes=getHubSupportPlanesV139(room),target=placement.renderBounds;
    near(target.w/placement.source.w,target.h/placement.source.h);
    near(target.y+placement.opaqueFoot.sourceY*placement.sizing.scale,planes.rearServiceY);
    near(placement.opaqueFoot.y,planes.rearServiceY);near(placement.footprint.supportY,planes.rearServiceY);
    assert.deepEqual(room.propRenderBounds,target);assert.equal(room.prop,placement.asset);
    assert.deepEqual(room.propInteractionBounds,placement.interactionBounds);near(room.x,placement.inspectionX);
    if(placement.visible===false){
      assert.equal(room.propInteractionBounds,null);assert.equal(room.propCollisionBounds,null);
      assert.deepEqual(placement.colliders,[]);assert.equal(getHubInteractionPropBoundsV136(room),null);
      assert.equal(getHubStationInteractionBoundsV136(room),null);continue;
    }
    assert.deepEqual(getHubInteractionPropBoundsV136(room),target);
    assert.deepEqual(getHubStationInteractionBoundsV136(room),placement.interactionBounds);
    if(placement.colliders.length){
      const support=placement.colliders[0];assert.deepEqual(room.propCollisionBounds,support);
      assert.equal(support.collisionMode,'one-way-top');assert.equal(support.physicalPlane,'rear');
      near(support.y+support.h,planes.rearServiceY);
      if(placement.usefulSurface){near(support.y,placement.usefulSurface.supportY);
        assert.ok(support.x>=placement.usefulSurface.bounds.x-1e-8);
        assert.ok(support.x+support.w<=placement.usefulSurface.bounds.x+placement.usefulSurface.bounds.w+1e-8);}
    }
  }
  assert.deepEqual(rooms,original);
});

test('useful furniture parts determine adult dimensions and all main-room furniture follows its complete orthographic room',()=>{
  const medical=plan('medical'),mess=plan('mess'),workshop=plan('workshop'),briefing=plan('briefing');
  near(medical.usefulSurface.bounds.w,118);assert.ok(medical.tableHeight>=45&&medical.tableHeight<=52);
  assert.equal(medical.usefulSurface.side,'visible-long-side');assert.equal(medical.usefulSurface.kind,'mattress');
  near(mess.tableHeight,40);near(workshop.tableHeight,46);near(briefing.tableHeight,52);
  for(const room of rooms){const placement=plan(room.id);assert.equal(placement.view,'strict-side');
    assert.equal(placement.supportPlanes.presentationMode,'2d');assert.equal(placement.opaqueFoot.y,624);assert.equal(placement.artReady,true);}
  assert.equal(briefing.view,'strict-side');assert.equal(briefing.artProjection,'strict-side-elevation');
  assert.equal(briefing.functionalRole,'tactical-standing-planning-table');assert.equal(briefing.supportPlanes.rearServiceY,624);
  assert.equal(medical.supportPlanes.rearServiceY,624);assert.equal(mess.supportPlanes.rearServiceY,624);
  assert.equal(getHubFurnitureCellV139('medical-bed-oblique'),null,'An unreviewed oblique candidate cannot become an admitted native view');
  const lab=plan('science-lab');near(lab.tableHeight,40);
  assert.deepEqual(lab.usefulSurface.occupied,[lab.usefulSurface.bounds],'The native painted flasks must not be reported as an empty work surface');
});

test('standing and lying human enclosures scale by their measured usable interior instead of the previous overall image cap',()=>{
  const quarantine=plan('quarantine'),cryo=plan('cryo-bay'),quarters=plan('crew-quarters');
  assert.equal(quarantine.sizing.criterion,'standing-clear-interior');near(quarantine.interiorBounds.h,104);
  assert.ok(quarantine.interiorBounds.h>96.5+7);assert.ok(quarantine.renderBounds.h>150);
  for(const placement of [cryo,quarters]){
    assert.equal(placement.capacity,'lying-adult');near(placement.interiorBounds.w,110);
    assert.ok(placement.interiorBounds.w>96.5*1.1);assert.ok(placement.interiorBounds.h>30);
  }
  for(const placement of [quarantine,cryo,quarters]){
    const source=HUB_NATIVE_PROP_SOURCES_V139[placement.roomId],inner=source.interior;
    assert.ok(inner.x>=0&&inner.y>=0&&inner.x+inner.w<=placement.source.w&&inner.y+inner.h<=placement.source.h);
  }
});

test('the actual native silhouettes and useful tops leave every real main-room ladder, solid bracket, deck face and lift frame clear',()=>{
  for(let deck=0;deck<HUB_DECKS.length;deck++){
    const geometry=buildHubTraversalGeometryV87(deck);
    const doors=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck);
    for(const room of HUB_DECKS[deck].rooms){
      if(plan(room.id).visible===false)continue; // Separate vehicle/craft contracts own these bays.
      const native=plan(room.id).renderBounds;
      for(const ladder of geometry.ladders){
        if(ladder.x<room.xStart||ladder.x>room.xEnd)continue;
        const rails={x:ladder.x-ladder.w/2-5,y:ladder.top,w:ladder.w+10,h:ladder.bottom-ladder.top};
        assert.ok(!overlap(native,rails),`${room.id} hides native ladder ${ladder.id}`);
      }
      for(const platform of geometry.platforms.filter(platform=>platform.roomId===room.id))for(const depthEnabled of [true,false])
        for(const solid of getHubCirculationSolidReservationsV138(platform,{room,platforms:geometry.platforms,ladders:geometry.ladders,centeredLadders:true,depthEnabled}))
          assert.ok(!overlap(native,solid),`${room.id} crosses ${solid.sourceId}:${solid.role}`);
      for(const door of doors.filter(door=>door.roomId===room.id&&door.lift)){
        const frame=getHubRecessedPortalV136(getHubDoorBounds(door)).frame;
        assert.ok(!overlap(native,frame),`${room.id} hides the real lift frame`);
      }
      const entrances=getHubSpatialPlanV136(room,{doors,platforms:[],ladders:[]}).reservations.filter(entry=>
        ['annex-entrance','ship-service-entrance','lift-entrance','transverse-bulkhead','destination-sign'].includes(entry.role));
      for(const entrance of entrances)assert.ok(!overlap(native,entrance),`${room.id} consumes the real ${entrance.role} approach`);
    }
  }
});

test('native drawing consumes the exact contract crop and target, while the part projector rejects impossible source geometry',()=>{
  for(const id of ['medical','mess','briefing','workshop','quarantine']){
    const room=rooms.find(room=>room.id===id),placement=plan(id),calls=[];
    const image={complete:true,naturalWidth:2048,naturalHeight:2048};
    const ctx=new Proxy({drawImage(...args){calls.push(args);},fillRect(){}},{get:(target,key)=>key in target?target[key]:()=>{}});
    HubGame.prototype.drawInteractionProp.call({propImages:new Map([[room.prop,image]]),nearestInteraction:()=>null,animationTime:0},ctx,room);
    assert.equal(calls.length,1,id);const [drawn,sx,sy,sw,sh,x,y,w,h]=calls[0];assert.equal(drawn,image);
    assert.deepEqual({x:sx,y:sy,w:sw,h:sh},placement.source);
    assert.deepEqual({x,y,w,h},placement.renderBounds);
  }
  assert.deepEqual(projectHubNativePartV139({x:10,y:20,w:40,h:5},{w:100,h:50},{x:200,y:300,w:200,h:100}),{x:220,y:340,w:80,h:10});
  assert.equal(projectHubNativePartV139({x:0,y:0,w:0,h:1},{w:100,h:100},{x:0,y:0,w:100,h:100}),null);
  assert.equal(projectHubNativePartV139({x:0,y:0,w:20,h:10},{w:100,h:50},{x:0,y:0,w:200,h:50}),null,'Unequal horizontal/vertical scale cannot establish a measured surface');
  assert.equal(getHubNativePropPlacementV139({id:'unknown'}),null);assert.deepEqual(rooms,original);
});
