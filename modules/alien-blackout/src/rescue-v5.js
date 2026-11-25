/* v0.5 reconstructed from verified v0.4 sources. Deterministic rescue and locker
   search state machines. Saved state is whitelisted and validated transactionally. */
(()=>{'use strict';
 const D=BO_DATA,R=BO.rooms,P=BO.BlackoutEngine,copy=BO.clone,C=D.rescue;
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const counters=()=>({downed:0,revived:0,pickups:0,drops:0,bledOut:0,searches:0,discovered:0,diverted:0});
 const person=(downs=0)=>({down:false,left:0,downs,carrying:null,carrier:null,aid:null});
 const hunter=room=>({room,linger:0,cursor:0,cooldown:0,check:null});
 function fresh(e,old=null){const members=Object.fromEntries(e.crew.map(c=>[c.id,person(old?.members[c.id]?.downs||0)])),telemetry=old?copy(old.telemetry):counters();
 return {members,hunters:Object.fromEntries(e.aliens.map(a=>[a.id,hunter(a.room)])),lockers:{},telemetry,entry:{downs:e.crew.map(c=>members[c.id].downs),telemetry:copy(telemetry)}};}
 class RescueEngine extends P{
  loadSector(i,preserve=true){const old=this.v5;super.loadSector(i,preserve);this.v5=fresh(this,preserve?old:null);this.syncPatients();}
  start(d='survie',options={}){super.start(d,options);this.v5=fresh(this);this.syncPatients();this.emit('liaison','Protocole de secours actif. Un patient au sol doit être rejoint, mis à l’abri et réanimé. Les casiers peuvent être fouillés.');}
  get disableLegacyLockerReveal(){return true;}
  isIncapacitated(c){return this.v5?.members[c.id]?.down===true;}
  capable(i){const c=this.crew[i];return !!(c?.alive&&!this.isIncapacitated(c));}
  directiveLocked(c){const m=this.v5?.members[c.id];return !!(m&&(m.down||m.aid||m.carrying));}
  clearMotion(c){c.goal=null;c.local=[];c.route=[];c.pathKey=null;c.work=false;c.hidden=false;c.action='idle';
   const m=this.v3.members[c.id];m.medical=0;m.following=null;m.retreat=null;m.interrupted=null;this.clearQueue(this.crew.indexOf(c),true);}
  cancelAid(i){const c=this.crew[i];if(c&&this.v5?.members[c.id])this.v5.members[c.id].aid=null;}
  order(i,room,type='move',service=null){
   if(!this.capable(i))return false;const c=this.crew[i],m=this.v5.members[c.id];
   if(m.carrying&&!['move','exit'].includes(type)){this.emit('notice','Déposez le patient avant de vous cacher ou de travailler.');return false;}
   if(type==='hide'&&(this.v5.lockers[room+':'+i]||0)>0){this.emit('notice','Ce casier vient d’être fouillé. Quittez la pièce ou attendez la remise en sécurité.');return false;}
   const ok=super.order(i,room,type,service);if(ok)this.cancelAid(i);return ok;
  }
  stop(i=this.selected){if(!this.capable(i))return false;const ok=super.stop(i);if(ok)this.cancelAid(i);return ok;}
  mode(value,i=this.selected){if(!this.capable(i))return false;return super.mode(value,i);}
  manual(dx,dy,dt,i=this.selected){if(!this.capable(i))return false;const factor=this.v5.members[this.crew[i].id].carrying?C.carryFactor:1;
   const ok=super.manual(dx,dy,dt*factor,i);if(ok){this.cancelAid(i);this.syncPatients();}return ok;}
  treat(i=this.selected){if(!this.capable(i)||this.v5.members[this.crew[i].id].carrying)return false;return super.treat(i);}
  reassure(i=this.selected){if(!this.capable(i))return false;return super.reassure(i);}
  setAutonomy(v,i=this.selected){if(!this.capable(i))return false;return super.setAutonomy(v,i);}
  followCrew(i,leader){if(!this.capable(i)||!this.capable(leader)||this.v5.members[this.crew[i].id].carrying||this.v5.members[this.crew[leader].id].carrying)return false;return super.followCrew(i,leader);}
  enqueue(i,it){if(!this.capable(i)||this.v5.members[this.crew[i].id].carrying)return false;return super.enqueue(i,it);}
  startQueue(i=this.selected){if(!this.capable(i)||this.v5.members[this.crew[i].id].carrying)return false;const ok=super.startQueue(i);if(ok)this.cancelAid(i);return ok;}
  internalOrder(c,room,type='move'){if(this.directiveLocked(c))return false;return super.internalOrder(c,room,type);}
  workRate(workers,task){const active=workers.filter(c=>!this.directiveLocked(c));return active.length?super.workRate(active,task):0;}
  terminalReady(){return super.terminalReady()&&this.crew.some(c=>c.alive&&!this.directiveLocked(c)&&c.work&&c.goal?.type==='task'&&c.room===this.currentTask?.room);}
  walk(a,p,speed,dt){return super.walk(a,p,speed*(this.v5?.members[a.id]?.carrying?C.carryFactor:1),dt);}
  resolveContact(c){
   const s=this.v5.members[c.id],m=this.v3.members[c.id];
   if(s.down)return false;
   if(m.hp===2){m.hp=1;m.medical=0;c.attack=0;c.stress=100;this.v3.telemetry.injuries++;this.emit('injury',`${c.name} est blessé. Éloignez-le : un autre contact peut le mettre au sol.`);return false;}
   if(m.hp===1&&s.downs===0){
    this.releaseCargo(c,false);this.clearMotion(c);s.aid=null;s.down=true;s.downs=1;s.left=C.bleed[this.difficulty];c.attack=0;c.spotted=0;c.action='downed';c.stress=100;
    this.v5.telemetry.downed++;this.emit('downed',`${c.name} est au sol. ${Math.round(s.left)} secondes pour le secourir. Sélectionnez un sauveteur.`);
    this.syncPatients();return false;
   }
   if(m.hp<=1)this.releaseCargo(c,false);
   return super.resolveContact(c);
  }
  rescue(i,targetIndex,kind='revive'){
   if(!this.canCommand()||!this.capable(i)||!this.crew[targetIndex]||i===targetIndex||!['revive','carry'].includes(kind))return false;
   const c=this.crew[i],target=this.crew[targetIndex],m=this.v5.members[c.id],t=this.v5.members[target.id];
   if(!target.alive||!t.down||t.carrier||m.carrying||(kind==='revive'&&this.v3.medkits<1))return false;
   if(Object.entries(this.v5.members).some(([id,v])=>id!==c.id&&v.aid?.target===target.id)){this.emit('notice','Un autre équipier a déjà pris en charge ce patient.');return false;}
   if(!this.path(c.room,target.room)){this.emit('notice','Pas de route ouverte vers le patient. Libérez le passage avant le secours.');return false;}
   this.clearMotion(c);m.aid={target:target.id,kind,progress:0};c.action='rescue';this.emit('rescue',`${c.name} rejoint ${target.name} pour ${kind==='carry'?'le transporter':'le réanimer'}.`);return true;
  }
  releaseCargo(c,announce=true){const s=this.v5.members[c.id];if(!s?.carrying)return false;const p=this.crew.find(x=>x.id===s.carrying),m=p?this.v5.members[p.id]:null;
   if(p&&m){p.room=c.room;p.x=c.x;p.y=c.y;p.hidden=false;p.action='downed';m.carrier=null;}
   s.carrying=null;this.v5.telemetry.drops++;if(announce)this.emit('rescue',`${c.name} dépose le patient. Le délai de secours continue.`);this.syncPatients();return true;}
  drop(i=this.selected){if(!this.canCommand()||!this.capable(i))return false;return this.releaseCargo(this.crew[i]);}
  syncPatients(){if(!this.v5)return;for(const c of this.crew){const m=this.v5.members[c.id];if(!m)continue;
    if(m.carrier){const car=this.crew.find(x=>x.id===m.carrier);if(car){c.room=car.room;c.x=car.x;c.y=car.y;}}
    c.incapacitated=m.down;c.carried=!!m.carrier;if(m.down){c.goal=null;c.work=false;c.hidden=false;c.attack=0;c.spotted=0;c.action=m.carrier?'carried':'downed';}
   }}
  die(c,bleed=false){if(!c.alive)return;this.releaseCargo(c,false);const m=this.v5.members[c.id];if(m.carrier){const car=this.crew.find(x=>x.id===m.carrier);if(car)this.releaseCargo(car,false);}
   this.clearMotion(c);Object.assign(m,{down:false,left:0,aid:null,carrying:null,carrier:null});c.alive=false;this.v3.members[c.id].hp=0;
   if(this.selected===this.crew.indexOf(c))this.selected=Math.max(0,this.crew.findIndex(v=>v.alive&&!this.isIncapacitated(v)));
   this.stats.losses++;if(bleed)this.v5.telemetry.bledOut++;this.emit('death',`${c.name} ne répond plus${bleed?' : le délai de secours est épuisé':''}.`);
  }
  updateRescue(dt){
   for(const c of this.crew){const m=this.v5.members[c.id];if(!c.alive||m.down||!m.aid)continue;const a=m.aid,p=this.crew.find(x=>x.id===a.target),s=p?this.v5.members[p.id]:null;
    if(!p?.alive||!s?.down||s.carrier){m.aid=null;c.action='idle';continue;}
    if(!this.path(c.room,p.room)){a.progress=0;c.action='blocked';continue;}
    const near=c.room===p.room&&distance(c,p)<=48&&!R.get(c.room).obstacles.some(o=>BO.blocked(c,p,o));
    if(!near){a.progress=0;c.action='rescue';this.navigate(c,p.room,p,c.mode==='run'?160:c.mode==='walk'?108:72,dt);continue;}
    if(c.spotted>0||this.visibleThreats(c).length){a.progress=0;c.action='rescue-wait';continue;}
    c.action=a.kind==='carry'?'lifting':'reviving';a.progress=Math.min(a.kind==='carry'?C.pickupSeconds:C.reviveSeconds,a.progress+dt);
    if(a.progress<(a.kind==='carry'?C.pickupSeconds:C.reviveSeconds))continue;
    if(a.kind==='carry'){s.carrier=c.id;m.carrying=p.id;m.aid=null;c.action='idle';this.v5.telemetry.pickups++;this.emit('rescue',`${c.name} porte ${p.name}. Déposez-le avant de soigner ; le temps continue.`);}
    else if(this.v3.medkits>0){this.v3.medkits--;this.v3.telemetry.treatments++;this.v5.telemetry.revived++;Object.assign(s,{down:false,left:0,carrier:null});this.v3.members[p.id].hp=1;p.attack=0;p.spotted=0;p.action='idle';m.aid=null;c.action='idle';
     this.emit('rescue',`${p.name} est conscient mais reste blessé. ${this.v3.medkits} trousse(s) restante(s).`);
    }else{m.aid=null;c.action='idle';this.emit('notice','La dernière trousse a été utilisée. Aucun soin gratuit n’a été appliqué.');}
   }
   this.syncPatients();
  }
  updateDirectives(dt){super.updateDirectives(dt);this.updateRescue(dt);}
  extractionReady(dt){if(this.crew.some(c=>c.alive&&this.v5.members[c.id].down)){this.v3.evac=0;return false;}return super.extractionReady(dt);}
  updateAlien(a,dt){
   const h=this.v5.hunters[a.id];if(!h)return super.updateAlien(a,dt);
   if(h.room!==a.room){h.room=a.room;h.linger=0;h.check=null;}
   h.cooldown=Math.max(0,h.cooldown-dt);
   if(a.inVent||a.refuge||a.refugeApproach){h.check=null;h.linger=0;return super.updateAlien(a,dt);}
   const seen=this.crew.some(c=>c.alive&&!this.isIncapacitated(c)&&c.room===a.room&&(!c.hidden||c.spotted>0)&&distance(a,c)<230&&!R.get(c.room).obstacles.some(o=>BO.blocked(a,c,o)));
   if(seen){h.check=null;h.linger=0;return super.updateAlien(a,dt);}
   const lure=this.audible(a).find(n=>n.room!==a.room&&n.score>=3.5&&n.weight>=6);
   if(h.check&&lure){h.check=null;h.cooldown=8;h.linger=0;a.memory=null;a.goal={room:lure.room,x:800,y:478};a.pathKey=null;a.local=[];this.v5.telemetry.diverted++;return super.updateAlien(a,dt);}
   if(!h.check){h.linger+=dt;const memory=a.memory?.room===a.room?a.memory:null;
    const threshold=memory?1.5:this.difficulty==='recit'?24:this.difficulty==='survie'?18:14;
    if(h.cooldown<=0&&h.linger>=threshold){const r=R.get(a.room);let slot=h.cursor%4;
     if(memory)slot=r.hide.reduce((best,p,i)=>distance({x:p[0],y:p[1]},memory)<distance({x:r.hide[best][0],y:r.hide[best][1]},memory)?i:best,0);
     h.cursor=(slot+1)%4;h.check={room:a.room,slot,progress:0,announced:false};a.pressure=null;a.goal=null;a.pathKey=null;a.local=[];
    }
   }
   if(!h.check)return super.updateAlien(a,dt);
   const k=h.check,point={x:R.get(k.room).hide[k.slot][0],y:R.get(k.room).hide[k.slot][1]};a.state='search';
   if(a.memory){a.memory.left=Math.max(0,a.memory.left-dt);if(!a.memory.left)a.memory=null;}
   if(!this.walk(a,point,this.config.alienSpeed,dt))return;
   if(!k.announced){k.announced=true;if(this.camera===a.room&&this.cameraAvailable()||this.link&&this.crew.some(c=>c.alive&&c.room===a.room&&distance(c,a)<240))this.emit('search',`Raclement de casier — ${R.get(a.room).name}. Une fouille est en cours.`);}
   k.progress=Math.min(C.lockerCheck,k.progress+dt);if(k.progress<C.lockerCheck)return;
   this.v5.lockers[k.room+':'+k.slot]=C.lockerLock;this.v5.telemetry.searches++;
   for(const c of this.crew)if(c.alive&&!this.isIncapacitated(c)&&c.hidden&&c.room===k.room&&distance(c,point)<26){c.hidden=false;c.spotted=6;c.attack=0;c.action='idle';this.v5.telemetry.discovered++;this.emit('discovered',`${c.name} : « Il ouvre le casier ! »`);}
   h.check=null;h.linger=0;h.cooldown=12;a.memory=null;a.goal=null;a.pathKey=null;a.local=[];
  }
  step(dt){
   if(this.escapeActive){super.step(dt);return;}
   for(const key of Object.keys(this.v5.lockers)){this.v5.lockers[key]=Math.max(0,this.v5.lockers[key]-dt);if(!this.v5.lockers[key])delete this.v5.lockers[key];}
   // Medical deadlines are world time, including time carried and radio loss.
   for(const c of this.crew){const m=this.v5.members[c.id];if(c.alive&&m.down){m.left=Math.max(0,m.left-dt);if(m.left===0)this.die(c,true);}}
   super.step(dt);this.syncPatients();
   for(const [i,c]of this.crew.entries()){const m=this.v5.members[c.id];
    if(!c.alive){this.releaseCargo(c,false);m.aid=null;m.down=false;m.left=0;this.clearQueue(i,true);}
    if(c.hidden&&(this.v5.lockers[c.room+':'+i]||0)>0){c.hidden=false;c.goal=null;c.action='idle';}
   }
   this.syncPatients();
   if(this.status==='playing'&&!this.escapeActive&&!this.crew.some(c=>c.alive&&!this.isIncapacitated(c)))this.fail('Aucun équipier valide ne peut poursuivre ou secourir les autres. Reprenez le secteur.');
  }
  restart(){if(this.v4.escape.phase==='failed'){super.restart();return;}
   const entry=copy(this.v5.entry);super.restart();this.v5=fresh(this);this.v5.telemetry=copy(entry.telemetry);this.v5.entry=entry;this.crew.forEach((c,i)=>this.v5.members[c.id].downs=entry.downs[i]);this.syncPatients();}
  snapshot(){this.syncPatients();const p=super.snapshot();p.schema=5;p.version='0.5.0';p.state.v5=copy(this.v5);return p;}
  restore(payload){
   const native=payload?.schema===5&&payload?.version==='0.5.0';if(!native&&!([1,2,3,4].includes(payload?.schema)&&payload.version===`0.${payload.schema}.0`))throw Error('Sauvegarde Blackout v0.1 à v0.5 attendue.');
   const base=copy(payload);if(native){base.schema=4;base.version='0.4.0';}
   const candidate=new P();candidate.restore(base);const v=native?validate(payload.state.v5,candidate):fresh(candidate);
   const cb=this.onEvent;for(const k of Object.keys(candidate))if(k!=='onEvent')this[k]=candidate[k];this.onEvent=cb;this.v5=v;this.paused=true;this.syncPatients();
   this.emit('restore',native?'Liaison v0.5 restaurée en pause : patients, portage et fouilles conservés.':'Ancienne liaison importée en v0.5. Les morts et les ressources restent inchangés.');return true;
  }
 }
 function validate(v,e){
  const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),num=(x,a,b)=>typeof x==='number'&&Number.isFinite(x)&&x>=a&&x<=b,int=(x,a,b)=>Number.isInteger(x)&&num(x,a,b),fail=s=>{throw Error('État v0.5 invalide : '+s);};
  const count=x=>obj(x)&&Object.keys(counters()).every(k=>int(x[k],0,1e7));
  if(!obj(v)||!obj(v.members)||Object.keys(v.members).length!==4||!count(v.telemetry)||!obj(v.entry)||!count(v.entry.telemetry)||!Array.isArray(v.entry.downs)||v.entry.downs.length!==4||v.entry.downs.some(x=>!int(x,0,1)))fail('structure ou compteurs');
  const ids=e.crew.map(c=>c.id),validId=x=>x===null||ids.includes(x);const claimed=new Set();
  for(const [i,c]of e.crew.entries()){
   const m=v.members[c.id];if(!obj(m)||typeof m.down!=='boolean'||!int(m.downs,0,1)||!num(m.left,0,C.bleed[e.difficulty])||!validId(m.carrier)||!validId(m.carrying)||m.carrier===c.id||m.carrying===c.id||m.downs<v.entry.downs[i])fail('patient');
   if(m.down&&(!c.alive||e.v3.members[c.id].hp!==1||m.left<=0||m.downs!==1||c.goal||c.hidden||c.work||m.aid||m.carrying)||!m.down&&(m.left!==0||m.carrier))fail('inconscience incohérente');
   if(!c.alive&&(m.aid||m.carrying||m.carrier))fail('mort en activité');
   if(m.carrier){const car=e.crew.find(x=>x.id===m.carrier);if(!car.alive||v.members[car.id]?.down||v.members[car.id]?.carrying!==c.id||car.room!==c.room||distance(car,c)>.001)fail('portage non réciproque');}
   if(m.carrying){if(!c.alive||m.down||m.aid||v.members[m.carrying]?.carrier!==c.id||!v.members[m.carrying]?.down||c.hidden||c.goal&&!['move','exit'].includes(c.goal.type))fail('porteur invalide');}
   if(m.aid!==null){const a=m.aid;if(!obj(a)||!ids.includes(a.target)||a.target===c.id||!['revive','carry'].includes(a.kind)||!num(a.progress,0,a.kind==='carry'?C.pickupSeconds:C.reviveSeconds)||!c.alive||m.down||m.carrying||c.goal||!v.members[a.target]?.down||v.members[a.target]?.carrier||claimed.has(a.target))fail('secours invalide');claimed.add(a.target);}
   if(m.down&&(e.v4.queues[i].items.length||e.v4.queues[i].current))fail('patient avec file');
  }
  if(v.telemetry.revived>4||v.telemetry.revived>v.telemetry.downed||v.telemetry.revived>e.v3.telemetry.treatments)fail('consommation');
  if(e.status!=='failed'&&['sector-complete','won'].includes(e.status)&&Object.values(v.members).some(m=>m.down))fail('patient abandonné');
  if(!obj(v.hunters)||Object.keys(v.hunters).length!==e.aliens.length||!obj(v.lockers)||Object.keys(v.lockers).length>e.chapter.rooms.length*4)fail('menaces');
  const hs={};for(const a of e.aliens){const h=v.hunters[a.id];if(!obj(h)||!e.chapter.rooms.includes(h.room)||!num(h.linger,0,1e7)||!int(h.cursor,0,3)||!num(h.cooldown,0,12))fail('surveillance casiers');
   if(h.check!==null){const c=h.check;if(!obj(c)||c.room!==a.room||!int(c.slot,0,3)||!num(c.progress,0,C.lockerCheck)||typeof c.announced!=='boolean'||a.inVent||a.refuge)fail('fouille');}
   hs[a.id]={room:h.room,linger:h.linger,cursor:h.cursor,cooldown:h.cooldown,check:h.check?{room:h.check.room,slot:h.check.slot,progress:h.check.progress,announced:h.check.announced}:null};}
  const lockers={};for(const [key,x]of Object.entries(v.lockers)){const parts=key.split(':');if(parts.length!==2||!e.chapter.rooms.includes(parts[0])||!['0','1','2','3'].includes(parts[1])||!num(x,0,C.lockerLock))fail('casier');lockers[key]=x;}
  return {members:Object.fromEntries(ids.map(id=>{const m=v.members[id];return [id,{down:m.down,left:m.left,downs:m.downs,carrying:m.carrying,carrier:m.carrier,aid:m.aid?{target:m.aid.target,kind:m.aid.kind,progress:m.aid.progress}:null}];})),hunters:hs,lockers,telemetry:Object.fromEntries(Object.keys(counters()).map(k=>[k,v.telemetry[k]])),entry:{downs:v.entry.downs.slice(),telemetry:Object.fromEntries(Object.keys(counters()).map(k=>[k,v.entry.telemetry[k]]))}};
 }
 BO.BlackoutEngine=RescueEngine;BO.VERSION='0.5.0';globalThis.BO_V5={validate};
})();
