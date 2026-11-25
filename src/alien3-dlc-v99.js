import {
  ALIEN3_CAMPAIGN_ID_V98,
  ALIEN3_DLC_CODEX_BATCHES_V98,
  ALIEN3_DLC_CODEX_CATEGORIES_V98,
  ALIEN3_DLC_CODEX_TERMINALS_V98,
  ALIEN3_DLC_CODEX_V98,
  ALIEN3_FIORINA_PALETTE_V98,
  ALIEN3_FIORINA_TEMPLATE_V98,
  ALIEN3_HYBRID_DIRECTOR_PROFILES_V98,
  ALIEN3_OPERATION_ID_V98,
  ALIEN3_TEMPLATE_ID_V98,
  validateAlien3DlcV98
} from './alien3-dlc-v98.js';

export const ALIEN3_DLC_SCHEMA_V99 = 99;
export const ALIEN3_OPERATION_ID_V99 = ALIEN3_OPERATION_ID_V98;
export const ALIEN3_CAMPAIGN_ID_V99 = ALIEN3_CAMPAIGN_ID_V98;
export const ALIEN3_TEMPLATE_ID_V99 = ALIEN3_TEMPLATE_ID_V98;

const clone = (v) => JSON.parse(JSON.stringify(v));
const freeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value); for (const child of Object.values(value)) freeze(child); return value;
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));
const bool = (v, fallback = false) => typeof v === 'boolean' ? v : fallback;
const unique = (list, allowed, max = 256) => Array.isArray(list) ? [...new Set(list.filter((x) => allowed.has(x)))].slice(0, max) : [];

export const ALIEN3_FIORINA_PALETTE_V99 = freeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V98),
  id: 'fiorina-161-adaptive-pursuit-v99',
  light: 0.238,
  prop: 'penal-foundry-adaptive-pursuit-v99'
});
const template = clone(ALIEN3_FIORINA_TEMPLATE_V98);
template.label = 'Fiorina 161 · Adaptive Pursuit / cinematic hybrid transitions / codex graph';
export const ALIEN3_FIORINA_TEMPLATE_V99 = freeze(template);

export const ALIEN3_ADAPTIVE_CHASES_V99 = freeze([
  { id:'chase-storm-breach', label:'BRÈCHE TEMPÊTE', sectorId:'hybrid-storm-yard', x0:260, x1:650, targetX:700, preferredLane:1, pressure:0.34, cameraKick:0.10 },
  { id:'chase-cellblock-crosscut', label:'COUPE DU BLOC', sectorId:'hybrid-cellblock', x0:2050, x1:2750, targetX:2820, preferredLane:2, pressure:0.58, cameraKick:0.16 },
  { id:'chase-communications-return', label:'RETOUR COMMUNICATIONS', sectorId:'hybrid-assembly-communications', x0:3580, x1:3920, targetX:4000, preferredLane:0, pressure:0.50, cameraKick:0.13 },
  { id:'chase-foundry-cutoff', label:'COUPURE FONDERIE', sectorId:'hybrid-foundry-hall', x0:4100, x1:4580, targetX:4680, preferredLane:1, pressure:0.82, cameraKick:0.22 },
  { id:'chase-patna-shadow', label:'OMBRE PATNA', sectorId:'hybrid-furnace-patna', x0:5260, x1:5620, targetX:5720, preferredLane:0, pressure:0.62, cameraKick:0.14 }
]);

export const ALIEN3_CAMERA_BRIDGES_V99 = freeze(ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.map((profile, index) => ({
  id:`bridge-${profile.id}`, profileId:profile.id, mode:profile.mode,
  enterSeconds: profile.mode === 'depth' ? 0.46 : 0.34,
  exitSeconds: profile.mode === 'depth' ? 0.38 : 0.30,
  leadBlend: clamp(0.52 + index * 0.035, 0.52, 0.78),
  horizonBlend: profile.mode === 'depth' ? 0.72 : 0.26
})));

