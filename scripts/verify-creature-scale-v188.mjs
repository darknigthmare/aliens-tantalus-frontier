// V188 — creature scale on the franchise-documented sizes (owner decision 2026-11-16, bible §56.4).
// Production GameEngine (engine-host-v188), shipped bitmaps measured through their recorded alpha
// bounds; every enemy profile of ENEMIES is drawn through the real mission drawEnemy chain.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, prepare } from './engine-host-v188.mjs';
import { ENEMIES } from '../src/content-core-v50.js';
import { ENEMY_DISPLAY_STATURES_V110 } from '../src/enemy-display-scale-v110.js';
import { CREATURE_SCALE_V188, ENEMY_DISPLAY_STATURES_V188, CREATURE_SCALE_STATES_V188, creatureTargetV188,
  createDrawMeasureContextV188, measuredSpriteV188, isQueenStatureKeyV188, isHumanStatureKeyV188 } from '../src/creature-scale-v188.js';
import { unfitForHoldV188 } from '../src/qz17-level-dressing-v188.js';
import { isLargeMissionActorV72 } from '../src/mission-large-actor-placement-v72.js';
import { getCatalogEntryV62 } from '../src/catalog-runtime-v62.js';
import { getCatalogComparisonLayoutV72, getCatalogMarineReferenceV72 } from '../src/catalog-scale-v72.js';
import { ACID_BLOOD_V188 } from '../src/franchise-fidelity-v188.js';

