export const PROVING_GROUND_ANNEX_ID_V81 = 'proving-ground';
export const PROVING_GROUND_WORLD_V81 = Object.freeze({
  width: 1920,
  height: 720,
  floorY: 624
});

export const PROVING_GROUND_FIRING_PAD_V81 = Object.freeze({
  id: 'proving-ground-firing-pad-v81',
  x: 748,
  y: 438,
  w: 154,
  h: 30,
  surfaceY: 468,
  playerPose: Object.freeze({ x: 772, y: 376, facing: 1 }),
  muzzle: Object.freeze({ x: 818, y: 412 })
});

const AIM_COSINE_V81 = 0.9396926207859084;
const AIM_SINE_V81 = 0.3420201433256687;

export const PROVING_GROUND_AIM_VECTORS_V81 = Object.freeze({
  high: Object.freeze({ x: AIM_COSINE_V81, y: -AIM_SINE_V81 }),
  level: Object.freeze({ x: 1, y: 0 }),
  low: Object.freeze({ x: AIM_COSINE_V81, y: AIM_SINE_V81 })
});

const targetBoundsOnRay = (centerX, lane, width = 76, height = 96) => {
  const vector = PROVING_GROUND_AIM_VECTORS_V81[lane];
  const muzzle = PROVING_GROUND_FIRING_PAD_V81.muzzle;
  const centerY = muzzle.y + ((centerX - muzzle.x) * vector.y / vector.x);
  return Object.freeze({
    x: Math.round(centerX - width / 2),
    y: Math.round(centerY - height / 2),
    w: width,
    h: height
  });
};

const makeTargetV81 = (id, lane, centerX, order) => Object.freeze({
  id,
  lane,
  order,
  bounds: targetBoundsOnRay(centerX, lane),
  collidable: false,
  projectileTarget: true
});

// The order deliberately alternates all three angles. Only the active target
// owns a hitbox, so the stowed silhouettes never become invisible walls.
export const PROVING_GROUND_TARGETS_V81 = Object.freeze([
  makeTargetV81('pg-v81-target-01-level-near', 'level', 1260, 0),
  makeTargetV81('pg-v81-target-02-high-near', 'high', 1220, 1),
  makeTargetV81('pg-v81-target-03-low-near', 'low', 1120, 2),
  makeTargetV81('pg-v81-target-04-level-mid', 'level', 1450, 3),
  makeTargetV81('pg-v81-target-05-high-mid', 'high', 1380, 4),
  makeTargetV81('pg-v81-target-06-low-mid', 'low', 1180, 5),
  makeTargetV81('pg-v81-target-07-high-far', 'high', 1540, 6),
  makeTargetV81('pg-v81-target-08-level-far', 'level', 1640, 7),
  makeTargetV81('pg-v81-target-09-low-far', 'low', 1240, 8)
]);

export const PROVING_GROUND_TARGET_BY_ID_V81 = Object.freeze(Object.fromEntries(
  PROVING_GROUND_TARGETS_V81.map((target) => [target.id, target])
));

export function getProvingGroundAimVectorV81(lane = 'level', facing = 1) {
  const source = PROVING_GROUND_AIM_VECTORS_V81[lane] || PROVING_GROUND_AIM_VECTORS_V81.level;
  const magnitude = Math.hypot(source.x, source.y) || 1;
  return {
    x: (source.x / magnitude) * (Number(facing) < 0 ? -1 : 1),
    y: source.y / magnitude
  };
}
export function getProvingGroundTargetV81(targetId) {
  return PROVING_GROUND_TARGET_BY_ID_V81[targetId] || null;
}

export function validateProvingGroundLayoutV81(targets = PROVING_GROUND_TARGETS_V81) {
  const errors = [];
  if (!Array.isArray(targets) || targets.length !== 9) errors.push('target-count');
  const ids = new Set();
  const lanes = { high: 0, level: 0, low: 0 };
  for (const [index, target] of (Array.isArray(targets) ? targets : []).entries()) {
    if (!target?.id || ids.has(target.id)) errors.push(`target-id:${index}`);
    ids.add(target?.id);
    if (!Object.hasOwn(lanes, target?.lane)) errors.push(`target-lane:${target?.id || index}`);
    else lanes[target.lane] += 1;
    if (target?.order !== index) errors.push(`target-order:${target?.id || index}`);
    const bounds = target?.bounds;
    if (!bounds || bounds.x < 0 || bounds.y < 0
      || bounds.x + bounds.w > PROVING_GROUND_WORLD_V81.width
      || bounds.y + bounds.h > PROVING_GROUND_WORLD_V81.floorY) {
      errors.push(`target-bounds:${target?.id || index}`);
      continue;
    }
    const vector = getProvingGroundAimVectorV81(target.lane);
    const centerX = bounds.x + bounds.w / 2;
    const centerY = bounds.y + bounds.h / 2;
    const expectedY = PROVING_GROUND_FIRING_PAD_V81.muzzle.y
      + (centerX - PROVING_GROUND_FIRING_PAD_V81.muzzle.x) * vector.y / vector.x;
    if (Math.abs(centerY - expectedY) > 1) errors.push(`target-ray:${target.id}`);
  }
  for (const [lane, count] of Object.entries(lanes)) if (count !== 3) errors.push(`lane-count:${lane}`);
  const pad = PROVING_GROUND_FIRING_PAD_V81;
  if (pad.x < 740 || pad.x + pad.w > 1160 || pad.surfaceY !== 468) errors.push('firing-pad-catwalk');
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    targetCount: Array.isArray(targets) ? targets.length : 0,
    lanes: Object.freeze({ ...lanes })
  });
}
