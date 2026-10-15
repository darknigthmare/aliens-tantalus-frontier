import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bindHubControlV133 } from '../src/hub-control-bindings-v133.js';

function fixture() {
  const button = Object.assign(new EventTarget(), { dataset: { hubControl: 'up' },
    disabled: false, hidden: false, setPointerCapture(id) { this.captured = id; } });
  const windowRef = new EventTarget(), documentRef = Object.assign(new EventTarget(), { hidden: false });
  const actions = []; let eligible = true;
  const binding = bindHubControlV133(button, { windowRef, documentRef, canActivate: () => eligible,
    activate: control => actions.push(['press', control]), release: control => actions.push(['release', control]) });
  const dispatch = (type, fields = {}, target = button) => {
    const event = new Event(type, { cancelable: true }); Object.assign(event, fields); target.dispatchEvent(event); return event;
  };
  return { button, windowRef, documentRef, actions, binding, dispatch, eligible(value) { eligible = value; } };
}

test('two fingers share one press and cancelling one cannot release the other', () => {
  const f = fixture(); f.dispatch('pointerdown', { pointerId: 1, button: 0 });
  f.dispatch('pointerdown', { pointerId: 2, button: 0 }); f.dispatch('pointercancel', { pointerId: 1 });
  assert.deepEqual(f.actions, [['press', 'up']]); assert.equal(f.button.captured, 2);
  f.dispatch('pointerup', { pointerId: 2 }); f.dispatch('lostpointercapture', { pointerId: 2 });
  assert.deepEqual(f.actions, [['press', 'up'], ['release', 'up']]);
});
test('focused Enter and Space are held commands; native click and repeat do not duplicate them', () => {
  for (const code of ['Enter', 'Space']) {
    const f = fixture(); assert.equal(f.dispatch('keydown', { code, repeat: false }).defaultPrevented, true);
    f.dispatch('keydown', { code, repeat: true }); f.dispatch('click', { detail: 0 });
    assert.deepEqual(f.actions, [['press', 'up']]);
    assert.equal(f.dispatch('keyup', { code }).defaultPrevented, true);
    assert.deepEqual(f.actions, [['press', 'up'], ['release', 'up']]);
  }
});
test('a screen reader click delivers one tap and a pointer click adds no duplicate', () => {
  const f = fixture(); f.dispatch('click', { detail: 0 });
  assert.deepEqual(f.actions, [['press', 'up'], ['release', 'up']]);
  f.dispatch('click', { detail: 1 }); assert.equal(f.actions.length, 2);
});
test('losing focus releases a keyboard press without cancelling a captured finger', () => {
  const f = fixture(); f.dispatch('keydown', { code: 'Space' }); f.dispatch('pointerdown', { pointerId: 1 });
  f.dispatch('blur'); assert.deepEqual(f.actions, [['press', 'up']]);
  f.dispatch('pointerup', { pointerId: 1 }); assert.equal(f.actions.at(-1)[0], 'release');
});
test('window blur, hidden document and explicit view teardown clear a hold only once', () => {
  for (const cleanup of ['blur', 'visibility', 'view']) {
    const f = fixture(); f.dispatch('pointerdown', { pointerId: 1 });
    if (cleanup === 'blur') f.dispatch('blur', {}, f.windowRef);
    if (cleanup === 'visibility') { f.documentRef.hidden = true; f.dispatch('visibilitychange', {}, f.documentRef); }
    if (cleanup === 'view') f.binding.clear();
    f.dispatch('pointerup', { pointerId: 1 }); assert.deepEqual(f.actions, [['press', 'up'], ['release', 'up']]);
  }
});
test('paused, hidden, disabled and secondary-button input cannot start a command', () => {
  const f = fixture(); f.eligible(false); f.dispatch('pointerdown', { pointerId: 1 });
  f.dispatch('keydown', { code: 'Enter' }); f.dispatch('click', { detail: 0 });
  f.eligible(true); f.button.hidden = true; f.dispatch('pointerdown', { pointerId: 2 });
  f.button.hidden = false; f.button.disabled = true; f.dispatch('keydown', { code: 'Space' });
  f.button.disabled = false; f.dispatch('pointerdown', { pointerId: 3, button: 2 });
  assert.deepEqual(f.actions, []);
});
test('destroy releases its hold and detaches every input handler', () => {
  const f = fixture(); f.dispatch('pointerdown', { pointerId: 1 }); f.binding.destroy();
  f.dispatch('pointerdown', { pointerId: 2 }); f.dispatch('keydown', { code: 'Enter' });
  f.dispatch('click', { detail: 0 }); f.dispatch('blur', {}, f.windowRef);
  assert.deepEqual(f.actions, [['press', 'up'], ['release', 'up']]);
});
