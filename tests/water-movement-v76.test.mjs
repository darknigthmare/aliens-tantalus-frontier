import assert from 'node:assert/strict';
import test from 'node:test';
import { GameEngine } from '../src/game-v51-runtime.js';

const controls = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' };
function simulate(fps, { slow = 0.7, seconds = 2, hazardClock = 0, coop = false, leaveAt = Infinity } = {}) {
  const actor = { x: 100, y: 100, w: 42, h: 92, vx: 0, vy: 0, grounded: true,
    alive: true, coop, health: 100, jumpBuffer: 0, fireClock: 0, actionClock: 0,
    hazardClock, coyoteTime: 0, hazardKind: 'flood' };
  const engine = {
    keys: new Set(['KeyD']), hazards: [{ active: true, kind: 'flood', slow, damage: 0, x: 0, y: 170, w: 3000, h: 80 }],
    nearestLadder: () => null, findCover: () => null,
    resolveVertical(player) { player.y = 100; player.vy = 0; player.grounded = true; },
    resolveHorizontal() {}, damagePlayer(player, amount) { player.health -= amount; },
    applyHazards: GameEngine.prototype.applyHazards
  };
  for (let frame = 0; frame < fps * seconds; frame += 1) {
    if (frame / fps >= leaveAt) engine.hazards = [];
    GameEngine.prototype.updatePlayer.call(engine, actor, 1 / fps, controls);
  }
  return actor;
}

test('la marche dans une eau identique parcourt la même distance à 30, 60, 120 et 144 FPS', () => {
  const runs = [30, 60, 120, 144].map((fps) => simulate(fps));
  for (const actor of runs) {
    assert.ok(Math.abs(actor.x - runs[0].x) < 1e-7);
    assert.ok(Math.abs(actor.vx - 245 * 0.7) < 1e-6);
    assert.equal(actor.health, 100);
  }
  assert.ok(runs[0].x > 400 && runs[0].x < 450, 'vitesse de traversée conservée à 70 pour cent');
});

test('le cooldown de dégâts et le joueur coop ne changent pas la traînée', () => {
  const normal = simulate(60);
  const recovering = simulate(60, { hazardClock: 5, coop: true });
  assert.equal(normal.x, recovering.x);
  const unimpeded = simulate(60, { slow: 1 });
  assert.ok(unimpeded.x > normal.x + 100);
  assert.ok(Math.abs(unimpeded.vx - 245) < 1e-6);
});

test('sortir du bassin rétablit la vitesse au sol sans conserver le ralentissement aquatique', () => {
  const submerged = simulate(60);
  const emerged = simulate(60, { leaveAt: 1 });
  assert.ok(emerged.x > submerged.x + 50);
  assert.ok(Math.abs(emerged.vx - 245) < 1e-6);
  assert.equal(emerged.health, 100);
});
