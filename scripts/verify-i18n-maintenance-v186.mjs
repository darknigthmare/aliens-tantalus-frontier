import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  REVIEW_FORMAT_V186, currentCatalogV186, validateCatalogV186, mergeReviewV186,
  renderCatalogV186, reportObservedV186
} from './i18n-catalog-maintenance-v186.mjs';
import { currentLanguageV185, setLanguageV185 } from '../src/i18n-v185.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';

const catalog = () => ({ exact: { Bonjour: 'Hello' }, patterns: { 'Objets : {0}': 'Items: {0}' } });
const review = (entries = {}) => ({ format: REVIEW_FORMAT_V186, ...entries });
const entry = (fr, en, rest = {}) => ({ fr, en, source: 'observed:test fixture', ...rest });

test('V186 current catalog is admissible; historical pattern omissions stay visible', () => {
  const checked = validateCatalogV186(currentCatalogV186());
  assert.equal(checked.exact, Object.keys(currentCatalogV186().exact).length);
  assert.equal(checked.patterns, Object.keys(currentCatalogV186().patterns).length);
  assert.equal(checked.omittedPatternSlots, 1);
});

test('V186 observed System heading and three profile slots translate without swallowing their status', () => {
  const current = currentCatalogV186();
  useCatalogV185({ EN_CATALOG_V185: current.exact, EN_PATTERNS_V185: current.patterns });
  const samples = [['LIAISON FRONTIER · PROFILS', 'FRONTIER LINK · PROFILES']];
  for (const slot of [1, 2, 3]) samples.push(
    [`PROFIL ${slot}`, `PROFILE ${slot}`],
    [`PROFIL ${slot} · ACTIF`, `PROFILE ${slot} · ACTIVE`],
    [`PROFIL ${slot} · LOCAL`, `PROFILE ${slot} · LOCAL`]
  );
  setLanguageV185('en', { document: null, persist: false });
  try {
    for (const [fr, en] of samples) assert.equal(autoTranslateV185(fr), en, fr);
    setLanguageV185('fr', { document: null, persist: false });
    for (const [fr] of samples) assert.equal(autoTranslateV185(fr), fr, fr);
  } finally { setLanguageV185('fr', { document: null, persist: false }); }
});

test('V186 review merges additions without dropping untouched entries or mutating input', () => {
  const original = catalog();
  const merged = mergeReviewV186(original, review({ exact: [entry('Bonsoir', 'Good evening')] }));
  assert.equal(merged.exact.Bonjour, 'Hello');
  assert.equal(merged.exact.Bonsoir, 'Good evening');
  assert.deepEqual({ ...merged.patterns }, original.patterns);
  assert.equal(original.exact.Bonsoir, undefined);
});

test('V186 conflicts require the exact previous translation; stale review cannot overwrite it', () => {
  assert.throws(() => mergeReviewV186(catalog(), review({ exact: [entry('Bonjour', 'Hi')] })), /conflict/);
  assert.throws(() => mergeReviewV186(catalog(), review({ exact: [entry('Bonjour', 'Hi', { previous: 'Welcome' })] })), /stale/);
  const merged = mergeReviewV186(catalog(), review({ exact: [entry('Bonjour', 'Hi', { previous: 'Hello' })] }));
  assert.equal(merged.exact.Bonjour, 'Hi');
  assert.throws(() => mergeReviewV186(catalog(), review({ exact: [entry('Bonsoir', 'Good evening', { previous: '' })] })), /new entry/);
});

test('V186 pattern slots can reorder but cannot be invented or silently dropped', () => {
  const original = catalog();
  const fr = 'Pont {0} · salle {1}';
  assert.equal(mergeReviewV186(original, review({ patterns: [entry(fr, 'Room {1} · deck {0}')] })).patterns[fr], 'Room {1} · deck {0}');
  assert.throws(() => mergeReviewV186(original, review({ patterns: [entry(fr, 'Deck {2} · room {1}')] })), /dropped slots/);
  assert.throws(() => mergeReviewV186(original, review({ patterns: [entry(fr, 'Deck {0}')] })), /dropped slots/);
  const omitted = mergeReviewV186(original, review({ patterns: [entry(fr, 'Deck {0}', { omitSlots: [1] })] }));
  assert.equal(validateCatalogV186(omitted).omittedPatternSlots, 1);
  assert.throws(() => mergeReviewV186(original, review({ patterns: [entry(fr, 'Deck {0} / {2}', { omitSlots: [1] })] })), /introduces a slot/);
  assert.throws(() => mergeReviewV186(original, review({ patterns: [entry(fr, 'Deck {0}', { omitSlots: [1, 1] })] })), /dropped slots/);
});

