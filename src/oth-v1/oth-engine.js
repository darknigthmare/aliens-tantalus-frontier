import { DATA } from './oth-data.js';
export const ROOM = Object.fromEntries(DATA.rooms.map(r=>[r.id,r]));
export const PROP = Object.fromEntries(DATA.props.map(p=>[p.id,p]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const clone=v=>JSON.parse(JSON.stringify(v));
export function createState(difficulty='normal'){
 return {schema:10,gear:{selected:"torch",unlocked:["torch"],collected:[],charges:0,nets:0,acid:0},weaponPressDone:false,weaponCooldown:0,weaponShot:null,acidCooldown:0,handling:{positions:{},observed:[],grip:null,travelled:0,blocked:null},gripPressDone:false,gripMoved:false,gripNoise:0,presentation:{enabled:true,autoAdvance:false,captionScale:1,seen:[],pending:[]},excursion:{done:[],pumpElapsed:0,recorder:null,discovered:false,tracked:true},excursionHold:0,excursionTarget:null,excursionPressDone:false,excursionNoise:0,maintenance:{parts:0,salvaged:[],repairs:{},observed:[],seen:[],crafted:{},tracked:null},maintenanceTarget:null,maintenanceHold:0,maintenanceNoise:0,maintenancePressDone:false,soundField:[],soundLog:[],soundSeq:0,acousticTimers:{},lures:[],residue:{},listening:false,listenHeld:0,decoyPressDone:false,doors:{},lightsOff:[],machines:{},doorHold:0,doorAction:null,doorPressDone:false,servicePressDone:false,companion:null,discoveredPortals:[],metrics:{cartGrips:0,dodged:0,attacks:0,companionPassages:0,trailsStarted:0,pursuitPassages:0,bulkheadsClosed:0,bulkheadsBreached:0,machinesStarted:0,soundInvestigations:0,decoysInspected:0,decoysIgnored:0,companionAlerts:0},reducedMotion:false,contrast:false,records:[],collected:[],disabledHazards:[],conversations:[],work:{},reading:null,story:null,hazardCooldown:0,chapter:0,goal:0,room:'bridge',player:{x:170,y:88,hp:100,fuel:65,decoys:8,kits:3,face:1,crouch:false},
 difficulty:['normal','assisted'].includes(difficulty)?difficulty:'normal',visited:['bridge'],completed:[],world:{},flags:{},journal:[],elapsed:0,finished:false,dead:false,
 flash:true,sound:false,hold:0,portalCooldown:0,invuln:0,flame:0,torchCooldown:0,decoyCooldown:0,healCooldown:0,noise:0,dirty:true,notice:'Le relais de la mine ne répond plus.',noticeTime:7,puzzle:null,shake:0};
}
export function currentObjective(s){return s.finished?null:DATA.chapters[s.chapter]?.objectives[s.goal]||null;}
export function activeEdges(s,includeSealed=false){return DATA.edges.filter(e=>s.chapter>=e.minChapter&&!e.blockedChapters?.includes(s.chapter)&&!(s.flags.narcissusReleased&&(e.a==='narcissus'||e.b==='narcissus'))&&(!e.requiresRepair||maintenanceStatus(s,e.requiresRepair).done)&&(!e.requiresDrain||excursionStatus(s).drained)&&(includeSealed||!doorStatus(s,e.id).sealed));}
export function route(s,target){
 if(s.room===target)return [];
 const adj=activeEdges(s),q=[[s.room,[]]],seen=new Set([s.room]);
 while(q.length){const [at,path]=q.shift();for(const e of adj){const next=e.a===at?e.b:e.b===at?e.a:null;if(!next||seen.has(next))continue;const np=[...path,{room:next,edge:e.id}];if(next===target)return np;seen.add(next);q.push([next,np]);}}
 return null;
}
export function roomWorld(s,id=s.room){
 const r=ROOM[id];if(!r)throw new Error('Unknown room');
 if(!s.world[id])s.world[id]={enemies:[],eggs:{},cleared:false,visitTime:s.elapsed,spawned:false};
 const w=s.world[id];
 const risky=['boarding','haul','pump','vein','vestibule','fossils','eggs','bypass','hold','exchanger'];
 const eligible=(id==='boarding'?s.chapter>=4&&s.chapter<=4:id==='hold'?s.chapter===12:s.chapter>=7&&s.chapter<=10)&&risky.includes(id);
 if(eligible&&!w.spawned&&!w.cleared){
  const sx=(id===s.room&&s.player.x>r.width/2)?180:r.width-180;
  w.spawned=true;w.enemies.push({id:id+':adult',type:'adult',hp:120,netted:0,x:sx,y:r.mode==='profile'?88:110,home:sx,state:'patrol',targetX:r.width-360,targetY:110,stun:0,cool:0,search:0,dir:-1});
 }
 return w;
}
function rect(p){const def=PROP[p.type];return {x:p.x-def.width*.5,w:def.width,y:p.y-18,h:36};}
export function obstacleRects(r){return [...r.props.filter(p=>p.solid).map(rect),...(r.walls||[])];}
export function lineBlocked(r,x1,y1,x2,y2){
 for(const q of obstacleRects(r)){const n=Math.max(2,Math.ceil(Math.hypot(x2-x1,y2-y1)/14));for(let i=1;i<n;i++){const x=x1+(x2-x1)*i/n,y=y1+(y2-y1)*i/n;if(x>q.x&&x<q.x+q.w&&y>q.y&&y<q.y+q.h)return true;}}
 return false;
}
export function collision(r,x,y,radius=12){
 if(x<28||x>r.width-28||y<0||y>180)return true;
 return obstacleRects(r).some(q=>{return x+radius>q.x&&x-radius<q.x+q.w&&y+radius*.5>q.y&&y-radius*.5<q.y+q.h;});
}
function move(r,p,dx,dy){
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/8));
 for(let i=0;i<steps;i++){
  const nx=clamp(p.x+dx/steps,28,r.width-28);if(!collision(r,nx,p.y,12))p.x=nx;
  const ny=r.mode==='profile'?88:clamp(p.y+dy/steps,0,180);if(!collision(r,p.x,ny,12))p.y=ny;
 }
}
export function notice(s,text,time=5){s.notice=text;s.noticeTime=time;}
export function nearby(s){
 const r=ROOM[s.room],p=s.player,o=currentObjective(s);
 const dropped=s.excursion?.recorder;if(dropped&&!dropped.carried&&dropped.room===s.room&&Math.hypot(p.x-dropped.x,(p.y-dropped.y)*1.2)<66)return {kind:'recorder',item:{...dropped,title:'Reprendre l’enregistreur'},node:dropped};
 if(o?.room===s.room){const node=r.nodes.find(n=>n.id===o.node);if(Math.abs(p.x-node.x)<72&&Math.abs(p.y-node.y)<52)return {kind:'objective',item:o,node};}
 let best=null,bestD=72;
 for(const a of DATA.interactables||[]){if(a.room!==s.room||a.kind==='armament'&&(s.chapter<(a.minChapter||0)||s.gear.collected.includes(a.id))||a.kind==='excursion'&&s.excursion.done.includes(a.operation)||a.kind==='salvage'&&s.maintenance.salvaged.includes(a.id)||s.collected.includes(a.id)||s.records.includes(a.id)||a.kind==='valve'&&s.disabledHazards.includes(a.hazard))continue;const d=Math.hypot(p.x-a.x,(p.y-a.y)*1.2);if(d<bestD){bestD=d;best={kind:'activity',item:a,node:a};}}
 for(const npc of crewInRoom(s)){const d=Math.hypot(p.x-npc.x,(p.y-npc.y)*1.2);if(d<bestD){bestD=d;best={kind:'crew',item:npc,node:npc};}}

 for(const portal of r.portals){const d=Math.hypot(p.x-portal.x,(p.y-portal.y)*1.2);if(d<80&&d<bestD){bestD=d;best={kind:'portal',item:portal,locked:!activeEdges(s).some(e=>e.id===portal.edge)};}}
 return best;
}
export function transition(s,portal){
 const r=ROOM[s.room];if(!r.portals.some(p=>p.id===portal.id))return false;
 if(!activeEdges(s).some(e=>e.id===portal.edge)){const job=DATA.maintenance.repairs.find(j=>j.edge===portal.edge);notice(s,DATA.edges.find(e=>e.id===portal.edge)?.requiresDrain&&!excursionStatus(s).drained?'Le contact de niveau maintient cette traverse fermée. Videz le caniveau par les pompes.':job&&!maintenanceStatus(s,job.id).done?'Passage hors service. Maintenez E au seuil pour intervenir.':'Ce passage n’est pas disponible. Consultez le plan.');return false;}
 releaseCart(s);const target=roomGeometry(s,portal.target),back=target.portals.find(p=>p.edge===portal.edge);
 if(!back)return false;
 const follower=syncCompanion(s);
 if(follower?.mode==='follow'&&follower.room===s.room&&Math.hypot(follower.x-s.player.x,follower.y-s.player.y)>240){notice(s,'Attendez '+follower.name+' au seuil, ou donnez-lui l’ordre de rester.');return false;}
 const joins=follower?.mode==='follow'&&follower.room===s.room;
 markExitTrail(s,portal);
 s.player.hidden=null;s.listening=false;s.listenHeld=0;s.decoy=null;s.room=target.id;s.player.x=clamp(back.x+(back.x>target.width/2?-100:100),30,target.width-30);s.player.y=target.mode==='profile'?88:clamp(back.y+((back.y<30)?70:0),0,180);
 if(collision(target,s.player.x,s.player.y)){s.player.y=88;}if(collision(target,s.player.x,s.player.y)){const free=nearestFreePoint(target,s.player);s.player.x=free.x;s.player.y=free.y;}
 if(joins){follower.room=s.room;follower.x=s.player.x+(back.x>target.width/2?30:-30);follower.y=s.player.y;follower.path=[];follower.pathTimer=0;s.metrics.companionPassages++;}
 s.excursionHold=0;s.excursionTarget=null;s.maintenanceHold=0;s.maintenanceTarget=null;s.portalCooldown=.8;s.hold=0;s.doorHold=0;s.doorAction=null;s.invuln=2.2;
 if(!s.visited.includes(s.room))s.visited.push(s.room);
 roomWorld(s);s.dirty=true;
 const t=portal.kind==='lift'?'La cage rejoint '+target.name+'.':portal.kind==='shuttle'?'Transfert vers '+target.name+'.':target.name;
 notice(s,t,3);return true;
}
export function getPuzzle(s){
 const o=currentObjective(s);if(!o)return null;
 if(DATA.workOrders?.[o.id])return prepareWork(s,o.id);
 if(o.action==='purge')return {title:'Séparer avant de purger',prompt:'Le réseau de bord peut réinjecter une copie. Quelle ligne faut-il fermer ?',choices:[{id:'life',text:'Support vital'},{id:'network',text:'Liaison du réseau de bord'},{id:'drive',text:'Alimentation des propulseurs'}],correct:'network'};
 if(o.id==='oth-c14-o3')return {title:'Commande médicale',prompt:'L’unité doit garder son alimentation, sans accepter les ordres distants.',choices:[{id:'life',text:'Couper le support vital'},{id:'network',text:'Isoler la commande distante'},{id:'all',text:'Couper toute l’infirmerie'}],correct:'network'};
 if(o.id==='oth-c12-o1')return {title:'Réserves de la concession',prompt:'Le berceau de retour doit rester intact.',choices:[{id:'return',text:'Décharger le berceau de retour'},{id:'reserve',text:'Isoler la réserve du site'},{id:'all',text:'Relier tous les berceaux'}],correct:'reserve'};
 return {title:'Distribution locale',prompt:'La ligne de commande est compromise. Le secours doit rester indépendant.',choices:[{id:'network',text:'Suivre l’ordre du réseau'},{id:'backup',text:'Basculer sur le secours local'},{id:'off',text:'Couper toutes les lignes'}],correct:'backup'};
}
export function resolvePuzzle(s,choice){
 if(!s.puzzle)return false;
 if(s.puzzle.type)return manipulateWork(s,choice);
 const p=getPuzzle(s);
 if(choice!==p.correct){s.noise=1;notice(s,'Le contacteur claque. La mauvaise ligne reste ouverte.');s.puzzle=null;s.hold=0;const w=roomWorld(s);w.enemies.forEach(e=>{e.state='investigate';e.targetX=s.player.x;e.targetY=s.player.y;e.search=4;});return false;}
 s.puzzle=null;completeObjective(s);return true;
}
export function completeObjective(s){
 const o=currentObjective(s);if(!o)return false;
 if((o.action==='install')&&!s.flags.cellCarried&&!s.flags.cellSecured){notice(s,'La cellule de retour manque encore.');return false;}
 if(s.completed.includes(o.id))return false;
 s.completed.push(o.id);s.journal.push({chapter:s.chapter,text:o.after});notice(s,o.after,6);
 if(o.action==='carry'){s.flags.cellCarried=true;}
 if(o.action==='install'){s.flags.cellCarried=false;s.flags.cellSecured=true;}
 if(o.id==='oth-c04-o1'){s.flags.torchReady=true;s.player.fuel=100;}
 if(o.id==='oth-c03-o3'||o.id==='oth-c08-o2'){s.player.hp=Math.min(100,s.player.hp+40);s.player.decoys=Math.min(12,s.player.decoys+3);s.player.kits=Math.min(5,s.player.kits+1);}
 if(o.id==='oth-c05-o2'||o.id==='oth-c13-o3'){const w=roomWorld(s);w.cleared=true;w.enemies=[];}
 if(o.id==='oth-c07-o2'){s.flags.liftBroken=true;notice(s,'Le puits principal est endommagé. Il faudra trouver une autre cage.',7);}
 if(o.action==='purge')s.flags.ashPurged=true;
 if(o.id==='oth-c14-o3')s.flags.carryRipley=true;
 if(o.id==='oth-c15-o1'){s.flags.carryRipley=false;s.flags.ripleyStasis=true;}
 const ev=DATA.storyEvents?.find(e=>e.at===s.completed.length);if(ev){s.story={id:ev.id,time:8};s.journal.push({chapter:s.chapter,text:ev.speaker+' — '+ev.text});s.shake=['blast','impact','lift'].includes(ev.effect)?.2:0;}
 if(o.action==='release'){s.flags.narcissusReleased=true;}
 s.hold=0;s.goal++;
 if(s.goal===3){s.goal=0;s.chapter++;if(s.chapter===DATA.chapters.length){s.chapter=DATA.chapters.length-1;s.goal=2;s.finished=true;notice(s,'Transmission émise. Aucune réponse, pour l’instant.',20);}else{roomWorld(s);}}
 const sequence=DATA.sequences.find(q=>q.at===s.completed.length);if(sequence&&!s.presentation.seen.includes(sequence.id)&&!s.presentation.pending.includes(sequence.id))s.presentation.pending.push(sequence.id);
 syncCompanion(s);s.dirty=true;return true;
}
function useTorch(s){
 if(s.torchCooldown>0)return;
 if(!s.flags.torchReady){notice(s,'Le chalumeau doit d’abord être préparé à l’atelier.');s.torchCooldown=.8;return;}
 if(s.player.fuel<9){notice(s,'Réservoir insuffisant. Gardez vos distances.');s.torchCooldown=.8;return;}
 if(friendlyBlocks(s,250)){notice(s,'Équipier dans l’axe : pas de flamme.');s.torchCooldown=.6;return;}
 s.player.fuel-=9;emitSound(s,'torch',s.player.x,s.player.y,.95);addResidue(s,s.room,'scorch',clamp(s.player.x+s.player.face*80,30,ROOM[s.room].width-30),s.player.y);s.flame=.45;s.torchCooldown=.9;s.noise=1;
 const r=roomGeometry(s);for(const e of [...roomWorld(s).enemies]){if((e.x-s.player.x)*s.player.face>=0&&Math.abs(e.x-s.player.x)<250&&Math.abs(e.y-s.player.y)<65&&!lineBlocked(r,s.player.x,s.player.y,e.x,e.y)){damageEnemy(s,e,24,'torch');e.netted=0;e.stun=2.4;e.attack=0;e.state='recoil';e.targetX=clamp(e.x+s.player.face*200,40,r.width-40);}}
}
export function dropDecoy(s,free=false){
 if(s.decoyCooldown>0||s.dead||s.finished)return false;
 if(!free&&s.player.decoys<=0){notice(s,'Plus de leurres disponibles.');s.decoyCooldown=.7;return false;}
 const r=roomGeometry(s),p=s.player;let x=p.x;
 for(let i=8;i<=224;i+=8){const nx=clamp(p.x+p.face*i,30,r.width-30);if(collision(r,nx,p.y,8))break;x=nx;}
 if(Math.abs(x-p.x)<24){notice(s,'Pas assez de place pour lancer le boîtier.');return false;}
 if(!free)s.player.decoys--;
 const a={id:'lure-'+(++s.soundSeq),room:s.room,x,y:p.y,time:5,pulse:2};
 s.lures.push(a);if(s.lures.length>DATA.acoustics.maxLures){const old=s.lures.shift();addResidue(s,old.room,'decoy',old.x,old.y);}
 s.decoy=a;s.decoyCooldown=1.5;s.dirty=true;emitSound(s,'decoy',x,p.y,1,s.room);return true;
}
export function step(s,input={},delta=1/60){
 const dt=clamp(delta,0,.06);if(!dt||s.finished||s.dead||s.puzzle||s.reading)return s;
 const hpBefore=s.player.hp;
 s.excursionNoise=Math.max(0,s.excursionNoise-dt);if(!input.interact)s.excursionPressDone=false;
 s.maintenanceNoise=Math.max(0,s.maintenanceNoise-dt);if(!input.interact)s.maintenancePressDone=false;
 s.elapsed+=dt;tickCombat(s,dt);if(s.story){s.story.time-=dt;if(s.story.time<=0)s.story=null;}for(const k of ['hazardCooldown','portalCooldown','invuln','torchCooldown','decoyCooldown','healCooldown','flame','noticeTime','shake'])s[k]=Math.max(0,(s[k]||0)-dt);
 tickExcursion(s,dt);tickServices(s,dt);tickAcoustics(s,dt);updatePursuit(s,dt);
 let r=roomGeometry(s);const p=s.player,w=roomWorld(s);
 s.listening=!!input.listen;s.listenHeld=s.listening?s.listenHeld+dt:0;
 if(s.listening)input={listen:true,crouch:input.crouch,grab:input.grab};
 if(input.x||input.y||input.fire||input.decoy)p.hidden=null;
 p.crouch=Boolean(input.crouch||p.hidden);discoverRoom(s);observeMaintenance(s);observeHandling(s);updateCompanion(s,dt);
 let dx=clamp(input.x,-1,1),dy=r.mode==='profile'?0:clamp(input.y,-1,1),len=Math.hypot(dx,dy);if(len>1){dx/=len;dy/=len;}
 const handled=stepCart(s,input,dt);r=roomGeometry(s);if(handled.active)input={...input,interact:false,bulkhead:false,fire:false,decoy:false,heal:false};
 const running=!handled.active&&input.sprint&&!p.crouch&&!s.flags.cellCarried&&!s.flags.carryRipley&&!s.excursion.recorder?.carried;
 const wet=floodAt(s,s.room,p.x,p.y);
 const speed=(s.listening?0:s.flags.carryRipley?86:p.crouch?78:s.flags.cellCarried?108:s.excursion.recorder?.carried?118:running?238:158)*(wet>.08?.62:1);
 if(dx&&!handled.active)p.face=dx>0?1:-1;
 if(!handled.active)move(r,p,dx*speed*dt,dy*speed*.7*dt);
 const moving=handled.active?handled.moved:!!(dx||dy);
 if(!input.bulkhead)s.doorPressDone=false;if(!input.interact)s.servicePressDone=false;
 if(input.bulkhead&&!s.doorPressDone&&!moving&&!s.flags.carryRipley){const bp=nearestBulkhead(s);if(bp){if(s.doorAction!==bp.edge){s.doorHold=0;s.doorAction=bp.edge;}s.doorHold+=dt;if(s.doorHold>=(doorStatus(s,bp.edge).sealed?.35:.85)&&s.portalCooldown<=0){toggleBulkhead(s,bp.edge);s.doorPressDone=true;s.doorHold=0;s.portalCooldown=.8;}}}else{s.doorHold=0;s.doorAction=null;}
 s.noise=Math.max(0,s.noise-dt*1.3);if(moving)s.noise=Math.max(s.noise,running?.9:p.crouch?.08:.3);
 if(!input.fire)s.weaponPressDone=false;
 if(input.fire&&!s.flags.carryRipley)useEquipped(s);
 for(const h of activeHazards(s)){if(h.active&&Math.abs(p.x-h.x)<h.width/2&&Math.abs(p.y-h.y)<30&&s.hazardCooldown<=0&&s.invuln<=0){p.hp-=s.difficulty==='assisted'?3:7;s.hazardCooldown=1.5;s.hold=0;s.dirty=true;notice(s,'Vapeur sous pression. Attendez la détente ou fermez la dérivation.');if(p.hp<=0){p.hp=0;s.dead=true;}}}
 if(!input.decoy)s.decoyPressDone=false;
 if(input.decoy&&!s.decoyPressDone){dropDecoy(s);s.decoyPressDone=true;}
 if(input.heal&&s.healCooldown<=0){if(p.kits>0&&p.hp<100){p.kits--;p.hp=Math.min(100,p.hp+45);notice(s,'Pansement appliqué.');s.dirty=true;}s.healCooldown=1;}
 if(moving&&wet>.08&&(s.acousticTimers.splash||0)<=0){s.acousticTimers.splash=1.6;s.noise=Math.max(s.noise,.76);emitSound(s,'steps',p.x,p.y,.82);}
 if(moving&&running&&(s.acousticTimers.steps||0)<=0){s.acousticTimers.steps=1.6;emitSound(s,'steps',p.x,p.y,.72);}
 // Eggs stay tied to their actual placement; one hatch, with a readable delay.
 for(const prop of r.props.filter(p=>p.type==='egg')){
  const distance=Math.hypot(prop.x-p.x,(prop.y-p.y)*1.5),egg=w.eggs[prop.id]||{state:'dormant',time:0};
  if(egg.state==='dormant'&&distance<90){egg.state='opening';egg.time=1.5;notice(s,'La membrane de l’œuf bouge. Reculez.');}
  if(egg.state==='opening'){egg.time-=dt;if(egg.time<=0){egg.state='open';w.enemies.push({id:prop.id+':hugger',type:'hugger',x:prop.x,y:prop.y,state:'hunt',targetX:p.x,targetY:p.y,stun:0,cool:0,search:0,dir:1,home:prop.x});s.dirty=true;}}
  w.eggs[prop.id]=egg;
 }
 for(const e of w.enemies){
  if(e.passage)continue;
  e.cool=Math.max(0,e.cool-dt);e.stun=Math.max(0,e.stun-dt);e.netted=Math.max(0,(e.netted||0)-dt);e.search=Math.max(0,e.search-dt);
  let dist=Math.hypot(e.x-p.x,(e.y-p.y)*1.5);
  if(p.hidden&&dist<58&&e.stun<=0){e.sniff=(e.sniff||0)+dt;if(e.sniff>1.6){p.hidden=null;s.invuln=Math.max(s.invuln,.3);e.sniff=0;notice(s,'Elle inspecte le renfoncement. Sortez !',2);}}else e.sniff=0;
  if(e.stun>0){e.attack=0;e.state=e.netted>0?'netted':'recoil';if(!e.netted)move(r,e,Math.sign(e.targetX-e.x)*60*dt,0);continue;}
  if(e.attack>0){
   e.attack=Math.max(0,e.attack-dt);e.state='windup';
   if(e.attack===0){
    const range=e.type==='hugger'?48:65;
    if(dist<range&&s.invuln<=0&&!p.hidden&&!lineBlocked(r,e.x,e.y,p.x,p.y)){
     p.hp-=s.difficulty==='assisted'?10:22;s.invuln=1.8;s.hold=0;s.shake=.18;s.metrics.attacks++;notice(s,'Contact ! Rompez la ligne de vue.',3);s.dirty=true;
     if(p.hp<=0){p.hp=0;s.dead=true;}
    }else s.metrics.dodged++;
    e.cool=1.4;e.state='recover';
   }
   continue;
  }
  const range=detectionRange(s);
  const canSee=!p.hidden&&dist<range&&Math.abs(e.y-p.y)<110&&!lineBlocked(r,e.x,e.y,p.x,p.y);
  const machine=machineAttractor(s,e,canSee,dist);
  if(decoyAttractor(s,e,canSee)){e.state='investigate';e.targetX=s.decoy.x;e.targetY=s.decoy.y;e.search=5;}
  else if(machine){e.state='investigate';e.targetX=machine.x;e.targetY=machine.y;e.search=3.4;}
  else if(canSee){e.state='hunt';e.targetX=p.x;e.targetY=p.y;e.search=3.4;}
  else if(localSound(s,e)){const heard=localSound(s,e);e.state='investigate';e.targetX=heard.x;e.targetY=heard.y;e.search=2.5;}
  else if(!p.hidden&&s.noise>.55&&dist<850){e.state='investigate';e.targetX=p.x;e.targetY=p.y;e.search=3;}
  else if(e.search<=0){e.state='patrol';e.targetX=e.home+Math.sin(s.elapsed*.23)*200;e.targetY=r.mode==='profile'?88:110;}
  const isHunt=e.state==='hunt',espeed=(e.type==='hugger'?145:isHunt?187:75)*(s.difficulty==='assisted'?.65:1)*(e.cool>.65?.35:1);
  navigateActor(r,e,{x:clamp(e.targetX,30,r.width-30),y:r.mode==='profile'?88:clamp(e.targetY,6,174)},espeed,dt);
  inspectDecoy(s,e,dt);
  dist=Math.hypot(e.x-p.x,(e.y-p.y)*1.5);
  if(!p.hidden&&dist<(e.type==='hugger'?40:56)&&s.invuln<=0&&e.cool<=0&&!lineBlocked(r,e.x,e.y,p.x,p.y)){
   e.attack=e.type==='hugger'?.36:.62;e.state='windup';notice(s,'La créature prend appui. Reculez !',1.1);
  }
 }
 if(s.player.hp<hpBefore||s.dead){releaseCart(s,'Prise interrompue par le contact.');s.gripPressDone=true;}
 const excursionHandling=stepExcursion(s,input,dt,moving,hpBefore);
 const repairHandling=excursionHandling||stepMaintenance(s,input,dt,moving,hpBefore);
 if(!repairHandling&&input.interact&&!input.bulkhead&&!moving&&!s.dead){const at=nearby(s);if(at?.kind==='objective'){
  s.hold+=dt;if(s.hold>=at.item.hold){s.hold=0;if(DATA.workOrders?.[at.item.id]||['circuit','purge'].includes(at.item.action)){s.puzzle=getPuzzle(s);}else{if(at.item.action==='lure')dropDecoy(s,true);completeObjective(s);s.portalCooldown=.8;}}}
  else if(at?.kind==='recorder'&&s.portalCooldown<=0){s.hold+=dt;if(s.hold>=.65){takeRecorder(s);s.hold=0;s.portalCooldown=.8;}}
  else if(at?.kind==='activity'&&s.portalCooldown<=0){if(s.servicePressDone&&['light','machine','hide','fabricator'].includes(at.item.kind)){s.hold=0;}else{s.hold+=dt;if(s.hold>=(at.item.hold||.6)){useActivity(s,at.item.id);if(['light','machine','hide','fabricator'].includes(at.item.kind))s.servicePressDone=true;s.hold=0;s.portalCooldown=.8;}}}
  else if(at?.kind==='crew'&&s.portalCooldown<=0){s.hold+=dt;if(s.hold>=.35){talkToCrew(s,at.item.id);s.hold=0;s.portalCooldown=.8;}}
  else if(at?.kind==='portal'&&s.portalCooldown<=0){if(doorStatus(s,at.item.edge).sealed){s.hold+=dt;if(s.hold>=1){toggleBulkhead(s,at.item.edge);s.hold=0;s.portalCooldown=.8;}}else transition(s,at.item);}
  else s.hold=0;
 }else{s.hold=0;}
 return s;
}
export function serialize(s){const out=clone(s);for(const k of ['puzzle','reading','hold','flame','shake','doorHold'])out[k]=['puzzle','reading'].includes(k)?null:0;out.weaponPressDone=false;out.weaponShot=null;out.weaponCooldown=0;out.acidCooldown=0;out.handling.grip=null;out.handling.blocked=null;out.gripPressDone=false;out.gripMoved=false;out.gripNoise=0;out.excursionHold=0;out.excursionTarget=null;out.excursionPressDone=false;out.maintenanceHold=0;out.maintenanceTarget=null;out.maintenancePressDone=false;out.dead=false;out.listening=false;out.listenHeld=0;out.decoyPressDone=false;out.decoy=null;if(out.companion){delete out.companion.path;delete out.companion.pathTimer;delete out.companion.pathVersion;}for(const w of Object.values(out.world))for(const e of w.enemies){delete e.path;delete e.pathTimer;delete e.pathTarget;delete e.pathVersion;}return JSON.stringify(out);}
export function restore(raw){
 if(typeof raw!=='string'||raw.length>180000)return null;
 try{
  const v=JSON.parse(raw);if(!v||![1,2,3,4,5,6,7,8,9,10].includes(v.schema)||!ROOM[v.room]||!Array.isArray(v.completed))return null;
  const s=createState(v.difficulty),ordered=DATA.chapters.flatMap(c=>c.objectives.map(o=>o.id));let n=0;while(n<ordered.length&&v.completed[n]===ordered[n])n++;
  s.completed=ordered.slice(0,n);s.finished=n===ordered.length;s.chapter=s.finished?15:Math.floor(n/3);s.goal=s.finished?2:n%3;
  s.room=v.room;s.visited=[...new Set((Array.isArray(v.visited)?v.visited:[]).filter(x=>ROOM[x]))];if(!s.visited.includes(s.room))s.visited.push(s.room);
  const r=ROOM[s.room],p=v.player||{};
  Object.assign(s.player,{x:clamp(p.x,28,r.width-28),y:r.mode==='profile'?88:clamp(p.y,0,180),hp:clamp(p.hp,1,100),fuel:clamp(p.fuel,0,100),decoys:Math.floor(clamp(p.decoys,0,12)),kits:Math.floor(clamp(p.kits,0,5)),face:p.face===-1?-1:1});
  // Dynamic geometry validates the restored position after cart restoration.
  s.flags={torchReady:n>=10,cellCarried:n>=32&&n<33,cellSecured:n>=33,liftBroken:n>=20,ashPurged:n>=44,narcissusReleased:n>=46,carryRipley:n>=42&&n<43,ripleyStasis:n>=43};
  s.flash=v.flash!==false;s.sound=v.sound===true;s.reducedMotion=v.reducedMotion===true;s.contrast=v.contrast===true;s.elapsed=clamp(v.elapsed,0,360000);s.notice='Le carnet de bord est repris.';s.invuln=2.2;
  s.journal=DATA.chapters.flatMap(c=>c.objectives).slice(0,n).map((o,i)=>({chapter:Math.floor(i/3),text:o.after}));
  if(v.world&&typeof v.world==='object')for(const id of Object.keys(v.world).filter(id=>ROOM[id])){
   const w=v.world[id];if(!w||typeof w!=='object')continue;
   s.world[id]={enemies:[],eggs:{},cleared:!!w.cleared,spawned:!!w.spawned,visitTime:clamp(w.visitTime,0,s.elapsed)};
   for(const e of (Array.isArray(w.enemies)?w.enemies:[]).slice(0,8)){
    if(!e||!['adult','hugger'].includes(e.type))continue;
    s.world[id].enemies.push({id:String(e.id).slice(0,100),type:e.type,hp:clamp(e.hp??(e.type==='adult'?120:30),1,e.type==='adult'?120:30),netted:clamp(e.netted,0,4),x:clamp(e.x,30,ROOM[id].width-30),y:ROOM[id].mode==='profile'?88:clamp(e.y,0,180),home:clamp(e.home,30,ROOM[id].width-30),state:['patrol','hunt','investigate'].includes(e.state)?e.state:'patrol',targetX:clamp(e.targetX??e.x,30,ROOM[id].width-30),targetY:clamp(e.targetY??e.y,0,180),stun:clamp(e.netted,0,4),cool:1,search:clamp(e.search,0,5),dir:e.dir===-1?-1:1,attack:0});
   }
   for(const p of ROOM[id].props.filter(p=>p.type==='egg')){const ev=w.eggs?.[p.id];if(ev&&['dormant','opening','open'].includes(ev.state))s.world[id].eggs[p.id]={state:ev.state,time:clamp(ev.time,0,1.5)};}
  }
  s.records=uniqueKnown(v.records,DATA.interactables.filter(a=>a.kind==='archive').map(a=>a.id));
  s.collected=uniqueKnown(v.collected,DATA.interactables.filter(a=>a.kind==='cache').map(a=>a.id));
  s.disabledHazards=uniqueKnown(v.disabledHazards,DATA.hazards.map(h=>h.id));
  s.conversations=uniqueKnown(v.conversations,[...DATA.crewPlacements.map(c=>c.id),...DATA.companions.map(c=>'companion:'+c.id)]);
  for(const [id,def] of Object.entries(DATA.workOrders)){const w=v.work?.[id];if(!w||typeof w!=='object'||s.completed.includes(id))continue;
   if(def.type==='routing')s.work[id]={values:def.initial.map((x,i)=>Math.round(clamp(w.values?.[i],0,2)))};
   else if(def.type==='sequence')s.work[id]={index:Math.floor(clamp(w.index,0,def.sequence.length-1))};
   else s.work[id]={value:clamp(w.value,0,100)};
  }
  s.journal=[];for(let i=0;i<n;i++){const o=DATA.chapters.flatMap(c=>c.objectives)[i];s.journal.push({chapter:Math.floor(i/3),text:o.after});const ev=DATA.storyEvents.find(e=>e.at===i+1);if(ev)s.journal.push({chapter:Math.floor(i/3),text:ev.speaker+' — '+ev.text});}
  if(s.flags.carryRipley)s.player.crouch=false;
  s.discoveredPortals=uniqueKnown(v.discoveredPortals,DATA.rooms.flatMap(r=>r.portals.map(p=>p.id)));
  for(const k of Object.keys(s.metrics))s.metrics[k]=Math.floor(clamp(v.metrics?.[k],0,100000));
  const def=DATA.companions.find(d=>d.id===v.companion?.id&&n>=d.start&&n<d.end);
  if(def&&ROOM[v.companion.room]){
   const c=v.companion,r=ROOM[c.room],x=clamp(c.x,28,r.width-28),y=r.mode==='profile'?88:clamp(c.y,0,180);
   s.companion={...def,room:c.room,x,y,mode:c.mode==='wait'?'wait':'follow',state:'idle',path:[],pathTimer:0,face:c.face===-1?-1:1};
  }
  restorePresentation(s,v);restoreExcursion(s,v);restoreMaintenance(s,v);restoreServices(s,v);restoreAcoustics(s,v);restoreHandling(s,v);restoreCombat(s,v);discoverRoom(s);observeMaintenance(s);s.dirty=false;return s;
 }catch{return null;}
}
export function validateData(){
 const failures=[],check=(ok,msg)=>{if(!ok)failures.push(msg);};
 check(new Set(DATA.rooms.map(x=>x.id)).size===DATA.rooms.length,'Duplicate room');
 check(new Set(DATA.codex.map(x=>x.id)).size===DATA.codex.length,'Duplicate codex');
 for(const r of DATA.rooms){for(const p of r.props){check(!!PROP[p.type],r.id+' prop type');check(p.x>=0&&p.x<=r.width,r.id+' prop bounds');}for(const p of r.portals){check(ROOM[p.target]?.portals.some(q=>q.edge===p.edge&&q.target===r.id),r.id+' portal peer');check(!collision(r,p.x,p.y),r.id+' portal obstructed '+p.id);}for(const n of r.nodes)check(!collision(r,n.x,n.y),r.id+' node obstructed');}
 const s=createState();for(const c of DATA.chapters){s.chapter=c.index;for(const o of c.objectives){check(!!ROOM[o.room]?.nodes.some(n=>n.id===o.node),'Missing objective node '+o.id);check(route(s,o.room)!==null,'Unreachable objective '+o.id);s.room=o.room;}}
 return {ok:failures.length===0,failures,counts:{rooms:DATA.rooms.length,edges:DATA.edges.length,objectives:48,codex:DATA.codex.length,propTypes:DATA.props.length,propInstances:DATA.rooms.reduce((n,r)=>n+r.props.length,0)}};
}

