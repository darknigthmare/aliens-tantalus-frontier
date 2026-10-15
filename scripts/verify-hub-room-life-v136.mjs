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
import { fitHubPropBoundsV136,getHubPropHeightV136,getHubInteractionPropBoundsV136,
  mapHubPropColliderV136,getHubVehiclePlacementV136 } from '../src/hub-prop-placements-v136.js';
import { HUB_ROOM_LIFE_V136,getHubRoomLifePlanV136,getHubRoomLifeMotionV136,
  drawHubRoomLifeV136,withHubRoomLifeV136 } from '../src/hub-room-life-v136.js';

const rooms=[...HUB_DECKS.flatMap(d=>d.rooms),...HUB_ANNEXES_V87];
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} differs from ${b}`);
function optionsFor(room){
  const deck=HUB_DECKS.findIndex(d=>d.rooms.includes(room));
  if(deck<0)return{ladders:room.ladders,platforms:room.platforms};
  const geometry=buildHubTraversalGeometryV87(deck);
  return{doors:buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck),ladders:geometry.ladders,platforms:geometry.platforms};
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
    assert.ok(plan.items.some(item=>item.asset===HUB_PROP_ATLAS_V136.asset||item.asset===HUB_FURNISHING_ATLAS_V137.asset),room.id);
    total+=plan.items.length;
    for(const entry of plan.items){
      assert.ok(entry.w>0&&entry.h>0&&entry.h<=112,room.id);
      assert.equal(entry.collidable,false);assert.equal(entry.interactive,false);assert.equal(entry.plane,'rear');
      assert.equal(entry.projectionDxPerY,19/12);
      assert.ok(!plan.spatial.reservations.some(r=>overlap(entry,r)),`${room.id}:${entry.kind} occupies a critical socket`);
      if(entry.support==='rear-floor')near(entry.y+entry.h,plan.spatial.planes.rearServiceY);
      if(entry.cell){
        if(entry.asset===HUB_PROP_ATLAS_V136.asset){usedCells.add(entry.cell);assert.ok(entry.w<=84,`${room.id} enlarges the small atlas`);}
        else{const cell=HUB_FURNISHING_ATLAS_V137.cells[entry.cell];assert.ok(cell,entry.cell);assert.ok(entry.w<=cell.maximumWidth,`${room.id} enlarges the furnishing`);}
        near(entry.w/entry.h,entry.source.w/entry.source.h);}
    }
    for(let a=0;a<plan.items.length;a++)for(let b=a+1;b<plan.items.length;b++)assert.ok(!overlap(plan.items[a],plan.items[b]),room.id);
  }
  assert.ok(total>=180&&total<=240,`Equipment density ${total} needs review`);
  assert.deepEqual([...usedCells].sort(),Object.keys(HUB_PROP_ATLAS_V136.cells).sort());
  assert.deepEqual(rooms,before);
});

test('clinical carts use bedside preparation sockets instead of the occupied annex doorways',()=>{
  for(const id of ['medical','science-lab','quarantine']){
    const room=rooms.find(r=>r.id===id),plan=getHubRoomLifePlanV136(room,optionsFor(room));
    const cart=plan.items.find(i=>i.cell==='medical-trolley');assert.ok(cart,id);
    assert.equal(cart.support,'rear-floor');near(cart.y+cart.h,600);
    assert.ok(cart.h<50&&cart.w===48,id);
    assert.ok(!plan.spatial.reservations.some(r=>overlap(cart,r)),id);
  }
});

test('station image, interaction and one-way landing support share the same reduced source proportions',()=>{
  for(const room of HUB_DECKS.flatMap(d=>d.rooms)){
    assert.equal(room.propRenderBounds.h,getHubPropHeightV136(room.id));
    near(room.propRenderBounds.y+room.propRenderBounds.h,624);
    assert.deepEqual(getHubInteractionPropBoundsV136(room),room.propRenderBounds);
    if(room.propCollisionBounds){
      const b=room.propCollisionBounds,v=room.propRenderBounds;
      assert.ok(b.x>=v.x-1e-9&&b.x+b.w<=v.x+v.w+1e-9,room.id);
      assert.ok(b.y>=v.y-1e-9&&b.y+b.h<=v.y+v.h+1e-9,room.id);
      assert.equal(b.collisionMode,'one-way-top');
    }
  }
  for(const room of HUB_ANNEXES_V87.slice(0,10)){
    const b=room.station.bounds,prop=room.props.find(p=>p.role==='console'),collider=room.colliders.find(c=>c.role==='station');
    assert.ok(b.h<=108+1e-9&&b.h>0,room.id);near(b.y+b.h,624);
    for(const key of ['x','y','w','h']){near(prop[key],b[key]);near(collider[key],b[key]);}
    assert.equal(collider.collisionMode,'one-way-top');
    const reported=getHubInteractionPropBoundsV136(room);
    for(const key of ['x','y','w','h'])near(reported[key],b[key]);
  }
  const medical=rooms.find(r=>r.id==='medical');
  assert.ok(medical.propRenderBounds.w>96.5*1.2,'The adult bed must be longer than a standing human');
  assert.equal(medical.propCollisionBounds.y,580,'The mattress supports a landing below the high monitor');
  assert.equal(medical.propCollisionBounds.h,44);
});

test('APC and dropship retain uniform source scale and move their physical supports with their parking bay',()=>{
  for(const [roomId,actor] of [['vehicle-bay',resolveHubVehicleArtV58('vehicle-bay').vehicle],['dropship-hangar',DROPSHIP_HANGAR_ART_V55.dropship]]){
    const deck=HUB_DECKS.findIndex(d=>d.rooms.some(r=>r.id===roomId)),room=HUB_DECKS[deck].rooms.find(r=>r.id===roomId);
    const before=structuredClone(actor),placement=getHubVehiclePlacementV136(room,actor),target=placement.renderBounds;
    near(placement.scaleX,placement.scaleY);near(target.y+target.h,624);
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

test('actual rendering crops both admitted atlases, reports painted equipment and leaves the scene untouched',()=>{
  const atlas={complete:true,naturalWidth:HUB_PROP_ATLAS_V136.width,naturalHeight:HUB_PROP_ATLAS_V136.height},
    furnishingAtlas={complete:true,naturalWidth:HUB_FURNISHING_ATLAS_V137.width,naturalHeight:HUB_FURNISHING_ATLAS_V137.height},
    images=new Map([[HUB_PROP_ATLAS_V136.asset,atlas],[HUB_FURNISHING_ATLAS_V137.asset,furnishingAtlas]]);
  let imagesDrawn=0;
  for(const room of rooms){
    const subject=renderer(),before=structuredClone(room),report=drawHubRoomLifeV136(subject.ctx,room,{...optionsFor(room),images,time:17});
    const atlasPaints=subject.calls.filter(c=>c[0]==='image'&&(c[1]===atlas||c[1]===furnishingAtlas));imagesDrawn+=atlasPaints.length;
    assert.ok(atlasPaints.length>=1,room.id);
    for(const call of atlasPaints){
      assert.equal(call.length,10);const [sx,sy,sw,sh,x,y,w,h]=call.slice(2);
      assert.ok(sx>=0&&sy>=0&&sx+sw<=atlas.naturalWidth&&sy+sh<=atlas.naturalHeight);
      near(w/h,sw/sh);assert.ok([x,y,w,h].every(Number.isFinite));
    }
    assert.equal(report.items.filter(i=>[HUB_PROP_ATLAS_V136.asset,HUB_FURNISHING_ATLAS_V137.asset].includes(i.source)).length,atlasPaints.length);
    for(const item of report.items){assert.ok(item.motif);assert.equal(item.anchor.y,item.bounds.y+item.bounds.h);}
    assert.deepEqual(room,before);subject.balanced();
  }
  assert.ok(imagesDrawn>=40);
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
  hub.propImages=new Map();hub.drawHubRoomDressingV136(subject.ctx,room);
  const first=hub.getSnapshot();assert.ok(first.hubRoomLifeV136.current.items.length);
  first.hubRoomLifeV136.current.items[0].bounds.x=-999;
  assert.notEqual(hub.getSnapshot().hubRoomLifeV136.current.items[0].bounds.x,-999);
  hub.editorPlaytest=true;const count=subject.calls.length;
  assert.equal(hub.drawHubRoomDressingV136(subject.ctx,room),null);assert.equal(subject.calls.length,count);
  assert.equal(hub.drawVehicleBayActorV58(subject.ctx,room),'native-vehicle');
  assert.deepEqual(hub.getSnapshot().hubRoomLifeV136.rendered,[]);subject.balanced();
});
