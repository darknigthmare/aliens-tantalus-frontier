// Full production engine and authored ecosystem missions. DOM, RAF and Image
// doubles are explicit; actual shipped PNG bytes supply dimensions and SHA.
// Canvas calls are recorded, not rasterized. Display fixtures are separate
// from real damage/death/resume stimuli and do not certify native pixel QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {host,prepare,tick} from './engine-host-v188.mjs';
import {GameEngine} from '../src/game-production-runtime.js';
import {WORLDS,WEAPONS,ENEMIES,LEVEL_SEEDS} from '../src/content.js';
import {ECOSYSTEM_CAMPAIGNS_V131,buildEcosystemMissionV131} from '../src/ecosystem-missions-v131.js';
import {createDrawMeasureContextV188} from '../src/creature-scale-v188.js';
import {QUEEN_MOTHER_ART_V188,queenMotherArtReadyV188} from '../src/queen-mother-art-v188.js';
import {QUEEN_MOTHER_GUARD_ART_V188,queenMotherGuardArtReadyV188} from '../src/queen-mother-guard-art-v188.js';
import {QUEEN_MOTHER_CHOIR_ART_V188 as ART,QUEEN_MOTHER_CHOIR_FRAMES_V188 as FRAMES,
  QUEEN_MOTHER_CHOIR_PRESENTATION_V188 as PRESENTATION,
  queenMotherChoirArtReadyV188,queenMotherChoirSourceReadyV188,isQueenMotherChoirArtOwnerV188,
  queenMotherChoirPoseV188,queenMotherChoirFrameFitV188,queenMotherChoirVisualBoundsV188
} from '../src/queen-mother-choir-art-v188.js';

