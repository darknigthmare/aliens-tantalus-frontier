import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPRITE_SHEETS,
  resolveEnemyAnimation,
  resolveNpcAnimation,
  resolvePlayerAnimation,
  resolveSpriteSheet,
  resolveVerifiedPlayerCombat,
  shouldFlipSprite
} from '../src/sprite-animation-runtime.js';

test('chaque plaque déclare une orientation source et un statut d’identité', () => {
  for (const sheet of Object.values(SPRITE_SHEETS)) {
    assert.ok([-1, 1].includes(sheet.sourceFacing), `${sheet.id}: orientation source absente`);
    assert.equal(typeof sheet.identityVerified, 'boolean', `${sheet.id}: statut identité absent`);
  }
});

test('la direction logique reste stable entre locomotion et combat du Drone', () => {
  const locomotion = resolveSpriteSheet('enemy.xenomorph-drone.locomotion');
  const combat = resolveSpriteSheet('enemy.xenomorph-drone.combat');
  assert.equal(locomotion.sourceFacing, 1);
  assert.equal(combat.sourceFacing, -1);
  assert.equal(shouldFlipSprite(locomotion, 1), false);
  assert.equal(shouldFlipSprite(locomotion, -1), true);
  assert.equal(shouldFlipSprite(combat, 1), true);
  assert.equal(shouldFlipSprite(combat, -1), false);
  assert.equal(shouldFlipSprite(null, 1), false);
  assert.equal(shouldFlipSprite(null, -1), true);
});

test('la plaque combat joueur v54 conserve son identité et ses actions dédiées', () => {
  assert.equal(resolveSpriteSheet('player.echo9-marine.combat').identityVerified, true);
  assert.deepEqual(resolveVerifiedPlayerCombat('primary-fire'), {
    sheetId: 'player.echo9-marine.combat',
    clipId: 'primary-fire'
  });
  assert.equal(resolveVerifiedPlayerCombat('hurt-death').clipId, 'hurt-death');

  const marine = resolvePlayerAnimation({ alive: true, grounded: true, v52FireClock: 1 }, true);
  const xeno = resolvePlayerAnimation({ alive: true, grounded: true, visualForm: 'xenomorph', v52FireClock: 1 }, true);
  assert.equal(marine.sheetId, 'player.echo9-marine.combat');
  assert.equal(xeno.sheetId, 'enemy.xenomorph-drone.combat');
});

test('un PNJ inconnu ne prend jamais silencieusement l’identité de Mara', () => {
  assert.equal(resolveNpcAnimation({ crewId: 'crew-inconnu', alive: true }), null);
  assert.equal(resolveNpcAnimation({ crewId: 'crew-01-mara-vega', alive: true }).sheetId, 'npc.mara-vega.locomotion');
  assert.equal(resolveEnemyAnimation({ spriteKey: 'xenoWarrior', alive: true, alert: true }).sheetId, 'enemy.xenomorph-drone.locomotion');
});

test('Pathogen Mimic et Pale Crucible Hunter restent à droite et gardent leur identité', () => {
  for (const [spriteKey, sheetId] of [
    ['pathogenMimic', 'enemy.pathogen-mimic.action'],
    ['paleCrucibleHunter', 'enemy.pale-crucible-hunter.action']
  ]) {
    const sheet = resolveSpriteSheet(sheetId);
    assert.equal(sheet.sourceFacing, 1);
    assert.equal(sheet.identityVerified, true);
    assert.equal(shouldFlipSprite(sheet, 1), false);
    assert.equal(resolveEnemyAnimation({ spriteKey, alive: true, alert: true }).clipId, 'chase');
    assert.equal(resolveEnemyAnimation({ spriteKey, alive: true, attacking: true }).clipId, 'attack');
    assert.equal(resolveEnemyAnimation({ spriteKey, alive: false }).clipId, 'death');
  }
});
