// Regression tests for the QZ-17 / QZ-18 story missions bug hunt (2026-11-14).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, host, prepare, tick } from './engine-host-v188.mjs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content-core-v50.js';
import { QZ17_CAMPAIGN_ID_V188 } from '../src/mission-depth-v188.js';
import { ARCHIVE_RELAY_CAMPAIGN_V122 } from '../src/archive-relay-state-v122.js';
import { buildArchiveRelayLevelV122 } from '../src/archive-relay-runtime-v122.js';
import { buildObjectivePanelV188 } from '../src/mission-objective-panel-v188.js';
import { createDefaultSave } from '../src/save.js';
import { deriveStoryCampaignV188, STORY_RELAY_CAMPAIGN_ID_V188 } from '../src/story-campaign-v188.js';

const QZ17 = { id: QZ17_CAMPAIGN_ID_V188, templateId: 'ship-interior-vertical', worldId: 'world-05-lethe', objective: 'investigate the ghost cargo' };
const SHIP = { ...CAMPAIGNS[0], templateId: 'ship-interior-vertical' };
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('QZ-17 resume: the depth in the cargo hold survives a resume applied by start()', async () => {
  const { engine } = await fixture({ campaign: QZ17, seed: 7 });
  const section = engine.missionDepthSectionV188, p = engine.player;
  p.x = section.x0 + 40; p.y = section.floorY - p.h; p.vy = 0; p.grounded = true; p.depthZ = -50;
  const state = engine.captureResumeState();
  const resumed = (await fixture({ campaign: QZ17, seed: 7, options: { resumeState: structuredClone(state) } })).engine;
  assert.equal(resumed.lastResumeResult?.applied, true);
  assert.equal(resumed.player.x, p.x);
  assert.equal(resumed.player.depthZ, -50, 'the marine is back in the same depth lane');
});

test('resume: the power and archive checkpoints are kept, a death after a reload does not restart at insertion', async () => {
  for (const id of ['power', 'archive']) {
    const { engine } = await fixture({ campaign: QZ17, seed: 7 });
    engine.setCheckpoint(id, 2500, 776);
    const state = engine.captureResumeState();
    const resumed = (await fixture({ campaign: QZ17, seed: 7, options: { resumeState: structuredClone(state) } })).engine;
    assert.deepEqual({ ...resumed.checkpoint }, { id, x: 2500, y: 776 });
  }
});

test('QZ-17 hold: dormant sleepers keep their depth behind the rows until they wake', async () => {
  const { engine } = await fixture({ campaign: QZ17, seed: 7, keepEnemies: true });
  const sleepers = engine.enemies.filter(enemy => enemy.levelSpawnId === 'ship-cargo-stalkers' && enemy.dormant && enemy.depthZ);
  assert.ok(sleepers.length >= 2, 'sleepers are placed at a depth slot');
  const before = sleepers.map(enemy => enemy.depthZ);
  tick(engine, 0.5);
  assert.deepEqual(sleepers.map(enemy => enemy.depthZ), before);
});

test('ship template: the decompression wakes the cargo stalkers it declares as trigger', async () => {
  const { engine, events } = await fixture({ campaign: QZ17, seed: 7, keepEnemies: true });
  const stalkers = engine.enemies.filter(enemy => enemy.levelSpawnId === 'ship-cargo-stalkers');
  assert.ok(stalkers.length > 0 && stalkers.every(enemy => enemy.dormant && enemy.alive === false));
  assert.equal(engine.triggerMissionLevelEvent('ship-decompression', 'qa'), true);
  assert.ok(stalkers.every(enemy => !enemy.dormant && enemy.alive === true), 'the hold has its three stalkers');
  assert.equal(engine.missionLevelSpawns.get('ship-cargo-stalkers').active, true);
  const event = events.find(entry => entry.type === 'mission-level-event' && entry.eventId === 'ship-decompression');
  assert.ok(event.consequences.some(entry => entry.action === 'spawn:ship-cargo-stalkers' && entry.changed > 0));
});

