import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  PLAYER_APPEARANCE_ITEMS_V126, PLAYER_APPEARANCE_SLOTS_V126,
  normalizePlayerAppearanceV126, equipPlayerAppearanceV126,
  resetPlayerAppearanceV126, getPlayerAppearanceSelectionV126
} from '../src/player-appearance-v126.js';
import { playerAppearanceUiModelV126, playerAppearancePanelHtmlV126 } from '../src/player-appearance-ui-v126.js';
import {
  createDefaultSave, migrateSave, beginOperation, resolveOperationDeployment,
  sanitizeOperationResumeState, SaveSystem
} from '../src/save.js';
import { CAMPAIGNS, WORLDS, CREW, WEAPONS, EQUIPMENT, VEHICLES, COSTUMES } from '../src/content.js';
import { USER_EQUIPMENT_V95 } from '../src/user-equipment-v95.js';

const clone = value => structuredClone(value);
const parts = slot => PLAYER_APPEARANCE_ITEMS_V126.filter(item => item.slot === slot);
const alternative = slot => parts(slot).find(item => item.id !== normalizePlayerAppearanceV126().slots[slot])?.id;
const catalogs = { crewCatalog: CREW, weaponCatalog: WEAPONS, equipmentCatalog: EQUIPMENT,
  vehicleCatalog: VEHICLES, costumeCatalog: COSTUMES };
const differentAppearance = () => {
  const state = normalizePlayerAppearanceV126();
  for (const slot of PLAYER_APPEARANCE_SLOTS_V126) {
    if (slot.optional) state.slots[slot.id] = null;
    else state.slots[slot.id] = alternative(slot.id);
  }
  return state;
};
const withoutAppearance = save => {
  const result = clone(save);
  delete result.player.appearanceV126;
  delete result.player.coopAppearanceV126;
  return result;
};

test('appearance defaults are valid independent part selections, never shared mutable state', () => {
  const first = normalizePlayerAppearanceV126(), second = normalizePlayerAppearanceV126();
  assert.deepEqual(Object.keys(first.slots).sort(), ['arms', 'back', 'helmet', 'legs', 'mask', 'torso']);
  for (const slot of PLAYER_APPEARANCE_SLOTS_V126) {
    assert.ok(first.slots[slot.id] === null && slot.optional
      || parts(slot.id).some(item => item.id === first.slots[slot.id]));
  }
  first.slots.torso = alternative('torso');
  assert.notDeepEqual(first, second);
  assert.deepEqual(second, normalizePlayerAppearanceV126());
  assert.equal(PLAYER_APPEARANCE_SLOTS_V126.filter(slot => slot.optional).length, 3);
});

test('normalization rejects foreign items, guessed IDs and asset paths while preserving valid choices', () => {
  const input = { schema: 126, slots: {
    helmet: '/assets/unreviewed-helmet.png', mask: 'equipment-008-rebreather',
    torso: alternative('legs'), arms: alternative('arms'), legs: null,
    back: null, weapon: WEAPONS[0].id
  }, image: '/arbitrary.png', armor: 999 };
  const before = clone(input), result = normalizePlayerAppearanceV126(input), defaults = normalizePlayerAppearanceV126();
  assert.deepEqual(result, { schema: 126, slots: { ...defaults.slots, arms: alternative('arms'), back: null } });
  assert.deepEqual(input, before);
  for (const raw of [null, false, [], { schema: 125, slots: differentAppearance().slots }, { schema: 126, slots: [] }])
    assert.deepEqual(normalizePlayerAppearanceV126(raw), defaults);
});

test('a part changes only the selected operator and never changes gameplay equipment or credits', () => {
  const save = createDefaultSave(), before = withoutAppearance(save), j2 = clone(save.player.coopAppearanceV126);
  const result = equipPlayerAppearanceV126(save, { owner: 'player', slot: 'torso', itemId: alternative('torso') });
  assert.equal(result.cosmeticOnly, true);
  assert.equal(save.player.appearanceV126.slots.torso, alternative('torso'));
  assert.deepEqual(save.player.coopAppearanceV126, j2);
  result.appearance.slots.torso = 'bad-response-mutation';
  assert.equal(save.player.appearanceV126.slots.torso, alternative('torso'));
  equipPlayerAppearanceV126(save, { owner: 'coop', slot: 'helmet', itemId: null });
  assert.equal(save.player.coopAppearanceV126.slots.helmet, null);
  assert.notEqual(save.player.appearanceV126.slots.helmet, null);
  assert.deepEqual(withoutAppearance(save), before);
});

test('invalid target, slot and removal of essential garments reject atomically', () => {
  const save = createDefaultSave(), before = clone(save);
  for (const request of [
    { owner: 'squad', slot: 'helmet', itemId: null },
    { owner: '__proto__', slot: 'helmet', itemId: null },
    { owner: 'player', slot: 'weapon', itemId: WEAPONS[0].id },
    { owner: 'player', slot: 'arms', itemId: alternative('torso') },
    { owner: 'coop', slot: 'torso', itemId: null },
    { owner: 'coop', slot: 'helmet', itemId: 'helmet-unreviewed-v126' }
  ]) {
    assert.throws(() => equipPlayerAppearanceV126(save, request));
    assert.deepEqual(save, before);
  }
});

