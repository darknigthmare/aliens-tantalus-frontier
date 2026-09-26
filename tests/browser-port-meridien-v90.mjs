import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createDefaultSave, SAVE_PREFIX } from '../src/save.js';
import { createPlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { createPlayerOpeningV88 } from '../src/player-opening-v88.js';
import { createPortMeridienV90, PORT_RECEIPT_V90 } from '../src/port-meridien-v90.js';

const base=process.env.APP_URL||'http://127.0.0.1:4195/';
const output=resolve(process.env.QA_OUTPUT||'E:/CodexQA/AliensTantalus/v90-opening-20260923');
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
const report={ok:false,scope:'Isolated ready briefing fixture; native embarkation, carry, triage, real ladder/power relay, civilian escort, receipt and reloads. No runtime-state writes after initial fixture.',checks:{},screenshots:[],errors};
async function capture(name){const s=await cdp('Page.captureScreenshot',{format:'jpeg',quality:80,captureBeyondViewport:false});await writeFile(resolve(output,name+'.jpg'),Buffer.from(s.data,'base64'));report.screenshots.push(name+'.jpg');}
async function boot(){await until('globalThis.__ATF_V61__&&!document.querySelector("#boot")','boot',90000);await click('#title-start');await click('#title-continue');if(await evaluate('Boolean(__ATF_V51__.saveSystem.data.strategy.currentOperation)'))await click('#operation-launch');await until(hub+'.running||__ATF_GAME__.running','runtime ready');}
async function reload(){const started=Date.now();await evaluate('window.__openingOldDocument=true');await cdp('Page.reload',{ignoreCache:true});await until('typeof __openingOldDocument==="undefined"&&globalThis.__ATF_V61__&&!document.querySelector("#boot")','reload',90000);await boot();(report.checks.reloadMilliseconds??=[]).push(Date.now()-started);}
async function hold(code,predicate,label,limit=15000){await key(code);try{await until(predicate,label,limit);}finally{await key(code,false);}await wait(100);}
async function walkX(x,label){let old=null,stuck=0;const end=Date.now()+35000;while(Date.now()<end){const p=await evaluate(`({x:${hub}.player.x,y:${hub}.player.y,running:${hub}.running})`);if(Math.abs(p.x-x)<10)break;if(!p.running)throw Error('paused during '+label);const code=p.x<x?'KeyD':'KeyA';await key(code);await wait(Math.min(90,Math.max(25,Math.abs(p.x-x)*3)));await key(code,false);if(old!==null&&Math.abs(old-p.x)<2)stuck++;else stuck=0;if(stuck>=3){await key(code);await tap('Space');await wait(220);await key(code,false);stuck=0;}old=p.x;}assert.ok(Math.abs(await evaluate(hub+'.player.x')-x)<20,label);}
async function deck(target){while(await evaluate(hub+'.state.deck')!==target){const lift=await evaluate(`(()=>{const h=${hub};return h.doorStates.filter(d=>d.lift).sort((a,b)=>Math.abs(a.x-h.player.x)-Math.abs(b.x-h.player.x))[0]?.x-h.player.w/2})()`);await walkX(lift,'lift route');const before=await evaluate(hub+'.state.deck');await tap(before<target?'KeyS':'KeyW');await until(hub+'.state.deck!=='+before,'lift changes deck');}}
async function travel(keys,predicate,label){for(const code of keys)await key(code);try{await until(predicate,label,18000);}finally{for(const code of keys)await key(code,false);}await wait(100);}
const center=hub+'.player.x+'+hub+'.player.w/2',feet=hub+'.player.y+'+hub+'.player.h';

const port='__ATF_V51__.saveSystem.data.portMeridienV90';
async function phase(name){await until(port+'.phase==='+JSON.stringify(name),'phase '+name);}
async function missionReady(label){
 const started=Date.now();
 // running becomes true before the sprite loaders finish; prove simulation and input too.
 await until('__ATF_GAME__.running&&!__ATF_GAME__.enemyAtlasLoadingPausedV65&&!__ATF_GAME__.userCasteLoadingV88&&__ATF_GAME__.mission.state==="active"&&__ATF_GAME__.mission.elapsed>0','mission simulation ready '+label,45000);
 const before=await evaluate('({x:__ATF_GAME__.player.x,elapsed:__ATF_GAME__.mission.elapsed})');
 await key('KeyD');await wait(450);await key('KeyD',false);await wait(150);
 const after=await evaluate('({x:__ATF_GAME__.player.x,elapsed:__ATF_GAME__.mission.elapsed,loading:__ATF_GAME__.enemyAtlasLoadingPausedV65,castesLoading:__ATF_GAME__.userCasteLoadingV88})');
 assert.ok(after.x>before.x+2,'actual keyboard movement '+label);assert.ok(after.elapsed>before.elapsed,'actual simulation clock '+label);assert.equal(after.loading,false);assert.equal(after.castesLoading,false);
 (report.checks.actualSimulation??=[]).push({label,readyMs:Date.now()-started,before,after});
}
try {
 ({browserContextId:context}=await cdp('Target.createBrowserContext',{},true));const{targetId}=await cdp('Target.createTarget',{url:'about:blank',browserContextId:context},true);({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true},true));for(const d of ['Page','Runtime','Network'])await cdp(d+'.enable');await cdp('Network.setBypassServiceWorker',{bypass:true});await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:720,mobile:false,deviceScaleFactor:1});await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});
 const save=createDefaultSave();save.needsPlayerCreationV84=false;save.onboardingV84={...createPlayerOnboardingV84({name:'Alex Moreau',callsign:'FOX-9'}),phase:'complete'};save.openingV88={...createPlayerOpeningV88(),phase:'ready',qualificationId:'m41a-qualification-v81:session-1:qualification',freight:process.env.QA_FREIGHT||'medical'};save.portMeridienV90=createPortMeridienV90();save.scene='hub';Object.assign(save.hub,{deck:0,roomId:'briefing',positionX:1800,positionY:532,facing:1});
 await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'if(!localStorage.getItem("qa-port-fixture-v90")){localStorage.setItem('+JSON.stringify(SAVE_PREFIX+'1')+','+JSON.stringify(JSON.stringify(save))+');localStorage.setItem("qa-port-fixture-v90","1")}'});
 await cdp('Page.navigate',{url:base+'?qa=port-v90'});await cdp('Page.bringToFront');await boot();
 await until(hub+'.openingContactV88()?.phase==="ready"','briefing contact');await capture('01-briefing');await tap('KeyE');await phase('unload');await until(hub+'.getSnapshot().portAssetsReadyV90===10','quay bitmaps');await capture('02-arrival');
 const parentPose=await evaluate('__ATF_V51__.saveSystem.data.hub');
 await walkX(198,'freight');await tap('KeyE');await phase('carry');await wait(1100);await reload();assert.equal(await evaluate(port+'.phase'),'carry');
 await walkX(758,'carry across quay');await tap('KeyE');await phase('triage');await tap('KeyE');await wait(500);await tap('KeyD');assert.equal(await evaluate(hub+'.portTaskV90'),null,'movement cancels triage');await walkX(758,'triage contact');await tap('KeyE');await wait(450);await reload();assert.equal(await evaluate(hub+'.portTaskV90'),null);await phase('triage');await tap('KeyE');await phase('power');await capture('03-triage-complete');
 await walkX(1210,'relay ladder');await hold('KeyW',feet+'<=433','relay climb');await tap('Space');await until(hub+'.player.grounded&&!'+hub+'.player.climbing','relay platform');await walkX(1378,'relay console');await wait(500);await tap('KeyE');await phase('escort');await capture('04-powered-gate');await reload();assert.equal(await evaluate(port+'.phase'),'escort');assert.ok(await evaluate(feet+'<=434'),'upper platform pose restored');
 await walkX(1210,'down ladder');await hold('KeyS',hub+'.player.grounded&&!'+hub+'.player.climbing','descent to floor');await until(hub+'.player.grounded&&!'+hub+'.player.climbing','quay floor');await walkX(898,'assemble civilians');await tap('KeyE');await until(port+'.following===true','group following');
 // Deliberately get ahead: a real escort must stop rather than teleport.
 await walkX(1580,'distance group');await wait(1100);const stopped=await evaluate(hub+'.portStateV90.civiliansX');await wait(800);assert.deepEqual(await evaluate(hub+'.portStateV90.civiliansX'),stopped);await reload();assert.deepEqual(await evaluate(port+'.civiliansX'),stopped.map(Math.round),'escort positions survive reload');
 const end=Date.now()+45000;while(Date.now()<end&&await evaluate(port+'.phase')==='escort'){
   const group=await evaluate(hub+'.portStateV90.civiliansX');await walkX(Math.min(2390,Math.min(...group)+230),'keep group in sight');await wait(450);
 }
 await phase('report');await walkX(2288,'report terminal');await capture('05-civilians-safe');await tap('KeyE');await phase('complete');assert.equal(await evaluate(port+'.receipt'),PORT_RECEIPT_V90);
 assert.deepEqual(await evaluate('__ATF_V51__.saveSystem.data.hub'),parentPose,'quay pose never overwrites ship');
 await reload();await phase('complete');assert.equal(await evaluate(port+'.receipt'),PORT_RECEIPT_V90);await capture('06-receipt-reload');await tap('KeyE');await until('document.querySelector(".view.active").dataset.panel==="operations"','operations unlocked');
 report.checks.final=await evaluate('({port:'+port+',operation:__ATF_V51__.saveSystem.data.strategy.currentOperation,opening:'+state+'})');assert.equal(report.checks.final.operation,null,'landing does not fabricate a generic mission');
 if(process.env.QA_FIRST_SORTIE==='1'){
  await click('#operation-launch');await until(state+'.phase==="deployed"','real first sortie');
  for(let i=0;i<160&&!await evaluate('__ATF_GAME__.running');i++){if(await evaluate('Boolean(document.querySelector("[data-insertion-action=advance]"))'))await click('[data-insertion-action="advance"]');await wait(200);}
  await until('__ATF_GAME__.running','real mission runtime',15000);await missionReady('first');
  const first=await evaluate('({medkits:__ATF_GAME__.inventory.medkits,flags:__ATF_V51__.saveSystem.data.strategy.currentOperation.flags,saved:__ATF_V51__.saveSystem.data.strategy.currentOperation.resumeState?.inventory?.medkits})');
  assert.equal(first.flags['v88-opening-'+save.openingV88.freight],true);assert.equal(first.saved,first.medkits);if(save.openingV88.freight==='medical')assert.ok(first.medkits>=3);await capture('07-real-first-sortie');
  await reload();await until('__ATF_GAME__.running','mission resume');await missionReady('resume');const resumed=await evaluate('({medkits:__ATF_GAME__.inventory.medkits,resume:__ATF_GAME__.lastResumeResult})');assert.equal(resumed.resume.applied,true);assert.equal(resumed.medkits,first.medkits);
  await click('#retreat-mission');await until(state+'.phase==="complete"&&'+hub+'.running','retreat returns to Tantalus');assert.equal(await evaluate(hub+'.isPortMeridienV90()'),false);assert.equal(await evaluate(port+'.receipt'),PORT_RECEIPT_V90);assert.equal(await evaluate(port+'.revision'),8);await capture('08-return-to-tantalus');report.checks.firstSortie={first,resumed,retreat:true};
 }
 assert.deepEqual(errors,[]);report.ok=true;
}catch(error){report.failure=error.stack;report.last=await evaluate('globalThis.__ATF_HUB__?({pose:'+pose+',port:'+port+',runtime:'+hub+'.getSnapshot(),prompt:'+hub+'.statusPrompt(),toast:document.querySelector("#toast")?.textContent}):null').catch(()=>null);await capture('failure').catch(()=>{});process.exitCode=1;}
finally{if(!report.ok)report.pendingRequests=[...requests.values()];await writeFile(resolve(output,'port-meridien-v90-browser.json'),JSON.stringify(report,null,2));if(context)await cdp('Target.disposeBrowserContext',{browserContextId:context},true).catch(()=>{});socket.close();console.log(JSON.stringify({ok:report.ok,failure:report.failure,last:report.last,checks:report.checks.final,errors,output},null,2));}
