// V185 (owner-approved, 2026-11-05): French and English for player-facing text.
// French stays the source language written in the markup and modules. English
// entries are looked up by key; a missing entry falls back to French, never to
// a raw key. The language is a per-device preference, kept out of the save so
// that no protected save bytes change.
const freeze = Object.freeze;

export const LANGUAGES_V185 = freeze(['fr', 'en']);
export const DEFAULT_LANGUAGE_V185 = 'fr';
export const LANGUAGE_STORAGE_KEY_V185 = 'atf-language-v185';
export const LANGUAGE_EVENT_V185 = 'atf-language-change-v185';

export const STRINGS_V185 = freeze({
  fr: freeze({
    'skip.content': 'Aller au contenu',
    'title.start': 'APPUYER POUR COMMENCER',
    'title.menu': 'Menu principal',
    'title.new': 'NOUVELLE PARTIE',
    'title.newConfirm': 'CONFIRMER LA NOUVELLE PARTIE',
    'title.forge': 'FRONTIER FORGE',
    'title.options': 'SYSTÈME',
    'nav.main': 'Navigation principale',
    'nav.command': 'Commandement',
    'nav.galaxy': 'Carte galactique',
    'nav.operations': 'Planification',
    'nav.archives': 'Archives',
    'nav.hub': 'USS Tantalus',
    'nav.armory': 'Armurerie',
    'nav.bestiary': 'Xénobiologie',
    'nav.xenotrials': 'Xeno Trials',
    'nav.vehicles': 'Véhicules',
    'nav.crew': 'Echo-9',
    'nav.settings': 'Système',
    'view.command': 'Centre de commandement',
    'view.galaxy': 'Carte galactique',
    'view.operations': 'Opérations',
    'view.archives': 'Archives de mission',
    'view.hub': 'USS Tantalus',
    'view.armory': 'Armurerie',
    'view.bestiary': 'Xénobiologie',
    'view.vehicles': 'Véhicules',
    'view.crew': 'Echo-9',
    'view.editor': 'Frontier Forge',
    'view.settings': 'Système',
    'view.bioforge': 'Niveau expérimental isolé',
    'view.xenotrials': 'Xeno Trials',
    'view.play': 'Opération en cours',
    'top.menu': 'MENU PRINCIPAL',
    'top.save': 'SAUVEGARDER',
    'settings.heading': 'Système',
    'settings.profiles': 'Profils',
    'settings.experience': 'Expérience',
    'settings.language': 'LANGUE',
    'settings.difficulty': 'DIFFICULTÉ',
    'settings.difficulty.story': 'Histoire',
    'settings.difficulty.standard': 'Standard',
    'settings.difficulty.nightmare': 'Cauchemar',
    'settings.quality': 'QUALITÉ',
    'settings.quality.low': 'Basse',
    'settings.quality.high': 'Haute',
    'settings.contrast': 'CONTRASTE',
    'settings.contrast.standard': 'Standard',
    'settings.contrast.high': 'Renforcé',
    'settings.aim': 'AIDE À LA VISÉE',
    'settings.aim.off': 'Désactivée',
    'settings.aim.standard': 'Standard',
    'settings.aim.high': 'Forte',
    'settings.shake': 'SECOUSSES CAMÉRA',
    'settings.coop': 'Coop locale',
    'settings.motion': 'Réduire les mouvements',
    'settings.subtitles': 'Sous-titres',
    'settings.effects': 'EFFETS AUDIO',
    'settings.music': 'MUSIQUE',
    'settings.data': 'Données',
    'settings.export': 'EXPORTER LA SAUVEGARDE',
    'settings.import': 'IMPORTER UNE SAUVEGARDE'
  }),
  en: freeze({
    'skip.content': 'Skip to content',
    'title.start': 'PRESS TO START',
    'title.menu': 'Main menu',
    'title.new': 'NEW GAME',
    'title.newConfirm': 'CONFIRM NEW GAME',
    'title.forge': 'FRONTIER FORGE',
    'title.options': 'SYSTEM',
    'nav.main': 'Main navigation',
    'nav.command': 'Command',
    'nav.galaxy': 'Galaxy map',
    'nav.operations': 'Planning',
    'nav.archives': 'Archives',
    'nav.hub': 'USS Tantalus',
    'nav.armory': 'Armory',
    'nav.bestiary': 'Xenobiology',
    'nav.xenotrials': 'Xeno Trials',
    'nav.vehicles': 'Vehicles',
    'nav.crew': 'Echo-9',
    'nav.settings': 'System',
    'view.command': 'Command center',
    'view.galaxy': 'Galaxy map',
    'view.operations': 'Operations',
    'view.archives': 'Mission archives',
    'view.hub': 'USS Tantalus',
    'view.armory': 'Armory',
    'view.bestiary': 'Xenobiology',
    'view.vehicles': 'Vehicles',
    'view.crew': 'Echo-9',
    'view.editor': 'Frontier Forge',
    'view.settings': 'System',
    'view.bioforge': 'Isolated experimental level',
    'view.xenotrials': 'Xeno Trials',
    'view.play': 'Operation in progress',
    'top.menu': 'MAIN MENU',
    'top.save': 'SAVE',
    'settings.heading': 'System',
    'settings.profiles': 'Profiles',
    'settings.experience': 'Experience',
    'settings.language': 'LANGUAGE',
    'settings.difficulty': 'DIFFICULTY',
    'settings.difficulty.story': 'Story',
    'settings.difficulty.standard': 'Standard',
    'settings.difficulty.nightmare': 'Nightmare',
    'settings.quality': 'QUALITY',
    'settings.quality.low': 'Low',
    'settings.quality.high': 'High',
    'settings.contrast': 'CONTRAST',
    'settings.contrast.standard': 'Standard',
    'settings.contrast.high': 'Enhanced',
    'settings.aim': 'AIM ASSIST',
    'settings.aim.off': 'Off',
    'settings.aim.standard': 'Standard',
    'settings.aim.high': 'Strong',
    'settings.shake': 'CAMERA SHAKE',
    'settings.coop': 'Local co-op',
    'settings.motion': 'Reduce motion',
    'settings.subtitles': 'Subtitles',
    'settings.effects': 'SOUND EFFECTS',
    'settings.music': 'MUSIC',
    'settings.data': 'Data',
    'settings.export': 'EXPORT SAVE',
    'settings.import': 'IMPORT A SAVE'
  })
});

