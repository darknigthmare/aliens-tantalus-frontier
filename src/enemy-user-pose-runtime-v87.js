import { getEnemyStaticPoseV96 as getEnemyUserCasteV87, getEnemyStaticPoseRangedBehaviorV96 as getEnemyStaticPoseRangedBehaviorV95, sanitizeEnemyStaticPoseStateV96 as sanitizeEnemyStaticPoseStateV95 } from './enemy-static-poses-v96.js';
import { requestEnemyImportAnimationV107, drawEnemyImportAnimationV107 } from './enemy-import-animation-v107.js';

const clampV95 = (value, low, high) => Math.max(low, Math.min(high, value));
const overlapV95 = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const blockersV95 = engine => [...(engine.walls || []), ...(engine.platforms || []),
  ...(engine.covers || []).filter(cover => !cover.destroyed),
  ...(engine.closedDoorColliders?.() || (engine.doors || []).filter(door => Number(door.progress || 0) < .85))];

/** A gameplay guard for the admitted Defender only, never a family-name fallback.
 * Consume post-armor damage so armor bypass and the existing minimum hit survive.
 * Direction comes from projectile travel (or a legacy shooter's position), never
 * the impact point: impacts on the body do not establish the shot's origin. */
export function resolveDefenderGuardDamageV95(enemy, damage, source = {}) {
  if (!['pose-v95-user-xeno-defender', 'pose-v110-afe-synth-containment'].includes(enemy?.profileId) || !enemy.alive
    || enemy.dormant || enemy.ventTransit || enemy.attacking || enemy.pendingMelee
    || Number(enemy.attackAnimationClock) > 0 || Number(enemy.attackWindupClock) > 0
    || Number(enemy.staggerClock) > 0 || Math.abs(Number(enemy.vy) || 0) > 1) return damage;
  const definition = getEnemyUserCasteV87(enemy.profileId);
  const guard = definition?.defenderGuardV95 || definition?.containmentGuardV110;
  if (!guard || !Number.isFinite(damage) || damage <= 0) return damage;
  // Family is authoritative when supplied; plain lab bullets have no family.
  const ballistic = source.family ? ['ballistic', 'smart', 'smartgun', 'sentry', 'silent'].includes(source.family)
    : ['bullet', 'rifle', 'smartgun', 'apc-turret'].includes(source.kind);
  if (!ballistic || Number(source.splash) > 0 || source.kind === 'explosive-splash'
    || ['burn', 'blast', 'stun', 'ionized', 'corroded', 'frozen', 'contaminated'].includes(source.status)) return damage;
  let towardSourceX, towardSourceY;
  if (Number.isFinite(source.vx) && Number.isFinite(source.vy) && Math.hypot(source.vx, source.vy) > 0) {
    towardSourceX = -source.vx; towardSourceY = -source.vy;
  } else if (Number.isFinite(source.owner?.x) && Number.isFinite(source.owner?.y)) {
    towardSourceX = source.owner.x + (Number(source.owner.w) || 0) / 2 - enemy.x - enemy.w / 2;
    towardSourceY = source.owner.y + (Number(source.owner.h) || 0) / 2 - enemy.y - enemy.h / 2;
  } else return damage;
  const length = Math.hypot(towardSourceX, towardSourceY);
  if (!length || towardSourceX * (enemy.facing === -1 ? -1 : 1) / length < guard.minimumFrontDot) return damage;
  return Math.max(1, damage * guard.residualDamageMultiplier);
}

