import {
  ALIEN3_CAMPAIGN_ID_V100,
  ALIEN3_FIORINA_PALETTE_V100,
  ALIEN3_FIORINA_TEMPLATE_V100,
  ALIEN3_OPERATION_ID_V100,
  ALIEN3_TEMPLATE_ID_V100,
  validateAlien3DlcV100
} from './alien3-dlc-v100.js';
import { ALIEN3_HYBRID_SECTORS_V97 } from './alien3-dlc-v97.js';

export const ALIEN3_DLC_SCHEMA_V101 = 101;
export const ALIEN3_OPERATION_ID_V101 = ALIEN3_OPERATION_ID_V100;
export const ALIEN3_CAMPAIGN_ID_V101 = ALIEN3_CAMPAIGN_ID_V100;
export const ALIEN3_TEMPLATE_ID_V101 = ALIEN3_TEMPLATE_ID_V100;

const clone = (v) => JSON.parse(JSON.stringify(v));
const freeze = (value) => { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; Object.freeze(value); for (const child of Object.values(value)) freeze(child); return value; };
const uniq = (a) => [...new Set(a)];
const hash = (s) => [...String(s)].reduce((h,c)=>Math.imul(h ^ c.charCodeAt(0),16777619)>>>0,2166136261);
const rnd = (seed) => { let x=seed>>>0; return ()=>((x=(Math.imul(x^x>>>15,1|x),x^=x+Math.imul(x^x>>>7,61|x),x^x>>>14)>>>0)/4294967296); };

export const ALIEN3_FIORINA_PALETTE_V101 = freeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V100),
  id: 'fiorina-161-level-design-bible-v101',
  light: 0.228,
  prop: 'penal-foundry-dense-set-dressing-v101'
});
const template = clone(ALIEN3_FIORINA_TEMPLATE_V100);
template.label = 'Fiorina 161 · prison industrielle densifiée';
export const ALIEN3_FIORINA_TEMPLATE_V101 = freeze(template);

const P=(id,family,role,layer,shape,minH,maxH)=>({id,family,role,layer,shape,minH,maxH});
export const ALIEN3_PROP_ARCHETYPES_V101 = freeze([
  P('beam-rib','structure','charpente','far','beam',120,260),P('support-column','structure','support','mid','column',120,300),P('roof-truss','structure','charpente','far','truss',90,220),P('gantry-frame','structure','circulation','mid','gantry',100,230),P('bulkhead-frame','structure','séparation','mid','bulkhead',100,220),P('service-arch','structure','passage','mid','arch',90,190),
  P('pipe-bank','utility','fluides','mid','pipes',60,160),P('steam-main','utility','vapeur','mid','steam-pipe',70,180),P('cable-bundle','utility','énergie','far','cables',40,120),P('duct-large','utility','ventilation','mid','duct',65,150),P('valve-cluster','utility','maintenance','mid','valves',45,100),P('vent-fan','utility','ventilation','mid','fan',55,120),P('junction-box','utility','électricité','mid','box',38,88),P('conduit-rack','utility','distribution','far','rack',80,170),
  P('cell-bars','detention','détention','mid','bars',100,210),P('security-gate','detention','sécurité','mid','gate',110,220),P('bunk-stack','detention','vie carcérale','mid','bunks',70,140),P('restraint-ring','detention','contrainte','mid','ring',35,72),P('chain-drop','detention','contrainte','front','chains',80,190),P('mesh-cage','detention','sécurité','mid','cage',90,180),
  P('med-cabinet','medical','stockage médical','mid','cabinet',60,120),P('gurney','medical','soin','mid','gurney',42,80),P('monitor-bank','medical','diagnostic','mid','monitor',55,110),P('privacy-curtain','medical','soin','front','curtain',80,160),P('wash-station','medical','hygiène','mid','sink',50,100),
  P('crucible-shell','foundry','fusion','mid','crucible',100,220),P('mold-carriage','foundry','moulage','mid','mold',70,160),P('piston-stack','foundry','pression','mid','piston',95,210),P('chain-hoist','foundry','levage','front','hoist',100,240),P('slag-bin','foundry','déchets','mid','bin',50,105),P('ladle-arm','foundry','transfert','mid','ladle',100,220),P('furnace-mouth','foundry','four','far','furnace',130,290),
  P('crate-stack','storage','stockage','mid','crates',45,110),P('barrel-cluster','storage','stockage','mid','barrels',45,100),P('locker-bank','storage','stockage personnel','mid','lockers',70,150),P('pallet-rack','storage','logistique','far','pallet',70,150),
  P('warning-stencil','signage','orientation','mid','stencil',24,48),P('sector-board','signage','orientation','mid','board',42,85),P('hazard-stripe','signage','sécurité','mid','stripe',18,34),
  P('drain-channel','environment','évacuation','mid','drain',20,42),P('puddle-patch','environment','humidité','mid','puddle',10,24),P('steam-plume','environment','atmosphère','front','steam',55,130),P('rain-sheet','environment','intempérie','front','rain',120,240),P('ash-fall','environment','atmosphère','front','ash',100,220),P('grime-runoff','environment','usure','far','grime',80,180),
  P('company-case','company','récupération','mid','case',50,100),P('portable-lamp','company','éclairage','mid','lamp',55,120),P('recovery-frame','company','récupération','far','recovery',110,230)
]);

