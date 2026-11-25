/* One continuous operation from normal insertion. Uses public movement,
   commands, firearms, doors, engineering actions and validated reloads only.
   No edits to positions, actors, resources, memories, gates or objectives. */
import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
import * as O from '../src/operation-v112.mjs';import * as L from '../src/lighting-v112.mjs';import * as B from '../src/beacons-v112.mjs';import * as S from '../src/spatial-core-v108.mjs';import {exitsFor} from '../src/operation-scenes-v112.mjs';
const out=new URL('../report/beacon-states-v112/',import.meta.url);await mkdir(out,{recursive:true});let s=O.createSession(),inputs=0;const states=[];
function tick({fire=false}={}){assert.notEqual(s.status,'failed',s.lastReason);const p=O.player(s),w=O.currentWorld(s);if(fire&&!s.action){const t=w.actors.filter(a=>a.alive&&a.kind==='enemy'&&S.distance(p,a)<620&&!S.trace(w,p,a,0,{query:'projectile'})).sort((a,b)=>S.distance(p,a)-S.distance(p,b))[0];if(t){O.aimTorch(s,t);if(L.perceived(s,w,p,t,620))O.fire(s,t);}}O.advance(s,.025);inputs++;}
function wait(t,opt){for(let i=0;i<Math.ceil(t/.025);i++)tick(opt);}
function go(x,z,opt){const goal={x,z};let g=0;while(S.distance(O.player(s),goal)>6&&g++<2300){const p=O.player(s),path=S.planRoute(O.currentWorld(s),p,goal,p.radius);assert.ok(path.length,`Route absente ${s.roomId}: ${p.x},${p.z} vers ${x},${z}`);const next=path.find(q=>S.distance(p,q)>3)||goal,d=S.distance(p,next),k=Math.min(d,172*.025)/Math.max(d,1);O.movePlayer(s,(next.x-p.x)*k,(next.z-p.z)*k);tick(opt);}assert.ok(g<2300,'Route bloquée');}
function use(){const r=O.interact(s);assert.ok(r.ok,r.reason);return r;}
function open(){use();assert.ok(s.action);wait(1.1);assert.equal(s.action,null);}
function exit(id,opt={fire:true}){const e=exitsFor(s.roomId).find(e=>e.id===id);go(e.x,e.z,opt);O.setOrder(s,'all','follow');let r=O.requestTransfer(s,id);for(let i=0;!r.ok&&!r.waiting&&r.reason.includes('Contact trop proche')&&i<7;i++){wait(.6,opt);r=O.requestTransfer(s,id);}assert.ok(r.ok||r.waiting,r.reason);let n=0;while(s.roomId===e.room&&n++<1400)tick(opt);assert.equal(s.roomId,e.to.room);}
async function save(label,reload=false){const d=O.exportSession(s),v=O.importSession(d);assert.ok(v.ok,`${label}: ${v.reason}`);assert.deepEqual(O.exportSession(v.session),d);await writeFile(new URL(label+'.json',out),JSON.stringify(d,null,2));states.push({label,room:s.roomId,elapsed:s.elapsed,hp:O.player(s).hp,ammo:O.player(s).ammo,lighting:O.lightingBrief(s),beacons:O.beaconBrief(s),engineering:O.engineeringBrief(s),enemyTransfers:s.contacts.metrics.transfers});if(reload){s=v.session;O.pause(s,false);}}
// Normal insertion, required relay, then the new optional three-link loop.
go(560,195);open();go(740,315,{fire:true});go(1200,315,{fire:true});exit('hadley-to-ops');
exit('ops-to-service');go(560,195,{fire:true});open();go(1210,226,{fire:true});wait(1,{fire:true});use();assert.ok(s.flags.relay);exit('service-to-ops');
// Physically open the new sealed entrance. No direct editing of hatch state.
go(286,115);await save('01-avant-sas-optique');assert.ok(O.operateLink(s).ok);wait(1.05,{fire:true});exit('ops-to-optics');await save('02-entree-atelier');
go(620,195,{fire:true});open();O.setOrder(s,'all','cover');wait(4,{fire:true});O.setOrder(s,'all','follow');go(1085,225,{fire:true});await save('03-avant-coffret');
use();wait(.45);await save('04-scelles-en-cours',true);wait(.65);assert.equal(s.beacons.charges,4);await save('05-coffret-ouvert');
// Throw at a real clear floor with the lamp OFF. Prepared point stays fixed.
go(1060,175);O.toggleTorch(s);O.aimTorch(s,{x:1260,z:168});assert.ok(O.throwBeacon(s,{x:1260,z:168}).ok);wait(.25);await save('06-amorcage',true);wait(.4);assert.equal(s.beacons.charges,3);await save('07-atelier-balise');
wait(1);exit('optics-to-conduit');await save('08-entree-conduites');
go(616,195);open();O.aimTorch(s,{x:925,z:195});assert.ok(O.throwBeacon(s,{x:925,z:195}).ok);wait(.65);await save('09-coursive-balisee');O.setOrder(s,'all','cover');wait(5,{fire:true});O.setOrder(s,'all','follow');
go(1292,195,{fire:true});assert.ok(O.operateLink(s).ok);wait(1.1,{fire:true});exit('conduit-to-medlab');await save('10-retour-medical');
// Nominal medical room can be played with no personal lamp.
go(645,196,{fire:true});open();go(1080,203,{fire:true});wait(1,{fire:true});const newt=s.team.find(a=>a.id==='newt');go(newt.x-45,newt.z,{fire:true});use();assert.ok(s.flags.newt);exit('medlab-to-ops');exit('ops-to-sentry');
go(446,285);assert.ok(O.operateLighting(s).ok);wait(1);go(627,195);O.setOrder(s,'all','cover');open();assert.ok(O.throwBeacon(s,{x:920,z:195}).ok);wait(.65);await save('11-sentinelle-balise');wait(11,{fire:true});assert.ok(s.flags.defense);assert.equal(s.lighting.torch.on,false);assert.equal(O.currentWorld(s).circuits.service,false);await save('12-defense-balisee');
O.setOrder(s,'all','follow');exit('sentry-to-ops');exit('ops-to-hadley');go(223,198,{fire:true});wait(2);assert.ok(use().complete);await save('13-repli-balise');
await writeFile(new URL('../report/beacon-drive-v112.json',import.meta.url),JSON.stringify({method:'Parcours continu depuis insertion; mouvement/actions/visée/ordres publics, lecture informée de l’état. Aucun écrit de position, PV, ressource, porte ou objectif. Deux imports de ses propres exports.',complete:s.status==='complete',inputs,elapsed:s.elapsed,enemyTransfers:s.contacts.metrics.transfers,team:s.team.map(({id,hp,ammo})=>({id,hp,ammo})),beacons:O.beaconBrief(s),darkRooms:Object.values(s.worlds).filter(w=>!w.circuits.service).map(w=>w.scene.id),states},null,2));
console.log(JSON.stringify({complete:s.status==='complete',inputs,elapsed:s.elapsed,beacons:O.beaconBrief(s),team:s.team.map(({id,hp,ammo})=>({id,hp,ammo}))},null,2));
