// Measured original grounded attack poses, bound to the existing project plates.
export const XENO_TRIALS_PRIORITY_GROUND_DATA_V202 = [
  {
    fighterId: "rhino",
    profileId: "pose-v94-kenner-rhino",
    kind: "ground-special",
    specialStyle: "ram",
    sourcePose: {
      profileId: "pose-v94-kenner-rhino",
      path: "/assets/openai/sprites/static-enemy-v94/kenner-rhino-neca.png",
      sha256: "056cff7c33e15760ea867185dba4228542eabc291328034d40246589180e7ce8",
      width: 1310,
      height: 1201,
      facing: -1,
      alphaBounds: [26, 123, 1291, 1116],
      work: "Aliens — Kenner / NECA (figurines)",
      anatomy: "low broad quadruped with curved crest, single frontal horn, two foreclaws and spined tail",
    },
    texture: {
      path: "/assets/openai/sprites/xeno-trials-v202/rhino-ground-special-sheet.png",
      sha256: "b351bf300cf1a95b5b224028fc8cfa6bd1ca2e3294578be7e0eeb2efa65cb967",
      width: 1536,
      height: 1024,
      facing: 1,
    },
    referenceHeight: 328,
    lowAlphaMassFraction: 0.0035485173717069883,
    frames: [
      {
        id: "special-windup-0", rect: [0, 38, 502, 444], alphaBounds: [15, 38, 490, 373],
        pelvis: [164, 237], anchor: [164, 373], supports: [[245, 371]], supportMode: "grounded",
      },
      {
        id: "special-windup-1", rect: [502, 38, 491, 444], alphaBounds: [19, 82, 483, 368],
        pelvis: [169, 245], anchor: [169, 368], supports: [[176, 366]], supportMode: "grounded",
      },
      {
        id: "special-active-0", rect: [993, 38, 543, 444], alphaBounds: [9, 108, 539, 364],
        pelvis: [202, 246], anchor: [202, 364], supports: [[59, 363], [420, 361]], supportMode: "grounded",
      },
      {
        id: "special-active-1", rect: [0, 560, 514, 417], alphaBounds: [15, 89, 509, 359],
        pelvis: [166, 217], anchor: [166, 359], supports: [[116, 357], [432, 356]], supportMode: "grounded",
      },
      {
        id: "special-recovery-0", rect: [514, 560, 506, 417], alphaBounds: [8, 44, 492, 363],
        pelvis: [173, 224], anchor: [173, 363], supports: [[270, 361]], supportMode: "grounded",
      },
      {
        id: "special-recovery-1", rect: [1020, 560, 516, 417], alphaBounds: [18, 34, 505, 362],
        pelvis: [178, 226], anchor: [178, 362], supports: [[280, 360]], supportMode: "grounded",
      },
    ],
    provenance: {
      generation: "OpenAI ImageGen. Six original grounded charge keys. Original RGBA bytes retained.",
      reference: "Matched the admitted orange Rhino body, maroon armor, single leading horn and two foreclaws in a right-facing adaptation. Native ram only.",
    },
  },
  {
    fighterId: "synth-heavy",
    profileId: "pose-v94-afe-synth-heavy",
    kind: "ground-special",
    specialStyle: "pulse",
    sourcePose: {
      profileId: "pose-v94-afe-synth-heavy",
      path: "/assets/openai/sprites/static-enemy-v94/game-afe-synth-heavy.png",
      sha256: "71a4ad45aafe454e33eb7a90a9f4574b59c731fe9406f19a5382987a6a9d5a4d",
      width: 1024,
      height: 1536,
      facing: 1,
      alphaBounds: [84, 54, 1020, 1467],
      work: "Aliens: Fireteam Elite (2021)",
      anatomy: "armored synthetic biped with white plate, partial helmet and long pulse weapon",
    },
    texture: {
      path: "/assets/openai/sprites/xeno-trials-v202/synth-heavy-ground-special-sheet.png",
      sha256: "df8619d416e78c38e7285c9c2058dc51b006501467bd6a9bb9d707a977649eb5",
      width: 1536,
      height: 1024,
      facing: 1,
    },
    referenceHeight: 445,
    lowAlphaMassFraction: 0.0014786359840162169,
    frames: [
      {
        id: "special-windup-0", rect: [0, 0, 512, 512], alphaBounds: [142, 38, 417, 483],
        pelvis: [249, 255], anchor: [249, 483], supports: [[166, 481], [337, 480]], supportMode: "grounded",
      },
      {
        id: "special-windup-1", rect: [512, 0, 512, 512], alphaBounds: [54, 164, 443, 483],
        pelvis: [160, 370], anchor: [160, 483], supports: [[80, 479], [151, 481], [300, 479]], supportMode: "grounded",
      },
      {
        id: "special-active-0", rect: [1024, 0, 512, 512], alphaBounds: [58, 150, 435, 482],
        pelvis: [146, 375], anchor: [146, 482], supports: [[86, 479], [166, 480], [324, 479]], supportMode: "grounded",
      },
      {
        id: "special-active-1", rect: [0, 512, 512, 512], alphaBounds: [83, 145, 475, 466],
        pelvis: [177, 359], anchor: [177, 466], supports: [[106, 463], [185, 464], [340, 463]], supportMode: "grounded",
      },
      {
        id: "special-recovery-0", rect: [512, 512, 512, 512], alphaBounds: [101, 71, 466, 466],
        pelvis: [216, 280], anchor: [216, 466], supports: [[135, 464], [348, 464]], supportMode: "grounded",
      },
      {
        id: "special-recovery-1", rect: [1024, 512, 512, 512], alphaBounds: [144, 24, 416, 469],
        pelvis: [248, 243], anchor: [248, 469], supports: [[167, 467], [339, 466]], supportMode: "grounded",
      },
    ],
    provenance: {
      generation: "OpenAI ImageGen. Six original ground-braced pulse keys. Original RGBA bytes retained.",
      reference: "Matched the admitted Synth Heavy plate for white body armor, exposed face and blue-accented heavy weapon. The low brace follows the native pulse height.",
    },
  },
];
