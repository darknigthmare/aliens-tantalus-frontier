// V188 — player-facing source of a damage caption ("Impact : …").
// damagePlayer() callers pass either an enemy display name or an internal id
// (hazard kind, operation contact id, user-caste combat contract). Internal ids
// never reach the subtitle: known ones get a French label (English from the
// reviewed V185 catalog), any other identifier-shaped value reads "menace".
export const IMPACT_SOURCE_LABELS_V188 = Object.freeze({
  acid: 'acide', 'persistent-acid': 'acide', 'cluster-acid': 'acide', corrosive: 'corrosion', corrosion: 'corrosion',
  vacuum: 'vide', decompression: 'décompression', fall: 'chute',
  fire: 'feu', burn: 'feu', steam: 'vapeur', 'scald-knockback': 'vapeur',
  electrical: 'arc électrique', shock: 'arc électrique', radiation: 'radiations', irradiation: 'radiations',
  flood: 'inondation', drag: 'inondation', darkness: 'obscurité', obscurity: 'obscurité',
  toxic: 'toxines', toxicity: 'toxines', industrial: 'machinerie', machinery: 'machinerie',
  'c12-horde-contact': 'contact de la horde', 'ecosystem-contact-v131': 'contact', 'ecosystem-charge-v131': 'charge',
  'mecha-boss-charge': 'charge', 'mecha-boss-melee': 'contact', grenade: 'grenade'
});
const ID_SHAPE_V188 = /^[a-z0-9]+([-_:.][a-z0-9]+)*$/u;

export function impactSourceLabelV188(source) {
  const raw = String(source ?? '').trim();
  if (!raw) return 'menace';
  if (Object.hasOwn(IMPACT_SOURCE_LABELS_V188, raw)) return IMPACT_SOURCE_LABELS_V188[raw];
  // "<enemy name>:detonation" from the burster blast.
  const detonation = raw.match(/^(.+):detonation$/u);
  if (detonation) return `${impactSourceLabelV188(detonation[1])} (détonation)`;
  return ID_SHAPE_V188.test(raw) ? 'menace' : raw;
}

export function impactCaptionV188(source) {
  return `Impact : ${impactSourceLabelV188(source)}.`;
}

// Hazard entered ("Danger : …"): same labels as the damage source.
export function hazardCaptionV188(kind) {
  return `Danger : ${impactSourceLabelV188(kind)}.`;
}

// Weapon discharge caption: the ballistic family is an id (FAMILY_RULES keys).
export const SHOT_FAMILY_LABELS_V188 = Object.freeze({
  ballistic: 'tir balistique', smart: 'tir guidé', flame: 'tir incendiaire', explosive: 'tir explosif', electric: 'tir électrique',
  silent: 'tir silencieux', energy: 'tir à énergie', melee: 'frappe de mêlée', tool: 'outil en action', sonic: 'tir sonique',
  acid: 'tir acide', cryo: 'tir cryogénique', chemical: 'tir chimique', sentry: 'tir de tourelle'
});
export function weaponShotCaptionV188(name, family) {
  const label = Object.hasOwn(SHOT_FAMILY_LABELS_V188, family) ? SHOT_FAMILY_LABELS_V188[family] : 'tir';
  return `${String(name || 'Arme')} : ${label}.`;
}
