/* Deterministic input driver. It never changes health, doors, ammunition,
   positions, task flags or encounter population directly. Only public actions
   and movement deltas are used. This is not a manual playthrough. */
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import * as S from '../src/spatial-core-v108.mjs';
import * as O from '../src/operation-v109.mjs';
import {exitsFor} from '../src/operation-scenes-v109.mjs';
const root=new URL('../',import.meta.url),out=new URL('report/states-v109/',root);await mkdir(out,{recursive:true});
const results=[];
for(const variant of ['direct','service-link-reloads']){
 let s=O.createSession(),cooldown=0,inputs=0;const visited=[];
 function step(dt=.025,{fire=true}={}){
  if(s.status!=='active')assert.equal(s.status,'complete','mort pendant le parcours '+s.lastReason);
  const p=O.player(s),w=O.currentWorld(s);cooldown=Math.max(0,cooldown-dt);
  const target=w.actors.filter(a=>a.kind==='enemy'&&a.alive&&S.distance(p,a)<640&&!S.trace(w,p,a,0,{query:'projectile'})).sort((a,b)=>S.distance(p,a)-S.distance(p,b))[0];
  if(fire&&!s.action&&target&&cooldown===0){if(O.fire(s,target).ok)cooldown=.16;}
  O.advance(s,dt);inputs++;
 }
 function wait(t,options={}){for(let i=0;i<Math.ceil(t/.025);i++)step(.025,options);}
 function go(x,z){
  let goal={x,z},steps=0;
  while(S.distance(O.player(s),goal)>7&&steps++<1800){
   const w=O.currentWorld(s),p=O.player(s),path=S.planRoute(w,p,goal,p.radius);assert.ok(path.length,`Chemin absent ${s.roomId} ${p.x},${p.z} -> ${x},${z}`);
   const wp=path.find(pt=>S.distance(p,pt)>3)||goal,d=S.distance(p,wp),k=Math.min(172*.025,d)/Math.max(1,d);
   O.movePlayer(s,(wp.x-p.x)*k,(wp.z-p.z)*k);step();
  }
  assert.ok(steps<1800,'déplacement bloqué '+s.roomId);
 }
 async function save(label){const data=O.exportSession(s),check=O.importSession(data);assert.ok(check.ok,check.reason);if(variant==='direct')await writeFile(new URL(label+'.json',out),JSON.stringify(data,null,2));if(variant.endsWith('reloads')){s=check.session;O.pause(s,false);}visited.push({label,room:s.roomId,time:+s.elapsed.toFixed(2),step:s.step,ammo:O.player(s).ammo,health:s.team.map(a=>[a.id,a.hp])});}
 function open(){const r=O.interact(s);assert.ok(r.ok,r.reason);assert.ok(s.action,'action attendue');wait(1,{fire:false});assert.equal(s.action,null);}
 function exit(id){const e=exitsFor(s.roomId).find(e=>e.id===id);assert.ok(e);go(e.x,e.z);O.setOrder(s,'all','follow');const r=O.interact(s);assert.ok(r.ok||r.waiting,r.reason);let t=0;while(s.roomId===e.room&&t++<1200)step();assert.equal(s.roomId,e.to.room,'regroupement bloqué '+e.id);}
 await save('00-insertion');
 go(559,196);open();wait(1);go(1080,195);wait(.3);await save('01-hadley-ouvert');
 exit('hadley-to-ops');assert.equal(s.step,1);await save('02-operations');
 exit('ops-to-service');go(560,197);open();go(1210,226);wait(.7);let r=O.interact(s);assert.ok(r.ok,r.reason);assert.equal(s.flags.relay,true);assert.equal(s.step,2);await save('03-relais');
 if(variant==='direct'){exit('service-to-ops');exit('ops-to-medlab');go(645,196);open();go(1080,203);}else{exit('service-to-medlab');go(1190,191);}
 wait(1);const newt=s.team.find(a=>a.id==='newt');go(newt.x-45,newt.z);r=O.interact(s);assert.ok(r.ok,r.reason);assert.equal(s.flags.newt,true);assert.equal(s.step,3);await save('04-newt');
 if(!O.currentWorld(s).doors['quarantine-gate'].open){go(770,195);open();}
 exit('medlab-to-ops');await save('05-retour-operations');
 exit('ops-to-sentry');go(627,195);O.setOrder(s,'all','cover');open();wait(11);assert.equal(s.flags.defense,true);assert.equal(s.step,4);await save('06-defense');
 O.setOrder(s,'all','follow');exit('sentry-to-ops');exit('ops-to-hadley');assert.equal(O.currentWorld(s).doors['service-gate'].open,true);go(223,198);wait(2);r=O.interact(s);assert.ok(r.complete,r.reason);assert.equal(s.status,'complete');await save('07-repli');
 const final=O.exportSession(s);results.push({variant,complete:true,inputs,elapsed:+s.elapsed.toFixed(2),transfers:s.transitions,step:s.step,stats:s.stats,ammunition:s.team.map(a=>({id:a.id,ammo:a.ammo,hp:a.hp})),rooms:s.visitedRooms,checkpoints:visited});
 console.log(JSON.stringify(results.at(-1),null,2));
}
await writeFile(new URL('report/operation-drive-v109.json',root),JSON.stringify({method:'Public movement/action API, no direct state edits; two complete automated local operation runs',nativeCampaign:false,results},null,2));
