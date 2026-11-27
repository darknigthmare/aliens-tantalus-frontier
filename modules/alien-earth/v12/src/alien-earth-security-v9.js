import { EARTH_DATA } from './alien-earth-data.js';

const SEC9_BY_ID=Object.fromEntries(EARTH_DATA.securityStations.map(s=>[s.id,s]));
const sec9Def=id=>typeof id==='string'&&Object.prototype.hasOwnProperty.call(SEC9_BY_ID,id)?SEC9_BY_ID[id]:null;
const sec9Record=v=>v&&typeof v==='object'&&!Array.isArray(v);
const sec9Finite=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
const sec9Copy=v=>JSON.parse(JSON.stringify(v));
const sec9Events=new Set(['alarm','isolated','impact','disabled','stunned']);
const sec9Default=()=>({integrity:100,isolated:false,isolatedAt:null,firstSeen:null,lastSeen:null,lastMode:null,alarmUntil:0,cooldownUntil:0,stunnedUntil:0,alarms:0});
export function initialSecurityV9(){return {units:Object.fromEntries(EARTH_DATA.securityStations.map(d=>[d.id,sec9Default()])),events:[]};}

/** No imported positions: the immutable authored installation owns each detector's location. */
export function upgradeSecurityV9(s,raw){
 s.schema=9;s.version=EARTH_DATA.version;s.security=initialSecurityV9();
 if(raw.schema<9)return s;
 const v=raw.security;
 if(!sec9Record(v)||!sec9Record(v.units)||!Array.isArray(v.events)||Object.keys(v.units).length!==EARTH_DATA.securityStations.length)throw Error('Registre V9 des sentinelles absent ou incomplet.');
 for(const [id,rec] of Object.entries(v.units)){
  const d=sec9Def(id);
  if(!d||!sec9Record(rec)||!sec9Finite(rec.integrity,0,100)||typeof rec.isolated!=='boolean'||!Number.isInteger(rec.alarms)||rec.alarms<0||rec.alarms>999999)throw Error('Sentinelle inconnue ou intégrité invalide.');
  for(const key of ['alarmUntil','cooldownUntil','stunnedUntil'])if(!sec9Finite(rec[key],0,s.playSeconds+(key==='stunnedUntil'?6.01:10.01)))throw Error('Délai de sentinelle invalide.');
  for(const key of ['firstSeen','lastSeen','isolatedAt'])if(rec[key]!==null&&!sec9Finite(rec[key],0,s.playSeconds))throw Error('Date de sentinelle invalide.');
  const touched=rec.integrity!==100||rec.isolated||rec.alarms||rec.alarmUntil||rec.cooldownUntil||rec.stunnedUntil;
  if((touched&&rec.firstSeen===null)||(rec.firstSeen!==null&&(!s.visited.includes(d.room)||EARTH_DATA.chapters.findIndex(c=>c.id===d.chapter)>s.chapter))||(rec.lastSeen!==null&&(rec.firstSeen===null||rec.lastSeen<rec.firstSeen)))throw Error('Intervention sur une sentinelle jamais observée ou future.');
  if(rec.isolated!==(rec.isolatedAt!==null)||rec.isolated&&rec.integrity<=0)throw Error('Consignation de sentinelle incohérente.');
  if(rec.lastMode!==null&&!['off','scan','alarm','cooldown','stunned','isolated','broken'].includes(rec.lastMode))throw Error('Observation de sentinelle invalide.');
  s.security.units[id]={integrity:rec.integrity,isolated:rec.isolated,isolatedAt:rec.isolatedAt,firstSeen:rec.firstSeen,lastSeen:rec.lastSeen,lastMode:rec.lastMode,alarmUntil:rec.alarmUntil,cooldownUntil:rec.cooldownUntil,stunnedUntil:rec.stunnedUntil,alarms:rec.alarms};
 }
 if(v.events.length>32)throw Error('Journal des sentinelles trop volumineux.');
 for(const e of v.events){const d=sec9Def(e?.id);if(!d||!sec9Events.has(e.kind)||e.room!==d.room||!sec9Finite(e.time,0,s.playSeconds)||s.security.units[d.id].firstSeen===null)throw Error('Événement de sentinelle invalide.');s.security.events.push({id:d.id,room:d.room,time:e.time,kind:e.kind});}
 return s;
}
export function securityAngleV9(def,time){const q=def.sensor;return q.baseAngle+Math.sin(time*Math.PI*2/q.period+q.phase)*q.sweep;}
export function securityConeV9(def,time,p){
 const dx=p.x-def.sensor.x,dz=(p.z-def.sensor.z)*3.2,r=Math.hypot(dx,dz);
 if(r>def.sensor.range)return false;
 if(r<26)return true;
 const delta=Math.atan2(Math.sin(Math.atan2(dz,dx)-securityAngleV9(def,time)),Math.cos(Math.atan2(dz,dx)-securityAngleV9(def,time)));
 return Math.abs(delta)<=def.sensor.halfAngle;
}
/** Local maintenance operates through the existing physical workbench/monitor. */
export function withEarthSecurityV9(Base,{near,visible,clone}){
 return class EarthSecurityEngine extends Base{
  loadRoom(id){super.loadRoom(id);this.securityReading=null;this.securityWitnessUntil=0;}
  get localSecurity(){return EARTH_DATA.securityStations.find(d=>d.room===this.room.id)||null;}
  securityUnit(id){return Object.prototype.hasOwnProperty.call(this.state.security.units,id)?this.state.security.units[id]:null;}
  securityMode(id){
   const u=this.securityUnit(id),d=sec9Def(id),t=this.state.playSeconds;if(!u||!d)return 'off';
   if(u.integrity<=0)return 'broken';if(u.isolated)return 'isolated';
   if(!this.channelOn('surveillance',d.chapter))return 'off';
   if(u.stunnedUntil>t)return 'stunned';if(u.alarmUntil>t)return 'alarm';if(u.cooldownUntil>t)return 'cooldown';return 'scan';
  }
  observeSecurity(id){const u=this.securityUnit(id);if(!u||sec9Def(id)?.room!==this.room.id)return;u.firstSeen??=this.state.playSeconds;u.lastSeen=this.state.playSeconds;u.lastMode=this.securityMode(id);}
  securityEvent(id,kind){
   this.observeSecurity(id);this.state.security.events.push({id,kind,room:this.room.id,time:this.state.playSeconds});this.state.security.events=this.state.security.events.slice(-32);
   const words={alarm:'Alarme locale déclenchée',isolated:'Détecteur consigné',impact:'Impact sur le détecteur',disabled:'Détecteur hors service',stunned:'Détecteur aveuglé temporairement'};
   this.log(id+' — '+words[kind]+'.','security');
  }
  openSecurity(id){
   const d=sec9Def(id);
   if(!d||d.room!==this.room.id||this.pending?.type!=='service-v4'||this.pending.id!==d.control.id||!this.handsFree()||this.dead||this.state.finished||!near(this.player,d.control)||!visible(this.room,this.player,d.control))return false;
   this.observeSecurity(id);this.pending={type:'security-v9',id};this.emit('securityPanel',{id});return true;
  }
  queueSecurity(id,action){
   const d=sec9Def(id),u=this.securityUnit(id);
   if(!d||!u||this.pending?.type!=='security-v9'||this.pending.id!==id||d.room!==this.room.id||!this.handsFree()||this.dead||this.state.finished||!near(this.player,d.control)||!visible(this.room,this.player,d.control))return false;
   if(u.integrity<=0||u.isolated){this.emit('toast',{text:'Ce détecteur est déjà neutralisé.'});return false;}
   if(!['isolate','test'].includes(action))return false;
   if(action==='test'&&this.securityMode(id)!=='scan'){this.emit('toast',{text:'Le test exige Surveillance alimentée et un détecteur prêt.'});return false;}
   this.pending=null;this.actionV3=null;this.listenWork=null;this.calmWork=null;this.scanProgress=null;
   this.serviceAction={kind:'security-'+action,value:id,id:d.control.id,x:d.control.x,z:d.control.z,time:0,duration:action==='isolate'?d.isolationDuration:d.testDuration,key:'interact',label:action==='isolate'?'Consignation du détecteur':'Essai sonore réel'};
   this.emit('toast',{text:this.serviceAction.label+' · maintenez E sur place.'});return true;
  }
  startSecurityAlarm(id){
   const d=sec9Def(id),u=this.securityUnit(id);if(!d||d.room!==this.room.id||this.securityMode(id)!=='scan')return false;
   u.alarmUntil=this.state.playSeconds+d.alarmDuration;u.cooldownUntil=this.state.playSeconds+d.cooldown;u.alarms=Math.min(999999,u.alarms+1);this.securityReading=null;
   this.securityEvent(id,'alarm');this.emit('toast',{text:id+' : alarme locale. Le signal peut attirer une créature déjà présente.'});this.emit('sound',{kind:'security'});this.emit('save');return true;
  }
  completeService(a){
   if(!a.kind.startsWith('security-'))return super.completeService(a);
   const d=sec9Def(a.value),u=this.securityUnit(a.value);
   if(!d||!u||d.room!==this.room.id||this.dead||this.state.finished||!this.handsFree(true)||!near(this.player,d.control)||!visible(this.room,this.player,d.control)||u.isolated||u.integrity<=0)return;
   if(a.kind==='security-isolate'){
    u.isolated=true;u.isolatedAt=this.state.playSeconds;this.securityReading=null;this.securityEvent(d.id,'isolated');this.emit('toast',{text:d.id+' consigné. Les caméras et les portes restent indépendantes.'});this.emit('sound',{kind:'service'});this.emit('save');
   }else if(a.kind==='security-test')this.startSecurityAlarm(d.id);
  }
  updateEnemy(e,dt,input){
   const d=this.localSecurity,old=this.noise;
   if(d&&this.securityMode(d.id)==='alarm'&&(!old||old.radius<820))this.noise={x:d.sensor.x,z:d.sensor.z,ttl:.1,radius:820};
   try{return super.updateEnemy(e,dt,input);}finally{this.noise=old;}
  }
  tool(){
   const used=super.tool();if(!used)return false;
   const d=this.localSecurity,u=d&&this.securityUnit(d.id);
   if(d&&u.integrity>0&&!u.isolated&&near(this.player,d.sensor,165,40)&&visible(this.room,this.player,d.sensor)){
    u.stunnedUntil=Math.max(u.stunnedUntil,this.state.playSeconds+6);this.securityReading=null;this.securityEvent(d.id,'stunned');this.emit('toast',{text:d.id+' aveuglé pour six secondes.'});this.emit('save');
   }
   return true;
  }
  hitSecurityProjectile(b){
   const d=this.localSecurity,u=d&&this.securityUnit(d.id);
   if(!d||b.owner!=='player'||!u||u.integrity<=0||u.isolated||!near(b,d.sensor,24,23))return false;
   u.integrity=Math.max(0,u.integrity-34);b.ttl=0;this.securityEvent(d.id,u.integrity===0?'disabled':'impact');
   this.effects.push({kind:'impact',x:d.sensor.x,z:d.sensor.z,ttl:.3});
   if(u.integrity===0){this.securityReading=null;this.emit('toast',{text:d.id+' détruit. Aucune réparation ni récupération de pièces.'});}else this.startSecurityAlarm(d.id);
   this.emit('save');return true;
  }
  restartCheckpoint(){const security=clone(this.state.security);super.restartCheckpoint();this.state.security=security;this.securityReading=null;this.securityWitnessUntil=0;}
  update(dt,input={}){
   const before=this.state.playSeconds;
   // A power loss cancels a running test, but the mechanical isolation remains available.
   const a=this.serviceAction;
   if(a?.kind==='security-test'&&this.securityMode(a.value)!=='scan'){this.serviceAction=null;this.emit('toast',{text:'Essai interrompu : détecteur hors ligne ou occupé.'});}
   super.update(dt,input);
   const step=this.state.playSeconds-before,d=this.localSecurity;if(step<=0||!d||this.dead||this.state.finished||this.pending)return;
   // Observation refers only to this loaded room, not to hidden remote state.
   if(near(this.player,d.sensor,900,190)&&visible(this.room,this.player,d.sensor)||near(this.player,d.control)&&visible(this.room,this.player,d.control))this.observeSecurity(d.id);
   if(this.securityMode(d.id)!=='scan'){this.securityReading=null;return;}
   const candidates=[];
   if(!this.hidden||this.securityWitnessUntil>this.state.playSeconds)candidates.push({id:'player',body:this.player,rate:input.crouch?.55:1});
   for(const f of Object.values(this.state.survivors))if(f.room===d.room&&['follow','wait'].includes(f.status)&&f.hp>0)candidates.push({id:f.id,body:f,rate:1});
   if(this.state.escort)candidates.push({id:'escort',body:this.escortActor,rate:1});
   const inView=c=>securityConeV9(d,this.state.playSeconds,c.body)&&visible(this.room,d.sensor,c.body);
   const target=candidates.find(c=>c.id===this.securityReading?.target&&inView(c))||candidates.find(inView);
   if(target){
    if(target.id==='player'&&!this.hidden)this.securityWitnessUntil=this.state.playSeconds+4;
    if(this.securityReading?.target!==target.id)this.securityReading={id:d.id,target:target.id,time:0};
    this.securityReading.time+=step*target.rate;
    if(this.securityReading.time>=d.acquisition)this.startSecurityAlarm(d.id);
   }else if(this.securityReading){this.securityReading.time=Math.max(0,this.securityReading.time-step*.9);if(this.securityReading.time===0)this.securityReading=null;}
  }
 };
}
