// Native four-pose walk supplement. Fixed source, combat boxes and other actions
// retain V113 identity/behavior; this is an adaptation, not a complete action set.
export const ENEMY_IMPORT_ANIMATION_DATA_V114 = [{
  id: 'animation-v114-afe2-spider-walk', profileId: 'pose-v113-afe2-spider',
  path: '/assets/openai/sprites/animated-import-v114/game-afe2-spider-walk.png',
  sha256: '076d214176a8ae6ea52ebd51648dfb7e20c2f69e7fb1ff54bfbdff60cbf2d13c',
  sourcePoseSha256: '117374e254ba63b1904465597a1adc33626c20c79148c0fed16ea8fbceb6852f',
  sourceWidth: 1536, sourceHeight: 1024, sourceFacing: -1, referenceHeight: 309,
  reviewStatus: 'accepted-multi-pose-adaptation', posesVerified: true, alphaVerified: true,
  label: 'Marche : 4 poses adaptées ; autres actions fixes', canonExact: false,
  frames: [
    { id: 'walk-0', rect: [0, 0, 768, 512], alphaBounds: [94, 137, 656, 446], pivot: { x: 385 / 768, y: 446 / 512 } },
    { id: 'walk-1', rect: [768, 0, 768, 512], alphaBounds: [94, 137, 663, 403], pivot: { x: 385 / 768, y: 403 / 512 } },
    { id: 'walk-2', rect: [0, 512, 768, 512], alphaBounds: [94, 116, 656, 407], pivot: { x: 385 / 768, y: 407 / 512 } },
    { id: 'walk-3', rect: [768, 512, 768, 512], alphaBounds: [95, 117, 663, 381], pivot: { x: 385 / 768, y: 381 / 512 } }
  ], clips: { move: { frames: ['walk-0', 'walk-1', 'walk-2', 'walk-3'], fps: 6, loop: true } }
}];
