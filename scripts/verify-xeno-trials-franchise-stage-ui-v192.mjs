import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { XenoTrialsUiV96, XENO_TRIALS_STAGE_MEDIA_V192 as media,
  getXenoTrialsStagePageV192 as page, getXenoTrialsStagePreviewCropV192 as crop } from '../src/xeno-trials-ui-v96.js';
import { XENO_TRIALS_STAGES_V96 as stages } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsProgressV96 as progress, beginXenoTrialsV96 as begin } from '../src/xeno-trials-progress-v96.js';
import { XENO_TRIALS_OPERATIONS_V188 as operations } from '../src/xeno-trials-operations-v188.js';
import { EN_CATALOG_V185 as catalog, EN_PATTERNS_V185 as patterns } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185 as translate, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { mergeReviewV186, validateCatalogV186 } from './i18n-catalog-maintenance-v186.mjs';

const review = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/i18n-franchise-stages-review-v192.json', import.meta.url), 'utf8'));
const hash = value => createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(value)
  .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)))).digest('hex');

// Declared paint/input hosts exercise production UI methods and transactions.
// They are not browser captures or native gameplay evidence.
function target(properties = {}) {
  const handlers = new Map();
  return Object.assign({ value: '', hidden: false, disabled: false, innerHTML: '', textContent: '',
    setAttribute() {}, replaceChildren() {}, append() {}, focus() { this.focused = true; },
    addEventListener(type, handler) { handlers.set(type, handler); },
    emit(type) { handlers.get(type)?.({ preventDefault() {}, target: this }); }
  }, properties);
}
function terminal() {
  const elements = new Map(), state = progress();
  const el = key => { if (!elements.has(key)) elements.set(key, target()); return elements.get(key); };
  el('form').elements = new Proxy({}, { get: (_, key) => key === Symbol.iterator ? function* () {} : el('select-' + String(key)) });
  const root = target({ ownerDocument: { hasFocus: () => true }, removeAttribute() {},
    querySelector: selector => el(selector.match(/data-xt="([^"]+)"/)?.[1] || 'external-control') });
  class UiHost extends XenoTrialsUiV96 { updateOpponents() {} restorePendingSelection() {} render() {} }
  const ui = new UiHost({ root, getProgress: () => state, canCommit: () => true, onCommit() {}, onReturn() {} });
  ui.active = true; ui.branchV119 = 'on-demand'; ui.selectionStep = 'arena';
  ui.form.elements.stageId.value = stages[0].id; ui.form.elements.opponentId.value = 'runner';
  ui.form.elements.playerVariant.value = ui.form.elements.opponentVariant.value = 'grey';
  el('stage-media').value = 'all';
  return { ui, el, root, state };
}
const cardIds = html => [...html.matchAll(/data-xt-arena="([^"]+)"/g)].map(match => match[1]);

test('one hundred declared stage entries remain reachable once each in nine bounded pages without changing selection', () => {
  const fixture = Object.freeze(Array.from({ length: 100 }, (_, index) => Object.freeze({
    id: 'declared-stage-' + index, media: index < 50 ? undefined : ['film', 'series', 'game', 'comic', 'novel'][index % 5]
  })));
  const before = JSON.stringify(fixture), seen = [];
  for (let index = 0; index < 9; index++) {
    const view = page(fixture, { page: index, selectedId: fixture[99].id });
    assert.ok(view.stages.length <= 12); assert.equal(view.pages, 9); assert.equal(view.total, 100);
    seen.push(...view.stages.map(stage => stage.id));
  }
  assert.deepEqual(seen, fixture.map(stage => stage.id)); assert.equal(new Set(seen).size, 100);
  assert.equal(JSON.stringify(fixture), before);
  assert.equal(page(fixture, { page: Infinity }).page, 0);
  assert.equal(page(fixture, { page: -100 }).page, 0);
  assert.equal(page(fixture, { page: 100 }).page, 8);
});

test('media filtering, empty results and assigned stages never substitute a different selection', () => {
  const fixture = [{ id: 'original' }, { id: 'film', media: 'film' }, { id: 'game', media: 'game' }];
  assert.deepEqual(media.map(entry => entry.id), ['all', 'film', 'series', 'game', 'comic', 'novel', 'simulation']);
  assert.deepEqual(page(fixture, { media: 'simulation' }).stages.map(stage => stage.id), ['original']);
  const filtered = page(fixture, { media: 'film', selectedId: 'game', revealSelected: true });
  assert.deepEqual(filtered.stages.map(stage => stage.id), ['film']); assert.equal(filtered.selectedVisible, false);
  const empty = page(fixture, { media: 'novel', selectedId: 'game' });
  assert.equal(empty.total, 0); assert.equal(empty.start, 0); assert.equal(empty.end, 0); assert.equal(empty.pages, 1);
  assert.deepEqual(page(fixture, { media: 'novel', page: 9, assignedStageId: 'film' }).stages.map(stage => stage.id), ['film']);
});

test('preview crops use the actual first rectangle, retain integer nondivisible bands and reject invalid image bounds', () => {
  const fixture = { stageRevision: 192, atlasV192: { width: 1536, height: 1024 } };
  assert.deepEqual(crop(fixture), [0, 0, 1536, 341]);
  fixture.atlasV192.sourceRects = [[5, 9, 1000, 300], [0, 341, 1536, 341], [0, 682, 1536, 342]];
  assert.deepEqual(crop(fixture), [5, 9, 1000, 300]);
  assert.ok(Object.isFrozen(crop(fixture)));
  for (const bad of [[0, 0, 1600, 300], [-1, 0, 1500, 300], [0, 0, 1.5, 3], [0, 0, 1500, 0]]) {
    fixture.atlasV192.sourceRects[0] = bad; assert.equal(crop(fixture), null);
  }
  assert.equal(crop({ ...fixture, stageRevision: 190 }), null);
});

test('production arena paging and filters keep the real native select, pending ticket and economy untouched', () => {
  const h = terminal(), before = JSON.stringify(h.state), selected = stages.at(-1);
  h.ui.form.elements.stageId.value = selected.id; h.ui.renderPreviews();
  assert.equal(h.ui.stagePageV192, Math.floor((stages.length - 1) / 12));
  assert.ok(cardIds(h.el('arena-cards').innerHTML).includes(selected.id));
  h.el('stage-media').value = 'film'; h.el('stage-media').emit('change');
  assert.equal(h.ui.form.elements.stageId.value, selected.id);
  assert.ok(cardIds(h.el('arena-cards').innerHTML).length <= 12);
  h.el('arena-selection').onclick();
  assert.equal(h.el('stage-media').value, 'all');
  assert.ok(cardIds(h.el('arena-cards').innerHTML).includes(selected.id));
  assert.equal(JSON.stringify(h.state), before);
  const savedPage = h.ui.stagePageV192;
  const begun = begin(h.state, { stageId: selected.id }); assert.equal(begun.applied, true);
  Object.assign(h.state, begun.state);
  const pending = JSON.stringify(h.state);
  h.el('stage-previous').disabled = false; h.el('stage-previous').onclick();
  assert.equal(h.ui.stagePageV192, savedPage); assert.equal(JSON.stringify(h.state), pending);
});

test('a real assigned operation exposes only its required arena and rejects other native card selections', () => {
  const h = terminal(), operation = operations[0];
  h.ui.activityV119 = { branch: 'operations', id: operation.id };
  h.ui.form.elements.stageId.value = operation.stageId; h.el('stage-media').value = 'novel';
  h.ui.renderPreviews();
  assert.deepEqual(cardIds(h.el('arena-cards').innerHTML), [operation.stageId]);
  assert.equal(h.el('stage-media').disabled, true);
  assert.equal(h.el('stage-next').disabled, true); assert.equal(h.el('stage-previous').disabled, true);
  assert.equal(h.ui.selectArena(stages.find(stage => stage.id !== operation.stageId).id), false);
  assert.equal(h.ui.form.elements.stageId.value, operation.stageId);
});

test('all fifty registered franchise locations appear through their native media filters and crop only the admitted plane', () => {
  const additions = stages.filter(stage => stage.stageRevision === 192), h = terminal();
  assert.equal(additions.length, 50); assert.equal(stages.length, 100);
  const seen = [];
  for (const kind of ['film', 'series', 'game', 'comic', 'novel']) {
    h.el('stage-media').value = kind; h.ui.stagePageV192 = 0; h.ui.stageSelectionV192 = h.ui.form.elements.stageId.value;
    const expected = additions.filter(stage => stage.media === kind);
    for (let index = 0; index < Math.max(1, Math.ceil(expected.length / 12)); index++) {
      h.ui.stagePageV192 = index; h.ui.renderPreviews();
      const html = h.el('arena-cards').innerHTML, ids = cardIds(html);
      assert.ok(ids.length <= 12); seen.push(...ids);
      for (const id of ids) {
        const stage = additions.find(stage => stage.id === id);
        assert.ok(html.includes(`viewBox="${crop(stage).join(' ')}"`), id);
        assert.ok(html.includes(`href="${stage.backdrop}"`), id);
      }
    }
  }
  assert.deepEqual(new Set(seen), new Set(additions.map(stage => stage.id))); assert.equal(seen.length, 50);
});

test('arena controls keep named pages, native button types and viewport crops accessible without exposing technical receipts', () => {
  const h = terminal(), html = h.root.innerHTML;
  for (const key of ['stage-previous', 'stage-next', 'arena-selection'])
    assert.match(html, new RegExp('type="button"[^>]*data-xt="' + key + '"'));
  assert.match(html, /aria-label="Pages des arènes"/);
  assert.match(html, /data-xt="stage-page" role="status" aria-live="polite"/);
  assert.match(html, /<select data-xt="stage-media">/);
  const css = readFileSync(new URL('../xeno-trials-v96.css', import.meta.url), 'utf8');
  assert.match(css, /\.xt-stage-tools-v192 \.button\{min-height:44px\}/);
  assert.match(css, /@media\(max-width:500px\)/);
  h.ui.renderPreviews(); assert.ok(!/sha256|sourceRects|sourceWork|generationPrompt/.test(h.el('arena-cards').innerHTML));
});

test('the reviewed translation extension preserves all 6489 exact keys and 503 patterns from the physical V191 predecessor', () => {
  const expected = {
    exact: { count: 6489, sha256: 'ee0fd6aa1debe8a37bf59a7be40d6c41e2520467a77ec43288da021d711c3491' },
    patterns: { count: 503, sha256: '60a620cb88128f3ae491ac6bd560adb98654a48aceea85c630e829859b124e01' }
  }, base = {};
  assert.equal(review.exact.length, 60); assert.equal(review.patterns.length, 2);
  for (const [kind, values] of Object.entries({ exact: catalog, patterns })) {
    const added = new Set(review[kind].map(entry => entry.fr));
    base[kind] = Object.fromEntries(Object.entries(values).filter(([fr]) => !added.has(fr)));
    assert.equal(Object.keys(base[kind]).length, expected[kind].count); assert.equal(hash(base[kind]), expected[kind].sha256);
    assert.ok(review[kind].every(entry => !Object.hasOwn(entry, 'previous')));
  }
  const rebuilt = mergeReviewV186(base, review);
  assert.equal(hash(rebuilt.exact), hash(catalog)); assert.equal(hash(rebuilt.patterns), hash(patterns));
  assert.equal(validateCatalogV186(rebuilt).omittedPatternSlots, 1);
});

test('reviewed stage titles, media filters and page announcements translate without changing French source metadata', () => {
  const before = JSON.stringify(stages);
  useCatalogV185({ EN_CATALOG_V185: catalog, EN_PATTERNS_V185: patterns });
  setLanguageV185('en', { document: null, persist: false });
  try {
    for (const entry of review.exact) assert.equal(translate(entry.fr), entry.en, entry.fr);
    for (const entry of review.patterns) {
      const fill = value => value.replace(/\{(\d+)\}/g, (_, slot) => String(Number(slot) + 2));
      assert.equal(translate(fill(entry.fr)), fill(entry.en), entry.fr);
    }
    for (const stage of stages.filter(entry => entry.stageRevision === 192))
      assert.equal(translate(stage.label), stage.labelEn, stage.id);
  } finally { setLanguageV185('fr', { document: null, persist: false }); }
  for (const entry of review.exact) assert.equal(translate(entry.fr), entry.fr);
  assert.equal(JSON.stringify(stages), before);
});
