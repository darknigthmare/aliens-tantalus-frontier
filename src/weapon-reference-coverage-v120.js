import { WEAPONS } from './content-core-v50.js';
import { resolveWeaponVisualProfileV61 } from './weapon-visual-runtime-v61.js';
import { resolveWeaponVisualProfileV63 } from './weapon-visual-runtime-v63.js';
import { resolveNativeWeaponProfileV120 } from './weapon-native-visuals-v120.js';

const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const item of Object.values(value)) freeze(item);
  return Object.freeze(value);
};

/** This registry describes the actual saved catalogue; it adds neither weapons
 * nor stats. A finish is not a distinct model, and a URL is not a fidelity test. */
export const WEAPON_REFERENCE_SOURCES_V120 = freeze({
  'afe-official-notes': {
    url: 'https://www.aliensfireteamelite.com/en/releasenotes/',
    label: 'Cold Iron Studios — notes officielles Aliens: Fireteam Elite',
    work: 'Aliens: Fireteam Elite', authority: 'official-developer',
    checkedAt: '2026-10-03', scope: 'named-identity-only',
    caveat: 'Un nom dans les notes confirme son existence, pas sa géométrie, ses dimensions ou une fidélité visuelle 1:1.'
  },
  'vp70-production-prop': {
    url: 'https://propstore.com/product/aliens-1986/lot-32-vp70m-sidearm-pistol/',
    imageUrl: 'https://images.propstore.com/548573f46fb8d465bbfdbd8b6f2dfcc6-1.jpg',
    label: 'Propstore, lot 32 / stock 149307 — VP70M de tournage',
    work: 'Aliens (1986)', authority: 'production-artifact-holder',
    checkedAt: '2026-10-03', scope: 'production-prop-visual',
    caveat: 'La plaque générée est une reconstruction de ce spécimen après désactivation, pas une photographie ni une certification de chaque détail.'
  },
  'sentry-production-prop': {
    url: 'https://propstore.com/the-prop-store-collection/aliens/sentry-gun/',
    label: 'Propstore Collection — Sentry Gun de tournage',
    work: 'Aliens (1986)', authority: 'production-artifact-holder',
    checkedAt: '2026-10-03', scope: 'production-prop-visual',
    caveat: 'Le spécimen conservé a perdu sa caméra supérieure après tournage. La plaque fixe est admise après compositing sur quatre fonds ; les détails et la géométrie finale filmée ne sont pas certifiés 1:1.'
  },
  'f44aa-early-design': {
    url: 'https://oatestwder.artstation.com/projects/wrnXZZ',
    label: 'Thomas Oates — F44AA, explorations de design pour Alien: Romulus',
    work: 'Alien: Romulus', authority: 'concept-artist',
    checkedAt: '2026-10-03', scope: 'early-concept-not-final-prop',
    accessStatus: 'primary-search-index-observed-direct-page-unavailable',
    caveat: 'Identification de concept seulement : le portfolio présente des explorations, pas une preuve des détails du modèle final filmé.'
  }
});

