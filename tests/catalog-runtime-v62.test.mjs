import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { resolveSpriteSheet, resolveVehicleAnimation } from '../src/sprite-animation-runtime.js';

import {
  BIOLOGICAL_RELATIONS_V62,
  CATALOG_COUNTS_V62,
  CATALOG_RECORDS_V62,
  CATALOG_TREE_V62,
  CATALOG_UNKNOWN_V62,
  getBiologicalRelationsV62,
  getCatalogChildrenV62,
  getCatalogEntryV62,
  getCatalogNodeV62,
  getCatalogPathV62,
  getHumanSizeComparisonV62,
  normalizeCatalogSearchV62,
  searchCatalogV62
} from '../src/catalog-runtime-v62.js';
import {
  ENEMIES,
  EQUIPMENT,
  VEHICLES,
  WEAPONS
} from '../src/content-core-v50.js';

const idStartingWith = (catalog, prefix) => catalog.find((entry) => entry.id.startsWith(prefix)).id;

test('le runtime V62 indexe les quatre catalogues sans perdre ni dupliquer une entrée', () => {
  assert.deepEqual(CATALOG_COUNTS_V62, {
    total: WEAPONS.length + EQUIPMENT.length + ENEMIES.length + VEHICLES.length,
    weapons: 146,
    equipment: 106,
    enemies: 571,
    vehicles: 279
  });
  assert.equal(CATALOG_RECORDS_V62.length, CATALOG_COUNTS_V62.total);
  assert.equal(new Set(CATALOG_RECORDS_V62.map((entry) => entry.id)).size, CATALOG_COUNTS_V62.total);
  assert.deepEqual(CATALOG_TREE_V62.map((root) => root.id), [
    'catalog:weapons',
    'catalog:equipment',
    'catalog:enemies',
    'catalog:vehicles'
  ]);
  for (const root of CATALOG_TREE_V62) {
    assert.equal(root.count, CATALOG_COUNTS_V62[root.catalog]);
    assert.equal(root.descendantEntryIds.length, root.count);
    assert.equal(getCatalogNodeV62(root.id), root);
    assert.equal(getCatalogChildrenV62(root.id), root.children);
  }
});

test('la taxonomie utilise uniquement les champs existants et signale les faits absents', () => {
  const ovomorph = getCatalogEntryV62(idStartingWith(ENEMIES, 'enemy-001-'));
  assert.deepEqual(ovomorph.taxonomy, {
    family: 'xenomorph',
    category: 'organism',
    species: CATALOG_UNKNOWN_V62,
    subspecies: CATALOG_UNKNOWN_V62,
    caste: 'egg',
    stage: 'egg',
    type: 'Ovomorph'
  });

  const warrior = getCatalogEntryV62(idStartingWith(ENEMIES, 'enemy-005-'));
  assert.equal(warrior.taxonomy.stage, CATALOG_UNKNOWN_V62);
  assert.equal(warrior.taxonomy.species, CATALOG_UNKNOWN_V62);
  assert.equal(warrior.taxonomy.caste, 'assault');

  const ovomorphPath = getCatalogPathV62(ovomorph.id);
  assert.deepEqual(ovomorphPath.map((node) => node.kind), [
    'catalog',
    'family',
    'species',
    'subspecies',
    'stage',
    'caste',
    'type',
    'entry'
  ]);
  assert.equal(ovomorphPath.find((node) => node.kind === 'species').label, CATALOG_UNKNOWN_V62);

  const harpoon = getCatalogEntryV62(idStartingWith(WEAPONS, 'weapon-024-'));
  assert.equal(harpoon.visual.sheetId, 'weapon.asso-400-harpoon-gun.action.v63');
  assert.equal(harpoon.visual.path, '/assets/openai/sprites/normalized/weapons/asso-400-harpoon-gun-action-sheet-v63.png');
  assert.equal(harpoon.taxonomy.category, 'grappling');
  assert.equal(harpoon.dimensions, null);

  const heavyPulse = getCatalogEntryV62(idStartingWith(WEAPONS, 'weapon-016-'));
  assert.equal(heavyPulse.visual, null);
});

