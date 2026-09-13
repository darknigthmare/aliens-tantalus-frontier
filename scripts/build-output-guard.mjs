import { lstatSync } from 'node:fs';
import { resolve } from 'node:path';

export function resolveSafeBuildOutput(projectRoot, requestedOutput = 'dist') {
  const root = resolve(projectRoot);
  const output = resolve(root, requestedOutput);
  // The public distribution only owns its generated dist directory.
  // Do not allow environment configuration to turn the cleanup into source deletion.
  if (output !== resolve(root, 'dist')) {
    throw new Error(`Unsafe ATF_BUILD_OUTPUT: refusing to remove ${output}`);
  }
  try {
    const entry = lstatSync(output);
    if (entry.isSymbolicLink() || !entry.isDirectory()) {
      throw new Error('Unsafe ATF_BUILD_OUTPUT: dist must be a real directory');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return output;
}
