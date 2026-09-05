import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('V73 standalone normalization reviews preserve strict source, profile and evidence checks', () => {
  const result = spawnSync(process.platform === 'win32' ? 'py' : 'python3', ['tests/test_enemy_batch_standalone_reviews_v73.py'], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.error || ''}\n${result.stdout}\n${result.stderr}`);
});
