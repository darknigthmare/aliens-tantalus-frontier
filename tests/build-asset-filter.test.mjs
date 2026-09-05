import assert from 'node:assert/strict';
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import test from 'node:test';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';

const V66_BATCH_001_IDS = Object.freeze(['enemy-001-ovomorph', 'enemy-003-chestburster', 'enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner']);
const v66Path = (id) => `assets/openai/sprites/normalized/enemy-profiles-v66/${id}.webp`;
const v66AcceptedAssets = () => V66_BATCH_001_IDS.map((profileId) => ({ profileId, path: `/${v66Path(profileId)}`, reviewStatus: 'accepted', identityVerified: true }));

test('la copie ne traverse pas les intermédiaires V64/V65/V66 et conserve les atlas runtime', async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), 'tantalus-build-filter-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const sourceRoot = join(fixture, 'source');
  const outputRoot = join(fixture, 'output');
  const excludedFiles = [
    'assets/openai/sprites/raw/qa.png',
    'assets/openai/sprites/normalized/equipment/superseded.png',
    'assets/openai/sprites/normalized/facehugger-motion-v65/preview.webp',
    'assets/openai/sprites/frames/v64/enemy/idle.png',
    'assets/openai/sprites/reference-masters/v64/master.png',
    'assets/openai/sprites/previews/v64/preview.png',
    'assets/openai/sprites/metadata/v64/manifest.json',
    'assets/openai/sprites/frames/v65/enemy/idle.png',
    'assets/openai/sprites/reference-masters/v65/master.png',
    'assets/openai/sprites/previews/v65/preview.png',
    'assets/openai/sprites/metadata/v65/manifest.json',
    'assets/openai/sprites/frames/v66/batch-001/enemy-001-ovomorph/sealed.png',
    'assets/openai/sprites/frames/v66/batch-001/enemy-001-ovomorph/rejected/failed.png',
    'assets/openai/sprites/reference-masters/v66/master.png',
    'assets/openai/sprites/previews/v66/enemy-001-ovomorph/all.gif',
    'assets/openai/sprites/metadata/v66/enemy-001-ovomorph.json',
    'assets/openai/sprites/normalized/enemy-clips-v66/enemy-001-ovomorph/sealed.webp',
    'assets/openai/sprites/normalized/enemy-motion-v66/enemy-001-ovomorph/sealed.webp',
    'assets/openai/sprites/frames/v69/alpha-bravo-source.png',
    'assets/openai/sprites/metadata/v69/alpha-bravo-report.json',
    'assets/openai/sprites/frames/v71/hub-commercial/annex-backgrounds-master-openai-v71.png',
    'assets/openai/sprites/frames/v72/props/operations-table-side-v72-source.png',
    'assets/openai/sprites/frames/v72/enemy-083-albino-dust-runner/qa-candidates/atlas.webp'
  ];
  const runtimeFiles = [
    'src/app.js',
    'docs/references/V65_ENEMY_PROFILE_ASSETS.json',
    'assets/openai/sprites/manifest.json',
    'assets/openai/sprites/normalized/enemies/newborn.png',
    'assets/openai/sprites/normalized/enemy-profiles-v65/enemy-002-facehugger.webp',
    'assets/openai/sprites/normalized/equipment-v56/equipment.png',
    'assets/openai/sprites/frames/v63/frame.png',
    'assets/openai/sprites/previews/v650/preview.png',
    'assets/openai/hub/annexes/v71/arrival-airlock/far.webp'
  ];
  for (const file of [...excludedFiles, ...runtimeFiles]) {
    const source = join(sourceRoot, file);
    await mkdir(dirname(source), { recursive: true });
    await writeFile(source, `fixture:${file}`);
  }
  const filter = createBuildAssetFilter(sourceRoot);
  assert.equal(filter(join(sourceRoot, 'assets/openai/v65-enemy-profile-normalization-report.json')), false, 'Le rapport de candidats non acceptés reste en production locale');
  assert.equal(filter(join(sourceRoot, 'assets/openai/sprites/normalized/enemy-profiles-v65/enemy-053-albino-ovomorph.webp')), false, 'Un atlas non accepté ne doit pas être publié');
  const visited = new Set();
  await cp(sourceRoot, outputRoot, {
    recursive: true,
    filter(source) {
      visited.add(relative(sourceRoot, source).replaceAll('\\', '/'));
      return filter(source);
    }
  });
  for (const file of excludedFiles) {
    assert.equal(visited.has(file), false, `${file}: le dossier parent doit être écarté avant lecture`);
    await assert.rejects(access(join(outputRoot, file)), { code: 'ENOENT' });
    await access(join(sourceRoot, file));
  }
  for (const file of runtimeFiles) {
    assert.equal(await readFile(join(outputRoot, file), 'utf8'), `fixture:${file}`);
  }
});