test('reset restores one cosmetic outfit while keeping the other operator and dedicated costume', () => {
  const save = createDefaultSave();
  save.player.appearanceV126 = differentAppearance();
  save.player.coopAppearanceV126 = differentAppearance();
  save.player.costumeId = 'franchise-nostromo-crew';
  const before = withoutAppearance(save), player = clone(save.player.appearanceV126);
  resetPlayerAppearanceV126(save, 'coop');
  assert.deepEqual(save.player.appearanceV126, player);
  assert.deepEqual(save.player.coopAppearanceV126, normalizePlayerAppearanceV126());
  assert.deepEqual(withoutAppearance(save), before);
});

test('active-operation lock rejects equip and reset for both owners without changing the manifest', () => {
  const save = createDefaultSave();
  beginOperation(save, CAMPAIGNS[0], WORLDS[0]);
  const before = clone(save);
  for (const owner of ['player', 'coop']) {
    assert.throws(() => equipPlayerAppearanceV126(save, { owner, slot: 'helmet', itemId: null }), /verrouillée/);
    assert.throws(() => resetPlayerAppearanceV126(save, owner), /verrouillée/);
  }
  assert.deepEqual(save, before);
});

test('migration preserves independent valid selections and dedicated V95/V119 outfits', () => {
  const save = createDefaultSave();
  save.player.appearanceV126 = differentAppearance();
  save.player.coopAppearanceV126 = normalizePlayerAppearanceV126();
  save.player.costumeId = 'franchise-nostromo-crew';
  save.player.userEquipmentV95.armorId = USER_EQUIPMENT_V95.find(item => item.kind === 'armor').id;
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(migrated.player.appearanceV126, save.player.appearanceV126);
  assert.deepEqual(migrated.player.coopAppearanceV126, save.player.coopAppearanceV126);
  assert.equal(migrated.player.costumeId, save.player.costumeId);
  assert.deepEqual(migrated.player.userEquipmentV95, save.player.userEquipmentV95);
  assert.deepEqual(migrated.player.weaponIds, save.player.weaponIds);
  assert.deepEqual(migrated.player.equipmentIds, save.player.equipmentIds);
  assert.deepEqual(migrated.player.ammo, save.player.ammo);
  delete save.player.appearanceV126;
  delete save.player.coopAppearanceV126;
  const legacy = migrateSave(save);
  assert.deepEqual(legacy.player.appearanceV126, normalizePlayerAppearanceV126());
  assert.deepEqual(legacy.player.coopAppearanceV126, normalizePlayerAppearanceV126());
  assert.equal(legacy.player.costumeId, 'franchise-nostromo-crew');
  assert.deepEqual(legacy.player.userEquipmentV95, save.player.userEquipmentV95);
});

test('deployment freezes both appearances and supplies copies independent of later live choices', () => {
  const save = createDefaultSave();
  save.player.appearanceV126 = differentAppearance();
  const selectedPlayer = clone(save.player.appearanceV126), selectedCoop = clone(save.player.coopAppearanceV126);
  beginOperation(save, CAMPAIGNS[0], WORLDS[0]);
  const manifest = save.strategy.currentOperation;
  assert.deepEqual(manifest.playerAppearanceV126, selectedPlayer);
  assert.deepEqual(manifest.coopAppearanceV126, selectedCoop);
  // Direct tampering simulates a divergent outside profile, not an allowed UI mutation.
  save.player.appearanceV126 = normalizePlayerAppearanceV126();
  save.player.coopAppearanceV126 = differentAppearance();
  const deployment = resolveOperationDeployment(save, catalogs);
  assert.deepEqual(deployment.playerAppearanceV126, selectedPlayer);
  assert.deepEqual(deployment.coopAppearanceV126, selectedCoop);
  deployment.playerAppearanceV126.slots.torso = 'bad-runtime-mutation';
  assert.deepEqual(manifest.playerAppearanceV126, selectedPlayer);
  const resumed = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(resumed.strategy.currentOperation.playerAppearanceV126, selectedPlayer);
  assert.deepEqual(resumed.strategy.currentOperation.coopAppearanceV126, selectedCoop);
  assert.deepEqual(resolveOperationDeployment(resumed, catalogs).playerAppearanceV126, selectedPlayer);
});

