/* V107: local connected operation built on the last delivered V106 sectors.
   No reconstruction of the 64 native V105 rooms is claimed.
   Coordinates and links below are explicitly authored, never randomly placed. */
import {VALIDATION_SCENES} from './validation-scenes.mjs';
const copy=x=>structuredClone(x);
const member=(id,name,kind,role,radius,ammo)=>({id,name,kind,role,radius,hp:100,ammo,speed:kind==='escort'?138:139});
export const TEAM = [member('ripley','Ripley','player','marine',15,48),member('hicks','Hicks','ally','marine',15,24),member('hudson','Hudson','ally','marine',15,24),member('newt','Newt','escort','child',11,0)];
const technical={id:'v107-service',stageId:null,width:1440,depth:380,mode:'HYBRID',title:'Relais de maintenance',subtitle:'Alimentation du bloc · liaison médicale',family:'service',goal:'Rétablir la liaison électrique, puis rejoindre le laboratoire.',
 solids:[{id:'service-north',x:610,z:0,w:40,d:132,h:190},{id:'service-south',x:610,z:257,w:40,d:123,h:164},{id:'pump-foundation',x:275,z:53,w:151,d:98,h:94},{id:'transformer-plinth',x:1000,z:55,w:138,d:90,h:141},{id:'cable-rack',x:828,z:275,w:115,d:72,h:69}],
 doors:[{id:'maintenance-gate',name:'Clapet de maintenance',x:610,z:132,w:40,d:125,h:183,reach:101,initialOpen:false,powered:false,manual:true}],
 circuits:[{id:'service',initialOn:true},{id:'network',initialOn:false}],controls:[{id:'relay-switch',name:'Relais Operations',x:1238,z:226,circuit:'network',reach:66},{id:'service-switch',name:'Éclairage local',x:464,z:307,circuit:'service',reach:58}],
 props:[{id:'relay-console',x:1238,z:226,support:'pied de l’armoire de relais',type:'console',circuit:'network'},{id:'service-console',x:464,z:307,support:'sol de maintenance',type:'console'},{id:'pump-pipes',x:316,z:40,support:'mur au-dessus du socle de pompage',type:'pipe'},{id:'service-lamp',x:702,z:24,support:'poutre nord',type:'lamp',circuit:'service'},{id:'transformer-cable',x:1058,z:28,support:'mur au-dessus du transformateur',type:'pipe'},{id:'service-crate',x:837,z:314,support:'table basse de câblage',supportId:'cable-rack',elevation:69,type:'crate'}],
 nodes:[{id:'service-entry',name:'Entrée maintenance',x:137,z:198},{id:'service-threshold',name:'Clapet manuel',x:606,z:195},{id:'relay',name:'Relais Operations',x:1238,z:226},{id:'medical-return',name:'Liaison médicale',x:1325,z:323}],actors:[{id:'service-contact',name:'Xénomorphe',kind:'enemy',role:'warrior',x:946,z:198,radius:19,hp:100,ammo:0,speed:63}]};
