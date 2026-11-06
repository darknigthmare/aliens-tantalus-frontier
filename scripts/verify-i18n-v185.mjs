import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  STRINGS_V185, LANGUAGES_V185, DEFAULT_LANGUAGE_V185, LANGUAGE_STORAGE_KEY_V185,
  tV185, tFromFrenchV185, setLanguageV185, readStoredLanguageV185, normalizeLanguageV185, applyStaticTranslationsV185
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

test('V185 every key marked in index.html and the player creator exists in both languages', async () => {
  const html = (await readFile(new URL('../index.html', import.meta.url), 'utf8'))
    + await readFile(new URL('../src/player-creator-ui-v84.js', import.meta.url), 'utf8');
  const keys = [...html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)].map(match => match[1])
    .concat([...html.matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap(match => match[1].split(';').map(pair => pair.split(':')[1])));
  assert.ok(keys.length >= 30);
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
  const root = { querySelectorAll: selector => (selector === '[data-i18n]' ? [label, nav, plain] : selector === '[data-i18n-aria]' ? [aria] : []) };
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

test('V185 French module messages and attributes are translated without changing the validator', async () => {
  const { validatePlayerIdentityV84 } = await import('../src/player-onboarding-v84.js');
  const result = validatePlayerIdentityV84({ name: 'x', callsign: '!' });
  assert.equal(result.ok, false);
  setLanguageV185('en', { storage: memoryStorage(), document: null });
  for (const message of Object.values(result.errors)) assert.notEqual(tFromFrenchV185(message), message, message);
  assert.equal(tFromFrenchV185('Texte inconnu'), 'Texte inconnu');
  assert.equal(tV185('creator.profile', '', { profile: 2 }).startsWith('Profile 2:'), true);
  const input = { dataset: { i18nAttr: 'placeholder:creator.namePlaceholder;onclick:creator.name' }, attrs: { placeholder: 'Prénom et nom' },
    getAttribute(name) { return this.attrs[name] ?? null; }, setAttribute(name, value) { this.attrs[name] = value; } };
  applyStaticTranslationsV185({ querySelectorAll: selector => (selector === '[data-i18n-attr]' ? [input] : []) });
  assert.equal(input.attrs.placeholder, 'First and last name');
  assert.equal(input.attrs.onclick, undefined);
  setLanguageV185('fr', { storage: memoryStorage(), document: null });
  assert.equal(tFromFrenchV185(result.errors.name), result.errors.name);
});

test('V185 French title templates reproduce the previous French text exactly', () => {
  setLanguageV185('fr', { storage: memoryStorage(), document: null });
  assert.equal(tV185('title.profileStatus', '', { profile: 1, day: '01', hour: '06', minute: '00' }), 'PROFIL 1 · J01 06:00 · SAUVEGARDE LOCALE');
  assert.equal(tV185('title.live.confirm', '', { profile: 2 }), 'Confirmez pour remplacer la partie du profil 2.');
  assert.equal(tV185('title.live.failed', '', { reason: 'sauvegarde indisponible' }), 'Nouvelle partie non créée : sauvegarde indisponible');
  setLanguageV185('en', { storage: memoryStorage(), document: null });
  assert.equal(tV185('title.profileStatus', '', { profile: 1, day: '01', hour: '06', minute: '00' }), 'PROFILE 1 · D01 06:00 · LOCAL SAVE');
  assert.equal(tFromFrenchV185('ENTRER SUR LE TANTALUS'), 'BOARD THE TANTALUS');
  setLanguageV185('fr', { storage: memoryStorage(), document: null });
});

test('V185 every core hub deck and room name has an English entry matched from its French name', async () => {
  const { HUB_DECKS } = await import('../src/hub-game.js');
  setLanguageV185('en', { storage: memoryStorage(), document: null });
  const names = HUB_DECKS.flatMap(deck => [deck.name, ...deck.rooms.map(room => room.name)]);
  assert.equal(names.length, 20);
  for (const name of names) assert.notEqual(tFromFrenchV185(name), name, name);
  assert.equal(tFromFrenchV185('A / D — marcher · MAJ — courir · ESPACE — franchir · E — utiliser'), 'A / D — walk · SHIFT — run · SPACE — vault · E — use');
  setLanguageV185('fr', { storage: memoryStorage(), document: null });
  for (const name of names) assert.equal(tFromFrenchV185(name), name);
});

test('V185 French objective and prompt entries are copied verbatim from the modules that own them', async () => {
  const sources = {
    onboarding: 'src/player-onboarding-v84.js', opening: 'src/player-opening-v88.js',
    exercise: 'src/opening-exercise-v89.js', port: 'src/port-meridien-v90.js'
  };
  const read = async path => readFile(new URL('../' + path, import.meta.url), 'utf8');
  for (const [prefix, path] of Object.entries(sources)) {
    const source = await read(path);
    const keys = Object.keys(STRINGS_V185.fr).filter(key => key.startsWith(prefix + '.') && !STRINGS_V185.fr[key].includes('{'));
    assert.ok(keys.length >= 3, prefix);
    for (const key of keys) assert.ok(source.includes(STRINGS_V185.fr[key]), key);
  }
  const hubSources = (await read('src/hub-v51-runtime.js')) + (await read('src/hub-game.js')) + (await read('src/app.js'));
  for (const key of Object.keys(STRINGS_V185.fr).filter(key => key.startsWith('hub.prompt.') && !STRINGS_V185.fr[key].includes('{') && key !== 'hub.prompt.markup' && key !== 'hub.prompt.counter')) {
    assert.ok(hubSources.includes(STRINGS_V185.fr[key]), key);
  }
  for (const key of Object.keys(STRINGS_V185.fr).filter(key => key.startsWith('toast.'))) assert.ok(hubSources.includes(`toast('${STRINGS_V185.fr[key]}')`), key);
  for (const key of Object.keys(STRINGS_V185.fr).filter(key => key.startsWith('hub.deckShort.'))) assert.ok(hubSources.includes(`shortName: '${STRINGS_V185.fr[key]}'`), key);
});

test('V185 first-hour dialogue entries are copied verbatim from their modules', async () => {
  const read = async path => readFile(new URL('../' + path, import.meta.url), 'utf8');
  const onboarding = await read('src/player-onboarding-v84.js');
  const opening = (await read('src/player-opening-v88.js')) + (await read('src/app.js'));
  const app = await read('src/app.js');
  const check = (prefix, source) => {
    const keys = Object.keys(STRINGS_V185.fr).filter(key => key.startsWith(prefix));
    assert.ok(keys.length, prefix);
    for (const key of keys) assert.ok(source.includes(`'${STRINGS_V185.fr[key]}'`), key);
  };
  check('dlg.v84.', onboarding);
  check('dlg.v88.', opening);
  check('post.', opening);
  check('dlg.btn.', app);
  check('error.', app);
  const { ONBOARDING_DIALOGUES_V84 } = await import('../src/player-onboarding-v84.js');
  const { OPENING_SIGNAL_V88, OPENING_POSTS_V88 } = await import('../src/player-opening-v88.js');
  setLanguageV185('en', { storage: memoryStorage(), document: null });
  const lines = Object.values(ONBOARDING_DIALOGUES_V84).flatMap(entry => entry.lines).concat(OPENING_SIGNAL_V88, Object.values(OPENING_POSTS_V88).map(post => post.label));
  for (const line of lines) assert.notEqual(tFromFrenchV185(line), line, line);
  setLanguageV185('fr', { storage: memoryStorage(), document: null });
});

test('V185 crew interaction prompts translate the action and keep the crew name', async () => {
  const { HUB_NPC_ROSTER } = await import('../src/hub-v52-runtime.js');
  const { translateHubPromptV185 } = await import('../src/i18n-v185.js');
  assert.equal(HUB_NPC_ROSTER.length, 16);
  const roster = await readFile(new URL('../src/hub-v52-runtime.js', import.meta.url), 'utf8');
  const actions = Object.keys(STRINGS_V185.fr).filter(key => key.startsWith('npc.action.'));
  assert.equal(actions.length, 16);
  for (const key of actions) assert.ok(roster.includes(`'${STRINGS_V185.fr[key]}')`), key);
  setLanguageV185('en', { storage: memoryStorage(), document: null });
  assert.equal(translateHubPromptV185('E — Extraire le renseignement synthétique · DAVID-8R'), 'E — Extract the synthetic intelligence · DAVID-8R');
  assert.equal(translateHubPromptV185('E — Inconnu · Rook'), 'E — Inconnu · Rook');
  assert.equal(translateHubPromptV185('F / ENTRÉE — TIRER · 2 MENACES'), 'F / ENTER — FIRE · 2 THREATS');
  setLanguageV185('fr', { storage: memoryStorage(), document: null });
  assert.equal(translateHubPromptV185('E — Extraire le renseignement synthétique · DAVID-8R'), 'E — Extraire le renseignement synthétique · DAVID-8R');
});

test('V185 automatic layer translates catalog text, upper-case variants and patterns only in English', async () => {
  const { autoTranslateV185, autoCatalogSizeV185 } = await import('../src/i18n-auto-v185.js');
  const { EN_CATALOG_V185, EN_PATTERNS_V185 } = await import('../src/i18n-en-catalog-v185.js');
  const size = autoCatalogSizeV185();
  assert.ok(size.exact > 0);
  const [french, english] = Object.entries(EN_CATALOG_V185).find(([fr]) => fr !== fr.toUpperCase() && fr.length > 8);
  setLanguageV185('fr', { storage: memoryStorage(), document: null });
  assert.equal(autoTranslateV185(french), french);
  setLanguageV185('en', { storage: memoryStorage(), document: null });
  assert.equal(autoTranslateV185(french), english);
  assert.equal(autoTranslateV185(`  ${french} `), `  ${english} `);
  assert.equal(autoTranslateV185(french.toUpperCase()), english.toUpperCase());
  assert.equal(autoTranslateV185('Texte totalement inconnu du catalogue'), 'Texte totalement inconnu du catalogue');
  assert.equal(autoTranslateV185(42), 42);
  for (const [fr, en] of Object.entries(EN_PATTERNS_V185)) {
    assert.deepEqual((fr.match(/\{\d+\}/g) || []).sort(), (en.match(/\{\d+\}/g) || []).sort(), fr);
  }
  const pattern = Object.keys(EN_PATTERNS_V185).find(fr => /^\S.*\{0\}/.test(fr) && !fr.includes('{1}'));
  if (pattern) {
    const sample = pattern.replace('{0}', '7');
    assert.equal(autoTranslateV185(sample), EN_PATTERNS_V185[pattern].replace('{0}', '7'));
  }
  setLanguageV185('fr', { storage: memoryStorage(), document: null });
});
