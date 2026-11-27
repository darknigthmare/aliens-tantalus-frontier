// V185 automatic translation layer (owner request, 2026-11-06: "tout d'un coup").
// The game keeps writing French. When English is chosen, this layer replaces
// known French text where the player sees it: DOM text nodes, a few attributes
// and Canvas 2D text. Unknown text is left in French. Nothing here touches the
// save, game rules or identifiers; it only changes what is displayed.
import { currentLanguageV185, LANGUAGE_EVENT_V185 } from './i18n-v185.js';
import { XENO_TRIALS_ORIGINAL_ARENAS_V193 } from './xeno-trials-original-arenas-v193.js';
import { XENO_TRIALS_REFERENCED_STAGES_V196 } from './xeno-trials-referenced-stages-v196.js';
import { XENO_TRIALS_PRIORITY_STAGES_V198 } from './xeno-trials-priority-stages-v198.js';
import { XENO_TRIALS_ICONIC_STAGES_V194 } from './xeno-trials-iconic-stages-v194.js';

const ATTRIBUTES = Object.freeze(['placeholder', 'aria-label', 'title', 'alt']);
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT']);
const CACHE_LIMIT = 4000;
const arenaLabels = new Map([
  ...XENO_TRIALS_ORIGINAL_ARENAS_V193,
  ...XENO_TRIALS_ICONIC_STAGES_V194,
  ...XENO_TRIALS_REFERENCED_STAGES_V196,
  ...XENO_TRIALS_PRIORITY_STAGES_V198
].flatMap(({ label, labelEn }) => [
  [label, labelEn],
  [label.toUpperCase(), labelEn.toUpperCase()]
]));
const trialLabels = new Map([
  ['V · PARADE', 'V · PARRY'],
  ['Parer au dernier moment', 'Parry just before contact'],
  ['Deuxième signature', 'Second signature'],
  ['Troisième signature', 'Third signature'],
  ['PARADE', 'PARRY'],
  ['OUVERTURE', 'OPENING'],
  ['RIPOSTE · GARDE + SUPER', 'COUNTER · GUARD + SUPER'],
  ['La commande de saut déclenche un franchissement au sol.', 'The jump button performs a grounded dash.'],
  ['FRANCHIR', 'DASH'],
  ['Franchir au sol', 'Dash on the ground'],
  ['V pour parer au contact · C + V contre une frappe basse · Après une parade, Garde + Super pour riposter avec un spécimen compatible et la jauge pleine.', 'V to parry on contact · C + V against a low strike · After a parry, press Guard + Super with a compatible fighter and a full meter to counter.'],
  ['H / O pour les signatures disponibles · Manette · Stick droit vers le bas pour parer, gauche / droite pour les signatures.', 'H / O for available signatures · Controller · Right stick down to parry, left / right for signatures.'],
  ['C · BAS', 'C · CROUCH'],
  ['MAJ · ESQUIVE', 'SHIFT · EVADE'],
  ['U · ANTI-AIR', 'U · ANTI-AIR'],
  ['S’accroupir', 'Crouch'],
  ['Esquiver', 'Evade'],
  ['Frappe anti-aérienne', 'Anti-air strike'],
  ['C maintenu pour s’accroupir · C + J pour frapper bas · Maj + direction pour esquiver · J en esquive avant pour avancer en frappant · U pour contrer un saut.', 'Hold C to crouch · C + J to strike low · Shift + direction to evade · J during a forward evade to strike on approach · U to counter a jump.'],
  ['Manette · Stick gauche vers le bas pour s’accroupir · R3 pour esquiver · Stick droit vers le haut pour contrer un saut.', 'Controller · Left stick down to crouch · R3 to evade · Right stick up to counter a jump.'],
  ['Super dessiné', 'Drawn super'],
  ['ATELIERS DE SIMULATION', 'PRACTICE DRILLS'],
  ['Égalité au gong', 'Draw at the bell'],
  ['Le contact reproduit vos gestes en miroir. Engagez une frappe simultanée au contact ou attendez le gong à santé égale.', 'The target mirrors your controls. Trade a simultaneous strike at close range or wait for the bell with equal health.'],
  ['Obtenir une manche nulle', 'Draw a round'],
  ['Terminer sur une égalité confirmée', 'Finish the match in a draw'],
  ['Reprendre après une manche', 'Return for the next round'],
  ['Remportez la manche d’ouverture. Laissez ensuite la cible prendre sa revanche, puis retrouvez vos appuis en troisième manche.', 'Win the opening round, then let the target take the second round. Return to your feet for round three.'],
  ['Remporter la première manche', 'Win round one'],
  ['Perdre la deuxième manche', 'Lose round two'],
  ['Reprendre le combat en troisième manche', 'Resume the fight in round three'],
  ['Interrompre l’armement', 'Interrupt the windup'],
  ['Le Warrior arme sa percussion de queue. Restez à portée et placez une frappe légère pendant l’anticipation.', 'The Warrior winds up a tail strike. Stay in range and land a light attack during the windup.'],
  ['Observer l’armement de la percussion', 'Watch for the tail windup'],
  ['Interrompre la frappe avant le contact', 'Interrupt the strike before it connects'],
  ['PERCUSSION EN COURS', 'TAIL STRIKE IN PROGRESS'],
  ['Parade de précision', 'Timed parry'],
  ['Laissez le contact avancer. Déclenchez Parade juste avant sa frappe lourde, puis ripostez pendant son ouverture.', 'Let the target approach. Parry just before the heavy strike lands, then punish during the opening.'],
  ['Dévier une frappe lourde', 'Parry a heavy strike'],
  ['Toucher pendant l’ouverture', 'Land a strike during the opening'],
  ['Super de riposte', 'Super riposte'],
  ['Le Warden est prêté avec sa jauge pleine. Parez la frappe lourde, puis maintenez Garde et déclenchez Super pendant l’ouverture.', 'The Warden starts with full meter. Parry the heavy strike, then hold Guard and use Super during the opening.'],
  ['Créer une ouverture par une parade', 'Open the opponent up with a parry'],
  ['Dépenser la jauge en riposte', 'Spend the Super meter on a riposte'],
  ['Toucher avec le Heurt de contention', 'Land the Containment Clash'],
  ['Banc libre', 'Free practice'],
  ['BANC LIBRE', 'FREE PRACTICE'],
  ['Banc libre en cours.', 'Free practice in progress.'],
  ['Banc libre terminé.', 'Free practice complete.'],
  ['Choisissez vos spécimens, l’arène et le comportement de la cible. Tous les spécimens sont prêtés pour la séance.', 'Choose both specimens, the arena and the target’s behavior. All specimens are available on loan for practice.'],
  ['Essayez vos techniques dans les conditions sélectionnées.', 'Practice your techniques under the selected conditions.'],
  ['Votre spécimen', 'Your specimen'],
  ['Spécimen adverse', 'Opponent specimen'],
  ['Comportement adverse', 'Opponent behavior'],
  ['Difficulté de l’IA', 'AI difficulty'],
  ['Secondes par manche', 'Seconds per round'],
  ['Manches gagnantes', 'Rounds to win'],
  ['Intelligence native', 'Native AI'],
  ['Cible immobile', 'Stationary target'],
  ['Garde haute', 'Standing guard'],
  ['Sauts répétés', 'Repeat jumps'],
  ['Miroir de vos commandes', 'Mirror your controls'],
  ['Super chargé au départ', 'Start with a full Super meter'],
  ['Désactiver les attaques spéciales', 'Disable special attacks'],
  ['LANCER LE BANC LIBRE', 'START FREE PRACTICE'],
  ['RECOMMENCER L’ATELIER', 'RESTART PRACTICE'],
  ['Réglages du banc libre non sauvegardés.', 'Free practice settings could not be saved.'],
  ['Entraînez-vous aux contacts, à la garde et aux techniques spéciales sur les bancs d’essai MIRE.', 'Practice strikes, defense and special techniques in the MIRE test arena.'],
  ['Atelier de simulation', 'Practice drill'],
  ['Objectifs de l’atelier', 'Drill objectives'],
  ['ATELIERS VALIDÉS', 'DRILLS PASSED'],
  ['SIMULATION SANS PRIME', 'UNRANKED PRACTICE'],
  ['LANCER L’ATELIER', 'START DRILL'],
  ['ATELIER', 'PRACTICE'],
  ['ATELIER VALIDÉ', 'DRILL PASSED'],
  ['EXERCICE INTERROMPU', 'DRILL INTERRUPTED'],
  ['RETOUR AUX ATELIERS', 'BACK TO DRILLS'],
  ['SAUVEGARDE À RÉESSAYER', 'RETRY SAVE'],
  ['RÉESSAYER LA SAUVEGARDE', 'RETRY SAVE'],
  ['Liaison visuelle interrompue. Relancez l’atelier.', 'Visual link interrupted. Restart the drill.'],
  ['Atelier indisponible.', 'Drill unavailable.'],
  ['Suivez l’objectif de l’atelier. La pause suspend la simulation.', 'Follow the drill objective. Pausing freezes the simulation.'],
  ['Calibrage de la portée', 'Strike range'],
  ['Frappez d’abord depuis la ligne de départ. Rapprochez-vous ensuite de la cible immobile.', 'Throw a strike from the starting line. Then approach the stationary target.'],
  ['Faire manquer une attaque légère', 'Miss with a light attack'],
  ['Toucher avec une attaque légère', 'Land a light attack'],
  ['Tenir la garde', 'Hold your guard'],
  ['Attendez que le contact s’approche. Maintenez Garde pendant ses frappes.', 'Wait for the target to approach. Hold Guard through its attacks.'],
  ['Bloquer une frappe', 'Block a strike'],
  ['Bloquer une seconde frappe', 'Block a second strike'],
  ['Esquive verticale', 'Jump evasion'],
  ['Laissez le contact approcher. Sautez quand il arme sa frappe lourde.', 'Let the target approach. Jump as it winds up its heavy attack.'],
  ['Faire manquer une frappe lourde en sautant', 'Jump over a heavy attack'],
  ['FRAPPE LOURDE EN COURS', 'HEAVY ATTACK IN PROGRESS'],
  ['Rupture de garde', 'Guard break'],
  ['Le contact tient sa garde avec une réserve réduite. Approchez et enchaînez deux frappes lourdes.', 'The target is guarding with low stamina. Close the gap and land two heavy attacks.'],
  ['Provoquer une rupture de garde', 'Break the target’s guard'],
  ['Sortie de saisie', 'Grapple escape'],
  ['Attendez la prise du Prowler. Dès la capture, maintenez Garde jusqu’à la libération.', 'Wait for the Prowler to grab you. Hold Guard after it grabs you to break free.'],
  ['Subir la saisie', 'Get caught in a grapple'],
  ['Sortir en maintenant Garde', 'Hold Guard to escape'],
  ['Attaque basse', 'Low strike'],
  ['Rapprochez-vous, maintenez Accroupir et déclenchez une frappe légère face au contact en garde.', 'Approach the guarding target, then hold Crouch and use a light attack.'],
  ['Toucher sous la garde haute', 'Strike below a standing guard'],
  ['Interception aérienne', 'Anti-air interception'],
  ['Laissez le contact s’approcher. Déclenchez Anti-air lorsqu’il saute près de vous.', 'Let the target approach. Use Anti-air when it jumps near you.'],
  ['Intercepter un contact en l’air', 'Intercept an airborne target'],
  ['CONTACT EN L’AIR', 'AIRBORNE TARGET'],
  ['Attaque en avançant', 'Advancing strike'],
  ['Approchez de la cible. Orientez Esquive vers elle, puis déclenchez une frappe légère avant la fin du déplacement.', 'Approach the target. Evade toward it, then use a light attack before the movement ends.'],
  ['Engager une esquive vers l’avant', 'Start a forward evade'],
  ['Toucher en sortie d’esquive', 'Land a strike during the evade'],
  ['Barrage de contrôle', 'Control barrage'],
  ['Le Warden est prêté avec sa jauge pleine. Restez au sol, alignez la cible et déclenchez le super.', 'The Warden is loaned to you with a full meter. Stay grounded, line up the target, and use your Super.'],
  ['Dépenser la jauge du super', 'Spend the Super meter'],
  ['Toucher avec une salve', 'Land a volley'],
  ['F · VERROU FINAL', 'F · FINAL RESTRAINT'],
  ['Verrou final en cours.', 'Final restraint in progress.'],
  ['Victoire confirmée. Verrou final disponible avec F.', 'Victory confirmed. Press F for the final restraint.'],
  ['F · APPUI DE CONTRÔLE', 'F · BOOT RESTRAINT'],
  ['Appui de contrôle en cours.', 'Boot restraint in progress.'],
  ['Victoire confirmée. Appui de contrôle disponible avec F.', 'Victory confirmed. Press F for the boot restraint.'],
  ['F · ISOLER LE CIRCUIT', 'F · ISOLATE THE CIRCUIT'],
  ['Isolation du circuit en cours.', 'Circuit isolation in progress.'],
  ['Victoire confirmée. Isolation du circuit disponible avec F.', 'Victory confirmed. Press F to isolate the circuit.'],
  ['Frappes aériennes dessinées', 'Drawn aerial attacks'],
  ['Spéciale dessinée', 'Drawn special'],
  ['REPRENDRE LE DUEL CONSERVÉ', 'RESUME SAVED DUEL'],
  ['RECOMMENCER DEPUIS LA PREMIÈRE MANCHE', 'RESTART FROM ROUND ONE'],
  ['REPRISE CONSERVÉE · ÉTAT DU DUEL ENREGISTRÉ', 'CHECKPOINT SAVED · DUEL STATE RECORDED'],
  ['Duel restauré. Reprenez avec P, Start ou le bouton Reprendre.', 'Duel restored. Resume with P, Start or the Resume button.'],
  ['Duel sauvegardé. Retrouvez la manche, la santé et le chrono enregistrés.', 'Duel saved. Resume with your saved round, health and timer.'],
  ['FENÊTRE VERTE', 'GREEN WINDOW'],
  ['FENÊTRE FERMÉE', 'WINDOW CLOSED'],
  ['PRESSION DU CONFINEMENT', 'CONTAINMENT PRESSURE'],
  ['SORTIE DE ZONE', 'CLEAR THE HAZARD']
]);

