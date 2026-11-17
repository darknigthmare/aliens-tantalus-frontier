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
import { ASPHODELE_HUB_SLOTS_V188, ASPHODELE_HUB_SLOT_IDS_V188, ASPHODELE_HUB_FILES_PRESENT_V188, AsphodeleHubAssetLoaderV188, getAsphodeleHubSlotV188,
  ASPHODELE_HUB_IMAGE_SOURCE_RECTS_V188, ASPHODELE_HUB_IMAGE_ANCHORS_V188, ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188,
  drawAsphodeleWallV188, drawAsphodeleWallTrimV188, drawAsphodeleDoorV188, drawAsphodelePostV188, drawAsphodeleCradlesV188,
  drawDockedVesselV188, drawAsphodeleActorV188 } from '../src/asphodele-hub-slots-v188.js';
import { ASPHODELE_MISSION_SLOT_IDS_V188, ASPHODELE_MISSION_IMAGE_SOURCE_RECTS_V188, drawAsphodeleMissionSlotV188 } from '../src/asphodele-mission-dressing-v188.js';
import { fixture } from './engine-host-v188.mjs';
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
function makeRuntime(save, { loader = null } = {}) {
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
  if (loader) hub.asphLoaderV188 = loader;
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
  const loader = new AsphodeleHubAssetLoaderV188({ ImageCtor: class { }, present: [] });
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


// —— Mission image integration: explicit fixture dimensions, actual production composition ——
const artTrace = () => {
  const calls = [], states = [], state = { fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', textBaseline: '' };
  const ctx = new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      return (...args) => {
        calls.push({ method: key, args, fillStyle: target.fillStyle, strokeStyle: target.strokeStyle, lineWidth: target.lineWidth });
        if (key === 'save') states.push({ ...target });
        if (key === 'restore') { assert.ok(states.length, 'balanced canvas save/restore'); Object.assign(target, states.pop()); }
      };
    }
  });
  return { ctx, calls, states };
};
// No bitmap pixels are claimed by these unit fixtures: a deliberately large
// valid source canvas exercises image composition and any inspected source window.
class MissionImageFixture {
  complete = true; naturalWidth = 8192; naturalHeight = 8192;
}

test('hub detail art: entry and real room transitions request only local assets, once, never mission PNGs', () => {
  const save = everything(); boardAsphodeleV188(save);
  // Explicit image fixture: this verifies requested paths, not network traffic.
  const loader = new AsphodeleHubAssetLoaderV188({ ImageCtor: MissionImageFixture, present: ASPHODELE_HUB_SLOT_IDS_V188 });
  const hub = makeRuntime(save, { loader });
  const names = () => loader.requested.map(path => path.split('/').at(-1).replace('.png', ''));
  assert.deepEqual(new Set(names()), new Set(['asph-wall-docks', 'asph-door', 'asph-ud4l-docked', 'asph-crucible-shuttle', 'asph-grue', 'asph-npc-docker']));
  hub.preloadAsphodeleRoomV188(); assert.equal(loader.requested.length, 6, 'no request repeated in the same room');
  for (const [room, door] of [['asph-docks', 'docks-ring'], ['asph-ring', 'ring-spoke']]) {
    walk(hub, getAsphodeleDoorV188(room, door).x); assert.equal(useDoor(hub), true);
  }
  const beforeControl = new Set(names());
  walk(hub, getAsphodeleDoorV188('asph-spoke', 'spoke-hub').x); assert.equal(useDoor(hub), true);
  assert.equal(hub.asphStateV188.roomId, 'asph-control');
  assert.deepEqual(new Set(names().filter(id => !beforeControl.has(id))), new Set(['asph-wall-control', 'asph-qz-map', 'asph-cassius-core']));
  assert.equal(names().filter(id => id === 'asph-door').length, 1);
  assert.equal(names().filter(id => id === 'asph-npc-technician').length, 1, 'technicians shared with the spoke are reused');
  assert.ok(!names().some(id => id.startsWith('asph-msn-') || ['asph-wall-lab', 'asph-bunks', 'asph-cradles'].includes(id)));
});

