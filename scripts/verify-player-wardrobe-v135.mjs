import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultSave, migrateSave, SaveSystem, beginOperation, resolveOperationDeployment } from '../src/save.js';
import { CREW, WEAPONS, EQUIPMENT, VEHICLES, COSTUMES, CAMPAIGNS, WORLDS } from '../src/content.js';
import { normalizePlayerAppearanceV126, equipPlayerAppearanceV126, equipPlayerAppearancePresetV129,
  getPlayerAppearanceSelectedPresetV129, PLAYER_APPEARANCE_PRESETS_V129 } from '../src/player-appearance-v126.js';
import { playerAppearancePanelHtmlV126, playerAppearanceUiModelV126 } from '../src/player-appearance-ui-v126.js';
import { PLAYER_WARDROBE_CAPACITY_V135, normalizePlayerWardrobeV135, getPlayerWardrobeModelV135,
  savePlayerWardrobeOutfitV135, equipPlayerWardrobeOutfitV135, deletePlayerWardrobeOutfitV135, copyPlayerAppearanceV135 } from '../src/player-wardrobe-v135.js';

const clone = value => structuredClone(value);
function fixture() { const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.onboardingV84 = null; return save; }
const catalog = { crewCatalog: CREW, weaponCatalog: WEAPONS, equipmentCatalog: EQUIPMENT, vehicleCatalog: VEHICLES, costumeCatalog: COSTUMES };
const field = owner => owner === 'coop' ? 'coopAppearanceV126' : 'appearanceV126';
const defaultWardrobe = () => ({ schema: 135, owners: { player: [], coop: [] } });
function changedAppearance(save, owner = 'player') {
  equipPlayerAppearancePresetV129(save, { owner, presetId: 'uscm-hicks-v129' });
  equipPlayerAppearanceV126(save, { owner, slot: 'mask', itemId: 'mask-rebreather-v126' });
  return clone(save.player[field(owner)]);
}

test('four empty personal cabinets are read-only views and legacy migration adds no outfit or unlock', () => {
  const save = fixture(); delete save.player.wardrobeV135;
  const before = clone(save), model = getPlayerWardrobeModelV135(save);
  assert.equal(model.length, PLAYER_WARDROBE_CAPACITY_V135); assert.ok(model.every(entry => !entry.occupied && !entry.selected));
  assert.deepEqual(save, before);
  const migrated = migrateSave(save); assert.deepEqual(migrated.player.wardrobeV135, defaultWardrobe());
  assert.equal(migrated.player.costumeId, save.player.costumeId); assert.deepEqual(migrated.player.weaponIds, save.player.weaponIds);
  for (const value of [null, [], { schema: 134, owners: { player: [] } }, { schema: '135', owners: {} }, { schema: 135, owners: [] }]) {
    assert.deepEqual(normalizePlayerWardrobeV135(value), defaultWardrobe());
  }
});

test('saving and renaming a composition touches one owner/cabinet and snapshots all six parts independently', () => {
  const save = fixture(), selected = changedAppearance(save), before = clone(save);
  const result = savePlayerWardrobeOutfitV135(save, { slot: 2, name: '  Quart   cargo  ' });
  assert.equal(result.cosmeticOnly, true); assert.equal(result.name, 'Quart cargo');
  const expected = clone(before); expected.player.wardrobeV135 = { schema: 135, owners: { player: [{ slot: 2, name: 'Quart cargo', appearance: selected }], coop: [] } };
  assert.deepEqual(save, expected);
  save.player.appearanceV126.slots.helmet = null;
  assert.notEqual(save.player.wardrobeV135.owners.player[0].appearance.slots.helmet, null);
  const updated = savePlayerWardrobeOutfitV135(save, { slot: 2, name: 'Quart de repos' });
  assert.equal(updated.changed, true); assert.equal(save.player.wardrobeV135.owners.player.length, 1);
  assert.equal(save.player.wardrobeV135.owners.player[0].appearance.slots.helmet, null);
  assert.equal(savePlayerWardrobeOutfitV135(save, { slot: 2, name: 'Quart de repos' }).changed, false);
  assert.deepEqual(save.player.coopAppearanceV126, before.player.coopAppearanceV126);
});