// The English catalog (~600 kB) is loaded only when English is chosen, so a
// French session downloads and parses nothing more.
const exact = new Map();
const upper = new Map();
const english = new Set();
let compiled = [];
let loading = null;
const cache = new Map();

// Patterns: French templates with {0}, {1}… holes. Holes are translated again
// when they are themselves known French text (room names, labels).
const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const compilePatterns = patterns => Object.entries(patterns).map(([fr, en]) => {
  const parts = fr.split(/\{(\d+)\}/);
  let source = '^';
  const order = [];
  parts.forEach((part, index) => {
    if (index % 2) { source += '(.+?)'; order.push(Number(part)); } else source += escapeRegex(part);
  });
  return { regex: new RegExp(source + '$', 'su'), order, en, upperRegex: new RegExp(source.toUpperCase() + '$', 'su') };
}).sort((a, b) => b.regex.source.length - a.regex.source.length);

/** Fill the lookup tables from a catalog module (exported for tests). */
export function useCatalogV185({ EN_CATALOG_V185: catalog = {}, EN_PATTERNS_V185: patterns = {} } = {}) {
  exact.clear(); upper.clear(); english.clear(); cache.clear();
  for (const [fr, en] of Object.entries(catalog)) {
    exact.set(fr, en); english.add(en);
    if (fr !== fr.toUpperCase()) { upper.set(fr.toUpperCase(), en.toUpperCase()); english.add(en.toUpperCase()); }
  }
  compiled = compilePatterns(patterns);
  return autoCatalogSizeV185();
}

