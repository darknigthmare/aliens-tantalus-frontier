// QZ-17 (Acte I, « La cargaison fantôme ») level coherence: scale, counts and level design of the
// QZ-17 overlay (src/qz17-level-dressing-v188.js) over the shared ship template.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, tick, host } from './engine-host-v188.mjs';
import { CAMPAIGNS } from '../src/content.js';
import { QZ17_PHYSICAL_COLLECTABLES_V68 } from '../src/narrative-collectables-runtime-v68.js';
import { inDepthSectionV188 } from '../src/mission-depth-v188.js';
import { QZ17_SIZES_V188, QZ17_PX_PER_METRE_V188, QZ17_HOLD_LANES_V188, QZ17_ACCESS_POINTS_V188, QZ17_SEALED_CONTAINERS_V188,
  QZ17_GHOST_CARGO_ID_V188, QZ17_CRADLE_EXIT_VENT_V188, unfitForHoldV188, drawQz17CradleAlcoveV188, drawQz17AccessBoardV188 } from '../src/qz17-level-dressing-v188.js';

const QZ17 = CAMPAIGNS.find(entry => entry.id === 'special-narrative-qz17');
const overlapX = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x;
const span = entry => ({ x: entry.x, w: entry.w });
async function hold(extra = {}) {
  const run = await fixture({ campaign: QZ17, seed: 7, ...extra });
  const { engine } = run, section = engine.missionDepthSectionV188, p = engine.player;
  const place = (actor, x, z = 0) => { actor.x = x; actor.y = section.floorY - actor.h; actor.vx = 0; actor.vy = 0; actor.grounded = true; actor.depthZ = z; };
  return { ...run, section, p, place };
}

test('QZ-17 hold: containers at 10-ft ISO scale, inside the hold, under the service deck', async () => {
  const { engine, section } = await hold();
  assert.equal(QZ17.routes, 4, 'campaign card: four accesses');
  const { container10ft: box } = QZ17_SIZES_V188;
  assert.ok(Math.abs(box.w / QZ17_PX_PER_METRE_V188 - 2.99) < .1 && Math.abs(box.h / QZ17_PX_PER_METRE_V188 - 2.59) < .1, '2.99 × 2.59 m at 51 px/m');
  const containers = section.containers.filter(entry => entry.kind === 'container');
  assert.equal(containers.length, 1, 'one sealed container in the hold, beside the duct and the doorway');
  const deck = engine.platforms.find(entry => entry.id === 'node-platform-ship-service');
  for (const entry of section.containers) {
    assert.ok(entry.x >= section.x0 && entry.x + entry.w <= section.x1, `${entry.id} inside the hold`);
    if (entry.kind === 'container') assert.deepEqual([entry.w, entry.h], [box.w, box.h], `${entry.id} is a 10-ft container`);
    const top = section.floorY - entry.z - entry.h;
    assert.ok(top > deck.y + 22, `${entry.id} clears the service deck (top ${top})`);
  }
  const stack = engine.qz17DressingV188.layout.service, hull = engine.platforms.find(entry => entry.id === 'node-platform-ship-hull');
  assert.equal(stack.h, 2 * box.h); assert.ok(deck.y - stack.h > hull.y + 22, 'the service-deck stack clears the hull deck');
  const serviceDoor = engine.rearEntrancesV130.find(entry => entry.id === 'ship-service-rear-v130');
  assert.ok(!overlapX(stack, serviceDoor), 'and leaves the service doorway clear');
});

test('QZ-17 hold: a wall lane, 1 m gaps, nothing in front of doors, the duct or the doorway', async () => {
  const { engine, section } = await hold();
  for (const entry of section.containers) assert.ok(entry.footprint.z1 <= -QZ17_HOLD_LANES_V188.wallLane, `${entry.id}: wall lane ≥ ${QZ17_HOLD_LANES_V188.wallLane}`);
  assert.ok(QZ17_HOLD_LANES_V188.wallLane > section.interactBand, 'the whole interaction band lies in the wall lane');
  const sorted = [...section.containers].sort((a, b) => a.x - b.x);
  for (let i = 0; i < sorted.length; i++) for (let j = i + 1; j < sorted.length; j++) {
    const a = sorted[i].footprint, b = sorted[j].footprint;
    if (a.z0 < b.z1 && b.z0 < a.z1) assert.ok(b.x0 - a.x1 >= QZ17_HOLD_LANES_V188.minimumGapPx, `${sorted[i].id} / ${sorted[j].id}: ≥ 1 m between them`);
  }
  const frames = engine.closedDoorColliders(); // closed bulkheads are drawn 157 px wide
  const wallFeatures = [...frames.map((frame, index) => ({ ...frame, id: `frame:${engine.doors[index]?.id}` })), ...engine.vents, ...engine.rearEntrancesV130, ...engine.supplies, ...engine.narrativeCollectableActorsV68]
    .filter(entry => entry.x + entry.w > section.x0 - 50 && entry.x < section.x1 + 50 && Math.abs(entry.y + entry.h - section.floorY) < 2);
  assert.ok(wallFeatures.some(entry => entry.id === 'ship-cargo-rear-v130') && wallFeatures.some(entry => entry.id === 'ship-service-wall-entrance'));
  // A prop hides the wall only where its drawn box rises above the wall base line.
  for (const entry of section.containers.filter(item => section.floorY - item.z - item.h < section.floorY)) for (const feature of wallFeatures)
    assert.ok(!overlapX(span(entry), feature), `${entry.id} stands in front of ${feature.id}`);
  const rear = engine.rearEntrancesV130.find(entry => entry.id === 'ship-cargo-rear-v130');
  for (const pickup of [...engine.supplies, ...engine.narrativeCollectableActorsV68].filter(entry => wallFeatures.includes(entry)))
    assert.ok(!overlapX(pickup, rear), `${pickup.id} leaves the back-wall doorway clear`);
  assert.equal(engine.covers.some(cover => cover.zoneId === 'ship-cargo' && cover.x >= section.x0 && cover.x < section.x1), false, 'the rail cover gave way to depth objects');
  assert.ok(section.containers.some(entry => entry.kind === 'pallet' && entry.footprint.z1 > -QZ17_HOLD_LANES_V188.wallLane - 10), 'mid-band cover facing the doorway');
});

