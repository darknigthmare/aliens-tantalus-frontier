import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_HORDE_PROTOCOLS_V180 as historical, XENO_TRIALS_HORDE_BOSS_PROTOCOLS_V186 as bosses,
  XENO_TRIALS_HORDE_PROTOCOLS_V186 as all, getXenoTrialsHordeProtocolV180 as protocol } from '../src/xeno-trials-horde-v180.js';
import { createXenoTrialsBossProtocolsV186, getXenoTrialsHordeBossViewV186 as bossView } from '../src/xeno-trials-horde-bosses-v186.js';
import { getXenoTrialsFighterV96 as definition, getXenoTrialsArtV96 as art } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsSignatureV147 as signature, getXenoTrialsAttackV147 as spec, getXenoTrialsSpecialStyleV147 as style } from '../src/xeno-trials-signatures-v147.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step, getXenoTrialsSnapshotV96 as snapshot,
  restoreXenoTrialsHordeMatchV180 as restore, setXenoTrialsPausedV96 as pause, XENO_TRIALS_ATTACKS_V96 as base } from '../src/xeno-trials-engine-v96.js';

const tick = (match, count, player = {}, cpu = null) => { for (let i = 0; i < count; i++) step(match, 1 / 120, player, cpu); };
const make = id => create({ playerId: 'queen', seed: 186, introSeconds: 0, activityV119: { branch: 'horde', id } });

/** Boundary fixture: troop HP is set to zero only to prepare the actual final
 * wave. Director, spawn records, large actors and all tested boss attacks are
 * production code. These checks are not claimed as complete player runs. */
function finale(id) {
  const match = make(id), entry = protocol(id);
  for (let i = 0; i < 12000 && match.hordeV180.wave < entry.bossFinaleV186.wave; i++) {
    for (const enemy of match.fighters.slice(1)) enemy.hp = 0;
    tick(match, 1, {}, {});
  }
  assert.equal(match.hordeV180.wave, entry.bossFinaleV186.wave);
  assert.equal(match.result, null);
  return match;
}
function contact(match, boss) {
  const player = match.fighters[0]; player.x = boss.x - 400; player.facing = 1; boss.facing = -1;
  player.x += bounds(boss).left - bounds(player).right - 5;
}

test('forty boss finales append independently while the forty V180 protocols remain byte-equivalent', () => {
  const before = JSON.stringify(historical);
  assert.equal(historical.length, 40); assert.equal(bosses.length, 40); assert.equal(all.length, 80);
  assert.deepEqual(all.slice(0, 40), historical); assert.deepEqual(all.slice(40), bosses);
  assert.equal(new Set(all.map(entry => entry.id)).size, 80);
  assert.deepEqual(createXenoTrialsBossProtocolsV186(historical), bosses);
  assert.equal(JSON.stringify(historical), before);
  for (const entry of bosses) {
    const source = protocol(entry.sourceProtocolIdV180), boss = entry.bossFinaleV186, wave = entry.waves.at(-1);
    assert.match(entry.id, /^xth186-/); assert.ok(Object.isFrozen(entry) && Object.isFrozen(wave.enemySlotsV186));
    assert.deepEqual(entry.waves.slice(0, -1), source.waves);
    assert.equal(entry.totalEnemies, source.totalEnemies + wave.total);
    assert.ok(entry.reward + 80 + (entry.difficulty === 'hard' ? 50 : entry.difficulty === 'normal' ? 20 : 0) <= 1200);
    assert.equal(boss.wave, entry.waves.length); assert.ok(boss.hp >= 140 && boss.hp <= 310);
    assert.ok(definition(boss.fighterId)); assert.ok(art(boss.fighterId));
    assert.ok(entry.opponentIds.includes(boss.fighterId));
    assert.ok(wave.concurrent >= 3 && wave.concurrent <= 5); assert.equal(wave.total, wave.concurrent);
    assert.equal(wave.enemySlotsV186.filter(slot => slot.rank === 'boss').length, 1);
    assert.equal(wave.enemySlotsV186[0].fighterId, boss.fighterId);
    assert.equal(wave.enemySlotsV186[0].hp, boss.hp);
    assert.ok(wave.enemySlotsV186.slice(1).every(slot => slot.rank === 'troop' && slot.hp >= 15 && slot.hp <= 35));
    assert.equal(entry.canonExact, false);
  }
});

