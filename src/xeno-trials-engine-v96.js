import { XENO_TRIALS_GRAPPLE_V153, hasXenoTrialsGrappleV153, isXenoTrialsGrappleTargetV153, canXenoTrialsGrappleV153, isXenoTrialsGrappledV153, startXenoTrialsGrappleV153, stepXenoTrialsGrappleV153, releaseXenoTrialsGrappleV153, clearXenoTrialsGrappleV153 } from './xeno-trials-grapple-v153.js';
import { depositXenoTrialsAcidV152, stepXenoTrialsAcidV152, clearXenoTrialsAcidV152 } from './xeno-trials-acid-pools-v152.js';
import { getXenoTrialsCasteV151, collectXenoTrialsDeathBurstsV151 } from './xeno-trials-castes-v151.js';
import { getXenoTrialsSuperV148, getXenoTrialsSuperMeterV148, getXenoTrialsSuperReadinessV148, awardXenoTrialsContactMeterV148 } from './xeno-trials-supers-v148.js';
import { getXenoTrialsAttackV147, getXenoTrialsSpecialStyleV147, getXenoTrialsSignatureV147,
  createXenoTrialsSignatureProjectilesV147, xenoTrialsSegmentContactV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsFighterV96, XENO_TRIALS_FACTIONS_V96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';
import { synthConeHitsV110 } from './synth-combat-v110.js';
import { XENO_TRIALS_ARENA_V105, getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105,
  resolveXenoTrialsBodiesV105 } from './xeno-trials-geometry-v105.js';
import { createXenoTrialsBrainV119, stepXenoTrialsBrainV119 } from './xeno-trials-ai-v119.js';
import { normalizeXenoTrialsRulesV119 } from './xeno-trials-modes-v119.js';
import { XENO_TRIALS_HORDE_LIMITS_V180 as HORDE_LIMITS, getXenoTrialsHordeProtocolV180,
  createXenoTrialsHordeStateV180, advanceXenoTrialsHordeDirectorV180 } from './xeno-trials-horde-v180.js';
import { getXenoTrialsHordeSlotV186, getXenoTrialsHordeBossViewV186 } from './xeno-trials-horde-bosses-v186.js';
import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';
export { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';

export const XENO_TRIALS_STEP_V96 = 1 / 120;
// Margins reserve the full native silhouettes (including tails) in either facing.
export const XENO_TRIALS_ARENA_V96 = XENO_TRIALS_ARENA_V105;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const ACTIONS = ['left', 'right', 'jump', 'guard', 'light', 'heavy', 'special', 'super'];
const emptyInput = () => Object.fromEntries(ACTIONS.map(key => [key, false]));
const input = value => Object.fromEntries(ACTIONS.map(key => [key, value?.[key] === true]));
// Preserve both physically held and already masked inputs across scene gates.
const releaseGate = fighter => Object.fromEntries(ACTIONS.map(key => [key,
  fighter.rearmControls?.[key] === true || fighter.previousInput?.[key] === true]));
function rng(match) {
  let value = match.rng | 0; value ^= value << 13; value ^= value >>> 17; value ^= value << 5;
  match.rng = value >>> 0; return match.rng / 4294967296;
}
function makeFighter(side, id, variant) {
  const definition = getXenoTrialsFighterV96(id);
  return { side, id, variant: definition.variants.includes(variant) ? variant : definition.variants[0] || null,
    x: side === 'player' ? 310 : 690, y: 0, vy: 0, facing: side === 'player' ? 1 : -1,
    hp: definition.hp, stamina: definition.stamina, guard: false, stun: 0, attack: null, specialCooldown: 0,
    ...(getXenoTrialsSuperV148(definition) ? { superMeterV148: 0 } : {}),
    hitFlash: 0, previousInput: emptyInput(), rearmControls: emptyInput(), stats: { hits: 0, damage: 0, blocks: 0, specials: 0 } };
}

/** Pure local match state. No clock, DOM, randomness source or save side effects. */
export function createXenoTrialsMatchV96(config = {}) {
  const hordeProtocol = getXenoTrialsHordeProtocolV180(config.activityV119?.branch === 'horde'
    ? config.activityV119.id : config.hordeV180?.protocolId);
  const playerId = getXenoTrialsFighterV96(config.playerId)?.id || 'warrior';
  const opponentId = hordeProtocol?.opponentIds[0] || getXenoTrialsFighterV96(config.opponentId)?.id || 'arachnoid';
  const seed = (Math.trunc(finite(config.seed, 1969)) >>> 0) || 1969;
  const rulesV119 = normalizeXenoTrialsRulesV119(hordeProtocol ? hordeProtocol.rules : config.rulesV119);
  const playerVariants = getXenoTrialsFighterV96(playerId).variants, opponentVariants = getXenoTrialsFighterV96(opponentId).variants;
  const normalized = { playerId, opponentId,
    playerVariant: playerVariants.includes(config.playerVariant) ? config.playerVariant : playerVariants[0] || null,
    opponentVariant: opponentVariants.includes(config.opponentVariant) ? config.opponentVariant : opponentVariants[0] || null,
    factionId: XENO_TRIALS_FACTIONS_V96.find(entry => entry.id === config.factionId)?.id || 'hive',
    stageId: XENO_TRIALS_STAGES_V96.find(entry => entry.id === config.stageId)?.id || 'containment-deck',
    difficulty: ['easy', 'normal', 'hard'].includes(config.difficulty) ? config.difficulty : 'normal',
    roundsToWin: hordeProtocol ? 1 : clamp(Math.trunc(finite(config.roundsToWin, 2)), 1, 3), roundSeconds: hordeProtocol?.roundSeconds || rulesV119.timeLimitSeconds || clamp(finite(config.roundSeconds, 99), 15, 180), seed,
    rulesV119,
    ...(hordeProtocol ? { hordeV180: { protocolId: hordeProtocol.id } } : {}),
    ...(config.activityV119 && ['campaign', 'contracts', 'challenges', 'on-demand', 'horde'].includes(config.activityV119.branch)
      && typeof config.activityV119.id === 'string' ? { activityV119: { branch: config.activityV119.branch,
        id: config.activityV119.id.slice(0, 64), ...(config.activityV119.branch === 'on-demand' ? { rules: rulesV119 } : {}) } } : {}),
    introSeconds: clamp(finite(config.introSeconds, .8), 0, 5),
    holdRoundTransition: config.holdRoundTransition === true,
    matchId: typeof config.matchId === 'string' && /^[a-zA-Z0-9_-]{1,96}$/.test(config.matchId) ? config.matchId : `trial-${seed}` };
  const match = { version: 96, config: normalized, rng: seed, accumulator: 0, tick: 0, round: 1,
    opponentInputSourceV163: 'cpu',
    phase: normalized.introSeconds > 0 ? 'intro' : 'active', phaseTime: normalized.introSeconds, paused: false, timeRemaining: normalized.roundSeconds,
    wins: { player: 0, opponent: 0 }, roundWinner: null, roundReason: null, result: null,
    fighters: [makeFighter('player', playerId, config.playerVariant), makeFighter('opponent', opponentId, config.opponentVariant)],
    projectiles: [], events: [], serial: 0, ai: createXenoTrialsBrainV119() };
  if (rulesV119.initialHp === 1) match.fighters.forEach(fighter => { fighter.hp = 1; });
  if (hordeProtocol) {
    match.config.stageId = hordeProtocol.stageId; match.config.difficulty = hordeProtocol.difficulty; match.config.factionId = hordeProtocol.factionId;
    match.hordeV180 = createXenoTrialsHordeStateV180(hordeProtocol.id);
    match.fighters = [match.fighters[0]]; match.fighters[0].x = 500;
    advanceXenoTrialsHordeDirectorV180(match, (id, wave, serial, slot) => makeHordeFighterV180(match, id, wave, serial, slot));
  } else resolveXenoTrialsBodiesV105(match.fighters[0], match.fighters[1], 1);
  return match;
}
function event(match, type, extra = {}) {
  match.events.push({ id: ++match.serial, tick: match.tick, type, ...extra });
  if (match.events.length > 32) match.events.shift();
}
function finishRound(match, reason) {
  clearXenoTrialsGrappleV153(match);
  const [a, b] = match.fighters;
  const hpLimit = match.config.rulesV119?.initialHp;
  const ratioA = a.hp / (hpLimit || getXenoTrialsFighterV96(a.id).hp);
  const ratioB = b.hp / (hpLimit || getXenoTrialsFighterV96(b.id).hp);
  const winner = reason === 'time' && match.config.rulesV119?.goal === 'survive' && a.hp > 0 ? 'player'
    : Math.abs(ratioA - ratioB) < .00001 ? 'draw' : ratioA > ratioB ? 'player' : 'opponent';
  match.roundWinner = winner; match.roundReason = reason;
  if (winner !== 'draw') match.wins[winner]++;
  event(match, 'round-end', { winner, reason, round: match.round });
  for (const fighter of match.fighters) {
    fighter.attack = null; fighter.guard = false;
    fighter.rearmControls = releaseGate(fighter);
  }
  match.projectiles = []; clearXenoTrialsAcidV152(match);
  const terminal = match.wins.player >= match.config.roundsToWin || match.wins.opponent >= match.config.roundsToWin || match.round >= match.config.roundsToWin * 2 + 1;
  if (!terminal) { match.phase = 'round-over'; match.phaseTime = 1.8; return; }
  const finalWinner = match.wins.player === match.wins.opponent ? 'draw' : match.wins.player > match.wins.opponent ? 'player' : 'opponent';
  match.phase = 'match-over'; match.phaseTime = 0;
  match.result = { version: 96, completed: true, matchId: match.config.matchId, seed: match.config.seed, winner: finalWinner,
    reason, rounds: match.round, wins: { ...match.wins }, playerId: a.id, opponentId: b.id,
    playerVariant: a.variant, opponentVariant: b.variant, factionId: match.config.factionId,
    stageId: match.config.stageId, difficulty: match.config.difficulty,
    rulesV119: { ...match.config.rulesV119 }, ...(match.config.activityV119 ? { activityV119: { ...match.config.activityV119 } } : {}),
    playerStats: { ...a.stats }, opponentStats: { ...b.stats }, durationTicks: match.tick };
  event(match, 'match-end', { winner: finalWinner });
}
export function nextXenoTrialsRoundV96(match) {
  if (!match || match.hordeV180 || match.paused || match.phase !== 'round-over') return false;
  clearXenoTrialsAcidV152(match); clearXenoTrialsGrappleV153(match);
  const stats = match.fighters.map(f => f.stats), meters = match.fighters.map(getXenoTrialsSuperMeterV148);
  const rearm = match.fighters.map(f => input(f.rearmControls));
  match.fighters = [makeFighter('player', match.config.playerId, match.config.playerVariant), makeFighter('opponent', match.config.opponentId, match.config.opponentVariant)];
  match.fighters.forEach((f, i) => {
    f.stats = stats[i]; f.rearmControls = rearm[i];
    if (getXenoTrialsSuperV148(getXenoTrialsFighterV96(f.id))) f.superMeterV148 = meters[i];
  });
  if (match.config.rulesV119?.initialHp === 1) match.fighters.forEach(f => { f.hp = 1; });
  resolveXenoTrialsBodiesV105(match.fighters[0], match.fighters[1], 1);
  match.round++; match.phase = match.config.introSeconds > 0 ? 'intro' : 'active'; match.phaseTime = match.config.introSeconds; match.timeRemaining = match.config.roundSeconds;
  match.roundWinner = null; match.roundReason = null; match.projectiles = []; match.synthEffectsV110 = []; match.ai = createXenoTrialsBrainV119();
  event(match, 'round-start', { round: match.round }); return true;
}
export function setXenoTrialsPausedV96(match, paused) {
  if (!match || match.phase === 'match-over') return false;
  if (paused === true) for (const fighter of match.fighters) {
    // Physical releases belong to caller-controlled actors. The native CPU
    // cannot release a keyboard: its continuous guard must survive a pause.
    if (fighter.side === 'player' || match.opponentInputSourceV163 === 'direct')
      fighter.rearmControls = releaseGate(fighter);
  }
  // Missing markers are legacy native-CPU matches. Also remove a gate written
  // by an older pause without changing the CPU's real input/decision state.
  if (match.opponentInputSourceV163 !== 'direct') {
    for (const cpu of match.fighters.filter(fighter => fighter.side === 'opponent')) cpu.rearmControls = emptyInput();
  }
  match.paused = paused === true; match.accumulator = 0; return true;
}
/** Account for source releases during a blocked presentation without advancing
 * the simulation. Only edge/rearm flags are changed, never pose/HP/resources. */
export function releaseXenoTrialsControlsV150(match, side, controls = {}) {
  if (!match || match.phase === 'match-over' || !['player', 'opponent'].includes(side)) return false;
  const fighter = match.fighters.find(f => f.side === side);
  if (!fighter) return false;
  for (const action of ACTIONS) if (controls[action] !== true) {
    fighter.rearmControls[action] = false;
    fighter.previousInput[action] = false;
  }
  return true;
}
function aiInput(match, dt) {
  return stepXenoTrialsBrainV119(match, dt, XENO_TRIALS_ATTACKS_V96, () => rng(match));
}
function fighterStep(match, fighter, enemy, controls, dt) {
  const definition = getXenoTrialsFighterV96(fighter.id), style = getXenoTrialsSpecialStyleV147(definition);
  controls = { ...controls };
  const rules = match.config.rulesV119;
  const specialLocked = rules?.noSpecial || match.config.roundSeconds - match.timeRemaining < (rules?.specialLockSeconds || 0);
  for (const action of ACTIONS) {
    // Observe the physical release before masking a restricted action. Holding
    // special through its timer must not trigger it when the restriction ends.
    if (!controls[action]) fighter.rearmControls[action] = false;
    if (['special', 'super'].includes(action) && specialLocked && controls[action]) fighter.rearmControls[action] = true;
    if (fighter.rearmControls[action]) controls[action] = false;
  }
  fighter.stun = Math.max(0, fighter.stun - dt);
  if (fighter.stun === 0) fighter.guardBrokenV147 = false; fighter.hitFlash = Math.max(0, fighter.hitFlash - dt);
  fighter.specialCooldown = Math.max(0, fighter.specialCooldown - dt);
  if (fighter.y > 0 || fighter.vy > 0) {
    fighter.vy -= 1450 * dt; fighter.y = Math.max(0, fighter.y + fighter.vy * dt);
    if (fighter.y === 0) fighter.vy = 0;
  }
  if (isXenoTrialsGrappledV153(match, fighter)) {
    fighter.guard = false; fighter.attack = null; fighter.previousInput = controls; return;
  }
  if (!fighter.attack && !fighter.guard && fighter.stun <= 0) fighter.facing = enemy.x >= fighter.x ? 1 : -1;
  fighter.guard = controls.guard && fighter.stun <= 0 && !fighter.attack && fighter.y === 0 && fighter.stamina > 1;
  if (fighter.guard) fighter.stamina = Math.max(0, fighter.stamina - dt * 5);
  else if (!fighter.attack && fighter.stun <= 0) fighter.stamina = Math.min(definition.stamina, fighter.stamina + dt * 24);
  if (fighter.stun <= 0 && !fighter.attack && !fighter.guard) {
    const axis = Number(controls.right) - Number(controls.left);
    fighter.x += axis * definition.speed * dt;
    if (controls.jump && !fighter.previousInput.jump && fighter.y === 0) { fighter.vy = definition.jump; fighter.y = .001; }
    for (const action of ['super', 'special', 'heavy', 'light']) {
      const spec = getXenoTrialsAttackV147(definition, action, XENO_TRIALS_ATTACKS_V96[action]);
      if (!spec || !controls[action] || fighter.previousInput[action] || spec.groundedOnly && fighter.y > 0 || fighter.stamina < spec.cost || (['special', 'super'].includes(action) && fighter.specialCooldown > 0)
        || action === 'super' && !getXenoTrialsSuperReadinessV148(match, fighter, definition).ready) continue;
      fighter.attack = { kind: action, age: 0, hit: false, emitted: false, facing: fighter.facing, id: ++match.serial };
      fighter.stamina -= spec.cost;
      if (action === 'super') {
        fighter.superMeterV148 = 0; fighter.specialCooldown = spec.cooldown;
        fighter.stats.supersV148 = (fighter.stats.supersV148 || 0) + 1;
        fighter.attack.targetBodyV148 = { ...getXenoTrialsBodyBoundsV105(enemy) };
      }
      if (action === 'special') { fighter.specialCooldown = spec.cooldown || 1.6; fighter.stats.specials++; }
      event(match, 'attack', { side: fighter.side, kind: action,
        ...(action === 'super' ? { superIdV148: getXenoTrialsSuperV148(definition).id } : {}),
        ...(action === 'special' && getXenoTrialsSignatureV147(definition) ? { signatureIdV147: getXenoTrialsSignatureV147(definition).id } : {}) }); break;
    }
  }
  if (fighter.attack) {
    const attack = fighter.attack, spec = getXenoTrialsAttackV147(definition, attack.kind, XENO_TRIALS_ATTACKS_V96[attack.kind]);
    attack.age += dt;
    if (['special', 'super'].includes(attack.kind) && ['ram', 'pounce'].includes(style) && attack.age >= spec.startup && attack.age < spec.startup + spec.active)
      fighter.x += attack.facing * 420 * dt;
    if (['special', 'super'].includes(attack.kind) && style === 'detonation' && attack.age >= spec.startup && attack.age < spec.startup + spec.chargeDuration)
      fighter.x += attack.facing * (spec.chargeSpeed || 410) * dt;
    if (['special', 'super'].includes(attack.kind) && style === 'leap' && attack.age >= spec.startup && attack.age < spec.startup + spec.active) {
      if (!attack.launchedV147) { attack.launchedV147 = true; fighter.vy = spec.leapImpulse; fighter.y = .001; }
      fighter.x += attack.facing * spec.leapSpeed * dt;
    }
    if (attack.age >= spec.startup + spec.active + spec.recovery) fighter.attack = null;
  }
  fighter.x = clamp(fighter.x, XENO_TRIALS_ARENA_V96.left, XENO_TRIALS_ARENA_V96.right);
  fighter.previousInput = controls;
}
function collectAttack(match, fighter, enemy, impacts) {
  const attack = fighter.attack;
  if (!attack) return;
  const definition = getXenoTrialsFighterV96(fighter.id), style = getXenoTrialsSpecialStyleV147(definition);
  const spec = getXenoTrialsAttackV147(definition, attack.kind, XENO_TRIALS_ATTACKS_V96[attack.kind]);
  const hordeTarget = match.hordeV180 ? enemy.instanceIdV180 || enemy.side : null;
  if (attack.age < spec.startup || attack.age >= spec.startup + spec.active
    || (match.hordeV180 ? attack.hitTargetsV180?.includes(hordeTarget) : attack.hit)) return;
  if (['special', 'super'].includes(attack.kind) && ['ground-wave', 'acid-cluster', 'aimed-acid'].includes(style)) {
    const count = spec.volleyCount || 1, interval = spec.volleyInterval || 1;
    const due = Math.min(count, 1 + Math.floor((attack.age - spec.startup + 1e-9) / interval));
    while ((attack.volleysV148 || 0) < due) {
      const volley = attack.volleysV148 || 0;
      const group = attack.kind === 'super' ? ++match.serial : attack.id;
      const projectiles = createXenoTrialsSignatureProjectilesV147({ ...getXenoTrialsSignatureV147(definition), spec }, fighter,
        getXenoTrialsBodyBoundsV105(fighter), attack.targetBodyV148 || getXenoTrialsBodyBoundsV105(enemy), { ...attack, id: group });
      for (const projectile of projectiles) match.projectiles.push({ ...projectile, id: ++match.serial, power: definition.power,
        ...(attack.kind === 'super' ? { superIdV148: getXenoTrialsSuperV148(definition).id, volleyV148: volley } : {}) });
      attack.volleysV148 = volley + 1; attack.emitted = true;
    }
    return;
  }
  if (['special', 'super'].includes(attack.kind) && style === 'flame') {
    const pulse = Math.floor((attack.age - spec.startup) / spec.interval);
    if (match.hordeV180) {
      if (attack.flamePulse !== pulse) { attack.flamePulse = pulse; attack.flameTargetsV180 = []; }
      if (attack.flameTargetsV180.includes(hordeTarget)) return;
      attack.flameTargetsV180.push(hordeTarget);
    } else {
      if (attack.flamePulse === pulse) return;
      attack.flamePulse = pulse;
    }
    const body = getXenoTrialsBodyBoundsV105(fighter), other = getXenoTrialsBodyBoundsV105(enemy);
    const face = attack.facing > 0 ? body.right : body.left;
    if (synthConeHitsV110(face, fighter.y + body.height * .55, attack.facing, spec.reach, other))
      impacts.push({ from: fighter, to: enemy, spec, power: definition.power, direction: attack.facing });
    return;
  }
  if (['special', 'super'].includes(attack.kind) && style === 'detonation') {
    if (attack.age < spec.startup + spec.chargeDuration) return;
    attack.hit = true;
    if (match.hordeV180) (attack.hitTargetsV180 ||= []).push(hordeTarget);
    const body = getXenoTrialsBodyBoundsV105(fighter), other = getXenoTrialsBodyBoundsV105(enemy);
    const y = fighter.y + body.height * .5;
    const nearestX = clamp(fighter.x, other.left, other.right), nearestY = clamp(y, other.bottom, other.top);
    if (Math.hypot(nearestX - fighter.x, nearestY - y) <= spec.reach)
      impacts.push({ from: fighter, to: enemy, spec, power: definition.power, direction: enemy.x >= fighter.x ? 1 : -1 });
    // The detonation consumes the attacker even on a miss. Its windup can be interrupted.
    fighter.hp = 0;
    if (!match.hordeV180 || !attack.detonationEmittedV180) {
      if (match.hordeV180) attack.detonationEmittedV180 = true;
      (match.synthEffectsV110 ||= []).push({ kind: 'detonation', x: fighter.x, y, radius: spec.reach, life: .4 });
      event(match, definition.family === 'synthetic' ? 'synth-detonation' : 'xeno-detonation', { side: fighter.side });
    }
    return;
  }
  if (['special', 'super'].includes(attack.kind) && ['acid', 'pulse'].includes(style)) {
    if (!attack.emitted) {
      attack.emitted = true;
      const body = getXenoTrialsBodyBoundsV105(fighter);
      match.projectiles.push({ id: attack.id, owner: fighter.side, x: (attack.facing > 0 ? body.right : body.left) + attack.facing * 9,
        y: fighter.y + body.height * .55, direction: attack.facing, life: 1.25, spec, power: definition.power, style });
    }
    return;
  }
  const body = getXenoTrialsBodyBoundsV105(fighter), other = getXenoTrialsBodyBoundsV105(enemy);
  const horizontal = getXenoTrialsBodyGapV105(fighter, enemy, attack.facing);
  const hitTop = spec.contactHeightRatioV151 ? body.bottom + body.height * spec.contactHeightRatioV151 : body.top;
  const verticalOverlap = body.bottom <= other.top && other.bottom <= hitTop;
  if ((other.center - body.center) * attack.facing < 0 || horizontal > spec.reach * definition.reach || !verticalOverlap) return;
  // Only an admitted human restraint changes the leap contact distance.
  // Other anatomies retain V151's ordinary hit, never a fake grab at range.
  const wantsGrappleV153 = !match.hordeV180 && attack.kind === 'special' && hasXenoTrialsGrappleV153(definition)
    && isXenoTrialsGrappleTargetV153(getXenoTrialsFighterV96(enemy.id)) && enemy.y === 0 && enemy.vy === 0;
  if (wantsGrappleV153 && horizontal > XENO_TRIALS_GRAPPLE_V153.contactGap) return;
  const grappleCandidateV153 = wantsGrappleV153 && canXenoTrialsGrappleV153(fighter, enemy, definition, getXenoTrialsFighterV96(enemy.id), getXenoTrialsBodyBoundsV105);
  attack.hit = true; if (match.hordeV180) (attack.hitTargetsV180 ||= []).push(hordeTarget);
  impacts.push({ from: fighter, to: enemy, spec, power: definition.power, direction: attack.facing,
    ...(grappleCandidateV153 ? { grappleCandidateV153: attack.id } : {}) });
}
function applyImpact(match, impact) {
  let { from, to, spec, power, direction } = impact;
  if (match.hordeV180 && from.side === 'opponent') {
    if (to.side === 'opponent' || match.tick < (from.spawnTickV180 || 0) + HORDE_LIMITS.spawnGraceTicks
      || match.tick < (to.contactReadyTickV180 || 0)) return;
    power *= from.damageScaleV180 || .3;
    // A crowd contact cannot hold the player in an eight-body stun chain.
    spec = { ...spec, stun: Math.min(spec.stun || 0, .11), push: Math.min(spec.push || 0, 16) };
    to.contactReadyTickV180 = match.tick + HORDE_LIMITS.playerContactCooldownTicks;
  }
  if (to.hp <= 0) return; // Resolved overkill cannot count as another hit or earn meter.
  const frontal = to.facing === -direction;
  const shield = to.id === 'synth-containment';
  const shieldBash = shield && to.attack?.kind === 'special';
  const guarding = !spec.unblockableV151 && (to.guard || shieldBash);
  const guardCost = spec.damage * .82 * (to.id === 'defender' ? .75 : shield ? .65 : 1);
  const guarded = guarding && frontal && to.stamina >= guardCost;
  const guardBreak = guarding && frontal && !guarded;
  const multiplier = guarded ? (to.id === 'defender' ? .03 : shield ? .04 : .08) : 1;
  const damage = Math.min(to.hp, Math.max(1, Math.round(spec.damage * power * multiplier)));
  to.hp = Math.max(0, to.hp - damage); to.hitFlash = .13;
  if (spec.continuousV153) from.stats.grappleTicksV153 = (from.stats.grappleTicksV153 || 0) + 1;
  else if (spec.continuousV152) from.stats.acidTicksV152 = (from.stats.acidTicksV152 || 0) + 1;
  else from.stats.hits++;
  from.stats.damage += damage;
  awardXenoTrialsContactMeterV148(from, to, damage, guarded, spec.superV148 === true);
  if (spec.continuousV152 || spec.continuousV153) { /* Exposure must not stun-lock an escape or cancel an accepted action. */ }
  else if (guarded) { to.stamina -= guardCost; to.stats.blocks++; }
  else { to.stun = guardBreak ? .72 : spec.stun; to.guardBrokenV147 = guardBreak; to.guard = false; to.attack = null; if (guardBreak) to.stamina = 0; }
  const capture = !guarded && impact.grappleCandidateV153 && from.hp > 0 && from.stun <= 0 && to.hp > 0;
  if (!capture) to.x = clamp(to.x + direction * spec.push * (guarded ? .25 : 1), XENO_TRIALS_ARENA_V96.left, XENO_TRIALS_ARENA_V96.right);
  if (match.grappleV153 && (to.side === match.grappleV153.attacker || to.hp <= 0))
    releaseXenoTrialsGrappleV153(match, 'interrupted', (type, details) => event(match, type, details));
  if (capture) startXenoTrialsGrappleV153(match, from, to, impact.grappleCandidateV153, (type, details) => event(match, type, details));
  event(match, guardBreak ? 'guard-break' : guarded ? 'block' : 'hit', { side: to.side, attacker: from.side, damage,
    ...(match.hordeV180 ? { targetInstanceV180: to.instanceIdV180 || 'player', attackerInstanceV180: from.instanceIdV180 || 'player' } : {}) });
}

function makeHordeFighterV180(match, id, wave, serial, slotIndex) {
  const fighter = makeFighter('opponent', id);
  const player = match.fighters[0], direction = serial % 2 ? 1 : -1;
  const distance = 260 + rng(match) * 380;
  fighter.x = clamp(player.x + direction * distance, XENO_TRIALS_ARENA_V96.left + 100, XENO_TRIALS_ARENA_V96.right - 100);
  // At a boundary, place reinforcements on the open side rather than on top
  // of the player. The visible grace period still applies to every spawn.
  if (Math.abs(fighter.x - player.x) < 200)
    fighter.x = clamp(player.x - direction * distance, XENO_TRIALS_ARENA_V96.left + 80, XENO_TRIALS_ARENA_V96.right - 80);
  fighter.facing = player.x >= fighter.x ? 1 : -1;
  const slot = getXenoTrialsHordeSlotV186(wave, slotIndex);
  fighter.hp = slot?.hp ?? wave.hp; fighter.maxHpV180 = fighter.hp; fighter.instanceIdV180 = `horde-${serial}`;
  fighter.spawnTickV180 = match.tick; fighter.damageScaleV180 = slot?.damageScale ?? wave.damageScale;
  if (slot) {
    fighter.spawnSlotV186 = slotIndex; fighter.enemyRankV186 = slot.rank;
    fighter.bossIdV186 = slot.rank === 'boss' ? id : null;
    if (slot.rank === 'boss') {
      // Reserve a real approach lane for the native large body. No scaling or
      // collider override is introduced to make the boss fit in a troop slot.
      const own = getXenoTrialsBodyBoundsV105(fighter), target = getXenoTrialsBodyBoundsV105(player);
      const right = fighter.x >= player.x;
      const gap = right ? own.left - target.right : target.left - own.right;
      if (gap < 180) fighter.x = clamp(fighter.x + (right ? 180 - gap : gap - 180), XENO_TRIALS_ARENA_V96.left, XENO_TRIALS_ARENA_V96.right);
    }
  }
  fighter.aiV180 = createXenoTrialsBrainV119();
  event(match, 'horde-spawn-v180', { instanceId: fighter.instanceIdV180, fighterId: id, x: fighter.x, hp: fighter.hp });
  if (slot?.rank === 'boss') event(match, 'horde-boss-spawn-v186', {
    instanceId: fighter.instanceIdV180, fighterId: id, hp: fighter.hp, wave: match.hordeV180.wave });
  return fighter;
}

function finishHordeV180(match, winner, reason) {
  if (match.result || match.phase === 'match-over') return;
  const state = match.hordeV180, player = match.fighters[0];
  const opponentStats = { ...state.opponentStats };
  for (const enemy of match.fighters.slice(1)) for (const [key, value] of Object.entries(enemy.stats))
    opponentStats[key] = (opponentStats[key] || 0) + value;
  match.wins = { player: winner === 'player' ? 1 : 0, opponent: winner === 'opponent' ? 1 : 0 };
  match.roundWinner = winner; match.roundReason = reason; match.phase = 'match-over'; match.phaseTime = 0;
  match.projectiles = []; clearXenoTrialsAcidV152(match); clearXenoTrialsGrappleV153(match);
  for (const fighter of match.fighters) { fighter.attack = null; fighter.guard = false; fighter.rearmControls = releaseGate(fighter); }
  match.result = { version: 96, completed: true, matchId: match.config.matchId, seed: match.config.seed,
    winner, reason, rounds: 1, wins: { ...match.wins }, playerId: player.id, opponentId: match.config.opponentId,
    playerVariant: player.variant, opponentVariant: match.config.opponentVariant, factionId: match.config.factionId,
    stageId: match.config.stageId, difficulty: match.config.difficulty, rulesV119: { ...match.config.rulesV119 },
    ...(match.config.activityV119 ? { activityV119: { ...match.config.activityV119 } } : {}),
    playerStats: { ...player.stats }, opponentStats, durationTicks: match.tick,
    hordeV180: { protocolId: state.protocolId, wavesCleared: state.wavesCleared, kills: state.totalKills, totalEnemies: state.totalEnemies,
      ...(state.bossFinaleV186 ? { bossFinaleV186: { ...getXenoTrialsHordeBossViewV186(getXenoTrialsHordeProtocolV180(state.protocolId), state, match.fighters) } } : {}) } };
  event(match, 'match-end', { winner, hordeV180: true });
}

function collectHordeAttackV180(match, fighter, targets, impacts) {
  for (const target of targets) {
    const start = match.projectiles.length;
    collectAttack(match, fighter, target, impacts);
    for (const projectile of match.projectiles.slice(start)) projectile.ownerInstanceV180 = fighter.instanceIdV180 || 'player';
  }
}

function stepHordeProjectilesV180(match, dt, impacts) {
  for (const projectile of match.projectiles) {
    const owner = match.fighters.find(fighter => (fighter.instanceIdV180 || 'player') === projectile.ownerInstanceV180);
    if (!owner || owner.hp <= 0 || projectile.life <= 0) { projectile.life = 0; continue; }
    const previous = { x: projectile.x, y: projectile.y }, travel = Math.min(dt, Math.max(0, projectile.life));
    projectile.x += (projectile.vx ?? projectile.direction * 560) * travel;
    projectile.y += (projectile.vy || 0) * travel; projectile.life -= dt;
    const ground = projectile.y < 0 && previous.y >= 0 ? previous.y / (previous.y - projectile.y) : Infinity;
    let first = null;
    const targets = match.fighters.filter(fighter => fighter.side !== owner.side && fighter.hp > 0);
    for (const target of targets) {
      const body = getXenoTrialsBodyBoundsV105(target);
      const box = projectile.signatureIdV147 ? body : { ...body, left: body.left - 9, right: body.right + 9 };
      const contact = xenoTrialsSegmentContactV147(previous.x, previous.y, projectile.x, projectile.y, box,
        projectile.signatureIdV147 ? projectile.radiusV147 : 0);
      if (contact !== null && contact <= ground && (!first || contact < first.fraction)) first = { target, fraction: contact };
    }
    if (travel > 0 && first) {
      impacts.push({ from: owner, to: first.target, spec: projectile.spec, power: projectile.power, direction: projectile.direction });
      projectile.life = 0;
      if (projectile.style === 'ground-wave') for (const other of match.projectiles)
        if (other.groupIdV147 === projectile.groupIdV147) other.life = 0;
    }
    if (travel > 0 && (projectile.life <= 0 || ground !== Infinity)) {
      const fraction = first ? first.fraction : Math.min(1, ground);
      depositXenoTrialsAcidV152(match, projectile, getXenoTrialsFighterV96(owner.id),
        previous.x + (projectile.x - previous.x) * fraction,
        Math.max(0, previous.y + (projectile.y - previous.y) * fraction), XENO_TRIALS_ARENA_V96);
    }
    if (projectile.signatureIdV147 && projectile.y < 0) projectile.life = 0;
  }
  match.projectiles = match.projectiles.filter(projectile => projectile.life > 0
    && projectile.x > XENO_TRIALS_ARENA_V96.left - 200 && projectile.x < XENO_TRIALS_ARENA_V96.right + 200).slice(-HORDE_LIMITS.maxProjectiles);
}

/** Native fixed-step actors and impacts, with a bounded director around them.
 * Only two CPUs can commit an attack at once. Others keep moving/observing;
 * no fighter receives a hidden damage tick just because a crowd is nearby. */
function fixedHordeStepV180(match, playerControls, opponentControls, dt) {
  match.tick++;
  match.synthEffectsV110 = (match.synthEffectsV110 || []).map(effect => ({ ...effect, life: effect.life - dt }))
    .filter(effect => effect.life > 0).slice(-HORDE_LIMITS.maxEffects);
  if (match.phase !== 'active') {
    match.fighters[0].rearmControls = { ...playerControls };
    if (match.phase === 'intro') {
      match.phaseTime -= dt;
      if (match.phaseTime <= 0) { match.phase = 'active'; event(match, 'fight', { round: 1, hordeV180: true }); }
    }
    return;
  }
  const player = match.fighters[0];
  const enemies = match.fighters.slice(1).filter(enemy => enemy.hp > 0);
  const sorted = [...enemies].sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x));
  const engaged = [...sorted.filter(enemy => enemy.attack),
    ...sorted.filter(enemy => !enemy.attack && enemy.enemyRankV186 === 'boss'),
    ...sorted.filter(enemy => !enemy.attack && enemy.enemyRankV186 !== 'boss')].slice(0, 2);
  const orders = new Map(engaged.map(enemy => [enemy, player.x <= enemy.x ? 1 : -1]));
  const nearest = sorted[0] || { ...player, x: player.x + player.facing * 1000 };
  fighterStep(match, player, nearest, playerControls, dt);
  for (const enemy of enemies) {
    let controls = opponentControls;
    if (!controls) {
      const pair = { ...match, fighters: [player, enemy], ai: enemy.aiV180 };
      controls = stepXenoTrialsBrainV119(pair, dt, XENO_TRIALS_ATTACKS_V96, () => rng(match));
      enemy.aiV180 = pair.ai;
    }
    if (!engaged.includes(enemy) || match.tick < enemy.spawnTickV180 + HORDE_LIMITS.spawnGraceTicks)
      controls = { ...controls, light: false, heavy: false, special: false, super: false };
    const previousAttackId = enemy.attack?.id;
    fighterStep(match, enemy, player, controls, dt);
    if (enemy.enemyRankV186 === 'boss' && enemy.attack && enemy.attack.id !== previousAttackId) {
      const definition = getXenoTrialsFighterV96(enemy.id), spec = getXenoTrialsAttackV147(definition, enemy.attack.kind, XENO_TRIALS_ATTACKS_V96[enemy.attack.kind]);
      event(match, 'horde-boss-telegraph-v186', { fighterId: enemy.id, instanceId: enemy.instanceIdV180,
        attackId: enemy.attack.id, kind: enemy.attack.kind, style: getXenoTrialsSpecialStyleV147(definition), startupSeconds: spec.startup });
    }
  }
  // Soft separation among the crowd avoids a perfectly stacked sprite column.
  // Only engaged bodies push the player, so the whole wave cannot sweep them.
  for (let a = 0; a < enemies.length; a++) for (let b = a + 1; b < enemies.length; b++) {
    const left = enemies[a].x <= enemies[b].x ? enemies[a] : enemies[b], right = left === enemies[a] ? enemies[b] : enemies[a];
    const gap = right.x - left.x;
    if (gap < 42) {
      const shift = Math.min((42 - gap) * .5, 35 * dt);
      left.x = clamp(left.x - shift, XENO_TRIALS_ARENA_V96.left, XENO_TRIALS_ARENA_V96.right);
      right.x = clamp(right.x + shift, XENO_TRIALS_ARENA_V96.left, XENO_TRIALS_ARENA_V96.right);
    }
  }
  for (const enemy of engaged) resolveXenoTrialsBodiesV105(player, enemy, orders.get(enemy));
  const livingAtStart = new Map(match.fighters.filter(fighter => fighter.hp > 0)
    .map(fighter => [fighter, getXenoTrialsCasteV151(getXenoTrialsFighterV96(fighter.id))]));
  const impacts = [];
  collectHordeAttackV180(match, player, sorted, impacts);
  for (const enemy of enemies) collectHordeAttackV180(match, enemy, [player], impacts);
  stepHordeProjectilesV180(match, dt, impacts);
  for (const impact of impacts) applyImpact(match, impact);
  stepXenoTrialsAcidV152(match, dt, getXenoTrialsBodyBoundsV105, XENO_TRIALS_ARENA_V96,
    impact => applyImpact(match, impact), (type, details) => event(match, type, details));
  collectXenoTrialsDeathBurstsV151(match, livingAtStart, getXenoTrialsBodyBoundsV105,
    impact => applyImpact(match, impact), (type, details) => event(match, type, details));
  match.timeRemaining = Math.max(0, match.timeRemaining - dt);
  const cleared = advanceXenoTrialsHordeDirectorV180(match,
    (id, wave, serial, slot) => makeHordeFighterV180(match, id, wave, serial, slot),
    (type, details) => event(match, type, details));
  if (player.hp <= 0) finishHordeV180(match, 'opponent', 'horde-ko');
  else if (cleared) finishHordeV180(match, 'player', 'horde-cleared');
  else if (match.timeRemaining <= 0) finishHordeV180(match, 'opponent', 'horde-time');
}

