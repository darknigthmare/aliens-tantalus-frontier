// V188 — the M577 to scale everywhere (owner decisions of 2026-11-22, round 2):
// the drivable M577 of the ordinary levels and the one lowered by the UD-4L (449 × 112 px,
// src/m577-scale-v188.js), the parked M577 of C3, Noor Okafor on the C3 preparation screen,
// and the Act V chase framing. Real production engine (engine-host-v188.mjs) on the
// generated levels (LEVEL_SEEDS, variant 0). Injections are declared where used: marine
// positions (`atDoor`), held keys (`engine.keys`), the objective chain declared satisfied
// (`satisfy`), and in the chase the trailers' integrity held at 100 (`pinTrailers`: the
// fixture that keeps the trailers attached so the Queen never feeds on a torn one).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS, VEHICLES, ENEMIES } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { M577_SCALE_V188, M577_ORDINARY_IDS_V188, m577LanesV188, m577ParkingV188, m577ClampToLaneV188, isM577VehicleV188 } from '../src/m577-scale-v188.js';
import { LEVEL_DROPSHIP_SCALE_V188, UD4L_FRAME_V188, ud4lToWorldV188 } from '../src/level-dropship-slots-v188.js';
import { M577_DROP_V188 } from '../src/mission-dropship-handover-v188.js';
import { COLONY_C3_NOOR_ID_V188, COLONY_C3_NOOR_PREP_V188, colonyPreparationCrewV188 } from '../src/colony-mission-levels-v188.js';
import { COLONY_C3_M577_V188 } from '../src/colony-level-art-v188.js';
import { ACT5_CHASE_FRAMING_V188 } from '../src/act5-convoy-race-runtime-v188.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';
import { TANTALUS_I18N_DELTA_V188 } from './i18n-tantalus-xeno-merge-v188.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const worldOf = campaign => WORLDS.find(world => world.id === campaign.worldId) || WORLDS[0];
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
async function level(id, { vehicle = VEHICLES[0], ...extra } = {}) {
  const campaign = CAMPAIGNS.find(entry => entry.id === id), world = worldOf(campaign);
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  return { ...(await fixture({ campaign, seed: missionLevel.levelSeed.seed, options: { world, levelSeed: missionLevel.levelSeed, missionLevel, vehicle, operationId: `op-${id}`, ...extra } })), missionLevel };
}
/** Physical fit of the parked hull: whole length on the floor at its feet line (lift cabins excluded), nothing solid in its drawn box. */
function fit(engine) {
  const v = engine.vehicle, feet = v.y + v.h, lifts = new Set((engine.lifts || []).map(lift => lift.id));
  const floors = engine.platforms.filter(entry => !lifts.has(entry.id) && Math.abs(entry.y - feet) <= 16).map(entry => [entry.x, entry.x + entry.w]).sort((a, b) => a[0] - b[0]);
  let covered = 0, cursor = v.x;
  for (const [a, b] of floors) { const s = Math.max(a, cursor), e = Math.min(b, v.x + v.w); if (e > s) { covered += e - s; cursor = e; } }
  const drawn = { x: v.x, y: feet - M577_SCALE_V188.drawnHeight, w: v.w, h: M577_SCALE_V188.drawnHeight - 18 };
  return {
    covered: covered / v.w,
    solid: [...engine.doors, ...engine.walls].filter(entry => overlap(v, entry)).map(entry => entry.id),
    overhead: engine.platforms.filter(entry => !lifts.has(entry.id) && Math.abs(entry.y - feet) > 16 && overlap(drawn, entry)).map(entry => entry.id),
    cabins: (engine.lifts || []).filter(lift => lift.x < v.x + v.w && lift.x + lift.w > v.x).map(lift => lift.id),
    inBounds: v.x >= 0 && v.x + v.w <= engine.missionLevelBounds.width
  };
}

