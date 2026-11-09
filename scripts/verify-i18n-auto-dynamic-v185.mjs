import test from 'node:test';
import assert from 'node:assert/strict';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { installAutoTranslationV185, loadCatalogV185 } from '../src/i18n-auto-v185.js';

// DOM and queued MutationObserver doubles: these tests exercise the installed
// layer and language events, not browser layout or a complete game journey.
function documentFixture() {
  const records = [];
  let callback;
  const listeners = new Map();
  class TextNode {
    nodeType = 3;
    constructor(value) { this.value = value; }
    get nodeValue() { return this.value; }
    set nodeValue(value) { this.value = value; records.push({ type: 'characterData', target: this }); }
    get textContent() { return this.nodeValue; }
    set textContent(value) { this.nodeValue = value; }
  }
  class Element {
    nodeType = 1;
    childNodes = [];
    dataset = {};
    attrs = new Map();
    constructor(tagName = 'DIV') { this.tagName = tagName; }
    get children() { return this.childNodes.filter(node => node.nodeType === 1); }
    append(...nodes) { for (const node of nodes) { node.parentElement = this; this.childNodes.push(node); } }
    getAttribute(name) { return this.attrs.get(name) ?? null; }
    hasAttribute(name) { return this.attrs.has(name); }
    setAttribute(name, value) { this.attrs.set(name, value); records.push({ type: 'attributes', attributeName: name, target: this }); }
    removeAttribute(name) { this.attrs.delete(name); records.push({ type: 'attributes', attributeName: name, target: this }); }
  }
  const descendants = root => root.childNodes.flatMap(node => [node, ...(node.childNodes ? descendants(node) : [])]);
  const documentRef = {
    body: new Element('BODY'), documentElement: { lang: 'fr' },
    createTreeWalker(root) {
      const nodes = descendants(root);
      let index = 0;
      return { nextNode: () => nodes[index++] ?? null };
    },
    querySelectorAll(selector) {
      const datasetKey = { '[data-i18n]': 'i18n', '[data-i18n-attr]': 'i18nAttr', '[data-i18n-aria]': 'i18nAria' }[selector];
      return descendants(this.body).filter(node => datasetKey && node.dataset?.[datasetKey]);
    },
    addEventListener(name, listener) { listeners.set(name, listener); },
    dispatchEvent(event) { listeners.get(event.type)?.(event); }
  };
  const globalRef = { MutationObserver: class {
    constructor(listener) { callback = listener; }
    observe() { records.length = 0; }
  } };
  const flush = () => {
    let turns = 0;
    while (records.length) {
      assert.ok(++turns < 10, 'translation mutations settle');
      callback(records.splice(0));
    }
  };
  const language = value => setLanguageV185(value, { document: documentRef, persist: false });
  const install = async () => {
    language('en');
    assert.equal(installAutoTranslationV185({ documentRef, globalRef }), true);
    await loadCatalogV185();
    await Promise.resolve();
    flush();
  };
  const text = value => new TextNode(value);
  const element = () => new Element();
  return { documentRef, flush, language, install, text, element };
}

test('V185 dynamic layer restores the latest translated French text and attribute', async () => {
  const f = documentFixture();
  const node = f.text('  ACCÈS BIOFORGE ');
  const element = f.element();
  element.append(node);
  element.setAttribute('title', 'ACCÈS BIOFORGE');
  f.documentRef.body.append(element);
  await f.install();
  assert.equal(node.nodeValue, '  BIOFORGE ACCESS ');
  assert.equal(element.getAttribute('title'), 'BIOFORGE ACCESS');
  node.nodeValue = 'ACQUIS';
  element.setAttribute('title', 'ACQUIS');
  f.flush();
  assert.equal(node.nodeValue, 'OWNED');
  assert.equal(element.getAttribute('title'), 'OWNED');
  f.language('fr');
  f.flush();
  assert.equal(node.nodeValue, 'ACQUIS');
  assert.equal(element.getAttribute('title'), 'ACQUIS');
});

test('V185 unknown content written while English is active survives returning to French', async () => {
  const f = documentFixture();
  const node = f.text('ACCÈS BIOFORGE');
  const element = f.element();
  element.append(node);
  element.setAttribute('title', 'ACCÈS BIOFORGE');
  f.documentRef.body.append(element);
  await f.install();
  node.nodeValue = 'Signal inédit Z9';
  element.setAttribute('title', 'Signal inédit Z9');
  f.flush();
  f.language('fr');
  f.flush();
  assert.equal(node.nodeValue, 'Signal inédit Z9');
  assert.equal(element.getAttribute('title'), 'Signal inédit Z9');
});

test('V185 an explicit dictionary update owns its text after the language switch', async () => {
  const f = documentFixture();
  const node = f.text('ACCÈS BIOFORGE');
  const element = f.element();
  element.append(node);
  f.documentRef.body.append(element);
  await f.install();
  element.dataset.i18n = 'title.start';
  f.language('en');
  await Promise.resolve();
  f.flush();
  assert.equal(node.nodeValue, 'PRESS TO START');
  f.language('fr');
  f.flush();
  assert.equal(node.nodeValue, 'APPUYER POUR COMMENCER');
});

test('V185 empty text and removed or empty attributes do not revive old messages', async () => {
  const f = documentFixture();
  const node = f.text('ACCÈS BIOFORGE');
  const element = f.element();
  element.append(node);
  element.setAttribute('title', 'ACCÈS BIOFORGE');
  element.setAttribute('aria-label', 'ACQUIS');
  f.documentRef.body.append(element);
  await f.install();
  node.nodeValue = '';
  element.removeAttribute('title');
  element.setAttribute('aria-label', '');
  f.flush();
  f.language('fr');
  f.flush();
  assert.equal(node.nodeValue, '');
  assert.equal(element.getAttribute('title'), null);
  assert.equal(element.getAttribute('aria-label'), '');
});

test('V185 a fresh write is preserved when the language changes before observer delivery', async () => {
  const f = documentFixture();
  const node = f.text('ACCÈS BIOFORGE');
  const element = f.element();
  element.append(node);
  element.setAttribute('title', 'ACCÈS BIOFORGE');
  f.documentRef.body.append(element);
  await f.install();
  node.nodeValue = 'ACQUIS';
  element.setAttribute('title', 'ACQUIS');
  f.language('fr');
  f.flush();
  assert.equal(node.nodeValue, 'ACQUIS');
  assert.equal(element.getAttribute('title'), 'ACQUIS');
});

test('V185 language round trips restore translated attributes on the body as well', async () => {
  const f = documentFixture();
  f.documentRef.body.setAttribute('title', 'ACCÈS BIOFORGE');
  await f.install();
  assert.equal(f.documentRef.body.getAttribute('title'), 'BIOFORGE ACCESS');
  f.language('fr');
  f.flush();
  assert.equal(f.documentRef.body.getAttribute('title'), 'ACCÈS BIOFORGE');
});
