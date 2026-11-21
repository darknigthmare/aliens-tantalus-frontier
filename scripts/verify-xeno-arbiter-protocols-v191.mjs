import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ARBITER_PROGRAMS_V191 as programs, ARBITER_HORDE_PROTOCOLS_V191 as hordes,
  ARBITER_OPERATIONS_V191 as operations, ARBITER_STAGE_HAZARDS_V191 as hazards,
  ARBITER_ARCHIVE_VENUES_V191 as venues, getArbiterProgramV191 as program,
  getArbiterArchiveAccessV191 as access } from '../src/xeno-arbiter-protocols-v191.js';
import { ARBITER_MISSIONS_V190 as missions, createArbiterReceiptV190 } from '../src/xeno-arbiter-campaign-v190.js';
import { XENO_TRIALS_HORDE_PROTOCOLS_V186 as historicalHordes, getXenoTrialsHordeProtocolV180 } from '../src/xeno-trials-horde-v180.js';
import { XENO_TRIALS_OPERATIONS_V188 as historicalOperations, getXenoTrialsOperationV188 } from '../src/xeno-trials-operations-v188.js';
import { XENO_TRIALS_STAGE_HAZARDS_V188 as historicalHazards, getXenoTrialsStageHazardV188,
  validateXenoTrialsStageHazardsV188, getXenoTrialsStageHazardViewV188,
  createXenoTrialsStageHazardsV188, stepXenoTrialsStageHazardsV188 } from '../src/xeno-trials-stage-hazards-v188.js';
import { XENO_TRIALS_STAGES_V96, XENO_TRIALS_FIGHTERS_V96 as fighters, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds, getXenoTrialsGeometryV105 as geometry,
  XENO_TRIALS_ARENA_V105 as arena } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step, getXenoTrialsSnapshotV96 as snapshot,
  restoreXenoTrialsHordeMatchV180 as restore, setXenoTrialsPausedV96 as pause,
  releaseXenoTrialsControlsV150 as releaseControls } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsProgressV96, beginXenoTrialsV96, checkpointXenoTrialsV186,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { normalizeXenoTrialsModesProgressV119, resolveXenoTrialsActivityV119 } from '../src/xeno-trials-modes-v119.js';

const clone = value => JSON.parse(JSON.stringify(value));
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
// Explicit strategic-receipt fixture for unit admission. It is not a claim to
// have played the six investigation missions. Browser QA earns its own profile.
function strategicReturns(count = 6) {
  const selected = missions.slice(0, count);
  return { schema: 190, completedCampaignIds: selected.map(mission => mission.campaignId),
    returns: selected.map((mission, index) => ({ campaignId: mission.campaignId,
      operationId: `operation-${index + 1}-${mission.campaignId}`, receipt: createArbiterReceiptV190(mission) })) };
}
function fixture(entry, playerId = 'queen') {
  const state = createXenoTrialsProgressV96();
  // Acquired-specimen fixture only; live actor HP, waves, clocks, movement,
  // objective work, hazard contacts and verdicts are never injected here.
  if (!state.unlocked.includes(playerId)) state.unlocked.push(playerId);
  const ticket = beginXenoTrialsV96(state, { playerId, activityV119: { branch: entry.branch, id: entry.id } },
    { arbiterProgressV190: strategicReturns() });
  assert.equal(ticket.applied, true, entry.id);
  return { ticket, match: create({ ...ticket.config, introSeconds: 0, holdRoundTransition: true }) };
}
function objectiveControls(match, entry) {
  const state = match.operationV188, player = match.fighters[0];
  const target = entry.kind === 'escort' ? state.cargoX : entry.kind === 'extraction'
    ? state.carrying >= 0 ? entry.depot.x : state.delivered.every(Boolean) ? entry.exit.x
      : entry.objectives[state.completed.findIndex(value => !value)]?.x ?? entry.exit.x
    : entry.objectives[state.completed.findIndex(value => !value)]?.x ?? player.x;
  return { left: player.x > target + 15, right: player.x < target - 15, interact: true,
    heavy: match.tick % 180 === 0, light: match.tick % 180 === 90 };
}
function combatControls(match) {
  const player = match.fighters[0], target = match.fighters.slice(1).sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  return { left: target?.x < player.x, right: target?.x > player.x,
    heavy: match.tick % 180 === 0, light: match.tick % 180 === 90 };
}