const C = (id,title,category,body,links=[]) => ({ id,title,category,body,links });
export const ALIEN3_DLC_CODEX_EXTENSION_V99 = freeze([
  C('a3c-v99-adaptive-pursuit','DIRECTEUR DE POURSUITE ADAPTATIF','GAMEPLAY','Cinq poursuites majeures réutilisent les routes existantes. Le Runner coupe, comprime ou feinte selon le plan du joueur et la pression déjà accumulée.', ['a3c-v98-runner-telegraph','a3c-xeno-runner']),
  C('a3c-v99-chase-storm','BRÈCHE DE LA TEMPÊTE','ÉVÉNEMENTS','Première poursuite ouverte : elle apprend à lire les plans sans transformer la cour en arène de combat.', ['a3c-v98-camera-contracts','a3c-v99-adaptive-pursuit']),
  C('a3c-v99-chase-cellblock','COUPE DU BLOC','ÉVÉNEMENTS','Le Runner tente une coupe depuis le plan avant pendant que le joueur traverse le bloc carcéral.', ['a3c-v98-prison-staging','a3c-v99-adaptive-pursuit']),
  C('a3c-v99-chase-communications','RETOUR AUX COMMUNICATIONS','ÉVÉNEMENTS','La poursuite exploite la baie de communication et ses occultants plutôt qu’un spawn arbitraire.', ['a3c-v98-depth-cover','a3c-v99-adaptive-pursuit']),
  C('a3c-v99-chase-foundry','COUPURE DE FONDERIE','ÉVÉNEMENTS','Le point de pression le plus élevé de V99 rabat le joueur vers le couloir industriel qui mène au piège.', ['a3c-v98-foundry-staging','a3c-v99-adaptive-pursuit']),
  C('a3c-v99-chase-patna','OMBRE AVANT PATNA','ÉVÉNEMENTS','Dernière poursuite ouverte avant que la mise en scène de la Compagnie reprenne le contrôle de la tension.', ['a3c-v98-patna-staging','a3c-v99-adaptive-pursuit']),
  C('a3c-v99-camera-bridge','PONT DE CAMÉRA','PRÉSENTATION','Les changements de contrat caméra sont maintenant interpolés. La profondeur se construit ou s’efface au lieu de basculer d’un frame à l’autre.', ['a3c-v98-camera-contracts','a3c-v98-side-readability']),
  C('a3c-v99-pressure-meter','PRESSION DE CHASSE','SYSTÈMES','Le HUD indique une pression abstraite 0–100 : elle décrit la densité de la poursuite, pas la position exacte du Runner.', ['a3c-v99-adaptive-pursuit','a3c-v96-directional-threat']),
  C('a3c-v99-codex-search','RECHERCHE CODEX','SYSTÈMES','Le Codex peut filtrer les entrées débloquées par titre, catégorie ou texte sans affecter la sauvegarde de progression.', ['a3c-v98-codex-ui']),
  C('a3c-v99-codex-links','LIENS CROISÉS','SYSTÈMES','Certaines entrées proposent des liens vers événements, lieux, personnages ou systèmes connexes afin de naviguer comme dans une vraie base documentaire.', ['a3c-v99-codex-search','a3c-v98-codex-bookmarks']),
  C('a3c-v99-codex-filters','FILTRES RAPIDES','SYSTÈMES','TOUS, NON LUS et FAVORIS peuvent être combinés à la recherche. Aucun filtre ne débloque une entrée non acquise.', ['a3c-v99-codex-search','a3c-v98-codex-unread']),
  C('a3c-v99-perfect-pursuit','ARCHIVE PARFAITE · PURSUIT','ARCHIVE','Le grade maximal V99 exige les cinq poursuites résolues, les ponts caméra parcourus et le Codex 90 entièrement lu.', ['a3c-v99-adaptive-pursuit','a3c-v99-codex-links'])
]);

