import { GameEngine } from '/src/game-v51-runtime.js';
import { ENEMIES } from '/src/content-core-v50.js';
import { resolveSpriteSheet } from '/src/sprite-animation-runtime.js';
import { getEnemyBatchAttackFrameV66 } from '/src/enemy-batch-combat-v66.js';
export async function runAlbinoCombatFixture() {
  const saved = JSON.stringify(globalThis.__ATF_V51__?.saveSystem?.data);
  const engine = Object.create(GameEngine.prototype);
  const impacts = [], events = [];
  Object.assign(engine, {
    random: () => 0.5, animationTime: 0, images: new Map(), enemies: [],
    player: { x: 642, y: 838, w: 42, h: 92, alive: true, health: 100 },
    coop: null, coopEnabled: false, squadActors: [], walls: [], covers: [], doors: [],
    missionLevelBounds: { width: 6200, height: 1080 },
    platforms: [{ id: 'floor', x: 0, y: 930, w: 6200, h: 40 }],
    activeSquadActors() { return this.squadActors; },
    stealthRuntime: { detectionRadius: 900, spottedBy: new Set(), visibility: 100, noise: 0 },
    onEvent(event) { events.push(event); },
    damagePlayer(target, damage) { target.health -= damage; impacts.push(damage); },
    damageSquadMember(target, damage) { target.health -= damage; impacts.push(damage); }
  });
  const source = ENEMIES.find(e => e.id === 'enemy-055-albino-chestburster');
  const enemy = engine.createEnemy(source, 0, 600, 930);
  Object.assign(enemy, { alert: true, facing: 1, attackClock: 0 });
  engine.enemies.push(enemy);
  const sheet = resolveSpriteSheet(enemy.visualSheetId);
  const image = new Image(); image.src = sheet.path; await image.decode();
  engine.images.set(sheet.imageKey, image);
  engine.updateEnemy(enemy, 0);
  engine.animationTime += 4 / 12 - 0.0001;
  engine.updateEnemy(enemy, 4 / 12 - 0.0001);
  const hpBefore = engine.player.health;
  engine.animationTime += 0.0001; engine.updateEnemy(enemy, 0.0001);
  const atImpact = { hp: engine.player.health, hits: impacts.length, localFrame: getEnemyBatchAttackFrameV66(enemy) };
  const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 420;
  canvas.id = 'v73-fixture-canvas'; canvas.style.cssText = 'position:fixed;left:20px;top:20px;z-index:99999;background:#111921;border:2px solid #87dbca;max-width:90vw';
  const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#d8e9ed'; ctx.font = '18px sans-serif';
  ctx.fillText('V73 · Fixture isolée du vrai rendu et combat — aucune sauvegarde modifiée', 18, 30);
  ctx.fillText('055 : corps35×20 · joueur42×92 · impact à la pose5', 18, 58);
  ctx.save(); ctx.translate(-350, -600); ctx.strokeStyle = '#70aade';
  ctx.strokeRect(engine.player.x, engine.player.y, engine.player.w, engine.player.h);
  ctx.strokeStyle = '#607078'; ctx.beginPath(); ctx.moveTo(350,930);ctx.lineTo(1150,930);ctx.stroke();
  engine.drawEnemy(ctx, enemy); ctx.restore(); document.body.append(canvas);
  engine.animationTime += 4 / 12 + 0.0001; engine.updateEnemy(enemy, 4 / 12 + 0.0001);
  const result = { fixture: 'isolated real GameEngine prototype and drawEnemy; not a full campaign',
    sheet: enemy.visualSheetId, image: image.src, imageWidth: image.naturalWidth,
    body: [enemy.w, enemy.h], feet: enemy.y + enemy.h, playerFeet: engine.player.y + engine.player.h,
    facing: enemy.facing, hpBefore, atImpact, hpAfterRecovery: engine.player.health,
    hitsAfterRecovery: impacts.length, attackEnded: enemy.batchAttackV66 === null,
    saveUnchanged: saved === JSON.stringify(globalThis.__ATF_V51__?.saveSystem?.data) };
  if (hpBefore !== 100 || atImpact.hits !== 1 || atImpact.localFrame !== 4 || impacts.length !== 1 || !result.attackEnded || !result.saveUnchanged) throw new Error(JSON.stringify(result));
  return result;
}
