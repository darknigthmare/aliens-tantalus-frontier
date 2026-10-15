import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import {HUB_DECKS,HUB_WORLD} from '../src/hub-game.js';
import {HUB_ANNEXES_V137} from '../src/hub-annex-registry-v137.js';
import {getHubAnnexRuntimeGeometryV139,HUB_ANNEX_STATION_IDS_V139} from '../src/hub-annex-runtime-geometry-v139.js';
import {HUB_ANNEX_STATION_ATLAS_V139} from '../src/hub-annex-station-atlas-v139.js';
import {buildHubDoorNetworkV58} from '../src/topology-coherence-v58.js';
import {buildHubTraversalGeometryV87} from '../src/hub-v51-runtime.js';
import {HUB_PROP_ATLAS_V136} from '../src/hub-prop-atlas-v136.js';
import {HUB_FURNISHING_ATLAS_V137} from '../src/hub-furnishing-atlas-v137.js';
import {HUB_FURNITURE_ATLAS_V139} from '../src/hub-furniture-atlas-v139.js';
import {HUB_SURFACE_DETAILS_ATLAS_V139} from '../src/hub-surface-details-atlas-v139.js';
import {getHubFurnishingFootSourceV139} from '../src/hub-furnishing-contact-v139.js';
import {getHubRoomLifePlanV136,drawHubRoomLifeV136,withHubRoomLifeV136} from '../src/hub-room-life-v136.js';
import {getHubWorkstationDetailPlanV139,getHubWorkstationSurfacesV139,drawHubWorkstationDetailsV139,HUB_WORKSTATION_DETAILS_V139} from '../src/hub-workstation-details-v139.js';
import {drawHubRoomDressingV134} from '../src/hub-room-dressing-v134.js';
import {getHubClinicalBayPlanV139,getHubClinicalBayReservationsV139,drawHubClinicalBayV139} from '../src/hub-clinical-bay-v139.js';
import {auditWeaponPngV120} from './audit-weapon-png-v120.mjs';
const rooms=[...HUB_DECKS.flatMap(deck=>deck.rooms),...HUB_ANNEXES_V137];
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
function optionsFor(room){const deck=HUB_DECKS.findIndex(deck=>deck.rooms.includes(room));if(deck<0)return{ladders:room.ladders,platforms:room.platforms};const g=buildHubTraversalGeometryV87(deck);return{doors:buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck),ladders:g.ladders,platforms:g.platforms};}
const composed=id=>{const room=rooms.find(row=>row.id===id);return{room,plan:getHubRoomLifePlanV136(room,optionsFor(room))};};
function browser(){let depth=0;const calls=[];const ctx=new Proxy({save(){depth++;},restore(){assert.ok(depth>0);depth--;},drawImage(...args){calls.push(['image',...args]);},fillRect(...args){calls.push(['fill',...args]);},moveTo(...args){calls.push(['move',...args]);},lineTo(...args){calls.push(['line',...args]);},ellipse(...args){calls.push(['ellipse',...args]);},scale(...args){calls.push(['scale',...args]);}}, {get:(target,key)=>key in target?target[key]:()=>{}});return{ctx,calls,balanced:()=>assert.equal(depth,0)};}
const images=()=>new Map([HUB_PROP_ATLAS_V136,HUB_FURNISHING_ATLAS_V137,HUB_FURNITURE_ATLAS_V139,HUB_SURFACE_DETAILS_ATLAS_V139].map(atlas=>[atlas.asset,{complete:true,naturalWidth:atlas.width,naturalHeight:atlas.height}]));

test('the active original furnishing crops use their measured opaque contact instead of transparent padding',()=>{
  for(const [number,atlas]of [[136,HUB_PROP_ATLAS_V136],[137,HUB_FURNISHING_ATLAS_V137],[139,HUB_FURNITURE_ATLAS_V139]]){
    const png=auditWeaponPngV120(fileURLToPath(new URL(`..${atlas.asset}`,import.meta.url)));
    assert.equal(png.sha256,atlas.sha256);
    for(const cell of Object.values(atlas.cells)){
      if(cell.admitted===false)continue;
      const source=cell.source;let last=-1;
      for(let y=0;y<source.h;y++)for(let x=0;x<source.w;x++)if(png.pixelAlpha(source.x+x,source.y+y)>=192)last=y;
      assert.equal(getHubFurnishingFootSourceV139(number,cell),last+1,`${number}:${cell.id} physical foot`);
    }
  }
});

