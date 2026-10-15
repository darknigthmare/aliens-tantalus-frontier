import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS,HUB_WORLD,buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { HUB_ANNEX_ENTRANCES_V133 } from '../src/hub-navigation-layout-v133.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { resolveHubVehicleArtV58 } from '../src/hub-art-runtime-v58.js';
import { DROPSHIP_HANGAR_ART_V55 } from '../src/hub-art-runtime-v55.js';
import { HUB_PROP_ATLAS_V136 } from '../src/hub-prop-atlas-v136.js';
import { HUB_FURNISHING_ATLAS_V137 } from '../src/hub-furnishing-atlas-v137.js';
import { HUB_FURNITURE_ATLAS_V139 } from '../src/hub-furniture-atlas-v139.js';
import { getHubSupportPlanesV139 } from '../src/hub-support-planes-v139.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { getHubWorkstationDetailPlanV139 } from '../src/hub-workstation-details-v139.js';
import { fitHubPropBoundsV136,getHubInteractionPropBoundsV136,getHubStationInteractionBoundsV136,
  mapHubPropColliderV136,getHubVehiclePlacementV136 } from '../src/hub-prop-placements-v136.js';
import { HUB_ROOM_LIFE_V136,getHubRoomLifePlanV136,getHubRoomLifeMotionV136,
  drawHubRoomLifeV136,withHubRoomLifeV136 } from '../src/hub-room-life-v136.js';

