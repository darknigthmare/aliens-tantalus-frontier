import { firstProjectileObstacleV83, sweepProjectileAabbV83 } from './projectile-collision-v83.js';

/** Cosmetic weapon effects. Only accepted gameplay events may call emitters.
 * No function here changes an actor, inventory, projectile, target or save.
 * Resting objects persist until the level resets or the bounded pool evicts one.
 */
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max, fallback = min) => Math.max(min, Math.min(max, finite(value, fallback)));
const integer = (value, min, max, fallback = min) => Math.trunc(clamp(value, min, max, fallback));
const TAU = Math.PI * 2;
const validPoint = value => value && Number.isFinite(value.x) && Number.isFinite(value.y);
const validBox = box => box && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(box[key])) && box.w > 0 && box.h > 0;
const color = (value, fallback = '#d6aa55') => /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : fallback;
const closed = door => door && !door.destroyed && (Number.isFinite(door.progress) ? door.progress < .82 : !door.open);
const sourceKey = ({ actor, actorId } = {}) => String(actorId ?? actor?.id ?? (actor?.coop ? 'coop' : 'player'));
const eventTime = (runtime, value) => Math.max(0, finite(value, runtime.time));
const vector = (aim, actor) => {
  const x = finite(aim?.x, finite(actor?.facing, 1) < 0 ? -1 : 1), y = finite(aim?.y);
  const magnitude = Math.hypot(x, y);
  return magnitude > .00001 ? { x: x / magnitude, y: y / magnitude }
    : { x: finite(actor?.facing, 1) < 0 ? -1 : 1, y: 0 };
};

export const WEAPON_EFFECT_LIMITS_V124 = Object.freeze({
  maxCasings: 256, maxLights: 12, maximumPhysicsStep: 1 / 120,
  maximumCatchup: .25, airborneLifetime: 20, gravity: 880,
  lightRadius: 240, lightRays: 48, localOccluders: 64, cornerOccluders: 16, surfaceReflectionDepth: 2
});

const initialStats = () => ({ acceptedShots: 0, ejectedCasings: 0, discardedMagazines: 0,
  discardedCells: 0, emittedLights: 0, settled: 0, bounces: 0, rejectedEvents: 0, evicted: 0 });

export function createWeaponEffectsV124({ seed = 426, maxCasings = 256, maxLights = 12, timeSeconds = 0, context = '' } = {}) {
  return { schema: 124, seed: finite(seed, 426) >>> 0,
    maxCasings: integer(maxCasings, 0, 512, 256), maxLights: integer(maxLights, 0, 24, 12),
    time: Math.max(0, finite(timeSeconds)), context: String(context),
    casings: [], lights: [], eventSerials: new Map(), stats: initialStats() };
}

export function resetWeaponEffectsV124(runtime, { seed, timeSeconds = 0, context = '' } = {}) {
  if (!runtime) return false;
  runtime.casings.length = 0; runtime.lights.length = 0;
  runtime.eventSerials.clear(); runtime.stats = initialStats();
  runtime.time = Math.max(0, finite(timeSeconds)); runtime.context = String(context);
  if (Number.isFinite(seed)) runtime.seed = seed >>> 0;
  return true;
}

function randomFor(runtime, key) {
  let state = (runtime.seed ^ 2166136261) >>> 0;
  for (const character of String(key)) state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
}

function acceptEvent(runtime, kind, source, serial) {
  if (!runtime || !Number.isSafeInteger(serial) || serial < 1) return false;
  const key = `${kind}:${source}`;
  if (serial <= (runtime.eventSerials.get(key) || 0)) { runtime.stats.rejectedEvents++; return false; }
  runtime.eventSerials.set(key, serial);
  // One counter per source/event, never an unbounded set of shot IDs.
  if (runtime.eventSerials.size > 384) runtime.eventSerials.delete(runtime.eventSerials.keys().next().value);
  return true;
}

