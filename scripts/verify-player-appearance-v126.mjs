import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  PLAYER_APPEARANCE_ITEMS_V126, PLAYER_APPEARANCE_SLOTS_V126,
  normalizePlayerAppearanceV126, equipPlayerAppearanceV126,
  resetPlayerAppearanceV126, getPlayerAppearanceSelectionV126,
  PLAYER_APPEARANCE_PRESETS_V129, getPlayerAppearancePresetV129,
  getPlayerAppearanceSelectedPresetV129, equipPlayerAppearancePresetV129,
  getPlayerAppearanceItemV126
} from '../src/player-appearance-v126.js';
import { playerAppearanceUiModelV126, playerAppearancePanelHtmlV126 } from '../src/player-appearance-ui-v126.js';
import {
  createDefaultSave, migrateSave, beginOperation, resolveOperationDeployment,
  sanitizeOperationResumeState, SaveSystem
} from '../src/save.js';
import { CAMPAIGNS, WORLDS, CREW, WEAPONS, EQUIPMENT, VEHICLES, COSTUMES } from '../src/content.js';
import { USER_EQUIPMENT_V95 } from '../src/user-equipment-v95.js';
import { resolvePlayerAppearancePreviewWeaponV127 } from '../src/player-appearance-loadout-v127.js';
import { getCostumeV119, canEquipCostumeV119 } from '../src/franchise-costumes-v119.js';
import { buildCostumeArchivesModelV119, renderCostumeArchiveCardV119 } from '../src/costume-ui-v119.js';

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

test('V127 armory weapon observation uses issued catalogue art and never mutates the profile', () => {
  const save = createDefaultSave(), before = clone(save);
  const expected = WEAPONS.find(weapon => weapon.id === save.player.weaponIds.at(-1));
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save, 'player'), expected);
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save, 'coop'), expected);
  assert.deepEqual(save, before);
  save.player.weaponIds = ['missing-weapon'];
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save), null, 'No invented substitute for an unknown item.');
});

test('V127 preview follows personal J1 and J2 kits including an unarmed operator', () => {
  const save = createDefaultSave();
  const primary = WEAPONS.find(weapon => weapon.id === 'weapon-001-m41a-pulse-rifle');
  const secondary = WEAPONS.find(weapon => weapon.id === 'weapon-007-m37a2-pump-shotgun');
  save.crew[0].gearV85 = [{ instanceId: 'preview-j1-weapon', kind: 'weapon', catalogId: primary.id }];
  save.crew[1].gearV85 = [{ instanceId: 'preview-j2-weapon', kind: 'weapon', catalogId: secondary.id }];
  const before = clone(save);
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save, 'player').id, primary.id);
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save, 'coop').id, secondary.id);
  assert.deepEqual(save, before);
  save.crew[1].gearV85 = [];
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save, 'coop'), null);
  save.onboardingV84 = { identity: { id: 'player-echo9' } };
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save).id, save.player.weaponIds.at(-1),
    'The independent commander does not borrow the first Marine’s personal rifle.');
});

test('V127 preview respects custom issued weapons while a personal J2 keeps their own kit', () => {
  const save = createDefaultSave(), custom = USER_EQUIPMENT_V95.find(item => item.kind === 'weapon');
  save.player.userEquipmentV95.weaponId = custom.id;
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save), custom);
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save, 'coop'), custom,
    'A J2 without a personal kit uses the operation’s shared issued weapon.');
  save.crew[1].gearV85 = [];
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save, 'coop'), null);
});

test('V127 preview reads the frozen operation weapon and crew manifest after profile edits', () => {
  const save = createDefaultSave();
  const personalId = 'weapon-007-m37a2-pump-shotgun';
  save.crew[1].gearV85 = [{ instanceId: 'preview-manifest-weapon', kind: 'weapon', catalogId: personalId }];
  const campaign = CAMPAIGNS.find(entry => entry.id === 'pair-001-frontier');
  assert.ok(campaign, 'Use a stable unlocked route, not a catalogue-order assumption.');
  beginOperation(save, campaign, WORLDS.find(world => world.id === campaign.worldId));
  const deployment = resolveOperationDeployment(save, catalogs);
  const original = deployment.weapon.id;
  save.player.weaponIds = [WEAPONS[0].id];
  save.crew[1].gearV85 = [];
  save.strategy.selectedCrewIds = [];
  const before = clone(save);
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save).id, original);
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save, 'coop').id, personalId);
  assert.deepEqual(save, before, 'Reading the active manifest is presentation-only.');
  save.strategy.currentOperation.crewManifestV85 = [];
  save.crew[1].gearV85 = [{ instanceId: 'preview-new-live-weapon', kind: 'weapon', catalogId: personalId }];
  assert.equal(resolveOperationDeployment(save, catalogs).crew.length, 0);
  assert.equal(resolvePlayerAppearancePreviewWeaponV127(save, 'coop').id, original,
    'An explicitly empty frozen manifest cannot borrow the current crew kit.');
});

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