// Only these identities have a new external source checked during this pass.
// Older native profiles retain their own source receipts, separately labelled.
const newReferenceByBase = new Map([
  [2, { sourceKey: 'afe-official-notes', status: 'named-identity-confirmed', sourceName: 'M41A2 Pulse Rifle' }],
  [4, { sourceKey: 'vp70-production-prop', status: 'visual-reference-reviewed', sourceName: 'VP70M Sidearm Pistol' }],
  [8, { sourceKey: 'afe-official-notes', status: 'named-identity-confirmed', sourceName: 'M39 Submachine Gun' }],
  [13, { sourceKey: 'afe-official-notes', status: 'named-identity-confirmed', sourceName: 'M94 Impact Grenade',
    evidenceSection: 'PATCH 1.0.2.91589 — 10/12/2021 — WEAPONS AND ATTACHMENTS — Launcher Weapons',
    designationStatus: 'official-name-variation-not-model-equivalence',
    relatedDesignation: 'M94 Impact Launcher',
    caveat: 'Le nom sauvegardé M94 Impact Grenade est attesté parmi les Launcher Weapons des notes officielles 1.0.2.91589 (10/12/2021). Les notes plus récentes disent M94 Impact Launcher ; cet écart de désignation ne prouve pas une équivalence géométrique. Aucune fusion ni modification d’ID/stat n’est faite.' }],
  [15, { sourceKey: 'sentry-production-prop', status: 'visual-reference-reviewed', sourceName: 'Sentry Gun' }],
  [17, { sourceKey: 'f44aa-early-design', status: 'early-design-reference-only', sourceName: 'F44AA Pulse Rifle' }],
  [18, { sourceKey: 'afe-official-notes', status: 'named-identity-confirmed', sourceName: 'Type 88 Heavy Assault Rifle' }]
]);
const originals = new Set([23, 34, 35, 36, 37, 38, 39, 40]);
const numberOf = entry => Number(entry.id.match(/^weapon-(\d{3})-/)?.[1] || 0);
// Modulo is used only after membership in the real WEAPONS array is established;
// arbitrary future IDs and wrong slugs can never gain a source or reviewed art.
const baseOf = entry => {
  const number = numberOf(entry);
  return number === 147 ? 147 : ((number - 1) % 40) + 1;
};
const groups = new Map();
for (const entry of WEAPONS) {
  const base = baseOf(entry);
  if (!groups.has(base)) groups.set(base, []);
  groups.get(base).push(entry);
}

const makeReference = (base, visual) => {
  if (originals.has(base)) return freeze({
    status: 'project-original', sourceKey: null, url: null, label: 'Création originale Tantalus / Frontier',
    work: 'Alien: Tantalus Frontier', identityConfirmed: false, visualReferenceAvailable: false,
    caveat: 'Création du projet, pas un modèle canonique attesté. Le champ provenance historique reste intact et ne constitue pas une preuve externe.'
  });
  const review = newReferenceByBase.get(base);
  if (review) {
    const source = WEAPON_REFERENCE_SOURCES_V120[review.sourceKey];
    return freeze({ ...review, url: source.url, label: source.label, work: source.work,
      identityConfirmed: ['named-identity-confirmed', 'visual-reference-reviewed'].includes(review.status),
      visualReferenceAvailable: review.status === 'visual-reference-reviewed',
      caveat: review.caveat || source.caveat });
  }
  if (visual.visualMode === 'static-pose' && visual.referenceUrl) return freeze({
    status: 'inherited-native-reference', sourceKey: null, url: visual.referenceUrl,
    label: visual.referenceLabel || 'Reçu documentaire natif hérité',
    work: visual.sourceWork || null,
    identityConfirmed: visual.identityVerified === true,
    visualReferenceAvailable: Boolean(visual.referenceImageUrl),
    caveat: visual.referenceCaveat || 'Référence conservée depuis le module natif antérieur ; cette passe ne la re-certifie pas. Géométrie générée non certifiée 1:1.'
  });
  return freeze({ status: 'source-to-complete', sourceKey: null, url: null, label: 'Référence précise à compléter',
    work: null, identityConfirmed: false, visualReferenceAvailable: false,
    caveat: 'Le nom de famille et les anciennes étiquettes CANON_REFERENCE ne prouvent ni l’œuvre exacte, ni la géométrie ou les dimensions. L’atlas existant reste utilisable sans certification canonique.' });
};

