import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { inspectPng } from '../scripts/audit-title-assets-v79.mjs';

const ROOT = 'docs/references/v82-proving-ground-art';
const expected = {
  wall: {
    source: 'exec-5a4477ce-afa1-41fe-ab1b-1e05f088712c.png',
    sourceHash: 'f91a095a53e411709c8e52d6c22b7f010b34f714f0212d90970b045b12ced016',
    output: 'assets/openai/hub/proving-ground/v82/proving-ground-wall-v82.webp',
    outputHash: '62c942325af5bb94f2ceae4018539a8ce2191c616fc5a688a42b87f3ae076160',
    sourceSize: [2048, 768],
    outputSize: [1920, 720],
    pivot: [0, 0]
  },
  'ceiling-beam': {
    source: 'exec-af3b58c0-eedc-4d23-b894-421aff748bc6.png',
    sourceHash: '1475549b84483468f952b549a1c29e551598700e4d2cd6f9b2308329ddc985bb',
    output: 'assets/openai/hub/proving-ground/v82/proving-ground-ceiling-beam-v82.png',
    outputHash: '86cb4a1d9ea2e47edf43a8dcbe0744fe2977cf55dfe7fd22f686fe5634d000f4',
    sourceSize: [2172, 724],
    outputSize: [1536, 450],
    pivot: [768, 141]
  }
};
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const loadAudit = async () => JSON.parse(await readFile(`${ROOT}/art-audit.json`, 'utf8'));

function inspectLosslessWebP(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length);
  for (let cursor = 12; cursor + 8 <= bytes.length;) {
    const kind = bytes.toString('ascii', cursor, cursor + 4);
    const length = bytes.readUInt32LE(cursor + 4);
    const start = cursor + 8;
    assert.ok(start + length <= bytes.length, 'complete RIFF chunk');
    if (kind === 'VP8L') {
      assert.equal(bytes[start], 0x2f);
      const bits = bytes.readUInt32LE(start + 1);
      return { dimensions: [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1], alpha: Boolean((bits >>> 28) & 1) };
    }
    cursor = start + length + (length % 2);
  }
  assert.fail('A lossless VP8L raster is required');
}

test('V82 conserve deux masters ImageGen inchangés et lie les hashes des dérivés indépendants', async () => {
  const report = await loadAudit();
  assert.equal(report.schema, 82);
  assert.equal(report.provider, 'OpenAI ImageGen');
  assert.equal(report.toolMode, 'built-in');
  assert.equal(report.canonExact, false);
  assert.equal(report.rightsPolicy, 'original-ai-generated-no-official-copy');
  assert.equal(report.perspective, 'strict-side-on-orthographic');
  assert.deepEqual(report.assets.map(asset => asset.kind), Object.keys(expected));
  for (const record of report.assets) {
    const contract = expected[record.kind];
    assert.equal(record.id, `proving-ground-${record.kind}-v82`);
    assert.equal(record.source, `${ROOT}/source-receipts/${contract.source}`);
    assert.equal(record.receiptId, contract.source.slice(0, -4));
    assert.equal(record.output, contract.output);
    assert.equal(record.sourceSha256, contract.sourceHash);
    assert.equal(record.outputSha256, contract.outputHash);
    const [source, output] = await Promise.all([readFile(record.source), readFile(record.output)]);
    assert.equal(hash(source), contract.sourceHash);
    assert.equal(hash(output), contract.outputHash);
    assert.equal(output.length, record.outputBytes);
    const master = inspectPng(source);
    assert.deepEqual([master.width, master.height], contract.sourceSize);
    assert.deepEqual(record.sourceMetrics.dimensions, contract.sourceSize);
    assert.deepEqual(record.metrics.dimensions, contract.outputSize);
    assert.deepEqual(record.qa, { losslessPixels: true, whiteBackgroundParasite: false, hiddenRgbParasite: false });
  }
});

test('le mur V82 est un fond WebP lossless opaque 1920×720, sans étirement de perspective', async () => {
  const report = await loadAudit();
  const wall = report.assets.find(asset => asset.kind === 'wall');
  assert.deepEqual(inspectLosslessWebP(await readFile(wall.output)), { dimensions: [1920, 720], alpha: false });
  assert.equal(wall.alphaPolicy, 'opaque');
  assert.equal(wall.metrics.transparentPixels, 0);
  assert.equal(wall.metrics.alphaMin, 255);
  assert.equal(wall.metrics.opaqueNearWhiteBorderPixels, 0);
  assert.deepEqual(wall.transform.sourceCropBounds, [0, 0, 2048, 768]);
  assert.equal(wall.transform.preserveAspectRatio, true);
  assert.equal(1920 / 2048, 720 / 768);
  assert.deepEqual(wall.transform.pivot.pixels, [0, 0]);
});

test('la poutre V82 conserve les marges alpha, les proportions et son ancrage plafond matériel', async () => {
  const report = await loadAudit();
  const beam = report.assets.find(asset => asset.kind === 'ceiling-beam');
  assert.equal(beam.alphaPolicy, 'generated-alpha-preserved');
  assert.deepEqual(beam.sourceMetrics.contentBounds, [21, 70, 2149, 682]);
  assert.deepEqual(beam.transform.sourceCropBounds, [13, 62, 2157, 690]);
  assert.deepEqual(beam.transform.sourceCropDimensions, [2144, 628]);
  assert.equal(beam.transform.cropPaddingPx, 8);
  assert.equal(beam.transform.preserveAspectRatio, true);
  assert.equal(beam.metrics.dimensions[0], 1536);
  assert.equal(beam.metrics.dimensions[1], Math.round(628 * 1536 / 2144));
  assert.deepEqual(beam.metrics.contentBounds, [6, 6, 1530, 444]);
  assert.deepEqual(beam.metrics.solidBounds, [11, 141, 1528, 283]);
  assert.equal(beam.transform.pivot.role, 'ceiling-mount-top-center');
  assert.deepEqual(beam.transform.pivot.pixels, [768, 141]);
  assert.deepEqual(beam.transform.pivot.normalized, [0.5, 0.31333333]);

  const pixels = inspectPng(await readFile(beam.output));
  assert.deepEqual([pixels.width, pixels.height], [1536, 450]);
  assert.equal(pixels.colorType, 6);
  assert.equal(pixels.alphaMin, 0);
  assert.equal(pixels.alphaMax, 255);
  assert.ok(pixels.transparentRatio > 0.65, 'les espaces autour de la poutre restent transparents');
  assert.ok(pixels.visibleRatio > 0.25, 'la poutre contient une silhouette exploitable');
  assert.equal(pixels.hiddenRgbRatio, 0);
  assert.equal(pixels.opaqueNearWhiteBorderRatio, 0);
  assert.equal(pixels.opaqueBorderRatio, 0);
  assert.ok(pixels.nearWhiteOpaqueRatio < 0.02, 'les lampes ne deviennent pas un fond blanc');
  assert.ok(Math.abs(pixels.nearWhiteOpaqueRatio - beam.metrics.nearWhiteOpaqueRatio) < 1e-8);
});
