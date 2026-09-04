import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';

import {
  ALIEN_SURVIVAL_REUSED_ASSETS_V70,
  ALIEN_SURVIVAL_SYSTEM_CELL_ORDER_V70,
  ALIEN_SURVIVAL_SYSTEMS_SHEET_V70,
  alienSurvivalVisualRuntimeReportV70,
  createAlienSurvivalSystemsSheetV70,
  resolveAlienSurvivalReusedAssetV70,
  resolveAlienSurvivalSystemCellV70
} from '../src/alien-survival-visuals-v70.js';

const ALLOW_MISSING_ART = process.env.ATF_V70_ALLOW_MISSING_ART === '1';

const paeth = (left, above, upperLeft) => {
  const prediction = left + above - upperLeft;
  const distances = [Math.abs(prediction - left), Math.abs(prediction - above), Math.abs(prediction - upperLeft)];
  return distances[0] <= distances[1] && distances[0] <= distances[2] ? left : distances[1] <= distances[2] ? above : upperLeft;
};

function decodeRgbaPng(bytes) {
  assert.ok(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'signature PNG invalide');
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const chunks = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') chunks.push(data);
    offset += length + 12;
    if (type === 'IEND') break;
  }
  assert.equal(bitDepth, 8);
  assert.equal(colorType, 6, 'atlas V70 attendu en RGBA');
  assert.equal(interlace, 0, 'atlas V70 non entrelacé attendu');
  const packed = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const pixels = Buffer.alloc(stride * height);
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = packed[sourceOffset++];
    const rowOffset = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = packed[sourceOffset + x];
      const left = x >= 4 ? pixels[rowOffset + x - 4] : 0;
      const above = y ? pixels[rowOffset - stride + x] : 0;
      const upperLeft = y && x >= 4 ? pixels[rowOffset - stride + x - 4] : 0;
      if (filter === 0) pixels[rowOffset + x] = raw;
      else if (filter === 1) pixels[rowOffset + x] = (raw + left) & 255;
      else if (filter === 2) pixels[rowOffset + x] = (raw + above) & 255;
      else if (filter === 3) pixels[rowOffset + x] = (raw + Math.floor((left + above) / 2)) & 255;
      else if (filter === 4) pixels[rowOffset + x] = (raw + paeth(left, above, upperLeft)) & 255;
      else assert.fail(`filtre PNG non pris en charge: ${filter}`);
    }
    sourceOffset += stride;
  }
  return { width, height, pixels };
}

test('le registre V70 réserve exactement huit cellules système distinctes en 4x2', () => {
  assert.deepEqual(ALIEN_SURVIVAL_SYSTEM_CELL_ORDER_V70, [
    'power-distributor-off',
    'life-support-powered',
    'security-powered',
    'cctv-powered',
    'pressure-valve',
    'cctv-console',
    'airlock-welding',
    'self-destruct-armed'
  ]);
  assert.deepEqual(resolveAlienSurvivalSystemCellV70('power-distributor-off'), { id: 'power-distributor-off', column: 0, row: 0 });
  assert.deepEqual(resolveAlienSurvivalSystemCellV70('cctv-powered'), { id: 'cctv-powered', column: 3, row: 0 });
  assert.deepEqual(resolveAlienSurvivalSystemCellV70('breaker-cctv'), { id: 'cctv-powered', column: 3, row: 0 });
  assert.deepEqual(resolveAlienSurvivalSystemCellV70('self-destruct-armed'), { id: 'self-destruct-armed', column: 3, row: 1 });
  assert.equal(resolveAlienSurvivalSystemCellV70('unknown'), null);
  assert.deepEqual(alienSurvivalVisualRuntimeReportV70(), {
    schema: 70,
    sheets: 1,
    cells: 8,
    distinctCells: 8,
    invalidCells: 0,
    reusedAssets: 5,
    missingReleaseMetadata: [],
    runtimeReady: true
  });
});

test('le contrat V70 verrouille ensemble metadata, provenance OpenAI et hash épinglé', async () => {
  const metadata = JSON.parse(await readFile(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.metadataPath, 'utf8'));
  assert.equal(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.contractId, 'alien-survival-systems-atlas-v70');
  assert.equal(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.expectedSha256, '6f3d8d37c38d6528609e870adb815f550c4d98f998379e42dc49a4046a8ce366');
  assert.equal(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.provenance.provider, 'OpenAI ImageGen');
  assert.equal(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.canonExact, false);
  assert.equal(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.releaseReady, true);
  assert.equal(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.assetStatus, 'ready');
  assert.equal(metadata.contractId, ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.contractId);
  assert.equal(metadata.outputSha256, ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.expectedSha256);
  assert.equal(metadata.artProvider, ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.provenance.provider);
  assert.equal(metadata.pipeline, ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.provenance.pipeline);
  assert.equal(metadata.source, ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.provenance.sourceAsset);
  assert.equal(metadata.canonExact, ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.canonExact);
  assert.deepEqual(metadata.dimensions, [ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.width, ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.height]);
  assert.deepEqual(metadata.grid, {
    columns: ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.columns,
    rows: ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.rows,
    cellWidth: ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.cellWidth,
    cellHeight: ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.cellHeight,
    guard: ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.guard
  });
  assert.deepEqual(metadata.cells.map(({ id, column, row }) => ({ id, column, row })), ALIEN_SURVIVAL_SYSTEM_CELL_ORDER_V70.map((id) => resolveAlienSurvivalSystemCellV70(id)));

  const pending = createAlienSurvivalSystemsSheetV70();
  assert.equal(pending.releaseReady, false);
  assert.deepEqual(alienSurvivalVisualRuntimeReportV70(pending), {
    schema: 70,
    sheets: 1,
    cells: 8,
    distinctCells: 8,
    invalidCells: 0,
    reusedAssets: 5,
    missingReleaseMetadata: ['contractId', 'expectedSha256', 'metadataPath', 'provenance'],
    runtimeReady: false
  });
});

