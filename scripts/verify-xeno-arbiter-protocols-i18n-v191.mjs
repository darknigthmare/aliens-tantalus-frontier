import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EN_CATALOG_V185 as C, EN_PATTERNS_V185 as P } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185 as translate, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { mergeReviewV186, validateCatalogV186 } from './i18n-catalog-maintenance-v186.mjs';
import { ARBITER_PROGRAMS_V191 as programs, ARBITER_ARCHIVE_VENUES_V191 as venues,
  ARBITER_HORDE_PROTOCOLS_V191 as hordes, ARBITER_OPERATIONS_V191 as operations,
  getArbiterArchiveAccessV191 } from '../src/xeno-arbiter-protocols-v191.js';
import { ARBITER_MISSIONS_V190 as missions, createArbiterReceiptV190 } from '../src/xeno-arbiter-campaign-v190.js';
import { resolveXenoTrialsActivityV119 as resolve } from '../src/xeno-trials-modes-v119.js';
import { getXenoTrialsOperationBriefingV188 as briefing, getXenoTrialsOperationHudV188 as hud } from '../src/xeno-trials-operation-presentation-v188.js';
import { createXenoTrialsMatchV96 as create } from '../src/xeno-trials-engine-v96.js';

const review = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-arbiter-protocols-review-v191.json', import.meta.url), 'utf8'));
const franchiseReview = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-franchise-stages-review-v192.json', import.meta.url), 'utf8'));
const hash = object => createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(object)
  .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)))).digest('hex');
function english(callback) {
  useCatalogV185({ EN_CATALOG_V185: C, EN_PATTERNS_V185: P }); setLanguageV185('en', { document: null, persist: false });
  try { callback(); } finally { setLanguageV185('fr', { document: null, persist: false }); }
}

test('V191 appends exactly fifty-one reviewed keys and three patterns while all 6438/500 prior entries remain identical', () => {
  assert.equal(review.exact.length, 51); assert.equal(review.patterns.length, 3);
  const base = {}, expected = {
    exact: [6438, '4cc491eaa76d5780449f43c754117e901f960d7aaabf42665540a356b8d49496'],
    patterns: [500, '9654e93f75f635400cb73b0adaf6c818823976c1f0cb9c3690d2fc57b02beeb9']
  };
  for (const [kind, catalog] of Object.entries({ exact: C, patterns: P })) {
    const added = new Set([...review[kind], ...franchiseReview[kind]].map(entry => entry.fr));
    base[kind] = Object.fromEntries(Object.entries(catalog).filter(([fr]) => !added.has(fr)));
    assert.equal(Object.keys(base[kind]).length, expected[kind][0]); assert.equal(hash(base[kind]), expected[kind][1]);
    assert.ok(review[kind].every(entry => !Object.hasOwn(entry, 'previous')));
  }
  const regenerated = mergeReviewV186(mergeReviewV186(base, review), franchiseReview);
  assert.equal(hash(regenerated.exact), hash(C)); assert.equal(hash(regenerated.patterns), hash(P));
  assert.equal(validateCatalogV186(regenerated).omittedPatternSlots, 1);
});

