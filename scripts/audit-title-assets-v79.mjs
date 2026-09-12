import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPOSITORY_ROOT = resolve(dirname(SCRIPT_PATH), '..');
const DEFAULT_MANIFEST = 'docs/references/v79-title-scene-production/asset-manifest.json';
const DEFAULT_PROMPTS = 'docs/references/v79-title-scene-production/openai-prompt-recipes.json';
const SOURCE_RECEIPT_ROOT = 'docs/references/v79-title-scene-production/source-receipts';

export const EXPECTED_SLOT_IDS = Object.freeze({
  space: Object.freeze(['space-01-deep-frontier']),
  stars: Object.freeze(['stars-01-distant-field', 'stars-02-near-sparks']),
  nebula: Object.freeze(['nebula-01-cold-ion', 'nebula-02-amber-dust']),
  planet: Object.freeze([
    'planet-01-acheron',
    'planet-02-ceto-basin',
    'planet-03-mire-9',
    'planet-04-lv-223',
    'planet-05-fiorina-161',
    'planet-06-lethe',
    'planet-07-lv-895',
    'planet-08-purdan',
    'planet-09-freyas-prospect',
    'planet-10-jacksons-star',
    'planet-11-new-galveston',
    'planet-12-new-albion',
    'planet-13-lv-1201',
    'planet-14-bg-386',
    'planet-15-capua-vii',
    'planet-16-ryushi',
    'planet-17-korari',
    'planet-18-lv-742',
    'planet-19-echo-basin',
    'planet-20-pallas-rift'
  ]),
  atmosphere: Object.freeze([
    'atmosphere-01-ceto-cyan',
    'atmosphere-02-acheron-storm',
    'atmosphere-03-mire-9',
    'atmosphere-04-red-plasma'
  ]),
  clouds: Object.freeze([
    'clouds-01-acheron-storm',
    'clouds-02-storm-spiral',
    'clouds-03-ash-veil',
    'clouds-04-toxic-cells'
  ]),
  orbitals: Object.freeze([
    'orbitals-01-tantalus-transport',
    'orbitals-02-defense-ring',
    'orbitals-03-comms-relay',
    'orbitals-04-shipyard-truss',
    'orbitals-05-science-station',
    'orbitals-06-refinery-spine',
    'orbitals-07-derelict-freighter',
    'orbitals-08-elevator-terminal'
  ]),
  traffic: Object.freeze(['traffic-01-utility-shuttle', 'traffic-02-patrol-wing']),
  debris: Object.freeze(['debris-01-wreck-field', 'debris-02-micrometeor-dust', 'debris-03-ice-shards']),
  foreground: Object.freeze(['foreground-01-port-hull', 'foreground-02-starboard-truss']),
  vfx: Object.freeze([
    'vfx-01-ion-exhaust',
    'vfx-02-beacon-pulse',
    'vfx-03-scan-sweep',
    'vfx-04-electrical-arcs',
    'vfx-05-cryo-particles'
  ])
});

