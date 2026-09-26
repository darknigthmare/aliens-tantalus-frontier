import { ENEMY_STATIC_POSES_V96 as CURRENT_STATIC, getEnemyStaticPoseV96, getEnemyStaticPoseStatesV96 } from '../src/enemy-static-poses-v96.js';
import { ENEMY_STATIC_POSES_V95 as HISTORICAL_STATIC_V95 } from '../src/enemy-static-poses-v95.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, ENEMIES, LEVEL_SEEDS, WEAPONS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { ENEMY_USER_CAMPAIGN_V88, ENEMY_ENCYCLOPEDIA_CATALOG_V88, selectUserCasteEncountersV88, sanitizeUserCasteCampaignV88 } from '../src/enemy-user-campaign-v88.js';
import { sanitizeEnemyDiscoveryV88, recordEnemyDiscoveryV88, getEnemyDiscoveryV88 } from '../src/enemy-discovery-v88.js';
import { getCatalogEntryV62, searchCatalogV62, CATALOG_COUNTS_V62 } from '../src/catalog-runtime-v62.js';
import { getCatalogSpriteFrameV62 } from '../src/catalog-ui-v62.js';
import { createDefaultSave, migrateSave, sanitizeOperationResumeState, SaveSystem } from '../src/save.js';
import { largeMissionActorFitsV72 } from '../src/mission-large-actor-placement-v72.js';
import { getBioforgeRosterEntryV80 } from '../src/bioforge-session-v80.js';

const AUTOMATIC_CAMPAIGN = ENEMY_USER_CAMPAIGN_V88.filter(d => d.automaticEncounter === true);
const LAB_ONLY = ENEMY_USER_CAMPAIGN_V88.filter(d => d.automaticEncounter === false);

const noop = () => {};
globalThis.addEventListener = noop; globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class {
  complete = true; naturalWidth = 1024; naturalHeight = 2048;
  set src(value) { this.currentSrc = this._src = value;
    const definition = ENEMY_USER_CAMPAIGN_V88.flatMap(entry => [entry, ...getEnemyStaticPoseStatesV96(entry.id)]).find(entry => entry.path === value);
    if (definition) { this.naturalWidth = definition.sourceWidth; this.naturalHeight = definition.sourceHeight; }
  }
  get src() { return this._src; }
};
function optionsFor(d, { mission = true, enabled = true, templateId = d.locomotion === 'aquatic' ? 'planet-exterior' : 'colony-multiroute' } = {}) {
  const world = WORLDS.find(w => w.id === d.encounterWorldIds[0]);
  const campaign = CAMPAIGNS.find(c => c.worldId === world.id && !/survival|prologue/i.test(c.id)) || CAMPAIGNS[0];
  const eligible = AUTOMATIC_CAMPAIGN.filter(e => e.encounterWorldIds.includes(world.id));
  const seed = eligible.findIndex(e => e.id === d.id);
  const plan = buildMissionLevelV52({ world, campaign, levelSeeds: LEVEL_SEEDS, templateId, variant: 0 });
  return { userCasteCampaignV88: enabled, operationId: 'operation-0-test', world, campaign, seed,
    enemyCatalog: ENEMIES, weapon: WEAPONS[0], difficulty: 'standard',
    levelSeed: { ...plan.levelSeed, seed }, ...(mission ? { missionLevel: plan } : {}) };
}
function fixture() {
  const draws = [], events = [];
  const ctx = new Proxy({ drawImage: (...args) => draws.push(args), measureText: s => ({ width: String(s).length * 8 }) }, { get: (t, k) => t[k] ?? noop });
  const engine = new GameEngine({ width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop }, { onEvent: e => events.push(e) });
  return { engine, draws, events, ctx };
}
const nativeActors = engine => engine.enemies.filter(e => e.campaignCasteV88);

