import { relative } from 'node:path';
import { V65_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v65.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v66.js';
import { V81_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v81.js';
import { ENEMY_IMPORT_ADMISSIONS_V103 } from '../src/enemy-import-admissions-v103.js';
import { ENEMY_IMPORT_ADMISSIONS_V105 } from '../src/enemy-import-admissions-v105.js';
import { ENEMY_IMPORT_ADMISSIONS_V106 } from '../src/enemy-import-admissions-v106.js';
import { USER_SPECIMEN_ART_V106 } from '../src/user-specimens-v106.js';
import { ENEMY_IMPORT_ANIMATIONS_V107, ENEMY_IMPORT_ANIMATIONS_V108 } from '../src/enemy-import-animation-v107.js';
import { ENEMY_IMPORT_ATTACKS_V109 } from '../src/enemy-import-attacks-v109.js';

// Production inputs stay in the source tree; only runtime atlases belong in dist.
export const EXCLUDED_BUILD_ASSET_PATHS = Object.freeze([
  'assets/openai/sprites/static-import-v109',
  'assets/openai/sprites/static-game-v109',
  'assets/openai/sprites/static-import-v108',
  'assets/openai/sprites/static-game-v108',
  'assets/openai/sprites/static-import-v107',
  'assets/openai/sprites/static-game-v107',
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
  const readyV109Paths = new Set(ENEMY_IMPORT_ATTACKS_V109.filter(asset =>
    asset.reviewStatus === 'accepted-multi-pose-adaptation' && asset.action === 'light'
    && asset.posesVerified === true && asset.alphaVerified === true && asset.canonExact === false
    && /^[a-f0-9]{64}$/.test(asset.sha256 || '') && asset.frames.length === 4
    && /^\/assets\/openai\/sprites\/animated-import-v109\/[a-z0-9-]+\.png$/.test(asset.path || ''))
    .map(asset => asset.path.slice(1)));
  const readyV108Paths = new Set(ENEMY_IMPORT_ANIMATIONS_V108.map(asset => asset.path.slice(1)));
  const readyV107Paths = new Set(ENEMY_IMPORT_ANIMATIONS_V107.map(asset => asset.path.slice(1)));
  const readyV106Paths = new Set([...ENEMY_IMPORT_ADMISSIONS_V106, ...USER_SPECIMEN_ART_V106].filter(asset =>
    asset.reviewStatus === 'accepted-static-adaptation' && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && /^\/assets\/openai\/sprites\/static-(?:import|game)-v106\/[a-z0-9-]+\.png$/.test(asset.path || '')
    && asset.sourceWidth > 0 && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
  const readyV105Paths = new Set(ENEMY_IMPORT_ADMISSIONS_V105.filter(asset =>
    asset.reviewStatus === 'accepted-static-adaptation' && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && asset.path === `/assets/openai/sprites/static-import-v105/${asset.slug}.png`
    && asset.sourceWidth > 0 && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
  const readyV103Paths = new Set(ENEMY_IMPORT_ADMISSIONS_V103.filter(asset =>
    asset.reviewStatus === 'accepted-static-adaptation' && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && asset.path === `/assets/openai/sprites/static-import-v103/${asset.slug}.png`
    && asset.sourceWidth > 0 && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
  const readyV65Paths = new Set(V65_READY_ENEMY_PROFILE_ASSETS.map((asset) => asset.path.replace(/^\//, '')));
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
    if (sourcePath.startsWith('assets/openai/sprites/animated-import-v109/')) return readyV109Paths.has(sourcePath);
    if (/^assets\/openai\/sprites\/(?:[^/]+\/)*[^/]*v109(?:[^0-9]|$)/i.test(sourcePath)) {
      return sourcePath === 'assets/openai/sprites/animated-import-v109';
    }
    if (sourcePath.startsWith('assets/openai/sprites/animated-import-v108/')) return readyV108Paths.has(sourcePath);
    if (sourcePath.startsWith('assets/openai/sprites/animated-import-v107/')) return readyV107Paths.has(sourcePath);
    if (/^assets\/openai\/sprites\/static-(?:import|game)-v106\//.test(sourcePath)) return readyV106Paths.has(sourcePath);
    if (sourcePath.startsWith('assets/openai/sprites/static-import-v105/')) return readyV105Paths.has(sourcePath);
    if (sourcePath.startsWith('assets/openai/sprites/static-import-v103/')) return readyV103Paths.has(sourcePath);
    if (sourcePath === 'docs' || sourcePath.startsWith('docs/')) return false;
    // Production references also contain source-contact sheets, anchors and
    // full generation prompts. Reject their root before cp descends into it;
    // public provenance/version/validation reports outside this scope remain.
    if (/^docs\/references\/(?:V(?:66|73|74|75|76|77|78|79|80|81|82|83|84|85|86)_|v(?:66|73|74|75|76|77|78|79|80|81|82|83|84|85|86)-)/.test(sourcePath)) return false;
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
