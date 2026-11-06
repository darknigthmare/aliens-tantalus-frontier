// V185 automatic translation layer (owner request, 2026-11-06: "tout d'un coup").
// The game keeps writing French. When English is chosen, this layer replaces
// known French text where the player sees it: DOM text nodes, a few attributes
// and Canvas 2D text. Unknown text is left in French. Nothing here touches the
// save, game rules or identifiers; it only changes what is displayed.
import { currentLanguageV185, LANGUAGE_EVENT_V185 } from './i18n-v185.js';

const ATTRIBUTES = Object.freeze(['placeholder', 'aria-label', 'title', 'alt']);
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT']);
const CACHE_LIMIT = 4000;

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
  return fromPatterns(text);
}

// Messages are often joined: "ERREUR · A. B." Translate each known piece,
// split on " · " and between sentences; unknown pieces stay French.
function translateCore(text, depth = 0) {
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

// French originals of translated nodes, so switching back restores them.
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
  if (!value || !value.trim() || skipped(node)) return;
  const translated = autoTranslateV185(value);
  if (translated !== value) { originalText.set(node, value); node.nodeValue = translated; }
}

function translateAttributes(element) {
  if (skipped(element)) return;
  for (const name of ATTRIBUTES) {
    const value = element.getAttribute?.(name);
    if (!value) continue;
    const translated = autoTranslateV185(value);
    if (translated === value) continue;
    const saved = originalAttributes.get(element) || {};
    saved[name] = value;
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
  const walker = documentRef.createTreeWalker(root, 5);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === 3) {
      const french = originalText.get(node);
      if (french !== undefined) { node.nodeValue = french; originalText.delete(node); }
    } else {
      const saved = originalAttributes.get(node);
      if (saved) { for (const [name, value] of Object.entries(saved)) node.setAttribute(name, value); originalAttributes.delete(node); }
    }
  }
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
