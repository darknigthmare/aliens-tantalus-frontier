import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  STRINGS_V185, LANGUAGES_V185, DEFAULT_LANGUAGE_V185, LANGUAGE_STORAGE_KEY_V185,
  tV185, setLanguageV185, readStoredLanguageV185, normalizeLanguageV185, applyStaticTranslationsV185
} from '../src/i18n-v185.js';

const memoryStorage = (initial = {}) => {
  const data = { ...initial };
  return { getItem: key => (key in data ? data[key] : null), setItem: (key, value) => { data[key] = String(value); }, data };
};

test('V185 French and English dictionaries declare the same keys with non-empty text', () => {
  assert.deepEqual(LANGUAGES_V185, ['fr', 'en']);
  const fr = Object.keys(STRINGS_V185.fr).sort();
  const en = Object.keys(STRINGS_V185.en).sort();
  assert.deepEqual(en, fr);
  for (const language of LANGUAGES_V185) for (const [key, text] of Object.entries(STRINGS_V185[language])) assert.ok(text.trim(), `${language}:${key}`);
});

test('V185 every key marked in index.html exists in both languages', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const keys = [...html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)].map(match => match[1]);
  assert.ok(keys.length >= 20);
  for (const key of keys) for (const language of LANGUAGES_V185) assert.ok(STRINGS_V185[language][key], `${language}:${key}`);
  // The French markup is the source text: each marked French string matches the dictionary.
  for (const match of html.matchAll(/data-i18n="([^"]+)">([^<]*)/g)) {
    const text = match[2].trim();
    if (text) assert.equal(text, STRINGS_V185.fr[match[1]], match[1]);
  }
});

test('V185 lookup falls back to French, then to the given text, never to a raw key', () => {
  setLanguageV185('en', { storage: memoryStorage(), document: null });
  assert.equal(tV185('settings.language'), 'LANGUAGE');
  assert.equal(tV185('missing.key', 'Texte source'), 'Texte source');
  assert.equal(tV185('missing.key'), '');
  setLanguageV185('fr', { storage: memoryStorage(), document: null });
  assert.equal(tV185('settings.language'), 'LANGUE');
});

test('V185 language preference is normalized and stored per device, outside the save', () => {
  assert.equal(normalizeLanguageV185('de'), DEFAULT_LANGUAGE_V185);
  assert.equal(readStoredLanguageV185(memoryStorage({ [LANGUAGE_STORAGE_KEY_V185]: 'en' })), 'en');
  assert.equal(readStoredLanguageV185(memoryStorage({ [LANGUAGE_STORAGE_KEY_V185]: '<script>' })), 'fr');
  assert.equal(readStoredLanguageV185({ getItem() { throw new Error('blocked'); } }), 'fr');
  const storage = memoryStorage();
  setLanguageV185('en', { storage, document: null });
  assert.equal(storage.data[LANGUAGE_STORAGE_KEY_V185], 'en');
  assert.doesNotThrow(() => setLanguageV185('fr', { storage: { setItem() { throw new Error('full'); } }, document: null }));
});

test('V185 static translation replaces only the element own text and keeps child controls', () => {
  const text = value => ({ nodeType: 3, textContent: value });
  const child = { nodeType: 1 };
  const label = { dataset: { i18n: 'settings.coop' }, childNodes: [child, text(' Coop locale')], children: [child] };
  const nav = { dataset: { i18n: 'nav.settings' }, childNodes: [child, text(' Système')], children: [child] };
  const plain = { dataset: { i18n: 'title.start' }, childNodes: [], children: [], textContent: '' };
  const aria = { dataset: { i18nAria: 'nav.main' }, getAttribute: () => 'Navigation principale', setAttribute(name, value) { this[name] = value; } };
  const root = { querySelectorAll: selector => (selector === '[data-i18n]' ? [label, nav, plain] : [aria]) };
  setLanguageV185('en', { storage: memoryStorage(), document: null });
  assert.equal(applyStaticTranslationsV185(root), 4);
  assert.equal(label.childNodes[0], child);
  assert.equal(label.childNodes[1].textContent, ' Local co-op');
  assert.equal(nav.childNodes[1].textContent, ' System');
  assert.equal(plain.textContent, 'PRESS TO START');
  assert.equal(aria['aria-label'], 'Main navigation');
  setLanguageV185('fr', { storage: memoryStorage(), document: null });
  applyStaticTranslationsV185(root);
  assert.equal(label.childNodes[1].textContent, ' Coop locale');
});
