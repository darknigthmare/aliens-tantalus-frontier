// V188 spec 007 follow-up — the Asphodèle station, second pass: the four reopened
// modules (quarters, medbay, lower decks, repair hangar) with their unlocks, doors
// and physical round trips; the effects of the six local contracts, applied once;
// the Crucible market (Q30 A) with its refusals and no exploitable loop; the ambient
// crowds of bible §42.2 kept out of every doorway; the station dressing of the
// station missions; the small fixes (objective toast, hazard band, gangway label,
// « ★ » names); save round trip, resume and old saves; i18n and distribution.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDefaultSave, migrateSave, getOperationBrief } from '../src/save.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { useCatalogV185, autoTranslateV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';
import {
  ASPHODELE_CONTRACTS_V188, ASPHODELE_NIGHT_MISSIONS_V188, ASPHODELE_CONTRACT_EFFECTS_V188, asphodeleStationIndicesV188, asphodeleRiskReductionV188,
  asphodeleContractEffectTextV188, applyAsphodeleOperationResultV188, contractCountV188, asphodeleMissionLockReasonV188, ASPHODELE_NIGHT_NAMES_EN_V188
} from '../src/asphodele-missions-v188.js';
import {
  ASPHODELE_ROOMS_V188, ASPHODELE_ROOM_IDS_V188, ASPHODELE_REOPENED_MODULES_V188, ASPHODELE_DEFERRED_MODULES_V188, getAsphodeleDoorV188,
  doorLockV188, asphodeleDoorTargetV188, asphodeleLockTextV188, normalizeAsphodeleHubV188, createAsphodeleHubV188, resolveAsphodeleHubV188,
  boardAsphodeleV188, asphodeleSaveViewV188, ASPHODELE_METRE_PX_V188
} from '../src/asphodele-hub-v188.js';
import {
  ASPHODELE_MARKET_OFFERS_V188, asphodeleMarketViewV188, tradeAsphodeleMarketV188, upgradeCheyenneV188, cheyenneFuelSavingV188, CHEYENNE_UPGRADES_V188,
  settleQuartersV188, medbayPatientV188, ASPHODELE_SERVICE_TEXT_V188, asphodeleRefusalTextV188, missingResourcesV188
} from '../src/asphodele-economy-v188.js';
import { createAsphodeleCrowdV188, stepAsphodeleCrowdV188, asphodeleCrowdClearsDoorwaysV188, asphodeleRoomBaysV188, clearStationDoorwayPostV188,
  ASPHODELE_CROWD_ROSTER_V188, ASPHODELE_WORKER_SIZE_V188 } from '../src/asphodele-crowd-v188.js';
import { ASPHODELE_HUB_SLOT_IDS_V188, ASPHODELE_HUB_FILES_PRESENT_V188, drawAsphodeleWallV188 } from '../src/asphodele-hub-slots-v188.js';
import { asphodeleMissionLayoutV188, asphodeleMissionFeatureV188, ASPHODELE_MISSION_SLOT_IDS_V188, ASPHODELE_MISSION_SIZES_V188 } from '../src/asphodele-mission-dressing-v188.js';
import { shipPortGangwayLabelV188 } from '../src/ship-port-room-v87.js';
import { withHubAsphodeleV188 } from '../src/hub-asphodele-v188.js';
import { HubGame as PhysicalHub } from '../src/hub-v71-runtime.js';
import { fixture } from './engine-host-v188.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const roundTrip = save => migrateSave(JSON.parse(JSON.stringify(save)));
const complete = (save, ...ids) => { for (const id of ids) if (!save.galaxy.completedCampaignIds.includes(id)) save.galaxy.completedCampaignIds.push(id); return save; };
const atCocyte = save => { save.worldId = 'world-05-lethe'; save.galaxy.shipWorldIdV116 = 'world-05-lethe'; return save; };
const retaken = () => { const save = atCocyte(createDefaultSave()); complete(save, 'special-archive-relay', 'station-s1', 'station-s2', 'station-s3', 'station-s4');
  save.stationV188 = { schema: 188, introHeard: true, cassius: 'rewrite', scenesSeen: ['s1', 's3', 's4'] }; return save; };
const autonomous = save => { save.colonyV188 = { schema: 188, sites: Object.fromEntries(['atmosphere', 'infirmary', 'walls', 'power', 'comms', 'docks', 'habitat']
  .map((id, index) => [id, index < 5 ? { invested: 2, validated: 2 } : { invested: 0, validated: 0 }])) }; return save; };
const everything = () => { const save = autonomous(complete(retaken(), 'station-a-journaux', 'station-a-hydro', 'station-a-grue'));
  Object.assign(save.asphodeleHubV188.contracts, { 'relay-drift': 3, module: 1 }); save.asphodeleHubV188.grue = 'accept'; return save; };
const resources = save => ({ ...save.galaxy.resources });
const value = r => r.credits + 24 * r.alloy + 25 * r.fuel + 60 * r.medical; // buy prices per unit, a conservative valuation

