import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { lstat, readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ALIENS1986_MODULE_ROOT = 'modules/aliens-1986';
export const ALIENS1986_RECOVERY_ROOT = `${ALIENS1986_MODULE_ROOT}/v114`;
export const ALIENS1986_RECOVERY_MANIFEST = `${ALIENS1986_MODULE_ROOT}/RECOVERY_MANIFEST.json`;
// The immutable, recovered V114 package is reviewed independently of its inventory.
export const ALIENS1986_RECOVERY_MANIFEST_SHA256 = '5bfb37cc785657a11e62fe1ca0b92093e2b8b5bd0935fb0bf2cedd0f87da0acd';
export const ALIENS1986_ARCHIVE_SHA256 = 'c6dfb2baa886d7b1651463f9685a666f37185aaa0d5cec7d42ccae928762d1e2';
export const ALIENS1986_GAME_SHA256 = '9f1b902e7546dff18867d9b0d1cb638bc9d256863654be5e2e74bc5cb301548d';
export const ALIENS1986_GAME_BYTES = 780305;
export const ALIENS1986_RUNTIME_ROOT = 'dlc/aliens-1986';
export const ALIENS1986_RUNTIME_FILES = Object.freeze([
  ALIENS1986_RUNTIME_ROOT + '/index.html', ALIENS1986_RUNTIME_ROOT + '/game.html',
]);
export const ALIENS1986_SOURCE_ONLY_FILES = Object.freeze([
  ALIENS1986_MODULE_ROOT + '/README.md', ALIENS1986_RECOVERY_MANIFEST,
  'scripts/public-aliens1986-dlc-admissions.mjs',
  'scripts/build-aliens1986-dlc.mjs',
  'scripts/verify-aliens1986-dlc-integration.mjs',
  'scripts/qa-aliens1986-integration.py',
  '.github/workflows/aliens1986-dlc.yml',
  'docs/development/ALIENS_1986_GITHUB_INTEGRATION_20261125.md',
  'docs/development/ALIENS_1986_GITHUB_INTEGRATION_20261125.json',
]);
export const ALIENS1986_SPRITE_REVIEW_ROOT_V115 = 'docs/development/aliens-1986-sprites-v115';
export const ALIENS1986_SPRITE_SOURCE_ONLY_FILES_V115 = Object.freeze([
  'docs/development/ALIENS_1986_SPRITE_INVENTORY_V115.json',
  'docs/development/ALIENS_1986_SPRITE_INVENTORY_V115.md',
  'docs/development/ALIENS_1986_RASTER_INTEGRATION_REVIEW_V115.md',
  ALIENS1986_SPRITE_REVIEW_ROOT_V115 + '/index.html',
  ALIENS1986_SPRITE_REVIEW_ROOT_V115 + '/manifest.json',
  ALIENS1986_SPRITE_REVIEW_ROOT_V115 + '/README.md',
  'scripts/verify-aliens1986-sprite-pack-admission-v115.mjs',
]);
export const ALIENS1986_RASTER_SOURCE_ONLY_FILES_V116 = Object.freeze([
  'modules/aliens-1986/v116/sprite-loader-v116.mjs',
  'modules/aliens-1986/v116/raster-renderer-v116.mjs',
  'scripts/derive-aliens1986-raster-v116.mjs',
  'scripts/verify-aliens1986-main-succession-v116.mjs',
  'scripts/verify-aliens1986-raster-presentation-v116.mjs',
  'docs/development/aliens-1986-sprites-v116/manifest.json',
  'docs/development/aliens-1986-sprites-v116/index.html',
  'docs/development/aliens-1986-sprites-v116/README.md',
  'docs/development/aliens-1986-sprites-v116/references.md',
  'docs/development/aliens-1986-sprites-v116/generation-ledger.json',
]);
// Reviewed presentation inputs cannot silently re-authorize a changed derivative.
export const ALIENS1986_RASTER_SOURCE_SHA256_V116 = Object.freeze({
  'modules/aliens-1986/v116/sprite-loader-v116.mjs': '8dd7974d0222294b0e013e06efdc74d76259927ae9890648b57b6fa4385cc7c5',
  'modules/aliens-1986/v116/raster-renderer-v116.mjs': '77d7315bbc4adb6ddb01c4493fc45daaed8beb73ba68efc3d1f88373a7d28170',
  'scripts/derive-aliens1986-raster-v116.mjs': '2dbd40d44678f028c865ea03bc99bfc020adce38b5f8465294949f745ad76434',
  'docs/development/aliens-1986-sprites-v116/manifest.json': 'b9213752445a01e293f44bccface374d3d3882e8ae071baefaa75bf04d589af6',
});
// V117 appends seven prop images without rewriting the four V116 receipts.
// Only the derivation tool continues; loader, renderer and base manifest do not.
export const ALIENS1986_RASTER_BASELINE_V117 = '5f38b7bad2c6401424b23fda11aeb86068f0f354';
export const ALIENS1986_RASTER_SOURCE_SUCCESSORS_V117 = Object.freeze({
  'scripts/derive-aliens1986-raster-v116.mjs': Object.freeze({
    previousSha256: '2dbd40d44678f028c865ea03bc99bfc020adce38b5f8465294949f745ad76434',
    currentSha256: '3b053e26bc98a62b9332554b31e28a7f40172e7e0337e94c45c9eab5551a328a',
  }),
});
export const ALIENS1986_RASTER_SOURCE_ONLY_FILES_V117 = Object.freeze([
  'scripts/qa-aliens1986-props-v117.py',
  'docs/development/aliens-1986-sprites-v117/manifest.json',
  'docs/development/aliens-1986-sprites-v117/index.html',
  'docs/development/aliens-1986-sprites-v117/README.md',
  'docs/development/aliens-1986-sprites-v117/references.md',
  'docs/development/aliens-1986-sprites-v117/generation-ledger.json',
]);
export const ALIENS1986_RASTER_SOURCE_SHA256_V117 = Object.freeze({
  // The reviewed supplement is pinned independently of the V116 base manifest.
  'docs/development/aliens-1986-sprites-v117/manifest.json': '09df948f5ee55c2b9b2494924475b7113468edddfa4d803caaf1323ee4804a62',
});
// Keep this supplement closed without loading its manifest in sparse checkouts.
export const ALIENS1986_RASTER_ASSET_ROOT_V117 = 'assets/dlc/aliens-1986/v117';
export const ALIENS1986_RASTER_ASSET_FILES_V117 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/architecture/door-leaf-damaged.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/architecture/door-leaf-reinforced.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/architecture/door-leaf-breached.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/props/meal-tray-food.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/props/supply-case-medical-empty.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/props/supply-case-ammo-closed.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/props/supply-case-ammo-empty.png',
]);
export const ALIENS1986_RASTER_ASSET_DIRECTORIES_V117 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V117,
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/architecture',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/props',
]);
// V118 continues the reviewed V117 derivation and adds a separate presentation
// module. Both old manifests and the original V116 loader/renderer stay pinned.
export const ALIENS1986_RASTER_BASELINE_V118 = '07ee99d56480780044c74d4f1eb11f31b07fef13';
export const ALIENS1986_RASTER_SOURCE_SUCCESSORS_V118 = Object.freeze({
  'scripts/derive-aliens1986-raster-v116.mjs': Object.freeze({
    previousSha256: '3b053e26bc98a62b9332554b31e28a7f40172e7e0337e94c45c9eab5551a328a',
    currentSha256: 'd3eb1ff332474cb961e11bc9b97f37b4be25caba137a0afb7f06f62dd47b7433',
  }),
});
export const ALIENS1986_RASTER_SOURCE_ONLY_FILES_V118 = Object.freeze([
  'modules/aliens-1986/v118/raster-props-v118.mjs',
  'scripts/verify-aliens1986-raster-props-v118.mjs',
  'scripts/qa-aliens1986-props-v118.py',
  'docs/development/aliens-1986-sprites-v118/manifest.json',
  'docs/development/aliens-1986-sprites-v118/index.html',
  'docs/development/aliens-1986-sprites-v118/README.md',
  'docs/development/aliens-1986-sprites-v118/references.md',
  'docs/development/aliens-1986-sprites-v118/generation-ledger.json',
]);
export const ALIENS1986_RASTER_SOURCE_SHA256_V118 = Object.freeze({
  'modules/aliens-1986/v118/raster-props-v118.mjs': 'dd17932bedfe1f457440f11d9f4e1fd9b87da19660177c2c210d1d85b3c3b31c',
  'docs/development/aliens-1986-sprites-v118/manifest.json': 'ba671cbbd67b8d16fe7b1173fb0f61240e05d0379431589b35a7a81dec963d9e',
});
export const ALIENS1986_RASTER_ASSET_ROOT_V118 = 'assets/dlc/aliens-1986/v118';
export const ALIENS1986_RASTER_ASSET_FILES_V118 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/props/engineering-case-stocked.png',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/props/gateway-inquiry-display.png',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/props/service-control-pedestal.png',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/props/medical-counter-terminal.png',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/props/optics-calibration-terminal.png',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/props/valve-indicator-panel.png',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/props/sulaco-briefing-terminal.png',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/props/operations-table-terminal.png',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/equipment/sentry-aim-front-right.png',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/equipment/sentry-aim-rear-right.png',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/equipment/sentry-aim-rear.png',
]);
export const ALIENS1986_RASTER_ASSET_DIRECTORIES_V118 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V118,
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/props',
  ALIENS1986_RASTER_ASSET_ROOT_V118 + '/equipment',
]);
// V119 continues only the derivation tool; V114 and all earlier raster sources remain pinned.
export const ALIENS1986_RASTER_BASELINE_V119 = '5ec98a99ea1bfea30159f11ab1a698b0106ae9de';
export const ALIENS1986_RASTER_SOURCE_SUCCESSORS_V119 = Object.freeze({
  'scripts/derive-aliens1986-raster-v116.mjs': Object.freeze({
    previousSha256: 'd3eb1ff332474cb961e11bc9b97f37b4be25caba137a0afb7f06f62dd47b7433',
    currentSha256: '63175b7a507aa2409606da368b0f75935d107a06fe97c7f28f5d62b69463dddd',
  }),
});
export const ALIENS1986_RASTER_SOURCE_ONLY_FILES_V119 = Object.freeze([
  'modules/aliens-1986/v119/raster-furniture-v119.mjs',
  'scripts/verify-aliens1986-raster-furniture-v119.mjs',
  'scripts/qa-aliens1986-furniture-v119.py',
  'docs/development/aliens-1986-sprites-v119/manifest.json',
  'docs/development/aliens-1986-sprites-v119/index.html',
  'docs/development/aliens-1986-sprites-v119/README.md',
  'docs/development/aliens-1986-sprites-v119/references.md',
  'docs/development/aliens-1986-sprites-v119/generation-ledger.json',
  'docs/development/aliens-1986-sprites-v119/bible.md',
  'docs/development/aliens-1986-sprites-v119/bible.json',
  'docs/development/aliens-1986-sprites-v119/verification.json',
  'docs/development/aliens-1986-sprites-v119/qa-canvas-v106-medlab.png',
  'docs/development/aliens-1986-sprites-v119/qa-canvas-v106-medlab.json',
  'docs/development/aliens-1986-sprites-v119/qa-canvas-v109-reserve.png',
  'docs/development/aliens-1986-sprites-v119/qa-canvas-v109-reserve.json',
  'docs/development/aliens-1986-sprites-v119/qa-canvas-v107-operations.png',
  'docs/development/aliens-1986-sprites-v119/qa-canvas-v107-operations.json',
  'docs/development/aliens-1986-sprites-v119/qa-canvas-v114-sulaco-mess.png',
  'docs/development/aliens-1986-sprites-v119/qa-canvas-v114-sulaco-mess.json',
]);
export const ALIENS1986_RASTER_SOURCE_SHA256_V119 = Object.freeze({
  'modules/aliens-1986/v119/raster-furniture-v119.mjs': 'c6adb36868509894beb75e1f350b884f573543e3c55e840db6015322d4c01176',
  'docs/development/aliens-1986-sprites-v119/manifest.json': 'ea0eac131e69262aafb1a08398013b941d0cb028c831892752dd6a9ca3c19fb0',
});
export const ALIENS1986_RASTER_ASSET_ROOT_V119 = 'assets/dlc/aliens-1986/v119';
export const ALIENS1986_RASTER_ASSET_FILES_V119 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V119 + '/furniture/medlab-bed.png',
  ALIENS1986_RASTER_ASSET_ROOT_V119 + '/furniture/medlab-storage-cabinet.png',
  ALIENS1986_RASTER_ASSET_ROOT_V119 + '/furniture/reserve-service-locker.png',
  ALIENS1986_RASTER_ASSET_ROOT_V119 + '/furniture/operations-storage-rack.png',
  ALIENS1986_RASTER_ASSET_ROOT_V119 + '/furniture/sulaco-mess-table.png',
  ALIENS1986_RASTER_ASSET_ROOT_V119 + '/furniture/operations-command-table.png',
]);
export const ALIENS1986_RASTER_ASSET_DIRECTORIES_V119 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V119,
  ALIENS1986_RASTER_ASSET_ROOT_V119 + '/furniture',
]);
// V120 preserves the V119 module and records, then adds four images and six
// reviewed scene placements. Shared images do not create extra asset records.
export const ALIENS1986_RASTER_BASELINE_V120 = '168b6b489af1469bde620c108c8abed06d469f88';
export const ALIENS1986_RASTER_SOURCE_SUCCESSORS_V120 = Object.freeze({
  'scripts/derive-aliens1986-raster-v116.mjs': Object.freeze({
    previousSha256: '63175b7a507aa2409606da368b0f75935d107a06fe97c7f28f5d62b69463dddd',
    currentSha256: 'f89c27738cdf6dca374bb2f1b4aee9734199324c6c7f1e0242eda49d5b2af189',
  }),
});
export const ALIENS1986_RASTER_SOURCE_ONLY_FILES_V120 = Object.freeze([
  'modules/aliens-1986/v120/raster-furniture-v120.mjs',
  'scripts/verify-aliens1986-raster-furniture-v120.mjs',
  'scripts/qa-aliens1986-furniture-v120.py',
  'docs/development/aliens-1986-sprites-v120/manifest.json',
  'docs/development/aliens-1986-sprites-v120/index.html',
  'docs/development/aliens-1986-sprites-v120/README.md',
  'docs/development/aliens-1986-sprites-v120/references.md',
  'docs/development/aliens-1986-sprites-v120/generation-ledger.json',
  'docs/development/aliens-1986-sprites-v120/bible.md',
  'docs/development/aliens-1986-sprites-v120/bible.json',
  'docs/development/aliens-1986-sprites-v120/verification.json',
  'docs/development/aliens-1986-sprites-v120/qa-canvas-v106-hadley.png',
  'docs/development/aliens-1986-sprites-v120/qa-canvas-v106-hadley.json',
  'docs/development/aliens-1986-sprites-v120/qa-canvas-v107-operations.png',
  'docs/development/aliens-1986-sprites-v120/qa-canvas-v107-operations.json',
  'docs/development/aliens-1986-sprites-v120/qa-canvas-v109-reserve.png',
  'docs/development/aliens-1986-sprites-v120/qa-canvas-v109-reserve.json',
  'docs/development/aliens-1986-sprites-v120/qa-canvas-v112-workshop.png',
  'docs/development/aliens-1986-sprites-v120/qa-canvas-v112-workshop.json',
]);
export const ALIENS1986_RASTER_SOURCE_SHA256_V120 = Object.freeze({
  'modules/aliens-1986/v120/raster-furniture-v120.mjs': 'c725d9f7e40ab4f1f86609d69ccacfd94a9b8e28d5e704db5f721668846aec4b',
  'docs/development/aliens-1986-sprites-v120/manifest.json': 'a9e47d98744b2ffe18199ef0e00bc9879379d66b442736d46031c6761ae89437',
});
export const ALIENS1986_RASTER_ASSET_ROOT_V120 = 'assets/dlc/aliens-1986/v120';
export const ALIENS1986_RASTER_ASSET_FILES_V120 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V120 + '/furniture/reserve-medical-counter.png',
  ALIENS1986_RASTER_ASSET_ROOT_V120 + '/furniture/utility-storage-cabinet.png',
  ALIENS1986_RASTER_ASSET_ROOT_V120 + '/furniture/optics-workbench.png',
  ALIENS1986_RASTER_ASSET_ROOT_V120 + '/furniture/operations-display-bank.png',
]);
export const ALIENS1986_RASTER_ASSET_DIRECTORIES_V120 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V120,
  ALIENS1986_RASTER_ASSET_ROOT_V120 + '/furniture',
]);
// V121 preserves every earlier image and module, then adds four industrial
// images for five native bodies. The two exchangers share one image record.
export const ALIENS1986_RASTER_BASELINE_V121 = '8454b22ad739a1fc2e97d0bae4ffb23cd48162d4';
export const ALIENS1986_RASTER_SOURCE_SUCCESSORS_V121 = Object.freeze({
  'scripts/derive-aliens1986-raster-v116.mjs': Object.freeze({
    previousSha256: 'f89c27738cdf6dca374bb2f1b4aee9734199324c6c7f1e0242eda49d5b2af189',
    currentSha256: 'b194d54badfd1c30989397f1c6819ae609efab705c98925c9a4127ebb8ab79aa',
  }),
});
export const ALIENS1986_RASTER_SOURCE_ONLY_FILES_V121 = Object.freeze([
  'modules/aliens-1986/v121/raster-furniture-v121.mjs',
  'scripts/verify-aliens1986-raster-furniture-v121.mjs',
  'scripts/qa-aliens1986-furniture-v121.py',
  'docs/development/aliens-1986-sprites-v121/manifest.json',
  'docs/development/aliens-1986-sprites-v121/index.html',
  'docs/development/aliens-1986-sprites-v121/README.md',
  'docs/development/aliens-1986-sprites-v121/references.md',
  'docs/development/aliens-1986-sprites-v121/generation-ledger.json',
  'docs/development/aliens-1986-sprites-v121/bible.md',
  'docs/development/aliens-1986-sprites-v121/bible.json',
  'docs/development/aliens-1986-sprites-v121/verification.json',
  'docs/development/aliens-1986-sprites-v121/qa-canvas-v106-hadley.png',
  'docs/development/aliens-1986-sprites-v121/qa-canvas-v106-hadley.json',
  'docs/development/aliens-1986-sprites-v121/qa-canvas-v107-service.png',
  'docs/development/aliens-1986-sprites-v121/qa-canvas-v107-service.json',
  'docs/development/aliens-1986-sprites-v121/qa-canvas-v112-conduit.png',
  'docs/development/aliens-1986-sprites-v121/qa-canvas-v112-conduit.json',
]);
export const ALIENS1986_RASTER_SOURCE_SHA256_V121 = Object.freeze({
  'modules/aliens-1986/v121/raster-furniture-v121.mjs': '5cb18fda7b4ea68c5715681c8931388e0fd464e4a61af38ae9a3761cc10883a1',
  'docs/development/aliens-1986-sprites-v121/manifest.json': '80424f4dd7a15fc56759c428d88917e7c2a5b713260c41244184fe6f62906f90',
});
export const ALIENS1986_RASTER_ASSET_ROOT_V121 = 'assets/dlc/aliens-1986/v121';
export const ALIENS1986_RASTER_ASSET_FILES_V121 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V121 + '/furniture/hadley-service-generator.png',
  ALIENS1986_RASTER_ASSET_ROOT_V121 + '/furniture/service-pump-unit.png',
  ALIENS1986_RASTER_ASSET_ROOT_V121 + '/furniture/conduit-heat-exchanger.png',
  ALIENS1986_RASTER_ASSET_ROOT_V121 + '/furniture/conduit-valve-plinth.png',
]);
export const ALIENS1986_RASTER_ASSET_DIRECTORIES_V121 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V121,
  ALIENS1986_RASTER_ASSET_ROOT_V121 + '/furniture',
]);
// V122 adds reference illustrations to existing fidelity atlas cards only.
export const ALIENS1986_RASTER_BASELINE_V122 = 'fe6ad985cfc5ed7ac30b71121d11d505a6cfe03f';
export const ALIENS1986_RASTER_SOURCE_SUCCESSORS_V122 = Object.freeze({
  'scripts/derive-aliens1986-raster-v116.mjs': Object.freeze({
    previousSha256: 'b194d54badfd1c30989397f1c6819ae609efab705c98925c9a4127ebb8ab79aa',
    currentSha256: '6e356ed943bb6cf2b41ac31c5c7b77f306c46fb61430d36c9d5c9ff266fc5761',
  }),
});
export const ALIENS1986_RASTER_SOURCE_ONLY_FILES_V122 = Object.freeze([
  'modules/aliens-1986/v122/raster-atlas-v122.mjs',
  'scripts/verify-aliens1986-raster-atlas-v122.mjs',
  'scripts/qa-aliens1986-atlas-v122.py',
  'docs/development/aliens-1986-sprites-v122/manifest.json',
  'docs/development/aliens-1986-sprites-v122/index.html',
  'docs/development/aliens-1986-sprites-v122/README.md',
  'docs/development/aliens-1986-sprites-v122/references.md',
  'docs/development/aliens-1986-sprites-v122/generation-ledger.json',
  'docs/development/aliens-1986-sprites-v122/bible.md',
  'docs/development/aliens-1986-sprites-v122/bible.json',
  'docs/development/aliens-1986-sprites-v122/verification.json',
]);
export const ALIENS1986_RASTER_SOURCE_SHA256_V122 = Object.freeze({
  'modules/aliens-1986/v122/raster-atlas-v122.mjs': '7c1481bc5796def4db24f75cf822b0036a4f0ecaabf51826fb73ac2e5d08e8d5',
  'docs/development/aliens-1986-sprites-v122/manifest.json': '6579c0f0bd346cb2849e7261b5edce061c495636e7119dd82352cbcfcf5ff780',
});
export const ALIENS1986_RASTER_ASSET_ROOT_V122 = 'assets/dlc/aliens-1986/v122';
export const ALIENS1986_RASTER_ASSET_FILES_V122 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/exteriors/uss-sulaco.png',
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/exteriors/jorden-survey-tractor.png',
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/exteriors/narcissus-shuttle.png',
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/environments/sulaco-deck-tile.png',
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/environments/atmosphere-processor-facade.png',
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/environments/hadley-colony-building.png',
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/environments/gateway-orbital-backdrop.png',
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/environments/hadley-uplink-tower.png',
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/environments/hadley-colony-wall-panel.png',
]);
export const ALIENS1986_RASTER_ASSET_DIRECTORIES_V122 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V122,
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/exteriors',
  ALIENS1986_RASTER_ASSET_ROOT_V122 + '/environments',
]);