function uniqueKnown(value,allowed){return Array.isArray(value)?[...new Set(value.filter(x=>allowed.includes(x)))]:[];}
export function crewInRoom(s){
 const lost=new Set(DATA.storyEvents.filter(e=>e.at<=s.completed.length).flatMap(e=>e.lost||[]));
 const injured=new Set(DATA.storyEvents.filter(e=>e.at<=s.completed.length).flatMap(e=>e.injured||[]));
 const actor=DATA.chapters[s.chapter].actor;
 const dynamic=syncCompanion(s);
 const statics=DATA.crewPlacements.filter(n=>n.character!==dynamic?.character&&n.room===s.room&&n.start<=s.completed.length&&s.completed.length<n.end&&n.character!==actor&&!lost.has(n.character)&&!(n.character==='ripley'&&s.flags.carryRipley)).map(n=>({...n,pose:injured.has(n.character)&&n.pose!=='rest'?'injured':n.pose}));
 if(dynamic&&dynamic.room===s.room)statics.push({...dynamic,id:'companion:'+dynamic.id,pose:injured.has(dynamic.character)?'injured':'work',moving:dynamic.moving,face:dynamic.face,crouch:dynamic.crouch,alert:dynamic.alert,dynamic:true});
 return statics;
}
export function talkToCrew(s,id){const npc=crewInRoom(s).find(n=>n.id===id);if(!npc||Math.hypot(s.player.x-npc.x,s.player.y-npc.y)>85)return false;
 const lines=DATA.dialogues[npc.character]||[];s.reading={kind:'crew',title:lines[0]?.[0]||npc.character,lines};
 if(id.startsWith('companion:'))s.reading.body='G : suivre ou attendre dans cette pièce.';
 if(!s.conversations.includes(id))s.conversations.push(id);s.dirty=true;return true;}
