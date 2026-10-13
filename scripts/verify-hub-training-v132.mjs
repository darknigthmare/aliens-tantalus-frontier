import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync,readSync,closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HubGame as ProductionHub,HUB_DECKS } from '../src/hub-opening-v88.js';
import { HUB_WORLD } from '../src/hub-game.js';
import { HUB_ANNEX_BY_ID_V71 } from '../src/tantalus-hub-expansion-v71.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { getHubDoorBounds } from '../src/hub-profiles-v53.js';
import { withHubTrainingV132,HUB_LOADER_ROOM_V132,createHubLoaderTrainingV132,
  validateHubLoaderTrainingV132,normalizeHubTrainingV132,validateHubLoaderReceiptV132,hubSecurityRoutesValidV132 } from '../src/hub-training-v132.js';
import { createDefaultSave,getHubTrainingOperatorIdV132,recordHubLoaderQualificationV132,migrateSave } from '../src/save.js';

// Only browser APIs are substituted. The final hub stack and authored loader
// physics, contacts, certificates and persistence run without method mocks.
const Engine=withHubTrainingV132(ProductionHub),root=fileURLToPath(new URL('../',import.meta.url));
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
  let depth=0;const texts=[],images=[],ctx=new Proxy({save(){depth++;},restore(){assert.ok(depth>0);depth--;},fillText(text){texts.push(String(text));},
    drawImage(image,...bounds){images.push({source:image.src,bounds});},
    measureText:text=>({width:String(text).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),
    getImageData:()=>({data:new Uint8ClampedArray(4),width:1,height:1})},{get:(target,key)=>key in target?target[key]:()=>{}});
  const canvas=Object.assign(new EventTarget(),{width:1280,height:720,getContext:()=>ctx,focus(){document.activeElement=this;},getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})});
  const key=(type,code)=>{const event=new Event(type,{cancelable:true});Object.assign(event,{code,repeat:false,ctrlKey:false,metaKey:false,altKey:false});events.dispatchEvent(event);};
  return {canvas,ctx,texts,images,key,balanced:()=>assert.equal(depth,0)};
}
async function fixture(hubState=null,annex='proving-ground',operatorId='operator-fixture'){
  const browser=host(),events=[],patches=[],hub=new Engine(browser.canvas,{onAction:event=>events.push(event),onTrainingEventV132:event=>{events.push(event);return true;},
    onPersist:patch=>patches.push(structuredClone(patch)),onStatus:()=>{}});
  const definition=HUB_ANNEX_BY_ID_V71[annex],deck=HUB_DECKS.findIndex(deck=>deck.id===definition.parentDeck);
  const parentRoom=HUB_DECKS[deck].rooms.find(room=>room.id===definition.parentRoomId);
  hub.start(hubState||{deck,roomId:parentRoom.id,positionX:parentRoom.xStart+180,visited:[parentRoom.id]},{trainingOperatorIdV132:operatorId});
  for(let index=0;index<6;index++)await Promise.resolve();
  if(!hubState){hub.activateAnnexV71(HUB_ANNEX_BY_ID_V71[annex]);const station=HUB_ANNEX_BY_ID_V71[annex].station.bounds;
    Object.assign(hub.player,{x:station.x+station.w+8,y:532,vx:0,vy:0,grounded:true});}
  return {...browser,hub,events,patches};
}
function tick(hub,seconds){for(let elapsed=0;elapsed<seconds-1e-9;elapsed+=1/60)hub.update(Math.min(1/60,seconds-elapsed));}
function motion(subject,code,seconds){subject.key('keydown',code);tick(subject.hub,seconds);subject.key('keyup',code);}
function tap(subject,code){subject.key('keydown',code);subject.key('keyup',code);}
function driveTo(subject,x){const state=subject.hub.hubTrainingV132.course,dir=x>state.loader.x?'KeyD':'KeyA';
  for(let frame=0;frame<6000&&Math.abs(state.loader.x-x)>1.8;frame++){subject.key('keydown',dir);subject.hub.update(1/60);subject.key('keyup',dir);
    if(state.phase==='failed')assert.fail('Unexpected course failure');}
  assert.ok(Math.abs(state.loader.x-x)<3,`Drive stopped at ${state.loader.x}, wanted ${x}`);}
