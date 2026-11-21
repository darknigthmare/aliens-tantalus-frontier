// V188 — Act V dedicated convoy race (bible §5.6 steps 4-6, §5.11; spec 006,
// owner Q1 A in the strict sense). Pure rules, no DOM: the M577 tows physical
// trailers (drawbar spring-damper chain), a trailer can be dropped to gain speed
// or to block the pursuers, the bridge of « Dernier départ » sags and collapses
// behind and under the convoy, and in « La Reine du dépôt » the Queen chases it.
// The runtime (act5-convoy-race-runtime-v188.js) owns input, drawing and events;
// the save consequences are written by story-act5-v188.js. Every tuning value
// here is [PROPOSÉ] (bible §5.11) unless it cites a project scale.
//
// Fidelity. Documented (Aliens, 1986): the M577 APC (long low wedge hull,
// two road wheels per flank, side door), its escape drive through the
// processing plant, the Queen pursuing the survivors to the landing platform.
// Adapted by the project: towed trailers, the bridge, the depot Queen chasing a
// road convoy, the turret firing to the rear. To define: the Queen's sprite
// (named slot `act5-queen-chase-side`, Canvas placeholder meanwhile), the real
// M577 length at project scale. Nothing here claims a 1:1 reproduction.
import { CREATURE_SCALE_V188, isQueenStatureKeyV188 } from './creature-scale-v188.js';

const freeze = Object.freeze;
export const ACT5_RACE_CAMPAIGN_IDS_V188 = freeze(['act5-last-run', 'act5-depot-queen']);
export const isAct5RaceCampaignV188 = id => ACT5_RACE_CAMPAIGN_IDS_V188.includes(typeof id === 'string' ? id : id?.id);

export const ACT5_RACE_V188 = freeze({
  schema: 188, status: 'PROPOSÉ',
  pixelsPerMetre: CREATURE_SCALE_V188.pixelsPerMetre, // project scale: 1 m ≈ 51 px
  substep: 1 / 120, maxStep: .1, gravity: 9.81,
  apc: freeze({ mass: 22, force: 62, brake: 90, roll: .02, aero: .14, hull: 340 }),
  trailer: freeze({ mass: 9, roll: .05, aero: .05, brakeRoll: .5, hitch: 1.6, spring: 120, damper: 24, slack: .6, integrity: 100 }),
  turret: freeze({ rate: 8, damage: 12, heatPerRound: 3.4, cool: 30, cooledAt: 35, reach: 70 }),
  race: freeze({ length: 1500, bridgeStart: 700, bridgeLength: 90, segment: 6, strainAt: 24, strainDamping: 20,
    collapseDelay: 1.2, collapseCreep: 2, collapseSpeed: 7, collapseTrail: 10, collapseTrailStrained: 7, fallSeconds: 1.6, snapSeconds: .45,
    waveEvery: 7, waveSize: 2, maxRunners: 6, firstWave: 4 }),
  runner: freeze({ profileId: 'enemy-006-runner', health: 80, speed: 19, latch: 1, hitEvery: 1.2, trailerDamage: 9, hullDamage: 14, blockSeconds: 4, height: 92 }),
  chase: freeze({ length: 1600, queenStart: 110, standStop: 4 }),
  queen: freeze({ profileId: 'enemy-008-queen', healthFactor: 12, stalk: 20, standStalk: 6, windupAt: 5.5, windup: .7, lunge: 24, lungeSeconds: .65,
    recover: 1.3, recoverSpeed: 12, staggerDamage: 200, stagger: .6, staggerSpeed: 4, feed: 6, trailerHit: 34, hullFactor: 1, reach: 1.2 }),
  arrival: freeze({ brakeFrom: 60 })
});

// —— Queen admission (game-ai: eligibility before shared logic) ——
/** The dedicated chase accepts only the catalogue's royal-caste Queen of the 4.8 m stature class. */
export function act5QueenAdmissibleV188(profile) {
  const behaviour = profile?.behaviorProfileV119;
  if (!profile || profile.id !== ACT5_RACE_V188.queen.profileId || !isQueenStatureKeyV188(profile.id)) return freeze({ admitted: false, reason: 'not-queen-class' });
  if (behaviour?.id !== 'royal' || behaviour.runtimeBehavior !== 'boss') return freeze({ admitted: false, reason: 'not-royal-boss' });
  return freeze({ admitted: true, behaviour: 'act5-royal-chase', height: CREATURE_SCALE_V188.queen.height, metres: CREATURE_SCALE_V188.queen.metres });
}
export function act5RunnerAdmissibleV188(profile) {
  return Boolean(profile && profile.id === ACT5_RACE_V188.runner.profileId && profile.behaviorProfileV119?.id === 'runner');
}

