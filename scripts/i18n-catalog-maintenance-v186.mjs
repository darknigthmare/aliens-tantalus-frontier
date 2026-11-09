/** Maintenance of reviewed V185 translations. Inputs are JSON, never JS to execute. */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { currentLanguageV185, setLanguageV185 } from '../src/i18n-v185.js';

export const REVIEW_FORMAT_V186 = 'atf-i18n-review-v186';
export const currentCatalogV186 = () => ({ exact: EN_CATALOG_V185, patterns: EN_PATTERNS_V185 });
const order = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const slots = text => [...new Set([...text.matchAll(/\{(\d+)\}/g)].map(match => Number(match[1])))].sort((a, b) => a - b);
const record = (value, label) => assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${label}: object required`);
const text = (value, label) => assert.ok(typeof value === 'string' && value.trim(), `${label}: non-empty text required`);
const knownFields = (value, allowed, label) => {
  for (const key of Object.keys(value)) assert.ok(allowed.includes(key), `${label}: unknown field ${key}`);
};

/** Existing reviewed patterns may omit a French plural slot, but cannot invent one. */
export function validateCatalogV186(catalog) {
  record(catalog, 'catalog');
  knownFields(catalog, ['exact', 'patterns'], 'catalog');
  let omittedPatternSlots = 0;
  for (const section of ['exact', 'patterns']) {
    record(catalog[section], section);
    for (const [fr, en] of Object.entries(catalog[section])) {
      text(fr, section); text(en, `${section}:${fr}`);
      assert.notEqual(fr, '__proto__', 'Reserved object-literal key');
      const source = slots(fr), target = slots(en);
      assert.ok([...source, ...target].every(Number.isSafeInteger), `${section}:${fr}: unsafe slot number`);
      assert.ok(target.every(slot => source.includes(slot)), `${section}:${fr}: English introduces a slot`);
      if (section === 'exact') assert.equal(source.length, 0, `exact:${fr}: numbered slots belong in patterns`);
      else {
        assert.ok(source.length, `patterns:${fr}: at least one numbered slot required`);
        omittedPatternSlots += source.filter(slot => !target.includes(slot)).length;
      }
    }
  }
  return { exact: Object.keys(catalog.exact).length, patterns: Object.keys(catalog.patterns).length, omittedPatternSlots };
}

/** Add or explicitly revise reviewed entries; no deletion and no implicit overwrite. */
export function mergeReviewV186(catalog, review) {
  validateCatalogV186(catalog);
  record(review, 'review');
  knownFields(review, ['format', 'exact', 'patterns'], 'review');
  assert.equal(review.format, REVIEW_FORMAT_V186, 'Unsupported review format');
  const result = { exact: Object.assign(Object.create(null), catalog.exact), patterns: Object.assign(Object.create(null), catalog.patterns) };
  for (const section of ['exact', 'patterns']) {
    const entries = review[section] ?? [];
    assert.ok(Array.isArray(entries), `${section}: array required`);
    const seen = new Set();
    for (const entry of entries) {
      record(entry, section);
      knownFields(entry, ['fr', 'en', 'source', 'previous', 'omitSlots'], section);
      text(entry.fr, `${section}.fr`); text(entry.en, `${section}.en`); text(entry.source, `${section}.source`);
      assert.ok(!seen.has(entry.fr), `${section}:${entry.fr}: duplicate review entry`);
      seen.add(entry.fr);
      const exists = Object.hasOwn(result[section], entry.fr);
      if (Object.hasOwn(entry, 'previous')) {
        assert.ok(exists, `${section}:${entry.fr}: previous supplied for a new entry`);
        assert.equal(entry.previous, result[section][entry.fr], `${section}:${entry.fr}: stale previous translation`);
      } else if (exists) {
        assert.equal(entry.en, result[section][entry.fr], `${section}:${entry.fr}: conflict requires previous translation`);
      }
      const missing = slots(entry.fr).filter(slot => !slots(entry.en).includes(slot));
      const omitted = entry.omitSlots ?? [];
      assert.ok(Array.isArray(omitted) && omitted.every(slot => Number.isSafeInteger(slot) && slot >= 0), `${section}:${entry.fr}: omitSlots must be slot numbers`);
      assert.deepEqual([...omitted].sort((a, b) => a - b), missing, `${section}:${entry.fr}: dropped slots must be explicitly reviewed with omitSlots`);
      result[section][entry.fr] = entry.en;
    }
  }
  validateCatalogV186(result);
  return result;
}

/** Sorted, deterministic proposal; the CLI never overwrites an existing file. */
export function renderCatalogV186(catalog) {
  validateCatalogV186(catalog);
  const section = entries => Object.entries(entries).sort(([a], [b]) => order(a, b))
    .map(([fr, en]) => `${JSON.stringify(fr)}: ${JSON.stringify(en)}`).join(',\n');
  return '// Reviewed V185 English catalog; proposal produced by i18n-catalog-maintenance-v186.mjs.\n'
    + '// Exact French keys and numbered pattern slots are preserved.\n'
    + `export const EN_CATALOG_V185 = Object.freeze({\n${section(catalog.exact)}\n});\n`
    + `export const EN_PATTERNS_V185 = Object.freeze({\n${section(catalog.patterns)}\n});\n`;
}

/** Report only the supplied observations, through the actual automatic translator. */
export function reportObservedV186(catalog, observation) {
  validateCatalogV186(catalog);
  record(observation, 'observation');
  knownFields(observation, ['texts'], 'observation');
  assert.ok(Array.isArray(observation.texts), 'observation.texts: array required');
  const grouped = new Map();
  for (const entry of observation.texts) {
    record(entry, 'observation.texts'); knownFields(entry, ['text', 'source'], 'observation.texts');
    text(entry.text, 'observed text'); text(entry.source, 'observed source');
    if (!grouped.has(entry.text)) grouped.set(entry.text, new Set());
    grouped.get(entry.text).add(entry.source);
  }
  const previousLanguage = currentLanguageV185();
  useCatalogV185({ EN_CATALOG_V185: catalog.exact, EN_PATTERNS_V185: catalog.patterns });
  setLanguageV185('en', { document: null, storage: null, persist: false });
  try {
    const texts = [...grouped].sort(([a], [b]) => order(a, b)).map(([french, sources]) => {
      const english = autoTranslateV185(french);
      return { text: french, translation: english, status: english !== french ? 'translated' : 'unchanged-review-needed', sources: [...sources].sort(order) };
    });
    return {
      scope: 'Supplied observed texts only. translated means changed output, including a partially translated joined message; it is not complete linguistic coverage. Unchanged text can be a proper name, shared wording or an unknown translation. All outputs require contextual review. No source extraction, journey coverage or workbook completion is implied.',
      observed: texts.length, translated: texts.filter(entry => entry.status === 'translated').length, texts
    };
  } finally {
    useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
    setLanguageV185(previousLanguage, { document: null, storage: null, persist: false });
  }
}

const readJson = async path => {
  const bytes = await readFile(path);
  assert.ok(bytes.length <= 10 * 1024 * 1024, 'JSON input exceeds 10 MiB');
  return JSON.parse(bytes.toString('utf8'));
};

export async function runMaintenanceV186(args) {
  const [command, input, output] = args;
  const catalog = currentCatalogV186();
  if (command === 'check' && args.length === 1) return validateCatalogV186(catalog);
  if (command === 'report' && args.length === 2) return reportObservedV186(catalog, await readJson(input));
  if (command === 'merge' && args.length === 3) {
    const merged = mergeReviewV186(catalog, await readJson(input));
    // wx also protects symlinks and the existing source catalog from replacement.
    await writeFile(output, renderCatalogV186(merged), { flag: 'wx' });
    return { proposal: resolve(output), ...validateCatalogV186(merged) };
  }
  throw new Error('Usage: node scripts/i18n-catalog-maintenance-v186.mjs check | report observed.json | merge reviewed.json NEW-proposal.js');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(await runMaintenanceV186(process.argv.slice(2)), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
