// Regression tests, owner decisions of 2026-11-15 and P2 leftovers.
// 1. QZ-17: insertion grace only (no 900 px move); other story chapters stay excluded.
// Fixture: scripts/engine-host-v188.mjs fixture({ campaign, seed, options, keepEnemies })
// (production GameEngine, browser APIs stubbed). Each mission level is built like the
// app builds it. Injections are listed where they are used.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { INSERTION_SAFE_ZONE_V188 } from '../src/insertion-safe-zone-v188.js';

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const campaign = id => { const found = CAMPAIGNS.find(entry => entry.id === id); assert.ok(found, id); return found; };
const worldOf = entry => WORLDS.find(world => world.id === entry.worldId) || WORLDS[0];
async function launch(id, { keepEnemies = true, variant = 0, extra = {} } = {}) {
  const entry = campaign(id), world = worldOf(entry);
  const missionLevel = buildMissionLevelV52({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant });
  return fixture({ campaign: entry, seed: missionLevel.levelSeed.seed, keepEnemies,
    options: { world, levelSeed: missionLevel.levelSeed, missionLevel, userCasteCampaignV88: !id.startsWith('special-'), ...extra } });
}
const centre = actor => ({ x: actor.x + actor.w / 2, y: actor.y + actor.h / 2 });
const distance = (a, b) => { const p = centre(a), q = centre(b); return Math.hypot(p.x - q.x, p.y - q.y); };
const awake = engine => engine.enemies.filter(enemy => enemy.alive && !enemy.dormant);
const hurt = (player, health, armor) => player.health < health || (player.armor ?? 0) < armor;

// ---------------------------------------------------------------- item 1
for (const variant of [0, 1, 2]) test(`QZ-17 v${variant}: patrols keep their authored positions; a still marine is unhurt for the 4 s grace`, async () => {
  const { engine } = await launch('special-narrative-qz17', { variant });
  const p = engine.player;
  assert.equal(engine.insertionSafeZoneV188, null, 'no placement guard');
  assert.ok(awake(engine).some(enemy => distance(enemy, p) < INSERTION_SAFE_ZONE_V188.radius), 'authored patrols near the hold');
  assert.ok(awake(engine).every(enemy => !enemy.insertionSafeZoneMovedV188));
  assert.equal(engine.insertionGraceV188?.remaining, INSERTION_SAFE_ZONE_V188.graceSeconds, 'the grace is armed');
  const health = p.health, armor = p.armor ?? 0, before = awake(engine).map(enemy => [enemy, distance(enemy, p)]);
  tick(engine, 3.9);
  assert.ok(!hurt(p, health, armor), `no damage during the grace (health ${p.health}/${health}, armor ${p.armor}/${armor})`);
  for (const [enemy, start] of before) if (enemy.alive) assert.ok(distance(enemy, p) >= start - 1, `${enemy.id} held its distance`);
});

test('QZ-17 grace: a shot fired inside the window does not land after it', async () => {
  // Variant 0 opens with a combat synthetic 382 px away; before the fix its
  // first projectile reached the marine at 1.02 s.
  const { engine } = await launch('special-narrative-qz17', { variant: 0 });
  const p = engine.player, health = p.health, armor = p.armor ?? 0;
  tick(engine, 4.2);
  assert.ok(!hurt(p, health, armor), `still unhurt just after the window (health ${p.health})`);
  assert.ok(engine.insertionGraceHeldV188 > 0, 'held attacks are counted');
});

test('QZ-18, APC, C-12 and black cocoon stay fully excluded (no move, no grace)', async () => {
  const { insertionGraceAppliesV188, insertionSafeZoneAppliesV188 } = await import('../src/insertion-safe-zone-v188.js');
  const missionLevel = {};
  for (const id of ['special-archive-relay', 'special-apc-convoy', 'special-c12-horde', 'special-black-cocoon']) {
    assert.equal(insertionGraceAppliesV188({ missionLevel, campaign: { id } }), false, id);
    assert.equal(insertionSafeZoneAppliesV188({ missionLevel, campaign: { id } }), false, id);
  }
  assert.equal(insertionGraceAppliesV188({ missionLevel, campaign: { id: 'special-narrative-qz17' } }), true);
  assert.equal(insertionSafeZoneAppliesV188({ missionLevel, campaign: { id: 'special-narrative-qz17' } }), false);
  assert.equal(insertionGraceAppliesV188({ missionLevel, campaign: { id: 'special-narrative-qz17' }, forgePlaytest: true }), false);
  assert.match(source('docs/narrative/CAMPAGNE_PRINCIPALE.md'), /QZ-17[^\n]*délai de grâce[^\n]*sans déplacement/);
});