test('V66 copie seulement les cinq profils explicitement acceptés et laisse tous les candidats absents', async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), 'tantalus-v66-allowlist-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const sourceRoot = join(fixture, 'source');
  const outputRoot = join(fixture, 'output');
  const accepted = V66_BATCH_001_IDS.map(v66Path);
  const rejected = [
    v66Path('enemy-053-albino-ovomorph'),
    v66Path('enemy-007-praetorian'),
    `${v66Path('enemy-001-ovomorph')}.candidate`,
    'assets/openai/sprites/normalized/enemy-profiles-v66/rejected/enemy-001-ovomorph.webp',
    'assets/openai/sprites/normalized/enemy-profiles-v66/enemy-001-ovomorph.png',
  ];
  for (const path of [...accepted, ...rejected]) {
    const target = join(sourceRoot, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, `fixture:${path}`);
  }
  const filter = createBuildAssetFilter(sourceRoot, { readyV66Assets: v66AcceptedAssets() });
  await cp(sourceRoot, outputRoot, { recursive: true, filter });
  for (const path of accepted) assert.equal(await readFile(join(outputRoot, path), 'utf8'), `fixture:${path}`);
  for (const path of rejected) await assert.rejects(access(join(outputRoot, path)), { code: 'ENOENT' });
  const empty = createBuildAssetFilter(sourceRoot, { readyV66Assets: [] });
  for (const path of accepted) assert.equal(empty(join(sourceRoot, path)), false, 'Une source présente ne devient jamais prête automatiquement');
});

test('V66 allowlist refuse les fausses acceptations et les chemins attribués à un autre profil', () => {
  const [asset] = v66AcceptedAssets();
  for (const changed of [{ ...asset, reviewStatus: 'generated' }, { ...asset, identityVerified: false }, { ...asset, profileId: 'enemy-053-albino-ovomorph' }, { ...asset, path: `${asset.path}.backup` }]) {
    const filter = createBuildAssetFilter(process.cwd(), { readyV66Assets: [changed] });
    assert.equal(filter(join(process.cwd(), v66Path('enemy-001-ovomorph'))), false);
  }
  const filter = createBuildAssetFilter(process.cwd(), { readyV66Assets: [] });
  assert.equal(filter(join(process.cwd(), 'assets/openai/sprites/normalized/enemy-profiles-v660/fixture.webp')), true, 'Ne pas sur-filtrer une autre version');
});

test('V66 garde les preuves sous docs/references hors copie et refuse leurs dossiers avant descente', async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), 'tantalus-v66-reference-filter-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const sourceRoot = join(fixture, 'source');
  const outputRoot = join(fixture, 'output');
  const directFiles = [
    'docs/references/V66_ENEMY_BATCH_QUEUE.json',
    'docs/references/V66_RUNNER_IMAGEGEN.md',
    'docs/references/v66-batch-001-source-scale-contact.jpg'
  ];
  const privateRoots = ['docs/references/V66_PRIVATE_REVIEW', 'docs/references/v66-atlas-review'];
  const nestedFiles = privateRoots.map((root) => `${root}/nested/source-review.png`);
  const publicFiles = ['docs/ART_PROVENANCE_V66.md', 'docs/VERSION_HISTORY_V66.md', 'docs/VALIDATION_V66.md'];
  for (const path of [...directFiles, ...nestedFiles, ...publicFiles]) {
    await mkdir(dirname(join(sourceRoot, path)), { recursive: true });
    await writeFile(join(sourceRoot, path), `fixture:${path}`);
  }
  const filter = createBuildAssetFilter(sourceRoot);
  const visited = new Set();
  await cp(sourceRoot, outputRoot, { recursive: true, filter(source) {
    visited.add(relative(sourceRoot, source).replaceAll('\\', '/'));
    return filter(source);
  } });
  for (const path of [...directFiles, ...nestedFiles]) {
    assert.equal(filter(join(sourceRoot, path)), false);
    await assert.rejects(access(join(outputRoot, path)), { code: 'ENOENT' });
    assert.equal(await readFile(join(sourceRoot, path), 'utf8'), `fixture:${path}`, 'la preuve originale reste intacte');
  }
  for (const root of privateRoots) {
    assert.equal(filter(join(sourceRoot, root)), false, 'refus du dossier lui-meme');
    assert.equal(visited.has(root), true);
    assert.equal(visited.has(`${root}/nested`), false, 'aucune descente dans le dossier exclu');
    assert.equal(visited.has(`${root}/nested/source-review.png`), false);
    await assert.rejects(access(join(outputRoot, root)), { code: 'ENOENT' });
  }
  for (const path of publicFiles) assert.equal(await readFile(join(outputRoot, path), 'utf8'), `fixture:${path}`);
});

