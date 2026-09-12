import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9226';
const base = process.env.APP_URL || 'http://127.0.0.1:4176/';
const output = resolve(process.env.QA_OUTPUT || 'docs/references/v83-release-qa/browser-local');
await mkdir(output, { recursive: true });
const info = await fetch(endpoint + '/json/version').then(r => r.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once:true }); socket.addEventListener('error', fail, { once:true }); });
let seq=0, session, context;
const pending=new Map(), errors=[];
socket.addEventListener('message', e => {
  const m=JSON.parse(e.data);
  if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}
  if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
  if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description).join(' '));
  if(m.method==='Network.responseReceived'&&m.params.response.status>=400)errors.push(m.params.response.status+' '+m.params.response.url);
});
const cdp=(method,params={},browser=false)=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params,...(session&&!browser?{sessionId:session}:{})}));});
async function evaluate(expression){const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(expression,label){for(let i=0;i<400;i++){const v=await evaluate(expression);if(v)return v;await wait(100);}throw Error(label+' '+errors.join('\n'));}
async function capture(name){const r=await cdp('Page.captureScreenshot',{format:'jpeg',quality:76,captureBeyondViewport:false});await writeFile(resolve(output,name+'.jpg'),Buffer.from(r.data,'base64'));report.screenshots.push(name+'.jpg');}
async function key(code,down=true){await cdp('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',code,key:code.startsWith('Key')?code.slice(3).toLowerCase():code.startsWith('Shift')?'Shift':code});}
const report={ok:false,base,scope:'Isolated Chromium storage; authored mission setup fixture, real CDP keyboard/mouse/touch. Shot observer records the genuine firing method without changing its result. No full campaign or diagonal body-animation claim.',screenshots:[],checks:{},errors};
try{
  ({browserContextId:context}=await cdp('Target.createBrowserContext',{},true));
  const {targetId}=await cdp('Target.createTarget',{url:'about:blank',browserContextId:context},true);
  ({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true},true));
  for(const name of ['Page','Runtime','Network'])await cdp(name+'.enable');
  await cdp('Network.setBypassServiceWorker',{bypass:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:720,mobile:false,deviceScaleFactor:1});
  await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});
  await cdp('Page.navigate',{url:base+'?qa=combat-v83'});
  await cdp('Page.bringToFront');
  await until('globalThis.__ATF_GAME__ && globalThis.__ATF_V61__ && !document.querySelector("#boot")','app boot');
  await until('document.querySelector("#title-screen")?.dataset.sceneReady === "true" || document.querySelectorAll("#title-screen img").length && [...document.querySelectorAll("#title-screen img")].every(i=>i.complete)','title images');
  await wait(200);
  report.checks.initial=await evaluate('({title:document.title,text:document.body.innerText.length,buttons:document.querySelectorAll("button").length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})');
  assert.ok(report.checks.initial.text>100);assert.equal(report.checks.initial.overlay,false);assert.deepEqual(errors,[]);
  await capture('01-title');
  console.log('Dev server verified: title loaded, meaningful UI, no runtime/network errors.');
  if(process.env.QA_ONLY==='boot'){report.ok=true;}else{
    report.checks.fixture=await evaluate(`(async()=>{
      const c=await import('/src/content.js'), game=__ATF_GAME__;
      __ATF_V61__.titleScreen.hide();__ATF_V51__.showView('play');__ATF_HUB__.stop();
      const world=c.WORLDS.find(w=>w.biomes.includes('industrial'))||c.WORLDS[0];
      game.start({seed:830083,world,crew:c.CREW,vehicle:c.VEHICLES.find(v=>v.family==='ground'),campaign:{...c.CAMPAIGNS[0],id:'qa-v83',objective:'restore atmospheric processing',worldId:world.id},levelSeed:{...c.LEVEL_SEEDS[0],id:'qa-v83',worldId:world.id,objective:'restore atmospheric processing'},enemyCatalog:[],weapon:c.WEAPONS.find(w=>w.id.includes('m41a'))||c.WEAPONS[0],difficulty:'standard',aimAssist:'off'});
      game.enemies=[];game.hazards=[];game.hostileProjectiles=[];game.squadActors=[];game.setCoop(true);
      Object.assign(game.player,{x:500,y:820,vx:0,vy:0,ammo:99,fireClock:0,reloading:false});
      Object.assign(game.coop,{x:600,y:820,vx:0,vy:0,ammo:99,fireClock:0,reloading:false});
      window.__qaShotsV83=[];
      const original=game.fire;
      game.fire=function(actor){const before=this.bullets.length,result=original.call(this,actor);for(const b of this.bullets.slice(before))__qaShotsV83.push({vx:b.vx,vy:b.vy,x:b.x,y:b.y,role:actor===this.coop?'coop':'player',direction:actor.combatAimV83?.direction});return result;};
      game.canvas.focus();return {version:c.RELEASE.version,weapon:game.weaponRuntime.name};
    })()`);
    await until('__ATF_GAME__.running && !__ATF_GAME__.paused && !__ATF_GAME__.enemyAtlasLoadingPausedV65','mission');
    await key('ShiftLeft');await key('KeyW');await key('KeyD');await key('KeyF');
    await until('__qaShotsV83.some(s=>s.direction==="up-right")','diagonal real input');
    await capture('02-keyboard-up-right');
    for(const code of ['KeyF','KeyD','KeyW','ShiftLeft'])await key(code,false);
    await key('ShiftRight');await key('KeyI');await key('KeyO');
    await until('__qaShotsV83.some(s=>s.role==="coop"&&s.direction==="up")','coop vertical input');
    for(const code of ['KeyO','KeyI','ShiftRight'])await key(code,false);
    report.checks.keyboard=await evaluate('__qaShotsV83.slice()');
    assert.ok(report.checks.keyboard.some(s=>s.vx>0&&s.vy<0));assert.ok(report.checks.keyboard.some(s=>s.role==='coop'&&s.vx===0&&s.vy<0));
    await wait(200);
    const point=await evaluate(`(()=>{const g=__ATF_GAME__,r=g.canvas.getBoundingClientRect();const x=g.player.x+g.player.w/2-g.camera.x+200,y=g.player.y+g.player.h*37/92-g.camera.y-200;return {x:r.left+x/1280*r.width,y:r.top+y/720*r.height};})()`);
    const before=await evaluate('__qaShotsV83.length');
    await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',buttons:1,clickCount:1});
    await until(`__qaShotsV83.length >= ${before+3}`,'held mouse automatic');
    await capture('03-pointer-up-right');
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',buttons:0,clickCount:1});
    report.checks.pointer=await evaluate(`({shots:__qaShotsV83.slice(${before}),released:__ATF_GAME__.player.pointerAimV83===null,fireHeld:__ATF_GAME__.keys.has('KeyF')})`);
    assert.equal(report.checks.pointer.released,true);assert.equal(report.checks.pointer.fireHeld,false);assert.ok(report.checks.pointer.shots.every(s=>s.vx>0&&s.vy<0));
    await cdp('Emulation.setDeviceMetricsOverride',{width:844,height:390,mobile:true,deviceScaleFactor:2});
    await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
    await wait(150);
    report.checks.mobile=await evaluate(`(()=>{const c=document.querySelector('#game-canvas'),r=c.getBoundingClientRect();return {viewport:[innerWidth,innerHeight],canvas:[r.x,r.y,r.width,r.height],controls:[...document.querySelectorAll('[data-mission-key]')].map(b=>{const t=b.getBoundingClientRect();return {key:b.dataset.missionKey,visible:t.width>0&&t.height>0,inside:t.x>=0&&t.right<=innerWidth&&t.y>=0&&t.bottom<=innerHeight,hit:document.elementFromPoint(t.x+t.width/2,t.y+t.height/2)===b};})};})()`);
    await capture('04-mobile-controls');
    assert.ok(report.checks.mobile.controls.every(control => control.visible && control.inside && control.hit), 'all touch controls are visible and reachable');
    const touch=await evaluate(`(()=>{const g=__ATF_GAME__,r=g.canvas.getBoundingClientRect();return {x:r.left+r.width*.8,y:r.top+r.height*.3};})()`);
    const touchBefore=await evaluate('__qaShotsV83.length');
    await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touch,id:1,force:1,radiusX:2,radiusY:2}]});
    await until(`__qaShotsV83.length > ${touchBefore}`,'touch shoots');
    await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    report.checks.touch=await evaluate(`({shots:__qaShotsV83.slice(${touchBefore}),released:__ATF_GAME__.player.pointerAimV83===null,fireHeld:__ATF_GAME__.keys.has('KeyF')})`);
    assert.equal(report.checks.touch.released,true);assert.equal(report.checks.touch.fireHeld,false);
    await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:720,mobile:false,deviceScaleFactor:1});
    await key('Escape');
    report.checks.pause=await evaluate('({paused:__ATF_GAME__.paused,held:__ATF_GAME__.keys.size,aim:__ATF_GAME__.player.pointerAimV83})');
    assert.equal(report.checks.pause.paused,true);assert.equal(report.checks.pause.held,0);assert.equal(report.checks.pause.aim,null);
    assert.deepEqual(errors,[]);report.ok=true;
  }
}catch(error){report.failure=error.stack;await capture('failure').catch(()=>{});throw error;}
finally{await writeFile(resolve(output,'combat-v83-browser.json'),JSON.stringify(report,null,2));if(context)await cdp('Target.disposeBrowserContext',{browserContextId:context},true).catch(()=>{});socket.close();console.log(JSON.stringify(report,null,2));}
