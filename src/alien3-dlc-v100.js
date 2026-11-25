import {
  ALIEN3_CAMPAIGN_ID_V99,
  ALIEN3_DLC_CODEX_V99,
  ALIEN3_DLC_CODEX_TERMINALS_V99,
  ALIEN3_FIORINA_PALETTE_V99,
  ALIEN3_FIORINA_TEMPLATE_V99,
  ALIEN3_OPERATION_ID_V99,
  ALIEN3_TEMPLATE_ID_V99,
  validateAlien3DlcV99
} from './alien3-dlc-v99.js';
import { ALIEN3_HYBRID_SECTORS_V97 } from './alien3-dlc-v97.js';

export const ALIEN3_DLC_SCHEMA_V100 = 100;
export const ALIEN3_OPERATION_ID_V100 = ALIEN3_OPERATION_ID_V99;
export const ALIEN3_CAMPAIGN_ID_V100 = ALIEN3_CAMPAIGN_ID_V99;
export const ALIEN3_TEMPLATE_ID_V100 = ALIEN3_TEMPLATE_ID_V99;

const clone = (v) => JSON.parse(JSON.stringify(v));
const freeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value); for (const child of Object.values(value)) freeze(child); return value;
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));
const bool = (v, fallback = false) => typeof v === 'boolean' ? v : fallback;
const unique = (list, allowed, max = 256) => Array.isArray(list) ? [...new Set(list.filter((x) => allowed.has(x)))].slice(0, max) : [];

export const ALIEN3_FIORINA_PALETTE_V100 = freeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V99),
  id: 'fiorina-161-immersive-presentation-v100',
  light: 0.242,
  prop: 'penal-foundry-immersive-presentation-v100'
});
const template = clone(ALIEN3_FIORINA_TEMPLATE_V99);
template.label = 'Fiorina 161 · prison, galeries et fonderie';
export const ALIEN3_FIORINA_TEMPLATE_V100 = freeze(template);

const BACKGROUND = [
  ['hybrid-storm-yard','COUR DE LA TEMPÊTE','#0a1316','#151d1d','#202827',0.88,0.72],
  ['hybrid-eev-infirmary','EEV / INFIRMERIE','#080d0d','#121816','#20231f',0.93,0.64],
  ['hybrid-cellblock','BLOC CARCÉRAL','#090f0f','#141b18','#23251f',0.91,0.70],
  ['hybrid-service-tunnels','GALERIES TECHNIQUES','#060a0a','#111714','#1b1d19',0.96,0.58],
  ['hybrid-assembly-communications','COMMUNICATIONS','#090f10','#151b19','#27241d',0.91,0.68],
  ['hybrid-foundry-hall','GRANDE FONDERIE','#0b0d0c','#1b1712','#322217',0.89,0.74],
  ['hybrid-piston-mold','PISTONS / MOULE','#080b0a','#181610','#2d2115',0.95,0.61],
  ['hybrid-furnace-patna','FOUR / PATNA','#0a0c0b','#1b1713','#2d1d17',0.90,0.69],
  ['hybrid-final-platform','PLATEFORME FINALE','#070908','#15130f','#241915',0.96,0.60]
];
export const ALIEN3_BACKGROUND_PROFILES_V100 = freeze(BACKGROUND.map(([sectorId,label,skyTop,skyMid,ground,farAlpha,midAlpha], index) => ({
  id:`bg-${index+1}-${sectorId}`, sectorId, label, topEdgeY:0, skyTop, skyMid, ground,
  farAlpha, midAlpha, topArchitecture:index % 3, ceilingDepth: sectorId.includes('service') || sectorId.includes('piston') ? 150 : 94
})));

export const ALIEN3_UI_COPY_V100 = freeze({
  archiveTitle:'ARCHIVES DE FIORINA 161',
  archiveSubtitle:'Dossiers retrouvés',
  huntIdle:'Silence inhabituel',
  huntLow:'Le Runner rôde',
  huntMedium:'La chasse se resserre',
  huntHigh:'Le Runner cherche une coupure',
  huntCritical:'Danger immédiat',
  zoneOpen:'ESPACE OUVERT',
  zoneTight:'PASSAGE ÉTROIT',
  unread:'À lire',
  read:'Consultés',
  bookmarks:'Repères',
  related:'Dossiers liés',
  search:'Rechercher',
  filterAll:'Tous',
  filterUnread:'À lire',
  filterBookmarks:'Repères',
  history:'Retour',
  terminal:'Archive locale',
  complete:'Archive reconstituée'
});

export const ALIEN3_UI_FORBIDDEN_TOKENS_V100 = freeze([
  'V88','V89','V90','V91','V92','V93','V94','V95','V96','V97','V98','V99','V100',
  'QA','RUNTIME','GRAPH','DIRECTOR','ADAPTIVE PURSUIT','HYBRID DIRECTOR','CAMÉRA 0/','PREUVES ','CODEX DLC','PONTS CAM','LANE SHIFT','VUE PROFONDEUR 2.5D','VUE 2D LATÉRALE','CAPTURE QA'
]);

export const ALIEN3_V100_EVIDENCE_IDS = freeze([
  'background-top-edge-all-sectors', 'immersive-hud-active', 'immersive-codex-active', 'technical-copy-suppressed',
  'storm-background-top-edge', 'cellblock-background-top-edge', 'foundry-background-top-edge', 'patna-background-top-edge',
  'side-view-background-top-edge', 'event-copy-immersive', 'archive-copy-immersive', 'presentation-pass-complete'
]);
const evidenceIds = new Set(ALIEN3_V100_EVIDENCE_IDS);
const profileIds = new Set(ALIEN3_BACKGROUND_PROFILES_V100.map((x)=>x.id));

