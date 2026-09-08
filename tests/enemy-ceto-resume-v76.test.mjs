import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-v51-runtime.js';
import { GameEngine as ResumeEngine } from '../src/game-production-resume.js';
import { ENEMIES } from '../src/content-core-v50.js';
import { CETO_V75, getCetoAnimationV75, updateCetoV75 } from '../src/enemy-ceto-v75.js';

function fixture() {
  const volume = { id: 'ceto-resume-water', kind: 'water', active: true, x: 0, y: 0, w: 1000, h: 300 };
  const player = { id: 'player', x: 340, y: 108, w: 42, h: 92, alive: true, downed: false,
    lost: false, health: 100, maxHealth: 100, armor: 0, maxArmor: 0 };
  const source = ENEMIES.find(entry => entry.id === CETO_V75.profileId);
  const enemy = GameEngine.prototype.createEnemy.call({ random: () => 0.5 }, source, 1, 100, 200);
  enemy.cetoHabitatId = volume.id;
  enemy.attackClock = 0;
  const impacts = [];
  const engine = { enemies: [enemy], player, coopEnabled: false, squadActors: [],
    missionLevelRuntime: { aquaticHabitats: [volume] }, resumeIdentity: {},
    walls: [], doors: [], covers: [], platforms: [], vents: [], supplies: [], drops: [], keys: new Set(),
    activeSquadActors() { return this.squadActors; },
    damagePlayer(target, amount) { impacts.push(amount); target.health -= amount; },
    onEvent() {}
  };
  return { engine, enemy, player, impacts,
    save: () => ResumeEngine.prototype.captureResumeState.call(engine),
    restore: saved => ResumeEngine.prototype.applyResumeState.call(engine, saved),
    step: dt => updateCetoV75(engine, enemy, dt) };
}

test('Ceto reprise froide : une morsure déjà livrée ne rejoue pas son impact et conserve une récupération', () => {
  const original = fixture();
  original.step(0);
  original.step(CETO_V75.impact);
  assert.equal(original.impacts.length, 1);
  const saved = original.save();
  assert.equal(saved.enemies[0].cetoAttackActiveV75, true);
  assert.equal('cetoAttackV75' in saved.enemies[0], false);
  const restored = fixture();
  assert.equal(restored.restore(saved).applied, true);
  assert.equal(restored.enemy.cetoAttackV75, null);
  assert.ok(restored.enemy.attackClock >= CETO_V75.duration);
  restored.step(0.5);
  assert.equal(restored.impacts.length, 0);
  assert.equal(restored.enemy.attacking, false);
  assert.equal(restored.player.health, original.player.health);
  restored.step(CETO_V75.duration - 0.5 + 0.001);
  restored.step(CETO_V75.impact);
  assert.equal(restored.impacts.length, 1, 'une nouvelle morsure reste possible après la récupération');
});

test('Ceto reprise sur moteur vivant : efface le verrou, le curseur et les vitesses de l’attaque interrompue', () => {
  const current = fixture();
  const saved = current.save();
  current.step(0);
  current.step(0.25);
  assert.ok(current.enemy.cetoAttackV75);
  current.enemy.vx = 100;
  current.enemy.vy = 30;
  current.enemy.pendingMelee = true;
  current.enemy.pendingMeleeTargetId = 'player';
  current.restore(saved);
  assert.equal(current.enemy.cetoAttackV75, null);
  assert.equal(current.enemy.attacking, false);
  assert.equal(current.enemy.pendingMelee, false);
  assert.equal(current.enemy.pendingMeleeTargetId, null);
  assert.equal(current.enemy.vx, 0);
  assert.equal(current.enemy.vy, 0);
  assert.equal(getCetoAnimationV75(current.enemy).clipId, 'idle');
});

test('Ceto reprise : conserve le cooldown entre morsures et borne les données de sauvegarde', () => {
  const original = fixture();
  original.enemy.attackClock = 1.25;
  const saved = original.save();
  assert.equal(saved.enemies[0].attackClock, 1.25);
  const restored = fixture();
  restored.restore(saved);
  assert.equal(restored.enemy.attackClock, 1.25);
  restored.step(0.5);
  assert.equal(restored.impacts.length, 0);
  assert.equal(restored.enemy.cetoAttackV75, null);
  saved.enemies[0].attackClock = 999999;
  restored.restore(saved);
  assert.equal(restored.enemy.attackClock, CETO_V75.cooldown);
});

test('Ceto reprise terminale : conserve la mort et ne réactive jamais une morsure du cadavre', () => {
  const current = fixture();
  current.enemy.alive = false;
  current.enemy.health = 0;
  current.enemy.deathClock = 0.8;
  const restored = fixture();
  restored.step(0);
  restored.restore(current.save());
  assert.equal(restored.enemy.alive, false);
  assert.equal(restored.enemy.deathClock, 0.8);
  assert.equal(restored.enemy.cetoAttackV75, null);
  restored.step(0.5);
  assert.equal(restored.impacts.length, 0);
  assert.equal(getCetoAnimationV75(restored.enemy).clipId, 'death');
  assert.equal(getCetoAnimationV75(restored.enemy).frame, 31);
});

test('Ceto au fond du bassin : poursuit un marine dans les deux sens sans bloquer sa nage horizontale', () => {
  for (const facing of [1, -1]) {
    const current = fixture();
    const volume = current.engine.missionLevelRuntime.aquaticHabitats[0];
    volume.h = 212;
    current.enemy.x = facing > 0 ? 100 : 600;
    current.player.x = facing > 0 ? 450 : 300;
    current.player.y = volume.y + volume.h - current.player.h;
    const start = current.enemy.x;
    for (let frame = 0; frame < 180; frame += 1) current.step(1 / 60);
    assert.ok((current.enemy.x - start) * facing > 80, 'la poursuite continue une fois arrivé au fond');
    assert.ok(current.impacts.length > 0, 'la cible reste attaquable au terme de la poursuite');
    assert.ok(current.enemy.y + current.enemy.h <= volume.y + volume.h + 1e-6);
  }
});