function physicalWorld(world = {}) {
  const walls = [...new Set([...(world.walls || []), ...(world.covers || [])])].filter(box => validBox(box) && !box.destroyed);
  const doors = [...new Set(world.doors || [])].filter(box => validBox(box) && closed(box));
  const platforms = [...new Set(world.platforms || [])].filter(box => validBox(box) && !box.destroyed);
  return { walls, doors, platforms, bounds: world.bounds,
    supports: new Set([...walls, ...doors, ...platforms]) };
}

function appendCasing(runtime, body) {
  if (runtime.maxCasings <= 0) return false;
  if (runtime.casings.length >= runtime.maxCasings) {
    const oldestResting = runtime.casings.findIndex(entry => entry.resting);
    runtime.casings.splice(oldestResting >= 0 ? oldestResting : 0, 1); runtime.stats.evicted++;
  }
  runtime.casings.push(body); return true;
}

function spawnDebris(runtime, input, specification, index = 0, mode = 'casing') {
  const { actor = {}, aim = {}, muzzle, profile = {} } = input;
  if (!validPoint(muzzle) || !specification) return false;
  const eventKind = input.reloadSerial !== undefined ? 'reload' : specification.ejectOn === 'cycle' ? 'cycle' : 'shot';
  const serial = eventKind === 'reload' ? input.reloadSerial : input.shotSerial;
  const id = `${mode}:${eventKind}:${sourceKey(input)}:${serial}:${index}`;
  const random = randomFor(runtime, id), forward = vector(aim, actor);
  const facing = finite(actor.facing, 1) < 0 ? -1 : 1;
  const drum = mode === 'magazine' && profile.reload?.feed === 'drum';
  const length = clamp(specification.size?.length, 2.5, 18, drum ? 8 : mode === 'casing' ? 5 : 11);
  const radius = clamp(specification.size?.radius, .65, 4, drum ? 4 : mode === 'casing' ? 1.2 : 2.7);
  const pivotX = finite(muzzle.pivotX, muzzle.x - forward.x * 24);
  const pivotY = finite(muzzle.pivotY, muzzle.y - forward.y * 24);
  const bornAt = eventTime(runtime, input.timeSeconds);
  const ejection = mode === 'casing' ? 1 : .55;
  const backwards = 42 + random() * 52;
  const upwards = 118 + random() * 66;
  const portX = pivotX + forward.x * 5;
  const portY = pivotY + forward.y * 5 - (mode === 'casing' ? 3 : -7);
  const body = {
    id, sourceId: sourceKey(input), weaponId: String(profile.weaponId || ''), kind: mode,
    casingKind: specification.kind || mode, shape: drum ? 'drum' : mode === 'magazine' ? 'magazine' : mode === 'cell' ? 'cell' : specification.shape || 'cylinder',
    color: color(specification.color, mode === 'magazine' ? '#71806f' : mode === 'cell' ? '#648d99' : '#d6aa55'),
    length, radius, x: portX + (random() - .5) * 2, y: portY + (random() - .5) * 2,
    vx: finite(actor.vx) * .18 + (-forward.x * backwards - facing * (16 + random() * 24)) * ejection,
    vy: finite(actor.vy) * .12 + (-forward.y * backwards - upwards) * ejection,
    angle: random() * TAU, spin: (random() < .5 ? -1 : 1) * (7 + random() * 14) * ejection,
    restitution: mode === 'magazine' || mode === 'cell' ? .17 : specification.shape === 'shell' ? .24 : .34,
    bornAt, updatedAt: bornAt, resting: false, bounces: 0, support: null, supportKind: null,
    restingAngle: random() < .5 ? 0 : Math.PI, supportOffsetX: 0
  };
  if (!appendCasing(runtime, body)) return false;
  if (mode === 'magazine') runtime.stats.discardedMagazines++;
  else if (mode === 'cell') runtime.stats.discardedCells++;
  else runtime.stats.ejectedCasings++;
  return true;
}

