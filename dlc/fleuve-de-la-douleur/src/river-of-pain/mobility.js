/* One original prospecting rover. Deterministic gameplay, no real vehicle specifications. */
(function(root){'use strict';
const D=root.ROP_DATA||(typeof require==='function'?require('./data.js'):null);
const cfg=D.mobility,R=cfg.rules,def=cfg.rover;
const rooms=new Map(D.rooms.map(r=>[r.id,r]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),dist=(a,b)=>Math.hypot(a.x-b.x,(a.z-b.z)*600),clone=v=>JSON.parse(JSON.stringify(v));
const core=()=>root.ROP_CORE||(typeof require==='function'?require('./core.js'):null);
const defense=()=>root.ROP_DEFENSE||(typeof require==='function'?require('./defense.js'):null);
function unlocked(s){return s.collected.includes('tractor');}
function initial(){return {revision:8,rover:{room:def.room,x:def.x,z:def.z,hp:100,battery:100,speed:0,heading:1,driver:null,lights:false,wheels:0,hurt:0,horn:0,hornCooldown:0},stations:Object.fromEntries(cfg.stations.map(d=>[d.id,{repairs:d.repairKits,charges:d.charges}])),stats:{boarded:0,exits:0,crossings:0,collisions:0,repairs:0,charges:0,horns:0,distance:0}};}
function mounted(s){return !!s.mobility?.rover.driver;}
function hull(s){const v=s.mobility.rover;return {id:def.id,type:'rover',x:v.x,z:v.z,w:def.width,d:def.depth,prop:'vehicle'};}
function floor(s,r,body=null){
 if(!unlocked(s)||!s.mobility||s.mobility.rover.room!==r.id)return r;
 // Classic on-foot projection is the front walking strip; an empty rover is parked behind it.
 if(s.mode==='classic'&&!mounted(s))return r;
 if(mounted(s)&&body===s.player)return r;
 return {...r,cover:[...r.cover,hull(s)]};
}
function baseFloor(s,r){return defense().floor(s,r);}
function overlaps(a,b,pad=0){return Math.abs(a.x-b.x)<(a.w+b.w)/2+pad&&Math.abs(a.z-b.z)<(a.d+b.d)/2+pad/700;}
function clearHull(s,r,x,z,checkActors=true){
 if(!cfg.rooms.includes(r.id)||x<def.width/2+42||x>r.width-def.width/2-42||z<r.minZ+def.depth/2||z>r.maxZ-def.depth/2)return false;
 const a={x,z,w:def.width,d:def.depth};
 if(baseFloor(s,r).cover.some(c=>overlaps(a,c,2)))return false;
 if(checkActors&&s.world[r.id]?.enemies.some(e=>e.hp>0&&Math.abs(x-e.x)<def.width/2+26&&Math.abs(z-e.z)<def.depth/2+.045))return false;
 return true;
}
function vehiclePointDistance(s,p){const v=s.mobility.rover;return Math.hypot(Math.max(0,Math.abs(p.x-v.x)-def.width/2),Math.max(0,Math.abs(p.z-v.z)-def.depth/2)*600);}
function nearVehicle(sim){return unlocked(sim.s)&&sim.s.room===sim.s.mobility.rover.room&&(sim.s.mode==='classic'?Math.abs(sim.s.player.x-sim.s.mobility.rover.x)<def.width/2+100:vehiclePointDistance(sim.s,sim.s.player)<105);}
function stationAt(id){return cfg.stations.find(d=>d.id===id);}
function exitPoint(sim){
 const s=sim.s,v=s.mobility.rover,r=sim.room,C=core();
 const near=[];for(const sign of [-v.heading,v.heading])near.push({x:v.x+sign*(def.width/2+45),z:s.mode==='classic'?.7:v.z});
 if(s.mode!=='classic')for(const sign of [1,-1])near.push({x:v.x,z:v.z+sign*(def.depth/2+.085)});
 const physical=baseFloor(s,r);
 return near.find(p=>!C.obstacleAt(physical,p.x,p.z,16,s.mode)&&!s.world[r.id]?.enemies.some(e=>e.hp>0&&dist(e,p)<75))||null;
}
function stationReason(sim,id,action){
 const s=sim.s,v=s.mobility.rover,d=stationAt(id);if(!d)return 'Borne inconnue.';
 if(mounted(s))return 'Descendez pour utiliser cette borne.';
 if(d.room!==s.room||!sim.near(s.player,d,100))return 'Approchez la borne à pied.';
 if(!unlocked(s)||v.room!==s.room||dist(v,d)>d.radius)return 'Garez le tracteur dans la zone de service.';
 const stock=s.mobility.stations[id];
 if(action==='repair'&&(v.hp>=100||stock.repairs<=0))return v.hp>=100?'Châssis intact.':'Trousse de réparation épuisée.';
 if(action==='charge'&&(v.battery>=100||stock.charges<=0))return v.battery>=100?'Batterie pleine.':'Accumulateur de réserve épuisé.';
 return '';
}
function reason(sim,action,id=null){
 const s=sim.s,v=s.mobility.rover;
 if(s.status!=='playing')return 'Reconstitution suspendue.';
 if(s.work||s.passages.transit||s.systems.hiding)return 'Terminez l’action en cours.';
 if(!unlocked(s))return 'Préparez le tracteur au chapitre « Les coordonnées ».';
 if(['repair','charge'].includes(action))return stationReason(sim,id,action);
 if(action==='board'){
  if(mounted(s))return 'Vous êtes déjà en cabine.';
  if(D.characters[s.character].child)return 'Newt ne conduit pas ce tracteur.';
  if(s.escort)return 'Poursuivez l’escorte à pied. Pas de siège compagnon dans cette version.';
  if(!nearVehicle(sim))return 'Rejoignez le tracteur sur la piste.';
  if(v.hp<=0)return 'Châssis immobilisé : intervention à une borne requise.';
  if(v.battery<R.minimumBattery)return 'Batterie vide : recharge de service requise.';
  if(!clearHull(s,sim.room,v.x,s.mode==='classic'?.7:v.z))return 'Voie de sortie occupée. Dégagez le châssis.';
  return '';
 }
 if(!mounted(s))return 'Montez d’abord dans la cabine.';
 if(action==='exit')return Math.abs(v.speed)>14?'Immobilisez le tracteur avant de descendre.':!exitPoint(sim)?'Aucun appui libre pour descendre.':'';
 if(action==='turn')return Math.abs(v.speed)>14?'Immobilisez le tracteur avant le demi-tour.':v.hp<=0||v.battery<=0?'Transmission indisponible.':'';
 if(action==='horn')return v.hornCooldown>0?'Avertisseur en recharge.':v.battery<.2?'Batterie insuffisante.':'';
 if(action==='lights')return v.battery<=0?'Batterie vide.':'';
 return 'Commande inconnue.';
}
function begin(sim,action,id=null){
 const why=reason(sim,action,id);if(why){sim.notify(why);return false;}
 const s=sim.s,v=s.mobility.rover;s.passages.listening=null;
 if(action==='lights'){v.lights=!v.lights;sim.emit('save');return true;}
 if(action==='horn'){v.horn=R.hornTime;v.hornCooldown=R.hornCooldown;v.battery=Math.max(0,v.battery-.2);s.mobility.stats.horns++;sim.emit('roverHorn');sim.emit('save');return true;}
 const durations={board:R.boardingTime,exit:v.hp<=0?.45:R.exitTime,turn:1.2,repair:R.repairTime,charge:R.chargeTime};
 s.work={kind:'mobility',action,id,timer:0,duration:durations[action],x:s.player.x,z:s.player.z};
 v.speed=0;sim.emit('roverWork');return true;
}
function finish(sim,t){
 const s=sim.s,v=s.mobility.rover,why=reason(sim,t.action,t.id);if(why){sim.notify(why);return false;}
 if(t.action==='board'){
  v.driver=s.character;v.speed=0;if(s.mode==='classic')v.z=.7;
  Object.assign(s.player,{x:v.x,z:v.z,noise:.3,crouch:false});s.systems.flashlight=false;s.systems.tracker=false;s.exploration.aiming=false;
  sim.bullets=[];s.mobility.stats.boarded++;sim.emit('roverBoarded');sim.notify('Cabine fermée. Q/D avancer ou reculer · Z/S braquer · ESPACE freiner · E cabine.');
 }else if(t.action==='exit'){
  const p=exitPoint(sim);if(!p){sim.notify('La sortie vient d’être occupée.');return false;}
  v.driver=null;v.speed=0;v.lights=false;if(s.mode==='classic')v.z=.42;
  Object.assign(s.player,{...p,noise:.2,crouch:false});s.mobility.stats.exits++;sim.notify('Vous êtes à pied. Le tracteur reste à son emplacement.');
 }else if(t.action==='turn'){v.heading*=-1;sim.notify('Demi-tour de manœuvre terminé.');
 }else if(t.action==='repair'){s.mobility.stations[t.id].repairs--;v.hp=Math.min(100,v.hp+55);s.mobility.stats.repairs++;sim.notify('Châssis réparé : +55 au maximum. La trousse est consommée.');
 }else if(t.action==='charge'){s.mobility.stations[t.id].charges--;v.battery=Math.min(100,v.battery+65);s.mobility.stats.charges++;sim.notify('Accumulateur branché : +65 au maximum. La réserve est consommée.');}
 sim.emit('save');return true;
}
function candidates(sim){
 const s=sim.s,out=[];if(!unlocked(s)||s.status!=='playing'||s.passages.transit)return out;
 if(mounted(s))return [{type:'mobility',ref:{x:s.player.x,z:s.player.z,id:def.id},priority:0,label:'Cabine du tracteur · arrêter avant de descendre'}];
 if(nearVehicle(sim))out.push({type:'mobility',ref:{x:s.mobility.rover.x,z:s.mode==='classic'?.7:s.mobility.rover.z,id:def.id},priority:2.9,label:'Tracteur · cabine et état du châssis'});
 for(const d of cfg.stations)if(d.room===s.room&&sim.near(s.player,d,100))out.push({type:'mobilityStation',ref:d,priority:2.85,label:d.label+' · réserves finies'});
 return out;
}
function damage(sim,amount,why='impact'){
 const s=sim.s,v=s.mobility.rover;if(v.hurt>0||v.hp<=0)return false;
 v.hp=Math.max(0,v.hp-amount);v.hurt=1;s.work=null;s.mobility.stats.collisions++;
 sim.emit('roverImpact');if(v.hp===0){v.speed=0;v.lights=false;sim.notify('TRANSMISSION HORS SERVICE. Descendez ; la route reste praticable à pied.');}
 else sim.notify(why==='attack'?'Le châssis encaisse une frappe.':'Choc contre un obstacle. Freinez avant de manœuvrer.');
 sim.emit('save');return true;
}
function surface(s){const v=s.mobility.rover;return cfg.surfaces.find(d=>d.room===v.room&&Math.abs(v.x-d.x)<d.w/2&&v.z>=d.minZ&&v.z<=d.maxZ)||null;}
function update(sim,dt,input){
 const s=sim.s,v=s.mobility.rover;v.hurt=Math.max(0,v.hurt-dt);v.horn=Math.max(0,v.horn-dt);v.hornCooldown=Math.max(0,v.hornCooldown-dt);
 if(!mounted(s))return false;
 const r=sim.room,throttle=s.work?0:clamp(input.x||0,-1,1),brake=!!input.brake||!!input.crouch||!!s.work;
 const cap=(Math.sign(throttle)===v.heading?R.maxForward:R.maxReverse),terrain=surface(s),lim=terrain?Math.min(cap,terrain.speedLimit):cap;
 const target=brake||v.hp<=0||v.battery<=0?0:throttle*lim;
 const rate=brake||v.hp<=0||v.battery<=0||Math.sign(target)!==Math.sign(v.speed)&&v.speed!==0?R.braking:throttle?R.acceleration:R.rollingResistance;
 v.speed+=clamp(target-v.speed,-rate*dt,rate*dt);if(Math.abs(v.speed)<.1)v.speed=0;
 const dx=v.speed*dt,dz=s.mode==='classic'||Math.abs(v.speed)<8?0:clamp(input.z||0,-1,1)*R.steerSpeed*Math.min(1,Math.abs(v.speed)/180)*dt/600;
 let nx=v.x+dx,nz=clamp(v.z+dz,r.minZ+def.depth/2+.005,r.maxZ-def.depth/2-.005);
 // Substeps bound displacement; rectangle occupancy is checked for the whole chassis, not its center.
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz*600)/6));let travelled=0;
 for(let i=0;i<steps;i++){
  const px=v.x+dx/steps,pz=clamp(v.z+dz/steps,r.minZ+def.depth/2+.005,r.maxZ-def.depth/2-.005);
  if(!clearHull(s,r,px,pz,true)){const oldSpeed=Math.abs(v.speed);v.speed=0;if(oldSpeed>170)damage(sim,Math.min(28,7+(oldSpeed-170)/18));break;}
  travelled+=dist(v,{x:px,z:pz});v.x=px;v.z=pz;
 }
 s.mobility.stats.distance+=travelled;v.wheels+=travelled/32;
 if(v.battery>0){v.battery=Math.max(0,v.battery-dt*(.025+Math.abs(v.speed)/R.maxForward*.30+(v.lights?.05:0)));if(v.battery===0){v.lights=false;sim.notify('Batterie épuisée. Immobilisez-vous et poursuivez à pied.');}}
 Object.assign(s.player,{x:v.x,z:v.z,facing:v.heading,crouch:false,noise:v.hp>0?Math.max(.25,Math.abs(v.speed)/R.maxForward*.95,v.horn>0?1:0):.02});
 s.systems.flashlight=false;s.systems.tracker=false;s.exploration.aiming=false;
 if(input.fire&&v.hornCooldown===0&&v.battery>.2&&!s.work)begin(sim,'horn');
 return true;
}
function links(sim){
 if(!mounted(sim.s))return [];
 return sim.room.portals.filter(p=>cfg.links.some(([a,b])=>a===sim.s.room&&b===p.to||b===sim.s.room&&a===p.to));
}
function crossingReason(sim,to){
 const s=sim.s,v=s.mobility.rover,p=links(sim).find(p=>p.to===to);
 if(s.status!=='playing'||!mounted(s))return 'Montez en cabine.';
 if(s.work||s.passages.transit)return 'Manœuvre en cours.';
 if(!p)return 'Cette ouverture se parcourt à pied.';
 if(Math.abs(v.speed)>14)return 'Immobilisez-vous au jalon de passage.';
 if(Math.abs(v.x-p.x)>145||(s.mode!=='classic'&&Math.abs(v.z-p.z)>.17))return 'Rejoignez le jalon de passage.';
 if(s.doors[[s.room,to].sort().join('|')]==='sealed'||p.requires&&!s.flags[p.requires])return 'Passage fermé.';
 const r=rooms.get(to),back=r.portals.find(p=>p.to===s.room),x=back.x<r.width/2?back.x+def.width/2+58:back.x-def.width/2-58,z=s.mode==='classic'?.7:.78;
 if(!clearHull(s,r,x,z))return 'Arrivée occupée. Aucun passage forcé.';
 return '';
}
function cross(sim,to){
 const why=crossingReason(sim,to);if(why){sim.notify(why);return false;}
 const s=sim.s,v=s.mobility.rover,from=s.room,r=rooms.get(to),back=r.portals.find(p=>p.to===from);
 v.room=to;v.x=back.x<r.width/2?back.x+def.width/2+58:back.x-def.width/2-58;v.z=s.mode==='classic'?.7:.78;v.speed=0;
 s.room=to;Object.assign(s.player,{x:v.x,z:v.z});s.work=null;sim.bullets=[];
 if(!s.visited.includes(to))s.visited.push(to);sim.ensureRoom();s.mobility.stats.crossings++;
 sim.emit('room',{from,to,kind:'piste-véhicule'});sim.emit('save');sim.notify('Tracteur au point d’arrivée. Reprenez la conduite.');return true;
}
function driveEnemy(sim,e,dt,tune){
 const s=sim.s;if(!mounted(s))return false;
 const v=s.mobility.rover,C=core(),d=dist(e,v),staticFloor=baseFloor(s,sim.room);
 const sees=d<(v.lights?750:570)&&!C.lineBlocked(staticFloor,e,v),hears=d<s.player.noise*1100;
 const memory=root.ROP_EXPLORATION.enemyMemory(e);memory.ttl=Math.max(0,memory.ttl-dt);
 if(sees||hears){Object.assign(memory,{x:v.x,z:v.z,ttl:8});e.notice=Math.min(1,e.notice+dt*1.5);}
 const flare=sim.ensureRoom().flares.find(f=>dist(e,f)<320);if(flare){e.state='retreat';e.path=[];e.windup=0;sim.move(e,e.x<flare.x?-1:1,0,165*tune.enemySpeed,dt);return true;}
 if(memory.ttl===0){e.notice=Math.min(e.notice,.4);e.state='patrol';const before=e.x;sim.move(e,e.facing,0,45,dt);if(Math.abs(e.x-before)<.01||e.timer>5.7){e.facing*=-1;e.timer=0;}return true;}
 const near=vehiclePointDistance(s,e)<46&&!C.lineBlocked(staticFloor,e,v);
 if(e.state==='windup'){
  e.windup=Math.max(0,e.windup-dt);if(e.windup===0){if(near){if(v.hp>0)damage(sim,(e.kind==='adult'?18:6)*tune.damage,'attack');else sim.hit(e.kind==='adult'?25:16);}e.cooldown=1.25;e.state='chase';}return true;
 }
 if(near&&e.cooldown<=0){e.state='windup';e.windup=.85;e.path=[];return true;}
 e.state='chase';
 if(e.repath===0){
  // The target is an exterior point of the last perceived hull, never an inaccessible center.
  const x=memory.x,z=memory.z,points=[{x:x-def.width/2-33,z},{x:x+def.width/2+33,z},{x,z:z+def.depth/2+.065},{x,z:z-def.depth/2-.065}];
  const f=floor(s,staticFloor,e);let best=null;
  for(const p of points){const path=C.localPath(f,e,p,s.mode);if(!path.length)continue;let cost=0,prev=e;for(const q of path){cost+=dist(prev,q);prev=q;}if(!best||cost<best.cost)best={path,cost};}
  e.path=best?.path||[];e.repath=.4;
 }
 defense().follow(sim,e,e.path,(e.kind==='adult'?138:183)*tune.enemySpeed,dt);return true;
}
function parkForChapter(sim){const v=sim.s.mobility.rover;if(v.driver){v.driver=null;v.speed=0;v.lights=false;if(sim.s.mode==='classic')v.z=.42;}}
function validateAndUpgrade(s){
 const n=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
 if(!s.mobility){
  s.mobility=initial();const v=s.mobility.rover;
  if(unlocked(s)&&s.mode!=='classic'&&s.room===v.room&&vehiclePointDistance(s,s.player)<30){
   const spots=[{x:660,z:.38},{x:900,z:.79},{x:470,z:.38},{x:3150,z:.79}];
   const at=spots.find(p=>clearHull(s,rooms.get(v.room),p.x,p.z,false)&&dist(p,s.player)>220);
   if(!at)throw Error('Aucun stationnement libre pour migrer le tracteur.');
   Object.assign(v,at);s.log.unshift('Mise à niveau 0.8 : tracteur ajouté sur un appui libre ; votre position est conservée.');s.log=s.log.slice(0,60);
  }return;
 }
 const m=s.mobility,v=m.rover;if(m.revision!==8||!v||!cfg.rooms.includes(v.room))throw Error('Registre du tracteur invalide.');
 for(const [k,a,b] of [['x',194,4000],['z',.3,.85],['hp',0,100],['battery',0,100],['speed',-520,520],['wheels',0,1e9],['hurt',0,1],['horn',0,R.hornTime],['hornCooldown',0,R.hornCooldown]])if(!n(v[k],a,b))throw Error('Valeur du tracteur invalide : '+k);
 if(![-1,1].includes(v.heading)||typeof v.lights!=='boolean')throw Error('Orientation ou éclairage invalide.');
 if(v.driver!==null&&(!['anne','brackett','paris'].includes(v.driver)||v.driver!==s.character||s.room!==v.room||s.escort||!unlocked(s)||s.systems.hiding||s.passages.transit))throw Error('Conducteur incohérent.');
 if(v.driver&&(dist(v,s.player)>.01||s.mode==='classic'&&v.z!==.7))throw Error('Conducteur hors de sa cabine.');
 if(!v.driver&&v.speed!==0)throw Error('Tracteur sans conducteur en mouvement.');
 if(v.hp===0&&v.speed!==0)throw Error('Tracteur détruit en mouvement.');
 if(v.lights&&v.battery<=0)throw Error('Phares sans batterie.');
 if(!clearHull(s,rooms.get(v.room),v.x,v.z,false)&&!(s.mode==='classic'&&!v.driver&&v.z===.42))throw Error('Châssis dans un obstacle.');
 if(!m.stations||Object.keys(m.stations).length!==cfg.stations.length)throw Error('Réserves de service invalides.');
 for(const d of cfg.stations){const a=m.stations[d.id];if(!a||!Number.isInteger(a.repairs)||!n(a.repairs,0,d.repairKits)||!Number.isInteger(a.charges)||!n(a.charges,0,d.charges))throw Error('Contenu de borne invalide.');}
 if(!m.stats)throw Error('Statistiques du tracteur absentes.');
 for(const k of ['boarded','exits','crossings','collisions','repairs','charges','horns'])if(!Number.isInteger(m.stats[k])||!n(m.stats[k],0,1e7))throw Error('Statistique du tracteur invalide.');
 if(!n(m.stats.distance,0,1e9))throw Error('Distance du tracteur invalide.');
 // An existing 0.7 position cannot be pushed away merely by receiving a parked rover.
 if(!v.driver&&unlocked(s)&&s.mode!=='classic'&&s.room===v.room&&vehiclePointDistance(s,s.player)<16)throw Error('Position à pied dans le châssis.');
}
const API={initial,unlocked,mounted,hull,floor,clearHull,vehiclePointDistance,nearVehicle,exitPoint,reason,begin,finish,candidates,damage,update,surface,links,crossingReason,cross,driveEnemy,parkForChapter,validateAndUpgrade,cfg,R};
root.ROP_MOBILITY=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
