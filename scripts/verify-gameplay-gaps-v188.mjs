// V188 gameplay gaps (owner request "keep going on missing gameplay", 2026-11-15): depth holds
// (enemy projectiles, squad lanes and fire, per-lane covers, enemy lane spread, control help),
// franchise behaviours (acid blood, M56 tracking), Alpha/Bravo pairs (routes, fall recovery,
// stand-in, clean failure) and the colony gate collider. The defended dropship boarding is
// covered in verify-dropship-handover-v188.mjs.
// Fixture: scripts/engine-host-v188.mjs (production GameEngine, browser APIs stubbed). Each test
// fails on 250d81a; positions, health and orders are placed by injection where stated.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, host, prepare, tick } from './engine-host-v188.mjs';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS, CREW, ENEMIES, WEAPONS } from '../src/content.js';
import { buildMissionLevelV52, selectMissionTemplateV52 } from '../src/mission-levels-v52.js';
import { MISSION_ATTACK_BAND_V188, SQUAD_DEPTH_LANES_V188, ENEMY_DEPTH_SPREAD_V188 } from '../src/mission-depth-v188.js';
import { spansHoldDepthV188 } from '../src/depth-hold-sections-v188.js';
import { DEPTH_SHOT_BAND_V188 } from '../src/hub-depth-rooms-v188.js';
import { ACID_BLOOD_V188, SMARTGUN_TRACKING_V188 } from '../src/franchise-fidelity-v188.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';
import { FAILURE_REASON_LABELS_V188 } from '../src/mission-log-labels-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const worldOf = campaign => WORLDS.find(world => world.id === campaign.worldId) || WORLDS[0];
const FREIGHTER = CAMPAIGNS.find(campaign => !campaign.specialOperationId && selectMissionTemplateV52({ campaign, world: worldOf(campaign) }) === 'ship-interior-vertical');
const fit = enemy => !spansHoldDepthV188({ bigCastes: 'span' }, enemy) && enemy.h >= 70 && !['spitter', 'shooter'].includes(enemy.behavior)
  && !['ambusher', 'runner'].includes(enemy.behaviorProfileV119?.id);

async function hold({ keepEnemies = true, extra = {} } = {}) {
  const world = worldOf(FREIGHTER), missionLevel = buildMissionLevelV52({ campaign: FREIGHTER, world, levelSeeds: LEVEL_SEEDS });
  const run = await fixture({ campaign: FREIGHTER, seed: 7, options: { world, missionLevel, ...extra }, keepEnemies });
  const { engine } = run, section = engine.missionDepthSectionV188;
  engine.enemies = []; engine.insertionGraceV188 = null; // injection: the fight starts in the hold, no insertion grace
  const place = (actor, x, z = 0) => Object.assign(actor, { x, y: section.floorY - actor.h, vy: 0, vx: 0, grounded: true, depthZ: z });
  const awake = (x, z, pick = fit, extraFields = {}) => {
    const enemy = engine.spawnedEnemiesV188.find(entry => !engine.enemies.includes(entry) && pick(entry));
    Object.assign(enemy, { alive: true, dormant: false, x, y: section.floorY - enemy.h, vy: 0, vx: 0, health: 500, maxHealth: 500, depthZ: z,
      alert: true, rearEntryV130: null, attackClock: 99, rangedClock: 99, ...extraFields });
    enemy.spawnX = x; engine.initializeEnemyMissionNavigation?.(enemy); engine.enemies.push(enemy); return enemy;
  };
  return { ...run, section, p: engine.player, place, awake };
}
const projectile = (engine, from, vx, z) => {
  const shot = { x: from.x, y: from.y, sourceX: from.x, sourceY: from.y, w: 14, h: 10, vx, damage: 16, life: 2.2, acid: true, ownerId: 'qa-spitter', hit: false, depthZ: z };
  engine.hostileProjectiles.push(shot); return shot;
};