const TOL = CREATURE_SCALE_V188.tolerance;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const byId = new Map(ENEMIES.map(enemy => [enemy.id, enemy]));
const near = (actual, expected, message, tolerance = TOL) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected} (±${tolerance})`);

function drawn(engine, enemy) {
  const ctx = createDrawMeasureContextV188(); engine.drawEnemy(ctx, enemy); return measuredSpriteV188(ctx.draws);
}
/** A fresh enemy on the floor; its legacy drawing, then its V188 body once its bitmap is loaded. */
async function scaled(engine, source, { floor = 868, x = 900 } = {}) {
  const enemy = engine.createEnemy(source, 0, x, floor, {}); enemy.alive = true;
  engine.enemies = [enemy];
  let legacy = null;
  for (let attempt = 0; attempt < 40 && !legacy; attempt++) {
    legacy = engine.measureCreatureDrawV188(enemy, 'idle', 1);
    if (!legacy) { drawn(engine, enemy); if (attempt % 4 === 3) await prepare(engine); else await sleep(5); }
  }
  const legacyBody = { w: enemy.w, h: enemy.h };
  for (let attempt = 0; attempt < 40 && !enemy.creatureScaleV188; attempt++) { enemy.creatureScaleRetryV188 = 0; engine.normalizeCreatureV188(enemy); if (!enemy.creatureScaleV188) await sleep(5); }
  assert.ok(legacy, `${source.id}: a measured legacy drawing`); assert.ok(enemy.creatureScaleV188, `${source.id}: scaled`);
  // Let every atlas finish loading, then confirm the profile (a first draw can use a fallback image).
  for (let round = 0; round < 3; round++) { await prepare(engine); engine.settleCreatureScaleV188(1); }
  const s = enemy.creatureScaleV188;
  if (!s.exempt) legacy = engine.measureCreatureDrawV188({ ...enemy, w: s.legacyW, h: s.legacyH, x: enemy.x + enemy.w / 2 - s.legacyW / 2, y: enemy.y + enemy.h - s.legacyH }, 'idle', 1);
  return { enemy, legacy, legacyBody, target: creatureTargetV188(enemy) };
}

test('the scale: 1 m ≈ 51 px, marine 92 px, warrior 118 px (2.3 m), queen 245 px (4.8 m); other castes keep their ratio to the warrior', () => {
  const { pixelsPerMetre, marine, warrior, queen, creatureFactor, humanFactor } = CREATURE_SCALE_V188;
  near(marine.metres * pixelsPerMetre, marine.height, 'marine', 1);
  near(warrior.metres * pixelsPerMetre, warrior.height, 'warrior', 1);
  near(queen.metres * pixelsPerMetre, queen.height, 'queen', 1);
  assert.equal(ENEMY_DISPLAY_STATURES_V188['enemy-005-warrior'], 118);
  assert.equal(ENEMY_DISPLAY_STATURES_V188['enemy-008-queen'], 245);
  assert.deepEqual(Object.keys(ENEMY_DISPLAY_STATURES_V188), Object.keys(ENEMY_DISPLAY_STATURES_V110), 'same keys: ids unchanged');
  for (const [key, legacy] of Object.entries(ENEMY_DISPLAY_STATURES_V110)) {
    const now = ENEMY_DISPLAY_STATURES_V188[key];
    if (isQueenStatureKeyV188(key)) assert.equal(now, 245, key);
    else if (isHumanStatureKeyV188(key)) near(now, legacy * humanFactor, key, .5);
    else { near(now, legacy * creatureFactor, key, .5); near(now / 118, legacy / 156, `${key} ratio to the warrior`, .005); }
  }
  assert.equal(isQueenStatureKeyV188('castes-film_queen_chestburster_alien3_1992'), false, 'a queen chestburster is not a queen');
});

test('every enemy profile: drawn height and hitbox within ±4 px of the V188 target; humans and synthetics unchanged', { timeout: 600000 }, async () => {
  const { engine } = await fixture();
  const misses = [], counts = { declared: 0, queen: 0, undeclared: 0, human: 0 };
  for (const source of ENEMIES) {
    const { enemy, legacy, legacyBody, target } = await scaled(engine, source);
    counts[target.kind]++;
    const now = drawn(engine, enemy);
    if (target.kind === 'human') {
      if (Math.abs(now.height - legacy.height) > .5 || enemy.w !== legacyBody.w || enemy.h !== legacyBody.h) misses.push(`${source.id}: human changed`);
      continue;
    }
    const expected = target.height ?? legacy.height * CREATURE_SCALE_V188.creatureFactor;
    if (Math.abs(now.height - expected) > TOL) misses.push(`${source.id}: drawn ${now.height.toFixed(1)} vs ${expected.toFixed(1)}`);
    if (Math.abs(enemy.h - expected) > TOL) misses.push(`${source.id}: hitbox h ${enemy.h} vs ${expected.toFixed(1)}`);
    // Only the large-actor rule (queens: at least 300 px wide) may exceed a narrow pose.
    if (enemy.w > now.width + TOL && !(isLargeMissionActorV72(enemy) && enemy.w === 300) && enemy.w > Math.min(legacyBody.w, Math.round(enemy.h * .3)))
      misses.push(`${source.id}: hitbox w ${enemy.w} wider than drawn ${now.width.toFixed(1)}`);
    if (Math.abs(now.bottom - (enemy.y + enemy.h)) > TOL && source.id.indexOf('ceto') < 0) misses.push(`${source.id}: feet ${now.bottom.toFixed(1)} vs ${enemy.y + enemy.h}`);
    if (enemy.spriteHitbox) misses.push(`${source.id}: a sprite-cell collision box survives`);
  }
  assert.deepEqual(misses, []);
  assert.equal(counts.declared + counts.queen + counts.undeclared + counts.human, ENEMIES.length);
  // Inventory (bible §56.4): 20 queens (two queen lines × 10, juveniles excluded), 200 declared castes,
  // 263 undeclared organisms, 88 humans and synthetics.
  assert.deepEqual(counts, { declared: 200, queen: 20, undeclared: 263, human: 88 });
});

test('queens versus warriors: 245 against 118 px (4.8 m / 2.3 m), taller than every other caste; the marine is shorter than a warrior', async () => {
  const { engine } = await fixture();
  const warrior = await scaled(engine, byId.get('enemy-005-warrior')), queen = await scaled(engine, byId.get('enemy-008-queen'));
  const ripper = await scaled(engine, byId.get('enemy-024-ripper-queen'));
  near(drawn(engine, warrior.enemy).height, 118, 'warrior drawn'); near(warrior.enemy.h, 118, 'warrior hitbox');
  for (const royal of [queen, ripper]) { near(drawn(engine, royal.enemy).height, 245, `${royal.enemy.id} drawn`); near(royal.enemy.h, 245, `${royal.enemy.id} hitbox`); }
  near(queen.enemy.h / warrior.enemy.h, 4.8 / 2.3, 'queen / warrior', .05);
  assert.ok(engine.player.h < warrior.enemy.h, 'marine 92 < warrior');
  const tallestOther = Math.max(...Object.entries(ENEMY_DISPLAY_STATURES_V188).filter(([key]) => !isQueenStatureKeyV188(key)).map(([, h]) => h));
  assert.ok(tallestOther < 245, `every other caste under the queen (${tallestOther})`);
  // Previously 202–340 px drawn (queen sheet / Acid-Blooded pose), 336×268 hitbox.
  assert.equal(queen.legacyBody.w, 336); assert.ok(queen.enemy.w >= 300 && queen.enemy.w < 336);
});

test('doors, vents and rear entrances: warriors pass the 132 px bulkheads, only small castes fit the 64 px ducts, the queen stays a large actor', async () => {
  const { engine } = await fixture({ keepEnemies: true });
  const door = Math.min(...engine.doors.map(entry => entry.h)), duct = Math.min(...(engine.vents || []).map(entry => entry.h));
  assert.equal(door, 132); assert.equal(duct, 64);
  const size = async id => (await scaled(engine, byId.get(id))).enemy;
  for (const id of ['enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner', 'enemy-010-spitter', 'enemy-020-k-series-yellow-xenomorph']) {
    const enemy = await size(id); assert.ok(enemy.h <= door, `${id} ${enemy.h} under a ${door} px bulkhead`);
  }
  assert.ok((await size('enemy-005-warrior')).h > duct, 'a standing warrior does not fit a duct');
  for (const id of ['enemy-002-facehugger', 'enemy-003-chestburster', 'enemy-006-runner']) {
    const enemy = await size(id); assert.ok(enemy.h <= duct && enemy.w <= 84, `${id} ${enemy.w}×${enemy.h} fits a 84×64 duct`);
  }
  const queen = await size('enemy-008-queen');
  assert.ok(queen.h > door && isLargeMissionActorV72(queen) && unfitForHoldV188(queen), 'queen: large actor, unfit for the holds');
  // Rear entrances (enemy-tactics-v130) admit the rescaled warrior where they admitted the legacy one.
  const warrior = await size('enemy-005-warrior'), legacy = { ...warrior, w: warrior.creatureScaleV188.legacyW, h: warrior.creatureScaleV188.legacyH };
  const entrances = engine.rearEntrancesForTacticsV130();
  const admitted = body => entrances.filter(entrance => engine.rearThresholdValidV130(body, entrance)).map(entrance => entrance.id);
  assert.deepEqual(admitted(warrior), admitted(legacy));
  assert.ok(admitted(warrior).length > 0);
  // The rear opening is 116 px: the 118 px warrior is within the ±4 px tolerance of its frame.
  assert.ok(warrior.h <= Math.min(...entrances.map(entrance => entrance.h)) + TOL);
});

test('size rules keep their verdict: depth-hold big castes (> 120 px wide) and large actors (≥ 300 × 200)', { timeout: 600000 }, async () => {
  const { engine } = await fixture();
  const changed = [];
  for (const source of ENEMIES) {
    const { enemy } = await scaled(engine, source), s = enemy.creatureScaleV188;
    const legacy = { ...enemy, w: s.legacyW, h: s.legacyH };
    if (unfitForHoldV188(legacy) !== unfitForHoldV188(enemy)) changed.push(`${source.id}: hold`);
    if (isLargeMissionActorV72(legacy) !== isLargeMissionActorV72(enemy)) changed.push(`${source.id}: large actor`);
  }
  // Juvenile queens have no declared stature: they keep their drawn proportion (≈ 153 / 151 px), so
  // they fall under the 200 px large-actor height. They stay unfit for the holds (id rule).
  assert.deepEqual(changed, ['enemy-424-juvenile-queen: large actor', 'enemy-440-juvenile-ripper-queen: large actor']);
});

test('no pose grows: alert, attack and hurt poses never stand taller than the idle target', async () => {
  const { engine } = await fixture();
  const grown = [];
  for (const source of ENEMIES.filter(enemy => enemy.modifier === 'Standard')) {
    const { enemy, target } = await scaled(engine, source); if (target.kind === 'human') continue;
    const height = enemy.creatureScaleV188.target;
    for (const state of CREATURE_SCALE_STATES_V188) {
      const flags = { idle: {}, alert: { alert: true }, attack: { alert: true, attacking: true, attackAnimationClock: .2 }, hurt: { alert: true, hurtClock: .2 } }[state];
      const actor = Object.assign(Object.create(null), enemy, flags);
      const sprite = drawn(engine, actor);
      if (sprite && sprite.height > height + TOL) grown.push(`${source.id} ${state}: ${sprite.height.toFixed(1)} > ${height}`);
    }
  }
  assert.deepEqual(grown, []);
});

test('facehugger and chestburster hitboxes no longer exceed their sprite', async () => {
  const { engine } = await fixture();
  for (const id of ['enemy-002-facehugger', 'enemy-003-chestburster']) {
    const { enemy, legacy, legacyBody } = await scaled(engine, byId.get(id)), sprite = drawn(engine, enemy);
    assert.ok(legacyBody.h > legacy.height + 2, `${id}: the legacy box (${legacyBody.w}×${legacyBody.h}) was taller than its ${legacy.height.toFixed(1)} px sprite`);
    assert.ok(enemy.h <= sprite.height + 1 && enemy.w <= sprite.width, `${id}: ${enemy.w}×${enemy.h} within ${sprite.width.toFixed(1)}×${sprite.height.toFixed(1)}`);
  }
});

test('catalogue comparison: creatures at their V188 stature beside a 92 px marine', () => {
  const marine = getCatalogComparisonLayoutV72([getCatalogMarineReferenceV72()], ['marine-reference']).sizes[0];
  near(marine.worldVisibleHeight, 92, 'marine reference', 1);
  for (const id of ['enemy-002-facehugger', 'enemy-005-warrior', 'enemy-006-runner', 'enemy-007-praetorian', 'enemy-008-queen', 'enemy-009-crusher', 'enemy-020-k-series-yellow-xenomorph']) {
    const size = getCatalogComparisonLayoutV72([getCatalogEntryV62(id).visual], [id]).sizes[0];
    near(size.worldVisibleHeight, ENEMY_DISPLAY_STATURES_V188[id], `${id} catalogue`, 1);
  }
});

/** Scripted horizontal fire from standing, crouching and 12 heights of a jump arc. */
async function hitRates(scaledOn, strength) {
  const { engine } = await fixture();
  engine.accessibilityRuntime = { ...(engine.accessibilityRuntime || {}), aimAssistStrength: strength };
  if (!scaledOn) engine.creatureScaleEnabledV188 = () => false;
  const player = engine.player, floor = player.y + player.h, result = {};
  for (const id of ['enemy-005-warrior', 'enemy-008-queen']) for (const range of [200, 400, 600]) {
    let hits = 0, shots = 0;
    for (const lift of [0, 'crouch', ...Array.from({ length: 12 }, (_, i) => (i + 1) * 140 / 12)]) {
      const enemy = engine.createEnemy(byId.get(id), 0, 0, floor, {}); Object.assign(enemy, { alive: true, health: 1e6, maxHealth: 1e6, armor: 0 });
      engine.enemies = [enemy];
      if (scaledOn) for (let i = 0; i < 40 && !enemy.creatureScaleV188; i++) { enemy.creatureScaleRetryV188 = 0; engine.normalizeCreatureV188(enemy); drawn(engine, enemy); await sleep(2); }
      Object.assign(enemy, { x: player.x + player.w + range, y: floor - enemy.h, facing: -1 });
      Object.assign(player, { facing: 1, crouching: lift === 'crouch', y: floor - player.h - (Number(lift) || 0), grounded: !Number(lift), fireClock: 0, reloading: false, ammo: 99, pointerAimV83: null, aimingV124: false });
      engine.keys?.clear?.(); engine.bullets = [];
      engine.fire(player); shots++;
      for (let t = 0; t < 1.4; t += 1 / 60) engine.updateBullets(1 / 60);
      if (enemy.health < 1e6) hits++;
    }
    result[`${id}@${range}`] = hits / shots;
  }
  return result;
}
test('hit rates at 200/400/600 px: the queen stays at 100 %; with aim assist the warrior loses at most one shot in 14 (legacy-silhouette assist [PROPOSÉ])', { timeout: 120000 }, async () => {
  const before = await hitRates(false, .62), after = await hitRates(true, .62);
  const beforeOff = await hitRates(false, 0), afterOff = await hitRates(true, 0);
  console.log(JSON.stringify({ assistStandard: { before, after }, assistOff: { before: beforeOff, after: afterOff } }));
  for (const key of Object.keys(before)) {
    if (key.startsWith('enemy-008')) { assert.equal(after[key], 1, key); assert.equal(afterOff[key], 1, key); }
    assert.ok(after[key] >= before[key] - 1 / 14 - 1e-9, `${key}: ${after[key]} vs ${before[key]}`);
  }
  // Without assistance the smaller warrior is geometrically harder to hit from a jump: measured, not hidden.
  assert.ok(afterOff['enemy-005-warrior@200'] < beforeOff['enemy-005-warrior@200']);
});

test('a resumed legacy save puts the rescaled creature back on its floor; ids and save fields are unchanged', async () => {
  const { engine } = await fixture();
  const { enemy } = await scaled(engine, byId.get('enemy-005-warrior'));
  engine.enemies = [enemy];
  const snapshot = engine.captureResumeState(), saved = snapshot.enemies.find(entry => entry.id === enemy.id);
  assert.deepEqual(Object.keys(saved).filter(key => /scale|V188/i.test(key)), [], 'no new save field');
  // A pre-V188 save: top-left of the 136 px body standing on the 868 floor.
  const legacyTop = 868 - enemy.creatureScaleV188.legacyH;
  engine.applyResumeState({ ...snapshot, enemies: [{ ...saved, y: legacyTop }] });
  near(enemy.y + enemy.h, 868, 'feet back on the floor', .5);
  engine.applyResumeState(snapshot); near(enemy.y + enemy.h, saved.y + enemy.h, 'a V188 save keeps its position', .5);
});

test('dependants follow the body: acid pool width, tracker point (feet centre) and melee box', async () => {
  const { engine } = await fixture();
  const { enemy, legacyBody } = await scaled(engine, byId.get('enemy-008-queen'));
  const pool = Math.max(ACID_BLOOD_V188.minWidth, enemy.w * ACID_BLOOD_V188.widthScale);
  assert.ok(pool < legacyBody.w * ACID_BLOOD_V188.widthScale && pool >= enemy.w * .8 - 1e-9, 'the acid pool follows the drawn body');
  const s = enemy.creatureScaleV188;
  near(enemy.x + enemy.w / 2, 900 + s.legacyW / 2, 'horizontal centre kept (tracker blip and melee anchor)', .5);
  near(enemy.y + enemy.h, 868, 'feet kept', .5);
});

test('composition: the creature scale sits under the caste behaviours (ceiling flip, depth shift)', () => {
  const runtime = readFileSync(new URL('../src/game-production-runtime.js', import.meta.url), 'utf8');
  assert.match(runtime, /withCasteBehaviorsV188\(withCreatureScaleV188\(withInsertionSafeZoneV188\(/);
  const source = readFileSync(new URL('../src/creature-scale-v188.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /1:1 (fidelity|fidèle)|canonVerified: true/);
});
