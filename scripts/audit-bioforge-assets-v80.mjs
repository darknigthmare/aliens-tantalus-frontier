import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPOSITORY_ROOT = resolve(dirname(SCRIPT_PATH), '..');
const DEFAULT_MANIFEST = 'docs/references/v80-bioforge-art/asset-manifest.json';
const DEFAULT_RECEIPTS = 'docs/references/v80-bioforge-art/generation-receipts.json';
const DEFAULT_PROMPTS = 'docs/references/v80-bioforge-art/exact-generation-prompts.md';
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const REQUIRED_REVIEWS = Object.freeze(['composition', 'perspective', 'scale', 'edgeQuality', 'originalDesign']);

export const EXPECTED_BIOFORGE_ASSETS_V80 = Object.freeze([
  Object.freeze({ key: 'far', id: 'bioforge-far-industrial-shell-v80', runtimeId: 'bioforge.v80.layer.far', category: 'far', file: 'assets/openai/bioforge/v80/far/bioforge-far-industrial-shell-v80.png', width: 1920, height: 720, alphaPolicy: 'opaque', sha256: '9cdf6371ff690f333567522354f53ceda740667b84b8d163461bd51e9690497d' }),
  Object.freeze({ key: 'mid', id: 'bioforge-mid-process-modules-v80', runtimeId: 'bioforge.v80.layer.mid', category: 'mid', file: 'assets/openai/bioforge/v80/mid/bioforge-mid-process-modules-v80.png', width: 1920, height: 720, alphaPolicy: 'transparent', sha256: 'e59b737619fa4c39bd7c4c381fb390c6d30abf093a77bddb83b2331df15fa0d8' }),
  Object.freeze({ key: 'foreground', id: 'bioforge-foreground-service-frame-v80', runtimeId: 'bioforge.v80.layer.foreground', category: 'foreground', file: 'assets/openai/bioforge/v80/foreground/bioforge-foreground-service-frame-v80.png', width: 1920, height: 720, alphaPolicy: 'transparent', sha256: '4527da5d4884bfcae99e11eab62ef932827f8962ba746c340989b82b9b5e222d' }),
  Object.freeze({ key: 'printer', id: 'bioforge-tissue-printer-v80', runtimeId: 'bioforge.v80.prop.tissue-printer', category: 'props', file: 'assets/openai/bioforge/v80/props/bioforge-tissue-printer-v80.png', width: 1024, height: 1024, alphaPolicy: 'transparent', sha256: '17e7c5751c7bd98ae9af5b79f91ef07e5ca6ddc57a58e9c0e918205e38cb5add' }),
  Object.freeze({ key: 'bulkhead', id: 'bioforge-bulkhead-cycle-v80', runtimeId: 'bioforge.v80.prop.bulkhead-cycle', category: 'props', file: 'assets/openai/bioforge/v80/props/bioforge-bulkhead-cycle-v80.png', width: 2048, height: 1024, alphaPolicy: 'transparent', sha256: 'a261312df67e995374d5caca87d328376fcf4ad7b56cbbbf611a830a5dc02d34' }),
  Object.freeze({ key: 'purge', id: 'bioforge-purge-cycle-v80', runtimeId: 'bioforge.v80.vfx.purge-cycle', category: 'vfx', file: 'assets/openai/bioforge/v80/vfx/bioforge-purge-cycle-v80.png', width: 2048, height: 1024, alphaPolicy: 'transparent', sha256: '5416450f03e1173ec41ac330e61972d96a9920fb2253f968cc1c5e3eec6701cf' })
]);

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const finding = (code, message, extra = {}) => ({ code, message, ...extra });
const normalizedPath = (path) => path.split(sep).join('/');
const isSafeRelativePath = (path) => typeof path === 'string'
  && !path.startsWith('/')
  && !/^[a-z]:/iu.test(path)
  && !path.split(/[\\/]/u).includes('..');

