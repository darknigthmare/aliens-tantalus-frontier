import { initialFidelityV11, upgradeFidelityV11, withEarthFidelityV11 } from './alien-earth-fidelity-v11.js';
import { initialFidelityGearV10, upgradeFidelityV10, withEarthFidelityV10 } from './alien-earth-fidelity-v10.js';
import { initialSecurityV9, upgradeSecurityV9, withEarthSecurityV9 } from './alien-earth-security-v9.js';
import { initialInvestigationsV8, upgradeInvestigationsV8, withEarthInvestigationsV8 } from './alien-earth-investigations-v8.js';
import { initialDuctsV7, upgradeDuctsV7, withEarthDuctsV7, ductFanStateV7, ductEjectV7 } from './alien-earth-ducts-v7.js';
import { initialSensorsV6, upgradeSensorsV6, withEarthSensorsV6 } from './alien-earth-sensors-v6.js';
import { initialContainmentV5, upgradeContainmentV5, withEarthContainmentV5, containedIdsV5 } from './alien-earth-containment-v5.js';
import { initialServicesV4, upgradeServicesV4, withEarthServicesV4 } from './alien-earth-services-v4.js';
import { EARTH_DATA } from './alien-earth-data.js';

export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const clone=v=>JSON.parse(JSON.stringify(v));
export const ROOM_BY_ID=Object.fromEntries(EARTH_DATA.rooms.map(r=>[r.id,r]));
export const CHARACTER_BY_ID=Object.fromEntries(EARTH_DATA.characters.map(c=>[c.id,c]));
export const SAVE_KEY='atf.dlc.alien-earth.s1.profile-1';
export const TASK_IDS=new Set(EARTH_DATA.rooms.map(r=>r.task.id));
export const ARCHIVE_IDS=new Set(EARTH_DATA.rooms.map(r=>r.archive.id));
export const isFiniteNumber=n=>typeof n==='number' && Number.isFinite(n);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
// V3 keeps one authoritative room per encounter identity. It does not merge
// several authored encounters into a claim about a single canonical individual.
export const ENEMY_SPAWNS=Object.fromEntries(EARTH_DATA.rooms.flatMap(r=>r.enemies.map(e=>[e.id,{...e,originRoom:r.id}])));
export const doorKey=d=>[d.id.split('>')[0],d.to].sort().join('|');
const DOOR_KEYS=new Set(EARTH_DATA.rooms.flatMap(r=>r.portals.filter(d=>d.kind==='door').map(doorKey)));
const ENEMY_MODES=new Set(['patrol','investigate','hunt','windup','strike','cooldown','stunned','listening','observing','arriving']);
const defaultEnemyRooms=()=>Object.fromEntries(Object.entries(ENEMY_SPAWNS).map(([id,e])=>[id,e.originRoom]));
const finiteClamp=(v,a,b,fallback=0)=>isFiniteNumber(v)?clamp(v,a,b):fallback;
function packEnemy(e){return Object.fromEntries(['id','x','z','stun','alert','memory','lastSeen','facing','mode','timer','cooldown','patrol','target','focusId','arrivalGrace','homeX','homeZ'].map(k=>[k,e[k]??null]));}
function cleanEnemy(raw,def,room){
 const moved=room.id!==def.originRoom;
 const e={...clone(def),x:finiteClamp(raw?.x,40,room.width-40,moved?room.spawn.x:def.x),z:room.mode==='SIDE'?125:finiteClamp(raw?.z,25,225,moved?room.spawn.z:def.z)};
 if(room.duct&&room.props.some(p=>p.type==='fan-collider-v7')&&blocked(room,e.x,e.z))ductEjectV7(e,room);
 if(blocked(room,e.x,e.z)){e.x=room.spawn.x;e.z=room.spawn.z;}
 e.homeX=finiteClamp(raw?.homeX,40,room.width-40,moved?e.x:def.homeX);e.homeZ=room.mode==='SIDE'?125:finiteClamp(raw?.homeZ,25,225,moved?e.z:def.homeZ);
 for(const [k,max] of Object.entries({stun:6,alert:1,memory:8,timer:4,cooldown:5,arrivalGrace:2}))e[k]=finiteClamp(raw?.[k],0,max);
 e.mode=ENEMY_MODES.has(raw?.mode)?raw.mode:(e.memory>0?'investigate':'patrol');e.facing=raw?.facing===-1?-1:1;e.patrol=raw?.patrol===-1?-1:1;
 for(const k of ['lastSeen','target'])e[k]=raw?.[k]&&isFiniteNumber(raw[k].x)&&isFiniteNumber(raw[k].z)?{x:clamp(raw[k].x,35,room.width-35),z:room.mode==='SIDE'?125:clamp(raw[k].z,25,225)}:null;
 if(['windup','strike'].includes(e.mode)&&!e.target){e.mode='patrol';e.timer=0;}
 if(e.mode==='patrol'&&e.memory>0)e.mode='investigate';
 e.focusId=EARTH_DATA.survivors.some(f=>f.id===raw?.focusId)?raw.focusId:'player';
 return e;
}
function upgradeV3(s,raw){
 s.schema=3;s.version=EARTH_DATA.version;s.enemyRooms=defaultEnemyRooms();s.pursuits=[];s.seals={};s.intel={};s.journal=[];s.trackedRoom=null;
 if(raw.schema>=3&&raw.enemyRooms&&typeof raw.enemyRooms==='object')for(const [id,def] of Object.entries(ENEMY_SPAWNS)){
  const r=ROOM_BY_ID[raw.enemyRooms[id]];
  if(r&&r.chapter===ROOM_BY_ID[def.originRoom].chapter&&!def.stationary&&!['orchid','eye_caged'].includes(def.kind))s.enemyRooms[id]=r.id;
 }
 // Rebuild, do not concatenate. Duplicate IDs in untrusted input never duplicate an actor.
 for(const r of EARTH_DATA.rooms){
  const out=s.world[r.id]||={hazards:[],lures:[]};out.enemies=[];
  for(const [id,def] of Object.entries(ENEMY_SPAWNS))if(s.enemyRooms[id]===r.id){
   const src=Array.isArray(raw.world?.[r.id]?.enemies)?raw.world[r.id].enemies.find(e=>e?.id===id):null;
   out.enemies.push(packEnemy(cleanEnemy(src,def,roomWithState(s,r.id))));
  }
 }
 if(raw.schema>=3){
  for(const k of DOOR_KEYS){const v=raw.seals?.[k];if(v&&typeof v==='object'){
   const integrity=finiteClamp(v.integrity,0,100,100);s.seals[k]={integrity,closed:v.closed===true&&integrity>0};
  }}
  for(const p of (Array.isArray(raw.pursuits)?raw.pursuits:[]).slice(0,3)){
   const def=ENEMY_SPAWNS[p?.enemyId],from=ROOM_BY_ID[p?.from],to=ROOM_BY_ID[p?.to],d=from?.portals.find(d=>d.id===p.door&&d.to===to?.id&&d.kind==='door');
   if(!def||!d||!to||from.chapter!==to.chapter||from.chapter!==EARTH_DATA.chapters[s.chapter].id||s.enemyRooms[def.id]!==from.id||from.id===s.room||s.pursuits.some(q=>q.enemyId===def.id)||def.stationary||['orchid','eye_caged'].includes(def.kind))continue;
   if((d.requires||[]).some(id=>!s.completed.includes(id)))continue;
   s.pursuits.push({enemyId:def.id,from:from.id,to:to.id,door:d.id,age:finiteClamp(p.age,0,45),wait:finiteClamp(p.wait,0,2),announced:p.announced===true,phase:['walk','threshold','breach'].includes(p.phase)?p.phase:'walk'});
  }
  for(const [id,r] of Object.entries(ROOM_BY_ID)){const v=raw.intel?.[id];if(v&&['quiet','movement','heavy'].includes(v.level))s.intel[id]={level:v.level,time:finiteClamp(v.time,0,s.playSeconds),via:typeof v.via==='string'?v.via.slice(0,40):''};}
  s.journal=(Array.isArray(raw.journal)?raw.journal:[]).filter(j=>j&&typeof j.text==='string'&&ROOM_BY_ID[j.room]).slice(-60).map(j=>({text:j.text.slice(0,300),room:j.room,time:finiteClamp(j.time,0,s.playSeconds),type:typeof j.type==='string'?j.type.slice(0,24):'event'}));
  if(ROOM_BY_ID[raw.trackedRoom]?.chapter===EARTH_DATA.chapters[s.chapter].id)s.trackedRoom=raw.trackedRoom;
 }
 for(const [id,f] of Object.entries(s.survivors)){
  const v=raw.survivors?.[id];f.stress=finiteClamp(v?.stress,0,100);f.quiet=v?.quiet===true;f.steadyTime=finiteClamp(v?.steadyTime,0,12);f.hitCooldown=finiteClamp(v?.hitCooldown,0,2);f.panicClock=finiteClamp(v?.panicClock,0,5);
 }
 s.runtime={};for(const [k,max] of Object.entries({iframe:1.5,toolCooldown:1.5,resonanceCooldown:8,fireCooldown:.3,reloadTime:1.4}))s.runtime[k]=finiteClamp(raw.runtime?.[k],0,max);
 s.runtime.projectiles=[];for(const b of (Array.isArray(raw.runtime?.projectiles)?raw.runtime.projectiles:[]).slice(0,16)){
  if(!['bullet','acid'].includes(b.kind)||!['x','z','dx','dz','ttl'].every(k=>isFiniteNumber(b[k]))||!(b.owner==='player'||ENEMY_SPAWNS[b.owner]))continue;
  s.runtime.projectiles.push({kind:b.kind,owner:b.owner,x:clamp(b.x,25,ROOM_BY_ID[s.room].width-25),z:clamp(b.z,20,230),dx:clamp(b.dx,-1100,1100),dz:clamp(b.dz,-580,580),ttl:clamp(b.ttl,0,1.4)});
 }
 if(raw.runtime?.noise&&['x','z','ttl','radius'].every(k=>isFiniteNumber(raw.runtime.noise[k])))s.runtime.noise={x:clamp(raw.runtime.noise.x,25,ROOM_BY_ID[s.room].width-25),z:clamp(raw.runtime.noise.z,20,230),ttl:clamp(raw.runtime.noise.ttl,0,1.5),radius:clamp(raw.runtime.noise.radius,0,1200)};
 s.fieldWork={};for(const r of EARTH_DATA.rooms)if(['rescue','field'].includes(r.task.kind)&&!s.completed.includes(r.task.id)&&isFiniteNumber(raw.fieldWork?.[r.task.id]))s.fieldWork[r.task.id]=clamp(raw.fieldWork[r.task.id],0,Math.max(0,r.task.duration-.05));
 s.stats.pursuits=finiteClamp(raw.stats?.pursuits,0,99999);s.stats.crossings=finiteClamp(raw.stats?.crossings,0,99999);s.stats.breaches=finiteClamp(raw.stats?.breaches,0,99999);s.stats.listens=finiteClamp(raw.stats?.listens,0,99999);s.stats.reassurances=finiteClamp(raw.stats?.reassurances,0,99999);
 return s;
}

