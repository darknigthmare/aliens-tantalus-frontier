import test from 'node:test';
import assert from 'node:assert/strict';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';
import { XENO_TRIALS_RIGS_V154 } from '../src/xeno-trials-rig-v154.js';
import { createXenoTrialsProgressV96, beginXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';

function target(props = {}) {
  const handlers = new Map();
  return Object.assign({ addEventListener(type, fn) { if (!handlers.has(type)) handlers.set(type, new Set()); handlers.get(type).add(fn); },
    removeEventListener(type, fn) { handlers.get(type)?.delete(fn); },
    emit(type, event = {}) { for (const fn of [...handlers.get(type) || []]) fn({ preventDefault() {}, stopPropagation() {}, ...event }); } }, props);
}

async function nativeExitHost({ exit = true } = {}) {
  const document = target({ hidden: false, hasFocus: () => true }), window = target();
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ measureText: t => ({ width: String(t).length * 7 }), createLinearGradient: () => gradient },
    { get: (value, key) => value[key] || (() => {}) });
  const canvas = target({ tagName: 'CANVAS', width: 1000, height: 560, setAttribute() {}, getContext: () => ctx,
    closest: () => null, focus() { document.activeElement = this; document.emit('focusin', { target: this }); } });
  const queue = new Map(), results = [];
  let serial = 0, time = 0, ui, returned = 0;
  // Declared roster unlock and1HP runtime fixture; the ticket, settlement and
  // button transactions use the production progress/UI functions.
  let progress = createXenoTrialsProgressV96();
  progress.unlocked.push('import-game-dd-wy-commando');
  const started = beginXenoTrialsV96(progress, { playerId: 'import-game-dd-wy-commando', opponentId: 'prowler',
    difficulty: 'hard', roundSeconds: 30 });
  assert.equal(started.applied, true); progress = started.state;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window, document,
    config: { ...started.config, rulesV119: { initialHp: 1 } },
    loadImage: async path => {
      const rig = XENO_TRIALS_RIGS_V154.find(r => r.path === path);
      return { naturalWidth: rig?.sourceWidth || 1000, naturalHeight: rig?.sourceHeight || 560, complete: true };
    }, requestAnimationFrame: fn => { queue.set(++serial, fn); return serial; }, cancelAnimationFrame: id => queue.delete(id),
    onState: s => ui?.updateMatch(s), onResult: r => { results.push(structuredClone(r)); assert.equal(ui.finish(r), true); } });
  const elements = new Map([['canvas', canvas]]), attributes = new Map();
  const element = key => {
    if (!elements.has(key)) elements.set(key, target({ tagName: 'BUTTON', hidden: false, disabled: false, dataset: { xt: key },
      setAttribute() {}, contains(node) { return node === this; },
      closest(selector) { return selector.split(',').some(s => s.trim() === `[data-xt="${key}"]`) ? this : null; },
      focus() { document.activeElement = this; document.emit('focusin', { target: this }); } }));
    return elements.get(key);
  };
  element('form').elements = new Proxy({}, { get: (_, key) => element(`form-${String(key)}`) });
  const root = target({ ownerDocument: document, removeAttribute: k => attributes.delete(k),
    getAttribute: k => attributes.get(k), setAttribute: (k, value) => attributes.set(k, value),
    querySelector: selector => element(selector.match(/data-xt="([^"]+)"/)?.[1] || 'super-control') });
  document.documentElement = { classList: { remove() {} } };
  class MinimalUi extends XenoTrialsUiV96 { updateOpponents() {} restorePendingSelection() {} render() {} }
  ui = new MinimalUi({ root, getProgress: () => progress, canCommit: () => true,
    onCommit(next) { progress = next; }, onReturn() { returned++; } });
  ui.active = true; ui.runtime = runtime;
  assert.equal(await runtime.start(), true); canvas.focus();
  const frames = (count = 1) => { for (let n = 0; n < count; n++) {
    time += 100; const callbacks = [...queue.values()]; queue.clear(); callbacks.forEach(fn => fn(time));
  } };
  for (let frame = 0; frame < 5000; frame++) {
    const state = runtime.getState();
    if (exit ? state.exitV157 : state.phase === 'active' && !state.presentation.blocksSimulation) break;
    frames();
  }
  if (exit) assert.equal(runtime.getState().exitV157?.phase, 'playing');
  else assert.equal(runtime.getState().phase, 'active');
  return { runtime, document, window, canvas, element, results, ui, frames, returned: () => returned,
    progress: () => structuredClone(progress) };
}

test('keyboard focus preserves the native return action so Enter can close an actual exit without a modal stealing focus', async () => {
  const h = await nativeExitHost(), button = h.element('return'), result = structuredClone(h.results);
  button.focus();
  assert.equal(h.runtime.getState().paused, false); assert.equal(h.document.activeElement, button);
  h.window.emit('keydown', { target: button, code: 'Enter' });
  // The DOM host supplies the button's standard Enter default activation; the
  // actual production onclick then owns close/stop/navigation and cleanup.
  if (h.document.activeElement === button) button.onclick();
  assert.equal(h.ui.runtime, null); assert.equal(h.returned(), 1);
  assert.deepEqual(h.results, result); assert.equal(h.runtime.getState().exitV157, null);
});

test('a real primary-pointer return gesture keeps its target through focus until the native click closes the exit', async () => {
  const h = await nativeExitHost(), button = h.element('return');
  const result = structuredClone(h.results);
  h.document.emit('pointerdown', { target: button, button: 0, pointerId: 7, isPrimary: true });
  button.focus();
  assert.equal(h.runtime.getState().paused, false, 'pointer focus cannot insert the pause modal over its own pending return click');
  assert.equal(h.document.activeElement, button);
  h.document.emit('pointerup', { target: button, button: 0, pointerId: 7, isPrimary: true });
  button.onclick();
  assert.equal(h.ui.runtime, null); assert.equal(h.ui.active, false); assert.equal(h.returned(), 1);
  assert.equal(h.runtime.getState().exitV157, null); assert.deepEqual(h.results, result);
});

test('ordinary menu fields, unrelated buttons, hidden documents and blur keep their native pause ownership', async () => {
  for (const kind of ['field', 'other-menu', 'hidden', 'blur']) {
    const h = await nativeExitHost();
    if (kind === 'field' || kind === 'other-menu') h.element(kind).focus();
    if (kind === 'hidden') { h.document.hidden = true; h.document.emit('visibilitychange'); }
    if (kind === 'blur') h.window.emit('blur');
    assert.equal(h.runtime.getState().paused, true, kind);
    if (kind !== 'hidden') assert.equal(h.document.activeElement, h.element('resume-overlay'), kind);
    assert.equal(h.results.length, 1); h.ui.close();
  }
});

test('focusing return releases held combat movement and requires a real key release before rearming it', async () => {
  const h = await nativeExitHost({ exit: false });
  h.window.emit('keydown', { target: h.canvas, code: 'ArrowRight' }); h.frames();
  assert.equal(h.runtime.getState().fighters[0].previousInput.right, true);
  h.element('return').focus();
  assert.equal(h.runtime.getState().paused, false);
  assert.equal(h.runtime.getState().fighters[0].previousInput.right, false);
  h.window.emit('keydown', { target: h.canvas, code: 'ArrowRight', repeat: true }); h.frames();
  assert.equal(h.runtime.getState().fighters[0].previousInput.right, false);
  h.window.emit('keyup', { target: h.canvas, code: 'ArrowRight' });
  h.window.emit('keydown', { target: h.canvas, code: 'ArrowRight', repeat: false }); h.frames();
  assert.equal(h.runtime.getState().fighters[0].previousInput.right, true); h.ui.close();
});

test('a paused unfinished ticket keeps its real abandonment action and both modal focus boundaries', async () => {
  const h = await nativeExitHost({ exit: false }), initial = h.progress();
  h.runtime.pause();
  const overlay = h.element('pause-overlay'), resume = h.element('resume-overlay'), abandon = h.element('abandon-overlay');
  assert.equal(abandon.hidden, false); assert.equal(abandon.disabled, false);
  assert.equal(h.document.activeElement, resume);
  let prevented = 0;
  overlay.emit('keydown', { code: 'Tab', shiftKey: true, preventDefault() { prevented++; } });
  assert.equal(h.document.activeElement, abandon);
  overlay.emit('keydown', { code: 'Tab', shiftKey: false, preventDefault() { prevented++; } });
  assert.equal(h.document.activeElement, resume); assert.equal(prevented, 2);
  abandon.onclick();
  assert.equal(h.ui.runtime, null); assert.equal(h.progress().pending, null);
  assert.equal(h.progress().credits, initial.credits); assert.equal(h.progress().xp, initial.xp);
  assert.equal(h.progress().ledger.at(-1).winner, 'abandoned'); assert.equal(h.results.length, 0);
  h.ui.close();
});

test('a paused completed outro offers no impossible abandonment and keeps Tab on the remaining resume action', async () => {
  const h = await nativeExitHost(), settled = h.progress(), result = structuredClone(h.results);
  assert.equal(settled.pending, null); assert.equal(settled.ledger.length, 1);
  assert.notEqual(settled.ledger[0].winner, 'abandoned');
  h.runtime.pause();
  const overlay = h.element('pause-overlay'), resume = h.element('resume-overlay'), abandon = h.element('abandon-overlay');
  assert.equal(overlay.hidden, false); assert.equal(abandon.hidden, true); assert.equal(abandon.disabled, true);
  const frozen = h.runtime.getState();
  for (const shiftKey of [false, true]) {
    let prevented = false;
    overlay.emit('keydown', { code: 'Tab', shiftKey, preventDefault() { prevented = true; } });
    assert.equal(prevented, true); assert.equal(h.document.activeElement, resume);
  }
  // A previously queued handler cannot overwrite the completed result either.
  abandon.onclick();
  assert.equal(h.ui.runtime, h.runtime); assert.deepEqual(h.progress(), settled);
  h.frames(5); assert.deepEqual(h.runtime.getState(), frozen);
  resume.onclick(); h.frames(2);
  assert.equal(h.runtime.getState().paused, false); assert.deepEqual(h.progress(), settled);
  assert.deepEqual(h.results, result); h.ui.close();
});
