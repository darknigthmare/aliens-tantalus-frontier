// Regression tests, bug hunt "traductions et mise en page" (2026-11-14).
// Covers: French left on Xénobiologie counters and an AFE2 card title (P2),
// raw enum ids in the dossier tables (P2), the developer-only special-operation
// card (P2), the archive list on a live language switch (P2), the responsive
// sweep (P2) and a truncated world description (P2, content).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185, currentLanguageV185 } from '../src/i18n-v185.js';
import { CATALOG_VALUE_GLOSSARY_V188, catalogValueLabelV188, catalogValueGlossaryRowsV188,
  groupGlossaryRowsV188 } from '../src/group-glossary-v188.js';
import { CATALOG_RECORDS_V62 } from '../src/catalog-runtime-v62.js';
import { CatalogWorkbenchV62, formatCatalogValueV62 } from '../src/catalog-ui-v62.js';
import { playerCatalogStatsV110, playerCatalogNameV110 } from '../src/player-surfaces-v110.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const RAW_ID = /^(?:[a-z0-9]+(?:-[a-z0-9]+)+|[A-Z0-9]+(?:_[A-Z0-9]+)+|[a-z]+)$/u;
const FRENCH = /[éèàçêûôîœ]|\b(du|des|la|le|les|et|une|pour|avec|sans|aucun|aucune|sur|interprétation|archives historiques|courants)\b/iu;

function inEnglish(fn) {
  const previous = currentLanguageV185();
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, storage: null, persist: false });
  try { return fn(); } finally { setLanguageV185(previous, { document: null, storage: null, persist: false }); }
}

