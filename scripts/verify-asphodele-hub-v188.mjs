// V188 spec 007 — the Asphodèle second hub: unlock after S4, travel there and
// back, every door reachable and matching (data, graph and a physical walk
// through the real annex physics), side missions and « Relais en dérive »
// contracts, the relay predicate read by Act V, CIN-70 to CIN-72, save round
// trip / resume / old saves, Kessler's tag, art slots and i18n.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { CAMPAIGNS, validateContent } from '../src/content.js';
import { MISSION_REGISTERS_V188 } from '../src/mission-register-v188.js';
import { filterUnlockedCampaignsV188, stationLockReasonV188, stationLockTextV188 } from '../src/station-asphodele-v188.js';
import { finalChoiceOptionsV188 } from '../src/story-dossier-v188.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';
import {
  ASPHODELE_SIDE_MISSIONS_V188, ASPHODELE_CONTRACTS_V188, ASPHODELE_CAMPAIGNS_V188, ASPHODELE_SIDE_NAMES_EN_V188, ASPHODELE_CONTRACT_NAMES_EN_V188,
  asphodeleMissionLockReasonV188, asphodeleMissionLockTextV188, applyAsphodeleOperationResultV188, contractCountV188, RELAY_DRIFT_KEY_V188, ASPHODELE_NIGHT_NAMES_EN_V188
} from '../src/asphodele-missions-v188.js';
import {
  ASPHODELE_ROOMS_V188, ASPHODELE_ROOM_IDS_V188, ASPHODELE_ARRIVAL_V188, ASPHODELE_TEXT_V188, ASPHODELE_DOOR_V188, ASPHODELE_METRE_PX_V188,
  getAsphodeleDoorV188, asphodeleDepthRoomV188, createAsphodeleHubV188, normalizeAsphodeleHubV188, resolveAsphodeleHubV188, asphodeleHubOpenV188,
  asphodeleShuttleStatusV188, asphodeleDoorTargetV188, doorLockV188, asphodeleLockTextV188, boardAsphodeleV188, returnToTantalusV188,
  leaveAsphodeleForOperationV188, relayRoomOpenV188, asphodeleRelayReadyV188, bringRelayOnlineV188, gruePactPendingV188, chooseGruePactV188,
  kesslerTagPendingV188, depositKesslerTagV188, kesslerTagInLockerV188, asphodeleSaveViewV188, stationCinematicDueV188, cassiusCoreLineV188,
  memorialTextV188, asphodeleHubSummaryV188
} from '../src/asphodele-hub-v188.js';
import { ASPHODELE_HUB_SLOTS_V188, ASPHODELE_HUB_SLOT_IDS_V188, ASPHODELE_HUB_FILES_PRESENT_V188, AsphodeleHubAssetLoaderV188 } from '../src/asphodele-hub-slots-v188.js';
import { STATION_CINEMATICS_V188, STATION_CINEMATIC_IDS_V188 } from '../src/station-cinematics-v188.js';
import { CINEMATICS_V188, cinematicDurationV188, drawCinematicFrameV188, cinematicSetLayoutV188 } from '../src/story-cinematics-v188.js';
import { blockedByFootprintV188 } from '../src/hub-depth-rooms-v188.js';
import { echo8LockerNotesV188 } from '../src/hub-echo8-locker-v188.js';
import { withHubAsphodeleV188 } from '../src/hub-asphodele-v188.js';
import { HubGame as PhysicalHub } from '../src/hub-v71-runtime.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const roundTrip = save => migrateSave(JSON.parse(JSON.stringify(save)));
const complete = (save, ...ids) => { for (const id of ids) if (!save.galaxy.completedCampaignIds.includes(id)) save.galaxy.completedCampaignIds.push(id); return save; };
const atCocyte = save => { save.worldId = 'world-05-lethe'; save.galaxy.shipWorldIdV116 = 'world-05-lethe'; return save; };
const retaken = () => { const save = atCocyte(createDefaultSave()); complete(save, 'special-archive-relay', 'station-s1', 'station-s2', 'station-s3', 'station-s4');
  save.stationV188 = { schema: 188, introHeard: true, cassius: 'rewrite', scenesSeen: ['s1', 's3', 's4'] }; return save; };
