import { ENEMY_DISPLAY_ALPHA_V110 } from './enemy-display-alpha-v110.js';

const width = 1774, height = 887;
const artPath = '/assets/user/castes-v87/game_avp_capcom_arachnoid.png';
const poseFrame = ([phase, path, bounds, rootX, textureWidth, textureHeight]) => Object.freeze({
  phase, path, bounds: Object.freeze(bounds), rootX, textureWidth, textureHeight
});
const heavyFrames = [
  ['windup', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-windup.png', [138, 18, 1658, 872], 1004],
  ['contact', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-impact.png', [124, 15, 1675, 834], 986],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-recovery.png', [275, 17, 1393, 851], 900],
].map(poseFrame);
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
].map(poseFrame));
const gridFrames = Object.freeze([null,
  // Keep the rightmost claw with its existing 9-pixel source margin.
  poseFrame(['contact', '/assets/openai/xeno-trials-v209/characters/grid-heavy-impact.png', [17, 51, 1765, 860], 1176]),
  poseFrame(['recovery', '/assets/openai/xeno-trials-v209/characters/grid-heavy-recovery.png', [157, 39, 1462, 847], 1175])
]);
const gorillaFrames = Object.freeze([
  // Match the chest axis of the neutral plate, using the same crest length to retain scale.
  poseFrame(['windup', '/assets/openai/xeno-trials-v209/characters/gorilla-special-windup.png', [69, 166, 1188, 1089], 804]),
  null,
  poseFrame(['recovery', '/assets/openai/xeno-trials-v209/characters/gorilla-special-recovery.png', [44, 116, 1194, 1033], 794])
]);
const arachnoidLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/arachnoid-light-windup.png', [148, 25, 1368, 1006], 865],
  ['contact', '/assets/openai/xeno-trials-v209/characters/arachnoid-light-impact.png', [83, 119, 1700, 829], 1101, 1774, 887],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/arachnoid-light-recovery.png', [219, 19, 1302, 1009], 898]
].map(poseFrame));
const pantherLightFrames = Object.freeze([
  poseFrame(['windup', '/assets/openai/xeno-trials-v209/characters/panther-light-windup.png', [109, 45, 1341, 932], 716]),
  null,
  poseFrame(['recovery', '/assets/openai/xeno-trials-v209/characters/panther-light-recovery.png', [168, 32, 1428, 982], 801])
]);
const pantherSource = ['pose-v94-kenner-panther', '/assets/openai/sprites/static-enemy-v94/kenner-panther-neca.png',
  '575f23d532b10eb34f2dd0df9e8a860e1511cdecf4e7ab20eb5fa7742acc549c', 1310, 1201];

const groundedActions = Object.freeze([
  ['panther', {
    id: 'panther-pounce', action: 'special', revision: 221, animation: 'three-painted-panther-pounce-poses',
    source: pantherSource,
    // The neutral shoulder-to-hip and shoulder-to-skull spans are about 77% as long in source pixels.
    textureWidth: 1536, textureHeight: 1024, density: .77, frames: pantherFrames, limitations: ['three-painted-poses']
  }],
  ['grid', {
    id: 'grid-heavy', action: 'heavy', revision: 222, animation: 'painted-grid-heavy-poses',
    source: ['castes-film_grid_avp_2004', '/assets/user/castes-v87/film_grid_avp_2004.png',
      '49d756a01928adb1c3fa787d47efbb158da988699fd9d0008bf9a723a7002a74', 1536, 1024],
    textureWidth: 1774, textureHeight: 887, density: 1, frames: gridFrames, limitations: ['contact-and-recovery-only']
  }],
  ['gorilla', {
    id: 'gorilla-ram', action: 'special', revision: 222, animation: 'painted-gorilla-ram-poses',
    source: ['pose-v94-kenner-gorilla', '/assets/openai/sprites/static-enemy-v94/kenner-gorilla-neca.png',
      'c91b539cebeb76fd69ac39ef5c9966166584a45f8a51a064c09a7306d54f4685', 1254, 1254],
    textureWidth: 1254, textureHeight: 1254, density: 1, frames: gorillaFrames, limitations: ['windup-and-recovery-only']
  }],
  ['arachnoid', {
    id: 'arachnoid-light', action: 'light', revision: 223, animation: 'painted-arachnoid-light-poses', variant: 'grey',
    source: ['castes-game_avp_capcom_arachnoid', artPath,
      '84f47e12acfa88b5658a736863e4ad8b61a9b43bfa5cb61a34abe87649b2e3ee', 1536, 1024],
    // Keep the approximately 34-pixel shoulder-to-neutral-pivot offset in each plate.
    textureWidth: 1536, textureHeight: 1024, density: 1, frames: arachnoidLightFrames, limitations: ['grey-only', 'three-painted-poses']
  }],
  ['panther', {
    id: 'panther-light', action: 'light', revision: 223, animation: 'painted-panther-light-poses', source: pantherSource,
    // The neutral shoulder-to-skull span is about 80% of the span in these light keys.
    textureWidth: 1536, textureHeight: 1024, density: .80, frames: pantherLightFrames, limitations: ['windup-and-recovery-only']
  }]
].map(([fighterId, entry]) => Object.freeze({ ...entry, fighterId, source: Object.freeze(entry.source), limitations: Object.freeze(entry.limitations),
  paths: Object.freeze(entry.frames.filter(Boolean).map(frame => frame.path)) })));