test('depth hold: an enemy acid projectile stops on a floor object in its lane, as the marines\' salvos do', async () => {
  const { engine, section, p, place, events } = await hold();
  const stack = section.containers.find(entry => entry.id === 'freighter-stack-east');
  place(p, stack.x - 120, -47); p.health = 100;
  // Injection: an acid spit launched east of the stack, in its lane, flying at Echo-9.
  const shot = projectile(engine, { x: stack.x + stack.w + 40, y: section.floorY - 50 }, -340, -47);
  for (let n = 0; n < 60 && engine.hostileProjectiles.includes(shot); n++) { tick(engine, 1 / 60); p.alive = true; }
  assert.equal(shot.hit, true, 'stopped');
  assert.ok(shot.x >= stack.x - 2, `stopped at the stack (x=${Math.round(shot.x)})`);
  assert.equal(p.health, 100, 'Echo-9, behind the stack, is not burned');
  assert.ok(events.some(event => event.type === 'depth-projectile-blocked-v188' && event.propId === 'freighter-stack-east'), 'presentation hook');
});

test('depth hold: a projectile spat in another lane flies past Echo-9 instead of vanishing on him', async () => {
  const { engine, section, p, place } = await hold();
  place(p, section.x0 + 300, -76); p.health = 100;
  const shot = projectile(engine, { x: section.x0 + 380, y: section.floorY - 50 }, -340, -45); // out of the band (> 24 from −76), clear of the wall-side cover lane
  tick(engine, .5);
  assert.equal(p.health, 100, 'out of the attack band');
  assert.ok(shot.x < p.x - 20 && !shot.hit, `still flying past him (x=${Math.round(shot.x)})`);
  const inBand = projectile(engine, { x: section.x0 + 380, y: section.floorY - 50 }, -340, -70);
  tick(engine, .5);
  assert.ok(inBand.hit && p.health < 100, 'in band it lands');
});

test('depth hold: squad marines take lanes around the leader and fire with the player\'s depth rules', async () => {
  const crew = CREW.slice(0, 3).map(member => ({ ...structuredClone(member), status: 'active', health: 100, fatigue: 0, stress: 0 }));
  const { engine, section, p, place, awake } = await hold({ extra: { crew } });
  engine.configureMissionSquad(); // injection: the fixture removed the squad; it is rebuilt from the crew
  const squad = engine.activeSquadActors();
  assert.ok(squad.length >= 2);
  place(p, section.x0 + 120, -10);
  squad.forEach((member, index) => place(member, section.x0 + 60 + index * 30, 0));
  tick(engine, 1);
  const lanes = squad.map(member => Math.round(member.depthZ));
  assert.ok(lanes.some(z => z < -2), `squad lanes ${lanes}`);
  assert.ok(new Set(lanes).size > 1, 'not all on one lane');
  for (const member of squad) assert.ok(member.depthZ <= 0 && member.depthZ >= -80);
  // Fire: a member in the wall lane facing an enemy far out of its band does not hit it.
  const member = squad[0];
  for (const other of squad.slice(1)) other.alive = false;
  place(member, section.x0 + 150, -4); member.fireClock = 0; member.profile = { ...member.profile, range: 620 };
  const far = awake(member.x + 100, -4 - DEPTH_SHOT_BAND_V188 - 40, entry => fit(entry)); // west of the wall-side cover
  far.speed = 1; const health = far.health;
  const owned = () => engine.bullets.filter(bullet => bullet.owner === member);
  const seen = [];
  // Injection: both lanes pinned for the first second (the AI would otherwise close the lane gap).
  const outOfBand = far.depthZ;
  for (let n = 0; n < 90; n++) { tick(engine, 1 / 60); place(member, section.x0 + 150, -4); far.depthZ = outOfBand; seen.push(...owned().filter(bullet => !seen.includes(bullet))); }
  assert.equal(far.health, health, 'an enemy out of its band is never hit');
  assert.ok(seen.every(bullet => bullet.depthZ === member.depthZ || Math.abs(bullet.depthZ - member.depthZ) < 1), 'its bullets carry its lane');
  far.depthZ = -10;
  for (let n = 0; n < 120; n++) { tick(engine, 1 / 60); place(member, section.x0 + 150, member.depthZ); seen.push(...owned().filter(bullet => !seen.includes(bullet))); }
  assert.ok(seen.length > 0 && seen.every(bullet => Number.isFinite(bullet.depthZ)), 'it fires depth-tagged bullets');
  assert.ok(far.health < health, 'in band it hits');
  // An enemy blow from far out of a squad marine's lane does not land.
  engine.depthAttackerV188 = far; far.depthZ = -76; member.depthZ = -4;
  assert.equal(engine.damageSquadMember(member, 20), 0); engine.depthAttackerV188 = null;
  assert.deepEqual(SQUAD_DEPTH_LANES_V188, [-14, 14, -26, 26]);
});