const everything = () => { const save = complete(retaken(), 'station-a-journaux', 'station-a-hydro', 'station-a-grue');
  save.asphodeleHubV188.contracts[RELAY_DRIFT_KEY_V188] = 3; save.asphodeleHubV188.grue = 'accept';
  // Spec 007 follow-up: one repressurised module (repair hangar) and Port-Méridien at the « Autonome » tier (quarters).
  save.asphodeleHubV188.contracts.module = 1;
  save.colonyV188 = { schema: 188, sites: Object.fromEntries(['atmosphere', 'infirmary', 'walls', 'power', 'comms', 'docks', 'habitat'].map((id, index) => [id, index < 5 ? { invested: 2, validated: 2 } : { invested: 0, validated: 0 }])) };
  return save; };
const proxyCtx = () => new Proxy({ measureText: value => ({ width: String(value).length * 9 }), createLinearGradient: () => ({ addColorStop() {} }) },
  { get: (target, key) => key in target ? target[key] : () => {}, set: () => true });

// —— Unlock after S4 ——
test('hub opens after S4 only; the shuttle needs the Tantalus at Cocyte and no operation under way', () => {
  const before = complete(atCocyte(createDefaultSave()), 'special-archive-relay', 'station-s1', 'station-s2', 'station-s3');
  assert.equal(asphodeleHubOpenV188(before), false);
  assert.equal(asphodeleShuttleStatusV188(before), 'hub-closed');
  assert.equal(boardAsphodeleV188(before), false);
  const save = retaken();
  assert.equal(asphodeleHubOpenV188(save), true);
  assert.equal(asphodeleShuttleStatusV188(save), 'ready');
  const away = retaken(); away.galaxy.shipWorldIdV116 = 'world-01-acheron-lv-426';
  assert.equal(asphodeleShuttleStatusV188(away), 'away');
  const jumping = retaken(); jumping.galaxy.jumpV116 = { phase: 'charging' };
  assert.equal(asphodeleShuttleStatusV188(jumping), 'jumping');
  const busy = retaken(); busy.strategy.currentOperation = { id: 'op', campaignId: 'station-c-relais' };
  assert.equal(asphodeleShuttleStatusV188(busy), 'operation');
  for (const key of ['shuttleAway', 'shuttleJumping', 'shuttleOperation']) assert.ok(ASPHODELE_TEXT_V188[key].fr && ASPHODELE_TEXT_V188[key].en);
});

// —— Travel there and back ——
test('travel: board at airlock 1 of the docks, return to the Tantalus, operations leave from the Tantalus', () => {
  const save = retaken();
  assert.equal(boardAsphodeleV188(save), true);
  const state = save.asphodeleHubV188;
  assert.equal(state.location, 'station'); assert.equal(state.roomId, ASPHODELE_ARRIVAL_V188.room);
  assert.equal(state.x + 22, getAsphodeleDoorV188(ASPHODELE_ARRIVAL_V188.room, ASPHODELE_ARRIVAL_V188.door).x, 'centred on the UD-4L collar');
  assert.equal(boardAsphodeleV188(save), false, 'already aboard');
  assert.deepEqual(asphodeleDoorTargetV188(save, 'asph-docks', 'docks-tantalus'), { ok: true, shuttle: true });
  assert.equal(returnToTantalusV188(save), true); assert.equal(save.asphodeleHubV188.location, 'tantalus');
  assert.equal(returnToTantalusV188(save), false);
  boardAsphodeleV188(save); assert.equal(leaveAsphodeleForOperationV188(save), true);
  assert.equal(save.asphodeleHubV188.location, 'tantalus');
  // The hangar dialog of the Tantalus offers the shuttle; the station's docks offer the way back (app.js wiring).
  const app = read('src/app.js');
  assert.match(app, /appendAsphodeleShuttleChoiceV188\(\)/); assert.match(app, /data-asphodele-shuttle-v188/);
  assert.match(app, /if \(action === 'return'\) return returnFromAsphodeleV188\(\);/);
  assert.match(app, /leaveAsphodeleForOperationV188\(saveSystem\.data\);/);
  assert.match(app, /if \(hubEngine\.isAsphodeleV188\?\.\(\)\) return \{\}; \/\/ V188 spec 007/, 'station pose never overwrites the ship pose');
});

