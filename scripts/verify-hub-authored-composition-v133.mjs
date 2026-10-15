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
import {HUB_TRAVERSAL_ART_FILES} from '../src/hub-v51-runtime.js';
import {HUB_ROOM_NAVIGATION_V133,validateHubWalkingLaneV133} from '../src/hub-navigation-layout-v133.js';
import {ELECTRICAL_HAZARD_ART_V55} from '../src/hub-art-runtime-v55.js';
import {getHubDoorBounds} from '../src/hub-profiles-v53.js';
import {withHubAuthoredCompositionV133,HUB_AUTHORED_COMPOSITIONS_V133,drawHubAuthoredLayerV133,drawHubSteelPlatformV133,drawHubSteelLadderV133,drawHubSteelServicesV133} from '../src/hub-authored-composition-v133.js';
import {createHubCommercialStateV87} from '../src/hub-annex-registry-v87.js';
import {createDefaultSave} from '../src/save.js';
const Engine=withHubAuthoredCompositionV133(withHubTrainingV132(ProductionHub)),root=fileURLToPath(new URL('../',import.meta.url));
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
    fillRect(...bounds){rects.push({kind:'fill',bounds});},rect(...bounds){rects.push({kind:'clip',bounds});},drawImage(image,...bounds){images.push({source:image.src,bounds});},
    measureText:text=>({width:String(text).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),
    getImageData:()=>({data:new Uint8ClampedArray(4),width:1,height:1})},{get:(target,key)=>key in target?target[key]:()=>{}});
  const canvas=Object.assign(new EventTarget(),{width:1280,height:720,getContext:()=>ctx,focus(){document.activeElement=this;},getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})});
  const key=(type,code)=>{const event=new Event(type,{cancelable:true});Object.assign(event,{code,repeat:false,ctrlKey:false,metaKey:false,altKey:false});events.dispatchEvent(event);};
  return {canvas,ctx,texts,images,rects,key,balanced:()=>assert.equal(depth,0)};
}

async function fixture(deck=0,x=100,hubState=null){
 const browser=host(),events=[],patches=[],save=createDefaultSave();save.needsPlayerCreationV84=false;
 const hub=new Engine(browser.canvas,{onAction:event=>events.push(event),onPersist:patch=>patches.push(structuredClone(patch)),onStatus:()=>{}});
 hub.start(hubState||{deck,roomId:HUB_DECKS[deck].rooms[Math.floor(x/1280)].id,positionX:x,positionY:532},{routineContextV62:{save,crew:save.crew,clock:save.clock}});
 for(let index=0;index<8;index++)await Promise.resolve();return {...browser,hub,events,patches,save};
}
function tap(subject,code){subject.key('keydown',code);subject.key('keyup',code);}
function advance(subject,seconds){for(let t=0;t<seconds-1e-9;t+=1/60)subject.hub.update(Math.min(1/60,seconds-t));}
function walk(subject,x){const direction=subject.hub.player.x<x?'KeyD':'KeyA';subject.key('keydown',direction);
 for(let count=0;count<3600&&Math.abs(subject.hub.player.x-x)>7;count++)subject.hub.update(1/60);
 subject.key('keyup',direction);advance(subject,.15);
 assert.ok(Math.abs(subject.hub.player.x-x)<42,`Walk stopped at ${subject.hub.player.x}, target ${x}`);
}