const detailTrace = (draw, { image = true } = {}) => {
  const trace = artTrace();
  const loader = new AsphodeleHubAssetLoaderV188({ ImageCtor: MissionImageFixture, present: image ? ASPHODELE_HUB_SLOT_IDS_V188 : [] });
  loader.preload(); draw(trace.ctx, loader);
  assert.equal(trace.states.length, 0, 'detail rendering restores Canvas state');
  return { ...trace, loader };
};
const imageCalls = trace => trace.calls.filter(call => call.method === 'drawImage');
const fillsOf = (trace, color) => trace.calls.filter(call => call.method === 'fillRect' && call.fillStyle === color);

test('hub detail art: proportional door leaves retain all three native lamps and the locked mark', () => {
  for (const [state, color] of [['open', '#7dff9a'], ['locked', '#e15b4f'], ['shuttle', '#e2b53a']]) {
    for (const image of [false, true]) {
      const trace = detailTrace((ctx, loader) => drawAsphodeleDoorV188(ctx, 400, state, 0, true, loader), { image });
      assert.ok(fillsOf(trace, '#2b3236').some(call => call.args.join() === [342, 478, 116, 146].join()), 'unchanged physical frame');
      assert.ok(fillsOf(trace, color).some(call => call.args.join() === [390, 468, 20, 7].join()), state + ' lamp outside image');
      assert.equal(trace.calls.filter(call => call.method === 'stroke' && call.strokeStyle === '#e15b4f').length, state === 'locked' ? 1 : 0);
      assert.equal(imageCalls(trace).length, image ? 1 : 0);
      if (image) {
        const [, sx, sy, sw, sh, x, y, w, h] = imageCalls(trace)[0].args;
        assert.deepEqual([sx, sy, sw, sh], ASPHODELE_HUB_IMAGE_SOURCE_RECTS_V188['asph-door']);
        assert.ok(Math.abs(w / sw - h / sh) < 1e-12); assert.equal(y + h, 624);
        assert.ok(x >= 352 && x + w <= 448 && y >= 492);
      }
    }
  }
  const pending = detailTrace((ctx, loader) => {
    loader.images.get('asph-door').complete = false;
    assert.equal(drawAsphodeleDoorV188(ctx, 400, 'locked', 0, true, loader), 'primitive');
  });
  assert.equal(imageCalls(pending).length, 0); assert.ok(fillsOf(pending, '#e15b4f').length);
});

test('hub detail art: CASSIUS, relays, night rounds and repairs retain their live states above the PNG', () => {
  const post = (id, state, image) => detailTrace((ctx, loader) => drawAsphodelePostV188(ctx, id, 600, { state, still: true, loader }), { image });
  for (const image of [false, true]) {
    for (const cassius of ['erase', 'restrain', 'rewrite']) {
      const trace = post('control-cassius', { cassius }, image);
      assert.equal(fillsOf(trace, cassius === 'erase' ? '#050806' : '#06200f').length, 6, 'all six screens follow CASSIUS');
      const waves = trace.calls.filter(call => call.method === 'stroke');
      assert.equal(waves.length, cassius === 'erase' ? 0 : 2, 'erasure removes both waveform segments');
      if (waves.length) assert.ok(waves.every(call => call.strokeStyle === (cassius === 'restrain' ? 'rgba(226,181,58,.8)' : 'rgba(125,255,154,.9)')));
      assert.equal(trace.calls.filter(call => call.method === 'clip').length, 6, 'waveforms cannot cross CRT bezels');
    }
    const off = post('relay-bays', { relayOnline: false }, image), on = post('relay-bays', { relayOnline: true }, image);
    assert.equal(fillsOf(off, '#e2b53a').length, 3); assert.equal(fillsOf(off, '#3b3424').length, 21);
    assert.equal(fillsOf(on, '#7dff9a').length + fillsOf(on, '#2f6d45').length, 24);
    assert.equal(fillsOf(off, '#0b1410').length, 1, 'held-message terminal remains separate');
    assert.equal(fillsOf(post('lower-night', { nights: 0 }, image), '#4a2420').length, 5);
    assert.equal(fillsOf(post('lower-night', { nights: 5 }, image), '#7dff9a').length, 5);
    assert.equal(fillsOf(post('repair-bench', { cheyenne: 0 }, image), '#1c2923').length, 3);
    assert.equal(fillsOf(post('repair-bench', { cheyenne: 3 }, image), '#7dff9a').length, 3);
  }
});