export function useActivity(s,id){
 const a=DATA.interactables.find(a=>a.id===id);if(!a||a.room!==s.room||Math.hypot(a.x-s.player.x,a.y-s.player.y)>80)return false;
 if(a.kind==='armament')return collectArmament(s,a.id);
 if(a.kind==='excursion')return false; // Actions require a live hold, never direct or remote UI calls.
 if(a.kind==='salvage'||a.kind==='fabricator')return useMaintenanceActivity(s,a);
 if(a.kind==='hide')return toggleHide(s,a.id);
 if(a.kind==='light'||a.kind==='machine')return useService(s,a);
 if(a.kind==='archive'){if(s.records.includes(id))return false;s.records.push(id);s.reading={kind:'archive',title:a.title,body:a.body};notice(s,'La transcription rejoint le carnet.');}
 if(a.kind==='cache'){if(s.collected.includes(id))return false;const max={kits:5,fuel:100,decoys:12}[a.resource];if(s.player[a.resource]>=max){notice(s,'Vous ne pouvez pas en emporter davantage.');return false;}s.player[a.resource]=Math.min(max,s.player[a.resource]+a.amount);s.collected.push(id);notice(s,a.title+' récupéré.');}
 if(a.kind==='valve'){if(s.disabledHazards.includes(a.hazard))return false;s.disabledHazards.push(a.hazard);notice(s,'La dérivation est fermée. La vapeur se dissipe.');}
 s.dirty=true;return true;
}
export function activeHazards(s){return DATA.hazards.filter(h=>h.room===s.room&&s.chapter>=h.minChapter&&!s.disabledHazards.includes(h.id)).map(h=>{const phase=(s.elapsed+1)%h.period;return {...h,phase,active:phase<h.on,warning:phase>h.period-1};});}
const WORK_LABELS={isolate:'Isoler la ligne',lock:'Bloquer le mécanisme',connect:'Relier le secours',test:'Contrôler la réponse',local:'Passer en commande locale',consent:'Confirmer la demande de Ripley',scan:'Lire le moniteur',stasis:'Terminer le programme',purge:'Lancer la purge'};
export function prepareWork(s,id){
 const def=DATA.workOrders[id];if(!def)return null;
 if(!s.work[id])s.work[id]=def.type==='routing'?{values:[...def.initial]}:def.type==='sequence'?{index:0}:{value:def.initial};
 return {id,type:def.type,title:def.title,prompt:def.hint,...def,progress:s.work[id],labelsText:WORK_LABELS};
}
export function manipulateWork(s,action){
 const p=s.puzzle;if(!p?.type||currentObjective(s)?.id!==p.id)return false;const d=DATA.workOrders[p.id],w=s.work[p.id];let complete=false,invalid=false;
 if(d.type==='routing'){
  if(/^rotate:[012]$/.test(action)){const i=Number(action.split(':')[1]);w.values[i]=(w.values[i]+1)%3;}
  else if(action==='commit'){complete=w.values.every((v,i)=>v===d.target[i]);invalid=!complete;}else invalid=true;
 }else if(d.type==='sequence'){
  if(action===d.sequence[w.index]){w.index++;complete=w.index===d.sequence.length;}else{invalid=true;w.index=0;}
 }else{
  if(action==='minus')w.value=clamp(w.value-5,0,100);else if(action==='plus')w.value=clamp(w.value+5,0,100);
  else if(action==='commit'){complete=Math.abs(w.value-d.target)<=d.tolerance;invalid=!complete;}else invalid=true;
 }
 if(invalid){s.noise=1;s.puzzle.error='La commande ne répond pas. Reprenez depuis la plaque locale.';s.puzzle.failures=(s.puzzle.failures||0)+1;}else if(s.puzzle)s.puzzle.error='';
 s.dirty=true;
 if(complete){s.puzzle=null;completeObjective(s);return true;}
 return false;
}
export function solveWorkAction(s){const p=s.puzzle;if(!p)return null;if(!p.type)return p.correct;const w=s.work[p.id],d=DATA.workOrders[p.id];if(d.type==='routing'){const i=w.values.findIndex((v,i)=>v!==d.target[i]);return i<0?'commit':'rotate:'+i;}if(d.type==='sequence')return d.sequence[w.index];return Math.abs(w.value-d.target)<=d.tolerance?'commit':w.value<d.target?'plus':'minus';}

/** V0.3: shared, deterministic navigation. Nodes are obstacle corners expanded by
 * the same player radius; actual displacement still goes through move()/collision(). */
