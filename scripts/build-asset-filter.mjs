import { relative } from 'node:path';
import { V65_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v65.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v66.js';
import { V81_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v81.js';
import { ENEMY_IMPORT_ADMISSIONS_V103 } from '../src/enemy-import-admissions-v103.js';
import { ENEMY_IMPORT_ADMISSIONS_V105 } from '../src/enemy-import-admissions-v105.js';
import { ENEMY_IMPORT_ADMISSIONS_V106 } from '../src/enemy-import-admissions-v106.js';
import { USER_SPECIMEN_ART_V106 } from '../src/user-specimens-v106.js';
import { ENEMY_IMPORT_ANIMATIONS_V107, ENEMY_IMPORT_ANIMATIONS_V108, ENEMY_IMPORT_ANIMATIONS_V114, ENEMY_IMPORT_ANIMATIONS_V118 } from '../src/enemy-import-animation-v107.js';
import { ENEMY_IMPORT_ATTACKS_V109 } from '../src/enemy-import-attacks-v109.js';
import { ENEMY_SYNTH_ADAPTATIONS_V110 } from '../src/enemy-synth-adaptations-v110.js';
import { ENEMY_SYNTH_ADAPTATIONS_V111 } from '../src/enemy-synth-adaptations-v111.js';
import { ENEMY_AFE2_ADAPTATIONS_V112 } from '../src/enemy-afe2-adaptations-v112.js';
import { ENEMY_AUTOMATON_ADAPTATIONS_V112 } from '../src/enemy-automaton-adaptations-v112.js';
import { USER_SPECIMEN_RECORDS_V112 } from '../src/user-specimens-v112.js';
import { WEAPON_NATIVE_PROFILES_V112 } from '../src/weapon-native-visuals-v112.js';
import { UD4L_CATALOG_POSE_V112 } from '../src/vehicle-native-visuals-v112.js';
import { ENEMY_AFE2_ADAPTATIONS_V113 } from '../src/enemy-afe2-adaptations-v113.js';
import { ENEMY_USER_RECONSTRUCTIONS_V113 } from '../src/enemy-user-reconstructions-v113.js';
import { WEAPON_NATIVE_PROFILES_V113 } from '../src/weapon-native-visuals-v113.js';
import { VEHICLE_NATIVE_POSES_V113 } from '../src/vehicle-native-visuals-v113.js';
import { WEAPON_NATIVE_PROFILES_V116 } from '../src/weapon-native-visuals-v116.js';
import { ENEMY_AUTOMATON_ADAPTATIONS_V116 } from '../src/enemy-automaton-adaptations-v116.js';
import { WEAPON_NATIVE_PROFILES_V117 } from '../src/weapon-native-visuals-v117.js';
import { VEHICLE_NATIVE_POSES_V117 } from '../src/vehicle-native-visuals-v117.js';
import { WEAPON_NATIVE_PROFILES_V118 } from '../src/weapon-native-visuals-v118.js';
import { VEHICLE_NATIVE_POSES_V118 } from '../src/vehicle-native-visuals-v118.js';
import { ENEMY_SOURCE_ADAPTATIONS_V118 } from '../src/enemy-source-adaptations-v118.js';

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
  const v118Folders = ['assets/openai/equipment/v118-weapons', 'assets/openai/equipment/v118-vehicles', 'assets/openai/sprites/animated-import-v118', 'assets/openai/sprites/static-game-v118'];
  const readyV118Paths = new Set([
    ...WEAPON_NATIVE_PROFILES_V118, ...Object.values(VEHICLE_NATIVE_POSES_V118), ...ENEMY_IMPORT_ANIMATIONS_V118, ...ENEMY_SOURCE_ADAPTATIONS_V118
  ].filter(asset => ['accepted-static-adaptation', 'accepted-multi-pose-adaptation'].includes(asset.reviewStatus)
    && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && /^\/assets\/openai\/(?:equipment\/v118-(?:weapons|vehicles)|sprites\/(?:animated-import|static-game)-v118)\/[a-z0-9-]+\.png$/.test(asset.path || '')
    && Number.isInteger(asset.sourceWidth) && asset.sourceWidth > 0
    && Number.isInteger(asset.sourceHeight) && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
  const v117Folders = ['assets/openai/equipment/v117-weapons', 'assets/openai/equipment/v117-vehicles'];
  const readyV117Paths = new Set([
    ...WEAPON_NATIVE_PROFILES_V117, ...Object.values(VEHICLE_NATIVE_POSES_V117)
  ].filter(asset => asset.reviewStatus === 'accepted-static-adaptation'
    && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && /^\/assets\/openai\/equipment\/v117-(?:weapons|vehicles)\/[a-z0-9-]+\.png$/.test(asset.path || '')
    && Number.isInteger(asset.sourceWidth) && asset.sourceWidth > 0
    && Number.isInteger(asset.sourceHeight) && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
  const v116AutomatonFolder = 'assets/openai/sprites/static-automaton-v116';
  const readyV116AutomatonPaths = new Set(ENEMY_AUTOMATON_ADAPTATIONS_V116.filter(asset =>
    asset.reviewStatus === 'accepted-static-adaptation'
    && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && /^\/assets\/openai\/sprites\/static-automaton-v116\/[a-z0-9-]+\.png$/.test(asset.path || '')
    && Number.isInteger(asset.sourceWidth) && asset.sourceWidth > 0
    && Number.isInteger(asset.sourceHeight) && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
  const v116WeaponFolder = 'assets/openai/equipment/v116-weapons';
  const readyV116WeaponPaths = new Set(WEAPON_NATIVE_PROFILES_V116.filter(asset =>
    asset.reviewStatus === 'accepted-static-adaptation'
    && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && /^\/assets\/openai\/equipment\/v116-weapons\/[a-z0-9-]+\.png$/.test(asset.path || '')
    && Number.isInteger(asset.sourceWidth) && asset.sourceWidth > 0
    && Number.isInteger(asset.sourceHeight) && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
  const readyV114Paths = new Set(ENEMY_IMPORT_ANIMATIONS_V114.map(asset => asset.path.slice(1)));
  const v113Folders = ['assets/openai/sprites/static-import-v113', 'assets/openai/sprites/static-game-v113',
    'assets/openai/equipment/v113-weapons', 'assets/equipment/v113-vehicles'];
  const readyV113Paths = new Set([
    ...ENEMY_AFE2_ADAPTATIONS_V113, ...ENEMY_USER_RECONSTRUCTIONS_V113,
    ...WEAPON_NATIVE_PROFILES_V113, ...Object.values(VEHICLE_NATIVE_POSES_V113)
  ].filter(asset => asset.reviewStatus === 'accepted-static-adaptation'
    && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && /^\/assets\/(?:openai\/sprites\/static-(?:import|game)-v113|openai\/equipment\/v113-weapons|equipment\/v113-vehicles)\/[a-z0-9-]+\.png$/.test(asset.path || '')
    && Number.isInteger(asset.sourceWidth) && asset.sourceWidth > 0
    && Number.isInteger(asset.sourceHeight) && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
  const readyV112Paths = new Set([
    ...USER_SPECIMEN_RECORDS_V112, ...ENEMY_AFE2_ADAPTATIONS_V112,
    ...ENEMY_AUTOMATON_ADAPTATIONS_V112, ...WEAPON_NATIVE_PROFILES_V112, UD4L_CATALOG_POSE_V112
  ].filter(asset => asset.reviewStatus === 'accepted-static-adaptation'
      && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
      && /^\/assets\/openai\/(?:sprites\/static-(?:import|game)-v112|equipment\/v112-equipment)\/[a-z0-9-]+\.png$/.test(asset.path || '')
      && asset.sourceWidth > 0 && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
  const readyV111Paths = new Set(ENEMY_SYNTH_ADAPTATIONS_V111.filter(asset =>
    asset.reviewStatus === 'accepted-static-adaptation' && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && /^\/assets\/openai\/sprites\/static-game-v111\/[a-z0-9-]+\.png$/.test(asset.path || '')
    && asset.sourceWidth > 0 && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
  const readyV110Paths = new Set(ENEMY_SYNTH_ADAPTATIONS_V110.filter(asset =>
    asset.reviewStatus === 'accepted-static-adaptation' && /^[a-f0-9]{64}$/.test(asset.sha256 || '')
    && /^\/assets\/openai\/sprites\/static-game-v110\/[a-z0-9-]+\.png$/.test(asset.path || '')
    && asset.sourceWidth > 0 && asset.sourceHeight > 0).map(asset => asset.path.slice(1)));
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
    if (v118Folders.some(folder => sourcePath.startsWith(folder + '/'))) return readyV118Paths.has(sourcePath);
    if (/^assets\/openai\/(?:sprites|equipment)\/(?:[^/]+\/)*[^/]*v118(?:[^0-9]|$)/i.test(sourcePath)) return v118Folders.includes(sourcePath);
    if (/^docs\/references\/(?:V118_|v118-)/i.test(sourcePath)) return false;
    if (v117Folders.some(folder => sourcePath.startsWith(folder + '/'))) return readyV117Paths.has(sourcePath);
    if (/^assets\/openai\/(?:sprites|equipment)\/(?:[^/]+\/)*[^/]*v117(?:[^0-9]|$)/i.test(sourcePath)) return v117Folders.includes(sourcePath);
    if (/^docs\/references\/(?:V117_|v117-)/i.test(sourcePath)) return false;
    if (sourcePath.startsWith(v116AutomatonFolder + '/')) return readyV116AutomatonPaths.has(sourcePath);
    if (/^assets\/openai\/sprites\/(?:[^/]+\/)*[^/]*v116(?:[^0-9]|$)/i.test(sourcePath)) return sourcePath === v116AutomatonFolder;
    if (sourcePath.startsWith(v116WeaponFolder + '/')) return readyV116WeaponPaths.has(sourcePath);
    if (/^assets\/openai\/equipment\/(?:[^/]+\/)*[^/]*v116(?:[^0-9]|$)/i.test(sourcePath)) return sourcePath === v116WeaponFolder;
    if (sourcePath.startsWith('assets/openai/sprites/animated-import-v114/')) return readyV114Paths.has(sourcePath);
    if (/^assets\/openai\/sprites\/(?:[^/]+\/)*[^/]*v114(?:[^0-9]|$)/i.test(sourcePath)) return sourcePath === 'assets/openai/sprites/animated-import-v114';
    if (v113Folders.some(folder => sourcePath.startsWith(folder + '/'))) return readyV113Paths.has(sourcePath);
    if (/^assets\/(?:openai\/)?(?:sprites|equipment)\/(?:[^/]+\/)*[^/]*v113(?:[^0-9]|$)/i.test(sourcePath)) return v113Folders.includes(sourcePath);
    if (/^docs\/references\/(?:V113_|v113-)/i.test(sourcePath)) return false;
    if (/^assets\/openai\/sprites\/static-(?:import|game)-v112\//.test(sourcePath)
      || sourcePath.startsWith('assets/openai/equipment/v112-equipment/')) return readyV112Paths.has(sourcePath);
    if (/^assets\/openai\/(?:sprites|equipment)\/(?:[^/]+\/)*[^/]*v112(?:[^0-9]|$)/i.test(sourcePath)) {
      return ['assets/openai/sprites/static-import-v112', 'assets/openai/sprites/static-game-v112', 'assets/openai/equipment/v112-equipment'].includes(sourcePath);
    }
    if (sourcePath.startsWith('assets/openai/sprites/static-game-v111/')) return readyV111Paths.has(sourcePath);
    if (/^assets\/openai\/sprites\/(?:[^/]+\/)*[^/]*v111(?:[^0-9]|$)/i.test(sourcePath)) return sourcePath === 'assets/openai/sprites/static-game-v111';
    if (sourcePath.startsWith('assets/openai/sprites/static-game-v110/')) return readyV110Paths.has(sourcePath);
    if (/^assets\/openai\/sprites\/(?:[^/]+\/)*[^/]*v110(?:[^0-9]|$)/i.test(sourcePath)) return sourcePath === 'assets/openai/sprites/static-game-v110';
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
