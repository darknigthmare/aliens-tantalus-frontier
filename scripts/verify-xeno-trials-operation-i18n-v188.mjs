import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {EN_CATALOG_V185 as C,EN_PATTERNS_V185 as P} from '../src/i18n-en-catalog-v185.js';
import {autoTranslateV185 as translate,useCatalogV185} from '../src/i18n-auto-v185.js';
import {setLanguageV185} from '../src/i18n-v185.js';
import {mergeReviewV186,validateCatalogV186} from './i18n-catalog-maintenance-v186.mjs';
import {XENO_TRIALS_OPERATIONS_V188 as OPS,createXenoTrialsOperationStateV188 as create,getXenoTrialsOperationViewV188 as view} from '../src/xeno-trials-operations-v188.js';
import {getXenoTrialsOperationBriefingV188 as briefing,getXenoTrialsOperationHudV188 as hud} from '../src/xeno-trials-operation-presentation-v188.js';
import {XENO_TRIALS_BRANCHES_V119 as BRANCHES,resolveXenoTrialsActivityV119 as resolve,createXenoTrialsModesProgressV119 as modes} from '../src/xeno-trials-modes-v119.js';
import {XENO_TRIALS_STAGE_HAZARDS_V188 as HAZARDS} from '../src/xeno-trials-stage-hazards-v188.js';
import {getXenoTrialsBodyBoundsV105 as bounds} from '../src/xeno-trials-geometry-v105.js';

const review=JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-operations-review-v188.json',import.meta.url),'utf8'));
const animationAudioReview=JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-animation-audio-review-v189.json',import.meta.url),'utf8'));
const arbiterReview=JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-arbiter-review-v190.json',import.meta.url),'utf8'));
const protocolsReview=JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-arbiter-protocols-review-v191.json',import.meta.url),'utf8'));
const hash=object=>createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(object).sort(([a],[b])=>a<b?-1:a>b?1:0)))).digest('hex');
function english(callback){useCatalogV185({EN_CATALOG_V185:C,EN_PATTERNS_V185:P});setLanguageV185('en',{document:null,persist:false});try{callback();}finally{setLanguageV185('fr',{document:null,persist:false});}}
const titleNames={escort:'CONTAINMENT CONVOY',relay:'EMERGENCY RELAYS',purge:'DUCT PURGE',beacon:'SYNCHRONIZED BEACONS',extraction:'CRATE RECOVERY'};
const label=entity=>({cargo:'Containment trolley',depot:'Recovery depot',exit:'Extraction airlock'}[entity.kind]
 ||`${({terminal:'Relay',vent:'Duct',beacon:'Beacon',supply:'Crate'})[entity.kind]} ${entity.label.match(/\d+$/)[0]}`);
function fixture(entry){const config={matchId:'i18n-operation',seed:188,stageId:entry.stageId,activityV119:{branch:'operations',id:entry.id}},state=create(entry.id,config);
 return{config,operationV188:state,phase:'active',fighters:[{id:'warrior',x:500,y:0,hp:220,facing:1}]};}

test('V188 review adds translations while preserving all 6189 exact entries and 457 patterns from the delivered V186 catalogue',()=>{
 const base={},expected={exact:[6189,'34d0dab8e796a56a7827ba4d0b3845e891d8e4b720b652ba0dd504dc602d4076'],patterns:[457,'52cec80bf24498b70c9de65416e44df9057abae42e6f661109c573a20e45f326']};
 for(const[kind,catalogue]of Object.entries({exact:C,patterns:P})){
  const additions=new Set([...review[kind],...animationAudioReview[kind],...arbiterReview[kind],...protocolsReview[kind]].map(entry=>entry.fr));base[kind]=Object.fromEntries(Object.entries(catalogue).filter(([fr])=>!additions.has(fr)));
  assert.equal(Object.keys(base[kind]).length,expected[kind][0]);assert.equal(hash(base[kind]),expected[kind][1]);
 }
 const rebuilt=mergeReviewV186(mergeReviewV186(mergeReviewV186(mergeReviewV186(base,review),animationAudioReview),arbiterReview),protocolsReview);assert.equal(hash(rebuilt.exact),hash(C));assert.equal(hash(rebuilt.patterns),hash(P));
 assert.equal(validateCatalogV186(rebuilt).omittedPatternSlots,1);
});