function discoveryPersistenceFixture() {
  const d = ENEMY_USER_CAMPAIGN_V88[9], options = optionsFor(d, { mission: false });
  const memory = new Map(), gate = { fail: true, attempts: 0 }, notices = [];
  const storage = { getItem: key => memory.get(key) ?? null, setItem(key, value) {
    if (key === writer.key()) gate.attempts++;
    if (gate.fail) throw new Error('Temporary quota failure');
    memory.set(key, value);
  } };
  const writer = new SaveSystem(storage);
  writer.data.strategy.currentOperation = { id: options.operationId, campaignId: options.campaign.id, worldId: options.world.id };
  const context = vm.createContext({ saveSystem: writer, standaloneContext: null, profileEpochV78: 4,
    missionOwnerV78: { profile: writer.profile, epoch: 4, timeline: writer.data.createdAt, operationId: options.operationId },
    clone: structuredClone, recordEnemyDiscoveryV88, toast: value => notices.push(value) });
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const start = app.indexOf('function handleGameEvent(event) {');
  const end = app.indexOf("  if (standaloneContext === 'forge-playtest')", start);
  assert.ok(start >= 0 && end > start);
  vm.runInContext(app.match(/^function ownsTimelineV84\(owner\).*$/m)[0] + '\n'
    + app.slice(start, end) + '}\nglobalThis.handle = handleGameEvent;', context);
  const { engine, ctx } = fixture(); engine.start(options);
  engine.onEvent = event => context.handle(event);
  const actor = nativeActors(engine).find(enemy => enemy.profileId === d.id);
  Object.assign(engine.player, { x: actor.x - 190, y: actor.y + actor.h - engine.player.h, health: 100000 });
  engine.enemyMeleePathClearV64 = () => true;
  return { d, options, engine, ctx, actor, writer, storage, memory, gate, notices, context };
}

for (const type of ['observation', 'neutralization']) test(`temporary quota retries ${type} transactionally without duplicate writes or notices`, () => {
  const f = discoveryPersistenceFixture();
  if (type === 'observation') f.engine.drawEnemy(f.ctx, f.actor);
  else f.engine.defeatEnemy(f.actor, f.engine.player);
  assert.equal(f.gate.attempts, 1); assert.equal(f.notices.length, 1);
  assert.equal(getEnemyDiscoveryV88(f.writer.data.enemyDiscoveryV88, f.d.id).seen, false, 'Failed write never publishes a fake discovery');
  assert.equal(f.engine.userCasteDiscoveryPendingV88.size, 1);
  for (let i = 0; i < 60; i++) f.engine.drawEnemy(f.ctx, f.actor);
  for (let i = 0; i < 3; i++) f.engine.update(.5);
  assert.equal(f.gate.attempts, 1, 'No render/frame write storm');
  f.engine.update(.5);
  assert.equal(f.gate.attempts, 2); assert.equal(f.notices.length, 1, 'Repeated quota failure has only one mission notice');
  f.gate.fail = false;
  for (let i = 0; i < 4; i++) f.engine.update(.5);
  assert.equal(f.gate.attempts, 3); assert.equal(f.engine.userCasteDiscoveryPendingV88.size, 0);
  const reader = new SaveSystem(f.storage); reader.load();
  const stored = getEnemyDiscoveryV88(reader.data.enemyDiscoveryV88, f.d.id);
  assert.equal(stored.seen, true); assert.equal(stored.defeated, type === 'neutralization' ? 1 : 0);
  for (let i = 0; i < 8; i++) f.engine.update(.5);
  assert.equal(f.gate.attempts, 3, 'Persisted event is acknowledged exactly once');
  assert.equal(f.notices.length, 1);
});

