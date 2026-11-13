import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EN_CATALOG_V185 as C, EN_PATTERNS_V185 as P } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185 as translate, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { mergeReviewV186, validateCatalogV186 } from './i18n-catalog-maintenance-v186.mjs';
import { ARBITER_MISSIONS_V190 as missions, ARBITER_CAMPAIGNS_V190 as campaigns,
  createArbiterMissionStateV190, createArbiterReceiptV190,
  arbiterCampaignBriefingV190, arbiterMissionDossierV190 } from '../src/xeno-arbiter-campaign-v190.js';
import { getArbiterDossierModelV190 } from '../src/xeno-arbiter-ui-v190.js';
import { XENO_TRIALS_CORPORATE_STAGES_V190 as stages } from '../src/xeno-trials-stage-scenes-v190.js';
import { CAMPAIGN_ART_ASSETS_V190 as paintings } from '../src/campaign-art-v190.js';

const review = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-arbiter-review-v190.json', import.meta.url), 'utf8'));
const protocolsReview = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-arbiter-protocols-review-v191.json', import.meta.url), 'utf8'));
const hash = object => createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(object)
  .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)))).digest('hex');
function english(callback) {
  useCatalogV185({ EN_CATALOG_V185: C, EN_PATTERNS_V185: P });
  setLanguageV185('en', { document: null, persist: false });
  try { callback(); } finally { setLanguageV185('fr', { document: null, persist: false }); }
}

test('V190 only appends reviewed strings to all 6343 exact translations and 494 V189 patterns', () => {
  const base = {}, expected = {
    exact: [6343, '55ba43d4903c1baed7ade01c6e3c8d26ad97a2dd175fc98d774a2d01b3da5864'],
    patterns: [494, 'd30a70a267740e9669837bf26ccdba105ee3979a2921e958f3ae4ee7ebc8f2a4']
  };
  for (const [kind, catalog] of Object.entries({ exact: C, patterns: P })) {
    const added = new Set([...review[kind], ...protocolsReview[kind]].map(entry => entry.fr));
    base[kind] = Object.fromEntries(Object.entries(catalog).filter(([fr]) => !added.has(fr)));
    assert.equal(Object.keys(base[kind]).length, expected[kind][0]);
    assert.equal(hash(base[kind]), expected[kind][1]);
    assert.ok(review[kind].every(entry => !Object.hasOwn(entry, 'previous')));
  }
  const rebuilt = mergeReviewV186(mergeReviewV186(base, review), protocolsReview);
  assert.equal(hash(rebuilt.exact), hash(C)); assert.equal(hash(rebuilt.patterns), hash(P));
  assert.equal(validateCatalogV186(rebuilt).omittedPatternSlots, 1);
});

