import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { HubGame, HUB_ANNEX_ART_ROLES_V71 } from '../src/hub-v71-runtime.js';
import { HubGame as ProvingHubGame } from '../src/hub-v81-runtime.js';
import { getHubSupportPlanesV139 } from '../src/hub-support-planes-v139.js';
import { HUB_ANNEX_STATION_IDS_V139, getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { HUB_ANNEX_STATION_ATLAS_V139 as atlas, getHubAnnexStationCellV139 } from '../src/hub-annex-station-atlas-v139.js';
import { getHubAnnexFixturePlanV138 } from '../src/hub-annex-fixtures-v138.js';
import { getHubSpatialPlanV136 } from '../src/hub-spatial-design-v136.js';
import { getHubRoomProjectionV139 } from '../src/hub-room-projection-v139.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
const reviewed=HUB_ANNEXES_V137.filter(room=>HUB_ANNEX_STATION_IDS_V139.includes(room.id));
const nativeSubject=room=>({hubCommercialStateV71:{activeAnnexId:room.id},player:{w:44,h:92},
  currentAnnexV71:HubGame.prototype.currentAnnexV71,annexSolidCollidersV71:HubGame.prototype.annexSolidCollidersV71});
const box=b=>Object.fromEntries(['x','y','w','h'].map(key=>[key,b[key]]));
function assertNativeAssetCache(source){
  const previous=globalThis.Image;
  class NativeImage {constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}}
  globalThis.Image=NativeImage;
  try{
    const roles=source.artRoles||HUB_ANNEX_ART_ROLES_V71;
    const group=new Map(roles.map(role=>[role,{src:source.art[role]}]));
    const originalFar=group.get('far'),oldProp=group.get('prop');
    const subject={annexImagesV71:new Map([[source.id,group]]),annexModularImagesV72:new Map(),
      annexArtSourcesV139:new Map([[source.id,new Map(roles.map(role=>[role,source.art[role]]))]])};
    const loaded=HubGame.prototype.ensureAnnexAssetsV71.call(subject,source.id),prop=loaded.get('prop');
    assert.equal(loaded,group);assert.notEqual(prop,oldProp);assert.equal(prop.src,atlas.asset);assert.equal(loaded.get('far'),originalFar);
    assert.equal(HubGame.prototype.ensureAnnexAssetsV71.call(subject,source.id).get('prop'),prop);
  }finally{if(previous===undefined)delete globalThis.Image;else globalThis.Image=previous;}
}

test('ten admitted frontal native stations use real opaque192 feet and preserve their historical registry records',()=>{
  assert.equal(atlas.admitted,true);assert.equal(reviewed.length,10);assert.equal(Object.keys(atlas.cells).length,10);
  const png=auditWeaponPngV120(fileURLToPath(new URL(`..${atlas.asset}`,import.meta.url)));
  assert.equal(png.sha256,atlas.sha256);assert.equal(png.width,atlas.width);assert.equal(png.height,atlas.height);
  assert.ok(png.transparentPixels>png.width*png.height*.25);let replaced=0;
  const cells=Object.values(atlas.cells),paintedCounts=cells.map(()=>0);
  for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++){
    if(png.pixelAlpha(x,y)<=32)continue;
    const matches=cells.flatMap((cell,index)=>{const s=cell.source;return x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h?[index]:[];});
    assert.equal(matches.length,1,`Native station crop clips or duplicates visible source pixel ${x},${y}`);paintedCounts[matches[0]]++;
  }
  for(const count of paintedCounts)assert.ok(count>2000);
  for(const source of HUB_ANNEXES_V137){
    const original=structuredClone(source),runtime=getHubAnnexRuntimeGeometryV139(source);
    if(HUB_ANNEX_STATION_IDS_V139.includes(source.id)){
      replaced++;assert.notEqual(runtime,source);assert.equal(Object.isFrozen(runtime),true);
      const cell=getHubAnnexStationCellV139(source.id),p=runtime.propPlacementV139,s=cell.source;
      assert.equal(getHubRoomProjectionV139(source).mode,'2d');assert.equal(cell.projection,'strict-side-elevation');
      assert.equal(runtime.art.prop,atlas.asset);assert.equal(runtime.station.id,source.station.id);
      assert.equal(runtime.station.action,source.station.action);assert.equal(runtime.station.upgradeId,source.station.upgradeId);
      near(p.renderBounds.w/s.w,p.renderBounds.h/s.h);near(p.renderBounds.y+cell.footSourceY*p.scale,624);
      assert.ok(p.renderBounds.w<=source.station.bounds.w+1e-8&&p.renderBounds.h<=source.station.bounds.h+1e-8);
      const foot=s.y+cell.footSourceY;
      assert.ok(Array.from({length:s.w},(_,x)=>png.pixelAlpha(s.x+x,foot-1)).some(alpha=>alpha>=192),source.id);
      for(let y=foot;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++)assert.ok(png.pixelAlpha(x,y)<192,source.id+' has hard pixels below its declared foot');
      assert.equal(runtime.annexRuntimeGeometryV139.registryPreserved,true);assert.equal(runtime.annexRuntimeGeometryV139.artReplaced,true);
      assert.equal(runtime.annexRuntimeGeometryV139.physicalStationRelocated,true);
      if(source.id==='morgue'){
        assert.equal(p.capacity,'lying-adult');assert.equal(p.usefulSurface.kind,'mattress');
        assert.ok(p.usefulSurface.bounds.w>=110);assert.ok(p.capacitySources.usefulHeight>=46&&p.capacitySources.usefulHeight<=52);
      }
    }else assert.equal(runtime,source);
    assert.deepEqual(source,original);
  }
  assert.equal(replaced,10);assert.equal(png.pixelEdits,false);
  for(const historical of HUB_ANNEXES_V87)assert.equal(HUB_ANNEXES_V137.find(room=>room.id===historical.id),historical);
});