test('V70 réemploie les outils, le sas et l’acide existants sans faux atlas dédié', async () => {
  assert.deepEqual(Object.keys(ALIEN_SURVIVAL_REUSED_ASSETS_V70), [
    'welding-kit',
    'portable-battery',
    'pressure-suit',
    'pressure-airlock',
    'acid-floor-hazard'
  ]);
  assert.equal(resolveAlienSurvivalReusedAssetV70('pressure-airlock')?.visualRole, 'pressure-airlock');
  assert.equal(resolveAlienSurvivalReusedAssetV70('acid-floor-hazard')?.purpose, 'persistent-acid-pool');
  assert.equal(resolveAlienSurvivalReusedAssetV70('missing'), null);
  for (const asset of Object.values(ALIEN_SURVIVAL_REUSED_ASSETS_V70)) {
    const bytes = await readFile(`.${asset.path}`);
    assert.ok(bytes.length > 64, `${asset.id} absent ou vide`);
    assert.ok(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${asset.id} doit rester un PNG`);
  }
});

test('la gate art V70 exige un atlas RGBA 1024x512, huit cellules occupées et le hash accepté', async (context) => {
  let bytes;
  try {
    bytes = await readFile(`.${ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.path}`);
  } catch (error) {
    if (error?.code === 'ENOENT' && ALLOW_MISSING_ART) {
      context.skip('atlas V70 en attente : tolérance développement explicitement activée');
      return;
    }
    throw error;
  }

  if (!ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.releaseReady) {
    if (ALLOW_MISSING_ART) context.diagnostic('atlas présent mais recette/hash encore en attente sous tolérance développement');
    else assert.fail('injecter contractId, provenance et expectedSha256 avant la gate finale V70');
  }
  if (ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.expectedSha256) {
    assert.equal(createHash('sha256').update(bytes).digest('hex'), ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.expectedSha256);
  } else if (!ALLOW_MISSING_ART) assert.fail('hash SHA-256 V70 non épinglé');

  const decoded = decodeRgbaPng(bytes);
  assert.equal(decoded.width, ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.width);
  assert.equal(decoded.height, ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.height);
  let transparent = 0;
  let hiddenRgb = 0;
  for (let index = 0; index < decoded.pixels.length; index += 4) {
    if (decoded.pixels[index + 3] !== 0) continue;
    transparent += 1;
    if (decoded.pixels[index] || decoded.pixels[index + 1] || decoded.pixels[index + 2]) hiddenRgb += 1;
  }
  assert.ok(transparent > decoded.width * decoded.height * 0.4, 'fond transparent insuffisant');
  assert.equal(hiddenRgb, 0, 'RGB caché interdit sous les pixels transparents');

  const hashes = new Set();
  for (const cell of ALIEN_SURVIVAL_SYSTEM_CELL_ORDER_V70.map(resolveAlienSurvivalSystemCellV70)) {
    const cellBytes = [];
    let occupied = 0;
    let guardLeak = 0;
    for (let localY = 0; localY < ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.cellHeight; localY += 1) {
      for (let localX = 0; localX < ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.cellWidth; localX += 1) {
        const x = cell.column * ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.cellWidth + localX;
        const y = cell.row * ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.cellHeight + localY;
        const start = (y * decoded.width + x) * 4;
        const rgba = decoded.pixels.subarray(start, start + 4);
        cellBytes.push(...rgba);
        if (!rgba[3]) continue;
        occupied += 1;
        const guard = ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.guard;
        if (
          localX < guard
          || localX >= ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.cellWidth - guard
          || localY < guard
          || localY >= ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.cellHeight - guard
        ) guardLeak += 1;
      }
    }
    assert.ok(occupied > 4_000, `cellule système vide : ${cell.id}`);
    assert.equal(guardLeak, 0, `fuite hors garde : ${cell.id}`);
    hashes.add(createHash('sha256').update(Buffer.from(cellBytes)).digest('hex'));
  }
  assert.equal(hashes.size, 8, 'les huit cellules V70 doivent être visuellement distinctes');
});