test('hub detail art: distinct station plan and archive, original cradle labels, native window and Echo-8 identity', () => {
  for (const id of ['ring-plan', 'lab-archives']) {
    const trace = detailTrace((ctx, loader) => drawAsphodelePostV188(ctx, id, 600, { loader }));
    assert.equal(imageCalls(trace).length, 0, id + ' is its own native equipment');
  }
  const cradles = detailTrace((ctx, loader) => drawAsphodeleCradlesV188(ctx, 520, loader));
  assert.equal(imageCalls(cradles).length, 1, 'one three-cradle group, not an archive replacement');
  assert.equal(cradles.calls.filter(call => call.method === 'fillText' && call.args[0] === 'QZ17').length, 3);
  for (const kind of ['ud4l', 'echo8', 'crucible']) {
    const trace = detailTrace((ctx, loader) => drawDockedVesselV188(ctx, 400, kind, loader));
    assert.ok(fillsOf(trace, '#05080b').some(call => call.args.join() === [290, 250, 220, 130].join()));
    assert.equal(fillsOf(trace, 'rgba(230,240,255,.6)').length, 14, 'native space and stars remain behind alpha');
    assert.ok(trace.calls.findIndex(call => call.method === 'strokeRect') > trace.calls.findIndex(call => call.method === 'drawImage'), 'native window rim covers the vessel');
    assert.equal(trace.calls.filter(call => call.method === 'fillText' && call.args[0] === 'ECHO-8').length, kind === 'echo8' ? 1 : 0);
    const [, , , sw, sh, x, y, w, h] = imageCalls(trace)[0].args;
    assert.ok(Math.abs(w / sw - h / sh) < 1e-12 && x >= 296 && x + w <= 504 && y >= 256 && y + h <= 374);
    assert.ok(trace.calls.some(call => call.method === 'clip'));
  }
  const memorial = detailTrace((ctx, loader) => drawAsphodelePostV188(ctx, 'memorial-plaques', 600, { still: true, loader }));
  assert.equal(fillsOf(memorial, '#d9c9a4').length, 0, 'generated candle bases are not doubled');
  assert.equal(fillsOf(memorial, 'rgba(255,190,110,0.7)').length, 8, 'all eight candle glows remain native');
});

test('hub detail art: floor contact and physical bed, bunk and scanner proportions survive source sampling', () => {
  const cases = [['quarters-register', [360], 624], ['medbay-beds', [102, 102], 624], ['medbay-scanner', [124], 624]];
  for (const [id, widths, floor] of cases) {
    const trace = detailTrace((ctx, loader) => drawAsphodelePostV188(ctx, id, 600, { still: true, loader }));
    assert.equal(imageCalls(trace).length, widths.length, id);
    imageCalls(trace).forEach((call, index) => {
      const [, , , sw, sh, , y, w, h] = call.args;
      assert.ok(Math.abs(w / sw - h / sh) < 1e-12, id + ' keeps source proportions');
      assert.ok(w <= widths[index] + 1e-9); assert.ok(Math.abs(y + h - floor) < 1e-9, id + ' touches the floor');
      if (id === 'quarters-register') assert.ok(h <= 130);
      if (id === 'medbay-scanner') assert.ok(h <= 112);
    });
    if (id === 'medbay-beds') {
      const draws = imageCalls(trace); assert.ok(Math.abs(draws[1].args[5] - draws[0].args[5] - 180) < 1e-9, 'original bed spacing');
      assert.notDeepEqual(draws[0].args.slice(1, 5), draws[1].args.slice(1, 5), 'each authored bed is used once');
    }
  }
});

