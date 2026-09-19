import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.APP_URL || 'http://127.0.0.1:4189';
const output = resolve(process.env.QA_OUTPUT || 'docs/references/v87-mission-structure/browser');
await mkdir(output, {recursive:true});
const info = await fetch((process.env.CDP_ENDPOINT || 'http://127.0.0.1:9236') + '/json/version').then(r=>r.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((ok,fail)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',fail,{once:true});});
let seq=0,session,context;
const pending=new Map(),errors=[];
socket.addEventListener('message', event=>{
  const value=JSON.parse(event.data),job=pending.get(value.id);
  if(job){pending.delete(value.id);clearTimeout(job.timer);value.error?job.reject(Error(value.error.message)):job.resolve(value.result);}
  if(value.sessionId!==session)return;
  if(value.method==='Runtime.exceptionThrown')errors.push(value.params.exceptionDetails.exception?.description||value.params.exceptionDetails.text);
  if(value.method==='Runtime.consoleAPICalled'&&value.params.type==='error')errors.push(value.params.args.map(a=>a.value||a.description).join(' '));
  if(value.method==='Network.responseReceived'&&value.params.response.status>=400)errors.push(value.params.response.status+' '+value.params.response.url);
});
function cdp(method,params={},browser=false){return new Promise((resolve,reject)=>{
  const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},30000);
  pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,...(session&&!browser?{sessionId:session}:{})}));
});}
async function read(expression){const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(expression,label){for(let i=0;i<300;i++){const value=await read(expression);if(value)return value;await wait(100);}throw Error('Timeout '+label);}
const report={ok:false,base,browser:info.Browser,scope:'Real public build, isolated context, authored mission geometry. Initial actor placement and neutralized combat/doors are fixtures; traversal uses CDP keyboard events and the normal RAF, input router and collision engine. This is not a complete campaign playthrough.',checks:{},screenshots:[],errors};
async function capture(name){const r=await cdp('Page.captureScreenshot',{format:'jpeg',quality:80,captureBeyondViewport:false});await writeFile(resolve(output,name+'.jpg'),Buffer.from(r.data,'base64'));report.screenshots.push(name+'.jpg');}
async function key(code,down){await cdp('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key:code.slice(3).toLowerCase(),code,windowsVirtualKeyCode:code.slice(3).charCodeAt(0)});}
try{
  ({browserContextId:context}=await cdp('Target.createBrowserContext',{},true));
  const {targetId}=await cdp('Target.createTarget',{url:'about:blank',browserContextId:context},true);
  ({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true},true));
  for(const domain of ['Page','Runtime','Network'])await cdp(domain+'.enable');
  await cdp('Network.setBypassServiceWorker',{bypass:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:720,mobile:false,deviceScaleFactor:1});
  await cdp('Page.navigate',{url:base+'/?qa=structure-v87'});
  await cdp('Page.bringToFront');
  await until('globalThis.__ATF_GAME__ && globalThis.__ATF_V61__ && !document.querySelector("#boot")','boot');
  report.checks.boot=await read('({title:document.title,text:document.body.innerText.length,buttons:document.querySelectorAll("button").length,overlay:!!document.querySelector(".vite-error-overlay,[data-nextjs-dialog]")})');
  assert.ok(report.checks.boot.text>100&&report.checks.boot.buttons>0&&!report.checks.boot.overlay);
  await capture('00-title');
  await read(`(async()=>{
    const content=await import('/src/content.js'),levels=await import('/src/mission-levels-v52.js');
    window.__qaStructureStart=async function(templateId){
      const game=__ATF_GAME__;__ATF_V61__.titleScreen.hide();__ATF_V51__.showView('play');__ATF_HUB__.stop();
      const plan=levels.buildMissionLevelV52({campaign:content.CAMPAIGNS[0],world:content.WORLDS[0],levelSeeds:content.LEVEL_SEEDS,templateId,variant:87});
      game.start({seed:plan.levelSeed.seed,campaign:plan.campaign,world:plan.world,levelSeed:plan.levelSeed,missionLevel:plan,weapon:content.WEAPONS[0],enemyCatalog:[],equipment:[],crew:[],vehicle:null,difficulty:'standard'});
      game.enemies=[];game.hazards=[];game.hostileProjectiles=[];game.squadActors=[];game.covers=[];game.walls=[];
      game.doors.forEach(d=>{d.open=true;d.progress=1});game.setCoop(true);game.paused=false;game.mission.state='active';
      window.__qaStructurePlan=plan;
      document.activeElement?.blur();game.canvas.focus();
      return {templateId,nodes:plan.graph.nodes.length,platforms:game.platforms.length,ladders:game.ladders.length};
    };
    window.__qaStructurePlace=function(role,id){
      const game=__ATF_GAME__,ladder=game.ladders.find(l=>l.id===id),actor=game[role];
      if(!ladder)throw Error('Missing ladder '+id);
      game.clearGameplayInput();
      for(const other of [game.player,game.coop])Object.assign(other,{x:ladder.x-other.w/2,y:ladder.bottom-other.h,vx:0,vy:0,alive:true,health:100,grounded:true,climbing:false,inVehicle:false,jumpBuffer:0,coyoteTime:0,ladderId:null,ladderDetachClock:0,crewV85:null,hazardClock:0});
      game.camera.x=Math.max(0,ladder.x-500);game.camera.y=0;
      game.canvas.focus();return {x:actor.x,y:actor.y,top:ladder.top,bottom:ladder.bottom,id};
    };
    window.__qaActor=function(role){const a=__ATF_GAME__[role];return {x:a.x,feet:a.y+a.h,climbing:a.climbing,grounded:a.grounded,health:a.health};};
  })()`);
  const templates=[['ship-interior-vertical','ship-e19'],['colony-closed-layout',null],['planet-exterior','planet-e12']];
  // Select the colony's actual identifier from the module, not an invented alias.
  templates[1][0]=await read('import("/src/mission-levels-v52.js").then(m=>m.MISSION_TEMPLATE_IDS_V52.find(id=>id.includes("colony")))');
  for(const [template,id] of templates){
    const check=report.checks[template]={fixture:await read('__qaStructureStart('+JSON.stringify(template)+')'),actors:[]};
    const ladderId=id||await read('__ATF_GAME__.ladders[0].id');
    await until('["catwalk","ladder","maintenancePipe","floor"].every(k=>{const i=__ATF_GAME__.images.get(k);return i?.complete&&i.naturalWidth>0})','structural art');
    for(const role of ['player','coop']){
      const start=await read('__qaStructurePlace('+JSON.stringify(role)+','+JSON.stringify(ladderId)+')');
      const up=role==='player'?'KeyW':'KeyI',right=role==='player'?'KeyD':'KeyL';
      await key(up,true);
      // Shared ship shaft continues through the next ladder with the same held key.
      const target=template.startsWith('ship')?190:start.top;
      await until('(()=>{const a=__qaActor('+JSON.stringify(role)+');return a.feet<='+target+'&&!a.climbing})()',role+' climb '+template);
      await key(up,false);
      const top=await read('__qaActor('+JSON.stringify(role)+')');
      assert.equal(top.feet,target);assert.equal(top.grounded,true);assert.equal(top.health,100);
      await key(right,true);await wait(650);await key(right,false);
      const walked=await read('__qaActor('+JSON.stringify(role)+')');
      assert.ok(walked.x-top.x>100,role+' must walk away');assert.equal(walked.climbing,false);assert.equal(walked.health,100);
      check.actors.push({role,start,top,walked});
    }
    check.art=await read(`(()=>{
      const game=__ATF_GAME__,canvas=document.createElement('canvas');canvas.width=80;canvas.height=220;const ctx=canvas.getContext('2d');
      game.drawLadder(ctx,{x:40,w:36,top:10,bottom:200});
      const openingAlpha=ctx.getImageData(40,40,1,1).data[3];
      const calls=[],spy={drawImage:(image,...args)=>calls.push({path:image.src,args}),save(){},restore(){},fillRect(){}};
      game.drawPlatform(spy,{x:0,y:50,w:300,h:22,art:'drop'});
      game.drawLadder(spy,{x:40,w:36,top:10,bottom:200});
      return {openingAlpha,calls,realGeometry:game.platforms.length};
    })()`);
    assert.equal(check.art.openingAlpha,0,'ladder opening must not be white/opaque');
    assert.ok(check.art.calls.length>8);assert.ok(check.art.calls.every(c=>c.args.length===8),'draws must use tight source rectangles');
    await capture(template);
  }
  assert.deepEqual(errors,[]);report.ok=true;
}catch(error){report.failure=error.stack;await capture('failure').catch(()=>{});throw error;}
finally{await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));if(context)await cdp('Target.disposeBrowserContext',{browserContextId:context},true).catch(()=>{});for(const p of pending.values())clearTimeout(p.timer);socket.close();console.log(JSON.stringify({ok:report.ok,output,checks:Object.keys(report.checks),errors,failure:report.failure},null,2));}
