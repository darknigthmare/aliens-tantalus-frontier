/** Real engine traversal. Uses ordinary input, interactions, puzzle clues and finite supplies.
 * No teleport, unlock injection, invulnerability, enemy removal or health injection.
 * Room and state inspection guide a deterministic test bot; this is not a human/browser playthrough.
 */
import fs from 'node:fs';
import { EARTH_DATA } from '../src/alien-earth-data.js';
import {createHash} from 'node:crypto';
import { EarthEngine,findPath,near,blocked,ROOM_BY_ID } from '../src/alien-earth-core.js';
const fidelity=process.argv.includes('--fidelity');
const security=process.argv.includes('--security');
const investigations=process.argv.includes('--investigations');
const ducts=process.argv.includes('--ducts')||investigations||security||fidelity;
const containment=process.argv.includes('--containment'),sensors=process.argv.includes('--sensors');
let quietContainment=false;
const mainOnly=process.argv.includes('--main-only'),services=process.argv.includes('--services');
let e=new EarthEngine();
e.state.difficulty=process.argv.includes('--normal')?'normal':'story';
const report={bundleSha256:createHash('sha256').update(fs.readFileSync(new URL('../JOUER_ALIEN_EARTH_V11.html',import.meta.url))).digest('hex'),mode:'Engine bot, AI active, '+e.state.difficulty+(services?', service operations included':'')+(mainOnly?', mandatory route only':', full exploration'),noInvulnerability:true,noObjectiveInjection:true,noRoomTeleport:true,rooms:[],restores:0,steps:0,deaths:0,minimumHp:120,portalsUsed:[],gatesOpened:[],errors:[]};
let movingTo=null;
function tick(input={},dt=.04){
 if(e.player.hp<e.character.health*.6)e.useCare();
 if(!quietContainment&&e.enemies.some(n=>n.kind!=='eye_caged'&&Math.abs(n.x-e.player.x)<155&&Math.abs(n.z-e.player.z)<40))e.tool();
 const target=!quietContainment&&e.character.weapon!=='none'&&e.enemies.find(n=>n.kind!=='eye_caged'&&n.stun<.4&&Math.abs(n.x-e.player.x)<650&&Math.abs(n.z-e.player.z)<24);
 if(target&&!e.hold&&!e.serviceAction&&(target.x-e.player.x)*e.player.facing<0)e.update(.001,{...input,x:Math.sign(target.x-e.player.x)});
 if(target){if(e.player.ammo<=0)e.reload();else e.fire();}
 e.update(dt,input);report.steps++;report.minimumHp=Math.min(report.minimumHp,e.player.hp);
 if(e.dead){report.deaths++;throw Error('Bot mort '+e.room.id+' vers '+JSON.stringify(movingTo));}
 e.drain();
}
function walk(target,allowGate=true,solo=false){
 movingTo={x:target.x,z:target.z,id:target.id};
 let route=findPath(e.room,e.player,target);
 if(!route.length&&allowGate&&e.state.gates[e.room.gate?.id]){
  const control=e.room.interactables.filter(i=>i.kind==='gate').find(i=>findPath(e.room,e.player,i).length);
  if(!control)throw Error('Commande inaccessible '+e.room.id);
  walk(control,false);const r=e.interact();e.drain();
  if(!r||e.state.gates[e.room.gate.id])throw Error('Cloison toujours fermée '+e.room.id);
  report.gatesOpened.push(e.room.id);route=findPath(e.room,e.player,target);
 }
 if(!route.length)throw Error('Aucun trajet '+e.room.id+' vers '+JSON.stringify(target));
 for(const point of [...route,{x:target.x,z:target.z}]){
  let guard=0;
  while(Math.abs(e.player.x-point.x)>.6||Math.abs(e.player.z-point.z)>.6){
   if(!solo){
    const down=Object.values(e.state.survivors).find(f=>f.room===e.room.id&&f.status==='down');
    if(down){walk(down,true,true);const selected=e.nearestInteraction();if(selected?.id!==down.id)throw Error('Blessé masqué '+down.id);e.interact();e.drain();if(down.status==='down')throw Error('Plus de kit pour '+down.id);return walk(target,allowGate,false);}
    const f=Object.values(e.state.survivors).find(f=>f.room===e.room.id&&f.status==='follow');
    if(f&&!near(f,e.player,135,52)){tick();if(++guard>1500)throw Error('Regroupement sur trajet bloqué '+f.id);continue;}
    if(f&&f.stress>65&&f.steadyTime<=0&&near(f,e.player,140,60)){
     for(let n=0;n<70&&f.stress>35&&f.status!=='down';n++)tick({calm:true});
    }
   }
   const dx=point.x-e.player.x,dz=point.z-e.player.z,speed=e.character.speed*1.43;
   if(Math.abs(dx)>.6)tick({x:Math.sign(dx),sprint:true},Math.min(.04,Math.abs(dx)/speed));
   else tick({z:Math.sign(dz),sprint:true},Math.min(.04,Math.abs(dz)/(speed*.48)));
   if(++guard>1000)throw Error('Trajet bloqué '+e.room.id+' '+JSON.stringify(point));
  }
 }
}
function interactAt(target){
 walk(target);const selected=e.nearestInteraction();
 if(selected?.id!==target.id)throw Error('Interaction masquée '+target.id+' par '+selected?.id+' dans '+e.room.id);
 const r=e.interact();e.drain();return r;
}
function regroup(){
 const followers=()=>Object.values(e.state.survivors).filter(s=>s.room===e.room.id&&s.status==='follow');
 for(let i=0;i<750&&followers().some(s=>!near(s,e.player,150,60));i++)tick();
 if(followers().some(s=>!near(s,e.player,150,60)))throw Error('Escorte bloquée '+e.room.id+' '+JSON.stringify(followers()));
 for(const s of Object.values(e.state.survivors).filter(s=>s.room===e.room.id&&s.status==='down')){
  const departure={x:e.player.x,z:e.player.z};interactAt({...s});
  if(s.status==='down')throw Error('Pas de kit pour '+s.id);
  walk(departure);regroup();
 }
}
function takeDoor(door){
 const from=e.room.id;walk(door);regroup();
 // A follower stops behind the player, so the door itself remains the nearest interaction.
 const selected=e.nearestInteraction();if(selected?.id!==door.id)throw Error('Porte masquée '+door.id+' par '+selected?.id);
 if(door.hatchKey&&!e.hatchOpen(door)){
  for(let retry=0;retry<15&&!e.hatchOpen(door);retry++){
   if(!e.interact())throw Error('Grille refusée '+door.id);e.drain();
   for(let i=0;i<160&&e.serviceAction;i++)tick({interact:true});
  }
  if(!e.hatchOpen(door))throw Error('Déboulonnage interrompu trop souvent '+door.id);
 }
 if(!e.interact())throw Error('Porte refusée '+door.id);e.drain();
 if(e.room.id===from)throw Error('Pas de franchissement '+door.id);
 report.portalsUsed.push({from,to:e.room.id,id:door.id,shortcut:!!door.shortcut});
}
function navigate(id){
 if(e.room.id===id)return;
 const q=[[e.room.id,[]]],seen=new Set([e.room.id]);let steps=null;
 for(let n=0;n<q.length;n++){
  const [rid,route]=q[n];if(rid===id){steps=route;break;}
  for(const door of ROOM_BY_ID[rid].portals.filter(p=>p.kind==='door'&&!p.hatchKey&&(!p.requires||p.requires.every(g=>e.state.completed.includes(g))))){
   if(!seen.has(door.to)){seen.add(door.to);q.push([door.to,[...route,door.id]]);}
  }
 }
 if(!steps)throw Error('Destination déconnectée '+id);
 for(const did of steps){const door=e.room.portals.find(p=>p.id===did);if(!door)throw Error('Route perdue '+did);takeDoor(door);}
}
function clearRoom(){
 const r=e.room;
 if(services||sensors)for(const i of r.interactables.filter(i=>i.kind==='scrap'))if(!e.state.salvaged.includes(i.id)&&e.state.parts+i.parts<=24)interactAt(i);
 for(const i of r.interactables.filter(i=>i.kind==='valve'||i.kind==='supply')){
  if(i.kind==='valve'&&e.state.valves.includes(i.vent)||e.state.looted.includes(i.id))continue;
  interactAt(i);
 }
 if(!e.state.archives.includes(r.archive.id))interactAt(r.archive);
 if(!e.state.completed.includes(r.task.id)){
  interactAt(r.task);
  if(r.task.kind==='talk')e.resolveDialog(0);
  else if(['rescue','field'].includes(r.task.kind)){
   for(let n=0;n<800&&!e.state.completed.includes(r.task.id);n++){if(!e.hold)e.interact();tick({interact:true});}
  }else e.resolvePuzzle(r.task.kind==='scan'?r.task.sequence:r.task.pattern);
  e.drain();if(!e.state.completed.includes(r.task.id))throw Error('Action inachevée '+r.id);
  report.rooms.push({id:r.id,task:r.task.id,optional:!!r.optional,hp:e.player.hp,time:e.state.playSeconds});
 }
}
function specimenRoute(){
 const pad=e.localPads()[0];if(!pad||e.room.id!=='R36')return;
 const original=e.enemies.find(n=>n.id==='EN-36');if(!original)throw Error('Spécimen attendu hors de sa pièce');
 const before=e.state.containment.stats.captures;walk(pad);
 for(let retry=0;retry<12&&e.podState(pad.id).status!=='armed';retry++){
  if(!e.pending)e.interact();e.drain();if(!e.queueContainment('arm','crawler'))throw Error('Armement refusé');
  for(let n=0;n<70&&e.serviceAction;n++)tick({interact:true});
 }
 if(e.podState(pad.id).status!=='armed')throw Error('Armement interrompu trop souvent');
 quietContainment=true;walk({x:400,z:125});
 for(let n=0;n<1050&&e.podState(pad.id).status==='armed';n++)tick({crouch:true});
 quietContainment=false;
 if(e.state.containment.stats.captures!==before+1)throw Error('Aucune capture naturelle avant épuisement');
 walk(pad);e.interact();e.drain();if(!e.queueContainment('study'))throw Error('Étude refusée');
 for(let n=0;n<100&&e.serviceAction;n++)tick({interact:true});
 if(!e.state.containment.records['EN-36']?.studied)throw Error('Étude inachevée');
 report.containmentRoute={room:e.room.id,id:'EN-36',pad:pad.id,captured:true,studied:true,time:e.time};
 // Rebuild through the public snapshot constructor, preserving the same captive identity.
 e=new EarthEngine(e.snapshot());report.restores++;
 if(e.enemies.some(n=>n.id==='EN-36')||e.podState(pad.id).sample!=='EN-36')throw Error('Reprise du captif incohérente');
}
function fieldService(rid,kind,action,value){
 navigate(rid);const target=e.room.interactables.find(i=>i.kind===kind);walk(target);
 const before=e.state.serviceStats[action==='switch'?'switches':action==='craft'?'crafts':'captures'];
 for(let retry=0;retry<12;retry++){
  if(!e.pending)e.interact();e.drain();
  if(!e.queueService(action,value))throw Error('Préparation service refusée '+rid+' '+action+' '+value);
  e.drain();
  for(let n=0;n<180&&e.serviceAction;n++)tick({interact:true});
  if(e.state.serviceStats[action==='switch'?'switches':action==='craft'?'crafts':'captures']>before)return;
  for(let n=0;n<30;n++)tick();
 }
 throw Error('Service interrompu trop souvent '+rid+' '+action);
}