const paeth = (left, up, upperLeft) => {
  const value = left + up - upperLeft;
  const leftDistance = Math.abs(value - left);
  const upDistance = Math.abs(value - up);
  const upperLeftDistance = Math.abs(value - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  if (upDistance <= upperLeftDistance) return up;
  return upperLeft;
};

function decodePng(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 33 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Invalid PNG signature.');
  }
  let offset = 8;
  let width = null;
  let height = null;
  let bitDepth = null;
  let colorType = null;
  let interlace = null;
  const idat = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) throw new Error(`Truncated PNG chunk ${type}.`);
    const data = bytes.subarray(dataStart, dataEnd);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset = dataEnd + 4;
  }
  if (!width || !height || idat.length === 0) throw new Error('PNG is missing IHDR or IDAT data.');
  if (bitDepth !== 8 || interlace !== 0 || ![2, 6].includes(colorType)) {
    throw new Error(`Unsupported PNG encoding: bitDepth=${bitDepth}, colorType=${colorType}, interlace=${interlace}.`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const inflated = inflateSync(Buffer.concat(idat));
  const expectedLength = height * (stride + 1);
  if (inflated.length !== expectedLength) throw new Error(`Unexpected inflated PNG length ${inflated.length}; expected ${expectedLength}.`);
  const pixels = Buffer.alloc(width * height * channels);
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const rowOffset = y * stride;
    for (let byteIndex = 0; byteIndex < stride; byteIndex += 1) {
      const raw = inflated[sourceOffset + byteIndex];
      const left = byteIndex >= channels ? pixels[rowOffset + byteIndex - channels] : 0;
      const up = y > 0 ? pixels[rowOffset + byteIndex - stride] : 0;
      const upperLeft = y > 0 && byteIndex >= channels ? pixels[rowOffset + byteIndex - stride - channels] : 0;
      let value;
      if (filter === 0) value = raw;
      else if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) value = raw + paeth(left, up, upperLeft);
      else throw new Error(`Unsupported PNG filter ${filter}.`);
      pixels[rowOffset + byteIndex] = value & 255;
    }
    sourceOffset += stride;
  }
  return { width, height, bitDepth, colorType, interlace, channels, pixels };
}

function measureRegion(decoded, x0 = 0, y0 = 0, width = decoded.width, height = decoded.height) {
  const { channels, pixels } = decoded;
  const total = width * height;
  const borderSize = Math.max(1, Math.min(4, Math.floor(Math.min(width, height) * 0.01)));
  let transparent = 0;
  let partial = 0;
  let opaque = 0;
  let hiddenRgb = 0;
  let borderPixels = 0;
  let borderNearWhiteOpaque = 0;
  let alphaMin = 255;
  let alphaMax = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let localY = 0; localY < height; localY += 1) {
    const y = y0 + localY;
    for (let localX = 0; localX < width; localX += 1) {
      const x = x0 + localX;
      const pixelOffset = (y * decoded.width + x) * channels;
      const red = pixels[pixelOffset];
      const green = pixels[pixelOffset + 1];
      const blue = pixels[pixelOffset + 2];
      const alpha = channels === 4 ? pixels[pixelOffset + 3] : 255;
      alphaMin = Math.min(alphaMin, alpha);
      alphaMax = Math.max(alphaMax, alpha);
      if (alpha === 0) {
        transparent += 1;
        if (red !== 0 || green !== 0 || blue !== 0) hiddenRgb += 1;
      } else {
        minX = Math.min(minX, localX);
        minY = Math.min(minY, localY);
        maxX = Math.max(maxX, localX);
        maxY = Math.max(maxY, localY);
        if (alpha >= 250) opaque += 1;
        else partial += 1;
      }
      if (localX < borderSize || localY < borderSize || localX >= width - borderSize || localY >= height - borderSize) {
        borderPixels += 1;
        if (alpha >= 250 && red >= 245 && green >= 245 && blue >= 245) borderNearWhiteOpaque += 1;
      }
    }
  }
  const bbox = maxX >= 0 ? [minX, minY, maxX + 1, maxY + 1] : null;
  return {
    alphaMin,
    alphaMax,
    transparentRatio: transparent / total,
    visibleRatio: (total - transparent) / total,
    partialRatio: partial / total,
    opaqueRatio: opaque / total,
    hiddenRgbRatio: hiddenRgb / total,
    opaqueNearWhiteBorderRatio: borderNearWhiteOpaque / borderPixels,
    bbox,
    margins: bbox ? { left: bbox[0], top: bbox[1], right: width - bbox[2], bottom: height - bbox[3] } : null
  };
}

export function inspectPng(bytes) {
  const decoded = decodePng(bytes);
  return {
    width: decoded.width,
    height: decoded.height,
    bitDepth: decoded.bitDepth,
    colorType: decoded.colorType,
    interlace: decoded.interlace,
    ...measureRegion(decoded)
  };
}

