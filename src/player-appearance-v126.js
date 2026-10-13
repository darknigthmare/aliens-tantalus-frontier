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
const filmItem = (id, slot, name, description) => ({
  ...item(id, slot, name, description), collection: 'aliens-1986',
  sourceWork: 'Aliens (1986)', provenance: 'film-reference-adaptation', exact: false
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
  item('back-radio-v126', 'back', 'Radio compacte', 'Paquetage radio cosmétique ; aucun nouvel outil utilisable.'),
  filmItem('helmet-uscm-v129', 'helmet', 'Casque USCM', 'Casque ouvert des Marines coloniaux du film.'),
  filmItem('helmet-hicks-v129', 'helmet', 'Casque de Hicks', 'Casque de combat d’après l’équipement de Hicks.'),
  filmItem('helmet-hudson-v129', 'helmet', 'Casque de Hudson', 'Casque de combat d’après l’équipement de Hudson.'),
  filmItem('headband-vasquez-v129', 'helmet', 'Bandeau de Vasquez', 'Bandeau rouge porté avec la tenue de smartgunner.'),
  filmItem('torso-uscm-v129', 'torso', 'Armure USCM', 'Armure de combat portée sur le treillis colonial.'),
  filmItem('torso-hicks-v129', 'torso', 'Plastron de Hicks', 'Plastron personnalisé d’après la tenue de Hicks.'),
  filmItem('torso-hudson-v129', 'torso', 'Plastron de Hudson', 'Plastron personnalisé d’après la tenue de Hudson.'),
  filmItem('torso-smartgunner-v129', 'torso', 'Haut de smartgunner', 'Tenue sans manches et fixation du harnais de Vasquez.'),
  filmItem('arms-uscm-v129', 'arms', 'Bras USCM', 'Bras de la tenue de combat coloniale.'),
  filmItem('arms-smartgunner-v129', 'arms', 'Bras de smartgunner', 'Bras découverts de la tenue de smartgunner.'),
  filmItem('legs-uscm-v129', 'legs', 'Treillis USCM', 'Pantalon camouflage, protections et bottes de combat.'),
  filmItem('legs-smartgunner-v129', 'legs', 'Treillis de smartgunner', 'Pantalon et bottes d’après l’équipement de Vasquez.'),
  filmItem('back-shoulder-lamp-v129', 'back', 'Lampe d’épaule USCM', 'Lampe et support dorsal de la tenue coloniale.'),
  filmItem('back-hicks-scabbard-v129', 'back', 'Fourreau de Hicks', 'Fourreau dorsal d’après la tenue de Hicks ; apparence du paquetage.'),
  filmItem('back-smartgun-harness-v129', 'back', 'Harnais de smartgunner', 'Support dorsal d’après l’équipement de Vasquez ; apparence du paquetage.')
]);

const SLOT_BY_ID = new Map(PLAYER_APPEARANCE_SLOTS_V126.map(slot => [slot.id, slot]));
const ITEM_BY_ID = new Map(PLAYER_APPEARANCE_ITEMS_V126.map(entry => [entry.id, entry]));
const OWNER_FIELDS = freeze({ player: 'appearanceV126', coop: 'coopAppearanceV126' });
export const getPlayerAppearanceItemV126 = id => ITEM_BY_ID.get(id) || null;

const filmPreset = (id, name, description, character, slots) => ({
  id, name, label: name, description, sourceWork: 'Aliens (1986)',
  sourceCharacter: character, collection: 'aliens-1986',
  cosmeticOnly: true, provenance: 'film-reference-adaptation', exact: false,
  slots
});

/** A preset is only a complete selection of the same six cosmetic slots. It
 * never replaces the operator, their dedicated costume or their issued gear.
 * No preset ID is stored in the profile: mixing one piece stays a valid outfit
 * and older selections retain their exact V126 IDs after catalogue expansion.
 */
