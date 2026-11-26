import { EARTH_DATA } from './alien-earth-data.js';

// Mechanical, local containment is an original game device, not an assertion about series technology.
const CP5_PADS=Object.fromEntries((EARTH_DATA.containmentPads||[]).map(p=>[p.id,p]));
const CP5_PRESETS=Object.fromEntries((EARTH_DATA.containmentPresets||[]).map(p=>[p.id,p]));
const CP5_SPAWNS=Object.fromEntries(EARTH_DATA.rooms.flatMap(r=>r.enemies.map(e=>[e.id,{...e,originRoom:r.id}])));
const cp5Number=(v,min,max,fallback=0)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
const cp5Dist=(a,b)=>Math.hypot(a.x-b.x,(a.z-b.z)*3.2);
export function initialContainmentV5(){return {pads:{},records:{},calibrated:[],stats:{armed:0,captures:0,studies:0,released:0,broken:0,recovered:0}};}
export function containedIdsV5(state){return new Set(Object.values(state.containment?.pads||{}).filter(p=>p.status==='sealed'&&p.sample).map(p=>p.sample));}
export function upgradeContainmentV5(s,raw){
 s.schema=5;s.version=EARTH_DATA.version;s.containment=initialContainmentV5();
 s.inventory.capsules=raw.schema<5?2:Math.floor(cp5Number(raw.inventory?.capsules,0,4));
 if(raw.schema<5)return s;
 const v=raw.containment;
 if(!v||typeof v!=='object'||Array.isArray(v))return s;
 const used=new Set();
 for(const [id,p] of Object.entries(v.pads||{})){
  const def=Object.hasOwn(CP5_PADS,id)?CP5_PADS[id]:null;if(!def||!p||!Object.hasOwn(CP5_PRESETS,p.preset)||!['armed','sealed','spent','broken'].includes(p.status))continue;
  const out={status:p.status,preset:p.preset,integrity:cp5Number(p.integrity,0,100,100),expiresAt:cp5Number(p.expiresAt,0,s.playSeconds+45),sample:null};
  if(p.status==='sealed'){
   const sample=Object.hasOwn(CP5_SPAWNS,p.sample)?CP5_SPAWNS[p.sample]:null;
   if(!sample||!CP5_PRESETS[p.preset].kinds.includes(sample.kind)||s.enemyRooms[p.sample]!==def.room||used.has(p.sample)||out.integrity<=0)
    throw new Error('Confinement incohérent : identité, salle ou compatibilité invalide.');
   used.add(p.sample);out.sample=p.sample;
  }
  if(out.status==='armed'&&out.expiresAt<=s.playSeconds)out.status='spent';
  if(out.status==='armed'&&out.integrity<=0)out.status='broken';
  s.containment.pads[id]=out;
 }
 for(const [id,rec] of Object.entries(v.records||{})){
  const def=Object.hasOwn(CP5_SPAWNS,id)?CP5_SPAWNS[id]:null,pad=Object.hasOwn(CP5_PADS,rec?.pad)?CP5_PADS[rec?.pad]:null;
  if(!def||!pad||!Object.hasOwn(CP5_PRESETS,rec.preset)||!CP5_PRESETS[rec.preset]?.kinds.includes(def.kind)||pad.room!==rec.room||s.enemyRooms[id]===undefined)continue;
  if(EARTH_DATA.rooms.find(r=>r.id===def.originRoom).chapter!==EARTH_DATA.rooms.find(r=>r.id===pad.room).chapter)continue;
  s.containment.records[id]={id,kind:def.kind,room:pad.room,pad:pad.id,preset:rec.preset,first:cp5Number(rec.first,0,s.playSeconds),last:cp5Number(rec.last,0,s.playSeconds),studied:rec.studied===true,studyTime:rec.studied===true?cp5Number(rec.studyTime,0,s.playSeconds):null,lastStatus:used.has(id)?'sealed':['released','escaped'].includes(rec.lastStatus)?rec.lastStatus:'released'};
 }
 // An imported sealed identity must have a valid matching acquisition record. Do not fabricate one.
 for(const [id,p] of Object.entries(s.containment.pads))if(p.status==='sealed'){
  const rec=s.containment.records[p.sample];
  if(!rec||rec.pad!==id)throw new Error('Le registre du spécimen confiné est absent ou incompatible.');
 }
 s.containment.calibrated=[...new Set((Array.isArray(v.calibrated)?v.calibrated:[]).filter(id=>CP5_PADS[id]?.tutorial))];
 for(const k of Object.keys(s.containment.stats))s.containment.stats[k]=Math.floor(cp5Number(v.stats?.[k],0,999999));
 return s;
}

