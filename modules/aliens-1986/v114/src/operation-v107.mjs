/* V107 — connected local operation; this is not the native Tantalus campaign.
   Immutable room geometries + persistent per-room states + one team ledger.
   All spatial queries remain delegated to the verified V106 spatial core. */
import * as S from './spatial-core.mjs';
import {VALIDATION_SCENES} from './validation-scenes.mjs';
import {ROOMS,TEAM,LINKS,roomById,exitsFor,OBJECTIVES,OPERATION_ROOMS,extraction} from './operation-scenes-v107.mjs';
export const VERSION='107.0.0-rc.1',SCHEMA=107;
const clone=x=>structuredClone(x),finite=x=>typeof x==='number'&&Number.isFinite(x);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),record=x=>x&&typeof x==='object'&&!Array.isArray(x);
const keysOnly=(o,allowed)=>record(o)&&Object.keys(o).every(k=>allowed.includes(k));
const worldKeys=['schema','roomId','geometry','time','doors','circuits','visited','stats','actors'];
const event=(s,type,detail={})=>{s.events.push({type,time:s.elapsed,...detail});if(s.events.length>60)s.events.shift();};
export const CONTRACT=S.fingerprint({rooms:ROOMS,team:TEAM,links:LINKS,objectives:OBJECTIVES,version:VERSION});
function makeTeam(){return TEAM.map(d=>({...clone(d),x:140,z:195,roomId:null,alive:true,invulnerable:0,phase:'idle',clock:0,aim:null,route:[],routeRevision:-1,waiting:false,order:'follow',anchor:null,facing:1,recruited:d.kind!=='escort'}));}
export function createSession({mode='operation',roomId='v106-hadley'}={}){
  if(!['operation','inspection'].includes(mode)||!roomById(roomId))throw new TypeError('Mode ou lieu inconnu');
  if(mode==='operation')roomId='v106-hadley';
  const session={schema:SCHEMA,contract:CONTRACT,mode,roomId,worlds:Object.fromEntries(ROOMS.map(r=>[r.id,S.createWorld(r)])),team:makeTeam(),elapsed:0,paused:false,status:'active',step:0,flags:{relay:false,newt:false,defense:false},defenseTime:0,visitedRooms:[roomId],transitions:0,action:null,transition:null,lastReason:'',events:[],stats:{opensCompleted:0,opensCancelled:0,transfers:0,orders:0,allyShots:0,allyBlocks:0},checkpoint:null};
  const original=VALIDATION_SCENES.find(r=>r.id===roomId);
  if(mode==='operation'){
    for(const [id,x,z] of [['ripley',220,198],['hicks',164,215],['hudson',164,283]])Object.assign(session.team.find(a=>a.id===id),{x,z,roomId});
    Object.assign(session.team.find(a=>a.id==='newt'),{roomId:'v106-medlab',x:1125,z:213,recruited:false,order:'hold',waiting:true,anchor:{x:1125,z:213}});
  }else if(original){
    for(const a of original.actors.filter(a=>a.kind==='player'||a.role!=='sentry'&&['ally','escort'].includes(a.kind))){const t=session.team.find(t=>t.id===a.id);if(t)Object.assign(t,{x:a.x,z:a.z,hp:a.hp??100,ammo:a.ammo??0,roomId,recruited:true});}
  }else{Object.assign(session.team[0],{x:140,z:195,roomId});Object.assign(session.team[1],{x:86,z:241,roomId});}
  assemble(session);for(const a of session.team.filter(a=>a.roomId))if(!S.canStand(session.worlds[a.roomId],a,a.radius))throw new Error('Position équipe invalide: '+a.id);
  session.checkpoint=exportSession(session);return session;
}
export const currentWorld=s=>s.worlds[s.roomId];
export const player=s=>s.team.find(a=>a.kind==='player');
export function assemble(s){for(const w of Object.values(s.worlds)){w.actors=w.actors.filter(a=>!TEAM.some(t=>t.id===a.id));w.actors.push(...s.team.filter(a=>a.roomId===w.scene.id));w.paused=s.paused;}}
const liveTeam=s=>s.team.filter(a=>a.roomId===s.roomId&&a.alive&&(a.kind!=='escort'||a.recruited));
export function pause(s,value=true){s.paused=Boolean(value);assemble(s);}
export function cancelAction(s,reason){if(!s.action)return false;s.stats.opensCancelled++;s.action=null;s.lastReason=reason;event(s,'action-cancelled',{reason});return true;}
export function movePlayer(s,dx,dz){if(s.paused||s.status!=='active'||!finite(dx)||!finite(dz))return false;if(Math.hypot(dx,dz)>.001){cancelAction(s,'Geste interrompu par le déplacement.');s.transition=null;}return S.move(currentWorld(s),player(s),dx,dz);}
export function fire(s,aim){if(s.paused||s.status!=='active'||player(s).clock>0)return {ok:false};cancelAction(s,'Geste interrompu par le tir.');s.transition=null;const p=player(s),r=S.shoot(currentWorld(s),p,aim);if(r.ok){p.facing=aim.x<p.x?-1:1;p.clock=.16;}return r;}
export function setOrder(s,id,order){
  if(s.paused||s.status!=='active'||!['follow','hold','cover'].includes(order))return {ok:false,reason:'Ordre indisponible'};
  const actors=liveTeam(s).filter(a=>a.kind!=='player'&&(id==='all'||a.id===id));if(!actors.length)return {ok:false,reason:'Personne à portée de liaison'};
  for(const a of actors){const cmd=a.kind==='escort'&&order==='cover'?'hold':order;a.order=cmd;a.waiting=cmd!=='follow';a.anchor=cmd==='follow'?null:{x:a.x,z:a.z};a.route=[];a.routeRevision=-1;}
  s.stats.orders++;s.lastReason=order==='follow'?'Ralliez-vous.':order==='hold'?'Tenez votre position.':'Couvrez les accès. Newt reste à l’abri.';event(s,'order',{id,order});return {ok:true,reason:s.lastReason};
}
function doorAccessible(w,p,d){const target={x:d.x+d.w/2,z:d.z+d.d/2};return S.distance(p,target)<=d.reach&&!S.activeSolids(w).filter(b=>b.id!==d.id).some(b=>S.segmentBox(p,target,b)!==null);}
function threatNear(w,p,range=150){return w.actors.some(a=>a.kind==='enemy'&&a.alive&&S.distance(a,p)<range&&S.visible(w,a,p));}
export function requestTransfer(s,portalId){
  if(s.paused||s.status!=='active')return {ok:false,reason:'Passage indisponible'};
  const exit=exitsFor(s.roomId).find(e=>e.id===portalId),p=player(s),w=currentWorld(s);
  if(!exit||S.distance(p,exit)>60||!S.visible(w,p,exit)||S.trace(w,p,exit,p.radius))return {ok:false,reason:'Approchez du passage'};
  if(s.mode==='inspection')return {ok:false,reason:'Liaisons actives dans l’opération locale. Inspection isolée.'};
  if(threatNear(w,p,155))return {ok:false,reason:'Contact trop proche : dégagez le seuil.'};
  if(s.team.some(a=>a.recruited&&!a.alive))return {ok:false,reason:'Un membre de l’équipe est perdu.'};
  const required=liveTeam(s),left=required.filter(a=>a.kind!=='player'&&(S.distance(a,p)>165||S.trace(w,a,p,a.radius)!==null));
  if(left.length){setOrder(s,'all','follow');s.transition={portalId,waiting:true};s.lastReason='Regroupez '+left.map(a=>a.name).join(', ')+' avant le passage.';return {ok:false,reason:s.lastReason,waiting:true};}
  s.transition={portalId,waiting:false};return transfer(s,exit);
}
function arrivalPositions(w,base,members){
  const candidates=[[0,0],[0,43],[0,-43],[44,0],[-44,0],[44,44],[-44,-44],[0,82],[82,0],[0,-82],[-82,0]];
  const result=[];
  for(const a of members){const point=candidates.map(([dx,dz])=>({x:base.x+dx,z:base.z+dz})).find(p=>S.canStand(w,p,a.radius)&&result.every(r=>S.distance(r,p)>r.radius+a.radius+3)&&w.actors.filter(b=>b.alive&&!members.some(m=>m.id===b.id)).every(b=>S.distance(b,p)>b.radius+a.radius+3));if(!point)return null;result.push({...point,id:a.id,radius:a.radius});}
  return result;
}
function transfer(s,exit){
  const dest=s.worlds[exit.to.room],members=liveTeam(s),positions=arrivalPositions(dest,exit.to.arrival,members);
  if(!positions){s.transition=null;return {ok:false,reason:'Débouché occupé. Le groupe reste ici.'};}
  cancelAction(s,'Changement de pièce.');
  for(const a of members){const p=positions.find(p=>p.id===a.id);Object.assign(a,{roomId:exit.to.room,x:p.x,z:p.z,route:[],routeRevision:-1,order:'follow',waiting:false,anchor:null});}
  const from=s.roomId;s.roomId=exit.to.room;s.transitions++;s.stats.transfers++;s.transition=null;
  if(!s.visitedRooms.includes(s.roomId))s.visitedRooms.push(s.roomId);assemble(s);
  s.lastReason='Équipe arrivée : '+dest.scene.title+'.';event(s,'transfer',{from,to:s.roomId,linkId:exit.linkId});updateObjective(s,0);return {ok:true,changedRoom:true,reason:s.lastReason};
}
export function interact(s){
  if(s.paused||s.status!=='active')return {ok:false,reason:'Action indisponible'};
  if(s.action){cancelAction(s,'Geste annulé.');return {ok:true,reason:s.lastReason};}
  const w=currentWorld(s),p=player(s),newt=s.team.find(a=>a.id==='newt');
  if(s.mode==='operation'&&s.step===4&&s.roomId===extraction.room&&S.distance(p,extraction)<70){
    const absent=s.team.filter(a=>a.recruited&&(!a.alive||a.roomId!==s.roomId||S.distance(a,p)>165||S.trace(w,a,p,a.radius)!==null));
    if(absent.length)return {ok:false,reason:'Toute l’équipe doit rejoindre le point de repli.'};
    if(threatNear(w,p,250))return {ok:false,reason:'Sécurisez le point de repli.'};
    s.status='complete';pause(s,true);event(s,'operation-complete');return {ok:true,complete:true,reason:'Équipe regroupée. Repli confirmé.'};
  }
  if(newt?.alive&&!newt.recruited&&newt.roomId===s.roomId&&S.distance(p,newt)<70&&S.visible(w,p,newt)){
    if(s.mode==='operation'&&s.step<2)return {ok:false,reason:'Rétablissez d’abord le relais pour préparer le repli.'};
    if(w.actors.some(a=>a.kind==='enemy'&&a.alive))return {ok:false,reason:'Sécurisez l’infirmerie avant de la faire sortir.'};
    newt.recruited=true;newt.order='follow';newt.waiting=false;newt.anchor=null;s.flags.newt=true;event(s,'newt-recruited');updateObjective(s,0);return {ok:true,reason:'Newt vous suit. Ne la laissez pas derrière.'};
  }
  const exit=exitsFor(s.roomId).filter(e=>S.distance(e,p)<=60).sort((a,b)=>S.distance(a,p)-S.distance(b,p))[0];if(exit)return requestTransfer(s,exit.id);
  const doors=w.scene.doors.filter(d=>doorAccessible(w,p,d)).sort((a,b)=>S.distance(p,{x:a.x+a.w/2,z:a.z+a.d/2})-S.distance(p,{x:b.x+b.w/2,z:b.z+b.d/2}));
  const controls=(w.scene.controls||[]).filter(c=>S.distance(p,c)<=(c.reach||72)&&S.visible(w,p,c));
  const door=doors[0],control=controls.sort((a,b)=>S.distance(a,p)-S.distance(b,p))[0];
  if(control&&(!door||S.distance(p,control)<S.distance(p,{x:door.x+door.w/2,z:door.z+door.d/2}))){
    w.circuits[control.circuit]=!w.circuits[control.circuit];event(s,'circuit',{room:s.roomId,id:control.circuit,on:w.circuits[control.circuit]});
    if(control.id==='relay-switch'&&w.circuits.network){s.flags.relay=true;updateObjective(s,0);}
    return {ok:true,reason:w.circuits[control.circuit]?'Circuit rétabli.':'Circuit coupé.'};
  }
  if(!door)return {ok:false,reason:'Aucune commande à portée.'};
  if(door.critical)return {ok:false,reason:'Sas extérieur réservé au final natif, non remplacé ici.'};
  if(w.doors[door.id].open)return S.setDoor(w,door.id,false,{actor:p});
  s.action={kind:'open',roomId:s.roomId,id:door.id,elapsed:0,duration:.88,x:p.x,z:p.z,hp:p.hp};return {ok:true,reason:'Ouverture en cours. Restez en position.'};
}
function stepAction(s,dt){const a=s.action;if(!a)return;const p=player(s),w=currentWorld(s),d=w.scene.doors.find(d=>d.id===a.id);
  if(!d||a.roomId!==s.roomId||!p.alive||p.hp<a.hp||S.distance(p,a)>2||!doorAccessible(w,p,d)){cancelAction(s,p.hp<a.hp?'Ouverture interrompue par un impact.':'Ouverture interrompue.');return;}
  a.elapsed+=dt;if(a.elapsed+1e-8>=a.duration){const result=S.setDoor(w,a.id,true,{actor:p});s.action=null;if(result.ok&&result.changed){s.stats.opensCompleted++;event(s,'door-open',{id:a.id,room:s.roomId});}s.lastReason=result.reason||'Passage ouvert.';}
}
function safeGoal(w,a,base){
  for(const [dx,dz] of [[0,0],[-30,0],[0,30],[0,-30],[30,0],[-45,35],[-45,-35]]){const p={x:base.x+dx,z:base.z+dz};if(S.canStand(w,p,a.radius))return p;}return null;
}
function follow(w,a,goal,dt,speed,s){
  if(!goal||!a.alive)return;
  if(a.routeRevision!==w.revision||!a.route?.length||S.distance(a.route.at(-1),goal)>30){a.route=S.planRoute(w,a,goal,a.radius);a.routeRevision=w.revision;}
  while(a.route.length&&S.distance(a,a.route[0])<3)a.route.shift();const next=a.route[0];if(!next)return;
  const d=S.distance(a,next),step=Math.min(d,speed*dt),v={x:(next.x-a.x)/Math.max(1,d)*step,z:(next.z-a.z)/Math.max(1,d)*step};
  const peers=w.actors.filter(b=>b!==a&&b.alive&&b.kind!=='enemy'&&b.role!=='sentry');
  const end={x:a.x+v.x,z:a.z+v.z},blocks=peers.filter(b=>S.distance(b,end)<b.radius+a.radius+3&&S.distance(b,end)<S.distance(b,a)-.01);
  if(blocks.length){
    s.stats.allyBlocks++;const choices=[{x:-v.z,z:v.x},{x:v.z,z:-v.x}];
    for(const c of choices){const q={x:a.x+c.x,z:a.z+c.z};if(!S.trace(w,a,q,a.radius)&&S.canStand(w,q,a.radius)&&peers.every(b=>S.distance(b,q)>b.radius+a.radius+2)){S.move(w,a,c.x,c.z);return;}}return;
  }
  const x=a.x,z=a.z;S.move(w,a,v.x,v.z);if(Math.abs(a.x-x)>.1)a.facing=Math.sign(a.x-x);a.walking=Math.hypot(a.x-x,a.z-z)>.01;
}
function runAI(s,dt){
  const w=currentWorld(s),p=player(s);if(!p.alive)return;
  for(const a of w.actors){if(!a.alive)continue;
    if(a.kind==='enemy'){
      if(a.phase==='windup'||a.phase==='recover')continue;
      const targets=w.actors.filter(t=>t.alive&&['player','ally','escort'].includes(t.kind)&&t.role!=='sentry'&&(t.kind!=='escort'||t.recruited)&&S.distance(a,t)<560).sort((x,y)=>S.distance(a,x)-S.distance(a,y));const t=targets[0];if(!t)continue;
      if(!S.beginAttack(w,a,t))S.followRoute(w,a,t,dt,a.speed||63);continue;
    }
    const isSentry=a.role==='sentry',cover=a.order==='cover';
    if((isSentry||cover)&&a.kind==='ally'){
      const target=w.actors.filter(e=>e.kind==='enemy'&&e.alive&&S.distance(a,e)<(isSentry?590:440)&&S.visible(w,a,e)&&!S.trace(w,a,e,0,{query:'projectile'})).sort((x,y)=>S.distance(a,x)-S.distance(a,y))[0];
      if(target&&a.clock<=0&&a.ammo>0){S.shoot(w,a,target,{damage:isSentry?18:20,range:isSentry?600:460});a.clock=isSentry?.30:.48;a.facing=Math.sign(target.x-a.x)||1;s.stats.allyShots++;}
      continue;
    }
    if(['ally','escort'].includes(a.kind)&&!isSentry&&a.recruited&&a.order==='follow'){
      const index=liveTeam(s).filter(a=>a.kind!=='player').indexOf(a),dir=p.facing||1;
      const base={x:p.x-dir*(58+index*38),z:p.z+(index%2?29:-29)};let goal=safeGoal(w,a,base);
      // Near portals the player can stand at an extreme z: select a safe point
      // near their real feet rather than an unreachable formation slot.
      if(!goal)goal=safeGoal(w,a,{x:p.x-dir*60,z:p.z});
      if(goal&&S.distance(a,goal)>14)follow(w,a,goal,dt,a.speed||139,s);else a.walking=false;
    }
  }
}
function updateObjective(s,dt){if(s.mode!=='operation'||s.status!=='active')return;
  const w=currentWorld(s),newt=s.team.find(a=>a.id==='newt');
  if(s.team.some(a=>a.recruited&&!a.alive)||!newt.alive){s.status='failed';pause(s,true);event(s,'operation-failed',{reason:!newt.alive?'Newt est perdue.':'Un membre de l’équipe est perdu.'});return;}
  const before=s.step;
  if(s.step===0&&s.roomId==='v107-operations')s.step=1;
  else if(s.step===1&&s.flags.relay)s.step=2;
  else if(s.step===2&&newt.recruited)s.step=3;
  else if(s.step===3&&s.roomId==='v106-sentry'&&newt.roomId===s.roomId&&newt.alive&&w.doors['defense-gate'].open){
    s.defenseTime=Math.min(10,s.defenseTime+dt);if(s.defenseTime>=10&&w.actors.every(a=>a.kind!=='enemy'||!a.alive)){s.flags.defense=true;s.step=4;}
  }
  if(before!==s.step){s.lastReason=OBJECTIVES[s.step]?.title||'Repli confirmé.';event(s,'objective',{step:s.step,id:OBJECTIVES[s.step]?.id});}
}
export function advance(s,delta,{ai=true}={}){
  if(s.paused||s.status!=='active'||!finite(delta)||delta<=0)return;
  let remaining=Math.min(.25,delta);
  while(remaining>1e-8){const dt=Math.min(.025,remaining);remaining-=dt;s.elapsed+=dt;const w=currentWorld(s);
    S.tick(w,dt,{ai:false});if(ai)runAI(s,dt);stepAction(s,dt);updateObjective(s,dt);
    if(s.transition?.waiting){const exit=exitsFor(s.roomId).find(e=>e.id===s.transition.portalId);if(!exit||S.distance(player(s),exit)>65)s.transition=null;else{
      const p=player(s),ready=liveTeam(s).every(a=>S.distance(a,p)<=165&&!S.trace(w,a,p,a.radius));if(ready&&!threatNear(w,p,155))transfer(s,exit);
    }}
    if(s.status!=='active')break;
    if(w.events.length>60)w.events=w.events.slice(-60);
  }
}
function localWorld(s,w){return {...w,actors:w.actors.filter(a=>!TEAM.some(t=>t.id===a.id))};}
export function exportSession(s){return {schema:SCHEMA,contract:CONTRACT,mode:s.mode,roomId:s.roomId,elapsed:s.elapsed,status:s.status,step:s.step,flags:clone(s.flags),defenseTime:s.defenseTime,visitedRooms:[...s.visitedRooms],transitions:s.transitions,stats:clone(s.stats),
  worlds:Object.fromEntries(Object.values(s.worlds).map(w=>[w.scene.id,S.exportState(localWorld(s,w))])),
  team:s.team.map(({id,x,z,roomId,hp,ammo,alive,invulnerable,phase,clock,aim,order,anchor,facing,recruited})=>({id,x,z,roomId,hp,ammo,alive,invulnerable,phase,clock,aim:clone(aim),order,anchor:clone(anchor),facing,recruited})),
  action:clone(s.action),transition:clone(s.transition)};}
