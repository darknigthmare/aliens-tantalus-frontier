import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('V66 normalization preserves alpha and connected anatomy; rejects duplicate poses', () => {
  const result = spawnSync(process.platform === 'win32' ? 'py' : 'python3', ['tests/test_enemy_batch_normalizer_v66.py'], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.error || ''}\n${result.stdout}\n${result.stderr}`);
});