test('V129 keeps the exact V126 default and existing customized selections after migration', () => {
  const original = { schema: 126, slots: {
    helmet: 'helmet-marine-v126', mask: null, torso: 'torso-marine-v126',
    arms: 'arms-marine-v126', legs: 'legs-marine-v126', back: 'back-field-pack-v126'
  } };
  const customized = { schema: 126, slots: {
    helmet: 'helmet-patrol-v126', mask: 'mask-rebreather-v126', torso: 'torso-utility-v126',
    arms: 'arms-utility-v126', legs: 'legs-utility-v126', back: null
  } };
  assert.deepEqual(normalizePlayerAppearanceV126(), original);
  const save = createDefaultSave();
  save.player.appearanceV126 = clone(customized);
  save.player.coopAppearanceV126 = clone(original);
  const restored = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(restored.player.appearanceV126, customized);
  assert.deepEqual(restored.player.coopAppearanceV126, original);
  assert.equal(getPlayerAppearanceSelectedPresetV129(original), null);
  assert.equal(getPlayerAppearanceSelectedPresetV129(customized), null);
});

test('V129 film presets contain six reviewed cosmetic slot IDs and no inventory or identity override', () => {
  const expected = ['uscm-infantry-v129', 'uscm-hicks-v129', 'uscm-hudson-v129', 'uscm-smartgunner-v129'];
  assert.deepEqual(PLAYER_APPEARANCE_PRESETS_V129.map(preset => preset.id), expected);
  const filmParts = PLAYER_APPEARANCE_ITEMS_V126.filter(part => part.collection === 'aliens-1986');
  assert.equal(filmParts.length, 15);
  const used = new Set();
  for (const preset of PLAYER_APPEARANCE_PRESETS_V129) {
    assert.equal(getPlayerAppearancePresetV129(preset.id), preset);
    assert.deepEqual(Object.keys(preset.slots).sort(), ['arms', 'back', 'helmet', 'legs', 'mask', 'torso']);
    assert.equal(preset.slots.mask, null);
    assert.equal(preset.exact, false);
    assert.equal(preset.provenance, 'film-reference-adaptation');
    assert.equal(preset.cosmeticOnly, true);
    assert.equal(preset.sourceWork, 'Aliens (1986)');
    assert.equal(Object.hasOwn(preset, 'skinId'), false);
    assert.equal(Object.hasOwn(preset, 'weaponId'), false);
    assert.ok(Object.isFrozen(preset) && Object.isFrozen(preset.slots));
    for (const [slot, id] of Object.entries(preset.slots)) {
      if (id === null) continue;
      const part = getPlayerAppearanceItemV126(id);
      assert.equal(part.slot, slot);
      assert.equal(part.cosmeticOnly, true);
      assert.equal(part.exact, false);
      assert.equal(part.provenance, 'film-reference-adaptation');
      used.add(id);
    }
  }
  assert.deepEqual([...used].sort(), filmParts.map(part => part.id).sort());
  assert.equal(getPlayerAppearancePresetV129('__proto__'), null);
});

