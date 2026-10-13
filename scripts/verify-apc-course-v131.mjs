import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, ENEMIES, WEAPONS, LEVEL_SEEDS } from '../src/content.js';
import { buildApcConvoyLevelV121 } from '../src/apc-convoy-runtime-v121.js';
import { createApcCourseV131, validateApcCourseV131, APC_COURSE_LANES_V131 } from '../src/apc-course-v131.js';

async function fixture() {
  const events = new EventTarget();
  for (const name of ['addEventListener','removeEventListener','dispatchEvent']) globalThis[name]=events[name].bind(events);
  globalThis.document=Object.assign(new EventTarget(),{hidden:false,hasFocus:()=>true});
  globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  globalThis.Image=class extends EventTarget {
    complete=true; naturalWidth=0; naturalHeight=0;
    set src(value) { this._src=value;let valid=false;
      try {const bytes=readFileSync(new URL(`..${new URL(value,'http://qa.invalid').pathname}`,import.meta.url));
        if(bytes.subarray(1,4).toString()==='PNG'){this.naturalWidth=bytes.readUInt32BE(16);this.naturalHeight=bytes.readUInt32BE(20);valid=true;}}
      catch {}
      queueMicrotask(()=>{const event=new Event(valid?'load':'error');this.dispatchEvent(event);this[`on${event.type}`]?.(event);}); }
    get src(){return this._src;} async decode(){if(!this.naturalWidth)throw Error('Missing bitmap');}
  };
  const ctx=new Proxy({measureText:v=>({width:String(v).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},
    {get:(target,p)=>p in target?target[p]:()=>{}});
  const canvas=Object.assign(new EventTarget(),{width:1280,height:720,getContext:()=>ctx,
    focus(){document.activeElement=this;},getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})});
  const campaign=CAMPAIGNS.find(c=>c.id==='special-apc-convoy'), world=WORLDS.find(w=>w.id===campaign.worldId);
  const options={campaign,world,weapon:WEAPONS[0],enemyCatalog:ENEMIES,crew:[],equipment:[],seed:426};
  options.missionLevel=buildApcConvoyLevelV121({campaign,world,levelSeeds:LEVEL_SEEDS});
  const engine=new GameEngine(canvas);engine.start(options);
  for(let n=0;n<40;n++)await Promise.resolve();
  assert.equal(engine.enemyAtlasLoadingPausedV65,false);
  return {engine,options};
}
function tick(engine,seconds){for(let n=0;n<seconds*60;n++)engine.update(1/60);}

