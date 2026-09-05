import { createKorariFixture, GameEngine, MissionLevelEngine, PROFILE_ID, SHEET_ID, RUNTIME_PROPOSAL } from './korari-engine-fixture.mjs';
import { resolveSpriteSheet, resolveEnemyAnimation, SpriteAnimationController } from '../../../../src/sprite-animation-runtime.js';
import { GameEngine as ResumeEngine } from '../../../../src/game-production-resume.js';
import { getEnemyBatchAttackFrameV66 } from '../../../../src/enemy-batch-combat-v66.js';

const requireThat = (value, message) => { if (!value) throw new Error(message); };
const storageSnapshot = () => JSON.stringify(Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)]));
async function loadImage(path) { const image = new Image(); image.src = path; await image.decode(); return image; }
const center = (actor) => actor.x + actor.w / 2;

export async function runKorariBrowserFixture() {
  const before = storageSnapshot();
  const sheet = resolveSpriteSheet(SHEET_ID);
  requireThat(sheet?.renderWidth === 288 && sheet?.renderHeight === 288, '050 reviewed runtime entry is absent or wrong');
  const image = await loadImage(sheet.path);
  const marineSheet = resolveSpriteSheet('player.echo9-marine.locomotion');
  const marineImage = await loadImage(marineSheet.path);
  const canvas = document.querySelector('#combat-proof');
  const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#141e27'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e3edf0'; ctx.font = '17px sans-serif';
  ctx.fillText('050 KORARI · Rendu réel et combat isolés — aucune sauvegarde', 20, 30);
  ctx.fillText('Atlas intact · rendu288² · corps96×60 · morsurepose5 · variantes gauche/droite', 20, 60);
  const cases = [];
  for (const [label, Engine] of [['V51', GameEngine], ['V52 production', MissionLevelEngine]]) {
    for (const facing of [1, -1]) {
      const fix = createKorariFixture(Engine, { facing });
      const { engine, enemy, damage, events, step, arm, contract } = fix;
      engine.spriteAnimation = new SpriteAnimationController();
      engine.images.set(sheet.imageKey, image);
      engine.images.set(marineSheet.imageKey, marineImage);
      const origin = { x: enemy.x, y: enemy.y };
      arm(); step(contract.windup);
      const coilDisplacement = enemy.x - origin.x;
      step(contract.impact - contract.windup - 0.0001);
      const hpBefore = engine.player.health;
      step(0.0001);
      const atImpact = { hp: engine.player.health, hits: damage.length, frame: getEnemyBatchAttackFrameV66(enemy),
        displacement: enemy.x - origin.x, centerSeparation: Math.abs(center(enemy) - center(engine.player)),
        feet: enemy.y + enemy.h, actorYUnchanged: enemy.y === origin.y };
      if (Engine === MissionLevelEngine) {
        const panel = facing > 0 ? 0 : 1;
        const offsetX = panel * 680 + 150 - enemy.x;
        const offsetY = 325 - 930;
        ctx.save(); ctx.translate(offsetX, offsetY);
        ctx.strokeStyle = '#557f8c'; ctx.beginPath(); ctx.moveTo(-offsetX, 930); ctx.lineTo(680 - offsetX + panel * 680, 930); ctx.stroke();
        engine.drawEnemy(ctx, enemy);
        const marineSample = engine.spriteAnimation.sample('marine-' + facing, { sheetId: marineSheet.id, clipId: 'idle', frame: 0 }, 0, { emit: false });
        engine.drawSpriteSample(ctx, marineSample, engine.player);
        ctx.strokeStyle = '#e9b95a'; ctx.strokeRect(enemy.x, enemy.y, enemy.w, enemy.h);
        ctx.strokeStyle = '#78bdd4'; ctx.strokeRect(engine.player.x, engine.player.y, engine.player.w, engine.player.h);
        ctx.restore();
        ctx.fillStyle = '#dfe8ed'; ctx.fillText('V52 ' + (facing > 0 ? '→' : '←') + ' : déplacement' + atImpact.displacement + 'px / impact26 / appui930', panel * 680 + 20, 370);
        requireThat(Math.abs(enemy.spritePivot.world.x - center(enemy)) < 1e-6 && Math.abs(enemy.spritePivot.world.y - 930) < 1e-6, 'real production pivot does not equal body root');
        atImpact.renderPivot = { ...enemy.spritePivot };
        atImpact.renderBody = { ...enemy.spriteHitbox.local };
      }
      step(contract.duration - contract.impact + 0.0001);
      const result = { engine: label, facing, sheet: enemy.visualSheetId, body: [enemy.w, enemy.h], coilDisplacement,
        hpBefore, atImpact, totalHits: damage.length, cooldown: enemy.attackClock,
        attackEnded: enemy.batchAttackV66 === null, impactEvents: events.filter((e) => e.type === 'enemy-attack-impact').length };
      requireThat(coilDisplacement === 0 && hpBefore === 100 && atImpact.hits === 1 && atImpact.frame === 4
        && atImpact.hp === 74 && Math.abs(atImpact.displacement - facing * 70) < 1e-6
        && result.totalHits === 1 && result.attackEnded && result.impactEvents === 1, JSON.stringify(result));
      cases.push(result);
    }
  }
  const contact = document.querySelector('#pose-proof');
  const c = contact.getContext('2d'); c.imageSmoothingEnabled = false;
  c.fillStyle = '#141e27'; c.fillRect(0, 0, contact.width, contact.height);
  const production = createKorariFixture(MissionLevelEngine);
  production.engine.images.set(sheet.imageKey, image);
  production.engine.spriteAnimation = new SpriteAnimationController();
  const rootRecords = [];
  for (let frame = 0; frame < 32; frame++) {
    const clip = ['idle', 'move', 'attack', 'death'][Math.floor(frame / 8)];
    const left = (frame % 4) * 340;
    const top = Math.floor(frame / 4) * 170;
    const floor = top + 150;
    const actor = { ...production.enemy, id: 'pose-' + frame, x: left + 180 - 48, y: floor - 60,
      facing: 1, alive: true, alert: false, revealed: 0 };
    const sample = production.engine.spriteAnimation.sample(actor.id, { sheetId: SHEET_ID, clipId: clip, frame }, 0, { emit: false });
    requireThat(sample.frame === frame, 'wrong atlas pose sampled');
    production.engine.drawSpriteSample(c, sample, actor);
    c.strokeStyle = '#426a78'; c.beginPath(); c.moveTo(left + 8, floor); c.lineTo(left + 332, floor); c.stroke();
    c.strokeStyle = '#9b793b'; c.strokeRect(actor.x, actor.y, actor.w, actor.h);
    c.fillStyle = '#dce6eb'; c.font = '14px sans-serif';
    c.fillText(clip + ' ' + (frame % 8 + 1) + ' · cellule' + frame, left + 12, top + 22);
    requireThat(Math.abs(actor.spritePivot.world.x - center(actor)) < 1e-6 && Math.abs(actor.spritePivot.world.y - floor) < 1e-6, 'pose root drift');
    rootRecords.push({ frame, clip, pivot: actor.spritePivot, expected: { x: center(actor), y: floor } });
  }
  const vehicleCases = [];
  for (const [label, Engine] of [['V51', GameEngine], ['V52 production', MissionLevelEngine]]) {
    for (const facing of [1, -1]) {
      for (const initialCenterToHull of [48, 100, 147]) {
        const fix = createKorariFixture(Engine, { facing });
        const { engine, enemy, damage, step, arm, contract } = fix;
        engine.player.inVehicle = true;
        engine.vehicle = { id: 'apc', x: center(enemy) + facing * initialCenterToHull - (facing < 0 ? 240 : 0),
          y: 826, w: 240, h: 104, active: true, hull: 100 };
        const startX = enemy.x;
        arm(); step(contract.windup);
        requireThat(enemy.x === startX, 'vehicle attack moved before the coil ended');
        step(contract.impact - contract.windup);
        const bodyToHull = facing > 0 ? engine.vehicle.x - enemy.x - enemy.w : enemy.x - engine.vehicle.x - engine.vehicle.w;
        const impactFrame = getEnemyBatchAttackFrameV66(enemy);
        step(contract.duration - contract.impact + 0.00001);
        const result = { engine: label, facing, initialCenterToHull, hullWidth: 240,
          bodyToHull, centerToHull: bodyToHull + enemy.w / 2,
          displacement: enemy.x - startX, hits: damage.length, hull: engine.vehicle.hull,
          occupantHealth: engine.player.health, impactFrame };
        requireThat(result.bodyToHull >= 0 && result.centerToHull <= 82.125
          && Math.abs(result.displacement) === Math.max(0, initialCenterToHull - 77)
          && result.hits === 1 && result.hull === 74 && result.occupantHealth === 100
          && result.impactFrame === 4 && damage[0].target === engine.vehicle,
        'coque240 intrusion/portee/double-degat: ' + JSON.stringify(result));
        vehicleCases.push(result);
      }
    }
  }
  const dying = createKorariFixture(MissionLevelEngine);
  dying.enemy.alive = false;
  const controller = new SpriteAnimationController();
  const deathSamples = [0, 0.10001, 0.20001, 0.30001, 0.40001, 0.50001, 0.60001, 0.70001, 0.8, 1.2, 2.8].map((time) => {
    // Production owns a countdown on the corpse, not the lifetime of a renderer.
    dying.enemy.deathClock = Math.max(0, 2.8 - time);
    const request = resolveEnemyAnimation(dying.enemy);
    return { time, deathClock: dying.enemy.deathClock, frame: controller.sample('death-hold', request, time).frame };
  });
  requireThat(deathSamples.slice(0, 8).map((entry) => entry.frame).join() === '24,25,26,27,28,29,30,31'
    && deathSamples.slice(8).every((entry) => entry.frame === 31), 'death does not hold terminal pose');
  const resumes = [];
  for (const [label, Engine] of [['V51', GameEngine], ['V52 production', MissionLevelEngine]]) {
    for (const [deathClock, expectedFrame] of [[2.8, 24], [2.5, 27], [1.5, 31], [0, 31]]) {
      const original = createKorariFixture(Engine);
      original.engine.resumeIdentity = { seed: 50 };
      Object.assign(original.enemy, { alive: false, health: 0, deathClock });
      const snapshot = JSON.parse(JSON.stringify(ResumeEngine.prototype.captureResumeState.call(original.engine)));
      const restored = createKorariFixture(Engine);
      restored.engine.resumeIdentity = { seed: 50 };
      const restoration = ResumeEngine.prototype.applyResumeState.call(restored.engine, snapshot);
      const request = resolveEnemyAnimation(restored.enemy);
      const freshControllerSamples = [0, 50, 1000].map((wallClock) => ({
        wallClock, frame: new SpriteAnimationController().sample(restored.enemy.id, request, wallClock).frame
      }));
      restored.step(0);
      const result = { engine: label, deathClock, expectedFrame, applied: restoration.applied,
        restoredDeathClock: restored.enemy.deathClock, alive: restored.enemy.alive,
        pendingAttack: restored.enemy.batchAttackV66, freshControllerSamples, newHits: restored.damage.length };
      requireThat(result.applied && !result.alive && result.restoredDeathClock === deathClock
        && result.pendingAttack === null && result.newHits === 0
        && freshControllerSamples.every((sample) => sample.frame === expectedFrame),
      'real JSON resume restarted corpse animation: ' + JSON.stringify(result));
      resumes.push(result);
    }
  }
  const report = { schema: 1, profileId: PROFILE_ID,
    scope: 'Isolated shipped V51/V52 prototype combat plus real V52 drawEnemy/drawSpriteSample, not a complete campaign playthrough',
    sheet: SHEET_ID, path: sheet.path, imageSize: [image.naturalWidth, image.naturalHeight],
    proposal: RUNTIME_PROPOSAL, cases, poseCount: 32, rootRecords, deathSamples, vehicleCases, resumes,
    saveUnchanged: before === storageSnapshot(), runtimeMutation: 'fixture-local actor state only',
    sharedRegistryMutation: false, acceptedByThisFixture: false };
  requireThat(report.saveUnchanged, 'storage changed during fixture');
  globalThis.korariFixtureReport = report;
  document.querySelector('#result').textContent = JSON.stringify(report, null, 2);
  document.querySelector('#status').textContent = 'PASS — 4 combats, 12 coques240, 32 poses, 8 restaurations JSON et mort terminale ; sauvegarde inchangée.';
  return report;
}