test('only the ten bound props and physical station tops change while every access, cargo and pipe reference remains canonical',()=>{
  let colliders=0,props=0;
  for(const source of reviewed){
    const room=getHubAnnexRuntimeGeometryV139(source),meta=room.annexRuntimeGeometryV139,p=room.propPlacementV139;
    for(let index=0;index<source.props.length;index++){
      const before=source.props[index],after=room.props[index];
      if(meta.movedPropIds.includes(before.id)){
        props++;assert.notEqual(after,before);assert.deepEqual(box(after),box(room.station.bounds));
        assert.equal(after.id,before.id);assert.equal(after.role,before.role);assert.equal(after.collidable,before.collidable);
      }else assert.equal(after,before);
    }
    for(let index=0;index<source.colliders.length;index++){
      const before=source.colliders[index],after=room.colliders[index];
      if(meta.movedColliderIds.includes(before.id)){
        colliders++;assert.notEqual(after,before);assert.deepEqual(box(after),p.physicalBounds);
        assert.equal(after.id,before.id);assert.equal(after.collisionMode,'one-way-top');near(after.y+after.h,624);
        assert.ok(after.h>0&&after.h<=108);assert.equal(p.colliders[0],after);
        if(source.id==='morgue')near(after.y,p.usefulSurface.supportY);
      }else assert.equal(after,before);
    }
    for(const key of ['id','world','entrance','parentDoorBounds','platforms','ladders','connectionIds','artRoles'])assert.equal(room[key],source[key]);
    for(const key of Object.keys(source.art).filter(key=>!['prop','alphaBounds'].includes(key)))assert.equal(room.art[key],source.art[key]);
    for(const key of Object.keys(source.art.alphaBounds).filter(key=>key!=='prop'))assert.equal(room.art.alphaBounds[key],source.art.alphaBounds[key]);
  }
  assert.equal(props,10);assert.equal(colliders,10);
});

test('repeated and copied runtime views fit once and F7 cannot move a physical support or change the compartment projection',()=>{
  for(const source of reviewed){
    const room=getHubAnnexRuntimeGeometryV139(source);
    assert.equal(getHubAnnexRuntimeGeometryV139(source),room);assert.equal(getHubAnnexRuntimeGeometryV139(room),room);
    const translated={...room,xStart:90000};assert.equal(getHubAnnexRuntimeGeometryV139(translated),translated);
    assert.deepEqual(getHubSupportPlanesV139(room,{depthEnabled:false}),getHubSupportPlanesV139(room));
    near(room.propPlacementV139.supportY,624);assert.deepEqual(getHubAnnexRuntimeGeometryV139(room).propPlacementV139,room.propPlacementV139);
  }
});

test('unbound, malformed, unknown and opaque future records are not repainted or given invented station solids',()=>{
  const room=reviewed[0];
  for(const candidate of [null,undefined,{schema:140,registryVersion:900,opaque:{owner:'future'}},
    {...room,id:'future-unknown-annex'}, {...room,annexRuntimeGeometryV139:{schema:900,opaque:{owner:'future'}}},
    {...room,station:{...room.station,id:'unbound-station'}},
    {...room,props:room.props.filter(prop=>prop.role!=='console')},
    {...room,colliders:room.colliders.filter(collider=>collider.role!=='station')},
    {...room,station:{...room.station,bounds:{...room.station.bounds,y:NaN}}}])
    assert.equal(getHubAnnexRuntimeGeometryV139(candidate),candidate);
});

