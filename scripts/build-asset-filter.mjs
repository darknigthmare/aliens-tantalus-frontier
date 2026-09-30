import { relative } from 'node:path';
import { V65_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v65.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v66.js';
import { V81_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v81.js';
import { ENEMY_SPRITE_REVISIONS_V92 } from '../src/enemy-sprite-revisions-v92.js';
import { ENEMY_SPRITE_REVISIONS_V93 } from '../src/enemy-sprite-revisions-v93.js';
import { ENEMY_ADDITIONAL_POSES_V94 } from '../src/enemy-additional-poses-v94.js';
import { ENEMY_USER_CREATIONS_V95 } from '../src/enemy-user-creations-v95.js';
import { USER_EQUIPMENT_ART_V95 } from '../src/user-equipment-art-v95.js';
import { USER_REFERENCE_GALLERY_V95 } from '../src/user-reference-effects-v95.js';
import { ENEMY_HISTORICAL_VARIANTS_V95 } from '../src/enemy-historical-variants-v95.js';
import { ENEMY_DEDICATED_POSES_V96 } from '../src/enemy-dedicated-poses-v96.js';
import { ENEMY_EXPANSION_ASSETS_V96 } from '../src/enemy-expansion-assets-v96.js';
import { ENEMY_EXPANSION_QUEEN_V96 } from '../src/enemy-expansion-queen-v96.js';
import { ENEMY_DEDICATED_POSES_V97 } from '../src/enemy-dedicated-poses-v97.js';
import { ENEMY_DEDICATED_POSES_V98 } from '../src/enemy-dedicated-poses-v98.js';
import { ENEMY_DEDICATED_POSES_V99 } from '../src/enemy-dedicated-poses-v99.js';

// Production inputs stay in the source tree; only runtime atlases belong in dist.
export const EXCLUDED_BUILD_ASSET_PATHS = Object.freeze([
  // Source inventory, prompts, native candidates and measurements remain private.
  'docs/references/v95-user-creatures',
  'docs/references/v96-xeno-trials',
  'docs/references/v97-batch-050',
  'docs/references/v98-batch-050',
  'docs/references/v99-batch-050',
  'docs/V90_PORT_MERIDIEN_20260923.md',
  'docs/V90_CATALOG_BEHAVIORS_20260923.md',
  'docs/V90_NATIVE_CAMPAIGN_BEHAVIORS_20260923.md',
  'docs/V88_OPENING_PROGRESS_20260923.md',
  'docs/V89_OPENING_EXERCISE_20260923.md',
  'assets/openai/sprites/raw',
  'assets/openai/v65-enemy-profile-normalization-report.json',
  'assets/openai/sprites/normalized/equipment',
  'assets/openai/sprites/normalized/facehugger-motion-v65',
  'assets/openai/sprites/normalized/enemy-clips-v66',
  'assets/openai/sprites/normalized/enemy-clips-v81',
  'assets/openai/sprites/normalized/enemy-motion-v66',
  'assets/openai/sprites/frames/v71',
  'assets/openai/sprites/frames/v72',
  'assets/openai/sprites/frames/v73',
  'assets/openai/sprites/frames/v74',
  'assets/openai/sprites/frames/v75',
  ...['v64', 'v65', 'v66', 'v69', 'v70', 'v81'].flatMap((version) =>
    ['frames', 'reference-masters', 'previews', 'metadata'].map((directory) =>
      `assets/openai/sprites/${directory}/${version}`))
]);

export function createBuildAssetFilter(projectRoot, {
  readyV66Assets = V66_READY_ENEMY_PROFILE_ASSETS,
  readyV81Assets = V81_READY_ENEMY_PROFILE_ASSETS
} = {}) {
  const readyV65Paths = new Set(V65_READY_ENEMY_PROFILE_ASSETS.map((asset) => asset.path.replace(/^\//, '')));
  const readyV99Paths = new Set(ENEMY_DEDICATED_POSES_V99.filter(asset => asset.batch === 'v99-050'
    && asset.reviewStatus === 'accepted-static-adaptation' && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && asset.path === `/assets/openai/sprites/static-enemy-v99/${asset.profileId}.png`).map(asset => asset.path.slice(1)));
  const readyV98Paths = new Set(ENEMY_DEDICATED_POSES_V98.filter(asset => asset.batch === 'v98-050'
    && asset.reviewStatus === 'accepted-static-adaptation' && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && asset.path === `/assets/openai/sprites/static-enemy-v98/${asset.profileId}.png`).map(asset => asset.path.slice(1)));
  const readyV97Paths = new Set(ENEMY_DEDICATED_POSES_V97.filter(asset => asset.batch === 'v97-050'
    && asset.reviewStatus === 'accepted-static-adaptation' && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && asset.path === `/assets/openai/sprites/static-enemy-v97/${asset.profileId}.png`).map(asset => asset.path.slice(1)));
  const readyV96Paths = new Set([...ENEMY_DEDICATED_POSES_V96, ...ENEMY_EXPANSION_ASSETS_V96, ...ENEMY_EXPANSION_QUEEN_V96]
    .filter(asset => asset.reviewStatus === 'accepted-static-adaptation'
      && /^\/assets\/openai\/sprites\/static-enemy-v96\/[a-z0-9-]+\.png$/.test(asset.path || '')
      && /^[a-f0-9]{64}$/.test(asset.sha256 || '') && asset.sourceWidth > 0 && asset.sourceHeight > 0)
    .map(asset => asset.path.slice(1)));
  const readyStaticPaths = new Set([...ENEMY_SPRITE_REVISIONS_V92, ...ENEMY_SPRITE_REVISIONS_V93, ...ENEMY_ADDITIONAL_POSES_V94]
    .filter(asset => asset.reviewStatus === 'accepted-static-adaptation')
    .map(asset => asset.path.slice(1)));
  const readyV95Paths = new Set([
    ...ENEMY_USER_CREATIONS_V95.filter(asset => asset.reviewStatus === 'accepted-static-adaptation')
      .flatMap(asset => [asset, ...(asset.states || [])]),
    ...USER_EQUIPMENT_ART_V95,
    ...USER_REFERENCE_GALLERY_V95,
    ...Object.values(ENEMY_HISTORICAL_VARIANTS_V95).flatMap(group => group.states)
  ].filter(asset => asset.reviewStatus === 'accepted-static-adaptation'
    && /^\/assets\/openai\/sprites\/(?:static-enemy|user-equipment)-v95\/[a-z0-9-]+\.png$/.test(asset.path || '')
    && /^[a-f0-9]{64}$/.test(asset.sha256 || '') && asset.sourceWidth > 0 && asset.sourceHeight > 0)
    .map(asset => asset.path.slice(1)));
  // Both explicit review and exact profile ownership are required. A similarly
  // named file, nested candidate or newly present atlas cannot enter dist.
  const readyV66Paths = new Set(readyV66Assets
    .filter((asset) => /^enemy-\d{3}-[a-z0-9-]+$/.test(asset.profileId || '')
      && asset.reviewStatus === 'accepted' && asset.identityVerified === true
      && asset.path === `/assets/openai/sprites/normalized/enemy-profiles-v66/${asset.profileId}.webp`)
    .map((asset) => asset.path.slice(1)));
  const readyV81Paths = new Set(readyV81Assets
    .filter((asset) => /^enemy-\d{3}-[a-z0-9-]+$/.test(asset.profileId || '')
      && asset.reviewStatus === 'accepted' && asset.identityVerified === true
      && asset.path === `/assets/openai/sprites/normalized/enemy-profiles-v81/${asset.profileId}.webp`)
    .map((asset) => asset.path.slice(1)));
  return (source) => {
    const sourcePath = relative(projectRoot, source).replaceAll('\\', '/');
    if (sourcePath.startsWith('assets/openai/sprites/static-enemy-v99/')) return readyV99Paths.has(sourcePath);
    if (sourcePath.startsWith('assets/openai/sprites/static-enemy-v98/')) return readyV98Paths.has(sourcePath);
    if (sourcePath.startsWith('assets/openai/sprites/static-enemy-v97/')) return readyV97Paths.has(sourcePath);
    if (/^assets\/openai\/sprites\/static-enemy-v96\//.test(sourcePath)) return readyV96Paths.has(sourcePath);
    if (/^assets\/openai\/sprites\/(?:static-enemy|user-equipment)-v95\//.test(sourcePath)) return readyV95Paths.has(sourcePath);
    if (/^assets\/openai\/sprites\/static-enemy-v(?:92|93|94)\//.test(sourcePath)) return readyStaticPaths.has(sourcePath);
    if (/^docs\/references\/(?:V(?:89|90|91)_|v(?:89|90|91)-)/.test(sourcePath)) return false;
    // Production references also contain source-contact sheets, anchors and
    // full generation prompts. Reject their root before cp descends into it;
    // public provenance/version/validation reports outside this scope remain.
    if (/^docs\/references\/(?:V(?:66|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88)_|v(?:66|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88)-)/.test(sourcePath)) return false;
    if (sourcePath.startsWith('assets/openai/sprites/normalized/enemy-profiles-v65/')) {
      return readyV65Paths.has(sourcePath);
    }
    if (sourcePath.startsWith('assets/openai/sprites/normalized/enemy-profiles-v66/')) {
      return readyV66Paths.has(sourcePath);
    }
    if (sourcePath.startsWith('assets/openai/sprites/normalized/enemy-profiles-v81/')) {
      return readyV81Paths.has(sourcePath);
    }
    return !EXCLUDED_BUILD_ASSET_PATHS.some((excluded) =>
      sourcePath === excluded || sourcePath.startsWith(`${excluded}/`));
  };
}
