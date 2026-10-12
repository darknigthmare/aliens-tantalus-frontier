const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const isRecord = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));

/** Cosmetic issue for the separated Echo9 body. These IDs identify authored
 * clothing parts, never inventory items, armour protection or usable tools.
 * The art registry maps the same exact IDs to its reviewed images. Keeping
 * selection here independent of images makes saves deterministic even while
 * an atlas is loading or unavailable.
 */
export const PLAYER_APPEARANCE_SLOTS_V126 = freeze([
  { id: 'helmet', label: 'Casque', optional: true, emptyLabel: 'Tête nue', defaultItemId: 'helmet-marine-v126' },
  { id: 'mask', label: 'Visage', optional: true, emptyLabel: 'Sans masque', defaultItemId: null },
  { id: 'torso', label: 'Haut', optional: false, defaultItemId: 'torso-marine-v126' },
  { id: 'arms', label: 'Bras', optional: false, defaultItemId: 'arms-marine-v126' },
  { id: 'legs', label: 'Jambes', optional: false, defaultItemId: 'legs-marine-v126' },
  { id: 'back', label: 'Dos et sac', optional: true, emptyLabel: 'Sans paquetage', defaultItemId: 'back-field-pack-v126' }
]);

const item = (id, slot, name, description) => ({
  id, slot, name, label: name, description,
  cosmeticOnly: true, provenance: 'project-adaptation', rigType: 'echo9'
});
export const PLAYER_APPEARANCE_ITEMS_V126 = freeze([
  item('helmet-marine-v126', 'helmet', 'Casque Marine', 'Casque ouvert de la tenue de terrain.'),
  item('helmet-patrol-v126', 'helmet', 'Casque de reconnaissance', 'Casque ouvert au profil allégé.'),
  item('mask-rebreather-v126', 'mask', 'Masque respirateur', 'Pièce de visage cosmétique ; aucun effet respiratoire.'),
  item('torso-marine-v126', 'torso', 'Plastron Marine', 'Plastron et sous-vêtement de terrain.'),
  item('torso-utility-v126', 'torso', 'Veste de travail', 'Haut utilitaire pour les équipes techniques.'),
  item('arms-marine-v126', 'arms', 'Manches Marine', 'Bras protégés et gants de terrain.'),
  item('arms-utility-v126', 'arms', 'Manches de travail', 'Manches utilitaires et gants de travail.'),
  item('legs-marine-v126', 'legs', 'Jambières Marine', 'Pantalon de terrain, protections et bottes.'),
  item('legs-utility-v126', 'legs', 'Pantalon de travail', 'Pantalon utilitaire et bottes de travail.'),
  item('back-field-pack-v126', 'back', 'Sac de terrain', 'Paquetage de la tenue Marine ; aucun stock supplémentaire.'),
  item('back-radio-v126', 'back', 'Radio compacte', 'Paquetage radio cosmétique ; aucun nouvel outil utilisable.')
]);

const SLOT_BY_ID = new Map(PLAYER_APPEARANCE_SLOTS_V126.map(slot => [slot.id, slot]));
const ITEM_BY_ID = new Map(PLAYER_APPEARANCE_ITEMS_V126.map(entry => [entry.id, entry]));
const OWNER_FIELDS = freeze({ player: 'appearanceV126', coop: 'coopAppearanceV126' });
export const getPlayerAppearanceItemV126 = id => ITEM_BY_ID.get(id) || null;

/** Unknown IDs, another slot's item, malformed records and unsupported schema
 * versions restore only the affected slot to its declared standard part.
 * There is no modulo lookup, arbitrary asset path or mutable catalogue alias.
 */
export function normalizePlayerAppearanceV126(raw) {
  const slots = raw?.schema === 126 && isRecord(raw.slots) ? raw.slots : {};
  return { schema: 126, slots: Object.fromEntries(PLAYER_APPEARANCE_SLOTS_V126.map(slot => {
    const selected = Object.hasOwn(slots, slot.id) ? slots[slot.id] : undefined;
    const admitted = ITEM_BY_ID.get(selected);
    return [slot.id, selected === null && slot.optional ? null
      : admitted?.slot === slot.id ? admitted.id : slot.defaultItemId];
  })) };
}

export function getPlayerAppearanceSelectionV126(save, owner = 'player') {
  return normalizePlayerAppearanceV126(save?.player?.[OWNER_FIELDS[owner]]);
}

/** The UI commits this reversible, cosmetic-only selection through SaveSystem.
 * No equipment IDs, personal gear, charges, armour stats or currency change.
 */
export function equipPlayerAppearanceV126(save, { owner = 'player', slot, itemId } = {}) {
  if (save?.strategy?.currentOperation) throw new Error('Opération active : la tenue de déploiement est verrouillée.');
  if (!save?.player || !Object.hasOwn(OWNER_FIELDS, owner)) throw new Error('Opérateur inconnu.');
  const definition = SLOT_BY_ID.get(slot);
  if (!definition) throw new Error('Emplacement d’apparence inconnu.');
  if (itemId === null ? !definition.optional : ITEM_BY_ID.get(itemId)?.slot !== slot)
    throw new Error('Cette pièce ne correspond pas à cet emplacement.');
  const appearance = getPlayerAppearanceSelectionV126(save, owner);
  appearance.slots[slot] = itemId;
  save.player[OWNER_FIELDS[owner]] = appearance;
  return { owner, slot, itemId, appearance: normalizePlayerAppearanceV126(appearance), cosmeticOnly: true };
}

export function resetPlayerAppearanceV126(save, owner = 'player') {
  if (save?.strategy?.currentOperation) throw new Error('Opération active : la tenue de déploiement est verrouillée.');
  if (!save?.player || !Object.hasOwn(OWNER_FIELDS, owner)) throw new Error('Opérateur inconnu.');
  const appearance = normalizePlayerAppearanceV126();
  save.player[OWNER_FIELDS[owner]] = appearance;
  return { owner, appearance: normalizePlayerAppearanceV126(appearance), cosmeticOnly: true };
}
