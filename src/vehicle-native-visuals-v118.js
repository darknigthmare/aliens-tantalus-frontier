/** V118 RT Series production-family plate. This is the observed parked /
 * maintenance configuration, not an invented closed RT01 or a new action atlas.
 * Exact save IDs are preserved; the original V56 mission sheet stays separate. */
const path = '/assets/openai/equipment/v118-vehicles/rt-series-maintenance-native-v118.png';
const fallbackReason = 'RT Series Group Transport reconstruit depuis une photographie du véhicule pratique de production publiée par son designer David Levy. Vue fixe de maintenance, cabine et hayon relevés ; numéro RT01, intérieur complet, géométrie, proportions et finitions non certifiés 1:1. Les huit finitions réemploient une seule plaque de famille. L’atlas de mission V56 reste séparé et inchangé.';

export const VEHICLE_NATIVE_POSES_V118 = Object.freeze({
  rtSeries: Object.freeze({
    catalogBaseId: 'vehicle-015-uscss-prometheus-rover',
    catalogName: 'RT Series Group Transport / RT01',
    canonicalName: 'RT Series Group Transport',
    sourceWork: 'Prometheus (2012)',
    visualLabel: 'RT Series Group Transport — maintenance, ouvrants relevés',
    path, rawPath: path, imageKey: 'rtSeriesMaintenanceNativeV118',
    sheetId: null, grid: null, idleClip: null,
    visualMode: 'static-pose', animationStatus: 'missing',
    usage: 'catalog-inspection-only', reviewStatus: 'accepted-static-adaptation',
    sourceFacing: -1, category: 'ground', release: 'v118',
    sourceWidth: 1542, sourceHeight: 1020,
    alphaBounds: Object.freeze([241, 148, 1326, 865]), alphaBoundsThreshold: 16,
    renderWidth: 420, renderHeight: 420 * 1020 / 1542,
    sha256: 'df805ba9fd184694bce6cfc36fc8862d5199fb753ab5c4fe4d2dddbedfadcbd5',
    identityStatus: 'reference-family-reconstruction', identityVerified: true,
    canonExact: false, approximate: true,
    catalogVariantMismatch: true, exactReferenceStillMissing: true,
    geometryStatus: 'reference-reconstruction-not-certified',
    configuration: 'Parked maintenance view; front cabin doors and rear access raised; four near-side wheels visible. The production-family eight-wheel layout is documented by the reference, not eight independently certified pixels.',
    configurationStatus: 'documented-open-maintenance-state',
    wheelLayout: 'four-axles-eight-wheels-production-family',
    visibleNearSideWheelCount: 4,
    exactUnitNumberVerified: false,
    interiorGeometryVerified: false,
    referenceStatus: 'PRODUCTION_FAMILY_REFERENCE_RECONSTRUCTION',
    sourceProvenance: 'david-levy-production-vehicle-photograph',
    referenceUrl: 'https://www.linkedin.com/posts/vyleart_prometheus-rover-sketches-and-build-shown-activity-6473591156264431616-avS8',
    referenceImageUrl: 'https://media.licdn.com/dms/image/v2/C5622AQG4awj_P4oT9A/feedshare-shrink_800/feedshare-shrink_800/0/1579949071862?e=2147483647&v=beta&t=2CudzZmsiQJUKlndp9Ua_ByDuE-BAMvlUWEHaG6bHxc',
    referenceImageIndex: 4,
    referenceCaveat: 'La publication mêle concepts et photographies pratiques. Cette plaque suit uniquement la photographie nº4 en état ouvert ; la photo nº8 marquée RT02 n’est pas substituée au RT01 et aucun concept n’est présenté comme une photographie finale.',
    physicalDimensionsMeters: null,
    physicalSizeStatus: 'not-attested-by-selected-reference',
    legacyAnimation: Object.freeze({
      sheetId: 'vehicle.rt01-group-transport.action.v56', imageKey: 'rt01V56',
      path: '/assets/openai/sprites/normalized/vehicles/rt01-group-transport-action-sheet.png'
    }),
    fallbackReason
  })
});

export const VEHICLE_NATIVE_ASSETS_V118 = Object.freeze({
  [VEHICLE_NATIVE_POSES_V118.rtSeries.imageKey]: path
});

const FITS = Object.freeze(['Standard', 'Recon', 'Assault', 'Rescue', 'Colonial', 'Frontier', 'Prototype', 'Apex']);
export const VEHICLE_NATIVE_CATALOG_BINDINGS_V118 = Object.freeze(Object.fromEntries(FITS.map((fit, index) => {
  const id = `vehicle-${String(15 + index * 36).padStart(3, '0')}-uscss-prometheus-rover${index ? `-${fit.toLowerCase()}` : ''}`;
  return [id, Object.freeze({ key: 'rtSeries', catalogId: id, fit, isVariant: index > 0 })];
})));

/** An unknown explicit identity can never fall through to a name, an arbitrary
 * modulo family, another rover, a ship called Prometheus or the Daihotai. */
export function resolveNativeVehicleCatalogVisualV118(source = {}) {
  const id = typeof source === 'string' ? source : (source?.id || source?.catalogId || source?.vehicleId || '');
  if (typeof id !== 'string' || !Object.hasOwn(VEHICLE_NATIVE_CATALOG_BINDINGS_V118, id)) return null;
  const binding = VEHICLE_NATIVE_CATALOG_BINDINGS_V118[id];
  const pose = VEHICLE_NATIVE_POSES_V118[binding.key];
  return Object.freeze({ ...pose, catalogId: binding.catalogId, fit: binding.fit,
    isVariant: binding.isVariant, authoredFamily: binding.isVariant,
    identity: Object.freeze({ status: pose.identityStatus,
      referenceStatus: pose.referenceStatus, identityVerified: true,
      exact: false, canonExact: false, approximate: true, fallbackReason })
  });
}
