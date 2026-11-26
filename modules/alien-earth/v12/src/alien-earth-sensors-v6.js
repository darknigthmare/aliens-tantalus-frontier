import { EARTH_DATA } from './alien-earth-data.js';

// Original game equipment. No canonical technology or global off-screen simulation is claimed.
export const SENSOR_SPEC_V6 = Object.freeze({ ids: ['S-01','S-02'], capacity: 180, range: 460,
  samplePeriod: .5, deployTime: 1.5, recoverTime: 1, chargeTime: 3, chargeCost: 2,
  pulseCost: 25, pulseTime: 4, pulseCooldown: 12, minimumChargeMissing: 20, maxHops: 2 });
const sensorFinite = (v, a, b, fallback = 0) => typeof v === 'number' && Number.isFinite(v)
  ? Math.min(b, Math.max(a, v)) : fallback;
const sensorDistance = (a,b) => Math.hypot(a.x-b.x, (a.z-b.z)*3.2);
const sensorRoomMap = Object.fromEntries(EARTH_DATA.rooms.map(r=>[r.id,r]));
const sensorFrame = (f, time, room) => {
  if (!f || f.room !== room || !['quiet','movement','unknown'].includes(f.result)
      || !['local','partial','dormant'].includes(f.scope)) return null;
  return { room, time: sensorFinite(f.time,0,time), result:f.result, scope:f.scope,
    directions: [...new Set((Array.isArray(f.directions)?f.directions:[])
      .filter(d=>['left','near','right'].includes(d)))].slice(0,3) };
};
export function initialSensorsV6() {
  return { units: Object.fromEntries(SENSOR_SPEC_V6.ids.map(id=>[id,{id,status:'carried',room:null,
    x:0,z:125,battery:180,pulseUntil:0,cooldownUntil:0,lastFrame:null,received:null}])),
    history:[], stats:{deployed:0,recovered:0,recharged:0,pulses:0,alerts:0} };
}
export function upgradeSensorsV6(s,raw,{blocked,roomWithState}) {
  s.schema=6; s.version=EARTH_DATA.version; s.sensors=initialSensorsV6();
  if (raw.schema<6) return s;
  const v=raw.sensors;
  // Missing V6 equipment cannot mint two fresh batteries. Reject malformed V6 snapshots.
  if (!v || typeof v!=='object' || !v.units || typeof v.units!=='object')
    throw new Error('Registre des sondes V6 absent. Import annulé.');
  for (const id of SENSOR_SPEC_V6.ids) {
    const d=v.units[id];
    if (!d || d.id!==id || !['carried','deployed'].includes(d.status)
      || !Number.isFinite(d.battery) || d.battery<0 || d.battery>180)
      throw new Error('Sonde invalide : '+id+'.');
    const out=s.sensors.units[id]; out.battery=d.battery; out.status=d.status; out.cooldownUntil=sensorFinite(d.cooldownUntil,0,s.playSeconds+12);
    if (d.status==='deployed') {
      const room=sensorRoomMap[d.room];
      if (!room || EARTH_DATA.chapters.findIndex(c=>c.id===room.chapter)>s.chapter
        || !s.visited.includes(room.id) || !Number.isFinite(d.x) || !Number.isFinite(d.z)
        || (room.mode==='SIDE' && d.z!==125) || blocked(roomWithState(s,room.id),d.x,d.z,8,5))
        throw new Error('Position de sonde incohérente : '+id+'.');
      Object.assign(out,{room:room.id,x:d.x,z:d.z});
      out.pulseUntil=sensorFinite(d.pulseUntil,0,s.playSeconds+4);
      out.cooldownUntil=sensorFinite(d.cooldownUntil,0,s.playSeconds+12);
      out.lastFrame=sensorFrame(d.lastFrame,s.playSeconds,room.id);
      out.received=sensorFrame(d.received,s.playSeconds,room.id);
      // No fabricated observation survives when its timestamp exceeds the local acquisition.
      if (out.received && (!out.lastFrame || out.received.time>out.lastFrame.time)) out.received=null;
    }
  }
  const units=Object.values(s.sensors.units).filter(d=>d.status==='deployed');
  if (units.length===2 && units[0].room===units[1].room && sensorDistance(units[0],units[1])<90)
    throw new Error('Deux sondes superposées : import annulé.');
  s.sensors.history=(Array.isArray(v.history)?v.history:[]).slice(-40).flatMap(h=>{
    if (!h || !SENSOR_SPEC_V6.ids.includes(h.unit) || !sensorRoomMap[h.room]) return [];
    const f=sensorFrame(h,s.playSeconds,h.room); return f ? [{...f,unit:h.unit}] : [];
  });
  for (const k of Object.keys(s.sensors.stats))s.sensors.stats[k]=Math.floor(sensorFinite(v.stats?.[k],0,999999));
  return s;
}

