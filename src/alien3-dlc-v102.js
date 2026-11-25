/** Fiorina: authored, world-anchored scenery. All dimensions are game units,
 * not a claim about the dimensions of the film set. No gameplay topology changed. */
import { ALIEN3_FIORINA_TEMPLATE_V101, ALIEN3_FIORINA_PALETTE_V101, ALIEN3_CAMPAIGN_ID_V101 } from './alien3-dlc-v101.js';
import { ALIEN3_HYBRID_SECTORS_V97 } from './alien3-dlc-v97.js';
export const ALIEN3_CAMPAIGN_ID_V102 = ALIEN3_CAMPAIGN_ID_V101;
export const ALIEN3_FIORINA_TEMPLATE_V102 = ALIEN3_FIORINA_TEMPLATE_V101;
export const ALIEN3_FIORINA_PALETTE_V102 = ALIEN3_FIORINA_PALETTE_V101;
const freeze = o => { if(o && typeof o==='object' && !Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);} return o; };
const finite = (n,d=0) => typeof n==='number' && Number.isFinite(n) ? n : d;
export const clamp102=(n,a,b)=>Math.max(a,Math.min(b,finite(n,a)));
export const sectorAt102=x=>ALIEN3_HYBRID_SECTORS_V97.find(s=>x>=s.x0&&x<s.x1)||ALIEN3_HYBRID_SECTORS_V97.at(-1);
// A child is explicitly placed in the assembly, never scattered by a random seed.
const child=(kind,x,y,w,h,mount='wall',extra={})=>({kind,x,y,w,h,mount,...extra});
export const ALIEN3_ASSEMBLY_RECIPES_V102=freeze({
 intake:[child('fan',0,-112,84,84),child('duct',80,-96,105,48),child('junction',143,-40,38,38),child('gauge',107,-43,22,22),child('pipe',88,-30,42,10),child('drain',7,-7,100,7,'floor'),child('lamp',40,-146,40,13,'ceiling'),child('cable',157,-101,7,52),child('support',5,-20,6,20,'floor'),child('stencil',101,-140,77,19)],
 eev:[child('eev',0,-114,236,114,'floor'),child('cable',11,-39,80,12),child('case',179,-34,43,34,'floor'),child('drain',13,-6,139,6,'floor'),child('lamp',80,-158,41,13,'ceiling'),child('junction',243,-49,26,44),child('pipe',241,-105,10,45),child('stencil',175,-143,72,20)],
 clinic:[child('cabinet',0,-99,45,99,'floor'),child('gurney',66,-44,106,44,'floor'),child('monitor',109,-102,52,39),child('sink',185,-58,52,58,'floor'),child('bottle',9,-85,6,14),child('bottle',22,-85,6,14),child('bottle',193,-75,6,15),child('lamp',73,-132,98,12,'ceiling'),child('cable',158,-64,8,55),child('pipe',230,-91,7,22),child('tray',84,-56,47,9),child('stencil',3,-129,55,17)],
 morgue:[child('cabinet',0,-88,58,88,'floor'),child('gurney',85,-42,110,42,'floor'),child('sink',217,-60,46,60,'floor'),child('lamp',91,-124,86,12,'ceiling'),child('drain',89,-5,108,5,'floor'),child('tray',136,-57,42,10),child('junction',230,-104,25,24),child('stencil',3,-123,58,16)],
 cell:[child('cell',0,-132,73,132,'floor'),child('bunk',94,-103,111,103,'floor'),child('basin',223,-48,35,48,'floor'),child('lamp',17,-154,37,11,'ceiling'),child('blanket',113,-39,42,8),child('cup',198,-11,8,11,'floor'),child('stencil',107,-142,73,19),child('pipe',260,-109,6,89),child('cable',12,-142,234,5),child('drain',221,-5,36,5,'floor')],
 refectory:[child('table',14,-45,156,45,'floor'),child('bench',4,-24,65,24,'floor'),child('bench',114,-24,65,24,'floor'),child('cup',46,-54,8,10),child('cup',92,-54,8,10),child('bowl',126,-51,21,7),child('rack',190,-109,53,109,'floor'),child('lamp',48,-135,78,12,'ceiling'),child('stencil',191,-137,53,17),child('cable',193,-123,42,5)],
 chapel:[child('altar',42,-58,120,58,'floor'),child('bench',0,-25,57,25,'floor'),child('bench',181,-25,57,25,'floor'),child('candle',75,-83,6,25),child('candle',139,-79,6,21),child('book',107,-68,24,8),child('lamp',93,-141,24,11,'ceiling'),child('stencil',44,-120,118,22)],
 fan:[child('fan',8,-128,116,116),child('duct',124,-91,129,57),child('junction',201,-134,34,31),child('gauge',158,-123,21,21),child('valve',138,-27,27,27),child('pipe',10,-13,249,9),child('drain',18,-5,94,5,'floor'),child('lamp',31,-150,45,10,'ceiling'),child('grille',197,-25,53,21),child('cable',235,-135,7,38)],
 pump:[child('pump',28,-80,83,80,'floor'),child('tank',165,-126,60,126,'floor'),child('valve',129,-39,27,27),child('gauge',46,-108,24,24),child('pipe',99,-29,84,10),child('pipe',178,-126,8,19),child('junction',9,-62,23,25),child('drain',3,-5,116,5,'floor'),child('lamp',99,-150,37,10,'ceiling'),child('stencil',21,-139,72,18)],
 workshop:[child('bench',4,-52,130,52,'floor'),child('rack',180,-121,58,121,'floor'),child('toolboard',17,-111,107,51),child('case',147,-34,34,34,'floor'),child('lamp',29,-139,79,11,'ceiling'),child('junction',148,-106,27,33),child('spool',189,-46,30,30),child('pipe',10,-128,216,6),child('stencil',146,-145,80,17),child('tray',64,-65,32,10)],
 comms:[child('console',4,-76,134,76,'floor'),child('rack',182,-133,66,133,'floor'),child('monitor',16,-123,52,38),child('monitor',79,-123,52,38),child('spool',151,-29,29,29,'floor'),child('junction',145,-109,27,29),child('cable',126,-83,63,8),child('lamp',17,-150,45,10,'ceiling'),child('stencil',183,-153,65,15),child('stool',66,-32,24,32,'floor')],
 store:[child('rack',0,-123,75,123,'floor'),child('barrel',104,-70,39,70,'floor'),child('barrel',156,-70,39,70,'floor'),child('case',213,-34,43,34,'floor'),child('lamp',96,-150,44,10,'ceiling'),child('grille',114,-125,81,32),child('valve',241,-91,22,22),child('pipe',71,-102,43,7),child('stencil',9,-148,67,16),child('drain',96,-5,112,5,'floor')],
 smelter:[child('crucible',48,-137,116,137,'floor'),child('gantry',9,-167,215,167,'floor'),child('hoist',85,-154,48,65,'ceiling'),child('ladle',194,-110,57,110,'floor'),child('gauge',10,-56,23,23),child('pipe',9,-33,42,10),child('slag',190,-32,41,32,'floor'),child('lamp',193,-190,32,12,'ceiling'),child('stencil',46,-181,80,18),child('grille',116,-7,42,7,'floor')],
 pistons:[child('piston',14,-120,58,120,'floor'),child('piston',109,-120,58,120,'floor'),child('piston',204,-120,58,120,'floor'),child('pipe',9,-138,251,11),child('gauge',179,-70,23,23),child('valve',76,-53,24,24),child('junction',80,-108,23,28),child('lamp',115,-159,42,11,'ceiling'),child('stencil',12,-163,75,18),child('drain',77,-5,126,5,'floor')],
 mold:[child('mold',4,-42,231,42,'floor'),child('pipe',24,-96,195,9),child('valve',214,-96,26,26),child('gauge',10,-89,23,23),child('lamp',57,-143,105,12,'ceiling'),child('grille',4,-9,229,9,'floor'),child('stencil',78,-119,91,20),child('junction',249,-71,24,37)],
 furnace:[child('furnace',22,-182,178,182,'floor'),child('pipe',215,-127,14,115),child('gauge',211,-98,25,25),child('slag',238,-35,35,35,'floor'),child('lamp',12,-193,36,11,'ceiling'),child('stencil',218,-160,48,19),child('grille',18,-12,185,12,'floor'),child('junction',241,-89,23,36)],
 company:[child('recovery',20,-139,129,139,'floor'),child('case',170,-39,67,39,'floor'),child('lampstand',252,-139,27,139,'floor'),child('monitor',176,-77,43,30),child('cable',140,-13,48,8),child('stencil',169,-111,76,20),child('case',1,-33,35,33,'floor'),child('clamp',71,-79,26,27)],
 landing:[child('winch',38,-68,80,68,'floor'),child('junction',149,-99,36,51),child('pipe',23,-116,210,9),child('valve',209,-115,26,26),child('lamp',139,-154,38,11,'ceiling'),child('grille',24,-8,139,8,'floor'),child('stencil',26,-150,74,19),child('support',123,-24,12,24,'floor')]
});
const A=(id,node,recipe,label,condition='always')=>({id,nodeId:node,recipe,label,condition});
export const ALIEN3_ASSEMBLIES_V102=freeze([
 A('coast-intake','f161-spawn','intake','Prise d’air côtière'),A('coast-wreck','f161-eev','eev','Épave et matériel de secours'),
 A('medical-care','f161-infirmary','clinic','Poste de soin'),A('clemens-room','f161-clemens-bed','clinic','Chambre médicale'),A('morgue-bay','f161-morgue-high','morgue','Baie mortuaire'),
 A('cell-a','f161-cell-a','cell','Cellules ouest'),A('cell-b','f161-cell-b','cell','Cellules est'),A('mess','f161-mess-high','refectory','Réfectoire'),A('faith','f161-faith-dais-v94','chapel','Lieu de recueillement'),
 A('actual-comms','f161-comms-high','comms','Poste de communication'),A('murphy-fan','f161-fan-shaft','fan','Ventilateur de maintenance'),A('service-pump','f161-service-low','pump','Pompage des galeries'),A('service-shop','f161-service-high','workshop','Entretien des réseaux'),A('deep-shrine','f161-tunnel-shrine','chapel','Alcôve des galeries'),A('battery-store','f161-battery-locker-v94','workshop','Recharge des batteries'),A('chemical-store','f161-chemical-store','store','Réserve de produits'),A('command','f161-command-post-node','comms','Supervision de la fonderie'),
 A('waste','f161-waste-tank','pump','Collecte des effluents'),A('leadworks','f161-leadworks','smelter','Creuset et transfert'),A('lead-primer','f161-lead-primer','pump','Alimentation du creuset'),A('water-header','f161-sprinkler','pump','Collecteur d’eau supérieur'),
 A('piston-upper','f161-piston-b-node','pistons','Pistons supérieurs'),A('mold','f161-mold','mold','Moule de coulée'),A('lower-pressure','f161-pressure-alcove-v95','pump','Retour hydraulique'),
 A('main-furnace','f161-furnace','furnace','Four principal'),A('furnace-gantry','f161-furnace-high','landing','Commande de passerelle'),A('parley','f161-parley-v93','landing','Approche de la Compagnie'),
 A('patna-kit','f161-patna-cage-node','company','Matériel de récupération','company'),A('final-landing','f161-extraction','landing','Plateforme terminale'),A('final-transmitter','f161-final-transmission-v94','comms','Émetteur de service')
]);
export const ALIEN3_SECTOR_BRIEFS_V102=freeze([
 ['Côte et épave','Maçonnerie sombre, sel, tôles arrachées. La coque de l’EEV reste le repère, pas un rectangle générique.','Air : prise → filtre → gaine. Eau : ruissellement → caniveau.','Pas de mobilier médical dispersé sur la côte. Pluie extérieure seulement.'],
 ['Infirmerie et morgue','Alcôves de soin différenciées par brancard, lavabo, armoires et luminaire.','Eau de lavage → évier → évacuation ; écran → câble → boîtier.','Ne pas représenter une morgue comme une autre soute. Pas de lampe sans support.'],
 ['Détention et espaces communs','Cellules derrière le passage ; réfectoire à l’étage ; communication ancrée à son vrai nœud.','Cellules → coursive ; tables → circulation centrale ; câbles → poste haut.','Aucun nouveau passage dans les grilles peintes. Ne pas déplacer les communications vers une autre abscisse.'],
 ['Galeries de service','Conduites regroupées, ventilateur distinct, maintenance et pompage séparés.','Gaine → ventilateur ; pompe → vanne → collecteur.','Ne pas confondre pluie extérieure et vapeur intérieure. Chaque échelle conserve son débouché.'],
 ['Supervision industrielle','Poste de commande et produits de maintenance, en continuité avec les galeries.','Réserve → poste de travail ; faisceau câblé → supervision.','Le découpage caméra hérité ne constitue pas à lui seul une pièce du film.'],
 ['Fonderie','Creuset conique avec collerette, portique, palan, poche de transfert et bac à laitier.','Alimentation → creuset → transfert → moule ; eau sur sa propre conduite.','Pas de tuyau d’eau dessiné comme une arrivée de métal. Feu seulement dans son contenant.'],
 ['Pistons et moule','Tiges, joints et semelles lisibles ; moule bas pour laisser voir le piège.','Collecteur → vérin → guidage ; réseau d’eau au-dessus, évacuation au-dessous.','Ne pas peindre un faux bouton utilisable. Les vraies commandes appartiennent au runtime existant.'],
 ['Four et approche','Bouche circulaire, briques réfractaires, conduites de récupération et caillebotis.','Énergie → four ; fumées → extraction ; commandes → passerelle.','Le matériel Patna reste absent avant l’arrivée de la Compagnie.'],
 ['Plateforme terminale','La silhouette et le vide priment ; appareils regroupés aux appuis.','Treuil → câble → plateforme ; émetteur fixé sur sa baie.','Aucune pluie de caisses ni gros panneau permanent devant la scène finale.']
].map((a,i)=>({sectorId:ALIEN3_HYBRID_SECTORS_V97[i].id,label:a[0],composition:a[1],networks:a[2],exclusions:a[3]})));
// Rules include explicit scope: automated checks never claim artistic/canonical certification.
export const ALIEN3_RULES_V102=freeze([
 ['ANCHOR','Tout décor a un support nommé ; coordonnées indépendantes du joueur.','automated'],
 ['FINITE','Positions et dimensions finies et positives.','automated'],['ID','Identifiants uniques, parents existants.','automated'],
 ['FOOT','Les meubles reposent sur le plan de pose ; pas sur la caméra.','automated'],['BOUND','Les éléments restent dans la baie de leur assemblage.','automated'],
 ['NO_FAKE_COVER','Décor d’arrière-plan non collidable et explicitement sans couverture.','automated'],['CONDITION','Le matériel de récupération dépend de l’arrivée de la Compagnie.','automated'],
 ['ROUTE','Aucun nœud, verrou ou ordre de mission ajouté pour justifier le décor.','automated'],['DRAW_PURE','Le rendu ne change ni progression ni sauvegarde.','automated'],
 ['TOP','Fond opaque depuis le premier pixel du champ, quelle que soit la caméra.','browser'],['HUD','Les panneaux ordinaires couvrent moins de 9 % de l’écran.','automated'],
 ['READ','Les premiers plans s’effacent à proximité des silhouettes.','automated'],['PARALLAX','Les machines proches suivent le monde ; seule l’architecture distante dérive.','browser'],
 ['LUX','Une lumière forte a une source dessinée.','visual'],['RHYTHM','Alcôves équipées puis respirations, sans tapis uniforme de petits objets.','visual'],
 ['IDENTITY','Une forme identifiable remplace chaque bloc générique.','visual'],['FILM','Plans et dimensions de jeu : adaptation, pas relevé certifié des plateaux.','disclosure'],
 ['ROOMS','La pièce, son étage et ses voisins priment sur les limites de caméra.','disclosure']
].map(([id,text,validation])=>({id:`A3-${id}`,text,validation})));
export function compileAlien3DecorV102(plan=null){
 const nodes=plan?.graph?.nodes?.length?plan.graph.nodes:ALIEN3_FIORINA_TEMPLATE_V102.nodes;
 const byId=new Map(nodes.map(n=>[n.id,n])); const groups=[],props=[];
 for(const a of ALIEN3_ASSEMBLIES_V102){
  const n=byId.get(a.nodeId); if(!n)continue;
  const recipe=ALIEN3_ASSEMBLY_RECIPES_V102[a.recipe];
  const maxX=Math.max(...recipe.map(p=>p.x+p.w));
  const neighbors=ALIEN3_ASSEMBLIES_V102.filter(g=>g.id!==a.id).map(g=>byId.get(g.nodeId)).filter(o=>o&&Math.abs(o.y-n.y)<1);
  const nearestGap=Math.min(Infinity,...neighbors.map(o=>Math.abs(o.x-n.x)));
  // Each machine bay keeps 24 units of separation from its closest same-level neighbor.
  const span=Math.min(Math.max(40,finite(n.width,200)-24),Math.max(40,nearestGap-24));
  const scale=Math.min(1,span/maxX);const width=maxX*scale;const x=n.x-width/2;
  const group={...a,x,y:n.y,w:width,h:Math.max(...recipe.map(p=>-p.y))*scale,scale,sectorId:sectorAt102(n.x).id,zoneId:n.zoneId,supportId:`node-platform-${n.id}`,renderPlane:'rear-recess',collision:'none',occlusion:'behind-actors'};
  groups.push(group);
  recipe.forEach((p,index)=>props.push({...p,id:`${a.id}/${index}`,assemblyId:a.id,nodeId:n.id,sectorId:group.sectorId,x:x+p.x*scale,y:n.y+p.y*scale,w:p.w*scale,h:p.h*scale,condition:a.condition,label:p.kind==='stencil'?({intake:'AIR',eev:'EEV',clinic:'SOINS',morgue:'MORGUE',cell:'CELLULES',refectory:'REPAS',chapel:'SILENCE',fan:'AIR',pump:'EAU',workshop:'ENTRETIEN',comms:'COM',store:'RÉSERVE',smelter:'PLOMB',pistons:'PRESSION',mold:'MOULAGE',furnace:'CHAUD',company:'W-Y',landing:'ACCÈS'}[a.recipe]||'161'):null,supportId:group.supportId,baseline:n.y,renderPlane:'rear-recess',collision:'none',variant:index%3}));
 }
 const supports=Array.isArray(plan?.geometry?.platforms)?plan.geometry.platforms:nodes.map(n=>({id:`node-platform-${n.id}`,x:n.x-(n.width||200)/2,y:n.y,w:n.width||200,h:22}));
 return {schema:102,groups,props,nodes:nodes.map(n=>({...n})),supports:supports.map(p=>({...p})),supportSource:Array.isArray(plan?.geometry?.platforms)?'compiled-geometry':'template-node-derived',width:6200,height:720};
}
export function isDecorVisibleV102(prop,flags={}){return prop.condition!=='company'||flags.companyArrived===true;}
export function auditAlien3DecorV102(scene){
 const errors=[];const ids=new Set();const nodes=new Map(scene.nodes.map(n=>[n.id,n]));const groups=new Map(scene.groups.map(g=>[g.id,g]));
 const supports=new Map((scene.supports||[]).map(p=>[p.id,p]));
 for(const g of scene.groups){const support=supports.get(g.supportId);if(!support||Math.abs(support.y-g.y)>.01||g.x<support.x-.01||g.x+g.w>support.x+support.w+.01)errors.push(`physical-support:${g.id}`);}
 for(const a of ALIEN3_ASSEMBLIES_V102)if(!groups.has(a.id))errors.push(`missing-assembly:${a.id}`);
 for(const p of scene.props){
  if(ids.has(p.id))errors.push(`duplicate:${p.id}`);ids.add(p.id);
  if(![p.x,p.y,p.w,p.h,p.baseline].every(Number.isFinite)||p.w<=0||p.h<=0)errors.push(`finite:${p.id}`);
  const n=nodes.get(p.nodeId),g=groups.get(p.assemblyId);if(!n||!g){errors.push(`parent:${p.id}`);continue;}
  if(p.supportId!==`node-platform-${n.id}`||Math.abs(p.baseline-n.y)>.001)errors.push(`anchor:${p.id}`);
  if(p.x<g.x-.01||p.x+p.w>g.x+g.w+.01)errors.push(`bounds:${p.id}`);
  if(p.mount==='floor'&&Math.abs(p.y+p.h-n.y)>.01)errors.push(`floor:${p.id}`);
  if(p.collision!=='none'||p.renderPlane!=='rear-recess')errors.push(`false-cover:${p.id}`);
  if(!['always','company'].includes(p.condition))errors.push(`condition:${p.id}`);
 }
 for(let i=0;i<scene.groups.length;i++)for(let j=i+1;j<scene.groups.length;j++){const a=scene.groups[i],b=scene.groups[j];if(Math.abs(a.y-b.y)<1&&a.x<b.x+b.w+10&&a.x+a.w+10>b.x)errors.push(`bay-overlap:${a.id}:${b.id}`);}
 return {ok:errors.length===0,errors,assemblies:scene.groups.length,props:scene.props.length,shapes:new Set(scene.props.map(p=>p.kind)).size,supports:new Set(scene.groups.map(g=>g.supportId)).size,topologyUnchanged:JSON.stringify(ALIEN3_FIORINA_TEMPLATE_V102)===JSON.stringify(ALIEN3_FIORINA_TEMPLATE_V101),sectors:ALIEN3_HYBRID_SECTORS_V97.map(s=>({id:s.id,groups:scene.groups.filter(g=>g.sectorId===s.id).length,props:scene.props.filter(p=>p.sectorId===s.id).length}))};
}
export function foregroundOpacityV102(bounds,actors=[],alpha=.34){
 const close=actors.some(a=>a&&a.alive!==false&&bounds.x<a.x+a.w+58&&bounds.x+bounds.w>a.x-58&&bounds.y<a.y+a.h+20&&bounds.y+bounds.h>a.y-20);
 return close?Math.min(alpha,.065):alpha;
}
export const ALIEN3_HUD_RECTS_V102=freeze([{x:18,y:14,w:306,h:45},{x:960,y:14,w:302,h:45},{x:300,y:664,w:680,h:37}]);
export const createAlien3StateV102=()=>({schema:102,visited:[],settings:{detail:'high',compactHud:true}});
export function sanitizeAlien3StateV102(raw){const s=createAlien3StateV102();if(!raw||raw.schema!==102)return s;s.visited=[...new Set((Array.isArray(raw.visited)?raw.visited:[]).filter(id=>ALIEN3_HYBRID_SECTORS_V97.some(x=>x.id===id)))];s.settings.detail=raw.settings?.detail==='low'?'low':'high';return s;}
export const ALIEN3_DEFAULT_SCENE_V102=freeze(compileAlien3DecorV102());