export const EXPECTED_CATEGORY_CONTRACTS = Object.freeze({
  space: Object.freeze({ width: 1600, height: 900, alphaPolicy: 'opaque', perspective: 'deep-space-background', minAlphaMax: 255, minTransparentRatio: 0, minVisibleRatio: 0.99, maxVisibleRatio: 1, maxOpaqueNearWhiteBorderRatio: 0.01, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([2, 6]) }),
  stars: Object.freeze({ width: 1600, height: 900, alphaPolicy: 'transparent', perspective: 'orthographic-screen-layer', minAlphaMax: 32, minTransparentRatio: 0.8, minVisibleRatio: 0.001, maxVisibleRatio: 0.2, maxOpaqueNearWhiteBorderRatio: 0.01, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([6]) }),
  nebula: Object.freeze({ width: 1600, height: 900, alphaPolicy: 'transparent', perspective: 'orthographic-screen-layer', minAlphaMax: 64, minTransparentRatio: 0.2, minVisibleRatio: 0.02, maxVisibleRatio: 0.8, maxOpaqueNearWhiteBorderRatio: 0.01, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([6]) }),
  planet: Object.freeze({ width: 1024, height: 1024, alphaPolicy: 'transparent', perspective: 'three-quarter-orbital-sphere', minAlphaMax: 250, minTransparentRatio: 0.25, minVisibleRatio: 0.15, maxVisibleRatio: 0.72, maxOpaqueNearWhiteBorderRatio: 0.002, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([6]) }),
  atmosphere: Object.freeze({ width: 1024, height: 1024, alphaPolicy: 'transparent', perspective: 'front-aligned-spherical-overlay', minAlphaMax: 64, minTransparentRatio: 0.55, minVisibleRatio: 0.005, maxVisibleRatio: 0.45, maxOpaqueNearWhiteBorderRatio: 0.002, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([6]) }),
  clouds: Object.freeze({ width: 1024, height: 1024, alphaPolicy: 'transparent', perspective: 'front-aligned-spherical-overlay', minAlphaMax: 64, minTransparentRatio: 0.5, minVisibleRatio: 0.01, maxVisibleRatio: 0.5, maxOpaqueNearWhiteBorderRatio: 0.002, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([6]) }),
  orbitals: Object.freeze({ width: 1600, height: 900, alphaPolicy: 'transparent', perspective: 'side-profile-orbital', minAlphaMax: 250, minTransparentRatio: 0.55, minVisibleRatio: 0.02, maxVisibleRatio: 0.45, maxOpaqueNearWhiteBorderRatio: 0.002, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([6]) }),
  traffic: Object.freeze({ width: 1600, height: 900, alphaPolicy: 'transparent', perspective: 'side-profile-orbital', minAlphaMax: 200, minTransparentRatio: 0.72, minVisibleRatio: 0.002, maxVisibleRatio: 0.28, maxOpaqueNearWhiteBorderRatio: 0.002, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([6]) }),
  debris: Object.freeze({ width: 1600, height: 900, alphaPolicy: 'transparent', perspective: 'orthographic-depth-layer', minAlphaMax: 180, minTransparentRatio: 0.75, minVisibleRatio: 0.002, maxVisibleRatio: 0.25, maxOpaqueNearWhiteBorderRatio: 0.002, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([6]) }),
  foreground: Object.freeze({ width: 1600, height: 900, alphaPolicy: 'transparent', perspective: 'side-profile-orbital', minAlphaMax: 250, minTransparentRatio: 0.25, minVisibleRatio: 0.05, maxVisibleRatio: 0.75, maxOpaqueNearWhiteBorderRatio: 0.002, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([6]) }),
  vfx: Object.freeze({ width: 1600, height: 900, alphaPolicy: 'transparent', perspective: 'orthographic-screen-layer', minAlphaMax: 32, minTransparentRatio: 0.7, minVisibleRatio: 0.001, maxVisibleRatio: 0.3, maxOpaqueNearWhiteBorderRatio: 0.002, maxHiddenRgbRatio: 0, allowedColorTypes: Object.freeze([6]) })
});

