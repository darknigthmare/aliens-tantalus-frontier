import assert from 'node:assert/strict';
import { ENEMY_USER_CREATIONS_V95 as USER_ADDITIONS } from '../src/enemy-user-creations-v95.js';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { auditPngBuffer } from '../docs/references/v91-enemy-only/audit-candidate-png.mjs';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { ENEMY_ADDITIONAL_POSES_V94 as ADDITIONAL } from '../src/enemy-additional-poses-v94.js';
import { ENEMY_DEDICATED_POSES_V99 as DEDICATED } from '../src/enemy-dedicated-poses-v99.js';
import { ENEMY_STATIC_POSES_V94 as STATIC, ENEMY_STATIC_POSE_IDS_V94, ENEMY_STATIC_POSE_PATHS_V94, getEnemyStaticPoseV94, getEnemyStaticPoseRangedBehaviorV94 } from '../src/enemy-static-poses-v94.js';
import { ENEMY_STATIC_POSES_V96 as ALL_STATIC } from '../src/enemy-static-poses-v96.js';
import { ENEMY_USER_CASTES_ORIGINALS_V87 as ORIGINALS, ENEMY_USER_CASTES_V87, getEnemyUserCasteV87 } from '../src/enemy-user-castes-v87.js';
import { createUserCasteActorV87, drawUserCastePoseV87, isUserCasteImageReadyV87 } from '../src/enemy-user-pose-runtime-v87.js';
import { ENEMY_USER_CAMPAIGN_V88 as CAMPAIGN, ENEMY_ENCYCLOPEDIA_CATALOG_V88, getEnemyUserCampaignV88, selectUserCasteEncountersV88 } from '../src/enemy-user-campaign-v88.js';
import { BIOFORGE_TERRESTRIAL_ROSTER_V80, getBioforgeRosterEntryV80 } from '../src/bioforge-session-v80.js';
import { getCatalogEntryV62 } from '../src/catalog-runtime-v62.js';
import { getCatalogSpriteFrameV62 } from '../src/catalog-ui-v62.js';
import { ENEMIES, WORLDS, CAMPAIGNS, LEVEL_SEEDS, WEAPONS } from '../src/content.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { createDefaultSave, sanitizeOperationResumeState, SaveSystem } from '../src/save.js';
import { recordEnemyDiscoveryV88, getEnemyDiscoveryV88 } from '../src/enemy-discovery-v88.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const noop = () => {};
globalThis.addEventListener = noop;
globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class {
  complete = true; naturalWidth = 1024; naturalHeight = 2048;
  set src(value) {
    this.currentSrc = this._src = value;
    const d = ALL_STATIC.flatMap(entry => [entry, ...(entry.states || [])]).find(entry => entry.path === value);
    if (d) { this.naturalWidth = d.sourceWidth; this.naturalHeight = d.sourceHeight; }
  }
  get src() { return this._src; }
};
const { BioforgeRuntimeV80 } = await import('../src/bioforge-runtime-v80.js');

function fixture() {
  const draws = [], events = [];
  const ctx = new Proxy({ drawImage: (...args) => draws.push(args), measureText: s => ({ width: String(s).length * 8 }) }, { get: (t, k) => t[k] ?? noop });
  const engine = new GameEngine({ width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop }, { onEvent: e => events.push(e) });
  return { engine, draws, events, ctx };
}
function optionsFor(definition) {
  const d = getEnemyUserCampaignV88(definition.id);
  const world = WORLDS.find(w => w.id === d.encounterWorldIds[0]);
  const campaign = CAMPAIGNS.find(c => c.worldId === world.id && !/survival|prologue/i.test(c.id)) || CAMPAIGNS[0];
  const eligible = CAMPAIGN.filter(e => e.encounterWorldIds.includes(world.id));
  const seed = eligible.findIndex(e => e.id === d.id);
  const plan = buildMissionLevelV52({ world, campaign, levelSeeds: LEVEL_SEEDS, templateId: 'colony-multiroute', variant: 0 });
  return { userCasteCampaignV88: true, operationId: 'operation-0-v94-test', world, campaign, seed,
    enemyCatalog: ENEMIES, weapon: WEAPONS[0], difficulty: 'standard', levelSeed: { ...plan.levelSeed, seed }, missionLevel: plan };
}