/** Native alpha bounds are right/bottom-exclusive and use the exact draw transform. */
export function getUserPoseVisibleBoundsV95(enemy, facing = enemy?.facing) {
  const d = getEnemyUserCasteV87(enemy?.profileId, enemy?.visualStateV95);
  if (!d) return { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
  const [left, top, right, bottom] = d.alphaBounds || [0, 0, d.sourceWidth, d.sourceHeight];
  const scale = (facing === -1 ? -1 : 1) * (d.sourceFacing === -1 ? -1 : 1);
  const x1 = (left / d.sourceWidth - d.pivot.x) * d.renderWidth * scale;
  const x2 = (right / d.sourceWidth - d.pivot.x) * d.renderWidth * scale;
  return { x: enemy.x + enemy.w / 2 + Math.min(x1, x2),
    y: enemy.y + enemy.h * (d.groundContact === false ? .5 : 1) + (top / d.sourceHeight - d.pivot.y) * d.renderHeight,
    w: Math.abs(x2 - x1), h: (bottom - top) / d.sourceHeight * d.renderHeight };
}

/** Aquatic silhouettes, including either facing, must fit without clipping at a turn. */
export function getUserPoseHabitatLimitsV95(enemy, volume) {
  if (!volume) return null;
  let left = 0, top = 0, right = enemy.w, bottom = enemy.h;
  if (getEnemyUserCasteV87(enemy?.profileId)?.locomotion === 'aquatic') {
    for (const facing of [-1, 1]) {
      const visible = getUserPoseVisibleBoundsV95({ ...enemy, x: 0, y: 0 }, facing);
      left = Math.min(left, visible.x); top = Math.min(top, visible.y);
      right = Math.max(right, visible.x + visible.w); bottom = Math.max(bottom, visible.y + visible.h);
    }
  }
  const limits = { minX: volume.x - left, maxX: volume.x + volume.w - right,
    minY: volume.y - top, maxY: volume.y + volume.h - bottom };
  return limits.minX <= limits.maxX && limits.minY <= limits.maxY ? limits : null;
}

export function isUserPoseInsideHabitatV95(enemy, volume) {
  const limits = getUserPoseHabitatLimitsV95(enemy, volume);
  return Boolean(limits && enemy.x >= limits.minX && enemy.x <= limits.maxX
    && enemy.y >= limits.minY && enemy.y <= limits.maxY);
}

/** Spawn/legacy-save repair only; normal movement still sweeps instead of teleporting. */
export function confineUserPoseToHabitatV95(enemy, volume) {
  const limits = getUserPoseHabitatLimitsV95(enemy, volume);
  if (!limits) return false;
  enemy.x = clampV95(enemy.x, limits.minX, limits.maxX);
  enemy.y = clampV95(enemy.y, limits.minY, limits.maxY);
  return true;
}

/** Real volumes only: aquatic specimens never acquire an implicit dry-land habitat. */
export function getUserPoseHabitatV95(engine, enemy) {
  const definition = getEnemyUserCasteV87(enemy?.profileId);
  if (definition?.locomotion === 'aquatic') return [
    ...(engine.missionLevelRuntime?.aquaticHabitats || []), ...(engine.userPoseAquaticHabitatsV95 || [])
  ].find(volume => volume.kind === 'water' && volume.active === true && volume.id === enemy.habitatIdV95
    && getUserPoseHabitatLimitsV95(enemy, volume)) || null;
  if (definition?.locomotion !== 'flying') return null;
  const arena = engine.bioforgeLevelV80?.arenaBounds;
  const bounds = arena || { x: 0, y: 0, width: engine.missionLevelBounds?.width || engine.worldWidth || 4096,
    height: engine.missionLevelBounds?.height || engine.groundY || 720 };
  return { id: 'air-v95', active: true, kind: 'air', x: bounds.x || 0, y: bounds.y || 0,
    w: bounds.w || bounds.width, h: bounds.h || bounds.height };
}

/** Swept, axis-separated 2D movement prevents wall tunnelling and floor snapping. */
export function moveUserPoseWithinHabitatV95(engine, enemy, volume, dx, dy) {
  if (!isUserPoseInsideHabitatV95(enemy, volume)) return false;
  const blocks = blockersV95(engine);
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 4));
  for (let index = 0; index < steps; index++) {
    for (const [axis, amount] of [['x', dx / steps], ['y', dy / steps]]) {
      const next = { ...enemy, [axis]: enemy[axis] + amount };
      if (isUserPoseInsideHabitatV95(next, volume) && !blocks.some(block => overlapV95(next, block))) enemy[axis] = next[axis];
    }
  }
  return true;
}