test('V66 references: le filtre ne deborde pas sur les autres versions ou les rapports publics', () => {
  const filter = createBuildAssetFilter(process.cwd());
  for (const path of ['docs', 'docs/references', 'docs/references/V65_ENEMY_PROFILE_ASSETS.json',
    'docs/references/V660_PROOF.json', 'docs/references/v660-review.jpg',
    'docs/V66_PUBLIC_REPORT.md', 'docs/v66-public-report.md',
    'docs/ART_PROVENANCE_V66.md', 'docs/VERSION_HISTORY_V66.md', 'docs/VALIDATION_V66.md',
    'src/V66_helper.js', 'assets/V66_runtime.json']) {
    assert.equal(filter(join(process.cwd(), path)), true, `${path}: hors du perimetre des preuves privees`);
  }
});

test('V69 garde les masters ImageGen et métadonnées hors build sans exclure l’atlas runtime', () => {
  const filter = createBuildAssetFilter(process.cwd());
  assert.equal(filter(join(process.cwd(), 'assets/openai/sprites/frames/v69/alpha-bravo-task-consoles-atlas-openai-v69.png')), false);
  assert.equal(filter(join(process.cwd(), 'assets/openai/sprites/metadata/v69/alpha-bravo-task-consoles-v69.json')), false);
  assert.equal(filter(join(process.cwd(), 'assets/openai/sprites/normalized/props/alpha-bravo-task-consoles-atlas-v69.png')), true);
});

test('V70 garde le master ImageGen et les métadonnées hors build sans exclure l’atlas runtime', () => {
  const filter = createBuildAssetFilter(process.cwd());
  assert.equal(filter(join(process.cwd(), 'assets/openai/sprites/frames/v70/alien-survival-systems-atlas-openai-v70.png')), false);
  assert.equal(filter(join(process.cwd(), 'assets/openai/sprites/metadata/v70/alien-survival-systems-v70.json')), false);
  assert.equal(filter(join(process.cwd(), 'assets/openai/sprites/normalized/props/alien-survival-systems-atlas-v70.png')), true);
});

test('V71 exclut les masters du hub mais conserve les cinquante couches WebP runtime', () => {
  const filter = createBuildAssetFilter(process.cwd());
  assert.equal(filter(join(process.cwd(), 'assets/openai/sprites/frames/v71/hub-commercial/annex-backgrounds-master-openai-v71.png')), false);
  assert.equal(filter(join(process.cwd(), 'assets/openai/sprites/frames/v71/hub-commercial/annex-props-master-openai-v71.png')), false);
  assert.equal(filter(join(process.cwd(), 'assets/openai/hub/annexes/v71/arrival-airlock/far.webp')), true);
  assert.equal(filter(join(process.cwd(), 'assets/openai/hub/annexes/v71/bioforge/door.webp')), true);
});

test('Vercel exclut les candidats V66 et ne réadmet que le lot001 et le K-Series020 accepté', async () => {
  const rules = (await readFile('.vercelignore', 'utf8')).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const directory of ['frames/v66', 'reference-masters/v66', 'previews/v66', 'metadata/v66', 'normalized/enemy-clips-v66', 'normalized/enemy-motion-v66']) {
    assert.ok(rules.includes(`assets/openai/sprites/${directory}`));
    assert.ok(rules.includes(`assets/openai/sprites/${directory}/**`));
    assert.ok(!rules.some((rule) => rule.startsWith(`!assets/openai/sprites/${directory}`)));
  }
  assert.ok(rules.includes('assets/openai/sprites/normalized/enemy-profiles-v66/*'));
  const allowed = rules.filter((rule) => rule.startsWith('!assets/openai/sprites/normalized/enemy-profiles-v66/')).map((rule) => rule.slice(1));
  assert.deepEqual(allowed.sort(), [...V66_BATCH_001_IDS, 'enemy-020-k-series-yellow-xenomorph'].map(v66Path).sort());
  for (const candidate of ['enemy-042-combat-synthetic', 'enemy-071-albino-red-xenomorph', 'enemy-072-albino-k-series-yellow-xenomorph']) {
    assert.ok(!allowed.includes(v66Path(candidate)), `${candidate}: candidat non admis en production`);
  }
  for (const prefix of ['docs/references/V66_', 'docs/references/v66-']) {
    assert.ok(rules.includes(`${prefix}*`), 'exclut fichiers et racines de dossiers');
    assert.ok(rules.includes(`${prefix}*/**`), 'exclut aussi leurs descendants');
    assert.ok(!rules.some((rule) => rule.startsWith(`!${prefix}`)), 'aucune readmission de preuve brute');
  }
  for (const path of ['docs/ART_PROVENANCE_V66.md', 'docs/VERSION_HISTORY_V66.md', 'docs/VALIDATION_V66.md']) {
    assert.ok(!rules.includes(path), `${path}: rapport public non exclu`);
  }
});
