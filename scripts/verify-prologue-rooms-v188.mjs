// V188 — level-design coherence of the prologue rooms aboard the Tantalus (bible §4 P-1, P-2,
// CIN-02, departure). Scale of the project: 1 m ≈ 51 px (marine 92 px ≈ 1.80 m).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HUB_DECKS } from '../src/hub-game.js';
import { ONBOARDING_SPAWN_V84 } from '../src/hub-onboarding-v84.js';
import { ECHO8_LOCKER_V188 } from '../src/hub-echo8-locker-v188.js';
import { HUB_DESTINATION_CONNECTIONS_V138, HUB_DESTINATION_LABELS_V138 } from '../src/hub-destination-signage-v138.js';
import { HUB_DEPTH_ROOMS_V188, depthFootprintsV188, blockedByFootprintV188, depthInteractionAllowedV188, canLeaveDepthRoomV188 } from '../src/hub-depth-rooms-v188.js';
import { getHubDropshipHangarPlacementV139 } from '../src/hub-dropship-hangar-art-v139.js';
import { SHIP_PORT_TERMINAL_V87 } from '../src/ship-port-room-v87.js';
import { HUB_ANNEX_BY_ID_V71 } from '../src/tantalus-hub-expansion-v71.js';
import { PROVING_GROUND_TARGETS_V81, PROVING_GROUND_FIRING_PAD_V81, validateProvingGroundLayoutV81 } from '../src/tantalus-proving-ground-v81.js';
import { getOpeningExerciseObjectiveV89 } from '../src/opening-exercise-v89.js';
import {
  PX_PER_METRE_V188, HYPERSLEEP_CAPSULE_SIZE_V188, PROLOGUE_CRYO_V188, PROLOGUE_ONBOARDING_POSTS_V188, PROLOGUE_BRIEFING_STAGING_V188,
  PROLOGUE_HANGAR_MARKINGS_V188, cryoCapsulesV188, capsuleLabelV188, briefingStagingActiveV188, prologuePostsForV188, prologuePromptV188,
  withHubPrologueRoomsV188
} from '../src/hub-prologue-rooms-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const m = px => px / PX_PER_METRE_V188;
const FLOOR_Y = 624, MARINE = { w: 44, h: 92 };
const rooms = Object.fromEntries(HUB_DECKS.flatMap(deck => deck.rooms).map(room => [room.id, room]));
const sockets = roomId => HUB_DESTINATION_CONNECTIONS_V138.filter(entry => entry.parentRoomId === roomId)
  .map(entry => ({ id: entry.id, x0: rooms[roomId].xStart + entry.parentSocket.x, x1: rooms[roomId].xStart + entry.parentSocket.x + entry.parentSocket.w }));
const insideAnySocket = (roomId, x0, x1) => sockets(roomId).find(socket => x1 > socket.x0 && x0 < socket.x1) || null;

test('scale: 1 m ≈ 51 px, the marine is about 1.80 m', () => {
  assert.equal(PX_PER_METRE_V188, 51);
  assert.ok(Math.abs(m(MARINE.h) - 1.8) < .03);
});

