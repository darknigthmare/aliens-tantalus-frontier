import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
import { getXenoTrialsAttackV147, getXenoTrialsSignatureV147, getXenoTrialsSpecialStyleV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsSuperV148 } from './xeno-trials-supers-v148.js';
import { getXenoTrialsSuperV209, hasLegacyXenoTrialsSuperMeterV209, validXenoTrialsPhysicalSuperV209 } from './xeno-trials-super-kits-v209.js';
import { getXenoTrialsRiposteV208, validXenoTrialsRiposteAttackV208, XENO_TRIALS_RIPOSTE_KIND_V208 } from './xeno-trials-ripostes-v208.js';
import { XENO_TRIALS_AI_STATES_V119 } from './xeno-trials-ai-v119.js';
import { XENO_TRIALS_ARENA_V105 as ARENA, resolveXenoTrialsBodiesV105 } from './xeno-trials-geometry-v105.js';
import { XENO_TRIALS_ACID_POOL_V152 as ACID, hasXenoTrialsAcidPoolsV152 } from './xeno-trials-acid-pools-v152.js';
import { XENO_TRIALS_GRAPPLE_V153 as GRAPPLE, hasXenoTrialsGrappleV153, isXenoTrialsGrappleTargetV153 } from './xeno-trials-grapple-v153.js';
import { getXenoTrialsCasteV151 } from './xeno-trials-castes-v151.js';
import { normalizeXenoTrialsRulesV119 } from './xeno-trials-modes-v119.js';
import { XENO_TRIALS_MOVE_ATTACKS_V207, validXenoTrialsMovesetV207, xenoTrialsMovePoseV207 } from './xeno-trials-moveset-v207.js';
import { XENO_TRIALS_SIGNATURE_KINDS_V208, validXenoTrialsSignatureActionV208,
  validXenoTrialsSignatureEventV208 } from './xeno-trials-signature-kit-v208.js';
import { validXenoTrialsParryEventV208, validXenoTrialsParryStateV208, xenoTrialsParryStateV208 } from './xeno-trials-defense-v208.js';

const sides = ['player', 'opponent'];
const actions = ['left', 'right', 'jump', 'guard', 'light', 'heavy', 'special', 'super'];
const attacks = ['light', 'heavy', 'special', 'super', XENO_TRIALS_RIPOSTE_KIND_V208,
  ...XENO_TRIALS_MOVE_ATTACKS_V207, ...XENO_TRIALS_SIGNATURE_KINDS_V208];
const statKeys = ['hits', 'damage', 'blocks', 'specials', 'supersV148', 'acidTicksV152', 'grapplesV153', 'grappleTicksV153', 'grappleEscapesV153'];
const fighterKeys = new Set(['side', 'id', 'variant', 'x', 'y', 'vy', 'facing', 'hp', 'stamina', 'guard', 'stun', 'attack',
  'specialCooldown', 'hitFlash', 'previousInput', 'rearmControls', 'stats', 'superMeterV148', 'guardBrokenV147', 'deathBurstV151', 'movesetV207', 'parryV208']);
const eventTypes = ['attack', 'hit', 'block', 'guard-break', 'round-start', 'round-end', 'synth-detonation', 'xeno-detonation',
  'acid-contact-v152', 'grapple-start-v153', 'grapple-end-v153', 'burster-death-v151', 'evade-v207', 'parry-v208'];
const coreKeys = ['version', 'config', 'rng', 'accumulator', 'tick', 'round', 'opponentInputSourceV163', 'phase', 'phaseTime',
  'paused', 'timeRemaining', 'wins', 'roundWinner', 'roundReason', 'result', 'fighters', 'projectiles', 'events', 'serial', 'ai',
  'synthEffectsV110', 'acidDropsV152', 'acidPoolsV152', 'acidNextHitV152', 'grappleV153'];
