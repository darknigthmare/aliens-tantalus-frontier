import { EARTH_DATA } from './alien-earth-data.js';

const IV8_DOSSIERS=Object.fromEntries(EARTH_DATA.investigations.map(d=>[d.id,d]));
const IV8_ROOMS=Object.fromEntries(EARTH_DATA.rooms.map(r=>[r.id,r]));
const iv8Own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const iv8Record=o=>o&&typeof o==='object'&&!Array.isArray(o);
const iv8Time=(t,max)=>typeof t==='number'&&Number.isFinite(t)&&t>=0&&t<=max;
const iv8Copy=v=>JSON.parse(JSON.stringify(v));
export function initialInvestigationsV8(){return {decisions:{},departures:{}};}
export function upgradeInvestigationsV8(s,raw){
 s.schema=8;s.version=EARTH_DATA.version;s.investigations=initialInvestigationsV8();
 if(raw.schema<8){
  for(let i=0;i<raw.chapter+(raw.finished?1:0);i++)s.investigations.departures[EARTH_DATA.chapters[i].id]={time:null,provenance:'migrated'};
  return s;
 }
 const v=raw.investigations;
 if(!iv8Record(v)||!iv8Record(v.decisions)||!iv8Record(v.departures))throw new Error('Le registre V8 des enquêtes est absent ou invalide.');
 for(const [id,rec] of Object.entries(v.decisions)){
  const d=iv8Own(IV8_DOSSIERS,id)?IV8_DOSSIERS[id]:null;
  if(!d||!iv8Record(rec)||!['local','network'].includes(rec.channel)||rec.room!==d.room||!iv8Time(rec.time,s.playSeconds)||!s.visited.includes(d.room)||!d.proofs.every(p=>s.archives.includes(p))||!Array.isArray(rec.proofs)||rec.proofs.length!==3||!rec.proofs.every((p,i)=>p===d.proofs[i])||EARTH_DATA.chapters.findIndex(c=>c.id===d.chapter)>s.chapter)
   throw new Error('Enquête incohérente : sources, terminal, décision ou date invalide.');
  s.investigations.decisions[id]={channel:rec.channel,room:d.room,time:rec.time,proofs:[...d.proofs]};
 }
 for(const [id,rec] of Object.entries(v.departures)){
  const index=EARTH_DATA.chapters.findIndex(c=>c.id===id),c=EARTH_DATA.chapters[index];
  if(!c||!iv8Record(rec)||index>s.chapter||index===s.chapter&&!s.finished||!c.goals.every(g=>s.completed.includes(g))||!['recorded','migrated'].includes(rec.provenance)||!(rec.provenance==='migrated'?rec.time===null:iv8Time(rec.time,s.playSeconds)))
   throw new Error('Bilan de départ incompatible avec la progression.');
  s.investigations.departures[id]={time:rec.time,provenance:rec.provenance};
 }
 for(let i=0;i<s.chapter+(s.finished?1:0);i++)s.investigations.departures[EARTH_DATA.chapters[i].id]||={time:null,provenance:'migrated'};
 return s;
}