export const EXPECTED_SLOT_TOTAL = Object.values(EXPECTED_SLOT_IDS).reduce((sum, ids) => sum + ids.length, 0);
export const EXPECTED_PLANET_WORLD_IDS = Object.freeze({
  'planet-01-acheron': 'world-01-acheron-lv-426',
  'planet-02-ceto-basin': 'world-10-ceto',
  'planet-03-mire-9': 'world-26-mire-9',
  'planet-04-lv-223': 'world-02-lv-223',
  'planet-05-fiorina-161': 'world-03-fiorina-161',
  'planet-06-lethe': 'world-05-lethe',
  'planet-07-lv-895': 'world-06-lv-895',
  'planet-08-purdan': 'world-09-purdan',
  'planet-09-freyas-prospect': 'world-11-freya-s-prospect',
  'planet-10-jacksons-star': 'world-12-jackson-s-star',
  'planet-11-new-galveston': 'world-18-new-galveston',
  'planet-12-new-albion': 'world-19-new-albion',
  'planet-13-lv-1201': 'world-20-lv-1201',
  'planet-14-bg-386': 'world-21-bg-386',
  'planet-15-capua-vii': 'world-22-capua-vii',
  'planet-16-ryushi': 'world-23-ryushi',
  'planet-17-korari': 'world-24-korari',
  'planet-18-lv-742': 'world-25-lv-742',
  'planet-19-echo-basin': 'world-27-echo-basin',
  'planet-20-pallas-rift': 'world-29-pallas-rift'
});
const STATUS_VALUES = new Set(['missing', 'candidate', 'verified', 'integrated']);
const REQUIRED_REVIEWS = Object.freeze(['composition', 'perspective', 'scale', 'edgeQuality', 'originalDesign']);
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
};
const stableStringify = (value) => JSON.stringify(stableValue(value));
const finding = (code, message, extra = {}) => ({ code, message, ...extra });
const isSafeRelativePath = (path) => typeof path === 'string'
  && !path.startsWith('/')
  && !/^[a-z]:/iu.test(path)
  && !path.split(/[\\/]/u).includes('..');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function validateManifestData(manifest) {
  const findings = [];
  if (manifest?.schemaVersion !== 1) findings.push(finding('schema-version', 'schemaVersion must be 1.'));
  if (manifest?.release !== 'V79') findings.push(finding('release', 'release must be V79.'));
  if (manifest?.assetRoot !== 'assets/openai/ui/title/v79') findings.push(finding('asset-root', 'assetRoot is immutable for V79.'));
  if (manifest?.rightsPolicy !== 'original-ai-generated-no-official-copy') findings.push(finding('rights-policy', 'The original-only rights policy is required.'));
  if (manifest?.runtimeAcceptance !== 'integrated-only') findings.push(finding('runtime-acceptance', 'Only integrated assets may enter the runtime catalogue.'));
  if (stableStringify(manifest?.categoryContracts) !== stableStringify(EXPECTED_CATEGORY_CONTRACTS)) {
    findings.push(finding('category-contracts', 'Dimensions, alpha and perspective contracts differ from the locked V79 contract.'));
  }
  if (!Array.isArray(manifest?.slots)) return [...findings, finding('slots', 'slots must be an array.')];
  if (manifest.slots.length !== EXPECTED_SLOT_TOTAL) {
    findings.push(finding('slot-count', `Expected ${EXPECTED_SLOT_TOTAL} slots, received ${manifest.slots.length}.`));
  }

  const seenIds = new Set();
  const seenFiles = new Set();
  const expectedPairs = new Map(Object.entries(EXPECTED_SLOT_IDS).flatMap(([category, ids]) => ids.map((id) => [id, category])));
  for (const slot of manifest.slots) {
    if (!slot || typeof slot !== 'object') {
      findings.push(finding('slot-shape', 'Every slot must be an object.'));
      continue;
    }
    if (seenIds.has(slot.id)) findings.push(finding('duplicate-slot-id', `Duplicate slot id: ${slot.id}.`, { slotId: slot.id }));
    seenIds.add(slot.id);
    if (expectedPairs.get(slot.id) !== slot.category) {
      findings.push(finding('slot-identity', `Unexpected id/category pair: ${slot.id}/${slot.category}.`, { slotId: slot.id }));
    }
    const expectedFile = `${manifest.assetRoot}/${slot.category}/${slot.id}.png`;
    if (!isSafeRelativePath(slot.file) || slot.file !== expectedFile) {
      findings.push(finding('slot-path', `${slot.id} must use ${expectedFile}.`, { slotId: slot.id }));
    }
    if (seenFiles.has(slot.file)) findings.push(finding('duplicate-slot-file', `Duplicate slot file: ${slot.file}.`, { slotId: slot.id }));
    seenFiles.add(slot.file);
    if (slot.promptId !== `title-v79-${slot.id}`) findings.push(finding('prompt-id', `Prompt id mismatch for ${slot.id}.`, { slotId: slot.id }));
    if (slot.category === 'planet' && stableStringify(slot.worldIds) !== stableStringify([EXPECTED_PLANET_WORLD_IDS[slot.id]])) {
      findings.push(finding('planet-world-id', `${slot.id} must map to ${EXPECTED_PLANET_WORLD_IDS[slot.id]}.`, { slotId: slot.id }));
    }
    if (!STATUS_VALUES.has(slot.status)) findings.push(finding('slot-status', `Invalid status for ${slot.id}.`, { slotId: slot.id }));
    if (slot.status === 'missing') {
      if (slot.sha256 !== null || slot.provenance !== null || slot.runtimeId !== null) {
        findings.push(finding('missing-claim', `${slot.id} is missing and cannot carry delivery metadata.`, { slotId: slot.id }));
      }
      for (const review of REQUIRED_REVIEWS) {
        if (slot.review?.[review] !== false) findings.push(finding('missing-review', `${slot.id} missing review ${review} must stay false.`, { slotId: slot.id }));
      }
    }
    if (slot.status === 'verified' || slot.status === 'integrated') {
      if (!/^[a-f0-9]{64}$/u.test(slot.sha256 ?? '')) findings.push(finding('verified-hash', `${slot.id} needs an exact SHA-256.`, { slotId: slot.id }));
      if (slot.provenance?.kind !== 'openai-imagegen-original' || !slot.provenance?.receiptId || !slot.provenance?.generatedAt) {
        findings.push(finding('verified-provenance', `${slot.id} needs an OpenAI original generation receipt and timestamp.`, { slotId: slot.id }));
      }
      const expectedSourceFile = slot.provenance?.receiptId
        ? `${SOURCE_RECEIPT_ROOT}/${slot.provenance.receiptId}.png`
        : null;
      if (!isSafeRelativePath(slot.provenance?.sourceFile) || slot.provenance?.sourceFile !== expectedSourceFile) {
        findings.push(finding('source-receipt-path', `${slot.id} needs the canonical source receipt path.`, { slotId: slot.id }));
      }
      if (!/^[a-f0-9]{64}$/u.test(slot.provenance?.sourceSha256 ?? '')) {
        findings.push(finding('source-receipt-hash', `${slot.id} needs the exact source receipt SHA-256.`, { slotId: slot.id }));
      }
      for (const review of REQUIRED_REVIEWS) {
        if (slot.review?.[review] !== true) findings.push(finding(`review-incomplete:${review}`, `${slot.id} cannot be ${slot.status} before ${review} review.`, { slotId: slot.id }));
      }
    }
    if (slot.status === 'integrated' && !/^title\.v79\.[a-z0-9.-]+$/u.test(slot.runtimeId ?? '')) {
      findings.push(finding('runtime-id', `${slot.id} needs a namespaced runtimeId before integration.`, { slotId: slot.id }));
    }
    if (slot.status !== 'integrated' && slot.runtimeId !== null) {
      findings.push(finding('premature-runtime-id', `${slot.id} is not integrated and cannot expose a runtimeId.`, { slotId: slot.id }));
    }
  }
  for (const id of expectedPairs.keys()) {
    if (!seenIds.has(id)) findings.push(finding('missing-slot-id', `Required slot absent: ${id}.`, { slotId: id }));
  }
  return findings;
}

