import {assertLegacyEarthV10} from './legacy-contract-v10.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {EARTH_DATA as D} from '../src/alien-earth-data.js';
import {EarthEngine,newState,sanitizeSave,ROOM_BY_ID,roomWithState,blocked,visible,advanceBody,findPath,SAVE_KEY} from '../src/alien-earth-core.js';
import {ductFanStateV7,DUCT_SMALL_V7} from '../src/alien-earth-ducts-v7.js';
import {persistEarthProgress} from '../src/alien-earth-storage-v2.js';
const base=JSON.parse(fs.readFileSync(new URL('../data/base-v6.json',import.meta.url)));
const tick=(e,t,input={})=>{for(let i=0;i<Math.ceil(t/.02);i++)e.update(.02,input);};
function stateAt(id){const s=newState(),r=ROOM_BY_ID[id];s.room=id;s.visited=[id];s.chapter=D.chapters.findIndex(c=>c.id===r.chapter);s.completed=D.chapters.slice(0,s.chapter).flatMap(c=>c.goals);s.player.hp=D.characters.find(c=>c.id===D.chapters[s.chapter].pov).health;if(r.duct){s.completed.push(...r.portals[0].requires);s.ducts.opened.push(r.portals[0].hatchKey);}return s;}
const make=id=>new EarthEngine(stateAt(id));
const at=(e,p)=>Object.assign(e.player,{x:p.x,z:p.z});
const isolate=e=>{e.enemies=[];e.state.pursuits=[];return e;};
function hatchEngine(){const e=make('R02'),p=e.room.portals.find(p=>p.hatchKey);e.state.completed.push(...p.requires);at(e,p);return {e,p};}
function open(e,p){at(e,p);e.interact();tick(e,2.1,{interact:true});assert(e.hatchOpen(p));e.drain();}