const heavyPaths = Object.freeze(heavyFrames.map(frame => frame.path));
const paths = Object.freeze([...heavyPaths, groundedPounce.path]);
const allPaths = Object.freeze([...paths, ...groundedActions.flatMap(entry => entry.paths)]);
const supported = (fighter, art) => fighter?.id === 'arachnoid' && fighter.variant !== 'purple'
  && art?.path === artPath && art.sourceFacing === 1;
const pounceSupported = (fighter, art) => fighter.variant === 'grey' && art.visualStateV95 === 'grey'
  && art.profileId === 'castes-game_avp_capcom_arachnoid' && art.sourceHeight === 1024 && art.sourceWidth === 1536;

export function getXenoTrialsGroundedPaintedActionsV223(fighter, art) {
  if (!fighter || !art) return [];
  const sourceHash = art.sha256 ?? ENEMY_DISPLAY_ALPHA_V110[art.path]?.sha256;
  return groundedActions.filter(entry => {
    if (entry.fighterId !== fighter.id || (entry.variant ?? null) !== (fighter.variant ?? null)
      || entry.variant && entry.variant !== art.visualStateV95) return false;
    const [profileId, path, sha256, width, height] = entry.source;
    return art.profileId === profileId && art.path === path && sourceHash === sha256 && art.sourceFacing === 1
      && art.sourceWidth === width && art.sourceHeight === height;
  });
}

export function getXenoTrialsGroundedPaintedActionV222(fighter, art) {
  return getXenoTrialsGroundedPaintedActionsV223(fighter, art)[0] ?? null;
}

export function getXenoTrialsPantherPounceFramesV221(fighter, art) {
  return fighter?.id === 'panther' ? getXenoTrialsGroundedPaintedActionV222(fighter, art)?.frames ?? null : null;
}

export function getXenoTrialsPoseAssetsV209(fighter, art) {
  if (!fighter) return allPaths;
  const authoredPaths = getXenoTrialsGroundedPaintedActionsV223(fighter, art).flatMap(action => action.paths);
  const legacyPaths = supported(fighter, art) ? (pounceSupported(fighter, art) ? paths : heavyPaths) : [];
  return Object.freeze([...legacyPaths, ...authoredPaths]);
}

export function drawXenoTrialsPoseV209(ctx, fighter, art, images, options) {
  const { groundedHeight, x, ground, spec, reducedMotion } = options;
  const attack = fighter.attack;
  if (fighter.y !== 0 || fighter.stun > 0 || reducedMotion
    || !Number.isFinite(attack?.age) || attack.age < 0 || ![-1, 1].includes(attack.facing)
    || ![groundedHeight, x, ground, spec?.startup, spec?.active, spec?.recovery].every(Number.isFinite) || groundedHeight <= 0) return null;
  const activeEnd = spec.startup + spec.active;
  if (attack.age >= activeEnd + spec.recovery) return null;
  const authored = getXenoTrialsGroundedPaintedActionsV223(fighter, art).find(action => action.action === attack.kind);
  const arachnoid = supported(fighter, art);
  const pounce = arachnoid && attack.kind === 'special' && pounceSupported(fighter, art)
    && attack.age >= spec.startup && attack.age < activeEnd;
  if (!authored && !pounce && (!arachnoid || attack.kind !== 'heavy')) return null;
  const phase = attack.age < spec.startup ? 0 : attack.age < activeEnd ? 1 : 2;
  const frame = authored ? authored.frames[phase] : pounce ? groundedPounce : heavyFrames[phase];
  if (!frame) return null;
  const image = images.get(frame.path);
  if (!image || image.complete === false || image.naturalWidth !== (frame.textureWidth ?? authored?.textureWidth ?? width)
    || image.naturalHeight !== (frame.textureHeight ?? authored?.textureHeight ?? height)) return null;
  const scale = groundedHeight / (pounce || authored ? art.sourceHeight : 834) * (authored?.density ?? 1);
  const [left, top, right, bottom] = frame.bounds;
  const w = right - left, h = bottom - top;
  ctx.save();
  try {
    ctx.translate(x, ground);
    ctx.scale(attack.facing, 1);
    ctx.drawImage(image, left, top, w, h, (left - frame.rootX) * scale, -h * scale, w * scale, h * scale);
  } finally { ctx.restore(); }
  const animation = authored?.animation ?? (pounce ? 'painted-grounded-pounce' : 'three-painted-heavy-poses');
  return { drawn: true, animation, poseV209: {
    phase: frame.phase, path: frame.path, attackId: attack.id, attackAge: attack.age, ground, sourceRect: [left, top, w, h],
  } };
}
