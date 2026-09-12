import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { BIOFORGE_ASSET_LIST_V80 } from '../src/bioforge-assets-v80.js';
import { RELEASE } from '../src/content.js';
import { applyHubAnnexBusinessV71 } from '../src/hub-annex-services-v71.js';
import { createDefaultSave, migrateSave } from '../src/save.js';

const readSources = async () => {
  const [html, css, bioforgeUi, app, save, audio, build, worker, packageSource, lockSource] = await Promise.all([
    readFile('index.html', 'utf8'),
    readFile('bioforge-v80.css', 'utf8'),
    readFile('src/bioforge-ui-v80.js', 'utf8'),
    readFile('src/app.js', 'utf8'),
    readFile('src/save.js', 'utf8'),
    readFile('src/audio-assets-v77.js', 'utf8'),
    readFile('scripts/build.mjs', 'utf8'),
    readFile('sw.js', 'utf8'),
    readFile('package.json', 'utf8'),
    readFile('package-lock.json', 'utf8')
  ]);
  return {
    html, css, bioforgeUi, app, save, audio, build, worker,
    packageJson: JSON.parse(packageSource),
    packageLock: JSON.parse(lockSource)
  };
};

test('le shell V81 conserve le niveau BIOFORGE et ses contrôles sans masquer la dette de contenu', async () => {
  const { html, css } = await readSources();
  assert.equal(RELEASE.version, '81.0.0');
  assert.match(RELEASE.subtitle, /BIOFORGE jouable/u);
  assert.match(html, /<meta name="description" content="[^"]*v81[^"]*BIOFORGE jouable[^"]*contenu ennemi encore en cours/u);
  assert.match(html, /<title>ALIENS: TANTALUS FRONTIER v81<\/title>/u);
  assert.match(html, /INITIALISATION DU RUNTIME v81/u);
  assert.match(html, /VERSION 81\.0\.0 · BUILD FRONTIER/u);
  assert.match(html, /<b>v81\.0\.0<\/b>RUNTIME/u);
  assert.match(html, /href="\/bioforge-v80\.css"/u);
  assert.match(html, /id="bioforge-ui-v80"[^>]+data-panel="bioforge"/u);
  assert.match(html, /id="bioforge-canvas-v80"[^>]+width="1280"[^>]+height="720"/u);
  for (const marker of [
    'id="bioforge-profile-v80"', 'id="bioforge-quantity-v80"', 'id="bioforge-start-v80"',
    'id="bioforge-profile-thumbnail-v80"', 'data-atlas-columns="4"', 'data-atlas-rows="8"', 'data-atlas-frame="0"',
    'id="bioforge-purge-v80"', 'id="bioforge-return-v80"', 'id="bioforge-interact-v80"',
    'id="bioforge-reload-v80"', 'id="bioforge-medkit-v80"', 'data-bioforge-key="KeyA"',
    'data-bioforge-key="KeyD"', 'data-bioforge-key="Space"', 'data-bioforge-key="KeyF"'
  ]) assert.ok(html.includes(marker), marker);
  assert.match(css, /@media \(orientation: portrait\) and \(max-width: 720px\)[\s\S]*?\.bioforge-level-shell\s*\{\s*position: fixed;\s*top: calc\(50% - 28\.125vw\);\s*left: 0;\s*width: 100vw;\s*transform: none;/u);
  assert.doesNotMatch(css, /@media \(orientation: portrait\) and \(max-width: 720px\)[\s\S]*?\.bioforge-level-shell\s*\{[^}]*transform: translateY/u);
  assert.match(css, /\.bioforge-profile-thumbnail-v80\s*\{[\s\S]*?background-position: 0% 0%;[\s\S]*?background-repeat: no-repeat;[\s\S]*?background-size: 400% 800%;/u);
  assert.match(css, /\.bioforge-profile-source-v80\s*\{[\s\S]*?clip-path: inset\(50%\);/u);
  assert.match(css, /\.bioforge-view\[data-session-active="true"\] #bioforge-start-v80,[\s\S]*?\.bioforge-view\[data-session-active="true"\] #bioforge-return-v80\s*\{\s*display: none;/u);
});

test('l’application relie le sas physique, le runtime, la persistance, les contrôles et le hook QA V80', async () => {
  const { app, save, audio, bioforgeUi } = await readSources();
  assert.match(app, /import \{ BioforgeRuntimeV80 \} from '\.\/bioforge-runtime-v80\.js'/u);
  assert.match(app, /import \{ BioforgeUiV80, buildBioforgeUiModelV80 \} from '\.\/bioforge-ui-v80\.js'/u);
  assert.match(app, /new BioforgeRuntimeV80\(byId\('bioforge-canvas-v80'\),\s*\{[\s\S]*onEvent:\s*handleBioforgeEventV80,[\s\S]*onPersist:\s*persistBioforgeV80/u);
  assert.match(app, /if \(annexId === 'bioforge'\)[\s\S]*showView\('bioforge'\);[\s\S]*return true;/u);
  assert.match(app, /all\('\[data-bioforge-key\]'\)[\s\S]*bindHoldControl\(button, bioforgeRuntimeV80, button\.dataset\.bioforgeKey\)/u);
  assert.match(app, /globalThis\.__ATF_BIOFORGE_V80__\s*=\s*\{/u);
  assert.match(app, /setupBioforgeUiV80\(\);[\s\S]*setupRuntimeControls\(\);/u);
  assert.match(save, /import \{ createBioforgeV80, sanitizeBioforgeV80 \} from '\.\/bioforge-session-v80\.js'/u);
  assert.match(save, /bioforgeV80:\s*createBioforgeV80\(\)/u);
  assert.match(save, /migrated\.bioforgeV80\s*=\s*sanitizeBioforgeV80\(source\.bioforgeV80\)/u);
  assert.match(audio, /\['play', 'bioforge'\]\.includes\(view\) \? 'mission'/u);
  assert.match(bioforgeUi, /this\.thumbnail\.style\.backgroundImage = source \? `url\("\$\{source\}"\)` : 'none'/u);
  assert.match(bioforgeUi, /this\.start\.hidden = model\.active/u);
  assert.match(bioforgeUi, /this\.returnButton\.hidden = model\.active/u);

  const created = createDefaultSave(2);
  assert.ok(created.bioforgeV80);
  const restored = migrateSave({ ...created, bioforgeV80: { schema: 999, phase: 'forged' } }, 2);
  assert.equal(restored.bioforgeV80.schema, 80);
  assert.equal(restored.bioforgeV80.activeSession, null);
  assert.equal(restored.bioforgeV80.configuration.profileId, 'enemy-004-drone-big-chap');
});

test('le sas BIOFORGE vérifie le confinement sans créer de spawn ni muter la session isolée', () => {
  const save = createDefaultSave(1);
  const isolatedBefore = structuredClone(save.bioforgeV80);
  const receipt = applyHubAnnexBusinessV71(save, 'bioforge');
  assert.equal(receipt.details.organismsInHub, 0);
  assert.equal(Object.hasOwn(save.hub, 'spawn'), false);
  assert.equal(Object.hasOwn(save.hub, 'entities'), false);
  assert.deepEqual(save.bioforgeV80, isolatedBefore);
});

test('le build et le service worker V81 conservent le contrat hors ligne BIOFORGE V80', async () => {
  const { build, worker, packageJson, packageLock } = await readSources();
  assert.equal(packageJson.version, '81.0.0');
  assert.equal(packageLock.version, '81.0.0');
  assert.equal(packageLock.packages[''].version, '81.0.0');
  assert.equal(packageJson.scripts['audit:bioforge:v80'], 'node scripts/audit-bioforge-assets-v80.mjs');
  assert.equal(packageJson.scripts['qa:browser:v80'], 'node tests/browser-bioforge-v80.mjs');
  assert.equal(packageJson.scripts['verify:production:v80'], 'node scripts/verify-production-v80.mjs');
  assert.match(packageJson.scripts.qa, /npm run audit:bioforge:v80/u);
  assert.equal(packageJson.scripts['qa:release'], 'npm run qa && npm run qa:browser:v81');
  assert.match(build, /'bioforge-v80\.css'/u);
  assert.match(build, /index\.includes\('bioforge-canvas-v80'\)/u);
  assert.match(worker, /const CACHE = 'atf-v81-proving-ground-shell-1'/u);
  assert.match(worker, /path\.startsWith\('\/assets\/openai\/bioforge\/v80\/'\)/u);
  for (const path of [
    '/bioforge-v80.css',
    '/src/bioforge-assets-v80.js',
    '/src/bioforge-session-v80.js',
    '/src/bioforge-level-v80.js',
    '/src/bioforge-runtime-v80.js',
    '/src/bioforge-ui-v80.js',
    ...BIOFORGE_ASSET_LIST_V80.map(({ src }) => src)
  ]) assert.ok(worker.includes(`'${path}'`), path);
});
