/* One continuous operation from normal insertion. Uses public movement,
   commands, firearms, doors, engineering actions and validated reloads only.
   No edits to positions, actors, resources, memories, gates or objectives. */
import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
import * as O from '../src/operation-v114.mjs';import * as L from '../src/lighting-v114.mjs';import * as S from '../src/spatial-core-v108.mjs';import {exitsFor} from '../src/operation-scenes-v114.mjs';
const out=new URL('../report/lighting-states-v114/',import.meta.url);await mkdir(out,{recursive:true});let s=O.createSession(),inputs=0;const states=[];
function tick({fire=false}={}){assert.notEqual(s.status,'failed',s.lastReason);const p=O.player(s),w=O.currentWorld(s);if(fire&&!s.action){const t=w.actors.filter(a=>a.alive&&a.kind==='enemy'&&S.distance(p,a)<620&&!S.trace(w,p,a,0,{query:'projectile'})).sort((a,b)=>S.distance(p,a)-S.distance(p,b))[0];if(t){O.aimTorch(s,t);if(L.perceived(s,w,p,t,620))O.fire(s,t);}}O.advance(s,.025);inputs++;}
function wait(t,opt){for(let i=0;i<Math.ceil(t/.025);i++)tick(opt);}
function go(x,z,opt){const goal={x,z};let g=0;while(S.distance(O.player(s),goal)>6&&g++<2300){const p=O.player(s),path=S.planRoute(O.currentWorld(s),p,goal,p.radius);assert.ok(path.length,`Route absente ${s.roomId}: ${p.x},${p.z} vers ${x},${z}`);const next=path.find(q=>S.distance(p,q)>3)||goal,d=S.distance(p,next),k=Math.min(d,172*.025)/Math.max(d,1);O.movePlayer(s,(next.x-p.x)*k,(next.z-p.z)*k);tick(opt);}assert.ok(g<2300,'Route bloquée');}
function use(){const r=O.interact(s);assert.ok(r.ok,r.reason);return r;}
function open(){use();assert.ok(s.action);wait(1.1);assert.equal(s.action,null);}
function exit(id,opt={fire:true}){const e=exitsFor(s.roomId).find(e=>e.id===id);go(e.x,e.z,opt);O.setOrder(s,'all','follow');let r=O.requestTransfer(s,id);for(let i=0;!r.ok&&!r.waiting&&r.reason.includes('Contact trop proche')&&i<7;i++){wait(.6,opt);r=O.requestTransfer(s,id);}assert.ok(r.ok||r.waiting,r.reason);let n=0;while(s.roomId===e.room&&n++<1400)tick(opt);assert.equal(s.roomId,e.to.room);}
async function save(label,reload=false){const d=O.exportSession(s),v=O.importSession(d);assert.ok(v.ok,`${label}: ${v.reason}`);assert.deepEqual(O.exportSession(v.session),d);await writeFile(new URL(label+'.json',out),JSON.stringify(d,null,2));states.push({label,room:s.roomId,elapsed:s.elapsed,hp:O.player(s).hp,ammo:O.player(s).ammo,lighting:O.lightingBrief(s),engineering:O.engineeringBrief(s),enemyTransfers:s.contacts.metrics.transfers});if(reload){s=v.session;O.pause(s,false);}}
// Continuous run, starts at normal insertion. Position reads choose inputs; no
// position/HP/ammo/flag/circuit/memory assignments are used by this driver.
go(560,195);open();go(740,315);go(870,349);go(1200,350);exit('hadley-to-ops',{fire:false});
go(733,270);await save('01-avant-coupure');assert.ok(O.operateLighting(s).ok);wait(.4);await save('02-coupure-en-cours',true);wait(.6);assert.equal(O.currentWorld(s).circuits.service,false);O.toggleTorch(s);await save('03-operations-noir');
// Avoid the old contact with the physical route and quiet steps, not an AI pause.
O.setPace(s,true);go(1100,210);O.setPace(s,false);O.setOrder(s,'all','hold');wait(.4);await save('04-ombre-et-poursuite',true);
assert.ok(s.contacts.metrics.transfers>=1,'Au moins un contact entre réellement dans Operations');
const contact=O.currentWorld(s).actors.find(a=>a.alive&&a.kind==='enemy');if(contact)O.aimTorch(s,contact);O.toggleTorch(s);await save('05-torche-contact');O.setOrder(s,'all','cover');wait(7,{fire:true});await save('06-defense-dans-le-noir');
O.setOrder(s,'all','follow');exit('ops-to-service');go(560,195,{fire:true});open();go(1210,226,{fire:true});wait(1,{fire:true});use();assert.ok(s.flags.relay);exit('service-to-ops');assert.equal(O.currentWorld(s).circuits.service,false);await save('07-retour-circuit-conserve');
// Restore power using the same physical command; no free heal or ammunition.
go(733,270);assert.ok(O.operateLighting(s).ok);wait(1);assert.equal(O.currentWorld(s).circuits.service,true);await save('08-operations-retablie');
exit('ops-to-medlab');go(645,196,{fire:true});open();go(1080,203,{fire:true});wait(1,{fire:true});const newt=s.team.find(a=>a.id==='newt');go(newt.x-45,newt.z,{fire:true});use();assert.ok(s.flags.newt);exit('medlab-to-ops');exit('ops-to-sentry');
// Cut the defense lights; shots/torch reveal contacts to the finite sentry.
go(446,285);assert.ok(O.operateLighting(s).ok);wait(1);await save('09-ligne-sans-lampes');
O.setOrder(s,'all','cover');go(627,195);open();go(610,245,{fire:false});wait(2,{fire:false});wait(11,{fire:true});assert.ok(s.flags.defense);await save('10-defense-tenue-noir');
O.setOrder(s,'all','follow');exit('sentry-to-ops');exit('ops-to-hadley');go(223,198,{fire:true});wait(2);assert.ok(use().complete);await save('11-repli-noir');
await writeFile(new URL('../report/lighting-drive-v114.json',import.meta.url),JSON.stringify({method:'Entrées publiques depuis insertion normale; lit positions pour planifier, ne modifie aucune position, vie, réserve, mémoire ni objectif',complete:s.status==='complete',inputs,elapsed:s.elapsed,enemyTransfers:s.contacts.metrics.transfers,team:s.team.map(({id,hp,ammo})=>({id,hp,ammo})),lighting:O.lightingBrief(s),darkRooms:Object.values(s.worlds).filter(w=>w.circuits.service===false).map(w=>w.scene.id),states},null,2));console.log(JSON.stringify({complete:s.status==='complete',inputs,elapsed:s.elapsed,enemyTransfers:s.contacts.metrics.transfers,lighting:O.lightingBrief(s)},null,2));
