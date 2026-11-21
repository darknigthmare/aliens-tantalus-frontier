// Measured original grounded attack poses, bound to the existing project plates.
export const XENO_TRIALS_PRIORITY_GROUND_DATA_V204 = [
  {
    fighterId: "synth-tecsek",
    profileId: "pose-v116-tecsek",
    kind: "ground-special",
    specialStyle: "slash",
    sourcePose: {
      profileId: "pose-v116-tecsek",
      path: "/assets/openai/sprites/static-automaton-v116/tecsek.png",
      sha256: "8fe28e660a999d6375efa9f9321da40499766fb127fb16589aa35a7107d83545",
      width: 1536,
      height: 1024,
      facing: -1,
      alphaBounds: [159, 13, 1440, 1014],
      work: "Aliens vs. Predator: Deadliest of the Species",
      anatomy: "biped automaton with white segmented shells, two overhead mechanical scythes, and clawed feet",
    },
    texture: {
      path: "/assets/openai/sprites/xeno-trials-v204/synth-tecsek-ground-special-sheet.png",
      sha256: "5deb0b2f4ea03d3415bcb086db9f87e859d8c7d091c24a25c6aecc183f6329b0",
      width: 1536,
      height: 1024,
      facing: 1,
    },
    referenceHeight: 406,
    lowAlphaMassFraction: 0.006756565726862283,
    frames: [
      {
        id: "special-windup-0", rect: [0, 0, 512, 512], alphaBounds: [58, 56, 419, 457],
        pelvis: [229, 289], anchor: [229, 457], supports: [[154, 454], [185, 454]], supportMode: "grounded",
      },
      {
        id: "special-windup-1", rect: [512, 0, 512, 512], alphaBounds: [39, 31, 432, 456],
        pelvis: [212, 296], anchor: [212, 456], supports: [[126, 454], [161, 454]], supportMode: "grounded",
      },
      {
        id: "special-active-0", rect: [1024, 0, 512, 512], alphaBounds: [26, 65, 489, 456],
        pelvis: [176, 307], anchor: [176, 456], supports: [[99, 454], [132, 453]], supportMode: "grounded",
      },
      {
        id: "special-active-1", rect: [0, 512, 512, 512], alphaBounds: [38, 67, 496, 456],
        pelvis: [169, 301], anchor: [169, 456], supports: [[104, 454], [140, 453]], supportMode: "grounded",
      },
      {
        id: "special-recovery-0", rect: [512, 512, 512, 512], alphaBounds: [28, 51, 464, 456],
        pelvis: [205, 283], anchor: [205, 456], supports: [[138, 454], [172, 454]], supportMode: "grounded",
      },
      {
        id: "special-recovery-1", rect: [1024, 512, 512, 512], alphaBounds: [61, 50, 450, 456],
        pelvis: [233, 295], anchor: [233, 456], supports: [[175, 454], [206, 453]], supportMode: "grounded",
      },
    ],
    provenance: {
      generation: "OpenAI ImageGen. Six original grounded mechanical slash keys. Original final RGBA bytes retained.",
      reference: "Matched the admitted TecSek plate for its red slit optic, two attached overhead scythes, cold worn plating and clawed feet. Native blade contact only.",
    },
  },
  {
    fighterId: "import-xeno-kingrogue",
    profileId: "pose-v106-import-xeno-kingrogue",
    kind: "ground-special",
    specialStyle: "tail",
    sourcePose: {
      profileId: "pose-v106-import-xeno-kingrogue",
      path: "/assets/openai/sprites/static-import-v106/xeno-kingrogue.png",
      sha256: "7d8d9bbe52b72be700b975999effb39b7045f03a59d8b3858214cae0eb9dafa1",
      width: 1492,
      height: 1054,
      facing: 1,
      alphaBounds: [106, 14, 1356, 1036],
      work: "Pack 270926 — design utilisateur, simulation non canonique",
      anatomy: "spined plum biped, segmented tail with a magenta leaf blade and clawed digitigrade feet",
    },
    texture: {
      path: "/assets/openai/sprites/xeno-trials-v204/import-xeno-kingrogue-ground-special-sheet.png",
      sha256: "b6fb2973f92c3392d311c4c66d2d4b2055f41093f1022459de6651c4bb09e29a",
      width: 1536,
      height: 1024,
      facing: 1,
    },
    referenceHeight: 440,
    lowAlphaMassFraction: 0.00521876174453191,
    frames: [
      {
        id: "special-windup-0", rect: [0, 0, 512, 512], alphaBounds: [18, 33, 455, 469],
        pelvis: [259, 249], anchor: [259, 469], supports: [[165, 467]], supportMode: "grounded",
      },
      {
        id: "special-windup-1", rect: [512, 0, 512, 512], alphaBounds: [35, 67, 468, 468],
        pelvis: [230, 285], anchor: [230, 468], supports: [[108, 466]], supportMode: "grounded",
      },
      {
        id: "special-active-0", rect: [1024, 0, 512, 512], alphaBounds: [23, 84, 484, 467],
        pelvis: [173, 316], anchor: [173, 467], supports: [[73, 465]], supportMode: "grounded",
      },
      {
        id: "special-active-1", rect: [0, 512, 512, 512], alphaBounds: [26, 85, 491, 472],
        pelvis: [181, 318], anchor: [181, 472], supports: [[77, 470]], supportMode: "grounded",
      },
      {
        id: "special-recovery-0", rect: [512, 512, 512, 512], alphaBounds: [46, 39, 458, 471],
        pelvis: [222, 277], anchor: [222, 471], supports: [[115, 469]], supportMode: "grounded",
      },
      {
        id: "special-recovery-1", rect: [1024, 512, 512, 512], alphaBounds: [18, 31, 456, 471],
        pelvis: [237, 264], anchor: [237, 471], supports: [[163, 469]], supportMode: "grounded",
      },
    ],
    provenance: {
      generation: "OpenAI ImageGen. Six original grounded tail-whip poses for the project adaptation. Original RGBA bytes retained.",
      reference: "Matched the admitted user plate for its plum spined biped anatomy and magenta tail blade. Existing source reference credit: PRIME1 STUDIO. Native contact only.",
    },
  },
];
