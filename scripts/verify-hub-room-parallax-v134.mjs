import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {HUB_DECKS,HUB_WORLD} from '../src/hub-game.js';
import {buildHubTraversalGeometryV87} from '../src/hub-v51-runtime.js';
import {buildHubDoorNetworkV58} from '../src/topology-coherence-v58.js';
import {HUB_ANNEXES_V137} from '../src/hub-annex-registry-v137.js';
import {HUB_ROOM_PARALLAX_V134,getHubRoomParallaxPlanV134,getHubNativeWallTilesV134,getHubRearEquipmentLayoutV134,drawHubRoomParallaxV134,withHubRoomParallaxV134} from '../src/hub-room-parallax-v134.js';
import {HUB_ENVIRONMENT_ATLAS_V134} from '../src/hub-environment-atlas-v134.js';
import {getHubRoomProjectionV139} from '../src/hub-room-projection-v139.js';
import {getHubSupportPlanesV139} from '../src/hub-support-planes-v139.js';

const root=fileURLToPath(new URL('../',import.meta.url));
function dimensions(path){const b=readFileSync(root+path.replace(/^\//,''));
  if(b.subarray(1,4).toString()==='PNG')return[b.readUInt32BE(16),b.readUInt32BE(20)];
  assert.equal(b.subarray(0,4).toString(),'RIFF');
  for(let offset=12;offset+8<b.length;){const kind=b.subarray(offset,offset+4).toString(),n=b.readUInt32LE(offset+4),start=offset+8;
    if(kind==='VP8X')return[b.readUIntLE(start+4,3)+1,b.readUIntLE(start+7,3)+1];
    if(kind==='VP8 ')return[b.readUInt16LE(start+6)&0x3fff,b.readUInt16LE(start+8)&0x3fff];
    if(kind==='VP8L'){const packed=b.readUInt32LE(start+1);return[(packed&0x3fff)+1,((packed>>>14)&0x3fff)+1];}
    offset=start+n+(n%2);}
  throw Error('Unrecognized native image header: '+path);
}
function image(path){const[naturalWidth,naturalHeight]=dimensions(path);return{complete:true,naturalWidth,naturalHeight,src:path};}
const rooms=[...HUB_DECKS.flatMap(d=>d.rooms),...HUB_ANNEXES_V137.map(a=>({...a,xStart:0}))];
function host(){let depth=0;const images=[],clips=[],draws=[];const ctx=new Proxy({
  save(){depth++;},restore(){assert.ok(depth>0);depth--;},rect(...r){clips.push(r);},drawImage(asset,...r){images.push({asset:asset.src,r});},
  fillRect(...r){draws.push(r);},createLinearGradient:()=>({addColorStop(){}})
},{get:(object,key)=>key in object?object[key]:()=>{}});return{ctx,images,clips,draws,balanced:()=>assert.equal(depth,0)};}

test('all 35 whole compartments use 34 frontal projections and only the authored maintenance spine uses parallel depth',()=>{
 assert.equal(rooms.length,35);assert.equal(Object.keys(HUB_ROOM_PARALLAX_V134).length,35);
 assert.deepEqual(Object.values(HUB_ROOM_PARALLAX_V134).filter(c=>c.presentationMode==='2.5d').map(c=>c.roomId||c.id),['maintenance-spine']);
 assert.equal(Object.values(HUB_ROOM_PARALLAX_V134).filter(c=>c.presentationMode==='2d').length,34);
 for(const room of rooms){const p=getHubRoomParallaxPlanV134(room,room.xStart);assert.ok(p,room.id);
   assert.equal(p.gameplayPlane,'2d');assert.equal(p.collidable,false);assert.equal(p.bounds.x,room.xStart);
   assert.equal(p.bounds.w,room.profile?.worldWidth||room.world.width);assert.ok(p.bounds.y+p.bounds.h<624);
   assert.ok(p.layers.every(layer=>layer.collidable===false));}
});

test('real native wall headers preserve aspect, cap scale, and completely cover each room for either camera direction',()=>{
 for(const room of rooms){const source=HUB_ROOM_PARALLAX_V134[room.id].nativeSource||room.art.far,asset=image(source);
   for(const drift of [-72,0,72]){const bounds=getHubRoomParallaxPlanV134(room).bounds,tiles=getHubNativeWallTilesV134(asset,bounds,drift);
     assert.ok(tiles.length,room.id);let area=0;
     for(const tile of tiles){const s=tile.source,t=tile.target;
       assert.ok(s.x>=-1e-6&&s.y>=0&&s.x+s.w<=asset.naturalWidth+1e-6&&s.y+s.h<=asset.naturalHeight+1e-6);
       assert.ok(t.x>=bounds.x&&t.x+t.w<=bounds.x+bounds.w+1e-6&&t.y>=bounds.y&&t.y+t.h<=bounds.y+bounds.h+1e-6);
       assert.ok(Math.abs(t.w/s.w-t.h/s.h)<1e-10,room.id+' distorts native aspect');
       assert.ok(t.w/s.w<=1+1e-10,room.id+' upscales native texture');area+=t.w*t.h;}
     assert.ok(Math.abs(area-bounds.w*bounds.h)<1e-6,room.id+' has a gap or overlapping tile');}
 }
});

test('the three reviewed depth planes move differently in real screen coordinates and reset their origin for every room',()=>{
 for(const room of rooms.filter(r=>HUB_ROOM_PARALLAX_V134[r.id].presentationMode==='2.5d')){
   const center=room.xStart+(room.profile?.worldWidth||room.world.width)/2-640;
   const a=getHubRoomParallaxPlanV134(room,center),b=getHubRoomParallaxPlanV134(room,center+300);
   const delta=b.layers.map((plane,i)=>plane.drift-a.layers[i].drift);
   assert.ok(delta[0]>delta[1]&&delta[1]>delta[2]&&delta[2]>0,room.id);
   const screenDelta=delta.map(value=>value-300);assert.ok(screenDelta.every(value=>value>-300&&value<0));
   const translated=getHubRoomParallaxPlanV134({...room,xStart:room.xStart+90000},center+90300);
   assert.deepEqual(translated.layers,b.layers);assert.equal(translated.bounds.x-b.bounds.x,90000);
 }
});

test('F7 and reduced motion stop parallax while preserving the entire compartment projection and every physical position',()=>{
 for(const room of rooms){for(const options of [{reducedMotion:true},{enabled:false},...(HUB_ROOM_PARALLAX_V134[room.id].presentationMode==='2d'?[{}]:[])]){
   const first=getHubRoomParallaxPlanV134(room,-999999,options),second=getHubRoomParallaxPlanV134(room,999999,options);
   const active=getHubRoomParallaxPlanV134(room,999999),geometry=structuredClone({station:room.station,colliders:room.colliders,ladders:room.ladders,platforms:room.platforms});
   assert.deepEqual(first.layers,second.layers);assert.ok(first.layers.every(layer=>layer.drift===0&&layer.factor===0));
   assert.equal(first.presentationMode,active.presentationMode);assert.equal(first.presentationMode,getHubRoomProjectionV139(room).mode);
   assert.deepEqual(first.bounds,active.bounds);assert.equal(first.gameplayPlane,active.gameplayPlane);
   assert.deepEqual(getHubSupportPlanesV139(room,{depthEnabled:false}),getHubSupportPlanesV139(room));
   assert.deepEqual({station:room.station,colliders:room.colliders,ladders:room.ladders,platforms:room.platforms},geometry);}}
});

test('renderer clips native pixels and all architecture to the local rear plane, leaves inputs unchanged and balances Canvas state',()=>{
 for(const room of rooms){const before=structuredClone(room),source=HUB_ROOM_PARALLAX_V134[room.id].nativeSource||room.art.far,asset=image(source),browser=host();
   const model=drawHubRoomParallaxV134(browser.ctx,room,asset,room.xStart+340);browser.balanced();
   assert.deepEqual(room,before);assert.equal(model.nativeReady,true);
   assert.deepEqual(browser.clips[0],[model.bounds.x,model.bounds.y,model.bounds.w,model.bounds.h]);
   for(const call of browser.images){assert.equal(call.r.length,8);assert.ok(Math.abs(call.r[6]/call.r[2]-call.r[7]/call.r[3])<1e-10);}
 }
});

test('wrapper routes annex backgrounds before existing physical geometry and retains an untouched save/snapshot',()=>{
 const annex=HUB_ANNEXES_V137.find(a=>a.id==='logistics'),wall=image(annex.art.far),browser=host(),order=[];
 class Base{constructor(){this.depthPresentationV116=true;this.annexCameraV71={x:300};this.state={save:{stocks:17}};}
   ensureAnnexAssetsV71(){return new Map([['far',wall]]);}drawAnnexGeometryV71(ctx,a){assert.equal(a,annex);order.push('physical');return 'native-geometry';}
   drawAnnexLayerV71(){return 'old-layer';}drawHubRoomFarV58(){return 'old-room';}currentAnnexV71(){return annex;}isAnnexActiveV71(){return true;}
   getSnapshot(){return{save:structuredClone(this.state.save)};}}
 const Subject=withHubRoomParallaxV134(Base),subject=new Subject(),before=structuredClone(subject.state);
 assert.equal(subject.drawAnnexGeometryV71(browser.ctx,annex),'native-geometry');browser.balanced();assert.equal(order.length,1);
 assert.deepEqual(subject.state,before);assert.equal(subject.getSnapshot().hubRoomParallaxV134.current.id,'logistics');
 assert.equal(subject.drawAnnexLayerV71(browser.ctx,wall,.18,1),false);
 subject.editorPlaytest=true;assert.equal(subject.drawAnnexLayerV71(browser.ctx,wall,.18,1),'old-layer');
 assert.equal(subject.drawHubRoomFarV58(browser.ctx,HUB_DECKS[0].rooms[0]),'old-room');
});

test('missing or invalid native sources leave the structural fallback usable without stretching another room',()=>{
 const room=HUB_DECKS[0].rooms[0],browser=host();for(const source of [null,{complete:false,naturalWidth:1774,naturalHeight:887},{complete:true,naturalWidth:0,naturalHeight:887}]){
   const model=drawHubRoomParallaxV134(browser.ctx,room,source,0);assert.equal(model.nativeReady,false);assert.equal(model.asset,null);browser.balanced();}
 assert.equal(drawHubRoomParallaxV134(browser.ctx,{id:'unreviewed'},image(HUB_ROOM_PARALLAX_V134.bridge.nativeSource)),null);
});

test('CCTV renders the observed compartment at its own camera and restores the surrounding render context',()=>{
 const room=HUB_DECKS[3].rooms.find(r=>r.id==='dropship-hangar'),wall=image(HUB_ROOM_PARALLAX_V134[room.id].nativeSource),browser=host();
 class Base{
   constructor(){this.camera={x:17};this.player={x:940,y:532};this.depthPresentationV116=true;this.roomLayerImages=new Map([[wall.src,wall]]);}
   hubTrainingContactV132(id){return id==='cctv';}getHubTrainingCommandsV132(){return{selectedFeed:{deckIndex:3,id:room.id}};}
   drawSecurityFeedV132(){this.drawHubRoomFarV58(browser.ctx,room);return 'native-feed';}
 }
 const Subject=withHubRoomParallaxV134(Base),subject=new Subject(),physical=structuredClone({camera:subject.camera,player:subject.player});
 subject.hubParallaxCameraOverrideV134=913;
 assert.equal(subject.drawSecurityFeedV132(),'native-feed');browser.balanced();
 assert.equal(subject.hubParallaxCameraOverrideV134,913);assert.deepEqual({camera:subject.camera,player:subject.player},physical);
 const model=subject.hubParallaxModelsV134.get('room:dropship-hangar');assert.equal(model.localEye,0);assert.ok(model.layers.every(layer=>layer.drift===0));
});

test('original equipment atlas occupies only available wall bays at human scale and native aspect',()=>{
 const atlas=image(HUB_ENVIRONMENT_ATLAS_V134.asset);assert.equal(atlas.naturalWidth,HUB_ENVIRONMENT_ATLAS_V134.width);assert.equal(atlas.naturalHeight,HUB_ENVIRONMENT_ATLAS_V134.height);
 for(const room of rooms){const model=getHubRoomParallaxPlanV134(room,room.xStart+600),panels=getHubRearEquipmentLayoutV134(room,model,atlas);
   assert.ok(panels.length<=(model.bounds.w>=1920?2:1),room.id);
   for(const panel of panels){const s=panel.source,t=panel.target;
     assert.ok(s.x>=0&&s.y>=0&&s.x+s.w<=atlas.naturalWidth&&s.y+s.h<=atlas.naturalHeight);
     assert.ok(Math.abs(t.w/s.w-t.h/s.h)<1e-10);assert.ok(t.w/s.w<=1);assert.ok(t.w<=300+1e-7&&t.h<=112+1e-7);
     assert.ok(t.y+t.h<=426);assert.ok(t.x>=model.bounds.x&&t.x+t.w<=model.bounds.x+model.bounds.w);
     assert.equal(panel.support,'wall-mounted-bay');
     assert.equal(panel.collidable,false);assert.equal(panel.interactive,false);assert.equal(panel.exact,false);}
 }
 const room={id:'proving-ground',xStart:0,world:{width:2600,floorY:624}},model=getHubRoomParallaxPlanV134(room,1200,{clip:{x:0,y:132,w:2600,h:238}});
 for(const panel of getHubRearEquipmentLayoutV134(room,model,atlas)){assert.ok(panel.target.y>=156);assert.equal(panel.target.y+panel.target.h,360);}
});

test('mounted equipment keeps its physical wall socket across the full camera range and reduced-motion settings',()=>{
 const atlas=image(HUB_ENVIRONMENT_ATLAS_V134.asset);
 let briefingChecked=false;
 for(const room of rooms){
   const deck=HUB_DECKS.findIndex(entry=>entry.rooms.some(candidate=>candidate.id===room.id));
   const geometry=deck<0?room:buildHubTraversalGeometryV87(deck);
   const nativeOptions={ladders:geometry.ladders,platforms:geometry.platforms,
     doors:deck<0?[]:buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck)};
   const center=(room.xStart||0)+(room.world?.width||1280)/2-640;
   for(const options of [nativeOptions,{ladders:geometry.ladders,platforms:geometry.platforms}]){
   let mounts;
   for(const delta of [-10000,-640,-160,0,160,640,10000])for(const reducedMotion of [false,true])for(const enabled of [false,true]){
     const model=getHubRoomParallaxPlanV134(room,center+delta,{reducedMotion,enabled});
     const panels=getHubRearEquipmentLayoutV134(room,model,atlas,options);
     const current=panels.map(panel=>({source:panel.source,socket:panel.socketBounds,envelope:panel.driftEnvelope,mirrored:panel.mirrored}));
     if(mounts)assert.deepEqual(current,mounts,`${room.id}: the camera must not select another wall bay`);
     else mounts=current;
     for(const panel of panels){const target=panel.target,envelope=panel.driftEnvelope;
       assert.ok(target.x>=envelope.x-1e-8&&target.x+target.w<=envelope.x+envelope.w+1e-8,room.id);
       assert.ok(Math.abs(target.x-panel.socketBounds.x-model.layers[1].drift)<1e-8,room.id);
     }
     if(room.id==='briefing'&&!options.doors){assert.ok(panels.length>0,'The regression must exercise actual mounted briefing equipment');briefingChecked=true;}
   }
   }
 }
 assert.equal(briefingChecked,true);
});
