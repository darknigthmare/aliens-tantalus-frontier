import { ENEMY_DEDICATED_POSES_V98, isEnemyDedicatedPoseReadyV98 } from './enemy-dedicated-poses-v98.js';
import { ENEMY_DEDICATED_BATCH_V99 } from './enemy-dedicated-batch-v99.js';

const makePose = record => {
  const scale = record.targetOpaqueHeight / (record.alphaBounds[3] - record.alphaBounds[1]);
  const aquatic = record.profileId === 'enemy-207-acid-blooded-ceto-reef-predator';
  return Object.freeze({ ...record, family: 'enemy', imageKey: `enemyDedicatedPoseV99:${record.profileId}`,
    alphaBounds: Object.freeze(record.alphaBounds), pivot: Object.freeze(record.pivot),
    renderWidth: record.sourceWidth * scale, renderHeight: record.sourceHeight * scale,
    groundContact: !aquatic, visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
    identityStatus: 'reference-guided-static-pose', assetVerificationStatus: 'native-alpha-reviewed',
    reviewStatus: 'accepted-static-adaptation', provenance: 'systemic-variant', canonExact: false, identityVerified: false,
    adaptationNote: 'Variante systémique originale du projet guidée par son modèle de base ; pose fixe, sans certification canonique 1:1 ni animation livrée.',
    cost: record.targetOpaqueHeight >= 190 ? 4 : record.targetOpaqueHeight < 70 ? 1 : 3,
    // A bitmap does not supply an aquatic habitat or a swimming implementation.
    locomotion: aquatic ? 'aquatic' : 'terrestrial', bioforgeEligible: !aquatic, batch: 'v99-050' });
};
export const ENEMY_DEDICATED_POSES_V99 = Object.freeze([...ENEMY_DEDICATED_POSES_V98, ...ENEMY_DEDICATED_BATCH_V99.map(makePose)]);
export const ENEMY_DEDICATED_POSE_IDS_V99 = Object.freeze(ENEMY_DEDICATED_POSES_V99.map(p => p.profileId));
const byId = new Map(ENEMY_DEDICATED_POSES_V99.map(p => [p.profileId, p]));
export function getEnemyDedicatedPoseV99(source) {
  const id = typeof source === 'string' ? source : source?.profileId || source?.id;
  return typeof id === 'string' ? byId.get(id.split(':')[0]) || null : null;
}
export const isEnemyDedicatedPoseReadyV99 = isEnemyDedicatedPoseReadyV98;
export function drawEnemyDedicatedPoseV99(ctx, actor, image) {
  const pose = getEnemyDedicatedPoseV99(actor);
  if (!actor?.alive || !isEnemyDedicatedPoseReadyV99(image, pose)) return false;
  ctx.save(); ctx.translate(actor.x + actor.w / 2, actor.y + actor.h);
  ctx.scale((actor.facing === -1 ? -1 : 1) * pose.sourceFacing, 1);
  ctx.drawImage(image, -pose.pivot.x * pose.renderWidth, -pose.pivot.y * pose.renderHeight, pose.renderWidth, pose.renderHeight);
  ctx.restore(); return true;
}
export function enemyDedicatedCatalogVisualV99(id) {
  const pose = getEnemyDedicatedPoseV99(id);
  if (!pose) return null;
  return Object.freeze({ sheetId: null, imageKey: pose.imageKey, path: pose.path,
    grid: Object.freeze({ columns: 1, rows: 1, cellWidth: pose.sourceWidth, cellHeight: pose.sourceHeight }),
    idleClip: Object.freeze({ sheetId: null, clip: Object.freeze({ id: 'static-pose', frames: Object.freeze([0]), fps: 0, loop: false }) }),
    previewClips: Object.freeze([]), renderWidth: pose.renderWidth, renderHeight: pose.renderHeight,
    archetype: pose.name, visualMode: 'static-pose', animationStatus: 'missing', adaptationNote: pose.adaptationNote,
    historicalBehaviorPreserved: true, identity: Object.freeze({ status: pose.identityStatus,
      referenceStatus: pose.assetVerificationStatus, exact: false, canonExact: false, approximate: false, fallbackReason: null }) });
}
