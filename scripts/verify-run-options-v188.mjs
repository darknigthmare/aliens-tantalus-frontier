import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { createDefaultSave, migrateSave, beginOperation, resolveOperation } from '../src/save.js';
import { ORIGINS_V188, DEFAULT_ORIGIN_V188, normalizeOriginV188, normalizeCrewPermadeathV188, spareCrewMemberV188,
  normalizeCustomDifficultyV188, customRewardMultiplierV188, buildCustomDifficultyV188, CONNECTED_ORIGIN_ABILITIES_V188 } from '../src/run-options-v188.js';
import { buildEnemyRuntime } from '../src/game-runtime.js';
import { fixture, tick } from './engine-host-v188.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('20 origins from bible §2.4 with an unknown value falling back to origin-20', () => {
  assert.equal(ORIGINS_V188.length, 20);
  assert.deepEqual(ORIGINS_V188.map(origin => origin.id), Array.from({ length: 20 }, (_, i) => `origin-${String(i + 1).padStart(2, '0')}`));
  assert.ok(ORIGINS_V188.every(origin => origin.label.fr && origin.label.en && origin.ability.fr && origin.ability.en));
  assert.equal(ORIGINS_V188.at(-1).value, null, 'origin-20 has no ability');
  assert.equal(normalizeOriginV188('origin-07'), 'origin-07'); assert.equal(normalizeOriginV188('origin-99'), DEFAULT_ORIGIN_V188);
  assert.equal(CONNECTED_ORIGIN_ABILITIES_V188.length, 16);
});

test('permadeath can be switched off but never back on; older saves keep it on', () => {
  assert.equal(normalizeCrewPermadeathV188(true, false), false);
  assert.equal(normalizeCrewPermadeathV188(false, true), false);
  assert.equal(normalizeCrewPermadeathV188(undefined, true), true);
  assert.equal(createDefaultSave().settings.crewPermadeathV188, true);
  assert.equal(migrateSave({ schema: 52, settings: {} }).settings.crewPermadeathV188, true);
  assert.equal(migrateSave({ schema: 52, settings: { crewPermadeathV188: false } }).settings.crewPermadeathV188, false);
  assert.equal(migrateSave({ schema: 52, player: { originV188: 'origin-13' } }).player.originV188, 'origin-13');
  assert.equal(migrateSave({ schema: 52 }).player.originV188, 'origin-20');
});

function failedRun(permadeath) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.settings.crewPermadeathV188 = permadeath;
  const campaign = CAMPAIGNS.find(entry => entry.id === 'special-archive-relay');
  const world = WORLDS.find(entry => entry.id === campaign.worldId) || WORLDS[0];
  const { operation } = beginOperation(save, campaign, world);
  const lead = save.crew.find(member => operation.crewIds.includes(member.id) && member.status !== 'deceased');
  lead.health = 5;
  assert.equal(resolveOperation(save, { success: false, reason: 'failure' }).ok, true);
  return { save, lead: save.crew.find(member => member.id === lead.id) };
}

test('the real resolveOperation kills the lead with permadeath and spares it without', () => {
  const on = failedRun(true);
  assert.equal(on.lead.status, 'deceased'); assert.ok(on.save.memorial.some(entry => entry.crewId === on.lead.id));
  const off = failedRun(false);
  assert.equal(off.lead.status, 'injured'); assert.ok(off.lead.health >= 1);
  assert.equal(off.save.memorial.some(entry => entry.crewId === off.lead.id), false);
  const wound = off.lead.injuries.at(-1);
  assert.equal(wound.type, 'grave-wound'); assert.equal(wound.convalescenceUntilDay, off.save.clock.day + 3);
  assert.equal(spareCrewMemberV188({ settings: { crewPermadeathV188: true } }, { health: 0 }), false);
});

test('custom difficulty is bounded, its reward follows the challenge and it scales enemies', () => {
  assert.deepEqual(normalizeCustomDifficultyV188({ enemyHealth: 9, enemyDamage: 1.5, enemySpeed: 'x' }),
    { enemyHealth: 1, enemyDamage: 1.5, enemySpeed: 1, spawnMultiplier: 1, ammoFound: 1, alertFrequency: 1 });
  assert.equal(customRewardMultiplierV188({}), 1);
  assert.ok(customRewardMultiplierV188({ enemyHealth: 2, enemyDamage: 2, ammoFound: .5 }) > 1);
  assert.ok(customRewardMultiplierV188({ enemyHealth: .5, enemyDamage: .5, ammoFound: 2 }) < 1);
  assert.equal(buildCustomDifficultyV188({ enemyHealth: 2 }).id, 'custom');
  assert.deepEqual(migrateSave({ schema: 52, settings: { customDifficultyV188: { enemyHealth: 1.5 } } }).settings.customDifficultyV188.enemyHealth, 1.5);
});

test('production engine: custom tuning applies to enemies, ammo drops and origin abilities', async () => {
  const strong = await fixture({ options: { difficulty: 'custom', customDifficultyV188: { enemyHealth: 2, ammoFound: 2 }, originV188: 'origin-18' } });
  assert.equal(strong.engine.difficultyRuntime.id, 'custom'); assert.equal(strong.engine.difficultyRuntime.enemyHealth, 2);
  const standardHp = buildEnemyRuntime({ health: 100 }, 'standard').health, customHp = buildEnemyRuntime({ health: 100 }, 'custom').health;
  assert.equal(customHp, standardHp * 2);
  const enemy = { id: 'drop-test', x: 900, y: 500, w: 40, h: 60, alive: true, health: 1, reward: 10, isBoss: false };
  strong.engine.random = () => 0; strong.engine.enemies = [enemy]; strong.engine.defeatEnemy(enemy);
  assert.equal(strong.engine.drops.find(drop => drop.id === 'ammo-drop-test').amount, 16, 'ammo found ×2');
  assert.equal(strong.engine.originV188.id, 'origin-18');
  strong.engine.stop();
  const relay = await fixture({ campaign: { ...CAMPAIGNS[0], registerV188: 'horror' }, options: { originV188: 'origin-13' } });
  const { engine, events } = relay;
  engine.nextFalseEchoAtV188 = engine.mission.elapsed + .05; engine.lastRealContactAtV188 = -100;
  tick(engine, .2);
  assert.ok(engine.falseEchoV188?.revealed, 'origin-13 identifies the false echo at once');
  assert.ok(events.some(event => event.type === 'false-echo-revealed-v188' && event.origin === 'origin-13'));
  engine.stop();
});

test('creator, settings and in-mission casualty use the run options', () => {
  const creator = read('src/player-creator-ui-v84.js'), app = read('src/app.js'), html = read('index.html');
  assert.match(creator, /name="originV188"/); assert.match(creator, /name="crewPermadeathV188"/);
  assert.match(app, /candidate\.player\.originV188 = normalizeOriginV188\(choices\.originV188\)/);
  assert.match(app, /spareCrewMemberV188\(saveSystem\.data, lost/);
  assert.match(html, /<option value="custom">À la carte<\/option>/);
  for (const key of ['enemyHealth', 'enemyDamage', 'enemySpeed', 'spawnMultiplier', 'ammoFound', 'alertFrequency'])
    assert.match(html, new RegExp(`id="setting-custom-${key}-v188"`));
  assert.match(html, /id="setting-permadeath-v188"/);
});
