// Full production engine and authored Queen Mother mission. DOM/RAF/Image
// doubles are explicit; source hashes/dimensions read the actual shipped PNG.
// Canvas calls are recorded, not rasterized. Display fixtures do not certify
// anatomy, transitions, a browser journey or the scene's final pixel QA.
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
import {QUEEN_MOTHER_GUARD_ART_V188 as ART,QUEEN_MOTHER_GUARD_FRAMES_V188 as FRAMES,
  QUEEN_MOTHER_GUARD_PRESENTATION_V188 as PRESENTATION,
  queenMotherGuardArtReadyV188,queenMotherGuardSourceReadyV188,isQueenMotherGuardArtOwnerV188,
  queenMotherGuardPoseV188,queenMotherGuardVisualBoundsV188,advanceQueenMotherGuardContactV188,
  beginQueenMotherGuardStepV188,finishQueenMotherGuardStepV188
} from '../src/queen-mother-guard-art-v188.js';

const close=(actual,expected,label='')=>assert.ok(Math.abs(actual-expected)<1e-7,`${label}: ${actual} != ${expected}`);
const artCalls=calls=>calls.filter(call=>call.kind==='image' && call.path===ART.path);
const body=actor=>({x:actor.x,y:actor.y,w:actor.w,h:actor.h,health:actor.health,maxHealth:actor.maxHealth,alive:actor.alive});
const idle=pose=>Number.isInteger(pose) && pose>=0 && pose<=3;
const walking=pose=>Number.isInteger(pose) && pose>=4 && pose<=7;
const sourceBytes=path=>readFileSync(new URL(`..${path}`,import.meta.url));
function sourceSize(path) {
  try { const b=sourceBytes(path);return b.subarray(1,4).toString()==='PNG' ? [b.readUInt32BE(16),b.readUInt32BE(20)] : null; }
  catch { return null; }
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
  globalThis.location={origin:'https://queen-mother-guard.invalid'};
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
  return {engine,options,events,requested,drawing,get guard(){return engine.ecosystemActorV131('eco131-guard-0');},
    render(actor=engine.ecosystemActorV131('eco131-guard-0')){return drawing.render(engine,actor);},
    async reenter(){engine.start(options);await prepare(engine);},ready(){engine.images.get(ART.imageKey).finish();}};
}
function placePlayer(engine,guard,offset=40,floor=guard.y+guard.h) {
  Object.assign(engine.player,{x:guard.x+offset,y:floor-engine.player.h,vx:0,vy:0,grounded:true,
    inVehicle:false,ventTransit:null,downed:false,alive:true});
}
function finishInsertionGrace(engine) {
  Object.assign(engine.player,{x:180,y:570-engine.player.h,vx:0,vy:0,grounded:true,inVehicle:false,ventTransit:null});
  tick(engine,4.05);assert.equal(engine.insertionGraceActiveV188(),false);
}
function damage(engine,actor,amount=999) {
  return engine.applyEnemyDamage(actor,amount,{owner:engine.player,kind:'rifle',x:actor.x-40,y:actor.y+20});
}
function contact(engine,guard) {
  placePlayer(engine,guard);guard.stunClock=guard.supportStunV72=0;guard.attackClock=0;guard.windup=.47;
  const before=engine.player.health;engine.updateEnemy(guard,.02);
  assert.ok(engine.player.health<before,'real native contact must apply health damage');
  assert.equal(queenMotherGuardPoseV188(engine,guard),9);close(guard.attackClock,1.65);assert.equal(guard.windup,0);
}
function requireFrame(session,actor,index) {
  assert.equal(queenMotherGuardPoseV188(session.engine,actor),index);
  const calls=session.render(actor),images=artCalls(calls);assert.equal(images.length,1);
  assert.deepEqual(images[0].args.slice(0,4),FRAMES[index].rect);return {calls,image:images[0]};
}