test('helpers: lanes skip lift cabins and low decks, parking keeps doors and ladders clear', () => {
  assert.deepEqual(M577_ORDINARY_IDS_V188, ['vehicle-001-m577-armored-personnel-carrier', 'vehicle-002-m577-command-apc']);
  assert.equal(isM577VehicleV188({ id: 'vehicle-009-ud-4l-cheyenne-dropship' }), false);
  const platforms = [{ id: 'a', x: 0, y: 600, w: 700, h: 20 }, { id: 'lift', x: 700, y: 600, w: 144, h: 24 }, { id: 'b', x: 844, y: 600, w: 900, h: 20 },
    { id: 'deck', x: 1500, y: 500, w: 300, h: 20 }];
  const lanes = m577LanesV188({ platforms, lifts: [{ id: 'lift' }], feetY: 600, width: 3000 });
  assert.deepEqual(lanes.map(lane => [lane.x0, lane.x1]), [[0, 700], [844, 1500]], 'the cabin never carries the hull; a deck under 140 px cuts the lane');
  const parked = m577ParkingV188({ lanes, doors: [{ x: 300, w: 44 }], ladders: [], avoid: [], feetY: 600, preferredCentre: 760 });
  assert.ok(parked.segment.x0 >= 844, 'the half lane split by the door is too short; the lane past the shaft is reached without a door');
  const ladder = m577ParkingV188({ lanes: [{ x0: 0, x1: 1400 }], ladders: [{ x: 300, w: 42, top: 400, bottom: 578 }], feetY: 600, preferredCentre: 300 });
  assert.ok(ladder.clear && (ladder.x >= 342 || ladder.x + 449 <= 279), 'slides off the ladder foot');
  assert.equal(m577ClampToLaneV188(-50, { x0: 0, x1: 1000 }), 8); assert.equal(m577ClampToLaneV188(900, { x0: 0, x1: 1000 }), 1000 - 8 - 449);
});

test('every ordinary level with a drivable M577: 449 × 112, parked on a floor that holds it, clear of doors, lift cabins and decks, on the extraction lane', async () => {
  const issues = [], seen = { levels: 0, templates: new Set() };
  for (const campaign of CAMPAIGNS) {
    for (const vehicle of [VEHICLES[0], VEHICLES[1]]) {
      let run; try { run = await level(campaign.id, { vehicle }); } catch { continue; } // special operations need their own builders
      const { engine } = run, v = engine.vehicle;
      if (!v?.active || !isM577VehicleV188(v) || engine.isAct5RaceV188?.() || engine.isApcConvoyV121?.()) { engine.stop?.(); continue; }
      seen.levels++; seen.templates.add(run.missionLevel.templateId);
      const f = fit(engine), snap = engine.m577ScaleSnapshotV188();
      const bad = [v.w !== M577_SCALE_V188.w && 'w', v.h !== M577_SCALE_V188.h && 'h', f.covered < .999 && `floor ${f.covered.toFixed(2)}`, f.solid.length && `solid ${f.solid}`,
        f.overhead.length && `overhead ${f.overhead}`, f.cabins.length && `cabin ${f.cabins}`, !f.inBounds && 'bounds', !snap.parked?.reachesExtraction && 'extraction lane',
        v.spriteHitbox?.id !== 'm577-scale-v188' && 'hitbox'].filter(Boolean);
      if (bad.length) issues.push(`${campaign.id}/${vehicle.id}: ${bad.join(', ')}`);
      engine.stop?.();
    }
  }
  assert.ok(seen.levels > 200, `levels checked: ${seen.levels}`);
  assert.deepEqual([...seen.templates].sort(), ['colony-multiroute', 'planet-exterior']);
  assert.deepEqual(issues, []);
});

test('colony street: parked past the security lift shaft, driven both ways it stops at the shaft and at the level floor end; side door, seat, roof turret', async () => {
  const { engine, events } = await level('pair-001-frontier');
  const v = engine.vehicle, p = engine.player, lift = engine.lifts.find(entry => entry.id === 'colony-security-lift-v130');
  const shaftEnd = engine.platforms.filter(entry => entry.id === 'colony-security-lift-v130:colony-security:right' || /colony-security:right/.test(entry.id)).map(entry => entry.x)[0];
  assert.ok(v.x >= lift.x + lift.w, 'the whole hull stands east of the lift shaft (it was parked over the shaft at 190 px)');
  assert.ok(v.x + v.w <= engine.objective.x + 200 && engine.m577LaneV188.x1 >= engine.objective.x, 'the extraction is on its lane');
  // Injection: the marine stands at the side door.
  Object.assign(p, { x: v.x + v.w * .47 - p.w / 2, y: v.y + v.h - p.h, vx: 0, vy: 0, grounded: true });
  assert.equal(engine.toggleVehicle(p), true); tick(engine, 1.2); assert.equal(p.inVehicle, true);
  engine.keys.add('KeyD'); tick(engine, 9); engine.keys.delete('KeyD'); tick(engine, .5);
  assert.equal(Math.round(v.x + v.w), Math.round(engine.m577LaneV188.x1 - 8), 'stops at the end of the street floor');
  engine.keys.add('KeyA'); tick(engine, 14); engine.keys.delete('KeyA'); tick(engine, .5);
  assert.equal(Math.round(v.x), Math.round(engine.m577LaneV188.x0 + 8), 'stops at the lift shaft edge instead of rolling over the 2.8 m cabin');
  assert.ok(v.x >= (shaftEnd ?? lift.x + lift.w) - 1);
  const seat = v.facing < 0 ? v.x + .16 * v.w : v.x + .84 * v.w;
  assert.ok(Math.abs(p.x + p.w / 2 - seat) < 1, 'the driver sits in the cab');
  const muzzle = engine.resolvePlayerMuzzleV124(p, { x: -1, y: 0 }), turretX = v.facing < 0 ? v.x + .72 * v.w : v.x + .28 * v.w;
  assert.ok(Math.abs(muzzle.pivotX - turretX) < 1 && muzzle.pivotY < v.y, 'the turret fires from the rear roof mount');
  assert.equal(engine.toggleVehicle(p), true); tick(engine, 1.2);
  const door = v.facing < 0 ? v.x + .53 * v.w : v.x + .47 * v.w;
  assert.equal(p.inVehicle, false); assert.ok(Math.abs(p.x + p.w / 2 - door) < 1 && Math.abs(p.y + p.h - (v.y + v.h)) < 1, 'steps out of the side door, on the floor');
  assert.ok(events.some(event => event.type === 'vehicle-access-complete'));
});