function liftTo(subject,height){const state=subject.hub.hubTrainingV132.course,dir=height>state.loader.lift?'KeyW':'KeyS';
  for(let frame=0;frame<600&&Math.abs(state.loader.lift-height)>.8;frame++){subject.key('keydown',dir);subject.hub.update(1/60);subject.key('keyup',dir);}
  assert.ok(Math.abs(state.loader.lift-height)<1.5,`Lift stopped at ${state.loader.lift}, wanted ${height}`);}
async function completeCourse(operatorId='operator-fixture',onEvent=null){const subject=await fixture(null,'proving-ground',operatorId);
  if(onEvent)subject.hub.onTrainingEventV132=event=>{subject.events.push(event);return onEvent(event,subject.hub);};
  tap(subject,'KeyH');assert.equal(subject.hub.hubTrainingV132.active,true);
  motion(subject,'KeyD',.5);tap(subject,'KeyE');assert.equal(subject.hub.hubTrainingV132.course.mounted,true);
  for(const cargo of HUB_LOADER_ROOM_V132.cargo){
    liftTo(subject,0);driveTo(subject,cargo.x-110);tap(subject,'KeyE');assert.equal(subject.hub.hubTrainingV132.course.heldId,cargo.id);
    if(cargo.id==='training-cargo-b'){liftTo(subject,100);driveTo(subject,1203);}
    driveTo(subject,cargo.targetX-110);liftTo(subject,566-cargo.targetY);tap(subject,'KeyE');
    assert.equal(subject.hub.hubTrainingV132.course.cargo.find(item=>item.id===cargo.id).placed,true);
  }
  driveTo(subject,230);tap(subject,'KeyE');assert.equal(subject.hub.hubTrainingV132.course.phase,'confirm');tap(subject,'KeyE');
  assert.equal(subject.hub.hubTrainingV132.course.phase,'complete');return subject;
}