function printedLabActor(definition) {
  const ctx = new Proxy({ globalAlpha: 1, measureText: value => ({ width: String(value).length * 8 }) }, { get: (target, key) => target[key] ?? noop });
  const engine = new BioforgeRuntimeV80({ width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop }, {
    assets: {}, testMode: true, autoLoop: false, now: () => 1000, onEvent: noop, onPersist: noop
  });
  for (const d of STATIC) engine.images.set(d.imageKey, { complete: true, naturalWidth: d.sourceWidth, naturalHeight: d.sourceHeight, src: d.path });
  engine.start({ configuration: { profileId: definition.id, quantity: 1 }, autoLoop: false, testMode: true, assets: {} });
  const first = engine.doors.find(door => door.id === 'control-seal'), second = engine.doors.find(door => door.id === 'inner-interlock');
  const printer = engine.bioforgeLevelV80.stations.find(station => station.type === 'printer');
  engine.player.x = first.x - engine.player.w - 10; assert.equal(engine.interact(), true);
  engine.player.x = second.x - engine.player.w - 45; assert.equal(engine.interact(), true);
  engine.player.x = printer.x - 20; assert.equal(engine.interact(), true);
  engine.player.x = engine.bioforgeLevelV80.arenaBounds.x + 8; engine.update(.016);
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'sealing');
  assert.equal(engine.advanceBioforgePhaseV80().event.type, 'bioforge-printer-ready');
  engine.player.x = 1320;
  const operation = engine.advanceBioforgePhaseV80();
  assert.equal(operation.applied, true, operation.reason);
  assert.equal(operation.event.type, 'bioforge-specimen-printed');
  return { engine, actor: engine.enemies.find(enemy => enemy.id === operation.event.specimenId) };
}

function assertFirearmProjectile(engine, actor, definition) {
  assert.ok(actor?.alive);
  assert.equal(actor.profileId, definition.id);
  assert.equal(actor.biology, 'synthetic');
  assert.equal(actor.behavior, 'shooter');
  assert.equal(actor.rangedBehavior, 'shooter');
  assert.equal(actor.visualImageKey, definition.imageKey);
  Object.assign(engine.player, { x: actor.x - 280, y: actor.y + actor.h - engine.player.h, alive: true, downed: false });
  engine.enemyMeleePathClearV64 = () => true;
  actor.rangedClock = 0;
  const before = engine.hostileProjectiles.length;
  engine.updateEnemy(actor, .1);
  const shots = engine.hostileProjectiles.slice(before);
  assert.ok(shots.length > 0, 'The actual actor AI must call the real projectile implementation');
  for (const shot of shots) {
    assert.equal(shot.acid, false, 'Synthetic firearm projectiles cannot be acidic');
    assert.equal(shot.ownerId, actor.id);
    assert.equal(shot.damage, actor.damage);
    assert.equal(Math.abs(shot.vx), 520, 'The existing firearm projectile path is used, not biological spitting');
  }
  assert.ok(actor.rangedClock > 0, 'A real shot starts its firing cooldown');
}

function authoredExteriorOptions(definition) {
  const options = optionsFor(definition);
  const missionLevel = buildMissionLevelV52({ world: options.world, campaign: options.campaign, levelSeeds: LEVEL_SEEDS, variant: 0 });
  assert.equal(missionLevel.templateId, 'planet-exterior', 'Use the real LV-895 template, not a forced colony fixture');
  const eligible = CAMPAIGN.filter(d => d.encounterWorldIds.includes(options.world.id));
  const index = eligible.findIndex(d => d.id === definition.id);
  const ordinal = ((index - missionLevel.levelSeed.seed) % eligible.length + eligible.length) % eligible.length;
  return { ...options, operationId: `operation-${ordinal}-v94-exterior`, seed: missionLevel.levelSeed.seed,
    levelSeed: missionLevel.levelSeed, missionLevel };
}