test('resume: the hull centre is restored (new records carry the width, legacy 190 px records keep their centre), no drift', async () => {
  const first = await level('pair-001-frontier'), v = first.engine.vehicle;
  const capture = first.engine.captureResumeState();
  assert.equal(capture.vehicle.w, 449, 'additive field');
  const resumed = (await level('pair-001-frontier', { resumeState: structuredClone(capture) })).engine;
  assert.equal(resumed.vehicle.x, v.x); assert.equal(resumed.vehicle.w, 449);
  const again = (await level('pair-001-frontier', { resumeState: structuredClone(resumed.captureResumeState()) })).engine;
  assert.equal(again.vehicle.x, v.x, 'no drift over two resumes');
  // A record written before this change: the 190 × 104 box at x, its centre at x + 95.
  const legacy = structuredClone(capture); delete legacy.vehicle.w; legacy.vehicle.x = 4000; legacy.vehicle.y = 636 - 104;
  const old = (await level('pair-001-frontier', { resumeState: legacy })).engine;
  assert.equal(old.lastResumeResult?.applied, true, 'the legacy record is still accepted');
  assert.equal(old.vehicle.x + old.vehicle.w / 2, 4095); assert.equal(old.vehicle.y + old.vehicle.h, 636);
});

test('UD-4L drop: the M577 to scale hangs under a hovering ship, is lowered clear of the ground, rolls inside its lane (never through the gate) and leaves with the ship', async () => {
  assert.deepEqual({ w: LEVEL_DROPSHIP_SCALE_V188.m577.w, h: LEVEL_DROPSHIP_SCALE_V188.m577.h }, { w: 449, h: 112 });
  const { engine } = await level('pair-001-frontier', { insertionHandoverV188: { mode: 'apc', placeType: 'atmosphere', dropshipId: 'ud4l', short: false } });
  assert.equal(engine.handoverConfigV188.mode, 'apc');
  const gate = engine.doors.find(door => door.id === 'colony-main-gate'), samples = [];
  for (let t = 0; t < 12 && engine.handoverV188; t += 1 / 30) {
    tick(engine, 1 / 30); const seq = engine.handoverV188; if (!seq?.apc || seq.t < seq.phases.find(entry => entry.id === 'disembark').start) continue;
    const belly = ud4lToWorldV188(seq.ship, UD4L_FRAME_V188.belly), hung = engine.m577HungFeetV188(seq.ship);
    const feet = seq.groundY + (hung - seq.groundY) * (1 - seq.apc.drop);
    samples.push({ phase: seq.phases.find(entry => seq.t < entry.end)?.id, lift: seq.ship.lift, x0: seq.apc.x, x1: seq.apc.x + seq.apc.w, feet, top: feet - 140, belly: belly.y, ground: seq.groundY, lane: seq.m577Lane, drop: seq.apc.drop });
  }
  assert.ok(samples.length > 20);
  for (const s of samples) {
    assert.ok(s.feet <= s.ground + .01, 'never below the ground');
    assert.ok(s.x0 >= s.lane.x0 && s.x1 <= s.lane.x1 && s.x1 <= gate.x, 'inside its lane, on the landing side of the main gate');
    if (s.phase !== 'liftoff') assert.ok(s.lift >= M577_DROP_V188.hover - .01, 'the ship hovers while the M577 is under it');
    if (s.drop === 0) assert.ok(s.top >= s.belly - M577_DROP_V188.recess - .01, 'hung under the belly, turret recessed into the bay');
  }
  assert.ok(samples.some(s => s.drop === 1 && s.feet === s.ground), 'lowered to the ground');
  assert.ok(samples.some(s => s.phase === 'disembark' && s.x0 > samples[0].x0 + 100), 'it rolls forward');
  assert.ok(samples.some(s => s.phase === 'liftoff' && s.drop === 0), 'hoisted again: it leaves with the ship');
  assert.equal(engine.vehicle.m577OrdinaryV188, true, 'the mission M577 stays parked in the level');
});

