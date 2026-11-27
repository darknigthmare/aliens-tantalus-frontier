import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105, XENO_TRIALS_ARENA_V105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsGroundGrabPairV212, hasXenoTrialsGroundGrabContactV212, XENO_TRIALS_GROUND_GRAB_KIND_V212 } from './xeno-trials-grapple-v212.js';
import { getXenoTrialsGroundBreakViewV213, stepXenoTrialsGroundBreakV213, XENO_TRIALS_GROUND_BREAK_V213 } from './xeno-trials-grapple-v213.js';

/** Prowler restraint: original 2D adaptation, not captured choreography.
 * The FTE capability is recorded with its limited provenance in V151. Target
 * admission below is a conservative simulation choice, NOT a canonical match.
 * No generic humanoid/family inference, teleport, rig swap or lethal finisher.
 */
export const XENO_TRIALS_GRAPPLE_V153 = Object.freeze({
  id: 'fte-prowler-restraint', fighterId: 'prowler', profileId: 'castes-game_afe_prowler',
  canonExact: false, animation: 'existing-static-pose', sourceId: 'fte-dossier-2021',
  contactGap: 8, releaseGap: 18, durationTicks: 180, escapeTicks: 72,
  firstDamageTick: 48, damageIntervalTicks: 48, damage: 6, recovery: .25,
  minTargetHeight: 60, maxTargetHeight: 210,
  targets: Object.freeze([
    Object.freeze({ id: 'import-game-dd-wy-commando', profileId: 'pose-v106-import-game-dd-wy-commando' }),
    Object.freeze({ id: 'import-game-dd-guardian', profileId: 'pose-v106-import-game-dd-guardian' }),
    Object.freeze({ id: 'dd-darwin-era-cultist', profileId: 'pose-v118-dd-darwin-era-cultist' })
  ])
});
const config = XENO_TRIALS_GRAPPLE_V153;
const actions = ['left','right','jump','guard','light','heavy','special','super'];
export function hasXenoTrialsGrappleV153(definition) {
  return definition?.id === config.fighterId && definition.profileId === config.profileId;
}
export function isXenoTrialsGrappleTargetV153(definition) {
  return config.targets.some(t => t.id === definition?.id && t.profileId === definition.profileId);
}
function activeContract(match, hold) {
  if (hold.grabIdV212 === undefined) return config;
  const from = match.fighters.find(f => f.side === hold.attacker), to = match.fighters.find(f => f.side === hold.target);
  const grab = getXenoTrialsGroundGrabPairV212(getXenoTrialsFighterV96(from?.id), getXenoTrialsFighterV96(to?.id));
  return grab?.id === hold.grabIdV212 ? grab : null;
}
export function canXenoTrialsGrappleV153(from, to, fromDefinition, toDefinition, bounds) {
  if (from === to || from.hp <= 0 || to.hp <= 0 || to.y !== 0 || to.vy !== 0 || from.stun > 0 || !from.attack) return false;
  if (from.attack.kind === XENO_TRIALS_GROUND_GRAB_KIND_V212) {
    const grab = getXenoTrialsGroundGrabPairV212(fromDefinition, toDefinition);
    return Boolean(grab && from.y === 0 && from.vy === 0
      && !from.movesetV207?.low && !to.movesetV207?.low && !to.groundRecoveryV211
      && hasXenoTrialsGroundGrabContactV212(grab, bounds(from), bounds(to), from.attack.facing));
  }
  if (from.attack.kind !== 'special' || !hasXenoTrialsGrappleV153(fromDefinition) || !isXenoTrialsGrappleTargetV153(toDefinition)) return false;
  const a = bounds(from), b = bounds(to), facing = from.attack.facing;
  const gap = facing > 0 ? b.left - a.right : a.left - b.right;
  return [a.bottom,a.top,b.bottom,b.top,gap,b.height].every(Number.isFinite)
    && b.height >= config.minTargetHeight && b.height <= config.maxTargetHeight
    && (b.center - a.center) * facing >= 0 && gap <= config.contactGap
    && gap >= -config.contactGap && a.bottom <= b.top && b.bottom <= a.top;
}
export function isXenoTrialsGrappledV153(match, fighter) {
  const hold = match?.grappleV153;
  return Boolean(hold && fighter && [hold.attacker, hold.target].includes(fighter.side));
}
export function startXenoTrialsGrappleV153(match, from, to, attackId, emit) {
  if (match.phase !== 'active' || match.paused || match.hordeV180 || match.config.rulesV119?.noSpecial || match.grappleV153
    || from.hp <= 0 || to.hp <= 0 || from.stun > 0 || from.attack?.id !== attackId) return false;
  const fromDefinition = getXenoTrialsFighterV96(from.id), toDefinition = getXenoTrialsFighterV96(to.id);
  const grounded = from.attack.kind === XENO_TRIALS_GROUND_GRAB_KIND_V212;
  const grab = grounded ? getXenoTrialsGroundGrabPairV212(fromDefinition, toDefinition) : config;
  if (!grab || (grounded ? !canXenoTrialsGrappleV153(from, to, fromDefinition, toDefinition, getXenoTrialsBodyBoundsV105)
    : from.attack.kind !== 'special' || !hasXenoTrialsGrappleV153(fromDefinition) || !isXenoTrialsGrappleTargetV153(toDefinition))) return false;
  match.grappleV153 = { id: ++match.serial, attacker: from.side, target: to.side,
    bornTick: match.tick, expiresTick: match.tick + grab.durationTicks, nextDamageTick: match.tick + grab.firstDamageTick,
    escapeProgress: 0, attackerX: from.x, targetX: to.x,
    ...(grounded ? { grabIdV212: grab.id, attackIdV212: attackId, facingV212: from.attack.facing } : {}) };
  for (const f of [from,to]) { f.attack = null; f.guard = false; }
  from.stats.grapplesV153 = (from.stats.grapplesV153 || 0) + 1;
  emit('grapple-start-v153', { side: to.side, attacker: from.side, grappleId: match.grappleV153.id,
    ...(grounded ? { grabIdV212: grab.id } : {}) });
  return true;
}
export function clearXenoTrialsGrappleV153(match) { delete match.grappleV153; }
export function releaseXenoTrialsGrappleV153(match, reason, emit = () => {}) {
  const hold = match.grappleV153;
  if (!hold) return false;
  const grab = activeContract(match, hold) || config;
  const countered = reason === 'countered';
  if (countered && (!hold.grabIdV212 || !hold.breakV213 || hold.breakV213.failedTick
    || match.tick !== hold.breakV213.tick + XENO_TRIALS_GROUND_BREAK_V213.effortTicks)) return false;
  delete match.grappleV153;
  for (const fighter of match.fighters) if ([hold.attacker, hold.target].includes(fighter.side)) {
    fighter.attack = null; fighter.guard = false;
    fighter.rearmControls = Object.fromEntries(actions.map(key => [key,
      fighter.rearmControls?.[key] === true || fighter.previousInput?.[key] === true]));
    if (fighter.hp > 0) {
      const recovery = countered ? (fighter.side === hold.attacker ? XENO_TRIALS_GROUND_BREAK_V213.captorRecovery
        : XENO_TRIALS_GROUND_BREAK_V213.captiveRecovery) : grab.recovery;
      fighter.stun = Math.max(fighter.stun, recovery);
    }
    if (countered && fighter.side === hold.attacker) {
      const x = fighter.x - hold.facingV212 * XENO_TRIALS_GROUND_BREAK_V213.recoil;
      fighter.x = Math.max(XENO_TRIALS_ARENA_V105.left, Math.min(XENO_TRIALS_ARENA_V105.right, x));
    }
    if ((reason === 'escaped' || countered) && fighter.side === hold.target)
      fighter.stats.grappleEscapesV153 = (fighter.stats.grappleEscapesV153 || 0) + 1;
  }
  emit('grapple-end-v153', { side: hold.target, attacker: hold.attacker, grappleId: hold.id, reason,
    ...(hold.grabIdV212 ? { grabIdV212: hold.grabIdV212 } : {}),
    ...(countered ? { breakStartV213: hold.breakV213.startId } : {}) });
  return true;
}
/** One bounded restraint per duel. Both actors keep their collision bodies;
 * gravity and existing projectiles/acids continue, ordinary actions do not.
 * Hold GUARD to escape; no button-mashing, random prompt or repeated costs.
 */
