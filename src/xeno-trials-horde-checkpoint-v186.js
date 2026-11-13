import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsHordeProtocolV180, XENO_TRIALS_HORDE_LIMITS_V180 as LIMITS } from './xeno-trials-horde-v180.js';
import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { getXenoTrialsAttackV147, getXenoTrialsSignatureV147, getXenoTrialsSpecialStyleV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsSuperV148 } from './xeno-trials-supers-v148.js';
import { XENO_TRIALS_AI_STATES_V119 } from './xeno-trials-ai-v119.js';
import { XENO_TRIALS_ACID_POOL_V152 as ACID, hasXenoTrialsAcidPoolsV152 } from './xeno-trials-acid-pools-v152.js';
import { XENO_TRIALS_ARENA_V105 as ARENA } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsOperationV188, validateXenoTrialsOperationSnapshotV188,
  isXenoTrialsOperationForwardV188 } from './xeno-trials-operations-v188.js';
import { validateXenoTrialsStageHazardsV188, isXenoTrialsStageHazardsForwardV188 } from './xeno-trials-stage-hazards-v188.js';

export const XENO_TRIALS_CHECKPOINT_LIMITS_V186 = Object.freeze({ maxCharacters: 524288, maxNodes: 40000, maxDepth: 24 });
const actions = ['left', 'right', 'jump', 'guard', 'light', 'heavy', 'special', 'super', 'interact'];
const statsKeys = ['hits', 'damage', 'blocks', 'specials', 'supersV148', 'grappleTicksV153', 'acidTicksV152'];
const coreKeys = ['version', 'config', 'rng', 'accumulator', 'tick', 'round', 'opponentInputSourceV163', 'phase', 'phaseTime',
  'paused', 'timeRemaining', 'wins', 'roundWinner', 'roundReason', 'result', 'fighters', 'projectiles', 'events', 'serial', 'ai',
  'hordeV180', 'synthEffectsV110', 'acidDropsV152', 'acidPoolsV152', 'acidNextHitV152', 'operationV188', 'stageHazardsV188'];
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (value, low = 0, high = 1000000) => Number.isSafeInteger(value) && value >= low && value <= high;
const number = (value, low, high) => Number.isFinite(value) && value >= low && value <= high;
const controls = value => record(value) && Object.keys(value).every(key => actions.includes(key))
  && actions.every(key => typeof value[key] === 'boolean' || key === 'interact' && value[key] === undefined);
const same = (a, b) => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const left = Object.keys(a).sort(), right = Object.keys(b).sort();
  return sameKeys(left, right) && left.every(key => same(a[key], b[key]));
};
const sameKeys = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

function boundedClone(value) {
  let nodes = 0;
  function visit(item, depth) {
    if (++nodes > XENO_TRIALS_CHECKPOINT_LIMITS_V186.maxNodes || depth > XENO_TRIALS_CHECKPOINT_LIMITS_V186.maxDepth) return false;
    if (typeof item === 'number') return Number.isFinite(item);
    if (typeof item === 'string') return item.length <= 4096;
    if (item === null || typeof item === 'boolean') return true;
    if (!item || typeof item !== 'object') return false;
    return Object.keys(item).every(key => !['__proto__', 'constructor', 'prototype'].includes(key) && visit(item[key], depth + 1));
  }
  try {
    if (!visit(value, 0)) return null;
    const text = JSON.stringify(value);
    return text.length <= XENO_TRIALS_CHECKPOINT_LIMITS_V186.maxCharacters ? JSON.parse(text) : null;
  } catch { return null; }
}

