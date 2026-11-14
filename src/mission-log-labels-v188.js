// V188 — player-facing words for mission-log and squad HUD values that the
// runtime carries as identifiers (squad support actions, zone biomes). French
// labels; English comes from the reviewed V185 catalog through the live
// canvas/DOM translation layer. Unknown identifiers never reach the screen raw.
export const SQUAD_ACTION_LABELS_V188 = Object.freeze({
  'cohesion-aura': 'cohésion', 'combat-medicine': 'soins de combat', 'command-aura': 'commandement',
  'demolition-round': 'charge de démolition', 'field-repair': 'réparation', 'hazard-guard': 'protection environnementale',
  'recon-pulse': 'impulsion de reconnaissance', 'signal-disruption': 'brouillage', 'smartgun-burst': 'rafale smartgun',
  'suppressive-fire': 'tir de suppression', 'threat-analysis': 'analyse de menace', 'vehicle-gunnery': 'tourelle du véhicule',
  'vehicle-repair': 'réparation du véhicule', support: 'soutien'
});
export const BIOME_LABELS_V188 = Object.freeze({
  industrial: 'industriel', industriel: 'industriel', ruins: 'ruines', jungle: 'jungle', foundry: 'fonderie', caverns: 'cavernes',
  orbital: 'orbital', oceanic: 'océanique', mines: 'mines', colony: 'colonie', shipyard: 'chantier naval', habitation: 'habitat',
  cryogenic: 'cryogénie', reactor: 'réacteur', laboratory: 'laboratoire', badlands: 'terres arides', hive: 'ruche', ruche: 'ruche',
  vacuum: 'vide spatial', quarantaine: 'quarantaine'
});
const ID_SHAPE_V188 = /^[a-z0-9]+([-_][a-z0-9]+)*$/u;

export function squadActionLabelV188(action) {
  const raw = String(action ?? '').trim();
  if (Object.hasOwn(SQUAD_ACTION_LABELS_V188, raw)) return SQUAD_ACTION_LABELS_V188[raw];
  return !raw || ID_SHAPE_V188.test(raw) ? 'soutien' : raw;
}

export function biomeLabelV188(biome) {
  const raw = String(biome ?? '').trim();
  if (Object.hasOwn(BIOME_LABELS_V188, raw.toLowerCase())) return BIOME_LABELS_V188[raw.toLowerCase()];
  return !raw || ID_SHAPE_V188.test(raw) ? 'secteur' : raw;
}
