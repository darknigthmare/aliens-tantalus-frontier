import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ShipPortUiV87 } from '../src/ship-port-ui-v87.js';
import { SHIP_ANIMAL_ATLASES_V87 } from '../src/ship-animal-art-v87.js';
import { SHIP_ANIMAL_DEFINITIONS_V87, SHIP_ANIMAL_OFFERS_V87 } from '../src/ship-animal-state-v87.js';

// DOM double for interaction/ownership tests. Native dialog and visual QA remain browser gates.
function documentDouble() {
  const frames = new Map(), draws = [], listeners = new Map(); let serial = 0;
  const document = { visibilityState: 'visible', activeElement: null, frames, draws,
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    dispatch(type) { for (const callback of [...(listeners.get(type) || [])]) callback({ type }); },
    listenerCount(type) { return listeners.get(type)?.size || 0; },
    defaultView: { requestAnimationFrame(callback) { frames.set(++serial, callback); return serial; }, cancelAnimationFrame(id) { frames.delete(id); } },
    frame(time) { const queued = [...frames]; frames.clear(); for (const [, callback] of queued) callback(time); }
  };
  class Element {
    constructor(tag) {
      this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.attributes = new Map(); this.events = new Map();
      this.hidden = false; this.disabled = false; this.open = false; this.isConnected = true; this.textContent = ''; this.parentNode = null;
      this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0;
    }
    set innerHTML(value) { throw new Error(`Unsafe HTML assignment: ${value}`); }
    append(...elements) { for (const element of elements) { this.children.push(element); element.parentNode = this; } }
    replaceChildren(...elements) { this.children = []; this.append(...elements); }
    setAttribute(key, value) { this.attributes.set(key, String(value)); }
    getAttribute(key) { return this.attributes.get(key) ?? null; }
    addEventListener(type, callback) { if (!this.events.has(type)) this.events.set(type, new Set()); this.events.get(type).add(callback); }
    removeEventListener(type, callback) { this.events.get(type)?.delete(callback); }
    fire(type, values = {}) {
      const event = { prevented: false, stopped: false, preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; }, ...values };
      for (const callback of [...(this.events.get(type) || [])]) callback(event); return event;
    }
    click() { if (!this.disabled) this.fire('click'); }
    focus() { document.activeElement = this; }
    showModal() { this.open = true; }
    close() { this.open = false; this.fire('close'); }
    remove() { this.isConnected = false; if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(node => node !== this); }
    getContext() {
      if (this.tagName !== 'CANVAS') return null;
      this.context ||= Object.fromEntries(['clearRect', 'save', 'restore', 'translate', 'scale', 'drawImage'].map(method =>
        [method, (...args) => draws.push([method, ...args])]));
      return this.context;
    }
  }
  document.createElement = tag => new Element(tag); document.body = new Element('body');
  return document;
}

const offer = (animalId, costCredits) => ({ animalId, name: SHIP_ANIMAL_DEFINITIONS_V87[animalId]?.name || animalId,
  appearance: 'Individu original biologique', biography: 'Histoire personnelle documentée', traits: ['Calme', 'Sociable'],
  costCredits, habitatLabel: 'Logement dédié', conditions: [], owned: false, canBuy: true });
function harness(extra = {}) {
  const document = documentDouble(), actions = []; let closes = 0;
  const model = { phase: 'docked', progress: 1, message: 'Comptoir physique accessible', canDock: false, canUndock: true,
    offers: Object.values(SHIP_ANIMAL_OFFERS_V87).map(entry => offer(entry.animalId, entry.costCredits)), busy: false, reducedMotion: false };
  const ui = new ShipPortUiV87({ documentRef: document, getModel: () => model,
    onAction: action => { actions.push(action); return true; }, onClose: () => { closes++; }, ...extra });
  return { ui, model, document, actions, get closes() { return closes; } };
}

