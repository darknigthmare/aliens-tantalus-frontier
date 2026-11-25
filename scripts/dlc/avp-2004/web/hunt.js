
/* AVP v0.4: paired doors, bounded cross-room pursuit and near-threshold listening.
 * Existing enemies move between rooms. No replacement spawns, global player radar,
 * remote combat or simulation while paused. All durable data lives in the carnet.
 */
(function (G) {
'use strict';
const D=G.AVP_DATA,C=G.AVP_CORE,P=C.Game.prototype,rooms=C.ROOMS;
const portals=new Map(D.portals.map(p=>[p.id,p]));
const byDoor=new Map(D.portals.flatMap(p=>p.doors.map(d=>[d,p])));
const routes=new Map(D.huntRoutes.map(r=>[r.door,r]));
const defs=new Map(D.enemies.map(e=>[e.id,e]));
const clamp=C.clamp,dist=C.dist,copy=C.copy;
const finite=(x,f=0)=>Number.isFinite(x)?x:f;
const overlaps=(p,b,r=15)=>p.x+r>b.x&&p.x-r<b.x+b.w&&p.y+r>b.y&&p.y-r<b.y+b.h;
const side=(g,r)=>g.s.mode==='classic'||r.mode==='SIDE';
const actualDoor=id=>{for(const r of D.rooms){const d=r.doors.find(d=>d.id===id);if(d)return d;}return null;};
const journalText={
 'trail':'Elle a suivi notre passage. Changer de salle ne suffit plus.',
 'arrival':'Des griffes franchissent le seuil derrière nous.',
 'break':'Le vantail a cédé. Il ne nous protégera plus.',
 'lost':'La piste se termine au dernier passage aperçu.',
 'closed':'Le vantail est fermé. Cela peut nous donner quelques secondes.'
};
function validLocation(def,location){
 if(location===def.room)return true;
 if(def.unique||!rooms.has(location)||rooms.get(location).sceneOnly)return false;
 const q=[def.room],seen=new Set(q);
 while(q.length){const from=q.shift();for(const r of D.huntRoutes){if(r.from!==from||(r.kind==='vent'&&def.kind!=='facehugger')||seen.has(r.to))continue;if(r.to===location)return true;seen.add(r.to);q.push(r.to);}}
 return false;
}
function hydrate(s,raw){
 for(const p of D.portals){const v=raw.schema>=4?raw.portals?.[p.id]:null;
  const status=v&&['open','closing','closed','broken'].includes(v.status)?v.status:'open';
  const hp=status==='broken'?0:clamp(Math.floor(finite(v?.hp,p.hp)),1,p.hp);
  s.portals[p.id]={status,hp,progress:clamp(finite(v?.progress),0,.6),hitAt:clamp(finite(v?.hitAt,-100),-100,s.worldTime)};
  const m=raw.schema>=4?raw.portalMemory?.[p.id]:null;
  if(m&&['open','closing','closed','broken'].includes(m.status))s.portalMemory[p.id]={status:m.status,hp:clamp(Math.floor(finite(m.hp,p.hp)),0,p.hp),at:clamp(finite(m.at),0,s.worldTime)};
 }
 if(raw.schema>=4){
  for(const [id,v] of Object.entries(raw.huntBudget||{})){if(!defs.has(id)||!v||defs.get(id).unique)continue;s.huntBudget[id]={hops:clamp(Math.floor(finite(v.hops)),0,2),at:clamp(finite(v.at),0,s.worldTime)};}
  for(const v of (Array.isArray(raw.pursuits)?raw.pursuits:[]).slice(0,8)){
   if(!v||s.pursuits.some(p=>p.id===v.id))continue;
   const def=defs.get(v.id),route=routes.get(v.door),e=s.enemies[v.id];
   if(!def||def.unique||!route||route.from!==v.from||route.to!==v.to||!e||e.room!==v.from||e.hp<=0||!s.flags[def.after]||s.flags[def.until]||(route.kind==='vent'&&def.kind!=='facehugger'))continue;
   const until=clamp(finite(v.until),0,s.worldTime+26);if(until<=s.worldTime||s.flags.escaped)continue;
   s.pursuits.push({id:v.id,from:v.from,to:v.to,door:v.door,until,wait:clamp(finite(v.wait),0,2.15),cross:clamp(finite(v.cross),0,1.15)});
  }
  s.huntJournal=(Array.isArray(raw.huntJournal)?raw.huntJournal:[]).slice(-24).filter(v=>v&&journalText[v.code]&&rooms.has(v.room)).map(v=>({code:v.code,room:v.room,at:clamp(finite(v.at),0,s.worldTime)}));
 }
 return s;
}
G.AVP_HUNT={validLocation,hydrate,portals,byDoor,routes,journalText};
function state(g,p){return g.s.portals[p.id]||(g.s.portals[p.id]={status:'open',hp:p.hp,progress:0,hitAt:-100});}
function doorPoint(g,room,door){return C.safePoint(room,door.x,side(g,room)?144:door.y);}
function entrance(g,room,door){return C.safePoint(room,door.x<150?door.x+30:door.x>room.width-150?door.x-30:door.x+34,side(g,room)?144:clamp(door.y+20,60,230));}
P.portalFor=function(door){return byDoor.get(typeof door==='string'?door:door?.id)||null;};
P.portalState=function(door){const p=this.portalFor(door);return p?state(this,p):null;};
P.recordHunt=function(code,room=this.s.room){
 const last=this.s.huntJournal[this.s.huntJournal.length-1];
 if(last&&last.code===code&&last.room===room&&this.s.worldTime-last.at<3)return;
 this.s.huntJournal.push({code,room,at:this.s.worldTime});if(this.s.huntJournal.length>24)this.s.huntJournal.shift();
 this.emit('hunt',journalText[code]);
};
P.observePortals=function(){
 for(const d of this.room.doors){const p=this.portalFor(d);if(!p)continue;const v=state(this,p);this.s.portalMemory[p.id]={status:v.status,hp:v.hp,at:this.s.worldTime};}
};
const serialize=P.serialize;
P.serialize=function(){this.observePortals();return serialize.call(this);};
const gate=P.gate;
P.structuralGate=function(d){return gate.call(this,d);};
P.gate=function(d){const r=this.structuralGate(d);if(r)return r;const p=this.portalFor(d),s=p&&state(this,p);return s?.status==='closed'?'Vantail fermé : maintenir V pour rouvrir.':s?.status==='closing'?'Le vantail descend. V permet d’annuler.':null;};
P.nearestPortal=function(){return this.room.doors.filter(d=>this.portalFor(d)&&this.near(d,112)).sort((a,b)=>dist(a,this.s.player)-dist(b,this.s.player))[0]||null;};
P.togglePortal=function(d){
 if(!d||!this.room.doors.includes(d)||!this.portalFor(d)||!this.near(d,112)||this.s.hidden||this.s.scene||this.dead||this.s.completed)return false;
 const reason=this.structuralGate(d);if(reason){this.emit('notice',reason);return false;}
 const s=this.portalState(d);
 if(s.status==='broken'){this.emit('notice','Le mécanisme est brisé. Ce passage reste ouvert.');return false;}
 if(s.status==='open'){s.status='closing';s.progress=0;this.emit('door-move','Le vantail descend.');}
 else{s.status='open';s.progress=0;this.emit('door-move','Le passage est dégagé.');}
 this.s.stats.interactions++;this.noise=Math.max(this.noise,.6);this.observePortals();this.saveCheckpoint();return true;
};
// Route planning regards a reversible closed leaf as an action, not a dead end.
P.routeTo=function(target,knownOnly=false){
 const visited=new Set(this.s.visited),q=[[this.s.room]],seen=new Set([this.s.room]);
 while(q.length){const a=q.shift(),last=a[a.length-1];if(last===target)return a;
  for(const d of rooms.get(last).doors){if(seen.has(d.to)||(knownOnly&&!visited.has(d.to)&&d.to!==target)||this.structuralGate(d))continue;seen.add(d.to);q.push([...a,d.to]);}}
 return [];
};
P.knownRoute=function(target){return this.routeTo(target,true);};
Object.defineProperty(P,'nextWaypointDoor',{get(){const a=this.s.waypoint?this.knownRoute(this.s.waypoint):[];return a.length>1?this.room.doors.find(d=>d.to===a[1]&&!this.structuralGate(d)):null;},configurable:true});
// The same static footprint and mechanism phase apply on both sides of the threshold.
P.huntCollision=function(id){
 if(id===this.s.room)return this.collisionRoom;
 const room=rooms.get(id),bodies=D.enemies.map(e=>this.s.enemies[e.id]).filter(e=>e?.room===id&&e.hp>0);
 for(const a of Object.values(this.s.party||{}))if(a.room===id)bodies.push(a);
 if(!this.s.party&&this.s.ally.position?.room===id)bodies.push(this.s.ally.position);
 const dynamic=D.mechanisms.filter(m=>m.room===id&&this.s.flags[m.after]).filter(m=>{
  const t=(this.s.worldTime+m.offset)%m.period;return !(m.disabledBy&&this.s.operations.includes(m.disabledBy))&&t>=m.open+m.warn&&!bodies.some(p=>overlaps(p,m));
 });
 return {...room,solids:[...room.solids,...dynamic]};
};
function offlineMove(g,e,target,cache,room,dt,speed){
 cache.age=(cache.age||0)-dt;const collision=g.huntCollision(room.id),isSide=side(g,room);
 if(cache.age<=0||!cache.path?.length){cache.path=C.path(collision,e,target,isSide);cache.age=.65;}
 while(cache.path.length&&dist(e,cache.path[0])<12)cache.path.shift();
 const p=cache.path[0]||target,dx=p.x-e.x,dy=isSide?0:p.y-e.y,l=Math.hypot(dx,dy);if(l<2)return;
 const terrain=g.surfaceAt?g.surfaceAt(e,room):null,factor=terrain&&terrain.id!=='resin'?terrain.speed:1;const step=Math.min(speed*factor*dt,l),n=Math.max(1,Math.ceil(step/7)),mx=dx/l*step/n,my=dy/l*step/n;
 for(let k=0;k<n;k++){if(!C.blocked(collision,e.x+mx,e.y))e.x+=mx;if(!C.blocked(collision,e.x,e.y+my))e.y+=my;}
 if(Math.abs(dx)>2)e.face=dx>0?1:-1;if(isSide)e.y=144;
}
const enter=P.enter;
P.enter=function(d){
 if(!this.room.doors.includes(d)||this.gate(d)||!this.near(d,86)||this.s.hidden)return enter.call(this,d);
 const from=this.s.room,route=routes.get(d.id),source=this.room,departure={...this.s.player};
 const candidates=route&&!this.s.flags.escaped?this.enemies.filter(e=>{
  const rt=this.runtime[e.id],def=defs.get(e.id),budget=this.s.huntBudget[e.id];
  return e.hp>0&&!e.unique&&(route.kind!=='vent'||def.kind==='facehugger')&&(!budget||budget.hops<2)&&!this.s.pursuits.some(a=>a.id===e.id)&&rt?.mode==='pursue'&&rt.memory>0&&rt.stun<=0&&dist(e,departure)<(this.crouching?(this.s.lamp?220:165):(this.s.lamp?435:330))&&((departure.x-e.x)*e.face>-35||dist(e,departure)<95)&&(this.visualRay?this.visualRay(e,departure):this.los(e,departure))&&!this.flares.some(f=>f.life>0&&dist(e,f)<650);
 }).sort((a,b)=>dist(a,departure)-dist(b,departure)).slice(0,Math.max(0,2-this.s.pursuits.length)):[];
 if(!enter.call(this,d))return false;
 // Crossing animations are presentation only. They never consume or restore campaign flags.
 this.crossing={from,to:this.s.room,kind:d.kind,t:0,duration:.62,delta:this.room.floor-source.floor};
 for(const e of candidates){
  this.s.enemies[e.id].room=from;
  this.s.huntBudget[e.id]={hops:(this.s.huntBudget[e.id]?.hops||0)+1,at:this.s.worldTime};
  this.s.pursuits.push({id:e.id,from,to:d.to,door:d.id,until:this.s.worldTime+26,wait:0,cross:0});
  this.recordHunt('trail',from);
 }
 this.observePortals();this.saveCheckpoint();return true;
};
P.advanceHunt=function(dt){
 this._huntNav ||= {};
 for(const pursuit of [...this.s.pursuits]){
  const def=defs.get(pursuit.id),e=this.s.enemies[pursuit.id],d=actualDoor(pursuit.door);
  const remove=()=>{this.s.pursuits=this.s.pursuits.filter(p=>p!==pursuit);delete this._huntNav[pursuit.id];};
  if(!def||!e||e.hp<=0||this.s.flags[def.until]||this.s.flags.escaped){remove();continue;}
  if(e.room===this.s.room){remove();continue;} // A return brings the actor back into ordinary room AI.
  if(this.s.worldTime>=pursuit.until){
   this.s.tracking[pursuit.id]={savedAt:this.s.worldTime,mode:'search',memory:4,lastSeen:{x:e.x,y:e.y},awareness:.1};remove();continue;
  }
  if(!d||this.structuralGate(d)){pursuit.cross=0;continue;}
  const source=rooms.get(pursuit.from),target=doorPoint(this,source,d),cache=this._huntNav[pursuit.id]||(this._huntNav[pursuit.id]={});
  if(dist(e,target)>28){offlineMove(this,e,target,cache,source,dt,def.kind==='facehugger'?150:124);continue;}
  const portal=this.portalFor(d),v=portal&&state(this,portal);
  if(v&&['closing','closed'].includes(v.status)){
   pursuit.cross=0;
   if(def.kind==='facehugger')continue;
   pursuit.wait+=dt;
   if(pursuit.wait>=2.15&&v.status==='closed'){
    pursuit.wait=0;v.hp=Math.max(0,v.hp-1);v.hitAt=this.s.worldTime;
    if(pursuit.to===this.s.room){this.emit('door-hit','Un impact sur le vantail.');this.observePortals();}
    if(v.hp===0){v.status='broken';if(pursuit.to===this.s.room)this.recordHunt('break');this.saveCheckpoint();}
   }
   continue;
  }
  pursuit.wait=0;pursuit.cross+=dt;
  if(pursuit.cross<1.05)continue;
  const dest=rooms.get(pursuit.to),paired=dest.doors.find(a=>a.id===d.pair),pos=entrance(this,dest,paired);
  e.room=dest.id;Object.assign(e,pos);e.face=paired.x>dest.width/2?-1:1;
  this.s.tracking[e.id]={savedAt:this.s.worldTime,mode:'investigate',memory:5.5,awareness:.3,attack:1.3,windup:0,stun:.2,lastSeen:entrance(this,dest,paired)};
  delete this.runtime[e.id];remove();
  if(dest.id===this.s.room){this.syncEnemies();this.effect.push({x:e.x,y:e.y,kind:'arrival',life:1});if(dist(e,this.s.player)<620){this.recordHunt('arrival');this.emit('threshold-step');}}
 }
};
P.advancePortals=function(dt){
 for(const p of D.portals){const v=state(this,p);if(v.status!=='closing')continue;
  const occupied=p.doors.some(id=>{const d=actualDoor(id),r=rooms.get(p.rooms[p.doors.indexOf(id)]),y=side(this,r)?144:d.y;
   const bodies=D.enemies.map(e=>this.s.enemies[e.id]).filter(e=>e?.hp>0&&e.room===r.id);
   for(const a of Object.values(this.s.party||{}))if(a.room===r.id)bodies.push(a);
   if(r.id===this.s.room){bodies.push(this.s.player);if(this.scar)bodies.push(this.scar);}
   return bodies.some(e=>Math.abs(e.x-d.x)<32&&Math.abs(e.y-y)<29);
  });
  v.waiting=occupied;
  if(occupied){v.progress=Math.min(v.progress,.32);continue;}
  v.progress+=dt;
  if(v.progress>=.6){v.status='closed';v.progress=.6;if(p.rooms.includes(this.s.room)){this.recordHunt('closed');this.saveCheckpoint();}}
 }
};
P.listenAt=function(d){
 if(!d||!this.room.doors.includes(d)||!this.near(d,170))return null;
 if(this.structuralGate(d))return {text:'La pierre ferme ce passage.',level:0,door:d.id};
 const other=rooms.get(d.to),pair=other.doors.find(p=>p.id===d.pair),isShut=['closed','closing'].includes(this.portalState(d)?.status),range=isShut?190:520;
 const source=doorPoint(this,other,pair);
 const incoming=this.s.pursuits.find(p=>p.to===this.s.room&&p.from===other.id&&this.s.enemies[p.id]?.hp>0&&dist(this.s.enemies[p.id],source)<range);
 if(incoming){const body=this.s.enemies[incoming.id],distance=dist(body,source);return {text:distance<42?(isShut?'Des griffes contre le vantail.':'Des pas tout près du seuil.'):'Des pas dans la pièce voisine.',level:distance<80?3:2,door:d.id};}
 const near=D.enemies.some(def=>{const e=this.s.enemies[def.id];return !def.unique&&e?.room===other.id&&e.hp>0&&this.s.flags[def.after]&&!this.s.flags[def.until]&&dist(e,source)<Math.min(range,145);});
 return {text:near?'Un frottement, de l’autre côté.':'Aucun mouvement perceptible.',level:near?1:0,door:d.id};
};
Object.defineProperty(P,'listeningHint',{get(){
 if(!this.listening)return null;
 const d=this.room.doors.filter(d=>this.near(d,170)).sort((a,b)=>dist(a,this.s.player)-dist(b,this.s.player))[0];
 return d?this.listenAt(d):{text:'Approchez-vous d’un passage pour écouter.',level:0};
},configurable:true});
// A following companion yields to a closing leaf instead of idling in its sensor.
// Keep normal pathfinding and speed; a deliberate HOLD order remains the player's choice.
const walk=P.walk;
P.walk=function(actor,target,rt,dt,speed){
 if(actor===this.scar||actor.id==='sebastian'){
  for(const d of this.room.doors){const v=this.portalState(d),y=this.isSide?144:d.y;
   if(!v||!['closed','closing'].includes(v.status)||Math.abs(target.x-d.x)>95||Math.abs(target.y-y)>50)continue;
   const next=C.safePoint(this.room,d.x<150?d.x+145:d.x>this.room.width-150?d.x-145:target.x,this.isSide?144:175);
   const key=d.id+':'+next.x+':'+next.y;if(rt._yieldTarget!==key){rt.nav=[];rt.navAge=0;rt._yieldTarget=key;}target=next;break;
  }
 }
 return walk.call(this,actor,target,rt,dt,speed);
};
const tick=P.tick;
P.tick=function(dt,input={}){
 const before=this.s.worldTime,hp=this.s.player.hp;
 const value={...input};this.listening=!!value.listen&&!this.s.hidden&&!this.s.scene;
 if(this.listening){value.dx=0;value.dy=0;value.run=false;value.attack=false;value.flare=false;value.dodge=false;value.interact=false;}
 if(value.seal&&!this.s.hidden&&!this.s.scene&&!this.dead&&!this.s.completed){
  const d=this.nearestPortal();
  if(d&&!this._sealLatch){if(this._sealTarget!==d.id){this._sealHold=0;this._sealTarget=d.id;}this._sealHold=(this._sealHold||0)+clamp(finite(dt),0,.05);value.dx=0;value.dy=0;
   if(this._sealHold>=.55){this.togglePortal(d);this._sealLatch=true;this._sealHold=0;}}
 }else{this._sealHold=0;this._sealLatch=false;this._sealTarget=null;}
 tick.call(this,dt,value);
 const elapsed=this.s.worldTime-before;if(elapsed<=0)return;
 if(this.s.player.hp<hp)this._sealHold=0;
 if(this.crossing){this.crossing.t+=elapsed;if(this.crossing.t>=this.crossing.duration)this.crossing=null;}
 if(this.s.scene||this.dead||this.s.completed)return;
 this.advancePortals(elapsed);this.advanceHunt(elapsed);this.observePortals();
 for(const e of this.enemies){const b=this.s.huntBudget[e.id],rt=this.runtime[e.id];if(b&&rt?.mode==='patrol'&&!(rt.memory>0)&&this.s.worldTime-b.at>15)b.hops=0;}
};
const retry=P.retry;
P.retry=function(){retry.call(this);this._huntNav={};this.crossing=null;this.listening=false;this._sealHold=0;this._sealLatch=false;};
})(globalThis);

