/* V113 — explicit floor posts, committed fire sectors, automatic-fire safety.
   Uses the same live body/projectile/sight geometry; no teleport, free ammo,
   enemy marker or new actor. Runtime path caches are NOT save data. */
import * as S from './spatial-core-v108.mjs';
import {ROOMS,TEAM,exitsFor} from './operation-scenes-v114.mjs';
import {hatchBox} from './contact-v114.mjs';
export const RULES=Object.freeze({commandRange:520,arrival:7,postGap:7,halfAngle:Math.PI*5/18,turnTime:1.15,turnReach:76,allyMargin:4});
const clone=x=>structuredClone(x),finite=x=>typeof x==='number'&&Number.isFinite(x),record=o=>o&&typeof o==='object'&&!Array.isArray(o);
const exact=(o,keys)=>record(o)&&Object.keys(o).length===keys.length&&Object.keys(o).every(k=>keys.includes(k));
const point=o=>({x:o.x,z:o.z}),p=s=>s.team[0],w=s=>s.worlds[s.roomId];
const MEMBER_IDS=TEAM.filter(a=>a.kind!=='player').map(a=>a.id),GUN_IDS=TEAM.filter(a=>a.kind==='ally').map(a=>a.id);
const SENTRY_IDS=ROOMS.flatMap(r=>r.actors.filter(a=>a.role==='sentry').map(a=>a.id));
export const COUNTERS=Object.freeze(['postOrders','sectorOrders','disciplineOrders','arrivals','safetyHolds','turnsStarted','turnsCompleted','turnsInterrupted']);
export function create(){return {schema:113,posts:Object.fromEntries(MEMBER_IDS.map(id=>[id,null])),discipline:Object.fromEntries(GUN_IDS.map(id=>[id,'free'])),sentries:Object.fromEntries(SENTRY_IDS.map(id=>[id,{angle:null,fire:'free'}])),metrics:Object.fromEntries(COUNTERS.map(id=>[id,0]))};}
const log=(s,type,data={})=>{s.events.push({type,time:s.elapsed,...data});if(s.events.length>60)s.events.shift();};
const okay=s=>!s.paused&&s.status==='active'&&p(s)?.alive;
export const isAction=a=>a?.kind==='sentry-orient';
export function members(s,id){return s.team.filter(a=>a.kind!=='player'&&a.alive&&a.recruited&&a.roomId===s.roomId&&(id==='all'||id===a.id));}
export function clearPost(s,a){if(s.tactics&&Object.hasOwn(s.tactics.posts,a.id))s.tactics.posts[a.id]=null;a.postBlocked=false;a.nextPostPath=0;}
export function prune(s){for(const a of s.team){const post=s.tactics.posts[a.id];if(post&&(!a.alive||a.roomId!==post.roomId||a.order==='follow'))clearPost(s,a);}}
export function safePost(world,q,radius){return finite(q?.x)&&finite(q?.z)&&S.canStand(world,q,radius)&&![...world.scene.doors,...exitsFor(world.scene.id).map(hatchBox)].some(b=>S.segmentBox(q,q,b,radius+RULES.postGap)!==null);}
function preparedPosts(s,id,q){const world=w(s),actors=members(s,id),fail=reason=>({ok:false,reason});
 if(!actors.length)return fail('Aucun équipier recruté dans ce lieu. La sentinelle est fixe.');
 if(!finite(q?.x)||!finite(q?.z)||S.distance(p(s),q)>RULES.commandRange||!S.visible(world,p(s),q))return fail('Désignez un sol visible, à moins de 520 unités.');
 if(!safePost(world,q,Math.max(...actors.map(a=>a.radius))))return fail('Poste dans un obstacle ou un seuil : gardez les accès libres.');
 const chosen=[],selected=new Set(actors.map(a=>a.id)),others=world.actors.filter(a=>a.alive&&!selected.has(a.id));
 const reserved=Object.entries(s.tactics.posts).filter(([id,x])=>x&&x.roomId===s.roomId&&!selected.has(id)).map(([id,x])=>({...x,radius:s.team.find(a=>a.id===id).radius}));
 const offsets=[[0,0],[-48,-42],[-48,42],[48,-42],[48,42],[-90,0],[90,0],[0,-88],[0,88]];
 for(const a of actors){let result=null;
  for(const [dx,dz] of offsets){const goal={x:q.x+dx,z:q.z+dz};if(S.distance(p(s),goal)>RULES.commandRange||!S.visible(world,p(s),goal)||!safePost(world,goal,a.radius))continue;
   if([...others,...reserved,...chosen.map(x=>({...x.goal,radius:x.actor.radius}))].some(b=>S.distance(b,goal)<b.radius+a.radius+RULES.postGap))continue;
   const path=S.planRoute(world,a,goal,a.radius);if(path.length||S.distance(a,goal)<=RULES.arrival){result={actor:a,goal,path};break;}}
  if(!result)return fail('Poste indisponible pour tout le groupe : aucun ordre partiel envoyé.');chosen.push(result);
 }return {ok:true,chosen};}
