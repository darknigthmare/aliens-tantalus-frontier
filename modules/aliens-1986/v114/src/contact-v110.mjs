/* V108: one bounded acoustic/awareness state for the connected local operation.
   No spawn director: every pursuer is an existing catalogue actor. */
import * as S from './spatial-core-v108.mjs';
import * as N from './engineering-v110.mjs';
import {ROOMS,LINKS,exitsFor,OPERATION_ROOMS} from './operation-scenes-v109.mjs';
export const RULES=Object.freeze({vision:490,shotRange:1780,footstepRange:250,doorRange:560,trackerRange:600,memory:24,search:5,crossing:.85,pulseCooldown:2.4,maxHops:2,portalThickness:24,portalHalfSpan:37});
const point=a=>({x:a.x,z:a.z}), clone=x=>structuredClone(x),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const catalogue=Object.fromEntries(ROOMS.flatMap(r=>r.actors.map(a=>[a.id,{...clone(a),home:r.id}])));
const enemyIds=Object.keys(catalogue).filter(id=>catalogue[id].kind==='enemy');
const newBrain=()=>({mode:'idle',stimulus:null,searchUntil:0,searchStep:0,nextPathAt:0,travel:null,speed:0,lastStep:0});
export function createContact(){return {schema:108,pace:'normal',stride:0,footAt:0,serial:0,noises:[],brains:Object.fromEntries(enemyIds.map(id=>[id,newBrain()])),links:Object.fromEntries(LINKS.map(l=>[l.id,{open:true,changedAt:0}])),tracker:{cooldown:0,age:10,samples:[],pulses:0},metrics:{noises:0,heard:0,sightings:0,transfers:0,blockedPassages:0,seals:0,searches:0}};}
const log=(s,type,data={})=>{s.events.push({type,time:s.elapsed,...data});if(s.events.length>60)s.events.shift();};
const roomPoint=(roomId,p,at,kind)=>({roomId,x:p.x,z:p.z,at,expires:at+RULES.memory,kind});
export const linkOpen=(s,id)=>s.contacts?.links[id]?.open===true;
export function setPace(s,careful){if(s.paused||s.status!=='active')return false;s.contacts.pace=careful?'careful':'normal';return true;}
function routeLength(w,a,b){const path=S.planRoute(w,a,b,4,{cell:48,maxExpanded:1500});if(!path.length)return Infinity;let total=0,anchor=a;for(const p of path){total+=S.distance(anchor,p);anchor=p;}return total;}
function hear(s,roomId,p,radius,stimulus,source){const w=s.worlds[roomId];for(const a of w.actors){if(a.kind!=='enemy'||!a.alive||a.id===source)continue;const cost=routeLength(w,a,p);if(cost>radius)continue;const brain=s.contacts.brains[a.id];if(brain.mode==='hunt'&&brain.stimulus?.at>s.elapsed-1)continue;brain.mode='investigate';brain.stimulus=clone(stimulus);brain.travel=null;brain.nextPathAt=0;s.contacts.metrics.heard++;}}
export function emitNoise(s,roomId,p,kind,source='environment',radius=null){
 if(s.paused||s.status!=='active'||!s.contacts||!s.worlds[roomId])return false;
 // Repeated automatic fire keeps a sound alive without an unbounded event queue.
 if(s.contacts.noises.some(n=>n.source===source&&n.kind===kind&&s.elapsed-n.at<.28))return false;
 const range=radius??(kind==='shot'?RULES.shotRange:kind==='footstep'?RULES.footstepRange:RULES.doorRange);
 const n={seq:++s.contacts.serial,roomId,x:p.x,z:p.z,kind,source,at:s.elapsed,radius:range};s.contacts.noises.push(n);s.contacts.noises=s.contacts.noises.slice(-16);s.contacts.metrics.noises++;
 const queue=[{room:roomId,p:point(p),range,hops:0}],best=new Map();
 while(queue.length){const item=queue.shift();if((best.get(item.room)??-1)>=item.range)continue;best.set(item.room,item.range);hear(s,item.room,item.p,item.range,roomPoint(roomId,p,s.elapsed,'sound'),source);
  if(s.mode!=='operation'||item.hops>=RULES.maxHops)continue;
  for(const exit of exitsFor(item.room)){if(!linkOpen(s,exit.linkId))continue;const cost=routeLength(s.worlds[item.room],item.p,exit)+160;
   const remaining=(item.range-cost)*.74;if(remaining>80)queue.push({room:exit.to.room,p:exit.to.arrival,range:remaining,hops:item.hops+1});}
 }
 log(s,'noise',{room:roomId,kind});return true;
}
export function footsteps(s,from,to){const d=S.distance(from,to);if(d<.001)return;s.contacts.stride+=d;if(s.contacts.pace==='normal'&&s.contacts.stride>=66&&s.elapsed-s.contacts.footAt>.42){s.contacts.stride=0;s.contacts.footAt=s.elapsed;emitNoise(s,s.roomId,to,'footstep','ripley',RULES.footstepRange);}else if(s.contacts.pace==='careful')s.contacts.stride=Math.min(65,s.contacts.stride);}
export function nextExit(s,from,to){if(from===to)return null;const queue=[{room:from,first:null}],seen=new Set([from]);while(queue.length){const item=queue.shift();for(const e of exitsFor(item.room)){if(!linkOpen(s,e.linkId)||seen.has(e.to.room))continue;const first=item.first||e;if(e.to.room===to)return first;seen.add(e.to.room);queue.push({room:e.to.room,first});}}return null;}
export function go(s,w,a,goal,dt){const b=s.contacts.brains[a.id];if(!S.canStand(w,goal,a.radius))return false;
 if(a.routeRevision!==w.revision||s.elapsed>=b.nextPathAt){a.route=S.planRoute(w,a,goal,a.radius);a.routeRevision=w.revision;b.nextPathAt=s.elapsed+.7;}
 while(a.route?.length&&S.distance(a,a.route[0])<3)a.route.shift();const p=a.route?.[0];if(!p)return false;const d=S.distance(a,p),step=Math.min(d,(a.speed||63)*dt),from=point(a);S.move(w,a,(p.x-a.x)/Math.max(1,d)*step,(p.z-a.z)/Math.max(1,d)*step);b.speed=S.distance(from,a)/dt;if(b.speed>.1)b.lastStep=s.elapsed;return b.speed>.1;
}
function safeSearch(w,a,p,index){const offsets=[[0,0],[80,0],[-80,0],[0,70],[0,-70]];for(let i=0;i<offsets.length;i++){const [dx,dz]=offsets[(index+i)%offsets.length],q={x:clamp(p.x+dx,a.radius,w.scene.width-a.radius),z:clamp(p.z+dz,a.radius,w.scene.depth-a.radius)};if(S.canStand(w,q,a.radius))return q;}return point(a);}
function landing(s,exit,a){const w=s.worlds[exit.to.room],base=exit.to.arrival;for(const [dx,dz] of [[0,0],[0,45],[0,-45],[44,0],[-44,0],[44,44],[-44,-44]]){const p={x:base.x+dx,z:base.z+dz};if(S.canStand(w,p,a.radius)&&w.actors.every(b=>!b.alive||S.distance(b,p)>a.radius+b.radius+7))return p;}return null;}
export function cross(s,w,a,exit,dt){const b=s.contacts.brains[a.id];if(!linkOpen(s,exit.linkId)){b.travel=null;s.contacts.metrics.blockedPassages++;return;}
 if(!b.travel||b.travel.exitId!==exit.id)b.travel={exitId:exit.id,elapsed:0};b.travel.elapsed=Math.min(RULES.crossing,b.travel.elapsed+dt);
 if(b.travel.elapsed+1e-8<RULES.crossing)return;
 const p=landing(s,exit,a);if(!p)return;
 w.actors=w.actors.filter(x=>x!==a);Object.assign(a,{x:p.x,z:p.z,route:[],routeRevision:-1});s.worlds[exit.to.room].actors.push(a);b.travel=null;b.nextPathAt=0;b.speed=0;b.lastStep=s.elapsed;s.contacts.metrics.transfers++;
 log(s,'enemy-transfer',{id:a.id,from:w.scene.id,to:exit.to.room,linkId:exit.linkId});
 if(s.roomId===exit.to.room&&S.distance(s.team[0],p)<350)s.lastReason='Un frottement au seuil de '+w.scene.title+'.';
}
export function runEnemy(s,w,a,dt){const b=s.contacts.brains[a.id];if(!b)return;b.speed=0;if(!a.alive){if(s.engineering)s.engineering.attacks[a.id]=null;b.mode='dead';b.stimulus=null;b.travel=null;return;}if(a.phase==='windup'||a.phase==='recover')return;
 const targets=w.actors.filter(t=>t.alive&&['player','ally','escort'].includes(t.kind)&&t.role!=='sentry'&&(t.kind!=='escort'||t.recruited)&&S.distance(a,t)<RULES.vision&&S.visible(w,a,t)).sort((x,y)=>S.distance(a,x)-S.distance(a,y));
 const t=targets[0];if(t){if(s.engineering)s.engineering.attacks[a.id]=null;if(b.mode!=='hunt')s.contacts.metrics.sightings++;b.mode='hunt';b.stimulus=roomPoint(w.scene.id,t,s.elapsed,'sight');b.travel=null;if(!S.beginAttack(w,a,t))go(s,w,a,t,dt);return;}
 if(N.tryBreach(s,w,a,dt))return;
 const k=b.stimulus;if(!k){b.mode='idle';return;}
 if(s.elapsed>k.expires){if(b.mode!=='search'){b.mode='search';b.searchUntil=s.elapsed+RULES.search;b.searchStep=0;b.nextPathAt=0;s.contacts.metrics.searches++;}if(s.elapsed>=b.searchUntil){b.mode='idle';b.stimulus=null;b.travel=null;a.route=[];return;}}
 if(k.roomId!==w.scene.id){
  if(b.mode==='search')return;
  const exit=nextExit(s,w.scene.id,k.roomId);if(!exit){if(b.travel){b.travel=null;s.contacts.metrics.blockedPassages++;}return;}
  if(S.distance(a,exit)<18&&!S.trace(w,a,exit,a.radius))cross(s,w,a,exit,dt);else{b.travel=null;go(s,w,a,exit,dt);}return;
 }
 b.travel=null;const goal=safeSearch(w,a,k,b.mode==='search'?b.searchStep:0);if(S.distance(a,goal)<20){if(b.mode!=='search'){b.mode='search';b.searchUntil=s.elapsed+RULES.search;b.searchStep=0;s.contacts.metrics.searches++;}else{b.searchStep=(b.searchStep+1)%5;b.nextPathAt=0;}
  if(s.elapsed>=b.searchUntil){b.mode='idle';b.stimulus=null;a.route=[];return;}
 }go(s,w,a,goal,dt);
}
export function teamDeparted(s,from,exit,members){const w=s.worlds[from];for(const a of w.actors){if(a.kind!=='enemy'||!a.alive)continue;const b=s.contacts.brains[a.id];
  const observed=b.stimulus&&b.mode==='hunt'&&s.elapsed-b.stimulus.at<2&&S.distance(a,exit)<RULES.vision&&S.visible(w,a,exit);
  if(a.phase==='windup'&&members.some(t=>t.id===a.aim?.targetId)){a.phase='recover';a.clock=.35;a.aim=null;}
  if(observed){b.stimulus=roomPoint(exit.to.room,exit.to.arrival,s.elapsed,'trail');b.nextPathAt=0;b.travel=null;}
 }}
