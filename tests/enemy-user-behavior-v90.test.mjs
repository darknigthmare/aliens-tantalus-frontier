import { ENEMY_STATIC_POSES_V96 as CURRENT_STATIC } from '../src/enemy-static-poses-v96.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, ENEMIES, LEVEL_SEEDS, WEAPONS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { ENEMY_USER_CAMPAIGN_V88, USER_CASTE_BEHAVIORS_V90, selectUserCasteEncountersV88 } from '../src/enemy-user-campaign-v88.js';
import { sanitizeOperationResumeState, recordOperationResumeState, SaveSystem, migrateSave } from '../src/save.js';
import { largeMissionActorFitsV72 } from '../src/mission-large-actor-placement-v72.js';

const noop = () => {};
globalThis.addEventListener = noop; globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class {
  complete = true; naturalWidth = 1024; naturalHeight = 2048;
  set src(value) { this.currentSrc = this._src = value;
    const definition = ENEMY_USER_CAMPAIGN_V88.find(entry => entry.path === value);
    if (definition) {
      this.naturalWidth = definition.sourceWidth;
      this.naturalHeight = definition.sourceHeight;
    }
  }
  get src() { return this._src; }
};
const definitions = Object.keys(USER_CASTE_BEHAVIORS_V90).map(b => ENEMY_USER_CAMPAIGN_V88.find(d => d.basename === b));
const [queen, runner] = definitions;
function optionsFor(d, mission = false) {
  const world = WORLDS.find(w => w.id === d.encounterWorldIds[0]);
  const campaign = CAMPAIGNS.find(c => c.worldId === world.id && !/survival|prologue/i.test(c.id)) || CAMPAIGNS[0];
  const seed = ENEMY_USER_CAMPAIGN_V88.filter(e => e.encounterWorldIds.includes(world.id)).findIndex(e => e.id === d.id);
  const plan = buildMissionLevelV52({ world, campaign, levelSeeds: LEVEL_SEEDS, templateId: 'colony-multiroute', variant: 0 });
  return { userCasteCampaignV88: true, operationId: 'operation-0-v90-test', world, campaign, seed,
    enemyCatalog: ENEMIES, weapon: WEAPONS[0], difficulty: 'standard', levelSeed: { ...plan.levelSeed, seed },
    ...(mission ? { missionLevel: plan } : {}) };
}
function fixture(d = queen, { resume, mission = false, gap = d === queen ? 300 : 65 } = {}) {
  const events = [], draws = [], ctx = new Proxy({ measureText: s => ({ width: String(s).length * 8 }),
    fillText: text => draws.push(text), createLinearGradient: () => ({ addColorStop: noop }) }, { get: (o, k) => o[k] ?? noop });
  const engine = new GameEngine({ width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop }, { onEvent: e => events.push(e) });
  const options = optionsFor(d, mission); engine.start({ ...options, ...(resume ? { resumeState: resume } : {}) });
  const actor = engine.enemies.find(e => e.profileId === d.id); assert.ok(actor, d.id + ' actually spawned');
  if (!mission) {
    engine.walls = []; engine.doors = []; engine.covers = [];
    engine.platforms = [{ id: 'test-floor', x: 0, y: 930, w: 5000, h: 40 }];
    if (!resume) {
      Object.assign(actor, { x: 1000, y: 930 - actor.h, spawnX: 1000, staggerClock: 0 });
      Object.assign(engine.player, { x: actor.x + actor.w / 2 + gap - engine.player.w / 2,
        y: 930 - engine.player.h, armor: 0, health: 100, maxHealth: 100, inCover: false, grounded: true });
      actor.userCasteCombatV89.clock = 0;
    }
  }
  return { engine, actor, d, options, events, draws, ctx };
}
function advance(f, seconds, effects = false, step = .05) {
  for (let elapsed = 0; elapsed < seconds - 1e-9; elapsed += step) {
    const dt = Math.min(step, seconds - elapsed);
    if (effects) f.engine.updateHostileProjectiles(dt); else f.engine.updateEnemy(f.actor, dt);
  }
}
const count = (f, type) => f.events.filter(e => e.type === type).length;
function arm(f) { f.engine.updateEnemy(f.actor, .01); assert.equal(f.actor.userCasteCombatV89.phase, 'windup'); }
function launch(f) { arm(f); advance(f, f.d.behaviorContractV90.windup + .001); }
function roundtrip(f) {
  const memory = new Map(), storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const writer = new SaveSystem(storage);
  writer.data.strategy.currentOperation = { id: f.options.operationId, campaignId: f.options.campaign.id, worldId: f.options.world.id,
    seed: f.options.seed, levelSeedId: f.options.levelSeed.id, status: 'deployed', crewIds: [], difficulty: 'standard' };
  assert.equal(recordOperationResumeState(writer.data, f.engine.captureResumeState()), true); assert.ok(writer.commit());
  const reader = new SaveSystem(storage); reader.load();
  const raw = migrateSave(JSON.parse(JSON.stringify(reader.data))).strategy.currentOperation.resumeState;
  const resumed = fixture(f.d, { resume: raw }); assert.equal(resumed.engine.lastResumeResult.applied, true);
  assert.equal(resumed.actor.id, f.actor.id); assert.equal(resumed.actor.health, f.actor.health);
  assert.deepEqual(resumed.actor.userCasteCombatV89, f.actor.userCasteCombatV89);
  assert.deepEqual(resumed.engine.userCasteEffectsV89, f.engine.userCasteEffectsV89);
  return resumed;
}