export const ALIEN3_DLC_CODEX_V99 = freeze([
  ...clone(ALIEN3_DLC_CODEX_V98),
  ...clone(ALIEN3_DLC_CODEX_EXTENSION_V99)
]);
export const ALIEN3_DLC_CODEX_TERMINALS_V99 = freeze([
  ...clone(ALIEN3_DLC_CODEX_TERMINALS_V98),
  { id:'a3c-terminal-pursuit-v99', label:'CODEX DLC · ADAPTIVE PURSUIT', x:4525, y:438, w:66, h:72, lane:2, batch:'pursuit-v99' }
]);
export const ALIEN3_DLC_CODEX_BATCHES_V99 = freeze({
  ...clone(ALIEN3_DLC_CODEX_BATCHES_V98),
  'pursuit-v99': ALIEN3_DLC_CODEX_EXTENSION_V99.map((entry) => entry.id)
});
export const ALIEN3_DLC_CODEX_CATEGORIES_V99 = ALIEN3_DLC_CODEX_CATEGORIES_V98;
export const ALIEN3_CODEX_FILTERS_V99 = freeze(['TOUS','NON LUS','FAVORIS']);

export const ALIEN3_V99_EVIDENCE_IDS = freeze([
  'adaptive-pursuit-ready','five-chases-seen','five-chases-cleared','camera-bridge-seen','camera-bridges-complete','pressure-understood',
  'codex-search-used','codex-search-result','codex-filter-used','codex-link-used','codex-history-used','codex-pursuit-terminal',
  'codex-90-complete','codex-90-read','runner-cutoff-evaded','foundry-pursuit-cleared','patna-pursuit-cleared','perfect-adaptive-pursuit'
]);

const codexIds = new Set(ALIEN3_DLC_CODEX_V99.map((x)=>x.id));
const extensionIds = new Set(ALIEN3_DLC_CODEX_EXTENSION_V99.map((x)=>x.id));
const terminalIds = new Set(ALIEN3_DLC_CODEX_TERMINALS_V99.map((x)=>x.id));
const chaseIds = new Set(ALIEN3_ADAPTIVE_CHASES_V99.map((x)=>x.id));
const bridgeIds = new Set(ALIEN3_CAMERA_BRIDGES_V99.map((x)=>x.id));
const evidenceIds = new Set(ALIEN3_V99_EVIDENCE_IDS);
const filterIds = new Set(ALIEN3_CODEX_FILTERS_V99);

export function createAlien3StateV99(){ return {
  schema:99,
  pursuit:{activeId:null,pressure:0,cooldown:0,started:[],cleared:[],evaded:[],cutoffs:[],lastOutcome:null,activeSeconds:0,maxPressure:0,runnerCutoffs:0},
  cameraBridge:{activeId:null,blend:1,seconds:0,fromProfileId:null,toProfileId:null,visited:[],changes:0},
  codexGraph:{extensionUnlocked:[],extensionViewed:[],extensionBookmarks:[],terminalsRead:[],currentId:null,query:'',filter:'TOUS',history:[],historyIndex:-1,linkCursor:0,searchUses:0,filterUses:0,linkUses:0,historyUses:0},
  evidenceRecovered:[],
  perfectArchive:{inheritedV98:false,pursuitsComplete:false,cameraComplete:false,codexUnlockComplete:false,codexReadComplete:false,codexNavigationComplete:false,perfect:false},
  telemetry:{chasesStarted:0,chasesCleared:0,chasesEvaded:0,cameraBridges:0,maxPressure:0,codexSearches:0,codexFilters:0,codexLinks:0,codexHistory:0},
  achievementIds:[]
}; }