test('native dialog lifecycle, modes and close callbacks are explicit and idempotent', () => {
  const h = harness(), { ui, document } = h, previous = document.createElement('button'); previous.focus();
  assert.equal(ui.dialog.tagName, 'DIALOG'); assert.equal(ui.isOpen, false);
  assert.equal(ui.open({ mode: 'unknown' }), false);
  assert.equal(ui.open({ mode: 'terminal' }), true); assert.equal(ui.isOpen, true);
  assert.equal(ui.terminalPanel.hidden, false); assert.equal(ui.shopPanel.hidden, true);
  assert.equal(document.frames.size, 0);
  assert.equal(ui.close(), true); assert.equal(ui.isOpen, false); assert.equal(h.closes, 1);
  assert.equal(document.activeElement, previous); assert.equal(ui.close(), false); assert.equal(h.closes, 1);
  assert.equal(ui.open({ mode: 'shop', animalId: 'animal-brume' }), true);
  assert.equal(ui.selectedAnimalId, 'animal-brume'); assert.equal(ui.shopPanel.hidden, false); assert.equal(ui.terminalPanel.hidden, true);
  assert.equal(ui.close({ notify: false }), true); assert.equal(h.closes, 1);
  assert.equal(ui.destroy(), true); assert.equal(ui.destroy(), false); assert.equal(document.body.children.length, 0);
  assert.equal(ui.open(), false); assert.equal(ui.refresh(), false);
});

test('purchase requires dossier then confirmation, and uses only a semantic action without local debit', async () => {
  const { ui, model, actions } = harness(); const original = structuredClone(model);
  ui.open({ mode: 'shop' }); assert.equal(ui.details.hidden, true); assert.equal(ui.confirmButton.disabled, true);
  assert.equal(await ui.dispatch('buy'), false); assert.equal(actions.length, 0);
  assert.equal(ui.examine(), true); assert.equal(ui.details.hidden, false); assert.equal(ui.confirmButton.disabled, false);
  assert.equal(ui.confirmButton.textContent, 'Confirmer 220 CR');
  assert.equal(await ui.dispatch('buy'), true); assert.deepEqual(actions, [{ type: 'buy', animalId: 'animal-moka' }]);
  assert.deepEqual(model, original, 'UI does not purchase, mark owned or debit credits by itself');
  assert.equal(ui.message.textContent, original.message, 'No invented success message'); ui.destroy();
});

test('conditions, ownership, missing cost, busy state and main canBuy gate all block confirmation', async () => {
  const { ui, model, actions } = harness(); ui.open({ mode: 'shop' });
  for (const change of [{ canBuy: false }, { owned: true }, { conditions: ['Logement non installé'] },
    { costCredits: NaN }, { costCredits: -1 }, { costCredits: '220' }]) {
    model.offers[0] = { ...offer('animal-moka', 220), ...change }; ui.refresh(); ui.examine();
    assert.equal(ui.confirmButton.disabled, true); assert.equal(await ui.dispatch('buy'), false);
  }
  model.offers[0] = offer('animal-moka', 220); model.busy = true; ui.refresh();
  assert.equal(ui.examine(), false); assert.equal(await ui.dispatch('buy'), false); assert.equal(actions.length, 0); ui.destroy();
});

test('action rechecks fresh conditions and price; changing an individual requires a new examination', async () => {
  const { ui, model, actions } = harness(); ui.open({ mode: 'shop' }); ui.examine();
  model.offers[0].canBuy = false; assert.equal(await ui.dispatch('buy'), false);
  model.offers[0].canBuy = true; model.offers[0].costCredits = 230;
  assert.equal(await ui.dispatch('buy'), false); assert.equal(ui.details.hidden, true); assert.equal(actions.length, 0);
  ui.examine(); assert.equal(ui.confirmButton.textContent, 'Confirmer 230 CR');
  ui.select('animal-brume'); assert.equal(ui.details.hidden, true); assert.equal(ui.confirmButton.disabled, true);
  ui.examine(); assert.equal(ui.confirmButton.textContent, 'Confirmer 300 CR');
  model.offers[1].conditions = ['Transport bloqué']; assert.equal(await ui.dispatch('buy'), false);
  assert.deepEqual(ui.conditions.children.map(node => node.textContent), ['Transport bloqué']); ui.destroy();
});

