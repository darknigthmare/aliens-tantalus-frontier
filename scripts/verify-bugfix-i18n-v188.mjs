// Regression tests, bug hunt "traductions et textes joueur" (2026-11-14).
// Covers: campaign objective labels (P1), catalog group glossary (P2), English
// armory dossiers (P2), technical labels removed from player screens (P2) and
// the owner wording for DAVID-8R (decision 2026-11-14).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGNS } from '../src/content.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185, currentLanguageV185, STRINGS_V185 } from '../src/i18n-v185.js';
import { buildObjectivePanelV188, campaignObjectiveLabelV188, CAMPAIGN_OBJECTIVE_LABELS_V188,
  CAMPAIGN_OBJECTIVE_FALLBACK_V188 } from '../src/mission-objective-panel-v188.js';
import { GROUP_GLOSSARY_V188, groupLabelV188, groupGlossaryRowsV188 } from '../src/group-glossary-v188.js';
import { CATALOG_TREE_V62, CATALOG_RECORDS_V62 } from '../src/catalog-runtime-v62.js';
import { CatalogWorkbenchV62 } from '../src/catalog-ui-v62.js';
import { resolveWeaponReferenceCoverageV122 } from '../src/weapon-reference-coverage-v122.js';
import { SPECIAL_OPERATIONS_V67 } from '../src/special-operations-v67.js';
import { MissionInsertionUiV62 } from '../src/mission-insertion-ui-v62.js';
import { formatArchiveStampV188 } from '../src/narrative-archives-ui-v68.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const KEY_SHAPE = /^[a-z0-9][a-z0-9 '’-]*$/u;
// Words that betray French left in an English screen (proper names excluded).
const FRENCH = /[éèàçêûôîœ]|\b(du|des|la|le|les|et|une|pour|avec|sans|aucun|aucune|sur|préservé|conservés?)\b/iu;

function inEnglish(fn) {
  const previous = currentLanguageV185();
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, storage: null, persist: false });
  try { return fn(); } finally { setLanguageV185(previous, { document: null, storage: null, persist: false }); }
}

