import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLDS } from '../src/content.js';
import { ensureAdvancedState, performDiplomacy } from '../src/advanced-systems.js';
import { advanceStrategicClock, createDefaultSave } from '../src/save.js';

const absoluteHours = (clock) => (clock.day - 1) * 24 + clock.hour;

test('la diplomatie engage du temps, applique une seule transaction et impose un cooldown persistant', () => {
  const save = createDefaultSave(1);
  ensureAdvancedState(save);
  const world = WORLDS.find((entry) => save.galaxy.unlockedWorldIds.includes(entry.id));
  save.hub.systems.supplies = 20;
  save.galaxy.resources.fuel = 5;
  const before = {
    time: absoluteHours(save.clock),
    credits: save.galaxy.resources.credits,
    supplies: save.hub.systems.supplies,
    fuel: save.galaxy.resources.fuel
  };

  const first = performDiplomacy(save, world, 'trade');
  assert.equal(absoluteHours(save.clock), before.time + 4);
  assert.equal(save.galaxy.resources.credits, before.credits + 220);
  assert.equal(save.hub.systems.supplies, before.supplies + 3);
  assert.equal(save.galaxy.resources.fuel, before.fuel + 2);
  assert.equal(first.availableAt, before.time + 16);

  const afterFirst = structuredClone({
    clock: save.clock,
    resources: save.galaxy.resources,
    supplies: save.hub.systems.supplies,
    state: save.galaxy.worldState[world.id]
  });
  assert.throws(() => performDiplomacy(save, world, 'trade'), /indisponible/i);
  assert.deepEqual({
    clock: save.clock,
    resources: save.galaxy.resources,
    supplies: save.hub.systems.supplies,
    state: save.galaxy.worldState[world.id]
  }, afterFirst);

  advanceStrategicClock(save, 12);
  const second = performDiplomacy(save, world, 'trade');
  assert.equal(second.hours, 4);
  assert.equal(absoluteHours(save.clock), before.time + 20);
});

test('une route verrouillée ou une opération active bloque la diplomatie au niveau domaine', () => {
  const save = createDefaultSave(2);
  ensureAdvancedState(save);
  const locked = WORLDS.find((world) => !save.galaxy.unlockedWorldIds.includes(world.id));
  assert.ok(locked);
  assert.throws(() => performDiplomacy(save, locked, 'aid'), /verrouillée/i);

  const unlocked = WORLDS.find((world) => save.galaxy.unlockedWorldIds.includes(world.id));
  save.strategy.currentOperation = { id: 'operation-active' };
  assert.throws(() => performDiplomacy(save, unlocked, 'aid'), /pendant une opération/i);
});