const checkMinimumMargins = (stats, minimum, slotId, frame = null) => {
  const label = frame ? `${slotId} frame ${frame}` : slotId;
  if (!stats.margins) return [finding('empty-bbox', `${label} has no visible alpha bounds.`, { slotId, frame })];
  const errors = [];
  for (const [edge, value] of Object.entries(stats.margins)) {
    if (value < minimum) errors.push(finding('margin-too-small', `${label} ${edge} margin is ${value}px; expected at least ${minimum}px.`, { slotId, frame, edge, value, minimum }));
  }
  return errors;
};

export function validateManifestData(manifest) {
  const errors = [];
  if (manifest?.schemaVersion !== 1) errors.push(finding('schema-version', 'schemaVersion must be 1.'));
  if (manifest?.release !== 'V80') errors.push(finding('release', 'release must be V80.'));
  if (manifest?.assetRoot !== 'assets/openai/bioforge/v80') errors.push(finding('asset-root', 'Unexpected V80 asset root.'));
  if (manifest?.referenceRoot !== 'docs/references/v80-bioforge-art') errors.push(finding('reference-root', 'Unexpected V80 reference root.'));
  if (manifest?.rightsPolicy !== 'original-ai-generated-no-official-copy') errors.push(finding('rights-policy', 'Original-only ImageGen rights policy is required.'));
  if (manifest?.runtimeAcceptance !== 'verified-only') errors.push(finding('runtime-acceptance', 'Only verified files may be exposed to runtime.'));
  if (manifest?.scaleReference?.viewportHeightPx !== 720 || manifest?.scaleReference?.marineHeightPx !== 92 || manifest?.scaleReference?.perspective !== 'strict-side-on-orthographic') {
    errors.push(finding('scale-reference', 'BIOFORGE scale must remain 92px marine in a 720px strict side-on viewport.'));
  }
  if (!Array.isArray(manifest?.slots) || manifest.slots.length !== EXPECTED_BIOFORGE_ASSETS_V80.length) {
    errors.push(finding('slot-count', `Expected exactly ${EXPECTED_BIOFORGE_ASSETS_V80.length} slots.`));
    return errors;
  }
  const expectedByKey = new Map(EXPECTED_BIOFORGE_ASSETS_V80.map((asset) => [asset.key, asset]));
  const seenKeys = new Set();
  const seenFiles = new Set();
  for (const slot of manifest.slots) {
    const expected = expectedByKey.get(slot?.key);
    if (!expected) {
      errors.push(finding('slot-key', `Unexpected slot key ${slot?.key}.`, { slotId: slot?.id }));
      continue;
    }
    if (seenKeys.has(slot.key)) errors.push(finding('duplicate-key', `Duplicate slot key ${slot.key}.`, { slotId: slot.id }));
    seenKeys.add(slot.key);
    for (const field of ['id', 'runtimeId', 'category', 'file', 'width', 'height', 'alphaPolicy', 'sha256']) {
      if (slot[field] !== expected[field]) errors.push(finding('slot-contract', `${slot.key}.${field} differs from the locked V80 contract.`, { slotId: slot.id, field }));
    }
    if (!isSafeRelativePath(slot.file) || !slot.file.startsWith(`${manifest.assetRoot}/`)) errors.push(finding('slot-path', `${slot.id} escapes the V80 asset root.`, { slotId: slot.id }));
    if (seenFiles.has(slot.file)) errors.push(finding('duplicate-file', `Duplicate runtime file ${slot.file}.`, { slotId: slot.id }));
    seenFiles.add(slot.file);
    if (slot.status !== 'verified') errors.push(finding('slot-status', `${slot.id} must be verified before registry exposure.`, { slotId: slot.id }));
    if (slot.perspective !== 'strict-side-on-orthographic' || slot.marineHeightPx !== 92) errors.push(finding('perspective-scale', `${slot.id} breaks the side-on/92px contract.`, { slotId: slot.id }));
    if (!Number.isFinite(slot.visibleRatio?.min) || !Number.isFinite(slot.visibleRatio?.max) || slot.visibleRatio.min > slot.visibleRatio.max) errors.push(finding('visible-contract', `${slot.id} has an invalid visible-ratio range.`, { slotId: slot.id }));
    if (slot.provenance?.kind !== 'openai-imagegen-original' || !isSafeRelativePath(slot.provenance?.sourceFile) || !/^[a-f0-9]{64}$/u.test(slot.provenance?.sourceSha256 ?? '')) {
      errors.push(finding('provenance', `${slot.id} needs a canonical OpenAI ImageGen source receipt.`, { slotId: slot.id }));
    }
    for (const review of REQUIRED_REVIEWS) {
      if (slot.review?.[review] !== true) errors.push(finding(`review:${review}`, `${slot.id} lacks the ${review} review.`, { slotId: slot.id }));
    }
    if (slot.atlas) {
      if (slot.atlas.columns !== 4 || slot.atlas.rows !== 2 || slot.atlas.frames !== 8 || slot.atlas.frameWidth !== 512 || slot.atlas.frameHeight !== 512 || slot.atlas.playback !== 'row-major' || slot.atlas.sequence?.length !== 8) {
        errors.push(finding('atlas-contract', `${slot.id} must be an exact 4x2 / 8-frame / 512px row-major atlas.`, { slotId: slot.id }));
      }
      if (slot.review?.animationContinuity !== true) errors.push(finding('review:animationContinuity', `${slot.id} lacks animation continuity review.`, { slotId: slot.id }));
    }
  }
  for (const expected of EXPECTED_BIOFORGE_ASSETS_V80) {
    if (!seenKeys.has(expected.key)) errors.push(finding('missing-key', `Missing required slot ${expected.key}.`, { slotId: expected.id }));
  }
  if (!Array.isArray(manifest.rejectedCandidates)) errors.push(finding('rejected-candidates', 'rejectedCandidates must be an explicit array, including when empty.'));
  return errors;
}