for (const d of [...ADDITIONAL.filter(d => d.biology === 'synthetic'), STATIC.find(d => d.basename === 'game_pathogen_blight')]) {
  test(`V94 ${d.name}: real LV-895 dormant contacts wake once at their authored zone and preserve saves before and after activation`, () => {
    const options = authoredExteriorOptions(d), original = fixture(), baseline = fixture().engine;
    baseline.start({ ...options, userCasteCampaignV88: false });
    original.engine.start(options);
    const engine = original.engine, natives = engine.enemies.filter(e => e.campaignCasteV88);
    assert.ok(natives.some(e => e.profileId === d.id));
    assert.equal(natives.length, 2);
    assert.equal(engine.enemies.length, baseline.enemies.length, 'Native IDs replace slots, never add population');
    assert.deepEqual(engine.enemies.filter(e => e.isBoss).map(e => e.id), baseline.enemies.filter(e => e.isBoss).map(e => e.id), 'Ordinary contacts do not consume the boss');
    assert.equal(engine.enemies.filter(e => e.alive).length, baseline.enemies.filter(e => e.alive).length);
    assert.equal(engine.enemies.filter(e => e.alive && !e.isBoss).length, 0);
    for (const actor of natives) {
      assert.equal(actor.dormant, true); assert.equal(actor.alive, false);
      assert.equal(actor.levelSpawnId, 'planet-surface-fauna');
      const slot = engine.userCasteCampaignV88.entries.find(e => e.profileId === actor.profileId).slot;
      assert.equal(actor.levelSpawnId, baseline.enemies[slot].levelSpawnId);
      assert.equal(actor.levelZoneId, baseline.enemies[slot].levelZoneId);
      const combat = structuredClone(actor.userCasteCombatV89);
      engine.updateEnemy(actor, .1); engine.drawEnemy(original.ctx, actor);
      assert.deepEqual(actor.userCasteCombatV89, combat, 'Dormancy cannot consume an attack or mark a living future contact spent');
    }
    assert.equal(original.draws.length, 0);
    assert.equal(original.events.some(e => e.type === 'enemy-discovered-v88'), false);
    assert.equal(engine.missionLevelEvents.get('planet-storm-front').triggered, false);
    assert.equal(engine.missionLevelSpawns.get('planet-surface-fauna').active, false);

    function restore(source) {
      const saved = sanitizeOperationResumeState(JSON.parse(JSON.stringify(source.captureResumeState())));
      const restored = fixture().engine; restored.start({ ...options, resumeState: saved });
      assert.equal(restored.lastResumeResult.applied, true);
      assert.deepEqual(restored.userCasteCampaignV88, source.userCasteCampaignV88);
      assert.deepEqual(restored.enemies.map(e => [e.id, e.alive, e.dormant, e.levelSpawnId]), source.enemies.map(e => [e.id, e.alive, e.dormant, e.levelSpawnId]));
      for (const actor of source.enemies.filter(e => e.campaignCasteV88)) {
        const resumed = restored.enemies.find(e => e.id === actor.id);
        if (actor.alive) assert.equal(resumed.health, actor.health);
        assert.deepEqual(resumed.userCasteCombatV89, actor.userCasteCombatV89);
      }
      return restored;
    }
    const beforeActivation = restore(engine);
    for (const actor of beforeActivation.enemies.filter(e => e.campaignCasteV88)) {
      assert.equal(actor.alive, false); assert.equal(actor.dormant, true);
      if (actor.userCasteCombatV89) assert.equal(actor.userCasteCombatV89.phase, 'cooldown');
    }
    for (const target of [engine, beforeActivation]) {
      // Position a Node fixture at the zone boundary, then invoke the same
      // zone-transition detector used by normal movement; do not spawn manually.
      const surface = target.missionLevelRuntime.graph.nodes.find(n => n.zoneId === 'planet-surface');
      assert.ok(surface, 'Use the authored graph node, not an overlapping zone rectangle');
      target.player.x = surface.x - target.player.w / 2;
      target.player.y = surface.y - target.player.h;
      target.refreshMissionLevelZone(false);
      assert.equal(target.missionLevelEvents.get('planet-storm-front').triggered, true);
      assert.equal(target.missionLevelEvents.get('planet-storm-front').triggerCount, 1);
      assert.equal(target.missionLevelSpawns.get('planet-surface-fauna').active, true);
      assert.equal(target.enemies.length, baseline.enemies.length);
      for (const actor of target.enemies.filter(e => e.campaignCasteV88)) {
        assert.equal(actor.alive, true); assert.equal(actor.dormant, false);
        assert.equal(actor.health, actor.maxHealth);
        if (actor.userCasteCombatV89) assert.equal(actor.userCasteCombatV89.phase, 'cooldown');
      }
    }
    const active = beforeActivation.enemies.find(e => e.profileId === d.id); active.health -= 17;
    const afterActivation = restore(beforeActivation);
    const victim = afterActivation.enemies.find(e => e.profileId === d.id);
    assert.equal(victim.health, active.health);
    afterActivation.defeatEnemy(victim, afterActivation.player);
    const population = afterActivation.enemies.length;
    assert.equal(afterActivation.triggerMissionLevelEvent('planet-storm-front', 'duplicate-zone-test'), false);
    assert.equal(victim.alive, false); assert.equal(victim.dormant, false);
    assert.equal(afterActivation.enemies.length, population);
    assert.equal(afterActivation.missionLevelEvents.get('planet-storm-front').triggerCount, 1);
    const afterDeath = restore(afterActivation);
    assert.equal(afterDeath.enemies.find(e => e.id === victim.id).alive, false, 'A killed contact cannot respawn on reload');
  });
}

