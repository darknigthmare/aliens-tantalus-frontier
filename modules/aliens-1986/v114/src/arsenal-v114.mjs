/* Finite, local armament. Numbers are game balance, never alleged film specs.
   Pulse path retains V113 behaviour. Alternative profiles share physical traces. */
import * as S from './spatial-core-v108.mjs';
import * as C from './contact-v114.mjs';
import * as L from './lighting-v114.mjs';
export const WEAPONS=Object.freeze({
 pulse:{id:'pulse',name:'M41A · fusil à impulsion',range:670,cooldown:.16,damage:24,resource:'pulse',max:999,style:'pulse'},
 shotgun:{id:'shotgun',name:'Fusil à pompe · Hicks',range:300,cooldown:.72,damage:7,pellets:7,spread:.22,resource:'shells',max:24,style:'shotgun'},
 flame:{id:'flame',name:'M240 · incinerator',range:205,cooldown:.15,damage:12,spread:.27,resource:'fuel',max:120,style:'flame'},
 smartgun:{id:'smartgun',name:'M56 · smartgun',range:570,cooldown:.12,damage:21,assist:.14,resource:'belt',max:240,style:'smartgun'},
 pistol:{id:'pistol',name:'Pistolet USCM',range:480,cooldown:.28,damage:20,resource:'pistol',max:60,style:'pistol'},
 launcher:{id:'launcher',name:'M41A · lance-grenades',range:410,cooldown:1.1,damage:72,radius:94,flight:.45,resource:'rounds',max:6,style:'launcher'},
 grenade:{id:'grenade',name:'Grenade USCM',range:270,cooldown:1.2,damage:68,radius:100,flight:.8,resource:'grenades',max:4,style:'grenade'},
 knife:{id:'knife',name:'Couteau de service',range:54,cooldown:.65,damage:38,resource:null,max:0,style:'knife'}
});
const KEYS=['shells','fuel','belt','pistol','rounds','grenades'];
export const CACHES=Object.freeze([
 {id:'service-incinerator',roomId:'v107-service',x:910,z:315,bodyId:'cable-rack',reach:90,duration:1.05,name:'Caisse incinerator · dotation locale adaptée',grant:{flame:80,launcher:3},actor:'ripley'},
 {id:'sulaco-test-rack',roomId:'v114-sulaco-armory',x:413,z:90,bodyId:'v114-sulaco-armory-body-0',reach:112,duration:1.05,name:'Râtelier d’essai · hors chronologie',grant:{shotgun:12,flame:80,smartgun:120,pistol:30,launcher:4,grenade:2,knife:0},actor:'ripley',inspectionOnly:true}
]);
const clone=x=>structuredClone(x),finite=x=>typeof x==='number'&&Number.isFinite(x),obj=x=>x&&typeof x==='object'&&!Array.isArray(x),keys=(o,ks)=>obj(o)&&Object.keys(o).every(k=>ks.includes(k));
const zeros=()=>Object.fromEntries(KEYS.map(k=>[k,0]));
const seed=(id,origin)=>{const z=zeros();if(origin==='new'&&id==='hicks')z.shells=6;return z;};
const meter=()=>({retrieved:0,started:0,completed:0,interrupted:0,shots:0,impacts:0,friendlyImpacts:0,switches:0});
export function create(origin='new'){return {schema:114,origin,selected:{ripley:'pulse',hicks:'pulse',hudson:'pulse',newt:null},remaining:Object.fromEntries(['ripley','hicks','hudson','newt'].map(id=>[id,seed(id,origin)])),spent:Object.fromEntries(['ripley','hicks','hudson','newt'].map(id=>[id,zeros()])),collected:[],serial:0,flights:[],metrics:meter()};}
export const isAction=a=>a?.kind==='arsenal-retrieve';
const actor=(s,id)=>s.team.find(a=>a.id===id);
export function owned(s,id){if(id==='newt')return [];const ids=['pulse'];if(id==='hicks')ids.push('shotgun');for(const key of s.arsenal.collected){const cache=CACHES.find(c=>c.id===key);if(cache?.actor===id)ids.push(...Object.keys(cache.grant));}return [...new Set(ids)];}
export function current(s,a){return WEAPONS[s.arsenal?.selected[a?.id]]||WEAPONS.pulse;}
export function rounds(s,a,id=s.arsenal.selected[a.id]){const w=WEAPONS[id];if(!w)return 0;return w.resource==='pulse'?a.ammo:w.resource?s.arsenal.remaining[a.id]?.[w.resource]||0:Infinity;}
export function equip(s,id,weapon){const a=actor(s,id);if(s.paused||s.status!=='active'||s.action||!a?.alive||a.roomId!==s.roomId||a.kind==='escort'||!owned(s,id).includes(weapon))return {ok:false,reason:'Arme non disponible pour ce membre ici.'};if(s.arsenal.selected[id]===weapon)return {ok:true,reason:'Arme déjà tenue.'};s.arsenal.selected[id]=weapon;a.clock=Math.max(a.clock,.35);s.arsenal.metrics.switches++;return {ok:true,reason:a.name+' : '+WEAPONS[weapon].name+'.'};}
const accessible=(s,c)=>{const p=s.team[0],w=s.worlds[s.roomId];return c?.roomId===s.roomId&&S.distance(p,c)<=c.reach&&!S.activeSolids(w).some(b=>b.id!==c.bodyId&&S.segmentBox(p,c,b,0)!==null);};
export function nearby(s){return CACHES.filter(c=>accessible(s,c)&&!s.arsenal.collected.includes(c.id)&&(!c.inspectionOnly||s.mode==='inspection')).sort((a,b)=>S.distance(a,s.team[0])-S.distance(b,s.team[0]))[0]||null;}
export function begin(s){if(s.paused||s.status!=='active'||s.action)return {ok:false,reason:'Terminez le geste en cours.'};const c=nearby(s);if(!c)return {ok:false,reason:'Approchez de la caisse incinerator ou du râtelier Sulaco.'};const p=s.team[0];s.action={kind:'arsenal-retrieve',roomId:s.roomId,id:c.id,x:p.x,z:p.z,hp:p.hp,elapsed:0,duration:c.duration};s.arsenal.metrics.started++;s.lastReason='Ouverture de '+c.name+'. Restez immobile.';return {ok:true,reason:s.lastReason};}
export function cancel(s,reason){if(!isAction(s.action))return false;s.arsenal.metrics.interrupted++;s.action=null;s.lastReason=reason;return true;}
export function checkExecution(s,a){const c=CACHES.find(c=>c.id===a?.id),p=s.team[0];return keys(a,['kind','roomId','id','x','z','hp','elapsed','duration'])&&isAction(a)&&[a.x,a.z,a.hp,a.elapsed,a.duration].every(finite)&&c&&a.roomId===s.roomId&&(!c.inspectionOnly||s.mode==='inspection')&&a.duration===c.duration&&a.elapsed>=0&&a.elapsed<a.duration&&p.hp===a.hp&&S.distance(p,a)<=2&&!s.arsenal.collected.includes(c.id)&&accessible(s,c)?{ok:true}:{ok:false,reason:'Geste d’armement invalide.'};}
export function step(s,dt){const a=s.action;if(!isAction(a))return;const c=CACHES.find(c=>c.id===a.id),p=s.team[0];if(!p.alive||p.hp<a.hp||S.distance(p,a)>2||!accessible(s,c)){cancel(s,'Récupération interrompue. Rien n’a été attribué.');return;}a.elapsed+=dt;if(a.elapsed+1e-8<a.duration)return;
 for(const [id,n]of Object.entries(c.grant)){const w=WEAPONS[id];if(w.resource)s.arsenal.remaining[c.actor][w.resource]+=n;}
 s.arsenal.collected.push(c.id);s.arsenal.metrics.completed++;s.arsenal.metrics.retrieved++;s.action=null;s.lastReason='Équipement récupéré. Caisse vide ; F2 pour choisir une arme.';C.emitNoise(s,s.roomId,p,'equipment',p.id,350);
}
function circleHit(a,b,p,r){const dx=b.x-a.x,dz=b.z-a.z,ox=a.x-p.x,oz=a.z-p.z,A=dx*dx+dz*dz,B=2*(ox*dx+oz*dz),C=ox*ox+oz*oz-r*r;if(C<=0)return 0;if(A<1e-10)return null;const disc=B*B-4*A*C;if(disc<0)return null;const t=(-B-Math.sqrt(disc))/(2*A);return t>=0&&t<=1?t:null;}
function damage(s,w,t,n){if(!t.alive)return;t.hp=Math.max(0,t.hp-n);t.alive=t.hp>0;if(!t.alive){t.phase='dead';t.aim=null;}if(t.kind==='enemy'){w.stats.hits++;s.arsenal.metrics.impacts++;}else s.arsenal.metrics.friendlyImpacts++;}
function ray(s,w,a,angle,range,n,style){const end={x:a.x+Math.cos(angle)*range,z:a.z+Math.sin(angle)*range},wall=S.trace(w,a,end,0,{query:'projectile'});let t=wall?.t??1,enemy=null;for(const e of w.actors){if(!e.alive||e.kind!=='enemy')continue;const hit=circleHit(a,end,e,e.radius+2);if(hit!==null&&hit<t){t=hit;enemy=e;}}
 w.traces.push({a:{x:a.x,z:a.z},b:{x:a.x+(end.x-a.x)*t,z:a.z+(end.z-a.z)*t},life:style==='flame'?.15:.09,style});if(enemy)damage(s,w,enemy,n);return {hit:enemy?.id||null,wall:enemy?null:wall?.box.id||null};}