test('depth hold: the wall-side cover stops an enemy only in its own lane, whatever Echo-9\'s lane', async () => {
  const { engine, section, p, place, awake } = await hold();
  const cover = engine.covers.find(entry => section.coverIds.includes(entry.id));
  assert.ok(cover, 'the hold keeps a rail crates cover');
  place(p, cover.x - 140, 0); // Echo-9 at the wall: the cover stands in his lane
  const enemy = awake(cover.x + cover.w + 30, -50);
  for (let n = 0; n < 180 && enemy.x > cover.x - 20; n++) { tick(engine, 1 / 60); Object.assign(p, { alive: true, health: 100 }); }
  assert.ok(enemy.x < cover.x + cover.w, `an enemy in a front lane walks past the cover (x=${Math.round(enemy.x)}, cover ${cover.x}..${cover.x + cover.w})`);
});

test('depth hold: chasing enemies spread over lanes inside the band and only one closes in to melee', async () => {
  const { engine, section, p, place, awake } = await hold();
  place(p, section.x0 + 150, -40); p.health = 1e6; p.maxHealth = 1e6;
  const pack = [0, 1, 2].map(index => awake(section.x0 + 320 + index * 14, -40, fit, { speed: 120 }));
  for (let n = 0; n < 240; n++) { tick(engine, 1 / 60); Object.assign(p, { alive: true, health: 1e6 }); place(p, section.x0 + 150, -40); }
  const lanes = pack.map(enemy => Math.round(enemy.depthZ));
  assert.equal(new Set(lanes).size, 3, `three lanes (${lanes})`);
  for (const z of lanes) assert.ok(Math.abs(z - -40) <= MISSION_ATTACK_BAND_V188, 'all inside the attack band: still a threat');
  const close = pack.filter(enemy => Math.abs(enemy.x + enemy.w / 2 - (p.x + p.w / 2)) < ENEMY_DEPTH_SPREAD_V188.holdDistance - 1);
  assert.equal(close.length, ENEMY_DEPTH_SPREAD_V188.engaged, 'one in melee, the others hold their flanking lane');
  // A held enemy steps in when the engaged one dies.
  close[0].alive = false; close[0].health = 0;
  for (let n = 0; n < 240; n++) { tick(engine, 1 / 60); Object.assign(p, { alive: true, health: 1e6 }); place(p, section.x0 + 150, -40); }
  assert.ok(pack.filter(enemy => enemy.alive && Math.abs(enemy.x + enemy.w / 2 - (p.x + p.w / 2)) < ENEMY_DEPTH_SPREAD_V188.holdDistance - 1).length >= 1);
});

test('depth hold: the page control help follows the hold (W/S step in depth there), FR and EN', async () => {
  const { engine, section, p, place, events } = await hold({ keepEnemies: false });
  place(p, section.x0 - 300, 0); tick(engine, 1 / 60);
  place(p, section.x0 + 200, -20); tick(engine, 1 / 60);
  place(p, section.x0 - 300, 0); tick(engine, 1 / 60);
  assert.deepEqual(events.filter(event => event.type === 'depth-section-controls-v188').map(event => event.active), [true, false]);
  const app = read('src/app.js');
  for (const name of ['DEPTH_CONTROLS_TOOLBAR_FR_V188', 'DEPTH_CONTROLS_HELP_FR_V188']) {
    const french = app.match(new RegExp(`const ${name} = '([^']+)'`))?.[1];
    assert.ok(french && /W\/S/.test(french) && !/W\/S[^·]*VISER/.test(french), `${name}: W/S step in depth`);
    assert.ok(EN_CATALOG_V185[french], `${name}: reviewed English`);
  }
  assert.match(app, /event\.type === 'depth-section-controls-v188'\) return showDepthControlsHintV188/);
});