test('hub detail art: every admitted measured window and actor pose stays inside its original PNG', () => {
  for (const id of ASPHODELE_HUB_FILES_PRESENT_V188.filter(id => !id.startsWith('asph-msn-') && !id.startsWith('asph-wall-'))) {
    const bytes = readFileSync(new URL('..' + getAsphodeleHubSlotV188(id).path, import.meta.url));
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    const valid = rect => Array.isArray(rect) && rect.length === 4 && rect.every(Number.isFinite) && rect[0] >= 0 && rect[1] >= 0 && rect[2] > 0 && rect[3] > 0 && rect[0] + rect[2] <= width && rect[1] + rect[3] <= height;
    if (getAsphodeleHubSlotV188(id).layer === 'actor') {
      const layout = ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188[id];
      assert.ok(layout && Number.isFinite(layout.referenceHeight) && layout.referenceHeight > 0, id + ' common scale');
      assert.equal(layout.frames.length, id === 'asph-grue' ? 1 : 4);
      for (const frame of layout.frames) { assert.ok(valid(frame.rect), id + ' actual frame'); assert.ok(frame.foot.every(Number.isFinite)); }
    } else assert.ok(valid(ASPHODELE_HUB_IMAGE_SOURCE_RECTS_V188[id]), id + ' measured opaque extent');
    for (const [key, rect] of Object.entries(ASPHODELE_HUB_IMAGE_ANCHORS_V188[id] || {})) assert.ok(valid(rect), id + '/' + key);
  }
});

test('hub detail art: real actor frames share one scale and foot pivot through walking, turning and reduced motion', () => {
  for (const id of ['asph-npc-docker', 'asph-npc-merchant', 'asph-npc-technician', 'asph-grue']) {
    const layout = ASPHODELE_ACTOR_IMAGE_LAYOUTS_V188[id]; assert.ok(layout, id + ' authored poses declared');
    const cases = id === 'asph-grue' ? [[0, false, false, 0]] : [[0, false, false, 0], [0, true, false, 1], [Math.PI / 2, true, false, 2], [Math.PI, true, false, 3], [Math.PI * 1.5, true, false, 2], [Math.PI, true, true, 0]];
    for (const facing of [-1, 1]) for (const [phase, moving, still, frameIndex] of cases) {
      const trace = detailTrace((ctx, loader) => assert.equal(drawAsphodeleActorV188(ctx, loader, id, 400, 650, { facing, phase, moving, still }), 'image'));
      const frame = layout.frames[frameIndex], scale = getAsphodeleHubSlotV188(id).height / layout.referenceHeight;
      assert.deepEqual(trace.calls.find(call => call.method === 'translate').args, [400, 650]);
      assert.deepEqual(trace.calls.find(call => call.method === 'scale').args, [facing * scale, scale]);
      const [, sx, sy, sw, sh, x, y, w, h] = imageCalls(trace)[0].args;
      assert.deepEqual([sx, sy, sw, sh], frame.rect, 'selected authored pose');
      assert.deepEqual([x, y, w, h], [sx - frame.foot[0], sy - frame.foot[1], sw, sh], 'foot pivot, no per-frame squeeze');
      assert.equal(trace.calls.filter(call => call.method === 'ellipse').length, 1, 'one native contact shadow');
    }
    const missing = detailTrace((ctx, loader) => assert.equal(drawAsphodeleActorV188(ctx, loader, id, 400, 650, { moving: true }), 'primitive'), { image: false });
    assert.equal(imageCalls(missing).length, 0); assert.ok(missing.calls.some(call => call.method === 'fillRect'));
  }
});

