/* V114 — original layouts for identifiable Aliens (1986) locations.
   These are authored floorplans, not surveyed movie-set drawings.
   Off-world transport is NOT a walk-through door. Inspection clusters stay separate. */
import {ROOMS as PRIOR,LINKS as PRIOR_LINKS,OPERATION_ROOMS as PRIOR_OPERATION,TEAM,OBJECTIVES,extraction,STOCKS,ALARMS,BEACON_STOCK} from './operation-scenes-v112.mjs';
export {TEAM,OBJECTIVES,extraction,STOCKS,ALARMS,BEACON_STOCK};
const copy=x=>structuredClone(x);
function room(id,title,subtitle,family,{gate=690,open=true,bodies=[],props=[],outdoor=false}={}){
 const solids=outdoor?[]:[{id:id+'-wall-north',x:gate,z:0,w:32,d:135,h:181,material:'metal'},{id:id+'-wall-south',x:gate,z:255,w:32,d:125,h:164,material:'metal'}];
 const doors=outdoor?[]:[{id:id+'-door',name:'Accès '+title,x:gate,z:135,w:32,d:120,h:181,reach:104,initialOpen:open,powered:true,manual:true}];
 for(const [i,b] of bodies.entries())solids.push({id:id+'-body-'+i,material:'metal',...b});
 return {id,stageId:null,width:1440,depth:380,mode:'HYBRID',title,subtitle,family,goal:'Inspection historique : parcourir le lieu et ses raccords. Plan réinterprété, pas une scène de film intégralement jouée.',solids,doors,circuits:[{id:'service',initialOn:true}],controls:[{id:id+'-switch',name:'Service local',x:540,z:290,circuit:'service',reach:68}],props:[{id:id+'-console',x:540,z:290,support:'pupitre de service fixé au sol',type:'console'},...(!outdoor?[{id:id+'-light-a',x:320,z:24,support:'rail nord',type:'lamp',circuit:'service'},{id:id+'-light-b',x:1120,z:24,support:'rail nord',type:'lamp',circuit:'service'}]:[]),...props.map((p,i)=>({id:id+'-prop-'+i,support:'support architectural identifié',...p}))],nodes:[{id:id+'-entry',name:'Accès ouest',x:142,z:195},{id:id+'-middle',name:'Travée centrale',x:590,z:195},{id:id+'-east',name:'Accès est',x:1280,z:195}],actors:[],historicalInspection:true};
}
const extras=[
 room('v114-gateway-medical','Gateway · chambre médicale','Après le sauvetage · Ripley en convalescence','medical',{gate:815,bodies:[{x:340,z:65,w:178,d:80,h:48,material:'medical'},{x:1050,z:276,w:148,d:72,h:118}],props:[{x:429,z:106,elevation:48,supportId:'v114-gateway-medical-body-0',support:'lit médical',type:'pillow'},{x:1180,z:42,support:'tablette murale',type:'photo'}]}),
 room('v114-gateway-inquiry','Gateway · commission','Audition de Ripley · lieu distinct de la colonie','gateway',{gate:920,bodies:[{x:370,z:65,w:372,d:98,h:65},{x:1050,z:274,w:204,d:65,h:94}],props:[{x:540,z:105,elevation:65,supportId:'v114-gateway-inquiry-body-0',support:'table de commission',type:'console'},{x:1150,z:28,support:'mur de projection',type:'display'}]}),
 room('v114-sulaco-cryo','Sulaco · cryostase','Réveil de la section · chambre de sommeil','sulaco',{gate:870,bodies:[{x:285,z:47,w:142,d:91,h:48},{x:454,z:47,w:142,d:91,h:48},{x:1020,z:52,w:142,d:91,h:48},{x:1080,z:281,w:145,d:74,h:48}],props:[{x:356,z:92,bodyId:'v114-sulaco-cryo-body-0',support:'caisson de cryostase',type:'cryo'},{x:525,z:92,bodyId:'v114-sulaco-cryo-body-1',support:'caisson de cryostase',type:'cryo'},{x:1091,z:95,bodyId:'v114-sulaco-cryo-body-2',support:'caisson de cryostase',type:'cryo'}]}),
 room('v114-sulaco-mess','Sulaco · mess et briefing','Repas, table de Bishop et préparation de la mission','sulaco',{gate:870,bodies:[{x:312,z:65,w:238,d:85,h:49},{x:1010,z:266,w:232,d:72,h:49}],props:[{x:390,z:98,supportId:'v114-sulaco-mess-body-0',elevation:49,support:'table du mess',type:'meal'},{x:480,z:100,supportId:'v114-sulaco-mess-body-0',elevation:49,support:'table du mess',type:'knife'},{x:1135,z:300,supportId:'v114-sulaco-mess-body-1',elevation:49,support:'table de briefing',type:'console'}]}),
 room('v114-sulaco-armory','Sulaco · préparation USCM','Râteliers, harnais et équipements · inspection armurerie','armory',{gate:780,bodies:[{x:304,z:50,w:220,d:80,h:127},{x:945,z:45,w:256,d:85,h:132},{x:980,z:279,w:226,d:64,h:91}],props:[{x:413,z:86,bodyId:'v114-sulaco-armory-body-0',support:'râtelier fixé au sol',type:'gun-rack'},{x:1069,z:85,bodyId:'v114-sulaco-armory-body-1',support:'cadre de stockage USCM',type:'armor-rack'},{x:1088,z:310,elevation:91,supportId:'v114-sulaco-armory-body-2',support:'banc de préparation',type:'smartgun'}]}),
 room('v114-sulaco-cargo','Sulaco · hangar de préparation','Avant la descente · loader et fret, sans Newt à bord','sulaco',{gate:820,bodies:[{x:298,z:47,w:206,d:89,h:101},{x:1009,z:270,w:199,d:77,h:126}],props:[{x:397,z:91,bodyId:'v114-sulaco-cargo-body-0',support:'palette de chargement',type:'cargo'},{x:1108,z:310,bodyId:'v114-sulaco-cargo-body-1',support:'P-5000 garé sur son appui',type:'loader'}]}),
 room('v114-dropship','UD-4L · cabine','Poste de vol et baie de transport · pas une porte interplanétaire','cockpit',{gate:810,bodies:[{x:308,z:53,w:182,d:95,h:105},{x:998,z:45,w:190,d:97,h:120},{x:1030,z:282,w:176,d:60,h:83}],props:[{x:397,z:102,elevation:105,supportId:'v114-dropship-body-0',support:'tableau de pilotage',type:'display'},{x:1090,z:96,elevation:120,supportId:'v114-dropship-body-1',support:'poste copilote',type:'console'}]}),
 room('v114-apc','M577 · compartiment de commandement','Moniteurs de Gorman · gabarit condensé pour l’inspection','cockpit',{gate:820,bodies:[{x:311,z:49,w:204,d:104,h:124},{x:1010,z:275,w:212,d:65,h:95}],props:[{x:410,z:98,elevation:124,supportId:'v114-apc-body-0',support:'baie moniteurs de commandement',type:'display'},{x:1130,z:306,elevation:95,supportId:'v114-apc-body-1',support:'banc du véhicule',type:'ammo-case'}]}),
 room('v114-colony-mess','Hadley · réfectoire','Tables civiles abandonnées · raccord local adapté','colony',{gate:895,open:false,bodies:[{x:304,z:63,w:208,d:75,h:45},{x:1030,z:264,w:220,d:76,h:46}],props:[{x:401,z:99,elevation:45,supportId:'v114-colony-mess-body-0',support:'table des colons',type:'meal'},{x:1140,z:300,elevation:46,supportId:'v114-colony-mess-body-1',support:'table abandonnée',type:'meal'}]}),
 room('v114-colony-drain','Hadley · puits de drainage','Galerie technique et refuge · reconstitution libre des distances','conduit',{gate:810,open:false,bodies:[{x:300,z:48,w:221,d:88,h:92},{x:1020,z:269,w:202,d:70,h:88}],props:[{x:391,z:28,support:'conduite nord',type:'pipe'},{x:1108,z:23,support:'conduite de drainage',type:'pipe'},{x:1140,z:209,support:'sol de service',type:'grate'}]}),
 room('v114-processor-entry','Processeur · accès industriel','Entrée de l’atmosphère processor · zone distincte du relais de maintenance','processor',{gate:715,open:false,bodies:[{x:285,z:48,w:230,d:88,h:153},{x:1000,z:266,w:232,d:85,h:114}],props:[{x:370,z:26,support:'collecteur nord',type:'pipe'},{x:1108,z:24,support:'conduite haute',type:'pipe'}]}),
 room('v114-processor-gallery','Processeur · galerie','Poutres, conduites et passages industriels · pas encore d’échelle jouable','processor',{gate:860,bodies:[{x:306,z:40,w:152,d:105,h:164},{x:1030,z:262,w:182,d:88,h:158}],props:[{x:373,z:24,support:'collecteur industriel',type:'pipe'},{x:1118,z:24,support:'collecteur de retour',type:'pipe'},{x:1110,z:206,support:'sol passerelle',type:'grate'}]}),
 room('v114-hive-cocoons','Processeur · cocons','Colons capturés · inspection du décor, pas la libération historique','hive',{gate:830,bodies:[{x:318,z:44,w:144,d:104,h:145},{x:1030,z:266,w:164,d:77,h:149}],props:[{x:390,z:93,bodyId:'v114-hive-cocoons-body-0',support:'pilier enveloppé de résine',type:'cocoon'},{x:1110,z:303,bodyId:'v114-hive-cocoons-body-1',support:'colonne de résine',type:'cocoon'},{x:1130,z:35,support:'mur nord',type:'resin'}]}),
 room('v114-queen-nursery','Nurserie · chambre de ponte','Inspection de la chambre · affrontement royal non reconstitué ici','hive',{gate:820,bodies:[{x:304,z:42,w:180,d:91,h:86},{x:983,z:270,w:255,d:75,h:111}],props:[{x:392,z:88,bodyId:'v114-queen-nursery-body-0',support:'nappe de résine au sol',type:'eggs'},{x:1115,z:308,bodyId:'v114-queen-nursery-body-1',support:'socle organique',type:'ovipositor'},{x:1140,z:33,support:'mur royal',type:'resin'}]}),
 room('v114-landing-pad','LV-426 · plateforme d’extraction','Aire extérieure · transport vers le Sulaco non simulé','exterior',{outdoor:true,bodies:[{x:321,z:53,w:172,d:96,h:80},{x:1050,z:277,w:174,d:70,h:90}],props:[{x:405,z:101,elevation:80,supportId:'v114-landing-pad-body-0',support:'balise sur socle',type:'lamp',circuit:'service'},{x:1130,z:308,elevation:90,supportId:'v114-landing-pad-body-1',support:'pupitre d’approche',type:'console'}]})
];
export const ROOMS=[...PRIOR.map(copy),...extras];
const end=(room,id,x,z,label,arrival)=>({room,id,x,z,label,arrival});
const pair=(id,a,b,labelA,labelB)=>({id,inspectionOnly:true,a:end(a,id+'-a',1360,195,labelB,{x:1275,z:195}),b:end(b,id+'-b',64,195,labelA,{x:144,z:195})});
export const LINKS=[...PRIOR_LINKS.map(copy),
 pair('gateway-inquiry','v114-gateway-medical','v114-gateway-inquiry','Chambre médicale','Commission'),
 pair('sulaco-wakeup','v114-sulaco-cryo','v114-sulaco-mess','Cryostase','Mess et briefing'),
 pair('sulaco-loadout','v114-sulaco-mess','v114-sulaco-armory','Mess et briefing','Préparation USCM'),
 pair('sulaco-bay','v114-sulaco-armory','v114-sulaco-cargo','Préparation USCM','Hangar de fret'),
 pair('processor-walk','v114-processor-entry','v114-processor-gallery','Accès industriel','Galerie du processeur'),
 pair('processor-hive','v114-processor-gallery','v114-hive-cocoons','Galerie industrielle','Cocons'),
 pair('hive-nursery','v114-hive-cocoons','v114-queen-nursery','Cocons','Nurserie'),
 // Two local additions are traversable in the operation; they grant no objective or equipment.
 {id:'residential-mess',initialOpen:false,a:end('v106-hadley','hadley-to-mess',750,43,'Réfectoire des colons',{x:750,z:126}),b:end('v114-colony-mess','mess-to-hadley',64,195,'Bloc résidentiel',{x:144,z:195})},
 {id:'medical-drain',initialOpen:false,a:end('v106-medlab','medlab-to-drain',860,329,'Puits de drainage',{x:850,z:239}),b:end('v114-colony-drain','drain-to-medlab',64,195,'Infirmerie',{x:144,z:195})}
];
export const OPERATION_ROOMS=[...PRIOR_OPERATION,'v114-colony-mess','v114-colony-drain'];
export const roomById=id=>ROOMS.find(r=>r.id===id)||null;
export const exitsFor=room=>LINKS.flatMap(l=>l.a.room===room?[{...l.a,linkId:l.id,to:l.b,inspectionOnly:!!l.inspectionOnly}]:l.b.room===room?[{...l.b,linkId:l.id,to:l.a,inspectionOnly:!!l.inspectionOnly}]:[]);
// Physically bounded vestibules. Returns join each hatch's two jambs to the
// nearest perimeter; no free-standing portal slab is left in the middle of a bay.
export const VESTIBULES=[];
for(const r of ROOMS)for(const e of exitsFor(r.id)){
 const vertical=e.x<100||e.x>1340,w=12,h=119;let returns;
 if(vertical){const left=e.x<100,x=left?0:e.x-12,len=left?e.x+12:r.width-x;returns=[{x,z:e.z-49,w:len,d:12},{x,z:e.z+37,w:len,d:12}];}
 else{const north=e.z<r.depth/2,z=north?0:e.z-12,len=north?e.z+12:r.depth-z;returns=[{x:e.x-49,z,w:12,d:len},{x:e.x+37,z,w:12,d:len}];}
 const ids=[];for(const [i,b]of returns.entries()){const id='vestibule:'+e.id+':'+i;r.solids.push({id,...b,h,material:'metal',visual:'vestibule-return'});ids.push(id);}
 VESTIBULES.push({roomId:r.id,exitId:e.id,linkId:e.linkId,orientation:vertical?'side':'north-south',returns:ids});
}
// Every internal gate is already between two built partitions. Machine-check the
// contact rather than relying on names or a decorative backdrop.
export function auditArchitecture(){
 const errors=[],doors=[];
 for(const r of ROOMS)for(const d of r.doors){
  const support=r.solids.filter(b=>Math.abs(b.x-d.x)<.01&&Math.abs(b.w-d.w)<.01&&(Math.abs(b.z+b.d-d.z)<.01||Math.abs(d.z+d.d-b.z)<.01));
  const perimeter=d.critical&&d.z===0&&d.d===r.depth&&d.x+d.w>=r.width-30;
  const ok=support.length>=2||perimeter;
  doors.push({roomId:r.id,id:d.id,supportIds:support.map(x=>x.id),perimeter:!!perimeter,ok});if(!ok)errors.push(r.id+'/'+d.id+': porte sans jambages architecturaux');
 }
 return {ok:!errors.length,errors,doors,vestibules:VESTIBULES};
}
// Named cast in briefing/inspection tableaux. NPCs are not recruitable combat
// reinforcements in the local rearguard operation; their film beat is explicit.
const npc=(room,id,name,x,z,role='observer')=>{
 const r=roomById(room);r.actors.push({id:'npc-'+id+'-'+room,name,appearanceId:id,kind:'ally',role,x,z,radius:15,hp:100,ammo:0,speed:0,waiting:true});
};
npc('v114-gateway-inquiry','burke','Carter Burke',1090,194);
npc('v114-sulaco-mess','bishop','Bishop',1000,209,'synthetic');
npc('v114-sulaco-mess','gorman','Gorman',1150,209,'officer');
npc('v114-sulaco-mess','apone','Apone',1230,199,'marine');
npc('v114-sulaco-cryo','frost','Frost',1090,202,'marine');
npc('v114-sulaco-cryo','crowe','Crowe',1190,207,'marine');
npc('v114-sulaco-cryo','wierzbowski','Wierzbowski',1290,205,'marine');
npc('v114-sulaco-armory','vasquez','Vasquez',1000,211,'smartgunner');
npc('v114-sulaco-armory','drake','Drake',1120,207,'smartgunner');
npc('v114-sulaco-armory','dietrich','Dietrich',1240,205,'medic');
npc('v114-dropship','ferro','Ferro',1070,205,'pilot');
npc('v114-dropship','spunkmeyer','Spunkmeyer',1200,205,'pilot');
// Second, separate equipment case on the existing cable bench. It does not
// overlap the engineering stock at x837, and does not invent a new obstacle.
roomById('v107-service').props.push({id:'v114-incinerator-case',x:910,z:315,supportId:'cable-rack',elevation:69,support:'table de câblage · compartiment incinerator',type:'armament-case',arsenalId:'service-incinerator'});