test(`V94 extends shared surfaces by only ${ADDITIONAL.length} admitted poses while preserving the 35 imports and 571 historical profiles`, () => {
  assert.equal(ORIGINALS.length, 35);
  assert.equal(ENEMY_USER_CASTES_V87.length, 35);
  assert.equal(ENEMIES.length, 571);
  assert.equal(STATIC.length, 35 + ADDITIONAL.length);
  assert.equal(CAMPAIGN.length, ALL_STATIC.length);
  assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.length, 571 + ALL_STATIC.length);
  assert.equal(BIOFORGE_TERRESTRIAL_ROSTER_V80.length, 11 + ALL_STATIC.length + DEDICATED.filter(pose => pose.bioforgeEligible !== false).length);
  assert.deepEqual(STATIC.slice(0, 35), ENEMY_USER_CASTES_V87);
  assert.deepEqual(ENEMY_STATIC_POSE_IDS_V94, STATIC.map(d => d.id));
  assert.deepEqual(ENEMY_STATIC_POSE_PATHS_V94, STATIC.map(d => d.path));
  for (const key of ['id', 'path', 'imageKey']) assert.equal(new Set(STATIC.map(d => d[key])).size, STATIC.length, key);
  assert.ok(Object.isFrozen(ADDITIONAL) && Object.isFrozen(STATIC));
  for (const d of STATIC) assert.equal(getEnemyStaticPoseV94(d.id), d);
  for (const d of ADDITIONAL) {
    assert.equal(getEnemyUserCasteV87(d.id), null, 'The original import API remains exactly 35 identities');
    assert.equal(ENEMIES.some(e => e.id === d.id), false, 'No historical profile or mathematical variant is overwritten');
    for (const id of [d.id + ':0', ' ' + d.id, d.name]) assert.equal(getEnemyStaticPoseV94(id), null);
  }
  for (const id of [null, {}, '__proto__', 'pending-v94']) assert.equal(getEnemyStaticPoseV94(id), null);
});

