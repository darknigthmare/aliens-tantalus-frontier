import { resolveVehicleVisualProfile } from './vehicle-visual-runtime-v55.js';

/** High-resolution inspection art, not a replacement for the in-mission atlas.
 * The prop photographs document the folded-pod UD-4L configuration; fit-specific
 * loadouts remain shared art and are never presented as separate reconstructions. */
export const UD4L_CATALOG_POSE_V112 = Object.freeze({
  catalogBaseId: 'vehicle-009-ud-4l-cheyenne-dropship',
  canonicalName: 'UD-4L Cheyenne Dropship',
  path: '/assets/openai/equipment/v112-equipment/ud4l-cheyenne-native-v112.png',
  rawPath: '/assets/openai/equipment/v112-equipment/ud4l-cheyenne-native-v112.png',
  imageKey: 'ud4lCheyenneNativeV112',
  sheetId: null,
  grid: null,
  idleClip: null,
  visualMode: 'static-pose',
  animationStatus: 'missing',
  reviewStatus: 'accepted-static-adaptation',
  sha256: 'dafd0574ff65f05cc499bf69198b87ebd3bee6ab3835bbb73608e6754c41777d',
  usage: 'catalog-inspection-only',
  configuration: 'folded-pods-landing-pads-visible',
  sourceWidth: 2172,
  sourceHeight: 724,
  alphaBounds: Object.freeze([55, 128, 2134, 599]),
  alphaBoundsThreshold: 16,
  sourceFacing: -1,
  renderWidth: 320,
  renderHeight: 320 * 724 / 2172,
  category: 'air',
  referenceStatus: 'FILMING_MINIATURE_REFERENCE_RECONSTRUCTION',
  referenceUrl: 'https://propstore.com/product/aliens-1986/lot-17-bug-stomper-smart-ass-dropship-model-miniature/',
  identityStatus: 'reference-reconstruction',
  identityVerified: true,
  canonExact: false,
  approximate: true,
  geometryStatus: 'reference-reconstruction-not-certified',
  release: 'v112'
});

export const VEHICLE_NATIVE_ASSETS_V112 = Object.freeze({
  [UD4L_CATALOG_POSE_V112.imageKey]: UD4L_CATALOG_POSE_V112.path
});

/** Resolve through the existing inventory identity table, not a substring that
 * could accidentally substitute a Cheyenne UD-4B or an unrelated dropship. */
export function resolveNativeVehicleCatalogVisualV112(source = {}) {
  const legacy = resolveVehicleVisualProfile(source);
  if (legacy?.key !== 'ud4lCheyenne') return null;
  const fallbackReason = 'Illustration fixe reconstruite à partir de photographies de la miniature de tournage. Géométrie et marquages non certifiés 1:1 ; les finitions partagent cette vue. L’atlas animé en mission reste distinct.';
  return Object.freeze({
    ...UD4L_CATALOG_POSE_V112,
    catalogId: legacy.catalogId,
    fit: legacy.fit,
    authoredFamily: legacy.isVariant,
    fallbackReason,
    identity: Object.freeze({
      status: 'reference-reconstruction',
      referenceStatus: UD4L_CATALOG_POSE_V112.referenceStatus,
      exact: true,
      canonExact: false,
      approximate: true,
      fallbackReason
    })
  });
}
