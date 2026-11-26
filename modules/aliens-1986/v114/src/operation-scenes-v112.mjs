/* V112: two authored rooms; the V111 rooms and existing link coordinates stay unchanged.
   Alternate route only. New entrance hatches start closed, not blocked by a task. */
import {ROOMS as BASE_ROOMS, LINKS as BASE_LINKS, OPERATION_ROOMS as BASE_OPERATION, TEAM, OBJECTIVES, extraction, STOCKS, ALARMS} from './operation-scenes-v109.mjs';
export {TEAM,OBJECTIVES,extraction,STOCKS,ALARMS};
const workshop={id:'v112-workshop',stageId:null,width:1440,depth:380,mode:'HYBRID',title:'Atelier optique',subtitle:'Équipements de secours · alimentation coupée',family:'workshop',goal:'Reconnaître l’atelier et récupérer le coffret de quatre balises. Le retour principal reste libre.',
 solids:[{id:'optics-north',x:682,z:0,w:36,d:134,h:188},{id:'optics-south',x:682,z:254,w:36,d:126,h:158},{id:'optics-bench',x:308,z:62,w:184,d:83,h:65},{id:'glass-rack',x:328,z:290,w:164,d:63,h:124},{id:'calibration-bank',x:990,z:59,w:178,d:82,h:112},{id:'optics-cabinet',x:965,z:288,w:136,d:65,h:98},{id:'beacon-case-body',x:1122,z:207,w:68,d:36,h:51,material:'metal',blocksSight:false,visual:'beacon-case'}],
 doors:[{id:'optics-door',name:'Cloison d’atelier',x:682,z:134,w:36,d:120,h:183,reach:100,initialOpen:false,powered:false,manual:true}],
 circuits:[{id:'service',initialOn:false}],controls:[{id:'optics-switch',name:'Éclairage de l’atelier',x:542,z:294,circuit:'service',reach:64}],
 props:[{id:'optics-console',x:398,z:103,support:'banc de calibration',supportId:'optics-bench',elevation:65,type:'console'},{id:'optics-control',x:542,z:294,support:'potelet électrique au sol',type:'console'},{id:'optics-lamp-a',x:500,z:24,support:'rail optique nord',type:'lamp',circuit:'service'},{id:'optics-lamp-b',x:1130,z:24,support:'rail optique nord',type:'lamp',circuit:'service'},{id:'beacon-case',x:1156,z:225,support:'coffret de secours posé sur chariot',bodyId:'beacon-case-body',type:'beacon-case'},{id:'calibration-pipe',x:1080,z:24,support:'mur derrière le banc',type:'pipe'}],
 nodes:[{id:'optics-entry',name:'Operations',x:142,z:195},{id:'optics-center',name:'Cloison manuelle',x:623,z:195},{id:'optics-stock',name:'Coffret de balises',x:1085,z:225},{id:'optics-exit',name:'Coursive des conduites',x:1330,z:195}],
 actors:[{id:'optics-stalker',name:'Xénomorphe de l’atelier',kind:'enemy',role:'warrior',x:936,z:195,radius:19,hp:100,ammo:0,speed:62}]};
const conduit={id:'v112-conduit',stageId:null,width:1440,depth:380,mode:'HYBRID',title:'Coursive des conduites',subtitle:'Dérivation du bloc médical · éclairage de secours',family:'conduit',goal:'Contourner les échangeurs et reconnaître le raccord médical. Une balise peut éclairer le prochain couvert.',
 solids:[{id:'conduit-north',x:672,z:0,w:36,d:136,h:189},{id:'conduit-south',x:672,z:254,w:36,d:126,h:155},{id:'exchanger-west',x:316,z:54,w:181,d:84,h:127},{id:'valve-plinth',x:368,z:286,w:125,d:65,h:73},{id:'exchanger-east',x:995,z:56,w:194,d:82,h:134},{id:'conduit-south-rack',x:942,z:284,w:160,d:68,h:115}],
 doors:[{id:'conduit-door',name:'Battant de dérivation',x:672,z:136,w:36,d:118,h:181,reach:100,initialOpen:false,powered:false,manual:true}],
 circuits:[{id:'service',initialOn:false}],controls:[{id:'conduit-switch',name:'Éclairage de dérivation',x:550,z:280,circuit:'service',reach:64}],
 props:[{id:'conduit-control',x:550,z:280,support:'colonne de service',type:'console'},{id:'valve-indicator',x:431,z:316,support:'socle de vanne',supportId:'valve-plinth',elevation:73,type:'console'},{id:'conduit-lamp-a',x:306,z:24,support:'rail de maintenance nord',type:'lamp',circuit:'service'},{id:'conduit-lamp-b',x:1140,z:24,support:'rail de maintenance nord',type:'lamp',circuit:'service'},{id:'exchanger-pipe-a',x:404,z:25,support:'mur au-dessus de l’échangeur',type:'pipe'},{id:'exchanger-pipe-b',x:1089,z:25,support:'mur au-dessus de l’échangeur',type:'pipe'}],
 nodes:[{id:'conduit-entry',name:'Atelier optique',x:141,z:195},{id:'conduit-center',name:'Battant manuel',x:620,z:195},{id:'conduit-safe',name:'Retour entre échangeurs',x:900,z:220},{id:'conduit-medical',name:'Raccord infirmerie',x:1334,z:195}],
 actors:[{id:'conduit-crawler',name:'Facehugger des conduites',kind:'enemy',role:'facehugger',x:1034,z:212,radius:10,hp:48,ammo:0,speed:92}]};
export const ROOMS=[...BASE_ROOMS.map(r=>structuredClone(r)),workshop,conduit];
const end=(room,id,x,z,label,arrival)=>({room,id,x,z,label,arrival});
export const LINKS=[...BASE_LINKS.map(l=>structuredClone(l)),
 {id:'ops-optics',initialOpen:false,a:end('v107-operations','ops-to-optics',286,43,'Atelier optique',{x:286,z:135}),b:end('v112-workshop','optics-to-ops',64,195,'Operations',{x:144,z:195})},
 {id:'optics-conduit',a:end('v112-workshop','optics-to-conduit',1366,195,'Coursive des conduites',{x:1275,z:195}),b:end('v112-conduit','conduit-to-optics',64,195,'Atelier optique',{x:144,z:195})},
 {id:'conduit-medical',initialOpen:false,a:end('v112-conduit','conduit-to-medlab',1366,195,'Infirmerie',{x:1275,z:195}),b:end('v106-medlab','medlab-to-conduit',280,43,'Coursive des conduites',{x:280,z:140})}];
export const OPERATION_ROOMS=[...BASE_OPERATION,'v112-workshop','v112-conduit'];
export const roomById=id=>ROOMS.find(r=>r.id===id)||null;
export const exitsFor=room=>LINKS.flatMap(l=>l.a.room===room?[{...l.a,linkId:l.id,to:l.b}]:l.b.room===room?[{...l.b,linkId:l.id,to:l.a}]:[]);
export const BEACON_STOCK=Object.freeze({id:'optics-beacons',roomId:'v112-workshop',x:1156,z:225,reach:76,bodyId:'beacon-case-body',amount:4,name:'Coffret de balises de secours'});
