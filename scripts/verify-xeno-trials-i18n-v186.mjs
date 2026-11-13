import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { mergeReviewV186, validateCatalogV186 } from './i18n-catalog-maintenance-v186.mjs';
import { XENO_TRIALS_HORDE_PROTOCOLS_V186 as protocols } from '../src/xeno-trials-horde-v180.js';
import { XENO_TRIALS_STAGES_V96 as stages } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsHordeViewV180 } from '../src/xeno-trials-horde-ui-v180.js';

const review = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-trials-review-v186.json', import.meta.url), 'utf8'));
const hash = object => createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(object)
  .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)))).digest('hex');
function english(callback) {
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, persist: false });
  try { callback(); } finally { setLanguageV185('fr', { document: null, persist: false }); }
}

test('reviewed Trials additions preserve all 6042 historical exact strings and 437 historical patterns byte-for-byte as entries', () => {
  const catalog = { exact: EN_CATALOG_V185, patterns: EN_PATTERNS_V185 };
  const expected = { exact: [6042, '2f72f16e7be3cd839f63567da2847f2b88cd31f147f2841956523784d79f88b4'],
    patterns: [437, '2a73debae859ed72d75e6fb8cc13b19e07aee05bea5f18242aacd8972aee4415'] };
  const historical = {};
  for (const kind of ['exact', 'patterns']) {
    const added = new Set(review[kind].map(entry => entry.fr));
    historical[kind] = Object.fromEntries(Object.entries(catalog[kind]).filter(([fr]) => !added.has(fr)));
    assert.equal(Object.keys(historical[kind]).length, expected[kind][0]);
    assert.equal(hash(historical[kind]), expected[kind][1]);
  }
  const regenerated = mergeReviewV186(historical, review);
  assert.equal(hash(regenerated.exact), hash(catalog.exact)); assert.equal(hash(regenerated.patterns), hash(catalog.patterns));
  assert.equal(validateCatalogV186(catalog).omittedPatternSlots, 1);
});

test('every newly reviewed exact string and dynamic pattern translates with every numeric parameter retained', () => english(() => {
  for (const entry of review.exact) assert.equal(autoTranslateV185(entry.fr), entry.en, entry.fr);
  for (const entry of review.patterns) {
    const fill = text => text.replace(/\{(\d+)\}/g, (_, value) => String(Number(value) + 2));
    assert.equal(autoTranslateV185(fill(entry.fr)), fill(entry.en), entry.fr);
  }
}));

test('all eighty native protocol titles/descriptions and forty scene labels have English views without changing IDs or data', () => english(() => {
  const before = JSON.stringify(protocols);
  for (const protocol of protocols) {
    const title = autoTranslateV185(protocol.title), description = autoTranslateV185(protocol.description);
    assert.notEqual(title, protocol.title); assert.notEqual(description, protocol.description);
    assert.ok(!/vagues|spécimen|contacts simultanés|récupération|gardes|puis un/u.test(description), description);
    assert.ok(description.includes(String(protocol.bossFinaleV186?.hp || 35)));
  }
  for (const stage of stages.slice(-40)) assert.equal(autoTranslateV185(stage.label), EN_CATALOG_V185[stage.label]);
  assert.equal(JSON.stringify(protocols), before);
}));

test('live wave, boss, recovery and device announcements translate and return to the original French', () => {
  const state = { phase: 'active', fighters: [], hordeV180: { protocolId: protocols[40].id, wave: 1,
    waveCount: 3, alive: 3, remaining: 2, totalKills: 2, totalEnemies: 15, phase: 'active' } };
  const samples = [getXenoTrialsHordeViewV180(state).announcement,
    'REPRISE CONSERVÉE · VAGUE 2 / 3', 'REPRENDRE LA VAGUE 2',
    'MANETTE CONNECTÉE · Relâchez les commandes pour reprendre.',
    '80 PROTOCOLES / CONTACTS SIMULTANÉS / SURVIE CONTINUE'];
  english(() => {
    for (const text of samples) {
      const translated = autoTranslateV185(text); assert.notEqual(translated, text);
      assert.ok(!/Vague|CONTACT MAJEUR|CONSERVÉE|REPRENDRE|Relâchez|SIMULTANÉS|SURVIE CONTINUE/u.test(translated), translated);
    }
  });
  for (const text of samples) assert.equal(autoTranslateV185(text), text);
});

test('captured mobile boss, health, abandon and touch labels translate completely and retain their numbers', () => {
  // Actual text observed in native-third browser captures, rather than a
  // template-only assertion. The original French must remain recoverable.
  const samples = [
    ['FINALE · Crusher — ACM · 140 PV', 'FINALE · Crusher — ACM · 140 HP'],
    ['208 / 220 PV', '208 / 220 HP'],
    ['15–35 PV', '15–35 HP'],
    ['ABANDONNER · SANS GAIN', 'ABANDON · NO REWARD'],
    ['J · RAPIDE', 'J · LIGHT'], ['K · LOURD', 'K · HEAVY'], ['L · SPÉCIAL', 'L · SPECIAL']
  ];
  english(() => { for (const [fr, en] of samples) assert.equal(autoTranslateV185(fr), en, fr); });
  for (const [fr] of samples) assert.equal(autoTranslateV185(fr), fr);
});