test('les faits de référence et les statistiques de gameplay ne partagent pas leurs champs', () => {
  const m41a = getCatalogEntryV62(idStartingWith(WEAPONS, 'weapon-001-'));
  assert.equal(m41a.canonFacts.claims.name, 'M41A Pulse Rifle');
  assert.equal(m41a.canonFacts.claims.family, 'ballistic');
  assert.equal(m41a.canonFacts.claims.damage, undefined);
  assert.equal(m41a.gameplayStats.damage, WEAPONS[0].damage);
  assert.equal(m41a.gameplayStats.source, undefined);
  assert.equal(m41a.gameplayStats.provenance, undefined);

  const fieldVariant = getCatalogEntryV62(idStartingWith(WEAPONS, 'weapon-041-'));
  assert.deepEqual(fieldVariant.canonFacts.claims, {});
  assert.equal(fieldVariant.canonFacts.source.provenance, 'gameplay-variant');

  const enemy = getCatalogEntryV62(idStartingWith(ENEMIES, 'enemy-004-'));
  assert.equal(enemy.canonFacts.claims.biology, 'xenomorph');
  assert.equal(enemy.canonFacts.claims.health, undefined);
  assert.equal(enemy.gameplayStats.health, ENEMIES[3].health);
  assert.equal(enemy.gameplayStats.biology, undefined);
});

test('la recherche normalise accents, ponctuation et casse puis retourne le chemin complet', () => {
  assert.equal(normalizeCatalogSearchV62('  VÉHICULES / P-5000  '), 'vehicules p 5000');
  const [result] = searchCatalogV62('p 5000 powered', { catalog: 'vehicles', limit: 1 });
  assert.ok(result);
  assert.equal(result.entry.id, idStartingWith(VEHICLES, 'vehicle-007-'));
  assert.equal(result.path[0].id, 'catalog:vehicles');
  assert.equal(result.path[0].kind, 'catalog');
  assert.equal(result.path.at(-1).id, result.entry.id);
  assert.equal(result.path.at(-1).kind, 'entry');
  assert.ok(result.path.some((node) => node.kind === 'family' && node.label === 'exosuit'));
  assert.ok(result.path.some((node) => node.kind === 'type'));

  const byId = searchCatalogV62(result.entry.id, { limit: 1 });
  assert.equal(byId[0].entry.id, result.entry.id);
  assert.equal(byId[0].score, 1000);
});

test('la recherche respecte le catalogue, la limite et les requêtes vides', () => {
  assert.deepEqual(searchCatalogV62(''), []);
  assert.deepEqual(searchCatalogV62('   '), []);
  const xenomorphs = searchCatalogV62('xenomorph', { catalog: 'enemies', limit: 7 });
  assert.equal(xenomorphs.length, 7);
  assert.ok(xenomorphs.every((result) => result.entry.catalog === 'enemies'));
  assert.ok(xenomorphs.every((result) => result.path.length >= 5));
  assert.deepEqual(searchCatalogV62('xenomorph', { catalog: 'vehicles' }), []);
});

test('les relations biologiques forment un graphe navigable limité aux identités sourcées', () => {
  assert.equal(BIOLOGICAL_RELATIONS_V62.length, 4);
  const queenId = idStartingWith(ENEMIES, 'enemy-008-');
  const ovomorphId = idStartingWith(ENEMIES, 'enemy-001-');
  const queenRelations = getBiologicalRelationsV62(queenId);
  assert.equal(queenRelations.length, 1);
  assert.equal(queenRelations[0].direction, 'outgoing');
  assert.equal(queenRelations[0].type, 'produces');
  assert.equal(queenRelations[0].relatedEntry.id, ovomorphId);
  assert.equal(queenRelations[0].relatedPath.at(-1).id, ovomorphId);

  const ovomorphRelations = getBiologicalRelationsV62(ovomorphId);
  assert.deepEqual(new Set(ovomorphRelations.map((relation) => relation.direction)), new Set(['incoming', 'outgoing']));
  assert.ok(ovomorphRelations.every((relation) => relation.status === 'licensed-reference'));

  const generatedVariant = idStartingWith(ENEMIES, 'enemy-053-');
  assert.deepEqual(getBiologicalRelationsV62(generatedVariant), []);
  assert.deepEqual(getBiologicalRelationsV62(idStartingWith(WEAPONS, 'weapon-001-')), []);
});

