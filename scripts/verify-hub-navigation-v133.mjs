import assert from 'node:assert/strict';
import {test} from 'node:test';
import {openSync,readSync,closeSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {HubGame as ProductionHub} from '../src/hub-opening-v88.js';
import {HUB_DECKS,HUB_WORLD,buildHubObstacleGeometryV87} from '../src/hub-game.js';
import {HUB_ANNEXES_V87} from '../src/hub-annex-registry-v87.js';
import {HUB_ANNEXES_V71} from '../src/tantalus-hub-expansion-v71.js';
import {withHubTrainingV132} from '../src/hub-training-v132.js';
import {withHubNpcLifeV136} from '../src/npc-life-v136.js';
import {HUB_ROOM_NAVIGATION_V133,validateHubWalkingLaneV133} from '../src/hub-navigation-layout-v133.js';
import {ELECTRICAL_HAZARD_ART_V55} from '../src/hub-art-runtime-v55.js';
import {getHubDoorBounds} from '../src/hub-profiles-v53.js';
import {getHubBulkheadColliderV134} from '../src/hub-bulkhead-depth-v134.js';
import {createDefaultSave} from '../src/save.js';
import {requestShipPortDockV87,stepShipPortV87,SHIP_PORT_DEFINITION_V87} from '../src/ship-port-state-v87.js';
const Engine=withHubNpcLifeV136(withHubTrainingV132(ProductionHub)),root=fileURLToPath(new URL('../',import.meta.url));
// Browser APIs only: contacts, doors, gravity and all movement remain native.
function size(source){let descriptor;try{descriptor=openSync(resolve(root,`.${new URL(source,'http://fixture.invalid').pathname}`),'r');
  const header=Buffer.alloc(32);readSync(descriptor,header,0,32,0);
  if(header.subarray(1,4).toString()==='PNG')return [header.readUInt32BE(16),header.readUInt32BE(20)];
  if(header.subarray(0,4).toString()==='RIFF'&&header.subarray(12,16).toString()==='VP8X')return [header.readUIntLE(24,3)+1,header.readUIntLE(27,3)+1];
  return [0,0];}catch{return [0,0];}finally{if(descriptor!==undefined)closeSync(descriptor);}}
function host(){const events=new EventTarget();for(const name of ['addEventListener','removeEventListener'])globalThis[name]=events[name].bind(events);
  globalThis.document=Object.assign(new EventTarget(),{hidden:false,activeElement:null,hasFocus:()=>true});
  globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  globalThis.Image=class extends EventTarget{complete=true;naturalWidth=0;naturalHeight=0;set src(source){this._src=source;[this.naturalWidth,this.naturalHeight]=size(source);
    queueMicrotask(()=>{const event=new Event(this.naturalWidth?'load':'error');this.dispatchEvent(event);this[`on${event.type}`]?.(event);});}get src(){return this._src;}
    async decode(){if(!this.naturalWidth)throw new Error('Missing fixture image');}};
  let depth=0;const texts=[],images=[],rects=[],ctx=new Proxy({save(){depth++;},restore(){assert.ok(depth>0);depth--;},fillText(text){texts.push(String(text));},
    drawImage(image,...bounds){images.push({source:image.src,bounds});},
    fillRect(x,y,w,h){rects.push({x,y,w,h,fill:ctx.fillStyle});},
    measureText:text=>({width:String(text).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),
    getImageData:()=>({data:new Uint8ClampedArray(4),width:1,height:1})},{get:(target,key)=>key in target?target[key]:()=>{}});
  const canvas=Object.assign(new EventTarget(),{width:1280,height:720,getContext:()=>ctx,focus(){document.activeElement=this;},getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})});
  const key=(type,code)=>{const event=new Event(type,{cancelable:true});Object.assign(event,{code,repeat:false,ctrlKey:false,metaKey:false,altKey:false});events.dispatchEvent(event);};
  return {canvas,ctx,texts,images,rects,key,balanced:()=>assert.equal(depth,0)};
}

async function fixture(deck=0,x=100,hubState=null,saveOverride=null){
 const browser=host(),events=[],patches=[],save=saveOverride||createDefaultSave();save.needsPlayerCreationV84=false;
 const hub=new Engine(browser.canvas,{onAction:event=>events.push(event),onPersist:patch=>patches.push(structuredClone(patch)),onStatus:()=>{}});
 hub.start(hubState||{deck,roomId:HUB_DECKS[deck].rooms[Math.floor(x/1280)].id,positionX:x,positionY:532},{routineContextV62:{save}});
 for(let index=0;index<8;index++)await Promise.resolve();return {...browser,hub,events,patches};
}
function tap(subject,code){subject.key('keydown',code);subject.key('keyup',code);}
function advance(subject,seconds){for(let t=0;t<seconds-1e-9;t+=1/60)subject.hub.update(Math.min(1/60,seconds-t));}
function walk(subject,x){const direction=subject.hub.player.x<x?'KeyD':'KeyA';subject.key('keydown',direction);
 for(let count=0;count<3600&&Math.abs(subject.hub.player.x-x)>7;count++)subject.hub.update(1/60);
 subject.key('keyup',direction);advance(subject,.15);
 assert.ok(Math.abs(subject.hub.player.x-x)<42,`Walk stopped at ${subject.hub.player.x}, target ${x}`);
}