function investigationRoute(){
 const d=EARTH_DATA.investigations.find(d=>d.chapter===e.chapter.id),ci=e.state.chapter;
 const channel=ci%2?'local':'network';
 if(!d.proofs.every(p=>e.state.archives.includes(p)))throw Error('Sources manquantes pour '+d.id);
 if(channel==='network'&&!e.channelOn('surveillance'))fieldService(e.network.cabinetRoom,'powercab','switch','watch');
 navigate(d.room);const station=e.room.interactables.find(i=>i.id===d.station);walk(station);
 for(let retry=0;retry<20&&!e.state.investigations.decisions[d.id];retry++){
  if(e.character.id==='wendy'&&e.enemies.some(n=>n.kind==='xeno_neverland'&&Math.abs(n.x-e.player.x)<600))e.resonate();
  e.cancelInteraction();if(!e.interact())throw Error('Terminal non disponible '+d.id);e.drain();
  if(!e.openInvestigationAtTerminal(d.id))throw Error('Enquête refusée '+d.id);e.drain();
  if(!e.queueInvestigation(d.id,d.proofs,channel))throw Error('Recoupement refusé '+d.id);e.drain();
  for(let n=0;n<200&&e.serviceAction;n++)tick({interact:true});
  if(!e.state.investigations.decisions[d.id])for(let n=0;n<30;n++)tick();
 }
 if(!e.state.investigations.decisions[d.id])throw Error('Enquête trop souvent interrompue '+d.id);
 e=new EarthEngine(e.snapshot());report.restores++;
 if(e.state.investigations.decisions[d.id].channel!==channel)throw Error('Décision perdue à la reprise');
}