const close=(actual,expected,label='')=>assert.ok(Math.abs(actual-expected)<1e-7,`${label}: ${actual} != ${expected}`);
const artCalls=calls=>calls.filter(call=>call.kind==='image' && call.path===ART.path);
const body=actor=>({x:actor.x,y:actor.y,w:actor.w,h:actor.h,health:actor.health,maxHealth:actor.maxHealth,alive:actor.alive});
const presence=pose=>pose===0 || pose===1;
const sourceBytes=path=>readFileSync(new URL(`..${path}`,import.meta.url));
function sourceSize(path) {
  try {const b=sourceBytes(path);return b.subarray(1,4).toString()==='PNG' ? [b.readUInt32BE(16),b.readUInt32BE(20)] : null;}
  catch {return null;}
}
function recorder() {
  const ctx=createDrawMeasureContextV188(),calls=[],stack=[];
  const keys=['globalAlpha','fillStyle','strokeStyle','lineWidth','font','shadowColor','shadowBlur'];
  Object.assign(ctx,{globalAlpha:1,fillStyle:'#000',strokeStyle:'#000',lineWidth:1,font:'10px monospace',shadowColor:'',shadowBlur:0});
  const native={save:ctx.save,restore:ctx.restore,drawImage:ctx.drawImage};
  ctx.save=()=>{stack.push(Object.fromEntries(keys.map(key=>[key,ctx[key]])));native.save();};
  ctx.restore=()=>{assert.ok(stack.length,'balanced Canvas state');native.restore();Object.assign(ctx,stack.pop());};
  const record=(kind,args,extra={})=>calls.push({kind,args,alpha:ctx.globalAlpha,fill:ctx.fillStyle,
    stroke:ctx.strokeStyle,lineWidth:ctx.lineWidth,matrix:ctx.getTransform(),...extra});
  ctx.drawImage=(image,...args)=>{record('image',args,{path:image.currentSrc||image.src});native.drawImage(image,...args);};
  for(const [name,kind] of Object.entries({beginPath:'begin',moveTo:'move',lineTo:'line',ellipse:'ellipse',fill:'fill',stroke:'stroke',fillRect:'rect',fillText:'text'}))
    ctx[name]=(...args)=>record(kind,args);
  return {ctx,calls,render(engine,actor){calls.length=ctx.draws.length=0;engine.drawEnemy(ctx,actor);
    assert.equal(stack.length,0);assert.equal(ctx.globalAlpha,1);assert.deepEqual(ctx.getTransform(),{a:1,b:0,c:0,d:1,e:0,f:0});
    return structuredClone(calls);}};
}
function point(call,[sx,sy]) {
  const [,,sw,sh,dx,dy,dw,dh]=call.args,m=call.matrix,x=dx+sx*dw/sw,y=dy+sy*dh/sh;
  return [m.a*x+m.c*y+m.e,m.b*x+m.d*y+m.f];
}
async function fixture(t,{operation='queen-mother-song',holdArt=false}={}) {
  const globals=['addEventListener','removeEventListener','dispatchEvent','document','Image','requestAnimationFrame','cancelAnimationFrame','location'];
  const saved=new Map(globals.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  const browser=host(),BaseImage=globalThis.Image,requested=[],events=[];
  globalThis.location={origin:'https://queen-mother-choir.invalid'};
  globalThis.Image=class extends BaseImage {
    set src(value){if(value!==ART.path){super.src=value;return;}this._src=value;this.complete=false;
      this.naturalWidth=this.naturalHeight=0;requested.push(this);if(!holdArt)this.finish();}
    get src(){return this._src;}get currentSrc(){return this._src;}
    finish(failed=false){const size=failed?null:sourceSize(this._src);this.complete=true;
      this.naturalWidth=size?.[0]||0;this.naturalHeight=size?.[1]||0;
      const type=size?'load':'error';this.dispatchEvent(new Event(type));this[`on${type}`]?.();}
  };
  const campaign=ECOSYSTEM_CAMPAIGNS_V131.find(entry=>entry.specialOperationId===operation);
  const options={campaign,world:WORLDS.find(entry=>entry.id===campaign.worldId),weapon:WEAPONS[0],
    enemyCatalog:ENEMIES,equipment:[],crew:[],seed:426,levelSeeds:LEVEL_SEEDS};
  options.missionLevel=buildEcosystemMissionV131(options);
  const engine=new GameEngine(browser.canvas,{onEvent:event=>events.push(event)}),drawing=recorder();
  t.after(()=>{engine.stop();for(const [name,descriptor] of saved){
    if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}});
  engine.start(options);await prepare(engine);
  return {engine,options,events,requested,drawing,
    choir(index=0){return engine.ecosystemActorV131(`eco131-target-${index}`);},
    render(actor=engine.ecosystemActorV131('eco131-target-0')){return drawing.render(engine,actor);},
    async reenter(){engine.start(options);await prepare(engine);},ready(){engine.images.get(ART.imageKey).finish();}};
}
function damage(engine,actor,amount=999) {
  return engine.applyEnemyDamage(actor,amount,{owner:engine.player,kind:'rifle',x:actor.x-40,y:actor.y+20});
}
function requireFrame(session,actor,index) {
  assert.equal(queenMotherChoirPoseV188(session.engine,actor),index);
  const calls=session.render(actor),images=artCalls(calls);assert.equal(images.length,1);
  assert.deepEqual(images[0].args.slice(0,4),FRAMES[index].rect);return {calls,image:images[0]};
}
function keepPlayerNear(engine,actor) {
  // Position and high-health fixtures keep the actual attack/update pipeline
  // active while corpse expiry is observed. No clock or producer is stubbed.
  Object.assign(engine.player,{x:actor.x-100,y:actor.y+actor.h-engine.player.h,vx:0,vy:0,grounded:true,
    inVehicle:false,ventTransit:null,downed:false,alive:true,maxHealth:10000,health:10000});
  Object.assign(engine.camera,{x:Math.max(0,actor.x-500),y:0});
}

test('Queen Choirs: adopted original source dresses only three current targets with their physical and objective contract intact',async t=>{
  const s=await fixture(t),e=s.engine,bytes=sourceBytes(ART.path);
  const hash='2284ad37841fa32c1c09b3351c26e9636b5e60df8dd4b5c51cfd397cca4e5db8';
  assert.equal(ART.sha256,hash);assert.equal(createHash('sha256').update(bytes).digest('hex'),hash);
  assert.equal(bytes.length,920091);assert.deepEqual(sourceSize(ART.path),[1254,1254]);
  assert.equal(queenMotherChoirArtReadyV188(e.images),true);
  assert.equal(s.options.campaign.canonExact,false);assert.equal(s.options.campaign.implementationStatus,'partial');
  assert.deepEqual(FRAMES.map(frame=>frame.pivot),[[327,592],[303,592],[327,566],[303,566]]);
  assert.equal(PRESENTATION.referenceSourceHeight,525);assert.equal(PRESENTATION.idleFramesPerSecond,1);
  for(const [i,position] of [[950,265],[1720,480],[2460,265]].entries()){
    const c=s.choir(i);assert.equal(isQueenMotherChoirArtOwnerV188(e,c),true);
    assert.deepEqual([c.x,c.y,c.w,c.h,c.health,c.maxHealth],[...position,66,90,110,110]);
    assert.equal(c.ecosystemActorV131.role,'target');assert.equal(c.ecosystemActorV131.targetIndex,i);
    assert.equal(c.ecosystemActorV131.caste,undefined);assert.equal(c.isRoyal,false);assert.equal(c.royalScaleV72,false);
    assert.equal(c.name,`CHŒUR ${i+1}`);assert.equal(artCalls(s.render(c)).length,1);
    assert.ok(!e.getVisibleEnemyAtlasSheetsV65([c]).some(sheet=>sheet.path===ART.path));
  }
  assert.equal(e.enemies.filter(actor=>isQueenMotherChoirArtOwnerV188(e,actor)).length,3);
  assert.deepEqual(e.ecosystemV131.targets,[false,false,false]);assert.equal(e.ecosystemV131.phase,'choirs');
  assert.equal(e.hostileProjectiles.length,0);
});

test('Queen Choirs: exact operation, current identity, role, index and recorded origins reject lookalikes',async t=>{
  const s=await fixture(t),e=s.engine,c=s.choir(),descriptor=c.ecosystemActorV131;
  assert.equal(isQueenMotherChoirArtOwnerV188(e,{...c}),false);
  for(const patch of [{id:'eco131-target-3'},{role:'guard'},{targetIndex:1},{targetIndex:'0'},
    {caste:'praetorian'},{x:descriptor.x+1},{floorY:570}]){
    c.ecosystemActorV131={...descriptor,...patch};assert.equal(isQueenMotherChoirArtOwnerV188(e,c),false);
    assert.equal(artCalls(s.render(c)).length,0);
  }
  c.ecosystemActorV131=descriptor;
  const records=e.ecosystemV131.actors;e.ecosystemV131.actors=records.filter(record=>record.id!==c.id);
  assert.equal(isQueenMotherChoirArtOwnerV188(e,c),false);e.ecosystemV131.actors=records;
  const enemies=e.enemies;e.enemies=enemies.filter(actor=>actor!==c);assert.equal(isQueenMotherChoirArtOwnerV188(e,c),false);e.enemies=enemies;
  e.ecosystemActiveV131=false;assert.equal(isQueenMotherChoirArtOwnerV188(e,c),false);e.ecosystemActiveV131=true;
  for(const operation of ['hive-world','pangaea-second-extinction']){
    e.ecosystemV131.operationId=operation;assert.equal(isQueenMotherChoirArtOwnerV188(e,c),false);
  }
  e.ecosystemV131.operationId='queen-mother-song';assert.equal(isQueenMotherChoirArtOwnerV188(e,c),true);
  // Legal restored body positions are not required to equal descriptor origins.
  c.x+=5;assert.equal(isQueenMotherChoirArtOwnerV188(e,c),true);
});

test('Queen Choirs: absent, incomplete or foreign source retains the whole target ellipse and read-only draw',async t=>{
  const s=await fixture(t,{holdArt:true}),e=s.engine,c=s.choir();c.windup=.3;
  const fallback=s.render(),snapshot=JSON.stringify(e.captureResumeState()),requests=s.requested.length;
  assert.equal(artCalls(fallback).length,0);assert.equal(fallback.filter(call=>call.kind==='ellipse').length,1);
  assert.equal(fallback.filter(call=>call.kind==='line').length,0);s.ready();assert.equal(artCalls(s.render()).length,1);
  const image=e.images.get(ART.imageKey),src=image.src;
  for(const bad of ['https://foreign.invalid'+src,src+'?v=1',src+'#v1','data:image/png;base64,x',
    src.replace('queen-mother/','other/'),src.replaceAll('/','\\')]){
    image._src=bad;assert.equal(queenMotherChoirSourceReadyV188(image),false);assert.deepEqual(s.render(),fallback);
  }
  image._src=src;image.naturalWidth--;assert.deepEqual(s.render(),fallback);image.naturalWidth++;
  image.naturalHeight--;assert.deepEqual(s.render(),fallback);image.naturalHeight++;
  image.complete=false;assert.deepEqual(s.render(),fallback);image.complete=true;
  e.images.delete(ART.imageKey);assert.deepEqual(s.render(),fallback);e.images.set(ART.imageKey,image);
  assert.equal(JSON.stringify(e.captureResumeState()),snapshot);assert.equal(s.requested.length,requests);
});

test('Queen Choirs: entry and successful resume load once, retry errors and ignore obsolete image callbacks',async t=>{
  const s=await fixture(t,{holdArt:true}),e=s.engine,first=e.images.get(ART.imageKey),old=s.choir(),count=s.requested.length;
  await s.reenter();assert.equal(e.images.get(ART.imageKey),first);assert.equal(s.requested.length,count);
  assert.equal(isQueenMotherChoirArtOwnerV188(e,old),false);first.finish(true);await s.reenter();
  const second=e.images.get(ART.imageKey);assert.notEqual(second,first);assert.equal(s.requested.length,count+1);
  const raw=e.captureResumeState(),invalid=structuredClone(raw);invalid.identity.campaignId='foreign';
  assert.equal(e.applyResumeState(invalid).applied,false);assert.equal(e.images.get(ART.imageKey),second);assert.equal(s.requested.length,count+1);
  first.finish();assert.equal(e.images.get(ART.imageKey),second);assert.equal(queenMotherChoirArtReadyV188(e.images),false);
  second.finish();assert.equal(queenMotherChoirArtReadyV188(e.images),true);
  assert.equal(e.applyResumeState(raw).applied,true);assert.equal(e.images.get(ART.imageKey),second);assert.equal(s.requested.length,count+1);
  e.images.delete(ART.imageKey);assert.equal(e.applyResumeState(e.captureResumeState()).applied,true);
  assert.equal(s.requested.length,count+2);assert.equal(queenMotherChoirArtReadyV188(e.images),false);
  s.ready();assert.equal(queenMotherChoirArtReadyV188(e.images),true);
});

test('Queen Choirs: a real incoming hit alone selects reaction; attack clocks and rejected damage cannot create it',async t=>{
  const s=await fixture(t),e=s.engine,c=s.choir(),before=body(c),shots=e.hostileProjectiles.length,pressure=e.ecosystemV131.pressure;
  assert.equal(e.insertionGraceActiveV188(),true);
  c.windup=.6;c.attackClock=0;c.alert=true;assert.ok(presence(queenMotherChoirPoseV188(e,c)));
  const events=s.events.length;
  for(const amount of [0,-1,NaN,Infinity]){
    assert.equal(damage(e,c,amount),0);assert.deepEqual(body(c),before);assert.ok(presence(queenMotherChoirPoseV188(e,c)));
  }
  assert.equal(s.events.length,events);e.paused=true;assert.equal(damage(e,c,1),0);e.paused=false;
  assert.equal(damage(e,c,1),1);assert.equal(c.health,109);close(c.hurtClock,.24);requireFrame(s,c,2);
  assert.equal(e.ecosystemV131.pressure,pressure);assert.equal(e.hostileProjectiles.length,shots);
  assert.deepEqual(e.ecosystemV131.targets,[false,false,false]);assert.equal(e.ecosystemV131.journal.includes('target-0'),false);
  for(const i of [1,2])assert.ok(presence(queenMotherChoirPoseV188(e,s.choir(i))));
  const saved=JSON.stringify(e.captureResumeState()),hitClock=c.hurtClock,afterEvents=s.events.length;
  s.render();s.render();assert.equal(JSON.stringify(e.captureResumeState()),saved);assert.equal(c.hurtClock,hitClock);assert.equal(s.events.length,afterEvents);
});

test('Queen Choirs: native hurt time survives pause and zero, crosses wrap and expires off screen without draw',async t=>{
  const s=await fixture(t),e=s.engine,c=s.choir();c.clock=59.96;damage(e,c,1);requireFrame(s,c,2);
  const saved=JSON.stringify(e.captureResumeState()),hurt=c.hurtClock;e.updateEnemy(c,0);
  assert.equal(JSON.stringify(e.captureResumeState()),saved);assert.equal(c.hurtClock,hurt);
  e.paused=true;tick(e,.4);assert.equal(c.hurtClock,hurt);e.paused=false;
  e.enemyAtlasLoadingPausedV65=true;tick(e,.4);assert.equal(c.hurtClock,hurt);e.enemyAtlasLoadingPausedV65=false;
  e.updateEnemy(c,.06);assert.ok(c.clock<.1);close(c.hurtClock,.18);assert.equal(queenMotherChoirPoseV188(e,c),2);
  c.stunClock=1;e.camera.x=100000;e.updateEnemy(c,.1);close(c.hurtClock,.08);
  e.updateEnemy(c,.1);assert.equal(c.hurtClock,0);assert.ok(presence(queenMotherChoirPoseV188(e,c)));
  const nativeBody=body(c);c.clock=59.98;e.updateEnemy(c,.04);assert.ok(c.clock<.1);
  assert.ok(presence(queenMotherChoirPoseV188(e,c)));assert.deepEqual(body(c),nativeBody);
});

test('Queen Choirs: one-cell-per-second presence is cosmetic, reduced motion is A and targets do not walk or attack',async t=>{
  const s=await fixture(t),e=s.engine,c=s.choir(),physical=body(c),shots=e.hostileProjectiles.length,targets=[...e.ecosystemV131.targets];
  // Declared display fixtures select exact idle cells; native updates below
  // then exercise the existing target early return, not a mocked controller.
  for(const [clock,index] of [[.25,0],[1.25,1],[2.25,0],[59.25,1]]){c.clock=clock;c.hurtClock=0;requireFrame(s,c,index);}
  e.accessibilityRuntime=Object.freeze({...e.accessibilityRuntime,reducedMotion:true});c.clock=1.25;requireFrame(s,c,0);
  damage(e,c,1);requireFrame(s,c,2);e.updateEnemy(c,.1);e.updateEnemy(c,.1);e.updateEnemy(c,.1);requireFrame(s,c,0);
  e.accessibilityRuntime=Object.freeze({...e.accessibilityRuntime,reducedMotion:false});
  c.windup=.7;c.attackClock=0;const facing=c.facing,position=[c.x,c.y];
  Object.assign(e.player,{x:c.x+20,y:c.y+c.h-e.player.h,vx:0,vy:0});
  for(let i=0;i<22;i++)e.updateEnemy(c,.1);
  assert.deepEqual([c.x,c.y],position);assert.equal(c.facing,facing);assert.equal(c.windup,.7);
  assert.equal(e.hostileProjectiles.length,shots);assert.deepEqual(e.ecosystemV131.targets,targets);
  assert.deepEqual([c.w,c.h,c.maxHealth],[physical.w,physical.h,physical.maxHealth]);assert.ok(presence(queenMotherChoirPoseV188(e,c)));
});

test('Queen Choirs: late delivery follows current hurt or death and never replays an expired state',async t=>{
  const s=await fixture(t,{holdArt:true}),e=s.engine,c=s.choir();damage(e,c,1);assert.equal(artCalls(s.render()).length,0);
  e.updateEnemy(c,.1);const saved=JSON.stringify(e.captureResumeState()),events=s.events.length;s.ready();requireFrame(s,c,2);
  assert.equal(JSON.stringify(e.captureResumeState()),saved);assert.equal(s.events.length,events);
  e.updateEnemy(c,.1);e.updateEnemy(c,.1);s.ready();assert.ok(presence(queenMotherChoirPoseV188(e,c)));
  const image=e.images.get(ART.imageKey);e.images.delete(ART.imageKey);keepPlayerNear(e,c);damage(e,c);
  assert.equal(artCalls(s.render()).length,0);e.images.set(ART.imageKey,image);requireFrame(s,c,3);
  e.images.delete(ART.imageKey);tick(e,1.25);e.images.set(ART.imageKey,image);
  assert.equal(queenMotherChoirPoseV188(e,c),null);assert.equal(e.getVisibleEnemiesV65().includes(c),false);
});

test('Queen Choirs: complete cells, common scale, structural support and unmirrored UI remain pure at all three sites',async t=>{
  const s=await fixture(t),e=s.engine;
  for(let actorIndex=0;actorIndex<3;actorIndex++){
    const c=s.choir(actorIndex),position=[c.x,c.y,c.w,c.h];
    for(const index of [0,1,2,3]){
      if(index===3)damage(e,c);
      else {c.clock=index===1?1.25:.25;c.hurtClock=index===2?.24:0;c.health=55;}
      for(const facing of [-1,1]){
        c.facing=facing;const snapshot=JSON.stringify(e.captureResumeState()),hurt=c.hurtClock,events=s.events.length;
        const {calls,image}=requireFrame(s,c,index),anchor=point(image,FRAMES[index].pivot),fit=queenMotherChoirFrameFitV188(e,c);
        close(anchor[0],c.x+33);close(anchor[1],c.y+90);close(image.matrix.a,facing*90/525);close(image.matrix.d,90/525);
        assert.equal(fit.index,index);assert.deepEqual(image.args.slice(6),[627,627]);assert.equal(image.alpha,index===3?.3:1);
        assert.deepEqual([c.x,c.y,c.w,c.h],position);
        const name=calls.find(call=>call.kind==='text'&&call.args[0]===c.name);
        assert.deepEqual(name.args,[c.name,c.x-10,c.y-15]);assert.deepEqual(name.matrix,{a:1,b:0,c:0,d:1,e:0,f:0});assert.equal(name.alpha,1);
        const bars=calls.filter(call=>call.kind==='rect');
        assert.deepEqual(bars.map(call=>call.args),index===3?[]:[[c.x,c.y-8,66,4],[c.x,c.y-8,33,4]]);
        assert.equal(JSON.stringify(e.captureResumeState()),snapshot);assert.equal(c.hurtClock,hurt);assert.equal(s.events.length,events);
      }
    }
  }
  for(const frame of FRAMES){assert.deepEqual(frame.rect,[frame.index%2*627,Math.floor(frame.index/2)*627,627,627]);
    const c=s.choir(),bounds=queenMotherChoirVisualBoundsV188(c),scale=90/525;
    for(const facing of [-1,1])for(const [x,y] of [[0,0],[627,0],[0,627],[627,627]]){
      const px=c.x+33+facing*(x-frame.pivot[0])*scale,py=c.y+90+(y-frame.pivot[1])*scale;
      assert.ok(px>=bounds.x&&px<=bounds.x+bounds.w&&py>=bounds.y&&py<=bounds.y+bounds.h);
    }}
});

test('Queen Choirs: residual target warning retains plus-0.18 ellipse, native alpha and no Queen spikes',async t=>{
  const s=await fixture(t),e=s.engine,c=s.choir();
  // Target AI never generates windup/actionPhase=1. These explicit legacy
  // state fixtures verify the existing overlay/alpha contract, not an attack.
  c.windup=.4;
  for(const state of ['live','phase-one','dead']){
    if(state==='phase-one')c.actionPhase=1;if(state==='dead')damage(e,c);
    for(const facing of [-1,1]){
      c.facing=facing;const calls=s.render(c),image=artCalls(calls)[0],warnings=calls.filter(call=>call.kind==='stroke'&&call.stroke==='#ffcb68');
      const alpha=state==='dead'?.3:state==='phase-one'?.35:1;
      assert.equal(warnings.length,1);assert.ok(calls.indexOf(warnings[0])>calls.indexOf(image));
      assert.equal(image.alpha,alpha);assert.equal(warnings[0].alpha,alpha);assert.equal(warnings[0].lineWidth,4);
      const ellipse=calls.find(call=>call.kind==='ellipse');[0,-43.2,31.02,35.1,.18,0,Math.PI*2].forEach((v,i)=>close(ellipse.args[i],v));
      assert.equal(ellipse.matrix.a,facing);assert.equal(calls.filter(call=>call.kind==='line').length,0);
      assert.equal(calls.find(call=>call.kind==='text').alpha,1);
    }
  }
});

test('Queen Choirs: real neutralizations retain last corpse after mother-1, unlock boss once and preserve pressure and objective rules',async t=>{
  const s=await fixture(t),e=s.engine,boss=e.ecosystemActorV131('eco131-boss');
  const nursery=[...e.ecosystemV131.nursery],beacons=[...e.ecosystemV131.beacons];e.ecosystemV131.pressure=40;
  for(let i=0;i<3;i++){
    assert.equal(damage(e,boss,1),0);const c=s.choir(i),before=e.ecosystemV131.pressure;
    assert.ok(damage(e,c)>0);assert.equal(c.alive,false);assert.equal(c.health,0);assert.equal(c.deathClock,1.2);
    assert.deepEqual(e.ecosystemV131.targets,[0,1,2].map(index=>index<=i));close(e.ecosystemV131.pressure,Math.max(0,before-16));
    assert.equal(e.ecosystemV131.phase,i===2?'mother-1':'choirs');assert.equal(isQueenMotherChoirArtOwnerV188(e,c),true);requireFrame(s,c,3);
    const eventCount=s.events.length,checkpoint=JSON.stringify(e.ecosystemCheckpointV131),pressure=e.ecosystemV131.pressure;
    e.defeatEnemy(c);assert.equal(damage(e,c),0);assert.equal(s.events.length,eventCount);
    assert.equal(JSON.stringify(e.ecosystemCheckpointV131),checkpoint);assert.equal(e.ecosystemV131.pressure,pressure);
    assert.equal(e.ecosystemV131.journal.filter(id=>id===`target-${i}`).length,1);
    assert.equal(s.events.filter(event=>event.type==='ecosystem-radio-v131'&&event.id===`target-${i}`).length,1);
  }
  assert.equal(damage(e,boss,1),1);assert.equal(boss.health,599);assert.equal(e.ecosystemV131.bossPhase,1);
  assert.deepEqual(e.ecosystemV131.nursery,nursery);assert.deepEqual(e.ecosystemV131.beacons,beacons);
  assert.equal(s.events.filter(event=>event.type==='ecosystem-wave-warning-v131').length,0);
  const c=s.choir(2),physical=body(c),clock=c.clock;keepPlayerNear(e,c);
  e.updateEnemy(c,.1);assert.equal(c.deathClock,1.2,'only the full update owns corpse expiry');
  e.paused=true;tick(e,.3);assert.equal(c.deathClock,1.2);e.paused=false;
  assert.equal(e.getVisibleEnemiesV65().includes(c),true);tick(e,.3);close(c.deathClock,.9);assert.equal(requireFrame(s,c,3).image.alpha,.3);
  assert.equal(e.getVisibleEnemiesV65().includes(c),true);assert.ok(e.ecosystemV131.pressure>0,'boss phase retains its native pressure contribution');
  tick(e,.95);assert.equal(c.deathClock,0);assert.equal(e.getVisibleEnemiesV65().includes(c),false);assert.equal(queenMotherChoirPoseV188(e,c),null);
  assert.deepEqual(body(c),physical);assert.equal(c.clock,clock);
});

test('Queen Choirs: successful resume recreates ownership without old hurt, preserves last corpse age and rejects incoherent target state',async t=>{
  const s=await fixture(t),e=s.engine;let c=s.choir();damage(e,c,1);const hit=e.captureResumeState(),old=c,requests=s.requested.length;
  assert.equal(hit.enemies.find(enemy=>enemy.id===c.id).hurtClock,undefined);requireFrame(s,c,2);
  const invalid=structuredClone(hit);invalid.specialOperation.ecosystemV131.targets[0]=true;
  assert.equal(e.applyResumeState(invalid).applied,false);assert.equal(s.choir(),c);requireFrame(s,c,2);
  assert.deepEqual(e.captureResumeState(),hit);assert.equal(s.requested.length,requests);
  assert.equal(e.applyResumeState(hit).applied,true);c=s.choir();assert.notEqual(c,old);assert.deepEqual(body(c),body(old));
  assert.equal(isQueenMotherChoirArtOwnerV188(e,old),false);assert.equal(artCalls(s.render(old)).length,0);
  assert.ok(presence(queenMotherChoirPoseV188(e,c)));assert.equal(c.hurtClock,0);assert.equal(s.requested.length,requests);
  for(let i=0;i<3;i++)damage(e,s.choir(i));c=s.choir(2);keepPlayerNear(e,c);tick(e,.3);
  const corpse=e.captureResumeState(),remaining=c.deathClock,deadBody=body(c);assert.equal(e.ecosystemV131.phase,'mother-1');
  assert.equal(e.applyResumeState(corpse).applied,true);const restored=s.choir(2);assert.notEqual(restored,c);
  assert.deepEqual(body(restored),deadBody);close(restored.deathClock,remaining);assert.equal(isQueenMotherChoirArtOwnerV188(e,c),false);
  assert.equal(isQueenMotherChoirArtOwnerV188(e,restored),true);requireFrame(s,restored,3);assert.equal(e.hostileProjectiles.length,0);
});

test('Queen Choirs: visibility is independent of Queen/guard sources, preserves order, and excludes dormant or expired bodies',async t=>{
  const s=await fixture(t),e=s.engine,c=s.choir(),bounds=queenMotherChoirVisualBoundsV188(c);
  const choirImage=e.images.get(ART.imageKey),queenKey=QUEEN_MOTHER_ART_V188.arms.imageKey,guardKey=QUEEN_MOTHER_GUARD_ART_V188.imageKey;
  const queenImage=e.images.get(queenKey),guardImage=e.images.get(guardKey);
  assert.equal(queenMotherArtReadyV188(e.images),true);assert.equal(queenMotherGuardArtReadyV188(e.images),true);
  for(const camera of [{x:c.x-500,y:0},{x:bounds.x-1280-64+1,y:0},{x:bounds.x+bounds.w+64-1,y:0}]){
    Object.assign(e.camera,camera);e.images.delete(queenKey);e.images.delete(guardKey);
    assert.equal(queenMotherChoirArtReadyV188(e.images),true);assert.equal(artCalls(s.render(c)).length,1);
    const visible=e.getVisibleEnemiesV65();assert.ok(visible.includes(c));assert.deepEqual(visible,e.enemies.filter(actor=>visible.includes(actor)));
    e.images.delete(ART.imageKey);const fallback=e.getVisibleEnemiesV65();
    assert.deepEqual(visible.filter(actor=>!isQueenMotherChoirArtOwnerV188(e,actor)),fallback.filter(actor=>!isQueenMotherChoirArtOwnerV188(e,actor)));
    e.images.set(ART.imageKey,choirImage);e.images.set(queenKey,queenImage);e.images.set(guardKey,guardImage);
  }
  e.camera.x=c.x-500;c.dormant=true;assert.equal(e.getVisibleEnemiesV65().includes(c),false);c.dormant=false;
  c.alive=false;c.deathClock=0;assert.equal(e.getVisibleEnemiesV65().includes(c),false);
  c.alive=true;e.camera.x=100000;assert.equal(e.getVisibleEnemiesV65().includes(c),false);assert.equal(PRESENTATION.corpseSeconds,1.2);
});

test('Queen Choirs: their source availability cannot change adult or guard body/UI and warnings',async t=>{
  const s=await fixture(t),e=s.engine,image=e.images.get(ART.imageKey);
  for(const id of ['eco131-boss','eco131-guard-0']){
    const actor=e.ecosystemActorV131(id);actor.windup=.3;
    assert.equal(isQueenMotherChoirArtOwnerV188(e,actor),false);const withChoirs=s.render(actor);
    e.images.delete(ART.imageKey);assert.deepEqual(s.render(actor),withChoirs);e.images.set(ART.imageKey,image);
    assert.equal(artCalls(withChoirs).length,0);assert.ok(withChoirs.some(call=>call.kind==='image'));
    const ellipse=withChoirs.find(call=>call.kind==='ellipse');close(ellipse.args[4],-.1);
    assert.equal(withChoirs.filter(call=>call.kind==='stroke'&&call.stroke==='#ffcb68').length,id==='eco131-boss'?8:1);
  }
});

test('Queen Choirs: the two other ecosystem operations retain vector targets and request no Choir asset',async t=>{
  for(const operation of ['hive-world','pangaea-second-extinction'])await t.test(operation,async sub=>{
    const s=await fixture(sub,{operation}),e=s.engine,c=s.choir();
    assert.equal(s.requested.length,0);assert.equal(queenMotherChoirArtReadyV188(e.images),false);
    assert.equal(isQueenMotherChoirArtOwnerV188(e,c),false);assert.equal(queenMotherChoirPoseV188(e,c),null);
    const calls=s.render(c);assert.equal(artCalls(calls).length,0);assert.equal(calls.filter(call=>call.kind==='ellipse').length,1);
    assert.deepEqual([c.w,c.h,c.maxHealth],[66,90,110]);assert.notEqual(c.name,'CHŒUR 1');
    assert.equal(s.options.campaign.canonExact,false);assert.equal(s.options.campaign.implementationStatus,'partial');
  });
});
