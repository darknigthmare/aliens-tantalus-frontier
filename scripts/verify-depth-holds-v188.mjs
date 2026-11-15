// V188 — spec 004: more mission holds in depth, built from data (depth-hold-sections-v188.js).
// Real production engine (engine-host-v188.mjs); positions are placed by injection where stated.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS } from '../src/content-core-v50.js';
import { buildMissionLevelV52, selectMissionTemplateV52 } from '../src/mission-levels-v52.js';
import { ALIEN_SURVIVAL_CAMPAIGN_V70 } from '../src/alien-survival-systems-v70.js';
import { buildCampaignsWithSpecialOperationsV67 } from '../src/special-operations-v67.js';
import { buildCargoHoldSectionV188, inDepthSectionV188, overDepthSectionV188, stepEnemyDepthV188, MISSION_ATTACK_BAND_V188, QZ17_CAMPAIGN_ID_V188 } from '../src/mission-depth-v188.js';
import { DEPTH_HOLD_DEFINITIONS_V188, DEPTH_HOLD_IDS_V188, DEPTH_HOLD_LANE_MIN_V188, depthLaneIssuesV188, depthPassageV188, holdWallFeaturesV188,
  hidesWallV188, resolveDepthHoldDefinitionV188, spansHoldDepthV188 } from '../src/depth-hold-sections-v188.js';
import { DEPTH_HOLD_SLOTS_V188, DEPTH_HOLD_SLOT_FILES_PRESENT_V188, drawDepthHoldSlotV188 } from '../src/depth-hold-slots-v188.js';
import { blockedByFootprintV188, depthShotSettleV188, DEPTH_SHOT_BAND_V188 } from '../src/hub-depth-rooms-v188.js';
import { qz17HoldLayoutV188 } from '../src/qz17-level-dressing-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const worldOf = campaign => WORLDS.find(world => world.id === campaign.worldId) || WORLDS[0];
const QZ17 = { id: QZ17_CAMPAIGN_ID_V188, templateId: 'ship-interior-vertical', worldId: 'world-05-lethe' };
// Procedural ship missions whose own template is the ship (the freighter hold), a few seeds apart.
const SHIP_PAIRS = CAMPAIGNS.filter(campaign => !campaign.specialOperationId && selectMissionTemplateV52({ campaign, world: worldOf(campaign) }) === 'ship-interior-vertical');
const FREIGHTERS = SHIP_PAIRS.filter((_, index) => index % Math.ceil(SHIP_PAIRS.length / 6) === 0);
const CARGO_BRUTAL = buildCampaignsWithSpecialOperationsV67([]).find(campaign => campaign.specialOperationId === 'cargo-brutal')
  || { id: 'special-cargo-brutal', specialOperationId: 'cargo-brutal', templateId: 'ship-interior-vertical', worldId: 'world-05-lethe' };

async function mission(campaign, { keepEnemies = false } = {}) {
  const world = worldOf(campaign);
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: campaign.templateId || null });
  const run = await fixture({ campaign, seed: 7, options: { world, missionLevel }, keepEnemies });
  const { engine } = run, section = engine.missionDepthSectionV188, p = engine.player;
  const place = (actor, x, z = 0) => { actor.x = x; actor.y = section.floorY - actor.h; actor.vy = 0; actor.grounded = true; actor.depthZ = z; };
  return { ...run, section, p, place };
}
function enemyFrom(engine, section, x, z, pick = () => true) {
  const enemy = engine.spawnedEnemiesV188.find(entry => pick(entry)) || engine.spawnedEnemiesV188[0];
  Object.assign(enemy, { alive: true, dormant: false, x, y: section.floorY - enemy.h, vy: 0, health: 500, maxHealth: 500, depthZ: z, attackClock: 99, rangedClock: 99, pendingMelee: false });
  engine.enemies = [enemy]; return enemy;
}
// An awake enemy (a sleeper forced awake keeps its other dormant flags) of a caste admitted between the objects.
const fit = enemy => enemy.alive !== false && !spansHoldDepthV188({ bigCastes: 'span' }, enemy);

