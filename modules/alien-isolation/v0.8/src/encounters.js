import { CONTENT } from './content.js';
import { ROOMS, doors, available, distance, safePosition, clearSight, walkable, clamp } from './engine.js';
/** Original optional rescue simulation. No host state or commercial mission scripts.
 * Cross-room following stores physical thresholds actually crossed by Amanda.
 */
const encLimit=(v,a,b,fallback=a)=>Number.isFinite(Number(v))?Math.max(a,Math.min(b,Number(v))):fallback;
export const RESCUE_LABELS={sheltered:'À l’abri · à contacter',follow:'Vous suit',wait:'Attend sur place',seeking:'Rejoint un casier',hiding:'Dans un casier',down:'À stabiliser',dead:'Décédé',rescued:'Arrivé au refuge'};
export function freshEncounters(){return{version:1,alarms:{},bodyLoot:[],prey:null,preyHit:0,recovery:0,rescues:CONTENT.rescues.map(r=>({id:r.id,room:r.room,x:r.x,y:r.y,face:1,health:70,status:'sheltered',trail:[],bleed:0,stun:0,hitCooldown:0,locker:null,exposed:false,observedUntil:0,passage:0,pulse:0,rewarded:false,revives:0,careful:false,travelled:0,stepDistance:0,stuck:0})),stats:{recruited:0,arrived:0,wounded:0,lost:0,humanKills:0,alarms:0}};}
export function cleanEncounters(raw,state){
 const out=freshEncounters();
 for(const spec of CONTENT.rescues){const dst=out.rescues.find(x=>x.id===spec.id),v=Array.isArray(raw?.rescues)?raw.rescues.find(x=>x?.id===spec.id):null;if(!v)continue;
  dst.room=spec.allowed.includes(v.room)?v.room:spec.room;Object.assign(dst,safePosition(dst.room,{x:encLimit(v.x,35,ROOMS[dst.room].w-35,spec.x),y:encLimit(v.y,110,390,spec.y)}));
  dst.status=Object.hasOwn(RESCUE_LABELS,v.status)?v.status:'sheltered';dst.health=encLimit(v.health,0,70,70);dst.bleed=encLimit(v.bleed,0,state.refuges?.stations?.medical?.installed?35:25);dst.face=v.face===-1?-1:1;dst.hitCooldown=encLimit(v.hitCooldown,0,2);dst.stun=encLimit(v.stun,0,2);dst.pulse=encLimit(v.pulse,0,1);dst.passage=encLimit(v.passage,0,.45);dst.exposed=v.exposed===true;dst.observedUntil=encLimit(v.observedUntil,0,state.time+1.5);dst.revives=Math.floor(encLimit(v.revives,0,100));dst.careful=v.careful===true;dst.travelled=encLimit(v.travelled,0,1e8);
  if(dst.status==='rescued'){dst.room=spec.home;Object.assign(dst,safePosition(spec.home,spec.homePoint));dst.health=Math.max(1,dst.health);dst.rewarded=true;}
  else if(dst.status==='sheltered'){dst.room=spec.room;Object.assign(dst,safePosition(spec.room,spec));dst.health=70;}
  else if(dst.status==='dead'){dst.health=0;dst.bleed=0;}
  else if(dst.status==='down'||dst.health===0){dst.status=dst.bleed>0?'down':'dead';dst.health=0;}
  let room=dst.room;
  for(const item of Array.isArray(v.trail)?v.trail.slice(0,16):[]){const e=doors(room).find(e=>e.id===item?.id&&e.destination===item?.to);if(!e||e.kind!=='door'||!available(e,state)||!spec.allowed.includes(e.destination))break;dst.trail.push({id:e.id,from:room,to:e.destination});room=e.destination;}
  if(['seeking','hiding'].includes(dst.status)){const p=ROOMS[dst.room].props.find(p=>p.id===v.locker&&p.interactive==='hide');if(p){dst.locker=p.id;if(dst.status==='hiding'){dst.x=p.x;dst.y=p.y;}}else dst.status='wait';}
 }
 // Reject duplicate locker occupancy, including a loaded player hiding state.
 const occupied=new Set(state.hidden?[state.hidden]:[]);for(const n of out.rescues){if(n.locker){if(occupied.has(n.locker)){n.locker=null;n.status='wait';Object.assign(n,safePosition(n.room,n));}else occupied.add(n.locker);}}
 for(const r of CONTENT.rooms)for(const p of r.props.filter(p=>p.interactive==='alarm')){const a=raw?.alarms?.[p.id];if(a)out.alarms[p.id]={remaining:encLimit(a.remaining,0,18),cooldown:encLimit(a.cooldown,0,30),pulse:encLimit(a.pulse,0,2)};}
 out.bodyLoot=Array.isArray(raw?.bodyLoot)?[...new Set(raw.bodyLoot.filter(id=>state.enemies.some(e=>e.id===id&&e.kind==='human'&&e.hp<=0)))]:[];
 for(const k in out.stats)out.stats[k]=Math.floor(encLimit(raw?.stats?.[k],0,1e7));out.recovery=encLimit(raw?.recovery,0,2.2);
 const candidates=[...state.enemies.filter(e=>e.kind==='human'&&e.hp>0).map(e=>e.id),...out.rescues.filter(n=>['follow','wait','seeking'].includes(n.status)||n.status==='hiding'&&n.exposed).map(n=>n.id)];
 if(candidates.includes(raw?.prey)&&out.recovery<=0){out.prey=raw.prey;out.preyHit=encLimit(raw.preyHit,0,.7);}
 out.stats.arrived=out.rescues.filter(n=>n.status==='rescued').length;return out;
}
export class IsolationEncounters{
 constructor(engine){this.e=engine;}
 get s(){return this.e.s;}get data(){return this.s.encounters;}get rules(){return CONTENT.encounterRules;}
 spec(id){return CONTENT.rescues.find(r=>r.id===id);}
 event(type,fields={}){this.e.events.push({type,time:+this.s.time.toFixed(2),...fields});}
 near(n,range=86){return n.room===this.s.room&&distance(n,this.s)<=range&&clearSight(n.room,this.s,n);}
 targets(){
  const out=[];for(const n of this.data.rescues){const spec=this.spec(n.id);if(n.room!==this.s.room||this.s.chapter<spec.min||!this.near(n)||['dead','rescued'].includes(n.status))continue;
   const arrival=n.room===spec.home&&distance(n,spec.homePoint)<65&&['follow','wait'].includes(n.status);
   const action=n.status==='down'?'revive':arrival?'deliver':n.status==='sheltered'?'recruit':n.status==='follow'?'wait':'follow';
   const labels={revive:'Stabiliser · 1 trousse · '+Math.ceil(n.bleed)+' s restantes',deliver:'Confirmer l’arrivée au refuge',recruit:'Appeler et proposer le repli',wait:'Attendre ici',follow:'Me suivre'};
   out.push({id:'rescue.'+n.id,type:'rescue',npc:n.id,action,x:n.x,y:n.y,label:spec.name+' · '+labels[action],hold:action==='revive'?2.4:.75});
  }
  for(const p of this.e.room.props.filter(p=>p.interactive==='alarm'))out.push({id:p.id,type:'alarm',prop:p,x:p.x,y:p.y,label:(this.data.alarms[p.id]?.remaining>0?'Couper':'Déclencher')+' la sirène de service',hold:.85});
  for(const en of this.s.enemies.filter(en=>en.kind==='human'&&en.hp<=0&&en.room===this.s.room&&!this.data.bodyLoot.includes(en.id)))out.push({id:'body.'+en.id,type:'body',enemy:en.id,x:en.x,y:en.y,label:'Récupérer la pochette · collecte unique',hold:1.1});
  return out;
 }
 use(t){
  if(!t||this.s.dead||this.s.ended||this.s.hidden||!this.targets().some(v=>v.id===t.id&&distance(this.s,v)<87))return false;
  if(t.type==='alarm')return this.alarm(t.prop);
  if(t.type==='body'){const en=this.s.enemies.find(e=>e.id===t.enemy&&e.hp<=0);if(!en||this.data.bodyLoot.includes(en.id))return false;this.data.bodyLoot.push(en.id);this.s.inventory.scrap=clamp(this.s.inventory.scrap+2,0,200);this.s.inventory.battery=clamp(this.s.inventory.battery+1,0,200);this.e.message('Pochette récupérée : deux pièces et une pile.');return true;}
  const n=this.data.rescues.find(n=>n.id===t.npc);if(!n)return false;
  // Re-read action: an old prepared target cannot turn a waiting character into a delivered reward.
  const current=this.targets().find(x=>x.id===t.id);if(!current||current.action!==t.action)return false;
  if(t.action==='revive'){
   if(this.s.inventory.medkit<1){this.e.message('Une trousse est nécessaire pour stabiliser '+this.spec(n.id).name+'.','warning');return false;}
   this.s.inventory.medkit--;n.health=this.e.refuges.upgraded('medical')?50:35;n.bleed=0;n.status='wait';n.hitCooldown=2;n.revives++;this.event('escort-revived',{npc:n.id,room:n.room});this.e.message(this.spec(n.id).name+' peut repartir. E pour lui demander de suivre.');return true;
  }
  if(t.action==='deliver'){
   n.status='rescued';n.trail=[];n.locker=null;if(!n.rewarded){for(const [k,v]of Object.entries(this.spec(n.id).reward))this.s.inventory[k]=clamp(this.s.inventory[k]+v,0,200);n.rewarded=true;this.data.stats.arrived++;}
   this.event('escort-arrived',{npc:n.id,room:n.room});this.e.message(this.spec(n.id).thanks,'dialogue');return true;
  }
  if(t.action==='recruit'){this.data.stats.recruited++;this.e.message(this.spec(n.id).intro,'dialogue');this.event('escort-recruited',{npc:n.id,room:n.room});}
  else this.e.message(this.spec(n.id).name+(t.action==='wait'?' · Je ne bouge plus.':' · Je suis derrière vous.'));
  n.status=t.action==='wait'?'wait':'follow';n.trail=[];n.locker=null;n.exposed=false;n.passage=0;Object.assign(n,safePosition(n.room,n));return true;
 }
 toggleCareful(){
  if(this.e.paused||this.s.dead||this.s.ended||this.s.hidden||this.e.pendingHack)return false;
  const n=this.data.rescues.filter(n=>['follow','wait','seeking'].includes(n.status)&&this.s.chapter>=this.spec(n.id).min&&this.near(n,CONTENT.escortComfort.orderRange)).sort((a,b)=>distance(a,this.s)-distance(b,this.s))[0];
  if(!n){this.e.message('Aucune escorte à portée et en ligne de vue.');return false;}
  n.careful=!n.careful;this.event('escort-stance',{npc:n.id,careful:n.careful});
  this.e.message(this.spec(n.id).name+(n.careful?' · Je ralentis et je fais attention au bruit.':' · Je reprends le pas normal.'));
  return true;
 }
 separate(dt){
  // Yielding is a local comfort steering pass, NOT a hard crowd collision solver.
  // It never displaces the player or teleports an NPC to an arbitrary safe point.
  const e=this.e,s=this.s,c=CONTENT.escortComfort;if(s.hidden||s.dead||e.paused)return;
  const active=this.data.rescues.filter(n=>n.room===s.room&&s.chapter>=this.spec(n.id).min&&['follow','wait','rescued'].includes(n.status));
  for(const n of active){
   if(e.hold?.id==='rescue.'+n.id)continue;
   const blockers=[s,...active.filter(other=>other!==n&&other.id<n.id)];
   for(const other of blockers){
    const before=distance(n,other);if(before>=c.separation)continue;
    const amount=Math.min(c.separation-before,c.yieldSpeed*Math.max(0,Math.min(.08,dt)));
    const room=ROOMS[n.room],side=room.view==='SIDE'||room.view==='HYBRID'&&(n.x<260||n.x>room.w-260);
    const angle=before>.01?Math.atan2(n.y-other.y,n.x-other.x):n.id==='nora'?-Math.PI/2:Math.PI/2;
    const angles=side?[0,Math.PI]:[angle,angle+.6,angle-.6,angle+1.2,angle-1.2,0,Math.PI,Math.PI/2,-Math.PI/2];
    const candidates=[];
    for(const a of angles){const q={x:n.x+Math.cos(a)*amount,y:side?300:n.y+Math.sin(a)*amount};
     if(distance(q,other)<=before+.001)continue;
     if(![.25,.5,.75,1].every(t=>walkable(n.room,n.x+(q.x-n.x)*t,n.y+(q.y-n.y)*t,14)))continue;
     if(blockers.some(b=>b!==other&&distance(q,b)<Math.min(c.separation,distance(n,b))))continue;
     candidates.push(q);
    }
    candidates.sort((a,b)=>distance(b,other)-distance(a,other));
    if(candidates.length){const q=candidates[0],d=distance(n,q);n.x=q.x;n.y=q.y;n.travelled+=d;n.stepDistance+=d;e.enemyPaths.delete(n.id);}
   }
  }
 }

