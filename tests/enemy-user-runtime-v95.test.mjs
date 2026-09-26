import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_STATIC_POSES_V94 } from '../src/enemy-static-poses-v94.js';
import { ENEMY_USER_CREATIONS_V95 } from '../src/enemy-user-creations-v95.js';
import { ENEMY_STATIC_POSES_V95, ENEMY_STATIC_POSE_PATHS_V95, getEnemyStaticPoseV95, sanitizeEnemyStaticPoseStateV95 } from '../src/enemy-static-poses-v95.js';
import { ENEMY_STATIC_POSES_V96 as CURRENT_STATIC } from '../src/enemy-static-poses-v96.js';
import { ENEMY_USER_CAMPAIGN_V88, ENEMY_ENCYCLOPEDIA_CATALOG_V88, isUserCasteCampaignAdmittedV95,
  getEnemyUserCampaignV88, sanitizeUserCasteCampaignV88, selectUserCasteEncountersV88, userCasteStaticVisualV88 } from '../src/enemy-user-campaign-v88.js';
import { createUserCampaignActorV88, withUserCasteCampaignV88 } from '../src/enemy-user-campaign-runtime-v88.js';
import { createUserCasteActorV87, drawUserCastePoseV87, updateUserCasteActorV87,
  getUserPoseHabitatV95, moveUserPoseWithinHabitatV95, setUserCasteVisualStateV95,
  getUserPoseVisibleBoundsV95, getUserPoseHabitatLimitsV95, isUserPoseInsideHabitatV95, confineUserPoseToHabitatV95 } from '../src/enemy-user-pose-runtime-v87.js';
import { createBioforgeV80, startBioforgeSessionV80, sanitizeBioforgeV80, getBioforgeRosterEntryV80,
  validateBioforgeCompositionV87, buildBioforgePrintQueueV80 } from '../src/bioforge-session-v80.js';
import { createBioforgeLevelV80, placeBioforgeSpecimenV80 } from '../src/bioforge-level-v80.js';
import { captureBioforgePhysicalV87, restoreBioforgeEnemyPhysicalV87 } from '../src/bioforge-physical-state-v87.js';
import { WORLDS, CAMPAIGNS, ENEMIES, LEVEL_SEEDS, WEAPONS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { GameEngine } from '../src/game-production-runtime.js';

const noop = () => {};
globalThis.addEventListener = noop;
globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class {
  complete = true; naturalWidth = 1024; naturalHeight = 2048;
  set src(path) {
    this.currentSrc = path;
    const pose = ENEMY_STATIC_POSES_V95.flatMap(d => [d, ...(d.states || [])]).find(d => d.path === path);
    if (pose) { this.naturalWidth = pose.sourceWidth; this.naturalHeight = pose.sourceHeight; }
  }
  get src() { return this.currentSrc; }
};

function fixture() {
  const draws = [], events = [];
  const ctx = new Proxy({ drawImage: (...args) => draws.push(args), measureText: text => ({ width: String(text).length * 8 }) },
    { get: (target, key) => target[key] ?? noop });
  const engine = new GameEngine({ width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop },
    { onEvent: event => events.push(event) });
  return { engine, ctx, draws, events };
}

function optionsFor(definition, templateId = definition.locomotion === 'aquatic' ? 'planet-exterior' : 'colony-multiroute') {
  const campaignDefinition = getEnemyUserCampaignV88(definition.id);
  const world = WORLDS.find(candidate => candidate.id === campaignDefinition.encounterWorldIds[0]);
  const campaign = CAMPAIGNS.find(candidate => candidate.worldId === world.id && !/survival|prologue/i.test(candidate.id)) || CAMPAIGNS[0];
  const eligible = ENEMY_USER_CAMPAIGN_V88.filter(entry => entry.automaticEncounter && entry.encounterWorldIds.includes(world.id));
  const seed = eligible.findIndex(entry => entry.id === definition.id);
  const plan = buildMissionLevelV52({ world, campaign, levelSeeds: LEVEL_SEEDS, templateId, variant: 0 });
  return { userCasteCampaignV88: true, operationId: 'operation-0-v95-test', world, campaign, seed,
    enemyCatalog: ENEMIES, weapon: WEAPONS[0], difficulty: 'standard',
    levelSeed: { ...plan.levelSeed, seed }, missionLevel: plan };
}

test('V95 is append-only, one biological identity per parent, with strict lookups', () => {
  assert.ok(ENEMY_USER_CREATIONS_V95.length > 0);
  assert.equal(ENEMY_STATIC_POSES_V95.length, 43 + ENEMY_USER_CREATIONS_V95.length);
  for (let index = 0; index < 43; index++) assert.equal(ENEMY_STATIC_POSES_V95[index], ENEMY_STATIC_POSES_V94[index]);
  assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.length, 571 + CURRENT_STATIC.length);
  for (const definition of ENEMY_USER_CREATIONS_V95) {
    assert.equal(getEnemyStaticPoseV95(definition.id), definition);
    assert.equal(getEnemyStaticPoseV95(definition.id, 'foreign'), definition);
    assert.equal(getEnemyStaticPoseV95(' ' + definition.id), null);
    assert.equal(getBioforgeRosterEntryV80(definition.id).profileId, definition.id);
    assert.equal(getBioforgeRosterEntryV80(definition.id).terrestrial, definition.locomotion === 'ground');
    assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.filter(entry => entry.id === definition.id).length, 1);
  }
  assert.equal(getEnemyStaticPoseV95('__proto__'), null);
});

