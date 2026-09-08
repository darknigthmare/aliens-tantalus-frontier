import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { HubDialogueUiV76 } from '../src/hub-dialogue-ui-v76.js';

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach((value) => this.values.add(value)); }
  remove(...values) { values.forEach((value) => this.values.delete(value)); }
  contains(value) { return this.values.has(value); }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.listeners = new Map();
    this.classList = new FakeClassList();
    this.hidden = false;
    this.disabled = false;
    this.inert = false;
    this.isConnected = true;
    this.scrollRequests = [];
  }

  append(...children) {
    for (const child of children) {
      child.parentNode = this;
      this.children.push(child);
    }
  }

  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  removeEventListener(name) { this.listeners.delete(name); }
  focus() { this.ownerDocument.activeElement = this; }
  scrollIntoView(options) { this.scrollRequests.push(options); }

  contains(candidate) {
    for (let current = candidate; current; current = current.parentNode) {
      if (current === this) return true;
    }
    return false;
  }

  querySelectorAll() {
    const matches = [];
    const visit = (node) => {
      for (const child of node.children) {
        const focusableTag = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(child.tagName);
        const focusableTabindex = child.getAttribute('tabindex') !== null
          && child.getAttribute('tabindex') !== '-1';
        if (focusableTag || focusableTabindex) matches.push(child);
        visit(child);
      }
    };
    visit(this);
    return matches;
  }

  querySelector() { return this.querySelectorAll()[0] || null; }
  dispatch(name, event) { this.listeners.get(name)?.(event); }
}

class FakeDocument {
  constructor() {
    this.activeElement = null;
    this.documentElement = new FakeElement('html', this);
  }
  createElement(tagName) { return new FakeElement(tagName, this); }
}

function mount({ onRequestClose = null } = {}) {
  const documentRef = new FakeDocument();
  const background = documentRef.createElement('main');
  const trigger = documentRef.createElement('canvas');
  trigger.setAttribute('tabindex', '0');
  background.append(trigger);
  const layer = documentRef.createElement('div');
  const dialog = documentRef.createElement('section');
  dialog.setAttribute('tabindex', '-1');
  const cancel = documentRef.createElement('button');
  const continueButton = documentRef.createElement('button');
  dialog.append(cancel, continueButton);
  layer.append(dialog);
  const ui = new HubDialogueUiV76({
    layer,
    dialog,
    background,
    documentRef,
    onRequestClose
  });
  return { documentRef, background, trigger, layer, dialog, cancel, continueButton, ui };
}

const guardedKey = (properties) => {
  const counters = { prevented: 0, stopped: 0 };
  return {
    event: {
      ...properties,
      preventDefault: () => { counters.prevented += 1; },
      stopPropagation: () => { counters.stopped += 1; }
    },
    counters
  };
};

test('la couche modale sort le fond du parcours de focus puis restaure son état exact', () => {
  const { documentRef, background, trigger, layer, dialog, continueButton, ui } = mount();
  trigger.focus();

  assert.equal(ui.open({ initialFocus: continueButton }), true);
  assert.equal(ui.openState, true);
  assert.equal(layer.hidden, false);
  assert.equal(layer.getAttribute('aria-hidden'), 'false');
  assert.equal(dialog.hidden, false);
  assert.equal(dialog.getAttribute('aria-hidden'), 'false');
  assert.equal(background.inert, true);
  assert.equal(background.getAttribute('aria-hidden'), 'true');
  assert.equal(documentRef.documentElement.classList.contains('hub-dialogue-mode'), true);
  assert.equal(documentRef.activeElement, continueButton);
  assert.deepEqual(continueButton.scrollRequests, [{ block: 'nearest', inline: 'nearest' }]);

  assert.equal(ui.close(), true);
  assert.equal(ui.openState, false);
  assert.equal(layer.hidden, true);
  assert.equal(dialog.hidden, true);
  assert.equal(background.inert, false);
  assert.equal(background.getAttribute('aria-hidden'), null);
  assert.equal(documentRef.documentElement.classList.contains('hub-dialogue-mode'), false);
  assert.equal(documentRef.activeElement, trigger);
  assert.deepEqual(trigger.scrollRequests, [], 'la restauration hors dialogue ne fait pas défiler la page');
  assert.equal(ui.close(), false, 'une seconde fermeture reste idempotente');
});

