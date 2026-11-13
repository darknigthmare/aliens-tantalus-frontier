import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, CONTENT_COUNTS, WORLDS, WEAPONS, ENEMIES } from '../src/content.js';
import { ARBITER_DEVICE_V190, ARBITER_CAMPAIGNS_V190, ARBITER_MISSIONS_V190,
  createArbiterCampaignProgressV190, normalizeArbiterCampaignProgressV190, arbiterCampaignAccessV190,
  createArbiterReceiptV190, createArbiterMissionStateV190, validateArbiterMissionStateV190,
  validateArbiterCompletionV190, recordArbiterCampaignReturnV190 } from '../src/xeno-arbiter-campaign-v190.js';
import { buildArbiterMissionV190 } from '../src/xeno-arbiter-runtime-v190.js';

import { previousProgress, fixture, tick, walk, hold, finish } from './xeno-arbiter-test-helpers-v190.mjs';

// These are six distinct original investigative operations. No ancient IDs,
// 1:1 art proof, physical corporate trial or live captive is invented here.
test('six authored ARBITER chapters extend the real campaign catalog and have connected physical alternatives', () => {
  assert.equal(CONTENT_COUNTS.campaigns, 461);
  assert.equal(CAMPAIGNS.filter(c => c.id.startsWith('special-arbiter-')).length, 6);
  assert.equal(ARBITER_DEVICE_V190.canonExact, false);
  const signatures = new Set();
  for (const campaign of ARBITER_CAMPAIGNS_V190) {
    const plan = buildArbiterMissionV190({ campaign }); signatures.add(plan.signature);
    assert.equal(plan.validation.valid, true); assert.equal(plan.validation.physicalValid, true);
    assert.equal(plan.graph.routes.length, 2); assert.equal(plan.geometry.ladders.length, 2);
    assert.ok(plan.arbiterMissionV190.stations.every(s => s.groundY === 570 && s.x < 1870));
  }
  assert.equal(signatures.size, 6);
});

test('progress is derived from consecutive verified receipts, ignores naked IDs and cannot skip to local MIRE', () => {
  assert.equal(arbiterCampaignAccessV190(null, ARBITER_CAMPAIGNS_V190[0].id).available, true);
  assert.equal(arbiterCampaignAccessV190(null, ARBITER_CAMPAIGNS_V190[1].id).available, false);
  assert.deepEqual(normalizeArbiterCampaignProgressV190({ schema: 190, completedCampaignIds: ARBITER_CAMPAIGNS_V190.map(c => c.id), returns: [] }), createArbiterCampaignProgressV190());
  const raw = previousProgress(6); assert.equal(raw.returns.length, 6);
  raw.returns[2].receipt.deviceSerial = 'forged';
  assert.equal(normalizeArbiterCampaignProgressV190(raw).returns.length, 2);
  assert.throws(() => fixture(5, { arbiterProgressV190: createArbiterCampaignProgressV190() }), /previous extracted evidence/);
});

for (let index = 0; index < 6; index++) test(`chapter ${index + 1}: native keyboard travel, local holds, physical gate and extraction create one complete durable receipt`, () => {
  const f = fixture(index), actor = f.engine.player;
  assert.equal(f.engine.enemies.length, 0, 'Quiet abandoned-site recovery, not a fictional combat victory.');
  assert.equal(f.engine.completeMission(), false);
  assert.equal(f.engine.doors[0].levelLocked, true);
  finish(f);
  assert.equal(f.engine.player, actor);
  assert.equal(f.engine.completeMission(), false);
  assert.equal(f.events.filter(e => e.type === 'mission-complete').length, 1);
  const victory = f.victory(); assert.ok(victory);
  assert.equal(f.engine.validateArbiterResumeV190(victory.resumeState).valid, true);
  const args = { campaignId: f.campaign.id, operationId: `operation-${index + 1}-${f.campaign.id}`, success: true,
    arbiterV190: victory.report.arbiterV190, resumeState: victory.resumeState, rewards: victory.event.rewards };
  assert.equal(validateArbiterCompletionV190(args).valid, true);
  const recorded = recordArbiterCampaignReturnV190(previousProgress(index), args);
  assert.equal(recorded.applied, true); assert.equal(recorded.state.returns.length, index + 1);
  assert.equal(recordArbiterCampaignReturnV190(recorded.state, args).reason, 'already-recorded');
  assert.equal(victory.report.arbiterV190.receipt.localMireEnabled, index === 5);
  f.engine.stop();
});

test('E at insertion or a future station cannot advance evidence, and the closed gate blocks real horizontal movement', () => {
  const f = fixture(); f.key('keydown', 'KeyE'); tick(f.engine, 4); f.key('keyup', 'KeyE');
  assert.equal(f.engine.arbiterV190.stage, 0);
  walk(f, f.mission.stations[1].x); f.key('keydown', 'KeyE'); tick(f.engine, 4); f.key('keyup', 'KeyE');
  assert.equal(f.engine.arbiterV190.stage, 0);
  f.key('keydown', 'KeyD'); tick(f.engine, 8); f.key('keyup', 'KeyD'); tick(f.engine, .2);
  assert.ok(f.engine.player.x + f.engine.player.w <= 1871);
  assert.equal(f.engine.arbiterV190.exitProgress, 0); assert.equal(f.engine.mission.state, 'active'); f.engine.stop();
});

