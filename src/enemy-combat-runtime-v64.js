const CONTRACTS = Object.freeze({
  grappler: Object.freeze({
    behavior: 'grappler',
    stopRange: 82,
    meleeRange: 122,
    speedMultiplier: 1,
    windup: 0.22,
    animationDuration: 0.48,
    cooldown: 1.18,
    lungeDistance: 54,
    lungeStop: 62
  }),
  'reach-hunter': Object.freeze({
    behavior: 'reach-hunter',
    stopRange: 118,
    meleeRange: 168,
    speedMultiplier: 1.28,
    windup: 0.21,
    animationDuration: 0.46,
    cooldown: 0.96,
    lungeDistance: 0,
    lungeStop: 0
  }),
  'hybrid-boss': Object.freeze({
    behavior: 'hybrid-boss',
    stopRange: 112,
    meleeRange: 158,
    speedMultiplier: 0.92,
    windup: 0.19,
    animationDuration: 0.44,
    cooldown: 0.72,
    lungeDistance: 0,
    lungeStop: 0
  })
});

export function resolveEnemyMeleeContractV64(enemyOrBehavior = {}) {
  const behavior = typeof enemyOrBehavior === 'string'
    ? enemyOrBehavior
    : enemyOrBehavior?.behavior;
  return CONTRACTS[behavior] ?? null;
}

export function resolveEnemyMeleeTargetIdV64(target = null) {
  if (!target) return null;
  if (target.squadMember) {
    const squadId = target.crewId || target.operatorId || target.id;
    return squadId ? `squad:${squadId}` : null;
  }
  return target.coop ? 'coop' : 'player';
}

export function isEnemyMeleeTargetValidV64(target = null) {
  return Boolean(target?.alive && !target.downed && !target.lost);
}

export function advanceEnemyMeleeAttackV64(enemy, delta) {
  const contract = resolveEnemyMeleeContractV64(enemy);
  if (!contract || !enemy) return Object.freeze({ contract: null, impactReady: false });
  const safeDelta = Math.max(0, Number(delta) || 0);
  const previousWindup = Math.max(0, Number(enemy.attackWindupClock) || 0);
  enemy.attackWindupClock = Math.max(0, previousWindup - safeDelta);
  enemy.attackAnimationClock = Math.max(0, (Number(enemy.attackAnimationClock) || 0) - safeDelta);
  enemy.attacking = enemy.attackAnimationClock > 0;
  return {
    contract,
    impactReady: Boolean(enemy.pendingMelee && previousWindup > 0 && enemy.attackWindupClock === 0)
  };
}

export function armEnemyMeleeAttackV64(enemy, target = null) {
  const contract = resolveEnemyMeleeContractV64(enemy);
  const targetId = resolveEnemyMeleeTargetIdV64(target);
  if (!contract || !enemy || !targetId || !isEnemyMeleeTargetValidV64(target) || enemy.pendingMelee || Number(enemy.attackClock) > 0) return null;
  enemy.pendingMelee = true;
  enemy.pendingMeleeTargetId = targetId;
  enemy.attackWindupClock = contract.windup;
  enemy.attackAnimationClock = contract.animationDuration;
  enemy.attacking = true;
  return contract;
}

export function cancelEnemyMeleeAttackV64(enemy) {
  const contract = resolveEnemyMeleeContractV64(enemy);
  if (!contract || !enemy) return null;
  enemy.pendingMelee = false;
  enemy.pendingMeleeTargetId = null;
  enemy.attackWindupClock = 0;
  enemy.attackAnimationClock = 0;
  enemy.attackClock = Math.max(Number(enemy.attackClock) || 0, Math.min(0.18, contract.cooldown));
  enemy.attacking = false;
  return contract;
}

export function finishEnemyMeleeAttackV64(enemy) {
  const contract = resolveEnemyMeleeContractV64(enemy);
  if (!contract || !enemy) return null;
  enemy.pendingMelee = false;
  enemy.pendingMeleeTargetId = null;
  enemy.attackWindupClock = 0;
  enemy.attackClock = contract.cooldown;
  enemy.attacking = enemy.attackAnimationClock > 0;
  return contract;
}

export const ENEMY_MELEE_CONTRACTS_V64 = CONTRACTS;
