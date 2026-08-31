import { relative } from 'node:path';
import { V65_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v65.js';

// Production inputs stay in the source tree; only runtime atlases belong in dist.
export const EXCLUDED_BUILD_ASSET_PATHS = Object.freeze([
  'assets/openai/sprites/raw',
  'assets/openai/v65-enemy-profile-normalization-report.json',
  'assets/openai/sprites/normalized/equipment',
  'assets/openai/sprites/normalized/facehugger-motion-v65',
  ...['v64', 'v65'].flatMap((version) =>
    ['frames', 'reference-masters', 'previews', 'metadata'].map((directory) =>
      `assets/openai/sprites/${directory}/${version}`))
]);

export function createBuildAssetFilter(projectRoot) {
  const readyV65Paths = new Set(V65_READY_ENEMY_PROFILE_ASSETS.map((asset) => asset.path.replace(/^\//, '')));
  return (source) => {
    const sourcePath = relative(projectRoot, source).replaceAll('\\', '/');
    if (sourcePath.startsWith('assets/openai/sprites/normalized/enemy-profiles-v65/')) {
      return readyV65Paths.has(sourcePath);
    }
    return !EXCLUDED_BUILD_ASSET_PATHS.some((excluded) =>
      sourcePath === excluded || sourcePath.startsWith(`${excluded}/`));
  };
}