test('Queen guards: the untouched full atlas dresses six current role owners without importing caste or physical profile',async t=>{
  const s=await fixture(t),e=s.engine;
  const expectedHash='f4c778139b8018952bbd5c27c2fbd57449310b6ef973803750173e8ba769ecda';
  assert.equal(ART.sha256,expectedHash);assert.equal(createHash('sha256').update(sourceBytes(ART.path)).digest('hex'),expectedHash);
  assert.deepEqual(sourceSize(ART.path),[1024,1024]);assert.equal(queenMotherGuardArtReadyV188(e.images),true);
  const expected=[[800,500],[1320,285],[1840,500],[2360,285],[2880,500],[3400,285]];
  for(const [i,position] of expected.entries()){
    const g=e.ecosystemActorV131(`eco131-guard-${i}`);assert.equal(isQueenMotherGuardArtOwnerV188(e,g),true);
    assert.deepEqual([g.x,g.y,g.w,g.h,g.maxHealth],[...position,58,70,105]);
    assert.equal(g.ecosystemActorV131.caste,undefined);assert.equal(g.isRoyal,false);assert.equal(g.royalScaleV72,false);
    assert.equal(artCalls(s.render(g)).length,1);
    assert.ok(!e.getVisibleEnemyAtlasSheetsV65([g]).some(sheet=>sheet.path===ART.path));
  }
  for(const actor of e.enemies.filter(actor=>actor.ecosystemActorV131.role!=='guard')){
    assert.equal(isQueenMotherGuardArtOwnerV188(e,actor),false);assert.equal(artCalls(s.render(actor)).length,0);
  }
  assert.equal(e.ecosystemV131.targets.length,3);assert.equal(e.ecosystemV131.targets.some(Boolean),false);
});

test('Queen guards: exact scene, object and recorded descriptor ownership reject lookalikes and detached owners',async t=>{
  const s=await fixture(t),e=s.engine,g=s.guard,descriptor=g.ecosystemActorV131;
  assert.equal(isQueenMotherGuardArtOwnerV188(e,{...g}),false);
  for(const patch of [{id:'eco131-guard-99'},{role:'target'},{caste:'sentinel'},{x:descriptor.x+1}]){
    g.ecosystemActorV131={...descriptor,...patch};assert.equal(isQueenMotherGuardArtOwnerV188(e,g),false);
    assert.equal(artCalls(s.render()).length,0);
  }
  g.ecosystemActorV131=descriptor;
  const records=e.ecosystemV131.actors;e.ecosystemV131.actors=records.filter(d=>d.id!==g.id);
  assert.equal(isQueenMotherGuardArtOwnerV188(e,g),false);e.ecosystemV131.actors=records;
  e.ecosystemV131.operationId='hive-world';assert.equal(isQueenMotherGuardArtOwnerV188(e,g),false);
  e.ecosystemV131.operationId='queen-mother-song';assert.equal(isQueenMotherGuardArtOwnerV188(e,g),true);
});

test('Queen guards: incomplete or foreign atlas keeps the complete native fallback and drawing is pure',async t=>{
  const s=await fixture(t,{holdArt:true}),e=s.engine,g=s.guard;g.windup=.3;
  const fallback=s.render(),saved=JSON.stringify(e.captureResumeState()),count=s.requested.length;
  assert.equal(artCalls(fallback).length,0);s.ready();assert.equal(artCalls(s.render()).length,1);
  const image=e.images.get(ART.imageKey),src=image.src;
  for(const bad of ['https://foreign.invalid'+src,src+'?v=1',src+'#v1','data:image/png;base64,x',src.replace('normalized/','other/'),src.replaceAll('/','\\')]){
    image._src=bad;assert.equal(queenMotherGuardSourceReadyV188(image),false);assert.deepEqual(s.render(),fallback);
  }
  image._src=src;image.naturalWidth--;assert.deepEqual(s.render(),fallback);image.naturalWidth++;
  image.complete=false;assert.deepEqual(s.render(),fallback);image.complete=true;
  e.images.delete(ART.imageKey);assert.deepEqual(s.render(),fallback);e.images.set(ART.imageKey,image);
  assert.equal(JSON.stringify(e.captureResumeState()),saved);assert.equal(s.requested.length,count,'draw never requests a source');
});