test('new campaign identities need explicit approved locomotion/group; no unknown fallback or forged factory', () => {
  const admitted = ENEMY_USER_CREATIONS_V95.find(d => d.locomotion === 'ground');
  assert.ok(admitted);
  for (const foreign of [null, { ...admitted, id: 'pose-v95-user-unknown' }, { ...admitted, automaticEncounter: false },
    { ...admitted, encounterGroup: 'unknown' }, { ...admitted, locomotion: 'teleport' },
    { ...admitted, locomotion: 'aquatic', encounterGroup: 'crossover' }]) assert.equal(isUserCasteCampaignAdmittedV95(foreign), false);
  assert.equal(createUserCampaignActorV88({ ...admitted, id: 'foreign' }, { x: 1, y: 1, h: 20 }, 0), null);
  const mission = getEnemyUserCampaignV88(admitted.id), previous = { x: 100, y: 500, h: 100, alive: false, dormant: true, levelSpawnId: 'authored-wave' };
  const actor = createUserCampaignActorV88({ ...mission, health: 999999 }, previous, 0);
  assert.equal(actor.health, admitted.health);
  assert.equal(actor.alive, false); assert.equal(actor.dormant, true); assert.equal(actor.levelSpawnId, 'authored-wave');
  assert.equal(sanitizeUserCasteCampaignV88({ schema: 88, worldId: mission.encounterWorldIds[0], entries: [
    { profileId: 'foreign', slot: 0 }, { profileId: mission.id, slot: 1, visualStateV95: 'foreign' }
  ] }).entries.length, 1);
});

test('native complete PNG drawing uses each admitted state dimensions and unchanged parent identity', () => {
  for (const definition of ENEMY_USER_CREATIONS_V95) {
    for (const stateId of [null, ...(definition.states || []).map(state => state.stateId || state.id)]) {
      const pose = getEnemyStaticPoseV95(definition.id, stateId);
      const actor = createUserCasteActorV87({ id: 'test', profileId: definition.id, visualStateV95: stateId }, 620);
      const calls = [];
      const ctx = Object.fromEntries(['save', 'restore', 'translate', 'scale', 'drawImage'].map(key => [key, (...args) => calls.push([key, ...args])]));
      const image = { complete: true, naturalWidth: pose.sourceWidth, naturalHeight: pose.sourceHeight };
      assert.equal(drawUserCastePoseV87(ctx, actor, image), true);
      const draw = calls.find(call => call[0] === 'drawImage');
      assert.deepEqual(calls.find(call => call[0] === 'translate').slice(1),
        [actor.x + actor.w / 2, actor.y + actor.h * (pose.groundContact === false ? .5 : 1)]);
      assert.equal(draw.length, 6, 'whole image with 4 geometry arguments, not sliced atlas');
      assert.equal(draw[4], pose.renderWidth); assert.equal(draw[5], pose.renderHeight);
      assert.equal(actor.profileId, definition.id); assert.equal(actor.visualImageKey, pose.imageKey);
      assert.equal(userCasteStaticVisualV88(definition.id, stateId).path, pose.path);
      assert.ok(ENEMY_STATIC_POSE_PATHS_V95.includes(pose.path));
    }
  }
});