test('every one of 35 rooms has deliberate supported detail slots, and zero hidden failed groups',()=>{
  assert.equal(rooms.length,35);assert.deepEqual(Object.keys(HUB_WORKSTATION_DETAILS_V139).sort(),rooms.map(room=>room.id).sort());
  for(const room of rooms){const plan=getHubRoomLifePlanV136(room,optionsFor(room)),details=plan.workstationDetailsV139;
    assert.deepEqual(plan.furnishingV137.rejected,[],room.id);assert.deepEqual(details.omitted,[],room.id);
    assert.equal(details.items.length,HUB_WORKSTATION_DETAILS_V139[room.id].slots.length,room.id);
    assert.ok(details.surfaces.every(surface=>surface.kind!=='mattress'),`${room.id}: a mattress is exposed as a preparation surface`);
    for(const detail of details.items){
      near(detail.scaleX,detail.scaleY);assert.ok(detail.scaleX<=1&&detail.scaleX>0);near(detail.contactY,detail.supportY);
      const host=details.surfaces.find(surface=>surface.id===detail.surfaceId);assert.ok(host);assert.notEqual(host.kind,'mattress');
      assert.ok(detail.target.x>=host.bounds.x&&detail.target.x+detail.target.w<=host.bounds.x+host.bounds.w);
      near(detail.target.y+detail.sourceFootY*detail.scaleY,host.supportY);
      for(const occupied of host.occupied)assert.ok(!overlap(detail.target,occupied),`${room.id}:${detail.role} crosses painted material`);
      for(const entry of plan.items.filter(entry=>entry.role!==detail.hostRole))assert.ok(!overlap(detail.target,entry),`${room.id}:${detail.role} crosses ${entry.role}`);
      assert.equal(detail.interactive,false);assert.equal(detail.collidable,false);
    }
    if(room.id==='maintenance-spine'){
      assert.equal(plan.spatial.projection.dxPerY,19/12);assert.equal(details.items.length,0);
      assert.ok(plan.items.filter(item=>item.support==='rear-floor').every(item=>item.kind!=='bitmap'),'Unmeasured frontal floor art in the oblique room');
    }else{assert.equal(plan.spatial.projection.dxPerY,0);assert.equal(plan.spatial.planes.rearServiceY,624);}
  }
});

test('the ten admitted annex stations reserve their real derived bodies and expose only measured non-mattress surfaces',()=>{
  assert.equal(HUB_ANNEX_STATION_IDS_V139.length,10);
  for(const id of HUB_ANNEX_STATION_IDS_V139){
    const canonical=HUB_ANNEXES_V137.find(room=>room.id===id),before=structuredClone(canonical);
    const room=getHubAnnexRuntimeGeometryV139(canonical),placement=room.propPlacementV139;
    assert.ok(placement,id);assert.equal(placement.asset,HUB_ANNEX_STATION_ATLAS_V139.asset);
    assert.equal(getHubAnnexRuntimeGeometryV139(room),room);assert.deepEqual(canonical,before);
    near(placement.renderBounds.y+placement.footSourceY*placement.scale,624);near(placement.supportY,624);
    const plan=getHubRoomLifePlanV136(canonical,optionsFor(canonical));
    const reservation=plan.spatial.reservations.find(entry=>entry.role==='native-service');
    assert.ok(reservation&&reservation.x<=placement.renderBounds.x&&reservation.y<=placement.renderBounds.y);
    assert.ok(reservation.x+reservation.w>=placement.renderBounds.x+placement.renderBounds.w);
    assert.ok(reservation.y+reservation.h>=placement.supportY);
    const nativeSurfaces=plan.workstationDetailsV139.surfaces.filter(surface=>surface.hostType==='native');
    if(placement.usefulSurface&&placement.usefulSurface.kind!=='mattress'){
      assert.equal(nativeSurfaces.length,1);assert.deepEqual(nativeSurfaces[0].bounds,placement.usefulSurface.bounds);
      assert.deepEqual(nativeSurfaces[0].occupied,placement.usefulSurface.occupied);
    }else assert.deepEqual(nativeSurfaces,[],id+' exposes an invented or mattress worktop');
  }
});

