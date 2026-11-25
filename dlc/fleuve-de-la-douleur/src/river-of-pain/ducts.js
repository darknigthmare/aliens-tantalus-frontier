/* Maintenance ducts: explicit single-owner transfers of existing adults. No spawn budget.
 * Queue timers advance offscreen; exit warning/bashing requires the active destination room.
 * This is not continuous offscreen AI or a player-traversable ventilation system.
 */
(function(root){
'use strict';
const D=root.ROP_DATA||(typeof require==='function'?require('./data.js'):null);
const F=root.ROP_DEFENSE||(typeof require==='function'?require('./defense.js'):null);
const config=D.ducts, rules=config.rules;
const mouths=new Map(config.mouths.map(d=>[d.id,d])),routes=new Map(config.routes.map(d=>[d.id,d]));
const C=()=>root.ROP_CORE,copy=v=>JSON.parse(JSON.stringify(v));
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const record=v=>v&&typeof v==='object'&&!Array.isArray(v);
const statKeys=['entries','arrivals','closed','opened','listened','broken','cancelled'];
function initial(){return {revision:7,mouths:Object.fromEntries(config.mouths.map(d=>[d.id,{state:'open',hp:100}])),
  cooldowns:Object.fromEntries(config.routes.map(d=>[d.id,0])),transits:[],reports:[],stats:Object.fromEntries(statKeys.map(k=>[k,0]))};}
function other(id){const d=mouths.get(id);return d?mouths.get(routes.get(d.route).ends.find(v=>v!==id)):null;}
function near(sim,d){return !!d&&d.room===sim.s.room&&sim.near(sim.s.player,d,98);}
function incoming(s,id){return s.ducts.transits.find(t=>t.to===id)||null;}
function occupied(sim,d){return sim.ensureRoom().enemies.some(e=>e.hp>0&&e.kind==='adult'&&C().dist(e,d)<55);}
function reason(sim,id,action){
 const s=sim.s,d=mouths.get(id);
 if(!d||d.room!==s.room)return 'Cette grille n’est pas dans la pièce courante.';
 if(s.status!=='playing'||s.work||s.passages.transit||s.systems.hiding)return 'Revenez au terrain pour intervenir.';
 if(!near(sim,d))return 'Approchez la poignée de la grille.';
 if(!['close','open','listen'].includes(action))return 'Manœuvre inconnue.';
 const v=s.ducts.mouths[id];
 if(action==='listen')return s.player.noise>.45?'Restez silencieux avant d’écouter.':'';
 if(v.state==='broken')return 'La grille a cédé ; aucun verrou ne reste utilisable.';
 if(sim.character.child)return 'Newt écoute, mais ne manœuvre pas ces grilles industrielles.';
 if(action==='close'&&v.state==='closed')return 'La grille est déjà verrouillée.';
 if(action==='open'&&v.state!=='closed')return 'La grille est déjà ouverte.';
 if(action==='close'&&occupied(sim,d))return 'Un adulte occupe la bouche : attendez qu’elle soit libre.';
 return '';
}
function begin(sim,id,action){
 const why=reason(sim,id,action);if(why){sim.notify(why);return false;}
 sim.s.passages.listening=null;sim.s.exploration.aiming=false;
 sim.s.work={kind:'duct',id,action,timer:0,duration:action==='close'?rules.closeDuration:action==='open'?rules.openDuration:rules.listenDuration,x:sim.s.player.x,z:sim.s.player.z};
 if(action!=='listen')sim.emit('mechanism');return true;
}
function wording(r){return r.level==='pressure'?'Coups contre la grille. Le verrou retient quelque chose.':r.level==='movement'?'Frottements dans la gaine. La sortie n’est pas sûre.':r.level==='masked'?'Le bruit masque l’écoute. Aucun constat fiable.':'Aucun mouvement perçu. Ce n’est pas une garantie de sécurité.';}
function reading(sim,id){
 const t=sim.s.ducts.transits.find(t=>t.to===id||t.from===id),v=sim.s.ducts.mouths[id];
 const level=sim.s.player.noise>.35?'masked':t&&t.to===id&&t.remaining===0&&v.state==='closed'?'pressure':t?'movement':'quiet';
 return {id,when:sim.s.elapsed,level};
}
function finish(sim,task){
 const why=reason(sim,task.id,task.action);if(why){sim.s.ducts.stats.cancelled++;sim.notify(why);return false;}
 const s=sim.s,a=s.ducts,v=a.mouths[task.id];
 if(task.action==='listen'){const r=reading(sim,task.id);a.reports.push(r);a.reports=a.reports.slice(-12);a.stats.listened++;sim.notify(wording(r));}
 else{v.state=task.action==='close'?'closed':'open';a.stats[task.action==='close'?'closed':'opened']++;
  const t=incoming(s,task.id);if(t){t.warning=rules.warningDuration;t.bash=0;t.announced=false;}
  sim.notify(task.action==='close'?'Grille verrouillée. Une créature engagée peut la forcer.':'Grille libérée. Ses dégâts ne sont pas réparés.');sim.emit('mechanism');}
 sim.emit('save');return true;
}
function updateWork(sim){
 const task=sim.s.work;if(task?.kind!=='duct')return;
 if(task.action==='listen'){
  if(sim.s.player.noise>.45){sim.s.work=null;sim.s.ducts.stats.cancelled++;sim.notify('Écoute interrompue par le bruit.');}
 }else sim.s.player.noise=Math.max(sim.s.player.noise,.28);
}
function candidates(sim){
 if(sim.s.status!=='playing'||sim.s.passages.transit||sim.s.systems.hiding)return [];
 return config.mouths.filter(d=>near(sim,d)).map(d=>({type:'duct',ref:d,priority:5,label:d.code+' · Grille technique · 4 pour examiner'}));
}
function canEnter(sim,e,d){
 const s=sim.s,a=s.ducts,dest=other(d.id),route=routes.get(d.route);
 return e.kind==='adult'&&e.hp>0&&s.phase>=route.minPhase&&s.room===d.room&&a.mouths[d.id].state!=='closed'&&a.mouths[dest.id].state!=='closed'
  &&a.cooldowns[route.id]===0&&!a.transits.some(t=>t.route===route.id)&&!(e.ductCooldown>0);
}
function cancelEntry(e){e.ductEntry=null;e.path=[];e.repath=0;}
function entry(sim,e,dt,perceived){
 e.ductCooldown=Math.max(0,(e.ductCooldown||0)-dt);
 if(e.kind!=='adult'||e.hp<=0)return false;
 const memory=e.memory;
 if(perceived||e.state==='windup'||e.bash||e.state==='retreat'||(memory?.ttl>0)||e.notice>.52){if(e.ductEntry)cancelEntry(e);return false;}
 let task=e.ductEntry,d=task&&mouths.get(task.id);
 if(task&&!canEnter(sim,e,d)){cancelEntry(e);return false;}
 if(!task){
  d=config.mouths.find(v=>v.room===sim.s.room&&C().dist(e,v)<650&&canEnter(sim,e,v));
  if(!d)return false;
  const path=C().localPath(F.floor(sim.s,sim.room,e),e,d,sim.s.mode);if(!path.length)return false;
  e.ductEntry=task={id:d.id,stage:'approach',remaining:rules.entryDuration};e.path=path;e.repath=.6;
 }
 if(task.stage==='approach'){
  if(C().dist(e,d)<24){task.stage='entering';e.path=[];sim.notify('Un frottement rejoint la gaine '+d.code+'.');sim.emit('ductEntry',{id:d.id});}
  else{if(e.repath<=0||!e.path.length){e.path=C().localPath(F.floor(sim.s,sim.room,e),e,d,sim.s.mode);e.repath=.6;}
   if(!e.path.length){cancelEntry(e);return false;}F.follow(sim,e,e.path,100*C().settings[sim.s.difficulty].enemySpeed,dt);}
  return true;
 }
 task.remaining=Math.max(0,task.remaining-dt);if(task.remaining>0)return true;
 const dest=other(d.id),route=routes.get(d.route),body=copy(e);body.ductEntry=null;body.path=[];body.bash=null;body.sawHide=false;body.notice=0;body.memory={x:d.x,z:d.z,ttl:0};
 sim.s.ducts.transits.push({route:route.id,from:d.id,to:dest.id,remaining:route.duration,warning:rules.warningDuration,bash:0,announced:false,enemy:body});
 // A transferred creature has one owner: it is removed from its room before save.
 sim.ensureRoom().enemies=sim.ensureRoom().enemies.filter(v=>v!==e);sim.s.ducts.stats.entries++;sim.s.ducts.cooldowns[route.id]=rules.routeCooldown;
 sim.emit('save');return true;
}
function activeWarning(sim,t,d){
 if(t.announced)return;t.announced=true;sim.notify('La grille '+d.code+' vibre. Éloignez-vous de son ouverture.');sim.emit('ductWarning',{id:d.id});
}
function update(sim,dt){
 const s=sim.s,a=s.ducts;
 for(const id of routes.keys())a.cooldowns[id]=Math.max(0,a.cooldowns[id]-dt);
 const arrived=[];
 for(const t of a.transits){
  if(t.remaining>0){t.remaining=Math.max(0,t.remaining-dt);continue;}
  const d=mouths.get(t.to),v=a.mouths[d.id];
  // No hidden offscreen fight; warning is earned in real time at the active exit.
  if(s.room!==d.room||s.passages.transit){t.warning=rules.warningDuration;t.announced=false;continue;}
  activeWarning(sim,t,d);
  if(v.state==='closed'){
   t.warning=rules.warningDuration;t.bash+=dt;
   if(t.bash>=rules.hitWindup){t.bash=0;v.hp=Math.max(0,v.hp-rules.hitDamage);sim.emit('shutterStrike',{id:d.id,source:'duct'});
    if(v.hp===0){v.state='broken';a.stats.broken++;sim.notify('La grille '+d.code+' cède ! Reculez.');sim.emit('breach');}sim.emit('save');}
   continue;
  }
  t.bash=0;
  const r=sim.room,exit={x:d.x,z:s.mode==='classic'?.7:d.z},w=sim.ensureRoom();
  const unsafe=C().dist(s.player,exit)<rules.clearance||(s.escort&&C().dist(s.escort,exit)<rules.clearance)
      ||C().obstacleAt(F.floor(s,r,t.enemy),exit.x,exit.z,18,s.mode)||w.enemies.length>=rules.maxRoomEnemies;
  if(unsafe){t.warning=rules.warningDuration;continue;}
  t.warning=Math.max(0,t.warning-dt);if(t.warning>0)continue;
  if(w.enemies.some(e=>e.id===t.enemy.id))continue; // malformed programmatic ownership: never duplicate.
  const e=t.enemy;Object.assign(e,{x:exit.x,z:exit.z,origin:{...exit},memory:{...exit,ttl:0},path:[],repath:0,state:'search',notice:.24,windup:0,cooldown:1.2,timer:0,facing:-1,bash:null,ductEntry:null,ductCooldown:rules.retryCooldown,sawHide:false});
  w.enemies.push(e);arrived.push(t);a.stats.arrivals++;sim.emit('ductArrival',{id:d.id});sim.emit('save');
 }
 if(arrived.length)a.transits=a.transits.filter(t=>!arrived.includes(t));
}
function contacts(sim){
 if(!sim.s.systems.tracker)return [];
 const out=[];
 for(const t of sim.s.ducts.transits){const d=mouths.get(t.to),v=sim.s.ducts.mouths[t.to];
  if(d.room!==sim.s.room||v.state==='closed'||t.remaining>1.5||C().dist(sim.s.player,d)>rules.hearingDistance)continue;
  out.push({id:t.enemy.id,x:d.x,z:sim.s.mode==='classic'?.7:d.z,distance:C().dist(sim.s.player,d)+120,remote:true,duct:true,via:d.id});
 }
 return out;
}
function timer(n,max){return finite(n)&&n>=0&&n<=max;}
function validateEnemy(e,room){
 if(!record(e)||typeof e.id!=='string'||!e.id||e.id.length>120||e.kind!=='adult'||!timer(e.hp,300)||e.hp===0||!timer(e.x,room.width)||!timer(e.z,1))throw Error('Créature en gaine invalide.');
 if(!['patrol','search','chase','windup','retreat','dead'].includes(e.state)||e.state==='dead'||![-1,1].includes(e.facing))throw Error('État de créature en gaine invalide.');
 for(const k of ['notice','cooldown','windup','repath','timer'])if(!timer(e[k],100000))throw Error('Minuterie de créature en gaine invalide.');
 e.path=[];e.bash=null;e.ductEntry=null;
}
function validateAndUpgrade(s){
 if(s.ducts===undefined)s.ducts=initial();const a=s.ducts;
 if(!record(a)||a.revision!==7||!record(a.mouths)||!record(a.cooldowns)||!record(a.stats)||!Array.isArray(a.transits)||!Array.isArray(a.reports))throw Error('Registre de gaines incompatible.');
 if(Object.keys(a.mouths).length!==mouths.size||Object.keys(a.cooldowns).length!==routes.size)throw Error('Registre de gaines incomplet.');
 for(const [id,v]of Object.entries(a.mouths))if(!mouths.has(id)||!record(v)||!['open','closed','broken'].includes(v.state)||!timer(v.hp,100)||(v.state==='broken')!==(v.hp===0))throw Error('Grille de gaine invalide.');
 for(const [id,v]of Object.entries(a.cooldowns))if(!routes.has(id)||!timer(v,rules.routeCooldown))throw Error('Réarmement de gaine invalide.');
 if(Object.keys(a.stats).length!==statKeys.length||Object.entries(a.stats).some(([k,v])=>!statKeys.includes(k)||!Number.isSafeInteger(v)||v<0||v>1e8))throw Error('Statistiques de gaines invalides.');
 if(a.reports.length>12)throw Error('Trop de relevés de gaines.');
 for(const r of a.reports)if(!record(r)||!mouths.has(r.id)||!finite(r.when)||r.when<0||r.when>s.elapsed+.001||!['quiet','masked','movement','pressure'].includes(r.level))throw Error('Relevé de gaine invalide.');
 const occupiedIds=new Set([...Object.values(s.world).flatMap(w=>w.enemies.map(e=>e.id)),...s.pursuers.map(p=>p.enemy.id)]),busy=new Set();
 if(a.transits.length>routes.size)throw Error('Trop de transferts en gaine.');
 for(const t of a.transits){const route=routes.get(t.route),from=mouths.get(t.from),to=mouths.get(t.to);
  if(!record(t)||!route||!from||!to||from.id===to.id||from.route!==route.id||to.route!==route.id||busy.has(route.id))throw Error('Liaison de gaine incohérente.');
  busy.add(route.id);if(!timer(t.remaining,route.duration)||!timer(t.warning,rules.warningDuration)||!timer(t.bash,rules.hitWindup)||typeof t.announced!=='boolean')throw Error('Minuterie de gaine invalide.');
  validateEnemy(t.enemy,D.rooms.find(r=>r.id===from.room));if(occupiedIds.has(t.enemy.id))throw Error('Créature dupliquée entre gaine et monde.');occupiedIds.add(t.enemy.id);
 }
 for(const [rid,w]of Object.entries(s.world))for(const e of w.enemies){
  if(e.ductCooldown===undefined)e.ductCooldown=0;if(!timer(e.ductCooldown,rules.retryCooldown))throw Error('Repos de créature invalide.');
  if(e.ductEntry){const v=e.ductEntry,d=mouths.get(v.id);if(!record(v)||!d||d.room!==rid||e.kind!=='adult'||e.hp<=0||!['approach','entering'].includes(v.stage)||!timer(v.remaining,rules.entryDuration))throw Error('Entrée de gaine invalide.');}
 }
 return s;
}
const API={initial,validateAndUpgrade,mouths,routes,other,near,incoming,occupied,reason,begin,finish,reading,wording,updateWork,candidates,entry,update,contacts,rules};
root.ROP_DUCTS=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
