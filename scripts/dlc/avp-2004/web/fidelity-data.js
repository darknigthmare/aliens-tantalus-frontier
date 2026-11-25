
/* v0.11: reference coverage is separate from playability. No remote travel or free weapon unlock. */
(function(G){'use strict';const D=G.AVP_DATA;
D.version='0.11.0';D.releaseName='Les lieux et leurs traces';D.subtitle='Les lieux et leurs traces.';
// Schema 10 is deliberately retained: additions are data/appearance, not a change to persisted fields.
const R=new Map(D.rooms.map(r=>[r.id,r]));
function room(id,name,biome,mode,width,floor,mood,design){const r={id,name,biome,mode,width,floor,mood,design,doors:[],props:[],solids:[],collectibles:[],sceneOnly:false,map:[0,0],sector:biome==='ship'?'Piper Maru':'Pyramide',continuity:{source:'Lieu référencé ; implantation et raccord de jeu originaux, non plan métrique du film',floor,datum:'Niveaux relatifs de gameplay, pas des mètres.'}};D.rooms.push(r);R.set(id,r);D.codex.push({id:'room-'+id,category:'Lieux',title:name,text:mood+' '+design,unlockRoom:id});return r;}
room('bridge','Piper Maru · Passerelle','ship','DEPTH',1900,0,'Les relevés commencent ici.','Console thermique, poste radio, table de navigation et baies sur la mer. Accès par la superstructure du pont ; aucune porte vers le temple.');
room('shaft','Pyramide · Puits central','temple','HYBRID',2200,-3,'Un vide au cœur des murs.','Puits protégé au second plan, passerelle continue et rails verticaux. La galerie de visite est reliée à la croisée ; les niveaux visibles ne sont pas des portes fictives.');
room('eggworks','Pyramide · Distribution des œufs','hive','DEPTH',2100,-3,'La pierre transporte ce que la Reine produit.','Rails et berceaux d’œufs au fond, piliers latéraux et allée avant libre. L’animation n’est pas une simulation de circulation entre salles.');
room('cocoonhall','Pyramide · Salle des cocons','hive','DEPTH',1950,-4,'Des membres de l’expédition manquent à l’appel.','Tableau distinct de la rencontre de Lex avec Sebastian : Miller et Verheiden dans la résine, arme abandonnée et alvéoles d’œufs. Raccord condensé du récit.');
function connect(a,b,x,y,gate=null){const ra=R.get(a),rb=R.get(b);for(const [r,to,xx,yy] of [[ra,rb,x,y],[rb,ra,105,144]])r.doors.push({id:r.id+'--'+to.id,to:to.id,pair:to.id+'--'+r.id,x:xx,y:yy,gate,phases:null,kind:'door',label:to.name,levelDelta:to.floor-r.floor});}
connect('maru','bridge',850,65);connect('pivot','shaft',1290,65,'plasma');connect('incubator','eggworks',1390,65,'alliance');connect('nursery','cocoonhall',850,65,'alliance');
// Clear former dressing from new apertures. No collision box was attached to these two props.
R.get('maru').props.find(p=>p.id==='maru-p02').x=970;
R.get('nursery').props.find(p=>p.id==='nursery-p02').x=990;
R.get('gantry').doors.find(d=>d.to==='drain').y=65;
// Verheiden was incorrectly borrowing the generic guard artwork.
const vd=D.encounters.find(e=>e.id==='verheiden-coffre');if(vd)vd.actor='verheiden';
D.filmActors=[
 {id:'stafford-brief',asset:'stafford',name:'Stafford',room:'brief',x:1140,y:166,from:0,to:3,height:111},
 {id:'stafford-weapons',asset:'stafford',name:'Stafford',room:'weapons',x:1510,y:182,from:6,to:8,height:111},
 {id:'rousseau-landing',asset:'rousseau',name:'Rousseau',room:'landing',x:1180,y:121,from:2,to:5,height:110},
 {id:'parks-landing',asset:'parks',name:'Parks',room:'landing',x:1350,y:180,from:2,to:5,height:113},
 {id:'quinn-station',asset:'quinn',name:'Quinn',room:'station',x:1990,y:117,from:2,to:4,height:116},
 {id:'quinn-bore',asset:'quinn',name:'Quinn',room:'bore',x:340,y:104,from:4,to:7,height:116},
 {id:'connors-station',asset:'connors',name:'Connors',room:'station',x:1900,y:188,from:2,to:5,height:111},
 {id:'rousseau-sacrifice',asset:'rousseau',name:'Rousseau',room:'sacrifice',x:620,y:92,from:5,to:7,height:110},
 {id:'parks-sacrifice',asset:'parks',name:'Parks',room:'sacrifice',x:1130,y:96,from:5,to:7,height:113},
 {id:'miller-cocoon',asset:'miller',name:'Miller',room:'cocoonhall',x:810,y:76,from:12,to:15,height:104,pose:'cocoon'},
 {id:'verheiden-cocoon',asset:'verheiden',name:'Verheiden',room:'cocoonhall',x:1390,y:77,from:12,to:15,height:108,pose:'cocoon'}
];
// Fixed stage dressing. "Visible" does not mean collectible, usable or independently animated.
D.filmProps=[];
function p(room,asset,x,y,height,from=0,to=20,owner='',catalog=[]){const o={id:'film-'+room+'-'+D.filmProps.length,room,asset,x,y,height,from,to,owner,catalog};D.filmProps.push(o);return o;}
for(const [a,x,h] of [['film-g36c',260,52],['film-desert-eagle',415,42],['film-beretta',520,34],['film-flare-pistol',640,43],['film-piton',790,42],['film-analysis-kit',1010,48],['film-scanner',1130,45]])p('gear',a,x,66,h,0,20,'Expédition');
for(const [a,x,h] of [['film-headset',260,218],['film-crampons',440,220],['film-video',630,220],['film-camera',820,220],['film-samplecase',1100,220]])p('gear',a,x,h,39,0,20,'Expédition');
p('gear','film-dagger',510,216,28,0,20,'Sécurité');
p('bridge','film-radio-console',360,74,98);p('bridge','film-radio-console',820,72,93);p('bridge','thermalmap',1230,70,100);p('bridge','maptable',1510,81,132);p('bridge','film-satphone',1750,72,53);p('bridge','film-headset',700,82,42);p('bridge','film-notebook',1570,87,44);p('bridge','binoculars',1720,219,54);
p('brief','film-notebook',625,87,38,0,20,'Sebastian');p('brief','film-scanner',1120,77,45,0,20,'Scientifiques');
p('refuge','film-inhaler',610,83,35,0,12,'Weyland');
p('landing','film-snowcat',520,77,185,0,20,'Expédition');p('landing','film-beacon',1160,73,68);p('landing','film-drop-pod',1690,73,125,7,20,'Yautja');
p('weapons','film-caster',835,72,37,0,7,'Chasseurs');p('weapons','film-caster',902,72,37,0,7,'Chasseurs');p('weapons','film-caster',969,72,37,0,7,'Chasseurs');
p('hunter','film-shuriken',1100,81,38,12,18,'Scar');p('hunter','film-combistick',1260,79,34,12,18,'Scar');p('hunter','film-wrist-unit',760,81,36,12,18,'Scar');p('hunter','film-dagger',560,82,30,12,18,'Scar');
p('duel','film-netgun',890,80,40,7,20,'Celtic');
p('shaft','railingstone',530,84,100);p('shaft','railingstone',1450,84,100);p('shaft','chain',720,71,290);p('shaft','chain',1600,70,290);p('shaft','relief',1910,77,145);p('shaft','rubble',1250,224,80);
for(const x of [400,780,1160,1540])p('eggworks','film-egg-rail',x,80,118,0,20,'Pyramide');
p('eggworks','film-queen-hoist',1810,76,181);p('eggworks','resin',1870,227,121);
p('cocoonhall','cocoon',810,80,170);p('cocoonhall','cocoon',1390,80,170);p('cocoonhall','eggs',560,225,105);p('cocoonhall','egg-open',1690,230,91);p('cocoonhall','film-desert-eagle',1120,211,32,12,20,'Miller');p('cocoonhall','resin',320,71,170);p('cocoonhall','resin',1790,73,180);
p('queenhold','film-queen-hoist',1750,54,340);p('queenhold','film-wrist-unit',640,75,40,14,15,'Scar');p('tanks','film-piton',1050,80,54,0,20,'Lex');

// Lay out the human equipment on two real tables instead of scattered on the walking floor.
D.fidelityBenches=[{x:215,y:222,w:955,lift:45},{x:230,y:81,w:900,lift:29}];
const gearProps=D.filmProps.filter(p=>p.room==='gear');
for(const [i,p] of gearProps.entries()){
 if(i<7){p.y=222;p.lift=45;p.height=34;}
 else {p.x=270+(i-7)*137;p.y=81;p.lift=29;p.height=30;}
 p.mount='table';
}
R.get('gear').solids.push({id:'equipment-table-front',x:215,y:213,w:955,h:30},{id:'equipment-table-back',x:230,y:57,w:900,h:36});

// Actual structural blockers in the new rooms. The central band stays navigable in CLASSIC.
for(const [id,rects] of Object.entries({bridge:[{x:305,y:52,w:110,h:48},{x:1460,y:59,w:100,h:45}],shaft:[{x:800,y:40,w:530,h:60}],eggworks:[{x:315,y:50,w:150,h:43},{x:1110,y:55,w:140,h:45}],cocoonhall:[{x:480,y:209,w:115,h:40}]}))R.get(id).solids.push(...rects.map((r,i)=>({...r,id:id+'-architecture-'+i})));
const direct=new Set(['maru','landing','station','bore','forecourt','sacrifice','ossuary','weapons','pivot','press','duel','glyphs','hunter','nursery','queenhold','tanks','icebattle','elder','vessel','bridge','shaft','eggworks','cocoonhall']);
D.architecture={version:1,referenceCut:'Cinéma 2004 ; Unrated et scènes supprimées séparés',doorCount:0};
const outside=new Set(['landing','station','forecourt','tanks','icebattle','elder']);
for(const r of D.rooms){
 r.referenceKind=direct.has(r.id)?'Lieu / fonction du film, dimensions adaptées':'Raccord ou annexe de gameplay original';
 r.continuity ||= {};r.continuity.source=r.referenceKind+' ; implantation non métrique';
 for(const d of r.doors){
  const target=R.get(d.to);d.levelDelta=target.floor-r.floor;
  const edge=d.x<180?'left':d.x>r.width-185?'right':d.y>200?'front':'back';
  let kind=d.kind==='transport'?'transport':d.kind==='vent'?'duct':d.kind==='rope'?'rope':d.levelDelta>0?'stair-up':d.levelDelta<0?'stair-down':'door';
  if(d.levelDelta===0&&d.kind==='stairs')kind='gallery';
  if(outside.has(r.id)&&outside.has(d.to))kind='path';
  d.arch={anchor:edge,type:kind,material:r.biome==='ship'?'steel':r.biome==='timber'?'wood':'stone',width:kind==='duct'?115:98,height:kind==='duct'?70:180,physicalFrame:!['path','transport','rope'].includes(kind),label:kind==='path'?'Chemin extérieur continu':kind==='transport'?'Embarquement en hélicoptère':kind==='rope'?'Ancrage et ouverture du tunnel':edge==='back'?'Ouverture dans la paroi arrière':edge==='front'?'Retour de galerie au premier plan':'Ouverture dans un mur de retour'};
  if(r.id==='station'&&edge==='back'){d.arch.facade=true;d.arch.label='Porte intégrée à la façade visitable';}
  if(r.id==='maru'&&edge==='back'){d.arch.facade=true;d.arch.label='Porte de la superstructure du navire';}
  D.architecture.doorCount++;
 }
}
D.fidelityAudit=G.AVP_FIDELITY_CATALOG;
D.fidelityNotes=[
 ['Le film et ses versions','Les 250 fiches du catalogue sont auditées séparément du contenu jouable. Les scènes Unrated et supprimées ne sont pas fusionnées à la campagne cinéma.'],
 ['Une porte appartient à un mur','Chaque seuil est associé à un mur de retour, une façade, un accès de corde, un conduit ou un chemin extérieur. Les arcs posés seuls dans la neige ont été retirés.'],
 ['Du navire à la neige','Le Piper Maru et la zone d’arrivée sont reliés par un transport en hélicoptère, pas par une porte. Le vol est abrégé, et le véhicule n’est pas pilotable.'],
 ['Le tunnel nous précède','Le conduit thermique est déjà ouvert à l’arrivée de l’expédition. Le matériel de Quinn ne doit pas être présenté comme son origine.'],
 ['L’arme reste à son propriétaire','Les armes de la sécurité et des chasseurs sont visibles sur leurs porteurs ou dans les scènes. Elles ne deviennent pas toutes des armes utilisables par Lex.'],
 ['Trois masques distincts','Scar, Celtic et Chopper utilisent trois dessins de masque. Chopper porte deux trophées dorsaux et de longues lames ; l’Ancien est représenté à visage découvert.'],
 ['L’équipement change avec le récit','Le canon de Scar n’apparaît sur lui qu’après l’alliance. Les marques de Grid attendent le filet. La tenue de Lex est rouge, avec une variante marquée en fin de parcours.'],
 ['Une référence n’est pas une preuve de présence','Le registre indique ACTIF, SCENE, LIEU, DOCUMENT, ABSENT, A_VERIFIER ou HORS_CAMPAGNE pour chaque identifiant. Une ligne documentaire ne compte pas comme une arme jouable.'],
 ['Les annexes ne sont pas des décors attestés','Dortoir, réserves, contrepoids et autres raccords sont identifiés comme extensions de gameplay lorsqu’un plan de film n’est pas établi.'],
 ['Les lieux encore hors parcours','Le recrutement au Népal et en Italie, le centre satellitaire, la station en 1904 et le flashback ancien ne sont pas des niveaux jouables de cette livraison.'],
 ['Pas de pourcentage trompeur','Des portes cohérentes et des silhouettes corrigées ne prouvent pas une fidélité 1:1. Proportions, visages, animations et couverture plan par plan restent à approfondir.'],
 ['Les sauvegardes ne changent pas de sens','Schéma 10 conservé : apparences et registre dépendent des étapes déjà sauvegardées. Aucune ancienne arme ni étape n’est ajoutée artificiellement.']
].map((v,i)=>({id:'fidelity-'+i,category:'Fidélité',title:v[0],text:v[1],unlockRoom:'maru'}));D.codex.push(...D.fidelityNotes);
// Presence corrections are authored once in tools/build-fidelity-data.py.
for(const c of D.codex){if(c.id==='party-limites-compagnons')c.text='Les compagnons ont une santé simulée et peuvent être relevés. Leurs départs restent scénarisés ; les ordres ne réécrivent pas leurs destins.';}
G.AVP_FIDELITY={asset(id,s,context={}){
 if(id==='lex'&&s.flags.line)return 'lex-marked';
 if(id==='scar'){if(s.flags.line||context.epilogue||s.flags.queen)return 'scar-unmasked';if(!s.flags.alliance)return 'scar-unarmed';}
 if(id==='grid'&&!s.flags.duel&&(s.duelTime||0)<5)return 'xeno';
 return id;
},actors(s){return D.filmActors.filter(a=>a.room===s.room&&s.chapter>=a.from&&s.chapter<a.to);},props(s){return D.filmProps.filter(p=>p.room===s.room&&s.chapter>=p.from&&s.chapter<p.to);}};
})(globalThis);

