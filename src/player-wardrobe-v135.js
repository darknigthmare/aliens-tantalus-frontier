import { PLAYER_APPEARANCE_SLOTS_V126, getPlayerAppearanceItemV126,
  getPlayerAppearanceSelectionV126, normalizePlayerAppearanceV126 } from './player-appearance-v126.js';

const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const OWNERS = Object.freeze({ player: 'appearanceV126', coop: 'coopAppearanceV126' });
export const PLAYER_WARDROBE_CAPACITY_V135 = 4;
const validOwner = owner => Object.hasOwn(OWNERS, owner);
const validSlot = slot => Number.isInteger(slot) && slot >= 1 && slot <= PLAYER_WARDROBE_CAPACITY_V135;
const empty = () => ({ schema: 135, owners: { player: [], coop: [] } });

function outfitName(value) {
  if (typeof value !== 'string' || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) return null;
  const name = value.trim().replace(/\s+/g, ' ');
  return name && name.length <= 40 ? name : null;
}

/** A stored outfit is indivisible: a removed/foreign part cannot silently turn
 * into a standard garment, or become an arbitrary image/equipment reference.
 */
function admittedAppearance(value) {
  if (!record(value) || value.schema !== 126 || !record(value.slots)
    || Object.keys(value.slots).length !== PLAYER_APPEARANCE_SLOTS_V126.length) return null;
  for (const slot of PLAYER_APPEARANCE_SLOTS_V126) {
    if (!Object.hasOwn(value.slots, slot.id)) return null;
    const part = value.slots[slot.id];
    if (part === null ? !slot.optional : getPlayerAppearanceItemV126(part)?.slot !== slot.id) return null;
  }
  return normalizePlayerAppearanceV126(value);
}

/** Personal outfit references only; never costume unlocks or issued gear. */
export function normalizePlayerWardrobeV135(raw) {
  const result = empty();
  if (!record(raw) || raw.schema !== 135 || !record(raw.owners)) return result;
  for (const owner of Object.keys(OWNERS)) {
    const seen = new Set();
    for (const entry of (Array.isArray(raw.owners[owner]) ? raw.owners[owner] : []).slice(0, 32)) {
      if (!record(entry) || !validSlot(entry.slot) || seen.has(entry.slot)) continue;
      const name = outfitName(entry.name), appearance = admittedAppearance(entry.appearance);
      if (!name || !appearance) continue;
      seen.add(entry.slot); result.owners[owner].push({ slot: entry.slot, name, appearance });
    }
    result.owners[owner].sort((left, right) => left.slot - right.slot);
  }
  return result;
}

function requireAccess(save, owner) {
  if (!record(save?.player) || !validOwner(owner)) throw new Error('Opérateur inconnu.');
  if (save.strategy?.currentOperation) throw new Error('Opération active : les tenues personnelles sont verrouillées jusqu’au retour.');
  if (save.needsPlayerCreationV84 || save.onboardingV84 && save.onboardingV84.phase !== 'complete') {
    throw new Error('Terminez l’accueil du Tantalus avant de modifier les tenues personnelles.');
  }
}

export function getPlayerWardrobeModelV135(save, owner = 'player') {
  if (!validOwner(owner)) return [];
  const wardrobe = normalizePlayerWardrobeV135(save?.player?.wardrobeV135), selected = getPlayerAppearanceSelectionV126(save, owner);
  return Array.from({ length: PLAYER_WARDROBE_CAPACITY_V135 }, (_, index) => {
    const slot = index + 1, entry = wardrobe.owners[owner].find(outfit => outfit.slot === slot);
    return { slot, occupied: Boolean(entry), name: entry?.name || '',
      selected: Boolean(entry && PLAYER_APPEARANCE_SLOTS_V126.every(part => entry.appearance.slots[part.id] === selected.slots[part.id])) };
  });
}

/** Mutate a detached SaveSystem candidate; names and all six parts are stored
 * together. Saving replaces only the specified owner's specified cabinet.
 */
export function savePlayerWardrobeOutfitV135(save, { owner = 'player', slot, name } = {}) {
  requireAccess(save, owner);
  if (!validSlot(slot)) throw new Error('Casier personnel inconnu.');
  const admittedName = outfitName(name);
  if (!admittedName) throw new Error('Donnez à cette tenue un nom de 1 à 40 caractères.');
  const appearance = admittedAppearance(save.player[OWNERS[owner]]);
  if (!appearance) throw new Error('La tenue préparée doit contenir six pièces de catalogue valides.');
  const wardrobe = normalizePlayerWardrobeV135(save.player.wardrobeV135);
  const previous = wardrobe.owners[owner].find(entry => entry.slot === slot);
  const entry = { slot, name: admittedName, appearance };
  wardrobe.owners[owner] = [...wardrobe.owners[owner].filter(outfit => outfit.slot !== slot), entry].sort((left, right) => left.slot - right.slot);
  save.player.wardrobeV135 = wardrobe;
  return { owner, slot, name: admittedName, changed: JSON.stringify(previous) !== JSON.stringify(entry), cosmeticOnly: true };
}

export function equipPlayerWardrobeOutfitV135(save, { owner = 'player', slot } = {}) {
  requireAccess(save, owner);
  if (!validSlot(slot)) throw new Error('Casier personnel inconnu.');
  const entry = normalizePlayerWardrobeV135(save.player.wardrobeV135).owners[owner].find(outfit => outfit.slot === slot);
  if (!entry) throw new Error('Ce casier ne contient aucune tenue de catalogue valide.');
  save.player[OWNERS[owner]] = normalizePlayerAppearanceV126(entry.appearance);
  return { owner, slot, name: entry.name, appearance: normalizePlayerAppearanceV126(entry.appearance), cosmeticOnly: true };
}

export function deletePlayerWardrobeOutfitV135(save, { owner = 'player', slot } = {}) {
  requireAccess(save, owner);
  if (!validSlot(slot)) throw new Error('Casier personnel inconnu.');
  const wardrobe = normalizePlayerWardrobeV135(save.player.wardrobeV135), before = wardrobe.owners[owner].length;
  wardrobe.owners[owner] = wardrobe.owners[owner].filter(outfit => outfit.slot !== slot);
  const changed = before !== wardrobe.owners[owner].length;
  if (changed) save.player.wardrobeV135 = wardrobe;
  return { owner, slot, changed, cosmeticOnly: true };
}

/** Copy only already prepared cosmetic parts. The source operator, their
 * cabinet, current costume and every gameplay equipment field stay intact.
 */
export function copyPlayerAppearanceV135(save, { fromOwner, toOwner } = {}) {
  requireAccess(save, toOwner);
  if (!validOwner(fromOwner) || fromOwner === toOwner) throw new Error('Choisissez deux opérateurs distincts.');
  const appearance = admittedAppearance(save.player[OWNERS[fromOwner]]);
  if (!appearance) throw new Error('La tenue source ne contient pas six pièces de catalogue valides.');
  save.player[OWNERS[toOwner]] = appearance;
  return { fromOwner, toOwner, appearance: normalizePlayerAppearanceV126(appearance), cosmeticOnly: true };
}