for (const entry of bosses) test(`${entry.id}: native mixed-health boss, geometry, bounded escorts and restore contract`, () => {
  const match = finale(entry.id), boss = match.fighters.find(fighter => fighter.enemyRankV186 === 'boss');
  assert.ok(boss); assert.equal(boss.id, entry.bossFinaleV186.fighterId);
  assert.equal(boss.hp, entry.bossFinaleV186.hp); assert.equal(boss.maxHpV180, boss.hp);
  assert.equal(boss.spawnSlotV186, 0); assert.equal(boss.bossIdV186, boss.id);
  assert.ok(match.fighters.length <= 6);
  assert.ok(match.fighters.slice(1).filter(fighter => fighter !== boss).every(fighter => fighter.hp >= 15 && fighter.hp <= 35));
  const ordinary = create({ playerId: 'queen', opponentId: boss.id }).fighters[1];
  assert.equal(bounds(boss).width, bounds(ordinary).width); assert.equal(bounds(boss).height, bounds(ordinary).height);
  assert.ok(match.events.some(event => event.type === 'horde-boss-incoming-v186'));
  assert.ok(match.events.some(event => event.type === 'horde-boss-spawn-v186' && event.fighterId === boss.id && event.hp === boss.hp));
  const view = bossView(entry, match.hordeV180, match.fighters);
  assert.equal(view.phase, 'active'); assert.equal(view.hp, boss.hp); assert.equal(view.defeated, false);
  pause(match, true); const saved = snapshot(match), restored = restore(saved);
  assert.ok(restored); assert.deepEqual(snapshot(restored), saved);
  const index = saved.fighters.findIndex(fighter => fighter.enemyRankV186 === 'boss');
  for (const fields of [{ maxHpV180: 35 }, { hp: entry.bossFinaleV186.hp + 1 }, { damageScaleV180: 9 },
    { spawnSlotV186: 1 }, { enemyRankV186: 'troop' }, { bossIdV186: 'runner' }, { instanceIdV180: 'horde-1' }]) {
    const corrupt = structuredClone(saved); Object.assign(corrupt.fighters[index], fields); assert.equal(restore(corrupt), null);
  }
  const metadata = structuredClone(saved); metadata.hordeV180.bossFinaleV186.hp = 35; assert.equal(restore(metadata), null);
  pause(match, false); pause(restored, false); tick(match, 60, {}, {}); tick(restored, 60, {}, {});
  assert.deepEqual(snapshot(restored), snapshot(match));
});

for (const id of ['xth186-incoming-1', 'xth186-acid-1', 'xth186-extraction-1', 'xth186-royal-4']) {
  test(`${id}: actual native special telegraph precedes collision/projectile emission`, () => {
    const match = finale(id), boss = match.fighters.find(fighter => fighter.enemyRankV186 === 'boss');
    for (const fighter of match.fighters.slice(1)) if (fighter !== boss) fighter.hp = 0;
    tick(match, 61, {}, {}); contact(match, boss);
    const special = spec(definition(boss.id), 'special', base.special), previousHp = match.fighters[0].hp;
    tick(match, 1, {}, { special: true });
    assert.equal(boss.stats.specials, 1); assert.equal(boss.attack.kind, 'special');
    const warning = match.events.find(event => event.type === 'horde-boss-telegraph-v186');
    assert.ok(warning); assert.equal(warning.startupSeconds, special.startup); assert.equal(warning.style, style(definition(boss.id)));
    assert.ok(boss.attack.age < special.startup); assert.equal(match.fighters[0].hp, previousHp);
    assert.equal(match.projectiles.length, 0);
    tick(match, Math.ceil(special.startup * 120) + 3, {}, { special: true });
    if (signature(definition(boss.id))?.style === 'leap') assert.ok(boss.y > 0);
    if (['aimed-acid', 'acid-cluster'].includes(style(definition(boss.id)))) assert.ok(match.projectiles.length > 0 || boss.stats.hits > 0);
    assert.equal(boss.stats.specials, 1, 'a held command cannot repeat the native special');
  });
}

