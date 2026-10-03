import { VEHICLE_CATALOG_ADDITIONS_V122 } from './vehicle-catalog-additions-v122.js';

// Only independently reviewed native PNGs. No mission animation, collision,
// source dimensions or existing vehicle fits are inferred from this fixed image.
const freeze = Object.freeze;
const truck = freeze({
  catalogBaseId: 'vehicle-282-covenant-terraforming-truck',
  catalogName: 'Covenant Terraforming Truck', canonicalName: 'Covenant Terraforming Truck',
  visualLabel: 'Camion de terraformation Covenant — adaptation du concept de production',
  category: 'ground', release: 'v122', newlyGenerated: true,
  path: '/assets/openai/equipment/v122-vehicles/covenant-terraforming-truck-reference-native-v122.png',
  rawPath: '/assets/openai/equipment/v122-vehicles/covenant-terraforming-truck-reference-native-v122.png',
  imageKey: 'covenantTerraformingTruckReferenceNativeV122',
  sourceWidth: 1717, sourceHeight: 916,
  alphaBounds: freeze([34, 9, 1668, 898]), alphaBoundsThreshold: 16,
  groundAnchorPixels: freeze([305, 897]),
  groundAnchorNormalized: freeze([0.17763541059988353, 0.9792576419213974]),
  groundAnchorStatus: 'measured-image-contact-band-not-gameplay-pivot',
  renderWidth: 246, renderHeight: 246 * 916 / 1717,
  sha256: '5e70e3d9721fcf056ecc3db84a557b25acd0a48d8074acc20ccd2579c729cbd2',
  sourceFacing: -1, sheetId: null, grid: null, idleClip: null,
  visualMode: 'static-pose', animationStatus: 'missing', actionAnimationStatus: 'missing',
  missionAtlasStatus: 'not-created', legacyAnimation: null, usage: 'catalog-inspection-only',
  reviewStatus: 'accepted-static-adaptation',
  reviewMethod: 'independent-browser-compositing-four-backgrounds',
  referenceStatus: 'PRODUCTION_DESIGN_REFERENCE',
  sourceWork: 'Alien: Covenant (2017)', sourceProvenance: 'primary-production-designer-front-rear-concepts',
  sourceUrl: 'https://www.tonydrew.com.au/film',
  referenceImageUrls: freeze([
    'https://m1.22slides.com/tonydrew/truckfront-2115632.jpg?f=webp&w=1265&s=3e0b794a181e8feb59583205beb65a60',
    'https://m1.22slides.com/tonydrew/truckrear-2115631.jpg?f=webp&w=1265&s=bf745431babae60119c8885d73b38022'
  ]),
  referenceImageSha256: freeze([
    '675422278b645336b9fa0ee8edf5f46ae8844ef953bcb2720f014b749b457a5c',
    '2a34abde92ad3dce84e0ae9d6cfcf97971398b9c45674e883ce86ab3022ef58c'
  ]),
  identityStatus: 'production-design-reference-adaptation',
  geometryStatus: 'designer-concept-static-adaptation-film-final-geometry-unattested',
  canonExact: false, approximate: true, identityVerified: false,
  catalogVariantMismatch: false, exactReferenceStillMissing: false,
  filmFinalGeometryStillMissing: true,
  physicalDimensionsMeters: null, physicalSizeStatus: 'fictional-dimensions-unattested',
  controlMode: 'piloted-industrial-vehicle',
  configuration: 'Concept de production orange à six roues, cabine à rails et antennes, benne verte couverte, outil frontal de terrassement. Vue avant de trois quarts tournée à gauche ; aucun armement ajouté.',
  fallbackReason: 'Plaque fixe adaptée des vues truckfront et truckrear de Tony Drew. Contours relus indépendamment sur quatre fonds. Géométrie finale filmée non attestée, aucun certificat 1:1 et aucune nouvelle animation ; paramètres de simulation distincts des faits de production.'
});

export const VEHICLE_NATIVE_POSES_V122 = freeze({ covenantTerraformingTruckReference: truck });
export const VEHICLE_NATIVE_ASSETS_V122 = freeze({ [truck.imageKey]: truck.path });
export const VEHICLE_NATIVE_CATALOG_BINDINGS_V122 = freeze(Object.fromEntries(
  VEHICLE_CATALOG_ADDITIONS_V122.filter(vehicle => vehicle.id === truck.catalogBaseId).map(vehicle => [
    vehicle.id, freeze({ key: 'covenantTerraformingTruckReference', catalogId: vehicle.id, fit: vehicle.fit, isVariant: false })
  ])
));

/** Exact IDs only: held candidates and near-name film vehicles never resolve. */
export function resolveNativeVehicleCatalogVisualV122(source = {}) {
  const id = typeof source === 'string' ? source : source && typeof source === 'object' && !Array.isArray(source)
    ? source.id || source.catalogId || source.vehicleId : null;
  if (typeof id !== 'string' || !Object.hasOwn(VEHICLE_NATIVE_CATALOG_BINDINGS_V122, id)) return null;
  const binding = VEHICLE_NATIVE_CATALOG_BINDINGS_V122[id];
  const pose = VEHICLE_NATIVE_POSES_V122[binding.key];
  return freeze({ ...pose, catalogId: binding.catalogId, fit: binding.fit, isVariant: false, authoredFamily: false,
    identity: freeze({ status: pose.identityStatus, referenceStatus: pose.referenceStatus,
      exact: false, canonExact: false, approximate: true, identityVerified: false, fallbackReason: pose.fallbackReason }) });
}
