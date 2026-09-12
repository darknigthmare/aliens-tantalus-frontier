import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

import { BIOFORGE_ASSET_LIST_V80 } from '../src/bioforge-assets-v80.js';
import { PROVING_GROUND_ASSET_LIST_V81 } from '../src/proving-ground-assets-v81.js';
import { V81_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v81.js';
import { PLAYER_VISUAL_ASSETS_V81 } from '../src/player-visual-contract-v81.js';
import { spriteImageDimensions } from './helpers/sprite-image-dimensions.mjs';

const ICONS = Object.freeze([
  Object.freeze({ src: '/assets/openai/pwa/tantalus-frontier-icon-192-v68.png', size: 192, purpose: 'any', bytes: 45917, hash: '9560b727c011e7d49de746a5994af342e2a6f3ab8dc58aa92bf680cefbe7e689' }),
  Object.freeze({ src: '/assets/openai/pwa/tantalus-frontier-icon-512-v68.png', size: 512, purpose: 'any', bytes: 291254, hash: '17fcfc3707126d82aa3eb968b87bb722b7fbabf97f12146c17a31b39373d015e' }),
  Object.freeze({ src: '/assets/openai/pwa/tantalus-frontier-maskable-192-v68.png', size: 192, purpose: 'maskable', bytes: 45917, hash: '9560b727c011e7d49de746a5994af342e2a6f3ab8dc58aa92bf680cefbe7e689' }),
  Object.freeze({ src: '/assets/openai/pwa/tantalus-frontier-maskable-512-v68.png', size: 512, purpose: 'maskable', bytes: 291254, hash: '17fcfc3707126d82aa3eb968b87bb722b7fbabf97f12146c17a31b39373d015e' })
]);

const SOURCE = Object.freeze({
  path: 'assets/openai/pwa/tantalus-frontier-app-icon-source-v68.png',
  size: 1254,
  bytes: 1642052,
  hash: '288384c4f88cd862eec2abfa486640af9ebbd0f6d140f0b7dc164b7ff0c2a41e'
});
const localPath = (webPath) => webPath.replace(/^\//u, '');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const evaluatePrecacheShell = (worker) => {
  const sandbox = {
    self: {
      location: { origin: 'https://tantalus.test' },
      addEventListener() {},
      skipWaiting() {},
      clients: { claim() {} }
    }
  };
  runInNewContext(`${worker}\nglobalThis.__ATF_SHELL__ = [...SHELL];`, sandbox);
  return sandbox.__ATF_SHELL__;
};

test('le manifeste V68 déclare les quatre icônes PNG any et maskable exactes', async () => {
  const manifest = JSON.parse(await readFile('manifest.webmanifest', 'utf8'));
  assert.equal(manifest.icons.length, 4);
  assert.equal(new Set(manifest.icons.map(({ src }) => src)).size, 4);
  assert.deepEqual(
    manifest.icons.map(({ src, sizes, type, purpose }) => ({ src, sizes, type, purpose })),
    ICONS.map((icon) => ({
      src: icon.src,
      sizes: `${icon.size}x${icon.size}`,
      type: 'image/png',
      purpose: icon.purpose
    }))
  );
  assert.deepEqual(manifest.icons.filter(({ purpose }) => purpose === 'any').map(({ sizes }) => sizes), ['192x192', '512x512']);
  assert.deepEqual(manifest.icons.filter(({ purpose }) => purpose === 'maskable').map(({ sizes }) => sizes), ['192x192', '512x512']);
  assert.equal(manifest.icons.some(({ src }) => src.endsWith('source-v68.png')), false);
});

test('chaque chemin manifeste pointe vers un PNG RGB opaque aux dimensions et hash attendus', async () => {
  for (const icon of ICONS) {
    const bytes = await readFile(localPath(icon.src));
    assert.deepEqual(spriteImageDimensions(bytes), { width: icon.size, height: icon.size }, icon.src);
    assert.equal(bytes.length, icon.bytes, `${icon.src}: taille`);
    assert.equal(sha256(bytes), icon.hash, `${icon.src}: SHA-256`);
    assert.equal(bytes[24], 8, `${icon.src}: profondeur PNG`);
    assert.equal(bytes[25], 2, `${icon.src}: truecolor RGB opaque requis`);
    assert.equal(bytes[28], 0, `${icon.src}: PNG non entrelacé requis`);
  }

  const source = await readFile(SOURCE.path);
  assert.deepEqual(spriteImageDimensions(source), { width: SOURCE.size, height: SOURCE.size });
  assert.equal(source.length, SOURCE.bytes);
  assert.equal(sha256(source), SOURCE.hash);
});

test('le document HTML expose les favicons et l’icône Apple depuis les exports standard', async () => {
  const html = await readFile('index.html', 'utf8');
  assert.match(html, /<link rel="icon" type="image\/png" sizes="192x192" href="\/assets\/openai\/pwa\/tantalus-frontier-icon-192-v68\.png">/u);
  assert.match(html, /<link rel="icon" type="image\/png" sizes="512x512" href="\/assets\/openai\/pwa\/tantalus-frontier-icon-512-v68\.png">/u);
  assert.match(html, /<link rel="apple-touch-icon" sizes="192x192" href="\/assets\/openai\/pwa\/tantalus-frontier-icon-192-v68\.png">/u);
});

test('le cache V81 conserve les assets runtime acceptés mais exclut le master PWA', async () => {
  const worker = await readFile('sw.js', 'utf8');
  const shell = evaluatePrecacheShell(worker);
  assert.match(worker, /const CACHE = ['"]atf-v81-proving-ground-shell-1['"]/u);
  for (const icon of ICONS) {
    assert.ok(shell.includes(icon.src), `${icon.src} absent du tableau SHELL réellement précaché`);
  }
  assert.equal(shell.includes(`/${SOURCE.path}`), false);
  assert.deepEqual(
    [...shell.filter((path) => path.startsWith('/assets/'))].sort(),
    [
      '/assets/audio/manifest.json',
      ...ICONS.map(({ src }) => src),
      ...BIOFORGE_ASSET_LIST_V80.map(({ src }) => src),
      ...PLAYER_VISUAL_ASSETS_V81.map(({ path }) => path),
      ...PROVING_GROUND_ASSET_LIST_V81.map(({ src }) => src),
      ...V81_READY_ENEMY_PROFILE_ASSETS.map(({ path }) => path)
    ].sort(),
    'seuls les assets runtime explicitement acceptés franchissent le filtre des assets lourds'
  );
});

test('la QA PWA fixe provenance originale, hashes et safe zone sans revendiquer d’asset officiel', async () => {
  const qa = await readFile('docs/V68_PWA_ICON_QA.md', 'utf8');
  for (const { hash } of [...ICONS, SOURCE]) {
    assert.match(qa, new RegExp(hash, 'u'));
  }
  assert.match(qa, /OpenAI ImageGen/u);
  assert.match(qa, /création bitmap originale/u);
  assert.match(qa, /safe zone circulaire de diamètre 80 %/u);
  assert.match(qa, /85,56 %/u);
  assert.match(qa, /Aucun sprite, logo, key art ou autre asset officiel n’a été copié/u);
});