test('reviewed V190 exact keys exist in the current product and all reviewed numeric slots survive the production translator', () => {
  const sources = new Map();
  for (const entry of review.exact) {
    assert.ok(entry.source.split('; ').some(path => {
      if (!sources.has(path)) sources.set(path, readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
      return sources.get(path).includes(entry.fr);
    }), entry.fr);
  }
  english(() => {
    for (const entry of review.exact) assert.equal(translate(entry.fr), entry.en, entry.fr);
    for (const entry of review.patterns) {
      const fill = text => text.replace(/\{(\d+)\}/g, (_, slot) => String(Number(slot) + 2));
      assert.equal(translate(fill(entry.fr)), fill(entry.en), entry.fr);
    }
  });
  for (const entry of review.exact) assert.equal(translate(entry.fr), entry.fr);
});

test('six real mission definitions, composed descriptions and all grounded evidence prompts translate without changing their data', () => {
  const before = JSON.stringify({ missions, campaigns });
  english(() => {
    for (const [index, mission] of missions.entries()) {
      const briefing = arbiterCampaignBriefingV190(mission.campaignId);
      for (const key of ['name', 'location', 'objective', 'summary']) assert.equal(translate(mission[key]), C[mission[key]], mission[key]);
      assert.equal(translate(campaigns[index].name), `ARBITER ${index + 1}/6 · ${C[mission.name]}`);
      assert.equal(translate(campaigns[index].description), C[mission.summary]
        + ' An original Tantalus recovery route, with local interaction and physical extraction.');
      assert.equal(translate(briefing.notice), C[briefing.notice]);
      for (const [stage, station] of mission.stations.entries()) {
        const state = { ...createArbiterMissionStateV190(mission.campaignId), stage }, dossier = arbiterMissionDossierV190(state);
        assert.equal(translate(station.label), C[station.label]);
        assert.equal(translate(station.text), C[station.text]);
        assert.equal(translate(dossier.instruction), `Reach ${C[station.label]} and hold E for ${station.seconds} s.`);
      }
    }
  });
  assert.equal(JSON.stringify({ missions, campaigns }), before);
  for (const mission of missions) assert.equal(translate(mission.name), mission.name);
});

test('joined station, extraction, insertion and dossier counters preserve every target and number in both languages', () => {
  const notice = 'ARBITER : relevez les preuves locales dans l’ordre, puis confirmez l’extraction au sas. Tout module AB-40 retrouvé doit rester sous scellés.';
  const samples = [
    [`${notice} Aucun binôme physique déployé. Les bonus dépendent du bilan réel.`,
      'ARBITER: record the local evidence in order, then confirm extraction at the airlock. Any recovered AB-40 module must remain sealed. No physical partner deployed. Bonuses depend on the actual debrief.'],
    ['ARBITER / AB-40 · 3/6 retours archivés', 'ARBITER / AB-40 · 3/6 returns archived'],
    ['MAINTENIR E · RETOUR · 1.2/2 S', 'HOLD E · RETURN · 1.2/2 S']
  ];
  for (const mission of missions) for (const station of mission.stations) samples.push([
    `MAINTENIR E · ${station.label} · 1.2/${station.seconds} S`, `HOLD E · ${C[station.label]} · 1.2/${station.seconds} S`
  ]);
  english(() => { for (const [fr, en] of samples) assert.equal(translate(fr), en, fr); });
  for (const [fr] of samples) assert.equal(translate(fr), fr);
});

test('pure dossier fixtures at discovery, custody, isolation and local MIRE retain progression while translating status and summary', () => {
  const progress = { schema: 190, completedCampaignIds: [], returns: [] };
  const models = [getArbiterDossierModelV190(progress)];
  // Explicit pure-state fixtures; these are not native completed missions.
  for (const [index, mission] of missions.entries()) {
    progress.completedCampaignIds.push(mission.campaignId);
    progress.returns.push({ campaignId: mission.campaignId,
      operationId: `operation-${index + 1}-${mission.campaignId}`, receipt: createArbiterReceiptV190(mission) });
    if ([2, 4, 5].includes(index)) models.push(getArbiterDossierModelV190(progress));
  }
  const before = JSON.stringify({ progress, models });
  english(() => {
    for (const model of models) {
      assert.equal(translate(model.status), C[model.status]); assert.equal(translate(model.summary), C[model.summary]);
    }
  });
  assert.equal(JSON.stringify({ progress, models }), before);
  assert.deepEqual(models.map(model => model.completed), [0, 3, 5, 6]);
  for (const model of models) assert.equal(translate(model.status), model.status);
});

test('the four new corporate stage names and the single recovery painting retain their exact identities in English', () => {
  const before = JSON.stringify({ stages, paintings });
  english(() => {
    for (const stage of stages) assert.equal(translate(stage.label), C[stage.label]);
    for (const painting of paintings) {
      assert.equal(translate(painting.alt), C[painting.alt]); assert.equal(translate(painting.credit), C[painting.credit]);
    }
  });
  assert.equal(JSON.stringify({ stages, paintings }), before);
});
