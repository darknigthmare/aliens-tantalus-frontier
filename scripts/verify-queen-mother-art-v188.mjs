// Production engine, complete application catalogue and authored ecosystem.
// DOM/RAF/Image are declared doubles; dimensions/hashes are real PNG bytes.
// Canvas commands are recorded, not rasterized. Pose fixtures and controller
// stimuli below do not constitute a browser campaign or native pixel review.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {host,prepare,tick} from './engine-host-v188.mjs';
import {GameEngine} from '../src/game-production-runtime.js';
import {WORLDS,WEAPONS,ENEMIES,LEVEL_SEEDS} from '../src/content.js';
import {ECOSYSTEM_CAMPAIGNS_V131,buildEcosystemMissionV131} from '../src/ecosystem-missions-v131.js';
import {createDrawMeasureContextV188} from '../src/creature-scale-v188.js';
import {QUEEN_MOTHER_ART_IDS_V188 as IDS,QUEEN_MOTHER_ART_V188 as ART,
  QUEEN_MOTHER_FRAMES_V188 as FRAMES,QUEEN_MOTHER_ARMS_V188 as ARMS,
  queenMotherArtReadyV188,queenMotherSourceReadyV188,isQueenMotherArtOwnerV188,
  queenMotherPoseV188,queenMotherVisualBoundsV188,advanceQueenMotherSalvoV188
} from '../src/queen-mother-art-v188.js';

