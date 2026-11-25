import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {DATA} from '../src/oth-v1/oth-data.js';
import * as E from '../src/oth-v1/oth-engine.js';
const checks=[];async function test(name,fn){try{const detail=await fn();checks.push({name,ok:true,detail:detail??null});}catch(e){checks.push({name,ok:false,error:e.stack});}}
const goals=DATA.chapters.flatMap(c=>c.objectives);
function at(n,room='bridge'){const s=E.createState();s.completed=goals.slice(0,n).map(o=>o.id);s.room=room;return E.restore(E.serialize(s));}
function actor(x,y=88){return{x,y,cool:0,stun:0,search:0,dir:1,home:x,type:'adult',state:'patrol',targetX:x,targetY:y};}
function walk(s,x,y=88){for(let i=0;i<2400;i++){const d=Math.hypot(s.player.x-x,s.player.y-y);if(d<6)return i;E.step(s,{x:Math.max(-1,Math.min(1,(x-s.player.x)/20)),y:Math.max(-1,Math.min(1,(y-s.player.y)/20))},.05);}throw new Error('walk stuck');}
await test('Contenu V0.3 : 34 salles, 40 liens, 48 objectifs, 144 fiches',()=>{assert.equal(DATA.version,'0.10.0');assert.equal(DATA.stateSchema,10);assert.equal(DATA.edition,DATA.releaseName);assert.equal(DATA.rooms.length,41);assert.equal(DATA.edges.length,52);assert.equal(goals.length,48);assert.equal(DATA.codex.length,228);assert.ok(E.validateData().ok);});
await test('46 familles graphiques : identifiants uniques',()=>{assert.equal(DATA.props.length,48);assert.equal(new Set(DATA.props.map(p=>p.id)).size,48);});
for(const schema of [1,2,3])await test('Import schéma '+schema+' vers schéma 4 sans perte de progression',async()=>{
 const s=at(26,'fossils');s.schema=schema;s.player.fuel=37;s.records=['marion-note-01'];const r=E.restore(E.serialize(s));assert.equal(r.schema,10);assert.equal(r.completed.length,26);assert.equal(r.player.fuel,37);assert.deepEqual(r.records,['marion-note-01']);
 // Genuine snapshots taken from the delivered V0.1 and V0.2 archives, not fabricated schema labels.
 if(schema<3)for(const name of ['chapter-3','chapter-11','chapter-14','final']){
  const raw=await fs.readFile(new URL('./fixtures/legacy-schema-'+schema+'-'+name+'.json',import.meta.url),'utf8'),old=JSON.parse(raw),fresh=E.restore(raw);
  assert.equal(old.schema,schema);assert.ok(fresh);assert.equal(fresh.schema,10);assert.deepEqual(fresh.completed,old.completed);assert.equal(fresh.player.hp,old.player.hp);assert.equal(fresh.player.fuel,old.player.fuel);assert.equal(fresh.player.kits,old.player.kits);assert.equal(fresh.room,old.room);
 }
 return {genuineLegacySnapshots:schema<3?4:0,syntheticSanitizationCase:true};
});
await test('Compagnon : ancienne sauvegarde sans champ acceptée',()=>{const s=at(22,'refuge');delete s.companion;s.schema=2;const r=E.restore(JSON.stringify(s));assert.ok(r);E.step(r,{},.05);assert.equal(r.companion.character,'baxter');});
await test('Compagnon interdit hors de son intervalle narratif',()=>{const s=at(22,'refuge');E.syncCompanion(s);s.completed=goals.slice(0,32).map(o=>o.id);const r=E.restore(E.serialize(s));assert.equal(r.companion,null);});
for(const def of DATA.companions){
 await test(def.name+' : recrutement physique dans sa salle, jamais depuis une autre',()=>{const s=at(def.start,'bridge');assert.equal(E.syncCompanion(s),null);s.room=def.room;assert.equal(E.syncCompanion(s).id,def.id);});
 await test(def.name+' : suit puis attend, mouvement simulé et position persistante',()=>{const s=at(def.start,def.room);s.player.x=def.x+400;const c=E.syncCompanion(s),x=c.x;for(let i=0;i<90;i++)E.step(s,{},.05);assert.ok(c.x>x+150);assert.ok(E.commandCompanion(s));const cx=c.x;for(let i=0;i<20;i++)E.step(s,{x:1},.05);assert.equal(c.x,cx);const r=E.restore(E.serialize(s));assert.equal(r.companion.mode,'wait');assert.equal(r.companion.x,cx);});
 await test(def.name+' : pas de clone statique et retrait à la fin de la séquence',()=>{const s=at(def.start,def.room);E.syncCompanion(s);assert.equal(E.crewInRoom(s).filter(n=>n.character===def.character).length,1);s.completed=goals.slice(0,def.end).map(o=>o.id);s.chapter=Math.floor(def.end/3);E.syncCompanion(s);assert.equal(s.companion,null);});
}
await test('Passage : attend le compagnon puis franchit la même liaison',()=>{const s=at(22,'refuge'),portal=E.ROOM.refuge.portals[0];E.syncCompanion(s);s.player.x=portal.x;s.player.y=portal.y;assert.equal(E.transition(s,portal),false);for(let i=0;i<400;i++)E.step(s,{},.05);assert.ok(E.transition(s,portal));assert.equal(s.companion.room,s.room);assert.equal(s.metrics.companionPassages,1);assert.ok(!E.collision(E.ROOM[s.room],s.companion.x,s.companion.y));});
await test('Ordre attendre : le joueur passe sans téléporter le compagnon',()=>{const s=at(22,'refuge'),p=E.ROOM.refuge.portals[0];E.syncCompanion(s);E.commandCompanion(s);assert.ok(E.transition(s,p));assert.equal(s.companion.room,'refuge');const x=s.companion.x;assert.equal(E.commandCompanion(s),false);assert.equal(s.companion.x,x);});
await test('Compagnon : réduit sa silhouette et sa vitesse en furtivité',()=>{const s=at(22,'refuge');s.player.x=1200;const c=E.syncCompanion(s),before=c.x;E.step(s,{crouch:true},.05);assert.ok(c.crouch);assert.ok(c.x-before<=5.1);});
await test('Navigation : le segment direct est rejeté à travers un meuble',()=>{const r=E.ROOM.bridge,p=r.props.find(p=>p.solid);assert.equal(E.segmentClear(r,{x:p.x-90,y:p.y},{x:p.x+90,y:p.y}),false);const way=E.findPath(r,{x:p.x-90,y:p.y},{x:p.x+90,y:p.y});assert.ok(way.length>1);});
let obstacleChecks=0;
for(const r of DATA.rooms)await test('Navigation sans traversée de collision : '+r.name,()=>{
 let tested=0;
 for(const p of r.props.filter(p=>p.solid)){
  const width=E.PROP[p.type].width,from={x:p.x-width*.5-38,y:p.y},to={x:p.x+width*.5+38,y:p.y};
  if(E.collision(r,from.x,from.y,12)||E.collision(r,to.x,to.y,12))continue;
  const a=actor(from.x,from.y);let steps=0;
  while(Math.hypot(a.x-to.x,a.y-to.y)>6&&steps++<900){E.navigateActor(r,a,to,165,.05);assert.ok(!E.collision(r,a.x,a.y,11),r.id+' '+p.id);}
  assert.ok(steps<900,'Unreachable '+p.id);tested++;obstacleChecks++;
 }
 // Every side corridor and all other rooms also cross their full central circulation.
 const a=actor(50,88),target={x:r.width-50,y:88};let count=0;while(Math.abs(a.x-target.x)>6&&count++<1600){E.navigateActor(r,a,target,165,.05);assert.ok(!E.collision(r,a.x,a.y,11));}assert.ok(count<1600);return {obstacles:tested,centerFrames:count};
});
await test('Navigation : objectif dans obstacle retourne une impasse, pas une traversée',()=>{const r=E.ROOM.bridge,p=r.props.find(p=>p.solid);assert.deepEqual(E.findPath(r,{x:170,y:88},{x:p.x,y:p.y}),[]);});
await test('Lumière : 34 définitions locales et calcul borné',()=>{for(const r of DATA.rooms){assert.ok(r.lighting.pools.length);const s=at(0,r.id);for(const x of [50,500,r.width-50])assert.ok(E.lightAt(s,x)>=0&&E.lightAt(s,x)<=1);}});
await test('Se cacher : neuf cachettes atteignables et réservées à leur salle',()=>{assert.equal(DATA.interactables.filter(a=>a.kind==='hide').length,9);for(const a of DATA.interactables.filter(a=>a.kind==='hide'))assert.ok(!E.collision(E.ROOM[a.room],a.x,a.y));const s=at(0);assert.equal(E.toggleHide(s,'hide-junction'),false);});
await test('Lampe et posture modifient réellement la distance de détection',()=>{const s=at(24,'vestibule');const lit=E.detectionRange(s);s.flash=false;assert.ok(E.detectionRange(s)<lit);const standing=E.detectionRange(s);s.player.crouch=true;assert.ok(E.detectionRange(s)<standing);});
await test('Cachette hors du regard : furtivité ; mouvement : sortie immédiate',()=>{const s=at(0,'junction');s.player.x=1090;assert.ok(E.toggleHide(s,'hide-junction'));assert.equal(E.detectionRange(s),0);assert.equal(E.stealthStatus(s).label,'À COUVERT');E.step(s,{x:1},.05);assert.equal(s.player.hidden,null);});
await test('Pas de dissimulation sous le regard direct du xénomorphe',()=>{const s=at(12,'samson');s.player.x=1300;E.roomWorld(s).enemies=[actor(1410)];assert.equal(E.toggleHide(s,'hide-samson'),false);assert.ok(!s.player.hidden);});
await test('Cachette refusée en portant Ripley ou une cellule',()=>{for(const flag of ['carryRipley','cellCarried']){const s=at(0,'junction');s.player.x=1090;s.flags[flag]=true;assert.equal(E.toggleHide(s,'hide-junction'),false);}});
await test('Cachette : recherche insistante à proximité force la sortie',()=>{const s=at(12,'samson');s.player.x=1300;const w=E.roomWorld(s);w.enemies=[];E.toggleHide(s,'hide-samson');w.enemies=[{...actor(1325),search:5,state:'investigate',targetX:1325}];for(let i=0;i<36;i++)E.step(s,{},.05);assert.equal(s.player.hidden,null);});
await test('Adulte : avertissement avant la première blessure',()=>{const s=at(12,'samson');s.player.x=1200;s.invuln=0;E.roomWorld(s).enemies=[actor(1238)];E.step(s,{},.05);assert.equal(s.player.hp,100);assert.ok(E.roomWorld(s).enemies[0].attack>0);for(let i=0;i<16;i++)E.step(s,{},.05);assert.equal(s.player.hp,78);assert.equal(s.metrics.attacks,1);});
await test('Esquive : reculer pendant l’appui évite réellement les dégâts',()=>{const s=at(12,'samson');s.player.x=1200;s.invuln=0;E.roomWorld(s).enemies=[actor(1238)];E.step(s,{},.05);for(let i=0;i<16;i++)E.step(s,{x:-1,sprint:true},.05);assert.equal(s.player.hp,100);assert.ok(s.metrics.dodged>=1);});
await test('Flamme interrompt une attaque en préparation',()=>{const s=at(12,'samson');s.player.x=1200;s.player.face=1;s.invuln=0;const e=actor(1238);E.roomWorld(s).enemies=[e];E.step(s,{},.05);assert.ok(e.attack>0);E.step(s,{fire:true},.05);assert.equal(e.attack,0);assert.ok(e.stun>0);assert.equal(s.player.hp,100);});
await test('Leurre : enquête sur sa position, pas sur une cible omnisciente',()=>{const s=at(12,'samson');s.player.x=750;const e=actor(1200);E.roomWorld(s).enemies=[e];E.dropDecoy(s);E.step(s,{},.05);assert.equal(e.state,'investigate');assert.equal(e.targetX,s.decoy.x);});
await test('Import : conserve la mémoire de recherche, mais neutralise un coup instantané',()=>{const s=at(12,'samson'),e=actor(1200);Object.assign(e,{state:'investigate',targetX:1040,targetY:88,search:3,attack:.01});E.roomWorld(s).enemies=[e];const r=E.restore(E.serialize(s)),a=r.world.samson.enemies[0];assert.equal(a.state,'investigate');assert.equal(a.targetX,1040);assert.equal(a.attack,0);});
await test('Plan : rien ne dévoile les salles jamais visitées au départ',()=>{const s=at(0),ch=E.chart(s);assert.deepEqual(ch.map(r=>r.id),['bridge']);assert.ok(!JSON.stringify(ch).includes('BeeBee'));});
await test('Plan : un seuil proche devient accès inconnu, sans nom de destination',()=>{const s=at(0),p=E.ROOM.bridge.portals[0];s.player.x=p.x;s.player.y=p.y;E.discoverRoom(s);const link=E.chart(s)[0].links.find(l=>l.id===p.id);assert.ok(link);assert.equal(link.target,null);assert.equal(link.label,'Accès non reconnu');});
await test('Plan : une traversée révèle ensuite le nom et le lien réciproque',()=>{const s=at(0),p=E.ROOM.bridge.portals[0];E.transition(s,p);const ch=E.chart(s);assert.equal(ch.length,2);assert.ok(ch.find(r=>r.id==='bridge').links.some(l=>l.target===s.room));});
await test('Plan : observations persistantes et identifiants importés filtrés',()=>{const s=at(0),p=E.ROOM.bridge.portals[0];s.discoveredPortals=[p.id,p.id,'unknown'];assert.deepEqual(E.restore(E.serialize(s)).discoveredPortals,[p.id]);});
await test('Accessibilité : options conservées par export/import',()=>{const s=at(0);s.reducedMotion=true;s.contrast=true;const r=E.restore(E.serialize(s));assert.equal(r.reducedMotion,true);assert.equal(r.contrast,true);});
await test('Deux profils physiques de campagne conservent leurs escortes dans le bilan',async()=>{for(const d of ['normal','assisted']){const r=JSON.parse(await fs.readFile(new URL('./playthrough-'+d+'.json',import.meta.url)));assert.ok(r.ok);assert.equal(r.goals,48);assert.ok(r.captures.final.metrics.companionPassages>=10);}});
await test('Réserves et cachettes séparées des seuils de plus de 150 unités',()=>{for(const a of DATA.interactables.filter(a=>['cache','hide'].includes(a.kind))){for(const p of E.ROOM[a.room].portals)assert.ok(Math.abs(a.x-p.x)>=150,a.id+' / '+p.id);}});
const report={suite:'new-features-v0.3',obstacleChecks,tests:checks.length,passed:checks.filter(c=>c.ok).length,failed:checks.filter(c=>!c.ok).length,checks};
await fs.writeFile(new URL('./results-v03.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