test('holds: one definition per hold, chosen by campaign; cargo-brutal and colony missions stay 2D', async () => {
  assert.deepEqual(DEPTH_HOLD_IDS_V188, ['qz17-cargo-hold', 'freighter-cargo-hold', 'lethe-quarantine-hold']);
  assert.ok(FREIGHTERS.length >= 5, 'several procedural ship missions');
  for (const campaign of FREIGHTERS) assert.equal(resolveDepthHoldDefinitionV188({ campaign, world: worldOf(campaign) })?.id, 'freighter-cargo-hold', campaign.id);
  assert.equal(resolveDepthHoldDefinitionV188({ campaign: QZ17 })?.id, 'qz17-cargo-hold');
  assert.equal(resolveDepthHoldDefinitionV188({ campaign: ALIEN_SURVIVAL_CAMPAIGN_V70 })?.id, 'lethe-quarantine-hold');
  assert.equal(resolveDepthHoldDefinitionV188({ campaign: CARGO_BRUTAL }), null, 'the P-5000 corridor stays in 2D');
  const colony = CAMPAIGNS.find(campaign => !campaign.specialOperationId && selectMissionTemplateV52({ campaign, world: worldOf(campaign) }) === 'colony-multiroute');
  assert.equal(resolveDepthHoldDefinitionV188({ campaign: colony, world: worldOf(colony) }), null, 'no warehouse in the colony template');
  const brutal = await mission(CARGO_BRUTAL);
  assert.equal(brutal.section, null);
  assert.deepEqual(brutal.engine.cargoBrutalV67.obstacles.map(entry => entry.id), ['cargo-block-alpha', 'cargo-block-bravo', 'cargo-block-charlie'], 'loader obstacles unchanged');
  brutal.engine.keys.add('KeyS'); tick(brutal.engine, .2); assert.equal(brutal.engine.player.depthZ || 0, 0);
});

test('holds: footprints, sizes and lanes of every hold, on several generated levels', async () => {
  const runs = [await mission(QZ17), ...await Promise.all(FREIGHTERS.slice(0, 4).map(campaign => mission(campaign))), await mission(ALIEN_SURVIVAL_CAMPAIGN_V70)];
  const slots = new Map(DEPTH_HOLD_SLOTS_V188.map(entry => [entry.id, entry]));
  for (const { engine, section } of runs) {
    const label = `${engine.campaign.id} / ${section.id}`;
    const issues = depthLaneIssuesV188(section);
    if (section.id === 'qz17-cargo-hold') assert.deepEqual(issues, ['qz17-pallet: front lane 18'], 'QZ-17 is unchanged: its pallet leaves 18 units in front (spec 002, recorded)');
    else { assert.deepEqual(issues, [], `${label}: every object leaves a lane of ${DEPTH_HOLD_LANE_MIN_V188}`); assert.deepEqual(section.skipped, [], `${label}: every object found its place`); }
    const passage = depthPassageV188(section);
    assert.deepEqual([passage.westDoor, passage.eastDoor, passage.pockets], [true, true, 0], `${label}: both bulkheads reached, no trapped pocket`);
    const features = holdWallFeaturesV188(engine, section);
    for (const entry of section.containers) {
      assert.ok(entry.footprint.z1 <= -20, `${label}: ${entry.id} stays off the rail band`);
      assert.ok(entry.x >= section.x0 && entry.x + entry.w <= section.x1, `${label}: ${entry.id} inside the hold`);
      if (hidesWallV188(entry)) for (const feature of features) assert.ok(entry.x + entry.w <= feature.x0 || entry.x >= feature.x1, `${label}: ${entry.id} hides ${feature.id}`);
      if (entry.slot) assert.deepEqual([entry.w, entry.h], [slots.get(entry.slot).width, slots.get(entry.slot).height], `${label}: ${entry.id} at its slot size`);
    }
    if (section.id !== 'qz17-cargo-hold') assert.equal(section.containers.length, 3, `${label}: three floor objects`);
  }
});

