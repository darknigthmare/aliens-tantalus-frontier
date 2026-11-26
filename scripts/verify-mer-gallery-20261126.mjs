import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// DOM behavior doubles only: this suite does not claim a browser/layout run.
class Element {
  constructor(tag = 'div') { this.tagName = tag; this.dataset = {}; this.attrs = {}; this.children = []; this.listeners = {}; this.value = ''; this.hidden = false; this.open = false; }
  append(...children) { this.children.push(...children); }
  setAttribute(key, value) { this.attrs[key] = value; }
  removeAttribute(key) { delete this[key]; delete this.attrs[key]; }
  addEventListener(event, fn) { (this.listeners[event] ||= []).push(fn); }
  emit(event, extra = {}) { for (const fn of this.listeners[event] || []) fn({ target: this, ...extra }); }
  showModal() { this.open = true; }
  close() { this.open = false; this.emit('close'); }
  focus() { this.focused = true; }
  getBoundingClientRect() { return { left: 10, top: 10, right: 100, bottom: 100 }; }
}
function boot(assets) {
  const ids = Object.fromEntries(['count', 'grid', 'detail', 'detail-title', 'detail-image', 'detail-meta', 'detail-download', 'filters', 'search', 'empty', 'close'].map(x => [x, new Element()]));
  const backdrops = ['grid', 'light', 'black'].map(value => { const e = new Element('button'); e.dataset.backdrop = value; return e; });
  const body = new Element('body');
  const document = { body, getElementById: id => ids[id], createElement: tag => new Element(tag), querySelectorAll: () => backdrops };
  const context = { document, SoSArtPack: { version: 1, assets } };
  vm.runInNewContext(readFileSync(new URL('../dlc/sea-of-sorrows-visual/src/gallery.js', import.meta.url), 'utf8'), context);
  return { ...ids, backdrops, body };
}
const entry = (src, label) => ({ src, width: 1536, height: 1024, label });
const fixture = {
  characters: { decker: entry('sprites/characters/decker.png', 'Decker'), manning: entry('sprites/characters/manning.png', 'Manning') },
  decor: { valve: entry('sprites/decor/valve.png', 'Vanne étanche') },
};

test('gallery filters category and accent-insensitive text together', () => {
  const d = boot(fixture);
  assert.equal(d.grid.children.length, 3);
  assert.equal(d.count.textContent, '3 / 3 sprites');
  d.filters.children.find(x => x.dataset.category === 'decor').emit('click');
  assert.equal(d.count.textContent, '1 / 3 sprites');
  d.search.value = 'etanche'; d.search.emit('input');
  assert.equal(d.count.textContent, '1 / 3 sprites');
  d.search.value = 'Decker'; d.search.emit('input');
  assert.equal(d.count.textContent, '0 / 3 sprites');
  assert.equal(d.empty.hidden, false);
  d.filters.children.find(x => x.dataset.category === 'all').emit('click');
  assert.equal(d.count.textContent, '1 / 3 sprites');
  assert.equal(d.grid.children[0].hidden, false);
});

test('detail view preserves image identity, original dimensions and individual download', () => {
  const d = boot(fixture), button = d.grid.children[0].children[0];
  button.emit('click');
  assert.equal(d.detail.open, true);
  assert.equal(d['detail-image'].src, 'sprites/characters/decker.png');
  assert.match(d['detail-meta'].textContent, /1536 × 1024 px/);
  assert.equal(d['detail-download'].download, 'characters-decker.png');
  assert.equal(d['detail-download'].href, 'sprites/characters/decker.png');
  d.close.emit('click');
  assert.equal(d.detail.open, false);
  assert.equal(button.focused, true);
  assert.equal(d['detail-image'].src, undefined);
});

test('failed image, empty collection and unsafe source have explicit states', () => {
  const d = boot({ decor: { valid: entry('sprites/decor/valve.png', '<script>example</script>'), unsafe: entry('../private.png', 'Unsafe') } });
  assert.equal(d.grid.children.length, 1);
  const card = d.grid.children[0];
  assert.equal(card.children[1].children[0].textContent, '<script>example</script>');
  card.children[0].children[0].emit('error');
  assert.equal(card.dataset.error, 'true');
  const empty = boot({});
  assert.equal(empty.count.textContent, '0 / 0 sprites');
  assert.equal(empty.empty.hidden, false);
});

test('backdrop choices and outside click keep modal controls usable', () => {
  const d = boot(fixture);
  d.backdrops[1].emit('click');
  assert.equal(d.body.dataset.backdrop, 'light');
  assert.equal(d.backdrops[1].attrs['aria-pressed'], 'true');
  assert.equal(d.backdrops[0].attrs['aria-pressed'], 'false');
  d.grid.children[0].children[0].emit('click');
  d.detail.emit('click', { clientX: 0, clientY: 0 });
  assert.equal(d.detail.open, false);
});