test('failed discovery queue cannot leak across profile, timeline, epoch, operation or BIOFORGE', () => {
  for (const change of ['profile', 'timeline', 'epoch', 'operation', 'bioforge']) {
    const f = discoveryPersistenceFixture(); f.engine.drawEnemy(f.ctx, f.actor); f.engine.defeatEnemy(f.actor, f.engine.player);
    assert.equal(f.engine.userCasteDiscoveryPendingV88.size, 2);
    f.gate.fail = false;
    if (change === 'profile') f.writer.profile = 2;
    if (change === 'timeline') f.writer.data.createdAt++;
    if (change === 'epoch') f.context.profileEpochV78++;
    if (change === 'operation') f.writer.data.strategy.currentOperation.id = 'operation-other';
    if (change === 'bioforge') f.context.standaloneContext = 'bioforge';
    for (let i = 0; i < 4; i++) f.engine.update(.5);
    assert.equal(f.gate.attempts, 1, change + ': stale event never writes');
    assert.equal(f.engine.userCasteDiscoveryPendingV88.size, 0, change + ': ignored event cannot linger');
    assert.equal(getEnemyDiscoveryV88(f.writer.data.enemyDiscoveryV88, f.d.id).seen, false);
    assert.equal(f.notices.length, 1);
  }
  const f = discoveryPersistenceFixture(); f.engine.drawEnemy(f.ctx, f.actor);
  f.engine.start({ ...f.options, userCasteCampaignV88: false });
  assert.equal(f.engine.userCasteDiscoveryPendingV88.size, 0, 'New engine mission discards previous ownership queue');
  f.engine.drawEnemy(f.ctx, f.engine.enemies[0]); f.engine.defeatEnemy(f.engine.enemies[0], f.engine.player);
  assert.equal(f.gate.attempts, 1, 'Disabled campaign integration never persists lab contacts');
  assert.equal(f.context.handle({ type: 'enemy-discovered-v88', scope: 'bioforge', operationId: f.options.operationId, profileId: f.d.id }), null);
});

test('Historical plus admitted static dossiers, existing Altered identities retained, no canonical exactness invented', () => {
  assert.equal(ENEMY_USER_CAMPAIGN_V88.length, CURRENT_STATIC.length);
  assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.length, ENEMIES.length + CURRENT_STATIC.length);
  assert.equal(new Set(ENEMY_ENCYCLOPEDIA_CATALOG_V88.map(d => d.id)).size, ENEMIES.length + CURRENT_STATIC.length);
  for (const d of ENEMY_USER_CAMPAIGN_V88) {
    assert.equal(d.canonExact, false);
    if (d.automaticEncounter) {
      assert.equal(d.encounterStatus, 'project-adaptation');
      assert.ok(d.encounterWorldIds.length && d.encounterWorldIds.every(id => WORLDS.some(w => w.id === id)));
    } else {
      assert.equal(d.encounterStatus, 'bioforge-only');
      assert.deepEqual(d.encounterWorldIds, []);
    }
    if (d.legacyCounterpartId) assert.match(ENEMY_ENCYCLOPEDIA_CATALOG_V88.find(e => e.id === d.legacyCounterpartId).name, /Altered$/);
  }
});

test('strict worlds and two-contact quota make every campaign-admitted identity reachable without flooding missions', () => {
  const reached = new Set();
  for (const world of WORLDS) for (let seed = 0; seed < Math.max(40, ENEMY_USER_CAMPAIGN_V88.length); seed++) {
    const entries = selectUserCasteEncountersV88({ world, seed, campaign: { id: 'campaign-contextual', mode: 'campaign' } });
    assert.ok(entries.length <= 2); assert.ok(entries.filter(d => d.caste === 'royal').length <= 1);
    assert.ok(entries.every(d => d.automaticEncounter === true && d.encounterWorldIds.includes(world.id)));
    entries.forEach(d => reached.add(d.id));
  }
  assert.deepEqual([...reached].sort(), AUTOMATIC_CAMPAIGN.map(d => d.id).sort());
  const base = optionsFor(ENEMY_USER_CAMPAIGN_V88[0]);
  for (const changes of [{ world: WORLDS[16] }, { editorProject: {} }, { specialOperationId: 'cargo-brutal' }, { campaign: { id: 'prologue-test' } }]) assert.deepEqual(selectUserCasteEncountersV88({ ...base, ...changes }), []);
});