test('three lanes move the actual M577 continuously; targeting and impacts obey lane placement',async()=>{
  const {engine:e}=await fixture(); assert.deepEqual(e.getSnapshot().apcCourseV131.lanes,[406,478,550]);
  assert.equal(e.interact(),true);
  const initial=e.vehicle.y;e.keys.add('KeyW');e.update(1/60);e.keys.delete('KeyW');
  assert.ok(e.vehicle.y<initial && e.vehicle.y>406-e.vehicle.h,'One frame interpolates rather than teleporting.');
  tick(e,.4);assert.equal(e.vehicle.y,406-e.vehicle.h);assert.equal(e.player.y,e.vehicle.y+10);
  const target=e.apcConvoySpawnV121('enemy-006-runner');target.apcLaneV131=2;target.apcRoadYV131=550;target.x=e.vehicle.x-50;
  e.apcCourseStateV131.enemies.find(x=>x.id===target.id).lane=2;
  assert.equal(e.apcConvoyTargetV121(),null);const hull=e.vehicle.hull;
  tick(e,.8);assert.equal(e.vehicle.hull,hull,'A contact on another lane passes the hull without an impact.');
  assert.equal(e.apcCourseStateV131.totalDistance>0,true);assert.equal(e.apcCourseStateV131.score>0,true);
});
test('mode cannot change after departure; held lane input advances once and pause freezes the whole course',async()=>{
  const {engine:e}=await fixture();assert.equal(e.setApcCourseModeV131('endless'),true);e.interact();
  assert.equal(e.setApcCourseModeV131('finite'),false);
  e.keys.add('KeyS');tick(e,.8);assert.equal(e.apcCourseStateV131.lane,2);
  const s=structuredClone(e.apcCourseStateV131);e.togglePause();tick(e,1);
  assert.deepEqual(e.apcCourseStateV131,s);e.togglePause();e.keys.clear();
});
test('three-lane state round-trips and rejects foreign, non-finite or unmatched contact state atomically',async()=>{
  const {engine:e}=await fixture();e.interact();e.changeApcCourseLaneV131(-1);tick(e,.2);
  const saved=JSON.parse(JSON.stringify(e.captureResumeState()));
  e.changeApcCourseLaneV131(1);tick(e,.1);assert.equal(e.applyResumeState(saved).applied,true);
  assert.equal(e.apcCourseStateV131.lane,0);assert.equal(e.vehicle.y,e.apcCourseStateV131.roadY-e.vehicle.h);
  const before=JSON.stringify(e.captureResumeState());
  for(const key of ['lane','score','roadY']) {
    const wrong=structuredClone(saved);wrong.apcCourseV131[key]=key==='lane'?8:NaN;
    assert.equal(e.applyResumeState(wrong).applied,false);assert.equal(JSON.stringify(e.captureResumeState()),before,key);
  }
  const mismatch=structuredClone(saved);mismatch.apcCourseV131.enemies.push({id:'apcv121-63',lane:0});
  assert.equal(e.applyResumeState(mismatch).applied,false);assert.equal(JSON.stringify(e.captureResumeState()),before);
});
test('legacy convoy resumes migrate onto a real lane without changing their finite progress',async()=>{
  const {engine:e}=await fixture();e.interact();tick(e,.5);
  const raw=JSON.parse(JSON.stringify(e.captureResumeState()));delete raw.apcCourseV131;
  const result=e.applyResumeState(raw);assert.equal(result.applied,true);assert.equal(result.legacyCourseMigratedV131,true);
  assert.equal(e.apcCourseStateV131.lane,1);assert.equal(e.apcCourseStateV131.mode,'finite');
  assert.equal(e.apcCourseStateV131.totalDistance,e.apcConvoyV121.distance);
});
test('endless service requires real cleared barricades; dead actors recycle beyond the old lifetime cap',async()=>{
  const {engine:e}=await fixture();e.setApcCourseModeV131('endless');e.interact();
  assert.equal(e.nextApcCourseLapV131(),false);const ammo=e.vehicle.turretAmmo,reserve=e.vehicle.turretReserve;
  for(let n=0;n<100;n++) {const contact=e.apcConvoySpawnV121('enemy-006-runner');assert.ok(contact,n);
    e.defeatEnemy(contact);}
  assert.ok(e.enemies.length<=2);assert.ok(e.apcConvoyV121.enemies.length<=2);
  assert.equal(e.apcCourseStateV131.kills,100);assert.ok(e.apcCourseStateV131.score>=10000);
  assert.equal(e.vehicle.turretAmmo,ammo);assert.equal(e.vehicle.turretReserve,reserve);
  assert.equal(e.completeMission(),false,'A score does not grant mission success before the barricades and extraction.');
  const raw=e.captureResumeState();assert.equal(validateApcCourseV131(raw.apcCourseV131,raw.specialOperation.apcConvoyV121,raw.enemies).valid,true);
});
test('course sanitization rejects impossible finite laps and restores no held direction',()=>{
  const state=createApcCourseV131();state.previousKeys=['KeyW'];
  assert.deepEqual(validateApcCourseV131(state,{distance:0},[]).state.previousKeys,[]);
  state.lap=2;assert.equal(validateApcCourseV131(state,{distance:0},[]).valid,false);
  assert.equal(Object.isFrozen(APC_COURSE_LANES_V131),true);
});

test('a barricade contact changes lanes and recoils continuously, retaining both motions across a save',async()=>{
  const {engine:e}=await fixture();e.interact();
  // Isolate the physical contact at the first authored barricade. Victory and
  // the end-to-end course remain covered by the real keyboard integration test.
  e.apcConvoyV121.distance=800;e.syncApcConvoyWorldV121();e.apcCourseStateV131.totalDistance=800;
  const boss=e.apcConvoySpawnV121('enemy-009-crusher','crusher-1');e.apcConvoyV121.stageBossId=boss.id;
  boss.x=840;boss.apcConvoyAttackClockV121=0;e.apcCourseStateV131.lane=0;e.apcCourseStateV131.roadY=406;
  const initial=boss.y;e.updateEnemy(boss,1/60);
  assert.equal(boss.y,initial,'A warning selects the target lane before physical motion.');
  e.updateEnemy(boss,1/60);assert.ok(boss.y<initial && boss.y>406-boss.h);
  boss.apcRecoilV131=180;const x=boss.x;e.updateEnemy(boss,1/60);
  assert.ok(boss.x<x && boss.x>x-5,'Recoil retreats by speed times delta.');
  const raw=JSON.parse(JSON.stringify(e.captureResumeState()));const motion=raw.apcCourseV131.enemies.find(item=>item.id===boss.id);
  assert.ok(motion.recoil>0);assert.ok(motion.roadY>406 && motion.roadY<478);
  assert.equal(e.applyResumeState(raw).applied,true);
  const restored=e.enemies.find(item=>item.id===boss.id);assert.equal(restored.apcRoadYV131,motion.roadY);assert.equal(restored.apcRecoilV131,motion.recoil);
  e.paused=true;const frozen={x:restored.x,y:restored.y,recoil:restored.apcRecoilV131};e.updateEnemy(restored,.1);
  assert.deepEqual({x:restored.x,y:restored.y,recoil:restored.apcRecoilV131},frozen);
});