export function sealLink(s,exit){if(!N.canClose(s,exit.linkId))return {ok:false,reason:'Battant arraché : une plaque et une réparation sont nécessaires avant de refermer.'};const state=s.contacts.links[exit.linkId];if(!state)return {ok:false,reason:'Liaison inconnue'};
 const pair=LINKS.find(l=>l.id===exit.linkId);for(const end of [pair.a,pair.b])if(s.worlds[end.room].actors.some(a=>a.alive&&S.segmentBox(a,a,hatchBox(end),a.radius+3)!==null))return {ok:false,reason:'Seuil occupé : éloignez le groupe du battant.'};
 if(Object.values(s.contacts.brains).some(b=>b.travel&&[pair.a.id,pair.b.id].includes(b.travel.exitId)))return {ok:false,reason:'Quelque chose occupe le passage.'};
 state.open=false;state.changedAt=s.elapsed;syncHatches(s);s.contacts.metrics.seals++;for(const w of Object.values(s.worlds))w.revision++;emitNoise(s,s.roomId,exit,'hatch','link:'+exit.linkId,400);log(s,'link-closed',{id:exit.linkId,room:s.roomId});return {ok:true,reason:'Liaison isolée. Le contact ne peut plus franchir ce sas.'};
}
export function openLink(s,exit){if(!N.canOpen(s,exit.linkId))return false;const state=s.contacts.links[exit.linkId];state.open=true;state.changedAt=s.elapsed;syncHatches(s);for(const w of Object.values(s.worlds))w.revision++;emitNoise(s,s.roomId,exit,'hatch','link:'+exit.linkId,500);log(s,'link-open',{id:exit.linkId,room:s.roomId});}
export function tickContact(s,dt){const c=s.contacts;c.tracker.cooldown=Math.max(0,c.tracker.cooldown-dt);c.tracker.age=Math.min(20,c.tracker.age+dt);c.noises=c.noises.filter(n=>s.elapsed-n.at<=RULES.memory);if(c.tracker.age>2)c.tracker.samples=[];}
export function pulse(s){if(s.paused||s.status!=='active'||s.contacts.tracker.cooldown>0)return {ok:false,reason:'Détecteur indisponible ou en recharge.'};
 const w=s.worlds[s.roomId],p=s.team[0],samples=[];for(const a of w.actors){if(!a.alive||a.kind!=='enemy')continue;const b=s.contacts.brains[a.id],r=S.distance(a,p);if(r>RULES.trackerRange||s.elapsed-b.lastStep>.35||b.speed<1)continue;
  const angle=Math.atan2(a.z-p.z,a.x-p.x);samples.push({bearing:(Math.round(angle/(Math.PI/4))+8)%8,range:Math.ceil(r/100)*100});}
 Object.assign(s.contacts.tracker,{cooldown:RULES.pulseCooldown,age:0,samples:samples.slice(0,16),pulses:s.contacts.tracker.pulses+1});emitNoise(s,s.roomId,p,'tracker','ripley',100);return {ok:true,reason:samples.length?`${samples.length} écho(s) de mouvement — portée approximative.`:'Aucun mouvement relevé. Un contact immobile reste invisible.'};
}
export function localSignal(s){const recent=s.contacts.noises.filter(n=>n.roomId===s.roomId&&s.elapsed-n.at<1.7).at(-1);return recent?recent.kind==='shot'?'COUPS DE FEU':recent.kind==='footstep'?'PAS AUDIBLES':recent.kind==='tracker'?'IMPULSION':'MÉCANISME':'CALME LOCAL';}