// Explicit Queen state machine: allowed transitions only.
export const ACT5_QUEEN_TRANSITIONS_V188 = freeze({
  stalk: freeze(['windup', 'staggered', 'feeding', 'dead']),
  windup: freeze(['lunge', 'staggered', 'dead']),
  lunge: freeze(['recover', 'dead']),
  recover: freeze(['stalk', 'staggered', 'feeding', 'dead']),
  staggered: freeze(['stalk', 'dead']),
  feeding: freeze(['stalk', 'dead']),
  dead: freeze([])
});
function setQueenState(queen, next) {
  if (queen.state === next) return true;
  if (!ACT5_QUEEN_TRANSITIONS_V188[queen.state]?.includes(next)) return false;
  (queen.trail ||= []).push([queen.state, next]); if (queen.trail.length > 16) queen.trail.shift();
  queen.state = next; queen.clock = 0; return true;
}

// —— State ——
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
/** apcLength: metres of the drawn hull (vehicle.w / 51). */
export function createAct5RaceStateV188({ campaignId, trailers = [], apcLength = 4.6, trailerLength = 4.6, bridgeSeconds = 15, queenProfile = null, replay = false } = {}) {
  if (!isAct5RaceCampaignV188(campaignId)) return null;
  const R = ACT5_RACE_V188, chase = campaignId === 'act5-depot-queen';
  const state = { schema: 188, campaignId, mode: chase ? 'chase' : 'race', replay: Boolean(replay), phase: 'briefing', elapsed: 0,
    apc: { s: 0, v: 0, length: apcLength, hull: R.apc.hull, throttle: 0 }, trailers: [], dropped: [], events: [],
    runners: [], sequence: 0, nextWaveAt: R.race.firstWave, turret: { heat: 0, overheated: false, cooldown: 0, target: null, firing: false },
    bridge: chase ? null : { start: R.race.bridgeStart, length: R.race.bridgeLength, strain: false, strainClock: 0, window: bridgeSeconds,
      collapse: null, crossed: false, segments: Array.from({ length: Math.ceil(R.race.bridgeLength / R.race.segment) }, () => ({ fall: -1 })) },
    queen: null, length: chase ? R.chase.length : R.race.length, complete: false, failed: null, checkpoints: [] };
  for (const trailer of trailers.slice(0, 2)) {
    state.trailers.push({ id: trailer.id, people: finite(trailer.people), containers: finite(trailer.containers), s: 0, v: 0, length: trailerLength,
      integrity: R.trailer.integrity, bounce: 0, bounceV: 0, falling: -1, dragging: 0 });
  }
  // Pack the trailers from the APC centre: front hitch at the APC rear.
  let front = state.apc.s - apcLength / 2;
  for (const trailer of state.trailers) { trailer.s = front - R.trailer.hitch - trailer.length / 2; front = trailer.s - trailer.length / 2; }
  if (chase) {
    const admitted = act5QueenAdmissibleV188(queenProfile);
    if (!admitted.admitted) return null;
    state.queen = { profileId: queenProfile.id, name: queenProfile.name || 'Queen', s: front - R.chase.queenStart, v: 0, health: finite(queenProfile.health, 185) * R.queen.healthFactor,
      maxHealth: finite(queenProfile.health, 185) * R.queen.healthFactor, damage: finite(queenProfile.damage, 24), state: 'stalk', clock: 0, staggerMeter: 0,
      feedingOn: null, height: admitted.height, gait: 0 };
  }
  return state;
}

const rearOfConvoy = state => {
  const last = state.trailers.at(-1);
  return last ? last.s - last.length / 2 : state.apc.s - state.apc.length / 2;
};
export const act5RaceRearV188 = rearOfConvoy;
const towedMass = state => state.trailers.reduce((sum, trailer) => sum + ACT5_RACE_V188.trailer.mass, 0);
export const act5RaceTowedMassV188 = towedMass;
const event = (state, type, detail = {}) => { state.events.push({ type, ...detail }); };

/** Phase from progress; the runtime emits one checkpoint per phase entered (owner rule). */
export function act5RacePhaseV188(state) {
  if (state.failed) return 'failed';
  if (state.complete) return 'complete';
  if (state.phase === 'briefing') return 'briefing';
  if (state.mode === 'chase') return state.apc.s >= state.length ? 'stand' : 'chase';
  const bridge = state.bridge;
  if (state.apc.s >= state.length - ACT5_RACE_V188.arrival.brakeFrom) return 'arrival';
  if (bridge.crossed) return 'far-side';
  if (state.apc.s + state.apc.length / 2 >= bridge.start) return 'bridge';
  return 'road';
}
export const ACT5_RACE_PHASES_V188 = freeze({ race: freeze(['briefing', 'road', 'bridge', 'far-side', 'arrival', 'complete']), chase: freeze(['briefing', 'chase', 'stand', 'complete']) });

export function engageAct5RaceV188(state) {
  if (!state || state.phase !== 'briefing') return false;
  state.phase = state.mode === 'chase' ? 'chase' : 'road'; event(state, 'phase', { phase: state.phase }); return true;
}