function sensorServices(){
 const net=e.network;navigate(net.benchRoom);
 let position=null;
 // Geometric inspection plans the route, then ordinary input performs every displacement.
 for(const z of e.room.mode==='SIDE'?[125]:[125,50,200]){
  for(let x=80;x<e.room.width-80;x+=10){
   // Placement uses the same predicate without moving the live actor.
   const shadow=Object.create(e);shadow.state={...e.state,player:{...e.player,x,z,facing:1}};
   const candidate=shadow.sensorPlacement();
   if(candidate.ok&&!blocked(e.room,x,z,24,14)&&findPath(e.room,e.player,{x,z}).length){position={x,z};break;}
  }if(position)break;
 }
 if(!position)throw Error('Aucune pose accessible '+e.room.id);
 walk(position);if(e.player.facing!==1)tick({x:1},.01);
 let placed=null;
 for(let retry=0;retry<15&&!placed;retry++){
  if(!e.startSensorDeploy('interact'))throw Error('Pose refusée '+e.room.id);
  for(let i=0;i<160&&e.serviceAction;i++)tick({interact:true});
  placed=e.localSensors()[0];if(!placed)for(let i=0;i<25;i++)tick();
 }
 if(!placed)throw Error('Pose trop souvent interrompue');
 const id=placed.id;
 if(!e.queueSensorPulse(id))throw Error('Commande radio refusée');tick();
 walk({x:placed.x,z:placed.z});
 // Retain a deployed unit through actual engine save/load, with no positional injection.
 e=new EarthEngine(e.snapshot());report.restores++;
 for(let retry=0;retry<15&&e.sensorUnit(id).status==='deployed';retry++){
  const d=e.sensorUnit(id);walk(d);if(!e.queueSensorRecover(id))throw Error('Récupération refusée');
  for(let i=0;i<160&&e.serviceAction;i++)tick({interact:true});
 }
 if(e.sensorUnit(id).status!=='carried')throw Error('Sonde non récupérée');
 const station=e.room.interactables.find(i=>i.kind==='workbench');walk(station);
 for(let retry=0;retry<15&&e.sensorUnit(id).battery<180;retry++){
  if(!e.pending&&e.character.id==='wendy'&&e.enemies.some(a=>a.kind==='xeno_neverland'&&Math.abs(a.x-e.player.x)<600))e.resonate();
  if(!e.pending)e.interact();e.drain();
  if(!e.queueSensorRecharge(id))throw Error('Reconditionnement refusé '+e.room.id+' pièces '+e.state.parts);
  for(let i=0;i<180&&e.serviceAction;i++)tick({interact:true});
  if(e.sensorUnit(id).battery<180)for(let i=0;i<25;i++)tick();
 }
 if(e.sensorUnit(id).battery!==180)throw Error('Sonde non reconditionnée');
}
function securityRoute(){
 const d=EARTH_DATA.securityStations.find(d=>d.chapter===e.chapter.id),n=e.network;
 fieldService(n.cabinetRoom,'powercab','switch','watch');
 navigate(d.room);walk(d.control);
 report.securityActions||=[];
 for(const kind of ['test','isolate']){
  let complete=false;
  for(let tries=0;tries<20&&!complete;tries++){
   if(e.securityUnit(d.id).integrity<=0)throw Error('Sentinelle détruite pendant le parcours '+d.id);
   if(kind==='test'){for(let i=0;i<350&&e.securityMode(d.id)!=='scan';i++)tick();}
   walk(d.control);e.cancelInteraction();e.interact();e.drain();
   if(!e.openSecurity(d.id))throw Error('Commande de sentinelle inaccessible '+d.id);e.drain();
   const before=e.securityUnit(d.id).alarms;
   if(!e.queueSecurity(d.id,kind)){e.cancelInteraction();for(let i=0;i<15;i++)tick();continue;}
   for(let i=0;i<150&&e.serviceAction;i++)tick({interact:true});
   complete=kind==='test'?e.securityUnit(d.id).alarms>before:e.securityUnit(d.id).isolated;
  }
  if(!complete)throw Error('Opération sentinelle interrompue trop souvent '+d.id+' '+kind);
  report.securityActions.push({id:d.id,kind,time:e.state.playSeconds,integrity:e.securityUnit(d.id).integrity,alarms:e.securityUnit(d.id).alarms});
 }
 e=new EarthEngine(e.snapshot());report.restores++;
}
try{
 for(let ci=0;ci<8;ci++){
  e=new EarthEngine(e.snapshot());report.restores++;const chapter=e.chapter;
  for(const id of chapter.rooms){
   navigate(id);clearRoom();
   for(const annex of (mainOnly?[]:chapter.annexes).filter(a=>ROOM_BY_ID[id].portals.some(p=>p.to===a))){
    if(e.state.completed.includes(ROOM_BY_ID[annex].task.id))continue;
    navigate(annex);clearRoom();if(containment&&annex==='R36')specimenRoute();
    const shortcut=e.room.portals.find(p=>p.shortcut);if(shortcut)takeDoor(shortcut);
   }
  }
  const rescue=Object.values(e.state.survivors).find(s=>ROOM_BY_ID[s.room].chapter===chapter.id&&!['rescued','left'].includes(s.status));
  if(rescue){
   if(rescue.room!==e.room.id){navigate(rescue.room);walk(rescue);if(rescue.status!=='follow')interactAt(rescue);}
   const def=e.survivorDef(rescue.id);navigate(def.evac);walk({x:def.evacX,z:def.evacZ});
   for(let i=0;i<650&&rescue.status!=='rescued';i++){
    if(rescue.status==='down'){walk(rescue,true,true);e.interact();e.drain();if(rescue.status==='down')throw Error('Soins épuisés à l’évacuation');walk({x:def.evacX,z:def.evacZ});}
    tick({calm:true});
   }
   if(rescue.status!=='rescued')throw Error('Évacuation inachevée '+rescue.id+' '+JSON.stringify(rescue));
  }
  if(ducts){
   const rid=chapter.ducts[0],room=ROOM_BY_ID[rid];
   navigate(room.duct.hosts[0]);
   takeDoor(e.room.portals.find(p=>p.to===rid));
   clearRoom();
   e=new EarthEngine(e.snapshot());report.restores++;
   takeDoor(e.room.portals.find(p=>p.to===room.duct.hosts[1]));
  }
  if(fidelity)for(const rid of chapter.extensions||[]){navigate(rid);clearRoom();}
  if(sensors)sensorServices();
  if(services){
   const net=e.network;
   fieldService(net.cabinetRoom,'powercab','switch',ci%2?'watch':'dark');
   // Finite beacons are actually thrown before crafting; no inventory injection.
   navigate(net.benchRoom);
   for(let n=0;n<2&&e.state.parts>=2;n++){
    if(e.state.inventory.decoys>=9){if(!e.throwDecoy())throw Error('Impossible de libérer une place de balise');for(let t=0;t<190;t++)tick();}
    fieldService(net.benchRoom,'workbench','craft','decoy');
   }
   for(const cam of net.cameraIds)fieldService(net.monitorRoom,'cameraConsole','capture',cam);
  }
  if(investigations)investigationRoute();
  if(security)securityRoute();
  navigate(chapter.rooms[3]);const exit=e.room.portals.find(p=>p.kind==='chapter');walk(exit);regroup();
  e.interact();if(!e.advanceChapter())throw Error('Transfert impossible '+ci);e.drain();
 }
 if(!e.state.finished||e.state.completed.length!==(mainOnly?32:fidelity?70:ducts?56:48)||e.state.archives.length!==(mainOnly?32:fidelity?70:ducts?56:48)||e.state.visited.length!==(mainOnly?32:fidelity?70:ducts?56:48)||e.state.stats.rescues!==(mainOnly?0:4))throw Error('Bilan incomplet');
 if(investigations&&Object.keys(e.state.investigations.decisions).length!==8)throw Error("Huit enquêtes attendues");
 if(security&&!Object.values(e.state.security.units).every(u=>u.isolated&&u.alarms>=1))throw Error("Sentinelles inachevées");
 report.security=e.state.security;report.securityRoute=security;report.fieldReport=e.fieldReport();report.investigationRoute=investigations;
 report.success=true;
}catch(error){report.success=false;report.errors.push(error.message);report.debug={player:e.player,hold:e.hold,fieldWork:e.state.fieldWork,pending:e.pending,nearest:e.nearestInteraction(),enemies:e.enemies.map(v=>({id:v.id,kind:v.kind,x:v.x,z:v.z,mode:v.mode,stun:v.stun})),survivors:e.state.survivors};process.exitCode=1;}
report.ducts=e.state.ducts;report.ductRoute=ducts;report.sensors=e.state.sensors;report.sensorRoute=sensors;report.containment=e.state.containment;report.objectives=e.state.completed.length;report.archives=e.state.archives.length;report.visited=e.state.visited.length;report.rescues=e.state.stats.rescues;report.finalHp=e.player.hp;report.inventory=e.state.inventory;report.serviceStats=e.state.serviceStats;report.parts=e.state.parts;report.salvaged=e.state.salvaged;report.circuits=e.state.circuits;report.cameraFrames=Object.keys(e.state.cameraFrames);report.stats=e.state.stats;report.simulatedSeconds=Math.round(e.state.playSeconds);report.finalRoom=e.state.room;
const out=new URL('../docs/QA_CAMPAIGN_V11'+(fidelity?'_FIDELITY':security?'_SECURITY':investigations?'_INVESTIGATIONS':ducts?'_DUCTS':'')+(sensors?'_SENSORS':'')+(containment?'_CONTAINMENT':'')+(services?'_SERVICES':'')+(mainOnly?'_MAIN':'')+(e.state.difficulty==='normal'?'_NORMAL':'')+'.json',import.meta.url);
fs.writeFileSync(out,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
