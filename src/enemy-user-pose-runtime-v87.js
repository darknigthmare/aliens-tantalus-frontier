import { getEnemyUserCasteV87 } from './enemy-user-castes-v87.js';

export function isUserCasteImageReadyV87(image, definition) {
  return Boolean(image?.complete && definition
    && Number(image.naturalWidth || image.width) === definition.sourceWidth
    && Number(image.naturalHeight || image.height) === definition.sourceHeight);
}

/** No family resolver or borrowed atlas: each import owns its full 1x1 PNG. */
export function drawUserCastePoseV87(ctx, enemy, image) {
  const definition = getEnemyUserCasteV87(enemy?.profileId);
  if (!definition || !enemy.alive || !isUserCasteImageReadyV87(image, definition)) return false;
  const { renderWidth: w, renderHeight: h, pivot } = definition;
  ctx.save();
  ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h);
  ctx.scale(enemy.facing === -1 ? -1 : 1, 1);
  ctx.drawImage(image, -pivot.x * w, -pivot.y * h, w, h);
  ctx.restore();
  return true;
}

/** Laboratory adaptation only; specialized source-game behaviour is not delivered here. */
export function createUserCasteActorV87(entry, groundY) {
  const d = getEnemyUserCasteV87(entry?.profileId);
  if (!d) return null;
  return {
    id: entry.id, profileId: d.id, name: d.name + ' — ' + d.work, biology: d.biology,
    visualMode: d.visualMode, animationStatus: d.animationStatus, visualImageKey: d.imageKey,
    visualSheetId: null, visualArchetype: d.name, visualIdentityStatus: d.identityStatus,
    visualApproximation: false, visualFallbackReason: null, spriteKey: 'user-caste-static',
    behavior: d.basename === 'game_xenoborg_avp1999' ? 'shooter' : 'spitter',
    x: 0, y: groundY - d.bodyHeight, groundY, spawnX: 0,
    w: d.bodyWidth, h: d.bodyHeight, vx: 0, vy: 0, facing: -1,
    health: d.health, maxHealth: d.health, armor: d.armor, damage: d.damage,
    speed: d.combatRole === 'idle' ? 0 : 55 + d.speed * 35,
    alive: true, alert: false, attacking: false, animationPhase: 0,
    attackClock: .85, rangedClock: 1.2, staggerClock: 0, hurtClock: 0, v52HurtClock: 0,
    attackWindupClock: 0, attackAnimationClock: 0, pendingMelee: false, pendingMeleeTargetId: null,
    pounceClock: 0, jammedClock: 0, revealed: 0, deathClock: 0,
    isBoss: false, isRoyal: false, keyCarrier: false, reward: 0, dropsDisabledV80: true,
    bioforgeCostV87: d.cost
  };
}

/** Physical movement/damage is real; the still is not advertised as an animated walk. */
export function updateUserCasteActorV87(engine, enemy, delta) {
  const d = getEnemyUserCasteV87(enemy?.profileId);
  if (!d || !enemy.alive) return false;
  const dt = Math.max(0, Math.min(.1, Number(delta) || 0));
  for (const key of ['attackClock', 'rangedClock', 'staggerClock', 'hurtClock'])
    enemy[key] = Math.max(0, (Number(enemy[key]) || 0) - dt);
  enemy.attacking = false;
  enemy.vx = 0;
  const target = engine.player;
  if (d.combatRole === 'idle' || !target?.alive || enemy.staggerClock > 0) return true;
  const distance = target.x + target.w / 2 - enemy.x - enemy.w / 2;
  const vertical = Math.abs(target.y + target.h - enemy.y - enemy.h);
  enemy.facing = Math.sign(distance) || enemy.facing;
  enemy.alert = Math.abs(distance) < 900;
  if (!enemy.alert || vertical > 40) return true;
  const reach = (enemy.w + target.w) / 2 + 16;
  const stop = d.combatRole === 'ranged' ? Math.max(reach, 225) : reach;
  if (Math.abs(distance) > stop) {
    const previousX = enemy.x;
    enemy.x += enemy.facing * enemy.speed * dt;
    engine.resolveEnemyHorizontal?.(enemy, previousX);
    enemy.vx = dt ? (enemy.x - previousX) / dt : 0;
  }
  const pathClear = engine.enemyMeleePathClearV64?.(enemy, target) !== false;
  const gap = Math.abs(target.x + target.w / 2 - enemy.x - enemy.w / 2);
  if (d.combatRole === 'ranged' && gap > reach && gap < 500 && enemy.rangedClock === 0 && pathClear) {
    const count = engine.hostileProjectiles.length;
    engine.spawnEnemyProjectile(enemy, target);
    for (const shot of engine.hostileProjectiles.slice(count)) shot.damage = d.damage;
    enemy.rangedClock = 1.55;
    enemy.attacking = true;
  } else if (gap <= reach && enemy.attackClock === 0 && pathClear) {
    engine.damagePlayer(target, d.damage, { source: enemy.name });
    enemy.attackClock = .9;
    enemy.attacking = true;
  }
  return true;
}