export function stepXenoTrialsGrappleV153(match, bounds, impact, emit) {
  const hold = match.grappleV153;
  if (!hold || match.paused || match.phase !== 'active') return;
  const grab = activeContract(match, hold);
  const from = match.fighters.find(f => f.side === hold.attacker), to = match.fighters.find(f => f.side === hold.target);
  if (!grab || !from || !to || from.hp <= 0 || to.hp <= 0 || from.stun > 0 || match.config.rulesV119?.noSpecial) {
    releaseXenoTrialsGrappleV153(match, 'interrupted', emit); return;
  }
  const a = bounds(from), b = bounds(to);
  if (Math.abs(from.x - hold.attackerX) > grab.releaseGap || Math.abs(to.x - hold.targetX) > grab.releaseGap
    || Math.max(a.left - b.right, b.left - a.right) > grab.releaseGap || to.y > 0
    || hold.grabIdV212 && (!hasXenoTrialsGroundGrabContactV212(grab, a, b, hold.facingV212, grab.releaseGap)
      || from.vy !== 0 || to.vy !== 0 || from.facing !== hold.facingV212)) {
    releaseXenoTrialsGrappleV153(match, 'separated', emit); return;
  }
  if (match.tick <= hold.bornTick) return;
  hold.escapeProgress = to.previousInput.guard && !to.rearmControls.guard ? hold.escapeProgress + 1 : 0;
  if (hold.grabIdV212 && stepXenoTrialsGroundBreakV213(match, to, emit)) {
    releaseXenoTrialsGrappleV153(match, 'countered', emit); return;
  }
  if (hold.escapeProgress >= grab.escapeTicks) { releaseXenoTrialsGrappleV153(match, 'escaped', emit); return; }
  if (match.tick >= hold.expiresTick) { releaseXenoTrialsGrappleV153(match, 'timeout', emit); return; }
  if (match.tick >= hold.nextDamageTick) {
    hold.nextDamageTick += grab.damageIntervalTicks;
    impact({ from, to, power: 1, direction: 0,
      spec: { damage: grab.damage, stun: 0, push: 0, unblockableV151: true, continuousV153: true } });
  }
}
function escapePrompt(match, hold, detailed = false) {
  if (hold.target === 'opponent' && match.opponentInputSourceV163 !== 'direct') return 'SAISIE · RÉSISTANCE ADVERSE';
  const escape = getXenoTrialsGroundBreakViewV213(match);
  if (escape?.state === 'ready') return 'DÉGAGEMENT RAPIDE · GARDE + J';
  if (escape?.state === 'committed') return 'DÉGAGEMENT · MAINTENEZ GARDE';
  return detailed ? 'SAISIE · MAINTENIR GARDE POUR SE DÉGAGER' : 'SAISIE · GARDE POUR DÉGAGER';
}
export function getXenoTrialsGrappleViewV153(match) {
  const hold = match?.grappleV153;
  const grab = hold && activeContract(match, hold);
  return grab ? { ...hold, remainingTicks: Math.max(0, hold.expiresTick - match.tick),
    escapeRatio: Math.min(1, hold.escapeProgress / grab.escapeTicks),
    label: escapePrompt(match, hold, true), canonExact: false,
    animation: grab.animation, ...(hold.grabIdV212 ? { escapeV213: getXenoTrialsGroundBreakViewV213(match) } : {}) } : null;
}
/** Read-only restraint indicators. Existing art and world scale are untouched.
 * No procedural bending is presented as an authored, articulated pin animation.
 */