test('asynchronous purchase locks duplicate dispatch and reports storage error without success', async () => {
  let reject, calls = 0;
  const { ui } = harness({ onAction: () => { calls++; return new Promise((_, fail) => { reject = fail; }); } });
  ui.open({ mode: 'shop' }); ui.examine(); const first = ui.dispatch('buy');
  assert.equal(ui.pending, true); assert.equal(ui.confirmButton.disabled, true); assert.equal(await ui.dispatch('buy'), false);
  reject(new Error('Quota plein')); assert.equal(await first, false); assert.equal(calls, 1); assert.equal(ui.pending, false);
  assert.match(ui.errorLabel.textContent, /Action non enregistrée.*Quota plein/); assert.equal(ui.errorLabel.hidden, false); ui.destroy();
});

test('late action completion cannot refresh a closed, destroyed or newly reopened session', async () => {
  let resolve;
  const { ui } = harness({ onAction: () => new Promise(done => { resolve = done; }) });
  ui.open({ mode: 'shop' }); ui.examine(); const action = ui.dispatch('buy');
  ui.close(); ui.open({ mode: 'terminal' }); assert.equal(ui.pending, false);
  resolve(false); await action;
  assert.equal(ui.mode, 'terminal'); assert.equal(ui.errorLabel.hidden, true); assert.equal(ui.isOpen, true);
  ui.destroy(); assert.equal(ui.images.size, 0);
});

test('terminal dock, undock and abort use their current gates; terminal never buys', async () => {
  const { ui, model, actions } = harness(); ui.open({ mode: 'terminal' });
  assert.equal(await ui.dispatch('buy'), false); assert.equal(await ui.dispatch('dock'), false);
  assert.equal(await ui.dispatch('undock'), true); assert.equal(await ui.dispatch('abort'), false);
  model.phase = 'undocked'; model.canDock = true; model.canUndock = false; ui.refresh();
  assert.equal(ui.dockButton.disabled, false); assert.equal(ui.undockButton.disabled, true); assert.equal(await ui.dispatch('dock'), true);
  model.phase = 'approaching'; model.canDock = false; ui.refresh(); assert.equal(ui.abortButton.disabled, false);
  assert.equal(await ui.dispatch('abort'), true);
  model.busy = true; assert.equal(await ui.dispatch('abort'), false);
  assert.deepEqual(actions, [{ type: 'undock' }, { type: 'dock' }, { type: 'abort' }]); ui.destroy();
});

test('escaped close is notified once, focus returns, keyboard does not bubble to the game', () => {
  const h = harness(), { ui, document } = h, previous = document.createElement('button'); previous.focus(); ui.open({ mode: 'shop' });
  assert.equal(ui.dialog.fire('keydown', { key: 'd' }).stopped, true);
  const event = ui.dialog.fire('cancel'); assert.equal(event.prevented, true); assert.equal(event.stopped, true);
  assert.equal(ui.isOpen, false); assert.equal(h.closes, 1); assert.equal(document.activeElement, previous);
  ui.open({ mode: 'shop' }); ui.dialog.close(); assert.equal(ui.isOpen, false); assert.equal(h.closes, 2); ui.destroy();
});

test('tabs expose accessible selection and left/right keys, with no confirmation carry-over', () => {
  const { ui, document } = harness(); ui.open({ mode: 'shop' }); ui.examine();
  const moka = ui.tabButtons.get('animal-moka'), brume = ui.tabButtons.get('animal-brume');
  assert.equal(moka.getAttribute('aria-selected'), 'true'); assert.equal(moka.tabIndex, 0);
  const event = moka.fire('keydown', { key: 'ArrowRight' }); assert.equal(event.prevented, true); assert.equal(event.stopped, true);
  assert.equal(ui.selectedAnimalId, 'animal-brume'); assert.equal(document.activeElement, brume);
  assert.equal(brume.getAttribute('aria-selected'), 'true'); assert.equal(ui.confirmButton.disabled, true);
  brume.fire('keydown', { key: 'Home' }); assert.equal(ui.selectedAnimalId, 'animal-moka'); ui.destroy();
});

