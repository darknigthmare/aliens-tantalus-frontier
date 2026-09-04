import { isAbsolute, parse, relative, resolve, sep } from 'node:path';

function isInside(candidate, parent) {
  const path = relative(parent, candidate);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

export function resolveSafeBuildOutput(projectRoot, requestedOutput = 'dist') {
  const root = resolve(projectRoot);
  const output = resolve(root, requestedOutput);
  const volumeRoot = parse(output).root;
  const outputContainsProject = output !== root && isInside(root, output);
  if (output === root || output === volumeRoot || outputContainsProject) {
    throw new Error(`Unsafe ATF_BUILD_OUTPUT: refusing to remove ${output}`);
  }
  return output;
}