/** Detach a trailer (player decision or forced). The rear trailer re-pins to the unit ahead (through-cable coupling, [PROPOSÉ]). */
export function dropAct5TrailerV188(state, trailerId, cause = 'road') {
  if (!state || state.phase === 'briefing' || state.complete || state.failed) return false;
  const index = state.trailers.findIndex(trailer => trailer.id === trailerId);
  if (index < 0) return false;
  const [trailer] = state.trailers.splice(index, 1);
  trailer.dropCause = cause; trailer.detachedAt = state.elapsed; trailer.blocking = true;
  state.dropped.push(trailer);
  event(state, 'trailer-dropped', { trailer: trailer.id, cause, metres: Math.max(0, Math.round(trailer.s)) });
  if (state.bridge?.strain && state.trailers.length < 2) state.bridge.strain = false;
  return true;
}

function onBridge(state, s) { const b = state.bridge; return Boolean(b && s >= b.start && s <= b.start + b.length); }
function collapsedAt(state, s) { const b = state.bridge; return Boolean(b?.collapse !== null && b?.collapse !== undefined && onBridge(state, s) && s <= b.collapse); }

// —— Physics: APC + drawbar chain ——
function stepChain(state, dt, controls) {
  const R = ACT5_RACE_V188, A = R.apc, T = R.trailer, apc = state.apc, g = R.gravity;
  const arrived = state.mode === 'race' ? apc.s >= state.length - R.arrival.brakeFrom : apc.s >= state.length;
  let throttle = clamp(finite(controls.throttle), -1, 1);
  if (state.phase === 'briefing' || arrived) throttle = -1;
  apc.throttle = throttle;
  // Chain forces: drawbar i links unit i-1 (APC for 0) to trailer i.
  const units = [apc, ...state.trailers];
  const tension = [];
  for (let i = 1; i < units.length; i++) {
    const rear = units[i], ahead = units[i - 1];
    const gap = (ahead.s - ahead.length / 2) - (rear.s + rear.length / 2);
    const stretch = gap - T.hitch, limit = T.slack;
    let force = T.spring * stretch + T.damper * (ahead.v - rear.v);
    if (Math.abs(stretch) > limit) force += T.spring * 6 * (stretch - Math.sign(stretch) * limit); // drawbar end stops
    tension.push(force);
  }
  const sink = (unit, extra = 0) => unit.v > .01 ? (R.trailer.roll + extra) * T.mass * g + T.aero * unit.v * unit.v : 0;
  // APC
  const drive = throttle > 0 ? A.force * throttle : 0, braking = throttle < 0 ? A.brake * -throttle : 0;
  let fApc = drive - (apc.v > .01 ? A.roll * A.mass * g + A.aero * apc.v * apc.v : 0) - (tension[0] || 0);
  if (braking) fApc -= Math.min(braking, Math.max(0, apc.v) * A.mass / dt + Math.max(0, fApc));
  apc.v = Math.max(0, apc.v + fApc / A.mass * dt);
  for (let i = 0; i < state.trailers.length; i++) {
    const trailer = state.trailers[i];
    let extra = 0;
    if (trailer.dragging > 0) extra += 12;
    // The sagging deck bogs the rear trailer down: a speed-proportional drag (it creeps, it does not stall).
    const bog = state.bridge?.strain && i === state.trailers.length - 1 ? R.race.strainDamping * trailer.v : 0;
    let f = (tension[i] || 0) - (tension[i + 1] || 0) - sink(trailer, extra) - bog;
    if (trailer.v <= .01 && f < 0) f = 0;
    trailer.v = Math.max(0, trailer.v + f / T.mass * dt);
  }
  apc.s += apc.v * dt;
  for (const trailer of state.trailers) {
    trailer.s += trailer.v * dt;
    // Road bumps excite the suspension: a damped vertical bounce for the drawing.
    const bump = Math.sin(trailer.s * 1.7) * Math.sin(trailer.s * .37) * Math.min(1, trailer.v / 12);
    trailer.bounceV += (-60 * trailer.bounce - 7 * trailer.bounceV + bump * 18) * dt; trailer.bounce += trailer.bounceV * dt;
  }
  for (const trailer of state.dropped) {
    if (trailer.v > 0) trailer.v = Math.max(0, trailer.v - T.brakeRoll * g * dt * 2);
    trailer.s += trailer.v * dt;
  }
}