const paths=new Set(IDS.map(id=>ART[id].path));
const queenNotice='ADAPTATION ORIGINALE · REINE-MÈRE, GARDES ET CHŒURS ILLUSTRÉS';
const historicalNotice='ADAPTATION ORIGINALE · PERSONNAGES VECTORIELS PROVISOIRES · PLANCHES DÉDIÉES À PRODUIRE';
const artCalls=calls=>calls.filter(call=>call.kind==='image' && paths.has(call.path));
const close=(actual,expected,label='')=>assert.ok(Math.abs(actual-expected)<1e-7,`${label}: ${actual} != ${expected}`);
const body=actor=>({x:actor.x,y:actor.y,w:actor.w,h:actor.h,health:actor.health,maxHealth:actor.maxHealth,alive:actor.alive});
function sourceBytes(path) { return readFileSync(new URL(`..${path}`,import.meta.url)); }
function sourceSize(path) {
  try { const bytes=sourceBytes(path); return bytes.subarray(1,4).toString()==='PNG' ? [bytes.readUInt32BE(16),bytes.readUInt32BE(20)] : null; }
  catch { return null; }
}
function recorder() {
  const ctx=createDrawMeasureContextV188(),calls=[],stack=[];
  Object.assign(ctx,{globalAlpha:1,fillStyle:'#000000',strokeStyle:'#000000',lineWidth:1,font:'10px monospace',shadowColor:'',shadowBlur:0});
  const native={save:ctx.save,restore:ctx.restore,drawImage:ctx.drawImage};
  const stateKeys=['globalAlpha','fillStyle','strokeStyle','lineWidth','font','shadowColor','shadowBlur'];
  ctx.save=()=>{stack.push(Object.fromEntries(stateKeys.map(key=>[key,ctx[key]])));native.save();};
  ctx.restore=()=>{assert.ok(stack.length,'balanced Canvas state');native.restore();Object.assign(ctx,stack.pop());};
  const record=(kind,args,extra={})=>calls.push({kind,args,alpha:ctx.globalAlpha,fill:ctx.fillStyle,
    stroke:ctx.strokeStyle,lineWidth:ctx.lineWidth,matrix:ctx.getTransform(),...extra});
  ctx.drawImage=(image,...args)=>{record('image',args,{path:image.currentSrc||image.src});native.drawImage(image,...args);};
  for(const [name,kind] of Object.entries({beginPath:'begin',moveTo:'move',lineTo:'line',ellipse:'ellipse',fill:'fill',stroke:'stroke',fillRect:'rect',fillText:'text'}))
    ctx[name]=(...args)=>record(kind,args);
  return {ctx,calls,render(engine,actor){calls.length=ctx.draws.length=0;engine.drawEnemy(ctx,actor);
    assert.equal(stack.length,0);assert.deepEqual(ctx.getTransform(),{a:1,b:0,c:0,d:1,e:0,f:0});assert.equal(ctx.globalAlpha,1);
    return structuredClone(calls);}};
}
function point(call,sourceLocal) {
  const [,,sw,sh,dx,dy,dw,dh]=call.args,m=call.matrix;
  const x=dx+sourceLocal[0]*dw/sw,y=dy+sourceLocal[1]*dh/sh;
  return [m.a*x+m.c*y+m.e,m.b*x+m.d*y+m.f];
}
async function fixture(t,{operation='queen-mother-song',holdArt=false}={}) {
  const globals=['addEventListener','removeEventListener','dispatchEvent','document','Image','requestAnimationFrame','cancelAnimationFrame','location'];
  const saved=new Map(globals.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  const browser=host(),BaseImage=globalThis.Image,requested=[],delivered=[],events=[];
  globalThis.location={origin:'https://queen-mother.invalid'};
  globalThis.Image=class extends BaseImage {
    set src(value){if(!paths.has(value)){super.src=value;return;}this._src=value;this.complete=false;
      this.naturalWidth=this.naturalHeight=0;requested.push(value);delivered.push(this);if(!holdArt)this.finish();}
    get src(){return this._src;} get currentSrc(){return this._src;}
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
  return {engine,events,options,requested,delivered,drawing,get queen(){return engine.ecosystemActorV131('eco131-boss');},
    render(actor=engine.ecosystemActorV131('eco131-boss')){return drawing.render(engine,actor);},
    async reenter(){engine.start(options);await prepare(engine);},
    readyAll(){for(const id of IDS)engine.images.get(ART[id].imageKey).finish();}};
}
function damage(engine,actor,amount=999) {
  return engine.applyEnemyDamage(actor,amount,{owner:engine.player,kind:'rifle',x:actor.x-40,y:actor.y+20});
}
function unlock(engine) {
  for(let index=0;index<engine.ecosystemV131.targets.length;index++)damage(engine,engine.ecosystemActorV131(`eco131-target-${index}`));
}
function locateTarget(engine,queen) {
  Object.assign(engine.player,{x:queen.x-200,y:570-engine.player.h,vx:0,vy:0,grounded:true,inVehicle:false,ventTransit:null});
}
function finishInsertionGrace(engine) {
  // Advance real simulated mission time at insertion, without disabling the
  // native safety layer. Its outer updateEnemy may otherwise withhold a shot.
  tick(engine,4.05);assert.equal(engine.insertionGraceActiveV188(),false);
}
function acceptedSalvo(engine,queen) {
  assert.equal(engine.insertionGraceActiveV188(),false,'a retained salvo requires the native insertion grace to have ended');
  locateTarget(engine,queen);queen.attackClock=0;queen.windup=.84;
  const first=engine.hostileProjectiles.length;engine.updateEnemy(queen,.02);
  assert.ok(engine.hostileProjectiles.length>first,JSON.stringify({message:'the real native producer accepted a salvo',
    queen:{...body(queen),clock:queen.clock,attackClock:queen.attackClock,windup:queen.windup,
      dormant:queen.dormant,stunClock:queen.stunClock,supportStunV72:queen.supportStunV72,role:queen.ecosystemActorV131.role},
    player:{x:engine.player.x,y:engine.player.y,w:engine.player.w,h:engine.player.h,alive:engine.player.alive,
      downed:engine.player.downed,inVehicle:engine.player.inVehicle,ventTransit:engine.player.ventTransit},
    targets:engine.ecosystemV131.targets,phase:engine.ecosystemV131.bossPhase,
    paused:engine.paused,running:engine.running,missionState:engine.mission.state,
    lineClear:engine.ecosystemLineClearV131(queen,engine.player)}));
  return engine.hostileProjectiles.slice(first);
}
function requirePoseImages(session,pose) {
  assert.equal(queenMotherPoseV188(session.engine,session.queen),pose);
  const draws=artCalls(session.render());assert.equal(draws.length,5);
  assert.deepEqual(draws.map(call=>call.path),[ART.arms.path,ART.arms.path,ART[FRAMES[pose].sourceId].path,ART.arms.path,ART.arms.path]);
  assert.deepEqual(draws[2].args.slice(0,4),FRAMES[pose].rect);return draws;
}

test('Queen Mother: approved PNGs, current owner and physical body retain their separate identities',async t=>{
  const s=await fixture(t),e=s.engine,q=s.queen;
  assert.deepEqual([q.x,q.y,q.w,q.h,q.maxHealth],[3780,360,170,210,600]);
  assert.equal(isQueenMotherArtOwnerV188(e,q),true);assert.equal(queenMotherArtReadyV188(e.images),true);
  assert.equal(s.requested.length,3);
  for(const id of IDS){const bytes=sourceBytes(ART[id].path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),ART[id].sha256);
    assert.deepEqual(sourceSize(ART[id].path),[ART[id].width,ART[id].height]);}
  for(const other of e.enemies.filter(actor=>actor!==q))assert.equal(isQueenMotherArtOwnerV188(e,other),false);
  const detached={...q};assert.equal(isQueenMotherArtOwnerV188(e,detached),false);assert.equal(artCalls(s.render(detached)).length,0);
  const original=q.ecosystemActorV131.role;q.ecosystemActorV131.role='guard';assert.equal(isQueenMotherArtOwnerV188(e,q),false);q.ecosystemActorV131.role=original;
  const before=body(q);s.render();assert.deepEqual(body(q),before);
  assert.ok(!e.getVisibleEnemyAtlasSheetsV65([q]).some(sheet=>paths.has(sheet.path)),'ecosystem remains outside generic atlas admission');
  s.drawing.calls.length=0;e.drawHud(s.drawing.ctx);
  const notices=s.drawing.calls.filter(call=>call.kind==='text').map(call=>call.args[0]);
  assert.ok(notices.includes(queenNotice));assert.ok(!notices.includes(historicalNotice));
});

test('Queen Mother: all seven incomplete masks and unsafe sources keep the complete native vector fallback',async t=>{
  const s=await fixture(t,{holdArt:true}),e=s.engine,q=s.queen;q.windup=.3;
  const fallback=s.render(),before=JSON.stringify(e.captureResumeState());assert.equal(artCalls(fallback).length,0);
  for(let mask=0;mask<8;mask++){
    IDS.forEach((id,index)=>e.images.get(ART[id].imageKey).finish(!(mask&(1<<index))));
    const calls=s.render();assert.equal(artCalls(calls).length,mask===7?5:0);
    if(mask!==7)assert.deepEqual(calls,fallback,`availability mask ${mask}`);
  }
  const image=e.images.get(ART.rest.imageKey),path=image.src;
  for(const invalid of ['https://foreign.invalid'+path,path+'?v=1',path+'#v1','data:image/png;base64,x',path.replace('/v188/','/other/')]){
    image._src=invalid;assert.equal(queenMotherSourceReadyV188(image,'rest'),false);assert.deepEqual(s.render(),fallback);
  }
  image._src=path;image.naturalHeight--;assert.deepEqual(s.render(),fallback);image.naturalHeight++;
  assert.equal(JSON.stringify(e.captureResumeState()),before,'draws/image delivery never change native saved state');
});

test('Queen Mother: entry owns sharing and retries; obsolete image callbacks cannot replace a current source or replay a shot',async t=>{
  const s=await fixture(t,{holdArt:true}),e=s.engine;
  const oldQueen=s.queen,first=IDS.map(id=>e.images.get(ART[id].imageKey));
  await s.reenter();assert.equal(s.requested.length,3);assert.equal(isQueenMotherArtOwnerV188(e,oldQueen),false);
  first[1].finish(true);await s.reenter();assert.equal(s.requested.length,4);
  const replacement=e.images.get(ART.action.imageKey);assert.notEqual(replacement,first[1]);
  const before=JSON.stringify(e.captureResumeState()),eventCount=s.events.length;
  first[1].finish();assert.equal(e.images.get(ART.action.imageKey),replacement);assert.equal(queenMotherArtReadyV188(e.images),false);
  s.readyAll();assert.equal(queenMotherArtReadyV188(e.images),true);assert.equal(queenMotherPoseV188(e,s.queen),'rest-0');
  assert.equal(JSON.stringify(e.captureResumeState()),before);assert.equal(s.events.length,eventCount);
  const count=s.requested.length;for(let i=0;i<5;i++)s.render();assert.equal(s.requested.length,count,'draw does not request images');
  await s.reenter();assert.equal(s.requested.length,count,'ready sources are shared');
});

test('Queen Mother: Hive World and Pangaea keep their own eco131-boss and request no royal kit',async t=>{
  for(const operation of ['hive-world','pangaea-second-extinction'])await t.test(operation,async t=>{
    const s=await fixture(t,{operation});assert.equal(s.queen.id,'eco131-boss');
    assert.equal(isQueenMotherArtOwnerV188(s.engine,s.queen),false);assert.equal(s.requested.length,0);assert.equal(artCalls(s.render()).length,0);
    s.drawing.calls.length=0;s.engine.drawHud(s.drawing.ctx);
    const notices=s.drawing.calls.filter(call=>call.kind==='text').map(call=>call.args[0]);
    assert.ok(notices.includes(historicalNotice));assert.ok(!notices.includes(queenNotice));
  });
});

test('Queen Mother: late images reveal the current salvo age without replaying an expired emission',async t=>{
  const s=await fixture(t,{holdArt:true}),e=s.engine,q=s.queen;finishInsertionGrace(e);unlock(e);acceptedSalvo(e,q);
  assert.equal(queenMotherPoseV188(e,q),'emission');assert.equal(artCalls(s.render()).length,0);
  e.updateEnemy(q,.1);e.updateEnemy(q,.1);const before=JSON.stringify(e.captureResumeState()),count=s.events.length;
  s.readyAll();requirePoseImages(s,'recovery');assert.equal(JSON.stringify(e.captureResumeState()),before);assert.equal(s.events.length,count);
  e.updateEnemy(q,.1);e.updateEnemy(q,.1);s.readyAll();assert.notEqual(queenMotherPoseV188(e,q),'emission');
});

test('Queen Mother: body poses use reviewed cells, one scale, four attached limbs and unmirrored native labels',async t=>{
  const s=await fixture(t),e=s.engine,q=s.queen,dimensions=[q.w,q.h],seen=new Set();
  const fixtures=[
    ['rest-0',{clock:0}],['rest-1',{clock:.6}],['anticipation-early',{windup:.2}],
    ['anticipation-advanced',{windup:.7}],['recovery',{hurtClock:.24}],
    ['collapse',{alive:false,deathClock:1.2}],['neutralized',{alive:false,deathClock:.8}]
  ];
  assert.equal(new Set(Object.values(FRAMES).map(frame=>frame.referenceHeight)).size,1,'no per-cell resizing');
  for(const reducedMotion of [false,true])for(const facing of [-1,1])for(const [requested,patch] of fixtures){
    Object.assign(q,{alive:true,health:360,clock:0,windup:0,hurtClock:0,deathClock:0,actionPhase:0,facing},patch);
    e.accessibilityRuntime=Object.freeze({...e.accessibilityRuntime,reducedMotion});
    const expected=reducedMotion&&requested==='rest-1'?'rest-0':requested;
    const before=body(q),draws=requirePoseImages(s,expected),frame=FRAMES[expected];seen.add(expected);
    assert.deepEqual(body(q),before);assert.deepEqual([q.w,q.h],dimensions);
    const foot=point(draws[2],frame.pivot);close(foot[0],q.x+q.w/2);close(foot[1],q.y+q.h);
    close(Math.abs(draws[2].matrix.a),210/593);close(draws[2].matrix.d,210/593);
    for(const [index,id] of [[0,'large-far'],[1,'small-far'],[3,'large-near'],[4,'small-near']]){
      const call=draws[index],part=ARMS[id],pivot=point(call,part.pivot),placement=frame.arms[id];
      assert.deepEqual(call.args.slice(0,4),part.rect);close(Math.hypot(call.matrix.a,call.matrix.b),part.scale);
      close(pivot[0],q.x+q.w/2+facing*(placement.attach[0]-frame.pivot[0])*210/593);
      close(pivot[1],q.y+q.h+(placement.attach[1]-frame.pivot[1])*210/593);
    }
    const bounds=queenMotherVisualBoundsV188(q);
    for(const call of draws)for(const corner of [[0,0],[627,0],[0,627],[627,627]]){
      const [x,y]=point(call,corner);assert.ok(x>=bounds.x-1e-7&&x<=bounds.x+bounds.w+1e-7&&y>=bounds.y-1e-7&&y<=bounds.y+bounds.h+1e-7);
    }
    const calls=s.drawing.calls,name=calls.find(call=>call.kind==='text'&&call.args[0]===q.name);
    assert.deepEqual(name.args,[q.name,q.x-10,q.y-15]);assert.deepEqual(name.matrix,{a:1,b:0,c:0,d:1,e:0,f:0});assert.equal(name.alpha,1);
    const bars=calls.filter(call=>call.kind==='rect');assert.equal(bars.length,q.alive?2:0);
    if(q.alive){assert.deepEqual(bars[0].args,[q.x,q.y-8,170,4]);assert.deepEqual(bars[1].args,[q.x,q.y-8,102,4]);}
    const warning=calls.filter(call=>call.kind==='stroke'&&call.stroke==='#ffcb68');assert.equal(warning.length,q.windup>0?8:0);
    if(q.windup>0){assert.ok(calls.indexOf(warning[0])>calls.findLastIndex(call=>call.kind==='image'));
      assert.ok(warning.every(call=>call.lineWidth===4));
      const ellipse=calls.find(call=>call.kind==='ellipse').args;
      [0,-100.8,79.9,81.9,-.1,0,Math.PI*2].forEach((value,index)=>close(ellipse[index],value));}
    assert.ok(draws.every(call=>call.alpha===(q.alive?1:.3)),'death alpha is applied per component, not promised as group opacity');
  }
  assert.equal(seen.size,7);
});

test('Queen Mother: emission follows actual one/three-projectile salvos, never insertion grace, a phase reset or a no-op producer',async t=>{
  const s=await fixture(t),e=s.engine,q=s.queen;
  const insertion={x:e.player.x,y:e.player.y,vx:e.player.vx,vy:e.player.vy,grounded:e.player.grounded};
  unlock(e);locateTarget(e,q);q.attackClock=0;q.windup=.84;
  const held=e.insertionGraceHeldV188;assert.equal(e.insertionGraceActiveV188(),true);
  e.updateEnemy(q,.02);assert.equal(e.hostileProjectiles.length,0);
  assert.equal(e.insertionGraceHeldV188,held+1);close(q.attackClock,2.15);assert.equal(q.windup,0);
  assert.notEqual(queenMotherPoseV188(e,q),'emission','the outer safety layer withheld this real producer call');
  Object.assign(e.player,insertion);finishInsertionGrace(e);locateTarget(e,q);q.attackClock=0;
  for(let i=0;i<8;i++){e.updateEnemy(q,.1);assert.equal(e.hostileProjectiles.length,0);}
  const keys=Object.keys(q).sort();e.updateEnemy(q,.1);assert.equal(e.hostileProjectiles.length,1);assert.deepEqual(Object.keys(q).sort(),keys);
  const projectile=e.hostileProjectiles[0];assert.deepEqual([projectile.x,projectile.y,projectile.sourceX,projectile.sourceY],[3865,460.8,3865,460.8]);
  assert.deepEqual([projectile.w,projectile.h,projectile.life,projectile.damage,projectile.ownerId],[12,10,3,19,q.id]);close(Math.hypot(projectile.vx,projectile.vy),340);
  close(q.attackClock,2.15);const before=JSON.stringify(e.captureResumeState()),count=s.events.length;
  for(const reducedMotion of [false,true])for(const facing of [-1,1]){
    e.accessibilityRuntime=Object.freeze({...e.accessibilityRuntime,reducedMotion});q.facing=facing;requirePoseImages(s,'emission');}
  q.facing=projectile.vx<0?-1:1;assert.equal(JSON.stringify(e.captureResumeState()),before);assert.equal(s.events.length,count);
  e.updateEnemy(q,.1);requirePoseImages(s,'emission');e.updateEnemy(q,.04);requirePoseImages(s,'recovery');
  e.updateEnemy(q,.1);e.updateEnemy(q,.1);assert.notEqual(queenMotherPoseV188(e,q),'emission');
  const oldCount=e.hostileProjectiles.length;damage(e,q);assert.equal(e.ecosystemV131.bossPhase,2);assert.equal(q.attackClock,1);
  assert.equal(e.hostileProjectiles.length,oldCount);assert.notEqual(queenMotherPoseV188(e,q),'emission');
  damage(e,q);assert.equal(e.ecosystemV131.bossPhase,3);q.hurtClock=0;
  const triple=acceptedSalvo(e,q);assert.equal(triple.length,3);assert.ok(triple.every(p=>p.damage===23));requirePoseImages(s,'emission');
  e.updateEnemy(q,.1);e.updateEnemy(q,.1);e.updateEnemy(q,.1);e.updateEnemy(q,.1);
  const native=e.ecosystemProjectileV131;e.ecosystemProjectileV131=()=>{};
  q.attackClock=0;q.windup=.84;const unchanged=e.hostileProjectiles.length;e.updateEnemy(q,.02);e.ecosystemProjectileV131=native;
  assert.equal(e.hostileProjectiles.length,unchanged);assert.notEqual(queenMotherPoseV188(e,q),'emission','accepted cadence without a projectile is not a visual shot');
});

test('Queen Mother: pause, zero delta, clock wrap and early AI returns age the cue without a later 60-second replay',async t=>{
  const s=await fixture(t),e=s.engine,q=s.queen;finishInsertionGrace(e);unlock(e);q.clock=59.94;acceptedSalvo(e,q);requirePoseImages(s,'emission');
  const frozen=s.render(),saved=JSON.stringify(e.captureResumeState());e.updateEnemy(q,0);assert.deepEqual(s.render(),frozen);
  assert.equal(JSON.stringify(e.captureResumeState()),saved,'zero step does not mutate the cue or native state');
  e.paused=true;tick(e,.4);assert.deepEqual(s.render(),frozen);e.paused=false;
  e.enemyAtlasLoadingPausedV65=true;tick(e,.4);assert.deepEqual(s.render(),frozen);e.enemyAtlasLoadingPausedV65=false;
  e.updateEnemy(q,.06);assert.ok(q.clock<.1);requirePoseImages(s,'emission');
  q.stunClock=1;e.updateEnemy(q,.1);requirePoseImages(s,'recovery');
  e.camera.x=100000;e.updateEnemy(q,.1);e.player.alive=false;e.coopEnabled=false;e.squadActors=[];q.stunClock=0;
  e.updateEnemy(q,.1);assert.ok(!['emission','recovery'].includes(queenMotherPoseV188(e,q)));
  for(let i=0;i<610;i++)e.updateEnemy(q,.1);
  assert.ok(!['emission','recovery'].includes(queenMotherPoseV188(e,q)),'expired weak cue never revives after modulo wrap');
  e.player.alive=true;acceptedSalvo(e,q);advanceQueenMotherSalvoV188(e,q,-.1);assert.notEqual(queenMotherPoseV188(e,q),'emission');
  acceptedSalvo(e,q);advanceQueenMotherSalvoV188(e,q,NaN);assert.notEqual(queenMotherPoseV188(e,q),'emission');
  acceptedSalvo(e,q);q.clock=(q.clock+1)%60;advanceQueenMotherSalvoV188(e,q,0);assert.notEqual(queenMotherPoseV188(e,q),'emission','zero delta with a clock jump is rejected');
});

test('Queen Mother: real resume keeps native anticipation but no transient shot, rejects old ownership and preserves a refused restore',async t=>{
  const s=await fixture(t),e=s.engine;unlock(e);let q=s.queen;locateTarget(e,q);q.attackClock=0;
  for(let i=0;i<7;i++)e.updateEnemy(q,.1);const anticipating=e.captureResumeState();assert.equal(e.validateEcosystemResumeV131(anticipating).valid,true);
  const old=q;assert.equal(e.applyResumeState(anticipating).applied,true);q=s.queen;assert.notEqual(q,old);
  requirePoseImages(s,'anticipation-advanced');assert.equal(isQueenMotherArtOwnerV188(e,old),false);assert.equal(artCalls(s.render(old)).length,0);
  acceptedSalvo(e,q);const shot=e.captureResumeState(),nativeBody=body(q);assert.equal(e.validateEcosystemResumeV131(shot).valid,true);
  const malformed=structuredClone(shot);malformed.identity.campaignId='other';const requested=s.requested.length;
  assert.equal(e.applyResumeState(malformed).applied,false);assert.equal(s.queen,q);requirePoseImages(s,'emission');
  assert.deepEqual(e.captureResumeState(),shot);assert.equal(s.requested.length,requested);
  assert.equal(e.applyResumeState(shot).applied,true);const restored=s.queen;assert.notEqual(restored,q);
  close(restored.x,nativeBody.x);close(restored.y,nativeBody.y);assert.deepEqual([restored.w,restored.h,restored.health],[170,210,nativeBody.health]);
  assert.notEqual(queenMotherPoseV188(e,restored),'emission');assert.equal(e.hostileProjectiles.length,0);
  assert.equal(isQueenMotherArtOwnerV188(e,q),false);assert.equal(artCalls(s.render(q)).length,0);
  e.failMission('fixture');assert.equal(e.restartFromCheckpoint(),true);assert.equal(isQueenMotherArtOwnerV188(e,restored),false);
  assert.notEqual(queenMotherPoseV188(e,s.queen),'emission');
});

test('Queen Mother: four native phases end in the 1.2-second corpse, component alpha .3 and residual native warning',async t=>{
  const s=await fixture(t),e=s.engine,q=s.queen;finishInsertionGrace(e);unlock(e);acceptedSalvo(e,q);
  for(let phase=2;phase<=4;phase++){damage(e,q);assert.equal(e.ecosystemV131.bossPhase,phase);}
  q.windup=.7;damage(e,q);assert.equal(q.alive,false);assert.equal(q.deathClock,1.2);assert.equal(q.windup,.7);
  const physical=body(q),clock=q.clock;requirePoseImages(s,'collapse');
  let calls=s.drawing.calls;assert.equal(calls.filter(call=>call.kind==='stroke'&&call.stroke==='#ffcb68').length,8);
  assert.equal(calls.filter(call=>call.kind==='rect').length,0);assert.equal(calls.find(call=>call.kind==='text').alpha,1);
  for(const actor of e.enemies.filter(actor=>actor.alive))damage(e,actor);
  e.paused=true;tick(e,.4);assert.equal(q.deathClock,1.2);e.paused=false;
  tick(e,.3);requirePoseImages(s,'neutralized');assert.equal(q.clock,clock);
  assert.ok(artCalls(s.drawing.calls).every(call=>call.alpha===.3));assert.deepEqual(body(q),physical);
  tick(e,1);assert.equal(q.deathClock,0);assert.equal(e.getVisibleEnemiesV65().includes(q),false);
});

test('Queen Mother: conservative culling keeps full-cell edges, original order and exact fallback admission',async t=>{
  const s=await fixture(t),e=s.engine,q=s.queen,bounds=queenMotherVisualBoundsV188(q),key=ART.arms.imageKey,image=e.images.get(key);
  const cameras=[{x:bounds.x-1280-64+1,y:0},{x:bounds.x+bounds.w+64-1,y:0},
    {x:q.x-500,y:bounds.y-720-64+1},{x:q.x-500,y:bounds.y+bounds.h+64-1}];
  let extensions=0;
  for(const camera of cameras){Object.assign(e.camera,camera);e.images.delete(key);const fallback=e.getVisibleEnemiesV65();
    e.images.set(key,image);const visible=e.getVisibleEnemiesV65();assert.equal(visible.includes(q),true);
    if(!fallback.includes(q))extensions++;assert.deepEqual(visible.filter(actor=>actor!==q),fallback.filter(actor=>actor!==q));
    assert.deepEqual(visible,e.enemies.filter(actor=>visible.includes(actor)));}
  assert.ok(extensions>0,'at least one full-cell edge needs admission beyond the native body');
  e.camera.x=q.x+10000;e.camera.y=0;assert.equal(e.getVisibleEnemiesV65().includes(q),false);
  e.camera.x=q.x-500;q.dormant=true;assert.equal(e.getVisibleEnemiesV65().includes(q),false);q.dormant=false;
  q.alive=false;q.deathClock=0;assert.equal(e.getVisibleEnemiesV65().includes(q),false);
});
