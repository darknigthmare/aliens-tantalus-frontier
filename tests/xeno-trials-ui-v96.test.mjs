import test from 'node:test';
import assert from 'node:assert/strict';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';
import { XENO_TRIALS_FIGHTERS_V96 as FIGHTERS } from '../src/xeno-trials-data-v96.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, nextXenoTrialsRoundV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';

/** Deliberately narrow DOM harness: verifies UI logic, not browser layout. */
class Node {
  constructor(tag = 'div') { Object.assign(this, { tagName: tag.toUpperCase(), value: '', disabled: false, hidden: false,
    textContent: '', children: [], dataset: {}, attributes: {}, listeners: new Map() }); }
  set innerHTML(value) {
    this.html = value;
    if (this.tagName === 'SELECT') {
      const entries = [...value.matchAll(/<option value="([^"]+)"([^>]*)>/g)];
      this.value = (entries.find(entry => /selected/.test(entry[2])) || entries[0])?.[1] || '';
    }
  }
  get innerHTML() { return this.html || ''; }
  addEventListener(type, handler) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(handler); }
  removeEventListener(type, handler) { this.listeners.get(type)?.delete(handler); }
  dispatch(type, extra = {}) { for (const fn of this.listeners.get(type) || []) fn({ preventDefault() {}, target: this, ...extra }); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] || null; }
  replaceChildren(...children) { this.children = children; }
  append(child) { this.children.push(child); }
  contains() { return true; }
  focus() { this.focused = true; }
}
function harness(t, options = {}) {
  const root = new Node(), nodes = new Map(), doc = new Node(), win = new Node(), frames = new Map(), images = [];
  doc.createElement = tag => new Node(tag); doc.hidden = false;
  let rafId = 0;
  win.requestAnimationFrame = fn => { frames.set(++rafId, fn); return rafId; };
  win.cancelAnimationFrame = id => frames.delete(id);
  win.Image = class Image {
    constructor() { this.naturalWidth = 1536; this.naturalHeight = 1024; images.push(this); }
    set src(value) { this.path = value; if (!options.delayedImages) queueMicrotask(() => options.badImages ? this.onerror?.() : this.onload?.()); }
  };
  const baseSetter = Object.getOwnPropertyDescriptor(Node.prototype, 'innerHTML').set;
  Object.defineProperty(root, 'innerHTML', { set(value) {
    baseSetter.call(this, value);
    for (const match of value.matchAll(/<([a-z]+)\b[^>]*\bdata-xt="([^"]+)"[^>]*>/g)) {
      const node = new Node(match[1]); node.ownerDocument = doc;
      node.hidden = /\bhidden\b/.test(match[0]); node.disabled = /\bdisabled\b/.test(match[0]); nodes.set(match[2], node);
    }
    const form = nodes.get('form'); form.elements = [];
    for (const match of value.matchAll(/<select name="([^"]+)">([\s\S]*?)<\/select>/g)) {
      const select = new Node('select'); select.name = match[1]; select.innerHTML = match[2];
      form.elements.push(select); form.elements[select.name] = select;
    }
    const canvas = nodes.get('canvas'); canvas.width = 1000; canvas.height = 560;
    canvas.getContext = () => options.noContext ? null : new Proxy({}, { get: (o, k) => o[k] || (() => {}), set: (o, k, v) => { o[k] = v; return true; } });
  }, get() { return this.html; } });
  root.querySelector = selector => nodes.get(selector.match(/data-xt="([^"]+)"/)?.[1]) || null;
  const globals = { document: globalThis.document, window: globalThis.window, FormData: globalThis.FormData };
  globalThis.document = doc; globalThis.window = win;
  globalThis.FormData = class FormData { constructor(form) { this.entries = form.elements.filter(e => !e.disabled).map(e => [e.name, e.value]); } [Symbol.iterator]() { return this.entries[Symbol.iterator](); } };
  const state = { value: options.progress || createXenoTrialsProgressV96(), commits: 0, canCommit: true, throwCommit: false, returns: 0 };
  const ui = new XenoTrialsUiV96({ root, getProgress: () => state.value, canCommit: () => state.canCommit,
    onCommit(value) { if (state.throwCommit) throw new Error('disque indisponible'); state.value = value; state.commits++; },
    onReturn() { state.returns++; } });
  t.after(() => { ui.close(); for (const [key, value] of Object.entries(globals)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
  return { ui, root, nodes, doc, win, frames, images, state };
}
function ticket() { return beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: 'defender', factionId: 'containment' }); }
function validResult(config) {
  const match = createXenoTrialsMatchV96(config);
  const step = (seconds, controls = {}) => { for (let i = 0; i < Math.round(seconds * 120); i++) stepXenoTrialsMatchV96(match, 1 / 120, controls, {}); };
  for (let round = 0; round < 2; round++) {
    step(1); match.fighters[0].x = 450; match.fighters[1].x = 550; match.fighters[1].hp = 5; step(.2, { light: true });
    if (!match.result) nextXenoTrialsRoundV96(match);
  }
  assert.ok(match.result?.completed); return match.result;
}