test('every reviewed V188 exact string and pattern passes the production translator with numeric slots retained',()=>english(()=>{
 for(const entry of review.exact)assert.equal(translate(entry.fr),entry.en,entry.fr);
 for(const entry of review.patterns){const fill=text=>text.replace(/\{(\d+)\}/g,(_,slot)=>String(Number(slot)+2));assert.equal(translate(fill(entry.fr)),fill(entry.en),entry.fr);}
}));

for(const entry of OPS)test(`${entry.id}: title, actual briefing, world labels, arrows, contact hints and live HUD translate without changing objective data`,()=>{
 const match=fixture(entry),before=JSON.stringify(match),activity=resolve({branch:'operations',id:entry.id},modes());
 const text=briefing(activity),world=view(match);
 english(()=>{
  assert.equal(translate(entry.title),`${titleNames[entry.kind]} · ${entry.id.split('-').at(-1).padStart(2,'0')}`);
  assert.equal(translate(entry.description),C[entry.description]);
  assert.equal(translate(text.orders),C[entry.description]+' Hold E, L3 or INTERACT next to the indicated target. Success depends on the objective, even if contacts remain active.');
  assert.equal(translate(text.healthLabel),`${activity.enemyHpMin}–${activity.enemyHpMax} HP`);
  assert.equal(translate(text.pressureLabel),'GROUNDED INTERACTION · E / L3 / TOUCH');
  for(const entity of world.entities)assert.equal(translate(entity.label),label(entity));
  const target=world.entities.find(entity=>entity.x===world.target.x&&entity.label===world.target.label),name=label(target),player=match.fighters[0];
  player.x=world.target.x+1000;assert.equal(translate(hud(match).instruction),`← ${name}`);
  player.x=world.target.x-1000;assert.equal(translate(hud(match).instruction),`${name} →`);
  player.x=0;player.x=world.target.x-bounds(player).center;
  const contact=hud(match);assert.equal(translate(contact.instruction),`${name} · HOLD INTERACT`);
  assert.equal(translate(contact.hint),`${name} · hold E nearby${entry.kind==='beacon'?' during the green window':''}.`);
  const status=`${contact.phase} · ${contact.instruction} · ${contact.progress.label}`;
  assert.equal(translate(status),[translate(contact.phase),translate(contact.instruction),translate(contact.progress.label)].join(' · '));
 });
 match.fighters[0].x=500;assert.equal(JSON.stringify(match),before,'Translation cannot change IDs, progress, position or objective state');
 assert.equal(translate(entry.title),entry.title);assert.equal(translate(text.orders),text.orders);
});

test('the live branch description, pause E/L3 instructions and resume/validation labels are translated completely',()=>{
 const samples=[
  [BRANCHES.find(branch=>branch.id==='operations').description,'Escort, restore relays, purge, synchronize and extract under pressure.'],
  ['E / L3 / INTERAGIR : maintenez au sol près de la cible indiquée. Évitez les zones de danger annoncées avant leur activation.','E / L3 / INTERACT: hold while grounded near the indicated target. Leave marked hazard zones before they activate.'],
  ['40 OPÉRATIONS / OBJECTIFS PHYSIQUES / DANGERS DE TERRAIN','40 OPERATIONS / PHYSICAL OBJECTIVES / FIELD HAZARDS'],
  ['REPRISE CONSERVÉE · OBJECTIFS ET DANGERS ENREGISTRÉS','CHECKPOINT SAVED · OBJECTIVES AND HAZARDS RECORDED'],
  ['E · INTERAGIR','E · INTERACT'],['Maintenir pour interagir avec l’objectif','Hold to interact with the objective']
 ];
 const ui=readFileSync(new URL('../src/xeno-trials-ui-v96.js',import.meta.url),'utf8');assert.ok(ui.includes(samples[1][0]));
 english(()=>{for(const[fr,en]of samples)assert.equal(translate(fr),en);});for(const[fr]of samples)assert.equal(translate(fr),fr);
});

