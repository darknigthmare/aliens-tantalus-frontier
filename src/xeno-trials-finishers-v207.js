import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsFloorLockV207 } from './xeno-trials-capture-v163.js';
import { hasXenoTrialsGrappleV153, isXenoTrialsGrappleTargetV153 } from './xeno-trials-grapple-v153.js';
import { getXenoTrialsExtendedFinisherV208 } from './xeno-trials-finishers-v208.js';

const offerMs = 3600;
const clawTiming = Object.freeze({ approachMs: 240, holdMs: 420, retreatMs: 360 });
const active = sequence => ['offered', 'playing'].includes(sequence?.phase);
const smooth = progress => progress * progress * (3 - 2 * progress);

/** Optional displays share a post-verdict clock and use the terminal geometry. */
export function createXenoTrialsFinisherV207(match, images, reducedMotion = false) {
  if (reducedMotion || match?.phase !== 'match-over' || match.hordeV180 || match.operationV188
    || !match.result?.completed || match.result.winner !== 'player' || match.result.reason !== 'ko'
    || match.fighters?.length !== 2) return null;
  const attacker = match.fighters.find(fighter => fighter.side === 'player');
  const target = match.fighters.find(fighter => fighter.side === 'opponent');
  if (!attacker || !target || !isXenoTrialsGrappleTargetV153(getXenoTrialsFighterV96(target.id))
    || attacker.hp <= 0 || target.hp !== 0 || attacker.y !== 0 || target.y !== 0) return null;
  let candidate = getXenoTrialsExtendedFinisherV208(match, attacker, target, images);
  if (!candidate && hasXenoTrialsGrappleV153(getXenoTrialsFighterV96(attacker.id))) {
    const lock = getXenoTrialsFloorLockV207(attacker, target, images);
    if (lock) candidate = { id: 'prowler::fin1', kind: 'claw', timing: clawTiming, lock };
  }
  if (!candidate) return null;
  return { ...candidate, phase: 'offered', elapsedMs: 0, durationMs: offerMs, paused: false, skipped: false, activated: false };
}

export function activateXenoTrialsFinisherV207(sequence) {
  if (sequence?.phase !== 'offered' || sequence.paused) return sequence;
  const { approachMs, holdMs, retreatMs } = sequence.timing;
  const durationMs = approachMs + holdMs + retreatMs;
  return { ...sequence, phase: 'playing', activated: true, elapsedMs: 0, durationMs };
}

export function pauseXenoTrialsFinisherV207(sequence, paused) {
  return active(sequence) ? { ...sequence, paused } : sequence;
}

export function advanceXenoTrialsFinisherV207(sequence, deltaMs) {
  if (!active(sequence) || sequence.paused || !Number.isFinite(deltaMs) || deltaMs <= 0) return sequence;
  const elapsedMs = Math.min(sequence.durationMs, sequence.elapsedMs + deltaMs);
  const phase = elapsedMs < sequence.durationMs ? sequence.phase : sequence.activated ? 'complete' : 'declined';
  return { ...sequence, elapsedMs, phase };
}

export function skipXenoTrialsFinisherV207(sequence) {
  if (!active(sequence) || sequence.paused) return sequence;
  return { ...sequence, phase: sequence.activated ? 'complete' : 'declined', skipped: true, elapsedMs: sequence.durationMs };
}

export function getXenoTrialsFinisherViewV207(sequence) {
  if (!sequence?.activated) return null;
  const { approachMs, holdMs, retreatMs } = sequence.timing;
  const elapsed = sequence.elapsedMs;
  const mix = smooth(Math.min(1, elapsed / approachMs));
  const gain = elapsed < approachMs ? elapsed / approachMs : 1 - Math.max(0, (elapsed - approachMs - holdMs) / retreatMs);
  return { lock: sequence.lock, mix, gain, contact: sequence.phase === 'playing' && gain === 1 };
}

export function getXenoTrialsFinisherStateV207(sequence) {
  if (!sequence) return null;
  const { id, kind, phase, elapsedMs, durationMs, paused, skipped, lock } = sequence;
  return { id, kind, phase, elapsedMs, durationMs, paused, skipped, targetId: lock.target.id,
    ...(lock.fixture ? { fixtureId: lock.fixture.id } : {}) };
}