test('cryo bay: four hypersleep capsules numbered 01–04, capsule 03 is the open one, as in CIN-01', () => {
  const capsules = cryoCapsulesV188(), cryo = rooms['cryo-bay'];
  assert.deepEqual(capsules.map(capsule => capsule.number), [1, 2, 3, 4]);
  assert.deepEqual(capsules.filter(capsule => capsule.open).map(capsule => capsule.number), [PROLOGUE_CRYO_V188.echoCapsule]);
  assert.equal(PROLOGUE_CRYO_V188.echoCapsule, 3);
  for (let i = 1; i < capsules.length; i++) assert.ok(capsules[i].x > capsules[i - 1].x, 'numbered west to east');
  const echo = capsules.find(capsule => capsule.number === 3);
  assert.deepEqual({ x: echo.x, w: echo.w }, { x: cryo.propRenderBounds.x, w: cryo.propRenderBounds.w }, 'capsule 03 is the room’s own capsule');
  assert.ok(cryo.propPlacementV139.interiorBounds.w >= MARINE.h, 'its bed holds a lying marine');
  assert.equal(capsuleLabelV188(echo), 'CAPSULE 03 · OUVERTE'); assert.equal(capsuleLabelV188(echo, 'en'), 'CAPSULE 03 · OPEN');
  assert.equal(capsuleLabelV188(capsules[0]), 'CAPSULE 01');
  for (const capsule of capsules.filter(entry => entry.row === 'front')) {
    assert.deepEqual({ w: capsule.w, h: capsule.h }, HYPERSLEEP_CAPSULE_SIZE_V188);
    assert.ok(Math.abs(m(capsule.w) - 2.3) < .05 && Math.abs(m(capsule.h) - 1.1) < .05, '2.3 × 1.1 m');
    assert.ok(capsule.y > FLOOR_Y + 8, 'below the walk rail: never covers an actor standing on it');
    assert.ok(capsule.feetY <= 704, 'inside the floor band of the frame');
    assert.ok(capsule.x >= cryo.xStart && capsule.x + capsule.w <= cryo.xEnd, `capsule ${capsule.number} inside the bay`);
  }
  const front = capsules.filter(entry => entry.row === 'front');
  for (let i = 1; i < front.length; i++) assert.ok(front[i].x >= front[i - 1].x + front[i - 1].w + 51, 'a metre between neighbouring capsules');
});

test('cryo bay: the woken marine stands at the head of capsule 03, by the cryostasis station; DAVID-8R welcomes him there', () => {
  const echo = cryoCapsulesV188().find(capsule => capsule.open), spawn = ONBOARDING_SPAWN_V84, station = PROLOGUE_CRYO_V188.station;
  assert.equal(spawn.roomId, 'cryo-bay'); assert.equal(spawn.positionX, PROLOGUE_CRYO_V188.wakeSpawnX);
  const gap = echo.x - (spawn.positionX + MARINE.w);
  assert.ok(gap >= 0 && gap <= PX_PER_METRE_V188, `beside the capsule (${m(gap).toFixed(2)} m)`);
  assert.ok(station.x >= spawn.positionX + MARINE.w && station.x + station.w <= echo.x, 'the station sits between the marine and his capsule');
  const centre = spawn.positionX + MARINE.w / 2;
  assert.ok(Math.abs(centre - 4736) < 230, 'the wake contact (hub-onboarding-v84) covers the spawn');
  assert.match(read('src/hub-onboarding-v84.js'), /Math\.abs\(center - 4736\) < 230/);
  const david = PROLOGUE_ONBOARDING_POSTS_V188['crew-10-david-8r'];
  assert.ok(Math.abs(centre - (david.x + MARINE.w / 2)) < 118, 'DAVID-8R is within talking reach of the woken marine');
  assert.ok(david.x + MARINE.w <= spawn.positionX, 'without standing on him');
  assert.equal(insideAnySocket('cryo-bay', david.x - 24, david.x + MARINE.w + 24), null, 'nor in a doorway');
  assert.deepEqual([...prologuePostsForV188({ deck: 0, onboardingPhase: 'wake' })], [['crew-10-david-8r', david.x]]);
  assert.equal(prologuePromptV188({ onboarding: { action: 'hub:onboarding-wake' } }), 'E — CONFIRMER LE RÉVEIL · POSTE DE CRYOSTASE');
  assert.equal(prologuePromptV188({ onboarding: { action: 'hub:onboarding-wake' }, language: 'en' }), 'E — CONFIRM YOUR WAKE · CRYOSTASIS STATION');
});

test('cryo bay: the ECHO-8 locker is a locker, and the escape-pod door no longer reads as the hypersleep capsules', () => {
  assert.equal(ECHO8_LOCKER_V188.roomId, 'cryo-bay');
  assert.ok(Math.abs(m(ECHO8_LOCKER_V188.w) - .9) < .05 && Math.abs(m(ECHO8_LOCKER_V188.h) - 2.2) < .05, '0.9 × 2.2 m');
  assert.ok(ECHO8_LOCKER_V188.x >= rooms['cryo-bay'].xStart && ECHO8_LOCKER_V188.x + ECHO8_LOCKER_V188.w <= rooms['cryo-bay'].xEnd);
  assert.equal(insideAnySocket('cryo-bay', ECHO8_LOCKER_V188.x, ECHO8_LOCKER_V188.x + ECHO8_LOCKER_V188.w), null);
  assert.equal(HUB_DESTINATION_LABELS_V138['escape-pods'], 'CAPSULES DE SAUVETAGE');
  assert.match(read('src/i18n-en-catalog-v185.js'), /"CAPSULES DE SAUVETAGE": "ESCAPE PODS"/);
});

