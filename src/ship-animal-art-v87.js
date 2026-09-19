import { NOISETTE_RECTS_V87, CAFE_RECTS_V87, TIC_RECTS_V87, TAC_RECTS_V87 } from './ship-animal-bonded-frames-v87.js';

const clip = (id, indices, fps, loop, review = 'poses-inspected-motion-unverified') => Object.freeze({
  id, frames: Object.freeze(indices), fps, loop, review
});
export const SHIP_ANIMAL_CLIPS_V87 = Object.freeze({
  walk: clip('walk', [0, 1, 2, 3, 4, 5, 6, 7], 8, true),
  idle: clip('idle', [8, 9, 10, 11], 2, true),
  sitDown: clip('sitDown', [12, 13, 14, 15], 5, false),
  eat: clip('eat', [16, 17, 18, 19, 20, 21, 22, 23], 4, true),
  sleep: clip('sleep', [24, 25, 26, 27], 1, true),
  pet: clip('pet', [28, 29, 30, 31], 3, false)
});

// Source rectangles follow measured alpha silhouettes, NOT a nominal 192 px grid.
// Last two values are the local ground-contact anchor. Feeding excludes the tongue.
const MOKA_RECTS = [
  [13,65,184,163,92.5,159], [203,59,184,170,86,165], [392,59,184,170,88.5,166], [586,59,180,170,85.5,166],
  [771,61,185,168,82.5,164], [962,63,181,166,77,161], [1156,69,181,160,93.5,156], [1347,69,178,160,72.5,156],
  [14,301,180,171,86,166], [205,300,180,172,82.5,167], [396,299,180,173,82,168], [587,300,179,172,83,167],
  [779,325,179,147,95,142], [975,324,176,146,88,141], [1166,327,170,143,80,138], [1364,313,143,160,68,154],
  [11,539,180,175,78.5,171], [204,540,177,175,77.5,170], [389,558,180,157,82,152], [579,558,185,157,85,152],
  [773,558,182,157,82.5,152], [968,552,177,163,79,158], [1160,549,174,166,76.5,161], [1348,538,173,177,76.5,172],
  [19,866,171,91,84,86], [209,866,170,91,84.5,86], [398,866,172,91,85,86], [590,864,167,93,86,88],
  [792,775,138,183,64,178], [981,772,134,187,65,182], [1172,773,136,186,63.5,181], [1361,772,146,187,66.5,182]
];
const BRUME_RECTS = [
  [6,76,193,153,94.5,149], [199,76,188,153,79,149], [387,74,189,155,90,151], [576,75,191,154,88,150],
  [768,75,192,154,94,150], [960,75,193,154,91,150], [1153,75,189,154,88.5,150], [1342,75,189,154,96,150],
  [4,308,193,169,88,164], [197,307,189,170,85,165], [386,308,191,169,88,164], [577,308,189,169,85,164],
  [766,317,188,160,94.5,155], [958,308,189,169,80.5,164], [1153,309,178,168,79.5,164], [1350,302,162,175,77.5,171],
  [7,584,188,133,86,126], [195,584,189,136,86,126], [384,584,189,136,86.5,126], [574,584,190,136,88,127],
  [766,586,189,130,88,125], [957,587,189,129,88.5,124], [1148,586,188,131,89,125], [1337,587,187,130,87,124],
  [9,873,177,86,90,81], [200,873,176,86,89,81], [392,873,178,86,89.5,81], [586,873,173,86,87.5,81],
  [784,782,156,191,72.5,186], [964,786,160,187,83,182], [1156,782,152,190,81.5,186], [1346,784,158,188,82,184]
];
const LUCIOLE_RECTS = [
  [9,55,182,170,91,167], [202,55,181,169,90,166], [392,55,182,170,92,167], [586,55,178,170,90,167],
  [775,55,181,170,93,167], [967,55,182,169,93,166], [1160,55,179,170,92,167], [1350,54,181,171,94,168],
  [11,294,180,179,89,176], [204,294,180,179,88,176], [396,294,178,179,88,176], [588,294,178,179,88,176],
  [792,290,166,183,76,180], [987,312,162,161,73,157], [1164,313,173,161,88,156], [1351,314,174,161,93,155],
  [16,531,184,181,84,178], [201,540,190,171,91,169], [390,539,194,173,94,170], [580,540,192,172,96,169],
  [772,540,192,172,96,169], [965,540,191,172,95,169], [1156,543,191,169,96,166], [1349,530,180,184,95,179],
  [23,848,169,97,77,94], [212,848,171,97,80,94], [407,848,169,97,77,94], [598,848,169,97,78,94],
  [783,780,168,167,85,164], [961,770,175,177,99,174], [1153,772,174,175,99,172], [1346,773,175,174,98,171]
];
function atlas(animalId, name, rectangles, worldScale, sha256, excludedFrames = [], clipOverrides = {}, options = {}) {
  const frames = rectangles.map(([x, y, w, h, pivotX, pivotY], index) => Object.freeze({
    index, x, y, w, h, pivotX, pivotY, safe: !excludedFrames.includes(index),
    exclusionReason: excludedFrames.includes(index) ? 'adjacent-silhouette-alpha-fringe' : null
  }));
  const selectedClips = { ...SHIP_ANIMAL_CLIPS_V87, ...clipOverrides };
  if (options.enclosed) {
    delete selectedClips.pet;
    selectedClips.groom = clip('groom', [28, 29, 30, 31], 3, false);
  }
  const clips = Object.freeze(selectedClips);
  return Object.freeze({ animalId, path: `/assets/openai/ship-animals/v87/${name}-atlas${options.variant || ''}.png`,
    width: 1536, height: 1024, worldScale, sourceFacing: 1, sha256,
    sourceLayout: Object.freeze({ columns: options.columns || 8, rows: options.rows || 4 }),
    frames: Object.freeze(frames), clips,
    coverage: Object.freeze({ totalAuthored: 32, runtimeSafe: 32 - excludedFrames.length,
      excludedFrames: Object.freeze([...excludedFrames]), fluidityCertified: false }) });
}
export const SHIP_ANIMAL_ATLASES_V87 = Object.freeze({
  'animal-moka': atlas('animal-moka', 'moka', MOKA_RECTS, 0.20,
    'e154e8dae89a090bfcf14709dd984ade40f640a3b085af0347b0d7fdfcd828ad'),
  // Poses 10/11 share alpha fringes at x577. They are never sampled or repainted.
  'animal-brume': atlas('animal-brume', 'brume', BRUME_RECTS, 0.30,
    '74cfd0abd381be41a095bb2a194e056c9519339c91df481740937d5996b20335', [10, 11], {
      idle: clip('idle', [8, 9], 2, true, 'reduced-two-pose-idle-needs-regeneration') }),
  // Eating poses 18/19 contain neighboring alpha. Keep the evidence, never draw them.
  'animal-luciole': atlas('animal-luciole', 'luciole', LUCIOLE_RECTS, 0.20,
    '8bef1544aa5cb78f3a2aeec25657e42779620b62f13fe118639399ee2468030a', [18, 19], {
      eat: clip('eat', [16, 17, 20, 21, 22, 23], 4, true, 'reduced-six-pose-eating-needs-regeneration') }),
  'animal-noisette': atlas('animal-noisette', 'noisette', NOISETTE_RECTS_V87, 0.2,
    '8677223b6b12a054163711fa3214cb1610b2d364d934a6da88410dbe023f2aa8', [], {}, { enclosed: true, columns: 4, rows: 8, variant: '-v2' }),
  'animal-cafe': atlas('animal-cafe', 'cafe', CAFE_RECTS_V87, 0.17,
    'e004a825fab476379f20dfd1430f62e35d53ec7ab3531d94e78a95ba1f320289', [], {}, { enclosed: true, columns: 8, rows: 4, variant: '' }),
  'animal-tic': atlas('animal-tic', 'tic', TIC_RECTS_V87, 0.1,
    '9d5f9bed93e5ae630eed274009c9088ea1ff0048e7b01c8e41f27506855f94a0', [], {}, { enclosed: true, columns: 4, rows: 8, variant: '-v2' }),
  'animal-tac': atlas('animal-tac', 'tac', TAC_RECTS_V87, 0.105,
    '74623814bc277fb714c82437770cdf8c03e09c5e019967a09bca5610de102091', [], {}, { enclosed: true, columns: 4, rows: 8, variant: '-v2' })
});
const knownAtlas = animalId => Object.hasOwn(SHIP_ANIMAL_ATLASES_V87, animalId) ? SHIP_ANIMAL_ATLASES_V87[animalId] : null;
const finite = value => typeof value === 'number' && Number.isFinite(value);