function spawnLight(runtime, input) {
  const profile = input.profile?.muzzle;
  if (!validPoint(input.muzzle) || !profile || !['flash', 'flame', 'energy'].includes(profile.kind)
    || !(profile.intensity > 0) || runtime.maxLights <= 0) return false;
  const bornAt = eventTime(runtime, input.timeSeconds);
  const forward = vector(input.aim, input.actor);
  const id = `light:${sourceKey(input)}:${input.shotSerial}`;
  const random = randomFor(runtime, id);
  if (runtime.lights.length >= runtime.maxLights) { runtime.lights.shift(); runtime.stats.evicted++; }
  runtime.lights.push({ id, sourceId: sourceKey(input), kind: profile.kind,
    x: input.muzzle.x, y: input.muzzle.y, aimX: forward.x, aimY: forward.y,
    radius: clamp(profile.radius, 20, WEAPON_EFFECT_LIMITS_V124.lightRadius, 120),
    intensity: clamp(profile.intensity, 0, 1, .65),
    reducedMotionIntensity: clamp(profile.reducedMotionIntensity, 0, .3, .14),
    color: color(profile.color, '#ffd697'), duration: clamp(profile.duration, .025, .3, .065),
    bornAt, phase: random() * TAU, scale: .92 + random() * .16 });
  runtime.stats.emittedLights++; return true;
}

export function emitWeaponShotEffectsV124(runtime, input = {}) {
  if (!runtime || !validPoint(input.muzzle)) return { accepted: false, casings: 0, lights: 0, reason: 'invalid-muzzle' };
  const serial = input.shotSerial ?? input.actor?.shots;
  if (!acceptEvent(runtime, 'shot', sourceKey(input), serial)) return { accepted: false, casings: 0, lights: 0, reason: 'duplicate-or-invalid-shot' };
  runtime.stats.acceptedShots++;
  const event = { ...input, shotSerial: serial };
  const casing = input.profile?.casing;
  const casings = casing?.kind !== 'none' && casing?.ejectOn === 'shot' ? Number(spawnDebris(runtime, event, casing)) : 0;
  return { accepted: true, casings, lights: Number(spawnLight(runtime, event)), reason: null };
}

/** Pump/bolt actions eject on their actual cycle, not every trigger pull. The
 * caller ties the cycle to a previously accepted shot; this emits no flash.
 */
export function emitWeaponCycleEffectsV124(runtime, input = {}) {
  const serial = input.shotSerial ?? input.actor?.shots;
  const casing = input.profile?.casing;
  if (!runtime || !validPoint(input.muzzle) || casing?.kind === 'none' || casing?.ejectOn !== 'cycle'
    || !(serial > 0) || (runtime.eventSerials.get(`shot:${sourceKey(input)}`) || 0) < serial) {
    return { accepted: false, casings: 0, lights: 0, reason: 'no-accepted-cycle' };
  }
  if (!acceptEvent(runtime, 'cycle', sourceKey(input), serial)) return { accepted: false, casings: 0, lights: 0, reason: 'duplicate-cycle' };
  return { accepted: true, casings: Number(spawnDebris(runtime, { ...input, shotSerial: serial }, casing)), lights: 0, reason: null };
}

/** Reload debris is an observed transaction result. The caller supplies the
 * original empty-magazine flag and actual spent chambers; no ammo is inferred.
 */
