import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import {
  BIOFORGE_RUNTIME_ASSET_PATHS_V80,
  CRITICAL_RUNTIME_PATHS_V80,
  PRIVATE_V80_PREFIXES,
  PRIVATE_V80_PROOF_PATHS,
  PRODUCTION_CACHE_V80,
  PRODUCTION_REPORT_PATH_V80,
  PRODUCTION_VERSION_V80,
  resolveProductionCommitV80,
  sha256V80
} from '../scripts/verify-production-v80.mjs';
import { BIOFORGE_ASSET_LIST_V80 } from '../src/bioforge-assets-v80.js';

test('le vérificateur de production porte la version, le cache et le rapport V80 exacts', () => {
  assert.equal(PRODUCTION_VERSION_V80, '80.0.0');
  assert.equal(PRODUCTION_CACHE_V80, 'atf-v80-bioforge-shell-1');
  assert.equal(PRODUCTION_REPORT_PATH_V80, 'docs/references/v80-release-qa/production-http.json');
  assert.equal(sha256V80(Buffer.from('Tantalus')), '48dcc03bb5a4c53d27db4daa0aeb3def2b5ef78b5ae3afd0a2f2d82d5eac4206');
});

test('les fichiers critiques couvrent le shell, la sauvegarde et tous les modules BIOFORGE sans doublon', () => {
  assert.equal(new Set(CRITICAL_RUNTIME_PATHS_V80).size, CRITICAL_RUNTIME_PATHS_V80.length);
  for (const path of [
    'index.html', 'sw.js', 'bioforge-v80.css', 'src/app.js', 'src/content.js', 'src/save.js',
    'src/bioforge-assets-v80.js', 'src/bioforge-level-v80.js', 'src/bioforge-runtime-v80.js',
    'src/bioforge-session-v80.js', 'src/bioforge-ui-v80.js'
  ]) assert.ok(CRITICAL_RUNTIME_PATHS_V80.includes(path), path);
});

test('les six PNG runtime correspondent exactement au registre BIOFORGE accepté', () => {
  assert.equal(BIOFORGE_ASSET_LIST_V80.length, 6);
  assert.deepEqual(BIOFORGE_RUNTIME_ASSET_PATHS_V80, BIOFORGE_ASSET_LIST_V80.map((asset) => asset.src));
  assert.equal(new Set(BIOFORGE_RUNTIME_ASSET_PATHS_V80).size, 6);
  assert.equal(new Set(BIOFORGE_ASSET_LIST_V80.map((asset) => asset.id)).size, 6);
  assert.equal(new Set(BIOFORGE_ASSET_LIST_V80.map((asset) => asset.runtimeId)).size, 6);
  assert.equal(BIOFORGE_RUNTIME_ASSET_PATHS_V80.every((path) => /^\/assets\/openai\/bioforge\/v80\/.+\.png$/u.test(path)), true);
  assert.equal(PRIVATE_V80_PROOF_PATHS.some((path) => BIOFORGE_RUNTIME_ASSET_PATHS_V80.includes(path)), false);
});

test('le contrat V80 exige git show/ls-tree, HTTP 200/404, SHA registre et commit résolu', async () => {
  assert.equal(PRIVATE_V80_PREFIXES.includes('docs/references/v80-bioforge-art/'), true);
  assert.equal(PRIVATE_V80_PREFIXES.includes('docs/references/v80-release-qa/'), true);
  assert.equal(PRIVATE_V80_PROOF_PATHS.some((path) => path.includes('/source-receipts/')), true);
  assert.equal(PRIVATE_V80_PROOF_PATHS.some((path) => path.endsWith('/production-http.json')), true);

  const source = await readFile('scripts/verify-production-v80.mjs', 'utf8');
  assert.match(source, /\['show', `\$\{commit\}:\$\{path\}`\]/u);
  assert.match(source, /\['ls-tree', '-r', '--name-only'/u);
  assert.match(source, /assert\.equal\(remote\.response\.status, 200/u);
  assert.match(source, /assert\.equal\(remote\.response\.status, 404/u);
  assert.match(source, /assert\.equal\(remoteHash, commitHash/u);
  assert.match(source, /assert\.equal\(sha256V80\(remote\.bytes\), asset\.sha256/u);

  const full = '1234567890abcdef1234567890abcdef12345678';
  const calls = [];
  const spawn = (command, args) => {
    calls.push({ command, args });
    return { status: 0, stdout: full + '\n', stderr: '' };
  };
  assert.equal(resolveProductionCommitV80('1234567', spawn), full);
  assert.deepEqual(calls, [{ command: 'git', args: ['rev-parse', '--verify', '1234567^{commit}'] }]);
  assert.throws(() => resolveProductionCommitV80('../HEAD', spawn), /exact deployed content commit/u);
});

test('le filtre local et Vercel gardent les preuves V80 privées mais publient les six assets runtime', async () => {
  const filter = createBuildAssetFilter(process.cwd());
  for (const path of [
    'docs/references/v80-bioforge-art',
    'docs/references/v80-bioforge-art/asset-manifest.json',
    'docs/references/v80-release-qa',
    'docs/references/v80-release-qa/production-http.json',
    'docs/references/V80_PRIVATE_REVIEW',
    'docs/references/V80_PRIVATE_REVIEW/proof.json'
  ]) assert.equal(filter(join(process.cwd(), path)), false, path);
  for (const path of BIOFORGE_RUNTIME_ASSET_PATHS_V80) {
    assert.equal(filter(join(process.cwd(), path.slice(1))), true, path);
  }
  for (const path of ['docs/V80_BIOFORGE_RUNTIME.md', 'docs/VALIDATION_V80.md', 'assets/openai/bioforge/v800/future.png']) {
    assert.equal(filter(join(process.cwd(), path)), true, path);
  }

  const rules = (await readFile('.vercelignore', 'utf8')).split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  for (const prefix of ['docs/references/V80_', 'docs/references/v80-']) {
    assert.ok(rules.includes(`${prefix}*`), prefix);
    assert.ok(rules.includes(`${prefix}*/**`), prefix);
    assert.ok(!rules.some((rule) => rule.startsWith(`!${prefix}`)), `${prefix}: aucune réadmission`);
  }
  assert.equal(rules.some((rule) => rule.startsWith('assets/openai/bioforge/v80')), false, 'les assets runtime ne sont jamais exclus');
});
