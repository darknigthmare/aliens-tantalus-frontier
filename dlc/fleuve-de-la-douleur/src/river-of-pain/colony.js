/* Colony services: deterministic, browser-independent and shared by UI, rendering and tests. */
(function(root){'use strict';
const D=root.ROP_DATA||(typeof require==='function'?require('./data.js'):null);
const finite=n=>typeof n==='number'&&Number.isFinite(n),record=o=>o&&typeof o==='object'&&!Array.isArray(o);
const key=(a,b)=>[a,b].sort().join('|');
function initial(){return {revision:2,loadouts:{},circuits:Object.fromEntries(Object.keys(D.circuits).map(k=>[k,-1])),boards:{},doorIntegrity:{},hiding:null,exposedFor:0,flashlight:false,battery:100,tracker:false,trackerTimer:0,markers:[],failReason:''};}
function validateAndUpgrade(s){
 const legacy=s.systems===undefined;
 if(legacy){s.systems=initial();for(const id of s.collected||[]){const b=D.boards[id];if(b){s.systems.boards[id]={switches:b.channels.map(c=>c[2]),attempts:0,solved:true};s.flags[id]=true;if(b.kind==='power')s.systems.circuits[b.circuit]=s.phase;}}}
 const a=s.systems;if(!record(a)||a.revision!==2)throw Error('Services de colonie incompatibles.');
 a.loadouts??={};if(!record(a.loadouts)||Object.keys(a.loadouts).length>4)throw Error('Dotations invalides.');
 for(const [id,l] of Object.entries(a.loadouts)){if(!Object.hasOwn(D.characters,id)||!record(l))throw Error('Porteur inconnu.');
  for(const k of ['ammo','reserve','medkits','flares'])if(!Number.isInteger(l[k])||l[k]<0||l[k]>(k==='ammo'?30:100000))throw Error('Réserve personnelle invalide.');
  if(!finite(l.hp)||l.hp<0||l.hp>100||!finite(l.battery)||l.battery<0||l.battery>100)throw Error('État personnel invalide.');
  if(!D.characters[id].weapon&&(l.ammo||l.reserve)||D.characters[id].child&&l.flares)throw Error('Matériel interdit pour ce porteur.');
 }
 for(const k of ['circuits','boards','doorIntegrity'])if(!record(a[k]))throw Error('Registre de colonie invalide : '+k);
 if(Object.keys(a.circuits).length!==Object.keys(D.circuits).length||Object.entries(a.circuits).some(([k,v])=>!Object.hasOwn(D.circuits,k)||!Number.isInteger(v)||v< -1||v>3))throw Error('Circuit inconnu ou phase invalide.');
 if(Object.keys(a.boards).length>Object.keys(D.boards).length)throw Error('Nombre de tableaux invalide.');
 for(const [id,b] of Object.entries(a.boards))if(!Object.hasOwn(D.boards,id)||!record(b)||!Array.isArray(b.switches)||b.switches.length!==D.boards[id].channels.length||b.switches.some(v=>typeof v!=='boolean')||!Number.isInteger(b.attempts)||b.attempts<0||b.attempts>1e7||typeof b.solved!=='boolean')throw Error('Tableau électrique invalide.');
 const pairs=new Set(D.rooms.flatMap(r=>r.portals.map(p=>key(r.id,p.to))));
 if(Object.entries(a.doorIntegrity).some(([k,v])=>!pairs.has(k)||!finite(v)||v<0||v>100))throw Error('Intégrité de cloison invalide.');
 const hide=D.rooms.find(r=>r.id===s.room)?.objects.find(o=>o.id===a.hiding&&o.kind==='hide');
 if(a.hiding!==null&&(!hide||Math.abs(hide.x-s.player.x)>120||(s.mode!=='classic'&&Math.abs(hide.z-s.player.z)>.16)))throw Error('Cachette invalide.');
 if(!finite(a.exposedFor)||a.exposedFor<0||a.exposedFor>20||!finite(a.battery)||a.battery<0||a.battery>100||!finite(a.trackerTimer)||a.trackerTimer<0||a.trackerTimer>5||typeof a.flashlight!=='boolean'||typeof a.tracker!=='boolean')throw Error('Équipement de survie invalide.');
 if(!Array.isArray(a.markers)||a.markers.length>12||a.markers.some(m=>!record(m)||!D.rooms.some(r=>r.id===m.room&&finite(m.x)&&m.x>=38&&m.x<=r.width-38&&finite(m.z)&&m.z>=r.minZ&&m.z<=r.maxZ)))throw Error('Repère de repli invalide.');
 if(typeof a.failReason!=='string'||a.failReason.length>180)throw Error('Motif de rupture invalide.');
 if(!D.characters[s.character].weapon)a.tracker=false;
 if(a.hiding)a.flashlight=false;
 if(s.escort){const e=s.escort;e.hp??=100;e.panic??=0;e.order??='follow';e.hurt??=0;
  if(!finite(e.hp)||e.hp<0||e.hp>100||!finite(e.panic)||e.panic<0||e.panic>100||!['follow','wait'].includes(e.order)||!finite(e.hurt)||e.hurt<0||e.hurt>5)throw Error('Compagnon invalide.');}
 s.version=D.manifest.version;return s;
}
function isPowered(s,r){const c=r.architecture.circuit;return s.phase<D.circuits[c].minPhase||s.systems.circuits[c]>=s.phase;}
function boardState(s,id){const b=D.boards[id];if(!b) return null;return s.systems.boards[id]??(s.systems.boards[id]={switches:[...b.initial],attempts:0,solved:false});}
function boardReading(s,id){const b=D.boards[id],v=boardState(s,id);if(!b)return null;const load=b.channels.reduce((n,c,i)=>n+(v.switches[i]?c[1]:0),0);return {load,capacity:b.capacity,overload:load>b.capacity,correct:b.channels.every((c,i)=>c[2]===v.switches[i])&&load<=b.capacity,...v};}
function activeHazards(s){return D.hazards.filter(h=>h.room===s.room&&!s.flags[h.disableFlag]).map(h=>({...h,cycle:s.elapsed%h.period,active:s.elapsed%h.period<h.activeFor}));}
const API={initial,validateAndUpgrade,isPowered,boardState,boardReading,activeHazards,key};root.ROP_COLONY=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