test('hub wall art: uniform scaling and world anchoring survive camera movement and different image proportions', () => {
  // Explicit geometry fixtures, not a claim to have rendered bitmap pixels.
  for (const [naturalWidth, naturalHeight] of [[1280, 504], [2560, 1008], [2304, 1024]]) {
    const loader = new AsphodeleHubAssetLoaderV188({ ImageCtor: null, present: [] });
    const image = { complete: true, naturalWidth, naturalHeight };
    loader.images.set('asph-wall-ring', image);
    const tileWidth = naturalWidth * 504 / naturalHeight;
    const landmarks = new Map();
    for (const camera of [0, 127, 128, 319, 767, 1279, 1280]) {
      const x0 = Math.max(0, Math.floor(camera / 128) * 128), x1 = Math.min(2560, camera + 1408);
      const trace = artTrace();
      assert.equal(loader.drawWall(trace.ctx, 'asph-wall-ring', x0, 120, x1 - x0, 504, () => assert.fail('loaded wall fell back')), 'image');
      assert.deepEqual(trace.calls.find(call => call.method === 'rect').args, [x0, 120, x1 - x0, 504]);
      assert.ok(trace.calls.some(call => call.method === 'clip'), 'wall stays inside the visible room span');
      const draws = trace.calls.filter(call => call.method === 'drawImage');
      assert.ok(draws.length >= 1 && draws.length <= 3);
      assert.ok(draws[0].args[1] <= x0 && draws.at(-1).args[1] + tileWidth >= x1, 'no hole at either clip edge');
      for (let index = 0; index < draws.length; index++) {
        const [bitmap, x, y, w, h] = draws[index].args;
        assert.equal(bitmap, image); assert.equal(y, 120); assert.equal(h, 504);
        assert.ok(Math.abs(w / naturalWidth - h / naturalHeight) < 1e-12, 'same scale on both axes');
        assert.ok(Math.abs(x / tileWidth - Math.round(x / tileWidth)) < 1e-12, 'origin belongs to world, not camera');
        if (index) assert.equal(x, draws[index - 1].args[1] + w, 'neighbouring panels share an exact boundary');
        // An interior source landmark retains the same world position for a
        // given tile, even when the camera expands or shortens the draw span.
        const tile = Math.round(x / tileWidth), landmark = x + naturalWidth * .37 * w / naturalWidth;
        if (landmarks.has(tile)) assert.ok(Math.abs(landmark - landmarks.get(tile)) < 1e-9, 'same landmark after scrolling');
        else landmarks.set(tile, landmark);
      }
      assert.equal(trace.states.length, 0, 'canvas state restored');
    }
  }
});

test('hub wall art: missing, pending and malformed images retain the original primitive callback', () => {
  const loader = new AsphodeleHubAssetLoaderV188({ ImageCtor: null, present: [] });
  const fallbacks = [], trace = artTrace();
  for (const image of [null, { complete: false, naturalWidth: 1280, naturalHeight: 504 },
    { complete: true, naturalWidth: 1280, naturalHeight: 0 }, { complete: true, naturalWidth: Infinity, naturalHeight: 504 }]) {
    loader.images.set('asph-wall-docks', image);
    assert.equal(loader.drawWall(trace.ctx, 'asph-wall-docks', 256, 120, 1408, 504, (...args) => fallbacks.push(args)), 'primitive');
    assert.equal(loader.usage['asph-wall-docks'], 'primitive');
  }
  assert.equal(fallbacks.length, 4);
  assert.ok(fallbacks.every(args => args[0] === trace.ctx && args.slice(1).join(',') === '256,120,1408,504'));
  assert.equal(trace.calls.filter(call => call.method === 'drawImage').length, 0);
  assert.throws(() => loader.drawWall(trace.ctx, 'asph-door', 0, 120, 96, 132), /wall art slot/);
  assert.throws(() => loader.drawWall(trace.ctx, 'unknown', 0, 120, 96, 132), /wall art slot/);
});

test('hub wall art: a continuous Canvas pattern avoids separate fractional edges and retains its world transform', () => {
  const loader = new AsphodeleHubAssetLoaderV188({ ImageCtor: null, present: [] });
  const image = { complete: true, naturalWidth: 1983, naturalHeight: 793 }, pattern = { fixture: 'repeat-x' };
  const scale = 504 / 793, trace = artTrace(); let created = 0;
  trace.ctx.createPattern = (bitmap, repeat) => { assert.equal(bitmap, image); assert.equal(repeat, 'repeat-x'); created++; return pattern; };
  loader.images.set('asph-wall-ring', image);
  for (const camera of [0, 127, 128, 767, 1280]) {
    trace.calls.length = 0;
    const x0 = Math.floor(camera / 128) * 128, x1 = Math.min(2560, camera + 1408);
    assert.equal(loader.drawWall(trace.ctx, 'asph-wall-ring', x0, 120, x1 - x0, 504), 'image');
    assert.deepEqual(trace.calls.find(call => call.method === 'translate').args, [0, 120]);
    assert.deepEqual(trace.calls.find(call => call.method === 'scale').args, [scale, scale]);
    const fills = trace.calls.filter(call => call.method === 'fillRect');
    assert.equal(fills.length, 1, 'continuous surface rather than adjacent antialiased image rectangles');
    assert.equal(fills[0].fillStyle, pattern);
    const [x, y, w, h] = fills[0].args;
    assert.ok(x * scale <= x0 && (x + w) * scale >= x1, 'surface covers the clipped viewport including fractional edge samples');
    assert.equal(y, 0); assert.ok(Math.abs(h * scale - 504) < 1e-9);
    assert.equal(trace.calls.filter(call => call.method === 'drawImage').length, 0);
    assert.equal(trace.states.length, 0);
  }
  assert.equal(created, 1, 'unchanged source reuses its pattern on the same canvas');
});