test('twenty hordes and twenty objective programs remain separate from byte-identical eighty/forty historical data', () => {
  assert.equal(historicalHordes.length, 80); assert.equal(historicalOperations.length, 40); assert.equal(historicalHazards.length, 40);
  assert.equal(digest(historicalHordes), 'ff18bc21125c776ec2b2c70cc3eab7ff54dc209531eb49b4a0236aff8b702de7');
  assert.equal(digest(historicalOperations), 'd68aac8a2397b18b000be6ba2b9fc69d18ac2b2fe1e395b5ee89955ee493c80a');
  assert.equal(hordes.length, 20); assert.equal(operations.length, 20); assert.equal(programs.length, 40);
  assert.equal(new Set(programs.map(entry => entry.id)).size, 40);
  assert.ok(programs.every(entry => entry.id.length < 64));
  assert.ok(programs.every(entry => entry.archiveV191 && entry.canonExact === false && Object.isFrozen(entry)));
  for (const venue of venues) {
    assert.ok(XENO_TRIALS_STAGES_V96.some(stage => stage.id === venue.stageId));
    assert.equal(hordes.filter(entry => entry.stageId === venue.stageId).length, 5);
    assert.deepEqual(operations.filter(entry => entry.stageId === venue.stageId).map(entry => entry.kind), ['escort', 'relay', 'purge', 'beacon', 'extraction']);
  }
  for (const id of ['constructor', '__proto__', 'xth191-arbiter-vault-6', 'xto191-arbiter-vault-invented']) {
    assert.equal(program(id), null); assert.equal(getXenoTrialsHordeProtocolV180(id), null); assert.equal(getXenoTrialsOperationV188(id), null);
  }
});

test('archive access requires all six ordered validated returns, rejects loose flags and forged or truncated evidence', () => {
  for (let count = 0; count <= 6; count++) {
    const result = access(strategicReturns(count)); assert.equal(result.available, count === 6);
    assert.equal(result.completed, count); assert.equal(result.total, 6); assert.ok(Object.isFrozen(result));
  }
  for (const loose of [null, true, { ready: true }, { unlocked: true, completed: 6 }, { completedCampaignIds: missions.map(mission => mission.campaignId) }])
    assert.equal(access(loose).available, false);
  for (const index of [0, 2, 5]) {
    const bad = strategicReturns(); bad.returns[index].receipt.deviceSerial = 'foreign-module';
    assert.equal(access(bad).available, false); assert.equal(access(bad).completed, index);
  }
  const missing = strategicReturns(); missing.returns.splice(1, 1); assert.equal(access(missing).available, false);
  const reversed = strategicReturns(); reversed.returns.reverse(); assert.equal(access(reversed).completed, 0);
});

test('new tickets require archive context while every historical ticket stays open and entry costs remain zero', () => {
  for (const entry of programs) {
    const state = createXenoTrialsProgressV96(), config = { activityV119: { branch: entry.branch, id: entry.id } };
    assert.equal(beginXenoTrialsV96(state, config).applied, false);
    const locked = beginXenoTrialsV96(state, config, { arbiterProgressV190: strategicReturns(5) });
    assert.equal(locked.applied, false); assert.equal(locked.reason, 'arbiter-archives-locked');
    assert.deepEqual(locked.state, normalizeXenoTrialsProgressV96(state));
    const granted = beginXenoTrialsV96(state, config, { arbiterProgressV190: strategicReturns() });
    assert.equal(granted.applied, true); assert.equal(granted.state.credits, state.credits);
    const activity = resolveXenoTrialsActivityV119(granted.config.activityV119, granted.state.modesV119);
    assert.equal(activity.id, entry.id); assert.equal(activity.branch, entry.branch); assert.equal(activity.reward, entry.reward);
  }
  for (const entry of [...historicalHordes, ...historicalOperations]) {
    const branch = historicalHordes.includes(entry) ? 'horde' : 'operations';
    assert.equal(beginXenoTrialsV96(createXenoTrialsProgressV96(), { activityV119: { branch, id: entry.id } }).applied, true, entry.id);
  }
  const cleared = normalizeXenoTrialsModesProgressV119({ hordeCleared: hordes.map(entry => entry.id), operationsCleared: operations.map(entry => entry.id) });
  assert.deepEqual(cleared.hordeCleared, hordes.map(entry => entry.id));
  assert.deepEqual(cleared.operationsCleared, operations.map(entry => entry.id));
});