function validateRaw(raw){
  const fail=reason=>({ok:false,reason});
  if(!keysOnly(raw,['schema','contract','mode','roomId','elapsed','status','step','flags','defenseTime','visitedRooms','transitions','stats','worlds','team','action','transition'])||raw.schema!==SCHEMA||raw.contract!==CONTRACT)return fail('Contrat de sauvegarde incompatible');
  if(!['operation','inspection'].includes(raw.mode)||!roomById(raw.roomId)||!['active','failed','complete'].includes(raw.status)||!finite(raw.elapsed)||raw.elapsed<0||raw.elapsed>1e7||!Number.isInteger(raw.step)||raw.step<0||raw.step>4||!finite(raw.defenseTime)||raw.defenseTime<0||raw.defenseTime>10)return fail('Progression invalide');
  if(raw.mode==='operation'&&!OPERATION_ROOMS.includes(raw.roomId)||raw.mode==='inspection'&&(raw.step!==0||raw.status==='complete'))return fail('Mode et parcours incohérents');
  if(!keysOnly(raw.flags,['relay','newt','defense'])||Object.keys(raw.flags).length!==3||Object.values(raw.flags).some(v=>typeof v!=='boolean'))return fail('Drapeaux invalides');
  if(!Array.isArray(raw.visitedRooms)||!raw.visitedRooms.includes(raw.roomId)||new Set(raw.visitedRooms).size!==raw.visitedRooms.length||raw.visitedRooms.some(r=>!roomById(r))||!Number.isInteger(raw.transitions)||raw.transitions<0||raw.transitions>1000000)return fail('Historique invalide');
  if(!keysOnly(raw.stats,['opensCompleted','opensCancelled','transfers','orders','allyShots','allyBlocks'])||Object.keys(raw.stats).length!==6||Object.values(raw.stats).some(v=>!Number.isInteger(v)||v<0||v>1e9)||raw.stats.transfers!==raw.transitions)return fail('Télémétrie invalide');
  if(!record(raw.worlds)||Object.keys(raw.worlds).length!==ROOMS.length)return fail('Registre de salles invalide');
  const next=createSession({mode:raw.mode,roomId:raw.roomId});
  for(const def of ROOMS){const w=S.createWorld(def),value=clone(raw.worlds[def.id]),externalAims=[];
    // Room snapshots exclude the shared team ledger. Validate external attack
    // targets separately after the team has been checked, then restore IDs.
    for(const a of value?.actors||[])if(a.phase==='windup'&&TEAM.some(t=>t.id===a.aim?.targetId)){externalAims.push([a.id,clone(a.aim)]);a.aim.targetId=a.id;}
    const result=S.importState(w,value);if(!result.ok)return fail(def.title+' : '+result.reason);
    for(const [id,aim] of externalAims)w.actors.find(a=>a.id===id).aim=aim;
    next.worlds[def.id]=w;
  }
  if(!Array.isArray(raw.team)||raw.team.length!==TEAM.length)return fail('Équipe incomplète');const seen=new Set();
  for(const a of raw.team){
    if(!keysOnly(a,['id','x','z','roomId','hp','ammo','alive','invulnerable','phase','clock','aim','order','anchor','facing','recruited']))return fail('Propriété équipe inconnue');
    const t=next.team.find(t=>t.id===a.id);if(!t||seen.has(a.id))return fail('Identité équipe invalide');seen.add(a.id);
    if(![a.x,a.z,a.hp,a.ammo,a.invulnerable,a.clock].every(finite)||a.hp<0||a.hp>100||a.ammo<0||a.ammo>999||!Number.isInteger(a.ammo)||a.invulnerable<0||a.invulnerable>2||a.clock<0||a.clock>10||typeof a.alive!=='boolean'||a.alive!==(a.hp>0)||typeof a.recruited!=='boolean'||![-1,1].includes(a.facing))return fail('Ressources équipe invalides');
    if(!['idle','recover','dead'].includes(a.phase)||a.alive===(a.phase==='dead')||a.aim!==null||!['follow','hold','cover'].includes(a.order)||t.kind==='escort'&&(a.order==='cover'||a.ammo!==0))return fail('Ordre ou rôle invalide');
    if(a.roomId!==null&&!roomById(a.roomId)||a.roomId!==null&&!S.canStand(next.worlds[a.roomId],a,t.radius))return fail('Position équipe obstruée');
    if(a.anchor!==null&&(!keysOnly(a.anchor,['x','z'])||![a.anchor.x,a.anchor.z].every(finite)||a.roomId===null||!S.canStand(next.worlds[a.roomId],a.anchor,t.radius)))return fail('Point de garde invalide');
    if(a.order==='follow'&&a.anchor!==null||a.order!=='follow'&&a.anchor===null)return fail('Ordre et ancrage incohérents');
    Object.assign(t,clone(a),{waiting:a.order!=='follow',route:[],routeRevision:-1});
  }
  if(next.team[0].roomId!==raw.roomId)return fail('Joueur absent du lieu actif');
  for(const w of Object.values(next.worlds))for(const a of w.actors)if(a.phase==='windup'&&TEAM.some(t=>t.id===a.aim?.targetId)&&!next.team.some(t=>t.id===a.aim.targetId&&t.roomId===w.scene.id))return fail('Cible engagée dans un autre lieu');
  if(raw.mode==='operation'){
    if(next.team.filter(a=>a.recruited).some(a=>a.roomId!==raw.roomId))return fail('Équipe répartie illégalement');
    if(raw.step>=2&&!raw.flags.relay||raw.step>=3&&(!raw.flags.newt||!next.team.find(a=>a.id==='newt').recruited)||raw.step>=4&&(!raw.flags.defense||raw.defenseTime<10))return fail('Objectifs incohérents');
    if(raw.flags.newt!==next.team.find(a=>a.id==='newt').recruited)return fail('Escorte incohérente');
    if(raw.status==='complete'&&(raw.step!==4||raw.roomId!==extraction.room||next.team.some(a=>!a.alive||S.distance(a,extraction)>245)))return fail('Repli invalide');
  }
  Object.assign(next,{mode:raw.mode,roomId:raw.roomId,elapsed:raw.elapsed,status:raw.status,step:raw.step,flags:clone(raw.flags),defenseTime:raw.defenseTime,visitedRooms:clone(raw.visitedRooms),transitions:raw.transitions,stats:clone(raw.stats),events:[],paused:true,action:null,transition:null});assemble(next);
  if(raw.action!==null){const a=raw.action,w=currentWorld(next),p=player(next),d=w.scene.doors.find(d=>d.id===a?.id);
    if(!keysOnly(a,['kind','roomId','id','elapsed','duration','x','z','hp'])||a.kind!=='open'||a.roomId!==raw.roomId||!d||d.critical||w.doors[d.id].open||![a.elapsed,a.duration,a.x,a.z,a.hp].every(finite)||a.duration!==.88||a.elapsed<0||a.elapsed>=a.duration||S.distance(p,a)>2||a.hp!==p.hp||!doorAccessible(w,p,d))return fail('Ouverture sauvegardée invalide');next.action=clone(a);
  }
  if(raw.transition!==null){if(!keysOnly(raw.transition,['portalId','waiting'])||raw.transition.waiting!==true||raw.mode!=='operation'||!exitsFor(raw.roomId).some(e=>e.id===raw.transition.portalId&&S.distance(player(next),e)<=65))return fail('Passage sauvegardé invalide');next.transition=clone(raw.transition);}
  next.checkpoint=exportSession(next);return {ok:true,session:next};
}
export function importSession(raw){try{return validateRaw(raw);}catch(error){return {ok:false,reason:'Sauvegarde invalide : '+error.message};}}
export function checkpoint(s){s.checkpoint=exportSession(s);return clone(s.checkpoint);}
export function restart(s){return importSession(s.checkpoint);}
/* Old V106 inspection imports are accepted as inspections only, after the
   original validator checks the original geometry. Never grant operation tasks. */