test('All campaign-admitted static poses actually spawn on the production V52 mission engine, preserving population and native geometry', () => {
  for (const d of AUTOMATIC_CAMPAIGN) {
    const options = optionsFor(d), plain = fixture().engine, actual = fixture().engine;
    plain.start({ ...options, userCasteCampaignV88: false }); actual.start(options);
    const actors = nativeActors(actual), actor = actors.find(e => e.profileId === d.id);
    assert.ok(actor, 'Production mission really spawns ' + d.id);
    if (actor.dormant) {
      assert.equal(actor.alive, false, 'Reserved exterior contact remains dormant before its authored event');
      const spawn = actual.missionLevelSpawns.get(actor.levelSpawnId);
      assert.equal(spawn.active, false);
      assert.ok(spawn.triggerEventId, 'Dormancy belongs to a real mission event, not a missing actor');
      assert.equal(actual.missionLevelEvents.get(spawn.triggerEventId).triggered, false);
    } else assert.ok(actor.alive, 'Native identity is immediately in an active mission spawn');
    assert.equal(actual.enemies.length, plain.enemies.length, 'No extra population for ' + d.id);
    assert.ok(actors.length <= 2); assert.equal(actual.userCasteLoadingV88, false);
    assert.equal(actor.visualSheetId, null); assert.equal(actor.visualImageKey, getEnemyStaticPoseV96(d.id, actor.visualStateV95).imageKey);
    assert.equal(actor.w, d.bodyWidth); assert.equal(actor.h, d.bodyHeight);
    assert.equal(actor.animationStatus, 'missing'); assert.equal(actor.dropsDisabledV80, false);
    if (d.locomotion === 'aquatic') {
      const habitat = actual.missionLevelRuntime.aquaticHabitats.find(entry => entry.id === actor.habitatIdV95);
      assert.ok(habitat, 'Aquatic actor has an authored water volume');
      assert.ok(actor.x >= habitat.x && actor.x + actor.w <= habitat.x + habitat.w);
      assert.ok(actor.y >= habitat.y && actor.y + actor.h <= habitat.y + habitat.h);
    }
    assert.equal(largeMissionActorFitsV72(actor, { platforms: actual.platforms, doors: actual.doors, ...actual.missionLevelBounds }), true, 'No solid overlap ' + d.id);
  }
});

test('real campaign seeds and successive operation serials reach all campaign-admitted static poses without fixture seed changes', () => {
  const reached = new Set();
  for (const world of WORLDS) {
    const campaign = CAMPAIGNS.find(c => c.worldId === world.id && !/survival|prologue/i.test(c.id));
    if (!campaign) continue;
    const mission = buildMissionLevelV52({ world, campaign, levelSeeds: LEVEL_SEEDS, variant: 0 });
    for (let serial = 1; serial <= Math.max(40, ENEMY_USER_CAMPAIGN_V88.length); serial++) {
      for (const d of selectUserCasteEncountersV88({ world, campaign, levelSeed: mission.levelSeed, operationId: `operation-${serial}-campaign` })) reached.add(d.id);
    }
  }
  assert.deepEqual([...reached].sort(), AUTOMATIC_CAMPAIGN.map(d => d.id).sort());
});

