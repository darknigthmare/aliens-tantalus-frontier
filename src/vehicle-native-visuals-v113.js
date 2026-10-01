/** V113 fixed inspection plates. These never replace a mission action atlas.
 * A documented subvariant/family representative is not an exact baseline model.
 * Stable catalog IDs and the eight existing fits are preserved. */
const freezePose = (data) => Object.freeze({
  sheetId: null, grid: null, idleClip: null, visualMode: 'static-pose',
  animationStatus: 'missing', usage: 'catalog-inspection-only',
  reviewStatus: 'accepted-static-adaptation', sourceFacing: -1,
  alphaBoundsThreshold: 16, renderWidth: 320,
  identityVerified: false, canonExact: false, approximate: true,
  geometryStatus: 'reference-reconstruction-not-certified', release: 'v113',
  ...data, rawPath: data.path,
  alphaBounds: Object.freeze([...data.alphaBounds]),
  renderHeight: 320 * data.sourceHeight / data.sourceWidth
});

export const VEHICLE_NATIVE_POSES_V113 = Object.freeze({
  m570SeriesRepresentative: freezePose({
    catalogBaseId: 'vehicle-003-m570-armored-personnel-carrier',
    catalogName: 'M570 Series APC', canonicalName: 'M577 Armored Personnel Carrier',
    visualLabel: 'Série M570 — représentant M577',
    representedVariant: 'M577 standard model of the M570 Series APC family',
    catalogVariantMismatch: true, exactReferenceStillMissing: true,
    identityStatus: 'family-representative', referenceStatus: 'LICENSED_FAMILY_REPRESENTATIVE',
    sourceProvenance: 'licensed-prop-replica-reference',
    referenceUrl: 'https://www.hottoys.jp/item/view/100002854.php',
    path: '/assets/equipment/v113-vehicles/m570-series-m577-representative-native-v113.png',
    imageKey: 'm570SeriesRepresentativeNativeV113', category: 'ground',
    configuration: 'M577 representative front-left three-quarter view',
    sourceWidth: 1441, sourceHeight: 1092, alphaBounds: [47, 65, 1422, 1077],
    sha256: '3a9e0701a7f4121add32b4d7147ddf4f97fed4f1fd3e302addff27143bf8d189',
    fallbackReason: 'Série M570 illustrée par son modèle standard M577, d’après une réplique licenciée. Aucune carrosserie M570 distincte n’est certifiée. Vue fixe partagée entre finitions ; géométrie et marquages non certifiés 1:1. Les animations en mission restent distinctes.'
  }),
  m292a2DocumentedVariant: freezePose({
    catalogBaseId: 'vehicle-006-m292-combat-buggy',
    catalogName: 'M292 Self-Propelled Artillery', canonicalName: 'M292A2 Self-Propelled Artillery',
    visualLabel: 'M292A2 — variante documentée', representedVariant: 'M292A2 with roof air-defense laser',
    catalogVariantMismatch: true, exactReferenceStillMissing: true,
    identityStatus: 'documented-subvariant', referenceStatus: 'LICENSED_A2_SIDE_PROFILE_ADAPTATION',
    sourceProvenance: 'licensed-technical-manual-side-elevation',
    referenceUrl: 'https://avp.fandom.com/wiki/M292_Self-Propelled_Artillery',
    path: '/assets/equipment/v113-vehicles/m292a2-native-v113.png',
    imageKey: 'm292a2DocumentedVariantNativeV113', category: 'ground',
    configuration: 'A2 left-facing side elevation; roof laser retained',
    sourceWidth: 1873, sourceHeight: 840, alphaBounds: [50, 42, 1859, 808],
    sha256: '762f5decede1f47c7ad31fcd1d53fc82c91be3d95f34a63807e247cbdfece200',
    fallbackReason: 'La fiche conserve le M292 de base ; cette illustration montre explicitement le M292A2, avec sa tourelle laser de toit, seule variante documentée visuellement. Vue fixe partagée entre finitions, non certifiée 1:1 ; elle ne prouve ni le modèle de base ni une animation de mission.'
  }),
  ad19BearcatFamily: freezePose({
    catalogBaseId: 'vehicle-011-ad-19cd-dropship',
    catalogName: 'AD-19D Bearcat VTOL Strikeship', canonicalName: 'AD-19C/D Bearcat VTOL Strikeship',
    visualLabel: 'Bearcat — famille AD-19C/D', representedVariant: 'AD-19C/D family; exact D unresolved',
    catalogVariantMismatch: true, exactReferenceStillMissing: true,
    identityStatus: 'family-reference-adaptation', referenceStatus: 'LICENSED_CD_FAMILY_PROFILE_ADAPTATION',
    sourceProvenance: 'licensed-colonial-marines-operations-manual-family-profile',
    referenceUrl: 'https://avp.fandom.com/wiki/AD-19_%22Bearcat%22_Strikeship',
    path: '/assets/equipment/v113-vehicles/ad19-bearcat-family-native-v113.png',
    imageKey: 'ad19BearcatFamilyNativeV113', category: 'air',
    configuration: 'C/D family side profile without optional medevac panniers',
    sourceWidth: 2172, sourceHeight: 724, alphaBounds: [13, 38, 2163, 676],
    sha256: '6436254554acf2b651ae1247adde7a9ba7a3572e451b7c92b1b1b54067866599',
    fallbackReason: 'Adaptation du profil licencié de la famille AD-19C/D. La cabine propre au D n’est pas individualisée par cette source. Vue fixe partagée entre finitions, non certifiée 1:1 ; aucune nouvelle animation ni configuration medevac n’est revendiquée.'
  })
});