const navCache=new WeakMap();
export function segmentClear(r,a,b){
 if(collision(r,a.x,a.y,12)||collision(r,b.x,b.y,12))return false;
 const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/7);
 for(let k=1;k<steps;k++)if(collision(r,a.x+(b.x-a.x)*k/steps,a.y+(b.y-a.y)*k/steps,12))return false;
 return true;
}
function navigationGraph(r){
 if(navCache.has(r))return navCache.get(r);
 const nodes=[];
 if(r.mode!=='profile')for(const q of obstacleRects(r)){
  for(const x of [q.x-18,q.x+q.w+18])for(const y of [q.y-10,q.y+q.h+10]){
   const v={x:clamp(x,30,r.width-30),y:clamp(y,2,178)};
   if(!collision(r,v.x,v.y,12)&&!nodes.some(n=>Math.hypot(n.x-v.x,n.y-v.y)<2))nodes.push(v);
  }
 }
 const links=nodes.map(()=>[]);
 for(let i=0;i<nodes.length;i++)for(let j=0;j<i;j++)if(segmentClear(r,nodes[i],nodes[j])){const cost=Math.hypot(nodes[i].x-nodes[j].x,(nodes[i].y-nodes[j].y)/.7);links[i].push([j,cost]);links[j].push([i,cost]);}
 const value={nodes,links};navCache.set(r,value);return value;
}
export function findPath(r,from,to){
 if(segmentClear(r,from,to))return [{x:to.x,y:to.y}];
 if(collision(r,to.x,to.y,12)||collision(r,from.x,from.y,12))return [];
 const g=navigationGraph(r),nodes=[...g.nodes,{x:from.x,y:from.y},{x:to.x,y:to.y}],links=g.links.map(a=>a.slice());links.push([],[]);
 const start=nodes.length-2,end=nodes.length-1;
 for(const i of [start,end])for(let j=0;j<i;j++)if(segmentClear(r,nodes[i],nodes[j])){const cost=Math.hypot(nodes[i].x-nodes[j].x,(nodes[i].y-nodes[j].y)/.7);links[i].push([j,cost]);links[j].push([i,cost]);}
 const costs=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),done=new Set();costs[start]=0;
 for(let k=0;k<nodes.length;k++){
  let at=-1;for(let i=0;i<nodes.length;i++)if(!done.has(i)&&(at<0||costs[i]<costs[at]))at=i;
  if(at<0||!Number.isFinite(costs[at]))return [];if(at===end)break;done.add(at);
  for(const [j,c] of links[at])if(costs[at]+c<costs[j]){costs[j]=costs[at]+c;prev[j]=at;}
 }
 if(prev[end]<0)return [];const out=[];for(let i=end;i!==start;i=prev[i]){if(i<0)return [];out.unshift({...nodes[i]});}return out;
}
export function navigateActor(r,a,target,speed,dt){
 a.pathTimer=(a.pathTimer||0)-dt;
 const movedTarget=!a.pathTarget||Math.hypot(target.x-a.pathTarget.x,target.y-a.pathTarget.y)>50;
 if(a.pathVersion!==(r.geometryKey||r.id)||a.pathTimer<=0||movedTarget||!a.path?.length){a.path=findPath(r,a,target);a.pathTarget={...target};a.pathTimer=.7;a.pathVersion=r.geometryKey||r.id;}
 while(a.path?.length&&Math.hypot(a.path[0].x-a.x,a.path[0].y-a.y)<5)a.path.shift();
 const point=a.path?.[0];if(!point){a.moving=false;return false;}
 const dx=point.x-a.x,dy=point.y-a.y,len=Math.hypot(dx,dy/.7)||1,amount=Math.min(speed*dt,len),ox=a.x,oy=a.y;
 a.face=a.dir=dx>=0?1:-1;move(r,a,dx/len*amount,dy/len*amount);
 a.moving=Math.hypot(a.x-ox,a.y-oy)>.02;return a.moving;
}
export function lightAt(s,x=s.player.x,y=s.player.y){
 const r=ROOM[s.room],l=r.lighting;if(s.lightsOff?.includes(r.id))return Math.max(.1,(l?.ambient??.35)*.35);let intensity=l?.ambient??.35;
 for(const p of l?.pools||[])intensity=Math.max(intensity,(l.ambient||.2)+p.strength*Math.max(0,1-Math.hypot(x-p.x,(y-p.y)*1.5)/p.radius));
 return Math.min(1,intensity);
}
export function detectionRange(s){
 if(s.player.hidden)return 0;
 return (s.player.crouch?140:220)+lightAt(s)*(s.player.crouch?65:150)+(s.flash?75:0);
}
export function stealthStatus(s){
 if(s.player.hidden)return {label:'À COUVERT',value:0};
 if(s.noise>.55)return {label:'PAS BRUYANTS',value:1};
 const value=Math.min(1,(detectionRange(s)-100)/380);return {label:value>.68?'EXPOSÉ':value>.4?'VISIBLE':'DISCRET',value};
}
export function toggleHide(s,id){
 const a=DATA.interactables.find(a=>a.kind==='hide'&&a.id===id&&a.room===s.room);
 if(!a||Math.hypot(a.x-s.player.x,a.y-s.player.y)>80||s.flags.carryRipley||s.flags.cellCarried)return false;
 if(s.player.hidden===id){s.player.hidden=null;notice(s,'Vous quittez le renfoncement.');return true;}
 if(roomWorld(s).enemies.some(e=>Math.hypot(e.x-s.player.x,(e.y-s.player.y)*1.5)<detectionRange(s)&&e.stun<=0&&!lineBlocked(roomGeometry(s),e.x,e.y,s.player.x,s.player.y))){notice(s,'Elle vous regarde. Rompez la ligne de vue avant de vous cacher.');return false;}
 s.player.hidden=id;s.player.crouch=true;s.noise=0;s.dirty=true;notice(s,'À couvert. Un mouvement vous fera ressortir.');return true;
}
export function syncCompanion(s){
 const n=s.completed.length,actor=DATA.chapters[s.chapter].actor;
 const def=DATA.companions.find(c=>n>=c.start&&n<c.end&&c.character!==actor);
 if(s.companion&&s.companion.id!==def?.id)s.companion=null;
 if(!s.companion&&def?.room===s.room){s.companion={...def,mode:'follow',state:'idle',face:1,path:[],pathTimer:0};notice(s,def.name+' — '+def.radio+' [G : suivre / attendre]',6);s.dirty=true;}
 return s.companion;
}
export function commandCompanion(s){
 const c=syncCompanion(s);if(!c)return false;
 if(c.room!==s.room){notice(s,c.name+' attend dans '+ROOM[c.room].name+'. Revenez le chercher.');return false;}
 c.mode=c.mode==='wait'?'follow':'wait';c.state=c.mode==='wait'?'waiting':'idle';c.path=[];c.pathTimer=0;s.dirty=true;notice(s,c.name+' — '+(c.mode==='wait'?'Je reste ici.':'Je vous suis.'));return true;
}
export function updateCompanion(s,dt){
 const c=syncCompanion(s);if(!c||c.room!==s.room)return;
 c.moving=false;c.alert=Math.max(0,(c.alert||0)-dt);c.alertCooldown=Math.max(0,(c.alertCooldown||0)-dt);
 const threat=(s.world[s.room]?.enemies||[]).find(e=>e.type==='adult'&&e.stun<=0&&Math.hypot(e.x-c.x,(e.y-c.y)*1.5)<370&&!lineBlocked(roomGeometry(s),c.x,c.y,e.x,e.y));
 if(threat&&c.alertCooldown<=0){c.alert=3;c.alertCooldown=12;s.metrics.companionAlerts++;notice(s,c.name+' — Pas un geste brusque. Il y a quelque chose devant nous.',4);}
 if(c.mode==='wait'){c.crouch=!!threat||s.player.crouch;c.state=threat?'watching-wait':'waiting';return;}
 const distance=Math.hypot(c.x-s.player.x,c.y-s.player.y);
 c.crouch=s.player.crouch||!!s.player.hidden||!!threat&&distance<180;
 if(distance<94){c.state=threat?'watching':c.crouch?'cover':'ready';return;}
 const r=roomGeometry(s,c.room),t={x:clamp(s.player.x+(c.x<s.player.x?-58:58),30,r.width-30),y:r.mode==='profile'?88:s.player.y};
 if(collision(r,t.x,t.y))Object.assign(t,{x:s.player.x,y:s.player.y});
 const h=activeHazards(s).find(h=>h.active&&Math.abs(c.x-h.x)<h.width*.5+65&&Math.abs(c.y-h.y)<32&&(t.x-c.x)*(h.x-c.x)>0);
 if(h){c.state='hazard';return;}
 c.state='following';navigateActor(r,c,t,c.crouch?100:c.speed,dt);
}
export function discoverRoom(s){
 if(!s.discoveredPortals)s.discoveredPortals=[];
 for(const p of ROOM[s.room].portals)if(Math.hypot(p.x-s.player.x,p.y-s.player.y)<210&&!s.discoveredPortals.includes(p.id)){s.discoveredPortals.push(p.id);s.dirty=true;}
}
export function chart(s){
 const known=new Set(s.visited),seen=new Set(s.discoveredPortals||[]);
 return DATA.rooms.filter(r=>known.has(r.id)).map(r=>({id:r.id,name:r.name,deck:r.deck,zone:r.zone,current:r.id===s.room,links:r.portals.filter(p=>seen.has(p.id)||known.has(p.target)).map(p=>({id:p.id,edge:p.edge,target:known.has(p.target)?p.target:null,label:known.has(p.target)?ROOM[p.target].name:'Accès non reconnu',open:activeEdges(s).some(e=>e.id===p.edge),sealed:doorStatus(s,p.edge).sealed,seconds:Math.ceil(doorStatus(s,p.edge).remaining)}))}));
}

/** V0.4 services and pursuit. Only already-instantiated adults can travel.
 * A passage stores the last observed doorway, never the player's next position.
 * Off-screen movement uses the same obstacle graph as on-screen movement. */
export function doorStatus(s,edge){
 const def=DATA.bulkheads.find(b=>b.edge===edge),v=s.doors?.[edge];
 return {equipped:!!def,sealed:!!def&&Number(v?.remaining)>0,remaining:Math.max(0,Number(v?.remaining)||0),strain:Math.max(0,Number(v?.strain)||0),jammed:Math.max(0,Number(v?.jammed)||0),cooldown:Math.max(0,Number(v?.cooldown)||0),label:def?.label||''};
}
export function nearestBulkhead(s){
 let best=null,distance=135;for(const p of ROOM[s.room].portals){if(!DATA.bulkheads.some(b=>b.edge===p.edge))continue;const d=Math.hypot(p.x-s.player.x,(p.y-s.player.y)*1.2);if(d<distance){best=p;distance=d;}}
 return best;
}
export function toggleBulkhead(s,edge){
 const p=ROOM[s.room].portals.find(p=>p.edge===edge),def=DATA.bulkheads.find(b=>b.edge===edge);
 if(!p||!def||s.dead||s.finished||s.flags.carryRipley||Math.hypot(p.x-s.player.x,(p.y-s.player.y)*1.2)>136)return false;
 if(!activeEdges(s,true).some(e=>e.id===edge)){notice(s,'Cette cloison est condamnée par le site.');return false;}
 const d=s.doors[edge]||(s.doors[edge]={remaining:0,strain:0,jammed:0,cooldown:0});
 if(d.remaining>0){d.remaining=0;d.strain=0;d.cooldown=3;notice(s,'Verrou libéré. Le passage est ouvert.',3);}
 else{
  if(d.jammed>0||d.cooldown>0){notice(s,d.jammed>0?'Mécanisme endommagé. Il faut attendre avant de réarmer.':'Le verrou finit de revenir en butée.',3);return false;}
  const c=syncCompanion(s);if(c?.mode==='follow'&&c.room!==s.room){notice(s,c.name+' est encore de l’autre côté.');return false;}
  d.remaining=def.holdSeconds;d.strain=0;s.metrics.bulkheadsClosed++;notice(s,'Verrou engagé — 14 secondes sans pression. B ou E pour libérer.',4);
 }
 s.noise=1;s.dirty=true;return true;
}
export function serviceStatus(s,a){
 if(a.kind==='light')return {active:!s.lightsOff.includes(a.room),label:s.lightsOff.includes(a.room)?'SECOURS SEUL':'RAMPES ALLUMÉES'};
 const v=s.machines[a.id]||{remaining:0,cooldown:0};return {...v,active:v.remaining>0,label:v.remaining>0?'CYCLE · '+Math.ceil(v.remaining)+' s':v.cooldown>0?'REFROIDISSEMENT · '+Math.ceil(v.cooldown)+' s':'PRÊTE'};
}
export function useService(s,a){
 if(a.kind==='light'){
  const n=s.lightsOff.indexOf(a.room);if(n<0)s.lightsOff.push(a.room);else s.lightsOff.splice(n,1);
  notice(s,n<0?'Rampes isolées. Le balisage de secours reste allumé.':'Rampes rétablies.',4);s.noise=Math.max(s.noise,.25);s.dirty=true;return true;
 }
 if(a.kind==='machine'){
  const v=s.machines[a.id]||(s.machines[a.id]={remaining:0,cooldown:0});
  if(v.remaining>0||v.cooldown>0){notice(s,'La machine est encore en cycle ou en refroidissement.');return false;}
  v.remaining=a.runSeconds;v.cooldown=a.coolSeconds;s.acousticTimers[a.id]=2;emitSound(s,'machine',a.x,a.y,1,a.room);s.metrics.machinesStarted++;notice(s,a.title+' — cycle sonore lancé.',4);s.dirty=true;return true;
 }
 return false;
}
function tickServices(s,dt){
 for(const d of Object.values(s.doors)){
  const was=d.remaining>0;d.remaining=Math.max(0,d.remaining-dt);d.jammed=Math.max(0,d.jammed-dt);d.cooldown=Math.max(0,d.cooldown-dt);
  if(was&&!d.remaining){d.strain=0;s.dirty=true;}
 }
 for(const v of Object.values(s.machines)){if(v.remaining>0){v.remaining=Math.max(0,v.remaining-dt);}else v.cooldown=Math.max(0,v.cooldown-dt);}
}
function machineAttractor(s,e,canSee,distance){
 if(canSee||distance<100)return null;
 return DATA.interactables.filter(a=>a.kind==='machine'&&a.room===s.room&&s.machines[a.id]?.remaining>0&&Math.abs(a.x-e.x)<1150).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0]||null;
}
function pursuitAllowed(s,edge){
 return DATA.pursuitRules.edges.includes(edge)&&activeEdges(s,true).some(e=>e.id===edge);
}
function markExitTrail(s,p){
 if(!pursuitAllowed(s,p.edge)||DATA.pursuitRules.safeRooms.includes(p.target))return;
 const r=roomGeometry(s),w=roomWorld(s);
 for(const e of w.enemies){
  const distance=Math.hypot(e.x-s.player.x,(e.y-s.player.y)*1.5);
  const observed=!s.player.hidden&&distance<detectionRange(s)&&!lineBlocked(r,e.x,e.y,s.player.x,s.player.y);
  const heard=s.noise>.55&&distance<520;
  if(e.type!=='adult'||e.stun>0||e.attack>0||(!observed&&!heard))continue;
  e.passage={edge:p.edge,from:s.room,to:p.target,remaining:DATA.pursuitRules.memory,wait:DATA.pursuitRules.crossingTime};
  e.targetX=p.x;e.targetY=p.y;e.path=[];e.pathTimer=0;e.state='track';e.attack=0;s.metrics.trailsStarted++;s.dirty=true;
 }
}
export function incomingThreats(s){
 const result=[];
 for(const [room,w]of Object.entries(s.world))for(const e of w.enemies||[]){
  if(e.passage?.to!==s.room)continue;const p=ROOM[room].portals.find(p=>p.edge===e.passage.edge);if(!p)continue;
  const distance=Math.hypot(e.x-p.x,e.y-p.y);if(distance>300)continue;
  const gate=doorStatus(s,p.edge);result.push({edge:p.edge,from:room,stage:gate.sealed?'pressure':'approach',seconds:gate.sealed?Math.max(0,DATA.bulkheads.find(b=>b.edge===p.edge).breakSeconds-gate.strain):Math.max(0,e.passage.wait),distance});
 }
 return result;
}
export function updatePursuit(s,dt){
 const transfers=[];
 for(const [room,w]of Object.entries(s.world))for(const e of [...w.enemies]){
  const trail=e.passage;if(!trail)continue;
  const portal=ROOM[room]?.portals.find(p=>p.edge===trail.edge&&p.target===trail.to);
  if(room===s.room){delete e.passage;e.path=[];e.state='investigate';e.search=3.4;continue;}
  trail.remaining-=dt;e.cool=Math.max(0,e.cool-dt);e.stun=Math.max(0,e.stun-dt);
  if(!portal||!pursuitAllowed(s,trail.edge)||trail.remaining<=0||s.chapter<6||s.chapter>10){delete e.passage;e.state='patrol';e.path=[];s.dirty=true;continue;}
  if(e.stun>0)continue;
  const distance=Math.hypot(e.x-portal.x,(e.y-portal.y)/.7);
  if(distance>22){e.state='track';navigateActor(roomGeometry(s,room),e,portal,s.difficulty==='assisted'?125:185,dt);continue;}
  const gate=s.doors[trail.edge];
  if(gate?.remaining>0){
   e.state='battering';gate.strain+=dt;const def=DATA.bulkheads.find(b=>b.edge===trail.edge);
   if(gate.strain>=def.breakSeconds){gate.remaining=0;gate.strain=0;gate.jammed=def.jamSeconds;s.metrics.bulkheadsBreached++;for(const rid of [trail.from,trail.to]){const pp=ROOM[rid].portals.find(p=>p.edge===trail.edge);if(pp)addResidue(s,rid,'scrape',pp.x,pp.y);}s.dirty=true;if(trail.to===s.room)notice(s,'Le verrou cède derrière vous ! Éloignez-vous du seuil.',4);}
   continue;
  }
  e.state='crossing';trail.wait-=dt;
  if(trail.wait<=0)transfers.push({e,w,trail});
 }
 for(const {e,w,trail}of transfers){
  if(!w.enemies.includes(e)||!e.passage)continue;
  const to=roomGeometry(s,trail.to),back=to.portals.find(p=>p.edge===trail.edge),dest=roomWorld(s,to.id);
  if(dest.enemies.filter(e=>e.type==='adult').length>=DATA.pursuitRules.maxAdultsPerRoom){trail.wait=.5;continue;}
  // Portal endpoints are authored walkable. Test both inward offsets instead of teleporting through props.
  let pos={x:back.x,y:to.mode==='profile'?88:back.y};
  for(const offset of [28,-28,0]){const x=clamp(back.x+offset,30,to.width-30);if(!collision(to,x,pos.y)){pos.x=x;break;}}
  if(collision(to,pos.x,pos.y)){trail.wait=.5;continue;}
  w.enemies.splice(w.enemies.indexOf(e),1);delete e.passage;Object.assign(e,{x:pos.x,y:pos.y,home:pos.x,targetX:clamp(pos.x+(pos.x>to.width/2?-100:100),30,to.width-30),targetY:pos.y,path:[],pathTimer:0,pathTarget:null,state:'investigate',search:3.4,cool:1,attack:0});if(trail.reason==='sound'&&trail.source){e.targetX=trail.source.x;e.targetY=trail.source.y;e.search=5;}dest.enemies.push(e);s.metrics.pursuitPassages++;s.dirty=true;
  if(s.room===to.id)notice(s,'Des griffes passent le seuil. Rompez le contact.',3);
 }
}
function restoreServices(s,v){
 s.lightsOff=uniqueKnown(v.lightsOff,DATA.interactables.filter(a=>a.kind==='light').map(a=>a.room));
 for(const def of DATA.bulkheads){const d=v.doors?.[def.edge];if(!d||typeof d!=='object')continue;s.doors[def.edge]={remaining:clamp(d.remaining,0,def.holdSeconds),strain:clamp(d.strain,0,def.breakSeconds),jammed:clamp(d.jammed,0,def.jamSeconds),cooldown:clamp(d.cooldown,0,3)};}
 for(const a of DATA.interactables.filter(a=>a.kind==='machine')){const m=v.machines?.[a.id];if(m&&typeof m==='object')s.machines[a.id]={remaining:clamp(m.remaining,0,a.runSeconds),cooldown:clamp(m.cooldown,0,a.coolSeconds)};}
 const identities=new Set();
 for(const [id,w]of Object.entries(s.world)){
  w.enemies=w.enemies.filter(e=>{if(identities.has(e.id))return false;identities.add(e.id);return true;});
  for(const e of w.enemies){
   const old=v.world?.[id]?.enemies?.find(o=>o?.id===e.id),p=old?.passage;
   if(e.type!=='adult'||!p||p.from!==id||!ROOM[id].portals.some(q=>q.edge===p.edge&&q.target===p.to)||DATA.pursuitRules.safeRooms.includes(p.to)||!pursuitAllowed(s,p.edge)||s.chapter<6||s.chapter>10)continue;
   e.passage={edge:p.edge,from:id,to:p.to,remaining:clamp(p.remaining,0,DATA.pursuitRules.memory),wait:clamp(p.wait,0,DATA.pursuitRules.crossingTime)};if(p.reason==='sound'&&p.source){e.passage.reason='sound';e.passage.source={x:clamp(p.source.x,30,ROOM[p.to].width-30),y:ROOM[p.to].mode==='profile'?88:clamp(p.source.y,0,180)};}
  }
 }
}

