// Continuous, top-left AABB projectile collision. No engine state is mutated here.
const EPSILON = 1e-9;
const finite = (value) => Number.isFinite(value);
const validBox = (box, pointAllowed = false) => Boolean(box && finite(box.x) && finite(box.y)
  && finite(box.w) && finite(box.h) && box.w >= 0 && box.h >= 0
  && (pointAllowed || box.w > 0 && box.h > 0));
const validDisplacement = (value) => Boolean(value && finite(value.x) && finite(value.y));
const at = (box, displacement, t, normalX = 0, normalY = 0) => ({
  t, x: box.x + displacement.x * t, y: box.y + displacement.y * t, normalX, normalY
});

export function sweepProjectileAabbV83(projectile, displacement, target) {
  if (!validBox(projectile, true) || !validBox(target) || !validDisplacement(displacement)) return null;
  const minima = [target.x - projectile.w, target.y - projectile.h];
  const maxima = [target.x + target.w, target.y + target.h];
  const positions = [projectile.x, projectile.y];
  const velocities = [displacement.x, displacement.y];
  let entry = -Infinity;
  let exit = Infinity;
  let normalX = 0;
  let normalY = 0;
  for (let axis = 0; axis < 2; axis += 1) {
    const position = positions[axis];
    const velocity = velocities[axis];
    if (velocity === 0) {
      // Parallel edge contact is not penetration (nor a collision while moving away).
      if (position <= minima[axis] || position >= maxima[axis]) return null;
      continue;
    }
    const near = (minima[axis] - position) / velocity;
    const far = (maxima[axis] - position) / velocity;
    const axisEntry = Math.min(near, far);
    if (axisEntry > entry) {
      entry = axisEntry;
      normalX = axis === 0 ? -Math.sign(velocity) : 0;
      normalY = axis === 1 ? -Math.sign(velocity) : 0;
    }
    exit = Math.min(exit, Math.max(near, far));
  }
  if (exit <= Math.max(0, entry) || entry > 1 + EPSILON) return null;
  const t = Math.max(0, Math.min(1, entry));
  return at(projectile, displacement, t, entry < 0 ? 0 : normalX, entry < 0 ? 0 : normalY);
}

function sweepPlatform(projectile, displacement, platform) {
  if (!validBox(platform)) return null;
  if (platform.floor || platform.oneWay === false || platform.solid === true) {
    return sweepProjectileAabbV83(projectile, displacement, platform);
  }
  // Mission platforms/lifts are one-way top surfaces, as in resolveVertical.
  // Their physical top is y; surfaceOffset only shifts the rendered bitmap.
  const bottom = projectile.y + projectile.h;
  if (displacement.y <= 0 || bottom > platform.y + EPSILON) return null;
  const t = (platform.y - bottom) / displacement.y;
  if (t < -EPSILON || t > 1 + EPSILON) return null;
  const contact = at(projectile, displacement, Math.max(0, Math.min(1, t)), 0, -1);
  return contact.x < platform.x + platform.w && contact.x + projectile.w > platform.x ? contact : null;
}

function sweepBounds(projectile, displacement, bounds) {
  if (!bounds || !finite(bounds.width) || !finite(bounds.height) || bounds.width <= 0 || bounds.height <= 0) return null;
  const minX = finite(bounds.x) ? bounds.x : 0;
  const minY = finite(bounds.y) ? bounds.y : 0;
  const maxX = minX + bounds.width - projectile.w;
  const maxY = minY + bounds.height - projectile.h;
  if (projectile.x < minX || projectile.x > maxX || projectile.y < minY || projectile.y > maxY) {
    return at(projectile, displacement, 0);
  }
  const exits = [];
  if (displacement.x < 0) exits.push([(minX - projectile.x) / displacement.x, 1, 0]);
  if (displacement.x > 0) exits.push([(maxX - projectile.x) / displacement.x, -1, 0]);
  if (displacement.y < 0) exits.push([(minY - projectile.y) / displacement.y, 0, 1]);
  if (displacement.y > 0) exits.push([(maxY - projectile.y) / displacement.y, 0, -1]);
  const first = exits.filter(([t]) => t >= 0 && t <= 1 + EPSILON).sort((a, b) => a[0] - b[0])[0];
  return first ? at(projectile, displacement, Math.min(1, first[0]), first[1], first[2]) : null;
}

export function collectProjectileCollisionsV83(projectile, displacement, world = {}) {
  if (!validBox(projectile, true) || !validDisplacement(displacement)) return [];
  const collisions = [];
  const add = (kind, target, contact) => {
    if (contact) collisions.push({ ...contact, kind, target });
  };
  for (const wall of new Set(world.walls || [])) {
    if (wall && !wall.destroyed) add('wall', wall, sweepProjectileAabbV83(projectile, displacement, wall));
  }
  for (const door of new Set(world.doors || [])) {
    const closed = door && (finite(door.progress) ? door.progress < 0.82 : !door.open);
    if (closed && !door.destroyed) add('door', door, sweepProjectileAabbV83(projectile, displacement, door));
  }
  for (const platform of new Set(world.platforms || [])) {
    if (platform && !platform.destroyed) add('platform', platform, sweepPlatform(projectile, displacement, platform));
  }
  add('bounds', world.bounds, sweepBounds(projectile, displacement, world.bounds));
  const seenEnemyIds = new Set(projectile.hitEnemyIds || []);
  for (const enemy of world.enemies || []) {
    const key = enemy?.id ?? enemy;
    if (!enemy?.alive || seenEnemyIds.has(key)) continue;
    seenEnemyIds.add(key);
    add('enemy', enemy, sweepProjectileAabbV83(projectile, displacement, enemy));
  }
  return collisions.sort((a, b) => {
    const difference = a.t - b.t;
    if (Math.abs(difference) > EPSILON) return difference;
    // A wall/door/top/world edge wins an exact tie: no damage through its face.
    return Number(a.kind === 'enemy') - Number(b.kind === 'enemy');
  });
}

export function firstProjectileObstacleV83(projectile, displacement, world = {}) {
  return collectProjectileCollisionsV83(projectile, displacement, { ...world, enemies: [] })[0] || null;
}
