import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createDefaultSave, SAVE_PREFIX } from '../src/save.js';
import { createPlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { createPlayerOpeningV88 } from '../src/player-opening-v88.js';

const base=process.env.APP_URL||'http://127.0.0.1:4195/';
const freightOnly=process.env.QA_FREIGHT_ONLY==='1';
const checkpointOnly=process.env.QA_HANGAR_ONLY==='1';
const output=resolve(process.env.QA_OUTPUT||'E:/CodexQA/AliensTantalus/v88-opening-20260923');
await mkdir(output,{recursive:true});
const version=await fetch((process.env.CDP_ENDPOINT||'http://127.0.0.1:9237')+'/json/version').then(r=>r.json());
const socket=new WebSocket(version.webSocketDebuggerUrl);
await new Promise((ok,fail)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',fail,{once:true});});
let seq=0,session,context; const pending=new Map(),errors=[],requests=new Map();
socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Network.requestWillBeSent')requests.set(m.params.requestId,m.params.request.url);if(m.method==='Network.loadingFinished'||m.method==='Network.loadingFailed')requests.delete(m.params.requestId);if(m.method==='Network.loadingFailed'&&!m.params.canceled)errors.push(m.params.errorText);});
socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(pending.has(m.id)){const j=pending.get(m.id);pending.delete(m.id);m.error?j.reject(Error(m.error.message)):j.resolve(m.result);}if(m.method==='Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Network.responseReceived'&&m.params.response.status>=400)errors.push(m.params.response.status+' '+m.params.response.url);});
const cdp=(method,params={},browser=false)=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params,...(session&&!browser?{sessionId:session}:{})}));});
async function evaluate(expression){const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(ok=>setTimeout(ok,ms));
async function until(expression,label,limit=20000){const end=Date.now()+limit;while(Date.now()<end){if(await evaluate(expression))return;await wait(65);}throw Error(label);}
async function key(code,down=true){await cdp('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',code,key:code==='Space'?' ':code.replace('Key','').toLowerCase()});}
async function tap(code){await key(code);await wait(55);await key(code,false);await wait(100);}
async function click(selector){
 await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'center',inline:'center',behavior:'instant'});})()`);await wait(80);
 const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();if(!r.width||!r.height||e.hidden||e.disabled)throw Error('unavailable '+${JSON.stringify(selector)});const x=r.x+r.width/2,y=r.y+r.height/2,target=document.elementFromPoint(x,y);if(!target||!(target===e||e.contains(target)))throw Error('occluded '+${JSON.stringify(selector)}+' '+JSON.stringify({x,y,target:target?.id}));return{x,y}})()`);
 for(const type of ['mousePressed','mouseReleased'])await cdp('Input.dispatchMouseEvent',{type,...p,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1});await wait(120);
}
const state='__ATF_V51__.saveSystem.data.openingV88',hub='__ATF_HUB__';
const pose=`({x:${hub}.player.x,y:${hub}.player.y,vy:${hub}.player.vy,grounded:${hub}.player.grounded,climbing:${hub}.player.climbing,keys:[...${hub}.keys],jump:${hub}.jumpQueued,health:${hub}.player.health,saved:__ATF_V51__.saveSystem.data.hub.positionY,inputs:globalThis.__openingInputTrace})`;
const report={ok:false,scope:'Isolated profile fixture immediately after completed V84 briefing; native movement, lifts, annex route, nine real shots/reload, relay timer, dialogue, freight, first deployment and reload. No game-state mutation after one initial storage fixture.',checks:{},screenshots:[],errors};
async function capture(name){const s=await cdp('Page.captureScreenshot',{format:'jpeg',quality:80,captureBeyondViewport:false});await writeFile(resolve(output,name+'.jpg'),Buffer.from(s.data,'base64'));report.screenshots.push(name+'.jpg');}
async function boot(){await until('globalThis.__ATF_V61__&&!document.querySelector("#boot")','boot',90000);await click('#title-start');await click('#title-continue');if(await evaluate('Boolean(__ATF_V51__.saveSystem.data.strategy.currentOperation)'))await click('#operation-launch');await until(hub+'.running||__ATF_GAME__.running','runtime ready');}
async function reload(){const started=Date.now();await evaluate('window.__openingOldDocument=true');await cdp('Page.reload',{ignoreCache:true});await until('typeof __openingOldDocument==="undefined"&&globalThis.__ATF_V61__&&!document.querySelector("#boot")','reload',90000);await boot();(report.checks.reloadMilliseconds??=[]).push(Date.now()-started);}
async function hold(code,predicate,label,limit=15000){await key(code);try{await until(predicate,label,limit);}finally{await key(code,false);}await wait(100);}
async function walkX(x,label){let old=null,stuck=0;const end=Date.now()+35000;while(Date.now()<end){const p=await evaluate(`({x:${hub}.player.x,y:${hub}.player.y,running:${hub}.running})`);if(Math.abs(p.x-x)<10)break;if(!p.running)throw Error('paused during '+label);const code=p.x<x?'KeyD':'KeyA';await key(code);await wait(Math.min(90,Math.max(25,Math.abs(p.x-x)*3)));await key(code,false);if(old!==null&&Math.abs(old-p.x)<2)stuck++;else stuck=0;if(stuck>=3){await key(code);await tap('Space');await wait(220);await key(code,false);stuck=0;}old=p.x;}assert.ok(Math.abs(await evaluate(hub+'.player.x')-x)<20,label);}
async function deck(target){while(await evaluate(hub+'.state.deck')!==target){const lift=await evaluate(`(()=>{const h=${hub};return h.doorStates.filter(d=>d.lift).sort((a,b)=>Math.abs(a.x-h.player.x)-Math.abs(b.x-h.player.x))[0]?.x-h.player.w/2})()`);await walkX(lift,'lift route');const before=await evaluate(hub+'.state.deck');await tap(before<target?'KeyS':'KeyW');await until(hub+'.state.deck!=='+before,'lift changes deck');}}
async function travel(keys,predicate,label){for(const code of keys)await key(code);try{await until(predicate,label,18000);}finally{for(const code of keys)await key(code,false);}await wait(100);}
const center=hub+'.player.x+'+hub+'.player.w/2',feet=hub+'.player.y+'+hub+'.player.h';
async function hangarRoute(back=false){
 const health=await evaluate(hub+'.player.health');
 if(!back){
  await deck(3);await walkX(2350,'reactor midship lift');
  await travel(['KeyA'],center+'<=2300','reactor service ladder');
  await travel(['KeyW'],feet+'<=502.01','lower reactor catwalk');
  await tap('Space');await travel(['KeyA'],center+'<=2180&&'+hub+'.player.grounded','lower landing');
  await travel(['KeyA'],center+'<=1840','upper reactor ladder');
  await travel(['KeyW'],feet+'<=382.01','upper reactor catwalk');
  await tap('Space');await travel(['KeyA'],center+'<=1740&&'+hub+'.player.grounded','upper landing');
  await travel(['KeyA'],center+'<=1600','duct right');
  await travel(['KeyC','KeyA'],center+'<=1380','crawl existing duct');
  await travel(['KeyA'],center+'<=1180','hangar control booth');
 }else{
  await travel(['KeyD'],center+'>=1380','duct left');
  await travel(['KeyC','KeyD'],center+'>=1590','crawl return duct');
  await travel(['KeyD'],center+'>=2260','reactor egress');
  await travel(['KeyS'],feet+'>=624','reactor floor');
  await tap('Space');await travel(['KeyD'],center+'>=2372&&'+hub+'.player.grounded','midship lift');
 }
 assert.equal(await evaluate(hub+'.player.health'),health,'maintenance route avoids live electrical arc');
}
async function post(phase){
 if(phase==='manifest'){await hangarRoute();await until(hub+`.openingContactV88()?.phase==='manifest'&&${hub}.player.grounded`,'booth contact');return;}
 if(phase==='ready'&&await evaluate(hub+`.state.deck===3&&${hub}.currentRoom().id==='dropship-hangar'`))await hangarRoute(true);
 const p=await evaluate(`(async()=>{const m=await import('/src/hub-opening-v88.js'),s=await import('/src/player-opening-v88.js'),p=s.OPENING_POSTS_V88[${JSON.stringify(phase)}],r=m.HUB_DECKS[p.deck].rooms.find(r=>r.id===p.roomId);return{deck:p.deck,x:r.propInteractionBounds.x+8}})()`);await deck(p.deck);const direction=await evaluate(hub+'.player.x')<p.x?'KeyD':'KeyA';await key(direction);let old=null,stuck=0;try{for(let i=0;i<240;i++){if(await evaluate(hub+`.openingContactV88()?.phase===${JSON.stringify(phase)}`))break;const x=await evaluate(hub+'.player.x');if(old!==null&&Math.abs(old-x)<2)stuck++;else stuck=0;if(stuck>=4){await tap('Space');stuck=0;}old=x;await wait(100);}}finally{await key(direction,false);}await until(hub+`.openingContactV88()?.phase===${JSON.stringify(phase)}&&${hub}.player.grounded`,phase+' stable contact');await wait(200);
}
try{
 ({browserContextId:context}=await cdp('Target.createBrowserContext',{},true));const{targetId}=await cdp('Target.createTarget',{url:'about:blank',browserContextId:context},true);({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true},true));for(const d of ['Page','Runtime','Network'])await cdp(d+'.enable');await cdp('Network.setBypassServiceWorker',{bypass:true});await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:720,mobile:false,deviceScaleFactor:1});await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});
 await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`window.__openingInputTrace=[];for(const type of ['keydown','keyup','pointerdown','pointerup'])addEventListener(type,event=>{__openingInputTrace.push({type,code:event.code,target:event.target?.id,control:event.target?.dataset?.hubControl});if(__openingInputTrace.length>24)__openingInputTrace.shift();},true);`});
 const save=createDefaultSave();save.needsPlayerCreationV84=false;save.onboardingV84={...createPlayerOnboardingV84({name:'Alex Moreau',callsign:'FOX-9'}),phase:'complete'};save.openingV88=createPlayerOpeningV88();save.scene='hub';Object.assign(save.hub,{deck:0,roomId:'briefing',positionX:1515,facing:1});
 if(freightOnly){Object.assign(save.openingV88,{phase:'ready',qualificationId:'m41a-qualification-v81:session-1:qualification',freight:'medical'});report.scope='Isolated ready-at-briefing fixture; native first deployment/insertion and reload. Actual freight inventory and no second grant; route and qualification are covered by the full opening scenario.';}
 if(checkpointOnly){Object.assign(save.openingV88,{phase:'manifest',qualificationId:'m41a-qualification-v81:session-1:qualification'});Object.assign(save.hub,{deck:3,roomId:'dropship-hangar',positionX:1180,positionY:268});report.scope='Isolated hangar-upper-checkpoint fixture; native freight, reload, return route and first sortie. Does not claim preceding opening stages.';}
 await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`if(!localStorage.getItem('qa-opening-fixture-v88')){localStorage.setItem(${JSON.stringify(SAVE_PREFIX+'1')},${JSON.stringify(JSON.stringify(save))});localStorage.setItem('qa-opening-fixture-v88','1')}`});await cdp('Page.navigate',{url:base+'?qa=opening-v88'});await cdp('Page.bringToFront');await boot();await capture('01-briefing-continuation');
 if(!freightOnly&&!checkpointOnly){
 await post('berth');await tap('KeyE');assert.equal(await evaluate(state+'.phase'),'armory');await capture('02-berth');
 await post('armory');await tap('KeyE');assert.equal(await evaluate(state+'.phase'),'qualification');
 const armoryLadders=await evaluate(hub+`.v51Ladders.filter(l=>l.roomId==='armory').sort((a,b)=>b.bottom-a.bottom)`);
 for(const ladder of armoryLadders){await walkX(ladder.x-22,'armory ladder');await hold('KeyW',`${hub}.player.y+${hub}.player.h<=${ladder.top+11}`,'armory climb');await tap('Space');await until(`${hub}.player.grounded&&!${hub}.player.climbing`,'armory platform');}
 const doorX=await evaluate(hub+`.getParentAnnexDoorV71('proving-ground').bounds.x`);await walkX(doorX,'proving door');await until(hub+`.nearestParentAnnexDoorV71()?.annexId==='proving-ground'`,'door contact');await tap('KeyE');await until(hub+`.currentAnnexV71()?.id==='proving-ground'&&!${hub}.annexTransitionV71`,'enter stand');
 await hold('KeyA',hub+'.nearestAnnexStationV71()','console');await tap('KeyE');await until(hub+`.provingGroundStateV81.phase==='armed'`,'armed');
 await hold('KeyD',`(()=>{const h=${hub},l=h.currentAnnexV71().ladders[0],c=h.player.x+h.player.w/2;return c>=l.x+8&&c<=l.x+l.w-8})()`,'ladder');
 await hold('KeyW',`(()=>{const h=${hub},l=h.currentAnnexV71().ladders[0];return h.player.y+h.player.h<=l.top+1})()`,'climb');
 await until(`${hub}.player.grounded&&!${hub}.player.climbing`,'catwalk');await hold('KeyA',hub+`.provingGroundStateV81.phase==='active'`,'firing pad');
 for(let i=0;i<9;i++){if(await evaluate(hub+'.provingGroundStateV81.ammo.magazine')===0){await tap('KeyR');await until(hub+'.provingGroundStateV81.reloadCount>=1&&!'+hub+'.provingGroundStateV81.reload.active','reload');}const lane=await evaluate(`${hub}.provingGroundStateV81.targets[${hub}.provingGroundStateV81.currentTargetIndex].lane`),aim=lane==='high'?'KeyW':lane==='low'?'KeyS':null;if(aim)await key(aim);await tap('KeyF');await until(hub+'.provingGroundStateV81.hits==='+ (i+1),'target '+i,5000);if(aim)await key(aim,false);}
 await until(state+`.phase==='relay'`,'verified receipt advances opening');report.checks.proving=await evaluate(hub+'.provingGroundStateV81');await capture('03-qualified');
 const exit=await evaluate(hub+'.annexExitDoorV71().bounds.x');await walkX(exit,'stand exit');await until(hub+'.nearestAnnexExitV71()','exit door');await tap('KeyE');await until('!'+hub+'.isAnnexActiveV71()&&!'+hub+'.annexTransitionV71','returned armory');
 await post('relay');await tap('KeyE');await wait(650);await tap('KeyD');assert.equal(await evaluate(hub+'.openingRepairV88'),null);await post('relay');await tap('KeyE');await until(state+`.phase==='signal'`,'three-second repair');await capture('04-relay-complete');
 await post('signal');await tap('KeyE');await click('#hub-dialogue-continue');assert.equal(await evaluate(state+'.signalNode'),1);await capture('05-signal');await reload();assert.equal(await evaluate(state+'.signalNode'),1);await tap('KeyE');await click('#hub-dialogue-continue');await click('#hub-dialogue-continue');assert.equal(await evaluate(state+'.phase'),'manifest');
 await post('manifest');
 }
 if(!freightOnly){
 report.checks.hangarBeforeChoice=await evaluate(pose);await tap('KeyE');await capture('06-freight-choice');await click('[data-opening-freight-v88="medical"]');assert.equal(await evaluate(state+'.freight'),'medical');assert.equal(await evaluate(state+'.phase'),'ready');report.checks.hangarBeforeReload=await evaluate(pose);assert.equal(report.checks.hangarBeforeReload.saved,Math.round(report.checks.hangarBeforeChoice.y));await reload();assert.equal(await evaluate(state+'.freight'),'medical');report.checks.hangarAfterReload=await evaluate(pose);assert.equal(report.checks.hangarAfterReload.y,report.checks.hangarBeforeChoice.y,'no spontaneous jump on reload');assert.equal(report.checks.hangarAfterReload.grounded,true);await until(hub+'.player.grounded','hangar landing after reload',5000);report.checks.hangarSettled=await evaluate(pose);assert.equal(report.checks.hangarSettled.y,report.checks.hangarBeforeChoice.y,'same physical support after reload');assert.equal(report.checks.hangarSettled.health,report.checks.hangarBeforeChoice.health,'reload never drops into flightline hazard');
 }
 await post('ready');await tap('KeyE');await click('#hub-dialogue-continue');await until('document.documentElement.dataset.hubStation==="operations"','first operations station');await capture('07-first-sortie-ready');
 report.checks.ready=await evaluate(state);report.checks.realMovementAndQualification=!freightOnly&&!checkpointOnly;report.checks.signalReload=!freightOnly&&!checkpointOnly;report.checks.freightReload=!freightOnly;
 await click('#operation-launch');await until(state+`.phase==='deployed'`,'first deployment consumes freight');
 for(let i=0;i<160&&!await evaluate('__ATF_GAME__.running');i++){if(await evaluate('Boolean(document.querySelector("[data-insertion-action=advance]"))'))await click('[data-insertion-action="advance"]');await wait(200);}
 await until('__ATF_GAME__.running','first combat runtime',15000);
 const first=await evaluate(`({medkits:__ATF_GAME__.inventory.medkits,flag:__ATF_V51__.saveSystem.data.strategy.currentOperation.flags['v88-opening-medical'],saved:__ATF_V51__.saveSystem.data.strategy.currentOperation.resumeState?.inventory?.medkits})`);
 assert.equal(first.flag,true);assert.ok(first.medkits>=3);assert.equal(first.saved,first.medkits);report.checks.medicalFreight={first};await capture('08-medical-freight-deployed');
 await reload();await until('__ATF_GAME__.running','mission reload');const resumed=await evaluate('({medkits:__ATF_GAME__.inventory.medkits,resume:__ATF_GAME__.lastResumeResult})');assert.equal(resumed.resume.applied,true);assert.equal(resumed.medkits,first.medkits);report.checks.medicalFreight={first,resumed};await capture('09-medical-freight-resumed');
 await click('#retreat-mission');await until(state+`.phase==='complete'&&${hub}.running`,'retreat closes opening');report.checks.final=await evaluate(state);assert.equal(report.checks.final.outcome,'retreat');assert.deepEqual(errors,[]);report.ok=true;
}catch(error){report.failure=error.stack;report.last=await evaluate(`globalThis.${hub}?({x:${hub}.player?.x,y:${hub}.player?.y,deck:${hub}.state?.deck,room:${hub}.currentRoom()?.id,contact:${hub}.nearestInteraction()?.action,phase:${state}?.phase,annex:${hub}.currentAnnexV71()?.id,dialog:document.querySelector('#hub-dialogue-text')?.textContent,toast:document.querySelector('#toast')?.textContent}):null`).catch(()=>null);await capture('failure').catch(()=>{});process.exitCode=1;}
finally{if(!report.ok)report.pendingRequests=[...requests.values()];await writeFile(resolve(output,'opening-v88-browser.json'),JSON.stringify(report,null,2));if(context)await cdp('Target.disposeBrowserContext',{browserContextId:context},true).catch(()=>{});socket.close();console.log(JSON.stringify({ok:report.ok,failure:report.failure,last:report.last,checks:report.checks.final,errors,output},null,2));}