function fixedStep(match, playerControls, opponentControls, dt) {
  if (match.hordeV180) { fixedHordeStepV180(match, playerControls, opponentControls, dt); return; }
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
  const livingAtStart = new Map(match.fighters.filter(f => f.hp > 0).map(f => [f, getXenoTrialsCasteV151(getXenoTrialsFighterV96(f.id))]));
  const impacts = [];
  // Capture both hit windows before applying damage: simultaneous KOs are legal.
  collectAttack(match, a, b, impacts); collectAttack(match, b, a, impacts);
  for (const projectile of match.projectiles) {
    const previous = { x: projectile.x, y: projectile.y };
    const travel = Math.min(dt, Math.max(0, projectile.life));
    projectile.x += (projectile.vx ?? projectile.direction * 560) * travel;
    projectile.y += (projectile.vy || 0) * travel; projectile.life -= dt;
    const target = projectile.owner === 'player' ? b : a, owner = projectile.owner === 'player' ? a : b;
    const body = getXenoTrialsBodyBoundsV105(target);
    const contact = projectile.signatureIdV147
      ? xenoTrialsSegmentContactV147(previous.x, previous.y, projectile.x, projectile.y, body, projectile.radiusV147)
      : Math.max(previous.x, projectile.x) >= body.left - 9 && Math.min(previous.x, projectile.x) <= body.right + 9
        && projectile.y >= body.bottom && projectile.y <= body.top ? 0 : null;
    // Signature trajectories cannot continue below the collision floor.
    const groundContact = projectile.y < 0 && previous.y >= 0 ? previous.y / (previous.y - projectile.y) : Infinity;
    if (travel > 0 && contact !== null && contact <= groundContact) {
      impacts.push({ from: owner, to: target, spec: projectile.spec, power: projectile.power, direction: projectile.direction }); projectile.life = 0;
      if (projectile.style === 'ground-wave') for (const other of match.projectiles)
        if (other.groupIdV147 === projectile.groupIdV147) other.life = 0;
    }
    if (travel > 0 && (projectile.life <= 0 || groundContact !== Infinity)) {
      // Resolve residue at the earliest physical contact, or the finite range
      // endpoint. Airborne hits shed a falling, harmless drop, never a floor teleport.
      const fraction = contact !== null && contact <= groundContact ? contact : Math.min(1, groundContact);
      depositXenoTrialsAcidV152(match, projectile, getXenoTrialsFighterV96(owner.id),
        previous.x + (projectile.x - previous.x) * fraction,
        Math.max(0, previous.y + (projectile.y - previous.y) * fraction), XENO_TRIALS_ARENA_V96);
    }
    if (projectile.signatureIdV147 && projectile.y < 0) projectile.life = 0;
  }
  match.projectiles = match.projectiles.filter(p => p.life > 0 && p.x > XENO_TRIALS_ARENA_V96.left - 200 && p.x < XENO_TRIALS_ARENA_V96.right + 200);
  for (const impact of impacts) applyImpact(match, impact);
  stepXenoTrialsAcidV152(match, dt, getXenoTrialsBodyBoundsV105, XENO_TRIALS_ARENA_V96,
    impact => applyImpact(match, impact), (type, details) => event(match, type, details));
  stepXenoTrialsGrappleV153(match, getXenoTrialsBodyBoundsV105,
    impact => applyImpact(match, impact), (type, details) => event(match, type, details));
  collectXenoTrialsDeathBurstsV151(match, livingAtStart, getXenoTrialsBodyBoundsV105,
    impact => applyImpact(match, impact), (type, details) => event(match, type, details));
  resolveXenoTrialsBodiesV105(a, b, impactOrder);
  match.timeRemaining = Math.max(0, match.timeRemaining - dt);
  if (a.hp <= 0 || b.hp <= 0) finishRound(match, a.hp <= 0 && b.hp <= 0 ? 'double-ko' : 'ko');
  else if (match.timeRemaining <= 0) finishRound(match, 'time');
}

