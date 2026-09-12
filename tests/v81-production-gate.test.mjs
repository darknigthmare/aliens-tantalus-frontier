import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import {
  CRITICAL_RUNTIME_PATHS_V81,
  ENEMY_RUNTIME_ASSET_PATHS_V81,
  PRIVATE_V81_PREFIXES,
  PRIVATE_V81_PROOF_PATHS,
  PRODUCTION_CACHE_V81,
  PRODUCTION_REPORT_PATH_V81,
  PRODUCTION_VERSION_V81,
  PROVING_GROUND_RUNTIME_ASSET_PATHS_V81,
  RUNTIME_ASSET_PATHS_V81,
  normalizeTextLineEndingsV81,
  resolveProductionCommitV81,
  sha256V81
} from '../scripts/verify-production-v81.mjs';
import { V81_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v81.js';
import { PLAYER_VISUAL_ASSETS_V81 } from '../src/player-visual-contract-v81.js';
import { PROVING_GROUND_ASSET_LIST_V81 } from '../src/proving-ground-assets-v81.js';

test('le vérificateur de production porte la version, le cache et le rapport V81 exacts', () => {
  assert.equal(PRODUCTION_VERSION_V81, '81.0.0');
  assert.equal(PRODUCTION_CACHE_V81, 'atf-v81-proving-ground-shell-1');
  assert.equal(PRODUCTION_REPORT_PATH_V81, 'docs/references/v81-release-qa/production-http.json');
  assert.equal(sha256V81(Buffer.from('Tantalus')), '48dcc03bb5a4c53d27db4daa0aeb3def2b5ef78b5ae3afd0a2f2d82d5eac4206');
});

test('les fichiers critiques couvrent réellement Proving Ground, Echo-9 et les deux ennemis', () => {
  assert.equal(new Set(CRITICAL_RUNTIME_PATHS_V81).size, CRITICAL_RUNTIME_PATHS_V81.length);
  for (const path of [
    'index.html', 'sw.js', 'hub-level.css', 'src/app.js', 'src/content.js', 'src/save.js',
    'src/player-visual-contract-v81.js', 'src/sprite-animation-runtime.js', 'src/game-v52-runtime.js',
    'src/hub-v81-runtime.js', 'src/proving-ground-assets-v81.js', 'src/proving-ground-session-v81.js',
    'src/tantalus-proving-ground-v81.js', 'src/enemy-profile-assets-v81.js',
    'src/enemy-profile-registry-v66.js', 'src/enemy-profile-geometry-v66.js', 'src/enemy-batch-combat-v66.js'
  ]) assert.ok(CRITICAL_RUNTIME_PATHS_V81.includes(path), path);
  assert.equal(CRITICAL_RUNTIME_PATHS_V81.every((path) => /\.(?:css|html|js)$/u.test(path)), true);
});

test('la parité texte tolère seulement LF/CRLF et refuse toute mutation de contenu', () => {
  const committed = Buffer.from('TANTALUS\nPROVING\n');
  const windows = Buffer.from('TANTALUS\r\nPROVING\r\n');
  const mutated = Buffer.from('TANTALUS\r\nPROVING-X\r\n');
  assert.equal(
    sha256V81(normalizeTextLineEndingsV81(windows)),
    sha256V81(normalizeTextLineEndingsV81(committed))
  );
  assert.notEqual(
    sha256V81(normalizeTextLineEndingsV81(mutated)),
    sha256V81(normalizeTextLineEndingsV81(committed))
  );
});

test('les cinq PNG Echo-9, trois PNG du stand et deux WebP ennemis ont leurs SHA-256 exacts', async () => {
  assert.equal(PLAYER_VISUAL_ASSETS_V81.length, 5);
  assert.equal(PROVING_GROUND_ASSET_LIST_V81.length, 3);
  assert.equal(V81_READY_ENEMY_PROFILE_ASSETS.length, 2);
  assert.deepEqual(PROVING_GROUND_RUNTIME_ASSET_PATHS_V81, PROVING_GROUND_ASSET_LIST_V81.map((asset) => asset.src));
  assert.deepEqual(ENEMY_RUNTIME_ASSET_PATHS_V81, V81_READY_ENEMY_PROFILE_ASSETS.map((asset) => asset.path));
  assert.deepEqual(RUNTIME_ASSET_PATHS_V81.slice(0, 5), PLAYER_VISUAL_ASSETS_V81.map((asset) => asset.path));
  assert.equal(new Set(RUNTIME_ASSET_PATHS_V81).size, 10);

  for (const asset of PLAYER_VISUAL_ASSETS_V81) {
    assert.match(asset.path, /^\/assets\/openai\/sprites\/normalized\/player\/echo9-marine-.+-sheet\.png$/u);
    assert.equal(sha256V81(await readFile(asset.path.slice(1))), asset.sha256, asset.sheetId);
  }

  for (const asset of PROVING_GROUND_ASSET_LIST_V81) {
    assert.match(asset.src, /^\/assets\/openai\/hub\/proving-ground\/v81\/.+\.png$/u);
    assert.equal(sha256V81(await readFile(asset.src.slice(1))), asset.sha256, asset.id);
  }
  for (const asset of V81_READY_ENEMY_PROFILE_ASSETS) {
    assert.equal(asset.path, `/assets/openai/sprites/normalized/enemy-profiles-v81/${asset.profileId}.webp`);
    assert.equal(asset.reviewStatus, 'accepted');
    assert.equal(asset.identityVerified, true);
    assert.equal(asset.canonExact, false);
    assert.equal(sha256V81(await readFile(asset.path.slice(1))), asset.normalizedSha256, asset.profileId);
  }
});

test('le contrat V81 exige git show/ls-tree, HTTP 200/404, SHA registre et commit résolu', async () => {
  assert.deepEqual(PRIVATE_V81_PREFIXES, ['docs/references/V81_', 'docs/references/v81-']);
  assert.ok(PRIVATE_V81_PROOF_PATHS.some((path) => path.includes('/source-receipts/')));
  assert.ok(PRIVATE_V81_PROOF_PATHS.some((path) => path.includes('ENEMY_009_ANCHOR_REVIEW')));
  assert.ok(PRIVATE_V81_PROOF_PATHS.some((path) => path.endsWith('/production-http.json')));

  const source = await readFile('scripts/verify-production-v81.mjs', 'utf8');
  assert.match(source, /\['show', `\$\{commit\}:\$\{path\}`\]/u);
  assert.match(source, /\['ls-tree', '-r', '--name-only'/u);
  assert.match(source, /assert\.equal\(remote\.response\.status, 200/u);
  assert.match(source, /assert\.equal\(remote\.response\.status, 404/u);
  assert.match(source, /atf-release/u);
  assert.match(source, /assert\.equal\(remoteNormalizedHash, commitNormalizedHash/u);
  assert.match(source, /line-ending-normalized/u);
  assert.match(source, /assert\.equal\(sha256V81\(remote\.bytes\), asset\.sha256/u);
  assert.match(source, /assert\.equal\(sha256V81\(remote\.bytes\), asset\.normalizedSha256/u);

  const full = '1234567890abcdef1234567890abcdef12345678';
  const calls = [];
  const spawn = (command, args) => {
    calls.push({ command, args });
    return { status: 0, stdout: full + '\n', stderr: '' };
  };
  assert.equal(resolveProductionCommitV81('1234567', spawn), full);
  assert.deepEqual(calls, [{ command: 'git', args: ['rev-parse', '--verify', '1234567^{commit}'] }]);
  assert.throws(() => resolveProductionCommitV81('../HEAD', spawn), /exact deployed content commit/u);
});

test('le filtre local et Vercel gardent les preuves V81 privées et publient les dix assets critiques', async () => {
  const filter = createBuildAssetFilter(process.cwd());
  const privateAssetRoots = [
    'assets/openai/sprites/frames/v81',
    'assets/openai/sprites/reference-masters/v81',
    'assets/openai/sprites/previews/v81',
    'assets/openai/sprites/metadata/v81',
    'assets/openai/sprites/normalized/enemy-clips-v81'
  ];
  for (const path of [
    'docs/references/V81_ENEMY_009_ANCHOR_REVIEW.json',
    'docs/references/V81_PRIVATE_REVIEW',
    'docs/references/V81_PRIVATE_REVIEW/proof.json',
    'docs/references/v81-proving-ground-art',
    'docs/references/v81-proving-ground-art/asset-manifest.json',
    'docs/references/v81-enemy-wave-review/enemy-010-spitter/anchor-attack.jpg',
    'docs/references/v81-release-qa/production-http.json'
  ]) assert.equal(filter(join(process.cwd(), path)), false, path);
  for (const path of privateAssetRoots) {
    assert.equal(filter(join(process.cwd(), path)), false, path);
    assert.equal(filter(join(process.cwd(), path, 'private-candidate.png')), false, `${path}/**`);
  }
  assert.equal(filter(join(process.cwd(), 'assets/openai/sprites/normalized/enemy-profiles-v81/enemy-011-unreviewed.webp')), false);
  for (const path of RUNTIME_ASSET_PATHS_V81) {
    assert.equal(filter(join(process.cwd(), path.slice(1))), true, path);
  }
  for (const path of ['docs/V81_PROVING_GROUND_RUNTIME.md', 'docs/VALIDATION_V81.md', 'assets/openai/hub/proving-ground/v810/future.png']) {
    assert.equal(filter(join(process.cwd(), path)), true, path);
  }

  const rules = (await readFile('.vercelignore', 'utf8')).split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  for (const prefix of ['docs/references/V81_', 'docs/references/v81-']) {
    assert.ok(rules.includes(`${prefix}*`), prefix);
    assert.ok(rules.includes(`${prefix}*/**`), prefix);
    assert.ok(!rules.some((rule) => rule.startsWith(`!${prefix}`)), `${prefix}: aucune réadmission`);
  }
  for (const path of privateAssetRoots) {
    assert.ok(rules.includes(path), path);
    assert.ok(rules.includes(`${path}/**`), `${path}/**`);
    assert.ok(!rules.some((rule) => rule.startsWith(`!${path}`)), `${path}: aucune réadmission`);
  }
  assert.ok(rules.includes('assets/openai/sprites/normalized/enemy-profiles-v81/*'));
  assert.deepEqual(
    rules.filter((rule) => rule.startsWith('!assets/openai/sprites/normalized/enemy-profiles-v81/')).sort(),
    V81_READY_ENEMY_PROFILE_ASSETS.map((asset) => `!${asset.path.slice(1)}`).sort()
  );
  for (const path of ['.env*', '.vercel', '.vercel/**']) assert.ok(rules.includes(path), path);
  for (const path of RUNTIME_ASSET_PATHS_V81) {
    assert.equal(rules.some((rule) => rule === path.slice(1) || rule === `${path.slice(1)}/**`), false, path);
  }
});

test('le script npm de vérification cible bien la gate V81', async () => {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
  assert.equal(packageJson.scripts['verify:production:v81'], 'node scripts/verify-production-v81.mjs');
});
