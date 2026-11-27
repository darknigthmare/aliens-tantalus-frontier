import { sampleXenoTrialsFloorLockV207 } from './xeno-trials-capture-v163.js';
import { getXenoTrialsMeasuredPlantedContactV219 } from './xeno-trials-finishers-v219.js';
import { XENO_TRIALS_ARENA_V105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsLandingViewV157, XENO_TRIALS_LANDING_V157 } from './xeno-trials-sequences-v155.js';

// These contacts were reached after native airborne KOs. The locked ground
// frame must be the same original plate that the normal landing will draw.
const measurements = [
  ['user-chameleon', 'paw', 'foreSupport', ['hindFar', 'hindNear'], { runner: 3 }],
  ['user-black-fin', 'paw', 'foreFar', ['foreNear', 'hindFar', 'hindNear'], { 'user-brute': 3 }],
  ['acid-combat-synth', 'boot', 'frontBoot', ['rearBoot'], { runner: 3, 'user-brute': 3, ravager: 2 }],
  ['cryo-combat-synth', 'boot', 'forwardBoot', ['rearBoot'], { runner: 3, 'user-brute': 3, ravager: 2 }],
  ['combat-synth', 'boot', 'footFar', ['footNear'], { runner: 3, 'user-brute': 3, ravager: 2 }],
  ['synth-guard', 'boot', 'footFar', ['footNear'], { 'user-brute': 3 }],
  ['synth-sniper', 'boot', 'rightBoot', ['leftBoot'], { 'user-brute': 3 }],
  ['synth-trooper', 'boot', 'footFar', ['footNear'], { 'user-brute': 3 }],
  ['spitter', 'paw', 'footNear', ['footFar'], { runner: 3, 'user-brute': 3, ravager: 3 }],
  ['warrior', 'paw', 'footNear', ['footFar'], { runner: 3, 'user-brute': 3, ravager: 2 }],
  ['runner', 'paw', 'footNear', ['footFar'], { warrior: 1, ravager: 3 }],
  ['prowler', 'paw', 'footNear', ['footFar'], { 'user-brute': 3, ravager: 3 }],
  ['armored-joe', 'boot', 'farBoot', ['nearBoot'], { 'user-brute': 3 }],
  ['import-joe-battle', 'boot', 'footFar', ['footNear'], { 'user-brute': 3 }],
];
const byPair = new Map(measurements.flatMap(([fighterId, motion, contactKey, supportKeys, targets]) => {
  const profile = { motion, contactKey, supportKeys, targets };
  return Object.keys(targets).map(targetId => [fighterId + ':' + targetId, profile]);
}));

function landingView(match, target, landing) {
  if (landing?.id !== XENO_TRIALS_LANDING_V157.id || landing.skipped || landing.reducedMotion || landing.paused) return null;
  return getXenoTrialsLandingViewV157(match, target, landing);
}

function supportsClearOfTarget(lock) {
  const { attacker, attackerMetrics, layout, rig } = lock;
  const { facing, x } = attacker;
  const edge = facing > 0 ? layout.bounds.left : layout.bounds.right;
  return [0, .5, 1].every(gain => {
    const { contacts } = sampleXenoTrialsFloorLockV207(lock, gain);
    return lock.supportKeys.every(key => {
      const foot = x + (contacts[key][0] / rig.sourceWidth - attackerMetrics.pivotX)
        * attackerMetrics.width * facing * rig.sourceFacing;
      return (edge - foot) * facing >= 2;
    });
  });
}

export function getXenoTrialsLandedContactV223(match, attacker, target, images, landing) {
  const profile = byPair.get(attacker.id + ':' + target.id);
  if (!profile || target.y <= 0 || match.result.stageId !== match.config.stageId) return null;
  const reaction = landingView(match, target, landing);
  if (!reaction?.atlasPathV219 || (landing.phase === 'complete' && !reaction.settled)) return null;
  const result = getXenoTrialsMeasuredPlantedContactV219(attacker, target, images, profile, 223);
  if (!result || result.lock.atlas.path !== reaction.atlasPathV219 || !supportsClearOfTarget(result.lock)) return null;
  return { ...result, lock: { ...result.lock, afterLandingV223: {
    matchId: match.result.matchId, terminalTick: match.tick, targetX: target.x,
    airtimeY: target.y, atlasPath: reaction.atlasPathV219
  } } };
}

export function openXenoTrialsLandedContactV223(sequence, match, landing) {
  if (sequence?.phase !== 'landing' || sequence.paused || landing?.phase !== 'complete') return sequence;
  const receipt = sequence.lock.afterLandingV223;
  const reaction = landingView(match, sequence.lock.target, landing);
  const valid = receipt.matchId === match.result?.matchId && receipt.terminalTick === match.tick
    && reaction?.settled && reaction.ground === XENO_TRIALS_ARENA_V105.floor
    && reaction.startX === receipt.targetX && reaction.startY === receipt.airtimeY
    && reaction.atlasPathV219 === receipt.atlasPath;
  return { ...sequence, phase: valid ? 'offered' : 'declined', elapsedMs: valid ? 0 : sequence.durationMs };
}
