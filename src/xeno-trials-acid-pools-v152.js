/** Pathogen Queen residue, exact identity only. The existence of damaging
 * projectile pools is documented by Cold Iron's 6 Dec 2022 release notes.
 * All dimensions, delays, lifetime, stacking and damage are original 2D rules;
 * this procedural feedback is NOT a new articulated or canonical animation. */
export const XENO_TRIALS_ACID_POOL_V152 = Object.freeze({
  fighterId: 'drive-v123-fte-pathogen-queen-right-v13',
  profileId: 'pose-v123-drive-fte-pathogen-queen-right-v13',
  signatureId: 'pathogen-queen-acid-cluster',
  source: 'https://www.aliensfireteamelite.com/en/releasenotes/',
  locator: 'AFE: Ruptured Cistern Update 1.0.5.105618 / 06/12/2022 / AUDIO',
  checked: '2026-10-17', canonExact: false,
  radius: 44, height: 6, damage: 4, warmupTicks: 24, intervalTicks: 48,
  lifetimeTicks: 360, fallSpeed: 380, maxPools: 12, maxDrops: 12
});
const tuning = XENO_TRIALS_ACID_POOL_V152;
const active = match => match?.phase === 'active' && !match.paused && !match.config?.rulesV119?.noSpecial;
export function hasXenoTrialsAcidPoolsV152(definition) {
  return definition?.id === tuning.fighterId && definition.profileId === tuning.profileId;
}
/** A droplet never damages anything. It falls from the resolved impact point,
 * without following a body, moving sideways or creating a floating puddle. */
export function depositXenoTrialsAcidV152(match, projectile, ownerDefinition, x, y, arena) {
  if (!active(match) || !hasXenoTrialsAcidPoolsV152(ownerDefinition)
    || projectile?.signatureIdV147 !== tuning.signatureId || projectile.residueV152
    || !['player', 'opponent'].includes(projectile.owner)
    || ![x, y].every(Number.isFinite) || x < arena.left || x > arena.right || y < 0) return false;
  projectile.residueV152 = true;
  const drop = { id: ++match.serial, owner: projectile.owner, x, y,
    bornTick: match.tick, superV148: projectile.spec?.superV148 === true };
  if (y === 0) settle(match, drop, arena);
  else {
    const drops = match.acidDropsV152 ||= [];
    if (drops.length >= tuning.maxDrops) drops.shift();
    drops.push(drop);
  }
  return true;
}
function settle(match, drop, arena) {
  const pools = match.acidPoolsV152 ||= [];
  if (pools.length >= tuning.maxPools) pools.shift();
  pools.push({ id: drop.id, owner: drop.owner, x: drop.x,
    left: Math.max(arena.left, drop.x - tuning.radius), right: Math.min(arena.right, drop.x + tuning.radius),
    height: tuning.height, bornTick: match.tick, armedTick: match.tick + tuning.warmupTicks,
    expiresTick: match.tick + tuning.lifetimeTicks, superV148: drop.superV148 });
}
export function clearXenoTrialsAcidV152(match) {
  delete match.acidDropsV152; delete match.acidPoolsV152; delete match.acidNextHitV152;
}
/** One cadence per exposed actor, shared across overlapping pools. Leaving and
 * re-entering cannot reset it. Engine owns actual HP, stats, meter and verdict.
 * Impacts are collected together so both sides may die on the same fixed tick. */
