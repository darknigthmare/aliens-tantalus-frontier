import test from 'node:test';
import assert from 'node:assert/strict';
import { COMBAT_FEEL_V188, knockbackDistanceV188 } from '../src/combat-feel-v188.js';
import { fixture, tick } from './engine-host-v188.mjs';

// Same deterministic scene before (feel pass disabled) and after: one drone-sized
// enemy 260 px in front of the player, 1.5 s of continuous fire.
async function scene({ enabled, reducedMotion = false }) {
  const { engine } = await fixture();
  engine.combatFeelV188Enabled = enabled;
  if (reducedMotion) engine.accessibilityRuntime = { ...engine.accessibilityRuntime, reducedMotion: true, screenShake: 0 };
  const p = engine.player; Object.assign(p, { facing: 1, grounded: true, alive: true, ammo: 99, ammoReserve: 400 });
  const template = engine.enemyCatalog?.[0] || {};
  const enemy = { ...structuredClone(engine.enemies?.[0] || {}), id: 'feel-target', x: p.x + 260, y: p.y + p.h - 60, w: 40, h: 60,
    alive: true, health: 400, maxHealth: 400, armor: 0, grounded: true, isBoss: false, staggerClock: 0, hurtClock: 0, revealed: 0,
    biology: 'xenomorph', name: template.name || 'drone', vx: 0, vy: 0, speed: 0, damage: 0 };
  engine.enemies = [enemy];
  const startX = enemy.x; let peakShake = 0, frames = 0;
  for (let t = 0; t < 1.5; t += 1 / 60) {
    if (!(p.fireClock > 0)) engine.fire(p);
    tick(engine, 1 / 60); frames++; peakShake = Math.max(peakShake, engine.cameraShake || 0);
    Object.assign(p, { alive: true, health: 100 });
  }
  const result = { shots: p.shots, peakShake, enemyHealth: enemy.health, displacement: enemy.x - startX,
    metrics: { ...engine.combatFeelMetricsV188 } };
  engine.stop(); return result;
}

test('feel values stay small and bounded; bosses and climbing enemies are never pushed', () => {
  assert.equal(COMBAT_FEEL_V188.shotKickCap, .22);
  assert.equal(knockbackDistanceV188({ alive: true }, 100), COMBAT_FEEL_V188.knockbackPx);
  assert.equal(knockbackDistanceV188({ alive: true }, 5), 1.5);
  assert.equal(knockbackDistanceV188({ alive: true, isBoss: true }, 100), 0);
  assert.equal(knockbackDistanceV188({ alive: true, climbing: true }, 100), 0);
  assert.equal(knockbackDistanceV188({ alive: true, grounded: false }, 100), 0);
});

test('before/after on the same scene: same shots and damage, added kick, markers and knockback', async () => {
  const before = await scene({ enabled: false }), after = await scene({ enabled: true });
  console.log('V188 combat feel measurement', JSON.stringify({ before, after }));
  assert.ok(before.shots > 3); assert.equal(after.shots, before.shots, 'fire rate unchanged');
  assert.equal(before.metrics.hitMarkers, 0); assert.equal(before.displacement, 0);
  assert.ok(after.metrics.kicks === after.shots, 'one camera kick per accepted shot');
  assert.ok(after.metrics.hitMarkers > 0, 'hits are confirmed');
  assert.ok(after.displacement > 0 && after.displacement <= after.metrics.hitMarkers * COMBAT_FEEL_V188.knockbackPx + 1e-9);
  assert.ok(after.peakShake >= before.peakShake);
  assert.ok(after.peakShake <= COMBAT_FEEL_V188.killKick + 1e-9);
});

test('reduced motion removes every camera effect of the pass', async () => {
  const result = await scene({ enabled: true, reducedMotion: true });
  assert.equal(result.metrics.kicks, 0); assert.equal(result.peakShake, 0);
  assert.ok(result.metrics.hitMarkers > 0, 'the hit marker is not motion and stays');
});
