const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export const isLargeMissionActorV72 = (actor) => Number(actor?.w) >= 300 && Number(actor?.h) >= 200;

export function largeMissionActorFitsV72(actor, { platforms = [], doors = [], width, height }) {
  if (!actor || actor.x < 0 || actor.y < 0 || actor.x + actor.w > width || actor.y + actor.h > height) return false;
  const body = { ...actor, y: actor.y + 2, h: actor.h - 10 };
  return !platforms.some((platform) => platform.kind !== 'lift' && overlap(body, platform))
    && !doors.some((door) => !door.open && overlap(body, door));
}

export function findLargeMissionActorPlacementV72(actor, geometry, anchor) {
  const candidates = [];
  for (const surface of geometry.platforms || []) {
    if (surface.kind === 'lift' || surface.y < actor.h + 8) continue;
    const preferred = Math.max(surface.x, Math.min(surface.x + surface.w, anchor.x));
    const centers = new Set([preferred, surface.x + surface.w / 2]);
    for (let center = surface.x + 16; center < surface.x + surface.w; center += 24) centers.add(center);
    for (const center of centers) {
      const pose = { ...actor, x: center - actor.w / 2, y: surface.y - actor.h };
      if (Math.abs(center - anchor.x) > 1200 || !largeMissionActorFitsV72(pose, geometry)) continue;
      const supportWidth = Math.min(pose.x + pose.w, surface.x + surface.w) - Math.max(pose.x, surface.x);
      if (supportWidth < Math.min(actor.w * 0.55, surface.w)) continue;
      candidates.push({ x: pose.x, y: pose.y, groundY: surface.y, surfaceId: surface.id, zoneId: surface.zoneId,
        score: Math.abs(center - anchor.x) + Math.abs(surface.y - anchor.y) * 2 + (surface.zoneId === anchor.zoneId ? 0 : 400) });
    }
  }
  return candidates.sort((a, b) => a.score - b.score)[0] || null;
}
