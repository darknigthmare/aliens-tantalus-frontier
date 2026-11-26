/* V111: illumination changes recognition, never body/projectile geometry.
   Existing service circuits and lamp props are the single source of power truth.
   Torches are unlimited equipment, not an invented shared battery economy. */
import * as S from './spatial-core-v108.mjs';
import {ROOMS} from './operation-scenes-v109.mjs';
export const RULES=Object.freeze({switchTime:.95,torchRange:520,halfAngle:.32,closeGlow:34,darkRange:120,revealThreshold:.24,ambientOn:.60,ambientOff:.045,flashRange:170,flashTime:.18,workRange:105});
const clone=x=>structuredClone(x),finite=x=>typeof x==='number'&&Number.isFinite(x),record=o=>o&&typeof o==='object'&&!Array.isArray(o);
const exact=(o,keys)=>record(o)&&Object.keys(o).length===keys.length&&Object.keys(o).every(k=>keys.includes(k));
const bounded=(v,a,b)=>finite(v)&&v>=a&&v<=b;
const p=s=>s.team[0],world=s=>s.worlds[s.roomId];
export const PROFILES=Object.freeze(ROOMS.map(r=>Object.freeze({roomId:r.id,circuit:'service',controlId:r.controls.find(c=>c.circuit==='service')?.id,lamps:r.props.filter(p=>p.type==='lamp'&&p.circuit==='service').map(p=>({id:p.id,x:p.x,z:p.z,support:p.support})),darkRange:RULES.darkRange})));
export function createLighting(){return {schema:111,torch:{on:true,angle:0},metrics:{started:0,completed:0,interrupted:0,torchSwitches:0}};}
const log=(s,type,data={})=>{s.events.push({type,time:s.elapsed,...data});if(s.events.length>60)s.events.shift();};
export const isAction=a=>a?.kind==='lighting';
export const powered=w=>w.circuits.service===true;
export function aim(s,target){if(s.paused||s.status!=='active'||!p(s)?.alive||!finite(target?.x)||!finite(target?.z))return false;const dx=target.x-p(s).x,dz=target.z-p(s).z;if(Math.hypot(dx,dz)<.1)return false;s.lighting.torch.angle=Math.atan2(dz,dx);if(Math.abs(dx)>.1)p(s).facing=Math.sign(dx);return true;}
export function toggle(s){if(s.paused||s.status!=='active'||!p(s)?.alive)return {ok:false,reason:'Torche indisponible.'};s.lighting.torch.on=!s.lighting.torch.on;s.lighting.metrics.torchSwitches++;log(s,'torch',{on:s.lighting.torch.on});return {ok:true,reason:s.lighting.torch.on?'Torche allumée. Son faisceau révèle aussi votre présence.':'Torche éteinte. Le détecteur et les bruits restent utiles.'};}
export function controlNear(s){const w=world(s),a=p(s);return w.scene.controls.filter(c=>c.circuit==='service'&&S.distance(a,c)<=(c.reach||72)&&S.visible(w,a,c)).sort((a,b)=>S.distance(p(s),a)-S.distance(p(s),b))[0]||null;}
export function begin(s){if(s.paused||s.status!=='active'||!p(s)?.alive)return {ok:false,reason:'Commande électrique indisponible.'};if(s.action)return {ok:false,reason:'Terminez ou annulez le geste avant de manœuvrer le circuit.'};const c=controlNear(s);if(!c)return {ok:false,reason:'Approchez de la commande d’éclairage locale (K).'};
 const a=p(s),w=world(s);s.transition=null;s.action={kind:'lighting',roomId:s.roomId,id:c.id,elapsed:0,duration:RULES.switchTime,x:a.x,z:a.z,hp:a.hp,initialOn:powered(w)};s.lighting.metrics.started++;log(s,'lighting-start',{room:s.roomId,on:!powered(w)});return {ok:true,reason:powered(w)?'Coupure des lampes en cours. Restez au pupitre.':'Remise sous tension des lampes en cours.'};}
export function cancel(s,reason){if(!isAction(s.action))return false;s.lighting.metrics.interrupted++;s.action=null;s.lastReason=reason;log(s,'lighting-cancelled',{reason});return true;}
export function checkAction(s,a){const w=s.worlds[a?.roomId],actor=p(s),c=w?.scene.controls.find(c=>c.id===a?.id&&c.circuit==='service');
 if(!exact(a,['kind','roomId','id','elapsed','duration','x','z','hp','initialOn'])||a.kind!=='lighting'||a.roomId!==s.roomId||!c||!bounded(a.elapsed,0,RULES.switchTime)||a.elapsed>=RULES.switchTime||a.duration!==RULES.switchTime||![a.x,a.z,a.hp].every(finite)||typeof a.initialOn!=='boolean'||a.initialOn!==powered(w)||!actor?.alive||S.distance(actor,a)>2||actor.hp!==a.hp||S.distance(actor,c)>(c.reach||72)||!S.visible(w,actor,c))return {ok:false,reason:'Éclairage : geste hors portée ou circuit incohérent.'};return {ok:true};}
