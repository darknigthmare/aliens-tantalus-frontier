/* V110 — physical hatch integrity, finite reinforcement, telegraphed breaches.
   Only reciprocal operation hatches are affected. Native/internal story doors
   and the Sulaco finale remain outside this module. No actors are spawned. */
import * as S from './spatial-core-v108.mjs';
// Bound once by contact-v110 after its declarations. This breaks the ESM
// dependency cycle and permits the offline Blob module bundle.
let T;
export function bindContact(api){if(T&&T!==api)throw new Error('Contact API already bound');T=api;}
import {ROOMS,LINKS,exitsFor} from './operation-scenes-v112.mjs';
export const RULES=Object.freeze({hull:100,brace:72,hit:28,windup:.8,recovery:.7,reach:84,stockTime:1.1,braceTime:1.8,cutTime:1.4,repairTime:2.2,noisePeriod:.4});
export const STOCK=Object.freeze({id:'service-plates',roomId:'v107-service',propId:'service-crate',bodyId:'cable-rack',x:837,z:314,reach:82,grant:3,name:'Renforts de maintenance'});
const clone=x=>structuredClone(x),record=o=>o&&typeof o==='object'&&!Array.isArray(o),finite=x=>typeof x==='number'&&Number.isFinite(x);
const exact=(o,keys)=>record(o)&&Object.keys(o).length===keys.length&&Object.keys(o).every(k=>keys.includes(k));
const bounded=(x,a,b)=>finite(x)&&x>=a&&x<=b;
const log=(s,type,data={})=>{s.events.push({type,time:s.elapsed,...data});if(s.events.length>60)s.events.shift();};
const enemyIds=ROOMS.flatMap(r=>r.actors.filter(a=>a.kind==='enemy').map(a=>a.id));
export function createEngineering(){return {schema:110,collected:false,plates:0,spent:0,links:Object.fromEntries(LINKS.map(l=>[l.id,{hp:RULES.hull,brace:0,breached:false,hits:0,lastImpact:0}])),attacks:Object.fromEntries(enemyIds.map(id=>[id,null])),metrics:{stocks:0,reinforced:0,cut:0,repaired:0,started:0,interrupted:0,enemyHits:0,breaches:0}};}
export const isAction=a=>a&&['engineering-stock','brace','cut-brace','repair-hatch'].includes(a.kind);
const duration=k=>({'engineering-stock':RULES.stockTime,brace:RULES.braceTime,'cut-brace':RULES.cutTime,'repair-hatch':RULES.repairTime}[k]);
const p=s=>s.team[0];
function stockReach(s){const a=p(s),w=s.worlds[s.roomId];return s.roomId===STOCK.roomId&&S.distance(a,STOCK)<=STOCK.reach&&!S.activeSolids(w).some(b=>b.id!==STOCK.bodyId&&S.segmentBox(a,STOCK,b)!==null);}
export function nearest(s){if(s.mode!=='operation')return null;const w=s.worlds[s.roomId],a=p(s);return exitsFor(s.roomId).filter(e=>T.atLinkControl(w,a,e)).sort((a,b)=>S.distance(p(s),a)-S.distance(p(s),b))[0]||null;}
export function safeThreshold(s,linkId){const pair=LINKS.find(l=>l.id===linkId);if(!pair)return false;for(const end of [pair.a,pair.b])if(s.worlds[end.room].actors.some(a=>a.alive&&S.segmentBox(a,a,T.hatchBox(end),a.radius+3)!==null))return false;return !Object.values(s.contacts.brains).some(b=>b.travel&&[pair.a.id,pair.b.id].includes(b.travel.exitId));}
function eligible(s,kind,e){const h=s.engineering.links[e?.linkId];if(!h)return {ok:false,reason:'Approchez le contrôle d’un sas de liaison.'};
 if(kind==='brace'){
  if(s.contacts.links[e.linkId].open)return {ok:false,reason:'Fermez le sas avec R avant de poser un renfort.'};
  if(h.breached||h.hp<RULES.hull)return {ok:false,reason:'Réparez le battant endommagé avant de le renforcer.'};
  if(h.brace>0)return {ok:false,reason:'Renfort déjà en place ; aucune plaque supplémentaire nécessaire.'};
 }else if(kind==='cut-brace'){if(!h.brace)return {ok:false,reason:'Aucun renfort à découper. Utilisez R sur un sas intact.'};}
 else if(kind==='repair-hatch'){
  if(!h.breached&&h.hp===RULES.hull)return {ok:false,reason:'Battant intact : aucune réparation nécessaire.'};
  if(!safeThreshold(s,e.linkId))return {ok:false,reason:'Débouchez les deux faces du seuil avant de reconstruire le battant.'};
 }
 if(kind!=='cut-brace'&&s.engineering.plates<1)return {ok:false,reason:'Aucune plaque disponible. Cherchez les renforts de maintenance.'};
 return {ok:true};
}
export function begin(s,kind){if(s.paused||s.status!=='active'||s.action||!p(s)?.alive||!isAction({kind}))return {ok:false,reason:'Geste indisponible ou déjà en cours.'};
 let e=null;if(kind==='engineering-stock'){
  if(!stockReach(s))return {ok:false,reason:'Approchez la caisse sur la table de câblage.'};
  if(s.engineering.collected)return {ok:false,reason:'Renforts déjà récupérés. Cette caisse ne se remplit pas seule.'};
 }else{e=nearest(s);const check=eligible(s,kind,e);if(!check.ok)return check;}
 const h=e?s.engineering.links[e.linkId]:null,a=p(s);
 s.transition=null;s.action={kind,roomId:s.roomId,id:e?.id||STOCK.id,linkId:e?.linkId||null,elapsed:0,duration:duration(kind),x:a.x,z:a.z,hp:a.hp,linkHp:h?.hp||0,brace:h?.brace||0};
 s.engineering.metrics.started++;s.lastReason=({'engineering-stock':'Déverrouillage de la caisse',brace:'Soudure du renfort','cut-brace':'Découpe du renfort','repair-hatch':'Réfection du battant'}[kind])+' en cours. Un impact ou un déplacement interrompt le geste.';
 log(s,'engineering-start',{kind,linkId:e?.linkId||null});return {ok:true,reason:s.lastReason};
}
export function nearbyUse(s){return stockReach(s)?begin(s,'engineering-stock'):null;}
const actionKeys=['kind','roomId','id','linkId','elapsed','duration','x','z','hp','linkHp','brace'];
export function checkExecution(s,a){if(!exact(a,actionKeys)||!isAction(a)||a.roomId!==s.roomId||![a.elapsed,a.duration,a.x,a.z,a.hp,a.linkHp,a.brace].every(finite)||a.duration!==duration(a.kind)||a.elapsed<0||a.elapsed>=a.duration)return {ok:false,reason:'Geste technique invalide.'};
 if(!p(s).alive||S.distance(p(s),a)>2||p(s).hp!==a.hp)return {ok:false,reason:'Geste technique interrompu : déplacement ou impact.'};
 if(a.kind==='engineering-stock')return a.id===STOCK.id&&a.linkId===null&&a.linkHp===0&&a.brace===0&&stockReach(s)&&!s.engineering.collected?{ok:true}:{ok:false,reason:'Caisse technique indisponible.'};
 const e=exitsFor(s.roomId).find(e=>e.id===a.id&&e.linkId===a.linkId);if(!e||!T.atLinkControl(s.worlds[s.roomId],p(s),e))return {ok:false,reason:'Contrôle de sas devenu inaccessible.'};
 const check=eligible(s,a.kind,e);if(!check.ok)return check;const h=s.engineering.links[a.linkId];if(h.hp!==a.linkHp||h.brace!==a.brace)return {ok:false,reason:'Le battant a subi un impact : reprenez la préparation.'};return {ok:true};
}
export function cancel(s,reason){if(!isAction(s.action))return false;s.engineering.metrics.interrupted++;s.stats.opensCancelled++;log(s,'engineering-cancel',{kind:s.action.kind,reason});s.action=null;s.lastReason=reason;return true;}
function refresh(s){T.syncHatches(s);for(const w of Object.values(s.worlds))w.revision++;}
export function advanceAction(s,dt){const a=s.action;if(!isAction(a))return false;const check=checkExecution(s,a);if(!check.ok){cancel(s,check.reason);return true;}
 const old=a.elapsed;a.elapsed+=dt;
 if(a.kind!=='engineering-stock'&&Math.floor(a.elapsed/RULES.noisePeriod)>Math.floor(old/RULES.noisePeriod))T.emitNoise(s,s.roomId,p(s),'equipment','engineering:'+a.kind,540);
 if(a.elapsed+1e-8<a.duration)return true;
 if(a.kind==='engineering-stock'){s.engineering.collected=true;s.engineering.plates+=STOCK.grant;s.engineering.metrics.stocks++;s.lastReason='Trois plaques récupérées. Les renforts et les réfections consomment cette réserve.';T.emitNoise(s,s.roomId,p(s),'crate',STOCK.id,400);}
 else{const h=s.engineering.links[a.linkId],gate=s.contacts.links[a.linkId];
  if(a.kind==='brace'){h.brace=RULES.brace;s.engineering.plates--;s.engineering.spent++;s.engineering.metrics.reinforced++;s.lastReason='Sas renforcé : la plaque absorbera les premiers chocs. Il faut la découper pour rouvrir.';}
  if(a.kind==='cut-brace'){h.brace=0;gate.open=true;gate.changedAt=s.elapsed;s.engineering.metrics.cut++;s.lastReason='Renfort retiré, passage ouvert. Aucune plaque récupérée.';}
  if(a.kind==='repair-hatch'){Object.assign(h,{hp:RULES.hull,brace:0,breached:false});gate.open=false;gate.changedAt=s.elapsed;s.engineering.plates--;s.engineering.spent++;s.engineering.metrics.repaired++;s.lastReason='Battant reconstitué et fermé. Le seuil est de nouveau isolé.';}
  // Opening or reconstruction cancels queued impacts; no strike can hit a new
  // panel using an old, now invalid windup.
  for(const id of enemyIds)if(s.engineering.attacks[id]?.linkId===a.linkId)s.engineering.attacks[id]=null;
  refresh(s);T.emitNoise(s,s.roomId,p(s),'equipment','engineering:'+a.kind,540);
 }
 log(s,'engineering-complete',{kind:a.kind,linkId:a.linkId});s.action=null;return true;
}
export function canOpen(s,id){const h=s.engineering?.links[id];return !h||h.brace===0;}
export function canClose(s,id){return !s.engineering?.links[id]?.breached;}
function nextIncludingClosed(from,to){if(from===to)return null;const q=[{room:from,first:null}],seen=new Set([from]);while(q.length){const {room,first}=q.shift();for(const e of exitsFor(room)){if(seen.has(e.to.room))continue;const f=first||e;if(e.to.room===to)return f;seen.add(e.to.room);q.push({room:e.to.room,first:f});}}return null;}
export function approach(w,a,e){const vertical=e.x<100||e.x>1340,dir=vertical?(e.x<w.scene.width/2?1:-1):(e.z<w.scene.depth/2?1:-1),gap=12+a.radius+11;
 for(const sideways of [0,-22,22]){const q=vertical?{x:e.x+dir*gap,z:e.z+sideways}:{x:e.x+sideways,z:e.z+dir*gap};if(S.canStand(w,q,a.radius)&&!S.activeSolids(w).some(b=>b.id!==T.hatchBox(e).id&&S.segmentBox(q,e,b)!==null))return q;}return null;}