// —— Bridge (race) ——
function stepBridge(state, dt) {
  const R = ACT5_RACE_V188.race, b = state.bridge, apc = state.apc;
  if (!b) return;
  const front = apc.s + apc.length / 2, rear = rearOfConvoy(state);
  if (!b.strain && !b.crossed && state.trailers.length >= 2 && front >= b.start + R.strainAt && rear < b.start + b.length && b.strainClock === 0) {
    b.strain = true; event(state, 'bridge-strain', { seconds: b.window });
  }
  if (b.collapse === null && front >= b.start + R.strainAt) { b.collapseStartAt = state.elapsed + R.collapseDelay; b.collapse = b.start - .01; event(state, 'bridge-collapse'); }
  if (b.strain) {
    b.strainClock += dt;
    if (b.strainClock >= b.window && state.trailers.length >= 2) {
      const rearTrailer = state.trailers.at(-1);
      dropAct5TrailerV188(state, rearTrailer.id, 'timeout'); rearTrailer.falling = 0;
    }
  }
  if (b.collapse !== null && state.elapsed >= b.collapseStartAt) {
    const speed = b.strain ? R.collapseCreep : R.collapseSpeed;
    // The deck gives way just behind the last unit still on it (visible behind the convoy), and catches a stopped convoy.
    const trailing = b.crossed ? b.collapse : rear - (b.strain ? R.collapseTrailStrained : R.collapseTrail);
    b.collapse = Math.min(Math.max(b.collapse + speed * dt, trailing), b.start + b.length);
    b.segments.forEach((segment, index) => { if (segment.fall < 0 && b.start + (index + 1) * R.segment <= b.collapse + .01) segment.fall = 0; });
  }
  for (const segment of b.segments) if (segment.fall >= 0) segment.fall += dt;
  // Units over a fallen span: attached trailers drag and snap, dropped ones fall, the APC falls.
  for (const trailer of [...state.trailers]) {
    if (collapsedAt(state, trailer.s)) {
      trailer.dragging += dt;
      if (trailer.dragging >= R.snapSeconds) { dropAct5TrailerV188(state, trailer.id, 'collapse'); trailer.falling = 0; }
    }
  }
  for (const trailer of state.dropped) if (trailer.falling < 0 && collapsedAt(state, trailer.s)) trailer.falling = 0;
  for (const trailer of state.dropped) if (trailer.falling >= 0) trailer.falling += dt;
  if (collapsedAt(state, apc.s - apc.length / 4)) { state.failed = 'bridge'; event(state, 'apc-fell'); return; }
  if (!b.crossed && rear > b.start + b.length) {
    b.crossed = true; b.strain = false; event(state, 'bridge-crossed');
  }
}

// —— Pursuers (race): runners from behind ——
function spawnWave(state) {
  const R = ACT5_RACE_V188, rear = rearOfConvoy(state);
  let spawned = 0;
  for (let i = 0; i < R.race.waveSize && state.runners.filter(runner => runner.alive).length < R.race.maxRunners; i++) {
    state.runners.push({ id: `act5r-${++state.sequence}`, s: rear - 24 - i * 4, v: R.runner.speed, health: R.runner.health, alive: true, latched: false, hitClock: .6, blocked: 0, gait: i * .4 });
    spawned++;
  }
  if (spawned) event(state, 'wave', { count: spawned });
}
function damageRear(state, trailerDamage, hullDamage, cause) {
  const rear = state.trailers.at(-1);
  if (rear) {
    rear.integrity = Math.max(0, rear.integrity - trailerDamage); event(state, 'trailer-hit', { trailer: rear.id, integrity: rear.integrity });
    if (rear.integrity <= 0) dropAct5TrailerV188(state, rear.id, cause);
    return 'trailer';
  }
  state.apc.hull = Math.max(0, state.apc.hull - hullDamage); event(state, 'hull-hit', { hull: state.apc.hull, cause });
  if (state.apc.hull <= 0) { state.failed = 'hull'; event(state, 'apc-destroyed'); }
  return 'hull';
}
function blockerAhead(state, s, reach) {
  return state.dropped.find(trailer => trailer.blocking && trailer.falling < 0 && trailer.s - trailer.length / 2 - s < reach && s < trailer.s + trailer.length / 2) || null;
}
function stepRunners(state, dt) {
  const R = ACT5_RACE_V188.runner, rear = rearOfConvoy(state);
  for (const runner of state.runners) {
    if (!runner.alive) continue;
    runner.gait += dt * 9;
    if (runner.blocked > 0) { runner.blocked -= dt; runner.v = 0; if (runner.blocked <= 0) runner.s += 8; continue; }
    const blocker = blockerAhead(state, runner.s, 1.5);
    if (blocker) { runner.blocked = R.blockSeconds; runner.latched = false; event(state, 'runner-blocked', { trailer: blocker.id }); continue; }
    if (onBridge(state, runner.s) && collapsedAt(state, runner.s)) { runner.alive = false; event(state, 'runner-fell'); continue; }
    if (runner.s < rear - R.latch) { runner.latched = false; runner.v = R.speed; runner.s = Math.min(rear - R.latch, runner.s + R.speed * dt); continue; }
    runner.latched = true; runner.s = rear - R.latch; runner.v = state.apc.v;
    runner.hitClock -= dt;
    if (runner.hitClock <= 0) { runner.hitClock = R.hitEvery; damageRear(state, R.trailerDamage, R.hullDamage, 'horde'); }
  }
  state.runners = state.runners.filter(runner => runner.alive || runner.deadClock === undefined || runner.deadClock < 1.2);
  for (const runner of state.runners) if (!runner.alive) runner.deadClock = (runner.deadClock || 0) + dt;
}