function validStats(stats, ticks, maximumDamage) {
  return record(stats) && ['hits', 'damage', 'blocks', 'specials'].every(key => Object.hasOwn(stats, key))
    && Object.keys(stats).every(key => statsKeys.includes(key) && integer(stats[key], 0, ticks * 16 + 1))
    && stats.damage >= stats.hits + (stats.acidTicksV152 || 0) && !(stats.grappleTicksV153 > 0) && stats.damage <= maximumDamage;
}
function validBrain(brain, ticks) {
  return record(brain) && brain.schema === 119 && XENO_TRIALS_AI_STATES_V119.includes(brain.state)
    && number(brain.stateTime, 0, ticks / 120 + 1) && number(brain.decisionIn, 0, 1)
    && number(brain.guardRemaining, 0, 1) && controls(brain.input) && integer(brain.decisions, 0, ticks + 1)
    && (brain.lastAttackId === null || integer(brain.lastAttackId)) && record(brain.stateVisits)
    && Object.entries(brain.stateVisits).every(([key, value]) => XENO_TRIALS_AI_STATES_V119.includes(key) && integer(value, 0, ticks + 1));
}
function validAttack(attack, fighter, match) {
  if (attack === null) return true;
  const spec = getXenoTrialsAttackV147(getXenoTrialsFighterV96(fighter.id), attack?.kind, XENO_TRIALS_ATTACKS_V96[attack?.kind]);
  if (!record(attack) || !spec || !['light', 'heavy', 'special', 'super'].includes(attack.kind)
    || !integer(attack.id, 1, match.serial) || !number(attack.age, 0, spec.startup + spec.active + spec.recovery)
    || ![-1, 1].includes(attack.facing) || typeof attack.hit !== 'boolean' || typeof attack.emitted !== 'boolean') return false;
  if (attack.kind === 'super' && !(fighter.stats.supersV148 > 0)) return false;
  const historyLimit = Math.min(match.hordeV180.totalEnemies,
    LIMITS.maxConcurrent + Math.ceil(spec.active * 120 / LIMITS.reinforcementTicks) + 1);
  for (const key of ['hitTargetsV180', 'flameTargetsV180']) if (attack[key] !== undefined
    && (!Array.isArray(attack[key]) || attack[key].length > historyLimit || new Set(attack[key]).size !== attack[key].length || attack[key].some(id => id !== 'player'
      && (!/^horde-\d+$/.test(id) || !integer(Number(id.slice(6)), 1, match.hordeV180.serial))))) return false;
  for (const key of ['flamePulse', 'volleysV148']) if (attack[key] !== undefined && !integer(attack[key], 0, 100)) return false;
  for (const key of ['launchedV147', 'detonationEmittedV180']) if (attack[key] !== undefined && typeof attack[key] !== 'boolean') return false;
  if (attack.targetBodyV148 && (!record(attack.targetBodyV148) || Object.values(attack.targetBodyV148).some(value => !number(value, -5000, 10000)))) return false;
  return true;
}
function slotFor(protocol, wave, fighter, precedingCount) {
  const serial = Number(fighter.instanceIdV180?.slice(6)), index = serial - precedingCount - 1;
  if (!integer(index, 0, wave.total - 1)) return null;
  if (wave.enemySlotsV186) {
    const slot = wave.enemySlotsV186[index];
    return slot && fighter.spawnSlotV186 === index && fighter.enemyRankV186 === slot.rank
      && fighter.bossIdV186 === (slot.rank === 'boss' ? slot.fighterId : null)
      ? { ...slot, id: slot.fighterId } : null;
  }
  if (fighter.spawnSlotV186 !== undefined || fighter.enemyRankV186 !== undefined || fighter.bossIdV186 !== undefined) return null;
  return { id: wave.opponentIds[(index + wave.index) % wave.opponentIds.length], hp: wave.hp, damageScale: wave.damageScale };
}
function waveHealth(wave, count = wave.total) {
  return wave.enemySlotsV186 ? wave.enemySlotsV186.slice(0, count).reduce((sum, slot) => sum + slot.hp, 0) : count * wave.hp;
}