test('holds: doors, ladders and interactions stay on the rail', async () => {
  for (const campaign of [FREIGHTERS[0], ALIEN_SURVIVAL_CAMPAIGN_V70]) {
    const { engine, section, p, place } = await mission(campaign);
    for (const door of engine.doors.filter(entry => entry.x + entry.w >= section.x0 - 1 && entry.x <= section.x1 + 1)) {
      const edge = door.x + door.w <= section.x0 + 1 ? section.x0 + 24 : section.x1 - 24;
      for (let z = -section.doorBand; z <= 0; z++) assert.equal(blockedByFootprintV188(section, edge, z, 18), false, `${door.id}: rail band free at z ${z}`);
    }
    for (const ladder of engine.ladders.filter(entry => entry.x + 42 > section.x0 && entry.x < section.x1 && entry.bottom >= section.floorY - 2)) {
      assert.equal(blockedByFootprintV188(section, ladder.x + 21, 0, 18), false, `${ladder.id} at the wall`);
    }
    place(p, section.x0 + 260, -60);
    assert.equal(engine.interact(p), false, 'nothing is reached from a front lane'); assert.equal(engine.getInteractionPrompt(p), '');
    place(p, section.x1 - p.w - 8, -40); engine.keys.add('KeyD'); tick(engine, .8); engine.keys.delete('KeyD');
    assert.ok(inDepthSectionV188(section, p), 'far from the wall, the airlock is out of reach');
    place(p, section.x1 - p.w - 8, -6); engine.keys.add('KeyW'); tick(engine, .2); engine.keys.delete('KeyW');
    assert.equal(p.depthZ, 0, 'W walks back to the rail');
  }
});

test('holds: shot band, settle and attack band in the freighter hold', async () => {
  const shoot = async (playerZ, enemyZ, gapX = 130, setup) => {
    const { engine, section, p, place } = await mission(FREIGHTERS[0]);
    place(p, section.x0 + 150, playerZ); p.facing = 1; p.vx = 0;
    // A standing caste (88 px): the 74 px stalking pose passes under a horizontal salvo in 2D already.
    const enemy = enemyFrom(engine, section, p.x + gapX, enemyZ, entry => !spansHoldDepthV188({ bigCastes: 'span' }, entry) && entry.h >= 80);
    enemy.speed = 1; setup?.(engine, section, p, enemy); // slowest depth step (40 units/s): the target cannot close in during the burst
    Object.assign(p, { alive: true, ammo: 99, ammoReserve: 400, reloading: false, fireClock: 0 });
    const before = enemy.health;
    for (let t = 0; t < .6; t += 1 / 60) { if (!(p.fireClock > 0)) engine.fire(p); tick(engine, 1 / 60); Object.assign(p, { alive: true, health: 100 }); }
    return { hit: enemy.health < before, p, enemy };
  };
  assert.equal((await shoot(-6, -12)).hit, true, 'inside the band');
  assert.equal((await shoot(-6, -6 - DEPTH_SHOT_BAND_V188 - 30)).hit, false, 'outside the band');
  const blocked = await shoot(-50, -50, 0, (engine, section, p, enemy) => {
    const stack = section.containers.find(entry => entry.id === 'freighter-stack-east'); p.x = stack.x - 120; enemy.x = stack.x + stack.w + 20;
  });
  assert.equal(blocked.hit, false, 'a crate stack stops the salvo in its band');
  assert.equal(depthShotSettleV188(-6, -26), -12);
  const { engine, section, p, place } = await mission(FREIGHTERS[0]);
  place(p, section.x0 + 300, -70); const enemy = enemyFrom(engine, section, p.x + 30, -10, fit), health = p.health;
  engine.depthAttackerV188 = enemy; engine.damagePlayer(p, 20); engine.depthAttackerV188 = null; assert.equal(p.health, health, 'out of band');
  enemy.depthZ = -70 + MISSION_ATTACK_BAND_V188; engine.depthAttackerV188 = enemy; engine.damagePlayer(p, 20); engine.depthAttackerV188 = null;
  assert.ok(p.health < health, 'in band');
});