const persistedBranches = ['on-demand', 'campaign', 'contracts', 'challenges'];
const defaultRules = Object.freeze(normalizeXenoTrialsRulesV119());
const maxTicks = 0x7fffffff;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const number = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
const integer = (value, min, max) => Number.isSafeInteger(value) && number(value, min, max);
const controls = value => record(value) && Object.keys(value).length === actions.length && actions.every(key => typeof value[key] === 'boolean');
const withinTicks = (a, b) => Math.abs(a - b) <= .009;
const inArena = x => number(x, ARENA.left, ARENA.right);
const face = value => value === -1 || value === 1;
const statsForward = (before, after) => record(after) && statKeys.every(key => integer(after[key] ?? 0, before[key] || 0, maxTicks * 16));
const same = (a, b) => a === b || a !== null && b !== null && typeof a === 'object' && typeof b === 'object'
  && Array.isArray(a) === Array.isArray(b) && Object.keys(a).length === Object.keys(b).length
  && Object.keys(a).every(key => Object.hasOwn(b, key) && same(a[key], b[key]));

function boundedClone(value) {
  let nodes = 0;
  function visit(item, depth) {
    if (++nodes > 5000 || depth > 16) return false;
    if (item === null || typeof item === 'boolean') return true;
    if (typeof item === 'string') return item.length <= 2048;
    if (typeof item === 'number') return Number.isFinite(item);
    if (!item || typeof item !== 'object') return false;
    if (Array.isArray(item) && item.length > 128) return false;
    return Object.keys(item).every(key => !['__proto__', 'constructor', 'prototype', 'toJSON'].includes(key)
      && visit(item[key], depth + 1));
  }
  try {
    if (!visit(value, 0)) return null;
    const text = JSON.stringify(value);
    return text.length <= 65536 ? JSON.parse(text) : null;
  } catch { return null; }
}

function validAttack(attack, definition, fighter, match) {
  if (attack === null) return true;
  if (!record(attack) || !attacks.includes(attack.kind) || !integer(attack.id, 1, match.serial)
    || !face(attack.facing) || typeof attack.hit !== 'boolean' || typeof attack.emitted !== 'boolean') return false;
  const spec = getXenoTrialsAttackV147(definition, attack.kind, XENO_TRIALS_ATTACKS_V96[attack.kind]);
  if (!spec || !number(attack.age, 0, spec.startup + spec.active + spec.recovery)
    || match.config.rulesV119.noSpecial && ['special', 'super', XENO_TRIALS_RIPOSTE_KIND_V208].includes(attack.kind)
    || !validXenoTrialsRiposteAttackV208(attack, fighter, match, getXenoTrialsRiposteV208(definition))) return false;
  if (XENO_TRIALS_SIGNATURE_KINDS_V208.includes(attack.kind) && (fighter.stats.specials < 1 || match.config.rulesV119.noSpecial
    || !validXenoTrialsSignatureActionV208(attack, spec))) return false;
  if (attack.kind === 'super') {
    const physicalSuper = getXenoTrialsSuperV209(definition);
    if (physicalSuper) return validXenoTrialsPhysicalSuperV209(attack, fighter, match, physicalSuper);
    if (!(fighter.stats.supersV148 > 0) || attack.targetBodyV148 === undefined) return false;
  }
  if (attack.targetBodyV148 !== undefined && (attack.kind !== 'super' || !record(attack.targetBodyV148)
    || !['left', 'right', 'top', 'bottom', 'pushTop', 'center', 'width', 'height']
      .every(key => number(attack.targetBodyV148[key], -5000, 10000)))) return false;
  return (attack.volleysV148 === undefined || integer(attack.volleysV148, 1, spec.volleyCount || 1))
    && (attack.flamePulse === undefined || integer(attack.flamePulse, 0, 100))
    && (attack.launchedV147 === undefined || typeof attack.launchedV147 === 'boolean');
}

