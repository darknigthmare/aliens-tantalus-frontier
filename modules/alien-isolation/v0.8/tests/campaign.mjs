import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
import {IsolationEngine,ROOMS,route,doors,pathTo,distance,walkable,safePosition} from '../src/engine.js';
import {CONTENT} from '../src/content.js';
export function traverse({active=true,difficulty='recit',classic=false,seed=20141007,log=false,explore=false,rescue=false,projects=false,scanner='off',spatialExplore=false}={}){
 const e=new IsolationEngine(difficulty,seed);e.s.classic=classic;e.s.crouched=true;
 // Routing checks keep the physical containment actor alive; damage and ordinary enemies are disabled.
 if(!active){e.damage=()=>{};e.updateEnemies=()=>{};}
 const snapshots=[],transcript=[],visitedTargets=[],capturedProtocols=new Set(),capturedRooms=new Set();let steps=0,eventCursor=0;
 function tick(input={}){if(++steps>300000)throw Error('Budget simulation dépassé');
  if(active){
   const s=e.s,a=s.alien;
   if(s.health<65){if(!s.inventory.medkit)e.craft('medkit');if(s.inventory.medkit)e.heal();}
   if(a.active&&a.room===s.room&&!['vent','retreat'].includes(a.mode)&&distance(a,s)<310&&s.tools.flame&&Math.abs(a.y-s.y)<90){s.face=Math.sign(a.x-s.x)||1;e.flame();}
   for(const en of s.enemies)if(en.hp>0&&en.min<=s.chapter&&en.room===s.room&&distance(en,s)<65){if(en.kind==='joe'&&s.inventory.emp&&en.stun<=0){s.face=Math.sign(en.x-s.x)||1;e.deploy('emp');}else if(s.tools.flame&&en.kind==='facehugger'){s.face=Math.sign(en.x-s.x)||1;e.flame();}}
  }
  const s=e.s,a=s.alien,near=active&&a.active&&a.room===s.room&&!['vent','retreat'].includes(a.mode);
  if(near&&!s.tools.flame&&distance(a,s)<230&&!s.hidden){
   const door=doors(s.room).filter(d=>d.kind==='door'&&distance(s,d.point)<88).sort((x,y)=>distance(s,x.point)-distance(s,y.point))[0];
   if(door&&!e.sealed(door.id)&&s.inventory.battery&&a.lastRoom===door.destination)e.sealNearest();
   // Escape a close trailing pursuer before replanning a path; never snap backwards to a grid cell.
   if(distance(a,s)<135&&Math.sign(a.x-s.x)!==Math.sign(input.x||s.face)){
    input={...input,x:Math.sign(s.x-a.x),y:ROOMS[s.room].view==='SIDE'?0:(s.y<250?-1:1),run:true,crouch:false};
   }else input={...input,crouch:a.mode!=='chase',run:a.mode==='chase'};
  }else input={...input,crouch:true};
  if(scanner!=='off'&&s.tools.tracker){
   if(scanner==='silent'&&!s.signals.silent)e.signals.toggleSilent();
   input={...input,tracker:s.signals.charge>0&&!input.swapBattery};
  }
  e.step(.05,input);
  for(const event of e.events.slice(eventCursor))if(['containment-start','containment-verified','anesidora-overload','coolant-stabilized','anesidora-escaped','scanner-ping','scanner-reload'].includes(event.type)&&!capturedProtocols.has(event.type)){
   capturedProtocols.add(event.type);snapshots.push({goal:e.s.goal,protocol:event.type,description:event.type,save:e.serialize()});
  }eventCursor=e.events.length;
  if(['g_observation','g_plenum','g_hull','n_coolant','n_service','m_records','m_isolation','e_lockers','e_catwalk'].includes(e.s.room)&&!capturedRooms.has(e.s.room)){
   capturedRooms.add(e.s.room);snapshots.push({goal:e.s.goal,roomVisit:e.s.room,description:ROOMS[e.s.room].name+' / seuil atteint',save:e.serialize()});
  }
  if(e.s.dead){if(log)console.log('DEATH DETAIL',JSON.stringify({x:e.s.x,y:e.s.y,alien:e.s.alien,messages:e.messages.slice(-3)}));throw Error(`Mort ${e.s.room} objectif ${e.goal?.id} à ${e.s.time.toFixed(1)} s (${e.messages.at(-1)?.text})`);}
 }
 function waitInLocker(target){const a=e.s.alien,s=e.s;
  if(!active||!a.active||a.room!==s.room||s.tools.flame||ROOMS[s.room].view!=='SIDE'||(a.x-s.x)*(target.x-s.x)<=0)return;
  const locker=ROOMS[s.room].props.filter(p=>p.interactive==='hide'&&Math.abs(p.x-s.x)<600&&distance(p,a)>220).sort((a,b)=>distance(a,s)-distance(b,s))[0];if(!locker)return;
  let budget=0;while(distance(s,locker)>8){if(++budget>1800)throw Error('Approche casier bloquée');tick({x:Math.sign(locker.x-s.x)});}
  tick();for(let i=0;i<30&&!s.hidden;i++)tick({interact:true});tick();
  if(!s.hidden)throw Error('Impossible de se cacher');let waited=0;
  while(a.room===s.room&&((a.x-s.x)*(target.x-s.x)>0||distance(a,s)<240)){tick({breath:distance(a,s)<85});if(++waited>4800)throw Error('Patrouille ne libère pas le passage');}
  for(let i=0;i<25&&s.hidden;i++)tick({interact:true});tick();
 }
 function cautiousPath(target){
  const s=e.s,a=s.alien,r=ROOMS[s.room];if(!active||!a.active||a.room!==s.room||s.tools.flame||r.view==='SIDE'||['vent','retreat'].includes(a.mode))return pathTo(s.room,s,target);
  const pts=[];for(let x=44;x<r.w-35;x+=28)for(let y=122;y<391;y+=28)if(walkable(s.room,x,y,16)&&Math.hypot(x-a.x,y-a.y)>100)pts.push({x,y,key:x+','+y});
  const near=t=>pts.reduce((p,q)=>distance(t,p)<distance(t,q)?p:q,pts[0]);if(!pts.length)return pathTo(s.room,s,target);const first=near(s),last=near(target),by=new Map(pts.map(p=>[p.key,p])),q=[first],seen=new Set([first.key]),prev=new Map();
  for(let i=0;i<q.length;i++){const p=q[i];if(p.key===last.key)break;for(const [dx,dy]of [[28,0],[-28,0],[0,28],[0,-28]]){const n=by.get((p.x+dx)+','+(p.y+dy));if(n&&!seen.has(n.key)){seen.add(n.key);prev.set(n.key,p.key);q.push(n);}}}
  if(!seen.has(last.key))return pathTo(s.room,s,target);const out=[target];let k=last.key;while(k!==first.key){out.push(by.get(k));k=prev.get(k);}out.push(first);return out.reverse();
 }
 function walk(target){if(!walkable(e.s.room,target.x,target.y))target=safePosition(e.s.room,target);waitInLocker(target);let p=cautiousPath(target);if(!p.length)throw Error(`Aucun chemin ${e.s.room} ${JSON.stringify(target)}`);
  let i=0,limit=0;while(i<p.length){if(++limit>10000)throw Error(`Navigation bloquée ${e.s.room} ${JSON.stringify(e.s.x)} ${e.s.y} point${JSON.stringify(p[i])}`);
   if(active&&limit%10===0&&e.s.alien.active&&e.s.alien.room===e.s.room&&!e.s.tools.flame&&ROOMS[e.s.room].view!=='SIDE'&&distance(e.s,e.s.alien)>160){p=cautiousPath(target);i=0;while(i<p.length&&distance(e.s,p[i])<32)i++;if(i===p.length)break;}
   const next=p[i],d=distance(e.s,next);if(d<8){i++;continue;}
   const dx=next.x-e.s.x,dy=next.y-e.s.y;
   tick({x:dx/d,y:dy/d});
  }
 }
 function interact(id){if(active&&e.sealed(id))e.sealNearest();let tries=0,startGoal=e.s.goal,startRoom=e.s.room;
  while(e.s.room===startRoom&&e.s.goal===startGoal){if(++tries>400)throw Error(`Interaction bloquée ${id}; cible=${e.targets()[0]?.id}; loc${e.s.x},${e.s.y}; hold${JSON.stringify(e.hold)}`);
   tick({interact:tries>2});
   if(e.pendingHack){for(const symbol of [...e.pendingHack.sequence]){e.hack(symbol);tick();}}
   if(e.requireRelease&&e.s.room===startRoom&&e.s.goal===startGoal){tick();}
  }
 }
 function visitTask(id){
  const task=CONTENT.optional.find(t=>t.id===id);if(e.s.optional.includes(id))return;
  const rr=route(e.s.room,task.room,e.s);assert.notEqual(rr,null,'Route facultative '+id);
  for(const edge of rr){walk(edge.point);interact(edge.id);}
  walk(task);tick();let tries=0;
  while(!e.s.optional.includes(id)){
   if(++tries>180)throw Error('Interaction facultative bloquée '+id+' cible '+e.targets()[0]?.id);
   tick({interact:true});if(e.requireRelease)tick();
  }
  snapshots.push({goal:e.s.goal,optional:id,description:task.label,save:e.serialize()});
 }
 const excursions={6:['O01'],10:['O02'],13:['O03','O04','O13','O14','O17','O18'],17:['O05','O06','O19','O20'],25:['O09','O10'],30:['O07'],36:['O08'],42:['O11','O12'],45:['O15','O16']};
 if(spatialExplore){
  for(const [at,tasks] of Object.entries({0:['O31'],11:['O21'],15:['O26'],17:['O27'],19:['O22','O23','O24'],22:['O32'],25:['O30'],30:['O28'],36:['O29'],45:['O25']}))excursions[at]=[...(excursions[at]||[]),...tasks];
 }
 function rescueContact(id){
  const n=e.s.encounters.rescues.find(n=>n.id===id),spec=e.encounters.spec(id);
  if(['rescued','dead'].includes(n.status))return;
  const travelTo=room=>{const rr=route(e.s.room,room,e.s);if(!rr)throw Error('Pas de trajet vers le contact '+id);for(const edge of rr){walk(edge.point);interact(edge.id);}};
  travelTo(n.room);walk({x:n.x,y:n.y});tick();let tries=0;
  while(n.status==='sheltered'&&++tries<80){tick({interact:true});if(e.requireRelease)tick();}
  if(n.status==='sheltered')throw Error('Contact non recruté '+id);
  snapshots.push({goal:e.s.goal,rescue:id+'-recruited',description:spec.name+' recruté à son poste',save:e.serialize()});
  travelTo(spec.home);walk(spec.homePoint);let waiting=0;
  while(n.status==='follow'&&(n.room!==spec.home||distance(n,spec.homePoint)>64)&&++waiting<4000)tick();
  if(n.status==='follow'&&n.room===spec.home){walk(n);tick();tries=0;while(n.status==='follow'&&++tries<100){tick({interact:true});if(e.requireRelease)tick();}}
  if(n.status==='follow')throw Error('Escorte restée bloquée '+id+' '+n.room+' '+n.x+','+n.y+' '+JSON.stringify(n.trail));
  snapshots.push({goal:e.s.goal,rescue:id+'-'+n.status,description:spec.name+' / résultat du repli',save:e.serialize()});
 }
 function buildRefuge(id){
  const spec=e.refuges.spec(id);if(e.refuges.upgraded(id)||!e.refuges.arrived(id))return;
  const travelTo=room=>{const rr=route(e.s.room,room,e.s);if(!rr)throw Error('Pas de trajet vers le projet '+id);for(const edge of rr){walk(edge.point);interact(edge.id);}};
  const act=(target,done)=>{walk(target);tick();let tries=0;while(!done()){if(++tries>180)throw Error('Projet bloqué '+id+' cible '+e.targets()[0]?.id+' '+e.messages.at(-1)?.text);tick({interact:true});if(e.requireRelease)tick();}};
  for(const part of spec.parts){if(e.refuges.collected(part.id))continue;travelTo(part.room);act(part,()=>e.refuges.collected(part.id));snapshots.push({goal:e.s.goal,part:part.id,description:part.label+' récupéré à pied',save:e.serialize()});}
  travelTo(spec.room);
  for(const action of ['power','install']){const prop=ROOMS[spec.room].props.find(p=>p.refuge===id&&p.action===action);act(prop,()=>e.refuges.station(id)[action==='power'?'powered':'installed']);}
  snapshots.push({goal:e.s.goal,project:id,description:spec.project+' installé',save:e.serialize()});
 }
 let failure=null;try{while(e.goal){const goal=e.goal;
  if(explore&&excursions[e.s.goal])for(const id of excursions[e.s.goal])visitTask(id);
  if(rescue&&e.s.goal===13)rescueContact('nora');if(rescue&&e.s.goal===17)rescueContact('elias');
  if(projects&&e.s.goal===13)buildRefuge('medical');if(projects&&e.s.goal===17)buildRefuge('technical');
  if(explore&&e.s.goal===9&&!e.s.visited.includes('y_duct')){const rr=route(e.s.room,'y_duct',e.s);assert(rr);for(const edge of rr){walk(edge.point);interact(edge.id);}}
  if(log)console.log(`GOAL ${e.s.goal+1} ${goal.id} -> ${goal.room}`);
  const rr=route(e.s.room,goal.room,e.s);assert.notEqual(rr,null,`Route verrouillée ${goal.id}`);
  for(const edge of rr){walk(edge.point);interact(edge.id);}
  assert.equal(e.s.room,goal.room);
  walk(goal);
  if(scanner!=='off'&&e.s.tools.tracker&&e.s.signals.charge<25&&e.s.inventory.battery>0&&!e.s.hidden){
   tick();for(let i=0;i<34;i++)tick({swapBattery:true});tick();
  }
  if(goal.flag==='detached'){
   // Wait for the fixed KG-348 lure to bring the existing creature through
   // declared ceiling segments. No creature, goal or resource injection.
   let waiting=0;while(!(e.s.alien.active&&e.s.alien.room==='g_lab'&&e.s.alien.mode!=='vent')){
    if(++waiting>6000)throw Error('Le capteur KG-348 reste vide après 300 secondes');tick();
   }
  }
  visitedTargets.push({goal:goal.id,room:e.s.room,x:e.s.x,y:e.s.y,time:e.s.time});
  if([0,4,10,11,12,16,19,22,24,25,26,28,32,36,37,38,40,41,42,43,45,46,49,50,51].includes(e.s.goal))snapshots.push({goal:e.s.goal,description:goal.label,save:e.serialize()});
  interact(goal.id);
  if(active&&!e.s.ended&&e.s.room===goal.room&&(!e.s.alien.active||e.s.alien.room!==e.s.room||['vent','retreat'].includes(e.s.alien.mode))){
   const loot=ROOMS[e.s.room].props.find(p=>p.interactive==='loot'&&!e.s.opened.includes(p.id));
   if(loot){walk(loot);tick();let budget=0;while(!e.s.opened.includes(loot.id)&&++budget<100){tick({interact:true});if(e.requireRelease)tick();}}
  }
  transcript.push({id:goal.id,room:goal.room,health:e.s.health,time:+e.s.time.toFixed(2),alienRoom:e.s.alien.room});
 }
 }catch(err){failure=err.message;if(log)console.error(failure);}
 return {version:CONTENT.meta.version,spatialExplore,simulationMode:active?'live-enemies-and-damage':'no-damage-ordinary-enemies-disabled-gemini-actor-active',failure,active,difficulty,classic,seed,explore,rescue,projects,scanner,signals:e.s.signals,refuges:e.s.refuges,rescued:e.s.encounters.rescues.filter(n=>n.status==='rescued').map(n=>n.id),rescueStates:e.s.encounters.rescues.map(n=>({id:n.id,status:n.status,room:n.room,health:n.health})),optional:e.s.optional,ok:e.s.ended,goals:e.s.completed.length,visited:e.s.visited,transitions:e.s.stats.transitions,health:e.s.health,stats:e.s.stats,time:e.s.time,steps,snapshots,transcript,visitedTargets,events:e.events,finalSave:e.serialize()};
}
if(process.argv[1]?.endsWith('campaign.mjs')){
 const args=process.argv.slice(2),active=!args.includes('--routing-only'),classic=args.includes('--classic'),explore=args.includes('--explore'),difficulty=args.find(a=>a.startsWith('--difficulty='))?.split('=')[1]||'recit';
 try{const result=traverse({active,classic,difficulty,log:true,explore,rescue:args.includes('--rescue')});mkdirSync(new URL('../qa/',import.meta.url),{recursive:true});const fname=active?'campaign-active':'campaign-routing';writeFileSync(new URL('../qa/'+fname+(classic?'-classic':'')+(explore?'-explore':'')+(args.includes('--rescue')?'-rescue':'')+'.json',import.meta.url),JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;console.log(JSON.stringify({...result,snapshots:result.snapshots.length,transcript:result.transcript.length,events:result.events.length,finalSave:undefined,visitedTargets:result.visitedTargets.length},null,2));}catch(err){console.error(err);process.exitCode=1;}
}
