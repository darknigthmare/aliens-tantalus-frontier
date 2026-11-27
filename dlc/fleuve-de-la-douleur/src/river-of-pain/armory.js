/* Optional film-inspired equipment. All numeric values below are game balance, not specifications. */
(function(root){'use strict';
const D=root.ROP_DATA||(typeof require==='function'?require('./data.js'):null),R=D.armory.rules;
const C=()=>root.ROP_CORE||(typeof require==='function'?require('./core.js'):null);
const F=()=>root.ROP_DEFENSE||(typeof require==='function'?require('./defense.js'):null);
const M=()=>root.ROP_MOBILITY||(typeof require==='function'?require('./mobility.js'):null);
const clone=x=>JSON.parse(JSON.stringify(x));
function initial(){return {revision:9,kits:{brackett:{issued:false,selected:'pulse',fuel:0,grenades:0},paris:{issued:false,selected:'pulse',fuel:0,grenades:0}},projectiles:[],sequence:0,stats:{issued:0,flamePulses:0,grenades:0}};}
function validateAndUpgrade(s){
 if(!s.armory)s.armory=initial();const a=s.armory;
 if(a.revision!==9||!a.kits||Object.keys(a.kits).sort().join(',')!=='brackett,paris')throw Error('Armurerie incompatible.');
 for(const id of ['brackett','paris']){const k=a.kits[id];
  if(!k||typeof k.issued!=='boolean'||!['pulse','flame'].includes(k.selected)||!Number.isInteger(k.fuel)||k.fuel<0||k.fuel>R.fuel||!Number.isInteger(k.grenades)||k.grenades<0||k.grenades>R.grenades||!k.issued&&(k.fuel||k.grenades||k.selected!=='pulse'))throw Error('Dotation incohérente.');
 }
 if(!Number.isInteger(a.sequence)||a.sequence<0||a.sequence>1e6||!a.stats||['issued','flamePulses','grenades'].some(k=>!Number.isInteger(a.stats[k])||a.stats[k]<0||a.stats[k]>1e6))throw Error('Registre de dotation invalide.');
 if(a.stats.issued!==Object.values(a.kits).filter(k=>k.issued).length||a.sequence!==a.stats.grenades)throw Error('Historique de dotation incohérent.');
 if(!Array.isArray(a.projectiles)||a.projectiles.length>1)throw Error('Grenade invalide.');
 for(const p of a.projectiles){
  const r=D.rooms.find(r=>r.id===p.room);
  if(!r||p.room!==s.room||!a.kits[p.owner]?.issued||p.owner!==s.character||!Number.isInteger(p.id)||p.id!==a.sequence||
    ![p.x,p.z,p.vx,p.vz,p.distance,p.life].every(Number.isFinite)||p.x<38||p.x>r.width-38||p.z<r.minZ-.05||p.z>r.maxZ+.05||
    p.life<=0||p.life>1.1||p.distance<0||p.distance>R.grenadeRange+1||Math.abs(Math.hypot(p.vx,p.vz)-1)>.001)throw Error('Trajectoire sauvegardée invalide.');
 }
 return a;
}
const kit=s=>s.armory.kits[s.character]||null;
function active(s){return kit(s)?.selected||'none';}
function ready(sim){const s=sim.s;return s.status==='playing'&&!!kit(s)&&!s.work&&!s.systems.hiding&&!s.passages.transit&&!M().mounted(s);}
function rackNear(sim){const r=D.armory.rack;return sim.s.room===r.room&&C().dist(sim.s.player,{x:r.x,z:sim.s.mode==='classic'?.7:r.z})<=110;}
function issue(sim){
 if(!ready(sim)||!rackNear(sim)){sim.notify('Rejoignez le râtelier avec Brackett ou Paris.');return false;}
 if(kit(sim.s).issued){sim.notify('Cette dotation a déjà été prélevée. Aucun réapprovisionnement.');return false;}
 const p=sim.s.player;sim.s.work={kind:'armory',id:D.armory.rack.id,x:p.x,z:p.z,timer:0,duration:R.issueDuration};
 sim.s.passages.listening=null;return true;
}
function finish(sim){
 const k=kit(sim.s);if(!k||k.issued||!rackNear(sim))return false;
 Object.assign(k,{issued:true,fuel:R.fuel,grenades:R.grenades});
 sim.s.armory.stats.issued++;sim.notify('Dotation facultative emportée. Les réserves sont propres à ce Marine.');sim.emit('save');return true;
}
function select(sim,id){
 if(!ready(sim)||!['pulse','flame'].includes(id)||sim.s.player.reload>0)return false;
 const k=kit(sim.s);if(id==='flame'&&!k.issued){sim.notify('Récupérez d’abord la dotation à l’armurerie.');return false;}
 k.selected=id;sim.cooldown=Math.max(sim.cooldown,.45);sim.emit('save');return true;
}
function damageEnemy(sim,e,amount){
 if(e.hp<=0)return;
 e.hp=Math.max(0,e.hp-amount);e.notice=1;e.memory={x:sim.s.player.x,z:sim.s.player.z,ttl:8};e.state='chase';sim.s.stats.shotsHit++;sim.emit('impact',{x:e.x,z:e.z});
 if(e.hp===0){e.state='dead';e.bash=null;e.ductEntry=null;sim.s.stats.kills++;sim.ensureRoom().acid.push({x:e.x,z:e.z,ttl:25});sim.emit('kill');}
}
function direction(sim){return sim.s.exploration.aiming?{...sim.s.exploration.aim}:{x:sim.s.player.facing,z:0};}
function flame(sim){
 if(!ready(sim)||active(sim.s)!=='flame'||sim.cooldown>0||sim.s.player.reload>0)return false;
 const k=kit(sim.s);if(k.fuel<=0){sim.notify('Réservoir M240 vide. Revenez au M41A.');sim.cooldown=.6;return false;}
 const p=sim.s.player,a=direction(sim);k.fuel--;sim.s.armory.stats.flamePulses++;sim.s.stats.shots++;sim.cooldown=R.flameInterval;p.noise=1;sim.s.passages.listening=null;
 // The cone is traced from its source: walls and closed shutters stop every hit.
 for(const e of sim.ensureRoom().enemies){
  const dx=e.x-p.x,dz=(e.z-p.z)*600,length=Math.hypot(dx,dz),dot=(dx*a.x+dz*a.z)/(length||1);
  if(length<=R.flameRange&&dot>=.91&&!sim.occluded(p,e))damageEnemy(sim,e,R.flameDamage);
 }
 sim.flameVisual={room:sim.s.room,x:p.x,z:p.z,ax:a.x,az:a.z,ttl:.18};
 sim.emit('flame');return true;
}
function launch(sim){
 if(!ready(sim)||active(sim.s)!=='pulse'||sim.cooldown>0||sim.s.player.reload>0||sim.s.armory.projectiles.length)return false;
 const k=kit(sim.s);if(!k.issued||k.grenades<=0){sim.notify('Aucune grenade dans la dotation de ce Marine.');return false;}
 k.grenades--;const a=direction(sim),p=sim.s.player,s=sim.s,id=++s.armory.sequence;s.armory.stats.grenades++;
 s.armory.projectiles.push({id,owner:s.character,room:s.room,x:p.x,z:p.z,vx:a.x,vz:a.z,life:1.1,distance:0});
 p.noise=1;sim.cooldown=.9;s.passages.listening=null;sim.emit('shot');sim.emit('save');return true;
}
function explode(sim,q,barrier=null){
 const radius=R.grenadeRadius;
 for(const e of sim.ensureRoom().enemies)if(C().dist(e,q)<radius&&!sim.occluded(q,e))damageEnemy(sim,e,R.grenadeDamage);
 if(C().dist(sim.s.player,q)<radius&&!sim.occluded(q,sim.s.player))sim.hit(35);
 if(sim.s.escort&&C().dist(sim.s.escort,q)<radius&&!sim.occluded(q,sim.s.escort))sim.hitEscort(35);
 if(barrier?.cover.type==='shutter')F().damage(sim,barrier.cover.id,40,'grenade');
 if(barrier?.cover.type==='rover')M().damage(sim,40,'grenade');
 sim.blastVisual={room:q.room,x:q.x,z:q.z,ttl:.5};sim.emit('explosion');sim.emit('save');
}
function update(sim,dt){
 if(sim.flameVisual)sim.flameVisual.ttl=Math.max(0,sim.flameVisual.ttl-dt);
 if(sim.blastVisual)sim.blastVisual.ttl=Math.max(0,sim.blastVisual.ttl-dt);
 const s=sim.s;if(s.status!=='playing'||s.passages.transit)return;
 for(const q of [...s.armory.projectiles]){
  const old={x:q.x,z:q.z},step=Math.min(680*dt,R.grenadeRange-q.distance);
  const next={x:q.x+q.vx*step,z:q.z+q.vz*step/600};
  const barrier=C().segmentHit(sim.collisionRoom,old,next);let hit=barrier?.t??Infinity;
  for(const e of sim.ensureRoom().enemies)if(e.hp>0){
   const dx=next.x-old.x,dz=(next.z-old.z)*600,t=C().clamp(((e.x-old.x)*dx+(e.z-old.z)*600*dz)/(dx*dx+dz*dz||1),0,1);
   if(C().dist(e,{x:old.x+dx*t,z:old.z+dz*t/600})<22)hit=Math.min(hit,t);
  }
  const bounds=next.x<40||next.x>sim.room.width-40||next.z<sim.room.minZ||next.z>sim.room.maxZ;
  if(hit<=1){
   const t=Math.max(0,hit-(step?2/step:0));q.x=old.x+(next.x-old.x)*t;q.z=old.z+(next.z-old.z)*t;
   s.armory.projectiles=[];explode(sim,q,barrier&&barrier.t===hit?barrier:null);break;
  }
  q.x=bounds?old.x:next.x;q.z=bounds?old.z:next.z;q.life-=dt;q.distance+=step;
  if(bounds||q.life<=0||q.distance>=R.grenadeRange){s.armory.projectiles=[];explode(sim,q);break;}
 }
}
const api={initial,validateAndUpgrade,kit,active,ready,rackNear,issue,finish,select,flame,launch,update};
root.ROP_ARMORY=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