const archetypeById = new Map(ALIEN3_PROP_ARCHETYPES_V101.map(x=>[x.id,x]));

export const ALIEN3_LEVEL_DESIGN_RULES_V101 = freeze([
  {id:'LD-001',section:'lecture',title:'Silhouette avant détail',rule:'Chaque écran doit être compréhensible en aplats : sol, plafond, obstacle principal et destination restent lisibles avant l’ajout du petit décor.'},
  {id:'LD-002',section:'lecture',title:'Point de fuite utile',rule:'Toute grande salle possède au moins un axe visuel qui guide vers la progression ou un landmark cohérent, jamais vers un mur sans fonction.'},
  {id:'LD-003',section:'lecture',title:'Pas de chemin décoratif mensonger',rule:'Aucun alignement lumineux, câble, rambarde ou série de props ne doit suggérer une route inaccessible sauf si le blocage est clairement matérialisé.'},
  {id:'LD-004',section:'lecture',title:'Silence visuel',rule:'Une zone de repos visuel de 15 à 25 % de l’écran doit séparer deux masses décoratives denses pour préserver les silhouettes et les menaces.'},
  {id:'LD-005',section:'échelle',title:'Échelle humaine constante',rule:'Portes, lits, passerelles, casiers et machines utilisent Ripley comme référence ; aucun prop ne change arbitrairement d’échelle entre secteurs.'},
  {id:'LD-006',section:'échelle',title:'Machines crédibles',rule:'Une machine plus haute qu’un étage doit disposer de supports, conduites ou accès de maintenance justifiant sa présence.'},
  {id:'LD-007',section:'structure',title:'Charge transmise',rule:'Poutres, passerelles et plateformes doivent visuellement reposer sur des appuis ou disparaître dans une masse structurelle crédible.'},
  {id:'LD-008',section:'structure',title:'Aucune porte flottante',rule:'Toute porte est intégrée dans un mur, cadre, sas, cage ou volume architectural ; jamais posée seule dans le vide.'},
  {id:'LD-009',section:'structure',title:'Verticalité justifiée',rule:'Échelles et passerelles desservent une destination identifiable : maintenance, cellules, conduits, commandes ou fonderie.'},
  {id:'LD-010',section:'fonction',title:'Prop = fonction',rule:'Chaque prop visible appartient à une fonction : structure, circulation, énergie, ventilation, détention, soin, stockage, fusion, sécurité ou récupération.'},
  {id:'LD-011',section:'fonction',title:'Familles regroupées',rule:'Les props techniques apparaissent en grappes fonctionnelles : vanne près des conduites, tableau près des câbles, treuil près d’une charge.'},
  {id:'LD-012',section:'fonction',title:'Pas de remplissage aléatoire',rule:'Les petits objets ne sont ajoutés que s’ils expliquent l’usage du lieu ou soutiennent une composition, jamais pour remplir un trou.'},
  {id:'LD-013',section:'densité',title:'Trois couches minimum',rule:'Chaque secteur combine au moins trois couches : fond structurel, set dressing jouable, avant-plan léger.'},
  {id:'LD-014',section:'densité',title:'Sept familles minimum',rule:'Un secteur important doit montrer au moins sept familles de décor différentes sans casser sa fonction dominante.'},
  {id:'LD-015',section:'densité',title:'Répétition plafonnée',rule:'Un même archétype ne dépasse pas 18 % des props d’un secteur sauf motif structurel explicitement répétitif comme des barreaux.'},
  {id:'LD-016',section:'densité',title:'Rythme dense / calme / dense',rule:'La densité varie le long de l’axe X ; elle ne doit jamais former un tapis uniforme de props.'},
  {id:'LD-017',section:'parallaxe',title:'Fond lent',rule:'Structures lointaines suivent 0,08 à 0,18 du déplacement caméra pour conserver leur masse.'},
  {id:'LD-018',section:'parallaxe',title:'Plan médian mesuré',rule:'Conduites, racks et architectures secondaires suivent 0,28 à 0,48 du déplacement caméra.'},
  {id:'LD-019',section:'parallaxe',title:'Avant-plan ponctuel',rule:'Chaînes, vapeur, câbles et silhouettes d’avant-plan suivent 1,08 à 1,20 mais ne masquent jamais durablement le joueur.'},
  {id:'LD-020',section:'parallaxe',title:'Horizon top-aligné',rule:'Aucune couche de fond ne commence sous le bord supérieur ; les masses principales existent dès y=0.'},
  {id:'LD-021',section:'combat',title:'Silhouette du Runner',rule:'Dans une zone de chasse, au moins un couloir visuel reste libre autour de la silhouette du Runner pendant ses attaques majeures.'},
  {id:'LD-022',section:'combat',title:'Couverture non décorative',rule:'Les gros props près du plan jouable ne simulent pas une couverture si le système ne les traite pas comme telle.'},
  {id:'LD-023',section:'combat',title:'Angles morts intentionnels',rule:'Les occultants en profondeur sont placés pour créer une décision et non pour cacher gratuitement l’action.'},
  {id:'LD-024',section:'navigation',title:'Landmarks uniques',rule:'Chaque secteur possède au moins deux landmarks reconnaissables de loin et non réutilisés à l’identique ailleurs.'},
  {id:'LD-025',section:'navigation',title:'Entrée et sortie distinctes',rule:'Les extrémités d’un secteur utilisent silhouettes, éclairage ou signalétique différents pour éviter les demi-tours involontaires.'},
  {id:'LD-026',section:'navigation',title:'Secret intégré',rule:'Un secret s’intègre à l’architecture : conduit, espace derrière structure, passerelle haute ou maintenance ; jamais une porte flottante hors contexte.'},
  {id:'LD-027',section:'lore',title:'État de Fiorina',rule:'Métal usé, humidité, réparations, conduites apparentes et équipements réemployés dominent ; aucune technologie propre et neuve sans justification.'},
  {id:'LD-028',section:'lore',title:'Pas de luxe',rule:'Les espaces carcéraux et techniques restent austères ; couleurs, mobilier et éclairage traduisent récupération et privation.'},
  {id:'LD-029',section:'lore',title:'Patna tranche visuellement',rule:'Le matériel de la Compagnie est plus propre, portable et normalisé afin de contraster avec Fiorina sans reskin total du décor.'},
  {id:'LD-030',section:'lumière',title:'Source visible',rule:'Toute lumière forte doit avoir une source plausible : lampe, four, panneau, ouverture ou équipement portable.'},
  {id:'LD-031',section:'lumière',title:'Contraste local',rule:'Les points interactifs gagnent en contraste local plutôt qu’en ajoutant des contours UI permanents.'},
  {id:'LD-032',section:'qa',title:'Audit par écran',rule:'Chaque écran vérifie densité, familles, répétition, supports, landmark, lisibilité de route, silhouette joueur/Runner et absence de texte technique.'}
]);