// —— Physical runtime (no DOM), as in verify-asphodele-hub-v188 ——
function makeRuntime(save) {
  class Base {
    constructor() { this.keys = new Set(); this.actions = []; this.onAction = action => { this.actions.push(action); return true; }; this.onStatus = () => {}; }
    start() { this.state = { deck: 3, roomId: 'dropship-hangar' }; this.player = { x: 0, y: 532, w: 44, h: 92, vx: 0, vy: 0, grounded: true, facing: 1, alive: true, health: 100 };
      this.running = true; this.animationTime = 0; this.jumpQueued = 0; this.coyoteTime = 0; this.reducedMotion = true; this.hubCommercialStateV71 = { annexId: null }; }
    isAnnexActiveV71() { return false; } currentAnnexV71() { return null; } currentRoom() { return { id: 'dropship-hangar' }; }
    update() {} draw() {} emitStatus() {} interact() { return 'tantalus'; } nearestInteraction() { return null; } persist() {} statusPrompt() { return ''; } getSnapshot() { return {}; }
    setControl() {} fire() {} useLift() {}
  }
  for (const key of ['updateAnnexPhysicsV71', 'stepAnnexPhysicsV72', 'annexSolidCollidersV71', 'resolveAnnexHorizontalV71', 'resolveAnnexVerticalV71']) Base.prototype[key] = PhysicalHub.prototype[key];
  const Runtime = withHubAsphodeleV188(Base), hub = new Runtime();
  hub.start({}, { asphodeleSaveViewV188: asphodeleSaveViewV188(save) });
  return hub;
}
function walk(hub, target, maxSeconds = 40) {
  for (let t = 0; t < maxSeconds && Math.abs(hub.player.x + 22 - target) > 6; t += 1 / 60) { hub.keys = new Set([hub.player.x + 22 < target ? 'KeyD' : 'KeyA']); hub.update(1 / 60); }
  hub.keys = new Set(); for (let i = 0; i < 30; i++) hub.update(1 / 60);
  return hub.player.x + 22;
}
function useDoor(hub) { const result = hub.interact(); for (let i = 0; i < 40; i++) hub.update(1 / 60); return result; }

