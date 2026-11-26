/* Finite, world-anchored emergency light. Pure spatial queries + bounded ledger.
   No actor edits, damage, spawn, recharge, global storage or room-wide power. */
import * as S from './spatial-core-v108.mjs';
import {BEACON_STOCK as STOCK} from './operation-scenes-v114.mjs';
export {STOCK};
export const RULES=Object.freeze({stockTime:1.05,throwTime:.6,range:360,minRange:28,radius:225,lifetime:36,fadeTime:6,puckRadius:4,noiseRange:280,charges:4});
const finite=x=>typeof x==='number'&&Number.isFinite(x),record=x=>x&&typeof x==='object'&&!Array.isArray(x);
const exact=(o,keys)=>record(o)&&Object.keys(o).length===keys.length&&Object.keys(o).every(k=>keys.includes(k));
const bound=(v,a,b)=>finite(v)&&v>=a&&v<=b,copy=x=>structuredClone(x),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const player=s=>s.team[0],world=s=>s.worlds[s.roomId];
const log=(s,type,detail={})=>{s.events.push({type,time:s.elapsed,...detail});if(s.events.length>60)s.events.shift();};
export function createBeacons(){return {schema:112,collected:false,charges:0,spent:0,markers:[],metrics:{started:0,completed:0,interrupted:0,stocks:0,throws:0}};}
export const isAction=a=>a&&['beacon-stock','beacon-throw'].includes(a.kind);
export function stockReachable(s){const p=player(s),w=world(s);return s.roomId===STOCK.roomId&&S.distance(p,STOCK)<=STOCK.reach&&S.visible(w,p,STOCK)&&!S.activeSolids(w).filter(b=>b.id!==STOCK.bodyId).some(b=>S.segmentBox(p,STOCK,b)!==null);}
export function landing(w,origin,aim){
 if(!w||![origin?.x,origin?.z,aim?.x,aim?.z].every(finite))return null;
 const dx=aim.x-origin.x,dz=aim.z-origin.z,n=Math.hypot(dx,dz);if(n<RULES.minRange)return null;
 const d=Math.min(n,RULES.range),end={x:clamp(origin.x+dx/n*d,RULES.puckRadius,w.scene.width-RULES.puckRadius),z:clamp(origin.z+dz/n*d,RULES.puckRadius,w.scene.depth-RULES.puckRadius)};
 const hit=S.trace(w,origin,end,RULES.puckRadius,{query:'projectile'}),travel=S.distance(origin,end),k=hit?Math.max(0,hit.t-2/Math.max(1,travel)):1;
 const p={x:origin.x+(end.x-origin.x)*k,z:origin.z+(end.z-origin.z)*k};return S.distance(origin,p)>=RULES.minRange&&S.canStand(w,p,RULES.puckRadius)?p:null;
}
export function begin(s,kind,aim=null){
 if(s.paused||s.status!=='active'||s.action||!player(s)?.alive||!['beacon-stock','beacon-throw'].includes(kind))return {ok:false,reason:'Balise indisponible ou geste déjà en cours.'};
 const p=player(s),b=s.beacons;if(kind==='beacon-stock'){
  if(!stockReachable(s))return {ok:false,reason:'Approchez du coffret dans l’atelier optique.'};
  if(b.collected)return {ok:false,reason:'Coffret vide : les quatre balises ont déjà été récupérées.'};
 }else{
  if(b.charges<=0)return {ok:false,reason:'Aucune balise. Coffret de secours dans l’atelier optique.'};
  if(!landing(world(s),p,aim))return {ok:false,reason:'Visez un sol dégagé, à au moins 28 unités. Les parois arrêtent le lancer.'};
 }
 s.transition=null;s.action={kind,roomId:s.roomId,elapsed:0,duration:kind==='beacon-stock'?RULES.stockTime:RULES.throwTime,x:p.x,z:p.z,hp:p.hp,aim:kind==='beacon-throw'?{x:clamp(aim.x,0,world(s).scene.width),z:clamp(aim.z,0,world(s).scene.depth)}:null};
 b.metrics.started++;s.lastReason=kind==='beacon-stock'?'Ouverture du coffret de secours. Restez en place.':'Amorçage de la balise. Le point visé est engagé.';log(s,'beacon-start',{kind});return {ok:true,reason:s.lastReason};
}
export function cancel(s,reason){if(!isAction(s.action))return false;s.beacons.metrics.interrupted++;s.action=null;s.lastReason=reason;log(s,'beacon-cancelled',{reason});return true;}
export function checkAction(s,a){const p=player(s),w=world(s);
 if(!exact(a,['kind','roomId','elapsed','duration','x','z','hp','aim'])||!isAction(a)||a.roomId!==s.roomId||!bound(a.elapsed,0,a.duration)||a.elapsed>=a.duration||a.duration!==(a.kind==='beacon-stock'?RULES.stockTime:RULES.throwTime)||![a.x,a.z,a.hp].every(finite)||!p.alive||p.hp!==a.hp||S.distance(p,a)>2)return {ok:false,reason:'Balise : déplacement, impact ou geste invalide.'};
 if(a.kind==='beacon-stock'){if(a.aim!==null||s.beacons.collected||!stockReachable(s))return {ok:false,reason:'Coffret vide ou devenu inaccessible.'};}
 else if(!exact(a.aim,['x','z'])||!bound(a.aim.x,0,w.scene.width)||!bound(a.aim.z,0,w.scene.depth)||s.beacons.charges<=0||!landing(w,p,a.aim))return {ok:false,reason:'Sol visé devenu inaccessible ou balise manquante.'};
 return {ok:true};
}
export function advanceAction(s,dt,emitNoise){const a=s.action;if(!isAction(a))return;const valid=checkAction(s,a);if(!valid.ok){cancel(s,valid.reason);return;}a.elapsed+=dt;if(a.elapsed+1e-8<a.duration)return;
 const b=s.beacons;if(a.kind==='beacon-stock'){b.collected=true;b.charges+=RULES.charges;b.metrics.stocks++;s.lastReason='Quatre balises récupérées. P : amorcer et lancer vers la visée.';emitNoise?.(s,s.roomId,player(s),'equipment','beacon-case',320);}
 else{const p=landing(world(s),player(s),a.aim);if(!p){cancel(s,'Balise retenue : arrivée obstruée.');return;}
  b.charges--;b.spent++;b.metrics.throws++;b.markers.push({id:'beacon-'+b.spent,roomId:s.roomId,x:p.x,z:p.z,litAt:s.elapsed,expiresAt:s.elapsed+RULES.lifetime});
  emitNoise?.(s,s.roomId,p,'equipment','beacon-'+b.spent,RULES.noiseRange);s.lastReason='Balise au sol : lumière locale 36 s. Elle éclaire aussi vos équipiers aux yeux des contacts.';
 }
 b.metrics.completed++;s.action=null;log(s,'beacon-complete',{kind:a.kind});
}
export function active(s,w){return (s.beacons?.markers||[]).filter(b=>b.roomId===w.scene.id&&b.expiresAt>s.elapsed);}
export function strength(s,b){return clamp((b.expiresAt-s.elapsed)/RULES.fadeTime,0,1);}
export function lightAt(s,w,q){let light=0;for(const b of active(s,w)){const d=S.distance(b,q);if(d>=RULES.radius||S.trace(w,b,q,0,{query:'sight'}))continue;light=Math.max(light,.9*(1-d/RULES.radius)*strength(s,b));}return light;}
export function polygon(w,b,segments=72){const pts=[];for(let i=0;i<=segments;i++){const theta=i/segments*Math.PI*2,dx=Math.cos(theta),dz=Math.sin(theta);let r=RULES.radius;if(dx>0)r=Math.min(r,(w.scene.width-b.x)/dx);if(dx<0)r=Math.min(r,-b.x/dx);if(dz>0)r=Math.min(r,(w.scene.depth-b.z)/dz);if(dz<0)r=Math.min(r,-b.z/dz);const end={x:b.x+dx*r,z:b.z+dz*r},hit=S.trace(w,b,end,0,{query:'sight'}),k=hit?Math.max(0,hit.t-0.00001):1;pts.push({x:b.x+(end.x-b.x)*k,z:b.z+(end.z-b.z)*k});}return pts;}
export function validate(s,raw,action){const fail=reason=>({ok:false,reason:'Balises : '+reason});
 if(!exact(raw,['schema','collected','charges','spent','markers','metrics'])||raw.schema!==112||typeof raw.collected!=='boolean'||![raw.charges,raw.spent].every(v=>Number.isInteger(v)&&v>=0&&v<=RULES.charges)||raw.charges+raw.spent!==(raw.collected?RULES.charges:0)||raw.collected&&!s.visitedRooms.includes(STOCK.roomId))return fail('registre de ressources incohérent');
 if(!Array.isArray(raw.markers)||raw.markers.length!==raw.spent)return fail('nombre de balises incohérent');let last=-Infinity;
 for(let i=0;i<raw.markers.length;i++){const b=raw.markers[i],w=s.worlds[b?.roomId];if(!exact(b,['id','roomId','x','z','litAt','expiresAt'])||b.id!=='beacon-'+(i+1)||!w||!s.visitedRooms.includes(b.roomId)||!bound(b.x,4,w.scene.width-4)||!bound(b.z,4,w.scene.depth-4)||!bound(b.litAt,0,s.elapsed)||b.litAt<last||!finite(b.expiresAt)||Math.abs(b.expiresAt-b.litAt-RULES.lifetime)>1e-7)return fail('balise hors contrat');
  // Static floor cannot change. A moving door may have since closed over a small
  // puck: it simply occludes its light; that does not invalidate a legal save.
  if(w.scene.solids.some(box=>S.segmentBox(b,b,box,RULES.puckRadius)!==null))return fail('balise dans un support fixe');last=b.litAt;
 }
 const m=raw.metrics;if(!exact(m,['started','completed','interrupted','stocks','throws'])||Object.values(m).some(v=>!Number.isInteger(v)||v<0||v>1e7)||m.stocks!==Number(raw.collected)||m.throws!==raw.spent||m.completed!==m.stocks+m.throws||m.started!==m.completed+m.interrupted+Number(Boolean(isAction(action))))return fail('bilan de gestes incohérent');
 if(isAction(action)){const previous=s.beacons;s.beacons=raw;try{return checkAction(s,action);}finally{s.beacons=previous;}}
 return {ok:true};
}
export function brief(s){return {charges:s.beacons.charges,spent:s.beacons.spent,collected:s.beacons.collected,local:active(s,world(s)).map(b=>({id:b.id,remaining:Math.max(0,b.expiresAt-s.elapsed)})),routeVisited:['v112-workshop','v112-conduit'].every(id=>s.visitedRooms.includes(id)),metrics:copy(s.beacons.metrics)};}