/** V0.5 — Local acoustics, bounded evidence and decoy memory.
 * Sound may cross one authored adjacency. It never spawns an enemy or searches
 * a route to the player. Rendering and listening are read-only consumers. */
const SOUND_KINDS=['steps','torch','machine','decoy','cart'];
const SOUND_LABELS={cart:'Roues de manutention',steps:'Pas précipités',torch:'Souffle du chalumeau',machine:'Cycle de machine',decoy:'Signal d’un leurre'};
export function addResidue(s,room,kind,x,y){
 if(!ROOM[room]||!['decoy','scorch','scrape'].includes(kind))return false;
 const list=s.residue[room]||(s.residue[room]=[]),r=ROOM[room];
 if(kind!=='decoy'&&list.some(v=>v.kind===kind&&Math.hypot(v.x-x,v.y-y)<65))return false;
 list.push({kind,x:clamp(x,28,r.width-28),y:r.mode==='profile'?88:clamp(y,0,180),at:s.elapsed});
 if(list.length>DATA.acoustics.maxResiduesPerRoom)list.shift();s.dirty=true;return true;
}
export function emitSound(s,kind,x,y,volume=1,room=s.room){
 if(!ROOM[room]||!SOUND_KINDS.includes(kind)||s.dead||s.finished)return null;
 const cue={id:++s.soundSeq,kind,room,x:clamp(x,30,ROOM[room].width-30),y:ROOM[room].mode==='profile'?88:clamp(y,0,180),volume:clamp(volume,.1,1),ttl:2.1};
 s.soundField.push(cue);s.soundField=s.soundField.slice(-16);
 // The log contains only one's own emitted sounds, never a hidden enemy roster.
 const last=s.soundLog.at(-1);
 if(!last||last.kind!==kind||last.room!==room||s.elapsed-last.at>4){s.soundLog.push({kind,room,at:s.elapsed});s.soundLog=s.soundLog.slice(-16);}
 if(s.chapter<6||s.chapter>10)return cue;
 for(const portal of ROOM[room].portals){
  if(!DATA.acoustics.edges.includes(portal.edge)||!pursuitAllowed(s,portal.edge)||DATA.pursuitRules.safeRooms.includes(room)||doorStatus(s,portal.edge).sealed)continue;
  const origin=portal.target,back=ROOM[origin].portals.find(p=>p.edge===portal.edge),world=s.world[origin];
  if(!world||!back)continue; // Never instantiate a distant room to populate it.
  const toDoor=Math.hypot(cue.x-portal.x,(cue.y-portal.y)*1.4);
  for(const e of world.enemies){
   if(e.type!=='adult'||e.stun>0||e.attack>0||e.passage)continue;
   const distance=toDoor+Math.hypot(e.x-back.x,(e.y-back.y)*1.4);
   if(distance>DATA.acoustics.range*cue.volume)continue;
   e.passage={edge:portal.edge,from:origin,to:room,remaining:DATA.acoustics.memory,wait:DATA.pursuitRules.crossingTime,reason:'sound',source:{x:cue.x,y:cue.y}};
   e.targetX=back.x;e.targetY=back.y;e.path=[];e.pathTimer=0;e.state='track';e.attack=0;
   s.metrics.soundInvestigations++;s.dirty=true;
  }
 }
 return cue;
}
function tickAcoustics(s,dt){
 for(const key of Object.keys(s.acousticTimers))s.acousticTimers[key]=Math.max(0,s.acousticTimers[key]-dt);
 for(const q of s.soundField)q.ttl-=dt;s.soundField=s.soundField.filter(q=>q.ttl>0);
 for(const a of DATA.interactables.filter(a=>a.kind==='machine')){
  if(s.machines[a.id]?.remaining>0&&(s.acousticTimers[a.id]||0)<=0){s.acousticTimers[a.id]=2;emitSound(s,'machine',a.x,a.y,1,a.room);}
 }
 for(const lure of s.lures){lure.time-=dt;lure.pulse-=dt;if(lure.time<=0)addResidue(s,lure.room,'decoy',lure.x,lure.y);else if(lure.pulse<=0){lure.pulse=2;emitSound(s,'decoy',lure.x,lure.y,1,lure.room);}}
 s.lures=s.lures.filter(l=>l.time>0);s.decoy=s.lures.filter(l=>l.room===s.room).at(-1)||null;
 for(const w of Object.values(s.world))for(const e of w.enemies)e.decoyMemory=(e.decoyMemory||[]).filter(m=>m.until>s.elapsed);
}
function localSound(s,e){
 // Portable lures and machines have their own priorities and adaptation rules.
 return s.soundField.filter(q=>q.room===s.room&&['torch','steps'].includes(q.kind)&&Math.hypot(q.x-e.x,(q.y-e.y)*1.5)<q.volume*700).at(-1)||null;
}
function lureArea(s,lure){return lure.room+':'+Math.floor(lure.x/180);}
function decoyAttractor(s,e,canSee){
 const lure=s.decoy;if(!lure||canSee||Math.abs(lure.x-e.x)>=1100)return null;
 if(e.type==='adult'){
  const memory=(e.decoyMemory||[]).find(m=>m.area===lureArea(s,lure)&&m.until>s.elapsed);
  if(memory?.count>=DATA.acoustics.decoySameAreaLimit&&e.checkedLure!==lure.id){
   if(e.ignoredLure!==lure.id){e.ignoredLure=lure.id;s.metrics.decoysIgnored++;if(Math.abs(e.x-s.player.x)<520)notice(s,'Elle ne s’arrête plus au même signal. Changez l’emplacement du leurre.',4);}
   return null;
  }
 }
 return lure;
}
function inspectDecoy(s,e,dt){
 const lure=s.decoy;
 if(e.type!=='adult'||!lure||e.checkedLure===lure.id||e.state!=='investigate'||e.targetX!==lure.x||Math.hypot(e.x-lure.x,e.y-lure.y)>44){e.inspectTime=0;return;}
 e.inspectTime=(e.inspectTime||0)+dt;
 if(e.inspectTime<DATA.acoustics.decoyInspectSeconds)return;
 e.checkedLure=lure.id;e.inspectTime=0;e.decoyMemory=e.decoyMemory||[];
 const area=lureArea(s,lure);let memory=e.decoyMemory.find(m=>m.area===area);
 if(!memory){memory={area,count:0,until:0};e.decoyMemory.push(memory);}
 memory.count=Math.min(2,memory.count+1);memory.until=s.elapsed+DATA.acoustics.decoyMemorySeconds;
 e.decoyMemory=e.decoyMemory.slice(-6);s.metrics.decoysInspected++;s.dirty=true;
}
export function listenReport(s){
 const masked=DATA.interactables.some(a=>a.kind==='machine'&&a.room===s.room&&s.machines[a.id]?.remaining>0&&Math.abs(a.x-s.player.x)<DATA.acoustics.maskRadius);
 if(masked)return {masked:true,signals:[],label:'LE MOTEUR COUVRE LES AUTRES BRUITS'};
 const signals=[],r=roomGeometry(s),p=s.player;
 const cue=(x,strength,label,edge=null)=>signals.push({direction:Math.abs(x-p.x)<70?'proche':x<p.x?'gauche':'droite',strength,label,edge});
 // Only movement/impact emits a detectable contact. A stationary actor is not radar-visible.
 for(const e of s.world[s.room]?.enemies||[]){
  if(!(e.moving||e.attack>0||e.passage)||e.stun>0)continue;
  const d=Math.hypot(e.x-p.x,(e.y-p.y)*1.5),occluded=lineBlocked(r,e.x,e.y,p.x,p.y),reach=DATA.acoustics.listenRange*(occluded?.55:1);
  if(d<reach)cue(e.x,1-d/reach,occluded?'Frottement étouffé':'Mouvement au sol');
 }
 for(const portal of r.portals){
  if(!DATA.acoustics.edges.includes(portal.edge)||!activeEdges(s,true).some(e=>e.id===portal.edge))continue;
  const back=ROOM[portal.target].portals.find(p=>p.edge===portal.edge);if(!back)continue;
  for(const e of s.world[portal.target]?.enemies||[]){
   if(!e.passage||e.stun>0||!e.moving&&e.state!=='battering'&&e.state!=='crossing')continue;
   const d=Math.hypot(p.x-portal.x,p.y-portal.y)+Math.hypot(e.x-back.x,e.y-back.y),sealed=doorStatus(s,portal.edge).sealed;
   const reach=DATA.acoustics.listenRange*(sealed?.55:1);
   if(d<reach)cue(portal.x,1-d/reach,sealed?'Chocs derrière la cloison':'Frottement au seuil',portal.edge);
  }
 }
 for(const q of s.soundField){if(q.room!==s.room||!['decoy','machine'].includes(q.kind))continue;const d=Math.abs(q.x-p.x);if(d<DATA.acoustics.listenRange)cue(q.x,(1-d/DATA.acoustics.listenRange)*.5,SOUND_LABELS[q.kind]);}
 signals.sort((a,b)=>b.strength-a.strength);
 const limited=signals.filter((q,i,arr)=>arr.findIndex(t=>t.direction===q.direction&&t.label===q.label)===i).slice(0,3);
 return {masked:false,signals:limited,label:limited.length?limited[0].label.toUpperCase()+' · '+limited[0].direction.toUpperCase():'AUCUN BRUIT DISTINCT'};
}
export function soundHistory(s){return s.soundLog.map(q=>({...q,label:SOUND_LABELS[q.kind],roomLabel:ROOM[q.room].name}));}
function restoreAcoustics(s,v){
 s.soundSeq=Math.floor(clamp(v.soundSeq,0,1000000));
 const goodPoint=(x,y,r)=>({x:clamp(x,30,r.width-30),y:r.mode==='profile'?88:clamp(y,0,180)});
 const ids=new Set();s.lures=[];
 for(const l of (Array.isArray(v.lures)?v.lures:[]).slice(-DATA.acoustics.maxLures)){
  if(!l||!ROOM[l.room]||typeof l.id!=='string'||!/^lure-\d{1,8}$/.test(l.id)||ids.has(l.id)||!(l.time>0))continue;
  const pt=goodPoint(l.x,l.y,ROOM[l.room]);if(collision(ROOM[l.room],pt.x,pt.y,8))continue;
  ids.add(l.id);s.lures.push({id:l.id,room:l.room,...pt,time:clamp(l.time,0,5),pulse:clamp(l.pulse,0,2)});s.soundSeq=Math.max(s.soundSeq,Number(l.id.slice(5)));
 }
 s.decoy=s.lures.filter(l=>l.room===s.room).at(-1)||null;
 s.soundLog=(Array.isArray(v.soundLog)?v.soundLog:[]).filter(q=>q&&ROOM[q.room]&&SOUND_KINDS.includes(q.kind)).slice(-16).map(q=>({kind:q.kind,room:q.room,at:clamp(q.at,0,s.elapsed)}));
 s.soundField=(Array.isArray(v.soundField)?v.soundField:[]).filter(q=>q&&ROOM[q.room]&&SOUND_KINDS.includes(q.kind)&&q.ttl>0).slice(-16).map(q=>({kind:q.kind,room:q.room,...goodPoint(q.x,q.y,ROOM[q.room]),ttl:clamp(q.ttl,0,2.1),volume:clamp(q.volume,.1,1),id:Math.floor(clamp(q.id,0,1000000))}));
 for(const key of ['steps',...DATA.interactables.filter(a=>a.kind==='machine').map(a=>a.id)])if(v.acousticTimers?.[key])s.acousticTimers[key]=clamp(v.acousticTimers[key],0,2);
 if(v.residue&&typeof v.residue==='object')for(const r of DATA.rooms){const entries=v.residue[r.id];if(!Array.isArray(entries))continue;s.residue[r.id]=entries.filter(q=>q&&['decoy','scorch','scrape'].includes(q.kind)).slice(-DATA.acoustics.maxResiduesPerRoom).map(q=>({kind:q.kind,...goodPoint(q.x,q.y,r),at:clamp(q.at,0,s.elapsed)}));}
 for(const [room,w] of Object.entries(s.world))for(const e of w.enemies){
  const old=v.world?.[room]?.enemies?.find(o=>o?.id===e.id);if(!old||e.type!=='adult')continue;
  e.decoyMemory=[];
  for(const m of (Array.isArray(old.decoyMemory)?old.decoyMemory:[]).slice(-6)){
   if(!m||typeof m.area!=='string')continue;const [id,band]=m.area.split(':');
   if(!ROOM[id]||!/^\d+$/.test(band)||Number(band)>Math.floor(ROOM[id].width/180)||!(m.until>s.elapsed))continue;
   if(e.decoyMemory.some(t=>t.area===m.area))continue;
   e.decoyMemory.push({area:m.area,count:Math.floor(clamp(m.count,0,2)),until:clamp(m.until,s.elapsed,s.elapsed+80)});
  }
  if(ids.has(old.checkedLure))e.checkedLure=old.checkedLure;
 }
}

