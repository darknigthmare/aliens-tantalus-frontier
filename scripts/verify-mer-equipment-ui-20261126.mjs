/* DOM doubles and the actual campaign state. This does not claim browser QA. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const source = read('dlc/sea-of-sorrows-visual/src/equipment-ui.js');
const originals = ['data', 'core'].map(name => read(`dlc/sea-of-sorrows/src/${name}.js`));
const dataKey = value => value.replace(/-([a-z])/g, (_, x) => x.toUpperCase());
class Element {
  constructor(tag = 'div') { this.tagName = tag; this.children = []; this.dataset = {}; this.attrs = {}; this.className = ''; this._text = ''; this.disabled = false; }
  get classList() { return { contains: value => this.className.split(' ').includes(value), add: value => { if (!this.classList.contains(value)) this.className += ' ' + value; }, remove: value => { this.className = this.className.split(' ').filter(x => x !== value).join(' '); } }; }
  get textContent() { return this._text + this.children.map(x => x.textContent).join(''); }
  set textContent(value) { this._text = value; this.children = []; }
  append(...nodes) { for (const n of nodes) { n.parent = this; this.children.push(n); } }
  prepend(n) { n.parent = this; this.children.unshift(n); }
  contains(n) { return this === n || this.children.some(c => c.contains(n)); }
  matches(selector) {
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector.startsWith('[data-')) return dataKey(selector.slice(6, -1)) in this.dataset;
    return this.tagName === selector;
  }
  closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector); }
  querySelectorAll(selector) { return this.children.flatMap(c => [...(c.matches(selector) ? [c] : []), ...c.querySelectorAll(selector)]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  setAttribute(key, value) { this.attrs[key] = value; }
}
function boot({ inventory = true, armory = false, open = true } = {}) {
  const body = new Element('body'), panel = new Element(), content = new Element();
  panel.id = 'panel'; panel.className = open ? 'open' : ''; content.id = 'panelContent'; panel.append(content); body.append(panel);
  const document = { getElementById: id => body.querySelector('#' + id), createElement: tag => new Element(tag) };
  const context = vm.createContext({ document });
  for (const code of originals) vm.runInContext(code, context);
  const game = new context.SoSCore.Game();
  const prototype = Object.getOwnPropertyDescriptors(context.SoSCore.Game.prototype);
  const asset = (group, id) => ({ src: `sprites/${group}/${id}.png`, width: 1024, height: 1024 });
  const pack = { equipment: Object.fromEntries(['medkit', 'filter', 'lamp', 'tracker', 'radio'].map(id => [id, asset('equipment', id)])), weapons: Object.fromEntries(['pistol', 'pulse', 'foam'].map(id => [id, asset('weapons', id)])) };
  context.SoSArtPack = { assets: pack };
  class Renderer { constructor() { this.canvas = { id: 'scene' }; this.game = game; this.calls = 0; } draw() { this.calls++; return 'native-result'; } }
  context.SoSRenderer = Renderer;
  const buttons = {};
  if (inventory) for (const [id, title, text, action] of [['useKit', 'Trousse de terrain', '✚', () => game.useMedkit()], ['useFilter', 'Cartouche filtrante', '◉', () => game.replaceFilter()]]) {
    const card = new Element('article'); card.className = 'loadout';
    const glyph = new Element(); glyph.className = 'itemGlyph'; glyph.textContent = text;
    const heading = new Element('h3'); heading.textContent = title;
    const count = new Element('strong'); count.textContent = '3';
    const button = new Element('button'); button.id = id; button.onclick = action; button.disabled = true;
    card.append(glyph, heading, count, button); content.append(card); buttons[id] = button;
  }
  if (armory) for (const id of ['pistol', 'pulse', 'foam', 'plasma', 'flame']) {
    const card = new Element('article'); card.className = 'referenceCard';
    const h = new Element('h3'); h.textContent = id;
    const button = new Element('button'); button.dataset.equip = id; button.disabled = id !== 'pistol'; button.onclick = () => id;
    card.append(h, button); content.append(card); buttons[id] = button;
  }
  vm.runInContext(source, context);
  const renderer = new Renderer();
  return { context, api: context.SoSEquipmentArt, game, renderer, prototype, pack, body, panel, content, buttons };
}
const imageSources = f => f.content.querySelectorAll('img').map(x => x.src).sort();

test('equipment art reads the real inventory without replacing controls or changing saves', () => {
  const f = boot(), before = JSON.stringify(f.game.state), click = f.buttons.useKit.onclick;
  assert.equal(f.renderer.draw(), 'native-result');
  assert.equal(f.renderer.calls, 1);
  assert.equal(JSON.stringify(f.game.state), before);
  assert.deepEqual(Object.getOwnPropertyDescriptors(f.context.SoSCore.Game.prototype), f.prototype);
  assert.equal(f.buttons.useKit.onclick, click); assert.equal(f.buttons.useKit.disabled, true);
  assert.equal(f.buttons.useKit.closest('.loadout').querySelector('strong').textContent, '3');
  assert.equal(f.buttons.useFilter.closest('.loadout').querySelector('h3').textContent, 'Protection respiratoire');
  assert.match(f.content.querySelector('.sos-respirator-caption').textContent, /cartouches en réserve/);
  assert.deepEqual(imageSources(f), ['filter', 'lamp', 'medkit', 'radio', 'tracker'].map(id => `sprites/equipment/${id}.png`));
  f.game.p.hp = 55; f.game.p.medkits = 1; f.buttons.useKit.onclick();
  assert.equal(f.game.p.hp, 100); assert.equal(f.game.p.medkits, 0, 'the original action still owns consumption');
});

test('availability and instrument states follow native flags, without inventing radio inventory', () => {
  const f = boot(); f.renderer.draw();
  const status = id => f.content.querySelectorAll('[data-tool]').find(c => c.dataset.tool === id).querySelector('.sos-tool-status').textContent;
  assert.equal(status('tracker'), 'Non disponible');
  assert.equal(status('lamp'), 'Allumée', 'the civil prologue already owns its lamp');
  assert.equal(status('radio'), 'Communications de mission', 'radio dialogue has no acquisition flag');
  f.game.state.flags.equipped = true; f.game.state.inventory.tracker = true;
  f.game.p.trackerOn = true; f.game.p.lamp = false; f.renderer.draw();
  assert.equal(status('tracker'), 'Lecture active'); assert.equal(status('lamp'), 'Éteinte');
  assert.equal(status('radio'), 'Communications de mission');
  assert.equal('radio' in f.game.state.inventory, false);
  f.game.p.trackerOn = false; f.renderer.draw(); assert.equal(status('tracker'), 'En veille');
});

test('repeated frames are idempotent; missing and wrong-sized images retain readable fallbacks', () => {
  const f = boot(); for (let i = 0; i < 100; i++) f.renderer.draw();
  assert.equal(f.content.querySelectorAll('img').length, 5);
  assert.equal(f.content.querySelectorAll('#sos-equipment-tools').length, 1);
  const glyph = f.buttons.useKit.closest('.loadout').querySelector('.itemGlyph'), image = glyph.querySelector('img');
  image.naturalWidth = 1024; image.naturalHeight = 1024; image.onload();
  assert.equal(glyph.classList.contains('sos-item-ready'), true);
  image.onerror(); assert.equal(image.hidden, true); assert.equal(glyph.classList.contains('sos-item-ready'), false);
  assert.match(glyph.textContent, /✚/);
  image.naturalWidth = 12; image.onload(); assert.equal(image.hidden, true);
  assert.equal(f.buttons.useKit.disabled, true);
});

test('closed screens and unrelated panels request no equipment images', () => {
  const closed = boot({ open: false }); closed.renderer.draw(); assert.equal(imageSources(closed).length, 0);
  const other = boot({ inventory: false }); other.renderer.draw(); assert.equal(imageSources(other).length, 0);
});

test('armory illustrations preserve availability and leave unsupported weapons readable', () => {
  const f = boot({ inventory: false, armory: true }), buttons = Object.values(f.buttons), actions = buttons.map(x => x.onclick), disabled = buttons.map(x => x.disabled);
  const before = JSON.stringify(f.game.state); f.renderer.draw();
  assert.deepEqual(imageSources(f), ['foam', 'pistol', 'pulse'].map(id => `sprites/weapons/${id}.png`));
  assert.deepEqual(buttons.map(x => x.onclick), actions); assert.deepEqual(buttons.map(x => x.disabled), disabled);
  assert.equal(f.buttons.plasma.closest('.referenceCard').querySelector('h3').textContent, 'plasma');
  assert.equal(JSON.stringify(f.game.state), before);
});

test('unsafe paths and invalid image metadata cannot trigger an image request', () => {
  const f = boot(); f.pack.equipment.medkit.src = '../private.png'; f.pack.equipment.filter.width = 0;
  f.renderer.draw(); assert.equal(imageSources(f).length, 3);
  assert.equal(f.buttons.useKit.closest('.loadout').querySelector('.itemGlyph').textContent, '✚');
});
