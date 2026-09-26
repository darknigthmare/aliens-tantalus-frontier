import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createDefaultSave, SAVE_PREFIX } from '../src/save.js';
import { createPlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { createPlayerOpeningV88 } from '../src/player-opening-v88.js';
import { createOpeningExerciseV89 } from '../src/opening-exercise-v89.js';

const base=process.env.APP_URL||'http://127.0.0.1:4195/';
const output=resolve(process.env.QA_OUTPUT||'E:/CodexQA/AliensTantalus/v89-opening-20260923');
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
const report={ok:false,scope:'Isolated fixture at armory before qualification. Native two-ladder/sas route, three real hits, suspended timer/ammo/targets, reload, console walk/repair, pad return, six remaining hits and unique qualification receipt. No game-state mutation after initial local storage fixture.',checks:{},screenshots:[],errors};
async function capture(name){const s=await cdp('Page.captureScreenshot',{format:'jpeg',quality:80,captureBeyondViewport:false});await writeFile(resolve(output,name+'.jpg'),Buffer.from(s.data,'base64'));report.screenshots.push(name+'.jpg');}
async function boot(){await until('globalThis.__ATF_V61__&&!document.querySelector("#boot")','boot',90000);await click('#title-start');await click('#title-continue');if(await evaluate('Boolean(__ATF_V51__.saveSystem.data.strategy.currentOperation)'))await click('#operation-launch');await until(hub+'.running||__ATF_GAME__.running','runtime ready');}
async function reload(){const started=Date.now();await evaluate('window.__openingOldDocument=true');await cdp('Page.reload',{ignoreCache:true});await until('typeof __openingOldDocument==="undefined"&&globalThis.__ATF_V61__&&!document.querySelector("#boot")','reload',90000);await boot();(report.checks.reloadMilliseconds??=[]).push(Date.now()-started);}
async function hold(code,predicate,label,limit=15000){await key(code);try{await until(predicate,label,limit);}finally{await key(code,false);}await wait(100);}
async function walkX(x,label){let old=null,stuck=0;const end=Date.now()+35000;while(Date.now()<end){const p=await evaluate(`({x:${hub}.player.x,y:${hub}.player.y,running:${hub}.running})`);if(Math.abs(p.x-x)<10)break;if(!p.running)throw Error('paused during '+label);const code=p.x<x?'KeyD':'KeyA';await key(code);await wait(Math.min(90,Math.max(25,Math.abs(p.x-x)*3)));await key(code,false);if(old!==null&&Math.abs(old-p.x)<2)stuck++;else stuck=0;if(stuck>=3){await key(code);await tap('Space');await wait(220);await key(code,false);stuck=0;}old=p.x;}assert.ok(Math.abs(await evaluate(hub+'.player.x')-x)<20,label);}
async function deck(target){while(await evaluate(hub+'.state.deck')!==target){const lift=await evaluate(`(()=>{const h=${hub};return h.doorStates.filter(d=>d.lift).sort((a,b)=>Math.abs(a.x-h.player.x)-Math.abs(b.x-h.player.x))[0]?.x-h.player.w/2})()`);await walkX(lift,'lift route');const before=await evaluate(hub+'.state.deck');await tap(before<target?'KeyS':'KeyW');await until(hub+'.state.deck!=='+before,'lift changes deck');}}
async function travel(keys,predicate,label){for(const code of keys)await key(code);try{await until(predicate,label,18000);}finally{for(const code of keys)await key(code,false);}await wait(100);}
const center=hub+'.player.x+'+hub+'.player.w/2',feet=hub+'.player.y+'+hub+'.player.h';

const exercise='__ATF_V51__.saveSystem.data.openingExerciseV89',course=hub+'.provingGroundStateV81';
async function shot(i){if(await evaluate(course+'.ammo.magazine')===0){await tap('KeyR');await until(course+'.reloadCount>=1&&!'+course+'.reload.active','reload');}const lane=await evaluate(course+'.targets['+course+'.currentTargetIndex].lane'),aim=lane==='high'?'KeyW':lane==='low'?'KeyS':null;if(aim)await key(aim);await tap('KeyF');await until(course+'.hits==='+i,'real hit '+i,5000);if(aim)await key(aim,false);}
async function ladder(down=false){const l=await evaluate(hub+'.currentAnnexV71().ladders[0]');await walkX(l.x+l.w/2-22,'stand ladder');await hold(down?'KeyS':'KeyW',feet+(down?'>='+(l.bottom-1):'<='+(l.top+1)),'stand ladder climb');await until(hub+'.player.grounded&&!'+hub+'.player.climbing','stand landing');}
try{
 ({browserContextId:context}=await cdp('Target.createBrowserContext',{},true));const{targetId}=await cdp('Target.createTarget',{url:'about:blank',browserContextId:context},true);({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true},true));for(const d of ['Page','Runtime','Network'])await cdp(d+'.enable');await cdp('Network.setBypassServiceWorker',{bypass:true});await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:720,mobile:false,deviceScaleFactor:1});await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});
 const save=createDefaultSave();save.needsPlayerCreationV84=false;save.onboardingV84={...createPlayerOnboardingV84({name:'Alex Moreau',callsign:'FOX-9'}),phase:'complete'};save.openingV88={...createPlayerOpeningV88(),phase:'qualification'};save.openingExerciseV89=createOpeningExerciseV89();save.scene='hub';Object.assign(save.hub,{deck:2,roomId:'armory',positionX:1900,facing:1});
 await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'if(!localStorage.getItem("qa-exercise-fixture-v89")){localStorage.setItem('+JSON.stringify(SAVE_PREFIX+'1')+','+JSON.stringify(JSON.stringify(save))+');localStorage.setItem("qa-exercise-fixture-v89","1")}'});
 await cdp('Page.navigate',{url:base+'?qa=exercise-v89'});await cdp('Page.bringToFront');await boot();await capture('01-armory');
 const ladders=await evaluate(hub+'.v51Ladders.filter(l=>l.roomId==="armory").sort((a,b)=>b.bottom-a.bottom)');
 for(const l of ladders){await walkX(l.x-22,'armory ladder');await hold('KeyW',feet+'<='+ (l.top+11),'armory climb');await tap('Space');await until(hub+'.player.grounded&&!'+hub+'.player.climbing','armory landing');}
 const door=await evaluate(hub+'.getParentAnnexDoorV71("proving-ground").bounds.x');await walkX(door,'stand entrance');await until(hub+'.nearestParentAnnexDoorV71()?.annexId==="proving-ground"','door contact');await tap('KeyE');await until(hub+'.currentAnnexV71()?.id==="proving-ground"&&!'+hub+'.annexTransitionV71','entered stand');
 await hold('KeyA',hub+'.nearestAnnexStationV71()','arm console');await tap('KeyE');await until(course+'.phase==="armed"','armed');await ladder();await hold('KeyA',course+'.phase==="active"','firing pad');
 for(let i=1;i<=3;i++)await shot(i);await until(exercise+'.phase==="console"','interrupted');await capture('02-exercise-interrupted');
 const frozen=await evaluate(course);report.checks.frozen=frozen;assert.equal(frozen.hits,3);assert.equal(frozen.ammo.magazine,1);
 await tap('KeyF');await tap('KeyR');await tap('KeyE');await wait(1200);assert.deepEqual(await evaluate(course),frozen,'no firing/reload/remote console action or countdown while suspended');
 await reload();assert.equal(await evaluate(exercise+'.phase'),'console');assert.deepEqual(await evaluate(course),frozen,'page reload preserves session');await capture('03-suspended-reload');
 await ladder(true);await hold('KeyA',hub+'.exerciseContactV89()==="repair"','walk to real console');
 await tap('KeyE');await wait(600);await tap('KeyD');assert.equal(await evaluate(hub+'.exerciseRepairV89'),null,'moving cancels repair');
 await hold('KeyA',hub+'.exerciseContactV89()==="repair"','return to console');await tap('KeyE');await wait(450);assert.ok(await evaluate(hub+'.exerciseRepairV89?.elapsed')>0);await reload();assert.equal(await evaluate(hub+'.exerciseRepairV89'),null);assert.equal(await evaluate(exercise+'.phase'),'console');assert.deepEqual(await evaluate(course),frozen);
 await until(hub+'.exerciseContactV89()==="repair"','restored real console pose');await tap('KeyE');await until(exercise+'.phase==="return"','three active seconds restores link');await capture('04-link-restored');assert.deepEqual(await evaluate(course),frozen,'repair never advances qualification clock');
 await tap('KeyE');assert.equal(await evaluate(exercise+'.phase'),'return','cannot resume remotely from console');await reload();assert.equal(await evaluate(exercise+'.phase'),'return');assert.deepEqual(await evaluate(course),frozen);
 await ladder();await hold('KeyA',hub+'.exerciseContactV89()==="resume"','back to pad');await tap('KeyE');assert.equal(await evaluate(exercise+'.phase'),'complete');
 for(let i=4;i<=9;i++)await shot(i);await until(state+'.phase==="relay"','single qualification advances opening');await capture('05-qualified');
 const qualified=await evaluate(course);assert.equal(qualified.hits,9);assert.equal(qualified.reloadCount,1);assert.deepEqual(qualified.laneHits,{high:3,level:3,low:3});report.checks.qualified=qualified;
 const ledger='__ATF_V51__.saveSystem.data.hub.annexOperationsV71.provingGround';report.checks.receipts=await evaluate(ledger+'.qualificationReceiptIdsV81');assert.equal(report.checks.receipts.length,1);const id=report.checks.receipts[0];await reload();assert.equal(await evaluate(exercise+'.phase'),'complete');assert.equal(await evaluate(state+'.qualificationId'),id);assert.deepEqual(await evaluate(ledger+'.qualificationReceiptIdsV81'),[id]);await capture('06-qualification-reload');
 report.checks.final=await evaluate('({opening:'+state+',exercise:'+exercise+',health:'+hub+'.player.health})');assert.deepEqual(errors,[]);report.ok=true;
}catch(error){report.failure=error.stack;report.last=await evaluate('globalThis.__ATF_HUB__?({pose:'+pose+',course:'+course+',exercise:'+exercise+',prompt:'+hub+'.statusPrompt(),toast:document.querySelector("#toast")?.textContent}):null').catch(()=>null);await capture('failure').catch(()=>{});process.exitCode=1;}
finally{if(!report.ok)report.pendingRequests=[...requests.values()];await writeFile(resolve(output,'opening-v89-browser.json'),JSON.stringify(report,null,2));if(context)await cdp('Target.disposeBrowserContext',{browserContextId:context},true).catch(()=>{});socket.close();console.log(JSON.stringify({ok:report.ok,failure:report.failure,last:report.last,checks:report.checks.final,errors,output},null,2));}
