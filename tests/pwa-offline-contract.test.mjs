import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { access, readFile } from 'node:fs/promises';
import {
  MISSION_LEVEL_LAYER_FILES_V52,
  MISSION_LEVEL_ZONE_LAYER_FILES_V58
} from '../src/game-v52-level-runtime.js';
import { MISSION_STRUCTURAL_PROP_FILES, MISSION_WORLD_PROP_FILES_V58 } from '../src/game-v51-runtime.js';
import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import { HUB_TRAVERSAL_ART_FILES } from '../src/hub-v51-runtime.js';
import { HUB_ART_ASSETS_V55 } from '../src/hub-art-runtime-v55.js';
import { HUB_ROOM_ART_ASSETS_V56 } from '../src/hub-art-runtime-v56.js';
import { MISSION_INTERACTIVE_ART_FILES_V56 } from '../src/mission-interactive-art-v56.js';
import { HUB_ROOM_FAR_ASSETS_V58, HUB_ROOM_MID_ASSETS_V58 } from '../src/hub-art-runtime-v58.js';
import { MISSION_DOOR_ATLAS_V58 } from '../src/mission-door-art-v58.js';
import { READY_ENEMY_PROFILE_REGISTRY_V65 } from '../src/enemy-profile-registry-v65.js';
import { READY_ENEMY_PROFILE_REGISTRY_V66 } from '../src/enemy-profile-registry-v66.js';

