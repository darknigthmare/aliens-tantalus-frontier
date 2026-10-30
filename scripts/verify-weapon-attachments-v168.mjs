import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createWeaponModuleInventoryV168, validateWeaponModuleInventoryV168,
  installWeaponModuleV168, uninstallWeaponModuleV168, equippedWeaponModulesV168,
  captureWeaponModulesV168, restoreWeaponModulesV168, WEAPON_MODULE_CATALOG_V168
} from '../src/weapon-attachments-v168.js';
const source = 'weapon-001-m41a-pulse-rifle', other = 'weapon-005-m56-smartgun';
const base = { ownerId: 'player', weaponDefinitionId: source,
  weaponInstanceId: 'player:weapon-001-m41a-pulse-rifle:legacy:1' };
const equip = (s, moduleId, masteryLevel, receiptId = moduleId) =>
  installWeaponModuleV168(s, { ...base, moduleId, masteryLevel, receiptId });

test('V168 modules: real slot catalog is closed, typed and not mistakenly called canonical', () => {
  assert.ok(WEAPON_MODULE_CATALOG_V168.length >= 7);
  assert.ok(WEAPON_MODULE_CATALOG_V168.every(m => m.cosmeticOnly
    && m.sourceStatus === 'game-adaptation' && m.art === 'missing'));
  assert.equal(new Set(WEAPON_MODULE_CATALOG_V168.map(m => m.id)).size, WEAPON_MODULE_CATALOG_V168.length);
});

test('V168 modules: level gate and explicit weapon-family whitelist are enforced', () => {
  const s = createWeaponModuleInventoryV168();
  assert.equal(equip(s, 'tantalus-m41a-optic', 4), null);
  assert.equal(installWeaponModuleV168(s, { ...base, weaponDefinitionId: other,
    moduleId: 'tantalus-m41a-optic', masteryLevel: 30, receiptId: 'other' }), null);
  assert.equal(s.equips.length, 0);
  assert.ok(equip(s, 'tantalus-m41a-optic', 5));
});

test('V168 modules: one slot has one module and replace reports the prior one accurately', () => {
  const s = createWeaponModuleInventoryV168();
  assert.ok(equip(s, 'tantalus-m41a-optic', 5, '1'));
  assert.equal(equip(s, 'tantalus-m41a-optic', 5, '2'), null);
  assert.ok(equip(s, 'tantalus-m41a-stock', 7, '3'));
  assert.equal(equippedWeaponModulesV168(s, base.ownerId, base.weaponInstanceId).length, 2);
});

test('V168 modules: receipt replay cannot install, replace or remove twice', () => {
  const s = createWeaponModuleInventoryV168();
  assert.ok(equip(s, 'tantalus-m41a-rail', 3, 'install1'));
  assert.equal(equip(s, 'tantalus-m41a-optic', 5, 'install1'), null);
  const p = uninstallWeaponModuleV168(s, { ...base, slot: 'side_rail', receiptId: 'remove1' });
  assert.equal(p.moduleId, 'tantalus-m41a-rail');
  assert.equal(uninstallWeaponModuleV168(s, { ...base, slot: 'side_rail', receiptId: 'remove1' }), null);
  assert.equal(s.equips.length, 0);
});

test('V168 modules: saves persist independent operator, definition and instance bindings', () => {
  const s = createWeaponModuleInventoryV168();
  equip(s, 'tantalus-m41a-rail', 3, 'a');
  const c = restoreWeaponModulesV168(captureWeaponModulesV168(s));
  assert.deepEqual(equippedWeaponModulesV168(c, 'coop', base.weaponInstanceId), []);
  assert.deepEqual(equippedWeaponModulesV168(c, 'player', 'other-instance'), []);
  assert.equal(equippedWeaponModulesV168(c, base.ownerId, base.weaponInstanceId)[0].artStatus, 'missing');
});

test('V168 modules: forged different weapons on the same physical instance are rejected', () => {
  const s = createWeaponModuleInventoryV168();
  equip(s, 'tantalus-m41a-rail', 3, 'a');
  s.equips.push({ ...base, weaponDefinitionId: other, slot: 'belt_harness',
    moduleId: 'tantalus-m56-harness' });
  assert.equal(validateWeaponModuleInventoryV168(s), false);
  assert.equal(captureWeaponModulesV168(s), null);
});

test('V168 modules: legacy absence restores empty without inventing accessory art', () => {
  const s = restoreWeaponModulesV168(undefined);
  assert.equal(s.schema, 168);
  assert.deepEqual(s.equips, []);
  assert.deepEqual(equippedWeaponModulesV168(s, 'player', base.weaponInstanceId), []);
});