test('Tab et Maj+Tab restent dans la modale et Échap ferme sans atteindre le hub', () => {
  let closeRequests = 0;
  let ui;
  const mounted = mount({
    onRequestClose: () => {
      closeRequests += 1;
      ui.close();
    }
  });
  ({ ui } = mounted);
  mounted.trigger.focus();
  ui.open({ initialFocus: mounted.continueButton });

  const tab = guardedKey({ key: 'Tab', shiftKey: false });
  mounted.dialog.dispatch('keydown', tab.event);
  assert.deepEqual(tab.counters, { prevented: 1, stopped: 0 });
  assert.equal(mounted.documentRef.activeElement, mounted.cancel);
  assert.deepEqual(mounted.cancel.scrollRequests.at(-1), { block: 'nearest', inline: 'nearest' });

  const shiftTab = guardedKey({ code: 'Tab', shiftKey: true });
  mounted.dialog.dispatch('keydown', shiftTab.event);
  assert.deepEqual(shiftTab.counters, { prevented: 1, stopped: 0 });
  assert.equal(mounted.documentRef.activeElement, mounted.continueButton);
  assert.deepEqual(mounted.continueButton.scrollRequests.at(-1), { block: 'nearest', inline: 'nearest' });

  const escape = guardedKey({ key: 'Escape' });
  mounted.dialog.dispatch('keydown', escape.event);
  assert.deepEqual(escape.counters, { prevented: 1, stopped: 1 });
  assert.equal(closeRequests, 1);
  assert.equal(ui.openState, false);
  assert.equal(mounted.documentRef.activeElement, mounted.trigger);
});

test('fermeture sans restauration, état inert antérieur et destroy sont nettoyés sans fuite', () => {
  const { documentRef, background, trigger, dialog, cancel, continueButton, ui } = mount();
  background.inert = true;
  background.setAttribute('aria-hidden', 'false');
  cancel.disabled = true;
  continueButton.disabled = true;
  trigger.focus();
  ui.open();
  assert.equal(documentRef.activeElement, dialog, 'le dialogue lui-même est le repli focus');

  assert.equal(ui.close({ restoreFocus: false }), true);
  assert.equal(background.inert, true);
  assert.equal(background.getAttribute('aria-hidden'), 'false');
  assert.equal(documentRef.activeElement, dialog, 'aucun focus caché n’est forcé lors d’un changement de vue');
  assert.equal(ui.destroy(), true);
  assert.equal(dialog.listeners.has('keydown'), false);
  assert.equal(ui.destroy(), false);
  assert.equal(ui.open(), false, 'un contrôleur détruit ne peut pas rouvrir la couche');
});

test('le contrat intégré place réellement dialogue et voile hors du shell transformé sans altérer le portrait', async () => {
  const [html, css, app, sw] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../hub-stations-v61.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../sw.js', import.meta.url), 'utf8')
  ]);

  const shellStart = html.indexOf('<div class="hub-level-shell">');
  const shellEnd = html.indexOf('<div class="hub-level-readout"', shellStart);
  const layerStart = html.indexOf('<div id="hub-dialogue-layer"');
  assert.ok(shellStart >= 0 && shellEnd > shellStart && layerStart > html.indexOf('</main>'));
  assert.doesNotMatch(html.slice(shellStart, shellEnd), /id="hub-dialogue"/u);
  assert.match(html, /id="hub-dialogue-layer"[^>]*aria-hidden="true"[^>]*hidden/u);
  assert.match(html, /id="hub-dialogue"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-hidden="true"[^>]*aria-describedby="hub-dialogue-text"[^>]*tabindex="-1"[^>]*hidden/u);

  assert.match(css, /\.hub-dialogue-layer\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?z-index:\s*90;[\s\S]*?isolation:\s*isolate;/u);
  assert.match(css, /\.hub-dialogue-veil\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?z-index:\s*0;/u);
  assert.match(css, /\.hub-dialogue\s*\{[\s\S]*?position:\s*relative;[\s\S]*?z-index:\s*1;/u);
  assert.doesNotMatch(css, /html\.hub-dialogue-mode::after/u);
  assert.match(css, /\.hub-dialogue-portrait img\s*\{[\s\S]*?object-fit:\s*cover;[\s\S]*?object-position:\s*center 20%;/u);
  assert.match(css, /\.hub-dialogue-portrait\s*\{[^}]*container-type:\s*size;/u);
  assert.match(css, /\.hub-dialogue-portrait img\.is-sprite-cell-v62\s*\{[^}]*width:\s*400cqmin;[^}]*height:\s*auto;[^}]*image-rendering:\s*pixelated;[^}]*clip-path:\s*inset\(0 75% 75% 0\);[^}]*transform:\s*translate3d\(-12\.5%, -12\.5%, 0\);/u);
  assert.match(css, /\.hub-dialogue\s*\{[^}]*overflow:\s*auto;/u);

  assert.match(app, /new HubDialogueUiV76\([\s\S]*?background:\s*byId\('app'\)/u);
  assert.match(app, /hubDialogueUiV76\.open\(\{ initialFocus: byId\('hub-dialogue-continue'\) \}\)/u);
  assert.match(app, /event\.key !== 'Escape' && event\.code !== 'Escape'/u);
  assert.match(app, /hubDialogueUiV76\.destroy\(\{ restoreFocus: false \}\)/u);
  assert.match(sw, /\/src\/hub-dialogue-ui-v76\.js/u);
});