test('V96 laboratory-only additions never enter automatic mission encounters or imported mission receipts', () => {
  // Freeze prior campaign coverage instead of silently accepting an accidental
  // demotion when filtering the wider bestiary/laboratory registry above.
  assert.deepEqual(AUTOMATIC_CAMPAIGN.map(d => d.id), HISTORICAL_STATIC_V95.map(d => d.id));
  assert.equal(LAB_ONLY.length, CURRENT_STATIC.length - HISTORICAL_STATIC_V95.length);
  assert.ok(LAB_ONLY.length >= 3);
  for (const d of LAB_ONLY) {
    assert.equal(d.visualRevision, 96);
    assert.equal(d.encounterStatus, 'bioforge-only');
    assert.deepEqual(d.encounterWorldIds, []);
    assert.equal(getBioforgeRosterEntryV80(d.id)?.path, d.path, d.id + ' remains selectable in the lab');
    assert.equal(getCatalogEntryV62(d.id)?.visual.path, d.path, d.id + ' retains a bestiary dossier');
    for (const world of WORLDS) {
      const sanitized = sanitizeUserCasteCampaignV88({ schema: 88, worldId: world.id, entries: [{ profileId: d.id, slot: 0 }] });
      assert.deepEqual(sanitized.entries, [], d.id + ' cannot be injected into a mission receipt');
      for (let seed = 0; seed < CURRENT_STATIC.length; seed++) {
        assert.equal(selectUserCasteEncountersV88({ world, seed, campaign: { id: 'campaign-contextual', mode: 'campaign' } }).some(entry => entry.id === d.id), false);
      }
    }
  }
});

test('native Queen fits all three live mission templates without being resized', () => {
  const d = ENEMY_USER_CAMPAIGN_V88.find(e => e.basename === 'film_queen_aliens_1986');
  for (const templateId of ['ship-interior-vertical', 'colony-multiroute', 'planet-exterior']) {
    const engine = fixture().engine; engine.start(optionsFor(d, { templateId }));
    const queen = nativeActors(engine).find(e => e.profileId === d.id);
    assert.ok(queen); assert.equal(queen.h, d.bodyHeight); assert.equal(queen.isRoyal, true);
  }
});

test('real native update/damage/draw uses own source and produces campaign discovery, not preview discovery', () => {
  const d = ENEMY_USER_CAMPAIGN_V88.find(e => e.basename === 'film_warrior_aliens_1986');
  const { engine, events, draws, ctx } = fixture(); engine.start(optionsFor(d, { mission: false }));
  const actor = nativeActors(engine).find(e => e.profileId === d.id);
  Object.assign(engine.player, { x: actor.x - 190, y: actor.y + actor.h - engine.player.h, alive: true, armor: 0, health: 100 });
  engine.enemyMeleePathClearV64 = () => true;
  const x = actor.x; engine.updateEnemy(actor, .1); assert.ok(actor.x < x);
  actor.x = engine.player.x + engine.player.w + 2; actor.attackClock = 0;
  engine.updateEnemy(actor, .1); assert.ok(engine.player.health < 100);
  actor.facing = -1; engine.drawEnemy(ctx, actor); actor.facing = 1; engine.drawEnemy(ctx, actor);
  const nativeDraws = draws.filter(a => a[0]?.src === d.path);
  assert.equal(nativeDraws.length, 2); assert.ok(nativeDraws.every(a => a.length === 5 && a[3] === d.renderWidth && a[4] === d.renderHeight));
  assert.equal(events.filter(e => e.type === 'enemy-discovered-v88' && e.profileId === d.id).length, 1);
  const hp = actor.health; engine.applyEnemyDamage(actor, 25, { owner: engine.player }); assert.ok(actor.health < hp);
  engine.defeatEnemy(actor, engine.player);
  assert.ok(events.some(e => e.type === 'enemy-defeated-v88' && e.profileId === d.id));
  assert.ok(engine.drops.some(drop => drop.id === 'salvage-' + actor.id && drop.amount > 0));
});

test('native ranged contact fires a real damaging projectile; stationary egg never walks', () => {
  for (const basename of ['game_acm_spitter', 'film_ovomorphe_aliens_1986']) {
    const d = ENEMY_USER_CAMPAIGN_V88.find(e => e.basename === basename), engine = fixture().engine;
    engine.start(optionsFor(d, { mission: false })); const actor = nativeActors(engine).find(e => e.profileId === d.id);
    Object.assign(engine.player, { x: actor.x - 280, y: actor.y + actor.h - engine.player.h, alive: true });
    engine.enemyMeleePathClearV64 = () => true; actor.rangedClock = 0;
    const x = actor.x, count = engine.hostileProjectiles.length;
    engine.updateEnemy(actor, .1);
    if (d.combatRole === 'idle') assert.equal(actor.x, x);
    else { assert.ok(engine.hostileProjectiles.length > count); assert.equal(engine.hostileProjectiles.at(-1).damage, actor.damage); }
  }
});

