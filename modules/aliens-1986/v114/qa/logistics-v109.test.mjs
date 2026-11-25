import test from 'node:test';import assert from 'node:assert/strict';
import * as O from '../src/operation-v109.mjs';import * as Old from '../src/operation-v108.mjs';import * as S from '../src/spatial-core-v108.mjs';import * as T from '../src/contact-v109.mjs';import * as R from '../src/logistics-v109.mjs';import {ROOMS,LINKS,exitsFor,STOCKS,OPERATION_ROOMS} from '../src/operation-scenes-v109.mjs';
const run=(s,t,{ai=false}={})=>{for(let i=0;i<Math.ceil(t/.025);i++)O.advance(s,.025,{ai});};
function setup(room='v109-reserve'){const s=O.createSession({mode:'inspection',roomId:room});for(const d of O.currentWorld(s).scene.doors)if(!d.critical)S.setDoor(O.currentWorld(s),d.id,true,{force:true});return s;}
function at(s,x,z){Object.assign(O.player(s),{x,z});}
function collect(s,id){const d=STOCKS.find(x=>x.id===id);assert.equal(s.roomId,d.roomId);at(s,d.x-60,d.z);const r=R.begin(s,'stock',null,id);assert.ok(r.ok,r.reason);run(s,1.1);return s;}
function ammoState(){return collect(setup('v109-logistics'),'log-ammo');}
function medState(){return collect(setup(),'reserve-medical');}
function serialize(s){return O.exportSession(s);}
for(const scene of ROOMS)test(`V109 géométrie et inspection ${scene.id}`,()=>{assert.deepEqual(S.validateScene(scene),[]);const s=O.createSession({mode:'inspection',roomId:scene.id});assert.ok(O.importSession(serialize(s)).ok);});
for(const link of LINKS)test(`V109 liaison réciproque ${link.id}`,()=>{for(const e of [link.a,link.b]){const r=exitsFor(e.room).find(x=>x.linkId===link.id);assert.ok(r);assert.equal(r.to.room,e===link.a?link.b.room:link.a.room);const w=S.createWorld(ROOMS.find(x=>x.id===e.room));for(const radius of [11,15,19]){assert.ok(S.canStand(w,e,radius),link.id+' seuil');assert.ok(S.canStand(w,e.arrival,radius),link.id+' arrivée');}}});
test('V109 huit lieux dont sept opérationnels, deux nouveaux ennemis seulement',()=>{assert.equal(ROOMS.length,8);assert.equal(OPERATION_ROOMS.length,7);assert.equal(LINKS.length,8);assert.equal(Object.values(T.catalogue).filter(a=>a.kind==='enemy').length,11);});
test('V109 stocks absents à insertion',()=>{assert.deepEqual(O.createSession().logistics.inventory,{ammo:0,medical:0,sentry:0});});
test('V109 caisse ne donne rien avant fin',()=>{const s=setup('v109-logistics');at(s,1130,221);assert.ok(R.begin(s,'stock',null,'log-ammo').ok);run(s,.5);assert.equal(s.logistics.inventory.ammo,0);assert.equal(s.logistics.collected.length,0);});
test('V109 collecte finie et aucune duplication',()=>{const s=ammoState();assert.equal(s.logistics.inventory.ammo,3);assert.equal(s.logistics.collected.length,1);assert.equal(R.begin(s,'stock',null,'log-ammo').ok,false);run(s,2);assert.equal(s.logistics.inventory.ammo,3);});
test('V109 collecte inaccessible depuis mauvaise pièce',()=>assert.equal(R.begin(O.createSession(),'stock',null,'log-ammo').ok,false));
test('V109 une cloison ferme la portée de collecte',()=>{const s=setup('v109-logistics');at(s,200,195);assert.equal(R.begin(s,'stock',null,'log-ammo').ok,false);});
test('V109 mouvement annule stock sans ressource',()=>{const s=setup('v109-logistics');at(s,1130,221);R.begin(s,'stock',null,'log-ammo');O.movePlayer(s,-5,0);run(s,2);assert.equal(s.logistics.inventory.ammo,0);assert.equal(s.logistics.metrics.interrupted,1);});
test('V109 pause suspend stock',()=>{const s=setup('v109-logistics');at(s,1130,221);R.begin(s,'stock',null,'log-ammo');run(s,.3);const e=s.action.elapsed;O.pause(s,true);run(s,5);assert.equal(s.action.elapsed,e);O.pause(s,false);run(s,1);assert.equal(s.logistics.inventory.ammo,3);});
test('V109 tir annule collecte',()=>{const s=setup('v109-logistics');at(s,1130,221);R.begin(s,'stock',null,'log-ammo');O.fire(s,{x:1400,z:221});assert.equal(s.action,null);assert.equal(s.logistics.inventory.ammo,0);});
test('V109 impact annule caisse',()=>{const s=setup('v109-logistics');at(s,1130,221);R.begin(s,'stock',null,'log-ammo');O.player(s).hp-=14;run(s,.1);assert.equal(s.action,null);assert.equal(s.logistics.collected.length,0);});
test('V109 18 cartouches exactes et un lot consommé',()=>{const s=ammoState(),p=O.player(s),before=p.ammo;assert.ok(O.fieldAction(s,'ammo','ripley').ok);run(s,.9);assert.equal(p.ammo,before+18);assert.equal(s.logistics.inventory.ammo,2);assert.equal(s.logistics.spent.ammo,1);});
test('V109 plafond de charge 96, pas de débordement',()=>{const s=ammoState();O.player(s).ammo=90;O.fieldAction(s,'ammo','ripley');run(s,1);assert.equal(O.player(s).ammo,96);assert.equal(O.fieldAction(s,'ammo','ripley').ok,false);});
test('V109 ammo refuse réserve vide',()=>assert.equal(O.fieldAction(setup(),'ammo','ripley').ok,false));
test('V109 soin exact 30 points',()=>{const s=medState();O.player(s).hp=42;O.fieldAction(s,'medical','ripley');run(s,1.65);assert.equal(O.player(s).hp,72);assert.equal(s.logistics.inventory.medical,1);});
test('V109 soin plafonne à 100',()=>{const s=medState();O.player(s).hp=90;O.fieldAction(s,'medical','ripley');run(s,1.7);assert.equal(O.player(s).hp,100);assert.equal(O.fieldAction(s,'medical','ripley').ok,false);});
test('V109 soin interdit sur mort et sans renaissance',()=>{const s=medState();Object.assign(s.team[1],{roomId:s.roomId,x:850,z:215,hp:0,alive:false,phase:'dead'});assert.equal(O.fieldAction(s,'medical','hicks').ok,false);});
test('V109 Newt soignable, pas armable',()=>{const s=medState();Object.assign(s.team[3],{roomId:s.roomId,x:875,z:222,hp:60,alive:true,recruited:true});O.assemble(s);assert.ok(O.fieldAction(s,'medical','newt').ok);run(s,1.7);assert.equal(s.team[3].hp,90);assert.equal(O.fieldAction(s,'ammo','newt').ok,false);assert.equal(s.team[3].ammo,0);});
test('V109 personnel aidé à portée obligatoire',()=>{const s=medState();s.team[1].hp=50;assert.equal(O.fieldAction(s,'medical','hicks').ok,false);});
test('V109 soin annulé si cible bouge',()=>{const s=medState();Object.assign(s.team[1],{roomId:s.roomId,x:855,z:221,hp:50});O.assemble(s);assert.ok(O.fieldAction(s,'medical','hicks').ok);s.team[1].x-=10;run(s,.05);assert.equal(s.action,null);assert.equal(s.logistics.inventory.medical,2);});
test('V109 soin annulé si cible touchée',()=>{const s=medState();Object.assign(s.team[1],{roomId:s.roomId,x:855,z:221,hp:50});O.assemble(s);O.fieldAction(s,'medical','hicks');s.team[1].hp-=14;run(s,.05);assert.equal(s.logistics.inventory.medical,2);assert.equal(s.action,null);});
test('V109 ordre donné à cible annule soin',()=>{const s=medState();Object.assign(s.team[1],{roomId:s.roomId,x:855,z:221,hp:50});O.assemble(s);O.fieldAction(s,'medical','hicks');O.setOrder(s,'hicks','hold');assert.equal(s.action,null);assert.equal(s.logistics.inventory.medical,2);});
test('V109 deux actions simultanées refusées',()=>{const s=medState();O.player(s).hp=50;assert.ok(O.fieldAction(s,'medical','ripley').ok);assert.equal(O.fieldAction(s,'medical','ripley').ok,false);});
test('V109 aucun coût quand soin interrompu par pause puis marche',()=>{const s=medState();O.player(s).hp=50;O.fieldAction(s,'medical','ripley');run(s,.5);O.pause(s,true);run(s,8);O.pause(s,false);O.movePlayer(s,-10,0);run(s,2);assert.equal(O.player(s).hp,50);assert.equal(s.logistics.inventory.medical,2);});
test('V109 stock de cartouche exact',()=>{const s=collect(setup(),'reserve-sentry');assert.equal(s.logistics.inventory.sentry,1);});
test('V109 sentinelle n’utilise pas lot personnel',()=>{const s=ammoState();s.worlds[s.roomId].actors.push({id:'test-sentry',name:'Sentinelle',role:'sentry',kind:'ally',alive:true,x:1160,z:224,radius:16,hp:100,ammo:10});assert.equal(O.fieldAction(s,'ammo','test-sentry').ok,false);});
test('V109 cartouche ravitaille 40 et pas davantage',()=>{const s=collect(setup(),'reserve-sentry'),p=O.player(s);s.worlds[s.roomId].actors.push({id:'test-sentry',name:'Sentinelle',role:'sentry',kind:'ally',alive:true,x:p.x-36,z:p.z,radius:16,hp:100,ammo:35});assert.ok(O.fieldAction(s,'sentry','test-sentry').ok);run(s,1.4);assert.equal(R.targetFor(s,'test-sentry').ammo,75);assert.equal(s.logistics.inventory.sentry,0);});
test('V109 cartouche refuse réserve déjà pleine',()=>{const s=collect(setup(),'reserve-sentry'),p=O.player(s);s.worlds[s.roomId].actors.push({id:'test-sentry',role:'sentry',kind:'ally',alive:true,x:p.x,z:p.z,radius:16,hp:100,ammo:120});assert.equal(O.fieldAction(s,'sentry','test-sentry').ok,false);assert.equal(s.logistics.inventory.sentry,1);});
test('V109 alarme ne change pas population',()=>{const s=setup();at(s,1154,238);const roster=Object.values(s.worlds).flatMap(w=>w.actors.map(a=>a.id));assert.ok(R.begin(s,'alarm',null,'reserve-alarm').ok);run(s,1);assert.ok(s.logistics.alarms['reserve-alarm'].remaining>0);assert.deepEqual(Object.values(s.worlds).flatMap(w=>w.actors.map(a=>a.id)),roster);});
test('V109 alarme émet un stimulus réel',()=>{const s=setup();at(s,1154,238);R.begin(s,'alarm',null,'reserve-alarm');run(s,1);assert.ok(s.contacts.noises.some(x=>x.kind==='diagnostic'));assert.equal(s.contacts.brains['reserve-stalker'].mode,'investigate');});
test('V109 alarme bloquée par refroidissement',()=>{const s=setup();at(s,1154,238);R.begin(s,'alarm',null,'reserve-alarm');run(s,1);assert.equal(R.begin(s,'alarm',null,'reserve-alarm').ok,false);});
test('V109 alarme et refroidissement suspendus en pause',()=>{const s=setup();at(s,1154,238);R.begin(s,'alarm',null,'reserve-alarm');run(s,1);O.pause(s,true);const before=structuredClone(s.logistics.alarms);run(s,30);assert.deepEqual(s.logistics.alarms,before);});
test('V109 alarme finit à huit secondes, pas de relance automatique',()=>{const s=setup();at(s,1154,238);R.begin(s,'alarm',null,'reserve-alarm');run(s,10);assert.equal(s.logistics.alarms['reserve-alarm'].remaining,0);assert.equal(s.logistics.alarms['reserve-alarm'].activations,1);});
test('V109 sas nord isolé coupe propagation inter-pièces de la sirène',()=>{const s=O.createSession();s.contacts.links['reserve-service'].open=false;s.contacts.links['logistics-reserve'].open=false;T.syncHatches(s);T.emitNoise(s,'v109-reserve',{x:1170,z:238},'diagnostic','test',1750);assert.equal(s.contacts.brains['service-contact'].stimulus,null);assert.equal(s.contacts.brains['logistics-pursuer'].stimulus,null);});
test('V109 salle hors champ reçoit la sirène par le vrai réseau ouvert',()=>{const s=O.createSession();S.setDoor(s.worlds['v107-service'],'maintenance-gate',true,{force:true});T.emitNoise(s,'v109-reserve',{x:1170,z:238},'diagnostic','test',1750);assert.equal(s.contacts.brains['service-contact'].stimulus?.roomId,'v109-reserve');});
test('V109 nouvelle zone n’octroie aucun objectif principal',()=>{const s=O.createSession();assert.equal(s.step,0);assert.equal(s.flags.relay,false);assert.deepEqual(s.logistics.inventory,{ammo:0,medical:0,sentry:0});});
test('V109 sauvegarde un geste en cours et reprend en pause',()=>{const s=medState();O.player(s).hp=41;O.fieldAction(s,'medical','ripley');run(s,.5);const raw=serialize(s),r=O.importSession(raw);assert.ok(r.ok,r.reason);assert.equal(r.session.paused,true);assert.deepEqual(serialize(r.session),raw);O.pause(r.session,false);run(r.session,1.2);assert.equal(O.player(r.session).hp,71);assert.equal(r.session.logistics.spent.medical,1);});
test('V109 répétition import n’ajoute pas de réserve',()=>{const s=ammoState(),raw=serialize(s);for(let i=0;i<20;i++){const r=O.importSession(raw);assert.ok(r.ok,r.reason);assert.deepEqual(r.session.logistics.inventory,{ammo:3,medical:0,sentry:0});}});
test('V109 nouveau parcours réinitialise les stocks sans héritage',()=>{const s=ammoState();assert.equal(s.logistics.inventory.ammo,3);assert.deepEqual(O.createSession().logistics.inventory,{ammo:0,medical:0,sentry:0});});
const bads={
 'quantité inventée':r=>r.logistics.inventory.ammo++,
 'stock dupliqué':r=>r.logistics.collected.push('log-ammo'),
 'stock inconnu':r=>r.logistics.collected.push('hack'),
 'charge négative':r=>r.logistics.inventory.medical=-1,
 'soin illimité injecté':r=>r.logistics.inventory.unlimited=true,
 'compteur consommation incohérent':r=>r.logistics.spent.ammo++,
 'compteur ouverture incohérent':r=>r.logistics.metrics.opened++,
 'champ alarme inattendu':r=>r.logistics.alarms['reserve-alarm'].kill=true,
 'alarme durée hors limites':r=>r.logistics.alarms['reserve-alarm'].remaining=90,
 'alarme volume inconnu':r=>r.logistics.alarms.other={},
 'champ logistique inconnu':r=>r.logistics.godmode=true,
 'ancienne version fraudée':r=>r.logistics.schema=108,
 'nature acteur fraudée':r=>r.team[0].kind='enemy',
 'équipe dupliquée':r=>r.team.push(structuredClone(r.team[0])),
 'lieu non visité mais stock acquis':r=>r.visitedRooms=[]
};
for(const [name,mutate] of Object.entries(bads))test('V109 import refuse '+name+' atomiquement',()=>{const s=ammoState(),before=serialize(s),raw=structuredClone(before);mutate(raw);assert.equal(O.importSession(raw).ok,false);assert.deepEqual(serialize(s),before);});
for(const room of ['v106-hadley','v106-medlab','v107-operations','v107-service','v106-sentry','v106-sulaco'])test('V109 migration V108 inspection '+room,()=>{const old=Old.createSession({mode:'inspection',roomId:room}),raw=Old.exportSession(old);const r=O.importV108(raw);assert.ok(r.ok,r.reason);assert.equal(r.session.schema,109);assert.equal(r.session.roomId,room);assert.deepEqual(O.exportSession(r.session).team,raw.team);assert.deepEqual(r.session.logistics.inventory,{ammo:0,medical:0,sentry:0});});
test('V109 migration V108 opération conserve monde, contacts et chargeurs',()=>{const s=Old.createSession();Old.fire(s,{x:1400,z:200});Old.advance(s,.1);const raw=Old.exportSession(s),r=O.importV108(raw);assert.ok(r.ok,r.reason);const next=serialize(r.session);assert.deepEqual(next.team,raw.team);for(const [id,w] of Object.entries(raw.worlds))assert.deepEqual(next.worlds[id],w);for(const [id,b] of Object.entries(raw.contacts.brains))assert.deepEqual(next.contacts.brains[id],b);assert.equal(next.step,raw.step);});
test('V109 migration V108 corrompue refusée',()=>{const r=Old.exportSession(Old.createSession());r.team[0].ammo=-50;assert.equal(O.importV108(r).ok,false);});

for(const stock of STOCKS)test('V109 stock physique bloque la marche et les balles '+stock.id,()=>{const s=setup(stock.roomId),w=O.currentWorld(s);assert.equal(S.canStand(w,stock,15),false);assert.ok(S.trace(w,{x:stock.x-80,z:stock.z},{x:stock.x+80,z:stock.z},0,{query:'projectile'}));at(s,stock.x-60,stock.z);assert.ok(R.begin(s,'stock',null,stock.id).ok);});