test('V186 review rejects duplicates, empty translations, missing provenance and misspelled fields', () => {
  assert.throws(() => mergeReviewV186(catalog(), review({ exact: [entry('Bonsoir', 'Evening'), entry('Bonsoir', 'Evening')] })), /duplicate/);
  assert.throws(() => mergeReviewV186(catalog(), review({ exact: [entry('Bonsoir', '  ')] })), /non-empty/);
  assert.throws(() => mergeReviewV186(catalog(), review({ exact: [{ fr: 'Bonsoir', en: 'Evening' }] })), /source/);
  assert.throws(() => mergeReviewV186(catalog(), review({ exact: [{ ...entry('Bonsoir', 'Evening'), english: 'oops' }] })), /unknown field/);
  assert.throws(() => mergeReviewV186(catalog(), { format: 'unknown' }), /Unsupported/);
});

test('V186 catalog rejects source/target slot drift, reserved keys and misplaced patterns', () => {
  assert.throws(() => validateCatalogV186({ exact: { 'Compte {0}': 'Count {0}' }, patterns: {} }), /belong in patterns/);
  assert.throws(() => validateCatalogV186({ exact: {}, patterns: { Texte: 'Text' } }), /at least one/);
  assert.throws(() => validateCatalogV186({ exact: JSON.parse('{"__proto__":"unsafe"}'), patterns: {} }), /Reserved/);
  assert.throws(() => validateCatalogV186({ exact: {}, patterns: { 'Compte {0}': 'Count {1}' } }), /introduces/);
});

test('V186 proposal bytes are deterministic and exported strings preserve escapes as data', async () => {
  const a = mergeReviewV186(catalog(), review({ exact: [entry('Bonsoir', 'Evening'), entry('Texte "cité"\nligne', 'Quoted "text"\nline')] }));
  const b = mergeReviewV186(catalog(), review({ exact: [entry('Texte "cité"\nligne', 'Quoted "text"\nline'), entry('Bonsoir', 'Evening')] }));
  const source = renderCatalogV186(a);
  assert.equal(source, renderCatalogV186(b));
  // Only a module produced by our serializer is imported, never an input source file.
  const loaded = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  assert.deepEqual({ ...loaded.EN_CATALOG_V185 }, { ...a.exact });
  assert.deepEqual({ ...loaded.EN_PATTERNS_V185 }, { ...a.patterns });
});

test('V186 observed report uses real automatic translation and keeps unknown text for review', () => {
  setLanguageV185('en', { document: null, persist: false });
  const report = reportObservedV186(catalog(), { texts: [
    { text: 'Bonjour', source: 'title' }, { text: 'Objets : 7', source: 'hub' },
    { text: 'Rook', source: 'hub' }, { text: 'Bonjour', source: 'hub' },
    { text: 'Bonjour · Texte non répertorié', source: 'partial joined message' }
  ] });
  assert.equal(report.observed, 4);
  assert.equal(report.translated, 3);
  assert.deepEqual(report.texts.find(entry => entry.text === 'Bonjour').sources, ['hub', 'title']);
  assert.equal(report.texts.find(entry => entry.text === 'Objets : 7').translation, 'Items: 7');
  assert.equal(report.texts.find(entry => entry.text === 'Rook').status, 'unchanged-review-needed');
  assert.equal(report.texts.find(entry => entry.text === 'Bonjour · Texte non répertorié').translation, 'Hello · Texte non répertorié');
  assert.match(report.scope, /partially translated joined message/);
  assert.match(report.scope, /All outputs require contextual review/);
  assert.equal(currentLanguageV185(), 'en');
  setLanguageV185('fr', { document: null, persist: false });
});

test('V186 CLI reads JSON as data, writes a fresh proposal, and refuses to overwrite files', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'atf-i18n-v186-'));
  const tool = new URL('./i18n-catalog-maintenance-v186.mjs', import.meta.url).pathname;
  try {
    const input = join(temporary, 'review.json'), output = join(temporary, 'proposal.js');
    await writeFile(input, JSON.stringify(review({ exact: [entry('Nouvelle chaîne de test V186', 'New V186 test string')] })));
    const result = JSON.parse(execFileSync(process.execPath, [tool, 'merge', input, output], { encoding: 'utf8' }));
    assert.equal(result.exact, Object.keys(currentCatalogV186().exact).length + 1);
    const first = await readFile(output, 'utf8');
    assert.throws(() => execFileSync(process.execPath, [tool, 'merge', input, output], { stdio: 'pipe' }), /Command failed/);
    assert.equal(await readFile(output, 'utf8'), first);
    await writeFile(input, 'globalThis.UNSAFE_I18N_INPUT = true;');
    assert.throws(() => execFileSync(process.execPath, [tool, 'merge', input, join(temporary, 'never.js')], { stdio: 'pipe' }), /Command failed/);
    assert.equal(globalThis.UNSAFE_I18N_INPUT, undefined);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