test('save migration and production restoration retain exact native IDs, damage and non-native actors', () => {
  const d = ENEMY_USER_CAMPAIGN_V88[9], options = optionsFor(d), engine = fixture().engine;
  engine.start(options); const actor = nativeActors(engine)[0]; actor.health -= 20; actor.facing = 1;
  const raw = engine.captureResumeState(), saved = sanitizeOperationResumeState(JSON.parse(JSON.stringify(raw)));
  assert.deepEqual(saved.userCasteCampaignV88, raw.userCasteCampaignV88);
  const restored = fixture().engine; restored.start({ ...options, resumeState: saved });
  assert.equal(restored.lastResumeResult.applied, true);
  assert.deepEqual(restored.enemies.map(e => [e.id, e.alive, e.health]), engine.enemies.map(e => [e.id, e.alive, e.alive ? e.health : 0]));
  assert.deepEqual(nativeActors(restored).map(e => e.profileId), nativeActors(engine).map(e => e.profileId));
  assert.deepEqual(restored.enemies.map(e => [e.id, e.damage, e.speed]), engine.enemies.map(e => [e.id, e.damage, e.speed]), 'Native and Altered combat tuning must survive the same operation');
  const legacy = fixture().engine; legacy.start({ ...options, userCasteCampaignV88: false });
  const oldSave = legacy.captureResumeState(); delete oldSave.userCasteCampaignV88;
  const upgraded = fixture().engine; upgraded.start({ ...options, resumeState: oldSave });
  assert.equal(nativeActors(upgraded).length, 0, 'Existing operations are not mutated mid-run');
});

test('missing native image pauses gameplay honestly with no borrowed atlas fallback', () => {
  const d = ENEMY_USER_CAMPAIGN_V88[9], { engine, draws, ctx } = fixture(); engine.start(optionsFor(d));
  const actor = nativeActors(engine)[0], image = engine.images.get(actor.visualImageKey); image.complete = false;
  const before = engine.player.x; engine.keys.add('KeyD'); engine.update(.1);
  assert.equal(engine.player.x, before); assert.equal(engine.canPerformGameplayAction(), false);
  engine.drawEnemy(ctx, actor); assert.equal(draws.length, 0);
  image.complete = true; engine.refreshUserCasteLoadingV88(); assert.equal(engine.userCasteLoadingV88, false);
});

test('failed or malformed cached native PNG is recreated on mission restart, without stat changes', () => {
  const d = ENEMY_USER_CAMPAIGN_V88[9], options = optionsFor(d), engine = fixture().engine;
  engine.start(options);
  const stats = nativeActors(engine).map(e => [e.id, e.health, e.damage, e.speed]);
  for (const mode of ['network-error', 'wrong-dimensions', 'error-before-complete']) {
    const failed = engine.images.get(d.imageKey), oldCallback = failed.onerror;
    failed.complete = mode !== 'error-before-complete';
    failed.naturalWidth = failed.naturalHeight = mode === 'wrong-dimensions' ? 64 : 0;
    if (mode !== 'wrong-dimensions') failed.onerror();
    assert.equal(engine.refreshUserCasteLoadingV88(), true);
    engine.start(options);
    assert.notEqual(engine.images.get(d.imageKey), failed, mode + ' must be retried');
    assert.equal(engine.userCasteLoadingV88, false);
    assert.deepEqual(engine.userCasteErrorsV88, []);
    oldCallback();
    assert.deepEqual(engine.userCasteErrorsV88, [], 'Replaced image callback cannot contaminate the new mission');
    assert.deepEqual(nativeActors(engine).map(e => [e.id, e.health, e.damage, e.speed]), stats);
  }
});