test('two V90 partial contracts survive admitted roster extensions; legacy V89, contextual budget and royal cap remain unchanged', () => {
  assert.equal(ENEMY_USER_CAMPAIGN_V88.length, CURRENT_STATIC.length);
  assert.equal(ENEMY_USER_CAMPAIGN_V88.filter(d => d.specializedBehaviorV89).length, 3);
  assert.equal(ENEMY_USER_CAMPAIGN_V88.filter(d => d.specializedBehaviorV90).length, 2);
  for (const d of definitions) {
    assert.equal(d.canonExact, false); assert.equal(d.specializedBehaviorStatus, 'source-grounded-partial-v90');
    assert.match(d.path, new RegExp('/user/castes-v87/' + d.basename + '\\.png$'));
    assert.match(d.specializedBehaviorV90.sourceUrls[0], /^https:\/\/www\.aliensfireteamelite\.com\//);
    assert.match(d.specializedBehaviorV90.adaptationNote, /Pose fixe, animations manquantes/);
    const options = optionsFor(d), selection = selectUserCasteEncountersV88(options);
    assert.deepEqual(selectUserCasteEncountersV88(options), selection);
    assert.ok(selection.length <= 2); assert.ok(selection.filter(e => e.caste === 'royal').length <= 1);
    const f = fixture(d, { mission: true });
    assert.ok(largeMissionActorFitsV72(f.actor, { platforms: f.engine.platforms, doors: f.engine.doors, ...f.engine.missionLevelBounds }));
  }
});

for (const d of definitions) test(d.basename + ': telegraph freezes on pause/loading/nonpositive delta; death cancels including real save', () => {
  const f = fixture(d); arm(f); f.engine.drawEnemy(f.ctx, f.actor); assert.ok(f.draws.includes(d.behaviorContractV90.label));
  const state = structuredClone(f.actor.userCasteCombatV89);
  f.engine.paused = true; advance(f, 1); f.engine.paused = false;
  f.engine.userCasteLoadingV88 = true; advance(f, 1); f.engine.userCasteLoadingV88 = false;
  f.engine.updateEnemy(f.actor, 0); f.engine.updateEnemy(f.actor, -.1);
  assert.deepEqual(f.actor.userCasteCombatV89, state); assert.equal(f.engine.player.health, 100);
  f.engine.defeatEnemy(f.actor, f.engine.player); const resumed = roundtrip(f); advance(resumed, 4);
  assert.equal(resumed.actor.alive, false); assert.equal(count(resumed, 'user-caste-impact-v89'), 0);
  assert.equal(resumed.engine.userCasteEffectsV89.length, 0);
});

test('Queen physical cluster: three distinct trajectories, delayed impacts once per shard, no invented pool', () => {
  const f = fixture(); launch(f);
  assert.equal(f.engine.player.health, 100); assert.equal(f.engine.userCasteEffectsV89.length, 3);
  assert.deepEqual(f.engine.userCasteEffectsV89.map(e => e.shotIndex), [0, 1, 2]);
  assert.equal(new Set(f.engine.userCasteEffectsV89.map(e => e.vx)).size, 3);
  const before = structuredClone(f.engine.userCasteEffectsV89);
  f.engine.paused = true; advance(f, .2, true); f.engine.paused = false;
  f.engine.updateHostileProjectiles(0); f.engine.updateHostileProjectiles(-1);
  assert.deepEqual(f.engine.userCasteEffectsV89, before);
  const hits = []; f.engine.damagePlayer = (target, damage) => hits.push({ target, damage });
  advance(f, 1.1, true); assert.equal(count(f, 'user-caste-glob-detonated-v89'), 3);
  assert.equal(hits.length, 1, 'Only central shard overlaps this target, not three duplicated damage callbacks');
  assert.equal(hits[0].damage, f.actor.damage * queen.behaviorContractV90.damageScale);
  assert.equal(f.engine.userCasteEffectsV89.length, 0);
  advance(f, 3, true); assert.equal(hits.length, 1);
});

for (const phase of ['windup', 'flight', 'spent']) test('Queen real record/commit/load/migrate/apply: ' + phase, () => {
  const f = fixture(); arm(f); advance(f, phase === 'windup' ? .3 : queen.behaviorContractV90.windup + .001);
  if (phase === 'flight') advance(f, .35, true);
  if (phase === 'spent') advance(f, 1.1, true);
  const resumed = roundtrip(f);
  if (phase === 'windup') { advance(resumed, resumed.actor.userCasteCombatV89.clock + .001); assert.equal(resumed.engine.userCasteEffectsV89.length, 3); }
  if (phase === 'windup' || phase === 'flight') {
    advance(resumed, 1.1, true); assert.equal(count(resumed, 'user-caste-glob-detonated-v89'), 3);
    const again = roundtrip(resumed); advance(again, .2); advance(again, 1.1, true);
    assert.equal(count(again, 'user-caste-glob-detonated-v89'), 0);
  } else { advance(resumed, 2, true); assert.equal(count(resumed, 'user-caste-glob-detonated-v89'), 0); }
});

test('Queen volley cancellation respects existing barriers and swept collision against a newly closed thin door', () => {
  const f = fixture(); const barrier = { id: 'barrier', x: f.actor.x + f.actor.w + 20, y: 500, w: 1, h: 430, progress: 0, open: false };
  f.engine.doors = [barrier]; f.engine.getDoorRenderState = d => d;
  f.engine.updateEnemy(f.actor, .1); assert.equal(f.actor.userCasteCombatV89.phase, 'cooldown');
  f.engine.doors = []; launch(f); f.engine.doors = [barrier]; advance(f, 1.2, true);
  assert.equal(f.engine.player.health, 100); assert.equal(count(f, 'user-caste-glob-detonated-v89'), 0);
  assert.equal(f.engine.userCasteEffectsV89.length, 0);
});

test('Queen no partial volley at cap; individual shootdown consumes one bullet/shard without also damaging actor', () => {
  const f = fixture(); arm(f);
  f.engine.userCasteEffectsV89 = [0, 1].map(i => ({ kind: 'glob', ownerId: f.actor.id, x: 10, y: 10, vx: 0, vy: 0, life: 1, clock: 0, serial: 0, shotIndex: i }));
  advance(f, 1); assert.equal(f.engine.userCasteEffectsV89.length, 2);
  const g = fixture(); launch(g); const health = g.actor.health, glob = g.engine.userCasteEffectsV89[0];
  g.engine.bullets.push({ x: glob.x + 30, y: glob.y, vx: -600, w: 4, h: 4, damage: 999, life: 2, owner: g.engine.player });
  g.engine.updateBullets(.05); assert.equal(g.engine.userCasteEffectsV89.length, 2); assert.equal(g.actor.health, health);
  assert.equal(count(g, 'user-caste-glob-destroyed-v89'), 1); advance(g, 1.1, true);
  assert.equal(count(g, 'user-caste-glob-detonated-v89'), 2);
});

test('Queen corrupt/duplicate shards and mismatched save identities cannot multiply impacts or alter live state', () => {
  const f = fixture(); launch(f); advance(f, .2, true); const before = structuredClone(f.engine.userCasteEffectsV89);
  const wrong = f.engine.captureResumeState(); wrong.identity.worldId = 'foreign-world';
  assert.equal(f.engine.applyResumeState(wrong).applied, false); assert.deepEqual(f.engine.userCasteEffectsV89, before);
  const raw = f.engine.captureResumeState(); raw.userCasteEffectsV89.entries.push({ ...before[0] }, { ...before[0], shotIndex: 3 },
    { ...before[0], shotIndex: -1 }, { ...before[0], shotIndex: .5 }, { ...before[0], ownerId: 'foreign-actor' },
    { ...before[0], serial: before[0].serial + 1 }, { ...before[1], serial: before[1].serial + 1 });
  const resumed = fixture(queen, { resume: raw }); assert.deepEqual(resumed.engine.userCasteEffectsV89, before);
  advance(resumed, 1, true); assert.equal(count(resumed, 'user-caste-glob-detonated-v89'), 3);
});

test('Runner deterministic grounded gait is slower, contains a real pause, and is independent of frame partition', () => {
  const f = fixture(runner, { gap: 700 }), x = f.actor.x;
  const positions = []; for (let i = 0; i < 26; i++) { advance(f, .05); positions.push(f.actor.x); }
  const distances = positions.map((p, i) => p - (i ? positions[i - 1] : x));
  assert.ok(distances.some(n => n === 0)); assert.ok(new Set(distances.map(n => n.toFixed(4))).size >= 3);
  const expected = f.actor.speed * (.35 * .2 + .85 * .45 + .65 * .45);
  assert.ok(Math.abs(f.actor.x - x - expected) < 1e-6);
  assert.ok(f.actor.x - x < f.actor.speed * 1.3); assert.equal(f.actor.y + f.actor.h, 930);
  const g = fixture(runner, { gap: 700 }); advance(g, 1.3, false, .025);
  assert.ok(Math.abs(g.actor.x - f.actor.x) < 1e-6); assert.equal(g.actor.userCasteCombatV89.strideStep, 0);
});

test('Runner gait and real save resume keep remaining stride; paused/dead actors cannot creep', () => {
  const f = fixture(runner, { gap: 700 }); advance(f, .33); const state = structuredClone(f.actor.userCasteCombatV89), x = f.actor.x;
  f.engine.paused = true; advance(f, 1); f.engine.paused = false;
  f.engine.updateEnemy(f.actor, -.5); assert.equal(f.actor.x, x); assert.deepEqual(f.actor.userCasteCombatV89, state);
  const resumed = roundtrip(f); advance(f, .71); advance(resumed, .71);
  assert.ok(Math.abs(resumed.actor.x - f.actor.x) < 1e-6); assert.deepEqual(resumed.actor.userCasteCombatV89, f.actor.userCasteCombatV89);
  resumed.engine.defeatEnemy(resumed.actor, resumed.engine.player); const deadX = resumed.actor.x; advance(resumed, 2);
  assert.equal(resumed.actor.x, deadX);
});

test('Runner malformed stride or legacy absent state resets safely without immediate damage or borrowed identity', () => {
  for (const value of [undefined, { strideStep: 99 }, { strideStep: -1 }, { strideStep: 1.5 }, { strideClock: Infinity }, { strideClock: -.1 }, { strideClock: 999 }]) {
    const f = fixture(runner), raw = f.engine.captureResumeState(), saved = raw.enemies.find(e => e.id === f.actor.id);
    if (value === undefined) delete saved.userCasteCombatV89;
    else Object.assign(saved.userCasteCombatV89, value);
    const g = fixture(runner, { resume: sanitizeOperationResumeState(raw) });
    assert.equal(g.actor.userCasteCombatV89.phase, 'cooldown'); assert.equal(g.actor.userCasteCombatV89.strideStep, 0);
    assert.equal(g.actor.userCasteCombatV89.strideClock, 0); advance(g, .1); assert.equal(g.engine.player.health, 100);
    assert.equal(g.actor.profileId, runner.id);
  }
});

for (const d of definitions) test(d.basename + ': actual authored mission geometry, not fixture platforms', () => {
  const f = fixture(d, { mission: true }), platforms = f.engine.platforms;
  Object.assign(f.engine.player, { x: f.actor.x + f.actor.w / 2 - (d === queen ? 210 : 65) - f.engine.player.w / 2,
    y: f.actor.y + f.actor.h - f.engine.player.h, armor: 0, health: 100, maxHealth: 100, grounded: true });
  f.actor.userCasteCombatV89.clock = 0; arm(f); advance(f, d.behaviorContractV90.windup + .001);
  if (d === queen) advance(f, 1.1, true);
  assert.equal(f.engine.platforms, platforms); assert.ok(f.engine.player.health < 100);
  assert.ok(largeMissionActorFitsV72(f.actor, { platforms, doors: f.engine.doors, ...f.engine.missionLevelBounds }));
});

test('Runner uses real mission collision and rolls back when the supporting surface is absent', () => {
  const f = fixture(runner, { mission: true }), x = f.actor.x;
  Object.assign(f.engine.player, { x: x - 400, y: f.actor.y + f.actor.h - f.engine.player.h });
  const box = { x: x - 10, y: f.actor.y - 10, w: 4, h: f.actor.h + 20 };
  f.engine.walls.push(box); advance(f, 2);
  assert.ok(f.actor.x >= box.x + box.w, 'No crossing the blocking wall');
  assert.ok(f.actor.x <= x, 'No forward teleport from collision resolution');
  const g = fixture(runner, { mission: true }), previous = { x: g.actor.x, y: g.actor.y };
  Object.assign(g.engine.player, { x: g.actor.x - 400, y: g.actor.y + g.actor.h - g.engine.player.h });
  g.engine.platforms = []; g.engine.lifts = [];
  assert.equal(g.engine.moveEnemyOnMissionSurface(g.actor, g.actor.x - 5, .1), false);
  assert.equal(g.actor.x, previous.x); assert.equal(g.actor.y, previous.y);
});

test('Queen dead owner cannot arm another volley; its already launched physical shards remain single-use', () => {
  const f = fixture(); launch(f); f.engine.defeatEnemy(f.actor, f.engine.player);
  const resumed = roundtrip(f); advance(resumed, 4); advance(resumed, 1.1, true);
  assert.equal(count(resumed, 'user-caste-impact-v89'), 0);
  assert.equal(count(resumed, 'user-caste-glob-detonated-v89'), 3);
  assert.equal(resumed.engine.userCasteEffectsV89.length, 0); advance(resumed, 2, true);
  assert.equal(count(resumed, 'user-caste-glob-detonated-v89'), 3);
});

test('one Queen central shard hits each coop target once; shared vehicle takes one hit, not one per passenger', () => {
  const f = fixture(); const p = f.engine.player;
  f.engine.coopEnabled = true; f.engine.coop = { ...p, id: 'test-j2' }; const hits = [];
  f.engine.damagePlayer = (target, damage) => hits.push({ target, damage }); launch(f); advance(f, 1.1, true);
  assert.equal(hits.filter(h => h.target === p).length, 1); assert.equal(hits.filter(h => h.target === f.engine.coop).length, 1);
  const g = fixture(); g.engine.coopEnabled = true; g.engine.coop = { ...g.engine.player, id: 'test-j2', inVehicle: true };
  g.engine.player.inVehicle = true; g.engine.vehicle = { active: true, hull: 1000, x: g.engine.player.x, y: g.engine.player.y, w: 60, h: 50 };
  let vehicleHits = 0; g.engine.damageVehicle = () => vehicleHits++;
  launch(g); advance(g, 1.1, true); assert.equal(vehicleHits, 1);
});