test('reviewed exact keys are literal product copy or actual generated program descriptions, and every reviewed slot survives translation', () => {
  const visible = new Set(programs.flatMap(entry => [entry.title, entry.label, entry.description]));
  visible.add('40 DOSSIERS / 20 HORDES / 20 OPÉRATIONS · ARCHIVES ARBITER · Copie locale isolée. 20 hordes et 20 opérations récupérées.');
  const sources = new Map();
  for (const entry of review.exact) assert.ok(entry.source.split('; ').some(path => {
    if (!sources.has(path)) sources.set(path, readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
    return sources.get(path).includes(entry.fr) || path === 'src/xeno-arbiter-protocols-v191.js' && visible.has(entry.fr);
  }), entry.fr);
  english(() => {
    for (const entry of review.exact) assert.equal(translate(entry.fr), entry.en, entry.fr);
    for (const entry of review.patterns) {
      const fill = text => text.replace(/\{(\d+)\}/g, (_, slot) => String(Number(slot) + 2));
      assert.equal(translate(fill(entry.fr)), fill(entry.en), entry.fr);
    }
  });
  for (const entry of review.exact) assert.equal(translate(entry.fr), entry.fr);
});

test('all forty actual archive titles and descriptions translate fully while preserving every program ID and authoritative value', () => {
  const before = JSON.stringify(programs), labels = {
    vault: 'ARBITRATION CHAMBER', transfer: 'SPECIMEN TRANSIT', gallery: 'DELEGATES’ GALLERY', archive: 'SEALED ARCHIVES'
  }, names = { escort: 'SEALED CONVOY', relay: 'OFFLINE RELAYS', purge: 'CONTAINMENT PURGE', beacon: 'CONTROL BEACONS', extraction: 'CRATE RETURN' };
  english(() => {
    for (const entry of programs) {
      const expected = `${labels[entry.archiveVenueV191]} · ${entry.branch === 'horde' ? `PRESSURE ${String(entry.level).padStart(2, '0')}` : names[entry.kind]}`;
      assert.equal(translate(entry.title), expected, entry.id);
      assert.equal(translate(entry.description), C[entry.description], entry.id);
      assert.ok(!/vagues|soin automatique|retours|spécimens|scellés|concessions restent|cadres|réseau compagnie/u.test(translate(entry.description)), entry.id);
    }
  });
  assert.equal(JSON.stringify(programs), before);
  for (const entry of programs) assert.equal(translate(entry.description), entry.description);
});

test('archive sealed buttons, all six return counts and composed forty-record counters translate without swallowing a French prefix', () => {
  const ui = readFileSync(new URL('../src/xeno-trials-ui-v96.js', import.meta.url), 'utf8');
  const button = 'SCELLÉS · TERMINER L’ENQUÊTE ARBITER'; assert.ok(ui.includes(button));
  const ready = { schema: 190, completedCampaignIds: missions.map(mission => mission.campaignId),
    returns: missions.map((mission, index) => ({ campaignId: mission.campaignId,
      operationId: `operation-${index + 1}-${mission.campaignId}`, receipt: createArbiterReceiptV190(mission) })) };
  // Explicit strategic fixtures for linguistic views, not six played missions.
  const notices = Array.from({ length: 7 }, (_, count) => getArbiterArchiveAccessV191({ ...ready,
    completedCampaignIds: ready.completedCampaignIds.slice(0, count), returns: ready.returns.slice(0, count) }).notice);
  english(() => {
    assert.equal(translate(button), 'SEALED · COMPLETE THE ARBITER INVESTIGATION');
    for (const [count, notice] of notices.entries()) {
      const expected = count < 6 ? `ARBITER ARCHIVES · ${count}/6 returns validated. Complete all six ARBITER dossier extractions.`
        : 'ARBITER ARCHIVES · Isolated local copy. 20 hordes and 20 operations recovered.';
      assert.equal(translate(notice), expected);
      assert.equal(translate(`40 DOSSIERS / 20 HORDES / 20 OPÉRATIONS · ${notice}`), `40 DOSSIERS / 20 HORDES / 20 OPERATIONS · ${expected}`);
    }
  });
  for (const notice of notices) assert.equal(translate(notice), notice);
});

test('twenty real operation briefings and live objective HUD labels remain readable after adding the archived narrative paragraph', () => {
  const before = JSON.stringify(operations);
  english(() => {
    for (const entry of operations) {
      const activity = resolve({ branch: 'operations', id: entry.id }, {}), brief = briefing(activity);
      assert.equal(translate(brief.orders), C[entry.description]
        + ' Hold E, L3 or INTERACT next to the indicated target. Success depends on the objective, even if contacts remain active.');
      const match = create({ seed: 191, playerId: 'warrior', activityV119: { branch: 'operations', id: entry.id } });
      const frozen = JSON.stringify(match), live = hud(match);
      assert.notEqual(translate(live.phase), live.phase);
      assert.notEqual(translate(live.instruction), live.instruction);
      assert.equal(JSON.stringify(match), frozen);
    }
  });
  assert.equal(JSON.stringify(operations), before);
});

test('only the four authored finales describe their displayed major-contact HP, retaining the separate low-HP troop range', () => english(() => {
  assert.equal(venues.length, 4);
  for (const entry of hordes.filter(item => item.bossFinaleV186)) {
    const text = translate(entry.description); assert.ok(text.includes('15–35 HP'));
    assert.ok(text.includes(`one major contact with ${entry.bossFinaleV186.hp} HP and two guards.`));
  }
}));
