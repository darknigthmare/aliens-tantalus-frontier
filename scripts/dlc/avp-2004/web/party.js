
/* v0.6 · Physical companions and interruptible, original conversations.
   Durables are primitive, validated data. Routes, input latches and active speech
   are transient. No DOM, network, enemy spawn, offscreen shot or remote quest flag. */
(function(G){'use strict';
const D=G.AVP_DATA,C=G.AVP_CORE,P=C.Game.prototype,clamp=C.clamp,dist=C.dist;
const finite=(v,d=0)=>Number.isFinite(v)?v:d;
const defs=new Map(D.companions.map(d=>[d.id,d]));
const talks=new Map(D.encounters.map(d=>[d.id,d]));
const studyDefs=new Map(D.studies.map(d=>[d.id,d]));
const side=(g,r)=>g.s.mode==='classic'||r.mode==='SIDE';
const active=(s,d)=>!!s.flags[d.start]&&!s.flags[d.until]&&!s.completed;
const clipArray=(v,ids)=>Array.isArray(v)?[...new Set(v.filter(x=>ids.has(x)))]:[];
function hydrate(s,raw){
 s.schema=6;s.party={};s.conversations={};s.studies=[];s.partyBarks=[];
 s.partyStats={crossings:0,commands:0,studies:0,conversations:0,interruptions:0};
 if(raw.schema>=6){
  for(const [id,d] of defs){const v=raw.party?.[id];if(!v||!active(s,d)||!C.ROOMS.has(v.room)||C.ROOMS.get(v.room).sceneOnly)continue;
   const r=C.ROOMS.get(v.room),pos=C.safePoint(r,v.x,s.mode==='classic'||r.mode==='SIDE'?144:v.y);
   s.party[id]={id,room:r.id,...pos,face:v.face===-1?-1:1,order:v.order==='hold'?'hold':'follow',stance:v.stance==='silent'?'silent':'support',crossWait:0,lastDoor:null};
  }
  for(const [id,t] of talks){const v=raw.conversations?.[id];if(v&&Number.isInteger(v.choice)&&v.choice>=0&&v.choice<t.choices.length)s.conversations[id]={choice:v.choice,at:clamp(finite(v.at),0,s.worldTime)};}
  s.studies=clipArray(raw.studies,new Set(studyDefs.keys()));s.partyBarks=clipArray(raw.partyBarks,new Set(D.partyBarks.map(b=>b.id)));
  for(const k of Object.keys(s.partyStats))s.partyStats[k]=clamp(Math.floor(finite(raw.partyStats?.[k])),0,1e8);
 }
 // One-time migration: old saves had no persistent room for an offscreen companion.
 for(const [id,d] of defs)if(active(s,d)&&!s.party[id]){
  const old=id==='scar'&&s.ally.position?.room===s.room?s.ally.position:null;
  const r=C.ROOMS.get(s.room),pos=old||C.safePoint(r,s.player.x-90,s.mode==='classic'||r.mode==='SIDE'?144:s.player.y+25);
  s.party[id]={id,room:s.room,x:pos.x,y:pos.y,face:old?.face||1,order:id==='scar'&&s.ally.order==='hold'?'hold':'follow',stance:'support',crossWait:0,lastDoor:null};
 }
 if(s.party.scar)s.ally.order=s.party.scar.order;
 return s;
}
function ensure(g){
 if(!g.s.party){g.s.party={};g.s.conversations={};g.s.studies=[];g.s.partyBarks=[];g.s.partyStats={crossings:0,commands:0,studies:0,conversations:0,interruptions:0};}
 g._partyActors ||= {};g._partyNav ||= {};g._partyStatus ||= {};
}
function body(g,id){if(id==='scar')return g.scar;return g._partyActors?.[id]||null;}
function put(g,id,a){const v=g.s.party[id];if(v&&a){v.x=a.x;v.y=a.y;v.face=a.face===-1?-1:1;}}
function attach(g){
 ensure(g);
 for(const [id,d] of defs){
  if(!active(g.s,d)){delete g.s.party[id];delete g._partyActors[id];if(id==='scar')g.scar=null;continue;}
  let v=g.s.party[id];
  if(!v){const p=C.safePoint(g.room,g.s.player.x-85,g.isSide?144:g.s.player.y+25);v=g.s.party[id]={id,room:g.s.room,...p,face:1,order:'follow',stance:'support',crossWait:0,lastDoor:null};}
  if(v.room===g.s.room&&!g.s.partyTraversals?.[id]){const a={id,...v,nav:[],navAge:0};if(side(g,g.room))a.y=144;g._partyActors[id]=a;if(id==='scar')g.scar=a;}
  else {delete g._partyActors[id];if(id==='scar')g.scar=null;}
 }
}
G.AVP_PARTY={hydrate,defs,talks,studyDefs,active,ensure};
const oldPlace=P.placeAlly;P.placeAlly=function(){attach(this);};
P.companionActors=function(){ensure(this);return D.companions.map(d=>body(this,d.id)).filter(Boolean);};
P.partyStatus=function(id){ensure(this);const v=this.s.party[id];if(!v)return 'Absent de cette étape';
 if(v.order==='hold')return v.room===this.s.room?'Garde sa position':'Attend dans '+C.ROOMS.get(v.room).name;
 if(v.room!==this.s.room)return this._partyStatus[id]||'En route · '+C.ROOMS.get(v.room).name;
 const a=body(this,id);return a&&dist(a,this.s.player)>200?'Rejoint Lex':v.stance==='silent'&&id==='scar'?'Discret · tir retenu':'À portée';};
P.orderCompanion=function(id,command){ensure(this);const v=this.s.party[id];if(!v||!['follow','hold','support','silent'].includes(command)||this.dead||this.s.completed)return false;
 if(command==='hold'&&v.room!==this.s.room){this.emit('notice','Rejoindre le compagnon avant de lui assigner une position.');return false;}
 if(['support','silent'].includes(command)){if(id!=='scar')return false;v.stance=command;}else v.order=command;
 if(id==='scar')this.s.ally.order=v.order;
 const a=body(this,id);if(a){put(this,id,a);a.nav=[];a.navAge=0;}
 delete this._partyNav[id];this.s.partyStats.commands++;
 this.emit('party',defs.get(id).name+' · '+({follow:'rejoint Lex à pied',hold:'garde cette position',support:'soutien autorisé',silent:'tir automatique retenu'}[command])+'.');
 this.saveCheckpoint();return true;
};
P.toggleAlly=function(){if(!this.s.party?.scar)return false;return this.orderCompanion('scar',this.s.party.scar.order==='hold'?'follow':'hold');};
const store=P.storeRoomState;P.storeRoomState=function(){ensure(this);if(this.s.party.scar)this.s.party.scar.order=this.s.ally.order;for(const [id,d] of defs)if(this.s.party[id]?.room===this.s.room)put(this,id,body(this,id));store.call(this);};
const enter=P.enter;P.enter=function(door){ensure(this);this.cancelConversation(false);this._studyHold=0;this._studyTarget=null;
 const order=this.s.party.scar?.order,from=this.s.room,ok=enter.call(this,door);
 if(ok&&from!==this.s.room){if(order&&this.s.party.scar){this.s.party.scar.order=order;this.s.ally.order=order;}this._partyNav={};attach(this);this.saveCheckpoint();}return ok;
};
const setMode=P.setMode;P.setMode=function(mode){setMode.call(this,mode);ensure(this);for(const v of Object.values(this.s.party)){if(side(this,C.ROOMS.get(v.room)))v.y=144;}attach(this);this._partyNav={};this.saveCheckpoint();};
const retry=P.retry;P.retry=function(){retry.call(this);this._talk=null;this._talkLatch=false;this._studyHold=0;this._partyNav={};attach(this);};
// A breadth-first route over authored, reciprocal passages. Closed doors are
// traversable in the route graph, but are NEVER traversed by the actor simulation.
P.companionRoute=function(from,to){
 const visited=new Set(this.s.visited);visited.add(from);const queue=[[from]],seen=new Set([from]);
 while(queue.length){const a=queue.shift(),r=C.ROOMS.get(a.at(-1));if(r.id===to)return a;
  for(const d of r.doors){if(seen.has(d.to)||!visited.has(d.to)||this.structuralGate(d))continue;seen.add(d.to);queue.push([...a,d.to]);}}
 return [];
};
function offlineWalk(g,v,target,dt,speed){
 const room=C.ROOMS.get(v.room),collision=g.huntCollision(v.room),isSide=side(g,room),nav=g._partyNav[v.id]||(g._partyNav[v.id]={age:0,path:[]});
 nav.age-=dt;if(nav.age<=0||!nav.path.length){nav.path=C.path(collision,v,target,isSide);nav.age=.5;}
 while(nav.path.length&&dist(v,nav.path[0])<13)nav.path.shift();const q=nav.path[0]||target,dx=q.x-v.x,dy=isSide?0:q.y-v.y,len=Math.hypot(dx,dy);if(len<2)return;
 const material=g.surfaceAt(v,room),factor=material.id==='resin'&&v.id==='scar'?1:material.speed;
 const step=Math.min(len,speed*dt*factor),n=Math.max(1,Math.ceil(step/7)),mx=dx/len*step/n,my=dy/len*step/n;
 for(let k=0;k<n;k++){if(!C.blocked(collision,v.x+mx,v.y))v.x+=mx;if(!C.blocked(collision,v.x,v.y+my))v.y+=my;}
 if(Math.abs(dx)>2)v.face=dx>0?1:-1;if(isSide)v.y=144;
}
P.advanceOffscreenCompanion=function(id,dt){
 const v=this.s.party[id],d=defs.get(id);if(!v||v.room===this.s.room||v.order==='hold')return;
 const route=this.companionRoute(v.room,this.s.room);
 if(route.length<2){this._partyStatus[id]='Sans chemin ouvert · '+C.ROOMS.get(v.room).name;return;}
 const room=C.ROOMS.get(v.room),door=room.doors.find(a=>a.to===route[1]&&!this.structuralGate(a)),target=C.safePoint(room,door.x,side(this,room)?144:door.y);
 const ps=this.portalState(door);if(ps&&['closed','closing'].includes(ps.status)){v.crossWait=0;const q=C.safePoint(room,door.x<room.width/2?door.x+95:door.x-95,side(this,room)?144:clamp(door.y+30,60,225));offlineWalk(this,v,q,dt,d.speed);this._partyStatus[id]='Bloqué au seuil · '+room.name;return;}
 if(dist(v,target)>30){v.crossWait=0;offlineWalk(this,v,target,dt,d.speed);this._partyStatus[id]='En route · '+room.name;return;}
 if(this.gate(door)){v.crossWait=0;this._partyStatus[id]='Bloqué au seuil · '+room.name;return;}
 v.crossWait=(v.crossWait||0)+dt;if(v.crossWait<.5)return;
 if(this.beginPartyTransit?.(id,door))return;
 const next=C.ROOMS.get(door.to),pair=next.doors.find(a=>a.id===door.pair);if(!pair)return;
 const pos=C.safePoint(next,pair.x<150?pair.x+40:pair.x>next.width-150?pair.x-40:pair.x+38,side(this,next)?144:clamp(pair.y+22,60,230));
 Object.assign(v,pos,{room:next.id,face:pair.x>next.width-200?-1:1,crossWait:0,lastDoor:door.id});delete this._partyNav[id];this.s.partyStats.crossings++;
 if(next.id===this.s.room){attach(this);this.emit('party',d.name+' rejoint le passage.');}
};
P.updateCompanions=function(dt){
 ensure(this);if(this.s.party.scar)this.s.party.scar.order=this.s.ally.order;
 for(const [id,d] of defs){const v=this.s.party[id];if(!v)continue;
  if(!active(this.s,d)){delete this.s.party[id];delete this._partyActors[id];if(id==='scar')this.scar=null;continue;}
  if(this.companionDown?.(id))continue;
  if(this.s.partyTraversals?.[id]){this.advancePartyTransit(id,dt);continue;}
  if(v.room!==this.s.room){this.advanceOffscreenCompanion(id,dt);continue;}
  const a=body(this,id);if(!a)continue; // Explicit isolated fixtures may suppress an actor.
  const study=id==='sebastian'&&this._studyTarget?studyDefs.get(this._studyTarget):null;
  if(v.order==='follow'&&!this.s.hidden&&!this._talk){
   const visible=id==='scar'&&v.stance!=='silent'?this.enemies.find(e=>e.hp>0&&!e.unique&&Math.abs(e.x-a.x)<570&&this.visualRay(a,e)):null;
   const target=study?{x:study.x+62,y:this.isSide?144:study.y+15}:{x:clamp(this.s.player.x-this.s.player.face*(id==='scar'?85:115),80,this.room.width-80),y:this.isSide?144:visible&&Math.abs(visible.x-this.s.player.x)<550?visible.y:clamp(this.s.player.y+25,60,225)};
   this.walk(a,target,a,dt,d.speed);
  }
  if(id==='scar'){
   this.s.ally.energy=Math.min(100,this.s.ally.energy+dt*9);this.allyCooldown-=dt;
   const target=this.enemies.find(e=>e.hp>0&&!e.unique&&Math.abs(e.x-a.x)<570&&(this.isSide||Math.abs(e.y-a.y)<42)&&this.visualRay(a,e));
   if(v.stance!=='silent'&&!this.s.hidden&&!this._talk&&this._aid?.id!==id&&target&&this.allyCooldown<=0&&this.s.ally.energy>=26){
    a.face=target.x>a.x?1:-1;this.shots.push({x:a.x,y:this.isSide?144:a.y,dx:a.face,life:1.1});this.s.ally.energy-=26;this.allyCooldown=2.3;this.emit('plasma');
   }
  }
  put(this,id,a);
 }
 // No offscreen shooting. Energy is a timer, not offscreen combat.
 if(this.s.party.scar?.room!==this.s.room&&this.s.party.scar)this.s.ally.energy=Math.min(100,this.s.ally.energy+dt*9);
};
P.encounterAvailable=function(t){return !!t&&this.s.room===t.room&&this.s.chapter>=t.from&&this.s.chapter<t.to&&!this.s.completed;};
P.encounterPosition=function(t){if(!this.encounterAvailable(t))return null;
 if(t.companion){const v=this.s.party?.[t.companion];return v?.room===this.s.room?body(this,t.companion):null;}
 return C.safePoint(this.room,t.x,this.isSide?144:t.y);
};
P.conversationActors=function(){return D.encounters.filter(t=>!t.companion&&this.encounterAvailable(t)).map(t=>({id:t.id,asset:t.actor,name:t.name,...this.encounterPosition(t),face:-1}));};
P.partyDanger=function(){return this.enemies.some(e=>e.hp>0&&dist(e,this.s.player)<285&&this.visualRay(e,this.s.player));};
P.nearestConversation=function(){if(this.s.hidden||this.s.scene)return null;
 return D.encounters.filter(t=>this.encounterAvailable(t)&&!this.s.conversations[t.id]).map(t=>({t,p:this.encounterPosition(t)})).filter(a=>a.p&&dist(a.p,this.s.player)<135&&this.los(a.p,this.s.player)).sort((a,b)=>dist(a.p,this.s.player)-dist(b.p,this.s.player))[0]?.t||null;
};
P.beginConversation=function(id){ensure(this);const t=talks.get(id),p=t&&this.encounterPosition(t);
 if(!p||this._talk||this.s.hidden||this.s.scene||this.dead||this.s.completed||this.s.conversations[id]||dist(p,this.s.player)>=135||!this.los(p,this.s.player))return false;
 if(this.partyDanger()){this.emit('notice','Pas maintenant : une menace approche.');return false;}
 this._talk={id,index:0,choice:null,room:this.s.room,x:this.s.player.x,y:this.s.player.y};this.emit('conversation');return true;
};
P.conversationView=function(){const a=this._talk,t=a&&talks.get(a.id);if(!t)return null;
 if(a.index<t.lines.length)return {id:t.id,title:t.title,actor:t.actor,speaker:t.lines[a.index][0],text:t.lines[a.index][1],stage:'line',index:a.index,count:t.lines.length};
 if(a.choice===null)return {id:t.id,title:t.title,actor:'lex',speaker:'Lex',text:'Comment poursuivre cet échange ?',stage:'choice',choices:t.choices.map(c=>c.label)};
 const ch=t.choices[a.choice];return {id:t.id,title:t.title,actor:t.actor,speaker:t.name,text:ch.reply,hint:ch.hint,stage:'reply',choice:a.choice};
};
P.advanceConversation=function(choice){const a=this._talk,t=a&&talks.get(a.id);if(!t)return false;
 if(this.dead||this.s.scene||this.partyDanger()||!this.encounterAvailable(t)){this.cancelConversation(true);return false;}
 if(a.index<t.lines.length){a.index++;return true;}
 if(a.choice===null){if(!Number.isInteger(choice)||choice<0||choice>=t.choices.length)return false;a.choice=choice;return true;}
 const ch=t.choices[a.choice];this.s.conversations[t.id]={choice:a.choice,at:this.s.worldTime};this.s.partyStats.conversations++;
 this._talk=null;if(ch.stance&&this.s.party.scar)this.orderCompanion('scar',ch.stance);if(ch.order&&this.s.party.scar)this.orderCompanion('scar',ch.order);
 this.emit('party','Échange conservé · '+t.title);this.saveCheckpoint();return true;
};
P.cancelConversation=function(notify=false){if(!this._talk)return false;this._talk=null;this.s.partyStats.interruptions++;if(notify)this.emit('party','L’échange s’interrompt. Restez en mouvement.');return true;};
P.nearestStudy=function(){if(this.s.hidden||this.s.scene)return null;return D.studies.find(s=>s.room===this.s.room&&this.s.flags[s.after]&&!this.s.flags[s.before]&&!this.s.studies.includes(s.id)&&this.near(s,78))||null;};
P.studyStatus=function(s){const a=body(this,'sebastian');if(!a||this.s.party.sebastian?.room!==this.s.room)return 'Regrouper Sebastian dans cette salle';
 if(this.s.party.sebastian.order==='hold')return 'Demander à Sebastian de suivre';if(dist(a,{x:s.x,y:this.isSide?144:s.y})>155)return 'Sebastian rejoint le support';
 return this.partyDanger()?'La menace empêche le relevé':null;};
const complete=P.completeObjective;P.completeObjective=function(fromScene=false){
 const flag=this.objective?.flag,id=flag==='ritual'?'sebastian':flag==='escaped'?'scar':null;
 if(id&&!fromScene){const a=body(this,id);if(!a||this.s.party[id]?.room!==this.s.room||dist(a,this.s.player)>230){this.emit('notice','Regrouper '+defs.get(id).name+' près de Lex avant de continuer · O.');return false;}}
 const ok=complete.call(this,fromScene);if(ok){attach(this);this.saveCheckpoint();}return ok;
};
const tick=P.tick;P.tick=function(dt,input={}){
 ensure(this);const edge=!!input.talk&&!this._talkLatch,before=this.s.worldTime,hp=this.s.player.hp,room=this.s.room;
 if(!input.talk){this._talkLatch=false;this._studyHold=0;this._studyTarget=null;}
 const study=input.talk&&!this._talk?this.nearestStudy():null;
 if(study&&!this.dead&&!this.s.completed){this._studyTarget=study.id;}
 else if(!study){this._studyTarget=null;this._studyHold=0;}
 if(edge&&!study&&!this.dead&&!this.s.completed&&!this.s.scene){if(this._talk)this.advanceConversation();else{const t=this.nearestConversation();if(t)this.beginConversation(t.id);}this._talkLatch=true;}
 let value={...input};
 if(this._talk){if(input.dx||input.dy||input.attack||input.dodge||input.interact||input.utility||input.seal)this.cancelConversation(true);
  else value={...value,dx:0,dy:0,attack:false,flare:false,guard:false,run:false,dodge:false,interact:false,utility:false,seal:false,listen:false};}
 if(study){value={...value,dx:0,dy:0,run:false,attack:false,flare:false,dodge:false,interact:false,utility:false,seal:false,listen:false};}
 tick.call(this,dt,value);
 const elapsed=this.s.worldTime-before;if(elapsed<=0)return;
 if(this._talk&&(this.s.player.hp<hp||this.dead||this.s.room!==room||this.s.scene||this.partyDanger()))this.cancelConversation(true);
 if(study&&room===this.s.room&&!this.dead&&!this.s.scene&&this.s.player.hp===hp&&!this.studyStatus(study)){
  this._studyHold=(this._studyHold||0)+elapsed;if(this._studyHold>=study.hold){this.s.studies.push(study.id);this.s.partyStats.studies++;this.s.stats.interactions++;
   this._studyHold=0;this._studyTarget=null;this._talkLatch=true;this.emit('field',study.text,{title:study.title});this.saveCheckpoint();}
 }else if(study)this._studyHold=0;
 if(!this.s.scene&&!this.dead&&!this._talk&&this.roomTime>1.7){for(const b of D.partyBarks){
  if(b.room!==this.s.room||this.s.chapter<b.from||this.s.chapter>=b.to||this.s.partyBarks.includes(b.id))continue;
  if(b.companion&&(!body(this,b.companion)||dist(body(this,b.companion),this.s.player)>300))continue;
  if(this.partyDanger())continue;this.s.partyBarks.push(b.id);this.emit('bark',b.text,{speaker:b.speaker});break;
 }}
};
})(globalThis);