// V123 admits two static poses through the unchanged V116/V118 selectors.
export const ALIENS1986_RASTER_BASELINE_V123 = '870a95c9f319f3caaa5f76498cbfb2e0f7be5dbf';
export const ALIENS1986_RASTER_SOURCE_SUCCESSORS_V123 = Object.freeze({
  'scripts/derive-aliens1986-raster-v116.mjs': Object.freeze({
    previousSha256: '6e356ed943bb6cf2b41ac31c5c7b77f306c46fb61430d36c9d5c9ff266fc5761',
    currentSha256: '487a1d3cf38d2128b15be96e6362e53496f62f7010e79906d51caa5536743eb3',
  }),
});
export const ALIENS1986_RASTER_SOURCE_ONLY_FILES_V123 = Object.freeze([
  'scripts/verify-aliens1986-raster-directions-v123.mjs',
  'scripts/qa-aliens1986-directions-v123.py',
  'docs/development/aliens-1986-sprites-v123/manifest.json',
  'docs/development/aliens-1986-sprites-v123/index.html',
  'docs/development/aliens-1986-sprites-v123/README.md',
  'docs/development/aliens-1986-sprites-v123/references.md',
  'docs/development/aliens-1986-sprites-v123/generation-ledger.json',
  'docs/development/aliens-1986-sprites-v123/bible.md',
  'docs/development/aliens-1986-sprites-v123/bible.json',
  'docs/development/aliens-1986-sprites-v123/verification.json',
]);
export const ALIENS1986_RASTER_SOURCE_SHA256_V123 = Object.freeze({
  'docs/development/aliens-1986-sprites-v123/manifest.json': '6c7da69916b672d109fd324f35740452df51efb29256cee76cf1fcbaa97e737e',
});
export const ALIENS1986_RASTER_ASSET_ROOT_V123 = 'assets/dlc/aliens-1986/v123';
export const ALIENS1986_RASTER_ASSET_FILES_V123 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V123 + '/equipment/sentry-aim-front.png',
  ALIENS1986_RASTER_ASSET_ROOT_V123 + '/creatures/warrior-walk-right.png',
]);
export const ALIENS1986_RASTER_ASSET_DIRECTORIES_V123 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V123,
  ALIENS1986_RASTER_ASSET_ROOT_V123 + '/equipment',
  ALIENS1986_RASTER_ASSET_ROOT_V123 + '/creatures',
]);

const checkoutRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const validPath = path => typeof path === 'string' && path.length > 0
  && !/[\\\x00-\x1f]/.test(path) && !path.startsWith('/')
  && path.split('/').every(part => part && part !== '.' && part !== '..');

/** A changed manifest cannot grant itself new source files or new byte hashes. */
export function compileAliens1986RecoveryManifest(bytes, expectedSha256 = ALIENS1986_RECOVERY_MANIFEST_SHA256) {
  assert.match(expectedSha256, /^[a-f0-9]{64}$/, 'Invalid reviewed Aliens 1986 inventory digest.');
  assert.equal(digest(bytes), expectedSha256, 'Unreviewed Aliens 1986 recovery manifest bytes.');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schema, 1, 'Unsupported Aliens 1986 recovery schema.');
  assert.equal(manifest.module, 'aliens-1986', 'Unexpected recovered module.');
  assert.equal(manifest.version, '114.0.0-rc.1', 'Unexpected recovered version.');
  assert.equal(manifest.sourceArchive?.sha256, ALIENS1986_ARCHIVE_SHA256, 'Unexpected recovered archive digest.');
  assert.ok(Array.isArray(manifest.files), 'Recovery files must be an array.');
  const files = new Map(), directories = new Set(['modules', ALIENS1986_MODULE_ROOT, ALIENS1986_RECOVERY_ROOT]);
  let totalBytes = 0;
  for (const entry of manifest.files) {
    assert.ok(entry && validPath(entry.path), 'Unsafe Aliens 1986 recovery member path.');
    const path = ALIENS1986_RECOVERY_ROOT + '/' + entry.path;
    assert.equal(files.has(path), false, 'Duplicate Aliens 1986 recovery member: ' + path);
    assert.ok(Number.isSafeInteger(entry.bytes) && entry.bytes >= 0, 'Invalid recovery member size: ' + path);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/, 'Invalid recovery member digest: ' + path);
    files.set(path, Object.freeze({ path, bytes: entry.bytes, sha256: entry.sha256 }));
    totalBytes += entry.bytes;
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) directories.add(parts.slice(0, i).join('/'));
  }
  assert.equal(manifest.fileCount, files.size, 'Recovery file count differs from the inventory.');
  assert.equal(manifest.uncompressedBytes, totalBytes, 'Recovery byte count differs from the inventory.');
  for (const path of files.keys()) assert.equal(directories.has(path), false, 'Recovery file/directory collision: ' + path);
  return Object.freeze({ manifest, files, directories, expectedSha256 });
}