/** Report values are derived from authoritative gameplay state, not editable imported totals. */
export function sectorReportV8(s,chapterId){
 const chapter=EARTH_DATA.chapters.find(c=>c.id===chapterId);if(!chapter)return null;
 const rs=EARTH_DATA.rooms.filter(r=>r.chapter===chapterId),d=EARTH_DATA.investigations.find(v=>v.chapter===chapterId),departure=s.investigations?.departures?.[chapterId]||null;
 const count=(list,owned)=>list.filter(v=>owned.includes(v)).length;
 const companions=EARTH_DATA.survivors.filter(f=>IV8_ROOMS[f.room].chapter===chapterId).map(def=>{
  const f=s.survivors[def.id];return {id:def.id,name:def.name,status:f?.status||'not-met',room:f?.room||def.room,hp:f?.hp??null,medical:f?.status==='rescued'&&f.hp<=0};
 });
 const decision=s.investigations?.decisions[d.id]||null;
 return {chapter:chapterId,title:chapter.title,viewpoint:chapter.pov,status:departure?'closed':EARTH_DATA.chapters[s.chapter].id===chapterId?'active':'unvisited',departure:iv8Copy(departure),
  main:{done:count(chapter.goals,s.completed),total:chapter.goals.length},optional:{done:rs.filter(r=>r.optional&&s.completed.includes(r.task.id)).length,total:rs.filter(r=>r.optional).length},
  archives:{done:rs.filter(r=>s.archives.includes(r.archive.id)).length,total:rs.length},places:{done:rs.filter(r=>s.visited.includes(r.id)).length,total:rs.length},
  dossier:{id:d.id,title:d.title,proofs:d.proofs.filter(p=>s.archives.includes(p)),decision:iv8Copy(decision)},people:companions,
  studies:Object.values(s.containment.records).filter(r=>IV8_ROOMS[r.room].chapter===chapterId&&r.studied).map(r=>r.id),
  probesLeft:Object.values(s.sensors.units).filter(u=>u.status==='deployed'&&IV8_ROOMS[u.room].chapter===chapterId).map(u=>({id:u.id,room:u.room})),
  turbineStopped:rs.filter(r=>r.duct&&s.completed.includes(r.task.id)).length};
}
export function makeFieldReportV8(s){
 const chapters=EARTH_DATA.chapters.slice(0,s.chapter+1).map(c=>sectorReportV8(s,c.id));
 return {type:'alien-earth-field-report',schema:1,gameVersion:EARTH_DATA.version,simulationSeconds:s.playSeconds,finished:s.finished,
  notice:'Rapport dérivé de la sauvegarde locale. Ni une sauvegarde importable, ni une preuve d’envoi réel, ni une intégration MIRE. Textes et enquêtes originaux.',
  totals:{main:s.completed.filter(id=>EARTH_DATA.chapters.some(c=>c.goals.includes(id))).length,optional:s.completed.filter(id=>EARTH_DATA.rooms.some(r=>r.optional&&r.task.id===id)).length,archives:s.archives.length,visited:s.visited.length,evacuated:Object.values(s.survivors).filter(f=>f.status==='rescued').length,dossiers:Object.keys(s.investigations.decisions).length},chapters};
}
export function withEarthInvestigationsV8(Base,{near,visible}){
 return class EarthInvestigationEngine extends Base{
  investigationInfo(id){
   const d=IV8_DOSSIERS[id];if(!d)return null;
   return {definition:d,owned:d.proofs.filter(p=>this.state.archives.includes(p)),decision:this.state.investigations.decisions[id]||null};
  }
  openInvestigationAtTerminal(id){
   const d=IV8_DOSSIERS[id];if(!d||this.pending?.type!=='service-v4'||this.pending.id!==d.station||this.dead||this.state.finished||!this.handsFree())return false;
   const station=this.room.interactables.find(i=>i.id===d.station);
   if(this.room.id!==d.room||this.chapter.id!==d.chapter||!station||!near(this.player,station)||!visible(this.room,this.player,station))return false;
   this.pending={type:'investigation-v8',id:d.id,station:station.id};this.emit('investigationPanel',{id});return true;
  }
  queueInvestigation(id,proofs,channel){
   const d=IV8_DOSSIERS[id];
   if(!d||this.pending?.type!=='investigation-v8'||this.pending.id!==id||this.pending.station!==d.station||this.dead||this.state.finished||!this.handsFree())return false;
   const station=this.room.interactables.find(i=>i.id===d.station);
   if(!station||this.room.id!==d.room||!near(this.player,station)||!visible(this.room,this.player,station)||this.state.investigations.decisions[id])return false;
   if(!['local','network'].includes(channel)||!d.proofs.every(p=>this.state.archives.includes(p))){this.emit('toast',{text:'Les trois documents doivent être retrouvés avant de conserver cette enquête.'});return false;}
   if(!Array.isArray(proofs)||proofs.length!==3||!proofs.every((p,i)=>p===d.proofs[i])){this.emit('toast',{text:'Cette association ne correspond pas aux documents. Relisez chaque source : rien n’a été consommé.'});return false;}
   if(channel==='network'&&!this.channelOn('surveillance')){this.emit('toast',{text:'La diffusion exige le départ Surveillance. La copie locale reste disponible sans ce départ.'});return false;}
   this.pending=null;this.actionV3=null;this.listenWork=null;this.calmWork=null;
   this.serviceAction={kind:'dossier-v8',value:{id,channel,proofs:[...proofs]},id:d.station,x:station.x,z:station.z,time:0,duration:channel==='local'?2:4,key:'interact',label:channel==='local'?'Sceller une copie locale':'Diffuser le dossier · émission audible'};
   this.emit('toast',{text:'Maintenez E sur place. '+(channel==='local'?'La copie reste locale.':'La transmission fait du bruit et exige Surveillance.')});return true;
  }
  completeService(a){
   if(a.kind!=='dossier-v8')return super.completeService(a);
   const v=a.value,d=IV8_DOSSIERS[v?.id],station=d&&this.room.interactables.find(i=>i.id===d.station);
   if(!d||!station||this.dead||this.state.finished||!this.handsFree(true)||d.room!==this.room.id||!near(this.player,station)||!visible(this.room,this.player,station)||this.state.investigations.decisions[d.id]||!d.proofs.every(p=>this.state.archives.includes(p))||!['local','network'].includes(v.channel)||v.channel==='network'&&!this.channelOn('surveillance')||!Array.isArray(v.proofs)||!v.proofs.every((p,i)=>p===d.proofs[i])||v.proofs.length!==3)return false;
   this.state.investigations.decisions[d.id]={channel:v.channel,room:d.room,time:this.time,proofs:[...d.proofs]};
   this.log(d.title+' : '+(v.channel==='local'?'copie locale scellée.':'émission enregistrée sur le réseau interne.'),'investigation');
   this.emit('toast',{text:v.channel==='local'?'Dossier conservé localement, sans transmission.':'Dossier émis. La réception par un tiers n’est pas simulée.'});
   this.emit('sound',{kind:'service'});this.emit('save');return true;
  }
  update(dt,input={}){
   const a=this.serviceAction;
   if(a?.kind==='dossier-v8'&&a.value.channel==='network'){
    if(!this.channelOn('surveillance')){this.serviceAction=null;this.emit('toast',{text:'Transmission interrompue : Surveillance hors ligne. Aucune décision enregistrée.'});}
    else if(input.interact&&!input.x&&!input.z&&!this.pending&&!this.dead&&!this.state.finished&&near(this.player,a)&&visible(this.room,this.player,a))this.noise={x:a.x,z:a.z,radius:820,ttl:1.1};
   }
   return super.update(dt,input);
  }
  advanceChapter(){
   const id=this.chapter.id,time=this.time;const result=super.advanceChapter();
   if(result){this.state.investigations.departures[id]={time,provenance:'recorded'};if(this.state.finished)for(const f of Object.values(this.state.survivors))if(IV8_ROOMS[f.room].chapter===id&&!['rescued','left'].includes(f.status))f.status='left';this.checkpoint=this.snapshot();}
   return result;
  }
  restartCheckpoint(){const kept=iv8Copy(this.state.investigations);super.restartCheckpoint();this.state.investigations=kept;}
  fieldReport(){return makeFieldReportV8(this.snapshot());}
 };
}
