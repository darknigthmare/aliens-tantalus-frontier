import { EARTH_DATA } from './alien-earth-data.js';

const V4_MODES = new Set(EARTH_DATA.powerModes.map(m => m.id));
const V4_ENEMIES=Object.fromEntries(EARTH_DATA.rooms.flatMap(r=>r.enemies.map(e=>[e.id,e])));
const V4_CAMERA = Object.fromEntries(EARTH_DATA.cameras.map(c => [c.id,c]));
const V4_SCRAP = new Set(EARTH_DATA.rooms.flatMap(r => r.interactables.filter(i=>i.kind==='scrap').map(i=>i.id)));
const v4Finite = (n,min,max,fallback=0) => Number.isFinite(n) ? Math.max(min,Math.min(max,n)) : fallback;
const v4DefaultStats = () => ({switches:0,crafts:0,repairs:0,captures:0,lifts:0,medicalEvacs:0});
export function initialServicesV4(){
 return {parts:0,salvaged:[],circuits:Object.fromEntries(EARTH_DATA.networks.map(n=>[n.id,'work'])),repairedDoors:[],cameraFrames:{},carryId:null,serviceStats:v4DefaultStats()};
}
/** Untrusted JSON is bounded independently of V1–V3 fields. Gestures are never restored. */
export function upgradeServicesV4(s,raw,rooms,doorKeys){
 Object.assign(s,initialServicesV4());s.schema=4;s.version=EARTH_DATA.version;
 if(raw.schema<4)return s;
 s.parts=Math.floor(v4Finite(raw.parts,0,24));
 s.salvaged=[...new Set((Array.isArray(raw.salvaged)?raw.salvaged:[]).filter(id=>V4_SCRAP.has(id)))];
 s.repairedDoors=[...new Set((Array.isArray(raw.repairedDoors)?raw.repairedDoors:[]).filter(id=>doorKeys.has(id)))];
 for(const n of EARTH_DATA.networks)if(V4_MODES.has(raw.circuits?.[n.id]))s.circuits[n.id]=raw.circuits[n.id];
 for(const key of Object.keys(s.serviceStats))s.serviceStats[key]=Math.floor(v4Finite(raw.serviceStats?.[key],0,999999));
 const f=s.survivors[raw.carryId];
 if(f&&f.status==='down'&&f.hp<=0&&f.room===s.room&&Math.abs(f.x-s.player.x)<110&&Math.abs(f.z-s.player.z)<45){s.carryId=f.id;f.x=s.player.x;f.z=s.player.z;}
 for(const cam of EARTH_DATA.cameras){
  const frame=raw.cameraFrames?.[cam.id],r=rooms[cam.room];
  if(!frame||frame.room!==cam.room||!Number.isFinite(frame.time)||frame.time<0||frame.time>s.playSeconds)continue;
  const points=(Array.isArray(frame.points)?frame.points:[]).slice(0,20).filter(p=>p&&['organism','person'].includes(p.type)&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&p.x>=35&&p.x<=r.width-35&&p.z>=25&&p.z<=225).map(p=>({x:p.x,z:p.z,type:p.type,heavy:p.heavy===true,confined:p.confined===true}));
  const closedGate=frame.closedGate===true&&!!r.gate;
  s.cameraFrames[cam.id]={camera:cam.id,room:cam.room,time:frame.time,points,closedGate,powered:frame.powered===true};
 }
 return s;
}