test('Queen guards: entry and resume share one request, retry errors and ignore obsolete callbacks',async t=>{
  const s=await fixture(t,{holdArt:true}),e=s.engine,first=e.images.get(ART.imageKey),old=s.guard,count=s.requested.length;
  await s.reenter();assert.equal(e.images.get(ART.imageKey),first);assert.equal(s.requested.length,count);
  assert.equal(isQueenMotherGuardArtOwnerV188(e,old),false);first.finish(true);await s.reenter();
  const current=e.images.get(ART.imageKey);assert.notEqual(current,first);assert.equal(s.requested.length,count+1);
  const saved=JSON.stringify(e.captureResumeState()),events=s.events.length;first.finish();
  assert.equal(e.images.get(ART.imageKey),current);assert.equal(queenMotherGuardArtReadyV188(e.images),false);
  s.ready();assert.equal(queenMotherGuardArtReadyV188(e.images),true);assert.equal(JSON.stringify(e.captureResumeState()),saved);
  assert.equal(s.events.length,events);await s.reenter();assert.equal(e.images.get(ART.imageKey),current);
  assert.equal(s.requested.length,count+1);
});

test('Queen guards: other ecosystems keep vectors and never request this role-specific atlas key',async t=>{
  for(const operation of ['hive-world','pangaea-second-extinction'])await t.test(operation,async t=>{
    const s=await fixture(t,{operation});assert.equal(s.engine.images.has(ART.imageKey),false);
    for(const actor of s.engine.enemies){assert.equal(isQueenMotherGuardArtOwnerV188(s.engine,actor),false);assert.equal(artCalls(s.render(actor)).length,0);}
  });
});

test('Queen guards: final displacement follows real grace rollback, movement, wall, stun and floor ownership, never vx or alert',async t=>{
  const s=await fixture(t),e=s.engine,g=s.guard;placePlayer(e,g,160);g.attackClock=10;
  const heldX=g.x;assert.equal(e.insertionGraceActiveV188(),true);e.updateEnemy(g,.05);
  assert.equal(g.x,heldX);assert.ok(idle(queenMotherGuardPoseV188(e,g)),'grace rolls x back after the inner controller');
  finishInsertionGrace(e);placePlayer(e,g,160);g.attackClock=10;g.windup=0;g.vx=0;
  const x=g.x,result=e.updateEnemy(g,.05);assert.equal(result,undefined);close(g.x-x,3.6);
  assert.equal(g.vx,0);assert.ok(walking(queenMotherGuardPoseV188(e,g)),'real x displacement with zero vx animates');
  const savedPose=queenMotherGuardPoseV188(e,g),savedX=g.x;e.updateEnemy(g,0);
  assert.equal(g.x,savedX);assert.equal(queenMotherGuardPoseV188(e,g),savedPose);
  g.vx=999;g.alert=true;const walls=e.walls;
  e.walls=[...walls,{id:'guard-test-wall',x:g.x+g.w+10,y:400,w:20,h:170}];
  const blocked=g.x;e.updateEnemy(g,.1);assert.equal(g.x,blocked);assert.ok(idle(queenMotherGuardPoseV188(e,g)));
  e.walls=walls;placePlayer(e,g,160,355);e.updateEnemy(g,.1);assert.equal(g.x,blocked);assert.ok(idle(queenMotherGuardPoseV188(e,g)));
  placePlayer(e,g,160);g.stunClock=1;e.updateEnemy(g,.1);assert.equal(g.x,blocked);assert.ok(idle(queenMotherGuardPoseV188(e,g)));
  g.stunClock=0;e.updateEnemy(g,.05);assert.ok(g.x>blocked);assert.ok(walking(queenMotherGuardPoseV188(e,g)));
  const before=JSON.stringify(e.captureResumeState()),pose=queenMotherGuardPoseV188(e,g);e.paused=true;tick(e,.4);
  assert.equal(JSON.stringify(e.captureResumeState()),before);assert.equal(queenMotherGuardPoseV188(e,g),pose);
});

