import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceNeuroRuntime,
  createNeuroRuntime,
  damageInstalledModules,
  ensureAdvancedState,
  getSelectedAdvancedLoadout,
  getShipModuleEffects,
  installShipModule,
  performDiplomacy,
  repairShipModule,
  selectApexDossier,
  selectNeuroProfile
} from '../src/advanced-systems.js';
import {
  APEX_DOSSIERS,
  ENEMIES,
  NEURO_XENO_PROFILES,
  SHIP_MODULES,
  WORLDS
} from '../src/content.js';
import { createDefaultSave } from '../src/save.js';

test('les modules installés consomment de la puissance et produisent des effets réparables', () => {
  const save = createDefaultSave(1);
  ensureAdvancedState(save);
  const before = getShipModuleEffects(save);
  const candidate = SHIP_MODULES.find((module) => !save.hub.moduleIds.includes(module.id) && module.power <= before.sparePower);
  assert.ok(candidate);
  const credits = save.galaxy.resources.credits;
  const installed = installShipModule(save, candidate.id);
  assert.equal(installed.module.id, candidate.id);
  assert.ok(save.galaxy.resources.credits < credits);
  assert.ok(installed.summary.powerLoad > before.powerLoad);

  const damaged = damageInstalledModules(save, 30, save.hub.moduleIds.indexOf(candidate.id));
  assert.ok(damaged.integrity < damaged.previous);
  const alloy = save.galaxy.resources.alloy;
  const repaired = repairShipModule(save, damaged.moduleId);
  assert.ok(repaired.repaired > 0);
  assert.ok(save.galaxy.resources.alloy < alloy);
});

test('un profil Neuro-Xeno compatible devient une classe jouable et son échec est simulé', () => {
  const save = createDefaultSave(2);
  const profile = NEURO_XENO_PROFILES.find((entry) => entry.playerClassCompatible);
  const selection = selectNeuroProfile(save, profile.id);
  assert.equal(save.player.classId, 'neuro-xeno-controller');
  assert.equal(selection.enemy.id, profile.enemyId);
  const runtime = createNeuroRuntime(selection.profile, selection.enemy, 77);
  advanceNeuroRuntime(runtime, { distance: profile.signalRange * 8, seconds: 90, attacking: true });
  assert.equal(runtime.controlled, false);
  assert.equal(runtime.failure, profile.failureMode);
});

test('les dossiers Apex et la diplomatie modifient la prochaine rencontre et le monde persistant', () => {
  const save = createDefaultSave(3);
  ensureAdvancedState(save);
  const selected = selectApexDossier(save, APEX_DOSSIERS[0].id);
  assert.equal(selected.enemy.id, APEX_DOSSIERS[0].enemyId);
  assert.ok(ENEMIES.some((enemy) => enemy.id === selected.enemy.id));
  const loadout = getSelectedAdvancedLoadout(save);
  assert.equal(loadout.apexDossier.id, APEX_DOSSIERS[0].id);

  const world = WORLDS[0];
  const before = structuredClone(save.galaxy.worldState[world.id]);
  const result = performDiplomacy(save, world, 'aid');
  assert.ok(result.state.stability > before.stability);
  assert.ok(result.standing > 0);
  assert.ok(save.galaxy.resources.credits < 3200);
});