test('holds: steered enemies reach the marine\'s band and never stand in a footprint; big castes span the depth', async () => {
  for (const campaign of [FREIGHTERS[1], FREIGHTERS[3]]) {
    const { engine, section, p, place } = await mission(campaign);
    place(p, section.x0 + 120, -76);
    const enemy = enemyFrom(engine, section, section.x1 - 140, -4, fit);
    enemy.speed = 90; let inside = 0;
    for (let n = 0; n < 240; n++) {
      enemy.x -= 1.2; // the rail physics move it along x; its depth step then walks it around the objects
      enemy.depthZ = stepEnemyDepthV188(section, enemy, p.depthZ, 1 / 60);
      // Rail crates covers are jumped by the rail physics, as in spec 002: only the floor objects steer.
      if (blockedByFootprintV188({ ...section, props: section.containers }, enemy.x + enemy.w / 2, enemy.depthZ, enemy.w / 2)) inside++;
      assert.ok(enemy.depthZ >= section.zMin && enemy.depthZ <= section.zMax);
    }
    assert.equal(inside, 0, `${section.id}: never inside an object`);
    assert.ok(Math.abs(enemy.depthZ - p.depthZ) <= MISSION_ATTACK_BAND_V188, `${section.id}: ends in the marine's band`);
    // In the running engine: an awake enemy on the floor follows Echo-9 and stays in the band.
    const chaser = enemyFrom(engine, section, p.x + 160, 0, fit); chaser.attackClock = 99;
    for (let n = 0; n < 90; n++) { tick(engine, 1 / 60); Object.assign(p, { alive: true, health: 100 }); place(p, section.x0 + 120, -76); }
    assert.ok(Math.abs(chaser.depthZ - p.depthZ) <= MISSION_ATTACK_BAND_V188, `${section.id}: the chaser reached the band`);
  }
  // The quarantine hold of the Node roster holds queens: they fill the depth, hit and are hit from every lane.
  const lethe = await mission(ALIEN_SURVIVAL_CAMPAIGN_V70);
  const queen = enemyFrom(lethe.engine, lethe.section, lethe.section.x0 + 260, -40, enemy => /queen/.test(enemy.id));
  assert.equal(lethe.engine.spansDepthV188(queen), true, 'a queen fills the depth of a spec-004 hold');
  lethe.place(lethe.p, lethe.section.x0 + 120, -76); tick(lethe.engine, 1 / 60);
  assert.equal(queen.depthZ, 0, 'not steered between the objects');
  const health = lethe.p.health; lethe.engine.depthAttackerV188 = queen; lethe.engine.damagePlayer(lethe.p, 10); lethe.engine.depthAttackerV188 = null;
  assert.ok(lethe.p.health < health, 'its blow lands in any lane');
  assert.ok(lethe.engine.depthTargetsV188(-76, () => lethe.engine.enemies.includes(queen)), 'and any lane can shoot it');
  const qz = await mission(QZ17); assert.equal(qz.engine.spansDepthV188({ id: 'queen', w: 336 }), false, 'QZ-17 keeps its own rule (service deck)');
});