// V0.6 — optional maintenance. The mandatory route never spends these parts.
export function maintenanceStatus(s,id){
 const job=DATA.maintenance.repairs.find(j=>j.id===id);
 if(!job)return {exists:false,done:false,stage:0,label:'Accès inconnu'};
 const stage=Math.floor(clamp(s.maintenance?.repairs?.[id],0,3));
 return {exists:true,id,edge:job.edge,stage,done:stage===3,label:stage===3?'PASSAGE RÉTABLI':job.stages[stage].label,
  cost:stage===3?0:job.stages[stage].cost,hold:stage===3?0:job.stages[stage].hold,available:s.chapter>=job.minChapter};
}
export function observeMaintenance(s){
 const m=s.maintenance,r=ROOM[s.room],p=s.player;if(!m)return;
 for(const a of DATA.interactables.filter(a=>a.room===s.room))if(Math.hypot(a.x-p.x,(a.y-p.y)*1.2)<210&&!m.observed.includes(a.id))m.observed.push(a.id);
 for(const po of r.portals){const j=DATA.maintenance.repairs.find(j=>j.edge===po.edge);if(j&&s.chapter>=j.minChapter&&Math.hypot(po.x-p.x,(po.y-p.y)*1.2)<210&&!m.seen.includes(j.id))m.seen.push(j.id);}
}
function stepMaintenance(s,input,dt,moving,hpBefore){
 const near=nearby(s),po=near?.kind==='portal'?near.item:null;
 const job=po&&DATA.maintenance.repairs.find(j=>j.edge===po.edge),status=job&&maintenanceStatus(s,job.id);
 const reset=()=>{s.maintenanceHold=0;s.maintenanceTarget=null;};
 if(job&&status.done&&input.interact&&s.maintenancePressDone){reset();return true;}
 if(!job||status.done||!input.interact){reset();return false;}
 if(s.maintenancePressDone){reset();return true;}
 if(moving||input.bulkhead||input.fire||input.decoy||input.listen||input.heal||s.dead||s.player.hp<hpBefore||s.flags.carryRipley||s.flags.cellCarried){reset();return true;}
 if(!status.available){notice(s,'La desserte reste isolée pour le moment.');reset();s.maintenancePressDone=true;return true;}
 if(s.maintenance.parts<status.cost){notice(s,`${status.cost} pièces nécessaires ; ${s.maintenance.parts} en réserve. Le chemin principal reste ouvert.`,5);reset();s.maintenancePressDone=true;return true;}
 if(s.portalCooldown>0){reset();return true;}
 s.player.hidden=null;
 if(s.maintenanceTarget!==job.id){reset();s.maintenanceTarget=job.id;}
 s.maintenanceHold+=dt;s.noise=Math.max(s.noise,.7);
 if(s.maintenanceNoise<=0){emitSound(s,'machine',po.x,po.y,.72);s.maintenanceNoise=1.2;}
 if(s.maintenanceHold+1e-8>=status.hold){
  // Atomic commit: recheck before deducting; the next stage requires a fresh press.
  if(s.maintenance.parts<status.cost){reset();return true;}
  s.maintenance.parts-=status.cost;s.maintenance.repairs[job.id]=status.stage+1;s.dirty=true;s.maintenancePressDone=true;reset();
  const after=maintenanceStatus(s,job.id);
  if(after.done){notice(s,job.title+' : passage remis en service.',6);s.journal.push({chapter:s.chapter,text:'Maintenance facultative — '+job.title+' rétablie.'});s.portalCooldown=.8;}
  else notice(s,`Étape ${after.stage}/3 enregistrée. Relâchez E, puis ${after.label.toLowerCase()}.`,5);
 }
 return true;
}
export function useMaintenanceActivity(s,a){
 if(s.dead||s.finished||a.room!==s.room||Math.hypot(a.x-s.player.x,a.y-s.player.y)>80||s.flags.carryRipley||s.flags.cellCarried)return false;
 if(a.kind==='fabricator'){
  s.reading={kind:'fabricator',station:a.id,title:a.title};s.dirty=true;return true;
 }
 if(a.kind!=='salvage'||s.maintenance.salvaged.includes(a.id))return false;
 if(s.maintenance.parts+a.amount>DATA.maintenance.maxParts){notice(s,'Le sac est plein ; le casier reste intact.');return false;}
 s.maintenance.parts+=a.amount;s.maintenance.salvaged.push(a.id);s.maintenance.observed.push(a.id);s.maintenance.observed=[...new Set(s.maintenance.observed)];
 notice(s,`Trois pièces récupérées. Réserve : ${s.maintenance.parts}. I ouvre le sac de maintenance.`,5);s.dirty=true;return true;
}
export function craftPreview(s,stationId,recipeId){
 const station=DATA.interactables.find(a=>a.id===stationId&&a.kind==='fabricator'),recipe=DATA.maintenance.recipes.find(r=>r.id===recipeId);
 if(!station||!recipe)return {ok:false,reason:'Assemblage inconnu'};
 if(s.dead||s.finished||s.flags.carryRipley||s.flags.cellCarried)return {ok:false,reason:'Les mains ne sont pas libres'};
 if(station.room!==s.room||Math.hypot(s.player.x-station.x,s.player.y-station.y)>80)return {ok:false,reason:'Rejoignez physiquement cet établi'};
 if(s.maintenance.parts<recipe.cost)return {ok:false,reason:recipe.cost+' pièces nécessaires'};
 if(s.player[recipe.resource]+recipe.amount>recipe.limit)return {ok:false,reason:'Capacité insuffisante — aucune pièce dépensée'};
 return {ok:true,reason:'Assembler · '+recipe.cost+' pièces',recipe};
}
export function craftItem(s,stationId,recipeId){
 const preview=craftPreview(s,stationId,recipeId);
 // Merely opening inventory does not authorize a remote station action.
 if(s.reading?.kind!=='fabricator'||s.reading.station!==stationId)return false;
 if(!preview.ok){notice(s,preview.reason);return false;}
 const r=preview.recipe;s.maintenance.parts-=r.cost;s.player[r.resource]+=r.amount;s.maintenance.crafted[r.id]=(s.maintenance.crafted[r.id]||0)+1;s.dirty=true;
 notice(s,r.title+' assemblé. '+s.maintenance.parts+' pièces restantes.');return true;
}
export function maintenanceOverview(s){
 return {parts:s.maintenance.parts,salvaged:s.maintenance.salvaged.length,totalSalvage:DATA.interactables.filter(a=>a.kind==='salvage').length,
  jobs:DATA.maintenance.repairs.filter(j=>s.maintenance.seen.includes(j.id)).map(j=>({...j,...maintenanceStatus(s,j.id)})),
  stations:DATA.interactables.filter(a=>a.kind==='fabricator'&&s.maintenance.observed.includes(a.id)).map(a=>({...a,roomLabel:ROOM[a.room].name})),tracked:s.maintenance.tracked};
}
export function trackMaintenance(s,id){
 if(id!==null&&!s.maintenance.seen.includes(id))return false;s.maintenance.tracked=id;s.dirty=true;return true;
}
export function maintenanceRoute(s){
 const job=DATA.maintenance.repairs.find(j=>j.id===s.maintenance.tracked);if(!job||maintenanceStatus(s,job.id).done)return null;
 const candidates=[job.a,job.b].map(room=>({room,path:route(s,room)})).filter(c=>c.path!==null).sort((a,b)=>a.path.length-b.path.length);
 return candidates.length?{...candidates[0],id:job.id,title:job.title,status:maintenanceStatus(s,job.id)}:null;
}
function restoreMaintenance(s,v){
 const m=s.maintenance,old=v.maintenance||{};
 m.salvaged=uniqueKnown(old.salvaged,DATA.interactables.filter(a=>a.kind==='salvage').map(a=>a.id));
 // Derive the balance from a bounded ledger, not an arbitrary supplied parts value.
 let balance=m.salvaged.reduce((n,id)=>n+DATA.interactables.find(a=>a.id===id).amount,0);
 for(const j of DATA.maintenance.repairs){let stage=Math.floor(clamp(old.repairs?.[j.id],0,3));if(stage>=2){if(balance>=j.cost)balance-=j.cost;else stage=1;}if(stage)m.repairs[j.id]=stage;}
 for(const r of DATA.maintenance.recipes){const count=Math.floor(clamp(old.crafted?.[r.id],0,Math.floor(balance/r.cost)));if(count){m.crafted[r.id]=count;balance-=count*r.cost;}}
 m.parts=Math.min(DATA.maintenance.maxParts,balance);
 m.observed=uniqueKnown(old.observed,DATA.interactables.filter(a=>s.visited.includes(a.room)).map(a=>a.id));
 m.seen=uniqueKnown(old.seen,DATA.maintenance.repairs.filter(j=>s.chapter>=j.minChapter&&(s.visited.includes(j.a)||s.visited.includes(j.b))).map(j=>j.id));
 m.tracked=m.seen.includes(old.tracked)?old.tracked:null;
}
export function localChart(s){
 const r=roomGeometry(s),observed=new Set(s.maintenance.observed);
 return {id:r.id,name:r.name,width:r.width,mode:r.mode,player:{x:s.player.x,y:s.player.y},flood:DATA.excursion.floods.find(f=>f.room===r.id)?{...DATA.excursion.floods.find(f=>f.room===r.id),level:excursionStatus(s).water}:null,recorder:s.excursion.recorder?.room===r.id&&!s.excursion.recorder.carried?{...s.excursion.recorder}:null,
  walls:(r.walls||[]).map(w=>({...w})),props:r.props.map(p=>({x:p.x,y:p.y,width:PROP[p.type].width,solid:!!p.solid,label:PROP[p.type].label,movable:p.movable||null})),
  activities:DATA.interactables.filter(a=>a.room===s.room&&observed.has(a.id)).map(a=>({id:a.id,x:a.x,y:a.y,kind:a.kind,label:a.title,used:s.collected.includes(a.id)||s.records.includes(a.id)||s.maintenance.salvaged.includes(a.id)||a.kind==='excursion'&&s.excursion.done.includes(a.operation)})),
  portals:r.portals.filter(p=>s.discoveredPortals.includes(p.id)).map(p=>({id:p.id,x:p.x,y:p.y,open:activeEdges(s).some(e=>e.id===p.edge),label:s.visited.includes(p.target)?ROOM[p.target].name:'Accès non reconnu',repair:p.repair?maintenanceStatus(s,p.repair):null}))};
}


/** V0.7 optional water circuit. All durations are simulation time; no real-world timers.
 * The primary campaign flags are never edited by this subsystem. */
