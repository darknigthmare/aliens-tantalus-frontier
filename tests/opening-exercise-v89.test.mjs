import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createOpeningExerciseV89, normalizeOpeningExerciseV89, advanceOpeningExerciseV89, getOpeningExerciseObjectiveV89 } from '../src/opening-exercise-v89.js';
import { createPlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { createPlayerOpeningV88 } from '../src/player-opening-v88.js';
import { SaveSystem, createDefaultSave, migrateSave } from '../src/save.js';
import { HubGame, HUB_ANNEX_BY_ID_V71, PROVING_GROUND_FIRING_PAD_V81 } from '../src/hub-opening-v88.js';
import { armProvingGroundSessionV81, beginProvingGroundSessionV81, registerProvingGroundTargetHitV81 } from '../src/proving-ground-session-v81.js';

const welcome = () => ({ ...createPlayerOnboardingV84({ name: 'Alex Moreau', callsign: 'FOX-9' }), phase: 'complete' });
const opening = () => ({ ...createPlayerOpeningV88(), phase: 'qualification' });
function proof(session, extra = {}) { return { onboardingComplete: true, openingPhase: 'qualification', inProvingGround: true, session, ...extra }; }
function threeHits() { let s=beginProvingGroundSessionV81(armProvingGroundSessionV81()); for(let i=0;i<3;i++)s=registerProvingGroundTargetHitV81(s,s.targets[s.currentTargetIndex].id).state;return s; }
function backend() { const values=new Map();return {deny:false,getItem:k=>values.get(k)??null,setItem(k,v){if(this.deny)throw Error('quota');values.set(k,v);},removeItem:k=>values.delete(k)}; }

test('new timelines opt in explicitly; V88 in-flight and legacy saves are never retroactively interrupted',()=>{
 const storage=backend(),s=new SaveSystem(storage);assert.equal(s.data.openingExerciseV89,null);
 s.newPlayerTimelineV84({name:'Alex Moreau',callsign:'FOX-9'},1);assert.deepEqual(s.data.openingExerciseV89,createOpeningExerciseV89());
 const old=createDefaultSave();old.onboardingV84=welcome();old.openingV88=opening();assert.equal(migrateSave(old).openingExerciseV89,null);
 for(const raw of [null,{},[],{schema:90,phase:'pending'},{schema:89,phase:'return',sessionId:'fake'}])assert.equal(normalizeOpeningExerciseV89(raw),null);
 assert.deepEqual(normalizeOpeningExerciseV89({...createOpeningExerciseV89(),reward:999}),createOpeningExerciseV89());
});

test('pure sequence requires real session evidence, physical console, elapsed time and return to firing pad',()=>{
 const session=threeHits(),start=createOpeningExerciseV89(),before=structuredClone(start);
 for(const patch of [{inProvingGround:false},{onboardingComplete:false},{openingPhase:'ready'},{session:{...session,hits:2}}])assert.equal(advanceOpeningExerciseV89(start,'interrupt',proof(session,patch)).ok,false);
 let result=advanceOpeningExerciseV89(start,'interrupt',proof(session));assert.equal(result.ok,true);assert.deepEqual(start,before);
 let s=result.state;
 for(const patch of [{consoleContact:false,repairSeconds:3},{consoleContact:true,repairSeconds:2.99},{consoleContact:true,repairSeconds:NaN}])assert.equal(advanceOpeningExerciseV89(s,'repair',proof(session,patch)).ok,false);
 assert.equal(advanceOpeningExerciseV89(s,'repair',proof({...session,sessionId:'m41a-qualification-v81:session-2'},{consoleContact:true,repairSeconds:3})).reason,'stale-session');
 s=advanceOpeningExerciseV89(s,'repair',proof(session,{consoleContact:true,repairSeconds:3})).state;
 assert.equal(advanceOpeningExerciseV89(s,'resume',proof(session)).ok,false);
 s=advanceOpeningExerciseV89(s,'resume',proof(session,{firingPadContact:true})).state;assert.equal(s.phase,'complete');
 assert.equal(advanceOpeningExerciseV89(s,'interrupt',proof(session)).ok,false);assert.equal(getOpeningExerciseObjectiveV89(s,opening(),welcome()),null);
 const armed=armProvingGroundSessionV81(session);assert.deepEqual(advanceOpeningExerciseV89(result.state,'restart',proof(armed)).state,createOpeningExerciseV89());
 assert.equal(advanceOpeningExerciseV89(s,'restart',proof(armed)).ok,false,'completed interruption cannot repeat on replay');
 const next={...session,sessionId:armed.sessionId};
 assert.equal(advanceOpeningExerciseV89(result.state,'interrupt',proof(next)).ok,true,'a failed restart checkpoint can recover against the next real session');
});

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const handler=app.slice(app.indexOf('function handleOpeningExerciseV89('),app.indexOf('\nfunction openOpeningDialogueV88'));
function withHub(run){
 const names=['Image','addEventListener','requestAnimationFrame','matchMedia'],previous=Object.fromEntries(names.map(n=>[n,globalThis[n]]));
 globalThis.Image=class{constructor(){this.complete=true;this.naturalWidth=1024;this.naturalHeight=1024;}set src(v){this.currentSrc=v;}};
 globalThis.addEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;globalThis.matchMedia=()=>({matches:false});
 const ctx=new Proxy({measureText:v=>({width:String(v).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
 const storage=backend(),saves=new SaveSystem(storage);saves.newPlayerTimelineV84({name:'Alex Moreau',callsign:'FOX-9'},1);
 saves.commit({onboardingV84:welcome(),openingV88:opening()});
 const scope={saveSystem:saves,hubOwnerV84:{profile:1},ownsTimelineV84:()=>scope.validOwner,validOwner:true,activeView:'hub',standaloneContext:null,
  advanceOpeningExerciseV89,clone:structuredClone,renderHubStatus(){},toast:m=>scope.messages.push(m),messages:[]};
 const sandbox=vm.createContext(scope);vm.runInContext(handler+';globalThis.handle=handleOpeningExerciseV89;',sandbox);
 const create=()=>new HubGame({width:1280,height:720,getContext:()=>ctx,addEventListener(){},focus(){}},{
  onAction:e=>e.action?.startsWith('opening-exercise:')?sandbox.handle(e):false,
  onPersist:patch=>{if(!scope.hubEngine?.restoringHubPoseV88)saves.commit({hub:{...saves.data.hub,...structuredClone(patch)}});}});
 let hub=create();scope.hubEngine=hub;
 scope.captureHubPoseV84=()=>({commercialV71:{...structuredClone(scope.hubEngine.hubCommercialStateV71),annexPositionX:Math.round(scope.hubEngine.player.x),annexPositionY:Math.round(scope.hubEngine.player.y)}});
 const options=()=>({onboardingV84:saves.data.onboardingV84,openingV88:saves.data.openingV88,openingExerciseV89:saves.data.openingExerciseV89});
 hub.start({...saves.data.hub,deck:2,roomId:'armory',positionX:1900},options());hub.activateAnnexV71(HUB_ANNEX_BY_ID_V71['proving-ground']);
 const station=()=>Object.assign(scope.hubEngine.player,{x:HUB_ANNEX_BY_ID_V71['proving-ground'].station.bounds.x-56,y:532,vx:0,vy:0,grounded:true,climbing:false});
 const pad=()=>Object.assign(scope.hubEngine.player,{...PROVING_GROUND_FIRING_PAD_V81.playerPose,vx:0,vy:0,grounded:true,climbing:false});
 const reload=()=>{const snapshot=structuredClone(saves.data.hub);hub=create();scope.hubEngine=hub;hub.start(snapshot,options());return hub;};
 try{return run({hub,saves,storage,scope,station,pad,reload,handle:sandbox.handle});}finally{Object.assign(globalThis,previous);}
}
function fire(h){const target=h.provingGroundStateV81.targets[h.provingGroundStateV81.currentTargetIndex],before=h.provingGroundStateV81.hits;
 if(target.lane!=='level')h.setControl('aim-'+target.lane,true);assert.ok(h.fire());if(target.lane!=='level')h.setControl('aim-'+target.lane,false);
 for(let i=0;i<240&&h.provingGroundStateV81.hits===before;i++)h.update(1/120);assert.equal(h.provingGroundStateV81.hits,before+1);}
function start(f){f.station();f.hub.interact();f.pad();f.hub.update(1/60);for(let i=0;i<3;i++)fire(f.hub);assert.equal(f.saves.data.openingExerciseV89.phase,'console');}

test('three real projectiles suspend timer/targets/ammo; player walks freely; page resume preserves frozen state and actual console pose',()=>withHub(f=>{
 start(f);let h=f.hub;const session=structuredClone(h.provingGroundStateV81),x=h.player.x;
 h.setControl('right',true);for(let i=0;i<20;i++)h.update(1/60);h.setControl('right',false);assert.ok(h.player.x>x+20);
 assert.equal(h.fire(),false);assert.equal(h.requestProvingGroundReloadV81().started,false);
 for(let i=0;i<100;i++)h.update(.1);assert.deepEqual(h.provingGroundStateV81,session);
 f.station();h.persist();const pos={x:h.player.x,y:h.player.y};h=f.reload();assert.equal(h.player.x,pos.x);assert.equal(h.player.y,pos.y);assert.equal(h.exerciseContactV89(),'repair');
 assert.deepEqual(h.provingGroundStateV81,session);h.update(.1);assert.deepEqual(h.provingGroundStateV81,session);
 assert.equal(h.exerciseRepairV89,null,'partial work never auto-completes after reload');
}));

test('repair freezes in pause, cancels movement, checkpoints once and resumes only from physical firing pad',()=>withHub(f=>{
 start(f);const h=f.hub;f.station();h.interact();for(let i=0;i<10;i++)h.update(.1);const elapsed=h.exerciseRepairV89.elapsed;
 h.running=false;h.update(50);assert.equal(h.exerciseRepairV89.elapsed,elapsed);h.running=true;
 h.keys.add('KeyD');h.update(.1);h.keys.clear();assert.equal(h.exerciseRepairV89,null);
 f.station();h.interact();for(let i=0;i<35;i++)h.update(.1);assert.equal(f.saves.data.openingExerciseV89.phase,'return');
 assert.equal(f.handle({action:'opening-exercise:resume',sessionId:h.provingGroundStateV81.sessionId}),false);
 f.pad();h.interact();assert.equal(f.saves.data.openingExerciseV89.phase,'complete');assert.equal(h.exerciseSuspendedV89(),false);
 fire(h);assert.equal(h.provingGroundStateV81.hits,4);h.requestProvingGroundReloadV81();for(let i=0;i<200;i++)h.update(1/120);
 for(let i=4;i<9;i++)fire(h);assert.equal(h.provingGroundStateV81.phase,'completed');assert.equal(h.provingGroundStateV81.hits,9);assert.equal(h.provingGroundStateV81.reloadCount,1);
 assert.equal(f.saves.data.openingExerciseV89.phase,'complete');
}));

test('real app handler rejects stale profile, view and session; quota keeps both ledgers unchanged and retry is explicit',()=>withHub(f=>{
 start(f);const h=f.hub,event={action:'opening-exercise:repair',sessionId:h.provingGroundStateV81.sessionId};f.station();h.exerciseRepairV89={complete:true,elapsed:3};
 const before=JSON.stringify(f.saves.data),reference=f.saves.data;
 for(const [key,value] of [['validOwner',false],['activeView','settings'],['standaloneContext','forge-playtest']]){const old=f.scope[key];f.scope[key]=value;assert.equal(f.handle(event),false);f.scope[key]=old;assert.equal(f.saves.data,reference);}
 assert.equal(f.handle({...event,sessionId:'m41a-qualification-v81:session-2'}),false);
 f.storage.deny=true;assert.equal(f.handle(event),false);assert.equal(f.saves.data,reference);assert.equal(JSON.stringify(f.saves.data),before);assert.equal(h.openingExerciseV89.phase,'console');assert.match(f.scope.messages.at(-1),/Exercice non enregistré/);
 f.storage.deny=false;assert.equal(f.handle(event),true);assert.equal(f.saves.data.openingExerciseV89.phase,'return');
 assert.equal(f.handle(event),false,'duplicate completion cannot be replayed');
}));

test('failed initial interruption remains physically safe and retries without spending a round or advancing time',()=>withHub(f=>{
 const h=f.hub;f.station();h.interact();f.pad();h.update(1/60);fire(h);fire(h);
 // Exercise the handler quota separately from ordinary periodic hub-save error reporting.
 h.onPersist=()=>{};f.storage.deny=true;fire(h);
 assert.equal(f.saves.data.openingExerciseV89.phase,'pending');assert.equal(h.exerciseContactV89(),'interrupt');
 const frozen=structuredClone(h.provingGroundStateV81);for(let i=0;i<50;i++)h.update(.1);assert.deepEqual(h.provingGroundStateV81,frozen);assert.equal(h.fire(),false);
 f.storage.deny=false;h.interact();assert.equal(f.saves.data.openingExerciseV89.phase,'console');assert.deepEqual(f.saves.data.hub.provingGroundV81,frozen);
 const resumed=f.reload();assert.equal(resumed.exerciseSuspendedV89(),true);assert.deepEqual(resumed.provingGroundStateV81,frozen);
}));

test('abandoning the interrupted course aborts V81 normally; a new real session cannot reuse the old repair',()=>withHub(f=>{
 start(f);const h=f.hub,oldSession=h.provingGroundStateV81.sessionId;
 h.deactivateAnnexV71(HUB_ANNEX_BY_ID_V71['proving-ground']);assert.equal(h.provingGroundStateV81.phase,'aborted');assert.equal(h.exerciseSuspendedV89(),false);
 h.activateAnnexV71(HUB_ANNEX_BY_ID_V71['proving-ground']);f.station();h.interact();f.pad();h.update(1/60);
 assert.notEqual(h.provingGroundStateV81.sessionId,oldSession);for(let i=0;i<3;i++)fire(h);
 assert.equal(f.saves.data.openingExerciseV89.phase,'console');assert.equal(f.saves.data.openingExerciseV89.sessionId,h.provingGroundStateV81.sessionId);
 assert.equal(f.handle({action:'opening-exercise:repair',sessionId:oldSession}),false);
}));
