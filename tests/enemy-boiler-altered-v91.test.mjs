import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { ENEMIES } from '../src/content-core-v50.js';
import { getCatalogEntryV62 } from '../src/catalog-runtime-v62.js';
import { ENEMY_ENCYCLOPEDIA_CATALOG_V88 } from '../src/enemy-user-campaign-v88.js';
import { ENEMY_USER_CASTES_V87 } from '../src/enemy-user-castes-v87.js';
import {
  ENEMY_VISUAL_OVERRIDES_V56,
  resolveEnemyVisualOverrideV56
} from '../src/enemy-visual-overrides-v56.js';
import { resolveEnemyVisualProfile } from '../src/enemy-visual-runtime-v53.js';
import { resolveSpriteSheet } from '../src/sprite-animation-runtime.js';

const id = 'enemy-014-boiler';
const sheetId = 'enemy.xenomorph-boiler.action.v56';
const path = '/assets/openai/sprites/normalized/enemies/xenomorph-boiler-action-sheet-v56.png';
const source = ENEMIES.find(entry => entry.id === id);
const displayed = ENEMY_ENCYCLOPEDIA_CATALOG_V88.find(entry => entry.id === id);

test('V91 Boiler Altered retrouve son atlas historique par son ID et garde sa désignation', () => {
  const before = JSON.stringify(displayed);
  assert.equal(displayed.name, 'Boiler — Altered');
  const visual = resolveEnemyVisualProfile(displayed);
  assert.equal(visual.baseProfileId, id);
  assert.equal(visual.catalogProfileId, id);
  assert.equal(visual.sheetId, sheetId);
  assert.equal(visual.path, path);
  assert.equal(visual.spriteKey, 'xenoBoilerV56');
  assert.equal(visual.legacy, false);
  assert.equal(visual.identityStatus, 'project-adaptation');
  assert.equal(visual.referenceStatus, 'CANON_REFERENCE_ADAPTATION');
  assert.equal(visual.canonExact, false);
  assert.ok(Object.isFrozen(visual));
  assert.equal(JSON.stringify(displayed), before, 'le libellé et les stats source ne sont pas mutés');
  assert.ok(existsSync(new URL('..' + path, import.meta.url)), 'atlas existant, aucune nouvelle image');
});

test('V91 la fiche et toutes ses previews conservent le vrai atlas Boiler, jamais Drone ou ACM natif', () => {
  const record = getCatalogEntryV62(id);
  assert.equal(record.id, id);
  assert.equal(record.name, 'Boiler — Altered');
  assert.equal(record.visual.path, path);
  assert.equal(record.visual.sheetId, sheetId);
  assert.equal(record.visual.identity.canonExact, false);
  assert.equal(record.visual.identity.exact, false);
  assert.equal(record.canonFacts.source.canonExact, false);
  assert.equal(record.visual.idleClip.sheetId, sheetId);
  assert.ok(record.visual.previewClips.length > 0);
  assert.ok(record.visual.previewClips.every(clip => clip.sheetId === sheetId));
  assert.equal(resolveSpriteSheet(sheetId).path, path);
  assert.deepEqual(record.visual.grid, { columns: 4, rows: 4, cellWidth: 256, cellHeight: 256 });
  assert.equal(record.gameplayStats.health, source.health);
  assert.equal(record.gameplayStats.damage, source.damage);
  const native = getCatalogEntryV62('castes-game_acm_boiler');
  assert.equal(native.visual.path, '/assets/user/castes-v87/game_acm_boiler.png');
  assert.notEqual(record.visual.path, native.visual.path);
  assert.equal(native.visual.animationStatus, 'missing');
});

test('V91 le libellé Altered seul ou un autre ID ne peut emprunter le nouvel alias Boiler', () => {
  for (const entry of [
    'Boiler — Altered',
    { name: 'Boiler — Altered' },
    { id: 'enemy-066-albino-boiler', name: 'Boiler — Altered' },
    { id: 'castes-game_acm_boiler', name: 'Boiler — Altered' },
    { id, name: 'Spitter — Altered' }
  ]) assert.equal(resolveEnemyVisualOverrideV56(entry), null, JSON.stringify(entry));
});

test('V91 aucune résolution historique non décorée ni famille Altered voisine n’est modifiée', () => {
  assert.equal(resolveEnemyVisualOverrideV56(source), ENEMY_VISUAL_OVERRIDES_V56.Boiler);
  for (const entry of Object.values(ENEMY_VISUAL_OVERRIDES_V56)) {
    assert.equal(resolveEnemyVisualOverrideV56({ id: entry.baseProfileId, name: entry.archetype }), entry);
    if (entry.baseProfileId === id) continue;
    assert.equal(resolveEnemyVisualOverrideV56({ id: entry.baseProfileId, name: entry.archetype + ' — Altered' }), null);
  }
  const variant = ENEMIES.find(entry => entry.id === 'enemy-066-albino-boiler');
  const visual = resolveEnemyVisualOverrideV56(variant);
  assert.equal(visual.identityStatus, 'authored-family');
  assert.equal(visual.path, path);
  assert.equal(visual.catalogProfileId, variant.id);
});

test('V91 les 35 poses natives conservent leurs propres chemins et leur statut non animé', () => {
  assert.equal(ENEMY_USER_CASTES_V87.length, 35);
  for (const entry of ENEMY_USER_CASTES_V87) {
    const record = getCatalogEntryV62(entry.id);
    assert.equal(record.visual.path, entry.path, entry.id);
    assert.equal(record.visual.identity.canonExact, false, entry.id);
    assert.equal(record.visual.animationStatus, 'missing', entry.id);
    assert.deepEqual(record.visual.previewClips, [], entry.id);
  }
});
