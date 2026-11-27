import { getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_ARENA_V105, XENO_TRIALS_CONTACT_GAP_V105, getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsIsolationFixtureV211, getXenoTrialsMeasuredContactFinisherV211,
  XENO_TRIALS_ISOLATION_REACH_V211 } from './xeno-trials-finishers-v211.js';
import { drawXenoTrialsSpriteAtlasV188, getXenoTrialsSpriteAtlasV188, getXenoTrialsSpriteLayoutV188 } from './xeno-trials-sprite-atlas-v188.js';
import { drawXenoTrialsSpriteAtlasV189, getXenoTrialsSpriteAtlasV189, getXenoTrialsSpriteLayoutV189 } from './xeno-trials-sprite-atlas-v189.js';
import { drawXenoTrialsSpriteAtlasV191, getXenoTrialsRuntimeSpriteAtlas, getXenoTrialsSpriteLayoutV191 } from './xeno-trials-sprite-atlas-v191.js';

const { floor, left: arenaLeft, right: arenaRight } = XENO_TRIALS_ARENA_V105;
const reach = XENO_TRIALS_ISOLATION_REACH_V211;
const maximumApproach = 64;
export const XENO_TRIALS_FINISHER_COPY_V212 = Object.freeze({
  'isolation-approach': Object.freeze({ button: 'F · REJOINDRE LA BALISE',
    offered: 'Victoire confirmée. Approche de la balise disponible avec F.', playing: 'Approche et isolement du secteur.' })
});

// Target support slots were measured on the existing prone plates at the native root.
const supports = new Map([
  ['warrior', 'paw', 'footNear', ['footFar'], { ravager: 3, 'crusher-acm': 3 }],
  ['synth-sniper', 'boot', 'rightBoot', ['leftBoot'], { ravager: 2, 'crusher-acm': 3 }],
  ['synth-heavy', 'boot', 'frontBoot', ['rearBoot'], { 'crusher-acm': 3 }],
  ['import-joe-classic', 'boot', 'frontBoot', ['backBoot'], { ravager: 2, 'crusher-acm': 3 }],
  ['import-joe-tactical', 'boot', 'frontBoot', ['backBoot'], { 'crusher-acm': 3 }],
  ['import-engineer-armorsuit', 'boot', 'nearBoot', ['farBoot'], { ravager: 3 }],
  ['import-engineer-spacejokey', 'boot', 'frontBoot', ['backBoot'], { 'crusher-acm': 3 }],
  ['import-engineer-woman', 'boot', 'nearBoot', ['farBoot'], { ravager: 3 }],
  ['import-synth-jerri-1', 'boot', 'frontFoot', ['backFoot'], { ravager: 3 }],
  ['synth-enforcer', 'boot', 'frontBoot', ['backBoot'], { 'crusher-acm': 3 }],
  ['cryo-lurker', 'paw', 'frontFar', ['frontNear', 'hindFar', 'hindNear'], { ravager: 2, 'crusher-acm': 3 }],
  ['cryo-reef-stalker', 'paw', 'foreFar', ['foreNear', 'hindFar', 'hindNear'], { ravager: 2 }],
  ['user-black-fin', 'paw', 'foreFar', ['foreNear', 'hindNear', 'hindFar'], { 'crusher-acm': 3 }],
  ['albino-six', 'paw', 'frontFoot', ['rearFoot'], { ravager: 3 }],
  ['acid-combat-synth', 'boot', 'frontBoot', ['rearBoot'], { 'crusher-acm': 3 }],
  ['cryo-combat-synth', 'boot', 'forwardBoot', ['rearBoot'], { 'crusher-acm': 3 }],
  ['synth-containment', 'boot', 'rightBoot', ['leftBoot'], { ravager: 2, 'crusher-acm': 3 }],
  ['predalien', 'paw', 'frontFoot', ['rearFoot'], { ravager: 3, 'crusher-acm': 3 }],
  ['user-red-horned', 'paw', 'farFore', ['nearFore', 'nearHind', 'farHind'], { ravager: 2, 'crusher-acm': 3 }],
  ['user-unclassified-multiarm', 'paw', 'footFar', ['footNear'], { ravager: 2, 'crusher-acm': 3 }],
  ['armored-foundry-crusher', 'paw', 'frontFar', ['frontNear', 'backNear', 'backFar'], { ravager: 2, 'crusher-acm': 3 }],
  ['synth-peacekeeper', 'boot', 'footFar', ['footNear'], { ravager: 3, 'crusher-acm': 3 }],
  ['armored-caravan-stalker', 'paw', 'foreFar', ['foreNear', 'hindNear', 'hindFar'], { ravager: 2, 'crusher-acm': 3 }],
  ['cryo-ripper', 'paw', 'forwardFoot', ['rearFoot'], { ravager: 3, 'crusher-acm': 3 }],
  ['user-renaissance', 'paw', 'farFoot', ['nearFoot'], { ravager: 2, 'crusher-acm': 3 }],
  ['user-green-dome', 'paw', 'frontFoot', ['rearFoot'], { ravager: 3 }],
  ['import-xeno-gorillaxeno', 'knuckle', 'knucklesFar', ['knucklesNear', 'footNear', 'footFar'], { ravager: 2, 'crusher-acm': 3 }],
  ['afe2-engineer-hybrid', 'paw', 'footFar', ['footNear'], { ravager: 2, 'crusher-acm': 3 }]
].map(([id, motion, contactKey, supportKeys, targets]) => [id, { motion, contactKey, supportKeys, targets }]));