test('V129 applying a complete film outfit changes only the selected operator’s six slots', () => {
  const save = createDefaultSave();
  save.player.costumeId = 'franchise-nostromo-crew';
  save.player.userEquipmentV95.armorId = USER_EQUIPMENT_V95.find(entry => entry.kind === 'armor').id;
  save.player.appearanceV126.slots.mask = 'mask-rebreather-v126';
  for (const owner of ['player', 'coop']) {
    const ownField = owner === 'player' ? 'appearanceV126' : 'coopAppearanceV126';
    const otherField = owner === 'player' ? 'coopAppearanceV126' : 'appearanceV126';
    for (const preset of PLAYER_APPEARANCE_PRESETS_V129) {
      const before = clone(save), result = equipPlayerAppearancePresetV129(save, { owner, presetId: preset.id });
      const expected = clone(before);
      expected.player[ownField] = { schema: 126, slots: clone(preset.slots) };
      assert.deepEqual(save, expected, 'No weapons, charges, protection, character, currency or other profile fields change.');
      assert.deepEqual(save.player[otherField], before.player[otherField]);
      assert.equal(result.cosmeticOnly, true);
      assert.equal(result.owner, owner);
      result.appearance.slots.helmet = null;
      assert.equal(save.player[ownField].slots.helmet, preset.slots.helmet, 'Caller mutations cannot alter the committed selection.');
    }
  }
});

test('V129 a film outfit remains editable one slot at a time and matching follows the actual selection', () => {
  const save = createDefaultSave(), preset = getPlayerAppearancePresetV129('uscm-hicks-v129');
  equipPlayerAppearancePresetV129(save, { presetId: preset.id });
  for (const slot of PLAYER_APPEARANCE_SLOTS_V126) {
    const original = preset.slots[slot.id];
    const replacement = slot.id === 'mask' ? 'mask-rebreather-v126'
      : slot.optional ? null : slot.defaultItemId;
    equipPlayerAppearanceV126(save, { slot: slot.id, itemId: replacement });
    const beforeRead = clone(save);
    assert.equal(getPlayerAppearanceSelectedPresetV129(save.player.appearanceV126), null);
    assert.equal(playerAppearanceUiModelV126(save).selectedPresetId, null);
    assert.deepEqual(save, beforeRead, 'Matching is an observation, not a saved preset alias.');
    for (const other of PLAYER_APPEARANCE_SLOTS_V126.filter(entry => entry.id !== slot.id))
      assert.equal(save.player.appearanceV126.slots[other.id], preset.slots[other.id]);
    equipPlayerAppearanceV126(save, { slot: slot.id, itemId: original });
    assert.equal(getPlayerAppearanceSelectedPresetV129(save.player.appearanceV126).id, preset.id);
  }
  resetPlayerAppearanceV126(save);
  assert.deepEqual(save.player.appearanceV126, normalizePlayerAppearanceV126());
  assert.equal(getPlayerAppearanceSelectedPresetV129(save.player.appearanceV126), null);
});

test('V129 invalid preset requests reject before assigning any part', () => {
  const save = createDefaultSave(), before = clone(save);
  for (const request of [
    undefined, {}, { presetId: 'helmet-hicks-v129' },
    { presetId: '/assets/unreviewed.png' }, { presetId: '__proto__' },
    { presetId: { id: 'uscm-hicks-v129' } },
    { owner: '__proto__', presetId: 'uscm-hicks-v129' },
    { owner: 'squad', presetId: 'uscm-hudson-v129' }
  ]) {
    assert.throws(() => equipPlayerAppearancePresetV129(save, request));
    assert.deepEqual(save, before);
  }
  for (const malformed of [null, {}, { player: null }])
    assert.throws(() => equipPlayerAppearancePresetV129(malformed, { presetId: 'uscm-hicks-v129' }), /Opérateur inconnu/);
});

test('V129 every preset observes the active-operation lock for J1 and J2 without touching the manifest', () => {
  const save = createDefaultSave();
  equipPlayerAppearancePresetV129(save, { presetId: 'uscm-hicks-v129' });
  beginOperation(save, CAMPAIGNS[0], WORLDS[0]);
  const before = clone(save);
  for (const owner of ['player', 'coop']) {
    for (const preset of PLAYER_APPEARANCE_PRESETS_V129) {
      assert.throws(() => equipPlayerAppearancePresetV129(save, { owner, presetId: preset.id }), /verrouillée/);
      assert.deepEqual(save, before);
    }
  }
});

