/** V11: fidelity pass — sourced sets/crew/equipment, spatially coherent but not metric screen blueprints. */
import fs from 'node:fs';
import {blocked,findPath,visible} from '../src/alien-earth-core.js';
const root=new URL('../',import.meta.url);
const D=JSON.parse(fs.readFileSync(new URL('data/base-v10.json',root)));
D.version='11.0.0';D.schema=11;D.edition='V11 · Décors, équipage et arsenal';D.subtitle='Le navire derrière les portes';
D.description='Campagne autonome en profondeur. Passe de fidélité saison 1 : nouveaux intérieurs sourcés, équipage du Maginot, armes distinguées et audit architectural. Les raccords restent des reconstitutions lorsque les plans métriques publics manquent.';
const roomBy=id=>D.rooms.find(r=>r.id===id);
const chapBy=id=>D.chapters.find(c=>c.id===id);
const src=[
 {id:'LATIMES_SETS',title:'Los Angeles Times — production design Alien: Earth',url:'https://www.latimes.com/entertainment-arts/tv/story/2025-09-09/alien-earth-production-design',note:'Maginot : réfectoire presque identique, passerelle proche, MU/TH/UR agrandie, cryostase étendue ; Zoo, réfectoire et engineering construits avec corridors interconnectés. Ne fournit pas un plan métrique complet.'},
 {id:'FX_IMMERSIVE',title:'FX — Alien: Earth immersive experience',url:'https://www.fxnetworks.com/shows/alien-earth/immersive',note:'Références spatiales/personnages et chambre de confinement du Maginot ; pas un blueprint exhaustif.'},
 {id:'FX_INSIDE',title:'FX — Inside Alien: Earth',url:'https://www.fxnetworks.com/shows/alien-earth/inside-alien-earth',note:'Accès aux dossiers production design, costumes et armurerie ainsi qu’au set tour.'},
 {id:'ASC_MAGINOT',title:'American Cinematographer — building the Maginot',url:'https://theasc.com/articles/alien-earth-the-uscss-maginot',note:'Structures familières : cryogénie en pétales, coursives d’ingénierie, réfectoire hexagonal.'},
 {id:'EP05_SPACES',title:'AVPGalaxy — Episode 5 In Space, No One…',url:'https://www.avpgalaxy.net/tv/alien-earth/episodes/season-1/in-space-no-one/',note:'Medbay One, engineering bay, engine room, passerelle et équipage du Maginot ; source secondaire de continuité, pas plan exact.'},
 {id:'FX_SETTOUR',title:'FX / set tour — Neverland interiors',url:'https://www.dailymotion.com/video/x9qzt7c',note:'Set tour : espaces domestiques, medical bay, lobby, atrium, talking room et secure lab/egg room. Disposition de jeu reconstituée.'},
 {id:'IMFDB_WEAPONS',title:'IMFDB — Alien: Earth',url:'https://www.imfdb.org/wiki/Alien:_Earth',note:'Identification visuelle secondaire : MCS-X sur Steyr AUG, sidearm Prodigy sur Maxim 9 modifié, pistolets Glock/P80 modifiés sur le Maginot.'},
 {id:'HOOKBARREL_WEAPONS',title:'Hook & Barrel — firearms of Alien: Earth',url:'https://www.hookandbarrel.com/entertainment/alien-earth-guns/',note:'Références secondaires : Maxim 9, KRISS Vector et plateformes de confinement. À recouper image par image avant certification totale.'}
];
for(const s of src)if(!D.sources.some(x=>x.id===s.id))D.sources.push(s);
// Existing high-confidence sets get clearer names/status, without changing mandatory story flow.
Object.assign(roomBy('R17'),{title:'Chambre cryogénique étendue',setDressing:'cryo-extended',geometryStatus:'Lieu attesté ; dimensions et connexions de jeu reconstituées'});
Object.assign(roomBy('R19'),{title:'Coursive d’ingénierie du Maginot',setDressing:'engineering-corridor',geometryStatus:'Coursive/engineering attestée ; géométrie de jeu adaptée'});
roomBy('R17').fidelity={status:'lieu attesté · géométrie adaptée',source:'LATIMES_SETS',geometry:'reconstitution non métrique'};
roomBy('R19').fidelity={status:'lieu attesté · géométrie adaptée',source:'ASC_MAGINOT',geometry:'reconstitution non métrique'};
for(const id of ['R59','R60','R61']){const r=roomBy(id);r.fidelity={status:'lieu attesté · raccords reconstitués',source:'LATIMES_SETS',geometry:'aucun blueprint métrique public obtenu'};}
// New sourced interiors. Tasks/archives are original gameplay text and stay optional.
const rooms=[
 {id:'R63',chapter:'C05',title:'Medbay One',kit:'maginot',set:'medbay',level:'Maginot · pont médical',source:'EP05_SPACES',speaker:'Zaveri',task:'Vérifier la quarantaine médicale',text:'Medbay One est isolée du trafic principal. Le relevé confirme une quarantaine locale ; il ne reconstitue pas toute la séquence de l’épisode.',width:2200},
 {id:'R64',chapter:'C05',title:'Salle des machines · Engineering Room',kit:'maginot',set:'engine-room',level:'Maginot · propulsion',source:'LATIMES_SETS',speaker:'Shmuel',task:'Tracer le transfert des fonctions',text:'Le moteur et les auxiliaires alimentent le navire. Le plan de jeu relie cette salle aux coursives d’ingénierie sans prétendre reproduire leurs distances filmées.',width:2500},
 {id:'R65',chapter:'C05',title:'Chambre de confinement du Maginot',kit:'maginot',set:'maginot-containment',level:'Maginot · transport des spécimens',source:'FX_IMMERSIVE',speaker:'Morrow',task:'Inspecter les chaînes de confinement',text:'La chambre de confinement est traitée comme un volume distinct du Zoo. Les chaînes et dispositifs sont représentés ; la chorégraphie précise des plans reste condensée.',width:2300},
 {id:'R66',chapter:'C01',title:'Lobby de Neverland',kit:'neverland',set:'neverland-lobby',level:'Neverland · pavillon principal',source:'FX_SETTOUR',speaker:'Curly',task:'Repérer les accès du pavillon',text:'Le lobby donne une lecture commune des accès. Sa présence s’appuie sur le set tour ; les raccords exacts avec les pièces voisines sont reconstruits pour le jeu.',width:2200},
 {id:'R67',chapter:'C01',title:'Atrium de Neverland',kit:'neverland',set:'neverland-atrium',level:'Neverland · pavillon principal',source:'FX_SETTOUR',speaker:'Kirsh',task:'Examiner l’atrium',text:'L’atrium articule le pavillon dans cette reconstitution. Les volumes restent stylisés et ne constituent pas un plan officiel du complexe.',width:2450},
 {id:'R68',chapter:'C01',title:'Salle d’entretien (« Talking Room »)',kit:'neverland',set:'talking-room',level:'Neverland · pavillon des hybrides',source:'FX_SETTOUR',speaker:'Dame Sylvia',task:'Consigner l’entretien',text:'La salle d’entretien est présente dans le set tour. La conversation jouable est originale et aucune réplique de la série n’est reproduite.',width:1900},
 {id:'R69',chapter:'C04',title:'Baie médicale de Neverland',kit:'neverland',set:'neverland-medbay',level:'Neverland · aile médicale',source:'FX_SETTOUR',speaker:'Dame Sylvia',task:'Contrôler le poste médical',text:'La baie médicale existe dans le complexe vu en production. Son raccord aux zones de quarantaine est une reconstitution de gameplay.',width:2250},
 {id:'R70',chapter:'C04',title:'Laboratoire sécurisé · salle des œufs',kit:'neverland',set:'secure-lab',level:'Neverland · laboratoire sécurisé',source:'FX_SETTOUR',speaker:'Kirsh',task:'Observer le laboratoire sécurisé',text:'Le laboratoire sécurisé conserve les œufs derrière ses propres seuils. Les dispositifs sont stylisés et ne reproduisent pas image par image le décor de tournage.',width:2500}
];
const propsBy={
 medbay:['stretcher','medical-cart','cabinet','console','stretcher','medical-cart','cabinet','wall-panel'],
 'engine-room':['coolant-unit','pipe','console','coolant-unit','pipe','data-stack','valve-post','wall-panel'],
 'maginot-containment':['tank','cargo','rope-reel','console','tank','barrier','cargo','wall-panel'],
 'neverland-lobby':['bench','planter','console','bench','wall-map','planter','counter','wall-panel'],
 'neverland-atrium':['planter','bench','tree','console','planter','bench','tree','wall-panel'],
 'talking-room':['sofa','bench','console','wall-panel','planter','cabinet','bench','wall-light'],
 'neverland-medbay':['stretcher','medical-cart','cabinet','console','stretcher','counter','cabinet','wall-light'],
 'secure-lab':['tank','containment-pad-v5','console','tank','data-stack','barrier','tank','wall-panel']
};
for(const q of rooms){
 const n=+q.id.slice(1), r={id:q.id,chapter:q.chapter,index:n-1,title:q.title,kit:q.kit,mode:'DEPTH',width:q.width,level:q.level,source:[q.source],optional:true,architecture:'reference-v11',geometryStatus:'Lieu attesté ; plan et raccords adaptés',landmark:q.title,setDressing:q.set,task:{id:`AE-${n}`,room:q.id,kind:'field',label:q.task,x:q.width-420,z:125,speaker:q.speaker,dialogue:q.text,duration:2.5,optional:true,reward:null},archive:{id:`AR-${n}`,title:q.title+' — relevé',text:q.text,x:q.width-760,z:125},props:[],enemies:[],spawn:{x:140,z:125},portals:[],passages:[80,140,q.width-760,q.width-420,q.width-80],narrative:{enter:q.text,canonBoundary:'Lieu de référence ; texte, objectif et connectivité exacte sont des adaptations originales.'},ambience:q.chapter==='C05'?'ventilation':'wind',dark:q.set==='secure-lab'||q.set==='engine-room',systems:{},interactables:[],vents:[],floorRegions:[{id:q.id+'-quiet',x:400,z:91,w:240,d:66,material:'quiet',noise:.62,label:'Revêtement souple',mark:'soft'},{id:q.id+'-tile',x:900,z:91,w:240,d:66,material:'tile',noise:1,label:'Dalles',mark:'tile'}],network:q.chapter,naturalLight:q.chapter!=='C05'};
 const types=propsBy[q.set];types.forEach((type,j)=>{const back=j%2===0;r.props.push({id:`${q.id}-v11-${j}`,type,x:250+j*235,z:back?7:205,w:type==='tree'?80:145,d:type==='tree'?34:19,h:['tank','coolant-unit'].includes(type)?165:type==='tree'?180:135,solid:true});});
 for(let j=0;j<5;j++)r.props.push({id:`${q.id}-v11-light-${j}`,type:j%2?'wall-panel':'wall-light',x:160+j*350,z:0,w:55,d:0,h:80,solid:false});
 r.fidelity={status:'lieu attesté · géométrie et raccords adaptés',source:q.source,geometry:'reconstitution non métrique'};
 D.rooms.push(r);(chapBy(q.chapter).extensions||=[]).push(q.id);
}
function connect(a,b,requires=[]){
 for(const [from,to] of [[a,b],[b,a]]){
  const r=roomBy(from);if(r.portals.some(p=>p.to===to))continue;
  r.portals.push({id:`${from}>${to}`,to,x:Math.round(r.width*.52),z:25,arrivalX:140,arrivalZ:125,label:'Accès · '+roomBy(to).title,reverse:`${to}>${from}`,kind:'door',requires:[...requires],shortcut:false,referenceV11:true,requireLabel:requires.length?'Accès après le contrôle principal du secteur':''});
 }
}
// Coherent loops. They are gameplay reconstructions, not claims of exact set adjacency.
connect('R02','R66',['AE-02']);connect('R66','R67',['AE-02']);connect('R67','R68',['AE-02']);connect('R68','R04',['AE-02']);
connect('R13','R69',['AE-13']);connect('R69','R14',['AE-13']);connect('R14','R70',['AE-14']);connect('R70','R16',['AE-14']);
connect('R17','R63',['AE-17']);connect('R63','R59',['AE-17']);connect('R19','R64',['AE-18']);connect('R64','R60',['AE-18']);connect('R18','R65',['AE-18']);connect('R65','R19',['AE-18']);
const audit={version:D.version,scope:'Audit des seuils du jeu ; aucune métrique de plateau de tournage revendiquée',newRooms:rooms.map(r=>r.id),newLinks:[],relocated:[],failures:[],allThresholds:[]};
// Anchor only new V11 thresholds while retaining every audited V10 threshold exactly.
for(const r of D.rooms){
 const occupied=r.portals.filter(p=>p.kind==='door'&&!p.referenceV11&&p.anchor?.kind==='rear-wall').map(p=>p.x);
 for(const p of r.portals.filter(p=>p.referenceV11)){
  if(r.mode==='SIDE')r.mode='HYBRID';const before={x:p.x,z:p.z};const candidates=[];
  for(let x=230;x<=r.width-230;x+=20){const pt={x,z:25};if(blocked(r,x,25)||!findPath(r,r.spawn,pt).length)continue;if([...occupied,...r.portals.filter(q=>q.referenceV11&&q!==p&&q.anchor).map(q=>q.x)].some(q=>Math.abs(q-x)<175))continue;if([r.task,r.archive,...r.interactables].some(q=>Math.abs(q.x-x)<120&&Math.abs(q.z-25)<75))continue;if(r.props.some(q=>q.solid&&q.z<65&&x>q.x-85&&x<q.x+q.w+85))continue;candidates.push(pt);}
  candidates.sort((a,b)=>Math.abs(a.x-before.x)-Math.abs(b.x-before.x));if(!candidates.length)throw Error('No V11 wall threshold '+p.id);Object.assign(p,candidates[0]);p.anchor={kind:'rear-wall',structure:'wall-recess',reason:'Embrasure adossée au mur arrière'};occupied.push(p.x);r.passages=[...new Set([...r.passages,p.x])].sort((a,b)=>a-b);if(before.x!==p.x||before.z!==p.z)audit.relocated.push({id:p.id,before,after:{x:p.x,z:p.z}});
 }
}
// Recompute arrivals only for new links against the actual reciprocal threshold.
for(const r of D.rooms)for(const p of r.portals.filter(p=>p.referenceV11)){
 const dst=roomBy(p.to),back=dst.portals.find(q=>q.id===p.reverse);if(!back)throw Error('Broken V11 return '+p.id);
 const cand=back.anchor?.kind==='left-wall'?[{x:back.x+65,z:back.z}]:back.anchor?.kind==='right-wall'?[{x:back.x-65,z:back.z}]:[{x:back.x,z:back.z+70},{x:back.x+65,z:back.z},{x:back.x-65,z:back.z}];
 const pt=cand.find(q=>!blocked(dst,q.x,q.z)&&visible(dst,q,back)&&findPath(dst,dst.spawn,q).length);if(!pt)throw Error('No safe V11 arrival '+p.id);p.arrivalX=pt.x;p.arrivalZ=pt.z;p.label='Accès · '+dst.title;audit.newLinks.push({id:p.id,to:p.to,x:p.x,z:p.z,arrivalX:p.arrivalX,arrivalZ:p.arrivalZ});
}
for(const r of D.rooms)r.passages=[...new Set([...r.passages,r.task.x,r.archive.x,...r.interactables.map(i=>i.x),...r.portals.map(p=>p.x)])].sort((a,b)=>a-b);
D.links=D.rooms.flatMap(r=>r.portals.filter(p=>p.kind==='door').map(p=>({fromRoom:r.id,to:p.to,door:p.id,requires:p.requires||[],shortcut:!!p.shortcut})));
// Expanded crew reference registry. It documents appearance intent, not automatic NPC presence.
const extraCast=[
 ['zaveri','Dr. Zaveri','#a77b60','#201d1b','#c5c0a5','#4b514d','tied',false,'Médecin/scientifique du Maginot ; silhouette de registre dédiée, uniforme de bord stylisé.','FX_IMMERSIVE'],
 ['rahim','Rahim','#6d4a36','#181717','#989a8b','#4b514f','short',true,'Équipage du Maginot ; silhouette dédiée, détails de scène encore à affiner.','FX_IMMERSIVE'],
 ['chibuzo','Chibuzo','#6f4c37','#171615','#9c9b89','#51544c','short',true,'Membre d’équipage du Maginot ; tenue de bord stylisée.','EP05_SPACES'],
 ['shmuel','Shmuel','#d1ad93','#3d3129','#ada993','#555950','sidepart',true,'Ingénierie du Maginot ; tenue de travail stylisée, pas de visage photoréaliste.','EP05_SPACES'],
 ['malachite','Malachite','#a97b5c','#211e1b','#858d83','#464c47','tousled',false,'Technicien de l’engineering bay ; silhouette dédiée.','EP05_SPACES'],
 ['clem','Clem','#c39a7e','#725849','#9c9a88','#50554e','short',false,'Équipage du Maginot ; profil visuel provisoire, variantes à compléter.','EP05_SPACES'],
 ['petrovich','Petrovich','#c1a086','#342c28','#8e958b','#4d514e','receding',true,'Équipage du Maginot ; profil visuel provisoire.','EP05_SPACES'],
 ['teng','Teng','#c79e7b','#22201d','#9da092','#525751','short',false,'Équipage du Maginot ; profil visuel provisoire.','EP05_SPACES'],
 ['sullivan','Sullivan','#b8876a','#30241f','#8c9288','#4b504b','sidepart',false,'Équipage du Maginot ; profil visuel provisoire.','EP05_SPACES']
];
for(const [id,name,skin,hair,coat,pants,style,beard,note,source] of extraCast)if(!D.referenceCast.some(c=>c.id===id))D.referenceCast.push({id,name,skin,hair,coat,pants,style,beard,note,source,status:'silhouette sourcée mais stylisée ; variantes de scène incomplètes'});
Object.assign(D.speakerRoles,{'Zaveri':'zaveri','Dr. Zaveri':'zaveri','Rahim':'rahim','Chibuzo':'chibuzo','Shmuel':'shmuel','Malachite':'malachite','Clem':'clem','Petrovich':'petrovich','Teng':'teng','Sullivan':'sullivan'});
// Equipment registry: expose more known screen weapons without pretending every background prop is playable.
D.fidelity.sources=[...(D.fidelity.sources||[]),...src.filter(s=>!(D.fidelity.sources||[]).some(x=>x.id===s.id))];
const upsert=(item)=>{const i=D.fidelity.equipment.findIndex(x=>x.id===item.id);if(i>=0)D.fidelity.equipment[i]={...D.fidelity.equipment[i],...item};else D.fidelity.equipment.push(item);};
upsert({id:'mcsx',name:'MCS-X · fusil Prodigy',status:'jouable · dotation principale de Joe',source:'IMFDB_WEAPONS',note:'Silhouette Steyr AUG modifiée ; mécanique de tir du module, pas reproduction balistique certifiée.'});
upsert({id:'maxim9',name:'Maxim 9 modifié · sidearm Prodigy',status:'jouable · secondaire de Joe',source:'IMFDB_WEAPONS',note:'Secondaire sélectionnable ; partage encore la réserve abstraite du système d’armes, capacité exacte à raffiner.'});
upsert({id:'wy-pistol',name:'Pistolet de bord Maginot · Glock/P80 modifié',status:'jouable · dotation Morrow',source:'IMFDB_WEAPONS',note:'Silhouette rapprochée du pistolet observé ; accessoires exacts variant selon les plans.'});
upsert({id:'kriss',name:'KRISS Vector · sécurité Prodigy',status:'représenté / registre · non jouable',source:'HOOKBARREL_WEAPONS',note:'Présence visuelle référencée ; pas encore distribué au joueur.'});
D.fidelity.locationScope='Références saison 1 étendues. Les lieux explicitement attestés sont marqués séparément des annexes originales et des raccords reconstitués.';
D.fidelity.layout='Aucun blueprint métrique exhaustif public obtenu : toute adjacency ajoutée en V11 est un raccord jouable cohérent, pas une certification du plan de plateau.';
D.fidelity.missing=[
 'Plans métriques complets et positions exactes de toutes les portes/corridors des décors de tournage.',
 'Inventaire image par image de toutes les pièces secondaires des huit épisodes, y compris sanitaires, zones de service et variantes de corridors.',
 'Toutes les armes et accessoires de fond rendus jouables : plusieurs dotations sécurité restent représentées seulement.',
 'Visages photoréalistes, animations faciales et toutes les variantes de coiffure/tenue/blessure par scène.',
 'Chorégraphies 1:1 des combats, déplacements caméra, cinématiques, dialogues et durées exactes.',
 'Architecture extérieure complète de New Siam/Neverland à l’échelle réelle et continuité 3D entre tous les intérieurs.'
];
for(const r of rooms)roomBy(r.id).fidelity={status:'lieu attesté · plan/raccord adapté',source:r.source,geometry:'reconstitution non métrique'};
const rules=[
 'Un lieu peut être attesté sans que sa position relative soit attestée : le codex distingue les deux.',
 'Les nouvelles pièces de référence restent facultatives et n’entrent pas dans les quatre objectifs principaux d’un chapitre.',
 'Un accès V11 est placé sur une embrasure arrière atteignable ; il ne flotte pas au milieu du sol.',
 'Chaque nouvelle face possède une face réciproque et un point d’arrivée dégagé recalculé depuis celle-ci.',
 'Medbay One, engineering room, containment room, lobby, atrium, talking room, medical bay et secure lab sont marqués comme lieux attestés, pas comme blueprints exacts.',
 'La cryostase étendue, le réfectoire et la passerelle du Maginot conservent leur identité de décor distincte.',
 'Les membres nommés de l’équipage du Maginot disposent d’un profil visuel dédié lorsqu’ils sont référencés par le jeu.',
 'Un profil visuel dans le registre ne crée pas automatiquement un PNJ dans une scène où sa présence n’est pas simulée.',
 'Joe peut distinguer son MCS-X de son sidearm Maxim 9 ; les deux ne deviennent pas des armes de Morrow.',
 'Le pistolet de Morrow reste visuellement distinct des armes Prodigy.',
 'Le KRISS Vector est signalé comme référence non jouable tant que sa dotation exacte par scène n’est pas simulée.',
 'Les systèmes inventés du DLC restent marqués adaptation et ne sont jamais promus en accessoires officiels.',
 'Les raccords de décor construits sur un même stage peuvent inspirer une boucle cohérente sans être présentés comme une adjacency filmée exacte.',
 'La V11 accepte les sauvegardes V1 à V10 sans accomplir les nouveaux objectifs facultatifs.',
 'Aucun ancien seuil V10 n’est déplacé par la génération V11 ; seuls les nouveaux seuils sont ancrés et audités.',
 'Le statut global demeure fidélité progressive tant qu’un relevé plan par plan complet n’a pas été réalisé.'
];
for(let i=0;i<rules.length;i++)D.rules.push({id:'LD-'+(316+i),category:'Fidélité V11',text:rules[i]});
D.status={...D.status,fidelity:'fidélité progressive sourcée ; lieux élargis, géométrie toujours reconstituée'};
for(const r of D.rooms){for(const p of r.portals.filter(p=>p.kind==='door'))audit.allThresholds.push({id:p.id,room:r.id,to:p.to,kind:p.anchor?.kind||'legacy',x:p.x,z:p.z,logical:p.x<=150||p.x>=r.width-150||p.z<=30||p.hatchKey||p.anchor?.kind==='rear-wall'});}
for(const t of audit.allThresholds)if(!t.logical)audit.failures.push(t);
fs.mkdirSync(new URL('docs/v11/',root),{recursive:true});
fs.writeFileSync(new URL('src/alien-earth-data.js',root),'export const EARTH_DATA = '+JSON.stringify(D)+';\n');
fs.writeFileSync(new URL('docs/ALIEN_EARTH_CONTENT.json',root),JSON.stringify(D,null,2));
fs.writeFileSync(new URL('docs/v11/DOOR_AUDIT_V11.json',root),JSON.stringify(audit,null,2));
console.log(JSON.stringify({version:D.version,rooms:D.rooms.length,connections:D.links.length/2,props:D.rooms.flatMap(r=>r.props).length,rules:D.rules.length,cast:D.referenceCast.length,newLinks:audit.newLinks.length,doorFailures:audit.failures.length}));
