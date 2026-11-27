import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_ARENA_V105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsRenderMetricsV110 } from './xeno-trials-scale-v110.js';
import { getXenoTrialsGroundApproachLockV213 } from './xeno-trials-capture-v163.js';
import { getXenoTrialsRigV154, getXenoTrialsRuntimeArticulatedRig, getXenoTrialsRuntimeDefenseRig } from './xeno-trials-rig-v154.js';
import { drawXenoTrialsFinisherStepV212, getXenoTrialsFinisherGaitV212 } from './xeno-trials-finishers-v212.js';

export const XENO_TRIALS_FINISHER_COPY_V213 = Object.freeze({
  'contact-approach': Object.freeze({ button: 'F · APPROCHER AU CONTACT',
    offered: 'Victoire confirmée. Approche au contact disponible avec F.', playing: 'Approche et contrôle du spécimen.' })
});

const supports = new Map([
  ['chrysalis', 'paw', 'footNear', ['footFar'], { 'crusher-acm': 3, ravager: 3 }],
  ['synth-trooper', 'boot', 'footFar', ['footNear'], { 'user-brute': 3, ravager: 3 }],
  ['synth-guard', 'boot', 'footFar', ['footNear'], { 'user-brute': 3, ravager: 3 }]
].map(([id, motion, contactKey, supportKeys, targets]) => [id, { motion, contactKey, supportKeys, targets }]));

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => value * value * (3 - 2 * value);
const { floor } = XENO_TRIALS_ARENA_V105;

/** The two fighters settle at their real roots. Only a selected, valid walking
 * path can move the presentation to a measured contact and back. */
export function getXenoTrialsContactApproachV213(attacker, target, images) {
  const profile = supports.get(attacker.id);
  const anchor = profile?.targets[target.id];
  if (!Number.isInteger(anchor)) return null;
  const gait = getXenoTrialsFinisherGaitV212(attacker, images, true);
  if (!gait) return null;
  const definition = getXenoTrialsFighterV96(attacker.id), art = getXenoTrialsArtV96(attacker.id, attacker.variant);
  const rig = getXenoTrialsRuntimeArticulatedRig(definition, art) || getXenoTrialsRuntimeDefenseRig(definition, art)
    || getXenoTrialsRigV154(definition, art);
  if (!rig || rig.profileId !== definition.profileId) return null;
  const metrics = getXenoTrialsRenderMetricsV110(attacker.id, attacker.variant);
  const walkSupports = [];
  for (const frame of gait.atlas.frames.filter(value => value.id.startsWith('walk-'))) {
    const step = gait.layout(gait.atlas, frame, metrics, { x: attacker.x, y: floor, facing: attacker.facing });
    if (!step?.supports.length || step.supports.some(([, y]) => Math.abs(y - floor) > 6)) return null;
    for (const [x] of step.supports) walkSupports.push(x);
  }
  const lock = getXenoTrialsGroundApproachLockV213(attacker, target, images, rig,
    { ...profile, walkSupports, liftHeight: 6, range: 15, revision: 213 }, anchor, XENO_TRIALS_ARENA_V105);
  if (!lock) return null;
  const travel = Math.max(180, Math.round(Math.abs(lock.offset) * 9));
  const setFoot = 150;
  return { id: `${attacker.id}::fin1`, kind: 'contact-approach',
    timing: { approachMs: travel + setFoot, holdMs: 440, retreatMs: travel + setFoot },
    lock: { ...lock, approachV213: { gait, travel, setFoot } } };
}

export function getXenoTrialsContactApproachViewV213(sequence) {
  const { lock, elapsedMs, durationMs, phase } = sequence;
  const { travel, setFoot } = lock.approachV213;
  const timeFromEdge = Math.min(elapsedMs, durationMs - elapsedMs);
  const travelAmount = clamp(timeFromEdge / travel);
  const pressure = smooth(clamp((timeFromEdge - travel) / setFoot));
  return { lock, mix: smooth(clamp(timeFromEdge / 100)), gain: pressure,
    contact: phase === 'playing' && pressure === 1,
    walkV213: travelAmount > 0 && travelAmount < 1,
    contactX: lock.attacker.x + lock.offset * smooth(travelAmount) };
}

export function drawXenoTrialsContactStepV213(ctx, fighter, view, images) {
  const { gait } = view.lock.approachV213;
  const drawn = drawXenoTrialsFinisherStepV212(ctx, fighter, view.contactX, gait, view.lock.attackerMetrics, images);
  return drawn && { ...drawn, contactApproachV213: { x: view.contactX, origin: fighter.x, destination: view.lock.contactX } };
}
