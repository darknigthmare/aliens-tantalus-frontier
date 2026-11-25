
/* v0.5 — authored terrain, spatial sound, reversible utilities and the final line.
 * This layer never advances campaign flags on its own and never spawns enemies.
 * Units are simulation coordinates, not real-world metres. No network or DOM.
 */
(function (G) {
'use strict';
const D=G.AVP_DATA,C=G.AVP_CORE,P=C.Game.prototype,clamp=C.clamp,dist=C.dist;
const devices=new Map(D.devices.map(d=>[d.id,d])), enemies=new Set(D.enemies.map(e=>e.id));
const finite=(x,f=0)=>Number.isFinite(x)?x:f;
const inside=(p,b)=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;
function rigFresh(){return {tethered:false,reloadAt:0,bolt:null,latchedAt:0,sceneQueen:null,sceneLex:null,sceneScar:null};}
function ensure(g){
 const s=g.s;s.devices ||= {};s.soundEvents ||= [];s.soundSerial ||=0;s.rig ||=rigFresh();
 s.terrainStats ||= {switches:0,lures:0,purges:0,pitonShots:0,pitonHits:0};
}
function hydrate(s,raw){
 s.devices={};s.soundEvents=[];s.soundSerial=0;s.rig=rigFresh();s.terrainStats={switches:0,lures:0,purges:0,pitonShots:0,pitonHits:0};
 if(raw.schema>=5){
  for(const d of D.devices){const v=raw.devices?.[d.id];if(!v||typeof v!=='object')continue;
   const activeAt=clamp(finite(v.activeAt,-100),-100,s.worldTime+d.delay),until=clamp(finite(v.until,-100),-100,activeAt+d.duration);
   s.devices[d.id]={on:typeof v.on==='boolean'?v.on:d.defaultOn,activeAt,until,cooldownUntil:clamp(finite(v.cooldownUntil),0,s.worldTime+d.delay+d.duration+d.cooldown),sounded:v.sounded===true};
  }
  s.soundSerial=clamp(Math.floor(finite(raw.soundSerial)),0,1e8);
  const categories=new Set(['step','tool','door','rattle','radio','mist','flare']);
  for(const a of (Array.isArray(raw.soundEvents)?raw.soundEvents:[]).slice(-20)){
   if(!a||!C.ROOMS.has(a.room)||!categories.has(a.kind)||!Number.isFinite(a.x)||!Number.isFinite(a.y)||!Number.isFinite(a.expires)||a.expires<=s.worldTime)continue;
   const d=devices.get(a.source),source=a.source==='lex'?'lex':d?.room===a.room?d.id:null;if(!source)continue;
   const room=C.ROOMS.get(a.room);s.soundEvents.push({id:clamp(Math.floor(finite(a.id)),0,1e8),room:a.room,x:clamp(a.x,63,room.width-63),y:clamp(a.y,55,235),power:clamp(finite(a.power),0,800),at:clamp(finite(a.at),0,s.worldTime),expires:clamp(a.expires,s.worldTime,s.worldTime+6),source,kind:a.kind});
  }
  for(const key of Object.keys(s.terrainStats))s.terrainStats[key]=clamp(Math.floor(finite(raw.terrainStats?.[key])),0,1e8);
  const r=raw.rig||{};s.rig.reloadAt=clamp(finite(r.reloadAt),0,s.worldTime+D.rigSpec.reload);
  s.rig.tethered=r.tethered===true&&s.operations.includes('harpoon')&&!!s.flags.chain;
  s.rig.latchedAt=clamp(finite(r.latchedAt),0,s.worldTime);
  if(r.bolt&&s.room==='icebattle'&&s.operations.includes('harpoon')&&!s.rig.tethered&&Number.isFinite(r.bolt.x)&&Number.isFinite(r.bolt.y)&&r.bolt.life>0){
   const room=C.ROOMS.get('icebattle');s.rig.bolt={x:clamp(r.bolt.x,63,room.width-63),y:s.mode==='classic'||C.ROOMS.get(s.room).mode==='SIDE'?144:clamp(r.bolt.y,55,235),face:r.bolt.face===-1?-1:1,life:clamp(finite(r.bolt.life),0,D.rigSpec.boltLife)};
  }
  for(const key of ['sceneQueen','sceneLex','sceneScar'])if(r[key]&&Number.isFinite(r[key].x)&&Number.isFinite(r[key].y))s.rig[key]={x:clamp(r[key].x,65,2235),y:clamp(r[key].y,55,235),face:r[key].face===-1?-1:1};
 }
 // Never invalidate an already-started historical ending or force a completed save back.
 if(s.flags.queen||s.scene?.id==='queen-fall')s.rig.tethered=true;
 return s;
}
G.AVP_TERRAIN={hydrate,devices,rigFresh};
P.deviceState=function(d){ensure(this);return this.s.devices[d.id]||(this.s.devices[d.id]={on:d.defaultOn,activeAt:-100,until:-100,cooldownUntil:0,sounded:false});};
P.deviceAvailable=function(d){return (!d.after||this.s.flags[d.after])&&(!d.power||this.s.operations.includes(d.power));};
P.deviceActive=function(d){const v=this.deviceState(d);return this.deviceAvailable(d)&&(d.kind==='lamp'?v.on:(v.activeAt<=this.s.worldTime&&v.until>this.s.worldTime));};
P.nearestDevice=function(){if(this.s.hidden||this.s.scene||!this.s.flags.gear)return null;return D.devices.filter(d=>d.room===this.s.room&&(!d.after||this.s.flags[d.after])&&this.near(d,83)).sort((a,b)=>dist(a,this.s.player)-dist(b,this.s.player))[0]||null;};
P.deviceLabel=function(d){const v=this.deviceState(d);if(!this.deviceAvailable(d))return 'Raccorder le groupe avant cet éclairage';
 if(d.kind==='lamp')return v.on?'Couper '+d.title.toLowerCase():'Allumer '+d.title.toLowerCase();
 if(this.s.worldTime<v.activeAt&&v.until>this.s.worldTime)return 'Départ dans '+Math.ceil(v.activeAt-this.s.worldTime)+' s';
 if(this.deviceActive(d))return d.kind==='mist'?'Condensation active':'Le leurre résonne';
 if(v.cooldownUntil>this.s.worldTime)return 'Réarmement dans '+Math.ceil(v.cooldownUntil-this.s.worldTime)+' s';
 return d.kind==='mist'?'Ouvrir '+d.title.toLowerCase():'Armer '+d.title.toLowerCase();
};
P.useDevice=function(d){
 if(!d||devices.get(d.id)!==d||d.room!==this.s.room||!this.near(d,83)||this.s.hidden||this.s.scene||this.dead||this.s.completed)return false;
 if(!this.deviceAvailable(d)){this.emit('notice','Cet éclairage attend le groupe de l’expédition.');return false;}
 const v=this.deviceState(d),s=this.s,t=s.worldTime;
 if(d.kind==='lamp'){v.on=!v.on;s.terrainStats.switches++;this.emit('terrain',v.on?'Le projecteur éclaire de nouveau le passage.':'Le projecteur s’éteint. La frontale reste indépendante.');}
 else{
  if(v.cooldownUntil>t){this.emit('notice',this.deviceLabel(d)+'.');return false;}
  v.activeAt=t+d.delay;v.until=v.activeAt+d.duration;v.cooldownUntil=v.until+d.cooldown;v.sounded=false;
  s.terrainStats[d.kind==='mist'?'purges':'lures']++;this.emit('terrain',d.kind==='mist'?'La condensation coupe la vue. Les coups passent encore.':'Le bruit partira d’ici dans 2,6 secondes. Éloignez-vous.');
 }
 s.stats.interactions++;this.emitNoise({x:d.x,y:this.isSide?144:d.y},90,.5,'tool','lex');this.saveCheckpoint();return true;
};
P.surfaceAt=function(p,room=this.room){const q=(this.s.mode==='classic'||room.mode==='SIDE')?{x:p.x,y:144}:p;
 const z=D.terrainZones.find(z=>z.room===room.id&&inside(q,z));return z?{...D.materials[z.material],id:z.material,zone:z.id}:{...D.materials.stone,id:'stone',zone:null};
};
P.emitNoise=function(p,power,life=1.4,kind='tool',source='lex',room=this.s.room){
 ensure(this);const t=this.s.worldTime;this.s.soundSerial=Math.min(1e8,this.s.soundSerial+1);
 this.s.soundEvents.push({id:this.s.soundSerial,room,x:p.x,y:p.y,power,at:t,expires:t+life,kind,source});if(this.s.soundEvents.length>20)this.s.soundEvents.splice(0,this.s.soundEvents.length-20);
};
P.hearNoise=function(e){ensure(this);let best=null,score=0;
 for(const n of this.s.soundEvents){if(n.room!==this.s.room||n.expires<=this.s.worldTime)continue;const attenuation=this.los(e,n)?1:.44,remaining=n.power*attenuation-dist(e,n);
  if(remaining>score){best=n;score=remaining;}}
 return best;
};
P.activeMists=function(){return D.devices.filter(d=>d.room===this.s.room&&d.kind==='mist'&&this.deviceActive(d)).map(d=>({id:d.id,x:d.fx-d.radius/2,y:48,w:d.radius,h:191}));};
P.visualRay=function(a,b){
 if(!this.los(a,b))return false;if(dist(a,b)<64)return true;
 const m=this.activeMists();if(!m.length)return true;const n=Math.max(1,Math.ceil(dist(a,b)/12));
 for(let i=0;i<=n;i++){const q={x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n};if(m.some(z=>inside(q,z)))return false;}return true;
};
P.illuminationAt=function(p){
 let light=0;for(const d of D.devices){if(d.room!==this.s.room||d.kind!=='lamp'||!this.deviceActive(d))continue;
  const source={x:d.fx,y:this.isSide?144:d.fy},range=dist(source,p);if(range<d.radius&&this.visualRay(source,p))light=Math.max(light,1-range/d.radius);}
 return light;
};
const perceive=P.perceive;
P.perceive=function(e,rt,dt,input,flare){
 if(e.unique)return perceive.call(this,e,rt,dt,input,flare);
 const p=this.s.player,illumination=this.illuminationAt(p),lit=this.s.lamp||illumination>.14;
 const range=input.crouch?(lit?220:165):(lit?435:330),sees=!this.s.hidden&&dist(e,p)<range&&((p.x-e.x)*e.face>-35||dist(e,p)<95)&&this.visualRay(e,p);
 // A thrown flare remains a local, visible stimulus rather than a through-wall beacon.
 if(flare&&this.visualRay(e,flare)){rt.mode='lure';rt.awareness=Math.max(0,(rt.awareness||0)-dt);return {active:true,target:flare};}
 const heard=this.hearNoise(e);
 if(sees){if(rt.mode!=='pursue'){rt.nav=[];rt.navAge=0;}rt.lastSeen={x:p.x,y:p.y};rt.memory=6;rt.mode='pursue';rt.awareness=clamp((rt.awareness||0)+dt*3,0,1);rt.searchAge=0;}
 else if(heard){if(rt.mode!=='investigate'||!rt.lastSeen||dist(rt.lastSeen,heard)>52){rt.nav=[];rt.navAge=0;}rt.lastSeen={x:heard.x,y:this.isSide?144:heard.y};rt.memory=5;rt.mode='investigate';rt.awareness=clamp((rt.awareness||0)+dt,0,1);rt.searchAge=0;}
 else{rt.memory=Math.max(0,(rt.memory||0)-dt);rt.awareness=Math.max(0,(rt.awareness||0)-dt*.35);}
 const witness=this.s.hidden?.witnesses.includes(e.id);
 if(witness){rt.lastSeen={x:p.x,y:p.y};rt.memory=8;rt.mode='investigate';if(dist(e,p)<105&&this.visualRay(e,p)){rt.reachHide=(rt.reachHide||0)+dt;if(rt.reachHide>1.1){this.leaveHide(true);rt.mode='pursue';}}}
 if(rt.memory>0&&rt.lastSeen){
  if(!sees&&!heard&&dist(e,rt.lastSeen)<45&&!witness){rt.mode='search';rt.searchAge=(rt.searchAge||0)+dt;return {active:true,target:C.safePoint(this.room,rt.lastSeen.x+Math.sin(rt.searchAge*1.8)*62,this.isSide?144:rt.lastSeen.y+Math.cos(rt.searchAge*1.8)*22)};}
  return {active:true,target:rt.lastSeen};
 }
 rt.mode='patrol';return {active:false,target:null};
};
const move=P.move;
P.move=function(actor,dx,dy,dt,speed){
 const surface=this.surfaceAt(actor),isXeno=actor!==this.s.player&&actor!==this.scar&&actor.id!=='sebastian';
 const factor=surface.id==='resin'&&isXeno?1:surface.speed,x=actor.x,y=actor.y;
 move.call(this,actor,dx,dy,dt,(speed??180)*factor);
 if(actor===this.s.player){
  const length=Math.hypot(actor.x-x,actor.y-y);this._soundStride=(this._soundStride||0)+length;
  if(length>0&&this._soundStride>=26){this._soundStride%=26;const input=this._terrainInput||{},power=input.crouch?surface.crouchNoise:input.run||this.dodgeTime>0?surface.runNoise:surface.walkNoise;
   this.emitNoise({x:actor.x,y:actor.y},power,1.25,'step');this.lastSurfaceStep={id:surface.id,at:this.s.worldTime};this.emit('terrain-step','',{surface:surface.id});
  }
 }
};
const melee=P.melee;P.melee=function(){const before=this.s.player.stamina;melee.call(this);if(this.s.player.stamina<before)this.emitNoise(this.s.player,720,1.2,'tool');};
const field=P.doField;P.doField=function(o){const ok=field.call(this,o);if(ok&&o.kind!=='hide')this.emitNoise(this.s.player,320,1.6,'tool');return ok;};
const portal=P.togglePortal;P.togglePortal=function(d){const ok=portal.call(this,d);if(ok)this.emitNoise({x:d.x,y:this.isSide?144:d.y},450,1.2,'door');return ok;};
P.throwFlare=function(){
 if(this.s.hidden||this.s.scene||!this.s.inventory.flares||this.dead)return false;
 const p=this.s.player;let last={x:p.x,y:p.y};for(let i=8;i<=130;i+=4){const point={x:p.x+p.face*i,y:p.y};if(C.blocked(this.collisionRoom,point.x,point.y,6))break;last=point;}
 this.s.inventory.flares--;this.flares.push({...last,life:9});this.emitNoise(last,140,.7,'flare');this.emit('flare');return true;
};
P.shootPiton=function(){
 ensure(this);const s=this.s,r=s.rig,p=s.player;
 if(s.room!=='icebattle'||!s.operations.includes('harpoon')||!s.flags.chain||s.flags.queen||r.tethered||s.hidden||s.scene||this.dead||this.dodgeTime>0)return false;
 if(r.bolt||r.reloadAt>s.worldTime){this.emit('notice','La ligne revient. Attendez un instant.');return false;}
 r.bolt={x:p.x+p.face*18,y:this.isSide?144:p.y,face:p.face,life:D.rigSpec.boltLife};r.reloadAt=s.worldTime+D.rigSpec.reload;s.terrainStats.pitonShots++;
 this.emitNoise(p,610,1.1,'tool');this.emit('piton','Le piton file sur ce plan.');return true;
};
P.rigReady=function(){const e=this.enemies.find(e=>e.id===D.rigSpec.id);return !!(this.s.rig?.tethered&&e&&e.x>=D.rigSpec.minimumX&&e.x<=D.rigSpec.maximumX&&(this.isSide||Math.abs(e.y-this.s.player.y)<=D.rigSpec.maximumDepthGap));};
P.rigHint=function(){
 if(this.s.room!=='icebattle'||!this.s.operations.includes('harpoon')||this.s.flags.queen)return '';
 const r=this.s.rig,q=this.enemies.find(e=>e.id===D.rigSpec.id),rt=q&&this.runtime[q.id];
 if(r.tethered)return this.rigReady()?'LIGNE ACCROCHÉE · E AU BUTOIR':'LIGNE ACCROCHÉE · ATTIRER LA REINE VERS LA ZONE';
 if(r.bolt||r.reloadAt>this.s.worldTime)return 'RAPPEL DU PITON · '+Math.max(1,Math.ceil(r.reloadAt-this.s.worldTime))+' s';
 return rt&&(rt.charge>0||rt.telegraph>0)?'LA REINE CHARGE · ATTENDRE SA REPRISE':'T · LANCER LE PITON SUR LE MÊME PLAN';
};
P.updateRig=function(dt){
 const r=this.s.rig,b=r.bolt;if(!b)return;if(this.s.room!=='icebattle'){r.bolt=null;return;}
 b.life-=dt;const q=this.enemies.find(e=>e.id===D.rigSpec.id),rt=q&&this.runtime[q.id];
 const n=Math.max(1,Math.ceil(D.rigSpec.boltSpeed*dt/6));
 for(let i=0;i<n&&b.life>0;i++){
  b.x+=D.rigSpec.boltSpeed*dt*b.face/n;
  if(C.blocked(this.collisionRoom,b.x,b.y,3)){b.life=0;this.emit('notice','Le piton heurte un obstacle. La ligne revient.');break;}
  if(q&&Math.abs(q.x-b.x)<53&&(this.isSide||Math.abs(q.y-b.y)<44)){
   b.life=0;if(rt.charge>0||rt.telegraph>0)this.emit('notice','Le piton dévie pendant la charge. Attendre la reprise.');
   else{r.tethered=true;r.latchedAt=this.s.worldTime;this.s.terrainStats.pitonHits++;this.emit('piton-hit','La ligne tient. Attirez la Reine vers la zone de traction.');this.saveCheckpoint();}
  }
 }
 if(b.life<=0)r.bolt=null;
};
const begin=P.beginScene;P.beginScene=function(id){
 ensure(this);if(id==='queen-fall'){const e=this.enemies.find(e=>e.id===D.rigSpec.id);this.s.rig.sceneQueen=e?{x:e.x,y:e.y,face:e.face}:null;this.s.rig.sceneLex={...this.s.player};this.s.rig.sceneScar=this.scar?{x:this.scar.x,y:this.scar.y,face:this.scar.face}:null;}
 return begin.call(this,id);
};
const complete=P.completeObjective;P.completeObjective=function(fromScene=false){
 if(this.objective?.flag==='queen'&&!fromScene&&!this.s.sceneSeen.includes('queen-fall')){
  if(!this.s.rig.tethered){this.emit('notice','La ligne ne tient pas encore : préparer le lance-piton, puis T pendant la reprise de la Reine.');return false;}
  if(!this.rigReady()){this.emit('notice','La Reine doit rejoindre la zone de traction près du butoir.');return false;}
 }
 return complete.call(this,fromScene);
};
const damage=P.damage;P.damage=function(amount,source){const hp=this.s.player.hp;damage.call(this,amount,source);if(this.s.player.hp<hp){this._utilityHold=0;this._utilityLatch=true;}};
const enter=P.enter;P.enter=function(d){const from=this.s.room,ok=enter.call(this,d);if(ok&&this.s.room!==from){this._utilityHold=0;this._utilityTarget=null;this._soundStride=0;if(this.s.rig)this.s.rig.bolt=null;}return ok;};
const setMode=P.setMode;P.setMode=function(mode){setMode.call(this,mode);if(this.isSide&&this.s.rig?.bolt)this.s.rig.bolt.y=144;};
const retry=P.retry;P.retry=function(){retry.call(this);this._utilityHold=0;this._utilityLatch=false;this._utilityTarget=null;this._soundStride=0;this._terrainInput={};};
const tick=P.tick;P.tick=function(dt,input={}){
 ensure(this);const was=this.s.worldTime,hp=this.s.player.hp,room=this.s.room,edge=input.utility&&!this.lastInput.utility;
 const canAct=!this.dead&&!this.s.completed&&!this.s.hidden&&!this.s.scene&&!(this.shiftTime>0)&&!input.listen&&!input.seal;
 const d=canAct&&input.utility?this.nearestDevice():null,value={...input};this._terrainInput=input;
 if(!input.utility){this._utilityHold=0;this._utilityLatch=false;this._utilityTarget=null;}
 if(!d){this._utilityHold=0;this._utilityTarget=null;}
 if(d){value.dx=0;value.dy=0;value.run=false;value.attack=false;value.guard=false;value.flare=false;value.interact=false;value.dodge=false;}
 tick.call(this,dt,value);
 const elapsed=this.s.worldTime-was;if(elapsed<=0||this.dead||this.s.completed||this.s.scene)return;
 this.s.soundEvents=this.s.soundEvents.filter(n=>n.expires>this.s.worldTime);
 if(canAct&&room===this.s.room&&hp===this.s.player.hp){
  if(d&&!this._utilityLatch){if(this._utilityTarget!==d.id){this._utilityTarget=d.id;this._utilityHold=0;}this._utilityHold=(this._utilityHold||0)+elapsed;
   if(this._utilityHold>=d.hold){this.useDevice(d);this._utilityLatch=true;this._utilityHold=0;}}
  else if(edge&&!d&&!this._utilityLatch){this.shootPiton();this._utilityLatch=true;}
 }
 for(const dev of D.devices){const state=this.deviceState(dev);
  if(dev.kind!=='lamp'&&this.deviceActive(dev)&&!state.sounded){state.sounded=true;this.emitNoise({x:dev.fx,y:this.s.mode==='classic'||C.ROOMS.get(dev.room).mode==='SIDE'?144:dev.fy},dev.kind==='mist'?490:dev.radius,dev.kind==='mist'?1.5:Math.min(dev.duration,state.until-this.s.worldTime),dev.kind,dev.id,dev.room);if(dev.room===this.s.room)this.emit('terrain',dev.kind==='mist'?'L’eau soulève un rideau opaque.':'Le bruit résonne à l’endroit préparé.');}
 }
 this.updateRig(elapsed);
};
})(globalThis);