test('holds: a jump keeps the depth (drawing, shots and blows); sleepers wait at their spots', async () => {
  const { engine, section, p, place } = await mission(FREIGHTERS[0], { keepEnemies: true });
  place(p, section.x0 + 300, -70);
  p.y -= 80; p.grounded = false; // airborne over the floor (injection)
  assert.equal(inDepthSectionV188(section, p), false); assert.equal(overDepthSectionV188(section, p), true);
  tick(engine, 1 / 60);
  assert.equal(p.depthZ, -70, 'the depth is kept in the air'); assert.ok(engine.depthActorsV188().includes(p), 'drawn at its depth');
  assert.equal(engine.depthOfShooterV188(p), -70, 'its salvo carries its depth');
  const dormant = engine.spawnedEnemiesV188.filter(enemy => enemy.levelSpawnId === 'ship-cargo-stalkers' && enemy.dormant && Math.abs(enemy.y + enemy.h - section.floorY) < 2
    && enemy.x + enemy.w / 2 >= section.x0 && enemy.x + enemy.w / 2 <= section.x1 && fit(enemy));
  for (const enemy of dormant) assert.ok(Number.isFinite(enemy.depthZ) && !blockedByFootprintV188(section, enemy.x + enemy.w / 2, enemy.depthZ, 0), `${enemy.id} waits on free floor`);
});

test('holds: resume mid-section restores depths and the acid of the quarantine hold', async () => {
  const freighter = await mission(FREIGHTERS[2]);
  freighter.place(freighter.p, freighter.section.x0 + 300, -66);
  let state = freighter.engine.captureResumeState();
  assert.equal(state.depthV188.section, 'freighter-cargo-hold'); freighter.p.depthZ = 0;
  freighter.engine.applyResumeState(state); assert.equal(freighter.p.depthZ, -66);
  const lethe = await mission(ALIEN_SURVIVAL_CAMPAIGN_V70);
  const { engine, section, p, place } = lethe;
  const pool = engine.createAlienSurvivalAcidPoolV70({ id: 'acid-pool:test', roomId: 'ship-cargo', x: section.x0 + 300, y: section.floorY - 20, w: 96, h: 20, intensity: 1 });
  assert.ok(pool, 'a pool on the hold floor'); assert.equal(engine.depthAcidV188.has(pool.id), false, 'a scripted pool without a source has no band');
  const victim = { id: 'enemy-115-armored-lurker:test', w: 52, h: 90, depthZ: -60 }; // a creature of an admitted caste, fallen at −60
  engine.depthAcidSourceV188 = victim;
  const fallen = engine.createAlienSurvivalAcidPoolV70({ id: 'acid-pool:fallen', roomId: 'ship-cargo', x: section.x0 + 200, y: section.floorY - 20, w: 96, h: 20, intensity: 1 });
  engine.depthAcidSourceV188 = null;
  assert.equal(engine.depthAcidV188.get(fallen.id), -60, 'acid lies where the creature fell');
  engine.enemies = []; engine.alienSurvivalV70.acidPools = engine.alienSurvivalV70.acidPools.filter(entry => entry.id === fallen.id);
  place(p, section.x0 + 220, 0); p.health = 100; tick(engine, 1.2); place(p, section.x0 + 220, 0);
  assert.equal(p.health, 100, 'far from its band, the acid does not burn');
  place(p, section.x0 + 220, -60); tick(engine, 1.2);
  assert.ok(p.health < 100, 'in its band it burns');
  state = engine.captureResumeState();
  assert.deepEqual(state.depthV188.acid, [{ id: 'acid-pool:fallen', z: -60 }]);
  engine.depthAcidV188.clear(); engine.applyResumeState(state); assert.equal(engine.depthAcidV188.get('acid-pool:fallen'), -60, 'restored');
});

