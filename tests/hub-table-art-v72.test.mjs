import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { HUB_DECKS, HUB_WORLD, HUB_MODULAR_PROP_FILES } from '../src/hub-game.js';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const reportPath = 'assets/openai/hub/props/operations-table-side-v72-report.json';

test('table2D V72 : vraie source OpenAI verrouillée, alpha sans fond blanc/chroma et pixels sujet conservés', () => {
  const report = JSON.parse(read(reportPath));
  assert.equal(report.provider, 'OpenAI ImageGen');
  assert.equal(report.canonExact, false);
  assert.equal(hash(read(report.source)), report.sourceSha256);
  assert.equal(hash(read(report.output)), report.outputSha256);
  assert.deepEqual(report.dimensions, [1617, 262]);
  assert.deepEqual(report.contentBounds, [3, 3, 1614, 259]);
  assert.equal(report.extraction.discardedForegroundPixels, 0);
  assert.equal(report.inpaintedPixels, 0);
  assert.equal(report.rescaled, false);
  assert.ok(report.transparentPixels > 10000);
  assert.equal(report.hiddenRgbPixels, 0);
  assert.equal(report.opaqueWhitePixels, 0);
  assert.equal(report.magentaSpill.remainingStrictPixelCount, 0);
  assert.ok(report.enclosedMatte.strictCorePixelCount > 0, 'les deux poignées ne gardent pas leur fond magenta');
  assert.equal(report.enclosedMatte.inpaintedPixels, 0);
  const table = HUB_DECKS[0].rooms.find((room) => room.id === 'briefing');
  assert.equal(table.prop, `/${report.output}`);
  assert.ok(HUB_MODULAR_PROP_FILES.includes(table.prop));
  assert.deepEqual(table.propSourceBounds, report.contentBounds);
  assert.equal(table.propRenderBounds.w, 520);
  assert.equal(table.propRenderBounds.y + table.propRenderBounds.h, HUB_WORLD.floorY);
  assert.ok(table.propRenderBounds.h < 92, 'une table reste sous la tête du joueur');
});

test('le packaging technique table V72 se revalide sans réécrire ses fichiers', () => {
  const before = read(reportPath);
  const script = fileURLToPath(new URL('scripts/process-hub-table-v72.py', root));
  const command = process.env.PYTHON || (process.platform === 'win32' ? 'py' : 'python3');
  const args = process.platform === 'win32' && !process.env.PYTHON ? ['-3', script, '--check'] : [script, '--check'];
  const result = spawnSync(command, args, { cwd: fileURLToPath(root), encoding: 'utf8', timeout: 120000 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(read(reportPath), before);
});
