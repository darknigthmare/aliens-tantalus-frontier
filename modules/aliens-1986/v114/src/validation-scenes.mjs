/* Four newly authored validation sectors. NOT recovered V105 coordinates.
   stageId is the corresponding V105 narrative slot; this collection never
   overwrites the 64 native layouts. Coordinates are game units, not film surveys. */
const player=(x,z)=>({id:'ripley',name:'Ripley',kind:'player',role:'marine',x,z,radius:15,hp:100,ammo:48});
const ally=(id,name,x,z)=>({id,name,kind:'ally',role:'marine',x,z,radius:15,hp:100,ammo:24,speed:122});
const enemy=(id,x,z,role='warrior')=>({id,name:role==='facehugger'?'Parasite':'Xénomorphe',kind:'enemy',role,x,z,radius:role==='facehugger'?11:19,hp:100,ammo:0,speed:role==='facehugger'?91:67});
const sector=(x)=>({width:1440,depth:380,mode:'DEPTH',circuits:[{id:'service',initialOn:true}],controls:[{id:'service-switch',x:494,z:294,circuit:'service',reach:68}],...x});
export const VALIDATION_SCENES = [
  sector({id:'v106-hadley',stageId:'c04-p2',title:'Hadley’s Hope',subtitle:'Bloc résidentiel · porte de service',family:'colony',goal:'Ouvrir le passage et traverser avec l’escouade.',
    solids:[{id:'north-wall',x:610,z:0,w:44,d:138,h:166},{id:'south-wall',x:610,z:250,w:44,d:130,h:154},{id:'generator',x:348,z:78,w:100,d:62,h:84},{id:'crate-east',x:950,z:253,w:112,d:80,h:63},{id:'service-rack',x:1100,z:40,w:94,d:62,h:130}],
    doors:[{id:'service-gate',name:'Porte de service',x:610,z:138,w:44,d:112,h:174,reach:100,initialOpen:false,powered:true,manual:true}],
    props:[{id:'console',x:493,z:294,support:'sol de la coursive',type:'console'},{id:'lamp-west',x:385,z:32,support:'mur nord',type:'lamp',circuit:'service'},{id:'lamp-east',x:1050,z:30,support:'mur nord',type:'lamp',circuit:'service'},{id:'pipe',x:298,z:18,support:'mur nord',type:'pipe'}],
    nodes:[{id:'entry',name:'Entrée du bloc',x:225,z:198},{id:'threshold',name:'Porte de service',x:608,z:196},{id:'east',name:'Coursive est',x:1020,z:182}],
    actors:[player(220,198),ally('hicks','Hicks',165,215),ally('hudson','Hudson',165,283),enemy('warrior-a',890,190),enemy('warrior-b',1200,270)]}),
  sector({id:'v106-medlab',stageId:'c10-p2',title:'Infirmerie',subtitle:'Quarantaine · baie vitrée',family:'medical',goal:'Sécuriser le passage et garder Newt auprès du groupe.',
    controls:[{id:'service-switch',x:462,z:305,circuit:'service',reach:68}],
    solids:[{id:'glass-north',x:690,z:0,w:30,d:133,h:144,material:'glass',blocksSight:false},{id:'glass-south',x:690,z:263,w:30,d:117,h:144,material:'glass',blocksSight:false},{id:'bed-west',x:340,z:67,w:160,d:74,h:42,material:'medical'},{id:'med-cabinet',x:905,z:32,w:94,d:83,h:124,material:'medical'},{id:'bed-east',x:1065,z:257,w:145,d:82,h:42,material:'medical'}],
    doors:[{id:'quarantine-gate',name:'Quarantaine',x:690,z:133,w:30,d:130,h:161,reach:108,initialOpen:false,powered:true,manual:true}],
    props:[{id:'med-console',x:462,z:305,support:'sol de la baie',type:'console'},{id:'med-lamp',x:454,z:35,support:'rail mural',type:'lamp',circuit:'service'},{id:'tank-a',x:1132,z:54,support:'socle laboratoire',type:'tank'},{id:'tank-b',x:1245,z:54,support:'socle laboratoire',type:'tank'}],
    nodes:[{id:'entry',name:'Baie de soin',x:244,z:200},{id:'threshold',name:'Vitrage de quarantaine',x:689,z:200},{id:'east',name:'Laboratoire',x:1000,z:196}],
    actors:[player(243,200),ally('hicks','Hicks',180,216),{id:'newt',name:'Newt',kind:'escort',role:'child',x:175,z:265,radius:11,hp:100,ammo:0,speed:125},enemy('parasite-a',885,193,'facehugger'),enemy('parasite-b',1260,238,'facehugger')]}),
  sector({id:'v106-sentry',stageId:'c09-p2',title:'Couloir des sentinelles',subtitle:'Ligne de défense · repli protégé',family:'sentry',goal:'Ouvrir la ligne de tir. Refermer seulement si le passage est libre.',
    controls:[{id:'service-switch',x:446,z:313,circuit:'service',reach:68}],
    solids:[{id:'bulkhead-north',x:686,z:0,w:46,d:134,h:184},{id:'bulkhead-south',x:686,z:254,w:46,d:126,h:184},{id:'ammo-rack',x:325,z:43,w:88,d:62,h:80},{id:'cover-a',x:465,z:86,w:106,d:45,h:52},{id:'cover-b',x:475,z:281,w:115,d:45,h:52},{id:'east-rack',x:1074,z:272,w:85,d:70,h:112}],
    doors:[{id:'defense-gate',name:'Cloison de défense',x:686,z:134,w:46,d:120,h:180,reach:110,initialOpen:false,powered:true,manual:true}],
    props:[{id:'sentry-console',x:446,z:313,support:'socle arrière',type:'console'},{id:'ammo-box',x:405,z:303,support:'sol de défense',type:'crate'},{id:'lamp-west',x:545,z:27,support:'mur nord',type:'lamp',circuit:'service'},{id:'lamp-east',x:1095,z:35,support:'mur nord',type:'lamp',circuit:'service'}],
    nodes:[{id:'entry',name:'Zone de repli',x:260,z:201},{id:'threshold',name:'Cloison de défense',x:707,z:194},{id:'east',name:'Couloir extérieur',x:1040,z:200}],
    actors:[player(262,202),ally('hicks','Hicks',195,220),{id:'sentry-a',name:'Sentinelle A',kind:'ally',role:'sentry',x:514,z:198,radius:16,hp:100,ammo:120,waiting:true},enemy('rush-a',918,201),enemy('rush-b',1110,215),enemy('rush-c',1250,154)]}),
  sector({id:'v106-sulaco',stageId:'c16-p1',title:'Hangar du Sulaco',subtitle:'Fret · accès au sas',family:'hangar',goal:'Contrôler la coursive sans toucher à la logique du sas final.',
    controls:[{id:'service-switch',x:505,z:292,circuit:'service',reach:72}],
    solids:[{id:'cargo-north',x:615,z:0,w:75,d:131,h:178},{id:'cargo-south',x:615,z:260,w:75,d:120,h:163},{id:'cargo-west',x:330,z:57,w:135,d:75,h:100},{id:'cargo-east',x:936,z:278,w:130,d:75,h:91},{id:'loader-stand',x:1030,z:44,w:135,d:85,h:150}],
    doors:[{id:'cargo-gate',name:'Accès au fret',x:615,z:131,w:75,d:129,h:181,reach:120,initialOpen:false,powered:true,manual:true},{id:'airlock-critical',name:'Sas extérieur',x:1370,z:0,w:45,d:380,h:200,reach:90,initialOpen:false,powered:true,manual:false,critical:true}],
    props:[{id:'cargo-console',x:505,z:292,support:'sol de la coursive',type:'console'},{id:'loader',x:1096,z:86,support:'plateforme technique',type:'loader'},{id:'hangar-lamp',x:412,z:25,support:'poutre nord',type:'lamp',circuit:'service'},{id:'airlock-lamp',x:1220,z:24,support:'rail du sas',type:'lamp',circuit:'service'}],
    nodes:[{id:'entry',name:'Zone de fret',x:250,z:198},{id:'threshold',name:'Accès au fret',x:652,z:195},{id:'east',name:'Approche du sas',x:1225,z:206}],
    actors:[player(245,198),ally('hicks','Hicks',179,224),{id:'newt',name:'Newt',kind:'escort',role:'child',x:175,z:275,radius:11,hp:100,ammo:0,speed:125},enemy('hangar-contact',982,180)]})
];
export function sceneById(id){return VALIDATION_SCENES.find(s=>s.id===id)||null;}