test('hub wall art: native hazard paint respects the same door openings as the primitive in every camera span', () => {
  for (const room of Object.values(ASPHODELE_ROOMS_V188)) {
    const gaps = room.doors.map(entry => [entry.x - 58, entry.x + 58]);
    for (const camera of [0, Math.max(0, room.width - 1280)]) {
      const x0 = Math.max(0, Math.floor(camera / 128) * 128), x1 = Math.min(room.width, camera + 1408);
      const primitive = artTrace(), imageTrim = artTrace();
      drawAsphodeleWallV188(primitive.ctx, room.module, x0, x1 - x0, 0, gaps);
      drawAsphodeleWallTrimV188(imageTrim.ctx, room.module, x0, x1 - x0, gaps);
      const bands = trace => trace.calls.filter(call => call.method === 'fillRect' && call.args[1] === 600 && call.args[3] === 6)
        .map(call => ({ args: call.args, color: call.fillStyle }));
      assert.deepEqual(bands(imageTrim), bands(primitive), room.id + ' keeps native floor markings');
      for (const { args: [x, , width] } of bands(imageTrim)) for (const [g0, g1] of gaps)
        assert.ok(x + width <= g0 || x >= g1, room.id + ' paint never crosses a door frame');
      assert.ok(imageTrim.calls.some(call => call.method === 'fillRect' && call.args.join(',') === [x0, 96, x1 - x0, 40].join(',')), 'native ceiling beam retained');
    }
  }
});

const slotTrace = (kind, { present = true, ...options } = {}) => {
  const id = `asph-msn-${kind}`, slot = getAsphodeleHubSlotV188(id), trace = artTrace();
  const loader = new AsphodeleHubAssetLoaderV188({ ImageCtor: MissionImageFixture, present: present ? [id] : [] }); loader.preload([id]);
  const source = drawAsphodeleMissionSlotV188(trace.ctx, loader, { kind, x: 100, y: 150, w: slot.width, h: slot.height }, options);
  assert.equal(trace.states.length, 0);
  return { ...trace, source };
};

test('mission art: explicit nine-file preload is idempotent; visiting the hub does not preload mission images', () => {
  const loader = new AsphodeleHubAssetLoaderV188({ ImageCtor: MissionImageFixture, present: [...ASPHODELE_MISSION_SLOT_IDS_V188, 'asph-door', 'unknown'] });
  assert.deepEqual(loader.preload(), ['/assets/asphodele/v188/asph-door.png']);
  const mission = new AsphodeleHubAssetLoaderV188({ ImageCtor: MissionImageFixture, present: ASPHODELE_MISSION_SLOT_IDS_V188 });
  assert.equal(mission.preload(ASPHODELE_MISSION_SLOT_IDS_V188).length, 9);
  assert.equal(mission.preload(ASPHODELE_MISSION_SLOT_IDS_V188).length, 9, 'no duplicate image requests');
  assert.ok(mission.requested.every(path => path.includes('/asph-msn-')));
  for (const id of ASPHODELE_HUB_FILES_PRESENT_V188.filter(id => id.startsWith('asph-msn-'))) {
    const bytes = readFileSync(new URL('..' + getAsphodeleHubSlotV188(id).path, import.meta.url));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', id);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), rect = ASPHODELE_MISSION_IMAGE_SOURCE_RECTS_V188[id];
    assert.ok(width > 0 && height > 0);
    if (rect) assert.ok(rect[0] >= 0 && rect[1] >= 0 && rect[2] > 0 && rect[3] > 0 && rect[0] + rect[2] <= width && rect[1] + rect[3] <= height, id + ' source window inside original PNG');
  }
});