test('V99 arena cards synchronize with the select without creating or altering a saved ticket', t => {
  const f = harness(t); f.ui.open();
  assert.equal(f.ui.selectArena('tantalus-cargo'), false);
  assert.equal(f.ui.confirmFighters(), true);
  assert.equal((f.nodes.get('arena-cards').innerHTML.match(/data-xt-arena=/g) || []).length, 6);
  assert.equal(f.ui.selectArena('tantalus-cargo'), true);
  assert.equal(f.ui.form.elements.stageId.value, 'tantalus-cargo');
  assert.match(f.nodes.get('stage-preview').innerHTML, /ship-cargo-far\.png/);
  assert.match(f.nodes.get('arena-matchup').textContent, /Warrior contre/);
  assert.equal(f.ui.selectArena('invented'), false);
  assert.equal(f.state.commits, 0); assert.equal(f.state.value.pending, null);
  f.ui.showFighters(); f.ui.confirmFighters();
  assert.equal(f.ui.form.elements.stageId.value, 'tantalus-cargo');
  f.state.value = ticket().state;
  assert.equal(f.ui.selectArena('planet-surface'), false);
  assert.equal(f.state.value.pending.config.stageId, 'containment-deck');
});

test('V99 faction filter and reset preserve fighter selection and progression', t => {
  const f = harness(t); f.ui.open();
  f.nodes.get('faction-filter').value = 'pursuit'; f.nodes.get('faction-filter').dispatch('change');
  const html = f.nodes.get('roster').innerHTML;
  assert.match(html, /data-xt-fighter="runner"/); assert.doesNotMatch(html, /data-xt-fighter="synth-heavy"/);
  assert.equal(f.ui.selected, 'warrior');
  f.nodes.get('search').value = 'nothing'; f.nodes.get('search').dispatch('input');
  f.nodes.get('reset-filters').onclick();
  assert.equal(f.nodes.get('faction-filter').value, 'all'); assert.equal(f.nodes.get('search').value, '');
  assert.equal(f.ui.selected, 'warrior'); assert.equal(f.state.commits, 0);
});

test('V97 wizard back navigation preserves selections and never creates a ticket before launch', t => {
  const f = harness(t); f.ui.open(); f.ui.selected = 'arachnoid'; f.ui.render();
  const fields = f.ui.form.elements; fields.playerVariant.value = 'purple'; fields.difficulty.value = 'hard';
  fields.opponentId.value = 'defender'; fields.stageId.value = 'hive-vault'; fields.roundSeconds.value = '120';
  const values = fields.map(e => [e.name, e.value]);
  assert.equal(f.ui.confirmFighters(), true); assert.equal(f.ui.selectionStep, 'arena');
  assert.equal(f.nodes.get('stable').hidden, true); assert.equal(f.nodes.get('combat-panel').hidden, true);
  assert.equal(fields.stageId.focused, true); assert.equal(f.ui.showFighters(), true);
  assert.equal(f.ui.selectionStep, 'fighters'); assert.equal(f.nodes.get('stable').hidden, false);
  assert.equal(f.nodes.get('confirm-fighters').focused, true); assert.equal(f.nodes.get('start').disabled, true);
  assert.equal(f.ui.selected, 'arachnoid'); assert.deepEqual(fields.map(e => [e.name, e.value]), values);
  assert.equal(f.state.commits, 0); assert.equal(f.state.value.pending, null); assert.equal(f.ui.runtime, null);
  assert.equal(f.ui.confirmFighters(), true); assert.equal(f.nodes.get('arena-config').hidden, false);
});

