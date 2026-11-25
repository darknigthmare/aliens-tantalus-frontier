
/* v0.9 · Two-body ground evacuation, conservative swept collision and ownership.
 * A staging marker is not healing, invulnerability, teleportation or a new ending.
 * Simulation-only: no DOM, external I/O or new enemies. */
(function(G){'use strict';
const D=G.AVP_DATA,C=G.AVP_CORE,P=C.Game.prototype,R=D.evacuationRules;
const ids=new Set(D.companions.map(d=>d.id)), spots=new Map(D.evacuationSpots.map(s=>[s.id,s]));
const finite=(v,f=0)=>Number.isFinite(v)?v:f;
const fresh=()=>({haul:null,deliveries:[],journal:[],stats:{pickups:0,drops:0,interruptions:0,exhaustions:0,crossings:0,distance:0}});
function ensure(g){g.s.evacuation||=fresh();g.s.schema = 10;return g.s.evacuation;}
// Continuous segment/AABB intersection; even a one-unit divider blocks the link.
function clearSegment(room,a,b,pad=0){
 for(const box of room.solids){let lo=0,hi=1;
  for(const [axis,size] of [['x','w'],['y','h']]){const delta=b[axis]-a[axis],min=box[axis]-pad,max=box[axis]+box[size]+pad;
   if(Math.abs(delta)<1e-10){if(a[axis]<=min||a[axis]>=max){lo=2;break;}}
   else{let x=(min-a[axis])/delta,y=(max-a[axis])/delta;if(x>y)[x,y]=[y,x];lo=Math.max(lo,x);hi=Math.min(hi,y);}
  }
  if(lo<=hi&&hi>=0&&lo<=1)return false;
 }return true;
}
function pairClear(room,p,a){return !C.blocked(room,p.x,p.y,15)&&!C.blocked(room,a.x,a.y,15)&&clearSegment(room,p,a,5);}
function hydrate(s,raw){
 s.evacuation=fresh();s.schema = 10;
 if(raw.schema<9||!raw.evacuation||typeof raw.evacuation!=='object')return s;
 const r=raw.evacuation;
 for(const k of Object.keys(s.evacuation.stats))s.evacuation.stats[k]=C.clamp(finite(r.stats?.[k]),0,1e8);
 const records=Array.isArray(r.deliveries)?r.deliveries:[];
 const seen=new Set();for(const v of records.slice(-120)){
  const z=spots.get(v?.spot),key=v?.id+':'+v?.spot;if(!z||!ids.has(v?.id)||seen.has(key)||!s.visited.includes(z.room))continue;
  seen.add(key);s.evacuation.deliveries.push({id:v.id,spot:z.id,at:C.clamp(finite(v.at),0,s.worldTime)});
 }
 const codes=new Set(['picked','dropped','hurt','exhausted','crossed','delivered']);
 s.evacuation.journal=(Array.isArray(r.journal)?r.journal:[]).slice(-32).filter(v=>v&&codes.has(v.code)&&ids.has(v.id)&&C.ROOMS.has(v.room)&&!C.ROOMS.get(v.room).sceneOnly).map(v=>({code:v.code,id:v.id,room:v.room,at:C.clamp(finite(v.at),0,s.worldTime)}));
 const h=r.haul,a=s.party?.[h?.id],rule=ids.has(h?.id),v=s.rescue?.vitals?.[h?.id];
 if(rule&&a&&v?.hp===0&&a.room===s.room&&h.room===s.room&&!s.traversal&&!s.partyTraversals?.[h.id]&&!s.hidden&&!s.scene&&!s.completed&&s.player.stamina>0){
  const len=C.dist(s.player,a),room=C.ROOMS.get(s.room);
  // Do not silently relocate either actor to repair an impossible attachment.
  if(len>=R.minSeparation-1&&len<=R.pickupRadius+1&&pairClear(room,s.player,a))s.evacuation.haul={id:h.id,room:s.room,began:C.clamp(finite(h.began,s.worldTime),0,s.worldTime)};
 }
 return s;
}
G.AVP_EVACUATION={ensure,hydrate,fresh,clearSegment,pairClear};
const place=P.placeAlly;P.placeAlly=function(){place.call(this);ensure(this);};
P.evacuationLog=function(code,id){const e=ensure(this);e.journal.push({code,id,room:this.s.room,at:this.s.worldTime});e.journal=e.journal.slice(-32);};
P.evacuationSpots=function(){return D.evacuationSpots.filter(s=>s.room===this.s.room&&this.s.flags[s.after]);};
P.nearestEvacuee=function(){
 if(this.dead||this.s.completed||this.s.scene||this.s.hidden||this.s.traversal||ensure(this).haul)return null;
 return this.companionActors().filter(a=>this.companionDown(a.id)&&!this.s.partyTraversals?.[a.id]&&C.dist(a,this.s.player)<=R.pickupRadius&&(this.isSide||Math.abs(a.y-this.s.player.y)<46)&&pairClear(this.collisionRoom,this.s.player,a)).sort((a,b)=>C.dist(a,this.s.player)-C.dist(b,this.s.player))[0]||null;
};
P.pickupEvacuee=function(id){
 const a=this.nearestEvacuee();if(!a||a.id!==id||C.dist(a,this.s.player)<R.minSeparation||this.s.player.stamina<R.minStamina||this.dodgeTime>0)return false;
 const e=ensure(this);this.cancelAid(false);this.cancelConversation(false);this._studyTarget=null;this._studyHold=0;this.hold=0;this.holdTarget=null;this.dodgeTime=0;this.attackTime=0;
 e.haul={id,room:this.s.room,began:this.s.worldTime};e.stats.pickups++;this._haulLatch=true;this._haulHold=null;
 this.evacuationLog('picked',id);this.emit('notice','Traction engagée. Marcher, puis I pour déposer. Les deux mains sont occupées.');this.emit('save');return true;
};
P.dropEvacuee=function(reason='dropped'){
 const e=ensure(this),h=e.haul;this._haulHold=null;if(!h)return false;
 e.haul=null;e.stats.drops++;if(reason==='hurt')e.stats.interruptions++;if(reason==='exhausted')e.stats.exhaustions++;
 this.evacuationLog(reason,h.id);const a=this.companionBody(h.id),spot=a&&this.evacuationSpots().find(s=>C.dist(a,{x:s.x,y:this.isSide?144:s.y})<88);
 if(spot&&!e.deliveries.some(v=>v.id===h.id&&v.spot===spot.id)){
  e.deliveries.push({id:h.id,spot:spot.id,at:this.s.worldTime});this.evacuationLog('delivered',h.id);
  this.emit('notice','Point de regroupement atteint. Vérifier la menace avant de relever le blessé.');
 }else this.emit('notice',reason==='hurt'?'Le choc vous fait lâcher prise. Le compagnon reste sur place.':reason==='exhausted'?'Les bras cèdent. Reprendre son souffle avant de saisir à nouveau.':'Compagnon déposé. I maintenu pour le relever.');
 this._haulLatch=true;this._aidLatch=true;this.emit('save');return true;
};
P.evacuationDoorReason=function(door){
 if(!door||!this.room.doors.includes(door))return 'Accès absent';
 const reason=this.gate(door);if(reason)return reason;
 const to=C.ROOMS.get(door.to);
 if(this.traversalFor(door)||to.floor!==this.room.floor)return 'Relever le compagnon avant le changement de niveau';
 if(R.excludedRooms.includes(this.s.room)||R.excludedRooms.includes(to.id)||R.excludedLinks.includes(door.id))return 'Ce passage exige un compagnon debout';
 return null;
};
P.evacuationArrival=function(door){
 const room=C.ROOMS.get(door.to),pair=room?.doors.find(d=>d.id===door.pair);if(!pair)return null;
 const collision=this.huntCollision(room.id),side=this.s.mode==='classic'||room.mode==='SIDE',x=pair.x<150?pair.x+50:pair.x>room.width-150?pair.x-50:pair.x+65,y=side?144:C.clamp(pair.y+28,65,225),p={x,y};
 // Fixed local placement only. No safePoint search across the destination room.
 if(C.blocked(collision,x,y))return null;
 const sign=pair.x>room.width-200?-1:1;
 for(const [dx,dy] of [[sign*44,0],[-sign*40,0],[0,side?0:42],[0,side?0:-42]]){
  if(Math.hypot(dx,dy)<R.minSeparation)continue;const a={x:x+dx,y:y+dy};
  if(pairClear(collision,p,a))return {p,a,face:sign};
 }return null;
};
const enter=P.enter;P.enter=function(door){
 const h=ensure(this).haul;if(!h)return enter.call(this,door);
 if(this.dead||this.s.scene||!this.near(door,86))return false;
 const reason=this.evacuationDoorReason(door),a=this.companionBody(h.id);
 if(reason){this.emit('notice',reason+' · Déposer avec I.');return false;}
 if(!a||C.dist(a,{x:door.x,y:this.isSide?144:door.y})>155){this.emit('notice','Rapprocher les deux corps du seuil.');return false;}
 const target=this.evacuationArrival(door);if(!target){this.emit('notice','Le seuil opposé ne laisse pas la place à deux corps.');return false;}
 const id=h.id,from=this.s.room;this._haulTransfer=true;let ok;
 try{ok=enter.call(this,door);}finally{this._haulTransfer=false;}
 if(!ok||from===this.s.room)return ok;
 Object.assign(this.s.player,target.p,{face:target.face});Object.assign(this.s.party[id],target.a,{room:this.s.room,face:target.face,crossWait:0,lastDoor:door.id});
 h.room=this.s.room;this.placeAlly();ensure(this).stats.crossings++;this.evacuationLog('crossed',id);this.saveCheckpoint();return true;
};
const move=P.move;P.move=function(actor,dx,dy,dt,speed=180){
 const h=ensure(this).haul;if(!h||actor!==this.s.player)return move.call(this,actor,dx,dy,dt,speed);
 const a=this.companionBody(h.id);if(!a||this.s.party[h.id]?.room!==this.s.room)return;
 if(this.isSide)dy=0;const norm=Math.max(1,Math.hypot(dx,dy));dx/=norm;dy/=norm;
 const factor=Math.min(this.surfaceAt(actor).speed,this.surfaceAt(a).speed),rate=speed*R[h.id].speed*factor;
 const distance=Math.max(0,rate*dt),n=Math.max(1,Math.ceil(distance/4)),mx=dx*distance/n,my=dy*distance/n,start={x:actor.x,y:actor.y};
 const collision=this.collisionRoom;
 for(let i=0;i<n;i++)for(const [axis,delta] of [['x',mx],['y',my]]){
  if(!delta)continue;const p={x:actor.x,y:actor.y},q={x:a.x,y:a.y};p[axis]+=delta;q[axis]+=delta;
  if(pairClear(collision,p,q)){actor[axis]+=delta;a[axis]+=delta;}
 }
 if(Math.abs(dx)>.05)actor.face=dx>0?1:-1;a.face=actor.x>=a.x?1:-1;
 Object.assign(this.s.party[h.id],{x:a.x,y:a.y,face:a.face});
 const len=C.dist(start,actor);this._haulMoved=(this._haulMoved||0)+len;ensure(this).stats.distance+=len;
 this._haulNoiseStride=(this._haulNoiseStride||0)+len;
 if(len&&this._haulNoiseStride>=32){this._haulNoiseStride%=32;const material=this.surfaceAt(a);this.emitNoise({x:a.x,y:a.y},Math.max(100,material.walkNoise*1.3),1.4,'tool');this.noise=.48;}
};
const nearest=P.nearest;P.nearest=function(){
 if(!ensure(this).haul)return nearest.call(this);
 const ds=this.room.doors.filter(d=>this.near(d,86)).sort((a,b)=>C.dist(a,this.s.player)-C.dist(b,this.s.player));
 return ds[0]?{kind:'door',item:ds[0],label:(this.evacuationDoorReason(ds[0])||'Franchir avec le blessé')+' · '+ds[0].label}:null;
};
const aid=P.nearestAid;P.nearestAid=function(){return ensure(this).haul||this._haulHold?null:aid.call(this);};
const status=P.partyStatus;P.partyStatus=function(id){return ensure(this).haul?.id===id?'Déplacé par Lex · À terre':status.call(this,id);};
const route=P.knownRoute;P.knownRoute=function(target){
 if(!ensure(this).haul)return route.call(this,target);
 const seen=new Set([this.s.room]),visited=new Set(this.s.visited),q=[[this.s.room]];
 while(q.length){const path=q.shift(),r=C.ROOMS.get(path.at(-1));if(r.id===target)return path;
  for(const d of r.doors){const next=C.ROOMS.get(d.to);
   if(seen.has(d.to)||!visited.has(d.to)||this.gate(d)||this.traversalFor(d)||r.floor!==next.floor||R.excludedRooms.includes(r.id)||R.excludedRooms.includes(d.to)||R.excludedLinks.includes(d.id))continue;
   seen.add(d.to);q.push([...path,d.to]);
  }
 }return [];
};
const mode=P.setMode;P.setMode=function(m){if(ensure(this).haul){this.emit('notice','Déposer le blessé avant de changer de présentation.');return false;}return mode.call(this,m);};
const damage=P.damage;P.damage=function(...args){const hp=this.s.player.hp,out=damage.apply(this,args);if(this.s.player.hp<hp){this._haulHold=null;this._haulLatch=true;this.dropEvacuee('hurt');}return out;};
const retry=P.retry;P.retry=function(){retry.call(this);ensure(this);this._haulHold=null;this._haulLatch=false;this._haulAidSuppress=false;};
for(const key of ['beginConversation','turnRing','turnWeight','togglePortal','useDevice','shootPiton','throwFlare','completeObjective','melee','orderCompanion','enterHide','doOperation','doField','collect','unlockDoor','beginScene']){
 const base=P[key];if(base)P[key]=function(...args){if(ensure(this).haul||this._haulHold)return false;return base.apply(this,args);};
}
const tick=P.tick;P.tick=function(dt,input={}){
 ensure(this);const before=this.s.worldTime,hp=this.s.player.hp,stamina=this.s.player.stamina;
 const intent=!!(input.haul||(input.aid&&input.run)),grab=intent&&!this._haulLatch,active=this.s.evacuation.haul;
 if(!intent&&!input.aid){this._haulLatch=false;this._haulAidSuppress=false;}
 if(this.dead||this.s.completed||this.s.scene||this.s.traversal){this._haulHold=null;return tick.call(this,dt,input);}
 // Releasing does not immediately chain into the paid or free I care action.
 if(active&&!this._haulLatch&&(intent||input.aid)){
  this.dropEvacuee();this._haulAidSuppress=true;
 }
 if(!active){
  const conflict=input.dx||input.dy||input.attack||input.dodge||input.interact||input.heal||input.flare||input.utility||input.seal||input.talk||input.order;
  if(!intent||conflict)this._haulHold=null;
  if(conflict&&intent)this._haulLatch=true;
  if(grab&&!conflict){
   const a=this.nearestEvacuee();
   if(!a||C.dist(a,this.s.player)<R.minSeparation||this.s.player.stamina<R.minStamina||this.dodgeTime>0){
    this._haulHold=null;this._haulLatch=true;
    this.emit('notice',this.s.player.stamina<R.minStamina?'Reprendre son souffle avant de saisir le blessé.':a&&C.dist(a,this.s.player)<R.minSeparation?'Faire un pas de côté pour saisir le blessé.':'Rejoindre un compagnon à terre, avec un accès dégagé.');
   }else if(!this._haulHold){this.cancelAid(false);this.cancelConversation(false);this._studyTarget=null;this._studyHold=0;this._haulHold={id:a.id,progress:0};}
  }
 }
 const hauling=this.s.evacuation.haul,hold=this._haulHold;
 const locked=!!(hauling||hold||intent);
 const value=locked?{...input,dx:hauling?(input.dx||0):0,dy:hauling?(input.dy||0):0,aid:false,run:false,crouch:false,guard:false,attack:false,dodge:false,heal:false,flare:false,interact:!!(hauling&&input.interact),utility:false,seal:false,talk:false,order:false,listen:false}:this._haulAidSuppress?{...input,aid:false}:input;
 this._haulMoved=0;tick.call(this,dt,value);this.s.schema = 10;const elapsed=this.s.worldTime-before;
 if(elapsed<=0)return;
 if(hauling){
  const moving=this._haulMoved>1e-6;
  this.s.player.stamina=C.clamp(stamina+elapsed*(moving?-R[hauling.id].drain:R.rest),0,100);
  if(this.s.evacuation.haul&&this.s.player.stamina<=0)this.dropEvacuee('exhausted');
  if(this.s.evacuation.haul&&(this.s.rescue.vitals[hauling.id]?.hp!==0||this.s.party[hauling.id]?.room!==this.s.room))this.dropEvacuee();
 }
 if(hold&&this._haulHold===hold){
  const a=this.nearestEvacuee();if(this.dead||this.s.player.hp<hp||!a||a.id!==hold.id){this._haulHold=null;this._haulLatch=true;return;}
  hold.progress+=elapsed;if(hold.progress+1e-7>=R.pickupTime)this.pickupEvacuee(hold.id);
 }
};
})(globalThis);