function validatePixels(slot, decoded) {
  const stats = {
    width: decoded.width,
    height: decoded.height,
    bitDepth: decoded.bitDepth,
    colorType: decoded.colorType,
    interlace: decoded.interlace,
    ...measureRegion(decoded)
  };
  const errors = [];
  if (decoded.width !== slot.width || decoded.height !== slot.height) errors.push(finding('dimension-mismatch', `Expected ${slot.width}x${slot.height}, received ${decoded.width}x${decoded.height}.`, { slotId: slot.id }));
  if (slot.alphaPolicy === 'opaque') {
    if (decoded.colorType !== 2 || stats.alphaMin !== 255 || stats.transparentRatio !== 0) errors.push(finding('opaque-required', `${slot.id} must be an opaque RGB PNG.`, { slotId: slot.id }));
  } else if (decoded.colorType !== 6 || stats.alphaMin !== 0 || stats.alphaMax < 250) {
    errors.push(finding('alpha-required', `${slot.id} needs genuine RGBA transparency with alpha 0 and alpha max >= 250.`, { slotId: slot.id }));
  }
  if (stats.visibleRatio < slot.visibleRatio.min || stats.visibleRatio > slot.visibleRatio.max) {
    errors.push(finding('visible-ratio', `${slot.id} visible ratio ${stats.visibleRatio.toFixed(4)} is outside ${slot.visibleRatio.min}..${slot.visibleRatio.max}.`, { slotId: slot.id }));
  }
  if (stats.hiddenRgbRatio !== 0) errors.push(finding('hidden-rgb', `${slot.id} retains RGB in fully transparent pixels.`, { slotId: slot.id }));
  if (stats.opaqueNearWhiteBorderRatio > 0.001) errors.push(finding('white-border', `${slot.id} contains an opaque near-white border parasite.`, { slotId: slot.id }));
  const marginPolicy = slot.marginPolicy;
  if (marginPolicy?.kind === 'all-edges') errors.push(...checkMinimumMargins(stats, marginPolicy.minimumPx, slot.id));
  if (marginPolicy?.kind === 'bottom-grounded') {
    if (!stats.margins || stats.margins.left < marginPolicy.minimumSidePx || stats.margins.right < marginPolicy.minimumSidePx || stats.margins.top < marginPolicy.minimumTopPx || stats.margins.bottom !== marginPolicy.bottomPx) {
      errors.push(finding('grounded-margins', `${slot.id} does not satisfy its explicit bottom-grounded margins.`, { slotId: slot.id, margins: stats.margins }));
    }
  }
  const frames = [];
  if (slot.atlas) {
    if (decoded.width !== slot.atlas.columns * slot.atlas.frameWidth || decoded.height !== slot.atlas.rows * slot.atlas.frameHeight) {
      errors.push(finding('atlas-dimensions', `${slot.id} pixels do not match the declared cell grid.`, { slotId: slot.id }));
    } else {
      for (let row = 0; row < slot.atlas.rows; row += 1) {
        for (let column = 0; column < slot.atlas.columns; column += 1) {
          const frame = row * slot.atlas.columns + column + 1;
          const frameStats = measureRegion(decoded, column * slot.atlas.frameWidth, row * slot.atlas.frameHeight, slot.atlas.frameWidth, slot.atlas.frameHeight);
          frames.push({ frame, ...frameStats });
          if (frameStats.visibleRatio <= 0.001 || frameStats.alphaMax < 64) errors.push(finding('empty-atlas-frame', `${slot.id} frame ${frame} is empty or unreadable.`, { slotId: slot.id, frame }));
          errors.push(...checkMinimumMargins(frameStats, marginPolicy.minimumPx, slot.id, frame));
          if (frameStats.opaqueNearWhiteBorderRatio > 0.001) errors.push(finding('atlas-white-border', `${slot.id} frame ${frame} has a near-white border parasite.`, { slotId: slot.id, frame }));
        }
      }
    }
  }
  return { stats, frames, errors };
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

export async function auditBioforgeAssetsV80({ root = REPOSITORY_ROOT, manifestPath = DEFAULT_MANIFEST, receiptPath = DEFAULT_RECEIPTS, promptPath = DEFAULT_PROMPTS } = {}) {
  const manifest = JSON.parse(await readFile(resolve(root, manifestPath), 'utf8'));
  const receipts = JSON.parse(await readFile(resolve(root, receiptPath), 'utf8'));
  const exactPrompts = await readFile(resolve(root, promptPath), 'utf8');
  const errors = validateManifestData(manifest);
  const assetResults = [];
  const acceptedByAsset = new Map((receipts.accepted ?? []).map((receipt) => [receipt.assetId, receipt]));
  if (receipts.release !== 'V80' || receipts.provider !== 'OpenAI ImageGen' || receipts.toolMode !== 'built-in' || receipts.rightsPolicy !== manifest.rightsPolicy) errors.push(finding('receipt-contract', 'Generation receipt header differs from the V80 ImageGen contract.'));
  if (!Array.isArray(receipts.rejected) || receipts.rejected.length !== manifest.rejectedCandidates.length) errors.push(finding('rejection-accounting', 'Manifest and generation receipts disagree on rejected-candidate count.'));

  for (const slot of manifest.slots) {
    const runtimePath = resolve(root, slot.file);
    const sourcePath = resolve(root, slot.provenance.sourceFile);
    const promptToken = `exec-${slot.provenance.receiptId.replace(/^exec-/u, '')}.png`;
    if (!exactPrompts.includes(promptToken)) errors.push(finding('prompt-missing', `Exact prompt is missing for ${slot.id}.`, { slotId: slot.id }));
    const receipt = acceptedByAsset.get(slot.id);
    if (!receipt || receipt.receiptId !== slot.provenance.receiptId || receipt.sourceSha256 !== slot.provenance.sourceSha256) errors.push(finding('receipt-link', `Generation receipt mismatch for ${slot.id}.`, { slotId: slot.id }));
    let sourceReceipt = { present: false, sha256: null, expectedSha256: slot.provenance.sourceSha256, verified: false };
    if (!isSafeRelativePath(slot.provenance.sourceFile) || !slot.provenance.sourceFile.startsWith(`${manifest.referenceRoot}/source-receipts/`)) {
      errors.push(finding('source-path', `${slot.id} source receipt escapes the reference root.`, { slotId: slot.id }));
    } else if (!existsSync(sourcePath)) {
      errors.push(finding('source-missing', `${slot.id} source receipt is absent.`, { slotId: slot.id }));
    } else {
      const sourceBytes = await readFile(sourcePath);
      sourceReceipt = { present: true, sha256: sha256(sourceBytes), expectedSha256: slot.provenance.sourceSha256, verified: sha256(sourceBytes) === slot.provenance.sourceSha256 };
      if (!sourceReceipt.verified) errors.push(finding('source-hash', `${slot.id} source receipt hash mismatch.`, { slotId: slot.id }));
      try {
        const sourceStats = inspectPng(sourceBytes);
        sourceReceipt = { ...sourceReceipt, width: sourceStats.width, height: sourceStats.height, colorType: sourceStats.colorType };
        if (sourceStats.width !== slot.provenance.sourceWidth || sourceStats.height !== slot.provenance.sourceHeight) errors.push(finding('source-dimensions', `${slot.id} source dimensions differ from provenance.`, { slotId: slot.id }));
      } catch (error) {
        errors.push(finding('source-png', `${slot.id}: ${error.message}`, { slotId: slot.id }));
      }
    }
    if (!existsSync(runtimePath)) {
      errors.push(finding('runtime-missing', `${slot.file} is absent.`, { slotId: slot.id }));
      assetResults.push({ slotId: slot.id, file: slot.file, sourceReceipt, present: false, errors: [finding('runtime-missing', 'File absent.')] });
      continue;
    }
    const bytes = await readFile(runtimePath);
    const actualHash = sha256(bytes);
    let validation;
    try {
      validation = validatePixels(slot, decodePng(bytes));
    } catch (error) {
      validation = { stats: null, frames: [], errors: [finding('png-decode', error.message, { slotId: slot.id })] };
    }
    if (actualHash !== slot.sha256) validation.errors.push(finding('runtime-hash', `${slot.id} runtime hash mismatch.`, { slotId: slot.id }));
    errors.push(...validation.errors);
    assetResults.push({ slotId: slot.id, file: slot.file, present: true, sha256: actualHash, sourceReceipt, stats: validation.stats, frames: validation.frames, errors: validation.errors });
  }

  const plannedRuntime = new Set(manifest.slots.map((slot) => resolve(root, slot.file).toLowerCase()));
  const unexpectedRuntimeFiles = (await listFiles(resolve(root, manifest.assetRoot)))
    .filter((path) => !plannedRuntime.has(path.toLowerCase()))
    .map((path) => normalizedPath(relative(root, path)));
  for (const file of unexpectedRuntimeFiles) errors.push(finding('unexpected-runtime-file', `Unregistered file under V80 asset root: ${file}.`));

  const plannedSources = new Set(manifest.slots.map((slot) => resolve(root, slot.provenance.sourceFile).toLowerCase()));
  const sourceRoot = resolve(root, manifest.referenceRoot, 'source-receipts');
  const unexpectedSourceFiles = (await listFiles(sourceRoot))
    .filter((path) => !plannedSources.has(path.toLowerCase()))
    .map((path) => normalizedPath(relative(root, path)));
  for (const file of unexpectedSourceFiles) errors.push(finding('unexpected-source-file', `Unregistered source receipt: ${file}.`));

  for (const token of ['original', 'not based on or copied', 'no 3/4 view', 'no text', 'no logo', 'no watermark']) {
    if (!exactPrompts.toLowerCase().includes(token)) errors.push(finding('prompt-guard', `Exact prompts are missing required guard: ${token}.`));
  }

  return {
    schemaVersion: 1,
    release: 'V80',
    auditedAt: new Date().toISOString(),
    expected: EXPECTED_BIOFORGE_ASSETS_V80.length,
    verified: assetResults.filter((asset) => asset.present && asset.errors.length === 0 && asset.sourceReceipt.verified).length,
    rejectedCandidates: receipts.rejected,
    rejectionSummary: receipts.rejectionSummary,
    unexpectedRuntimeFiles,
    unexpectedSourceFiles,
    errors,
    assetResults,
    complete: errors.length === 0 && assetResults.length === EXPECTED_BIOFORGE_ASSETS_V80.length
  };
}

const valueAfter = (args, prefix, fallback = null) => args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || fallback;

async function main() {
  const args = process.argv.slice(2);
  const root = resolve(valueAfter(args, '--root=', REPOSITORY_ROOT));
  const report = await auditBioforgeAssetsV80({
    root,
    manifestPath: valueAfter(args, '--manifest=', DEFAULT_MANIFEST),
    receiptPath: valueAfter(args, '--receipts=', DEFAULT_RECEIPTS),
    promptPath: valueAfter(args, '--prompts=', DEFAULT_PROMPTS)
  });
  const outputPath = valueAfter(args, '--write-report=');
  if (outputPath) {
    const absoluteOutput = resolve(root, outputPath);
    const allowedRoot = resolve(root, 'docs/references/v80-bioforge-art');
    const relativeOutput = relative(allowedRoot, absoluteOutput);
    if (relativeOutput === '..' || relativeOutput.startsWith(`..${sep}`) || /^[a-z]:/iu.test(relativeOutput)) throw new Error('Report path must remain under docs/references/v80-bioforge-art.');
    await mkdir(dirname(absoluteOutput), { recursive: true });
    await writeFile(absoluteOutput, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  if (args.includes('--json')) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    console.log(`BIOFORGE V80 assets: ${report.verified}/${report.expected} verified; ${report.errors.length} error(s); ${report.rejectedCandidates.length} rejected candidate(s).`);
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