test('P-5000 human course is distinct from automatic support and cannot start away from its physical console',async()=>{
  const subject=await fixture(),identity=subject.hub.playerAppearanceV126;
  subject.hub.player.x=1700;assert.equal(subject.hub.startHubLoaderTrainingV132().started,false);
  const base=createHubLoaderTrainingV132();assert.equal(base.operatorMode,'human');assert.equal(base.vehicleId,'vehicle-007-p-5000-powered-work-loader');
  assert.equal(validateHubLoaderTrainingV132(base).valid,true);assert.equal(subject.hub.playerAppearanceV126,identity);
});
test('real keyboard course lifts, transports, clears the beam, places three loads and parks before certificate issuance',async()=>{
  const subject=await completeCourse(),state=subject.hub.hubTrainingV132.course;
  assert.equal(validateHubLoaderTrainingV132(state).valid,true);assert.ok(state.distance>3000);assert.ok(state.energy<100);assert.ok(state.hydraulics<100);
  assert.ok(state.cargo[1].clearancePassed);assert.equal(state.placements.length,3);assert.equal(state.mounted,false);
  const receipt=subject.events.find(event=>event.action==='hub:loader-training-qualified-v132')?.receipt;
  assert.ok(receipt);assert.equal(validateHubLoaderReceiptV132(receipt).valid,true);
  const last=subject.patches.at(-1);assert.equal(last.hubTrainingV132.active,true);assert.equal(last.hubTrainingV132.course.complete,true);
  assert.equal(subject.hub.deliverHubLoaderReceiptV132(),false);subject.hub.draw();subject.balanced();
});
test('swept loader and held cargo contacts prevent crossing the crate, overhead beam and end stop on a dropped frame',async()=>{
  const subject=await fixture();tap(subject,'KeyH');motion(subject,'KeyD',.5);tap(subject,'KeyE');
  driveTo(subject,340);tap(subject,'KeyE');liftTo(subject,180);
  driveTo(subject,550-110);motion(subject,'KeyD',2);const blocked=subject.hub.hubTrainingV132.course.loader.x;
  assert.ok(blocked+110+58<=790+.01);assert.ok(subject.hub.hubTrainingV132.course.collisionStops>0);
  subject.hub.update(20);assert.equal(subject.hub.hubTrainingV132.course.loader.x,blocked);
  liftTo(subject,54);driveTo(subject,590);tap(subject,'KeyE');
  assert.equal(subject.hub.hubTrainingV132.course.cargo[0].placed,true);
});
test('pause freezes training position, time, resources and actions, then resume continues the same human session',async()=>{
  const subject=await fixture();tap(subject,'KeyH');const before=structuredClone(subject.hub.hubTrainingV132);
  tap(subject,'KeyP');assert.equal(subject.hub.running,false);motion(subject,'KeyD',2);tap(subject,'KeyE');assert.deepEqual(subject.hub.hubTrainingV132,before);
  tap(subject,'KeyP');assert.equal(subject.hub.running,true);motion(subject,'KeyD',.2);assert.ok(subject.hub.hubTrainingV132.course.human.x>before.course.human.x);
});
test('active exercise resumes its owned loader and held cargo while keeping the real parent room and human identity',async()=>{
  const subject=await fixture();tap(subject,'KeyH');motion(subject,'KeyD',.5);tap(subject,'KeyE');driveTo(subject,340);tap(subject,'KeyE');liftTo(subject,54);subject.hub.persist();
  const patch=subject.patches.at(-1);assert.equal(patch.hubTrainingV132.active,true);assert.equal(patch.hubCommercialV71.activeAnnexId,'proving-ground');
  const restored=await fixture(patch);assert.equal(restored.hub.hubTrainingV132.active,true);
  assert.equal(restored.hub.hubTrainingV132.course.heldId,'training-cargo-a');assert.equal(restored.hub.hubTrainingV132.course.loader.lift,subject.hub.hubTrainingV132.course.loader.lift);
  tap(restored,'Escape');assert.equal(restored.hub.hubTrainingV132.active,false);assert.equal(restored.hub.currentAnnexV71().id,'proving-ground');
});
test('unearned flags, missing loads, missing beam clearance, foreign vehicle, automation and pending receipt divergence cannot qualify',async()=>{
  const subject=await completeCourse(),receipt=subject.events.find(event=>event.action==='hub:loader-training-qualified-v132').receipt;
  assert.equal(validateHubLoaderReceiptV132({qualified:true}).valid,false);
  for(const corrupt of [raw=>{raw.state.placements.pop();},raw=>{raw.state.cargo[1].clearancePassed=false;},raw=>{raw.state.vehicleId='vehicle-automatic-loader';},
    raw=>{raw.state.operatorMode='automatic';},raw=>{raw.state.parked=false;},raw=>{raw.state.distance=0;},raw=>{raw.serial++;}]){
    const forged=structuredClone(receipt);corrupt(forged);assert.equal(validateHubLoaderReceiptV132(forged).valid,false);
  }
  const other=structuredClone(receipt);other.operatorId='foreign';assert.equal(validateHubLoaderReceiptV132(receipt,other).valid,false);
});
test('security locks preserve a route from every room to a physical lift and cannot pinch an occupied doorway',async()=>{
  assert.equal(hubSecurityRoutesValidV132(['command:hub-west-bulkhead']),false);
  assert.equal(hubSecurityRoutesValidV132(['command:hub-central-bulkhead']),true);
  const subject=await fixture(null,'cctv');assert.equal(subject.hub.executeHubTrainingCommandV132('door-toggle','command:hub-west-bulkhead'),false);
  assert.equal(subject.hub.executeHubTrainingCommandV132('door-toggle','command:hub-central-bulkhead'),true);
  assert.equal(subject.hub.executeHubTrainingCommandV132('door-toggle','command:hub-central-bulkhead'),true);
  const door=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,0).find(door=>door.id==='command:hub-central-bulkhead'),bounds=getHubDoorBounds(door);
  subject.hub.npcs.push({id:'occupied-door-fixture',x:bounds.x+10,y:532,w:44,h:92,alive:true});
  assert.equal(subject.hub.executeHubTrainingCommandV132('door-toggle','command:hub-central-bulkhead'),false);
  subject.hub.npcs.pop();assert.equal(subject.hub.executeHubTrainingCommandV132('door-toggle','command:hub-central-bulkhead'),true);
  subject.hub.deactivateAnnexV71(HUB_ANNEX_BY_ID_V71.cctv);Object.assign(subject.hub.player,{x:2400,y:532,vx:0,vy:0,grounded:true});
  motion(subject,'KeyD',3);assert.ok(subject.hub.player.x+44<=bounds.x+.01,'A closed remote lock remains a real walking collider');
  const normalized=normalizeHubTrainingV132({...subject.hub.hubTrainingV132,lockedDoorIds:['command:hub-west-bulkhead']});assert.deepEqual(normalized.lockedDoorIds,[]);
});
test('a rejected pending issuance never calls qualified or marks the receipt claimed',async()=>{
  const subject=await completeCourse(),receipt=subject.events.find(event=>event.action==='hub:loader-training-qualified-v132').receipt;
  subject.hub.hubTrainingV132.pendingReceipt=structuredClone(receipt);subject.hub.hubTrainingV132.claimedReceiptIds=[];subject.hub.trainingReceiptAttemptV132=null;
  const calls=[];subject.hub.onTrainingEventV132=event=>{calls.push(event.action);return false;};
  assert.equal(subject.hub.deliverHubLoaderReceiptV132(),false);assert.deepEqual(calls,['hub:loader-training-issued-v132']);
  assert.deepEqual(subject.hub.hubTrainingV132.claimedReceiptIds,[]);assert.ok(subject.hub.hubTrainingV132.pendingReceipt);
});
test('CCTV and MIRE actions require real local consoles; feed selection persists and replay names the native Nostromo campaign',async()=>{
  const security=await fixture(null,'cctv');tap(security,'KeyN');assert.equal(security.hub.hubTrainingV132.cameraIndex,1);
  const actors=structuredClone(security.hub.npcs),events=security.events.length;security.images.length=0;
  security.hub.drawSecurityFeedV132();security.balanced();
  for(const layer of ['far','mid','overhead','foreground'])assert.ok(security.images.some(image=>image.source.endsWith(`command-briefing-${layer}.png`)),`CCTV is missing its ${layer} composition`);
  assert.deepEqual(security.hub.npcs,actors);assert.equal(security.events.length,events);
  for(let index=0;index<4;index++)tap(security,'KeyN');security.images.length=0;security.hub.drawSecurityFeedV132();security.balanced();
  assert.ok(security.texts.some(text=>text.includes('AUTRE PONT · DÉCOR')));
  assert.ok(!security.images.some(image=>image.source.includes('/sprites/normalized/npcs/')),'An inactive deck must not borrow the active deck NPCs');
  security.hub.player.x=1700;assert.equal(security.hub.executeHubTrainingCommandV132('camera-next'),false);
  const mire=await fixture(null,'mire-archives');tap(mire,'KeyM');
  const event=mire.events.find(event=>event.action==='hub:mire-replay-v132');assert.equal(event.campaignId,'special-nostromo-v131');assert.equal(event.preserveIdentity,true);
});
test('save helpers accept only the issued physical course for the current operator and preserve a single qualification through migration',async()=>{
  const save=createDefaultSave(),beforeResources=structuredClone(save.galaxy.resources),beforeCrew=structuredClone(save.crew);
  let qualified=null;
  await completeCourse(getHubTrainingOperatorIdV132(save),(event,hub)=>{
    if(event.action==='hub:loader-training-issued-v132'){save.hub.hubTrainingV132=hub.hubTrainingSnapshotV132();delete save.hub.hubTrainingV132.commands;return true;}
    if(event.action==='hub:loader-training-qualified-v132'){qualified=event.receipt;assert.equal(recordHubLoaderQualificationV132(save,event.receipt).applied,true);return true;}
    return true;
  });
  assert.ok(qualified);assert.equal(save.hub.loaderQualificationV132.receipt.id,qualified.id);
  assert.equal(recordHubLoaderQualificationV132(save,qualified).reason,'already-qualified');
  assert.deepEqual(save.galaxy.resources,beforeResources);assert.deepEqual(save.crew,beforeCrew);
  const migrated=migrateSave(save);assert.equal(migrated.hub.loaderQualificationV132.receipt.id,qualified.id);
  assert.equal(recordHubLoaderQualificationV132(migrated,qualified).reason,'already-qualified');
  const noIssuance=createDefaultSave();assert.equal(recordHubLoaderQualificationV132(noIssuance,qualified).applied,false);
  const foreign=structuredClone(save);foreign.profile=2;foreign.hub.loaderQualificationV132={schema:132,serial:0,receipt:null};
  assert.equal(recordHubLoaderQualificationV132(foreign,qualified).applied,false);
  const forged=structuredClone(save);forged.hub.loaderQualificationV132={schema:132,serial:0,receipt:null};forged.hub.hubTrainingV132.course.parked=false;
  assert.equal(recordHubLoaderQualificationV132(forged,qualified).applied,false);
});
