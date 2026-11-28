import { getXenoTrialsReferencedPresentationPlateV231 } from './xeno-trials-research-art-v231.js';
// Painted presentation plates stay separate from procedural choreography and
// ordinary attacks. Exact identity/variant lookup never borrows another body.
export const XENO_TRIALS_PRESENTATION_PLATES_V230 = Object.freeze([
  {
    "fighterId": "warrior",
    "variant": null,
    "kind": "select",
    "path": "/assets/openai/xeno-trials-v230/warrior-select.png",
    "sha256": "469b8c02f9b21df04aca935f65852f365b0ea51abcbe94735ac2965ffe116471",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceFacing": 1,
    "alphaBounds": [
      91,
      22,
      1371,
      995
    ],
    "rootX": 1083,
    "rootY": 994,
    "density": 0.96,
    "statureHeight": 1013.5416666666667,
    "canonExact": false
  },
  {
    "fighterId": "warrior",
    "variant": null,
    "kind": "intro",
    "path": "/assets/openai/xeno-trials-v230/warrior-intro.png",
    "sha256": "9efcd828be3067c83a73f4b3214ddeaf7bea057bbfec0f85d26b276342647d7e",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceFacing": 1,
    "alphaBounds": [
      59,
      80,
      1484,
      954
    ],
    "rootX": 1023,
    "rootY": 953,
    "density": 0.96,
    "statureHeight": 910.4166666666667,
    "canonExact": false
  }
].map(plate => Object.freeze({ ...plate, alphaBounds: Object.freeze(plate.alphaBounds) })));

export function getXenoTrialsPresentationPlateV230(kind, id, variant = null) {
  return getXenoTrialsReferencedPresentationPlateV231(kind, id, variant) || XENO_TRIALS_PRESENTATION_PLATES_V230.find(plate => plate.kind === kind
    && plate.fighterId === id && plate.variant === variant) || null;
}

export function getXenoTrialsPresentationAssetsV230() {
  return Object.freeze([...new Set(XENO_TRIALS_PRESENTATION_PLATES_V230.map(plate => plate.path))]);
}