// Player-facing replacement copy; original dialogue, no film transcription.
export const ALIEN3_PLAYER_COPY_V102=freeze({
  "a3c-overview-archive": {
    "title": "Dossiers de Fiorina",
    "body": "Les documents retrouvés dans le complexe sont réunis ici. Ils conservent les lieux, les visages et les décisions d’une nuit dont personne ne sortira intact."
  },
  "a3c-overview-continuity": {
    "title": "Récits distincts",
    "body": "Certains témoignages se contredisent. Chaque dossier conserve son origine : mieux vaut garder deux récits séparés que fabriquer une certitude."
  },
  "a3c-overview-hybrid": {
    "title": "Passages et grandes salles",
    "body": "Une cour laisse plusieurs chemins pour contourner un danger. Dans un conduit, il ne reste parfois que la distance entre vous et lui."
  },
  "a3c-overview-lanes": {
    "title": "Se décaler pour survivre",
    "body": "Dans une grande salle, gagnez le fond ou rapprochez-vous pour quitter sa trajectoire. Haut vous éloigne ; bas vous ramène vers l’avant. Près d’une échelle, ces touches servent à grimper."
  },
  "a3c-overview-transition": {
    "title": "Les seuils",
    "body": "Une porte peut déboucher sur une salle profonde ou un couloir sans échappatoire. Regardez où mène le passage avant de vous engager."
  },
  "a3c-overview-one-runner": {
    "title": "La même créature",
    "body": "Ce n’est pas une meute. Les bruits au plafond, les ombres dans les tunnels et la silhouette qui vous coupe la route appartiennent à la même créature."
  },
  "a3c-place-fiorina": {
    "title": "Fiorina 161",
    "body": "Une prison industrielle isolée, rongée par l’humidité. Les cellules, les galeries et les fours partagent les mêmes murs fatigués."
  },
  "a3c-place-coast": {
    "title": "Côte et épave",
    "body": "Le vent couvre les voix, pas les traces. Entre la coque brisée et l’entrée du complexe, chaque abri compte."
  },
  "a3c-place-eev": {
    "title": "Le module de secours",
    "body": "L’EEV a survécu assez longtemps pour garder ses enregistrements. Sa coque porte les marques du voyage ; ses appareils peuvent encore livrer quelques réponses."
  },
  "a3c-place-infirmary": {
    "title": "Infirmerie",
    "body": "Des lits, de quoi laver une plaie et peu de matériel. Ici, la proximité des murs rend le moindre bruit difficile à ignorer."
  },
  "a3c-place-morgue": {
    "title": "Morgue",
    "body": "Un endroit pour constater les pertes et comprendre ce qui les a provoquées. Aucune réponse ne rendra cette pièce moins froide."
  },
  "a3c-place-cellblock": {
    "title": "Bloc carcéral",
    "body": "Les passerelles dominent les cellules. Un mouvement aperçu derrière une grille peut être plus proche qu’il n’en a l’air."
  },
  "a3c-place-mess": {
    "title": "Réfectoire",
    "body": "Le groupe s’y rassemble pour manger, parler et décider. Lorsque la peur s’installe, garder tout le monde à portée de voix devient une nécessité."
  },
  "a3c-place-service": {
    "title": "Galeries techniques",
    "body": "Vapeur, conduites et virages aveugles. Repérez les embranchements pendant qu’il est encore possible de marcher."
  },
  "a3c-place-waste": {
    "title": "Cuve à déchets",
    "body": "Ses parois offrent une chance de confinement. Une porte fermée ne vaut pourtant rien si quelqu’un décide de la rouvrir."
  },
  "a3c-place-communications": {
    "title": "Communications",
    "body": "Le poste est un lien avec l’extérieur. Avant d’espérer des secours, il faut comprendre ce que la Compagnie souhaite réellement récupérer."
  },
  "a3c-place-foundry": {
    "title": "Fonderie",
    "body": "Le plomb, les machines et les hommes peuvent former un piège. Aucun d’eux n’est utile si la créature n’est pas amenée au bon endroit."
  },
  "a3c-place-mold": {
    "title": "Le moule",
    "body": "Le dernier tronçon doit rester dégagé. Les commandes, le métal et le réseau d’eau devront être prêts avant que la créature y entre."
  },
  "a3c-place-furnace": {
    "title": "Four principal",
    "body": "La chaleur domine cet espace. Les passerelles et leurs appuis sont les derniers repères au-dessus du vide."
  },
  "a3c-place-patna": {
    "title": "Aire d’arrivée",
    "body": "Le matériel propre de la Compagnie tranche avec les installations de Fiorina. Il révèle aussi les moyens qu’elle était prête à consacrer à sa récupération."
  },
  "a3c-char-ripley": {
    "title": "Ellen Ripley",
    "body": "Elle connaît cette menace mieux que quiconque sur Fiorina. Cette connaissance ne lui offre ni arme, ni refuge, ni certitude sur ce qu’elle porte en elle."
  },
  "a3c-char-dillon": {
    "title": "Dillon",
    "body": "Il tient le groupe par la parole et par l’exemple. Quand les ordres ne suffisent plus, sa présence peut empêcher les hommes de se disperser."
  },
  "a3c-char-clemens": {
    "title": "Clemens",
    "body": "Médecin du complexe, il accueille Ripley et tente de comprendre ce qui est arrivé. Ses moyens restent ceux d’une infirmerie pénitentiaire."
  },
  "a3c-char-andrews": {
    "title": "Andrews",
    "body": "Il entend préserver l’ordre de l’établissement. La menace finit par rendre ses procédures dérisoires."
  },
  "a3c-char-aaron": {
    "title": "Aaron",
    "body": "Adjoint d’Andrews, il reste pris entre les consignes, les détenus et la Compagnie. La fin de la crise l’oblige à choisir."
  },
  "a3c-char-morse": {
    "title": "Morse",
    "body": "L’un des détenus pris dans le plan final. Survivre lui laisse une autre charge : se souvenir de ceux qui n’ont pas quitté Fiorina."
  },
  "a3c-char-golic": {
    "title": "Golic",
    "body": "Ce qu’il a vu dans les galeries a bouleversé son rapport à la créature. Sa fascination peut devenir aussi dangereuse qu’une porte laissée ouverte."
  },
  "a3c-char-junior": {
    "title": "Junior",
    "body": "Son rôle dans le confinement repose sur un choix sans véritable issue de secours. Le groupe ne peut pas l’oublier en refermant la porte."
  },
  "a3c-char-murphy": {
    "title": "Murphy",
    "body": "La maintenance l’amène près du ventilateur et des conduits. Le lieu de travail devient le premier avertissement que quelque chose chasse dans le complexe."
  },
  "a3c-char-boggs": {
    "title": "Boggs",
    "body": "Parti dans les galeries avec Rains et Golic. Les traces de cette expédition changent la manière dont les survivants regardent les tunnels."
  },
  "a3c-char-rains": {
    "title": "Rains",
    "body": "L’expédition souterraine le conduit dans les angles morts de la prison. Après sa disparition, les mêmes couloirs paraissent beaucoup plus longs."
  },
  "a3c-char-bishop": {
    "title": "Bishop endommagé",
    "body": "Ses systèmes sont gravement atteints, mais sa mémoire peut encore éclairer les événements du Sulaco. Il ne s’agit pas de le remettre en état pour le combat."
  },
  "a3c-char-bishop2": {
    "title": "L’homme de la Compagnie",
    "body": "Il porte un visage familier et vient avec une offre de récupération. Ce qu’il promet doit être jugé à la lumière de ce que la Compagnie veut conserver."
  },
  "a3c-char-prisoners": {
    "title": "Les détenus",
    "body": "La fatigue et la peur n’effacent pas l’entraide. Un homme capable de tenir son poste peut devenir le soutien de celui qui n’y parvient plus."
  },
  "a3c-char-company-team": {
    "title": "Équipe de récupération",
    "body": "Son équipement est préparé pour contenir et transporter. La priorité de l’équipe n’est pas nécessairement celle des survivants."
  },
  "a3c-char-host-variant": {
    "title": "L’hôte",
    "body": "Les dossiers conservent deux récits de l’émergence : l’un lié à un chien, l’autre à un bovin. Ils ne doivent pas être confondus en une seule observation."
  },
  "a3c-xeno-runner": {
    "title": "Runner",
    "body": "Rapide, bas sur ses appuis, capable d’exploiter les conduits et les hauteurs. Ne prenez pas son absence dans le couloir pour un départ."
  },
  "a3c-xeno-runner-hunt": {
    "title": "Habitudes de chasse",
    "body": "Répéter le même détour ou le même leurre finit par vous rendre prévisible. Changez vos habitudes avant que la créature ne vous attende à leur extrémité."
  },
  "a3c-xeno-depth": {
    "title": "Quitter sa trajectoire",
    "body": "Dans un espace ouvert, un décalage peut faire manquer une charge. Il faudra malgré tout retrouver une sortie : changer de place n’arrête pas la chasse."
  },
  "a3c-xeno-perches": {
    "title": "Au-dessus de vous",
    "body": "Les positions hautes lui permettent d’observer et de retomber dans le passage. Un bruit métallique au plafond mérite autant d’attention qu’un mouvement au sol."
  },
  "a3c-xeno-queen-embryo": {
    "title": "Le diagnostic",
    "body": "Le scanner de l’EEV révèle une menace que fuir ne suffira pas à éloigner. Cette découverte donne un autre sens au comportement de la créature."
  },
  "a3c-xeno-super-facehugger": {
    "title": "Un vecteur inhabituel",
    "body": "Les traces d’implantation ne livrent pas toutes la même histoire. Conservez les observations distinctes plutôt que de combler ce qui manque."
  },
  "a3c-xeno-thermal": {
    "title": "Refroidissement brutal",
    "body": "Le piège ne se limite pas au plomb fondu. Le réseau d’eau doit être prêt pour provoquer le refroidissement brutal qui suivra."
  },
  "a3c-xeno-spared-ripley": {
    "title": "Pourquoi l’épargne-t-elle ?",
    "body": "La créature hésite devant Ripley. Ce comportement n’a rien d’une protection : il suggère qu’elle reconnaît quelque chose d’important."
  },
  "a3c-event-crash": {
    "title": "La chute",
    "body": "L’EEV s’échoue sur Fiorina. Les premières recherches commencent avec l’épave et les survivants qu’elle a laissés."
  },
  "a3c-event-funeral": {
    "title": "La cérémonie",
    "body": "Les morts sont confiés au feu tandis qu’une autre menace prend forme. Le groupe se rassemble avant de comprendre ce qui le guette."
  },
  "a3c-event-first-blood": {
    "title": "Les premières traces",
    "body": "Des accidents apparents et des disparitions finissent par dessiner un même parcours. Les machines ne sont plus le seul danger des galeries."
  },
  "a3c-event-bishop": {
    "title": "Les réponses de Bishop",
    "body": "L’enregistreur et la mémoire de Bishop permettent de rapprocher les traces laissées à bord et celles retrouvées dans l’EEV."
  },
  "a3c-event-fire-plan": {
    "title": "Le plan incendiaire",
    "body": "Les hommes préparent plusieurs points de mise à feu. Avant d’allumer, chacun doit savoir quel passage fermer et quelle direction prendre."
  },
  "a3c-event-fire-failure": {
    "title": "Le feu échappe au groupe",
    "body": "L’incendie disperse les hommes et compromet le piège. Il faut retrouver les survivants, puis reprendre la recherche de réponses."
  },
  "a3c-event-assembly-capture": {
    "title": "Le confinement",
    "body": "La créature peut être enfermée dans la cuve. Ce répit reste fragile tant que les accès et les hommes chargés de les garder ne sont pas sûrs."
  },
  "a3c-event-golic-release": {
    "title": "La porte rouverte",
    "body": "Golic transforme un confinement réussi en nouvelle menace. Une seule personne peut défaire ce que tout le groupe a risqué sa vie à accomplir."
  },
  "a3c-event-final-bait": {
    "title": "Le dernier rabattage",
    "body": "Les coureurs attirent la créature tandis que les autres ferment les passages. Les pistons et le moule doivent former la seule issue restante."
  },
  "a3c-event-lead": {
    "title": "La coulée",
    "body": "Le métal doit atteindre le moule au bon moment. Une commande actionnée trop tôt laisse la créature hors du piège."
  },
  "a3c-event-patna": {
    "title": "La Compagnie arrive",
    "body": "Les survivants font face à une équipe qui souhaite préserver ce qu’ils ont tenté de détruire. Les paroles rassurantes ne changent pas cette opposition."
  },
  "a3c-event-ending-variants": {
    "title": "Derniers témoignages",
    "body": "Les récits de la conclusion ne montrent pas tous les mêmes détails. Les archives les conservent séparément, sans faire disparaître leur désaccord."
  },
  "a3c-system-quinitricetyline": {
    "title": "Le produit du piège",
    "body": "Les points de préparation alimentent le plan incendiaire. La prudence et la coordination comptent davantage que la quantité transportée."
  },
  "a3c-system-lead-mold": {
    "title": "Moule de coulée",
    "body": "Vérifiez l’alimentation, les commandes et l’arrivée du métal. Le piège doit être prêt avant d’engager le dernier rabattage."
  },
  "a3c-system-sprinkler": {
    "title": "Réseau d’eau",
    "body": "La pression doit être rétablie avant l’ouverture de la vanne. Une conduite visible n’est pas la garantie qu’elle soit prête."
  },
  "a3c-system-pistons": {
    "title": "Pistons industriels",
    "body": "Les vérins ferment les passages dans un ordre précis. Une fermeture mal coordonnée peut laisser une issue à la créature."
  },
  "a3c-system-shutters": {
    "title": "Volets d’urgence",
    "body": "Un volet offre du temps, pas une sécurité durable. Ne bâtissez pas tout votre trajet sur la même fermeture."
  },
  "a3c-system-steam": {
    "title": "Purges de vapeur",
    "body": "La vapeur peut couvrir vos mouvements, mais elle vous retire aussi des repères. Gardez en mémoire le chemin de sortie avant d’ouvrir la purge."
  },
  "a3c-system-flares": {
    "title": "Leurres lumineux",
    "body": "Un leurre détourne l’attention pendant un court instant. L’utiliser toujours de la même façon peut finir par annoncer votre passage."
  },
  "a3c-system-audio": {
    "title": "Écouter sans dépendre du son",
    "body": "Les indications de proximité et de direction restent disponibles sans audio. Aucun objectif ne demande de distinguer un bruit que vous ne pouvez pas entendre."
  },
  "a3c-system-mire-score": {
    "title": "Bilan de l’expédition",
    "body": "Le bilan rassemble les documents retrouvés, les pertes et les décisions prises. Il ne change pas ce qui s’est passé."
  },
  "a3c-system-save": {
    "title": "Reprendre son parcours",
    "body": "La reprise conserve vos découvertes et l’état des installations. Après une interruption, vérifiez votre position avant de vous remettre en mouvement."
  },
  "a3c-v98-director": {
    "title": "Lire les grandes salles",
    "body": "Cherchez d’abord les issues, les hauteurs et les obstacles. Le lieu doit vous renseigner avant le premier cri."
  },
  "a3c-v98-lane-blend": {
    "title": "Traverser un passage",
    "body": "Un déplacement vers le fond demande un instant. Ne vous engagez pas en comptant disparaître immédiatement de la trajectoire de la créature."
  },
  "a3c-v98-runner-telegraph": {
    "title": "Signe avant l’attaque",
    "body": "Un changement d’appui ou de direction peut annoncer sa traversée. Ce bref avertissement est une chance de réagir, pas un abri."
  },
  "a3c-v98-depth-cover": {
    "title": "Angles morts",
    "body": "Certains obstacles coupent momentanément la vue. Ils ne cachent pas tous les passages et ne remplacent pas une issue de secours."
  },
  "a3c-v98-camera-contracts": {
    "title": "Prendre ses repères",
    "body": "La côte, les cellules et les fours n’offrent pas les mêmes lignes de vue. Prenez le temps d’identifier ce que chaque lieu vous permet de voir."
  },
  "a3c-v98-side-readability": {
    "title": "Dans un passage étroit",
    "body": "Un conduit ne laisse guère de place pour contourner une attaque. Gardez la sortie, le sol et les commandes à portée de regard."
  },
  "a3c-v98-codex-ui": {
    "title": "Consulter les dossiers",
    "body": "Les rubriques réunissent les lieux, les personnes et les événements. Fermez les archives pour revenir à votre parcours."
  },
  "a3c-v98-codex-unread": {
    "title": "Documents à lire",
    "body": "Un document retrouvé peut encore contenir une information que vous n’avez pas consultée. Les repères de lecture permettent de le retrouver."
  },
  "a3c-v98-codex-bookmarks": {
    "title": "Marquer un dossier",
    "body": "Placez un repère sur une page utile pour y revenir sans parcourir toute la liste."
  },
  "a3c-v98-prison-staging": {
    "title": "Traverser le bloc",
    "body": "Barreaux et coursives multiplient les angles morts. Regardez la passerelle autant que le passage devant vous."
  },
  "a3c-v98-foundry-staging": {
    "title": "Échapper à la fonderie",
    "body": "La chaleur et le bruit peuvent couvrir une approche. Repérez les commandes sans perdre de vue la route du moule."
  },
  "a3c-v98-patna-staging": {
    "title": "Face à la récupération",
    "body": "Les équipements et les silhouettes de la Compagnie occupent l’aire d’arrivée. Leur organisation contraste avec l’improvisation des survivants."
  },
  "a3c-v99-adaptive-pursuit": {
    "title": "Une chasse qui se resserre",
    "body": "Plus le trajet devient prévisible, plus la créature peut vous couper la route. Un détour utile une fois ne le restera pas forcément."
  },
  "a3c-v99-chase-storm": {
    "title": "Brèche dans la tempête",
    "body": "Le vent et l’épave fragmentent le passage. Cherchez une ouverture avant que la créature ne vous pousse contre les débris."
  },
  "a3c-v99-chase-cellblock": {
    "title": "Couper à travers le bloc",
    "body": "Une traversée latérale peut laisser une chance de passer. Ne restez pas dans le même alignement lorsqu’elle change de direction."
  },
  "a3c-v99-chase-communications": {
    "title": "Retour aux communications",
    "body": "Les baies et les équipements créent des angles morts. Ils peuvent servir autant à cacher votre passage qu’à préparer une interception."
  },
  "a3c-v99-chase-foundry": {
    "title": "Embuscade de la fonderie",
    "body": "Le couloir du piège se rapproche, mais les possibilités de détour diminuent. Préservez l’espace nécessaire au dernier changement de direction."
  },
  "a3c-v99-chase-patna": {
    "title": "L’ombre avant l’arrivée",
    "body": "Les abords de l’aire d’arrivée doivent être traversés sans relâcher l’attention. Attendre une équipe ne rend pas encore le passage sûr."
  },
  "a3c-v99-camera-bridge": {
    "title": "D’un lieu à l’autre",
    "body": "Une ouverture révèle progressivement le volume suivant. Cherchez vos nouveaux repères avant d’accélérer."
  },
  "a3c-v99-pressure-meter": {
    "title": "La chasse se resserre",
    "body": "La proximité, les interceptions et le manque d’issues indiquent que la situation se dégrade. Aucun indice ne vous donne une position exacte à travers les murs."
  },
  "a3c-v99-codex-search": {
    "title": "Rechercher une information",
    "body": "Un mot suffit pour retrouver les dossiers qui en parlent. La recherche ne donne pas accès aux documents encore inconnus."
  },
  "a3c-v99-codex-links": {
    "title": "Dossiers liés",
    "body": "Un lieu, un événement et un témoin peuvent éclairer la même trace. Les liens permettent de passer de l’un à l’autre."
  },
  "a3c-v99-codex-filters": {
    "title": "Trier les documents",
    "body": "Retrouvez tous les documents, seulement ceux à lire ou ceux que vous avez marqués. Le tri ne change pas vos découvertes."
  },
  "a3c-v99-perfect-pursuit": {
    "title": "Dossier de clôture",
    "body": "Le dossier final rassemble le parcours, les documents et les rencontres. Il conserve la trace des choix accomplis, sans réécrire leurs conséquences."
  }
});
export function playerEntryV102(e){return e?{...e,...(ALIEN3_PLAYER_COPY_V102[e.id]||{})}:null;}
