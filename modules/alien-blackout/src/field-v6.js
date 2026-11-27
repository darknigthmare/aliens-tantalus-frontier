/* v0.6 field operations. Existing collision and rescue state machines are reused.
 * Tactical exclusions use only player markings and public dated contacts.
 * Import validates in an isolated parent instance before any live assignment.
 */
(()=>{'use strict';
 const D=BO_DATA,R=BO.rooms,P=BO.BlackoutEngine,copy=BO.clone,C=D.field;
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),empty=()=>({evacuations:0,completed:0,beacons:0,interrupted:0});
 function fresh(e,old=null){const telemetry=old?copy(old.telemetry):empty(),stock=old?.stock??C.stock;
  return {stock,avoid:[],plans:e.crew.map(()=>null),jobs:e.crew.map(()=>null),beacons:[],telemetry,entry:{stock,telemetry:copy(telemetry)}};}
 function point(room,index){const r=R.get(room);if(!r)return null;
  const candidates=[{x:r.terminal[0]+(index-1.5)*32,y:r.terminal[1]},{x:335+index*52,y:478}];
  return candidates.find(p=>BO.validPoint(room,p))||null;}
 class FieldEngine extends P {
  loadSector(i,preserve=true){const old=this.v6;super.loadSector(i,preserve);this.v6=fresh(this,preserve?old:null);}
  start(d='survie',options={}){super.start(d,options);this.v6=fresh(this);}
  carePoint(room,i=this.selected){return point(room,i);}
  markAvoid(room=this.camera){if(!this.canCommand()||!this.chapter.rooms.includes(room))return false;
   const a=this.v6.avoid;if(a.includes(room))a.splice(a.indexOf(room),1);else a.push(room);return true;}
  exclusions(recent=true){return new Set([...this.v6.avoid,...(recent?this.contacts().filter(c=>c.age<3).map(c=>c.room):[])]);}
  fieldRoute(from,to,recent=true){if(!this.chapter.rooms.includes(from)||!this.chapter.rooms.includes(to))return null;
   if(from===to)return [];const avoid=this.exclusions(recent),q=[from],prev=new Map([[from,null]]);
   for(let j=0;j<q.length;j++)for(const n of this.neighbors(q[j],false)){
    if(avoid.has(n.id)||prev.has(n.id))continue;prev.set(n.id,{from:q[j],...n});
    if(n.id===to){const out=[];for(let v=to;v!==from;){const p=prev.get(v);out.unshift({...p});v=p.from;}return out;}q.push(n.id);
   }return null;
  }
  path(from,to,alien=false){return !alien&&this._fieldRouting?this.fieldRoute(from,to,this._fieldRouting.recent):super.path(from,to,alien);}
  navigate(c,room,target,speed,dt,alien=false){const i=this.crew.indexOf(c),p=this.v6?.plans[i],old=this._fieldRouting;
   if(!alien&&p)this._fieldRouting={recent:p.recent};
   try{return super.navigate(c,room,target,speed,dt,alien);}finally{this._fieldRouting=old;}
  }
  routeSeconds(c,route,from,target,carrying=false){
   let room=from.room,pos={x:from.x,y:from.y},seconds=0;
   const speed=(c.mode==='run'?160:c.mode==='walk'?108:72)*(this.v3.members[c.id].hp===1?.75:1)*(carrying?D.rescue.carryFactor:1);
   const add=end=>{const pts=BO.localPath(room,pos,end);if(!pts)return false;let length=0;for(const p of pts){length+=dist(pos,p);pos=p;}
    const steam=this.incidentActive&&this.incident.kind==='steam'&&this.incident.room===room;seconds+=length/(speed*(steam?.6:1));return true;};
   for(const n of route){if(!add(BO.port(room,n.side)))return Infinity;room=n.id;pos=BO.port(room,n.arrival);seconds+=.05;}
   return add(target)?seconds:Infinity;
  }
  previewEvacuation(i,targetIndex,room,recent=true,mode=null){
   const c=this.crew[i],t=this.crew[targetIndex],s=t?this.v5.members[t.id]:null,pt=point(room,i);
   const no=reason=>({ok:false,reason,approach:[],transport:[],seconds:null,margin:null,point:pt});
   if(!Number.isInteger(i)||!Number.isInteger(targetIndex)||!this.capable(i)||i===targetIndex||!t?.alive||!s?.down||s.carrier||this.v5.members[c.id].carrying)return no('Sélectionnez un sauveteur valide et un patient libre au sol.');
   if(typeof recent!=='boolean'||(mode!==null&&!['run','walk','sneak'].includes(mode))||!this.chapter.rooms.includes(room)||!pt)return no('Point de soins invalide.');
   if(this.v3.medkits<1)return no('Aucune trousse : le protocole exige une réanimation finale.');
   if(Object.entries(this.v5.members).some(([id,m])=>id!==c.id&&m.aid?.target===t.id))return no('Ce patient est déjà pris en charge.');
   const a=this.fieldRoute(c.room,t.room,recent),b=this.fieldRoute(t.room,room,recent);
   if(!a||!b)return no('Route fermée ou exclue par un marquage / contact récent.');
   const actor=mode?{...c,mode}:c;const seconds=this.routeSeconds(actor,a,c,t)+this.routeSeconds(actor,b,t,pt,true)+D.rescue.pickupSeconds+D.rescue.reviveSeconds;
   if(!Number.isFinite(seconds))return no('Un obstacle empêche de rejoindre le point de soins.');
   return {ok:true,reason:'Estimation sans attente ni évolution future de la menace.',approach:[c.room,...a.map(n=>n.id)],transport:[t.room,...b.map(n=>n.id)],seconds,margin:s.left-seconds,point:pt};
  }
  evacuate(i,targetIndex,room,recent=true){if(!this.canCommand())return false;const plan=this.previewEvacuation(i,targetIndex,room,recent);
   if(!plan.ok){this.emit('notice',plan.reason);return false;}
   if(!super.rescue(i,targetIndex,'carry'))return false;this.v6.jobs[i]=null;
   this.v6.plans[i]={target:this.crew[targetIndex].id,room,stage:'pickup',recent,blocked:false};this.v6.telemetry.evacuations++;
   this.emit('rescue',`${this.crew[i].name} : protocole de portage vers ${R.get(room).name}, puis réanimation. Le délai continue.`);return true;
  }
  resolveContact(c){const lethal=super.resolveContact(c);if(lethal||this.isIncapacitated(c))this.cancelField(this.crew.indexOf(c));return lethal;}
  die(c,bleed=false){super.die(c,bleed);this.cancelField(this.crew.indexOf(c));for(const [i,a]of this.crew.entries()){if(this.v5.members[a.id].aid?.target===c.id)this.cancelAid(i);if(this.v6?.plans[i]?.target===c.id)this.cancelField(i);}}
  cancelField(i){if(!this.v6)return;if(this.v6.jobs[i])this.v6.telemetry.interrupted++;this.v6.jobs[i]=null;this.v6.plans[i]=null;}
  order(i,...args){const ok=super.order(i,...args);if(ok)this.cancelField(i);return ok;}
  stop(i=this.selected){const ok=super.stop(i);if(ok)this.cancelField(i);return ok;}
  manual(dx,dy,dt,i=this.selected){const ok=super.manual(dx,dy,dt,i);if(ok)this.cancelField(i);return ok;}
  rescue(i,...args){const ok=super.rescue(i,...args);if(ok)this.cancelField(i);return ok;}
  drop(i=this.selected){const ok=super.drop(i);if(ok)this.cancelField(i);return ok;}
  startQueue(i=this.selected){const ok=super.startQueue(i);if(ok)this.cancelField(i);return ok;}
  directiveLocked(c){return super.directiveLocked(c)||!!this.v6?.jobs[this.crew.indexOf(c)]||!!this.v6?.plans[this.crew.indexOf(c)];}
  deployBeacon(i=this.selected,delay=10){
   const c=this.crew[i],m=c?this.v5.members[c.id]:null;
   if(!this.canCommand()||!this.capable(i)||!C.delays.includes(delay)||this.v6.stock<1||m.carrying||m.aid||this.v3.members[c.id].medical>0||this.v6.plans[i])return false;
   if(c.spotted>0||this.visibleThreats(c).length){this.emit('notice','Pose impossible sous la menace.');return false;}
   super.stop(i);this.cancelField(i);this.v6.jobs[i]={room:c.room,x:c.x,y:c.y,progress:0,delay};c.action='beacon';
   this.emit('beacon',`${c.name} pose une balise. Trois secondes, puis ${delay} secondes avant émission.`);return true;
  }
  updateDirectives(dt){super.updateDirectives(dt);if(!this.v6)return;
   for(const [i,c] of this.crew.entries()){
    const p=this.v6.plans[i],m=this.v5.members[c.id];
    if(p){const t=this.crew.find(c=>c.id===p.target),s=t?this.v5.members[t.id]:null;
     if(!this.capable(i)||!t?.alive){this.v6.plans[i]=null;}
     else if(!s.down){if(p.stage==='revive'){this.v6.telemetry.completed++;this.emit('rescue',`Protocole terminé : ${t.name} est conscient dans ${R.get(t.room).name}.`);}this.v6.plans[i]=null;}
     else if(p.stage==='pickup'){
      p.blocked=this.fieldRoute(c.room,t.room,p.recent)===null;
      if(m.carrying===t.id){p.stage='transport';p.blocked=false;}
      else if(!m.aid){this.v6.plans[i]=null;}
     }else if(p.stage==='transport'){
      if(m.carrying!==t.id){this.v6.plans[i]=null;continue;}
      p.blocked=this.fieldRoute(c.room,p.room,p.recent)===null;
      if(p.blocked){c.action='blocked';continue;}
      c.action='evacuating';const arrived=this.navigate(c,p.room,point(p.room,i),c.mode==='run'?160:c.mode==='walk'?108:72,dt);
      if(c.mode==='run'&&Math.floor(this.t*3)!==Math.floor((this.t+dt)*3))this.noise(c.room,3.8,3);
      this.syncPatients();
      if(arrived){this.releaseCargo(c,false);const old=this._dispatching;this._dispatching=true;
       try{if(super.rescue(i,this.crew.indexOf(t),'revive')){p.stage='revive';p.blocked=false;}else this.v6.plans[i]=null;}finally{this._dispatching=old;}
      }
     }else if(p.stage==='revive'){p.blocked=c.action==='rescue-wait';if(!m.aid&&s.down)this.v6.plans[i]=null;}
    }
    const job=this.v6.jobs[i];if(!job)continue;
    if(!this.capable(i)||m.carrying||c.room!==job.room||dist(c,job)>.1||c.spotted>0||this.visibleThreats(c).length){this.cancelField(i);if(c.alive)c.action='idle';continue;}
    c.action='beacon';job.progress=Math.min(C.deploySeconds,job.progress+dt);
    if(job.progress>=C.deploySeconds){this.v6.jobs[i]=null;c.action='idle';
     if(this.v6.stock>0){this.v6.stock--;this.v6.telemetry.beacons++;this.v6.beacons.push({id:this.v6.telemetry.beacons,room:job.room,x:job.x,y:job.y,wait:job.delay,life:C.life,pulse:0});
      this.emit('beacon',`Balise posée dans ${R.get(job.room).name}. ${this.v6.stock} restante(s) pour la campagne.`);
     }else this.emit('notice','La dernière balise vient d’être utilisée : aucune pose gratuite.');
    }
   }
  }
  updateBeacons(dt){for(const b of this.v6.beacons){if(b.wait>0){b.wait=Math.max(0,b.wait-dt);continue;}if(b.life<=0)continue;
    b.pulse-=dt;if(b.pulse<=0){this.noise(b.room,C.weight,2.5);b.pulse=C.pulseEvery;}b.life=Math.max(0,b.life-dt);
   }}
  step(dt){if(!this.escapeActive)this.updateBeacons(dt);super.step(dt);
   for(const [i,c]of this.crew.entries())if(!this.capable(i)){this.cancelField(i);}
   for(const [i,p]of this.v6.plans.entries())if(p&&!this.crew.some(c=>c.id===p.target&&c.alive&&this.isIncapacitated(c)))this.v6.plans[i]=null;
  }
  restart(){const escape=this.v4.escape.phase==='failed',entry=copy(this.v6.entry);super.restart();if(!escape){this.v6=fresh(this);this.v6.stock=entry.stock;this.v6.telemetry=copy(entry.telemetry);this.v6.entry=entry;}}
  snapshot(){const p=super.snapshot();p.schema=6;p.version='0.6.0';p.state.v6=copy(this.v6);return p;}
  restore(payload){const native=payload?.schema===6&&payload?.version==='0.6.0';
   if(!native&&!([1,2,3,4,5].includes(payload?.schema)&&payload.version===`0.${payload.schema}.0`))throw Error('Sauvegarde Blackout v0.1 à v0.6 attendue.');
   const base=copy(payload);if(native){base.schema=5;base.version='0.5.0';}
   const candidate=new P();candidate.restore(base);const next=native?validate(payload.state.v6,candidate):fresh(candidate);
   const cb=this.onEvent;for(const k of Object.keys(candidate))if(k!=='onEvent')this[k]=candidate[k];this.onEvent=cb;this.v6=next;this._fieldRouting=null;this._dispatching=false;this.paused=true;this.syncPatients();
   this.emit('restore',native?'Liaison v0.6 restaurée en pause : secours et balises conservés.':'Ancienne liaison importée en v0.6, en pause. Trois balises ajoutées ; état historique conservé.');return true;
  }
 }
 function validate(v,e){
  const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),num=(x,a,b)=>typeof x==='number'&&Number.isFinite(x)&&x>=a&&x<=b,int=(x,a,b)=>Number.isInteger(x)&&num(x,a,b),bad=s=>{throw Error('État v0.6 invalide : '+s);};
  const stats=s=>obj(s)&&Object.keys(empty()).every(k=>int(s[k],0,1e7))&&s.completed<=s.evacuations&&s.beacons<=C.stock;
  if(!obj(v)||!int(v.stock,0,C.stock)||!stats(v.telemetry)||v.stock+v.telemetry.beacons!==C.stock||!obj(v.entry)||!int(v.entry.stock,0,C.stock)||!stats(v.entry.telemetry)||v.entry.stock+v.entry.telemetry.beacons!==C.stock||v.stock>v.entry.stock)bad('stock ou compteurs');
  if(!Array.isArray(v.avoid)||new Set(v.avoid).size!==v.avoid.length||v.avoid.some(r=>!e.chapter.rooms.includes(r)))bad('marquages');
  if(!Array.isArray(v.plans)||v.plans.length!==4||!Array.isArray(v.jobs)||v.jobs.length!==4||!Array.isArray(v.beacons)||v.beacons.length>3)bad('listes');
  for(const [i,c]of e.crew.entries()){
   const p=v.plans[i],j=v.jobs[i],m=e.v5.members[c.id];
   if(p!==null){const t=e.crew.find(c=>c.id===p?.target),s=t?e.v5.members[t.id]:null;
    if(!obj(p)||!c.alive||m.down||!t?.alive||!s.down||t===c||!e.chapter.rooms.includes(p.room)||typeof p.recent!=='boolean'||typeof p.blocked!=='boolean'||!['pickup','transport','revive'].includes(p.stage)||j)bad('protocole');
    if(p.stage==='transport'?(m.carrying!==t.id||s.carrier!==c.id):(m.aid?.target!==t.id||m.aid.kind!==(p.stage==='pickup'?'carry':'revive')))bad('étape de secours');
   }
   if(j!==null){if(!obj(j)||!c.alive||m.down||m.carrying||m.aid||p||c.hidden||c.goal||c.room!==j.room||!BO.validPoint(j.room,j)||dist(c,j)>.1||!num(j.progress,0,C.deploySeconds)||!C.delays.includes(j.delay))bad('pose de balise');}
  }
  const ids=new Set();for(const b of v.beacons){if(!obj(b)||!int(b.id,1,C.stock)||b.id>v.telemetry.beacons||ids.has(b.id)||!e.chapter.rooms.includes(b.room)||!BO.validPoint(b.room,b)||!num(b.wait,0,15)||!num(b.life,0,C.life)||!num(b.pulse,0,C.pulseEvery)||b.wait>0&&b.life!==C.life)bad('balise');ids.add(b.id);}
  if(v.beacons.length!==v.entry.stock-v.stock)bad('inventaire local');
  for(const k of Object.keys(empty()))if(v.telemetry[k]<v.entry.telemetry[k])bad('historique');
  return {stock:v.stock,avoid:v.avoid.slice(),plans:v.plans.map(p=>p?{target:p.target,room:p.room,stage:p.stage,recent:p.recent,blocked:p.blocked}:null),jobs:v.jobs.map(j=>j?{room:j.room,x:j.x,y:j.y,progress:j.progress,delay:j.delay}:null),beacons:v.beacons.map(b=>({id:b.id,room:b.room,x:b.x,y:b.y,wait:b.wait,life:b.life,pulse:b.pulse})),telemetry:Object.fromEntries(Object.keys(empty()).map(k=>[k,v.telemetry[k]])),entry:{stock:v.entry.stock,telemetry:Object.fromEntries(Object.keys(empty()).map(k=>[k,v.entry.telemetry[k]]))}};
 }
 BO.BlackoutEngine=FieldEngine;BO.VERSION='0.6.0';globalThis.BO_V6={validate};
})();