let reviewed;
export function reviewedAliens1986Recovery() {
  if (!reviewed) reviewed = compileAliens1986RecoveryManifest(
    readFileSync(new URL('../' + ALIENS1986_RECOVERY_MANIFEST, import.meta.url)));
  return reviewed;
}

/** Exact original source bytes can retain historical paths in their QA receipts.
 * They never enter the playable build; every such exemption is hash checked. */
export function aliens1986RecoveryFile(path) {
  if (!validPath(path) || !path.startsWith(ALIENS1986_RECOVERY_ROOT + '/')) return null;
  return reviewedAliens1986Recovery().files.get(path) || null;
}

/** null delegates unrelated modules to the established release policy. */
export function publicAliens1986DlcPathAdmission(path, { directory = false, built = false } = {}) {
  if (!validPath(path)) return false;
  if (path === ALIENS1986_RASTER_ASSET_ROOT_V123 || path.startsWith(ALIENS1986_RASTER_ASSET_ROOT_V123 + '/')) {
    return directory ? ALIENS1986_RASTER_ASSET_DIRECTORIES_V123.includes(path) : ALIENS1986_RASTER_ASSET_FILES_V123.includes(path);
  }
  if (ALIENS1986_RASTER_SOURCE_ONLY_FILES_V123.includes(path)) return !built && !directory;
  if (path === 'docs/development/aliens-1986-sprites-v123') return !built && directory;
  if (path.startsWith('docs/development/aliens-1986-sprites-v123/')) return false;
  if (path === ALIENS1986_RASTER_ASSET_ROOT_V122 || path.startsWith(ALIENS1986_RASTER_ASSET_ROOT_V122 + '/')) {
    return directory ? ALIENS1986_RASTER_ASSET_DIRECTORIES_V122.includes(path) : ALIENS1986_RASTER_ASSET_FILES_V122.includes(path);
  }
  if (ALIENS1986_RASTER_SOURCE_ONLY_FILES_V122.includes(path)) return !built && !directory;
  if (['modules/aliens-1986/v122', 'docs/development/aliens-1986-sprites-v122'].includes(path)) return !built && directory;
  if (path.startsWith('modules/aliens-1986/v122/') || path.startsWith('docs/development/aliens-1986-sprites-v122/')) return false;
  if (path === ALIENS1986_RASTER_ASSET_ROOT_V121 || path.startsWith(ALIENS1986_RASTER_ASSET_ROOT_V121 + '/')) {
    return directory ? ALIENS1986_RASTER_ASSET_DIRECTORIES_V121.includes(path) : ALIENS1986_RASTER_ASSET_FILES_V121.includes(path);
  }
  if (ALIENS1986_RASTER_SOURCE_ONLY_FILES_V121.includes(path)) return !built && !directory;
  if (['modules/aliens-1986/v121', 'docs/development/aliens-1986-sprites-v121'].includes(path)) return !built && directory;
  if (path.startsWith('modules/aliens-1986/v121/') || path.startsWith('docs/development/aliens-1986-sprites-v121/')) return false;
  if (path === ALIENS1986_RASTER_ASSET_ROOT_V120 || path.startsWith(ALIENS1986_RASTER_ASSET_ROOT_V120 + '/')) {
    return directory ? ALIENS1986_RASTER_ASSET_DIRECTORIES_V120.includes(path) : ALIENS1986_RASTER_ASSET_FILES_V120.includes(path);
  }
  if (ALIENS1986_RASTER_SOURCE_ONLY_FILES_V120.includes(path)) return !built && !directory;
  if (['modules/aliens-1986/v120', 'docs/development/aliens-1986-sprites-v120'].includes(path)) return !built && directory;
  if (path.startsWith('modules/aliens-1986/v120/') || path.startsWith('docs/development/aliens-1986-sprites-v120/')) return false;
  if (path === ALIENS1986_RASTER_ASSET_ROOT_V119 || path.startsWith(ALIENS1986_RASTER_ASSET_ROOT_V119 + '/')) {
    return directory ? ALIENS1986_RASTER_ASSET_DIRECTORIES_V119.includes(path) : ALIENS1986_RASTER_ASSET_FILES_V119.includes(path);
  }
  if (ALIENS1986_RASTER_SOURCE_ONLY_FILES_V119.includes(path)) return !built && !directory;
  if (['modules/aliens-1986/v119', 'docs/development/aliens-1986-sprites-v119'].includes(path)) return !built && directory;
  if (path.startsWith('modules/aliens-1986/v119/') || path.startsWith('docs/development/aliens-1986-sprites-v119/')) return false;
  if (path === ALIENS1986_RASTER_ASSET_ROOT_V118 || path.startsWith(ALIENS1986_RASTER_ASSET_ROOT_V118 + '/')) {
    return directory ? ALIENS1986_RASTER_ASSET_DIRECTORIES_V118.includes(path) : ALIENS1986_RASTER_ASSET_FILES_V118.includes(path);
  }
  if (ALIENS1986_RASTER_SOURCE_ONLY_FILES_V118.includes(path)) return !built && !directory;
  if (['modules/aliens-1986/v118', 'docs/development/aliens-1986-sprites-v118'].includes(path)) return !built && directory;
  if (path.startsWith('modules/aliens-1986/v118/') || path.startsWith('docs/development/aliens-1986-sprites-v118/')) return false;
  if (path === ALIENS1986_RASTER_ASSET_ROOT_V117 || path.startsWith(ALIENS1986_RASTER_ASSET_ROOT_V117 + '/')) {
    return directory ? ALIENS1986_RASTER_ASSET_DIRECTORIES_V117.includes(path) : ALIENS1986_RASTER_ASSET_FILES_V117.includes(path);
  }
  if (ALIENS1986_RASTER_SOURCE_ONLY_FILES_V117.includes(path)) return !built && !directory;
  if (path === 'docs/development/aliens-1986-sprites-v117') return !built && directory;
  if (path.startsWith('docs/development/aliens-1986-sprites-v117/')) return false;
  if (ALIENS1986_RASTER_SOURCE_ONLY_FILES_V116.includes(path)) return !built && !directory;
  if (['modules/aliens-1986/v116', 'docs/development/aliens-1986-sprites-v116'].includes(path)) return !built && directory;
  if (path.startsWith('modules/aliens-1986/v116/') || path.startsWith('docs/development/aliens-1986-sprites-v116/')) return false;
  if (ALIENS1986_SPRITE_SOURCE_ONLY_FILES_V115.includes(path)) return !built && !directory;
  if (['docs', 'docs/development', ALIENS1986_SPRITE_REVIEW_ROOT_V115].includes(path)) return !built && directory;
  if (path.startsWith(ALIENS1986_SPRITE_REVIEW_ROOT_V115 + '/')) return false;
  if (ALIENS1986_SOURCE_ONLY_FILES.includes(path)) return !built && !directory;
  if (path === 'dlc' || path === ALIENS1986_RUNTIME_ROOT) return directory;
  if (path.startsWith(ALIENS1986_RUNTIME_ROOT + '/')) return !directory && ALIENS1986_RUNTIME_FILES.includes(path);
  if (path === 'modules') return directory && !built;
  if (path !== ALIENS1986_MODULE_ROOT && !path.startsWith(ALIENS1986_MODULE_ROOT + '/')) return null;
  if (built) return false;
  const inventory = reviewedAliens1986Recovery();
  return directory ? inventory.directories.has(path) : inventory.files.has(path);
}