test('recalling restores exactly the saved six pieces, keeps canonical presets derived and never admits a dedicated costume', () => {
  const save = fixture(), selected = changedAppearance(save);
  save.player.costumeId = 'franchise-nostromo-crew';
  savePlayerWardrobeOutfitV135(save, { slot: 1, name: 'Inspection' });
  save.player.appearanceV126 = normalizePlayerAppearanceV126();
  const before = clone(save), result = equipPlayerWardrobeOutfitV135(save, { slot: 1 });
  const expected = clone(before); expected.player.appearanceV126 = selected;
  assert.deepEqual(save, expected); assert.equal(getPlayerAppearanceSelectedPresetV129(save.player.appearanceV126), null);
  result.appearance.slots.torso = 'invalid-return-mutation'; assert.deepEqual(save.player.appearanceV126, selected);
  assert.equal(playerAppearanceUiModelV126(save).reason, 'dedicated-costume');
  for (const preset of PLAYER_APPEARANCE_PRESETS_V129) {
    equipPlayerAppearancePresetV129(save, { owner: 'coop', presetId: preset.id });
    savePlayerWardrobeOutfitV135(save, { owner: 'coop', slot: 1, name: preset.name });
    save.player.coopAppearanceV126 = normalizePlayerAppearanceV126();
    equipPlayerWardrobeOutfitV135(save, { owner: 'coop', slot: 1 });
    assert.equal(getPlayerAppearanceSelectedPresetV129(save.player.coopAppearanceV126).id, preset.id);
  }
});

test('clearing a personal cabinet preserves both prepared appearances and every other cabinet', () => {
  const save = fixture(); changedAppearance(save);
  savePlayerWardrobeOutfitV135(save, { slot: 1, name: 'Cargo' }); savePlayerWardrobeOutfitV135(save, { slot: 2, name: 'Pont' });
  savePlayerWardrobeOutfitV135(save, { owner: 'coop', slot: 1, name: 'Relève' });
  const before = clone(save), result = deletePlayerWardrobeOutfitV135(save, { slot: 1 });
  const expected = clone(before); expected.player.wardrobeV135.owners.player = expected.player.wardrobeV135.owners.player.filter(entry => entry.slot !== 1);
  assert.equal(result.changed, true); assert.deepEqual(save, expected);
  const after = clone(save); assert.equal(deletePlayerWardrobeOutfitV135(save, { slot: 1 }).changed, false); assert.deepEqual(save, after);
});

test('copying prepared pieces is independent in both directions and never copies a costume, loadout or cabinet', () => {
  for (const fromOwner of ['player', 'coop']) {
    const save = fixture(), toOwner = fromOwner === 'player' ? 'coop' : 'player';
    const selected = changedAppearance(save, fromOwner);
    savePlayerWardrobeOutfitV135(save, { owner: fromOwner, slot: 1, name: 'Source' });
    savePlayerWardrobeOutfitV135(save, { owner: toOwner, slot: 4, name: 'Destination' });
    const before = clone(save), result = copyPlayerAppearanceV135(save, { fromOwner, toOwner });
    const expected = clone(before); expected.player[field(toOwner)] = selected;
    assert.deepEqual(save, expected); assert.equal(result.cosmeticOnly, true);
    result.appearance.slots.helmet = null; save.player[field(fromOwner)].slots.helmet = null;
    assert.deepEqual(save.player[field(toOwner)], selected);
    assert.deepEqual(save.player.wardrobeV135, before.player.wardrobeV135);
  }
});

