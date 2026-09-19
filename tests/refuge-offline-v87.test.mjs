import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import vm from 'node:vm';
import { REFUGE_ART_V87 } from '../src/refuge-art-v87.js';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const origin = 'https://refuge-offline.example';
const runtimeFiles = [
  '/src/refuge-personal-state-v87.js', '/src/refuge-controller-v87.js', '/src/refuge-ui-v87.js',
  '/src/refuge-save-v87.js', '/src/refuge-room-v87.js', '/src/refuge-art-v87.js', '/src/refuge-v87.css'
];
const sharedFloor = '/assets/openai/metroidvania/props/floor-segment.png';
const pngPaths = [...new Set(Object.values(REFUGE_ART_V87).map(art => art.path)), sharedFloor];

// Evaluate the real CORE -> SHELL filter, but never invoke a worker lifecycle,
// network request or cache operation. This is not an installed-SW/browser proof.
function inspectWorker() {
  const listeners = new Map();
  const effects = [];
  const forbidden = name => () => { effects.push(name); throw new Error(`Unexpected side effect: ${name}`); };
  const context = vm.createContext({ URL, Response, Request, Headers,
    fetch: forbidden('fetch'),
    caches: { open: forbidden('caches.open'), keys: forbidden('caches.keys'), delete: forbidden('caches.delete'), match: forbidden('caches.match') },
    self: { location: { origin }, skipWaiting: forbidden('skipWaiting'),
      clients: { claim: forbidden('clients.claim') },
      addEventListener(name, callback) {
        assert.equal(typeof callback, 'function');
        assert.equal(listeners.has(name), false, `duplicate worker listener ${name}`);
        listeners.set(name, callback);
      }
    }
  });
  vm.runInContext(source, context, { filename: 'sw.js', timeout: 1000 });
  const result = vm.runInContext('({ core: [...CORE], shell: [...SHELL], frozen: Object.isFrozen(SHELL) })', context, { timeout: 1000 });
  return { core: Array.from(result.core), shell: Array.from(result.shell), frozen: result.frozen, listeners, effects };
}

function repoFile(webPath) {
  assert.match(webPath, /^\/(?:src|assets)\//);
  assert.doesNotMatch(webPath, /(?:^|\/)\.\.(?:\/|$)|[\\?#%]/);
  return new URL(`..${webPath}`, import.meta.url);
}

function assertPrecached(worker, webPath) {
  assert.equal(worker.core.filter(item => item === webPath).length, 1, `${webPath} exactly once in CORE`);
  assert.equal(worker.shell.filter(item => item === webPath).length, 1, `${webPath} exactly once in computed SHELL`);
}

test('REFUGE offline: inspecte le vrai worker sans installation ni accès réseau/cache', () => {
  const worker = inspectWorker();
  assert.deepEqual([...worker.listeners.keys()].sort(), ['activate', 'fetch', 'install', 'message']);
  assert.equal(worker.frozen, true);
  assert.ok(worker.core.length > worker.shell.length, 'SHELL is a filtered CORE, not the full manifest');
  assert.deepEqual(worker.effects, []);
});

test('REFUGE offline: les six modules et le CSS existent et appartiennent au SHELL calculé', async () => {
  const worker = inspectWorker();
  assert.equal(runtimeFiles.filter(path => path.endsWith('.js')).length, 6);
  assert.equal(runtimeFiles.filter(path => path.endsWith('.css')).length, 1);
  for (const path of runtimeFiles) {
    assertPrecached(worker, path);
    const info = await stat(repoFile(path));
    assert.equal(info.isFile(), true, path);
    assert.ok(info.size > 0, path);
  }
  assert.deepEqual(worker.effects, []);
});

test('REFUGE offline: les deux atlas et six dépendances PNG, sol inclus, sont réellement précachés', async () => {
  const worker = inspectWorker();
  assert.equal(pngPaths.length, 8);
  assert.equal(new Set(pngPaths).size, 8);
  assert.equal(pngPaths.filter(path => path.startsWith('/assets/openai/refuge/v87/')).length, 2);
  assert.ok(pngPaths.includes(sharedFloor));
  for (const path of pngPaths) {
    assertPrecached(worker, path);
    const bytes = await readFile(repoFile(path));
    assert.ok(bytes.length >= 24, path);
    assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), `${path} PNG signature`);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    assert.ok(width > 0 && height > 0, `${path} PNG dimensions`);
    for (const art of Object.values(REFUGE_ART_V87).filter(art => art.path === path)) {
      assert.equal(width, art.width, `${path} declared width`);
      assert.equal(height, art.height, `${path} declared height`);
    }
  }
  assert.deepEqual(worker.effects, []);
});

test('REFUGE offline: aucun chemin privé, provenance, photo ou export personnel dans le SHELL', () => {
  const worker = inspectWorker();
  assert.equal(worker.shell.includes('/docs/references/v87-refuge-generation.json'), false);
  for (const path of worker.shell) {
    assert.equal(typeof path, 'string');
    assert.ok(path.startsWith('/') && !path.startsWith('//'), `${path} same-origin root-relative`);
    assert.doesNotMatch(path, /(?:^|\/)(?:docs|privateoutput|tests|generated_images|\.git|\.codex|\.tmp)(?:\/|$)/i);
    assert.doesNotMatch(path, /(?:^|\/)\.\.(?:\/|$)|[\\?#%]|data:|file:|https?:|[a-z]:/i);
    assert.doesNotMatch(path, /atf\.private\.refuge|photoDataUrl|dedication/i);
  }
  assert.deepEqual(worker.effects, []);
});