const rooms=[...HUB_DECKS.flatMap(d=>d.rooms),...HUB_ANNEXES_V87.map(getHubAnnexRuntimeGeometryV139)];
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} differs from ${b}`);
function optionsFor(room){
  const deck=HUB_DECKS.findIndex(d=>d.rooms.includes(room));
  if(deck<0)return{ladders:room.ladders,vents:room.vents||[],platforms:room.platforms};
  const geometry=buildHubTraversalGeometryV87(deck);
  return{doors:buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck),ladders:geometry.ladders,vents:geometry.vents,platforms:geometry.platforms};
}
function renderer(){
  const calls=[],ctx=new Proxy({
    save(){calls.push(['save']);},restore(){calls.push(['restore']);},
    drawImage(...args){calls.push(['image',...args]);},fillRect(...args){calls.push(['fill',...args]);},
    translate(...args){calls.push(['translate',...args]);}
  },{get:(o,k)=>k in o?o[k]:()=>{}});
  return{ctx,calls,balanced(){assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);}};
}

test('all 29 rooms have deterministic task-specific, human-scale equipment on clear physical sockets',()=>{
  assert.deepEqual(Object.keys(HUB_ROOM_LIFE_V136).sort(),rooms.map(r=>r.id).sort());
  assert.equal(new Set(Object.values(HUB_ROOM_LIFE_V136).map(r=>r.task)).size,29);
  const before=structuredClone(rooms),usedCells=new Set();let total=0;
  for(const room of rooms){
    const options=optionsFor(room),plan=getHubRoomLifePlanV136(room,options);
    assert.deepEqual(getHubRoomLifePlanV136(room,options),plan);
    assert.ok(plan.items.length>=(room.id==='dropship-hangar'?3:4),room.id);
    assert.ok(plan.items.some(item=>[HUB_PROP_ATLAS_V136.asset,HUB_FURNISHING_ATLAS_V137.asset,HUB_FURNITURE_ATLAS_V139.asset].includes(item.asset)),room.id);
    total+=plan.items.length;
    for(const entry of plan.items){
      assert.ok(entry.w>0&&entry.h>0&&entry.h<=112,room.id);
      assert.equal(entry.collidable,false);assert.equal(entry.interactive,false);assert.equal(entry.plane,'rear');
      assert.equal(entry.projectionDxPerY,plan.spatial.projection.dxPerY);
      assert.ok(!plan.spatial.reservations.some(r=>overlap(entry,r)),`${room.id}:${entry.kind} occupies a critical socket`);
      if(entry.support==='rear-floor')near(entry.contactYV139??entry.y+entry.h,plan.spatial.planes.rearServiceY);
      if(entry.cell){
        if(entry.asset===HUB_PROP_ATLAS_V136.asset){usedCells.add(entry.cell);assert.ok(entry.w<=84,`${room.id} enlarges the small atlas`);}
        else if(entry.asset===HUB_FURNISHING_ATLAS_V137.asset){const cell=HUB_FURNISHING_ATLAS_V137.cells[entry.cell];assert.ok(cell,entry.cell);assert.ok(entry.w<=cell.maximumWidth,`${room.id} enlarges the furnishing`);}
        else{const cell=HUB_FURNITURE_ATLAS_V139.cells[entry.cell];assert.ok(cell,entry.cell);assert.ok(entry.w<=cell.source.w,`${room.id} enlarges the original furniture source`);}
        near(entry.w/entry.h,entry.source.w/entry.source.h);}
    }
    for(let a=0;a<plan.items.length;a++)for(let b=a+1;b<plan.items.length;b++)assert.ok(!overlap(plan.items[a],plan.items[b]),room.id);
  }
  assert.ok(total>=180&&total<=240,`Equipment density ${total} needs review`);
  assert.deepEqual([...usedCells].sort(),Object.keys(HUB_PROP_ATLAS_V136.cells).sort());
  assert.deepEqual(rooms,before);
});

test('clinical preparation uses real accessible carts or the reviewed decontamination worktop and handwash',()=>{
  for(const id of ['medical','science-lab']){
    const room=rooms.find(r=>r.id===id),plan=getHubRoomLifePlanV136(room,optionsFor(room));
    const cart=plan.items.find(i=>i.cell==='medical-trolley');assert.ok(cart,id);
    assert.equal(cart.support,'rear-floor');near(cart.contactYV139??cart.y+cart.h,plan.spatial.planes.rearServiceY);
    assert.ok(cart.h<50&&cart.w===48,id);
    assert.ok(!plan.spatial.reservations.some(r=>overlap(cart,r)),id);
  }
  const room=rooms.find(room=>room.id==='quarantine'),plan=getHubRoomLifePlanV136(room,optionsFor(room));
  const prep=plan.items.find(item=>item.role==='containment-clean-preparation');
  const wash=plan.items.find(item=>item.role==='containment-handwash');
  const clean=plan.items.find(item=>item.role==='sealed-clean-storage');
  assert.ok(prep&&wash&&clean,'The old trolley was explicitly replaced by a complete clean-entry group');
  assert.equal(prep.kind,'work-counter');assert.equal(prep.support,'rear-floor');
  near(prep.contactYV139??prep.y+prep.h,plan.spatial.planes.rearServiceY);
  assert.equal(wash.cell,'wall-handwash');assert.equal(wash.support,'rear-wall');
  assert.equal(clean.support,'rear-floor');
  const soap=getHubWorkstationDetailPlanV139(room,plan).items.find(item=>item.cell==='soap-towel-set');
  assert.ok(soap,'Clean preparation must carry its actual soap/towel set');
  assert.equal(soap.hostRole,prep.role);near(soap.contactY,soap.supportY);
  assert.ok(soap.target.x>=prep.x&&soap.target.x+soap.target.w<=prep.x+prep.w);
});

test('station image, interaction and one-way support share the measured useful parts and real contact plane',()=>{
  for(const room of HUB_DECKS.flatMap(d=>d.rooms)){
    const placement=room.propPlacementV139;assert.ok(placement,room.id);
    if(placement.visible===false){
      assert.equal(getHubInteractionPropBoundsV136(room),null);assert.equal(room.propCollisionBounds,null);
      assert.equal(room.propInteractionBounds,null);continue;
    }
    near(placement.opaqueFoot.y,getHubSupportPlanesV139(room).rearServiceY);
    near(room.propRenderBounds.y+placement.opaqueFoot.sourceY*placement.sizing.scale,placement.opaqueFoot.y);
    near(room.propRenderBounds.w/placement.source.w,room.propRenderBounds.h/placement.source.h);
    assert.deepEqual(getHubInteractionPropBoundsV136(room),room.propRenderBounds);
    if(room.propCollisionBounds){
      const b=room.propCollisionBounds,v=room.propRenderBounds;
      assert.ok(b.x>=v.x-1e-9&&b.x+b.w<=v.x+v.w+1e-9,room.id);
      assert.ok(b.y>=v.y-1e-9&&b.y+b.h<=v.y+v.h+1e-9,room.id);
      assert.equal(b.collisionMode,'one-way-top');
      near(b.y+b.h,placement.opaqueFoot.y);
      if(placement.usefulSurface)near(b.y,placement.usefulSurface.supportY);
    }
  }
  for(const room of HUB_ANNEXES_V87.slice(0,10).map(getHubAnnexRuntimeGeometryV139)){
    const placement=room.propPlacementV139,b=room.station.bounds,
      prop=room.props.find(p=>p.role==='console'),collider=room.colliders.find(c=>c.role==='station');
    assert.ok(placement&&b.h>0,room.id);
    near(placement.supportY,getHubSupportPlanesV139(room).rearServiceY);
    near(b.y+placement.footSourceY*placement.scale,placement.supportY);
    near(b.w/placement.source.w,placement.scale);near(b.h/placement.source.h,placement.scale);
    for(const key of ['x','y','w','h']){
      near(b[key],placement.renderBounds[key]);near(prop[key],b[key]);
      near(collider[key],placement.physicalBounds[key]);
    }
    near(collider.y+collider.h,placement.supportY);
    assert.deepEqual(collider,placement.colliders[0]);
    assert.equal(collider.collisionMode,'one-way-top');
    assert.deepEqual(getHubStationInteractionBoundsV136(room),placement.interactionBounds);
    const reported=getHubInteractionPropBoundsV136(room);
    for(const key of ['x','y','w','h'])near(reported[key],b[key]);
  }
  const medical=rooms.find(r=>r.id==='medical');
  assert.ok(medical.propPlacementV139.usefulSurface.bounds.w>96.5*1.2,'The actual mattress must fit an adult');
  near(medical.propCollisionBounds.y,medical.propPlacementV139.usefulSurface.supportY);
  assert.ok(medical.propPlacementV139.tableHeight>=45&&medical.propPlacementV139.tableHeight<=52);
});

test('APC and dropship retain uniform source scale and move their physical supports with their parking bay',()=>{
  for(const [roomId,actor] of [['vehicle-bay',resolveHubVehicleArtV58('vehicle-bay').vehicle],['dropship-hangar',DROPSHIP_HANGAR_ART_V55.dropship]]){
    const deck=HUB_DECKS.findIndex(d=>d.rooms.some(r=>r.id===roomId)),room=HUB_DECKS[deck].rooms.find(r=>r.id===roomId);
    const before=structuredClone(actor),placement=getHubVehiclePlacementV136(room,actor),target=placement.renderBounds;
    near(placement.scaleX,placement.scaleY);
    if(placement.opaqueFoot){
      near(target.y+placement.opaqueFoot.sourceY*placement.scale,624);
      near(placement.opaqueFoot.y,624);
      near(target.w/placement.source.w,target.h/placement.source.h);
    }else near(target.y+target.h,624);
    assert.ok(target.w>=360&&target.w<=811);
    const physical=buildHubObstacleGeometryV87(deck).filter(c=>c.actorId===actor.id);
    const expected=placement.collisionSegments.length?placement.collisionSegments:[placement.collisionBounds];
    assert.equal(physical.length,expected.length);
    for(let i=0;i<expected.length;i++)for(const key of ['x','y','w','h'])near(physical[i][key],expected[i][key]);
    for(const collider of expected){
      assert.ok(collider.x>=target.x&&collider.x+collider.w<=target.x+target.w+1e-9);
      assert.ok(collider.y>=target.y&&collider.y+collider.h<=624+1e-9);
    }
    const id=roomId==='vehicle-bay'?'logistics':'arrival-airlock',entrance=HUB_ANNEXES_V87.find(a=>a.id===id),socket=HUB_ANNEX_ENTRANCES_V133[id];
    assert.ok(!overlap(target,{x:room.xStart+socket.centerX-entrance.entrance.w/2,y:624-entrance.entrance.h,w:entrance.entrance.w,h:entrance.entrance.h}),`${roomId} overlaps a working entrance`);
    assert.deepEqual(actor,before);
  }
});

test('generic bounds mapping preserves inset supports and rejects impossible props',()=>{
  const source={x:100,y:400,w:200,h:200},target=fitHubPropBoundsV136(source,{height:100,footY:624});
  assert.deepEqual(target,{x:150,y:524,w:100,h:100});
  const mapped=mapHubPropColliderV136({x:120,y:530,w:160,h:70,role:'support'},source,target);
  assert.deepEqual(mapped,{x:160,y:589,w:80,h:35,role:'support'});
  assert.equal(fitHubPropBoundsV136({...source,w:0}),null);
  assert.equal(fitHubPropBoundsV136(source,{height:0}),null);
  assert.equal(fitHubPropBoundsV136(source,{height:-10}),null);
  assert.equal(fitHubPropBoundsV136(source,{footY:Infinity}),null);
  assert.equal(getHubInteractionPropBoundsV136({id:'unknown'}),null);
  assert.equal(getHubVehiclePlacementV136({},{}),null);
});

test('actual rendering crops all three admitted prop atlases, reports painted equipment and leaves the scene untouched',()=>{
  const atlas={complete:true,naturalWidth:HUB_PROP_ATLAS_V136.width,naturalHeight:HUB_PROP_ATLAS_V136.height},
    furnishingAtlas={complete:true,naturalWidth:HUB_FURNISHING_ATLAS_V137.width,naturalHeight:HUB_FURNISHING_ATLAS_V137.height},
    furnitureAtlas={complete:true,naturalWidth:HUB_FURNITURE_ATLAS_V139.width,naturalHeight:HUB_FURNITURE_ATLAS_V139.height},
    images=new Map([[HUB_PROP_ATLAS_V136.asset,atlas],[HUB_FURNISHING_ATLAS_V137.asset,furnishingAtlas],[HUB_FURNITURE_ATLAS_V139.asset,furnitureAtlas]]);
  let imagesDrawn=0,expectedImages=0;
  for(const room of rooms){
    const subject=renderer(),before=structuredClone(room),report=drawHubRoomLifeV136(subject.ctx,room,{...optionsFor(room),images,time:17});
    const atlasPaints=subject.calls.filter(c=>c[0]==='image'&&[atlas,furnishingAtlas,furnitureAtlas].includes(c[1]));imagesDrawn+=atlasPaints.length;
    const composition=getHubRoomLifePlanV136(room,optionsFor(room));
    expectedImages+=composition.items.filter(item=>images.has(item.asset)).length;
    assert.ok(atlasPaints.length>=1,room.id);
    for(const call of atlasPaints){
      assert.equal(call.length,10);const [sx,sy,sw,sh,x,y,w,h]=call.slice(2);
      assert.ok(sx>=0&&sy>=0&&sx+sw<=call[1].naturalWidth&&sy+sh<=call[1].naturalHeight);
      near(w/h,sw/sh);assert.ok([x,y,w,h].every(Number.isFinite));
    }
    assert.equal(report.items.filter(i=>images.has(i.source)).length,atlasPaints.length);
    for(const item of report.items){
      assert.ok(item.motif);
      const planned=composition.items.find(entry=>entry.role===item.role&&entry.kind===item.kind
        &&entry.x===item.bounds.x&&entry.y===item.bounds.y);assert.ok(planned,item.role);
      near(item.anchor.y,planned.contactYV139??planned.y+planned.h);
      near(item.anchor.x,planned.x+planned.w/2);
    }
    assert.deepEqual(room,before);subject.balanced();
  }
  assert.equal(imagesDrawn,expectedImages);
});

test('reduced motion freezes detail animation and normal operation stays subtle at extreme times',()=>{
  assert.deepEqual(getHubRoomLifeMotionV136(0,{reducedMotion:true}),getHubRoomLifeMotionV136(300,{reducedMotion:true}));
  for(const time of [-1000,0,1/120,1/60,300,1e8,NaN]){
    const motion=getHubRoomLifeMotionV136(time);
    assert.ok(motion.lamp>=.675&&motion.lamp<=.725);
    assert.ok(motion.status>=.59&&motion.status<=.71);
    assert.ok(motion.trace>=0&&motion.trace<1);
  }
});

test('the runtime wrapper leaves editor playtests intact and publishes detached render evidence',()=>{
  const subject=renderer(),room=HUB_DECKS[0].rooms[0];
  class Base{getSnapshot(){return{physics:{x:10,health:100}};}currentRoom(){return room;}drawVehicleBayActorV58(){return'native-vehicle';}}
  const Engine=withHubRoomLifeV136(Base),hub=new Engine();assert.equal(withHubRoomLifeV136(Engine),Engine);
  hub.propImages=new Map();hub.v51Vents=buildHubTraversalGeometryV87(0).vents;
  const report=hub.drawHubRoomDressingV136(subject.ctx,room);
  assert.equal(report.reservations.filter(r=>r.role==='native-vent').length,1,'The runtime passes its actual hatches into wall composition');
  const first=hub.getSnapshot();assert.ok(first.hubRoomLifeV136.current.items.length);
  first.hubRoomLifeV136.current.items[0].bounds.x=-999;
  assert.notEqual(hub.getSnapshot().hubRoomLifeV136.current.items[0].bounds.x,-999);
  hub.editorPlaytest=true;const count=subject.calls.length;
  assert.equal(hub.drawHubRoomDressingV136(subject.ctx,room),null);assert.equal(subject.calls.length,count);
  assert.equal(hub.drawVehicleBayActorV58(subject.ctx,room),'native-vehicle');
  assert.deepEqual(hub.getSnapshot().hubRoomLifeV136.rendered,[]);subject.balanced();
});
