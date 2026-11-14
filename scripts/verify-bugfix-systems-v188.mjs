// Regression tests, bug hunt "systèmes transverses : sauvegardes, options, économie, audio" (2026-11-14).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as saveModule from '../src/save.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185, currentLanguageV185 } from '../src/i18n-v185.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const appSource = read('src/app.js');
const functionBody = (source, name) => {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  const next = source.indexOf('\nfunction ', start + 10);
  return source.slice(start, next < 0 ? undefined : next);
};

// —— Economy: refusal names the resources and is available in both languages ——
test('economy: a research refused for missing funds names resources, never raw save keys, and leaves the save unchanged', () => {
  const save = saveModule.createDefaultSave(1);
  save.galaxy.resources.credits = 5; save.galaxy.resources.research = 0;
  const before = JSON.stringify(save.galaxy.resources);
  const project = saveModule.RESEARCH_PROJECTS.find(entry => Object.keys(entry.cost).includes('credits'));
  let error;
  try { saveModule.completeResearchProject(save, project.id); } catch (caught) { error = caught; }
  assert.ok(error, 'the purchase is refused');
  assert.equal(JSON.stringify(save.galaxy.resources), before, 'no resource went negative or was spent');
  assert.doesNotMatch(error.message, /\bcredits\b|\bresearch\b/, 'no raw save key in the French message');
  assert.equal(error.code, 'STRATEGIC_COST_MISSING');
  assert.ok(Array.isArray(error.missingCosts) && error.missingCosts.some(entry => entry.key === 'credits' && entry.available === 5));
  assert.equal(typeof saveModule.strategicCostRefusalV188, 'function');
  assert.match(saveModule.strategicCostRefusalV188(error, 'en'), /^Insufficient resources: 5\/\d+ CR/);
  assert.match(saveModule.strategicCostRefusalV188(error, 'fr'), /^Ressources insuffisantes : 5\/\d+ CR/);
  // Other errors pass through unchanged.
  assert.equal(saveModule.strategicCostRefusalV188(new Error('Projet deja termine.'), 'en'), 'Projet deja termine.');
});

test('economy: the hub mutation wrapper shows the localized refusal', () => {
  const body = functionBody(appSource, 'runTimedMutation');
  assert.match(body, /toast\(strategicCostRefusalV188\(error, document\.documentElement\.lang\)\)/);
});

// —— Persistence: a refused write during resolution is reported, not thrown from the click ——
test('saves: finalizeOperation returns save-write-failed instead of throwing when storage refuses the write', () => {
  const body = functionBody(appSource, 'finalizeOperation');
  assert.match(body, /try \{ saveSystem\.commit\(candidate\); \}\s*catch \{ return \{ ok: false, reason: 'save-write-failed' \}; \}/,
    'a quota failure during retreat left an uncaught page error and no feedback');
});

// —— Options: volume heard while dragging ——
test('options: effects and music sliders apply the volume on input, before the change commit', () => {
  assert.match(appSource, /\[\['setting-effects', 'effects'\], \['setting-music', 'music'\]\]\) byId\(id\)\.oninput = /);
  assert.match(appSource, /audio\.setVolumes\(\{ \[key\]: Number\(event\.target\.value\) \}\)/);
});

// —— FR/EN: save recovery, profile switch and armory resupply texts ——
test('i18n: save recovery, profile switch and armory resupply texts are translated in English', () => {
  const previous = currentLanguageV185();
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, storage: null, persist: false });
  try {
    const cases = {
      'Profil 1 : fichier illisible. Les sauvegardes automatiques sont suspendues. Chargez explicitement un profil ou exportez les données avant de choisir.':
        'Profile 1: unreadable file. Automatic saves are suspended. Explicitly load a profile or export the data before choosing.',
      'Profil 2 : stockage inaccessible. Les sauvegardes automatiques sont suspendues. Chargez explicitement un profil ou exportez les données avant de choisir.':
        'Profile 2: storage unavailable. Automatic saves are suspended. Explicitly load a profile or export the data before choosing.',
      'Profil 2 actif.': 'Profile 2 active.',
      '+60 · en réserve : 420': '+60 · in reserve: 420',
      'Lots de munitions pour la prochaine opération · gestion de réserve historique. Les chargeurs physiques restent propres aux armes en mission.':
        'Ammunition lots for the next operation · historical reserve management. Physical magazines remain specific to weapons in the mission.',
      'ARCHIVES ARMEMENT · 19 références à authentifier': 'WEAPON ARCHIVES · 19 references to authenticate',
      'ACCESSOIRES DOCUMENTÉS · 13 modules à authentifier': 'DOCUMENTED ACCESSORIES · 13 modules to authenticate',
      'ARMES À AUTHENTIFIER · 129 dossiers': 'WEAPONS TO AUTHENTICATE · 129 files'
    };
    for (const [fr, en] of Object.entries(cases)) assert.equal(autoTranslateV185(fr), en);
  } finally { setLanguageV185(previous, { document: null, storage: null, persist: false }); }
});