function validFighter(fighter, side, definition, variant, hpLimit, otherLimit, match) {
  if (!record(fighter) || fighter.side !== side || fighter.id !== definition.id || fighter.variant !== variant
    || !Object.keys(fighter).every(key => fighterKeys.has(key))
    || !integer(fighter.hp, match.phase === 'active' ? 1 : 0, hpLimit) || !face(fighter.facing) || !inArena(fighter.x)
    || !number(fighter.y, 0, 5000) || !number(fighter.vy, -5000, 5000) || !number(fighter.stamina, 0, definition.stamina)
    || !number(fighter.stun, 0, 5) || !number(fighter.hitFlash, 0, 1) || !number(fighter.specialCooldown, 0, 60)
    || typeof fighter.guard !== 'boolean' || !controls(fighter.previousInput) || !controls(fighter.rearmControls)
    || !validXenoTrialsMovesetV207(fighter) || match.phase !== 'active' && xenoTrialsMovePoseV207(fighter)
    || !validXenoTrialsParryStateV208(match, fighter)
    || (fighter.deathBurstV151 !== undefined && (fighter.deathBurstV151 !== true || fighter.hp !== 0 || !getXenoTrialsCasteV151(definition)?.deathBurst))
    || (fighter.guardBrokenV147 !== undefined && typeof fighter.guardBrokenV147 !== 'boolean')) return false;
  const stats = fighter.stats;
  if (!record(stats) || !['hits', 'damage', 'blocks', 'specials'].every(key => Object.hasOwn(stats, key))
    || !Object.entries(stats).every(([key, value]) => statKeys.includes(key) && integer(value, 0, match.tick * 16))
    || stats.damage > otherLimit * match.round || stats.damage < stats.hits + (stats.acidTicksV152 || 0) + (stats.grappleTicksV153 || 0)
    || !validAttack(fighter.attack, definition, fighter, match)) return false;
  if (getXenoTrialsSuperV148(definition)) return number(fighter.superMeterV148, 0, 100)
    || hasLegacyXenoTrialsSuperMeterV209(fighter, definition);
  return fighter.superMeterV148 === undefined && stats.supersV148 === undefined;
}

function validProjectiles(match, definitions) {
  if (!Array.isArray(match.projectiles) || match.projectiles.length > 32) return false;
  const ids = new Set();
  for (const projectile of match.projectiles) {
    if (!record(projectile) || !integer(projectile.id, 1, match.serial) || ids.has(projectile.id)
      || !face(projectile.direction) || !number(projectile.x, ARENA.left - 200, ARENA.right + 200)
      || !number(projectile.y, 0, 5000) || !number(projectile.life, Number.EPSILON, 5)) return false;
    ids.add(projectile.id);
    const definition = definitions[sides.indexOf(projectile.owner)];
    if (!definition || projectile.power !== definition.power || match.config.rulesV119.noSpecial) return false;
    const special = getXenoTrialsAttackV147(definition, 'special', XENO_TRIALS_ATTACKS_V96.special);
    const admittedSuper = getXenoTrialsSuperV148(definition);
    const superMove = admittedSuper?.styleV209 ? null : admittedSuper;
    const style = getXenoTrialsSpecialStyleV147(definition);
    if (projectile.signatureIdV147 === undefined) {
      if (!['acid', 'pulse'].includes(style) || projectile.style !== style || projectile.life > 1.25
        || projectile.superIdV148 !== undefined || projectile.groupIdV147 !== undefined
        || projectile.vx !== undefined || projectile.vy !== undefined || projectile.radiusV147 !== undefined
        || !(same(projectile.spec, special) || superMove && same(projectile.spec, superMove.spec))) return false;
      continue;
    }
    const spec = projectile.superIdV148 === undefined ? special : superMove?.id === projectile.superIdV148 && superMove.spec;
    if (!spec || !same(projectile.spec, spec) || !['ground-wave', 'acid-cluster', 'aimed-acid'].includes(style)
      || projectile.signatureIdV147 !== getXenoTrialsSignatureV147(definition)?.id || !integer(projectile.groupIdV147, 1, match.serial)
      || projectile.style !== (style === 'ground-wave' ? 'ground-wave' : 'acid')
      || projectile.radiusV147 !== (style === 'ground-wave' ? spec.projectileHeight / 2 : 7)
      || !number(projectile.vx, -spec.projectileSpeed, spec.projectileSpeed)
      || !number(projectile.vy, -spec.projectileSpeed, spec.projectileSpeed)
      || Math.abs(Math.hypot(projectile.vx, projectile.vy) - spec.projectileSpeed) > .00001
      || projectile.life > spec.reach / spec.projectileSpeed) return false;
  }
  return true;
}

