import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { TITLE_SCENE_READY_ASSETS_V79 } from '../src/title-scene-assets-v79.js';
import {
  CRITICAL_RUNTIME_PATHS_V79,
  PRIVATE_V79_PREFIXES,
  PRIVATE_V79_PROOF_PATHS,
  PRODUCTION_CACHE_V79,
  PRODUCTION_REPORT_PATH_V79,
  PRODUCTION_VERSION_V79,
  TITLE_SCENE_RUNTIME_ASSET_PATHS_V79,
  resolveProductionCommitV79,
  sha256V79
} from '../scripts/verify-production-v79.mjs';

test('le vérificateur de production porte la version, le cache et le rapport V79 exacts', () => {
  assert.equal(PRODUCTION_VERSION_V79, '79.0.0');
  assert.equal(PRODUCTION_CACHE_V79, 'atf-v79-modular-title-shell-1');
  assert.equal(PRODUCTION_REPORT_PATH_V79, 'docs/references/v79-release-qa/production-http.json');
  assert.equal(sha256V79(Buffer.from('Tantalus')), '48dcc03bb5a4c53d27db4daa0aeb3def2b5ef78b5ae3afd0a2f2d82d5eac4206');
});

test('les fichiers critiques couvrent le shell, la sauvegarde et les trois modules titre V79 sans doublon', () => {
  assert.equal(new Set(CRITICAL_RUNTIME_PATHS_V79).size, CRITICAL_RUNTIME_PATHS_V79.length);
  for (const path of [
    'index.html',
    'sw.js',
    'title-scene-v79.css',
    'src/app.js',
    'src/content.js',
    'src/save.js',
    'src/title-scene-v79.js',
    'src/title-scene-catalog-v79.js',
    'src/title-scene-assets-v79.js'
  ]) assert.ok(CRITICAL_RUNTIME_PATHS_V79.includes(path), path);
});

test('les 18 PNG exposés correspondent exactement au registre accepté et aucune preuve privée ne se mélange au runtime', () => {
  assert.equal(TITLE_SCENE_READY_ASSETS_V79.length, 18);
  assert.deepEqual(TITLE_SCENE_RUNTIME_ASSET_PATHS_V79, TITLE_SCENE_READY_ASSETS_V79.map((asset) => asset.src));
  assert.equal(new Set(TITLE_SCENE_RUNTIME_ASSET_PATHS_V79).size, 18);
  assert.equal(TITLE_SCENE_RUNTIME_ASSET_PATHS_V79.every((path) => /^\/assets\/openai\/ui\/title\/v79\/.+\.png$/u.test(path)), true);
  assert.equal(PRIVATE_V79_PREFIXES.every((prefix) => prefix.startsWith('docs/references/v79-')), true);
  assert.equal(PRIVATE_V79_PROOF_PATHS.some((path) => path.includes('/source-receipts/')), true);
  assert.equal(PRIVATE_V79_PROOF_PATHS.some((path) => path.includes('/rejected/')), true);
  assert.equal(PRIVATE_V79_PROOF_PATHS.some((path) => path.endsWith('/title-browser-report.json')), true);
  assert.equal(PRIVATE_V79_PROOF_PATHS.some((path) => path.endsWith('/production-http.json')), true);
  assert.equal(PRIVATE_V79_PROOF_PATHS.some((path) => TITLE_SCENE_RUNTIME_ASSET_PATHS_V79.includes(path)), false);
});

test('le contrat exige git show/ls-tree, HTTP 200/404 et un commit résolu en SHA complet', async () => {
  const [source, packageFile] = await Promise.all([
    readFile('scripts/verify-production-v79.mjs', 'utf8'),
    readFile('package.json', 'utf8').then(JSON.parse)
  ]);
  assert.equal(packageFile.scripts['verify:production:v79'], 'node scripts/verify-production-v79.mjs');
  assert.match(source, /\['show', `\$\{commit\}:\$\{path\}`\]/u);
  assert.match(source, /\['ls-tree', '-r', '--name-only'/u);
  assert.match(source, /assert\.equal\(remote\.response\.status, 200/u);
  assert.match(source, /assert\.equal\(remote\.response\.status, 404/u);
  assert.match(source, /assert\.equal\(remoteHash, commitHash/u);
  assert.match(source, /assert\.equal\(sha256V79\(remote\.bytes\), asset\.sha256/u);

  const full = '1234567890abcdef1234567890abcdef12345678';
  const calls = [];
  const spawn = (command, args) => {
    calls.push({ command, args });
    return { status: 0, stdout: full + '\n', stderr: '' };
  };
  assert.equal(resolveProductionCommitV79('1234567', spawn), full);
  assert.deepEqual(calls, [{
    command: 'git',
    args: ['rev-parse', '--verify', '1234567^{commit}']
  }]);
  assert.throws(() => resolveProductionCommitV79('../HEAD', spawn), /exact deployed content commit/u);
});