async function assertDirectory(path) {
  const entry = await lstat(path);
  assert.ok(entry.isDirectory() && !entry.isSymbolicLink(), 'Invalid Aliens 1986 directory: ' + path);
}
async function absent(path) {
  try { await lstat(path); return false; }
  catch (error) { if (error?.code === 'ENOENT') return true; throw error; }
}

async function checkedFile(root, relative) {
  assert.ok(validPath(relative), 'Unsafe Aliens 1986 presentation path: ' + relative);
  const parts = relative.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const path = join(root, ...parts.slice(0, i));
    const entry = await lstat(path);
    assert.equal(entry.isSymbolicLink(), false, 'Aliens 1986 presentation symlink: ' + relative);
    assert.ok(i === parts.length ? entry.isFile() : entry.isDirectory(), 'Invalid Aliens 1986 presentation path: ' + relative);
  }
  return readFile(join(root, relative));
}

export function reviewedAliens1986RasterDigestV117(path, endpoint) {
  const receipt = ALIENS1986_RASTER_SOURCE_SUCCESSORS_V117[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken Aliens 1986 presentation predecessor: ' + path);
  assert.match(receipt.currentSha256, /^[a-f0-9]{64}$/, 'Unreviewed Aliens 1986 presentation successor: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Aliens 1986 presentation successor must change bytes: ' + path);
  return receipt.currentSha256;
}

export function reviewedAliens1986RasterDigestV118(path, endpoint) {
  const receipt = ALIENS1986_RASTER_SOURCE_SUCCESSORS_V118[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken Aliens 1986 V118 presentation predecessor: ' + path);
  assert.match(receipt.currentSha256, /^[a-f0-9]{64}$/, 'Unreviewed Aliens 1986 V118 presentation successor: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Aliens 1986 V118 presentation successor must change bytes: ' + path);
  return receipt.currentSha256;
}
export function reviewedAliens1986RasterDigestV119(path, endpoint) {
  const receipt = ALIENS1986_RASTER_SOURCE_SUCCESSORS_V119[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken Aliens 1986 V119 presentation predecessor: ' + path);
  assert.match(receipt.currentSha256, /^[a-f0-9]{64}$/, 'Unreviewed Aliens 1986 V119 presentation successor: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Aliens 1986 V119 presentation successor must change bytes: ' + path);
  return receipt.currentSha256;
}
export function reviewedAliens1986RasterDigestV120(path, endpoint) {
  const receipt = ALIENS1986_RASTER_SOURCE_SUCCESSORS_V120[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken Aliens 1986 V120 presentation predecessor: ' + path);
  assert.match(receipt.currentSha256, /^[a-f0-9]{64}$/, 'Unreviewed Aliens 1986 V120 presentation successor: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Aliens 1986 V120 presentation successor must change bytes: ' + path);
  return receipt.currentSha256;
}

export function reviewedAliens1986RasterDigestV121(path, endpoint) {
  const receipt = ALIENS1986_RASTER_SOURCE_SUCCESSORS_V121[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken Aliens 1986 V121 presentation predecessor: ' + path);
  assert.match(receipt.currentSha256, /^[a-f0-9]{64}$/, 'Unreviewed Aliens 1986 V121 presentation successor: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Aliens 1986 V121 presentation successor must change bytes: ' + path);
  return receipt.currentSha256;
}

export function reviewedAliens1986RasterDigestV122(path, endpoint) {
  const receipt = ALIENS1986_RASTER_SOURCE_SUCCESSORS_V122[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken Aliens 1986 V122 presentation predecessor: ' + path);
  assert.match(receipt.currentSha256, /^[a-f0-9]{64}$/, 'Unreviewed Aliens 1986 V122 presentation successor: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Aliens 1986 V122 presentation successor must change bytes: ' + path);
  return receipt.currentSha256;
}

export function reviewedAliens1986RasterDigestV123(path, endpoint) {
  const receipt = ALIENS1986_RASTER_SOURCE_SUCCESSORS_V123[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken Aliens 1986 V123 presentation predecessor: ' + path);
  assert.match(receipt.currentSha256, /^[a-f0-9]{64}$/, 'Unreviewed Aliens 1986 V123 presentation successor: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Aliens 1986 V123 presentation successor must change bytes: ' + path);
  return receipt.currentSha256;
}

export async function verifyAliens1986RasterSourcesV116(sourceRoot = checkoutRoot) {
  const base = resolve(sourceRoot);
  const inputs = [
    ...Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V116).map(([path, previous]) =>
      [path, reviewedAliens1986RasterDigestV123(path, reviewedAliens1986RasterDigestV122(path, reviewedAliens1986RasterDigestV121(path, reviewedAliens1986RasterDigestV120(path, reviewedAliens1986RasterDigestV119(path, reviewedAliens1986RasterDigestV118(path, reviewedAliens1986RasterDigestV117(path, previous)))))))]),
    ...Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V117),
    ...Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V118),
    ...Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V119),
    ...Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V120),
    ...Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V121),
    ...Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V122),
    ...Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V123),
  ];
  for (const [path, expected] of inputs) {
    assert.match(expected, /^[a-f0-9]{64}$/, 'Unreviewed Aliens 1986 presentation source: ' + path);
    assert.equal(digest(await checkedFile(base, path)), expected, 'Changed Aliens 1986 presentation source: ' + path);
  }
  return { presentationSources: inputs.length };
}