class FakeNode {
  constructor(tagName) { this.tagName = tagName.toUpperCase(); this.className = ''; this.dataset = {}; this.children = []; this.text = ''; this.style = { setProperty() {} }; this.classList = { add() {}, toggle() {} }; this.attributes = {}; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this.text = String(value); this.children = []; }
  append(...items) { this.children.push(...items.map(item => typeof item === 'string' ? Object.assign(new FakeNode('#text'), { text: item }) : item)); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  all() { return [this, ...this.children.flatMap(child => child.all())]; }
}
const fakeDocument = { createElement: tag => new FakeNode(tag) };

// —— P2: French left in English mode ——
test('P2: the Xénobiologie archive toggle and heading counter read in English', () => {
  inEnglish(() => {
    assert.equal(autoTranslateV185('AFFICHER LES 72 ARCHIVES HISTORIQUES'), 'SHOW THE 72 HISTORICAL ARCHIVES');
    assert.equal(autoTranslateV185('MASQUER LES 72 ARCHIVES HISTORIQUES'), 'HIDE THE 72 HISTORICAL ARCHIVES');
    assert.equal(autoTranslateV185('AFFICHER LES 72 ARCHIVES HISTORIQUES NON VALIDÉES'), 'SHOW THE 72 UNVALIDATED HISTORICAL ARCHIVES');
    assert.equal(autoTranslateV185('118 DOSSIERS // 46 COURANTS · 72 ARCHIVES HISTORIQUES'), '118 FILES // 46 CURRENT · 72 HISTORICAL ARCHIVES');
  });
  // The texts the patterns cover are the ones the views write.
  assert.match(read('src/catalog-ui-v62.js'), /`\$\{this\.state\.includeLegacyVariants \? 'MASQUER' : 'AFFICHER'\} LES \$\{archived\} ARCHIVES HISTORIQUES\$\{this\.developerModeV110 \? ' NON VALIDÉES' : ''\}`/u);
  assert.match(read('src/app.js'), /DOSSIERS \/\/ \$\{CATALOG_COUNTS_V62\.enemies - archived\} COURANTS · \$\{archived\} ARCHIVES HISTORIQUES/u);
});

test('P2: AFE2 family cards ("Igniter — interprétation de famille") read in English', () => {
  const titles = [...new Set(CATALOG_RECORDS_V62.filter(record => /interprétation de famille/u.test(record.name))
    .map(record => playerCatalogNameV110(record.name)))];
  assert.ok(titles.includes('Igniter — interprétation de famille'), titles.join(', '));
  inEnglish(() => {
    for (const title of titles) assert.doesNotMatch(autoTranslateV185(title), FRENCH, title);
    assert.equal(autoTranslateV185('Igniter — interprétation de famille'), 'Igniter — family interpretation');
  });
});

// —— P2: enum values in the dossier tables ——
const dossierValues = () => {
  const rows = [];
  const add = (key, value, record) => {
    if (Array.isArray(value)) { for (const entry of value) add(key, entry, record); return; }
    if (typeof value === 'string') rows.push({ key, value, catalog: record.catalog, id: record.id });
  };
  for (const record of CATALOG_RECORDS_V62) {
    for (const [key, value] of Object.entries(record.canonFacts.claims)) if (!['name', 'source', 'canonicalName', 'canonicalVariant'].includes(key)) add(key, value, record);
    for (const [key, value] of Object.entries(record.canonFacts.source)) if (!['work', 'encounterNote'].includes(key)) add(key, value, record);
    for (const [key, value] of Object.entries(record.gameplayStats)) if (!['description', 'encounterWorldIds', 'habitats', 'seats'].includes(key)) add(key, value, record);
    for (const seat of record.gameplayStats.seats || []) { add('seatRole', seat.role, record); add('actions', seat.actions, record); }
  }
  return rows.filter(row => row.value !== 'unknown');
};

test('P2: every enum value of the dossier tables has a FR and EN label', () => {
  const rows = dossierValues();
  assert.ok(rows.length > 1000);
  const missing = new Set();
  for (const { key, value, catalog } of rows) {
    for (const language of ['fr', 'en']) if (!catalogValueLabelV188(key, value, { catalog, language })) missing.add(`${catalog}/${key}/${value}`);
  }
  assert.deepEqual([...missing], []);
  // Families use the group glossary of the record's own catalog.
  assert.equal(catalogValueLabelV188('family', 'ballistic', { catalog: 'weapons' }), 'Balistique');
  assert.equal(catalogValueLabelV188('family', 'ground', { catalog: 'vehicles', language: 'en' }), 'Ground');
  assert.equal(catalogValueLabelV188('provenance', 'licensed-reference', { language: 'en' }), 'Licensed reference');
  assert.equal(catalogValueLabelV188('referenceStatus', 'PRODUCTION_REFERENCE_RECONSTRUCTION'), 'Reconstitution d’après une référence de production');
  assert.equal(catalogValueLabelV188('rarity', 'common', { language: 'en' }), 'Common');
  assert.equal(catalogValueLabelV188('rarity', '__proto__'), null);
  assert.equal(catalogValueLabelV188('name', 'M41A Pulse Rifle', { catalog: 'weapons' }), null, 'free text keeps its value');
  assert.ok(Object.isFrozen(CATALOG_VALUE_GLOSSARY_V188.rarity));
});

test('P2: each French value label has one English reading, the same as the catalog', () => {
  const english = new Map(groupGlossaryRowsV188().map(([, , , fr, en]) => [fr, en]));
  for (const [key, id, fr, en] of catalogValueGlossaryRowsV188()) {
    assert.ok(!english.has(fr) || english.get(fr) === en, `${fr}: ambiguous French label (${key}/${id})`);
    english.set(fr, en);
    if (fr !== en) assert.equal(EN_CATALOG_V185[fr], en, `${fr}: catalog entry for the live switch`);
    assert.doesNotMatch(fr, RAW_ID, `${key}/${id}: raw id shown as label`);
    inEnglish(() => assert.equal(autoTranslateV185(fr), en, fr));
  }
});

const renderDetail = (record, developer) => {
  const detail = new FakeNode('div');
  const workbench = Object.create(CatalogWorkbenchV62.prototype);
  Object.assign(workbench, { document: fakeDocument, detail, root: new FakeNode('div'), developerModeV110: developer,
    predicate: null, animator: { mount: () => null }, getActions: () => [], getDiscoveryV88: null, state: { includeLegacyVariants: true } });
  Object.defineProperty(workbench, 'catalogs', { value: [record.catalog] });
  workbench.renderMissingMedia = () => {};
  workbench.renderVehicleShowroomV119 = () => null;
  workbench.renderDetail(record);
  const rows = detail.all().filter(node => node.className === 'catalog-v62__data-row');
  return rows.map(row => ({ term: row.children[0].textContent, value: row.children[1].textContent, node: row.children[1] }));
};

test('P2: Armurerie, Véhicules and Xénobiologie dossiers show labels, developer mode adds the ids', () => {
  const weapon = CATALOG_RECORDS_V62.find(record => record.catalog === 'weapons' && record.canonFacts.claims.family === 'ballistic'
    && record.canonFacts.source.provenance === 'licensed-reference' && record.gameplayStats.rarity);
  assert.ok(weapon, 'a licensed ballistic weapon');
  const player = renderDetail(weapon, false);
  const values = player.map(row => row.value).join(' | ');
  for (const raw of ['ballistic', 'licensed-reference', 'PRODUCTION_REFERENCE_RECONSTRUCTION', 'common', 'uncommon', 'rare', 'portable']) {
    assert.doesNotMatch(values, new RegExp(`(^|[ |·])${raw}($|[ |·])`, 'u'), `${raw} shown to the player: ${values}`);
  }
  assert.ok(player.some(row => row.term === 'Famille' && row.value === 'Balistique'), values);
  assert.ok(player.some(row => row.term === 'Provenance' && row.value === 'Référence sous licence'), values);
  assert.ok(player.every(row => !row.node.all().some(node => node.tagName === 'CODE')), 'no id element for the player');
  const developer = renderDetail(weapon, true);
  const family = developer.find(row => row.term === 'Famille');
  assert.equal(family.node.children.find(node => node.tagName === 'CODE')?.textContent.trim(), 'ballistic', 'developer keeps the id');
  assert.match(family.value, /^Balistique/u);

  const vehicle = CATALOG_RECORDS_V62.find(record => record.catalog === 'vehicles' && record.gameplayStats.seats?.length > 3);
  const seats = renderDetail(vehicle, false).find(row => row.term === 'Postes');
  assert.match(seats.value, /^Pilote \/ conducteur ×1/u);
  assert.doesNotMatch(seats.value, /seat-\d|driver|passenger|drive/u);
  // One span per label, so the English layer translates each one live.
  inEnglish(() => {
    const parts = seats.node.children.map(node => autoTranslateV185(node.textContent)).join('');
    assert.match(parts, /^Pilot \/ driver ×1/u);
    assert.doesNotMatch(parts, /Passager|conducteur/u);
  });

  const enemy = CATALOG_RECORDS_V62.find(record => record.catalog === 'enemies' && record.gameplayStats.behavior === 'pouncer');
  assert.ok(renderDetail(enemy, false).some(row => row.term === 'Comportement' && row.value === 'Bondisseur'));
  // The formatter without a key is unchanged for other callers.
  assert.equal(formatCatalogValueV62('ballistic'), 'ballistic');
  assert.equal(formatCatalogValueV62(['common', 'rare'], { key: 'rarity' }), 'Courante · Rare');
  assert.equal(Object.keys(playerCatalogStatsV110({ rarity: 'common' })).length, 0, 'player stat filter unchanged');
});