function validProjectiles(match) {
  if (!Array.isArray(match.projectiles) || match.projectiles.length > LIMITS.maxProjectiles) return false;
  for (const projectile of match.projectiles) {
    const owner = match.fighters.find(fighter => (fighter.instanceIdV180 || 'player') === projectile.ownerInstanceV180);
    const definition = getXenoTrialsFighterV96(owner?.id);
    const kind = projectile.superIdV148 ? 'super' : 'special';
    const spec = definition && getXenoTrialsAttackV147(definition, kind, XENO_TRIALS_ATTACKS_V96[kind]);
    const style = definition && getXenoTrialsSpecialStyleV147(definition);
    if (!owner || !spec || projectile.owner !== owner.side || !same(projectile.spec, spec) || projectile.power !== definition.power
      || !integer(projectile.id, 1, match.serial) || ![-1, 1].includes(projectile.direction)
      || !number(projectile.x, ARENA.left - 201, ARENA.right + 201) || !number(projectile.y, 0, 5000)) return false;
    if (projectile.signatureIdV147) {
      if (projectile.signatureIdV147 !== getXenoTrialsSignatureV147(definition)?.id
        || !['ground-wave', 'acid-cluster', 'aimed-acid'].includes(style)
        || projectile.style !== (style === 'ground-wave' ? 'ground-wave' : 'acid')
        || !integer(projectile.groupIdV147, 1, match.serial) || !number(projectile.life, 0, spec.reach / spec.projectileSpeed)
        || !number(projectile.vx, -spec.projectileSpeed, spec.projectileSpeed) || !number(projectile.vy, -spec.projectileSpeed, spec.projectileSpeed)
        || Math.abs(Math.hypot(projectile.vx, projectile.vy) - spec.projectileSpeed) > .00001
        || projectile.radiusV147 !== (projectile.style === 'ground-wave' ? spec.projectileHeight / 2 : 7)) return false;
    } else if (!['acid', 'pulse'].includes(style) || projectile.style !== style || !number(projectile.life, 0, 1.25)
      || projectile.vx !== undefined || projectile.vy !== undefined || projectile.radiusV147 !== undefined
      || projectile.groupIdV147 !== undefined) return false;
    if (kind === 'super' && projectile.superIdV148 !== getXenoTrialsSuperV148(definition)?.id) return false;
  }
  return new Set(match.projectiles.map(projectile => projectile.id)).size === match.projectiles.length;
}

function validAcid(match, protocol) {
  const ownerAllowed = owner => owner === 'player' ? hasXenoTrialsAcidPoolsV152(getXenoTrialsFighterV96(match.fighters[0].id))
    : owner === 'opponent' && protocol.waves.some(wave => wave.opponentIds.some(id => hasXenoTrialsAcidPoolsV152(getXenoTrialsFighterV96(id))));
  if (match.acidPoolsV152 !== undefined && (!Array.isArray(match.acidPoolsV152) || match.acidPoolsV152.length > ACID.maxPools)) return false;
  if (match.acidDropsV152 !== undefined && (!Array.isArray(match.acidDropsV152) || match.acidDropsV152.length > ACID.maxDrops)) return false;
  for (const pool of match.acidPoolsV152 || []) {
    if (!ownerAllowed(pool.owner) || !integer(pool.id, 1, match.serial) || !number(pool.x, ARENA.left, ARENA.right)
      || !integer(pool.bornTick, 0, match.tick) || pool.armedTick !== pool.bornTick + ACID.warmupTicks
      || pool.expiresTick !== pool.bornTick + ACID.lifetimeTicks || pool.expiresTick <= match.tick
      || pool.height !== ACID.height || pool.left !== Math.max(ARENA.left, pool.x - ACID.radius)
      || pool.right !== Math.min(ARENA.right, pool.x + ACID.radius) || typeof pool.superV148 !== 'boolean') return false;
  }
  for (const drop of match.acidDropsV152 || []) if (!ownerAllowed(drop.owner) || !integer(drop.id, 1, match.serial)
    || !integer(drop.bornTick, 0, match.tick) || !number(drop.x, ARENA.left, ARENA.right) || !number(drop.y, 0, 5000)
    || typeof drop.superV148 !== 'boolean') return false;
  return match.acidNextHitV152 === undefined || record(match.acidNextHitV152) && Object.entries(match.acidNextHitV152)
    .every(([key, value]) => ['player', 'opponent'].includes(key) && integer(value, 0, match.tick + ACID.intervalTicks));
}