test('franchise: a xenomorph killed outside the Lethe operation leaves a short acid pool that burns, then dries', async () => {
  const { engine, section, p, place, awake } = await hold();
  engine.hazards = [];
  const enemy = awake(section.x0 + 300, -40);
  engine.defeatEnemy(enemy, p);
  const pool = engine.hazards.find(hazard => hazard.id === `acid-blood:${enemy.id}`);
  assert.ok(pool, 'acid pool laid'); assert.equal(pool.kind, 'acid'); assert.equal(pool.depthZ, -40, 'at the creature\'s depth in a hold');
  place(p, pool.x + pool.w / 2 - p.w / 2, -40); p.health = 100; tick(engine, .2);
  assert.ok(p.health < 100, 'it burns');
  tick(engine, ACID_BLOOD_V188.seconds + .5);
  assert.ok(!engine.hazards.some(hazard => hazard.id === pool.id), 'it dries');
});

test('franchise: the M56 smartgun bends the salvo onto a visible enemy inside its cone; the pulse rifle does not', async () => {
  for (const [name, tracked] of [['M56 Smartgun', true], ['M41A Pulse Rifle', false]]) {
    const { engine, section, p, place, awake } = await hold();
    engine.weapon = { ...engine.weapon, name, category: name.includes('Smart') ? 'smart' : 'ballistic' };
    place(p, section.x0 + 120, -8); p.facing = 1; p.weaponMode = 'rifle'; Object.assign(p, { ammo: 99, ammoReserve: 99, fireClock: 0, reloading: false });
    const enemy = awake(section.x0 + 420, -8); enemy.y -= 60; // injection: the target stands 60 px higher (on a crate), within 25°
    const count = engine.bullets.length; engine.fire(p);
    const bullet = engine.bullets[count];
    assert.ok(bullet, `${name} fired`);
    const angle = Math.atan2(bullet.vy || 0, bullet.vx);
    if (tracked) assert.ok(angle < -.05 && bullet.smartgunTrackV188 === enemy.id, `${name} tracks (angle ${angle.toFixed(3)})`);
    else assert.ok(!bullet.smartgunTrackV188 && Math.abs(angle) < .2, `${name} keeps its own aim (angle ${angle.toFixed(3)})`);
  }
  assert.equal(SMARTGUN_TRACKING_V188.reach, 700);
});

// —— Alpha/Bravo ——
async function alphaBravo() {
  const entry = CAMPAIGNS.find(campaign => campaign.id === 'special-alpha-bravo-doctrine'), world = worldOf(entry), browser = host();
  const missionLevel = buildMissionLevelV52({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  const crew = CREW.slice(0, 4).map(member => ({ ...structuredClone(member), status: 'active', health: 100, fatigue: 0, stress: 0 }));
  const events = [], engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) });
  engine.start({ world, campaign: entry, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew, seed: missionLevel.levelSeed.seed, levelSeed: missionLevel.levelSeed, missionLevel });
  await prepare(engine);
  engine.enemies = []; engine.hazards = [];
  const ai = engine.squadActors.filter(actor => actor !== engine.player && engine.alphaBravoTeamForActorV69(actor));
  return { engine, events, ai, p: engine.player };
}
const powerOn = engine => { // injection: power restored and the gates opened, as the generator does
  engine.powerNode.active = true; engine.mission.objectives.power = true;
  for (const door of engine.doors) if (door.lockedBy === 'power') { door.lockedBy = null; door.open = true; }
};

test('alpha/bravo: after the power, a pair sent to its station on the lower deck takes the ladders and lifts and completes its task', async () => {
  const { engine, ai, p } = await alphaBravo();
  powerOn(engine);
  engine.selectAlphaBravoFireteamV69('bravo'); assert.equal(engine.issueAlphaBravoOrderV69('focus'), true);
  const bravo = ai.filter(actor => engine.alphaBravoTeamForActorV69(actor) === 'bravo');
  let deepest = 0;
  for (let n = 0; n < 50 * 4; n++) { tick(engine, .25); Object.assign(p, { alive: true, health: 100 }); deepest = Math.max(deepest, ...bravo.map(actor => actor.y + actor.h)); }
  assert.ok(deepest < engine.missionLevelBounds.voidY, `never below the level (deepest feet ${Math.round(deepest)})`);
  assert.equal(engine.alphaBravoTaskStateV69('bravo-perimeter').complete, true, 'the perimeter task is complete');
});