test('import sanitation rejects an entire invalid composition instead of replacing a foreign garment with a default', () => {
  const save = fixture(); changedAppearance(save); savePlayerWardrobeOutfitV135(save, { slot: 1, name: 'Valide' });
  const entry = clone(save.player.wardrobeV135.owners.player[0]);
  const malformed = [
    value => { value.schema = 135; }, value => { value.slots.torso = null; },
    value => { value.slots.helmet = '/assets/unknown.png'; }, value => { value.slots.arms = value.slots.legs; },
    value => { value.slots.back = 'equipment-008-rebreather'; }, value => { delete value.slots.legs; },
    value => { value.slots.armor = 999; }, value => { value.slots = []; }
  ];
  for (const corrupt of malformed) {
    const appearance = clone(entry.appearance); corrupt(appearance);
    const raw = { schema: 135, owners: { player: [{ ...entry, appearance }], coop: [] } };
    assert.deepEqual(normalizePlayerWardrobeV135(raw), defaultWardrobe());
  }
  const raw = { schema: 135, owners: { player: [
    { ...entry, slot: 0 }, { ...entry, slot: 5 }, { ...entry, slot: '1' }, { ...entry, name: '' }, { ...entry, name: 'x'.repeat(41) },
    { ...entry, name: '\u0000bad' }, { ...entry, image: '/no-image.png', armor: 999 }, { ...entry, name: 'Duplicate ignored' }
  ], coop: [{ ...entry, slot: 4 }], __proto__: [{ ...entry }] } };
  const normalized = normalizePlayerWardrobeV135(raw);
  assert.deepEqual(normalized.owners.player, [entry]); assert.equal(normalized.owners.coop.length, 1);
  assert.deepEqual(Object.keys(normalized.owners), ['player', 'coop']); assert.equal(Object.hasOwn(normalized.owners.player[0], 'image'), false);
});

test('invalid owners, names, cabinet numbers, sources and empty recalls reject atomically', () => {
  const save = fixture(), before = clone(save);
  for (const owner of ['squad', '__proto__', null]) {
    assert.throws(() => savePlayerWardrobeOutfitV135(save, { owner, slot: 1, name: 'Test' }));
    assert.throws(() => equipPlayerWardrobeOutfitV135(save, { owner, slot: 1 }));
    assert.throws(() => deletePlayerWardrobeOutfitV135(save, { owner, slot: 1 }));
    assert.throws(() => copyPlayerAppearanceV135(save, { fromOwner: 'player', toOwner: owner }));
  }
  for (const slot of [undefined, 0, 5, 1.5, '1', '__proto__']) {
    assert.throws(() => savePlayerWardrobeOutfitV135(save, { slot, name: 'Test' }));
    assert.throws(() => equipPlayerWardrobeOutfitV135(save, { slot }));
    assert.throws(() => deletePlayerWardrobeOutfitV135(save, { slot }));
  }
  for (const name of [undefined, 2, '', '   ', 'x'.repeat(41), '\u0000invalid']) assert.throws(() => savePlayerWardrobeOutfitV135(save, { slot: 1, name }));
  for (const fromOwner of ['player', 'squad', '__proto__']) assert.throws(() => copyPlayerAppearanceV135(save, { fromOwner, toOwner: 'player' }));
  assert.throws(() => equipPlayerWardrobeOutfitV135(save, { slot: 1 }), /aucune tenue/);
  assert.deepEqual(save, before);
  save.player.appearanceV126.slots.torso = null;
  assert.throws(() => savePlayerWardrobeOutfitV135(save, { slot: 1, name: 'Invalid parts' }));
  assert.throws(() => copyPlayerAppearanceV135(save, { fromOwner: 'player', toOwner: 'coop' }));
});

test('active operations and incomplete onboarding lock every mutation for both operators and preserve the frozen manifest', () => {
  for (const reason of ['operation', 'onboarding', 'creation']) {
    const save = fixture();
    for (const owner of ['player', 'coop']) savePlayerWardrobeOutfitV135(save, { owner, slot: 1, name: 'Service' });
    if (reason === 'operation') beginOperation(save, CAMPAIGNS[0], WORLDS[0]);
    if (reason === 'onboarding') save.onboardingV84 = { phase: 'tour' };
    if (reason === 'creation') save.needsPlayerCreationV84 = true;
    const before = clone(save);
    for (const owner of ['player', 'coop']) {
      assert.throws(() => savePlayerWardrobeOutfitV135(save, { owner, slot: 2, name: 'New' }), /verrouillées|accueil/);
      assert.throws(() => equipPlayerWardrobeOutfitV135(save, { owner, slot: 1 }), /verrouillées|accueil/);
      assert.throws(() => deletePlayerWardrobeOutfitV135(save, { owner, slot: 1 }), /verrouillées|accueil/);
      assert.throws(() => copyPlayerAppearanceV135(save, { fromOwner: owner === 'player' ? 'coop' : 'player', toOwner: owner }), /verrouillées|accueil/);
    }
    assert.deepEqual(save, before);
  }
});

