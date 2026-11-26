/* La Mer des Chagrins — shared offline simulation, v0.7.
   Original game mechanics; geometry and rescue operations are not canonical book plans.
   No DOM, no external service, no mutation of the host game's economy. */
(function(root){
'use strict';
const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.SoSData;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const copy=x=>JSON.parse(JSON.stringify(x));
const R=Object.fromEntries(D.rooms.map(r=>[r.id,r]));
const O=Object.fromEntries(D.rooms.flatMap(r=>r.interactables).map(o=>[o.id,o]));
const order=D.chapters.flatMap(c=>c.objectives);
const escortRooms=new Set(['s34','s35','s36','s11','s37','s45','s46','s49','s50']);
const STOCKS={reserve:{label:'Cartouches de réserve',cap:180},fuel:{label:'Combustible',cap:180},foam:{label:'Mousse',cap:24},medkits:{label:'Trousses de soins',cap:4},filters:{label:'Cartouches filtrantes',cap:4},decoys:{label:'Leurres acoustiques',cap:5},parts:{label:'Renforts de châssis',cap:6}};
const WEAPONS={pistol:'Reaper',foam:'Foamer · mousse',flame:'Lance-flammes (adaptation)',pulse:'Fusil à impulsions',plasma:'Fusil plasma · 50 W'};
const armoryDefaults=()=>({revision:1,claimed:false,pulseAmmo:0,pulseReserve:0,plasmaAmmo:0,plasmaCells:0,heat:0,locked:false});
const maxHP=e=>e.kind==='queen'?340:e.kind==='facehugger'?22:68;
const FORMATIONS={standard:{label:'Standard',gap:170,speed:155,noise:12},compact:{label:'Rapproché',gap:105,speed:175,noise:26},quiet:{label:'Discret',gap:150,speed:108,noise:3}};
const rescueDefaults=()=>({active:false,aboard:false,order:'follow',formation:'standard',actors:[
 {id:'adams',name:'Adams',room:'s34',status:'waiting',x:920,z:.55,integrity:100,path:[],pathTime:0},
 {id:'elway',name:'Elway',room:'s34',status:'waiting',x:1450,z:.55,integrity:100,path:[],pathTime:0}
]});
function crossed(a,b,box,pad=0){
 let t0=0,t1=1;const dx=b.x-a.x,dz=b.z-a.z;
 const xmin=box.x-box.w/2-pad,xmax=box.x+box.w/2+pad;
 const zmin=box.z-box.d/2-pad/650,zmax=box.z+box.d/2+pad/650;
 for(const [p,q]of[[-dx,a.x-xmin],[dx,xmax-a.x],[-dz,a.z-zmin],[dz,zmax-a.z]]){
  if(Math.abs(p)<1e-8){if(q<0)return false;continue;}
  const t=q/p;if(p<0)t0=Math.max(t0,t);else t1=Math.min(t1,t);if(t0>t1)return false;
 }return true;
}
class Game{
 constructor(options={}){this.newGame(options);}
 resetRuntime(){this.events=[];this.sensorSamples=new Map();this.sensorScan=0;this.time=0;this.activeWork=null;this.shutterLatch=null;this.lightingLatch=null;this.cooldowns={fire:0,interaction:0,decoy:0,sensor:0,work:0};}
 newGame({difficulty='survival',presentation='HYBRID'}={}){
  this.resetRuntime();
  this.state={schema:8,armory:armoryDefaults(),sensors:this.sensorDefaults(),pursuit:{transfers:{},pending:[],journal:[]},insights:[],campaign:D.meta.id,version:D.meta.version,
   difficulty:Object.hasOwn(D.difficulties,difficulty)?difficulty:'survival',presentation:presentation==='CLASSIC'?'CLASSIC':'HYBRID',
   room:'s01',objectiveIndex:0,flags:{},optional:{},waypoint:null,repair:{actor:null,progress:0},visited:[],completed:[],archives:['dossier-decker','dossier-icc','dossier-fidelity','dossier-architectural-thresholds','dossier-personal-armory','dossier-plasma-heat','dossier-named-cast','dossier-interpretation-boundary'],roomStates:{},
   player:{x:180,z:.55,hp:100,stamina:100,stress:0,filter:100,facing:1,weapon:'pistol',ammo:12,reserve:60,foam:14,fuel:110,
    crouch:false,noise:0,invulnerable:1.5,medkits:0,filters:0,decoys:0,parts:0,dodgeTime:0,dodgeCooldown:0,dodgeX:0,dodgeZ:0,lamp:true,trackerOn:false,moving:false,reload:0},
   companion:{x:100,z:.55,order:'follow',fireMode:'return',rally:null,cooldown:0,path:[],pathTime:0},
   rescue:rescueDefaults(),inventory:{pistol:false,foam:false,flame:false,tracker:false},
   stats:{time:0,shots:0,kills:0,archives:0,doors:0,empathySeconds:0,damage:0,deaths:0,operations:0,devices:0,medkitsUsed:0,filtersUsed:0,decoysUsed:0,escortMeters:0,dodges:0,repairs:0,hazardDamage:0,shutterCycles:0,shutterBreaches:0,rallyOrders:0,readings:0,pursuitStarts:0,pursuitArrivals:0,pursuitLost:0,sensorsPlaced:0,sensorsRecovered:0,sensorSignals:0,lightingCycles:0,formationChanges:0,lockersOpened:0,storageTransfers:0},
   finished:false,failed:null};
  this.checkpoint=null;this.enter('s01');return this;
 }
 get room(){return R[this.state.room];}
 get current(){return O[order[this.state.objectiveIndex]]||null;}
 get chapter(){return this.current?D.chapters[this.current.chapter-1]:D.chapters.at(-1);}
 get p(){return this.state.player;}
 get rs(){return this.state.roomStates[this.state.room];}
 get mode(){return this.state.presentation==='CLASSIC'?'SIDE':this.room.mode;}
 zFor(a){return this.mode==='SIDE'?.55:a.z;}
 distance(a,b){return Math.hypot(a.x-b.x,(this.zFor(a)-this.zFor(b))*470);}
 limits(){return this.mode==='SIDE'?[.55,.55]:this.mode==='HYBRID'?[.15,.85]:[.13,.89];}
 boxes(){return [...this.room.obstacles.filter(b=>this.mode!=='SIDE'||b.blocksClassic),...(this.room.shutters||[]).filter(s=>this.rs?.shutters[s.id]?.status==='closed').map(s=>({...s,blocksClassic:true,d:1.2,z:.5,dynamic:true}))];}
 emit(type,text,extra={}){
  this.events.push({type,text,...extra});
  if(this.state?.pursuit&&text&&['saved','pursuit-warning','pursuit-arrival','pursuit-lost','sensor-signal'].includes(type)){
   this.state.pursuit.journal.push({time:this.state.stats.time,room:this.state.room,type,text:String(text).slice(0,240)});
   this.state.pursuit.journal=this.state.pursuit.journal.slice(-24);
  }
 }
 drainEvents(){return this.events.splice(0);}
 createRoomState(r){return {lockers:this.createLockerStates(r),lighting:{on:true,progress:0},shutters:Object.fromEntries((r.shutters||[]).map(s=>[s.id,{status:'open',integrity:100,progress:0}])),echoProgress:{},localTime:0,hazardHits:{},supplyUsed:false,kitClaimed:false,work:{},devices:{},noises:[],corpses:[],acid:[],
  weakpoints:r.id==='s33'?[{x:980,z:.50,hp:24},{x:1510,z:.38,hp:24},{x:2220,z:.59,hp:24}]:[],
  enemies:r.enemySpawns.map(e=>({...e,hp:maxHP(e),homeX:e.x,homeZ:e.z,mode:'patrol',memory:0,cooldown:.6,foam:0,path:[],pathTime:0,patrol:1,alert:0,
   attack:null,breach:null,facing:-1,moving:false,lastKnown:{x:e.x,z:e.z},searchTime:0,targetId:'player'}))};}
 enter(id,via=null){
  if(!R[id])throw Error('Unknown room: '+id);
  const departure=this.room?.doors.find(d=>d.to===id&&d.pair===via);
  if(departure)this.schedulePursuit(departure);
  this.cancelReturningPursuits(id);
  this.state.room=id;if(!this.state.visited.includes(id))this.state.visited.push(id);
  const dest=via?R[id].doors.find(d=>d.pair===via):null;
  const landing=dest?this.portalLanding(dest,92):(this.room.arrivalAnchors?.find(a=>a.pair===via)||{x:180,z:.55});const start=landing.x;
  this.p.x=clamp(start,50,R[id].width-50);this.p.z=this.mode==='SIDE'?.55:landing.z;this.p.noise=0;this.p.invulnerable=1.6;
  if(!this.state.roomStates[id])this.state.roomStates[id]=this.createRoomState(R[id]);
  this.ensureSafePosition(this.p);
  const inside=this.p.x>this.room.width/2?-1:1,ally=this.state.companion;
  ally.rally=null;ally.order='follow';ally.x=this.p.x+inside*70;ally.z=this.p.z;ally.cooldown=.5;ally.path=[];ally.pathTime=0;this.ensureSafePosition(ally);
  if(this.state.rescue.active)for(const [i,a]of this.state.rescue.actors.entries()){
   a.room=id;a.x=this.p.x+inside*(175+i*170);a.z=this.p.z;a.path=[];a.pathTime=0;this.ensureSafePosition(a);
  }
  if(!this.rs.kitClaimed){
   if(id==='s33'&&!this.state.flags.queen_down){this.state.inventory.flame=true;this.p.fuel=Math.max(this.p.fuel,110);this.p.weapon='flame';}
   if(id==='s37'&&!this.state.flags.live_capture){this.state.inventory.foam=true;this.p.foam=Math.max(this.p.foam,14);this.p.weapon='foam';}
   this.rs.kitClaimed=true;
  }
  for(const e of this.rs.enemies){this.ensureSafePosition(e);e.path=[];e.pathTime=0;}
  this.activeWork=null;this.lightingLatch=null;this.cooldowns.interaction=.5;
  this.checkpoint=copy(this.state);this.emit('room',R[id].name);return true;
 }
 ensureSafePosition(a){
  const [lo,hi]=this.limits();a.x=clamp(a.x,35,this.room.width-35);a.z=clamp(a.z,lo,hi);
  if(this.blocked(a.x,a.z)){
   const candidates=[{x:a.x,z:.55}];
   for(let d=30;d<260;d+=30)for(const sign of[-1,1])candidates.push({x:clamp(a.x+sign*d,35,this.room.width-35),z:.55});
   const free=candidates.find(p=>!this.blocked(p.x,p.z));if(free){a.x=free.x;a.z=free.z;}
  }
 }
 blocked(x,z,padding=16){
  const [lo,hi]=this.limits();if(!Number.isFinite(x)||!Number.isFinite(z)||x<30||x>this.room.width-30||z<lo-.001||z>hi+.001)return true;
  return this.boxes().some(b=>Math.abs(x-b.x)<b.w/2+padding&&Math.abs(z-b.z)<b.d/2+padding/650);
 }
 move(a,dx,dz){
  if(!Number.isFinite(dx)||!Number.isFinite(dz))return 0;
  if(this.mode==='SIDE')dz=0;
  const old={x:a.x,z:a.z},steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz)*470)/8));
  for(let i=0;i<Math.min(steps,2048);i++){
   if(!this.blocked(a.x+dx/steps,a.z))a.x+=dx/steps;
   if(!this.blocked(a.x,a.z+dz/steps))a.z+=dz/steps;
  }
  if(this.mode==='SIDE')a.z=.55;return this.distance(old,a);
 }
 visible(a,b){return !this.boxes().some(box=>crossed({x:a.x,z:this.zFor(a)},{x:b.x,z:this.zFor(b)},box));}
 navigable(a,b){return !this.blocked(b.x,this.zFor(b))&&!this.boxes().some(box=>crossed({x:a.x,z:this.zFor(a)},{x:b.x,z:this.zFor(b)},box,15.99));}
 pathTo(from,to){
  const target={x:clamp(to.x,35,this.room.width-35),z:clamp(this.zFor(to),...this.limits())};
  if(this.navigable(from,target))return [target];
  if(this.mode==='SIDE')return [];
  const [lo,hi]=this.limits(),W=Math.ceil(this.room.width/60),H=13;
  const point=(x,y)=>({x:clamp(x*60+30,36,this.room.width-36),z:lo+(hi-lo)*y/(H-1)});
  const cell=p=>[clamp(Math.floor(p.x/60),0,W-1),clamp(Math.round((p.z-lo)/(hi-lo)*(H-1)),0,H-1)];
  let s=cell(from),end=cell(target);const key=(x,y)=>x+','+y;
  // Find a free grid anchor reachable from the true endpoint, never cross a collider.
  const anchor=(p,c)=>{
   const near=[];for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){
    const x=c[0]+dx,y=c[1]+dy;if(x<0||y<0||x>=W||y>=H)continue;
    const q=point(x,y);if(!this.blocked(q.x,q.z,19)&&this.navigable(p,q))near.push({cell:[x,y],dist:this.distance(p,q)});
   }near.sort((a,b)=>a.dist-b.dist);return near[0]?.cell;
  };
  s=anchor(from,s);end=anchor(target,end);if(!s||!end)return [];
  const open=[{x:s[0],y:s[1],g:0,f:0}],came=new Map(),cost=new Map([[key(...s),0]]),closed=new Set();let found=null;
  for(let n=0;open.length&&n<1500;n++){
   open.sort((a,b)=>a.f-b.f);const q=open.shift(),k=key(q.x,q.y);if(closed.has(k))continue;closed.add(k);
   if(q.x===end[0]&&q.y===end[1]){found=k;break;}
   for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
    const x=q.x+dx,y=q.y+dy;if(x<0||x>=W||y<0||y>=H)continue;
    const p=point(x,y);if(this.blocked(p.x,p.z,19)||!this.navigable(point(q.x,q.y),p))continue;
    const nk=key(x,y),g=q.g+1;if(g>=(cost.get(nk)??Infinity))continue;
    cost.set(nk,g);came.set(nk,k);open.push({x,y,g,f:g+Math.abs(x-end[0])+Math.abs(y-end[1])});
   }
  }
  if(!found)return [];
  const out=[target];for(let k=found;k;k=came.get(k)){const [x,y]=k.split(',').map(Number);out.push(point(x,y));if(k===key(...s))break;}
  return out.reverse();
 }
 follow(a,target,speed,dt){
  target={x:target.x,z:this.zFor(target)};this.ensureSafePosition(target);
  a.pathTime=(a.pathTime||0)-dt;
  if(a.pathTime<=0||!a.path?.length){a.path=this.pathTo(a,target);a.pathTime=.32;}
  while(a.path?.length&&this.distance(a,a.path[0])<7)a.path.shift();
  const p=a.path?.[0];if(!p)return 0;
  const dx=p.x-a.x,dz=(this.zFor(p)-this.zFor(a))*470,n=Math.hypot(dx,dz)||1,step=Math.min(speed*dt,n);
  return this.move(a,dx/n*step,dz/n*step/470);
 }
 requirementText(flag){return ({accident:'terminer le relevé',report_sent:'transmettre le rapport',earth_done:'régler les démarches à terre',contract:'rencontrer Rollins',equipped:'prendre l’équipement',filters_ready:'contrôler les filtres',lift_ready:'activer la cage',power_on:'rétablir la desserte',tracker_ready:'reprendre le détecteur',survey_complete:'terminer le relevé',maze_known:'retrouver la dérivation',lift_lost:'examiner les commandes',stairs_known:'repérer l’itinéraire',brood_seen:'étudier le passage',queen_down:'dégager la chambre',hosts_secured:'préparer les deux brancards',winch_ready:'mettre le treuil en marche',route_open:'ouvrir le passage',beacon_lit:'allumer la balise',live_capture:'capturer le spécimen vivant',specimens_delivered:'transférer la cargaison',strike_seen:'observer la surface'})[flag]||'poursuivre la mission';}
 doorStatus(door,from=this.state.room,physical=true){
  if(!door)return {open:false,reason:'Accès absent.'};
  if(door.gate&&!this.state.flags[door.gate])return {open:false,reason:'Accès en attente — '+this.requirementText(door.gate)};
  if(this.state.flags.lift_lost&&door.kind==='lift')return {open:false,reason:'Le puits principal est condamné.'};
  if(this.state.flags.maze_known&&((from==='s28'&&door.to==='s29')||(from==='s29'&&door.to==='s28')))return {open:false,reason:'La membrane a fermé ce passage. Prenez la dérivation.'};
  const rescue=this.state.rescue;
  if(this.state.flags.adams_secured&&!this.state.flags.hosts_secured&&from==='s34')return {open:false,reason:'Le second brancard n’est pas prêt.'};
  if(rescue.active&&escortRooms.has(from)&&!escortRooms.has(door.to))return {open:false,reason:'Les brancards ne peuvent pas reprendre ce passage. Gagnez les paliers.'};
  if(rescue.active&&physical&&from===this.state.room&&!this.convoyNear(door,420))return {open:false,reason:'Rassemblez les deux brancards près du seuil. B : les faire suivre.'};
  if(physical&&from===this.state.room&&this.state.flags.equipped&&this.chapter.number<17){
   const a=this.state.companion;
   if(this.distance(a,door)>550||!this.pathTo(a,door).length)return {open:false,reason:'Manning est séparé du groupe. V : le rappeler ; ouvrez les cloisons sur son trajet.'};
  }
  return {open:true,reason:''};
 }
 convoyNear(pos,range=360){return this.state.rescue.active&&this.state.rescue.actors.every(a=>a.room===this.state.room&&a.status==='following'&&this.distance(a,pos)<=range&&this.pathTo(a,pos).length>0);}
 portalLanding(d,offset=92){
  const m=d.portal?.mount;
  if(m==='left')return{x:d.x+offset,z:this.zFor(d)};
  if(m==='right')return{x:d.x-offset,z:this.zFor(d)};
  if(this.mode!=='SIDE'&&m==='back')return{x:d.x,z:Math.min(.75,d.z+offset/650)};
  if(this.mode!=='SIDE'&&m==='front')return{x:d.x,z:Math.max(.25,d.z-offset/650)};
  return{x:d.x+(d.x<this.room.width/2?offset:-offset),z:this.zFor(d)};
 }
 castForRoom(){return(this.room.cast||[]).filter(a=>this.state.objectiveIndex>=a.fromObjective&&this.state.objectiveIndex<a.untilObjective);}
 armoryAccess(){const a=this.room.armoryRack;return !!(a&&this.state.flags.equipped&&!this.state.failed&&!this.state.finished&&this.distance(this.p,a)<92&&this.visible(this.p,a));}
 claimArmory(){
  if(!this.armoryAccess()||this.state.armory.claimed)return false;
  Object.assign(this.state.armory,{claimed:true,pulseAmmo:30,pulseReserve:60,plasmaAmmo:12,plasmaCells:2});
  this.emit('saved','Dotation retirée : deux fusils, une allocation unique.');return true;
 }
 weaponOwned(w){return !!(this.state.inventory[w]||['pulse','plasma'].includes(w)&&this.state.armory?.claimed);}
 weaponReadout(){const a=this.state.armory,p=this.p;
  if(p.weapon==='pulse')return `${a.pulseAmmo} / ${a.pulseReserve}`;
  if(p.weapon==='plasma')return `${a.plasmaAmmo} · ${a.plasmaCells} CELL. · ${Math.ceil(a.heat)}/100 CHALEUR${a.locked?' — REFROIDISSEMENT':''}`;
  return p.weapon==='pistol'?`${p.ammo} / ${p.reserve}`:p.weapon==='foam'?`${Math.floor(p.foam)} CHARGES`:`${Math.floor(p.fuel)} UNITÉS`;
 }
 nearby(){
  const list=[];if(this.room.armoryRack)list.push({...this.room.armoryRack,action:'armory',priority:1.7});
  for(const a of this.castForRoom())list.push({...a,action:'cast',priority:4,label:'Parler — '+D.fidelity.characters[a.id].name});
  if(this.current?.room===this.state.room)list.push({...this.current,action:'objective',priority:0});
  for(const s of this.room.shutters||[])for(const n of this.shutterControls(s))list.push(n);
  for(const l of this.room.lockers||[])list.push({...l,action:'locker',priority:1.2,label:(this.rs.lockers[l.id].opened?'Consulter — ':'Ouvrir — ')+l.label});
  if(this.room.lighting){const l=this.room.lighting;list.push({...l,action:'lighting',priority:1,label:this.rs.lighting.on?'Couper l’éclairage de travail':'Rétablir l’éclairage de travail'});}
  for(const d of this.room.devices||[])if(!this.rs.devices[d.id])list.push({...d,action:'device',priority:1});
  const a=this.room.archive;if(!this.state.archives.includes(a.id))list.push({...a,action:'archive',label:'Consulter le relevé',priority:2});
  for(const door of this.room.doors)list.push({...door,action:'door',priority:3});
  if(this.room.supply)list.push({id:'supply',x:320,z:.55,action:'supply',label:this.rs.supplyUsed?'Réserve vide':'Prendre les réserves',priority:4});
  return list.filter(n=>this.distance(n,this.p)<92&&this.visible(this.p,n)).sort((a,b)=>a.priority-b.priority||this.distance(a,this.p)-this.distance(b,this.p))[0]||null;
 }
 operation(n){
  if(!n)return null;
  if(n.action==='locker')return this.rs.lockers[n.id]?.opened?null:{duration:n.duration,noise:n.noise};
  if(n.action==='lighting')return {duration:2,noise:22};
  if(n.action==='shutter'){const s=this.room.shutters.find(s=>s.id===n.gateId),a=this.rs.shutters[n.gateId];return a.status==='broken'?null:{duration:a.status==='open'?s.closeDuration:s.openDuration,noise:42};}
  const op=n.action==='device'?{duration:n.duration,noise:n.noise}:n.operation;
  if(!op)return null;
  return {...op,duration:n.flag==='beacon_lit'&&this.state.optional['device-guidance']?2:n.flag==='power_on'&&this.state.optional['device-pumps']?2.5:op.duration};
 }
 workCondition(n){
  if(n.action==='locker'&&!this.state.flags.equipped)return 'Les outils d’expédition sont requis pour ouvrir ce scellé.';
  if(n.action==='lighting'&&!this.state.flags.equipped)return 'Récupérez les outils d’expédition.';
  if(n.action==='shutter')return this.shutterCondition(this.room.shutters.find(s=>s.id===n.gateId));
  if(n.kind==='embark'){
   if(!this.state.flags.hosts_secured)return 'Les deux porteurs ne sont pas encore préparés.';
   if(!this.convoyNear(n,400))return 'Amenez les deux brancards aux berceaux de transport.';
  }
  if(n.flag==='winch_ready'&&!this.convoyNear(n,460))return 'Amenez les deux brancards au pied du treuil.';
  return '';
 }
 interact(){
  if(this.state.failed||this.state.finished||this.cooldowns.interaction>0)return false;
  const n=this.nearby();if(!n)return false;this.cooldowns.interaction=.3;
  if(n.action==='armory'){if(!this.armoryAccess()){this.emit('toast','La remise d’équipement précède l’accès aux fusils.');return false;}this.emit('armory',n.label);return true;}
  if(n.action==='cast'){const a=D.fidelity.characters[n.id];this.emit('story',this.castLine(n.id),{title:a.name,completed:'DIALOGUE ORIGINAL · '+a.role});return true;}
  if(n.action==='locker'){if(this.workCondition(n)){this.emit('toast',this.workCondition(n));return false;}if(!this.rs.lockers[n.id].opened){this.emit('toast','Maintenez E pour ouvrir le scellé. Le matériel ne sera pas pris automatiquement.');return false;}this.emit('storage',n.label,{id:n.id});return true;}
  if(n.action==='shutter'){this.emit('toast',this.workCondition(n)||'Maintenez G ou E pour manœuvrer la cloison.');return false;}
  if(n.action==='lighting'){this.emit('toast',this.workCondition(n)||'Maintenez E pour manœuvrer l’éclairage de travail.');return false;}
  const op=this.operation(n);
  if(op&&(this.rs.work[n.id]||0)<op.duration){this.emit('toast',this.workCondition(n)||'Maintenez E pour '+n.label.charAt(0).toLowerCase()+n.label.slice(1)+'.');return false;}
  if(n.action==='objective')return this.completeObjective();
  if(n.action==='device')return this.finishDevice(n);
  if(n.action==='door'){
   const st=this.doorStatus(n);if(!st.open){this.emit('toast',st.reason);return false;}
   this.state.stats.doors++;this.enter(n.to,n.pair);return true;
  }
  if(n.action==='archive'){
   this.addArchive(n.id);this.state.stats.archives++;return true;
  }
  if(n.action==='supply'){
   if(this.rs.supplyUsed){this.emit('toast','Le poste a déjà été vidé.');return false;}
   this.rs.supplyUsed=true;const m=D.difficulties[this.state.difficulty].supply;
   this.p.hp=Math.min(100,this.p.hp+45);this.p.filter=100;this.p.reserve+=Math.round(30*m);this.p.foam+=Math.round(8*m);this.p.fuel+=Math.round(55*m);
   this.emit('saved','Réserves récupérées. Filtre remplacé.');return true;
  }return false;
 }
 advanceWork(dt){
  const n=this.nearby(),op=this.operation(n);this.activeWork=null;
  if(n?.action==='locker')return this.storageStep(dt,n);
  if(n?.action==='shutter')return this.shutterStep(dt,n);
  if(n?.action==='lighting')return this.lightingStep(dt,n);
  if(!op||this.cooldowns.work>0||this.workCondition(n))return false;
  this.rs.work[n.id]=Math.min(op.duration,(this.rs.work[n.id]||0)+dt);
  this.activeWork={id:n.id,label:n.label,progress:this.rs.work[n.id]/op.duration};
  this.p.noise=Math.max(this.p.noise,op.noise||0);
  if(this.rs.work[n.id]>=op.duration-1e-7){
   this.rs.work[n.id]=op.duration;const ok=n.action==='objective'?this.completeObjective():this.finishDevice(n);
   if(ok){this.state.stats.operations++;this.activeWork=null;}return ok;
  }return false;
 }
 addArchive(id){if(!this.state.archives.includes(id)&&D.codex.some(c=>c.id===id)){this.state.archives.push(id);this.emit('archive',D.codex.find(c=>c.id===id).title,{id});}}
 finishDevice(n){
  if(this.rs.devices[n.id]||this.distance(this.p,n)>92||this.workCondition(n)||(this.rs.work[n.id]||0)<n.duration-1e-7)return false;
  this.rs.devices[n.id]=true;this.state.optional[n.id]=true;this.state.stats.devices++;
  if(n.kind==='filters')this.p.filters+=2;
  if(n.kind==='parts')this.p.parts+=2;
  if(n.kind==='medical'){
   this.p.medkits+=2;this.p.parts+=2;for(const a of this.state.rescue.actors)if(a.room===this.state.room)a.integrity=Math.min(100,a.integrity+25);
  }
  if(n.kind==='embark'){
   this.state.rescue.aboard=true;this.state.rescue.active=false;
   for(const [i,a]of this.state.rescue.actors.entries()){a.status='aboard';a.room='s37';a.x=570+i*210;a.z=.72;a.path=[];}
  }
  if(n.optional)this.addArchive(this.room.archive.id);
  this.emit('saved',n.reply);return true;
 }
 completeObjective(){
  const o=this.current;if(!o||o.room!==this.state.room||this.distance(this.p,o)>92||!this.visible(this.p,o))return false;
  const op=this.operation({...o,action:'objective'});if(op&&(this.rs.work[o.id]||0)<op.duration-1e-7)return false;
  if(this.workCondition(o)){this.emit('toast',this.workCondition(o));return false;}
  if(o.type==='sense'&&this.p.stress<7){this.emit('toast','Maintenez Espace pour vous concentrer.');return false;}
  if(o.type==='boss'&&!this.rs.enemies.some(e=>e.kind==='queen'&&e.hp<=0)){this.emit('toast','Brûlez les trois attaches. Manning pourra ouvrir le feu.');return false;}
  if(o.type==='capture'){
   if(!this.state.rescue.aboard){this.emit('toast','Arrimez les deux brancards dans les berceaux de la soute.');return false;}
   const e=this.rs.enemies.find(e=>e.kind==='captureAdult');
   if(!e||e.hp<=0){this.fail('Le spécimen n’a pas survécu. Reprenez la capture.');return false;}
   if(e.foam<.95||this.distance(e,o)>255){this.emit('toast','Attirez l’adulte près du caisson, puis immobilisez-le avec la mousse.');return false;}
   e.mode='captured';e.foam=1.2;e.path=[];e.moving=false;
  }
  const title=this.chapter.title;
  this.state.flags[o.flag]=true;this.state.completed.push(o.id);this.state.objectiveIndex++;
  if(o.flag==='equipped'){
   this.state.inventory.pistol=true;this.p.weapon='pistol';this.p.medkits=2;this.p.filters=2;this.p.decoys=3;this.p.parts=2;
   for(const id of ['field-lockers','resource-transfer','storage-limits','service-loops','sensors','sensor-radio','sensor-power','tactical-wheel','controller','field-input','pursuit','pursuit-limits','group-threshold','field-journal','shutters','breaches','rally','readings','windup','dodge','hazards','repair','waypoint','hazard-care'])this.addArchive('dossier-'+id);
   this.addArchive('dossier-noisemaker');this.addArchive('dossier-fieldcare');
  }
  if(o.flag==='filters_ready')this.p.filter=100;
  if(o.flag==='tracker_ready'){this.state.inventory.tracker=true;this.p.trackerOn=true;this.addArchive('dossier-tracker-use');}
  if(o.flag==='adams_secured')this.state.rescue.actors[0].status='ready';
  if(o.flag==='hosts_secured'){
   this.state.rescue.active=true;this.state.rescue.order='follow';
   for(const a of this.state.rescue.actors){a.status='following';a.room='s34';a.path=[];a.pathTime=0;}
   this.addArchive('dossier-convoy');
  }
  if(o.flag==='finished')this.state.finished=true;
  this.unlockDossiers();this.emit('story',o.reply,{title,completed:o.label,finished:this.state.finished});return true;
 }
 unlockDossiers(){
  const c=this.chapter.number,stages={4:['rollins','lineage','company'],5:['manning','rand','filter','lamp','pistol'],6:['cho','map'],8:['silas','detector'],9:['adult','empathy','memory'],12:['parasite'],13:['queen','flame'],14:['adams','elway'],16:['foam'],18:['survivors']};
  for(const [n,ids]of Object.entries(stages))if(c>=+n)for(const id of ids){const k='dossier-'+id;if(!this.state.archives.includes(k))this.state.archives.push(k);}
 }
 setPresentation(mode){
  this.state.presentation=mode==='CLASSIC'?'CLASSIC':'HYBRID';this.ensureSafePosition(this.p);this.ensureSafePosition(this.state.companion);
  for(const a of [...this.rs.enemies,...this.state.rescue.actors.filter(a=>a.room===this.state.room&&a.status==='following')]){this.ensureSafePosition(a);a.path=[];a.pathTime=0;}
  this.state.companion.path=[];this.state.companion.pathTime=0;if(this.state.companion.rally)this.ensureSafePosition(this.state.companion.rally);this.activeWork=null;
  this.emit('toast',mode==='CLASSIC'?'Vue latérale':'Vue hybride');
 }
 setWeapon(weapon){if(this.p.reload<=0&&Object.hasOwn(WEAPONS,weapon)&&this.weaponOwned(weapon)){this.p.weapon=weapon;this.emit('weapon',weapon);return true;}this.emit('toast','Cet équipement n’est pas disponible.');return false;}
 reload(){
  if(['pulse','plasma'].includes(this.p.weapon)){const a=this.state.armory;if(!a.claimed||this.p.reload>0)return false;if(this.p.weapon==='pulse'&&(a.pulseAmmo>=30||a.pulseReserve<=0)||this.p.weapon==='plasma'&&(a.plasmaAmmo>0||a.plasmaCells<=0))return false;this.p.reload=1.1;this.cooldowns.fire=1.1;this.emit('sound','reload');return true;}
  if(!this.state.inventory.pistol||this.p.ammo>=12||this.p.reserve<=0||this.p.reload>0)return false;
  this.p.reload=1.1;this.cooldowns.fire=Math.max(this.cooldowns.fire,1.1);this.emit('sound','reload');return true;
 }
 useMedkit(){if(this.p.hp>=100||this.p.medkits<1||this.state.failed)return false;this.p.medkits--;this.p.hp=Math.min(100,this.p.hp+45);this.state.stats.medkitsUsed++;this.emit('saved','Pansement posé.');return true;}
 replaceFilter(){if(this.p.filter>=99.9||this.p.filters<1||this.state.failed)return false;this.p.filters--;this.p.filter=100;this.state.stats.filtersUsed++;this.emit('saved','Cartouche remplacée.');return true;}
 toggleLamp(){this.p.lamp=!this.p.lamp;this.emit('toast',this.p.lamp?'Lampe allumée.':'Lampe éteinte.');}
 toggleTracker(){if(!this.state.inventory.tracker){this.emit('toast','Le détecteur n’est pas encore disponible.');return false;}this.p.trackerOn=!this.p.trackerOn;return true;}
 toggleConvoy(){if(!this.state.rescue.active)return false;this.state.rescue.order=this.state.rescue.order==='follow'?'hold':'follow';this.emit('toast',this.state.rescue.order==='follow'?'Les deux brancards repartent.':'Les brancards restent ici.');return true;}
 deployDecoy(target){
  if(this.p.decoys<1||this.cooldowns.decoy>0||this.state.failed||!this.state.flags.equipped)return false;
  let t=target&&Number.isFinite(target.x)&&Number.isFinite(target.z)?target:{x:this.p.x+this.p.facing*320,z:this.p.z};
  const d=this.distance(this.p,t),f=d>420?420/d:1;
  t={x:clamp(this.p.x+(t.x-this.p.x)*f,40,this.room.width-40),z:clamp(this.p.z+(this.zFor(t)-this.p.z)*f,...this.limits())};
  if(!this.visible(this.p,t)||this.blocked(t.x,t.z)){this.emit('toast','Pas de ligne de lancer dégagée.');return false;}
  this.p.decoys--;this.state.stats.decoysUsed++;this.cooldowns.decoy=2.5;
  this.rs.noises.push({x:t.x,z:t.z,time:7,amplitude:100,kind:'decoy'});this.rs.noises=this.rs.noises.slice(-8);
  this.emit('saved','Leurre acoustique lancé.');return true;
 }
 shoot(target){
  if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.z)||this.cooldowns.fire>0||this.p.reload>0||this.state.failed||this.state.finished||!this.weaponOwned(this.p.weapon))return false;
  const p=this.p,kind=p.weapon,a=this.state.armory;
  if(kind==='pulse'&&a.pulseAmmo<1||kind==='plasma'&&(a.plasmaAmmo<1||a.locked)){this.emit('toast',a.locked&&kind==='plasma'?'Plasma : laissez refroidir le canon.':'Rechargez votre arme.');this.cooldowns.fire=.4;return false;}
  if(kind==='pistol'&&p.ammo<1){this.emit('toast','Rechargez votre arme.');this.cooldowns.fire=.4;return false;}
  if(kind==='foam'&&p.foam<1||kind==='flame'&&p.fuel<2){this.emit('toast','Réserve épuisée.');this.cooldowns.fire=.4;return false;}
  const aim={x:target.x,z:this.mode==='SIDE'?.55:target.z};p.facing=aim.x>=p.x?1:-1;
  const len=this.distance(p,aim),range=kind==='flame'?390:kind==='foam'?790:1100,ratio=len?Math.min(1,range/len):1;
  const end={x:p.x+(aim.x-p.x)*ratio,z:this.zFor(p)+(this.zFor(aim)-this.zFor(p))*ratio};
  p.noise=kind==='foam'?45:kind==='flame'?55:100;this.state.stats.shots++;this.activeWork=null;this.cooldowns.work=.25;
  if(kind==='pistol')p.ammo--;if(kind==='foam')p.foam--;if(kind==='flame')p.fuel-=2;
  if(kind==='pulse')a.pulseAmmo--;if(kind==='plasma'){a.plasmaAmmo--;a.heat=clamp(a.heat+28,0,100);if(a.heat>=100)a.locked=true;}
  this.rs.noises.push({x:p.x,z:p.z,time:1,amplitude:p.noise,kind:'shot'});this.rs.noises=this.rs.noises.slice(-8);
  this.cooldowns.fire=kind==='pulse'?.11:kind==='plasma'?.6:kind==='flame'?.13:kind==='foam'?.35:.27;this.emit('shot','',{from:{x:p.x,z:p.z},to:end,weapon:kind});
  const lineDistance=e=>{
   const ax=p.x,ay=this.zFor(p)*470,vx=end.x-ax,vy=end.z*470-ay;
   const t=clamp(((e.x-ax)*vx+(this.zFor(e)*470-ay)*vy)/(vx*vx+vy*vy||1),0,1);
   return Math.hypot(e.x-(ax+t*vx),this.zFor(e)*470-(ay+t*vy));
  };
  if(kind==='flame')for(const w of this.rs.weakpoints)if(w.hp>0&&this.distance(p,w)<390&&lineDistance(w)<65&&this.visible(p,w)){w.hp=Math.max(0,w.hp-14);this.emit('spark','',{x:w.x,z:w.z});}
  const targets=this.rs.enemies.filter(e=>e.hp>0&&e.mode!=='captured'&&this.distance(p,e)<=range&&lineDistance(e)<(e.kind==='queen'?88:e.kind==='facehugger'?32:42)&&this.visible(p,e)).sort((a,b)=>this.distance(p,a)-this.distance(p,b));
  if(targets.length){
   const e=targets[0];e.memory=7;e.mode='hunt';e.lastKnown={x:p.x,z:p.z};e.targetId='player';e.pathTime=0;
   if(kind==='foam'){e.foam=clamp(e.foam+.38,0,1.2);if(e.foam>=.95){e.mode='stunned';e.attack=null;e.breach=null;}}
   else this.hurtEnemy(e,e.kind==='queen'&&this.rs.weakpoints.some(w=>w.hp>0)?0:kind==='plasma'?45:kind==='pulse'?20:kind==='flame'?17:24);
  }return true;
 }
 hurtEnemy(e,amount){
  if(e.hp<=0||e.mode==='captured')return;e.hp=Math.max(0,e.hp-amount);if(amount>0)this.emit('hit','',{x:e.x,z:e.z});
  if(e.hp<=0){e.attack=null;e.breach=null;e.mode='dead';e.moving=false;this.state.stats.kills++;this.rs.corpses.push({x:e.x,z:e.z,kind:e.kind});this.rs.acid.push({x:e.x,z:e.z,time:7});
   if(e.kind==='captureAdult')this.fail('Le spécimen est mort. La compagnie exige une capture vivante.');
   if(e.kind==='queen')this.emit('toast','La voie est libre. Rassemblez le groupe.');
  }
 }
 damage(amount){
  if(this.p.invulnerable>0||this.state.failed)return;
  amount*=D.difficulties[this.state.difficulty].damage;this.p.hp=Math.max(0,this.p.hp-amount);this.state.stats.damage+=amount;
  this.p.invulnerable=.65;this.cooldowns.work=.8;this.activeWork=null;this.emit('damage','');if(this.p.hp<=0)this.fail('Vous n’avez pas atteint l’abri.');
 }
 hurtStretcher(a,amount){
  if(a.status!=='following'||this.state.failed)return;
  a.integrity=Math.max(0,a.integrity-amount*D.difficulties[this.state.difficulty].damage);
  this.emit('toast','Le brancard de '+a.name+' est attaqué !');if(a.integrity<=0)this.fail('Le brancard de '+a.name+' a été détruit. Reprenez la salle.');
 }
 fail(text){if(this.state.failed)return;this.state.failed=text;this.state.stats.deaths++;this.activeWork=null;this.emit('failed',text);}
 retry(){const deaths=this.state.stats.deaths;this.state=copy(this.checkpoint);this.state.failed=null;this.state.stats.deaths=deaths;this.p.hp=Math.max(70,this.p.hp);this.p.invulnerable=2.5;this.resetRuntime();this.time=this.state.stats.time;this.emit('room',this.room.name);}
 startDodge(input={}){
  if(!this.state.flags.equipped||this.state.failed||this.state.finished||this.p.dodgeCooldown>0||this.p.stamina<28)return false;
  let x=(input.right?1:0)-(input.left?1:0),z=this.mode==='SIDE'?0:(input.down?1:0)-(input.up?1:0);
  if(!x&&!z)x=-this.p.facing;const n=Math.hypot(x,z)||1;
  Object.assign(this.p,{dodgeX:x/n,dodgeZ:z/n,dodgeTime:.26,dodgeCooldown:1.35,stamina:this.p.stamina-28});
  this.p.invulnerable=Math.max(this.p.invulnerable,.16);this.state.stats.dodges++;
  this.activeWork=null;this.cooldowns.work=.3;this.emit('sound','dodge');return true;
 }
 repairTarget(){return this.state.rescue.active&&this.state.rescue.order==='hold'?this.state.rescue.actors.filter(a=>a.room===this.state.room&&a.status==='following'&&a.integrity<100&&this.distance(a,this.p)<105&&this.visible(a,this.p)).sort((a,b)=>this.distance(a,this.p)-this.distance(b,this.p))[0]||null:null;}
 repairStep(dt){
  const a=this.repairTarget();if(!a||this.p.parts<1||this.cooldowns.work>0||this.p.dodgeTime>0)return false;
  const w=this.state.repair;if(w.actor!==a.id){w.actor=a.id;w.progress=0;}w.progress=Math.min(3,w.progress+dt);
  this.activeWork={id:'repair-'+a.id,label:'Réparer le brancard de '+a.name,progress:w.progress/3};this.p.noise=Math.max(this.p.noise,16);
  if(w.progress>=3-1e-7){this.p.parts--;a.integrity=Math.min(100,a.integrity+35);this.state.stats.repairs++;w.actor=null;w.progress=0;this.activeWork=null;this.emit('saved','Brancard de '+a.name+' renforcé.');return true;}return false;
 }
 hazardStatus(h){
  if(h.disableFlag&&this.state.flags[h.disableFlag]||h.disableDevice&&this.state.optional[h.disableDevice])return {phase:'stopped',remaining:0};
  const t=(this.rs.localTime+h.offset)%h.period,safe=h.period-h.warning-h.active;
  return t<safe?{phase:'safe',remaining:safe-t}:t<safe+h.warning?{phase:'warning',remaining:safe+h.warning-t}:{phase:'active',remaining:h.period-t};
 }
 inHazard(a,h,padding=0){return Math.abs(a.x-h.x)<h.w/2+padding&&(this.mode==='SIDE'||Math.abs(a.z-h.z)<h.d/2+padding/650);}
 stepHazards(dt){
  this.rs.localTime+=dt;
  for(const [key,t]of Object.entries(this.rs.hazardHits))if(t<=this.rs.localTime)delete this.rs.hazardHits[key];
  for(const h of this.room.hazards||[]){if(this.hazardStatus(h).phase!=='active')continue;
   const actors=[{id:'player',actor:this.p},...this.state.rescue.active?this.state.rescue.actors.map(a=>({id:a.id,actor:a})):[]];
   for(const {id,actor}of actors){const key=h.id+':'+id;if(!this.inHazard(actor,h)||this.rs.hazardHits[key])continue;
    this.rs.hazardHits[key]=this.rs.localTime+.8;
    if(h.kind==='gas'){
     if(id!=='player')continue;
     if(this.p.filter>0){this.p.filter=Math.max(0,this.p.filter-12);this.emit('toast','Le panache sature votre filtre.');continue;}
    }
    const hp=id==='player'?this.p.hp:actor.integrity;
    if(id==='player')this.damage(h.damage);else this.hurtStretcher(actor,h.damage);
    this.state.stats.hazardDamage+=Math.max(0,hp-(id==='player'?this.p.hp:actor.integrity));
   }
  }
 }
 beginAttack(e,victim){
  const duration=e.kind==='queen'?1.05:e.kind==='facehugger'?.45:.65;
  e.attack={x:victim.x,z:this.zFor(victim),remaining:duration,duration,victim:victim===this.p?'player':victim.id};
  e.mode='hunt';this.emit('windup','',{x:e.x,z:e.z,kind:e.kind});
 }
 resolveAttack(e,dt){
  if(!e.attack)return false;const a=e.attack;a.remaining=Math.max(0,a.remaining-dt);
  if(a.remaining>0)return true;
  const victim=a.victim==='player'?this.p:this.state.rescue.actors.find(b=>b.id===a.victim&&b.room===this.state.room&&b.status==='following');
  const radius=e.kind==='queen'?150:e.kind==='facehugger'?48:72;
  if(victim&&this.distance(victim,a)<radius&&this.distance(e,victim)<(e.kind==='queen'?235:110)&&this.visible(e,victim)){
   const damage=e.kind==='queen'?28:e.kind==='facehugger'?13:18;
   if(victim===this.p)this.damage(damage);else this.hurtStretcher(victim,damage);
  }
  e.cooldown=e.kind==='queen'?1.8:e.kind==='facehugger'?1:1.25;e.attack=null;this.emit('attack','',{x:a.x,z:a.z});return true;
 }
 knownRooms(){const known=new Set(this.state.visited);for(const id of this.state.visited)for(const door of R[id].doors)known.add(door.to);return known;}
 setWaypoint(id){if(id===null){this.state.waypoint=null;return true;}if(!this.knownRooms().has(id))return false;this.state.waypoint=id;return true;}
 routeTo(target=this.state.waypoint){
  if(!target||!R[target])return null;if(target===this.state.room)return [];
  const known=this.knownRooms(),q=[[this.state.room,[]]],seen=new Set([this.state.room]);
  while(q.length){const [id,route]=q.shift();for(const d of R[id].doors){if(seen.has(d.to)||!known.has(d.to)||!this.doorStatus(d,id,false).open)continue;const next=[...route,d];if(d.to===target)return next;seen.add(d.to);q.push([d.to,next]);}}return null;
 }
 routeBarrier(route=this.routeTo()){
  if(!route||!route.length)return null;const dest=route[0].x,lo=Math.min(this.p.x,dest),hi=Math.max(this.p.x,dest);
  return this.room.shutters.filter(s=>s.x>lo&&s.x<hi&&this.rs.shutters[s.id].status==='closed').sort((a,b)=>Math.abs(a.x-this.p.x)-Math.abs(b.x-this.p.x))[0]||null;
 }
 step(dt,input={}){
  dt=clamp(Number.isFinite(dt)?dt:0,0,.05);if(!dt||this.state.failed||this.state.finished)return;
  if(!input.shutter&&!input.use)this.shutterLatch=null;
  if(!input.use)this.lightingLatch=null;
  this.time+=dt;this.state.stats.time+=dt;for(const k of Object.keys(this.cooldowns))this.cooldowns[k]=Math.max(0,this.cooldowns[k]-dt);
  const p=this.p;p.invulnerable=Math.max(0,p.invulnerable-dt);p.crouch=!!input.crouch;this.activeWork=null;p.dodgeCooldown=Math.max(0,p.dodgeCooldown-dt);if(input.dodge)this.startDodge(input);
  if(p.reload>0){const before=p.reload;p.reload=Math.max(0,p.reload-dt);if(before>0&&p.reload===0){const a=this.state.armory;if(p.weapon==='pulse'){const q=Math.min(30-a.pulseAmmo,a.pulseReserve);a.pulseAmmo+=q;a.pulseReserve-=q;}else if(p.weapon==='plasma'){if(a.plasmaCells>0&&a.plasmaAmmo===0){a.plasmaCells--;a.plasmaAmmo=12;}}else{const q=Math.min(12-p.ammo,p.reserve);p.ammo+=q;p.reserve-=q;}}}
  const arm=this.state.armory;arm.heat=Math.max(0,arm.heat-12*dt);if(arm.locked&&arm.heat<=30)arm.locked=false;
  let dx=(input.right?1:0)-(input.left?1:0),dz=(input.down?1:0)-(input.up?1:0);
  if(!dx&&Number.isFinite(input.moveX))dx=clamp(input.moveX,-1,1);if(!dz&&Number.isFinite(input.moveZ))dz=clamp(input.moveZ,-1,1);
  if(this.mode==='SIDE')dz=0;const running=!!input.run&&p.stamina>3&&!p.crouch&&!input.use;
  const speed=input.use||input.repair||input.shutter?0:p.crouch?110:running?310:205;const magnitude=Math.hypot(dx,dz);if(magnitude>1){dx/=magnitude;dz/=magnitude;}
  if(p.dodgeTime>0){const burst=Math.min(dt,p.dodgeTime);p.moving=this.move(p,p.dodgeX*490*burst,p.dodgeZ*490*burst/470)>.01;p.dodgeTime=Math.max(0,p.dodgeTime-dt);p.noise=Math.max(p.noise,42);}else p.moving=this.move(p,dx*speed*dt,dz*speed*dt/470)>.01;if(dx&&!input.use)p.facing=dx>0?1:-1;
  p.stamina=clamp(p.stamina+(running&&p.moving?-21:14)*dt,0,100);p.noise=clamp(p.noise-55*dt,0,100);if(p.moving)p.noise=Math.max(p.noise,p.crouch?6:running?58:20);
  if(input.focus){p.stress=clamp(p.stress+20*dt,0,100);this.state.stats.empathySeconds+=dt;}else p.stress=Math.max(0,p.stress-8*dt);
  if(this.room.kind==='sand'&&this.state.flags.equipped){p.filter=Math.max(0,p.filter-1.1*dt);if(p.filter<=0)this.damage(3);}
  for(const a of this.rs.acid){a.time-=dt;if(a.time>0&&this.distance(a,p)<38)this.damage(8);}
  this.rs.acid=this.rs.acid.filter(a=>a.time>0);for(const n of this.rs.noises)n.time-=dt;this.rs.noises=this.rs.noises.filter(n=>n.time>0);
  // Processing work before enemies makes noise from the current operation audible this frame.
  this.stepHazards(dt);
  this.stepReadings(dt,input);
  if(input.shutter&&!input.fire)this.shutterStep(dt);
  else if(input.repair&&!input.fire)this.repairStep(dt);
  else if(input.use&&!input.fire&&p.dodgeTime<=0)this.advanceWork(dt);
  if(this.state.finished||this.state.failed)return;
  this.stepPursuits(dt);this.stepConvoy(dt);this.stepEnemies(dt,input);this.stepCompanion(dt);this.stepSensors(dt);
  if(input.fire&&input.target)this.shoot(input.target);
 }
 stepEnemies(dt,input){
  const p=this.p;
  for(const e of this.rs.enemies){
   e.moving=false;if(e.hp<=0||e.mode==='captured')continue;
   e.cooldown=Math.max(0,e.cooldown-dt);e.foam=Math.max(0,e.foam-.013*dt);
   if(e.foam>=.95){e.mode='stunned';e.attack=null;e.breach=null;continue;}
   if(this.resolveAttack(e,dt))continue;
   const d=this.distance(e,p),los=this.visible(e,p),vision=this.visionRange();
   const sees=d<vision&&los;
   let heard=null;
   const hearing=this.state.optional['device-vent']&&['s29','s31','s44'].includes(this.state.room)?2:5;
   if(d<p.noise*hearing*this.soundTransmission(e,p))heard={x:p.x,z:p.z};
   const sounds=this.rs.noises.filter(n=>this.distance(e,n)<n.amplitude*hearing*this.soundTransmission(e,n)).sort((a,b)=>(b.amplitude-this.distance(e,b)/7)-(a.amplitude-this.distance(e,a)/7));
   if(sounds.length)heard={x:sounds[0].x,z:sounds[0].z};
   if(input.focus&&p.stress>45&&d<1000)heard={x:p.x,z:p.z};
   // Wheels are a real acoustic cue, evaluated at the moving stretcher, not at Decker.
   if(this.state.rescue.active){const sound=this.state.rescue.actors.find(a=>a.room===this.state.room&&a.moving&&this.distance(e,a)<this.formation().noise*hearing*this.soundTransmission(e,a));if(sound&&!heard)heard={x:sound.x,z:sound.z};}
   const patient=this.state.rescue.active?this.state.rescue.actors.find(a=>a.room===this.state.room&&this.distance(e,a)<(this.lightsOff()?110:190)&&this.visible(e,a)):null;
   if(sees||patient){const target=sees&&(!patient||d<this.distance(e,patient))?p:patient;
    e.lastKnown={x:target.x,z:target.z};e.targetId=target===p?'player':target.id;e.mode='hunt';e.memory=7;e.searchTime=0;e.alert=Math.min(1,e.alert+dt*2);
   }else if(heard){e.lastKnown=heard;e.targetId='noise';e.mode='investigate';e.memory=5;e.searchTime=0;}
   else{e.memory=Math.max(0,e.memory-dt);e.alert=Math.max(0,e.alert-dt*.15);
    if(e.memory>0&&this.distance(e,e.lastKnown)<40){e.mode='search';e.searchTime+=dt;}
    if(e.memory===0)e.mode='patrol';
   }
   if(e.kind==='queen'){if(d<210&&los&&e.cooldown<=0)this.beginAttack(e,p);continue;}
   let target=e.mode==='patrol'?{x:clamp(e.homeX+e.patrol*150,45,this.room.width-45),z:e.homeZ}:e.lastKnown;
   if(e.mode==='patrol'&&this.distance(e,target)<35)e.patrol*=-1;
   if(e.mode==='search')target={x:clamp(e.lastKnown.x+Math.sin(e.searchTime*1.6)*85,40,this.room.width-40),z:this.zFor(e.lastKnown)};
   if(this.stepBreach(e,target,dt))continue;
   const speed=(e.kind==='facehugger'?190:e.mode==='hunt'?155:e.mode==='investigate'?95:58)*(1-e.foam*.8);
   const old=e.x;e.moving=this.follow(e,target,speed,dt)>.01;if(Math.abs(e.x-old)>.01)e.facing=e.x>old?1:-1;
   const victim=e.targetId==='player'?p:this.state.rescue.actors.find(a=>a.id===e.targetId&&a.room===this.state.room&&a.status==='following');
   if(victim&&this.distance(e,victim)<(e.kind==='facehugger'?42:60)&&this.visible(e,victim)&&e.cooldown<=0){
    this.beginAttack(e,victim);
   }
  }
 }
 stepCompanion(dt){
  const a=this.state.companion;a.moving=false;a.cooldown=Math.max(0,a.cooldown-dt);
  if(!this.state.flags.equipped||this.chapter.number>=17)return;
  if(a.rally){const old=a.x;if(this.distance(a,a.rally)>14)a.moving=this.follow(a,a.rally,220,dt)>.01;if(Math.abs(a.x-old)>.01)a.facing=a.x>old?1:-1;}
  else if(a.order==='follow'){
   const target={x:clamp(this.p.x-this.p.facing*85,40,this.room.width-40),z:this.zFor(this.p)};
   if(this.distance(a,target)>25){const old=a.x;a.moving=this.follow(a,target,220,dt)>.01;if(Math.abs(a.x-old)>.01)a.facing=a.x>old?1:-1;}
  }
  if(a.cooldown<=0){
   const foes=this.rs.enemies.filter(e=>e.hp>0&&e.kind!=='captureAdult'&&e.mode!=='captured'&&this.distance(e,a)<900&&this.visible(a,e)&&Math.abs(this.zFor(e)-this.zFor(a))<.24);
   const t=a.fireMode==='hold'?null:foes.find(e=>a.fireMode==='free'||e.mode==='hunt');
   if(t&&!(t.kind==='queen'&&this.rs.weakpoints.some(w=>w.hp>0))){a.facing=t.x>=a.x?1:-1;this.hurtEnemy(t,14);a.cooldown=.65;this.emit('shot','',{from:{x:a.x,z:a.z},to:{x:t.x,z:t.z},weapon:'ally'});}
  }
 }
 stepConvoy(dt){
  const rescue=this.state.rescue,formation=this.formation();for(const a of rescue.actors)a.moving=false;if(!rescue.active)return;
  if(rescue.order==='follow'){
   let target=this.p;
   for(const a of rescue.actors){
    if(a.room!==this.state.room||a.status!=='following')continue;
    const t={x:clamp(target.x-this.p.facing*formation.gap,40,this.room.width-40),z:this.zFor(target)};
    if(this.distance(a,t)>12){const distance=this.follow(a,t,formation.speed,dt);a.moving=distance>.01;this.state.stats.escortMeters+=distance/100;}
    target=a;
   }
  }
 }
 trackerContacts(){
  if(!this.state.inventory.tracker||!this.p.trackerOn)return [];
  return this.rs.enemies.filter(e=>e.hp>0&&e.mode!=='captured'&&e.foam<.95&&e.moving&&this.distance(e,this.p)<1250).map(e=>({x:e.x-this.p.x,z:this.zFor(e)-this.p.z,distance:this.distance(e,this.p)/100}));
 }
 empathyHint(){
  if(this.p.stress<3)return null;
  const e=this.rs.enemies.filter(e=>e.hp>0&&e.mode!=='captured').sort((a,b)=>this.distance(a,this.p)-this.distance(b,this.p))[0];
  if(!e)return {direction:0,text:'Un silence trop dense. Rien de précis.'};
  return {direction:e.x>=this.p.x?1:-1,text:this.p.stress>75?'Elle vous reconnaît. Coupez le lien.':this.distance(e,this.p)<400?'Une présence proche. Elle vous cherche.':'Une hostilité lointaine, dans cette direction.'};
 }
 missionHint(){
  if(this.current?.type==='capture'&&!this.state.rescue.aboard)return 'Arrimer les brancards dans la soute';
  return this.current?.label||'Les voix persistent.';
 }
 exportSave(){return JSON.stringify({format:'sos-save',schema:8,state:this.state,checkpoint:this.checkpoint});}
 migrateLegacy(s){
  if(!s||s.schema!==1)return s;
  s=copy(s);s.schema=2;s.version=D.meta.version;s.optional={};s.rescue=rescueDefaults();
  if(s.player)Object.assign(s.player,{medkits:s.flags?.equipped?2:0,filters:s.flags?.equipped?2:0,decoys:s.flags?.equipped?3:0,lamp:true,trackerOn:!!s.inventory?.tracker,moving:false,reload:0});
  if(s.companion)Object.assign(s.companion,{fireMode:'return',path:[],pathTime:0});
  if(s.stats)Object.assign(s.stats,{operations:0,devices:0,medkitsUsed:0,filtersUsed:0,decoysUsed:0,escortMeters:0});
  if(s.flags?.adams_secured)s.rescue.actors[0].status='ready';
  if(s.flags?.hosts_secured&&s.player&&R[s.room]){
   s.rescue.aboard=!!s.flags.live_capture;s.rescue.active=!s.rescue.aboard;
   for(const [i,a]of s.rescue.actors.entries())Object.assign(a,{status:s.rescue.aboard?'aboard':'following',room:s.rescue.aboard?'s37':s.room,x:clamp(s.player.x+(i+1)*90,40,R[s.room].width-40),z:s.player.z});
  }
  for(const rs of Object.values(s.roomStates||{})){
   if(!rs||!Array.isArray(rs.enemies))continue;
   Object.assign(rs,{kitClaimed:true,work:{},devices:{},noises:[]});
   for(const e of rs.enemies)Object.assign(e,{attack:null,breach:null,facing:-1,moving:false,lastKnown:{x:e.x,z:e.z},searchTime:0,targetId:'player'});
  }
  for(const id of s.completed||[]){const o=O[id];if(o?.operation&&s.roomStates?.[o.room])s.roomStates[o.room].work[id]=o.operation.duration;}
  return s;
 }
 migrateV2(s){
  if(!s||s.schema!==2)return s;
  s=copy(s);s.schema=3;s.version=D.meta.version;s.waypoint=null;s.repair={actor:null,progress:0};
  if(s.player)Object.assign(s.player,{parts:s.flags?.equipped?2:0,dodgeTime:0,dodgeCooldown:0,dodgeX:0,dodgeZ:0});
  if(s.stats)Object.assign(s.stats,{dodges:0,repairs:0,hazardDamage:0});
  for(const rs of Object.values(s.roomStates||{})){if(!rs)continue;rs.localTime=0;rs.hazardHits={};for(const e of rs.enemies||[])e.attack=null;}
  return s;
 }
 // v0.4 — authored, reversible room shutters; both control panels are physical.
 shutterControls(s){
  const a=this.rs.shutters[s.id],label=a.status==='broken'?'Cloison hors service':(a.status==='open'?'Fermer — ':'Ouvrir — ')+s.label;
  return [-1,1].map(side=>({id:s.id+':'+side,gateId:s.id,x:s.x+side*105,z:.55,action:'shutter',priority:1.5,label}));
 }
 nearShutter(){return (this.room.shutters||[]).flatMap(s=>this.shutterControls(s)).filter(n=>this.distance(n,this.p)<92&&this.visible(this.p,n)).sort((a,b)=>this.distance(a,this.p)-this.distance(b,this.p))[0]||null;}
 shutterCondition(s){
  if(!s)return 'Approchez un pupitre de cloison.';
  if(!this.state.flags.equipped)return 'Le matériel de terrain n’est pas encore disponible.';
  const a=this.rs.shutters[s.id];if(a.status==='broken')return 'Mécanisme rompu : le passage reste ouvert.';
  if(a.status==='open'){
   const actors=[this.p,...this.state.flags.equipped&&this.chapter.number<17?[this.state.companion]:[],...this.rs.enemies.filter(e=>e.hp>0&&e.mode!=='captured'),...this.state.rescue.active?this.state.rescue.actors:[]];
   if(actors.some(p=>Math.abs(p.x-s.x)<s.w/2+38))return 'Course occupée : écartez le groupe de la cloison.';
  }
  return '';
 }
 clearPaths(){for(const a of [this.state.companion,...this.rs.enemies,...this.state.rescue.actors]){a.path=[];a.pathTime=0;}}
 shutterStep(dt,n=this.nearShutter()){
  if(this.state.failed||this.state.finished||!n||n.action!=='shutter'||this.cooldowns.work>0||this.p.dodgeTime>0||this.distance(this.p,n)>=92||!this.visible(this.p,n))return false;
  const s=this.room.shutters.find(s=>s.id===n.gateId),a=this.rs.shutters[n.gateId];
  if(this.shutterLatch===n.gateId||this.shutterCondition(s))return false;
  const duration=a.status==='open'?s.closeDuration:s.openDuration;
  a.progress=Math.min(duration,a.progress+dt);this.activeWork={id:'shutter-'+s.id,label:n.label,progress:a.progress/duration};this.p.noise=Math.max(this.p.noise,42);
  if(a.progress>=duration-1e-7){
   // Recheck the swept volume on the closing frame. Never move an actor to make room.
   if(this.shutterCondition(s))return false;
   a.status=a.status==='open'?'closed':'open';a.progress=0;this.shutterLatch=s.id;this.activeWork=null;this.state.stats.shutterCycles++;this.clearPaths();
   this.emit('saved',s.label+(a.status==='closed'?' fermée. Protection temporaire.':' ouverte.'));return true;
  }return false;
 }
 soundTransmission(a,b){return (this.room.shutters||[]).some(s=>this.rs.shutters[s.id].status==='closed'&&crossed(a,b,{...s,z:.5,d:1.2}))?.65:1;}
 stepBreach(e,target,dt){
  const s=(this.room.shutters||[]).find(s=>this.rs.shutters[s.id].status==='closed'&&crossed({x:e.x,z:this.zFor(e)},{x:target.x,z:this.zFor(target)},{...s,z:.5,d:1.2}));
  if(!s||e.mode==='patrol'||e.mode==='stunned'||e.hp<=0){e.breach=null;return false;}
  const side=e.x<s.x?-1:1,approach={x:s.x+side*(s.w/2+40),z:this.zFor(e)};
  if(Math.abs(e.x-approach.x)>16){e.breach=null;const old=e.x;e.moving=this.follow(e,approach,120*(1-e.foam*.8),dt)>.01;if(Math.abs(e.x-old)>.01)e.facing=e.x>old?1:-1;return true;}
  e.facing=-side;
  if(e.cooldown>0)return true;
  if(!e.breach||e.breach.gate!==s.id){e.breach={gate:s.id,remaining:.9,duration:.9};this.emit('windup','',{x:e.x,z:e.z,kind:'shutter'});return true;}
  e.breach.remaining=Math.max(0,e.breach.remaining-dt);
  if(e.breach.remaining===0){
   const a=this.rs.shutters[s.id];a.integrity=Math.max(0,a.integrity-(e.kind==='facehugger'?10:25));e.breach=null;e.cooldown=.45;
   this.emit('attack','',{x:s.x,z:e.z});
   if(a.integrity===0){a.status='broken';a.progress=0;this.state.stats.shutterBreaches++;this.clearPaths();this.emit('saved',s.label+' rompue ! Le passage est libre.');}
  }return true;
 }
 commandCompanion(target){
  if(!this.state.flags.equipped||this.chapter.number>=17||this.state.failed||this.state.finished)return false;
  if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.z))return false;
  const dest={x:target.x,z:this.zFor(target)};
  if(this.distance(this.p,dest)>1050||this.blocked(dest.x,dest.z)||!this.pathTo(this.state.companion,dest).length){this.emit('toast','Manning : cette position n’est pas accessible.');return false;}
  const a=this.state.companion;a.rally=dest;a.order='hold';a.path=[];a.pathTime=0;this.state.stats.rallyOrders++;this.emit('saved','Manning rejoint la position désignée. V : le rappeler.');return true;
 }
 cycleCompanionFire(){const a=this.state.companion;if(!this.state.flags.equipped||this.chapter.number>=17)return false;a.fireMode={return:'free',free:'hold',hold:'return'}[a.fireMode];this.emit('saved','Manning : '+{return:'riposte seulement.',free:'feu libre.',hold:'ne pas tirer.'}[a.fireMode]);return true;}
 toggleCompanion(){
  if(!this.state.flags.equipped||this.chapter.number>=17)return false;
  const a=this.state.companion;a.order=a.order==='follow'?'hold':'follow';a.rally=null;a.path=[];a.pathTime=0;
  this.emit('toast',a.order==='follow'?'Manning vous suit.':'Manning tient sa position.');return true;
 }
 readingHint(){
  if(this.p.stress<14)return null;
  return (this.room.echoes||[]).filter(e=>!this.state.insights.includes(e.id)&&this.distance(this.p,e)<380).sort((a,b)=>this.distance(a,this.p)-this.distance(b,this.p))[0]||null;
 }
 stepReadings(dt,input){
  if(!input.focus||!this.state.flags.equipped||this.p.moving||this.p.dodgeTime>0||input.fire||this.state.failed)return;
  const e=(this.room.echoes||[]).find(e=>!this.state.insights.includes(e.id)&&this.distance(this.p,e)<e.radius&&this.p.stress>=e.pressure&&this.visible(this.p,e));
  if(!e)return;
  this.rs.echoProgress[e.id]=Math.min(e.duration,(this.rs.echoProgress[e.id]||0)+dt);
  if(this.rs.echoProgress[e.id]>=e.duration-1e-7){this.rs.echoProgress[e.id]=e.duration;this.state.insights.push(e.id);this.state.stats.readings++;this.addArchive('dossier-'+e.id);this.emit('saved','Perception consignée : '+e.title+'. J : relire les dossiers.');}
 }
 migrateV3(s){
  if(!s||s.schema!==3)return s;s=copy(s);s.schema=4;s.version=D.meta.version;s.insights=[];
  if(s.companion)s.companion.rally=null;
  if(s.stats)Object.assign(s.stats,{shutterCycles:0,shutterBreaches:0,rallyOrders:0,readings:0});
  for(const [id,rs]of Object.entries(s.roomStates||{}))if(rs&&R[id]){
   rs.shutters=Object.fromEntries((R[id].shutters||[]).map(d=>[d.id,{status:'open',integrity:100,progress:0}]));rs.echoProgress={};
   for(const e of rs.enemies||[])e.breach=null;
  }
  if(s.flags?.equipped&&Array.isArray(s.archives))for(const id of ['shutters','breaches','rally','readings'])if(!s.archives.includes('dossier-'+id))s.archives.push('dossier-'+id);
  return s;
 }

 // v0.5 — identity-preserving pursuit, never a spawn director.
 populationFor(state,id){return D.rooms.flatMap(r=>r.enemySpawns.filter(e=>(state.pursuit.transfers[e.id]||r.id)===id));}
 withRoom(id,fn){const before=this.state.room;this.state.room=id;try{return fn();}finally{this.state.room=before;}}
 enemyPassage(from,door){
  if(!door?.pursuitAllowed||!R[from]||!R[door.to])return false;
  const back=R[door.to].doors.find(d=>d.pair===door.pair&&d.to===from);
  if(!back?.pursuitAllowed||door.gate&&!this.state.flags[door.gate]||back.gate&&!this.state.flags[back.gate])return false;
  if(this.state.flags.maze_known&&['s28','s29'].includes(from)&&['s28','s29'].includes(door.to))return false;
  return true;
 }
 schedulePursuit(door){
  if(!this.state.pursuit||!this.enemyPassage(this.state.room,door)||!this.state.flags.equipped)return;
  const pending=this.state.pursuit.pending,ids=new Set(pending.map(q=>q.id));
  const candidates=this.rs.enemies.filter(e=>!ids.has(e.id)&&['adult','facehugger'].includes(e.kind)&&e.hp>0&&e.foam<.95&&e.memory>0&&e.mode==='hunt'&&['player','adams','elway'].includes(e.targetId)&&this.distance(e,this.p)<700&&this.distance(e.lastKnown,this.p)<240&&this.visible(e,this.p)&&this.pathTo(e,door).length).sort((a,b)=>this.distance(a,door)-this.distance(b,door));
  for(const e of candidates.slice(0,Math.min(2,6-pending.length))){
   pending.push({id:e.id,from:this.state.room,to:door.to,pair:door.pair,phase:'approach',age:0,remaining:2.2,announced:false});
   e.attack=null;e.breach=null;e.path=[];e.pathTime=0;this.state.stats.pursuitStarts++;
  }
 }
 cancelReturningPursuits(room){
  if(!this.state.pursuit)return;
  // Re-entering the source resumes ordinary AI at its actual position.
  this.state.pursuit.pending=this.state.pursuit.pending.filter(q=>q.from!==room);
 }
 pursuitSignals(){return this.state.pursuit.pending.filter(q=>q.to===this.state.room&&q.phase==='threshold'&&q.announced).map(q=>({pair:q.pair,from:q.from,door:this.room.doors.find(d=>d.pair===q.pair)}));}
 stepPursuits(dt){
  const tracking=this.state.pursuit,activeRoom=this.state.room;
  for(const q of [...tracking.pending]){
   if(!tracking.pending.includes(q))continue;
   const remove=()=>{tracking.pending=tracking.pending.filter(a=>a!==q);};
   const source=this.state.roomStates[q.from],e=source?.enemies.find(a=>a.id===q.id),door=R[q.from]?.doors.find(d=>d.pair===q.pair&&d.to===q.to);
   if(!e||e.hp<=0||e.mode==='captured'||q.from===activeRoom||!this.enemyPassage(q.from,door)){remove();continue;}
   q.age+=dt;
   // A blocked/lost trail ends in the source; the actor is not deleted.
   if(q.age>24){e.mode='search';e.memory=3;e.lastKnown={x:e.x,z:e.z};e.path=[];remove();this.state.stats.pursuitLost++;continue;}
   this.withRoom(q.from,()=>{
    e.cooldown=Math.max(0,e.cooldown-dt);e.foam=Math.max(0,e.foam-.013*dt);
    if(e.foam>=.95){e.moving=false;return;}
    if(q.phase==='approach'){
     e.lastKnown={x:door.x,z:this.zFor(door)};e.mode='hunt';e.memory=7;
     if(this.stepBreach(e,door,dt))return;
     const old=e.x;e.moving=this.follow(e,door,(e.kind==='facehugger'?190:155)*(1-e.foam*.8),dt)>.01;
     if(Math.abs(e.x-old)>.01)e.facing=e.x>old?1:-1;
     if(this.distance(e,door)<30){q.phase='threshold';e.moving=false;e.path=[];}
    }else e.moving=false;
   });
   if(q.phase!=='threshold'||e.foam>=.95)continue;
   if(q.to===activeRoom&&!q.announced){q.announced=true;this.emit('pursuit-warning','Des griffes derrière le seuil — '+R[q.from].name+'.',{pair:q.pair});}
   q.remaining=Math.max(0,q.remaining-dt);if(q.remaining>0)continue;
   const back=R[q.to].doors.find(d=>d.pair===q.pair),dest=this.state.roomStates[q.to]||(this.state.roomStates[q.to]=this.createRoomState(R[q.to]));
   let arrival=null;
   this.withRoom(q.to,()=>{
    const direction=back.x<this.room.width/2?1:-1;
    // Search only the immediate inner edge of this very doorway, never a distant spawn.
    for(const off of [34,48,64]){const p=this.portalLanding(back,off);
     if(!this.blocked(p.x,p.z)&&this.visible(back,p)){arrival=p;break;}}
   });
   if(!arrival)continue;
   source.enemies=source.enemies.filter(a=>a.id!==e.id);dest.enemies.push(e);tracking.transfers[e.id]=q.to;
   Object.assign(e,{x:arrival.x,z:arrival.z,homeX:arrival.x,homeZ:arrival.z,mode:'search',memory:5,searchTime:0,lastKnown:{...arrival},targetId:'noise',path:[],pathTime:0,attack:null,breach:null,cooldown:1.25,moving:true});
   remove();this.state.stats.pursuitArrivals++;
   if(activeRoom===q.to)this.emit('pursuit-arrival','Une présence a franchi le seuil. Restez en mouvement.',{pair:q.pair});
  }
 }
 migrateV4(s){
  if(!s||s.schema!==4)return s;s=copy(s);s.schema=5;s.version=D.meta.version;s.pursuit={transfers:{},pending:[],journal:[]};
  if(s.stats)Object.assign(s.stats,{pursuitStarts:0,pursuitArrivals:0,pursuitLost:0});
  if(s.flags?.equipped&&Array.isArray(s.archives))for(const id of ['pursuit','pursuit-limits','group-threshold','field-journal'])if(!s.archives.includes('dossier-'+id))s.archives.push('dossier-'+id);
  return s;
 }

 // v0.6 — finite, recoverable motion beacons. No enemies spawned or globally simulated.
 sensorDefaults(){return [1,2,3].map(n=>({id:'sensor-'+n,room:null,x:0,z:.55,charge:180,powered:false,lastPulse:-1,count:0}));}
 sensorNear(){return this.state.sensors.find(b=>b.room===this.state.room&&this.distance(this.p,b)<85&&this.visible(this.p,b));}
 sensorPlacement(){
  if(!this.state.flags.equipped)return {ok:false,reason:'Les capteurs sont remis avec l’équipement de l’expédition.'};
  if(this.state.failed||this.state.finished)return {ok:false,reason:'L’expédition n’est plus active.'};
  const near=this.sensorNear();if(near)return {ok:true,recover:near};
  const unit=this.state.sensors.find(b=>b.room===null&&b.charge>0);
  if(!unit)return {ok:false,reason:this.state.sensors.some(b=>b.room===null)?'Les capteurs rangés n’ont plus de batterie.':'Les trois capteurs sont déjà posés. Récupérez-en un sur place.'};
  const pos={x:this.p.x,z:this.p.z};
  if(this.blocked(pos.x,pos.z)||this.p.dodgeTime>0)return {ok:false,reason:'Attendez sur un sol praticable pour poser le capteur.'};
  if(this.room.shutters.some(b=>Math.abs(b.x-pos.x)<105))return {ok:false,reason:'La course de la cloison doit rester dégagée.'};
  if([...this.room.doors,...this.room.interactables,...this.room.devices,...(this.room.lighting?[this.room.lighting]:[]),...(this.room.lockers||[])].some(o=>this.distance(pos,o)<110))return {ok:false,reason:'Écartez-vous du seuil ou du dispositif avant de poser le capteur.'};
  if(this.state.sensors.some(b=>b.room===this.state.room&&this.distance(pos,b)<145))return {ok:false,reason:'Éloignez les capteurs pour couvrir des passages différents.'};
  return {ok:true,unit,pos};
 }
 sensorAction(){
  if(this.cooldowns.sensor>0)return false;
  const action=this.sensorPlacement();if(!action.ok){this.emit('toast',action.reason);return false;}
  if(action.recover){const b=action.recover;Object.assign(b,{room:null,x:0,z:.55,powered:false,count:0,lastPulse:-1});this.state.stats.sensorsRecovered++;this.sensorSamples.delete(b.id);this.emit('saved','Capteur récupéré. Sa batterie n’a pas été rechargée.');}
  else{const b=action.unit;Object.assign(b,{room:this.state.room,...action.pos,powered:true,count:0,lastPulse:-1});this.sensorSamples.delete(b.id);this.state.stats.sensorsPlaced++;this.emit('saved','Capteur '+b.id.slice(-1)+' posé : veille de mouvement active.');}
  this.cooldowns.sensor=.65;return true;
 }
 sensorLinked(b){
  if(!b.room)return false;
  if(b.room===this.state.room)return true;
  return this.room.doors.some(d=>d.to===b.room&&d.pursuitAllowed&&this.enemyPassage(this.state.room,d));
 }
 toggleSensor(id){
  if(this.state.failed||this.state.finished)return false;
  const b=this.state.sensors.find(s=>s.id===id);
  if(!b||!b.room||!this.sensorLinked(b)||b.charge<=0)return false;
  b.powered=!b.powered;b.count=0;this.sensorSamples.delete(b.id);
  this.emit('saved','Capteur '+id.slice(-1)+(b.powered?' : veille réactivée.':' : veille coupée à distance.'));return true;
 }
 sensorReports(){
  if(!this.state.flags.equipped)return [];
  return this.state.sensors.map(b=>({id:b.id,room:b.room,charge:b.charge,powered:b.powered,linked:this.sensorLinked(b),lastPulse:b.lastPulse,age:b.lastPulse<0?null:Math.max(0,this.state.stats.time-b.lastPulse),count:b.count}));
 }
 stepSensors(dt){
  if(!this.state.flags.equipped)return;
  // Battery time is mission time, including out-of-link rooms; packing/standby stops drain.
  for(const b of this.state.sensors){
   if(!b.room||!b.powered)continue;
   b.charge=Math.max(0,b.charge-dt);
   if(b.charge===0){b.powered=false;b.count=0;this.sensorSamples.delete(b.id);if(this.sensorLinked(b))this.emit('toast','Capteur '+b.id.slice(-1)+' : batterie épuisée.');}
  }
  this.sensorPlayerRoom=this.state.room;this.sensorScan+=dt;if(this.sensorScan<.25)return;this.sensorScan=0;
  for(const b of this.state.sensors){
   if(!b.room||!b.powered||!this.sensorLinked(b)){this.sensorSamples.delete(b.id);continue;}
   const rs=this.state.roomStates[b.room];if(!rs)continue;
   const previous=this.sensorSamples.get(b.id)||new Map(),next=new Map();let count=0;
   this.withRoom(b.room,()=>{
    // Only actual displacement between scans counts. Frozen offscreen actors cannot ping.
    const actors=rs.enemies.filter(e=>e.hp>0&&e.mode!=='captured').map(e=>({key:e.id,actor:e}));
    // withRoom is a geometry context only; the player remains in the real room.
    if(b.room===this.sensorPlayerRoom){
     actors.push({key:'decker',actor:this.p});
     if(this.chapter.number<17)actors.push({key:'manning',actor:this.state.companion});
     for(const a of this.state.rescue.actors)if(a.room===b.room&&a.status==='following')actors.push({key:a.id,actor:a});
    }
    for(const {key,actor:a}of actors){
     next.set(key,{x:a.x,z:this.zFor(a)});const old=previous.get(key);
     if(old&&this.distance(a,old)>1.5&&this.distance(a,b)<=650&&this.visible(b,a))count++;
    }
   });
   this.sensorSamples.set(b.id,next);
   if(count>0){
    const age=b.lastPulse<0?Infinity:this.state.stats.time-b.lastPulse;
    b.lastPulse=this.state.stats.time;b.count=count;
    if(age>2){this.state.stats.sensorSignals++;this.emit('sensor-signal','Capteur '+b.id.slice(-1)+' — mouvement dans '+R[b.room].name+'.',{sensor:b.id});}
   }
  }
 }
 migrateV5(s){
  if(!s||s.schema!==5)return s;
  s=copy(s);s.schema=6;s.version=D.meta.version;s.sensors=this.sensorDefaults();
  if(s.stats)Object.assign(s.stats,{sensorsPlaced:0,sensorsRecovered:0,sensorSignals:0});
  if(s.flags?.equipped&&Array.isArray(s.archives))for(const id of ['field-lockers','resource-transfer','storage-limits','service-loops','sensors','sensor-radio','sensor-power','tactical-wheel','controller','field-input'])if(!s.archives.includes('dossier-'+id))s.archives.push('dossier-'+id);
  return s;
 }
 validateSensors(s){
  if(!Array.isArray(s.sensors)||s.sensors.length!==3)return false;
  for(const k of ['sensorsPlaced','sensorsRecovered','sensorSignals'])if(!Number.isSafeInteger(s.stats[k])||s.stats[k]<0)return false;
  for(const [i,b]of s.sensors.entries()){
   if(!b||b.id!=='sensor-'+(i+1)||typeof b.powered!=='boolean'||!Number.isFinite(b.charge)||b.charge<0||b.charge>180||!Number.isFinite(b.lastPulse)||b.lastPulse< -1||b.lastPulse>s.stats.time+.001||!Number.isSafeInteger(b.count)||b.count<0||b.count>100)return false;
   if(!Number.isFinite(b.x)||!Number.isFinite(b.z)||b.z<0||b.z>1)return false;
   if(b.room===null){if(b.x!==0||b.z!==.55||b.powered||b.count!==0||b.lastPulse!==-1)return false;}
   else if(!s.flags.equipped||!R[b.room]||!s.roomStates[b.room]||!s.visited.includes(b.room)||b.x<30||b.x>R[b.room].width-30)return false;
   if(b.charge===0&&b.powered)return false;
   if(!s.flags.equipped&&(b.charge!==180||b.room!==null))return false;
  }
  return true;
 }
 validatePursuit(s){
  const p=s.pursuit,obj=v=>v&&typeof v==='object'&&!Array.isArray(v),defs=new Map(D.rooms.flatMap(r=>r.enemySpawns.map(e=>[e.id,{...e,origin:r.id}])));
  if(!obj(p)||!obj(p.transfers)||!Array.isArray(p.pending)||p.pending.length>6||!Array.isArray(p.journal)||p.journal.length>24)return false;
  for(const k of ['pursuitStarts','pursuitArrivals','pursuitLost'])if(!Number.isSafeInteger(s.stats[k])||s.stats[k]<0)return false;
  const reachable=(from,to)=>{const seen=new Set([from]),q=[from];for(const id of q){if(id===to)return true;for(const d of R[id].doors)if(d.pursuitAllowed&&!seen.has(d.to)){q.push(d.to);seen.add(d.to);}}return false;};
  for(const [id,to]of Object.entries(p.transfers)){const def=defs.get(id);if(!def||!['adult','facehugger'].includes(def.kind)||!R[to]||!s.roomStates[def.origin]||!s.roomStates[to]||!reachable(def.origin,to))return false;}
  const seen=new Set();
  for(const q of p.pending){
   if(!obj(q))return false;
   const def=defs.get(q.id),door=R[q.from]?.doors.find(d=>d.pair===q.pair&&d.to===q.to),e=(Array.isArray(s.roomStates[q.from]?.enemies)?s.roomStates[q.from].enemies:[]).find(e=>e.id===q.id);
   if(!obj(q)||!def||seen.has(q.id)||!['adult','facehugger'].includes(def.kind)||!door?.pursuitAllowed||!s.roomStates[q.to]||q.from===s.room||!e||e.hp<=0||e.mode==='captured'||(p.transfers[q.id]||def.origin)!==q.from||!['approach','threshold'].includes(q.phase)||typeof q.announced!=='boolean'||!Number.isFinite(q.age)||q.age<0||q.age>24.051||!Number.isFinite(q.remaining)||q.remaining<0||q.remaining>2.2)return false;
   seen.add(q.id);
  }
  for(const j of p.journal)if(!obj(j)||!R[j.room]||!Number.isFinite(j.time)||j.time<0||j.time>s.stats.time+.001||typeof j.text!=='string'||j.text.length>240||!['saved','pursuit-warning','pursuit-arrival','pursuit-lost','sensor-signal'].includes(j.type))return false;
  // Every displaced actor must exist exactly once; unloaded native rooms need no actors yet.
  for(const [id,to]of Object.entries(p.transfers))if((!Array.isArray(s.roomStates[to]?.enemies)||s.roomStates[to].enemies.filter(e=>e.id===id).length!==1))return false;
  return true;
 }

 lightsOff(){return !!this.room.lighting&&this.rs.lighting.on===false;}
 visionRange(){const raw=(this.p.crouch?145:300)+(this.p.lamp?65:0);return this.lightsOff()&&!this.p.lamp?Math.max(90,raw*.48):raw;}
 lightingStep(dt,n){
  const l=this.room.lighting,a=this.rs.lighting;
  if(!l||n?.id!==l.id||this.distance(this.p,l)>=92||!this.visible(this.p,l)||!this.state.flags.equipped||this.state.failed||this.state.finished||this.cooldowns.work>0||this.p.dodgeTime>0||this.lightingLatch===l.id)return false;
  const delta=clamp(Number.isFinite(dt)?dt:0,0,.05);if(!delta)return false;
  a.progress=Math.min(l.duration,a.progress+delta);this.p.noise=Math.max(this.p.noise,l.noise);
  this.activeWork={id:l.id,label:a.on?'Couper l’éclairage':'Rétablir l’éclairage',progress:a.progress/l.duration};
  if(a.progress<l.duration-1e-7)return false;
  a.on=!a.on;a.progress=0;this.lightingLatch=l.id;this.activeWork=null;this.state.stats.lightingCycles++;
  for(const id of ['dossier-worklights','dossier-darkness','dossier-egress'])this.addArchive(id);
  this.emit('saved',a.on?'Éclairage de travail rétabli.':'Éclairage coupé. Le balisage de secours reste actif.');return true;
 }
 formation(){return FORMATIONS[this.state.rescue.formation]||FORMATIONS.standard;}
 setFormation(id){
  if(!Object.hasOwn(FORMATIONS,id)||!this.state.rescue.active||this.state.failed||this.state.finished)return false;
  if(this.state.rescue.formation===id)return true;
  this.state.rescue.formation=id;for(const a of this.state.rescue.actors){a.path=[];a.pathTime=0;}
  this.state.stats.formationChanges++;for(const id of ['dossier-convoy-formations','dossier-convoy-noise','dossier-escort-console'])this.addArchive(id);
  this.emit('saved','Convoi : allure '+FORMATIONS[id].label.toLowerCase()+'.');return true;
 }
 migrateV6(s){
  if(s?.schema!==6)return s;
  s=copy(s);s.schema=7;s.version=D.meta.version;
  s.rescue.formation='standard';s.stats.lightingCycles=0;s.stats.formationChanges=0;
  for(const rs of Object.values(s.roomStates))rs.lighting={on:true,progress:0};return s;
 }
 validateField070(s){
  if(!Object.hasOwn(FORMATIONS,s.rescue?.formation))return false;
  if(!['lightingCycles','formationChanges'].every(k=>Number.isSafeInteger(s.stats[k])&&s.stats[k]>=0))return false;
  for(const [id,rs] of Object.entries(s.roomStates)){
   const a=rs?.lighting;if(!a||typeof a.on!=='boolean'||!Number.isFinite(a.progress)||a.progress<0||a.progress>=2)return false;
   if(!R[id]?.lighting&&(!a.on||a.progress!==0))return false;
  }return true;
 }

 // v0.8 — local, finite stores. Transfers conserve quantities; opening never grants loot.
 createLockerStates(r){return Object.fromEntries((r.lockers||[]).map(l=>[l.id,{opened:false,progress:0,contents:Object.fromEntries(Object.keys(STOCKS).map(k=>[k,l.contents[k]||0]))}]));}
 storageDef(id){return (this.room.lockers||[]).find(l=>l.id===id)||null;}
 storageAccess(id){
  const l=this.storageDef(id);
  return !!(l&&this.rs.lockers?.[id]?.opened&&this.state.flags.equipped&&!this.state.failed&&!this.state.finished&&this.p.dodgeTime===0&&this.distance(this.p,l)<92&&this.visible(this.p,l));
 }
 storageStep(dt,n){
  dt=Number.isFinite(dt)?clamp(dt,0,.05):0;
  const l=this.storageDef(n?.id);
  if(!l||!dt||!this.state.flags.equipped||this.state.failed||this.state.finished||this.cooldowns.work>0||this.p.dodgeTime>0||this.distance(this.p,l)>=92||!this.visible(this.p,l))return false;
  const a=this.rs.lockers[l.id];if(a.opened)return false;
  a.progress=Math.min(l.duration,a.progress+dt);this.activeWork={id:l.id,label:'Ouvrir — '+l.label,progress:a.progress/l.duration};this.p.noise=Math.max(this.p.noise,l.noise);
  if(a.progress>=l.duration-1e-7){a.opened=true;a.progress=l.duration;this.activeWork=null;this.state.stats.lockersOpened++;this.emit('saved',l.label+' : scellé ouvert. Les réserves restent sur place.');this.emit('storage',l.label,{id:l.id});return true;}return false;
 }
 storageTransfer(id,key,quantity,direction='take'){
  if(!this.storageAccess(id)||!Object.hasOwn(STOCKS,key)||!Number.isSafeInteger(quantity)||quantity<=0||quantity>9999||!['take','deposit'].includes(direction))return 0;
  const a=this.rs.lockers[id].contents,limit=STOCKS[key].cap;
  const amount=direction==='take'?Math.min(quantity,a[key],Math.max(0,limit-this.p[key])):Math.min(quantity,this.p[key],9999-a[key]);
  if(amount<=0)return 0;
  if(direction==='take'){a[key]-=amount;this.p[key]+=amount;}else{this.p[key]-=amount;a[key]+=amount;}
  this.state.stats.storageTransfers++;this.emit('saved',STOCKS[key].label+' : '+amount+(direction==='take'?' emporté(s).':' déposé(s).'));return amount;
 }
 storageTakeAll(id){let moved=0;for(const key of Object.keys(STOCKS))moved+=this.storageTransfer(id,key,9999,'take');return moved;}
 storageReports(){
  // Only rooms already entered: no hidden stock or remote transactions.
  return D.rooms.filter(r=>this.state.visited.includes(r.id)).flatMap(r=>(r.lockers||[]).map(l=>{const a=this.state.roomStates[r.id]?.lockers[l.id];return {id:l.id,room:r.id,label:l.label,opened:!!a?.opened,contents:a?.opened?copy(a.contents):null};}));
 }
 migrateV7(s){
  if(s?.schema!==7)return s;s=copy(s);s.schema=8;s.version=D.meta.version;
  s.stats.lockersOpened=0;s.stats.storageTransfers=0;
  for(const [id,rs]of Object.entries(s.roomStates||{}))if(R[id])rs.lockers=this.createLockerStates(R[id]);
  if(s.flags?.equipped&&Array.isArray(s.archives))for(const id of ['field-lockers','resource-transfer','storage-limits','service-loops'])if(!s.archives.includes('dossier-'+id))s.archives.push('dossier-'+id);
  return s;
 }
 validateStorage(s){
  if(!['lockersOpened','storageTransfers'].every(k=>Number.isSafeInteger(s.stats[k])&&s.stats[k]>=0))return false;
  let opened=0;
  for(const [id,rs]of Object.entries(s.roomStates)){
   const defs=R[id]?.lockers;if(!defs||!rs.lockers||typeof rs.lockers!=='object'||Array.isArray(rs.lockers)||Object.keys(rs.lockers).length!==defs.length)return false;
   for(const l of defs){const a=rs.lockers[l.id];
    if(!a||typeof a.opened!=='boolean'||!Number.isFinite(a.progress)||a.progress<0||a.progress>l.duration||a.opened&&a.progress!==l.duration||!a.opened&&a.progress>=l.duration)return false;
    if(!a.contents||typeof a.contents!=='object'||Array.isArray(a.contents)||Object.keys(a.contents).length!==Object.keys(STOCKS).length)return false;
    for(const k of Object.keys(STOCKS)){if(!Number.isSafeInteger(a.contents[k])||a.contents[k]<0||a.contents[k]>9999||!a.opened&&a.contents[k]!== (l.contents[k]||0))return false;}
    if(a.opened)opened++;
   }
  }return opened===s.stats.lockersOpened;
 }

 migrateArmory(s){
  if(!s||s.schema!==8||Object.hasOwn(s,'armory'))return s;
  s=copy(s);s.armory=armoryDefaults();return s;
 }
 castLine(id){return ({
  rand:'Le carottier est plus loin. On doit comprendre ce sable avant de déclarer le terrain sûr.',
  bronson:'La sonde accroche sous la couche noire. Ne vous placez pas dans l’axe du forage.',
  badejo:'Je relève la pression. Le passage reste libre autour de l’appareil.',
  harriman:'Votre relevé doit rester dans le dossier. Les décisions ne se prennent pas sur une impression.',
  medic:'Restez près de la couchette. La suite du transport n’est pas une sortie à pied.',
  rollins:'La compagnie attend un résultat exploitable. L’équipement n’est pas une invitation à détruire le spécimen.',
  adams:'Vérifiez votre arme ici. Au fond, un changement de cellule vous laissera exposé.',
  elway:'Le manifeste est clos. Gardez vos réserves pour la descente.',
  cho:'Les accès de service rejoignent le niveau de fouille. Signalez les voies condamnées.',
  cherbourg:'La cargaison est sous consigne. Restez au poste d’observation.'
 })[id]||'Restez avec le groupe.'; }
 validate(s){
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const finite=(v,keys)=>obj(v)&&keys.every(k=>Number.isFinite(v[k]));
  const coord=(p,w=4000)=>finite(p,['x','z'])&&p.x>=0&&p.x<=w&&p.z>=0&&p.z<=1;
  const path=p=>Array.isArray(p)&&p.length<=1500&&p.every(q=>coord(q));
  if(!obj(s)||s.schema!==8||s.campaign!==D.meta.id||!Object.hasOwn(R,s.room)||!Object.hasOwn(D.difficulties,s.difficulty)||!['CLASSIC','HYBRID'].includes(s.presentation))return false;
  if(s.waypoint!==null&&(!Object.hasOwn(R,s.waypoint)||!Array.isArray(s.visited)))return false;
  if(!obj(s.repair)||![null,'adams','elway'].includes(s.repair.actor)||!Number.isFinite(s.repair.progress)||s.repair.progress<0||s.repair.progress>3)return false;
  if(!Number.isInteger(s.objectiveIndex)||s.objectiveIndex<0||s.objectiveIndex>order.length)return false;
  if(!obj(s.flags)||!obj(s.optional)||!obj(s.inventory)||!obj(s.stats)||!obj(s.companion))return false;
  if(!Array.isArray(s.completed)||s.completed.length!==s.objectiveIndex||s.completed.some((id,i)=>id!==order[i]))return false;
  const done=new Set(s.completed.map(id=>O[id].flag));
  if(Object.entries(s.flags).some(([k,v])=>!done.has(k)||v!==true)||[...done].some(k=>s.flags[k]!==true))return false;
  const devices=new Set(D.rooms.flatMap(r=>r.devices||[]).map(d=>d.id));
  if(Object.entries(s.optional).some(([k,v])=>!devices.has(k)||v!==true))return false;
  const p=s.player;
  if(!coord(p,R[s.room].width)||!finite(p,['hp','ammo','reserve','foam','fuel','stamina','stress','filter','invulnerable','facing','noise','medkits','filters','decoys','reload']))return false;
  if(p.hp<0||p.hp>100||p.ammo<0||p.ammo>12||!Number.isInteger(p.ammo)||!Object.hasOwn(WEAPONS,p.weapon)||![-1,1].includes(p.facing))return false;
  for(const k of['stamina','stress','filter','noise'])if(p[k]<0||p[k]>100)return false;
  for(const k of['reserve','foam','fuel','medkits','filters','decoys','parts'])if(p[k]<0||p[k]>100000||!Number.isInteger(p[k]))return false;
  if(!finite(p,['dodgeTime','dodgeCooldown','dodgeX','dodgeZ'])||p.dodgeTime<0||p.dodgeTime>.261||p.dodgeCooldown<0||p.dodgeCooldown>1.351||Math.abs(p.dodgeX)>1||Math.abs(p.dodgeZ)>1)return false;
  if(p.invulnerable<0||p.invulnerable>10000||p.reload<0||p.reload>1.101||!['crouch','lamp','trackerOn','moving'].every(k=>typeof p[k]==='boolean'))return false;
  if(!['pistol','foam','flame','tracker'].every(k=>typeof s.inventory[k]==='boolean'))return false;
  const kit=s.armory;if(!obj(kit)||kit.revision!==1||typeof kit.claimed!=='boolean'||typeof kit.locked!=='boolean'||!Number.isFinite(kit.heat)||kit.heat<0||kit.heat>100)return false;
  for(const [k,max]of Object.entries({pulseAmmo:30,pulseReserve:60,plasmaAmmo:12,plasmaCells:2}))if(!Number.isInteger(kit[k])||kit[k]<0||kit[k]>max||!kit.claimed&&kit[k]!==0)return false;
  if(!kit.claimed&&(kit.heat!==0||kit.locked)||kit.locked&&kit.heat<=30)return false;
  if(['pulse','plasma'].includes(p.weapon)&&!kit.claimed||kit.claimed&&!s.flags.equipped)return false;
  if(!finite(s.stats,['time','shots','kills','archives','doors','empathySeconds','damage','deaths','operations','devices','medkitsUsed','filtersUsed','decoysUsed','escortMeters','dodges','repairs','hazardDamage'])||Object.values(s.stats).some(v=>!Number.isFinite(v)||v<0))return false;
  const a=s.companion;if(!coord(a,R[s.room].width)||!finite(a,['cooldown','pathTime'])||!path(a.path)||!['hold','follow'].includes(a.order)||!['return','free','hold'].includes(a.fireMode))return false;
  if(a.rally!==null&&(!coord(a.rally,R[s.room].width)||a.order!=='hold'))return false;
  if(!Array.isArray(s.insights)||new Set(s.insights).size!==s.insights.length||s.insights.some(id=>!D.rooms.some(r=>r.echoes.some(e=>e.id===id))||!s.archives.includes('dossier-'+id)))return false;
  if(!finite(s.stats,['shutterCycles','shutterBreaches','rallyOrders','readings'])||s.stats.readings!==s.insights.length)return false;
  if(typeof s.finished!=='boolean'||s.finished!==(s.objectiveIndex===order.length)||!(s.failed===null||typeof s.failed==='string'&&s.failed.length<500))return false;
  if(!Array.isArray(s.archives)||s.archives.some(id=>!D.codex.some(c=>c.id===id))||new Set(s.archives).size!==s.archives.length)return false;
  if(!Array.isArray(s.visited)||s.visited.some(id=>!Object.hasOwn(R,id))||new Set(s.visited).size!==s.visited.length||!s.visited.includes(s.room))return false;
  if(!obj(s.roomStates)||!s.roomStates[s.room])return false;
  if(!this.validatePursuit(s)||!this.validateSensors(s)||!this.validateField070(s)||!this.validateStorage(s))return false;
  for(const [id,rs]of Object.entries(s.roomStates)){
   if(!Object.hasOwn(R,id)||!obj(rs)||!obj(rs.work)||!obj(rs.devices)||typeof rs.kitClaimed!=='boolean'||typeof rs.supplyUsed!=='boolean'||!Array.isArray(rs.enemies)||!Array.isArray(rs.acid)||!Array.isArray(rs.corpses)||!Array.isArray(rs.weakpoints)||!Array.isArray(rs.noises))return false;
   if(!Number.isFinite(rs.localTime)||rs.localTime<0||!obj(rs.hazardHits)||Object.entries(rs.hazardHits).some(([k,v])=>!R[id].hazards.some(h=>['player','adams','elway'].some(a=>k===h.id+':'+a))||!Number.isFinite(v)||v<0||v>rs.localTime+.801))return false;
   const population=this.populationFor(s,id);if(rs.enemies.length!==population.length||new Set(rs.enemies.map(e=>e.id)).size!==rs.enemies.length)return false;
   if(!obj(rs.shutters)||Object.keys(rs.shutters).length!==R[id].shutters.length||!obj(rs.echoProgress))return false;
   for(const def of R[id].shutters){const a=rs.shutters[def.id];if(!finite(a,['integrity','progress'])||!['open','closed','broken'].includes(a.status)||a.integrity<0||a.integrity>100||(a.integrity===0)!==(a.status==='broken')||a.progress<0||a.progress>(a.status==='closed'?def.openDuration:def.closeDuration)||a.status==='broken'&&a.progress!==0)return false;}
   if(Object.entries(rs.echoProgress).some(([key,v])=>!R[id].echoes.some(e=>e.id===key)||!Number.isFinite(v)||v<0||v>3))return false;
   for(const [i,e]of rs.enemies.entries()){
    const def=population.find(a=>a.id===e.id);if(!def||!coord(e,R[id].width)||e.kind!==def.kind||!finite(e,['hp','foam','cooldown','memory','homeX','homeZ','pathTime','patrol','alert','searchTime','facing'])||e.hp<0||e.hp>maxHP(e)||e.foam<0||e.foam>1.2||!path(e.path)||!coord(e.lastKnown,R[id].width)||typeof e.moving!=='boolean')return false;
    if(!['patrol','hunt','investigate','search','stunned','captured','dead'].includes(e.mode)||!['player','noise','adams','elway'].includes(e.targetId)||![-1,1].includes(e.facing)||![-1,1].includes(e.patrol))return false;
    if(e.attack!==null&&(!coord(e.attack,R[id].width)||!finite(e.attack,['remaining','duration'])||e.attack.remaining<0||e.attack.remaining>e.attack.duration||e.attack.duration<=0||e.attack.duration>1.05||!['player','adams','elway'].includes(e.attack.victim)))return false;
    if(e.breach!==null&&(!obj(e.breach)||!R[id].shutters.some(s=>s.id===e.breach.gate)||!finite(e.breach,['remaining','duration'])||e.breach.remaining<0||e.breach.remaining>e.breach.duration||e.breach.duration!==.9))return false;
    if(e.mode==='captured'&&e.kind!=='captureAdult'||e.hp===0&&e.mode!=='dead')return false;
   }
   if(rs.weakpoints.length!==(id==='s33'?3:0)||rs.weakpoints.some(w=>!coord(w,R[id].width)||!Number.isFinite(w.hp)||w.hp<0||w.hp>24))return false;
   if(rs.acid.length>rs.enemies.length||rs.corpses.length>rs.enemies.length||rs.acid.some(a=>!coord(a,R[id].width)||!Number.isFinite(a.time)||a.time<0||a.time>7)||rs.corpses.some(a=>!coord(a,R[id].width)))return false;
   if(rs.noises.length>8||rs.noises.some(n=>!coord(n,R[id].width)||!finite(n,['time','amplitude'])||n.time<=0||n.time>7||n.amplitude<0||n.amplitude>100||!['shot','decoy'].includes(n.kind)))return false;
   const works=new Map([...R[id].interactables.filter(o=>o.operation).map(o=>[o.id,o.operation.duration]),...(R[id].devices||[]).map(d=>[d.id,d.duration])]);
   if(Object.entries(rs.work).some(([k,v])=>!works.has(k)||!Number.isFinite(v)||v<0||v>works.get(k)+.001))return false;
   if(Object.entries(rs.devices).some(([k,v])=>!R[id].devices.some(d=>d.id===k)||v!==true||s.optional[k]!==true))return false;
  }
  const re=s.rescue;
  if(!obj(re)||typeof re.active!=='boolean'||typeof re.aboard!=='boolean'||!['follow','hold'].includes(re.order)||!Array.isArray(re.actors)||re.actors.length!==2||re.active&&re.aboard)return false;
  for(const [i,a]of re.actors.entries()){
   if(!obj(a)||a.id!==['adams','elway'][i]||!Object.hasOwn(R,a.room)||!coord(a,R[a.room].width)||!Number.isFinite(a.integrity)||a.integrity<0||a.integrity>100||!Number.isFinite(a.pathTime)||!path(a.path)||!['waiting','ready','following','aboard'].includes(a.status))return false;
   if(re.active&&(a.status!=='following'||a.room!==s.room)||re.aboard&&a.status!=='aboard')return false;
  }
  if(!!s.flags.hosts_secured!==!!(re.active||re.aboard)||s.flags.live_capture&&!re.aboard)return false;
  return true;
 }
 importSave(raw){
  let d;try{if(typeof raw!=='string'||raw.length>2000000)throw Error();d=JSON.parse(raw,(k,v)=>{if(['__proto__','prototype','constructor'].includes(k))throw Error();return v;});}catch(e){throw Error('Sauvegarde illisible.');}
  if(d?.format!=='sos-save'||![1,2,3,4,5,6,7,8].includes(d.schema)||!d.state||!d.checkpoint)throw Error('Sauvegarde incompatible.');
  if(d.state.schema!==d.schema||d.checkpoint.schema!==d.schema)throw Error('Versions incohérentes dans la sauvegarde.');
  d.state=this.migrateArmory(d.state);d.checkpoint=this.migrateArmory(d.checkpoint);
  const state=this.migrateV7(this.migrateV6(this.migrateV5(this.migrateV4(this.migrateV3(this.migrateV2(d.schema===1?this.migrateLegacy(d.state):d.state)))))),checkpoint=this.migrateV7(this.migrateV6(this.migrateV5(this.migrateV4(this.migrateV3(this.migrateV2(d.schema===1?this.migrateLegacy(d.checkpoint):d.checkpoint))))));
  if(!Object.hasOwn(state,'armory'))state.armory=armoryDefaults();if(!Object.hasOwn(checkpoint,'armory'))checkpoint.armory=armoryDefaults();
  if(!this.validate(state)||!this.validate(checkpoint)||checkpoint.objectiveIndex>state.objectiveIndex)throw Error('La sauvegarde contient un état invalide.');
  this.state=copy(state);this.checkpoint=copy(checkpoint);this.ensureSafePosition(this.p);this.ensureSafePosition(this.state.companion);
  for(const actor of [...this.rs.enemies,...this.state.rescue.actors.filter(a=>a.room===this.state.room&&a.status==='following')]){this.ensureSafePosition(actor);actor.path=[];actor.pathTime=0;}
  this.state.companion.path=[];this.state.companion.pathTime=0;
  this.resetRuntime();this.time=this.state.stats.time;this.cooldowns.fire=.2;this.cooldowns.interaction=.4;this.emit('room',this.room.name);return true;
 }
}
const API={STOCKS,WEAPONS,Game,DATA:D,ROOMS:R,OBJECTIVES:O,objectiveOrder:order,FORMATIONS,clamp,crossed};
if(typeof module!=='undefined'&&module.exports)module.exports=API;root.SoSCore=API;
})(typeof globalThis!=='undefined'?globalThis:this);