test('occupied native tops and mattresses cannot silently become new work surfaces',()=>{
  const{room,plan}=composed('mess'),native=room.propPlacementV139;
  const surfaces=getHubWorkstationSurfacesV139(room,plan);assert.ok(surfaces.find(surface=>surface.hostType==='native').occupied.length>=3);
  const occupied={...native,usefulSurface:{...native.usefulSurface,occupied:[{...native.usefulSurface.bounds,y:native.usefulSurface.supportY-100,h:110}]}};
  const blocked=getHubWorkstationDetailPlanV139(room,plan,{nativePlacement:occupied});assert.equal(blocked.items.length,0);assert.equal(blocked.omitted.length,2);
  assert.ok(blocked.omitted.every(entry=>entry.reason==='occupied-useful-surface'));
  const medical=composed('medical');assert.ok(!getHubWorkstationSurfacesV139(medical.room,medical.plan).some(surface=>surface.kind==='mattress'));
  const absent=getHubWorkstationDetailPlanV139({id:'cryo-bay'},{items:[],spatial:{reservations:[]}});
  assert.deepEqual(absent.items,[]);assert.equal(absent.omitted[0].reason,'no-declared-useful-surface');
});

test('actual loaded crops paint on their host, and missing or wrongly sized atlas pixels remain pending',()=>{
  const {plan}=composed('medical'),browser1=browser(),detailPlan=plan.workstationDetailsV139;
  const missing=drawHubWorkstationDetailsV139(browser1.ctx,detailPlan,{images:new Map()});assert.equal(missing.painted.length,0);assert.equal(missing.pending.length,2);
  const wrong=drawHubWorkstationDetailsV139(browser1.ctx,detailPlan,{images:new Map([[HUB_SURFACE_DETAILS_ATLAS_V139.asset,{complete:true,naturalWidth:1,naturalHeight:1}]])});assert.equal(wrong.painted.length,0);
  const rendered=drawHubWorkstationDetailsV139(browser1.ctx,detailPlan,{images:images(),resolveDrawable:image=>image});assert.equal(rendered.painted.length,2);assert.deepEqual(rendered.pending,[]);
  for(const item of rendered.painted){const call=browser1.calls.filter(call=>call[0]==='image').find(call=>call[6]===item.target.x);assert.deepEqual(call.slice(2),[item.source.x,item.source.y,item.source.w,item.source.h,item.target.x,item.target.y,item.target.w,item.target.h]);}
  browser1.balanced();
});

test('native support is painted after its host and reported independently of preparation-counter details',()=>{
  const {room}=composed('mess');class Base{constructor(){this.propImages=new Map();this.doorStates=optionsFor(room).doors;this.v51Ladders=optionsFor(room).ladders;this.v51Platforms=optionsFor(room).platforms;}drawInteractionProp(){return'native-host';}getSnapshot(){return{};}currentRoom(){return room;}}
  const Subject=withHubRoomLifeV136(Base),hub=new Subject(),b=browser();hub.hubLifeImagesV136=images();hub.drawHubRoomDressingV136(b.ctx,room);
  assert.equal(hub.drawInteractionProp(b.ctx,room),'native-host');assert.equal(hub.getSnapshot().hubRoomLifeV136.current.workstationDetailsV139.painted.length,0);assert.equal(hub.getSnapshot().hubRoomLifeV136.current.workstationDetailsV139.pending.length,2);
  hub.propImages.set(room.propPlacementV139.asset,{complete:true,naturalWidth:1254,naturalHeight:1254});hub.drawInteractionProp(b.ctx,room);
  const snapshot=hub.getSnapshot().hubRoomLifeV136.current.workstationDetailsV139;assert.equal(snapshot.painted.length,2);assert.deepEqual(snapshot.pending,[]);assert.equal(snapshot.surfaces.find(surface=>surface.hostType==='native').supportY,room.propPlacementV139.usefulSurface.supportY);
  hub.editorPlaytest=true;assert.equal(hub.drawHubWorkstationSurfaceDetailsV139(b.ctx,room),null);b.balanced();
});

