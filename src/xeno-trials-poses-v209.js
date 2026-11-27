const width = 1774, height = 887;
const artPath = '/assets/user/castes-v87/game_avp_capcom_arachnoid.png';
const frames = [
  ['windup', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-windup.png', [138, 18, 1658, 872], 1004],
  ['contact', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-impact.png', [124, 15, 1675, 834], 986],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-recovery.png', [275, 17, 1393, 851], 900],
].map(([phase, path, bounds, rootX]) => Object.freeze({ phase, path, bounds: Object.freeze(bounds), rootX }));
const paths = Object.freeze(frames.map(frame => frame.path));
const supported = (fighter, art) => fighter?.id === 'arachnoid' && fighter.variant !== 'purple'
  && art?.path === artPath && art.sourceFacing === 1;

export function getXenoTrialsPoseAssetsV209(fighter, art) {
  return !fighter || supported(fighter, art) ? paths : [];
}

export function drawXenoTrialsPoseV209(ctx, fighter, art, images, options) {
  const { groundedHeight, x, ground, spec, reducedMotion } = options;
  const attack = fighter.attack;
  if (!supported(fighter, art) || fighter.y !== 0 || attack?.kind !== 'heavy' || fighter.stun > 0 || reducedMotion
    || !Number.isFinite(attack.age) || attack.age < 0 || ![-1, 1].includes(attack.facing)
    || ![groundedHeight, x, ground, spec?.startup, spec?.active, spec?.recovery].every(Number.isFinite) || groundedHeight <= 0) return null;
  const end = spec.startup + spec.active + spec.recovery;
  if (attack.age >= end) return null;
  const frame = attack.age < spec.startup ? frames[0] : attack.age < spec.startup + spec.active ? frames[1] : frames[2];
  const image = images.get(frame.path);
  if (!image || image.complete === false || image.naturalWidth !== width || image.naturalHeight !== height) return null;
  // Fit against the observed neutral stature. The lower alpha boundary touches
  // the original world floor in every independent exposure.
  const scale = groundedHeight / 834;
  const [left, top, right, bottom] = frame.bounds;
  const w = right - left, h = bottom - top;
  ctx.save();
  try {
    ctx.translate(x, ground);
    ctx.scale(attack.facing, 1);
    ctx.drawImage(image, left, top, w, h, (left - frame.rootX) * scale, -h * scale, w * scale, h * scale);
  } finally { ctx.restore(); }
  return { drawn: true, animation: 'three-painted-heavy-poses', poseV209: {
    phase: frame.phase, path: frame.path, attackId: attack.id, attackAge: attack.age, ground, sourceRect: [left, top, w, h],
  } };
}