test('briefing: Velez briefs at the table; before CIN-02 Vega, Harlow and Velez wait at the holographic table', () => {
  const table = rooms.briefing.propRenderBounds, velez = PROLOGUE_ONBOARDING_POSTS_V188['crew-02-tamsin-velez'];
  const atTable = x => x + MARINE.w > table.x - 24 && x < table.x + table.w + 24;
  assert.ok(atTable(velez.x), 'onboarding briefing at the table');
  assert.equal(insideAnySocket('briefing', velez.x - 24, velez.x + MARINE.w + 24), null, 'not in the MIRE archives doorway');
  const posts = PROLOGUE_BRIEFING_STAGING_V188.posts;
  assert.deepEqual(posts.map(post => post.crewId), ['crew-01-mara-vega', 'crew-09-inez-harlow', 'crew-02-tamsin-velez']);
  for (const post of posts) { assert.ok(atTable(post.x), post.crewId); assert.equal(insideAnySocket('briefing', post.x, post.x + MARINE.w), null, post.crewId); }
  for (let i = 1; i < posts.length; i++) assert.ok(posts[i].x - posts[i - 1].x >= MARINE.w + 12, 'three bodies side by side');
  assert.equal(briefingStagingActiveV188({ openingPhase: 'ready', portPhase: 'pending', cinematicsSeen: [] }), true);
  assert.equal(briefingStagingActiveV188({ openingPhase: 'ready', portPhase: 'pending', cinematicsSeen: ['cin-02'] }), false, 'CIN-02 seen');
  assert.equal(briefingStagingActiveV188({ openingPhase: 'ready', portPhase: 'complete', cinematicsSeen: [] }), false, 'after the quay');
  assert.equal(briefingStagingActiveV188({ openingPhase: 'manifest' }), false);
  assert.equal(prologuePostsForV188({ deck: 0, staging: true }).size, 3); assert.equal(prologuePostsForV188({ deck: 2, staging: true }).size, 0);
  assert.equal(prologuePromptV188({ opening: { action: 'opening:ready' } }), 'E — PRÉPARER LA PREMIÈRE SORTIE');
  assert.equal(prologuePromptV188({ onboarding: { action: 'hub:onboarding-dialogue', npc: { name: 'Tamsin Velez' } }, language: 'en' }), 'E — LISTEN TO TAMSIN VELEZ');
});

const hangar = HUB_DEPTH_ROOMS_V188['dropship-hangar'];
const props = Object.fromEntries(hangar.props.map(prop => [prop.id, prop]));

test('hangar: floor objects keep their ids and the scale of a working hangar', () => {
  assert.deepEqual(Object.keys(props), ['crates-west', 'cart-east', 'crates-east']);
  for (const prop of hangar.props.filter(entry => entry.kind === 'crate')) {
    assert.ok(m(prop.w) <= 1.2 + 1e-9 && m(prop.h) <= 1.2 + 1e-9, `${prop.id}: a cargo crate is at most 1.2 m (${m(prop.w).toFixed(2)} × ${m(prop.h).toFixed(2)} m)`);
    assert.ok(prop.h <= 70, `${prop.id}: one row, no QZ stencil aboard the Tantalus (depth-props-v188 stacks above 70 px)`);
  }
  const cart = props['cart-east'];
  assert.ok(m(cart.w) >= 1.2 && m(cart.w) <= 1.8 && m(cart.h) <= 1, 'a fuel / ordnance cart, about 1.5 × 0.8 m');
  const placement = getHubDropshipHangarPlacementV139(rooms['dropship-hangar']);
  assert.ok(Math.abs(placement.renderBounds.w - 720) < 1, 'the UD-4L drawing stays 720 px (≈ 14 m)');
});