test('the medical bay derives a coherent clinical group from the actual bed without closing its visible care side',()=>{
  const {room,plan}=composed('medical'),bay=plan.clinicalBayV139;assert.ok(bay);assert.deepEqual(bay.bed,room.propPlacementV139.renderBounds);
  assert.deepEqual(getHubClinicalBayPlanV139(room,plan),bay);assert.equal(bay.supportY,624);
  assert.deepEqual(bay.reservations,getHubClinicalBayReservationsV139(room));
  assert.deepEqual(plan.spatial.reservations.filter(entry=>entry.role==='clinical-upper-headwall'),bay.reservations);
  assert.equal(bay.reservations[0].y+bay.reservations[0].h,bay.bed.y);
  assert.ok(bay.preparation.bounds.x+bay.preparation.bounds.w<bay.trolley.bounds.x);
  assert.ok(bay.trolley.bounds.x+bay.trolley.bounds.w<bay.bed.x);
  assert.ok(bay.hygiene.bounds.x>bay.bed.x+bay.bed.w);
  assert.ok(bay.sterileStock.bounds.x>bay.hygiene.bounds.x+bay.hygiene.bounds.w);
  assert.equal(bay.access.side,'visible-long-side');assert.equal(bay.access.obstructingFrame,false);
  for(const part of bay.parts.filter(part=>part.kind!=='wall-lining'))for(const entry of plan.items)assert.ok(!overlap(part.bounds,entry),`${part.id} intersects ${entry.role}`);
  const light=bay.parts.find(part=>part.kind==='task-light');assert.ok(light.bounds.y+light.bounds.h<bay.bed.y);
  const b=browser(),drawn=drawHubClinicalBayV139(b.ctx,bay);assert.equal(drawn.paintedPartIds.length,4);b.balanced();
  assert.equal(getHubClinicalBayPlanV139({...room,id:'mess'},plan),null);
});

test('procedural furniture uses flat elevations in 2D and the common positive 19/12 depth vector in the oblique compartment',()=>{
  const render=(kind,projectionDxPerY)=>{const b=browser(),entry={kind,x:0,y:0,w:100,h:76,role:'fixture',support:'rear-wall',projectionDxPerY};drawHubRoomDressingV134(b.ctx,{id:'test'},{composition:{start:0,top:0,width:1280,floorY:624,accent:'#8a9',items:[entry]}});b.balanced();return b.calls;};
  for(const kind of ['work-counter','locker','bench','chair','stool','cylinder']){
    const calls=render(kind,0);assert.ok(!calls.some(call=>call[0]==='line'),`${kind} retains a depth polygon in a flat room`);assert.ok(!calls.some(call=>call[0]==='ellipse'),`${kind} retains a visible horizontal cap in a flat room`);
  }
  const calls=render('work-counter',19/12),diagonal=calls.find(call=>call[0]==='line'&&call[1]===100&&call[2]>0);assert.ok(diagonal);near((100-(calls.find(call=>call[0]==='line')[1]))/diagonal[2],19/12);
  const mess=composed('mess').plan,west=mess.items.find(item=>item.role==='mess-west-dining-seat'),east=mess.items.find(item=>item.role==='mess-east-dining-seat');assert.equal(west.mirroredV139,true);assert.equal(east.mirroredV139,false);
  const cctv=composed('cctv').plan;assert.equal(cctv.items.find(item=>item.role==='security-watch-seat').mirroredV139,true);
});