export function excursionStatus(s){
 const x=s.excursion||{done:[],pumpElapsed:0,recorder:null},stage=x.done.length;
 const water=stage<3?1:1-clamp(x.pumpElapsed,0,DATA.excursion.pumpSeconds)/DATA.excursion.pumpSeconds;
 return {stage,water,drained:water<=0,pumping:stage>=3&&water>0,complete:stage===DATA.excursion.ops.length,
  remaining:stage>=3?Math.max(0,DATA.excursion.pumpSeconds-x.pumpElapsed):DATA.excursion.pumpSeconds,
  current:DATA.excursion.ops[stage]||null,carried:!!x.recorder?.carried,discovered:!!x.discovered};
}
export function floodAt(s,room,x,y){
 const f=DATA.excursion.floods.find(f=>f.room===room);if(!f||x<f.left||x>f.right||y<f.front)return 0;
 return excursionStatus(s).water;
}
export function excursionOperation(s,id){
 const op=DATA.excursion.ops.find(o=>o.id===id),x=excursionStatus(s);
 if(!op)return {ok:false,label:'Commande inconnue'};
 if(s.dead||s.finished)return {ok:false,label:'Liaison interrompue'};
 if(s.chapter<DATA.excursion.minChapter)return {ok:false,label:'La concession reste inaccessible'};
 if(s.excursion.done.includes(id))return {ok:false,done:true,label:'Intervention terminée',op};
 if(x.current?.id!==id)return {ok:false,label:'Effectuez d’abord : '+(x.current?.title||'relevé terminé'),op};
 if(id==='unlock'&&!x.drained)return {ok:false,label:'Pompage en cours · '+Math.ceil(x.remaining)+' s',op};
 if(id==='dock'&&!x.carried)return {ok:false,label:'L’enregistreur doit être rapporté au lecteur',op};
 if(s.flags.carryRipley||s.flags.cellCarried)return {ok:false,label:'Vos mains sont occupées',op};
 return {ok:true,label:op.title,op};
}
function tickExcursion(s,dt){
 const x=s.excursion;
 if(DATA.excursion.rooms.includes(s.room)&&!x.discovered){x.discovered=true;s.dirty=true;notice(s,'Caniveau inondé. Le panneau de relevé local est accessible avec O.',5);}
 if(x.done.length>=3&&x.pumpElapsed<DATA.excursion.pumpSeconds){
  const was=x.pumpElapsed;x.pumpElapsed=Math.min(DATA.excursion.pumpSeconds,was+dt);
  if(x.pumpElapsed===DATA.excursion.pumpSeconds){s.dirty=true;notice(s,'Niveau bas atteint. La traverse et l’armoire sont libérées.',6);}
  if((s.acousticTimers.pumpCircuit||0)<=0){s.acousticTimers.pumpCircuit=2;emitSound(s,'machine',1200,88,.9,'exchanger');}
 }
}
function stepExcursion(s,input,dt,moving,hpBefore){
 const near=nearby(s),a=near?.kind==='activity'&&near.item.kind==='excursion'?near.item:null;
 const reset=()=>{s.excursionHold=0;s.excursionTarget=null;};
 if(!a||!input.interact){reset();return false;}
 if(s.excursionPressDone){reset();return true;}
 if(moving||input.fire||input.decoy||input.bulkhead||input.listen||input.heal||s.dead||s.player.hp<hpBefore){reset();return true;}
 const status=excursionOperation(s,a.operation);
 if(!status.ok){notice(s,status.label);s.excursionPressDone=true;reset();return true;}
 if(s.portalCooldown>0){reset();return true;}
 s.player.hidden=null;
 if(s.excursionTarget!==a.id){reset();s.excursionTarget=a.id;}
 s.excursionHold+=dt;
 if(s.excursionNoise<=0){emitSound(s,'machine',a.x,a.y,.66);s.excursionNoise=1.3;}
 if(s.excursionHold+1e-8>=a.hold){
  const op=status.op;s.excursion.done.push(op.id);s.excursionPressDone=true;reset();s.dirty=true;
  if(op.id==='recover')s.excursion.recorder={carried:true,room:s.room,x:s.player.x,y:s.player.y};
  if(op.id==='dock')s.excursion.recorder=null;
  if(op.id==='transmit'&&!s.records.includes(DATA.excursion.rewardRecord))s.records.push(DATA.excursion.rewardRecord);
  s.journal.push({chapter:s.chapter,text:'Relevé facultatif — '+op.after});notice(s,op.after,6);s.portalCooldown=.35;
 }
 return true;
}
export function dropRecorder(s){
 if(s.dead||s.finished||s.puzzle||s.reading||!s.excursion.recorder?.carried)return false;
 s.excursion.recorder={carried:false,room:s.room,x:s.player.x,y:s.player.y};s.excursionHold=0;s.excursionTarget=null;s.dirty=true;
 notice(s,'Enregistreur posé. Il restera ici ; E à proximité pour le reprendre.',5);return true;
}
export function takeRecorder(s){
 const r=s.excursion.recorder;
 if(!r||r.carried||r.room!==s.room||s.dead||s.finished||s.flags.cellCarried||s.flags.carryRipley||Math.hypot(r.x-s.player.x,r.y-s.player.y)>76)return false;
 r.carried=true;s.dirty=true;notice(s,'Enregistreur sanglé. Le lecteur attend au poste de relevé.');return true;
}
function restoreExcursion(s,v){
 const x=s.excursion,old=v.excursion||{},ids=DATA.excursion.ops.map(o=>o.id);let n=0;
 if(Array.isArray(old.done))while(n<ids.length&&old.done[n]===ids[n])n++;
 if(s.chapter<DATA.excursion.minChapter)n=0;
 x.done=ids.slice(0,n);x.pumpElapsed=n<3?0:n>=4?DATA.excursion.pumpSeconds:clamp(old.pumpElapsed,0,DATA.excursion.pumpSeconds);
 x.discovered=s.visited.some(id=>DATA.excursion.rooms.includes(id));x.tracked=old.tracked!==false;
 if(n===5){const r=old.recorder||{},room=ROOM[r.room]?r.room:'specimen_store',rr=ROOM[room];let px=clamp(r.x??870,28,rr.width-28),py=rr.mode==='profile'?88:clamp(r.y??88,0,180);
  if(collision(rr,px,py)){px=170;py=88;}
  x.recorder={carried:r.carried===true,room,x:px,y:py};
 }
 if(n===ids.length&&!s.records.includes(DATA.excursion.rewardRecord))s.records.push(DATA.excursion.rewardRecord);
 // Replay authored optional logs from the validated prefix; do not trust arbitrary text.
 for(const op of DATA.excursion.ops.slice(0,n))s.journal.push({chapter:s.chapter,text:'Relevé facultatif — '+op.after});
}


/** V0.8 narrative vignettes. They never complete gameplay goals or grant resources. */
export function unlockedSequences(s){return DATA.sequences.filter(q=>q.at<=s.completed.length);}
export function pendingSequence(s){
 if(s.handling?.grip)return null;
 if(!s.presentation.enabled||s.dead||s.puzzle||s.reading||s.player.hidden)return null;
 const candidate=s.presentation.pending.map(id=>DATA.sequences.find(q=>q.id===id)).find(q=>q&&q.at<=s.completed.length&&q.at>=s.completed.length-3);
 if(!candidate)return null;
 const enemies=s.world[s.room]?.enemies||[];
 if(enemies.some(e=>!e.passage&&Math.hypot(e.x-s.player.x,(e.y-s.player.y)*1.5)<DATA.presentationRules.safeRadius)||incomingThreats(s).length||activeHazards(s).some(h=>h.active&&Math.abs(h.x-s.player.x)<h.width))return null;
 return candidate;
}
export function acknowledgeSequence(s,id){
 if(!unlockedSequences(s).some(q=>q.id===id))return false;
 if(!s.presentation.seen.includes(id))s.presentation.seen.push(id);
 s.presentation.pending=s.presentation.pending.filter(x=>x!==id);s.dirty=true;return true;
}
function restorePresentation(s,v){
 const known=unlockedSequences(s).map(q=>q.id),p=v.presentation||{};
 s.presentation={enabled:p.enabled!==false,autoAdvance:p.autoAdvance===true,captionScale:[1,1.2,1.4].includes(p.captionScale)?p.captionScale:1,seen:uniqueKnown(p.seen,known),pending:[]};
 // Legacy imports do not replay all old scenes on load. Their gallery is still unlocked.
 if(v.schema<8)s.presentation.seen=known;
 else s.presentation.pending=uniqueKnown(p.pending,known).filter(id=>!s.presentation.seen.includes(id));
}
/** A scene is a staged copy: render mutations cannot affect the live campaign. */
export function makeSequenceState(s,id,shot=0){
 const q=DATA.sequences.find(q=>q.id===id);if(!q||q.at>s.completed.length)return null;
 const raw=createState(s.difficulty);raw.completed=DATA.chapters.flatMap(c=>c.objectives).slice(0,q.at).map(o=>o.id);raw.room=q.room;
 const stage=restore(serialize(raw));stage.player.x=Math.max(90,Math.min(ROOM[q.room].width-90,q.shots[shot]?.x||750));stage.player.y=88;stage.player.hp=100;stage.invuln=0;stage.flash=false;stage.reducedMotion=s.reducedMotion;
 stage.world[q.room]={enemies:[],eggs:{},cleared:true,spawned:true,visitTime:0};stage.noticeTime=0;stage.presentation.enabled=false;return stage;
}
/** Stored chapter starts are genuine snapshots, not generated loadouts. */
export function chapterEntry(s){
 if(s.dead||s.finished||s.goal!==0||s.completed.length!==s.chapter*3)return null;
 return {schema:1,chapter:s.chapter,completed:s.completed.length,room:s.room,elapsed:s.elapsed,snapshot:serialize(s)};
}
export function readChapterEntry(raw){
 try{const e=typeof raw==='string'?JSON.parse(raw):raw;if(!e||e.schema!==1||!Number.isInteger(e.chapter)||e.chapter<0||e.chapter>=DATA.chapters.length||typeof e.snapshot!=='string')return null;
 const s=restore(e.snapshot);if(!s||s.finished||s.goal!==0||s.chapter!==e.chapter||s.completed.length!==e.chapter*3||s.room!==e.room)return null;
 return {schema:1,chapter:s.chapter,completed:s.completed.length,room:s.room,elapsed:s.elapsed,snapshot:serialize(s),thumbnail:typeof e.thumbnail==='string'&&e.thumbnail.length<150000&&/^data:image\/webp;base64,[a-zA-Z0-9+/=]+$/.test(e.thumbnail)?e.thumbnail:null};
 }catch{return null;}
}
export function journeySummary(s){return {objectives:s.completed.length,rooms:s.visited.length,totalRooms:DATA.rooms.length,records:s.records.length,physicalRecords:DATA.interactables.filter(a=>a.kind==='archive'&&s.records.includes(a.id)).length,totalRecords:DATA.interactables.filter(a=>a.kind==='archive').length,repairs:DATA.maintenance.repairs.filter(j=>maintenanceStatus(s,j.id).done).length,totalRepairs:DATA.maintenance.repairs.length,excursion:excursionStatus(s).stage,totalExcursion:DATA.excursion.ops.length,companions:s.metrics.companionPassages,damageEvents:s.metrics.attacks,minutes:Math.floor(s.elapsed/60)};}


export function validateMemoryBundle(raw){
 try{
  if(typeof raw!=='string'||raw.length>5000000)return null;
  const b=JSON.parse(raw);if(b?.format!=='atf-marion-memories'||b.schema!==1||!Array.isArray(b.entries)||b.entries.length>16)return null;
  const main=restore(b.campaign);if(!main)return null;
  const replay=b.replay===null?null:restore(b.replay);if(b.replay!==null&&!replay)return null;
  const seen=new Set(),entries=[];
  for(const item of b.entries){const e=readChapterEntry(item);if(!e||seen.has(e.chapter)||e.completed>main.completed.length)return null;seen.add(e.chapter);entries.push(e);}
  return {format:'atf-marion-memories',schema:1,campaign:serialize(main),replay:replay?serialize(replay):null,entries};
 }catch{return null;}
}


/** V0.9 — bounded manual handling.
 * Geometry is derived per state, never written into ROOM or DATA. Every move
 * sweeps the cart AND the player; a failed substep moves neither of them.
 * Navigation caches use geometry object identity and cannot leak across saves.
 */