export const normalizeLanguageV185 = value => LANGUAGES_V185.includes(value) ? value : DEFAULT_LANGUAGE_V185;

let current = DEFAULT_LANGUAGE_V185;

export function currentLanguageV185() { return current; }

// French is the fallback for every key; an unknown key returns the fallback text.
export function tV185(key, fallback = '', params = null) {
  const text = STRINGS_V185[current]?.[key] ?? STRINGS_V185.fr[key] ?? fallback ?? '';
  return params ? text.replace(/\{(\w+)\}/g, (all, name) => (name in params ? String(params[name]) : all)) : text;
}

export function readStoredLanguageV185(storage = globalThis.localStorage) {
  try { return normalizeLanguageV185(storage?.getItem(LANGUAGE_STORAGE_KEY_V185)); } catch { return DEFAULT_LANGUAGE_V185; }
}

function writeStoredLanguageV185(language, storage) {
  try { storage?.setItem(LANGUAGE_STORAGE_KEY_V185, language); return true; } catch { return false; }
}

// Replace the single non-empty text node owned directly by the element, so
// child markup (numbers in navigation, inputs inside labels) is preserved.
function setOwnText(element, text) {
  const own = [...element.childNodes].filter(node => node.nodeType === 3 && node.textContent.trim());
  if (!own.length) { if (!element.children.length) element.textContent = text; return; }
  const node = own[0];
  const lead = node.textContent.match(/^\s*/)[0];
  const trail = node.textContent.match(/\s*$/)[0];
  node.textContent = lead + text + trail;
}

export function applyStaticTranslationsV185(root = globalThis.document) {
  if (!root?.querySelectorAll) return 0;
  let count = 0;
  for (const element of root.querySelectorAll('[data-i18n]')) { setOwnText(element, tV185(element.dataset.i18n, '')); count += 1; }
  for (const element of root.querySelectorAll('[data-i18n-aria]')) { element.setAttribute('aria-label', tV185(element.dataset.i18nAria, element.getAttribute('aria-label') || '')); count += 1; }
  return count;
}

export function setLanguageV185(language, { storage = globalThis.localStorage, document = globalThis.document, persist = true } = {}) {
  current = normalizeLanguageV185(language);
  if (persist) writeStoredLanguageV185(current, storage);
  if (document?.documentElement) document.documentElement.lang = current;
  applyStaticTranslationsV185(document);
  try { document?.dispatchEvent?.(new CustomEvent(LANGUAGE_EVENT_V185, { detail: { language: current } })); } catch { /* No event support outside the browser. */ }
  return current;
}

export function initLanguageV185(options = {}) {
  return setLanguageV185(readStoredLanguageV185(options.storage ?? globalThis.localStorage), { ...options, persist: false });
}