// —— Queen (chase) ——
function stepQueen(state, dt) {
  const R = ACT5_RACE_V188.queen, queen = state.queen;
  if (!queen || queen.state === 'dead') return;
  queen.clock += dt; queen.gait += dt * (queen.v / 4 + 1);
  queen.staggerMeter = Math.max(0, queen.staggerMeter - dt * 20);
  const rear = rearOfConvoy(state), standing = state.apc.s >= state.length, gap = rear - (queen.s + 2.4);
  const stalk = standing ? R.standStalk + R.stalk * .4 : R.stalk;
  switch (queen.state) {
    case 'stalk': {
      const blocker = blockerAhead(state, queen.s + 2.4, 2);
      if (blocker) { setQueenState(queen, 'feeding'); queen.feedingOn = blocker.id; blocker.blocking = false; event(state, 'queen-feeding', { trailer: blocker.id }); break; }
      queen.v = stalk;
      if (gap <= R.windupAt) setQueenState(queen, 'windup');
      break;
    }
    case 'windup': queen.v = Math.max(0, state.apc.v * .8); if (queen.clock >= R.windup) { setQueenState(queen, 'lunge'); event(state, 'queen-lunge'); } break;
    case 'lunge':
      queen.v = R.lunge;
      if (gap <= R.reach) {
        damageRear(state, R.trailerHit, queen.damage * R.hullFactor, 'queen');
        queen.s = rearOfConvoy(state) - 2.4 - R.reach; setQueenState(queen, 'recover');
      } else if (queen.clock >= R.lungeSeconds) setQueenState(queen, 'recover');
      break;
    case 'recover': {
      const blocker = blockerAhead(state, queen.s + 2.4, 2);
      if (blocker) { setQueenState(queen, 'feeding'); queen.feedingOn = blocker.id; blocker.blocking = false; event(state, 'queen-feeding', { trailer: blocker.id }); break; }
      queen.v = R.recoverSpeed; if (queen.clock >= R.recover) setQueenState(queen, 'stalk'); break;
    }
    case 'staggered': queen.v = R.staggerSpeed; if (queen.clock >= R.stagger) setQueenState(queen, 'stalk'); break;
    case 'feeding': queen.v = 0; if (queen.clock >= R.feed) { setQueenState(queen, 'stalk'); queen.feedingOn = null; } break;
    default: break;
  }
  queen.s = Math.min(queen.s + queen.v * dt, rearOfConvoy(state) - 2.4 - .2);
}

// —— Turret (rear-facing, auto-tracking) ——
export function act5RaceTargetV188(state) {
  const R = ACT5_RACE_V188.turret, apcRear = state.apc.s - state.apc.length / 2;
  const threats = [];
  if (state.queen && state.queen.state !== 'dead') threats.push({ kind: 'queen', id: 'queen', s: state.queen.s + 1.2 });
  for (const runner of state.runners) if (runner.alive) threats.push({ kind: 'runner', id: runner.id, s: runner.s });
  return threats.filter(threat => apcRear - threat.s <= R.reach && apcRear - threat.s >= -2).sort((a, b) => b.s - a.s)[0] || null;
}
function stepTurret(state, dt, firing) {
  const R = ACT5_RACE_V188.turret, turret = state.turret;
  turret.cooldown = Math.max(0, turret.cooldown - dt);
  const target = act5RaceTargetV188(state);
  turret.target = target ? target.id : null; turret.firing = false;
  const canFire = firing && !turret.overheated && target && state.phase !== 'briefing';
  if (!canFire) {
    turret.heat = Math.max(0, turret.heat - R.cool * dt);
    if (turret.overheated && turret.heat <= R.cooledAt) turret.overheated = false;
    return 0;
  }
  let rounds = 0;
  while (turret.cooldown <= 0 && !turret.overheated) {
    turret.cooldown += 1 / R.rate; rounds++;
    turret.heat = Math.min(100, turret.heat + R.heatPerRound); if (turret.heat >= 100) turret.overheated = true;
  }
  if (!rounds) return 0;
  turret.firing = true;
  const damage = rounds * R.damage;
  if (target.kind === 'queen') {
    const queen = state.queen; queen.health = Math.max(0, queen.health - damage); queen.staggerMeter += damage;
    event(state, 'hit', { target: 'queen', damage });
    if (queen.health <= 0) { setQueenState(queen, 'dead'); event(state, 'queen-killed'); }
    else if (queen.staggerMeter >= ACT5_RACE_V188.queen.staggerDamage && setQueenState(queen, 'staggered')) { queen.staggerMeter = 0; event(state, 'queen-staggered'); }
  } else {
    const runner = state.runners.find(entry => entry.id === target.id);
    runner.health -= damage; event(state, 'hit', { target: runner.id, damage });
    if (runner.health <= 0) { runner.alive = false; runner.deadClock = 0; event(state, 'runner-killed', { id: runner.id }); }
  }
  if (overheatedNow(turret)) event(state, 'turret-overheated');
  return rounds;
}
const overheatedNow = turret => turret.overheated && turret.heat >= 100;