test('model strings remain literal text, and arbitrary asset paths or unknown animals are ignored', () => {
  const { ui, model } = harness(); const unsafe = '<img src=x onerror=alert(1)>';
  Object.assign(model.offers[0], { name: unsafe, appearance: unsafe, biography: unsafe, traits: [unsafe], conditions: [unsafe], path: 'https://invalid/evil.png' });
  model.message = unsafe; ui.open({ mode: 'shop' }); ui.examine();
  assert.equal(ui.offerName.textContent, unsafe); assert.equal(ui.appearance.textContent, unsafe); assert.equal(ui.biography.textContent, unsafe);
  assert.equal(ui.conditions.children[0].textContent, unsafe); assert.equal(ui.message.textContent, unsafe);
  assert.equal(ui.images.get('animal-moka').src, SHIP_ANIMAL_ATLASES_V87['animal-moka'].path);
  assert.equal(ui.imageFor('enemy-queen'), null); assert.equal(ui.select('enemy-queen'), false);
  model.offers = [{ ...offer('enemy-queen', 99), path: '/enemy.png' }]; ui.refresh();
  assert.equal(ui.confirmButton.disabled, true); assert.equal(ui.offerName.textContent, 'Aucune offre disponible'); ui.destroy();
});

test('previews use genuine dedicated atlases at fixed relative scale and nine-argument crops', () => {
  const { ui, document } = harness(); ui.open({ mode: 'shop' });
  assert.match(ui.previewStatus.textContent, /indisponible ou en chargement/);
  for (const animalId of Object.keys(SHIP_ANIMAL_DEFINITIONS_V87)) {
    ui.select(animalId); const image = ui.images.get(animalId);
    const atlas = SHIP_ANIMAL_ATLASES_V87[animalId];
    Object.assign(image, { complete: true, naturalWidth: atlas.width, naturalHeight: atlas.height }); document.draws.length = 0; image.onload();
    const draw = document.draws.find(call => call[0] === 'drawImage').slice(1);
    assert.equal(draw.length, 9); assert.equal(draw[0], image);
    assert.equal(draw[7] / draw[3], SHIP_ANIMAL_ATLASES_V87[animalId].worldScale);
    assert.equal(ui.canvas.height, 144); assert.match(ui.previewStatus.textContent, /Échelle constante/);
  }
  ui.destroy();
});

test('Luciole has her own definition-backed tab, dossier and two-step 220 CR confirmation', async () => {
  const { ui, actions, model, document } = harness();
  assert.deepEqual([...ui.tabButtons.keys()], ['animal-moka', 'animal-brume', 'animal-luciole']);
  ui.open({ mode: 'shop', animalId: 'animal-luciole' });
  const luciole = ui.tabButtons.get('animal-luciole');
  assert.equal(luciole.textContent, 'Luciole'); assert.equal(luciole.hidden, false);
  assert.equal(luciole.getAttribute('aria-selected'), 'true'); assert.equal(ui.offerName.textContent, 'Luciole');
  assert.equal(ui.confirmButton.disabled, true); assert.equal(await ui.dispatch('buy'), false);
  ui.examine(); assert.equal(ui.confirmButton.textContent, 'Confirmer 220 CR');
  assert.equal(ui.confirmButton.disabled, false);
  luciole.fire('keydown', { key: 'ArrowRight' }); assert.equal(ui.selectedAnimalId, 'animal-moka');
  assert.equal(ui.confirmButton.disabled, true);
  ui.tabButtons.get('animal-moka').fire('keydown', { key: 'End' });
  assert.equal(ui.selectedAnimalId, 'animal-luciole'); assert.equal(document.activeElement, luciole);
  assert.equal(ui.confirmButton.disabled, true); ui.examine();
  const selected = model.offers.find(entry => entry.animalId === 'animal-luciole');
  selected.canBuy = false; assert.equal(await ui.dispatch('buy'), false); assert.deepEqual(actions, []);
  selected.canBuy = true; ui.refresh(); assert.equal(await ui.dispatch('buy'), true);
  assert.deepEqual(actions, [{ type: 'buy', animalId: 'animal-luciole' }]);
  selected.owned = true; ui.refresh(); assert.equal(ui.confirmButton.disabled, true);
  assert.equal(await ui.dispatch('buy'), false); assert.equal(actions.length, 1); ui.destroy();
});