export function drawXenoTrialsGrappleV153(ctx, match, bounds, floor, options = {}) {
  const view = getXenoTrialsGrappleViewV153(match);
  if (!view) return;
  const actors = [view.attacker, view.target].map(side => match.fighters.find(f => f.side === side));
  if (actors.some(f => !f)) return;
  const [a,b] = actors.map(bounds), y = floor - Math.max(a.top,b.top) - 28;
  ctx.save(); ctx.strokeStyle = '#e4c889'; ctx.lineWidth = 2;
  // The historical connector explains the static fallback. A complete paired
  // pose already shows its contact and must not draw a line to standing bounds.
  // Explicit opt-out keeps every existing caller's HUD contract unchanged.
  if (options?.showLegacyContactLine !== false) {
    ctx.beginPath();
    const grab = view.grabIdV212 && activeContract(match, view);
    if (grab) {
      const fore = view.facingV212 > 0 ? a.right : a.left, near = view.facingV212 > 0 ? b.left : b.right;
      const bottom = Math.max(grab.sourceBand[0] * a.height, grab.targetBand[0] * b.height);
      const top = Math.min(grab.sourceBand[1] * a.height, grab.targetBand[1] * b.height);
      const contact = floor - (top + bottom) / 2;
      ctx.moveTo(fore, contact); ctx.lineTo(near, contact);
    } else {
      ctx.moveTo(a.center, floor - a.bottom - a.height * .45);
      ctx.lineTo(b.center, floor - b.bottom - b.height * .45);
    }
    ctx.stroke();
  }
  ctx.fillStyle = '#061019'; ctx.fillRect(b.center - 48, y, 96, 8);
  ctx.fillStyle = '#a7dbb0'; ctx.fillRect(b.center - 48, y, 96 * view.escapeRatio, 8);
  ctx.font = '12px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#e4c889';
  ctx.fillText(escapePrompt(match, view), b.center, y - 8); ctx.restore();
}
