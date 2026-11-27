import {assertLegacyEarthV10} from './legacy-contract-v10.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {EARTH_DATA as D} from '../src/alien-earth-data.js';
import {EarthEngine,newState,sanitizeSave,ROOM_BY_ID,ENEMY_SPAWNS,blocked,visible,findPath,SAVE_KEY} from '../src/alien-earth-core.js';
import {containedIdsV5} from '../src/alien-earth-containment-v5.js';
import {persistEarthProgress} from '../src/alien-earth-storage-v2.js';
const make=id=>{const s=newState(),r=ROOM_BY_ID[id];s.room=id;s.chapter=D.chapters.findIndex(c=>c.id===r.chapter);s.completed=D.chapters.slice(0,s.chapter).flatMap(c=>c.goals);s.player.hp=D.characters.find(c=>c.id===D.chapters[s.chapter].pov).health;s.difficulty='story';return new EarthEngine(s);};
const at=(e,p)=>{e.player.x=p.x;e.player.z=p.z;};
const step=(e,t,input={})=>{for(let elapsed=0;elapsed<t;){const dt=Math.min(.025,t-elapsed);e.update(dt,input);elapsed+=dt;}};
function openPad(e){const pad=e.localPads()[0];assert.ok(pad);at(e,pad);assert.equal(e.interact()?.id,pad.id);assert.equal(e.pending?.type,'containment-v5');return pad;}
function armFixture(room='R36',preset='crawler'){
 const e=make(room),pad=openPad(e);assert.ok(e.queueContainment('arm',preset));
 step(e,2.05,{interact:true});assert.equal(e.podState(pad.id).status,'armed');return {e,pad};
}
function capturedFixture(room='R36',preset='crawler'){
 const {e,pad}=armFixture(room,preset),enemy=e.enemies.find(e=>D.containmentPresets.find(p=>p.id===preset).kinds.includes(e.kind));assert.ok(enemy);
 // Targeted state fixture: only these tests position a specimen. Full campaigns do not use this helper.
 Object.assign(enemy,{x:pad.x,z:pad.z,stun:5,mode:'stunned'});at(e,{x:120,z:125});step(e,.81);
 assert.equal(e.podState(pad.id).status,'sealed');return {e,pad,id:enemy.id};
}
function queue(e,action,value){openPad(e);assert.ok(e.queueContainment(action,value));}

