// Regression tests for the full main-campaign browser playthrough of 2026-11-22
// (docs/development/PLAYTHROUGH_V188_20261122.md): each test pins a bug found on the
// real page, from a new game to the Saison des Reines call.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS } from '../src/content.js';

const campaign = id => CAMPAIGNS.find(entry => entry.id === id);

// Found in QZ-17: once the boss fell, the « containment » checkpoint was written at the
// legacy world floor (FLOOR_Y = 930) whatever the level. The QZ-17 interior floor is at
// y 868, so a marine downed after the boss respawned below the floor, fell and was downed
// again: « ENTRÉE · reprendre au checkpoint confinement » looped forever (soft-lock).
test('boss checkpoint: after the boss falls, a checkpoint restart lands on a real surface and survives (QZ-17)', async () => {
  const entry = campaign('special-narrative-qz17');
  const world = WORLDS.find(candidate => candidate.id === entry.worldId) || WORLDS[0];
  const { engine } = await fixture({ campaign: entry, options: { world }, keepEnemies: true });
  const boss = engine.enemies.find(enemy => enemy.isBoss);
  assert.ok(boss, 'QZ-17 places a boss');
  engine.enemies = [boss];
  engine.defeatEnemy(boss, engine.player);
  assert.equal(engine.checkpoint.id, 'containment');
  const feet = engine.checkpoint.y + engine.player.h;
  assert.ok(Number.isFinite(boss.groundY), 'the level boss stands on a known surface');
  assert.ok(feet <= boss.groundY + 1, `checkpoint feet ${feet} must not be under the boss surface ${boss.groundY}`);
  // The marine goes down later; ENTER resumes at the containment checkpoint.
  engine.enemies = []; engine.hostileProjectiles = [];
  engine.player.health = 0; engine.failMission('squad-down');
  assert.equal(engine.mission.state, 'failed');
  assert.equal(engine.restartFromCheckpoint(), true);
  tick(engine, 3);
  assert.equal(engine.mission.state, 'active', 'the restarted marine is not downed again by a fall');
  assert.ok(engine.player.grounded, 'the restarted marine stands on a surface');
  assert.ok(engine.player.y + engine.player.h <= boss.groundY + 1, `feet ${engine.player.y + engine.player.h} under ${boss.groundY}`);
});