// —— Doors: data, graph and logical access ——
test('every door: inside its room, stands on the rail, clear of props and other doors, and leads to a door that leads back', () => {
  const door = ASPHODELE_DOOR_V188;
  assert.deepEqual([door.w, door.h], [96, 132]); assert.ok(Math.abs(door.h / ASPHODELE_METRE_PX_V188 - 2.6) < .05, '2.6 m door');
  for (const room of Object.values(ASPHODELE_ROOMS_V188)) {
    assert.ok(room.width >= 1280 && room.doors.length >= 1, room.id);
    const xs = [...room.doors.map(entry => entry.x), ...room.posts.filter(entry => !entry.npc).map(entry => entry.x)].sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) assert.ok(xs[i] - xs[i - 1] >= 130, `${room.id}: wall objects ${xs[i - 1]} and ${xs[i]} are distinct contacts`);
    for (const entry of room.doors) {
      assert.ok(entry.x - door.w / 2 >= 48 && entry.x + door.w / 2 <= room.width - 48, `${room.id}/${entry.id} inside the room`);
      assert.ok(entry.label.fr && entry.label.en, `${entry.id} bilingual label`);
      // The rail (z = 0, door band ±20) is never covered by a floor prop: arriving there is always clear.
      const depth = asphodeleDepthRoomV188(room.id);
      if (depth) assert.equal(blockedByFootprintV188(depth, entry.x, 0, 22), false, `${entry.id} arrival clear`);
      if (entry.to) {
        const target = getAsphodeleDoorV188(entry.to.room, entry.to.door);
        assert.ok(target, `${entry.id} → ${entry.to.room}/${entry.to.door} exists`);
        assert.deepEqual(target.to, { room: room.id, door: entry.id }, `${entry.id} round trip`);
      } else assert.ok(entry.shuttle || entry.lock, `${entry.id}: a door without a target is the shuttle or sealed with a reason`);
    }
    for (const entry of room.props) assert.ok(entry.footprint.z1 <= -20 && entry.footprint.z0 >= -90, `${entry.id} leaves the rail free`);
  }
});
test('graph: every module is reachable from the docks once unlocked; locks name a reason in FR and EN', () => {
  const save = everything(), seen = new Set([ASPHODELE_ARRIVAL_V188.room]), queue = [ASPHODELE_ARRIVAL_V188.room];
  while (queue.length) { const id = queue.shift();
    for (const entry of ASPHODELE_ROOMS_V188[id].doors) { const target = asphodeleDoorTargetV188(save, id, entry.id);
      if (target.ok && !target.shuttle && !seen.has(target.roomId)) { seen.add(target.roomId); queue.push(target.roomId); } } }
  assert.deepEqual([...seen].sort(), [...ASPHODELE_ROOM_IDS_V188].sort());
  const fresh = retaken();
  const locked = { 'asph-ring/ring-market': 'market', 'asph-ring/ring-greenhouse': 'greenhouse', 'asph-ring/ring-memorial': 'memorial', 'asph-control/control-relay': 'relay',
    'asph-ring/ring-quarters': 'quarters', 'asph-docks/docks-repair': 'repair-hangar', 'asph-docks/docks-echo8': 'echo8-dropship' };
  for (const [key, reason] of Object.entries(locked)) {
    const [room, id] = key.split('/'); assert.equal(doorLockV188(fresh, room, id), reason, key);
    assert.equal(asphodeleDoorTargetV188(fresh, room, id).ok, false);
    assert.ok(asphodeleLockTextV188(reason, 'fr') && asphodeleLockTextV188(reason, 'en') && asphodeleLockTextV188(reason, 'fr') !== asphodeleLockTextV188(reason, 'en'));
  }
  assert.equal(doorLockV188(fresh, 'asph-control', 'control-lab'), null, 'the lab opens with S3');
  const expelled = complete(retaken(), 'station-a-grue'); expelled.asphodeleHubV188.grue = 'expel';
  assert.equal(doorLockV188(expelled, 'asph-ring', 'ring-market'), 'market-expelled');
});

