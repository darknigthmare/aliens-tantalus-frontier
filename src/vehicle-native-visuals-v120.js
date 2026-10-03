import { VEHICLES } from './content-core-v50.js';
import { VEHICLE_NATIVE_POSES_V113 } from './vehicle-native-visuals-v113.js';

/** Rebind the already reviewed M577 illustration to its actual nominal model.
 * This reuses the V113 bytes: it is not a newly generated chassis or animation.
 * All existing M570 representative bindings and mission atlases stay intact. */
const existingM577 = VEHICLE_NATIVE_POSES_V113.m570SeriesRepresentative;
const m577Reason = 'Illustration native M577 déjà produite en V113 sur la réplique licenciée HCG, maintenant liée explicitement à la fiche M577. Même fichier que le représentant de la série M570 ; aucun nouveau dessin revendiqué. Géométrie, petits marquages et finitions non certifiés 1:1. Vue fixe d’inspection uniquement ; atlas et animations de mission inchangés.';

export const VEHICLE_NATIVE_POSES_V120 = Object.freeze({
  m577: Object.freeze({ ...existingM577,
    catalogBaseId: 'vehicle-001-m577-armored-personnel-carrier',
    catalogName: 'M577 Armored Personnel Carrier',
    canonicalName: 'M577 Armored Personnel Carrier',
    visualLabel: 'M577 — adaptation de la réplique licenciée',
    representedVariant: 'M577 Armored Personnel Carrier',
    catalogVariantMismatch: false, exactReferenceStillMissing: false,
    identityStatus: 'licensed-model-reference-adaptation',
    referenceStatus: 'LICENSED_MODEL_REFERENCE_ADAPTATION',
    sourceWork: 'Aliens (1986)', release: 'v120',
    reusedAssetRelease: 'v113', newlyGenerated: false,
    physicalDimensionsMeters: null, physicalSizeStatus: 'not-attested-by-selected-reference',
    legacyAnimation: Object.freeze({
      sheetId: 'vehicle.m577-apc.action', imageKey: 'apc',
      path: '/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png'
    }),
    fallbackReason: m577Reason
  }),
  p5000: Object.freeze({
    catalogBaseId: 'vehicle-007-p-5000-powered-work-loader',
    catalogName: 'P-5000 Powered Work Loader', canonicalName: 'P-5000 Powered Work Loader',
    visualLabel: 'P-5000 — poste de pilotage humain, pinces industrielles',
    sourceWork: 'Aliens (1986)', category: 'exosuit', controlMode: 'piloted-exoskeleton',
    path: '/assets/openai/equipment/v120-vehicles/p5000-work-loader-native-v120.png',
    rawPath: '/assets/openai/equipment/v120-vehicles/p5000-work-loader-native-v120.png',
    imageKey: 'p5000WorkLoaderNativeV120', sheetId: null, grid: null, idleClip: null,
    visualMode: 'static-pose', animationStatus: 'missing', usage: 'catalog-inspection-only',
    reviewStatus: 'accepted-static-adaptation', release: 'v120', newlyGenerated: true,
    sourceFacing: -1, sourceWidth: 1086, sourceHeight: 1448,
    alphaBounds: Object.freeze([63,129,1052,1345]), alphaBoundsThreshold: 16,
    groundAnchorPixels: Object.freeze([751,1344]),
    groundAnchorNormalized: Object.freeze([0.6915285451197053,0.9281767955801105]),
    groundAnchorStatus: 'measured-image-contact-band-not-gameplay-pivot',
    renderWidth: 270, renderHeight: 270 * 1448 / 1086,
    sha256: 'f3b5e28d729cf89976517cac214dbd8ecec13defd1e620ed302d37d6aca6cd58',
    identityStatus: 'licensed-model-reference-adaptation', identityVerified: false,
    referenceStatus: 'LICENSED_MODEL_REFERENCE_ADAPTATION', canonExact: false, approximate: true,
    catalogVariantMismatch: false, exactReferenceStillMissing: false,
    geometryStatus: 'reference-reconstruction-not-certified',
    sourceProvenance: 'neca-licensed-product-photograph',
    referenceUrl: 'https://www.necaonline.com.au/products/aliens-40th-anniversary-power-loader-p-5000-deluxe-vehicle',
    referenceImageUrl: 'https://www.necaonline.com.au/cdn/shop/files/NE51799.jpg?v=1777860560&width=1500',
    configuration: 'Empty open human pilot seat and blue restraint harness, yellow roll cage, work clamp jaws, hydraulics, warning beacon and antennas; front-left three-quarter inspection pose.',
    physicalDimensionsMeters: null, physicalSizeStatus: 'not-attested-by-selected-reference',
    distinctAutomatonId: 'synth-automated-powerloader',
    legacyAnimation: Object.freeze({
      sheetId: 'vehicle.p5000-powered-work-loader.action', imageKey: 'p5000Loader',
      path: '/assets/openai/sprites/normalized/vehicles/p-5000-powered-work-loader-action-sheet.png'
    }),
    fallbackReason: 'Adaptation fixe du P-5000 sur photographie de réplique licenciée NECA : poste humain ouvert, harnais et pinces de travail conservés. Cadrage et alpha relus indépendamment sur fonds clair et sombre dans le navigateur intégré. Géométrie et détails non certifiés 1:1 ; les huit finitions partagent cette illustration. L’Automated Power Loader reste un automate distinct ; statistiques, sièges et atlas de mission P-5000 inchangés.'
  })
});

export const VEHICLE_NATIVE_ASSETS_V120 = Object.freeze(Object.fromEntries(
  Object.values(VEHICLE_NATIVE_POSES_V120).map(pose => [pose.imageKey, pose.path])
));

const poseByBaseName = new Map(Object.entries(VEHICLE_NATIVE_POSES_V120).map(([key, pose]) => [pose.catalogName, key]));
export const VEHICLE_NATIVE_CATALOG_BINDINGS_V120 = Object.freeze(Object.fromEntries(VEHICLES.flatMap(vehicle => {
  const key = poseByBaseName.get(vehicle.name.split(' — ')[0]);
  return key ? [[vehicle.id, Object.freeze({ key, catalogId: vehicle.id, fit: vehicle.fit, isVariant: vehicle.fit !== 'Standard' })]] : [];
})));

/** An explicit foreign ID never falls through to a similar name, another
 * chassis or the visually shared M570 representative's identity. */
export function resolveNativeVehicleCatalogVisualV120(source = {}) {
  const id = typeof source === 'string' ? source : source && typeof source === 'object' && !Array.isArray(source)
    ? source.id || source.catalogId || source.vehicleId : null;
  if (typeof id !== 'string' || !Object.hasOwn(VEHICLE_NATIVE_CATALOG_BINDINGS_V120, id)) return null;
  const binding = VEHICLE_NATIVE_CATALOG_BINDINGS_V120[id], pose = VEHICLE_NATIVE_POSES_V120[binding.key];
  return Object.freeze({ ...pose, catalogId: binding.catalogId, fit: binding.fit,
    isVariant: binding.isVariant, authoredFamily: binding.isVariant,
    catalogVariantMismatch: binding.isVariant,
    identity: Object.freeze({ status: pose.identityStatus, referenceStatus: pose.referenceStatus,
      exact: false, canonExact: false, approximate: true, identityVerified: false, fallbackReason: pose.fallbackReason })
  });
}