export function shoot(s,w,a,aim,{automatic=false,damage:baseDamage=20,range:baseRange=460}={}){
 if(w.scene.id.startsWith('v114-gateway'))return {ok:false,reason:'Gateway : inspection civile, Ripley ne porte pas d’arme.'};
 if(s.paused||s.status!=='active'||!a?.alive||!finite(aim?.x)||!finite(aim?.z))return {ok:false};const spec=current(s,a),amount=rounds(s,a);if(amount<=0)return {ok:false,reason:'Réserve de cette arme vide.'};
 if(spec.id==='pulse'){const r=S.shoot(w,a,aim,automatic?{damage:baseDamage,range:baseRange}:{});if(r.ok)s.arsenal.metrics.shots++;return r;}
 if(a.clock>0)return {ok:false};if(spec.resource){s.arsenal.remaining[a.id][spec.resource]--;s.arsenal.spent[a.id][spec.resource]++;}w.stats.shots++;s.arsenal.metrics.shots++;let angle=Math.atan2(aim.z-a.z,aim.x-a.x),result={ok:true,hit:null,wall:null};
 if(spec.id==='flame'){
  for(const e of w.actors){if(!e.alive||e.kind!=='enemy'||S.distance(a,e)>spec.range)continue;const v=Math.atan2(e.z-a.z,e.x-a.x)-angle;if(Math.abs(Math.atan2(Math.sin(v),Math.cos(v)))<=spec.spread&&!S.trace(w,a,e,0,{query:'projectile'})){damage(s,w,e,spec.damage);result.hit=e.id;}}
  for(const d of [-spec.spread,0,spec.spread]){const end={x:a.x+Math.cos(angle+d)*spec.range,z:a.z+Math.sin(angle+d)*spec.range},wall=S.trace(w,a,end,0,{query:'projectile'}),t=wall?.t??1;w.traces.push({a:{x:a.x,z:a.z},b:{x:a.x+(end.x-a.x)*t,z:a.z+(end.z-a.z)*t},life:.16,style:'flame'});}
 }else if(spec.id==='launcher'||spec.id==='grenade'){
  const range=Math.min(spec.range,Math.max(28,S.distance(a,aim))),end={x:a.x+Math.cos(angle)*range,z:a.z+Math.sin(angle)*range},wall=S.trace(w,a,end,3,{query:'projectile'}),t=wall?Math.max(0,wall.t-.004):1;
  const target={x:a.x+(end.x-a.x)*t,z:a.z+(end.z-a.z)*t};s.arsenal.flights.push({id:++s.arsenal.serial,roomId:w.scene.id,owner:a.id,weapon:spec.id,from:{x:a.x,z:a.z},target,started:s.elapsed,ends:s.elapsed+spec.flight});
 }else if(spec.pellets){for(let i=0;i<spec.pellets;i++){const r=ray(s,w,a,angle+(i/(spec.pellets-1)-.5)*2*spec.spread,spec.range,spec.damage,spec.style);if(r.hit)result.hit=r.hit;}}
 else{if(spec.assist){const targets=w.actors.filter(e=>e.alive&&e.kind==='enemy'&&L.perceived(s,w,a,e,spec.range)&&!S.trace(w,a,e,0,{query:'projectile'})).map(e=>({e,d:Math.abs(Math.atan2(Math.sin(Math.atan2(e.z-a.z,e.x-a.x)-angle),Math.cos(Math.atan2(e.z-a.z,e.x-a.x)-angle)))})).filter(t=>t.d<=spec.assist).sort((a,b)=>a.d-b.d);if(targets[0])angle=Math.atan2(targets[0].e.z-a.z,targets[0].e.x-a.x);}
  result={ok:true,...ray(s,w,a,angle,spec.range,spec.damage,spec.style)};
 }
 a.clock=spec.cooldown;a.facing=Math.cos(angle)<0?-1:1;return result;
}
export function tick(s,dt){
 if(!s.arsenal)return;s.weaponEffects=(s.weaponEffects||[]).filter(e=>e.until>s.elapsed);const live=[];
 for(const f of s.arsenal.flights){const w=s.worlds[f.roomId],spec=WEAPONS[f.weapon],duration=f.ends-f.started;
  const point=t=>({x:f.from.x+(f.target.x-f.from.x)*t,z:f.from.z+(f.target.z-f.from.z)*t});
  const old=Math.max(0,Math.min(1,(s.elapsed-dt-f.started)/duration)),now=Math.max(0,Math.min(1,(s.elapsed-f.started)/duration)),a=point(old),b=point(now),wall=S.trace(w,a,b,3,{query:'projectile'});
  if(!wall&&now<1){live.push(f);continue;}
  const t=wall?Math.max(0,wall.t-.005):1,p={x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t};
  for(const actor of w.actors)if(actor.alive&&S.distance(actor,p)<=spec.radius&&!S.trace(w,p,actor,0,{query:'projectile'}))damage(s,w,actor,Math.max(8,spec.damage*(1-S.distance(actor,p)/spec.radius)));
  s.weaponEffects.push({...p,roomId:f.roomId,until:s.elapsed+.32,radius:spec.radius});C.emitNoise(s,f.roomId,p,'shot','blast:'+f.id,800);
 }
 s.arsenal.flights=live;
}
export function validate(s,r,action){const fail=reason=>({ok:false,reason});if(!keys(r,['schema','origin','selected','remaining','spent','collected','serial','flights','metrics'])||r.schema!==114||!['new','migrated113'].includes(r.origin))return fail('Registre d’armement absent ou invalide.');
 if(!Array.isArray(r.collected)||new Set(r.collected).size!==r.collected.length||r.collected.some(id=>!CACHES.some(c=>c.id===id&&(!c.inspectionOnly||s.mode==='inspection'))))return fail('Caisse d’armement inconnue.');
 for(const field of ['selected','remaining','spent'])if(!keys(r[field],s.team.map(a=>a.id))||Object.keys(r[field]).length!==s.team.length)return fail('Registre d’armes incomplet.');
 const temp={...s,arsenal:r};
 for(const a of s.team){const base=seed(a.id,r.origin),rem=r.remaining[a.id],spent=r.spent[a.id];for(const cache of CACHES.filter(c=>r.collected.includes(c.id)&&c.actor===a.id))for(const [id,n]of Object.entries(cache.grant)){const resource=WEAPONS[id].resource;if(resource)base[resource]+=n;}
  if(!keys(rem,KEYS)||!keys(spent,KEYS)||Object.keys(rem).length!==KEYS.length||Object.keys(spent).length!==KEYS.length)return fail('Ressources d’arme inconnues.');
  for(const key of KEYS)if(!Number.isInteger(rem[key])||!Number.isInteger(spent[key])||rem[key]<0||spent[key]<0||rem[key]+spent[key]!==base[key])return fail('Bilan des munitions secondaires incohérent.');
  if(a.kind==='escort'?(r.selected[a.id]!==null||Object.values(rem).some(Boolean)):!owned(temp,a.id).includes(r.selected[a.id]))return fail('Arme incompatible avec le personnage.');
 }
 if(!keys(r.metrics,Object.keys(meter()))||Object.keys(r.metrics).length!==Object.keys(meter()).length||Object.values(r.metrics).some(n=>!Number.isInteger(n)||n<0||n>1e7)||r.metrics.retrieved!==r.collected.length||r.metrics.completed!==r.collected.length||r.metrics.started!==r.metrics.completed+r.metrics.interrupted+(isAction(action)?1:0))return fail('Bilan des gestes d’armement incohérent.');
 if(!Number.isInteger(r.serial)||r.serial<0||r.serial>20||!Array.isArray(r.flights)||r.flights.length>10||new Set(r.flights.map(x=>x.id)).size!==r.flights.length)return fail('Vol de grenade incohérent.');
 for(const f of r.flights){const sp=WEAPONS[f?.weapon],w=s.worlds[f?.roomId];if(!keys(f,['id','roomId','owner','weapon','from','target','started','ends'])||!['grenade','launcher'].includes(f.weapon)||!w||!s.team.some(a=>a.id===f.owner&&a.kind!=='escort')||!Number.isInteger(f.id)||f.id<1||f.id>r.serial||![f.started,f.ends].every(finite)||f.started>s.elapsed||f.ends<=s.elapsed||Math.abs(f.ends-f.started-sp.flight)>1e-6||!keys(f.from,['x','z'])||!keys(f.target,['x','z'])||![f.from.x,f.from.z,f.target.x,f.target.z].every(finite)||!S.canStand({...w,runtimeSolids:[],doors:Object.fromEntries(w.scene.doors.map(d=>[d.id,{open:true}]))},f.from,0)||!S.canStand({...w,runtimeSolids:[],doors:Object.fromEntries(w.scene.doors.map(d=>[d.id,{open:true}]))},f.target,0)||S.distance(f.from,f.target)>sp.range+.01)return fail('Trajectoire de grenade invalide.');}
 return {ok:true};
}
export function brief(s){return {weapons:Object.values(WEAPONS),members:s.team.filter(a=>a.roomId===s.roomId&&a.alive).map(a=>({id:a.id,name:a.name,selected:s.arsenal.selected[a.id],owned:owned(s,a.id),remaining:clone(s.arsenal.remaining[a.id]),pulse:a.ammo})),nearby:nearby(s),collected:[...s.arsenal.collected]};}
