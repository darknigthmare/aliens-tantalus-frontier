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

test('le cache hors-ligne v63 couvre la fermeture ESM, le hub physique, les conduits et l’arsenal complété', async () => {
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
    '/src/mission-levels-v52.js',
    '/src/enemy-visual-overrides-v56.js',
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

  assert.equal(Object.keys(SPRITE_SHEETS).length, 192);
  for (const sheet of Object.values(SPRITE_SHEETS)) await access(localPath(sheet.path));
  assert.match(worker, /const SPRITE_MANIFEST = ['"]\/assets\/openai\/sprites\/manifest\.json['"]/);
  assert.match(worker, /sheet\.files\?\.normalized/);
  assert.match(worker, /path\.includes\(['"]\/sprites\/normalized\/['"]\)/);
  assert.match(worker, /cache\.addAll\(normalizedSprites\)/);

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

  assert.match(worker, /const CACHE = ['"]atf-v63-runtime-1['"]/);
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
    '/docs/V62_IMPLEMENTATION_AUDIT.md',
    '/docs/VERSION_HISTORY_V63.md',
    '/docs/references/V62_PNG_ALPHA_AUDIT.md',
    '/docs/references/V62_PNG_ALPHA_AUDIT.json',
    '/docs/references/V63_ASSET_COMPLETION_MATRIX.md',
    '/docs/references/V63_PNG_ALPHA_AUDIT.md',
    '/docs/references/V63_PNG_ALPHA_AUDIT.json',
    '/docs/references/V61_ASSET_COMPLETION_MATRIX.md',
    '/docs/references/V61_EXCEL_CONTENT_GAP_AUDIT.md'
  ]) {
    assert.ok(workerContains(worker, documentPath), `${documentPath} manque dans CORE v62`);
  }
  assert.match(worker, /async function precacheV63\(\)/);
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
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/raw$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/raw\/\*\*$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/normalized\/equipment$/m);
  assert.match(vercelIgnore, /^assets\/openai\/sprites\/normalized\/equipment\/\*\*$/m);
  assert.match(vercelIgnore, /^\.tmp\/\*\*$/m);
  assert.match(vercelIgnore, /^node_modules$/m);
  assert.match(vercelIgnore, /^dist$/m);
  assert.ok(
    vercelConfig.rewrites.some((rewrite) => rewrite.source.includes('.*\\.css$')),
    'les feuilles V62 doivent échapper au fallback SPA Vercel'
  );
});