export function validateContact(s,c){
 const finite=x=>typeof x==='number'&&Number.isFinite(x),rec=x=>x&&typeof x==='object'&&!Array.isArray(x),only=(o,keys)=>rec(o)&&Object.keys(o).length===keys.length&&Object.keys(o).every(k=>keys.includes(k)),num=(n,a,b)=>finite(n)&&n>=a&&n<=b;
 const fail=reason=>({ok:false,reason:'Contacts : '+reason});
 if(!only(c,['schema','pace','stride','footAt','serial','noises','brains','links','tracker','metrics'])||c.schema!==108||!['normal','careful'].includes(c.pace)||!num(c.stride,0,100000)||!num(c.footAt,0,s.elapsed)||!Number.isInteger(c.serial)||c.serial<0||c.serial>1e9)return fail('entête invalide');
 if(!only(c.links,LINKS.map(l=>l.id)))return fail('registre de liaisons incomplet');for(const l of LINKS){const st=c.links[l.id];if(!only(st,['open','changedAt'])||typeof st.open!=='boolean'||!num(st.changedAt,0,s.elapsed))return fail('sas incohérent');}
 if(!only(c.brains,enemyIds))return fail('registre de menaces incomplet');
 const actorRoom=id=>Object.values(s.worlds).find(w=>w.actors.some(a=>a.id===id));
 for(const id of enemyIds){const b=c.brains[id],w=actorRoom(id);if(!w||!only(b,['mode','stimulus','searchUntil','searchStep','nextPathAt','travel','speed','lastStep'])||!['idle','investigate','hunt','search','dead'].includes(b.mode)||!num(b.searchUntil,0,s.elapsed+6)||!Number.isInteger(b.searchStep)||b.searchStep<0||b.searchStep>4||!num(b.nextPathAt,0,s.elapsed+2)||!num(b.speed,0,500)||!num(b.lastStep,0,s.elapsed))return fail('mémoire de menace invalide');
  if(b.stimulus!==null){const k=b.stimulus,target=s.worlds[k?.roomId];if(!only(k,['roomId','x','z','at','expires','kind'])||!target||!num(k.x,0,target.scene.width)||!num(k.z,0,target.scene.depth)||!num(k.at,0,s.elapsed)||!num(k.expires,k.at,k.at+RULES.memory+.001)||!['sight','sound','trail'].includes(k.kind))return fail('stimulus invalide');}
  if(b.travel!==null){const t=b.travel,e=exitsFor(w.scene.id).find(e=>e.id===t?.exitId),a=w.actors.find(a=>a.id===id);if(!only(t,['exitId','elapsed'])||!e||!c.links[e.linkId].open||!num(t.elapsed,0,RULES.crossing)||!a.alive||S.distance(a,e)>20||b.stimulus===null)return fail('franchissement incohérent');}
 }
 if(!Array.isArray(c.noises)||c.noises.length>16)return fail('file acoustique invalide');let seq=0;for(const n of c.noises){const w=s.worlds[n?.roomId];if(!only(n,['seq','roomId','x','z','kind','source','at','radius'])||!w||!Number.isInteger(n.seq)||n.seq<=seq||n.seq>c.serial||!num(n.x,0,w.scene.width)||!num(n.z,0,w.scene.depth)||!num(n.at,0,s.elapsed)||!num(n.radius,1,2000)||!['shot','footstep','door','hatch','tracker','control','crate','equipment','diagnostic'].includes(n.kind)||typeof n.source!=='string'||n.source.length>96)return fail('bruit invalide');seq=n.seq;}
 const t=c.tracker;if(!only(t,['cooldown','age','samples','pulses'])||!num(t.cooldown,0,RULES.pulseCooldown+.001)||!num(t.age,0,20)||!Number.isInteger(t.pulses)||t.pulses<0||t.pulses>1e9||!Array.isArray(t.samples)||t.samples.length>16)return fail('détecteur invalide');for(const e of t.samples)if(!only(e,['bearing','range'])||!Number.isInteger(e.bearing)||e.bearing<0||e.bearing>7||!Number.isInteger(e.range)||e.range<100||e.range>RULES.trackerRange||e.range%100)return fail('écho invalide');
 if(!only(c.metrics,['noises','heard','sightings','transfers','blockedPassages','seals','searches'])||Object.values(c.metrics).some(n=>!Number.isInteger(n)||n<0||n>1e9))return fail('télémétrie invalide');
 return {ok:true};
}

// Player-facing perception is read-only; the map never consumes the AI memories.
export function observed(s,w,actor){return w.actors.some(a=>a.alive&&['player','ally','escort'].includes(a.kind)&&a.role!=='sentry'&&(a.kind!=='escort'||a.recruited)&&S.distance(a,actor)<=620&&S.visible(w,a,actor));}

export function hatchBox(e){const vertical=e.x<100||e.x>1340;return {id:'hatch:'+e.id,x:e.x-(vertical?12:37),z:e.z-(vertical?37:12),w:vertical?24:74,d:vertical?74:24,h:155,material:'metal',blocksSight:true,blocksProjectiles:true};}
export function syncHatches(s){for(const w of Object.values(s.worlds))w.runtimeSolids=exitsFor(w.scene.id).filter(e=>!linkOpen(s,e.linkId)).map(hatchBox);}
export function atLinkControl(w,p,e){return S.distance(p,e)<=80&&!S.activeSolids(w).some(b=>b.id!==hatchBox(e).id&&S.segmentBox(p,e,b,p.radius)!==null);}

N.bindContact(Object.freeze({atLinkControl,hatchBox,emitNoise,syncHatches,linkOpen,nextExit,go,cross}));