export function stepXenoTrialsAcidV152(match, dt, bounds, arena, impact, emit) {
  if (!active(match) || !Number.isFinite(dt) || dt <= 0) return;
  if (match.acidDropsV152) {
    const falling = [];
    for (const drop of match.acidDropsV152) {
      if (drop.bornTick < match.tick) drop.y = Math.max(0, drop.y - tuning.fallSpeed * dt);
      if (drop.y === 0) settle(match, drop, arena); else falling.push(drop);
    }
    match.acidDropsV152 = falling;
  }
  if (!match.acidPoolsV152) return;
  match.acidPoolsV152 = match.acidPoolsV152.filter(pool => match.tick < pool.expiresTick);
  const impacts = [];
  for (const target of match.fighters) {
    if (target.hp <= 0 || match.tick < (match.acidNextHitV152?.[target.side] || 0)) continue;
    const box = bounds(target);
    const pool = match.acidPoolsV152.find(pool => pool.owner !== target.side && match.tick >= pool.armedTick
      && box.bottom < pool.height && box.top >= 0 && box.right > pool.left && box.left < pool.right);
    if (!pool) continue;
    const owner = match.fighters.find(fighter => fighter.side === pool.owner);
    if (!owner) continue;
    (match.acidNextHitV152 ||= {})[target.side] = match.tick + tuning.intervalTicks;
    impacts.push({ from: owner, to: target, power: 1, direction: 0,
      spec: { damage: tuning.damage, stun: 0, push: 0, unblockableV151: true,
        continuousV152: true, superV148: pool.superV148 }, poolIdV152: pool.id });
  }
  for (const hit of impacts) {
    const hp = hit.to.hp; impact(hit);
    if (hit.to.hp < hp) emit('acid-contact-v152', { side: hit.to.side, attacker: hit.from.side,
      poolId: hit.poolIdV152, damage: hp - hit.to.hp });
  }
}
/** Pure visible-floor reading for the existing finite-rate CPU. No prediction
 * of future input and no health/position writes. Connected overlapping patches
 * form one interval, preventing direction oscillations inside a large spill. */
export function getXenoTrialsAcidEscapeV152(match, actor, body, arena) {
  if (!active(match) || actor.hp <= 0 || body.bottom >= tuning.height) return 0;
  const intervals = (match.acidPoolsV152 || []).filter(p => p.owner !== actor.side && match.tick < p.expiresTick)
    .map(p => [p.left, p.right]).sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const interval of intervals) {
    const prior = merged.at(-1);
    if (prior && interval[0] <= prior[1]) prior[1] = Math.max(prior[1], interval[1]); else merged.push([...interval]);
  }
  const spill = merged.find(([left, right]) => body.right > left && body.left < right);
  if (!spill) return 0;
  const leftDistance = body.right - spill[0] + 1, rightDistance = spill[1] - body.left + 1;
  const leftRoom = actor.x - arena.left, rightRoom = arena.right - actor.x;
  if (leftRoom >= leftDistance && (rightRoom < rightDistance || leftDistance <= rightDistance)) return -1;
  if (rightRoom >= rightDistance) return 1;
  return leftRoom > rightRoom ? -1 : rightRoom > 0 ? 1 : 0;
}
/** Draw in the same world transform as fighters. Borders describe the actual
 * hazard width; reduced motion keeps its warning and lifetime readable. */
export function drawXenoTrialsAcidV152(ctx, match, arena, reducedMotion = false) {
  ctx.save();
  for (const pool of match.acidPoolsV152 || []) {
    if (match.tick >= pool.expiresTick) continue;
    const armed = match.tick >= pool.armedTick;
    ctx.fillStyle = armed ? '#acd85580' : '#a7be5038';
    ctx.strokeStyle = armed ? '#cbea88' : '#dcdaa0'; ctx.lineWidth = 1.5;
    ctx.fillRect(pool.left, arena.floor - pool.height, pool.right - pool.left, pool.height);
    ctx.strokeRect(pool.left, arena.floor - pool.height, pool.right - pool.left, pool.height);
    const life = Math.max(0, (pool.expiresTick - match.tick) / tuning.lifetimeTicks);
    ctx.fillStyle = '#e3efae'; ctx.fillRect(pool.left, arena.floor + 3, (pool.right - pool.left) * life, 2);
    if (!reducedMotion) {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const x = pool.left + (pool.right - pool.left) * (i + .5) / 3;
        const lift = 2 + (Math.sin(match.tick / 14 + i * 2) + 1) * 2;
        ctx.moveTo(x + 2, arena.floor - pool.height - lift);
        ctx.arc(x, arena.floor - pool.height - lift, 2, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#cbea88';
  for (const drop of match.acidDropsV152 || []) ctx.fillRect(drop.x - 2, arena.floor - drop.y - 3, 4, 6);
  ctx.restore();
}
