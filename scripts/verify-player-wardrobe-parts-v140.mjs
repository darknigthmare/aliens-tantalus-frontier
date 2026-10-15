import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultSave, migrateSave, SaveSystem, beginOperation, resolveOperationDeployment } from '../src/save.js';
import { CAMPAIGNS, WORLDS, CREW, WEAPONS, EQUIPMENT, VEHICLES, COSTUMES } from '../src/content.js';
import { PLAYER_APPEARANCE_SLOTS_V126, normalizePlayerAppearanceV126, equipPlayerAppearancePresetV129,
  equipPlayerAppearanceV126, getPlayerAppearanceSelectedPresetV129 } from '../src/player-appearance-v126.js';
import { getPlayerWardrobeModelV135, savePlayerWardrobeOutfitV135,
  equipPlayerWardrobeOutfitV135, equipPlayerWardrobePartsV140 } from '../src/player-wardrobe-v135.js';
import { playerAppearanceUiModelV126, playerAppearancePanelHtmlV126 } from '../src/player-appearance-ui-v126.js';

const clone = value => structuredClone(value);
const field = owner => owner === 'coop' ? 'coopAppearanceV126' : 'appearanceV126';
const catalog = { crewCatalog: CREW, weaponCatalog: WEAPONS, equipmentCatalog: EQUIPMENT, vehicleCatalog: VEHICLES, costumeCatalog: COSTUMES };
function fixture(owner = 'player') {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.onboardingV84 = null;
  equipPlayerAppearancePresetV129(save, { owner, presetId: 'uscm-hicks-v129' });
  equipPlayerAppearanceV126(save, { owner, slot: 'helmet', itemId: null });
  equipPlayerAppearanceV126(save, { owner, slot: 'mask', itemId: 'mask-rebreather-v126' });
  equipPlayerAppearanceV126(save, { owner, slot: 'back', itemId: null });
  savePlayerWardrobeOutfitV135(save, { owner, slot: 2, name: 'Quart cargo' });
  save.player[field(owner)] = normalizePlayerAppearanceV126();
  return save;
}

test('one, several and all saved pieces can be reused on either operator while every other field stays intact', () => {
  for (const owner of ['player', 'coop']) for (const parts of [['mask'], ['helmet', 'back'], ['arms', 'torso', 'legs'], PLAYER_APPEARANCE_SLOTS_V126.map(part => part.id)]) {
    const save = fixture(owner), before = clone(save), source = save.player.wardrobeV135.owners[owner][0].appearance;
    const result = equipPlayerWardrobePartsV140(save, { owner, slot: 2, parts });
    const expected = clone(before);
    for (const part of parts) expected.player[field(owner)].slots[part] = source.slots[part];
    assert.deepEqual(save, expected); assert.equal(result.cosmeticOnly, true);
    assert.deepEqual(new Set(result.parts), new Set(parts));
    result.appearance.slots.torso = 'mutated-return'; result.parts.push('weapon');
    assert.deepEqual(save, expected);
  }
});

test('optional empty choices remove only the selected saved pieces and a repeated recall is explicit about its lack of changes', () => {
  const save = fixture();
  const first = equipPlayerWardrobePartsV140(save, { slot: 2, parts: ['back', 'helmet'] });
  assert.deepEqual(first.parts, ['helmet', 'back']); assert.deepEqual(first.changedParts, ['helmet', 'back']);
  assert.equal(save.player.appearanceV126.slots.helmet, null); assert.equal(save.player.appearanceV126.slots.back, null);
  assert.equal(save.player.appearanceV126.slots.mask, null, 'Unchecked respirator is not copied.');
  const before = clone(save);
  assert.deepEqual(equipPlayerWardrobePartsV140(save, { slot: 2, parts: ['helmet', 'back'] }).changedParts, []);
  assert.deepEqual(save, before);
});

test('a partial film outfit is honestly composed until all six actual slots match its preset', () => {
  const save = fixture(); equipPlayerAppearancePresetV129(save, { presetId: 'uscm-hudson-v129' });
  savePlayerWardrobeOutfitV135(save, { slot: 1, name: 'Hudson' });
  save.player.appearanceV126 = normalizePlayerAppearanceV126();
  equipPlayerWardrobePartsV140(save, { slot: 1, parts: ['helmet', 'torso'] });
  assert.equal(getPlayerAppearanceSelectedPresetV129(save.player.appearanceV126), null);
  equipPlayerWardrobePartsV140(save, { slot: 1, parts: ['arms', 'legs', 'mask', 'back'] });
  assert.equal(getPlayerAppearanceSelectedPresetV129(save.player.appearanceV126)?.id, 'uscm-hudson-v129');
  const before = clone(save); save.player.appearanceV126 = normalizePlayerAppearanceV126();
  equipPlayerWardrobeOutfitV135(save, { slot: 1 }); assert.deepEqual(save, before);
});