test('swept free movement respects thin blockers and the entire habitat body', () => {
  const volume = { x: 0, y: 0, w: 400, h: 200 };
  const actor = { x: 10, y: 50, w: 30, h: 30 };
  const engine = { walls: [{ x: 100, y: 0, w: 1, h: 200 }] };
  assert.equal(moveUserPoseWithinHabitatV95(engine, actor, volume, 500, 0), true);
  assert.ok(actor.x + actor.w <= 100);
  moveUserPoseWithinHabitatV95({}, actor, volume, -500, 500);
  assert.ok(actor.x >= 0 && actor.y + actor.h <= 200);
  const outside = { x: -1, y: 0, w: 20, h: 20 };
  assert.equal(moveUserPoseWithinHabitatV95({}, outside, volume, 10, 10), false);
  assert.equal(outside.x, -1);
});

test('Carrier Full remains one charged identity without an invented empty state', () => {
  const carrier = ENEMY_USER_CREATIONS_V95.find(entry => entry.sourceNumber === 52);
  assert.ok(carrier);
  assert.equal(carrier.id, 'pose-v95-user-xeno-carrier');
  assert.equal(carrier.defaultStateId, 'full');
  assert.equal(carrier.baseStateLabel, 'Chargé');
  assert.equal(carrier.states.length, 0);
  assert.equal(sanitizeEnemyStaticPoseStateV95(carrier.id, 'empty'), null);
  assert.equal(getEnemyStaticPoseV95(carrier.id, 'empty').path, carrier.path);
  assert.equal(ENEMY_USER_CREATIONS_V95.some(entry => entry.sourceNumber === 51), false);
});

test('ordinary Ceto FRONTIER deployment reaches water without a QA template override', () => {
  const world = WORLDS.find(entry => entry.id === 'world-10-ceto');
  const campaign = CAMPAIGNS.find(entry => entry.worldId === world.id && entry.mode === 'FRONTIER');
  const plan = buildMissionLevelV52({ world, campaign, levelSeeds: LEVEL_SEEDS });
  assert.equal(plan.templateId, 'planet-exterior');
  assert.ok(plan.aquaticHabitats.some(volume => volume.active && volume.kind === 'water'));
  const legacy = buildMissionLevelV52({ world, campaign, levelSeeds: LEVEL_SEEDS, templateId: 'colony-multiroute' });
  assert.equal(legacy.templateId, 'colony-multiroute'); assert.equal(legacy.aquaticHabitats.length, 0);
});

test('source 50 Brute uses the admitted massive grounded body, not a flying fallback', () => {
  const brute = ENEMY_USER_CREATIONS_V95.find(entry => entry.sourceNumber === 50);
  assert.ok(brute);
  assert.equal(brute.locomotion, 'ground');
  assert.equal(brute.bodyWidth, 112); assert.equal(brute.bodyHeight, 105);
  assert.equal(brute.health, 290); assert.equal(brute.damage, 24);
  const actor = createUserCasteActorV87({ id: 'brute-proof', profileId: brute.id }, 620);
  assert.equal(actor.y + actor.h, 620);
  assert.equal(actor.visualImageKey, brute.imageKey);
});

for (const definition of ENEMY_USER_CREATIONS_V95) test(`${definition.id}: actual production placement, fixed PNG, population and restart`, () => {
  const options = optionsFor(definition), baseline = fixture(), live = fixture();
  baseline.engine.start({ ...options, userCasteCampaignV88: false });
  live.engine.start(options);
  const actors = live.engine.enemies.filter(enemy => enemy.campaignCasteV88), actor = actors.find(enemy => enemy.profileId === definition.id);
  assert.ok(actor, 'admitted pose is reached by an ordinary contextual seed');
  assert.ok(actors.length <= 2); assert.equal(live.engine.enemies.length, baseline.engine.enemies.length);
  assert.equal(actor.w, definition.bodyWidth); assert.equal(actor.h, definition.bodyHeight);
  if (definition.locomotion === 'aquatic') {
    const volume = getUserPoseHabitatV95(live.engine, actor);
    assert.ok(volume && actor.x >= volume.x && actor.y >= volume.y);
    assert.ok(actor.x + actor.w <= volume.x + volume.w && actor.y + actor.h <= volume.y + volume.h);
    const dry = fixture(); dry.engine.start(optionsFor(definition, 'colony-multiroute'));
    assert.equal(dry.engine.enemies.some(enemy => enemy.profileId === definition.id), false, 'no dry-land aquatic fallback');
  }
  if (actor.alive) {
    live.draws.length = 0; live.engine.drawEnemy(live.ctx, actor);
    assert.ok(live.draws.some(call => call[0].currentSrc === definition.path && call.length === 5));
  }
  const snapshot = live.engine.captureResumeState(), restored = fixture();
  restored.engine.start({ ...options, resumeState: snapshot });
  assert.equal(restored.engine.enemies.length, live.engine.enemies.length);
  const resumed = restored.engine.enemies.find(enemy => enemy.profileId === definition.id);
  assert.ok(resumed); assert.equal(resumed.health, actor.health); assert.equal(resumed.dormant, actor.dormant);
  if (['flying', 'aquatic'].includes(definition.locomotion)) {
    assert.equal(resumed.x, actor.x); assert.equal(resumed.y, actor.y, 'restore must not snap a volume actor to ground');
    const habitat = getUserPoseHabitatV95(restored.engine, resumed);
    assert.ok(habitat && resumed.x >= habitat.x && resumed.y >= habitat.y
      && resumed.x + resumed.w <= habitat.x + habitat.w && resumed.y + resumed.h <= habitat.y + habitat.h);
    restored.engine.updateEnemy(resumed, .016);
    assert.notEqual(resumed.habitatBlockedV95, true);
  }
});