const sectorSpec = (id,dominant,targetMin,targetMax,landmarks,allowed,forbidden,notes,parallax)=>({id,dominant,targetMin,targetMax,landmarks,allowed,forbidden,notes,parallax});
export const ALIEN3_LEVEL_DESIGN_SECTORS_V101 = freeze([
  sectorSpec('hybrid-storm-yard','intempérie / épave',34,44,['coque EEV brisée','tour de prise d’air'],['structure','utility','environment','storage','signage'],['medical','foundry','company'],'Vent, pluie, drainage, tôles, conduites extérieures. Le vide horizontal sert la lecture de l’épave et des déplacements en profondeur.',{far:.10,mid:.34,front:1.12}),
  sectorSpec('hybrid-eev-infirmary','médical improvisé',30,38,['module EEV','baie médicale'],['structure','utility','medical','storage','signage','environment'],['foundry','company'],'Passage du militaire accidenté au soin pénitentiaire : cabinets, rideaux, lavage, câbles provisoires et métal humide.',{far:.12,mid:.38,front:1.08}),
  sectorSpec('hybrid-cellblock','détention',42,54,['mur de cellules','passerelle de surveillance'],['structure','utility','detention','storage','signage','environment'],['medical','company'],'Répétition carcérale contrôlée par variations de cages, barreaux, chaînes et passerelles. Les grands rythmes verticaux dominent.',{far:.09,mid:.31,front:1.14}),
  sectorSpec('hybrid-service-tunnels','maintenance',36,46,['collecteur principal','ventilateur axial'],['structure','utility','storage','signage','environment'],['medical','company'],'Conduits serrés, vannes, boîtes de jonction, racks, drainage et vapeur. Aucun gros prop ne doit masquer les pièges 2D.',{far:.14,mid:.46,front:1.10}),
  sectorSpec('hybrid-assembly-communications','communications / assemblée',34,44,['mur radio','tableau de relais'],['structure','utility','detention','storage','signage'],['medical','foundry'],'Grand volume collectif réemployé pour communications : racks, câbles, vieux mobilier carcéral et axes de circulation clairs.',{far:.11,mid:.35,front:1.08}),
  sectorSpec('hybrid-foundry-hall','fonderie',44,58,['creuset principal','portique de levage'],['structure','utility','foundry','storage','signage','environment'],['medical','detention'],'Le décor explique le flux du métal : four → creuset → levage → moule → laitier. Les chaînes et conduites suivent ce trajet.',{far:.08,mid:.30,front:1.18}),
  sectorSpec('hybrid-piston-mold','piège industriel',32,40,['batterie de pistons','moule central'],['structure','utility','foundry','signage','environment'],['medical','company'],'Densité maîtrisée : priorité aux pistons, alimentation en plomb et réseau d’eau ; le piège doit rester lisible en 2D stricte.',{far:.12,mid:.42,front:1.10}),
  sectorSpec('hybrid-furnace-patna','four / récupération',38,48,['bouche du four','cadre de récupération Patna'],['structure','utility','foundry','company','storage','signage','environment'],['medical'],'Contraste entre Fiorina sale et matériel Patna plus propre. Les deux langages visuels se croisent sans se mélanger.',{far:.09,mid:.32,front:1.12}),
  sectorSpec('hybrid-final-platform','finale',28,36,['four principal','plateforme terminale'],['structure','utility','foundry','company','signage','environment'],['medical','detention'],'Composition plus épurée pour préserver les silhouettes et la décision finale. Props regroupés aux bords, centre lisible.',{far:.10,mid:.36,front:1.08})
]);

