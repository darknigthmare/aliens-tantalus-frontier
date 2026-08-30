import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import test from 'node:test';

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  return crc >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const name = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
};

function encodePng(width, height, channels, pixelAt) {
  const colorType = channels === 4 ? 6 : 2;
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * channels);
    for (let x = 0; x < width; x += 1) {
      const pixel = pixelAt(x, y);
      for (let channel = 0; channel < channels; channel += 1) {
        row[1 + x * channels + channel] = pixel[channel];
      }
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  return Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

async function put(root, relative, buffer) {
  const target = join(root, ...relative.split('/'));
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buffer);
}

test('V62 PNG audit separates opaque scenes and catches alpha/grid failures', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'atf-png-audit-v62-'));
  const output = join(fixture, 'report.json');
  try {
    const good = 'sprites/normalized/player/good.png';
    const missing = 'sprites/normalized/player/missing-alpha.png';
    const badGrid = 'sprites/normalized/player/bad-grid.png';
    await put(fixture, good, encodePng(32, 32, 4, (x, y) => (
      x >= 8 && x < 24 && y >= 8 && y < 24 ? [32, 48, 56, 255] : [0, 0, 0, 0]
    )));
    await put(fixture, missing, encodePng(32, 32, 3, () => [255, 255, 255]));
    await put(fixture, badGrid, encodePng(31, 32, 4, () => [0, 0, 0, 0]));
    await put(fixture, 'hub/vents/fixture-opaque-scene.png', encodePng(32, 18, 3, () => [12, 18, 22]));
    const transparentLayer = (width, height) => encodePng(width, height, 4, (x, y) => (
      x >= 4 && x < width - 4 && y >= 4 && y < height - 4
        ? [32, 48, 56, 255]
        : [0, 0, 0, 0]
    ));
    await put(fixture, 'metroidvania/tantalus-mission-far.png', encodePng(40, 24, 3, () => [12, 18, 22]));
    await put(fixture, 'metroidvania/tantalus-mission-mid.png', transparentLayer(48, 24));
    await put(fixture, 'metroidvania/tantalus-mission-foreground.png', transparentLayer(48, 24));
    await put(fixture, 'metroidvania/fixture-parallax-far.png', encodePng(40, 24, 3, () => [12, 18, 22]));
    await put(fixture, 'metroidvania/fixture-parallax-mid.png', transparentLayer(48, 24));

    const manifest = {
      contracts: {
        grids: {
          fixture: { columns: 2, rows: 2, cellWidth: 16, cellHeight: 16, guard: 1 }
        }
      },
      sheets: [good, missing, badGrid].map((path, index) => ({
        id: `fixture.${index}`,
        grid: 'fixture',
        files: { normalized: `/assets/openai/${path}` }
      }))
    };
    const manifestPath = join(fixture, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify(manifest));

    const python = process.platform === 'win32' ? 'py' : 'python3';
    const result = spawnSync(python, [
      'scripts/audit-png-alpha-v62.py',
      '--asset-root', fixture,
      '--manifest', manifestPath,
      '--output', output
    ], { cwd: process.cwd(), encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const report = JSON.parse(await readFile(output, 'utf8'));
    assert.equal(report.summary.assetsAudited, 9);
    assert.equal(report.summary.byExpectation['opaque-expected'], 3);
    assert.equal(report.summary.runtimeCoverNormalizedAssets, 3);
    const codes = report.findings.map((entry) => `${entry.path}:${entry.code}`);
    assert.ok(codes.includes('assets/openai/sprites/normalized/player/missing-alpha.png:missing-alpha'));
    assert.ok(codes.includes('assets/openai/sprites/normalized/player/missing-alpha.png:edge-connected-near-white'));
    assert.ok(codes.includes('assets/openai/sprites/normalized/player/bad-grid.png:grid-dimension-mismatch'));
    assert.ok(!codes.some((entry) => entry.includes('fixture-opaque-scene.png:missing-alpha')));
    assert.ok(codes.includes('assets/openai/metroidvania/fixture-parallax-far.png:layer-dimension-mismatch'));
    assert.ok(codes.includes('assets/openai/metroidvania/fixture-parallax-mid.png:layer-dimension-mismatch'));
    assert.ok(!codes.some((entry) => entry.includes('tantalus-mission') && entry.includes('layer-dimension-mismatch')));
    const normalized = report.assets.filter((asset) => asset.runtimeCoverNormalization);
    assert.ok(normalized.every((asset) => (
      asset.runtimeCoverNormalization.id === 'tantalus-mission-runtime-cover-v62'
      && asset.runtimeCoverNormalization.mode === 'centered-cover'
      && asset.runtimeCoverNormalization.targetAspect === 2
    )));
    assert.deepEqual(
      normalized.find((asset) => asset.path.endsWith('tantalus-mission-far.png'))
        .runtimeCoverNormalization.sourceCrop,
      { sourceX: 0, sourceY: 2, sourceWidth: 40, sourceHeight: 20 }
    );
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
