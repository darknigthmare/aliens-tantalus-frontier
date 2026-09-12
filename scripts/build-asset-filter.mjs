import { relative } from 'node:path';
import { V65_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v65.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v66.js';

// Production inputs stay in the source tree; only runtime atlases belong in dist.
export const EXCLUDED_BUILD_ASSET_PATHS = Object.freeze([
  'assets/openai/sprites/raw',
  'assets/openai/v65-enemy-profile-normalization-report.json',
  'assets/openai/sprites/normalized/equipment',
  'assets/openai/sprites/normalized/facehugger-motion-v65',
  'assets/openai/sprites/normalized/enemy-clips-v66',
  'assets/openai/sprites/normalized/enemy-motion-v66',
  'assets/openai/sprites/frames/v71',
  'assets/openai/sprites/frames/v72',
  'assets/openai/sprites/frames/v73',
  'assets/openai/sprites/frames/v74',
  'assets/openai/sprites/frames/v75',
  ...['v64', 'v65', 'v66', 'v69', 'v70'].flatMap((version) =>
    ['frames', 'reference-masters', 'previews', 'metadata'].map((directory) =>
      `assets/openai/sprites/${directory}/${version}`))
]);

export function createBuildAssetFilter(projectRoot, { readyV66Assets = V66_READY_ENEMY_PROFILE_ASSETS } = {}) {
  const readyV65Paths = new Set(V65_READY_ENEMY_PROFILE_ASSETS.map((asset) => asset.path.replace(/^\//, '')));
  // Both explicit review and exact profile ownership are required. A similarly
  // named file, nested candidate or newly present atlas cannot enter dist.
  const readyV66Paths = new Set(readyV66Assets
    .filter((asset) => /^enemy-\d{3}-[a-z0-9-]+$/.test(asset.profileId || '')
      && asset.reviewStatus === 'accepted' && asset.identityVerified === true
      && asset.path === `/assets/openai/sprites/normalized/enemy-profiles-v66/${asset.profileId}.webp`)
    .map((asset) => asset.path.slice(1)));
  return (source) => {
    const sourcePath = relative(projectRoot, source).replaceAll('\\', '/');
    // Production references also contain source-contact sheets, anchors and
    // full generation prompts. Reject their root before cp descends into it;
    // public provenance/version/validation reports outside this scope remain.
    if (/^docs\/references\/(?:V(?:66|73|74|75|76|77|78|79|80)_|v(?:66|73|74|75|76|77|78|79|80)-)/.test(sourcePath)) return false;
    if (sourcePath.startsWith('assets/openai/sprites/normalized/enemy-profiles-v65/')) {
      return readyV65Paths.has(sourcePath);
    }
    if (sourcePath.startsWith('assets/openai/sprites/normalized/enemy-profiles-v66/')) {
      return readyV66Paths.has(sourcePath);
    }
    return !EXCLUDED_BUILD_ASSET_PATHS.some((excluded) =>
      sourcePath === excluded || sourcePath.startsWith(`${excluded}/`));
  };
}
