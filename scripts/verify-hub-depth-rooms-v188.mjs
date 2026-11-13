import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HUB_DEPTH_ROOMS_V188, HUB_DEPTH_ROOM_IDS_V188, HUB_FLOOR_Y_V188, hubDepthRoomAtV188, depthToScreenOffsetV188, depthShadeV188,
  depthFootprintsV188, blockedByFootprintV188, stepDepthMoveV188, canLeaveDepthRoomV188, depthInteractionAllowedV188, npcDepthTargetV188,
  stepNpcDepthV188, normalizeHubDepthV188, depthShotHitsV188, depthShotSettleV188, depthAnnouncementV188 } from '../src/hub-depth-rooms-v188.js';
import { withHubDepthRoomsV188 } from '../src/hub-depth-runtime-v188.js';
import { createDefaultSave, migrateSave } from '../src/save.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const hangar = HUB_DEPTH_ROOMS_V188['dropship-hangar'];

test('depth rooms: only the dropship hangar, on the engineering deck, towards the camera from the wall rail', () => {
  assert.deepEqual(HUB_DEPTH_ROOM_IDS_V188, ['dropship-hangar']);
  assert.equal(hangar.deck, 3); assert.equal(hangar.zMax, 0, 'z = 0 is the existing rail'); assert.equal(hangar.zMin, -80);
  assert.equal(hubDepthRoomAtV188(3, 640), hangar); assert.equal(hubDepthRoomAtV188(3, 1300), null, 'the reactor stays 2D'); assert.equal(hubDepthRoomAtV188(0, 640), null);
  assert.equal(depthToScreenOffsetV188(-40), 40, 'front comes down; sprites keep their size'); assert.equal(depthToScreenOffsetV188(0), 0);
  assert.equal(depthShadeV188(hangar, 0), .22); assert.equal(depthShadeV188(hangar, -80), 0);
  assert.equal(HUB_FLOOR_Y_V188 + depthToScreenOffsetV188(hangar.zMin), 704, 'the floor band stays inside the 720 px frame');
});

test('depth rooms: footprints block, the move resolves axis by axis, nothing leaves the floor', () => {
  for (const entry of depthFootprintsV188(hangar)) assert.ok(entry.x0 < entry.x1 && entry.z0 < entry.z1, entry.id);
  assert.equal(blockedByFootprintV188(hangar, 540, -30), true, 'the UD-4L hull'); assert.equal(blockedByFootprintV188(hangar, 540, -10), false, 'lane behind it');
  assert.equal(blockedByFootprintV188(hangar, 540, -55), false, 'open floor in front'); assert.equal(blockedByFootprintV188(hangar, 260, -80), true, 'crates reach the front edge');
  assert.equal(blockedByFootprintV188(hangar, 820, -30), false, 'under the nose');
  const into = stepDepthMoveV188(hangar, { x: 540, z: -10 }, { x: 540 }, { dz: -1, dt: .5 });
  assert.equal(into.z, -20, 'a long frame stops at the hull, it cannot tunnel through'); assert.equal(into.blocked, true);
  const along = stepDepthMoveV188(hangar, { x: 820, z: -30 }, { x: 760 }, { dz: 0, dt: .1, halfWidth: 16 });
  assert.equal(along.x, 820, 'cannot slide horizontally into it either');
  assert.equal(stepDepthMoveV188(hangar, { x: 1000, z: 0 }, { x: 1000 }, { dz: 1, dt: 1 }).z, 0, 'the wall bounds the back');
  assert.equal(stepDepthMoveV188(hangar, { x: 1200, z: -70 }, { x: 1200 }, { dz: -1, dt: 1 }).z, -80, 'the front edge bounds the front');
  assert.equal(stepDepthMoveV188(null, { x: 1, z: -20 }, { x: 2 }).z, 0, 'outside a depth room z is 0');
});

test('depth rooms: the bulkhead and wall stations are reached from the rail; crew within its depth band', () => {
  assert.equal(canLeaveDepthRoomV188(hangar, -20), true); assert.equal(canLeaveDepthRoomV188(hangar, -21), false);
  assert.equal(depthInteractionAllowedV188(hangar, -60, -48), true); assert.equal(depthInteractionAllowedV188(hangar, 0, -48), false);
  const orlov = { crewId: 'crew-08-maksim-orlov', x: 787, w: 44, depthZ: 0 };
  assert.equal(npcDepthTargetV188(hangar, orlov), -48, 'at his post, in front of the nose');
  assert.equal(npcDepthTargetV188(hangar, { ...orlov, x: 500 }, { moving: true }), hangar.npcLane.z, 'walks in front of the ship');
  assert.equal(npcDepthTargetV188(hangar, { ...orlov, x: 1100 }, { moving: true }), 0, 'back on the rail elsewhere');
  let z = 0; for (let i = 0; i < 60; i++) z = stepNpcDepthV188(hangar, { ...orlov, depthZ: z }, -48, 1 / 30);
  assert.ok(Math.abs(z + 48) < 1, 'converges to the post');
  for (const [crewId, station] of Object.entries(hangar.npcDepths)) assert.equal(blockedByFootprintV188(hangar, 809, station, 22), false, crewId);
});