export function validatePromptRecipes(data, manifest) {
  const findings = [];
  if (data?.schemaVersion !== 1 || data?.release !== 'V79') findings.push(finding('prompt-schema', 'Prompt recipes must use V79 schema 1.'));
  if (data?.copyrightGuard !== 'original-design-only-no-official-copy') findings.push(finding('prompt-rights', 'Prompt recipes must lock the original-design-only guard.'));
  for (const token of ['original', 'single independent layer', 'no text', 'no logo', 'no watermark', 'no collage']) {
    if (!data?.basePrompt?.toLowerCase().includes(token)) findings.push(finding('base-prompt', `Base prompt is missing required token: ${token}.`));
  }
  if (!Array.isArray(data?.recipes) || data.recipes.length !== EXPECTED_SLOT_TOTAL) {
    findings.push(finding('prompt-count', `Expected ${EXPECTED_SLOT_TOTAL} prompt recipes.`));
    return findings;
  }
  const slotById = new Map((manifest?.slots ?? []).map((slot) => [slot.id, slot]));
  const seen = new Set();
  for (const recipe of data.recipes) {
    const slot = slotById.get(recipe.slotId);
    if (!slot || recipe.promptId !== slot.promptId) findings.push(finding('prompt-link', `Prompt recipe is not linked to a manifest slot: ${recipe.promptId}.`));
    if (seen.has(recipe.promptId)) findings.push(finding('duplicate-prompt', `Duplicate prompt: ${recipe.promptId}.`));
    seen.add(recipe.promptId);
    for (const field of ['subject', 'composition', 'palette', 'lighting']) {
      if (typeof recipe[field] !== 'string' || recipe[field].trim().length < 12) findings.push(finding('prompt-detail', `${recipe.promptId} needs a concrete ${field}.`));
    }
    if (slot && recipe.perspective !== manifest.categoryContracts[slot.category].perspective) {
      findings.push(finding('prompt-perspective', `${recipe.promptId} does not use the locked ${slot.category} perspective.`, { slotId: slot.id }));
    }
    const serialized = JSON.stringify(recipe);
    if (/https?:\/\//iu.test(serialized)) findings.push(finding('prompt-external-reference', `${recipe.promptId} embeds an external reference URL.`));
  }
  return findings;
}

const paeth = (left, up, upperLeft) => {
  const prediction = left + up - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const upDistance = Math.abs(prediction - up);
  const upperLeftDistance = Math.abs(prediction - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  return upDistance <= upperLeftDistance ? up : upperLeft;
};

export function inspectPng(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 33 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('Invalid PNG signature.');
  let cursor = 8;
  let ihdr = null;
  const idat = [];
  while (cursor + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(cursor);
    const type = bytes.toString('ascii', cursor + 4, cursor + 8);
    const start = cursor + 8;
    const end = start + length;
    if (end + 4 > bytes.length) throw new Error(`Truncated PNG chunk ${type}.`);
    if (type === 'IHDR') ihdr = bytes.subarray(start, end);
    if (type === 'IDAT') idat.push(bytes.subarray(start, end));
    cursor = end + 4;
    if (type === 'IEND') break;
  }
  if (!ihdr || ihdr.length !== 13 || idat.length === 0) throw new Error('PNG requires IHDR and IDAT chunks.');
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const bitDepth = ihdr[8];
  const colorType = ihdr[9];
  const interlace = ihdr[12];
  if (bitDepth !== 8 || ![2, 6].includes(colorType) || interlace !== 0) {
    throw new Error(`Unsupported PNG encoding: depth=${bitDepth}, colorType=${colorType}, interlace=${interlace}.`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const inflated = inflateSync(Buffer.concat(idat));
  if (inflated.length !== height * (stride + 1)) throw new Error('PNG scanline byte count does not match IHDR.');
  const pixels = Buffer.alloc(width * height * channels);
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const rowOffset = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[sourceOffset + x];
      const left = x >= channels ? pixels[rowOffset + x - channels] : 0;
      const up = y > 0 ? pixels[rowOffset + x - stride] : 0;
      const upperLeft = y > 0 && x >= channels ? pixels[rowOffset + x - stride - channels] : 0;
      let value;
      if (filter === 0) value = raw;
      else if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) value = raw + paeth(left, up, upperLeft);
      else throw new Error(`Unsupported PNG filter ${filter}.`);
      pixels[rowOffset + x] = value & 255;
    }
    sourceOffset += stride;
  }

  const total = width * height;
  const borderSize = Math.max(1, Math.min(8, Math.floor(Math.min(width, height) * 0.01)));
  let transparent = 0;
  let opaque = 0;
  let partial = 0;
  let nearWhiteOpaque = 0;
  let hiddenRgb = 0;
  let borderPixels = 0;
  let borderNearWhiteOpaque = 0;
  let borderOpaque = 0;
  let alphaMin = 255;
  let alphaMax = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * channels;
      const r = pixels[offset];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];
      const alpha = channels === 4 ? pixels[offset + 3] : 255;
      alphaMin = Math.min(alphaMin, alpha);
      alphaMax = Math.max(alphaMax, alpha);
      if (alpha === 0) {
        transparent += 1;
        if (r !== 0 || g !== 0 || b !== 0) hiddenRgb += 1;
      } else if (alpha >= 250) opaque += 1;
      else partial += 1;
      const whiteOpaque = alpha >= 250 && r >= 245 && g >= 245 && b >= 245;
      if (whiteOpaque) nearWhiteOpaque += 1;
      if (x < borderSize || y < borderSize || x >= width - borderSize || y >= height - borderSize) {
        borderPixels += 1;
        if (alpha >= 250) borderOpaque += 1;
        if (whiteOpaque) borderNearWhiteOpaque += 1;
      }
    }
  }
  return {
    width,
    height,
    bitDepth,
    colorType,
    interlace,
    alphaMin,
    alphaMax,
    transparentRatio: transparent / total,
    visibleRatio: (total - transparent) / total,
    opaqueRatio: opaque / total,
    partialRatio: partial / total,
    nearWhiteOpaqueRatio: nearWhiteOpaque / total,
    opaqueNearWhiteBorderRatio: borderNearWhiteOpaque / borderPixels,
    opaqueBorderRatio: borderOpaque / borderPixels,
    hiddenRgbRatio: hiddenRgb / total
  };
}