function validAcid(match, definitions) {
  const allowed = acid => record(acid) && hasXenoTrialsAcidPoolsV152(definitions[sides.indexOf(acid.owner)])
    && integer(acid.id, 1, match.serial) && inArena(acid.x) && integer(acid.bornTick, 0, match.tick)
    && typeof acid.superV148 === 'boolean';
  const pools = match.acidPoolsV152, drops = match.acidDropsV152, nextHit = match.acidNextHitV152;
  if (pools !== undefined && (!Array.isArray(pools) || pools.length > ACID.maxPools || !pools.every(pool => allowed(pool)
    && pool.left === Math.max(ARENA.left, pool.x - ACID.radius) && pool.right === Math.min(ARENA.right, pool.x + ACID.radius)
    && pool.height === ACID.height && pool.armedTick === pool.bornTick + ACID.warmupTicks
    && pool.expiresTick === pool.bornTick + ACID.lifetimeTicks && pool.expiresTick > match.tick))) return false;
  if (drops !== undefined && (!Array.isArray(drops) || drops.length > ACID.maxDrops
    || !drops.every(drop => allowed(drop) && number(drop.y, Number.EPSILON, 5000)))) return false;
  return nextHit === undefined || record(nextHit) && Object.entries(nextHit)
    .every(([key, value]) => sides.includes(key) && integer(value, 0, match.tick + ACID.intervalTicks));
}

function validGrapple(match, definitions) {
  const hold = match.grappleV153;
  if (hold === undefined) return true;
  if (!record(hold) || !sides.includes(hold.attacker) || !sides.includes(hold.target) || hold.attacker === hold.target) return false;
  const attacker = sides.indexOf(hold.attacker), target = sides.indexOf(hold.target);
  return match.phase === 'active' && !match.config.rulesV119.noSpecial && hasXenoTrialsGrappleV153(definitions[attacker])
    && isXenoTrialsGrappleTargetV153(definitions[target]) && match.fighters[attacker].stats.grapplesV153 > 0
    && match.fighters.every(fighter => fighter.attack === null && !fighter.guard) && match.fighters[target].y === 0
    && integer(hold.id, 1, match.serial) && integer(hold.bornTick, 1, match.tick)
    && hold.expiresTick === hold.bornTick + GRAPPLE.durationTicks && hold.expiresTick > match.tick
    && integer(hold.nextDamageTick, match.tick + 1, hold.expiresTick + GRAPPLE.damageIntervalTicks)
    && (hold.nextDamageTick - hold.bornTick - GRAPPLE.firstDamageTick) % GRAPPLE.damageIntervalTicks === 0
    && integer(hold.escapeProgress, 0, Math.min(GRAPPLE.escapeTicks - 1, match.tick - hold.bornTick))
    && inArena(hold.attackerX) && inArena(hold.targetX);
}

