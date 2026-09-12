import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  EXPECTED_BIOFORGE_ASSETS_V80,
  auditBioforgeAssetsV80,
  inspectPng,
  validateManifestData
} from '../scripts/audit-bioforge-assets-v80.mjs';
import {
  BIOFORGE_ASSET_LIST_V80,
  BIOFORGE_ASSETS_V80,
  BIOFORGE_SCALE_REFERENCE_V80
} from '../src/bioforge-assets-v80.js';

const MANIFEST_PATH = 'docs/references/v80-bioforge-art/asset-manifest.json';
const RECEIPTS_PATH = 'docs/references/v80-bioforge-art/generation-receipts.json';
const PROMPTS_PATH = 'docs/references/v80-bioforge-art/exact-generation-prompts.md';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('le contrat BIOFORGE V80 verrouille six assets originaux side-on à l’échelle marine 92px', async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  assert.deepEqual(validateManifestData(manifest), []);
  assert.equal(manifest.slots.length, 6);
  assert.equal(manifest.rightsPolicy, 'original-ai-generated-no-official-copy');
  assert.equal(manifest.runtimeAcceptance, 'verified-only');
  assert.deepEqual(manifest.scaleReference, {
    viewportHeightPx: 720,
    marineHeightPx: 92,
    perspective: 'strict-side-on-orthographic'
  });
  assert.ok(manifest.slots.every(({ status, perspective, marineHeightPx }) => status === 'verified' && perspective === 'strict-side-on-orthographic' && marineHeightPx === 92));
});

test('le registre runtime expose uniquement les six chemins vérifiés et leurs hashes exacts', async () => {
  assert.deepEqual(Object.keys(BIOFORGE_ASSETS_V80), ['far', 'mid', 'foreground', 'printer', 'bulkhead', 'purge']);
  assert.equal(BIOFORGE_ASSET_LIST_V80.length, 6);
  assert.equal(new Set(BIOFORGE_ASSET_LIST_V80.map(({ runtimeId }) => runtimeId)).size, 6);
  assert.deepEqual(BIOFORGE_SCALE_REFERENCE_V80, {
    viewportHeightPx: 720,
    marineHeightPx: 92,
    perspective: 'strict-side-on-orthographic'
  });
  for (const expected of EXPECTED_BIOFORGE_ASSETS_V80) {
    const asset = BIOFORGE_ASSETS_V80[expected.key];
    assert.equal(asset.id, expected.id);
    assert.equal(asset.src, `/${expected.file}`);
    assert.equal(asset.sha256, expected.sha256);
    assert.equal(asset.status, 'ready');
    const bytes = await readFile(expected.file);
    assert.equal(sha256(bytes), expected.sha256, expected.id);
  }
});

test('les masters, reçus et prompts exacts conservent la provenance des six appels ImageGen', async () => {
  const [manifest, receipts, prompts] = await Promise.all([
    readFile(MANIFEST_PATH, 'utf8').then(JSON.parse),
    readFile(RECEIPTS_PATH, 'utf8').then(JSON.parse),
    readFile(PROMPTS_PATH, 'utf8')
  ]);
  assert.equal(receipts.provider, 'OpenAI ImageGen');
  assert.equal(receipts.toolMode, 'built-in');
  assert.equal(receipts.accepted.length, 6);
  assert.deepEqual(receipts.rejected, []);
  assert.deepEqual(manifest.rejectedCandidates, []);
  for (const slot of manifest.slots) {
    const sourceBytes = await readFile(slot.provenance.sourceFile);
    assert.equal(sha256(sourceBytes), slot.provenance.sourceSha256, slot.id);
    assert.match(prompts, new RegExp(`${slot.provenance.receiptId}\\.png`, 'u'), slot.id);
  }
  for (const guard of ['not based on or copied', 'No 3/4 view', 'no text', 'no logo', 'no watermark']) assert.match(prompts, new RegExp(guard, 'iu'));
});

test('l’audit pixel valide dimensions, alpha réel, bords propres, bbox et grilles 4x2', async () => {
  const report = await auditBioforgeAssetsV80();
  assert.equal(report.complete, true);
  assert.equal(report.verified, 6);
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.unexpectedRuntimeFiles, []);
  assert.deepEqual(report.unexpectedSourceFiles, []);

  const byId = new Map(report.assetResults.map((asset) => [asset.slotId, asset]));
  const far = byId.get('bioforge-far-industrial-shell-v80');
  assert.equal(far.stats.width, 1920);
  assert.equal(far.stats.height, 720);
  assert.equal(far.stats.colorType, 2);
  const farPng = inspectPng(await readFile(far.file));
  assert.equal(farPng.width, 1920);
  assert.equal(farPng.height, 720);
  assert.equal(farPng.colorType, 2);
  assert.equal(farPng.alphaMin, 255);
  assert.equal(farPng.visibleRatio, 1);

  for (const asset of report.assetResults.filter(({ slotId }) => slotId !== far.slotId)) {
    const png = inspectPng(await readFile(asset.file));
    assert.equal(png.colorType, 6, asset.slotId);
    assert.equal(png.alphaMin, 0, asset.slotId);
    assert.ok(png.alphaMax >= 250, asset.slotId);
    assert.equal(png.hiddenRgbRatio, 0, asset.slotId);
    assert.equal(png.opaqueNearWhiteBorderRatio, 0, asset.slotId);
  }

  const mid = byId.get('bioforge-mid-process-modules-v80');
  assert.deepEqual(mid.stats.margins, { left: 118, top: 32, right: 86, bottom: 66 });
  const foreground = byId.get('bioforge-foreground-service-frame-v80');
  assert.deepEqual(foreground.stats.margins, { left: 85, top: 20, right: 85, bottom: 0 });
  const printer = byId.get('bioforge-tissue-printer-v80');
  assert.ok(Object.values(printer.stats.margins).every((margin) => margin >= 64));

  const bulkhead = byId.get('bioforge-bulkhead-cycle-v80');
  const purge = byId.get('bioforge-purge-cycle-v80');
  assert.equal(bulkhead.frames.length, 8);
  assert.equal(purge.frames.length, 8);
  assert.ok(bulkhead.frames.every(({ margins }) => Object.values(margins).every((margin) => margin >= 28)));
  assert.ok(purge.frames.every(({ margins }) => Object.values(margins).every((margin) => margin >= 36)));
});