export const VEHICLE_NATIVE_ASSETS_V113 = Object.freeze(Object.fromEntries(
  Object.values(VEHICLE_NATIVE_POSES_V113).map(pose => [pose.imageKey, pose.path])
));

const FITS = Object.freeze(['Standard', 'Recon', 'Assault', 'Rescue', 'Colonial', 'Frontier', 'Prototype', 'Apex']);
const families = [
  ['m570SeriesRepresentative', 3, 'm570-armored-personnel-carrier'],
  ['m292a2DocumentedVariant', 6, 'm292-combat-buggy'],
  ['ad19BearcatFamily', 11, 'ad-19cd-dropship']
];
export const VEHICLE_NATIVE_CATALOG_BINDINGS_V113 = Object.freeze(Object.fromEntries(families.flatMap(([key, number, slug]) =>
  FITS.map((fit, index) => {
    const id = `vehicle-${String(number + index * 36).padStart(3, '0')}-${slug}${index ? `-${fit.toLowerCase()}` : ''}`;
    const base = VEHICLE_NATIVE_POSES_V113[key];
    return [id, Object.freeze({ key, catalogId: id, fit, isVariant: index > 0,
      catalogName: index ? `${base.catalogName} — ${fit}` : base.catalogName })];
  })
)));
const bindingByName = new Map(Object.values(VEHICLE_NATIVE_CATALOG_BINDINGS_V113).map(binding => [binding.catalogName, binding]));

/** Exact IDs first. Never substring-match a nearby model or change a requested fit. */
export function resolveNativeVehicleCatalogVisualV113(source = {}) {
  const id = typeof source === 'string' ? source : (source?.id || source?.catalogId || source?.vehicleId || '');
  const name = typeof source === 'string' ? source : (source?.name || source?.catalogName || source?.vehicleName || '');
  const binding = typeof source === 'string'
    ? (VEHICLE_NATIVE_CATALOG_BINDINGS_V113[id] || bindingByName.get(name))
    : (id ? VEHICLE_NATIVE_CATALOG_BINDINGS_V113[id] : bindingByName.get(name));
  if (!binding) return null;
  const pose = VEHICLE_NATIVE_POSES_V113[binding.key];
  return Object.freeze({ ...pose, catalogId: binding.catalogId, fit: binding.fit,
    authoredFamily: true, isVariant: binding.isVariant,
    identity: Object.freeze({ status: pose.identityStatus, referenceStatus: pose.referenceStatus,
      exact: false, canonExact: false, approximate: true, fallbackReason: pose.fallbackReason })
  });
}


