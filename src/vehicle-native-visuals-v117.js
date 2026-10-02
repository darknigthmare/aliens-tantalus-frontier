/** V117 Narcissus inspection plate. Its identity is documented, not its exact
 * geometry. One fixed view serves the eight existing catalog fits; the mission
 * action sheet remains separate and is never replaced by this module. */
const path = '/assets/openai/equipment/v117-vehicles/narcissus-native-v117.png';
const fallbackReason = 'Narcissus, navette de secours du Nostromo, reconstruite d’après une réplique licenciée Eaglemoss. Vue fixe partagée entre les huit finitions ; géométrie, proportions et marquages non certifiés 1:1. Aucune nouvelle animation de mission ni dimension réelle du vaisseau n’est attestée.';

export const VEHICLE_NATIVE_POSES_V117 = Object.freeze({
  narcissus: Object.freeze({
    catalogBaseId: 'vehicle-013-uscss-nostromo-shuttle',
    catalogName: 'Narcissus - Nostromo Lifeboat',
    canonicalName: 'Narcissus',
    sourceWork: 'Alien (1979)',
    visualLabel: 'Narcissus — navette de secours du Nostromo',
    path, rawPath: path, imageKey: 'narcissusNativeV117',
    sheetId: null, grid: null, idleClip: null,
    visualMode: 'static-pose', animationStatus: 'missing',
    usage: 'catalog-inspection-only', reviewStatus: 'accepted-static-adaptation',
    sourceFacing: -1, category: 'space', release: 'v117',
    sourceWidth: 1254, sourceHeight: 1254,
    alphaBounds: Object.freeze([20, 232, 1242, 1079]), alphaBoundsThreshold: 16,
    renderWidth: 320, renderHeight: 320,
    sha256: 'cdb57728042b00c19fd7bb31d3459f5fc6875acfebe7baf0fc13931dc2458b2e',
    identityStatus: 'reference-reconstruction', identityVerified: true,
    canonExact: false, approximate: true,
    catalogVariantMismatch: false, exactReferenceStillMissing: false,
    geometryStatus: 'reference-reconstruction-not-certified',
    configuration: 'Elevated front-left three-quarter view; split forward nose and paired rear engine pods; no display stand or invented weapons',
    referenceStatus: 'LICENSED_REPLICA_REFERENCE_RECONSTRUCTION',
    sourceProvenance: 'licensed-eaglemoss-replica-reference',
    referenceUrl: 'https://us.zavvi.com/p/merch-figures/eaglemoss-alien-shuttle-narcissus-ship-limited-edition-die-cast-replica-20cm/12578873/',
    physicalDimensionsMeters: null,
    physicalSizeStatus: 'not-attested-by-selected-reference',
    fallbackReason
  })
});

export const VEHICLE_NATIVE_ASSETS_V117 = Object.freeze({
  [VEHICLE_NATIVE_POSES_V117.narcissus.imageKey]: path
});

const FITS = Object.freeze(['Standard', 'Recon', 'Assault', 'Rescue', 'Colonial', 'Frontier', 'Prototype', 'Apex']);
export const VEHICLE_NATIVE_CATALOG_BINDINGS_V117 = Object.freeze(Object.fromEntries(FITS.map((fit, index) => {
  const id = `vehicle-${String(13 + index * 36).padStart(3, '0')}-uscss-nostromo-shuttle${index ? `-${fit.toLowerCase()}` : ''}`;
  return [id, Object.freeze({ key: 'narcissus', catalogId: id, fit, isVariant: index > 0 })];
})));

/** An unknown explicit ID cannot fall through to a name. In particular, a
 * Nostromo tow ship, another lifeboat, or a made-up fit receives no substitute. */
export function resolveNativeVehicleCatalogVisualV117(source = {}) {
  const id = typeof source === 'string' ? source : (source?.id || source?.catalogId || source?.vehicleId || '');
  if (typeof id !== 'string' || !Object.hasOwn(VEHICLE_NATIVE_CATALOG_BINDINGS_V117, id)) return null;
  const binding = VEHICLE_NATIVE_CATALOG_BINDINGS_V117[id];
  if (!binding) return null;
  const pose = VEHICLE_NATIVE_POSES_V117[binding.key];
  return Object.freeze({ ...pose, catalogId: binding.catalogId, fit: binding.fit,
    isVariant: binding.isVariant, authoredFamily: binding.isVariant,
    identity: Object.freeze({ status: pose.identityStatus,
      referenceStatus: pose.referenceStatus, identityVerified: true,
      exact: false, canonExact: false, approximate: true, fallbackReason })
  });
}
