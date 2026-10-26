import test from 'node:test';
import assert from 'node:assert/strict';
import { HubGame } from '../src/hub-game.js';

function withBoundInput(run) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'addEventListener');
  const listeners = new Map();
  globalThis.addEventListener = (type, callback) => listeners.set(type, callback);
  const host = { running: true, keys: new Set(), canvas: { addEventListener() {} },
    interact() {}, useLift() {}, setDepthPresentationV116() {} };
  try {
    HubGame.prototype.bind.call(host);
    return run(host, listeners);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'addEventListener', previous);
    else delete globalThis.addEventListener;
  }
}
function event(code, repeat = false) {
  return { code, repeat, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
}

test('the actual hub key handler consumes E before interaction can focus an editable dialog', () => {
  withBoundInput((host, handlers) => {
    const input = event('KeyE');
    let opened = false;
    host.interact = () => { assert.equal(input.defaultPrevented, true); opened = true; host.running = false; };
    handlers.get('keydown')(input);
    assert.equal(opened, true);
    assert.equal(input.defaultPrevented, true);
  });
});

test('a stopped hub leaves normal text input and unrelated keys untouched', () => {
  withBoundInput((host, handlers) => {
    host.running = false;
    host.interact = () => assert.fail('A modal owns input while the hub is stopped.');
    const input = event('KeyE');
    handlers.get('keydown')(input);
    assert.equal(input.defaultPrevented, false);
    assert.equal(host.keys.size, 0);
  });
});

test('held interaction is not replayed and movement key ownership still ends at keyup or blur', () => {
  withBoundInput((host, handlers) => {
    let count = 0;
    host.interact = () => count++;
    handlers.get('keydown')(event('KeyE'));
    handlers.get('keydown')(event('KeyE', true));
    assert.equal(count, 1);
    handlers.get('keyup')(event('KeyE'));
    assert.equal(host.keys.has('KeyE'), false);
    handlers.get('keydown')(event('KeyD'));
    assert.equal(host.keys.has('KeyD'), true);
    handlers.get('blur')();
    assert.equal(host.keys.size, 0);
  });
});