export function preview(s,id,q){if(!s?.tactics)return {ok:false,reason:'Aucune liaison.'};const r=preparedPosts(s,id,q);return r.ok?{ok:true,posts:r.chosen.map(x=>({id:x.actor.id,goal:point(x.goal),path:x.path.map(point)}))}:r;}
export function assign(s,id,q){if(!okay(s)||s.action)return {ok:false,reason:'Poste indisponible pendant la pause ou un geste.'};const r=preparedPosts(s,id,q);if(!r.ok)return r;
 s.transition=null;for(const {actor:a,goal,path} of r.chosen){a.order='hold';a.anchor=point(goal);a.waiting=true;a.route=path;a.routeRevision=w(s).revision;a.postBlocked=false;a.nextPostPath=0;
  s.tactics.posts[a.id]={roomId:s.roomId,x:goal.x,z:goal.z,angle:null,arrived:S.distance(a,goal)<=RULES.arrival};}
 s.tactics.metrics.postOrders++;s.stats.orders++;s.lastReason='Poste transmis : déplacement réel, puis attente. N pour orienter un secteur.';log(s,'post-order',{ids:r.chosen.map(x=>x.actor.id)});return {ok:true,reason:s.lastReason};}
function turretNear(s,id){const a=w(s).actors.find(a=>a.id===id&&a.role==='sentry'&&a.alive);return a&&S.distance(p(s),a)<=RULES.turnReach&&S.visible(w(s),p(s),a)&&!S.trace(w(s),p(s),a,p(s).radius)?a:null;}
export function sector(s,id,q){if(!okay(s)||s.action)return {ok:false,reason:'Secteur indisponible pendant la pause ou un geste.'};if(!finite(q?.x)||!finite(q?.z)||q.x<0||q.z<0||q.x>w(s).scene.width||q.z>w(s).scene.depth)return {ok:false,reason:'Direction hors du plan.'};
 if(SENTRY_IDS.includes(id)){const a=turretNear(s,id);if(!a)return {ok:false,reason:'Approchez de la sentinelle pour orienter son affût.'};if(S.distance(a,q)<12)return {ok:false,reason:'Choisissez une direction distincte de la tourelle.'};
  s.transition=null;s.action={kind:'sentry-orient',roomId:s.roomId,id,angle:Math.atan2(q.z-a.z,q.x-a.x),elapsed:0,duration:RULES.turnTime,x:p(s).x,z:p(s).z,hp:p(s).hp,targetX:a.x,targetZ:a.z};s.tactics.metrics.turnsStarted++;log(s,'sentry-turn-start',{id});return {ok:true,reason:'Affût en rotation : 1,15 s. Restez à portée ; le tir automatique attend.'};}
 const actors=members(s,id),armed=actors.filter(a=>a.kind==='ally');if(!armed.length)return {ok:false,reason:'Newt ne prend aucun secteur de tir. Utilisez X ou H pour son poste.'};
 const updates=[];for(const a of armed){const old=s.tactics.posts[a.id],goal=old||a;if(S.distance(goal,q)<12||!safePost(w(s),goal,a.radius))return {ok:false,reason:'Rejoignez un poste hors des seuils et désignez sa direction.'};updates.push({a,goal,old,angle:Math.atan2(q.z-goal.z,q.x-goal.x)});}
 const targets=Object.entries(s.tactics.posts).filter(([id,v])=>v&&!updates.some(x=>x.a.id===id)).map(([id,v])=>({...v,radius:s.team.find(a=>a.id===id).radius}));
 for(const u of updates){if(targets.some(x=>x.roomId===s.roomId&&S.distance(x,u.goal)<x.radius+u.a.radius+RULES.postGap))return {ok:false,reason:'Postes trop proches. Écartez le groupe avant de fixer les secteurs.'};targets.push({...u.goal,roomId:s.roomId,radius:u.a.radius});}
 s.transition=null;for(const {a,goal,old,angle} of updates){s.tactics.posts[a.id]={roomId:s.roomId,x:goal.x,z:goal.z,angle,arrived:old?.arrived??true};a.order='cover';a.anchor=point(goal);a.waiting=true;a.postBlocked=false;}
 s.tactics.metrics.sectorOrders++;s.stats.orders++;s.lastReason='Secteur engagé sur 100°. Les angles morts restent à couvrir.';log(s,'sector-order',{ids:armed.map(a=>a.id)});return {ok:true,reason:s.lastReason};}
