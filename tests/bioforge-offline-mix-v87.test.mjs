import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import vm from 'node:vm';
import { BIOFORGE_ASSET_LIST_V80 } from '../src/bioforge-assets-v80.js';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const modules = ['/src/bioforge-session-v80.js', '/src/bioforge-runtime-v80.js', '/src/bioforge-ui-v80.js',
  '/src/bioforge-physical-state-v87.js', '/src/bioforge-level-v80.js', '/src/bioforge-assets-v80.js',
  '/src/tactical-reload-v77.js', '/src/enemy-ovomorph-cycle-v66.js', '/bioforge-v80.css'];
function workerShell() {
  const effects = [], forbidden = name => () => { effects.push(name); throw new Error(name); };
  const sandbox = vm.createContext({ URL, Response, Request, Headers, fetch: forbidden('network'),
    caches: { open: forbidden('cache'), keys: forbidden('cache'), match: forbidden('cache'), delete: forbidden('cache') },
    self: { location: { origin: 'https://bioforge-offline.example' }, addEventListener() {},
      skipWaiting: forbidden('activation'), clients: { claim: forbidden('clients') } } });
  vm.runInContext(source, sandbox, { timeout: 1000 });
  const result = vm.runInContext('({core:[...CORE],shell:[...SHELL]})', sandbox);
  assert.deepEqual(effects, []);
  return { core: [...result.core], shell: [...result.shell] };
}

test('BIOFORGE mixed session and physical resume modules are in actual computed offline SHELL', async () => {
  const worker = workerShell();
  for (const path of [...modules, ...BIOFORGE_ASSET_LIST_V80.map(asset => asset.src)]) {
    assert.equal(worker.core.filter(item => item === path).length, 1, path);
    assert.equal(worker.shell.filter(item => item === path).length, 1, path);
    assert.equal((await stat(new URL(`..${path}`, import.meta.url))).isFile(), true, path);
  }
});

test('BIOFORGE offline excludes private saves, transcripts, test fixtures and generated provenance', () => {
  for (const path of workerShell().shell) {
    assert.doesNotMatch(path, /(?:^|\/)(?:docs|tests|privateoutput|generated_images|\.git|\.codex)(?:\/|$)/i);
    assert.doesNotMatch(path, /(?:^|\/)\.\.(?:\/|$)|data:|file:|https?:|[a-z]:/i);
  }
});