export function validatePixelContract(stats, contract) {
  const findings = [];
  if (stats.width !== contract.width || stats.height !== contract.height) findings.push(finding('dimension-mismatch', `Expected ${contract.width}x${contract.height}, received ${stats.width}x${stats.height}.`));
  if (!contract.allowedColorTypes.includes(stats.colorType)) findings.push(finding('color-type', `PNG color type ${stats.colorType} is not allowed.`));
  if (contract.alphaPolicy === 'opaque' && (stats.transparentRatio > 0.001 || stats.visibleRatio < contract.minVisibleRatio)) findings.push(finding('opaque-required', 'Opaque background contains transparent pixels.'));
  if (contract.alphaPolicy === 'transparent') {
    if (stats.colorType !== 6 || stats.alphaMin !== 0 || stats.alphaMax < contract.minAlphaMax) findings.push(finding('alpha-required', `Independent layer needs genuine RGBA transparency with alpha max >= ${contract.minAlphaMax}.`));
    if (stats.transparentRatio < contract.minTransparentRatio) findings.push(finding('transparent-area', `Transparent ratio ${stats.transparentRatio.toFixed(4)} is below ${contract.minTransparentRatio}.`));
    if (stats.visibleRatio < contract.minVisibleRatio || stats.visibleRatio > contract.maxVisibleRatio) findings.push(finding('visible-area', `Visible ratio ${stats.visibleRatio.toFixed(4)} is outside ${contract.minVisibleRatio}..${contract.maxVisibleRatio}.`));
    if (stats.opaqueNearWhiteBorderRatio > contract.maxOpaqueNearWhiteBorderRatio || (stats.nearWhiteOpaqueRatio > 0.4 && stats.opaqueBorderRatio > 0.5)) findings.push(finding('white-matte', 'Opaque near-white pixels indicate a white canvas or border parasite.'));
    if (stats.hiddenRgbRatio > contract.maxHiddenRgbRatio) findings.push(finding('hidden-rgb', 'Fully transparent pixels retain RGB data and can create resampling halos.'));
  }
  return findings;
}