test('Queen guards: distance travelled chooses walking cells and invalid external jumps are not footsteps',async t=>{
  const s=await fixture(t),e=s.engine,g=s.guard;finishInsertionGrace(e);placePlayer(e,g,220);g.attackClock=10;
  const seen=new Set();e.updateEnemy(g,.01);seen.add(queenMotherGuardPoseV188(e,g));
  for(let i=0;i<3;i++){e.updateEnemy(g,.1);seen.add(queenMotherGuardPoseV188(e,g));}
  assert.deepEqual([...seen].sort(),[4,5,6,7]);
  const before=beginQueenMotherGuardStepV188(e,g,.05);g.clock=(g.clock+.05)%60;g.x+=300;
  finishQueenMotherGuardStepV188(e,g,before);assert.ok(idle(queenMotherGuardPoseV188(e,g)),'a relocation larger than a native step is not locomotion');
});

test('Queen guards: only accepted native melee marks impact; insertion grace, zero and no-op producers do not',async t=>{
  const s=await fixture(t),e=s.engine,g=s.guard;placePlayer(e,g);g.attackClock=0;g.windup=.47;
  const held=e.insertionGraceHeldV188,health=e.player.health;e.updateEnemy(g,.02);
  assert.equal(e.player.health,health);assert.equal(e.insertionGraceHeldV188,held+1);close(g.attackClock,1.65);
  assert.ok(idle(queenMotherGuardPoseV188(e,g)),'accepted cadence during grace is not accepted contact');
  finishInsertionGrace(e);const native=e.damagePlayer,received=[];
  e.damagePlayer=function(target,amount,options){const result=native.call(this,target,amount,options);received.push({target,amount,options,result});return result;};
  const shots=e.hostileProjectiles.length;contact(e,g);assert.equal(received.length,1);
  assert.equal(received[0].target,e.player);assert.equal(received[0].amount,14);assert.ok(received[0].result>0);
  assert.deepEqual(received[0].options,{source:'ecosystem-contact-v131',attackKind:'melee',sourceX:g.x,sourceY:g.y});
  assert.equal(e.hostileProjectiles.length,shots);e.damagePlayer=native;
  for(const returned of [0,undefined,NaN,-1]){
    for(let i=0;i<4;i++)e.updateEnemy(g,.1);
    e.damagePlayer=()=>returned;g.attackClock=0;g.windup=.47;const hp=e.player.health;e.updateEnemy(g,.02);
    assert.equal(e.player.health,hp);close(g.attackClock,1.65);assert.ok(idle(queenMotherGuardPoseV188(e,g)),'no accepted return, no visual impact');
  }
  e.damagePlayer=native;
});

test('Queen guards: contact age freezes on pause and zero, crosses wrap, and expires through AI early returns without drawing',async t=>{
  const s=await fixture(t),e=s.engine,g=s.guard;finishInsertionGrace(e);g.clock=59.96;contact(e,g);
  const saved=JSON.stringify(e.captureResumeState()),pose=queenMotherGuardPoseV188(e,g);
  e.updateEnemy(g,0);assert.equal(JSON.stringify(e.captureResumeState()),saved);assert.equal(queenMotherGuardPoseV188(e,g),pose);
  e.paused=true;tick(e,.4);assert.equal(queenMotherGuardPoseV188(e,g),9);e.paused=false;
  e.enemyAtlasLoadingPausedV65=true;tick(e,.4);assert.equal(queenMotherGuardPoseV188(e,g),9);e.enemyAtlasLoadingPausedV65=false;
  e.updateEnemy(g,.06);assert.ok(g.clock<.1);assert.equal(queenMotherGuardPoseV188(e,g),9);
  g.stunClock=1;e.updateEnemy(g,.06);assert.equal(queenMotherGuardPoseV188(e,g),10);
  e.camera.x=100000;e.updateEnemy(g,.1);assert.equal(queenMotherGuardPoseV188(e,g),11);
  g.stunClock=0;e.player.ventTransit={fixture:true};e.updateEnemy(g,.1);assert.ok(idle(queenMotherGuardPoseV188(e,g)));
  for(let i=0;i<610;i++)e.updateEnemy(g,.1);
  assert.ok(idle(queenMotherGuardPoseV188(e,g)),'no 60-second replay after private cue expiry');
  e.player.ventTransit=null;contact(e,g);advanceQueenMotherGuardContactV188(e,g,-.1);assert.notEqual(queenMotherGuardPoseV188(e,g),9);
  contact(e,g);advanceQueenMotherGuardContactV188(e,g,NaN);assert.notEqual(queenMotherGuardPoseV188(e,g),9);
  contact(e,g);g.clock=(g.clock+1)%60;advanceQueenMotherGuardContactV188(e,g,0);assert.notEqual(queenMotherGuardPoseV188(e,g),9);
});

