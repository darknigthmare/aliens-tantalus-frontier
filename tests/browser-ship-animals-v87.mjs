import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base=process.env.APP_URL||'http://127.0.0.1:4189';
const output=resolve('privateoutput/v87',process.env.QA_STAGE==='production'?'animals-production':'animals-local');
await mkdir(output,{recursive:true});
const info=await fetch('http://127.0.0.1:9236/json/version').then(r=>r.json());
const socket=new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok,fail)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',fail,{once:true});});
let sequence=0,session,context;const pending=new Map(),errors=[];
socket.addEventListener('message',event=>{
 const msg=JSON.parse(event.data),job=pending.get(msg.id);
 if(job){pending.delete(msg.id);clearTimeout(job.timer);msg.error?job.reject(Error(msg.error.message)):job.resolve(msg.result);}
 if(msg.sessionId!==session)return;
 if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.exception?.description||msg.params.exceptionDetails.text);
 if(msg.method==='Runtime.consoleAPICalled'&&msg.params.type==='error')errors.push(msg.params.args.map(a=>a.value||a.description).join(' '));
 if(msg.method==='Network.responseReceived'&&msg.params.response.status>=400)errors.push(msg.params.response.status+' '+msg.params.response.url);
});
function cdp(method,params={},browser=false){return new Promise((resolve,reject)=>{
 const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},30000);
 pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,...(session&&!browser?{sessionId:session}:{})}));
});}
async function read(expression){const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(expression,label){for(let i=0;i<250;i++){const result=await read(expression);if(result)return result;await wait(80);}throw Error('Timeout '+label);}
async function key(code,down){await cdp('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key:code.slice(3).toLowerCase(),code,windowsVirtualKeyCode:code.slice(3).charCodeAt(0)});}
async function press(code){await key(code,true);await wait(55);await key(code,false);await wait(90);}
const report={ok:false,base,browser:info.Browser,scope:'Isolated fresh test profile placed in crew quarters after onboarding. Door traversal and equipment fitting use real keyboard events, normal RAF and durable SaveSystem. Sprite preview is an explicit QA-only overlay, not purchased companions in gameplay.',checks:{},screenshots:[],errors};
async function capture(name){const r=await cdp('Page.captureScreenshot',{format:'jpeg',quality:85,captureBeyondViewport:false});await writeFile(resolve(output,name+'.jpg'),Buffer.from(r.data,'base64'));report.screenshots.push(name+'.jpg');}
async function walk(target){const before=await read('__ATF_HUB__.player.x+__ATF_HUB__.player.w/2'),code=before<target?'KeyD':'KeyA';await key(code,true);await until('__ATF_HUB__.player.x+__ATF_HUB__.player.w/2'+(before<target?'>=':'<=')+target,'walk '+target);await key(code,false);await wait(90);return read('({x:__ATF_HUB__.player.x,feet:__ATF_HUB__.player.y+__ATF_HUB__.player.h,room:__ATF_HUB__.currentAnnexV71()?.id||__ATF_HUB__.currentRoom().id})');}
try{
 ({browserContextId:context}=await cdp('Target.createBrowserContext',{},true));
 const {targetId}=await cdp('Target.createTarget',{url:'about:blank',browserContextId:context},true);
 ({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true},true));
 for(const domain of ['Page','Runtime','Network'])await cdp(domain+'.enable');
 await cdp('Network.setBypassServiceWorker',{bypass:true});
 await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:720,mobile:false,deviceScaleFactor:1});
 await cdp('Page.navigate',{url:base+'/?qa=animals-v87'});
 await cdp('Page.bringToFront');
 await until('globalThis.__ATF_HUB__&&globalThis.__ATF_V61__&&!document.querySelector("#boot")','boot');
 report.checks.boot=await read('({title:document.title,text:document.body.innerText.length,buttons:document.querySelectorAll("button").length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})');
 assert.ok(report.checks.boot.text>100&&report.checks.boot.buttons>0&&!report.checks.boot.overlay);
 await capture('00-title');
 await read(`(()=>{const s=__ATF_V51__.saveSystem;__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('settings');s.commit({onboardingV84:null,scene:'hub',hub:{...s.data.hub,deck:1,roomId:'crew-quarters',positionX:682,facing:1}});__ATF_V51__.showView('hub');__ATF_HUB__.canvas.focus();})()`);
 await until('__ATF_HUB__.getAnnexAssetGroupV71("animal-care")?.get("door")?.naturalWidth>0','entry art');
 report.checks.parent=await read('({door:__ATF_HUB__.getParentAnnexDoorV71("animal-care").bounds,prompt:__ATF_HUB__.statusPrompt(),animals:Object.keys(__ATF_V51__.saveSystem.data.shipAnimalsV1.animals).length})');
 assert.equal(report.checks.parent.door.y+report.checks.parent.door.h,624);assert.equal(report.checks.parent.animals,0);
 await capture('01-parent-ground-door');
 await press('KeyE');
 await until('__ATF_HUB__.currentAnnexV71()?.id==="animal-care"&&!__ATF_HUB__.annexTransitionV71','physical entry');
 await until('[...__ATF_HUB__.getAnnexAssetGroupV71("animal-care").values()].every(i=>i.complete&&i.naturalWidth>0)','room art');
 await capture('02-empty-room');
 report.checks.catApproach=await walk(690);assert.equal(report.checks.catApproach.feet,624);
 report.checks.quotaBefore=await read(`(()=>{const s=__ATF_V51__.saveSystem;window.__qaStorage=s.storage;window.__qaBytes=s.storage.getItem(s.key(s.profile));s.storage={getItem:k=>__qaStorage.getItem(k),setItem(){throw new Error('QA_QUOTA');},removeItem:k=>__qaStorage.removeItem(k)};return JSON.stringify(s.data.shipAnimalsV1);})()`);
 await press('KeyE');
 report.checks.quotaAfter=await read(`(()=>{const s=__ATF_V51__.saveSystem;s.storage=__qaStorage;return {state:JSON.stringify(s.data.shipAnimalsV1),sameBytes:s.storage.getItem(s.key(s.profile))===__qaBytes};})()`);
 assert.equal(report.checks.quotaAfter.state,report.checks.quotaBefore);assert.equal(report.checks.quotaAfter.sameBytes,true);
 await press('KeyE');
 await until('__ATF_V51__.saveSystem.data.shipAnimalsV1.habitats?.["moka-berth-v87"]?.installed','cat fitted');
 await capture('03-cat-equipment');
 report.checks.dogApproach=await walk(1160);assert.equal(report.checks.dogApproach.feet,624);
 await press('KeyE');
 await until('__ATF_V51__.saveSystem.data.shipAnimalsV1.habitats?.["brume-berth-v87"]?.installed','dog fitted');
 await capture('04-both-equipment');
 report.checks.saved=await read('({animals:Object.keys(__ATF_V51__.saveSystem.data.shipAnimalsV1.animals).length,habitats:__ATF_V51__.saveSystem.data.shipAnimalsV1.habitats,credits:__ATF_V51__.saveSystem.data.galaxy.resources.credits,room:__ATF_V51__.saveSystem.data.hub.commercialV71.activeAnnexId,x:__ATF_V51__.saveSystem.data.hub.commercialV71.annexPositionX})');
 assert.equal(report.checks.saved.animals,0);assert.equal(report.checks.saved.credits,3200);assert.equal(report.checks.saved.room,'animal-care');
 const priorOrigin=await read('performance.timeOrigin');
 await cdp('Page.reload',{ignoreCache:true});
 await until('performance.timeOrigin!=='+priorOrigin+'&&globalThis.__ATF_HUB__&&globalThis.__ATF_V61__&&!document.querySelector("#boot")','reload');
 await read('__ATF_V61__.titleScreen.hide();__ATF_V51__.showView("hub");__ATF_HUB__.canvas.focus()');
 await until('__ATF_HUB__.currentAnnexV71()?.id==="animal-care"','restored room');
 report.checks.reload=await read('({animals:Object.keys(__ATF_V51__.saveSystem.data.shipAnimalsV1.animals).length,habitats:__ATF_V51__.saveSystem.data.shipAnimalsV1.habitats,feet:__ATF_HUB__.player.y+__ATF_HUB__.player.h,x:__ATF_HUB__.player.x})');
 assert.deepEqual(report.checks.reload.habitats,report.checks.saved.habitats);assert.equal(report.checks.reload.x,report.checks.saved.x);assert.equal(report.checks.reload.feet,624);
 await walk(1660);await press('KeyE');await capture('05-care-counter');
 report.checks.exitApproach=await walk(144);await press('KeyE');
 await until('!__ATF_HUB__.isAnnexActiveV71()&&!__ATF_HUB__.annexTransitionV71','return');
 report.checks.return=await read('({room:__ATF_HUB__.currentRoom().id,feet:__ATF_HUB__.player.y+__ATF_HUB__.player.h,x:__ATF_HUB__.player.x})');
 assert.equal(report.checks.return.room,'crew-quarters');assert.equal(report.checks.return.feet,624);
 await capture('06-return-quarters');
 // Explicit visual QA preview: no save writes, no claim that companions can yet be acquired.
 report.checks.spritePreview=await read(`(async()=>{
 const m=await import('/src/ship-animal-art-v87.js');
 const c=document.createElement('canvas');c.width=1100;c.height=520;c.style='position:fixed;inset:70px auto auto 80px;z-index:99999;background:#112125;border:1px solid #718783';document.body.append(c);
 const ctx=c.getContext('2d'),loaded={};for(const [id,a] of Object.entries(m.SHIP_ANIMAL_ATLASES_V87)){const im=new Image();im.src=a.path;await im.decode();loaded[id]=im;}
 const clips=['walk','idle','sitDown','eat','sleep','pet'];window.__qaSpriteStart=performance.now();
 window.__qaSpriteLoop=()=>{ctx.clearRect(0,0,1100,520);ctx.fillStyle='#c7d8d0';ctx.font='16px monospace';ctx.fillText('BANC DE CONTRÔLE ANIMATION — PAS DES RÉSIDENTS ACQUIS',24,30);
 const time=(performance.now()-__qaSpriteStart)/1000;let row=0;for(const[id,a]of Object.entries(m.SHIP_ANIMAL_ATLASES_V87)){ctx.fillText(id+' · '+a.coverage.runtimeSafe+' poses',24,75+row*210);clips.forEach((clip,i)=>{const x=100+i*170,y=190+row*210;ctx.strokeStyle='#536d71';ctx.beginPath();ctx.moveTo(x-65,y);ctx.lineTo(x+65,y);ctx.stroke();m.drawShipAnimalV87(ctx,loaded[id],{animalId:id,clipId:clip,elapsed:time%(clip==='sitDown'?1.6:clip==='pet'?2.4:8),x,y,facing:1});ctx.fillStyle='#c7d8d0';ctx.fillText(clip,x-40,y+28);});row++;}window.__qaSpriteFrame=requestAnimationFrame(__qaSpriteLoop);};__qaSpriteLoop();
 return Object.fromEntries(Object.entries(m.SHIP_ANIMAL_ATLASES_V87).map(([id,a])=>[id,a.coverage]));
 })()`);
 await wait(700);await capture('07-animation-preview-a');await wait(420);await capture('08-animation-preview-b');
 await read('cancelAnimationFrame(__qaSpriteFrame)');
 assert.deepEqual(errors,[]);report.ok=true;
}catch(error){report.failure=error.stack;await capture('failure').catch(()=>{});throw error;}
finally{await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));if(context)await cdp('Target.disposeBrowserContext',{browserContextId:context},true).catch(()=>{});for(const p of pending.values())clearTimeout(p.timer);socket.close();console.log(JSON.stringify({ok:report.ok,output,checks:Object.keys(report.checks),errors,failure:report.failure},null,2));}
