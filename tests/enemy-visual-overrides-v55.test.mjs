import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content-core-v50.js';
import {
  ENEMY_VISUAL_OVERRIDE_ARCHETYPES_V55,
  ENEMY_VISUAL_OVERRIDE_EXACT_PROFILE_COUNT_V55,
  ENEMY_VISUAL_OVERRIDE_BY_PROFILE_ID_V55,
  ENEMY_VISUAL_OVERRIDE_FAMILY_PROFILE_COUNT_V55,
  ENEMY_VISUAL_OVERRIDE_HITBOXES_V55,
  ENEMY_VISUAL_OVERRIDE_PROFILE_COUNT_V55,
  ENEMY_VISUAL_OVERRIDE_PROFILE_IDS_V55,
  ENEMY_VISUAL_OVERRIDES_V55,
  resolveEnemyVisualOverrideV55
} from '../src/enemy-visual-overrides-v55.js';

const EXPECTED_ARCHETYPES = Object.freeze([
  'Praetorian',
  'Spitter',
  'Ovomorph',
  'Chestburster',
  'Crusher',
  'Lurker',
  'Carrier',
  'Ravager'
]);

const EXPECTED_GEOMETRY = new Map([
  ['Praetorian', ['large', [44, 48, 168, 192], [196, 150]]],
  ['Spitter', ['medium', [28, 132, 200, 108], [176, 104]]],
  ['Ovomorph', ['small', [82, 92, 92, 148], [92, 122]]],
  ['Chestburster', ['small', [54, 168, 148, 72], [104, 52]]],
  ['Crusher', ['large', [24, 100, 216, 140], [216, 132]]],
  ['Lurker', ['medium', [32, 138, 192, 102], [174, 92]]],
  ['Carrier', ['large', [30, 58, 196, 182], [198, 144]]],
  ['Ravager', ['large', [38, 48, 180, 192], [202, 158]]]
]);

test('les huit overrides v55 couvrent 8 bases exactes et 80 modifiers en réemploi de famille', () => {
  assert.deepEqual(ENEMY_VISUAL_OVERRIDE_ARCHETYPES_V55, EXPECTED_ARCHETYPES);
  assert.equal(Object.keys(ENEMY_VISUAL_OVERRIDES_V55).length, 8);
  assert.equal(ENEMY_VISUAL_OVERRIDE_PROFILE_COUNT_V55, 88);
  assert.equal(ENEMY_VISUAL_OVERRIDE_PROFILE_IDS_V55.length, 88);
  assert.equal(new Set(ENEMY_VISUAL_OVERRIDE_PROFILE_IDS_V55).size, 88);
  assert.equal(Object.keys(ENEMY_VISUAL_OVERRIDE_BY_PROFILE_ID_V55).length, 88);
  assert.equal(ENEMY_VISUAL_OVERRIDE_EXACT_PROFILE_COUNT_V55, 8);
  assert.equal(ENEMY_VISUAL_OVERRIDE_FAMILY_PROFILE_COUNT_V55, 80);

  for (const entry of Object.values(ENEMY_VISUAL_OVERRIDES_V55)) {
    assert.equal(entry.profileIds.length, 11, entry.archetype);
    assert.equal(new Set(entry.profileIds).size, 11, entry.archetype);
    assert.equal(entry.identityStatus, 'exact', entry.archetype);
    assert.equal(entry.approximate, false, entry.archetype);
    assert.equal(entry.fallbackReason, null, entry.archetype);
    assert.ok(Object.isFrozen(entry), entry.archetype);
    assert.ok(Object.isFrozen(entry.profileIds), entry.archetype);
  }
  const statuses = Object.values(ENEMY_VISUAL_OVERRIDE_BY_PROFILE_ID_V55).reduce((counts, profile) => {
    counts[profile.identityStatus] = (counts[profile.identityStatus] || 0) + 1;
    return counts;
  }, {});
  assert.deepEqual(statuses, { exact: 8, 'authored-family': 80 });
});

test('les 88 identifiants gardent la bonne plaque sans déclarer les modifiers exacts', () => {
  const catalogById = new Map(ENEMIES.map((enemy) => [enemy.id, enemy]));
  const coveredCatalog = ENEMIES.filter((enemy) => resolveEnemyVisualOverrideV55(enemy));
  assert.equal(coveredCatalog.length, 88);

  for (const [archetype, entry] of Object.entries(ENEMY_VISUAL_OVERRIDES_V55)) {
    for (const profileId of entry.profileIds) {
      const enemy = catalogById.get(profileId);
      assert.ok(enemy, `${archetype}: profil absent ${profileId}`);
      const resolved = resolveEnemyVisualOverrideV55(enemy);
      assert.equal(resolved, ENEMY_VISUAL_OVERRIDE_BY_PROFILE_ID_V55[profileId], profileId);
      assert.equal(resolved.sheetId, entry.sheetId, profileId);
      assert.equal(resolved.archetype, entry.archetype, profileId);
      const isBase = profileId === entry.baseProfileId;
      assert.equal(resolved.identityStatus, isBase ? 'exact' : 'authored-family', profileId);
      assert.equal(resolved.approximate, !isBase, profileId);
      if (isBase) assert.equal(resolved.fallbackReason, null, profileId);
      else assert.match(resolved.fallbackReason, /modifier systémique/, profileId);
    }
  }
});