export function withEarthContainmentV5(Base,{ROOM_BY_ID,near,visible,clone}){
 return class EarthContainmentEngine extends Base {
  constructor(state=null){super(state);this.podDwell={};this.podPressure={};}
  podState(id){return this.state.containment?.pads[id]||{status:'empty',preset:'crawler',integrity:100,sample:null,expiresAt:0};}
  localPads(){return (EARTH_DATA.containmentPads||[]).filter(p=>p.room===this.room.id);}
  loadRoom(id){super.loadRoom(id);const confined=containedIdsV5(this.state);this.enemies=this.enemies.filter(e=>!confined.has(e.id));this.podDwell={};this.podPressure={};}
  commit(){
   super.commit();
   // The authoritative room map keeps the identity. A specimen is simply not in the active AI list.
   for(const def of this.localPads()){
    const p=this.podState(def.id);if(p.status!=='sealed')continue;
    const list=this.state.world[this.room.id].enemies;
    if(!list.some(e=>e.id===p.sample))list.push({id:p.sample,x:def.x,z:def.z,homeX:def.x,homeZ:def.z,mode:'patrol',stun:0,memory:0,alert:0,facing:1,cooldown:0,timer:0,patrol:1,arrivalGrace:0,lastSeen:null,target:null,focusId:'player'});
   }
  }
  interact(){
   if(this.dead||this.pending||this.hold||this.state.finished||this.serviceAction)return null;
   const i=this.nearestInteraction();
   if(i?.kind==='containmentPad'&&!this.hidden){
    if(!this.handsFree())return null;
    this.pending={type:'containment-v5',id:i.id};this.emit('containmentPanel',{pad:clone(i)});return i;
   }
   return super.interact();
  }
  queueContainment(action,preset='crawler'){
   if(this.pending?.type!=='containment-v5'||this.dead||!this.handsFree())return false;
   const d=CP5_PADS[this.pending.id],p=d?this.podState(d.id):null;
   if(!d||d.room!==this.room.id||!near(this.player,d)||!visible(this.room,this.player,d))return false;
   let duration,label;
   if(action==='arm'&&Object.hasOwn(CP5_PRESETS,preset)&&['empty','spent'].includes(p.status)){
    if(this.state.inventory.capsules<1){this.emit('toast',{text:'Une cartouche est nécessaire. Les établis en assemblent pour quatre pièces.'});return false;}
    duration=2;label='Armer le plateau · '+CP5_PRESETS[preset].label;
   }else if(action==='study'&&p.status==='sealed'&&!this.state.containment.records[p.sample]?.studied){duration=3;label='Observer sous enceinte';}
   else if(action==='release'&&p.status==='sealed'){duration=2;label='Ouvrir l’enceinte — danger';}
   else if(action==='recover'&&p.status==='armed'&&p.expiresAt>this.time&&this.state.inventory.capsules<4){duration=1;label='Récupérer la cartouche inutilisée';}
   else if(action==='calibrate'&&d.tutorial&&p.status==='empty'){duration=1.5;label='Calibration à vide';}
   else {this.emit('toast',{text:'Cette manœuvre n’est pas disponible dans l’état actuel du plateau.'});return false;}
   this.pending=null;this.actionV3=null;this.listenWork=null;this.calmWork=null;
   this.serviceAction={kind:'fauna-'+action,value:preset,id:d.id,x:d.x,z:d.z,time:0,duration,key:'interact',label};
   this.emit('toast',{text:label+' · maintenez E sur place.'});return true;
  }
  completeService(a){
   if(!a.kind.startsWith('fauna-'))return super.completeService(a);
   const d=CP5_PADS[a.id],p=d?this.podState(d.id):null;
   if(!d||d.room!==this.room.id||!near(this.player,d)||!visible(this.room,this.player,d)||!this.handsFree(true))return;
   const cp=this.state.containment;
   if(a.kind==='fauna-arm'&&['empty','spent'].includes(p.status)&&this.state.inventory.capsules>0&&Object.hasOwn(CP5_PRESETS,a.value)){
    this.state.inventory.capsules--;cp.pads[d.id]={status:'armed',preset:a.value,integrity:100,sample:null,expiresAt:this.time+45};cp.stats.armed++;
    this.log(d.label+' armé · '+CP5_PRESETS[a.value].label+'.','containment');this.emit('toast',{text:'Appât actif pendant 45 secondes. Éloignez-vous et rompez la ligne de vue.'});
   }else if(a.kind==='fauna-calibrate'&&d.tutorial&&p.status==='empty'){
    if(!cp.calibrated.includes(d.id))cp.calibrated.push(d.id);
    this.effects.push({kind:'calibration',x:d.x,z:d.z,ttl:1.2});this.log('Calibration à vide terminée, aucune créature ni cartouche consommée.','containment');this.emit('toast',{text:'Mécanisme calibré. Capture : bonne bande, bon réglage et 0,8 seconde sur le plateau.'});
   }else if(a.kind==='fauna-recover'&&p.status==='armed'&&p.expiresAt>this.time&&this.state.inventory.capsules<4){
    this.state.inventory.capsules++;delete cp.pads[d.id];delete this.podDwell[d.id];cp.stats.recovered++;
    this.emit('toast',{text:'Cartouche intacte récupérée. Le plateau est vide.'});
   }else if(a.kind==='fauna-study'&&p.status==='sealed'&&!cp.records[p.sample]?.studied){
    const rec=cp.records[p.sample];if(!rec)return;rec.studied=true;rec.studyTime=this.time;cp.stats.studies++;
    if(!this.state.research.includes(rec.kind))this.state.research.push(rec.kind);
    this.log('Étude sous enceinte : '+EARTH_DATA.creatures.find(c=>c.id===rec.kind).name+'.','containment');this.emit('toast',{text:'Étude conservée dans le registre. Aucune récompense de capture répétable.'});
   }else if(a.kind==='fauna-release'&&p.status==='sealed'){this.releaseSpecimen(d.id,false);return;}
   else return;
   this.emit('sound',{kind:'service'});this.emit('save');
  }
  releaseSpecimen(id,broken=false){
   const d=CP5_PADS[id],p=this.podState(id);if(!d||d.room!==this.room.id||p.status!=='sealed'||!p.sample)return false;
   const sample=p.sample,def=CP5_SPAWNS[sample],rec=this.state.containment.records[sample];
   if(!def)return false;
   if(!this.enemies.some(e=>e.id===sample))this.enemies.push({...clone(def),x:d.x,z:d.z,homeX:d.x,homeZ:d.z,stun:0,mode:'arriving',arrivalGrace:2,cooldown:2,memory:0,alert:0,facing:Math.sign(this.player.x-d.x)||1,patrol:1,path:[],pathClock:0,lastSeen:null,target:null});
   this.state.enemyRooms[sample]=d.room;p.sample=null;p.status=broken?'broken':'spent';if(broken)p.integrity=0;
   if(rec){rec.lastStatus=broken?'escaped':'released';rec.last=this.time;}
   this.state.containment.stats[broken?'broken':'released']++;delete this.podDwell[id];delete this.podPressure[id];
   const msg=broken?'Enceinte rompue ! Le spécimen s’échappe.':'Enceinte ouverte. Le spécimen est libre, cartouche consommée.';
   this.log(msg,'containment');this.emit('toast',{text:msg});this.emit('sound',{kind:'impact'});this.emit('save');return true;
  }
  updateEnemy(e,dt,input){
   const d=this.localPads().find(d=>this.podState(d.id).status==='sealed'&&e.kind.startsWith('xeno')&&e.stun<=0&&!(e.arrivalGrace>0)&&cp5Dist(e,d)<180&&visible(this.room,e,d)&&cp5Dist(e,this.player)>125);
   if(d){
    const p=this.podState(d.id);const work=this.podPressure[d.id]||={enemy:e.id,time:0};
    if(work.enemy!==e.id){work.enemy=e.id;work.time=0;}
    if(work.time===0){this.emit('toast',{text:'La créature s’attaque à l’enceinte !'});this.emit('sound',{kind:'impact'});}
    work.time+=dt;e.mode='investigate';e.facing=Math.sign(d.x-e.x)||e.facing;
    if(work.time>.8){p.integrity=Math.max(0,p.integrity-dt*30);if(p.integrity<=0)this.releaseSpecimen(d.id,true);}
    return;
   }
   for(const [id,p] of Object.entries(this.podPressure))if(p.enemy===e.id)delete this.podPressure[id];
   const original=this.lures;
   const emitters=this.localPads().filter(d=>this.podState(d.id).status==='armed'&&this.podState(d.id).expiresAt>this.time).map(d=>({x:d.x,z:d.z,ttl:1,radius:540}));
   this.lures=[...original,...emitters];try{super.updateEnemy(e,dt,input);}finally{this.lures=original;}
  }
  updateSystems(dt,input){
   super.updateSystems(dt,input);
   const cp=this.state.containment;
   for(const [id,p] of Object.entries(cp.pads))if(p.status==='armed'&&p.expiresAt<=this.time){p.status='spent';delete this.podDwell[id];if(CP5_PADS[id]?.room===this.room.id)this.emit('toast',{text:'Appât épuisé. La cartouche ne peut plus être récupérée.'});this.emit('save');}
   for(const d of this.localPads()){
    const p=this.podState(d.id);if(p.status!=='armed')continue;
    const e=this.enemies.find(e=>CP5_PRESETS[p.preset].kinds.includes(e.kind)&&near(e,d,62,24)&&visible(this.room,e,d));
    if(!e){delete this.podDwell[d.id];continue;}
    let dwell=this.podDwell[d.id];if(dwell?.id!==e.id)dwell=this.podDwell[d.id]={id:e.id,time:0};
    dwell.time+=dt;
    if(dwell.time>=.8){
     p.status='sealed';p.sample=e.id;p.integrity=100;p.expiresAt=0;
     this.enemies=this.enemies.filter(other=>other.id!==e.id);this.state.pursuits=this.state.pursuits.filter(q=>q.enemyId!==e.id);
     this.state.enemyRooms[e.id]=d.room;
     const prev=cp.records[e.id];cp.records[e.id]={id:e.id,kind:e.kind,room:d.room,pad:d.id,preset:p.preset,first:prev?.first??this.time,last:this.time,studied:prev?.studied===true,studyTime:prev?.studyTime??null,lastStatus:'sealed'};
     cp.stats.captures++;delete this.podDwell[d.id];this.commit();
     this.log('Spécimen confiné : '+EARTH_DATA.creatures.find(c=>c.id===e.kind).name+' · '+this.room.title+'.','containment');
     this.emit('toast',{text:'Enceinte scellée. E au plateau : étudier ou libérer. Attention aux autres menaces.'});this.emit('sound',{kind:'goal'});this.emit('save');
    }
   }
  }
 };
}