test('pause freezes a fractional local hold and a real second engine restores it without keys or replayed milestones', () => {
  const f = fixture(1); walk(f, f.mission.stations[0].x);
  f.key('keydown', 'KeyE'); tick(f.engine, .75); f.engine.paused = true;
  const before = f.engine.arbiterV190.channelProgress; tick(f.engine, 2); assert.equal(f.engine.arbiterV190.channelProgress, before);
  const raw = f.engine.captureResumeState(); assert.equal(f.engine.validateArbiterResumeV190(raw).valid, true); f.engine.stop();
  const resumed = fixture(1, { resumeState: raw }); assert.equal(resumed.engine.lastResumeResult.applied, true);
  assert.equal(resumed.engine.arbiterV190.channelProgress, before); assert.equal(resumed.engine.keys.size, 0);
  resumed.engine.paused = false; tick(resumed.engine, 1); assert.equal(resumed.engine.arbiterV190.channelProgress, before);
  resumed.key('keydown', 'KeyE'); tick(resumed.engine, 1.4); resumed.key('keyup', 'KeyE');
  assert.equal(resumed.engine.arbiterV190.stage, 1);
  assert.equal(resumed.events.filter(e => e.type === 'arbiter-radio-v190' && e.id === 'gallery-power').length, 1);
  resumed.engine.stop();
});

test('a return requires a matching complete native snapshot and cannot be paid from a receipt or another operation alone', () => {
  const f = fixture(); finish(f); const v = f.victory();
  const args = { campaignId: f.campaign.id, operationId: `operation-1-${f.campaign.id}`, success: true,
    arbiterV190: v.report.arbiterV190, resumeState: v.resumeState, rewards: v.event.rewards };
  for (const change of [
    a => { a.resumeState = null; }, a => { a.operationId = 'operation-1-special-archive-relay'; },
    a => { a.operationId = `operation-999-${f.campaign.id}`; },
    a => { a.resumeState.schema = 999; },
    a => { a.resumeState.missionLevel.signature = 42; },
    a => { a.resumeState.missionLevel.signature = {}; },
    a => { a.arbiterV190.unrecognized = true; },
    a => { a.rewards = null; }, a => { a.rewards = {}; },
    a => { a.resumeState.identity.campaignId = ARBITER_CAMPAIGNS_V190[1].id; },
    a => { a.resumeState.mission.state = 'active'; }, a => { a.resumeState.player.x = 200; },
    a => { a.arbiterV190.receipt.evidenceIds = []; }, a => { a.rewards.credits++; }
  ]) { const copy = structuredClone(args); change(copy); assert.equal(validateArbiterCompletionV190(copy).valid, false); }
  assert.equal(validateArbiterCompletionV190(args).valid, true); f.engine.stop();
});

test('resume rejects skipped stations, wrong gate, incompatible chapter and remote partial progress without mutating current mission', () => {
  const f = fixture(); hold(f, f.mission.stations[0]); const raw = f.engine.captureResumeState();
  const current = structuredClone(f.engine.arbiterV190);
  for (const change of [
    s => { s.arbiterMissionV190.state.completedStationIds = ['guest-route']; },
    s => { s.missionLevel.doors[0].open = true; },
    s => { s.identity.campaignId = ARBITER_CAMPAIGNS_V190[1].id; },
    s => { s.arbiterMissionV190.state.channelProgress = .5; },
    s => { s.player.x = 2000; }
  ]) { const copy = structuredClone(raw); change(copy); assert.equal(f.engine.applyResumeState(copy).applied, false); assert.deepEqual(f.engine.arbiterV190, current); }
  const malformed = createArbiterMissionStateV190(f.campaign.id); malformed.stage = 2;
  assert.equal(validateArbiterMissionStateV190(malformed).valid, false); f.engine.stop();
});

test('the service route is traversed up and down by native ladder controls without moving the actor by assignment', () => {
  const f = fixture(); walk(f, 671);
  f.key('keydown', 'KeyW'); tick(f.engine, 2.6); f.key('keyup', 'KeyW'); tick(f.engine, .2);
  assert.ok(Math.abs(f.engine.player.y + f.engine.player.h - 355) < 28, `Upper approach not reached: ${f.engine.player.y}`);
  walk(f, 1451);
  f.key('keydown', 'KeyS'); tick(f.engine, 2.8); f.key('keyup', 'KeyS'); tick(f.engine, .2);
  assert.ok(Math.abs(f.engine.player.y + f.engine.player.h - 570) < 28, `Lower approach not reached: ${f.engine.player.y}`);
  assert.equal(f.engine.arbiterV190.stage, 0); f.engine.stop();
});

test('failure after an accepted station restores the actual saved checkpoint and increments only the retry counter', () => {
  const f = fixture(); hold(f, f.mission.stations[0]);
  const checkpointX = f.engine.player.x; walk(f, 900);
  f.engine.failMission('Declared native failure fixture');
  assert.equal(f.engine.mission.state, 'failed');
  assert.equal(f.engine.restartFromCheckpoint(), true); assert.equal(f.engine.mission.state, 'active');
  assert.equal(f.engine.arbiterV190.stage, 1); assert.ok(Math.abs(f.engine.player.x - checkpointX) < 1);
  assert.equal(f.engine.mission.retries, 1); assert.equal(f.engine.arbiterV190.complete, false);
  assert.equal(f.events.filter(e => e.type === 'mission-complete').length, 0); f.engine.stop();
});
