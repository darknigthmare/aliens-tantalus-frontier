import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { USER_PACK_V100 } from '../src/user-pack-v100.js';
import { USER_REFERENCE_LIBRARY_V100 as library, filterUserReferencesV100, createUserReferenceLibraryV100 } from '../src/user-reference-library-v100.js';
import { getEnemyPhysicalSizeV100 } from '../src/enemy-physical-size-v100.js';
import { ENEMY_ENCYCLOPEDIA_CATALOG_V88 } from '../src/enemy-user-campaign-v88.js';
import { BIOFORGE_TERRESTRIAL_ROSTER_V80 } from '../src/bioforge-session-v80.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';

test('V100 preserves every new image and recovered view under a distinct identity', () => {
  assert.equal(USER_PACK_V100.length, 89);
  assert.equal(library.length, 108);
  assert.equal(new Set(library.map(entry => entry.id)).size, 108);
  assert.equal(new Set(USER_PACK_V100.map(entry => entry.sourceFile)).size, 89);
  for (const entry of library) {
    assert.ok(Object.isFrozen(entry));
    assert.ok(entry.sourceFile && entry.name && entry.lineage);
    assert.equal(entry.combatReady, false);
    assert.equal(entry.automaticEncounter, false);
    assert.match(entry.sourceSha256 || entry.sha256, /^[a-f0-9]{64}$/u);
    assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.some(enemy => enemy.id === entry.id), false);
    assert.equal(BIOFORGE_TERRESTRIAL_ROSTER_V80.some(enemy => enemy.id === entry.id), false);
  }
});

test('V100 Altered relations resolve without replacing historical IDs', () => {
  const ids = new Set(ENEMY_ENCYCLOPEDIA_CATALOG_V88.map(entry => entry.id));
  for (const entry of library.filter(item => item.alteredOf)) {
    assert.notEqual(entry.id, entry.alteredOf);
    assert.ok(ids.has(entry.alteredOf), `${entry.sourceFile}: ${entry.alteredOf}`);
  }
});

test('V100 imported forms never inherit physical size from an Altered relation', () => {
  for (const entry of library) {
    assert.equal(entry.physicalSize, null, entry.sourceFile);
    assert.equal(entry.parentPhysicalSize, getEnemyPhysicalSizeV100(entry.alteredOf || ''), entry.sourceFile);
  }
  for (const sourceFile of ['Xeno-Offspring-Egg.jpg', 'Xeno-Offspring-Eggsack.jpg', 'Xeno-Titan-Drone-No Legs.jpg']) {
    const entry = library.find(item => item.sourceFile === sourceFile);
    assert.ok(entry, sourceFile);
    assert.equal(entry.physicalSize, null);
    assert.ok(entry.parentPhysicalSize, 'original candidate remains available separately');
    assert.equal(entry.parentPhysicalSize.canonVerified, false);
    assert.equal(entry.parentPhysicalSize.appliesToGameplay, false);
  }
  assert.equal(library.find(entry => entry.sourceFile === 'Xeno-XenoEarth-Juvenile.jpg').parentPhysicalSize, null);
});

const renderedParagraphs = (entry) => {
  const created = [];
  const documentRef = { createElement(tagName) {
    const element = {
      tagName, children: [], dataset: {}, textContent: '',
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      setAttribute() {}, addEventListener() {}
    };
    created.push(element);
    return element;
  } };
  createUserReferenceLibraryV100(documentRef, { entries: [entry] });
  return created.filter(element => element.tagName === 'p').map(element => element.textContent);
};

test('V100 egg, embryonic sac and legless Titan UI marks parent measurements as non-transferable', () => {
  for (const sourceFile of ['Xeno-Offspring-Egg.jpg', 'Xeno-Offspring-Eggsack.jpg', 'Xeno-Titan-Drone-No Legs.jpg']) {
    const entry = library.find(item => item.sourceFile === sourceFile);
    const note = renderedParagraphs(entry).find(text => text.startsWith('Repère candidat de l’original lié uniquement'));
    assert.ok(note, sourceFile);
    assert.match(note, /Repère non transférable à cette forme ou à ce stade : taille propre à mesurer/u);
    assert.match(note, /non certifiée canonique/u);
    assert.match(note, /aucune modification automatique des sprites ou des collisions/u);
  }
});

test('V100 imported parasite parent reference remains a length, never its height', () => {
  const entry = library.find(item => item.sourceFile === 'Xeno-Blueluminescent-Facehugger.jpg');
  assert.equal(entry.physicalSize, null);
  assert.equal(entry.parentPhysicalSize.measurementType, 'axial-length');
  const note = renderedParagraphs(entry).find(text => text.startsWith('Repère candidat de l’original lié uniquement'));
  assert.match(note, /1\.05 m \(longueur axiale, pas hauteur/u);
  assert.match(note, /non transférable/u);
  const larva = library.find(item => item.sourceFile === 'Xeno-Blueluminescent-Chestburster.jpg');
  const larvaNote = renderedParagraphs(larva).find(text => text.startsWith('Repère candidat de l’original lié uniquement'));
  assert.match(larvaNote, /uniquement : à mesurer \(longueur axiale, pas hauteur/u);
  assert.doesNotMatch(larvaNote, /à mesurer m/u);
});

test('V100 faction is not biology and all filters combine without mutating sources', () => {
  const david = USER_PACK_V100.find(entry => entry.sourceFile === 'WY-Covenant-David.jpg');
  assert.equal(david.biology, 'synthetic');
  const blue = library.filter(entry => entry.sourceFile.startsWith('Xeno-Blueluminescent-'));
  assert.equal(blue.length, 6);
  assert.equal(new Set(blue.map(entry => entry.lineage)).size, 1);
  const result = filterUserReferencesV100(library, { biology: 'xenomorph', lineage: blue[0].lineage });
  assert.equal(result.length, 6);
  assert.equal(filterUserReferencesV100(library, { search: 'introuvable v100' }).length, 0);
  assert.ok(filterUserReferencesV100(library, { alteredOnly: true }).every(entry => entry.alteredOf));
  assert.deepEqual(filterUserReferencesV100(library, { search: 'David', biology: 'xenomorph' }), []);
});

test('V100 originals are exact bytes and only manifest-owned assets enter builds', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url)); const filter = createBuildAssetFilter(root);
  for (const entry of library) {
    const bytes = await readFile(join(root, entry.path.slice(1)));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sourceSha256 || entry.sha256, entry.sourceFile);
    assert.equal(filter(join(root, entry.path.slice(1))), true, entry.path);
  }
  for (const path of ['assets/user/pack-v100/unreviewed.jpg', 'assets/user/recovery-v100/other.jpg', 'docs/references/v100-user-pack/private.json'])
    assert.equal(filter(join(root, path)), false, path);
});

test('V100 browser dependency graph is precached without preloading the original pack', async () => {
  const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  for (const module of ['user-pack-v100', 'user-reference-library-v100', 'user-reference-recovery-v100', 'enemy-physical-size-v100'])
    assert.ok(worker.includes(`'/src/${module}.js'`), module);
  assert.ok(worker.includes("'/user-reference-library-v100.css'"));
  assert.equal(worker.includes('/assets/user/pack-v100/'), false);
});