test('malformed piece requests, missing cabinets and invalid imported compositions cannot partly change any operator', () => {
  const save = fixture(), before = clone(save);
  for (const parts of [undefined, null, [], 'helmet', {}, ['helmet', 'helmet'], ['helmet', 'weapon'], ['helmet', null], ['__proto__'], Array(1), Array(7).fill('helmet')]) {
    assert.throws(() => equipPlayerWardrobePartsV140(save, { slot: 2, parts })); assert.deepEqual(save, before);
  }
  for (const owner of [null, 'squad', '__proto__']) {
    assert.throws(() => equipPlayerWardrobePartsV140(save, { owner, slot: 2, parts: ['helmet'] })); assert.deepEqual(save, before);
  }
  for (const slot of [undefined, 0, 5, '2', 1.5, 1]) {
    assert.throws(() => equipPlayerWardrobePartsV140(save, { slot, parts: ['helmet'] })); assert.deepEqual(save, before);
  }
  save.player.appearanceV126.slots.legs = 'foreign-current-legs';
  const invalidCurrent = clone(save);
  assert.throws(() => equipPlayerWardrobePartsV140(save, { slot: 2, parts: ['helmet'] }), /tenue préparée/);
  assert.deepEqual(save, invalidCurrent, 'Unselected malformed live parts cannot be silently replaced.');
  save.player.appearanceV126 = normalizePlayerAppearanceV126();
  save.player.wardrobeV135.owners.player[0].appearance.slots.legs = 'foreign-legs';
  const malformed = clone(save);
  assert.throws(() => equipPlayerWardrobePartsV140(save, { slot: 2, parts: ['helmet'] }), /aucune tenue/);
  assert.deepEqual(save, malformed, 'An invalid unselected saved part still rejects the indivisible cabinet.');
});

test('operation and onboarding locks reject partial recall before touching selected pieces or the frozen operation', () => {
  for (const owner of ['player', 'coop']) for (const reason of ['operation', 'onboarding', 'creation']) {
    const save = fixture(owner);
    if (reason === 'operation') beginOperation(save, CAMPAIGNS[0], WORLDS[0]);
    if (reason === 'onboarding') save.onboardingV84 = { phase: 'tour' };
    if (reason === 'creation') save.needsPlayerCreationV84 = true;
    const before = clone(save);
    assert.throws(() => equipPlayerWardrobePartsV140(save, { owner, slot: 2, parts: ['helmet', 'torso'] }), /verrouillées|accueil/);
    assert.deepEqual(save, before);
  }
});

test('a failed real SaveSystem commit keeps the previous mix and durable cabinet; reload and import preserve the admitted mix', () => {
  const records = new Map(); let reject = false;
  const storage = { getItem: key => records.get(key) ?? null, setItem(key, value) { if (reject) throw new Error('disk-full'); records.set(key, value); } };
  const system = new SaveSystem(storage); system.commit(fixture());
  const candidate = clone(system.data); equipPlayerWardrobePartsV140(candidate, { slot: 2, parts: ['mask', 'torso', 'back'] });
  const before = clone(system.data), durable = records.get(system.key()); reject = true;
  assert.throws(() => system.commit({ player: candidate.player }), /Sauvegarde impossible/);
  assert.deepEqual(system.data, before); assert.equal(records.get(system.key()), durable);
  reject = false; system.commit({ player: candidate.player });
  const restored = new SaveSystem(storage); restored.load(1);
  assert.deepEqual(restored.data.player.appearanceV126, candidate.player.appearanceV126);
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(restored.data))).player.wardrobeV135, before.player.wardrobeV135);
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(restored.data))).player.appearanceV126, candidate.player.appearanceV126);
});

test('the deployed mix is frozen independently from later saved and cabinet edits', () => {
  const save = fixture(); equipPlayerWardrobePartsV140(save, { slot: 2, parts: ['mask', 'torso', 'back'] });
  const selected = clone(save.player.appearanceV126);
  beginOperation(save, CAMPAIGNS[0], WORLDS[0]);
  save.player.appearanceV126 = normalizePlayerAppearanceV126();
  save.player.wardrobeV135.owners.player[0].appearance.slots.torso = 'torso-utility-v126';
  assert.deepEqual(resolveOperationDeployment(migrateSave(save), catalog).playerAppearanceV126, selected);
});

test('native partial-recall controls identify actual saved pieces, empty options, current matches and locking without changing the model source', () => {
  const save = fixture(), before = clone(save), model = getPlayerWardrobeModelV135(save);
  const saved = model[1]; assert.equal(saved.parts.length, 6); assert.equal(saved.parts[0].name, 'Tête nue');
  assert.equal(saved.parts.find(part => part.id === 'mask').name, 'Masque respirateur');
  assert.equal(saved.parts.find(part => part.id === 'back').name, 'Sans paquetage');
  assert.equal(saved.parts.find(part => part.id === 'mask').selected, false); assert.deepEqual(save, before);
  const html = playerAppearancePanelHtmlV126(save);
  assert.equal([...html.matchAll(/type="checkbox" data-wardrobe-parts-v140="2"/g)].length, 6);
  assert.equal([...html.matchAll(/data-wardrobe-action-v135="equip-parts"/g)].length, 1);
  assert.match(html, /<legend>Pièces à rappeler du casier 2 de J1<\/legend>/);
  assert.match(html, /<label><input[^>]+value="helmet"><span>Casque : Tête nue<\/span><\/label>/);
  assert.match(html, /aria-describedby="appearance-wardrobe-help-player-2-v140"/);
  assert.doesNotMatch(html, /type="checkbox"[^>]* checked/);
  save.player.costumeId = 'franchise-nostromo-crew';
  assert.equal(playerAppearanceUiModelV126(save).reason, 'dedicated-costume');
  save.strategy.currentOperation = { id: 'active' };
  const locked = playerAppearancePanelHtmlV126(save);
  assert.match(locked, /<fieldset[^>]* disabled>/);
  assert.match(locked, /<button[^>]*data-wardrobe-action-v135="equip-parts"[^>]* disabled>/);
});
