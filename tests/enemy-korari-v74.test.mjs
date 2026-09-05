import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createKorariFixture, GameEngine, MissionLevelEngine, PROFILE_ID, SHEET_ID, EXPECTED_ATLAS_SHA256, RUNTIME_PROPOSAL } from '../docs/references/v74-enemy-fixes/050/korari-engine-fixture.mjs';
import { resolveSpriteSheet, resolveSpriteClip, resolveEnemyAnimation, SpriteAnimationController, SPRITE_HITBOXES } from '../src/sprite-animation-runtime.js';
import { resolveEnemyProfileVisualV66 } from '../src/enemy-profile-registry-v66.js';
import { ENEMY_BATCH_COMBAT_CONTRACTS_V66, getEnemyBatchAttackFrameV66 } from '../src/enemy-batch-combat-v66.js';

const json = (path) => JSON.parse(readFileSync(new URL('../' + path, import.meta.url)));
const metadata = json('assets/openai/sprites/metadata/v66/' + PROFILE_ID + '.json');
const measures = json('docs/references/v74-enemy-fixes/050/korari-raster-measurements.json');
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 1e-6, message || (a + ' != ' + b));
const contract = ENEMY_BATCH_COMBAT_CONTRACTS_V66[PROFILE_ID];

test('050: unchanged source/atlas hashes, no second anatomical scaling or fabricated airborne ground', () => {
  const atlas = readFileSync(new URL('../' + metadata.normalized, import.meta.url));
  assert.equal(createHash('sha256').update(atlas).digest('hex'), EXPECTED_ATLAS_SHA256);
  assert.equal(metadata.normalizedSha256, EXPECTED_ATLAS_SHA256);
  assert.equal(metadata.frameCount, 32);
  assert.deepEqual(metadata.sourceScaleByClip, { idle: 1, move: 1, attack: 1, death: 1 });
  for (const source of metadata.sources) {
    const bytes = readFileSync(new URL('../' + source.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256);
  }
  assert.equal(metadata.physicalAnchorReview.status, 'reviewed');
  assert.equal(metadata.physicalAnchorReview.reviewedPoseCount, 32);
  assert.equal(metadata.postGenerationScaleReview.status, 'reviewed');
  assert.deepEqual(measures.frames.slice(19, 22).map((f) => f.groundClearance), [10, 2, 10]);
  assert.equal(measures.frames[31].height, 31, 'last corpse is prone, not a standing-loop fallback');
});

test('050: exact dedicated runtime identity, 288-square uniform render, 96x60 torso and original-model status', () => {
  const visual = resolveEnemyProfileVisualV66({ id: PROFILE_ID });
  const sheet = resolveSpriteSheet(SHEET_ID);
  assert.equal(visual?.sheetId, SHEET_ID);
  assert.equal(sheet?.renderWidth, 288);
  assert.equal(sheet?.renderHeight, 288);
  assert.equal(sheet.clipSet, 'enemy-action-v66');
  assert.equal(sheet.path, '/' + metadata.normalized);
  assert.equal(visual.canonExact, false);
  assert.notEqual(visual.identityStatus, 'source-locked-adaptation', 'project-original fauna is not claimed as exact franchise art');
  const body = SPRITE_HITBOXES[sheet.hitbox];
  near(body.width * sheet.renderWidth / 256, 96);
  near(body.height * sheet.renderHeight / 256, 60);
  near(body.x + body.width / 2, 128);
  near(body.y + body.height, 240);
  assert.equal(resolveEnemyProfileVisualV66({ id: 'not-korari', name: 'Korari Stalker' }), null);
  for (const key of ['distanceMetric', 'stopRange', 'meleeRange', 'lungeDistance', 'windup', 'impact', 'duration', 'cooldown', 'speedMultiplier', 'verticalRange']) assert.equal(contract[key], RUNTIME_PROPOSAL[key], key);
});

for (const [label, Engine] of [['V51', GameEngine], ['V52 production', MissionLevelEngine]]) {
  for (const facing of [1, -1]) {
    test('050 ' + label + ' direction' + facing + ': stationary coil then measured symmetric pounce and one bite on pose5', () => {
      const { enemy, engine, damage, events, step, arm } = createKorariFixture(Engine, { facing });
      near(enemy.w, 96); near(enemy.h, 60);
      const origin = { x: enemy.x, y: enemy.y };
      arm();
      step(contract.windup);
      near(enemy.x, origin.x, 'coil must not slide before the authored takeoff');
      assert.equal(damage.length, 0);
      step(contract.impact - contract.windup - 0.0001);
      assert.equal(damage.length, 0);
      step(0.0001);
      assert.equal(getEnemyBatchAttackFrameV66(enemy), 4);
      assert.equal(damage.length, 1);
      assert.equal(damage[0].amount, enemy.damage);
      near(enemy.x - origin.x, facing * 70);
      near(enemy.y, origin.y, 'authored atlas clearance must not receive a second artificial y-lift');
      near(Math.abs(engine.player.x + engine.player.w / 2 - enemy.x - enemy.w / 2), 98);
      assert.ok(98 < RUNTIME_PROPOSAL.jawForwardReach + engine.player.w / 2, 'visible jaw reaches the target at impact');
      step(contract.duration - contract.impact + 0.0001);
      assert.equal(enemy.batchAttackV66, null);
      assert.equal(damage.length, 1);
      assert.ok(enemy.attackClock > 0);
      step(0);
      assert.equal(enemy.batchAttackV66, null);
      assert.equal(events.filter((e) => e.type === 'enemy-attack-impact').length, 1);
    });
  }
  for (const kind of ['wall', 'door', 'cover']) {
    test('050 ' + label + ': ' + kind + ' appearing during windup cancels without biting through it', () => {
      const { engine, enemy, damage, events, step, arm } = createKorariFixture(Engine);
      arm();
      const solid = { x: 735, y: 790, w: 2, h: 140 };
      if (kind === 'wall') engine.walls.push(solid);
      if (kind === 'door') engine.doors.push({ ...solid, progress: 0 });
      if (kind === 'cover') engine.covers.push({ ...solid, destroyed: false });
      step(contract.impact);
      assert.equal(damage.length, 0);
      assert.equal(enemy.batchAttackV66, null);
      assert.ok(events.some((e) => e.type === 'enemy-attack-cancelled'));
    });
  }
  test('050 ' + label + ': moving target outside actual jaw reach is not hit remotely', () => {
    const { engine, damage, step, arm } = createKorariFixture(Engine);
    arm();
    engine.player.x += 25;
    step(contract.impact);
    assert.equal(damage.length, 0);
  });
  test('050 ' + label + ': locked bite never transfers to a nearer coop', () => {
    const { engine, enemy, damage, step, arm } = createKorariFixture(Engine);
    arm();
    engine.coopEnabled = true; engine.coop.x = enemy.x + 90;
    step(contract.impact);
    assert.equal(damage.length, 1);
    assert.equal(damage[0].target, engine.player);
    assert.equal(engine.player.health, 74);
    assert.equal(engine.coop.health, 100);
  });
  test('050 ' + label + ': death cancels pending damage even with a nearer coop', () => {
    const { engine, enemy, damage, step, arm } = createKorariFixture(Engine);
    arm();
    engine.coopEnabled = true; engine.coop.x = enemy.x + 90;
    enemy.alive = false; enemy.health = 0; enemy.deathClock = 2.8;
    step(contract.impact);
    assert.equal(damage.length, 0);
    assert.equal(engine.coop.health, 100);
    assert.equal(enemy.batchAttackV66, null);
  });
}

test('050 production: swept pounce cannot hit across an unsupported gap', () => {
  const { engine, enemy, damage, events, step, arm } = createKorariFixture(MissionLevelEngine);
  engine.platforms = [{ id: 'left', x: 0, y: 930, w: 680, h: 40 }, { id: 'right', x: 770, y: 930, w: 1500, h: 40 }];
  enemy.levelNavigation.surfaceId = 'left';
  arm(); step(contract.impact);
  assert.equal(damage.length, 0);
  assert.equal(enemy.batchAttackV66, null);
  assert.ok(engine.missionLevelSurfaceFor(enemy, { tolerance: 40 }));
  assert.ok(events.some((e) => e.type === 'enemy-attack-cancelled' && e.reason === 'collision-blocked'));
});

test('050: death uses eight distinct cells once and holds cell31, never returns to standing', () => {
  const { enemy } = createKorariFixture();
  enemy.alive = false; enemy.deathClock = 2.8;
  const request = resolveEnemyAnimation(enemy);
  assert.equal(request.sheetId, SHEET_ID); assert.equal(request.clipId, 'death');
  const clip = resolveSpriteClip(SHEET_ID, 'death');
  assert.deepEqual(clip.frames, [24, 25, 26, 27, 28, 29, 30, 31]);
  assert.equal(clip.loop, false);
  const controller = new SpriteAnimationController();
  assert.equal(controller.sample(enemy.id, request, 0).frame, 24);
  for (let index = 1; index <= 7; index++) {
    enemy.deathClock = 2.8 - index / 10;
    assert.equal(controller.sample(enemy.id, resolveEnemyAnimation(enemy), index / 10 + 0.00001).frame, 24 + index);
  }
  for (const time of [0.8, 1.2, 2.8]) {
    enemy.deathClock = Math.max(0, 2.8 - time);
    assert.equal(controller.sample(enemy.id, resolveEnemyAnimation(enemy), time).frame, 31);
  }
});