test('all sixteen authored room props and parked hulls leave the human walking lane continuous',()=>{
 assert.equal(Object.keys(HUB_ROOM_NAVIGATION_V133).length,16);
 for(let deck=0;deck<4;deck++){
  const geometry=buildHubObstacleGeometryV87(deck);
  assert.equal(validateHubWalkingLaneV133(geometry,{maximumX:HUB_WORLD.width-24}).valid,true);
  for(const room of HUB_DECKS[deck].rooms){assert.equal(room.collisionSource,'authored-room-profile');
   if(room.propPlacementV139?.visible===false){
    assert.ok(['vehicle-bay','dropship-hangar'].includes(room.id));
    assert.equal(room.propCollisionBounds,null);assert.equal(room.propInteractionBounds,null);
    assert.equal(room.geometry.length,0,'An omitted duplicate hoist cannot leave a phantom physical support');
    continue;
   }
   assert.equal(room.propCollisionBounds.collisionMode,'one-way-top');assert.equal(room.propCollisionBounds.physicalPlane,'rear');
   assert.equal(room.propPlacementV139.inspectionX,room.x);
   const surface=room.propPlacementV139.usefulSurface?.bounds;
   if(surface)assert.ok(Math.abs(room.x-(surface.x+surface.w/2))<1e-8,'Inspection follows the actual useful surface');
   assert.ok(room.x>=room.propRenderBounds.x&&room.x<=room.propRenderBounds.x+room.propRenderBounds.w);
   assert.ok(room.geometry.length>0);
  }
 }
 const broken=buildHubObstacleGeometryV87(0).map(c=>({...c,collisionMode:undefined}));
 assert.equal(validateHubWalkingLaneV133(broken,{maximumX:HUB_WORLD.width}).valid,false);
});

test('real keyboard walking crosses every room in both directions, and physical lifts join all four decks',async()=>{
 const subject=await fixture();
 for(let deck=0;deck<4;deck++){
  assert.equal(subject.hub.state.deck,deck);walk(subject,4980);walk(subject,90);
  assert.equal(subject.hub.player.health,100);assert.equal(subject.hub.player.shockHits,0);
  for(const room of HUB_DECKS[deck].rooms)assert.ok(subject.hub.state.visited.includes(room.id));
  if(deck<3){walk(subject,2350);assert.ok(subject.hub.nearestLift());tap(subject,'KeyS');assert.equal(subject.hub.state.deck,deck+1);}
 }
 assert.equal(subject.hub.state.visited.length,16);
});

test('rear stations can be crossed at floor level and still support a descending jump onto their actual top',async()=>{
 const subject=await fixture(0,700),prop=HUB_DECKS[0].rooms[0].propCollisionBounds;
 walk(subject,990);assert.equal(subject.hub.player.y,532);
 walk(subject,prop.x-52);tap(subject,'Space');subject.key('keydown','KeyD');advance(subject,.44);subject.key('keyup','KeyD');advance(subject,.4);
 assert.ok(subject.hub.player.x+subject.hub.player.w>prop.x&&subject.hub.player.x<prop.x+prop.w);
 assert.ok(Math.abs(subject.hub.player.y+subject.hub.player.h-prop.y)<.01,'A descending actor must stand on the authored station top');
});

test('commercial annex doors are reachable on foot and their station/cargo remain rear supports, not mandatory jumps',async()=>{
 for(const annex of HUB_ANNEXES_V71){
  const deck=HUB_DECKS.findIndex(deck=>deck.id===annex.parentDeck),parent=HUB_DECKS[deck].rooms.find(room=>room.id===annex.parentRoomId);
  const subject=await fixture(deck,parent.xStart+180),door=subject.hub.getParentAnnexDoorV71(annex.id);
  assert.equal(door.bounds.y+door.bounds.h,624);walk(subject,door.bounds.x+door.bounds.w/2-22);
  assert.equal(subject.hub.nearestParentAnnexDoorV71().annexId,annex.id);tap(subject,'KeyE');advance(subject,.5);
  assert.equal(subject.hub.currentAnnexV71().id,annex.id);
  assert.equal(validateHubWalkingLaneV133(annex.colliders,{maximumX:annex.world.width-24}).valid,true);
  walk(subject,annex.station.bounds.x+annex.station.bounds.w+10);
  assert.equal(subject.hub.player.y,532);assert.equal(subject.hub.nearestAnnexStationV71().annexId,annex.id);
  walk(subject,annex.entranceLocalX+(annex.entranceSide==='west'?annex.entrance.w/2+16:-annex.entrance.w/2-60));
  // A passing crew member may own the destination until its real patrol clears it.
  for(let retry=0;retry<120&&subject.hub.currentAnnexV71();retry++){tap(subject,'KeyE');advance(subject,.1);}
  assert.equal(subject.hub.currentAnnexV71(),null);
  assert.ok(subject.hub.player.y===532&&subject.hub.player.alive);
 }
 assert.equal(HUB_ANNEXES_V87.length,13);
});