export const PLAYER_APPEARANCE_PRESETS_V129 = freeze([
  filmPreset('uscm-infantry-v129', 'Infanterie LV-426',
    'Casque, armure, treillis et lampe d’épaule de l’infanterie coloniale.', 'Marines coloniaux', {
      helmet: 'helmet-uscm-v129', mask: null, torso: 'torso-uscm-v129',
      arms: 'arms-uscm-v129', legs: 'legs-uscm-v129', back: 'back-shoulder-lamp-v129'
    }),
  filmPreset('uscm-hicks-v129', 'Équipement Hicks',
    'Casque et plastron de Hicks, avec son fourreau dorsal.', 'Hicks', {
      helmet: 'helmet-hicks-v129', mask: null, torso: 'torso-hicks-v129',
      arms: 'arms-uscm-v129', legs: 'legs-uscm-v129', back: 'back-hicks-scabbard-v129'
    }),
  filmPreset('uscm-hudson-v129', 'Équipement Hudson',
    'Casque et plastron de Hudson, avec la lampe d’épaule coloniale.', 'Hudson', {
      helmet: 'helmet-hudson-v129', mask: null, torso: 'torso-hudson-v129',
      arms: 'arms-uscm-v129', legs: 'legs-uscm-v129', back: 'back-shoulder-lamp-v129'
    }),
  filmPreset('uscm-smartgunner-v129', 'Équipement Vasquez',
    'Bandeau rouge, bras découverts, treillis et harnais de smartgunner.', 'Vasquez', {
      helmet: 'headband-vasquez-v129', mask: null, torso: 'torso-smartgunner-v129',
      arms: 'arms-smartgunner-v129', legs: 'legs-smartgunner-v129', back: 'back-smartgun-harness-v129'
    })
]);
const PRESET_BY_ID_V129 = new Map(PLAYER_APPEARANCE_PRESETS_V129.map(preset => [preset.id, preset]));
export const getPlayerAppearancePresetV129 = id => PRESET_BY_ID_V129.get(id) || null;

/** Exact six-slot matching is derived without changing the saved selection.
 * A hand-composed outfit may match a preset; editing any slot clears its badge.
 */
export function getPlayerAppearanceSelectedPresetV129(appearance) {
  const selected = normalizePlayerAppearanceV126(appearance);
  return PLAYER_APPEARANCE_PRESETS_V129.find(preset => PLAYER_APPEARANCE_SLOTS_V126
    .every(slot => preset.slots[slot.id] === selected.slots[slot.id])) || null;
}

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

/** Prepare all six parts before assigning the selected owner's appearance.
 * SaveSystem remains responsible for committing the candidate player record.
 */
export function equipPlayerAppearancePresetV129(save, { owner = 'player', presetId } = {}) {
  if (save?.strategy?.currentOperation) throw new Error('Opération active : la tenue de déploiement est verrouillée.');
  if (!save?.player || !Object.hasOwn(OWNER_FIELDS, owner)) throw new Error('Opérateur inconnu.');
  const preset = getPlayerAppearancePresetV129(presetId);
  if (!preset) throw new Error('Tenue d’apparence inconnue.');
  const appearance = normalizePlayerAppearanceV126({ schema: 126, slots: preset.slots });
  save.player[OWNER_FIELDS[owner]] = appearance;
  return { owner, presetId, appearance: normalizePlayerAppearanceV126(appearance), cosmeticOnly: true };
}

export function resetPlayerAppearanceV126(save, owner = 'player') {
  if (save?.strategy?.currentOperation) throw new Error('Opération active : la tenue de déploiement est verrouillée.');
  if (!save?.player || !Object.hasOwn(OWNER_FIELDS, owner)) throw new Error('Opérateur inconnu.');
  const appearance = normalizePlayerAppearanceV126();
  save.player[OWNER_FIELDS[owner]] = appearance;
  return { owner, appearance: normalizePlayerAppearanceV126(appearance), cosmeticOnly: true };
}