test('hangar: the rail band stays clear and floor lanes are at least a metre wide', () => {
  for (const entry of depthFootprintsV188(hangar)) assert.ok(entry.z1 <= -hangar.doorBand, `${entry.id} stays out of the rail band (z > −20)`);
  const prints = depthFootprintsV188(hangar);
  for (let a = 0; a < prints.length; a++) for (let b = a + 1; b < prints.length; b++) {
    const p = prints[a], q = prints[b];
    if (!(p.z0 < q.z1 && q.z0 < p.z1)) continue; // different depth bands
    const gap = Math.max(q.x0 - p.x1, p.x0 - q.x1);
    assert.ok(gap >= PX_PER_METRE_V188, `${p.id} / ${q.id}: ${m(gap).toFixed(2)} m between them`);
  }
  for (const prop of hangar.props) assert.equal(insideAnySocket('dropship-hangar', prop.x, prop.x + prop.w), null, `${prop.id} is not parked in front of a door`);
  const v = PROLOGUE_HANGAR_MARKINGS_V188.fuelValve;
  assert.equal(insideAnySocket('dropship-hangar', v.x, v.x + v.w), null, 'the fuel valve is on bare wall');
  assert.ok(v.x >= props['cart-east'].x + props['cart-east'].w, 'and not hidden behind the cart');
});

test('hangar: every working point is reachable on foot from the reactor bulkhead', () => {
  const half = MARINE.w / 2 - 6, step = 4;
  const key = (x, z) => `${x},${z}`, seen = new Set(), queue = [[1236, 0]];
  seen.add(key(1236, 0));
  while (queue.length) {
    const [x, z] = queue.shift();
    for (const [nx, nz] of [[x + step, z], [x - step, z], [x, z + 2], [x, z - 2]]) {
      if (nx < hangar.x0 + half || nx > hangar.x1 - half || nz < hangar.zMin || nz > hangar.zMax || seen.has(key(nx, nz))) continue;
      if (blockedByFootprintV188(hangar, nx, nz, half)) continue;
      seen.add(key(nx, nz)); queue.push([nx, nz]);
    }
  }
  const reach = (x0, x1, z0, z1) => [...seen].some(entry => { const [x, z] = entry.split(',').map(Number); return x >= x0 && x <= x1 && z >= z0 && z <= z1; });
  const wall = [-6, 0];
  assert.ok(reach(SHIP_PORT_TERMINAL_V87.centerX - 65, SHIP_PORT_TERMINAL_V87.centerX + 65, ...wall), 'civil docking desk');
  const relay = sockets('dropship-hangar').find(s => s.id === 'frontier-civil-counter'), airlock = sockets('dropship-hangar').find(s => s.id === 'arrival-airlock');
  assert.ok(reach(relay.x0, relay.x1, ...wall), 'civil relay door'); assert.ok(reach(airlock.x0, airlock.x1, ...wall), 'arrival airlock');
  const ladder = { x0: 180, x1: 232 }; // v51 'bridge-floor' ladder of the hangar
  assert.ok(reach(ladder.x0, ladder.x1, -6, 0), 'floor ladder foot');
  assert.ok(reach(930, 1216, -20, 0), 'control booth (manifest)'); assert.ok(canLeaveDepthRoomV188(hangar, 0));
  const board = PROLOGUE_HANGAR_MARKINGS_V188.boarding, z = (board.z0 + board.z1) / 2;
  assert.ok(depthInteractionAllowedV188(hangar, board.z0, hangar.dropship.interactZ) && depthInteractionAllowedV188(hangar, board.z1, hangar.dropship.interactZ), 'the boarding box lies in the UD-4L answer band');
  assert.ok(reach(board.x0, board.x1, z - 4, z + 4), 'UD-4L boarding box');
  const orlov = hangar.npcDepths['crew-08-maksim-orlov'];
  assert.ok(reach(740, 880, orlov - hangar.interactBand, orlov + hangar.interactBand), 'Orlov at his post');
});

