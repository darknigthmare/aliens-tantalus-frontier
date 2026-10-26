import { resolveNpcClimbRigV165, drawNpcClimbRigV165, npcClimbImageReadyV165 } from './npc-cal-climb-rig-v165.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const point = (x, y) => ({ x, y });

/** Raw imagegen adaptation of Jun's own two original atlases, with Cal's
 * separate-parts layout as a layout reference only. The four full-body keys
 * document authored pose variation; the live cycle uses ten separate pieces.
 * No original source PNG was edited, and this is not a canonical 1:1 sheet. */
export const JUN_CLIMB_ASSET_V165 = freeze({
  id: 'npc.jun-park.climb-parts-v165', imageKey: 'junClimbPartsV165',
  path: '/assets/openai/sprites/npcs/rig-v165/jun-park-climb-parts-v165.png',
  width: 1254, height: 1254, sourceWidth: 1254, sourceHeight: 1254,
  sha256: '5f42a47db66f4591e716bda037df5b97926754a8f9112afc050dbd826caf99ad',
  referencePaths: ['/assets/openai/sprites/npcs/jun-park-locomotion-sheet.png',
    '/assets/openai/sprites/npcs/jun-park-mission-sheet.png'],
  layoutReferencePath: '/assets/openai/sprites/npcs/rig-v165/cal-mercer-climb-parts-v165.png',
  artStatus: 'adapted-original-Jun-four-climb-keys-and-separated-parts',
  originalSourcePngsChanged: false, canonicalExact: false
});

const part = (bounds, proximal, distal, thickness) => ({
  bounds, source: { x: bounds[0] - 2, y: bounds[1] - 2,
    w: bounds[2] - bounds[0] + 4, h: bounds[3] - bounds[1] + 4 },
  proximal: point(...proximal), distal: point(...distal), thickness
});

/** Absolute pixels measured on Jun's native RGBA output. Bounds describe the
 * visible alpha>=128 component; guarded source crops retain edge antialiasing.
 * Every attachment/support listed below has source alpha >= 251. The retained
 * shoulder armour contains the humeral sockets; it is not a detached arm. */
export const JUN_CLIMB_PARTS_V165 = freeze({
  referenceKeys: [[58,77,283,480], [343,63,595,479], [692,89,931,480], [1006,52,1211,479]],
  torso: { source: { x: 60, y: 504, w: 184, h: 270 }, waist: point(153, 751),
    shoulders: { near: point(108, 673), far: point(211, 654) } },
  pelvis: { source: { x: 371, y: 624, w: 220, h: 150 }, waist: point(476, 652),
    // Projected femoral attachments lie inside opaque cloth, under the pelvis
    // layer. The large outside armour circles are not anatomical hip sockets.
    hips: { near: point(518, 722), far: point(448, 722) } },
  near: {
    upperArm: part([704,540,879,714], [736,581], [854,682], 80),
    forearm: part([1013,552,1212,688], [1040,652], [1200,578], 62),
    thigh: part([705,781,885,994], [732,817], [832,964], 90),
    shinBoot: part([1026,775,1212,1000], [1057,806], [1186,972], 68)
  },
  far: {
    upperArm: part([80,805,242,966], [110,838], [218,937], 78),
    forearm: part([381,858,581,937], [406,890], [566,904], 60),
    thigh: part([71,1000,266,1217], [99,1047], [203,1187], 90),
    shinBoot: part([421,995,588,1217], [449,1028], [570,1198], 64)
  }
});

/** Dimensions stay fixed through the cycle. Jun's actual lower shoulder caps
 * differ from Cal's source pixels, so his arm lengths are independently set.
 * The 41px head-to-belt registration yields a 92px standing human and a 44px
 * collider; no pose-dependent scale or bone stretching is used. */
export const JUN_CLIMB_BODY_V165 = freeze({
  standingHeight: 92, width: 44, height: 92, waistStandoff: 18, waistHeight: 51,
  // Jun's measured shoulders sit below Cal's. His own71.5px hand cursor gives
  // max43.715696px reach on the same real rung lattice, below the fixed22+22
  // bones'43.958122px maximum at5deg. No contact or bone is stretched to fit.
  torsoScale: 41 / 241, upperArm: 22, forearm: 22, thigh: 22, shinBoot: 22.5,
  handCursorOffset: 71.5, footCursorOffset: 13,
  topTransferCrouch: 6,
  topReleaseArcs: { near: 16, far: -16 },
  topTransferFootEnd: .8, topReleaseFarStart: .8,
  hipOffsets: { near: point(6, 8), far: point(-6, 8) },
  armLimits: { minFlexionDegrees: 5, maxFlexionDegrees: 145 },
  legLimits: { minFlexionDegrees: 3, maxFlexionDegrees: 145 }
});

export const JUN_CLIMB_PROFILE_V165 = freeze({
  crewId: 'crew-11-jun-park', asset: JUN_CLIMB_ASSET_V165,
  body: JUN_CLIMB_BODY_V165, parts: JUN_CLIMB_PARTS_V165,
  source: 'separated-Jun-parts-position-owned-real-rungs'
});

export function resolveJunClimbRigV165(actor, ladder, options = {}) {
  return resolveNpcClimbRigV165(actor, ladder, JUN_CLIMB_PROFILE_V165, options);
}
export function junClimbImageReadyV165(image) {
  return npcClimbImageReadyV165(image, JUN_CLIMB_ASSET_V165);
}
export function drawJunClimbRigV165(ctx, image, rig) {
  if (rig?.crewId !== JUN_CLIMB_PROFILE_V165.crewId
    || rig?.asset?.sha256 !== JUN_CLIMB_ASSET_V165.sha256) return false;
  return drawNpcClimbRigV165(ctx, image, rig);
}