 hideNearest(){
  if(this.e.paused||this.s.dead||this.s.ended||this.s.hidden)return false;
  const n=this.data.rescues.filter(n=>['follow','wait','seeking'].includes(n.status)&&this.near(n,this.rules.commandRange)).sort((a,b)=>distance(a,this.s)-distance(b,this.s))[0];
  if(!n){this.e.message('Aucune escorte à portée de voix.');return false;}
  const occupied=new Set([this.s.hidden,...this.data.rescues.filter(x=>x!==n).map(x=>x.locker)].filter(Boolean));
  const p=ROOMS[n.room].props.filter(p=>p.interactive==='hide'&&!occupied.has(p.id)&&distance(n,p)<=this.rules.hideRange).sort((a,b)=>distance(a,n)-distance(b,n))[0];
  if(!p){this.e.message('Aucun casier libre assez proche.','warning');return false;}
  n.status='seeking';n.locker=p.id;n.trail=[];this.event('escort-hide-order',{npc:n.id,room:n.room,locker:p.id});this.e.message(this.spec(n.id).name+' rejoint le casier. Le passage doit rester libre.');return true;
 }
 onPassage(edge,oldRoom){
  for(const n of this.data.rescues.filter(n=>n.status==='follow')){const last=n.trail.at(-1),expected=last?.to||n.room;if(expected!==oldRoom)continue;
   if(edge.kind!=='door'||!this.spec(n.id).allowed.includes(edge.destination)||n.trail.length>=16){n.status='wait';n.trail=[];this.event('escort-left-behind',{npc:n.id,room:n.room});this.e.message(this.spec(n.id).name+' reste dans son secteur. Sa position est conservée dans Liaisons.','warning');continue;}
   // Exact reverse traversal before the escort reaches a threshold cancels that leg.
   if(last&&last.id===edge.id&&last.from===edge.destination)n.trail.pop();else n.trail.push({id:edge.id,from:oldRoom,to:edge.destination});
  }
 }
 alarm(prop){
  const p=this.e.room.props.find(p=>p.id===prop?.id&&p.interactive==='alarm');if(!p||distance(this.s,p)>86)return false;
  const a=this.data.alarms[p.id]??={remaining:0,cooldown:0,pulse:0};
  if(a.remaining>0){a.remaining=0;this.e.message('Sirène coupée. Les bruits déjà perçus restent en mémoire.');this.event('alarm-stopped',{room:this.s.room});return true;}
  if(a.cooldown>0){this.e.message('Circuit de sirène en récupération · '+Math.ceil(a.cooldown)+' s.');return false;}
  Object.assign(a,{remaining:18,cooldown:30,pulse:0});this.data.stats.alarms++;this.event('alarm-started',{room:this.s.room});this.e.message('SIRÈNE ACTIVE · Dix-huit secondes. Le bruit peut attirer le chasseur.','warning');return true;
 }
 hurt(n,amount,source){
  if(['sheltered','rescued','dead','down'].includes(n.status)||n.hitCooldown>0||ROOMS[n.room].safe)return false;
  n.health=Math.max(0,n.health-amount);n.hitCooldown=1.2;
  if(n.health===0){n.status='down';n.bleed=this.e.refuges.upgraded('medical')?35:this.rules.bleedSeconds;n.trail=[];n.locker=null;n.exposed=false;this.data.stats.wounded++;this.event('escort-downed',{npc:n.id,room:n.room,source});this.e.message(this.spec(n.id).name+' est à terre. Une trousse avant '+Math.ceil(n.bleed)+' secondes.','danger');}
  return true;
 }
 update(dt){
  const e=this.e,s=this.s;
  for(const r of CONTENT.rooms)for(const p of r.props.filter(p=>p.interactive==='alarm')){const a=this.data.alarms[p.id];if(!a)continue;a.cooldown=Math.max(0,a.cooldown-dt);if(a.remaining<=0)continue;a.remaining=Math.max(0,a.remaining-dt);a.pulse-=dt;if(a.pulse<=0){a.pulse=1.65;e.emitNoise(p.x,p.y,2.2,r.id);}}
  this.data.recovery=Math.max(0,this.data.recovery-dt);
  for(const n of this.data.rescues){const spec=this.spec(n.id);n.stepDistance=0;if(s.chapter<spec.min)continue;n.hitCooldown=Math.max(0,n.hitCooldown-dt);
   if(n.status==='down'){n.bleed=Math.max(0,n.bleed-dt);if(n.bleed===0){n.status='dead';this.data.stats.lost++;this.event('escort-lost',{npc:n.id,room:n.room});e.message(spec.name+' ne répond plus. La campagne peut continuer.','danger');}continue;}
   if(!['follow','seeking'].includes(n.status))continue;
   const observer=s.alien;if(n.status==='seeking'&&observer.active&&observer.room===n.room&&observer.mode!=='vent'&&e.sees(observer,n,this.rules.predatorRange,n.room))n.observedUntil=s.time+1.5;
   let target=null,edge=null;
   if(n.status==='seeking')target=ROOMS[n.room].props.find(p=>p.id===n.locker);
   else if(n.trail.length){const item=n.trail[0];edge=doors(n.room).find(d=>d.id===item.id&&d.destination===item.to);if(edge&&available(edge,s)&&!e.protocols.moduleLocked(edge.id))target=edge.point;}
   else if(n.room===s.room){target=n.room===spec.home?spec.homePoint:{x:s.x,y:s.y};if(s.hidden)target=null;}
   if(!target)continue;
   const stop=edge?36:n.status==='seeking'?18:n.room===spec.home?18:67;
   if(distance(n,target)>stop){
    const old={x:n.x,y:n.y},quiet=n.careful||(n.room===s.room&&s.crouched&&clearSight(n.room,n,s));
    n.lowPose=quiet;e.enemyMove(n,target,quiet?this.rules.escortCrouchSpeed:this.rules.escortWalkSpeed,dt);
    const moved=distance(old,n);n.stepDistance=moved;n.travelled+=moved;
    n.stuck=moved<.01?n.stuck+dt:0;
    if(moved>0&&!ROOMS[n.room].safe){n.pulse-=dt;if(n.pulse<=0){n.pulse=1;e.emitNoise(n.x,n.y,quiet?.03:.16,n.room);}}continue;
   }
   if(edge){if(e.sealed(edge.id)){n.passage=0;continue;}n.passage+=dt;if(n.passage>=.45){const from=n.room;n.room=edge.destination;Object.assign(n,safePosition(n.room,{x:edge.arrival.x+(edge.arrival.wall==='L'?48:edge.arrival.wall==='R'?-48:0),y:edge.arrival.wall==='N'?175:300}));n.trail.shift();n.passage=0;e.enemyPaths.delete(n.id);this.event('escort-threshold',{npc:n.id,from,to:n.room});}}
   else if(n.status==='seeking'){
    if(s.hidden===n.locker||this.data.rescues.some(q=>q!==n&&q.locker===n.locker&&q.status==='hiding')){n.status='wait';n.locker=null;continue;}
    const a=s.alien;n.exposed=a.active&&a.room===n.room&&a.mode!=='vent'&&((n.observedUntil>0&&n.observedUntil>=s.time)||e.sees(a,n,this.rules.predatorRange,n.room));n.status='hiding';n.x=target.x;n.y=target.y;this.event('escort-hidden',{npc:n.id,room:n.room,exposed:n.exposed});
   }
  }
  this.separate(dt);
 }
 preyList(){const s=this.s;return [...s.enemies.filter(en=>en.kind==='human'&&en.hp>0&&en.min<=s.chapter),...this.data.rescues.filter(n=>s.chapter>=this.spec(n.id).min&&(['follow','wait','seeking'].includes(n.status)||n.status==='hiding'&&n.exposed))];}
 predation(dt,playerVisible){
  const e=this.e,s=this.s,a=s.alien,d=this.data;
  if(!a.active||['vent','retreat'].includes(a.mode)||e.protocols.controlsAlien()||playerVisible||a.seenHide&&s.hidden===a.seenHide){d.prey=null;d.preyHit=0;return false;}
  if(d.recovery>0)return true;
  const candidates=this.preyList().filter(n=>n.room===a.room&&!ROOMS[n.room].safe&&(n.status==='hiding'&&n.exposed?distance(a,n)<this.rules.predatorRange:e.sees(a,n,this.rules.predatorRange,n.room)));
  const target=candidates.find(n=>n.id===d.prey)||candidates.sort((p,q)=>distance(p,a)-distance(q,a))[0];
  if(!target){d.prey=null;d.preyHit=0;return false;}
  if(d.prey!==target.id){d.prey=target.id;d.preyHit=0;this.event('alien-prey',{target:target.id,room:a.room});}
  a.mode='investigate';a.memory={room:target.room,x:target.x,y:target.y,ttl:3,strength:1.8};e.enemyMove(a,target,210,dt);
  if(distance(a,target)<34&&(target.status==='hiding'&&target.exposed||clearSight(a.room,a,target))){d.preyHit+=dt;if(d.preyHit>=this.rules.predatorWindup){
   if(target.kind==='human'){target.hp=0;d.stats.humanKills++;this.event('alien-human-kill',{target:target.id,room:a.room});}
   else this.hurt(target,70,'Le Xénomorphe');
   d.recovery=this.rules.predatorRecovery;d.prey=null;d.preyHit=0;a.memory=null;a.mode='search';e.emitNoise(target.x,target.y,1,target.room);
  }}else d.preyHit=0;return true;
 }
 guard(en,visible,dt){
  const state=en.disposition||'calm';en.disposition=state;en.warning=en.warning||0;en.quiet=en.quiet||0;
  if(visible){en.quiet=0;if(state!=='hostile'){if(state==='calm'){en.disposition='warning';this.e.message('Survivant armé · Reculez. Ne venez pas plus près.','warning');this.event('guard-warning',{enemy:en.id,room:en.room});}en.warning+=dt;if(en.warning>=this.rules.warningSeconds){en.disposition='hostile';this.event('guard-hostile',{enemy:en.id,room:en.room});}}}
  else{en.quiet+=dt;if(en.quiet>=this.rules.deescalationSeconds){en.disposition='calm';en.warning=0;}}
  return en.disposition==='hostile';
 }
}