test('mission start: no awake patrol is placed on the insertion node', async () => {
  for (const campaign of [QZ17, SHIP]) {
    const { engine } = await fixture({ campaign, seed: 7, keepEnemies: true });
    const p = engine.player, centre = p.x + p.w / 2;
    const close = engine.enemies.filter(enemy => !enemy.dormant && enemy.alive !== false
      && Math.abs(enemy.x + enemy.w / 2 - centre) < 200 && Math.abs(enemy.y + enemy.h - p.y - p.h) < 40);
    assert.deepEqual(close.map(enemy => enemy.id), [], `${campaign.id}: insertion is clear`);
  }
});

test('ship template: the wide pressure airlock is operable from where its frame stops the marine', async () => {
  for (const campaign of [QZ17, SHIP]) {
    const { engine } = await fixture({ campaign, seed: 7 });
    const p = engine.player, door = engine.doors.find(entry => entry.id === 'outer-airlock');
    const frame = engine.getDoorRenderState(door, { open: false });
    engine.hazards = []; engine.supplies = []; engine.drops = [];
    p.x = frame.x - p.w - 50; p.y = door.y + door.h - p.h; p.vy = 0; p.grounded = true;
    engine.keys.add('KeyD'); tick(engine, 1.2); engine.keys.delete('KeyD');
    assert.ok(p.x + p.w <= frame.x + 1, 'stopped by the closed frame');
    assert.equal(engine.getInteractionPrompt(), 'E  ACTIONNER LA PORTE');
    assert.equal(engine.interact(p), true); assert.equal(door.open, true, `${campaign.id}: the airlock opens`);
  }
  // Narrow bulkheads keep the former reach.
  const { engine } = await fixture({ campaign: QZ17, seed: 7 });
  assert.equal(engine.doorInteractionReachV188(engine.doors.find(entry => entry.id === 'dock-bulkhead'), engine.player), 118);
});

test('an electrical strip stuns, then leaves a window to step off it: it can be crossed', async () => {
  const { engine } = await fixture({ campaign: QZ17, seed: 7 });
  // The QZ-17 seed strip in front of the outer airlock (measured in the level: 4311-4471, electrical, 24 damage).
  const p = engine.player, floor = engine.platforms.find(entry => entry.id === 'node-platform-ship-airlock');
  const strip = { id: 'ship-hazard-seed', kind: 'electrical', effect: 'shock', x: 4311, y: floor.y - 20, w: 160, h: 20, damage: 24, stun: 1.25, impulse: 80, active: true };
  engine.hazards = [strip]; engine.doors = engine.doors.filter(entry => entry.id !== 'outer-airlock'); engine.supplies = [];
  p.health = p.maxHealth = 100; p.armor = 0;
  p.x = strip.x - p.w - 20; p.y = strip.y + strip.h - p.h; p.vy = 0; p.grounded = true;
  engine.keys.add('KeyD');
  for (let t = 0; t < 8 && p.x < strip.x + strip.w + 4; t += 0.1) tick(engine, 0.1);
  engine.keys.delete('KeyD');
  assert.ok(p.x > strip.x + strip.w, 'past the live strip');
  assert.equal(p.alive, true); assert.ok(p.health > 40, `still standing (${p.health})`);
});