class FakeNode {
  constructor(tagName) { this.tagName = tagName; this.className = ''; this.dataset = {}; this.children = []; this.text = ''; this.style = { setProperty() {} }; this.classList = { add() {}, toggle() {} }; this.attributes = {}; }
  get textContent() { return this.children.length ? this.children.map(child => child.textContent).join('') : this.text; }
  set textContent(value) { this.text = String(value); this.children = []; }
  append(...items) { this.children.push(...items); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  all() { return [this, ...this.children.flatMap(child => child.all())]; }
}
const fakeDocument = { createElement: tag => new FakeNode(tag) };

// —— P1: objective labels ——
test('P1: every campaign objective has a player label in FR and EN, never its raw key', () => {
  const objectives = [...new Set(CAMPAIGNS.map(campaign => campaign.objective))];
  const keys = objectives.filter(objective => KEY_SHAPE.test(objective));
  assert.ok(keys.length >= 17, 'generic campaigns still use identifier-shaped objectives');
  for (const key of keys) {
    assert.ok(Object.hasOwn(CAMPAIGN_OBJECTIVE_LABELS_V188, key), `mapping for ${key}`);
    const fr = campaignObjectiveLabelV188(key, 'fr'), en = campaignObjectiveLabelV188(key, 'en');
    assert.notEqual(fr, key); assert.match(fr, /^\p{Lu}/u, `${key}: capitalised French label`);
    assert.match(en, /^\p{Lu}/u, `${key}: capitalised English label`);
    // DOM sites write French; the reviewed catalog must give the same English live.
    assert.equal(EN_CATALOG_V185[fr], en, `${fr}: catalog English matches the mapping`);
  }
  // Authored French objectives stay untouched in French and translate in English.
  for (const sentence of objectives.filter(objective => !KEY_SHAPE.test(objective))) {
    assert.equal(campaignObjectiveLabelV188(sentence, 'fr'), sentence);
    assert.notEqual(inEnglish(() => campaignObjectiveLabelV188(sentence, 'en')), sentence, sentence);
  }
});

test('P1: unknown identifier objectives fall back to a generic order, never the raw key', () => {
  assert.equal(campaignObjectiveLabelV188('defuse a brand-new thing', 'fr'), CAMPAIGN_OBJECTIVE_FALLBACK_V188.fr);
  assert.equal(campaignObjectiveLabelV188('defuse a brand-new thing', 'en'), CAMPAIGN_OBJECTIVE_FALLBACK_V188.en);
  assert.equal(EN_CATALOG_V185[CAMPAIGN_OBJECTIVE_FALLBACK_V188.fr], CAMPAIGN_OBJECTIVE_FALLBACK_V188.en);
  assert.equal(campaignObjectiveLabelV188('', 'fr'), '');
  assert.equal(campaignObjectiveLabelV188('constructor', 'fr'), CAMPAIGN_OBJECTIVE_FALLBACK_V188.fr, 'no prototype lookup');
  assert.equal(campaignObjectiveLabelV188('secure the frontier', 'en'), 'Secure the frontier');
});

test('P1: the M panel shows the label in both languages', () => {
  const fr = buildObjectivePanelV188({ campaignObjective: 'investigate the ghost cargo', language: 'fr' });
  const en = buildObjectivePanelV188({ campaignObjective: 'rescue survivors', language: 'en' });
  assert.equal(fr.campaignObjective, 'Enquêter sur la cargaison fantôme');
  assert.equal(en.campaignObjective, 'Rescue the survivors');
});

test('P1: operation plan, command cards and mission log use the label, not campaign.objective', () => {
  const app = read('src/app.js');
  assert.doesNotMatch(app, /escapeHtml\(campaign\.objective\)/u);
  assert.doesNotMatch(app, /campaign\.objective\.toUpperCase\(\)/u);
  assert.doesNotMatch(app, /\?\.objective \|\| campaignId/u);
  assert.equal(app.match(/campaignObjectiveLabelV188\(/gu).length, 4);
});

// —— P2: catalog group glossary ——
const groupNodes = () => {
  const nodes = [];
  const walk = node => {
    if (node.kind !== 'catalog' && (node.kind !== 'type' || node.catalog === 'equipment')) nodes.push(node);
    node.children.forEach(walk);
  };
  CATALOG_TREE_V62.forEach(walk);
  return nodes;
};

test('P2: the glossary covers every group id used by the Armurerie, Xénobiologie and Véhicules trees', () => {
  const nodes = groupNodes();
  assert.ok(nodes.length > 60);
  for (const node of nodes) {
    for (const language of ['fr', 'en']) {
      const label = groupLabelV188(node.label, { catalog: node.catalog, kind: node.kind, language });
      assert.ok(label, `${node.catalog}/${node.kind}/${node.label} (${language})`);
    }
  }
  // The same id is read in context: a weapon class is not an enemy role.
  assert.notEqual(groupLabelV188('melee', { catalog: 'weapons', kind: 'category' }), groupLabelV188('melee', { catalog: 'enemies', kind: 'role' }));
  assert.equal(groupLabelV188('M41A Pulse Rifle', { catalog: 'weapons', kind: 'type' }), null, 'item names keep their own label');
  assert.equal(groupLabelV188('acid', { catalog: '__proto__', kind: 'family' }), null);
  assert.ok(Object.isFrozen(GROUP_GLOSSARY_V188.enemies.caste));
});

test('P2: every French glossary label has one English reading, the same as the catalog', () => {
  const english = new Map();
  for (const [catalog, kind, id, fr, en] of groupGlossaryRowsV188()) {
    assert.ok(!english.has(fr) || english.get(fr) === en, `${fr}: ambiguous French label (${catalog}/${kind}/${id})`);
    english.set(fr, en);
    if (fr !== en) assert.equal(EN_CATALOG_V185[fr], en, `${fr}: catalog entry for the live switch`);
    else assert.ok(!Object.hasOwn(EN_CATALOG_V185, fr) || EN_CATALOG_V185[fr] === en, fr);
    assert.doesNotMatch(fr, /^[a-z]+(?:-[a-z]+)*$/u, `${fr}: raw id shown as label`);
  }
});

test('P2: the tree and the breadcrumb render glossary labels; developer mode keeps the ids', () => {
  const weapons = CATALOG_TREE_V62.find(root => root.catalog === 'weapons');
  const acid = weapons.children.find(child => child.label === 'acid');
  const render = developer => CatalogWorkbenchV62.prototype.renderTreeNode.call({ document: fakeDocument, developerModeV110: developer, renderTreeNode: CatalogWorkbenchV62.prototype.renderTreeNode,
    state: { includeLegacyVariants: true, expandedNodeIds: new Set(), activeNodeId: null, selectedEntryId: null } }, acid, 1);
  const names = item => item.all().filter(node => node.className === 'catalog-v62__tree-name').map(node => node.textContent);
  assert.equal(names(render(false))[0], 'Acide');
  assert.equal(names(render(true))[0], 'acid');
  const source = read('src/catalog-ui-v62.js');
  assert.match(source, /groupLabelV188\(segment\.label, \{ catalog: record\.catalog, kind: segment\.kind \}\)/u);
  assert.equal(inEnglish(() => autoTranslateV185('Acide')), 'Acid');
  assert.equal(inEnglish(() => autoTranslateV185('Rôdeur')), 'Stalker');
  assert.equal(inEnglish(() => autoTranslateV185('Engins')), 'Craft');
});

test('P2: the glossary module is in the offline shell', () => {
  assert.match(read('sw.js'), /'\/src\/group-glossary-v188\.js',/u);
});

// —— P2: armory dossiers in English ——
test('P2: armory provenance notes and source credits read in English', () => {
  inEnglish(() => {
    for (const record of CATALOG_RECORDS_V62.filter(entry => entry.catalog === 'weapons')) {
      const note = record.visual?.illustrationNote;
      if (note) {
        const english = autoTranslateV185(note);
        // The compound bow note legitimately says "non-canonical".
        assert.doesNotMatch(english.replace(/non-canonical/gu, ''), FRENCH, `${record.id}: ${english}`);
      }
      const label = resolveWeaponReferenceCoverageV122(record)?.geometry?.reference?.label;
      if (label) assert.doesNotMatch(autoTranslateV185(label), FRENCH, `${record.id}: ${label}`);
    }
    assert.equal(autoTranslateV185('Pose fixe native · animations manquantes · comportement de campagne simplifié · adaptation du projet, fidélité canonique non certifiée.'),
      'Native fixed pose · animations missing · simplified campaign behavior · project adaptation, canonical fidelity not certified.');
    for (const prefix of ['Œuvre : ', 'Consulter la référence — ', 'Concept de production — ', 'Conception de production — ']) {
      assert.doesNotMatch(autoTranslateV185(prefix), FRENCH, prefix);
    }
  });
});

test('P2: label and provenance are separate text parts, so each is translated', () => {
  const rendered = [];
  const context = { document: fakeDocument, detail: { append: item => rendered.push(item) }, renderSection: CatalogWorkbenchV62.prototype.renderSection };
  CatalogWorkbenchV62.prototype.renderAlienBaseReferenceV1.call(context, { id: 'weapon-001-m41a-pulse-rifle', catalog: 'weapons' });
  const parts = rendered.flatMap(section => section.all()).filter(node => node.tagName === 'span').map(node => node.textContent);
  assert.ok(parts.includes('Œuvre : '), parts.join(' | '));
  assert.ok(parts.includes('Consulter la référence — '), parts.join(' | '));
  assert.match(read('src/catalog-ui-v62.js'), /appendTextPartsV188\(this\.document, caption, /u);
});

// —— P2: technical labels on player screens ——
test('P2: the QZ-17 chapter uses its in-universe name from the bible', () => {
  const operation = SPECIAL_OPERATIONS_V67.find(entry => entry.id === 'narrative-collectables');
  assert.equal(operation.promisedTitle, 'QZ-17 — LA CARGAISON FANTÔME');
  assert.equal(operation.campaignId, 'special-narrative-qz17', 'content id unchanged');
  assert.match(read('docs/narrative/CAMPAGNE_PRINCIPALE.md'), /Acte I — « La cargaison fantôme » \(QZ-17\)/u);
  assert.equal(CAMPAIGNS.find(campaign => campaign.id === 'special-narrative-qz17').name, 'QZ-17 — LA CARGAISON FANTÔME');
  assert.equal(inEnglish(() => autoTranslateV185('QZ-17 — LA CARGAISON FANTÔME')), 'QZ-17 — THE GHOST CARGO');
  assert.doesNotMatch(read('src/special-operations-v67.js'), /ARCHIVES NARRATIVES ÉTENDUES/u);
});

test('P2: insertion channel lines are in-universe; hook ids stay in data attributes', () => {
  const container = new FakeNode('div');
  const phase = { hooks: [
    { channel: 'audio', event: 'mission-insertion-phase-enter', operationId: 'op-123' },
    { channel: 'camera', event: 'mission-insertion-phase-enter', approach: 'dropship' },
    { channel: 'objective', event: 'mission-insertion-phase-enter', operationId: 'op-123' },
    { channel: 'telemetry', event: 'custom-event' }
  ] };
  MissionInsertionUiV62.prototype.renderHooks.call({ document: fakeDocument }, container, phase);
  const text = container.textContent;
  assert.match(text, /CANAUX TACTIQUES/u);
  assert.doesNotMatch(text, /phase-enter|op-123|custom-event|LIAISONS OPÉRATIONNELLES|telemetry/u);
  const items = container.all().filter(node => node.tagName === 'li');
  assert.deepEqual(items.map(item => item.dataset.hookChannel), ['audio', 'camera', 'objective', 'telemetry']);
  assert.equal(items[0].dataset.hookEvent, 'mission-insertion-phase-enter');
  assert.match(items[1].textContent, /Caméra casque en ligne · DROPSHIP/u);
  inEnglish(() => {
    for (const line of ['CANAUX TACTIQUES', 'Canal de l’escouade ouvert', 'Caméra casque en ligne', 'Ordres de mission transmis', 'Signal reçu', 'OPTIQUE']) {
      assert.notEqual(autoTranslateV185(line), line, line);
    }
  });
});

test('P2: archive stamps follow the ship clock style instead of ISO', () => {
  assert.equal(formatArchiveStampV188('2204-09-17T02:31:00Z', 'fr'), '2204 · J261 02:31');
  assert.equal(formatArchiveStampV188('2204-09-17T02:31:00Z', 'en'), '2204 · D261 02:31');
  assert.equal(formatArchiveStampV188('2204-09-17 · 05:02', 'fr'), '2204 · J261 05:02');
  assert.equal(formatArchiveStampV188('2204-01-01T00:00:00Z', 'fr'), '2204 · J001 00:00');
  assert.equal(formatArchiveStampV188('Déploiement en cours', 'fr'), 'Déploiement en cours');
  assert.equal(formatArchiveStampV188('2204-02-30T01:00:00Z', 'fr'), '2204-02-30T01:00:00Z', 'invalid dates are not reinterpreted');
  const source = read('src/narrative-archives-ui-v68.js');
  assert.equal(source.match(/archiveStampV188\((?:entry|selected)\.timestamp\)/gu).length, 2);
});

// —— Owner decision ——
test('Owner: DAVID-8R action reads "Recover the synthetic\'s intel" in English', () => {
  assert.equal(EN_CATALOG_V185['Extraire le renseignement synthétique'], 'Recover the synthetic\'s intel');
  assert.equal(STRINGS_V185.en['npc.action.david-8r'], 'Recover the synthetic\'s intel');
  assert.equal(STRINGS_V185.fr['npc.action.david-8r'], 'Extraire le renseignement synthétique');
  assert.equal(inEnglish(() => autoTranslateV185('Extraire le renseignement synthétique')), 'Recover the synthetic\'s intel');
});
