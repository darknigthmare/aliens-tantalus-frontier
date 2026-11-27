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
const pantherFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/panther-special-windup.png', [82, 58, 1478, 952], 790],
  ['contact', '/assets/openai/xeno-trials-v209/characters/panther-special-active.png', [50, 56, 1504, 956], 780],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/panther-special-recovery.png', [89, 51, 1445, 980], 780]
].map(([phase, path, bounds, rootX]) => Object.freeze({ phase, path, bounds: Object.freeze(bounds), rootX })));
const heavyPaths = Object.freeze(heavyFrames.map(frame => frame.path));
const paths = Object.freeze([...heavyPaths, groundedPounce.path]);
const pantherPaths = Object.freeze(pantherFrames.map(frame => frame.path));
const allPaths = Object.freeze([...paths, ...pantherPaths]);
const supported = (fighter, art) => fighter?.id === 'arachnoid' && fighter.variant !== 'purple'
  && art?.path === artPath && art.sourceFacing === 1;
const pounceSupported = (fighter, art) => fighter.variant === 'grey' && art.visualStateV95 === 'grey'
  && art.profileId === 'castes-game_avp_capcom_arachnoid' && art.sourceHeight === 1024 && art.sourceWidth === 1536;

export function getXenoTrialsPantherPounceFramesV221(fighter, art) {
  return fighter?.id === 'panther' && fighter.variant == null && art?.profileId === 'pose-v94-kenner-panther'
    && art.path === '/assets/openai/sprites/static-enemy-v94/kenner-panther-neca.png'
    && art.sha256 === '575f23d532b10eb34f2dd0df9e8a860e1511cdecf4e7ab20eb5fa7742acc549c'
    && art.sourceFacing === 1 && art.sourceWidth === 1310 && art.sourceHeight === 1201 ? pantherFrames : null;
}

export function getXenoTrialsPoseAssetsV209(fighter, art) {
  if (!fighter) return allPaths;
  if (getXenoTrialsPantherPounceFramesV221(fighter, art)) return pantherPaths;
  if (!supported(fighter, art)) return [];
  return pounceSupported(fighter, art) ? paths : heavyPaths;
}

export function drawXenoTrialsPoseV209(ctx, fighter, art, images, options) {
  const { groundedHeight, x, ground, spec, reducedMotion } = options;
  const attack = fighter.attack;
  if (fighter.y !== 0 || fighter.stun > 0 || reducedMotion
    || !Number.isFinite(attack?.age) || attack.age < 0 || ![-1, 1].includes(attack.facing)
    || ![groundedHeight, x, ground, spec?.startup, spec?.active, spec?.recovery].every(Number.isFinite) || groundedHeight <= 0) return null;
  const activeEnd = spec.startup + spec.active;
  if (attack.age >= activeEnd + spec.recovery) return null;
  const panther = attack.kind === 'special' && getXenoTrialsPantherPounceFramesV221(fighter, art);
  const arachnoid = supported(fighter, art);
  const pounce = arachnoid && attack.kind === 'special' && pounceSupported(fighter, art)
    && attack.age >= spec.startup && attack.age < activeEnd;
  if (!panther && !pounce && (!arachnoid || attack.kind !== 'heavy')) return null;
  const phase = attack.age < spec.startup ? 0 : attack.age < activeEnd ? 1 : 2;
  const frame = panther ? panther[phase] : pounce ? groundedPounce : heavyFrames[phase];
  const image = images.get(frame.path);
  if (!image || image.complete === false || image.naturalWidth !== (panther ? 1536 : width)
    || image.naturalHeight !== (panther ? 1024 : height)) return null;
  // Panther's shoulder-to-hip and shoulder-to-skull spans are about 77% as
  // long in the neutral pixels. Keep one density across the three painted keys.
  const scale = groundedHeight / (pounce || panther ? art.sourceHeight : 834) * (panther ? .77 : 1);
  const [left, top, right, bottom] = frame.bounds;
  const w = right - left, h = bottom - top;
  ctx.save();
  try {
    ctx.translate(x, ground);
    ctx.scale(attack.facing, 1);
    ctx.drawImage(image, left, top, w, h, (left - frame.rootX) * scale, -h * scale, w * scale, h * scale);
  } finally { ctx.restore(); }
  const animation = panther ? 'three-painted-panther-pounce-poses' : pounce ? 'painted-grounded-pounce' : 'three-painted-heavy-poses';
  return { drawn: true, animation, poseV209: {
    phase: frame.phase, path: frame.path, attackId: attack.id, attackAge: attack.age, ground, sourceRect: [left, top, w, h],
  } };
}
