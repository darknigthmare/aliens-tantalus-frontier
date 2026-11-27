import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsFloorLockV207 } from './xeno-trials-capture-v163.js';
import { hasXenoTrialsGrappleV153, isXenoTrialsGrappleTargetV153 } from './xeno-trials-grapple-v153.js';
import { getXenoTrialsExtendedFinisherV208 } from './xeno-trials-finishers-v208.js';
import { getXenoTrialsExtendedFinisherV209 } from './xeno-trials-finishers-v209.js';
import { getXenoTrialsExtendedFinisherV210 } from './xeno-trials-finishers-v210.js';
import { getXenoTrialsContactFinisherV211, getXenoTrialsIsolationFixturesV211, getXenoTrialsNeutralFinishersV211 } from './xeno-trials-finishers-v211.js';
import { getXenoTrialsContactFinisherV212, getXenoTrialsIsolationApproachV212 } from './xeno-trials-finishers-v212.js';
import { getXenoTrialsContactApproachV213, getXenoTrialsContactApproachViewV213 } from './xeno-trials-finishers-v213.js';
import { getXenoTrialsPlantedContactFinisherV219 } from './xeno-trials-finishers-v219.js';
import { getXenoTrialsFixtureWithdrawalV221 } from './xeno-trials-finishers-v221.js';
import { getXenoTrialsCrossScanV222 } from './xeno-trials-finishers-v222.js';
import { getXenoTrialsLandedContactV223, openXenoTrialsLandedContactV223 } from './xeno-trials-finishers-v223.js';

export { openXenoTrialsLandedContactV223 };

const offerMs = 3600;
const clawTiming = Object.freeze({ approachMs: 240, holdMs: 420, retreatMs: 360 });
const active = sequence => ['landing', 'offered', 'playing'].includes(sequence?.phase);
const smooth = progress => progress * progress * (3 - 2 * progress);

function makeOffer(candidate, alternatives, phase = 'offered') {
  return { ...candidate, alternatives, phase, elapsedMs: 0, durationMs: candidate.lock.neutral ? 2400 : offerMs,
    paused: false, skipped: false, activated: false };
}

/** Optional displays share a post-verdict clock and use the terminal geometry. */
export function createXenoTrialsFinisherV207(match, images, reducedMotion = false, neutralFallback = false, landing = null) {
  if (reducedMotion || match?.phase !== 'match-over' || match.hordeV180 || match.operationV188
    || !match.result?.completed || match.result.winner !== 'player' || match.result.reason !== 'ko'
    || match.result.matchId !== match.config?.matchId || match.result.durationTicks !== match.tick
    || match.fighters?.length !== 2) return null;
  const attacker = match.fighters.find(fighter => fighter.side === 'player');
  const target = match.fighters.find(fighter => fighter.side === 'opponent');
  if (!attacker || !target || match.result.playerId !== attacker.id || match.result.opponentId !== target.id
    || attacker.hp <= 0 || target.hp !== 0 || attacker.y !== 0) return null;
  if (target.y !== 0) {
    const landed = neutralFallback && getXenoTrialsLandedContactV223(match, attacker, target, images, landing);
    return landed ? makeOffer(landed, [], landing.phase === 'complete' ? 'offered' : 'landing') : null;
  }
  const legacyTarget = isXenoTrialsGrappleTargetV153(getXenoTrialsFighterV96(target.id));
  const candidates = [getXenoTrialsExtendedFinisherV210(match, attacker, target, images), legacyTarget
    && (getXenoTrialsExtendedFinisherV209(match, attacker, target, images) || getXenoTrialsExtendedFinisherV208(match, attacker, target, images))].filter(Boolean);
  if (legacyTarget && hasXenoTrialsGrappleV153(getXenoTrialsFighterV96(attacker.id))) {
    const lock = getXenoTrialsFloorLockV207(attacker, target, images);
    if (lock) candidates.push({ id: 'prowler::fin1', kind: 'claw', timing: clawTiming, lock });
  }
  if (neutralFallback) {
    const additions = [getXenoTrialsContactFinisherV211(attacker, target, images),
      getXenoTrialsContactFinisherV212(attacker, target, images),
      getXenoTrialsContactApproachV213(attacker, target, images),
      getXenoTrialsPlantedContactFinisherV219(attacker, target, images),
      ...getXenoTrialsNeutralFinishersV211(match, attacker, target),
      getXenoTrialsIsolationApproachV212(match, attacker, target, images),
      getXenoTrialsFixtureWithdrawalV221(match, attacker, target, images)].filter(Boolean);
    for (const fallback of additions) {
      if (!candidates.some(candidate => candidate.id === fallback.id)) candidates.push(fallback);
    }
    if (candidates.length === 1 && candidates[0].kind === 'seal') {
      const crossScan = getXenoTrialsCrossScanV222(match, attacker, target, getXenoTrialsIsolationFixturesV211(match.config.stageId));
      if (crossScan) candidates.push(crossScan);
    }
  }
  const [candidate, ...alternatives] = candidates;
  return candidate ? makeOffer(candidate, alternatives) : null;
}

export function activateXenoTrialsFinisherV207(sequence, id = sequence?.id) {
  if (sequence?.phase !== 'offered' || sequence.paused) return sequence;
  const chosen = id === sequence.id ? sequence : sequence.alternatives.find(candidate => candidate.id === id);
  if (!chosen) return sequence;
  const { approachMs, holdMs, retreatMs } = chosen.timing;
  const durationMs = approachMs + holdMs + retreatMs;
  return { ...chosen, alternatives: [], phase: 'playing', paused: false, skipped: false, activated: true, elapsedMs: 0, durationMs };
}

export function pauseXenoTrialsFinisherV207(sequence, paused) {
  return active(sequence) ? { ...sequence, paused } : sequence;
}

export function advanceXenoTrialsFinisherV207(sequence, deltaMs) {
  if (!active(sequence) || sequence.phase === 'landing' || sequence.paused || !Number.isFinite(deltaMs) || deltaMs <= 0) return sequence;
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
  if (sequence.lock.approachV213) return getXenoTrialsContactApproachViewV213(sequence);
  const { approachMs, holdMs, retreatMs } = sequence.timing;
  const elapsed = sequence.elapsedMs;
  const mix = smooth(Math.min(1, elapsed / approachMs));
  const gain = elapsed < approachMs ? elapsed / approachMs : 1 - Math.max(0, (elapsed - approachMs - holdMs) / retreatMs);
  return { lock: sequence.lock, mix, gain, contact: sequence.phase === 'playing' && gain === 1,
    ...(sequence.lock.withdrawalV221 ? { withdrawingV221: elapsed < approachMs } : {}) };
}

export function getXenoTrialsFinisherStateV207(sequence) {
  if (!sequence) return null;
  const { id, kind, phase, elapsedMs, durationMs, paused, skipped, lock } = sequence;
  return { id, kind, phase, elapsedMs, durationMs, paused, skipped, targetId: lock.target.id,
    ...(phase === 'offered' && sequence.alternatives.length ? { alternatives: sequence.alternatives.map(({ id, kind }) => ({ id, kind })) } : {}),
    ...(lock.fixture ? { fixtureId: lock.fixture.id } : {}),
    ...(lock.withdrawalV221 ? { withdrawalV221: { ...lock.withdrawalV221 } } : {}),
    ...(lock.afterLandingV223 ? { afterLandingV223: { ...lock.afterLandingV223 } } : {}),
    ...(lock.crossScanV222 ? { crossScanV222: lock.crossScanV222.fixtures.map(fixture => fixture.id) } : {}) };
}