export function advanceAction(s,dt,emitNoise){const a=s.action;if(!isAction(a))return;const check=checkAction(s,a);if(!check.ok){cancel(s,'Manœuvre électrique interrompue.');return;}a.elapsed+=dt;if(a.elapsed+1e-8<a.duration)return;const w=world(s),c=w.scene.controls.find(c=>c.id===a.id);w.circuits.service=!a.initialOn;s.lighting.metrics.completed++;s.action=null;s.lastReason=w.circuits.service?'Éclairage rétabli.':'Lampes coupées. Les sas et le relais de mission restent indépendants.';emitNoise?.(s,s.roomId,c,'control',c.id,350);log(s,'lighting-complete',{room:s.roomId,on:w.circuits.service});}
const rayClear=(w,a,b)=>S.trace(w,a,b,0,{query:'sight'})===null;
export function beamOrigin(s,w){const a=p(s);return a?.alive&&a.roomId===w.scene.id&&s.lighting?.torch.on?a:null;}
export function beamAt(s,w,q){const a=beamOrigin(s,w);if(!a)return 0;const d=S.distance(a,q);if(d>RULES.torchRange||!rayClear(w,a,q))return 0;
 if(d<=RULES.closeGlow)return .92;const angle=Math.atan2(q.z-a.z,q.x-a.x),diff=Math.atan2(Math.sin(angle-s.lighting.torch.angle),Math.cos(angle-s.lighting.torch.angle));if(Math.abs(diff)>RULES.halfAngle)return 0;return .82-.50*(d/RULES.torchRange);}
export function lightAt(s,w,q){if(!s.lighting)return 1;let light=powered(w)?RULES.ambientOn:RULES.ambientOff;light=Math.max(light,beamAt(s,w,q));
 // A gun flash is transient and local; it never changes actor health or memory.
 for(const n of s.contacts?.noises||[]){if(n.roomId!==w.scene.id||n.kind!=='shot'||s.elapsed-n.at>RULES.flashTime)continue;const d=S.distance(n,q);if(d<RULES.flashRange&&rayClear(w,n,q))light=Math.max(light,.82*(1-d/RULES.flashRange));}
 if(s.action&&['brace','cut-brace','repair-hatch'].includes(s.action.kind)&&s.roomId===w.scene.id){const a=p(s),d=S.distance(a,q);if(d<RULES.workRange&&rayClear(w,a,q))light=Math.max(light,.88*(1-d/RULES.workRange));}
 return Math.min(1,light);}
export function perceived(s,w,observer,target,range=490){if(!observer?.alive||!target?.alive||S.distance(observer,target)>range||!S.visible(w,observer,target))return false;if(!s.lighting||powered(w))return true;return S.distance(observer,target)<=RULES.darkRange||lightAt(s,w,target)>=RULES.revealThreshold;}
/* Both renderer and tests use these collision-clipped WORLD-space rays. No random
   screen-space light cone, no ray through an opaque wall, no diagnostic actors. */
export function beamPolygon(s,w,segments=40){const a=beamOrigin(s,w);if(!a)return [];const out=[{x:a.x,z:a.z}],angle=s.lighting.torch.angle;for(let i=0;i<=segments;i++){const t=angle-RULES.halfAngle+2*RULES.halfAngle*i/segments;let d=RULES.torchRange,dx=Math.cos(t),dz=Math.sin(t);if(dx>0)d=Math.min(d,(w.scene.width-a.x)/dx);if(dx<0)d=Math.min(d,-a.x/dx);if(dz>0)d=Math.min(d,(w.scene.depth-a.z)/dz);if(dz<0)d=Math.min(d,-a.z/dz);const end={x:a.x+dx*d,z:a.z+dz*d},hit=S.trace(w,a,end,0,{query:'sight'}),k=hit?Math.max(0,hit.t-.00001):1;out.push({x:a.x+(end.x-a.x)*k,z:a.z+(end.z-a.z)*k});}return out;}
export function validate(s,raw,action){if(!exact(raw,['schema','torch','metrics'])||raw.schema!==111||!exact(raw.torch,['on','angle'])||typeof raw.torch.on!=='boolean'||!bounded(raw.torch.angle,-Math.PI,Math.PI))return {ok:false,reason:'Éclairage : torche invalide.'};
 const m=raw.metrics;if(!exact(m,['started','completed','interrupted','torchSwitches'])||Object.values(m).some(v=>!Number.isInteger(v)||v<0||v>1e7)||m.started!==m.completed+m.interrupted+Number(isAction(action))||raw.torch.on!==(m.torchSwitches%2===0))return {ok:false,reason:'Éclairage : bilan invalide.'};
 if(isAction(action))return checkAction(s,action);return {ok:true};}
export function brief(s){const w=world(s),a=p(s),c=controlNear(s);return {powered:powered(w),torch:s.lighting.torch.on,angle:s.lighting.torch.angle,exposure:lightAt(s,w,a)>=RULES.revealThreshold?'éclairé':'ombre',control:c?{id:c.id,name:c.name||'Commande de service'}:null,metrics:clone(s.lighting.metrics)};}