test('le comparateur humain refuse toute hauteur absente, non vérifiée ou sans source', () => {
  const queenId = idStartingWith(ENEMIES, 'enemy-008-');
  assert.equal(getHumanSizeComparisonV62(queenId), null);
  assert.equal(getHumanSizeComparisonV62(queenId, {
    dimensions: { [queenId]: { heightMeters: 4.5, verification: 'estimated', source: 'estimate' } }
  }), null);
  assert.equal(getHumanSizeComparisonV62(queenId, {
    dimensions: { [queenId]: { heightMeters: 4.5, verification: 'verified', source: '' } }
  }), null);

  const comparison = getHumanSizeComparisonV62(queenId, {
    dimensions: {
      [queenId]: {
        heightMeters: 4.5,
        verification: 'verified',
        source: 'licensed-dimension-record'
      }
    },
    humanReference: {
      heightMeters: 1.8,
      status: 'comparison-reference-not-canon'
    }
  });
  assert.deepEqual(comparison, {
    entryId: queenId,
    heightMeters: 4.5,
    humanHeightMeters: 1.8,
    ratioToHuman: 2.5,
    source: 'licensed-dimension-record',
    verification: 'verified',
    referenceStatus: 'comparison-reference-not-canon'
  });
});

test('les vignettes utilisent les résolveurs existants et exposent leur cellule idle réelle', () => {
  const dedicatedDrone = resolveSpriteSheet('enemy.profile.enemy-004-drone-big-chap.v66');
  const cases = [
    [idStartingWith(WEAPONS, 'weapon-008-'), 'weapon.m39-submachine-gun.action', 'idle', [0, 1, 2, 3]],
    [idStartingWith(EQUIPMENT, 'equipment-001-'), 'equipment.m314-motion-tracker.use', 'packed', [0]],
    [idStartingWith(ENEMIES, 'enemy-004-'), dedicatedDrone?.id || 'enemy.xenomorph-big-chap.action.v56', 'idle', dedicatedDrone ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1, 2, 3]],
    [idStartingWith(VEHICLES, 'vehicle-005-'), 'vehicle.m40-ridgeway-heavy-tank.action.v56', 'idle', [0, 1, 2, 3]]
  ];
  for (const [id, sheetId, clipId, frames] of cases) {
    const visual = getCatalogEntryV62(id).visual;
    assert.ok(visual, id);
    assert.equal(visual.sheetId, sheetId, id);
    assert.equal(visual.idleClip.sheetId, sheetId, id);
    assert.equal(visual.idleClip.clip.id, clipId, id);
    assert.deepEqual(visual.idleClip.clip.frames, frames, id);
    assert.deepEqual(visual.idleClip.firstCell, {
      index: frames[0],
      column: 0,
      row: 0,
      cellWidth: 256,
      cellHeight: 256
    }, id);
    assert.match(visual.path, /^\/assets\/openai\/sprites\/normalized\//, id);
  }
});

