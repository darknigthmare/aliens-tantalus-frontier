
/* Deterministic simulation. No DOM, no network, no dependency on the host campaign. */
(function (G) {
'use strict';
const D=G.AVP_DATA, ROOMS=new Map(D.rooms.map(r=>[r.id,r]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const finite=(n,f=0)=>Number.isFinite(n)?n:f;
const copy=o=>JSON.parse(JSON.stringify(o));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const allowedModes=new Set(['hybrid','classic']);
function overlaps(x,y,r,b){return x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h;}
function blocked(room,x,y,r=15){return x<48+r||x>room.width-48-r||y<40+r||y>250-r||room.solids.some(b=>overlaps(x,y,r,b));}
function safePoint(room,x,y){
 x=clamp(finite(x,200),72,room.width-72);y=clamp(finite(y,144),60,230);
 if(!blocked(room,x,y))return {x,y};
 for(let rad=24;rad<room.width;rad+=24)for(const dy of [0,24,-24,48,-48,72,-72,96,-96])for(const s of [-1,1]){
  const px=clamp(x+s*rad,72,room.width-72),py=clamp(y+dy,60,230);if(!blocked(room,px,py))return {x:px,y:py};
 }
 throw new Error('No safe position in '+room.id);
}
// Small deterministic A* on a room-local grid; both companions and hostile actors use it.
function path(room,start,goal,classic=false){
 if(classic)return [safePoint(room,goal.x,144)];
 const step=28,cols=Math.ceil(room.width/step),rows=7;
 const coord=(x,y)=>[clamp(Math.round((x-75)/step),0,cols-5),clamp(Math.round((y-62)/step),0,rows-1)];
 const point=(c,r)=>({x:75+c*step,y:62+r*step});const [sx,sy]=coord(start.x,start.y),[tx,ty]=coord(goal.x,goal.y);
 const key=(c,r)=>r*cols+c,sk=key(sx,sy),tk=key(tx,ty);const open=[sk],cost=new Map([[sk,0]]),parents=new Map(),closed=new Set();
 let best=sk,besth=1e9;
 for(let tries=0;open.length&&tries<1400;tries++){
  open.sort((a,b)=>(cost.get(a)+Math.abs(a%cols-tx)+Math.abs(Math.floor(a/cols)-ty))-(cost.get(b)+Math.abs(b%cols-tx)+Math.abs(Math.floor(b/cols)-ty)));
  const k=open.shift(),c=k%cols,r=Math.floor(k/cols);if(closed.has(k))continue;closed.add(k);
  const h=Math.abs(c-tx)+Math.abs(r-ty);if(h<besth){besth=h;best=k;}if(k===tk){best=k;break;}
  for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=r+dr;
   if(nc<0||nc>cols-5||nr<0||nr>=rows)continue;const nk=key(nc,nr),p=point(nc,nr);
   if(blocked(room,p.x,p.y,16)||closed.has(nk))continue;const v=cost.get(k)+1;
   if(!cost.has(nk)||cost.get(nk)>v){cost.set(nk,v);parents.set(nk,k);open.push(nk);}
  }
 }
 const out=[];let k=best;while(k!==sk&&parents.has(k)){out.unshift(point(k%cols,Math.floor(k/cols)));k=parents.get(k);}
 if(!blocked(room,goal.x,goal.y,16)&&besth<2)out.push(goal);return out;
}
function fresh(settings={}){
 return {schema:10,traversal:null,partyTraversals:{},crossingRecords:{},crossingStats:{started:0,completed:0,returned:0,hits:0,slips:0,party:0},devices:{},soundEvents:[],soundSerial:0,rig:{tethered:false,reloadAt:0,bolt:null,latchedAt:0},terrainStats:{switches:0,lures:0,purges:0,pitonShots:0,pitonHits:0},portals:{},pursuits:[],huntBudget:{},huntJournal:[],portalMemory:{},opened:[],clues:[],shortcuts:[],hidden:null,lamp:true,waypoint:null,residue:{},tracking:{},operations:[],balance:[0,0,0],eggs:{},ally:{order:'follow',energy:100},scene:null,sceneSeen:[],duelTime:0,dlc:D.id,version:D.version,room:'maru',chapter:0,flags:{},visited:['maru'],logs:[],
  mode:allowedModes.has(settings.mode)?settings.mode:'hybrid',difficulty:settings.difficulty==='survival'?'survival':'expedition',
  player:{x:250,y:144,face:1,hp:100,stamina:100},inventory:{medkits:0,flares:0},
  worldTime:0,pyramidTime:0,bombRemaining:null,enemies:{},queenAttacks:0,seal:{rings:[0,0,0],solved:false},
  stats:{deaths:0,kills:0,steps:0,interactions:0},completed:false};
}
function hydrate(raw){
 if(typeof raw==='string'){if(raw.length>512000)throw new Error('Sauvegarde trop volumineuse.');raw=JSON.parse(raw);}
 if(!raw||![1,2,3,4,5,6,7,8,9,10].includes(raw.schema)||raw.dlc!==D.id||!ROOMS.has(raw.room)||ROOMS.get(raw.room).sceneOnly)throw new Error('Sauvegarde AVP incompatible.');
 const s=fresh(raw);s.chapter=clamp(Math.floor(finite(raw.chapter)),0,D.chapters.length);
 s.flags=Object.fromEntries(D.chapters.slice(0,s.chapter).map(c=>[c.flag,true]));s.room=raw.room;
 s.visited=Array.isArray(raw.visited)?[...new Set(raw.visited.filter(id=>ROOMS.has(id)))]:['maru'];if(!s.visited.includes(s.room))s.visited.push(s.room);
 const logIds=new Set(D.rooms.flatMap(r=>r.collectibles.map(c=>c.id)));
 s.logs=Array.isArray(raw.logs)?[...new Set(raw.logs.filter(id=>logIds.has(id)))]:[];
 const p=raw.player||{},pos=safePoint(ROOMS.get(s.room),p.x,p.y);s.player={...pos,face:p.face===-1?-1:1,hp:clamp(finite(p.hp,100),1,100),stamina:clamp(finite(p.stamina,100),0,100)};
 if(s.mode==='classic'||ROOMS.get(s.room).mode==='SIDE')s.player.y=144;
 const inv=raw.inventory||{};s.inventory={medkits:clamp(Math.floor(finite(inv.medkits)),0,12),flares:clamp(Math.floor(finite(inv.flares)),0,16)};
 s.worldTime=clamp(finite(raw.worldTime),0,1e8);s.pyramidTime=clamp(finite(raw.pyramidTime),0,1e8);
 if(s.flags.bomb&&!s.flags.escaped)s.bombRemaining=clamp(finite(raw.bombRemaining,180),.1,180);
 s.queenAttacks=clamp(Math.floor(finite(raw.queenAttacks)),0,999);
 for(const def of D.enemies){const v=raw.enemies?.[def.id];if(!v||typeof v!=='object')continue;const loc=raw.schema>=4&&G.AVP_HUNT?.validLocation(def,v.room)?v.room:def.room;const pos=safePoint(ROOMS.get(loc),v.x,v.y);s.enemies[def.id]={...pos,room:loc,hp:clamp(finite(v.hp,def.hp),0,def.hp),face:v.face===-1?-1:1};}
 for(const k of Object.keys(s.stats))s.stats[k]=clamp(Math.floor(finite(raw.stats?.[k])),0,1e8);
 s.seal.rings=[0,1,2].map(i=>clamp(Math.floor(finite(raw.seal?.rings?.[i])),0,3));s.seal.solved=s.flags.plasma===true||(raw.seal?.solved===true&&s.seal.rings.every((v,i)=>v===[2,1,3][i]));
 
 const operationIds=new Set(D.operations.map(o=>o.id));
 s.operations=Array.isArray(raw.operations)?[...new Set(raw.operations.filter(id=>operationIds.has(id)))]:[];
 // Completed v1 milestones are preserved; do not force an old expedition to backtrack.
 if(raw.schema===1)for(const o of D.operations)if(o.forFlag&&s.flags[o.forFlag]&&!s.operations.includes(o.id))s.operations.push(o.id);
 s.balance=[0,1,2].map(i=>clamp(Math.floor(finite(raw.balance?.[i])),0,3));
 if(s.operations.includes('balance'))s.balance=[1,3,2];
 for(const def of D.eggs){const e=raw.eggs?.[def.id];if(!e)continue;s.eggs[def.id]={state:['intact','opening','spent','destroyed'].includes(e.state)?e.state:'intact',time:clamp(finite(e.time),0,2)};}
 s.ally={order:raw.ally?.order==='hold'?'hold':'follow',energy:clamp(finite(raw.ally?.energy,100),0,100)};
 s.duelTime=clamp(finite(raw.duelTime, s.flags.duel?16:0),0,16);
 s.sceneSeen=Array.isArray(raw.sceneSeen)?[...new Set(raw.sceneSeen.filter(id=>['queen-fall','collapse'].includes(id)))]:[];
 if(raw.scene&&['queen-fall','collapse'].includes(raw.scene.id)){
  const valid=raw.scene.id==='queen-fall'?s.flags.chain&&!s.flags.queen:s.flags.escaped;
  if(valid)s.scene={id:raw.scene.id,t:clamp(finite(raw.scene.t),0,8),duration:raw.scene.id==='queen-fall'?7.5:4.2};
 }
 
 const fields=D.interactables||[],pick=(value,ids)=>Array.isArray(value)?[...new Set(value.filter(id=>ids.has(id)))]:[];
 s.opened=pick(raw.opened,new Set(fields.filter(o=>o.kind==='cache').map(o=>o.id)));
 s.clues=pick(raw.clues,new Set(fields.filter(o=>o.kind==='clue').map(o=>o.id)));
 s.shortcuts=pick(raw.shortcuts,new Set(D.rooms.flatMap(r=>r.doors.map(a=>a.shortcut)).filter(Boolean)));
 s.lamp=raw.lamp!==false;s.waypoint=typeof raw.waypoint==='string'&&ROOMS.has(raw.waypoint)&&!ROOMS.get(raw.waypoint).sceneOnly?raw.waypoint:null;
 const hiding=fields.find(a=>a.kind==='hide'&&a.id===raw.hidden?.id&&a.room===s.room&&(!a.after||s.flags[a.after]));
 if(hiding&&Math.abs(s.player.x-hiding.x)<100){s.hidden={id:hiding.id,witnesses:pick(raw.hidden.witnesses,new Set(D.enemies.filter(e=>(s.enemies[e.id]?.room||e.room)===s.room&&!e.unique).map(e=>e.id))),lampBefore:raw.hidden.lampBefore!==false};s.lamp=false;}
 for(const r of D.rooms){const v=raw.residue?.[r.id];if(!v||typeof v!=='object')continue;
  const list=(key,maxlife)=>Array.isArray(v[key])?v[key].slice(0,24).filter(a=>a&&Number.isFinite(a.x)&&Number.isFinite(a.y)&&Number.isFinite(a.expires)&&a.expires>s.worldTime).map(a=>({...safePoint(r,a.x,a.y),expires:clamp(a.expires,s.worldTime,s.worldTime+maxlife)})):[];
  s.residue[r.id]={acids:list('acids',7.5),flares:list('flares',9)};
 }
 for(const def of D.enemies){const v=raw.tracking?.[def.id];if(!v||typeof v!=='object')continue;const r=ROOMS.get(s.enemies[def.id]?.room||def.room),z={savedAt:clamp(finite(v.savedAt,s.worldTime),0,s.worldTime),mode:['patrol','pursue','investigate','search','lure'].includes(v.mode)?v.mode:'patrol'};
  for(const [key,max] of Object.entries({memory:8,awareness:1,searchAge:10,reachHide:2,attack:3,windup:1,stun:1,timer:6,telegraph:1.1,charge:1.25,chargeY:250}))z[key]=clamp(finite(v[key]),0,max);
  z.chargeFace=v.chargeFace===1?1:-1;if(v.lastSeen&&Number.isFinite(v.lastSeen.x)&&Number.isFinite(v.lastSeen.y))z.lastSeen=safePoint(r,v.lastSeen.x,v.lastSeen.y);
  s.tracking[def.id]=z;
 }
 const ap=raw.ally?.position;
 if(ap&&ap.room===s.room&&Number.isFinite(ap.x)&&Number.isFinite(ap.y)&&s.flags.alliance&&!s.flags.queen)s.ally.position={room:s.room,...safePoint(ROOMS.get(s.room),ap.x,s.mode==='classic'||ROOMS.get(s.room).mode==='SIDE'?144:ap.y),face:ap.face===-1?-1:1};
 s.completed=s.chapter===D.chapters.length;if(s.completed)s.hidden=null;if(G.AVP_HUNT)G.AVP_HUNT.hydrate(s,raw);if(G.AVP_TERRAIN)G.AVP_TERRAIN.hydrate(s,raw);if(G.AVP_PARTY)G.AVP_PARTY.hydrate(s,raw);if(G.AVP_TRAVERSAL)G.AVP_TRAVERSAL.hydrate(s,raw);if(G.AVP_RESCUE)G.AVP_RESCUE.hydrate(s,raw);if(G.AVP_EVACUATION)G.AVP_EVACUATION.hydrate(s,raw);return G.AVP_ENCOUNTERS?G.AVP_ENCOUNTERS.hydrate(s,raw):s;
}
class Game {
 constructor(options={}){
  this.s=options.state?hydrate(options.state):fresh(options);this.events=[];this.runtime={};this.dead=false;this.scar=null;this.shots=[];this.flares=[];this.acids=[];
  this.roomTime=0;this.attackTime=0;this.invuln=0;this.dodgeTime=0;this.cooldown=0;this.hold=0;this.lastInput={};this.interactLatch=false;this.noise=0;this.flash=0;this.allyCooldown=0;this.effect=[];
  this.syncEnemies();this.placeAlly();this.restoreRoomEffects();this.footprints=[];this.checkpoint=this.serialize();
 }
 get room(){return ROOMS.get(this.s.room);}
 get collisionRoom(){return {...this.room,solids:[...this.room.solids,...this.slabs().filter(b=>b.closed).map(b=>({x:b.x,y:b.y,w:b.w,h:b.h,dynamic:true}))]};}
 slabs(){
  return D.mechanisms.filter(m=>m.room===this.s.room&&this.s.flags[m.after]).map(m=>{
   const t=(this.s.worldTime+m.offset)%m.period,disabled=m.disabledBy&&this.s.operations.includes(m.disabledBy);
   const attempted=!disabled&&t>=m.open+m.warn;
   // Closing is deferred until the entire swept volume is clear, including living hostiles.
   const bodies=[this.s.player,...this.enemies.filter(e=>e.hp>0),...(this.companionActors?this.companionActors():(this.scar?[this.scar]:[]))];
   const occupied=bodies.some(a=>overlaps(a.x,a.y,15,m));
   return {...m,closed:attempted&&!occupied,warning:!disabled&&t>=m.open&&t<m.open+m.warn,held:attempted&&occupied,disabled,remaining:m.period-t};
  });
 }
 activeEnemy(def){return (this.s.enemies[def.id]?.room||def.room)===this.s.room&&this.s.flags[def.after]&&!this.s.flags[def.until]&&(!def.egg||this.s.eggs[def.egg]?.state==='spent');}
 get remainingOperations(){return D.operations.filter(o=>o.forFlag===this.objective?.flag&&!this.s.operations.includes(o.id));}
 get guide(){return this.remainingOperations[0]||this.objective;}
 get availableOperations(){return D.operations.filter(o=>o.room===this.s.room&&!this.s.operations.includes(o.id)&&(!o.after||this.s.flags[o.after])&&(!o.forFlag||!this.s.flags[o.forFlag]));}
 operationReason(o){const missing=o.requires.find(id=>!this.s.operations.includes(id));return missing?D.operations.find(a=>a.id===missing)?.title:null;}
 doOperation(o){
  if(!this.availableOperations.includes(o)||!this.near(o,88))return false;
  const reason=this.operationReason(o);if(reason){this.emit('notice',reason+' d’abord.');return false;}
  if(o.puzzle==='balance'&&!this.s.balance.every((v,i)=>v===[1,3,2][i])){this.emit('balance');this.interactLatch=true;return false;}
  this.s.operations.push(o.id);this.s.stats.interactions++;
  if(o.reward==='supplies'){this.s.inventory.medkits=clamp(this.s.inventory.medkits+1,0,12);this.s.inventory.flares=clamp(this.s.inventory.flares+2,0,16);}
  this.emit('operation',o.text,{title:o.title});this.hold=0;this.interactLatch=true;this.saveCheckpoint();return true;
 }
 turnWeight(i,delta=1){const o=D.operations.find(o=>o.id==='balance');if(!this.availableOperations.includes(o)||!this.near(o,88)||!Number.isInteger(i)||i<0||i>2||![-1,1].includes(delta))return false;this.s.balance[i]=(this.s.balance[i]+delta+4)%4;return true;}
 toggleAlly(){if(!this.scar)return false;this.s.ally.order=this.s.ally.order==='follow'?'hold':'follow';this.scar.nav=[];this.emit('notice',this.s.ally.order==='hold'?'Scar garde cette position.':'Scar reprend la marche.');return true;}
 beginScene(id){this.s.scene={id,t:0,duration:id==='queen-fall'?7.5:4.2};this.hold=0;this.emit('cinematic',id==='queen-fall'?'La chaîne se tend. La cuve entraîne la Reine.':'La détonation remonte dans la glace.');this.saveCheckpoint();}
 tickScene(dt){const a=this.s.scene;if(!a)return;this.s.worldTime+=dt;a.t+=dt;if(a.t>=a.duration){this.s.sceneSeen.push(a.id);this.s.scene=null;if(a.id==='queen-fall')this.completeObjective(true);else this.saveCheckpoint();}this.lastInput={};}
 updateEggs(dt){
  for(const e of D.eggs.filter(e=>e.room===this.s.room&&this.s.flags[e.after])){
   const state=this.s.eggs[e.id]||(this.s.eggs[e.id]={state:'intact',time:0});if(['spent','destroyed'].includes(state.state))continue;
   if(e.disabledBy&&this.s.operations.includes(e.disabledBy)){if(state.state==='opening'){state.state='intact';state.time=0;}continue;}
   const pos={x:e.x,y:this.isSide?144:e.y};
   if(state.state==='intact'&&dist(pos,this.s.player)<(this.crouching?76:170)&&this.los(pos,this.s.player)){state.state='opening';state.time=0;this.emit('warning','Un œuf se déplie. Écartez-vous.');}
   if(state.state==='opening'){state.time+=dt;if(state.time>=1.6){state.state='spent';this.syncEnemies();this.emit('hatch');}}
  }
 }


 get availableFields(){return (D.interactables||[]).filter(o=>o.room===this.s.room&&(!o.after||this.s.flags[o.after])&&(o.kind==='cache'?!this.s.opened.includes(o.id):o.kind==='clue'?!this.s.clues.includes(o.id):true));}
 doField(o){
  if(this.s.hidden&&o.id===this.s.hidden.id){this.leaveHide();return true;}
  if(!this.availableFields.includes(o)||!this.near(o,72)||this.s.scene)return false;
  if(o.kind==='hide')return this.enterHide(o);
  if(o.kind==='cache'){
   this.s.opened.push(o.id);for(const key of ['medkits','flares'])this.s.inventory[key]=clamp(this.s.inventory[key]+(o.reward?.[key]||0),0,key==='medkits'?12:16);
  }else if(o.kind==='clue')this.s.clues.push(o.id);else return false;
  this.s.stats.interactions++;this.noise=.8;this.hold=0;this.interactLatch=true;
  this.emit('field',o.text,{title:o.title});this.saveCheckpoint();return true;
 }
 enterHide(o){
  if(this.s.hidden||o.kind!=='hide'||!this.availableFields.includes(o)||!this.near(o,72))return false;
  const visible=this.enemies.filter(e=>e.hp>0&&!e.unique&&dist(e,this.s.player)<440&&(this.visualRay?this.visualRay(e,this.s.player):this.los(e,this.s.player)));
  if(visible.some(e=>dist(e,this.s.player)<170)){this.emit('notice','La créature est trop proche pour vous dissimuler.');return false;}
  const witnesses=visible.filter(e=>(this.s.player.x-e.x)*e.face>-30||this.runtime[e.id]?.mode==='pursue').map(e=>e.id);
  this.s.hidden={id:o.id,witnesses,lampBefore:this.s.lamp};this.s.lamp=false;this.noise=0;
  for(const id of witnesses){const rt=this.runtime[id];rt.lastSeen={x:this.s.player.x,y:this.s.player.y};rt.memory=8;rt.reachHide=0;}
  this.emit('field',witnesses.length?'Elle vous a vue entrer. Cette cachette ne tiendra pas.':'La pierre coupe la vue. Attendez que la recherche s’éloigne.',{title:o.title});
  this.hold=0;this.interactLatch=true;this.saveCheckpoint();return true;
 }
 leaveHide(forced=false){if(!this.s.hidden)return false;this.s.lamp=this.s.hidden.lampBefore;this.s.hidden=null;this.hold=0;this.interactLatch=true;this.noise=forced?1.5:.1;this.emit('notice',forced?'La créature vous déloge !':'Vous quittez la cachette.');this.saveCheckpoint();return true;}
 unlockDoor(door){
  if(!this.room.doors.includes(door)||!door.shortcut||this.s.shortcuts.includes(door.shortcut)||door.unlockFrom!==this.s.room||!this.near(door,86)||(door.gate&&!this.s.flags[door.gate])||this.s.hidden)return false;
  this.s.shortcuts.push(door.shortcut);this.s.stats.interactions++;this.hold=0;this.interactLatch=true;this.emit('field','Le verrou reste levé. Ce passage est désormais utilisable dans les deux sens.',{title:'Un chemin de retour'});this.saveCheckpoint();return true;
 }
 markRoute(id){
  const known=new Set(this.s.visited);for(const rid of this.s.visited)for(const d of ROOMS.get(rid)?.doors||[])known.add(d.to);
  if(id!==null&&(!known.has(id)||ROOMS.get(id)?.sceneOnly))return false;this.s.waypoint=id;this.saveCheckpoint();return true;
 }
 knownRoute(target){const visited=new Set(this.s.visited),q=[[this.s.room]],seen=new Set([this.s.room]);while(q.length){const a=q.shift(),last=a[a.length-1];if(last===target)return a;for(const d of ROOMS.get(last).doors){if(seen.has(d.to)||(!visited.has(d.to)&&d.to!==target)||this.gate(d))continue;seen.add(d.to);q.push([...a,d.to]);}}return [];}
 get nextWaypointDoor(){const route=this.s.waypoint?this.knownRoute(this.s.waypoint):[];return route.length>1?this.room.doors.find(d=>d.to===route[1]&&!this.gate(d)):null;}
 get threat(){if(this.s.hidden)return this.s.hidden.witnesses.length?'CACHE COMPROMISE':'DISSIMULÉE';const rs=this.enemies.filter(e=>e.hp>0).map(e=>this.runtime[e.id]);return rs.some(a=>a?.mode==='pursue')?'REPÉRÉE':rs.some(a=>['investigate','search'].includes(a?.mode))?'RECHERCHE EN COURS':this.noise>.1?'BRUIT DE DÉPLACEMENT':'DISCRÈTE';}
 perceive(e,rt,dt,input,flare){
  const p=this.s.player,range=input.crouch?(this.s.lamp?220:165):(this.s.lamp?435:330),close=dist(e,p)<95;
  const sees=!this.s.hidden&&dist(e,p)<range&&((p.x-e.x)*e.face>-35||close)&&this.los(e,p);
  const hears=!this.s.hidden&&this.noise>0&&dist(e,p)<(this.noise>1?610:470);
  const hide=this.s.hidden,followingHide=hide?.witnesses.includes(e.id);
  if(flare){rt.mode='lure';rt.awareness=Math.max(0,(rt.awareness||0)-dt);return {active:true,target:flare};}
  if(sees||hears){rt.lastSeen={x:p.x,y:p.y};rt.memory=6;rt.mode=sees?'pursue':'investigate';rt.awareness=clamp((rt.awareness||0)+dt*(sees?3:1),0,1);rt.searchAge=0;}
  else{rt.memory=Math.max(0,(rt.memory||0)-dt);rt.awareness=Math.max(0,(rt.awareness||0)-dt*.35);}
  if(followingHide){rt.lastSeen={x:p.x,y:p.y};rt.memory=8;rt.mode='investigate';if(dist(e,p)<105&&this.los(e,p)){rt.reachHide=(rt.reachHide||0)+dt;if(rt.reachHide>1.1){this.leaveHide(true);rt.mode='pursue';}}}
  if(rt.memory>0&&rt.lastSeen){
   if(!sees&&!hears&&dist(e,rt.lastSeen)<45&&!followingHide){rt.mode='search';rt.searchAge=(rt.searchAge||0)+dt;return {active:true,target:safePoint(this.room,rt.lastSeen.x+Math.sin(rt.searchAge*1.8)*62,this.isSide?144:rt.lastSeen.y+Math.cos(rt.searchAge*1.8)*22)};}
   return {active:true,target:rt.lastSeen};
  }
  rt.mode='patrol';return {active:false,target:null};
 }
 storeRoomState(){
  if(!this.s||!this.acids||!this.flares)return;
  this.s.residue[this.s.room]={acids:this.acids.filter(a=>a.life>0).slice(-24).map(a=>({x:a.x,y:a.y,expires:this.s.worldTime+a.life})),flares:this.flares.filter(a=>a.life>0).slice(-24).map(a=>({x:a.x,y:a.y,expires:this.s.worldTime+a.life}))};
  this.s.ally.position=this.scar?{room:this.s.room,x:this.scar.x,y:this.scar.y,face:this.scar.face}:null;
  for(const [id,rt] of Object.entries(this.runtime||{})){
   const v={savedAt:this.s.worldTime,mode:rt.mode||'patrol',lastSeen:rt.lastSeen?{...rt.lastSeen}:null};
   for(const k of ['memory','awareness','searchAge','reachHide','attack','windup','stun','timer','telegraph','charge','chargeY','chargeFace'])v[k]=finite(rt[k]);this.s.tracking[id]=v;
  }
 }
 restoreRoomEffects(){
  const v=this.s.residue[this.s.room]||{};
  const restore=key=>(v[key]||[]).filter(a=>a.expires>this.s.worldTime).map(a=>({x:a.x,y:this.isSide?144:a.y,life:a.expires-this.s.worldTime}));
  this.acids=restore('acids');this.flares=restore('flares');
 }
 get objective(){return D.chapters[this.s.chapter]||null;}
 get isSide(){return this.s.mode==='classic'||this.room.mode==='SIDE';}
 get phase(){return Math.floor(this.s.pyramidTime/D.pyramidPeriod)%3;}
 get cycleRemaining(){return D.pyramidPeriod-(this.s.pyramidTime%D.pyramidPeriod);}
 emit(type,text='',extra={}){this.events.push({type,text,...extra});}
 drain(){return this.events.splice(0);}
 serialize(){this.storeRoomState();return JSON.stringify(this.s);}
 snapshot(){this.storeRoomState();return copy(this.s);}
 saveCheckpoint(){this.checkpoint=this.serialize();this.emit('save');}
 setMode(mode){if(!allowedModes.has(mode))return;this.s.mode=mode;if(this.isSide){this.s.player.y=144;for(const a of this.enemies)a.y=144;if(this.scar)this.scar.y=144;}this.hold=0;this.emit('mode',mode==='classic'?'Vue latérale':'Vues hybrides');this.saveCheckpoint();}
 placeAlly(){
  const stored=this.s.ally.position?.room===this.s.room?this.s.ally.position:null;
  this.scar=this.s.flags.alliance&&!this.s.flags.queen?{...(stored||safePoint(this.room,this.s.player.x-72, this.isSide?144:this.s.player.y+30)),face:stored?.face||1,nav:[],navAge:0}:null;
 }
 syncEnemies(){
  for(const def of D.enemies.filter(e=>this.activeEnemy(e))){
   if(!this.s.enemies[def.id])this.s.enemies[def.id]={...safePoint(this.room,def.x,this.isSide?144:def.y),hp:def.hp,face:-1,room:def.room};
   if(!this.runtime[def.id]){const saved=this.s.tracking?.[def.id];this.runtime[def.id]={timer:0,attack:0,stun:0,nav:[],navAge:0,alert:0,charge:0,telegraph:0,chargeY:144,chargeFace:-1,home:this.s.enemies[def.id]?.x||def.x,mode:'patrol',memory:0,awareness:0,...saved,nav:[],navAge:0};if(saved)this.runtime[def.id].memory=Math.max(0,saved.memory-(this.s.worldTime-saved.savedAt));}
  }
 }
 get enemies(){return D.enemies.filter(e=>this.activeEnemy(e)).map(e=>Object.assign(this.s.enemies[e.id]||{}, {id:e.id,kind:e.kind,unique:!!e.unique}));}
 gate(door){
  if(this.s.flags.escaped&&['vestibule','sacrifice','ossuary','weapons','pivot','press','duel','glyphs','refuge','hunter','service','nursery','queenhold','trophies','forecourt','weights','astrarium','incubator','gantry','balcony','drain','cloister','shaft','eggworks','cocoonhall'].includes(door.to))return 'La pyramide s’est effondrée.';
  if(door.gate&&!this.s.flags[door.gate])return 'Terminer d’abord : '+(D.chapters.find(c=>c.flag===door.gate)?.title||'le passage en cours')+'.';
  if(door.phases&&!door.phases.includes(this.phase))return 'Le passage de service s’ouvrira au prochain cycle.';
  if(door.shortcut&&!this.s.shortcuts.includes(door.shortcut))return door.unlockFrom===this.s.room?'Déverrouiller le passage depuis ce côté.':'Le verrou se trouve de l’autre côté.';
  return null;
 }
 enter(door){
  if(this.s.hidden||!this.room.doors.includes(door))return false;
  const reason=this.gate(door);if(reason){this.emit('notice',reason);return false;}
  if(!this.near(door,86))return false;
  const next=ROOMS.get(door.to),pair=next.doors.find(d=>d.id===door.pair);if(!pair)throw new Error('Broken reciprocal door '+door.id);
  this.storeRoomState();this.s.room=next.id;const y=(this.s.mode==='classic'||next.mode==='SIDE')?144:clamp(pair.y+28,65,225);
  const x=pair.x<150?pair.x+50:pair.x>next.width-150?pair.x-50:pair.x+65;
  Object.assign(this.s.player,safePoint(next,x,y));this.s.player.face=pair.x>next.width-200?-1:1;
  this.s.ally.order='follow';
  if(!this.s.visited.includes(next.id))this.s.visited.push(next.id);
  this.roomTime=0;this.hold=0;this.runtime={};this.shots=[];this.acids=[];this.flares=[];this.effect=[];this.invuln=.7;this.interactLatch=true;
  this.syncEnemies();this.placeAlly();this.restoreRoomEffects();this.saveCheckpoint();this.emit('room',next.name);return true;
 }
 near(a,r=85){return Math.abs(this.s.player.x-a.x)<r&&(this.isSide||Math.abs(this.s.player.y-a.y)<46);}
 nearest(){
  if(this.s.hidden){const o=D.interactables.find(a=>a.id===this.s.hidden.id);return {kind:'exit-hide',item:o,label:'Sortir de la cachette'};}
  for(const o of this.availableOperations)if(this.near(o,88))return {kind:'operation',item:o,label:o.title};
  const obj=this.objective;
  if(obj?.room===this.s.room&&this.near(obj,95))return {kind:'objective',item:obj,label:obj.title};
  for(const c of this.room.collectibles)if(!this.s.logs.includes(c.id)&&this.near(c,86))return {kind:'log',item:c,label:c.title};
  for(const o of this.availableFields)if(this.near(o,72))return {kind:'field',item:o,label:o.title};
  const ds=this.room.doors.filter(d=>this.near(d,86)).sort((a,b)=>dist(this.s.player,a)-dist(this.s.player,b));
  if(ds[0]?.shortcut&&!this.s.shortcuts.includes(ds[0].shortcut)&&ds[0].unlockFrom===this.s.room&&(!ds[0].gate||this.s.flags[ds[0].gate]))return {kind:'unlock',item:ds[0],label:'Lever le verrou · '+ds[0].label};
  return ds.length?{kind:'door',item:ds[0],label:ds[0].label}:null;
 }
 completeObjective(fromScene=false){
  const o=this.objective;if(!o||o.room!==this.s.room||!this.near(o,95))return false;
  if(this.remainingOperations.length){this.emit('notice','Avant de continuer : '+this.remainingOperations[0].title+'.');return false;}
  if(o.flag==='plasma'&&!this.s.seal.solved){this.emit('puzzle');this.interactLatch=true;return false;}
  if(o.flag==='duel'&&this.s.duelTime<16){this.emit('notice','Le passage est encore pris dans le combat.');return false;}
  if(o.flag==='queen'&&!fromScene&&!this.s.sceneSeen.includes('queen-fall')){this.beginScene('queen-fall');return false;}
  this.s.flags[o.flag]=true;this.s.chapter++;this.s.stats.interactions++;
  if(o.flag==='gear'){this.s.inventory.medkits=this.s.difficulty==='survival'?2:3;this.s.inventory.flares=this.s.difficulty==='survival'?3:5;}
  if(o.flag==='plasma')this.s.pyramidTime=0;
  if(o.flag==='cycle'){this.s.pyramidTime=D.pyramidPeriod;this.shiftTime=1.5;this.emit('cycle','Le passage a changé. Une galerie rejoint maintenant l’entrée.');}
  if(o.flag==='alliance'){this.placeAlly();this.s.player.stamina=100;}
  if(o.flag==='bomb')this.s.bombRemaining=180;
  if(o.flag==='escaped'){this.s.bombRemaining=null;this.flash=.9;this.beginScene('collapse');}
  if(o.flag==='queen'){this.scar=null;this.flash=1;}
  if(o.flag==='judgment'){this.s.completed=true;this.emit('complete',o.after);}
  this.syncEnemies();this.hold=0;this.interactLatch=true;this.emit('chapter',o.after,{speaker:o.speaker,line:o.line,number:o.number});this.saveCheckpoint();return true;
 }
 turnRing(i){if(!Number.isInteger(i)||i<0||i>2||this.objective?.flag!=='plasma'||!this.near(this.objective,95))return false;this.s.seal.rings[i]=(this.s.seal.rings[i]+1)%4;return true;}
 unlockSeal(){if(this.objective?.flag!=='plasma'||!this.near(this.objective,95))return false;this.s.seal.solved=this.s.seal.rings.every((v,i)=>v===[2,1,3][i]);return this.s.seal.solved;}
 collect(c){if(!this.room.collectibles.includes(c)||this.s.logs.includes(c.id)||!this.near(c,86))return false;this.s.logs.push(c.id);this.s.stats.interactions++;if(c.reward==='medkit')this.s.inventory.medkits++;this.emit('log',c.text,{title:c.title});this.saveCheckpoint();return true;}
 move(actor,dx,dy,dt,speed=180){
  const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}
  if(this.isSide)dy=0;
  const steps=Math.max(1,Math.ceil(speed*dt/8)),mx=dx*speed*dt/steps,my=dy*speed*dt/steps;
  for(let i=0;i<steps;i++){if(!blocked(this.collisionRoom,actor.x+mx,actor.y))actor.x+=mx;if(!blocked(this.collisionRoom,actor.x,actor.y+my))actor.y+=my;}
  if(this.isSide)actor.y=144;if(Math.abs(dx)>.05)actor.face=dx>0?1:-1;
 }
 walk(actor,target,rt,dt,speed){
  rt.navAge-=dt;
  if(rt.navAge<=0||!rt.nav?.length){rt.nav=path(this.collisionRoom,actor,target,this.isSide);rt.navAge=.7;}
  while(rt.nav.length&&dist(actor,rt.nav[0])<14)rt.nav.shift();
  const p=rt.nav[0]||target;let dx=p.x-actor.x,dy=this.isSide?0:p.y-actor.y;const l=Math.hypot(dx,dy);
  if(l>3)this.move(actor,dx/l,dy/l,dt,Math.min(speed,l/Math.max(dt,.001)));
 }
 damage(amount,source=null){if(this.dead||this.invuln>0||this.s.completed)return;if(this.s.hidden&&source)return;this.hold=0;this.holdTarget=null;let factor=this.s.difficulty==='expedition'?.64:1;
  if(source&&this.guarding&&this.s.flags.alliance&&this.s.player.stamina>5&&(source.x-this.s.player.x)*this.s.player.face>=-8){factor*=.26;this.s.player.stamina=Math.max(0,this.s.player.stamina-16);this.emit('block');}
  this.s.player.hp=Math.max(0,this.s.player.hp-amount*factor);this.invuln=.8;this.flash=.25;this.emit('hurt');if(this.s.player.hp<=0)this.fail('L’expédition s’arrête ici.');
 }
 fail(text){if(this.dead)return;this.dead=true;this.s.stats.deaths++;this.emit('dead',text);}
 retry(){const n=this.s.stats.deaths,s=hydrate(this.checkpoint);s.stats.deaths=Math.max(n,s.stats.deaths);this.s=s;this.dead=false;this.runtime={};this.roomTime=0;this.invuln=1.2;this.dodgeTime=0;this.cooldown=0;this.attackTime=0;this.shiftTime=0;this.effect=[];this.holdTarget=null;this.guarding=false;this.moving=false;this.hold=0;this.interactLatch=true;this.acids=[];this.flares=[];this.shots=[];this.lastInput={};this.syncEnemies();this.placeAlly();this.restoreRoomEffects();this.footprints=[];this.emit('room',this.room.name);}
 melee(){if(this.s.hidden||this.cooldown>0||!this.s.flags.gear||this.s.player.stamina<15)return;this.s.player.stamina-=15;this.cooldown=.62;this.attackTime=.23;this.noise=2.4;this.emit('attack');
  const reach=this.s.flags.alliance?145:94,p=this.s.player;
  for(const def of D.eggs.filter(e=>e.room===this.s.room&&this.s.flags[e.after])){
   const state=this.s.eggs[def.id]||(this.s.eggs[def.id]={state:'intact',time:0}),e={x:def.x,y:this.isSide?144:def.y};
   if(!['spent','destroyed'].includes(state.state)&&Math.abs(e.x-p.x)<reach&&(this.isSide||Math.abs(e.y-p.y)<48)&&(e.x-p.x)*p.face>=-20&&this.los(p,e)){state.state='destroyed';this.effect.push({...e,kind:'hit',life:.4});this.emit('egg-destroyed');}
  }
  for(const e of this.enemies){if(e.hp<=0||Math.abs(e.x-p.x)>reach||(!this.isSide&&Math.abs(e.y-p.y)>48)||(e.x-p.x)*p.face<-20||!this.los(p,e))continue;
   const rt=this.runtime[e.id];rt.stun=e.kind==='queen'?.12:.72;this.effect.push({x:e.x,y:e.y,kind:'hit',life:.35});
   if(e.unique){this.emit('notice',e.kind==='queen'?'Les coups ne suffiront pas. Utiliser la chaîne.':'Le repousser, puis fuir.');continue;}
   e.hp=Math.max(0,e.hp-(this.s.flags.alliance?64:26));if(e.hp===0)this.kill(e);else this.move(e,p.face,0,.1,180);
  }
 }
 kill(e){this.s.stats.kills++;this.acids.push({x:e.x,y:e.y,life:7.5});this.emit('kill');}
 los(a,b){const dx=b.x-a.x,dy=b.y-a.y,n=Math.ceil(Math.hypot(dx,dy)/22);for(let i=1;i<n;i++)if(this.collisionRoom.solids.some(s=>overlaps(a.x+dx*i/n,a.y+dy*i/n,3,s)))return false;return true;}
 updateQueen(e,rt,dt){
  const p=this.s.player;rt.timer+=dt;rt.attack=Math.max(0,rt.attack-dt);
  if(rt.telegraph>0){
   if(!this.isSide){const dy=rt.chargeY-e.y;this.move(e,0,Math.sign(dy),dt,Math.min(90,Math.abs(dy)/dt));}
   rt.telegraph-=dt;if(rt.telegraph<=0){rt.charge=1.25;rt.chargeY=e.y;this.emit('roar');}return;
  }
  if(rt.charge>0){this.move(e,rt.chargeFace,0,dt,490);if(Math.abs(p.x-e.x)<100&&(this.isSide||Math.abs(p.y-rt.chargeY)<51))this.damage(32,e);
   rt.charge-=dt;if(rt.charge<=0){this.s.queenAttacks++;rt.timer=0;rt.nav=[];}return;}
  if(rt.timer>3.3){rt.telegraph=1.1;rt.chargeY=p.y;rt.chargeFace=p.x>e.x?1:-1;this.emit('warning','La Reine prépare une charge.');return;}
  if(Math.abs(e.x-p.x)>330)this.walk(e,{x:clamp(p.x+(e.x>p.x?210:-210),100,this.room.width-100),y:p.y},rt,dt,105);
  else if(!this.isSide)this.move(e,0,Math.sign(p.y-e.y),dt,Math.min(32,Math.abs(p.y-e.y)/dt));
 }
 tick(dt,input={}){
  if(this.dead||this.s.completed)return;dt=clamp(finite(dt),0,.05);if(this.s.scene){this.tickScene(dt);return;}if(this.shiftTime>0){this.shiftTime=Math.max(0,this.shiftTime-dt);return;}dt=clamp(finite(dt),0,.05);if(dt<=0)return;
  const s=this.s,p=s.player;
  if(input.lamp&&!this.lastInput.lamp&&!s.hidden&&s.flags.gear){s.lamp=!s.lamp;this.emit('notice',s.lamp?'Lampe allumée.':'Lampe éteinte.');}
  if(s.hidden)input={...input,dx:0,dy:0,run:false,attack:false,flare:false,dodge:false,guard:false};
  this.roomTime+=dt;if(s.room==='duel'&&!s.flags.duel)s.duelTime=Math.min(16,s.duelTime+dt);s.worldTime+=dt;const oldPhase=this.phase;
  if(s.flags.plasma&&!s.flags.escaped)s.pyramidTime+=dt;
  if(oldPhase!==this.phase)this.emit('cycle','La pierre change de place.');
  if(s.bombRemaining!==null){s.bombRemaining-=dt;if(s.bombRemaining<=0){this.fail('Le tunnel disparaît dans la détonation.');return;}}
  this.invuln=Math.max(0,this.invuln-dt);this.cooldown=Math.max(0,this.cooldown-dt);this.attackTime=Math.max(0,this.attackTime-dt);this.flash=Math.max(0,this.flash-dt);this.noise=Math.max(0,this.noise-dt);
  this.guarding=!!input.guard&&!input.run;this.crouching=!!input.crouch;
  const edge=k=>!!input[k]&&!this.lastInput[k];
  if(edge('order'))this.toggleAlly();
  if(edge('attack'))this.melee();
  if(edge('heal')&&s.inventory.medkits>0&&p.hp<100){s.inventory.medkits--;p.hp=Math.min(100,p.hp+48);this.emit('heal','Une trousse utilisée.');}
  if(edge('flare')&&s.inventory.flares>0)this.throwFlare();
  if(edge('dodge')&&p.stamina>27&&this.dodgeTime<=0){p.stamina-=27;this.dodgeTime=.26;this.invuln=Math.max(this.invuln,.32);this.dashX=input.dx||p.face;this.dashY=this.isSide?0:(input.dy||0);this.emit('dodge');}
  let dx=finite(input.dx),dy=finite(input.dy),speed=185;
  if(this.dodgeTime>0){this.dodgeTime-=dt;dx=this.dashX;dy=this.dashY;speed=465;}
  else if(input.crouch)speed=94;else if(input.run&&p.stamina>1){speed=265;p.stamina=Math.max(0,p.stamina-dt*15);this.noise=.45;}else if(this.guarding)speed=87;
  if(!input.run&&!this.guarding&&this.dodgeTime<=0)p.stamina=Math.min(100,p.stamina+dt*24);
  const before=p.x;this.move(p,dx,dy,dt,speed);this.moving=Math.abs(p.x-before)>0.3||Math.abs(dy)>.1;s.stats.steps+=Math.abs(p.x-before);
  if(!input.interact){this.hold=0;this.holdTarget=null;this.interactLatch=false;}
  if(input.interact&&!this.interactLatch){const near=this.nearest();if(near){
   if(near.kind==='objective'||near.kind==='operation'||near.kind==='field'||near.kind==='unlock'){if(this.holdTarget!==near.item.id){this.hold=0;this.holdTarget=near.item.id;}this.hold+=dt;if(this.hold>=(near.item.hold||.65)){if(near.kind==='field')this.doField(near.item);else if(near.kind==='unlock')this.unlockDoor(near.item);else if(near.kind==='operation')this.doOperation(near.item);else this.completeObjective();this.interactLatch=true;}}
   else {this.interactLatch=true;if(near.kind==='exit-hide')this.leaveHide();else if(near.kind==='door')this.enter(near.item);else this.collect(near.item);}
  }else this.hold=0;}
  this.updateEggs(dt);this.syncEnemies();
  for(const e of this.enemies){if(e.hp<=0)continue;const rt=this.runtime[e.id];rt.stun=Math.max(0,rt.stun-dt);rt.attack=Math.max(0,rt.attack-dt);if(this.tickEncounterEnemy&&this.tickEncounterEnemy(e,rt,dt,input))continue;if(rt.stun>0)continue;
   if(e.kind==='queen'){this.updateQueen(e,rt,dt);continue;}
   const flare=this.flares.find(f=>f.life>0&&dist(f,e)<650);let target=flare||p;
   if(e.kind==='grid'&&s.duelTime<16){
    e.x=1100+Math.sin(s.duelTime*.85)*120;e.y=this.isSide?144:85;e.face=s.duelTime<9?-1:1;continue;
   }
   if(rt.windup>0){rt.windup-=dt;if(rt.windup<=0){
    const reach=e.kind==='facehugger'?83:91,who=rt.attackTarget||'lex',victim=this.attackBody?this.attackBody(who):(!s.hidden?p:null);
    if(victim&&Math.abs(victim.x-e.x)<reach&&(this.isSide||Math.abs(victim.y-e.y)<48)&&(victim.x-e.x)*e.face>=-12&&this.los(e,victim)){if(this.strikeVictim)this.strikeVictim(who,e.kind==='facehugger'?19:23,e);else this.damage(e.kind==='facehugger'?19:23,e);}
    rt.attack=e.kind==='facehugger'?1.35:1.15;this.effect.push({x:e.x,y:e.y,kind:'claw',life:.28});
   }continue;}
   const victim=this.chooseVictim?this.chooseVictim(e,rt,flare):(!s.hidden?{id:'lex',body:p}:null);
   let sense=this.perceive(e,rt,dt,input,flare);
   if(victim&&victim.id!=='lex'&&!flare){rt.mode='pursue';rt.lastSeen={x:victim.body.x,y:victim.body.y};rt.memory=4;rt.navAge=0;sense={active:true,target:rt.lastSeen};}
   if(sense.active){
    const destination=sense.target;
    if(dist(e,destination)>25)this.walk(e,destination,rt,dt,e.kind==='facehugger'?165:128);
   }else this.walk(e,{x:rt.home+Math.sin(s.worldTime*.2)*70,y:this.isSide?144:e.y},rt,dt,30);
   const body=victim?.body;
   if(body&&Math.abs(e.x-body.x)<(e.kind==='facehugger'?97:94)&&(this.isSide||Math.abs(e.y-body.y)<48)&&rt.attack<=0&&!flare&&this.los(e,body)){rt.windup=e.kind==='facehugger'?.5:.62;rt.attackTarget=victim.id;e.face=body.x>e.x?1:-1;this.emit('enemy-windup');}
  }
  if(this.updateCompanions)this.updateCompanions(dt);else if(this.scar){const a=this.scar;
   s.ally.energy=Math.min(100,s.ally.energy+dt*9);this.allyCooldown-=dt;
   const visible=this.enemies.find(e=>e.hp>0&&!e.unique&&Math.abs(e.x-a.x)<570&&(this.visualRay?this.visualRay(a,e):this.los(a,e)));
   if(s.ally.order==='follow'&&!s.hidden){
    const ty=visible&&Math.abs(visible.x-p.x)<550?visible.y:clamp(p.y+25,60,225);
    this.walk(a,{x:clamp(p.x-p.face*85,80,this.room.width-80),y:this.isSide?144:ty},a,dt,235);
   }
   const target=this.enemies.find(e=>e.hp>0&&!e.unique&&Math.abs(e.x-a.x)<570&&(this.isSide||Math.abs(e.y-a.y)<42)&&(this.visualRay?this.visualRay(a,e):this.los(a,e)));
   if(target&&this.allyCooldown<=0&&s.ally.energy>=26){a.face=target.x>a.x?1:-1;
    this.shots.push({x:a.x,y:this.isSide?144:a.y,dx:a.face,life:1.1});s.ally.energy-=26;this.allyCooldown=2.3;this.emit('plasma');}
  }
  // Swept projectile steps: depth is captured at launch, not copied from a later target position.
  for(const shot of this.shots){shot.life-=dt;const n=Math.ceil(780*dt/10);
   for(let k=0;k<n&&shot.life>0;k++){
    shot.x+=780*dt*shot.dx/n;
    if(this.collisionRoom.solids.some(b=>overlaps(shot.x,shot.y,5,b))){shot.life=0;break;}
    for(const e of this.enemies){if(e.hp>0&&!e.unique&&Math.abs(e.x-shot.x)<26&&(this.isSide||Math.abs(e.y-shot.y)<38)&&shot.life>0){e.hp=Math.max(0,e.hp-78);shot.life=0;this.effect.push({x:e.x,y:e.y,kind:'plasma',life:.35});if(e.hp===0)this.kill(e);}}
   }
  }
  this.shots=this.shots.filter(e=>e.life>0);
  for(const a of this.acids){a.life-=dt;if(a.life>0&&Math.abs(p.x-a.x)<35&&(this.isSide||Math.abs(p.y-a.y)<32))this.damage(8);}
  this.acids=this.acids.filter(a=>a.life>0);for(const f of this.flares)f.life-=dt;this.flares=this.flares.filter(f=>f.life>0);
  for(const fx of this.effect)fx.life-=dt;this.effect=this.effect.filter(f=>f.life>0);
  if(this.moving&&!s.hidden&&['snow','dock','ice'].includes(this.room.biome)){this.footStep=(this.footStep||0)+dt;if(this.footStep>.18){this.footStep=0;this.footprints.push({x:p.x,y:p.y,face:p.face,room:s.room,t:s.worldTime});if(this.footprints.length>160)this.footprints.shift();}}
  this.lastInput={...input};
 }
 unlockedCodex(){return D.codex.filter(c=>c.unlockRoom?this.s.visited.includes(c.unlockRoom):this.s.flags[c.unlockFlag]);}
 routeTo(target){
  const queue=[[this.s.room]],seen=new Set([this.s.room]);while(queue.length){const p=queue.shift(),last=p[p.length-1];if(last===target)return p;
   for(const d of ROOMS.get(last).doors){if(seen.has(d.to)||this.gate(d))continue;seen.add(d.to);queue.push([...p,d.to]);}}
  return [];
 }
}
G.AVP_CORE={Game,fresh,hydrate,blocked,safePoint,path,dist,copy,ROOMS,clamp};
})(globalThis);