test('closed security bulkheads still block movement while an occupied rear prop checkpoint resumes safely',async()=>{
 const subject=await fixture(0,2350,{deck:0,roomId:'briefing',positionX:2350,positionY:532,visited:['briefing'],
  hubTrainingV132:{schema:132,serial:0,active:false,course:null,cameraIndex:0,lockedDoorIds:['command:hub-central-bulkhead'],pendingReceipt:null,claimedReceiptIds:[]}});
 const door=subject.hub.doorStates.find(door=>door.id==='command:hub-central-bulkhead'),bounds=getHubBulkheadColliderV134(door);
 subject.key('keydown','KeyD');advance(subject,3);subject.key('keyup','KeyD');
 assert.ok(subject.hub.player.x+44<=bounds.x+.01);
 assert.ok(Math.abs(subject.hub.player.x+44-bounds.x)<.01);
 const resume=await fixture(0,850,{deck:0,roomId:'bridge',positionX:850,positionY:532,visited:['bridge']});
 assert.equal(resume.hub.player.y,532);walk(resume,1010);assert.equal(resume.hub.player.y,532);
});

test('the electrical maintenance alcove is physically dangerous but leaves the everyday floor and lift route safe',async()=>{
 const subject=await fixture(3,90);walk(subject,1350);assert.equal(subject.hub.player.shockHits,0);assert.equal(subject.hub.player.health,100);
 const p=subject.hub.v51Platforms.find(p=>p.id==='hangar-maintenance-alcove-v133');assert.ok(p);
 assert.equal(p.y,ELECTRICAL_HAZARD_ART_V55.renderBounds.y+ELECTRICAL_HAZARD_ART_V55.renderBounds.h);
 assert.ok(ELECTRICAL_HAZARD_ART_V55.collisionBounds.y+ELECTRICAL_HAZARD_ART_V55.collisionBounds.h<=532);
 // An idle authored checkpoint on the accessible maintenance ledge tests its real danger.
 const hazard=await fixture(3,1100,{deck:3,roomId:'dropship-hangar',positionX:1100,positionY:p.y-92,visited:['dropship-hangar']});
 advance(hazard,.2);assert.ok(hazard.hub.player.shockHits>0);assert.ok(hazard.hub.player.health<100);
});

test('the civil terminal and its adjacent physical door choose their closest contact instead of trapping the entrance behind a menu',async()=>{
 let save=createDefaultSave();save.needsPlayerCreationV84=false;save.scene='hub';const scope=SHIP_PORT_DEFINITION_V87;
 const context={careReady:true,manifestReady:true,physical:{roomId:'dropship-hangar'},
  authorization:{granted:true,portId:scope.id,sectorId:scope.sectorId,campaignHours:6}};
 let result=requestShipPortDockV87(save,{transactionId:'hub-navigation-test-dock-v133',portId:scope.id},context);assert.equal(result.ok,true);save=result.save;
 for(let seconds=1;seconds<=14;seconds++){result=stepShipPortV87(save,{dtSeconds:1,simulationTime:seconds},context);assert.equal(result.ok,true);save=result.save;}
 const subject=await fixture(3,40,null,save);walk(subject,24);assert.ok(subject.hub.statusPrompt().includes('AMARRAGE'));tap(subject,'KeyE');
 assert.equal(subject.events.at(-1).action,'ship-port:terminal');assert.equal(subject.hub.currentAnnexV71(),null);
 walk(subject,77);assert.ok(subject.hub.statusPrompt().includes('ENTRER'));tap(subject,'KeyE');advance(subject,.5);
 assert.equal(subject.hub.currentAnnexV71()?.id,'frontier-civil-counter');walk(subject,655);walk(subject,219);tap(subject,'KeyE');advance(subject,.5);
 assert.equal(subject.hub.currentAnnexV71(),null);assert.equal(subject.hub.player.health,100);
});

test('lift images render behind the actual humans without the old opaque rectangular backdrop',async()=>{
 const subject=await fixture(0,2350);subject.images.length=0;subject.rects.length=0;subject.hub.drawWorld(subject.ctx);subject.balanced();
 const liftIndex=subject.images.findIndex(image=>image.source?.endsWith('/hub/props/lift-door.png'));
 const humanIndex=subject.images.findIndex(image=>image.source?.includes('/sprites/normalized/npcs/'));
 assert.ok(liftIndex>=0&&humanIndex>liftIndex,'The lift may not paint over a human who walks in front of it');
 const door=subject.hub.doorStates.find(door=>door.lift),bounds=getHubDoorBounds(door);
 assert.ok(!subject.rects.some(rect=>rect.x===bounds.x-16&&rect.y===bounds.y-28&&rect.w===bounds.w+32&&rect.h===bounds.h+36));
});