test('holds: QZ-17 builds exactly the spec-002 section', async () => {
  // Reference: the spec-002 builder, kept verbatim here.
  const footprint = (id, x0, x1, z0, z1) => Object.freeze({ id, x0, x1, z0, z1 });
  const prop = (id, kind, x, w, h, z, z0, z1, extra = {}) => Object.freeze({ id, kind, x, w, h, z, ...extra, footprint: footprint(id, x, x + w, z0, z1) });
  function legacy(engine) {
    const doors = engine?.doors || [], dock = doors.find(door => door.id === 'dock-bulkhead'), cargo = doors.find(door => door.id === 'cargo-bulkhead');
    const decks = (engine?.platforms || []).filter(entry => entry.zoneId === 'ship-cargo' && Number.isFinite(entry.y));
    if (!dock || !cargo || !decks.length) return null;
    const floorY = Math.max(...decks.map(entry => entry.y)), x0 = dock.x + dock.w, x1 = cargo.x;
    if (!(x1 - x0 > 300)) return null;
    const layout = qz17HoldLayoutV188(x0, x1);
    const props = layout.blocking.map(entry => prop(entry.id, entry.kind, entry.x, entry.w, entry.h, entry.z, entry.z0, entry.z1, entry.labels ? { stack: entry.stack, labels: entry.labels } : {}));
    const covers = (engine.covers || []).filter(cover => cover.zoneId === 'ship-cargo' && cover.x >= x0 && cover.x + cover.w <= x1).map(cover => prop(`cover:${cover.id}`, 'cover', cover.x, cover.w, cover.h, -2, -34, 1));
    return Object.freeze({ id: 'qz17-cargo-hold', roomId: 'qz17-cargo-hold', zoneId: 'ship-cargo', x0, x1, floorY, zMin: -80, zMax: 0, doorBand: 20, interactBand: 24, speed: 150,
      dropship: null, bay: layout.bay, props: Object.freeze([...props, ...covers]), containers: Object.freeze(props), coverIds: Object.freeze(covers.map(entry => entry.id.slice(6))) });
  }
  const { engine, section } = await mission(QZ17);
  assert.deepEqual(section, legacy(engine)); assert.deepEqual(buildCargoHoldSectionV188(engine), legacy(engine));
  // With a rail cover left in the hold, the same wall-side object as before.
  const withCover = { ...engine, covers: [{ id: 'c1', zoneId: 'ship-cargo', x: section.x0 + 200, y: 0, w: 82, h: 46 }] };
  assert.deepEqual(buildCargoHoldSectionV188(withCover), legacy(withCover));
  assert.equal(buildCargoHoldSectionV188({ doors: [], platforms: [] }), null);
  assert.equal(DEPTH_HOLD_DEFINITIONS_V188[0].bigCastes, 'service-deck');
});

test('holds: named art slots with primitive fallbacks, shipped offline, no image requested', () => {
  assert.deepEqual(DEPTH_HOLD_SLOT_FILES_PRESENT_V188, []);
  const used = new Set(DEPTH_HOLD_DEFINITIONS_V188.flatMap(entry => (entry.props || []).map(item => item.slot)));
  for (const entry of DEPTH_HOLD_SLOTS_V188) {
    for (const key of ['id', 'purpose', 'width', 'height', 'layer', 'brief']) assert.ok(entry[key], `${entry.id}.${key}`);
    assert.ok(used.has(entry.id), `${entry.id} is used by a hold`);
    let requested = 0; const calls = [];
    const ctx = new Proxy({}, { get: (_, key) => (...args) => { calls.push(key); } });
    const source = drawDepthHoldSlotV188(ctx, { slot: entry.id }, { x: 0, y: 0, w: entry.width, h: entry.height }, { ImageCtor: class { set src(v) { requested++; } } });
    assert.equal(source, 'primitive'); assert.equal(requested, 0); assert.ok(calls.includes('fillRect'));
  }
  const sw = read('sw.js'); for (const file of ['/src/depth-hold-sections-v188.js', '/src/depth-hold-slots-v188.js']) assert.ok(sw.includes(`'${file}'`), file);
  assert.doesNotMatch(read('src/game-production-runtime.js'), /depth-hold/, 'composition unchanged');
});
