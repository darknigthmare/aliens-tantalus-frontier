import {RETAINED} from './retained-v07.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IsolationEngine,ROOMS,doors,available,walkable,safePosition,distance,pathTo} from '../src/engine.js';
import {CONTENT} from '../src/content.js';
const tick=(e,n,input={})=>{for(let i=0;i<n*20;i++)e.step(.05,input);};
function scene(room='m_corridor',x=500,y=300){const e=new IsolationEngine('survie');e.s.room=room;e.s.x=x;e.s.y=y;e.s.chapter=4;e.s.flags.hunt=true;e.s.flags.morley=true;e.s.alien={...e.s.alien,active:true,room,x:800,y:300,face:1,mode:'patrol',timer:5};return e;}

test('0.2 : six locaux, douze connexions, huit tâches, dix tableaux',()=>{
 assert.equal(RETAINED.revision.newRooms.length,6);assert.equal(RETAINED.revision.newLinks.length,12);assert.equal(RETAINED.optional.filter(x=>!x.addedV03&&!x.addedV04&&!x.addedV05&&!x.addedV06).length,8);assert.equal(RETAINED.rooms.filter(r=>!r.addedV03&&!r.addedV04&&!r.addedV05&&!r.addedV06).flatMap(r=>r.props).filter(p=>p.interactive==='rewire').length,10);assert.equal(RETAINED.logs.filter(x=>!x.addedV03&&!x.addedV04&&!x.addedV05&&!x.addedV06).length,30);assert.equal(RETAINED.rules.filter(x=>!x.startsWith('SIG07/')).filter(x=>!x.startsWith('[0.3]')&&!x.startsWith('[0.4]')&&!x.startsWith('[0.5]')&&!x.startsWith('[0.6]')).length,80);
});
test('Les douze liaisons ajoutées sont réciproques et leurs seuils restent accessibles',()=>{
 for(const id of CONTENT.revision.newLinks){const link=CONTENT.links.find(e=>e.id===id);for(const room of [link.a,link.b]){const d=doors(room).find(e=>e.id===id);assert(d);assert(walkable(room,d.point.x,d.point.y));}}
});
test('Tout changement de niveau utilise un connecteur vertical ou un transfert nommé',()=>{
 for(const l of CONTENT.links.filter(l=>l.addedV02))if(ROOMS[l.a].deck!==ROOMS[l.b].deck)assert(['stairs','lift','transfer','tram','shuttle'].includes(l.kind),l.id);
});
test('Les six nouvelles pièces ont deux accès au minimum et un chemin entre eux',()=>{
 for(const id of CONTENT.revision.newRooms){const ds=doors(id);assert(ds.length>=2);for(const d of ds.slice(1))assert(pathTo(id,ds[0].point,d.point).length>0,id);}
});
test('Les trois nouvelles pièces de service ne contournent pas Morley, Samuels ou les relais',()=>{
 const e=scene();e.s.flags.morley=false;assert(!available(CONTENT.links.find(l=>l.id==='m_sterile__m_pharmacy'),e.s));assert(CONTENT.links.find(l=>l.id==='a_service__a_labo'));assert(!CONTENT.links.some(l=>l.a==='a_service'&&l.b==='a_core'));assert(CONTENT.goals.find(g=>g.flag==='purge'));
});
test('Tâches facultatives : points d’approche physiques, aucun rôle d’objectif principal',()=>{
 for(const t of CONTENT.optional){assert(walkable(t.room,t.x,t.y),t.id);assert(!CONTENT.goals.some(g=>g.id===t.id));const r=ROOMS[t.room];assert(r.props.some(p=>p.interactive===t.id));}
});
test('Tous les interactifs possèdent au moins un point d’approche libre dans les 87 unités',()=>{
 for(const r of CONTENT.rooms)for(const p of r.props.filter(p=>['hide','save','loot','rewire'].includes(p.interactive))){let found=false;for(let dx=-70;dx<=70;dx+=14)for(let dy=-70;dy<=70;dy+=14)if(Math.hypot(dx,dy)<85&&walkable(r.id,p.x+dx,p.y+dy))found=true;assert(found,p.id);}
});
test('Pas accroupi : aucune audition à 500 unités dans la même pièce',()=>{
 const e=scene();e.s.alien.x=1000;e.emitNoise(500,300,.05);assert.equal(e.s.alien.memory,null);
});
test('Pas accroupi : perception possible à très courte distance',()=>{
 const e=scene();e.s.alien.x=550;e.emitNoise(500,300,.05);assert.equal(e.s.alien.memory.x,500);
});
test('Pas accroupi : pas de détection automatique dans une pièce voisine',()=>{
 const e=scene();e.s.alien.room='m_morley';e.emitNoise(1900,300,.05,'m_corridor');assert.equal(e.s.alien.memory,null);
});
test('Un bruit fort se transmet à travers un seuil proche',()=>{
 const e=scene();const d=doors('m_corridor').find(l=>l.destination==='m_morley');e.s.alien.x=d.point.x-40;e.emitNoise(d.arrival.x+20,300,1.8,'m_morley');assert(e.s.alien.memory);assert.equal(e.s.alien.memory.room,'m_morley');
});
test('Un verrou atténue davantage le bruit entre deux locaux',()=>{
 const e=scene(),d=doors('m_corridor').find(l=>l.destination==='m_morley');e.s.alien.x=d.point.x-20;const p={x:d.arrival.x+20,y:300};assert(e.heardAt(e.s.alien,p,1.1,'m_morley'));e.s.seals[d.id]=18;assert(!e.heardAt(e.s.alien,p,1.1,'m_morley'));
});
test('Un petit pas ne remplace pas une diversion forte encore récente',()=>{
 const e=scene();e.s.alien.x=800;e.emitNoise(700,300,1.6);e.emitNoise(780,300,.05);assert.equal(e.s.alien.memory.x,700);
});
test('Vue directionnelle : avant visible, arrière lointain non visible',()=>{
 const e=scene();const a={room:'m_corridor',x:700,y:300,face:1};assert(e.sees(a,{x:820,y:300},340));assert(!e.sees(a,{x:550,y:300},340));
});
test('Perception rapprochée : le dos ne rend pas invisible à 40 unités',()=>{
 const e=scene();assert(e.sees({room:'m_corridor',x:700,y:300,face:1},{x:660,y:300},340));
});
test('La suspicion prend du temps et une vision confirmée déclenche une poursuite',()=>{
 const e=scene('m_corridor',720);e.s.alien.x=600;e.s.alien.destination={room:'m_corridor',x:900,y:300};e.updateAlien(.05,{});assert.notEqual(e.s.alien.mode,'chase');for(let i=0;i<12;i++)e.updateAlien(.05,{});assert.equal(e.s.alien.mode,'chase');assert(e.s.stats.detections>0);
});
test('L’absence de nouvelle perception conserve la dernière position, pas celle du joueur',()=>{
 const e=scene();e.s.alien.x=800;e.emitNoise(650,300,1);e.s.x=80;e.s.y=300;e.updateAlien(.05,{});assert.equal(e.s.alien.memory.x,650);
});
test('Fin de recherche : retrait physique, sans déplacement instantané vers le joueur',()=>{
 const e=scene();e.s.x=80;e.s.alien.groundTime=90;const x=e.s.alien.x;e.updateAlien(.05,{});assert.equal(e.s.alien.mode,'retreat');assert.equal(e.s.alien.x,x);e.updateAlien(.05,{});assert(Math.abs(e.s.alien.x-x)<=16);
});
test('Ventilation : avertissement avant émergence, pas apparition instantanée',()=>{
 const e=scene();e.s.alien.mode='vent';e.s.alien.timer=2;for(let i=0;i<8;i++)e.updateAlien(.05,{});assert.equal(e.s.alien.mode,'vent');assert(e.events.some(x=>x.type==='alien-cue'));for(let i=0;i<40;i++)e.updateAlien(.05,{});assert(e.events.some(x=>x.type==='alien-emergence'));
});
test('La créature ne traverse pas un seuil à distance',()=>{
 const e=scene();e.s.alien.x=400;const d=doors('m_corridor').find(d=>d.destination==='m_morley');e.alienTraverse(d,.05);assert.equal(e.s.alien.room,'m_corridor');assert(e.s.alien.x>400&&e.s.alien.x<410);
});
test('T consomme une pile et maintient exactement la porte locale',()=>{
 const e=scene();const d=doors(e.s.room).find(d=>d.kind==='door');Object.assign(e.s,d.point);const before=e.s.inventory.battery;assert(e.sealNearest());assert.equal(e.s.inventory.battery,before-1);assert(e.sealed(d.id));assert(!e.enter(d));
});
test('Second appui T rouvre le même verrou sans nouvelle consommation',()=>{
 const e=scene(),d=doors(e.s.room)[0];Object.assign(e.s,d.point);e.sealNearest();const n=e.s.inventory.battery;assert(e.sealNearest());assert(!e.sealed(d.id));assert.equal(e.s.inventory.battery,n);
});
test('Le verrou expire sans bloquer une campagne indéfiniment',()=>{
 const e=scene(),d=doors(e.s.room)[0];Object.assign(e.s,d.point);e.sealNearest();e.s.alien.active=false;tick(e,18.1);assert(!e.sealed(d.id));assert(e.enter(d));
});
test('Une porte fermée oblige la créature à forcer pendant 3,4 secondes',()=>{
 const e=scene(),d=doors('m_corridor').find(d=>d.destination==='m_morley');Object.assign(e.s.alien,d.point);e.s.seals[d.id]=18;for(let i=0;i<40;i++)e.alienTraverse(d,.05);assert.equal(e.s.alien.room,'m_corridor');assert(e.sealed(d.id));for(let i=0;i<29;i++)e.alienTraverse(d,.05);assert.equal(e.s.alien.room,'m_morley');assert.equal(e.s.stats.breaches,1);
});
test('Aucune pile : le verrou est refusé sans stock négatif',()=>{
 const e=scene(),d=doors(e.s.room)[0];Object.assign(e.s,d.point);e.s.inventory.battery=0;assert(!e.sealNearest());assert(!e.sealed(d.id));
});
test('Le tableau électrique exige une approche locale',()=>{
 const e=scene('m_staff',120,300),p=ROOMS.m_staff.props.find(p=>p.interactive==='rewire');assert(!e.rewire(p));Object.assign(e.s,p);assert(e.rewire(p));assert.equal(e.s.systems.m_staff.mode,1);
});
test('Cycle électrique : normal, obscurité, diversion, normal',()=>{
 const e=scene('m_staff'),p=ROOMS.m_staff.props.find(p=>p.interactive==='rewire');Object.assign(e.s,p);e.rewire(p);assert.equal(e.s.systems.m_staff.mode,1);e.rewire(p);assert.equal(e.s.systems.m_staff.mode,2);e.rewire(p);assert.equal(e.s.systems.m_staff.mode,0);
});
test('Dérivation : émissions depuis la grille plutôt que la position du joueur',()=>{
 const e=scene('m_staff'),p=ROOMS.m_staff.props.find(p=>p.interactive==='rewire');Object.assign(e.s,p);e.rewire(p);e.rewire(p);e.s.alien.x=ROOMS.m_staff.vents[0].x-50;e.s.alien.y=300;e.updateSystems(.05);assert.equal(e.s.alien.memory.x,ROOMS.m_staff.vents[0].x);assert.notEqual(e.s.alien.memory.x,e.s.x);
});
test('Dérivation limitée à 24 secondes, sans production infinie de ressources',()=>{
 const e=scene('m_staff'),p=ROOMS.m_staff.props.find(p=>p.interactive==='rewire');Object.assign(e.s,p);const before=JSON.stringify(e.s.inventory);e.rewire(p);e.rewire(p);e.s.alien.active=false;tick(e,24.1);assert.equal(e.s.systems.m_staff.mode,0);assert.equal(JSON.stringify(e.s.inventory),before);
});
test('Couper la lumière diminue effectivement la portée de la créature',()=>{
 const a=scene('m_corridor',800),b=scene('m_corridor',800);for(const e of [a,b]){e.s.alien.x=560;e.s.alien.face=1;e.s.alien.destination={room:'m_corridor',x:560,y:300};}b.s.systems.m_corridor={mode:1,until:0};a.updateAlien(.05,{});b.updateAlien(.05,{});assert(a.s.alien.suspicion>b.s.alien.suspicion);
});
test('La lampe annule l’avantage de l’obscurité',()=>{
 const e=scene('m_corridor',800);e.s.alien.x=560;e.s.alien.face=1;e.s.systems.m_corridor={mode:1};e.s.torch=true;e.updateAlien(.05,{});assert(e.s.alien.suspicion>0);
});
test('Tâche facultative : récompense unique, sans avancer la campagne',()=>{
 const t=CONTENT.optional[0],e=scene(t.room,t.x,t.y),oldGoal=e.s.goal,before=e.s.inventory.battery;assert(e.use({...t,type:'optional'}));assert.equal(e.s.goal,oldGoal);assert.equal(e.s.inventory.battery,before+3);assert(!e.use({...t,type:'optional'}));assert.equal(e.s.optional.length,1);
});
test('Une tâche d’une autre pièce ne peut pas être validée',()=>{
 const e=scene(),t=CONTENT.optional[0];e.s.x=t.x;e.s.y=t.y;assert(!e.use({...t,type:'optional'}));assert.equal(e.s.optional.length,0);
});
test('Sauvegarde 0.2 : circuits, verrous, favoris, tâches et mémoire restent cohérents',()=>{
 const e=scene('m_staff'),p=ROOMS.m_staff.props.find(p=>p.interactive==='rewire');Object.assign(e.s,p);e.rewire(p);const d=doors(e.s.room)[0];Object.assign(e.s,d.point);e.sealNearest();e.s.favorites=['m_staff'];e.s.optional=['O03'];const n=new IsolationEngine();assert(n.load(e.serialize()).ok);assert.equal(n.s.systems.m_staff.mode,1);assert(n.sealed(d.id));assert.deepEqual(n.s.favorites,['m_staff']);assert.deepEqual(n.s.optional,['O03']);
});
test('Sauvegarde malveillante : seuls les systèmes connus et les tâches existantes survivent',()=>{
 const e=new IsolationEngine(),v=JSON.parse(e.serialize());v.state.systems={evil:{mode:1},m_staff:{mode:99},m_pharmacy:{mode:2,until:1e20}};v.state.optional=['O01','bad','O01'];v.state.favorites=['m_staff','<script>','m_staff'];v.state.seals={evil:999};assert(e.load(JSON.stringify(v)).ok);assert.equal(e.s.systems.evil,undefined);assert.equal(e.s.systems.m_staff,undefined);assert.equal(e.s.systems.m_pharmacy.until,24);assert.deepEqual(e.s.optional,['O01']);assert.deepEqual(e.s.favorites,['m_staff']);assert.equal(Object.keys(e.s.seals).length,0);
});
test('Les systèmes et les portes ne consomment pas de temps pendant la pause',()=>{
 const e=scene('m_staff');e.s.systems.m_staff={mode:2,until:24,pulse:0};e.s.seals[doors(e.s.room)[0].id]=18;e.paused=true;tick(e,60);assert.equal(e.s.time,0);assert.equal(e.s.systems.m_staff.until,24);assert(e.sealed(doors(e.s.room)[0].id));
});
test('Migration réelle d’une sauvegarde v0.1 : pièce, objectif, inventaire et drapeaux préservés',()=>{
 const raw=readFileSync(new URL('./fixtures/legacy-v01-save.json',import.meta.url),'utf8'),old=JSON.parse(raw).state,e=new IsolationEngine();assert(e.load(raw).ok);assert.equal(e.s.room,old.room);assert.equal(e.s.goal,old.goal);assert.deepEqual(e.s.inventory,old.inventory);for(const [k,v] of Object.entries(old.flags))assert.equal(e.s.flags[k],v);assert.equal(e.s.version,CONTENT.meta.version);assert.deepEqual(e.s.optional,[]);
});
test('Les commandes de posture acceptent un changement explicite dans les deux sens',()=>{
 const e=new IsolationEngine();e.step(.05,{crouch:true});assert(e.s.crouched);e.step(.05,{crouch:false});assert(!e.s.crouched);
});