/** Load the English catalog once; resolves when the tables are ready. */
export function loadCatalogV185() {
  loading ??= import('./i18n-en-catalog-v185.js').then(useCatalogV185).catch(error => { loading = null; throw error; });
  return loading;
}


function fromPatterns(text) {
  for (const pattern of compiled) {
    for (const [regex, toUpper] of [[pattern.regex, false], [pattern.upperRegex, true]]) {
      const match = regex.exec(text);
      if (!match) continue;
      const values = [];
      pattern.order.forEach((slot, index) => { values[slot] = translateCore(match[index + 1], 2); });
      const result = pattern.en.replace(/\{(\d+)\}/g, (all, slot) => values[Number(slot)] ?? all);
      return toUpper ? result.toUpperCase() : result;
    }
  }
  return null;
}

function translateWhole(text) {
  if (exact.has(text)) return exact.get(text);
  if (upper.has(text)) return upper.get(text);
  return arenaLabels.get(text) ?? trialLabels.get(text) ?? fromPatterns(text);
}

// Messages are often joined: "ERREUR · A. B." Translate each known piece,
// split on " · " and between sentences; unknown pieces stay French.
function translateCore(text, depth = 0) {
  // Generic contact patterns would absorb the beacon's window label into an
  // untranslated placeholder. Keep its independent telemetry fields separate.
  if (depth < 2 && /(?:^| · )FENÊTRE (?:VERTE|FERMÉE) · /u.test(text)) {
    return text.split(' · ').map(piece => translateCore(piece, depth + 1)).join(' · ');
  }
  const whole = translateWhole(text);
  if (whole != null) return whole;
  if (depth > 1) return text;
  for (const separator of [' · ', /(?<=[.!?…])\s+(?=[A-ZÀ-Ý«])/u]) {
    const pieces = text.split(separator);
    if (pieces.length < 2) continue;
    const translated = pieces.map(piece => translateCore(piece, depth + 1));
    if (translated.some((piece, index) => piece !== pieces[index])) return translated.join(typeof separator === 'string' ? separator : ' ');
  }
  return text;
}