test('production composition supplies distinct purpose instrumentation to all sixteen rooms without changing the walking physics',async()=>{
 for(let deck=0;deck<4;deck++)for(const room of HUB_DECKS[deck].rooms){
  const subject=await fixture(deck,room.xStart+room.profile.worldWidth/2),before={player:structuredClone(subject.hub.player),platforms:structuredClone(subject.hub.v51Platforms),obstacles:structuredClone(subject.hub.obstacles),stock:structuredClone(subject.save.galaxy.resources),crew:structuredClone(subject.save.crew),events:subject.events.length};
  subject.hub.draw();subject.balanced();
  assert.ok(subject.texts.includes(HUB_AUTHORED_COMPOSITIONS_V133[room.id].title),room.id);
  assert.deepEqual(subject.hub.v51Platforms,before.platforms);assert.deepEqual(subject.hub.obstacles,before.obstacles);
  assert.equal(subject.hub.player.x,before.player.x);assert.equal(subject.hub.player.y,before.player.y);
  assert.deepEqual(subject.save.galaxy.resources,before.stock);assert.deepEqual(subject.save.crew,before.crew);assert.equal(subject.events.length,before.events);
  const rejected=Object.entries(HUB_TRAVERSAL_ART_FILES).filter(([id])=>id!=='vent').map(([,path])=>path);
  assert.ok(!subject.images.some(image=>rejected.includes(image.source)||image.source?.endsWith('-overhead.png')),room.id);
  assert.equal(subject.hub.getSnapshot().hubAuthoredCompositionV133.rooms,35);
 }
});
test('all thirteen physical annexes render their purpose without changing stations, platforms or commercial state',async()=>{
 for(const annex of HUB_ANNEXES_V87){
  const deck=HUB_DECKS.findIndex(entry=>entry.id===annex.parentDeck),room=HUB_DECKS[deck].rooms.find(entry=>entry.id===annex.parentRoomId);
  const commercial=createHubCommercialStateV87();Object.assign(commercial,{activeAnnexId:annex.id,lastAnnexId:annex.id,annexPositionX:150,annexPositionY:532,annexClimbing:false,
   returnContext:{deckId:annex.parentDeck,roomId:annex.parentRoomId,x:room.xStart+180,facing:1}});
  commercial.annexes[annex.id].visited=true;commercial.visitedAnnexIds.push(annex.id);
  const subject=annex.id==='personal-refuge'
   ? await fixture(deck,annex.parentDoorBounds.x+annex.parentDoorBounds.w/2-22)
   : await fixture(deck,room.xStart+180,{deck,roomId:room.id,positionX:room.xStart+180,positionY:532,commercialV71:commercial});
  if(annex.id==='personal-refuge'){tap(subject,'KeyE');advance(subject,.5);}
  assert.equal(subject.hub.currentAnnexV71()?.id,annex.id);
  const before=structuredClone(subject.hub.hubCommercialStateV71),geometry=structuredClone({platforms:annex.platforms,ladders:annex.ladders,station:annex.station}),stock=structuredClone(subject.save.galaxy.resources),crew=structuredClone(subject.save.crew);
  subject.hub.draw();subject.balanced();
  assert.ok(subject.texts.includes(HUB_AUTHORED_COMPOSITIONS_V133[annex.id].title),annex.id);
  assert.deepEqual(subject.hub.hubCommercialStateV71,before);assert.deepEqual({platforms:annex.platforms,ladders:annex.ladders,station:annex.station},geometry);
  assert.deepEqual(subject.save.galaxy.resources,stock);assert.deepEqual(subject.save.crew,crew);
 }
});
test('front room layers preserve source projection while clipping entirely below the real walk rail',()=>{
 const subject=host(),room={xStart:1280,profile:{worldWidth:1280,sceneScale:1,floorRatio:.82},world:{floorY:624}};
 const image={complete:true,naturalWidth:1800,naturalHeight:1000},entry={phase:'front',renderBounds:{x:0,y:0,w:1280,h:640}};
 drawHubAuthoredLayerV133(subject.ctx,image,entry,room);
 assert.deepEqual(subject.rects.find(entry=>entry.kind==='clip').bounds,[1280,628,1280,92]);
 assert.deepEqual(subject.images[0].bounds.slice(0,4),[0,0,1800,1000]);
 assert.equal(subject.images[0].bounds[7],640);subject.balanced();
});
test('original steel aligns deck edges, supporting rear posts and ladder rungs with actual traversal bounds',()=>{
 const subject=host(),platform={x:100,y:460,w:300,h:18},ladder={x:180,w:52,top:460,bottom:624},before=structuredClone({platform,ladder});
 drawHubSteelPlatformV133(subject.ctx,platform);drawHubSteelLadderV133(subject.ctx,ladder);
 assert.ok(subject.rects.some(entry=>entry.kind==='fill'&&entry.bounds.join(',')==='100,460,300,18'));
 assert.ok(subject.rects.some(entry=>entry.kind==='fill'&&entry.bounds.join(',')==='112,478,8,146'));
 assert.ok(subject.rects.some(entry=>entry.kind==='fill'&&entry.bounds.join(',')==='160,470,40,4'));
 assert.equal(subject.images.length,0);assert.deepEqual({platform,ladder},before);subject.balanced();
});
test('services have real transparent gaps and the forward conduits remain below the actor rail',()=>{
 const subject=host();drawHubSteelServicesV133(subject.ctx,{x:0,y:506,w:320,h:192,art:'foregroundPipes'});
 assert.deepEqual(subject.rects.find(entry=>entry.kind==='clip').bounds,[0,628,320,92]);
 drawHubSteelServicesV133(subject.ctx,{x:60,y:-12,w:520,h:126,art:'ceilingCables'});
 assert.equal(subject.images.length,0);subject.balanced();
});
test('rendering is opt-in outside editor playtests and the composition is idempotent',()=>{
 class Base{drawTraversalPlatform(){return 'native';}drawTraversalLadder(){return 'native-ladder';}drawTraversalOcclusions(){return 'native-occluder';}}
 const Engine=withHubAuthoredCompositionV133(Base),instance=new Engine();instance.editorPlaytest=true;
 assert.equal(withHubAuthoredCompositionV133(Engine),Engine);assert.equal(instance.drawTraversalPlatform(null,{}),'native');
 assert.equal(instance.drawTraversalLadder(null,{}),'native-ladder');assert.equal(instance.drawTraversalOcclusions(null),'native-occluder');
});
test('electrical art occupies its optional maintenance ledge and leaves the normal walking plane untouched',()=>{
 const {renderBounds,collisionBounds,supportY}=ELECTRICAL_HAZARD_ART_V55;
 assert.equal(supportY,440);assert.equal(collisionBounds.y+collisionBounds.h,440);assert.equal(renderBounds.y+renderBounds.h,440);
 assert.ok(collisionBounds.y+collisionBounds.h<=624-92);
});
