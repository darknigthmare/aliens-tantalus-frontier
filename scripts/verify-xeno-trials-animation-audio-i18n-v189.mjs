import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {EN_CATALOG_V185 as C,EN_PATTERNS_V185 as P} from '../src/i18n-en-catalog-v185.js';
import {autoTranslateV185 as translate,useCatalogV185} from '../src/i18n-auto-v185.js';
import {setLanguageV185} from '../src/i18n-v185.js';
import {mergeReviewV186,validateCatalogV186} from './i18n-catalog-maintenance-v186.mjs';
import {getXenoTrialsAnimationCoverageListV189 as list} from '../src/xeno-trials-animation-coverage-v189.js';

const review=JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-animation-audio-review-v189.json',import.meta.url),'utf8'));
const hash=object=>createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(object).sort(([a],[b])=>a<b?-1:a>b?1:0)))).digest('hex');
function english(callback){useCatalogV185({EN_CATALOG_V185:C,EN_PATTERNS_V185:P});setLanguageV185('en',{document:null,persist:false});try{callback();}finally{setLanguageV185('fr',{document:null,persist:false});}}

test('V189 is an append-only successor to all 6334 exact V188 translations and 494 patterns',()=>{
 const base={},expected={exact:[6334,'d01acba313a5a4640c717bb11d7bb0d85a8359849baabe7eb2eff8e984768b2e'],patterns:[494,'d30a70a267740e9669837bf26ccdba105ee3979a2921e958f3ae4ee7ebc8f2a4']};
 for(const[kind,catalog]of Object.entries({exact:C,patterns:P})){
  const added=new Set(review[kind].map(entry=>entry.fr));base[kind]=Object.fromEntries(Object.entries(catalog).filter(([fr])=>!added.has(fr)));
  assert.equal(Object.keys(base[kind]).length,expected[kind][0]);assert.equal(hash(base[kind]),expected[kind][1]);
  assert.ok(review[kind].every(entry=>!Object.hasOwn(entry,'previous')),'No historical translation is revised');
 }
 const regenerated=mergeReviewV186(base,review);assert.equal(hash(regenerated.exact),hash(C));assert.equal(hash(regenerated.patterns),hash(P));
 assert.equal(validateCatalogV186(regenerated).omittedPatternSlots,1);
});

test('every V189 translation comes from current product strings and uses the production translator',()=>{
 const sourceFiles=new Map();for(const entry of review.exact){
  assert.ok(entry.source.split('; ').some(path=>{if(!sourceFiles.has(path))sourceFiles.set(path,readFileSync(new URL('../'+path,import.meta.url),'utf8'));return sourceFiles.get(path).includes(entry.fr);}),entry.fr);
 }
 english(()=>{for(const entry of review.exact)assert.equal(translate(entry.fr),entry.en,entry.fr);});
 for(const entry of review.exact)assert.equal(translate(entry.fr),entry.fr);
});

test('all 189 current fighter dossiers translate their visible motion label without modifying source identity or admission',()=>{
 const rows=list(),before=JSON.stringify(rows),expected={'Gestes dessinés':'Drawn motions','Gestes articulés':'Articulated motions','Posture de référence':'Reference pose'};
 assert.equal(rows.length,189);
 english(()=>{for(const row of rows){assert.equal(translate(row.playerLabel),expected[row.playerLabel]);assert.ok(!/atlas|mesh|static|supported|1:1|canon|fully/i.test(translate(row.playerLabel)));}});
 assert.equal(JSON.stringify(rows),before);for(const row of rows)assert.equal(translate(row.playerLabel),row.playerLabel);
});

test('the real animation filter and both pause audio actions and their accessible label remain bilingual',()=>{
 const ui=readFileSync(new URL('../src/xeno-trials-ui-v96.js',import.meta.url),'utf8');
 assert.match(ui,/<label>Animation<select data-xt="animation"><option value="all">Tous les gestes<\/option><option value="drawn">Gestes dessinés<\/option>/);
 assert.match(ui,/data-xt="audio-toggle" aria-label="Sons de Trials"/);
 const samples=[['Tous les gestes','All motions'],['Gestes dessinés','Drawn motions'],['COUPER LES SONS DE TRIALS','MUTE TRIALS SOUNDS'],
  ['ACTIVER LES SONS DE TRIALS','ENABLE TRIALS SOUNDS'],['Sons de Trials','Trials sounds'],['Le volume des effets suit les réglages audio du profil.','Effect volume follows the profile’s audio settings.']];
 english(()=>{for(const[fr,en]of samples){assert.ok(ui.includes(fr));assert.equal(translate(fr),en);}});
 for(const[fr]of samples)assert.equal(translate(fr),fr);
});
