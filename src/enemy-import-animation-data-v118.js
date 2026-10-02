// Native four-pose movement supplements; original stills, hitboxes and all other
// actions keep their existing identity. PNGs are copied without pixel editing.
// Each pivot is under the pelvis on the supporting boot's floor, not the centre
// of swinging arms/grippers. Uniform scale preserves the source body's stature.
export const ENEMY_IMPORT_ANIMATION_DATA_V118 = [{
  id: 'animation-v118-synth-workingjoe-battle-walk', profileId: 'pose-v103-import-synth-workingjoe-battle',
  path: '/assets/openai/sprites/animated-import-v118/synth-workingjoe-battle-walk.png',
  sha256: 'c31381c272704f25641e0e3407cfcebcb44975814fd1c77517c415e3301c9c11',
  sourcePoseSha256: '0d48c1824ae9fc62ec15fc62fa47e8ce48386c2482604e6be5af5aee8aaa53d9',
  sourceWidth: 1247, sourceHeight: 1261, sourceFacing: -1, referenceHeight: 608,
  reviewStatus: 'accepted-multi-pose-adaptation', posesVerified: true, alphaVerified: true,
  label: 'Marche : 4 poses adaptées ; autres actions fixes', canonExact: false,
  alphaBoundsThreshold: 16,
  reviewNote: 'Quatre dessins distincts vérifiés sur blanc et noir. Cadence et raccord de boucle approximatifs ; aucune animation complète d’attaque. Dimensions natives impaires conservées avec cases entières non chevauchantes.',
  frames: [
    { id: 'walk-0', rect: [0, 0, 623, 630], alphaBounds: [168, 8, 503, 616], pivot: { x: 335 / 623, y: 616 / 630 } },
    { id: 'walk-1', rect: [623, 0, 624, 630], alphaBounds: [174, 8, 469, 616], pivot: { x: 333 / 624, y: 616 / 630 } },
    { id: 'walk-2', rect: [0, 630, 623, 631], alphaBounds: [136, 11, 505, 609], pivot: { x: 338 / 623, y: 609 / 631 } },
    { id: 'walk-3', rect: [623, 630, 624, 631], alphaBounds: [164, 9, 511, 608], pivot: { x: 332 / 624, y: 608 / 631 } }
  ], clips: { move: { frames: ['walk-0', 'walk-1', 'walk-2', 'walk-3'], fps: 6, loop: true } }
}, {
  id: 'animation-v118-automated-powerloader-walk', profileId: 'pose-v116-automated-powerloader',
  path: '/assets/openai/sprites/animated-import-v118/automated-powerloader-walk.png',
  sha256: 'ab0a63520b7646f3f265d3c349f040b836f676d0034bb8da33108341ecd625a2',
  sourcePoseSha256: '61fb2a0b6668e154ca41b50820c9875dcbfac68a1a08247cfa2005884e6d63a8',
  sourceWidth: 1254, sourceHeight: 1254, sourceFacing: -1, referenceHeight: 354,
  reviewStatus: 'accepted-multi-pose-adaptation', posesVerified: true, alphaVerified: true,
  label: 'Marche : 4 poses adaptées ; autres actions fixes', canonExact: false,
  alphaBoundsThreshold: 16,
  reviewNote: 'Automate autonome du projet, sans pilote ni siège ouvert. Quatre dessins distincts sur blanc et noir ; deux appuis et deux levées proches : mouvement de pas adapté, pas un cycle alterné complet certifié. Pinces et échappements entiers, aucune retouche des pixels.',
  frames: [
    { id: 'walk-0', rect: [0, 0, 627, 627], alphaBounds: [143, 156, 492, 506], pivot: { x: 346 / 627, y: 506 / 627 } },
    { id: 'walk-1', rect: [627, 0, 627, 627], alphaBounds: [117, 153, 450, 507], pivot: { x: 326 / 627, y: 507 / 627 } },
    { id: 'walk-2', rect: [0, 627, 627, 627], alphaBounds: [138, 104, 489, 456], pivot: { x: 344 / 627, y: 456 / 627 } },
    { id: 'walk-3', rect: [627, 627, 627, 627], alphaBounds: [116, 104, 459, 456], pivot: { x: 326 / 627, y: 456 / 627 } }
  ], clips: { move: { frames: ['walk-0', 'walk-1', 'walk-2', 'walk-3'], fps: 6, loop: true } }
}];