/** One frame. controls: { throttle -1..1, fire }. Returns the events of the frame (and clears them). */
export function stepAct5RaceV188(state, delta, controls = {}) {
  if (!state || state.complete || state.failed) { const out = state?.events || []; if (state) state.events = []; return out; }
  const R = ACT5_RACE_V188, total = clamp(finite(delta), 0, R.maxStep);
  let left = total;
  while (left > 1e-9) {
    const dt = Math.min(R.substep, left); left -= dt;
    if (state.phase !== 'briefing') state.elapsed += dt;
    stepChain(state, dt, controls);
    if (state.phase === 'briefing') continue;
    if (state.mode === 'race') {
      stepBridge(state, dt);
      const phase = act5RacePhaseV188(state);
      if ((phase === 'road' || phase === 'far-side') && state.elapsed >= state.nextWaveAt) { state.nextWaveAt = state.elapsed + R.race.waveEvery; spawnWave(state); }
      stepRunners(state, dt);
      if (phase === 'arrival' && state.apc.v < .4 && !state.failed) { state.complete = true; event(state, 'arrived'); }
    } else {
      stepQueen(state, dt);
      if (state.queen.state === 'dead' && !state.complete) { state.complete = true; event(state, 'queen-stopped'); }
    }
    if (state.mode === 'race' || state.queen?.state !== 'dead') stepTurret(state, dt, Boolean(controls.fire));
    if (state.failed || state.complete) break;
    const phase = act5RacePhaseV188(state);
    if (phase !== state.phase && !['failed', 'complete'].includes(phase)) { state.phase = phase; event(state, 'phase', { phase }); }
  }
  const out = state.events; state.events = []; return out;
}

// —— Resume / checkpoint (pure data, validated) ——
export function sanitizeAct5RaceStateV188(raw) {
  if (!raw || typeof raw !== 'object' || raw.schema !== 188 || !isAct5RaceCampaignV188(raw.campaignId)) return null;
  try {
    const state = structuredClone(raw);
    state.events = [];
    if (!['race', 'chase'].includes(state.mode) || (state.mode === 'chase') !== (state.campaignId === 'act5-depot-queen')) return null;
    if (!Array.isArray(state.trailers) || state.trailers.length > 2 || !Array.isArray(state.dropped) || state.dropped.length > 2) return null;
    const ids = [...state.trailers, ...state.dropped].map(trailer => trailer?.id);
    if (ids.some(id => !['colonists', 'freight'].includes(id)) || new Set(ids).size !== ids.length) return null;
    if (![state.apc?.s, state.apc?.v, state.apc?.hull, state.elapsed].every(Number.isFinite)) return null;
    state.apc.hull = clamp(state.apc.hull, 0, ACT5_RACE_V188.apc.hull);
    if (state.mode === 'chase' && (!state.queen || !ACT5_QUEEN_TRANSITIONS_V188[state.queen.state])) return null;
    if (!Array.isArray(state.runners)) state.runners = [];
    state.runners = state.runners.slice(0, 24);
    return state;
  } catch { return null; }
}

// —— Audio cues (existing V188 cue set, audio-cues-v188.js) ——
export function act5RaceCueV188(event) {
  switch (event?.type) {
    case 'act5-race-turret-v188': return 'weapon-smartgun';
    case 'act5-race-wave-v188': return 'cry-runner';
    case 'act5-race-queen-v188': return event.id === 'lunge' || event.id === 'roar' ? 'cry-queen' : null;
    case 'act5-race-bridge-v188': return event.id === 'strain' ? 'alarm-general' : event.id === 'collapse' ? 'door-forced' : null;
    case 'act5-trailer-dropped-v188': return 'door-close';
    default: return null;
  }
}

// —— Named art slots (images to be produced by the art pass; none is requested while absent) ——
export const ACT5_RACE_ASSET_ROOT_V188 = '/assets/act5/v188/';
const slot = (id, width, height, purpose, brief, present, path = `${ACT5_RACE_ASSET_ROOT_V188}${id}.png`) => freeze({ id, width, height, purpose, brief, present, path });
export const ACT5_RACE_SLOTS_V188 = freeze([
  slot('act5-queen-chase-side', 520, 245, 'The depot Queen running after the convoy, side view, facing right; drawn 245 px tall (4.8 m at 1 m ≈ 51 px).',
    'Documented reference: the Queen of Aliens (1986) — crested head shield, inner jaw, two pairs of arms, long tail, digitigrade legs; adapted: running gait on a road, no egg sac; transparent background. To produce; Canvas placeholder meanwhile.', false),
  // Existing Act V art (act5-slots-v188.js), reused at its original path.
  slot('m577-side-corrected', 2124, 706, 'M577 side profile already produced for the Act V cinematics (not used in the race: the mission vehicle keeps its action sheet).', 'Existing file.', true),
  slot('colonist-trailer', 2134, 662, 'Late colonists’ trailer, side view (existing Act V art).', 'Existing file.', true),
  slot('freight-trailer', 2126, 658, 'Company freight trailer, side view (existing Act V art).', 'Existing file.', true)
]);
export const ACT5_RACE_SOURCE_RECTS_V188 = freeze({ 'colonist-trailer': freeze([27, 47, 2134, 662]), 'freight-trailer': freeze([28, 50, 2126, 658]) });
export const act5RaceSlotV188 = id => ACT5_RACE_SLOTS_V188.find(entry => entry.id === id) || null;