test('carrying, depot return, extraction airlock, success and the three actual failure reasons remain human-readable in both languages',()=>{
 const match=fixture(OPS.find(entry=>entry.kind==='extraction')),state=match.operationV188;
 state.carrying=0;state.completed[0]=true;state.progress[0]=OPS.find(entry=>entry.kind==='extraction').objectives[0].requiredTicks;
 english(()=>{assert.equal(translate(hud(match).phase),'CRATE IN TRANSIT');assert.equal(translate(view(match).target.label),'Recovery depot');});
 state.carrying=-1;state.completed=state.completed.map(()=>true);state.delivered=state.delivered.map(()=>true);
 english(()=>{assert.equal(translate(view(match).target.label),'Extraction airlock');assert.equal(translate(view(match).progress.label),'3/3 crates delivered');});
 state.status='completed';english(()=>{assert.equal(translate(hud(match).phase),'OBJECTIVE COMPLETE');assert.equal(translate(hud(match).hint),'Objectives complete.');});
 for(const[reason,fr,en]of [['player-ko','Spécimen neutralisé','Specimen incapacitated'],['time','Temps écoulé','Time expired'],['structure-destroyed','Intégrité épuisée','Integrity depleted']]){
  state.status='failed';state.failureReason=reason;const hint=view(match).hint;assert.equal(hint,`Évaluation interrompue : ${fr}.`);assert.ok(!hint.includes(reason));
  english(()=>{assert.equal(translate(hud(match).phase),'OBJECTIVE LOST');assert.equal(translate(hint),`Evaluation interrupted: ${en}.`);});assert.equal(translate(hint),hint);
 }
});

test('joined runtime announcements translate arrow, grounded contact, carrying, pause and terminal phases without French fragments',()=>english(()=>{
 const phases=[['OPÉRATION ACTIVE','ACTIVE OPERATION'],['PAUSE','PAUSE'],['OBJECTIF ATTEINT','OBJECTIVE COMPLETE'],['OBJECTIF PERDU','OBJECTIVE LOST'],['CAISSON EN TRANSIT','CRATE IN TRANSIT']];
 const prompts=[['← Dépôt de récupération','← Recovery depot'],['Sas d’extraction →','Extraction airlock →'],
  ['Caisson 2 · MAINTENEZ INTERAGIR','Crate 2 · HOLD INTERACT'],['Objectifs validés.','Objectives complete.'],['Évaluation interrompue.','Evaluation interrupted.']];
 for(const[frPhase,enPhase]of phases)for(const[frPrompt,enPrompt]of prompts){
  const fr=`${frPhase} · ${frPrompt} · 2/3 caissons livrés`,en=`${enPhase} · ${enPrompt} · 2/3 crates delivered`;
  assert.equal(translate(fr),en,fr);
 }
}));

test('all forty machinery warning/active labels and avoidance instructions translate as full joined messages',()=>english(()=>{
 for(const hazard of HAZARDS){
  assert.equal(translate(hazard.label),C[hazard.label]);assert.equal(translate(hazard.hint),C[hazard.hint]);
  for(const phase of ['DANGER ANNONCÉ','DANGER ACTIF']){
   const fr=`${phase} · ${hazard.label} · ${hazard.hint}`;
   assert.equal(translate(fr),[C[phase],C[hazard.label],C[hazard.hint]].join(' · '));
  }
 }
}));
