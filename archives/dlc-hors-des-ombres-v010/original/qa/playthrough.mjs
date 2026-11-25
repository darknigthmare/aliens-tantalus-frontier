import fs from 'node:fs/promises';
import {DATA} from '../src/oth-v1/oth-data.js';
import {ROOM,createState,step,route,roomWorld,currentObjective,resolvePuzzle,collision,serialize,solveWorkAction,findPath,roomGeometry,PROP,cartPosition} from '../src/oth-v1/oth-engine.js';
export function playthrough(difficulty='assisted',optionalMaintenance=false,optionalExcursion=false,optionalHandling=false){
 const s=createState(difficulty),captures={},log=[],maintenanceLog=[],excursionLog=[],handlingLog=[],handled=new Set(),sideDone=new Set();let frames=0,transitions=0,damage=0;
 function tick(i={}){const before=s.player.hp;step(s,i,.05);frames++;if(s.flame>0&&!captures['combat'])captures.combat=JSON.parse(JSON.stringify(s));damage+=Math.max(0,before-s.player.hp);if(s.dead)throw new Error(`Dead at ${s.room} after ${s.completed.length} goals`);if(frames>350000)throw new Error('Frame limit');}
 // V0.9 test driver follows the public obstacle graph, then issues normal
 // movement inputs. No actor position, health, goals or components are injected.
 function walk(x,y){
  let count=0,path=[],revision='',stalled=0;
  while(Math.hypot(s.player.x-x,s.player.y-y)>6){
   if(++count>4000)throw new Error(`Navigation stuck: ${s.room} (${s.player.x},${s.player.y}) toward (${x},${y}) goal=${s.completed.length}`);
   const r=roomGeometry(s),px=s.player.x,py=s.player.y,key=r.geometryKey||r.id;
   if(!path.length||count%8===1||revision!==key){path=findPath(r,s.player,{x,y});revision=key;}
   while(path.length&&Math.hypot(path[0].x-px,path[0].y-py)<1.5)path.shift();
   const point=path[0]||{x,y};if(!path.length&&collision(r,x,y))throw new Error('Target obstructed '+s.room+' '+x+','+y);
   const dx=point.x-px,dy=point.y-py;
   const span=Math.hypot(dx,dy/.7)||1,slow=Math.min(1,span/12);
   let i={x:dx/span*slow,y:dy/.7/span*slow,sprint:true};
   const near=roomWorld(s).enemies.find(e=>Math.abs(e.x-px)<220&&Math.abs(e.y-py)<65&&e.stun<.2);
   if(near&&s.flags.torchReady&&s.player.fuel>=9){i.fire=true;i.x=Math.sign(near.x-px);i.y=0;i.sprint=false;}
   if(s.player.hp<55&&s.player.kits>0)i.heal=true;
   tick(i);stalled=Math.hypot(s.player.x-px,s.player.y-py)<.001?stalled+1:0;
   if(stalled>150)throw new Error('No displacement on physical route '+s.room+' / '+JSON.stringify({x,y,point,p:s.player}));
  }
 }
 function handleLocal(){
  if(!optionalHandling)return;
  for(const d of DATA.handling.carts.filter(c=>c.room===s.room&&!handled.has(c.id))){
   if(s.flags.carryRipley||s.flags.cellCarried||s.excursion.recorder?.carried)continue;
   const old={...cartPosition(s,d.id)},offset=PROP[d.type].width/2+DATA.handling.handleOffset;
   walk(old.x-offset,old.y);tick({});let frames=0;
   // Public step, same X and D inputs as the keyboard. No transform injected.
   while(Math.abs(cartPosition(s,d.id).x-old.x)<12){
    if(frames++>90)throw new Error('Handling on campaign stalled '+d.id+' / '+s.notice);
    tick({grab:true,x:1});
   }
   tick({});handled.add(d.id);handlingLog.push({id:d.id,room:s.room,at:s.completed.length,before:old,after:{...cartPosition(s,d.id)},seconds:s.elapsed});
  }
 }
 function to(x,y){handleLocal();walk(x,ROOM[s.room].mode==='profile'?88:y);}

 function travel(target){while(s.room!==target){const next=route(s,target)?.[0];if(!next)throw new Error('Side route missing '+target);const p=ROOM[s.room].portals.find(p=>p.edge===next.edge);to(p.x,p.y);const before=s.room;for(let n=0;n<750&&s.room===before;n++){tick({interact:true,heal:s.player.hp<55});if(s.reading)s.reading=null;}if(s.room===before)throw new Error('Side exit blocked '+p.id);transitions++;}}
 function salvage(id){const a=DATA.interactables.find(a=>a.id===id);travel(a.room);to(a.x,a.y);let attempts=0;while(!s.maintenance.salvaged.includes(id)){if(attempts++>100)throw new Error('Salvage failed '+id);tick({interact:true});}tick({});}
 function repairJob(id){const j=DATA.maintenance.repairs.find(j=>j.id===id);travel(j.a);to(j.xA,88);for(let stage=0;stage<3;stage++){tick({});let frames=0;while((s.maintenance.repairs[id]||0)===stage){if(frames++>160)throw new Error('Repair failed '+id+' stage '+stage);tick({interact:true,heal:s.player.hp<35});}}tick({});maintenanceLog.push({id,at:s.completed.length,parts:s.maintenance.parts,seconds:s.elapsed});}
 function optional(){const n=s.completed.length;if(sideDone.has(n))return;sideDone.add(n);if(optionalExcursion==='all'&&n===3)travel('maintenance');if(optionalExcursion==='all'&&n===27)travel('alcove');if(n===0){salvage('salvage-01');salvage('salvage-04');repairJob('repair-medical');}if(n===9){salvage('salvage-03');repairJob('repair-cargo');}if(n===21){salvage('salvage-08');repairJob('repair-mine');}}
 function excursion(){
  if(s.completed.length!==21||excursionLog.length)return;
  const beginning=s.completed.length,parts=s.maintenance.parts;
  for(const [i,op] of DATA.excursion.ops.entries()){
   travel(op.room);to(op.x,op.y);
   if(i===3){for(let guard=0;s.excursion.pumpElapsed<DATA.excursion.pumpSeconds;guard++){if(guard>500)throw new Error('Pump timer stalled');tick({heal:s.player.hp<55});}}
   tick({});let guard=0;
   while(s.excursion.done.length===i){if(guard++>260)throw new Error('Excursion operation stalled '+op.id+' / '+s.notice);tick({interact:true,heal:s.player.hp<35});if(s.reading)s.reading=null;}
   tick({});excursionLog.push({id:op.id,room:s.room,seconds:s.elapsed,hp:s.player.hp});
   if(op.id==='recover'){if(!s.excursion.recorder?.carried)throw new Error('Recorder not physically carried');}
  }
  if(s.completed.length!==beginning||s.maintenance.parts!==parts)throw new Error('Excursion altered mandatory progress or parts');
  captures.excursion=JSON.parse(serialize(s));
 }
 while(!s.finished){if(optionalMaintenance)optional();if(optionalExcursion)excursion();const goal=currentObjective(s);if(!captures['chapter-'+s.chapter])captures['chapter-'+s.chapter]=JSON.parse(serialize(s));while(s.room!==goal.room){const next=route(s,goal.room)?.[0];if(!next)throw new Error('No route '+goal.id);const r=ROOM[s.room],p=r.portals.find(p=>p.edge===next.edge);to(p.x,p.y);const before=s.room;for(let tries=0;s.room===before&&tries<700;tries++){tick({interact:true,heal:s.player.hp<55});if(s.reading)s.reading=null;}if(s.room===before)throw new Error('Portal failed '+p.id+' '+JSON.stringify({companion:s.companion,player:s.player,notice:s.notice,reading:s.reading}));transitions++;}
 const node=ROOM[s.room].nodes.find(n=>n.id===goal.node);to(node.x,node.y);if(['landing','eggs','fossils','hangar','lift_east','medical','server','narcissus','samson','breach','vein'].includes(s.room)&&!captures['scene-'+s.room])captures['scene-'+s.room]=JSON.parse(serialize(s));
 const n=s.completed.length;let retries=0;
 while(s.completed.length===n){if(++retries>1500)throw new Error('Interaction stalled '+goal.id);tick({interact:true,heal:s.player.hp<70});if(s.puzzle)resolvePuzzle(s,solveWorkAction(s));if(s.reading)s.reading=null;}
 log.push({objective:goal.id,room:s.room,hp:s.player.hp,fuel:s.player.fuel,seconds:Math.round(s.elapsed)});
 }
 captures.final=JSON.parse(serialize(s));return{ok:true,difficulty,optionalMaintenance,optionalExcursion,optionalHandling,excursionLog,maintenanceLog,handlingLog,goals:s.completed.length,roomsVisited:s.visited.length,frames,transitions,damage,hp:s.player.hp,fuel:s.player.fuel,minutes:Number((s.elapsed/60).toFixed(1)),log,captures};
}
if(process.argv[1]?.endsWith('playthrough.mjs')){const results=[];for(const d of ['assisted','normal']){try{const result=playthrough(d);await fs.writeFile(new URL(`./playthrough-${d}.json`,import.meta.url),JSON.stringify(result,null,2));results.push({...result,captures:Object.keys(result.captures),log:undefined});}catch(e){results.push({ok:false,difficulty:d,error:e.stack});}}console.log(JSON.stringify(results,null,2));if(results.some(x=>!x.ok))process.exitCode=1;}
