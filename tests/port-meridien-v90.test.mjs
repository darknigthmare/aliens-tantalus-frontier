import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';
import { createPortMeridienV90, normalizePortMeridienV90, advancePortMeridienV90, PORT_POSTS_V90, PORT_RECEIPT_V90, portTaskSecondsV90 } from '../src/port-meridien-v90.js';
import { PORT_ASSETS_V90 } from '../src/hub-port-meridien-v90.js';
import { createPlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { createPlayerOpeningV88 } from '../src/player-opening-v88.js';
import { SaveSystem, createDefaultSave, migrateSave, beginOperation, resolveOperation } from '../src/save.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { validateShipPortDepartureV87 } from '../src/ship-port-state-v87.js';
import { HubGame } from '../src/hub-opening-v88.js';

const welcome = () => ({ ...createPlayerOnboardingV84({ name: 'Alex Moreau', callsign: 'FOX-9' }), phase: 'complete' });
const opening = freight => ({ ...createPlayerOpeningV88(), phase: 'ready', qualificationId: 'm41a-qualification-v81:session-1:qualification', freight });
const actor = (phase, extra={}) => ({ x: PORT_POSTS_V90[phase].x-22, y: PORT_POSTS_V90[phase].y-92, w:44,h:92,grounded:true,alive:true,facing:1,...extra });
const proof = (state, extra={}) => ({revision:state.revision,openingPhase:'ready',onboardingComplete:true,actor:state.phase!=='pending'?actor(state.phase):null,...extra});
const landed = (freight='medical') => advancePortMeridienV90(createPortMeridienV90(),'board',proof(createPortMeridienV90(),{briefingContact:true,freight})).state;
function backend(){const m=new Map();return{deny:false,getItem:k=>m.get(k)??null,setItem(k,v){if(this.deny)throw Error('quota');m.set(k,v);},removeItem:k=>m.delete(k)};}

test('migration admits pre-deployment V88/V89, never rewinds an active sortie or forces legacy saves',()=>{
 const storage=backend(),s=new SaveSystem(storage);assert.equal(s.data.portMeridienV90,null);
 s.newPlayerTimelineV84({name:'Alex Moreau',callsign:'FOX-9'},1);assert.deepEqual(s.data.portMeridienV90,createPortMeridienV90());
 const old=createDefaultSave();old.onboardingV84=welcome();old.openingV88=opening('medical');delete old.portMeridienV90;
 assert.equal(migrateSave(old).portMeridienV90.phase,'pending');old.openingV88={...old.openingV88,phase:'deployed',operationId:'op-1'};assert.equal(migrateSave(old).portMeridienV90,null);
 assert.equal(migrateSave(createDefaultSave()).portMeridienV90,null);
 assert.equal(normalizePortMeridienV90({schema:90,phase:'complete',freight:'medical'}),null);
 const clean=normalizePortMeridienV90({...landed(),x:Infinity,y:NaN,civiliansX:[1e9],reward:999});assert.equal(clean.x,112);assert.equal(clean.y,532);assert.equal(clean.reward,undefined);
});

test('physical receipt sequence is strict, cargo-specific, immutable and non-repeatable',()=>{
 for(const freight of ['medical','energy']){
  let s=landed(freight);const original=structuredClone(s);
  assert.equal(advancePortMeridienV90(s,'unload',proof(s,{actor:actor('unload',{x:2000})})).ok,false);
  assert.equal(advancePortMeridienV90(s,'unload',proof(s,{revision:50})).ok,false);assert.deepEqual(s,original);
  for(const phase of ['unload','carry','triage','power']){
   assert.equal(s.phase,phase);if(['triage','power'].includes(phase)){
    assert.equal(portTaskSecondsV90(s),(phase==='triage')===(freight==='medical')?2:5);
    assert.equal(advancePortMeridienV90(s,phase,proof(s,{taskSeconds:NaN})).ok,false);
   }
   s=advancePortMeridienV90(s,phase,proof(s,{taskSeconds:5})).state;
  }
  s=advancePortMeridienV90(s,'escort',proof(s)).state;assert.equal(s.following,true);
  for(const civiliansX of [[],[2160],[2160,2215,2269],[2160,2215,NaN]])assert.equal(advancePortMeridienV90(s,'escort',proof(s,{civiliansX})).ok,false);
  s=advancePortMeridienV90(s,'escort',proof(s,{civiliansX:[2160,2215,2270]})).state;
  s=advancePortMeridienV90(s,'report',proof(s)).state;assert.equal(s.receipt,PORT_RECEIPT_V90);
  assert.equal(advancePortMeridienV90(s,'report',proof(s)).ok,false);
 }
});

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const handler=app.slice(app.indexOf('function handlePortMeridienV90('),app.indexOf('\nfunction openForgeContext'));
const boardHandler=app.slice(app.indexOf('function boardPortMeridienV90('),app.indexOf('\nfunction handlePortMeridienV90'));
function withHub(run,freight='medical'){
 const names=['Image','addEventListener','requestAnimationFrame','matchMedia'],before=Object.fromEntries(names.map(n=>[n,globalThis[n]]));
 globalThis.Image=class{constructor(){this.complete=true;this.naturalWidth=1024;this.naturalHeight=768;}set src(v){this.currentSrc=v;}};
 globalThis.addEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;globalThis.matchMedia=()=>({matches:false});
 const ctx=new Proxy({measureText:v=>({width:String(v).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
 const storage=backend(),saveSystem=new SaveSystem(storage);saveSystem.newPlayerTimelineV84({name:'Alex Moreau',callsign:'FOX-9'},1);
 saveSystem.commit({onboardingV84:welcome(),openingV88:opening(freight),portMeridienV90:landed(freight)});
 const scope={saveSystem,hubOwnerV84:{profile:1},ownsTimelineV84:()=>scope.owner,owner:true,activeView:'hub',standaloneContext:null,creatorOwnerV84:null,
  advancePortMeridienV90,normalizePortMeridienV90,validateShipPortDepartureV87,clone:structuredClone,captureHubPoseV84:()=>({positionX:1800,positionY:532}),toast:m=>scope.messages.push(m),messages:[],showView:n=>{scope.activeView=n;}};
 const sandbox=vm.createContext(scope);vm.runInContext(handler+boardHandler+';globalThis.handle=handlePortMeridienV90;globalThis.board=boardPortMeridienV90;',sandbox);
 const create=()=>new HubGame({width:1280,height:720,getContext:()=>ctx,addEventListener(){},focus(){}},{onAction:e=>e.action.startsWith('port:')?sandbox.handle(e):false,onPersist(){}});
 const options=()=>({onboardingV84:saveSystem.data.onboardingV84,openingV88:saveSystem.data.openingV88,portMeridienV90:saveSystem.data.portMeridienV90});
 let hub=create();scope.hubEngine=hub;hub.start(saveSystem.data.hub,options());
 const at=phase=>Object.assign(scope.hubEngine.player,actor(phase),{vx:0,vy:0,climbing:false});
 const reload=()=>{hub=create();scope.hubEngine=hub;hub.start(saveSystem.data.hub,options());return hub;};
 try{return run({hub,saveSystem,storage,scope,at,reload,handle:sandbox.handle,board:sandbox.board});}finally{Object.assign(globalThis,before);}
}
const tick=(hub,n)=>{for(let i=0;i<n;i++)hub.update(.1);};

test('real hub/app stores freight carry and standing repair, cancels movement and pauses work; ship pose unchanged',()=>withHub(f=>{
 let h=f.hub;const ship=JSON.stringify(f.saveSystem.data.hub),resources=JSON.stringify(f.saveSystem.data.galaxy.resources);
 f.at('unload');h.interact();assert.equal(h.portStateV90.phase,'carry');h.persist();h=f.reload();assert.equal(h.portStateV90.phase,'carry');
 f.at('carry');h.interact();f.at('triage');h.interact();tick(h,6);const elapsed=h.portTaskV90.elapsed;
 h.running=false;tick(h,40);assert.equal(h.portTaskV90.elapsed,elapsed);h.running=true;h.keys.add('KeyD');tick(h,1);h.keys.clear();assert.equal(h.portTaskV90,null);
 f.at('triage');h.interact();tick(h,5);h.persist();h=f.reload();assert.equal(h.portTaskV90,null);assert.equal(h.portStateV90.phase,'triage');
 h.interact();tick(h,22);assert.equal(h.portStateV90.phase,'power');
 assert.equal(JSON.stringify(f.saveSystem.data.hub),ship);assert.equal(JSON.stringify(f.saveSystem.data.galaxy.resources),resources);
 assert.equal(h.fire(),false);assert.equal(h.useLift(1),false);
}));

test('gate has actual collision, relay opens it only after work, escort must walk and survives reload',()=>withHub(f=>{
 let h=f.hub;for(const p of ['unload','carry']){f.at(p);h.interact();}f.at('triage');h.interact();tick(h,22);
 assert.ok(h.currentAnnexV71().colliders.some(c=>c.x===1824));
 Object.assign(h.player,{x:1780,y:532,vx:0,vy:0,grounded:true});h.keys.add('KeyD');tick(h,20);h.keys.clear();assert.ok(h.player.x+h.player.w<=1824.1);
 f.at('power');h.interact();tick(h,52);assert.equal(h.portStateV90.phase,'escort');assert.ok(!h.currentAnnexV71().colliders.some(c=>c.x===1824));
 f.at('escort');h.interact();const start=[...h.portStateV90.civiliansX];Object.assign(h.player,{x:1800,y:532,grounded:true});tick(h,10);assert.deepEqual(h.portStateV90.civiliansX,start,'distant player cannot teleport the group');
 Object.assign(h.player,{x:1100,y:532,grounded:true});tick(h,10);assert.ok(h.portStateV90.civiliansX[0]>start[0]);h.persist();const positions=f.saveSystem.data.portMeridienV90.civiliansX;h=f.reload();assert.deepEqual(h.portStateV90.civiliansX,positions);
 for(let n=0;n<220;n++){h.player.x=Math.min(2390,Math.min(...h.portStateV90.civiliansX)+230);h.player.y=532;h.player.grounded=true;h.update(.1);if(h.portStateV90.phase==='report')break;}
 assert.equal(h.portStateV90.phase,'report');f.at('report');h.interact();assert.equal(f.saveSystem.data.portMeridienV90.receipt,PORT_RECEIPT_V90);
 const durable=JSON.stringify(f.saveSystem.data);h=f.reload();f.at('complete');h.interact();assert.equal(f.scope.activeView,'operations');assert.equal(JSON.stringify(f.saveSystem.data),durable);
}));

test('real app owner/phase guards and quota are atomic; blocked walking can retry without duplicate grants',()=>withHub(f=>{
 const h=f.hub;f.at('unload');const event={action:'port:unload',revision:h.portStateV90.revision},saved=JSON.stringify(f.saveSystem.data);
 for(const [key,value] of [['owner',false],['activeView','settings'],['standaloneContext','forge'],['creatorOwnerV84',{}]]){const old=f.scope[key];f.scope[key]=value;assert.equal(f.handle(event),false);f.scope[key]=old;}
 f.storage.deny=true;assert.equal(f.handle(event),false);assert.equal(JSON.stringify(f.saveSystem.data),saved);assert.equal(h.portStateV90.phase,'unload');
 tick(h,11);assert.equal(h.portCommitBlockedV90,true);const x=h.player.x;h.keys.add('KeyD');tick(h,10);h.keys.clear();assert.equal(h.player.x,x);
 f.storage.deny=false;h.interact();assert.equal(h.portStateV90.phase,'carry');assert.equal(f.handle(event),false);
 assert.equal(f.saveSystem.data.portMeridienV90.revision,2);
}));

test('embarkation is an atomic physical briefing action; quota, wrong contact and stale owner cannot leave the ship',()=>withHub(f=>{
 f.saveSystem.commit({portMeridienV90:createPortMeridienV90(),hub:{...f.saveSystem.data.hub,deck:0,roomId:'briefing',positionX:1800,positionY:532}});
 const h=f.reload();assert.equal(h.isPortMeridienV90(),false);assert.equal(h.openingContactV88()?.phase,'ready');
 f.scope.owner=false;assert.equal(f.board(),false);f.scope.owner=true;
 const oldPort=f.saveSystem.data.shipPortV1;f.saveSystem.data.shipPortV1={...oldPort,phase:'docked'};assert.equal(f.board(),false);f.saveSystem.data.shipPortV1=oldPort;
 h.player.x=10;assert.equal(f.board(),false);h.player.x=1800;
 const saved=JSON.stringify(f.saveSystem.data);f.storage.deny=true;assert.equal(f.board(),false);assert.equal(JSON.stringify(f.saveSystem.data),saved);assert.equal(h.running,true);
 f.storage.deny=false;assert.equal(f.board(),true);assert.equal(f.saveSystem.data.portMeridienV90.phase,'unload');assert.equal(f.saveSystem.data.portMeridienV90.freight,'medical');
 assert.equal(f.board(),false);assert.equal(f.reload().isPortMeridienV90(),true);
}));

test('corrupted ground pose is resolved by actual collision and cannot overwrite parent or create a gate bypass',()=>withHub(f=>{
 for(const pose of [{x:450,y:590},{x:1850,y:450},{x:1e9,y:1e9},{x:NaN,y:NaN},{x:1250,y:200}]){
  f.saveSystem.commit({portMeridienV90:{...landed(),...pose}});const h=f.reload(),a=h.player;
  assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y));assert.ok(a.y+a.h<=624);
  for(const c of h.currentAnnexV71().colliders)assert.equal(a.x<c.x+c.w&&a.x+a.w>c.x&&a.y<c.y+c.h&&a.y+a.h>c.y,false);
  const y=a.y;h.update(.1);if(y===200)assert.ok(a.y>y,'airborne pose resumes with gravity');
 }
}));

test('operation boundary rejects incomplete quay and all reused bitmap paths exist',()=>{
 const save=createDefaultSave();save.onboardingV84=welcome();save.openingV88=opening('medical');save.portMeridienV90=landed();
 const before=structuredClone(save);assert.throws(()=>beginOperation(save,{id:'any'},{id:'any'}),/quai des vivants/);assert.deepEqual(save,before);
 for(const asset of Object.values(PORT_ASSETS_V90))assert.ok(existsSync(new URL('..'+asset,import.meta.url)),asset);
});

test('completed quay hands off to the real first sortie once and retreat never reopens its freight or receipt',()=>{
 for(const freight of ['medical','energy']){
  const save=createDefaultSave();save.onboardingV84=welcome();save.openingV88=opening(freight);
  save.portMeridienV90=normalizePortMeridienV90({...landed(freight),phase:'complete',receipt:PORT_RECEIPT_V90,revision:8});
  const quay=structuredClone(save.portMeridienV90),campaign=CAMPAIGNS.find(c=>save.galaxy.unlockedWorldIds.includes(c.worldId)),world=WORLDS.find(w=>w.id===campaign.worldId);
  const started=beginOperation(save,campaign,world);assert.equal(started.operation.flags['v88-opening-'+freight],true);assert.equal(save.openingV88.phase,'deployed');
  const paid=structuredClone(save.galaxy.resources);assert.equal(beginOperation(save,campaign,world).resumed,true);assert.deepEqual(save.galaxy.resources,paid);
  assert.equal(resolveOperation(save,{success:false,reason:'retreat'}).ok,true);assert.equal(save.openingV88.phase,'complete');assert.deepEqual(save.portMeridienV90,quay);
 }
});