test('the native boss brain uses real attacks and damages a guard or idle target', () => {
  const match = finale('xth186-acid-1'), boss = match.fighters.find(fighter => fighter.enemyRankV186 === 'boss');
  for (const fighter of match.fighters.slice(1)) if (fighter !== boss) fighter.hp = 0;
  tick(match, 61, {}, {}); contact(match, boss);
  tick(match, 120 * 12, { guard: true });
  assert.ok(boss.stats.hits > 0 || boss.stats.specials > 0);
  assert.ok(boss.stats.damage > 0); assert.ok(boss.aiV180.decisions > 0);
  assert.ok(match.fighters.length <= 9 && match.projectiles.length <= 64);
});

test('a boss requires repeated real hits; its death alone does not skip living escorts', () => {
  const match = finale('xth186-incoming-1'), boss = match.fighters.find(fighter => fighter.enemyRankV186 === 'boss');
  // Place escorts far away and hold their controls neutral. Only positioning is
  // prepared; player damage, attacks and the boss defeat use native simulation.
  for (const fighter of match.fighters.slice(1)) if (fighter !== boss) fighter.x = -700;
  contact(match, boss); let landed = 0;
  for (let i = 0; i < 120 * 40 && boss.hp > 0; i++) {
    const player = match.fighters[0], gap = bounds(boss).left - bounds(player).right;
    tick(match, 1, { right: gap > 4, heavy: i % 120 === 0 }, {});
    landed = player.stats.hits;
  }
  assert.equal(boss.hp, 0); assert.ok(landed > 1);
  assert.equal(match.result, null); assert.ok(match.fighters.length > 1);
  const view = bossView(protocol('xth186-incoming-1'), match.hordeV180, match.fighters);
  assert.equal(view.phase, 'defeated'); assert.equal(view.hp, 0); assert.equal(view.defeated, true);
  // Remaining escorts are a director boundary fixture, not extra claimed hits.
  for (const fighter of match.fighters.slice(1)) fighter.hp = 0;
  tick(match, 1, {}, {});
  assert.equal(match.result.winner, 'player'); assert.equal(match.result.reason, 'horde-cleared');
  assert.equal(match.result.hordeV180.bossFinaleV186.defeated, true);
  assert.equal(match.result.hordeV180.bossFinaleV186.maxHp, 140);
});

test('boss final waves remain deterministic at 30/60/120 Hz and freeze completely on pause', () => {
  const seed = snapshot(finale('xth186-blackout-5'));
  const snapshots = [30, 60, 120].map(rate => {
    const match = restore(seed); pause(match, false);
    for (let i = 0; i < rate * 4; i++) step(match, 1 / rate, { guard: true });
    pause(match, true); const before = snapshot(match); tick(match, 240, { special: true });
    assert.deepEqual(snapshot(match), before); return before;
  });
  assert.deepEqual(snapshots[0], snapshots[1]); assert.deepEqual(snapshots[1], snapshots[2]);
});

test('legal player commands clear a complete new protocol against native troop and boss CPUs without health or wave fixtures', () => {
  const match = make('xth186-incoming-1'); let previousWave = 1, healthAtIntermission = match.fighters[0].hp;
  let sawBoss = false, maxPopulation = 0;
  for (let i = 0; i < 120 * 360 && !match.result; i++) {
    const player = match.fighters[0], enemies = match.fighters.slice(1);
    const target = [...enemies].sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
    sawBoss ||= enemies.some(enemy => enemy.enemyRankV186 === 'boss');
    maxPopulation = Math.max(maxPopulation, enemies.length);
    if (match.hordeV180.phase === 'intermission') healthAtIntermission = player.hp;
    if (match.hordeV180.wave !== previousWave) {
      assert.ok(player.hp <= healthAtIntermission); previousWave = match.hordeV180.wave;
    }
    step(match, 1 / 120, { left: target?.x < player.x, right: target?.x > player.x,
      heavy: i % 180 === 0, light: i % 180 === 90 });
    assert.ok(match.fighters.length <= 9 && match.projectiles.length <= 64);
  }
  assert.ok(sawBoss && maxPopulation >= 3);
  assert.equal(match.result?.winner, 'player'); assert.equal(match.result.reason, 'horde-cleared');
  assert.equal(match.hordeV180.totalKills, 15); assert.equal(match.hordeV180.wavesCleared, 3);
  assert.equal(match.result.hordeV180.bossFinaleV186.defeated, true);
  assert.ok(match.fighters[0].hp > 0 && match.fighters[0].hp < definition('queen').hp);
  assert.equal(match.events.filter(event => event.type === 'match-end').length, 1);
});
