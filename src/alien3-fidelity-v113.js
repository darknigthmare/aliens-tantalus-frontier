/** Fidelity register. Evidence, render status and simulation status are independent.
 * No location is called screen-accurate solely because its graph node exists.
 * Source facts are short paraphrases; no film frames or dialogue are redistributed.
 */
import {compileAlien3StandardV104} from './alien3-dlc-v104.js';
const frozen=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(frozen);Object.freeze(o);}return o;};
export const REFERENCES_V113=frozen([
 {id:'asc-1992',title:'American Cinematographer — entretien Alex Thomson, juillet 1992, republication 2019',url:'https://theasc.com/article/alien3-in-space-they-039-re-still-screaming/',type:'production-interview',fact:'Cadrages bas, plafonds travaillés, acteurs lisibles dans la pénombre ; grande installation de coulée et portique.'},
 {id:'ripley-uniform',title:'Propstore — costume carcéral de Ripley, lot de production',url:'https://propstore.com/product/alien-1992/ripleys-sigourney-weaver-prison-uniform-2/',type:'production-object',fact:'Veste brune matelassée, haut et pantalon assortis ; manteau vert avec insignes ; marquage au dos.'},
 {id:'ripley-crash',title:'Propstore — éléments de costume du crash',url:'https://propstoreauction.com/lot-details/index/catalog/386/lot/126096/Lot-8-Ellen-Ripley-Sigourney-Weaver-Dummy-Paint-and-Hair-Test-Bust-with-Bloodied-Crash-Costume-Components-ALIEN3-1992',type:'production-object',fact:'Haut gris côtelé et tenue courte de la scène du crash ; salissures de production.'},
 {id:'dillon-uniform',title:'Propstore — costume complet de Dillon, lot 25',url:'https://ukm.propstoreauction.com/lot-details/index/catalog/244/lot/66284/Lot-25-ALIEN3-1992-Dillon-s-Charles-S-Dutton-Complete-Costume',type:'production-object',fact:'Ensemble superposé : manteau, veste, capuche, gilet, pantalon et bottes volontairement usés.'},
 {id:'inmate-uniform',title:'Propstore — tenue de détenu de Fiorina 161',url:'https://propstoreauction.com/lot-details/index/catalog/318/lot/95525',type:'production-object',fact:'Vêtements de coton, manteau de toile et capuche imperméable ; manteaux portés dehors.'},
 {id:'pulse-film',title:'Propstore — fusil à impulsion de production Alien 3',url:'https://propstore.com/product/alien-1992/lot-18-hero-pulse-rifle/',type:'production-object',fact:'Arme de l’équipe de récupération de fin de film ; finition noire. Ne constitue pas un équipement initial de Ripley.'},
 {id:'studio-film',title:'20th Century Studios — Alien 3',url:'https://www.20thcenturystudios.jp/movies/alien3',type:'official-synopsis',fact:'La colonie pénitentiaire est vulnérable face à la créature ; ne pas importer un arsenal de Marines pour Ripley.'},
 {id:'cut-register',title:'AVP Galaxy — scènes alternatives / supprimées, repérage secondaire',url:'https://www.avpgalaxy.net/alien-movies/alien-3/deleted-scenes/',type:'secondary-locator',fact:'Piste de comparaison pour les montages. À confirmer scène par scène sur une copie autorisée ; aucun minutage ou plan mesuré inventé.'}
]);
export const PORTAL_CONTRACTS_V113=frozen([
 {id:'f161-infirmary-gate',title:'Séparation entre soins et détention',from:'f161-infirmary',to:'f161-cell-a',wall:'medical',reason:'Fermeture de circulation, encastrée dans une travée qui prolonge les alcôves médicales.',source:'game-adaptation',exactScreenPosition:false},
 {id:'f161-cellblock-gate',title:'Fermeture des galeries',from:'f161-cell-b',to:'f161-service-low',wall:'prison',reason:'Volet de service repris par des montants, avec retours maçonnés et mécanisme supérieur.',source:'game-adaptation',exactScreenPosition:false},
 {id:'f161-leadworks-gate',title:'Seuil de la fonderie',from:'f161-bishop',to:'f161-leadworks',wall:'foundry',reason:'Fermeture industrielle sous une traverse de reprise et une gaine de volet repliable.',source:'game-adaptation',exactScreenPosition:false}
]);
export function bindPortalsV113(scene,doors=scene.gates){const byNode=new Map(scene.nodes.map(n=>[n.id,n]));return PORTAL_CONTRACTS_V113.map(spec=>{const gate=doors.find(d=>d.id===spec.id),edge=scene.edges.find(e=>e.gateId===spec.id),from=byNode.get(spec.from),to=byNode.get(spec.to);if(!gate||!edge||!from||!to)return {...spec,valid:false,error:'missing-link'};const finite=['x','y','w','h'].every(k=>Number.isFinite(gate[k]));if(!finite||gate.w<=0||gate.h<=0)return {...spec,valid:false,error:'geometry'};const x=gate.x,y=gate.y,w=gate.w,h=gate.h,foot=y+h;const across=x>=Math.min(from.x,to.x)&&x+w<=Math.max(from.x,to.x),floor=Math.abs(foot-from.y)<1&&Math.abs(foot-to.y)<1;return {...spec,valid:across&&floor,error:!across?'outside-link':!floor?'floor':null,edgeId:edge.id,opening:{x,y,w,h},foot,housing:{x:x-11,y:y-27,w:w+22,h:20},leftPier:{x:x-12,y:y-7,w:12,h:h+7},rightPier:{x:x+w,y:y-7,w:12,h:h+7},leftReturn:{x:x-66,y:y-19,w:54,h:h+19},rightReturn:{x:x+w+12,y:y-19,w:54,h:h+19},threshold:{x:x-12,y:foot,w:w+24,h:4},collisionOwner:gate.id,openingFraction:Math.max(0,Math.min(1,gate.progress??(gate.open?1:0))),geometrySource:gate.geometrySource||'live'};});}