export function sanitizeAlien3StateV99(raw){
  const f=createAlien3StateV99(); if(!raw||typeof raw!=='object'||Array.isArray(raw)||Number(raw.schema)!==99)return f;
  const p=raw.pursuit&&typeof raw.pursuit==='object'?raw.pursuit:{}; const c=raw.cameraBridge&&typeof raw.cameraBridge==='object'?raw.cameraBridge:{}; const g=raw.codexGraph&&typeof raw.codexGraph==='object'?raw.codexGraph:{}; const q=raw.perfectArchive&&typeof raw.perfectArchive==='object'?raw.perfectArchive:{}; const t=raw.telemetry&&typeof raw.telemetry==='object'?raw.telemetry:{};
  return {...f,
    pursuit:{activeId:chaseIds.has(p.activeId)?p.activeId:null,pressure:clamp(p.pressure,0,100),cooldown:clamp(p.cooldown,0,120),started:unique(p.started,chaseIds,5),cleared:unique(p.cleared,chaseIds,5),evaded:unique(p.evaded,chaseIds,5),cutoffs:unique(p.cutoffs,chaseIds,5),lastOutcome:typeof p.lastOutcome==='string'?p.lastOutcome.slice(0,48):null,activeSeconds:clamp(p.activeSeconds,0,9999),maxPressure:clamp(p.maxPressure,0,100),runnerCutoffs:Math.round(clamp(p.runnerCutoffs,0,9999))},
    cameraBridge:{activeId:bridgeIds.has(c.activeId)?c.activeId:null,blend:clamp(c.blend,0,1),seconds:clamp(c.seconds,0,10),fromProfileId:typeof c.fromProfileId==='string'?c.fromProfileId.slice(0,64):null,toProfileId:typeof c.toProfileId==='string'?c.toProfileId.slice(0,64):null,visited:unique(c.visited,bridgeIds,ALIEN3_CAMERA_BRIDGES_V99.length),changes:Math.round(clamp(c.changes,0,9999))},
    codexGraph:{extensionUnlocked:unique(g.extensionUnlocked,extensionIds,12),extensionViewed:unique(g.extensionViewed,extensionIds,12),extensionBookmarks:unique(g.extensionBookmarks,extensionIds,12),terminalsRead:unique(g.terminalsRead,terminalIds,7),currentId:codexIds.has(g.currentId)?g.currentId:null,query:typeof g.query==='string'?g.query.slice(0,48):'',filter:filterIds.has(g.filter)?g.filter:'TOUS',history:unique(g.history,codexIds,64),historyIndex:Math.round(clamp(g.historyIndex,-1,63)),linkCursor:Math.round(clamp(g.linkCursor,0,16)),searchUses:Math.round(clamp(g.searchUses,0,9999)),filterUses:Math.round(clamp(g.filterUses,0,9999)),linkUses:Math.round(clamp(g.linkUses,0,9999)),historyUses:Math.round(clamp(g.historyUses,0,9999))},
    evidenceRecovered:unique(raw.evidenceRecovered,evidenceIds,18),
    perfectArchive:{inheritedV98:bool(q.inheritedV98),pursuitsComplete:bool(q.pursuitsComplete),cameraComplete:bool(q.cameraComplete),codexUnlockComplete:bool(q.codexUnlockComplete),codexReadComplete:bool(q.codexReadComplete),codexNavigationComplete:bool(q.codexNavigationComplete),perfect:bool(q.perfect)},
    telemetry:{chasesStarted:Math.round(clamp(t.chasesStarted,0,9999)),chasesCleared:Math.round(clamp(t.chasesCleared,0,9999)),chasesEvaded:Math.round(clamp(t.chasesEvaded,0,9999)),cameraBridges:Math.round(clamp(t.cameraBridges,0,9999)),maxPressure:clamp(t.maxPressure,0,100),codexSearches:Math.round(clamp(t.codexSearches,0,9999)),codexFilters:Math.round(clamp(t.codexFilters,0,9999)),codexLinks:Math.round(clamp(t.codexLinks,0,9999)),codexHistory:Math.round(clamp(t.codexHistory,0,9999))},
    achievementIds:Array.isArray(raw.achievementIds)?[...new Set(raw.achievementIds.filter((x)=>typeof x==='string').map((x)=>x.slice(0,96)))].slice(0,128):[]
  };
}

