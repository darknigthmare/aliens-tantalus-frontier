/* Public-input traversal. No writing positions, HP, ammo, doors or objectives.
   This is an automated local exercise, not a human playthrough. */
import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
import * as O from '../src/operation-v112.mjs';import * as S from '../src/spatial-core-v108.mjs';
const out=new URL('../report/pursuit-states-v112/',import.meta.url);await mkdir(out,{recursive:true});let s=O.createSession(),steps=0;const log=[];
async function save(name){const raw=O.exportSession(s),r=O.importSession(raw);assert.ok(r.ok,r.reason);await writeFile(new URL(name+'.json',out),JSON.stringify(raw,null,2));log.push({name,elapsed:s.elapsed,room:s.roomId,hp:s.team.map(a=>[a.id,a.hp]),transfers:s.contacts.metrics.transfers});}
function step({shoot=false}={}){if(s.status!=='active')throw new Error('Échec : '+s.lastReason);const p=O.player(s),w=O.currentWorld(s);if(shoot&&!s.action){const target=w.actors.find(a=>a.alive&&a.kind==='enemy'&&S.distance(a,p)<500&&!S.trace(w,p,a,0,{query:'projectile'}));if(target)O.fire(s,target);}O.advance(s,.025);steps++;}
function wait(t,opts){for(let i=0;i<Math.ceil(t/.025);i++)step(opts);}
function go(x,z,opts){const goal={x,z};let n=0;while(S.distance(O.player(s),goal)>6&&n++<2500){const p=O.player(s),path=S.planRoute(O.currentWorld(s),p,goal,p.radius);assert.ok(path.length,`Route ${x},${z} absente`);const wp=path.find(t=>S.distance(t,p)>3)||goal,d=S.distance(p,wp),k=Math.min(172*.025,d)/Math.max(1,d);O.movePlayer(s,(wp.x-p.x)*k,(wp.z-p.z)*k);step(opts);}assert.ok(n<2500);}
go(560,195);assert.ok(O.interact(s).ok);wait(.92);await save('01-porte-residentielle');
go(740,315);go(870,349);go(1200,350);go(1357,195);O.setOrder(s,'all','follow');let r=O.requestTransfer(s,'hadley-to-ops');
for(let i=0;i<140&&s.roomId==='v106-hadley';i++)step();
assert.equal(s.roomId,'v107-operations',r.reason);await save('02-fuite-operations');
// Leave the arrival clear. The pursuers must walk to the source threshold.
go(260,190);O.setOrder(s,'all','hold');let n=0;while(s.contacts.metrics.transfers===0&&n++<1600)step();assert.ok(s.contacts.metrics.transfers>0,'Aucun contact n’a traversé');await save('03-contact-franchi');
// Moving echoes measured in the active room; no actor ID/species exposed.
O.setOrder(s,'all','follow');go(430,235);wait(.4);let moving=0;while(!O.currentWorld(s).actors.some(a=>a.kind==='enemy'&&a.alive&&s.contacts.brains[a.id].speed>1)&&moving++<160)step();assert.ok(moving<160,'Attendre un contact réellement en déplacement');await save('04-avant-impulsion');O.pulse(s);await save('04-detecteur');
// Continue moving into the post and order cover, using real ammunition.
O.setOrder(s,'all','follow');go(650,235,{shoot:true});O.setOrder(s,'all','cover');wait(5,{shoot:true});await save('05-defense-mobile');
// Return to the portal control, staying off its physical throat, and seal it.
go(124,195,{shoot:true});O.setOrder(s,'all','hold');r=O.operateLink(s);
if(!r.ok){go(132,220,{shoot:true});r=O.operateLink(s);}
assert.ok(r.ok,r.reason);assert.equal(s.contacts.links['residential-ops'].open,false);await save('06-liaison-isolee');
const raw=O.exportSession(s),loaded=O.importSession(raw);assert.ok(loaded.ok,loaded.reason);s=loaded.session;O.pause(s,false);wait(2);await save('07-reprise-isolee');
await writeFile(new URL('../report/pursuit-drive-v112.json',import.meta.url),JSON.stringify({ok:true,steps,origin:'public movement/fire/interact/order/pulse/operateLink only; no state mutation',enemyTransfers:s.contacts.metrics.transfers,team:s.team.map(a=>({id:a.id,hp:a.hp,ammo:a.ammo})),events:s.events,states:log},null,2));console.log(JSON.stringify({ok:true,steps,transfers:s.contacts.metrics.transfers,states:log},null,2));