const operations={id:'v107-operations',stageId:'c05-p1',width:1440,depth:380,mode:'HYBRID',title:'Operations',subtitle:'Centre du bloc · regroupement et repli',family:'operations',goal:'Trouver le relais, récupérer Newt et sécuriser le retour.',
 solids:[{id:'ops-table',x:430,z:100,w:238,d:93,h:49},{id:'ops-rack',x:303,z:274,w:133,d:75,h:126},{id:'north-partition',x:874,z:0,w:40,d:114,h:166},{id:'south-partition',x:874,z:255,w:40,d:125,h:156},{id:'ops-display',x:1054,z:68,w:174,d:71,h:103}],
 doors:[{id:'ops-bulkhead',name:'Cloison Operations',x:874,z:114,w:40,d:141,h:174,reach:108,initialOpen:true,powered:true,manual:true}],
 circuits:[{id:'service',initialOn:true}],controls:[{id:'service-switch',name:'Éclairage du poste',x:733,z:307,circuit:'service',reach:68}],
 props:[{id:'ops-screen',x:570,z:142,support:'table centrale',supportId:'ops-table',elevation:49,type:'console'},{id:'ops-console',x:733,z:307,support:'sol de la coursive',type:'console'},{id:'ops-lamp-west',x:380,z:25,support:'rail nord',type:'lamp',circuit:'service'},{id:'ops-lamp-east',x:1186,z:27,support:'rail nord',type:'lamp',circuit:'service'},{id:'ops-pipe',x:785,z:18,support:'mur nord',type:'pipe'},{id:'ammo-bin',x:346,z:312,support:'étagère arrière',type:'crate'}],
 nodes:[{id:'ops-west',name:'Coursive résidentielle',x:123,z:197},{id:'ops-center',name:'Table de situation',x:740,z:200},{id:'ops-east',name:'Accès défense',x:1290,z:195},{id:'ops-north',name:'Accès maintenance',x:736,z:59},{id:'ops-medical',name:'Baie médicale',x:1120,z:324}],actors:[]};
export const ROOMS=[...VALIDATION_SCENES.map(copy),operations,technical].map(s=>({...s,actors:s.actors.filter(a=>a.kind==='enemy'||a.role==='sentry')}));
export const roomById=id=>ROOMS.find(s=>s.id===id)||null;
const end=(room,id,x,z,label,arrival)=>({room,id,x,z,label,arrival});
/* Portal interactions occur at physical thresholds. The inter-room transfer is
   a short scene cut, not a continuous corridor or teleport during combat. */
export const LINKS=[
 {id:'residential-ops',a:end('v106-hadley','hadley-to-ops',1360,195,'Operations',{x:1290,z:195}),b:end('v107-operations','ops-to-hadley',64,195,'Bloc résidentiel',{x:135,z:195})},
 {id:'ops-service',a:end('v107-operations','ops-to-service',746,43,'Maintenance',{x:746,z:115}),b:end('v107-service','service-to-ops',68,195,'Operations',{x:140,z:195})},
 {id:'ops-medlab',a:end('v107-operations','ops-to-medlab',1120,329,'Infirmerie',{x:1120,z:235}),b:end('v106-medlab','medlab-to-ops',68,199,'Operations',{x:143,z:199})},
 {id:'ops-sentry',a:end('v107-operations','ops-to-sentry',1360,195,'Ligne de défense',{x:1285,z:195}),b:end('v106-sentry','sentry-to-ops',68,194,'Operations',{x:144,z:194})},
 {id:'medical-service',a:end('v107-service','service-to-medlab',1346,325,'Accès médical de service',{x:1236,z:325}),b:end('v106-medlab','medlab-to-service',1320,77,'Relais de maintenance',{x:1314,z:171})}
];
export function exitsFor(room){return LINKS.flatMap(l=>l.a.room===room?[{...l.a,linkId:l.id,to:l.b}]:l.b.room===room?[{...l.b,linkId:l.id,to:l.a}]:[]);}
export const OPERATION_ROOMS=['v106-hadley','v107-operations','v107-service','v106-medlab','v106-sentry'];
export const OBJECTIVES=[
 {id:'rally',title:'Rejoindre Operations',detail:'Passer la porte résidentielle et garder le groupe à proximité du seuil.'},
 {id:'relay',title:'Rétablir le relais',detail:'Le poste de maintenance est accessible au nord d’Operations. Actionnez son relais.'},
 {id:'newt',title:'Ramener Newt',detail:'Sécurisez l’infirmerie, puis approchez Newt et appelez-la avec E.'},
 {id:'defense',title:'Tenir la ligne de défense',detail:'Garder Newt avec vous, ouvrir la cloison et tenir dix secondes. Aucun contact ne doit rester.'},
 {id:'return',title:'Replier toute l’équipe',detail:'Retournez au point d’entrée de Hadley. Approchez l’équipe et confirmez le repli avec E.'}
];
export const extraction={room:'v106-hadley',x:220,z:198,label:'Point de repli'};