// —— Canvas placeholders ——
/** Queen placeholder: feet at (x, footY), facing right, `height` px tall (245 at project scale). */
export function drawAct5QueenPlaceholderV188(ctx, x, footY, { height = CREATURE_SCALE_V188.queen.height, gait = 0, state = 'stalk', hurt = 0 } = {}) {
  const k = height / 245;
  ctx.save(); ctx.translate(x, footY); ctx.scale(k, k);
  const lunge = state === 'lunge' ? 1 : state === 'windup' ? -.5 : 0, crouch = state === 'windup' ? 14 : state === 'feeding' ? 22 : 0;
  const step = Math.sin(gait), step2 = Math.sin(gait + Math.PI);
  ctx.fillStyle = hurt > 0 ? '#2b2f33' : '#14181b'; ctx.strokeStyle = '#3d4a52'; ctx.lineWidth = 2;
  // tail
  ctx.beginPath(); ctx.moveTo(-40, -120 + crouch); ctx.quadraticCurveTo(-150, -95 + step * 10, -230, -40 + step2 * 14); ctx.lineTo(-236, -46 + step2 * 14);
  ctx.quadraticCurveTo(-150, -110 + step * 10, -40, -138 + crouch); ctx.closePath(); ctx.fill(); ctx.stroke();
  // legs (digitigrade)
  for (const [phase, shade] of [[step, '#101316'], [step2, '#181d21']]) {
    ctx.fillStyle = shade; ctx.beginPath(); ctx.moveTo(-26, -118 + crouch); ctx.lineTo(-6 + phase * 22, -62); ctx.lineTo(-30 + phase * 30, -4); ctx.lineTo(-8 + phase * 30, 0);
    ctx.lineTo(8 + phase * 22, -60); ctx.lineTo(4, -112 + crouch); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = hurt > 0 ? '#2b2f33' : '#14181b';
  // torso, leaning forward
  ctx.beginPath(); ctx.moveTo(-44, -130 + crouch); ctx.quadraticCurveTo(10, -175 + crouch, 70 + lunge * 20, -170 + crouch); ctx.lineTo(80 + lunge * 20, -150 + crouch);
  ctx.quadraticCurveTo(20, -118 + crouch, -40, -108 + crouch); ctx.closePath(); ctx.fill(); ctx.stroke();
  // dorsal spines
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-20 + i * 22, -150 + crouch); ctx.lineTo(-30 + i * 22, -182 + crouch); ctx.lineTo(-10 + i * 22, -156 + crouch); ctx.fill(); }
  // two pairs of arms
  ctx.strokeStyle = '#1d2327'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(50 + lunge * 20, -158 + crouch); ctx.lineTo(86 + lunge * 34, -126 + crouch + step * 6); ctx.lineTo(112 + lunge * 44, -138 + crouch); ctx.stroke();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40 + lunge * 20, -140 + crouch); ctx.lineTo(70 + lunge * 26, -112 + crouch + step2 * 6); ctx.lineTo(88 + lunge * 30, -120 + crouch); ctx.stroke();
  // crested head shield, reaching 245 px at the crest
  ctx.fillStyle = '#0d1013'; ctx.strokeStyle = '#4a5963'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(66 + lunge * 20, -176 + crouch); ctx.lineTo(10 + lunge * 20, -245 + crouch * .5); ctx.lineTo(30 + lunge * 20, -232 + crouch * .5);
  ctx.lineTo(128 + lunge * 26, -168 + crouch); ctx.lineTo(118 + lunge * 26, -154 + crouch); ctx.closePath(); ctx.fill(); ctx.stroke();
  // jaw and teeth
  ctx.fillStyle = '#c8cfc4'; ctx.fillRect(108 + lunge * 26, -160 + crouch, 14, 3);
  if (state === 'lunge' || state === 'windup') { ctx.fillStyle = '#9aa69a'; ctx.fillRect(122 + lunge * 26, -158 + crouch, 12 + lunge * 8, 2); }
  ctx.restore();
}
/** Trailer placeholder (also the fallback of the existing trailer art). */
export function drawAct5TrailerPlaceholderV188(ctx, x, footY, w, h, id) {
  ctx.save();
  ctx.fillStyle = id === 'freight' ? '#3d443d' : '#46503f'; ctx.strokeStyle = '#1c221d'; ctx.lineWidth = 2;
  ctx.fillRect(x, footY - h, w, h * .78); ctx.strokeRect(x, footY - h, w, h * .78);
  ctx.fillStyle = '#121512';
  for (const cx of [x + w * .28, x + w * .72]) { ctx.beginPath(); ctx.arc(cx, footY - h * .14, h * .14, 0, Math.PI * 2); ctx.fill(); }
  if (id === 'colonists') { ctx.fillStyle = '#d9c47a'; for (let i = 0; i < 4; i++) ctx.fillRect(x + w * (.12 + i * .2), footY - h * .86, w * .1, h * .16); }
  else { ctx.strokeStyle = '#7c8576'; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + w * i / 4, footY - h); ctx.lineTo(x + w * i / 4, footY - h * .22); ctx.stroke(); } }
  ctx.restore();
}
/** Runner placeholder fallback (the runtime draws the catalogue silhouette in primitives too). */
export function drawAct5RunnerPlaceholderV188(ctx, x, footY, { height = 92, gait = 0 } = {}) {
  const k = height / 92; ctx.save(); ctx.translate(x, footY); ctx.scale(k, k); ctx.fillStyle = '#111518';
  const a = Math.sin(gait) * 10;
  ctx.beginPath(); ctx.moveTo(-30, -40); ctx.quadraticCurveTo(0, -62, 34, -54); ctx.lineTo(40, -44); ctx.quadraticCurveTo(0, -36, -30, -30); ctx.fill();
  ctx.fillRect(-12 + a, -36, 5, 36); ctx.fillRect(8 - a, -36, 5, 36); ctx.fillRect(20 + a * .6, -44, 4, 44);
  ctx.beginPath(); ctx.moveTo(-30, -36); ctx.quadraticCurveTo(-60, -30, -80, -10); ctx.lineTo(-78, -14); ctx.quadraticCurveTo(-58, -36, -30, -42); ctx.fill();
  ctx.restore();
}

