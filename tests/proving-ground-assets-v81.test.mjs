import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { inspectPng } from '../scripts/audit-bioforge-assets-v80.mjs';
import {
  PROVING_GROUND_ASSET_LIST_V81,
  PROVING_GROUND_ASSETS_V81,
  PROVING_GROUND_SCALE_REFERENCE_V81,
  getProvingGroundAssetV81
} from '../src/proving-ground-assets-v81.js';

const MANIFEST = 'docs/references/v81-proving-ground-art/asset-manifest.json';
const RECEIPTS = 'docs/references/v81-proving-ground-art/generation-receipts.json';
const PROMPTS = 'docs/references/v81-proving-ground-art/exact-generation-prompts.md';
const AUDIT = 'docs/references/v81-proving-ground-art/art-audit.json';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('les trois assets OpenAI V81 sont originaux, séparés et side-on à l’échelle du marine', async () => {
  const [manifest, receipts, prompts, audit] = await Promise.all([
    readFile(MANIFEST, 'utf8').then(JSON.parse),
    readFile(RECEIPTS, 'utf8').then(JSON.parse),
    readFile(PROMPTS, 'utf8'),
    readFile(AUDIT, 'utf8').then(JSON.parse)
  ]);
  assert.equal(manifest.release, 'V81');
  assert.equal(manifest.rightsPolicy, 'original-ai-generated-no-official-copy');
  assert.equal(manifest.runtimeAcceptance, 'verified-only');
  assert.equal(manifest.slots.length, 3);
  assert.deepEqual(manifest.rejectedCandidates, []);
  assert.equal(receipts.provider, 'OpenAI ImageGen');
  assert.equal(receipts.toolMode, 'built-in');
  assert.equal(receipts.accepted.length, 3);
  assert.deepEqual(receipts.rejected, []);
  assert.equal(audit.canonExact, false);
  assert.equal(audit.perspective, 'strict-side-on-orthographic');
  assert.deepEqual(manifest.scaleReference, PROVING_GROUND_SCALE_REFERENCE_V81);
  for (const token of ['genuinely transparent', 'strict orthographic side', 'no text', 'no logo', 'no watermark']) {
    assert.match(prompts, new RegExp(token, 'iu'));
  }
});

test('le registre runtime verrouille chemins, dimensions, atlas et hashes exacts', async () => {
  assert.deepEqual(Object.keys(PROVING_GROUND_ASSETS_V81), ['target', 'impact', 'console']);
  assert.equal(PROVING_GROUND_ASSET_LIST_V81.length, 3);
  assert.equal(new Set(PROVING_GROUND_ASSET_LIST_V81.map(({ runtimeId }) => runtimeId)).size, 3);
  for (const asset of PROVING_GROUND_ASSET_LIST_V81) {
    assert.equal(asset.status, 'ready');
    assert.equal(asset.alphaPolicy, 'transparent');
    assert.equal(asset.perspective, 'strict-side-on-orthographic');
    assert.equal(getProvingGroundAssetV81(asset.id), asset);
    const bytes = await readFile(asset.src.slice(1));
    assert.equal(sha256(bytes), asset.sha256, asset.id);
    const png = inspectPng(bytes);
    assert.deepEqual([png.width, png.height], [asset.width, asset.height]);
    assert.equal(png.colorType, 6);
    assert.equal(png.alphaMin, 0);
    assert.ok(png.alphaMax >= 250);
    assert.equal(png.hiddenRgbRatio, 0);
    assert.equal(png.opaqueNearWhiteBorderRatio, 0);
    if (asset.atlas) {
      assert.deepEqual([asset.atlas.columns, asset.atlas.rows, asset.atlas.frames], [4, 2, 8]);
      assert.equal(asset.atlas.sequence.length, 8);
    }
  }
});

test('les reçus lient chaque master inchangé à son dérivé runtime audité', async () => {
  const [manifest, receipts, audit] = await Promise.all([
    readFile(MANIFEST, 'utf8').then(JSON.parse),
    readFile(RECEIPTS, 'utf8').then(JSON.parse),
    readFile(AUDIT, 'utf8').then(JSON.parse)
  ]);
  const receiptById = new Map(receipts.accepted.map((entry) => [entry.assetId, entry]));
  const auditById = new Map(audit.assets.map((entry) => [entry.id, entry]));
  for (const slot of manifest.slots) {
    const receipt = receiptById.get(slot.id);
    const record = auditById.get(slot.id);
    assert.ok(receipt && record, slot.id);
    const source = await readFile(`docs/references/v81-proving-ground-art/${receipt.sourceFile}`);
    assert.equal(sha256(source), receipt.sourceSha256);
    assert.equal(record.sourceSha256, receipt.sourceSha256);
    assert.equal(record.outputSha256, slot.sha256);
    assert.equal(record.metrics.hiddenRgbPixels, 0);
    assert.equal(record.metrics.mode, 'RGBA');
  }
});
