import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { TitleScreenController } from '../src/title-screen-v61.js';

// Preserve the archived DLC package's CommonJS configuration. The browser loads
// the added wrapper as a module; run these exact source bytes in the same mode.
const shellSource = await readFile(new URL('../dlc/fleuve-de-la-douleur/integration.js', import.meta.url), 'utf8');
const { mountRiverOfPainShell } = await import('data:text/javascript;base64,' + Buffer.from(shellSource).toString('base64'));

// DOM doubles exercise the real title controller and wrapper listeners. They
// are not screenshots or a browser playthrough of either simulation.
class Surface extends EventTarget {
  constructor(id, documentRef) {
    super();
    this.id = id;
    this.ownerDocument = documentRef;
    this.hidden = false;
    this.disabled = false;
    this.dataset = {};
    this.textContent = '';
    this.attributes = new Map();
  }
  focus() { this.ownerDocument.activeElement = this; }
  scrollIntoView() {}
  setAttribute(name, value) { this.attributes.set(name, value); }
  click() {
    const event = new Event('click');
    Object.defineProperty(event, 'detail', { value: 1 });
    this.dispatchEvent(event);
  }
}

function documentDouble() {
  const documentRef = new EventTarget();
  documentRef.hidden = false;
  documentRef.hasFocus = () => true;
  documentRef.documentElement = { classList: { add() {}, remove() {} } };
  documentRef.activeElement = null;
  documentRef.elements = new Map();
  documentRef.getElementById = id => documentRef.elements.get(id) || null;
  documentRef.querySelector = selector => selector.startsWith('#') ? documentRef.getElementById(selector.slice(1)) : null;
  documentRef.add = id => {
    const surface = new Surface(id, documentRef);
    documentRef.elements.set(id, surface);
    return surface;
  };
  return documentRef;
}

function key(code) {
  const event = new Event('keydown', { cancelable: true });
  Object.defineProperty(event, 'code', { value: code });
  return event;
}

function titleFixture({ includeDlc = true, callback = true } = {}) {
  const documentRef = documentDouble();
  for (const id of ['title-start', 'title-menu', 'title-continue', 'title-new', 'title-forge', 'title-options',
    'title-profile-status', 'title-live-status', 'title-recovery-warning', 'title-resume-context-v89']) documentRef.add(id);
  if (includeDlc) documentRef.add('title-river-of-pain');
  const root = documentRef.add('title-screen');
  root.querySelector = documentRef.querySelector;
  const app = documentRef.add('app');
  const events = new EventTarget();
  const bindings = {
    document: documentRef,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {}
  };
  const descriptors = Object.fromEntries(Object.keys(bindings).map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const [name, value] of Object.entries(bindings)) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  const save = Object.freeze({ profile: 3, createdAt: 12345, scene: 'mission', strategy: Object.freeze({ currentOperation: 'unchanged-operation' }) });
  const calls = { dlc: 0, newTimeline: 0, continue: 0, forge: 0 };
  const controller = new TitleScreenController({ root, app, getSave: () => save,
    onDlc: callback ? () => { calls.dlc++; } : undefined,
    onNewTimeline: () => { calls.newTimeline++; },
    onContinue: () => { calls.continue++; }, onForge: () => { calls.forge++; } });
  return { controller, calls, documentRef, root, save,
    dispose() {
      controller.dispose();
      for (const [name, descriptor] of Object.entries(descriptors)) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
      }
    }
  };
}

test('DLC click invokes its own action while preserving the campaign and title', () => {
  const f = titleFixture();
  try {
    const before = JSON.stringify(f.save);
    f.controller.openMenu();
    f.documentRef.getElementById('title-river-of-pain').click();
    assert.deepEqual(f.calls, { dlc: 1, newTimeline: 0, continue: 0, forge: 0 });
    assert.equal(JSON.stringify(f.save), before);
    assert.equal(f.controller.state, 'menu');
    assert.equal(f.root.hidden, false, 'A refused navigation must leave a usable menu.');
  } finally { f.dispose(); }
});

test('keyboard navigation reaches the DLC between new timeline and Forge', () => {
  const f = titleFixture();
  try {
    f.controller.openMenu();
    f.controller.handleKeydown(key('ArrowDown'));
    assert.equal(f.documentRef.activeElement.id, 'title-new');
    f.controller.handleKeydown(key('ArrowDown'));
    assert.equal(f.documentRef.activeElement.id, 'title-river-of-pain');
    f.controller.handleKeydown(key('Enter'));
    assert.equal(f.calls.dlc, 1);
    f.controller.handleKeydown(key('ArrowDown'));
    assert.equal(f.documentRef.activeElement.id, 'title-forge');
  } finally { f.dispose(); }
});

test('gamepad navigation and button edges launch the same DLC action once', () => {
  const f = titleFixture();
  try {
    f.controller.openMenu();
    const pad = { index: 0, id: 'test-controller', connected: true, mapping: 'standard', axes: [0, 0], buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })) };
    const neutral = () => { pad.buttons.forEach(button => { button.pressed = false; button.value = 0; }); f.controller.pollGamepads([pad]); };
    const press = index => { pad.buttons[index].pressed = true; f.controller.pollGamepads([pad]); };
    neutral(); press(13); neutral(); press(13); neutral();
    assert.equal(f.documentRef.activeElement.id, 'title-river-of-pain');
    press(0); f.controller.pollGamepads([pad]);
    assert.equal(f.calls.dlc, 1, 'A held accept button must not repeat the launch.');
    assert.equal(f.calls.newTimeline, 0);
  } finally { f.dispose(); }
});

