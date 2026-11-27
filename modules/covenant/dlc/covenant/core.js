/* Covenant 0.10 — deterministic simulation; no DOM and no host save access. */
(function(root){'use strict';
const FIDELITY=typeof module!=='undefined'&&module.exports?require('./fidelity.js'):root.CovenantFidelity;
const FREIGHT=typeof module!=='undefined'&&module.exports?require('./freight.js'):root.CovenantFreight;
const ATMO=typeof module!=='undefined'&&module.exports?require('./atmosphere.js'):root.CovenantAtmosphere;
const ARCHAEO=typeof module!=='undefined'&&module.exports?require('./archaeology.js'):root.CovenantArchaeology;
const MAINT=typeof module!=='undefined'&&module.exports?require('./maintenance.js'):root.CovenantMaintenance;
const NETWORK=typeof module!=='undefined'&&module.exports?require('./ship-systems.js'):root.CovenantShipSystems;
const clone=x=>JSON.parse(JSON.stringify(x));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
const dist=(a,b)=>Math.hypot(a.x-b.x,(a.z-b.z)*510);
const PROFILE={
 facehugger:{sight:520,hearing:1.1,speed:183,windup:.57,lunge:.30,recovery:1.05,reach:118,damage:18},
 neomorph:{sight:720,hearing:1.0,speed:159,windup:.72,lunge:.27,recovery:1.0,reach:150,damage:21},
 xenomorph:{sight:760,hearing:1.2,speed:144,windup:.88,lunge:.30,recovery:1.1,reach:172,damage:29}
};
class CovenantEngine{
 constructor(data,options={}){
  this.data=data;this.rooms=new Map(data.rooms.map(r=>[r.id,r]));
  this.actionIds=new Set(data.rooms.flatMap(r=>r.actions.map(a=>a.id)));
  this.codexIds=new Set(data.codex.map(c=>c.id));
  this.supplyDefs=new Map(data.rooms.flatMap(r=>(r.supplies||[]).map(s=>[s.id,{...s,room:r.id}])));
  this.observationIds=new Set(data.rooms.flatMap(r=>(r.observations||[]).map(o=>o.id)));
  this.enemyDefs=new Map(data.rooms.flatMap(r=>r.enemies.map(e=>[e.id,{...e,room:r.id}])));
  this.doorDefs=new Map((data.doors||[]).map(d=>[d.id,d]));
  this.shelterDefs=new Map(data.rooms.flatMap(r=>(r.shelters||[]).map(h=>[h.id,{...h,room:r.id}])));
  this.surveyDefs=new Map(data.rooms.flatMap(r=>(r.surveys||[]).map(v=>[v.id,{...v,room:r.id}])));
  this.actorDefs=new Map((data.actors||[]).map(v=>[v.id,v]));
  this.topicIds=new Set((data.actors||[]).flatMap(v=>v.topics.map(t=>v.id+':'+t.id)));
  this.systemDefs=data.shipSystems||{circuits:[],terminals:[],cameras:[],speakers:[],capacity:3,costs:{lights:2,cameras:1,speakers:1}};
  this.settings={difficulty:options.difficulty||'standard'};this.reset(this.settings.difficulty);
 }
 transient(){this.events=[];this.paused=false;this.cooldown=0;this.damageGrace=0;this.reloadTime=0;this.jumpVelocity=0;this.hold=null;this.healing=0;this.noises=[];this.lures=[];this.noiseSerial=0;this.stepClock=0;this.keys={};this.dead=false;this.motion={moving:false,crouch:false,run:false};this.work=null;this.scanning=null;this.conversation=null;this.aim=null;this.networkSession=null;this.isolating=null;this.rotating=null;this.detector=false;this.grip=null;this.freightNoiseClock=0;this.freightBlocked=false;}
 reset(difficulty='standard'){
  difficulty=['explorer','standard','survival'].includes(difficulty)?difficulty:'standard';
  this.state={schema:1,revision:10,difficulty,room:'cryo',player:{x:160,z:.5,y:0,hp:100,stamina:100,facing:1},ammo:10,reserve:difficulty==='survival'?24:48,weapon:false,
   actions:[],visited:['cryo'],codex:['daniels','walter','tennessee','canon','spaces','credits','fieldcraft','attention','thresholds','hiding','maintenance','routing','surveys','voices','defense','surveillance','power-budget','network-flight','crawl-routes','fan-isolation','duct-pursuit'],
   enemies:{},collected:[],observed:[],inventory:{medkit:0,decoy:0},flashlight:true,sequence:null,doors:Object.fromEntries([...this.doorDefs].map(([id,d])=>[id,{open:d.open!==false,amount:d.open!==false?1:0,stress:0}])),hidden:null,workProgress:{},surveyProgress:{},surveys:[],contacts:[],crew:{},shoveDelay:0,exposure:0,complete:false,time:0,
   stats:{shots:0,hits:0,deaths:0,steps:0,diversions:0,heals:0,evaded:0,crossings:0,doorsForced:0,hides:0,repairs:0,surveys:0,conversations:0,shoves:0}};
  this.state.arsenal=FIDELITY.fresh(this.data);this.state.freight=FREIGHT.fresh(this);this.state.atmosphere=ATMO.fresh(this);this.state.network=NETWORK.fresh(this);this.state.maintenance=MAINT.fresh(this);this.state.archaeology=ARCHAEO.fresh(this);this.transient();this.ensureRoomEnemies();this.ensureCrew();this.checkpoint=clone(this.state);return this.state;
 }
 currentWeapon(){return FIDELITY.current(this);}
 switchWeapon(id=null){return FIDELITY.switchWeapon(this,id);}
 appearance(actor=this.state.player,role='daniels'){return FIDELITY.appearance(this,actor,role);}
 get room(){return this.rooms.get(this.state.room)}
 get shoveCooldown(){return this.state.shoveDelay||0}
 set shoveCooldown(value){this.state.shoveDelay=value;}
 get maxHealth(){return 100}
 get required(){return this.room.actions.filter(a=>a.required)}
 get objective(){return this.room.actions.find(a=>!this.done(a.id))||null}
 get busy(){return !!this.state.sequence}
 done(id){return this.state.actions.includes(id)}
 roomDone(id){return this.rooms.get(id).actions.filter(a=>a.required).every(a=>this.done(a.id))}
 emit(type,text='',extra={}){this.events.push({type,text,...extra});if(this.events.length>60)this.events.shift();}
 drainEvents(){return this.events.splice(0)}
 enemy(def){return {...clone(def),room:this.enemyDefs.get(def.id)?.room||this.state.room,pursuit:null,homeX:def.x,homeZ:def.z,y:0,phase:'idle',timer:0,stun:0,alive:true,lastSeen:null,search:0,notice:0,lastNoise:0,nav:[],navClock:0,attack:null,hit:false};}
 ensureRoomEnemies(){for(const def of this.room.enemies)if(!this.state.enemies[def.id])this.state.enemies[def.id]=this.enemy(def);}
 enemies(){return Object.values(this.state.enemies).filter(e=>e.room===this.state.room)}
 unlock(id){if(this.codexIds.has(id)&&!this.state.codex.includes(id))this.state.codex.push(id)}
 export(){return {format:'ATF-COVENANT',version:1,revision:10,state:clone(this.state),checkpoint:clone(this.checkpoint)}}
 sanitize(s){
  if(!s||s.schema!==1||!this.rooms.has(s.room))throw new Error('Sauvegarde Covenant incompatible.');
  const r=this.rooms.get(s.room),p=s.player||{};
  const base={schema:1,revision:10,room:s.room,player:{x:clamp(+p.x,40,r.width-40),z:r.view==='side'?.5:clamp(+p.z,.08,.92),y:0,hp:clamp(+p.hp,1,100),stamina:clamp(+p.stamina,0,100),facing:p.facing===-1?-1:1}};
  const overlaps=(x,z)=>r.props.some(o=>o.solid&&Math.abs(x-o.x)<o.w/2+19&&Math.abs(z-o.z)<.145);
  if(overlaps(base.player.x,base.player.z)){
   const origin=base.player.x;let found=false;
   for(let n=1;n<Math.ceil(r.width/20)&&!found;n++)for(const sign of [-1,1]){const x=clamp(origin+sign*n*20,40,r.width-40);if(!overlaps(x,base.player.z)){base.player.x=x;found=true;break;}}
   if(!found)throw new Error('Aucun point de reprise sûr dans ce lieu.');
  }
  const clean=(arr,ids)=>[...new Set(Array.isArray(arr)?arr.filter(x=>ids.has(x)):[])];
  base.actions=clean(s.actions,this.actionIds);base.visited=[...new Set([...clean(s.visited,this.rooms),s.room])];base.codex=clean(s.codex,this.codexIds);
  base.collected=clean(s.collected,this.supplyDefs);base.observed=clean(s.observed,this.observationIds);
  base.inventory={medkit:Math.floor(clamp(+s.inventory?.medkit,0,20)),decoy:Math.floor(clamp(+s.inventory?.decoy,0,30))};
  base.shoveDelay=clamp(+s.shoveDelay,0,1.5);base.flashlight=s.flashlight!==false;base.ammo=Math.floor(clamp(+s.ammo,0,10));base.reserve=Math.floor(clamp(+s.reserve,0,500));base.exposure=clamp(+s.exposure,0,99);base.time=clamp(+s.time,0,1e7);
  base.arsenal=FIDELITY.sanitize(this.data,s.arsenal,base);base.ammo=Math.floor(clamp(+s.ammo,0,FIDELITY.current(this,base).capacity));base.arsenal.clips[base.arsenal.selected]=base.ammo;
  base.weapon=base.actions.includes('landing-a1');base.complete=base.actions.includes('returncryo-a2');
  base.difficulty=['explorer','standard','survival'].includes(s.difficulty)?s.difficulty:'standard';
  base.stats={};for(const k of ['shots','hits','deaths','steps','diversions','heals','evaded','crossings','doorsForced','hides','repairs','surveys','conversations','shoves'])base.stats[k]=clamp(+s.stats?.[k],0,1e8);
  base.doors={};for(const [id,def] of this.doorDefs){const v=s.doors?.[id],unlocked=!def.unlockAction||base.actions.includes(def.unlockAction);const open=unlocked&&(typeof v?.open==='boolean'?v.open:def.open!==false);base.doors[id]={open,amount:unlocked?clamp(v&&Number.isFinite(v.amount)?v.amount:open?1:0,0,1):0,stress:clamp(+v?.stress,0,def.breakTime||0)};}
  base.workProgress={};for(const r of this.rooms.values())for(const a of r.actions)if(a.duration&&Number.isFinite(s.workProgress?.[a.id]))base.workProgress[a.id]=base.actions.includes(a.id)?1:clamp(s.workProgress[a.id],0,.999);
  base.hidden=null;const hide=this.shelterDefs.get(s.hidden?.id);if(hide&&hide.room===base.room&&dist(base.player,hide)<130){base.hidden={id:hide.id,room:hide.room,knownBy:clean(s.hidden.knownBy,this.enemyDefs)};base.player.x=hide.x;base.player.z=r.view==='side'?.5:hide.z;}
  base.enemies={};for(const original of this.rooms.values())for(const e of original.enemies){const v=s.enemies?.[e.id];if(!v)continue;
   const group=(this.data.huntGroups||[]).find(g=>g.enemy===e.id),room=this.rooms.get(group?.rooms.includes(v.room)?v.room:original.id);
   const at=point=>point&&Number.isFinite(point.x)&&Number.isFinite(point.z)?{x:clamp(point.x,40,room.width-40),z:room.view==='side'?.5:clamp(point.z,.08,.92)}:null;
   const phases=['idle','chase','investigate','search','windup','lunge','recover','dead','retreated'];
   const entry={...this.enemy(e),room:room.id,x:clamp(+v.x,50,room.width-50),z:room.view==='side'?.5:clamp(+v.z,.08,.92),hp:clamp(+v.hp,0,e.hp),alive:!!v.alive&&+v.hp>0,facing:v.facing===1?1:-1,
    homeX:clamp(Number.isFinite(v.homeX)?v.homeX:v.x,50,room.width-50),homeZ:room.view==='side'?.5:clamp(Number.isFinite(v.homeZ)?v.homeZ:v.z,.08,.92),phase:phases.includes(v.phase)?v.phase:'idle',lastSeen:at(v.lastSeen),notice:clamp(+v.notice,0,5),search:clamp(+v.search,0,5),timer:clamp(+v.timer,0,5),attack:at(v.attack),stun:clamp(+v.stun,0,2),hit:v.hit===true};
   if(['windup','lunge'].includes(entry.phase)&&!entry.attack){entry.phase='investigate';entry.timer=0;}if(!entry.alive)entry.phase=v.phase==='retreated'?'retreated':'dead';
   // A route is accepted only for the same specimen and a real paired, permitted complex.
   const q=v.pursuit,exit=q&&room.exits.find(x=>x.id===q.exitId&&x.to===q.to),reverse=exit&&this.rooms.get(exit.to)?.exits.find(x=>x.to===room.id);
   if(entry.alive&&group&&exit&&reverse&&group.rooms.includes(room.id)&&group.rooms.includes(exit.to)&&!exit.travel){entry.pursuit={from:room.id,to:exit.to,exitId:exit.id,reverseId:reverse.id,...(q.reason==='sound'?{reason:'sound',speaker:q.speaker}:{})};}
   base.enemies[e.id]=entry;
  }
  base.surveys=clean(s.surveys,this.surveyDefs);base.contacts=clean(s.contacts,this.topicIds);
  base.surveyProgress={};for(const [id,def] of this.surveyDefs){if(base.surveys.includes(id))base.surveyProgress[id]=1;else if(Number.isFinite(s.surveyProgress?.[id]))base.surveyProgress[id]=clamp(s.surveyProgress[id],0,.999);}
  base.crew={};for(const [id,def] of this.actorDefs){const v=s.crew?.[id];if(!v)continue;const room=this.rooms.get(def.room),point={x:clamp(+v.x,40,room.width-40),z:room.view==='side'?.5:clamp(+v.z,.08,.92)};
   // Crew is local to the authored route; import cannot move an actor to a different scene.
   if(this.collisionIn(room,point.x,point.z)||Math.min(...def.route.map(p=>dist(p,point)))>300){point.x=def.x;point.z=def.z;}
   base.crew[id]={id,x:point.x,z:point.z,room:def.room,y:0,facing:v.facing===1?1:-1,node:Math.floor(clamp(+v.node,0,def.route.length-1)),wait:clamp(+v.wait,0,4),phase:['idle','walk','caution'].includes(v.phase)?v.phase:'idle',nav:[],navClock:0};
  }
  base.stats.surveys=base.surveys.length;base.stats.conversations=base.contacts.length;
  base.sequence=null;const q=s.sequence;
  if(q&&q.room===r.id){const action=r.actions.find(a=>a.id===q.action&&['crane','airlock'].includes(a.kind));const e=r.enemies.find(e=>e.id===q.enemy&&e.kind==='xenomorph');
   if(action&&e&&!base.actions.includes(action.id)&&r.actions.slice(0,r.actions.indexOf(action)).every(a=>base.actions.includes(a.id))){
    const duration=action.kind==='crane'?5.6:7.2;
    base.sequence={kind:action.kind,room:r.id,action:action.id,enemy:e.id,duration,t:clamp(+q.t,0,duration-.001),x:clamp(+q.x,40,r.width-40),z:clamp(+q.z,.08,.92)};
    if(!base.enemies[e.id])base.enemies[e.id]=this.enemy(e);
    base.enemies[e.id].alive=true;base.enemies[e.id].phase='captured';
   }
  }
  // Old v0.1 saves had no equipment field: grant a modest, one-time compatible kit.
  if((Number(s.revision)||1)<2&&base.weapon){base.inventory.decoy=3;base.inventory.medkit=1;}
  base.atmosphere=ATMO.sanitize(this,s.atmosphere);
  base.archaeology=ARCHAEO.sanitize(this,s.archaeology);ARCHAEO.safeResume(this,base);
  base.maintenance=MAINT.sanitize(this,s.maintenance);MAINT.safeResume(this,base);
  base.network=NETWORK.sanitize(this,s.network,base);
  NETWORK.sanitizeSoundRoutes(this,base);
  base.freight=FREIGHT.sanitize(this,s.freight);FREIGHT.safeResume(this,base);
  return base;
 }
 import(payload){
  if(!payload||payload.format!=='ATF-COVENANT'||payload.version!==1)throw new Error('Ce fichier ne correspond pas à Covenant.');
  const s=this.sanitize(payload.state),c=this.sanitize(payload.checkpoint||payload.state);
  this.transient();this.state=s;this.checkpoint=c;this.damageGrace=1;this.ensureRoomEnemies();this.ensureCrew();NETWORK.ensureIntruder(this);return s;
 }
 exitPermitted(e){if(e.hydraulicGate&&!this.archaeologyStatus().open)return false;if(e.requiresEnding&&!this.state.complete)return false;if(e.requiresRoom&&!this.roomDone(e.requiresRoom))return false;if(e.requiresAction&&!this.done(e.requiresAction))return false;if(e.closedAfter&&this.state.visited.includes(e.closedAfter))return false;if(e.doorId&&!this.doorUnlocked(e.doorId))return false;return true}
 exitAvailable(e){if(this.busy||!this.exitPermitted(e))return false;const door=e.doorId&&this.state.doors[e.doorId];return !door||door.open&&door.amount>=.94;}
 doorUnlocked(id){const d=this.doorDefs.get(id);return !!d&&(!d.unlockAction||this.done(d.unlockAction));}
 doorReason(e){if(e.hydraulicGate&&!this.archaeologyStatus().open)return this.archaeologyStatus().phase==='idle'?'Réglez les couronnes puis actionnez le déversoir.':'Attendez la vidange, puis la levée complète de la dalle.';if(e.doorId&&!this.doorUnlocked(e.doorId))return 'Le verrou se libère de l’autre côté.';if(e.requiresAction&&!this.done(e.requiresAction))return 'Le mécanisme doit être rétabli avant ce passage.';if(e.closedAfter&&this.state.visited.includes(e.closedAfter))return 'Nous ne pouvons plus revenir en arrière.';if(e.requiresEnding&&!this.state.complete)return 'La réserve reste verrouillée.';return 'Terminez les préparatifs de ce lieu avant de poursuivre.';}
 toggleDoor(id=null){if(this.grip)return false;if(this.networkSession)return false;if(this.dead||this.paused||this.busy||this.state.hidden||this.state.player.y>25)return false;const exit=this.room.exits.filter(e=>e.doorId&&(!id||e.doorId===id)&&this.distance(e)<165).sort((a,b)=>this.distance(a)-this.distance(b))[0];if(!exit)return false;if(!this.exitPermitted(exit)){this.emit('hint',this.doorReason(exit));return false;}const door=this.state.doors[exit.doorId];door.open=!door.open;this.noise(exit.x,exit.z,440,'door');this.emit('door',door.open?'Le verrou se retire.':'Fermeture engagée. Elle ne retiendra pas indéfiniment l’intrus.',{id:exit.doorId,open:door.open});return true;}
 nearestShelter(){return (this.room.shelters||[]).filter(h=>this.distance(h)<105).sort((a,b)=>this.distance(a)-this.distance(b))[0]||null;}
 leaveShelter(){if(!this.state.hidden)return false;this.state.hidden=null;this.emit('hiding','Vous quittez l’abri.');return true;}
 toggleShelter(){if(this.grip)return false;if(this.networkSession)return false;if(this.paused||this.dead||this.busy||this.state.player.y>25)return false;if(this.state.hidden)return this.leaveShelter();const h=this.nearestShelter();if(!h)return false;this.stowDetector();const knownBy=this.enemies().filter(e=>e.alive&&this.sees(e)).map(e=>e.id);this.state.hidden={id:h.id,room:this.room.id,knownBy};this.state.player.x=h.x;this.state.player.z=this.room.view==='side'?.5:h.z;this.work=null;this.cancelSurvey();this.healing=0;this.state.stats.hides++;this.unlock('hiding');this.emit('hiding',knownBy.length?'Votre entrée a été vue. Cette cachette n’est pas sûre.':'Vous vous glissez à l’abri. Restez à l’écoute.');return true;}
 hazardsAt(p=this.state.player){return [...ARCHAEO.waterAt(this,p),...(this.room.hazards||[]).filter(h=>(!h.disabledBy||!this.done(h.disabledBy))&&Math.abs(p.x-h.x)<h.w/2&&Math.abs(p.z-h.z)<.18&&p.y<65)];}
 cancelWork(){this.cancelArchaeology();this.cancelIsolation();if(!this.work)return;this.work=null;this.emit('hint','Réglage interrompu. L’avancement est conservé.');}
 beginPursuit(to){const exit=this.room.exits.find(x=>x.to===to),reverse=this.rooms.get(to)?.exits.find(x=>x.to===this.room.id);if(!exit||!reverse||exit.travel||this.distance(exit)>125)return;
  for(const e of this.enemies()){const group=(this.data.huntGroups||[]).find(g=>g.enemy===e.id);if(!group||!group.rooms.includes(this.room.id)||!group.rooms.includes(to)||!e.alive||e.phase==='captured'||!this.sees(e))continue;
   e.pursuit={from:this.room.id,to,exitId:exit.id,reverseId:reverse.id};e.lastSeen={x:exit.x,z:exit.z};e.phase='investigate';e.attack=null;e.nav=[];e.navClock=0;this.unlock('pursuit');this.emit('pursuit','Le prédateur a vu le passage que vous avez emprunté.');
  }
 }
 updateThresholds(dt){
  for(const [id,door] of Object.entries(this.state.doors)){door.amount=clamp(door.amount+(door.open?1:-1)*dt*1.5,0,1);if(door.open&&door.amount===1)door.stress=Math.max(0,door.stress-dt*.4);}
  for(const e of Object.values(this.state.enemies)){if(!e.pursuit)continue;if(!e.alive||e.phase==='captured'){e.pursuit=null;continue;}const q=e.pursuit,room=this.rooms.get(q.from),exit=room?.exits.find(x=>x.id===q.exitId),target=this.rooms.get(q.to),reverse=target?.exits.find(x=>x.id===q.reverseId);
   if(!exit||!reverse||!this.exitPermitted(exit)){e.pursuit=null;e.phase='search';e.search=3.3;continue;}
   if(e.room===this.room.id&&this.sees(e)){e.pursuit=null;e.phase='chase';e.lastSeen={x:this.state.player.x,z:this.state.player.z};continue;}
   e.y=Math.max(0,(e.y||0)-dt*280);const far=dist(e,exit);if(far>26){this.moveEnemy(e,exit,PROFILE[e.kind].speed*.95,dt,room);continue;}
   const door=exit.doorId&&this.state.doors[exit.doorId],def=exit.doorId&&this.doorDefs.get(exit.doorId);
   if(q.reason==='sound'&&door&&(!door.open||door.amount<.94)){e.pursuit=null;e.phase='search';e.search=3.3;continue;}
   if(door&&(!door.open||door.amount<.94)){
    if(!door.open&&def.breakTime){const first=door.stress===0;door.stress+=dt;if(first&&(this.room.id===q.from||this.room.id===q.to))this.emit('pursuit','Des coups résonnent contre la fermeture.',{door:exit.doorId});if(door.stress>=def.breakTime){door.open=true;door.stress=0;this.state.stats.doorsForced++;if(this.room.id===q.from||this.room.id===q.to)this.emit('door','La fermeture cède. Le passage se rouvre.',{id:exit.doorId});}}
    continue;
   }
   const arrival=this.arrivalPoint(target,reverse,65);e.room=target.id;e.x=arrival.x;e.z=arrival.z;e.y=0;e.homeX=e.x;e.homeZ=e.z;const speaker=q.reason==='sound'&&this.systemDefs.speakers.find(s=>s.id===q.speaker&&s.room===target.id);e.lastSeen=speaker?{x:speaker.x,z:speaker.z}:this.arrivalPoint(target,reverse,160);e.phase='recover';e.timer=.9;e.notice=0;e.search=0;e.pursuit=null;e.nav=[];e.navClock=0;e.lastNoise=0;this.state.stats.crossings++;
   if(this.room.id===target.id)this.emit('pursuit','Un mouvement franchit le seuil derrière vous.',{enemy:e.id});
  }
 }
 arrivalPoint(room,exit,padding=120){const point={x:exit?clamp(exit.x+(exit.x<room.width/2?padding:-padding),40,room.width-40):160,z:room.view==='side'?.5:exit?.z??.5};const origin=point.x;if(this.collisionIn(room,point.x,point.z))for(let n=1;n<Math.ceil(room.width/20);n++){let found=false;for(const sign of [-1,1]){const x=clamp(origin+sign*n*20,40,room.width-40);if(!this.collisionIn(room,x,point.z)){point.x=x;found=true;break;}}if(found)break;}return point;}

 enter(target,from=this.state.room){
  if(!this.rooms.has(target))throw new Error('Pièce inconnue.');if(this.busy)return false;
  this.releaseFreight();const r=this.rooms.get(target),reverse=r.exits.find(e=>e.to===from);this.beginPursuit(target);this.stowDetector();this.endNetwork();this.isolating=null;this.rotating=null;this.state.hidden=null;this.work=null;this.scanning=null;this.conversation=null;this.aim=null;this.state.room=target;
  const p=this.state.player;p.x=reverse?clamp(reverse.x+(reverse.x<r.width/2?120:-120),100,r.width-100):160;
  p.z=r.view==='side'?.5:reverse?.z??.5;p.y=0;this.jumpVelocity=0;p.facing=p.x<r.width/2?1:-1;
  // Architectural seams have collision-tested arrival positions.
  if(this.collides(p.x,p.z)){for(let n=1;n<90;n++){const x=clamp(p.x+(n%2?1:-1)*n*20,40,r.width-40);if(!this.collides(x,p.z)){p.x=x;break;}}}
  if(!this.state.visited.includes(target))this.state.visited.push(target);if(r.crawl)this.unlock('crawl-routes');if(r.archaeology)this.unlock('water-memory');if(r.atmosphere){this.unlock('air-colonies');this.unlock('air-wind');}
  this.hold=null;this.healing=0;this.damageGrace=1.2;this.cooldown=0;this.reloadTime=0;this.noises=[];this.lures=[];this.stepClock=0;
  this.ensureRoomEnemies();this.ensureCrew();NETWORK.ensureIntruder(this);for(const e of this.enemies()){e.nav=[];e.navClock=0;e.lastNoise=0;}
  this.checkpoint=clone(this.state);this.emit('room',r.name,{room:target});return true;
 }
 distance(o){return dist(this.state.player,o)}
 nearest(){
  const stone=this.nearestArchaeology();const panel=this.nearestIsolation();const items=[...(stone?[stone]:[]),...(panel?[panel]:[]),...this.room.actions.filter(a=>!this.done(a.id)).map(a=>({...a,type:'action'})),
   ...(this.room.supplies||[]).filter(s=>!this.state.collected.includes(s.id)).map(s=>({...s,type:'supply'})),
   ...this.room.exits.map(e=>({...e,type:'exit',label:e.travel==='descente'?'Embarquer pour la surface':e.travel==='remontee'?'Rejoindre le Covenant':this.rooms.get(e.to).name}))];
  return items.filter(o=>this.distance(o)<115).sort((a,b)=>this.distance(a)-this.distance(b))[0]||null;
 }
 interact(){if(this.grip)return false;if(this.networkSession)return false;
  if(this.dead||this.paused||this.busy||this.state.player.y>25)return false;if(this.state.hidden){this.emit('hint','Quittez l’abri avant de manipuler le matériel.');return false;}
  const t=this.nearest();if(!t){this.emit('hint','Rien à portée de main.');return false;}
  if(t.type==='stone-ring'||t.type==='sluice-lever')return this.beginArchaeology(t.id);
  if(t.type==='isolation')return this.beginIsolation(t.fan);
  if(t.type==='supply')return this.collect(t.id);
  if(t.type==='exit'){
   if(!this.exitPermitted(t)){this.emit('hint',this.doorReason(t));return false;}
   if(t.doorId&&!this.state.doors[t.doorId].open){this.toggleDoor(t.doorId);return false;}
   if(!this.exitAvailable(t)){this.emit('hint','Attendez l’ouverture complète du passage.');return false;}
   return this.enter(t.to);
  }return this.tryAction(t.id);
 }
 collect(id){if(this.grip)return false;if(this.networkSession)return false;
  const s=this.supplyDefs.get(id);if(!s||s.room!==this.state.room||this.distance(s)>=115||this.state.hidden||this.state.collected.includes(id)||this.paused||this.dead||this.busy)return false;
  this.cancelArchaeology();if(s.kind==='ammo')this.state.reserve=Math.min(500,this.state.reserve+s.amount);else this.state.inventory[s.kind]=Math.min(s.kind==='medkit'?20:30,this.state.inventory[s.kind]+s.amount);
  this.state.collected.push(id);this.unlock(s.kind==='medkit'?'care':s.kind==='decoy'?'diversion':'weapons');
  this.emit('supply',s.kind==='ammo'?`${s.amount} munitions récupérées.`:s.kind==='medkit'?`${s.amount} trousse${s.amount>1?'s':''} de soins récupérée${s.amount>1?'s':''}.`:`${s.amount} pièces pour faire diversion.`,{id:s.id});return true;
 }
 heal(){this.releaseFreight();this.stowDetector();if(this.networkSession)return false;if(this.paused||this.dead||this.busy||this.healing||!this.state.inventory.medkit||this.state.player.hp>=100||!this.grounded())return false;this.cancelWork();this.cancelSurvey();this.healing=1.6;this.emit('hint','Soins en cours. Restez immobile.');return true;}
 toggleLight(){if(this.networkSession)return false;if(this.paused||this.dead||this.busy)return false;this.state.flashlight=!this.state.flashlight;this.emit('light',this.state.flashlight?'Lampe allumée.':'Lampe éteinte.');return true;}
 noise(x,z,radius,kind='step'){const n={id:++this.noiseSerial,x,z,radius,kind,life:1.8};this.noises.push(n);ATMO.react(this,n);if(this.noises.length>18)this.noises.shift();return n;}
 throwDecoy(){if(this.grip)return false;if(this.detector)return false;if(this.room.crawl)return false;if(this.networkSession)return false;
  if(this.paused||this.dead||this.busy||this.state.hidden||!this.state.inventory.decoy||this.state.player.y>25)return false;
  this.cancelArchaeology();const p=this.state.player;this.state.inventory.decoy--;this.state.stats.diversions++;this.unlock('diversion');
  let target=clamp(p.x+p.facing*465,55,this.room.width-55);
  while(this.collides(target,p.z)&&Math.abs(target-p.x)>70)target-=p.facing*20;
  this.lures.push({x:p.x,z:p.z,start:p.x,target,t:0,landed:false});this.emit('throw','La pièce file vers l’autre passage.');return true;
 }
 tryAction(id,solution=null){if(this.grip)return false;this.stowDetector();this.cancelArchaeology();this.cancelIsolation();if(this.networkSession)return false;
  if(this.dead||this.paused||this.busy||this.state.hidden||this.state.player.y>25)return false;
  const a=this.room.actions.find(x=>x.id===id);if(!a||this.done(id)||this.distance(a)>115)return false;if(a.kind==='weaponitem'&&!this.done('landing-a1')){this.emit('hint','La dotation de l’expédition doit être validée avant cette réserve.');return false;}this.cancelSurvey();
  const prior=this.room.actions.slice(0,this.room.actions.indexOf(a)).find(x=>!this.done(x.id));if(prior){this.emit('hint','D’abord : '+prior.label.toLowerCase()+'.');return false;}
  if(a.duration){if(this.work?.id===a.id)return false;this.cancelSurvey();this.healing=0;this.work={id:a.id,duration:a.duration};this.state.workProgress[a.id]??=0;this.noise(a.x,a.z,500,'maintenance');this.emit('work','Réglage en cours. Restez immobile à proximité.');return true;}
  if(a.kind==='tune'&&(!Array.isArray(solution)||solution.some((v,i)=>v!==a.puzzle.target[i])||solution.length!==3)){this.emit('puzzle','Accorder les relais',{action:a.id,puzzle:a.puzzle});return false;}
  if(a.kind==='hold'){if(!this.hold){this.hold={id,remaining:12};this.noise(a.x,a.z,1350,'beacon');this.emit('hint','Signal émis. Tenez jusqu’à la réponse.');}return false;}
  if(['crane','airlock'].includes(a.kind)){
   const e=this.enemies().find(e=>e.kind==='xenomorph'&&e.alive);
   if(!e||Math.abs(e.x-a.x)>340||Math.abs(e.z-a.z)>.36){this.emit('hint','Attirez la créature dans la zone de capture, puis déclenchez le piège.');return false;}
   e.phase='captured';e.attack=null;e.nav=[];
   this.state.sequence={kind:a.kind,action:a.id,enemy:e.id,room:this.room.id,t:0,duration:a.kind==='crane'?5.6:7.2,x:e.x,z:e.z};
   this.healing=0;this.emit('sequence',a.kind==='crane'?'La pince est verrouillée. Tenez-vous au harnais.':'Baie isolée. Ouverture du sas extérieur.',{effect:a.kind});return true;
  }
  return this.finishAction(a);
 }
 finishAction(a){
  if(this.done(a.id))return false;this.state.actions.push(a.id);this.unlock(a.codex);NETWORK.ensureIntruder(this);
  if(a.duration){this.state.workProgress[a.id]=1;this.state.stats.repairs++;this.unlock('maintenance');this.emit('workComplete',a.text,{action:a.id});}
  if(a.kind==='unlock'){this.unlock('routing');this.emit('door',a.text,{action:a.id});}
  if(a.kind==='weaponitem'){FIDELITY.grant(this,a.equipment);this.emit('archive',a.text,{codex:'equipment-'+a.equipment});}
  if(a.kind==='weapon'){FIDELITY.grant(this,'f90');this.state.weapon=true;this.state.inventory.decoy+=3;this.state.inventory.medkit+=1;this.unlock('weapons');this.unlock('diversion');this.unlock('care');}
  if(a.kind==='memory')this.emit('story','Il ne se souvient pas de la cabane. Daniels recule. La capsule commence déjà à se refermer.');
  else if(a.kind==='ending'){this.state.complete=true;this.unlock('david');this.emit('ending','Daniels comprend. Ce n’est pas Walter. David referme la capsule et retourne à ses spécimens. Le Covenant reprend sa route vers Origae-6.');}
  else if(a.kind==='archive')this.emit('archive',a.text,{codex:a.codex});
  else if(!['hold','crane','airlock'].includes(a.kind))this.emit('action',a.kind==='power'?'Le mécanisme répond.':a.kind==='weapon'?'Matériel de sécurité récupéré.':'Liaison confirmée.',{action:a.id});
  return true;
 }
 grounded(){const p=this.state.player;return Math.abs(this.jumpVelocity)<.001&&(p.y===0||this.solidProps().some(o=>o.solid&&Math.abs(p.y-o.h)<.01&&Math.abs(p.x-o.x)<o.w/2+19&&Math.abs(p.z-o.z)<.145))}
 jump(){if(this.grip)return false;this.stowDetector();if(this.room.crawl)return false;if(this.networkSession)return false;if(this.paused||this.dead||this.busy||this.state.hidden||!this.grounded()||this.state.player.stamina<12)return false;this.cancelWork();this.cancelSurvey();this.jumpVelocity=420;this.state.player.stamina-=12;this.healing=0;return true;}
 reload(){if(this.grip)return false;if(this.detector)return false;if(this.room.crawl)return false;this.cancelArchaeology();this.cancelIsolation();if(this.networkSession)return false;if(!this.state.weapon||this.reloadTime||this.state.ammo>=this.currentWeapon().capacity||this.state.reserve<=0||this.paused||this.dead||this.busy)return false;this.cancelSurvey();this.reloadTime=this.currentWeapon().reload;this.emit('sound','reload');return true;}
 solidProps(room=this.room,state=this.state){return [...room.props.filter(o=>o.solid),...FREIGHT.solids(this,room,state)];}
 lineClear(a,b,height=90,room=this.room){return !this.solidProps(room).some(o=>o.h>=height&&FREIGHT.segmentHits(a,b,o));}

 fire(){if(this.grip)return false;if(this.detector)return false;if(this.room.crawl)return false;if(this.networkSession)return false;
  if(this.room.safePresentation||!this.state.weapon||this.paused||this.dead||this.busy||this.state.hidden||this.cooldown>0||this.reloadTime>0)return false;
  if(this.state.ammo<=0){this.cooldown=.35;this.emit('hint','Chargeur vide. Rechargez avec R.');return false;}
  this.healing=0;this.cancelWork();this.cancelSurvey();this.state.ammo--;this.state.stats.shots++;this.cooldown=this.currentWeapon().delay;const p=this.state.player;
  const trace=this.traceShot();const hit=trace.hit;
  if(this.aim)p.facing=Math.sign(this.aim.x-p.x)||p.facing;
  if(hit){
   this.state.stats.hits++;this.unlock(hit.kind==='neomorph'?'neo':hit.kind==='facehugger'?'hugger':'xeno');
   if(hit.kind==='xenomorph'){hit.stun=.38;const nx=clamp(hit.x+36*p.facing,50,this.room.width-50);if(!this.collides(nx,hit.z,hit.y))hit.x=nx;}
   else {hit.hp-=hit.kind==='facehugger'?Math.max(30,this.currentWeapon().damage):this.currentWeapon().damage;hit.stun=.22;if(hit.hp<=0){hit.alive=false;hit.phase='dead';this.emit('down','Le mouvement s’arrête.',{enemy:hit.id});}}
   if(hit.alive){hit.phase='chase';hit.lastSeen={x:p.x,z:p.z};hit.notice=4;hit.attack=null;}
  }
  this.noise(p.x,p.z,1700,'shot');this.emit('shot','',{x:p.x,z:p.z,face:p.facing,to:trace.end.x,toZ:trace.end.z,targetHeight:hit?(hit.kind==='facehugger'?20:95):(this.aim?.height||72),aimed:!!this.aim,hit:hit?.id||null,blocked:trace.blocked});return true;
 }

 // v0.4: point aiming is on the same x/z metric as movement, not screen-space homing.
 setAim(x,z,height=72){if(this.grip)return false;if(this.detector)return false;if(this.room.crawl)return false;if(this.networkSession)return false;if(this.paused||this.dead||this.busy||!Number.isFinite(x)||!Number.isFinite(z))return false;this.aim={x:clamp(x,0,this.room.width),z:this.room.view==='side'?.5:clamp(z,.08,.92),height:clamp(height,14,130)};return true;}
 clearAim(){this.aim=null;}
 traceShot(){
  const range=this.currentWeapon().range,p=this.state.player,aim=this.aim||{x:p.x+p.facing*range,z:p.z};let dx=aim.x-p.x,dz=(aim.z-p.z)*510,len=Math.hypot(dx,dz);
  if(len<1){dx=p.facing;dz=0;len=1;}const ux=dx/len,uz=dz/len,point=d=>({x:p.x+ux*d,z:p.z+uz*d/510});let wall=range;
  for(let d=8;d<=range;d+=8){const q=point(d);if(q.x<0||q.x>this.room.width||q.z<.06||q.z>.94||this.solidProps().some(o=>o.solid&&o.h>=90&&Math.abs(q.x-o.x)<o.w/2+5&&Math.abs(q.z-o.z)<.145)){wall=d;break;}}
  const candidates=this.enemies().filter(e=>e.alive&&e.phase!=='captured').map(e=>{const ex=e.x-p.x,ez=(e.z-p.z)*510;return {e,t:ex*ux+ez*uz,side:Math.abs(ex*uz-ez*ux)};});
  const candidate=candidates.filter(({e,t,side})=>t>0&&t<wall&&side<(this.aim?(e.kind==='facehugger'?28:e.kind==='neomorph'?36:42):.19*510)&&this.lineClear(p,e,90)).sort((a,b)=>a.t-b.t)[0];
  return {hit:candidate?.e||null,end:candidate?{x:candidate.e.x,z:candidate.e.z}:point(wall),blocked:!candidate&&wall<range};
 }
 shove(){if(this.grip)return false;if(this.detector)return false;if(this.room.crawl)return false;if(this.networkSession)return false;
  if(this.paused||this.dead||this.busy||this.state.hidden||!this.grounded()||this.shoveCooldown>0||this.state.player.stamina<38)return false;
  const p=this.state.player,foe=this.enemies().filter(e=>e.alive&&e.phase!=='captured'&&dist(p,e)<150&&(e.x-p.x)*p.facing>-12&&this.lineClear(p,e,40)).sort((a,b)=>dist(p,a)-dist(p,b))[0];
  if(!foe)return false;if(foe.kind==='xenomorph'){this.emit('hint','Trop massif pour être écarté. Gardez vos distances.');return false;}
  this.cancelSurvey();this.cancelWork();this.healing=0;p.stamina-=38;this.shoveCooldown=1.5;this.state.stats.shoves++;
  const dx=foe.x-p.x,dz=(foe.z-p.z)*510,len=Math.hypot(dx,dz)||1,ux=len===1?p.facing:dx/len,uz=dz/len,max=foe.kind==='facehugger'?145:90;
  for(let d=0;d<max;d+=8){const x=clamp(foe.x+ux*Math.min(8,max-d),40,this.room.width-40),z=this.room.view==='side'?.5:clamp(foe.z+uz*Math.min(8,max-d)/510,.08,.92);if(this.collides(x,z,0))break;foe.x=x;foe.z=z;}
  foe.phase='recover';foe.timer=foe.kind==='facehugger'?1.15:.65;foe.stun=0;foe.attack=null;foe.nav=[];foe.pursuit=null;
  this.noise(p.x,p.z,540,'shove');this.emit('shove','Un instant de répit. Reprenez vos distances.',{x:p.x,z:p.z,face:p.facing,enemy:foe.id});return true;
 }
 nearestSurvey(){return (this.room.surveys||[]).filter(v=>!this.state.surveys.includes(v.id)&&this.distance(v)<v.radius&&this.lineClear(this.state.player,v,80)).sort((a,b)=>this.distance(a)-this.distance(b))[0]||null;}
 startSurvey(id=null){if(this.grip)return false;this.stowDetector();if(this.networkSession)return false;if(this.paused||this.dead||this.busy||this.state.hidden||!this.grounded())return false;const v=this.surveyDefs.get(id||this.nearestSurvey()?.id);if(!v||v.room!==this.room.id||this.state.surveys.includes(v.id)||this.distance(v)>v.radius||!this.lineClear(this.state.player,v,80)||this.scanning===v.id)return false;this.cancelWork();this.healing=0;this.scanning=v.id;this.state.surveyProgress[v.id]??=0;this.emit('sampling','Relevé en cours. Restez immobile.',{id:v.id});return true;}
 cancelSurvey(){if(!this.scanning)return;this.scanning=null;this.emit('hint','Relevé interrompu. Le travail est conservé.');}
 ensureCrew(){for(const [id,d] of this.actorDefs)if(d.room===this.state.room&&!this.state.crew[id])this.state.crew[id]={id,room:d.room,x:d.x,z:d.z,y:0,facing:-1,node:0,wait:2,phase:'idle',nav:[],navClock:0};}
 crew(){return Object.values(this.state.crew).filter(a=>{const d=this.actorDefs.get(a.id);return d&&a.room===this.state.room&&(!d.untilVisited||!this.state.visited.includes(d.untilVisited))&&(!d.requiresVisited||this.state.visited.includes(d.requiresVisited));});}
 crewName(a){const d=this.actorDefs.get(a.id);return this.state.complete&&d.afterEndingName?d.afterEndingName:d.name;}
 crewRole(a){const d=this.actorDefs.get(a.id);return this.state.complete&&d.afterEndingRole?d.afterEndingRole:d.role;}
 updateCrew(dt){
  for(const a of this.crew()){const d=this.actorDefs.get(a.id),threat=this.enemies().some(e=>e.alive&&dist(e,a)<580&&this.lineClear(e,a,80));
   if(threat){a.phase='caution';continue;}if(this.distance(a)<175){a.phase='idle';a.facing=Math.sign(this.state.player.x-a.x)||a.facing;continue;}
   a.wait=Math.max(0,a.wait-dt);if(a.wait>0){a.phase='idle';continue;}const target=d.route[a.node];
   if(dist(a,target)<12){a.node=(a.node+1)%d.route.length;a.wait=2.4;a.phase='idle';}else{a.phase='walk';this.moveEnemy(a,target,d.speed,dt);}
  }
 }
 nearestCrew(){return this.crew().filter(a=>this.distance(a)<145&&this.lineClear(this.state.player,a,80)).sort((a,b)=>this.distance(a)-this.distance(b))[0]||null;}
 beginConversation(id=null){if(this.grip)return false;if(this.networkSession)return false;if(this.paused||this.dead||this.busy||this.state.hidden||!this.grounded())return null;const a=id?this.crew().find(a=>a.id===id):this.nearestCrew();if(!a||this.distance(a)>145||!this.lineClear(this.state.player,a,80))return null;
  if(this.enemies().some(e=>e.alive&&this.distance(e)<650&&this.lineClear(e,this.state.player,80))){this.emit('hint','Pas maintenant. La menace est trop proche.');return null;}
  this.stowDetector();this.cancelSurvey();this.cancelWork();this.healing=0;this.conversation=a.id;const d=this.actorDefs.get(a.id);return {id:a.id,speaker:this.crewName(a),greeting:this.state.complete&&d.afterEndingGreeting?d.afterEndingGreeting:d.greeting,topics:this.state.complete&&d.afterEndingGreeting?[]:d.topics};
 }
 chooseTopic(id){if(this.dead||this.busy||this.state.hidden)return null;const a=this.crew().find(a=>a.id===this.conversation);if(!a||this.distance(a)>150)return null;const d=this.actorDefs.get(a.id),t=d.topics.find(t=>t.id===id);if(!t||this.state.complete&&d.afterEndingGreeting)return null;const key=a.id+':'+t.id;
  if(!this.state.contacts.includes(key)){this.state.contacts.push(key);this.state.stats.conversations++;this.unlock(d.codex);this.emit('conversation','Échange conservé dans le carnet.',{id:key});}return {speaker:this.crewName(a),label:t.label,text:t.reply,id:key};
 }
 endConversation(){this.conversation=null;}
 collisionIn(room,x,z,y=0){return this.solidProps(room).some(o=>o.solid&&y<o.h&&Math.abs(x-o.x)<o.w/2+19&&Math.abs(z-o.z)<.145)}
 collides(x,z,y=0){return this.collisionIn(this.room,x,z,y)||MAINT.blocked(this,this.room,x,z,y)||ARCHAEO.blocked(this,this.room,x,z,y)}
 movePlayer(dx,dz){const p=this.state.player,r=this.room;const tx=clamp(p.x+dx,35,r.width-35),tz=r.view==='side'?.5:clamp(p.z+dz,.08,.92);if(!this.collides(tx,p.z,p.y)&&!MAINT.blocked(this,r,tx,p.z,p.y))p.x=tx;if(!this.collides(p.x,tz,p.y)&&!MAINT.blocked(this,r,p.x,tz,p.y))p.z=tz;}
 damage(amount,why){
  if(this.dead||this.damageGrace>0||this.busy)return;
  this.releaseFreight();this.stowDetector();if(this.networkSession)this.endNetwork('La console est abandonnée sous le choc.');
  const factor=this.state.difficulty==='explorer'?.55:this.state.difficulty==='survival'?1.25:1;
  this.state.player.hp=Math.max(0,this.state.player.hp-amount*factor);this.damageGrace=.85;this.healing=0;this.cancelWork();this.cancelSurvey();if(this.state.hidden)this.leaveShelter();this.emit('hurt',why);if(this.state.player.hp<=0)this.die(why);
 }
 die(why){if(this.dead)return;this.releaseFreight();this.stowDetector();this.endNetwork('Connexion interrompue.');this.dead=true;this.state.stats.deaths++;this.hold=null;this.healing=0;this.emit('death',why);}
 respawn(){const deaths=this.state.stats.deaths;this.state=clone(this.checkpoint);this.state.stats.deaths=deaths;this.state.player.hp=100;this.state.player.stamina=100;this.state.exposure=0;this.state.player.y=0;this.transient();this.damageGrace=1.5;this.ensureRoomEnemies();this.ensureCrew();this.emit('room',this.room.name);}
 // Coarse-grid A*, used only if a creature's direct route is blocked. No wall traversal in depth rooms.
 navigation(start,target,room=this.room){
  const r=room;if(r.view==='side')return [{x:target.x,z:.5}];
  const step=70,cols=Math.ceil((r.width-80)/step)+1,rows=9,key=(x,y)=>y*cols+x;
  const point=(x,y)=>({x:Math.min(r.width-40,40+x*step),z:.08+y*.105});
  const nearest=(p)=>({x:Math.round(clamp((p.x-40)/step,0,cols-1)),y:Math.round(clamp((p.z-.08)/.105,0,8))});
  let a=nearest(start),b=nearest(target);const initial=key(a.x,a.y),goal=key(b.x,b.y),open=[initial],score=new Map([[initial,0]]),parent=new Map(),closed=new Set();
  const valid=(x,y)=>x>=0&&x<cols&&y>=0&&y<rows&&!this.collisionIn(room,point(x,y).x,point(x,y).z);
  for(let loops=0;open.length&&loops<cols*rows;loops++){
   open.sort((i,j)=>{const metric=k=>score.get(k)+Math.hypot(k%cols-b.x,(Math.floor(k/cols)-b.y)*.77);return metric(i)-metric(j)});
   const current=open.shift();if(current===goal){const path=[];let n=current;while(n!==initial&&parent.has(n)){path.push(point(n%cols,Math.floor(n/cols)));n=parent.get(n);}return path.reverse();}
   closed.add(current);const x=current%cols,y=Math.floor(current/cols);
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
    const xx=x+dx,yy=y+dy,id=key(xx,yy);if(!valid(xx,yy)||closed.has(id)||dx&&dy&&(!valid(x+dx,y)||!valid(x,y+dy)))continue;
    const cost=score.get(current)+(dx&&dy?1.27:1);if(cost<(score.get(id)??Infinity)){score.set(id,cost);parent.set(id,current);if(!open.includes(id))open.push(id);}
   }
  }return [];
 }
 moveEnemy(e,target,speed,dt,room=this.room){
  if(room.crawl){speed=Math.min(speed,this.data.maintenance.enemyCrawlSpeed);e.y=0;}
  let aim=target;
  if(room.view==='depth'){
   e.navClock-=dt;
   if(!this.lineClear(e,target,1,room)&&e.navClock<=0){e.nav=this.navigation(e,target,room);e.navClock=.8;}
   if(this.lineClear(e,target,1,room))e.nav=[];
   while(e.nav?.length&&dist(e,e.nav[0])<23)e.nav.shift();
   if(e.nav?.length)aim=e.nav[0];
  }
  const dx=aim.x-e.x,dz=(aim.z-e.z)*510,length=Math.hypot(dx,dz)||1,amount=Math.min(length,speed*dt);
  if(Math.abs(dx)>3)e.facing=Math.sign(dx);
  const nx=clamp(e.x+dx/length*amount,40,room.width-40),nz=room.view==='side'?.5:clamp(e.z+dz/length*amount/510,.08,.92);
  if(MAINT.blocked(this,room,nx,nz,e.y)||ARCHAEO.blocked(this,room,nx,nz,e.y))return;
  if(this.collisionIn(room,nx,e.z,e.y)){
   if(room.view==='side'){e.y=105;e.x=nx;}
   else if(!this.collisionIn(room,e.x,nz,e.y))e.z=nz;
  }else{e.x=nx;if(!this.collisionIn(room,e.x,nz,e.y))e.z=nz;}
 }
 concealed(){if(this.state.hidden)return true;const p=this.state.player;if(!this.motion.crouch)return false;return this.room.props.some(o=>['wheat','reeds','fern'].includes(o.kind)&&Math.abs(p.x-o.x)<o.w/2+20&&Math.abs(p.z-o.z)<.19)||this.solidProps().some(o=>o.solid&&Math.abs(p.x-o.x)<o.w/2+100&&Math.abs(p.z-o.z)<.17);}
 sees(e){
  if(this.state.hidden&&!this.state.hidden.knownBy.includes(e.id))return false;
  const p=this.state.player,P=PROFILE[e.kind],distance=dist(e,p),hidden=this.concealed()&&!this.state.hidden?.knownBy.includes(e.id);
  const dark=['night','burning','crypt','workshop','necropolis'].includes(this.room.theme);
  const range=hidden?115:P.sight*(this.roomPower().lights||this.state.flashlight?1:.58)*(this.motion.crouch?.65:1)*(dark&&!this.state.flashlight?.72:1);
  return distance<range&&(distance<155||(p.x-e.x)*e.facing>-45)&&this.lineClear(e,p,this.motion.crouch?45:80);
 }
 updateEnemies(dt){
  const p=this.state.player;
  for(const e of this.enemies()){
   if(!e.alive||e.phase==='captured'||e.pursuit)continue;
   e.stun=Math.max(0,e.stun-dt);e.y=Math.max(0,e.y-240*dt);if(e.stun>0)continue;
   const P=PROFILE[e.kind];
   if(e.phase==='windup'){
    e.timer-=dt;if(e.timer<=0){e.phase='lunge';e.timer=P.lunge;e.hit=false;}continue;
   }
   if(e.phase==='lunge'){
    e.timer-=dt;if(e.attack)this.moveEnemy(e,e.attack,520,dt);
    if(!e.hit&&e.attack&&dist(p,e.attack)<88&&dist(p,e)<P.reach&&p.y<80&&this.lineClear(e,p,40)){this.damage(P.damage,'La créature vous a atteint.');e.hit=true;}
    if(e.timer<=0){if(!e.hit)this.state.stats.evaded++;e.phase='recover';e.timer=P.recovery;e.attack=null;}continue;
   }
   if(e.phase==='recover'){e.timer-=dt;if(e.timer>0)continue;e.phase='chase';}
   const visible=this.sees(e);
   if(visible){e.phase='chase';e.lastSeen={x:p.x,z:p.z};e.notice=2.3;e.search=0;if(dist(e,p)<450)this.unlock(e.kind==='neomorph'?'neo':e.kind==='facehugger'?'hugger':'xeno');}
   else {
    const heard=this.noises.filter(n=>n.id>e.lastNoise&&dist(e,n)<n.radius*P.hearing).sort((a,b)=>b.id-a.id)[0];
    if(heard){e.lastNoise=heard.id;e.lastSeen={x:heard.x,z:heard.z};e.phase='investigate';e.notice=0;e.search=0;e.nav=[];}
    else if(e.phase==='chase'){e.notice-=dt;if(e.notice<=0){e.phase='investigate';e.nav=[];}}
   }
   if(e.phase==='chase'&&visible&&dist(e,p)<P.reach*.82&&p.y<75){
    e.phase='windup';e.timer=P.windup;e.attack={x:p.x,z:p.z};e.facing=Math.sign(p.x-e.x)||e.facing;e.nav=[];this.emit('warning','',{enemy:e.id});continue;
   }
   if(['chase','investigate'].includes(e.phase)&&e.lastSeen){
    if(dist(e,e.lastSeen)>28)this.moveEnemy(e,e.lastSeen,P.speed*(e.phase==='investigate'?.8:1),dt);
    else if(!visible){e.phase='search';e.search=3.3;e.timer=0;}
   }else if(e.phase==='search'){
    e.search-=dt;e.timer+=dt;if(e.timer>.65){e.facing*=-1;e.timer=0;}if(e.search<=0){e.phase='idle';e.lastSeen=null;e.nav=[];}
   }else if(e.phase==='idle'){
    const target={x:clamp(e.homeX+Math.sin(this.state.time*.33)*(e.patrol||130),55,this.room.width-55),z:e.homeZ};this.moveEnemy(e,target,45,dt);
   }
  }
 }
 tick(dt,keys={}){
  if(this.paused||this.dead)return;dt=clamp(dt,0,.05);if(!dt)return;
  const s=this.state,p=s.player,r=this.room;s.time+=dt;
  if(this.networkSession){if(!this.validNetworkSession())this.endNetwork('Connexion interrompue : terminal hors de portée.');else keys={};}
  ATMO.tick(this,dt);NETWORK.tick(this,dt);MAINT.mechanics(this,dt);ARCHAEO.mechanics(this,dt);
  this.cooldown=Math.max(0,this.cooldown-dt);this.damageGrace=Math.max(0,this.damageGrace-dt);
  if(s.sequence){
   const q=s.sequence;q.t+=dt;this.motion={moving:false,crouch:false,run:false};
   if(q.t>=q.duration){const a=r.actions.find(a=>a.id===q.action),e=s.enemies[q.enemy];if(e){e.alive=false;e.hp=0;e.phase='captured';}s.sequence=null;this.finishAction(a);this.unlock(q.kind==='crane'?'crane':'airlock');this.emit('setpiece',q.kind==='crane'?'La pince se referme. Tennessee arrache le module à la tempête.':'Le véhicule emporte l’intrus dans le vide. La baie se referme.',{effect:q.kind});}
   return;
  }
  this.updateThresholds(dt);this.updateCrew(dt);this.shoveCooldown=Math.max(0,this.shoveCooldown-dt);
  if(this.reloadTime>0){this.reloadTime-=dt;if(this.reloadTime<=0){this.reloadTime=0;const n=Math.min(this.currentWeapon().capacity-s.ammo,s.reserve);s.ammo+=n;s.reserve-=n;}}
  const haul=FREIGHT.drive(this,dt,keys);if(haul)keys={};
  if(r.crawl)keys={...keys,crouch:true,run:false,fire:false};
  if(this.detector)keys={...keys,run:false,fire:false};
  const mx=(keys.right?1:0)-(keys.left?1:0),mz=r.view==='side'?0:(keys.down?1:0)-(keys.up?1:0),moving=!!(mx||mz),sprinting=!!(keys.run&&p.stamina>3&&!keys.crouch);
  this.motion={moving,crouch:!!keys.crouch,run:sprinting};
  if(this.state.hidden&&moving)this.leaveShelter();
  const surface=this.hazardsAt(),speed=(r.crawl?this.data.maintenance.crawlSpeed:keys.crouch?86:sprinting?282:178)*Math.min(1,...surface.map(h=>h.slow||1)),norm=r.view==='depth'&&mx&&mz?Math.SQRT1_2:1;
  if(this.aim)p.facing=Math.sign(this.aim.x-p.x)||p.facing;else if(mx)p.facing=mx;const previousX=p.x,previousZ=p.z;this.movePlayer(mx*speed*dt*norm,mz*speed*dt*norm/450);const moved=!!haul?.moved||Math.hypot(p.x-previousX,(p.z-previousZ)*450)>.01;this.motion.moving=moved;this.motion.run=sprinting&&moved;this.motion.haul=!!haul;this.motion.haulMoving=!!haul?.moved;s.stats.steps+=(haul?.distance||0)+Math.hypot(p.x-previousX,(p.z-previousZ)*450);
  p.stamina=clamp(p.stamina+(haul?.moved?-this.data.freight.staminaRate:sprinting&&moved?-24:14)*dt,0,100);
  if(haul&&p.stamina<=0){this.releaseFreight();this.emit("hint","Plus de souffle. Les freins retiennent la charge ; reprenez votre respiration.");}
  MAINT.work(this,dt,moved);ARCHAEO.work(this,dt,moved||!!keys.fire);
  if(moved&&this.work)this.cancelWork();if(moved&&this.scanning)this.cancelSurvey();
  if(this.work){const a=r.actions.find(a=>a.id===this.work.id);if(!a||this.distance(a)>115||keys.fire)this.cancelWork();else{const progress=(s.workProgress[a.id]||0)+dt/a.duration;s.workProgress[a.id]=Math.min(1,progress);if(progress>=1){this.work=null;this.finishAction(a);}}}
  if(this.scanning){const v=this.surveyDefs.get(this.scanning);if(!v||v.room!==r.id||this.distance(v)>v.radius||!this.grounded()||keys.fire||!this.lineClear(p,v,80))this.cancelSurvey();else{const progress=(s.surveyProgress[v.id]||0)+dt/v.duration;s.surveyProgress[v.id]=Math.min(1,progress);if(progress>=1){this.scanning=null;if(!s.surveys.includes(v.id)){s.surveys.push(v.id);s.stats.surveys++;this.unlock(v.codex);this.emit('survey','Relevé enregistré : '+v.label,{id:v.id,codex:v.codex});}}}}
  if(moved&&this.healing){this.healing=0;this.emit('hint','Soins interrompus. La trousse est conservée.');}
  if(this.healing>0){this.healing-=dt;if(this.healing<=0){this.healing=0;s.inventory.medkit--;p.hp=Math.min(100,p.hp+42);s.stats.heals++;this.emit('healed','Pansement en place.',{amount:42});}}
  this.stepClock+=dt;if(moved&&!haul&&this.stepClock>.42){this.stepClock=0;if(surface.some(h=>h.kind==='water'))this.noise(p.x,p.z,keys.crouch?130:410,'splash');else if(!keys.crouch)this.noise(p.x,p.z,sprinting?660:180,'step');}
  for(const h of this.hazardsAt())if(h.staminaRate)p.stamina=Math.max(0,p.stamina-h.staminaRate*dt);
  const oldY=p.y;this.jumpVelocity-=1080*dt;let nextY=Math.max(0,p.y+this.jumpVelocity*dt);
  if(this.jumpVelocity<=0){const tops=this.solidProps(r).filter(o=>o.solid&&oldY>=o.h-.01&&nextY<=o.h&&Math.abs(p.x-o.x)<o.w/2+19&&Math.abs(p.z-o.z)<.145).map(o=>o.h);if(tops.length){nextY=Math.max(...tops);this.jumpVelocity=0;}}
  p.y=nextY;if(p.y===0)this.jumpVelocity=0;
  if(keys.fire)this.fire();
  const exposureRate=ATMO.rateAt(this),risk=exposureRate>0;
  s.exposure=clamp(s.exposure+(risk?exposureRate:-9)*dt,0,100);if(risk)this.unlock('exposure');if(s.exposure>=100)this.die('Contamination confirmée. La tentative s’arrête ici.');
  if(r.props.some(o=>o.kind==='fire'&&Math.abs(p.x-o.x)<o.w/2&&Math.abs(p.z-o.z)<.16&&p.y<75))this.damage(14,'Le passage est en feu.');
  for(const l of this.lures){l.t+=dt;l.x=l.start+(l.target-l.start)*Math.min(1,l.t/.65);if(l.t>=.65&&!l.landed){l.landed=true;this.noise(l.x,l.z,1300,'decoy');this.emit('clink','',{x:l.x,z:l.z});}}
  this.lures=this.lures.filter(l=>l.t<3);for(const n of this.noises)n.life-=dt;this.noises=this.noises.filter(n=>n.life>0);
  this.updateEnemies(dt);NETWORK.updateRemote(this,dt);
  if(this.hold&&!this.dead){
   this.hold.remaining-=dt;
   if(this.hold.remaining<=0){const a=r.actions.find(a=>a.id===this.hold.id);if(a&&!this.done(a.id)){this.finishAction(a);for(const e of this.enemies()){e.alive=false;e.hp=0;e.phase='retreated';}this.emit('flare','Une fusée déchire la nuit. Suivez David.');}this.hold=null;}
  }
  for(const o of r.observations||[])if(!s.observed.includes(o.id)&&Math.abs(p.x-o.x)<o.radius){s.observed.push(o.id);this.emit('observation',o.text,{id:o.id});}
 }
}
Object.assign(CovenantEngine.prototype,NETWORK.methods,MAINT.methods,ARCHAEO.methods,ATMO.methods,FREIGHT.methods);
const API={CovenantEngine,clamp,PROFILE};if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.CovenantCore=API;
})(globalThis);