test('mission art: proportional image/source-window fit, loading/error fallback and clipped short conduit', () => {
  const loader = new AsphodeleHubAssetLoaderV188({ ImageCtor: MissionImageFixture, present: ['asph-msn-panel', 'asph-msn-conduit'] });
  loader.preload(['asph-msn-panel', 'asph-msn-conduit']);
  const trace = artTrace(); let fallback = 0;
  assert.equal(loader.draw(trace.ctx, 'asph-msn-panel', 10, 20, 128, 112, () => fallback++, { fit: 'contain', sourceRect: [20, 30, 200, 100] }), 'image');
  const draw = trace.calls.find(call => call.method === 'drawImage');
  assert.deepEqual(draw.args.slice(1), [20, 30, 200, 100, 10, 44, 128, 64], 'uniform scale and centered inside bounds');
  const image = loader.images.get('asph-msn-panel');
  image.complete = false;
  assert.equal(loader.draw(trace.ctx, 'asph-msn-panel', 10, 20, 128, 112, () => fallback++, { fit: 'contain' }), 'primitive');
  image.complete = true; image.naturalHeight = 0;
  assert.equal(loader.draw(trace.ctx, 'asph-msn-panel', 10, 20, 128, 112, () => fallback++, { fit: 'contain' }), 'primitive');
  image.naturalHeight = 8192;
  assert.equal(loader.draw(trace.ctx, 'asph-msn-panel', 10, 20, 128, 112, () => fallback++, { fit: 'contain', sourceRect: [8190, 0, 100, 100] }), 'primitive');
  assert.equal(fallback, 3, 'pending, malformed and invalid-window images all keep the primitive');
  const clips = [];
  const delegate = { draw(_ctx, id, x, y, w, h, fallbackFn, options) { clips.push({ id, x, y, w, h, options }); return 'image'; } };
  drawAsphodeleMissionSlotV188(trace.ctx, delegate, { kind: 'conduit', x: 20, y: 40, w: 128, h: 12 });
  assert.deepEqual(trace.calls.filter(call => call.method === 'rect').at(-1).args, [20, 40, 128, 12]);
  assert.ok(trace.calls.some(call => call.method === 'clip'));
  assert.equal(clips[0].w, 306, 'conduit keeps its original scale when the free span is shorter');
  assert.equal(clips[0].options.fit, 'contain');
  const unchangedHub = artTrace();
  loader.images.set('asph-door', new MissionImageFixture());
  loader.draw(unchangedHub.ctx, 'asph-door', 5, 6, 96, 132);
  assert.deepEqual(unchangedHub.calls.find(call => call.method === 'drawImage').args.slice(1), [5, 6, 96, 132], 'existing hub draw contract unchanged');
});