// —— 1. The four modules: unlock, access, doors, round trip ——
test('modules: bible unlocks — quarters with the « Autonome » tier, medbay with S4, lower decks with S3, repair hangar with a repressurised module', () => {
  assert.deepEqual(ASPHODELE_DEFERRED_MODULES_V188, []);
  assert.deepEqual(Object.values(ASPHODELE_REOPENED_MODULES_V188).sort(), ['asph-lower', 'asph-medbay', 'asph-quarters', 'asph-repair']);
  const before = complete(atCocyte(createDefaultSave()), 'special-archive-relay', 'station-s1', 'station-s2', 'station-s3');
  assert.equal(doorLockV188(before, 'asph-control', 'control-medbay'), 'medbay', 'no medbay before S4');
  assert.equal(doorLockV188(before, 'asph-control', 'control-lower'), 'lower-decks', 'lower decks wait for the retaken hub');
  const save = retaken();
  assert.equal(doorLockV188(save, 'asph-control', 'control-medbay'), null);
  assert.equal(doorLockV188(save, 'asph-control', 'control-lower'), null);
  assert.equal(doorLockV188(save, 'asph-ring', 'ring-quarters'), 'quarters');
  assert.equal(doorLockV188(save, 'asph-docks', 'docks-repair'), 'repair-hangar');
  save.colonyV188 = { schema: 188, sites: { atmosphere: { invested: 1, validated: 1 }, infirmary: { invested: 1, validated: 1 }, walls: { invested: 1, validated: 1 } } };
  assert.equal(doorLockV188(save, 'asph-ring', 'ring-quarters'), 'quarters', '« Rétablie » is not enough');
  autonomous(save); assert.equal(doorLockV188(save, 'asph-ring', 'ring-quarters'), null);
  applyAsphodeleOperationResultV188(save, { success: true, campaignId: 'station-c-pression', operationId: 'operation-1-station-c-pression' });
  assert.equal(doorLockV188(save, 'asph-docks', 'docks-repair'), null, 'one « Remise en pression » opens the hangar');
  for (const reason of ['quarters', 'medbay', 'lower-decks', 'repair-hangar']) {
    const fr = asphodeleLockTextV188(reason, 'fr'), en = asphodeleLockTextV188(reason, 'en'); assert.ok(fr && en && fr !== en, reason);
  }
  assert.match(asphodeleLockTextV188('quarters', 'fr'), /Autonome/);
});
test('modules: doors stand on the rail, lead to a door that leads back, wall objects are distinct contacts, scale 51 px/m', () => {
  for (const roomId of Object.values(ASPHODELE_REOPENED_MODULES_V188)) {
    const room = ASPHODELE_ROOMS_V188[roomId];
    assert.ok(room.width >= 1280 && room.doors.length === 1 && room.posts.length >= 1, roomId);
    const back = room.doors[0], parent = getAsphodeleDoorV188(back.to.room, back.to.door);
    assert.deepEqual(parent.to, { room: roomId, door: back.id }, `${roomId} ↔ ${parent.id}`);
    const xs = [...room.doors, ...room.posts].map(entry => entry.x).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) assert.ok(xs[i] - xs[i - 1] >= 130, `${roomId}: ${xs[i - 1]} / ${xs[i]}`);
    for (const entry of room.props) assert.ok(entry.footprint.z1 <= -20 && entry.footprint.z0 >= -90, `${entry.id} leaves the rail free`);
    assert.ok(ASPHODELE_HUB_SLOT_IDS_V188.includes(`asph-wall-${roomId.slice(5)}`), `${roomId} wall slot`);
  }
  assert.equal(ASPHODELE_ROOMS_V188['asph-repair'].kind, 'depth', 'repair hangar is V2 (bible §42.2)');
  assert.equal(ASPHODELE_ROOM_IDS_V188.length, 13);
  assert.ok(Math.abs(ASPHODELE_METRE_PX_V188 - 51) < 1e-9);
  // Sealed reasons are given at the door and the module is never resumed inside while sealed.
  const save = retaken(); boardAsphodeleV188(save); save.asphodeleHubV188.roomId = 'asph-quarters';
  assert.equal(resolveAsphodeleHubV188(save).roomId, 'asph-docks');
  assert.equal(asphodeleDoorTargetV188(retaken(), 'asph-docks', 'docks-repair').reason, 'repair-hangar');
});
test('modules: physical round trip on foot with E — docks → hangar → docks → ring → quarters → ring → spoke → control → medbay → control → lower decks → control', () => {
  const save = everything(); boardAsphodeleV188(save);
  const hub = makeRuntime(save);
  const route = [['asph-docks', 'docks-repair', 'asph-repair'], ['asph-repair', 'repair-docks', 'asph-docks'], ['asph-docks', 'docks-ring', 'asph-ring'],
    ['asph-ring', 'ring-quarters', 'asph-quarters'], ['asph-quarters', 'quarters-ring', 'asph-ring'], ['asph-ring', 'ring-spoke', 'asph-spoke'],
    ['asph-spoke', 'spoke-hub', 'asph-control'], ['asph-control', 'control-medbay', 'asph-medbay'], ['asph-medbay', 'medbay-control', 'asph-control'],
    ['asph-control', 'control-lower', 'asph-lower']];
  for (const [from, doorId, to] of route) {
    assert.equal(hub.asphStateV188.roomId, from, `in ${from} before ${doorId}`);
    const door = getAsphodeleDoorV188(from, doorId), reached = walk(hub, door.x);
    assert.ok(Math.abs(reached - door.x) <= 40, `${doorId} reached (${reached})`);
    assert.match(hub.statusPrompt(), /^E · /, `${doorId} prompt`);
    assert.equal(useDoor(hub), true, `${doorId} opens`);
    assert.equal(hub.asphStateV188.roomId, to);
    const arrival = getAsphodeleDoorV188(to, door.to.door);
    assert.ok(Math.abs(hub.player.x + 22 - arrival.x) <= 1 && hub.player.depthZ === 0, `arrived on ${arrival.id}`);
  }
  // Each module post answers E with its action.
  const posts = { 'asph-lower': ['lower-barricade', 'lower-night'] };
  for (const postId of posts['asph-lower']) { const entry = ASPHODELE_ROOMS_V188['asph-lower'].posts.find(item => item.id === postId);
    walk(hub, entry.x); hub.actions.length = 0; hub.interact(); assert.equal(hub.actions[0]?.action, entry.action, postId); }
  const back = getAsphodeleDoorV188('asph-lower', 'lower-control'); walk(hub, back.x); assert.equal(useDoor(hub), true);
  assert.equal(hub.asphStateV188.roomId, 'asph-control', 'and back to the control deck');
  // A sealed module door answers E with its reason and no transition.
  const sealed = retaken(); boardAsphodeleV188(sealed);
  const hub2 = makeRuntime(sealed); walk(hub2, getAsphodeleDoorV188('asph-docks', 'docks-repair').x); hub2.actions.length = 0;
  assert.equal(useDoor(hub2), false); assert.equal(hub2.actions[0].reason, 'repair-hangar'); assert.equal(hub2.asphStateV188.roomId, 'asph-docks');
});
test('modules: interactions — quarters settle once, medbay treats the most injured, Cheyenne overhaul saves fuel, night board plans orig-asphodele-2', () => {
  const save = everything();
  const morale = save.hub.systems.morale;
  assert.deepEqual(settleQuartersV188(save, { open: false }), { ok: false, reason: 'quarters-closed' });
  assert.equal(settleQuartersV188(save, { open: true }).ok, true); assert.equal(save.hub.systems.morale, Math.min(100, morale + 4));
  assert.equal(settleQuartersV188(save, { open: true }).reason, 'already-settled'); assert.equal(save.hub.systems.morale, Math.min(100, morale + 4), 'once');
  save.crew[1].health = 40; save.crew[2].health = 70;
  assert.equal(medbayPatientV188(save).id, save.crew[1].id);
  for (const member of save.crew) member.health = 100; assert.equal(medbayPatientV188(save), null);
  // Cheyenne: level 1 saves one fuel per deployment in getOperationBrief.
  const campaign = CAMPAIGNS.find(entry => entry.id === 'station-c-relais'), world = WORLDS.find(entry => entry.id === campaign.worldId);
  const fuelBefore = getOperationBrief(save, campaign, world).cost.fuel;
  assert.equal(upgradeCheyenneV188(save, { open: false }).reason, 'hangar-closed');
  const credits = save.galaxy.resources.credits, alloy = save.galaxy.resources.alloy;
  assert.equal(upgradeCheyenneV188(save, { open: true }).ok, true);
  assert.equal(save.galaxy.resources.credits, credits - CHEYENNE_UPGRADES_V188[0].cost.credits); assert.equal(save.galaxy.resources.alloy, alloy - CHEYENNE_UPGRADES_V188[0].cost.alloy);
  assert.equal(cheyenneFuelSavingV188(save), 1);
  assert.equal(getOperationBrief(save, campaign, world).cost.fuel, Math.max(1, fuelBefore - 1));
  save.galaxy.resources.research = 0;
  const refused = upgradeCheyenneV188(save, { open: true });
  assert.equal(refused.reason, 'resources'); assert.deepEqual(refused.missingCosts.find(entry => entry.key === 'research'), { key: 'research', required: 8, available: 0 });
  assert.equal(cheyenneFuelSavingV188(save), 1, 'refused: nothing paid');
  // Night mission: §39.2 id, existing objective, replayable, locked with the hub, counted under 'night'.
  const night = ASPHODELE_NIGHT_MISSIONS_V188[0];
  assert.equal(night.id, 'orig-asphodele-2'); assert.equal(night.objective, 'navigate the vent network'); assert.ok(CAMPAIGNS.includes(night));
  assert.equal(asphodeleMissionLockReasonV188(createDefaultSave(), night.id), 'hub'); assert.equal(asphodeleMissionLockReasonV188(save, night.id), null);
  const app = read('src/app.js');
  assert.match(app, /candidate\.strategy\.plannedCampaignId = mission\.id/);
  assert.match(app, /treatCrewMember\(candidate, patient\.id\)/);
  assert.match(app, /\['market', 'quarters', 'medbay', 'scanner', 'barricade', 'night', 'repair'\]\.includes\(action\)/);
});