test('V97 filters can hide the selected card without silently replacing the selected fighter', t => {
  const f = harness(t); f.ui.open(); f.ui.selected = 'arachnoid'; f.ui.render();
  f.nodes.get('family').value = 'synthetic'; f.nodes.get('family').dispatch('change');
  assert.equal((f.nodes.get('roster').innerHTML.match(/data-xt-fighter=/g) || []).length, FIGHTERS.filter(f => f.family === 'synthetic').length);
  assert.equal(f.ui.selected, 'arachnoid'); assert.match(f.nodes.get('count').textContent, /Sélection : Arachnoid/);
  f.nodes.get('search').value = 'inexistant'; f.nodes.get('search').dispatch('input');
  assert.match(f.nodes.get('roster').innerHTML, /Votre sélection est conservée/);
  assert.equal(f.ui.confirmFighters(), true); assert.match(f.nodes.get('portraits').innerHTML, /Arachnoid/);
  assert.equal(f.state.commits, 0);
});

test('V97 locked selection cannot advance the wizard or commit a duel', t => {
  const f = harness(t); f.ui.open(); f.ui.selected = 'queen'; f.ui.render();
  assert.equal(f.ui.confirmFighters(), false); assert.equal(f.nodes.get('confirm-fighters').disabled, true);
  f.ui.begin(); assert.equal(f.state.commits, 0); assert.equal(f.ui.runtime, null);
  assert.equal(f.ui.selectionStep, 'fighters'); assert.equal(f.state.value.pending, null);
});

test('V97 reopening a historical 75-second ticket restores exact fighter and palette previews', async t => {
  const transaction = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'arachnoid', playerVariant: 'purple',
    opponentId: 'defender', factionId: 'containment', difficulty: 'hard', roundSeconds: 75 });
  const f = harness(t, { progress: transaction.state }); f.ui.open(); const fields = f.ui.form.elements;
  assert.equal(f.ui.selected, 'arachnoid'); assert.equal(fields.playerVariant.value, 'purple');
  assert.equal(fields.opponentId.value, 'defender'); assert.equal(fields.difficulty.value, 'hard'); assert.equal(fields.roundSeconds.value, '75');
  assert.match(f.nodes.get('portraits').innerHTML, /arachnoid-purple-v95\.png/); assert.match(f.nodes.get('portraits').innerHTML, /Defender/);
  assert.ok(fields.every(field => field.disabled)); assert.equal(f.ui.confirmFighters(), false); assert.equal(f.ui.showFighters(), false);
  assert.equal(f.nodes.get('restart').hidden, false); assert.equal(f.state.commits, 0);
  assert.equal(await f.nodes.get('restart').onclick(), true); const state = f.ui.runtime.getState();
  assert.equal(state.config.matchId, transaction.config.matchId); assert.equal(state.config.seed, transaction.config.seed);
  assert.equal(state.config.playerId, 'arachnoid'); assert.equal(state.config.playerVariant, 'purple'); assert.equal(state.timeRemaining, 75);
  assert.equal(state.presentation.phase, 'intro-player'); assert.equal(state.tick, 0); assert.equal(f.state.commits, 0);
});

test('V97 fresh arena form defaults to 99 seconds without rewriting pending historical duration', t => {
  const f = harness(t); f.ui.open(); assert.equal(f.ui.form.elements.roundSeconds.value, '99');
  const pending = beginXenoTrialsV96(f.state.value, { playerId: 'runner', opponentId: 'arachnoid', opponentVariant: 'purple', roundSeconds: 75 });
  f.state.value = pending.state; f.ui.close(); f.ui.open();
  assert.equal(f.ui.selected, 'runner'); assert.equal(f.ui.form.elements.roundSeconds.value, '75');
  assert.equal(f.ui.form.elements.opponentVariant.value, 'purple'); assert.equal(f.state.value.pending.config.roundSeconds, 75);
  assert.equal(f.state.commits, 0);
});

