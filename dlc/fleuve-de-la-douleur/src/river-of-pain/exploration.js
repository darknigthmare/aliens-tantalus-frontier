/* Exploration v03. Pure state rules shared by simulation, map, UI and save migration. */
(function(root){'use strict';
const D=root.ROP_DATA||(typeof require==='function'?require('./data.js'):null);
const jobs=new Map(D.jobs.map(j=>[j.id,j]));
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const record=o=>o&&typeof o==='object'&&!Array.isArray(o);
function initial(){return {revision:3,jobs:{},encounters:{},trackedJob:null,aim:{x:1,z:0},aiming:false};}
function jobStep(s,id){return s.exploration.jobs[id]??0;}
function eligible(s,j){const c=D.characters[s.character];return !(j.childOnly&&!c.child||j.adultOnly&&c.child);}
function available(s,o){const j=jobs.get(o.job);return !!j&&eligible(s,j)&&jobStep(s,j.id)===o.step;}
function tracked(s){const id=s.exploration.trackedJob,j=jobs.get(id);return j&&jobStep(s,id)<3?{job:j,step:j.steps[jobStep(s,id)],eligible:eligible(s,j)}:null;}
function enemyMemory(e){return e.memory??(e.memory={x:e.x,z:e.z,ttl:0});}
function validateAndUpgrade(s){
 if(s.exploration===undefined)s.exploration=initial();
 const a=s.exploration;
 if(!record(a)||a.revision!==3||!record(a.jobs)||!record(a.encounters))throw Error('Exploration incompatible.');
 if(Object.keys(a.jobs).length>D.jobs.length||Object.entries(a.jobs).some(([id,v])=>!jobs.has(id)||!Number.isInteger(v)||v<0||v>3))throw Error('État de détour invalide.');
 if(a.trackedJob!==null&&(!jobs.has(a.trackedJob)||jobStep(s,a.trackedJob)===3))throw Error('Repère de détour invalide.');
 if(!record(a.aim)||!finite(a.aim.x)||!finite(a.aim.z)||Math.abs(Math.hypot(a.aim.x,a.aim.z)-1)>.001||typeof a.aiming!=='boolean')throw Error('Direction de visée invalide.');
 if(Object.keys(a.encounters).length>D.encounters.length)throw Error('Trop de rencontres.');
 for(const [id,v] of Object.entries(a.encounters))if(!D.encounters.some(e=>e.id===id)||!record(v)||!['warning','done'].includes(v.stage)||!finite(v.remaining)||v.remaining<0||v.remaining>10)throw Error('Rencontre invalide.');
 for(const [rid,w] of Object.entries(s.world))for(const e of w.enemies){const m=enemyMemory(e),r=D.rooms.find(r=>r.id===rid);if(!record(m)||!finite(m.x)||m.x<0||m.x>r.width||!finite(m.z)||m.z<0||m.z>1||!finite(m.ttl)||m.ttl<0||m.ttl>12)throw Error('Mémoire de créature invalide.');}
 for(const j of D.jobs){if(jobStep(s,j.id)===3){s.flags[j.flag]=true;if(!s.archives.includes(j.archive))s.archives.push(j.archive);}else if(s.flags[j.flag])throw Error('Raccourci incohérent avec son déverrouillage.');}
 return s;
}
function advance(sim,o){
 const s=sim.s;if(!available(s,o)||s.status!=='playing'||s.room!==o.room||!sim.near(s.player,o,110))return false;
 const j=jobs.get(o.job),next=o.step+1;s.exploration.jobs[j.id]=next;
 if(next<3){s.exploration.trackedJob=j.id;sim.notify(next===1?o.description:j.item+' emporté. Retournez dans '+sim.roomName(j.room)+'.');}
 else {s.flags[j.flag]=true;s.archives.push(j.archive);if(s.exploration.trackedJob===j.id)s.exploration.trackedJob=null;
  if(j.reward==='medkit')s.player.medkits+=1;else if(j.reward==='flare')s.player.flares+=2;else if(j.reward==='battery')s.systems.battery=100;else if(j.reward==='food')s.player.hp=Math.min(100,s.player.hp+25);
  sim.notify('Passage de service libéré · '+j.rewardLabel);sim.emit('shortcut',{id:j.id});}
 sim.emit('sideTask',{id:j.id,step:next});sim.emit('save');return true;
}
const API={initial,jobStep,eligible,available,tracked,enemyMemory,validateAndUpgrade,advance,jobs};root.ROP_EXPLORATION=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
