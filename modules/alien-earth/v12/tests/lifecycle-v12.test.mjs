import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { EarthEngine, SAVE_KEY } from '../src/alien-earth-core.js';
import { persistEarthProgress } from '../src/alien-earth-storage-v2.js';

const source = await readFile(new URL('../src/alien-earth-ui.js', import.meta.url), 'utf8');
const start = source.indexOf('function save(){');
const end = source.indexOf('\nfunction ', start + 1);
assert.ok(start >= 0 && end > start);
const listener = source.split('\n').find(line => line.startsWith("document.addEventListener('visibilitychange'"));
assert.ok(listener);
function harness(raw, { started = false, protectSave = false, dead = false } = {}) {
  const values = new Map(raw === null ? [] : [[SAVE_KEY, raw]]), writes = [];
  const storage = { getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); writes.push([key, value]); } };
  const engine = new EarthEngine(); if (dead) engine.player.hp = 0;
  const listeners = new Map(), context = vm.createContext({
    engine, started, protectSave, saved: null, lastStoredRaw: raw, saveError: '', modal: 'title',
    keys: new Set(['ArrowRight']), persistEarthProgress, localStorage: storage,
    $: () => ({ textContent: '' }), notify() {}, showPause() {},
    document: { hidden: true, addEventListener: (type, callback) => listeners.set(type, callback) },
  });
  vm.runInContext(source.slice(start, end) + '\n' + listener, context);
  return { context, values, writes, hidden: () => listeners.get('visibilitychange')() };
}
test('title visibility preserves an existing Earth save byte for byte', () => {
  const old = new EarthEngine(); old.player.x += 101; old.state.playSeconds = 215;
  const raw = JSON.stringify(old.snapshot()), h = harness(raw);
  h.hidden(); assert.equal(h.values.get(SAVE_KEY), raw); assert.equal(h.writes.length, 0);
  assert.equal(h.context.keys.size, 0);
});
test('a first title does not write an empty campaign when hidden', () => {
  const h = harness(null); h.hidden(); assert.equal(h.values.has(SAVE_KEY), false); assert.equal(h.writes.length, 0);
});
test('visibility stores a started Earth campaign through the real persistence API', () => {
  const h = harness(null, { started: true }); h.context.engine.player.x += 44; h.hidden();
  assert.equal(h.writes.length, 1); assert.equal(h.values.get(SAVE_KEY), JSON.stringify(h.context.engine.snapshot()));
});
test('protected and dead campaigns remain unwritten', () => {
  for (const flags of [{ protectSave: true }, { dead: true }]) {
    const h = harness(null, { started: true, ...flags }); h.hidden(); assert.equal(h.writes.length, 0);
  }
});