// —— 2. Contract effects: additive, visible, applied once ——
test('contracts: each of the six has an additive effect, visible in FR/EN, applied once per operation', () => {
  assert.deepEqual(Object.keys(ASPHODELE_CONTRACT_EFFECTS_V188).sort(), ['module', 'nest', 'night', 'synthetic', 'vents', 'wreck']);
  for (const entry of ASPHODELE_CONTRACTS_V188) {
    const save = retaken(); save.galaxy.worldState['world-05-lethe'].infestation = 50;
    const before = { indices: asphodeleStationIndicesV188(save), res: resources(save), infestation: 50 };
    const operationId = `operation-7-${entry.id}`;
    assert.equal(applyAsphodeleOperationResultV188(save, { success: true, campaignId: entry.id, operationId }), entry.stationContractV188);
    const once = { indices: asphodeleStationIndicesV188(save), res: resources(save), infestation: save.galaxy.worldState['world-05-lethe'].infestation };
    assert.equal(applyAsphodeleOperationResultV188(save, { success: true, campaignId: entry.id, operationId }), null, `${entry.id}: the same operation is not counted twice`);
    assert.deepEqual(asphodeleStationIndicesV188(save), once.indices); assert.deepEqual(resources(save), once.res);
    assert.equal(save.galaxy.worldState['world-05-lethe'].infestation, once.infestation);
    assert.equal(contractCountV188(save, entry.stationContractV188), 1);
    const fr = asphodeleContractEffectTextV188(save, entry.stationContractV188, 'fr'), en = asphodeleContractEffectTextV188(save, entry.stationContractV188, 'en');
    assert.ok(fr && en && fr !== en && !/\{\w+\}/.test(fr + en), `${entry.id} visible effect text`);
    switch (entry.stationContractV188) {
      case 'vents': assert.equal(once.indices.security - before.indices.security, 10); break;
      case 'nest': assert.equal(once.indices.infestation, before.indices.infestation - 10); assert.equal(once.infestation, 47); break;
      case 'synthetic': assert.equal(once.indices.workforce, 1); break;
      case 'wreck': assert.equal(once.res.alloy - before.res.alloy, 12); assert.equal(once.res.fuel - before.res.fuel, 6); break;
      case 'module': assert.equal(once.indices.sections, 1); assert.equal(doorLockV188(save, 'asph-docks', 'docks-repair'), null); break;
      case 'relay-drift': assert.equal(once.indices.relays, 1); break;
      default: assert.fail(entry.id);
    }
  }
  // A failure counts nothing; caps hold; security lowers the risk of station operations only.
  const save = retaken();
  assert.equal(applyAsphodeleOperationResultV188(save, { success: false, campaignId: 'station-c-epave', operationId: 'x' }), null);
  for (let i = 0; i < 9; i++) applyAsphodeleOperationResultV188(save, { success: true, campaignId: 'station-c-conduits', operationId: `operation-${i}-c` });
  for (let i = 0; i < 9; i++) applyAsphodeleOperationResultV188(save, { success: true, campaignId: 'station-c-nid', operationId: `operation-${i}-n` });
  for (let i = 0; i < 9; i++) applyAsphodeleOperationResultV188(save, { success: true, campaignId: 'station-c-synthetique', operationId: `operation-${i}-s` });
  const indices = asphodeleStationIndicesV188(save);
  assert.deepEqual([indices.security, indices.infestation, indices.workforce], [60, 0, 3]);
  assert.equal(asphodeleRiskReductionV188(save, 'station-c-relais'), 6); assert.equal(asphodeleRiskReductionV188(save, 'special-archive-relay'), 0);
  const campaign = CAMPAIGNS.find(entry => entry.id === 'station-c-relais'), world = WORLDS.find(entry => entry.id === campaign.worldId);
  assert.ok(getOperationBrief(save, campaign, world).risk <= getOperationBrief(retaken(), campaign, world).risk);
  // The debrief shows the effect, and the board shows the station indices.
  const app = read('src/app.js');
  assert.match(app, /applyAsphodeleOperationResultV188\(candidate, \{ success: resolvedSuccess, campaignId: operation\.campaignId, operationId: operation\.id \}\)/);
  assert.match(app, /toast\(asphodeleContractEffectTextV188\(candidate, asphodeleContractV188/);
  assert.match(app, /asphodeleServiceTextV188\('stationStatus', lang, asphodeleStationIndicesV188\(saveSystem\.data\)\)/);
});

// —— 3. Market (Q30 A) ——
test('market: real trades with the existing resources, stock per cycle, refusals with named resources, never negative', () => {
  const save = everything(); save.galaxy.resources.credits = 1000; save.galaxy.resources.alloy = 15;
  assert.equal(tradeAsphodeleMarketV188(save, 'buy-alloy', { open: false }).reason, 'market-closed');
  assert.equal(tradeAsphodeleMarketV188(save, 'nope', { open: true }).reason, 'unknown-offer');
  const ok = tradeAsphodeleMarketV188(save, 'buy-alloy', { open: true });
  assert.equal(ok.ok, true); assert.equal(save.galaxy.resources.credits, 760); assert.equal(save.galaxy.resources.alloy, 25); assert.equal(ok.remaining, 2);
  tradeAsphodeleMarketV188(save, 'buy-alloy', { open: true }); tradeAsphodeleMarketV188(save, 'buy-alloy', { open: true });
  const spent = tradeAsphodeleMarketV188(save, 'buy-alloy', { open: true }); assert.equal(spent.reason, 'stock-spent'); assert.equal(save.galaxy.resources.credits, 280);
  const poor = tradeAsphodeleMarketV188(save, 'buy-fuel', { open: true }); assert.equal(poor.ok, true); // 280 ≥ 200
  const refused = tradeAsphodeleMarketV188(save, 'buy-medical', { open: true });
  assert.equal(refused.reason, 'resources'); assert.deepEqual(refused.missingCosts, [{ key: 'credits', required: 180, available: 80 }]);
  assert.equal(save.galaxy.resources.credits, 80, 'a refused trade changes nothing');
  const text = asphodeleRefusalTextV188(refused, 'en', (missing, lang) => `${lang}:${missing.map(entry => `${entry.available}/${entry.required} ${entry.key}`).join()}`);
  assert.equal(text, 'en:80/180 credits');
  assert.ok(asphodeleRefusalTextV188(spent, 'fr') && asphodeleRefusalTextV188(spent, 'en') !== asphodeleRefusalTextV188(spent, 'fr'));
  const busy = everything(); busy.strategy.currentOperation = { id: 'operation-1-x', campaignId: 'station-c-relais' };
  assert.equal(tradeAsphodeleMarketV188(busy, 'buy-alloy', { open: true }).reason, 'operation-active');
  // A new cycle (strategic day) renews the stock; workforce adds to purchases only.
  save.clock.day += 1; save.galaxy.resources.credits = 5000;
  assert.equal(asphodeleMarketViewV188(save).find(entry => entry.id === 'buy-alloy').remaining, 3);
  const view = asphodeleMarketViewV188(save, { workforce: 2 });
  assert.equal(view.find(entry => entry.id === 'buy-alloy').stock, 5); assert.equal(view.find(entry => entry.id === 'sell-alloy').stock, 2);
  assert.ok(read('src/app.js').includes('asphodeleRefusalTextV188(result, lang, asphodeleMissingTextV188)'), 'the counter shows save.js refusal wording (strategicCostRefusalV188)');
});
test('market: no exploitable loop — every buy/sell sequence loses value, stock is finite, no resource goes negative', () => {
  for (const entry of ASPHODELE_MARKET_OFFERS_V188) for (const [key, amount] of Object.entries(entry.cost)) assert.ok(amount > 0 && Number.isFinite(amount), `${entry.id} ${key}`);
  const buy = ASPHODELE_MARKET_OFFERS_V188.find(entry => entry.id === 'buy-alloy'), sell = ASPHODELE_MARKET_OFFERS_V188.find(entry => entry.id === 'sell-alloy');
  assert.ok(sell.gain.credits / sell.cost.alloy < buy.cost.credits / buy.gain.alloy, 'alloy sells for less than it costs');
  const save = everything(); Object.assign(save.galaxy.resources, { credits: 3000, alloy: 0, fuel: 0, medical: 0 });
  const start = value(resources(save));
  let trades = 0;
  for (let round = 0; round < 50; round++) for (const id of ['buy-alloy', 'sell-alloy', 'buy-fuel', 'buy-medical', 'sell-alloy']) {
    const result = tradeAsphodeleMarketV188(save, id, { open: true, workforce: 3 }); if (result.ok) trades += 1;
    for (const amount of Object.values(save.galaxy.resources)) assert.ok(amount >= 0, 'never negative');
  }
  assert.ok(trades <= ASPHODELE_MARKET_OFFERS_V188.reduce((sum, entry) => sum + entry.stock + (entry.kind === 'buy' ? 3 : 0), 0), `finite stock in one cycle (${trades})`);
  assert.ok(value(resources(save)) <= start, 'no gain in value');
  // Forged market records cannot add stock.
  const forged = normalizeAsphodeleHubV188({ market: { day: 1, used: { 'buy-alloy': -40, 'sell-alloy': 'x' } } });
  assert.deepEqual([forged.market.used['buy-alloy'], forged.market.used['sell-alloy']], [0, 0]);
  assert.deepEqual(missingResourcesV188({ galaxy: { resources: { credits: -5 } } }, { credits: 1 }), [{ key: 'credits', required: 1, available: 0 }]);
});

// —— 4. Station dressing of the station missions ——
test('mission dressing: only Asphodèle campaigns, props clear of doors, ladders, lifts and vents, named slots, 51 px/m', async () => {
  const relay = CAMPAIGNS.find(entry => entry.id === 'station-c-relais');
  const { engine, ctx } = await fixture({ campaign: relay, seed: 7 });
  const dressing = engine.asphMissionDressingV188;
  assert.ok(dressing && dressing.decks >= 3 && dressing.props.length >= 8 && dressing.bands.length >= 4, 'station dressing built');
  assert.equal(dressing.feature?.kind, 'blackbox'); assert.equal(dressing.sector, 'hub');
  const blockers = [...engine.doors.map(door => [door.x, door.x + door.w, door.y, door.y + door.h]), ...engine.vents.map(vent => [vent.x, vent.x + vent.w, vent.y, vent.y + vent.h]),
    ...engine.ladders.map(ladder => [ladder.x - ladder.w / 2, ladder.x + ladder.w / 2, ladder.top, ladder.bottom]), ...(engine.lifts || []).map(lift => [lift.x, lift.x + lift.w, lift.topY, lift.baseY])];
  for (const entry of [...dressing.props, dressing.feature].filter(Boolean)) {
    assert.ok(entry.y >= 110, `${entry.id} inside the level band`);
    for (const [x0, x1, top, bottom] of blockers) assert.ok(!(entry.x < x1 && entry.x + entry.w > x0 && entry.y < bottom && entry.y + entry.h > top), `${entry.id} clear of a passage at ${x0}`);
  }
  for (const band of dressing.bands) for (const [x0, x1, top, bottom] of blockers) assert.ok(!(band.x < x1 && band.x + band.w > x0 && band.y < bottom && band.y + 5 > top), 'hazard band stops at passages');
  engine.camera.x = Math.max(0, dressing.feature.x - 400); engine.draw();
  for (const id of new Set(['asph-msn-blackbox'])) assert.equal(engine.asphMissionLoaderV188.usage[id], ASPHODELE_HUB_FILES_PRESENT_V188.includes(id) ? 'image' : 'primitive', id);
  for (const id of ASPHODELE_MISSION_SLOT_IDS_V188) assert.ok(ASPHODELE_HUB_SLOT_IDS_V188.includes(id), id);
  assert.ok(Math.abs(ASPHODELE_MISSION_SIZES_V188.panel.w / 51 - 2.5) < .05 && Math.abs(ASPHODELE_MISSION_SIZES_V188.crt.w / 51 - 1) < .02);
  // Other missions keep the shared template untouched.
  const s1 = await fixture({ campaign: CAMPAIGNS.find(entry => entry.id === 'station-s1'), seed: 7 });
  assert.equal(s1.engine.asphMissionDressingV188, null);
  for (const campaign of [...ASPHODELE_CONTRACTS_V188, ...ASPHODELE_NIGHT_MISSIONS_V188]) assert.ok(asphodeleMissionFeatureV188(campaign.id), campaign.id);
  assert.equal(asphodeleMissionLayoutV188({}, 'station-a-echo8').feature, null, 'no geometry, nothing drawn');
  assert.match(read('src/game-production-runtime.js'), /withCasteBehaviorsV188\(withInsertionSafeZoneV188\(withRunOptionsRuntimeV188\(withAsphodeleMissionDressingV188\(/);
});

// —— 5. Crowds ——
test('crowds: dockers, merchants and technicians from bible §42.2 keep every doorway and the airlock clear, at rest and after ten minutes', () => {
  const roles = new Set(Object.values(ASPHODELE_CROWD_ROSTER_V188).flat().map(entry => entry.role));
  assert.deepEqual([...roles].sort(), ['docker', 'merchant', 'technician']);
  assert.ok(Math.abs(ASPHODELE_WORKER_SIZE_V188.h / 51 - 1.75) < .02, '1.75 m workers');
  for (const roomId of Object.keys(ASPHODELE_CROWD_ROSTER_V188)) {
    const room = ASPHODELE_ROOMS_V188[roomId], crowd = createAsphodeleCrowdV188(roomId, null);
    assert.ok(crowd.length >= 1 && crowd.length <= 4, `${roomId}: a few workers`);
    assert.ok(asphodeleCrowdClearsDoorwaysV188(room, crowd), `${roomId} clear at rest`);
    const bays = asphodeleRoomBaysV188(room);
    for (const actor of crowd) {
      assert.ok(actor.min >= 96 && actor.max <= room.width - 140, `${actor.id} rail inside the room`);
      for (const box of bays) assert.ok(actor.max + actor.w <= box.x0 - 12 || actor.min >= box.x1 + 12, `${actor.id} rail clear of ${box.id}`);
    }
    const start = crowd.map(actor => actor.x);
    for (let i = 0; i < 600 * 30; i++) { stepAsphodeleCrowdV188(crowd, 1 / 30); if (i % 300 === 0) assert.ok(asphodeleCrowdClearsDoorwaysV188(room, crowd), `${roomId} clear at ${i / 30} s`); }
    assert.ok(asphodeleCrowdClearsDoorwaysV188(room, crowd));
    if (crowd.some(actor => actor.mobile)) assert.ok(crowd.some((actor, index) => Math.abs(actor.x - start[index]) > 4), `${roomId}: someone walks`);
    for (let a = 0; a < crowd.length; a++) for (let b = a + 1; b < crowd.length; b++) if (Math.abs(crowd[a].z - crowd[b].z) < 12)
      assert.ok(crowd[a].x + crowd[a].w <= crowd[b].x || crowd[b].x + crowd[b].w <= crowd[a].x, `${crowd[a].id} and ${crowd[b].id} never overlap`);
  }
  // The rule of clearRoomDoorwayPostV188, station form: a post on a door moves to the nearest free x.
  const docks = ASPHODELE_ROOMS_V188['asph-docks'], door = getAsphodeleDoorV188('asph-docks', 'docks-echo8');
  const moved = clearStationDoorwayPostV188(docks, door.x - 22);
  assert.ok(moved + 44 <= door.x - 48 - 12 || moved >= door.x + 48 + 12);
  // Crucible merchants leave with Grue's crew.
  assert.equal(createAsphodeleCrowdV188('asph-ring', { asphodeleHubV188: { grue: 'expel' } }).filter(actor => actor.role === 'merchant').length, 0);
  // The runtime walks and draws them, behind the named actor slots, and never saves them.
  const save = everything(); boardAsphodeleV188(save);
  const hub = makeRuntime(save);
  assert.equal(hub.getSnapshot().crowd.length, 4);
  for (let i = 0; i < 120; i++) hub.update(1 / 60);
  assert.ok(!('crowd' in hub.captureAsphodeleV188()));
  for (const role of ['docker', 'merchant', 'technician']) assert.ok(ASPHODELE_HUB_SLOT_IDS_V188.includes(`asph-npc-${role}`));
  assert.match(read('src/asphodele-crowd-v188.js'), /import \{ advanceNpcLifeV136 \} from '\.\/npc-life-v136\.js';/);
});

// —— 6. Small fixes ——
test('fixes: no Tantalus objective aboard the station; the docks hazard band stops at the door frames', () => {
  assert.match(read('src/app.js'), /byId\('hub-onboarding-objective-v84'\)\.hidden = Boolean\(hubEngine\.isPortMeridienV90\?\.\(\) \|\| hubEngine\.isAsphodeleV188\?\.\(\)\);/);
  const rects = [];
  const ctx = new Proxy({ fillRect(x, y, w, h) { rects.push({ x, y, w, h, color: this.fillStyle }); } }, { get: (target, key) => key in target ? target[key] : () => {}, set: (target, key, v) => { target[key] = v; return true; } });
  const frames = ASPHODELE_ROOMS_V188['asph-docks'].doors.map(entry => [entry.x - 58, entry.x + 58]);
  drawAsphodeleWallV188(ctx, 'docks', 0, 2048, 0, frames);
  const band = rects.filter(rect => rect.y === 600 && rect.h === 6);
  assert.ok(band.length > 40, 'the band is drawn');
  for (const rect of band) for (const [x0, x1] of frames) assert.ok(rect.x + rect.w <= x0 || rect.x >= x1, `band segment ${rect.x} crosses a door frame`);
  assert.match(read('src/hub-asphodele-v188.js'), /drawAsphodeleWallV188\(ctx, room\.module, x0, x1 - x0, time, frames\)/);
});
test('fixes: the gangway status is a FR/EN label, never the raw UNDOCKED id', () => {
  for (const phase of ['undocked', 'approach', 'docking', 'undocking', 'departed', 'weird']) {
    const save = { shipPortV1: { phase } };
    const fr = shipPortGangwayLabelV188(save, 'fr'), en = shipPortGangwayLabelV188(save, 'en');
    assert.ok(fr && en && fr !== en, phase); assert.doesNotMatch(fr + en, /UNDOCKED|APPROACH$|DEPARTED|WEIRD/);
  }
  assert.equal(shipPortGangwayLabelV188({}, 'en'), 'GANGWAY · NO PORT DOCKED');
  assert.doesNotMatch(read('src/ship-port-room-v87.js'), /phase\.toUpperCase\(\)/);
});
test('fixes: « ★ » mission names in the briefing dropdown are translated, for every station and Act V name', () => {
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, storage: null, persist: false });
  try {
    const names = CAMPAIGNS.filter(entry => /^(station-|orig-asphodele|act5-)/.test(entry.id)).map(entry => entry.name);
    assert.ok(names.length >= 22);
    for (const name of names) {
      const english = EN_CATALOG_V185[name]; assert.ok(english, `${name} in the catalogue`);
      assert.equal(autoTranslateV185(`★ ${name}`), `★ ${english}`, name);
      assert.equal(autoTranslateV185(name), english);
    }
  } finally { setLanguageV185('fr', { document: null, storage: null, persist: false }); }
  const app = read('src/app.js');
  assert.match(app, /\$\{c\.id === recommendedV188 \? '★ ' : ''\}\$\{escapeHtml\(missionNameV188\(c\)\)\}/);
  assert.match(app, /return document\.documentElement\.lang === 'en' \? autoTranslateV185\(name\) : name;/);
});

// —— 7. Save round trip, resume, old saves ——
test('save: new fields round-trip, resume in a reopened module, old saves load unchanged', () => {
  const save = everything(); boardAsphodeleV188(save);
  settleQuartersV188(save, { open: true }); upgradeCheyenneV188(save, { open: true }); tradeAsphodeleMarketV188(save, 'buy-fuel', { open: true });
  applyAsphodeleOperationResultV188(save, { success: true, campaignId: 'orig-asphodele-2', operationId: 'operation-9-orig-asphodele-2' });
  Object.assign(save.asphodeleHubV188, { roomId: 'asph-repair', x: 700, z: -30.5 });
  const back = roundTrip(save).asphodeleHubV188;
  assert.equal(back.quartersSettled, true); assert.equal(back.cheyenne, 1); assert.equal(back.market.used['buy-fuel'], 1); assert.equal(back.market.day, save.clock.day);
  assert.equal(back.contracts.night, 1); assert.equal(back.lastContractOpV188, 'operation-9-orig-asphodele-2');
  assert.deepEqual([back.roomId, back.x, back.z], ['asph-repair', 700, -30.5]);
  const hub = makeRuntime(roundTrip(save));
  assert.equal(hub.asphStateV188.roomId, 'asph-repair'); assert.equal(hub.player.x, 700); assert.equal(hub.player.depthZ, -30.5);
  // An old spec 007 save (no follow-up fields, contracts without 'night') loads with defaults; ids and counters kept.
  const old = retaken(); old.asphodeleHubV188 = { schema: 188, location: 'station', roomId: 'asph-control', x: 400, z: 0, facing: 1, visited: ['asph-docks', 'asph-control'],
    relayOnline: false, kesslerTag: null, grue: 'accept', contracts: { vents: 2, 'relay-drift': 1, wreck: 0, module: 0, nest: 0, synthetic: 0 } };
  const migrated = roundTrip(old).asphodeleHubV188;
  assert.deepEqual([migrated.quartersSettled, migrated.cheyenne, migrated.lastContractOpV188], [false, 0, null]);
  assert.deepEqual(migrated.contracts, { vents: 2, 'relay-drift': 1, wreck: 0, module: 0, nest: 0, synthetic: 0, night: 0 });
  assert.equal(migrated.roomId, 'asph-control'); assert.equal(asphodeleStationIndicesV188({ asphodeleHubV188: migrated }).security, 20);
  // A save made before the hub existed: unchanged defaults.
  const ancient = createDefaultSave(); delete ancient.asphodeleHubV188;
  assert.deepEqual(roundTrip(ancient).asphodeleHubV188, createAsphodeleHubV188());
  // Forged values are normalised.
  const forged = normalizeAsphodeleHubV188({ cheyenne: 99, quartersSettled: 'yes', lastContractOpV188: '<script>' });
  assert.deepEqual([forged.cheyenne, forged.quartersSettled, forged.lastContractOpV188], [2, false, null]);
  assert.ok(!Object.hasOwn(roundTrip(save), 'asphodeleCrowdV188'), 'crowds are runtime only');
});

// —— 8. i18n and distribution ——
test('i18n: every new player-facing string exists in French and English; the night mission is in the catalogue', () => {
  for (const [key, pair] of Object.entries(ASPHODELE_SERVICE_TEXT_V188)) assert.ok(pair.fr && pair.en && pair.fr !== pair.en, key);
  for (const entry of ASPHODELE_MARKET_OFFERS_V188) assert.ok(entry.label.fr && entry.label.en && entry.label.fr !== entry.label.en, entry.id);
  for (const entry of CHEYENNE_UPGRADES_V188) assert.ok(entry.label.fr && entry.label.en, entry.level);
  for (const roomId of Object.values(ASPHODELE_REOPENED_MODULES_V188)) { const room = ASPHODELE_ROOMS_V188[roomId];
    assert.ok(room.name.fr !== room.name.en || roomId === 'asph-quarters' ? room.name.en : false, roomId);
    for (const entry of [...room.doors, ...room.posts]) assert.ok(entry.label.fr && entry.label.en && entry.label.fr !== entry.label.en, entry.id); }
  const night = ASPHODELE_NIGHT_MISSIONS_V188[0];
  for (const field of ['name', 'summary', 'description']) assert.ok(EN_CATALOG_V185[night[field]], field);
  assert.equal(EN_CATALOG_V185[night.name], ASPHODELE_NIGHT_NAMES_EN_V188[night.id]);
  assert.equal(EN_PATTERNS_V185['★ {0}'], '★ {0}');
  // The catalogue keeps the appended, commented blocks (no re-sort).
  const catalog = read('src/i18n-en-catalog-v185.js');
  assert.match(catalog, /\/\/ V188 Asphodèle follow-up \(spec 007\): the lower-decks night mission orig-asphodele-2/);
  assert.match(catalog, /\/\/ V188 Asphodèle follow-up: a « ★ » recommended mission keeps its catalogue name/);
});
test('distribution: new modules in sw.js, this suite in test:priorities:v188 and admitted as source-only', () => {
  const sw = read('sw.js');
  for (const file of ['asphodele-economy-v188.js', 'asphodele-crowd-v188.js', 'asphodele-mission-dressing-v188.js']) assert.ok(sw.includes(`'/src/${file}'`), file);
  assert.match(JSON.parse(read('package.json')).scripts['test:priorities:v188'], /scripts\/verify-asphodele-hub-2-v188\.mjs/);
  const release = read('scripts/verify-public-release-v86.mjs');
  for (const path of ['scripts/verify-asphodele-hub-2-v188.mjs', 'scripts/qa-asphodele-hub-2-v188.mjs']) assert.ok(release.includes(`'${path}'`), path);
});