export function emitWeaponReloadEffectsV124(runtime, input = {}) {
  if (!runtime || !validPoint(input.muzzle) || !acceptEvent(runtime, 'reload', sourceKey(input), input.reloadSerial)) {
    return { accepted: false, casings: 0, magazines: 0, cells: 0, reason: 'duplicate-or-invalid-reload' };
  }
  const profile = input.profile || {}, casing = profile.casing, reload = profile.reload || {};
  let casings = 0, magazines = 0, cells = 0;
  if (casing?.kind !== 'none' && casing?.ejectOn === 'reload') {
    const spent = integer(input.spentRounds, 0, 12);
    for (let index = 0; index < spent; index++) casings += Number(spawnDebris(runtime, input, casing, index));
  }
  if (!reload.emptyOnly || input.emptyReload === true) {
    if (reload.discard === 'magazine') magazines = Number(spawnDebris(runtime, input, reload.debris || {}, 0, 'magazine'));
    if (reload.discard === 'cell') cells = Number(spawnDebris(runtime, input, reload.debris || {}, 0, 'cell'));
  }
  return { accepted: true, casings, magazines, cells, reason: null };
}

function resolveSupport(body, world) {
  if (world.supports.has(body.support)) return body.support;
  const candidates = body.supportKind === 'door' ? world.doors : body.supportKind === 'platform' ? world.platforms : world.walls;
  const previous = body.support;
  if (!previous) return null;
  return candidates.find(box => previous.id && box.id === previous.id
    || box.x === previous.x && box.y === previous.y && box.w === previous.w && box.h === previous.h) || null;
}

function restoreRestingSupport(body, world) {
  const support = resolveSupport(body, world);
  if (!support || !validBox(support) || support.destroyed || body.supportKind === 'door' && !closed(support)) {
    body.resting = false; body.support = null; body.vx = 0; body.vy = 0; return false;
  }
  body.support = support;
  body.x = support.x + body.supportOffsetX;
  body.y = support.y - body.radius - .02;
  return true;
}

function settle(body, hit, runtime) {
  body.resting = true; body.vx = 0; body.vy = 0; body.spin = 0;
  body.angle = body.restingAngle; body.support = hit.target; body.supportKind = hit.kind;
  body.supportOffsetX = body.x - finite(hit.target?.x);
  body.y = hit.target.y - body.radius - .02;
  runtime.stats.settled++;
}

function depenetrate(body, hit) {
  const box = hit.target;
  if (!validBox(box)) { body.expired = true; return; }
  const r = body.radius;
  const sides = [
    { distance: Math.abs(body.x - box.x), x: box.x - r - .02, y: body.y, nx: -1, ny: 0 },
    { distance: Math.abs(body.x - box.x - box.w), x: box.x + box.w + r + .02, y: body.y, nx: 1, ny: 0 },
    { distance: Math.abs(body.y - box.y), x: body.x, y: box.y - r - .02, nx: 0, ny: -1 },
    { distance: Math.abs(body.y - box.y - box.h), x: body.x, y: box.y + box.h + r + .02, nx: 0, ny: 1 }
  ].sort((a, b) => a.distance - b.distance);
  const side = sides[0]; body.x = side.x; body.y = side.y;
  const inward = body.vx * side.nx + body.vy * side.ny;
  if (inward < 0) { body.vx -= inward * side.nx; body.vy -= inward * side.ny; }
}

function stepBody(body, seconds, world, runtime) {
  const displacement = { x: body.vx * seconds, y: body.vy * seconds + WEAPON_EFFECT_LIMITS_V124.gravity * seconds * seconds * .5 };
  body.vy += WEAPON_EFFECT_LIMITS_V124.gravity * seconds;
  body.angle += body.spin * seconds;
  const hit = firstProjectileObstacleV83({ x: body.x - body.radius, y: body.y - body.radius,
    w: body.radius * 2, h: body.radius * 2 }, displacement, world);
  if (!hit) { body.x += displacement.x; body.y += displacement.y; return; }
  body.x = hit.x + body.radius + hit.normalX * .02;
  body.y = hit.y + body.radius + hit.normalY * .02;
  if (!hit.normalX && !hit.normalY) { depenetrate(body, hit); return; }
  const inward = body.vx * hit.normalX + body.vy * hit.normalY;
  if (inward < 0) {
    body.vx -= (1 + body.restitution) * inward * hit.normalX;
    body.vy -= (1 + body.restitution) * inward * hit.normalY;
  }
  if (hit.normalY < 0) body.vx *= .59;
  else body.vy *= .86;
  body.spin *= .52; body.bounces++; runtime.stats.bounces++;
  if (hit.normalY < 0 && validBox(hit.target)
    && (Math.abs(body.vy) < 34 && Math.abs(body.vx) < 28 || body.bounces >= 6)) settle(body, hit, runtime);
}