test('production getter, prompt, bitmap sampling, reserved image and physical support all consume the same runtime station view',()=>{
  for(const source of reviewed){
    const subject=nativeSubject(source),room=subject.currentAnnexV71(),b=room.station.bounds,p=room.propPlacementV139;
    assert.equal(room,getHubAnnexRuntimeGeometryV139(source));subject.player={x:b.x+b.w/2-22,y:532,w:44,h:92};
    const interaction=HubGame.prototype.nearestAnnexStationV71.call(subject);
    assert.equal(interaction.id,source.station.id);assert.deepEqual(interaction.bounds,b);
    const samples=[];subject.drawCroppedBitmapV72=(_ctx,_image,crop,target)=>samples.push({crop,target});subject.nearestAnnexStationV71=()=>null;
    HubGame.prototype.drawAnnexPropLayerV71.call(subject,{},room,{complete:true,naturalWidth:atlas.width,naturalHeight:atlas.height});
    assert.deepEqual(samples,[{crop:room.art.alphaBounds.prop,target:b}]);
    for(const key of ['x','y','w','h'])near(subject.annexNativePlacementRenderedV139.target[key],p.renderBounds[key]);
    assert.equal(subject.annexNativePlacementRenderedV139.asset,atlas.asset);
    assert.deepEqual(subject.annexNativePlacementRenderedV139.placement,p);
    assertNativeAssetCache(source);
    if(source.id==='proving-ground'){
      subject.ensureProvingGroundAssetsV81=()=>assert.fail('The admitted runtime atlas must bypass the old range-console source');
      ProvingHubGame.prototype.drawAnnexPropLayerV71.call(subject,{},room,{complete:true,naturalWidth:atlas.width,naturalHeight:atlas.height});
      assert.deepEqual(samples.at(-1),{crop:room.art.alphaBounds.prop,target:b});
      assert.equal(subject.provingGroundConsoleRenderedV136.asset,atlas.asset);
      assert.deepEqual(subject.provingGroundConsoleRenderedV136.sourceOpaqueBounds,room.art.alphaBounds.prop);
      assert.equal(subject.provingGroundConsoleRenderedV136.footAlphaThreshold,192);
      for(const key of ['x','y','w','h'])near(subject.provingGroundConsoleRenderedV136.bounds[key],p.renderBounds[key]);
    }
    const fixture=getHubAnnexFixturePlanV138(source),spatial=getHubSpatialPlanV136(source);
    assert.deepEqual(fixture.stationSupport.bounds,box(b));near(fixture.stationSupport.supportY,624);
    assert.deepEqual(fixture.stationSupport.physicalBounds,p.physicalBounds);
    assert.ok(spatial.reservations.some(reservation=>reservation.role==='native-service'
      &&reservation.x<=b.x&&reservation.y<=b.y&&reservation.x+reservation.w>=b.x+b.w&&reservation.y+reservation.h>=b.y+b.h));
    assert.equal(fixture.registryPreserved,true);assert.equal(fixture.physicalStationRelocated,true);assert.equal(fixture.geometryPreserved,false);
  }
});

test('real vertical collision supports each new physical top and preserves the624 floor plus all five noncolliding service heroes',()=>{
  let supported=0;
  for(const source of reviewed){
    const subject=nativeSubject(source),room=getHubAnnexRuntimeGeometryV139(source),b=room.propPlacementV139.physicalBounds;
    supported++;subject.player={x:b.x+b.w/2-22,y:b.y-92+4,w:44,h:92,vy:120,grounded:false};
    HubGame.prototype.resolveAnnexVerticalV71.call(subject,room,b.y-4);
    near(subject.player.y+subject.player.h,b.y);assert.equal(subject.player.grounded,true);
    subject.player={x:40,y:624-92+4,w:44,h:92,vy:120,grounded:false};
    HubGame.prototype.resolveAnnexVerticalV71.call(subject,room,620);
    near(subject.player.y+subject.player.h,624);assert.equal(subject.player.grounded,true);
  }
  assert.equal(supported,10);
  for(const id of ['flight-control-cockpit','galley-service','sanitary-bay','engine-room','water-recycling']){
    const source=HUB_ANNEXES_V137.find(room=>room.id===id);assert.equal(getHubAnnexRuntimeGeometryV139(source),source);
    assert.equal(source.colliders.filter(collider=>collider.role==='station').length,0);
  }
});

test('old canonical and staged600 saves keep their exact pose and settle onto the reachable replacement top without rewriting opaque stored fields',()=>{
  for(const source of reviewed){
    const subject=nativeSubject(source),room=getHubAnnexRuntimeGeometryV139(source),physical=room.propPlacementV139.physicalBounds;
    for(const previousOffset of [0,-24]){
      const state={annexPositionX:source.station.bounds.x+source.station.bounds.w/2-22,
        annexPositionY:source.station.bounds.y-92+previousOffset,annexClimbing:false,
        registryVersion:900,opaque:{owner:'future',counter:73}};
      const before=structuredClone(state),pose=HubGame.prototype.restoreAnnexPlayerPoseV71.call(subject,room,state);
      near(pose.x,state.annexPositionX);near(pose.y,state.annexPositionY);assert.deepEqual(state,before);
      subject.player={...pose,w:44,h:92,vy:160,grounded:false};
      for(let step=0;step<180&&!subject.player.grounded;step++){
        const previous=subject.player.y+subject.player.h;subject.player.y+=160/120;
        HubGame.prototype.resolveAnnexVerticalV71.call(subject,room,previous);
      }
      near(subject.player.y+subject.player.h,physical.y);assert.equal(subject.player.grounded,true);assert.deepEqual(state,before);
    }
  }
});