export const WEAPON_GEOMETRY_COVERAGE_V120 = freeze([...groups.entries()].map(([baseNumber, entries]) => {
  const base = entries.find(entry => numberOf(entry) === baseNumber);
  const visual = resolveNativeWeaponProfileV120(base) || resolveWeaponVisualProfileV63(base);
  // The append-only Volcan did not exist in V61. Passing 147 to that old
  // modulo resolver would falsely attach a Smart Disc atlas as its history.
  const historical = baseNumber === 147 ? null
    : baseNumber === 24 ? resolveWeaponVisualProfileV63(base) : resolveWeaponVisualProfileV61(base);
  const native = visual.visualMode === 'static-pose';
  return {
    baseNumber, baseId: base.id, name: base.name, canonicalName: visual.canonicalName || base.name,
    source: base.source, family: base.family, projectOriginal: originals.has(baseNumber),
    catalogIds: entries.map(entry => entry.id), catalogEntries: entries.length,
    sharedFinishCount: entries.length - 1,
    primaryMedia: {
      imageKey: visual.imageKey, path: visual.path, sheetId: visual.sheetId || null,
      visualMode: native ? 'static-pose' : 'legacy-action-atlas',
      dedicatedNativePlate: native, release: visual.release || 'v56',
      reviewStatus: native ? visual.reviewStatus : 'legacy-not-revalidated',
      newThisPass: visual.release === 'v120',
      availableStates: native ? ['idle'] : ['idle', 'action', 'reload', 'service'],
      missingStates: native ? ['action', 'reload', 'service'] : [],
      animationClaim: native ? 'fixed-pose-no-generated-action-frames' : 'historical-atlas-not-newly-certified'
    },
    historicalMedia: historical ? {
      imageKey: historical.imageKey, path: historical.path, sheetId: historical.sheetId || null,
      preserved: true, availableStates: ['idle', 'action', 'reload', 'service']
    } : null,
    reference: makeReference(baseNumber, visual),
    // Identity lookup is never an assertion that generated pixels are official.
    canonExact: false, fidelityCertification: 'not-certified',
    dimensionsStatus: 'no-documented-physical-size', statsPolicy: 'existing-project-tuning-unchanged',
    nativePlateStatus: native ? 'available-static-adaptation' : 'native-adaptation-missing',
    candidateStatus: baseNumber === 15
      ? native ? 'v120-candidate-admitted-static' : 'v120-quality-hold'
      : 'none',
    note: native
      ? 'Plaque native fixe ; finitions partagées, animation dédiée et fidélité 1:1 non certifiées.'
      : 'Atlas historique conservé ; nouvelle adaptation native et revue de fidélité à réaliser.'
  };
}));

const byBase = new Map(WEAPON_GEOMETRY_COVERAGE_V120.map(row => [row.baseNumber, row]));
export const WEAPON_REFERENCE_COVERAGE_V120 = freeze(WEAPONS.map(entry => {
  const geometry = byBase.get(baseOf(entry));
  return {
    id: entry.id, catalogNumber: numberOf(entry), name: entry.name, baseNumber: geometry.baseNumber,
    baseId: geometry.baseId, geometry, isFinishVariant: entry.id !== geometry.baseId,
    finishArt: entry.id === geometry.baseId ? 'base-family-media' : 'shared-base-media-no-dedicated-finish',
    dedicatedNativePlate: geometry.primaryMedia.dedicatedNativePlate,
    nativePlateStatus: geometry.nativePlateStatus, referenceStatus: geometry.reference.status,
    sourceWork: geometry.reference.work,
    canonExact: false, fidelityCertification: 'not-certified'
  };
}));

const byId = new Map();
const byName = new Map();
for (const row of WEAPON_REFERENCE_COVERAGE_V120) {
  byId.set(row.id, row);
  byId.set(`weapon-${String(row.catalogNumber).padStart(3, '0')}`, row);
  byName.set(row.name, row);
}

/** Safe dossier lookup only. Explicit unknown IDs cannot be rescued by a
 * familiar title, prototype property, inherited source or modulo coincidence. */
export function resolveWeaponReferenceCoverageV120(source) {
  if (typeof source === 'string') return byId.get(source.trim()) || null;
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null;
  const id = String(source.id || '').trim();
  return id ? byId.get(id) || null : byName.get(String(source.name || '').trim()) || null;
}

/** Documentary candidates, not catalogue entries, generated assets or new
 * save IDs. Every name below appears in the official developer notes. */
