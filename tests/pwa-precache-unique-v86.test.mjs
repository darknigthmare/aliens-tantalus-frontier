import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('service worker precache has no duplicate request keys', async () => {
  const context = { self: { location: { origin: 'https://example.test' }, addEventListener() {} } };
  vm.runInNewContext(await readFile('sw.js', 'utf8') + ';globalThis.shell = SHELL;', context);
  assert.equal(context.shell.length, new Set(context.shell).size, 'Cache.addAll rejects duplicate requests');
  assert.equal(context.shell.filter(path => path === '/src/game-final-runtime.js').length, 1);
});