test('QZ-17 hold: traversable both ways in the wall lane and the middle lane, the bay is open floor', async () => {
  for (const z of [-10, -24]) {
    const { engine, section, p, place } = await hold();
    const [west, east] = engine.closedDoorColliders(); // both bulkheads shut: the floor runs between their frames
    place(p, west.x + west.w + 2, z); engine.keys.add('KeyD'); tick(engine, 5); engine.keys.delete('KeyD');
    assert.ok(p.x + p.w >= east.x - 2, `eastwards at z ${z}: reached ${Math.round(p.x + p.w)} / ${Math.round(east.x)}`);
    assert.ok(inDepthSectionV188(section, p) && Math.abs(p.depthZ - z) < 1);
    engine.keys.add('KeyA'); tick(engine, 5); engine.keys.delete('KeyA');
    assert.ok(p.x <= west.x + west.w + 2, `westwards at z ${z}: back to ${Math.round(p.x)}`);
  }
  const { engine, section, p, place } = await hold();
  place(p, section.bay.x + 40, -10); engine.keys.add('KeyS'); tick(engine, .8); engine.keys.delete('KeyS');
  assert.ok(p.depthZ <= section.zMin + 1, 'the empty QZ17-04 bay can be walked across');
});

test('QZ-17 hold: the evidence and the ammunition are reached from the wall lane', async () => {
  const { engine, section, p, place } = await hold();
  const email = engine.narrativeCollectableActorsV68.find(entry => entry.id === 'qz17-email-logistics-denial');
  assert.ok(email.x >= section.x0 && email.x + email.w <= section.x1);
  place(p, email.x + email.w / 2 - p.w / 2, -60);
  assert.equal(engine.getInteractionPrompt(p), '', 'no prompt from the front lane');
  place(p, email.x + email.w / 2 - p.w / 2, -10);
  assert.match(engine.getInteractionPrompt(p), /COURRIEL/);
  assert.equal(engine.interact(p), true); assert.equal(email.collected, true, 'collected from the wall lane');
  const ammo = engine.supplies.find(entry => entry.id === engine.qz17DressingV188.ammoId);
  assert.ok(ammo && !section.containers.some(entry => section.floorY - entry.z - entry.h < section.floorY && overlapX(span(entry), ammo)), 'nothing tall stands in front of the ammunition');
});

test('QZ-17 counts: four physical evidence pieces, four accesses, three sealed containers and the missing QZ17-04', async () => {
  const { engine, section } = await hold();
  assert.equal(QZ17_PHYSICAL_COLLECTABLES_V68.length, 4); assert.equal(engine.narrativeCollectableActorsV68.length, 4);
  assert.equal(QZ17_ACCESS_POINTS_V188.length, 4);
  const pools = { door: engine.doors, ladder: engine.ladders, lift: engine.lifts, vent: engine.vents };
  for (const access of QZ17_ACCESS_POINTS_V188) {
    assert.ok(pools[access.kind].some(entry => entry.id === access.ref), `access ${access.id} → ${access.kind} ${access.ref} exists in the level`);
    assert.ok(access.fr && access.en, 'FR and EN');
  }
  const maintenance = QZ17_ACCESS_POINTS_V188.find(entry => entry.id === 'maintenance');
  const { QZ17_ROUTE_CONSEQUENCES_V68 } = await import('../src/narrative-collectables-runtime-v68.js');
  assert.equal(maintenance.ref, QZ17_ROUTE_CONSEQUENCES_V68['follow-maintenance-trace'].accessId, 'the fourth access is the maintenance duct of the route choice');
  const labels = [...section.containers.flatMap(entry => entry.labels || []), ...engine.qz17DressingV188.layout.service.labels];
  assert.deepEqual(labels.sort(), [...QZ17_SEALED_CONTAINERS_V188].sort(), 'three sealed containers, each once');
  assert.equal(QZ17_SEALED_CONTAINERS_V188.length, 3);
  assert.equal(section.bay.label, QZ17_GHOST_CARGO_ID_V188); assert.ok(!labels.includes(QZ17_GHOST_CARGO_ID_V188), 'QZ17-04 is missing from the hold');
});

