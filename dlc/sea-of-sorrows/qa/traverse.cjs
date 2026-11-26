'use strict';
/* Continuous simulation driver: calls ordinary step/input, interact, equipment and
   weapons. It never assigns a room, completion flag, resource or enemy HP.
   Uses the runtime's path planner as a navigation aid; not a human playthrough. */
const fs=require('node:fs'),path=require('node:path');
const C=require('../src/core.js');
function traverse(presentation='HYBRID',verbose=false,difficulty='exploration'){
 const g=new C.Game({presentation,difficulty}),log=[],saves=[],dt=.05;let ticks=0;
 const say=s=>{log.push(s);if(verbose)console.log(s)};
 function tick(input={}){
  if(++ticks>200000)throw Error('Budget de simulation dépassé');
  if(g.state.failed)throw Error('Échec '+g.state.room+': '+g.state.failed);
  if(g.p.hp<56&&g.p.medkits)g.useMedkit();if(g.p.filter<15&&g.p.filters)g.replaceFilter();
  const enemy=g.rs.enemies.filter(e=>e.hp>0&&e.mode!=='captured'&&e.kind!=='captureAdult'&&g.distance(g.p,e)<710&&g.visible(g.p,e)).sort((a,b)=>g.distance(g.p,a)-g.distance(g.p,b))[0];
  if(enemy&&!(enemy.kind==='queen'&&g.rs.weakpoints.some(w=>w.hp>0))){
   const weapon=g.state.inventory.flame&&g.distance(g.p,enemy)<360&&g.p.fuel>=2?'flame':'pistol';
   if(g.p.weapon!==weapon)g.setWeapon(weapon);
   if(weapon==='pistol'&&g.p.ammo===0)g.reload();else g.shoot(enemy);
  }
  g.step(dt,input);g.drainEvents();
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
  }
  if(g.state.room!==target)throw Error('Route cyclique');
 }
 function operation(n){walk(n,25);
  if(g.state.rescue.active){for(let i=0;i<1200&&!g.convoyNear(n,n.kind==='embark'?400:460);i++)tick();}
  const before=n.action==='device'?!!g.state.optional[n.id]:g.state.objectiveIndex;
  for(let i=0;i<400;i++){tick({use:true,focus:n.type==='sense'});if(n.action==='device'?g.state.optional[n.id]:g.state.objectiveIndex!==before)return;}
  throw Error(`Travail bloqué ${n.id} in ${g.state.room} ${g.workCondition(n)} ${JSON.stringify(g.rs.work)}`);
 }
 for(let idx=0;idx<C.objectiveOrder.length;idx++){
  const o=g.current;route(o.room);
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
  if(!g.validate(g.state))throw Error('État invalide après '+o.id);
  const save=g.exportSave(),restored=new C.Game();restored.importSave(save);saves.push(save);
  say(`${presentation} ${idx+1}/33 ${o.id} ${o.flag} · ${Math.round(g.p.hp)} PV · ${Math.round(g.state.stats.time)}s`);
 }
 return {presentation,difficulty,passed:g.state.finished,objectives:g.state.completed.length,ticks,simulationSeconds:g.state.stats.time,rooms:g.state.visited,stats:g.state.stats,convoy:g.state.rescue,log,saves};
}
module.exports={traverse};
if(require.main===module){try{const out=traverse(process.argv[2]||'HYBRID',true);const root=path.resolve(__dirname,'..');fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports','traversal-'+out.presentation+'.json'),JSON.stringify({...out,saves:undefined},null,2));fs.mkdirSync(path.join(root,'qa/fixtures'),{recursive:true});for(let i=0;i<out.saves.length;i++)fs.writeFileSync(path.join(root,'qa/fixtures',`played-${out.presentation}-${String(i+1).padStart(2,'0')}.json`),out.saves[i]);console.log('FINISHED',out.stats);}catch(e){console.error(e.stack);process.exitCode=1;}}
