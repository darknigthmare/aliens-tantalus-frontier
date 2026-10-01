import { getXenoTrialsFighterV96, XENO_TRIALS_FACTIONS_V96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';
import { getSynthTrialAttackV110, synthConeHitsV110 } from './synth-combat-v110.js';
import { XENO_TRIALS_ARENA_V105, getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105,
  resolveXenoTrialsBodiesV105 } from './xeno-trials-geometry-v105.js';

export const XENO_TRIALS_STEP_V96 = 1 / 120;
// Margins reserve the full native silhouettes (including tails) in either facing.
export const XENO_TRIALS_ARENA_V96 = XENO_TRIALS_ARENA_V105;
export const XENO_TRIALS_ATTACKS_V96 = Object.freeze({
  light: Object.freeze({ cost: 12, damage: 14, reach: 60, startup: .09, active: .08, recovery: .2, stun: .13, push: 15 }),
  heavy: Object.freeze({ cost: 25, damage: 28, reach: 86, startup: .23, active: .1, recovery: .39, stun: .3, push: 38 }),
  special: Object.freeze({ cost: 38, damage: 35, reach: 124, startup: .29, active: .12, recovery: .55, stun: .36, push: 48 })
});
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const ACTIONS = ['left', 'right', 'jump', 'guard', 'light', 'heavy', 'special'];
const emptyInput = () => Object.fromEntries(ACTIONS.map(key => [key, false]));
const input = value => Object.fromEntries(ACTIONS.map(key => [key, value?.[key] === true]));
function rng(match) {
  let value = match.rng | 0; value ^= value << 13; value ^= value >>> 17; value ^= value << 5;
  match.rng = value >>> 0; return match.rng / 4294967296;
}
function makeFighter(side, id, variant) {
  const definition = getXenoTrialsFighterV96(id);
  return { side, id, variant: definition.variants.includes(variant) ? variant : definition.variants[0] || null,
    x: side === 'player' ? 310 : 690, y: 0, vy: 0, facing: side === 'player' ? 1 : -1,
    hp: definition.hp, stamina: definition.stamina, guard: false, stun: 0, attack: null, specialCooldown: 0,
    hitFlash: 0, previousInput: emptyInput(), rearmControls: emptyInput(), stats: { hits: 0, damage: 0, blocks: 0, specials: 0 } };
}

/** Pure local match state. No clock, DOM, randomness source or save side effects. */
export function createXenoTrialsMatchV96(config = {}) {
  const playerId = getXenoTrialsFighterV96(config.playerId)?.id || 'warrior';
  const opponentId = getXenoTrialsFighterV96(config.opponentId)?.id || 'arachnoid';
  const seed = (Math.trunc(finite(config.seed, 1969)) >>> 0) || 1969;
  const playerVariants = getXenoTrialsFighterV96(playerId).variants, opponentVariants = getXenoTrialsFighterV96(opponentId).variants;
  const normalized = { playerId, opponentId,
    playerVariant: playerVariants.includes(config.playerVariant) ? config.playerVariant : playerVariants[0] || null,
    opponentVariant: opponentVariants.includes(config.opponentVariant) ? config.opponentVariant : opponentVariants[0] || null,
    factionId: XENO_TRIALS_FACTIONS_V96.find(entry => entry.id === config.factionId)?.id || 'hive',
    stageId: XENO_TRIALS_STAGES_V96.find(entry => entry.id === config.stageId)?.id || 'containment-deck',
    difficulty: ['easy', 'normal', 'hard'].includes(config.difficulty) ? config.difficulty : 'normal',
    roundsToWin: clamp(Math.trunc(finite(config.roundsToWin, 2)), 1, 3), roundSeconds: clamp(finite(config.roundSeconds, 99), 15, 180), seed,
    introSeconds: clamp(finite(config.introSeconds, .8), 0, 5),
    holdRoundTransition: config.holdRoundTransition === true,
    matchId: typeof config.matchId === 'string' && /^[a-zA-Z0-9_-]{1,96}$/.test(config.matchId) ? config.matchId : `trial-${seed}` };
  return { version: 96, config: normalized, rng: seed, accumulator: 0, tick: 0, round: 1,
    phase: normalized.introSeconds > 0 ? 'intro' : 'active', phaseTime: normalized.introSeconds, paused: false, timeRemaining: normalized.roundSeconds,
    wins: { player: 0, opponent: 0 }, roundWinner: null, roundReason: null, result: null,
    fighters: [makeFighter('player', playerId, config.playerVariant), makeFighter('opponent', opponentId, config.opponentVariant)],
    projectiles: [], events: [], serial: 0, ai: { decisionIn: 0, input: emptyInput() } };
}
function event(match, type, extra = {}) {
  match.events.push({ id: ++match.serial, tick: match.tick, type, ...extra });
  if (match.events.length > 32) match.events.shift();
}
function finishRound(match, reason) {
  const [a, b] = match.fighters;
  const ratioA = a.hp / getXenoTrialsFighterV96(a.id).hp;
  const ratioB = b.hp / getXenoTrialsFighterV96(b.id).hp;
  const winner = Math.abs(ratioA - ratioB) < .00001 ? 'draw' : ratioA > ratioB ? 'player' : 'opponent';
  match.roundWinner = winner; match.roundReason = reason;
  if (winner !== 'draw') match.wins[winner]++;
  event(match, 'round-end', { winner, reason, round: match.round });
  for (const fighter of match.fighters) { fighter.attack = null; fighter.guard = false; }
  match.projectiles = [];
  const terminal = match.wins.player >= match.config.roundsToWin || match.wins.opponent >= match.config.roundsToWin || match.round >= match.config.roundsToWin * 2 + 1;
  if (!terminal) { match.phase = 'round-over'; match.phaseTime = 1.8; return; }
  const finalWinner = match.wins.player === match.wins.opponent ? 'draw' : match.wins.player > match.wins.opponent ? 'player' : 'opponent';
  match.phase = 'match-over'; match.phaseTime = 0;
  match.result = { version: 96, completed: true, matchId: match.config.matchId, seed: match.config.seed, winner: finalWinner,
    reason, rounds: match.round, wins: { ...match.wins }, playerId: a.id, opponentId: b.id,
    playerVariant: a.variant, opponentVariant: b.variant, factionId: match.config.factionId,
    stageId: match.config.stageId, difficulty: match.config.difficulty,
    playerStats: { ...a.stats }, opponentStats: { ...b.stats }, durationTicks: match.tick };
  event(match, 'match-end', { winner: finalWinner });
}
export function nextXenoTrialsRoundV96(match) {
  if (!match || match.phase !== 'round-over') return false;
  const stats = match.fighters.map(f => f.stats);
  match.fighters = [makeFighter('player', match.config.playerId, match.config.playerVariant), makeFighter('opponent', match.config.opponentId, match.config.opponentVariant)];
  match.fighters.forEach((f, i) => { f.stats = stats[i]; });
  match.round++; match.phase = match.config.introSeconds > 0 ? 'intro' : 'active'; match.phaseTime = match.config.introSeconds; match.timeRemaining = match.config.roundSeconds;
  match.roundWinner = null; match.roundReason = null; match.projectiles = []; match.ai = { decisionIn: 0, input: emptyInput() };
  event(match, 'round-start', { round: match.round }); return true;
}
export function setXenoTrialsPausedV96(match, paused) {
  if (!match || match.phase === 'match-over') return false;
  if (paused === true) for (const fighter of match.fighters) fighter.rearmControls = { ...fighter.previousInput };
  match.paused = paused === true; match.accumulator = 0; return true;
}
function aiInput(match, dt) {
  const [player, cpu] = match.fighters;
  match.ai.decisionIn -= dt;
  if (match.ai.decisionIn > 0) return match.ai.input;
  const difficulty = match.config.difficulty;
  match.ai.decisionIn = difficulty === 'easy' ? .38 : difficulty === 'hard' ? .14 : .24;
  const doctrine = XENO_TRIALS_FACTIONS_V96.find(f => f.id === match.config.factionId).doctrine;
  const direction = player.x > cpu.x ? 1 : -1, distance = getXenoTrialsBodyGapV105(cpu, player, direction);
  const rangeUser = ['acid', 'pulse'].includes(getXenoTrialsFighterV96(cpu.id).special);
  const cpuBody = getXenoTrialsBodyBoundsV105(cpu), playerBody = getXenoTrialsBodyBoundsV105(player);
  const shotY = cpu.y + cpuBody.height * .55;
  const rangedLane = shotY >= playerBody.bottom && shotY <= playerBody.top;
  // A tall shooter must approach a low creature instead of waiting forever above its hitbox.
  // Projectiles keep their fixed trajectory, so jumping can still evade them.
  const target = doctrine === 'range' && rangeUser && rangedLane ? 240 : 20;
  const next = emptyInput();
  if (distance > target + 20) next[direction > 0 ? 'right' : 'left'] = true;
  else if (distance < target - 45 && doctrine === 'range') next[direction > 0 ? 'left' : 'right'] = true;
  if (player.attack && distance < 230 && cpu.y === 0 && rng(match) < (doctrine === 'guard' ? .85 : difficulty === 'easy' ? .25 : .6)) next.guard = true;
  if (!next.guard && distance < (rangeUser ? 650 : 215) && rng(match) > (difficulty === 'easy' ? .35 : .1)) {
    const roll = rng(match);
    const action = roll < .3 && cpu.stamina >= 38 && cpu.specialCooldown <= 0 ? 'special' : roll < .58 ? 'heavy' : 'light';
    // Alternate the press/release phases; held keys never retrigger attacks.
    if (!match.ai.input[action]) next[action] = true;
  }
  if (doctrine === 'rush' && distance > 180 && rng(match) < .17) next.jump = true;
  match.ai.input = next; return next;
}
function fighterStep(match, fighter, enemy, controls, dt) {
  const definition = getXenoTrialsFighterV96(fighter.id);
  controls = { ...controls };
  for (const action of ACTIONS) {
    if (!controls[action]) fighter.rearmControls[action] = false;
    if (fighter.rearmControls[action]) controls[action] = false;
  }
  fighter.stun = Math.max(0, fighter.stun - dt); fighter.hitFlash = Math.max(0, fighter.hitFlash - dt);
  fighter.specialCooldown = Math.max(0, fighter.specialCooldown - dt);
  if (fighter.y > 0 || fighter.vy > 0) {
    fighter.vy -= 1450 * dt; fighter.y = Math.max(0, fighter.y + fighter.vy * dt);
    if (fighter.y === 0) fighter.vy = 0;
  }
  if (!fighter.attack && !fighter.guard && fighter.stun <= 0) fighter.facing = enemy.x >= fighter.x ? 1 : -1;
  fighter.guard = controls.guard && fighter.stun <= 0 && !fighter.attack && fighter.y === 0 && fighter.stamina > 1;
  if (fighter.guard) fighter.stamina = Math.max(0, fighter.stamina - dt * 5);
  else if (!fighter.attack && fighter.stun <= 0) fighter.stamina = Math.min(definition.stamina, fighter.stamina + dt * 24);
  if (fighter.stun <= 0 && !fighter.attack && !fighter.guard) {
    const axis = Number(controls.right) - Number(controls.left);
    fighter.x += axis * definition.speed * dt;
    if (controls.jump && !fighter.previousInput.jump && fighter.y === 0) { fighter.vy = definition.jump; fighter.y = .001; }
    for (const action of ['special', 'heavy', 'light']) {
      const spec = getSynthTrialAttackV110(definition, action, XENO_TRIALS_ATTACKS_V96[action]);
      if (!controls[action] || fighter.previousInput[action] || fighter.stamina < spec.cost || (action === 'special' && fighter.specialCooldown > 0)) continue;
      fighter.attack = { kind: action, age: 0, hit: false, emitted: false, facing: fighter.facing, id: ++match.serial };
      fighter.stamina -= spec.cost;
      if (action === 'special') { fighter.specialCooldown = 1.6; fighter.stats.specials++; }
      event(match, 'attack', { side: fighter.side, kind: action }); break;
    }
  }
  if (fighter.attack) {
    const attack = fighter.attack, spec = getSynthTrialAttackV110(definition, attack.kind, XENO_TRIALS_ATTACKS_V96[attack.kind]);
    attack.age += dt;
    if (attack.kind === 'special' && ['ram', 'pounce'].includes(definition.special) && attack.age >= spec.startup && attack.age < spec.startup + spec.active)
      fighter.x += attack.facing * 420 * dt;
    if (attack.kind === 'special' && definition.special === 'detonation' && attack.age >= spec.startup && attack.age < spec.startup + spec.chargeDuration)
      fighter.x += attack.facing * 410 * dt;
    if (attack.age >= spec.startup + spec.active + spec.recovery) fighter.attack = null;
  }
  fighter.x = clamp(fighter.x, XENO_TRIALS_ARENA_V96.left, XENO_TRIALS_ARENA_V96.right);
  fighter.previousInput = controls;
}
function collectAttack(match, fighter, enemy, impacts) {
  const attack = fighter.attack;
  if (!attack) return;
  const definition = getXenoTrialsFighterV96(fighter.id);
  const spec = getSynthTrialAttackV110(definition, attack.kind, XENO_TRIALS_ATTACKS_V96[attack.kind]);
  if (attack.age < spec.startup || attack.age >= spec.startup + spec.active || attack.hit) return;
  if (attack.kind === 'special' && definition.special === 'flame') {
    const pulse = Math.floor((attack.age - spec.startup) / spec.interval);
    if (attack.flamePulse === pulse) return;
    attack.flamePulse = pulse;
    const body = getXenoTrialsBodyBoundsV105(fighter), other = getXenoTrialsBodyBoundsV105(enemy);
    const face = attack.facing > 0 ? body.right : body.left;
    if (synthConeHitsV110(face, fighter.y + body.height * .55, attack.facing, spec.reach, other))
      impacts.push({ from: fighter, to: enemy, spec, power: definition.power, direction: attack.facing });
    return;
  }
  if (attack.kind === 'special' && definition.special === 'detonation') {
    if (attack.age < spec.startup + spec.chargeDuration) return;
    attack.hit = true;
    const body = getXenoTrialsBodyBoundsV105(fighter), other = getXenoTrialsBodyBoundsV105(enemy);
    const y = fighter.y + body.height * .5;
    const nearestX = clamp(fighter.x, other.left, other.right), nearestY = clamp(y, other.bottom, other.top);
    if (Math.hypot(nearestX - fighter.x, nearestY - y) <= spec.reach)
      impacts.push({ from: fighter, to: enemy, spec, power: definition.power, direction: enemy.x >= fighter.x ? 1 : -1 });
    // The detonation consumes this robot even on a miss. Its windup can be interrupted.
    fighter.hp = 0;
    (match.synthEffectsV110 ||= []).push({ kind: 'detonation', x: fighter.x, y, radius: spec.reach, life: .4 });
    event(match, 'synth-detonation', { side: fighter.side });
    return;
  }
  if (attack.kind === 'special' && ['acid', 'pulse'].includes(definition.special)) {
    if (!attack.emitted) {
      attack.emitted = true;
      const body = getXenoTrialsBodyBoundsV105(fighter);
      match.projectiles.push({ id: attack.id, owner: fighter.side, x: (attack.facing > 0 ? body.right : body.left) + attack.facing * 9,
        y: fighter.y + body.height * .55, direction: attack.facing, life: 1.25, spec, power: definition.power, style: definition.special });
    }
    return;
  }
  const body = getXenoTrialsBodyBoundsV105(fighter), other = getXenoTrialsBodyBoundsV105(enemy);
  const horizontal = getXenoTrialsBodyGapV105(fighter, enemy, attack.facing);
  const verticalOverlap = body.bottom <= other.top && other.bottom <= body.top;
  if ((other.center - body.center) * attack.facing < 0 || horizontal > spec.reach * definition.reach || !verticalOverlap) return;
  attack.hit = true; impacts.push({ from: fighter, to: enemy, spec, power: definition.power, direction: attack.facing });
}
function applyImpact(match, impact) {
  const { from, to, spec, power, direction } = impact;
  const frontal = to.facing === -direction;
  const shield = to.id === 'synth-containment';
  const shieldBash = shield && to.attack?.kind === 'special';
  const guarding = to.guard || shieldBash;
  const guardCost = spec.damage * .82 * (to.id === 'defender' ? .75 : shield ? .65 : 1);
  const guarded = guarding && frontal && to.stamina >= guardCost;
  const guardBreak = guarding && frontal && !guarded;
  const multiplier = guarded ? (to.id === 'defender' ? .03 : shield ? .04 : .08) : 1;
  const damage = Math.min(to.hp, Math.max(1, Math.round(spec.damage * power * multiplier)));
  to.hp = Math.max(0, to.hp - damage); to.hitFlash = .13;
  from.stats.hits++; from.stats.damage += damage;
  if (guarded) { to.stamina -= guardCost; to.stats.blocks++; }
  else { to.stun = guardBreak ? .72 : spec.stun; to.guard = false; to.attack = null; if (guardBreak) to.stamina = 0; }
  to.x = clamp(to.x + direction * spec.push * (guarded ? .25 : 1), XENO_TRIALS_ARENA_V96.left, XENO_TRIALS_ARENA_V96.right);
  event(match, guardBreak ? 'guard-break' : guarded ? 'block' : 'hit', { side: to.side, attacker: from.side, damage });
}
function fixedStep(match, playerControls, opponentControls, dt) {
  match.tick++;
  if (match.synthEffectsV110) match.synthEffectsV110 = match.synthEffectsV110.map(effect => ({ ...effect, life: effect.life - dt })).filter(effect => effect.life > 0);
  if (match.phase !== 'active') {
    // Presentation and inter-round buttons cannot buffer an opening attack.
    match.fighters[0].rearmControls = { ...playerControls };
    match.fighters[1].rearmControls = { ...(opponentControls || emptyInput()) };
    if (match.phase === 'intro' || match.phase === 'round-over') {
      match.phaseTime -= dt;
      if (match.phaseTime <= 0) {
        if (match.phase === 'intro') { match.phase = 'active'; event(match, 'fight', { round: match.round }); }
        else if (!match.config.holdRoundTransition) nextXenoTrialsRoundV96(match);
      }
    }
    return;
  }
  const [a, b] = match.fighters;
  const order = a.x <= b.x ? 1 : -1;
  fighterStep(match, a, b, playerControls, dt);
  fighterStep(match, b, a, opponentControls || aiInput(match, dt), dt);
  resolveXenoTrialsBodiesV105(a, b, order);
  const impactOrder = a.x <= b.x ? 1 : -1;
  const impacts = [];
  // Capture both hit windows before applying damage: simultaneous KOs are legal.
  collectAttack(match, a, b, impacts); collectAttack(match, b, a, impacts);
  for (const projectile of match.projectiles) {
    const previous = projectile.x;
    projectile.x += projectile.direction * 560 * dt; projectile.life -= dt;
    const target = projectile.owner === 'player' ? b : a, owner = projectile.owner === 'player' ? a : b;
    const body = getXenoTrialsBodyBoundsV105(target);
    if (Math.max(previous, projectile.x) >= body.left - 9 && Math.min(previous, projectile.x) <= body.right + 9 && projectile.y >= body.bottom && projectile.y <= body.top) {
      impacts.push({ from: owner, to: target, spec: projectile.spec, power: projectile.power, direction: projectile.direction }); projectile.life = 0;
    }
  }
  match.projectiles = match.projectiles.filter(p => p.life > 0 && p.x > 0 && p.x < XENO_TRIALS_ARENA_V96.width);
  for (const impact of impacts) applyImpact(match, impact);
  resolveXenoTrialsBodiesV105(a, b, impactOrder);
  match.timeRemaining = Math.max(0, match.timeRemaining - dt);
  if (a.hp <= 0 || b.hp <= 0) finishRound(match, a.hp <= 0 && b.hp <= 0 ? 'double-ko' : 'ko');
  else if (match.timeRemaining <= 0) finishRound(match, 'time');
}

/** dt is in seconds; one call accepts at most 250ms, discarding stall debt.
 * Browser blur pauses independently. Null opponent input selects deterministic AI. */
export function stepXenoTrialsMatchV96(match, dt, playerInput = {}, opponentInput = null) {
  if (!match || match.paused || match.phase === 'match-over' || !Number.isFinite(dt) || dt <= 0) return match;
  match.accumulator += Math.min(dt, .25);
  const a = input(playerInput), b = opponentInput === null ? null : input(opponentInput);
  while (match.accumulator + 1e-10 >= XENO_TRIALS_STEP_V96) {
    match.accumulator = Math.max(0, match.accumulator - XENO_TRIALS_STEP_V96);
    fixedStep(match, a, b, XENO_TRIALS_STEP_V96);
    if (match.phase === 'match-over') { match.accumulator = 0; break; }
  }
  return match;
}
export function getXenoTrialsSnapshotV96(match) {
  if (!match) return null;
  return JSON.parse(JSON.stringify(match));
}