const relativeImports = (source) => {
  const imports = [];
  for (const pattern of [
    /(?:import|export)\s+(?:[^'"]*?\sfrom\s*)?['"](\.[^'"]+)['"]/g,
    /import\(\s*['"](\.[^'"]+)['"]\s*\)/g
  ]) {
    for (const match of source.matchAll(pattern)) imports.push(match[1]);
  }
  return imports;
};

const localPath = (webPath) => path.join(process.cwd(), ...webPath.split('/').filter(Boolean));
const workerContains = (worker, webPath) => worker.includes(`'${webPath}'`) || worker.includes(`"${webPath}"`);

test('le cache hors-ligne v68 précache seulement le shell et garde les atlases ennemis à la demande', async () => {
  const worker = await readFile('sw.js', 'utf8');
  const visited = new Set();

  async function visit(webPath) {
    if (visited.has(webPath)) return;
    visited.add(webPath);
    const source = await readFile(localPath(webPath), 'utf8');
    for (const specifier of relativeImports(source)) {
      let resolved = path.posix.normalize(path.posix.join(path.posix.dirname(webPath), specifier));
      if (!path.posix.extname(resolved)) resolved += '.js';
      if (!resolved.startsWith('/')) resolved = '/' + resolved;
      await visit(resolved);
    }
  }

  await visit('/src/app.js');
  for (const modulePath of visited) {
    assert.ok(workerContains(worker, modulePath), `${modulePath} manque dans CORE`);
  }

  for (const modulePath of [
    '/src/game-v52-runtime.js',
    '/src/game-v52-level-runtime.js',
    '/src/sprite-animation-runtime.js',
    '/src/enemy-profile-assets-v65.js',
    '/src/enemy-profile-registry-v65.js',
    '/src/enemy-atlas-loader-v65.js',
    '/src/mission-levels-v52.js',
    '/src/enemy-visual-overrides-v56.js',
    '/src/enemy-visual-overrides-v64.js',
    '/src/npc-mission-runtime-v55.js',
    '/src/vehicle-visual-overrides-v56.js',
    '/src/vehicle-access-runtime-v59.js',
    '/src/vehicle-deployment-gates-v60.js',
    '/src/weapon-visual-runtime-v56.js',
    '/src/weapon-visual-runtime-v61.js',
    '/src/weapon-visual-runtime-v63.js',
    '/src/excel-content-bridge-v63.js',
    '/src/equipment-visual-runtime-v56.js',
    '/src/mission-interactive-art-v56.js',
    '/src/hub-art-runtime-v56.js',
    '/src/hub-art-runtime-v58.js',
    '/src/mission-door-art-v58.js',
    '/src/topology-coherence-v58.js'
  ]) {
    assert.ok(workerContains(worker, modulePath), `${modulePath} manque dans CORE v62`);
  }

  assert.equal(Object.keys(SPRITE_SHEETS).length, 195 + READY_ENEMY_PROFILE_REGISTRY_V65.length + READY_ENEMY_PROFILE_REGISTRY_V66.length);
  for (const sheet of Object.values(SPRITE_SHEETS)) await access(localPath(sheet.path));
  assert.match(worker, /const SPRITE_MANIFEST = ['"]\/assets\/openai\/sprites\/manifest\.json['"]/);
  assert.match(worker, /const SHELL = Object\.freeze\(CORE\.filter/);
  assert.match(worker, /cache\.addAll\(SHELL\)/);
  assert.doesNotMatch(worker, /fetch\(SPRITE_MANIFEST/);
  assert.doesNotMatch(worker, /sheet\.files\?\.normalized/);
  assert.doesNotMatch(worker, /cache\.addAll\(normalizedSprites\)/);
  assert.match(worker, /const MAX_ENEMY_ATLAS_BATCH_V65 = 12/);
  assert.match(worker, /CACHE_ENEMY_ATLASES_V65/);
  assert.match(worker, /slice\(0, MAX_ENEMY_ATLAS_BATCH_V65\)/);
  assert.match(worker, /normalized\/enemy-profiles-v65\//);
  assert.match(worker, /endsWith\(['"]\.webp['"]\)/);

  const zoneAssets = Object.values(MISSION_LEVEL_ZONE_LAYER_FILES_V58)
    .flatMap((zones) => Object.values(zones))
    .flatMap((layers) => Object.values(layers));
  assert.equal(zoneAssets.length, 54);
  assert.equal(new Set(zoneAssets).size, zoneAssets.length);

  const staticRuntimeAssets = new Set([
    ...Object.values(MISSION_LEVEL_LAYER_FILES_V52).flatMap((layers) => Object.values(layers)),
    ...Object.values(MISSION_STRUCTURAL_PROP_FILES),
    ...Object.values(MISSION_WORLD_PROP_FILES_V58),
    ...HUB_ART_ASSETS_V55,
    ...HUB_ROOM_ART_ASSETS_V56,
    ...HUB_ROOM_MID_ASSETS_V58,
    ...HUB_ROOM_FAR_ASSETS_V58,
    ...Object.values(MISSION_INTERACTIVE_ART_FILES_V56),
    ...Object.values(HUB_TRAVERSAL_ART_FILES),
    ...zoneAssets,
    MISSION_DOOR_ATLAS_V58
  ]);
  for (const assetPath of staticRuntimeAssets) {
    await access(localPath(assetPath));
    assert.ok(workerContains(worker, assetPath), `${assetPath} manque dans CORE v62`);
  }

  for (const stylesheetPath of ['/catalog-v62.css', '/mission-insertion-v62.css']) {
    assert.ok(workerContains(worker, stylesheetPath), `${stylesheetPath} manque dans CORE v62`);
  }
  for (const bitmapPath of [
    '/assets/openai/hub/vents/tantalus-duct-interior-v62.png',
    '/assets/openai/mission/insertion/tantalus-dropship-approach-v62.png',
    '/assets/openai/mission/insertion/tantalus-apc-approach-v62.png',
    '/assets/openai/mission/insertion/tantalus-foot-approach-v62.png'
  ]) {
    await access(localPath(bitmapPath));
    assert.ok(workerContains(worker, bitmapPath), `${bitmapPath} manque dans CORE v62`);
  }

  assert.match(worker, /const CACHE = ['"]atf-v68-shell-2['"]/);
  for (const documentPath of [
    '/docs/GAMEPLAY_PROMISE_AUDIT_V55.md',
    '/docs/V58_ROOM_COHERENCE_AUDIT.md',
    '/docs/VERSION_HISTORY_V59.md',
    '/docs/ART_PROVENANCE_V59.md',
    '/docs/references/V59_ASSET_COMPLETION_MATRIX.md',
    '/docs/VERSION_HISTORY_V60.md',
    '/docs/V60_LEVEL_DESIGN_AUDIT.md',
    '/docs/references/V60_ASSET_COMPLETION_MATRIX.md',
    '/docs/VERSION_HISTORY_V61.md',
    '/docs/V61_LEVEL_DESIGN_AUDIT.md',
    '/docs/ART_PROVENANCE_V61.md',
    '/docs/ART_PROVENANCE_V62.md',
    '/docs/ART_PROVENANCE_V63.md',
    '/docs/ART_PROVENANCE_V64.md',
    '/docs/V62_IMPLEMENTATION_AUDIT.md',
    '/docs/VERSION_HISTORY_V63.md',
    '/docs/VERSION_HISTORY_V64.md',
    '/docs/references/V62_PNG_ALPHA_AUDIT.md',
    '/docs/references/V62_PNG_ALPHA_AUDIT.json',
    '/docs/references/V63_ASSET_COMPLETION_MATRIX.md',
    '/docs/references/V63_PNG_ALPHA_AUDIT.md',
    '/docs/references/V63_PNG_ALPHA_AUDIT.json',
    '/docs/references/V64_ASSET_COMPLETION_MATRIX.md',
    '/docs/references/V64_ENEMY_SOURCES.json',
    '/docs/references/V64_IMAGEGEN_PROMPTS.md',
    '/docs/references/V64_PNG_ALPHA_AUDIT.json',
    '/docs/references/V61_ASSET_COMPLETION_MATRIX.md',
    '/docs/references/V61_EXCEL_CONTENT_GAP_AUDIT.md'
  ]) {
    assert.ok(workerContains(worker, documentPath), `${documentPath} manque dans CORE v62`);
  }
  const pngAudit = JSON.parse(await readFile(localPath('/docs/references/V64_PNG_ALPHA_AUDIT.json'), 'utf8'));
  assert.equal(pngAudit.release, 'v64');
  assert.equal(pngAudit.summary.assetsAudited, 405);
  assert.equal(pngAudit.summary.findings.error, 0);
  const enemySources = JSON.parse(await readFile(localPath('/docs/references/V64_ENEMY_SOURCES.json'), 'utf8'));
  for (const entry of enemySources.entries) {
    assert.equal(entry.assets.repositoryOnly.published, false);
    assert.ok(Object.values(entry.assets.repositoryOnly).filter((value) => typeof value === 'string').every((value) => !value.startsWith('/')));
    assert.ok(entry.assets.runtime.rawAtlas.startsWith('/assets/'));
    assert.ok(entry.assets.runtime.normalizedAtlas.startsWith('/assets/'));
  }
  assert.match(worker, /async function precacheV65Shell\(\)/);
  assert.match(worker, /event\.request\.mode === ['"]navigate['"]/);
  assert.doesNotMatch(worker, /cached\s*\|\|\s*caches\.match\(['"]\/index\.html/);
});

test('le build et le déploiement excluent les masters QA raw sans supprimer les sources', async () => {
  const [build, vercelIgnore, vercelConfig] = await Promise.all([
    readFile('scripts/build.mjs', 'utf8'),
    readFile('.vercelignore', 'utf8'),
    readFile('vercel.json', 'utf8').then(JSON.parse)
  ]);
  assert.match(build, /rm\(join\(output, 'assets', 'openai', 'sprites', 'raw'\), \{ recursive: true, force: true \}\)/);
  assert.match(build, /rm\(join\(output, 'assets', 'openai', 'sprites', 'normalized', 'equipment'\), \{ recursive: true, force: true \}\)/);
  assert.match(build, /rm\(join\(output, 'assets', 'openai', 'sprites', 'frames', 'v64'\), \{ recursive: true, force: true \}\)/);
  assert.match(build, /rm\(join\(output, 'assets', 'openai', 'sprites', 'reference-masters', 'v64'\), \{ recursive: true, force: true \}\)/);
  assert.match(build, /rm\(join\(output, 'assets', 'openai', 'sprites', 'previews', 'v64'\), \{ recursive: true, force: true \}\)/);
  assert.match(build, /rm\(join\(output, 'assets', 'openai', 'sprites', 'metadata', 'v64'\), \{ recursive: true, force: true \}\)/);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/raw$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/raw\/\*\*$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/normalized\/equipment$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/normalized\/equipment\/\*\*$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/frames\/v64$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/frames\/v64\/\*\*$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/reference-masters\/v64$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/reference-masters\/v64\/\*\*$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/previews\/v64$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/previews\/v64\/\*\*$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/metadata\/v64$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/metadata\/v64\/\*\*$/m);
  assert.match(vercelIgnore, /^\.tmp\/\*\*$/m);
  assert.match(vercelIgnore, /^node_modules$/m);
  assert.match(vercelIgnore, /^dist$/m);
  assert.ok(
    vercelConfig.rewrites.some((rewrite) => rewrite.source.includes('.*\\.css$')),
    'les feuilles V62 doivent échapper au fallback SPA Vercel'
  );
});
