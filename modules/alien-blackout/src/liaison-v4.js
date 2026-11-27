/* V0.4: transmitted route queues, dated surveillance, physical maintenance,
   and Amanda's continuous final traversal. No network, no host save access. */
(()=>{'use strict';
 const D=BO_DATA,R=BO.rooms,Parent=BO.BlackoutEngine,copy=BO.clone;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const stats=()=>({ordersSent:0,ordersCompleted:0,sweeps:0,incidents:0,prevented:0,repaired:0,escapeRetries:0});
 const queue=()=>({items:[],current:null,wait:0,enabled:false,blocked:false,suspended:false});
 const escape=()=>({phase:'none',x:D.escape.start,enemyX:D.escape.enemyStart,left:D.escape.time,elapsed:0,gates:[0,0,0],enemyGates:[0,0,0]});
 function initial(e,old=null){return {queues:e.crew.map(queue),cameraDelay:0,sweepLeft:0,observations:[],pins:[],cycle:false,cycleLeft:4,
   incident:{phase:'dormant'},telemetry:old?copy(old.telemetry):stats(),entry:old?copy(old.telemetry):stats(),escape:escape()};}
 class BlackoutEngineV4 extends Parent{
  loadSector(index,preserve=true){const old=this.v4;super.loadSector(index,preserve);this.v4=initial(this,preserve?old:null);this.escapeInput={axis:0,use:false};}
  start(difficulty='survie',options={}){super.start(difficulty,options);this.v4=initial(this);this.emit('liaison','Le capteur balaie toutes les 2,5 s. Les échos vieillissent. Préparez les itinéraires avant de couper la liaison.');}
  canCommand(){if(this.v4?.escape.phase==='running')return false;if(this._dispatching&&this.status==='playing')return true;return super.canCommand();}
  get incident(){return this.chapter.incident;}
  get incidentActive(){return this.v4?.incident.phase==='active';}
  get escapeActive(){return this.v4?.escape.phase==='running';}
  isSignalLost(room){return this.incidentActive&&this.incident.kind==='signal'&&this.incident.room===room;}
  cameraAvailable(room=this.camera){return !!(this.link&&this.monitor&&this.brokenCamera!==room&&!this.isSignalLost(room)&&this.v4.cameraDelay<=0&&!this.escapeActive);}
  cameraTo(room){const old=this.camera,ok=super.cameraTo(room);if(ok&&old!==room&&this.v4)this.v4.cameraDelay=.65;return ok;}
  sealRefuge(){if(this.escapeActive)return false;return super.sealRefuge();}
  pinCamera(room=this.camera){if(!this.canCommand()||!this.chapter.rooms.includes(room))return false;const pins=this.v4.pins;
   if(pins.includes(room)){pins.splice(pins.indexOf(room),1);if(pins.length<2)this.v4.cycle=false;return true;}
   if(pins.length>=3){this.emit('notice','Trois caméras maximum. Retirez une épingle avant d’en ajouter une.');return false;}pins.push(room);return true;}
  toggleCycle(){if(!this.canCommand()||this.v4.pins.length<2)return false;this.v4.cycle=!this.v4.cycle;this.v4.cycleLeft=4;return true;}
  updateObservation(dt){
   this.v4.cameraDelay=Math.max(0,this.v4.cameraDelay-dt);
   this.v4.observations=this.v4.observations.filter(o=>this.t-o.at<=8);
   const store=(a,kind)=>{const old=this.v4.observations.find(o=>o.id===a.id),n={id:a.id,room:a.room,at:this.t,kind};if(kind==='camera'){n.x=a.x;n.y=a.y;}
    if(old){delete old.x;delete old.y;Object.assign(old,n);}else this.v4.observations.push(n);};
   if(this.link&&this.sensor){this.v4.sweepLeft-=dt;if(this.v4.sweepLeft<=0){this.v4.sweepLeft=2.5;this.v4.telemetry.sweeps++;
    for(const a of this.aliens)if(!a.inVent&&!a.refuge&&!this.isSignalLost(a.room))store(a,'sensor');}}
   else this.v4.sweepLeft=0;
   if(this.cameraAvailable()){const seen=this.aliens.filter(a=>!a.inVent&&!a.refuge&&a.room===this.camera);this.v4.observations=this.v4.observations.filter(o=>o.room!==this.camera||seen.some(a=>a.id===o.id));for(const a of seen)store(a,'camera');}
   if(this.v4.cycle&&this.link&&this.monitor&&this.v4.pins.length>1){this.v4.cycleLeft-=dt;if(this.v4.cycleLeft<=0){const idx=this.v4.pins.indexOf(this.camera);this.cameraTo(this.v4.pins[(idx+1)%this.v4.pins.length]);this.v4.cycleLeft=4;}}
  }
  contacts(){if(!this.v4||this.escapeActive)return [];
   return this.v4.observations.filter(o=>this.t-o.at<=8).map(o=>{
    const age=Math.max(0,this.t-o.at),live=o.kind==='camera'&&age<.11&&o.room===this.camera&&this.cameraAvailable();
    return {room:o.room,at:o.at,age,kind:live?'camera':'echo',...(live?{x:o.x,y:o.y}:{})};
   });}
  clearQueue(index=this.selected,force=false){if(!this.v4?.queues[index]||(!force&&!this.canCommand()))return false;this.v4.queues[index]=queue();return true;}
  order(index,room,type='move',service=null){if(this.escapeActive)return false;const ok=super.order(index,room,type,service);if(ok&&!this._dispatching)this.clearQueue(index,true);return ok;}
  stop(index=this.selected){const ok=super.stop(index);if(ok&&!this._dispatching)this.clearQueue(index,true);return ok;}
  manual(dx,dy,dt,index=this.selected){if(this.escapeActive)return false;const ok=super.manual(dx,dy,dt,index);if(ok)this.clearQueue(index,true);return ok;}
  enqueue(index,item){
   if(!this.canCommand()||!this.crew[index]?.alive||!validOrder(item,this))return false;
   const q=this.v4.queues[index];if(q.items.length+(q.current?1:0)>=6){this.emit('notice','La file contient déjà six consignes.');return false;}
   q.items.push(cleanOrder(item));this.v4.telemetry.ordersSent++;return true;
  }
  startQueue(index=this.selected){if(!this.canCommand()||!this.crew[index]?.alive)return false;const q=this.v4.queues[index];if(!q.items.length&&!q.current)return false;
   if(!q.enabled&&!q.current){this._dispatching=true;try{super.stop(index);}finally{this._dispatching=false;}}
   q.enabled=true;q.suspended=false;q.blocked=false;
   const m=this.v3.members[this.crew[index].id];m.interrupted=null;m.retreat=null;m.following=null;m.medical=0;
   this.emit('order',`${this.crew[index].name} : itinéraire embarqué, ${q.items.length+(q.current?1:0)} consigne(s).`);return true;
  }
  pauseQueue(index=this.selected){if(!this.canCommand())return false;const q=this.v4.queues[index];if(!q)return false;q.suspended=true;
   const c=this.crew[index];c.goal=null;c.work=false;c.local=[];c.pathKey=null;return true;}
  finishQueued(q){q.current=null;q.wait=0;q.blocked=false;this.v4.telemetry.ordersCompleted++;}
  updateQueues(dt){
   for(let i=0;i<this.crew.length;i++){
    const c=this.crew[i],q=this.v4.queues[i],m=this.v3.members[c.id];
    if(!c.alive){this.clearQueue(i,true);continue;}
    if(this.directiveLocked?.(c)){q.suspended=true;continue;}
    if(!q.enabled||q.suspended)continue;
    if(m.retreat||m.interrupted||m.medical>0||m.following){q.suspended=true;continue;}
    if(q.current){const it=q.current;
     if(it.type==='wait'){q.wait=Math.max(0,q.wait-dt);if(q.wait>0)continue;this.finishQueued(q);}
     else{
      const done=it.type==='task'?this.chapter.tasks.findIndex(t=>t.protocol.id===it.taskId)<this.taskIndex:
       it.type==='service'?this.serviceState[it.service].done:it.type==='repair'?this.brokenCamera===null:
       it.type==='hide'?c.room===it.room&&c.hidden&&!c.goal:c.room===it.room&&!c.goal;
      if(done)this.finishQueued(q);
      else if(c.goal){q.blocked=!this.path(c.room,c.goal.room);continue;}
      else{q.items.unshift(it);q.current=null;}
     }
    }
    if(!q.items.length){q.enabled=false;continue;}
    const it=q.items[0];
    if(it.type==='task'){
     const ordinal=this.chapter.tasks.findIndex(t=>t.protocol.id===it.taskId);
     if(ordinal<this.taskIndex){q.items.shift();this.v4.telemetry.ordersCompleted++;continue;}
     if(ordinal>this.taskIndex){q.blocked=true;continue;}
    }
    if(it.type==='service'&&this.serviceState[it.service].done||it.type==='repair'&&!this.brokenCamera){q.items.shift();this.v4.telemetry.ordersCompleted++;continue;}
    if(it.type==='wait'){q.current=q.items.shift();q.wait=it.seconds;c.action='waiting';continue;}
    if(!this.path(c.room,it.room)){q.blocked=true;continue;}
    this._dispatching=true;let ok=false;try{ok=super.order(i,it.room,it.type,it.service);}finally{this._dispatching=false;}
    if(ok){c.mode=it.mode;q.current=q.items.shift();q.blocked=false;}
   }
  }
  walk(actor,point,speed,dt){const steam=this.incidentActive&&this.incident.kind==='steam'&&this.incident.room===actor.room;return super.walk(actor,point,speed*(steam?.6:1),dt);}
  manualSpeedFactor(c){return this.incidentActive&&this.incident.kind==='steam'&&this.incident.room===c.room?.6:1;}
  workRate(workers,task){const steam=this.incidentActive&&this.incident.kind==='steam'&&this.incident.room===task.room;return super.workRate(workers,task)*(steam?.7:1);}
  updateIncident(dt){
   const v=this.v4.incident,def=this.incident,done=this.serviceState[def.id].done;
   if(done&&!['prevented','repaired'].includes(v.phase)){const wasActive=v.phase==='active';v.phase=wasActive?'repaired':'prevented';this.v4.telemetry[wasActive?'repaired':'prevented']++;this.emit('maintenance',wasActive?'Incident neutralisé. Les systèmes locaux sont rétablis.':'Maintenance préventive terminée. Cet incident ne se déclenchera pas.');}
   if(v.phase==='dormant'&&this.sectorElapsed>=def.warningAt){v.phase='warning';this.emit('incident',`${def.title} : préalerte. Dix secondes avant dégradation. Maintenance disponible dans ${R.get(def.room).name}.`);}
   if(v.phase==='warning'&&this.sectorElapsed>=def.warningAt+def.delay){v.phase='active';this.v4.telemetry.incidents++;this.emit('incident',`${def.title} : incident actif. ${def.effect}`);}
   if(v.phase==='active'){
    if(def.kind==='power')this.energy=Math.max(0,this.energy-.055*dt);
    if(def.kind==='steam'&&Math.floor(this.t/3)!==Math.floor((this.t-dt)/3))this.noise(def.room,3,4);
   }
  }
  extractionReady(dt){
   if(this.chapterIndex!==6)return true;
   if(!super.extractionReady(dt))return false;
   if(this.v4.escape.phase==='complete'||this.v4.escape.phase==='legacy')return true;
   if(this.v4.escape.phase==='none'){
    this.v4.observations=[];this.v4.escape={...escape(),phase:'running'};this.escapeInput={axis:0,use:false};
    this.emit('escape','Le Haldin est amarré. Amanda quitte sa console : rejoignez le sas, actionnez les trois manivelles et attendez la coupure du ventilateur.');
   }
   return false;
  }
  setEscapeInput(axis=0,use=false){if(![-1,0,1].includes(axis)||typeof use!=='boolean')return false;this.escapeInput={axis,use};return true;}
  get fanActive(){return this.v4.escape.elapsed%D.escape.fan.period<D.escape.fan.active;}
  get nearbyCrank(){return D.escape.gates.findIndex((g,i)=>this.v4.escape.gates[i]<g.seconds&&Math.abs(g.x-40-this.v4.escape.x)<=68);}
  escapeStep(dt){
   const s=this.v4.escape,input=this.escapeInput||{axis:0,use:false};this.t+=dt;s.elapsed+=dt;s.left=Math.max(0,s.left-dt);
   const crank=this.nearbyCrank;
   if(input.use&&crank>=0){s.gates[crank]=Math.min(D.escape.gates[crank].seconds,s.gates[crank]+dt);}
   else if(input.axis){
    let nx=clamp(s.x+input.axis*100*dt,50,D.escape.exit);
    for(const [i,g]of D.escape.gates.entries())if(s.gates[i]<g.seconds&&s.x<=g.x-22&&nx>g.x-22)nx=g.x-22;
    const fan=D.escape.fan;if(this.fanActive&&s.x<=fan.x-26&&nx>fan.x-26)nx=fan.x-26;
    s.x=nx;
   }
   let next=s.enemyX+(this.difficulty==='recit'?60:this.difficulty==='survie'?67:73)*dt;
   for(const [i,g]of D.escape.gates.entries())if(s.enemyGates[i]<2&&s.x>g.x+60&&next>=g.x-22&&s.enemyX<=g.x-22){s.enemyGates[i]=Math.min(2,s.enemyGates[i]+dt);next=Math.min(next,g.x-22);break;}
   if(this.fanActive&&s.enemyX<=D.escape.fan.x-26&&next>D.escape.fan.x-26)next=D.escape.fan.x-26;
   s.enemyX=next;
   if(s.enemyX>=s.x-32||s.left<=0){s.phase='failed';this.escapeInput={axis:0,use:false};this.fail(s.left<=0?'La liaison d’amarrage s’est refermée avant le retour d’Amanda.':'La silhouette a rejoint Amanda dans la gaine. Reprenez uniquement cette dernière traversée.');return;}
   if(s.x>=D.escape.exit){s.phase='complete';this.status='won';this.paused=true;this.escapeInput={axis:0,use:false};
    this.history.push({chapter:6,survivors:this.crew.filter(c=>c.alive).map(c=>c.name),timeLeft:Math.round(this.time),energy:Math.round(this.energy),services:Object.entries(this.serviceState).filter(([,v])=>v.done).map(([id])=>id)});
    this.emit('complete','Amanda franchit le sas. Le Haldin quitte Mendel avec les survivants. Dernier relais coupé.');
   }
  }
  step(dt){
   if(this.escapeActive){this.escapeStep(dt);return;}
   this.updateQueues(dt);super.step(dt);for(let i=0;i<this.crew.length;i++)if(!this.crew[i].alive)this.clearQueue(i,true);
   if(this.status==='playing'&&!this.escapeActive){this.updateIncident(dt);this.updateObservation(dt);}
  }
  restart(){
   if(this.v4.escape.phase==='failed'){
    this.v4.escape={...escape(),phase:'running'};this.v4.telemetry.escapeRetries++;this.escapeInput={axis:0,use:false};this.status='playing';this.paused=false;
    this.emit('notice','Fuite reprise. Les survivants et les ressources de la campagne sont conservés.');return;
   }
   const carry=copy(this.v4.entry);super.restart();this.v4=initial(this);this.v4.telemetry=carry;this.v4.entry=copy(carry);this.escapeInput={axis:0,use:false};
  }
  get ending(){const old=super.ending;if(this.v4.escape.phase==='complete')return {...old,text:`${old.text} Amanda a traversé les trois cloisons et rejoint le Haldin. La fuite est terminée.`};return old;}
  snapshot(){const p=super.snapshot();p.state.v4=copy(this.v4);return p;}
  restore(payload){
   const native=payload?.schema===4&&payload?.version==='0.4.0';
   if(!native&&!([1,2,3].includes(payload?.schema)&&payload?.version===`0.${payload.schema}.0`))throw Error('Sauvegarde Blackout v0.1 à v0.4 attendue.');
   const base=copy(payload);if(native){base.schema=3;base.version='0.3.0';}
   // V2/V3 contained two services; maintenance is additive, never replaces an old ID.
   if(base.schema>=2&&!native&&base.state?.serviceState&&D.chapters[base.state.chapterIndex]){
    const id=D.chapters[base.state.chapterIndex].incident.id;base.state.serviceState[id]??={progress:0,done:false};
   }
   const candidate=new Parent();candidate.restore(base);
   const v=native?validate(payload.state.v4,candidate):initial(candidate);
   if(!native){v.escape.phase=candidate.status==='won'?'legacy':'none';v.incident.phase=candidate.sectorElapsed>=candidate.chapter.incident.warningAt+10?'active':candidate.sectorElapsed>=candidate.chapter.incident.warningAt?'warning':'dormant';}
   const cb=this.onEvent;for(const key of Object.keys(candidate))if(key!=='onEvent')this[key]=candidate[key];
   this.onEvent=cb;this.v4=v;this.escapeInput={axis:0,use:false};this.paused=true;
   this.emit('restore',native?'Liaison v0.4 restaurée en pause.':'Ancienne liaison migrée en v0.4, en pause. La sauvegarde d’origine est conservée.');return true;
  }
 }
 function validOrder(it,e){
  if(!it||typeof it!=='object'||Array.isArray(it)||!['move','hide','wait','task','service','exit','repair'].includes(it.type))return false;
  if(it.type==='wait')return Number.isInteger(it.seconds)&&it.seconds>=1&&it.seconds<=30;
  if(!e.chapter.rooms.includes(it.room)||!['sneak','walk','run'].includes(it.mode))return false;
  if(it.type==='task')return e.chapter.tasks.some(t=>t.protocol.id===it.taskId&&t.room===it.room);
  if(it.type==='service')return e.chapter.services.some(s=>s.id===it.service&&s.room===it.room);
  if(it.type==='exit')return it.room===e.chapter.exit;
  if(it.type==='repair')return e.chapterIndex===3&&it.room===D.chapters[3].rooms[2];
  return true;
 }
 function cleanOrder(it){return it.type==='wait'?{type:'wait',seconds:it.seconds}:{type:it.type,room:it.room,mode:it.mode,...(it.taskId?{taskId:it.taskId}:{}),...(it.service?{service:it.service}:{})};}
 function validate(v,e){
  const num=(x,a,b)=>typeof x==='number'&&Number.isFinite(x)&&x>=a&&x<=b,integer=(x,a,b)=>Number.isInteger(x)&&num(x,a,b);
  const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),count=x=>obj(x)&&Object.keys(stats()).every(k=>integer(x[k],0,1e7));
  const fail=msg=>{throw Error('État v0.4 invalide : '+msg);};
  if(!obj(v)||!count(v.telemetry)||!count(v.entry)||!num(v.cameraDelay,0,.65)||!num(v.sweepLeft,0,2.5)||!num(v.cycleLeft,0,4)||typeof v.cycle!=='boolean')fail('surveillance.');
  if(!Array.isArray(v.pins)||v.pins.length>3||new Set(v.pins).size!==v.pins.length||v.pins.some(id=>!e.chapter.rooms.includes(id))||(v.cycle&&v.pins.length<2))fail('caméras épinglées.');
  if(!Array.isArray(v.observations)||v.observations.length>e.aliens.length||new Set(v.observations.map(o=>o.id)).size!==v.observations.length)fail('observations.');
  for(const o of v.observations)if(!obj(o)||!e.aliens.some(a=>a.id===o.id)||!e.chapter.rooms.includes(o.room)||!num(o.at,Math.max(0,e.t-8.001),e.t+.0001)||!['sensor','camera'].includes(o.kind)||(o.kind==='camera'&&!BO.validPoint(o.room,o)))fail('écho ou image.');
  if(!obj(v.incident)||!['dormant','warning','active','prevented','repaired'].includes(v.incident.phase))fail('incident.');
  if(e.serviceState[e.chapter.incident.id].done!==['prevented','repaired'].includes(v.incident.phase))fail('maintenance incohérente.');
  if(!Array.isArray(v.queues)||v.queues.length!==4)fail('files.');
  v.queues.forEach((q,i)=>{if(!obj(q)||!Array.isArray(q.items)||q.items.length+(q.current?1:0)>6||q.items.some(it=>!validOrder(it,e))||!(q.current===null||validOrder(q.current,e))||!num(q.wait,0,30)||['enabled','blocked','suspended'].some(k=>typeof q[k]!=='boolean')||(q.wait>0&&(q.current?.type!=='wait'||q.wait>q.current.seconds))||(!e.crew[i].alive&&(q.items.length||q.current)))fail('consigne.');});
  const s=v.escape;if(!obj(s)||!['none','running','failed','complete','legacy'].includes(s.phase)||!num(s.x,50,D.escape.exit)||!num(s.enemyX,D.escape.enemyStart,D.escape.exit+10)||!num(s.left,0,D.escape.time)||!num(s.elapsed,0,D.escape.time+.1))fail('fuite.');
  if(!Array.isArray(s.gates)||s.gates.length!==3||s.gates.some((x,i)=>!num(x,0,D.escape.gates[i].seconds))||!Array.isArray(s.enemyGates)||s.enemyGates.length!==3||s.enemyGates.some(x=>!num(x,0,2)))fail('manivelles.');
  if(s.phase!=='none'&&(e.chapterIndex!==6||e.taskIndex!==3))fail('fuite hors final.');
  if(s.phase==='running'&&(e.status!=='playing'||e.v3.evac<12)||s.phase==='failed'&&e.status!=='failed'||['complete','legacy'].includes(s.phase)&&e.status!=='won')fail('statut de fuite.');
  if(s.phase==='complete'&&(s.x<D.escape.exit||s.gates.some((x,i)=>x!==D.escape.gates[i].seconds)))fail('fin sans traversée.');
  // Only allow listed fields to pass the trust boundary.
  return {queues:v.queues.map(q=>({items:q.items.map(cleanOrder),current:q.current?cleanOrder(q.current):null,wait:q.wait,enabled:q.enabled,blocked:q.blocked,suspended:q.suspended})),cameraDelay:v.cameraDelay,sweepLeft:v.sweepLeft,observations:v.observations.map(o=>({id:o.id,room:o.room,at:o.at,kind:o.kind,...(o.kind==='camera'?{x:o.x,y:o.y}:{})})),pins:v.pins.slice(),cycle:v.cycle,cycleLeft:v.cycleLeft,incident:{phase:v.incident.phase},telemetry:Object.fromEntries(Object.keys(stats()).map(k=>[k,v.telemetry[k]])),entry:Object.fromEntries(Object.keys(stats()).map(k=>[k,v.entry[k]])),escape:{phase:s.phase,x:s.x,enemyX:s.enemyX,left:s.left,elapsed:s.elapsed,gates:s.gates.slice(),enemyGates:s.enemyGates.slice()}};
 }
 BO.BlackoutEngine=BlackoutEngineV4;BO.VERSION='0.4.0';globalThis.BO_V4={validOrder,cleanOrder};
})();