// —— Physical traversal through the real annex physics (no DOM) ——
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
function walk(hub, target, maxSeconds = 30) {
  for (let t = 0; t < maxSeconds && Math.abs(hub.player.x + 22 - target) > 6; t += 1 / 60) {
    const key = hub.player.x + 22 < target ? 'KeyD' : 'KeyA'; hub.keys = new Set([key]); hub.update(1 / 60);
  }
  hub.keys = new Set(); for (let i = 0; i < 30; i++) hub.update(1 / 60);
  return hub.player.x + 22;
}
function useDoor(hub) { const result = hub.interact(); for (let i = 0; i < 40; i++) hub.update(1 / 60); return result; }
test('physical walk: docks → ring → spoke → control → lab and back, every open door crossed on foot with E', () => {
  const save = everything(); boardAsphodeleV188(save);
  const hub = makeRuntime(save);
  assert.equal(hub.isAsphodeleV188(), true); assert.equal(hub.asphStateV188.roomId, 'asph-docks');
  const route = [['asph-docks', 'docks-ring', 'asph-ring'], ['asph-ring', 'ring-spoke', 'asph-spoke'], ['asph-spoke', 'spoke-hub', 'asph-control'],
    ['asph-control', 'control-lab', 'asph-lab'], ['asph-lab', 'lab-control', 'asph-control'], ['asph-control', 'control-relay', 'asph-relay'],
    ['asph-relay', 'relay-control', 'asph-control'], ['asph-control', 'control-spoke', 'asph-spoke'], ['asph-spoke', 'spoke-ring', 'asph-ring'],
    ['asph-ring', 'ring-memorial', 'asph-memorial'], ['asph-memorial', 'memorial-ring', 'asph-ring'], ['asph-ring', 'ring-greenhouse', 'asph-greenhouse'],
    ['asph-greenhouse', 'greenhouse-ring', 'asph-ring'], ['asph-ring', 'ring-market', 'asph-market'], ['asph-market', 'market-ring', 'asph-ring'],
    ['asph-ring', 'ring-docks', 'asph-docks']];
  for (const [from, doorId, to] of route) {
    assert.equal(hub.asphStateV188.roomId, from, `in ${from} before ${doorId}`);
    const door = getAsphodeleDoorV188(from, doorId), reached = walk(hub, door.x);
    assert.ok(Math.abs(reached - door.x) <= 40, `${doorId} reached on foot (${reached})`); // inside the 60 px door reach, after the walk deceleration
    assert.match(hub.statusPrompt(), /^E · /, `${doorId} prompt`);
    assert.equal(useDoor(hub), true, `${doorId} opens`);
    assert.equal(hub.asphStateV188.roomId, to, `${doorId} → ${to}`);
    const arrival = getAsphodeleDoorV188(to, getAsphodeleDoorV188(from, doorId).to.door);
    assert.ok(Math.abs(hub.player.x + 22 - arrival.x) <= 1 && hub.player.depthZ === 0 && hub.player.grounded, `arrived on ${arrival.id}`);
  }
  // A sealed door answers E with its reason and no transition.
  walk(hub, getAsphodeleDoorV188('asph-docks', 'docks-echo8').x);
  hub.actions.length = 0; assert.equal(useDoor(hub), false);
  assert.equal(hub.asphStateV188.roomId, 'asph-docks'); assert.equal(hub.actions[0].action, 'asphodele:locked'); assert.equal(hub.actions[0].reason, 'echo8-dropship');
  // Depth in a V2 room: S steps towards the camera, W back; the crate footprint blocks.
  hub.keys = new Set(['KeyS']); for (let i = 0; i < 60; i++) hub.update(1 / 60);
  assert.ok(hub.player.depthZ <= -60, `stepped forward (${hub.player.depthZ})`);
  hub.keys = new Set(['KeyW']); for (let i = 0; i < 60; i++) hub.update(1 / 60);
  assert.equal(hub.player.depthZ, 0);
  // The UD-4L collar: E asks the app to return to the Tantalus.
  walk(hub, getAsphodeleDoorV188('asph-docks', 'docks-tantalus').x); hub.actions.length = 0; hub.interact();
  assert.equal(hub.actions[0].action, 'asphodele:return');
  // W/S never call a lift aboard the station.
  assert.equal(hub.useLift(-1), false);
});
test('physical walk: a profile module has no depth (W/S do nothing), the docks crates are walked around', () => {
  const save = everything(); boardAsphodeleV188(save); save.asphodeleHubV188.roomId = 'asph-control'; save.asphodeleHubV188.x = 400;
  const hub = makeRuntime(save);
  hub.keys = new Set(['KeyS']); for (let i = 0; i < 40; i++) hub.update(1 / 60);
  assert.equal(hub.player.depthZ, 0);
  const docks = everything(); boardAsphodeleV188(docks); docks.asphodeleHubV188.x = 300;
  const hub2 = makeRuntime(docks);
  hub2.keys = new Set(['KeyS']); for (let i = 0; i < 60; i++) hub2.update(1 / 60); // in front of the crates' x range: stopped at their edge
  const crate = ASPHODELE_ROOMS_V188['asph-docks'].props[0];
  assert.ok(hub2.player.x + 22 + 16 > crate.x ? hub2.player.depthZ >= crate.footprint.z1 : true, 'not inside the crates');
});