async function verifyAliens1986RasterTreeV117(root, assets) {
  const prefix = ALIENS1986_RASTER_ASSET_ROOT_V117 + '/';
  assert.deepEqual(assets.filter(asset => asset.path.startsWith(prefix)).map(asset => asset.path).sort(),
    [...ALIENS1986_RASTER_ASSET_FILES_V117].sort(), 'Unapproved Aliens 1986 V117 raster inventory.');
  const seen = new Set();
  async function walk(directory) {
    await assertDirectory(join(root, directory));
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Aliens 1986 V117 raster symlink: ' + path);
      assert.equal(publicAliens1986DlcPathAdmission(path, { directory: entry.isDirectory() }), true,
        'Unapproved Aliens 1986 V117 raster member: ' + path);
      if (entry.isDirectory()) { await walk(path); continue; }
      assert.ok(entry.isFile(), 'Invalid Aliens 1986 V117 raster member: ' + path);
      seen.add(path);
    }
  }
  await walk(ALIENS1986_RASTER_ASSET_ROOT_V117);
  for (const path of ALIENS1986_RASTER_ASSET_FILES_V117) {
    assert.ok(seen.has(path), 'Missing Aliens 1986 V117 raster member: ' + path);
  }
}

async function verifyAliens1986RasterTreeV118(root, assets) {
  const prefix = ALIENS1986_RASTER_ASSET_ROOT_V118 + '/';
  assert.deepEqual(assets.filter(asset => asset.path.startsWith(prefix)).map(asset => asset.path).sort(),
    [...ALIENS1986_RASTER_ASSET_FILES_V118].sort(), 'Unapproved Aliens 1986 V118 raster inventory.');
  const seen = new Set();
  async function walk(directory) {
    await assertDirectory(join(root, directory));
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Aliens 1986 V118 raster symlink: ' + path);
      assert.equal(publicAliens1986DlcPathAdmission(path, { directory: entry.isDirectory() }), true,
        'Unapproved Aliens 1986 V118 raster member: ' + path);
      if (entry.isDirectory()) { await walk(path); continue; }
      assert.ok(entry.isFile(), 'Invalid Aliens 1986 V118 raster member: ' + path);
      seen.add(path);
    }
  }
  await walk(ALIENS1986_RASTER_ASSET_ROOT_V118);
  for (const path of ALIENS1986_RASTER_ASSET_FILES_V118) {
    assert.ok(seen.has(path), 'Missing Aliens 1986 V118 raster member: ' + path);
  }
}
async function verifyAliens1986RasterTreeV119(root, assets) {
  const prefix = ALIENS1986_RASTER_ASSET_ROOT_V119 + '/';
  assert.deepEqual(assets.filter(asset => asset.path.startsWith(prefix)).map(asset => asset.path).sort(),
    [...ALIENS1986_RASTER_ASSET_FILES_V119].sort(), 'Unapproved Aliens 1986 V119 raster inventory.');
  const seen = new Set();
  async function walk(directory) {
    await assertDirectory(join(root, directory));
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Aliens 1986 V119 raster symlink: ' + path);
      assert.equal(publicAliens1986DlcPathAdmission(path, { directory: entry.isDirectory() }), true,
        'Unapproved Aliens 1986 V119 raster member: ' + path);
      if (entry.isDirectory()) { await walk(path); continue; }
      assert.ok(entry.isFile(), 'Invalid Aliens 1986 V119 raster member: ' + path);
      seen.add(path);
    }
  }
  await walk(ALIENS1986_RASTER_ASSET_ROOT_V119);
  for (const path of ALIENS1986_RASTER_ASSET_FILES_V119) {
    assert.ok(seen.has(path), 'Missing Aliens 1986 V119 raster member: ' + path);
  }
}