export function createAlien3StateV100(){ return {
  schema:100,
  presentation:{backgroundProfileId:ALIEN3_BACKGROUND_PROFILES_V100[0].id,profilesVisited:[],topEdgeVerified:[],immersiveHud:true,immersiveCodex:true,technicalCopySuppressed:true,eventCopyImmersive:true},
  evidenceRecovered:[],
  telemetry:{backgroundSwitches:0,hudDraws:0,codexDraws:0,topEdgeDraws:0},
  perfectPresentation:false
}; }

export function sanitizeAlien3StateV100(raw){
  const f=createAlien3StateV100(); if(!raw||typeof raw!=='object'||Array.isArray(raw)||Number(raw.schema)!==100)return f;
  const p=raw.presentation&&typeof raw.presentation==='object'?raw.presentation:{}; const t=raw.telemetry&&typeof raw.telemetry==='object'?raw.telemetry:{};
  return {...f,
    presentation:{
      backgroundProfileId:profileIds.has(p.backgroundProfileId)?p.backgroundProfileId:f.presentation.backgroundProfileId,
      profilesVisited:unique(p.profilesVisited,profileIds,9), topEdgeVerified:unique(p.topEdgeVerified,profileIds,9),
      immersiveHud:bool(p.immersiveHud,true),immersiveCodex:bool(p.immersiveCodex,true),technicalCopySuppressed:bool(p.technicalCopySuppressed,true),eventCopyImmersive:bool(p.eventCopyImmersive,true)
    },
    evidenceRecovered:unique(raw.evidenceRecovered,evidenceIds,12),
    telemetry:{backgroundSwitches:Math.round(clamp(t.backgroundSwitches,0,9999)),hudDraws:Math.round(clamp(t.hudDraws,0,999999)),codexDraws:Math.round(clamp(t.codexDraws,0,999999)),topEdgeDraws:Math.round(clamp(t.topEdgeDraws,0,999999))},
    perfectPresentation:bool(raw.perfectPresentation)
  };
}

export function alien3BackgroundProfileV100(sectorId){return ALIEN3_BACKGROUND_PROFILES_V100.find((x)=>x.sectorId===sectorId)||ALIEN3_BACKGROUND_PROFILES_V100[0];}
export function alien3ThreatLabelV100(pressure=0){const p=clamp(pressure,0,100);return p>=86?ALIEN3_UI_COPY_V100.huntCritical:p>=64?ALIEN3_UI_COPY_V100.huntHigh:p>=38?ALIEN3_UI_COPY_V100.huntMedium:p>=12?ALIEN3_UI_COPY_V100.huntLow:ALIEN3_UI_COPY_V100.huntIdle;}
export function alien3PlayerFacingCategoryV100(category){return ({TOUS:'Tous',ARCHIVE:'Archive',GAMEPLAY:'Survie',LIEUX:'Lieux',PERSONNAGES:'Détenus',XÉNOBIOLOGIE:'Xénobiologie',ÉVÉNEMENTS:'Événements',SYSTÈMES:'Installations',PRÉSENTATION:'Observations'})[category]||String(category||'Archive');}
export function alien3PlayerFacingFilterV100(filter){return filter==='NON LUS'?ALIEN3_UI_COPY_V100.filterUnread:filter==='FAVORIS'?ALIEN3_UI_COPY_V100.filterBookmarks:ALIEN3_UI_COPY_V100.filterAll;}
export function alien3UiTextLooksTechnicalV100(text){const upper=String(text||'').toUpperCase();return ALIEN3_UI_FORBIDDEN_TOKENS_V100.some((token)=>upper.includes(token.toUpperCase()));}

export function validateAlien3DlcV100(){
  const previous=validateAlien3DlcV99(); const failures=[...previous.failures];
  const sectorIds=new Set(ALIEN3_HYBRID_SECTORS_V97.map((x)=>x.id));
  if(ALIEN3_BACKGROUND_PROFILES_V100.length!==9)failures.push('background profile count mismatch');
  for(const profile of ALIEN3_BACKGROUND_PROFILES_V100){if(!sectorIds.has(profile.sectorId))failures.push(`unknown background sector ${profile.sectorId}`);if(profile.topEdgeY!==0)failures.push(`background not top anchored ${profile.id}`);}
  if(new Set(ALIEN3_BACKGROUND_PROFILES_V100.map((x)=>x.sectorId)).size!==9)failures.push('background sector coverage mismatch');
  for(const value of Object.values(ALIEN3_UI_COPY_V100))if(alien3UiTextLooksTechnicalV100(value))failures.push(`technical UI copy: ${value}`);
  if(ALIEN3_DLC_CODEX_V99.length!==90)failures.push('codex inheritance mismatch'); if(ALIEN3_DLC_CODEX_TERMINALS_V99.length!==7)failures.push('terminal inheritance mismatch');
  if(ALIEN3_V100_EVIDENCE_IDS.length!==12)failures.push('evidence count mismatch');
  return {ok:failures.length===0,failures,counts:{nodes:ALIEN3_FIORINA_TEMPLATE_V100.nodes.length,edges:ALIEN3_FIORINA_TEMPLATE_V100.edges.length,routes:ALIEN3_FIORINA_TEMPLATE_V100.routes.length,zones:ALIEN3_FIORINA_TEMPLATE_V100.zones.length,backgroundProfiles:9,dedicatedCodex:90,codexTerminals:7,evidence:12}};
}