// —— Side missions and contracts ——
test('side missions and contracts: bible ids on Cocyte, valid content, existing objectives, locks, campaign lists', () => {
  assert.deepEqual(ASPHODELE_SIDE_MISSIONS_V188.map(entry => entry.id), ['station-a-echo8', 'station-a-grue', 'station-a-journaux', 'station-a-hydro', 'station-a-sonde', 'station-a-cassius', 'station-a-bishop']);
  assert.equal(ASPHODELE_CONTRACTS_V188.length, 6);
  assert.equal(validateContent().ok, true);
  const objectives = new Set(CAMPAIGNS.filter(entry => !ASPHODELE_CAMPAIGNS_V188.includes(entry)).map(entry => entry.objective));
  for (const campaign of ASPHODELE_CAMPAIGNS_V188) {
    assert.ok(CAMPAIGNS.includes(campaign), campaign.id); assert.equal(campaign.worldId, 'world-05-lethe');
    assert.ok(objectives.has(campaign.objective), `${campaign.id} reuses an existing objective`);
    assert.ok(MISSION_REGISTERS_V188.includes(campaign.registerV188));
  }
  assert.equal(ASPHODELE_CONTRACTS_V188.find(entry => entry.id === 'station-c-relais').objective, 'recover black-box data', 'bible §7.2');
  const early = complete(createDefaultSave(), 'special-archive-relay');
  for (const campaign of ASPHODELE_CAMPAIGNS_V188) assert.equal(asphodeleMissionLockReasonV188(early, campaign.id), 'hub');
  assert.ok(!filterUnlockedCampaignsV188(early, CAMPAIGNS).some(entry => ASPHODELE_CAMPAIGNS_V188.includes(entry)));
  const save = retaken();
  assert.equal(stationLockReasonV188(save, 'station-c-relais'), null);
  assert.equal(stationLockReasonV188(save, 'station-a-cassius'), null, 'CASSIUS rewritten');
  save.stationV188.cassius = 'restrain'; assert.equal(stationLockReasonV188(save, 'station-a-cassius'), 'cassius-kept'); assert.equal(stationLockReasonV188(save, 'station-a-bishop'), null);
  save.stationV188.cassius = 'erase'; assert.equal(stationLockReasonV188(save, 'station-a-bishop'), 'cassius-erased');
  for (const reason of ['hub', 'cassius-kept', 'cassius-erased']) { assert.ok(asphodeleMissionLockTextV188(reason, 'en')); assert.equal(stationLockTextV188(reason, 'fr'), asphodeleMissionLockTextV188(reason, 'fr')); }
  assert.equal(filterUnlockedCampaignsV188(save, CAMPAIGNS).filter(entry => ASPHODELE_CAMPAIGNS_V188.includes(entry)).length, 12, 'CASSIUS erased: two side missions closed (13 + the night mission)');
});
test('contracts: counted once per successful operation, replayable; three drifting relays open the relay room', () => {
  const save = retaken();
  assert.equal(applyAsphodeleOperationResultV188(save, { success: false, campaignId: 'station-c-relais' }), null);
  assert.equal(applyAsphodeleOperationResultV188(save, { success: true, campaignId: 'station-s4' }), null, 'not a contract');
  assert.equal(applyAsphodeleOperationResultV188(save, { success: true, campaignId: 'station-a-hydro' }), null, 'side missions are not counted');
  for (let i = 0; i < 2; i++) assert.equal(applyAsphodeleOperationResultV188(save, { success: true, campaignId: 'station-c-relais' }), RELAY_DRIFT_KEY_V188);
  assert.equal(relayRoomOpenV188(save), false); assert.equal(doorLockV188(save, 'asph-control', 'control-relay'), 'relay');
  applyAsphodeleOperationResultV188(save, { success: true, campaignId: 'station-c-relais' });
  assert.equal(contractCountV188(save, RELAY_DRIFT_KEY_V188), 3); assert.equal(relayRoomOpenV188(save), true);
  assert.equal(doorLockV188(save, 'asph-control', 'control-relay'), null);
  applyAsphodeleOperationResultV188(save, { success: true, campaignId: 'station-c-nid' }); assert.equal(contractCountV188(save, 'nest'), 1);
  assert.match(read('src/app.js'), /applyAsphodeleOperationResultV188\(candidate, \{ success: resolvedSuccess, campaignId: operation\.campaignId, operationId: operation\.id \}\);/);
  // Grue's pact after « Le pacte de l'anneau »: taken once.
  assert.equal(gruePactPendingV188(save), false); complete(save, 'station-a-grue'); assert.equal(gruePactPendingV188(save), true);
  assert.equal(chooseGruePactV188(save, 'maybe'), false); assert.equal(chooseGruePactV188(save, 'accept'), true); assert.equal(chooseGruePactV188(save, 'expel'), false);
  assert.equal(doorLockV188(save, 'asph-ring', 'ring-market'), null);
});

