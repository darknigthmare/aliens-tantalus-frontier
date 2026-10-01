/** Native, single-pose equipment art. This is not an animation atlas, and the
 * documented weapon identity is not a claim of certified one-to-one geometry.
 * Existing inventory IDs remain unchanged; all four Heavy Pulse finish slots
 * deliberately share this reviewed reconstruction until individual art exists. */
export const M41E4_HEAVY_PULSE_PROFILE_V112 = Object.freeze({
  baseNumber: 16,
  catalogId: 'weapon-016',
  name: 'Heavy Pulse Rifle',
  canonicalName: 'M41E4 Heavy Pulse Rifle',
  imageKey: 'weaponV112:16',
  path: '/assets/openai/equipment/v112-equipment/m41e4-heavy-pulse-rifle-native-v112.png',
  rawPath: '/assets/openai/equipment/v112-equipment/m41e4-heavy-pulse-rifle-native-v112.png',
  sheetId: null,
  clipSet: null,
  visualMode: 'static-pose',
  animationStatus: 'missing',
  reviewStatus: 'accepted-static-adaptation',
  sha256: '0d30dd4f744bf2b0cc95d91d0620056bc616996526ad0f3db96974f2d0fbffdc',
  availableStates: Object.freeze(['idle']),
  missingStates: Object.freeze(['action', 'reload', 'service']),
  sourceWidth: 1942,
  sourceHeight: 809,
  // Exclusive bounds at alpha >= 16. The untouched canvas also contains very
  // faint alpha 1-15 pixels outside these visible silhouette measurements.
  alphaBounds: Object.freeze([47, 104, 1909, 708]),
  alphaBoundsThreshold: 16,
  sourceFacing: 1,
  gripPivot: Object.freeze({ x: 190 / 1942, y: 365 / 809 }),
  muzzlePivot: Object.freeze({ x: 1907 / 1942, y: 329 / 809 }),
  width: 160,
  height: 160 * 809 / 1942,
  category: 'heavy',
  referenceStatus: 'PRIMARY_REFERENCE_RECONSTRUCTION',
  referenceUrl: 'https://www.aliensfireteamelite.com/en/community/afe-season-3-announce/',
  referenceImageUrl: 'https://www.aliensfireteamelite.com/images/uploads/4da2c424efe3e6a203c4947364109b51.jpg',
  identityVerified: true,
  canonExact: false,
  approximate: true,
  identityStatus: 'reference-reconstruction',
  geometryStatus: 'reference-reconstruction-not-certified',
  release: 'v112'
});

export const WEAPON_NATIVE_PROFILES_V112 = Object.freeze([M41E4_HEAVY_PULSE_PROFILE_V112]);
export const WEAPON_NATIVE_ASSETS_V112 = Object.freeze({
  [M41E4_HEAVY_PULSE_PROFILE_V112.imageKey]: M41E4_HEAVY_PULSE_PROFILE_V112.path
});

export function resolveNativeWeaponProfileV112(source = {}) {
  const number = Number(String(source.id || '').match(/^weapon-(\d{3})(?:-|$)/)?.[1] || 0);
  const baseNumber = number ? ((number - 1) % 40) + 1 : 0;
  const baseName = String(source.name || source.canonicalName || '').split(/\s+[—-]\s+/u)[0].trim();
  const profile = M41E4_HEAVY_PULSE_PROFILE_V112;
  const matches = number ? baseNumber === profile.baseNumber
    : source.imageKey === profile.imageKey || ['Heavy Pulse Rifle', 'M41E4 Heavy Pulse Rifle'].includes(baseName);
  if (!matches) return null;
  return Object.freeze({
    ...profile,
    catalogNumber: number || profile.baseNumber,
    exact: true,
    authoredFamily: number > 40,
    fallbackReason: 'Reconstruction du M41E4 documenté par Cold Iron. Pose fixe native ; détails et marquages non certifiés 1:1. Les finitions réutilisent la même illustration.'
  });
}

/** A native image must never be sampled as the first cell of a 4x4 atlas.
 * Scale the full, unmodified canvas; align the measured silhouette to the
 * pickup's baseline without cropping its drum, muzzle or rear handle. */
export function getNativeWeaponPlacementV112(profile, options = {}) {
  if (profile?.visualMode !== 'static-pose' || !profile.sourceWidth || !profile.sourceHeight) return null;
  const [left, top, right, bottom] = profile.alphaBounds;
  const renderWidth = Number.isFinite(options.width) && options.width > 0 ? options.width : profile.width;
  const scale = renderWidth / profile.sourceWidth;
  const centerX = Number.isFinite(options.centerX) ? options.centerX : 0;
  const groundY = Number.isFinite(options.groundY) ? options.groundY : 0;
  const flip = options.flip === true;
  const visibleCenter = flip ? profile.sourceWidth - (left + right) / 2 : (left + right) / 2;
  return Object.freeze({
    x: centerX - visibleCenter * scale,
    y: groundY - bottom * scale,
    width: profile.sourceWidth * scale,
    height: profile.sourceHeight * scale,
    visibleWidth: (right - left) * scale,
    visibleHeight: (bottom - top) * scale,
    groundY,
    flip
  });
}

export function drawNativeWeaponV112(ctx, image, profile, options = {}) {
  if (!image?.complete || !(image.naturalWidth > 0)) return false;
  const placement = getNativeWeaponPlacementV112(profile, options);
  if (!placement) return false;
  const { x, y, width, height, flip } = placement;
  ctx.save();
  ctx.translate(x + (flip ? width : 0), y);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(image, 0, 0, width, height);
  ctx.restore();
  return true;
}