export function discipline(s,id,mode){if(!okay(s)||!['free','hold'].includes(mode))return {ok:false,reason:'Consigne de feu indisponible.'};const actors=members(s,id).filter(a=>a.kind==='ally');
 if(SENTRY_IDS.includes(id)){const a=turretNear(s,id);if(!a||s.action)return {ok:false,reason:'Approchez de la sentinelle et terminez le geste en cours.'};s.tactics.sentries[id].fire=mode;}
 else{if(!actors.length)return {ok:false,reason:'Aucun Marine sélectionné. Newt reste non armée.'};for(const a of actors)s.tactics.discipline[a.id]=mode;}
 s.tactics.metrics.disciplineOrders++;log(s,'fire-order',{id,mode});s.lastReason=mode==='hold'?'Retenez le feu. Les ordres de position sont conservés.':'Feu autorisé dans les secteurs et les lignes dégagées.';return {ok:true,reason:s.lastReason};}
export function setting(s,a){if(a.role==='sentry')return s.tactics.sentries[a.id]||{angle:null,fire:'free'};return {angle:s.tactics.posts[a.id]?.angle??null,fire:s.tactics.discipline[a.id]||'hold'};}
export function inSector(origin,target,angle){if(angle===null)return true;const diff=Math.atan2(Math.sin(Math.atan2(target.z-origin.z,target.x-origin.x)-angle),Math.cos(Math.atan2(target.z-origin.z,target.x-origin.x)-angle));return Math.abs(diff)<=RULES.halfAngle+1e-8;}
function circleHit(a,b,c,r){const dx=b.x-a.x,dz=b.z-a.z,ox=a.x-c.x,oz=a.z-c.z,aa=dx*dx+dz*dz;if(ox*ox+oz*oz<=r*r)return 0;if(aa<=1e-12)return null;const bb=2*(ox*dx+oz*dz),cc=ox*ox+oz*oz-r*r,disc=bb*bb-4*aa*cc;if(disc<0)return null;const t=(-bb-Math.sqrt(disc))/(2*aa);return t>=0&&t<=1?t:null;}
export function friendInLine(world,shooter,target){let end=circleHit(shooter,target,target,target.radius+2)??1;const wall=S.trace(world,shooter,target,0,{query:'projectile'});end=Math.min(end,wall?.t??1);
 for(const e of world.actors.filter(a=>a.alive&&a.kind==='enemy')){const hit=circleHit(shooter,target,e,e.radius+2);if(hit!==null)end=Math.min(end,hit);}
 return world.actors.filter(a=>a.alive&&a!==shooter&&a.kind!=='enemy').find(a=>{const t=circleHit(shooter,target,a,a.radius+RULES.allyMargin);return t!==null&&t<end;})||null;}