test('extraction aboard the M577: the hoist point stays over the hull on its lane, the ship hovers clear of the hull', async () => {
  const { engine, events } = await level('pair-001-frontier', { insertionHandoverV188: { mode: 'apc', placeType: 'atmosphere', dropshipId: 'ud4l', short: true } });
  engine.skipDropshipHandoverV188(); tick(engine, 2);
  const v = engine.vehicle, p = engine.player;
  Object.assign(p, { x: v.x + v.w * .47 - p.w / 2, y: v.y + v.h - p.h, vx: 0, vy: 0 }); // injection: at the side door
  engine.toggleVehicle(p); tick(engine, 1.2);
  engine.keys.add('KeyD'); tick(engine, 9); engine.keys.delete('KeyD'); tick(engine, .6);
  engine.missingObjectiveRequirement = () => ''; engine.missingExtractionRequirement = () => ''; // injection: objectives satisfied
  assert.equal(engine.completeMission(p), true);
  // The E keydown that confirmed the extraction reaches the skip listener too: it must not skip the boarding it started.
  globalThis.dispatchEvent(Object.assign(new Event('keydown'), { code: 'KeyE' }));
  assert.equal(engine.handoverV188?.blocking, true, 'the confirming E press is not a skip');
  let checked = 0;
  for (let i = 0; i < 80 && engine.handoverV188; i++) {
    tick(engine, .1); const seq = engine.handoverV188; if (!seq?.ship || !seq.ownVehicle) continue;
    const belly = ud4lToWorldV188(seq.ship, UD4L_FRAME_V188.belly);
    assert.ok(v.x >= engine.m577LaneV188.x0 && v.x + v.w <= engine.m577LaneV188.x1);
    assert.ok(Math.abs(belly.x - seq.hoistX) < 1);
    if (seq.phases.find(entry => seq.t < entry.end)?.id === 'board') { assert.ok(belly.y <= v.y + v.h - 140 + M577_DROP_V188.recess + .01, 'the belly clears the hull top'); checked++; }
  }
  assert.ok(checked > 3);
  assert.ok(events.some(event => event.type === 'extraction-boarding-complete-v188' && event.boardedBy === 'apc'));
});

test('C3: the M577 that brought the survivors, to scale on the quay floor, scenery behind the lane; the player M577 stays aboard', async () => {
  const { engine } = await level('colony-c3', { crew: [] });
  const p = engine.colonyLevelV188.places, x0 = p.m577 - COLONY_C3_M577_V188.w / 2, x1 = p.m577 + COLONY_C3_M577_V188.w / 2;
  assert.equal(COLONY_C3_M577_V188.w, 449); assert.equal(COLONY_C3_M577_V188.drivable, false);
  assert.equal(engine.vehicle.active, false, 'no drivable M577 in the colony streets');
  const floor = engine.platforms.filter(entry => Math.abs(entry.y - p.floorY) < 1).map(entry => [entry.x, entry.x + entry.w]).sort((a, b) => a[0] - b[0]);
  let covered = 0, cursor = x0; for (const [a, b] of floor) { const s = Math.max(a, cursor), e = Math.min(b, x1); if (e > s) { covered += e - s; cursor = e; } }
  assert.ok(covered >= 448, 'its whole length stands on the quay floor');
  assert.ok(engine.doors.every(door => door.x >= x1 || door.x + door.w <= x0), 'no door behind it');
  assert.ok(engine.ladders.every(ladder => ladder.x - 21 >= x1 || ladder.x + 42 <= x0), 'no ladder foot behind it');
  assert.ok(p.arrivals[0] >= x1 - 20 && p.arrivals.every(x => x > p.m577), 'the survivors stand at its rear door, towards the quay');
  const source = read('src/colony-mission-levels-v188.js');
  const wall = source.slice(source.indexOf('drawColonyWallArtV188(ctx) {'), source.indexOf('/** People and door-attached art'));
  assert.match(wall, /drawColonyM577V188\(ctx, p\.m577, p\.floorY, -1\)/, 'drawn with the back-wall art, before the dropship and the actors');
  assert.doesNotMatch(source.slice(source.indexOf('/** People and door-attached art')), /drawColonyM577V188/);
});