const distance=(a,b)=>Math.hypot(a.x-b.x,(a.z-b.z)*3.2);
const shape=(r,x,z,depthRadius=10)=>({left:x-r,right:x+r,back:z-depthRadius,front:z+depthRadius});
export function roomWithState(state,id=state.room){
 const base=ROOM_BY_ID[id];
 if(!base)throw new Error('Pièce inconnue.');
 let props=base.props;
 if(base.gate&&state.gates?.[base.gate.id])props=[...props,{...base.gate,type:'gate-collider',solid:true,render:false}];
 if(base.duct&&ductFanStateV7(state,base).active)props=[...props,{...base.duct.fan,id:base.id+'-fan-collider',type:'fan-collider-v7',solid:true,render:false}];
 return props===base.props?base:{...base,props};
}
export function blocked(room,x,z,radius=18,depthRadius=10){
 if(!Number.isFinite(x)||!Number.isFinite(z)||x<35||x>room.width-35||z<25||z>225) return true;
 const s=shape(radius,x,z,depthRadius);
 return room.props.some(p=>p.solid&&s.right>p.x&&s.left<p.x+p.w&&s.front>p.z&&s.back<p.z+p.d);
}
export function visible(room,a,b){
 // Exact open-segment/slab intersection: fixed-distance samples could skip thin walls.
 if(!a||!b||![a.x,a.z,b.x,b.z].every(Number.isFinite))return false;
 for(const p of room.props){
  if(!p.solid)continue;
  let lo=0,hi=1;
  for(const [axis,size] of [['x','w'],['z','d']]){
   const delta=b[axis]-a[axis],min=p[axis],max=min+p[size];
   if(Math.abs(delta)<1e-12){if(a[axis]<=min||a[axis]>=max){hi=-1;break;}}
   else {const t0=(min-a[axis])/delta,t1=(max-a[axis])/delta;lo=Math.max(lo,Math.min(t0,t1));hi=Math.min(hi,Math.max(t0,t1));}
  }
  if(hi-lo>1e-10&&hi>0&&lo<1)return false;
 }
 return true;
}
export function depthHit(a,b,tolerance=23){return Math.abs(a.z-b.z)<=tolerance;}
export function near(a,b,dx=86,dz=31){return Math.abs(a.x-b.x)<=dx&&Math.abs(a.z-b.z)<=dz;}
export function advanceBody(room,body,dx,dz){
 // Small steps prohibit tunnelling through the footprint of a piece of scenery.
 const count=Math.max(1,Math.ceil(Math.max(Math.abs(dx)/12,Math.abs(dz)/7)));
 for(let i=0;i<count;i++){
  if(!blocked(room,body.x+dx/count,body.z))body.x+=dx/count;
  if(!blocked(room,body.x,body.z+dz/count))body.z+=dz/count;
 }
}
export function findPath(room,from,to){
 // Shared floor navigation, never a teleport. Grid includes the three classic lanes.
 const xs=[];for(let x=60;x<room.width-40;x+=40)xs.push(x);
 const zs=[40,50,70,90,110,125,145,165,185,200,215];
 const gridSide=room.mode==='SIDE';const zlist=gridSide?[125]:zs;
 const nodes=[];const map=new Map();
 for(let xi=0;xi<xs.length;xi++)for(let zi=0;zi<zlist.length;zi++){
  const x=xs[xi],z=zlist[zi];if(!blocked(room,x,z,24,14)){const n={x,z,xi,zi,key:xi+':'+zi};nodes.push(n);map.set(n.key,n);}
 }
 const nearest=p=>nodes.reduce((best,n)=>!best||distance(n,p)<distance(best,p)?n:best,null);
 const start=nearest(from),end=nearest(to);if(!start||!end)return [];
 const q=[start],seen=new Set([start.key]),parent=new Map();let found=false;
 for(let head=0;head<q.length;head++){
  const n=q[head];if(n.key===end.key){found=true;break;}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const next=map.get((n.xi+dx)+':'+(n.zi+dz));
   if(next&&!seen.has(next.key)&&visible(room,n,next)){seen.add(next.key);parent.set(next.key,n);q.push(next);}
  }
 }
 if(!found)return [];
 const result=[end];let n=end;while(n.key!==start.key){n=parent.get(n.key);if(!n)return [];result.push(n);}
 return result.reverse().map(n=>({x:n.x,z:n.z}));
}
export function newState(){
 return {...initialServicesV4(),dlc:'alien-earth-s1',schema:11,fidelityV11:initialFidelityV11(),fidelityGear:initialFidelityGearV10(),security:initialSecurityV9(),investigations:initialInvestigationsV8(),ducts:initialDuctsV7(),sensors:initialSensorsV6(),containment:initialContainmentV5(),version:EARTH_DATA.version,chapter:0,room:'R01',completed:[],archives:[],visited:['R01'],
  player:{x:120,z:125,hp:120,energy:100,ammo:12,reserve:24,facing:1},world:{},choices:{},
  inventory:{care:1,decoys:2,capsules:2},looted:[],gates:{},valves:[],research:[],survivors:{},lightOn:false,
  fieldWork:{},enemyRooms:defaultEnemyRooms(),pursuits:[],seals:{},intel:{},journal:[],trackedRoom:null,runtime:{},
  stats:{decoysUsed:0,kitsUsed:0,rescues:0,pursuits:0,crossings:0,breaches:0,listens:0,reassurances:0},presentation:'HYBRID',difficulty:'normal',resonance:false,escort:false,finished:false,playSeconds:0};
}
export function sanitizeSave(raw){
 if(typeof raw==='string'){
  if(raw.length>250000)throw new Error('Sauvegarde trop volumineuse.');
  try{raw=JSON.parse(raw);}catch{throw new Error('Le fichier de sauvegarde n’est pas un JSON valide.');}
 }
 if(!raw||Array.isArray(raw)||typeof raw!=='object')throw new Error('Sauvegarde illisible.');
 if(raw.dlc!=='alien-earth-s1'||![1,2,3,4,5,6,7,8,9,10,11].includes(raw.schema))throw new Error('Cette sauvegarde appartient à un autre module ou à une version non prise en charge.');
 if(!Number.isInteger(raw.chapter)||raw.chapter<0||raw.chapter>7)throw new Error('Chapitre invalide.');
 const room=ROOM_BY_ID[raw.room];if(!room||room.chapter!==EARTH_DATA.chapters[raw.chapter].id)throw new Error('Pièce incompatible avec le chapitre.');
 const cleanList=(v,set)=>Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'&&set.has(x)))]:[];
 const s=newState();s.chapter=raw.chapter;s.room=raw.room;
 s.completed=cleanList(raw.completed,TASK_IDS);s.archives=cleanList(raw.archives,ARCHIVE_IDS);
 s.visited=cleanList(raw.visited,new Set(Object.keys(ROOM_BY_ID)));if(!s.visited.includes(s.room))s.visited.push(s.room);
 for(let c=0;c<raw.chapter;c++)if(!EARTH_DATA.chapters[c].goals.every(g=>s.completed.includes(g)))throw new Error('La progression des chapitres précédents est incomplète.');
 s.presentation=raw.presentation==='CLASSIC'?'CLASSIC':'HYBRID';s.difficulty=['story','normal','danger'].includes(raw.difficulty)?raw.difficulty:'normal';
 const char=CHARACTER_BY_ID[EARTH_DATA.chapters[s.chapter].pov];
 if(!raw.player||typeof raw.player!=='object')throw new Error('État du personnage absent.');
 for(const k of ['x','z','hp','energy','ammo','reserve','facing'])if(!isFiniteNumber(raw.player[k]))throw new Error('Valeur du personnage invalide : '+k);
 s.player={x:clamp(raw.player.x,40,room.width-40),z:room.mode==='SIDE'?125:clamp(raw.player.z,25,225),hp:clamp(raw.player.hp,1,char.health),energy:clamp(raw.player.energy,0,100),ammo:clamp(Math.floor(raw.player.ammo),0,12),reserve:clamp(Math.floor(raw.player.reserve),0,72),facing:raw.player.facing<0?-1:1};
 if(blocked(room,s.player.x,s.player.z)){s.player.x=room.spawn.x;s.player.z=room.spawn.z;}
 s.resonance=s.completed.includes('AE-15');s.escort=raw.escort===true&&s.chapter===2&&s.completed.includes('AE-11');
 s.finished=raw.finished===true&&s.chapter===7&&EARTH_DATA.chapters[7].goals.every(g=>s.completed.includes(g));
 s.playSeconds=isFiniteNumber(raw.playSeconds)?clamp(raw.playSeconds,0,9999999):0;
 if(raw.choices&&typeof raw.choices==='object')for(const k of Object.keys(raw.choices))if(TASK_IDS.has(k)&&[0,1].includes(raw.choices[k]))s.choices[k]=raw.choices[k];
 if(raw.world&&typeof raw.world==='object'){
  for(const r of EARTH_DATA.rooms){const wr=raw.world[r.id];if(!wr||typeof wr!=='object')continue;
   const es=[];
   for(const def of r.enemies){const e=Array.isArray(wr.enemies)?wr.enemies.find(e=>e?.id===def.id):null;if(!e)continue;
    let x=isFiniteNumber(e.x)?clamp(e.x,40,r.width-40):def.x,z=isFiniteNumber(e.z)?clamp(e.z,25,225):def.z;
    if(blocked(r,x,z)){x=def.x;z=def.z;}
    es.push({id:def.id,x,z,stun:isFiniteNumber(e.stun)?clamp(e.stun,0,6):0});
   }
   s.world[r.id]={enemies:es,hazards:[]};
   if(Array.isArray(wr.hazards))for(const h of wr.hazards.slice(0,20))if(isFiniteNumber(h.x)&&isFiniteNumber(h.z)&&isFiniteNumber(h.ttl))s.world[r.id].hazards.push({x:clamp(h.x,40,r.width-40),z:clamp(h.z,25,225),ttl:clamp(h.ttl,0,7),radius:clamp(isFiniteNumber(h.radius)?h.radius:55,25,90)});
  }
 }

 const bounded=(v,max,fallback=0)=>isFiniteNumber(v)?clamp(Math.floor(v),0,max):fallback;
 s.inventory={care:bounded(raw.inventory?.care,9,1),decoys:bounded(raw.inventory?.decoys,9,2)};
 const utilityIds=new Set(EARTH_DATA.rooms.flatMap(r=>(r.interactables||[]).filter(i=>i.kind==='supply').map(i=>i.id)));
 s.looted=cleanList(raw.looted,utilityIds);
 s.valves=cleanList(raw.valves,new Set(EARTH_DATA.rooms.flatMap(r=>(r.vents||[]).map(i=>i.id))));
 s.research=cleanList(raw.research,new Set(EARTH_DATA.creatures.map(c=>c.id)));
 s.lightOn=raw.lightOn===true;
 for(const r of EARTH_DATA.rooms)if(r.gate)s.gates[r.gate.id]=raw.gates?.[r.gate.id]===true;
 s.stats={decoysUsed:bounded(raw.stats?.decoysUsed,999999),kitsUsed:bounded(raw.stats?.kitsUsed,999999),rescues:0};
 for(const def of EARTH_DATA.survivors||[]){
  const v=raw.survivors?.[def.id];if(!v||!s.completed.includes(def.task))continue;
  const original=ROOM_BY_ID[def.room],rr=ROOM_BY_ID[v.room];
  const rid=rr&&rr.chapter===original.chapter?rr.id:def.room;
  let x=isFiniteNumber(v.x)?clamp(v.x,40,ROOM_BY_ID[rid].width-40):original.task.x;
  let z=ROOM_BY_ID[rid].mode==='SIDE'?125:isFiniteNumber(v.z)?clamp(v.z,25,225):original.task.z;
  if(blocked(roomWithState(s,rid),x,z)){x=120;z=125;}
  const status=['follow','wait','down','rescued','left'].includes(v.status)?v.status:'wait';
  const hp=bounded(v.hp,def.health,def.health);
  s.survivors[def.id]={id:def.id,room:rid,x,z,hp,status:hp<=0&&!['rescued','left'].includes(status)?'down':status};
  if(status==='rescued')s.stats.rescues++;
 }
 // A V1 corpse is not an active save: hp was already clamped to a safe positive value by V1.
 // Dynamic shutters may not strand an imported actor inside their geometry.
 if(blocked(roomWithState(s),s.player.x,s.player.z)){s.player.x=room.spawn.x;s.player.z=room.spawn.z;}
 for(const r of EARTH_DATA.rooms){
  const wr=raw.world?.[r.id],out=s.world[r.id];if(!wr||!out)continue;
  for(const enemy of out.enemies){const e=Array.isArray(wr.enemies)?wr.enemies.find(v=>v?.id===enemy.id):null;
   enemy.alert=isFiniteNumber(e?.alert)?clamp(e.alert,0,1):0;enemy.memory=isFiniteNumber(e?.memory)?clamp(e.memory,0,8):0;
   enemy.facing=e?.facing===-1?-1:1;
   enemy.lastSeen=e?.lastSeen&&isFiniteNumber(e.lastSeen.x)&&isFiniteNumber(e.lastSeen.z)?{x:clamp(e.lastSeen.x,40,r.width-40),z:clamp(e.lastSeen.z,25,225)}:null;
   if(blocked(roomWithState(s,r.id),enemy.x,enemy.z)){const def=r.enemies.find(v=>v.id===enemy.id);enemy.x=def.x;enemy.z=def.z;}
  }
  out.lures=[];
  for(const l of (Array.isArray(wr.lures)?wr.lures:[]).slice(0,1))if(isFiniteNumber(l.x)&&isFiniteNumber(l.z)&&isFiniteNumber(l.ttl))out.lures.push({x:clamp(l.x,40,r.width-40),z:clamp(l.z,25,225),ttl:clamp(l.ttl,0,7),radius:740});
 }
 return upgradeFidelityV11(
  upgradeFidelityV10(
   upgradeSecurityV9(
    upgradeInvestigationsV8(
     upgradeDuctsV7(
      upgradeSensorsV6(
       upgradeContainmentV5(
        upgradeServicesV4(upgradeV3(s,raw),raw,ROOM_BY_ID,DOOR_KEYS),raw
       ),raw,{blocked,roomWithState}
      ),raw
     ),raw
    ),raw
   ),raw
  ),raw
 );
}
class EarthEngineBase{
 constructor(state=null){this.events=[];this.time=0;this.pending=null;this.hold=null;this.iframe=0;this.toolCooldown=0;this.resonanceCooldown=0;this.fireCooldown=0;this.reloadTime=0;this.noise=null;this.projectiles=[];this.effects=[];this.state=state?sanitizeSave(state):newState();this.time=this.state.playSeconds;this.hidden=null;this.scanProgress=null;this.companionPaths={};this.damageClock=-1;this.actionV3=null;this.listenWork=null;this.calmWork=null;this.pursuitPaths={};this.loadRoom(this.state.room);if(state)this.restoreRuntime();this.checkpoint=this.snapshot();}
 get room(){return roomWithState(this.state);}
 get baseRoom(){return ROOM_BY_ID[this.state.room];}
 get powered(){return !this.room.dark||!!(this.room.systems?.poweredBy&&this.state.completed.includes(this.room.systems.poweredBy));}
 get chapter(){return EARTH_DATA.chapters[this.state.chapter];}
 get character(){return CHARACTER_BY_ID[this.chapter.pov];}
 get player(){return this.state.player;}
 get dead(){return this.player.hp<=0;}
 emit(type,detail={}){this.events.push({type,...detail});}
 drain(){const q=this.events;this.events=[];return q;}
 loadRoom(id){
  this.state.room=id;if(!this.state.visited.includes(id))this.state.visited.push(id);
  // Returning to the source restores its in-transit actor; no second copy remains.
  this.state.pursuits=this.state.pursuits.filter(p=>p.from!==id);
  const wr=this.state.world[id];
  this.enemies=Object.entries(this.state.enemyRooms).filter(([eid,rid])=>rid===id).map(([eid])=>{
   const def=ENEMY_SPAWNS[eid],saved=wr?.enemies?.find(e=>e.id===eid);
   return {...cleanEnemy(saved,def,this.room),path:[],pathClock:0};
  });
  this.hazards=clone(wr?.hazards||[]);this.lures=clone(wr?.lures||[]);this.hidden=null;this.scanProgress=null;this.companionPaths={};this.projectiles=[];this.effects=[];this.hold=null;this.pending=null;this.noise=null;
  this.iframe=.7;this.reloadTime=0;this.fireCooldown=0;this.toolCooldown=0;this.actionV3=null;this.listenWork=null;this.calmWork=null;
  this.escortActor={x:this.player.x-70,z:this.player.z};
 }
 commit(){this.state.world[this.state.room]={enemies:this.enemies.map(packEnemy),hazards:clone(this.hazards),lures:clone(this.lures)};this.saveRuntime();}
 snapshot(){this.commit();return clone(this.state);}
 enter(id,x=120,z=125,door=null){
  if(!ROOM_BY_ID[id]||ROOM_BY_ID[id].chapter!==this.chapter.id)throw new Error('Pièce incompatible avec le chapitre.');
  const followers=Object.values(this.state.survivors).filter(s=>s.room===this.state.room&&s.status==='follow'&&near(s,this.player,155,65));
  this.planPursuit(door);this.commit();const runtime=clone(this.state.runtime);
  this.player.x=x;this.player.z=ROOM_BY_ID[id].mode==='SIDE'?125:z;
  if(blocked(roomWithState(this.state,id),this.player.x,this.player.z)){this.player.x=120;this.player.z=125;}
  this.loadRoom(id);this.restoreRuntime({...runtime,projectiles:[],noise:null});this.iframe=Math.max(this.iframe,.7);
  for(const [i,f] of followers.entries()){
   f.room=id;f.x=this.player.x;f.z=this.player.z;
   // Small, collision-checked offset keeps several rescued actors legible at a threshold.
   const offset=(i+1)*28*(this.player.x>ROOM_BY_ID[id].width/2?-1:1);
   if(!blocked(this.room,f.x+offset,f.z))f.x+=offset;
  }
  this.checkpoint=this.snapshot();this.emit('room',{id});this.emit('save');
 }
 setPresentation(mode){this.state.presentation=mode==='CLASSIC'?'CLASSIC':'HYBRID';if(this.room.mode==='SIDE')this.player.z=125;this.emit('save');}
 laneMove(direction){
  if(this.room.mode==='SIDE')return false;
  const p=this.player,r=this.room;
  if(!r.passages.some(x=>Math.abs(x-p.x)<100)&&!r.portals.some(d=>Math.abs(d.x-p.x)<95)){
   this.emit('toast',{text:'Rejoignez un passage marqué pour changer de plan.'});return false;
  }
  const lanes=[50,125,200],index=lanes.reduce((b,z,i)=>Math.abs(z-p.z)<Math.abs(lanes[b]-p.z)?i:b,0),target=lanes[clamp(index+direction,0,2)];
  if(!visible(r,p,{x:p.x,z:target})||blocked(r,p.x,target)){this.emit('toast',{text:'Le passage est obstrué.'});return false;}
  p.z=target;return true;
 }
 interactionCandidates(){
  const r=this.room,result=[];
  if(!this.state.completed.includes(r.task.id))result.push({...r.task,kind:'task',taskKind:r.task.kind});
  if(!this.state.archives.includes(r.archive.id))result.push({...r.archive,kind:'archive',label:r.archive.title});
  for(const item of r.interactables||[]){
   if(item.kind==='supply'&&this.state.looted.includes(item.id))continue;
   if(item.kind==='valve'&&this.state.valves.includes(item.vent))continue;
   result.push({...item,label:item.kind==='gate'?(this.state.gates[item.gate]?'Ouvrir la cloison':'Fermer la cloison'):item.label});
  }
  for(const survivor of Object.values(this.state.survivors))if(survivor.room===r.id&&['follow','wait','down'].includes(survivor.status))result.push({...survivor,kind:'companion',label:survivor.status==='down'?'Stabiliser '+this.survivorDef(survivor.id).name:survivor.status==='follow'?'Demander d’attendre':'Demander de suivre'});
  for(const d of r.portals)result.push({...d,kind:d.kind,label:d.label});
  return result;
 }
 nearestInteraction(){return this.interactionCandidates().filter(t=>near(this.player,t)&&visible(this.room,this.player,t)).sort((a,b)=>distance(this.player,a)-distance(this.player,b))[0]||null;}
 interact(){
  if(this.dead||this.pending||this.hold||this.state.finished)return null;
  if(this.hidden){this.hidden=null;this.emit('toast',{text:'Vous quittez la niche.'});return null;}
  const i=this.nearestInteraction();if(!i){this.emit('toast',{text:'Approchez-vous d’un accès, d’une personne ou d’un terminal.'});return null;}
  if(['supply','hide','gate','valve','companion'].includes(i.kind))return this.useUtility(i);
  if(i.kind==='archive'){
   this.state.archives.push(i.id);this.emit('archive',{archive:clone(this.room.archive)});this.emit('save');return i;
  }
  if(i.kind==='door'){if(this.sealState(i).closed){this.emit('toast',{text:'Le verrou est fermé. Maintenez X près de la porte pour l’ouvrir.'});return null;}if(i.requires&&!i.requires.every(id=>this.state.completed.includes(id))){this.emit('toast',{text:'Accès verrouillé · '+(i.requireLabel||'une commande locale reste à activer')+'.'});return null;}this.enter(i.to,i.arrivalX,i.arrivalZ,i);return i;}
  if(i.kind==='chapter'){
   const missing=i.requires.filter(t=>!this.state.completed.includes(t));
   if(missing.length){this.emit('toast',{text:'Il reste '+missing.length+' action'+(missing.length>1?'s':'')+' à accomplir dans ce secteur. Consultez la carte.'});return null;}
   this.pending={type:'chapter',id:i.id};this.emit('chapterEnd',{chapter:clone(this.chapter)});return i;
  }
  const t=this.room.task;
  if(['rescue','field'].includes(t.kind)){this.hold={id:t.id,time:this.state.fieldWork[t.id]||0};this.emit('toast',{text:'Maintenez E pour terminer : '+t.label.toLowerCase()+'.'});return t;}
  this.pending={type:t.kind,id:t.id};this.emit(t.kind==='talk'?'dialog':'puzzle',{task:clone(t)});return t;
 }
 cancelInteraction(){this.pending=null;this.hold=null;this.actionV3=null;this.listenWork=null;this.calmWork=null;}
 completeGoal(id){
  const goalSite=near(this.player,this.room.task)&&visible(this.room,this.player,this.room.task)||this.room.duct&&this.room.interactables.some(i=>i.kind==='ductBrake'&&near(this.player,i)&&visible(this.room,this.player,i));
  if(id!==this.room.task.id||!goalSite||this.state.completed.includes(id))return false;
  this.state.completed.push(id);delete this.state.fieldWork[id];this.pending=null;this.hold=null;
  if(id==='AE-15')this.state.resonance=true;
  if(id==='AE-11'){this.state.escort=true;this.escortActor={x:this.player.x-60,z:this.player.z};}
  this.player.energy=clamp(this.player.energy+15,0,100);
  this.grantReward(this.room.task.reward);
  if(this.room.gate?.closedBy===id)this.toggleGate(true);
  if(this.room.optional)this.emit('toast',{text:Number(this.room.id.slice(1))>56?'Relevé de lieu enregistré.':'Le passage de secours est maintenant ouvert.'});
  this.emit('goal',{id,text:this.room.task.label});this.emit('save');return true;
 }
 resolveDialog(choice=0){
  if(this.pending?.type!=='talk'||![0,1].includes(choice))return false;
  const id=this.pending.id;this.state.choices[id]=choice;return this.completeGoal(id);
 }
 resolvePuzzle(answer){
  if(!this.pending||!['scan','circuit','contain'].includes(this.pending.type))return false;
  const t=this.room.task,target=t.kind==='scan'?t.sequence:t.pattern;
  if(!Array.isArray(answer)||answer.length!==3||!answer.every((v,i)=>v===target[i])){this.emit('toast',{text:t.kind==='scan'?'Le signal ne correspond pas. Réécoutez le motif.':'Le circuit n’est pas encore stable. Vérifiez la consigne.'});return false;}
  return this.completeGoal(t.id);
 }
 advanceChapter(){
  if(this.pending?.type!=='chapter'||!this.chapter.goals.every(t=>this.state.completed.includes(t)))return false;
  if(this.state.chapter===7){this.state.finished=true;this.pending=null;this.emit('finished');this.emit('save');return true;}
  for(const s of Object.values(this.state.survivors))if(!['rescued','left'].includes(s.status)&&ROOM_BY_ID[s.room].chapter===this.chapter.id)s.status='left';
  this.commit();this.state.chapter++;this.state.escort=false;this.state.pursuits=[];this.state.trackedRoom=null;this.pursuitPaths={};this.toolCooldown=0;this.resonanceCooldown=0;this.reloadTime=0;const c=this.character;
  this.state.player={x:120,z:125,hp:c.health,energy:100,ammo:12,reserve:24,facing:1};
  this.enter(this.chapter.rooms[0],120,125);this.emit('chapterStart',{chapter:clone(this.chapter)});return true;
 }
 restartCheckpoint(){
  this.commit();const remembered=clone(this.state);this.state=sanitizeSave(this.checkpoint);
  // Acquisitions already persisted are not removed by death; the safe entry remains the anchor.
  this.state.archives=remembered.archives;this.state.completed=remembered.completed;this.state.choices=remembered.choices;
  this.state.resonance=remembered.resonance;this.state.escort=remembered.escort;
  for(const k of ['inventory','looted','gates','valves','research','survivors','stats','world','playSeconds','enemyRooms','pursuits','seals','intel','journal','trackedRoom','runtime','fieldWork','parts','salvaged','circuits','repairedDoors','cameraFrames','carryId','serviceStats','containment','ducts'])this.state[k]=remembered[k];
  this.player.ammo=remembered.player.ammo;this.player.reserve=remembered.player.reserve;this.time=this.state.playSeconds;
  if(blocked(this.room,this.player.x,this.player.z)){this.player.x=this.room.spawn.x;this.player.z=this.room.spawn.z;}
  this.player.hp=Math.max(this.player.hp,this.character.health*.7);this.loadRoom(this.state.room);this.restoreRuntime(remembered.runtime);this.iframe=1.15;this.emit('room',{id:this.state.room});this.emit('save');
 }
 damage(amount){
  if(this.iframe>0||this.dead)return false;
  const factor={story:.55,normal:1,danger:1.35}[this.state.difficulty];
  this.player.hp=Math.max(0,this.player.hp-amount*factor);this.damageClock=this.time;this.scanProgress=null;this.actionV3=null;this.listenWork=null;this.calmWork=null;this.hidden=null;this.iframe=1.15;if(this.hold)this.emit('toast',{text:'Action interrompue. Les étapes déjà réalisées restent acquises. Relâchez E, puis reprenez.'});this.hold=null;
  this.effects.push({kind:'hit',x:this.player.x,z:this.player.z,ttl:.35});this.emit('damage',{amount});
  if(this.dead){this.pending=null;this.emit('dead');}return true;
 }
 tool(){
  if(this.dead||this.pending||this.toolCooldown>0||this.player.energy<22)return false;
  this.hidden=null;this.player.energy-=22;this.toolCooldown=1.5;this.noise={x:this.player.x,z:this.player.z,ttl:1.5,radius:420};
  for(const e of this.enemies)if(e.kind!=='eye_caged'&&Math.abs(e.x-this.player.x)<165&&depthHit(e,this.player,40)&&visible(this.room,this.player,e)){
   e.stun=Math.max(e.stun||0,2.7);e.mode='stunned';advanceBody(this.room,e,Math.sign(e.x-this.player.x)*95,0);
  }
  this.effects.push({kind:'push',x:this.player.x,z:this.player.z,ttl:.5});this.emit('sound',{kind:'tool'});return true;
 }
 resonate(){
  if(this.character.id!=='wendy'||!this.state.resonance||this.resonanceCooldown>0||this.player.energy<35||this.pending||this.dead){this.emit('toast',{text:this.state.resonance?'La résonance n’est pas disponible pour l’instant.':'La résonance n’est pas encore accordée.'});return false;}
  this.hidden=null;this.player.energy-=35;this.resonanceCooldown=8;
  for(const e of this.enemies)if(e.kind==='xeno_neverland'&&distance(e,this.player)<650){e.stun=Math.max(e.stun||0,5);e.mode='listening';}
  this.effects.push({kind:'resonance',x:this.player.x,z:this.player.z,ttl:1.2});this.emit('sound',{kind:'resonance'});return true;
 }
 fire(){
  if(this.character.weapon==='none'||this.dead||this.pending||this.reloadTime>0||this.fireCooldown>0||this.player.ammo<=0)return false;
  this.hidden=null;for(const f of Object.values(this.state.survivors))if(f.room===this.room.id&&near(f,this.player,450,100))f.stress=clamp((f.stress||0)+7,0,100);this.player.ammo--;this.fireCooldown=.28;this.noise={x:this.player.x,z:this.player.z,ttl:1.5,radius:1000};
  this.projectiles.push({kind:'bullet',x:this.player.x+this.player.facing*28,z:this.player.z,dx:this.player.facing*1100,dz:0,ttl:.72,owner:'player'});
  this.effects.push({kind:'muzzle',x:this.player.x+this.player.facing*40,z:this.player.z,ttl:.13});this.emit('sound',{kind:'shot'});return true;
 }
 reload(){if(this.character.weapon==='none'||this.player.ammo>=12||this.player.reserve<=0||this.reloadTime>0||this.pending)return false;this.reloadTime=1.4;this.emit('sound',{kind:'reload'});return true;}
 enemyRoute(e,target,dt,speed){
  e.pathClock-=dt;if(e.pathClock<=0||!e.path?.length){e.path=findPath(this.room,e,target);e.pathClock=.7;if(e.path.length&&distance(e,e.path[0])<3)e.path.shift();}
  const node=e.path?.[0]||target,dx=node.x-e.x,dz=node.z-e.z;
  if(Math.abs(dx)<2&&Math.abs(dz)<2&&e.path?.length){e.path.shift();return;}
  const d=Math.hypot(dx,dz*3.2)||1;
  const stride=Math.min(speed*dt,d);
  advanceBody(this.room,e,dx/d*stride,dz/d*stride);if(Math.abs(dx)>2)e.facing=Math.sign(dx);
 }