test('QZ-17 CIN-11: the cradle stands in the maintenance alcove at the duct exit, shut unless the maintenance route is open', async () => {
  const { engine } = await hold();
  const { cradle } = engine.qz17DressingV188, exit = engine.vents.find(entry => entry.id === QZ17_CRADLE_EXIT_VENT_V188);
  assert.ok(cradle && exit, 'alcove placed'); assert.ok(cradle.x >= exit.x + exit.w && cradle.x - (exit.x + exit.w) < 40, 'right beside the maintenance exit');
  assert.ok(QZ17_SIZES_V188.cradle.w <= cradle.w && QZ17_SIZES_V188.cradle.h <= cradle.h, 'the cradle fits its alcove');
  assert.equal(cradle.floorY, exit.y + exit.h, 'on the deck');
  const box = { x: cradle.x, w: cradle.w };
  for (const entry of [...engine.doors, ...engine.vents, ...engine.supplies, ...engine.covers, ...engine.walls, ...engine.ladders.map(l => ({ ...l, w: l.w || 42 }))]
    .filter(entry => Math.abs((entry.y ?? 0) + (entry.h ?? 0) - cradle.floorY) < 140 || entry.y === null))
    assert.ok(!overlapX(box, entry), `the alcove leaves ${entry.id} clear`);
  const draw = open => { const { ctx, text } = host(); drawQz17CradleAlcoveV188(ctx, cradle, open); return text; };
  assert.ok(draw(false).some(line => /SCELLÉ/.test(line)) && !draw(false).includes(QZ17_GHOST_CARGO_ID_V188), 'shut: no spoiler');
  assert.ok(draw(true).includes(QZ17_GHOST_CARGO_ID_V188), 'open: the QZ17-04 cradle');
  assert.equal(engine.qz17MaintenanceRouteOpenV188(), false);
  engine.narrativeCollectablesV68.route = { applied: true, choiceId: 'follow-maintenance-trace' };
  assert.equal(engine.qz17MaintenanceRouteOpenV188(), true);
  const { ctx, text } = host(); drawQz17AccessBoardV188(ctx, engine.qz17DressingV188.board, false);
  assert.equal(text.filter(line => /^\d /.test(line)).length, 4, 'the docking board lists four accesses');
});

test('QZ-17 hold: sleepers wait behind the rows, unfit castes stay out, the decompression stops at the bulkhead', async () => {
  const { engine, section } = await hold({ keepEnemies: true });
  const sleepers = engine.spawnedEnemiesV188.filter(enemy => enemy.levelSpawnId === 'ship-cargo-stalkers' && Math.abs(enemy.y + enemy.h - section.floorY) < 2);
  assert.ok(sleepers.length >= 1);
  for (const enemy of sleepers) {
    assert.equal(unfitForHoldV188(enemy), false, `${enemy.id} is fit for the depth section`);
    assert.ok(Number.isFinite(enemy.depthZ) && enemy.depthZ < 0, `${enemy.id} has a depth`);
    assert.ok(!section.containers.some(entry => enemy.x + enemy.w / 2 > entry.footprint.x0 && enemy.x + enemy.w / 2 < entry.footprint.x1
      && enemy.depthZ > entry.footprint.z0 && enemy.depthZ < entry.footprint.z1), `${enemy.id} not inside a container`);
  }
  const spots = new Set(sleepers.map(enemy => `${Math.round(enemy.x)}:${enemy.depthZ}`)); assert.equal(spots.size, sleepers.length, 'not stacked');
  // Template decompression strip (mission-levels-v52.js): restored here because the fixture clears hazards.
  engine.hazards = [{ id: 'ship-hazard-vacuum', kind: 'vacuum', zoneId: 'ship-cargo', x: 1324, y: 848, w: 260, h: 20 }];
  const dressing = engine.applyQz17DressingV188();
  const vacuum = engine.hazards[0];
  assert.equal(dressing.vacuumId, 'ship-hazard-vacuum'); assert.ok(vacuum.x + vacuum.w <= section.x1, 'the vacuum strip stays in the hold');
});

test('QZ-17 overlay: other missions on the ship template are untouched', async () => {
  const { engine } = await fixture({ seed: 7 });
  assert.equal(engine.qz17DressingV188, null);
  assert.ok(engine.covers.some(cover => cover.id === 'v52-cover-2'), 'the hold cover stays');
  const qz = await hold();
  const other = engine.supplies.find(entry => entry.id === qz.engine.qz17DressingV188.ammoId);
  assert.notEqual(other.x, qz.engine.supplies.find(entry => entry.id === other.id).x, 'supply moved only in QZ-17');
  const { text, ctx } = host(); engine.drawWorld?.(ctx);
  assert.ok(!text.some(line => /QZ17 ·|CHAÎNE DU FROID/.test(line)), 'no QZ-17 dressing drawn');
});
