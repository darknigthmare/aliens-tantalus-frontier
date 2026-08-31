import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('V66 source audit is read-only and batch anchor reviews remain isolated', () => {
  const result = spawnSync(process.platform === 'win32' ? 'py' : 'python3', ['tests/test_v66_source_audit.py'], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.error || ''}\n${result.stdout}\n${result.stderr}`);
});