/** Additive services. The base engine retains room navigation, combat and story authority. */
export function withEarthServicesV4(Base, dependencies){
 const {ROOM_BY_ID,near,visible,blocked,doorKey,clone,roomWithState}=dependencies;
 return class EarthServicesEngine extends Base {
  constructor(state=null){super(state);this.serviceAction=null;this.serviceHint='';this.syncCarried();}
  get network(){return EARTH_DATA.networks.find(n=>n.id===this.room.chapter);}
  powerMode(id=this.room.chapter){return this.state.circuits[id]||'work';}
  channelOn(channel,id=this.room.chapter){return EARTH_DATA.powerModes.find(m=>m.id===this.powerMode(id)).channels.includes(channel);}
  get powered(){return super.powered&&(this.room.naturalLight||this.channelOn('light'));}
  get carrying(){const f=this.state.survivors[this.state.carryId];return f&&f.status==='down'?f:null;}
  get character(){const c=super.character;return this.state.carryId?{...c,speed:c.speed*.58}:c;}
  loadRoom(id){super.loadRoom(id);this.serviceAction=null;}
  interactionCandidates(){return super.interactionCandidates().filter(i=>!(i.kind==='scrap'&&this.state.salvaged.includes(i.id))&&!(i.kind==='companion'&&i.id===this.state.carryId));}
  handsFree(quiet=false){if(!this.carrying)return true;if(!quiet)this.emit('toast',{text:'Déposez la personne avec P pour libérer vos mains.'});return false;}
  interact(){
   if(this.dead||this.pending||this.hold||this.state.finished||this.serviceAction)return null;
   if(this.hidden)return super.interact();
   const i=this.nearestInteraction();
   if(this.carrying&&i&&!['door','chapter','archive'].includes(i.kind)){this.handsFree();return null;}
   if(i?.kind==='scrap'){
    if(this.state.parts+i.parts>24){this.emit('toast',{text:'Le stock est presque plein. La mallette reste intacte.'});return null;}
    this.state.parts+=i.parts;this.state.salvaged.push(i.id);this.log('Mallette récupérée : '+i.parts+' pièces détachées.','service');this.emit('toast',{text:'Quatre pièces détachées récupérées.'});this.emit('save');return i;
   }
   if(['powercab','workbench','cameraConsole'].includes(i?.kind)){
    this.pending={type:'service-v4',id:i.id};this.emit('servicePanel',{station:clone(i)});return i;
   }
   return super.interact();
  }
  queueService(kind,value){
   if(this.pending?.type!=='service-v4'||this.dead||!this.handsFree())return false;
   const station=this.room.interactables.find(i=>i.id===this.pending.id);
   if(!station||!near(this.player,station)||!visible(this.room,this.player,station))return false;
   let duration,label;
   if(kind==='switch'&&station.kind==='powercab'&&V4_MODES.has(value)){
    if(this.powerMode()===value){this.emit('toast',{text:'Cette répartition est déjà en place.'});return false;}
    duration=2.5;label='Commutation du secteur';
   }else if(kind==='craft'&&station.kind==='workbench'){
    const recipe=EARTH_DATA.recipes.find(r=>r.id===value);
    if(!recipe||this.state.parts<recipe.cost||this.state.inventory[recipe.item]>=(recipe.capacity||9)){this.emit('toast',{text:'Pièces insuffisantes ou réserve pleine.'});return false;}
    duration=recipe.duration;label=recipe.label;
   }else if(kind==='capture'&&station.kind==='cameraConsole'&&this.network.cameraIds.includes(value)){
    if(!this.channelOn('surveillance')){this.emit('toast',{text:'Surveillance hors ligne. Répartissez le courant au coffret du secteur.'});return false;}
    duration=1.5;label='Acquisition du relevé';
   }else return false;
   this.pending=null;this.actionV3=null;this.listenWork=null;this.calmWork=null;
   this.serviceAction={kind,value,id:station.id,x:station.x,z:station.z,time:0,duration,key:'interact',label};
   this.emit('toast',{text:label+' · maintenez E sur place.'});return true;
  }
  startRepair(){
   if(this.dead||this.state.finished||this.pending||this.hold||this.serviceAction||!this.handsFree())return false;
   const d=this.nearestDoor();if(!d){this.emit('toast',{text:'Approchez d’un verrou endommagé.'});return false;}
   const k=doorKey(d);
   if(this.sealState(d).integrity>=100||this.state.parts<3||this.state.repairedDoors.includes(k)){
    this.emit('toast',{text:this.state.repairedDoors.includes(k)?'La pièce de remplacement de ce verrou a déjà été utilisée.':this.state.parts<3?'Trois pièces détachées sont nécessaires.':'Le verrou est encore intact.'});return false;
   }
   this.actionV3=null;this.serviceAction={kind:'repair',value:k,id:d.id,x:d.x,z:d.z,time:0,duration:3.5,key:'repair',label:'Remplacement de la barre'};return true;
  }
  startCarry(){
   if(this.dead||this.state.finished||this.pending||this.hold||this.serviceAction)return false;
   if(this.carrying)return this.dropCarried();
   const f=Object.values(this.state.survivors).find(f=>f.room===this.room.id&&f.status==='down'&&near(this.player,f,100,40)&&visible(this.room,this.player,f));
   if(!f){this.emit('toast',{text:'Approchez d’une personne à terre. P pour la porter.'});return false;}
   this.actionV3=null;this.serviceAction={kind:'carry',value:f.id,id:f.id,x:f.x,z:f.z,time:0,duration:1.2,key:'carry',label:'Soulever '+this.survivorDef(f.id).name};return true;
  }
  dropCarried(force=false){
   const f=this.carrying;if(!f)return false;
   const options=[{x:this.player.x-this.player.facing*55,z:this.player.z},{x:this.player.x+this.player.facing*55,z:this.player.z},{x:this.player.x,z:this.player.z}];
   const spot=options.find(p=>!blocked(this.room,p.x,p.z)&&visible(this.room,this.player,p));
   if(!spot&&!force){this.emit('toast',{text:'Aucune place libre pour déposer cette personne.'});return false;}
   Object.assign(f,spot||{x:this.player.x,z:this.player.z},{room:this.room.id});this.state.carryId=null;
   if(!force){this.emit('toast',{text:this.survivorDef(f.id).name+' a été déposé. Il faut toujours un kit pour le relever.'});this.emit('save');}return true;
  }
  syncCarried(){const f=this.carrying;if(f){f.room=this.room.id;f.x=this.player.x;f.z=this.player.z;f.moving=false;}}
  enter(id,x=120,z=125,door=null){
   const carried=this.carrying;super.enter(id,x,z,door);
   if(carried){carried.room=id;carried.x=this.player.x;carried.z=this.player.z;this.state.carryId=carried.id;this.checkpoint=this.snapshot();}
  }
  advanceChapter(){const result=super.advanceChapter();if(result&&this.state.survivors[this.state.carryId]?.status==='left')this.state.carryId=null;return result;}
  restartCheckpoint(){this.dropCarried(true);this.serviceAction=null;super.restartCheckpoint();this.state.carryId=null;}
  cancelInteraction(){super.cancelInteraction();this.serviceAction=null;}
  damage(amount){const hit=super.damage(amount);if(hit){this.serviceAction=null;if(this.dead)this.dropCarried(true);}return hit;}
  tool(){return this.handsFree(true)&&!this.serviceAction?super.tool():false;}
  fire(){return this.handsFree(true)&&!this.serviceAction?super.fire():false;}
  reload(){return this.handsFree(true)&&!this.serviceAction?super.reload():false;}
  resonate(){return this.handsFree(true)&&!this.serviceAction?super.resonate():false;}
  throwDecoy(){return this.handsFree()&&!this.serviceAction?super.throwDecoy():false;}
  useCare(){return this.handsFree()&&!this.serviceAction?super.useCare():false;}
  startSeal(){return this.handsFree()&&!this.serviceAction?super.startSeal():false;}
  ventActive(v){
   const active=this.channelOn('extraction')?v.on:Math.min(v.period*.90,v.on*1.7);
   return !this.state.valves.includes(v.id)&&(this.time+v.offset)%v.period<active;
  }
  cameraFrame(id){
   const cam=V4_CAMERA[id];if(!cam||!this.network.cameraIds.includes(id)||!this.channelOn('surveillance'))return null;
   const r=roomWithState(this.state,cam.room);
   const seen=p=>(p.x-cam.x)*cam.facing>=0&&Math.hypot(p.x-cam.x,(p.z-cam.z)*3.2)<=cam.range&&Math.abs(p.z-cam.z)<=cam.depth&&visible(r,cam,p);
   const es=Object.entries(this.state.enemyRooms).filter(([id,room])=>room===cam.room).map(([id])=>(cam.room===this.room.id?this.enemies.find(e=>e.id===id):null)||this.state.world[cam.room]?.enemies?.find(e=>e.id===id)||V4_ENEMIES[id]).filter(Boolean);
   const points=[];
   for(const e of es.filter(seen)){
    const def=V4_ENEMIES[e.id];
    points.push({x:e.x,z:e.z,type:'organism',heavy:(def?.kind||e.kind||'').startsWith('xeno'),confined:Object.values(this.state.containment?.pads||{}).some(p=>p.status==='sealed'&&p.sample===e.id)});
   }
   for(const f of Object.values(this.state.survivors))if(f.room===cam.room&&!['rescued','left'].includes(f.status)&&seen(f))points.push({x:f.x,z:f.z,type:'person',heavy:false});
   if(cam.room===this.room.id&&seen(this.player))points.push({x:this.player.x,z:this.player.z,type:'person',heavy:false});
   const legacyLight=!r.dark||!!(r.systems?.poweredBy&&this.state.completed.includes(r.systems.poweredBy));
   return {camera:id,room:cam.room,time:this.state.playSeconds,points:points.slice(0,20),closedGate:!!(r.gate&&this.state.gates[r.gate.id]),powered:legacyLight&&(r.naturalLight||this.channelOn('light',cam.network))};
  }
  completeService(a){
   if(a.kind==='switch'){
    this.state.circuits[this.room.chapter]=a.value;this.state.serviceStats.switches++;
    this.log('Répartition : '+EARTH_DATA.powerModes.find(m=>m.id===a.value).label+'.','power');
    this.noise={x:a.x,z:a.z,ttl:1.2,radius:380};this.emit('toast',{text:'Répartition modifiée. Voyants et appareils du secteur mis à jour.'});
   }else if(a.kind==='craft'){
    const r=EARTH_DATA.recipes.find(r=>r.id===a.value);
    if(!r||this.state.parts<r.cost||this.state.inventory[r.item]>=(r.capacity||9))return;
    this.state.parts-=r.cost;this.state.inventory[r.item]++;this.state.serviceStats.crafts++;this.log(r.label+' : '+r.cost+' pièces consommées.','service');this.emit('toast',{text:r.label+' — terminé.'});
   }else if(a.kind==='repair'){
    const d=this.room.portals.find(d=>d.id===a.id);
    if(!d||this.state.parts<3||this.state.repairedDoors.includes(a.value))return;
    const seal=this.sealState(d);this.state.parts-=3;this.state.repairedDoors.push(a.value);this.state.seals[a.value]={closed:seal.closed,integrity:100};this.state.serviceStats.repairs++;
    this.log('Verrou remis en état vers '+ROOM_BY_ID[d.to].title+'.','repair');this.emit('toast',{text:'Barre remplacée. X permet de fermer le verrou.'});
   }else if(a.kind==='carry'){
    const f=this.state.survivors[a.value];if(!f||f.status!=='down'||f.room!==this.room.id||!near(this.player,f,100,40))return;
    this.state.carryId=f.id;this.reloadTime=0;this.hidden=null;this.state.serviceStats.lifts++;this.syncCarried();this.emit('toast',{text:this.survivorDef(f.id).name+' est sur vos épaules. P pour déposer ; marche ralentie.'});
   }else if(a.kind==='capture'){
    const frame=this.cameraFrame(a.value);if(!frame)return;
    this.state.cameraFrames[a.value]=frame;this.state.serviceStats.captures++;
    this.log('Relevé de caméra acquis : '+ROOM_BY_ID[frame.room].title+'.','camera');this.emit('cameraReport',{frame:clone(frame)});
   }
   this.emit('sound',{kind:'service'});this.emit('save');
  }
  updateSystems(dt,input){
   super.updateSystems(dt,input);this.syncCarried();
   const f=this.carrying;
   if(f){const def=this.survivorDef(f.id);if(f.room===def.evac&&near(this.player,{x:def.evacX,z:def.evacZ},90,45)){
    f.status='rescued';this.state.carryId=null;this.state.stats.rescues++;this.state.serviceStats.medicalEvacs++;
    this.grantReward({care:1});this.log(def.name+' pris en charge, évacuation médicale.','rescue');this.emit('toast',{text:def.name+' est pris en charge par les secours. Évacuation médicale.'});this.emit('save');
   }}
  }
  update(dt,input={}){
   const before=this.time;
   const active=this.serviceAction?{...input,scan:false,seal:false,listen:false,calm:false}:input;
   super.update(dt,this.carrying?{...active,sprint:false,scan:false}:active);
   const step=this.time-before,a=this.serviceAction;if(!a||step<=0)return;
   const atSite=near(this.player,a)&&visible(this.room,this.player,a);
   if(this.dead||this.pending||this.moving||!atSite||this.time-this.damageClock<.12||this.hold){this.serviceAction=null;return;}
   // Selecting a job arms it. Give the player time to press the hold key after closing the panel.
   // Once work really starts, releasing still cancels. No progress or cost while merely armed.
   if(!input[a.key]){if(a.started)this.serviceAction=null;return;}
   a.started=true;a.time+=step;
   if(a.time>=a.duration){this.serviceAction=null;this.completeService(a);}
  }
 };
}
