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
    'settings.import': 'IMPORTER UNE SAUVEGARDE',
    'creator.eyebrow': 'DOSSIER PERSONNEL · ECHO-9',
    'creator.heading': 'Votre relève commence ici.',
    'creator.profile': 'Profil {profile} : la partie précédente ne sera remplacée qu’à la validation. Annuler la conserve intégralement.',
    'creator.figureAlt': 'Présentation de la tenue Echo-9 existante',
    'creator.figure': 'Tenue Echo-9 · apparence de départ existante',
    'creator.identity': 'Identité du marine',
    'creator.name': 'Nom du marine',
    'creator.namePlaceholder': 'Prénom et nom',
    'creator.callsign': 'Indicatif radio',
    'creator.intro': 'Vous rejoignez les Marines coloniaux à bord du Tantalus. Votre nom et votre indicatif suivront cette campagne. Mara Vega reste votre commandante.',
    'creator.note': 'Dotation initiale : M41A, M4A3, détecteur de mouvements et kit médical. Ce dossier ne propose pas encore de variantes corporelles animées.',
    'creator.cancel': 'ANNULER',
    'creator.submit': 'VALIDER ET SORTIR DE CRYOSTASE',
    'creator.saveFailed': 'Sauvegarde impossible. Votre ancienne partie est conservée.',
    'creator.error.name': 'Le nom doit contenir 2 à 40 caractères : lettres, chiffres, espaces, apostrophes ou traits d’union, sans commande ni balisage.',
    'creator.error.reserved': 'Mara Vega est un PNJ de l’équipage. Choisissez une identité distincte pour le joueur.',
    'creator.error.callsign': 'L’indicatif doit contenir 2 à 16 lettres ASCII, chiffres ou traits d’union.',
    'title.recovery': 'Profil {profile} inaccessible. Sauvegarde préservée. Ouvrez Système pour récupérer les données ou choisir un autre profil.',
    'title.profileStatus': 'PROFIL {profile} · J{day} {hour}:{minute} · SAUVEGARDE LOCALE',
    'title.profileRecovery': 'PROFIL {profile} · RÉCUPÉRATION REQUISE',
    'title.live.back': 'Retour au menu principal. Système sélectionné.',
    'title.live.idle': 'Écran titre. Appuyez pour ouvrir le menu principal.',
    'title.live.menuOpen': 'Menu principal ouvert.',
    'title.live.menuClosed': 'Menu fermé. Appuyez pour commencer.',
    'title.live.confirm': 'Confirmez pour remplacer la partie du profil {profile}.',
    'title.live.changed': 'Le profil a changé. Confirmez à nouveau la nouvelle partie.',
    'title.live.failed': 'Nouvelle partie non créée : {reason}',
    'title.live.unavailable': 'sauvegarde indisponible',
    'title.live.cancelled': 'Nouvelle partie annulée. La sauvegarde est conservée.',
    'title.continue': 'CONTINUER',
    'title.enter': 'ENTRER SUR LE TANTALUS',
    'title.createCharacter': 'CRÉER MON PERSONNAGE',
    'title.resumeWelcome': 'REPRENDRE L’ACCUEIL',
    'title.resumeExercise': 'REPRENDRE L’EXERCICE',
    'title.joinQuay': 'REJOINDRE LE QUAI',
    'title.resumeQuay': 'REPRENDRE LE QUAI',
    'title.resumeOpening': 'REPRENDRE LA PRISE DE POSTE',
    'title.resumeOperation': 'REPRENDRE L’OPÉRATION',
    'title.summary.create': 'Créez le personnage de ce profil pour commencer à bord du Tantalus.',
    'title.summary.operation': 'Une opération est engagée. Retrouvez sa préparation ou son point sauvegardé depuis le déploiement.',
    'title.summary.route': 'Retrouvez votre déploiement dans les opérations.',
    'title.summary.ship': 'Reprenez votre partie à bord du Tantalus.'
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
    'settings.import': 'IMPORT A SAVE',
    'creator.eyebrow': 'PERSONNEL FILE · ECHO-9',
    'creator.heading': 'Your relief starts here.',
    'creator.profile': 'Profile {profile}: the previous game is only replaced once you confirm. Cancelling keeps it intact.',
    'creator.figureAlt': 'Existing Echo-9 outfit',
    'creator.figure': 'Echo-9 outfit · existing starting appearance',
    'creator.identity': 'Marine identity',
    'creator.name': 'Marine name',
    'creator.namePlaceholder': 'First and last name',
    'creator.callsign': 'Radio callsign',
    'creator.intro': 'You are joining the Colonial Marines aboard the Tantalus. Your name and callsign will follow this campaign. Mara Vega remains your commanding officer.',
    'creator.note': 'Starting kit: M41A, M4A3, motion tracker and medkit. This file does not offer animated body variants yet.',
    'creator.cancel': 'CANCEL',
    'creator.submit': 'CONFIRM AND LEAVE CRYOSLEEP',
    'creator.saveFailed': 'Save failed. Your previous game is kept.',
    'creator.error.name': 'The name must be 2 to 40 characters: letters, digits, spaces, apostrophes or hyphens, with no commands or markup.',
    'creator.error.reserved': 'Mara Vega is a crew NPC. Choose a distinct identity for the player.',
    'creator.error.callsign': 'The callsign must be 2 to 16 ASCII letters, digits or hyphens.',
    'title.recovery': 'Profile {profile} unreadable. Save preserved. Open System to recover the data or choose another profile.',
    'title.profileStatus': 'PROFILE {profile} · D{day} {hour}:{minute} · LOCAL SAVE',
    'title.profileRecovery': 'PROFILE {profile} · RECOVERY REQUIRED',
    'title.live.back': 'Back to the main menu. System selected.',
    'title.live.idle': 'Title screen. Press to open the main menu.',
    'title.live.menuOpen': 'Main menu open.',
    'title.live.menuClosed': 'Menu closed. Press to start.',
    'title.live.confirm': 'Confirm to replace the game in profile {profile}.',
    'title.live.changed': 'The profile changed. Confirm the new game again.',
    'title.live.failed': 'New game not created: {reason}',
    'title.live.unavailable': 'save unavailable',
    'title.live.cancelled': 'New game cancelled. The save is kept.',
    'title.continue': 'CONTINUE',
    'title.enter': 'BOARD THE TANTALUS',
    'title.createCharacter': 'CREATE MY CHARACTER',
    'title.resumeWelcome': 'RESUME THE WELCOME',
    'title.resumeExercise': 'RESUME THE EXERCISE',
    'title.joinQuay': 'JOIN THE QUAY',
    'title.resumeQuay': 'RESUME THE QUAY',
    'title.resumeOpening': 'RESUME TAKING POST',
    'title.resumeOperation': 'RESUME THE OPERATION',
    'title.summary.create': 'Create this profile\u2019s character to begin aboard the Tantalus.',
    'title.summary.operation': 'An operation is under way. Return to its preparation or its saved point from deployment.',
    'title.summary.route': 'Find your deployment in operations.',
    'title.summary.ship': 'Resume your game aboard the Tantalus.'
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

// Text produced in French by a module (validation messages, for example) is
// translated by matching its exact French dictionary entry; unknown text is kept.
export function tFromFrenchV185(text) {
  if (typeof text !== 'string') return text;
  const key = Object.keys(STRINGS_V185.fr).find(candidate => STRINGS_V185.fr[candidate] === text);
  return key ? tV185(key, text) : text;
}

export function applyStaticTranslationsV185(root = globalThis.document) {
  if (!root?.querySelectorAll) return 0;
  let count = 0;
  // data-i18n-attr="placeholder:key;alt:key" translates attributes.
  for (const element of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of String(element.dataset.i18nAttr).split(';')) {
      const [name, key] = pair.split(':').map(part => part?.trim());
      if (name && key && /^(?:placeholder|alt|title|aria-label)$/.test(name)) element.setAttribute(name, tV185(key, element.getAttribute(name) || ''));
    }
    count += 1;
  }
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
