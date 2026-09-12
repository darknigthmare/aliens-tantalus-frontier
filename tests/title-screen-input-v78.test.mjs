import assert from 'node:assert/strict';
import test from 'node:test';
import { TitleScreenController } from '../src/title-screen-v61.js';

function mount(t, overrides = {}) {
  const globalKeys = ['document', 'navigator', 'requestAnimationFrame', 'cancelAnimationFrame', 'addEventListener', 'removeEventListener'];
  const descriptors = Object.fromEntries(globalKeys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const listeners = new Map(), frames = new Map();
  let sequence = 0;
  const doc = { hidden: false, activeElement: null, hasFocus: () => true,
    documentElement: { classList: { add() {}, remove() {} } }, addEventListener() {}, removeEventListener() {} };
  class Element {
    constructor(id) { this.id = id; this.hidden = false; this.disabled = false; this.dataset = {}; this.events = new Map(); }
    addEventListener(type, listener) { this.events.set(type, listener); }
    removeEventListener(type) { this.events.delete(type); }
    focus() { if (doc.activeElement !== this) doc.activeElement?.events.get('blur')?.({}); doc.activeElement = this; }
    scrollIntoView() {}
    click(detail = 0) { if (!this.disabled) this.events.get('click')?.({ detail }); }
  }
  const nodes = Object.fromEntries(['start', 'menu', 'continue', 'new', 'forge', 'options', 'profile-status', 'live-status']
    .map(id => ['#title-' + id, new Element('title-' + id)]));
  const root = new Element('title-screen'); root.querySelector = selector => nodes[selector];
  const app = new Element('app');
  const calls = { unlock: 0, continue: [], new: 0, forge: 0, options: 0 };
  let save = { profile: 2, clock: { day: 3, hour: 6.7 }, strategy: {} };
  Object.defineProperties(globalThis, {
    document: { configurable: true, value: doc }, navigator: { configurable: true, value: { getGamepads: () => [] } },
    requestAnimationFrame: { configurable: true, value: callback => { const id = ++sequence; frames.set(id, callback); return id; } },
    cancelAnimationFrame: { configurable: true, value: id => frames.delete(id) },
    addEventListener: { configurable: true, value: (type, listener) => listeners.set(type, listener) },
    removeEventListener: { configurable: true, value: type => listeners.delete(type) }
  });
  const ui = new TitleScreenController({ root, app, getSave: () => save,
    onUnlock: () => calls.unlock++, onContinue: target => calls.continue.push(target),
    onNewTimeline: () => calls.new++, onForge: () => calls.forge++, onOptions: () => calls.options++, ...overrides });
  const flush = () => { for (const [id, callback] of [...frames]) { if (!frames.has(id)) continue; frames.delete(id); callback(); } };
  const key = (code, extra = {}) => {
    let prevented = false;
    ui.handleKeydown({ code, preventDefault() { prevented = true; }, stopImmediatePropagation() {}, ...extra });
    return prevented;
  };
  t.after(() => {
    ui.dispose();
    for (const key of globalKeys) descriptors[key] ? Object.defineProperty(globalThis, key, descriptors[key]) : delete globalThis[key];
  });
  ui.show(); flush();
  const menu = () => { key('Enter'); flush(); };
  return { ui, doc, calls, root, app, nodes, frames, listeners, flush, key, menu, setSave: value => { save = value; } };
}

const pad = (pressed = [], axes = [0, 0], extra = {}) => ({ index: 0, id: 'test-standard', mapping: 'standard', connected: true,
  buttons: Array.from({ length: 17 }, (_, index) => ({ pressed: pressed.includes(index), value: pressed.includes(index) ? 1 : 0 })), axes, ...extra });

test('title V78 displays actual profile minutes and cancels stale scheduled focus', t => {
  const m = mount(t);
  assert.match(m.nodes['#title-profile-status'].textContent, /PROFIL 2 · J03 06:42/);
  m.ui.openMenu(); m.ui.hide(); m.flush();
  assert.equal(m.frames.size, 0);
  assert.equal(m.doc.activeElement.id, 'title-continue');
  assert.equal(m.root.dataset.state, 'closed');
});

test('focus, resize and show always clear horizontal title scroll drift', t => {
  const m = mount(t);
  const button = m.nodes['#title-start'];
  button.scrollIntoView = () => { m.root.scrollLeft = 320; };
  m.root.scrollLeft = 140;
  m.ui.focusButton(button);
  assert.equal(m.root.scrollLeft, 0);

  m.root.scrollLeft = 96;
  m.listeners.get('resize')();
  assert.equal(m.root.scrollLeft, 0);

  m.root.scrollLeft = 72;
  m.ui.show();
  assert.equal(m.root.scrollLeft, 0);
  m.flush();
  assert.equal(m.root.scrollLeft, 0);
});

test('keyboard navigation wraps only visible enabled menu actions', t => {
  const m = mount(t); m.menu();
  assert.equal(m.doc.activeElement.id, 'title-continue');
  m.key('ArrowDown'); assert.equal(m.doc.activeElement.id, 'title-new');
  m.key('End'); assert.equal(m.doc.activeElement.id, 'title-options');
  m.key('Tab'); assert.equal(m.doc.activeElement.id, 'title-continue');
  m.key('Tab', { shiftKey: true }); assert.equal(m.doc.activeElement.id, 'title-options');
  m.nodes['#title-forge'].disabled = true;
  m.key('ArrowUp'); assert.equal(m.doc.activeElement.id, 'title-new');
  m.key('Home'); assert.equal(m.doc.activeElement.id, 'title-continue');
});

test('Enter/Space activate selection once, never repeated keydown', t => {
  const m = mount(t); m.menu(); m.key('ArrowDown'); m.key('Enter');
  assert.equal(m.nodes['#title-new'].dataset.confirm, 'true');
  for (let i = 0; i < 20; i++) assert.equal(m.key('Enter', { repeat: true }), true);
  assert.equal(m.calls.new, 0);
  m.key('Escape'); assert.equal(m.ui.state, 'menu');
  m.key('End'); m.key('Space'); assert.equal(m.calls.options, 1);
  m.key('Space'); assert.equal(m.calls.options, 1);
  assert.deepEqual(m.calls.continue, []);
});

test('double click cannot confirm overwrite; fresh deliberate activation can', t => {
  const m = mount(t); m.menu(); m.key('ArrowDown');
  const button = m.nodes['#title-new']; button.click(1); button.click(2);
  assert.equal(m.calls.new, 0); assert.equal(button.dataset.confirm, 'true');
  button.click(1);
  assert.equal(m.calls.new, 1); assert.deepEqual(m.calls.continue, ['hub']);
  button.click(1); assert.equal(m.calls.new, 1);
});

test('blur, Escape and backgrounding cancel an armed overwrite', t => {
  const m = mount(t); m.menu(); m.key('ArrowDown'); m.key('Enter');
  m.key('ArrowDown'); assert.equal(m.nodes['#title-new'].dataset.confirm, 'false');
  m.key('ArrowUp'); m.key('Enter'); m.listeners.get('blur')();
  assert.equal(m.nodes['#title-new'].dataset.confirm, 'false');
  m.key('Enter'); m.key('Escape'); assert.equal(m.ui.state, 'menu');
  m.key('Escape'); assert.equal(m.ui.state, 'idle');
  assert.equal(m.calls.new, 0);
});

test('profile replacement invalidates an earlier confirmation', t => {
  const m = mount(t); m.menu(); m.key('ArrowDown'); m.key('Enter');
  m.setSave({ profile: 3, strategy: {} }); m.key('Enter');
  assert.equal(m.calls.new, 0); assert.equal(m.ui.state, 'menu');
  assert.match(m.nodes['#title-live-status'].textContent, /profil a changé/);
});

test('failed new game remains on menu and exposes a recoverable error', t => {
  const m = mount(t, { onNewTimeline: () => { throw new Error('Stockage plein'); } });
  m.menu(); m.key('ArrowDown'); m.key('Enter'); m.key('Enter');
  assert.equal(m.ui.state, 'menu'); assert.equal(m.root.hidden, false);
  assert.match(m.nodes['#title-live-status'].textContent, /Stockage plein/);
  assert.deepEqual(m.calls.continue, []);
});

test('false new-game callback cannot close menu or launch campaign', t => {
  const m = mount(t, { onNewTimeline: () => false });
  m.menu(); m.key('ArrowDown'); m.key('Enter'); m.key('Enter');
  assert.equal(m.ui.state, 'menu'); assert.deepEqual(m.calls.continue, []);
});

test('pad connect-held and held button cannot open then skip menu', t => {
  const m = mount(t);
  m.ui.pollGamepads([pad([0])]); m.flush(); assert.equal(m.ui.state, 'idle');
  m.ui.pollGamepads([pad()]); m.ui.pollGamepads([pad([0])]); m.flush();
  assert.equal(m.ui.state, 'menu');
  m.ui.pollGamepads([pad([0])]); assert.deepEqual(m.calls.continue, []);
});

test('pad D-pad selects System and A activates it, not Continue', t => {
  const m = mount(t); m.menu();
  m.ui.pollGamepads([pad()]); m.ui.pollGamepads([pad([12])]);
  assert.equal(m.doc.activeElement.id, 'title-options');
  m.ui.pollGamepads([pad()]); m.ui.pollGamepads([pad([0])]);
  assert.equal(m.calls.options, 1); assert.deepEqual(m.calls.continue, []);
  assert.equal(m.ui.gamepads.size, 0); assert.equal(m.frames.size, 0);
});

test('stick uses edges; B cancels confirmation before closing menu', t => {
  const m = mount(t); m.menu();
  m.ui.pollGamepads([pad()]); m.ui.pollGamepads([pad([], [0, 0.8])]);
  m.ui.pollGamepads([pad([], [0, 0.8])]); assert.equal(m.doc.activeElement.id, 'title-new');
  m.ui.pollGamepads([pad()]); m.ui.pollGamepads([pad([0])]);
  m.ui.pollGamepads([pad()]); m.ui.pollGamepads([pad([1])]);
  assert.equal(m.ui.state, 'menu'); assert.equal(m.nodes['#title-new'].dataset.confirm, 'false');
  m.ui.pollGamepads([pad()]); m.ui.pollGamepads([pad([1])]); assert.equal(m.ui.state, 'idle');
});

test('pad reconnect/background holds are suppressed, non-standard mappings ignored', t => {
  const m = mount(t); m.menu();
  m.ui.pollGamepads([pad()]); m.ui.pollGamepads([]); m.ui.pollGamepads([pad([0])]);
  assert.deepEqual(m.calls.continue, []);
  m.doc.hidden = true; m.ui.pollGamepads([pad()]); m.doc.hidden = false;
  m.ui.pollGamepads([pad([0])]); assert.deepEqual(m.calls.continue, []);
  m.ui.pollGamepads([pad()]); m.ui.pollGamepads([pad([0], [0, 0], { mapping: '' })]);
  assert.deepEqual(m.calls.continue, []);
});

test('two pads cannot confirm two actions within one frame', t => {
  const m = mount(t); m.menu(); m.key('ArrowDown');
  m.ui.pollGamepads([pad(), pad([], [0, 0], { index: 1 })]);
  m.ui.pollGamepads([pad([0]), pad([0], [0, 0], { index: 1 })]);
  assert.equal(m.calls.new, 0); assert.equal(m.nodes['#title-new'].dataset.confirm, 'true');
});

test('hidden actions are inert and dispose removes owned listeners/RAF', t => {
  const m = mount(t); m.ui.hide();
  for (const id of ['start', 'continue', 'new', 'forge', 'options']) m.nodes['#title-' + id].click();
  assert.deepEqual(m.calls, { unlock: 0, continue: [], new: 0, forge: 0, options: 0 });
  m.ui.show(); m.ui.dispose();
  assert.equal(m.frames.size, 0); assert.equal(m.listeners.size, 0);
  for (const node of Object.values(m.nodes)) assert.equal(node.events.size, 0);
});
