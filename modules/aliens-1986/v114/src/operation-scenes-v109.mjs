/* Authored V109 extension. The original six rooms and their coordinates are unchanged.
   Two new rooms and three reciprocal links form a service loop, not extra required objectives. */
import {ROOMS as BASE_ROOMS,LINKS as BASE_LINKS,OPERATION_ROOMS as BASE_OPERATION,TEAM,OBJECTIVES,extraction} from './operation-scenes-v107.mjs';
export {TEAM,OBJECTIVES,extraction};
const logistics={id:'v109-logistics',stageId:null,width:1440,depth:380,mode:'HYBRID',title:'Galerie logistique',subtitle:'Acheminement du bloc · stocks sous scellés',family:'logistics',goal:'Dégager le quai, récupérer une réserve et reconnaître la voie de service.',
 solids:[{id:'freight-north',x:670,z:0,w:38,d:137,h:186},{id:'freight-south',x:670,z:253,w:38,d:127,h:175},{id:'parked-tug',x:300,z:56,w:178,d:86,h:92,visual:'tug'},{id:'pallet-bay',x:307,z:282,w:170,d:70,h:68},{id:'storage-plinth',x:1030,z:283,w:175,d:58,h:80},{id:'north-shelf',x:1090,z:52,w:176,d:80,h:118}],
 doors:[{id:'freight-shutter',name:'Rideau du quai',x:670,z:137,w:38,d:116,h:182,reach:100,initialOpen:false,powered:false,manual:true}],
 circuits:[{id:'service',initialOn:true}],controls:[{id:'freight-light',name:'Éclairage du quai',x:525,z:224,circuit:'service',reach:62}],
 props:[{id:'tug-cabin',x:389,z:99,support:'châssis du tracteur stationné',bodyId:'parked-tug',type:'tug'},{id:'pallet-crate',x:385,z:317,support:'palette du quai',supportId:'pallet-bay',elevation:68,type:'crate'},{id:'freight-lamp-a',x:516,z:24,support:'portique nord',type:'lamp',circuit:'service'},{id:'freight-lamp-b',x:1031,z:24,support:'portique nord',type:'lamp',circuit:'service'},{id:'sealed-ammo',x:1190,z:221,support:'desserte de ravitaillement fixée au sol',type:'supply',stockId:'log-ammo'},{id:'quay-console',x:525,z:224,support:'colonne de commande du quai',type:'console'},{id:'dispatch-sign',x:944,z:28,support:'mur de livraison',type:'pipe'}],
 nodes:[{id:'quay-entry',name:'Liaison Operations',x:138,z:195},{id:'quay-center',name:'Rideau de fret',x:620,z:195},{id:'quay-stock',name:'Réserve sous scellés',x:1190,z:221},{id:'quay-east',name:'Réserve technique',x:1345,z:195}],
 actors:[{id:'logistics-pursuer',name:'Xénomorphe du quai',kind:'enemy',role:'warrior',x:985,z:196,radius:19,hp:100,ammo:0,speed:65}]};
const reserve={id:'v109-reserve',stageId:null,width:1440,depth:380,mode:'HYBRID',title:'Réserve technique',subtitle:'Secours, munitions et sirène de diagnostic',family:'reserve',goal:'Préparer les ressources du groupe ou détourner un contact avec la sirène.',
 solids:[{id:'reserve-north',x:620,z:0,w:34,d:135,h:179},{id:'reserve-south',x:620,z:254,w:34,d:126,h:162},{id:'service-locker',x:286,z:54,w:110,d:91,h:128},{id:'battery-stack',x:280,z:281,w:134,d:67,h:88},{id:'medical-counter',x:835,z:65,w:188,d:90,h:67},{id:'reserve-cabinet',x:967,z:282,w:157,d:67,h:119}],
 doors:[{id:'reserve-door',name:'Cloison de réserve',x:620,z:135,w:34,d:119,h:177,reach:100,initialOpen:false,powered:false,manual:true}],
 circuits:[{id:'service',initialOn:true}],controls:[{id:'reserve-light',name:'Éclairage réserve',x:754,z:293,circuit:'service',reach:62}],
 props:[{id:'sentry-cartridge',x:347,z:216,support:'berceau de munitions au sol',type:'supply',stockId:'reserve-sentry'},{id:'medical-pack',x:918,z:218,support:'chariot de secours fixé au sol',type:'supply',stockId:'reserve-medical'},{id:'alarm-desk',x:1214,z:238,support:'socle du testeur de sirène',type:'alarm',alarmId:'reserve-alarm'},{id:'reserve-monitor',x:922,z:111,support:'comptoir médical',supportId:'medical-counter',elevation:67,type:'console'},{id:'reserve-lamp',x:1012,z:24,support:'rail médical nord',type:'lamp',circuit:'service'},{id:'reserve-switch',x:754,z:293,support:'potelet de commande',type:'console'},{id:'reserve-conduit',x:1219,z:27,support:'mur de distribution',type:'pipe'}],
 nodes:[{id:'reserve-entry',name:'Galerie logistique',x:138,z:195},{id:'sentry-stocks',name:'Cartouche sentinelle',x:347,z:216},{id:'medical-stocks',name:'Chariot de secours',x:918,z:218},{id:'reserve-alarm-node',name:'Diagnostic sonore',x:1214,z:238},{id:'reserve-north-link',name:'Maintenance',x:1328,z:47}],
 actors:[{id:'reserve-stalker',name:'Xénomorphe de réserve',kind:'enemy',role:'warrior',x:1114,z:202,radius:19,hp:100,ammo:0,speed:61}]};
