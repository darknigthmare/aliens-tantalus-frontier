// Accepted native punch poses. The simulation retains exclusive authority over damage and timing.
export const ENEMY_IMPORT_ATTACK_DATA_V109 = [
  {
    id: 'attack-v109-workingjoe-classic-light', profileId: 'pose-v103-import-synth-workingjoe-classic',
    action: 'light', path: '/assets/openai/sprites/animated-import-v109/synth-workingjoe-classic-light.png',
    sha256: 'fc69f1c078f66d69fd28091ce26dddffe70a880a552cd7681e7d17d7c950cbf7',
    sourcePoseSha256: 'c22e85f1bce901d74cd62f5616413ba0d1d365a354e3b5d601eb8d1c9a37f422',
    sourceWidth: 1254, sourceHeight: 1254, sourceFacing: -1, referenceHeight: 606,
    reviewStatus: 'accepted-multi-pose-adaptation', posesVerified: true, alphaVerified: true, canonExact: false,
    label: 'Xeno Trials : frappe légère 4 poses adaptées ; autres attaques fixes',
    frames: [
      { id: 'light-0', phase: 'preparation', rect: [0, 0, 627, 627], alphaBounds: [234, 12, 489, 618], pivot: { x: 385 / 627, y: 618 / 627 } },
      { id: 'light-1', phase: 'windup', rect: [627, 0, 627, 627], alphaBounds: [212, 12, 470, 618], pivot: { x: 343.5 / 627, y: 618 / 627 } },
      { id: 'light-2', phase: 'extension', rect: [0, 627, 627, 627], alphaBounds: [92, 10, 531, 614], pivot: { x: 406 / 627, y: 614 / 627 } },
      { id: 'light-3', phase: 'recovery', rect: [627, 627, 627, 627], alphaBounds: [194, 11, 468, 614], pivot: { x: 352.5 / 627, y: 614 / 627 } }
    ]
  }
];