// —— Relay predicate (read by Act V, spec 006) ——
test('asphodeleRelayReadyV188: retaken + three drifting relays + bays brought online; « Transmettre » follows it', () => {
  const save = retaken();
  assert.equal(asphodeleRelayReadyV188(save), false);
  assert.equal(bringRelayOnlineV188(save), false, 'room still sealed');
  save.asphodeleHubV188.contracts[RELAY_DRIFT_KEY_V188] = 3;
  assert.equal(asphodeleRelayReadyV188(save), false, 'room open, bays offline');
  assert.equal(bringRelayOnlineV188(save), true); assert.equal(bringRelayOnlineV188(save), false);
  assert.equal(asphodeleRelayReadyV188(save), true);
  assert.equal(asphodeleRelayReadyV188(roundTrip(save)), true, 'survives a save round trip');
  const notRetaken = roundTrip(save); notRetaken.galaxy.completedCampaignIds = notRetaken.galaxy.completedCampaignIds.filter(id => id !== 'station-s4');
  assert.equal(asphodeleRelayReadyV188(notRetaken), false);
  assert.deepEqual(finalChoiceOptionsV188(save).options.map(option => option.id), finalChoiceOptionsV188(save, { relayRoomOpen: true }).options.map(option => option.id));
  assert.deepEqual(finalChoiceOptionsV188(retaken()).options.map(option => option.id), finalChoiceOptionsV188(retaken(), { relayRoomOpen: false }).options.map(option => option.id));
  assert.equal(asphodeleRelayReadyV188(null), false); assert.equal(asphodeleRelayReadyV188({}), false);
  assert.match(asphodeleHubSummaryV188(save, 'en'), /relay online/);
});

// —— Cinematics ——
test('CIN-70 to CIN-72: bible titles and durations, bilingual, drawn with the existing player and sets', () => {
  assert.deepEqual(STATION_CINEMATIC_IDS_V188, ['cin-70', 'cin-71', 'cin-72']);
  assert.equal(cinematicDurationV188('cin-70'), 40); assert.equal(cinematicDurationV188('cin-71'), 40); assert.equal(cinematicDurationV188('cin-72'), 30);
  assert.equal(CINEMATICS_V188['cin-70'].title.fr, 'Six heures de silence'); assert.equal(CINEMATICS_V188['cin-71'].title.fr, 'La voix de CASSIUS');
  assert.equal(CINEMATICS_V188['cin-72'].title.fr, 'Le dernier enregistrement d’Echo-8');
  for (const id of STATION_CINEMATIC_IDS_V188) {
    assert.equal(CINEMATICS_V188[id], STATION_CINEMATICS_V188[id]);
    let time = 0;
    for (const entry of CINEMATICS_V188[id].shots) {
      for (const field of ['caption', 'status']) if (entry[field]) assert.ok(entry[field].fr && entry[field].en);
      if (entry.line) assert.ok(entry.line.text.fr && entry.line.text.en);
      for (const language of ['fr', 'en']) for (const reducedMotion of [false, true]) assert.ok(drawCinematicFrameV188(proxyCtx(), id, time + entry.seconds / 2, { language, reducedMotion }));
      time += entry.seconds;
    }
  }
  for (const scene of ['control', 'lowerdeck']) { const layout = cinematicSetLayoutV188(scene); assert.ok(layout.items.length >= 3);
    for (const entry of layout.items.filter(item => item.kind === 'person')) assert.ok(entry.h >= 1.6 && entry.h <= 1.95); }
});
test('station cinematics are due once, in order, and never sent back to an advanced save', () => {
  const save = complete(createDefaultSave(), 'special-archive-relay');
  assert.equal(stationCinematicDueV188(save), null);
  save.stationV188 = { schema: 188, introHeard: true, cassius: null, scenesSeen: [] };
  assert.equal(stationCinematicDueV188(save), 'cin-70');
  save.storyCampaignV188.cinematicsSeen.push('cin-70'); assert.equal(stationCinematicDueV188(save), null);
  complete(save, 'station-s1', 'station-s2'); assert.equal(stationCinematicDueV188(save), 'cin-71');
  save.stationV188.cassius = 'restrain'; assert.equal(stationCinematicDueV188(save), null, 'decision taken without CIN-71: not replayed');
  complete(save, 'station-s3'); assert.equal(stationCinematicDueV188(save), 'cin-72');
  save.stationV188.scenesSeen = ['s1', 's3']; assert.equal(stationCinematicDueV188(save), null);
  const app = read('src/app.js');
  assert.match(app, /if \(playStationCinematicDueV188\(\)\) return true;/);
  assert.match(app, /if \(questId === 'ship-rook'\) playStationCinematicDueV188\(\);/);
});