function admitSnapshot(snapshot, ticket) {
  const raw = boundedClone(snapshot), operation = ticket?.activityV119?.branch === 'operations' && getXenoTrialsOperationV188(ticket.activityV119.id);
  const protocol = getXenoTrialsHordeProtocolV180(operation ? operation.hordeProtocolId : ticket?.activityV119?.id);
  const duration = operation?.roundSeconds || protocol?.roundSeconds;
  if (!raw || !protocol || !['horde', 'operations'].includes(ticket.activityV119.branch)
    || ticket.activityV119.branch === 'operations' && !operation || raw.result !== null || raw.grappleV153
    || typeof ticket.matchId !== 'string' || !/^[a-zA-Z0-9_-]{1,96}$/.test(ticket.matchId) || !integer(ticket.seed, 1, 0x7fffffff)
    || raw.version !== 96 || raw.round !== 1 || raw.roundWinner !== null || raw.roundReason !== null
    || !same(raw.wins, { player: 0, opponent: 0 }) || !['intro', 'active'].includes(raw.phase)
    || !['cpu', 'direct'].includes(raw.opponentInputSourceV163) || !integer(raw.tick, 0, (duration + 5) * 120)
    || !integer(raw.rng, 1, 0xffffffff) || !integer(raw.serial, 0, 1000000)
    || !number(raw.accumulator, 0, 1 / 120) || !number(raw.phaseTime, -1 / 120, 5)
    || typeof raw.paused !== 'boolean' || !number(raw.timeRemaining, .00000001, duration)) return null;
  const config = raw.config;
  if (!record(config) || !['matchId', 'seed', 'playerId', 'opponentId', 'factionId', 'stageId', 'difficulty'].every(key => config[key] === ticket[key])
    || config.activityV119?.branch !== ticket.activityV119.branch || config.activityV119.id !== ticket.activityV119.id
    || config.opponentId !== protocol.opponentIds[0]
    || !same(config.hordeV180, { protocolId: protocol.id }) || config.roundsToWin !== 1 || config.roundSeconds !== duration
    || config.stageId !== (operation?.stageId || protocol.stageId) || config.difficulty !== (operation?.difficulty || protocol.difficulty)
    || config.factionId !== (operation?.factionId || protocol.factionId)
    || !same(config.rulesV119, ticket.rulesV119) || !number(config.introSeconds, 0, 5) || typeof config.holdRoundTransition !== 'boolean') return null;
  for (const side of ['player', 'opponent']) if (config[`${side}Variant`] !== (ticket[`${side}Id`] === 'arachnoid' ? ticket[`${side}Variant`] : null)) return null;
  const elapsed = raw.tick / 120 - Math.min(raw.tick / 120, config.introSeconds);
  if (Math.abs(duration - raw.timeRemaining - elapsed) > .02) return null;
  if (operation) {
    if (!same(config.operationV188, { id: operation.id }) || raw.operationV188?.status !== 'active'
      || !validateXenoTrialsOperationSnapshotV188(raw.operationV188, ticket, raw)
      || !validateXenoTrialsStageHazardsV188(raw.stageHazardsV188, { stageId: config.stageId, seed: config.seed, tick: raw.tick })
      || raw.stageHazardsV188.startedTick !== 0
      || raw.stageHazardsV188.nextHits.some(row => row.actorId !== 'player'
        && Number(row.actorId.slice(6)) > raw.hordeV180?.serial)
      || raw.operationV188.elapsedTicks > 0 && Math.abs(raw.operationV188.startedTick - config.introSeconds * 120) > 1.01) return null;
  } else if (raw.operationV188 !== undefined || raw.stageHazardsV188 !== undefined || config.operationV188 !== undefined) return null;
  const horde = raw.hordeV180;
  if (!record(horde) || horde.schema !== 180 || horde.protocolId !== protocol.id
    || !integer(horde.wave, 1, protocol.waves.length) || !(operation ? ['active', 'intermission', 'complete'] : ['active', 'intermission']).includes(horde.phase)
    || horde.waveCount !== protocol.waves.length || horde.totalEnemies !== protocol.totalEnemies || horde.maxConcurrent !== LIMITS.maxConcurrent
    || !integer(horde.nextSpawnTick, 0, raw.tick + LIMITS.reinforcementTicks)
    || !integer(horde.nextWaveTick, 0, raw.tick + LIMITS.intermissionTicks)) return null;
  const wave = protocol.waves[horde.wave - 1], earlier = protocol.waves.slice(0, horde.wave - 1);
  const preceding = earlier.reduce((sum, item) => sum + item.total, 0);
  if (!Array.isArray(raw.fighters) || raw.fighters.length < 1 || raw.fighters.length > wave.concurrent + 1
    || !integer(horde.waveSpawned, wave.concurrent, wave.total) || horde.serial !== preceding + horde.waveSpawned
    || raw.serial < horde.serial
    || horde.waveKills !== horde.waveSpawned - raw.fighters.length + 1 || horde.totalKills !== preceding + horde.waveKills
    || horde.totalRemaining !== protocol.totalEnemies - horde.totalKills || horde.alive !== raw.fighters.length - 1
    || horde.remaining !== wave.total - horde.waveSpawned || horde.concurrent !== wave.concurrent
    || horde.wavesCleared !== (['intermission', 'complete'].includes(horde.phase) ? horde.wave : horde.wave - 1)
    || (horde.phase === 'complete' && (horde.wave !== horde.waveCount || horde.alive !== 0 || horde.remaining !== 0))
    || (horde.phase === 'intermission' && (horde.alive !== 0 || horde.waveKills !== wave.total
      || horde.wave === horde.waveCount || horde.nextWaveTick <= raw.tick))) return null;
  if (protocol.bossFinaleV186 ? !same(horde.bossFinaleV186, protocol.bossFinaleV186) : horde.bossFinaleV186 !== undefined) return null;
  const healthSpent = earlier.reduce((sum, item) => sum + waveHealth(item), 0) + waveHealth(wave, horde.waveSpawned)
    - raw.fighters.slice(1).reduce((sum, fighter) => sum + fighter.hp, 0);
  const playerDefinition = getXenoTrialsFighterV96(ticket.playerId), instanceIds = new Set();
  if (!playerDefinition || raw.fighters[0].id !== ticket.playerId) return null;
  for (const [index, fighter] of raw.fighters.entries()) {
    const definition = getXenoTrialsFighterV96(fighter.id), slot = index ? slotFor(protocol, wave, fighter, preceding) : null;
    if (!definition || fighter.side !== (index ? 'opponent' : 'player') || ![-1, 1].includes(fighter.facing)
      || fighter.variant !== (definition.variants.includes(index ? null : ticket.playerVariant) ? ticket.playerVariant : definition.variants[0] || null)
      || !number(fighter.hp, .00000001, index ? slot?.hp || 0 : definition.hp)
      || !number(fighter.stamina, 0, definition.stamina) || !number(fighter.x, ARENA.left, ARENA.right)
      || !number(fighter.y, 0, 5000) || !number(fighter.vy, -5000, 5000) || !number(fighter.stun, 0, 5)
      || !number(fighter.specialCooldown, 0, 60) || !number(fighter.hitFlash, 0, 1)
      || typeof fighter.guard !== 'boolean' || !controls(fighter.previousInput) || !controls(fighter.rearmControls)
      || !validStats(fighter.stats, raw.tick, index ? playerDefinition.hp : healthSpent) || !validAttack(fighter.attack, fighter, raw)) return null;
    if (fighter.superMeterV148 !== undefined && (!getXenoTrialsSuperV148(definition) || !number(fighter.superMeterV148, 0, 100)
      || fighter.superMeterV148 > Math.max(0, fighter.stats.damage * .6
        + ((index ? slot.hp : definition.hp) - fighter.hp) * .4 - (fighter.stats.supersV148 || 0) * 100) + .02)) return null;
    if (fighter.contactReadyTickV180 !== undefined && !integer(fighter.contactReadyTickV180, 0, raw.tick + LIMITS.playerContactCooldownTicks)) return null;
    if (index) {
      if (!slot || fighter.id !== slot.id || fighter.maxHpV180 !== slot.hp || fighter.damageScaleV180 !== slot.damageScale
        || !/^horde-\d+$/.test(fighter.instanceIdV180) || !integer(Number(fighter.instanceIdV180.slice(6)), preceding + 1, horde.serial)
        || instanceIds.has(fighter.instanceIdV180) || !integer(fighter.spawnTickV180, 0, raw.tick) || !validBrain(fighter.aiV180, raw.tick)) return null;
      instanceIds.add(fighter.instanceIdV180);
    }
  }
  if (!validStats(horde.opponentStats, raw.tick, playerDefinition.hp) || !validBrain(raw.ai, raw.tick)
    || !validProjectiles(raw) || !validAcid(raw, protocol)
    || !Array.isArray(raw.events) || raw.events.length > 32 || raw.events.some(event => !integer(event.id, 1, raw.serial)
      || !integer(event.tick, 0, raw.tick) || typeof event.type !== 'string' || ['match-end', 'round-end'].includes(event.type))) return null;
  const receivedDamage = horde.opponentStats.damage + raw.fighters.slice(1).reduce((sum, enemy) => sum + enemy.stats.damage, 0);
  if (receivedDamage + (operation ? raw.stageHazardsV188.playerDamage : 0) !== playerDefinition.hp - raw.fighters[0].hp) return null;
  if (raw.synthEffectsV110 !== undefined && (!Array.isArray(raw.synthEffectsV110) || raw.synthEffectsV110.length > LIMITS.maxEffects
    || raw.synthEffectsV110.some(effect => !number(effect.life, .00000001, 1) || !number(effect.x, ARENA.left - 500, ARENA.right + 500)
      || !number(effect.y, 0, 5000) || !number(effect.radius, 0, 1000)))) return null;
  const admitted = Object.fromEntries(coreKeys.filter(key => Object.hasOwn(raw, key)).map(key => [key, raw[key]]));
  admitted.paused = true; admitted.accumulator = 0;
  return admitted;
}