export function updateWeaponEffectsV124(runtime, delta, { world = {}, timeSeconds, paused = false } = {}) {
  if (!runtime || paused || !Number.isFinite(delta) || delta < 0) return false;
  const now = Number.isFinite(timeSeconds) ? Math.max(0, timeSeconds) : runtime.time + delta;
  if (now < runtime.time) return false;
  const geometry = physicalWorld(world);
  for (const body of runtime.casings) {
    // A shot emitted during the current physics update is born at its end.
    // Never integrate it or age its flash through the tick before it existed.
    if (body.bornAt > now) continue;
    let elapsed = Math.min(WEAPON_EFFECT_LIMITS_V124.maximumCatchup, Math.max(0, now - Math.max(body.updatedAt, body.bornAt)));
    if (elapsed <= 0) continue;
    if (body.resting && restoreRestingSupport(body, geometry)) { body.updatedAt = now; continue; }
    const steps = Math.max(1, Math.ceil(elapsed / WEAPON_EFFECT_LIMITS_V124.maximumPhysicsStep));
    const seconds = elapsed / steps;
    for (let index = 0; index < steps && !body.resting && !body.expired; index++) stepBody(body, seconds, geometry, runtime);
    body.updatedAt = now;
  }
  runtime.time = now;
  runtime.casings = runtime.casings.filter(body => !body.expired && (body.resting || now - body.bornAt <= WEAPON_EFFECT_LIMITS_V124.airborneLifetime));
  runtime.lights = runtime.lights.filter(light => now - light.bornAt < light.duration);
  return true;
}

function visible(point, radius, { camera, viewport } = {}) {
  if (!viewport) return true;
  const x = finite(viewport.x, finite(camera?.x)), y = finite(viewport.y, finite(camera?.y));
  const width = finite(viewport.width, finite(viewport.w, 1280)), height = finite(viewport.height, finite(viewport.h, 720));
  return point.x + radius >= x && point.x - radius <= x + width && point.y + radius >= y && point.y - radius <= y + height;
}

export function drawWeaponCasingsV124(ctx, runtime, options = {}) {
  if (!ctx || !runtime) return 0;
  let drawn = 0;
  for (const body of runtime.casings) {
    if (body.bornAt > runtime.time || !visible(body, body.length, options)) continue;
    ctx.save(); ctx.translate(body.x, body.y); ctx.rotate(body.angle);
    const half = body.length / 2, radius = body.radius;
    ctx.fillStyle = body.color;
    ctx.beginPath();
    if (body.shape === 'drum') {
      ctx.arc(0, 0, radius, 0, TAU);
    } else if (body.shape === 'magazine') {
      ctx.moveTo(-half, -radius); ctx.lineTo(half - 1, -radius); ctx.lineTo(half, radius); ctx.lineTo(-half + 1, radius);
    } else {
      ctx.moveTo(-half, -radius * .8); ctx.lineTo(half - radius * .55, -radius * .8);
      ctx.lineTo(half, -radius * .35); ctx.lineTo(half, radius * .35);
      ctx.lineTo(half - radius * .55, radius * .8); ctx.lineTo(-half, radius * .8);
    }
    ctx.closePath(); ctx.fill();
    // Rim/head and a narrow highlight preserve a readable cylindrical shell
    // without a glow, texture atlas, trail or screen-sized particle sprite.
    ctx.fillStyle = body.shape === 'cell' ? '#a9d7df' : body.kind === 'magazine' ? '#afbbb0' : '#ead395';
    if (body.shape === 'drum') {
      ctx.beginPath(); ctx.arc(0, 0, radius * .38, 0, TAU); ctx.fill();
    } else ctx.fillRect(-half, -radius, Math.max(.65, radius * .5), radius * 2);
    ctx.fillStyle = 'rgba(255,247,200,.42)';
    ctx.fillRect(-half + .5, -radius * .65, Math.max(1, body.length - 1.5), Math.max(.45, radius * .36));
    ctx.restore(); drawn++;
  }
  return drawn;
}