/** dt is in seconds; one call accepts at most 250ms, discarding stall debt.
 * Browser blur pauses independently. Null opponent input selects deterministic AI. */
export function stepXenoTrialsMatchV96(match, dt, playerInput = {}, opponentInput = null) {
  if (!match || match.paused || match.phase === 'match-over' || !Number.isFinite(dt) || dt <= 0) return match;
  const source = opponentInput === null ? 'cpu' : 'direct';
  if (source === 'cpu' && match.opponentInputSourceV163 === 'direct') {
    for (const cpu of match.fighters.filter(fighter => fighter.side === 'opponent')) cpu.rearmControls = emptyInput();
  }
  match.opponentInputSourceV163 = source;
  match.accumulator += Math.min(dt, .25);
  const a = input(playerInput), b = opponentInput === null ? null : input(opponentInput);
  while (match.accumulator + 1e-10 >= XENO_TRIALS_STEP_V96) {
    match.accumulator = Math.max(0, match.accumulator - XENO_TRIALS_STEP_V96);
    fixedStep(match, a, b, XENO_TRIALS_STEP_V96);
    if (match.phase === 'match-over') { match.accumulator = 0; break; }
  }
  // The fixed-step loop already uses this tolerance; discard only its floating
  // residue so identical completed steps serialize identically at 30/60/120 Hz.
  if (match.accumulator < 1e-10) match.accumulator = 0;
  return match;
}
export function getXenoTrialsSnapshotV96(match) {
  if (!match) return null;
  return JSON.parse(JSON.stringify(match));
}

