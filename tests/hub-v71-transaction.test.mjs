import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { HUB_ANNEX_SYSTEM_EFFECTS_V71 } from '../src/hub-annex-services-v71.js';

const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
function functionSource(start, end) {
  const at = source.indexOf(start);
  const until = source.indexOf(end, at);
  assert.ok(at >= 0 && until > at);
  return source.slice(at, until);
}
const absoluteHours = ({ day, hour }) => (day - 1) * 24 + hour;
const available = new Function('HUB_ANNEX_SYSTEM_EFFECTS_V71', 'absoluteHours',
  functionSource('function assertAnnexServiceAvailableV71(', '\nfunction completeAnnexServiceV71(')
  + '\nreturn assertAnnexServiceAvailableV71;')(HUB_ANNEX_SYSTEM_EFFECTS_V71, absoluteHours);

test('la baie refuse énergie 0 et 1 sans modifier la sauvegarde', () => {
  for (const power of [0, 1]) {
    const save = { clock: { day: 1, hour: 6 }, hub: { systems: { power }, services: {} } };
    const before = structuredClone(save);
    assert.throws(() => available(save, 'synthetic-bay'), /insuffisante/);
    assert.deepEqual(save, before);
  }
});

test('la baie accepte son coût exact et refuse une deuxième utilisation dans la relève', () => {
  const save = { clock: { day: 1, hour: 6 }, hub: { systems: { power: 2 }, services: {} } };
  assert.equal(available(save, 'synthetic-bay').effects.power, -2);
  save.hub.services['annex:synthetic-bay'] = 1;
  assert.throws(() => available(save, 'synthetic-bay'), /déjà utilisée/);
});

function harness(failure) {
  const initial = {
    clock: { day: 1, hour: 6 },
    hub: { systems: { power: 2 }, services: {}, pendingModuleActionV71: { moduleId: 'module-qa' } }
  };
  let commits = 0;
  const saveSystem = { data: structuredClone(initial), commit() {
    if (failure === 'storage') throw new Error('QuotaExceededError');
    commits += 1;
  } };
  const run = new Function('saveSystem', 'clone', 'absoluteHours', 'simulateElapsed',
    'ensureAdvancedState', 'renderAll', 'toast', 'console',
    functionSource('function runTimedMutation(', '\nfunction applyRuntimeSettings(')
    + '\nreturn runTimedMutation;')(
    saveSystem, structuredClone, absoluteHours,
    () => { if (failure === 'simulation') throw new Error('simulation'); },
    () => {},
    () => { if (failure === 'render') throw new Error('render'); },
    () => {}, { error() {} }
  );
  const mutate = () => {
    saveSystem.data.hub.systems.power -= 2;
    saveSystem.data.hub.services['annex:synthetic-bay'] = 1;
    saveSystem.data.hub.pendingModuleActionV71 = null;
    saveSystem.data.clock.hour += 1;
    return { result: 'Station confirmée' };
  };
  return { run, mutate, saveSystem, initial, commits: () => commits };
}

for (const failure of ['storage', 'simulation']) {
  test('transaction refusée et ordre préservé si échec ' + failure, () => {
    const h = harness(failure);
    assert.equal(h.run(h.mutate), null);
    assert.deepEqual(h.saveSystem.data, h.initial);
    assert.equal(h.commits(), 0);
  });
}

test('une erreur visuelle après sauvegarde ne rejette pas une transaction confirmée', () => {
  const h = harness('render');
  assert.deepEqual(h.run(h.mutate), { result: 'Station confirmée' });
  assert.equal(h.commits(), 1);
  assert.equal(h.saveSystem.data.hub.systems.power, 0);
  assert.equal(h.saveSystem.data.hub.pendingModuleActionV71, null);
  assert.equal(h.saveSystem.data.clock.hour, 7);
});

test('station validée exactement une fois après simulation et stockage', () => {
  const h = harness();
  assert.deepEqual(h.run(h.mutate), { result: 'Station confirmée' });
  assert.equal(h.commits(), 1);
  assert.equal(h.saveSystem.data.hub.services['annex:synthetic-bay'], 1);
});