/** Parent identity persists; choosing a fixed visual state is not a transformation. */
export function setUserCasteVisualStateV95(enemy, stateId) {
  const definition = getEnemyUserCasteV87(enemy?.profileId, stateId);
  if (!definition) return false;
  enemy.visualStateV95 = sanitizeEnemyStaticPoseStateV95(enemy.profileId, stateId);
  enemy.visualImageKey = definition.imageKey;
  return true;
}

export function isUserCasteImageReadyV87(image, definition) {
  return Boolean(image?.complete && definition
    && Number(image.naturalWidth || image.width) === definition.sourceWidth
    && Number(image.naturalHeight || image.height) === definition.sourceHeight);
}

/** Exact identity only: reviewed walk atlas when ready, otherwise the original PNG. */
export function drawUserCastePoseV87(ctx, enemy, image, options = {}) {
  const definition = getEnemyUserCasteV87(enemy?.profileId, enemy?.visualStateV95);
  if (!definition || !enemy.alive || !isUserCasteImageReadyV87(image, definition)) return false;
  requestEnemyImportAnimationV107(options.imageStore, definition);
  const moving = options.movementEnabled !== false && Math.abs(Number(enemy.vx) || 0) > 1 && Math.abs(Number(enemy.vy) || 0) <= 1
    && enemy.grounded !== false && !enemy.dormant && !enemy.ventTransit && !enemy.attacking && !enemy.pendingMelee
    && !['attackAnimationClock', 'attackWindupClock', 'staggerClock', 'hurtClock', 'v52HurtClock'].some(key => Number(enemy[key]) > 0);
  if (drawEnemyImportAnimationV107(ctx, definition, options.imageStore, {
    action: moving ? 'move' : 'idle', timeSeconds: options.timeSeconds, reducedMotion: options.reducedMotion,
    x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h * (definition.groundContact === false ? .5 : 1), facing: enemy.facing
  })) return true;
  const { renderWidth: w, renderHeight: h, pivot } = definition;
  ctx.save();
  // Explicit non-contact art uses its measured body-centre pivot. Historical
  // foot/keel pivots keep their unchanged lower-body anchor.
  ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h * (definition.groundContact === false ? .5 : 1));
  // Preserve each PNG's native orientation; its full canvas and pivot stay intact.
  ctx.scale((enemy.facing === -1 ? -1 : 1) * (definition.sourceFacing === -1 ? -1 : 1), 1);
  ctx.drawImage(image, -pivot.x * w, -pivot.y * h, w, h);
  ctx.restore();
  return true;
}

/** Shared lab/campaign actor data. Special behaviours are supplied by explicit
 * runtime contracts, never inferred from the actor's biological family. */