// Resource equipment owns an actual footprint used by movement and ballistic queries.
for(const [room,id,x,z,type] of [[logistics,'log-ammo',1190,221,'supply'],[reserve,'reserve-sentry',347,216,'supply'],[reserve,'reserve-medical',918,218,'supply'],[reserve,'reserve-alarm',1214,238,'alarm']]){
 room.solids.push({id:'body-'+id,x:x-34,z:z-18,w:68,d:36,h:type==='alarm'?64:43,material:'metal',blocksSight:false,visual:type});
 const p=room.props.find(p=>p.stockId===id||p.alarmId===id);p.bodyId='body-'+id;
}
export const ROOMS=[...BASE_ROOMS.map(x=>structuredClone(x)),logistics,reserve];
const end=(room,id,x,z,label,arrival)=>({room,id,x,z,label,arrival});
export const LINKS=[...BASE_LINKS.map(x=>structuredClone(x)),
 {id:'ops-logistics',a:end('v107-operations','ops-to-logistics',164,326,'Galerie logistique',{x:164,z:240}),b:end('v109-logistics','logistics-to-ops',64,195,'Operations',{x:144,z:195})},
 {id:'logistics-reserve',a:end('v109-logistics','logistics-to-reserve',1366,195,'Réserve technique',{x:1275,z:195}),b:end('v109-reserve','reserve-to-logistics',64,195,'Galerie logistique',{x:144,z:195})},
 {id:'reserve-service',a:end('v109-reserve','reserve-to-service',1328,43,'Maintenance',{x:1300,z:137}),b:end('v107-service','service-to-reserve',1300,43,'Réserve technique',{x:1300,z:137})}];
export const OPERATION_ROOMS=[...BASE_OPERATION,'v109-logistics','v109-reserve'];
export const roomById=id=>ROOMS.find(r=>r.id===id)||null;
export const exitsFor=room=>LINKS.flatMap(l=>l.a.room===room?[{...l.a,linkId:l.id,to:l.b}]:l.b.room===room?[{...l.b,linkId:l.id,to:l.a}]:[]);
export const STOCKS=Object.freeze([
 {id:'log-ammo',roomId:'v109-logistics',x:1190,z:221,reach:70,name:'Caisse de munitions',bodyId:'body-log-ammo',grant:{ammo:3,medical:0,sentry:0}},
 {id:'reserve-sentry',roomId:'v109-reserve',x:347,z:216,reach:70,name:'Cartouche pour sentinelle',bodyId:'body-reserve-sentry',grant:{ammo:0,medical:0,sentry:1}},
 {id:'reserve-medical',roomId:'v109-reserve',x:918,z:218,reach:70,name:'Trousse de secours',bodyId:'body-reserve-medical',grant:{ammo:0,medical:2,sentry:0}}]);
export const ALARMS=Object.freeze([{id:'reserve-alarm',roomId:'v109-reserve',x:1214,z:238,reach:70,name:'Sirène de diagnostic',bodyId:'body-reserve-alarm',emitter:{x:1170,z:238}}]);
