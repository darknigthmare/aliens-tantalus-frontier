
/* v0.10 · Deterministic local enemy commitments.
 * No creature is spawned by a duct. Health/identity belong to s.enemies exactly once.
 * Attacks lock a target and direction; visual arcs do not jump ground obstacles.
 */
(function(G){'use strict';
const D=G.AVP_DATA,C=G.AVP_CORE,P=C.Game.prototype,R=D.encounterRules;
const defs=new Map(D.enemies.map(e=>[e.id,e])),ducts=new Map(D.enemyDucts.map(d=>[d.id,d]));
const kinds=new Set(['pounce','tail','duct']),finite=(v,f=0)=>Number.isFinite(v)?v:f;
const hidden=v=>!!v?.duct&&['travel','outlet'].includes(v.duct.phase);
function fresh(){return {actors:{},seen:[],openings:[],journal:[],stats:{pounces:0,tails:0,misses:0,hits:0,interruptions:0,ductEntries:0,ductExits:0}};}
function ensure(g){g.s.encounter||=fresh();g.s.schema=10;return g.s.encounter;}
function actorState(g,id){const s=ensure(g);return s.actors[id]||(s.actors[id]={action:null,duct:null,cooldown:1.2,ductCooldown:0});}
function rawPosition(p,room){return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=63&&p.x<=room.width-63&&p.y>=55&&p.y<=235;}
function hydrate(s,raw){
 s.encounter=fresh();s.schema=10;const out=s.encounter,src=raw.encounter;
 if(raw.schema<10||!src||typeof src!=='object')return s;
 out.seen=Array.isArray(src.seen)?[...new Set(src.seen.filter(k=>kinds.has(k)))]:[];
 out.openings=Array.isArray(src.openings)?[...new Set(src.openings.filter(id=>ducts.has(id)&&s.visited.includes(ducts.get(id).room)))]:[];
 const codes=new Set(['pounce','tail','duct-enter','duct-exit','interrupted']);
 out.journal=(Array.isArray(src.journal)?src.journal:[]).slice(-28).filter(v=>v&&codes.has(v.code)&&defs.has(v.id)&&C.ROOMS.has(v.room)&&s.visited.includes(v.room)).map(v=>({code:v.code,id:v.id,room:v.room,at:C.clamp(finite(v.at),0,s.worldTime)}));
 for(const k of Object.keys(out.stats))out.stats[k]=C.clamp(Math.floor(finite(src.stats?.[k])),0,1e8);
 for(const [id,v] of Object.entries(src.actors||{})){
  const def=defs.get(id),enemy=s.enemies[id];if(!def||def.unique||!v||typeof v!=='object'||!enemy||enemy.hp<=0)continue;
  const room=C.ROOMS.get(enemy.room||def.room),o={action:null,duct:null,cooldown:C.clamp(finite(v.cooldown),0,8),ductCooldown:C.clamp(finite(v.ductCooldown),0,20)};out.actors[id]=o;
  const a=v.action;
  if(a&&['pounce','tail'].includes(a.kind)&&a.kind===(def.kind==='facehugger'?'pounce':'tail')&&a.room===room.id&&['lex','scar','sebastian'].includes(a.target)&&['windup','flight','recover'].includes(a.phase)&&!(a.kind==='tail'&&a.phase==='flight')&&rawPosition(a.origin,room)&&rawPosition(a.aim,room)&&C.dist(a.origin,a.aim)<=R[a.kind].max+2){
   o.action={kind:a.kind,room:room.id,target:a.target,phase:a.phase,t:C.clamp(finite(a.t),0,2),origin:{...a.origin},aim:{...a.aim},face:a.face===-1?-1:1,hit:a.hit===true,hitChecked:a.hitChecked===true,hpAtStart:enemy.hp};
   if(s.mode==='classic'||room.mode==='SIDE'){o.action.origin.y=144;o.action.aim.y=144;}
  }
  const vnt=v.duct,d=ducts.get(vnt?.id);
  if(def.kind==='xeno'&&d&&d.room===room.id&&s.flags[d.after]&&['a','b'].includes(vnt.from)&&['approach','inlet','travel','outlet','recover'].includes(vnt.phase)){
   const entry=d[vnt.from],exit=d[vnt.from==='a'?'b':'a'];
   // A saved hidden actor stays at the actual mouth, never snaps back across a room.
   if(!['travel','outlet'].includes(vnt.phase)||C.dist(enemy,entry)<30){
    o.action=null;o.duct={id:d.id,from:vnt.from,phase:vnt.phase,t:C.clamp(finite(vnt.t),0,8),hpAtStart:enemy.hp};
   }
  }
 }
 return s;
}
// Tail uses reach rather than max; keep validation symmetric with its start rule.
G.AVP_ENCOUNTERS={fresh,ensure,hydrate,actorState,hidden,ducts,rules:R};
const place=P.placeAlly;P.placeAlly=function(){place.call(this);ensure(this);};
const active=P.activeEnemy;P.activeEnemy=function(def){return active.call(this,def)&&!hidden(this.s.encounter?.actors?.[def.id]);};
P.encounterVisible=function(p){return !this.s.traversal&&!this.s.scene&&C.dist(this.s.player,p)<670&&this.visualRay(this.s.player,p);};
P.observeEncounter=function(kind,e,code=kind){
 const s=ensure(this);if(!this.encounterVisible(e))return;
 if(!s.seen.includes(kind)){s.seen.push(kind);this.emit('notice','Nouveau comportement observé · Carnet / Comportements.');}
 s.journal.push({code,id:e.id,room:this.s.room,at:this.s.worldTime});s.journal=s.journal.slice(-28);
};
P.encounterCanSee=function(e,target){
 if(!target||!this.attackBody(target.id)||!this.visualRay(e,target.body)||!G.AVP_EVACUATION.clearSegment(this.collisionRoom,e,target.body,2))return false;
 const b=target.body,lit=this.s.lamp||this.illuminationAt(b)>.14,range=target.id==='lex'?(this.crouching?(lit?220:165):(lit?435:330)):325;
 return C.dist(e,b)<range&&((b.x-e.x)*e.face>-35||C.dist(e,b)<95);
};
P.beginEnemyCommitment=function(e,target){
 if(!e||e.hp<=0||e.unique||!target||!this.attackBody(target.id)||!['xeno','facehugger'].includes(e.kind))return false;
 const st=actorState(this,e.id),rt=this.runtime[e.id],kind=e.kind==='facehugger'?'pounce':'tail',r=R[kind];
 if(st.action||st.duct||st.cooldown>0||rt?.stun>0||rt?.windup>0||rt?.attack>0||!this.encounterCanSee(e,target))return false;
 const length=C.dist(e,target.body),dx=Math.abs(e.x-target.body.x),dy=Math.abs(e.y-target.body.y);
 if(length<r.min||length>r.max||dx<r.min*.85||(!this.isSide&&dy>(kind==='tail'?r.depth:75)))return false;
 st.action={kind,room:this.s.room,target:target.id,phase:'windup',t:0,origin:{x:e.x,y:e.y},aim:{x:target.body.x,y:this.isSide?144:target.body.y},face:target.body.x>=e.x?1:-1,hit:false,hitChecked:false,hpAtStart:e.hp};
 e.face=st.action.face;rt.nav=[];rt.navAge=0;rt.attackTarget=target.id;st.cooldown=r.cooldown;
 ensure(this).stats[kind==='pounce'?'pounces':'tails']++;this.observeEncounter(kind,e);this.emit('enemy-windup');return true;
};
P.cancelEnemyCommitment=function(e,reason='interrupted'){
 const st=actorState(this,e.id);if(!st.action&&!st.duct)return false;
 const kind=st.action?.kind||'duct';st.action=null;st.duct=null;st.cooldown=Math.max(1.1,st.cooldown);st.ductCooldown=Math.max(st.ductCooldown,4);
 const rt=this.runtime[e.id];if(rt){rt.windup=0;rt.attack=Math.max(rt.attack,1);rt.nav=[];rt.navAge=0;}
 ensure(this).stats.interruptions++;this.observeEncounter(kind,e,reason);return true;
};
P.hitCommittedTarget=function(e,a,radius,depth,reach=radius){
 const b=this.attackBody(a.target);if(!b||a.hitChecked||Math.abs(b.x-e.x)>reach||(!this.isSide&&Math.abs(b.y-e.y)>depth)||(b.x-e.x)*a.face<-radius||!G.AVP_EVACUATION.clearSegment(this.collisionRoom,e,b,2))return false;
 a.hitChecked=true;const before=a.target==='lex'?b.hp:this.companionVital(a.target)?.hp;
 if(a.target==='lex')this.damage(R[a.kind].damage,e);else this.damageCompanion(a.target,R[a.kind].damage);
 const after=a.target==='lex'?b.hp:this.companionVital(a.target)?.hp;a.hit=after<before;
 if(a.hit)ensure(this).stats.hits++;return a.hit;
};
P.advanceEnemyCommitment=function(e,st,dt){
 const a=st.action,rt=this.runtime[e.id],r=R[a.kind];
 if(e.hp<=0||rt.stun>0||e.hp<a.hpAtStart||a.room!==this.s.room){this.cancelEnemyCommitment(e);return;}
 a.t+=dt;e.face=a.face;
 if(a.phase==='windup'){
  if(a.t+1e-7<r.windup)return;
  a.t=0;
  if(a.kind==='tail'){
   // Original direction and original depth: no homing correction at impact.
   const b=this.attackBody(a.target);
   if(b&&(b.x-e.x)*a.face>=0&&(this.isSide||Math.abs(b.y-a.origin.y)<=r.depth))this.hitCommittedTarget(e,a,8,r.depth,r.reach);
   a.phase='recover';this.effect.push({x:e.x+a.face*85,y:a.origin.y,kind:'claw',life:.3});
   if(!a.hit)ensure(this).stats.misses++;
  }else{a.phase='flight';a.hpAtStart=e.hp;}
  return;
 }
 if(a.phase==='flight'){
  const duration=r.flight,t=C.clamp(a.t/duration,0,1),goal={x:a.origin.x+(a.aim.x-a.origin.x)*t,y:this.isSide?144:a.origin.y+(a.aim.y-a.origin.y)*t};
  const l=C.dist(e,goal),n=Math.max(1,Math.ceil(l/5)),mx=(goal.x-e.x)/n,my=(goal.y-e.y)/n;let collision=false;
  for(let i=0;i<n;i++){
   const next={x:e.x+mx,y:e.y+my};
   if(C.blocked(this.collisionRoom,next.x,next.y,12)||!G.AVP_EVACUATION.clearSegment(this.collisionRoom,e,next,10)){collision=true;break;}
   e.x=next.x;e.y=next.y;this.hitCommittedTarget(e,a,r.radius,32);
  }
  if(collision||a.t+1e-7>=duration||a.hitChecked){a.phase='recover';a.t=0;if(!a.hit)ensure(this).stats.misses++;}
  return;
 }
 if(a.t+1e-7>=r.recovery){st.action=null;rt.attack=Math.max(rt.attack,.2);rt.nav=[];rt.navAge=0;}
};
P.enemyDuctStatus=function(id){return ensure(this).actors[id]?.duct||null;};
P.beginEnemyDuct=function(e,d,from){
 const st=actorState(this,e.id),rt=this.runtime[e.id];
 if(!d||!ducts.has(d.id)||d.room!==this.s.room||!this.s.flags[d.after]||e.kind!=='xeno'||e.unique||e.hp<=0||!['a','b'].includes(from)||st.action||st.duct||st.ductCooldown>0||rt?.stun>0||rt?.windup>0)return false;
 if(Object.entries(ensure(this).actors).some(([id,v])=>id!==e.id&&v.duct&&ducts.get(v.duct.id)?.room===d.room))return false;
 const mouth=d[from];if(C.blocked(this.collisionRoom,mouth.x,this.isSide?144:mouth.y,15))return false;
 st.duct={id:d.id,from,phase:'approach',t:0,hpAtStart:e.hp};rt.nav=[];rt.navAge=0;return true;
};
P.ductExitFree=function(e,pos){
 if(C.blocked(this.collisionRoom,pos.x,pos.y,16))return false;
 const bodies=[this.s.player,...this.companionActors(),...this.enemies.filter(v=>v.id!==e.id&&v.hp>0)];
 return !bodies.some(a=>C.dist(a,pos)<R.duct.clearance);
};
P.advanceEnemyDuct=function(e,st,dt){
 const v=st.duct,d=ducts.get(v.id),rt=this.runtime[e.id]||{nav:[],navAge:0},start=d[v.from],end=d[v.from==='a'?'b':'a'],side=this.isSide;
 if(!d||d.room!==this.s.room||e.hp<=0){st.duct=null;return;}
 const inlet={x:start.x,y:side?144:start.y},outlet={x:end.x,y:side?144:end.y};
 if(['approach','inlet'].includes(v.phase)&&(rt.stun>0||e.hp<v.hpAtStart)){this.cancelEnemyCommitment(e);return;}
 v.t+=dt;
 if(v.phase==='approach'){
  this.walk(e,inlet,rt,dt,130);
  if(C.dist(e,inlet)<18){e.x=inlet.x;e.y=inlet.y;v.phase='inlet';v.t=0;this.observeEncounter('duct',e,'duct-enter');}
  else if(v.t>10){st.duct=null;st.ductCooldown=4;}
  return;
 }
 if(v.phase==='inlet'){
  if(v.t+1e-7<R.duct.inlet)return;
  v.phase='travel';v.t=0;ensure(this).stats.ductEntries++;
  this.s.pursuits=this.s.pursuits.filter(p=>p.id!==e.id);rt.windup=0;rt.attack=0;return;
 }
 if(v.phase==='travel'){
  if(v.t+1e-7<R.duct.travel)return;
  v.phase='outlet';v.t=0;
  if(C.dist(this.s.player,outlet)<650){this.emit('warning','Des griffes raclent une ouverture dans cette salle.');this.emit('duct-rattle');}
  return;
 }
 if(v.phase==='outlet'){
  if(v.t+1e-7<R.duct.outlet||!this.ductExitFree(e,outlet))return;
  e.x=outlet.x;e.y=outlet.y;e.face=start.x>end.x?1:-1;
  v.phase='recover';v.t=0;st.cooldown=Math.max(st.cooldown,1.5);st.ductCooldown=R.duct.cooldown;
  this.runtime[e.id]||=rt;Object.assign(rt,{nav:[],navAge:0,home:e.x,memory:0,awareness:0,windup:0,attack:1.2,stun:0,mode:'search',searchAge:0,lastSeen:{x:e.x,y:e.y}});
  this.observeEncounter('duct',e,'duct-exit');ensure(this).stats.ductExits++;return;
 }
 if(v.t>=R.duct.recovery){st.duct=null;rt.nav=[];rt.navAge=0;}
};
P.tickEncounterEnemy=function(e,rt,dt,input){
 if(e.unique||!['facehugger','xeno'].includes(e.kind))return false;
 const st=actorState(this,e.id);this._encounterTicked?.add(e.id);st.cooldown=Math.max(0,st.cooldown-dt);st.ductCooldown=Math.max(0,st.ductCooldown-dt);
 if(st.action){this.advanceEnemyCommitment(e,st,dt);return true;}
 if(st.duct){this.advanceEnemyDuct(e,st,dt);return true;}
 if(rt.stun>0||rt.windup>0||rt.attack>0||this.roomTime<1.2)return false;
 const flare=this.flares.find(f=>f.life>0&&C.dist(f,e)<650);if(flare)return false;
 const target=this.chooseVictim(e,rt,null);if(!this.encounterCanSee(e,target))return false;
 if(this.beginEnemyCommitment(e,target))return true;
 if(e.kind==='xeno'&&st.ductCooldown<=0&&C.dist(e,target.body)>R.duct.minDistance){
  const d=D.enemyDucts.find(d=>d.room===this.s.room&&this.s.flags[d.after]);
  if(d){const from=C.dist(e,d.a)<C.dist(e,d.b)?'a':'b',to=from==='a'?'b':'a';
   if(C.dist(e,d[from])<275&&C.dist(d[to],target.body)+80<C.dist(d[from],target.body)&&this.beginEnemyDuct(e,d,from))return true;
  }
 }
 return false;
};
const tick=P.tick;P.tick=function(dt,input={}){
 const before=this.s.worldTime,room=this.s.room;ensure(this);this._encounterTicked=new Set();
 tick.call(this,dt,input);const elapsed=this.s.worldTime-before;
 if(elapsed<=0||this.dead||this.s.completed||this.s.scene||this.s.traversal||room!==this.s.room)return;
 for(const [id,st] of Object.entries(this.s.encounter.actors)){
  const def=defs.get(id),e=this.s.enemies[id];if(!def||!e||!st.duct||!hidden(st)||this._encounterTicked.has(id)||(e.room||def.room)!==room)continue;
  this.advanceEnemyDuct(Object.assign(e,{id,kind:def.kind,unique:false}),st,elapsed);
 }
 for(const d of D.enemyDucts.filter(d=>d.room===room&&this.s.flags[d.after])){
  if([d.a,d.b].some(p=>C.dist(this.s.player,p)<240&&this.visualRay(this.s.player,p))&&!this.s.encounter.openings.includes(d.id))this.s.encounter.openings.push(d.id);
 }
};
const kill=P.kill;P.kill=function(e){const st=ensure(this).actors[e.id];if(st){st.action=null;st.duct=null;}return kill.call(this,e);};
const codex=P.unlockedCodex;P.unlockedCodex=function(){return [...codex.call(this).filter(c=>!c.unlockBehavior),...D.encounterNotes.filter(c=>ensure(this).seen.includes(c.unlockBehavior))];};
const setMode=P.setMode;P.setMode=function(mode){
 if(Object.entries(ensure(this).actors).some(([id,v])=>(v.action||v.duct)&&(this.s.enemies[id]?.room||defs.get(id).room)===this.s.room)){this.emit('notice','Attendre la fin du mouvement ennemi avant de changer de présentation.');return false;}
 return setMode.call(this,mode);
};
P.encounterAlerts=function(){
 if(this.dead||this.s.completed||this.s.scene||this.s.traversal)return [];
 const out=[];for(const [id,v] of Object.entries(ensure(this).actors)){
  const e=this.s.enemies[id],def=defs.get(id);if(!e||e.hp<=0||(e.room||def.room)!==this.s.room)continue;
  if(v.action?.phase==='windup'&&this.encounterVisible(e))out.push({kind:v.action.kind,text:v.action.kind==='pounce'?'FACEHUGGER · BOND IMMINENT':'XÉNOMORPHE · QUEUE ARMÉE',hint:v.action.kind==='pounce'?'Quitter la trajectoire ou esquiver.':'Reculer, se décaler ou interrompre.',remaining:R[v.action.kind].windup-v.action.t});
  if(v.duct?.phase==='outlet'){const d=ducts.get(v.duct.id),p=d[v.duct.from==='a'?'b':'a'];if(C.dist(this.s.player,p)<650)out.push({kind:'duct',text:'FROTTEMENT DANS UNE OUVERTURE',hint:'La sortie est annoncée. Garder ses distances.',remaining:Math.max(0,R.duct.outlet-v.duct.t)});}
 }return out;
};
})(globalThis);