for (const definition of ENEMY_USER_CREATIONS_V95.filter(d => ['flying', 'aquatic'].includes(d.locomotion))) {
  test(`${definition.id}: real 2D locomotion, constrained habitat, no dormant update`, () => {
    const actor = createUserCasteActorV87({ id: 'test', profileId: definition.id }, 500);
    Object.assign(actor, { x: 100, y: 180, habitatIdV95: 'water' });
    const volume = { id: 'water', kind: 'water', active: true, x: 0, y: 100, w: 1000, h: 500 };
    const engine = { player: { x: 800, y: 380, w: 40, h: 80, alive: true }, missionLevelBounds: { width: 1000, height: 700 },
      missionLevelRuntime: { aquaticHabitats: [volume] }, damagePlayer: noop, hostileProjectiles: [], spawnEnemyProjectile: noop };
    const start = { x: actor.x, y: actor.y };
    updateUserCasteActorV87(engine, actor, .1);
    assert.ok(actor.x > start.x && actor.y > start.y, 'actual horizontal and vertical velocity');
    actor.dormant = true;
    const dormant = { x: actor.x, y: actor.y, clock: actor.attackClock };
    updateUserCasteActorV87(engine, actor, .1);
    assert.deepEqual({ x: actor.x, y: actor.y, clock: actor.attackClock }, dormant);
    if (definition.locomotion === 'aquatic') {
      actor.dormant = false; delete actor.habitatIdV95;
      updateUserCasteActorV87(engine, actor, .1);
      assert.equal(actor.habitatBlockedV95, true); assert.equal(actor.vx, 0); assert.equal(actor.vy, 0);
      assert.equal(createUserCampaignActorV88(getEnemyUserCampaignV88(definition.id), { x: 0, y: 0, h: 40 }, 0), null);
    }
    const placed = placeBioforgeSpecimenV80(actor, 0, createBioforgeLevelV80());
    assert.ok(placed.y + placed.h < placed.groundY, 'not terrestrial feet placement');
  });
}