function validClockAndScore(match, limits) {
  const { wins, phase, phaseTime, timeRemaining, round, roundWinner, roundReason, tick, events, config } = match;
  if (!record(wins) || Object.keys(wins).length !== 2 || !sides.every(side => integer(wins[side], 0, 1))
    || wins.player + wins.opponent > round - (phase === 'active' ? 1 : 0)
    || !integer(round, 1, phase === 'active' ? 5 : 4) || tick < round - 1
    || !number(timeRemaining, 0, config.roundSeconds)) return false;
  const start = round === 1 ? 0 : events.findLast(event => event.type === 'round-start' && event.round === round)?.tick;
  const end = phase === 'round-over' ? events.at(-1) : null;
  if (Number.isInteger(start) && !withinTicks(Math.min(config.roundSeconds, ((end?.tick ?? tick) - start) / 120),
    config.roundSeconds - timeRemaining)) return false;
  if (phase === 'active') return phaseTime === 0 && timeRemaining > 0 && roundWinner === null && roundReason === null;
  const [a, b] = match.fighters;
  const defeated = Number(a.hp === 0) + Number(b.hp === 0);
  const ratioA = a.hp / limits[0], ratioB = b.hp / limits[1];
  const winner = roundReason === 'time' && config.rulesV119.goal === 'survive' && a.hp > 0 ? 'player'
    : Math.abs(ratioA - ratioB) < .00001 ? 'draw' : ratioA > ratioB ? 'player' : 'opponent';
  const reason = defeated === 2 ? 'double-ko' : defeated === 1 ? 'ko' : timeRemaining === 0 ? 'time' : null;
  return reason !== null && roundReason === reason && roundWinner === winner && (winner === 'draw' || wins[winner] === 1)
    && end?.type === 'round-end' && end.winner === winner && end.round === round && end.reason === reason
    && withinTicks(phaseTime, 1.8 - (tick - end.tick) / 120)
    && match.projectiles.length === 0 && match.fighters.every(fighter => fighter.attack === null && !fighter.guard)
    && ['acidDropsV152', 'acidPoolsV152', 'acidNextHitV152'].every(key => match[key] === undefined);
}

function validBrain(brain, tick, serial) {
  return record(brain) && brain.schema === 119 && XENO_TRIALS_AI_STATES_V119.includes(brain.state)
    && number(brain.stateTime, 0, tick / 120 + 1) && number(brain.decisionIn, 0, 1)
    && number(brain.guardRemaining, 0, 1) && controls(brain.input) && integer(brain.decisions, 0, tick)
    && (brain.lastAttackId === null || integer(brain.lastAttackId, 1, serial)) && record(brain.stateVisits)
    && Object.entries(brain.stateVisits).every(([key, value]) => XENO_TRIALS_AI_STATES_V119.includes(key) && integer(value, 1, tick + 1));
}

export function isXenoTrialsDuelTicketV197(ticket) {
  return record(ticket) && !ticket.hordeV180 && !ticket.operationV188
    && (!ticket.activityV119 || persistedBranches.includes(ticket.activityV119.branch));
}

function fromRoundSpawn(fighters, hpLimits) {
  const spawns = fighters.map((fighter, i) => ({ id: fighter.id, variant: fighter.variant,
    x: i ? 690 : 310, y: 0, facing: i ? -1 : 1 }));
  resolveXenoTrialsBodiesV105(spawns[0], spawns[1], 1);
  return fighters.every((fighter, i) => {
    const definition = getXenoTrialsFighterV96(fighter.id);
    return fighter.x === spawns[i].x && fighter.facing === spawns[i].facing && fighter.y === 0 && fighter.vy === 0
      && fighter.hp === hpLimits[i] && fighter.stamina === definition.stamina && fighter.stun === 0 && fighter.hitFlash === 0
      && !fighter.guard && fighter.specialCooldown === 0 && fighter.attack === null;
  });
}