test('V129 film selections survive migration, frozen deployment and native checkpoints for both operators', () => {
  const save = createDefaultSave();
  equipPlayerAppearancePresetV129(save, { presetId: 'uscm-hudson-v129' });
  equipPlayerAppearancePresetV129(save, { owner: 'coop', presetId: 'uscm-smartgunner-v129' });
  const j1 = clone(save.player.appearanceV126), j2 = clone(save.player.coopAppearanceV126);
  beginOperation(save, CAMPAIGNS[0], WORLDS[0]);
  save.player.appearanceV126 = normalizePlayerAppearanceV126();
  save.player.coopAppearanceV126 = normalizePlayerAppearanceV126();
  const restored = migrateSave(JSON.parse(JSON.stringify(save)));
  const deployment = resolveOperationDeployment(restored, catalogs);
  assert.deepEqual(deployment.playerAppearanceV126, j1);
  assert.deepEqual(deployment.coopAppearanceV126, j2);
  deployment.playerAppearanceV126.slots.back = null;
  assert.deepEqual(restored.strategy.currentOperation.playerAppearanceV126, j1);
  const resume = sanitizeOperationResumeState({ schema: 1, identity: { campaignId: CAMPAIGNS[0].id },
    player: { health: 63, appearanceV126: j1 }, coop: { health: 48, appearanceV126: j2 } });
  assert.deepEqual(resume.player.appearanceV126, j1);
  assert.deepEqual(resume.coop.appearanceV126, j2);
  assert.equal(resume.player.health, 63);
  assert.equal(resume.coop.health, 48);
});

test('V129 a SaveSystem write failure cannot apply any part of the preset and a real reload preserves success', () => {
  const records = new Map();
  let rejectWrites = false;
  const storage = { getItem: key => records.get(key) ?? null,
    setItem: (key, value) => { if (rejectWrites) throw new Error('disk full'); records.set(key, value); } };
  const saves = new SaveSystem(storage);
  saves.load(1);
  const before = clone(saves.data), candidate = { ...saves.data, player: clone(saves.data.player) };
  equipPlayerAppearancePresetV129(candidate, { owner: 'coop', presetId: 'uscm-smartgunner-v129' });
  rejectWrites = true;
  assert.throws(() => saves.commit({ player: candidate.player }), /Sauvegarde impossible/);
  assert.deepEqual(saves.data, before);
  rejectWrites = false;
  saves.commit({ player: candidate.player });
  const loaded = new SaveSystem(storage);
  loaded.load(1);
  assert.deepEqual(loaded.data.player.coopAppearanceV126, candidate.player.coopAppearanceV126);
  assert.deepEqual(loaded.data.player.appearanceV126, before.player.appearanceV126);
  const loadedState = withoutAppearance(loaded.data), committedState = withoutAppearance(saves.data);
  // SaveSystem timestamps a real load; the outfit must leave gameplay state intact.
  delete loadedState.updatedAt;
  delete committedState.updatedAt;
  assert.deepEqual(loadedState, committedState);
});

test('V129 prepared presets remain distinct from effective dedicated costumes and J2 availability', () => {
  const save = createDefaultSave();
  equipPlayerAppearancePresetV129(save, { presetId: 'uscm-hicks-v129' });
  equipPlayerAppearancePresetV129(save, { owner: 'coop', presetId: 'uscm-hudson-v129' });
  save.player.costumeId = 'franchise-nostromo-crew';
  save.settings.coop = false;
  const before = clone(save), j1 = playerAppearanceUiModelV126(save), j2 = playerAppearanceUiModelV126(save, 'coop');
  assert.equal(j1.selectedPresetId, 'uscm-hicks-v129');
  assert.equal(j1.reason, 'dedicated-costume');
  assert.equal(j1.effective, false);
  assert.match(j1.status, /Choix conservés/);
  assert.match(j1.status, /Combinaison d’équipage du Nostromo/);
  assert.match(j1.status, /combinaison standard dans Echo-9/);
  assert.equal(j2.selectedPresetId, 'uscm-hudson-v129');
  assert.equal(j2.reason, 'coop-disabled');
  assert.equal(j2.effective, false);
  assert.deepEqual(save, before);
});

