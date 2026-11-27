export const XENO_TRIALS_GROUND_BREAK_V213 = Object.freeze({
  minHeld: 18, maxHeld: 32, effortTicks: 8, cost: 14,
  recoil: 14, captorRecovery: .32, captiveRecovery: .10,
});
export const XENO_TRIALS_GROUND_BREAK_START_V213 = 'grapple-break-start-v213';
export const XENO_TRIALS_GROUND_BREAK_FAIL_V213 = 'grapple-break-fail-v213';
const rules = XENO_TRIALS_GROUND_BREAK_V213;
const grounded = fighter => fighter.hp > 0 && fighter.y === 0 && fighter.vy === 0
  && fighter.stun === 0 && !fighter.groundRecoveryV211 && !fighter.movesetV207?.low;

export function canStartXenoTrialsGroundBreakV213(match, fighter) {
  const hold = match.grappleV153;
  return Boolean(hold?.grabIdV212 && hold.target === fighter.side && !hold.breakV213
    && match.phase === 'active' && !match.hordeV180 && !match.paused && !match.config.rulesV119?.noSpecial && grounded(fighter)
    && fighter.previousInput.guard && !fighter.rearmControls.guard && fighter.stamina >= rules.cost
    && hold.escapeProgress >= rules.minHeld && hold.escapeProgress <= rules.maxHeld
    && match.tick + rules.effortTicks <= hold.expiresTick);
}

export function beginXenoTrialsGroundBreakV213(match, fighter, controls, emit) {
  if (!controls.guard || !controls.light || fighter.previousInput.light || !canStartXenoTrialsGroundBreakV213(match, fighter)) return;
  const hold = match.grappleV153;
  const staminaBefore = fighter.stamina, heldTicks = hold.escapeProgress;
  hold.breakV213 = { startId: match.serial + 1, tick: match.tick, staminaBefore, heldTicks, failedTick: 0 };
  fighter.stamina -= rules.cost;
  emit(XENO_TRIALS_GROUND_BREAK_START_V213, { side: hold.target, attacker: hold.attacker, grappleId: hold.id,
    grabIdV212: hold.grabIdV212, heldTicksV213: heldTicks, staminaBeforeV213: staminaBefore });
}

export function stepXenoTrialsGroundBreakV213(match, fighter, emit) {
  const hold = match.grappleV153, effort = hold.breakV213;
  if (!effort || effort.failedTick) return false;
  if (!grounded(fighter) || !fighter.previousInput.guard || fighter.rearmControls.guard) {
    effort.failedTick = match.tick;
    emit(XENO_TRIALS_GROUND_BREAK_FAIL_V213, { side: hold.target, attacker: hold.attacker, grappleId: hold.id,
      grabIdV212: hold.grabIdV212, breakStartV213: effort.startId });
    return false;
  }
  return match.tick >= effort.tick + rules.effortTicks;
}

export function getXenoTrialsGroundBreakViewV213(match) {
  const hold = match.grappleV153;
  if (!hold?.grabIdV212) return null;
  const fighter = match.fighters.find(actor => actor.side === hold.target);
  if (!fighter) return null;
  const effort = hold.breakV213;
  if (!effort) return { state: canStartXenoTrialsGroundBreakV213(match, fighter) ? 'ready' : 'idle' };
  if (effort.failedTick) return { state: 'failed' };
  return { state: 'committed', remainingTicks: Math.max(0, effort.tick + rules.effortTicks - match.tick) };
}