test('V97 pending ticket locks roster selection even when a forged click reaches the handler', t => {
  const transaction = ticket(), f = harness(t, { progress: transaction.state }); f.ui.open();
  const before = structuredClone(f.state.value), selected = f.ui.selected;
  const cards = [...f.nodes.get('roster').innerHTML.matchAll(/<button\b[^>]*data-xt-fighter="[^"]+"[^>]*>/g)];
  assert.equal(cards.length, FIGHTERS.length); assert.ok(cards.every(card => /\bdisabled\b/.test(card[0])));
  f.root.dispatch('click', { target: { closest: selector => selector === '[data-xt-fighter]' ? { dataset: { xtFighter: 'runner' } } : null } });
  assert.equal(f.ui.selected, selected); assert.deepEqual(f.state.value, before); assert.equal(f.state.commits, 0);
  f.nodes.get('family').value = 'synthetic'; f.nodes.get('family').dispatch('change');
  assert.equal((f.nodes.get('roster').innerHTML.match(/data-xt-fighter=/g) || []).length, FIGHTERS.filter(f => f.family === 'synthetic').length);
  assert.equal(f.ui.selected, selected); assert.deepEqual(f.state.value.pending.config, transaction.config);
});

test('V97 obsolete opponent or stage IDs in a valid historical ticket produce guarded previews', t => {
  const transaction = ticket(); transaction.state.pending.config.opponentId = 'removed-fighter';
  transaction.state.pending.config.stageId = 'removed-stage';
  const f = harness(t, { progress: transaction.state }); assert.doesNotThrow(() => f.ui.open());
  assert.equal(f.ui.form.elements.opponentId.value, 'runner');
  assert.equal(f.ui.form.elements.stageId.value, 'containment-deck');
  assert.match(f.nodes.get('portraits').innerHTML, /Runner/); assert.doesNotMatch(f.nodes.get('stage-preview').innerHTML, /removed-stage/);
  assert.equal(f.state.value.pending.config.opponentId, 'removed-fighter'); assert.equal(f.state.commits, 0);
});

test('Trials UI initializes every dedicated card and confirms fighters before arena/start', t => {
  const f = harness(t); assert.equal((f.nodes.get('roster').innerHTML.match(/data-xt-fighter=/g) || []).length, FIGHTERS.length);
  assert.equal(f.nodes.get('start').disabled, true); f.ui.open(); assert.equal(f.nodes.get('start').disabled, true);
  assert.equal(f.ui.confirmFighters(), true); assert.equal(f.nodes.get('start').disabled, false);
  assert.equal(f.nodes.get('fighter-config').hidden, true); assert.equal(f.nodes.get('arena-config').hidden, false);
  assert.equal(f.state.commits, 0); assert.equal(f.state.value.pending, null);
  assert.match(f.root.innerHTML, /aria-describedby="xeno-trials-help-v96"/);
  assert.match(f.root.innerHTML, /poses sont fixes/);
});
test('V96 UI refuses a duel if the saved ticket could not be committed', t => {
  const f = harness(t); f.ui.open(); f.ui.confirmFighters(); f.state.throwCommit = true; f.ui.begin();
  assert.equal(f.state.value.pending, null); assert.equal(f.ui.runtime, null); assert.equal(f.state.commits, 0);
  assert.match(f.nodes.get('status').textContent, /Sauvegarde refusée/);
});
test('V96 UI catches runtime construction failure and keeps the saved ticket restartable', async t => {
  const transaction = ticket(), f = harness(t, { progress: transaction.state, noContext: true }); f.ui.open();
  assert.equal(await f.ui.launch(transaction.config), false);
  assert.equal(f.ui.loading, false); assert.equal(f.ui.runtime, null); assert.equal(f.nodes.get('restart').hidden, false);
  assert.match(f.nodes.get('status').textContent, /Duel non lancé/); assert.equal(f.state.value.pending.matchId, transaction.config.matchId);
});
test('V96 UI preserves actionable missing-sprite message after resetting its controls', async t => {
  const transaction = ticket(), f = harness(t, { progress: transaction.state, badImages: true }); f.ui.open();
  assert.equal(await f.ui.launch(transaction.config), false);
  assert.equal(f.ui.loading, false); assert.equal(f.ui.runtime, null); assert.equal(f.nodes.get('restart').hidden, false);
  assert.match(f.nodes.get('status').textContent, /Sprite indisponible/); assert.equal(f.state.value.pending.matchId, transaction.config.matchId);
});
test('V96 UI retries failed result persistence once without duplicate rewards', t => {
  const transaction = ticket(), f = harness(t, { progress: transaction.state }); f.ui.open(); const result = validResult(transaction.config);
  const before = f.state.value.credits; f.state.throwCommit = true;
  assert.equal(f.ui.finish(result), false); assert.equal(f.state.value.credits, before); assert.ok(f.state.value.pending);
  assert.equal(f.nodes.get('retry-save').hidden, false); assert.equal(f.ui.unsavedResult, result);
  f.state.throwCommit = false; f.nodes.get('retry-save').onclick();
  assert.equal(f.state.value.pending, null); assert.equal(f.state.value.wins, 1); assert.equal(f.state.commits, 1);
  assert.equal(f.state.value.credits, before + 100); assert.equal(f.ui.unsavedResult, null); assert.equal(f.nodes.get('retry-save').hidden, true);
  assert.match(f.nodes.get('result').textContent, /VICTOIRE.*sauvegardé/);
  assert.equal(f.ui.finish(result), false); assert.equal(f.state.commits, 1); assert.equal(f.state.value.credits, before + 100);
});
test('V96 UI refuses terminal results for a closed or foreign save owner', t => {
  const transaction = ticket(), f = harness(t, { progress: transaction.state }); f.ui.open(); const result = validResult(transaction.config);
  f.state.canCommit = false; assert.equal(f.ui.finish(result), false); assert.equal(f.state.commits, 0);
  f.state.canCommit = true; f.ui.close(); assert.equal(f.ui.finish(result), false); assert.equal(f.state.commits, 0); assert.ok(f.state.value.pending);
});
test('V96 UI late sprite callbacks after close never restart listeners or write progression', async t => {
  const transaction = ticket(), f = harness(t, { progress: transaction.state, delayedImages: true }); f.ui.open();
  const loading = f.ui.launch(transaction.config); assert.equal(f.ui.loading, true); f.ui.close();
  for (const image of f.images) image.onload?.();
  assert.equal(await loading, false); assert.equal(f.ui.loading, false); assert.equal(f.ui.runtime, null); assert.equal(f.state.commits, 0); assert.equal(f.frames.size, 0);
  assert.ok([...f.win.listeners.values()].every(set => set.size === 0));
});
test('V96 UI changing owner while images load leaves no stopped-but-loading zombie runtime', async t => {
  const transaction = ticket(), f = harness(t, { progress: transaction.state, delayedImages: true }); f.ui.open();
  const loading = f.ui.launch(transaction.config); f.state.canCommit = false; for (const image of f.images) image.onload?.();
  assert.equal(await loading, false); assert.equal(f.ui.loading, false); assert.equal(f.ui.runtime, null); assert.equal(f.frames.size, 0); assert.equal(f.state.commits, 0);
});
test('V96 UI Arachnoid palette selection updates the dedicated thumbnail without changing identity', t => {
  const f = harness(t); f.ui.open(); f.ui.selected = 'arachnoid'; f.ui.render();
  assert.equal(f.ui.form.elements.playerVariant.disabled, false);
  f.ui.form.elements.playerVariant.value = 'purple'; f.ui.form.elements.playerVariant.dispatch('change');
  assert.match(f.nodes.get('roster').innerHTML, /arachnoid-purple-v95\.png/); assert.equal(f.ui.selected, 'arachnoid');
});
test('V96 UI prevents a second launch while the first duel is loading', async t => {
  const transaction = ticket(), f = harness(t, { progress: transaction.state, delayedImages: true }); f.ui.open();
  const first = f.ui.launch(transaction.config); assert.equal(await f.ui.launch(transaction.config), false); assert.equal(f.images.length, 2);
  for (const image of f.images) image.onload?.(); assert.equal(await first, true); assert.equal(f.frames.size, 1);
});
test('V96 UI abandonment consumes the pending ticket without rewarding or erasing campaign data', t => {
  const transaction = ticket(), f = harness(t, { progress: transaction.state }); f.ui.open();
  f.nodes.get('abandon').onclick(); assert.equal(f.state.value.pending, null); assert.equal(f.state.value.credits, 150);
  assert.equal(f.state.value.ledger[0].winner, 'abandoned'); assert.equal(f.state.value.ledger[0].credits, 0); assert.equal(f.state.commits, 1);
});