async function verifyAliens1986RasterTreeV120(root, assets) {
  const prefix = ALIENS1986_RASTER_ASSET_ROOT_V120 + '/';
  assert.deepEqual(assets.filter(asset => asset.path.startsWith(prefix)).map(asset => asset.path).sort(),
    [...ALIENS1986_RASTER_ASSET_FILES_V120].sort(), 'Unapproved Aliens 1986 V120 raster inventory.');
  const seen = new Set();
  async function walk(directory) {
    await assertDirectory(join(root, directory));
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Aliens 1986 V120 raster symlink: ' + path);
      assert.equal(publicAliens1986DlcPathAdmission(path, { directory: entry.isDirectory() }), true,
        'Unapproved Aliens 1986 V120 raster member: ' + path);
      if (entry.isDirectory()) { await walk(path); continue; }
      assert.ok(entry.isFile(), 'Invalid Aliens 1986 V120 raster member: ' + path);
      seen.add(path);
    }
  }
  await walk(ALIENS1986_RASTER_ASSET_ROOT_V120);
  for (const path of ALIENS1986_RASTER_ASSET_FILES_V120) {
    assert.ok(seen.has(path), 'Missing Aliens 1986 V120 raster member: ' + path);
  }
}

async function verifyAliens1986RasterTreeV121(root, assets) {
  const prefix = ALIENS1986_RASTER_ASSET_ROOT_V121 + '/';
  assert.deepEqual(assets.filter(asset => asset.path.startsWith(prefix)).map(asset => asset.path).sort(),
    [...ALIENS1986_RASTER_ASSET_FILES_V121].sort(), 'Unapproved Aliens 1986 V121 raster inventory.');
  const seen = new Set();
  async function walk(directory) {
    await assertDirectory(join(root, directory));
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Aliens 1986 V121 raster symlink: ' + path);
      assert.equal(publicAliens1986DlcPathAdmission(path, { directory: entry.isDirectory() }), true,
        'Unapproved Aliens 1986 V121 raster member: ' + path);
      if (entry.isDirectory()) { await walk(path); continue; }
      assert.ok(entry.isFile(), 'Invalid Aliens 1986 V121 raster member: ' + path);
      seen.add(path);
    }
  }
  await walk(ALIENS1986_RASTER_ASSET_ROOT_V121);
  for (const path of ALIENS1986_RASTER_ASSET_FILES_V121) {
    assert.ok(seen.has(path), 'Missing Aliens 1986 V121 raster member: ' + path);
  }
}

async function verifyAliens1986RasterTreeV122(root, assets) {
  const prefix = ALIENS1986_RASTER_ASSET_ROOT_V122 + '/';
  assert.deepEqual(assets.filter(asset => asset.path.startsWith(prefix)).map(asset => asset.path).sort(),
    [...ALIENS1986_RASTER_ASSET_FILES_V122].sort(), 'Unapproved Aliens 1986 V122 raster inventory.');
  const seen = new Set();
  async function walk(directory) {
    await assertDirectory(join(root, directory));
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Aliens 1986 V122 raster symlink: ' + path);
      assert.equal(publicAliens1986DlcPathAdmission(path, { directory: entry.isDirectory() }), true,
        'Unapproved Aliens 1986 V122 raster member: ' + path);
      if (entry.isDirectory()) { await walk(path); continue; }
      assert.ok(entry.isFile(), 'Invalid Aliens 1986 V122 raster member: ' + path);
      seen.add(path);
    }
  }
  await walk(ALIENS1986_RASTER_ASSET_ROOT_V122);
  for (const path of ALIENS1986_RASTER_ASSET_FILES_V122) {
    assert.ok(seen.has(path), 'Missing Aliens 1986 V122 raster member: ' + path);
  }
}

async function verifyAliens1986RasterTreeV123(root, assets) {
  const prefix = ALIENS1986_RASTER_ASSET_ROOT_V123 + '/';
  assert.deepEqual(assets.filter(asset => asset.path.startsWith(prefix)).map(asset => asset.path).sort(),
    [...ALIENS1986_RASTER_ASSET_FILES_V123].sort(), 'Unapproved Aliens 1986 V123 raster inventory.');
  const seen = new Set();
  async function walk(directory) {
    await assertDirectory(join(root, directory));
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Aliens 1986 V123 raster symlink: ' + path);
      assert.equal(publicAliens1986DlcPathAdmission(path, { directory: entry.isDirectory() }), true,
        'Unapproved Aliens 1986 V123 raster member: ' + path);
      if (entry.isDirectory()) { await walk(path); continue; }
      assert.ok(entry.isFile(), 'Invalid Aliens 1986 V123 raster member: ' + path);
      seen.add(path);
    }
  }
  await walk(ALIENS1986_RASTER_ASSET_ROOT_V123);
  for (const path of ALIENS1986_RASTER_ASSET_FILES_V123) {
    assert.ok(seen.has(path), 'Missing Aliens 1986 V123 raster member: ' + path);
  }
}