function atFace(w,a,e){return S.distance(a,e)<=RULES.reach&&!S.activeSolids(w).some(b=>b.id!==T.hatchBox(e).id&&S.segmentBox(a,e,b)!==null);}
function hit(s,w,a,e){const h=s.engineering.links[e.linkId],gate=s.contacts.links[e.linkId];if(gate.open||h.breached||!atFace(w,a,e))return;
 let damage=RULES.hit;if(h.brace>0){const absorb=Math.min(damage,h.brace);h.brace-=absorb;damage-=absorb;}h.hp=Math.max(0,h.hp-damage);h.hits++;h.lastImpact=s.elapsed;s.engineering.metrics.enemyHits++;
 // Self-generated noise must never replace the striker's remembered trail.
 T.emitNoise(s,w.scene.id,a,'hatch',a.id,650);
 if(h.hp===0){h.breached=true;h.brace=0;gate.open=true;gate.changedAt=s.elapsed;s.engineering.metrics.breaches++;refresh(s);for(const id of enemyIds)if(s.engineering.attacks[id]?.linkId===e.linkId)s.engineering.attacks[id]=null;log(s,'hatch-breached',{id:e.linkId,by:a.id,room:w.scene.id});}
 else log(s,'hatch-hit',{id:e.linkId,by:a.id,hp:h.hp,brace:h.brace,room:w.scene.id});
 if([w.scene.id,e.to.room].includes(s.roomId))s.lastReason=h.breached?'Le sas vient de céder. Le passage est ouvert.':'Choc contre un sas de liaison. Le battant ne tiendra pas indéfiniment.';
}
export function tryBreach(s,w,a,dt){if(!s.engineering||s.mode!=='operation')return false;if(a.role!=='warrior'){s.engineering.attacks[a.id]=null;return false;}const brain=s.contacts.brains[a.id],memory=brain?.stimulus;
 if(!a.alive||!memory||memory.roomId===w.scene.id||s.elapsed>memory.expires||brain.mode==='search'){s.engineering.attacks[a.id]=null;return false;}
 if(T.nextExit(s,w.scene.id,memory.roomId)){s.engineering.attacks[a.id]=null;return false;}
 const e=nextIncludingClosed(w.scene.id,memory.roomId);if(!e){s.engineering.attacks[a.id]=null;return false;}
 if(T.linkOpen(s,e.linkId)){s.engineering.attacks[a.id]=null;if(S.distance(a,e)<18&&!S.trace(w,a,e,a.radius))T.cross(s,w,a,e,dt);else{brain.travel=null;T.go(s,w,a,e,dt);}return true;}
 brain.travel=null;const goal=approach(w,a,e);if(!goal)return true;
 if(S.distance(a,goal)>8||!atFace(w,a,e)){s.engineering.attacks[a.id]=null;T.go(s,w,a,goal,dt);return true;}
 let action=s.engineering.attacks[a.id];
 if(!action||action.linkId!==e.linkId){action={linkId:e.linkId,exitId:e.id,phase:'windup',remaining:RULES.windup,x:a.x,z:a.z};s.engineering.attacks[a.id]=action;log(s,'breach-windup',{id:a.id,linkId:e.linkId,room:w.scene.id});}
 if(S.distance(a,action)>3){s.engineering.attacks[a.id]=null;return true;}
 action.remaining=Math.max(0,action.remaining-dt);if(action.remaining>1e-8)return true;
 if(action.phase==='windup'){hit(s,w,a,e);if(!T.linkOpen(s,e.linkId))s.engineering.attacks[a.id]={...action,phase:'recover',remaining:RULES.recovery};}
 else s.engineering.attacks[a.id]=null;return true;
}
export function prune(s){for(const id of enemyIds){const act=s.engineering.attacks[id];if(!act)continue;const w=Object.values(s.worlds).find(w=>w.actors.some(a=>a.id===id)),a=w?.actors.find(a=>a.id===id),b=s.contacts.brains[id];if(!a?.alive||a.phase==='recover'||a.phase==='windup'||!b?.stimulus||b.stimulus.expires<s.elapsed||s.contacts.links[act.linkId].open)s.engineering.attacks[id]=null;}}
export function validate(s,raw){const fail=reason=>({ok:false,reason:'Génie : '+reason});if(!exact(raw,['schema','collected','plates','spent','links','attacks','metrics'])||raw.schema!==110||typeof raw.collected!=='boolean'||!Number.isInteger(raw.plates)||!Number.isInteger(raw.spent)||raw.plates<0||raw.spent<0||raw.plates+raw.spent!==(raw.collected?STOCK.grant:0)||raw.collected&&!s.visitedRooms.includes(STOCK.roomId))return fail('réserve invalide');
 const metricKeys=['stocks','reinforced','cut','repaired','started','interrupted','enemyHits','breaches'];if(!exact(raw.metrics,metricKeys)||Object.values(raw.metrics).some(v=>!Number.isInteger(v)||v<0||v>1e7)||raw.metrics.stocks!==Number(raw.collected)||raw.metrics.reinforced+raw.metrics.repaired!==raw.spent||raw.metrics.cut>raw.metrics.reinforced||raw.metrics.started<raw.metrics.stocks+raw.metrics.reinforced+raw.metrics.cut+raw.metrics.repaired+raw.metrics.interrupted)return fail('bilan des gestes invalide');
 if(!exact(raw.links,LINKS.map(l=>l.id)))return fail('registre des battants incomplet');let hits=0,broken=0;
 for(const l of LINKS){const h=raw.links[l.id],gate=s.contacts.links[l.id];if(!exact(h,['hp','brace','breached','hits','lastImpact'])||!Number.isInteger(h.hp)||!bounded(h.hp,0,RULES.hull)||!Number.isInteger(h.brace)||!bounded(h.brace,0,RULES.brace)||typeof h.breached!=='boolean'||h.breached!==(h.hp===0)||h.breached&&(!gate.open||h.brace!==0)||h.brace>0&&(gate.open||h.hp!==RULES.hull)||!Number.isInteger(h.hits)||!bounded(h.hits,0,1e7)||!bounded(h.lastImpact,0,s.elapsed)||h.hits===0&&(h.lastImpact!==0||h.hp!==RULES.hull))return fail('état de battant incohérent');hits+=h.hits;broken+=Number(h.breached);}
 if(raw.metrics.enemyHits!==hits||raw.metrics.breaches<broken||raw.metrics.breaches>Math.floor(hits/4))return fail('bilan des impacts invalide');
 if(!exact(raw.attacks,enemyIds))return fail('registre de pression incomplet');for(const id of enemyIds){const t=raw.attacks[id];if(t===null)continue;const w=Object.values(s.worlds).find(w=>w.actors.some(a=>a.id===id)),a=w?.actors.find(a=>a.id===id),b=s.contacts.brains[id],e=exitsFor(w?.scene.id).find(e=>e.id===t.exitId&&e.linkId===t.linkId);
 if(!exact(t,['linkId','exitId','phase','remaining','x','z'])||!e||!a?.alive||a.role!=='warrior'||a.phase!=='idle'||!['windup','recover'].includes(t.phase)||!bounded(t.remaining,0,t.phase==='windup'?RULES.windup:RULES.recovery)||![t.x,t.z].every(finite)||S.distance(a,t)>3||!b?.stimulus||b.stimulus.roomId===w.scene.id||b.stimulus.expires<s.elapsed||s.contacts.links[t.linkId].open||!atFace(w,a,e))return fail('coup préparé invalide');}
 return {ok:true};
}
export function brief(s){const e=nearest(s),h=e?s.engineering.links[e.linkId]:null;return {plates:s.engineering.plates,spent:s.engineering.spent,collected:s.engineering.collected,nearby:e?{id:e.linkId,label:e.label,open:T.linkOpen(s,e.linkId),...clone(h)}:null,metrics:clone(s.engineering.metrics)};}