export function getXenoTrialsContactFinisherV212(attacker, target, images) {
  return getXenoTrialsMeasuredContactFinisherV211(attacker, target, images, supports.get(attacker.id), 212);
}

const gaitAtlases = [
  [getXenoTrialsSpriteAtlasV189, drawXenoTrialsSpriteAtlasV189, getXenoTrialsSpriteLayoutV189],
  [getXenoTrialsSpriteAtlasV188, drawXenoTrialsSpriteAtlasV188, getXenoTrialsSpriteLayoutV188],
  [getXenoTrialsRuntimeSpriteAtlas, drawXenoTrialsSpriteAtlasV191, getXenoTrialsSpriteLayoutV191]
];

export function getXenoTrialsFinisherGaitV212(fighter, images, includeV197 = false) {
  const art = getXenoTrialsArtV96(fighter.id, fighter.variant);
  for (const [get, draw, layout] of (includeV197 ? gaitAtlases : gaitAtlases.slice(0, 2))) {
    const atlas = get(fighter, art);
    if (!atlas?.frames.some(frame => frame.id.startsWith('walk-'))) continue;
    const { path, width, height } = atlas.texture;
    const image = images?.get(path);
    if (image?.complete && image.naturalWidth === width && image.naturalHeight === height)
      return { draw, art, atlas, layout, includeV197 };
  }
  return null;
}

/** The verdict remains at its native root. The optional scene can reach one
 * pre-existing floor device along a measured, unobstructed ground segment. */
export function getXenoTrialsIsolationApproachV212(match, attacker, target, images) {
  const stageId = match.config.stageId;
  if (match.result.stageId !== stageId) return null;
  const source = getXenoTrialsBodyBoundsV105(attacker), body = getXenoTrialsBodyBoundsV105(target);
  const direction = Math.sign(target.x - attacker.x);
  if (!direction || attacker.facing !== direction) return null;
  const fixture = getXenoTrialsIsolationFixtureV211(stageId, target.x, body.center);
  if (!fixture) return null;
  const distance = direction > 0 ? fixture.left - reach - source.right : source.left - fixture.right - reach;
  if (distance <= 0 || distance + 2 > maximumApproach) return null;
  const offset = (distance + 2) * direction, destination = attacker.x + offset;
  const gap = direction > 0 ? body.left - source.right : source.left - body.right;
  if (destination < arenaLeft || destination > arenaRight || gap - Math.abs(offset) < XENO_TRIALS_CONTACT_GAP_V105) return null;
  const gait = getXenoTrialsFinisherGaitV212(attacker, images);
  if (!gait) return null;
  const approachMs = Math.max(230, Math.round(Math.abs(offset) * 9));
  return { id: `${attacker.id}::fin2`, kind: 'isolation-approach', timing: { approachMs, holdMs: 650, retreatMs: approachMs },
    lock: { neutral: true, target, attacker, fixture, approachV212: { offset, gait } } };
}

export function drawXenoTrialsIsolationApproachV212(ctx, fighter, view, metrics, images) {
  const lock = view?.lock;
  if (!lock?.approachV212 || lock.attacker !== fighter || view.gain <= 0) return null;
  const { gait, offset } = lock.approachV212;
  const amount = view.gain * view.gain * (3 - 2 * view.gain);
  const position = fighter.x + offset * amount;
  const withdrawal = lock.withdrawalV221;
  const holding = Boolean(withdrawal && view.contact);
  // Motion-only atlases hold their last supported stride without changing roots.
  const holdStride = holding && !gait.atlas.frames.some(frame => frame.id === 'idle');
  const reverse = view.withdrawingV221 || holdStride;
  const distance = withdrawal && !reverse ? Math.abs(position - withdrawal.destination) : Math.abs(position - fighter.x);
  const drawn = drawXenoTrialsFinisherStepV212(ctx, fighter, position, gait, metrics, images,
    { distance, reverse, moving: !holding || holdStride });
  if (withdrawal) return drawn && { ...drawn, withdrawalV221: { ...withdrawal, x: position, origin: fighter.x,
    floor, stationary: view.contact, reversing: view.withdrawingV221, fixtureId: lock.fixture.id } };
  return drawn && { ...drawn, isolationApproachV212: { x: position, origin: fighter.x, destination: fighter.x + offset,
    floor, stationary: view.contact, fixtureId: lock.fixture.id } };
}

export function drawXenoTrialsFinisherStepV212(ctx, fighter, position, gait, metrics, images,
  { distance = Math.abs(position - fighter.x), reverse = false, moving = true } = {}) {
  const walking = { ...fighter, attack: null, guard: false, stun: 0, hitFlash: 0 };
  const body = getXenoTrialsBodyBoundsV105(fighter);
  ctx.fillStyle = '#0008';
  ctx.beginPath();
  ctx.ellipse(body.center + position - fighter.x, floor + 4, body.width * .68, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  return gait.draw(ctx, walking, gait.art, images, {
    metrics, x: position, y: floor, facing: fighter.facing, moving,
    distance: reverse && gait.draw === drawXenoTrialsSpriteAtlasV188 ? -distance : distance, reverseStep: reverse,
    includeV197: gait.includeV197
  });
}
