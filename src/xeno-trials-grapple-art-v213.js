import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsRigV154, getXenoTrialsRigMeshV154, sampleXenoTrialsSequenceAnglesV211,
  xenoTrialsTriangleAreaV154 } from './xeno-trials-rig-v154.js';
import { getXenoTrialsRenderMetricsV110 } from './xeno-trials-scale-v110.js';
import { XENO_TRIALS_ARENA_V105 } from './xeno-trials-geometry-v105.js';

// Measured wrist landmarks on the existing plates. No root motion and no
// support shifts are introduced. Refuse a gap the authored arm arc cannot close.
const profiles = {
  sniper: { key: 'handNear', angles: { spine: 8, upper1: -8, fore1: -8 } },
  common: { key: 'handNear', angles: { spine: 4, upper1: -8, fore1: -8 } },
  armored: { key: 'handNear', angles: { upper1: -8, fore1: -8 } },
  pressure: { key: 'handFar', angles: { spine: -8, upper0: 8, fore0: 8 } },
};
const pairs = new Map([
  ['synth-sniper:synth-sniper', profiles.sniper],
  ['synth-sniper:armored-joe', profiles.common],
  ['armored-joe:synth-sniper', profiles.common],
  ['armored-joe:armored-joe', profiles.armored],
  ['import-wy-apesuit:import-wy-apesuit', profiles.pressure],
]);
const rigIds = new Map([
  ['synth-sniper', 'rig-v163-synth-sniper'],
  ['armored-joe', 'rig-v163-armored-joe'],
  ['import-wy-apesuit', 'rig-v163-import-wy-apesuit'],
]);
const windupTicks = 10;
const maxGap = 4.5;
const supportKeys = ['footNear', 'footFar'];
const sampled = new Map();

function frameFor(rig, profile, tick) {
  const key = [rig.id, profile.key, ...Object.values(profile.angles), tick].join(':');
  if (!sampled.has(key)) {
    const progress = tick / windupTicks;
    const ease = progress * progress * (3 - 2 * progress);
    const angles = Object.fromEntries(Object.entries(profile.angles).map(([bone, degrees]) => [bone, degrees * ease]));
    const frame = sampleXenoTrialsSequenceAnglesV211(rig, { clip: 'ground-grip-v213', elapsed: tick / 120, progress }, angles);
    const mesh = getXenoTrialsRigMeshV154(rig);
    const stable = frame && mesh.triangles.every(([a, b, c]) =>
      xenoTrialsTriangleAreaV154(frame.vertices[a], frame.vertices[b], frame.vertices[c])
        >= xenoTrialsTriangleAreaV154(mesh.vertices[a].source, mesh.vertices[b].source, mesh.vertices[c].source) * .2);
    sampled.set(key, stable ? frame : null);
  }
  return sampled.get(key);
}

function pointAt([x, y], rig, metrics, fighter) {
  return [fighter.x + (x / rig.sourceWidth - metrics.pivotX) * metrics.width * fighter.facing * rig.sourceFacing,
    XENO_TRIALS_ARENA_V105.floor + (y / rig.sourceHeight - metrics.bottom) * metrics.height];
}

function measureActor(fighter, images, zoom, profile, tick) {
  if (fighter.y !== 0 || fighter.vy !== 0 || fighter.hp <= 0 || fighter.movesetV207?.low || fighter.groundRecoveryV211) return null;
  const definition = getXenoTrialsFighterV96(fighter.id);
  const art = getXenoTrialsArtV96(fighter.id, fighter.variant);
  const rig = getXenoTrialsRigV154(definition, art);
  if (!rig || rig.id !== rigIds.get(fighter.id) || !rig.contacts[profile.key]) return null;
  const image = images.get(rig.path), metrics = getXenoTrialsRenderMetricsV110(fighter.id, fighter.variant, zoom);
  if (!image || image.complete === false || (image.naturalWidth ?? image.width) !== rig.sourceWidth
    || (image.naturalHeight ?? image.height) !== rig.sourceHeight || !metrics) return null;
  const rest = frameFor(rig, profile, 0), pose = frameFor(rig, profile, tick), closed = frameFor(rig, profile, windupTicks);
  if (!rest || !pose?.active || !closed) return null;
  const point = (frame, key) => pointAt(frame.contacts[key], rig, metrics, fighter);
  if (supportKeys.some(key => [pose, closed].some(frame => {
    const from = point(rest, key), to = point(frame, key);
    return Math.hypot(from[0] - to[0], from[1] - to[1]) > .7;
  }))) return null;
  return { fighter, rig, pose: { ...pose, animation: 'measured-paired-grip-v213' }, metrics, image, contactKey: profile.key,
    contact: point(pose, profile.key), closedContact: point(closed, profile.key) };
}

export function getXenoTrialsGroundGripPoseV213(match, images, zoom, reducedMotion) {
  const hold = match.grappleV153;
  if (!hold?.grabIdV212 || match.phase !== 'active' || reducedMotion) return null;
  const attacker = match.fighters.find(actor => actor.side === hold.attacker);
  const target = match.fighters.find(actor => actor.side === hold.target);
  const profile = pairs.get(attacker?.id + ':' + target?.id);
  if (!profile || hold.grabIdV212 !== attacker.id + '::grab' || attacker.facing !== hold.facingV212
    || target.facing !== -hold.facingV212) return null;
  const tick = Math.min(windupTicks, match.tick - hold.bornTick + 1);
  const actors = [attacker, target].map(actor => measureActor(actor, images, zoom, profile, tick));
  if (actors.some(actor => !actor)) return null;
  const gap = key => Math.hypot(actors[0][key][0] - actors[1][key][0], actors[0][key][1] - actors[1][key][1]);
  if (gap('closedContact') > maxGap) return null;
  const contactGap = gap('contact');
  return { attacker, target, actors, contact: contactGap <= maxGap, contactGap, grappleId: hold.id };
}