test('depth rooms: future combat rule and announcement are recorded', () => {
  assert.equal(depthShotHitsV188(-40, -60), true); assert.equal(depthShotHitsV188(-10, -60), false);
  assert.equal(depthShotSettleV188(0, -20), -6);
  assert.match(depthAnnouncementV188('fr'), /W\/S : AVANCER \/ RECULER/); assert.match(depthAnnouncementV188('en'), /W\/S: STEP FORWARD \/ BACK/);
});

test('depth rooms: the save carries the depth additively; older saves load at z = 0', () => {
  assert.equal(createDefaultSave().hub.depthV188, null);
  assert.equal(migrateSave({ schema: 52, hub: { positionX: 400 } }).hub.depthV188, null);
  assert.deepEqual(migrateSave({ schema: 52, hub: { depthV188: { roomId: 'dropship-hangar', z: -60 } } }).hub.depthV188, { roomId: 'dropship-hangar', z: -60 });
  assert.deepEqual(normalizeHubDepthV188({ roomId: 'dropship-hangar', z: -500 }), { roomId: 'dropship-hangar', z: -80 });
  assert.equal(normalizeHubDepthV188({ roomId: 'reactor', z: -10 }), null);
  assert.equal(normalizeHubDepthV188('x'), null);
});

class FakeHub {
  constructor() { this.keys = new Set(); this.state = { deck: 3 }; this.player = { x: 600, y: 532, w: 44, h: 92, climbing: false, vx: 0 }; this.npcs = []; this.lifts = 0; this.updates = []; }
  update() { this.updates.push(new Set(this.keys)); }
  useLift() { this.lifts += 1; return true; }
  nearestInteraction() { return { id: 'wall-station' }; }
  nearestHubNpc() { return null; }
  statusPrompt() { return ''; }
  persist() { this.onPersist?.({ positionX: this.player.x }); }
  currentRoom() { return { id: this.player.x < 1280 ? 'dropship-hangar' : 'reactor' }; }
}

test('depth runtime: W/S drive depth and never call a lift in the hangar; other rooms are untouched', () => {
  const Hub = withHubDepthRoomsV188(FakeHub), hub = new Hub();
  assert.equal(withHubDepthRoomsV188(Hub), Hub, 'idempotent');
  hub.player.x = 1000; hub.keys.add('KeyS'); hub.keys.add('KeyD'); hub.update(.5);
  assert.equal(hub.updates[0].has('KeyS'), false, 'S does not reach the ladder physics'); assert.equal(hub.updates[0].has('KeyD'), true);
  assert.ok(hub.player.depthZ < 0, 'S steps towards the camera'); assert.equal(hub.keys.has('KeyS'), true, 'the held key survives');
  assert.equal(hub.useLift(-1), false); assert.equal(hub.lifts, 0);
  assert.equal(hub.nearestInteraction(), null, 'a wall station is out of reach from the floor');
  const saved = []; hub.onPersist = patch => saved.push(patch); hub.persist();
  assert.deepEqual(saved[0].depthV188, { roomId: 'dropship-hangar', z: hub.player.depthZ });
  const other = new Hub(); other.player.x = 1500; other.keys.add('KeyS'); other.update(.5);
  assert.equal(other.updates[0].has('KeyS'), true, 'outside, S keeps its 2D role'); assert.equal(other.player.depthZ, 0);
  assert.equal(other.useLift(1), true); assert.equal(other.lifts, 1);
  const forge = new Hub(); forge.editorPlaytest = true; forge.keys.add('KeyS'); forge.update(.5); assert.equal(forge.updates[0].has('KeyS'), true, 'Forge playtest stays 2D');
});

test('depth runtime: composed under the armory, shipped offline, documented as the exception to visual-only depth', () => {
  const app = read('src/app.js'), sw = read('sw.js');
  assert.match(app, /const HubGame = withHubArmoryStorefrontV169\(withHubDepthRoomsV188\(withHubMotionTrackerV160\(/);
  for (const file of ['/src/hub-depth-rooms-v188.js', '/src/hub-depth-runtime-v188.js']) assert.ok(sw.includes(`'${file}'`), file);
  for (const file of ['src/hub-depth-presentation-v116.js', 'src/hub-room-projection-v139.js', 'src/hub-support-planes-v139.js'])
    assert.match(read(file), /hub-depth-rooms-v188/, `${file} names the depth-room exception`);
});