// —— Texts (FR/EN) ——
const t = (fr, en) => freeze({ fr, en });
export const ACT5_RACE_TEXT_V188 = freeze({
  title: freeze({ 'act5-last-run': t('DERNIER DÉPART', 'LAST DEPARTURE'), 'act5-depot-queen': t('LA REINE DU DÉPÔT', 'THE DEPOT QUEEN') }),
  phase: freeze({
    briefing: t('CONVOI À L’ARRÊT', 'CONVOY HALTED'), road: t('ROUTE DU COMPLEXE', 'COMPLEX ROAD'), bridge: t('LE PONT', 'THE BRIDGE'),
    'far-side': t('RIVE NORD', 'NORTH BANK'), arrival: t('APPROCHE DU PORT', 'PORT APPROACH'), chase: t('POURSUITE', 'PURSUIT'),
    stand: t('CARREFOUR DU PORT', 'PORT JUNCTION'), complete: t('CONVOI ARRIVÉ', 'CONVOY THROUGH'), failed: t('CONVOI PERDU', 'CONVOY LOST')
  }),
  engage: t('E · ENGAGER LE CONVOI', 'E · MOVE THE CONVOY OUT'),
  controls: t('D / → : ACCÉLÉRER · A / ← : FREINER · F : TOURELLE ARRIÈRE', 'D / → : THROTTLE · A / ← : BRAKE · F : REAR TURRET'),
  dropColonists: t('C : LÂCHER LES COLONS', 'C : DROP THE COLONISTS'), dropFreight: t('X : LÂCHER LE FRET', 'X : DROP THE FREIGHT'),
  hull: t('BLINDAGE', 'HULL'), heat: t('CHALEUR', 'HEAT'), cooling: t('REFROIDISSEMENT', 'COOLING'), speed: t('VITESSE', 'SPEED'),
  trailer: freeze({ colonists: t('COLONS', 'COLONISTS'), freight: t('FRET', 'FREIGHT') }),
  queen: t('REINE', 'QUEEN'), bridgeClock: t('LE TABLIER CÈDE', 'THE DECK IS GIVING WAY'),
  radio: freeze({
    depart: t('Cal : « On roule. Deux remorques derrière, je ne fais pas de miracle en montée. »', 'Cal: "We’re rolling. Two trailers behind, I can’t work miracles uphill."'),
    wave: t('Rook : « Contacts sur l’arrière, ils remontent la route ! »', 'Rook: "Contacts on our six, coming up the road!"'),
    strain: t('Cal : « Je ne passe pas avec les deux ! Lâchez-en une, maintenant ! »', 'Cal: "I can’t make it with both! Drop one, now!"'),
    collapse: t('Le tablier s’effondre derrière le convoi.', 'The deck collapses behind the convoy.'),
    crossed: t('Cal : « Rive nord. Le pont n’existe plus. »', 'Cal: "North bank. The bridge is gone."'),
    blocked: t('Rook : « Ils s’arrêtent sur la remorque. On gagne du terrain. »', 'Rook: "They’ve stopped on the trailer. We’re gaining ground."'),
    arrival: t('Les murs de Port-Méridien en vue. Le convoi ralentit.', 'Port-Méridien’s walls in sight. The convoy slows down.'),
    chase: t('Vega : « Elle nous suit. Gardez la tourelle sur elle. »', 'Vega: "She’s following us. Keep the turret on her."'),
    lunge: t('La Reine bondit sur l’arrière du convoi.', 'The Queen leaps at the rear of the convoy.'),
    feeding: t('La Reine s’acharne sur la remorque abandonnée.', 'The Queen tears into the abandoned trailer.'),
    stand: t('Cal : « Carrefour du port. On s’arrête ici : elle ne passera pas. »', 'Cal: "Port junction. We stop here: she won’t get past."'),
    killed: t('La Reine du dépôt s’effondre sur la route.', 'The depot Queen collapses on the road.'),
    torn: t('Une remorque est arrachée de l’attelage.', 'A trailer is torn from its coupling.')
  }),
  fail: freeze({ bridge: t('Le M577 a basculé avec le tablier.', 'The M577 went down with the deck.'), hull: t('M577 détruit sur la route du port.', 'M577 destroyed on the port road.') })
});
