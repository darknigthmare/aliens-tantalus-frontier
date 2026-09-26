import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { USER_REFERENCE_ART_V95 } from '../src/user-reference-art-v95.js';
import { USER_REFERENCE_GALLERY_V95, USER_REFERENCE_EFFECTS_V95, createUserReferenceEffectsGalleryV95 } from '../src/user-reference-effects-v95.js';
import { ENEMY_STATIC_POSES_V95 } from '../src/enemy-static-poses-v95.js';
import { ENEMY_ENCYCLOPEDIA_CATALOG_V88, USER_CASTE_MISSION_QUOTA_V88 } from '../src/enemy-user-campaign-v88.js';
import { BIOFORGE_TERRESTRIAL_ROSTER_V80 } from '../src/bioforge-session-v80.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';

test('V95 environmental art stays outside creature identity, printing and encounter quotas', async () => {
  assert.equal(USER_REFERENCE_EFFECTS_V95.length, USER_REFERENCE_ART_V95.filter(art => art.kind === 'effect' && art.reviewStatus === 'accepted-static-adaptation').length);
  assert.equal(USER_REFERENCE_GALLERY_V95.length, USER_REFERENCE_ART_V95.filter(art => ['effect', 'reference'].includes(art.kind) && art.reviewStatus === 'accepted-static-adaptation').length);
  assert.equal(USER_CASTE_MISSION_QUOTA_V88, 2);
  const root = fileURLToPath(new URL('../', import.meta.url)), filter = createBuildAssetFilter(root);
  for (const effect of USER_REFERENCE_GALLERY_V95) {
    assert.match(effect.id, /^(effect|reference)-v95-user-/);
    assert.equal(effect.gameplayStatus, 'reference-gallery-only'); assert.equal(effect.automaticEncounter, false);
    for (const roster of [ENEMY_STATIC_POSES_V95, ENEMY_ENCYCLOPEDIA_CATALOG_V88, BIOFORGE_TERRESTRIAL_ROSTER_V80]) {
      assert.equal(roster.some(entry => entry.id === effect.id || entry.profileId === effect.id || entry.path === effect.path), false);
    }
    const bytes = await readFile(join(root, effect.path.slice(1)));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), effect.sha256);
    assert.equal(bytes[25], 6); assert.equal(filter(join(root, effect.path.slice(1))), true);
  }
});

test('confirmed Defender leaves the reference-only gallery without reclassifying Motes', () => {
  const defender = USER_REFERENCE_ART_V95.find(art => art.sourceNumber === 56);
  assert.equal(defender.kind, 'creature');
  assert.equal(USER_REFERENCE_GALLERY_V95.some(art => art.sourceNumber === 56), false);
  for (const roster of [ENEMY_STATIC_POSES_V95, ENEMY_ENCYCLOPEDIA_CATALOG_V88, BIOFORGE_TERRESTRIAL_ROSTER_V80])
    assert.equal(roster.filter(entry => entry.id === 'pose-v95-user-xeno-defender' || entry.profileId === 'pose-v95-user-xeno-defender').length, 1);
  assert.equal(USER_REFERENCE_EFFECTS_V95.some(art => art.sourceNumber === 34), true);
  assert.equal(ENEMY_STATIC_POSES_V95.some(art => art.sourceNumber === 34), false);
});

test('V95 effect gallery is visible documentation with no print or combat controls', () => {
  const document = { createElement(tag) { return { tag, children: [], dataset: {}, style: {}, attributes: {},
    appendChild(child) { this.children.push(child); return child; }, setAttribute(key, value) { this.attributes[key] = value; } }; } };
  const gallery = createUserReferenceEffectsGalleryV95(document, { id: 'proof-effects' });
  if (!USER_REFERENCE_GALLERY_V95.length) return assert.equal(gallery, null);
  assert.equal(gallery.id, 'proof-effects');
  const flat = element => [element, ...element.children.flatMap(flat)];
  const nodes = flat(gallery);
  assert.equal(nodes.filter(node => node.tag === 'img').length, USER_REFERENCE_GALLERY_V95.length);
  assert.equal(nodes.some(node => ['button', 'select', 'input'].includes(node.tag)), false);
  assert.match(nodes.map(node => node.textContent || '').join(' '), /hors bestiaire.*aucune animation/);
  for (const reference of USER_REFERENCE_GALLERY_V95.filter(art => art.kind === 'reference')) {
    const card = nodes.find(node => node.dataset.referenceEffectV95 === reference.id);
    const text = flat(card).map(node => node.textContent || '').join(' ');
    assert.match(text, /Identité à confirmer/);
    assert.doesNotMatch(text, /ENVIRONNEMENTALE|contamination|infection/i);
  }
});

test('V95 offline shell lists the art registry and its gallery dependency', async () => {
  const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  for (const name of ['user-reference-art-v95', 'user-reference-effects-v95', 'user-equipment-art-v95', 'user-equipment-v95'])
    assert.ok(worker.includes(`'/src/${name}.js'`));
});