const cast=(id,name,skin,cloth,coat,shape,ref,equipment=[],status='runtime')=>({id,name,skin,cloth,coat,shape,references:ref,equipment,status,portrait:'vector-interpretation-not-actor-likeness',exact1to1:false});
export const CAST_V113=frozen([
 cast('ripley','Ellen Ripley','#bdab92','#796552','#65705a','slender',['ripley-uniform','ripley-crash'],[]),
 cast('dillon','Dillon','#785237','#5c5144','#514d3e','broad',['dillon-uniform'],[]),
 cast('morse','Morse','#b6a286','#72654e','#5e5d49','lean',['inmate-uniform'],[]),
 cast('aaron','Aaron','#b7a082','#6b6c59','#60694f','stocky',['asc-1992'],[]),
 cast('clemens','Clemens','#c7b69c','#79705e','#827e66','tall',['asc-1992'],['medical-kit'],'catalogue-only'),
 cast('andrews','Andrews','#baa489','#6b6753','#65674f','stocky',['asc-1992'],[],'catalogue-only'),
 cast('golic','Golic','#c2ad8e','#75644c','#6d644d','lean',['cut-register'],[],'catalogue-only'),
 cast('junior','Junior','#b89d7f','#746653','#6b5e49','lean',['cut-register'],[],'catalogue-only'),
 cast('murphy','Murphy','#b8a488','#746953','#5f5f4c','stocky',['cut-register'],['hand-lamp'],'catalogue-only'),
 cast('boggs','Boggs','#b8a388','#6a6050','#5e5b48','lean',['cut-register'],[],'catalogue-only'),
 cast('rains','Rains','#b39b7c','#6c654f','#655d47','stocky',['cut-register'],[],'catalogue-only'),
 cast('bishop-damaged','Bishop endommagé','#b3b2a4','#b5b1a0','#6d7160','damaged',['asc-1992'],['recorder'],'scenery'),
 cast('bishop-representative','Représentant de la Compagnie','#c7b69e','#adae98','#9caa91','tall',['cut-register'],[],'catalogue-only'),
 cast('company-guard','Agent de récupération','#c5bda8','#c4c8b3','#aab4a2','armoured',['pulse-film'],['pulse-rifle'],'arrival-render-only'),
 cast('runner','Runner','#69735b','#27332b','#27332b','quadruped',['asc-1992'],[],'inherited-runtime'),
 cast('hicks','Hicks','#aa947b','#73654f','#5b604f','resting',['studio-film'],[],'catalogue-only'),
 cast('newt','Newt','#c8b99b','#c9c4ae','#aeaf9c','resting',['studio-film'],[],'catalogue-only')
]);
export function costumeV113(id,{phase='',encounter=null}={}){const c=CAST_V113.find(c=>c.id===id)||CAST_V113[0];const crash=id==='ripley'&&!encounter&&['wreckage','arrival','crash'].includes(phase);return {...c,variant:crash?'crash':!encounter&&['shore','coast'].includes(phase)?'overcoat':'prison',cloth:crash?'#98988a':c.cloth,coatVisible:!crash&&(c.id==='dillon'||!encounter&&['shore','coast'].includes(phase)),hair:crash?'short-brown':c.id==='aaron'?'cap':c.id==='morse'?'shaved-stubble':'shaved'};}