const geometryCache = new WeakMap();
export function cartPosition(s,id){const def=DATA.handling.carts.find(c=>c.id===id);return def?(s.handling?.positions?.[id]||{x:def.x,y:def.y}):null;}
export function roomGeometry(s,id=s.room){
 const base=ROOM[id];if(!base)return null;
 const carts=DATA.handling.carts.filter(c=>c.room===id);if(!carts.length)return base;
 const key=carts.map(c=>{const p=cartPosition(s,c.id);return c.id+':'+p.x+':'+p.y;}).join('|');
 let cache=geometryCache.get(s);if(!cache){cache=new Map();geometryCache.set(s,cache);}const old=cache.get(id);if(old?.key===key)return old.value;
 const map=new Map(carts.map(c=>[c.propId,{...cartPosition(s,c.id),movable:c.id}]));
 const value={...base,geometryKey:id+'|'+key,props:base.props.map(p=>map.has(p.id)?{...p,...map.get(p.id)}:p)};
 cache.set(id,{key,value});return value;
}
export function cartsInRoom(s,id=s.room){return DATA.handling.carts.filter(c=>c.room===id).map(c=>({...c,...cartPosition(s,c.id),width:PROP[c.type].width,height:PROP[c.type].height,gripped:s.handling?.grip?.id===c.id}));}
export function observeHandling(s){
 for(const c of cartsInRoom(s))if(Math.hypot(c.x-s.player.x,c.y-s.player.y)<240&&!s.handling.observed.includes(c.id)){s.handling.observed.push(c.id);s.dirty=true;}
}
export function nearestCart(s){
 let best=null,bestD=DATA.handling.gripRadius;
 for(const c of cartsInRoom(s))for(const side of [-1,1]){const handle={x:c.x+side*(c.width/2+DATA.handling.handleOffset),y:c.y};const d=Math.hypot(s.player.x-handle.x,(s.player.y-handle.y)*1.45);
  if(d<bestD&&!collision(roomGeometry(s),s.player.x,s.player.y)){bestD=d;best={...c,side,handle,distance:d};}}
 return best;
}
export function releaseCart(s,reason=''){
 if(!s.handling?.grip)return false;s.handling.grip=null;s.gripMoved=false;s.dirty=true;if(reason)notice(s,reason,2.6);else if(s.notice?.startsWith('Poignées en main.'))notice(s,'Freins serrés. Le matériel reste ici.',2.6);return true;
}
export function gripCart(s){
 if(s.dead||s.finished||s.puzzle||s.reading||s.player.hidden||s.player.crouch||s.flags.carryRipley||s.flags.cellCarried||s.excursion.recorder?.carried){notice(s,'Il faut être debout, les deux mains libres.');return false;}
 const c=nearestCart(s);if(!c){notice(s,'Approchez d’une poignée latérale, puis maintenez X.');return false;}
 s.handling.grip={id:c.id,room:c.room,side:c.side,offsetX:s.player.x-c.x,offsetY:s.player.y-c.y};s.player.face=-c.side;s.metrics.cartGrips++;s.dirty=true;
 if(!s.handling.observed.includes(c.id))s.handling.observed.push(c.id);notice(s,'Poignées en main. Déplacez-vous ; relâchez X pour freiner.',3);return true;
}
function boxOverlap(a,b,pad=0){return a.x+a.w+pad>b.x&&a.x-pad<b.x+b.w&&a.y+a.h+pad>b.y&&a.y-pad<b.y+b.h;}
function cartBox(c,pos){return {x:pos.x-PROP[c.type].width/2,y:pos.y-18,w:PROP[c.type].width,h:36};}
export function cartPlacement(s,id,pos,includeActors=true){
 const def=DATA.handling.carts.find(c=>c.id===id);if(!def||!Number.isFinite(pos?.x)||!Number.isFinite(pos?.y))return 'invalid';
 const b=def.bay;if(pos.x<b.left||pos.x>b.right||pos.y<b.back||pos.y>b.front)return 'limit';
 const r=roomGeometry(s,def.room),q=cartBox(def,pos);
 for(const p of r.props)if(p.id!==def.propId&&p.solid&&boxOverlap(q,rect(p),2))return 'furniture';
 // Keep every authored interaction and threshold accessible from both sides.
 const points=[...r.nodes,...r.portals,...DATA.interactables.filter(a=>a.room===def.room)];
 for(const p of points){const margin=DATA.handling.pointClearance;if(boxOverlap(q,{x:p.x-margin,y:p.y-18,w:margin*2,h:36}))return 'access';}
 const recorder=s.excursion?.recorder;if(recorder&&!recorder.carried&&recorder.room===def.room&&boxOverlap(q,{x:recorder.x-18,y:recorder.y-10,w:36,h:20}))return 'recorder';
 if(includeActors){
  const actors=[...(s.world[def.room]?.enemies||[])];
  if(s.companion?.room===def.room)actors.push(s.companion);
  if(def.room===s.room)actors.push(...crewInRoom(s));
  for(const a of actors)if(boxOverlap(q,{x:a.x-14,y:a.y-8,w:28,h:16},3))return 'actor';
 }
 return null;
}
function stepCart(s,input,dt){
 s.gripMoved=false;s.gripNoise=Math.max(0,(s.gripNoise||0)-dt);if(!input.grab){s.gripPressDone=false;releaseCart(s);return {active:false,moved:false};}
 const incompatible=input.fire||input.decoy||input.heal||input.listen||input.crouch||input.bulkhead||input.interact||s.flags.carryRipley||s.flags.cellCarried||s.excursion.recorder?.carried;
 if(incompatible){releaseCart(s,'Poignées libérées.');s.gripPressDone=true;return {active:false,moved:false};}
 if(!s.handling.grip&&!s.gripPressDone){s.gripPressDone=true;gripCart(s);}
 const g=s.handling.grip;if(!g)return {active:false,moved:false};if(g.room!==s.room){releaseCart(s);return {active:false,moved:false};}
 const def=DATA.handling.carts.find(c=>c.id===g.id),old=cartPosition(s,g.id),p=s.player;
 if(Math.hypot(p.x-old.x-g.offsetX,p.y-old.y-g.offsetY)>8){releaseCart(s);return {active:false,moved:false};}
 let dx=clamp(input.x,-1,1),dy=clamp(input.y,-1,1),len=Math.hypot(dx,dy);if(len>1){dx/=len;dy/=len;}
 const speed=(dx*g.side>0?DATA.handling.pullSpeed:DATA.handling.pushSpeed)*(floodAt(s,s.room,old.x,old.y)>.08?.62:1);
 dx*=speed*dt;dy*=speed*.7*dt;const count=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/3));let blocked=null,distance=0;
 for(let i=0;i<count;i++){
  const at=cartPosition(s,g.id),next={x:at.x+dx/count,y:at.y+dy/count};blocked=cartPlacement(s,g.id,next);if(blocked)break;
  const candidate={...roomGeometry(s),props:roomGeometry(s).props.map(q=>q.id===def.propId?{...q,...next}:q)};
  const px=next.x+g.offsetX,py=next.y+g.offsetY;
  if(collision(candidate,px,py,12)){blocked='player';break;}
  const actors=[...(s.world[s.room]?.enemies||[]),...crewInRoom(s)];
  if(actors.some(a=>Math.hypot(a.x-px,(a.y-py)*1.8)<26)){blocked='actor';break;}
  const delta=Math.hypot(dx/count,dy/count);if(delta>0){s.handling.positions[g.id]=next;p.x=px;p.y=py;distance+=delta;}
 }
 p.face=-g.side;s.gripMoved=distance>.001;
 if(s.gripMoved){s.handling.travelled+=distance;s.dirty=true;s.noise=Math.max(s.noise,.64);if(s.gripNoise<=0){emitSound(s,'cart',cartPosition(s,g.id).x,cartPosition(s,g.id).y,.78);s.gripNoise=DATA.handling.soundInterval;}s.handling.blocked=null;}
 else if(blocked){if(s.handling.blocked!==blocked)notice(s,({limit:'Butée de l’aire de manutention.',furniture:'Le chariot rencontre le mobilier.',access:'Laissez cet accès dégagé.',actor:'Quelqu’un est sur le trajet. Reculez ou relâchez.',recorder:'L’enregistreur doit rester accessible.',player:'Vous n’avez plus de place derrière la poignée.'})[blocked]||'Le chariot ne peut pas passer.',2.5);s.handling.blocked=blocked;}
 return {active:true,moved:s.gripMoved,blocked};
}
export function handlingOverview(s){return DATA.handling.carts.filter(c=>s.handling.observed.includes(c.id)).map(c=>({...c,...cartPosition(s,c.id),here:c.room===s.room,gripped:s.handling.grip?.id===c.id,moved:Math.hypot(cartPosition(s,c.id).x-c.x,cartPosition(s,c.id).y-c.y)>2}));}
function restoreHandling(s,v){
 const h=v.handling||{};
 s.handling.observed=uniqueKnown(h.observed,DATA.handling.carts.filter(c=>s.visited.includes(c.room)).map(c=>c.id));
 s.handling.travelled=clamp(h.travelled,0,1000000);
 for(const c of DATA.handling.carts){const p=h.positions?.[c.id];if(p&&typeof p==='object'&&!cartPlacement(s,c.id,p,false))s.handling.positions[c.id]={x:p.x,y:p.y};}
 // A corrupted/old save may place a character under newly introduced furniture.
 // Recover to the closest clear point, never keep a collision-embedded actor.
 for(const id of Object.keys(ROOM)){
  const r=roomGeometry(s,id),actors=[...(s.world[id]?.enemies||[])];if(id===s.room)actors.push(s.player);if(s.companion?.room===id)actors.push(s.companion);
  for(const a of actors)if(collision(r,a.x,a.y,12)){let best=null,dist=Infinity;for(let y=4;y<=176;y+=8)for(let x=Math.max(30,a.x-160);x<=Math.min(r.width-30,a.x+160);x+=8){const d=Math.hypot(x-a.x,y-a.y);if(d<dist&&!collision(r,x,y,12)){dist=d;best={x,y};}}if(best)Object.assign(a,best);}
 }
 observeHandling(s);
}


/** V0.10 — source-labelled mining tools and shared portal geometry.
 * Numerical weapon values are original balancing, never canonical specifications.
 * Finite racks are physically collected; loadouts are isolated in replay snapshots.
 */
export function equipmentStatus(s){return DATA.armament.map(a=>({...a,available:s.gear.unlocked.includes(a.id)&&(a.id!=='torch'||!!s.flags.torchReady),selected:s.gear.selected===a.id,remaining:a.ammo==='fuel'?s.player.fuel:a.ammo?s.gear[a.ammo]:null}));}
export function selectEquipment(s,id){
 const a=DATA.armament.find(a=>a.id===id);if(!a||!s.gear.unlocked.includes(id)||s.dead||s.finished)return false;
 if(s.flags.carryRipley||s.flags.cellCarried||s.excursion.recorder?.carried||s.handling.grip){notice(s,'Libérez vos mains avant de changer d’outil.');return false;}
 s.gear.selected=id;s.weaponPressDone=false;s.dirty=true;notice(s,a.name+' équipé · F pour utiliser.');return true;
}
export function collectArmament(s,id){
 const a=DATA.interactables.find(a=>a.id===id&&a.kind==='armament');
 if(!a||a.room!==s.room||s.chapter<a.minChapter||Math.hypot(s.player.x-a.x,s.player.y-a.y)>80||s.gear.collected.includes(id)||s.dead||s.finished||s.flags.carryRipley||s.flags.cellCarried||s.excursion.recorder?.carried)return false;
 s.gear.collected.push(id);
 if(a.kit==='mining'){for(const id of ['pick','thumper','net'])if(!s.gear.unlocked.includes(id))s.gear.unlocked.push(id);s.gear.charges=6;s.gear.nets=2;}
 else{s.gear.unlocked.push('acid');s.gear.acid=3;}
 s.dirty=true;notice(s,a.kit==='mining'?'Pic, thumper et filet récupérés. U : équipement.':'Projecteur minier récupéré. U : équipement.');return true;
}
function friendlyBlocks(s,range){
 const p=s.player,r=roomGeometry(s);return crewInRoom(s).some(c=>(c.x-p.x)*p.face>12&&Math.abs(c.x-p.x)<range&&Math.abs(c.y-p.y)<30&&!lineBlocked(r,p.x,p.y,c.x,c.y));
}
export function useEquipped(s){
 const p=s.player,a=DATA.armament.find(a=>a.id===s.gear.selected);
 if(!a||s.dead||s.finished||s.puzzle||s.reading||p.hidden||s.flags.carryRipley||s.flags.cellCarried||s.excursion.recorder?.carried||s.handling.grip)return false;
 if(a.id==='torch'){const before=p.fuel;useTorch(s);return before>p.fuel;}
 if(s.weaponPressDone)return false;s.weaponPressDone=true;
 if(s.weaponCooldown>0||!s.gear.unlocked.includes(a.id))return false;
 if(a.ammo&&s.gear[a.ammo]<a.cost){notice(s,'Réserve épuisée. Changez d’outil.');return false;}
 const r=roomGeometry(s);let reach=a.range;
 for(let d=10;d<=a.range;d+=10)if(collision(r,p.x+p.face*d,p.y,3)){reach=d-10;break;}
 const target=roomWorld(s).enemies.filter(e=>(e.x-p.x)*p.face>=0&&Math.abs(e.x-p.x)<=reach&&Math.abs(e.y-p.y)<(a.id==='net'?45:32)&&!lineBlocked(r,p.x,p.y,e.x,e.y)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
 if(friendlyBlocks(s,target?Math.abs(target.x-p.x):reach)){notice(s,'Équipier dans l’axe. Le geste est retenu.');return false;}
 if(a.ammo)s.gear[a.ammo]-=a.cost;
 s.weaponCooldown=a.id==='pick'?.85:1.05;
 s.weaponShot={kind:a.id,x:p.x,y:p.y,end:target?target.x:clamp(p.x+p.face*reach,28,r.width-28),life:.28};
 emitSound(s,a.id==='net'?'steps':a.id==='pick'?'cart':'torch',p.x,p.y,a.id==='net'?.3:a.id==='pick'?.65:1);
 if(target){if(a.id==='net'){target.netted=4;target.stun=4;target.attack=0;target.state='netted';}else{damageEnemy(s,target,a.damage,a.id);target.attack=0;target.stun=Math.max(target.stun||0,.6);target.targetX=clamp(target.x+p.face*55,35,r.width-35);}}
 notice(s,a.name+(target?' : contact.':' : aucun contact.'),2);s.dirty=true;return true;
}
function damageEnemy(s,e,amount,kind){
 e.hp=Math.max(0,(e.hp??(e.type==='adult'?120:30))-amount);
 const w=roomWorld(s);if(e.type==='adult'){
  w.acid=w.acid||[];w.acid.push({x:e.x,y:e.y,remaining:7,radius:34});w.acid=w.acid.slice(-8);
 }
 if(e.hp<=0){w.enemies=w.enemies.filter(a=>a!==e);w.corpses=w.corpses||[];w.corpses.push({id:e.id,x:e.x,y:e.y,type:e.type,burned:kind==='torch'});w.corpses=w.corpses.slice(-8);w.spawned=true;s.metrics.enemiesDefeated=(s.metrics.enemiesDefeated||0)+1;}
}
function tickCombat(s,dt){
 s.weaponCooldown=Math.max(0,s.weaponCooldown-dt);s.acidCooldown=Math.max(0,s.acidCooldown-dt);
 if(s.weaponShot){s.weaponShot.life-=dt;if(s.weaponShot.life<=0)s.weaponShot=null;}
 for(const w of Object.values(s.world)){if(w.acid){for(const a of w.acid)a.remaining-=dt;w.acid=w.acid.filter(a=>a.remaining>0);}}
 const p=s.player;if(s.acidCooldown<=0&&s.invuln<=0&&(s.world[s.room]?.acid||[]).some(a=>Math.hypot(p.x-a.x,(p.y-a.y)*1.7)<a.radius)){
  p.hp=Math.max(0,p.hp-(s.difficulty==='assisted'?4:9));s.acidCooldown=1;s.shake=.12;s.dirty=true;notice(s,'Sang corrosif au sol. Sortez de la flaque.',2);if(p.hp<=0)s.dead=true;
 }
}
function restoreCombat(s,v){
 const g=v.gear||{},known=DATA.interactables.filter(a=>a.kind==='armament');
 s.gear.collected=uniqueKnown(g.collected,known.filter(a=>s.chapter>=a.minChapter).map(a=>a.id));
 s.gear.unlocked=['torch'];if(s.gear.collected.includes('v10-rack'))s.gear.unlocked.push('pick','thumper','net');if(s.gear.collected.includes('v10-acid-rack'))s.gear.unlocked.push('acid');
 for(const [key,id,max] of [['charges','thumper',6],['nets','net',2],['acid','acid',3]])s.gear[key]=s.gear.unlocked.includes(id)?Math.floor(clamp(g[key],0,max)):0;
 s.gear.selected=s.gear.unlocked.includes(g.selected)?g.selected:'torch';
 for(const [id,w] of Object.entries(s.world)){
  const old=v.world?.[id]||{};
  w.acid=(Array.isArray(old.acid)?old.acid:[]).filter(a=>a&&Number.isFinite(a.x)&&Number.isFinite(a.y)&&a.remaining>0).slice(-8).map(a=>({x:clamp(a.x,28,ROOM[id].width-28),y:clamp(a.y,0,180),remaining:clamp(a.remaining,0,7),radius:34}));
  w.corpses=(Array.isArray(old.corpses)?old.corpses:[]).filter(a=>a&&['adult','hugger'].includes(a.type)&&Number.isFinite(a.x)).slice(-8).map(a=>({id:String(a.id).slice(0,100),type:a.type,x:clamp(a.x,28,ROOM[id].width-28),y:clamp(a.y,0,180),burned:a.burned===true}));
 }
}
export function actorAppearance(s,id){
 const look={...(DATA.appearance[id]||DATA.appearance.hoop),id};
 look.injury=DATA.storyEvents.some(e=>e.at<=s.completed.length&&e.injured?.includes(id))?(id==='kasyanov'?'arm':id==='baxter'?'ankle':id==='ripley'?'head':'none'):'none';
 return look;
}
function nearestFreePoint(r,p){for(let d=0;d<r.width;d+=20)for(const side of [-1,1])for(const y of [88,120,155,45]){const x=clamp(p.x+d*side,30,r.width-30);if(!collision(r,x,y))return {x,y:r.mode==='profile'?88:y};}return {x:170,y:88};}