test('Queen guards: late image delivery follows current contact age and cannot replay an expired impact',async t=>{
  const s=await fixture(t,{holdArt:true}),e=s.engine,g=s.guard;finishInsertionGrace(e);contact(e,g);
  assert.equal(artCalls(s.render()).length,0);e.updateEnemy(g,.1);e.updateEnemy(g,.03);
  const saved=JSON.stringify(e.captureResumeState()),events=s.events.length;s.ready();requireFrame(s,g,10);
  assert.equal(JSON.stringify(e.captureResumeState()),saved);assert.equal(s.events.length,events);
  e.updateEnemy(g,.1);e.updateEnemy(g,.1);s.ready();assert.ok(idle(queenMotherGuardPoseV188(e,g)));
});

test('Queen guards: complete cells, common scale, mirror, unchanged labels and ellipse-only warning remain pure',async t=>{
  const s=await fixture(t),e=s.engine,g=s.guard,seen=new Set();finishInsertionGrace(e);
  for(const index of [0,1,2,3,8])for(const facing of [-1,1]){
    g.clock=index<4?index/4:0;g.windup=index===8?.2:0;g.facing=facing;g.health=63;
    const saved=JSON.stringify(e.captureResumeState()),{calls,image}=requireFrame(s,g,index);seen.add(index);
    const anchor=point(image,FRAMES[index].pivot);close(anchor[0],g.x+29);close(anchor[1],g.y+70);
    close(image.matrix.a,facing*70/161);close(image.matrix.d,70/161);assert.equal(image.alpha,1);
    const name=calls.find(call=>call.kind==='text'&&call.args[0]===g.name);
    assert.deepEqual(name.args,[g.name,g.x-10,g.y-15]);assert.deepEqual(name.matrix,{a:1,b:0,c:0,d:1,e:0,f:0});assert.equal(name.alpha,1);
    const bars=calls.filter(call=>call.kind==='rect');assert.deepEqual(bars.map(call=>call.args),[[g.x,g.y-8,58,4],[g.x,g.y-8,34.8,4]]);
    const warning=calls.filter(call=>call.kind==='stroke'&&call.stroke==='#ffcb68');assert.equal(warning.length,index===8?1:0);
    if(index===8){assert.ok(calls.indexOf(warning[0])>calls.indexOf(image));assert.equal(warning[0].lineWidth,4);
      const ellipse=calls.find(call=>call.kind==='ellipse').args;[0,-33.6,27.26,27.3,-.1,0,Math.PI*2].forEach((v,i)=>close(ellipse[i],v));
      assert.equal(calls.filter(call=>call.kind==='line').length,0,'guard never inherits seven Queen spikes');}
    assert.equal(JSON.stringify(e.captureResumeState()),saved);
  }
  assert.equal(seen.size,5);e.accessibilityRuntime=Object.freeze({...e.accessibilityRuntime,reducedMotion:true});g.windup=0;g.clock=.8;
  assert.equal(queenMotherGuardPoseV188(e,g),0);g.hurtClock=.24;assert.equal(queenMotherGuardPoseV188(e,g),0,'no invented hurt row');
  for(const frame of FRAMES){assert.deepEqual(frame.rect,[frame.index%4*256,Math.floor(frame.index/4)*256,256,256]);
    const bounds=queenMotherGuardVisualBoundsV188(g),scale=70/161;
    for(const facing of [-1,1])for(const [x,y] of [[0,0],[256,0],[0,256],[256,256]]){
      const px=g.x+29+facing*(x-frame.pivot[0])*scale,py=g.y+70+(y-frame.pivot[1])*scale;
      assert.ok(px>=bounds.x&&px<=bounds.x+bounds.w&&py>=bounds.y&&py<=bounds.y+bounds.h);
    }}
});