test('mission art: FR/EN labels, live CRT, needles and lamp survive both image and primitive paths without duplicate props', () => {
  for (const english of [false, true]) for (const kind of ['panel', 'crt', 'sign', 'conduit', 'blackbox', 'resin', 'salvage', 'gauge', 'camera']) {
    const image = slotTrace(kind, { english, sector: 'lower', time: 1 }), primitive = slotTrace(kind, { present: false, english, sector: 'lower', time: 1 });
    assert.equal(image.source, 'image'); assert.equal(primitive.source, 'primitive');
    const labels = trace => trace.calls.filter(call => call.method === 'fillText').map(call => call.args);
    assert.deepEqual(labels(image).map(args => args[0]), labels(primitive).map(args => args[0]), kind + ' keeps exact text in either render path');
    for (const [text, x, y, maxWidth] of labels(image)) {
      assert.ok(text.length > 0 && maxWidth > 0 && x + maxWidth <= 253 && y <= 252, kind + ' label is bounded');
    }
    if (kind === 'sign') assert.equal(labels(image)[0][0], english ? 'ASPHODÈLE · LOWER DECKS' : 'ASPHODÈLE · PONTS INFÉRIEURS');
    if (kind === 'blackbox' || kind === 'salvage') {
      const color = kind === 'blackbox' ? '#d06b2a' : '#4a3a28', count = kind === 'blackbox' ? 3 : 2;
      assert.equal(primitive.calls.filter(call => call.method === 'fillRect' && call.fillStyle === color).length, count);
      assert.equal(image.calls.filter(call => call.method === 'fillRect' && call.fillStyle === color).length, 0, 'physical props come from PNG once');
    }
  }
  const crtLines = trace => trace.calls.filter(call => call.method === 'fillRect' && call.fillStyle === 'rgba(125,255,154,.6)').map(call => call.args);
  const crt0 = slotTrace('crt', { time: 0 }), crt2 = slotTrace('crt', { time: 2 });
  assert.equal(crtLines(crt0).length, 3); assert.notDeepEqual(crtLines(crt0), crtLines(crt2));
  const needles = trace => trace.calls.filter(call => call.method === 'lineTo').map(call => call.args);
  const gauge0 = slotTrace('gauge', { time: 0 }), gauge2 = slotTrace('gauge', { time: 2 });
  assert.equal(needles(gauge0).length, 3); assert.notDeepEqual(needles(gauge0), needles(gauge2));
  const [, sx, sy, sw, sh, dx, dy, dw, dh] = gauge0.calls.find(call => call.method === 'drawImage').args;
  const starts = gauge0.calls.filter(call => call.method === 'moveTo').map(call => call.args);
  for (const [i, px] of [324, 768, 1212].entries()) {
    assert.ok(Math.abs(starts[i][0] - (dx + (px - sx) * dw / sw)) < 1e-9, 'needle starts at the measured image pivot x');
    assert.ok(Math.abs(starts[i][1] - (dy + (485 - sy) * dh / sh)) < 1e-9, 'needle starts at the measured image pivot y');
  }
  assert.deepEqual(slotTrace('gauge', { present: false }).calls.filter(call => call.method === 'moveTo').map(call => call.args), [[130, 206], [176, 206], [222, 206]], 'fallback pivots unchanged');
  const camera = slotTrace('camera');
  const lamp = camera.calls.find(call => call.method === 'fillRect' && call.fillStyle === '#e15b4f');
  assert.ok(lamp && lamp.args[2] > 0 && lamp.args[3] > 0);
  assert.ok(!camera.calls.some(call => call.method === 'fillRect' && call.fillStyle === '#06140b'), 'camera image glass and bezel remain intact');
  const fallbackCamera = slotTrace('camera', { present: false });
  assert.ok(fallbackCamera.calls.some(call => call.method === 'fillRect' && call.fillStyle === '#e15b4f' && call.args[2] === 5 && call.args[3] === 5));
  assert.ok(fallbackCamera.calls.some(call => call.method === 'fillRect' && call.fillStyle === '#06140b' && call.args[2] === 129 && call.args[3] === 30));
});

test('mission art: real production engine draws all fourteen station campaigns with the admitted path and unchanged passage clearance', async () => {
  assert.equal(ASPHODELE_CAMPAIGNS_V188.length, 14);
  for (const campaign of ASPHODELE_CAMPAIGNS_V188) {
    const { engine, draws } = await fixture({ campaign, seed: 7 }), dressing = engine.asphMissionDressingV188;
    assert.ok(dressing?.feature, campaign.id);
    assert.deepEqual(engine.asphMissionLoaderV188.requested, ASPHODELE_MISSION_SLOT_IDS_V188.filter(id => ASPHODELE_HUB_FILES_PRESENT_V188.includes(id)).map(id => getAsphodeleHubSlotV188(id).path));
    for (const entry of [...dressing.props, dressing.feature]) for (const [x0, x1, top, bottom] of dressing.exclusions) {
      const touchesHeight = !(Number.isFinite(top) && Number.isFinite(bottom) && (bottom < entry.y || top > entry.y + entry.h));
      assert.ok(!touchesHeight || entry.x + entry.w <= x0 || entry.x >= x1, campaign.id + ' keeps the 18 px clearance');
    }
    engine.camera.x = Math.max(0, dressing.feature.x - 400); engine.draw();
    const id = 'asph-msn-' + dressing.feature.kind, admitted = ASPHODELE_HUB_FILES_PRESENT_V188.includes(id);
    assert.equal(engine.asphMissionLoaderV188.usage[id], admitted ? 'image' : 'primitive', campaign.id);
    if (admitted) assert.ok(draws.some(draw => draw.path === getAsphodeleHubSlotV188(id).path), campaign.id + ' draws its actual admitted PNG');
  }
});