test('missing offers hide tabs and keyboard navigation skips them without relabelling Luciole as another animal', () => {
  const { ui, model, document } = harness();
  model.offers = model.offers.filter(entry => entry.animalId !== 'animal-brume');
  model.offers.find(entry => entry.animalId === 'animal-luciole').name = '';
  ui.open({ mode: 'shop' });
  assert.equal(ui.tabButtons.get('animal-brume').hidden, true);
  ui.tabButtons.get('animal-moka').fire('keydown', { key: 'ArrowRight' });
  assert.equal(ui.selectedAnimalId, 'animal-luciole');
  assert.equal(ui.tabButtons.get('animal-luciole').textContent, 'Luciole');
  assert.equal(document.activeElement, ui.tabButtons.get('animal-luciole'));
  assert.equal(ui.dossier.getAttribute('aria-labelledby'), 'ship-port-v87-tab-animal-luciole'); ui.destroy();
});

test('Luciole preview rejects another cat atlas even with identical dimensions and has no substituted bitmap', () => {
  const { ui, document } = harness(); ui.open({ mode: 'shop', animalId: 'animal-luciole' });
  const image = ui.images.get('animal-luciole'), atlas = SHIP_ANIMAL_ATLASES_V87['animal-luciole'];
  assert.equal(image.src, atlas.path); assert.notEqual(atlas.path, SHIP_ANIMAL_ATLASES_V87['animal-moka'].path);
  Object.assign(image, { complete: true, naturalWidth: atlas.width, naturalHeight: atlas.height,
    src: SHIP_ANIMAL_ATLASES_V87['animal-moka'].path });
  document.draws.length = 0; image.onload();
  assert.equal(document.draws.some(entry => entry[0] === 'drawImage'), false);
  assert.match(ui.previewStatus.textContent, /indisponible ou en chargement/);
  image.src = atlas.path; image.onload();
  const draws = document.draws.filter(entry => entry[0] === 'drawImage');
  assert.equal(draws.length, 1); assert.equal(draws[0][1], image); assert.equal(draws[0].length, 10); ui.destroy();
});

test('preview owns one RAF, pauses while hidden/reduced, and cancels all listeners on destroy', () => {
  const { ui, model, document } = harness(); ui.open({ mode: 'shop' });
  assert.equal(document.frames.size, 1); ui.refresh(); ui.refresh(); assert.equal(document.frames.size, 1);
  document.frame(1000); document.frame(1100); assert.ok(ui.animationSeconds > 0); assert.equal(document.frames.size, 1);
  document.visibilityState = 'hidden'; document.dispatch('visibilitychange'); assert.equal(document.frames.size, 0);
  const paused = ui.animationSeconds; document.frame(100000); assert.equal(ui.animationSeconds, paused);
  document.visibilityState = 'visible'; document.dispatch('visibilitychange'); assert.equal(document.frames.size, 1);
  model.reducedMotion = true; ui.refresh(); assert.equal(document.frames.size, 0);
  model.reducedMotion = false; ui.refresh(); assert.equal(document.frames.size, 1);
  ui.close(); assert.equal(document.frames.size, 0); ui.open({ mode: 'shop' }); assert.equal(document.frames.size, 1);
  ui.destroy(); assert.equal(document.frames.size, 0); assert.equal(document.listenerCount('visibilitychange'), 0);
});

test('missing model, native dialog support or canvas fails closed without fabricated content', () => {
  const { ui } = harness({ getModel: () => { throw new Error('Profil indisponible'); } });
  ui.open({ mode: 'shop' }); assert.equal(ui.confirmButton.disabled, true); assert.match(ui.errorLabel.textContent, /Profil indisponible/);
  ui.close(); ui.dialog.showModal = undefined; assert.equal(ui.open(), false); assert.equal(ui.isOpen, false); ui.destroy();
  assert.throws(() => new ShipPortUiV87({}), /requiert/);
});

test('stylesheet is scoped, responsive, preserves canvas aspect and does not override native closed dialogs', async () => {
  const css = await readFile(new URL('../src/ship-port-v87.css', import.meta.url), 'utf8');
  assert.match(css, /dialog\.ship-port-v87::backdrop/); assert.match(css, /aspect-ratio: 320 \/ 144/);
  assert.match(css, /min-height: 44px/); assert.match(css, /@media \(max-width: 580px\)/);
  assert.match(css, /prefers-reduced-motion/); assert.match(css, /focus-visible/);
  assert.doesNotMatch(css, /dialog\.ship-port-v87\s*\{[^}]*display:/);
});
