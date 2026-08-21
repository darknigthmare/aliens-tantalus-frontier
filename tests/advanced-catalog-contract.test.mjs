import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APEX_DOSSIERS,
  ENEMIES,
  NEURO_XENO_PROFILES,
  SHIP_MODULES
} from '../src/content.js';
import { createNeuroRuntime, getModuleQuote } from '../src/advanced-systems.js';

test('chaque module, dossier Apex et profil Neuro-Xeno possède un adaptateur exécutable', () => {
  const enemies = new Map(ENEMIES.map((enemy) => [enemy.id, enemy]));
  const supportedEffects = new Set(['morale', 'security', 'research', 'repair', 'healing', 'detection']);
  for (const module of SHIP_MODULES) {
    const quote = getModuleQuote(module);
    assert.ok(quote.credits > 0 && quote.alloy > 0, module.id);
    assert.ok(module.effects.every((effect) => supportedEffects.has(effect)), module.id);
  }
  for (const dossier of APEX_DOSSIERS) assert.ok(enemies.has(dossier.enemyId), dossier.id);
  for (const profile of NEURO_XENO_PROFILES) {
    const enemy = enemies.get(profile.enemyId);
    assert.ok(enemy, profile.id);
    if (profile.playerClassCompatible) {
      const runtime = createNeuroRuntime(profile, enemy, 51);
      assert.equal(runtime.failureMode, profile.failureMode);
      assert.equal(runtime.signalRange, profile.signalRange);
      assert.equal(runtime.controlDifficulty, profile.controlDifficulty);
    }
  }
});