export async function verifyAliens1986Runtime(root, { sourceRoot = checkoutRoot, built = false } = {}) {
  const base = resolve(root);
  await verifyAliens1986RasterSourcesV116(sourceRoot);
  // Path-policy consumers may use a sparse source checkout without the DLC.
  const { renderAliens1986RasterV116 } = await import('./derive-aliens1986-raster-v116.mjs');
  const derivative = await renderAliens1986RasterV116({ root: resolve(sourceRoot) });
  assert.equal(digest(derivative.html), derivative.sha256, 'Aliens 1986 derivative digest mismatch.');
  await assertDirectory(join(base, 'dlc'));
  await assertDirectory(join(base, ALIENS1986_RUNTIME_ROOT));
  const actual = await readdir(join(base, ALIENS1986_RUNTIME_ROOT), { withFileTypes: true });
  assert.deepEqual(actual.map(entry => entry.name).sort(), ['game.html', 'index.html'], 'Unapproved Aliens 1986 runtime member.');
  const expectedHtml = built ? Buffer.from(derivative.html) : null;
  const expectedGameSha256 = built ? derivative.sha256 : ALIENS1986_GAME_SHA256;
  let totalBytes = 0;
  for (const path of ALIENS1986_RUNTIME_FILES) {
    const bytes = await checkedFile(base, path);
    totalBytes += bytes.length;
    if (path.endsWith('/game.html')) {
      assert.equal(bytes.length, built ? expectedHtml.length : ALIENS1986_GAME_BYTES, 'Changed Aliens 1986 runtime size.');
      assert.equal(digest(bytes), expectedGameSha256, 'Changed Aliens 1986 runtime bytes.');
    } else {
      assert.match(bytes.toString('utf8'), /<iframe\b[^>]*\bsrc=["'](?:\.\/)?game\.html["']/i, 'Aliens 1986 launcher must load the admitted local game.');
    }
  }
  assert.ok(Array.isArray(derivative.assets) && derivative.assets.length > 0, 'Aliens 1986 derivative has no raster inventory.');
  await verifyAliens1986RasterTreeV117(base, derivative.assets);
  await verifyAliens1986RasterTreeV118(base, derivative.assets);
  await verifyAliens1986RasterTreeV119(base, derivative.assets);
  await verifyAliens1986RasterTreeV120(base, derivative.assets);
  await verifyAliens1986RasterTreeV121(base, derivative.assets);
  await verifyAliens1986RasterTreeV122(base, derivative.assets);
  await verifyAliens1986RasterTreeV123(base, derivative.assets);
  const seen = new Set();
  // The pinned manifest is the closed asset list, including reviewed host PNGs.
  // Each path stays under assets and every byte is checked independently.
  for (const asset of derivative.assets) {
    assert.ok(validPath(asset.path) && asset.path.startsWith('assets/') && asset.path.endsWith('.png'), 'Invalid Aliens 1986 raster path: ' + asset.path);
    assert.equal(seen.has(asset.path), false, 'Duplicate Aliens 1986 raster path: ' + asset.path);
    assert.match(asset.sha256, /^[a-f0-9]{64}$/, 'Invalid Aliens 1986 raster digest: ' + asset.path);
    const bytes = await checkedFile(base, asset.path);
    assert.equal(digest(bytes), asset.sha256, 'Changed Aliens 1986 raster bytes: ' + asset.path);
    totalBytes += bytes.length;
    seen.add(asset.path);
  }
  return {
    runtimeFiles: ALIENS1986_RUNTIME_FILES.length, runtimeBytes: totalBytes,
    gameSha256: expectedGameSha256, originalGameSha256: ALIENS1986_GAME_SHA256,
    rasterAssets: seen.size, rasterRevision: built ? 116 : null,
    rasterAssetRevision: derivative.assetRevision,
    rasterExtensionRevision: derivative.presentationExtensionRevision,
  };
}

/** Validate all recovered files, including omissions, additions and symlinks.
 * Built validation independently rejects source corpus leakage. */
export async function verifyAliens1986DlcAdmissions(root, {
  built = false, expectedSha256 = ALIENS1986_RECOVERY_MANIFEST_SHA256, sourceRoot = checkoutRoot,
} = {}) {
  const base = resolve(root);
  if (built) {
    assert.ok(await absent(join(base, ALIENS1986_MODULE_ROOT)), 'Aliens 1986 recovered sources must not be present in a built distribution.');
    return { ok: true, built: true, recoveredFiles: 0, ...await verifyAliens1986Runtime(base, { sourceRoot, built: true }) };
  }
  for (const directory of ['modules', ALIENS1986_MODULE_ROOT, ALIENS1986_RECOVERY_ROOT]) await assertDirectory(join(base, directory));
  const manifestPath = join(base, ALIENS1986_RECOVERY_MANIFEST);
  const stat = await lstat(manifestPath);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Invalid Aliens 1986 recovery manifest file.');
  const inventory = compileAliens1986RecoveryManifest(await readFile(manifestPath), expectedSha256);
  const seen = new Set();
  let recoveredBytes = 0;
  async function walk(directory) {
    for (const entry of await readdir(join(base, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Recovery symlink is not allowed: ' + path);
      if (entry.isDirectory()) {
        assert.ok(inventory.directories.has(path), 'Unlisted Aliens 1986 recovery directory: ' + path);
        await walk(path); continue;
      }
      const expected = inventory.files.get(path);
      assert.ok(expected, 'Unlisted Aliens 1986 recovery member: ' + path);
      assert.ok(entry.isFile(), 'Unsupported Aliens 1986 recovery entry: ' + path);
      const bytes = await readFile(join(base, path));
      assert.equal(bytes.length, expected.bytes, 'Changed Aliens 1986 recovery size: ' + path);
      assert.equal(digest(bytes), expected.sha256, 'Changed Aliens 1986 recovery bytes: ' + path);
      recoveredBytes += bytes.length; seen.add(path);
    }
  }
  await walk(ALIENS1986_RECOVERY_ROOT);
  for (const path of inventory.files.keys()) assert.ok(seen.has(path), 'Missing Aliens 1986 recovery member: ' + path);
  assert.equal(digest(await readFile(manifestPath)), expectedSha256, 'Aliens 1986 inventory changed during verification.');
  return { ok: true, built: false, recoveredFiles: seen.size, recoveredBytes, manifestSha256: expectedSha256,
    ...await verifyAliens1986Runtime(base, { sourceRoot, built: false }) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyAliens1986DlcAdmissions(process.cwd(), { built: process.argv.includes('--built') }), null, 2));
}