/** Resume only a coherent, bounded nonterminal horde snapshot. Returning a
 * paused state leaves activation with its runtime owner; no result is replayed.
 * Save-owner and match-ticket authorization remain the progression layer's job. */
export function restoreXenoTrialsHordeMatchV180(snapshot) {
  let value;
  try { value = JSON.parse(JSON.stringify(snapshot)); } catch { return null; }
  const state = value?.hordeV180, protocol = getXenoTrialsHordeProtocolV180(state?.protocolId);
  if (!protocol || value.version !== 96 || state.schema !== 180 || value.result !== null
    || !['intro', 'active'].includes(value.phase) || !['active', 'intermission'].includes(state.phase)
    || !Number.isInteger(value.tick) || value.tick < 0 || value.tick > (protocol.roundSeconds + 5) * 120
    || !Number.isInteger(value.rng) || value.rng < 0 || value.rng > 0xffffffff
    || !Number.isFinite(value.timeRemaining) || value.timeRemaining <= 0 || value.timeRemaining > protocol.roundSeconds
    || !Number.isInteger(state.wave) || state.wave < 1 || state.wave > protocol.waves.length
    || !Array.isArray(value.fighters) || value.fighters.length < 1 || value.fighters.length > HORDE_LIMITS.maxConcurrent + 1
    || !Array.isArray(value.projectiles) || value.projectiles.length > HORDE_LIMITS.maxProjectiles) return null;
  const canonical = createXenoTrialsMatchV96(value.config);
  if (canonical.hordeV180?.protocolId !== protocol.id || canonical.config.playerId !== value.fighters[0].id
    || value.config.stageId !== protocol.stageId || value.config.difficulty !== protocol.difficulty
    || value.config.factionId !== protocol.factionId || value.config.roundSeconds !== protocol.roundSeconds
    || value.config.roundsToWin !== 1) return null;
  const wave = protocol.waves[state.wave - 1], enemies = value.fighters.slice(1);
  const preceding = protocol.waves.slice(0, state.wave - 1).reduce((total, entry) => total + entry.total, 0);
  if (state.waveCount !== protocol.waves.length || state.totalEnemies !== protocol.totalEnemies
    || !Number.isInteger(state.waveSpawned) || state.waveSpawned < enemies.length || state.waveSpawned > wave.total
    || state.waveKills !== state.waveSpawned - enemies.length || state.totalKills !== preceding + state.waveKills
    || state.totalRemaining !== protocol.totalEnemies - state.totalKills || state.alive !== enemies.length
    || state.remaining !== wave.total - state.waveSpawned || state.concurrent !== wave.concurrent
    || state.serial !== preceding + state.waveSpawned || state.maxConcurrent !== HORDE_LIMITS.maxConcurrent
    || state.wavesCleared !== state.wave - (state.phase === 'intermission' ? 0 : 1)
    || enemies.length > wave.concurrent || new Set(enemies.map(enemy => enemy.instanceIdV180)).size !== enemies.length
    || (state.phase === 'intermission' && (enemies.length !== 0 || state.waveKills !== wave.total))) return null;
  const bossMetadata = protocol.bossFinaleV186;
  if (bossMetadata ? Object.keys(bossMetadata).some(key => state.bossFinaleV186?.[key] !== bossMetadata[key])
    : state.bossFinaleV186 != null) return null;
  for (const [index, fighter] of value.fighters.entries()) {
    const serial = index > 0 ? Number(/^horde-(\d+)$/.exec(fighter.instanceIdV180 || '')?.[1]) : 0;
    const slotIndex = serial - preceding - 1;
    const slot = index > 0 ? getXenoTrialsHordeSlotV186(wave, slotIndex) : null;
    const maxHp = index === 0 ? getXenoTrialsFighterV96(fighter.id)?.hp : slot?.hp ?? wave.hp;
    if (!getXenoTrialsFighterV96(fighter.id) || fighter.side !== (index === 0 ? 'player' : 'opponent')
      || !Number.isFinite(fighter.hp) || fighter.hp <= 0
      || fighter.hp > maxHp
      || ![fighter.x, fighter.y, fighter.vy, fighter.stamina, fighter.stun, fighter.specialCooldown].every(Number.isFinite)
      || fighter.x < XENO_TRIALS_ARENA_V96.left || fighter.x > XENO_TRIALS_ARENA_V96.right
      || fighter.y < 0 || fighter.stamina < 0 || fighter.stamina > getXenoTrialsFighterV96(fighter.id).stamina
      || !fighter.previousInput || !fighter.rearmControls || !fighter.stats) return null;
    if (index > 0 && (!Number.isInteger(serial) || serial <= preceding || serial > state.serial
      || fighter.id !== (slot?.fighterId || wave.opponentIds[(slotIndex + state.wave - 1) % wave.opponentIds.length])
      || fighter.maxHpV180 !== maxHp || !Number.isInteger(fighter.spawnTickV180)
      || fighter.spawnTickV180 < 0 || fighter.spawnTickV180 > value.tick
      || fighter.damageScaleV180 !== (slot?.damageScale ?? wave.damageScale))) return null;
    if (slot ? fighter.spawnSlotV186 !== slotIndex || fighter.enemyRankV186 !== slot.rank
      || fighter.bossIdV186 !== (slot.rank === 'boss' ? slot.fighterId : null)
      : fighter.spawnSlotV186 !== undefined || fighter.enemyRankV186 !== undefined || fighter.bossIdV186 !== undefined) return null;
  }
  const owners = new Set(['player', ...enemies.map(enemy => enemy.instanceIdV180)]);
  if (value.projectiles.some(projectile => !owners.has(projectile.ownerInstanceV180)
    || ![projectile.x, projectile.y, projectile.life, projectile.power].every(Number.isFinite) || projectile.life <= 0
    || !Number.isFinite(projectile.spec?.damage))) return null;
  value.paused = true; value.accumulator = 0;
  if (bossMetadata) state.bossFinaleV186 = { ...bossMetadata };
  value.config = canonical.config;
  return value;
}
