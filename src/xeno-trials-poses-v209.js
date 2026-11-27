const width = 1774, height = 887;
const artPath = '/assets/user/castes-v87/game_avp_capcom_arachnoid.png';
const heavyFrames = [
  ['windup', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-windup.png', [138, 18, 1658, 872], 1004],
  ['contact', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-impact.png', [124, 15, 1675, 834], 986],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-recovery.png', [275, 17, 1393, 851], 900],
].map(([phase, path, bounds, rootX]) => Object.freeze({ phase, path, bounds: Object.freeze(bounds), rootX }));
const groundedPounce = Object.freeze({
  phase: 'contact',
  path: '/assets/openai/xeno-trials-v209/characters/arachnoid-special-active-grounded.png',
  bounds: Object.freeze([28, 243, 1737, 772]),
  // The shoulder pivot sits about 33 source pixels behind the neutral origin.
  // Keep that offset on the painted shoulder (x = 1156) at neutral density.
  rootX: 1189
});
const heavyPaths = Object.freeze(heavyFrames.map(frame => frame.path));
const paths = Object.freeze([...heavyPaths, groundedPounce.path]);
const supported = (fighter, art) => fighter?.id === 'arachnoid' && fighter.variant !== 'purple'
  && art?.path === artPath && art.sourceFacing === 1;
const pounceSupported = (fighter, art) => fighter.variant === 'grey' && art.visualStateV95 === 'grey'
  && art.profileId === 'castes-game_avp_capcom_arachnoid' && art.sourceHeight === 1024 && art.sourceWidth === 1536;

export function getXenoTrialsPoseAssetsV209(fighter, art) {
  if (!fighter) return paths;
  if (!supported(fighter, art)) return [];
  return pounceSupported(fighter, art) ? paths : heavyPaths;
}

export function drawXenoTrialsPoseV209(ctx, fighter, art, images, options) {
  const { groundedHeight, x, ground, spec, reducedMotion } = options;
  const attack = fighter.attack;
  if (!supported(fighter, art) || fighter.y !== 0 || fighter.stun > 0 || reducedMotion
    || !Number.isFinite(attack?.age) || attack.age < 0 || ![-1, 1].includes(attack.facing)
    || ![groundedHeight, x, ground, spec?.startup, spec?.active, spec?.recovery].every(Number.isFinite) || groundedHeight <= 0) return null;
  const activeEnd = spec.startup + spec.active;
  if (attack.age >= activeEnd + spec.recovery) return null;
  const pounce = attack.kind === 'special' && pounceSupported(fighter, art)
    && attack.age >= spec.startup && attack.age < activeEnd;
  if (!pounce && attack.kind !== 'heavy') return null;
  const frame = pounce ? groundedPounce
    : attack.age < spec.startup ? heavyFrames[0] : attack.age < activeEnd ? heavyFrames[1] : heavyFrames[2];
  const image = images.get(frame.path);
  if (!image || image.complete === false || image.naturalWidth !== width || image.naturalHeight !== height) return null;
  // The active pounce sits lower at the neutral plate's pixel density.
  // All keys keep their lowest painted contact at the original world floor.
  const scale = groundedHeight / (pounce ? art.sourceHeight : 834);
  const [left, top, right, bottom] = frame.bounds;
  const w = right - left, h = bottom - top;
  ctx.save();
  try {
    ctx.translate(x, ground);
    ctx.scale(attack.facing, 1);
    ctx.drawImage(image, left, top, w, h, (left - frame.rootX) * scale, -h * scale, w * scale, h * scale);
  } finally { ctx.restore(); }
  return { drawn: true, animation: pounce ? 'painted-grounded-pounce' : 'three-painted-heavy-poses', poseV209: {
    phase: frame.phase, path: frame.path, attackId: attack.id, attackAge: attack.age, ground, sourceRect: [left, top, w, h],
  } };
}
