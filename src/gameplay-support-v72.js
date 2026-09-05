const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const list = (value) => Array.isArray(value) ? value : [];
const bounded = (value, fallback, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : fallback));
const clocks = ['jammedClock', 'restrainedClock', 'supportSlowClockV72'];
const effectCounts = ['scans', 'repairs', 'breaches', 'illumination', 'protection', 'weaponBoostShots', 'restraints', 'containment'];

export function updateEnemySupportStatusesV72(enemy, delta, update) {
  const speed = enemy.speed;
  const factors = [1];
  if (enemy.jammedClock > 0) factors.push(0.55);
  if (enemy.restrainedClock > 0) factors.push(0.55);
  if (enemy.supportSlowClockV72 > 0) factors.push(bounded(enemy.supportSlowFactorV72, 1, 0.1, 1));
  for (const key of clocks) enemy[key] = Math.max(0, (Number(enemy[key]) || 0) - Math.max(0, Number(delta) || 0));
  if (enemy.supportSlowClockV72 === 0) enemy.supportSlowFactorV72 = 1;
  // Temporary effects never compound into the permanent movement stat or depend on render FPS.
  enemy.speed = speed * Math.min(...factors);
  try { return update(); } finally { enemy.speed = speed; }
}

function segmentCrossesBox(from, to, box) {
  let enter = 0;
  let leave = 1;
  for (const [axis, size] of [['x', 'w'], ['y', 'h']]) {
    const motion = to[axis] - from[axis];
    const minimum = Number(box[axis]);
    const maximum = minimum + Number(box[size]);
    if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) return false;
    if (Math.abs(motion) < 0.0001) { if (from[axis] <= minimum || from[axis] >= maximum) return false; }
    else {
      const a = (minimum - from[axis]) / motion;
      const b = (maximum - from[axis]) / motion;
      enter = Math.max(enter, Math.min(a, b));
      leave = Math.min(leave, Math.max(a, b));
      if (leave <= enter) return false;
    }
  }
  return leave > 0 && enter < 1;
}

export function canSentryTargetV72(engine, sentry, enemy) {
  if (!enemy?.alive || enemy.dormant || enemy.ventTransit) return false;
  const muzzle = { x: sentry.x + sentry.w / 2, y: sentry.y + 8 };
  const center = { x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h / 2 };
  if (Math.hypot(center.x - muzzle.x, center.y - muzzle.y) > sentry.range) return false;
  const blockers = [...list(engine.walls).filter((wall) => !wall.destroyed), ...list(engine.platforms), ...(engine.closedDoorColliders?.() || [])];
  return !blockers.some((box) => segmentCrossesBox(muzzle, center, box));
}

export function captureGameplaySupportV72(engine) {
  const time = Number(engine.animationTime) || 0;
  return {
    schema: 1,
    fieldEffects: { ...engine.fieldEffects, jammerRemaining: Math.max(0, (engine.fieldEffects?.jammerUntil || 0) - time) },
    environment: { ...engine.environmentStatus, slowRemaining: Math.max(0, (engine.environmentStatus?.slowUntil || 0) - time) },
    lightBoost: Number(engine.stealthRuntime?.lightBoost) || 0,
    deployments: list(engine.supportDeployments).map((entry) => ({ ...entry })),
    enemies: list(engine.enemies).filter((enemy) => enemy.alive && clocks.some((key) => enemy[key] > 0)).map((enemy) => ({
      id: enemy.id, ...Object.fromEntries(clocks.map((key) => [key, Number(enemy[key]) || 0])), supportSlowFactorV72: enemy.supportSlowFactorV72 || 1
    }))
  };
}

export function restoreGameplaySupportV72(engine, source) {
  if (!record(source) || source.schema !== 1) return false;
  const time = Number(engine.animationTime) || 0;
  if (record(source.fieldEffects) && engine.fieldEffects) {
    for (const key of effectCounts) engine.fieldEffects[key] = bounded(source.fieldEffects[key], engine.fieldEffects[key], 0, 99999);
    engine.fieldEffects.jammerUntil = time + bounded(source.fieldEffects.jammerRemaining, 0, 0, 120);
  }
  if (record(source.environment) && engine.environmentStatus) {
    const environment = engine.environmentStatus;
    environment.oxygen = bounded(source.environment.oxygen, environment.oxygen, 0, environment.maxOxygen);
    environment.slowFactor = bounded(source.environment.slowFactor, 1, 0.1, 1);
    environment.slowUntil = time + bounded(source.environment.slowRemaining, 0, 0, 120);
    environment.lastHazard = typeof source.environment.lastHazard === 'string' ? source.environment.lastHazard.slice(0, 80) : null;
    environment.protectedHits = bounded(source.environment.protectedHits, 0, 0, 99999);
  }
  if (engine.stealthRuntime) engine.stealthRuntime.lightBoost = bounded(source.lightBoost, 0, 0, 0.38);
  const width = engine.missionLevelBounds?.width || 6200;
  const height = engine.missionLevelBounds?.height || 1080;
  const seen = new Set();
  engine.supportDeployments = list(source.deployments).slice(0, 256).flatMap((saved) => {
    if (!record(saved) || typeof saved.id !== 'string' || seen.has(saved.id)) return [];
    const separator = saved.id.lastIndexOf(':');
    const equipment = engine.equipmentActions?.get(saved.id.slice(0, separator));
    const use = Number(saved.id.slice(separator + 1));
    if (!equipment || !Number.isInteger(use) || use < 1 || use > equipment.uses || use > equipment.charges) return [];
    const kind = ({ 'deploy-sentry': 'sentry', 'cryo-trap': 'cryo-trap', 'shock-trap': 'shock-trap', 'containment-field': 'containment' })[equipment.action];
    if (!kind || kind !== saved.kind) return [];
    const magnitude = equipment.magnitude;
    const bounds = kind === 'sentry' ? { w: 38, h: 42 } : kind === 'containment' ? { w: 180, h: engine.player.h + 60 } : { w: 58, h: 18 };
    const deployment = { id: saved.id, kind, ...bounds, x: bounded(saved.x, 0, 0, Math.max(0, width - bounds.w)), y: bounded(saved.y, 0, 0, Math.max(0, height - bounds.h)) };
    if (kind === 'sentry') Object.assign(deployment, { ammo: Math.floor(bounded(saved.ammo, 0, 0, 12 + Math.floor(magnitude / 2))), damage: 8 + magnitude * 0.45, range: 620, cooldown: bounded(saved.cooldown, 0, 0, 0.32) });
    else if (kind === 'containment') {
      deployment.duration = bounded(saved.duration, 0, 0, 8 + magnitude / 4);
      if (deployment.duration <= 0) return [];
    } else Object.assign(deployment, { damage: kind === 'shock-trap' ? magnitude : 0, slow: kind === 'cryo-trap' ? 0.38 : 0.65, armed: saved.armed === true });
    seen.add(saved.id);
    return [deployment];
  });
  const enemies = new Map(list(engine.enemies).map((enemy) => [enemy.id, enemy]));
  for (const saved of list(source.enemies).slice(0, 256)) {
    const enemy = enemies.get(saved?.id);
    if (!enemy?.alive) continue;
    for (const key of clocks) enemy[key] = bounded(saved[key], 0, 0, 120);
    enemy.supportSlowFactorV72 = bounded(saved.supportSlowFactorV72, 1, 0.1, 1);
  }
  return true;
}
