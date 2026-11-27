/* Fidelity audit helpers. Abstract game parameters, never real-world weapon data. */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const FALLBACK={id:'f90',name:'Fusil bullpup · F90',capacity:10,delay:.22,reload:1.25,damage:34,range:900,unlockAction:'landing-a1'};
function definitions(data){return data.arsenal?.weapons||[FALLBACK];}
function current(engine,state=engine.state){return definitions(engine.data).find(w=>w.id===state.arsenal?.selected)||definitions(engine.data)[0]||FALLBACK;}
function fresh(data){return {version:1,selected:'f90',owned:[],clips:Object.fromEntries(definitions(data).map(w=>[w.id,0]))};}
function sanitize(data,incoming,state){const a=fresh(data),defs=definitions(data);a.owned=defs.filter(w=>state.actions.includes(w.unlockAction)).map(w=>w.id);a.selected=a.owned.includes(incoming?.selected)?incoming.selected:a.owned[0]||'f90';for(const w of defs)a.clips[w.id]=a.owned.includes(w.id)?Math.floor(clamp(incoming?.clips?.[w.id],0,w.capacity)):0;return a;}
function grant(engine,id){const w=definitions(engine.data).find(w=>w.id===id);if(!w)return false;const a=engine.state.arsenal||(engine.state.arsenal=fresh(engine.data));if(a.owned.includes(id))return false;a.owned.push(id);if(id==='f90')a.clips.f90=engine.state.ammo;engine.state.weapon=true;engine.unlock('equipment-'+id);engine.emit('equipment',w.name+' disponible. Y : changer d’arme.');return true;}
function switchWeapon(engine,id=null){const s=engine.state;if(!s.weapon||engine.paused||engine.dead||engine.busy||s.hidden||engine.grip||engine.detector||engine.room.crawl||engine.room.safePresentation||engine.networkSession||engine.reloadTime>0||engine.healing||engine.work||engine.scanning||engine.isolating||engine.rotating)return false;const a=s.arsenal||(s.arsenal=fresh(engine.data));if(!a.owned.includes('f90')&&s.weapon)a.owned.unshift('f90');const next=id||a.owned[(a.owned.indexOf(a.selected)+1)%a.owned.length];if(!a.owned.includes(next)||next===a.selected)return false;a.clips[a.selected]=Math.floor(clamp(s.ammo,0,current(engine).capacity));a.selected=next;s.ammo=a.clips[next]||0;engine.cooldown=Math.max(engine.cooldown,.25);engine.clearAim();engine.emit('equipment',current(engine).name+' · '+s.ammo+' cartouches chargées.');return true;}
function appearance(engine,actor,role='daniels'){
 const def=actor?.id&&engine.actorDefs.get(actor.id);let key=def?.appearance||role;
 if(role==='daniels'&&!def){key=engine.room.protagonist||(['cryo','service','cabin','funeralairlock','evaprep','bridge','comms'].includes(engine.room.id)?'daniels-work':'daniels');if(['sailaccess','lifter','cargo'].includes(engine.room.id))key='daniels-eva';}
 // The disguise is NOT replaced by a cloak when the identity is revealed.
 if(def?.id==='synthetic-return')key='walter-injured';
 const p=engine.data.appearances?.[key]||engine.data.appearances?.daniels||{coat:'#71848a',hair:'#292c2a',skin:'#c7ac92',pants:'#60654d',head:'crop'};
 return {...p,id:key};
}
function counts(data){const e=data.fidelity?.entries||[];return {total:e.length,cinema:e.filter(x=>x.scope==='Film cinéma').length,mapped:e.filter(x=>x.mappings.length).length,uncovered:e.filter(x=>x.implementation==='non couvert').length,rooms:data.rooms.filter(r=>!r.tableau).length,tableaux:data.rooms.filter(r=>r.tableau).length,thresholds:data.rooms.reduce((n,r)=>n+r.exits.length,0)};}
const api={definitions,current,fresh,sanitize,grant,switchWeapon,appearance,counts};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CovenantFidelity=api;
})(globalThis);