export function createUserCasteActorV87(entry, groundY) {
  const d = getEnemyUserCasteV87(entry?.profileId, entry?.visualStateV95);
  if (!d) return null;
  return {
    id: entry.id, profileId: d.id, name: d.name + ' — ' + d.work, biology: d.biology,
    visualMode: d.visualMode, animationStatus: d.animationStatus, visualImageKey: d.imageKey,
    ...(d.id.startsWith('pose-v95-') || [103, 105, 106, 110].includes(d.visualRevision) ? { locomotionV95: d.locomotion || 'ground' } : {}),
    ...([103, 105, 106, 110].includes(d.visualRevision) ? { acid: 0, caste: d.caste } : {}),
    ...(sanitizeEnemyStaticPoseStateV95(d.id, entry?.visualStateV95)
      ? { visualStateV95: sanitizeEnemyStaticPoseStateV95(d.id, entry.visualStateV95) } : {}),
    visualSheetId: null, visualArchetype: d.name, visualIdentityStatus: d.identityStatus,
    visualApproximation: false, visualFallbackReason: null, spriteKey: 'user-caste-static',
    rangedBehavior: getEnemyStaticPoseRangedBehaviorV95(d),
    behavior: getEnemyStaticPoseRangedBehaviorV95(d),
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

/** Physical movement/damage stays independent of optional presentation-only atlases. */
export function updateUserCasteActorV87(engine, enemy, delta) {
  const d = getEnemyUserCasteV87(enemy?.profileId);
  if (!d || !enemy.alive) return false;
  if (enemy.dormant || enemy.ventTransit) { enemy.vx = 0; enemy.vy = 0; enemy.attacking = false; return true; }
  const dt = Math.max(0, Math.min(.1, Number(delta) || 0));
  for (const key of ['attackClock', 'rangedClock', 'staggerClock', 'hurtClock'])
    enemy[key] = Math.max(0, (Number(enemy[key]) || 0) - dt);
  enemy.attacking = false;
  enemy.vx = 0;
  const volumetric = ['flying', 'aquatic'].includes(d.locomotion);
  if (volumetric) enemy.vy = 0;
  const volume = volumetric ? getUserPoseHabitatV95(engine, enemy) : null;
  if (volumetric && !isUserPoseInsideHabitatV95(enemy, volume)) {
    enemy.habitatBlockedV95 = true; enemy.vy = 0; return true;
  }
  if (volumetric) enemy.habitatBlockedV95 = false;
  const target = [engine.player, engine.coopEnabled ? engine.coop : null].filter(actor => actor?.alive && !actor.downed && !actor.ventTransit)
    .filter(actor => d.locomotion !== 'aquatic' || overlapV95(volume, actor))
    .sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0];
  if (d.combatRole === 'idle' || !target?.alive || enemy.staggerClock > 0) return true;
  const distance = target.x + target.w / 2 - enemy.x - enemy.w / 2;
  const vertical = Math.abs(target.y + target.h - enemy.y - enemy.h);
  enemy.facing = Math.sign(distance) || enemy.facing;
  enemy.alert = Math.abs(distance) < 900;
  if (!enemy.alert || (!volumetric && vertical > 40)) return true;
  const reach = (enemy.w + target.w) / 2 + 16;
  const stop = d.combatRole === 'ranged' ? Math.max(reach, 225) : reach;
  if (volumetric) {
    const before = { x: enemy.x, y: enemy.y };
    const desiredY = clampV95(target.y + target.h / 2 - enemy.h / 2, volume.y, volume.y + volume.h - enemy.h);
    const dx = Math.abs(distance) > stop ? enemy.facing * Math.min(enemy.speed * dt, Math.abs(distance) - stop) : 0;
    moveUserPoseWithinHabitatV95(engine, enemy, volume, dx, clampV95(desiredY - enemy.y, -enemy.speed * .7 * dt, enemy.speed * .7 * dt));
    enemy.vx = dt ? (enemy.x - before.x) / dt : 0;
    enemy.vy = dt ? (enemy.y - before.y) / dt : 0;
  } else if (Math.abs(distance) > stop) {
    const previousX = enemy.x;
    enemy.x += enemy.facing * enemy.speed * dt;
    engine.resolveEnemyHorizontal?.(enemy, previousX);
    enemy.vx = dt ? (enemy.x - previousX) / dt : 0;
  }
  const pathClear = engine.enemyMeleePathClearV64?.(enemy, target) !== false;
  const gap = Math.abs(target.x + target.w / 2 - enemy.x - enemy.w / 2);
  const verticalReach = !volumetric || Math.abs(target.y + target.h / 2 - enemy.y - enemy.h / 2) <= (target.h + enemy.h) / 2 + 12;
  if (d.combatRole === 'ranged' && gap > reach && gap < 500 && enemy.rangedClock === 0 && pathClear && verticalReach) {
    const count = engine.hostileProjectiles.length;
    engine.spawnEnemyProjectile(enemy, target);
    for (const shot of engine.hostileProjectiles.slice(count)) shot.damage = enemy.damage;
    enemy.rangedClock = 1.55;
    enemy.attacking = true;
  } else if (gap <= reach && enemy.attackClock === 0 && pathClear && verticalReach) {
    engine.damagePlayer(target, enemy.damage, { source: enemy.name });
    enemy.attackClock = .9;
    enemy.attacking = true;
  }
  return true;
}
