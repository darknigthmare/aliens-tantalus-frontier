import { localPortals, portalApproach, passageReason } from './spatial.js';
import { CONTENT } from './content.js';
import { freshSignals, cleanSignals, IsolationSignals } from './signals.js';
import { freshRefuges, cleanRefuges, IsolationRefuges } from './refuges.js';
import { freshEncounters, cleanEncounters, IsolationEncounters } from './encounters.js';
import { freshProtocols, cleanProtocols, IsolationProtocols } from './protocols.js';
import { freshLifeSupport, cleanLifeSupport, IsolationLifeSupport, isVacuum } from './life-support.js';
/** Deterministic standalone simulation. All interactions require a physical approach.
 * No host engine, original game executable, or third-party dependency is used.
 */
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const clone=x=>JSON.parse(JSON.stringify(x));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const ROOMS=Object.fromEntries(CONTENT.rooms.map(r=>[r.id,r]));
export const DIFFICULTIES={recit:{name:'Récit',sight:160,alienSpeed:228,damage:22,autosave:true,patrol:65,hearing:1,notice:.7,searchTime:32,restTime:16},survie:{name:'Survie',sight:340,alienSpeed:308,damage:32,autosave:false,patrol:90,hearing:1.15,notice:.45,searchTime:44,restTime:12},cauchemar:{name:'Cauchemar',sight:450,alienSpeed:355,damage:44,autosave:false,patrol:110,hearing:1.3,notice:.28,searchTime:55,restTime:8}};
export function available(e,s){return s.chapter>=e.min&&(!e.flag||s.flags[e.flag])&&(!e.deny||!s.flags[e.deny])&&!(e.blockedTo===e.destination&&s.flags[e.blockFlag]);}
export function doors(room){return localPortals(room);}
export function route(from,to,s,ignoreLocks=false,allowed=null){
 if(from===to)return []; const q=[from],seen=new Set(q),prev={};
 for(let i=0;i<q.length;i++){for(const e of doors(q[i])){if((!ignoreLocks&&!available(e,s))||seen.has(e.destination)||(allowed&&!allowed(e)))continue;seen.add(e.destination);prev[e.destination]={room:q[i],edge:e};if(e.destination===to){const out=[];let t=to;while(t!==from){out.push(prev[t].edge);t=prev[t].room;}return out.reverse();}q.push(e.destination);}}
 return null;
}
export function walkable(room,x,y,radius=14){
 const r=ROOMS[room];if(!r||!Number.isFinite(x)||!Number.isFinite(y)||x<35||x>r.w-35||y<110||y>390)return false;
 if(r.view==='HYBRID'&&(x<260||x>r.w-260)&&Math.abs(y-300)>22)return false;
 return !r.props.some(p=>p.solid&&Math.abs(x-p.x)<p.w/2+radius&&Math.abs(y-p.y)<p.d/2+radius);
}
export function clearSight(room,a,b){
 const r=ROOMS[room];if(!r)return false;
 return !r.props.some(p=>{if(!p.cover||(!p.solid&&p.kind!=='locker'))return false;const minX=p.x-p.w/2,maxX=p.x+p.w/2,minY=p.y-p.d/2,maxY=p.y+p.d/2;
  // Liang-Barsky line / footprint clipping. Exclude endpoints: a character can stand by a cabinet.
  let lo=0.02,hi=.98;const dx=b.x-a.x,dy=b.y-a.y;
  for(const [v,w] of [[-dx,a.x-minX],[dx,maxX-a.x],[-dy,a.y-minY],[dy,maxY-a.y]]){if(v===0){if(w<0)return false;}else if(v<0)lo=Math.max(lo,w/v);else hi=Math.min(hi,w/v);if(lo>hi)return false;}return lo<=hi;
 });
}
export function safePosition(room,preferred={x:180,y:300}){
 const r=ROOMS[room];if(!r)return{x:180,y:300};
 const p={x:clamp(Number.isFinite(preferred.x)?preferred.x:180,35,r.w-35),y:r.view==='SIDE'?300:clamp(Number.isFinite(preferred.y)?preferred.y:300,110,390)};
 if(walkable(room,p.x,p.y))return p;
 const candidates=[];for(let x=50;x<r.w-35;x+=24)for(let y=114;y<=390;y+=24){const q={x,y:r.view==='SIDE'?300:y};if(walkable(room,q.x,q.y))candidates.push(q);}
 return candidates.sort((a,b)=>distance(a,p)-distance(b,p))[0]||{x:80,y:300};
}
/** Navigation grid is used by tests and enemies, not to move the player's avatar automatically. */
export function pathTo(room,start,end){
 const r=ROOMS[room];if(r.view==='SIDE')return [{x:end.x,y:300}];
 const cell=36,ys=8; const xs=Math.floor((r.w-70)/cell)+1;
 const pts=[];for(let ix=0;ix<xs;ix++)for(let iy=0;iy<ys;iy++){const p={x:40+ix*cell,y:122+iy*cell};if(walkable(room,p.x,p.y,17))pts.push({...p,key:ix*ys+iy,ix,iy});}
 if(!pts.length)return[];let nearest=p=>pts.reduce((a,b)=>distance(p,b)<distance(p,a)?b:a,pts[0]);const first=nearest(start),last=nearest(end),by=new Map(pts.map(p=>[p.key,p]));
 const q=[first],seen=new Set([first.key]),prev=new Map();for(let i=0;i<q.length;i++){const p=q[i];if(p.key===last.key)break;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=by.get((p.ix+dx)*ys+p.iy+dy);if(!n||Math.abs(n.ix-p.ix)+Math.abs(n.iy-p.iy)!==1||seen.has(n.key))continue;prev.set(n.key,p.key);seen.add(n.key);q.push(n);}}
 if(!seen.has(last.key))return[];let k=last.key,out=[end];while(k!==first.key){out.push(by.get(k));k=prev.get(k);}out.push(first);return out.reverse().map(p=>({x:p.x,y:p.y}));
}
function initialState(difficulty='survie',seed=20141007){return{
 schema:1,spatial:{waypoint:null,lastPortal:null},version:CONTENT.meta.version,difficulty:Object.hasOwn(DIFFICULTIES,difficulty)?difficulty:'survie',seed:seed>>>0,room:'t_cryo',x:180,y:300,face:1,actor:'Amanda',health:100,breath:100,time:0,chapter:0,goal:0,flags:{},tools:{torch:false,tracker:false,tuner:false,flame:false},inventory:{scrap:5,chemical:3,battery:3,flare:2,noise:1,emp:1,medkit:1},fuel:0,stashedFuel:0,hidden:null,crouched:false,torch:false,tracker:false,visited:['t_cryo'],opened:[],read:[],completed:[],decoys:[],effects:[],noise:0,alert:0,dead:false,ended:false,classic:false,checkpointCount:0,systems:{},seals:{},optional:[],favorites:[],signals:freshSignals(),refuges:freshRefuges(),encounters:freshEncounters(),protocols:freshProtocols(),lifeSupport:freshLifeSupport(),projectiles:[],throwCooldown:0,stats:{distance:0,actions:0,hacks:0,failures:0,transitions:0,noises:0,alienSteps:0,frames:0,damage:0,flameUses:0,crafted:0,heard:0,detections:0,rewires:0,seals:0,breaches:0,optional:0,escapes:0,throws:0,blockedThrows:0},
 alien:{active:false,room:'m_corridor',x:1650,y:300,mode:'vent',timer:5,memory:null,destination:null,face:-1,habit:0,seenHide:null,moveTimer:0,lastRoom:null,suspicion:0,groundTime:0,cue:false,breach:null},
 enemies:[
 {id:'human-baggage',kind:'human',room:'s_baggage',x:1000,y:182,home:1000,face:-1,min:1,hp:100,cool:0,stun:0},
 {id:'human-systech',kind:'human',room:'y_lobby',x:900,y:180,home:900,face:1,min:2,hp:100,cool:0,stun:0},
 {id:'joe-comms',kind:'joe',room:'c_control',x:1000,y:235,home:1000,face:-1,min:3,hp:150,cool:0,stun:0},
 {id:'joe-cargo',kind:'joe',room:'d_warehouse',x:1350,y:185,home:1350,face:1,min:6,hp:150,cool:0,stun:0},
 {id:'joe-repair',kind:'joe',room:'a_labo',x:1050,y:265,home:1050,face:-1,min:11,hp:150,cool:0,stun:0},
 {id:'joe-access',kind:'joe',room:'a_access',x:1150,y:300,home:1150,face:-1,min:12,hp:150,cool:0,stun:0},
 {id:'facehugger-nest',kind:'facehugger',room:'r_hive',x:1080,y:245,home:1080,face:1,min:13,hp:20,cool:0,stun:0}
 ]};}
