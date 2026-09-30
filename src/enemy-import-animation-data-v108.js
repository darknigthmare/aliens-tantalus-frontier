// Reviewed native drawings. Separate from historical fixed-pose metadata and physics.
export const ENEMY_IMPORT_ANIMATION_DATA_V108 = [
  {
    id: 'animation-v108-workingjoe-classic-walk', profileId: 'pose-v103-import-synth-workingjoe-classic',
    path: '/assets/openai/sprites/animated-import-v108/synth-workingjoe-classic-walk.png',
    sha256: '2a8dea1816b4d78cb0404c51a0817cb9865f3081db29bcb9dd1be9e6632c873c',
    sourcePoseSha256: 'c22e85f1bce901d74cd62f5616413ba0d1d365a354e3b5d601eb8d1c9a37f422',
    sourceWidth: 1254, sourceHeight: 1254, sourceFacing: -1, referenceHeight: 579,
    reviewStatus: 'accepted-multi-pose-adaptation', posesVerified: true, alphaVerified: true,
    label: 'Marche : 4 poses adaptées ; autres actions fixes', canonExact: false,
    frames: [
      { id: 'walk-0', rect: [0, 0, 627, 627], alphaBounds: [181, 13, 524, 591], pivot: { x: 350 / 627, y: 591 / 627 } },
      { id: 'walk-1', rect: [627, 0, 627, 627], alphaBounds: [197, 13, 435, 592], pivot: { x: 324 / 627, y: 592 / 627 } },
      { id: 'walk-2', rect: [0, 627, 627, 627], alphaBounds: [172, 16, 548, 589], pivot: { x: 356 / 627, y: 589 / 627 } },
      { id: 'walk-3', rect: [627, 627, 627, 627], alphaBounds: [187, 15, 459, 590], pivot: { x: 330 / 627, y: 590 / 627 } }
    ], clips: { move: { frames: ['walk-0', 'walk-1', 'walk-2', 'walk-3'], fps: 7, loop: true } }
  },
  {
    id: 'animation-v108-game-dd-synthetic-walk', profileId: 'pose-v106-import-game-dd-synthetic',
    path: '/assets/openai/sprites/animated-import-v108/game-dd-synthetic-walk.png',
    sha256: '2764dd51ecc3670faf80b7fa62ac3f047aabf5844fb9e842e64061d0d763ba84',
    sourcePoseSha256: '9c18db44333a21bdb9f7c1d9857c9ca15f4cdea3846c3ee8918a0136b3e67bf5',
    sourceWidth: 1254, sourceHeight: 1254, sourceFacing: 1, referenceHeight: 573,
    reviewStatus: 'accepted-multi-pose-adaptation', posesVerified: true, alphaVerified: true,
    label: 'Marche : 4 poses adaptées ; autres actions fixes', canonExact: false,
    frames: [
      { id: 'walk-0', rect: [0, 0, 627, 627], alphaBounds: [176, 15, 549, 588], pivot: { x: 352 / 627, y: 588 / 627 } },
      { id: 'walk-1', rect: [627, 0, 627, 627], alphaBounds: [156, 19, 451, 592], pivot: { x: 326 / 627, y: 592 / 627 } },
      { id: 'walk-2', rect: [0, 627, 627, 627], alphaBounds: [151, 16, 562, 573], pivot: { x: 354 / 627, y: 573 / 627 } },
      { id: 'walk-3', rect: [627, 627, 627, 627], alphaBounds: [166, 16, 481, 579], pivot: { x: 318 / 627, y: 579 / 627 } }
    ], clips: { move: { frames: ['walk-0', 'walk-1', 'walk-2', 'walk-3'], fps: 7, loop: true } }
  }
];