test('le catalogue M577 Standard et ses huit fits au total utilisent la vraie plaque du runtime', () => {
  const fits = VEHICLES.filter((entry) => entry.id.includes('-m577-armored-personnel-carrier'));
  assert.deepEqual(fits.map((entry) => entry.fit), ['Standard', 'Recon', 'Assault', 'Rescue', 'Colonial', 'Frontier', 'Prototype', 'Apex']);
  const expectedPath = '/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png';
  assert.equal(existsSync(new URL(`..${expectedPath}`, import.meta.url)), true);
  for (const entry of fits) {
    const visual = getCatalogEntryV62(entry.id).visual;
    const runtime = resolveVehicleAnimation(entry);
    const sheet = resolveSpriteSheet(runtime.sheetId);
    assert.ok(visual, entry.id);
    assert.equal(visual.sheetId, 'vehicle.m577-apc.action', entry.id);
    assert.equal(visual.sheetId, runtime.sheetId);
    assert.equal(visual.path, expectedPath);
    assert.equal(visual.path, sheet.path);
    assert.equal(visual.imageKey, 'apc');
    assert.deepEqual([visual.renderWidth, visual.renderHeight], [250, 140]);
    assert.deepEqual(visual.grid, { columns: 4, rows: 4, cellWidth: 256, cellHeight: 256 });
    assert.equal(visual.idleClip.clip.id, 'idle');
    assert.deepEqual(visual.idleClip.clip.frames, [0, 1, 2, 3]);
    assert.equal(visual.idleClip.firstCell.index, 0);
    const standard = entry.fit === 'Standard';
    assert.equal(visual.identity.status, standard ? 'exact' : 'authored-family');
    assert.equal(visual.identity.exact, standard, 'un fit ne devient pas une nouvelle plaque exacte');
    assert.equal(visual.identity.approximate, !standard);
    assert.equal(visual.identity.referenceStatus, entry.referenceStatus);
    if (!standard) assert.ok(visual.identity.fallbackReason.includes(entry.fit));
  }
});

test('le raccordement catalogue M577 ne masque pas les trois châssis bloqués faute de références', () => {
  const blocked = VEHICLES.filter((entry) => String(entry.visualStatus).startsWith('BLOCKED_'));
  assert.deepEqual(blocked.filter((entry) => entry.fit === 'Standard').map((entry) => entry.id), [
    'vehicle-003-m570-armored-personnel-carrier',
    'vehicle-006-m292-combat-buggy',
    'vehicle-011-ad-19cd-dropship'
  ]);
  assert.equal(blocked.length, 24, 'trois châssis et leurs huit fits restent explicitement bloqués');
  for (const entry of blocked) {
    assert.equal(getCatalogEntryV62(entry.id).visual, null, entry.id);
    assert.equal(resolveVehicleAnimation(entry), null, entry.id);
  }
});

test('les alias d’équipement gardent une vignette déterministe même sans clip packed natif', () => {
  const torch = getCatalogEntryV62(idStartingWith(EQUIPMENT, 'equipment-004-'));
  assert.equal(torch.visual.sheetId, 'weapon.cutting-torch.action');
  assert.equal(torch.visual.idleClip.clip.id, 'packed');
  assert.deepEqual(torch.visual.idleClip.clip.frames, [0]);
  assert.equal(torch.visual.idleClip.firstCell.index, 0);
});

test('les lectures inconnues retournent null ou une liste vide et les résultats sont immuables', () => {
  assert.equal(getCatalogEntryV62('missing-entry'), null);
  assert.equal(getCatalogNodeV62('missing-node'), null);
  assert.equal(getCatalogPathV62('missing-entry'), null);
  assert.deepEqual(getCatalogChildrenV62('missing-node'), []);
  assert.deepEqual(getBiologicalRelationsV62('missing-entry'), []);
  assert.equal(getHumanSizeComparisonV62('missing-entry'), null);
  assert.equal(Object.isFrozen(CATALOG_RECORDS_V62), true);
  assert.equal(Object.isFrozen(CATALOG_RECORDS_V62[0]), true);
  assert.equal(Object.isFrozen(searchCatalogV62('m41a')), true);
  assert.equal(Object.isFrozen(getCatalogPathV62(WEAPONS[0].id)), true);
});
