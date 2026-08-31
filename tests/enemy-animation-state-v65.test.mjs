import test from 'node:test';
import assert from 'node:assert/strict';
import { SPRITE_SHEETS, resolveEnemyAnimation, resolveSpriteClip } from '../src/sprite-animation-runtime.js';

const actionSets = new Set(['enemy-action-v54', 'enemy-action-v56', 'facehugger-action-v65', 'newborn-action-v64', 'offspring-action-v64', 'predalien-action-v64']);

test('une blessure non letale conserve chaque identite dediee sans jouer la mort', () => {
  for (const sheet of Object.values(SPRITE_SHEETS).filter((entry) => actionSets.has(entry.clipSet))) {
    for (const clock of ['hurtClock', 'v52HurtClock']) {
      const actor = { alive: true, visualSheetId: sheet.id, spriteKey: sheet.imageKey, [clock]: 0.2, attacking: true, alert: true };
      const request = resolveEnemyAnimation(actor);
      assert.equal(request.sheetId, sheet.id);
      assert.equal(request.clipId, 'idle', sheet.id);
      assert.equal(request.reaction, 'hurt', sheet.id);
      const clip = resolveSpriteClip(request.sheetId, request.clipId);
      assert.ok(clip);
      assert.equal(clip.events?.some((event) => event.type === 'state:death-lock'), false);
      assert.equal(resolveEnemyAnimation({ ...actor, alive: false }).clipId, 'death');
    }
  }
});

test('un ovomorphe touche ne passe pas dans le cycle detruit avant sa mort', () => {
  const actor = { spriteKey: 'ovomorph', alive: true, hurtClock: 0.2 };
  assert.equal(resolveEnemyAnimation(actor).clipId, 'sealed');
  assert.equal(resolveEnemyAnimation({ ...actor, alive: false }).clipId, 'destroyed');
  assert.equal(resolveEnemyAnimation({ ...actor, hurtClock: 0, attacking: true }).clipId, 'hatch');
});
