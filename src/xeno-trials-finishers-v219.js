import { getXenoTrialsMeasuredContactFinisherV211 } from './xeno-trials-finishers-v211.js';
import { sampleXenoTrialsFloorLockV207 } from './xeno-trials-capture-v163.js';

// Atlas support indices and planted rig landmarks were checked at terminal
// positions reached by the native duel. Contacts always use live positions.
const measurements = [
  ['spitter', 'paw', 'footNear', ['footFar'], { ravager: 3 }],
  ['synth-trooper', 'boot', 'footFar', ['footNear'], { ravager: 3 }],
  ['synth-trooper', 'boot', 'footNear', ['footFar'], { 'crusher-acm': 3 }],
  ['synth-guard', 'boot', 'footFar', ['footNear'], { ravager: 3 }],
  ['synth-guard', 'boot', 'footNear', ['footFar'], { 'crusher-acm': 3 }],
  ['combat-synth', 'boot', 'footFar', ['footNear'], { ravager: 3, 'crusher-acm': 3 }],
  ['synth-sniper', 'boot', 'rightBoot', ['leftBoot'], { ravager: 3 }],
  ['synth-sniper', 'boot', 'leftBoot', ['rightBoot'], { 'crusher-acm': 3 }],
  ['armored-joe', 'boot', 'farBoot', ['nearBoot'], { ravager: 3 }],
  ['armored-joe', 'boot', 'nearBoot', ['farBoot'], { 'crusher-acm': 3 }],
  ['import-wy-apesuit', 'boot', 'footFar', ['footNear'], { ravager: 3 }],
  ['import-wy-apesuit', 'boot', 'footNear', ['footFar'], { 'crusher-acm': 3 }],
  ['import-joe-classic', 'boot', 'backBoot', ['frontBoot'], { ravager: 2, 'crusher-acm': 3 }],
  ['import-joe-battle', 'boot', 'footNear', ['footFar'], { ravager: 2, 'crusher-acm': 3 }],
  ['import-joe-hazmat', 'boot', 'footNear', ['footFar'], { ravager: 2, 'crusher-acm': 3 }],
  ['cryo-joe', 'boot', 'footNear', ['footFar'], { ravager: 2, 'crusher-acm': 3 }],
  ['acid-joe', 'boot', 'footNear', ['footFar'], { ravager: 3, 'crusher-acm': 3 }],
  ['albino-joe', 'boot', 'footNear', ['footFar'], { ravager: 3, 'crusher-acm': 3 }],
  ['user-spiker', 'paw', 'footFar', ['footNear'], { ravager: 3 }],
  ['user-red-horned', 'paw', 'farFore', ['nearFore', 'farHind', 'nearHind'], { ravager: 3 }],
  ['user-black-fin', 'paw', 'foreNear', ['foreFar', 'hindFar', 'hindNear'], { ravager: 3, 'crusher-acm': 3 }],
  ['user-chameleon', 'paw', 'hindFar', ['foreSupport', 'hindNear'], { ravager: 3 }],
  ['user-chameleon', 'paw', 'foreSupport', ['hindFar', 'hindNear'], { 'crusher-acm': 3 }],
  ['cryo-combat-synth', 'boot', 'forwardBoot', ['rearBoot'], { ravager: 3 }],
  ['acid-combat-synth', 'boot', 'frontBoot', ['rearBoot'], { ravager: 3 }],
  ['synth-containment', 'boot', 'rightBoot', ['leftBoot'], { ravager: 3 }],
  ['synth-enforcer', 'boot', 'frontBoot', ['backBoot'], { ravager: 3 }],
  ['import-synth-eloise', 'boot', 'footFar', ['footNear'], { ravager: 3, 'crusher-acm': 3 }],
  ['afe2-engineer-hybrid', 'paw', 'footFar', ['footNear'], { ravager: 3 }],
];
const byPair = new Map(measurements.flatMap(([fighterId, motion, contactKey, supportKeys, targets]) => {
  const profile = { motion, contactKey, supportKeys, targets };
  return Object.keys(targets).map(targetId => [fighterId + ':' + targetId, profile]);
}));

export function getXenoTrialsPlantedContactFinisherV219(attacker, target, images) {
  const profile = byPair.get(attacker.id + ':' + target.id);
  const result = getXenoTrialsMeasuredContactFinisherV211(attacker, target, images, profile, 219);
  if (!result) return null;
  const { lock } = result;
  const { rig, attackerMetrics } = lock;
  const { contacts } = sampleXenoTrialsFloorLockV207(lock, 0);
  const supportDepths = lock.supportKeys.map(key =>
    (contacts[key][1] / rig.sourceHeight - attackerMetrics.bottom) * attackerMetrics.height);
  // One support must sit in the floor band of the original plate and none
  // may penetrate the floor. The press keeps every measured support fixed.
  return supportDepths.some(depth => Math.abs(depth) <= 15) && supportDepths.every(depth => depth <= 2) ? result : null;
}
