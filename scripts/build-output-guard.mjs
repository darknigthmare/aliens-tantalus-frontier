import { lstatSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, parse, relative, resolve, sep } from 'node:path';

// One named, reproducible workspace output is permitted when the release
// checkout's volume cannot hold dist. This is not an arbitrary temp root.
export const PUBLIC_BUILD_OUTPUT_V116 = resolve(homedir(), 'Documents', 'Codex', 'atf-v116-public-build');

const isInside = (candidate, parent) => {
  const path = relative(parent, candidate);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
};

function assertRealDirectoryChain(path) {
  // lstat, not stat: symlinks and Windows directory junctions must not redirect
  // cleanup. Check every existing ancestor, even while the output is absent.
  for (let current = path; ; current = dirname(current)) {
    try {
      const entry = lstatSync(current);
      if (entry.isSymbolicLink() || !entry.isDirectory()) {
        throw new Error(`Unsafe ATF_BUILD_OUTPUT: non-directory or link at ${current}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (dirname(current) === current) break;
  }
}

export function resolveSafeBuildOutput(projectRoot, requestedOutput = 'dist') {
  const root = resolve(projectRoot);
  const output = resolve(root, requestedOutput);
  if (root === parse(root).root || output === root || output === parse(output).root
    || isInside(root, output)
    || ![resolve(root, 'dist'), PUBLIC_BUILD_OUTPUT_V116].includes(output)) {
    throw new Error(`Unsafe ATF_BUILD_OUTPUT: refusing to remove ${output}`);
  }
  // The source checkout and generated output both require clean ancestor
  // chains; checking only the final dist entry misses a junction in a parent.
  assertRealDirectoryChain(root);
  assertRealDirectoryChain(output);
  return output;
}