test('Queen guards: a real death keeps residual warning, native alpha, collapse progression and full-update disappearance',async t=>{
  const s=await fixture(t),e=s.engine,g=s.guard;finishInsertionGrace(e);placePlayer(e,g);g.windup=.2;
  const targets=[...e.ecosystemV131.targets],phase=e.ecosystemV131.phase;damage(e,g);
  assert.equal(g.alive,false);assert.equal(g.deathClock,1.2);assert.deepEqual(e.ecosystemV131.targets,targets);assert.equal(e.ecosystemV131.phase,phase);
  const deadBody=body(g),clock=g.clock;let draw=requireFrame(s,g,12);
  assert.equal(draw.image.alpha,.3);assert.equal(draw.calls.filter(c=>c.kind==='stroke'&&c.stroke==='#ffcb68').length,1);
  assert.equal(draw.calls.filter(c=>c.kind==='rect').length,0);assert.equal(draw.calls.find(c=>c.kind==='text').alpha,1);
  e.paused=true;tick(e,.2);assert.equal(g.deathClock,1.2);e.paused=false;
  tick(e,.17);requireFrame(s,g,13);tick(e,.13);requireFrame(s,g,14);tick(e,.15);draw=requireFrame(s,g,15);
  assert.equal(draw.image.alpha,.3);assert.equal(g.clock,clock);assert.deepEqual(body(g),deadBody);
  tick(e,.8);assert.equal(g.deathClock,0);assert.equal(e.getVisibleEnemiesV65().includes(g),false);assert.equal(queenMotherGuardPoseV188(e,g),null);
});

test('Queen guards: resume preserves physical position, native windup and corpse age, never private motion or accepted contact',async t=>{
  const s=await fixture(t),e=s.engine;finishInsertionGrace(e);let g=s.guard;placePlayer(e,g,180);g.attackClock=10;e.updateEnemy(g,.1);
  g.windup=.2;const anticipated=e.captureResumeState(),old=g;
  assert.equal(anticipated.specialOperation.ecosystemV131.actors.find(d=>d.id===g.id).x,800,'authored descriptor never follows moving x');
  assert.equal(e.validateEcosystemResumeV131(anticipated).valid,true);assert.equal(e.applyResumeState(anticipated).applied,true);g=s.guard;
  assert.notEqual(g,old);assert.equal(isQueenMotherGuardArtOwnerV188(e,old),false);assert.equal(artCalls(s.render(old)).length,0);
  assert.deepEqual(body(g),body(old));requireFrame(s,g,8);contact(e,g);
  const hit=e.captureResumeState(),malformed=structuredClone(hit),requests=s.requested.length;malformed.identity.campaignId='foreign';
  assert.equal(e.applyResumeState(malformed).applied,false);assert.equal(s.guard,g);requireFrame(s,g,9);
  assert.deepEqual(e.captureResumeState(),hit);assert.equal(s.requested.length,requests);
  assert.equal(e.applyResumeState(hit).applied,true);const restored=s.guard;assert.notEqual(restored,g);assert.deepEqual(body(restored),body(g));
  assert.ok(idle(queenMotherGuardPoseV188(e,restored)));assert.equal(isQueenMotherGuardArtOwnerV188(e,g),false);
  assert.equal(e.hostileProjectiles.length,0);assert.equal(s.requested.length,requests);
  damage(e,restored);tick(e,.25);const corpse=e.captureResumeState(),remaining=restored.deathClock;
  assert.equal(e.applyResumeState(corpse).applied,true);close(s.guard.deathClock,remaining);assert.equal(queenMotherGuardPoseV188(e,s.guard),13);
});