for (const definition of ENEMY_USER_CREATIONS_V95.filter(d => d.locomotion === 'aquatic')) {
  const assertVisible = (actor, water) => {
    assert.ok(isUserPoseInsideHabitatV95(actor, water));
    for (const facing of [-1, 1]) {
      const bounds = getUserPoseVisibleBoundsV95(actor, facing), epsilon = 1e-8;
      assert.ok(bounds.x >= water.x - epsilon && bounds.y >= water.y - epsilon);
      assert.ok(bounds.x + bounds.w <= water.x + water.w + epsilon && bounds.y + bounds.h <= water.y + water.h + epsilon);
    }
  };
  test(`${definition.id}: alpha silhouette stays in water at all four edges and either facing`, () => {
    const actor = createUserCasteActorV87({ id: 'edges', profileId: definition.id }, 600);
    const water = { id: 'water', kind: 'water', active: true, x: 100, y: 400, w: 700, h: 136 };
    const limits = getUserPoseHabitatLimitsV95(actor, water);
    assert.ok(limits && limits.minY > water.y && limits.maxY < water.y + water.h - actor.h);
    for (const [x, y, dx, dy] of [[limits.minX, limits.minY, -500, -500], [limits.maxX, limits.minY, 500, -500],
      [limits.minX, limits.maxY, -500, 500], [limits.maxX, limits.maxY, 500, 500]]) {
      Object.assign(actor, { x, y });
      assert.equal(moveUserPoseWithinHabitatV95({}, actor, water, dx, dy), true);
      assert.deepEqual({ x: actor.x, y: actor.y }, { x, y });
      assertVisible(actor, water);
      actor.facing *= -1; assertVisible(actor, water);
    }
    const shallow = { ...water, h: actor.h + 1 };
    assert.equal(getUserPoseHabitatLimitsV95(actor, shallow), null);
    assert.equal(confineUserPoseToHabitatV95(actor, shallow), false);
    assert.equal(createUserCampaignActorV88(getEnemyUserCampaignV88(definition.id), { x: 0, y: 0, h: 40 }, 0, {}, { habitat: shallow }), null);
    const shifted = { ...actor, x: water.x, y: water.y };
    assert.equal(moveUserPoseWithinHabitatV95({}, shifted, water, 1, 1), false, 'invalid silhouette cannot continue outside water');
    assert.equal(confineUserPoseToHabitatV95(shifted, water), true); assertVisible(shifted, water);
  });
  test(`${definition.id}: real campaign spawn and legacy edge save resume constrain the visible silhouette`, () => {
    const options = optionsFor(definition), live = fixture(); live.engine.start(options);
    const actor = live.engine.enemies.find(entry => entry.profileId === definition.id);
    const water = getUserPoseHabitatV95(live.engine, actor); assertVisible(actor, water);
    const snapshot = live.engine.captureResumeState(), saved = snapshot.enemies.find(entry => entry.profileId === definition.id);
    Object.assign(saved, { x: water.x, y: water.y });
    const next = fixture(); next.engine.start({ ...options, resumeState: snapshot });
    const resumed = next.engine.enemies.find(entry => entry.profileId === definition.id);
    assertVisible(resumed, getUserPoseHabitatV95(next.engine, resumed));
    assert.ok(resumed.x > saved.x && resumed.y > saved.y, 'old collider-only water placement migrates inside the measured silhouette');
  });
}

for (const definition of ENEMY_USER_CREATIONS_V95.filter(d => d.states?.length)) test(`${definition.id}: visual state queue and physical save keep a single parent`, () => {
  const stateId = definition.states[0].stateId || definition.states[0].id;
  const selection = { composition: [{ lineId: 'one', profileId: definition.id, quantity: 1, visualStateV95: stateId }], maxConcurrent: 1 };
  assert.equal(validateBioforgeCompositionV87(selection).composition[0].visualStateV95, stateId);
  const queue = buildBioforgePrintQueueV80({ sessionId: 'bioforge-v80-s000000001', ...selection });
  assert.equal(queue.length, 1); assert.equal(queue[0].visualStateV95, stateId);
  const started = startBioforgeSessionV80(createBioforgeV80(), selection, { now: 100 });
  assert.equal(sanitizeBioforgeV80(JSON.parse(JSON.stringify(started.state))).activeSession.queue[0].visualStateV95, stateId);
  const actor = createUserCasteActorV87(queue[0], 620); actor.x = 1700;
  const player = { x: 1350, y: 528, w: 42, h: 92, vx: 0, vy: 0, facing: 1, health: 100, maxHealth: 100,
    armor: 0, maxArmor: 100, ammo: 3, ammoReserve: 9, magazineSize: 12, weaponMode: 'sidearm', alive: true, grounded: true };
  const captured = captureBioforgePhysicalV87({ player, enemies: [actor], inventory: {} });
  assert.ok(captured); assert.equal(captured.enemies[0].visualStateV95, stateId);
  const restored = createUserCasteActorV87(queue[0], 620);
  assert.ok(restoreBioforgeEnemyPhysicalV87(restored, captured.enemies[0]));
  assert.equal(restored.profileId, definition.id); assert.equal(restored.visualStateV95, stateId);
  setUserCasteVisualStateV95(restored, 'not-an-admitted-state');
  assert.equal(restored.visualImageKey, definition.imageKey); assert.equal(restored.visualStateV95, null);
  assert.equal(sanitizeEnemyStaticPoseStateV95(definition.id, '__proto__'), null);
});