for (const entry of hordes) test(`${entry.id}: actual native spawn, low-HP troops, capped pressure and exact reload checkpoint`, () => {
  assert.equal(getXenoTrialsHordeProtocolV180(entry.id), entry); assert.equal(program(entry.id), entry);
  assert.equal(entry.branch, 'horde'); assert.equal(entry.totalEnemies, entry.waves.reduce((sum, wave) => sum + wave.total, 0));
  for (const wave of entry.waves) {
    assert.ok(wave.hp >= 15 && wave.hp <= 35); assert.ok(wave.concurrent >= 3 && wave.concurrent <= 8);
    assert.ok(wave.total >= wave.concurrent); assert.ok(wave.opponentIds.every(id => getXenoTrialsFighterV96(id)));
    for (const slot of wave.enemySlotsV186 || []) assert.ok(slot.rank === 'boss' ? slot.hp > 35 : slot.hp >= 15 && slot.hp <= 35);
  }
  const { ticket, match } = fixture(entry); assert.equal(match.config.stageId, entry.stageId);
  assert.ok(match.fighters.length >= 4 && match.fighters.length <= 9); assert.equal(match.stageHazardsV188, undefined);
  assert.ok(match.fighters.slice(1).every(actor => actor.hp >= 15 && actor.hp <= 35));
  for (let tick = 0; tick < 180; tick++) step(match, 1 / 120, combatControls(match));
  assert.ok(match.fighters.length <= 9);
  const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true);
  const normalized = normalizeXenoTrialsProgressV96(clone(saved.state)); assert.ok(normalized.pending.checkpointV186);
  const loaded = restore(normalized.pending.checkpointV186.snapshot); assert.ok(loaded);
  assert.deepEqual(loaded.fighters, match.fighters); assert.deepEqual(loaded.hordeV180, match.hordeV180); assert.equal(loaded.rng, match.rng);
  assert.equal(loaded.config.activityV119.id, entry.id); assert.equal(loaded.config.stageId, entry.stageId);
});

test('only four explicitly advertised level-five hordes contain the four new drawn major contacts', () => {
  const bosses = hordes.filter(entry => entry.bossFinaleV186);
  assert.equal(bosses.length, 4);
  assert.deepEqual(bosses.map(entry => entry.bossFinaleV186.fighterId), ['chrysalis', 'user-brute', 'smasher', 'defender']);
  for (const entry of bosses) {
    assert.equal(entry.level, 5); assert.equal(entry.bossFinaleV186.wave, entry.waves.length);
    assert.match(entry.description, new RegExp(`${entry.bossFinaleV186.hp} PV`));
    const slots = entry.waves.at(-1).enemySlotsV186;
    assert.equal(slots.filter(slot => slot.rank === 'boss').length, 1); assert.equal(slots.filter(slot => slot.rank === 'troop').length, 2);
    assert.equal(slots[0].fighterId, entry.bossFinaleV186.fighterId); assert.equal(slots[0].hp, entry.bossFinaleV186.hp);
  }
  for (const entry of operations) assert.equal(getXenoTrialsHordeProtocolV180(entry.hordeProtocolId).bossFinaleV186, undefined);
});