test('QZ-17: once the evidence is analysed, the gate and the duct reopen the archives for the verdict', async () => {
  const { engine, events } = await fixture({ campaign: QZ17, seed: 7 });
  // Declared injection: the four pieces are analysed and no route verdict is recorded yet.
  engine.narrativeEvidenceAnalyzedV68 = () => true; engine.narrativeEvidenceCompleteV68 = () => false;
  const p = engine.player, duct = engine.vents.find(entry => entry.id === 'ship-command-depth-entrance');
  p.x = duct.x + duct.w / 2 - p.w / 2; p.y = duct.y + duct.h - p.h;
  assert.equal(engine.interact(p), true);
  assert.equal(events.filter(entry => entry.type === 'archive-reader-open').length, 1);
  const gate = engine.doors.find(entry => entry.id === 'aft-bulkhead');
  p.x = gate.x - 80; p.y = gate.y + gate.h - p.h;
  assert.equal(engine.interact(p), true);
  assert.equal(events.filter(entry => entry.type === 'archive-reader-open').length, 2);
  engine.narrativeEvidenceCompleteV68 = () => true; events.length = 0;
  engine.interact(p);
  assert.equal(events.filter(entry => entry.type === 'archive-reader-open').length, 0, 'not once the verdict is recorded');
});

test('objective panel: QZ-17 reads its chapter goal in French, QZ-18 lists the investigation steps', async () => {
  const { engine } = await fixture({ campaign: QZ17, seed: 7 });
  assert.match(engine.objectivePanelModelV188().campaignObjective, /^Enquêter sur la cargaison fantôme/);
  const browser = host(), level = buildArchiveRelayLevelV122({ campaign: ARCHIVE_RELAY_CAMPAIGN_V122, world: WORLDS.find(entry => entry.id === 'world-05-lethe'), levelSeeds: LEVEL_SEEDS, seed: 160 });
  const relay = new GameEngine(browser.canvas, { onEvent: () => {} });
  relay.start({ campaign: ARCHIVE_RELAY_CAMPAIGN_V122, world: WORLDS.find(entry => entry.id === 'world-05-lethe'), missionLevel: level, levelSeed: level.levelSeed,
    weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [], seed: 160 });
  await prepare(relay);
  let model = relay.objectivePanelModelV188();
  assert.deepEqual(model.steps.map(step => step.key), ['badge', 'power', 'archive', 'route', 'extract']);
  assert.ok(model.steps.every(step => !step.done)); assert.match(model.steps[3].label, /verdict/);
  relay.archiveRelayV122.badge = true; relay.archiveRelayV122.power = true;
  model = relay.objectivePanelModelV188();
  assert.deepEqual(model.steps.map(step => step.done), [true, true, false, false, false], 'done steps stay listed, also after a resume');
  // Other missions keep the generic steps.
  assert.deepEqual(buildObjectivePanelV188({ objectives: { power: false, extract: false }, initial: { power: false } }).steps.map(step => step.key), ['power', 'extract']);
});

test('story: no ★ objective once QZ-18 and QZ-17 are done; the QZ-18 plan stops hiding the next chapter', () => {
  const save = createDefaultSave(1); save.needsPlayerCreationV84 = false;
  for (const key of ['onboardingV84', 'openingV88', 'portMeridienV90']) if (save[key]) save[key].phase = 'complete';
  save.galaxy.completedCampaignIds.push(STORY_RELAY_CAMPAIGN_ID_V188); save.storyCampaignV188.debriefSeen.push(STORY_RELAY_CAMPAIGN_ID_V188);
  const next = deriveStoryCampaignV188(save, { language: 'fr' });
  assert.equal(next.step, 'next'); assert.match(next.objective, /★/); assert.equal(next.recommendedCampaignId, QZ17_CAMPAIGN_ID_V188);
  save.galaxy.completedCampaignIds.push(QZ17_CAMPAIGN_ID_V188);
  const done = deriveStoryCampaignV188(save, { language: 'fr' });
  assert.equal(done.recommendedCampaignId, null); assert.equal(done.objective, null);
  assert.match(read('src/app.js'), /if \(candidate\.strategy\.plannedCampaignId === STORY_RELAY_CAMPAIGN_ID_V188\) candidate\.strategy\.plannedCampaignId = null;\n\s+saveSystem\.commit\(candidate\); renderHubStatus\?\.\(\); renderCampaigns\(\);/);
});