test('V10 — héritage mécanique conservé, corrections de fidélité explicitement autorisées',()=>{assertLegacyEarthV10();});
test('16 plates, two per chapter; no new enemies or obligatory goals in the tutorial',()=>{
 assert.equal(D.containmentPads.length,16);for(const c of D.chapters){assert.equal(D.containmentPads.filter(p=>ROOM_BY_ID[p.room].chapter===c.id).length,2);assert.equal(c.goals.length,4);}
 assert.equal(D.rooms.filter(r=>r.chapter==='C01').flatMap(r=>r.enemies).length,0);
});
for(const pad of D.containmentPads)test(pad.id+' accessible and not shadowing legacy interactions',()=>{
 const e=make(pad.room);assert.ok(!blocked(e.room,pad.x,pad.z));assert.ok(findPath(e.room,e.room.spawn,pad).length);
 at(e,pad);assert.equal(e.nearestInteraction()?.id,pad.id);
 for(const i of [e.room.task,e.room.archive,...e.room.portals,...e.room.interactables]){at(e,i);assert.equal(e.nearestInteraction()?.id,i.id);}
 assert.equal(e.room.props.find(p=>p.padId===pad.id).solid,false);
});
test('new game and all old schema migrations provide two capped cartridges',()=>{assert.equal(newState().inventory.capsules,2);for(const schema of [1,2,3,4]){const s=make('R02').snapshot();s.schema=schema;s.inventory.capsules=99;assert.equal(sanitizeSave(s).inventory.capsules,2);}});
test('V4 resource and device state migrates without losing parts, supplies, circuits or settings',()=>{
 const s=make('R02').snapshot();s.schema=4;s.parts=17;s.inventory.care=7;s.inventory.decoys=8;s.circuits.C01='dark';s.presentation='CLASSIC';s.salvaged=['R34-v4-scrap'];const clean=sanitizeSave(s);assert.equal(clean.schema,11);for(const k of ['parts','circuits','presentation','salvaged'])assert.deepEqual(clean[k],s[k]);assert.equal(clean.inventory.care,7);assert.equal(clean.inventory.decoys,8);
});
test('inert preparation waits for E, spends nothing until the final frame',()=>{
 const e=make('R34'),p=openPad(e);e.queueContainment('arm','crawler');step(e,1);assert.equal(e.serviceAction.time,0);step(e,1.8,{interact:true});assert.equal(e.state.inventory.capsules,2);assert.equal(e.podState(p.id).status,'empty');step(e,.3,{interact:true});assert.equal(e.state.inventory.capsules,1);assert.equal(e.podState(p.id).status,'armed');
});
for(const trigger of ['release','movement','damage','pause'])test('arming canceled by '+trigger+' consumes no cartridge',()=>{
 const e=make('R34');openPad(e);e.queueContainment('arm','crawler');step(e,.5,{interact:true});
 if(trigger==='release')step(e,.1);if(trigger==='movement')step(e,.1,{x:-1,interact:true});if(trigger==='damage'){e.iframe=0;e.damage(1);}if(trigger==='pause')e.cancelInteraction();
 step(e,2.1,{interact:true});assert.equal(e.state.inventory.capsules,2);assert.equal(e.serviceAction,null);assert.equal(Object.keys(e.state.containment.pads).length,0);
});
test('calibration consumes no resource, grants no creature or goal and is recorded once',()=>{
 const e=make('R34'),before=e.state.completed.length;for(let n=0;n<2;n++){queue(e,'calibrate');step(e,1.6,{interact:true});}assert.equal(e.state.inventory.capsules,2);assert.equal(e.state.completed.length,before);assert.equal(e.enemies.length,0);assert.equal(e.state.containment.calibrated.length,1);assert.equal(Object.keys(e.state.containment.records).length,0);
});
test('remote station and forged preset cannot arm a device',()=>{
 const e=make('R34');openPad(e);assert.equal(e.queueContainment('arm','__proto__'),false);at(e,{x:120,z:125});assert.equal(e.queueContainment('arm','crawler'),false);
});
test('carrying a patient blocks opening a containment panel and tools',()=>{
 const e=make('R38'),p=e.localPads()[0],d=D.survivors.find(f=>f.id==='tao');e.state.completed.push(d.task);e.state.survivors.tao={id:'tao',room:e.room.id,x:p.x,z:p.z,hp:0,status:'down'};at(e,p);e.state.carryId='tao';assert.equal(e.interact(),null);assert.equal(e.pending,null);
});
for(const [room,preset,kind] of [['R36','crawler','facehugger'],['R05','crawler','tick'],['R38','flyer','fly']])test(kind+' captured as the same identity with no remaining active AI',()=>{
 const {e,pad,id}=capturedFixture(room,preset);assert.equal(e.enemies.filter(n=>n.id===id).length,0);assert.equal(e.state.enemyRooms[id],room);assert.equal(e.state.containment.records[id].kind,kind);assert.equal(containedIdsV5(e.state).has(id),true);assert.equal(e.podState(pad.id).sample,id);assert.equal(e.snapshot().world[room].enemies.filter(n=>n.id===id).length,1);
});
for(const kind of ['xeno_maginot','xeno_neverland','eye_host','eye_caged','orchid'])test(kind+' incompatible with both presets',()=>{
 assert.ok(D.containmentPresets.every(p=>!p.kinds.includes(kind)));
 const {e,pad}=armFixture();e.enemies=[{...e.enemies[0],kind,x:pad.x,z:pad.z,stun:5}];at(e,{x:120,z:125});step(e,1);assert.equal(e.podState(pad.id).status,'armed');
});
test('wrong preset never captures a crawler',()=>{
 const {e,pad}=armFixture('R36','flyer');Object.assign(e.enemies[0],{x:pad.x,z:pad.z,stun:5});at(e,{x:120,z:125});step(e,1);assert.equal(e.podState(pad.id).status,'armed');
});
test('depth separation is physical, not merely a visual scale',()=>{
 const {e,pad}=armFixture();Object.assign(e.enemies[0],{x:pad.x,z:pad.z-80,stun:5});at(e,{x:120,z:125});step(e,1);assert.equal(e.podState(pad.id).status,'armed');
});
test('leaving the trigger resets closure progress',()=>{
 const {e,pad}=armFixture(),n=e.enemies[0];Object.assign(n,{x:pad.x,z:pad.z,stun:5});at(e,{x:120,z:125});step(e,.5);n.x=pad.x+90;step(e,.1);n.x=pad.x;step(e,.5);assert.equal(e.podState(pad.id).status,'armed');step(e,.4);assert.equal(e.podState(pad.id).status,'sealed');
});
test('natural local lure routes a specimen onto the plate without repositioning its body',()=>{
 const {e,pad}=armFixture();at(e,{x:400,z:125});for(let i=0;i<600&&e.podState(pad.id).status==='armed';i++)e.update(.04,{crouch:true});assert.equal(e.podState(pad.id).status,'sealed');assert.equal(e.state.containment.records['EN-36'].kind,'facehugger');
});
test('capture and release preserve pursuit identity and clean pending travel',()=>{
 const {e,pad,id}=capturedFixture();e.state.pursuits=[];assert.equal(e.state.enemyRooms[id],'R36');e.releaseSpecimen(pad.id);assert.equal(e.enemies.filter(n=>n.id===id).length,1);assert.equal(e.enemies.find(n=>n.id===id).arrivalGrace,2);assert.equal(e.state.containment.records[id].lastStatus,'released');assert.equal(e.podState(pad.id).status,'spent');assert.equal(e.state.inventory.capsules,1);
});
test('safe grace prevents a released specimen striking on the first frame',()=>{const {e,pad}=capturedFixture();at(e,pad);e.releaseSpecimen(pad.id);e.iframe=0;const hp=e.player.hp;step(e,1);assert.equal(e.player.hp,hp);assert.ok(e.enemies[0].arrivalGrace>0);});
test('study is exposed, delayed, permanent and does not multiply per identity',()=>{
 const {e,pad,id}=capturedFixture();queue(e,'study');step(e,2.7,{interact:true});assert.equal(e.state.containment.records[id].studied,false);step(e,.4,{interact:true});assert.equal(e.state.containment.records[id].studied,true);assert.equal(e.state.containment.stats.studies,1);assert.ok(e.state.research.includes('facehugger'));
 e.releaseSpecimen(pad.id);openPad(e);e.queueContainment('arm','crawler');e.enemies[0].stun=6;step(e,2.1,{interact:true});step(e,1);assert.equal(e.podState(pad.id).status,'sealed');openPad(e);assert.equal(e.queueContainment('study'),false);assert.equal(e.state.containment.stats.studies,1);assert.equal(Object.keys(e.state.containment.records).length,1);
});
test('untriggered dismantling returns exactly one cartridge',()=>{
 const {e,pad}=armFixture('R34');queue(e,'recover');step(e,1.1,{interact:true});assert.equal(e.podState(pad.id).status,'empty');assert.equal(e.state.inventory.capsules,2);openPad(e);assert.equal(e.queueContainment('recover'),false);assert.equal(e.state.inventory.capsules,2);
});
test('full stock prevents refunding into inventory overflow',()=>{const {e}=armFixture('R34');e.state.inventory.capsules=4;openPad(e);assert.equal(e.queueContainment('recover'),false);});
test('armed battery expires without a refund even in another room',()=>{
 const {e,pad}=armFixture('R34');e.enter('R02');step(e,46);assert.equal(e.podState(pad.id).status,'spent');assert.equal(e.state.inventory.capsules,1);
});
test('sealed specimen stops attacks, pursuit and companion pressure, but preexisting acid remains',()=>{
 const {e,pad,id}=capturedFixture();at(e,pad);e.hazards.push({x:pad.x,z:pad.z,radius:55,ttl:4});e.iframe=0;const hp=e.player.hp;step(e,.1);assert.ok(e.player.hp<hp);assert.equal(e.enemies.length,0);assert.equal(e.state.enemyRooms[id],e.room.id);
});
test('snapshot returns a single captured identity, does not restore partial closure or gesture',()=>{
 const {e,pad,id}=capturedFixture();queue(e,'study');step(e,.8,{interact:true});const n=new EarthEngine(e.snapshot());assert.equal(n.enemies.length,0);assert.equal(n.serviceAction,null);assert.equal(n.state.containment.records[id].studied,false);assert.equal(n.podState(pad.id).sample,id);assert.equal(n.snapshot().world[n.room.id].enemies.filter(e=>e.id===id).length,1);
});
test('partial capture closure is not completed by import',()=>{
 const {e,pad}=armFixture();Object.assign(e.enemies[0],{x:pad.x,z:pad.z,stun:5});at(e,{x:120,z:125});step(e,.6);const n=new EarthEngine(e.snapshot());step(n,.3);assert.equal(n.podState(pad.id).status,'armed');step(n,.6);assert.equal(n.podState(pad.id).status,'sealed');
});
test('checkpoint restart retains spent cartridge, sealed specimen and acquired study',()=>{
 const {e,pad,id}=capturedFixture();queue(e,'study');step(e,3.1,{interact:true});const stock=e.state.inventory.capsules;e.iframe=0;e.damage(1000);e.restartCheckpoint();assert.equal(e.state.inventory.capsules,stock);assert.equal(e.podState(pad.id).sample,id);assert.equal(e.enemies.length,0);assert.equal(e.state.containment.records[id].studied,true);
});
test('return to source room does not duplicate a sealed identity',()=>{
 const {e,pad,id}=capturedFixture();e.enter('R05');e.enter('R36');assert.equal(e.enemies.length,0);assert.equal(e.podState(pad.id).sample,id);assert.equal(e.snapshot().world.R36.enemies.filter(n=>n.id===id).length,1);
});
test('Xenomorph announces attack, damages and ruptures an occupied enclosure',()=>{
 const {e,pad,id}=capturedFixture();const def=ENEMY_SPAWNS['EN-07'];e.enemies.push({...def,x:pad.x-100,z:pad.z,stun:0,mode:'hunt',arrivalGrace:0,memory:6,alert:1});e.state.enemyRooms[def.id]=e.room.id;at(e,{x:120,z:125});
 step(e,.5);assert.equal(e.podState(pad.id).integrity,100);step(e,1);assert.ok(e.podState(pad.id).integrity<100);step(e,3);assert.equal(e.podState(pad.id).status,'broken');assert.equal(e.enemies.filter(n=>n.id===id).length,1);assert.equal(e.state.containment.records[id].lastStatus,'escaped');assert.equal(e.state.containment.stats.broken,1);
});
test('broken frame cannot be rearmed and rupture spends no additional cartridge',()=>{
 const {e,pad}=capturedFixture();const stock=e.state.inventory.capsules;e.releaseSpecimen(pad.id,true);openPad(e);assert.equal(e.queueContainment('arm','crawler'),false);assert.equal(e.state.inventory.capsules,stock);
});
test('offscreen occupied enclosures are inert, not an unclaimed global simulation',()=>{
 const {e,pad}=capturedFixture();e.enter('R05');step(e,3);assert.equal(e.podState(pad.id).status,'sealed');assert.equal(e.podState(pad.id).integrity,100);
});
test('incompatible / missing identity capture imports are rejected, not silently duplicated',()=>{
 const {e,pad}=capturedFixture();for(const id of ['unknown','EN-07','__proto__']){const s=e.snapshot();s.containment.pads[pad.id].sample=id;assert.throws(()=>sanitizeSave(s),/Confinement/);}
});
test('wrong location and duplicate claims are rejected',()=>{
 const {e,pad,id}=capturedFixture();let s=e.snapshot();s.enemyRooms[id]='R05';assert.throws(()=>sanitizeSave(s),/Confinement/);s=e.snapshot();s.containment.pads['CP-03']={...s.containment.pads[pad.id]};assert.throws(()=>sanitizeSave(s),/Confinement/);
});
test('acquisition record must match a sealed identity',()=>{
 const {e,pad,id}=capturedFixture();let s=e.snapshot();delete s.containment.records[id];assert.throws(()=>sanitizeSave(s),/registre/);s=e.snapshot();s.containment.records[id].pad='CP-03';assert.throws(()=>sanitizeSave(s),/registre/);
});
test('hostile numbers, prototype keys and excessive inventories do not poison state',()=>{
 const s=newState();s.inventory.capsules=Infinity;s.containment=JSON.parse('{"pads":{"__proto__":{"status":"armed","preset":"crawler"}},"records":{"__proto__":{}},"stats":{"captures":1e99}}');const clean=sanitizeSave(s);assert.equal(clean.inventory.capsules,0);assert.deepEqual(clean.containment.pads,{});assert.equal(clean.containment.stats.captures,999999);assert.equal({}.status,undefined);
});
test('V4 bytes are backed up before the successful V5 write',()=>{
 const raw=JSON.stringify({...newState(),schema:4}),data=new Map([[SAVE_KEY,raw]]),writes=[];const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{writes.push(k);data.set(k,v);}};
 persistEarthProgress(storage,sanitizeSave(raw),raw);assert.equal(data.get(SAVE_KEY+'.backup-v4'),raw);assert.deepEqual(writes,[SAVE_KEY+'.backup-v4',SAVE_KEY]);assert.equal(JSON.parse(data.get(SAVE_KEY)).schema,11);
});
test('backup failure preserves the V4 source, no pretend migration',()=>{
 const raw=JSON.stringify({...newState(),schema:4}),data=new Map([[SAVE_KEY,raw]]);const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(k.endsWith('backup-v4'))throw Error('quota');data.set(k,v);}};
 assert.throws(()=>persistEarthProgress(storage,sanitizeSave(raw),raw));assert.equal(data.get(SAVE_KEY),raw);
});
test('cartridge crafting uses four finite parts, three seconds and the four-item cap',()=>{
 const e=make('R34'),bench=e.room.interactables.find(i=>i.kind==='workbench');e.state.parts=12;e.state.inventory.capsules=3;at(e,bench);e.interact();assert.ok(e.queueService('craft','capsule'));step(e,3.1,{interact:true});assert.equal(e.state.parts,8);assert.equal(e.state.inventory.capsules,4);e.interact();assert.equal(e.queueService('craft','capsule'),false);assert.equal(e.state.parts,8);
});
for(const pad of D.containmentPads.filter(p=>ROOM_BY_ID[p.room].mode!=='SIDE'))test(pad.id+' has a visible CLASSIC lane change at the authored plate',()=>{
 const e=make(pad.room);e.setPresentation('CLASSIC');e.player.x=pad.x;e.player.z=125;
 assert.ok(e.room.passages.includes(pad.x));
 const target=pad.z<100?50:pad.z>150?200:125;
 if(target!==125)assert.ok(e.laneMove(target>125?1:-1));
 assert.equal(e.player.z,target);assert.equal(e.nearestInteraction()?.id,pad.id);
});
test('camera sees sealed specimen as contained, both locally and in a dormant room',()=>{
 const {e,pad,id}=capturedFixture('R09');e.state.circuits.C03='watch';
 const local=e.cameraFrame('C03-CAM1');assert.equal(local.points.filter(p=>p.type==='organism').length,1);assert.equal(local.points.find(p=>p.type==='organism').confined,true);
 e.enter('R10');const remote=e.cameraFrame('C03-CAM1');assert.deepEqual(remote.points,local.points);
 e.state.cameraFrames['C03-CAM1']=remote;const imported=new EarthEngine(e.snapshot());assert.equal(imported.state.cameraFrames['C03-CAM1'].points.find(p=>p.type==='organism').confined,true);
 assert.ok(!imported.enemies.some(v=>v.id===id));assert.equal(imported.podState(pad.id).status,'sealed');
});
test('door listening excludes a contained organism from its mobile-presence report',()=>{
 const {e}=capturedFixture('R09');e.enter('R10');const door=e.room.portals.find(d=>d.to==='R09');assert.ok(door);at(e,door);step(e,1.6,{listen:true});assert.equal(e.state.intel.R09.level,'quiet');
});