export function withEarthSensorsV6(Base,{ROOM_BY_ID,near,visible,blocked,clone,roomWithState,doorKey}) {
  return class EarthSensorsEngine extends Base {
    constructor(state=null) { super(state); this.sensorAccumulator=new Map(); this.sensorClock=0; this.sensorRadio=null; this.sensorLastAlert=Object.fromEntries(SENSOR_SPEC_V6.ids.map(id=>[id,Math.max(-99,...this.state.sensors.history.filter(h=>h.unit===id&&h.result==='movement').map(h=>h.time))])); }
    sensorUnit(id) { return Object.hasOwn(this.state.sensors.units,id)?this.state.sensors.units[id]:null; }
    localSensors() { return Object.values(this.state.sensors.units).filter(d=>d.status==='deployed'&&d.room===this.room.id); }
    loadRoom(id) { super.loadRoom(id); this.sensorAccumulator=new Map(); this.sensorClock=0; this.sensorRadio=null; }
    cancelInteraction() { super.cancelInteraction(); this.sensorRadio=null; }
    restartCheckpoint() { const keep=clone(this.state.sensors); super.restartCheckpoint(); this.state.sensors=keep; this.sensorRadio=null; }
    damage(n) { const hit=super.damage(n); if(hit)this.sensorRadio=null; return hit; }
    interactionCandidates() { return [...super.interactionCandidates(),...this.localSensors().map(d=>({...d,kind:'sensor',label:'Sonde '+d.id+' · relever / récupérer'}))]; }
    interact() {
      if (this.dead||this.pending||this.hold||this.serviceAction||this.state.finished) return null;
      const i=this.nearestInteraction();
      if (i?.kind==='sensor'&&!this.hidden) {
        if(!this.handsFree())return null;
        this.pending={type:'sensor-v6',id:i.id}; this.emit('sensorPanel',{id:i.id}); return i;
      }
      return super.interact();
    }
    sensorPlacement() {
      const point={x:this.player.x+this.player.facing*60,z:this.player.z};
      if (blocked(this.room,point.x,point.z,18,10)||!visible(this.room,this.player,point))
        return {ok:false,reason:'Sol insuffisamment dégagé devant vous.'};
      // Preserve old affordances. A sensor cannot hide a door, task, archive, or utility prompt.
      const old=[this.room.task,this.room.archive,...this.room.portals,...this.room.interactables];
      if (old.some(i=>near(i,point,125,46)))
        return {ok:false,reason:'Éloignez la sonde des portes et des commandes existantes.'};
      const gate=this.room.gate;
      if (gate && point.x+24>gate.x && point.x-24<gate.x+gate.w && point.z+14>gate.z && point.z-14<gate.z+gate.d)
        return {ok:false,reason:'Le seuil de la cloison doit rester libre.'};
      if (this.localSensors().some(d=>sensorDistance(d,point)<160))
        return {ok:false,reason:'Les deux sondes doivent être espacées.'};
      if (this.state.presentation==='CLASSIC' && this.room.mode!=='SIDE' && ![50,125,200].includes(point.z))
        return {ok:false,reason:'Rejoignez un plan classique avant la pose.'};
      return {ok:true,...point};
    }
    startSensorDeploy(key='sensor') {
      if (this.dead||this.pending||this.hold||this.serviceAction||this.state.finished||!this.handsFree())return false;
      const unit=Object.values(this.state.sensors.units).find(d=>d.status==='carried'&&d.battery>0);
      if(!unit){this.emit('toast',{text:'Aucune sonde chargée dans le sac. Récupérez les unités ou rechargez-les à un établi.'});return false;}
      const spot=this.sensorPlacement();
      if(!spot.ok){this.emit('toast',{text:spot.reason});return false;}
      this.hidden=null;this.actionV3=null;this.listenWork=null;this.calmWork=null;
      this.serviceAction={kind:'sensor-deploy',value:unit.id,id:unit.id,x:this.player.x,z:this.player.z,
        room:this.room.id,spot:{x:spot.x,z:spot.z},key,time:0,duration:1.5,label:'Poser '+unit.id};
      this.emit('toast',{text:'Pose · maintenez '+(key==='sensor'?'1':'E')+' pendant 1,5 seconde sur place.'});return true;
    }
    queueSensorRecover(id) {
      const d=this.sensorUnit(id);
      if(this.dead||this.state.finished||this.serviceAction||this.hold||(this.pending&&(this.pending.type!=='sensor-v6'||this.pending.id!==id))||!d||d.room!==this.room.id
        ||d.status!=='deployed'||!near(this.player,d)||!visible(this.room,this.player,d)||!this.handsFree())return false;
      this.pending=null;this.actionV3=null;this.listenWork=null;this.calmWork=null;
      this.serviceAction={kind:'sensor-recover',value:id,id,x:d.x,z:d.z,room:d.room,
        time:0,duration:1,key:'interact',label:'Récupérer '+id}; return true;
    }
    queueSensorRecharge(id) {
      const d=this.sensorUnit(id),station=this.room.interactables.find(i=>i.id===this.pending?.id);
      if(this.pending?.type!=='service-v4'||station?.kind!=='workbench'||!d||d.status!=='carried'
        ||d.battery>160||this.state.parts<2||!near(this.player,station)||!visible(this.room,this.player,station)||!this.handsFree())return false;
      this.pending=null;this.actionV3=null;this.listenWork=null;this.calmWork=null;
      this.serviceAction={kind:'sensor-charge',value:id,id:station.id,x:station.x,z:station.z,
        room:this.room.id,time:0,duration:3,key:'interact',label:'Reconditionner '+id}; return true;
    }
    completeService(a) {
      if (!a.kind.startsWith('sensor-'))return super.completeService(a);
      if (this.dead||this.state.finished||a.room!==this.room.id||!near(this.player,a)||!visible(this.room,this.player,a)||!this.handsFree(true))return;
      const d=this.sensorUnit(a.value);if(!d)return;
      const registry=this.state.sensors;
      if(a.kind==='sensor-deploy') {
        if(d.status!=='carried'||d.battery<=0)return;
        const current=this.sensorPlacement();
        if(!current.ok||Math.abs(current.x-a.spot.x)>1||Math.abs(current.z-a.spot.z)>1)return;
        Object.assign(d,{status:'deployed',room:this.room.id,x:a.spot.x,z:a.spot.z,lastFrame:null,received:null,pulseUntil:0});
        this.sensorAccumulator.clear();this.sensorClock=0;registry.stats.deployed++;
        this.log(d.id+' posée · autonomie '+Math.ceil(d.battery)+' s.','sensor');
      } else if(a.kind==='sensor-recover') {
        if(d.status!=='deployed'||d.room!==this.room.id||!near(this.player,d)||!visible(this.room,this.player,d))return;
        Object.assign(d,{status:'carried',room:null,x:0,z:125,lastFrame:null,received:null,pulseUntil:0});registry.stats.recovered++;
        this.log(d.id+' récupérée, batterie restante conservée.','sensor');
      } else if(a.kind==='sensor-charge') {
        const station=this.room.interactables.find(i=>i.id===a.id&&i.kind==='workbench');
        if(!station||d.status!=='carried'||d.battery>160||this.state.parts<2)return;
        this.state.parts-=2;d.battery=180;d.cooldownUntil=0;registry.stats.recharged++;
        this.log(d.id+' reconditionnée · deux pièces consommées.','sensor');
      } else return;
      this.emit('toast',{text:a.kind==='sensor-deploy'?'Sonde active. 2 : récepteur. E près de la sonde : récupération.':a.kind==='sensor-recover'?'Sonde récupérée. La batterie ne se recharge pas dans le sac.':'Sonde reconditionnée : 180 secondes d’autonomie.'});
      this.emit('sound',{kind:'service'});this.emit('save');
    }
    sensorLink(id) {
      const d=this.sensorUnit(id);
      if(!d||d.status!=='deployed')return {ok:false,reason:'Dans le sac',hops:null};
      if(d.battery<=0)return {ok:false,reason:'Batterie épuisée',hops:null};
      if(ROOM_BY_ID[d.room].chapter!==this.chapter.id)return {ok:false,reason:'Secteur quitté',hops:null};
      const queue=[[this.room.id,0]],seen=new Set([this.room.id]);
      for(let at=0;at<queue.length;at++){
        const [rid,hops]=queue[at];if(rid===d.room)return {ok:true,hops,reason:hops?'Relais de proximité':'Liaison locale'};
        if(hops>=2)continue;
        for(const p of ROOM_BY_ID[rid].portals){
          if(p.kind!=='door'||(p.hatchKey&&!this.state.ducts?.opened.includes(p.hatchKey))||seen.has(p.to)||(p.requires||[]).some(x=>!this.state.completed.includes(x))||this.state.seals[doorKey(p)]?.closed)continue;
          seen.add(p.to);queue.push([p.to,hops+1]);
        }
      }
      return {ok:false,reason:'Hors liaison / seuil verrouillé',hops:null};
    }
    sensorPulseAllowed(id) {
      const d=this.sensorUnit(id),link=this.sensorLink(id);
      return !!(d&&link.ok&&d.room===this.room.id&&d.battery>=25&&d.cooldownUntil<=this.time&&this.handsFree(true));
    }
    queueSensorPulse(id) {
      if(this.dead||this.state.finished||this.serviceAction||this.hold||this.pending||this.sensorRadio||!this.sensorPulseAllowed(id))return false;
      // UI resumes immediately after this call. No charge or sound is applied inside a paused menu.
      this.sensorRadio={id,room:this.room.id};return true;
    }
    executeSensorRadio() {
      const command=this.sensorRadio;this.sensorRadio=null;
      if(!command||command.room!==this.room.id||!this.sensorPulseAllowed(command.id))return;
      const d=this.sensorUnit(command.id);d.battery-=25;d.pulseUntil=this.time+4;d.cooldownUntil=this.time+12;
      this.state.sensors.stats.pulses++;
      this.log(d.id+' · leurre sonore déclenché (25 secondes d’autonomie).','sensor');
      this.emit('toast',{text:d.id+' émet pendant quatre secondes. La poursuite à vue garde priorité.'});
      this.emit('sound',{kind:'decoy'});this.emit('save');
    }
    updateEnemy(e,dt,input) {
      const original=this.lures;
      const emitters=this.localSensors().filter(d=>d.pulseUntil>this.time).map(d=>({x:d.x,z:d.z,ttl:1,radius:640}));
      this.lures=[...original,...emitters];try{super.updateEnemy(e,dt,input);}finally{this.lures=original;}
    }
    sensorActors() {
      const out=this.enemies.map(e=>({id:'e:'+e.id,room:this.room.id,x:e.x,z:e.z}));
      out.push({id:'player',room:this.room.id,x:this.player.x,z:this.player.z});
      for(const f of Object.values(this.state.survivors))if(f.room===this.room.id&&['follow','wait'].includes(f.status)&&this.state.carryId!==f.id)
        out.push({id:'f:'+f.id,room:f.room,x:f.x,z:f.z});
      if(this.state.escort)out.push({id:'escort',room:this.room.id,x:this.escortActor.x,z:this.escortActor.z});
      // Only existing pursuit trajectories move outside the loaded room. Dormant actors are NOT sampled.
      for(const p of this.state.pursuits)if(p.from!==this.room.id){
        const e=this.state.world[p.from]?.enemies?.find(e=>e.id===p.enemyId);
        if(e)out.push({id:'e:'+e.id,room:p.from,x:e.x,z:e.z});
      }
      return out;
    }
    sampleSensors(actors) {
      for(const d of Object.values(this.state.sensors.units)){
        if(d.status!=='deployed'||d.battery<=0)continue;
        const local=d.room===this.room.id,partial=this.state.pursuits.some(p=>p.from===d.room);
        const scope=local?'local':partial?'partial':'dormant',room=roomWithState(this.state,d.room);
        const directions=[];
        if(scope!=='dormant')for(const a of actors){
          if(a.room!==d.room||(this.sensorAccumulator.get(a.room+'|'+a.id)||0)<3||sensorDistance(a,d)>460||!visible(room,d,a))continue;
          const dir=Math.abs(a.x-d.x)<90?'near':a.x<d.x?'left':'right';if(!directions.includes(dir))directions.push(dir);
        }
        const result=directions.length?'movement':local?'quiet':'unknown';
        const frame={room:d.room,time:this.time,result,scope,directions};d.lastFrame=frame;
        if(!this.sensorLink(d.id).ok)continue;
        const prev=d.received;d.received=clone(frame);
        if(result==='movement'&&this.time-(this.sensorLastAlert[d.id]??-99)>=6){
          this.sensorLastAlert[d.id]=this.time;this.state.sensors.stats.alerts++;
          this.state.sensors.history.push({...clone(frame),unit:d.id});this.state.sensors.history=this.state.sensors.history.slice(-40);
          this.emit('toast',{text:d.id+' · mouvement mesuré dans '+ROOM_BY_ID[d.room].title+'. Origine non identifiée.'});
          this.emit('sound',{kind:'sensor'});
        } else if(result!=='movement'&&prev?.result==='movement'){
          this.state.sensors.history.push({...clone(frame),unit:d.id});this.state.sensors.history=this.state.sensors.history.slice(-40);
        }
      }
      this.sensorAccumulator.clear();
    }
    update(dt,input={}) {
      if(!this.dead&&!this.state.finished&&!this.pending&&Number(dt)>0)this.executeSensorRadio();
      const previous=new Map(this.sensorActors().map(a=>[a.room+'|'+a.id,a])),before=this.time;
      super.update(dt,input);
      const step=this.time-before;if(step<=0)return;
      const actors=this.sensorActors();
      for(const a of actors){const key=a.room+'|'+a.id,old=previous.get(key);if(old)this.sensorAccumulator.set(key,(this.sensorAccumulator.get(key)||0)+sensorDistance(old,a));}
      for(const d of Object.values(this.state.sensors.units))if(d.status==='deployed'&&d.battery>0){
        d.battery=Math.max(0,d.battery-step);
        if(d.battery===0){if(this.room.chapter===ROOM_BY_ID[d.room].chapter)this.emit('toast',{text:d.id+' : batterie épuisée. Récupérez-la pour la reconditionner.'});this.emit('save');}
      }
      this.sensorClock+=step;
      if(this.sensorClock>=.5){this.sensorClock=0;this.sampleSensors(actors);}
    }
  };
}