test('DLC action is refused outside the visible title menu', () => {
  const f = titleFixture();
  try {
    assert.equal(f.controller.openDlc(), false);
    f.controller.openMenu();
    f.root.hidden = true;
    assert.equal(f.controller.openDlc(), false);
    f.root.hidden = false;
    f.controller.state = 'closed';
    assert.equal(f.controller.openDlc(), false);
    assert.equal(f.calls.dlc, 0);
  } finally { f.dispose(); }
});

test('DLC launch cancels a pending replacement confirmation without resetting the campaign', () => {
  const f = titleFixture();
  try {
    f.controller.openMenu();
    f.controller.requestNewTimeline();
    assert.equal(f.controller.newButton.dataset.confirm, 'true');
    f.controller.openDlc();
    assert.equal(f.controller.newButton.dataset.confirm, 'false');
    assert.equal(f.controller.confirmSave, null);
    assert.equal(f.calls.newTimeline, 0);
    assert.equal(f.save.strategy.currentOperation, 'unchanged-operation');
  } finally { f.dispose(); }
});

test('older title surfaces without the optional DLC button still work', () => {
  const f = titleFixture({ includeDlc: false, callback: false });
  try {
    f.controller.openMenu();
    assert.equal(f.controller.menuButtons().length, 4);
    assert.equal(f.controller.getSnapshot().dlcAvailable, false);
    assert.equal(f.controller.openDlc(), false);
    f.controller.handleKeydown(key('End'));
    assert.equal(f.documentRef.activeElement.id, 'title-options');
  } finally { f.dispose(); }
});

function shellFixture() {
  const documentRef = documentDouble();
  const frame = documentRef.add('river-of-pain-game');
  const returnLink = documentRef.add('river-return-tantalus');
  const focusButton = documentRef.add('river-focus-game');
  const loading = documentRef.add('river-loading');
  frame.contentDocument = { readyState: 'complete', URL: 'about:blank' };
  frame.contentWindow = new EventTarget();
  frame.contentWindow.focus = () => { frame.windowFocused = true; };
  const shell = mountRiverOfPainShell(documentRef);
  return { documentRef, frame, returnLink, focusButton, loading, shell };
}

test('wrapper focuses the real game and offers F6 escape without intercepting its pause key', () => {
  const f = shellFixture();
  try {
    assert.equal(f.loading.hidden, false, 'Initial about:blank is not the loaded game.');
    f.frame.dispatchEvent(new Event('load'));
    assert.equal(f.loading.hidden, true);
    f.focusButton.click();
    assert.equal(f.documentRef.activeElement, f.frame);
    assert.equal(f.frame.windowFocused, true);
    const escape = key('Escape');
    f.frame.contentWindow.dispatchEvent(escape);
    assert.equal(escape.defaultPrevented, false);
    const back = key('F6');
    f.frame.contentWindow.dispatchEvent(back);
    assert.equal(back.defaultPrevented, true);
    assert.equal(f.documentRef.activeElement, f.returnLink);
  } finally { f.shell.dispose(); }
});

test('wrapper rebinds a reloaded iframe and releases old listeners', () => {
  const f = shellFixture();
  const previousWindow = f.frame.contentWindow;
  f.frame.dispatchEvent(new Event('load'));
  f.frame.contentWindow = new EventTarget();
  f.frame.contentWindow.focus = () => {};
  f.frame.dispatchEvent(new Event('load'));
  f.frame.focus();
  previousWindow.dispatchEvent(key('F6'));
  assert.equal(f.documentRef.activeElement, f.frame);
  f.frame.contentWindow.dispatchEvent(key('F6'));
  assert.equal(f.documentRef.activeElement, f.returnLink);
  f.shell.dispose();
  f.frame.focus();
  const disposed = key('F6');
  f.frame.contentWindow.dispatchEvent(disposed);
  f.documentRef.dispatchEvent(key('F6'));
  assert.equal(disposed.defaultPrevented, false);
  assert.equal(f.documentRef.activeElement, f.frame);
});

test('wrapper resource and return URLs survive slash canonicalization', async () => {
  const html = await readFile(new URL('../dlc/fleuve-de-la-douleur/index.html', import.meta.url), 'utf8');
  const resources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1])
    .filter(value => /(?:integration\.(?:css|js)|JOUER\.html)$/.test(value));
  assert.equal(resources.length, 4, 'The game iframe and its direct fallback must both be covered.');
  const expected = ['/dlc/fleuve-de-la-douleur/JOUER.html', '/dlc/fleuve-de-la-douleur/JOUER.html',
    '/dlc/fleuve-de-la-douleur/integration.css', '/dlc/fleuve-de-la-douleur/integration.js'].sort();
  const returnTag = html.match(/<a\b[^>]*id="river-return-tantalus"[^>]*>/)?.[0];
  assert.ok(returnTag, 'The return navigation must remain available.');
  const returnHref = returnTag.match(/href="([^"]+)"/)?.[1];
  for (const base of ['https://frontier.test/dlc/fleuve-de-la-douleur',
    'https://frontier.test/dlc/fleuve-de-la-douleur/', 'https://frontier.test/dlc/fleuve-de-la-douleur/index.html']) {
    assert.deepEqual(resources.map(value => new URL(value, base).pathname).sort(), expected, base);
    assert.equal(new URL(returnHref, base).href, 'https://frontier.test/', base);
  }
});
