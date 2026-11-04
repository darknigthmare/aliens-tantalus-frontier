import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { getHubRoomLifePlanV136, drawHubRoomLifeV136 } from '../src/hub-room-life-v136.js';
import { HUB_ROOM_BATCH_DETAILS_V168 } from '../src/hub-room-batch-details-v168.js';
import { HUB_ROOM_ENRICHMENT_V177, HUB_ENRICHMENT_KINDS_V177, HUB_ENRICHMENT_SECTORS_V177,
  getHubEnrichmentReservationsV177, getHubRoomEnrichmentPlanV177, drawHubRoomEnrichmentV177 } from '../src/hub-room-enrichment-v177.js';

const rooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V137.map(getHubAnnexRuntimeGeometryV139)];
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const grow = (b, margin) => ({ x: b.x - margin, y: b.y - margin, w: b.w + margin * 2, h: b.h + margin * 2 });
function optionsFor(room) {
  const deck = HUB_DECKS.findIndex(item => item.rooms.includes(room));
  if (deck < 0) return { doors: [], ladders: room.ladders || [], vents: room.vents || [], platforms: room.platforms || [], occluders: room.occluders || [] };
  const geometry = buildHubTraversalGeometryV87(deck);
  return { doors: buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck), ladders: geometry.ladders,
    vents: geometry.vents, occluders: geometry.occluders,
    platforms: geometry.platforms.filter(platform => platform.x < room.xEnd && platform.x + platform.w > room.xStart) };
}
function recorder() {
  const commands = []; let depth = 0;
  const canvas = new Proxy({ commands,
    save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    fillRect(...args) { commands.push(['fill', ...args]); },
    stroke() { commands.push(['stroke']); }, fill() { commands.push(['path-fill']); },
    drawImage() { throw Error('V177 fixtures must not manufacture or enlarge a bitmap'); },
    measureText(text) { return { width: text.length * 5 }; },
    balanced() { assert.equal(depth, 0); }
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  return canvas;
}

test('the second100 batch contains four25-installation sectors,16 functional kinds and every ship compartment', () => {
  const ledgerBytes=readFileSync(new URL('../docs/forge/xeno-trials/batch100-v177.json',import.meta.url));
  const ledger=JSON.parse(ledgerBytes);
  const successor=JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/door-bay-continuation-v182.json',import.meta.url))).enrichmentSuccessor;
  assert.deepEqual(successor.sourceLedger,{path:'docs/forge/xeno-trials/batch100-v177.json',sha256:'2b1d3bb47423e738b1cf8f4e4844a5d717cdb70c695878bdce18beb6ffa3b734'});
  assert.equal(createHash('sha256').update(ledgerBytes).digest('hex'),successor.sourceLedger.sha256,'The V179 placement witness stays byte-for-byte intact');
  assert.equal(successor.placements.length,1);
  const delta=successor.placements[0];
  assert.equal(delta.id,'T177-I05');assert.equal(delta.previous.id,delta.id);
  assert.deepEqual(delta.previous,ledger.entries.find(item=>item.id===delta.id));
  assert.deepEqual(delta.previous.bounds,{x:288,y:372,w:40,h:24});
  assert.deepEqual(delta.current,{...delta.previous,bounds:{x:475,y:368,w:40,h:24},
    note:'The wall-mounted intercom follows the relocated quarantine service landing, above the retained oxygen locker and west of both ladder approaches. Its operating face remains reachable from that real support and outside the complete BIOFORGE door bay.'});
  const currentLedger=ledger.entries.map(item=>item.id===delta.id?delta.current:item);
  assert.equal(successor.unchangedSecondBatchEntries,99);assert.equal(successor.firstBatchEntriesPreserved,100);
  assert.equal(ledger.entries.filter(item=>item.id!==delta.id).length,99);
  assert.equal(ledger.installations,100);assert.equal(ledger.firstBatchInstallationsPreserved,100);
  assert.deepEqual(currentLedger,HUB_ROOM_ENRICHMENT_V177,'Only the explicitly witnessed V182 intercom transition changes the active batch');
  assert.equal(HUB_ROOM_ENRICHMENT_V177.length, 100);
  assert.equal(new Set(HUB_ROOM_ENRICHMENT_V177.map(item => item.id)).size, 100);
  assert.equal(new Set(HUB_ROOM_ENRICHMENT_V177.map(item => item.kind)).size, 16);
  assert.deepEqual([...new Set(HUB_ROOM_ENRICHMENT_V177.map(item => item.roomId))].sort(), rooms.map(room => room.id).sort());
  assert.ok(HUB_ROOM_ENRICHMENT_V177.every(item => !HUB_ROOM_BATCH_DETAILS_V168.some(old => old.id === item.id)));
  for (const entries of Object.values(HUB_ENRICHMENT_SECTORS_V177)) assert.equal(entries.length, 25);
  for (const item of HUB_ROOM_ENRICHMENT_V177) {
    assert.equal(item.mount, 'rear-wall'); assert.ok(item.purpose.length > 10); assert.ok(item.note.length > 35);
    assert.ok(HUB_ENRICHMENT_KINDS_V177.includes(item.kind));
    assert.ok(Object.isFrozen(item) && Object.isFrozen(item.bounds));
  }
});

test('all100 explicit positions clear the real native geometry and the first100 without relocating either batch', () => {
  let admitted = 0, previous = 0;
  for (const room of rooms) {
    const options = optionsFor(room), composition = getHubRoomLifePlanV136(room, options), before = JSON.stringify(composition);
    const plan = getHubRoomEnrichmentPlanV177(room, composition, options), reserved = getHubEnrichmentReservationsV177(room, composition, options);
    assert.equal(plan.omitted.length, 0, room.id + JSON.stringify(plan.omitted));
    assert.ok(plan.items.length >= 2 && plan.items.length <= 4, room.id);
    assert.equal(plan.projection, composition.spatial.projection.kind);
    assert.equal(plan.projectionDxPerY, composition.spatial.projection.dxPerY);
    assert.equal(plan.collidable, false); assert.equal(plan.interactive, false); assert.equal(plan.geometryPreserved, true);
    const defaultPlan = getHubRoomEnrichmentPlanV177(room, getHubRoomLifePlanV136(room), options);
    assert.equal(defaultPlan.omitted.length, 0, room.id + ': default/catalogue composition');
    admitted += plan.items.length; previous += composition.batchDetailsV168.items.length;
    assert.equal(composition.batchDetailsV168.omitted.length, 0);
    for (const item of plan.items) {
      assert.ok(reserved.every(bounds => !overlap(item.clearanceBounds, bounds)), item.id);
      assert.ok(plan.items.every(other => item === other || !overlap(grow(item.bounds, 10), grow(other.bounds, 10))), item.id);
      const source = HUB_ROOM_ENRICHMENT_V177.find(source => source.id === item.id);
      assert.deepEqual(item.bounds, { ...source.bounds, x: composition.spatial.bounds.x + source.bounds.x });
      if (['intercom', 'safety-callpoint', 'spill-kit', 'hose-reel', 'power-socket', 'sanitation-unit', 'tool-shadowboard'].includes(item.kind)) {
        const height = item.serviceHeight;
        assert.ok(height, item.id + ' has no actual service-height witness');
        const support = height.supportId === room.id + '-floor'
          ? { x: composition.spatial.bounds.x, y: composition.spatial.planes.walkY, w: composition.spatial.bounds.w }
          : options.platforms.find(platform => platform.id === height.supportId);
        assert.ok(support, item.id + ' invented an absent walkway');
        assert.equal(height.supportY, support.y);
        assert.ok(height.rise >= 44 && height.rise <= (item.kind === 'sanitation-unit' ? 88 : 120), item.id);
        assert.ok(item.bounds.x + item.bounds.w / 2 >= support.x + 22
          && item.bounds.x + item.bounds.w / 2 <= support.x + support.w - 22, item.id);
        assert.equal(height.observedTravel, false);
      }
    }
    assert.equal(JSON.stringify(composition), before);
  }
  assert.equal(admitted, 100); assert.equal(previous, 100);
});

test('the refuge overhead and porthole and the live range envelope keep their actual empty space', () => {
  const refuge = HUB_ROOM_ENRICHMENT_V177.filter(item => item.roomId === 'personal-refuge');
  assert.equal(refuge.length, 2);
  assert.ok(refuge.every(item => item.bounds.y >= 338 && item.bounds.x >= 64 && item.bounds.x + item.bounds.w <= 1216));
  const range = HUB_ROOM_ENRICHMENT_V177.filter(item => item.roomId === 'proving-ground');
  assert.equal(range.length, 3); assert.ok(range.every(item => item.bounds.x + item.bounds.w <= 806));
});

test('foreground rails, redirected conduits, storefront facades and first-batch fittings refuse conflicting additions explicitly', () => {
  for (const [roomId, role] of [['bridge', 'visible-guardrail'], ['crew-quarters', 'visible-conduit'], ['armory', 'storefront-canopy'], ['bridge', 'T168-C01']]) {
    const room = rooms.find(room => room.id === roomId), options = optionsFor(room), composition = getHubRoomLifePlanV136(room, options);
    const reserved = getHubEnrichmentReservationsV177(room, composition, options);
    const obstruction = reserved.find(bounds => bounds.role === role && (role !== 'visible-conduit' || bounds.h > 80));
    assert.ok(obstruction, role);
    const source = HUB_ROOM_ENRICHMENT_V177.find(item => item.roomId === roomId);
    const bounds = { x: Math.max(128, obstruction.x - composition.spatial.bounds.x + 6), y: Math.max(190, obstruction.y + 12), w: 40, h: 24 };
    const rejected = getHubRoomEnrichmentPlanV177(room, composition, { ...options, entries: [{ ...source, id: 'conflicting-fixture', bounds }] });
    assert.equal(rejected.items.length, 0); assert.equal(rejected.omitted.length, 1);
    assert.equal(rejected.omitted[0].reason, 'existing-reservation');
    assert.ok(rejected.omitted[0].conflicts.includes(role), JSON.stringify(rejected.omitted));
    assert.deepEqual(rejected.omitted[0].bounds, { ...bounds, x: composition.spatial.bounds.x + bounds.x });
  }
});

test('every admitted assembly has a real painted payload beyond its brackets and balances the native canvas state', () => {
  let total = 0; const paintedKinds = new Set();
  for (const room of rooms) {
    const options = optionsFor(room), composition = getHubRoomLifePlanV136(room, options), plan = getHubRoomEnrichmentPlanV177(room, composition, options);
    const before = JSON.stringify(plan), canvas = recorder(), report = drawHubRoomEnrichmentV177(canvas, plan);
    assert.equal(report.pending.length, 0); assert.equal(report.omitted.length, 0); canvas.balanced();
    assert.equal(JSON.stringify(plan), before); assert.deepEqual(report.painted.map(item => item.id), plan.items.map(item => item.id));
    assert.deepEqual(composition.enrichmentV177.items.map(item => item.id), plan.items.map(item => item.id), room.id + ': plan is not connected to RoomLife');
    const nativeCanvas = recorder(), actual = drawHubRoomLifeV136(nativeCanvas, room, options);
    nativeCanvas.balanced();
    assert.deepEqual(actual.enrichmentV177.painted.map(item => item.id), report.painted.map(item => item.id), room.id + ': production painter omitted the new fittings');
    for (const item of plan.items) {
      const single = recorder(); drawHubRoomEnrichmentV177(single, { ...plan, items: [item] }); single.balanced();
      assert.ok(single.commands.length >= 8, item.id + ' drew only its mounting brackets'); paintedKinds.add(item.kind);
    }
    total += report.painted.length;
  }
  assert.equal(total, 100); assert.equal(paintedKinds.size, 16);
});

test('invalid, duplicate and overlapping authored entries are reported instead of being scattered to another wall', () => {
  const room = rooms.find(room => room.id === 'mess'), options = optionsFor(room), composition = getHubRoomLifePlanV136(room, options);
  const source = HUB_ROOM_ENRICHMENT_V177.find(item => item.roomId === room.id);
  const entries = [source, { ...source }, { ...source, id: 'bad-floor', bounds: { ...source.bounds, y: 570 } },
    { ...source, id: 'bad-kind', kind: 'unreviewed-furniture' }];
  const before = JSON.stringify(entries), plan = getHubRoomEnrichmentPlanV177(room, composition, { ...options, entries });
  assert.equal(plan.items.length, 1); assert.equal(plan.omitted.length, 3); assert.equal(JSON.stringify(entries), before);
});

test('manual fixtures cannot be admitted above an actual crew service height just because a wall gap is empty', () => {
  const room = rooms.find(room => room.id === 'mess'), options = optionsFor(room), composition = getHubRoomLifePlanV136(room, options);
  const source = HUB_ROOM_ENRICHMENT_V177.find(item => item.id === 'T177-H04');
  const oldHighPosition = { x: 928, y: 466, w: 48, h: 40 };
  const plan = getHubRoomEnrichmentPlanV177(room, composition, { ...options,
    entries: [{ ...source, id: 'unreachable-clean-hand-unit', bounds: oldHighPosition }] });
  assert.equal(plan.items.length, 0);
  assert.equal(plan.omitted.length, 1); assert.equal(plan.omitted[0].reason, 'unserved-manual-height');
  assert.deepEqual(plan.omitted[0].bounds, { ...oldHighPosition, x: composition.spatial.bounds.x + oldHighPosition.x });
});