test('a legacy active operation does not borrow newly selected cosmetic parts on resume', () => {
  const save = createDefaultSave();
  beginOperation(save, CAMPAIGNS[0], WORLDS[0]);
  delete save.strategy.currentOperation.playerAppearanceV126;
  delete save.strategy.currentOperation.coopAppearanceV126;
  save.player.appearanceV126 = differentAppearance();
  save.player.coopAppearanceV126 = differentAppearance();
  const resumed = beginOperation(save, CAMPAIGNS[0], WORLDS[0]);
  assert.equal(resumed.resumed, true);
  assert.deepEqual(resumed.operation.playerAppearanceV126, normalizePlayerAppearanceV126());
  assert.deepEqual(resumed.operation.coopAppearanceV126, normalizePlayerAppearanceV126());
  assert.deepEqual(save.player.appearanceV126, differentAppearance());
});

test('native checkpoint sanitation preserves known selected parts and absent legacy fields', () => {
  const candidate = { schema: 1, identity: { campaignId: CAMPAIGNS[0].id },
    player: { health: 72, ammo: 11, appearanceV126: differentAppearance() },
    coop: { health: 34, ammo: 4, appearanceV126: normalizePlayerAppearanceV126() } };
  candidate.coop.appearanceV126.slots.torso = '/wrong.png';
  const result = sanitizeOperationResumeState(candidate);
  assert.equal(result.player.health, 72);
  assert.equal(result.coop.ammo, 4);
  assert.deepEqual(result.player.appearanceV126, differentAppearance());
  assert.deepEqual(result.coop.appearanceV126, normalizePlayerAppearanceV126());
  delete candidate.player.appearanceV126;
  delete candidate.coop.appearanceV126;
  const legacy = sanitizeOperationResumeState(candidate);
  assert.equal(Object.hasOwn(legacy.player, 'appearanceV126'), false);
  assert.equal(Object.hasOwn(legacy.coop, 'appearanceV126'), false);
});

test('real SaveSystem round-trip and rejected storage writes keep cosmetic choices atomic', () => {
  const entries = new Map();
  let rejectWrites = false;
  const storage = { getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => { if (rejectWrites) throw new Error('disk full'); entries.set(key, value); } };
  const saves = new SaveSystem(storage);
  saves.load(1);
  const candidate = { ...saves.data, player: clone(saves.data.player) };
  equipPlayerAppearanceV126(candidate, { owner: 'coop', slot: 'torso', itemId: alternative('torso') });
  const before = clone(saves.data);
  rejectWrites = true;
  assert.throws(() => saves.commit({ player: candidate.player }), /Sauvegarde impossible/);
  assert.deepEqual(saves.data, before);
  rejectWrites = false;
  saves.commit({ player: candidate.player });
  const restored = new SaveSystem(storage);
  restored.load(1);
  assert.equal(restored.data.player.coopAppearanceV126.slots.torso, alternative('torso'));
  assert.deepEqual(restored.data.player.appearanceV126, normalizePlayerAppearanceV126());
});

test('UI reports prepared versus effective outfits independently for J1 and J2', () => {
  const save = createDefaultSave();
  save.settings.coop = true;
  save.player.appearanceV126 = differentAppearance();
  assert.equal(playerAppearanceUiModelV126(save).effective, true);
  save.player.costumeId = 'franchise-nostromo-crew';
  const dedicated = playerAppearanceUiModelV126(save);
  assert.equal(dedicated.effective, false);
  assert.equal(dedicated.reason, 'dedicated-costume');
  assert.deepEqual(dedicated.state, differentAppearance());
  assert.equal(playerAppearanceUiModelV126(save, 'coop').effective, true);
  save.player.userEquipmentV95.armorId = USER_EQUIPMENT_V95.find(item => item.kind === 'armor').id;
  assert.equal(playerAppearanceUiModelV126(save).reason, 'custom-armor');
  save.settings.coop = false;
  assert.equal(playerAppearanceUiModelV126(save, 'coop').reason, 'coop-disabled');
  assert.deepEqual(getPlayerAppearanceSelectionV126(save), differentAppearance());
});

test('armory controls expose real owner/slot/item buttons, a labelled preview and lock all mutations', () => {
  const save = createDefaultSave();
  save.player.name = '<img src=x onerror=bad>';
  save.strategy.currentOperation = { id: 'active-operation' };
  const html = playerAppearancePanelHtmlV126(save, { owner: 'coop' });
  const buttons = [...html.matchAll(/<button\b[^>]*data-appearance-item-v126="[^"]*"[^>]*>/g)].map(match => match[0]);
  assert.ok(buttons.length >= 12);
  for (const button of buttons) {
    assert.match(button, /data-appearance-owner-v126="coop"/);
    assert.match(button, /data-appearance-slot-v126="(?:helmet|mask|torso|arms|legs|back)"/);
    assert.match(button, /aria-pressed="(?:true|false)"/);
    assert.match(button, / disabled/);
  }
  assert.match(html, /id="player-appearance-preview-v126"[^>]+aria-label="Aperçu de la tenue préparée/);
  assert.match(html, /data-appearance-preview-status-v126 role="status" aria-live="polite"/);
  const playerHtml = playerAppearancePanelHtmlV126(save);
  assert.doesNotMatch(playerHtml, /<img src=x/);
  assert.match(playerHtml, /&lt;img src=x onerror=bad&gt;/);
});