const eq=(id,title,owner,role,nodeIds,kinds,ref,truth,notes)=>({id,title,owner,role,nodeIds:nodeIds.split(' ').filter(Boolean),kinds:kinds.split(' ').filter(Boolean),references:ref,evidence:truth,notes});
export const EQUIPMENT_V113=frozen([
 eq('recorder','Enregistreur de l’EEV','ripley','fixed-interaction','f161-flight-analysis-v94','recorder console',['asc-1992'],'scene-to-verify','Console héritée ; nouvel accessoire visuel. Ne crée pas une nouvelle étape du film.'),
 eq('eev','Module de secours','environment','scenery','f161-eev','eev',['ripley-crash'],'production-reference','Coque déjà présente. Le plan et les dimensions exacts ne sont pas certifiés.'),
 eq('medical-kit','Trousse et plateau médical','clemens','scenery','f161-infirmary f161-clemens-bed','tray bottle medical-kit',['asc-1992'],'scene-to-verify','Matériel de soin, pas réserve de soins illimitée pour Ripley.'),
 eq('scanner','Diagnostic de l’EEV','environment','fixed-interaction','f161-eev f161-flight-analysis-v94','monitor diagnostic',['asc-1992'],'scene-to-verify','Écran et éléments diagnostiques, couverture visuelle seulement dans cette passe.'),
 eq('bishop','Bishop endommagé','environment','scenery','f161-bishop','bishop',['asc-1992'],'scene-to-verify','Nouveau fragment de synthétique sur son support ; aucune nouvelle interaction narrative.'),
 eq('comms','Émetteur des communications','environment','fixed-interaction','f161-comms-high','console monitor',['asc-1992'],'scene-to-verify','Équipement fixe raccordé à l’étage existant.'),
 eq('hand-lamp','Lampe portative','prisoners','catalogue','f161-fan-shaft','',['asc-1992'],'scene-to-verify','Forme et porteur à relever ; ne pas confondre avec les huit interrupteurs locaux.'),
 eq('flare','Torche incendiaire','prisoners','visual-state','f161-chemical-store','flare',['asc-1992'],'production-reference','Présence visuelle liée au plan de feu ; pas de nouvelle arme ou de recette réelle.'),
 eq('fuel','Récipients du plan incendiaire','prisoners','scenery','f161-chemical-store','barrel',['asc-1992'],'production-reference','Pas de recette chimique ; les règles historiques restent propriétaires.'),
 eq('axe','Outil lourd improvisé','prisoners','catalogue','','',[],'unverified','Porteur, scène et silhouette doivent être confirmés avant intégration.'),
 eq('wrench','Clé de maintenance','prisoners','scenery','f161-battery-locker-v94','toolboard',['asc-1992'],'scene-to-verify','Outils déjà dessinés dans l’atelier ; leur disponibilité combat n’est pas affirmée.'),
 eq('fan','Ventilateur de galerie','environment','fixed-interaction','f161-fan-shaft','fan',['asc-1992'],'scene-to-verify','Installation fixe avec protection, pas objet d’inventaire.'),
 eq('lead','Plomb de la fonderie','environment','fixed-interaction','f161-leadworks','crucible',['asc-1992'],'production-reference','La coulée exige le déroulement et le volume hérités.'),
 eq('mold','Moule industriel','environment','fixed-interaction','f161-mold','mold',['asc-1992'],'production-reference','Les commandes ne déplacent pas automatiquement le Runner.'),
 eq('hoist','Portique et poche de transfert','environment','scenery','f161-leadworks','gantry hoist ladle',['asc-1992'],'production-reference','Mécanisme visible ; dimensions de jeu, pas relevé 1:1.'),
 eq('water','Réseau de refroidissement','environment','fixed-interaction','f161-water-header f161-sprinkler','valve tank',['asc-1992'],'scene-to-verify','Ne pas confondre la commande de piège avec les purges facultatives.'),
 eq('pulse-rifle','Fusil à impulsion noir','company-guard','arrival-render-only','f161-company','pulse-rifle',['pulse-film'],'production-reference','Sur un agent de récupération à l’arrivée seulement. Aucun transfert à Ripley, aucun tir nouveau.'),
 eq('recovery','Matériel de récupération','company','arrival-render-only','f161-patna-cage-node','recovery case',['pulse-film'],'scene-to-verify','Doit rester absent avant l’arrivée ; échelle et forme à comparer au film.'),
 eq('boots','Bottes de Ripley','ripley','costume','','',['ripley-uniform'],'production-reference','Semelle sombre et tige distincte dans le rig ; géométrie stylisée.'),
 eq('prison-coat','Manteau carcéral','ripley','costume','','',['ripley-uniform'],'production-reference','Vert délavé, insigne simplifié et état extérieur explicite.'),
 eq('bolts','Trois boulons de diversion','ripley','gameplay-original','','',[],'game-original','Mécanique V108 conservée dans les essais de survie ; non déclarée conforme à une scène du film.'),
 eq('purges','Trois purges locales','environment','gameplay-original','f161-service-low f161-service-high f161-leadworks','valve',[],'game-original','Règles V109–V112, pas réseau thermodynamique intégral du film.'),
 eq('tracker','Détecteur de mouvement','none','excluded','','',[],'not-granted','Aucun ajout à l’inventaire de Ripley dans cette passe.'),
 eq('marine-rifle','Arsenal de Marines pour Ripley','none','excluded','','',['studio-film'],'excluded-by-design','L’arme visible de la Compagnie ne justifie pas un arsenal initial de Marines.')
]);
// New visible objects are tied to existing supports. They remain behind collision paths.
export const EVIDENCE_PROPS_V113=frozen([
 {id:'flight-recorder-v113',kind:'recorder',nodeId:'f161-flight-analysis-v94',xOffset:-38,w:68,h:30,condition:'always',equipment:'recorder'},
 {id:'medical-kit-v113',kind:'medical-kit',nodeId:'f161-clemens-bed',xOffset:-53,w:46,h:25,condition:'always',equipment:'medical-kit'},
 {id:'bishop-remains-v113',kind:'bishop',nodeId:'f161-bishop',xOffset:49,w:92,h:42,condition:'always',equipment:'bishop'},
 {id:'fire-flare-v113',kind:'flare',nodeId:'f161-chemical-store',xOffset:-48,w:17,h:65,condition:'fire',equipment:'flare'}
]);
export function compileEvidencePropsV113(scene){return EVIDENCE_PROPS_V113.map(p=>{const n=scene.nodes.find(n=>n.id===p.nodeId);return n?{...p,x:n.x+p.xOffset,y:n.y-p.h,foot:n.y,supportId:'node-platform-'+n.id,collision:'none'}:null;}).filter(Boolean);}
export function inventoryCoverageV113(scene){const added=compileEvidencePropsV113(scene);return EQUIPMENT_V113.map(e=>{const matches=scene.decor.props.filter(p=>e.nodeIds.includes(p.nodeId)&&e.kinds.includes(p.kind)).map(p=>p.id);const extension=added.filter(p=>p.equipment===e.id).map(p=>p.id);return {...e,boundIds:[...matches,...extension],implemented:e.role==='excluded'?'intentionally-absent':e.role==='catalogue'?'not-integrated':e.role==='arrival-render-only'?'conditional-visual':e.role==='costume'?'shared-renderer':e.role==='gameplay-original'?'inherited':matches.length||extension.length?'bound-rendering':'missing-binding'};});}
const location=(id,title,nodes,cuts,problem)=>({id,title,nodeIds:nodes.split(' ').filter(Boolean),cuts,problem,evidence:'scene-comparison-required',exact1to1:false});
export const LOCATION_COVERAGE_V113=frozen([
 location('sulaco','Sulaco : départ de l’EEV','','both','Prologue absent du banc ; pas de scène validée ici.'),
 location('shore','Côte et épave','f161-spawn f161-eev','both','Architecture stylisée, approche à comparer selon montage.'),
 location('ox','Approche avec le bovin','','assembly','Ne pas utiliser l’hôte canin dans cette continuité ; scène non intégrée ici.'),
 location('dog','Chenil / présence de Spike','','theatrical','Pas de chenil jouable qualifié ; ne pas déclarer le point EEV équivalent.'),
 location('infirmary','Infirmerie et alcôve de Clemens','f161-infirmary f161-clemens-bed','both','Appuis et mobilier présents ; proportions non mesurées.'),
 location('morgue','Morgue et examen des corps','f161-morgue-high','both','Palier supérieur hérité ; descente du montage étendu à comparer avant refonte.'),
 location('funeral','Cérémonie et crémation','f161-funeral-walk f161-furnace','both','Points présents ne prouvent pas la mise en scène complète.'),
 location('office','Bureau d’Andrews','','both','Pas de pièce dédiée liée dans le modèle actuel.'),
 location('cells','Cellules et coursives','f161-cell-a f161-cell-b','both','Façades arrière : pas toutes les cellules visitables.'),
 location('mess','Réfectoire et rassemblement','f161-assembly-hall f161-mess-high','both','Deux étages de gameplay ; continuité film à qualifier.'),
 location('prayer','Recueillement','f161-faith-dais-v94','both','Identification narrative à rapprocher des scènes, pas chapelle neuve inventée.'),
 location('comms','Poste de communications','f161-comms-high','both','Équipements localisés, décor haut hérité.'),
 location('fan','Ventilation de Murphy','f161-fan-shaft','both','Ventilateur visible ; séquence entière non rejouée par ce patch.'),
 location('tunnels','Couloirs et galeries de chasse','f161-service-low f161-service-high f161-tunnel-low f161-tunnel-high','both','Graphe dense mais métrique et raccords non certifiés à l’image.'),
 location('bishop','Raccordement de Bishop','f161-bishop','both','Fragment visible ajouté, dialogue intégral non reproduit.'),
 location('fuel','Réserve et préparation incendiaire','f161-chemical-store','both','État de feu hérité, récipients et torche ancrés ; aucun nouveau combat.'),
 location('waste','Piège de la cuve à déchets','f161-waste-tank','assembly','Point hérité ; capture et libération à qualifier dans la campagne native.'),
 location('golic','Confinement de Golic','','assembly','Cache inférieure héritée ne remplace pas le lieu de confinement à l’écran.'),
 location('scanner','Analyse diagnostique de l’EEV','f161-flight-analysis-v94 f161-eev','both','Ne pas inventer un appareil mobile accessible partout.'),
 location('lead','Salle de coulée','f161-leadworks f161-lead-primer','both','Moule et portique présents ; parcours de test original distinct du film.'),
 location('pistons','Rabattage, pistons et moule','f161-piston-a-node f161-piston-b-node f161-piston-c-node f161-mold','both','Le retour vivant de Dillon du banc n’est pas le dénouement du film.'),
 location('water','Commande haute du refroidissement','f161-water-header f161-sprinkler','both','Hauteurs validées pour le jeu ; parcours exact à comparer.'),
 location('furnace','Four et plateforme finale','f161-furnace f161-extraction','both','Graphisme et fin de Ripley non qualifiés 1:1.'),
 location('patna','Arrivée de la Compagnie','f161-company f161-patna-cage-node','both','Agents et arme représentés à l’arrivée seulement ; pas de nouvel échange de tirs.'),
 location('ship','Intérieur de la navette de récupération','','both','Aucun intérieur complet lié ; ne pas le confondre avec la plateforme extérieure.')
]);
export function coverageAuditV113(scene){const ids=new Set(scene.nodes.map(n=>n.id)),props=new Map(scene.decor.props.map(p=>[p.id,p])),errors=[];for(const r of LOCATION_COVERAGE_V113)for(const n of r.nodeIds)if(!ids.has(n))errors.push('location-node:'+n);const portals=bindPortalsV113(scene);for(const p of portals)if(!p.valid)errors.push('portal:'+p.id+':'+p.error);const refs=new Set(REFERENCES_V113.map(r=>r.id));for(const x of [...CAST_V113,...EQUIPMENT_V113])for(const id of x.references)if(!refs.has(id))errors.push('source:'+id);const seen=new Set();for(const x of [...CAST_V113.map(x=>({...x,id:'cast-'+x.id})),...LOCATION_COVERAGE_V113,...EQUIPMENT_V113.map(x=>({...x,id:'item-'+x.id}))]){if(seen.has(x.id))errors.push('duplicate:'+x.id);seen.add(x.id);}return {ok:!errors.length,errors,locations:LOCATION_COVERAGE_V113.length,locationsBound:LOCATION_COVERAGE_V113.filter(x=>x.nodeIds.length).length,locationsUnbound:LOCATION_COVERAGE_V113.filter(x=>!x.nodeIds.length).map(x=>x.id),screenAccurateCertified:0,portalBindings:portals.length,castRecords:CAST_V113.length,equipmentRecords:EQUIPMENT_V113.length,addedVisibleObjects:compileEvidencePropsV113(scene).length,graphNodes:scene.nodes.length,graphEdges:scene.edges.length};}
export const STYLE_RULES_V113=frozen([
 {id:'seuil-proprietaire',text:'Une porte est rattachée à une connexion, à son seuil et à son état réel. Les retours de mur ne modifient pas la collision.'},
 {id:'volet-rangement',text:'La feuille se replie vers son coffre, dans l’ouverture ; un volet ouvert ne laisse pas un rectangle opaque devant le passage.'},
 {id:'arme-proprietaire',text:'L’arme de récupération appartient à son porteur. Le même visuel ne permet jamais de l’ajouter à l’inventaire de Ripley.'},
 {id:'scene-condition',text:'L’arrivée de la Compagnie et la tenue d’extérieur sont des états explicites. Dessiner une image ne change ni l’un ni l’autre.'},
 {id:'absence-visible',text:'Une fiche sans pièce ou acteur lié reste marquée non intégrée. Un nom dans le registre ne remplit pas une scène.'},
 {id:'chronologie',text:'Montage cinéma et version étendue sont deux colonnes de couverture, pas deux campagnes annoncées terminées.'},
 {id:'dessin-pur',text:'La couche de fidélité est calculée à la demande ; aucune progression, arme, lumière ou position ne change au dessin.'},
 {id:'sources-pas-label',text:'Les références de costume guident la silhouette ; elles ne prouvent pas une ressemblance photographique du visage.'}
]);