test('V10 — héritage mécanique conservé, corrections de fidélité explicitement autorisées',()=>{assertLegacyEarthV10();});
test('eight connected authored ducts, 16 hatch links, 32 reciprocal ends, 7 small encounters',()=>{
 assert.equal(D.ductRoutes.length,8);const ends=D.rooms.flatMap(r=>r.portals.filter(p=>p.hatchKey));assert.equal(ends.length,32);assert.equal(new Set(ends.map(p=>p.hatchKey)).size,16);
 assert.equal(D.rooms.filter(r=>r.duct).flatMap(r=>r.enemies).length,7);
 assert(D.rooms.filter(r=>r.duct).flatMap(r=>r.enemies).every(e=>DUCT_SMALL_V7.has(e.kind)));
});
for(const route of D.ductRoutes){
 const id=route.room;
 test(id+' — both hatches are reciprocally located, old controls are not masked',()=>{
  const r=ROOM_BY_ID[id];for(const p of r.portals){const other=ROOM_BY_ID[p.to],back=other.portals.find(q=>q.id===p.reverse);assert.equal(back.hatchKey,p.hatchKey);assert.deepEqual(back.requires,p.requires);assert.equal(blocked(other,p.arrivalX,p.arrivalZ),false);const e=make(other.id);for(const point of [other.task,other.archive,...other.interactables,...other.portals]){at(e,point);assert.equal(e.nearestInteraction()?.id,point.id,point.id);} }
 });
 test(id+' — running fan blocks path, sight and direct movement; repose removes only fan collider',()=>{
  const e=make(id),f=e.room.duct.fan;e.state.playSeconds=(10-f.phase)%10+.1;
  const left={x:f.x-70,z:125},right={x:f.x+f.w+70,z:125};assert(e.ductFan().active);assert(!visible(e.room,left,right));assert.equal(findPath(e.room,left,right).length,0);const body={...left};advanceBody(e.room,body,200,0);assert(body.x<f.x);
  e.state.playSeconds=(10-f.phase)%10+5.5;assert(!e.ductFan().active);assert(visible(e.room,left,right));assert(findPath(e.room,left,right).length);assert.equal(e.room.props.length,ROOM_BY_ID[id].props.length);
 });
 test(id+' — both brakes reachable without crossing a running fan',()=>{
  const e=make(id),f=e.room.duct.fan;e.state.playSeconds=(10-f.phase)%10+.1;
  assert(findPath(e.room,{x:140,z:125},e.room.task).length);assert(findPath(e.room,{x:e.room.width-140,z:125},e.room.interactables[0]).length);
 });
 test(id+' — actual left brake hold stops permanently, no task or cost duplication',()=>{
  const e=isolate(make(id));at(e,e.room.task);e.interact();tick(e,2.6,{interact:true});assert(e.state.completed.includes(e.room.task.id));assert(e.ductFan().stopped);const resources=JSON.stringify(e.state.inventory);assert(!e.completeGoal(e.room.task.id));assert.equal(JSON.stringify(e.state.inventory),resources);const restored=new EarthEngine(e.snapshot());assert(restored.ductFan().stopped);tick(restored,12);assert(restored.ductFan().stopped);
 });
 test(id+' — actual right brake hold uses the same optional task',()=>{
  const e=isolate(make(id));at(e,e.room.interactables[0]);assert.equal(e.nearestInteraction().kind,'ductBrake');e.interact();assert.equal(e.serviceAction.kind,'duct-stop');tick(e,2.6,{interact:true});assert(e.ductFan().stopped);assert.equal(e.state.completed.filter(g=>g===e.room.task.id).length,1);
 });
 test(id+' — no valid sensor placement can occupy the rotor during rest',()=>{
  const e=make(id),f=e.room.duct.fan;e.state.playSeconds=(10-f.phase)%10+5.5;at(e,{x:f.x-60,z:125});assert(!e.sensorPlacement().ok);at(e,{x:420,z:125});assert(e.sensorPlacement().ok);assert(findPath(e.room,e.room.spawn,e.player).length);
 });
}
test('new state, invalid V7 registry and legacy V6 defaults',()=>{
 const s=newState();assert.equal(s.schema,11);assert.deepEqual(s.ducts.opened,[]);delete s.ducts;assert.throws(()=>sanitizeSave(s),/grilles/);s.schema=6;assert.deepEqual(sanitizeSave(s).ducts.opened,[]);
});
for(const schema of [1,2,3,4,5,6])test('migration schema '+schema+' preserves old progress, adds no completed duct job',()=>{
 const e=make('R02');e.state.completed=['AE-01'];e.state.archives=['AR-01'];const s=e.snapshot();s.schema=schema;delete s.ducts;const t=sanitizeSave(s);assert.equal(t.schema,11);assert.deepEqual(t.completed,['AE-01']);assert.deepEqual(t.archives,['AR-01']);assert.deepEqual(t.ducts.opened,[]);assert.equal(t.player.x,s.player.x);
});
test('opening requires the inherited main task and cannot complete it',()=>{const e=make('R02'),p=e.room.portals.find(p=>p.hatchKey);at(e,p);assert.equal(e.interact(),null);assert.equal(e.serviceAction,null);assert(!e.state.completed.includes('AE-02'));});
test('opening waits for hold and applies once without moving the player',()=>{const {e,p}=hatchEngine();e.interact();tick(e,.4);assert(e.serviceAction);assert(!e.hatchOpen(p));tick(e,1.9,{interact:true});assert(!e.hatchOpen(p));tick(e,.2,{interact:true});assert(e.hatchOpen(p));assert.equal(e.room.id,'R02');assert.equal(e.state.ducts.stats.opened,1);tick(e,2,{interact:true});assert.equal(e.state.ducts.stats.opened,1);assert.equal(e.room.id,'R02');});
for(const cause of ['release','movement','damage'])test('interrupted hatch opening: '+cause+' gives no open flag or resource loss',()=>{const {e,p}=hatchEngine();const inv=JSON.stringify(e.state.inventory);e.interact();tick(e,.5,{interact:true});if(cause==='release')tick(e,.02);if(cause==='movement')tick(e,.08,{x:1,interact:true});if(cause==='damage'){e.iframe=0;e.damage(1);}assert(!e.hatchOpen(p));assert.equal(e.serviceAction,null);assert.equal(JSON.stringify(e.state.inventory),inv);});
test('opening persists through death and exact import; no transitory service completes itself',()=>{const {e,p}=hatchEngine();open(e,p);e.iframe=0;e.damage(999);e.restartCheckpoint();assert(e.hatchOpen(p));assert(new EarthEngine(e.snapshot()).hatchOpen(p));const {e:f,p:q}=hatchEngine();f.interact();tick(f,1,{interact:true});const g=new EarthEngine(f.snapshot());assert(!g.hatchOpen(q));assert.equal(g.serviceAction,null);});
test('two sides share one opening; exiting never completes another task',()=>{const {e,p}=hatchEngine();open(e,p);const before=[...e.state.completed];e.interact();assert.equal(e.room.id,'R49');const back=e.room.portals.find(d=>d.to==='R02');assert(e.hatchOpen(back));at(e,back);e.interact();assert.equal(e.room.id,'R02');assert.deepEqual(e.state.completed,before);assert.equal(e.state.ducts.stats.crossings,2);});
test('deposited hatch has no fictitious standard bar or repair',()=>{const {e,p}=hatchEngine();open(e,p);e.state.parts=24;assert.equal(e.startSeal(),false);assert.equal(e.startRepair(),false);assert.equal(e.state.parts,24);assert.equal(e.state.seals[p.hatchKey],undefined);});
test('carrying cannot traverse an open hatch and the same patient stays on the same side',()=>{const e=make('R10'),p=e.room.portals.find(p=>p.hatchKey);e.state.completed.push(...p.requires,'AE-38');e.state.ducts.opened.push(p.hatchKey);e.state.survivors.tao={id:'tao',room:'R10',x:p.x,z:p.z,hp:0,status:'down'};e.state.carryId='tao';at(e,p);assert.equal(e.interact(),null);assert.equal(e.room.id,'R10');assert.equal(e.state.carryId,'tao');assert.equal(e.state.survivors.tao.room,'R10');});
test('standing followers cross with one identity and can wait in the duct',()=>{const e=make('R10'),p=e.room.portals.find(p=>p.hatchKey);e.state.completed.push(...p.requires,'AE-38');e.state.ducts.opened.push(p.hatchKey);e.state.survivors.tao={id:'tao',room:'R10',x:p.x-35,z:p.z,hp:65,status:'follow'};at(e,p);e.interact();assert.equal(e.state.survivors.tao.room,'R51');assert.equal(Object.keys(e.state.survivors).length,1);assert(e.commandSurvivors('wait'));assert.equal(e.state.survivors.tao.status,'wait');});
test('low gallery forces crouching and rejects firearm/reload/portage',()=>{const e=isolate(make('R50'));const x=e.player.x,ammo=e.player.ammo;tick(e,1,{x:1,sprint:true});assert(e.crouching);assert(Math.abs(e.player.x-x-e.character.speed*.54)<.5);assert.equal(e.fire(),false);assert.equal(e.reload(),false);assert.equal(e.player.ammo,ammo);assert.equal(e.startCarry(),false);});
test('warning leaves passage open, then running rotor ejects rather than trapping the player',()=>{const e=isolate(make('R49')),f=e.room.duct.fan;e.state.playSeconds=9.99;e.time=9.99;at(e,{x:f.x+10,z:125});e.iframe=0;const hp=e.player.hp;e.update(.04,{});assert(e.ductFan().active);assert(e.player.x<f.x);assert(!blocked(e.room,e.player.x,e.player.z));assert(e.player.hp<hp);assert.equal(e.state.ducts.stats.rotorContacts,1);});
test('pause state freezes turbine phase and battery without wall-clock substitution',()=>{const e=make('R49');e.pending={type:'pause'};const t=e.state.playSeconds,f=e.ductFan();tick(e,6);assert.equal(e.state.playSeconds,t);assert.deepEqual(e.ductFan(),f);});
test('power configuration does not implicitly stop an independent motor',()=>{const e=make('R49');e.state.playSeconds=1;for(const m of ['work','dark','watch']){e.state.circuits.C01=m;assert(e.ductFan().active);}});
test('sensor radio cannot pass bolted hatch, but can relay after opening',()=>{const {e,p}=hatchEngine();e.state.visited.push('R49');Object.assign(e.state.sensors.units['S-01'],{status:'deployed',room:'R49',x:420,z:125});assert(!e.sensorLink('S-01').ok);open(e,p);assert(e.sensorLink('S-01').ok);assert.equal(e.sensorLink('S-01').hops,1);});
test('large alien is not queued through a player-sized hatch',()=>{const e=make('R30'),p=e.room.portals.find(p=>p.hatchKey);e.state.completed.push(...p.requires);e.state.ducts.opened.push(p.hatchKey);at(e,p);const alien=e.enemies.find(e=>e.kind.startsWith('xeno'));Object.assign(alien,{x:p.x-75,z:p.z,stun:0,facing:1,memory:6,lastSeen:{x:p.x,z:p.z}});e.planPursuit(p);assert(!e.state.pursuits.some(q=>q.enemyId===alien.id));});
test('small organism pursues across an open hatch by ordinary movement and keeps its identity',()=>{
 const e=make('R36'),p=e.room.portals.find(p=>p.hatchKey);e.state.completed.push(...p.requires);e.state.ducts.opened.push(p.hatchKey);at(e,p);const small=e.enemies.find(e=>DUCT_SMALL_V7.has(e.kind));assert(small);Object.assign(small,{x:p.x-65,z:p.z,stun:0,facing:1,memory:6,lastSeen:{x:p.x,z:p.z}});const id=small.id;e.interact();assert.equal(e.room.id,'R50');tick(e,5);assert.equal(e.state.enemyRooms[id],'R50');assert.equal(e.enemies.filter(n=>n.id===id).length,1);assert.equal(e.state.world.R36.enemies.filter(n=>n.id===id).length,0);
});
test('incoherent hatch flags, carried patients and adult migration into a duct are rejected',()=>{
 const s=newState();s.ducts.opened=['fake'];assert.throws(()=>sanitizeSave(s),/Grille/);
 const b=make('R49').snapshot();b.enemyRooms['EN-07']='R50';// outside current chapter is normalized by legacy migration
 const a=make('R50').snapshot();a.enemyRooms['EN-07']='R50';assert.throws(()=>sanitizeSave(a),/Organisme/);
 const c=make('R49').snapshot();c.ducts.opened=[];assert.throws(()=>sanitizeSave(c),/grille/);
});
test('V6 backup precedes V7 write, preserving the exact prior bytes',()=>{const s=newState();s.schema=6;delete s.ducts;const raw=JSON.stringify(s),map=new Map([[SAVE_KEY,raw]]),order=[];const store={getItem:k=>map.get(k)??null,setItem:(k,v)=>{map.set(k,v);order.push(k);}};persistEarthProgress(store,sanitizeSave(raw),raw);assert.equal(map.get(SAVE_KEY+'.backup-v6'),raw);assert.deepEqual(order,[SAVE_KEY+'.backup-v6',SAVE_KEY]);assert.equal(JSON.parse(map.get(SAVE_KEY)).schema,11);});
for(const id of D.ductRoutes.map(r=>r.room))test(id+' — timed traversal uses ordinary movement through the rest window without consigning',()=>{
 const e=isolate(make(id)),f=e.room.duct.fan;e.state.playSeconds=(10-f.phase)%10+.1;e.time=e.state.playSeconds;at(e,{x:f.x-65,z:125});const hp=e.player.hp;
 let ticks=0;while(e.ductFan().active&&ticks++<600)e.update(.02,{});assert(ticks<600);
 while(e.player.x<f.x+f.w+65&&ticks++<900)e.update(.02,{x:1,sprint:true});assert(ticks<900);assert(e.player.x>f.x+f.w+60);assert.equal(e.player.hp,hp);assert(!e.state.completed.includes(e.room.task.id));assert.equal(e.state.ducts.stats.rotorContacts,0);
});
test('guidance to a technically accessible but bolted duct marks the grille, not a false unlocked passage',()=>{const {e,p}=hatchEngine();e.state.trackedRoom=p.to;assert.equal(e.routeToTracked()[0].hatch,true);open(e,p);assert.equal(e.routeToTracked()[0].hatch,false);});
test('an actual V6 browser export migrates through the public constructor without spending old resources',()=>{
 const raw=JSON.parse(fs.readFileSync(new URL('../data/qa-export-v6.json',import.meta.url)));assert.equal(raw.schema,6);const s=new EarthEngine(raw).snapshot();assert.equal(s.schema,11);assert.deepEqual(s.inventory,raw.inventory);assert.deepEqual(s.sensors.units,raw.sensors.units);assert.deepEqual(s.completed,raw.completed);assert.deepEqual(s.ducts.opened,[]);
});
test('a carried patient imported in a low duct is rejected',()=>{const s=stateAt('R51');s.completed.push('AE-38');s.survivors.tao={id:'tao',room:'R51',x:140,z:125,hp:0,status:'down'};s.carryId='tao';assert.throws(()=>sanitizeSave(s),/Portage/);});
for(const network of D.networks)test(network.chapter+' — a human can stand at a legal sensor pose in the unchanged workbench room',()=>{
 const e=make(network.benchRoom);let valid=false;
 for(const z of e.room.mode==='SIDE'?[125]:[50,125,200])for(let x=80;x<e.room.width-80;x+=10){at(e,{x,z});e.player.facing=1;if(!blocked(e.room,x,z,24,14)&&e.sensorPlacement().ok){valid=true;break;}}
 assert(valid,network.benchRoom);
});
test('serialized link registry includes all reciprocal duct links as well as legacy links',()=>{const actual=D.rooms.flatMap(r=>r.portals.filter(p=>p.kind==='door').map(p=>p.id)).sort();assert.deepEqual(D.links.map(l=>l.door).sort(),actual);assert.equal(D.links.length,204);});