 survivorDef(id){return EARTH_DATA.survivors.find(d=>d.id===id);}
 grantReward(reward){
  if(!reward)return;
  this.state.inventory.care=clamp(this.state.inventory.care+(reward.care||0),0,9);
  this.state.inventory.decoys=clamp(this.state.inventory.decoys+(reward.decoys||0),0,9);
  if(reward.ammo&&this.character.weapon!=='none')this.player.reserve=clamp(this.player.reserve+reward.ammo,0,72);
  if(reward.survivor&&!this.state.survivors[reward.survivor]){
   const def=this.survivorDef(reward.survivor);
   this.state.survivors[def.id]={id:def.id,room:this.room.id,x:this.room.task.x,z:this.room.task.z,hp:def.health,status:'follow',stress:15,quiet:false,steadyTime:0,hitCooldown:0,panicClock:0};
   this.emit('toast',{text:def.name+' vous suit. Rejoignez '+ROOM_BY_ID[def.evac].title.toLowerCase()+'.'});
  }
 }
 useUtility(i){
  if(i.kind==='supply'){
   if(this.state.looted.includes(i.id))return null;
   const useful=(i.content.care&&this.state.inventory.care<9)||(i.content.decoys&&this.state.inventory.decoys<9)||(i.content.ammo&&this.player.reserve<72&&this.character.weapon!=='none');
   if(!useful){this.emit('toast',{text:'Votre réserve est pleine. La caisse reste disponible.'});return null;}
   this.grantReward(i.content);this.state.looted.push(i.id);this.emit('toast',{text:'Réserve récupérée. Le casier est vide.'});
  }else if(i.kind==='gate'){if(!this.toggleGate())return null;}
  else if(i.kind==='valve'){if(!this.state.valves.includes(i.vent))this.state.valves.push(i.vent);this.emit('toast',{text:'Alimentation coupée. La fuite ne reprendra pas.'});}
  else if(i.kind==='hide'){
   this.hidden=i.id;
   const witnesses=this.enemies.filter(e=>e.kind!=='eye_caged'&&(e.mode==='hunt'||e.alert>.55)&&visible(this.room,e,this.player)&&distance(e,this.player)<630);
   if(witnesses.length){for(const e of witnesses){e.lastSeen={x:this.player.x,z:this.player.z};e.memory=6;}this.emit('toast',{text:'Vous avez été vu. La niche ne vous protégera pas.'});}
   else this.emit('toast',{text:'Restez immobile. E pour ressortir.'});
  }else if(i.kind==='companion'){
   const f=this.state.survivors[i.id];if(!f)return null;
   if(f.status==='down'){
    if(!this.state.inventory.care){this.emit('toast',{text:'Un kit est nécessaire pour stabiliser '+this.survivorDef(f.id).name+'.'});return null;}
    this.state.inventory.care--;this.state.stats.kitsUsed++;f.hp=40;f.status='follow';f.hitCooldown=2;f.stress=35;f.steadyTime=8;
   }else f.status=f.status==='follow'?'wait':'follow';
   this.emit('toast',{text:this.survivorDef(f.id).name+(f.status==='follow'?' vous suit.':' attend ici.')});
  }
  this.emit('save');return i;
 }
 toggleGate(force){
  const gate=this.room.gate;if(!gate)return false;
  const closed=typeof force==='boolean'?force:!this.state.gates[gate.id];
  if(closed){
   const actors=[this.player,...this.enemies,...Object.values(this.state.survivors).filter(s=>s.room===this.room.id&&!['rescued','left'].includes(s.status)),...(this.state.escort?[this.escortActor]:[])];
   if(actors.some(a=>a.x+22>gate.x&&a.x-22<gate.x+gate.w&&a.z+12>gate.z&&a.z-12<gate.z+gate.d)){
    this.emit('toast',{text:'Le seuil est occupé. La cloison reste ouverte.'});return false;
   }
  }
  this.state.gates[gate.id]=closed;
  for(const e of this.enemies){e.path=[];e.pathClock=0;}this.companionPaths={};
  this.noise={x:gate.x,z:125,ttl:1.2,radius:430};
  this.emit('toast',{text:closed?'Cloison fermée.':'Cloison ouverte.'});this.emit('save');return true;
 }
 ventActive(v){return !this.state.valves.includes(v.id)&&(this.time+v.offset)%v.period<v.on;}
 useCare(){
  if(this.dead||this.pending||this.state.finished||this.player.hp>=this.character.health||this.state.inventory.care<=0)return false;
  this.state.inventory.care--;this.state.stats.kitsUsed++;this.player.hp=clamp(this.player.hp+40,0,this.character.health);
  this.emit('toast',{text:'Intégrité stabilisée.'});this.emit('save');return true;
 }
 throwDecoy(){
  if(this.dead||this.pending||this.hold||this.state.finished||this.state.inventory.decoys<=0||this.lures.length)return false;
  let target={x:this.player.x,z:this.player.z};
  for(let n=25;n<=330;n+=15){const next={x:this.player.x+this.player.facing*n,z:this.player.z};if(blocked(this.room,next.x,next.z,8,6)||!visible(this.room,this.player,next))break;target=next;}
  if(Math.abs(target.x-this.player.x)<25){this.emit('toast',{text:'Pas assez de dégagement pour lancer la balise.'});return false;}
  this.hidden=null;this.state.inventory.decoys--;this.state.stats.decoysUsed++;
  this.lures=[{...target,ttl:7,radius:740}];this.emit('sound',{kind:'decoy'});this.emit('save');return true;
 }
 seesPlayer(e,input={}){
  if(e.kind==='eye_caged')return false;
  const dist=distance(e,this.player);
  if(this.hidden&&!(e.memory>0&&e.lastSeen&&distance(e.lastSeen,this.player)<90))return false;
  const base=input.crouch?320:620;
  const range=base*(this.powered?1:this.state.lightOn?1.12:.70);
  if(dist>range||!visible(this.room,e,this.player))return false;
  return dist<165||(e.facing||e.patrol||1)*(this.player.x-e.x)>-25||e.mode==='hunt';
 }
 updateResearch(dt,input){
  if(!input.scan||this.moving||this.hidden||this.hold||this.time-this.damageClock<.6){this.scanProgress=null;return;}
  const target=this.enemies.filter(e=>!this.state.research.includes(e.kind)&&distance(e,this.player)<600&&visible(this.room,e,this.player)).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];
  if(!target){this.scanProgress=null;return;}
  if(this.scanProgress?.id!==target.id)this.scanProgress={id:target.id,kind:target.kind,time:0};
  this.scanProgress.time+=dt;
  if(this.scanProgress.time>=3){this.state.research.push(target.kind);this.scanProgress=null;this.emit('toast',{text:'Relevé conservé · '+EARTH_DATA.creatures.find(c=>c.id===target.kind).name});this.emit('save');}
 }
 // --- V3 local threat network, acoustics and companion pressure ---
 saveRuntime(){this.state.runtime={iframe:this.iframe,toolCooldown:this.toolCooldown,resonanceCooldown:this.resonanceCooldown,fireCooldown:this.fireCooldown,reloadTime:this.reloadTime,projectiles:clone(this.projectiles),noise:this.noise?clone(this.noise):null};}
 restoreRuntime(runtime=this.state.runtime){if(!runtime)return;for(const k of ['iframe','toolCooldown','resonanceCooldown','fireCooldown','reloadTime'])this[k]=runtime[k]||0;this.projectiles=clone(runtime.projectiles||[]);this.noise=runtime.noise?clone(runtime.noise):null;}
 log(text,type='event'){this.state.journal.push({text,room:this.room.id,time:this.state.playSeconds,type});this.state.journal=this.state.journal.slice(-60);}
 surfaceAt(body=this.player){return this.room.floorRegions?.find(a=>body.x>=a.x&&body.x<=a.x+a.w&&body.z>=a.z&&body.z<=a.z+a.d)||{material:'tile',label:'Sol courant',noise:1};}
 nearestDoor(){return this.room.portals.filter(d=>d.kind==='door'&&near(this.player,d,86,31)&&visible(this.room,this.player,d)).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0]||null;}
 sealState(d){return this.state.seals[doorKey(d)]||{closed:false,integrity:100};}
 startSeal(){
  if(this.pending||this.hold||this.dead||this.state.finished)return false;const d=this.nearestDoor();if(!d)return false;
  if(this.sealState(d).integrity<=0){this.emit('toast',{text:'La barre est rompue. Impossible de refermer ce verrou.'});return false;}
  this.actionV3={kind:'seal',id:d.id,time:0,close:!this.sealState(d).closed};return true;
 }
 updateFieldActions(dt,input){
  if(this.time-this.damageClock<.12){this.actionV3=null;this.listenWork=null;this.calmWork=null;return;}
  if(this.actionV3){const a=this.actionV3,d=this.room.portals.find(d=>d.id===a.id);
   if(!input.seal||this.moving||!d||!near(this.player,d)||this.hold||this.pending){this.actionV3=null;}
   else {a.time+=dt;if(a.time>=1){const key=doorKey(d),v=this.sealState(d);
    this.state.seals[key]={closed:a.close&&v.integrity>0,integrity:v.integrity};this.actionV3=null;
    const msg=a.close?'Verrou manuel fermé.':'Verrou manuel ouvert.';this.log(msg+' '+ROOM_BY_ID[d.to].title,'seal');this.emit('toast',{text:msg});this.emit('save');
   }}
  }
  if(input.listen&&!this.moving&&!this.hold&&!this.actionV3){
   const d=this.nearestDoor();if(d){
    if(this.listenWork?.id!==d.id)this.listenWork={id:d.id,time:0,done:false};
    if(!this.listenWork.done){this.listenWork.time+=dt;if(this.listenWork.time>=1.5){
     const rid=d.to,r=roomWithState(this.state,rid),point={x:d.arrivalX,z:d.arrivalZ};
     const local=Object.entries(this.state.enemyRooms).filter(([eid,loc])=>loc===rid&&!containedIdsV5(this.state).has(eid)).map(([eid])=>this.state.world[rid]?.enemies?.find(e=>e.id===eid)||ENEMY_SPAWNS[eid]);
     const heard=local.filter(e=>e.kind!=='eye_caged'&&ENEMY_SPAWNS[e.id]?.kind!=='eye_caged'&&distance(e,point)<720&&findPath(r,e,point).length);
     const inbound=this.state.pursuits.filter(p=>p.from===rid&&p.to===this.room.id);
     const heavy=[...heard,...inbound.map(p=>({id:p.enemyId}))].some(e=>ENEMY_SPAWNS[e.id]?.kind.startsWith('xeno'));
     const level=heavy?'heavy':heard.length||inbound.length?'movement':'quiet';
     this.state.intel[rid]={level,time:this.state.playSeconds,via:d.id};this.state.stats.listens++;
     const text=({quiet:'Aucun mouvement distinct à portée d’écoute.',movement:'Un mouvement se rapproche ou circule derrière la porte.',heavy:'Des pas lourds résonnent de l’autre côté.'})[level];
     this.log(ROOM_BY_ID[rid].title+' · '+text,'listen');this.emit('toast',{text});this.emit('sound',{kind:level==='quiet'?'click':'footstep'});this.emit('save');this.listenWork.done=true;
    }}
   }else this.listenWork=null;
  }else this.listenWork=null;
  if(input.calm&&!this.moving&&!this.hold&&!this.actionV3){
   const f=Object.values(this.state.survivors).filter(f=>f.room===this.room.id&&['follow','wait'].includes(f.status)&&near(f,this.player,145,60)&&visible(this.room,f,this.player)).sort((a,b)=>(b.stress||0)-(a.stress||0))[0];
   if(!f){this.calmWork=null;return;}if(this.calmWork?.id!==f.id)this.calmWork={id:f.id,time:0,done:false};
   if(!this.calmWork.done){this.calmWork.time+=dt;if(this.calmWork.time>=2){f.stress=Math.max(0,(f.stress||0)-50);f.steadyTime=12;this.state.stats.reassurances++;this.calmWork.done=true;this.log(this.survivorDef(f.id).name+' reprend ses esprits.','rescue');this.emit('toast',{text:this.survivorDef(f.id).name+' respire plus calmement.'});this.emit('save');}}
  }else this.calmWork=null;
 }
 commandSurvivors(command){
  if(!['follow','wait','quiet'].includes(command)||this.dead||this.state.finished)return false;
  const list=Object.values(this.state.survivors).filter(f=>f.room===this.room.id&&['follow','wait'].includes(f.status));
  for(const f of list){f.status=command==='wait'?'wait':'follow';if(command==='quiet')f.quiet=true;else if(command==='follow')f.quiet=false;}
  if(!list.length){this.emit('toast',{text:'Personne ne peut recevoir cet ordre dans cette pièce.'});return false;}
  const text={follow:'Regroupez-vous sur moi.',wait:'Attendez ici.',quiet:'Suivez-moi sans bruit.'}[command];this.log(text,'order');this.emit('toast',{text});this.emit('save');return true;
 }
 damageSurvivor(f,amount){
  if(!f||f.hitCooldown>0||!['follow','wait'].includes(f.status))return false;
  const factor={story:.55,normal:1,danger:1.35}[this.state.difficulty];f.hp=Math.max(0,f.hp-amount*factor);f.hitCooldown=1.3;f.stress=clamp((f.stress||0)+25,0,100);
  if(f.hp<=0){f.status='down';const text=this.survivorDef(f.id).name+' est à terre. Approchez avec un kit.';this.log(text,'rescue');this.emit('toast',{text});this.emit('save');}return true;
 }
 pressureSurvivors(dt){
  for(const f of Object.values(this.state.survivors)){
   if(f.room!==this.room.id||!['follow','wait'].includes(f.status))continue;
   f.steadyTime=Math.max(0,(f.steadyTime||0)-dt);f.panicClock=Math.max(0,(f.panicClock||0)-dt);
   const threat=this.enemies.some(e=>!['eye_caged','orchid'].includes(e.kind)&&e.stun<=0&&['hunt','windup','strike'].includes(e.mode)&&distance(e,f)<420&&visible(this.room,e,f));
   const comfort=near(f,this.player,160,65)&&visible(this.room,f,this.player);
   f.stress=clamp((f.stress||0)+dt*(threat?(f.steadyTime>0?2:10):comfort?-7:-1.5),0,100);
   if(f.stress>=80&&f.panicClock<=0&&!f.quiet&&f.steadyTime<=0){f.panicClock=4;this.noise={x:f.x,z:f.z,ttl:.5,radius:350};if(!f.panicNotified){f.panicNotified=true;this.emit('toast',{text:this.survivorDef(f.id).name+' panique. Restez près de lui et maintenez T.'});}}
   if(f.stress<55)f.panicNotified=false;
  }
 }
 seesCompanion(e,f){return f.room===this.room.id&&['follow','wait'].includes(f.status)&&distance(e,f)<(f.quiet?350:560)&&visible(this.room,e,f)&&((e.facing||1)*(f.x-e.x)>-25||distance(e,f)<165);}
 chooseTarget(e,input){
  const humans=Object.values(this.state.survivors).filter(f=>this.seesCompanion(e,f));
  const playerAllowed=!(e.kind==='facehugger'&&this.character.id==='wendy');
  const options=[...(playerAllowed&&this.seesPlayer(e,input)?[{id:'player',body:this.player}]:[]),...humans.map(f=>({id:f.id,body:f}))];
  if(!options.length)return {id:'player',body:this.player,visible:false,allowed:playerAllowed};
  options.sort((a,b)=>distance(e,a.body)-distance(e,b.body));const prior=options.find(t=>t.id===e.focusId);
  const target=prior&&distance(e,prior.body)<distance(e,options[0].body)*1.35?prior:options[0];return {...target,visible:true,allowed:true};
 }
 routeBodyIn(room,e,target,dt,speed){
  e.pathClock=(e.pathClock||0)-dt;
  if(e.pathClock<=0||!e.path?.length){e.path=findPath(room,e,target);e.pathClock=.7;if(e.path.length&&distance(e,e.path[0])<3)e.path.shift();}
  if(!e.path?.length){if(distance(e,target)<45&&visible(room,e,target)){const dx=target.x-e.x,dz=target.z-e.z,d=Math.hypot(dx,dz*3.2)||1;advanceBody(room,e,dx/d*Math.min(speed*dt,d),dz/d*Math.min(speed*dt,d));}return;}
  const n=e.path[0],dx=n.x-e.x,dz=n.z-e.z,d=Math.hypot(dx,dz*3.2)||1;
  if(d<3){e.path.shift();return;}const stride=Math.min(speed*dt,d);advanceBody(room,e,dx/d*stride,dz/d*stride);if(Math.abs(dx)>2)e.facing=Math.sign(dx);
 }
 planPursuit(door){
  if(!door||door.kind!=='door'||this.state.pursuits.length>=3)return;
  const eligible=this.enemies.filter(e=>!e.stationary&&!['orchid','eye_caged'].includes(e.kind)&&!(e.kind==='facehugger'&&this.character.id==='wendy')&&e.stun<=0&&(this.seesPlayer(e)||e.memory>0&&e.lastSeen&&distance(e.lastSeen,this.player)<100)&&distance(e,this.player)<760&&visible(this.room,e,this.player)&&findPath(this.room,e,door).length).sort((a,b)=>distance(a,this.player)-distance(b,this.player));
  for(const e of eligible.slice(0,Math.min(2,3-this.state.pursuits.length))){
   if(this.state.pursuits.some(p=>p.enemyId===e.id))continue;
   e.lastSeen={x:door.x,z:door.z};e.memory=6;e.mode='investigate';
   this.state.pursuits.push({enemyId:e.id,from:this.room.id,to:door.to,door:door.id,age:0,wait:0,phase:'walk',announced:false});this.state.stats.pursuits++;
  }
 }
 updatePursuits(dt){
  for(const p of [...this.state.pursuits]){
   const remove=()=>{this.state.pursuits=this.state.pursuits.filter(x=>x!==p);};
   if(p.from===this.room.id||ROOM_BY_ID[p.from].chapter!==this.chapter.id){remove();continue;}
   p.age+=dt;if(p.age>45){remove();continue;}
   const r=roomWithState(this.state,p.from),d=r.portals.find(d=>d.id===p.door),e=this.state.world[p.from]?.enemies.find(e=>e.id===p.enemyId),def=ENEMY_SPAWNS[p.enemyId];
   if(!d||!e||this.state.enemyRooms[e.id]!==p.from){remove();continue;}
   e.stun=Math.max(0,(e.stun||0)-dt);if(e.stun>0)continue;
   if(p.phase==='walk'){
    const nav=this.pursuitPaths[p.enemyId]||={path:[],pathClock:0};Object.assign(nav,{x:e.x,z:e.z});
    this.routeBodyIn(r,nav,d,dt,def.kind.startsWith('xeno')?185:135);e.x=nav.x;e.z=nav.z;e.facing=nav.facing||e.facing;
    if(!near(e,d,46,24))continue;
    p.phase='threshold';p.wait=0;
   }
   const seal=this.sealState(d);
   if(seal.closed){
    p.phase='breach';seal.integrity=Math.max(0,seal.integrity-dt*(def.kind.startsWith('xeno')?12.5:8));this.state.seals[doorKey(d)]=seal;
    if(!p.announced&&p.to===this.room.id){p.announced=true;this.log('Des coups contre la porte de '+ROOM_BY_ID[p.from].title+'.','threat');this.emit('toast',{text:'Le verrou retient quelque chose. Éloignez-vous du seuil.'});this.emit('sound',{kind:'impact'});}
    if(seal.integrity<=0){seal.closed=false;this.state.stats.breaches++;p.phase='threshold';p.wait=0;p.announced=false;if(p.to===this.room.id){this.log('La barre de la porte vient de céder.','threat');this.emit('toast',{text:'Le verrou a cédé !'});this.emit('save');}}continue;
   }
   p.phase='threshold';p.wait+=dt;
   if(!p.announced&&p.to===this.room.id){p.announced=true;this.log('Une présence arrive depuis '+ROOM_BY_ID[p.from].title+'.','threat');this.emit('toast',{text:'Bruit au seuil · '+ROOM_BY_ID[p.from].title});this.emit('sound',{kind:'footstep'});}
   if(p.wait<1.25)continue;
   const targetRoom=roomWithState(this.state,p.to),arrival={x:d.arrivalX,z:targetRoom.mode==='SIDE'?125:d.arrivalZ};
   if(blocked(targetRoom,arrival.x,arrival.z)){continue;} // Do not invent a remote spawn through a closed shutter.
   this.state.world[p.from].enemies=this.state.world[p.from].enemies.filter(v=>v.id!==e.id);
   this.state.enemyRooms[e.id]=p.to;
   const moved=cleanEnemy({...e,...arrival,homeX:arrival.x,homeZ:arrival.z,mode:'arriving',arrivalGrace:1.5,stun:0,cooldown:1.5,timer:0,memory:4,lastSeen:arrival,target:null},def,targetRoom);
   const out=this.state.world[p.to]||={enemies:[],hazards:[],lures:[]};out.enemies=out.enemies.filter(v=>v.id!==e.id);out.enemies.push(packEnemy(moved));
   if(p.to===this.room.id)this.enemies.push({...moved,path:[],pathClock:0});
   this.state.stats.crossings++;delete this.pursuitPaths[e.id];remove();this.emit('save');
  }
 }
 incomingForDoor(door){return this.state.pursuits.find(p=>p.to===this.room.id&&p.from===door.to&&p.phase!=='walk')||null;}
 trackRoom(id){if(ROOM_BY_ID[id]?.chapter!==this.chapter.id)return false;this.state.trackedRoom=id;this.emit('save');return true;}
 routeToTracked(){
  const target=this.state.trackedRoom;if(!target||target===this.room.id)return [];
  const q=[[this.room.id,[]]],seen=new Set([this.room.id]);
  for(let n=0;n<q.length;n++){
   const [rid,path]=q[n];if(rid===target)return path;
   for(const d of ROOM_BY_ID[rid].portals.filter(d=>d.kind==='door'&&(d.requires||[]).every(g=>this.state.completed.includes(g))))if(!seen.has(d.to)){seen.add(d.to);q.push([d.to,[...path,{from:rid,to:d.to,door:d.id,sealed:this.sealState(d).closed,hatch:!!d.hatchKey&&!this.state.ducts.opened.includes(d.hatchKey)}]]);}
  }return null;
 }

 updateSystems(dt,input){
  for(const l of this.lures)l.ttl-=dt;this.lures=this.lures.filter(l=>l.ttl>0);
  for(const v of this.room.vents||[])if(this.ventActive(v)&&near(this.player,v,v.radius,28))this.damage(10);
  for(const f of Object.values(this.state.survivors)){
   if(f.room!==this.room.id||['rescued','left'].includes(f.status))continue;
   const def=this.survivorDef(f.id);f.hitCooldown=Math.max(0,(f.hitCooldown||0)-dt);
   if(f.status==='follow'&&!near(f,this.player,85,27)){
    const nav=this.companionPaths[f.id]||={path:[],pathClock:0};Object.assign(nav,{x:f.x,z:f.z});
    this.enemyRoute(nav,{x:this.player.x,z:this.player.z},dt,(f.quiet?155:205)*(f.stress>=80&&f.steadyTime<=0?.72:1));f.x=nav.x;f.z=nav.z;f.moving=true;
   }else f.moving=false;
   if(f.status!=='down'&&f.hitCooldown<=0){
    const struck=this.hazards.some(h=>near(f,h,h.radius,25))||(this.room.vents||[]).some(v=>this.ventActive(v)&&near(f,v,v.radius,28));
    if(struck)this.damageSurvivor(f,12);
   }
   if(f.status==='follow'&&f.room===def.evac&&near(f,{x:def.evacX,z:def.evacZ},90,50)&&near(this.player,{x:def.evacX,z:def.evacZ},160,70)){
    f.status='rescued';this.state.stats.rescues++;this.grantReward({care:1});this.emit('toast',{text:def.name+' a rejoint les secours.'});this.emit('save');
   }
  }
  this.pressureSurvivors(dt);this.updateFieldActions(dt,input);this.updateResearch(dt,input);this.updatePursuits(dt);
 }
 updateEnemy(e,dt,input){
  e.cooldown=Math.max(0,(e.cooldown||0)-dt);
  if(e.arrivalGrace>0){e.arrivalGrace=Math.max(0,e.arrivalGrace-dt);e.mode='arriving';if(e.arrivalGrace===0)e.mode='investigate';return;}
  if(e.stun>0){e.stun=Math.max(0,e.stun-dt);if(e.stun<=0){e.mode='patrol';e.path=[];}return;}
  if(e.kind==='eye_caged'){e.mode='observing';return;}
  const focus=this.chooseTarget(e,input),p=focus.body,dist=distance(e,p),canSee=focus.visible;
  if(canSee)e.focusId=focus.id;
  const strikeBody=()=>e.focusId==='player'||!e.focusId?this.player:this.state.survivors[e.focusId];
  const hitBody=(f,amount)=>{if(!f||f.room&&f.room!==this.room.id)return;if(f===this.player)this.damage(amount);else this.damageSurvivor(f,amount);};
  e.alert=clamp((e.alert||0)+(canSee?dt*(dist<180?10:1.45):-dt*.22),0,1);
  const lure=this.lures.find(l=>l.ttl>0&&distance(e,l)<l.radius&&visible(this.room,e,l));
  if(e.mode==='windup'){
   e.timer-=dt;if(e.timer<=0){
    e.mode='strike';e.timer=.52;e.cooldown=2.6;
    if(e.kind==='fly'){
     const target=e.target||p,dx=target.x-e.x,dz=target.z-e.z,d=Math.hypot(dx,dz*3.2)||1;
     this.projectiles.push({kind:'acid',owner:e.id,x:e.x,z:e.z,dx:dx/d*580,dz:dz/d*580,ttl:1.4});e.mode='cooldown';e.timer=1.1;
    }else if(e.kind==='orchid'){
     for(const a of [this.player,...Object.values(this.state.survivors).filter(f=>f.room===this.room.id)])if(Math.abs(e.x-a.x)<95&&depthHit(e,a,42)&&visible(this.room,e,a))hitBody(a,38);
     e.mode='cooldown';e.timer=1.6;this.effects.push({kind:'orchid',x:e.x,z:e.z,ttl:.5});
    }else if(e.kind==='tick'){this.hazards.push({x:e.x,z:e.z,ttl:3.4,radius:52});e.mode='cooldown';e.timer=1.4;}
   }return;
  }
  if(e.mode==='strike'){
   e.timer-=dt;const t=e.target||p,dx=t.x-e.x,dz=t.z-e.z,d=Math.hypot(dx,dz*3.2)||1;
   if(e.kind!=='orchid')advanceBody(this.room,e,dx/d*365*dt,dz/d*365*dt);
   const bodies=[this.player,...Object.values(this.state.survivors).filter(f=>f.room===this.room.id&&['follow','wait'].includes(f.status))];
   for(const a of bodies){if(e.kind==='facehugger'&&a===this.player&&this.character.id==='wendy')continue;
    if(Math.abs(e.x-a.x)<52&&depthHit(e,a,23)&&visible(this.room,e,a))hitBody(a,e.kind.startsWith('xeno')?32:19);
   }
   if(e.timer<=0){e.mode='cooldown';e.timer=1.6;}return;
  }
  if(e.mode==='cooldown'){e.timer-=dt;if(e.timer<=0)e.mode='patrol';return;}
  if(e.kind==='orchid'){
   if(canSee&&dist<190&&e.cooldown<=0){e.mode='windup';e.timer=1.1;e.target={x:p.x,z:p.z};}return;
  }
  if(canSee&&e.alert>=.55){e.lastSeen={x:p.x,z:p.z};e.mode='hunt';e.memory=6;}
  else if(lure){e.lastSeen={x:lure.x,z:lure.z};e.mode='investigate';e.memory=3;}
  else if(focus.allowed&&this.noise&&distance(e,this.noise)<this.noise.radius&&(visible(this.room,e,this.noise)||distance(e,this.noise)<this.noise.radius*.35)){e.lastSeen={x:this.noise.x,z:this.noise.z};e.mode='investigate';e.memory=2.5;}
  else if(e.memory>0)e.memory=Math.max(0,e.memory-dt);else if(e.mode==='hunt'||e.mode==='investigate'){e.mode='patrol';e.path=[];}
  const attackRange=e.kind==='fly'?390:e.kind==='tick'?95:150;
  if(canSee&&dist<attackRange&&depthHit(e,p,e.kind==='fly'?65:30)&&e.cooldown<=0){e.mode='windup';e.timer=e.kind==='fly'?.95:.78;e.target={x:p.x,z:p.z};return;}
  if(e.mode==='hunt'||e.mode==='investigate')this.enemyRoute(e,e.lastSeen||{x:e.homeX,z:e.homeZ},dt,e.kind.startsWith('xeno')?185:e.kind==='eye_host'?100:135);
  else{
   const tx=clamp(e.homeX+e.patrol*150,100,this.room.width-100),tz=this.room.mode==='SIDE'?125:e.homeZ;
   if(Math.abs(e.x-tx)<50)e.patrol*=-1;this.enemyRoute(e,{x:tx,z:tz},dt,e.kind.startsWith('xeno')?63:48);
  }
 }
 update(dt,input={}){
  if(this.dead||this.state.finished||this.pending)return;
  dt=clamp(Number(dt)||0,0,.05);this.time+=dt;this.state.playSeconds+=dt;const p=this.player;
  this.iframe=Math.max(0,this.iframe-dt);this.toolCooldown=Math.max(0,this.toolCooldown-dt);this.resonanceCooldown=Math.max(0,this.resonanceCooldown-dt);this.fireCooldown=Math.max(0,this.fireCooldown-dt);
  p.energy=clamp(p.energy+dt*5.5,0,100);
  if(this.reloadTime>0){this.reloadTime-=dt;if(this.reloadTime<=0){const load=Math.min(12-p.ammo,p.reserve);p.ammo+=load;p.reserve-=load;}}
  if(this.noise){this.noise.ttl-=dt;if(this.noise.ttl<=0)this.noise=null;}
  let mx=clamp(input.x||0,-1,1),mz=clamp(input.z||0,-1,1);
  if(this.room.mode==='SIDE'||this.state.presentation==='CLASSIC')mz=0;
  const d=Math.hypot(mx,mz)||1;mx/=d;mz/=d;let speed=this.character.speed*(input.crouch?.54:input.sprint?1.43:1);
  if(this.hold){mx=0;mz=0;}
  if(this.hidden&&(mx||mz||input.sprint))this.hidden=null;
  const ox=p.x,oz=p.z;advanceBody(this.room,p,mx*speed*dt,mz*speed*.48*dt);if(mx)p.facing=Math.sign(mx);
  this.moving=Math.abs(ox-p.x)+Math.abs(oz-p.z)>.05;this.crouching=!!input.crouch;
  if(this.moving){const surface=this.surfaceAt();const radius=(input.crouch?70:input.sprint?520:220)*surface.noise;if(!this.noise||this.noise.radius<=radius)this.noise={x:p.x,z:p.z,ttl:.3,radius};}
  if(this.state.escort){const a=this.escortActor;if(!near(a,p,95,35)){a.pathClock||=0;this.enemyRoute(a,{x:p.x,z:p.z},dt,175);}}
  for(const e of this.enemies)this.updateEnemy(e,dt,input);
  this.updateSystems(dt,input);
  for(const b of this.projectiles){
   const steps=Math.max(1,Math.ceil(Math.abs(b.dx*dt)/12));
   for(let i=0;i<steps&&b.ttl>0;i++){
    b.x+=b.dx*dt/steps;b.z+=b.dz*dt/steps;
    if(b.x<25||b.x>this.room.width-25||b.z<20||b.z>230||this.room.props.some(p=>p.solid&&b.x>p.x&&b.x<p.x+p.w&&b.z>p.z&&b.z<p.z+p.d)){b.ttl=0;break;}
    if(b.owner==='player'){
     if(this.hitSecurityProjectile?.(b))break;
     const e=this.enemies.find(e=>e.kind!=='eye_caged'&&Math.abs(e.x-b.x)<34&&depthHit(e,b,23));
     if(e){e.stun=Math.max(e.stun||0,e.kind.startsWith('xeno')?1.8:3.5);e.mode='stunned';this.effects.push({kind:'impact',x:e.x,z:e.z,ttl:.3});b.ttl=0;}
    }else if(Math.abs(p.x-b.x)<30&&depthHit(p,b,22)){this.damage(24);b.ttl=0;}else if(b.owner!=='player'){const f=Object.values(this.state.survivors).find(f=>f.room===this.room.id&&['follow','wait'].includes(f.status)&&Math.abs(f.x-b.x)<26&&depthHit(f,b,22));if(f){this.damageSurvivor(f,24);b.ttl=0;}}
   }
   b.ttl-=dt;
   if(b.ttl<=0&&b.kind==='acid'){this.hazards.push({x:clamp(b.x,40,this.room.width-40),z:clamp(b.z,25,225),ttl:4.2,radius:58});}
  }
  this.projectiles=this.projectiles.filter(b=>b.ttl>0);
  for(const h of this.hazards){h.ttl-=dt;if(Math.abs(h.x-p.x)<h.radius&&depthHit(h,p,24))this.damage(13);}
  this.hazards=this.hazards.filter(h=>h.ttl>0);
  if(this.hold){if(!input.interact||!near(p,this.room.task)||!visible(this.room,p,this.room.task)){this.hold=null;}else{this.hold.time+=dt;this.state.fieldWork[this.hold.id]=Math.floor(this.hold.time*2)/2;if(this.hold.time>=this.room.task.duration)this.completeGoal(this.hold.id);}}
  for(const effect of this.effects)effect.ttl-=dt;this.effects=this.effects.filter(e=>e.ttl>0);
 }
}

export const EarthEngine=withEarthFidelityV11(withEarthFidelityV10(withEarthSecurityV9(withEarthInvestigationsV8(withEarthDuctsV7(withEarthSensorsV6(withEarthContainmentV5(withEarthServicesV4(EarthEngineBase,{ROOM_BY_ID,near,visible,blocked,doorKey,clone,roomWithState}),{ROOM_BY_ID,near,visible,clone}),{ROOM_BY_ID,near,visible,blocked,clone,roomWithState,doorKey}),{near,visible,clone}),{near,visible}),{near,visible,clone}),{visible,clone}),{clone});