// —— Save round trip, resume, old saves ——
test('save: additive field, round trip, resume where the marine stood, old and edited saves load aboard the Tantalus', () => {
  assert.deepEqual(createDefaultSave().asphodeleHubV188, createAsphodeleHubV188());
  const old = createDefaultSave(); delete old.asphodeleHubV188;
  const migrated = roundTrip(old);
  assert.equal(migrated.asphodeleHubV188.location, 'tantalus'); assert.equal(contractCountV188(migrated, RELAY_DRIFT_KEY_V188), 0);
  const save = everything(); boardAsphodeleV188(save); bringRelayOnlineV188(save); complete(save, 'station-s3'); depositKesslerTagV188(save);
  Object.assign(save.asphodeleHubV188, { roomId: 'asph-ring', x: 1234, z: -42.5, facing: -1, visited: ['asph-docks', 'asph-ring', 'nowhere'] });
  const back = roundTrip(save).asphodeleHubV188;
  assert.deepEqual({ ...back, visited: back.visited }, { ...normalizeAsphodeleHubV188(save.asphodeleHubV188) });
  assert.deepEqual(back.visited, ['asph-docks', 'asph-ring']);
  assert.equal(back.z, -42.5); assert.equal(back.relayOnline, true); assert.equal(back.kesslerTag, 'locker'); assert.equal(back.grue, 'accept');
  // Resume in the runtime: same room, x and depth.
  const hub = makeRuntime(roundTrip(save));
  assert.equal(hub.asphStateV188.roomId, 'asph-ring'); assert.equal(hub.player.x, 1234); assert.equal(hub.player.depthZ, -42.5);
  // A profile room keeps no depth; garbage is normalized; a station location without S4 returns aboard the Tantalus.
  assert.equal(normalizeAsphodeleHubV188({ roomId: 'asph-control', z: -50 }).z, 0);
  assert.deepEqual(normalizeAsphodeleHubV188('junk'), createAsphodeleHubV188());
  assert.equal(normalizeAsphodeleHubV188({ roomId: 'asph-ring', x: 99999 }).x, ASPHODELE_ROOMS_V188['asph-ring'].width - 68);
  const forged = createDefaultSave(); forged.asphodeleHubV188.location = 'station';
  assert.equal(resolveAsphodeleHubV188(roundTrip(forged)).location, 'tantalus');
  assert.equal(makeRuntime(roundTrip(forged)).isAsphodeleV188(), false);
  const sealedRoom = retaken(); boardAsphodeleV188(sealedRoom); sealedRoom.asphodeleHubV188.roomId = 'asph-relay';
  assert.equal(resolveAsphodeleHubV188(sealedRoom).roomId, ASPHODELE_ARRIVAL_V188.room, 'a sealed module is never resumed inside');
  // Nothing else in the save changes shape: existing V188 fields are kept.
  for (const key of ['stationV188', 'crewQuestsV188', 'storyCampaignV188', 'colonyV188', 'hub']) assert.ok(key in roundTrip(save), key);
});

// —— Kessler's tag ——
test('Kessler’s tag: recovered in S3, placed once in Echo-8’s locker aboard the Tantalus, read on the locker and the memorial', () => {
  const save = retaken(); save.galaxy.completedCampaignIds = save.galaxy.completedCampaignIds.filter(id => id !== 'station-s3');
  assert.equal(kesslerTagPendingV188(save), false); assert.equal(depositKesslerTagV188(save), false);
  complete(save, 'station-s3'); assert.equal(kesslerTagPendingV188(save), true);
  assert.ok(!echo8LockerNotesV188(save).some(note => note.id === 'kessler-tag'));
  assert.equal(depositKesslerTagV188(save), true); assert.equal(depositKesslerTagV188(save), false);
  assert.equal(kesslerTagInLockerV188(save), true);
  const notes = echo8LockerNotesV188(save, 'en'); assert.ok(notes.some(note => note.id === 'kessler-tag' && /Kessler/.test(note.text)));
  assert.match(memorialTextV188(save, 'fr'), /Solène Ivarsson.*Kessler.*casier d’Echo-8/);
  assert.match(read('src/app.js'), /hubEngine\.kesslerTagInLockerV188 = kesslerTagInLockerV188\(saveSystem\.data\);/);
});