export function importV106(raw){try{
  const original=VALIDATION_SCENES.find(r=>r.id===raw?.roomId);if(!original)return {ok:false,reason:'Secteur V106 inconnu'};
  const old=S.createWorld(original),verdict=S.importState(old,raw);if(!verdict.ok)return verdict;
  const s=createSession({mode:'inspection',roomId:original.id}),w=currentWorld(s);
  for(const t of s.team){const saved=old.actors.find(a=>a.id===t.id);t.roomId=saved?original.id:null;if(saved)Object.assign(t,{x:saved.x,z:saved.z,hp:saved.hp,ammo:saved.ammo,alive:saved.alive,phase:saved.phase,clock:saved.clock,aim:clone(saved.aim),invulnerable:saved.invulnerable,order:saved.waiting?'hold':'follow',anchor:saved.waiting?{x:saved.x,z:saved.z}:null,waiting:saved.waiting,recruited:true});}
  w.doors=clone(old.doors);w.circuits=clone(old.circuits);w.time=old.time;w.visited=clone(old.visited);w.stats=clone(old.stats);
  for(const a of w.actors.filter(a=>!TEAM.some(t=>t.id===a.id))){const saved=old.actors.find(x=>x.id===a.id);Object.assign(a,clone(saved),{route:[],routeRevision:-1});}
  s.elapsed=old.time;pause(s,true);s.checkpoint=exportSession(s);return {ok:true,session:s,migrated:true};
}catch(error){return {ok:false,reason:error.message};}}
