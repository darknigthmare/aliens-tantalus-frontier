// Art-only replacements for three EXISTING systemic variants. These definitions
// never enter the appended-creature catalog, actor factory or AI registry.
const makePose = (profileId, name, filename, width, height, bounds, sha256) => {
  const scale = 96 / (bounds[3] - bounds[1]);
  return Object.freeze({
    id: profileId, profileId, name, family: 'enemy',
    path: `/assets/openai/sprites/static-enemy-v96/${filename}.png`,
    imageKey: `enemyDedicatedPoseV96:${profileId}`, sourceWidth: width, sourceHeight: height,
    alphaBounds: Object.freeze(bounds), sha256,
    renderWidth: width * scale, renderHeight: height * scale,
    pivot: Object.freeze({ x: .5, y: bounds[3] / height }), sourceFacing: 1,
    groundContact: true, visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
    identityStatus: 'reference-guided-static-pose', assetVerificationStatus: 'native-alpha-reviewed',
    reviewStatus: 'accepted-static-adaptation', provenance: 'systemic-variant', canonExact: false, identityVerified: false,
    adaptationNote: 'Variante blindée systémique du projet, pose originale guidée par les références ; aucune certification canonique 1:1 ni animation livrée.',
    cost: 3, locomotion: 'terrestrial'
  });
};

export const ENEMY_DEDICATED_POSES_V96 = Object.freeze([
  makePose('enemy-145-armored-working-joe', 'Armored Working Joe', 'armored-working-joe',
    1024, 1536, [325, 131, 723, 1381], 'e361bb35804e23c66a2b981375d3eff3b99361f684ba394ce93f6bf9c7d28210'),
  makePose('enemy-146-armored-combat-synthetic', 'Armored Combat Synthetic', 'armored-combat-synthetic',
    1205, 1306, [299, 93, 1026, 1229], 'fb161cf728b2f8f4fa5f7ef7b894a7aed7a2f5cae79e122cbabc96ad2d4afd39'),
  makePose('enemy-147-armored-weyland-yutani-commando', 'Armored Weyland-Yutani Commando', 'armored-weyland-yutani-commando',
    1254, 1254, [320, 148, 994, 1152], '99eab349657c0b977ae47612dda84db5942a3872f6c6b4abddba125c2d77fc40')
]);
export const ENEMY_DEDICATED_POSE_IDS_V96 = Object.freeze(ENEMY_DEDICATED_POSES_V96.map(pose => pose.profileId));
const byId = new Map(ENEMY_DEDICATED_POSES_V96.map(pose => [pose.profileId, pose]));

/** Exact identity only; old campaign actors encode the source ID before ':'. */
export function getEnemyDedicatedPoseV96(source) {
  const id = typeof source === 'string' ? source : source?.profileId || source?.id;
  return typeof id === 'string' ? byId.get(id.split(':')[0]) || null : null;
}

export function isEnemyDedicatedPoseReadyV96(image, pose) {
  return Boolean(pose && image?.complete && image.naturalWidth === pose.sourceWidth
    && image.naturalHeight === pose.sourceHeight);
}

/** Draw the untouched whole PNG isotropically. Do not invent death/attack clips. */
export function drawEnemyDedicatedPoseV96(ctx, enemy, image) {
  const pose = getEnemyDedicatedPoseV96(enemy);
  if (!enemy?.alive || !isEnemyDedicatedPoseReadyV96(image, pose)) return false;
  ctx.save();
  ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h);
  ctx.scale(enemy.facing === -1 ? -1 : 1, 1);
  ctx.drawImage(image, -pose.pivot.x * pose.renderWidth, -pose.pivot.y * pose.renderHeight,
    pose.renderWidth, pose.renderHeight);
  ctx.restore();
  return true;
}

export function enemyDedicatedCatalogVisualV96(id) {
  const d = getEnemyDedicatedPoseV96(id);
  if (!d) return null;
  return Object.freeze({ sheetId: null, imageKey: d.imageKey, path: d.path,
    grid: Object.freeze({ columns: 1, rows: 1, cellWidth: d.sourceWidth, cellHeight: d.sourceHeight }),
    idleClip: Object.freeze({ sheetId: null, clip: Object.freeze({ id: 'static-pose', frames: Object.freeze([0]), fps: 0, loop: false }) }),
    previewClips: Object.freeze([]), renderWidth: d.renderWidth, renderHeight: d.renderHeight,
    archetype: d.name, visualMode: 'static-pose', animationStatus: 'missing', adaptationNote: d.adaptationNote,
    historicalBehaviorPreserved: true,
    identity: Object.freeze({ status: d.identityStatus, referenceStatus: d.assetVerificationStatus,
      exact: false, canonExact: false, approximate: false, fallbackReason: null })
  });
}