for (const entry of operations) test(`${entry.id}: native objective, CPUs, warned machinery, save/reload and exactly one settlement`, t => {
  assert.equal(getXenoTrialsOperationV188(entry.id), entry); assert.equal(program(entry.id), entry);
  const { ticket, match: initial } = fixture(entry); let match = initial, state = ticket.state, reloaded = false;
  assert.equal(match.operationV188.operationId, entry.id); assert.equal(match.config.stageId, entry.stageId);
  assert.ok(match.stageHazardsV188); assert.equal(getXenoTrialsStageHazardViewV188(match).stageId, entry.stageId);
  while (!match.result && match.tick < (entry.roundSeconds + 1) * 120) {
    step(match, 1 / 120, objectiveControls(match, entry));
    if (!reloaded && match.tick === 600 && !match.result) {
      const saved = checkpointXenoTrialsV186(state, match); assert.equal(saved.applied, true, `${entry.id}: native checkpoint`);
      state = saved.state; const normalized = normalizeXenoTrialsProgressV96(clone(state)); assert.ok(normalized.pending.checkpointV186);
      const loaded = restore(normalized.pending.checkpointV186.snapshot); assert.ok(loaded);
      assert.deepEqual(loaded.fighters, match.fighters); assert.deepEqual(loaded.operationV188, match.operationV188);
      assert.deepEqual(loaded.stageHazardsV188, match.stageHazardsV188); assert.equal(loaded.rng, match.rng);
      match = loaded; pause(match, false); releaseControls(match, 'player', {}); reloaded = true;
    }
  }
  assert.equal(reloaded, true); assert.ok(match.result); assert.equal(match.result.rounds, 1);
  assert.equal(match.result.operationV188.state.operationId, entry.id);
  assert.equal(match.result.operationV188.state.status, match.result.winner === 'player' ? 'completed' : 'failed');
  if (['escort', 'relay', 'purge'].includes(entry.kind)) assert.equal(match.result.winner, 'player', 'native controls complete each short objective route');
  assert.ok(validateXenoTrialsStageHazardsV188(match.result.stageHazardsV188, { stageId: entry.stageId, seed: match.config.seed, tick: match.tick }));
  const settled = settleXenoTrialsV96(state, match.result); assert.equal(settled.applied, true);
  assert.equal(settled.state.pending, null); assert.equal(settled.state.ledger.length, 1);
  assert.equal(settled.state.modesV119.operationsCleared.includes(entry.id), match.result.winner === 'player');
  assert.equal(settleXenoTrialsV96(settled.state, match.result).applied, false);
  t.diagnostic(JSON.stringify({ operationId: entry.id, winner: match.result.winner, reason: match.result.reason,
    ticks: match.tick, hp: match.fighters[0].hp, integrity: match.operationV188.integrity,
    objectiveCount: match.operationV188.completed.filter(Boolean).length, reloadVerified: reloaded,
    awardedPrime: settled.receipt.modeReward.bonus }));
});

test('four new physical hazards preserve existing forty definitions and use canonical V188 warning and damage limits', () => {
  assert.equal(hazards.length, 4); assert.equal(historicalHazards.length, 40);
  assert.deepEqual(hazards.map(entry => entry.stageId), venues.map(venue => venue.stageId));
  for (const hazard of hazards) {
    assert.equal(getXenoTrialsStageHazardV188(hazard.stageId), hazard); assert.equal(hazard.affectsCombat, true);
    assert.ok(['steam', 'cryo', 'debris', 'arc'].includes(hazard.kind)); assert.ok(hazard.warningTicks >= 600);
    assert.ok(hazard.damage <= 8); assert.equal(hazard.anchors.length, 2);
    assert.ok(hazard.anchors.every(anchor => anchor - hazard.width / 2 > 0 && anchor + hazard.width / 2 < 1500));
  }
});