export class IsolationEngine{
 constructor(difficulty='survie',seed){this.s=initialState(difficulty,seed);this.signals=new IsolationSignals(this);this.encounters=new IsolationEncounters(this);this.refuges=new IsolationRefuges(this);this.protocols=new IsolationProtocols(this);this.lifeSupport=new IsolationLifeSupport(this);this.frameTravel=0;this.aim=null;for(const e of this.s.enemies)Object.assign(e,safePosition(e.room,e));this.requireRelease=false;this.paused=false;this.messages=[];this.pendingHack=null;this.hold=null;this.cooldown=0;this.enemyPaths=new Map();this.savePending=false;this.checkpoint=this.serialize();this.events=[];this.flameCooldown=0;this.hurtCooldown=0;}
 get room(){return ROOMS[this.s.room];}get goal(){return CONTENT.goals[this.s.goal]||null;}get difficulty(){return DIFFICULTIES[this.s.difficulty];}
 random(){let x=this.s.seed||1;x^=x<<13;x^=x>>>17;x^=x<<5;this.s.seed=x>>>0;return(this.s.seed)/4294967296;}
 message(text,type='info'){this.messages.push({text,type,time:this.s.time});this.messages=this.messages.slice(-7);this.events.push({time:+this.s.time.toFixed(2),type,text});}
 /** Acoustic propagation uses actual distances, threshold losses and cover.
  * A crouched footstep is NOT audible throughout a room or in every adjacent room.
  */
 heardAt(listener,point,level,room){
  if(!ROOMS[room]||!ROOMS[listener.room]||level<=0)return false;
  const range=(38+level*430)*this.difficulty.hearing;
  if(listener.room===room){
   const attenuation=clearSight(room,listener,point)?1:.48;
   return distance(listener,point)<=range*attenuation;
  }
  if(level<.7)return false;
  const rr=route(listener.room,room,this.s,false,e=>!ROOMS[e.destination].safe&&['door','vent','stairs'].includes(e.kind));
  if(!rr||!rr.length||rr.length>2)return false;
  const loss=rr.reduce((n,e)=>n+(e.kind==='vent'?180:320)+(this.sealed(e.id)?360:0),0);
  return distance(listener,rr[0].point)+distance(rr.at(-1).arrival,point)+loss<=range;
 }
 emitNoise(x,y,level=1,sourceRoom=this.s.room){
  const s=this.s,point={x,y};
  if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(level)||!ROOMS[sourceRoom])return;
  if(sourceRoom===s.room)s.noise=Math.min(100,s.noise+level*24);
  s.stats.noises++;
  const a=s.alien;
  if(a.active&&this.heardAt(a,point,level,sourceRoom)){
   // A small footstep cannot continually overwrite a loud, still-current decoy.
   if(!a.memory||level>=(a.memory.strength||0)*.75||a.memory.ttl<2){
    a.memory={room:sourceRoom,x,y,ttl:5+level*5,strength:level};
    s.stats.heard++;
    if(!['retreat','vent','chase'].includes(a.mode))a.mode='investigate';
   }
  }
  for(const e of s.enemies)if(e.hp>0&&e.min<=s.chapter&&this.heardAt(e,point,level,sourceRoom))e.memory={x,y,ttl:5,strength:level};
 }
 sees(observer,target,range,room=observer.room){
  const d=distance(observer,target);
  if(d>range||!clearSight(room,observer,target))return false;
  // Very close movement is noticed peripherally. Else use a forward cone.
  return d<56||(target.x-observer.x)*(observer.face||1)/Math.max(1,d)>.08;
 }
 sealed(id){return this.protocols.moduleLocked(id)||(this.s.seals?.[id]||0)>this.s.time;}
 sealNearest(){
  const s=this.s;if(s.dead||s.ended||s.hidden||this.pendingHack)return false;
  const door=doors(s.room).filter(d=>d.kind==='door'&&available(d,s)&&distance(s,d.point)<92).sort((a,b)=>distance(s,a.point)-distance(s,b.point))[0];
  if(!door){this.message('Approchez une porte pour commander son verrou local.');return false;}
  if(this.protocols.moduleLocked(door.id)){this.message('Confinement du module : commande locale neutralisée.','warning');return false;}
  if(this.sealed(door.id)){delete s.seals[door.id];this.message('Verrou local relâché.');return true;}
  if(s.inventory.battery<1){this.message('Une pile est nécessaire pour maintenir le verrou.','warning');return false;}
  s.inventory.battery--;s.seals[door.id]=s.time+18;s.stats.seals++;
  this.emitNoise(s.x,s.y,.6);this.message('Porte condamnée pour 18 s. La créature peut forcer le verrou.','warning');return true;
 }
 rewire(p){
  const s=this.s;if(!p||p.interactive!=='rewire'||!this.room.props.some(q=>q.id===p.id)||distance(s,p)>88||s.hidden||s.dead||s.ended)return false;
  const old=s.systems[s.room]||{mode:0};const mode=(old.mode+1)%3;
  s.systems[s.room]={mode,until:mode===2?s.time+24:0,pulse:0};s.stats.rewires++;
  this.message(['Circuit rétabli : éclairage normal.','Éclairage coupé : visibilité réduite, lampe toujours repérable.','Dérivation active : le relais de ventilation émet pendant 24 s.'][mode]);
  this.emitNoise(p.x,p.y,.25);return true;
 }
 updateSystems(dt){
  const s=this.s;
  for(const [room,sys] of Object.entries(s.systems)){
   if(sys.mode!==2)continue;
   if(sys.until<=s.time){sys.mode=0;continue;}
   sys.pulse-=dt;if(sys.pulse<=0){sys.pulse=2.5;const vent=ROOMS[room].vents[0];this.emitNoise(vent.x,vent.y,1.35,room);}
  }
  for(const id of Object.keys(s.seals))if(!this.sealed(id))delete s.seals[id];
 }

 move(actor,dx,dy,room=actor.room||this.s.room){
 const before={x:actor.x,y:actor.y,room};
 const r=ROOMS[room];if(r.view==='SIDE'||r.view==='HYBRID'&&(actor.x<260||actor.x>r.w-260))dy=0;
 // HYBRID wings act as profile corridors; the central hall opens the depth band.
 const nx=clamp(actor.x+dx,35,r.w-35),ny=clamp(actor.y+dy,110,390);
 if(walkable(room,nx,actor.y,13))actor.x=nx;
 if(r.view==='SIDE'||r.view==='HYBRID'&&(actor.x<260||actor.x>r.w-260))actor.y=300;else if(walkable(room,actor.x,ny,13))actor.y=ny;
 if(dx)actor.face=Math.sign(dx);
 if(actor!==this.s)this.signals.footsteps(actor,before);
 }
 step(delta,input={}){
 const dt=clamp(Number.isFinite(delta)?delta:0,0,.08),s=this.s;if(this.paused||s.dead||s.ended||!dt)return;
 s.time+=dt;s.stats.frames++;this.frameTravel=0;s.throwCooldown=Math.max(0,s.throwCooldown-dt);this.cooldown=Math.max(0,this.cooldown-dt);this.flameCooldown=Math.max(0,this.flameCooldown-dt);this.hurtCooldown=Math.max(0,this.hurtCooldown-dt);
 s.effects=s.effects.filter(f=>(f.life-=dt)>0);s.noise=Math.max(0,s.noise-dt*16);s.alert=Math.max(0,s.alert-dt*14);
 if(Object.hasOwn(input,'crouch'))s.crouched=!!input.crouch;s.tracker=!!(input.tracker&&s.tools.tracker);s.breath=clamp(s.breath+(s.hidden&&input.breath?-20:17)*dt,0,100);
 if(!s.hidden&&!this.pendingHack&&!this.aim){let dx=Number(input.x)||0,dy=Number(input.y)||0;const length=Math.hypot(dx,dy)||1;dx/=length;dy/=length;
  const speed=s.crouched?122:input.run?305:205,old={x:s.x,y:s.y};this.move(s,dx*speed*dt,dy*speed*dt,s.room);const d=distance(old,s);s.stats.distance+=d;this.frameTravel=d;
  if(d>0){this.walkNoise=(this.walkNoise||0)+d;if(this.walkNoise>(s.crouched?240:input.run?62:155)){this.walkNoise=0;this.emitNoise(s.x,s.y,s.crouched?.05:input.run?1:.20);}}
 }
 if(s.hidden&&s.breath===0){s.breath=8;this.emitNoise(s.x,s.y,.8);this.message('Vous reprenez votre souffle. Le casier résonne.','warning');}
 for(const d of s.decoys){d.life-=dt;d.pulse-=dt;if(d.pulse<=0){d.pulse=d.kind==='noise'?.9:2.2;this.emitNoise(d.x,d.y,d.kind==='noise'?1.6:.65,d.room);}}
 s.decoys=s.decoys.filter(d=>d.life>0);
 if(this.aim){if(input.aimX||input.aimY)this.setAim({x:this.aim.target.x+(input.aimX||0)*210*dt,y:this.aim.target.y+(input.aimY||0)*170*dt});}
 this.updateSystems(dt);this.encounters.update(dt);this.protocols.update(dt);this.lifeSupport.update(dt,input);this.updateProjectiles(dt);if(s.dead||s.ended)return;this.updateAlien(dt,input);this.updateEnemies(dt);this.signals.update(dt,input);
 if(!input.interact)this.requireRelease=false;
 if(input.interact&&!this.requireRelease)this.interact(dt);else if(this.hold){this.hold=null;}
 }
 targets(){
 const s=this.s;if(s.hidden)return[{id:'unhide',type:'unhide',label:'Sortir du casier',x:s.x,y:s.y,hold:.2,distance:0}];
 let ts=doors(s.room).map(e=>({id:e.id,type:'door',label:`${e.spatial.labelId} · ${ROOMS[e.destination].name} · ${passageReason(e,s,this.sealed(e.id))}`,x:e.point.x,y:e.point.y,hold:.22,edge:e,locked:!available(e,s)}));
 if(this.goal?.room===s.room)ts.push({...this.goal,type:'goal'});
 for(const p of this.room.props){if(['hide','save','loot','rewire','thermal','oxygen'].includes(p.interactive)&&!(p.interactive==='loot'&&s.opened.includes(p.id)))ts.push({id:p.id,type:p.interactive,x:p.x,y:p.y,label:{oxygen:s.lifeSupport.used.includes(p.id)?'Bouteille vide':'Raccorder la bouteille O₂ · une recharge',hide:'Se cacher dans le casier',save:'Enregistrer la progression',loot:'Fouiller la réserve',thermal:'Purger la chaleur de l’interface',rewire:'Dériver le circuit · '+['éclairage normal','éclairage coupé','ventilation détournée'][s.systems[s.room]?.mode||0]}[p.interactive],hold:{oxygen:1.5,hide:.25,save:2.6,loot:.8,rewire:1.1,thermal:1.1}[p.interactive],prop:p});}
 for(const task of CONTENT.optional||[])if(task.room===s.room&&!s.optional.includes(task.id)&&(!task.flag||s.flags[task.flag]))ts.push({...task,type:'optional',hold:1.1});
 const log=CONTENT.logs.find(l=>l.room===s.room&&!s.read.includes(l.id));if(log)ts.push({id:log.id,type:'log',x:this.room.w*.38,y:this.room.view==='SIDE'?300:170,label:`Lire : ${log.title}`,hold:.4,log});
 ts.push(...this.protocols.extraTargets(),...this.encounters.targets(),...this.refuges.targets(),...this.signals.targets());
 ts=ts.filter(t=>!(t.type==='hide'&&s.encounters.rescues.some(n=>n.locker===t.id&&['seeking','hiding'].includes(n.status))));
 return ts.map(t=>({...t,distance:distance(s,t)})).filter(t=>t.distance<87&&(t.type!=='door'||portalApproach(s.room,s,t.edge))).sort((a,b)=>a.distance-b.distance||(a.type==='goal'?-1:1));
 }
 interact(dt){
 if(this.cooldown>0||this.pendingHack||this.s.dead)return;
 const t=this.targets()[0];if(!t){this.hold=null;return;}
 if(!this.hold||this.hold.id!==t.id)this.hold={id:t.id,value:0,total:t.hold,type:t.type};this.hold.value+=dt;
 if(this.hold.value>=t.hold){this.hold=null;this.cooldown=.55;this.use(t);this.requireRelease=true;}
 }
 use(t){
 const s=this.s;if(s.dead||s.ended||!t||distance(s,t)>88)return false;
 if(t.type==='signal-charge')return this.signals.recharge(t);
 if(['refuge','supply'].includes(t.type))return this.refuges.use(t);
 if(['rescue','alarm','body'].includes(t.type))return this.encounters.use(t);
 if(t.type==='door')return this.enter(t.edge);
 if(t.type==='oxygen')return this.lifeSupport.refill(t.prop);
 if(t.type==='thermal')return this.protocols.relief();
 if(t.type==='circuit')return this.protocols.wrongCircuit(t);
 if(t.type==='rewire')return this.rewire(t.prop);
 if(t.type==='optional'){const task=(CONTENT.optional||[]).find(x=>x.id===t.id);if(!task||s.optional.includes(t.id)||task.room!==s.room||task.flag&&!s.flags[task.flag])return false;s.optional.push(t.id);s.stats.optional++;for(const [k,n]of Object.entries(task.reward||{})){if(k==='fuel')s.fuel=clamp(s.fuel+n,0,180);else if(Object.hasOwn(s.inventory,k))s.inventory[k]=clamp(s.inventory[k]+n,0,200);}this.protocols.onOptional(task);this.message(task.reply,'archive');this.emitNoise(s.x,s.y,.3);return true;}
 if(t.type==='unhide'){s.hidden=null;Object.assign(s,safePosition(s.room,s.hiddenOrigin||s));s.hiddenOrigin=null;this.message('Vous quittez le casier.');return true;}
 if(t.type==='hide'){
  const a=s.alien;if(a.active&&a.room===s.room&&a.mode!=='vent'&&this.sees(a,s,this.difficulty.sight,s.room))a.seenHide=t.id;
  this.aim=null;s.hiddenOrigin={x:s.x,y:s.y};s.hidden=t.id;s.x=t.x;s.y=t.y;this.message('Dans le casier · B : retenir le souffle · E : sortir.');return true;
 }
 if(t.type==='save'){const a=s.alien;if(s.alert>45||a.active&&a.room===s.room&&a.mode==='chase'){this.message('La borne ne peut pas terminer pendant la poursuite.','warning');return false;}this.save();this.message('Progression enregistrée.');return true;}
 if(t.type==='loot'){if(s.opened.includes(t.id))return false;s.opened.push(t.id);s.inventory.scrap+=2;s.inventory.chemical+=1;s.inventory.battery+=1;if(s.tools.flame)s.fuel=Math.min(160,s.fuel+16);this.message('Réserve ouverte : +2 pièces, +1 produit, +1 pile.');return true;}
 if(t.type==='log'){if(!s.read.includes(t.id))s.read.push(t.id);this.message(`${t.log.title} — ${t.log.text}`,'archive');return true;}
 if(t.type==='goal'&&t.id===this.goal?.id){
  if(t.mode==='hack'){const seq=Array.from({length:3},()=>Math.floor(this.random()*4));this.pendingHack={goal:t.id,sequence:seq,index:0};this.message('Syntoniseur : reproduisez la séquence. Le temps continue.');return true;}
  this.finishGoal(t);return true;
 }return false;
 }
 hack(symbol){
 const h=this.pendingHack;if(!h||this.s.dead)return false;
 if(this.goal?.id!==h.goal||this.goal.room!==this.s.room||distance(this.s,this.goal)>90){this.pendingHack=null;return false;}
 if(symbol!==h.sequence[h.index]){h.index=0;this.s.stats.failures++;this.emitNoise(this.s.x,this.s.y,1.7);this.message('Mauvaise fréquence. La console a émis une alarme.','warning');return false;}
 h.index++;if(h.index===h.sequence.length){this.pendingHack=null;this.s.stats.hacks++;this.finishGoal(this.goal);}return true;
 }
 finishGoal(g){
 const s=this.s;if(g.id!==this.goal?.id||g.room!==s.room||distance(s,g)>90)return false;
 if(!this.protocols.beforeGoal(g))return false;
 if(g.flag==='purge'&&(!s.flags.alpha||!s.flags.beta))return false;
 if(g.flag)s.flags[g.flag]=true;if(g.tool)s.tools[g.tool]=true;if(g.fuel)s.fuel=Math.min(180,s.fuel+g.fuel);
 if(g.flag==='weaponsDeposited'){s.stashedFuel=s.fuel;s.fuel=0;s.tools.flame=false;}
 if(g.flag==='weaponsReturned'){s.tools.flame=true;s.fuel=Math.min(180,s.fuel+s.stashedFuel);s.stashedFuel=0;}
 if(g.flag==='hunt'){const a=s.alien;a.suspicion=0;a.groundTime=0;a.cue=false;a.memory=null;a.active=true;a.mode='vent';a.timer=4;a.room='m_corridor';a.x=ROOMS[a.room].vents[0].x;a.y=300;}
 if(g.flag==='detached'){s.alien.active=false;s.flags.postGemini=true;}
 if(g.flag==='purge'){const a=s.alien;a.suspicion=0;a.groundTime=0;a.cue=false;a.memory=null;a.active=true;a.room='r_hive';a.x=ROOMS[a.room].vents[0].x;a.y=300;a.timer=4;a.mode='vent';s.flags.postGemini=false;}

 if(g.flag==='anesidora'){s.effects.push({kind:'overload',life:25,x:s.x,y:s.y});}
 this.protocols.onGoal(g);
 s.completed.push(g.id);s.stats.actions++;s.goal++;const next=CONTENT.goals[s.goal];s.chapter=next?next.chapter:18;
 this.message(g.reply,'dialogue');this.emitNoise(s.x,s.y,g.mode==='switch'?.7:.25);
 if(!next){s.ended=true;s.flags.ending=true;this.save();}
 else if(this.difficulty.autosave)this.save();return true;
 }
 enter(edge){
 const s=this.s;edge=doors(s.room).find(d=>d.id===edge?.id&&d.destination===edge?.destination);if(!edge||!portalApproach(s.room,s,edge)||!available(edge,s)){this.message('Accès non disponible : poursuivez l’objectif indiqué.','warning');return false;}
 if(edge.kind==='vent'&&!s.crouched){this.message('Accroupissez-vous pour entrer dans le conduit.','warning');return false;}
 if(this.sealed(edge.id)){this.message('Verrou maintenu : T pour le relâcher ou attendre son ouverture.','warning');return false;}
 if(!this.lifeSupport.beforePassage(edge))return false;
 const old=s.room,room=edge.destination;this.aim=null;s.room=room;this.requireRelease=true;const raw=edge.arrivalPortal.arrival;s.spatial.lastPortal=edge.id;
 Object.assign(s,safePosition(room,raw));s.hidden=null;s.hiddenOrigin=null;s.tracker=false;s.actor=ROOMS[room].sector==='SOUVENIR'?'Marlow':'Amanda';if(!s.visited.includes(room))s.visited.push(room);s.stats.transitions++;s.effects=[];this.cooldown=.9;this.pendingHack=null;
 const terms={memory:'Souvenir de Marlow',tram:'Transfert en tram',lift:'Ascenseur',stairs:'Changement de niveau',shuttle:'Transfert en navette',transfer:'Traversée extérieure',vent:'Conduit de maintenance',walkway:'Passerelle ouverte',passage:'Arche organique'};
 this.encounters.onPassage(edge,old);
 this.message(`${terms[edge.kind]||'Passage'} · ${ROOMS[room].name}`);this.events.push({type:'transition',from:old,to:room,time:+s.time.toFixed(2)});return true;
 }
 craft(kind){
 const recipes={flare:{chemical:1,scrap:1},noise:{scrap:2,battery:1},emp:{scrap:2,battery:2},medkit:{chemical:2,scrap:1}},r=recipes[kind],i=this.s.inventory;
 if(!Object.hasOwn(recipes,kind)||!r||this.paused||this.pendingHack||this.s.hidden||this.s.dead||this.s.ended||this.s.inventory[kind]>=200||this.signals.swap)return false;if(Object.entries(r).some(([k,n])=>i[k]<n)){this.message('Composants insuffisants.','warning');return false;}
 for(const [k,n]of Object.entries(r))i[k]-=n;i[kind]++;this.s.stats.crafted++;this.emitNoise(this.s.x,this.s.y,.15);this.message('Fabrication terminée.');return true;
 }
 throwPlan(target=null){
  const s=this.s,r=this.room;
  if(target&&(!Number.isFinite(target.x)||!Number.isFinite(target.y)))return null;
  const wanted=target||{x:s.x+s.face*250,y:s.y},dx=wanted.x-s.x,dy=r.view==='SIDE'?0:wanted.y-s.y,len=Math.hypot(dx,dy)||1,range=Math.min(360,len);
  let point={x:s.x,y:s.y},blocked=false,points=[{...point}];
  for(let t=8;t<=range+7;t+=8){const d=Math.min(t,range),next={x:s.x+dx/len*d,y:s.y+dy/len*d};if(!walkable(s.room,next.x,next.y,9)){blocked=true;break;}point=next;points.push({...point});}
  return{point,points,blocked,distance:distance(s,point)};
 }
 beginAim(){if(this.paused||this.s.dead||this.s.ended||this.s.hidden||this.pendingHack)return false;if(this.s.signals.selected==='medkit'){this.message('Choisissez un objet à lancer avec Tab. H reste disponible pour les soins.');return false;}this.aim={kind:this.s.signals.selected,target:{x:this.s.x+this.s.face*250,y:this.s.y}};return true;}
 setAim(target){if(!this.aim||!target||!Number.isFinite(target.x)||!Number.isFinite(target.y))return false;this.aim.target={x:target.x,y:target.y};return true;}
 deploy(kind,target=null){
  const s=this.s;if(this.paused||s.dead||s.ended||s.hidden||this.pendingHack||!['flare','noise','emp'].includes(kind)||s.inventory[kind]<=0||s.throwCooldown>0||this.signals.swap)return false;
  if(s.projectiles.length>=CONTENT.flight.capacity){this.message('Trop d’objets encore en vol. Attendez leur activation.');return false;}
  const plan=this.throwPlan(target||this.aim?.target);if(!plan||plan.distance<24){s.stats.blockedThrows++;this.message('Trajectoire obstruée : dégagez le point de lancement.','warning');return false;}
  s.inventory[kind]--;s.stats.throws++;s.throwCooldown=CONTENT.flight.cooldown;
  if(this.aim)this.aim.kind=kind;
  const p={id:s.stats.throws,room:s.room,kind,fromX:s.x,fromY:s.y,toX:plan.point.x,toY:plan.point.y,x:s.x,y:s.y,elapsed:0,duration:Math.max(CONTENT.flight.minimumDuration,plan.distance/CONTENT.flight.speed),fuse:CONTENT.flight.fuse[kind],stage:'flight',blocked:plan.blocked};
  s.projectiles.push(p);this.events.push({type:'item-thrown',kind,room:p.room,x:p.toX,y:p.toY,blocked:p.blocked,time:+s.time.toFixed(2)});
  this.emitNoise(s.x,s.y,.12);return true;
 }
 updateProjectiles(dt){
  const s=this.s;
  for(const p of s.projectiles){
   let left=dt;
   if(p.stage==='flight'){
    const used=Math.min(left,p.duration-p.elapsed);p.elapsed=Math.min(p.duration,p.elapsed+used);left-=used;
    const t=p.elapsed/p.duration;p.x=p.fromX+(p.toX-p.fromX)*t;p.y=p.fromY+(p.toY-p.fromY)*t;
    if(p.elapsed>=p.duration){p.stage='armed';p.x=p.toX;p.y=p.toY;this.events.push({type:'item-landed',kind:p.kind,room:p.room,x:p.x,y:p.y,time:+s.time.toFixed(2)});}
   }
   if(p.stage==='armed'){
    p.fuse=Math.max(0,p.fuse-left);
    if(p.fuse===0){
     if(p.kind==='emp'){
      const hit=[];for(const en of s.enemies)if(en.hp>0&&en.min<=s.chapter&&en.kind==='joe'&&en.room===p.room&&distance(en,p)<CONTENT.flight.empRadius&&clearSight(p.room,p,en)){en.stun=Math.max(en.stun,8);hit.push(en.id);}
      s.effects.push({kind:'emp',room:p.room,x:p.x,y:p.y,life:1.1});this.events.push({type:'emp-impact',room:p.room,hit,time:+s.time.toFixed(2)});
     }else s.decoys.push({room:p.room,kind:p.kind,x:p.x,y:p.y,life:p.kind==='noise'?13:18,pulse:p.kind==='noise'?.9:2.2});
     this.emitNoise(p.x,p.y,p.kind==='noise'?1.8:.7,p.room);p.stage='spent';
     this.events.push({type:'item-activated',kind:p.kind,room:p.room,x:p.x,y:p.y,time:+s.time.toFixed(2)});
    }
   }
  }
  s.projectiles=s.projectiles.filter(p=>p.stage!=='spent');
 }

 heal(){const s=this.s;if(this.paused||this.pendingHack||s.hidden||s.ended||this.signals.swap||s.inventory.medkit<=0||s.health>=100||s.dead)return false;s.inventory.medkit--;s.health=Math.min(100,s.health+55);this.message('Soins appliqués.');return true;}
 flame(){
 const s=this.s;if(isVacuum(s.room))return false;if(this.paused||this.pendingHack||s.ended||this.signals.swap||!s.tools.flame||s.fuel<8||s.hidden||this.flameCooldown>0||s.dead)return false;
 s.fuel-=8;this.flameCooldown=.32;s.stats.flameUses++;s.effects.push({kind:'flame',x:s.x,y:s.y,face:s.face,life:.45});this.emitNoise(s.x,s.y,.85);
 const a=s.alien,hit=e=>e.room===s.room&&distance(e,s)<330&&(e.x-s.x)*s.face>=-20&&Math.abs(e.y-s.y)<92&&clearSight(s.room,s,e);
 if(a.active&&a.mode!=='vent'&&hit(a)){a.mode='retreat';a.timer=Math.max(2.2,7-a.habit*.8);a.habit=Math.min(6,a.habit+1);a.memory=null;a.seenHide=null;this.message('La créature recule. Le carburant reste limité.','warning');}
 for(const e of s.enemies)if(hit(e)){if(e.kind==='facehugger'){e.hp=0;}else{e.hp=Math.max(0,e.hp-35);e.stun=Math.max(e.stun,1.5);}}return true;
 }
 damage(amount,source){if(this.s.dead||this.hurtCooldown>0)return;this.s.health=Math.max(0,this.s.health-amount);this.s.stats.damage+=amount;this.hurtCooldown=1.1;this.s.alert=100;if(this.hold?.type==='signal-charge'){this.hold=null;this.requireRelease=true;}if(this.s.health<=0){this.s.dead=true;this.pendingHack=null;this.hold=null;this.message(`Vous n’avez pas survécu · ${source}.`,'danger');}else this.message(`${source} · ${Math.ceil(amount)} dégâts`,'warning');}
 enemyMove(e,target,speed,dt){
 if(!target)return;const r=ROOMS[e.room];if(r.view==='SIDE'){this.move(e,Math.sign(target.x-e.x)*Math.min(Math.abs(target.x-e.x),speed*dt),0,e.room);return;}
 const key=e.id||'alien';let c=this.enemyPaths.get(key);if(!c||c.room!==e.room||distance(c.target,target)>110||c.expires<this.s.time){c={room:e.room,target:{x:target.x,y:target.y},expires:this.s.time+1.5,path:pathTo(e.room,e,target)};this.enemyPaths.set(key,c);}
 while(c.path.length&&distance(e,c.path[0])<20)c.path.shift();const dest=c.path[0]||target,dx=dest.x-e.x,dy=dest.y-e.y,l=Math.hypot(dx,dy)||1;const travel=Math.min(l,speed*dt);this.move(e,dx/l*travel,dy/l*travel,e.room);
 }
 updateAlien(dt,input){
 const s=this.s,a=s.alien;if(!a.active||this.protocols.controlsAlien())return;s.stats.alienSteps++;
 a.timer-=dt;a.suspicion=a.suspicion||0;a.groundTime=a.groundTime||0;
 if(a.memory)a.memory.ttl-=dt;if(a.memory?.ttl<=0)a.memory=null;
 if(a.mode==='vent'){
  if(a.timer<1.8&&!a.cue){a.cue=true;this.events.push({type:'alien-cue',room:a.room,time:+s.time.toFixed(2)});this.signals.hear(a,.9,'Grille métallique');if(a.room===s.room)this.message('Une grille grince. Quelque chose descend.','warning');}
  if(a.timer<=0){a.mode='patrol';a.timer=5;a.groundTime=0;a.cue=false;this.events.push({type:'alien-emergence',room:a.room,time:+s.time.toFixed(2)});}
  return;
 }
 a.groundTime+=dt;
 if(a.mode==='retreat'){
  const dest=safePosition(a.room,ROOMS[a.room].vents[0]);this.enemyMove(a,dest,300,dt);
  if(a.timer<=0&&distance(a,dest)<48){a.mode='vent';a.timer=this.difficulty.restTime;a.x=dest.x;a.y=dest.y;a.memory=null;a.groundTime=0;a.suspicion=0;a.seenHide=null;s.stats.escapes++;}
  return;
 }
 const same=a.room===s.room;
 const darkness=s.systems[s.room]?.mode===1?.58:1;
 const range=this.difficulty.sight*(s.crouched?.58:1)*(s.torch?1.6:darkness);
 const visible=same&&!s.hidden&&this.sees(a,s,range,s.room);
 if(visible){
  a.suspicion=Math.min(1,a.suspicion+dt/this.difficulty.notice);
  s.alert=Math.max(s.alert,a.suspicion*100);
  if(a.suspicion>=1){if(a.mode!=='chase'){s.stats.detections++;this.events.push({type:'alien-detection',room:a.room,time:+s.time.toFixed(2)});}a.mode='chase';a.memory={room:s.room,x:s.x,y:s.y,ttl:7,strength:2};}
 }else a.suspicion=Math.max(0,a.suspicion-dt*.6);
 if(same&&s.hidden&&a.seenHide===s.hidden){a.memory={room:s.room,x:s.x,y:s.y,ttl:10,strength:2};a.mode='chase';}
 if(same&&s.hidden&&!a.seenHide&&distance(a,s)<80&&!(input.breath&&s.breath>0)&&s.noise>10)a.seenHide=s.hidden;
 if(same&&distance(a,s)<30&&(s.hidden?a.seenHide===s.hidden:clearSight(s.room,a,s))){this.damage(100,'Le Xénomorphe');return;}
 if(this.encounters.predation(dt,visible))return;
 if(a.memory){
  if(a.memory.room===a.room){
   this.enemyMove(a,a.memory,a.mode==='chase'?this.difficulty.alienSpeed:112,dt);
   if(distance(a,a.memory)<28&&!visible){a.mode='search';a.timer-=dt;if(a.timer<=0){a.memory=null;a.timer=3;}}
  }else{
   const rr=route(a.room,a.memory.room,s,false,e=>!ROOMS[e.destination].safe&&['door','vent','stairs'].includes(e.kind));
   if(rr?.length)this.alienTraverse(rr[0],dt);else a.memory=null;
  }
 }else{
  // Withdraw physically through a grille after a finite unsuccessful search.
  // No player coordinates are sampled to choose a new room or a destination.
  if(a.groundTime>this.difficulty.searchTime&&!visible){a.mode='retreat';a.timer=1;a.travel=null;a.destination=null;return;}
  if(a.travel){const edge=doors(a.room).find(e=>e.id===a.travel);if(edge&&available(edge,s)){this.alienTraverse(edge,dt);return;}a.travel=null;}
  a.mode=a.mode==='search'?'search':'patrol';
  if(!a.destination||a.destination.room!==a.room)a.destination={room:a.room,...safePosition(a.room,{x:120+this.random()*(ROOMS[a.room].w-240),y:ROOMS[a.room].view==='SIDE'?300:120+this.random()*245})};
  this.enemyMove(a,a.destination,this.difficulty.patrol,dt);
  if(distance(a,a.destination)<45||a.timer<-8){
   a.destination=null;a.timer=5;
   const es=doors(a.room).filter(e=>available(e,s)&&!ROOMS[e.destination].safe&&['door','vent','stairs'].includes(e.kind)&&e.destination!==a.lastRoom);
   if(es.length)a.travel=es[Math.floor(this.random()*es.length)].id;
  }
 }
 }
 alienTraverse(edge,dt){
 const a=this.s.alien;if(this.protocols.moduleLocked(edge.id)){a.travel=null;a.memory=null;return;}this.enemyMove(a,edge.point,175,dt);if(distance(a,edge.point)>=45)return;
 if(this.sealed(edge.id)){
  if(a.breach?.id!==edge.id){a.breach={id:edge.id,left:3.4};this.signals.hear(a,1.1,'Chocs sur une porte');if(a.room===this.s.room||edge.destination===this.s.room)this.message('Le verrou encaisse des chocs. Éloignez-vous de la porte.','warning');}
  a.breach.left-=dt;if(a.breach.left>0)return;
  delete this.s.seals[edge.id];this.s.stats.breaches++;
 }
 // A threshold is crossed only once the creature has physically reached it.
 a.breach=null;a.lastRoom=a.room;a.room=edge.destination;
 Object.assign(a,safePosition(a.room,{x:edge.arrival.x,y:ROOMS[a.room].view==='SIDE'?300:edge.arrival.y+30}));
 a.travel=null;a.destination=null;a.timer=5;this.enemyPaths.delete('alien');
 this.events.push({type:'alien-threshold',room:a.room,time:+this.s.time.toFixed(2)});
 }

 updateEnemies(dt){
 const s=this.s;for(const e of s.enemies){if(e.min>s.chapter||e.hp<=0)continue;e.cool=Math.max(0,e.cool-dt);e.stun=Math.max(0,e.stun-dt);if(e.room!==s.room||e.stun>0)continue;
 e.escortCool=Math.max(0,(e.escortCool||0)-dt);if(e.kind!=='human'&&e.escortCool===0){const n=s.encounters.rescues.find(n=>n.room===e.room&&['follow','wait','seeking'].includes(n.status)&&distance(n,e)<42&&clearSight(e.room,e,n));if(n){this.encounters.hurt(n,this.difficulty.damage,e.kind==='joe'?'Working Joe':'Facehugger');e.escortCool=2.5;}}
 const range=(e.kind==='facehugger'?210:e.kind==='human'?290:260)*(s.crouched?.45:1)*(s.torch?1.3:1),visible=!s.hidden&&this.sees(e,s,range*(s.systems[s.room]?.mode===1&&!s.torch?.65:1),s.room);
 if(e.memory)e.memory.ttl-=dt;if(visible)e.memory={x:s.x,y:s.y,ttl:5};if(e.memory?.ttl<=0)e.memory=null;
 const allowed=e.kind!=='human'||this.encounters.guard(e,visible,dt);
 const target=e.memory||{x:e.home+Math.sin(s.time*.19)*150,y:e.y};if(allowed||!visible)this.enemyMove(e,target,visible?(e.kind==='facehugger'?170:e.kind==='joe'?104:76):40,dt);
 if(!visible||distance(e,s)>(e.kind==='human'?220:36))e.windup=0;
 if(visible&&allowed){s.alert=Math.max(s.alert,e.kind==='human'?70:50);const hit=e.kind==='human'?distance(e,s)<220:distance(e,s)<36;if(hit&&e.cool<=0){e.windup=(e.windup||0)+dt;if(e.windup< (e.kind==='human'?.65:.4))continue;e.windup=0;e.cool=e.kind==='facehugger'?2:2.5;this.damage(this.difficulty.damage*(e.kind==='facehugger'?1.5:1),e.kind==='joe'?'Working Joe':e.kind==='human'?'Survivant hostile':'Facehugger');s.effects.push({room:s.room,kind:e.kind==='human'?'shot':'hit',x:e.x,y:e.y,toX:s.x,toY:s.y,life:.22});if(e.kind==='human')this.emitNoise(e.x,e.y,1.5);}}
 }
 }
 detector(){return this.signals.readout();}
 save(){this.s.checkpointCount++;this.checkpoint=this.serialize();this.savePending=true;return this.checkpoint;}
 serialize(){return JSON.stringify({schema:1,id:CONTENT.meta.id,state:this.s});}
 load(text){
 if(typeof text!=='string'||text.length>2e6)return{ok:false,error:'Sauvegarde trop volumineuse ou invalide.'};
 let raw;try{raw=JSON.parse(text);}catch{return{ok:false,error:'Sauvegarde illisible.'};}const v=raw?.state;
 if(raw?.schema!==1||raw.id!==CONTENT.meta.id||!v||typeof v.room!=='string'||!Object.hasOwn(ROOMS,v.room)||!Number.isInteger(v.goal)||v.goal<0||v.goal>CONTENT.goals.length)return{ok:false,error:'Format ou version de sauvegarde incompatible.'};
 // Reconstruct allowlisted state instead of merging untrusted dictionaries / prototypes.
 const base=initialState(v.difficulty,v.seed);for(const key of ['room','goal'])base[key]=v[key];base.seed=Number.isFinite(v.seed)?v.seed>>>0:20141007;base.actor=ROOMS[v.room].sector==='SOUVENIR'?'Marlow':'Amanda';base.classic=v.classic===true;
 base.chapter=CONTENT.goals[base.goal]?.chapter??18;base.health=clamp(Number.isFinite(Number(v.health))?Number(v.health):100,0,100);base.dead=v.dead===true||base.health===0;base.time=clamp(Number(v.time)||0,0,1e8);base.fuel=clamp(Number(v.fuel)||0,0,180);base.stashedFuel=clamp(Number(v.stashedFuel)||0,0,180);base.face=v.face===-1?-1:1;
 const allowedFlags=new Set(CONTENT.goals.map(g=>g.flag).filter(Boolean).concat(['postGemini']));for(const k of allowedFlags)base.flags[k]=v.flags?.[k]===true;
 for(const task of CONTENT.optional||[])if(Array.isArray(v.optional)&&v.optional.includes(task.id))base.optional.push(task.id);
 base.favorites=Array.isArray(v.favorites)?[...new Set(v.favorites.filter(id=>Object.hasOwn(ROOMS,id)))]:[];
 for(const room of Object.keys(ROOMS)){const sys=v.systems?.[room];if(sys&&[0,1,2].includes(sys.mode))base.systems[room]={mode:sys.mode,until:clamp(Number(sys.until)||0,0,base.time+24),pulse:clamp(Number(sys.pulse)||0,0,3)};}
 for(const edge of CONTENT.links){const until=Number(v.seals?.[edge.id]);if(edge.kind==='door'&&Number.isFinite(until)&&until>base.time)base.seals[edge.id]=Math.min(until,base.time+18);}
 for(const k in base.tools)base.tools[k]=v.tools?.[k]===true;for(const k in base.inventory)base.inventory[k]=clamp(Math.floor(Number(v.inventory?.[k])||0),0,200);
 base.visited=Array.isArray(v.visited)?[...new Set(v.visited.filter(x=>Object.hasOwn(ROOMS,x)))]:[v.room];if(!base.visited.includes(base.room))base.visited.push(base.room);
 const propIds=new Set(CONTENT.rooms.flatMap(r=>r.props.map(p=>p.id)));base.opened=Array.isArray(v.opened)?v.opened.filter(x=>propIds.has(x)):[];base.read=Array.isArray(v.read)?v.read.filter(x=>CONTENT.logs.some(l=>l.id===x)):[];
 base.completed=CONTENT.goals.slice(0,v.goal).map(g=>g.id);base.ended=base.goal===CONTENT.goals.length;base.crouched=!!v.crouched;base.torch=!!v.torch;base.checkpointCount=clamp(Number(v.checkpointCount)||0,0,1e6);
 for(const k in base.stats)base.stats[k]=clamp(Number(v.stats?.[k])||0,0,1e9);
 const a=v.alien;if(a&&Object.hasOwn(ROOMS,a.room)){base.alien.active=a.active===true;base.alien.room=a.room;base.alien.mode=a.mode;base.alien.face=a.face===-1?-1:1;base.alien.lastRoom=Object.hasOwn(ROOMS,a.lastRoom)?a.lastRoom:null;if(!['vent','patrol','search','investigate','chase','retreat'].includes(base.alien.mode))base.alien.mode='vent';base.alien.timer=clamp(Number(a.timer)||0,-10,50);base.alien.habit=clamp(Number(a.habit)||0,0,6);Object.assign(base.alien,safePosition(a.room,{x:Number(a.x)||80,y:Number(a.y)||300}));}
 const cleanMemory=m=>m&&typeof m==='object'&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&Number.isFinite(m.ttl)?{x:clamp(m.x,35,2400),y:clamp(m.y,110,390),ttl:clamp(m.ttl,0,50),strength:clamp(Number(m.strength)||0,0,3)}:null;
 if(a&&Object.hasOwn(ROOMS,a.room)){if(Object.hasOwn(ROOMS,a.memory?.room)){const m=cleanMemory(a.memory);if(m)base.alien.memory={...m,room:a.memory.room};}if(a.destination?.room===a.room)base.alien.destination={room:a.room,...safePosition(a.room,a.destination)};base.alien.travel=doors(a.room).some(e=>e.id===a.travel)?a.travel:null;base.alien.seenHide=propIds.has(a.seenHide)?a.seenHide:null;base.alien.groundTime=clamp(Number(a.groundTime)||0,0,120);base.alien.suspicion=clamp(Number(a.suspicion)||0,0,1);base.alien.cue=a.cue===true;base.alien.containmentIndex=clamp(Math.trunc(Number(a.containmentIndex)||0),0,2);if(a.breach&&doors(a.room).some(e=>e.id===a.breach.id))base.alien.breach={id:a.breach.id,left:clamp(Number(a.breach.left)||0,0,3.4)};}
 base.decoys=Array.isArray(v.decoys)?v.decoys.slice(0,30).filter(d=>d&&Object.hasOwn(ROOMS,d.room)&&['noise','flare'].includes(d.kind)&&Number.isFinite(d.x)&&Number.isFinite(d.y)).map(d=>({room:d.room,kind:d.kind,x:clamp(d.x,35,ROOMS[d.room].w-35),y:clamp(d.y,110,390),life:clamp(Number(d.life)||0,0,35),pulse:clamp(Number(d.pulse)||0,0,3)})):[];
 for(const e of base.enemies){const src=Array.isArray(v.enemies)&&v.enemies.find(x=>x.id===e.id);if(src){e.hp=clamp(Number(src.hp)||0,0,150);Object.assign(e,safePosition(e.room,{x:Number(src.x)||e.x,y:Number(src.y)||e.y}));e.stun=clamp(Number(src.stun)||0,0,10);e.cool=clamp(Number(src.cool)||0,0,5);e.memory=cleanMemory(src.memory);e.face=src.face===-1?-1:1;e.windup=clamp(Number(src.windup)||0,0,.65);e.disposition=['calm','warning','hostile'].includes(src.disposition)?src.disposition:'calm';e.warning=clamp(Number(src.warning)||0,0,2);e.quiet=clamp(Number(src.quiet)||0,0,6);e.escortCool=clamp(Number(src.escortCool)||0,0,2.5);}}
 Object.assign(base,safePosition(base.room,{x:Number(v.x)||180,y:Number(v.y)||300}));if(ROOMS[base.room].view==='SIDE')base.y=300;
 const hiding=ROOMS[base.room].props.find(p=>p.id===v.hidden&&p.interactive==='hide');if(hiding){base.hidden=hiding.id;base.hiddenOrigin=safePosition(base.room,v.hiddenOrigin||base);base.x=hiding.x;base.y=hiding.y;base.breath=clamp(Number(v.breath)||0,0,100);}
 // Normalize refuge prerequisites first, then pass them to the escort timer clamp.
 base.refuges=cleanRefuges(v.refuges,{encounters:v.encounters});
 base.encounters=cleanEncounters(v.encounters,base);
 base.refuges=cleanRefuges(base.refuges,base);
 for(const part of CONTENT.refuges.flatMap(r=>r.parts))if(base.refuges.parts.includes(part.id)||base.refuges.consumed.includes(part.id)){if(!base.opened.includes('supply.'+part.id))base.opened.push('supply.'+part.id);}
 base.protocols=cleanProtocols(v.protocols,base);
 base.lifeSupport=cleanLifeSupport(v.lifeSupport,base);
 base.throwCooldown=clamp(Number(v.throwCooldown)||0,0,CONTENT.flight.cooldown);
 base.projectiles=Array.isArray(v.projectiles)?v.projectiles.slice(0,CONTENT.flight.capacity).filter(p=>p&&Object.hasOwn(ROOMS,p.room)&&['noise','flare','emp'].includes(p.kind)&&['flight','armed'].includes(p.stage)&&['fromX','fromY','toX','toY','elapsed','duration','fuse'].every(k=>Number.isFinite(p[k]))&&walkable(p.room,p.fromX,p.fromY,9)&&walkable(p.room,p.toX,p.toY,9)&&Math.hypot(p.toX-p.fromX,p.toY-p.fromY)<=360.01).map(p=>{
  const from={x:p.fromX,y:p.fromY},to={x:p.toX,y:p.toY},duration=clamp(p.duration,CONTENT.flight.minimumDuration,360/CONTENT.flight.speed),elapsed=clamp(p.elapsed,0,duration),t=p.stage==='armed'?1:elapsed/duration;
  return{id:clamp(Math.floor(Number(p.id)||0),0,1e9),room:p.room,kind:p.kind,stage:p.stage,fromX:from.x,fromY:from.y,toX:to.x,toY:to.y,x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,duration,elapsed,fuse:clamp(p.fuse,0,CONTENT.flight.fuse[p.kind]),blocked:p.blocked===true};
 }):[];
 base.spatial={waypoint:Object.hasOwn(ROOMS,v.spatial?.waypoint)?v.spatial.waypoint:null,lastPortal:CONTENT.links.some(e=>e.id===v.spatial?.lastPortal)?v.spatial.lastPortal:null};base.signals=cleanSignals(v.signals);this.hurtCooldown=0;this.frameTravel=0;this.s=base;this.signals.reset();this.aim=null;this.pendingHack=null;this.hold=null;this.enemyPaths.clear();this.requireRelease=true;this.cooldown=.6;this.checkpoint=this.serialize();this.paused=false;this.message('Progression restaurée.');return{ok:true};
 }
 restore(){const snap=this.checkpoint;const result=this.load(snap);this.savePending=true;return result;}
}