export function alien3AdaptiveChaseV99(id){return ALIEN3_ADAPTIVE_CHASES_V99.find((x)=>x.id===id)||null;}
export function alien3AdaptiveChaseAtV99(sectorId,x){return ALIEN3_ADAPTIVE_CHASES_V99.find((c)=>c.sectorId===sectorId&&Number(x)>=c.x0&&Number(x)<=c.x1)||null;}
export function alien3CameraBridgeV99(profileId){return ALIEN3_CAMERA_BRIDGES_V99.find((x)=>x.profileId===profileId)||ALIEN3_CAMERA_BRIDGES_V99[0];}
export function alien3DlcCodexEntryV99(id){return ALIEN3_DLC_CODEX_V99.find((x)=>x.id===id)||null;}
export function alien3DlcCodexBatchV99(id){return [...(ALIEN3_DLC_CODEX_BATCHES_V99[id]||[])];}
export function alien3CodexSearchV99({unlocked=[],viewed=[],bookmarks=[],query='',filter='TOUS',category='TOUS'}={}){
  const allow=new Set(unlocked), seen=new Set(viewed), marks=new Set(bookmarks); const q=String(query||'').trim().toLowerCase();
  return ALIEN3_DLC_CODEX_V99.filter((entry)=>{
    if(!allow.has(entry.id))return false; if(category!=='TOUS'&&entry.category!==category)return false;
    if(filter==='NON LUS'&&seen.has(entry.id))return false; if(filter==='FAVORIS'&&!marks.has(entry.id))return false;
    return !q||`${entry.title} ${entry.category} ${entry.body}`.toLowerCase().includes(q);
  });
}
export function alien3CodexLinksV99(id,unlocked=[]){const allow=new Set(unlocked);const entry=alien3DlcCodexEntryV99(id);return (entry?.links||[]).filter((x)=>allow.has(x)&&codexIds.has(x));}

export function alien3V99Grade({gradeV98='D',evidence=0,chases=0,codex=0,read=0,navigation=0,perfect=false}={}){
  const base={'S+++++++++':282,'S++++++++':266,'S+++++++':250,'S++++++':234,'S+++++':218,'S++++':202,'S+++':186,'S++':170,'S+':154,S:138,A:120,B:102,C:84,D:64}[gradeV98]||64;
  const score=base+clamp(evidence/18,0,1)*8+clamp(chases/5,0,1)*6+clamp(codex/90,0,1)*5+clamp(read/90,0,1)*4+clamp(navigation/3,0,1)*3+(perfect?7:0);
  return score>=315?'S++++++++++':score>=298?'S+++++++++':score>=282?'S++++++++':score>=266?'S+++++++':score>=250?'S++++++':score>=234?'S+++++':score>=218?'S++++':score>=202?'S+++':score>=186?'S++':score>=170?'S+':score>=154?'S':score>=132?'A':score>=110?'B':score>=90?'C':'D';
}

export function validateAlien3DlcV99(){
  const previous=validateAlien3DlcV98(); const failures=[...previous.failures]; const {nodes,edges,routes,zones,dimensions}=ALIEN3_FIORINA_TEMPLATE_V99;
  if(nodes.length!==72)failures.push(`node count ${nodes.length} != 72`); if(edges.length!==119)failures.push(`edge count ${edges.length} != 119`); if(routes.length!==4)failures.push(`route count ${routes.length} != 4`); if(zones.length!==6)failures.push(`zone count ${zones.length} != 6`);
  if(ALIEN3_ADAPTIVE_CHASES_V99.length!==5)failures.push('adaptive chase count mismatch'); if(ALIEN3_CAMERA_BRIDGES_V99.length!==9)failures.push('camera bridge count mismatch'); if(ALIEN3_DLC_CODEX_V99.length!==90)failures.push(`codex count ${ALIEN3_DLC_CODEX_V99.length} != 90`); if(ALIEN3_DLC_CODEX_TERMINALS_V99.length!==7)failures.push('terminal count mismatch'); if(ALIEN3_V99_EVIDENCE_IDS.length!==18)failures.push('evidence count mismatch');
  if(new Set(ALIEN3_DLC_CODEX_V99.map((x)=>x.id)).size!==90)failures.push('duplicate codex ids'); if(new Set(ALIEN3_ADAPTIVE_CHASES_V99.map((x)=>x.id)).size!==5)failures.push('duplicate chase ids');
  for(const chase of ALIEN3_ADAPTIVE_CHASES_V99){if(chase.x0<0||chase.x1>dimensions.width||chase.x1<=chase.x0||chase.targetX<=chase.x1)failures.push(`invalid chase ${chase.id}`);}
  const coverage=new Set(Object.values(ALIEN3_DLC_CODEX_BATCHES_V99).flat()); if(coverage.size!==90)failures.push(`codex batch coverage ${coverage.size}/90`);
  return {ok:failures.length===0,failures,counts:{nodes:nodes.length,edges:edges.length,routes:routes.length,zones:zones.length,adaptiveChases:5,cameraBridges:9,dedicatedCodex:90,codexTerminals:7,evidence:18}};
}