for (const hazard of hazards) test(`${hazard.stageId}: actual warning, collision, HP accounting and both physical escape edges`, () => {
  // Explicit native-body collision boundary fixture, not a played match. The
  // real hazard controller supplies contacts through an engine-shaped callback.
  const anchor = hazard.anchors[191 % hazard.anchors.length];
  const actor = { id: 'warrior', side: 'player', x: anchor, y: 0, facing: 1, hp: 200 };
  actor.x += anchor - bounds(actor).center;
  const match = { config: { stageId: hazard.stageId, operationV188: { id: 'arbiter-collision-fixture' } },
    operationV188: { operationId: 'arbiter-collision-fixture', status: 'active' },
    stageHazardsV188: createXenoTrialsStageHazardsV188(hazard.stageId, 191), fighters: [actor],
    tick: hazard.graceTicks, phase: 'active', paused: false, result: null };
  const advance = () => stepXenoTrialsStageHazardsV188(match, bounds, arena,
    hit => { hit.to.hp = Math.max(0, hit.to.hp - hit.damage); });
  assert.equal(advance(), 0); assert.equal(getXenoTrialsStageHazardViewV188(match).phase, 'warning'); assert.equal(actor.hp, 200);
  match.tick += hazard.warningTicks - 1; assert.equal(advance(), 0); assert.equal(actor.hp, 200);
  match.tick++; assert.equal(advance(), 1); assert.equal(actor.hp, 200 - hazard.damage);
  assert.equal(match.stageHazardsV188.playerDamage, hazard.damage); assert.equal(match.stageHazardsV188.contacts, 1);
  assert.equal(advance(), 0, 'same native tick cannot replay accepted contact');
  assert.ok(validateXenoTrialsStageHazardsV188(match.stageHazardsV188, { stageId: hazard.stageId, seed: 191, tick: match.tick }));
  for (const direction of [-1, 1]) {
    const body = bounds(actor), escaped = { ...actor, hp: 200,
      x: actor.x + direction * ((hazard.width + body.width) / 2 + 1) };
    const dodge = { ...match, fighters: [escaped], stageHazardsV188: createXenoTrialsStageHazardsV188(hazard.stageId, 191) };
    assert.equal(stepXenoTrialsStageHazardsV188(dodge, bounds, arena, hit => { hit.to.hp -= hit.damage; }), 0);
    assert.equal(escaped.hp, 200);
  }
});

test('all 189 native statures can leave each new warned strip after a 0.6-second reaction allowance', () => {
  assert.equal(fighters.length, 189);
  for (const hazard of hazards) for (const fighter of fighters) {
    const shape = geometry(fighter.id), distance = (shape.width + hazard.width) / 2 + 2;
    assert.ok(fighter.speed * (hazard.warningTicks / 120 - .6) > distance, `${hazard.stageId}/${fighter.id}`);
    for (const anchor of hazard.anchors) {
      assert.ok(anchor - hazard.width / 2 - shape.width > arena.left);
      assert.ok(anchor + hazard.width / 2 + shape.width < arena.right);
    }
  }
});

test('a complete native twelve-contact archive horde pays its authored prime once and never pays a repeated result or cleared replay prime', () => {
  const entry = hordes[0], { ticket, match } = fixture(entry, 'warrior');
  while (!match.result && match.tick < entry.roundSeconds * 120) step(match, 1 / 120, combatControls(match));
  assert.equal(match.result?.winner, 'player'); assert.equal(match.result.hordeV180.kills, 12);
  const settled = settleXenoTrialsV96(ticket.state, match.result); assert.equal(settled.applied, true);
  assert.ok(settled.state.modesV119.hordeCleared.includes(entry.id)); assert.equal(settled.state.ledger.length, 1);
  assert.equal(settled.state.ledger[0].modeReward.bonus, entry.reward);
  const duplicate = settleXenoTrialsV96(settled.state, match.result); assert.equal(duplicate.applied, false); assert.equal(duplicate.state.credits, settled.state.credits);
  const replay = beginXenoTrialsV96(settled.state, { playerId: 'warrior', activityV119: { branch: 'horde', id: entry.id } }, { arbiterProgressV190: strategicReturns() });
  assert.equal(replay.applied, true); const again = create({ ...replay.config, introSeconds: 0, holdRoundTransition: true });
  while (!again.result && again.tick < entry.roundSeconds * 120) step(again, 1 / 120, combatControls(again));
  assert.equal(again.result?.winner, 'player'); const replaySettled = settleXenoTrialsV96(replay.state, again.result);
  assert.equal(replaySettled.applied, true); assert.equal(replaySettled.state.ledger.at(-1).modeReward.bonus, 0);
});