const poolByFamily = new Map();
for (const prop of ALIEN3_PROP_ARCHETYPES_V101) { const list=poolByFamily.get(prop.family)||[]; list.push(prop); poolByFamily.set(prop.family,list); }
export function buildAlien3DecorLayoutV101(sectorId){
  const spec=ALIEN3_LEVEL_DESIGN_SECTORS_V101.find(x=>x.id===sectorId); const sector=ALIEN3_HYBRID_SECTORS_V97.find(x=>x.id===sectorId); if(!spec||!sector)return[];
  const rand=rnd(hash(`v101:${sectorId}`)); const target=spec.targetMin+Math.floor(rand()*(spec.targetMax-spec.targetMin+1)); const props=[]; const families=[...spec.allowed];
  for(let i=0;i<target;i++){
    const family=families[i<families.length?i:Math.floor(rand()*families.length)]; const pool=poolByFamily.get(family)||[]; if(!pool.length)continue; const archetype=pool[Math.floor(rand()*pool.length)];
    const span=sector.x1-sector.x0; const x=sector.x0+28+rand()*Math.max(40,span-56); const h=archetype.minH+rand()*(archetype.maxH-archetype.minH); const yNorm=archetype.layer==='far'?.12+rand()*.30:archetype.layer==='front'?.58+rand()*.28:.48+rand()*.30;
    props.push({id:`${sectorId}:${i}`,archetypeId:archetype.id,family,role:archetype.role,layer:archetype.layer,shape:archetype.shape,x:Number(x.toFixed(1)),yNorm:Number(yNorm.toFixed(3)),height:Number(h.toFixed(1)),scale:Number((.84+rand()*.34).toFixed(2)),flip:rand()>.5});
  }
  return props;
}

export const ALIEN3_LEVEL_DESIGN_LAYOUTS_V101 = freeze(Object.fromEntries(ALIEN3_LEVEL_DESIGN_SECTORS_V101.map(s=>[s.id,buildAlien3DecorLayoutV101(s.id)])));