test('C3 preparation screen: Noor Okafor listed, marked unavailable at the infirmary with the reason (FR + EN)', () => {
  const crew = ['crew-01-x', COLONY_C3_NOOR_ID_V188, 'crew-02-y'];
  assert.deepEqual(colonyPreparationCrewV188('colony-c3', crew).deployed, ['crew-01-x', 'crew-02-y']);
  assert.deepEqual(colonyPreparationCrewV188('colony-c3', crew).unavailable.map(entry => entry.id), [COLONY_C3_NOOR_ID_V188]);
  assert.deepEqual(colonyPreparationCrewV188('colony-c1', crew).unavailable, [], 'only for C3');
  assert.deepEqual(colonyPreparationCrewV188('colony-c3', ['crew-01-x']).unavailable, [], 'listed only when she is in the squad');
  for (const text of [COLONY_C3_NOOR_PREP_V188.status, COLONY_C3_NOOR_PREP_V188.reason]) {
    assert.equal(EN_CATALOG_V185[text.fr], text.en);
    assert.ok(TANTALUS_I18N_DELTA_V188.exact.added.includes(text.fr), 'listed in the Tantalus delta');
  }
  assert.equal(EN_CATALOG_V185.MOTIF, 'REASON'); assert.equal(EN_CATALOG_V185.INDISPONIBLE, 'UNAVAILABLE');
  assert.match(COLONY_C3_NOOR_PREP_V188.status.fr, /À L’INFIRMERIE/); assert.match(COLONY_C3_NOOR_PREP_V188.status.en, /AT THE INFIRMARY/);
  const app = read('src/app.js');
  assert.match(app, /const preparationCrewV188 = colonyPreparationCrewV188\(campaign\.id, brief\.crewIds\);/);
  assert.match(app, /<span>ESCOUADE<\/span><b>\$\{soloOperationV121 \? 'UN OPÉRATEUR · SOLO' : escapeHtml\(crewNames\.join\(', '\) \|\| 'AUCUNE'\)\}<\/b>\$\{soloOperationV121 \? '' : unavailableCrewRowsV188\}/);
  assert.match(app, /<span>INDISPONIBLE<\/span><b class="crew-unavailable-v188"[^`]*<span>MOTIF<\/span>/);
});

test('Act V chase framing: with both trailers kept attached the Queen recoils, her whole figure stays framed at close range, the turret in view', async () => {
  const campaign = CAMPAIGNS.find(entry => entry.id === 'act5-depot-queen'), world = worldOf(campaign);
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS });
  const setup = { campaignId: campaign.id, replay: true, trailers: [{ id: 'colonists', people: 4, containers: 0 }, { id: 'freight', people: 0, containers: 2 }],
    apcColonists: 0, containers: 2, bridgeSeconds: 15, bridgeDecided: false };
  const { engine } = await fixture({ campaign, seed: 577, options: { world, missionLevel, act5RaceV188: setup, enemyCatalog: ENEMIES } });
  const pinTrailers = () => { for (const trailer of engine.act5RaceV188.trailers) trailer.integrity = 100; }; // injection (declared above)
  engine.engageAct5RaceV188(); engine.keys.add('KeyD'); engine.keys.add('KeyF');
  const close = [], states = new Set(); let recoil = null;
  for (let i = 0; i < 60 * 150 && engine.mission.state === 'active'; i++) {
    pinTrailers(); engine.update(1 / 60);
    const s = engine.act5RaceSnapshotV188(); if (!s?.queen) continue;
    states.add(s.queen.state);
    if (s.queen.state === 'recoil' && !recoil) recoil = s;
    if (s.queen.state !== 'dead' && s.queen.gap < 3) close.push(s.framing);
  }
  assert.ok(recoil && recoil.trailers.length === 2, 'the Queen is thrown back (recoil) with both trailers still attached');
  assert.ok(close.length > 30, 'she reaches close range');
  for (const f of close) {
    assert.ok(f.queenLeft >= -16, `tail on screen at close range (${f.queenLeft})`);
    assert.ok(f.turret <= 1280 - ACT5_CHASE_FRAMING_V188.turretMargin + 1, 'the roof turret stays in view');
    assert.ok(f.zoom >= ACT5_CHASE_FRAMING_V188.minZoom - 1e-6 && f.zoom <= 1);
  }
  assert.ok(close.some(f => f.zoom < 1), 'two trailers: the camera pulls back when panning is not enough');
  assert.equal(engine.act5RaceV188.trailers.length, 2);
});
