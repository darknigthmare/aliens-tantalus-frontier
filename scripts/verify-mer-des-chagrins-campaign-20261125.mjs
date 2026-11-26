import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const timeout = 180_000;
const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const campaignRoot = fileURLToPath(new URL('../dlc/sea-of-sorrows/', import.meta.url));
const pythonVerifier = fileURLToPath(new URL('./verify-mer-des-chagrins-restore.py', import.meta.url));

async function runCheck(t, label, executable, args, cwd, extraEnv = {}) {
  try {
    return await execFileAsync(executable, args, {
      cwd,
      env: { ...process.env, ...extraEnv },
      timeout,
      signal: t.signal,
      killSignal: 'SIGKILL',
      maxBuffer: 16 * 1024 * 1024,
      encoding: 'utf8',
      windowsHide: true,
    });
  } catch (error) {
    assert.fail([
      label,
      'Command: ' + JSON.stringify([executable, ...args]),
      'Exit: ' + (error.code ?? 'unknown') + '; signal: ' + (error.signal ?? 'none'),
      error.message,
      '--- stdout ---',
      error.stdout ?? '',
      '--- stderr ---',
      error.stderr ?? '',
    ].join('\n'));
  }
}

test('Mer des Chagrins: original campaign checks', { timeout }, async (t) => {
  const npmScript = process.env.npm_execpath;
  const executable = npmScript ? process.execPath : 'npm';
  const args = npmScript ? [npmScript, 'run', 'check'] : ['run', 'check'];
  const result = await runCheck(t, 'Original DLC check failed', executable, args, campaignRoot);
  const summary = result.stdout.split('\n').filter((line) => /^# (tests|pass|fail) /.test(line));
  if (summary.length) t.diagnostic(summary.join('; '));
});

test('Mer des Chagrins: archive restoration regression checks', { timeout }, async (t) => {
  const result = await runCheck(
    t,
    'Archive restoration regression checks failed',
    'python3',
    [pythonVerifier],
    repoRoot,
    { PYTHONDONTWRITEBYTECODE: '1' },
  );
  t.diagnostic(result.stdout.trim());
});
