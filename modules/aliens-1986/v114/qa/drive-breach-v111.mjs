/* One continuous operation from normal insertion. Uses public movement,
   commands, firearms, doors, engineering actions and validated reloads only.
   No edits to positions, actors, resources, memories, gates or objectives. */
import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
import * as O from '../src/operation-v111.mjs';import * as S from '../src/spatial-core-v108.mjs';import {exitsFor} from '../src/operation-scenes-v109.mjs';
const out=new URL('../report/breach-states-v111/',import.meta.url);await mkdir(out,{recursive:true});let s=O.createSession(),inputs=0;const states=[];
function tick({fire=false}={}){assert.notEqual(s.status,'failed',s.lastReason);const p=O.player(s),w=O.currentWorld(s);if(fire&&!s.action){const t=w.actors.filter(a=>a.alive&&a.kind==='enemy'&&S.distance(p,a)<620&&!S.trace(w,p,a,0,{query:'projectile'})).sort((a,b)=>S.distance(p,a)-S.distance(p,b))[0];if(t)O.fire(s,t);}O.advance(s,.025);inputs++;}
function wait(t,opt){for(let i=0;i<Math.ceil(t/.025);i++)tick(opt);}
function go(x,z,opt){const goal={x,z};let g=0;while(S.distance(O.player(s),goal)>6&&g++<2300){const p=O.player(s),path=S.planRoute(O.currentWorld(s),p,goal,p.radius);assert.ok(path.length,`Route absente ${s.roomId}: ${p.x},${p.z} vers ${x},${z}`);const next=path.find(q=>S.distance(p,q)>3)||goal,d=S.distance(p,next),k=Math.min(d,172*.025)/Math.max(d,1);O.movePlayer(s,(next.x-p.x)*k,(next.z-p.z)*k);tick(opt);}assert.ok(g<2300,'Route bloquée');}
function use(){const r=O.interact(s);assert.ok(r.ok,r.reason);return r;}
function open(){use();assert.ok(s.action);wait(1.1);assert.equal(s.action,null);}
function exit(id,opt={fire:true}){const e=exitsFor(s.roomId).find(e=>e.id===id);go(e.x,e.z,opt);O.setOrder(s,'all','follow');let r=O.requestTransfer(s,id);for(let i=0;!r.ok&&!r.waiting&&r.reason.includes('Contact trop proche')&&i<7;i++){wait(.6,opt);r=O.requestTransfer(s,id);}assert.ok(r.ok||r.waiting,r.reason);let n=0;while(s.roomId===e.room&&n++<1400)tick(opt);assert.equal(s.roomId,e.to.room);}
async function save(label,reload=false){const d=O.exportSession(s),v=O.importSession(d);assert.ok(v.ok,`${label}: ${v.reason}`);assert.deepEqual(O.exportSession(v.session),d);await writeFile(new URL(label+'.json',out),JSON.stringify(d,null,2));states.push({label,room:s.roomId,elapsed:s.elapsed,hp:O.player(s).hp,ammo:O.player(s).ammo,engineering:O.engineeringBrief(s),enemyTransfers:s.contacts.metrics.transfers});if(reload){s=v.session;O.pause(s,false);}}
// Flee the known pair through Hadley without erasing them or giving extra ammo.
go(560,195);open();go(740,315);go(870,349);go(1200,350);exit('hadley-to-ops',{fire:false});
let r=O.operateLink(s);assert.ok(r.ok,r.reason);assert.equal(s.contacts.links['residential-ops'].open,false);await save('01-isolement');
go(285,195);O.setOrder(s,'all','hold');let n=0;
while(s.engineering.metrics.enemyHits===0&&n++<1100)tick();assert.ok(n<1100,'Aucun impact sur sas fermé');await save('02-premier-impact',true);
// Mid-windup export is a real combat state, not an injected animation fixture.
let found=false;for(let i=0;i<120;i++){const a=Object.values(s.engineering.attacks).find(a=>a?.phase==='windup'&&a.remaining>.3);if(a){found=true;break;}tick();}assert.ok(found,'Préparation de coup attendue');await save('03-pression-engagee');
n=0;while(!s.engineering.links['residential-ops'].breached&&n++<700)tick();assert.ok(n<700,'Le battant doit céder');await save('04-breche');
assert.equal(s.contacts.links['residential-ops'].open,true);assert.equal(s.engineering.links['residential-ops'].hits,4);
// Move away from the throat before fighting; pursuers retain original IDs.
O.setOrder(s,'all','follow');go(435,235);O.setOrder(s,'all','cover');wait(6,{fire:true});await save('05-contact-apres-breche');
assert.ok(s.contacts.metrics.transfers>=1,'Le contact doit franchir sa propre brèche');
// Fetch the finite maintenance stock, no privileged grant.
O.setOrder(s,'all','follow');exit('ops-to-service');go(560,195,{fire:true});open();go(1210,226,{fire:true});wait(1,{fire:true});use();assert.ok(s.flags.relay);go(793,314,{fire:true});await save('06a-avant-les-plaques');use();wait(1.15);assert.equal(s.engineering.plates,3);await save('06-plaques-collectees');
exit('service-to-ops');go(300,225,{fire:true});O.setOrder(s,'all','hold');go(124,195,{fire:true});assert.equal(O.operateLink(s).ok,false);assert.ok(O.engineeringAction(s,'repair-hatch').ok);wait(.6);await save('07-refection-en-cours',true);wait(1.7);assert.equal(s.contacts.links['residential-ops'].open,false);assert.equal(s.engineering.plates,2);await save('08-refection-terminee');
assert.ok(O.engineeringAction(s,'brace').ok);wait(.65);await save('09-soudure-en-cours');wait(1.2);assert.equal(s.engineering.plates,1);await save('10-renfort-soude',true);
assert.equal(O.operateLink(s).ok,false);assert.ok(O.engineeringAction(s,'cut-brace').ok);wait(.5);await save('11-decoupe-en-cours');wait(.95);assert.equal(s.contacts.links['residential-ops'].open,true);assert.equal(s.engineering.plates,1);await save('12-route-rouverte');
// Finish the unchanged operation. Engineering never credits an objective.
O.setOrder(s,'all','follow');exit('ops-to-medlab');go(645,196,{fire:true});open();go(1080,203,{fire:true});wait(1,{fire:true});const newt=s.team.find(a=>a.id==='newt');go(newt.x-45,newt.z,{fire:true});use();assert.ok(s.flags.newt);exit('medlab-to-ops');exit('ops-to-sentry');go(627,195,{fire:true});O.setOrder(s,'all','cover');open();wait(11,{fire:true});assert.ok(s.flags.defense);O.setOrder(s,'all','follow');exit('sentry-to-ops');exit('ops-to-hadley');go(223,198,{fire:true});wait(2);assert.ok(use().complete);await save('13-repli-apres-breche');
await writeFile(new URL('../report/breach-drive-v111.json',import.meta.url),JSON.stringify({method:'Parcours continu depuis insertion normale, entrées publiques uniquement, aucun état acteur/ressource/objectif réécrit',complete:s.status==='complete',inputs,elapsed:s.elapsed,enemyTransfers:s.contacts.metrics.transfers,team:s.team.map(({id,hp,ammo})=>({id,hp,ammo})),engineering:O.engineeringBrief(s),states},null,2));console.log(JSON.stringify({complete:s.status==='complete',inputs,elapsed:s.elapsed,enemyTransfers:s.contacts.metrics.transfers,engineering:O.engineeringBrief(s)},null,2));