test('proving ground (P-2): nine human-sized targets in three lanes, 6 to 16 m downrange; the link console on the floor, left of the ladder', () => {
  assert.equal(validateProvingGroundLayoutV81().valid, true);
  assert.equal(PROVING_GROUND_TARGETS_V81.length, 9);
  const muzzle = PROVING_GROUND_FIRING_PAD_V81.muzzle.x;
  const ranges = PROVING_GROUND_TARGETS_V81.map(target => m(target.bounds.x + target.bounds.w / 2 - muzzle));
  assert.ok(Math.min(...ranges) > 5.5 && Math.max(...ranges) < 16.5, ranges.map(r => r.toFixed(1)).join(' '));
  for (const lane of ['low', 'level', 'high']) {
    const own = PROVING_GROUND_TARGETS_V81.filter(target => target.lane === lane);
    assert.deepEqual(own.map(target => target.id.split('-').pop()), ['near', 'mid', 'far'], lane);
    for (let i = 1; i < own.length; i++) assert.ok(own[i].bounds.x > own[i - 1].bounds.x, `${lane}: near < mid < far`);
  }
  for (const target of PROVING_GROUND_TARGETS_V81) assert.ok(Math.abs(m(target.bounds.h) - 1.88) < .05, 'a silhouette of a standing adult');
  assert.ok(Math.abs(m(FLOOR_Y - PROVING_GROUND_FIRING_PAD_V81.surfaceY) - 3.06) < .05, 'firing pad on a 3 m catwalk');
  const annex = HUB_ANNEX_BY_ID_V71['proving-ground'], ladder = annex.ladders[0], station = annex.station.bounds;
  assert.equal(ladder.bottom, FLOOR_Y); assert.ok(station.y + station.h === FLOOR_Y && station.x + station.w < ladder.x, 'console on the floor, left of the ladder');
  const blocking = annex.colliders.filter(c => c.role !== 'station' && c.collisionMode !== 'one-way-top' && c.y + c.h > FLOOR_Y - MARINE.h
    && c.x < ladder.x && c.x + c.w > station.x + station.w);
  assert.deepEqual(blocking, [], 'nothing stands between the ladder foot and the console');
  assert.match(getOpeningExerciseObjectiveV89({ schema: 89, phase: 'console', sessionId: 'm41a-qualification-v81:session-1' }, { phase: 'qualification' }, { phase: 'complete' }).text, /console à gauche/);
});

test('runtime: composed in the hub chain inside the depth rooms, idempotent, inert outside the prologue', () => {
  const app = read('src/app.js');
  assert.match(app, /withForgeShipRuntimeV141\(withHubPrologueRoomsV188\(withHubEcho8LockerV188\(NativeHubGame\)\)\)/);
  assert.match(app, /const HubGame = withHubArmoryStorefrontV169\(withHubDepthRoomsV188\(withHubMotionTrackerV160\(/);
  class Base { createNpcs() { return [{ crewId: 'crew-02-tamsin-velez', x: 1570, w: 44, h: 92, routinePhaseV62: 'onboarding-post' }]; } update() {} statusPrompt() { return 'E — ENTRER DANS ARCHIVES'; } }
  const Hub = withHubPrologueRoomsV188(Base); assert.equal(withHubPrologueRoomsV188(Hub), Hub);
  const hub = new Hub(); hub.state = { deck: 0 }; hub.running = true;
  hub.onboardingV84 = { phase: 'briefing' }; hub.onboardingActiveV84 = () => true;
  hub.npcs = hub.createNpcs(0); assert.equal(hub.npcs[0].x, 1740, 'Velez takes her post at the table');
  hub.npcs[0].x = 1570; hub.update(.016); assert.equal(hub.npcs[0].x, 1740, 'and holds it while the routines run');
  hub.onboardingV84 = { phase: 'complete' }; hub.onboardingActiveV84 = () => false; hub.openingV88 = { phase: 'complete' };
  hub.npcs[0].x = 1570; hub.update(.016); assert.equal(hub.npcs[0].x, 1570, 'outside the prologue the routine owns her');
  assert.equal(hub.statusPrompt(), 'E — ENTRER DANS ARCHIVES');
});
