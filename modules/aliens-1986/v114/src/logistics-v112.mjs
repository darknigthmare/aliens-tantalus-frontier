/* V109 — finite supplies and field work. No spawn, healing or ammunition is
   granted on room entry, checkpoint, import, interruption or inspection switch. */
import * as S from './spatial-core-v108.mjs';
import * as T from './contact-v112.mjs';
import {STOCKS,ALARMS,ROOMS} from './operation-scenes-v112.mjs';
export const RULES=Object.freeze({stockTime:1.05,medicalTime:1.6,ammoTime:.85,sentryTime:1.35,alarmTime:.65,medicalAmount:30,ammoAmount:18,sentryAmount:40,ammoCap:96,sentryCap:120,fieldReach:86,alarmDuration:8,alarmCooldown:20,alarmPeriod:1.5,alarmRange:1750});
const clone=x=>structuredClone(x),finite=x=>typeof x==='number'&&Number.isFinite(x),record=x=>x&&typeof x==='object'&&!Array.isArray(x);
const exact=(o,keys)=>record(o)&&Object.keys(o).length===keys.length&&Object.keys(o).every(k=>keys.includes(k));
const modes=['stock','medical','ammo','sentry','alarm'];
const actionKeys=['kind','roomId','id','targetId','elapsed','duration','x','z','hp','targetX','targetZ','targetHp','targetAmmo'];
const log=(s,type,detail={})=>{s.events.push({type,time:s.elapsed,...detail});if(s.events.length>60)s.events.shift();};
export function createLogistics(){return {schema:109,collected:[],inventory:{ammo:0,medical:0,sentry:0},spent:{ammo:0,medical:0,sentry:0},alarms:Object.fromEntries(ALARMS.map(a=>[a.id,{remaining:0,cooldown:0,nextPulse:0,activations:0}])),metrics:{opened:0,medical:0,ammo:0,sentry:0,interrupted:0}};}
export const isAction=a=>a&&modes.includes(a.kind);
const player=s=>s.team.find(a=>a.kind==='player');
const reachable=(w,p,q,range)=>S.distance(p,q)<=range&&S.visible(w,p,q)&&!S.activeSolids(w).filter(b=>b.id!==q.bodyId&&b.blocksProjectiles!==false).some(b=>S.segmentBox(p,q,b)!==null);
export function targetFor(s,id){return s.worlds[s.roomId].actors.find(a=>a.id===id)||null;}
function duration(kind){return RULES[kind+'Time'];}
function validTarget(s,kind,targetId){
 const p=player(s),w=s.worlds[s.roomId],a=targetFor(s,targetId);
 if(!a||!a.alive||a.kind==='enemy'||a.kind==='escort'&&!a.recruited||a.roomId&&a.roomId!==s.roomId)return {ok:false,reason:'Cible absente ou indisponible.'};
 if(!reachable(w,p,a,RULES.fieldReach))return {ok:false,reason:'Rapprochez-vous de la cible avec un passage libre.'};
 if(kind==='medical'&&(a.role==='sentry'||a.hp>=100))return {ok:false,reason:a.role==='sentry'?'Une trousse ne répare pas une tourelle.':'Aucun soin nécessaire.'};
 if(kind==='ammo'&&(a.kind==='escort'||a.role==='sentry'||a.ammo>=RULES.ammoCap))return {ok:false,reason:a.kind==='escort'?'Newt ne reçoit aucune arme.':'Réserve personnelle pleine ou cible incompatible.'};
 if(kind==='sentry'&&(a.role!=='sentry'||a.ammo>=RULES.sentryCap))return {ok:false,reason:'Approchez une sentinelle vivante dont la réserve est entamée.'};
 return {ok:true,target:a};
}
export function begin(s,kind,targetId=null,id=null){
 if(s.paused||s.status!=='active'||s.action||!modes.includes(kind))return {ok:false,reason:'Action indisponible ou geste déjà en cours.'};
 const p=player(s),w=s.worlds[s.roomId];if(!p?.alive)return {ok:false,reason:'Opérateur indisponible.'};
 let target=null;
 if(kind==='stock'){
  const stock=STOCKS.find(x=>x.id===id&&x.roomId===s.roomId);if(!stock||!reachable(w,p,stock,stock.reach))return {ok:false,reason:'Approchez les scellés.'};
  if(s.logistics.collected.includes(id))return {ok:false,reason:'Réserve déjà récupérée ; aucun réapprovisionnement automatique.'};
 }else if(kind==='alarm'){
  const alarm=ALARMS.find(x=>x.id===id&&x.roomId===s.roomId);if(!alarm||!reachable(w,p,alarm,alarm.reach))return {ok:false,reason:'Approchez la commande de diagnostic.'};
  if(s.logistics.alarms[id].cooldown>0)return {ok:false,reason:'Le diagnostic sonore est en refroidissement.'};
 }else{
  const check=validTarget(s,kind,targetId);if(!check.ok)return check;target=check.target;
  if(s.logistics.inventory[kind]<=0)return {ok:false,reason:'Aucune réserve de ce type. Fouillez la galerie et la réserve technique.'};
 }
 s.transition=null;s.action={kind,roomId:s.roomId,id:id||null,targetId:target?.id||null,elapsed:0,duration:duration(kind),x:p.x,z:p.z,hp:p.hp,targetX:target?.x||0,targetZ:target?.z||0,targetHp:target?.hp||0,targetAmmo:target?.ammo||0};
 const labels={stock:'Ouverture des scellés',medical:'Soin de terrain',ammo:'Ravitaillement personnel',sentry:'Alimentation de la sentinelle',alarm:'Diagnostic sonore'};
 s.lastReason=labels[kind]+' en cours. Restez en place ; un impact interrompt le geste.';log(s,'field-start',{kind,id,targetId});return {ok:true,reason:s.lastReason};
}
export function nearbyUse(s){
 const p=player(s),w=s.worlds[s.roomId];const candidates=[...STOCKS.filter(x=>x.roomId===s.roomId).map(x=>({...x,kind:'stock'})),...ALARMS.filter(x=>x.roomId===s.roomId).map(x=>({...x,kind:'alarm'}))].filter(x=>reachable(w,p,x,x.reach)).sort((a,b)=>S.distance(a,p)-S.distance(b,p));
 return candidates.length?begin(s,candidates[0].kind,null,candidates[0].id):null;
}
export function checkExecution(s,a){
 if(!exact(a,actionKeys)||!modes.includes(a.kind)||a.roomId!==s.roomId||![a.elapsed,a.duration,a.x,a.z,a.hp,a.targetX,a.targetZ,a.targetHp,a.targetAmmo].every(finite)||a.duration!==duration(a.kind)||a.elapsed<0||a.elapsed>=a.duration)return {ok:false,reason:'Contrat de geste de terrain invalide.'};
 const p=player(s),w=s.worlds[s.roomId];if(!p.alive||S.distance(p,a)>2||a.hp!==p.hp)return {ok:false,reason:'Geste interrompu : déplacement ou impact.'};
 if(a.kind==='stock'||a.kind==='alarm'){
  if(a.targetId!==null||a.targetX!==0||a.targetZ!==0||a.targetHp!==0||a.targetAmmo!==0)return {ok:false,reason:'Cible inattendue dans le geste.'};
  const d=(a.kind==='stock'?STOCKS:ALARMS).find(x=>x.id===a.id&&x.roomId===s.roomId);
  if(!d||!reachable(w,p,d,d.reach))return {ok:false,reason:'Commande devenue inaccessible.'};
  if(a.kind==='stock'&&s.logistics.collected.includes(d.id)||a.kind==='alarm'&&s.logistics.alarms[d.id].cooldown>0)return {ok:false,reason:'Réserve ou alarme indisponible.'};
 }else{
  if(a.id!==null||s.logistics.inventory[a.kind]<=0)return {ok:false,reason:'Réserve indisponible.'};
  const check=validTarget(s,a.kind,a.targetId);if(!check.ok)return check;const t=check.target;
  if(S.distance(t,{x:a.targetX,z:a.targetZ})>2||t.hp!==a.targetHp||t.ammo!==a.targetAmmo)return {ok:false,reason:'Geste interrompu : la cible a bougé, tiré ou subi un coup.'};
 }
 return {ok:true};
}
export function advanceAction(s,dt){const a=s.action;if(!isAction(a))return false;const check=checkExecution(s,a);
 if(!check.ok){s.action=null;s.stats.opensCancelled++;s.logistics.metrics.interrupted++;s.lastReason=check.reason;log(s,'field-cancelled',{kind:a.kind,reason:check.reason});return true;}
 a.elapsed+=dt;if(a.elapsed+1e-8<a.duration)return true;
 const p=player(s);let amount=0;
 if(a.kind==='stock'){
  const stock=STOCKS.find(x=>x.id===a.id);for(const k of ['ammo','medical','sentry'])s.logistics.inventory[k]+=stock.grant[k];s.logistics.collected.push(stock.id);s.logistics.metrics.opened++;
  s.lastReason=stock.name+' récupérée. Stock commun limité.';T.emitNoise(s,s.roomId,p,'crate',stock.id,420);
 }else if(a.kind==='alarm'){
  const alarm=s.logistics.alarms[a.id];Object.assign(alarm,{remaining:RULES.alarmDuration,cooldown:RULES.alarmCooldown,nextPulse:0,activations:alarm.activations+1});s.lastReason='Diagnostic sonore actif huit secondes. Les contacts peuvent converger par les voies ouvertes.';
 }else{
  const t=targetFor(s,a.targetId);s.logistics.inventory[a.kind]--;s.logistics.spent[a.kind]++;s.logistics.metrics[a.kind]++;
  if(a.kind==='medical'){amount=Math.min(RULES.medicalAmount,100-t.hp);t.hp+=amount;}else{const cap=a.kind==='sentry'?RULES.sentryCap:RULES.ammoCap;amount=Math.min(RULES[a.kind+'Amount'],cap-t.ammo);t.ammo+=amount;}
  s.lastReason=t.name+' : +'+amount+(a.kind==='medical'?' PV.':' munitions.');
  T.emitNoise(s,s.roomId,p,'equipment','field-'+a.kind,180);
 }
 log(s,'field-complete',{kind:a.kind,id:a.id,targetId:a.targetId,amount});s.action=null;return true;
}
export function tick(s,dt){for(const d of ALARMS){const a=s.logistics.alarms[d.id];a.cooldown=Math.max(0,a.cooldown-dt);if(a.remaining>0){a.remaining=Math.max(0,a.remaining-dt);a.nextPulse-=dt;if(a.nextPulse<=0){if(s.mode==='operation'||s.roomId===d.roomId)T.emitNoise(s,d.roomId,d.emitter||d,'diagnostic',d.id,RULES.alarmRange);a.nextPulse=RULES.alarmPeriod;}}else a.nextPulse=0;}}
export function validate(s,raw){const fail=reason=>({ok:false,reason});
 if(!exact(raw,['schema','collected','inventory','spent','alarms','metrics'])||raw.schema!==109||!Array.isArray(raw.collected)||new Set(raw.collected).size!==raw.collected.length||raw.collected.some(id=>!STOCKS.some(x=>x.id===id&&s.visitedRooms.includes(x.roomId))))return fail('Registre de stocks invalide.');
 const expected={ammo:0,medical:0,sentry:0};for(const id of raw.collected){const d=STOCKS.find(x=>x.id===id);for(const k in expected)expected[k]+=d.grant[k];}
 for(const obj of [raw.inventory,raw.spent])if(!exact(obj,['ammo','medical','sentry'])||Object.values(obj).some(v=>!Number.isInteger(v)||v<0||v>9))return fail('Quantité de réserve invalide.');
 for(const k in expected)if(raw.inventory[k]+raw.spent[k]!==expected[k])return fail('Stock consommé et collecté incohérent.');
 if(!exact(raw.metrics,['opened','medical','ammo','sentry','interrupted'])||Object.values(raw.metrics).some(v=>!Number.isInteger(v)||v<0||v>1e7)||raw.metrics.opened!==raw.collected.length||['ammo','medical','sentry'].some(k=>raw.metrics[k]!==raw.spent[k]))return fail('Télémétrie de terrain invalide.');
 if(!exact(raw.alarms,ALARMS.map(a=>a.id)))return fail('Registre des alarmes invalide.');
 for(const d of ALARMS){const a=raw.alarms[d.id];if(!exact(a,['remaining','cooldown','nextPulse','activations'])||![a.remaining,a.cooldown,a.nextPulse,a.activations].every(finite)||a.remaining<0||a.remaining>RULES.alarmDuration||a.cooldown<0||a.cooldown>RULES.alarmCooldown||a.nextPulse<0||a.nextPulse>RULES.alarmPeriod||!Number.isInteger(a.activations)||a.activations<0||a.activations>1e6||a.remaining>a.cooldown||a.activations===0&&(a.remaining>0||a.cooldown>0)||a.activations>0&&!s.visitedRooms.includes(d.roomId))return fail('État de diagnostic invalide.');}
 return {ok:true};
}
export function brief(s){return {stock:clone(s.logistics.inventory),spent:clone(s.logistics.spent),collected:s.logistics.collected.length,loopVisited:['v109-logistics','v109-reserve'].every(id=>s.visitedRooms.includes(id)),alarms:clone(s.logistics.alarms)};}
