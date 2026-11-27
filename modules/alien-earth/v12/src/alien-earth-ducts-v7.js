import { EARTH_DATA } from './alien-earth-data.js';
const ductRoomsV7=Object.fromEntries(EARTH_DATA.rooms.map(r=>[r.id,r]));
const ductHatchesV7=Object.fromEntries(EARTH_DATA.rooms.flatMap(r=>r.portals.filter(p=>p.hatchKey).map(p=>[p.hatchKey,{...p,from:r.id,chapter:r.chapter}])));
export const DUCT_SMALL_V7=new Set(['facehugger','tick','fly']);
export function initialDuctsV7(){return {opened:[],stats:{opened:0,crossings:0,rotorContacts:0}};}
/** Mechanical phase derives solely from simulation time. No timer is hidden in the renderer. */
export function ductFanStateV7(state,room=ductRoomsV7[state.room]){
 if(!room?.duct)return null;
 const f=room.duct.fan,stopped=state.completed.includes(room.task.id);
 const phase=((state.playSeconds+f.phase)%f.period+f.period)%f.period;
 const active=!stopped&&phase<f.running,warning=!stopped&&phase>=f.period-f.warning;
 return {active,warning,stopped,phase,remaining:stopped?0:active?f.running-phase:f.period-phase,label:stopped?'CONSIGNÉE':active?'EN MARCHE':warning?'REDÉMARRAGE':'REPOS'};
}
export function ductEjectV7(body,room){
 const f=room.duct?.fan;if(!f||body.x+20<=f.x||body.x-20>=f.x+f.w)return false;
 body.x=body.x<f.x+f.w/2?f.x-24:f.x+f.w+24;body.z=125;return true;
}
export function upgradeDuctsV7(s,raw){
 s.schema=7;s.ducts=initialDuctsV7();
 if(raw.schema>=7){
  if(!raw.ducts||!Array.isArray(raw.ducts.opened)||!raw.ducts.stats||typeof raw.ducts.stats!=='object')throw Error('Registre des grilles V7 absent. Import annulé.');
  for(const key of raw.ducts.opened){
   const h=ductHatchesV7[key];
   if(!h||!h.requires.every(g=>s.completed.includes(g))||EARTH_DATA.chapters.findIndex(c=>c.id===h.chapter)>s.chapter)throw Error('Grille incohérente : '+String(key).slice(0,60));
   if(!s.ducts.opened.includes(key))s.ducts.opened.push(key);
  }
  for(const k of Object.keys(s.ducts.stats))s.ducts.stats[k]=Number.isFinite(raw.ducts.stats[k])?Math.max(0,Math.min(999999,Math.floor(raw.ducts.stats[k]))):0;
  s.ducts.stats.opened=s.ducts.opened.length;
 }
 // A hatch is not a standard door bar. Ignore invented bars/repairs for these keys.
 for(const key of Object.keys(ductHatchesV7)){delete s.seals[key];s.repairedDoors=s.repairedDoors.filter(k=>k!==key);}
 for(const [id,rid] of Object.entries(s.enemyRooms)){
  const r=ductRoomsV7[rid];if(!r?.duct)continue;
  const def=EARTH_DATA.rooms.flatMap(r=>r.enemies).find(e=>e.id===id);
  if(!DUCT_SMALL_V7.has(def?.kind))throw Error('Organisme incompatible avec une galerie étroite.');
 }
 if(ductRoomsV7[s.room]?.duct){
  const r=ductRoomsV7[s.room];
  if(s.carryId)throw Error('Portage incompatible avec la hauteur de cette galerie.');
  if(!r.portals.some(p=>s.ducts.opened.includes(p.hatchKey)))throw Error('Galerie atteinte sans grille ouverte.');
  if(ductFanStateV7(s,r).active)ductEjectV7(s.player,r);
 }
 for(const unit of Object.values(s.sensors.units))if(unit.status==='deployed'){
  const f=ductRoomsV7[unit.room]?.duct?.fan;
  if(f&&unit.x>f.x-80&&unit.x<f.x+f.w+80)throw Error('Sonde placée dans le carter d’une turbine.');
 }
 s.pursuits=s.pursuits.filter(p=>{const hatch=ductRoomsV7[p.from]?.portals.find(d=>d.id===p.door);if(!hatch?.hatchKey)return true;const def=EARTH_DATA.rooms.flatMap(r=>r.enemies).find(e=>e.id===p.enemyId);return s.ducts.opened.includes(hatch.hatchKey)&&DUCT_SMALL_V7.has(def?.kind);});
 return s;
}
export function withEarthDuctsV7(Base,{near,visible,clone}){
 return class EarthDuctsEngineV7 extends Base{
  loadRoom(id){super.loadRoom(id);this.crouching=!!this.room.duct;}
  hatchOpen(p){return !p?.hatchKey||this.state.ducts.opened.includes(p.hatchKey);}
  interactionCandidates(){return super.interactionCandidates().filter(i=>!(i.kind==='ductBrake'&&this.state.completed.includes(this.room.task.id))).map(i=>i.hatchKey?{...i,label:(this.hatchOpen(i)?'Passage accroupi · ':'Dévisser la grille · ')+ductRoomsV7[i.to].title}:i);}
  interact(){
   if(this.dead||this.pending||this.hold||this.serviceAction||this.state.finished)return null;
   if(this.hidden)return super.interact();
   const i=this.nearestInteraction();
   if(i?.hatchKey){
    if(!i.requires.every(g=>this.state.completed.includes(g))){this.emit('toast',{text:'Accès technique indisponible · '+i.requireLabel+'.'});return null;}
    if(this.carrying){this.emit('toast',{text:'Trop bas pour porter quelqu’un. Déposez-le ou prenez la porte ordinaire.'});return null;}
    if(!this.hatchOpen(i)){
     this.actionV3=null;this.listenWork=null;this.calmWork=null;
     this.serviceAction={kind:'duct-open',id:i.id,value:i.hatchKey,room:this.room.id,x:i.x,z:i.z,time:0,duration:2,key:'interact',label:'Dévisser la grille'};
     this.emit('toast',{text:'Maintenez E deux secondes. La grille déposée restera ouverte.'});return i;
    }
   }
   if(i?.kind==='ductBrake'){
    if(!this.handsFree())return null;
    this.actionV3=null;this.listenWork=null;this.calmWork=null;
    this.serviceAction={kind:'duct-stop',id:i.id,value:this.room.task.id,room:this.room.id,x:i.x,z:i.z,time:0,duration:2.5,key:'interact',label:'Consigner la turbine'};
    return i;
   }
   return super.interact();
  }
  completeService(a){
   if(!a.kind.startsWith('duct-'))return super.completeService(a);
   if(this.dead||this.state.finished||a.room!==this.room.id||!near(this.player,a)||!visible(this.room,this.player,a)||!this.handsFree(true))return;
   if(a.kind==='duct-open'){
    const p=this.room.portals.find(p=>p.id===a.id&&p.hatchKey===a.value);
    if(!p||this.hatchOpen(p)||!p.requires.every(g=>this.state.completed.includes(g)))return;
    this.state.ducts.opened.push(p.hatchKey);this.state.ducts.stats.opened=this.state.ducts.opened.length;
    this.log('Grille déposée vers '+ductRoomsV7[p.to].title+'.','duct');
    this.emit('toast',{text:'Grille déposée. Relâchez E, puis réappuyez pour entrer. Les petits organismes peuvent suivre.'});
   }else if(a.kind==='duct-stop'){
    const control=this.room.interactables.find(i=>i.id===a.id&&i.kind==='ductBrake');
    if(!control||!this.room.duct||a.value!==this.room.task.id)return;
    if(!this.completeGoal(a.value))return;
   }else return;
   this.emit('sound',{kind:'service'});this.emit('save');
  }
  completeGoal(id){const done=super.completeGoal(id);if(done&&this.room.duct){this.log('Turbine consignée : '+this.room.title+'.','duct');this.emit('toast',{text:'Turbine consignée. Le passage reste libre, même après une reprise.'});}return done;}
  enter(id,x,z,door=null){
   if(door?.hatchKey){
    if(!this.hatchOpen(door)||this.carrying)return false;
    this.state.ducts.stats.crossings++;
   }
   super.enter(id,x,z,door);
   if(this.room.duct)this.emit('toast',{text:'Passage bas : marche accroupie. Le carter alterne marche et repos ; deux freins permettent de l’arrêter.'});
   return true;
  }
  planPursuit(door){
   if(!door?.hatchKey)return super.planPursuit(door);
   if(!this.hatchOpen(door))return;
   const all=this.enemies;
   // Use the existing pursuit planner on eligible actual actors. No extra copy,
   // false counter, or queued adult is created then silently discarded.
   try{this.enemies=all.filter(e=>DUCT_SMALL_V7.has(e.kind));super.planPursuit(door);}finally{this.enemies=all;}
  }
  startSeal(){if(this.nearestDoor()?.hatchKey){this.emit('toast',{text:'Une grille déposée n’a pas de barre de porte. Son passage reste ouvert.'});return false;}return super.startSeal();}
  startRepair(){if(this.nearestDoor()?.hatchKey){this.emit('toast',{text:'Ce passage étroit ne se répare pas comme une porte.'});return false;}return super.startRepair();}
  fire(){if(this.room.duct)return false;return super.fire();}
  reload(){if(this.room.duct)return false;return super.reload();}
  startCarry(){if(this.room.duct){this.emit('toast',{text:'Impossible de se redresser ici. Stabilisez la personne avec un kit.'});return false;}return super.startCarry();}
  sensorPlacement(){const spot=super.sensorPlacement();if(!spot.ok)return spot;const f=this.room.duct?.fan;if(f&&spot.x>f.x-80&&spot.x<f.x+f.w+80)return {ok:false,reason:'Le carter de la turbine doit rester dégagé, même pendant son repos.'};return spot;}
  restartCheckpoint(){const registry=clone(this.state.ducts);super.restartCheckpoint();this.state.ducts=registry;}
  ductFan(){return ductFanStateV7(this.state,this.room);}
  update(dt,input={}){
   if(this.dead||this.pending||this.state.finished)return super.update(dt,input);
   const step=Math.max(0,Math.min(.05,Number(dt)||0)),r=this.room;
   if(r.duct){
    const phase=ductFanStateV7({...this.state,playSeconds:this.state.playSeconds+step},r);
    if(phase.active){
     if(ductEjectV7(this.player,r)){this.state.ducts.stats.rotorContacts++;this.damage(18);this.emit('toast',{text:'Le carter repousse le passage. Attendez le repos ou utilisez le frein.'});}
     for(const e of this.enemies)if(ductEjectV7(e,r)){e.stun=Math.max(e.stun||0,.8);e.path=[];e.pathClock=0;}
     for(const f of Object.values(this.state.survivors))if(f.room===r.id&&!['left','rescued'].includes(f.status)&&ductEjectV7(f,r)){f.moving=false;f.stress=Math.min(100,(f.stress||0)+10);}
     if(this.state.escort)ductEjectV7(this.escortActor,r);
    }
   }
   return super.update(dt,r.duct?{...input,crouch:true,sprint:false}:input);
  }
 };
}