export const WEAPON_EXPANSION_CANDIDATES_V120 = freeze([
  ['L59 Minigun', 'heavy'], ['L36 Halberd', 'rifle'], ['L33 Pike', 'rifle'],
  ['Thunderbolt Mk.2 Autocannon', 'heavy'], ['P.649 HEL', 'heavy'], ['M12 RPG', 'heavy'],
  ['M12A1 Rocket Launcher', 'heavy'], ['Microburst', 'heavy'], ['2B1 Vajra', 'heavy'],
  ['M94 Impact Launcher', 'heavy'], ['M95 Grenade Launcher', 'heavy'],
  ['LEM StG24 Storm Rifle', 'rifle'], ['EDS-93 Zadak Plasma Discharger', 'heavy'],
  ['U1A2 GL Conversion', 'handgun'], ['4C2 Astra', 'handgun'],
  ['6A Jaipur Submachine Gun', 'cqw'], ['8A7 Dambulla Machine Pistol', 'handgun'],
  ['SVAT-92 Sokol', 'rifle'], ['M51 Breaching Scattergun', 'cqw'], ['DKT-59 Misha', 'handgun'],
  ['EVI-87 Zvezda Plasma Rifle', 'rifle'], ['PPZ-49 Vol', 'cqw'], ['Frontier Revolver', 'handgun'],
  ['N79 EVA Laser', 'handgun'], ['M10 Auto Pistol', 'handgun'],
  ['Mark 7 Mod 2 CQB Pistol', 'handgun'], ['Kramer Short-Barrel', 'handgun'],
  ['Rapid Responder', 'handgun'], ['X43 Barrage Flechette SMG', 'cqw'],
  ['LEM MP11 Stormsurge', 'cqw'], ['Type 99 Incinerator', 'cqw'], ['X1 Fireball', 'cqw'],
  ['Heirloom Standoff', 'cqw'], ['Type 21 Tactical Shotgun', 'cqw'],
  ['DT-57 Medved', 'cqw'], ['Type 76 Auto Shotgun', 'cqw'], ['AM-16 Gruppa', 'rifle'],
  ['X45 Bombard', 'rifle'], ['X46 Ballista Flechette Rifle', 'rifle'], ['M42A3 Sniper', 'rifle']
].map(([name, category]) => ({
  name, category, sourceKey: 'afe-official-notes', sourceUrl: WEAPON_REFERENCE_SOURCES_V120['afe-official-notes'].url,
  sourceWork: 'Aliens: Fireteam Elite', status: 'named-candidate-not-integrated', catalogId: null,
  dedicatedMedia: null, visualReferenceStatus: 'model-view-to-obtain', statsStatus: 'not-authored',
  categoryStatus: 'planning-label-not-source-statistics', canonExact: false,
  caveat: name === 'M94 Impact Launcher'
    ? 'Les notes officielles emploient aussi M94 Impact Grenade. L’écart de désignation doit être résolu avant de compter une géométrie supplémentaire ; aucune synonymie de modèles n’est attestée ici.'
    : 'Identité nominale confirmée ; aucune silhouette, animation, dimension ou statistique importée par ce registre.'
})));

export function weaponCoverageReportV120() {
  const geometries = WEAPON_GEOMETRY_COVERAGE_V120;
  const entries = WEAPON_REFERENCE_COVERAGE_V120;
  const native = geometries.filter(row => row.primaryMedia.dedicatedNativePlate);
  const referenceCounts = {};
  for (const geometry of geometries) referenceCounts[geometry.reference.status] = (referenceCounts[geometry.reference.status] || 0) + 1;
  return freeze({
    catalogueIds: entries.length, geometricFamilies: geometries.length,
    finishVariants: entries.filter(row => row.isFinishVariant).length,
    projectOriginalFamilies: geometries.filter(row => row.projectOriginal).length,
    nativePlateFamilies: native.length,
    idsUsingNativePlates: entries.filter(row => row.dedicatedNativePlate).length,
    legacyOnlyFamilies: geometries.length - native.length,
    idsUsingLegacyOnlyAtlases: entries.filter(row => !row.dedicatedNativePlate).length,
    newNativePlateFamilies: native.filter(row => row.primaryMedia.newThisPass).length,
    qualityHeldCandidates: geometries.filter(row => row.candidateStatus === 'v120-quality-hold').length,
    canonExactGeometries: 0, referenceCounts,
    namedExpansionCandidates: WEAPON_EXPANSION_CANDIDATES_V120.length,
    existingGeometriesMissingFromTarget100: Math.max(0, 100 - geometries.length),
    target100Status: 'not-achieved-not-certified',
    newUniqueCountCaveat: 'Les candidats documentaires ne sont pas des sprites. Le M94 doit être résolu avant de le compter comme nouveau modèle.',
    nativeAdaptationQueue: geometries.filter(row => !row.primaryMedia.dedicatedNativePlate).map(row => row.baseId)
  });
}