export function resolveShipAnimalFrameV87(animalId, clipId = 'idle', elapsed = 0) {
  const selectedAtlas = knownAtlas(animalId);
  const selectedClip = selectedAtlas && Object.hasOwn(selectedAtlas.clips, clipId) && selectedAtlas.clips[clipId];
  if (!selectedClip || !finite(elapsed) || elapsed < 0 || elapsed * selectedClip.fps > Number.MAX_SAFE_INTEGER) return null;
  const step = Math.floor(elapsed * selectedClip.fps);
  const position = selectedClip.loop ? step % selectedClip.frames.length : Math.min(step, selectedClip.frames.length - 1);
  const index = selectedClip.frames[position];
  const frame = selectedAtlas.frames[index];
  if (!frame?.safe || frame.x < 0 || frame.y < 0 || frame.x + frame.w > selectedAtlas.width
    || frame.y + frame.h > selectedAtlas.height || frame.w <= 0 || frame.h <= 0) return null;
  return { atlas: selectedAtlas, clip: selectedClip, frame, index,
    complete: !selectedClip.loop && elapsed >= selectedClip.frames.length / selectedClip.fps };
}

export function isShipAnimalAtlasReadyV87(animalId, image) {
  const selectedAtlas = knownAtlas(animalId);
  if (!selectedAtlas || image?.complete !== true || image.naturalWidth !== selectedAtlas.width
    || image.naturalHeight !== selectedAtlas.height) return false;
  // Matching dimensions alone must not accept the other companion's atlas.
  const path = String(image.currentSrc || image.src || '').split(/[?#]/)[0];
  return path.endsWith(selectedAtlas.path);
}

/** x/y is the physical paw anchor. Pose width/height never changes the identity's world scale. */
export function drawShipAnimalV87(ctx, image, options = {}) {
  if (!options || !finite(options.x) || !finite(options.y)
    || !['save', 'restore', 'translate', 'scale', 'drawImage'].every(name => typeof ctx?.[name] === 'function')) return false;
  const { animalId, clipId = 'idle', elapsed = 0, x, y, facing = 1 } = options;
  if (![1, -1].includes(facing) || !isShipAnimalAtlasReadyV87(animalId, image)) return false;
  const sample = resolveShipAnimalFrameV87(animalId, clipId, elapsed);
  if (!sample) return false;
  const { frame, atlas: selectedAtlas } = sample;
  const scale = selectedAtlas.worldScale;
  ctx.save();
  try {
    ctx.translate(x, y);
    ctx.scale(facing === selectedAtlas.sourceFacing ? 1 : -1, 1);
    ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h,
      -frame.pivotX * scale, -frame.pivotY * scale, frame.w * scale, frame.h * scale);
  } finally { ctx.restore(); }
  return true;
}