test('chaque plaque est distincte, normalisée, orientée à droite et sans fallback Drone', () => {
  const entries = Object.values(ENEMY_VISUAL_OVERRIDES_V55);
  const paths = new Set();
  const sheetIds = new Set();
  const spriteKeys = new Set();

  for (const entry of entries) {
    assert.equal(entry.sourceFacing, 1, entry.archetype);
    assert.match(entry.path, /^\/assets\/openai\/sprites\/normalized\/enemies\/[a-z0-9-]+\.png$/, entry.archetype);
    assert.doesNotMatch(entry.path, /drone/i, entry.archetype);
    assert.notEqual(entry.spriteKey, 'xenoDrone', entry.archetype);
    assert.notEqual(entry.sheetId, 'enemy.xenomorph-drone.locomotion', entry.archetype);
    assert.doesNotMatch(entry.sheetId, /xenomorph-drone/, entry.archetype);
    paths.add(entry.path);
    sheetIds.add(entry.sheetId);
    spriteKeys.add(entry.spriteKey);
  }

  assert.equal(paths.size, 8);
  assert.equal(sheetIds.size, 8);
  assert.equal(spriteKeys.size, 8);
});

test('les petites, moyennes et grandes hitboxes restent bornées et les rendus sont dédiés', () => {
  assert.equal(Object.keys(ENEMY_VISUAL_OVERRIDE_HITBOXES_V55).length, 8);

  for (const [archetype, [sizeClass, bounds, render]] of EXPECTED_GEOMETRY) {
    const entry = ENEMY_VISUAL_OVERRIDES_V55[archetype];
    assert.ok(entry, archetype);
    assert.equal(entry.hitbox.sizeClass, sizeClass, archetype);
    assert.deepEqual(
      [entry.hitbox.x, entry.hitbox.y, entry.hitbox.width, entry.hitbox.height],
      bounds,
      archetype
    );
    assert.deepEqual([entry.renderWidth, entry.renderHeight], render, archetype);
    assert.deepEqual([entry.renderSize.width, entry.renderSize.height], render, archetype);
    assert.ok(entry.hitbox.x >= 0 && entry.hitbox.y >= 0, archetype);
    assert.ok(entry.hitbox.x + entry.hitbox.width <= 256, archetype);
    assert.ok(entry.hitbox.y + entry.hitbox.height <= 256, archetype);
  }

  assert.ok(ENEMY_VISUAL_OVERRIDES_V55.Ovomorph.hitbox.width <= 92);
  assert.ok(ENEMY_VISUAL_OVERRIDES_V55.Chestburster.hitbox.height <= 72);
  for (const archetype of ['Praetorian', 'Crusher', 'Carrier', 'Ravager']) {
    const hitbox = ENEMY_VISUAL_OVERRIDES_V55[archetype].hitbox;
    assert.ok(hitbox.width >= 168, archetype);
    assert.ok(hitbox.height >= 140, archetype);
  }
});

test('le résolveur distingue base exacte et modifiers de famille sans accepter les voisins conceptuels', () => {
  assert.equal(resolveEnemyVisualOverrideV55('Praetorian'), ENEMY_VISUAL_OVERRIDES_V55.Praetorian);
  for (const [name, entry] of [
    ['Apex Ravager', ENEMY_VISUAL_OVERRIDES_V55.Ravager],
    ['Neuro-Linked Carrier', ENEMY_VISUAL_OVERRIDES_V55.Carrier]
  ]) {
    const resolved = resolveEnemyVisualOverrideV55({ name });
    assert.equal(resolved.sheetId, entry.sheetId);
    assert.equal(resolved.identityStatus, 'authored-family');
    assert.equal(resolved.approximate, true);
  }

  for (const name of ['Foundry Crusher', 'Reef Spitter', 'Arcology Lurker', 'Salvage Hive Brute']) {
    assert.equal(resolveEnemyVisualOverrideV55({ name }), null, name);
  }
  assert.equal(resolveEnemyVisualOverrideV55({ name: 'Drone / Big Chap' }), null);
  assert.equal(resolveEnemyVisualOverrideV55({}), null);
});