// —— Slots, distribution, i18n ——
test('art slots: unique ids, briefs that cite references without claiming 1:1, no file requested before it exists', () => {
  assert.equal(new Set(ASPHODELE_HUB_SLOT_IDS_V188).size, ASPHODELE_HUB_SLOTS_V188.length);
  for (const entry of ASPHODELE_HUB_SLOTS_V188) { assert.ok(entry.brief.length > 40 && entry.purpose); assert.doesNotMatch(entry.brief, /1:1/); }
  for (const id of ASPHODELE_HUB_FILES_PRESENT_V188) assert.ok(existsSync(new URL('..' + ASPHODELE_HUB_SLOTS_V188.find(entry => entry.id === id).path, import.meta.url)));
  for (const room of ASPHODELE_ROOM_IDS_V188) assert.ok(ASPHODELE_HUB_SLOT_IDS_V188.includes(`asph-wall-${room.slice(5)}`), `${room} wall slot`);
  const loader = new AsphodeleHubAssetLoaderV188({ ImageCtor: class { } });
  assert.deepEqual(loader.preload(), []);
  let drawn = 0; assert.equal(loader.draw(proxyCtx(), 'asph-door', 0, 0, 96, 132, () => { drawn++; }), 'primitive'); assert.equal(drawn, 1);
  assert.throws(() => loader.draw(proxyCtx(), 'nope', 0, 0, 1, 1));
});
test('distribution: new modules in sw.js, suite in test:priorities:v188, spec and suite admitted as source-only', () => {
  const sw = read('sw.js');
  for (const file of ['asphodele-missions-v188.js', 'asphodele-hub-v188.js', 'asphodele-hub-slots-v188.js', 'hub-asphodele-v188.js', 'station-cinematics-v188.js'])
    assert.ok(sw.includes(`'/src/${file}'`), file);
  assert.match(JSON.parse(read('package.json')).scripts['test:priorities:v188'], /scripts\/verify-asphodele-hub-v188\.mjs/);
  const release = read('scripts/verify-public-release-v86.mjs');
  for (const path of ['specs/007-hub-asphodele/spec.md', 'specs/007-hub-asphodele/plan.md', 'specs/007-hub-asphodele/tasks.md', 'scripts/verify-asphodele-hub-v188.mjs', 'scripts/qa-asphodele-hub-v188.mjs'])
    assert.ok(release.includes(`'${path}'`), path);
});
test('i18n: every player-facing string of the hub, missions and contracts exists in French and English', () => {
  for (const [key, pair] of Object.entries(ASPHODELE_TEXT_V188)) assert.ok(pair.fr && pair.en, key);
  for (const room of Object.values(ASPHODELE_ROOMS_V188)) {
    assert.ok(room.name.fr && room.name.en);
    for (const entry of [...room.doors, ...room.posts]) assert.ok(entry.label.fr && entry.label.en, entry.id);
  }
  for (const campaign of ASPHODELE_CAMPAIGNS_V188) {
    const englishName = ASPHODELE_SIDE_NAMES_EN_V188[campaign.id] || ASPHODELE_CONTRACT_NAMES_EN_V188[campaign.id] || ASPHODELE_NIGHT_NAMES_EN_V188[campaign.id];
    assert.ok(englishName, `${campaign.id} English name`);
    for (const field of ['name', 'summary', 'description']) assert.ok(EN_CATALOG_V185[campaign[field]], `${campaign.id}.${field} in the EN catalog`);
    assert.equal(EN_CATALOG_V185[campaign.name], englishName);
  }
  for (const choice of ['rewrite', 'restrain', 'erase']) { const save = retaken(); save.stationV188.cassius = choice;
    assert.notEqual(cassiusCoreLineV188(save, 'fr'), cassiusCoreLineV188(save, 'en')); }
  assert.notEqual(memorialTextV188(retaken(), 'fr'), memorialTextV188(retaken(), 'en'));
});
