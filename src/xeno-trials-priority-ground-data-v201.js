// Measured original grounded attack poses, bound to the existing project plates.
export const XENO_TRIALS_PRIORITY_GROUND_DATA_V201 = [
  {
    fighterId: "mantis",
    profileId: "pose-v96-kenner-mantis",
    kind: "ground-special",
    specialStyle: "slash",
    sourcePose: {
      profileId: "pose-v96-kenner-mantis",
      path: "/assets/openai/sprites/static-enemy-v96/mantis-alien-neca.png",
      sha256: "d84bcb3069b7eb0119fb627a6f5aef5eb60da3478b3e18a9d254a4302a564ef7",
      width: 1226,
      height: 1283,
      facing: 1,
      alphaBounds: [14, 6, 1213, 1271],
      work: "Aliens — Kenner / NECA Series 10",
      anatomy: "digitigrade biped, paired mantis blades, fenestrated crest and segmented tail",
    },
    texture: {
      path: "/assets/openai/sprites/xeno-trials-v201/mantis-ground-special-sheet.png",
      sha256: "102343a26d8d5f4339329a9f426834280df33acd8c7d216338ddd17aad5bcfe1",
      width: 1536,
      height: 1024,
      facing: 1,
    },
    referenceHeight: 429,
    lowAlphaMassFraction: 0.007617747702665933,
    frames: [
      {
        id: "special-windup-0", rect: [4, 12, 501, 490], alphaBounds: [30, 56, 427, 453],
        pelvis: [210, 287], anchor: [210, 453], supports: [[165, 450]], supportMode: "grounded",
      },
      {
        id: "special-windup-1", rect: [513, 12, 509, 490], alphaBounds: [12, 33, 481, 452],
        pelvis: [171, 290], anchor: [171, 452], supports: [[124, 450]], supportMode: "grounded",
      },
      {
        id: "special-active-0", rect: [1022, 12, 514, 490], alphaBounds: [3, 54, 505, 452],
        pelvis: [145, 302], anchor: [145, 452], supports: [[54, 449]], supportMode: "grounded",
      },
      {
        id: "special-active-1", rect: [4, 517, 501, 496], alphaBounds: [29, 59, 493, 466],
        pelvis: [200, 304], anchor: [200, 466], supports: [[226, 463]], supportMode: "grounded",
      },
      {
        id: "special-recovery-0", rect: [512, 517, 510, 496], alphaBounds: [23, 44, 419, 462],
        pelvis: [188, 288], anchor: [188, 462], supports: [[160, 460]], supportMode: "grounded",
      },
      {
        id: "special-recovery-1", rect: [1022, 517, 514, 496], alphaBounds: [3, 38, 433, 467],
        pelvis: [188, 282], anchor: [188, 467], supports: [[149, 464]], supportMode: "grounded",
      },
    ],
    provenance: {
      generation: "OpenAI ImageGen. Six original grounded blades-only attack keys. Original RGBA bytes retained.",
      reference: "Matched the admitted Mantis plate for green biomechanical plating, silver blade edges, fenestrated crest and golden tail tip. Native slash only.",
    },
  },
  {
    fighterId: "synth-sniper",
    profileId: "pose-v94-afe-synth-sniper",
    kind: "ground-special",
    specialStyle: "pulse",
    sourcePose: {
      profileId: "pose-v94-afe-synth-sniper",
      path: "/assets/openai/sprites/static-enemy-v94/game-afe-synth-sniper.png",
      sha256: "6541a21be18321c71b2e8e2a8b76f5ac7e58581babe5e190a3dcde6247f5977b",
      width: 1024,
      height: 1536,
      facing: 1,
      alphaBounds: [189, 26, 846, 1513],
      work: "Aliens: Fireteam Elite (2021)",
      anatomy: "pale synthetic security biped, black contoured armor and compact sidearm",
    },
    texture: {
      path: "/assets/openai/sprites/xeno-trials-v201/synth-sniper-ground-special-sheet.png",
      sha256: "135332bfa49869570d2c0d88b9529fbfd862509cb474494dec2646cb96b8849b",
      width: 1536,
      height: 1024,
      facing: 1,
    },
    referenceHeight: 454,
    lowAlphaMassFraction: 0.0010424781367052922,
    frames: [
      {
        id: "special-windup-0", rect: [0, 0, 512, 512], alphaBounds: [129, 32, 391, 487],
        pelvis: [247, 251], anchor: [247, 487], supports: [[161, 485]], supportMode: "grounded",
      },
      {
        id: "special-windup-1", rect: [512, 0, 512, 512], alphaBounds: [87, 173, 398, 484],
        pelvis: [188, 368], anchor: [188, 484], supports: [[113, 482], [201, 482], [318, 481]], supportMode: "grounded",
      },
      {
        id: "special-active-0", rect: [1024, 0, 512, 512], alphaBounds: [55, 173, 380, 484],
        pelvis: [143, 368], anchor: [143, 484], supports: [[80, 482], [170, 481], [284, 481]], supportMode: "grounded",
      },
      {
        id: "special-active-1", rect: [0, 512, 512, 512], alphaBounds: [88, 175, 412, 484],
        pelvis: [170, 372], anchor: [170, 484], supports: [[112, 482], [200, 483], [319, 481]], supportMode: "grounded",
      },
      {
        id: "special-recovery-0", rect: [512, 512, 512, 512], alphaBounds: [94, 84, 348, 486],
        pelvis: [176, 285], anchor: [176, 486], supports: [[128, 484]], supportMode: "grounded",
      },
      {
        id: "special-recovery-1", rect: [1024, 512, 512, 512], alphaBounds: [132, 32, 364, 486],
        pelvis: [229, 253], anchor: [229, 486], supports: [[162, 484]], supportMode: "grounded",
      },
    ],
    provenance: {
      generation: "OpenAI ImageGen. Six original grounded sidearm keys with a low brace. Original RGBA bytes retained.",
      reference: "Matched admitted Synth Sniper plate for pale exposed face, red status light, dark armor and compact sidearm. The low brace follows the native pulse height.",
    },
  },
];
