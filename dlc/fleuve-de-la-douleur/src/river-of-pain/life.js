/* Local civilian routines, finite containers and non-explosive sound decoys.
 * All mutations are deterministic, DOM-free and use the game's physical actions.
 * Citizens are original background residents, present only before the collapse.
 */
(function (root) {
'use strict';
const D = root.ROP_DATA || (typeof require === 'function' ? require('./data.js') : null);
const defs = D.life;
const residents = new Map(defs.residents.map(v => [v.id, v]));
const containers = new Map(defs.containers.map(v => [v.id, v]));
const benches = new Map(defs.benches.map(v => [v.id, v]));
const parts = ['cell', 'wire', 'casing', 'decoy'];
const clone = v => JSON.parse(JSON.stringify(v));
const record = v => v && typeof v === 'object' && !Array.isArray(v);
const finite = v => typeof v === 'number' && Number.isFinite(v);
const within = (v, lo, hi) => finite(v) && v >= lo && v <= hi;
const integer = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const distance = (a,b) => Math.hypot(a.x-b.x,600*(a.z-b.z));
const effective = (s,p) => ({...p,z:s.mode==='classic'?.7:p.z});
function initial() {
  return {revision:5,residents:{},contacts:{},containers:{},
    pockets:Object.fromEntries(Object.keys(D.characters).map(id=>[id,Object.fromEntries(parts.map(k=>[k,0]))])),
    devices:[],debris:[],sequence:0,stats:{conversations:0,opened:0,taken:0,crafted:0,deployed:0,destroyed:0}};
}
function validateAndUpgrade(s) {
  if (s.life === undefined) s.life = initial();
  const a=s.life;
  if (!record(a)||a.revision!==5) throw Error('Vie coloniale incompatible.');
  for (const key of ['residents','contacts','containers','pockets','stats'])
    if (!record(a[key])) throw Error('Registre colonial invalide : '+key);
  if (Object.keys(a.pockets).length!==Object.keys(D.characters).length) throw Error('Poches de matériel incomplètes.');
  for (const [id,p] of Object.entries(a.pockets)) {
    if (!Object.hasOwn(D.characters,id)||!record(p)||Object.keys(p).length!==parts.length) throw Error('Porteur de composants invalide.');
    for (const k of parts) if (!integer(p[k],0,defs.items[k].capacity)||(D.characters[id].child&&p[k]!==0)) throw Error('Composant interdit ou hors capacité.');
  }
  if (Object.keys(a.residents).length>residents.size) throw Error('Trop de résidents.');
  for (const [id,v] of Object.entries(a.residents)) {
    const def=residents.get(id),room=D.rooms.find(r=>r.id===v?.room);
    if (!def||!record(v)||!room||v.room!==def.room||!integer(v.phase,0,1)||!integer(v.node,0,def.points.length-1)
      ||!within(v.x,42,room.width-42)||!within(v.z,room.minZ,room.maxZ)||!within(v.wait,0,8)
      ||!within(v.walk,0,1e9)||!within(v.alarm,0,4)||![-1,1].includes(v.facing)) throw Error('Routine de résident invalide.');
  }
  if (Object.keys(a.contacts).length>residents.size) throw Error('Trop de contacts.');
  for (const [id,v] of Object.entries(a.contacts)) {
    const def=residents.get(id);
    if (!def||!record(v)||v.room!==def.room||!integer(v.phase,0,1)||!within(v.seen,0,s.elapsed+.001)
      ||!Array.isArray(v.topics)||new Set(v.topics).size!==v.topics.length||v.topics.length>2
      ||v.topics.some(k=>!def.topics.some(t=>t.id===k))) throw Error('Souvenir de contact invalide.');
  }
  if (Object.keys(a.containers).length>containers.size) throw Error('Trop de réserves.');
  for (const [id,v] of Object.entries(a.containers)) {
    const def=containers.get(id);
    if (!def||!record(v)||typeof v.open!=='boolean'||!record(v.remaining)
      ||Object.keys(v.remaining).length!==Object.keys(def.items).length) throw Error('Coffre invalide.');
    for (const [k,n] of Object.entries(v.remaining)) {
      if (!Object.hasOwn(def.items,k)||!integer(n,0,def.items[k])||(!v.open&&n!==def.items[k])) throw Error('Contenu de coffre incohérent.');
    }
  }
  if (!Array.isArray(a.devices)||a.devices.length>2||!Array.isArray(a.debris)||a.debris.length>8||!integer(a.sequence,0,1e7)) throw Error('Registre de balises invalide.');
  const ids=new Set();
  for (const v of [...a.devices,...a.debris]) {
    const room=D.rooms.find(r=>r.id===v?.room),n=Number(v?.id?.slice(6));
    if (!record(v)||!room||!/^sound-[1-9][0-9]*$/.test(v.id)||!integer(n,1,a.sequence)||ids.has(v.id)
      ||!Object.hasOwn(D.characters,v.owner)||D.characters[v.owner].child
      ||!within(v.x,42,room.width-42)||!within(v.z,room.minZ,room.maxZ)) throw Error('Position ou identité de balise invalide.');
    ids.add(v.id);
    if (a.devices.includes(v)) {
      if (!within(v.delay,0,3)||!within(v.life,.000001,12)||!within(v.pulse,0,1.5)||!within(v.buzz,0,.3)
        ||(v.delay>0&&(v.life!==12||v.buzz!==0))) throw Error('Minuterie de balise invalide.');
    } else if (!['spent','destroyed'].includes(v.reason)) throw Error('Débris de balise invalide.');
  }
  const keys=['conversations','opened','taken','crafted','deployed','destroyed'];
  if (Object.keys(a.stats).length!==keys.length||keys.some(k=>!integer(a.stats[k],0,1e8))) throw Error('Statistiques coloniales invalides.');
  return s;
}
function activeResidents(s) {
  return defs.residents.filter(d=>d.room===s.room&&s.phase>=d.minPhase&&s.phase<=d.maxPhase);
}
function ensureResident(s,def) {
  let body=s.life.residents[def.id];
  if (!body||body.phase!==s.phase) {
    body=s.life.residents[def.id]={room:def.room,phase:s.phase,...clone(def.points[0]),node:1,wait:1.6,walk:0,facing:1,alarm:0};
  }
  return body;
}
function visibleResidents(sim) {
  return activeResidents(sim.s).map(def=>({def,body:effective(sim.s,ensureResident(sim.s,def))}));
}
function containerState(s,def,create=false) {
  let v=s.life.containers[def.id];
  if (!v) { v={open:false,remaining:clone(def.items)}; if(create)s.life.containers[def.id]=v; }
  return v;
}
function available(sim,def,radius=110) {
  return !!def&&sim.s.status==='playing'&&!sim.s.systems.hiding&&!sim.s.passages.transit
    &&def.room===sim.s.room&&sim.near(sim.s.player,def,radius);
}
function candidates(sim) {
  const s=sim.s,out=[];
  for(const d of defs.containers) if(available(sim,d,100)) {
    const v=containerState(s,d),empty=Object.values(v.remaining).every(n=>n===0);
    out.push({type:'container',ref:d,priority:2.4,label:(empty?'Vide · ':v.open?'Fouiller · ':'Ouvrir · ')+d.label});
  }
  for(const d of defs.benches) if(available(sim,d,100)) out.push({type:'bench',ref:d,priority:2.5,label:d.label+(sim.character.child?' · outil pour adultes':'')});
  for(const {def,body} of visibleResidents(sim)) if(sim.near(s.player,body,104))
    out.push({type:'resident',ref:{...body,id:def.id},priority:3.5,label:body.alarm>0?def.name+' cherche un abri':'Parler à '+def.name});
  return out;
}
function conversationAllowed(sim,def) {
  if(!def||sim.s.phase>1||!available(sim,{...ensureResident(sim.s,def),room:def.room})) return false;
  return ensureResident(sim.s,def).alarm===0&&sim.s.player.noise<=.45
    &&!sim.ensureRoom().enemies.some(e=>e.hp>0&&distance(e,sim.s.player)<500&&!sim.occluded(e,sim.s.player));
}
function beginConversation(sim,id) {
  const def=residents.get(id);
  if(sim.s.work||!conversationAllowed(sim,def)) {sim.notify('Attendez une accalmie et approchez la personne.');return false;}
  sim.s.passages.listening=null;
  sim.s.work={kind:'life-talk',id,timer:0,duration:.85,x:sim.s.player.x,z:sim.s.player.z};return true;
}
function readTopic(sim,id,topic) {
  const def=residents.get(id),t=def?.topics.find(t=>t.id===topic),v=sim.s.life.contacts[id];
  if(!t||!v||sim.s.work||!conversationAllowed(sim,def)) return null;
  if(!v.topics.includes(topic))v.topics.push(topic);
  v.seen=sim.s.elapsed;v.phase=sim.s.phase;v.room=sim.s.room;sim.emit('save');return t.text;
}
function search(sim,id,method='quiet') {
  const def=containers.get(id);
  if(!['quiet','fast'].includes(method)||sim.s.work||!available(sim,def)||containerState(sim.s,def).open)return false;
  sim.s.passages.listening=null;
  sim.s.work={kind:'life-search',id,method,timer:0,duration:method==='quiet'?3.2:1.05,x:sim.s.player.x,z:sim.s.player.z};
  sim.s.player.noise=Math.max(sim.s.player.noise,method==='fast'?.88:.08);sim.emit('searchStarted',{fast:method==='fast'});return true;
}
function takeAmount(sim,id,item) {
  const def=containers.get(id);if(!available(sim,def)||sim.s.work)return 0;
  const v=containerState(sim.s,def),left=v.remaining[item]||0,p=sim.s.player;
  if(!v.open||left<=0||!Object.hasOwn(def.items,item))return 0;
  if(parts.includes(item))return sim.character.child?0:Math.min(left,Math.max(0,defs.items[item].capacity-sim.s.life.pockets[sim.s.character][item]));
  if(item==='ration')return p.hp<100?1:0;
  if(item==='ammo'&&!sim.character.weapon||item==='flare'&&sim.character.child)return 0;
  const k={ammo:'reserve',medkit:'medkits',flare:'flares'}[item];
  return k?Math.min(left,Math.max(0,defs.items[item].capacity-p[k])):0;
}
function take(sim,id,item) {
  const n=takeAmount(sim,id,item);if(!n)return false;
  const v=containerState(sim.s,containers.get(id),true),p=sim.s.player;
  v.remaining[item]-=n;
  if(parts.includes(item))sim.s.life.pockets[sim.s.character][item]+=n;
  else if(item==='ration')p.hp=Math.min(100,p.hp+25);
  else p[{ammo:'reserve',medkit:'medkits',flare:'flares'}[item]]+=n;
  sim.s.life.stats.taken+=n;sim.notify(defs.items[item].label+' · '+n+' récupéré'+(n>1?'s':''));sim.emit('save');return true;
}
function recipeStatus(sim,id,recipe) {
  const def=benches.get(id),r=defs.recipes[recipe];
  if(!r||!available(sim,def)||sim.character.child)return 'Un adulte doit être près de l’établi.';
  if(sim.s.work)return 'Une manœuvre est déjà en cours.';
  if(recipe==='decoy'&&sim.s.life.pockets[sim.s.character].decoy>=2)return 'Deux balises déjà emportées.';
  if(recipe==='charge'&&sim.s.systems.battery>=99.9)return 'La lampe est déjà chargée.';
  const p=sim.s.life.pockets[sim.s.character];
  return Object.entries(r.cost).some(([k,n])=>p[k]<n)?'Composants manquants.':'';
}
function craft(sim,id,recipe) {
  const reason=recipeStatus(sim,id,recipe);if(reason){sim.notify(reason);return false;}
  sim.s.passages.listening=null;
  sim.s.work={kind:'life-craft',id,recipe,timer:0,duration:defs.recipes[recipe].duration,x:sim.s.player.x,z:sim.s.player.z};return true;
}
function finishWork(sim,task) {
  const s=sim.s;if(s.status!=='playing')return false;
  if(task.kind==='life-talk') {
    const def=residents.get(task.id);if(!conversationAllowed(sim,def))return false;
    const previous=s.life.contacts[def.id];s.life.contacts[def.id]={room:s.room,phase:s.phase,seen:s.elapsed,topics:previous?.topics||[]};
    s.life.stats.conversations++;sim.emit('conversation',{id:def.id});sim.emit('save');return true;
  }
  if(task.kind==='life-search') {
    const def=containers.get(task.id);if(!available(sim,def))return false;
    const v=containerState(s,def,true);if(v.open)return false;v.open=true;s.life.stats.opened++;
    sim.notify('Fermoir ouvert. E permet de consulter la réserve.');sim.emit('containerOpened',{id:def.id});sim.emit('save');return true;
  }
  if(task.kind==='life-craft') {
    if(recipeStatus(sim,task.id,task.recipe))return false;
    const r=defs.recipes[task.recipe],p=s.life.pockets[s.character];
    for(const [k,n] of Object.entries(r.cost))p[k]-=n;
    if(task.recipe==='decoy')p.decoy++;else s.systems.battery=Math.min(100,s.systems.battery+45);
    s.life.stats.crafted++;sim.notify(task.recipe==='decoy'?'Balise assemblée. K pour la poser ; éloignez-vous avant les bips.':'Pile raccordée · lampe rechargée de 45 points au maximum.');
    sim.emit('crafted',{recipe:task.recipe});sim.emit('save');return true;
  }
  return false;
}
function updateWork(sim) {
  const task=sim.s.work;if(!task||!task.kind.startsWith('life-'))return;
  if(task.kind==='life-talk') {
    if(!conversationAllowed(sim,residents.get(task.id))) {sim.s.work=null;sim.notify('La conversation est interrompue.');}
  } else sim.s.player.noise=Math.max(sim.s.player.noise,task.kind==='life-search'?(task.method==='fast'?.88:.08):.14);
}
function updateResidents(sim,dt) {
  const s=sim.s;
  for(const def of activeResidents(s)) {
    const b=ensureResident(s,def),shown=effective(s,b),d=distance(shown,s.player);
    if(d<650&&s.player.noise>.6)b.alarm=3.2;else b.alarm=Math.max(0,b.alarm-dt);
    if(b.alarm>0) {
      const dx=def.refuge.x-b.x;
      if(Math.abs(dx)>12){const before=b.x;sim.move(b,Math.sign(dx),0,115,dt);if(b.x!==before)b.walk+=dt*15;b.facing=Math.sign(dx);}
      continue;
    }
    if(d<160||s.work?.kind==='life-talk'&&s.work.id===def.id){b.facing=s.player.x>=b.x?1:-1;continue;}
    if(b.wait>0){b.wait=Math.max(0,b.wait-dt);continue;}
    const target=def.points[b.node],dx=target.x-b.x;
    if(Math.abs(dx)<9){b.node=(b.node+1)%def.points.length;b.wait=s.phase===0?2.5:4.2;continue;}
    const others=activeResidents(s).filter(x=>x.id!==def.id).map(x=>effective(s,ensureResident(s,x)));
    if(others.some(x=>Math.abs(x.x-(b.x+Math.sign(dx)*40))<45&&Math.abs(x.z-b.z)<.12))continue;
    const before=b.x;sim.move(b,Math.sign(dx),0,s.phase===0?47:37,dt);if(b.x!==before)b.walk+=dt*6;b.facing=Math.sign(dx);
  }
}
function discardDevice(sim,d,reason) {
  const a=sim.s.life;if(!a.devices.some(v=>v.id===d.id))return;
  a.devices=a.devices.filter(v=>v.id!==d.id);
  a.debris.push({id:d.id,owner:d.owner,room:d.room,x:d.x,z:d.z,reason});a.debris=a.debris.slice(-8);
  if(reason==='destroyed'){a.stats.destroyed++;if(d.room===sim.s.room){sim.notify('Le signal de la balise s’arrête net.');sim.emit('deviceBroken');}}
}
function deploy(sim) {
  const s=sim.s,p=s.life.pockets[s.character];
  if(s.status!=='playing'||sim.character.child||s.work||s.systems.hiding||s.passages.transit)return false;
  if(p.decoy<=0){sim.notify('Aucune balise sonore. Assemblez-en une sur un établi.');return false;}
  if(s.life.devices.length>=2){sim.notify('Deux balises sont déjà actives.');return false;}
  s.passages.listening=null;p.decoy--;s.life.sequence++;
  s.life.devices.push({id:'sound-'+s.life.sequence,owner:s.character,room:s.room,x:s.player.x,z:s.player.z,delay:3,life:12,pulse:0,buzz:0});
  s.life.stats.deployed++;sim.notify('Balise posée · armement dans 3 secondes. Éloignez-vous.');sim.emit('devicePlaced');sim.emit('save');return true;
}
function updateDevices(sim,dt) {
  const a=sim.s.life;
  for(const d of [...a.devices]) {
    if(d.delay>0){d.delay=Math.max(0,d.delay-dt);continue;}
    d.life=Math.max(0,d.life-dt);d.buzz=Math.max(0,d.buzz-dt);d.pulse=Math.max(0,d.pulse-dt);
    if(d.life===0){discardDevice(sim,d,'spent');continue;}
    if(d.pulse===0){d.pulse=1.5;d.buzz=.3;if(d.room===sim.s.room)sim.emit('devicePulse');}
  }
}
function attractor(sim,enemy) {
  return sim.s.life.devices.filter(d=>d.room===sim.s.room&&d.delay===0&&d.buzz>0
    &&distance(d,enemy)<(sim.occluded(d,enemy)?385:700))
    .sort((a,b)=>distance(a,enemy)-distance(b,enemy))[0]||null;
}
const api={initial,validateAndUpgrade,activeResidents,ensureResident,visibleResidents,containerState,available,candidates,
  beginConversation,conversationAllowed,readTopic,search,takeAmount,take,recipeStatus,craft,finishWork,updateWork,
  updateResidents,deploy,updateDevices,attractor,discardDevice,residents,containers,benches,parts,effective};
root.ROP_LIFE=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
