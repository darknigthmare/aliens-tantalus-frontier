/* Public-input playthrough, no actor/door/HP/ammo/flag mutation. Spatial reads
   select inputs. Deliberately taking one attack is a gameplay action, not HP editing. */
import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
import * as O from '../src/operation-v109.mjs';import * as S from '../src/spatial-core-v108.mjs';import {exitsFor,STOCKS} from '../src/operation-scenes-v109.mjs';
const out=new URL('../report/logistics-states/',import.meta.url);await mkdir(out,{recursive:true});const results=[];
for(const variant of ['supply-loop','supply-loop-reloads']){
 let s=O.createSession(),inputs=0;const checkpoints=[];
 const tick=(dt=.025,{fire=true}={})=>{assert.notEqual(s.status,'failed','échec '+s.lastReason);const p=O.player(s),w=O.currentWorld(s);const t=w.actors.filter(a=>a.kind==='enemy'&&a.alive&&S.distance(p,a)<620&&!S.trace(w,p,a,0,{query:'projectile'})).sort((a,b)=>S.distance(p,a)-S.distance(p,b))[0];if(fire&&!s.action&&t)O.fire(s,t);O.advance(s,dt);inputs++;};
 function wait(t,opts){for(let i=0;i<Math.ceil(t/.025);i++)tick(.025,opts);}
 function go(x,z,opts){const target={x,z};let guard=0;while(S.distance(O.player(s),target)>6&&guard++<2100){const p=O.player(s),w=O.currentWorld(s),path=S.planRoute(w,p,target,p.radius);assert.ok(path.length,`Chemin absent ${s.roomId} (${p.x},${p.z}) -> (${x},${z})`);const wp=path.find(x=>S.distance(p,x)>3)||target,d=S.distance(p,wp),k=Math.min(172*.025,d)/Math.max(1,d);O.movePlayer(s,(wp.x-p.x)*k,(wp.z-p.z)*k);tick(.025,opts);}assert.ok(guard<2100,'déplacement bloqué');}
 function use(){const r=O.interact(s);assert.ok(r.ok,r.reason);return r;}
 function open(){use();assert.ok(s.action);wait(1.1,{fire:false});assert.equal(s.action,null);}
 function exit(id){const e=exitsFor(s.roomId).find(e=>e.id===id);assert.ok(e);go(e.x,e.z);O.setOrder(s,'all','follow');let r=O.interact(s);for(let attempt=0;!r.ok&&!r.waiting&&r.reason.includes('Contact trop proche')&&attempt<6;attempt++){wait(.8);r=O.interact(s);}assert.ok(r.ok||r.waiting,r.reason);let guard=0;while(s.roomId===e.room&&guard++<1400)tick();assert.equal(s.roomId,e.to.room,'transfert bloqué '+id);}
 async function save(label){const raw=O.exportSession(s),r=O.importSession(raw);assert.ok(r.ok,label+' '+r.reason);assert.deepEqual(O.exportSession(r.session),raw);if(variant==='supply-loop')await writeFile(new URL(label+'.json',out),JSON.stringify(raw,null,2));checkpoints.push({label,room:s.roomId,elapsed:s.elapsed,ammo:O.player(s).ammo,hp:O.player(s).hp,inventory:structuredClone(s.logistics.inventory)});if(variant.endsWith('reloads')){s=r.session;O.pause(s,false);}}
 go(559,196);open();wait(1);exit('hadley-to-ops');await save('01-operations');
 exit('ops-to-logistics');await save('02-galerie-arrivee');go(616,195);open();
 go(874,196,{fire:false});let wound=0;while(O.player(s).hp===100&&wound++<240)tick(.025,{fire:false});assert.ok(O.player(s).hp<100,'impact réel attendu');await save('03-blessure-reelle');wait(1.5);go(1130,221);use();wait(1.1);assert.equal(s.logistics.inventory.ammo,3);await save('04-stock-munitions');
 const before=O.player(s).ammo;assert.ok(O.fieldAction(s,'ammo','ripley').ok);wait(.9,{fire:false});assert.equal(O.player(s).ammo,before+18);await save('05-lot-distribue');
 exit('logistics-to-reserve');go(287,216);use();wait(1.1);assert.equal(s.logistics.inventory.sentry,1);go(567,195);open();wait(1.2);go(858,218);wait(.6);use();wait(1.1);assert.equal(s.logistics.inventory.medical,2);await save('06-secours-collectes');
 assert.ok(O.fieldAction(s,'medical','ripley').ok);wait(.6,{fire:false});await save('07-soin-en-cours');wait(1.1,{fire:false});assert.equal(O.player(s).hp,100);assert.equal(s.logistics.inventory.medical,1);await save('08-soin-termine');
 go(1154,238);use();wait(.7,{fire:false});assert.ok(s.logistics.alarms['reserve-alarm'].remaining>0);await save('09-diagnostic-actif');
 // Allow the normal sound simulation to run without injecting a target/stimulus.
 wait(1.6,{fire:false});assert.ok(s.contacts.noises.some(n=>n.kind==='diagnostic'));await save('10-alarme-persistante');
 exit('reserve-to-service');go(1210,226);wait(1);use();assert.equal(s.flags.relay,true);await save('11-relais-via-reserve');
 exit('service-to-medlab');go(1190,191);wait(1);let n=s.team.find(a=>a.id==='newt');go(n.x-45,n.z);assert.ok(use().ok);assert.equal(s.flags.newt,true);if(!O.currentWorld(s).doors['quarantine-gate'].open){go(770,195);open();}
 exit('medlab-to-ops');await save('12-newt-operations');exit('ops-to-sentry');go(627,195);O.setOrder(s,'all','cover');open();wait(11);assert.equal(s.flags.defense,true);
 const sentry=O.currentWorld(s).actors.find(a=>a.role==='sentry');go(sentry.x-40,sentry.z);const old=sentry.ammo;assert.ok(old<120);assert.ok(O.fieldAction(s,'sentry',sentry.id).ok);wait(.5,{fire:false});await save('13-cartouche-en-cours');wait(1,{fire:false});assert.equal(O.currentWorld(s).actors.find(a=>a.id===sentry.id).ammo,Math.min(120,old+40));assert.equal(s.logistics.inventory.sentry,0);await save('14-sentinelle-ravitaillee');
 O.setOrder(s,'all','follow');exit('sentry-to-ops');exit('ops-to-hadley');go(223,198);wait(2);assert.ok(use().complete);await save('15-repli-boucle');
 results.push({variant,complete:s.status==='complete',inputs,elapsed:s.elapsed,transfers:s.transitions,visited:s.visitedRooms,team:s.team.map(({id,hp,ammo})=>({id,hp,ammo})),logistics:O.logisticsBrief(s),contactTransfers:s.contacts.metrics.transfers,checkpoints});console.log(JSON.stringify(results.at(-1),null,2));
}
await writeFile(new URL('../report/logistics-drive-v109.json',import.meta.url),JSON.stringify({method:'Entrées publiques exclusivement ; une blessure obtenue par une attaque réelle, aucune valeur HP éditée.',nativeCampaign:false,results},null,2));