const listFiles = async (directory) => {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else files.push(path);
  }
  return files;
};

export async function auditSourceReceipt(root, slot) {
  if (slot.status !== 'verified' && slot.status !== 'integrated') return null;
  const sourceFile = slot.provenance?.sourceFile ?? null;
  const expectedSha256 = slot.provenance?.sourceSha256 ?? null;
  const result = { file: sourceFile, present: false, sha256: null, expectedSha256, verified: false, findings: [] };
  if (!isSafeRelativePath(sourceFile)) {
    result.findings.push(finding('source-receipt-path', 'Source receipt path is not a safe repository-relative path.'));
    return result;
  }
  const absoluteReceiptRoot = resolve(root, SOURCE_RECEIPT_ROOT);
  const absoluteSourceFile = resolve(root, sourceFile);
  const relativeToReceiptRoot = relative(absoluteReceiptRoot, absoluteSourceFile);
  const escaped = relativeToReceiptRoot === '..'
    || relativeToReceiptRoot.startsWith(`..${sep}`)
    || relativeToReceiptRoot.startsWith('/')
    || /^[a-z]:/iu.test(relativeToReceiptRoot);
  if (escaped) {
    result.findings.push(finding('source-receipt-root-escape', 'Source receipt resolves outside the V79 receipt root.'));
    return result;
  }
  if (!existsSync(absoluteSourceFile)) {
    result.findings.push(finding('source-receipt-missing', 'Declared source receipt is absent.'));
    return result;
  }
  result.present = true;
  try {
    const bytes = await readFile(absoluteSourceFile);
    result.sha256 = sha256(bytes);
  } catch (error) {
    result.findings.push(finding('source-receipt-read', error.message));
    return result;
  }
  if (result.sha256 !== expectedSha256) {
    result.findings.push(finding('source-receipt-hash-mismatch', 'Source receipt SHA-256 differs from manifest provenance.'));
    return result;
  }
  result.verified = true;
  return result;
}