export const ALIEN3_LEVEL_DESIGN_CODEX_V101 = freeze({
  title:'CODEX DE LEVEL DESIGN · FIORINA 161',
  purpose:'Règles de production exécutables pour densifier les fonds, remplacer les placeholders et garantir une cohérence fonctionnelle entre décor, gameplay, lore et lisibilité.',
  referenceScale:{playerHeight:'1,80 m environ',door:'2,1–2,4 m',railing:'1,0–1,15 m',catwalkClearance:'2,2 m minimum',maintenanceGap:'0,9–1,2 m',largeMachine:'doit montrer support + alimentation + accès'},
  composition:{bands:['0–18 % plafond / silhouette haute','18–45 % fond structurel','45–72 % architecture médiane','72–88 % plan jouable','88–100 % avant-plan ponctuel'],screenRhythm:'dense / respiration / landmark / respiration / dense',safeReadZone:'au moins 15 % de l’écran sans gros prop autour du joueur pendant une poursuite'},
  rules:ALIEN3_LEVEL_DESIGN_RULES_V101,
  sectors:ALIEN3_LEVEL_DESIGN_SECTORS_V101,
  props:ALIEN3_PROP_ARCHETYPES_V101
});

export function auditAlien3LevelDesignV101(){
  const failures=[]; const sectors=[];
  for(const spec of ALIEN3_LEVEL_DESIGN_SECTORS_V101){const layout=ALIEN3_LEVEL_DESIGN_LAYOUTS_V101[spec.id]||[];const fam=uniq(layout.map(p=>p.family));const counts={};for(const p of layout)counts[p.archetypeId]=(counts[p.archetypeId]||0)+1;const maxRepeat=Math.max(0,...Object.values(counts));const repeatRatio=layout.length?maxRepeat/layout.length:1;const forbidden=layout.filter(p=>spec.forbidden.includes(p.family));if(layout.length<spec.targetMin||layout.length>spec.targetMax)failures.push(`${spec.id}: density ${layout.length}`);if(fam.length<Math.min(5,spec.allowed.length))failures.push(`${spec.id}: family diversity ${fam.length}`);if(repeatRatio>.24)failures.push(`${spec.id}: repetition ${(repeatRatio*100).toFixed(1)}%`);if(forbidden.length)failures.push(`${spec.id}: forbidden family`);sectors.push({id:spec.id,props:layout.length,families:fam.length,maxRepeat,repeatRatio:Number(repeatRatio.toFixed(3)),landmarks:spec.landmarks.length});}
  return {ok:!failures.length,failures,sectors,totalProps:sectors.reduce((a,b)=>a+b.props,0),rules:ALIEN3_LEVEL_DESIGN_RULES_V101.length,archetypes:ALIEN3_PROP_ARCHETYPES_V101.length};
}

export function validateAlien3DlcV101(){const previous=validateAlien3DlcV100();const failures=[...previous.failures];const audit=auditAlien3LevelDesignV101();failures.push(...audit.failures);if(ALIEN3_LEVEL_DESIGN_RULES_V101.length<30)failures.push('level design rules too shallow');if(ALIEN3_PROP_ARCHETYPES_V101.length<45)failures.push('prop catalog too small');if(audit.totalProps<300)failures.push('set dressing density too low');return{ok:!failures.length,failures,counts:{nodes:ALIEN3_FIORINA_TEMPLATE_V101.nodes.length,edges:ALIEN3_FIORINA_TEMPLATE_V101.edges.length,routes:ALIEN3_FIORINA_TEMPLATE_V101.routes.length,zones:ALIEN3_FIORINA_TEMPLATE_V101.zones.length,levelDesignRules:ALIEN3_LEVEL_DESIGN_RULES_V101.length,propArchetypes:ALIEN3_PROP_ARCHETYPES_V101.length,setDressingProps:audit.totalProps,sectors:9}};}

export function createAlien3StateV101(){return{schema:101,visitedSectors:[],decorDraws:0,farDraws:0,midDraws:0,frontDraws:0,audit:auditAlien3LevelDesignV101(),perfectDecor:false};}
export function sanitizeAlien3StateV101(raw){const f=createAlien3StateV101();if(!raw||typeof raw!=='object'||Number(raw.schema)!==101)return f;return{...f,visitedSectors:Array.isArray(raw.visitedSectors)?uniq(raw.visitedSectors.filter(id=>ALIEN3_LEVEL_DESIGN_LAYOUTS_V101[id])).slice(0,9):[],decorDraws:Math.max(0,Math.round(Number(raw.decorDraws)||0)),farDraws:Math.max(0,Math.round(Number(raw.farDraws)||0)),midDraws:Math.max(0,Math.round(Number(raw.midDraws)||0)),frontDraws:Math.max(0,Math.round(Number(raw.frontDraws)||0)),perfectDecor:Boolean(raw.perfectDecor)};}
