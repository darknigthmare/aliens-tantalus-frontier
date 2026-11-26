
/* v0.7 · Controlled local crossings over six reciprocal room connections.
 * Actor ownership changes only at an endpoint, using the existing enter() chain.
 * A crossing is a distinct volume: floor enemies do not strike an invisible
 * ground proxy. World clocks, portals, pursuit clocks and terrain still tick.
 * This is constrained traversal, not a free rope/rigid-body physics simulation.
 */
(function(G){'use strict';
const D=G.AVP_DATA,C=G.AVP_CORE,P=C.Game.prototype,clamp=C.clamp;
const defs=new Map(D.traversals.map(t=>[t.id,t])),byDoor=new Map(D.traversals.flatMap(t=>[[t.a,t],[t.b,t]]));
const finite=(v,d=0)=>Number.isFinite(v)?v:d;
const doorById=id=>{const room=C.ROOMS.get(String(id).split('--')[0]);return room?.doors.find(d=>d.id===id)||null;};
const eligible=(s,id)=>{const door=doorById(id),t=byDoor.get(id);return !!(t&&door&&(!door.gate||s.flags[door.gate])&&(!door.shortcut||s.shortcuts.includes(door.shortcut))&&!s.completed&&!s.scene);};
function hydrate(s,raw){
 s.schema=7;s.traversal=null;s.partyTraversals={};s.crossingRecords={};
 s.crossingStats={started:0,completed:0,returned:0,hits:0,slips:0,party:0};
 if(raw.schema>=7){
  for(const k of Object.keys(s.crossingStats))s.crossingStats[k]=clamp(Math.floor(finite(raw.crossingStats?.[k])),0,1e7);
  for(const [id,t] of defs){const r=raw.crossingRecords?.[id];if(r&&Number.isInteger(r.count)&&r.count>0)s.crossingRecords[id]={count:clamp(r.count,1,1e6),at:clamp(finite(r.at),0,s.worldTime),best:clamp(finite(r.best,t.duration),.1,1e5),directions:[t.a,t.b].filter(d=>r.directions?.includes(d))};}
  const v=raw.traversal,t=defs.get(v?.id),door=doorById(v?.door);
  if(t&&door&&byDoor.get(v.door)===t&&s.room===v.door.split('--')[0]&&eligible(s,v.door)&&!s.hidden){
   const origin=C.safePoint(C.ROOMS.get(s.room),door.x,s.mode==='classic'||C.ROOMS.get(s.room).mode==='SIDE'?144:door.y);
   s.player.x=origin.x;s.player.y=origin.y;
   s.traversal={id:t.id,door:door.id,progress:clamp(finite(v.progress),0,1),age:clamp(finite(v.age),0,1e5),lane:clamp(finite(v.lane),-1,1),grip:clamp(finite(v.grip,100),1,100),hazards:{},brace:false,slipCooldown:clamp(finite(v.slipCooldown),0,1.2),advance:0,reverseTried:!!v.reverseTried};
   for(const h of t.hazards){const r=v.hazards?.[h.id];if(r&&['warning','active','done'].includes(r.state))s.traversal.hazards[h.id]={state:r.state,t:clamp(finite(r.t),0,5),hit:r.hit===true};}
  }
  for(const d of D.companions){const v=raw.partyTraversals?.[d.id],p=s.party?.[d.id],t=defs.get(v?.id),door=doorById(v?.door);
   if(p&&t&&door&&byDoor.get(v.door)===t&&p.room===v.door.split('--')[0]&&eligible(s,v.door))s.partyTraversals[d.id]={id:t.id,door:door.id,progress:clamp(finite(v.progress),0,1)};
  }
 }
 return s;
}
function ensure(g){g.s.traversal??=null;g.s.partyTraversals||={};g.s.crossingRecords||={};g.s.crossingStats||={started:0,completed:0,returned:0,hits:0,slips:0,party:0};g.s.schema=7;}
G.AVP_TRAVERSAL={defs,byDoor,doorById,hydrate,ensure};
P.traversalFor=function(door){return byDoor.get(typeof door==='string'?door:door?.id)||null;};
P.crossingCanonical=function(v=this.s.traversal){return v?(v.door===defs.get(v.id).a?v.progress:1-v.progress):0;};
P.crossingDirection=function(v=this.s.traversal){if(!v)return 0;const t=defs.get(v.id),i=t.axis==='x'?0:1;return Math.sign(t.points[1][i]-t.points[0][i])*(v.door===t.a?1:-1);};
P.crossingView=function(){const v=this.s.traversal;if(!v)return null;const t=defs.get(v.id),d=doorById(v.door),haz=t.hazards.find(h=>['warning','active'].includes(v.hazards[h.id]?.state));return {title:t.title,to:C.ROOMS.get(d.to).name,kind:t.kind,axis:t.axis,direction:this.crossingDirection(),progress:v.progress,grip:v.grip,lane:v.lane,brace:v.brace,alert:haz?(v.hazards[haz.id].state==='warning'?'danger annoncé':'danger dans le passage'):v.grip<25?'prise faible':v.brace?'prise assurée':'ligne libre',hazard:haz?.type||null};};
const enter=P.enter;
P.enter=function(door){ensure(this);if(this._finishCrossing)return enter.call(this,door);if(this.s.traversal||this.dead||this.s.completed)return false;
 const t=this.traversalFor(door);if(!t)return enter.call(this,door);
 if(!this.room.doors.includes(door)||this.s.hidden||this.s.scene||!this.near(door,86))return false;
 const reason=this.gate(door);if(reason){this.emit('notice',reason);return false;}
 this.cancelConversation(false);this._studyTarget=null;this._studyHold=0;
 this.dodgeTime=0;this.attackTime=0;this.hold=0;this.lastInput={};this.storeRoomState();
 this.saveCheckpoint(); // A death during this new crossing retries on the source ledge.
 this.s.traversal={id:t.id,door:door.id,progress:0,age:0,lane:0,grip:100,hazards:{},brace:false,advance:0,slipCooldown:0,reverseTried:false};
 this.s.crossingStats.started++;this._crossELatch=true;this.emit('notice',t.title+' · Les flèches commandent le passage ; C assure la prise.');this.emit('save');return true;
};
P.returnCrossing=function(){const v=this.s.traversal;if(!v)return false;const d=doorById(v.door);this.s.traversal=null;this.s.crossingStats.returned++;
 const side=this.isSide,point=C.safePoint(this.room,d.x<150?d.x+50:d.x>this.room.width-150?d.x-50:d.x+55,side?144:clamp(d.y+26,60,225));Object.assign(this.s.player,point);
 this.lastInput={};this.interactLatch=true;this._crossELatch=true;this.emit('notice','Retour au départ du franchissement.');this.saveCheckpoint();return true;
};
P.finishCrossing=function(){const v=this.s.traversal;if(!v)return false;const door=doorById(v.door),t=defs.get(v.id);if(this.gate(door))return false;
 this.s.traversal=null;this._finishCrossing=true;let ok;try{ok=enter.call(this,door);}finally{this._finishCrossing=false;}
 if(!ok){this.s.traversal=v;return false;}
 const r=this.s.crossingRecords[t.id]||(this.s.crossingRecords[t.id]={count:0,best:1e5,at:0,directions:[]});r.count++;r.best=Math.min(r.best,v.age);r.at=this.s.worldTime;if(!r.directions.includes(v.door))r.directions.push(v.door);
 this.s.crossingStats.completed++;this._crossELatch=true;this.lastInput={};this.saveCheckpoint();return true;
};
const damage=P.damage;
P.damage=function(amount,source=null){if(this.s.traversal&&!this._crossingDamage)return;return damage.call(this,amount,source);};
P.crossingHit=function(amount){if(this.dead)return;this._crossingDamage=true;try{damage.call(this,amount,null);}finally{this._crossingDamage=false;}};
const perceive=P.perceive;P.perceive=function(e,rt,dt,input,flare){if(!this.s.traversal)return perceive.call(this,e,rt,dt,input,flare);
 rt.memory=Math.max(0,(rt.memory||0)-dt);rt.mode=rt.memory>0?'search':'patrol';return {active:!!(rt.memory>0&&rt.lastSeen),target:rt.lastSeen||null};};
const companions=P.updateCompanions;P.updateCompanions=function(dt){if(this.s.traversal){for(const id of Object.keys(this.s.partyTraversals||{}))this.advancePartyTransit(id,dt);return;}return companions.call(this,dt);};
P.beginPartyTransit=function(id,door){ensure(this);const t=this.traversalFor(door);if(!t)return false;this.s.partyTraversals[id]={id:t.id,door:door.id,progress:0};this._partyStatus[id]='Franchit · '+t.title;return true;};
P.advancePartyTransit=function(id,dt){const v=this.s.partyTraversals?.[id],a=this.s.party?.[id],t=defs.get(v?.id);if(!v||!a||!t)return false;
 const d=doorById(v.door);if(!d||a.room!==v.door.split('--')[0]){delete this.s.partyTraversals[id];return false;}
 // Destination is locked for an engaged crossing, even if Lex moves elsewhere.
 v.progress=Math.min(1,v.progress+dt/(t.duration*1.10));this._partyStatus[id]='Franchit · '+t.title+' · '+Math.floor(v.progress*100)+' %';
 if(v.progress<1||this.gate(d))return true;
 const next=C.ROOMS.get(d.to),pair=next.doors.find(z=>z.id===d.pair),isSide=this.s.mode==='classic'||next.mode==='SIDE';
 if(!pair)return true;this.storeRoomState();const point=C.safePoint(next,pair.x<150?pair.x+40:pair.x>next.width-150?pair.x-40:pair.x+38,isSide?144:clamp(pair.y+22,60,230));
 Object.assign(a,point,{room:next.id,face:pair.x>next.width-200?-1:1,crossWait:0,lastDoor:d.id});delete this.s.partyTraversals[id];delete this._partyNav[id];this.s.partyStats.crossings++;this.s.crossingStats.party++;
 if(next.id===this.s.room){this.placeAlly();this.emit('party',D.companions.find(z=>z.id===id).name+' termine le franchissement.');}return true;
};
const status=P.partyStatus;P.partyStatus=function(id){const t=this.s.partyTraversals?.[id];return t?'Franchit · '+defs.get(t.id).title+' · '+Math.floor(t.progress*100)+' %':status.call(this,id);};
const nearby=P.nearest;P.nearest=function(){if(this.s.traversal)return null;const v=nearby.call(this);if(v?.kind==='door'&&this.traversalFor(v.item))return {...v,label:'Franchir · '+this.traversalFor(v.item).title};return v;};
const retry=P.retry;P.retry=function(){retry.call(this);ensure(this);this._crossELatch=false;if(this.s.traversal){this.s.traversal.brace=false;this.s.traversal.advance=0;}};
// Menu and field actions may not operate through the invisible source-room proxy.
for(const key of ['beginConversation','turnRing','turnWeight','togglePortal','useDevice','shootPiton','throwFlare','completeObjective','melee','orderCompanion']){const base=P[key];if(base)P[key]=function(...args){if(this.s.traversal)return false;return base.apply(this,args);};}
const tick=P.tick;P.tick=function(dt,input={}){
 ensure(this);if(!this.s.traversal)return tick.call(this,dt,input);dt=clamp(finite(dt),0,.05);if(!dt||this.dead||this.s.completed)return;
 const v=this.s.traversal,t=defs.get(v.id),before=this.s.worldTime,hp=this.s.player.hp,stamina=this.s.player.stamina;
 // All ordinary systems tick, but no in-room action can use the source proxy.
 tick.call(this,dt,{});this.s.player.stamina=stamina;if(this.dead)return;const elapsed=this.s.worldTime-before;if(elapsed<=0)return;
 v.age+=elapsed;v.slipCooldown=Math.max(0,v.slipCooldown-elapsed);v.brace=!!(input.crouch||input.guard);v.advance=0;
 const axis=t.axis==='x'?finite(input.dx):finite(input.dy),lateral=t.axis==='x'?finite(input.dy):finite(input.dx),dir=this.crossingDirection(v),command=clamp(axis*dir,-1,1);
 if(!input.interact)this._crossELatch=false;
 if(input.interact&&!this._crossELatch&&v.progress<.055){this.returnCrossing();return;}
 if(input.interact)this._crossELatch=true;
 if(!v.brace){v.lane=clamp(v.lane+lateral*elapsed*1.9,-1,1);
  if(Math.abs(command)>.06){const rate=input.run?1.55:1;v.advance=command;v.progress=clamp(v.progress+command*elapsed/t.duration*rate,0,1);v.grip=Math.max(0,v.grip-elapsed*(input.run?27:9));if(command<0)v.reverseTried=true;}
  else v.grip=Math.min(100,v.grip+elapsed*5);
 }else v.grip=Math.min(100,v.grip+elapsed*28);
 const canonical=this.crossingCanonical(v);
 for(const h of t.hazards){let r=v.hazards[h.id];if(!r&&Math.abs(canonical-h.at)<.18){r=v.hazards[h.id]={state:'warning',t:0,hit:false};this.emit('warning',({ice:'La glace se fissure.',wind:'Une rafale remonte la paroi.',stone:'Des grains de pierre tombent.',acid:'La chaîne laisse couler un liquide.',steam:'La conduite monte en pression.'})[h.type]+' Décalez-vous ou maintenez C.');}
  if(!r||r.state==='done')continue;r.t+=elapsed;
  if(r.state==='warning'&&r.t>=1.25){r.state='active';r.t=0;}
  if(r.state==='active'){
   if(!r.hit&&Math.abs(canonical-h.at)<.20&&Math.abs(v.lane-h.lane)<.64){r.hit=true;this.s.crossingStats.hits++;v.grip=Math.max(0,v.grip-(v.brace?4:18));this.crossingHit(h.damage*(v.brace?.25:1));}
   if(r.t>=.85)r.state='done';
  }
 }
 if(v.grip<=.01&&v.slipCooldown<=0){v.progress=Math.max(0,v.progress-.075);v.grip=36;v.slipCooldown=1.2;this.s.crossingStats.slips++;this.crossingHit(12);this.emit('warning','La prise cède. Maintenez C pour reprendre appui.');}
 if(this.dead)return;
 if(v.progress<=0&&v.reverseTried){this.returnCrossing();return;}
 if(v.progress>=1){if(!this.finishCrossing())v.progress=1;}
};
})(globalThis);

