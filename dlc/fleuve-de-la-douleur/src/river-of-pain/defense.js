/* In-room mechanical defenses: deterministic state, no DOM, no off-screen enemy spawning. */
(function(root){'use strict';
const D=root.ROP_DATA||(typeof require==='function'?require('./data.js'):null),S=root.ROP_COLONY||(typeof require==='function'?require('./colony.js'):null);
const cfg=D.defense,shutters=new Map(cfg.shutters.map(d=>[d.id,d])),alarms=new Map(cfg.alarms.map(d=>[d.id,d]));
const C=()=>root.ROP_CORE||(typeof require==='function'?require('./core.js'):null);
const finite=n=>typeof n==='number'&&Number.isFinite(n),record=o=>o&&typeof o==='object'&&!Array.isArray(o);
const statsKeys=['closed','opened','broken','strikes','alarms','alarmBroken','cancelled'];
function initial(){return {revision:6,shutters:Object.fromEntries(cfg.shutters.map(d=>[d.id,{state:'open',hp:100}])),alarms:Object.fromEntries(cfg.alarms.map(d=>[d.id,{uses:0,delay:0,remaining:0,cooldown:0,pulse:0,buzz:0,broken:false}])),stats:Object.fromEntries(statsKeys.map(k=>[k,0]))};}
function geometry(s,d){return {id:d.id,x:d.x,z:s.mode==='classic'?.7:d.z,w:d.w,d:s.mode==='classic'?.10:d.d,type:'shutter'};}
function floor(s,r,body=null){const dynamic=body?.kind==='facehugger'?[]:cfg.shutters.filter(d=>d.room===r.id&&s.defense.shutters[d.id].state==='closed').map(d=>geometry(s,d));return {...r,cover:[...r.cover,...dynamic]};}
function inside(s,d,b,pad=18){const g=geometry(s,d);return Math.abs(b.x-g.x)<g.w/2+pad&&Math.abs(b.z-g.z)<g.d/2+pad/700;}
function controls(sim,d){return d.controls.map(p=>({...p,id:d.id,room:d.room}));}
function near(sim,d){return d.room===sim.s.room&&(shutters.has(d.id)?controls(sim,d).some(p=>sim.near(sim.s.player,p,90)):sim.near(sim.s.player,d,95));}
function occupied(sim,d){const L=root.ROP_LIFE;const residents=L?L.visibleResidents(sim).map(v=>v.body):[];return [sim.s.player,sim.s.escort,...sim.ensureRoom().enemies.filter(e=>e.hp>0),...residents].filter(Boolean).some(b=>inside(sim.s,d,b));}
function reason(sim,id,action){
 const s=sim.s,d=shutters.get(id)||alarms.get(id);
 if(!d||d.room!==s.room)return 'Aucun dispositif de ce type dans cette pièce.';
 if(s.status!=='playing'||s.passages.transit||s.work||s.systems.hiding)return 'Revenez au terrain, hors cachette, pour intervenir.';
 if(!near(sim,d))return 'Approchez la commande dans la pièce.';
 if(shutters.has(id)){
  const v=s.defense.shutters[id];if(v.state==='broken')return 'Mécanisme détruit : le passage reste ouvert.';
  if(!['close','open'].includes(action))return 'Manœuvre inconnue.';
  if(action==='close'){
   if(sim.character.child)return 'Newt peut libérer le volet, pas l’armer.';
   if(v.state!=='open')return 'Le volet est déjà fermé.';
   if(occupied(sim,d))return 'Emprise occupée : reculez ou rappelez votre compagnon.';
  }else if(v.state!=='closed')return 'Le passage est déjà ouvert.';
 }else{
  const v=s.defense.alarms[id];if(action!=='alarm')return 'Commande inconnue.';
  if(sim.character.child)return 'Commande réservée aux adultes.';
  if(v.broken)return 'Avertisseur détruit.';
  if(v.uses>=d.charges)return 'Réserve de déclenchement épuisée.';
  if(v.remaining>0||v.delay>0)return 'Un signal est déjà engagé.';
  if(v.cooldown>0)return 'Réarmement en cours : '+Math.ceil(v.cooldown)+' s.';
  if(!S.isPowered(s,sim.room))return 'Circuit coupé : rétablissez son alimentation.';
 }
 return '';
}
function begin(sim,id,action){const why=reason(sim,id,action);if(why){sim.notify(why);return false;}const d=shutters.get(id)||alarms.get(id);sim.s.passages.listening=null;sim.s.exploration.aiming=false;sim.s.work={kind:'defense',id,action,timer:0,duration:action==='alarm'?cfg.rules.alarmWorkDuration:action==='close'?d.closeDuration:sim.character.child?d.childReleaseDuration:d.openDuration,x:sim.s.player.x,z:sim.s.player.z};sim.emit('mechanism');return true;}
function invalidate(sim){for(const e of sim.ensureRoom().enemies){e.path=[];e.repath=0;e.bash=null;}if(sim.s.escort){sim.s.escort.path=[];sim.s.escort.repath=0;}}
function finish(sim,task){const why=reason(sim,task.id,task.action);if(why){sim.s.defense.stats.cancelled++;sim.notify(why);return false;}
 const a=sim.s.defense,d=shutters.get(task.id)||alarms.get(task.id);
 if(task.action==='alarm'){Object.assign(a.alarms[d.id],{uses:a.alarms[d.id].uses+1,delay:d.delay,remaining:d.duration,cooldown:d.cooldown,pulse:0,buzz:0});a.stats.alarms++;sim.notify('Avertisseur armé. Le premier signal arrive dans quatre secondes.');}
 else{a.shutters[d.id].state=task.action==='close'?'closed':'open';a.stats[task.action==='close'?'closed':'opened']++;invalidate(sim);sim.notify(task.action==='close'?'Volet fermé. Il retient les adultes, pas les petits parasites.':'Passage libéré. L’intégrité du volet n’est pas réparée.');}
 sim.emit('mechanism');sim.emit('save');return true;
}
function updateWork(sim){if(sim.s.work?.kind==='defense')sim.s.player.noise=Math.max(sim.s.player.noise,sim.s.work.action==='close'?.48:.20);}
function candidates(sim){if(sim.s.status!=='playing'||sim.s.passages.transit||sim.s.systems.hiding)return [];
 const result=[];
 for(const d of cfg.shutters)if(near(sim,d)){const p=controls(sim,d).sort((a,b)=>C().dist(a,sim.s.player)-C().dist(b,sim.s.player))[0];result.push({type:'defense',ref:p,priority:4.6,label:d.label+' · '+(sim.s.defense.shutters[d.id].state==='closed'?'FERMÉ':sim.s.defense.shutters[d.id].state==='broken'?'DÉTRUIT':'OUVERT')});}
 for(const d of cfg.alarms)if(near(sim,d))result.push({type:'defense',ref:d,priority:4.6,label:d.label});return result;
}
function damage(sim,id,amount,source){const d=shutters.get(id),v=sim.s.defense.shutters[id];if(!d||d.room!==sim.s.room||v.state!=='closed')return false;
 v.hp=Math.max(0,v.hp-amount);sim.s.defense.stats.strikes++;sim.emit('shutterStrike',{id,source});
 if(v.hp===0){v.state='broken';sim.s.defense.stats.broken++;invalidate(sim);sim.notify('Le volet cède ! Le passage est libre.');sim.emit('breach');}sim.emit('save');return true;}
function updateAlarms(sim,dt){const a=sim.s.defense;
 for(const d of cfg.alarms){const v=a.alarms[d.id];v.cooldown=Math.max(0,v.cooldown-dt);v.buzz=Math.max(0,v.buzz-dt);
  if(v.remaining<=0||v.broken)continue;
  const r=D.rooms.find(r=>r.id===d.room);
  if(!S.isPowered(sim.s,r)){v.delay=0;v.remaining=0;v.pulse=0;v.buzz=0;if(sim.s.room===d.room)sim.notify('L’avertisseur s’éteint : son circuit est coupé.');sim.emit('save');continue;}
  if(v.delay>0){v.delay=Math.max(0,v.delay-dt);continue;}
  v.remaining=Math.max(0,v.remaining-dt);v.pulse=Math.max(0,v.pulse-dt);
  if(v.remaining===0){v.buzz=0;v.pulse=0;sim.emit('save');continue;}
  if(v.pulse===0){v.pulse=1.5;v.buzz=.28;if(sim.s.room===d.room)sim.emit('sirenPulse');}
 }
}
function attractor(sim,e){const candidates=[];
 for(const d of cfg.alarms){const v=sim.s.defense.alarms[d.id];if(d.room!==sim.s.room||v.broken||v.delay>0||v.remaining<=0||v.buzz<=0)continue;
  const p={...d,z:sim.s.mode==='classic'?.7:d.z},distance=C().dist(e,p),range=sim.occluded(e,p)?d.occludedRange:d.range;
  if(distance<range)candidates.push({...p,alarm:true,distance});}
 return candidates.sort((a,b)=>a.distance-b.distance)[0]||null;
}
function silence(sim,id){const v=sim.s.defense.alarms[id];if(!v||v.broken)return false;Object.assign(v,{broken:true,delay:0,remaining:0,pulse:0,buzz:0});sim.s.defense.stats.alarmBroken++;sim.notify('L’avertisseur a été détruit.');sim.emit('deviceBroken');sim.emit('save');return true;}
function follow(sim,e,path,speed,dt){const target=path[0];if(!target)return;const dist=C().dist(e,target);if(dist<.25){path.shift();return;}
 const dx=target.x-e.x,dz=(target.z-e.z)*600;sim.move(e,dx/dist,dz/dist,Math.min(speed,dist/dt),dt);if(Math.abs(dx)>1)e.facing=Math.sign(dx);}
function breakThrough(sim,e,dt,memory){
 if(e.kind!=='adult')return false;
 if(e.bash){const d=shutters.get(e.bash.id),v=d&&sim.s.defense.shutters[d.id],g=d&&geometry(sim.s,d);
  if(!d||d.room!==sim.s.room||v.state!=='closed'||Math.abs(e.x-g.x)>g.w/2+88||Math.abs(e.z-g.z)>g.d/2+.09){e.bash=null;return false;}
  e.bash.timer=Math.max(0,e.bash.timer-dt);if(e.bash.timer===0){const id=e.bash.id;e.bash=null;damage(sim,id,cfg.rules.shutterAdultDamage,'adult');e.cooldown=1.05;}return true;
 }
 if(e.notice<=.52||memory.ttl<=0)return false;
 const closed=cfg.shutters.filter(d=>d.room===sim.s.room&&sim.s.defense.shutters[d.id].state==='closed');if(!closed.length)return false;
 const r=floor(sim.s,sim.room,e);
 // Path exists around the side: preserve navigation rather than attacking through an open lane.
 if(C().localPath(r,e,memory,sim.s.mode).length)return false;
 const hits=closed.filter(d=>C().lineBlocked({...r,cover:[geometry(sim.s,d)]},e,memory)).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x));
 const d=hits[0];if(!d)return false;e.notice=Math.max(e.notice,.65);const g=geometry(sim.s,d),side=e.x<g.x?-1:1;
 const contact={x:g.x+side*(g.w/2+32),z:sim.s.mode==='classic'?.7:Math.max(g.z-g.d/2+.02,Math.min(g.z+g.d/2-.02,e.z))};
 const without={...r,cover:r.cover.filter(c=>c.id!==d.id)};
 if(C().dist(e,contact)<26&&!C().lineBlocked(without,e,contact)){if(e.cooldown<=0){e.bash={id:d.id,timer:cfg.rules.shutterWindup};e.path=[];sim.emit('shutterWindup',{id:d.id});}return true;}
 if(e.repath<=0||!e.path.length){e.path=C().localPath(r,e,contact,sim.s.mode);e.repath=.55;}
 if(!e.path.length)return false;follow(sim,e,e.path,138*C().settings[sim.s.difficulty].enemySpeed,dt);return true;
}
function validateAndUpgrade(s){
 if(s.defense===undefined)s.defense=initial();const a=s.defense;
 if(!record(a)||a.revision!==6||!record(a.shutters)||!record(a.alarms)||!record(a.stats))throw Error('Registre de dispositifs incompatible.');
 if(Object.keys(a.shutters).length!==shutters.size||Object.keys(a.alarms).length!==alarms.size)throw Error('Liste de dispositifs incomplète.');
 for(const [id,v]of Object.entries(a.shutters)){if(!shutters.has(id)||!record(v)||!['open','closed','broken'].includes(v.state)||!finite(v.hp)||v.hp<0||v.hp>100||(v.state==='broken')!==(v.hp===0))throw Error('État de volet invalide.');}
 for(const [id,v]of Object.entries(a.alarms)){const d=alarms.get(id);if(!d||!record(v)||!Number.isInteger(v.uses)||v.uses<0||v.uses>d.charges||typeof v.broken!=='boolean')throw Error('Avertisseur invalide.');
  for(const [k,max]of [['delay',4],['remaining',10],['cooldown',45],['pulse',1.5],['buzz',.28]])if(!finite(v[k])||v[k]<0||v[k]>max)throw Error('Minuterie d’avertisseur invalide.');
  if(v.delay>0&&(v.remaining!==10||v.buzz!==0)||v.uses===0&&(v.delay||v.remaining||v.cooldown||v.buzz||v.broken)||v.broken&&(v.remaining||v.delay||v.buzz)||v.remaining===0&&(v.delay||v.buzz))throw Error('Cycle d’avertisseur incohérent.');
 }
 if(Object.keys(a.stats).length!==statsKeys.length||Object.entries(a.stats).some(([k,v])=>!statsKeys.includes(k)||!Number.isSafeInteger(v)||v<0||v>1e8))throw Error('Statistique de dispositifs invalide.');
 for(const [rid,w]of Object.entries(s.world))for(const e of w.enemies)if(e.bash){const d=shutters.get(e.bash.id);if(!record(e.bash)||!d||d.room!==rid||e.kind!=='adult'||!finite(e.bash.timer)||e.bash.timer<0||e.bash.timer>cfg.rules.shutterWindup)throw Error('Frappe de volet invalide.');}
 const r=D.rooms.find(r=>r.id===s.room);
 for(const body of [s.player,s.escort].filter(Boolean))if(cfg.shutters.some(d=>d.room===r.id&&a.shutters[d.id].state==='closed'&&inside(s,d,body,13)))throw Error('Un personnage se trouve dans un volet fermé.');
 return s;
}
const API={initial,validateAndUpgrade,geometry,floor,near,occupied,reason,begin,finish,updateWork,candidates,damage,updateAlarms,attractor,silence,breakThrough,shutters,alarms,invalidate,follow};
root.ROP_DEFENSE=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