test('alpha/bravo: a marine fallen out of the level comes back on a valid node', async () => {
  const { engine, ai, events } = await alphaBravo();
  const member = ai[0];
  tick(engine, .5);
  const safe = { x: member.x, y: member.y };
  Object.assign(member, { y: engine.missionLevelBounds.voidY + 40, vy: 400, grounded: false }); // injection: below the void line
  engine.updateSquadMovement(member, 0, engine.player, 1 / 60);
  assert.ok(member.y + member.h < engine.missionLevelBounds.voidY, 'back on the level');
  assert.ok(Math.abs(member.x - safe.x) < 300, 'near where it stood');
  assert.ok(events.some(event => event.type === 'fireteam-member-recovered-v188'));
});

test('alpha/bravo: the player stands in for a lost bravo marine; a pair that cannot be completed fails cleanly', async () => {
  const { engine, ai, p, events } = await alphaBravo();
  const bravo = ai.filter(actor => engine.alphaBravoTeamForActorV69(actor) === 'bravo');
  const station = engine.alphaBravoStationV69('bravo-perimeter');
  const task = engine.alphaBravoTaskStateV69('bravo-perimeter');
  bravo[0].alive = false; bravo[0].downed = false; // injection: one bravo marine killed
  for (const actor of [bravo[1], p]) Object.assign(actor, { x: station.x + 10, y: station.groundY - actor.h, vy: 0, grounded: true });
  Object.assign(task, { available: true, reservedBy: 'bravo' }); engine.alphaBravoV69.teams.bravo.order = 'hold';
  const ready = engine.alphaBravoTaskReadyActorsV69(task);
  assert.deepEqual(new Set(ready), new Set([bravo[1], p]), 'the player completes the pair');
  tick(engine, 6); for (const actor of [bravo[1], p]) Object.assign(actor, { x: station.x + 10, alive: true });
  assert.ok(task.progress > 0, 'the task progresses with the stand-in');
  assert.equal(engine.mission.state, 'active');
  bravo[1].alive = false; bravo[1].downed = false; // injection: the second bravo marine killed as well
  tick(engine, 1 / 60);
  if (!task.complete) {
    assert.equal(engine.mission.state, 'failed', 'no softlock: a clean failure');
    assert.ok(FAILURE_REASON_LABELS_V188['paire-alpha-bravo-perdue']);
    assert.ok(events.some(event => event.type === 'mission-failed'));
  }
});

test('colony gate: the closed gate stops the marine at the door he sees (x 934), not 165 px before it', async () => {
  const { engine, p } = await alphaBravo();
  const gate = engine.doors.find(door => door.id === 'colony-main-gate');
  const collider = engine.closedDoorColliders().find(box => box.visualRole === 'colony-gate');
  assert.deepEqual([Math.round(collider.x), Math.round(collider.w)], [gate.x, gate.w]);
  Object.assign(p, { x: gate.x - 200, y: gate.y + gate.h - p.h, vy: 0, grounded: true });
  engine.keys.add('KeyD'); tick(engine, 3); engine.keys.delete('KeyD');
  assert.ok(p.x + p.w >= gate.x - 2 && p.x + p.w <= gate.x + 2, `stops at the gate (right edge ${Math.round(p.x + p.w)})`);
  assert.ok(engine.getInteractionPrompt(p), 'and the gate is offered from there');
});

test('admission: new modules composed under the run options, shipped offline, suite registered and admitted', () => {
  const runtime = read('src/game-production-runtime.js');
  assert.match(runtime, /withRunOptionsRuntimeV188\((?:withVfxV188\()?withFranchiseFidelityV188\(withGameplayGapsV188\(withCombatFeelV188\(/);
  const sw = read('sw.js'); for (const file of ['/src/franchise-fidelity-v188.js', '/src/gameplay-gaps-v188.js']) assert.ok(sw.includes(`'${file}'`), file);
  const pkg = JSON.parse(read('package.json'));
  assert.ok(pkg.scripts['test:priorities:v188'].includes('scripts/verify-gameplay-gaps-v188.mjs'));
});