/** Admit raw engine state for the current ticket and park it before input. */
export function createXenoTrialsDuelCheckpointV197(snapshot, ticket) {
  if (!isXenoTrialsDuelTicketV197(ticket) || !/^xt96-[1-9]\d*$/.test(ticket.matchId)
    || !integer(ticket.seed, 1, 0x7fffffff)) return null;
  const raw = boundedClone(snapshot), config = raw?.config;
  if (!record(raw) || !record(config) || raw.version !== 96 || raw.result !== null || raw.opponentInputSourceV163 !== 'cpu'
    || !['active', 'round-over'].includes(raw.phase) || !integer(raw.tick, 0, maxTicks) || !integer(raw.serial, 0, raw.tick * 32)
    || !integer(raw.rng, 1, 0xffffffff) || typeof raw.paused !== 'boolean' || !number(raw.accumulator, 0, 1 / 120)
    || ['hordeV180', 'operationV188', 'stageHazardsV188'].some(key => raw[key] !== undefined || config[key] !== undefined)
    || !['matchId', 'seed', 'playerId', 'opponentId', 'factionId', 'stageId', 'difficulty', 'roundSeconds', 'roundsToWin']
      .every(key => config[key] === ticket[key]) || config.roundsToWin !== 2 || config.introSeconds !== 0 || config.holdRoundTransition !== true
    || !record(config.rulesV119) || !same(config.rulesV119, ticket.rulesV119 ?? defaultRules)
    || !same(config.activityV119, ticket.activityV119)) return null;
  const definitions = sides.map(side => getXenoTrialsFighterV96(ticket[`${side}Id`]));
  if (definitions.some(definition => !definition)) return null;
  const variants = definitions.map((definition, i) => definition.variants.includes(ticket[`${sides[i]}Variant`])
    ? ticket[`${sides[i]}Variant`] : definition.variants[0] || null);
  const limits = definitions.map(definition => config.rulesV119.initialHp === 1 ? 1 : definition.hp);
  if (!Array.isArray(raw.fighters) || raw.fighters.length !== 2 || !sides.every((side, i) => config[`${side}Variant`] === variants[i]
    && validFighter(raw.fighters[i], side, definitions[i], variants[i], limits[i], limits[1 - i], raw))) return null;
  if (!Array.isArray(raw.events) || raw.events.length > 32 || !raw.events.every((event, i) => record(event)
    && eventTypes.includes(event.type) && integer(event.id, (raw.events[i - 1]?.id || 0) + 1, raw.serial)
    && integer(event.tick, raw.events[i - 1]?.tick || 0, raw.tick)
    && validXenoTrialsSignatureEventV208(event, id => definitions[sides.indexOf(event.side)]?.id === id)
    && (event.type !== 'parry-v208' || validXenoTrialsParryEventV208(raw, event)))) return null;
  if (!validProjectiles(raw, definitions) || !validClockAndScore(raw, limits) || !validBrain(raw.ai, raw.tick, raw.serial)
    || !validAcid(raw, definitions) || !validGrapple(raw, definitions)) return null;
  if (raw.tick === 0 && (raw.rng !== ticket.seed || !fromRoundSpawn(raw.fighters, limits))) return null;
  if (!raw.fighters.every((fighter, i) => {
    const opponent = raw.fighters[1 - i];
    const hpLost = limits[1 - i] - opponent.hp;
    const selfDetonation = opponent.hp === 0 && getXenoTrialsSpecialStyleV147(definitions[1 - i]) === 'detonation';
    return fighter.stats.damage <= (raw.round - 1) * limits[1 - i] + hpLost
      && (raw.round > 1 || selfDetonation || fighter.stats.damage === hpLost);
  })) return null;
  if (raw.synthEffectsV110 !== undefined && (!Array.isArray(raw.synthEffectsV110) || raw.synthEffectsV110.length > 2
    || !raw.synthEffectsV110.every(effect => record(effect) && ['detonation', 'acid-death-v151'].includes(effect.kind)
      && number(effect.x, ARENA.left - 500, ARENA.right + 500)
      && number(effect.y, 0, 5000) && number(effect.radius, 0, 1000) && number(effect.life, Number.EPSILON, .4)))) return null;
  const state = Object.fromEntries(coreKeys.filter(key => Object.hasOwn(raw, key)).map(key => [key, raw[key]]));
  state.paused = true;
  state.accumulator = 0;
  return { schema: 197, matchId: ticket.matchId, seed: ticket.seed, tick: state.tick, snapshot: state };
}