test('V94 source metadata never promotes a generated pose or a licensed figurine to verified film canon', () => {
  for (const d of ADDITIONAL) {
    assert.equal(d.id, d.profileId);
    assert.match(d.id, /^pose-v94-/);
    assert.equal(d.path, `/assets/openai/sprites/static-enemy-v94/${d.filename}`);
    assert.equal(d.imageKey, `openai-static-v94:${d.basename}`);
    assert.equal(d.reviewStatus, 'accepted-static-adaptation');
    assert.equal(d.canonExact, false);
    assert.equal(d.identityVerified, false);
    assert.equal(d.identityStatus, 'reference-guided-static-pose');
    assert.equal(d.assetVerificationStatus, 'sha256-dimensions-alpha-verified');
    assert.equal(d.provenance, 'openai-integrated-reference-guided');
    assert.equal(d.geometryStatus, 'project-adaptation');
    assert.equal(d.visualMode, 'static-pose');
    assert.equal(d.animationStatus, 'missing');
    assert.equal(d.visualRevision, 94);
    assert.equal(d.legacyCounterpartId, null);
    assert.match(d.sha256, /^[a-f0-9]{64}$/);
    assert.ok(d.referenceNote.length > 40);
    assert.ok(Object.isFrozen(d) && Object.isFrozen(d.pivot) && Object.isFrozen(d.referenceUrls));
    assert.ok(d.referenceUrls.length && d.referenceUrls.every(url => new URL(url).protocol === 'https:'));
    assert.ok(d.cost > 0 && d.cost <= 12 && d.bodyWidth > 0 && d.bodyHeight > 0);
    assert.ok(Math.abs(d.renderWidth / d.renderHeight - d.sourceWidth / d.sourceHeight) < 1e-12, 'No non-uniform stretching');
    assert.ok([1, -1].includes(d.sourceFacing));
    assert.ok(d.pivot.x >= 0 && d.pivot.x <= 1 && d.pivot.y >= 0 && d.pivot.y <= 1);
    if (d.id.startsWith('pose-v94-kenner-')) {
      assert.equal(d.group, 'Figurines');
      assert.match(d.work, /Kenner/);
      assert.match(d.work, /NECA/);
      assert.match(d.work, /figurines/);
      assert.equal(getEnemyUserCampaignV88(d.id).encounterGroup, 'crossover');
    }
  }
});

test('V94 ranged resolver distinguishes synthetic firearms from biological acid', () => {
  assert.equal(getEnemyStaticPoseRangedBehaviorV94({ biology: 'synthetic', rangedBehavior: 'spitter' }), 'shooter');
  assert.equal(getEnemyStaticPoseRangedBehaviorV94({ basename: 'game_xenoborg_avp1999' }), 'shooter');
  assert.equal(getEnemyStaticPoseRangedBehaviorV94({ biology: 'xenomorph', rangedBehavior: 'shooter' }), 'shooter');
  assert.equal(getEnemyStaticPoseRangedBehaviorV94({ biology: 'xenomorph', rangedBehavior: 'spitter' }), 'spitter');
  for (const d of ADDITIONAL.filter(d => d.biology === 'synthetic')) {
    assert.equal(createUserCasteActorV87({ profileId: d.id, id: 'synthetic-test' }, 642).rangedBehavior, 'shooter');
  }
});

for (const d of ADDITIONAL.filter(d => d.biology === 'synthetic')) {
  test(`V94 ${d.name}: production campaign and printed BIOFORGE actors fire real non-acidic firearm projectiles`, () => {
    assert.match(d.id, /^pose-v94-afe-synth-/);
    assert.equal(d.combatRole, 'ranged');
    assert.equal(d.rangedBehavior, 'shooter');
    const definition = getEnemyUserCampaignV88(d.id);
    assert.equal(definition.encounterGroup, 'fireteam');
    assert.equal(definition.biology, 'synthetic');
    const campaign = fixture().engine;
    // Use the production free-layout mission path, so this is a firing test,
    // not a navigation-to-the-target test through authored doors and catwalks.
    campaign.start({ ...optionsFor(d), missionLevel: undefined });
    assertFirearmProjectile(campaign, campaign.enemies.find(actor => actor.profileId === d.id), d);
    const lab = printedLabActor(d);
    assertFirearmProjectile(lab.engine, lab.actor, d);
  });
}