function distanceToBox(point, box) {
  return Math.hypot(Math.max(box.x - point.x, 0, point.x - box.x - box.w),
    Math.max(box.y - point.y, 0, point.y - box.y - box.h));
}

/** Small local visibility polygon. Opaque platforms block light from either
 * side even when their traversal collision is one-way. Enemy bodies receive
 * the illumination; they do not become improvised full-height shadow walls.
 */
export function getWeaponLightVisibilityV124(light, world = {}) {
  if (!validPoint(light) || !(light.radius > 0)) return { points: [], surfaces: [], rays: 0, occluders: 0 };
  const geometry = physicalWorld(world);
  const boxes = [...geometry.walls, ...geometry.doors, ...geometry.platforms]
    .filter(box => distanceToBox(light, box) <= light.radius)
    .sort((a, b) => distanceToBox(light, a) - distanceToBox(light, b)).slice(0, WEAPON_EFFECT_LIMITS_V124.localOccluders);
  const angles = Array.from({ length: WEAPON_EFFECT_LIMITS_V124.lightRays }, (_, index) => -Math.PI + index * TAU / WEAPON_EFFECT_LIMITS_V124.lightRays);
  for (const box of boxes.slice(0, WEAPON_EFFECT_LIMITS_V124.cornerOccluders)) {
    for (const [x, y] of [[box.x, box.y], [box.x + box.w, box.y], [box.x + box.w, box.y + box.h], [box.x, box.y + box.h]]) {
      const angle = Math.atan2(y - light.y, x - light.x);
      for (const offset of [-.0001, 0, .0001]) angles.push(Math.atan2(Math.sin(angle + offset), Math.cos(angle + offset)));
    }
  }
  const ordered = angles.sort((a, b) => a - b).filter((value, index, list) => index === 0 || value - list[index - 1] > 1e-8);
  const contacts = ordered.map(angle => {
    const dx = Math.cos(angle) * light.radius, dy = Math.sin(angle) * light.radius;
    let fraction = 1, nearest = null;
    for (const box of boxes) {
      const hit = sweepProjectileAabbV83({ x: light.x, y: light.y, w: 0, h: 0 }, { x: dx, y: dy }, box);
      if (hit && (!nearest || hit.t < nearest.t)) nearest = { ...hit, box };
    }
    if (nearest) fraction = Math.max(0, nearest.t - .2 / light.radius);
    return { point: { x: light.x + dx * fraction, y: light.y + dy * fraction }, hit: nearest };
  });
  const surfaces = [];
  for (let index = 0; index < contacts.length; index++) {
    const a = contacts[index].hit, b = contacts[(index + 1) % contacts.length].hit;
    if (!a || !b || a.box !== b.box || a.normalX !== b.normalX || a.normalY !== b.normalY
      || !a.normalX && !a.normalY || Math.hypot(a.x - b.x, a.y - b.y) < .001) continue;
    // Both bordering rays must first hit the same exposed face. The patch
    // extends only into that bitmap, never through a thin wall or open doorway.
    const depth = Math.min(WEAPON_EFFECT_LIMITS_V124.surfaceReflectionDepth, a.normalX ? a.box.w : a.box.h);
    surfaces.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      insetX: -a.normalX * depth, insetY: -a.normalY * depth, box: a.box });
  }
  return { points: contacts.map(contact => contact.point), surfaces, rays: ordered.length, occluders: boxes.length };
}

