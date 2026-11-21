// Measured original grounded attack poses, bound to the existing project plates.
export const XENO_TRIALS_PRIORITY_GROUND_DATA_V203 = [
  {
    fighterId: "armored-joe",
    profileId: "enemy-145-armored-working-joe",
    kind: "ground-special",
    specialStyle: "ram",
    sourcePose: {
      profileId: "enemy-145-armored-working-joe",
      path: "/assets/openai/sprites/static-enemy-v96/armored-working-joe.png",
      sha256: "e361bb35804e23c66a2b981375d3eff3b99361f684ba394ce93f6bf9c7d28210",
      width: 1024,
      height: 1536,
      facing: 1,
      alphaBounds: [325, 131, 723, 1381],
      anatomy: "bald visibly synthetic biped in dark segmented protective armor and ochre coveralls",
    },
    texture: {
      path: "/assets/openai/sprites/xeno-trials-v203/armored-joe-ground-special-sheet.png",
      sha256: "cf3c2495d6c70ce1bb94673e65b2310ba78fa064e097c1c72abc17b81ee60c9c",
      width: 1536,
      height: 1024,
      facing: 1,
    },
    referenceHeight: 468,
    lowAlphaMassFraction: 0.0014951344390493448,
    frames: [
      {
        id: "special-windup-0", rect: [0, 0, 512, 512], alphaBounds: [151, 18, 344, 483],
        pelvis: [227, 245], anchor: [227, 483], supports: [[201, 481]], supportMode: "grounded",
      },
      {
        id: "special-windup-1", rect: [512, 0, 512, 512], alphaBounds: [108, 44, 359, 482],
        pelvis: [204, 265], anchor: [204, 482], supports: [[159, 480]], supportMode: "grounded",
      },
      {
        id: "special-active-0", rect: [1024, 0, 512, 512], alphaBounds: [42, 78, 407, 479],
        pelvis: [217, 279], anchor: [217, 479], supports: [[93, 477]], supportMode: "grounded",
      },
      {
        id: "special-active-1", rect: [0, 512, 512, 512], alphaBounds: [60, 74, 441, 478],
        pelvis: [247, 273], anchor: [247, 478], supports: [[100, 476]], supportMode: "grounded",
      },
      {
        id: "special-recovery-0", rect: [512, 512, 512, 512], alphaBounds: [122, 29, 371, 476],
        pelvis: [231, 251], anchor: [231, 476], supports: [[178, 474], [342, 473]], supportMode: "grounded",
      },
      {
        id: "special-recovery-1", rect: [1024, 512, 512, 512], alphaBounds: [168, 13, 335, 481],
        pelvis: [235, 245], anchor: [235, 481], supports: [[220, 479]], supportMode: "grounded",
      },
    ],
    provenance: {
      generation: "OpenAI ImageGen. Six original grounded armored-body check keys. Original RGBA bytes retained.",
      reference: "Matched the admitted armored Working Joe plate for exposed pale synthetic face, ochre coveralls and rectangular protective armor. Native grounded ram only.",
    },
  },
  {
    fighterId: "synth-good-boy",
    profileId: "pose-v116-sunspot-good-boy",
    kind: "ground-special",
    specialStyle: "pulse",
    sourcePose: {
      profileId: "pose-v116-sunspot-good-boy",
      path: "/assets/openai/sprites/static-automaton-v116/sunspot-good-boy.png",
      sha256: "e8b138616c3599b8642a385af6bf53deedf2da3c52d6791a7b1918dc95a9b747",
      width: 1536,
      height: 1024,
      facing: -1,
      alphaBounds: [117, 79, 1441, 955],
      work: "Alien: Into Charybdis / Inferno’s Fall / Seventh Circle",
      anatomy: "rectangular four-leg automaton, wedge optic head and four piston limbs",
    },
    texture: {
      path: "/assets/openai/sprites/xeno-trials-v203/synth-good-boy-ground-special-sheet.png",
      sha256: "6b6f4cf30602e8b962e78168350a2fe5dab721965d493df26561fc5317c72b28",
      width: 1536,
      height: 1024,
      facing: 1,
    },
    referenceHeight: 368,
    lowAlphaMassFraction: 0.002010454626027003,
    frames: [
      {
        id: "special-windup-0", rect: [0, 0, 512, 512], alphaBounds: [45, 84, 497, 460],
        pelvis: [115, 220], anchor: [115, 460], supports: [[360, 458]], supportMode: "grounded",
      },
      {
        id: "special-windup-1", rect: [512, 0, 498, 512], alphaBounds: [26, 138, 472, 457],
        pelvis: [98, 244], anchor: [98, 457], supports: [[369, 455]], supportMode: "grounded",
      },
      {
        id: "special-active-0", rect: [1010, 0, 526, 512], alphaBounds: [11, 186, 477, 456],
        pelvis: [89, 303], anchor: [89, 456], supports: [[130, 452], [368, 454]], supportMode: "grounded",
      },
      {
        id: "special-active-1", rect: [0, 512, 512, 512], alphaBounds: [43, 141, 494, 427],
        pelvis: [117, 241], anchor: [117, 427], supports: [[146, 423], [387, 425]], supportMode: "grounded",
      },
      {
        id: "special-recovery-0", rect: [512, 512, 512, 512], alphaBounds: [25, 107, 479, 426],
        pelvis: [96, 214], anchor: [96, 426], supports: [[111, 423], [362, 424]], supportMode: "grounded",
      },
      {
        id: "special-recovery-1", rect: [1024, 512, 512, 512], alphaBounds: [20, 59, 479, 427],
        pelvis: [82, 188], anchor: [82, 427], supports: [[333, 425]], supportMode: "grounded",
      },
    ],
    provenance: {
      generation: "OpenAI ImageGen. Six original grounded pulse poses for the industrial quadruped. Original RGBA bytes retained.",
      reference: "Matched the admitted Good Boy plate for four piston legs, rotary joints, two dorsal pods and wedge-shaped optic head. Lowered head follows the native pulse height.",
    },
  },
];