export function canShoot(s,world,a,target){const config=setting(s,a);return config.fire==='free'&&inSector(a,target,config.angle)&&!(isAction(s.action)&&s.action.id===a.id)&&!friendInLine(world,a,target);}
export function markArrival(s,a){const post=s.tactics.posts[a.id];if(post&&!post.arrived&&S.distance(a,post)<=RULES.arrival){post.arrived=true;s.tactics.metrics.arrivals++;a.route=[];a.walking=false;log(s,'post-arrival',{id:a.id});}if(post?.arrived&&post.angle!==null&&Math.abs(Math.cos(post.angle))>.1)a.facing=Math.sign(Math.cos(post.angle));}
export function cancel(s,reason){if(!isAction(s.action))return false;s.tactics.metrics.turnsInterrupted++;s.action=null;s.lastReason=reason;log(s,'sentry-turn-cancelled',{reason});return true;}
export function checkAction(s,a){const actor=p(s),world=s.worlds[a?.roomId],t=world?.actors.find(t=>t.id===a?.id&&t.role==='sentry');if(!exact(a,['kind','roomId','id','angle','elapsed','duration','x','z','hp','targetX','targetZ'])||!isAction(a)||a.roomId!==s.roomId||!finite(a.angle)||Math.abs(a.angle)>Math.PI||!finite(a.elapsed)||a.elapsed<0||a.elapsed>=RULES.turnTime||a.duration!==RULES.turnTime||![a.x,a.z,a.hp,a.targetX,a.targetZ].every(finite)||!t?.alive||!actor?.alive||actor.hp!==a.hp||S.distance(actor,a)>2||t.x!==a.targetX||t.z!==a.targetZ||S.distance(actor,t)>RULES.turnReach||!S.visible(world,actor,t)||S.trace(world,actor,t,actor.radius))return {ok:false,reason:'Affût : geste ou portée invalides.'};return {ok:true};}
export function advanceAction(s,dt){const a=s.action;if(!isAction(a))return;if(!checkAction(s,a).ok){cancel(s,'Orientation interrompue.');return;}a.elapsed+=dt;if(a.elapsed+1e-8<a.duration)return;s.tactics.sentries[a.id].angle=a.angle;s.tactics.metrics.turnsCompleted++;s.action=null;s.lastReason='Affût orienté. Aucun changement de chargeur.';log(s,'sentry-turn-complete',{id:a.id});}
export function validate(s,raw,action){const bad=reason=>({ok:false,reason:'Ordres tactiques : '+reason});if(!exact(raw,['schema','posts','discipline','sentries','metrics'])||raw.schema!==113||!exact(raw.posts,MEMBER_IDS)||!exact(raw.discipline,GUN_IDS)||!exact(raw.sentries,SENTRY_IDS)||!exact(raw.metrics,COUNTERS))return bad('registre inattendu');
 if(Object.values(raw.metrics).some(v=>!Number.isInteger(v)||v<0||v>1e9)||raw.metrics.turnsStarted!==raw.metrics.turnsCompleted+raw.metrics.turnsInterrupted+Number(isAction(action)))return bad('bilan des gestes invalide');
 for(const v of Object.values(raw.discipline))if(!['free','hold'].includes(v))return bad('consigne inconnue');
 const reserved=[];for(const [id,post] of Object.entries(raw.posts)){if(post===null)continue;const a=s.team.find(a=>a.id===id),world=s.worlds[post?.roomId];if(!exact(post,['roomId','x','z','angle','arrived'])||!world||!a?.alive||!a.recruited||a.roomId!==post.roomId||a.order==='follow'||!a.anchor||S.distance(a.anchor,post)>1e-7||!safePost(world,post,a.radius)||typeof post.arrived!=='boolean'||post.arrived&&S.distance(a,post)>RULES.arrival+1e-6||post.angle!==null&&(!finite(post.angle)||Math.abs(post.angle)>Math.PI)||a.kind==='escort'&&post.angle!==null||post.angle!==null&&a.order!=='cover'||!raw.metrics.postOrders&&!raw.metrics.sectorOrders)return bad('poste, secteur ou rôle incohérent');
  if(reserved.some(q=>q.roomId===post.roomId&&S.distance(q,post)<q.radius+a.radius+RULES.postGap-1e-7))return bad('postes superposés');reserved.push({...post,radius:a.radius});}
 for(const x of Object.values(raw.sentries))if(!exact(x,['angle','fire'])||x.angle!==null&&(!finite(x.angle)||Math.abs(x.angle)>Math.PI)||!['free','hold'].includes(x.fire))return bad('affût invalide');
 if(Object.values(raw.sentries).some(x=>x.angle!==null)&&!raw.metrics.turnsCompleted)return bad('rotation non achevée');
 if(isAction(action))return checkAction(s,action);return {ok:true};}
export function brief(s){return {rules:RULES,metrics:clone(s.tactics.metrics),posts:members(s,'all').map(a=>{const post=s.tactics.posts[a.id];return {id:a.id,name:a.name,post:post?clone(post):null,status:post?(post.arrived?'en poste':a.postBlocked?'itinéraire fermé':'en route'):a.order==='follow'?'suit':a.order==='cover'?'couvre':'attend',fire:s.tactics.discipline[a.id]||'non armée'};}),sentries:w(s).actors.filter(a=>a.role==='sentry').map(a=>({id:a.id,alive:a.alive,near:Boolean(turretNear(s,a.id)),...clone(s.tactics.sentries[a.id])}))};}