/** Validate against the current ticket, never a persisted claim about identity.
 * Terminal states cannot be manufactured by loading a checkpoint. */
export function createXenoTrialsHordeCheckpointV186(snapshot, ticketConfig) {
  const admitted = admitSnapshot(snapshot, ticketConfig);
  return admitted ? { schema: 186, matchId: ticketConfig.matchId, seed: ticketConfig.seed,
    protocolId: admitted.hordeV180.protocolId, tick: admitted.tick, snapshot: admitted } : null;
}
export function normalizeXenoTrialsHordeCheckpointV186(value, ticketConfig) {
  const operation = ticketConfig?.activityV119?.branch === 'operations' && getXenoTrialsOperationV188(ticketConfig.activityV119.id);
  if (!record(value) || value.schema !== 186 || value.matchId !== ticketConfig?.matchId || value.seed !== ticketConfig?.seed
    || value.protocolId !== (operation ? operation.hordeProtocolId : ticketConfig?.activityV119?.id) || value.tick !== value.snapshot?.tick) return null;
  return createXenoTrialsHordeCheckpointV186(value.snapshot, ticketConfig);
}

export function isXenoTrialsCheckpointForwardV186(previous, next) {
  if (!previous) return true;
  const a = previous.snapshot, b = next.snapshot;
  if (Boolean(a.operationV188) !== Boolean(b.operationV188)
    || a.operationV188 && (!isXenoTrialsOperationForwardV188(a.operationV188, b.operationV188)
      || !isXenoTrialsStageHazardsForwardV188(a.stageHazardsV188, b.stageHazardsV188))) return false;
  if (next.tick < previous.tick || b.hordeV180.wave < a.hordeV180.wave || b.hordeV180.totalKills < a.hordeV180.totalKills
    || b.hordeV180.serial < a.hordeV180.serial || b.fighters[0].hp > a.fighters[0].hp) return false;
  for (const key of statsKeys) if ((b.fighters[0].stats[key] || 0) < (a.fighters[0].stats[key] || 0)) return false;
  if (next.tick === previous.tick) {
    const comparable = snapshot => {
      const copy = JSON.parse(JSON.stringify(snapshot)); delete copy.paused; delete copy.accumulator;
      for (const fighter of copy.fighters) { delete fighter.previousInput; delete fighter.rearmControls; }
      return copy;
    };
    if (!same(comparable(a), comparable(b))) return false;
  }
  const priorIds = new Set(a.fighters.slice(1).map(enemy => enemy.instanceIdV180));
  for (const enemy of b.fighters.slice(1)) if (!priorIds.has(enemy.instanceIdV180)
    && (Number(enemy.instanceIdV180.slice(6)) <= a.hordeV180.serial || enemy.spawnTickV180 < a.tick)) return false;
  const removed = a.fighters.slice(1).filter(enemy => !b.fighters.some(fighter => fighter.instanceIdV180 === enemy.instanceIdV180)).length;
  if (b.hordeV180.totalKills - a.hordeV180.totalKills < removed) return false;
  return a.fighters.slice(1).every(enemy => {
    const current = b.fighters.find(fighter => fighter.instanceIdV180 === enemy.instanceIdV180);
    return !current || current.hp <= enemy.hp && statsKeys.every(key => (current.stats[key] || 0) >= (enemy.stats[key] || 0));
  });
}