function rgba(hex, alpha) {
  const normalized = color(hex, '#ffd697');
  const channels = [1, 3, 5].map(index => parseInt(normalized.slice(index, index + 2), 16));
  return `rgba(${channels.join(',')},${clamp(alpha, 0, 1).toFixed(4)})`;
}

/** Draw after world actors/foreground and before HUD, inside the world camera
 * transform. Screen compositing changes the actual nearby scene pixels; the
 * occlusion polygon prevents the radial light from flooding adjacent rooms.
 */
export function drawWeaponLightsV124(ctx, runtime, { world = {}, reducedMotion = false, flashIntensity = 1, ...view } = {}) {
  if (!ctx || !runtime || !(flashIntensity > 0)) return { drawn: 0, rays: 0 };
  let drawn = 0, rays = 0;
  for (const light of runtime.lights) {
    const age = runtime.time - light.bornAt;
    if (age < 0 || age >= light.duration || !visible(light, light.radius, view)) continue;
    const remaining = 1 - age / light.duration;
    const intensity = (reducedMotion ? Math.min(light.intensity, light.reducedMotionIntensity) : light.intensity)
      * clamp(flashIntensity, 0, 1, 1) * remaining * remaining;
    if (intensity <= .001) continue;
    const visibility = getWeaponLightVisibilityV124(light, world);
    if (visibility.points.length < 3) continue;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 1;
    const gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
    gradient.addColorStop(0, rgba(light.color, intensity * .68));
    gradient.addColorStop(.12, rgba(light.color, intensity * .43));
    gradient.addColorStop(.45, rgba(light.color, intensity * .19));
    gradient.addColorStop(1, rgba(light.color, 0));
    ctx.fillStyle = gradient;
    if (visibility.surfaces.length) {
      ctx.beginPath();
      for (const patch of visibility.surfaces) {
        ctx.moveTo(patch.x1, patch.y1); ctx.lineTo(patch.x2, patch.y2);
        ctx.lineTo(patch.x2 + patch.insetX, patch.y2 + patch.insetY);
        ctx.lineTo(patch.x1 + patch.insetX, patch.y1 + patch.insetY); ctx.closePath();
      }
      ctx.fill();
    }
    ctx.beginPath(); ctx.moveTo(visibility.points[0].x, visibility.points[0].y);
    for (const point of visibility.points.slice(1)) ctx.lineTo(point.x, point.y);
    ctx.closePath(); ctx.clip();
    ctx.beginPath(); ctx.arc(light.x, light.y, light.radius, 0, TAU); ctx.fill();
    if (!reducedMotion) {
      ctx.translate(light.x, light.y); ctx.rotate(Math.atan2(light.aimY, light.aimX));
      ctx.fillStyle = rgba(light.kind === 'energy' ? light.color : '#fff0c5', intensity * .92);
      const reach = (light.kind === 'flame' ? 18 : light.kind === 'energy' ? 7 : 12) * light.scale;
      ctx.beginPath();
      if (light.kind === 'energy') ctx.arc(0, 0, reach * remaining, 0, TAU);
      else { ctx.moveTo(-2, 0); ctx.lineTo(reach * .35, -3.8); ctx.lineTo(reach, 0); ctx.lineTo(reach * .35, 3.8); ctx.closePath(); }
      ctx.fill();
    }
    ctx.restore(); drawn++; rays += visibility.rays;
  }
  return { drawn, rays };
}

export function getWeaponEffectsSnapshotV124(runtime) {
  if (!runtime) return null;
  const resting = runtime.casings.filter(body => body.resting).length;
  return { schema: 124, context: runtime.context, time: runtime.time,
    counts: { casings: runtime.casings.length, airborne: runtime.casings.length - resting, resting, lights: runtime.lights.length },
    limits: { casings: runtime.maxCasings, lights: runtime.maxLights }, stats: { ...runtime.stats } };
}
