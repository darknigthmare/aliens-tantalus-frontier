'use strict';
/* Continuous simulation driver: calls ordinary step/input, interact, equipment and
   weapons. It never assigns a room, completion flag, resource or enemy HP.
   Uses the runtime's path planner as a navigation aid; not a human playthrough. */
const fs=require('node:fs'),path=require('node:path');
const C=require('../src/core.js');
function traverse(presentation='HYBRID',verbose=false,difficulty='exploration',options={}){
 const g=new C.Game({presentation,difficulty}),log=[],saves=[],dt=.05;let ticks=0;
 const fieldVisited=new Set();let tracingRetreat=false,evading=false,traceDone=false,sensorDepartedAt=null,sensorRemoteObserved=false;
 const say=s=>{log.push(s);if(verbose)console.log(s)};
 function tick(input={}){
  if(++ticks>200000)throw Error('Budget de simulation dépassé');
  if(g.state.failed)throw Error('Échec '+g.state.room+': '+g.state.failed);
  if(g.p.hp<56&&g.p.medkits)g.useMedkit();if(g.p.filter<15&&g.p.filters)g.replaceFilter();
  const enemy=g.rs.enemies.filter(e=>e.hp>0&&e.mode!=='captured'&&e.kind!=='captureAdult'&&g.distance(g.p,e)<710&&g.visible(g.p,e)).sort((a,b)=>g.distance(g.p,a)-g.distance(g.p,b))[0];
  if(!evading&&enemy&&!(enemy.kind==='queen'&&g.rs.weakpoints.some(w=>w.hp>0))){
   const weapon=g.state.inventory.flame&&g.distance(g.p,enemy)<360&&g.p.fuel>=2?'flame':'pistol';
   if(g.p.weapon!==weapon)g.setWeapon(weapon);
   if(weapon==='pistol'&&g.p.ammo===0)g.reload();else g.shoot(enemy);
  }
  // Protect still-unsecured patients with finite foam; no damage/resource injection.
  if(options.defensive&&g.state.rescue.active){const capture=g.rs.enemies.find(e=>e.kind==='captureAdult'&&e.hp>0&&e.foam<.98&&g.distance(g.p,e)<620&&g.visible(g.p,e));if(capture&&g.p.foam>=1){g.setWeapon('foam');g.shoot(capture);}}
  if(options.defensive&&!evading){
   const armed=g.rs.enemies.find(e=>e.hp>0&&e.kind!=='captureAdult'&&e.attack&&g.distance(g.p,e.attack)<(e.kind==='queen'?290:220));
   if(armed){const away=armed.x>g.p.x?{left:true}:{right:true};g.startDodge(away);input={...away,run:true};}
   else if(enemy&&enemy.kind!=='queen'&&g.distance(g.p,enemy)<230){input=enemy.x>g.p.x?{left:true}:{right:true};}
   // Acid is a finite, visible ground hazard. Do not stand in a corpse's pool.
   const moveSign=(input.right?1:0)-(input.left?1:0);
   const pool=g.rs.acid.find(a=>a.time>0&&Math.abs(g.p.x-a.x)<90&&(g.mode==='SIDE'||Math.abs(g.p.z-a.z)<.09));
   if(pool&&!armed){if(g.distance(g.p,pool)<42){const away=pool.x>g.p.x?{left:true}:{right:true};g.startDodge(away);input=away;}else if(moveSign&&Math.sign(pool.x-g.p.x)===moveSign||input.use||input.repair)input={};}
   // Wait at a visible hazardous crossing rather than walking through a warning.
   const sign=(input.right?1:0)-(input.left?1:0);
   const h=(g.room.hazards||[]).find(h=>sign&&Math.sign(h.x-g.p.x)===sign&&Math.abs(h.x-g.p.x)<h.w/2+190&&!g.inHazard(g.p,h,30)&&(g.mode==='SIDE'||Math.abs(g.p.z-h.z)<h.d/2+.05));
   if(h&&!armed){const phase=g.hazardStatus(h);if(phase.phase!=='stopped'&&(phase.phase!=='safe'||phase.remaining<(g.state.rescue.active?5.3:2.5)))input={};}
  }
  g.step(dt,input);const emitted=g.drainEvents();if(options.observeEvents)options.observeEvents(g,emitted);if(options.observe)options.observe(g);
  if(options.sensorTour&&sensorDepartedAt!==null&&!sensorRemoteObserved){const b=g.state.sensors.find(b=>b.room&&b.room!==g.room.id&&g.sensorLinked(b)&&b.lastPulse>sensorDepartedAt&&g.state.stats.time-b.lastPulse<.3);if(b){sensorRemoteObserved=true;if(options.featureSnapshot)options.featureSnapshot(g,'sensor-remote');}}

 }
 function wait(seconds){for(let i=0;i<Math.ceil(seconds/dt);i++)tick();}
 function walk(target,tolerance=24,limit=2600){
  let points=g.pathTo(g.p,target),lastDistance=Infinity,stuck=0;
  if(!points.length&&g.distance(g.p,target)>tolerance)throw Error(`Chemin absent ${g.state.room} -> ${JSON.stringify(target)}`);
  for(let n=0;n<limit;n++){
   if(g.distance(g.p,target)<=tolerance)return;
   while(points.length&&g.distance(g.p,points[0])<11)points.shift();
   if(!points.length)points=g.pathTo(g.p,target);
   const q=points[0];if(!q)throw Error('Chemin vidé '+g.state.room+' '+JSON.stringify({p:g.p,target,blocked:g.blocked(g.p.x,g.p.z)}));
   const x=q.x-g.p.x,z=(g.zFor(q)-g.p.z)*470;
   // Axis-steered keys reproduce walking. No direct movement/teleport assignment.
   const input={right:x>5,left:x< -5,down:z>5,up:z< -5};
   if(!Object.values(input).some(Boolean)){points.shift();continue;}
   if(tracingRetreat){const pursuer=g.rs.enemies.find(e=>e.hp>0&&e.mode==='hunt'&&g.visible(e,g.p));if(pursuer&&g.distance(pursuer,g.p)>270){tick();continue;}}
   tick(input);
   const d=g.distance(g.p,target);if(Math.abs(d-lastDistance)<.005)stuck++;else stuck=0;
   if(stuck>60){points=g.pathTo(g.p,target);stuck=0;}lastDistance=d;
  }
  throw Error(`Marche bloquée ${g.state.room} ${JSON.stringify({player:g.p,target,points})}`);
 }
 function interactTarget(t){walk(t,35);for(let i=0;i<8;i++)tick();return g.interact();}
 function route(target){
  for(let guard=0;g.state.room!==target&&guard<70;guard++){
   const queue=[[g.state.room,[]]],seen=new Set([g.state.room]);let chosen=null;
   while(queue.length){const [id,ds]=queue.shift();if(id===target){chosen=ds;break;}
    for(const d of C.ROOMS[id].doors)if(!seen.has(d.to)&&g.doorStatus(d,id,false).open){seen.add(d.to);queue.push([d.to,[...ds,d]]);}}
   if(!chosen?.length)throw Error(`Pas de route ${g.state.room} vers ${target} à ${g.current?.id}`);
   const door=chosen[0];walk(door,25);
   for(let i=0;g.state.rescue.active&&!g.convoyNear(door,420)&&i<1000;i++)tick();
   // Portals now use structural faces; wait for the actual companion, not an old path length.
   for(let i=0;g.state.flags.equipped&&g.chapter.number<17&&!g.doorStatus(door).open&&i<1000;i++)tick();
   for(let i=0;i<8;i++)tick();
   const before=g.state.room;g.interact();g.drainEvents();
   if(before===g.state.room)throw Error(`Seuil bloqué ${before} ${door.id} ${JSON.stringify(g.doorStatus(door))} nearby ${g.nearby()?.id}`);
   if(!g.validate(g.state))throw Error('État invalide à la porte '+g.state.room);
   if(options.fullTour&&g.room.supply&&!g.rs.supplyUsed){walk({x:320,z:.55},20);wait(.4);if(g.nearby()?.action==='supply')g.interact();}
   if(options.fieldFeatures)fieldServices();
   if(options.storageTour)serviceLockers();
  }
  if(g.state.room!==target)throw Error('Route cyclique');
 }
 function operation(n){walk(n,25);
  if(g.state.rescue.active){for(let i=0;i<1200&&!g.convoyNear(n,n.kind==='embark'?400:460);i++)tick();}
  const before=n.action==='device'?!!g.state.optional[n.id]:g.state.objectiveIndex;
  for(let i=0;i<400;i++){if(g.distance(g.p,n)>60)walk(n,25);tick({use:true,focus:n.type==='sense'});if(n.action==='device'?g.state.optional[n.id]:g.state.objectiveIndex!==before)return;}
  throw Error(`Travail bloqué ${n.id} in ${g.state.room} ${g.workCondition(n)} ${JSON.stringify(g.rs.work)}`);
 }
 function visitDevice(room,id){route(room);const n=g.room.devices.find(d=>d.id===id);if(!n)throw Error('Missing device '+id);if(!g.state.optional[id])operation({...n,action:'device'});}

 function fieldServices(){
  if(options.pursuitTour&&!traceDone&&g.room.id==='s21'){
   traceDone=true;evading=true;
   while(g.state.companion.fireMode!=='hold')g.cycleCompanionFire();
   const d=g.room.doors.find(d=>d.to==='s43');
   walk({x:1860,z:.55},22);wait(.4);
   let sensor=null;tracingRetreat=true;
   if(options.sensorTour){walk({x:d.x+(d.portal.mount==='left'?320:-320),z:.55},22);wait(.4);if(!g.sensorAction())throw Error('Pose de capteur refusée sur la retraite.');sensor=g.state.sensors.find(b=>b.room===g.room.id);if(options.featureSnapshot)options.featureSnapshot(g,'sensor-deployed');}
   walk(d,20);tracingRetreat=false;
   let guard=0;
   while(guard++<200&&!g.rs.enemies.some(e=>e.hp>0&&e.mode==='hunt'&&g.visible(e,g.p)&&g.distance(e.lastKnown,g.p)<240))tick();
   wait(.4);
   if(options.featureSnapshot)options.featureSnapshot(g,'trace-before');
   const before=g.state.stats.pursuitStarts;
   if(!g.interact()||g.room.id!=='s43'||g.state.stats.pursuitStarts<=before)throw Error('La retraite n’a pas déclenché de poursuite réelle.');
   g.drainEvents();sensorDepartedAt=g.state.stats.time;if(options.featureSnapshot)options.featureSnapshot(g,'trace-departure');
   const retreatEntry=g.room.doors.find(q=>q.to==='s21');
   walk({x:retreatEntry.x+(retreatEntry.portal.mount==='left'?395:-395),z:.55},20);
   let captured=false;
   for(let n=0;n<450&&g.state.stats.pursuitArrivals===0;n++){
    tick();if(!captured&&g.pursuitSignals().length&&options.featureSnapshot){options.featureSnapshot(g,'trace-warning');captured=true;}
   }
   if(g.state.stats.pursuitArrivals===0)throw Error('Le poursuivant n’a pas franchi le seuil.');
   if(options.featureSnapshot)options.featureSnapshot(g,'trace-arrived');
   evading=false;while(g.state.companion.fireMode!=='return')g.cycleCompanionFire();
   for(let n=0;n<300&&g.rs.enemies.some(e=>e.hp>0);n++)tick();
   if(g.rs.enemies.some(e=>e.hp>0))throw Error('Le belvédère n’est pas sécurisé.');
   if(options.featureSnapshot)options.featureSnapshot(g,'trace-secured');
   if(options.sensorTour){
    if(!sensor||!sensorRemoteObserved||sensor.lastPulse<=sensorDepartedAt||!g.sensorLinked(sensor))throw Error('Le capteur ne remonte aucun mouvement réel.');
    if(!g.toggleSensor(sensor.id))throw Error('Arrêt radio refusé.');const charge=sensor.charge;wait(.65);if(sensor.charge!==charge)throw Error('Une veille coupée consomme encore.');
    if(options.featureSnapshot)options.featureSnapshot(g,'sensor-standby');
    if(!g.toggleSensor(sensor.id))throw Error('Reprise radio refusée.');
   }
   route('s21');
   if(options.sensorTour){walk(sensor,40);wait(.15);const before=sensor.charge;if(!g.sensorAction())throw Error('Récupération sur place refusée.');if(sensor.room!==null||sensor.charge!==before)throw Error('La récupération modifie la charge.');if(options.featureSnapshot)options.featureSnapshot(g,'sensor-recovered');}

  }

  if(options.lightingTour&&g.room.lighting&&(g.room.id!=='s37'||g.state.flags.live_capture)&&!fieldVisited.has(g.room.lighting.id)){
   const l=g.room.lighting;fieldVisited.add(l.id);walk(l,20);wait(.15);
   const lamp=g.p.lamp;
   if(options.featureSnapshot)options.featureSnapshot(g,'light-on-'+g.room.id);
   for(let i=0;i<160&&g.rs.lighting.on;i++)tick({use:true});
   if(g.rs.lighting.on)throw Error('Éclairage non coupé '+g.room.id);
   if(g.p.lamp)g.toggleLamp();tick();
   if(options.featureSnapshot)options.featureSnapshot(g,'light-off-'+g.room.id);
   const target=[80,-80,120,-120].map(dx=>({x:l.x+dx,z:.55})).find(p=>g.pathTo(g.p,p).length&&g.pathTo(p,l).length);
   if(!target)throw Error('Aucun déplacement de contrôle dans le noir '+g.room.id);
   walk(target,15);wait(.3);walk(l,20);tick();
   for(let i=0;i<160&&!g.rs.lighting.on;i++)tick({use:true});
   if(!g.rs.lighting.on)throw Error('Éclairage non rétabli '+g.room.id);
   tick();if(lamp&&!g.p.lamp)g.toggleLamp();
  }
  // Ordinary commands only: a navigation aid controls keys; no state injection.
  for(const s of g.room.shutters||[]){
   if(fieldVisited.has(s.id))continue;fieldVisited.add(s.id);
   const panels=g.shutterControls(s),n=panels.sort((a,b)=>g.distance(g.p,a)-g.distance(g.p,b))[0];
   walk(n,20);g.commandCompanion({x:n.x+(n.x<s.x?-105:105),z:.55});wait(1.5);
   let guard=0;
   while(g.rs.shutters[s.id].status==='open'&&guard++<400){if(g.distance(g.p,n)>55)walk(n,20);tick({shutter:true});}
   if(g.rs.shutters[s.id].status==='open')throw Error('Fermeture impossible '+s.id+' '+g.shutterCondition(s));
   if(options.featureSnapshot)options.featureSnapshot(g,'closed-'+s.id);
   tick();
   guard=0;while(g.rs.shutters[s.id].status==='closed'&&guard++<300){if(g.distance(g.p,n)>55)walk(n,20);tick({shutter:true});}
   if(g.rs.shutters[s.id].status==='closed')throw Error('Réouverture impossible '+s.id);
   tick();g.toggleCompanion();
  }
  for(const e of g.room.echoes||[]){
   if(g.state.insights.includes(e.id))continue;walk(e,35);
   let guard=0;while(!g.state.insights.includes(e.id)&&guard++<600){
    if(g.distance(g.p,e)>e.radius-25)walk(e,35);tick({focus:true});
    if(options.featureSnapshot&&(g.rs.echoProgress[e.id]||0)>1.2&&(g.rs.echoProgress[e.id]||0)<1.35)options.featureSnapshot(g,'reading-'+e.id);
   }
   if(!g.state.insights.includes(e.id))throw Error('Lecture impossible '+e.id);
   if(options.featureSnapshot)options.featureSnapshot(g,'read-'+e.id);
  }
 }

 function serviceLockers(){
  if(!options.storageTour||!g.state.flags.equipped)return;
  for(const l of g.room.lockers||[]){
   if(fieldVisited.has(l.id))continue;fieldVisited.add(l.id);
   walk(l,20);wait(.2);
   if(options.featureSnapshot)options.featureSnapshot(g,'sealed-'+l.id);
   for(let i=0;i<650&&!g.rs.lockers[l.id].opened;i++){if(g.distance(g.p,l)>60)walk(l,20);tick({use:true});}
   if(!g.rs.lockers[l.id].opened)throw Error('Casier non ouvert '+l.id);
   if(options.featureSnapshot)options.featureSnapshot(g,'opened-'+l.id);
   const first=Object.keys(C.STOCKS).find(k=>g.p[k]>0);
   if(first){const before=g.p[first]+g.rs.lockers[l.id].contents[first];if(g.storageTransfer(l.id,first,1,'deposit')!==1)throw Error('Dépôt local refusé');g.storageTransfer(l.id,first,1,'take');if(g.p[first]+g.rs.lockers[l.id].contents[first]!==before)throw Error('Transfert non conservatif');}
   g.storageTakeAll(l.id);g.drainEvents();
   if(!g.validate(g.state))throw Error('État casier invalide '+l.id);
   if(options.featureSnapshot)options.featureSnapshot(g,'stored-'+l.id);
  }
 }
 function serviceConvoy(){
  if(!g.state.rescue.active||!g.p.parts)return;
  const damaged=g.state.rescue.actors.filter(a=>a.integrity<99);
  if(!damaged.length)return;
  if(g.state.rescue.order!=='hold')g.toggleConvoy();
  for(const a of damaged){walk(a,45);const before=a.integrity;for(let n=0;n<250&&a.integrity===before&&g.p.parts;n++)tick({repair:true});}
  if(g.state.rescue.order!=='follow')g.toggleConvoy();
 }
 const tours={8:[['s41','device-filters']],11:[['s17','parts-workshop'],['s42','device-pumps']],12:[['s19','isolate-hull']],14:[['s43','device-survey']],16:[['s25','isolate-bridge']],20:[['s44','device-vent']],21:[['s31','isolate-stairs']],26:[['s34','parts-rescue'],['s45','device-medical']],27:[['s36','isolate-ravine']],28:[['s46','device-guidance']]};
 for(let idx=0;idx<C.objectiveOrder.length;idx++){
  const o=g.current;
  if(options.fullTour)for(const [room,id]of tours[idx]||[])visitDevice(room,id);
  if(options.armoryTour&&idx===7){route('s09');walk(g.room.armoryRack,25);wait(.2);if(!g.claimArmory())throw Error('Dotation commune non récupérée');g.setWeapon('pulse');g.shoot({x:g.p.x-200,z:g.p.z});wait(.2);g.setWeapon('plasma');g.shoot({x:g.p.x-250,z:g.p.z});wait(.65);if(options.featureSnapshot)options.featureSnapshot(g,'armory-earned');g.setWeapon('pistol');}
  if(options.storageTour&&idx===11){route('s47');route('s48');}
  if(options.storageTour&&idx===26){route('s49');route('s50');}
  route(o.room);
  if(g.room.supply&&!g.rs.supplyUsed){const n={x:320,z:.55};walk(n,20);wait(.4);if(g.nearby()?.action==='supply')g.interact();}
  if(o.type==='boss'){
   for(const w of g.rs.weakpoints){walk({x:w.x-235,z:g.zFor(w)},28);for(let i=0;i<100&&w.hp>0;i++){g.setWeapon('flame');g.shoot(w);tick();}if(w.hp>0)throw Error('Attache non brûlée');}
   const queen=g.rs.enemies.find(e=>e.kind==='queen');walk({x:queen.x-280,z:g.zFor(queen)},25);for(let i=0;i<600&&queen.hp>0;i++)tick();if(queen.hp>0)throw Error('Reine non vaincue');
  }
  if(o.type==='capture'){
   const embark={...g.room.devices.find(d=>d.kind==='embark'),action:'device'};operation(embark);
   walk({x:o.x+42,z:g.zFor(o)},25);
   const adult=g.rs.enemies.find(e=>e.kind==='captureAdult');
   for(let i=0;i<1400&&g.distance(adult,o)>180;i++)tick({focus:true});
   for(let i=0;i<150&&adult.foam<.96;i++){g.setWeapon('foam');g.shoot(adult);tick();}
  }
  if(o.operation)operation({...o,action:'objective'});
  else{walk(o,28);if(o.type==='sense')for(let i=0;i<12;i++)tick({focus:true});wait(.4);if(o.type==='sense')for(let i=0;i<10;i++)tick({focus:true});g.interact();g.drainEvents();}
  if(g.state.objectiveIndex!==idx+1)throw Error(`Objectif non validé ${o.id} ${o.type} nearby ${JSON.stringify(g.nearby())}`);
  if(options.lightingTour&&g.state.rescue.active){
   const formation=idx===25?'quiet':idx===26?'compact':idx===27?'standard':null;
   if(formation){if(!g.setFormation(formation))throw Error('Allure refusée '+formation);if(options.featureSnapshot)options.featureSnapshot(g,'convoy-'+formation);}
  }
  if(options.lightingTour&&idx===29)fieldServices(); // Soute: secure the patients/specimen before optional blackout.
  if(options.fullTour)serviceConvoy();
  if(!g.validate(g.state))throw Error('État invalide après '+o.id);
  const save=g.exportSave(),restored=new C.Game();restored.importSave(save);saves.push(save);if(options.resumeEach)g.importSave(save);
  say(`${presentation} ${idx+1}/33 ${o.id} ${o.flag} · ${Math.round(g.p.hp)} PV · ${Math.round(g.state.stats.time)}s`);
 }
 return {presentation,difficulty,sensorRemoteObserved:options.sensorTour?sensorRemoteObserved:undefined,passed:g.state.finished,objectives:g.state.completed.length,ticks,simulationSeconds:g.state.stats.time,rooms:g.state.visited,stats:g.state.stats,convoy:g.state.rescue,log,saves};
}
module.exports={traverse};
if(require.main===module){
 const outcomes=[],snapshots=[],taken=new Set();const root=path.resolve(__dirname,'..');
 const dir=path.join(root,'qa/tactical-rerun-fixtures');fs.mkdirSync(dir,{recursive:true});
 function observe(g){
  const keys=[];
  if(['s18','s25','s42','s44'].includes(g.state.room))for(const h of g.room.hazards){const st=g.hazardStatus(h);if(st.phase==='warning'&&Math.abs(g.p.x-h.x)<420)keys.push(g.state.room+'-warning');if(st.phase==='stopped'&&Math.abs(g.p.x-h.x)<450)keys.push(g.state.room+'-isolated');}
  if(g.rs.enemies.some(e=>e.attack&&e.hp>0&&g.distance(e,g.p)<400))keys.push('attack-'+g.state.room);
  if(g.p.dodgeTime>.1)keys.push('dodge');
  if(g.activeWork?.id.startsWith('repair-'))keys.push('repair');
  if(g.state.rescue.active&&g.state.room==='s35'&&g.convoyNear(g.p,410))keys.push('convoy');
  if(['s22','s27','s32'].includes(g.state.room)&&g.p.x>1000&&g.p.x<1600)keys.push('layout-'+g.state.room);
  for(const key of keys)if(!taken.has(key)&&g.validate(g.state)){taken.add(key);fs.writeFileSync(path.join(dir,key+'.json'),g.exportSave());snapshots.push({key,room:g.state.room,time:g.state.stats.time,objectiveIndex:g.state.objectiveIndex,source:'continuous engine run; no placement, damage or progress injection'});}
 }
 for(const mode of ['HYBRID','CLASSIC'])for(const difficulty of ['exploration','survival','oppression']){
  const label=mode+'-'+difficulty;
  try{const r=traverse(mode,false,difficulty,{fullTour:true,defensive:true,resumeEach:true,observe:mode==='HYBRID'&&difficulty==='survival'?observe:null});
   for(let i=0;i<r.saves.length;i++)fs.writeFileSync(path.join(dir,label+'-'+String(i+1).padStart(2,'0')+'.json'),r.saves[i]);
   const out={...r,saves:undefined,fullTour:true,resumeEach:true,outcome:'finished'};outcomes.push(out);console.log(label,'FINISHED',r.rooms.length+' rooms',r.stats.dodges+' dodges',r.stats.repairs+' repairs',r.stats.damage+' damage');
  }catch(e){console.error(label,e.message);outcomes.push({presentation:mode,difficulty,outcome:'stopped',reason:e.message,fullTour:true,resumeEach:true});}
 }
 fs.writeFileSync(path.join(root,'reports/tactical-traversals.json'),JSON.stringify({scope:'Automated input with navigation planner, all annexes, defensive dodge and reload after each objective. No forced room, HP, ammunition or progress.',outcomes,snapshots},null,2));
}