test('both personal wardrobes round-trip through actual SaveSystem, with rollback on failed storage and profile isolation', () => {
  const records = new Map(); let reject = false;
  const storage = { getItem: key => records.get(key) ?? null, setItem(key, value) { if (reject) throw new Error('disk-full'); records.set(key, value); } };
  const system = new SaveSystem(storage); system.commit(fixture());
  const candidate = clone(system.data); changedAppearance(candidate); savePlayerWardrobeOutfitV135(candidate, { slot: 3, name: 'Quart A' });
  savePlayerWardrobeOutfitV135(candidate, { owner: 'coop', slot: 2, name: 'Quart B' });
  const active = clone(system.data), durable = records.get(system.key()); reject = true;
  assert.throws(() => system.commit({ player: candidate.player }), /Sauvegarde impossible/);
  assert.deepEqual(system.data, active); assert.equal(records.get(system.key()), durable);
  reject = false; system.commit({ player: candidate.player });
  const restored = new SaveSystem(storage); restored.load(1);
  assert.deepEqual(restored.data.player.wardrobeV135, candidate.player.wardrobeV135);
  restored.newGame(2); assert.deepEqual(restored.data.player.wardrobeV135, defaultWardrobe());
  restored.load(1); assert.deepEqual(restored.data.player.wardrobeV135, candidate.player.wardrobeV135);
});

test('recalling before deployment freezes the selected pieces; later live or cabinet edits cannot rewrite the operation', () => {
  const save = fixture(), selected = changedAppearance(save);
  savePlayerWardrobeOutfitV135(save, { slot: 1, name: 'Mission' });
  save.player.appearanceV126 = normalizePlayerAppearanceV126(); equipPlayerWardrobeOutfitV135(save, { slot: 1 });
  beginOperation(save, CAMPAIGNS[0], WORLDS[0]);
  save.player.appearanceV126 = normalizePlayerAppearanceV126(); save.player.wardrobeV135.owners.player[0].appearance.slots.helmet = null;
  const resumed = migrateSave(save), deployment = resolveOperationDeployment(resumed, catalog);
  assert.deepEqual(deployment.playerAppearanceV126, selected);
  assert.notDeepEqual(resumed.player.wardrobeV135.owners.player[0].appearance, selected);
});

test('native wardrobe controls expose four labelled editable cabinets, safe names and one explicit copy direction per owner', () => {
  const save = fixture(); savePlayerWardrobeOutfitV135(save, { slot: 1, name: '<img src=x onerror=1>' });
  const html = playerAppearancePanelHtmlV126(save);
  assert.match(html, /data-wardrobe-v135="player"/); assert.doesNotMatch(html, /<img src=x/); assert.match(html, /&lt;img src=x onerror=1&gt;/);
  assert.equal([...html.matchAll(/data-wardrobe-cabinet-v135="[1-4]"/g)].length, 4);
  assert.equal([...html.matchAll(/data-wardrobe-name-v135="[1-4]"/g)].length, 4);
  assert.match(html, /data-wardrobe-action-v135="copy"[^>]*data-wardrobe-owner-v135="player"[^>]*data-wardrobe-from-v135="coop"/);
  assert.match(html, /data-wardrobe-status-v135 role="status" aria-live="polite"/);
  const second = playerAppearancePanelHtmlV126(save, { owner: 'coop' });
  assert.match(second, /data-wardrobe-action-v135="copy"[^>]*data-wardrobe-owner-v135="coop"[^>]*data-wardrobe-from-v135="player"/);
  assert.doesNotMatch(second, /&lt;img src=x/);
  save.strategy.currentOperation = { id: 'active' };
  for (const [button] of playerAppearancePanelHtmlV126(save).matchAll(/<button[^>]*data-wardrobe-action-v135="[^"]+"[^>]*>/g)) assert.match(button, / disabled/);
  assert.equal(playerAppearanceUiModelV126(save).wardrobeLocked, true);
});