test('Queen guards: true boss and beacon waves share the same role, both origin rules, journal deduplication and native timers',async t=>{
  const s=await fixture(t),e=s.engine;finishInsertionGrace(e);
  for(let i=0;i<3;i++)damage(e,e.ecosystemActorV131(`eco131-target-${i}`));
  const q=e.ecosystemActorV131('eco131-boss');
  for(const [phase,playerX,origin] of [[2,3530,3870],[3,180,3530],[4,3530,3870]]){
    e.player.x=playerX;damage(e,q);assert.equal(e.ecosystemV131.bossPhase,phase);
    for(let i=0;i<2;i++){const g=e.ecosystemActorV131(`eco131-wave-boss-phase-${phase}-${i}`);
      assert.equal(isQueenMotherGuardArtOwnerV188(e,g),true);assert.deepEqual([g.ecosystemActorV131.x,g.y,g.w,g.h,g.maxHealth],[origin+i*75,500,58,70,105]);}
  }
  damage(e,q);assert.equal(e.ecosystemV131.bossDefeated,true);
  // A high-health marine fixture keeps the real attack pipeline active while
  // the 22-second defence is observed; no wave producer or clock is replaced.
  e.player.maxHealth=e.player.health=10000;
  for(const x of [4280,4540]){Object.assign(e.player,{x:x-e.player.w/2,y:570-e.player.h,vx:0,vy:0,grounded:true});assert.equal(e.interact(),true);}
  assert.equal(e.ecosystemV131.beacons.every(Boolean),true);
  for(const [index,x,origin] of [[0,4400,4680],[1,4500,4880],[2,4400,4680]]){
    e.player.x=x;tick(e,index===0?7.05:7);
    for(let i=0;i<2;i++){const id=`eco131-wave-beacon-${index}-${i}`,g=e.ecosystemActorV131(id);
      assert.ok(g,id);assert.equal(isQueenMotherGuardArtOwnerV188(e,g),true);
      assert.deepEqual([g.ecosystemActorV131.x,g.ecosystemActorV131.floorY,g.w,g.h,g.maxHealth],[origin+i*75,570,58,70,105]);}
  }
  assert.equal(e.enemies.filter(g=>isQueenMotherGuardArtOwnerV188(e,g)).length,18);
  const count=e.enemies.length;e.spawnEcosystemWaveV131('beacon-0',4680);assert.equal(e.enemies.length,count);
  assert.equal(s.events.filter(event=>event.type==='ecosystem-wave-warning-v131').length,6);
  for(const g of e.enemies.filter(g=>isQueenMotherGuardArtOwnerV188(e,g))){assert.equal(g.ecosystemActorV131.caste,undefined);assert.equal(artCalls(s.render(g)).length,1);}
});

test('Queen guards: visibility unions ready guard and Queen bounds independently and preserves order and dead/dormant filters',async t=>{
  const s=await fixture(t),e=s.engine,g=s.guard,bounds=queenMotherGuardVisualBoundsV188(g);
  assert.equal(queenMotherArtReadyV188(e.images),true);
  const queenSource=QUEEN_MOTHER_ART_V188.arms,queenImage=e.images.get(queenSource.imageKey),guardImage=e.images.get(ART.imageKey);
  for(const camera of [{x:g.x-500,y:0},{x:bounds.x-1280-64+1,y:0},{x:bounds.x+bounds.w+64-1,y:0}]){
    Object.assign(e.camera,camera);e.images.delete(ART.imageKey);const fallback=e.getVisibleEnemiesV65();
    e.images.set(ART.imageKey,guardImage);e.images.delete(queenSource.imageKey);const visible=e.getVisibleEnemiesV65();
    assert.ok(visible.includes(g),'guard visibility does not depend on all Queen sources being ready');
    assert.deepEqual(visible,e.enemies.filter(actor=>visible.includes(actor)));
    assert.deepEqual(visible.filter(actor=>!isQueenMotherGuardArtOwnerV188(e,actor)&&actor.id!=='eco131-boss'),
      fallback.filter(actor=>!isQueenMotherGuardArtOwnerV188(e,actor)&&actor.id!=='eco131-boss'));
    e.images.set(queenSource.imageKey,queenImage);
  }
  e.camera.x=g.x-500;g.dormant=true;assert.equal(e.getVisibleEnemiesV65().includes(g),false);g.dormant=false;
  g.alive=false;g.deathClock=0;assert.equal(e.getVisibleEnemiesV65().includes(g),false);
  e.camera.x=100000;g.alive=true;assert.equal(e.getVisibleEnemiesV65().includes(g),false);
  assert.equal(PRESENTATION.corpseSeconds,1.2);
});
