const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const outfit = (slug, name, sourceCharacter, description, helmet = null, sourceWork = 'Alien: Isolation (2014)') => ({
  id: `outfit-${slug}-v165`, costumeId: `franchise-${slug}`, slug, name, label: name,
  description, sourceWork, sourceCharacter,
  collection: 'franchise-modular-v165', provenance: 'existing-game-art-outfit-adaptation',
  exact: false, cosmeticOnly: true, runtimeMode: 'separated-echo9-parts',
  slots: { helmet, mask: null, torso: `torso-${slug}-v165`,
    arms: `arms-${slug}-v165`, legs: `legs-${slug}-v165`, back: null }
});

/** Clothing worn by the existing operator. These original adaptations neither
 * replace Echo9 with a source character nor grant issued equipment/bonuses.
 * Their live representation uses separate pieces and the actual held weapon;
 * the independently generated full-body boards are reference previews only.
 */
export const PLAYER_COSTUME_OUTFITS_V165 = freeze([
  outfit('amanda-working', 'Tenue de travail · adaptation Amanda', 'Amanda Ripley',
    'Veste de travail ouverte, manches et pantalon utilitaire séparés ; tenue adaptée pour votre opérateur.'),
  outfit('working-joe-uniform', 'Maintenance Seegson · adaptation Working Joe', 'Working Joe',
    'Veste à bandes orange, manches et pantalon de maintenance séparés ; le visage de votre opérateur reste humain.'),
  outfit('sevastopol-security', 'Sécurité de station · adaptation Sevastopol', 'Sécurité de station',
    'Protection claire, manches et pantalon de service séparés, avec casque creux amovible.',
    'helmet-sevastopol-security-v165'),
  outfit('ripley-bomber', 'Blouson de vol · adaptation Ripley', 'Ripley',
    'Blouson court en nylon beige à bords côtelés, pantalon de vol bleu et chaussures en toile ; tenue adaptée sur votre opérateur.',
    null, 'Aliens (1986)'),
  outfit('bishop-utility', 'Combinaison utilitaire · adaptation Bishop', 'Bishop',
    'Haut et manches de travail bleus à poches plates, pantalon souple et chaussures simples ; le visage de votre opérateur reste humain.',
    null, 'Aliens (1986)'),
  outfit('fireteam-seegson-maintenance', 'Salopette Seegson · adaptation Fireteam', 'Technicien',
    'Bavette et bretelles gris ardoise sur manches orange, avec pantalon de travail souple ; adaptation du kit Frontier Freelancer.',
    null, 'Aliens: Fireteam Elite (2021)'),
  outfit('fireteam-nostromo-jacket', 'Veste Nostromo · adaptation Fireteam', 'Marine colonial',
    'Veste courte sombre à épaules matelassées et col clair, pantalon de travail gris et chaussures en toile ; adaptation du kit Nostromo Salvage.',
    null, 'Aliens: Fireteam Elite (2021)'),
  outfit('fireteam-flightsuit', 'Combinaison de vol · adaptation Fireteam', 'Marine colonial',
    'Combinaison anthracite à fermeture claire, manches retroussées, gants et chaussures de travail claires ; adaptation du kit Nostromo Salvage.',
    null, 'Aliens: Fireteam Elite (2021)')
]);

// These are the very same documented V129 clothes, not new skins or palette
// variants. Keep the historical preset IDs and six exact existing item IDs.
// Vasquez's smartgunner kit is intentionally not labelled as the later BDU.
export const PLAYER_COSTUME_LINKED_OUTFITS_V165 = freeze([
  { id: 'uscm-hicks-v129', costumeId: 'franchise-hicks-combat', slug: 'hicks-combat',
    name: 'Tenue de combat · adaptation Hicks', sourceWork: 'Aliens (1986)', sourceCharacter: 'Hicks',
    exact: false, cosmeticOnly: true, runtimeMode: 'separated-echo9-parts',
    provenance: 'existing-v129-documented-garments',
    slots: { helmet: 'helmet-hicks-v129', mask: null, torso: 'torso-hicks-v129',
      arms: 'arms-uscm-v129', legs: 'legs-uscm-v129', back: 'back-hicks-scabbard-v129' } },
  { id: 'uscm-hudson-v129', costumeId: 'franchise-hudson-combat', slug: 'hudson-combat',
    name: 'Tenue de combat · adaptation Hudson', sourceWork: 'Aliens (1986)', sourceCharacter: 'Hudson',
    exact: false, cosmeticOnly: true, runtimeMode: 'separated-echo9-parts',
    provenance: 'existing-v129-documented-garments',
    slots: { helmet: 'helmet-hudson-v129', mask: null, torso: 'torso-hudson-v129',
      arms: 'arms-uscm-v129', legs: 'legs-uscm-v129', back: 'back-shoulder-lamp-v129' } }
]);
export const PLAYER_COSTUME_EQUIPPABLE_OUTFITS_V165 = freeze([
  ...PLAYER_COSTUME_OUTFITS_V165, ...PLAYER_COSTUME_LINKED_OUTFITS_V165
]);
const byCostume = new Map(PLAYER_COSTUME_EQUIPPABLE_OUTFITS_V165.map(entry => [entry.costumeId, entry]));
export const getCostumeOutfitV165 = costumeId => byCostume.get(costumeId) || null;

const labels = { torso: 'Haut', arms: 'Manches et gants', legs: 'Pantalon et bottes', helmet: 'Casque creux' };
export const COSTUME_APPEARANCE_ITEMS_V165 = freeze(PLAYER_COSTUME_OUTFITS_V165.flatMap(entry =>
  Object.entries(entry.slots).filter(([,id]) => id !== null).map(([slot,id]) => ({
    id, slot, name: `${labels[slot]} · ${entry.name}`, label: `${labels[slot]} · ${entry.name}`,
    description: entry.description, rigType: 'echo9', cosmeticOnly: true, exact: false,
    collection: entry.collection, sourceWork: entry.sourceWork,
    sourceCharacter: entry.sourceCharacter, provenance: entry.provenance
  }))));
export const COSTUME_APPEARANCE_PRESETS_V165 = freeze(PLAYER_COSTUME_OUTFITS_V165.map(entry => ({
  id: entry.id, name: entry.name, label: entry.label, description: entry.description,
  sourceWork: entry.sourceWork, sourceCharacter: entry.sourceCharacter,
  collection: entry.collection, cosmeticOnly: true, provenance: entry.provenance,
  exact: false, slots: entry.slots
})));

/** Called inside SaveSystem's detached cosmetic transaction. An old costume
 * returns null and retains all historical appearance behavior. A new outfit
 * publishes its six slots together; no resource/weapon/armour field is read
 * or changed. Individual pieces remain customizable through the existing UI.
 */
export function applyCostumeOutfitV165(save, costumeId) {
  const selected = getCostumeOutfitV165(costumeId);
  if (!selected) return null;
  if (!save?.player) throw new Error('Opérateur inconnu.');
  if (save.strategy?.currentOperation) throw new Error('Opération active : la tenue de déploiement est verrouillée.');
  const appearance = { schema: 126, slots: { ...selected.slots } };
  save.player.appearanceV126 = appearance;
  save.player.costumeId = selected.costumeId;
  return { costumeId: selected.costumeId, outfitId: selected.id,
    appearance: { schema: 126, slots: { ...appearance.slots } }, cosmeticOnly: true };
}