test('pending native request is reused and rebound while stale prior-mission errors stay isolated', () => {
  const d = ENEMY_USER_CAMPAIGN_V88[9], options = optionsFor(d), engine = fixture().engine;
  engine.start(options);
  const pending = engine.images.get(d.imageKey); pending.complete = false;
  engine.start(options);
  assert.equal(engine.images.get(d.imageKey), pending, 'No duplicate in-flight image on restart');
  assert.equal(engine.ensureUserCasteImageV88(d), pending, 'Repeated ensures reuse the pending request');
  const lateError = pending.onerror;
  const other = ENEMY_USER_CAMPAIGN_V88.find(e => e.basename === 'film_deacon_2012');
  engine.start(optionsFor(other));
  lateError();
  assert.deepEqual(engine.userCasteErrorsV88, [], 'A cached image from another mission cannot publish errors here');
  assert.equal(engine.refreshUserCasteLoadingV88(), false);
  const current = engine.images.get(other.imageKey); current.complete = false;
  engine.start(optionsFor(other));
  assert.equal(engine.images.get(other.imageKey), current);
  current.onerror();
  assert.deepEqual(engine.userCasteErrorsV88, [other.id], 'Reused request reports failure to its current owner');
});

test('encyclopedia searches all admitted static images with 1x1 static disclosure; old profile remains Altered', () => {
  assert.equal(CATALOG_COUNTS_V62.enemies, ENEMIES.length + CURRENT_STATIC.length);
  for (const d of ENEMY_USER_CAMPAIGN_V88) {
    const record = getCatalogEntryV62(d.id), frame = getCatalogSpriteFrameV62(record.visual);
    assert.equal(record.visual.path, d.path); assert.equal(record.visual.visualMode, 'static-pose');
    assert.equal(record.visual.animationStatus, 'missing'); assert.deepEqual(record.canonFacts.claims, {});
    assert.equal(record.visual.identity.canonExact, false); assert.equal(frame.columns, 1); assert.equal(frame.rows, 1);
    assert.ok(searchCatalogV62(d.id, { catalog: 'enemies', limit: 700 }).some(r => r.entry.id === d.id));
  }
  assert.match(getCatalogEntryV62('enemy-005-warrior').name, /Altered$/);
});

test('campaign discovery is isolated, deduplicated, persisted by real SaveSystem and sanitized', () => {
  const id = ENEMY_USER_CAMPAIGN_V88[9].id, save = createDefaultSave();
  const seen = { type: 'enemy-discovered-v88', scope: 'campaign', profileId: id, worldId: WORLDS[0].id, campaignId: CAMPAIGNS[0].id };
  assert.equal(recordEnemyDiscoveryV88(save, { ...seen, scope: 'bioforge' }), false);
  assert.equal(recordEnemyDiscoveryV88(save, seen), true); assert.equal(recordEnemyDiscoveryV88(save, seen), false);
  const kill = { ...seen, type: 'enemy-defeated-v88', receipt: 'operation:88:specimen1' };
  recordEnemyDiscoveryV88(save, kill); recordEnemyDiscoveryV88(save, kill);
  assert.equal(getEnemyDiscoveryV88(save.enemyDiscoveryV88, id).defeated, 1);
  const memory = new Map(), storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
  const writer = new SaveSystem(storage); writer.commit(save); const reader = new SaveSystem(storage); reader.load();
  assert.deepEqual(reader.data.enemyDiscoveryV88, save.enemyDiscoveryV88);
  assert.deepEqual(migrateSave(save).enemyDiscoveryV88, save.enemyDiscoveryV88);
  assert.deepEqual(sanitizeEnemyDiscoveryV88({ schema: 88, entries: { evil: { seen: true } } }).entries, {});
  assert.equal(getEnemyDiscoveryV88(save.enemyDiscoveryV88, 'enemy-005-warrior').seen, false);
  assert.equal(sanitizeUserCasteCampaignV88({ schema: 88, worldId: WORLDS[10].id, entries: [{ profileId: id, slot: 0 }] }).entries.length, 0);
});
