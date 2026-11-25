'use strict';
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),D=require('../src/river-of-pain/data.js'),C=require('../src/river-of-pain/core.js');
// The pilot only uses movement, interactions and equipment. No teleport, task completion or invulnerability API.
function runCampaign(mode='hybrid',difficulty='story',withDetours=false,withLife=false,withDefense=false,withDucts=false,withMobility=false,withFidelity=false){
 const sim=new C.Simulation(C.createState(difficulty,mode)),trace=[],detourTrace=[],processed=new Set(),timing={ticks:0,inputs:0};let previous='',quietWalking=false;const lifeDone=new Set(),lifeTrace=[],defenseTrace=[];let defenseDone=false,ductDone=false;const ductTrace=[];let mobilityDone=false;const mobilityTrace=[];const fidelityTrace=[];let fidelityEarly=false,fidelityWreck=false;
 const step=(input={},n=1)=>{for(let i=0;i<n;i++){sim.update(.05,input);sim.drain();timing.ticks++;if(Object.keys(input).length)timing.inputs++;if(sim.s.status==='dead')throw Error('Mort pendant '+sim.chapter.title+' / '+sim.objective?.id+' @ '+sim.s.room);}};
 function aid(){const p=sim.s.player;if(p.hp<75&&p.medkits)sim.heal();if(p.ammo===0&&p.reserve)sim.reload();if(sim.s.escort){if(sim.s.escort.hp<70&&p.medkits>1)sim.healEscort();if(sim.s.escort.panic>65&&p.stamina>20)sim.commandEscort('rally');}const enemies=sim.ensureRoom().enemies.filter(e=>e.hp>0&&C.dist(e,p)<370);if(enemies.length&&p.flares&&!sim.ensureRoom().flares.some(f=>C.dist(f,p)<400))sim.flare();}
 function walk(target){target={x:target.x,z:mode==='classic'?.7:target.z};let stalled=0,prev=Infinity;
  for(let tick=0;tick<3500;tick++){
   aid();let distance=C.dist(sim.s.player,target);if(distance<12)return;
   if(sim.s.status!=='playing')return;
   let wp=C.localPath(sim.collisionRoom,sim.s.player,target,mode)[0]||target;
   const p=sim.s.player,dx=wp.x-p.x,dz=(wp.z-p.z)*600,l=Math.hypot(dx,dz)||1;
   const enemy=sim.ensureRoom().enemies.find(e=>e.hp>0&&Math.abs(e.z-p.z)<.09&&(e.x-p.x)*p.facing>0&&Math.abs(e.x-p.x)<470);
   step({x:dx/l,z:dz/l,fire:!!enemy,sprint:!quietWalking&&!sim.s.escort&&p.stamina>12,crouch:sim.character.child&&distance<260});
   if(Math.abs(prev-distance)<.1)stalled++;else stalled=0;prev=distance;
   if(stalled>120)throw Error('Coincé dans '+sim.s.room+' vers '+JSON.stringify(target)+' / pos '+JSON.stringify(p));
  }throw Error('Délai de marche '+sim.s.room+' '+JSON.stringify(target));
 }
 function useTarget(target,type){walk(target);const before={room:sim.s.room,obj:sim.s.objective,escort:!!sim.s.escort};for(let i=0;i<160;i++){aid();if(sim.s.room!==before.room||sim.s.objective!==before.obj||!!sim.s.escort!==before.escort||sim.s.status!=='playing')return;if(!sim.s.work){sim.interact();sim.drain();if(sim.board){const id=sim.board,b=D.boards[id],st=sim.s.systems.boards[id]||{switches:b.initial};for(let k=0;k<b.channels.length;k++)if(st.switches[k]!==b.channels[k][2])sim.boardToggle(id,k);if(!sim.boardSubmit(id))throw Error('Tableau non validé '+id);sim.drain();}}step({},1);}
  throw Error('Interaction sans effet '+type+' '+target.id+' candidates '+sim.candidates().map(x=>x.label));
 }
 function travel(room){for(let safety=0;sim.s.room!==room&&safety<90;safety++){const route=C.route(sim.s.room,room,sim.s.character,sim.s.flags);if(route.length<2)throw Error('Route de détour absente '+room);useTarget(sim.room.portals.find(p=>p.to===route[1]),'passage de détour');}if(sim.s.room!==room)throw Error('Voyage de détour interrompu');}
 function detour(j){const primary=sim.s.objective,before=sim.s.elapsed;sim.trackJob(j.id);
  for(let n=0;n<3;n++){const target=j.steps[n];travel(target.room);walk(target);for(let t=0;t<180&&(sim.s.exploration.jobs[j.id]??0)===n;t++){aid();if(!sim.s.work){sim.interact();sim.drain();}step({},1);}if(sim.s.exploration.jobs[j.id]!==n+1)throw Error('Détour bloqué '+j.id+' '+n+' / '+sim.candidates().map(x=>x.id));}
  if(sim.s.objective!==primary)throw Error('Un détour a changé la progression principale');
  const portal=sim.room.portals.find(p=>p.requires===j.flag),from=sim.s.room;useTarget(portal,'nouveau raccourci');useTarget(sim.room.portals.find(p=>p.to===from),'retour de raccourci');
  detourTrace.push({id:j.id,completed:true,steps:3,unlockedBothWays:true,seconds:Math.round(sim.s.elapsed-before),room:sim.s.room,health:sim.s.player.hp});
 }
 function lifeTour(child=false){
  const L=require('../src/river-of-pain/life.js');quietWalking=true;const before=sim.s.elapsed,primary=sim.s.objective;
  if(!child)for(const d of D.life.residents){travel(d.room);let talked=false;
   for(let k=0;k<12&&!talked;k++){const b=L.visibleResidents(sim).find(v=>v.def.id===d.id).body;walk(b);step({},65);
    if(sim.candidates().some(c=>c.type==='resident'&&c.ref.id===d.id)){sim.talkNearby();step({},19);talked=!!sim.s.life.contacts[d.id];}
    else {walk({x:b.x-75,z:b.z});step({},25);if(sim.candidates().some(c=>c.type==='resident')){sim.talkNearby();step({},19);talked=!!sim.s.life.contacts[d.id];}}
   }
   if(!talked)throw Error('Résident inaccessible au pilote '+d.id+' / '+sim.candidates().map(v=>v.label));
   for(const t of d.topics)if(!sim.readResident(d.id,t.id))throw Error('Thème non accessible '+d.id);
  }
  for(const d of D.life.containers.filter(d=>child?d.room.startsWith('vent'):!d.room.startsWith('vent'))){travel(d.room);walk(d);step({},10);
   if(sim.candidates()[0]?.type!=='container')throw Error('E intercepté devant '+d.id);
   sim.interact();sim.drain();if(!sim.searchContainer(d.id,'quiet'))throw Error('Fouille refusée '+d.id);step({},66);
   if(!L.containerState(sim.s,d).open)throw Error('Fouille interrompue '+d.id);
   for(const k of Object.keys(d.items))sim.takeSupply(d.id,k);
  }
  if(!child)for(const b of D.life.benches){travel(b.room);walk(b);step({},5);
   if(sim.s.life.pockets[sim.s.character].decoy>=2){sim.deployDecoy();step({},310);}
   if(!sim.craftAt(b.id,'decoy'))throw Error('Assemblage refusé '+b.id);
   step({},50);if(sim.s.work)throw Error('Assemblage non achevé');
   if(!sim.deployDecoy())throw Error('Balise non déposée');step({},310);
  }
  if(sim.s.objective!==primary)throw Error('Vie coloniale a modifié objectif principal');
  lifeTrace.push({child,seconds:Math.round(sim.s.elapsed-before),contacts:Object.keys(sim.s.life.contacts).length,topics:Object.values(sim.s.life.contacts).reduce((n,v)=>n+v.topics.length,0),opened:sim.s.life.stats.opened,crafted:sim.s.life.stats.crafted,deployed:sim.s.life.stats.deployed});quietWalking=false;
 }
 function defenseTour(){
  const F=require('../src/river-of-pain/defense.js'),primary=sim.s.objective;quietWalking=true;
  for(const d of D.defense.shutters.filter(d=>d.room!=="hangar")){travel(d.room);const before=sim.s.elapsed;
   for(const side of [0,1]){walk(d.controls[side]);step({},5);if(!sim.useDefense(d.id,'close'))throw Error('Fermeture refusée '+d.id+' '+side+' '+F.reason(sim,d.id,'close'));step({},54);if(sim.s.defense.shutters[d.id].state!=='closed')throw Error('Fermeture annulée '+d.id);
    if(!sim.useDefense(d.id,'open'))throw Error('Réouverture refusée '+d.id);step({},34);if(sim.s.defense.shutters[d.id].state!=='open')throw Error('Réouverture interrompue');walk(d.controls[1-side]);
   }
   defenseTrace.push({id:d.id,closed:2,reopened:2,walkedAcrossBothWays:true,seconds:Math.round(sim.s.elapsed-before)});
  }
  for(const d of D.defense.alarms){travel(d.room);walk(d);step({},5);if(!sim.useDefense(d.id,'alarm'))throw Error('Avertisseur refusé '+d.id);step({},25);if(sim.s.defense.alarms[d.id].uses!==1)throw Error('Signal non engagé');walk({x:d.x+150,z:d.z});step({},300);if(sim.s.defense.alarms[d.id].remaining)throw Error('Signal non expiré');defenseTrace.push({id:d.id,uses:1,expired:true});}
  if(sim.s.objective!==primary)throw Error('Dispositifs ont changé la mission principale');quietWalking=false;
 }
 function ductTour(){
  const V=require('../src/river-of-pain/ducts.js'),primary=sim.s.objective;quietWalking=true;
  for(const d of D.ducts.mouths){travel(d.room);walk(d);step({},8);
   if(!sim.useDuct(d.id,'close'))throw Error('Grille inaccessible '+d.id+' '+V.reason(sim,d.id,'close'));
   step({},42);if(sim.s.ducts.mouths[d.id].state!=='closed')throw Error('Verrouillage interrompu '+d.id);
   if(!sim.useDuct(d.id,'open'))throw Error('Ouverture refusée '+d.id);step({},26);
   if(sim.s.ducts.mouths[d.id].state!=='open')throw Error('Grille toujours fermée '+d.id);
   step({},20);if(!sim.useDuct(d.id,'listen'))throw Error('Écoute refusée '+d.id);step({},36);
   if(!sim.s.ducts.reports.some(r=>r.id===d.id))throw Error('Relevé absent '+d.id);
   ductTrace.push({id:d.id,closed:true,opened:true,listened:true,room:sim.s.room});
  }
  if(sim.s.objective!==primary)throw Error('Les gaines ont changé la mission principale');quietWalking=false;
 }
 function mobilityTour(){
  const M=require('../src/river-of-pain/mobility.js'),before=sim.s.objective;
  function drive(x){for(let j=0;j<1600;j++){const v=sim.s.mobility.rover,d=x-v.x,stopping=v.speed*v.speed/(2*M.R.braking)+10;
    if(Math.abs(d)<24&&Math.abs(v.speed)<15){step({brake:true},12);return;}
    const braking=Math.abs(d)<stopping||v.speed*d<0;
    step(braking?{brake:true}:{x:Math.sign(d)});
   }throw Error('Pilotage bloqué '+sim.s.room+' vers '+x+' / '+sim.s.mobility.rover.x);}
  function action(a,id=null){if(!sim.useRover(a,id))throw Error('Manœuvre rover refusée '+a+' '+M.reason(sim,a,id));for(let i=0;i<120&&sim.s.work;i++)step({});if(sim.s.work)throw Error('Manœuvre interminable '+a);}
  travel('road');let v=sim.s.mobility.rover;walk({x:v.x-197,z:v.z});action('board');
  drive(3480);if(!sim.crossRover('plateau'))throw Error('Première traversée refusée');drive(2300);action('turn');drive(260);
  if(!sim.crossRover('road'))throw Error('Retour refusé');drive(900);action('exit');walk(D.mobility.stations[0]);action('charge','service-road');
  v=sim.s.mobility.rover;walk({x:v.x-197,z:mode==='classic'?.7:v.z});action('board');action('turn');drive(3480);if(!sim.crossRover('plateau'))throw Error('Second aller refusé');drive(930);action('exit');
  if(sim.s.objective!==before)throw Error('La conduite a validé un objectif à distance');
  mobilityTrace.push({rover:JSON.parse(JSON.stringify(sim.s.mobility)),method:'Walk to chassis, board, drive with acceleration/brakes, 3 real gate crossings, U-turns, dismount, walk to station, finite charge; no state injection.'});
 }

 function fidelityTour(wreck=false){
  const before=sim.s.objective,seen=[];
  const visit=room=>{travel(room);seen.push(room);};
  const observe=id=>{const o=sim.room.objects.find(o=>o.id===id);walk(o);sim.interact();sim.drain();step({},3);if(o.kind==='archive'&&!sim.s.archives.includes(id))throw Error('Observation non conservée '+id);};
  if(!wreck){
   visit('armory');walk(D.armory.rack);if(!sim.useArmory('issue'))throw Error('Dotation inaccessible');step({},43);
   if(!sim.s.armory.kits.brackett.issued)throw Error('Dotation interrompue');
   if(!sim.useArmory('flame'))throw Error('M240 non équipable');step({},10);sim.fire();step({},20);sim.useArmory('pulse');step({},10);
   observe('a31');visit('briefing');visit('armory');visit('ops');visit('armory');
   visit('greenhouse');observe('greenhouse-inspection');visit('wash');visit('greenhouse');visit('recreation');visit('greenhouse');
  }else{
   visit('derelict_gallery');observe('a32');visit('pilot_chamber');observe('a33');visit('egg_vault');observe('a34');
   visit('pilot_chamber');visit('derelict_gallery');visit('derelict');
  }
  if(sim.s.objective!==before)throw Error('L’exploration a changé l’objectif principal');
  fidelityTrace.push({stage:wreck?'épave':'colonie',rooms:seen,archives:[...sim.s.archives],method:'Physical walking, real E thresholds and observed points; no warp or main-task grant.'});
 }

 for(let safety=0;safety<800;safety++){
  if(sim.s.status==='complete')break;
  if(sim.s.status==='chapterDone'){trace.push({chapter:sim.s.chapter+1,title:sim.chapter.title,time:Math.round(sim.s.elapsed),health:sim.s.player.hp,shots:sim.s.stats.shots,escorts:sim.s.stats.escorts});sim.nextChapter();sim.drain();continue;}
  if(withDetours&&!processed.has(sim.s.chapter)){processed.add(sim.s.chapter);if(sim.s.chapter===0||sim.s.chapter===6)for(const j of D.jobs.filter(j=>sim.s.chapter===0?!j.childOnly:j.childOnly))detour(j);}
  if(withLife&&!lifeDone.has(sim.s.chapter)){lifeDone.add(sim.s.chapter);if(sim.s.chapter===0||sim.s.chapter===6)lifeTour(sim.s.chapter===6);}
  if(withDefense&&!defenseDone&&sim.s.chapter===0){defenseTour();defenseDone=true;}
  if(withDucts&&!ductDone&&sim.s.chapter===0){ductTour();ductDone=true;}
  if(withMobility&&!mobilityDone&&sim.s.chapter===3&&sim.s.objective===2){mobilityTour();mobilityDone=true;}
  if(withFidelity&&!fidelityEarly&&sim.s.chapter===0){fidelityTour(false);fidelityEarly=true;}
  if(withFidelity&&!fidelityWreck&&sim.s.chapter===3&&sim.s.objective===3){fidelityTour(true);fidelityWreck=true;}
  const key=sim.s.chapter+':'+sim.s.objective+':'+sim.s.room+':'+!!sim.s.escort;
  if(previous===key)throw Error('Boucle sans progression '+key);previous=key;
  const objective=sim.objective,targetRoom=sim.s.escort?.goal||objective.room;
  if(sim.s.room!==targetRoom){const route=C.route(sim.s.room,targetRoom,sim.s.character,sim.s.flags);if(route.length<2)throw Error('Route absente '+key+' '+targetRoom);const portal=sim.room.portals.find(p=>p.to===route[1]);useTarget(portal,'passage');}
  else if(sim.s.escort){for(let i=0;i<300&&sim.s.escort;i++){aid();step({},1);}if(sim.s.escort)throw Error('Escorte bloquée à destination');}
  else {const object=sim.room.objects.find(o=>o.id===objective.id);useTarget(object,'objectif');}
 }
 if(sim.s.status!=='complete')throw Error('Campagne inachevée : '+sim.s.status);
 trace.push({chapter:16,title:sim.chapter.title,time:Math.round(sim.s.elapsed),health:sim.s.player.hp});
 return {mode,difficulty,passed:true,status:sim.s.status,chapters:trace,detours:detourTrace,life:lifeTrace,defense:defenseTrace,ducts:ductTrace,mobility:mobilityTrace,fidelity:fidelityTrace,stats:sim.s.stats,visited:sim.s.visited.length,elapsedSeconds:sim.s.elapsed,...timing,method:'Sim.update movement + interact + equipment + three physical switch controls and boardSubmit; no teleport/completeTask call/health mutation',state:sim.s};
}
if(require.main===module){const results=[];for(const difficulty of ['story','standard','nightmare'])for(const mode of ['hybrid','classic']){try{const r=runCampaign(mode,difficulty);console.log(mode,difficulty,'PASS',r.elapsedSeconds,r.stats);const {state,...report}=r;results.push(report);}catch(e){console.error(mode,'FAIL',e.stack);results.push({mode,passed:false,error:e.message});}}
 fs.writeFileSync(path.join(ROOT,'docs','TRAVERSAL_RESULTS.json'),JSON.stringify(results,null,2));if(results.some(x=>!x.passed))process.exitCode=1;}
module.exports={runCampaign};