/** Translate one French string to English when it is known; otherwise return it unchanged. */
export function autoTranslateV185(text) {
  if (typeof text !== 'string' || currentLanguageV185() !== 'en') return text;
  const trimmed = text.trim();
  if (trimmed.length < 2 || english.has(trimmed)) return text;
  let result = cache.get(trimmed);
  if (result === undefined) {
    result = translateCore(trimmed);
    if (cache.size >= CACHE_LIMIT) cache.clear();
    cache.set(trimmed, result);
  }
  if (result === trimmed) return text;
  const lead = text.match(/^\s*/)[0];
  const trail = text.match(/\s*$/)[0];
  return lead + result + trail;
}

export function autoCatalogSizeV185() { return { exact: exact.size, patterns: compiled.length }; }

// Keep both sides of each change. The game can reuse a node for another message
// while English is active; only restore text still owned by this layer.
const originalText = new WeakMap();
const originalAttributes = new WeakMap();

function skipped(node) {
  for (let element = node.nodeType === 1 ? node : node.parentElement; element; element = element.parentElement) {
    if (SKIP_TAGS.has(element.tagName) || element.isContentEditable || element.hasAttribute?.('data-i18n-skip')) return true;
  }
  return false;
}

function translateTextNode(node) {
  const value = node.nodeValue;
  if (originalText.get(node)?.translated === value) return;
  originalText.delete(node);
  if (!value || !value.trim() || skipped(node)) return;
  const translated = autoTranslateV185(value);
  if (translated !== value) { originalText.set(node, { french: value, translated }); node.nodeValue = translated; }
}

