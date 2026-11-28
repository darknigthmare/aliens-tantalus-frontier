import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_STAGES_V96 } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_MENU_ATLASES_V222 } from '../src/xeno-trials-menu-atlases-v222.js';
import { getXenoTrialsMenuTileV222 } from '../src/xeno-trials-menu-media-v222.js';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

test('V222 reserves a distinct offline tile for each published roster variant and each illustrated stage', () => {
  const fighter = XENO_TRIALS_FIGHTERS_V96.slice(0, 189).flatMap(definition => [definition.id,
    ...definition.variants.map(variant => `${definition.id}:${variant}`)]);
  const stage = XENO_TRIALS_STAGES_V96.filter(definition => definition.backdrop).map(definition => definition.id);
  for (const [kind, ids] of Object.entries({ fighter, stage })) {
    assert.deepEqual(XENO_TRIALS_MENU_ATLASES_V222[kind].ids, ids);
    const positions = ids.map(key => {
      const [id, variant] = key.split(':');
      const tile = getXenoTrialsMenuTileV222(kind, id, variant);
      assert.ok(tile.x >= 0 && tile.x < tile.columns && tile.y >= 0 && tile.y < tile.rows, key);
      return tile.y * tile.columns + tile.x;
    });
    assert.equal(new Set(positions).size, ids.length);
  }
  assert.equal(getXenoTrialsMenuTileV222('fighter', 'arachnoid', 'unknown'), null);
  assert.equal(getXenoTrialsMenuTileV222('constructor', 'warrior'), null);
});

test('V222 admits and pins only the two generated WebP menu atlases', () => {
  for (const atlas of Object.values(XENO_TRIALS_MENU_ATLASES_V222)) {
    const path = atlas.path.slice(1), bytes = readFileSync(path);
    assert.ok(isPublicDistributionPathV86(path, { built: true }));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), atlas.sha256);
  }
  assert.equal(isPublicDistributionPathV86('assets/openai/xeno-trials-menu-v222/unreviewed.webp', { built: true }), false);
});