export async function auditTitleAssets({ root = REPOSITORY_ROOT, manifestPath = DEFAULT_MANIFEST, promptPath = DEFAULT_PROMPTS } = {}) {
  const absoluteManifest = resolve(root, manifestPath);
  const absolutePrompts = resolve(root, promptPath);
  const manifest = JSON.parse(await readFile(absoluteManifest, 'utf8'));
  const prompts = JSON.parse(await readFile(absolutePrompts, 'utf8'));
  const errors = [
    ...validateManifestData(manifest),
    ...validatePromptRecipes(prompts, manifest)
  ];
  const statusSummary = { missing: 0, candidate: 0, verified: 0, integrated: 0 };
  const categorySummary = Object.fromEntries(Object.keys(EXPECTED_SLOT_IDS).map((category) => [category, { missing: 0, candidate: 0, verified: 0, integrated: 0 }]));
  const assetResults = [];

  for (const slot of manifest.slots) {
    if (statusSummary[slot.status] !== undefined) statusSummary[slot.status] += 1;
    if (categorySummary[slot.category]?.[slot.status] !== undefined) categorySummary[slot.category][slot.status] += 1;
    const sourceReceipt = await auditSourceReceipt(root, slot);
    for (const item of sourceReceipt?.findings ?? []) errors.push({ ...item, slotId: slot.id });
    const absoluteFile = resolve(root, slot.file);
    const relativeToRoot = relative(resolve(root, manifest.assetRoot), absoluteFile);
    const escaped = relativeToRoot === '..' || relativeToRoot.startsWith(`..${sep}`) || relativeToRoot.startsWith('/') || /^[a-z]:/iu.test(relativeToRoot);
    if (escaped) {
      errors.push(finding('asset-root-escape', `${slot.id} resolves outside the asset root.`, { slotId: slot.id }));
      continue;
    }
    const present = existsSync(absoluteFile);
    if (slot.status === 'missing') {
      if (present) errors.push(finding('unregistered-delivery', `${slot.file} exists but is still declared missing.`, { slotId: slot.id }));
      assetResults.push({ slotId: slot.id, status: slot.status, present, sourceReceipt, findings: [] });
      continue;
    }
    if (!present) {
      errors.push(finding('asset-file-missing', `${slot.file} is declared ${slot.status} but absent.`, { slotId: slot.id }));
      assetResults.push({ slotId: slot.id, status: slot.status, present, sourceReceipt, findings: [finding('asset-file-missing', 'File absent.')] });
      continue;
    }
    let bytes;
    let stats;
    let pixelFindings;
    try {
      bytes = await readFile(absoluteFile);
      stats = inspectPng(bytes);
      pixelFindings = validatePixelContract(stats, manifest.categoryContracts[slot.category]);
    } catch (error) {
      pixelFindings = [finding('png-decode', error.message)];
    }
    if ((slot.status === 'verified' || slot.status === 'integrated') && bytes && sha256(bytes) !== slot.sha256) pixelFindings.push(finding('hash-mismatch', 'File SHA-256 differs from the verified receipt.'));
    for (const item of pixelFindings) errors.push({ ...item, slotId: slot.id });
    assetResults.push({ slotId: slot.id, status: slot.status, present, sourceReceipt, sha256: bytes ? sha256(bytes) : null, stats, findings: pixelFindings });
  }

  const plannedFiles = new Set(manifest.slots.map((slot) => resolve(root, slot.file).toLowerCase()));
  const assetRoot = resolve(root, manifest.assetRoot);
  const unexpectedFiles = (await listFiles(assetRoot)).filter((path) => !plannedFiles.has(path.toLowerCase())).map((path) => relative(root, path).split(sep).join('/'));
  for (const path of unexpectedFiles) errors.push(finding('unexpected-file', `Unregistered file under V79 asset root: ${path}.`));

  return {
    release: manifest.release,
    expected: EXPECTED_SLOT_TOTAL,
    statusSummary,
    categorySummary,
    errors,
    unexpectedFiles,
    assetResults,
    complete: statusSummary.integrated === EXPECTED_SLOT_TOTAL && errors.length === 0
  };
}

const valueAfter = (args, prefix, fallback) => args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || fallback;

async function main() {
  const args = process.argv.slice(2);
  const root = resolve(valueAfter(args, '--root=', REPOSITORY_ROOT));
  const report = await auditTitleAssets({
    root,
    manifestPath: valueAfter(args, '--manifest=', DEFAULT_MANIFEST),
    promptPath: valueAfter(args, '--prompts=', DEFAULT_PROMPTS)
  });
  if (args.includes('--json')) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    console.log(`V79 title assets: ${report.statusSummary.integrated}/${report.expected} integrated, ${report.statusSummary.verified} verified, ${report.statusSummary.candidate} candidate, ${report.statusSummary.missing} missing; ${report.errors.length} error(s).`);
    for (const [category, states] of Object.entries(report.categorySummary)) {
      console.log(`- ${category}: ${states.integrated} integrated / ${states.missing} missing`);
    }
    for (const error of report.errors) console.error(`ERROR ${error.code}${error.slotId ? ` [${error.slotId}]` : ''}: ${error.message}`);
  }
  if (report.errors.length > 0 || (args.includes('--require-complete') && !report.complete)) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
