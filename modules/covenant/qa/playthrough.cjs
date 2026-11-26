#!/usr/bin/env node
'use strict';
/** Deterministic automated route. Controls call the actual simulation.
 * The pilot reads world coordinates for routing/aiming; it does NOT teleport,
 * edit health/ammo/enemy/quest state, grant invulnerability, or mark goals complete.
 * This is not a manual playthrough and is not a visual browser test.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const D=require('../dlc/covenant/content.js'),{CovenantEngine}=require('../dlc/covenant/core.js');
const route=['cryo','service','coolantwalk','evaclocker','cabin','service','bridge','comms','landing','wheat','ravine','wheat','forest','juggernaut','pilot','juggernaut','medlander','burning','reeds','necropolis','court','cistern','undercroft','gallery','workshop','garden','shaw','garden','crypt','catacomb','nave','plaza','lifter','infirmary','corridor','stores','relay','cargo','returncryo','embryos'];
const dt=.025,distance=(a,b)=>Math.hypot(a.x-b.x,(a.z-b.z)*510);
function run({name,difficulty,pace,fieldwork=false,networkwork=false,maintenancework=false,archaeologywork=false,atmospherework=false,freightwork=false,fidelitywork=false}){
 const actualRoute=maintenancework?['cryo','service','coolantwalk','evaclocker','cabin','service','bridge','comms','coolantduct','coolantwalk','service','bridge','comms','landing','wheat','ravine','wheat','forest','juggernaut','pilot','juggernaut','medlander','burning','reeds','necropolis','court','cistern','undercroft','gallery','workshop','garden','shaw','garden','crypt','catacomb','nave','plaza','lifter','infirmary','corridor','filterduct','stores','relay','stores','freightduct','cargo','returncryo','embryos']:route.slice();
 if(archaeologywork){const n=actualRoute.indexOf('court');actualRoute.splice(n+1,0,'aqueduct','sluiceworks','effigybasin','reliquary','gallery','court');}
 if(atmospherework){const n=actualRoute.indexOf('wheat');actualRoute.splice(n+1,0,'windfall','sporehollow','surveyblind','ravine','wheat');}
 if(fidelitywork){
  const insert=(at,items)=>{const n=actualRoute.indexOf(at);assert.ok(n>=0);actualRoute.splice(n+1,0,...items);};
  insert('service',['funeralairlock','service']);
  insert('bridge',['evaprep','sailaccess','evaprep','bridge']);
  insert('landing',['landerhold','landercockpit','landerhold','landing']);
  insert('medlander',['landermed','medlander']);
  insert('workshop',['davidquarters','musicroom','gallery','workshop']);
  insert('corridor',['washroom','corridor']);
  insert('returncryo',['colonistvault','returncryo']);
 }
 const e=new CovenantEngine(D,{difficulty}),log=[],trace=[],result={name,difficulty,pace,method:'Coordinate-informed pilot; actual tick/move/jump/interaction/fire APIs; no teleports, stat edits, invulnerability or quest overrides',route:[],events:{},steps:0};
 let controls=0,lastTrace=-1,minHP=100,actualDamage=0;
 function step(keys={}){
  assert.ok(!e.dead,`Dead in ${e.room.id}`);const hp=e.state.player.hp;
  e.tick(dt,keys);controls++;minHP=Math.min(minHP,e.state.player.hp);actualDamage+=Math.max(0,hp-e.state.player.hp);
  for(const ev of e.drainEvents())result.events[ev.type]=(result.events[ev.type]||0)+1;
  if(Math.floor(e.state.time)!==lastTrace){lastTrace=Math.floor(e.state.time);trace.push({time:+e.state.time.toFixed(2),room:e.room.id,x:+e.state.player.x.toFixed(2),z:+e.state.player.z.toFixed(3),hp:e.state.player.hp,ammo:e.state.ammo});}
  assert.ok(!e.dead,`Dead in ${e.room.id} after ${e.state.time.toFixed(1)}s`);
 }
 function avoid(x,z){return !!(atmospherework&&(D.atmosphere.sources||[]).some(o=>o.room===e.room.id&&Math.abs(x-o.x)<o.coreRX+45&&Math.abs(z-o.z)<o.coreRZ+.06))||e.solidProps().some(o=>o.solid&&Math.abs(x-o.x)<o.w/2+34&&Math.abs(z-o.z)<.18)||e.room.props.some(o=>['spore','fire'].includes(o.kind)&&Math.abs(x-o.x)<o.w/2+42&&Math.abs(z-o.z)<.19);}
 function clear(a,b){const n=Math.max(1,Math.ceil(distance(a,b)/14));for(let i=1;i<=n;i++)if(avoid(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;return true;}
 function plan(target){
  const start=e.state.player;if(e.room.view==='side'||distance(start,target)<45&&clear(start,target))return [target];
  const sx=45,sz=.0525,rows=17,cols=Math.ceil((e.room.width-80)/sx)+1,point=(i)=>({x:Math.min(e.room.width-40,40+(i%cols)*sx),z:.08+Math.floor(i/cols)*sz});
  const nodes=[];for(let i=0;i<cols*rows;i++){const p=point(i);if(!avoid(p.x,p.z))nodes.push(i);}
  function nearest(p){return nodes.filter(i=>clear(p,point(i))).sort((a,b)=>distance(point(a),p)-distance(point(b),p))[0];}
  const startId=nearest(start),goal=nearest(target),open=[startId],g=new Map([[startId,0]]),parent=new Map(),closed=new Set(),valid=new Set(nodes);assert.notEqual(startId,undefined);assert.notEqual(goal,undefined);
  while(open.length){open.sort((a,b)=>(g.get(a)+distance(point(a),point(goal)))-(g.get(b)+distance(point(b),point(goal))));const id=open.shift();if(id===goal){const out=[target];let i=id;while(i!==startId){out.unshift(point(i));i=parent.get(i);}out.unshift(point(startId));return out;}
   closed.add(id);let x=id%cols,y=Math.floor(id/cols);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const xx=x+dx,zz=y+dz,n=zz*cols+xx;if(xx<0||xx>=cols||zz<0||zz>=rows||!valid.has(n)||closed.has(n)||!clear(point(id),point(n)))continue;const v=g.get(id)+distance(point(id),point(n));if(v<(g.get(n)??Infinity)){g.set(n,v);parent.set(n,id);if(!open.includes(n))open.push(n);}}
  }throw new Error('No route in '+e.room.id+' to '+JSON.stringify(target));
 }
 function fireIfPossible(keys){
  const p=e.state.player,foe=e.enemies().filter(f=>f.alive&&f.kind!=='xenomorph'&&distance(f,p)<800&&Math.abs(f.z-p.z)<.185&&e.lineClear(p,f,90)).sort((a,b)=>distance(p,a)-distance(p,b))[0];
  if(!foe||!e.state.weapon)return;
  const facing=keys.right?1:keys.left?-1:p.facing;if((foe.x-p.x)*facing<=0&&e.cooldown<=0){keys.right=foe.x>p.x;keys.left=foe.x<p.x;}if(e.state.ammo>0)keys.fire=true;else e.reload();
 }
 function moveTo(target,label){
  if(maintenancework&&e.room.crawl){
   const p=e.state.player,dir=Math.sign(target.x-p.x);
   const obstacles=e.getMaintenanceFans().filter(f=>e.state.maintenance.fans[f.id].spin>.08&&(f.x-p.x)*dir>0&&(f.x-target.x)*dir<85).sort((a,b)=>(a.x-b.x)*dir);
   for(const f of obstacles){const panel=f.panels[dir>0?0:1];if(!e.state.maintenance.fans[f.id].isolated){moveTo(panel,'sectionneur '+f.id);assert.ok(e.beginIsolation(f.id),'Consignation '+f.id);let n=0;while(e.isolating){assert.ok(++n<150);step();}assert.ok(e.state.maintenance.fans[f.id].isolated,'Isolation interrupted '+f.id);}
    let n=0;while(e.state.maintenance.fans[f.id].spin>.08){assert.ok(++n<150);step();}
   }
  }
  let waypoints=plan(target),loops=0,lastX=e.state.player.x,lastZ=e.state.player.z,stuck=0;
  while(waypoints.length){assert.ok(++loops<12000,`Movement timeout: ${e.room.id} / ${label} / ${JSON.stringify(e.state.player)}`);
   const p=e.state.player,aim=waypoints[0],dx=aim.x-p.x,dz=aim.z-p.z;
   if(Math.abs(dx)<5&&Math.abs(dz)<.01){waypoints.shift();continue;}
   const keys={right:dx>3,left:dx<-3,down:dz>.008,up:dz<-.008,run:pace==='run'&&(Math.abs(dx)>65||Math.abs(dz)>.12)};
   if(atmospherework&&e.room.atmosphere){keys.crouch=true;keys.run=false;}
   if(pace==='crouch'&&e.enemies().some(f=>f.alive)&&!e.room.actions.some(a=>a.kind==='crane'||a.kind==='airlock'))keys.crouch=true;
   if(e.room.view==='side'){
    const direction=Math.sign(dx),ob=e.room.props.find(o=>o.solid&&(o.x-p.x)*direction>0&&Math.abs(o.x-p.x)<o.w/2+45&&p.y<o.h);
    if((ob||stuck>.35)&&e.grounded())e.jump();
   }
   fireIfPossible(keys);step(keys);
   if(Math.abs(p.x-lastX)<.15&&Math.abs(p.z-lastZ)<.001)stuck+=dt;else stuck=0;lastX=p.x;lastZ=p.z;
   if(stuck>2&&e.room.view==='depth'){waypoints=plan(target);stuck=0;}
  }
  while(!e.grounded())step();
  assert.ok(e.distance(target)<115,'Target not within physical reach: '+label);
 }
 function attend(){
  if(e.state.player.hp<65&&e.state.inventory.medkit&&e.enemies().every(f=>!f.alive||e.distance(f)>900)){
   if(e.heal())while(e.healing>0)step();
  }
  if(e.state.weapon&&e.state.ammo<5&&e.state.reserve>0){e.reload();while(e.reloadTime>0)step();}
 }
 try{
  for(let i=0;i<actualRoute.length;i++){
   assert.equal(e.room.id,actualRoute[i]);const room=e.room,entryTime=e.state.time;
   if(fieldwork){
    for(const actor of e.crew()){
     if(e.state.complete)continue;
     const def=e.actorDefs.get(actor.id);if(def.topics.every(t=>e.state.contacts.includes(actor.id+':'+t.id)))continue;
     moveTo(actor,'conversation '+actor.id);const dialogue=e.beginConversation(actor.id);assert.ok(dialogue,'Could not speak to '+actor.id);
     for(const topic of dialogue.topics)assert.ok(e.chooseTopic(topic.id),'Topic refused '+topic.id);e.endConversation();
    }
    for(const survey of room.surveys||[]){if(e.state.surveys.includes(survey.id))continue;
     moveTo(survey,survey.id);assert.ok(e.startSurvey(survey.id),'Survey refused '+survey.id);let n=0;
     while(e.scanning){assert.ok(++n<200,'Survey timeout');step();}
     assert.ok(e.state.surveys.includes(survey.id),'Survey interrupted '+survey.id);
    }
   }
   for(const act of room.actions){if(e.done(act.id))continue;attend();moveTo(act,act.id);
    if(act.kind==='hold'){
     assert.equal(e.tryAction(act.id),false);if(e.state.inventory.decoy)e.throwDecoy();let n=0;while(!e.done(act.id)){
      assert.ok(++n<1500,'Beacon timeout');const keys={};fireIfPossible(keys);step(keys);
     }
    }else if(['crane','airlock'].includes(act.kind)){
     let n=0;while(!e.tryAction(act.id)){assert.ok(++n<1600,'Trap timing timeout');step();}
     while(e.busy)step();assert.ok(e.done(act.id));
    }else {assert.ok(e.tryAction(act.id,act.puzzle?.target),'Action refused '+act.id);let n=0;while(e.work){assert.ok(++n<500,'Work timeout '+act.id);step();}assert.ok(e.done(act.id),'Work not completed '+act.id);}
   }
   if(atmospherework&&room.atmosphere&&e.done('windfall-a1')){assert.ok(e.toggleDetector());assert.equal(e.detectorReadings().samples.length,3);for(let t=0;t<.25;t+=dt)step();assert.ok(e.toggleDetector());}
   if(archaeologywork&&room.id==='sluiceworks'){
    for(const ring of D.archaeology.rings){moveTo(ring,'couronne '+ring.id);let count=0;
     while(e.state.archaeology.rings[ring.id].index!==ring.target){assert.ok(++count<=4);assert.ok(e.beginArchaeology(ring.id));let n=0;while(e.rotating){assert.ok(++n<100);step();}}
    }
    moveTo(D.archaeology.lever,'déversoir');assert.ok(e.interact());let n=0;while(!e.archaeologyStatus().open){assert.ok(++n<400,'Sluice never fully opens');step();}
   }
   if(networkwork){
    for(const terminal of (D.shipSystems?.terminals||[]).filter(t=>t.room===room.id)){
     moveTo(terminal,'terminal '+terminal.id);assert.ok(e.beginNetwork(terminal.id),'Physical terminal access '+terminal.id);
     for(const camera of terminal.cameras){assert.ok(e.selectCamera(camera));e.cameraView();step();}
     for(const circuit of terminal.circuits){if(e.state.network.circuits[circuit].lights)assert.ok(e.setCircuit(circuit,'lights',false));if(!e.state.network.circuits[circuit].speakers)assert.ok(e.setCircuit(circuit,'speakers',true));}
     const sound=terminal.speakers.find(id=>id==='cargo-signal'&&e.done('corridor-a2'));
     if(sound)assert.ok(e.triggerSpeaker(sound),'Playable sound cue');
     for(let t=0;t<2;t+=dt)step();assert.ok(e.endNetwork());
    }
   }
   for(const box of room.supplies||[]){if(e.state.collected.includes(box.id))continue;moveTo(box,box.id);assert.ok(e.collect(box.id),'Pickup refused');}
   if(freightwork){for(const c of e.freightCarts()){
    if(e.state.freight.parked.includes(c.id))continue;
    const side=c.dock<c.x?1:-1,handle={x:c.x+side*(c.w/2+D.freight.handleOffset),z:c.z};
    moveTo(handle,'poignée '+c.id);while(e.state.player.stamina<95)step();assert.ok(e.toggleFreight(),'Handle refused '+c.id);
    let n=0;const dir=Math.sign(c.dock-c.x);while(!e.freightParked(c)){assert.ok(++n<1000,'Load blocked '+c.id);step({right:dir>0,left:dir<0});assert.ok(e.grip,'Grip lost '+c.id);}
    assert.ok(e.toggleFreight());assert.ok(e.state.freight.parked.includes(c.id));
   }}
   attend();result.route.push({room:room.id,timeIn:Math.round(entryTime),timeOut:Math.round(e.state.time),hp:e.state.player.hp,remainingAmmo:e.state.ammo+e.state.reserve,goals:room.actions.every(a=>e.done(a.id))});
   if(i<actualRoute.length-1){const door=room.exits.find(x=>x.to===actualRoute[i+1]);assert.ok(door);moveTo(door,door.id);let n=0;while(e.room.id===room.id){e.interact();if(e.room.id!==room.id)break;assert.ok(++n<80,'Exit refused '+room.id+' -> '+actualRoute[i+1]);step();}}
  }
  assert.equal(e.state.visited.length,(fidelitywork?10:0)+(archaeologywork?(maintenancework?43:40):maintenancework?39:36)+(atmospherework?3:0));assert.equal(e.state.complete,true);assert.equal(e.state.actions.length,1+(fidelitywork?11:0)+(archaeologywork?(maintenancework?68:65):maintenancework?63:60)+(atmospherework?5:0));assert.equal(e.state.collected.length,(archaeologywork?(maintenancework?38:32):maintenancework?32:26)+(atmospherework?6:0));assert.equal(e.state.stats.deaths,0);
  if(fieldwork){assert.equal(e.state.surveys.length,(archaeologywork?17:14)+(atmospherework?2:0));assert.equal(e.state.contacts.length,fidelitywork?31:28);}
  if(networkwork){assert.equal(e.state.network.terminals.length,3);assert.equal(e.state.network.viewed.length,6);assert.ok(e.state.network.log.some(v=>v.kind==='speaker'));}
  Object.assign(result,{ok:true,fidelitywork,freightwork,freight:e.state.freight,fieldwork,networkwork,maintenancework,archaeologywork,atmospherework,atmosphere:e.state.atmosphere,archaeology:e.state.archaeology,maintenance:e.state.maintenance,network:e.state.network,controls,simulationSeconds:+e.state.time.toFixed(2),minHealth:minHP,actualDamage,visited:e.state.visited.length,actions:e.state.actions.length,collected:e.state.collected.length,stats:e.state.stats,final:e.export()});
 }catch(err){Object.assign(result,{ok:false,failure:err.stack,controls,simulationSeconds:e.state.time,room:e.room.id,player:e.state.player,trace:trace.slice(-25)});}
 const dir=process.env.COVENANT_QA_OUTPUT||path.join(require('node:os').tmpdir(),'covenant-v011-qa');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify({...result,trace},null,2));return result;
}
if(require.main===module){const profiles=[{name:'exploration',difficulty:'explorer',pace:'run'},{name:'survie',difficulty:'standard',pace:'run'},{name:'vulnerable',difficulty:'survival',pace:'walk'},{name:'discretion',difficulty:'standard',pace:'crouch'}];let ok=true;for(const profile of profiles){const r=run(profile);console.log(JSON.stringify({profile:r.name,ok:r.ok,seconds:r.simulationSeconds,controls:r.controls,room:r.room,minHP:r.minHealth,stats:r.stats,failure:r.failure}));ok&&=r.ok;}if(!ok)process.exitCode=1;}
module.exports={run};