export function normalizeXenoTrialsDuelCheckpointV197(value, ticket) {
  if (!record(value) || value.schema !== 197 || value.matchId !== ticket?.matchId
    || value.seed !== ticket?.seed || value.tick !== value.snapshot?.tick) return null;
  return createXenoTrialsDuelCheckpointV197(value.snapshot, ticket);
}

export function isXenoTrialsDuelCheckpointForwardV197(previous, next) {
  if (!previous) return true;
  const a = previous.snapshot, b = next.snapshot;
  if (next.tick < previous.tick || b.round < a.round || b.serial < a.serial
    || !sides.every(side => b.wins[side] >= a.wins[side])
    || !a.fighters.every((fighter, i) => statsForward(fighter.stats, b.fighters[i].stats))) return false;
  if (a.round === b.round && (b.timeRemaining > a.timeRemaining || a.phase === 'round-over' && b.phase !== a.phase
    || a.fighters.some((fighter, i) => b.fighters[i].hp > fighter.hp))) return false;
  if (a.round === b.round && a.phase === 'active') {
    const endTick = b.phase === 'round-over' ? b.events.at(-1).tick : b.tick;
    if (!withinTicks(a.timeRemaining - b.timeRemaining, Math.min(a.timeRemaining, (endTick - a.tick) / 120))) return false;
  }
  if (a.round === b.round && !b.fighters.every((fighter, i) => {
    const other = b.fighters[1 - i];
    const lost = a.fighters[1 - i].hp - other.hp;
    const gained = fighter.stats.damage - a.fighters[i].stats.damage;
    return gained === lost || gained < lost && other.hp === 0
      && getXenoTrialsSpecialStyleV147(getXenoTrialsFighterV96(other.id)) === 'detonation';
  })) return false;
  if (next.tick !== previous.tick) return true;
  // Next-round can commit between fixed steps. Its only same-tick successor
  // comes from the round-over transition and carries the recorded score.
  if (a.phase === 'round-over' && b.phase === 'active' && b.round === a.round + 1) {
    const roundStart = { id: a.serial + 1, tick: a.tick, type: 'round-start', round: b.round };
    const hpLimits = b.fighters.map(fighter => b.config.rulesV119.initialHp || getXenoTrialsFighterV96(fighter.id).hp);
    return b.serial === roundStart.id && same(a.wins, b.wins) && same(b.events, [...a.events, roundStart].slice(-32))
      && b.rng === a.rng && b.projectiles.length === 0 && b.ai.decisions === 0 && fromRoundSpawn(b.fighters, hpLimits)
      && a.fighters.every((fighter, i) => same(fighter.stats, b.fighters[i].stats) && fighter.superMeterV148 === b.fighters[i].superMeterV148);
  }
  const compare = snapshot => ({ ...snapshot,
    fighters: snapshot.fighters.map(({ previousInput, rearmControls, movesetV207, parryV208, ...fighter }) => ({
      ...fighter, movesetV207: xenoTrialsMovePoseV207({ movesetV207 }),
      parryV208: xenoTrialsParryStateV208({ parryV208 }) })) });
  return same(compare(a), compare(b));
}

export function isXenoTrialsDuelResultForwardV197(checkpoint, result) {
  if (!checkpoint) return true;
  const before = checkpoint.snapshot;
  return Boolean(result && result.durationTicks >= before.tick && result.rounds >= before.round
    && sides.every((side, i) => result.wins?.[side] >= before.wins[side]
      && statsForward(before.fighters[i].stats, result[`${side}Stats`])));
}