test('V129 armory exposes four native preset buttons, the exact selected preset and all editable slots', () => {
  const save = createDefaultSave();
  equipPlayerAppearancePresetV129(save, { owner: 'coop', presetId: 'uscm-smartgunner-v129' });
  const html = playerAppearancePanelHtmlV126(save, { owner: 'coop' });
  const buttons = [...html.matchAll(/<button\b[^>]*data-appearance-preset-v129="([^"]*)"[^>]*>/g)];
  assert.equal(buttons.length, 4);
  assert.match(html, /aria-labelledby="appearance-presets-title-coop-v129"/);
  assert.match(html, /role="group" aria-label="Tenue complète de J2 · Opérateur coop"/);
  assert.match(html, /data-appearance-preset-status-v129 role="status" aria-live="polite">Tenue complète préparée : Équipement Vasquez\./);
  for (const button of buttons) {
    assert.match(button[0], /type="button"/);
    assert.match(button[0], /data-appearance-owner-v126="coop"/);
    assert.match(button[0], new RegExp(`aria-pressed="${button[1] === 'uscm-smartgunner-v129'}"`));
    assert.doesNotMatch(button[0], / disabled/);
    assert.doesNotMatch(button[0], /data-appearance-item-v126/);
  }
  for (const slot of PLAYER_APPEARANCE_SLOTS_V126)
    assert.match(html, new RegExp(`data-appearance-slot-v126="${slot.id}"`));
  save.strategy.currentOperation = { id: 'active' };
  const locked = playerAppearancePanelHtmlV126(save, { owner: 'coop' });
  const lockedButtons = [...locked.matchAll(/<button\b[^>]*data-appearance-preset-v129="[^"]*"[^>]*>/g)];
  assert.equal(lockedButtons.length, 4);
  for (const [button] of lockedButtons) assert.match(button, / disabled/);
  assert.doesNotMatch(locked, /fidèle 1:1|exactement identique/i);
});

test('V129 Hicks and Hudson archive cards open the correct modular outfit without admitting a dedicated costume', () => {
  for (const [costumeId, presetId] of [
    ['franchise-hicks-combat', 'uscm-hicks-v129'],
    ['franchise-hudson-combat', 'uscm-hudson-v129']
  ]) {
    const costume = getCostumeV119(costumeId);
    assert.equal(canEquipCostumeV119(costumeId, COSTUMES), false);
    for (const locked of [false, true]) {
      const html = renderCostumeArchiveCardV119(costume, { locked, COSTUMES,
        getSkin: () => assert.fail('A modular navigation link must not request a dedicated costume atlas.') });
      assert.match(html, /TENUE EN PIÈCES SÉPARÉES · ARMURERIE/);
      const button = html.match(/<button\b[^>]*data-costume-appearance-v129="[^"]*"[^>]*>/)?.[0];
      assert.ok(button);
      assert.match(button, new RegExp(`data-costume-appearance-v129="${presetId}"`));
      assert.match(button, /type="button"/);
      assert.match(button, /aria-label="Préparer/);
      assert.doesNotMatch(button, / disabled|data-costume-id/,
        'Navigation remains available during an operation; the armory owns the mutation lock.');
      assert.doesNotMatch(html, /NON ÉQUIPABLE · VISUEL ABSENT/);
    }
  }
});

test('V129 archive orientation leaves other documented outfits and the dedicated availability filter intact', () => {
  const save = createDefaultSave(), before = clone(save);
  const vasquez = renderCostumeArchiveCardV119(getCostumeV119('franchise-vasquez-bdu'), { COSTUMES });
  assert.doesNotMatch(vasquez, /data-costume-appearance-v129/,
    'Vasquez’s BDU archive outfit is not silently mapped to her separate smartgunner equipment.');
  const nostromo = renderCostumeArchiveCardV119(getCostumeV119('franchise-nostromo-crew'), { COSTUMES, locked: true });
  assert.match(nostromo, /data-costume-id="franchise-nostromo-crew"[^>]*disabled/);
  assert.doesNotMatch(nostromo, /data-costume-appearance-v129/);
  const ready = buildCostumeArchivesModelV119({ save, COSTUMES, filters: { availability: 'ready' } });
  assert.ok(ready.entries.some(entry => entry.id === 'franchise-nostromo-crew'));
  assert.ok(!ready.entries.some(entry => ['franchise-hicks-combat', 'franchise-hudson-combat'].includes(entry.id)));
  const missing = buildCostumeArchivesModelV119({ save, COSTUMES, filters: { availability: 'missing', character: 'Hicks' } });
  assert.equal(missing.entries.length, 1);
  assert.equal(missing.entries[0].id, 'franchise-hicks-combat');
  assert.deepEqual(save, before);
});