function translateAttributes(element) {
  if (skipped(element)) return;
  for (const name of ATTRIBUTES) {
    const value = element.getAttribute?.(name);
    const saved = originalAttributes.get(element) || {};
    if (saved[name]?.translated === value) continue;
    delete saved[name];
    if (!value) continue;
    const translated = autoTranslateV185(value);
    if (translated === value) continue;
    saved[name] = { french: value, translated };
    originalAttributes.set(element, saved);
    element.setAttribute(name, translated);
  }
}

function walk(root, documentRef) {
  if (!root) return;
  if (root.nodeType === 3) { translateTextNode(root); return; }
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1) translateAttributes(root);
  const walker = documentRef.createTreeWalker(root, 5 /* SHOW_ELEMENT | SHOW_TEXT */);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === 3) translateTextNode(node); else translateAttributes(node);
  }
}

function restore(root, documentRef) {
  const restoreNode = node => {
    if (node.nodeType === 3) {
      const saved = originalText.get(node);
      if (saved?.translated === node.nodeValue) node.nodeValue = saved.french;
      originalText.delete(node);
    } else {
      const saved = originalAttributes.get(node);
      if (saved) {
        for (const [name, { french, translated }] of Object.entries(saved)) {
          if (node.getAttribute(name) === translated) node.setAttribute(name, french);
        }
        originalAttributes.delete(node);
      }
    }
  };
  restoreNode(root);
  const walker = documentRef.createTreeWalker(root, 5);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) restoreNode(node);
}

function patchCanvas(globalRef) {
  const prototype = globalRef.CanvasRenderingContext2D?.prototype;
  if (!prototype || prototype.__atfI18nV185) return;
  for (const name of ['fillText', 'strokeText', 'measureText']) {
    const original = prototype[name];
    if (typeof original !== 'function') continue;
    prototype[name] = function translatedCanvasText(text, ...rest) { return original.call(this, autoTranslateV185(text), ...rest); };
  }
  Object.defineProperty(prototype, '__atfI18nV185', { value: true });
}

/** Install the layer once in the browser: canvas text, initial DOM and later changes. */
export function installAutoTranslationV185({ documentRef = globalThis.document, globalRef = globalThis } = {}) {
  if (!documentRef?.body || !globalRef.MutationObserver) return false;
  patchCanvas(globalRef);
  let applying = false;
  const run = () => {
    if (applying) return;
    applying = true;
    try { if (currentLanguageV185() === 'en') walk(documentRef.body, documentRef); else restore(documentRef.body, documentRef); }
    finally { applying = false; }
  };
  const apply = () => {
    if (currentLanguageV185() !== 'en') { run(); return; }
    loadCatalogV185().then(run).catch(() => { /* Offline without the catalog: the game stays in French. */ });
  };
  const observer = new globalRef.MutationObserver(records => {
    if (applying || currentLanguageV185() !== 'en') return;
    applying = true;
    try {
      for (const record of records) {
        if (record.type === 'characterData') translateTextNode(record.target);
        else if (record.type === 'attributes') translateAttributes(record.target);
        else for (const node of record.addedNodes) walk(node, documentRef);
      }
    } finally { applying = false; }
  });
  observer.observe(documentRef.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });
  documentRef.addEventListener(LANGUAGE_EVENT_V185, apply);
  apply();
  return true;
}
