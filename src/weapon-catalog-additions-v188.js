/** V188 arsenal completion (spec 014): append-only franchise weapons promoted
 * from the V171 research index (P0/P1 rows). They have NO admitted native plaque:
 * the existing armory rule (no dedicated plaque => no procurement) keeps them
 * non-purchasable, and the held/hub renderers draw a named Canvas placeholder
 * slot instead of an image. Every number is original Tantalus gameplay tuning
 * marked [PROPOSÉ]; identities cite their source and none is certified 1:1.
 * Existing IDs, saves and numbering are untouched (new IDs start at 194; 191 stays a test-reserved unknown number).
 */
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
};
export const WEAPON_CATALOG_ADDITIONS_SCHEMA_V188 = 188;
const common = {
  provenance: 'licensed-reference-project-adaptation', mark: 'Standard', rarity: 'rare',
  canonExact: false, statsPolicy: 'v188-proposed-project-tuning-not-source-statistics',
  visualStatus: 'canvas-placeholder-native-plaque-required', referenceStatus: 'SOURCE_IDENTITY_NO_PLAQUE',
  plaqueStatus: 'missing', admissionV188: 'pending-plaque-not-purchasable'
};
export const WEAPON_CATALOG_ADDITIONS_V188 = freeze([
  {
    ...common,
    id: 'weapon-194-hicks-ithaca-37-shotgun', name: 'Hicks Ithaca 37 Shotgun', canonicalName: 'Ithaca 37 (Hicks, Aliens 1986)',
    family: 'ballistic', source: 'USCM', damage: 46, fireRate: 1.5, magazine: 4, reload: 2.6, penetration: 18,
    tags: ['shotgun', 'portable'], placeholderCategoryV188: 'shotgun', sourceWork: 'Aliens (1986)', appearances: ['Aliens (1986)'],
    researchId: 'proposed-hicks-ithaca-37-shotgun',
    sourceUrl: 'https://www.imfdb.org/wiki/Aliens',
    sourceRefs: ['https://www.imfdb.org/wiki/Ithaca_37_%22Stakeout%22', 'https://avp.fandom.com/wiki/File:Hicks%27_Shotgun_in_film_and_game.png'],
    identityEvidence: 'on-screen-film-prop-identified-by-secondary-firearm-database',
    identityVerified: false,
    sourceMechanism: 'pump-action-tube-magazine',
    description: 'Fusil à pompe de Hicks, Aliens (1986). Accessoire de tournage identifié comme Ithaca 37 raccourci par des bases secondaires (IMFDB, wiki AVP) ; Stakeout d’usine ou modèle long recoupé reste débattu. Alimentation tube et pompe documentées par le mécanisme réel ; capacité 4 et cadence [PROPOSÉ]. Aucune plaque native : silhouette Canvas provisoire.'
  },
  {
    ...common,
    id: 'weapon-195-sevastopol-pump-shotgun', name: 'Sevastopol Pump Shotgun', canonicalName: 'Shotgun (Alien: Isolation)',
    family: 'ballistic', source: 'Sevastopol', damage: 42, fireRate: 1.3, magazine: 4, reload: 2.8, penetration: 14,
    tags: ['shotgun', 'portable'], placeholderCategoryV188: 'shotgun', sourceWork: 'Alien: Isolation', appearances: ['Alien: Isolation'],
    researchId: 'proposed-model-37-12-gauge-pump-action', fidelityDossierId: 'proposed-model-37-12-gauge-pump-action',
    sourceUrl: 'https://www.feralinteractive.com/en/manuals/alienisolation/latest/steam/',
    sourceRefs: ['https://alienisolation.fandom.com/wiki/Items'],
    identityEvidence: 'first-party-manual-names-weapon-class-only',
    identityVerified: true,
    sourceMechanism: 'pump-action-tube-magazine',
    description: 'Fusil à pompe de Sevastopol, Alien: Isolation. Le manuel Feral nomme seulement la classe « Shotgun » ; la désignation « Model 37 12 Gauge » vient d’un wiki secondaire. Tube et pompe [À VÉRIFIER] ; capacité 4 [PROPOSÉ]. Aucune plaque native : silhouette Canvas provisoire.'
  },
  {
    ...common,
    id: 'weapon-196-sevastopol-flamethrower', name: 'Sevastopol Flamethrower', canonicalName: 'Flamethrower (Alien: Isolation)',
    family: 'flame', source: 'Sevastopol', damage: 30, fireRate: 9, magazine: 80, reload: 2.4, penetration: 0,
    tags: ['flame', 'portable'], placeholderCategoryV188: 'flame', sourceWork: 'Alien: Isolation', appearances: ['Alien: Isolation'],
    researchId: 'proposed-sevastopol-flamethrower', fidelityDossierId: 'proposed-sevastopol-flamethrower',
    sourceUrl: 'https://www.feralinteractive.com/en/manuals/alienisolation/latest/steam/',
    sourceRefs: ['https://alienisolation.fandom.com/wiki/Items'],
    identityEvidence: 'first-party-manual-names-weapon-class-only',
    identityVerified: true,
    sourceMechanism: 'fuel-canister-flame-jet',
    description: 'Lance-flammes de Sevastopol, Alien: Isolation (classe nommée par le manuel Feral). Réservoir de carburant, aucune douille ; 80 unités de carburant et débit [PROPOSÉ]. Aucune plaque native : silhouette Canvas provisoire.'
  }
]);
export const WEAPON_ADDITION_IDS_V188 = Object.freeze(WEAPON_CATALOG_ADDITIONS_V188.map(weapon => weapon.id));
export const isPendingPlaqueWeaponV188 = weapon =>
  WEAPON_ADDITION_IDS_V188.includes(typeof weapon === 'string' ? weapon : weapon?.id);