for (const d of ADDITIONAL) {
  test(`V94 ${d.name}: dedicated native PNG has the recorded SHA, dimensions, real alpha and subject bounds`, async () => {
    const bytes = await readFile(join(projectRoot, d.path.slice(1)));
    const audit = auditPngBuffer(bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), d.sha256);
    assert.equal(audit.sha256, d.sha256);
    assert.deepEqual([audit.width, audit.height], [d.sourceWidth, d.sourceHeight]);
    assert.equal(audit.format, 'RGBA8 non-interlaced');
    assert.equal(audit.alphaMin, 0);
    assert.ok(audit.alphaMax >= 250 && audit.alphaAtLeast16 > 0);
    assert.ok(audit.alpha0 > 0, 'An opaque flat background cannot pass as transparency');
    assert.deepEqual(audit.bboxAlphaAtLeast16, d.alphaBounds);
    for (const margin of Object.values(audit.marginsAlphaAtLeast16)) assert.ok(margin > 0, 'Full native silhouette remains inside canvas');
  });

  test(`V94 ${d.name}: mission, BIOFORGE and encyclopedia resolve the same unique full-frame pose`, () => {
    const mission = getEnemyUserCampaignV88(d.id), lab = getBioforgeRosterEntryV80(d.id), catalog = getCatalogEntryV62(d.id);
    for (const entry of [mission, lab]) {
      assert.equal(entry.profileId, d.id);
      assert.equal(entry.path, d.path);
      assert.equal(entry.imageKey, d.imageKey);
      assert.equal(entry.canonExact, false);
      assert.equal(entry.animationStatus, 'missing');
    }
    assert.equal(catalog.visual.path, d.path);
    assert.equal(catalog.visual.imageKey, d.imageKey);
    assert.equal(catalog.visual.sheetId, null);
    assert.deepEqual(catalog.visual.grid, { columns: 1, rows: 1, cellWidth: d.sourceWidth, cellHeight: d.sourceHeight });
    assert.deepEqual(catalog.visual.previewClips, []);
    assert.equal(catalog.visual.identity.canonExact, false);
    assert.equal(catalog.canonFacts.source.provenance, d.provenance);
    const frame = getCatalogSpriteFrameV62(catalog.visual);
    assert.equal(frame.columns, 1); assert.equal(frame.rows, 1);
    assert.equal(mission.automaticEncounter, true);
    const options = optionsFor(d);
    assert.ok(selectUserCasteEncountersV88(options).some(e => e.id === d.id));
    assert.ok(selectUserCasteEncountersV88(options).length <= 2);
    for (const changes of [{ editorProject: {} }, { provingGround: true }, { campaign: { id: 'prologue-test' } }, { campaign: { id: 'bioforge-test' } }]) {
      assert.deepEqual(selectUserCasteEncountersV88({ ...options, ...changes }), []);
    }
  });

  test(`V94 ${d.name}: both gameplay facings respect native facing ${d.sourceFacing}, full canvas and grounded pivot`, () => {
    const actor = createUserCasteActorV87({ profileId: d.id, id: 'draw-' + d.id }, 642);
    actor.x = 350;
    assert.deepEqual([actor.w, actor.h, actor.health, actor.maxHealth, actor.damage], [d.bodyWidth, d.bodyHeight, d.health, d.health, d.damage]);
    const image = { complete: true, naturalWidth: d.sourceWidth, naturalHeight: d.sourceHeight, src: d.path };
    assert.equal(isUserCasteImageReadyV87(image, d), true);
    for (const facing of [-1, 1]) {
      actor.facing = facing;
      const calls = [];
      const ctx = Object.fromEntries(['save', 'restore', 'translate', 'scale', 'drawImage'].map(key => [key, (...args) => calls.push([key, ...args])]));
      assert.equal(drawUserCastePoseV87(ctx, actor, image), true);
      assert.deepEqual(calls, [['save'], ['translate', 350 + d.bodyWidth / 2, 642], ['scale', facing * d.sourceFacing, 1],
        ['drawImage', image, -d.pivot.x * d.renderWidth, -d.pivot.y * d.renderHeight, d.renderWidth, d.renderHeight], ['restore']]);
      assert.equal(642 + calls[3][3] + d.pivot.y * d.renderHeight, 642);
    }
    const noDraw = new Proxy({}, { get: (_, key) => () => assert.fail('Unexpected borrowed draw: ' + String(key)) });
    for (const bad of [null, { ...image, complete: false }, { ...image, naturalWidth: d.sourceWidth + 1 }]) assert.equal(drawUserCastePoseV87(noDraw, actor, bad), false);
    assert.equal(drawUserCastePoseV87(noDraw, { ...actor, alive: false }, image), false);
    assert.equal(drawUserCastePoseV87(noDraw, { ...actor, profileId: d.id + ':0' }, image), false);
  });

  test(`V94 ${d.name}: actual production mission and resume retain new ID, health and dedicated image`, () => {
    const options = optionsFor(d), original = fixture(), baseline = fixture().engine;
    baseline.start({ ...options, userCasteCampaignV88: false });
    original.engine.start(options);
    const actor = original.engine.enemies.find(e => e.profileId === d.id);
    assert.ok(actor && actor.alive && !actor.dormant);
    assert.equal(original.engine.enemies.length, baseline.enemies.length, 'No mission population inflation');
    assert.equal(actor.visualImageKey, d.imageKey);
    assert.equal(actor.visualSheetId, null);
    assert.equal(original.engine.userCasteLoadingV88, false);
    actor.health -= 20; actor.facing = 1;
    original.engine.drawEnemy(original.ctx, actor);
    const draw = original.draws.find(args => args[0]?.src === d.path);
    assert.ok(draw && draw.length === 5 && draw[3] === d.renderWidth && draw[4] === d.renderHeight);
    assert.ok(original.events.some(e => e.type === 'enemy-discovered-v88' && e.profileId === d.id));
    const resume = sanitizeOperationResumeState(JSON.parse(JSON.stringify(original.engine.captureResumeState())));
    const restored = fixture().engine; restored.start({ ...options, resumeState: resume });
    assert.equal(restored.lastResumeResult.applied, true);
    assert.deepEqual(restored.enemies.map(e => [e.id, e.alive, e.health]), original.engine.enemies.map(e => [e.id, e.alive, e.alive ? e.health : 0]));
    assert.deepEqual(restored.enemies.map(e => [e.id, e.damage, e.speed]), original.engine.enemies.map(e => [e.id, e.damage, e.speed]));
    assert.equal(restored.enemies.find(e => e.profileId === d.id).visualImageKey, d.imageKey);
  });

  test(`V94 ${d.name}: discovery survives real save storage and stays isolated from BIOFORGE previews`, () => {
    const save = createDefaultSave(), options = optionsFor(d);
    const seen = { type: 'enemy-discovered-v88', scope: 'campaign', profileId: d.id, worldId: options.world.id, campaignId: options.campaign.id };
    assert.equal(recordEnemyDiscoveryV88(save, { ...seen, scope: 'bioforge' }), false);
    assert.equal(recordEnemyDiscoveryV88(save, seen), true);
    assert.equal(recordEnemyDiscoveryV88(save, seen), false);
    const kill = { ...seen, type: 'enemy-defeated-v88', receipt: 'operation:v94:' + d.id };
    recordEnemyDiscoveryV88(save, kill); recordEnemyDiscoveryV88(save, kill);
    assert.equal(getEnemyDiscoveryV88(save.enemyDiscoveryV88, d.id).defeated, 1);
    const memory = new Map(), storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
    const writer = new SaveSystem(storage); writer.commit(save);
    const reader = new SaveSystem(storage); reader.load();
    assert.deepEqual(reader.data.enemyDiscoveryV88, save.enemyDiscoveryV88);
  });
}

test('V94 build whitelist admits only reviewed files and exposes both shared modules without publishing reference candidates', async () => {
  const filter = createBuildAssetFilter(projectRoot);
  for (const d of ADDITIONAL) {
    assert.equal(filter(join(projectRoot, d.path.slice(1))), true);
    for (const path of [d.path.replace('.png', '-copy.png'), d.path.replace('.png', '.webp'), d.path.replace('/static-enemy-v94/', '/static-enemy-v94/candidates/')]) {
      assert.equal(filter(join(projectRoot, path.slice(1))), false, path);
    }
  }
  for (const path of ['assets/openai/sprites/static-enemy-v94/unreviewed.png', 'docs/references/v91-enemy-only/pass-v94',
    'docs/references/v91-enemy-only/pass-v94/v94-snake-attempt1.png', 'docs/references/v91-enemy-only/pass-v94/GENERATIONS.json']) {
    assert.equal(filter(join(projectRoot, path)), false, path);
  }
  const worker = await readFile(join(projectRoot, 'sw.js'), 'utf8');
  for (const module of ['enemy-additional-poses-v94', 'enemy-static-poses-v94']) assert.ok(worker.includes(`'/src/${module}.js'`));
});
