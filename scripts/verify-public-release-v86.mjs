import { publicXenoProductionPathAdmissionV206, verifyXenoProductionAdmissionsV206 } from './public-xeno-production-admissions-v206.mjs';
import { publicXenoVisualPathAdmissionV205, verifyXenoVisualAdmissionsV205 } from './public-xeno-visual-admissions-v205.mjs';
import { publicXenoPriorityPathAdmissionV204, verifyXenoPriorityAdmissionsV204 } from './public-xeno-priority-admissions-v204.mjs';
import { publicXenoPriorityPathAdmissionV203, verifyXenoPriorityAdmissionsV203 } from './public-xeno-priority-admissions-v203.mjs';
import { publicXenoPriorityPathAdmissionV202, verifyXenoPriorityAdmissionsV202 } from './public-xeno-priority-admissions-v202.mjs';
import { publicXenoPriorityPathAdmissionV201, verifyXenoPriorityAdmissionsV201 } from './public-xeno-priority-admissions-v201.mjs';
import { publicXenoSuperPathAdmissionV200, verifyXenoSuperAdmissionsV200 } from './public-xeno-super-admissions-v200.mjs';
import { publicXenoActionPathAdmissionV199, verifyXenoActionAdmissionsV199 } from './public-xeno-action-admissions-v199.mjs';
import { publicXenoPriorityStagePathAdmissionV198, verifyXenoPriorityStageAdmissionsV198 } from './public-xeno-priority-stage-admissions-v198.mjs';
import { publicXenoSpritePathAdmissionV197, verifyXenoSpriteAdmissionsV197 } from './public-xeno-sprite-admissions-v197.mjs';
import { publicXenoReferencedStagePathAdmissionV196, verifyXenoReferencedStageAdmissionsV196 } from './public-xeno-referenced-stage-admissions-v196.mjs';
import { publicXenoIconicStagePathAdmissionV194, verifyXenoIconicStageAdmissionsV194 } from './public-xeno-iconic-stage-admissions-v194.mjs';
import { publicXenoOriginalArenaPathAdmissionV193, verifyXenoOriginalArenaAdmissionsV193 } from './public-xeno-original-arena-admissions-v193.mjs';
import { publicXenoFranchiseStagePathAdmissionV192, verifyXenoFranchiseStageAdmissionsV192 } from './public-xeno-franchise-stage-admissions-v192.mjs';
import { publicXenoSpritePathAdmissionV191, verifyXenoSpriteAdmissionsV191 } from './public-xeno-sprite-admissions-v191.mjs';
import { publicArbiterPathAdmissionV190, verifyArbiterImageAdmissionsV190 } from './public-xeno-arbiter-admissions-v190.mjs';
import { publicReleasePathAdmissionV163, verifyPublicAdmissionsV163 } from './public-release-admissions-v163.mjs';
import { projectRecoveryPathAdmission20261116, verifyProjectRecoveryArchive20261116 } from './project-recovery-admission-20261116.mjs';
import assert from 'node:assert/strict';
import { readdir, readFile, lstat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateContent, RELEASE } from '../src/content.js';
import { APP_RELEASE_V143 } from '../src/release-info-v143.js';
import { AUDIO_FORMATS_V77, AUDIO_SLOTS_V77 } from '../src/audio-assets-v77.js';
import { publicReleasePathAdmissionV119, verifyPublicAdmissionsV119 } from './public-release-admissions-v119.mjs';
import { publicReleasePathAdmissionV120, verifyPublicAdmissionsV120 } from './public-release-admissions-v120.mjs';
import { publicReleasePathAdmissionV121, verifyPublicAdmissionsV121 } from './public-release-admissions-v121.mjs';
import { publicReleasePathAdmissionV122, verifyPublicAdmissionsV122 } from './public-release-admissions-v122.mjs';
import { publicReleasePathAdmissionV123, verifyPublicAdmissionsV123 } from './public-release-admissions-v123.mjs';
import { publicCostumePathAdmissionV165, verifyPublicCostumeAdmissionsV165 } from './public-costume-admissions-v165.mjs';
import { publicXenoSpritePathAdmissionV189, verifyXenoSpriteAdmissionsV189 } from './public-xeno-sprite-admissions-v189.mjs';
import { publicXenoSpritePathAdmissionV188, verifyXenoSpriteAdmissionsV188 } from './public-xeno-sprite-admissions-v188.mjs';
import { publicCampaignArtPathAdmissionV180, verifyCampaignArtAdmissionsV180 } from './public-campaign-art-admissions-v180.mjs';

const ROOT_FILES = new Set([
  'xeno-arbiter-v190.css',
  'campaign-lethe-continuity-v163.css',
  'campaign-convoy-history-v162.css',
  'command-v110.css', 'echo9-v110.css', 'player-appearance-v126.css',
  '.gitattributes', '.gitignore', '.vercelignore', 'LICENSE_NOTICE.md',
  'index.html', 'manifest.webmanifest', 'package.json', 'package-lock.json', 'sw.js', 'vercel.json',
  'alien-survival-v70.css', 'bioforge-v80.css', 'catalog-v62.css', 'crew-v85.css', 'hub-level.css',
  'hub-stations-v61.css', 'mission-insertion-v62.css', 'placeables-v86.css', 'player-onboarding-v84.css',
  'runtime-level.css', 'sprite-gallery.css', 'styles-v50.css', 'styles.css', 'title-scene-v79.css', 'title-screen-v61.css',
  'xeno-trials-v96.css', 'xeno-trials-fullscreen-v119.css', 'user-reference-library-v100.css', 'specimen-bench-v106.css'
]);
const SCRIPT_FILES = new Set([
  'public-xeno-sprite-admissions-v189.mjs',
  'audit-xeno-animation-audio-v189.mjs',
  'verify-xeno-animation-audio-audit-v189.mjs',
  'verify-xeno-trials-sprite-atlas-v189.mjs',
  'verify-xeno-trials-audio-v189.mjs',
  'verify-xeno-trials-animation-coverage-v189.mjs',
  'verify-xeno-trials-animation-audio-i18n-v189.mjs',
  'verify-xeno-trials-runtime-animation-audio-v189.mjs',
  'verify-xeno-trials-animation-ui-v189.mjs',
  'qa-xeno-trials-animation-audio-v189.py',

  'public-xeno-sprite-admissions-v188.mjs',
  'audit-xeno-stage-operations-v188.mjs',
  'verify-xeno-stage-operations-audit-v188.mjs',
  'verify-xeno-trials-operations-v188.mjs',
  'verify-xeno-trials-stage-hazards-v188.mjs',
  'verify-xeno-trials-runtime-operations-v188.mjs',
  'verify-xeno-trials-sprite-atlas-v188.mjs',
  'verify-xeno-trials-operation-presentation-v188.mjs',
  'verify-xeno-trials-operation-i18n-v188.mjs',
  'verify-xeno-trials-operations-engine-v188.mjs',
  'qa-xeno-trials-operations-v188.py',

  'qa-xeno-trials-completion-v186.py',
  'audit-xeno-trials-completion-v186.mjs',
  'verify-xeno-trials-completion-audit-v186.mjs',
  'verify-xeno-trials-horde-checkpoint-v186.mjs',
  'verify-xeno-trials-horde-bosses-v186.mjs',
  'verify-xeno-trials-gamepad-v186.mjs',
  'verify-xeno-trials-reactions-v186.mjs',
  'verify-xeno-trials-ui-v186.mjs',
  'verify-xeno-trials-i18n-v186.mjs',
  'verify-xeno-trials-runtime-completion-v186.mjs',
  'public-campaign-art-admissions-v180.mjs',
  'audit-succession-v180.mjs',
  'verify-campaign-art-v180.mjs',
  'verify-xeno-trials-horde-v180.mjs',
  'verify-xeno-trials-horde-runtime-v180.mjs',
  'verify-xeno-trials-horde-ui-v180.mjs',
  'verify-xeno-trials-stage-depth-v180.mjs',
  'verify-xeno-trials-swarm-sprites-v180.mjs',
  'verify-xeno-trials-curriculum-v179.mjs',
  'verify-xeno-trials-roster-v179.mjs',
  'verify-xeno-trials-boss-stages-v179.mjs',
  'verify-xeno-trials-events-v179.mjs',
  'verify-xeno-trials-tickets-v179.mjs',
  'verify-campaign-art-v179.mjs',
  'verify-capture-observation-v177.mjs',
  'verify-hub-armory-layering-v177.mjs',
  'verify-tantalus-enrichment-v177.mjs',
  'verify-weapon-conservation-v177.mjs',
  'verify-weapon-feed-admission-v193.mjs',
  'verify-npc-lift-queue-v177.mjs',
  'qa-tantalus-enrichment-v177.py',
  'verify-tantalus-batch100-v168.mjs',
  'verify-dialogue-portraits-v168.mjs',
  'verify-hub-backgrounds-v168.mjs',
  'qa-tantalus-batch100-v168.py',
  'verify-player-arm-phase-v167.mjs',
  'verify-allied-patrol-phase-v167.mjs',
  'verify-ship-placement-v167.mjs',
  'verify-range-crew-interaction-v167.mjs',
  'qa-npc-station-relays-v166.py',
  'verify-npc-station-relays-v166.mjs',
  'verify-npc-relay-locked-bulkheads-v166.mjs',
  'qa-npc-interdeck-native-v165.py',
  'qa-npc-cal-logistics-route-v165.py',
  'qa-npc-interdeck-routes-v165.py',
  'verify-npc-cal-logistics-route-v165.mjs',
  'verify-npc-interdeck-passage-v165.mjs',
  'verify-npc-interdeck-routes-v165.mjs',
  'verify-npc-jun-climb-rig-v165.mjs',
  'verify-parallel-completion-v165.mjs',
  'verify-npc-cal-climb-rig-v165.mjs',
  'verify-hub-interaction-input-v165.mjs',
  'qa-hub-service-details-v165.py',
  'qa-native-rig-catalog-v165.py',
  'qa-npc-annex-workpost-routes-v165.py',
  'qa-player-allies-contacts-v165.py',
  'verify-hub-service-details-v165.mjs',
  'verify-native-rig-catalog-v165.mjs',
  'verify-npc-annex-workpost-routes-v165.mjs',
  'verify-player-allies-contacts-v165.mjs',
  'public-costume-admissions-v165.mjs',
  'verify-costume-atlases-v165.mjs',
  'qa-costume-atlases-v165.py',
  'qa-npc-matte-apertures-v164.py', 'verify-npc-matte-apertures-v164.mjs',
  'verify-hub-console-support-v142.mjs','verify-hub-elevator-interior-v142.mjs',
  'verify-hub-vent-scene-v142.mjs','verify-hub-room-composition-v142.mjs',
  'verify-player-body-alignment-v142.mjs','verify-hub-door-passage-v142.mjs',
  'verify-hub-door-npc-clearance-v142.mjs',
'audit-weapon-png-v120.mjs', 'public-release-admissions-v123.mjs', 'public-release-admissions-v122.mjs', 'public-release-admissions-v121.mjs', 'audio-scan-v77.mjs', 'build-asset-filter.mjs', 'build-output-guard.mjs',
  'build.mjs', 'dev.mjs', 'verify-public-release-v86.mjs', 'public-release-admissions-v119.mjs', 'public-release-admissions-v120.mjs',
  'verify-player-runtime-v124.mjs', 'verify-player-presentation-v124.mjs', 'verify-player-field-actions-v124.mjs', 'qa-player-browser-v124.mjs',
  'verify-player-body-rig-v125.mjs', 'verify-player-weapon-rig-v125.mjs', 'verify-held-weapon-v125.mjs', 'verify-weapon-image-cache-v125.mjs',
  'verify-player-appearance-v126.mjs', 'verify-player-appearance-runtime-v126.mjs', 'verify-player-modular-rig-v126.mjs',
  'verify-player-action-rig-v127.mjs', 'verify-player-appearance-preview-v127.mjs',
  'verify-player-transit-rig-v128.mjs', 'verify-player-appearance-preview-v128.mjs', 'verify-player-incapacitation-v128.mjs',
  'verify-player-locomotion-rig-v129.mjs', 'verify-player-colonial-art-v129.mjs', 'verify-player-appearance-preview-v129.mjs',
  'verify-enemy-tactics-v130.mjs', 'verify-destructible-scenery-v130.mjs', 'verify-vertical-world-v130.mjs', 'verify-weapon-actions-v130.mjs', 'qa-frontier-browser-v130.mjs',
  'verify-weapon-actions-v131.mjs', 'verify-apc-course-v131.mjs', 'verify-hive-missions-v131.mjs',
  'verify-mecha-missions-v131.mjs', 'verify-ecosystem-missions-v131.mjs', 'verify-legacy-operations-v131.mjs',
  'verify-operations-integration-v131.mjs', 'qa-operations-browser-v131.mjs', 'verify-hive-command-ui-v131.mjs',
  'verify-operation-receipts-v131.mjs',
  'generate-audio-v132.mjs', 'verify-audio-score-v132.mjs', 'qa-audio-browser-v132.mjs',
  'verify-squad-doctrine-v132.mjs', 'verify-placeables-extension-v132.mjs',
  'verify-horde-director-v132.mjs', 'verify-narrative-evidence-v132.mjs',
  'verify-hub-training-v132.mjs', 'verify-bioforge-admissions-v132.mjs',
  'qa-squad-browser-v132.mjs', 'qa-hub-browser-v132.mjs',
  'qa-placeables-browser-v132.mjs',
  'qa-narrative-browser-v132.mjs',
  'qa-horde-browser-v132.mjs',
  'verify-hub-control-bindings-v133.mjs', 'verify-hub-navigation-v133.mjs',
  'qa-hub-navigation-v133.mjs', 'qa-controls-browser-v133.mjs', 'qa-human-locomotion-v133.mjs',
  'verify-human-visual-contract-v133.mjs',
  'verify-human-patrol-animation-v133.mjs',
  'verify-human-gait-v133.mjs', 'qa-human-visual-browser-v133.mjs',
  'verify-hub-authored-composition-v133.mjs', 'qa-hub-interactions-browser-v133.mjs',
  'verify-hub-bulkhead-depth-v134.mjs', 'verify-hub-room-parallax-v134.mjs',
  'verify-hub-room-dressing-v134.mjs', 'verify-sprite-alpha-policy-v134.mjs', 'verify-hub-environment-atlas-v134.mjs',
  'qa-hub-presentation-v134.mjs', 'qa-hub-room-parallax-v134.mjs',
  'verify-jeri-surface-motion-v135.mjs', 'qa-jeri-surface-browser-v135.mjs',
  'verify-crew-conversation-memory-v135.mjs', 'verify-field-media-v135.mjs',
  'verify-npc-dialogue-causality-v135.mjs', 'qa-continuation-browser-v135.mjs',
  'verify-editor-authoring-v135.mjs', 'verify-player-wardrobe-v135.mjs', 'qa-authoring-browser-v135.mjs',
  'verify-hub-spatial-design-v136.mjs', 'verify-hub-room-life-v136.mjs', 'verify-hub-prop-atlas-v136.mjs',
  'verify-human-motion-v136.mjs', 'verify-npc-life-v136.mjs', 'verify-editor-spatial-v136.mjs',
  'qa-tantalus-design-v136.mjs', 'qa-npc-life-v136.mjs', 'qa-editor-spatial-browser-v136.mjs',
  'verify-hub-ship-layout-v137.mjs', 'verify-hub-circulation-v137.mjs',
  'verify-hub-room-furnishing-v137.mjs', 'verify-hub-room-identity-v137.mjs', 'qa-tantalus-ship-v137.mjs',
  'verify-hub-service-routes-v138.mjs', 'verify-hub-crawl-hint-v138.mjs',
  'verify-hub-interior-wall-atlas-v138.mjs', 'verify-hub-compartment-shell-v138.mjs',
  'verify-hub-destination-signage-v138.mjs', 'verify-hub-annex-fixtures-v138.mjs',
  'verify-hub-critical-furnishing-v138.mjs', 'qa-tantalus-level-v138.mjs',
  'verify-human-natural-gait-v139.mjs',
  'verify-hub-dropship-hangar-v139.mjs',
  'verify-hub-whole-room-projection-v139.mjs', 'verify-hub-workstation-details-v139.mjs',
  'verify-hub-annex-runtime-geometry-v139.mjs',
  'verify-player-climb-contacts-v139.mjs', 'verify-hub-support-planes-v139.mjs',
  'verify-hub-native-prop-placement-v139.mjs', 'verify-hub-annex-storage-v139.mjs',
  'verify-hub-support-contact-v139.mjs', 'verify-hub-furniture-atlases-v139.mjs', 'qa-tantalus-perspective-v139.mjs',
  'verify-weapon-presentation-profiles-v124.mjs', 'verify-weapon-effects-v124.mjs', 'verify-weapon-runtime-v124.mjs']);
for (const file of ['build-release-v143.mjs', 'test-release-v143.mjs', 'verify-audit-v143.mjs',
  'verify-save-lifecycle-v143.mjs', 'verify-release-artifact-v143.mjs',
  'qa-service-worker-v143.py', 'qa-save-profiles-v144.py', 'verify-xeno-trials-v145.mjs', 'qa-xeno-trials-v145.py']) SCRIPT_FILES.add(file);
SCRIPT_FILES.add('audit-succession-v179.mjs');
SCRIPT_FILES.add('verify-xeno-trials-signatures-v147.mjs');
SCRIPT_FILES.add('verify-xeno-trials-supers-v148.mjs');
SCRIPT_FILES.add('qa-xeno-trials-signatures-v147.py');
SCRIPT_FILES.add('verify-xeno-trials-castes-v151.mjs');
SCRIPT_FILES.add('verify-xeno-trials-acid-v152.mjs');
SCRIPT_FILES.add('verify-xeno-trials-grapple-v153.mjs');
SCRIPT_FILES.add('verify-xeno-trials-rig-v154.mjs');
SCRIPT_FILES.add('verify-xeno-trials-sequences-v155.mjs');
SCRIPT_FILES.add('qa-xeno-trials-sequences-v155.py');
SCRIPT_FILES.add('qa-xeno-trials-rig-v154.py');
SCRIPT_FILES.add('qa-xeno-trials-grapple-v153.py');
SCRIPT_FILES.add('verify-xeno-trials-plan-v146.mjs');
SCRIPT_FILES.add('verify-xeno-trials-workbook-v146.py');
SCRIPT_FILES.add('verify-xeno-trials-feedback-v149.mjs');
SCRIPT_FILES.add('verify-xeno-trials-controls-v150.mjs');
SCRIPT_FILES.add('verify-player-qa-observation-v150.mjs');
SCRIPT_FILES.add('qa-xeno-trials-controls-v150.py');
for (const file of [
  'verify-forge-narrative-v156.mjs',
  'verify-hub-annex-population-v156.mjs',
  'verify-xeno-trials-presentations-v156.mjs',
  'verify-xeno-trials-restraint-pose-v156.mjs',
  'verify-audit-continuation-v156.mjs',
  'verify-audit-workbook-v156.py',
  'qa-xeno-trials-presentations-v156.py',
  'qa-forge-narrative-v156.py',
  'qa-xeno-trials-restraint-v156.py',
  'qa-hub-annex-population-v156.mjs',
]) SCRIPT_FILES.add(file);
for (const file of [
  "audit-succession-v157.mjs",
  "verify-audit-continuation-v157.mjs",
  "verify-audit-workbook-v157.py",
  "generate-audit-continuation-v157.py",
  "verify-forge-conditions-v157.mjs",
  "qa-forge-conditions-v157.py",
  "verify-forge-playtest-checkpoint-v157.mjs",
  "qa-forge-playtest-checkpoint-v157.py",
  "verify-hub-annex-service-v157.mjs",
  "qa-hub-annex-service-v157.mjs"
]) SCRIPT_FILES.add(file);
for (const file of [
  'audit-succession-v159.mjs',
  'generate-audit-continuation-v159.py',
  'verify-audit-continuation-v159.mjs',
  'verify-audit-workbook-v159.py',
  'audit-succession-v158.mjs',
  'generate-audit-continuation-v158.py',
  'verify-audit-continuation-v158.mjs',
  'verify-audit-workbook-v158.py',
  'verify-black-cocoon-presentation-v158.mjs',
  'verify-npc-circulation-v158.mjs',
  'verify-forge-npcs-v158.mjs',
  'verify-xeno-trials-capture-reception-v158.mjs',
  'qa-black-cocoon-browser-v158.mjs',
  'qa-npc-circulation-v158.py',
  'verify-npc-annex-circulation-v159.mjs',
  'qa-npc-annex-circulation-v159.py',
  'qa-forge-npcs-v158.py',
  'qa-xeno-trials-capture-reception-v158.py',
]) SCRIPT_FILES.add(file);
for (const file of [
  'audit-succession-v163.mjs',
  'generate-audit-continuation-v163.py',
  'public-release-admissions-v163.mjs',
  'qa-campaign-lethe-v163.py',
  'qa-hub-lift-transit-v163.py',
  'qa-native-rig-catalog-v163.py',
  'qa-npc-annex-leases-v163.py',
  'qa-npc-annex-service-routes-v163.py',
  'qa-reload-branches-v163.py',
  'qa-title-compositions-v163.py',
  'qa-trials-continuity-v163.py',
  'qa-xeno-trials-capture-v163.py',
  'verify-audit-continuation-v163.mjs',
  'verify-audit-workbook-v163.py',
  'verify-campaign-lethe-v163.mjs',
  'verify-capture-admission-v163.mjs',
  'verify-hub-lift-transit-v163.mjs',
  'verify-native-rig-catalog-v163.mjs',
  'verify-native-rig-terminal-v163.mjs',
  'verify-native-rig-weapon-rigidity-v163.mjs',
  'verify-npc-annex-leases-v163.mjs',
  'verify-npc-annex-service-routes-v163.mjs',
  'verify-reload-presentation-v163.mjs',
  'verify-trials-navigation-v163.mjs',
  'verify-xeno-trials-capture-v163.mjs',
]) SCRIPT_FILES.add(file);
SCRIPT_FILES.add('verify-weapon-arsenal-v167.mjs');
SCRIPT_FILES.add('verify-weapon-magazine-world-v168.mjs');
SCRIPT_FILES.add('verify-weapon-attachments-v168.mjs');
SCRIPT_FILES.add('verify-weapon-fidelity-v170.mjs');
SCRIPT_FILES.add('verify-weapon-research-v171.mjs');
SCRIPT_FILES.add('verify-weapon-special-feeds-v171.mjs');
// Exact V174 dual-feed source-only QA, not a public asset.
SCRIPT_FILES.add('verify-weapon-underbarrel-v174.mjs');
SCRIPT_FILES.add('verify-armory-art-installer-v171.mjs');
SCRIPT_FILES.add('verify-armory-resupply-v174.mjs');
SCRIPT_FILES.add('install-armory-art-v171.mjs');
// Source-only V175 manual costume import; no artwork is whitelisted by this declaration.
SCRIPT_FILES.add('install-costume-art-v175.mjs');
SCRIPT_FILES.add('verify-costume-art-installer-v175.mjs');
// Exact specialist-feed QA script: source-only audit without wildcard admission.
SCRIPT_FILES.add('verify-weapon-special-feeds-v171.mjs');
// Source-tree verifier for the three V169 armory storefront variants; exact path only.
SCRIPT_FILES.add('verify-hub-armory-v169.mjs');
SCRIPT_FILES.add('verify-i18n-v185.mjs');
// Exact V179 tooling stays source-only, independently of older script policy.
const V179_SOURCE_ONLY_SCRIPTS = new Set(["scripts/sync-alien-base-v1.mjs", "scripts/export-alien-base-tantalus-v1.mjs", "scripts/alien-base-pr7-proposal-v1.mjs", "scripts/verify-alien-base-bridge-v1.mjs", "scripts/verify-alien-base-import-contract-v179.mjs", "scripts/verify-alien-base-pr7-proposal-v1.mjs", "scripts/verify-hub-door-bay-v178.mjs"]);
const XENO_ARBITER_SOURCE_ONLY_V191 = new Set([
  'scripts/audit-xeno-franchise-stages-v192.mjs',
  'scripts/public-xeno-franchise-stage-admissions-v192.mjs',
  'scripts/qa-xeno-trials-franchise-stages-v192.py',
  'scripts/verify-xeno-franchise-stages-audit-v192.mjs',
  'scripts/verify-xeno-trials-franchise-stages-v192.mjs',
  'scripts/verify-xeno-trials-franchise-stage-render-v192.mjs',
  'scripts/verify-xeno-trials-franchise-stage-ui-v192.mjs',
  'scripts/audit-xeno-arbiter-protocols-v191.mjs',
  'scripts/verify-xeno-arbiter-protocols-audit-v191.mjs',
  'scripts/public-xeno-sprite-admissions-v191.mjs',
  'scripts/qa-xeno-arbiter-protocols-v191.py',
  'scripts/verify-xeno-arbiter-integration-v191.mjs',
  'scripts/verify-xeno-arbiter-protocols-v191.mjs',
  'scripts/verify-xeno-trials-sprite-atlas-v191.mjs',
  'scripts/verify-xeno-trials-animation-coverage-v191.mjs',
  'scripts/verify-xeno-trials-runtime-animation-v191.mjs',
  'scripts/verify-xeno-arbiter-protocols-i18n-v191.mjs',
]);
const XENO_ARBITER_SOURCE_ONLY_V190 = new Set([
  'scripts/public-xeno-arbiter-admissions-v190.mjs',
  'scripts/audit-xeno-arbiter-campaign-v190.mjs',
  'scripts/verify-xeno-arbiter-campaign-audit-v190.mjs',
  'scripts/verify-xeno-arbiter-campaign-v190.mjs',
  'scripts/verify-xeno-arbiter-scenery-v190.mjs',
  'scripts/xeno-arbiter-test-helpers-v190.mjs',
  'scripts/verify-xeno-arbiter-save-ui-v190.mjs',
  'scripts/verify-xeno-trials-stage-scenes-v190.mjs',
  'scripts/verify-xeno-arbiter-campaign-art-v190.mjs',
  'scripts/verify-xeno-arbiter-i18n-v190.mjs',
  'scripts/qa-xeno-arbiter-stages-v190.py',
]);
const XENO_ANIMATION_SOURCE_ONLY_V189 = new Set([
  'scripts/public-xeno-sprite-admissions-v189.mjs',
  'scripts/audit-xeno-animation-audio-v189.mjs',
  'scripts/verify-xeno-animation-audio-audit-v189.mjs',
  'scripts/verify-xeno-trials-sprite-atlas-v189.mjs',
  'scripts/verify-xeno-trials-audio-v189.mjs',
  'scripts/verify-xeno-trials-animation-coverage-v189.mjs',
  'scripts/verify-xeno-trials-animation-audio-i18n-v189.mjs',
  'scripts/verify-xeno-trials-runtime-animation-audio-v189.mjs',
  'scripts/verify-xeno-trials-animation-ui-v189.mjs',
  'scripts/qa-xeno-trials-animation-audio-v189.py',
]);
const XENO_OPERATIONS_SOURCE_ONLY_V188 = new Set([
  'scripts/public-xeno-sprite-admissions-v188.mjs',
  'scripts/audit-xeno-stage-operations-v188.mjs',
  'scripts/verify-xeno-stage-operations-audit-v188.mjs',
  'scripts/verify-xeno-trials-operations-v188.mjs',
  'scripts/verify-xeno-trials-stage-hazards-v188.mjs',
  'scripts/verify-xeno-trials-runtime-operations-v188.mjs',
  'scripts/verify-xeno-trials-sprite-atlas-v188.mjs',
  'scripts/verify-xeno-trials-operation-presentation-v188.mjs',
  'scripts/verify-xeno-trials-operation-i18n-v188.mjs',
  'scripts/verify-xeno-trials-operations-engine-v188.mjs',
  'scripts/qa-xeno-trials-operations-v188.py',
]);
const XENO_COMPLETION_SOURCE_ONLY_V186 = new Set([
  'scripts/qa-xeno-trials-completion-v186.py',
  'scripts/audit-xeno-trials-completion-v186.mjs',
  'scripts/verify-xeno-trials-completion-audit-v186.mjs',
  'scripts/verify-xeno-trials-horde-checkpoint-v186.mjs',
  'scripts/verify-xeno-trials-horde-bosses-v186.mjs',
  'scripts/verify-xeno-trials-gamepad-v186.mjs',
  'scripts/verify-xeno-trials-reactions-v186.mjs',
  'scripts/verify-xeno-trials-ui-v186.mjs',
  'scripts/verify-xeno-trials-i18n-v186.mjs',
  'scripts/verify-xeno-trials-runtime-completion-v186.mjs'
]);
const ROOT_IGNORES = new Set(['.git', 'dist', 'node_modules', '.vercel']);
for (const file of [
  'audit-succession-v162.mjs', 'generate-audit-continuation-v162.py',
  'verify-audit-continuation-v162.mjs', 'verify-audit-workbook-v162.py',
  'verify-audio-lifecycle-v162.mjs', 'qa-audio-native-v162.py',
  'qa-harpoon-native-v162.py',
  'verify-harpoon-unload-v162.mjs',
  'verify-npc-medical-route-v162.mjs', 'qa-npc-medical-route-v162.py',
  'verify-campaign-convoy-history-v162.mjs', 'qa-campaign-convoy-history-v162.py',
]) SCRIPT_FILES.add(file);
for (const file of [
  'audit-succession-v161.mjs', 'generate-audit-continuation-v161.py',
  'verify-audit-continuation-v161.mjs', 'verify-audit-workbook-v161.py',
  'verify-forge-campaign-v161.mjs', 'qa-forge-campaign-v161.py',
  'verify-campaign-convoy-story-v161.mjs', 'qa-campaign-convoy-v161.py',
  'verify-npc-service-routes-v161.mjs', 'qa-npc-service-routes-v161.py',
  'audit-succession-v160.mjs', 'generate-audit-continuation-v160.py',
  'verify-audit-continuation-v160.mjs', 'verify-audit-workbook-v160.py',
  'verify-motion-tracker-v160.mjs', 'verify-campaign-story-v160.mjs',
  'verify-archive-relay-presentation-v160.mjs',
  'verify-player-human-coherence-v160.mjs',
  'qa-player-anatomy-v160.py', 'qa-motion-tracker-v160.py', 'qa-campaign-story-v160.py',
]) SCRIPT_FILES.add(file);
// Development tools recovered from the published Forge branch stay in Git.
// They are never admitted in a built distribution, nor copied by the builder.
const FORGE_TOOLING_V140 = new Set([
  // Obscura 2026-11-15: exact developer paths; never included in the built distribution.
  '.agents',
  '.agents/skills',
  '.agents/skills/obscura',
  '.agents/skills/obscura/SKILL.md',
  '.agents/skills/obscura/LICENSE',
  '.claude',
  '.claude/skills',
  '.claude/skills/obscura',
  '.claude/skills/obscura/SKILL.md',
  '.claude/skills/obscura/LICENSE',
  '.ai-tools/obscura',
  '.ai-tools/obscura/README.md',
  '.ai-tools/obscura/source.json',

  // Exact PR integration and optional developer tooling stay source-only.
  'scripts/audit-pr-integration-v182.mjs',
  'scripts/qa-hub-door-bays-v182.py',
  'docs/development/PR_INTEGRATION_20261104.md',
  'docs/forge/xeno-trials/door-bay-continuation-v182.json',
  'CLAUDE.md', '.ai-tools', '.ai-tools/README.md', '.ai-tools/sources.json',
  '.ai-tools/setup.py', '.ai-tools/.gitignore', '.ai-tools/tests', '.ai-tools/tests/test_setup.py',
  "docs/development/ALIEN_BASE_REFERENCE_REVIEW_20261102.md",
  "docs/development/ALIEN_BASE_SOURCE_SNAPSHOTS_20261102.json",
  "docs/development/Alien_Base_Current_Mapping_Gaps_20261102.csv",
  "docs/development/Alien_Base_Import_Status.csv",
  "docs/development/ALIEN_BASE_PR7_PROPOSAL_V1.md",
  "docs/development/data/ALIEN_BASE_PR7_PROVENANCE_V1.json",
  "docs/development/data/ALIEN_BASE_PR7_REGISTRY_V1.json",
  "docs/development/ALIEN_BASE_SYNC.md",
  "docs/forge/xeno-trials/tantalus-door-bay-v179.json",
  "docs/forge/xeno-trials/V179-REFERENCE-AND-WORKSHOP-CONTINUATION.md",
  ".github/workflows/alien-base-bridge.yml",
  "docs/development/data",

  // Project gamedev guidance is source-only, never public distribution content.
  'AGENTS.md',
  'docs/development',
  'docs/development/GAMEDEV_GUIDANCE.md',
  'docs/development/SPRITE_PACK_V170.md',
  'docs/development/CLOTURE_EXCEL_20261101.xlsx',
  'docs/development/EXCEL_CLOSURE_20261101.json',
  'docs/development/EXCEL_CLOSURE_20261101.md',
  // V183 original-names succession receipts: source-only audit, never shipped.
  'scripts/audit-original-names-v183.mjs',
  // V184 audio-slot succession receipts: source-only audit, never shipped.
  'scripts/audit-audio-slots-v184.mjs',
  // V185 French/English succession receipts: source-only audit, never shipped.
  'scripts/audit-i18n-v185.mjs',
  // V186 FR/EN maintenance and regression QA stay source-only, exact paths.
  'scripts/audit-i18n-maintenance-v186.mjs',
  'scripts/verify-i18n-audit-v186.mjs',
  'scripts/verify-i18n-auto-dynamic-v185.mjs',
  'scripts/i18n-catalog-maintenance-v186.mjs',
  'scripts/verify-i18n-maintenance-v186.mjs',
  'scripts/qa-i18n-dynamic-v186.py',
  'docs/development/I18N_MAINTENANCE_V186.md',
  // V187 bounded native-QA resource profiles, source-only exact paths.
  'scripts/audit-native-qa-resources-v187.mjs',
  'scripts/verify-native-qa-resources-v187.mjs',
  'docs/development/NATIVE_QA_RESOURCES_V187.md',
  // V188 P0/P1 priority audit (bible §56), source-only exact paths.
  'scripts/audit-tantalus-priorities-v188.mjs',
  'scripts/verify-tantalus-priorities-v188.mjs',
  'scripts/verify-tension-director-v188.mjs',
  'scripts/verify-story-slice-v188.mjs',
  'scripts/engine-host-v188.mjs',
  'scripts/generate-audio-v188.mjs',
  'scripts/verify-audio-cues-v188.mjs',
  'scripts/verify-combat-feel-v188.mjs',
  'scripts/verify-run-options-v188.mjs',
  'scripts/verify-accessibility-v188.mjs',
  'scripts/verify-reactive-lines-v188.mjs',
  'scripts/verify-caste-behaviors-v188.mjs',
  'scripts/verify-origin-abilities-v188.mjs',
  'scripts/verify-story-cinematics-v188.mjs',
  'scripts/verify-story-dossier-v188.mjs',
  'scripts/verify-colony-reconstruction-v188.mjs',
  'scripts/verify-intro-v188.mjs',
  'scripts/verify-title-vfx-v188.mjs',
  'scripts/verify-ingame-staging-v188.mjs',
  'scripts/verify-hub-depth-rooms-v188.mjs',
  // Spec Kit pointer to the active feature (source-only, never built).
  '.specify/feature.json',
  // Spec Kit feature folders (source-only design documents).
  'specs',
  'specs/001-salles-hybrides-2d-25d',
  'specs/001-salles-hybrides-2d-25d/contracts',
  'specs/001-salles-hybrides-2d-25d/checklists',
  'specs/002-cales-qz17-profondeur-combat',
  'specs/002-cales-qz17-profondeur-combat/checklists',
  'specs/002-cales-qz17-profondeur-combat/spec.md',
  'specs/002-cales-qz17-profondeur-combat/checklists/requirements.md',
  'specs/002-cales-qz17-profondeur-combat/plan.md',
  'specs/002-cales-qz17-profondeur-combat/research.md',
  'specs/002-cales-qz17-profondeur-combat/tasks.md',
  // V188 insertion / extraction cinematics (spec 003), source-only exact paths.
  'specs/003-insertion-extraction-cinematiques',
  'specs/003-insertion-extraction-cinematiques/checklists',
  'specs/003-insertion-extraction-cinematiques/spec.md',
  'specs/003-insertion-extraction-cinematiques/checklists/requirements.md',
  'specs/003-insertion-extraction-cinematiques/plan.md',
  'specs/003-insertion-extraction-cinematiques/tasks.md',
  // V188 more mission holds in depth (spec 004), source-only exact paths.
  'specs/004-cales-profondeur-suite',
  'specs/004-cales-profondeur-suite/checklists',
  'specs/004-cales-profondeur-suite/spec.md',
  'specs/004-cales-profondeur-suite/checklists/requirements.md',
  'specs/004-cales-profondeur-suite/plan.md',
  'specs/004-cales-profondeur-suite/research.md',
  'specs/004-cales-profondeur-suite/tasks.md',
  'scripts/verify-depth-holds-v188.mjs',
  // V188 content gaps (spec 005), source-only exact paths.
  'specs/005-front-asphodele-quetes',
  'specs/005-front-asphodele-quetes/checklists',
  'specs/005-front-asphodele-quetes/spec.md',
  'specs/005-front-asphodele-quetes/checklists/requirements.md',
  'specs/005-front-asphodele-quetes/plan.md',
  'specs/005-front-asphodele-quetes/research.md',
  'specs/005-front-asphodele-quetes/tasks.md',
  'scripts/verify-content-gaps-v188.mjs',
  // V188 Asphodèle second hub (spec 007), source-only exact paths.
  'specs/007-hub-asphodele',
  'specs/007-hub-asphodele/checklists',
  'specs/007-hub-asphodele/spec.md',
  'specs/007-hub-asphodele/checklists/requirements.md',
  'specs/007-hub-asphodele/plan.md',
  'specs/007-hub-asphodele/research.md',
  'specs/007-hub-asphodele/tasks.md',
  'scripts/verify-asphodele-hub-v188.mjs',
  'scripts/qa-asphodele-hub-v188.mjs',
  // V188 Asphodèle follow-up (spec 007): second suite and browser QA, source-only exact paths.
  'scripts/verify-asphodele-hub-2-v188.mjs',
  'scripts/qa-asphodele-hub-2-v188.mjs',
  // V188 Act V, endings and epilogue (spec 006), source-only exact paths.
  'specs/006-acte-v-fins',
  'specs/006-acte-v-fins/checklists',
  'specs/006-acte-v-fins/spec.md',
  'specs/006-acte-v-fins/checklists/requirements.md',
  'specs/006-acte-v-fins/plan.md',
  'specs/006-acte-v-fins/research.md',
  'specs/006-acte-v-fins/tasks.md',
  'scripts/verify-act5-endings-v188.mjs',
  'scripts/verify-act5-convoy-race-v188.mjs',
  'scripts/qa-act5-convoy-race-v188.mjs',
  'scripts/verify-colony-crew-v188.mjs',
  // V188 dedicated colony levels C1-C4: suite and spec, source-only exact paths.
  'scripts/verify-colony-levels-v188.mjs',
  'scripts/qa-colony-levels-v188.mjs',
  'specs/008-niveaux-colonie',
  'specs/008-niveaux-colonie/spec.md',
  'specs/008-niveaux-colonie/plan.md',
  'specs/008-niveaux-colonie/tasks.md',
  // V188 dedicated Asphodèle station levels S1-S4: suite, browser QA and spec, source-only exact paths.
  'scripts/verify-station-levels-v188.mjs',
  'scripts/qa-station-levels-v188.mjs',
  'specs/009-niveaux-station',
  'specs/009-niveaux-station/spec.md',
  'specs/009-niveaux-station/plan.md',
  'specs/009-niveaux-station/tasks.md',
  'scripts/qa-colony-crew-v188.mjs',
  'docs/development/INSERTION_ART_SLOTS_V188.md',
  'docs/development/INSERTION_ART_PROVENANCE_20261116.json',
  'docs/development/INSERTION_ART_QA_20261116.md',
  'docs/development/INSERTION_ART_ATMOSPHERE_20261116.png',
  'docs/development/INSERTION_ART_AIRLESS_20261116.png',
  'docs/development/INSERTION_ART_SPACE_20261116.png',
  'docs/development/INSERTION_ART_INTERIORS_20261116.png',
  'docs/development/INSERTION_ART_RENDER_RECEIPT_20261116.json',
  'docs/development/DEPTH_HOLD_ART_PROVENANCE_20261116.json',
  'docs/development/DEPTH_HOLD_ART_QA_20261116.md',
  'docs/development/DEPTH_HOLD_ART_OVERVIEW_20261116.png',
  'docs/development/DEPTH_HOLD_ART_RENDER_RECEIPT_20261116.json',
  'docs/development/COLONY_ART_PROVENANCE_20261116.json',
  'docs/development/COLONY_ART_QA_20261116.md',
  'docs/development/COLONY_ART_OVERVIEW_20261116.png',
  'docs/development/COLONY_PORTRAITS_OVERVIEW_20261116.png',
  'docs/development/COLONY_ART_RENDER_RECEIPT_20261116.json',
  'docs/development/ASPHODELE_ART_PROVENANCE_20261116.json',
  'docs/development/ASPHODELE_ART_QA_20261116.md',
  'docs/development/ASPHODELE_ART_OVERVIEW_20261116.png',
  'docs/development/ASPHODELE_ART_RENDER_RECEIPT_20261116.json',
  'docs/development/ASPHODELE_ART_PRIMITIVE_REFERENCE_20261116.png',
  'docs/development/ASPHODELE_MISSION_ART_PROVENANCE_20261116.json',
  'docs/development/ASPHODELE_MISSION_ART_QA_20261116.md',
  'docs/development/ASPHODELE_MISSION_ART_OVERVIEW_20261116.png',
  'docs/development/ASPHODELE_MISSION_ART_RENDER_RECEIPT_20261116.json',
  'docs/development/ASPHODELE_MISSION_ART_PRIMITIVE_REFERENCE_20261116.png',
  'docs/development/ASPHODELE_HUB_WALL_ART_PROVENANCE_20261117.json',
  'docs/development/ASPHODELE_HUB_WALL_ART_QA_20261117.md',
  'docs/development/ASPHODELE_HUB_WALL_ART_OVERVIEW_20261117.png',
  'docs/development/ASPHODELE_HUB_WALL_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/ASPHODELE_HUB_DETAIL_ART_PROVENANCE_20261117.json',
  'docs/development/ASPHODELE_HUB_DETAIL_ART_QA_20261117.md',
  'docs/development/ASPHODELE_HUB_DETAIL_ART_OVERVIEW_20261117.png',
  'docs/development/ASPHODELE_HUB_DETAIL_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/ASPHODELE_CINEMATIC_ART_PROVENANCE_20261117.json',
  'docs/development/ASPHODELE_CINEMATIC_ART_QA_20261117.md',
  'docs/development/ASPHODELE_CINEMATIC_ART_OVERVIEW_20261117.png',
  'docs/development/ASPHODELE_CINEMATIC_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/ACT5_ART_PROVENANCE_20261117.json',
  'docs/development/ACT5_ART_QA_20261117.md',
  'docs/development/ACT5_ART_OVERVIEW_20261117.png',
  'docs/development/ACT5_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/BIOLOGICAL_ART_PROVENANCE_20261117.json',
  'docs/development/BIOLOGICAL_ART_QA_20261117.md',
  'docs/development/BIOLOGICAL_ART_OVERVIEW_20261117.png',
  'docs/development/BIOLOGICAL_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/PROLOGUE_ART_PROVENANCE_20261117.json',
  'docs/development/PROLOGUE_ART_QA_20261117.md',
  'docs/development/PROLOGUE_ART_OVERVIEW_20261117.png',
  'docs/development/PROLOGUE_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/PORT_QUAY_ART_PROVENANCE_20261117.json',
  'docs/development/PORT_QUAY_ART_QA_20261117.md',
  'docs/development/PORT_QUAY_ART_OVERVIEW_20261117.png',
  'docs/development/PORT_QUAY_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/CARGO_ABYSS_ART_PROVENANCE_20261117.json',
  'docs/development/CARGO_ABYSS_ART_QA_20261117.md',
  'docs/development/CARGO_ABYSS_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/CARGO_ABYSS_ART_OVERVIEW_20261117.png',
  'docs/development/HADAL_ART_PROVENANCE_20261117.json',
  'docs/development/HADAL_ART_QA_20261117.md',
  'docs/development/HADAL_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/HADAL_ART_OVERVIEW_20261117.png',
  'docs/development/BROODSTORM_QUEEN_ART_PROVENANCE_20261117.json',
  'docs/development/BROODSTORM_QUEEN_ART_QA_20261117.md',
  'docs/development/BROODSTORM_QUEEN_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/BROODSTORM_QUEEN_ART_OVERVIEW_20261117.png',
  'docs/development/QUEEN_MOTHER_ART_PROVENANCE_20261117.json',
  'docs/development/QUEEN_MOTHER_ART_QA_20261117.md',
  'docs/development/QUEEN_MOTHER_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/QUEEN_MOTHER_ART_OVERVIEW_20261117.png',
  'docs/development/QUEEN_MOTHER_GUARD_ART_PROVENANCE_20261117.json',
  'docs/development/QUEEN_MOTHER_GUARD_ART_QA_20261117.md',
  'docs/development/QUEEN_MOTHER_GUARD_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/QUEEN_MOTHER_GUARD_ART_OVERVIEW_20261117.png',
  'docs/development/QUEEN_MOTHER_CHOIR_ART_PROVENANCE_20261117.json',
  'docs/development/QUEEN_MOTHER_CHOIR_ART_QA_20261117.md',
  'docs/development/QUEEN_MOTHER_CHOIR_ART_RENDER_RECEIPT_20261117.json',
  'docs/development/QUEEN_MOTHER_CHOIR_ART_OVERVIEW_20261117.png',
  'scripts/verify-colony-portraits-v188.mjs',
  'scripts/verify-insertion-cinematic-v188.mjs',
  'scripts/verify-mission-depth-v188.mjs',
  'scripts/verify-cinematic-coherence-v188.mjs',
  'scripts/verify-placeholder-portraits-v188.mjs',
  'scripts/verify-qz17-coherence-v188.mjs',
  'scripts/verify-quay-coherence-v188.mjs',
  'scripts/verify-cargo-matriarch-art-v188.mjs',
  'scripts/verify-manta-art-v188.mjs',
  'scripts/verify-hadal-player-art-v188.mjs',
  'scripts/verify-broodstorm-queen-art-v188.mjs',
  'scripts/verify-queen-mother-art-v188.mjs',
  'scripts/verify-queen-mother-guard-art-v188.mjs',
  'scripts/verify-queen-mother-choir-art-v188.mjs',
  'scripts/verify-prologue-rooms-v188.mjs',
  'scripts/verify-bugfix-campaign-v188.mjs',
  'scripts/verify-bugfix-first-hour-v188.mjs',
  'scripts/verify-bugfix-story-missions-v188.mjs',
  'scripts/verify-bugfix-hub-ui-v188.mjs',
  'scripts/verify-bugfix-interaction-v188.mjs',
  'scripts/verify-bugfix-mobile-ui-v188.mjs',
  'scripts/verify-bugfix-hub-story-v188.mjs',
  'scripts/verify-bugfix-i18n-v188.mjs',
  'scripts/verify-bugfix-systems-v188.mjs',
  'scripts/verify-bugfix-i18n-ui-v188.mjs',
  'scripts/verify-bugfix-missions-generic-v188.mjs',
  'scripts/verify-bugfix-interaction-modes-v188.mjs',
  'scripts/verify-bugfix-audio-settings-v188.mjs',
  'scripts/verify-bugfix-insertion-v188.mjs',
  'scripts/verify-dropship-handover-v188.mjs',
  'scripts/verify-bugfix-texts-v188.mjs',
  'scripts/verify-bugfix-playthrough-v188.mjs',
  'scripts/verify-bugfix-decisions-v188.mjs',
  'scripts/verify-bugfix-playthrough-modes-v188.mjs',
  // V188 mission VFX pass (slots + sourcing table), source-only exact paths.
  'scripts/verify-vfx-v188.mjs',
  'docs/development/VFX_V188.md',
  'scripts/verify-gameplay-gaps-v188.mjs',
  // V188 graphics audit fixes (items 12–17), source-only exact paths.
  'scripts/verify-visual-fixes-v188.mjs',
  'docs/development/VISUAL_FIXES_V188.md',
  // V188 creature scale (owner decision 2026-11-16), source-only exact path.
  'scripts/verify-creature-scale-v188.mjs',
  'specs/001-salles-hybrides-2d-25d/spec.md',
  'specs/001-salles-hybrides-2d-25d/plan.md',
  'specs/001-salles-hybrides-2d-25d/research.md',
  'specs/001-salles-hybrides-2d-25d/data-model.md',
  'specs/001-salles-hybrides-2d-25d/quickstart.md',
  'specs/001-salles-hybrides-2d-25d/tasks.md',
  'specs/001-salles-hybrides-2d-25d/contracts/hub-depth-room.md',
  'specs/001-salles-hybrides-2d-25d/checklists/requirements.md',
  'docs/development/PRIORITIES_P0_P1_V188.md',
  // V188 owner decision questionnaire, source-only exact path.
  'docs/development/QUESTIONS_PROPRIETAIRE_V188.md',
  // V188 content audit (bible against code), source-only exact path.
  'docs/development/AUDIT_CONTENU_V188.md',
  // Source-only narrative design bible; never shipped in a built distribution.
  'docs/narrative',
  'docs/narrative/CAMPAGNE_PRINCIPALE.md',
  // Narrow, source-only admission for the arsenal specification; not shipped.
  'docs/arsenal',
  'docs/arsenal/README.md',
  'docs/arsenal/progress-v177.json',
  'docs/arsenal/ARSENAL_SUIVI_V177.xlsx',
  'docs/arsenal/ALIENS_TANTALUS_ARSENAL_EXHAUSTIF_SYSTEME_V1.xlsx',
  'docs/arsenal/weapon_system_contract_v1.json',
  'docs/arsenal/data',
  'docs/arsenal/data/tantalus_arsenal_master_v1.csv',
  'docs/arsenal/data/tantalus_arsenal_qa_v1.csv',
  'docs/arsenal/data/tantalus_weapon_evidence_backlog_v170.csv',
  'docs/forge/xeno-trials/V168-DIALOGUE-AND-TANTALUS-BATCH100.md',
  'docs/forge/xeno-trials/batch100-v168.json',
  'docs/forge/xeno-trials/batch100-v177.json',
  'docs/forge/xeno-trials/batch40-v179.json',
  'docs/forge/xeno-trials/campaign-art-v180.json',
  'docs/forge/xeno-trials/V180-SIMULTANEOUS-HORDE.md',
  'docs/forge/xeno-trials/batch40-v180.json',
  'docs/forge/xeno-trials/i18n-trials-review-v186.json',
  'docs/forge/xeno-trials/i18n-operations-review-v188.json',
  'docs/forge/xeno-trials/sprite-production-v188.json',
  'docs/forge/xeno-trials/V188-STAGE-OPERATIONS.md',
  'docs/forge/xeno-trials/operations-completion-v188.json',
  'docs/forge/xeno-trials/V192-FRANCHISE-STAGES-50.md',
  'docs/forge/xeno-trials/franchise-stage-completion-v192.json',
  'docs/forge/xeno-trials/franchise-stage-sources-v192.json',
  'docs/forge/xeno-trials/franchise-stage-art-production-v192.json',
  'docs/forge/xeno-trials/i18n-franchise-stages-review-v192.json',
  'docs/forge/xeno-trials/V192-FRANCHISE-STAGES-50.md',
  'docs/forge/xeno-trials/V191-ARBITER-PROTOCOLS-ANIMATION.md',
  'docs/forge/xeno-trials/arbiter-protocols-completion-v191.json',
  'docs/forge/xeno-trials/sprite-combat-production-v191.json',
  'docs/forge/xeno-trials/sprite-special-production-v191.json',
  'docs/forge/xeno-trials/animation-coverage-v191.json',
  'docs/forge/xeno-trials/i18n-arbiter-protocols-review-v191.json',
  'docs/forge/xeno-trials/V190-ARBITER-CAMPAIGN.md',
  'docs/forge/xeno-trials/arbiter-campaign-completion-v190.json',
  'docs/forge/xeno-trials/stage-art-production-v190.json',
  'docs/forge/xeno-trials/campaign-art-production-v190.json',
  'docs/forge/xeno-trials/i18n-arbiter-review-v190.json',
  'docs/forge/xeno-trials/V189-ANIMATION-AUDIO.md',
  'docs/forge/xeno-trials/animation-audio-completion-v189.json',
  'docs/forge/xeno-trials/i18n-animation-audio-review-v189.json',
  'docs/forge/xeno-trials/animation-coverage-v189.json',
  'docs/forge/xeno-trials/sprite-production-v189.json',
  'docs/forge/xeno-trials/sprite-motion-production-v189.json',
  'docs/forge/xeno-trials/V186-XENO-COMPLETION.md',
  'docs/forge/xeno-trials/completion-v186.json',
  'docs/forge/xeno-trials/V179-XENO-TRIALS-BATCH40.md',
  'docs/forge/xeno-trials/V167-HUMAN-MOVEMENT-AND-DOOR-SIGNS.md',
  'docs/forge/xeno-trials/V166-STATION-RELAYS.md',
  'docs/forge/xeno-trials/V165-PARALLEL-COMPLETION.md',
  'docs/forge/xeno-trials/V164-NPC-MATTE.md',
  'docs/forge/xeno-trials/V163-EXCEL-COMPLETION.md',
  'docs/forge/xeno-trials/progress-v163.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V163.xlsx',
  '.github/workflows/non-forge-regression-v163.yml',
  'docs/forge/xeno-trials/V162-NON-FORGE-CONTINUATION.md',
  'docs/forge/xeno-trials/progress-v162.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V162.xlsx',
  'docs/forge/xeno-trials/V161-REMAINING-WORKSTREAMS.md',
  'docs/forge/xeno-trials/progress-v161.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V161.xlsx',
  'docs/forge/xeno-trials/V160-PLAYER-TRACKER-CAMPAIGN.md',
  'docs/forge/xeno-trials/progress-v160.json',
  'docs/forge/xeno-trials/references-v160.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V160.xlsx',
  'docs/forge/xeno-trials/V159-CIRCULATION.md',
  'docs/forge/xeno-trials/progress-v159.json',
  'docs/forge/xeno-trials/references-v159.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V159.xlsx',
  'docs/forge/xeno-trials/V158-CONTINUATION.md',
  'docs/forge/xeno-trials/progress-v158.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V158.xlsx',
  'docs/forge/xeno-trials/V157-CONTINUATION.md',
  'docs/forge/xeno-trials/progress-v157.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V157.xlsx',
  '.github', '.github/workflows', '.github/workflows/forge-regression.yml',
  '.github/workflows/trials-source-review-v154.yml',
  '.github/workflows/non-forge-regression-v162.yml',
  'docs/forge/xeno-trials/V156-CONTINUATION.md',
  'docs/forge/xeno-trials/progress-v156.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V156.xlsx',
  'docs/forge/xeno-trials/V155-SEQUENCES.md',
  'docs/forge/xeno-trials/progress-v155.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V155.xlsx',
  'docs/forge/xeno-trials/V154-NATIVE-RIGS.md',
  'docs/forge/xeno-trials/progress-v154.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V154.xlsx',
  '.github/workflows/full-release-v143.yml', 'docs/forge/V143-AUDIT-FIXES.md', 'docs/forge/V145-XENO-TRIALS.md',
  'docs/forge/xeno-trials/V149-FEEDBACK.md',
  'docs/forge/xeno-trials/progress-v149.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V149.xlsx',
  'docs/forge/xeno-trials',
  'docs/forge/xeno-trials/V153-PROWLER-RESTRAINT.md',
  'docs/forge/xeno-trials/progress-v153.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V153.xlsx',
  'docs/forge/xeno-trials/V152-ACID-POOLS.md',
  'docs/forge/xeno-trials/progress-v152.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V152.xlsx',
  'docs/forge/xeno-trials/V151-FIRETEAM-CASTES.md',
  'docs/forge/xeno-trials/progress-v151.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V151.xlsx',
  'docs/forge/xeno-trials/README.md',
  'docs/forge/xeno-trials/V147-SIGNATURES.md',
  'docs/forge/xeno-trials/V148-SUPERS.md',
  'docs/forge/xeno-trials/progress-v148.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V148.xlsx',
  'docs/forge/xeno-trials/progress-v147.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V147.xlsx',
  'docs/forge/xeno-trials/manifest-v146.json',
  'docs/forge/xeno-trials/xeno-trials-plan-v146.json',
  'docs/forge/xeno-trials/ALIENS_TANTALUS_XENO_TRIALS_PLAN_V146.xlsx',
  'docs/forge/xeno-trials/V150-CONTROLS.md',
  'docs/forge/xeno-trials/progress-v150.json',
  'docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V150.xlsx',
  'docs', 'docs/forge', 'docs/forge/QA-V130.md', 'docs/forge/README-V130.md',
  'docs/forge/V133-AUTHORING.md', 'docs/forge/V134-NAVIGATION.md',
  'docs/forge/V135-CONSTRUCTION.md', 'docs/forge/V136-CONTROLE-ET-VERSIONS.md',
  'scripts/fixtures', 'scripts/fixtures/forge-v130.html'
]);
const FORGE_STYLES_V140 = new Set([
  'src/forge-editor-v130.css', 'src/forge-workbench-v133.css',
  'src/forge-navigator-v134.css', 'src/forge-construction-v135.css', 'src/forge-control-v136.css'
]);
for (const file of [
  'forge-native-host-v136.mjs', 'editor-native-host-v140.mjs', 'forge-offline-harness-v130.py',
  'verify-forge-v130.mjs', 'verify-forge-v133.mjs', 'verify-forge-v134.mjs',
  'verify-forge-v135.mjs', 'verify-forge-v136.mjs', 'verify-forge-native-v136.mjs',
  'verify-forge-browser-v130.py', 'verify-forge-browser-v133.py', 'verify-forge-browser-v134.py',
  'verify-forge-browser-v135.py', 'verify-forge-browser-v136.py',
  'verify-forge-shell-v134.py', 'verify-forge-shell-v135.py', 'verify-forge-shell-v136.py',
  'verify-editor-modules-v140.mjs', 'verify-editor-ship-bounds-v140.mjs',
  'verify-enemy-patrol-v140.mjs', 'verify-npc-spacing-v140.mjs',
  'verify-player-wardrobe-parts-v140.mjs', 'verify-forge-native-v140.mjs',
  'verify-forge-release-v140.mjs', 'verify-forge-sandbox-v140.mjs',
  'qa-enemy-patrol-browser-v140.mjs', 'qa-wardrobe-parts-browser-v140.mjs',
  'verify-forge-journey-v141.mjs', 'verify-forge-admission-v141.mjs',
  'verify-forge-mission-v141.mjs', 'verify-forge-ship-v141.mjs', 'verify-forge-decoration-v141.mjs',
  'verify-enemy-distance-gait-v141.mjs', 'verify-hub-annex-npc-life-v141.mjs',
  'verify-player-colonial-art-v141.mjs', 'verify-forge-browser-journey-v141.py'
]) SCRIPT_FILES.add(file);
// Exact original-image paths from the V100 public reference registry. Naming
// a random JPG after a pack or recovery entry does not admit it to production.
const USER_REFERENCE_JPG_PATHS_V100 = new Set([
  'assets/user/pack-v100/alien-king-from-alien-extemrination.jpg',
  'assets/user/pack-v100/engineer-armorsuit.jpg',
  'assets/user/pack-v100/engineer-battlesuit.jpg',
  'assets/user/pack-v100/engineer-behemotsuit.jpg',
  'assets/user/pack-v100/engineer-blackgoo-jar.jpg',
  'assets/user/pack-v100/engineer-ceremonialsuit.jpg',
  'assets/user/pack-v100/engineer-mala-kak.jpg',
  'assets/user/pack-v100/engineer-original-space-jokey-variant.jpg',
  'assets/user/pack-v100/engineer-respirator.jpg',
  'assets/user/pack-v100/engineer-spacejokey.jpg',
  'assets/user/pack-v100/engineer-suit-open.jpg',
  'assets/user/pack-v100/engineer-wararmor.jpg',
  'assets/user/pack-v100/engineer-woman.jpg',
  'assets/user/pack-v100/enginner-blackgoo-vial.jpg',
  'assets/user/pack-v100/green-alien-king.jpg',
  'assets/user/pack-v100/synth-eloise.jpg',
  'assets/user/pack-v100/synth-jerri-1.jpg',
  'assets/user/pack-v100/synth-jerri-2.jpg',
  'assets/user/pack-v100/synth-workingjoe-battle.jpg',
  'assets/user/pack-v100/synth-workingjoe-classic.jpg',
  'assets/user/pack-v100/synth-workingjoe-hazmat.jpg',
  'assets/user/pack-v100/synth-workingjoe-tactical.jpg',
  'assets/user/pack-v100/wy-apesuit.jpg',
  'assets/user/pack-v100/wy-covenant-david.jpg',
  'assets/user/pack-v100/wy-prometheus-suit.jpg',
  'assets/user/pack-v100/xeno-6-chestbuster.jpg',
  'assets/user/pack-v100/xeno-6-praetorian.jpg',
  'assets/user/pack-v100/xeno-6-queen.jpg',
  'assets/user/pack-v100/xeno-6-warrior.jpg',
  'assets/user/pack-v100/xeno-albinos-drone-seven.jpg',
  'assets/user/pack-v100/xeno-bambibuster.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-chestburster.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-drone.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-egg.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-facehugger.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-praetorian.jpg',
  'assets/user/pack-v100/xeno-blueluminescent-queen.jpg',
  'assets/user/pack-v100/xeno-chestbusterpredalien-movie.jpg',
  'assets/user/pack-v100/xeno-chestbusterqueen-grown.jpg',
  'assets/user/pack-v100/xeno-cocoon-front.jpg',
  'assets/user/pack-v100/xeno-cocoon-side.jpg',
  'assets/user/pack-v100/xeno-cocoon.jpg',
  'assets/user/pack-v100/xeno-eggmorphing.jpg',
  'assets/user/pack-v100/xeno-gorillaxeno.jpg',
  'assets/user/pack-v100/xeno-insect-queen.jpg',
  'assets/user/pack-v100/xeno-insect-warrior.jpg',
  'assets/user/pack-v100/xeno-king-xeno.jpg',
  'assets/user/pack-v100/xeno-kingrogue.jpg',
  'assets/user/pack-v100/xeno-mutated-chestburster.jpg',
  'assets/user/pack-v100/xeno-mutated-egg.jpg',
  'assets/user/pack-v100/xeno-mutated-facehugger-sideview.jpg',
  'assets/user/pack-v100/xeno-mutated-facehugger.jpg',
  'assets/user/pack-v100/xeno-offspring-adult.jpg',
  'assets/user/pack-v100/xeno-offspring-egg.jpg',
  'assets/user/pack-v100/xeno-offspring-eggsack.jpg',
  'assets/user/pack-v100/xeno-originaldesign.jpg',
  'assets/user/pack-v100/xeno-ovomorph-breedingegg.jpg',
  'assets/user/pack-v100/xeno-ovomorph-hyperfertile-eggs.jpg',
  'assets/user/pack-v100/xeno-ovomorph-praetomorph.jpg',
  'assets/user/pack-v100/xeno-ovomorph-praetorian-eggs.jpg',
  'assets/user/pack-v100/xeno-ovomorph-red.jpg',
  'assets/user/pack-v100/xeno-palatine-littlemandible.jpg',
  'assets/user/pack-v100/xeno-palatine-mandible.jpg',
  'assets/user/pack-v100/xeno-palatine-tusk-2.jpg',
  'assets/user/pack-v100/xeno-palatine-tusk.jpg',
  'assets/user/pack-v100/xeno-praetorian-king.jpg',
  'assets/user/pack-v100/xeno-praetorian-rogue.jpg',
  'assets/user/pack-v100/xeno-protomorph-chestburster.jpg',
  'assets/user/pack-v100/xeno-queenmother-ovomorph.jpg',
  'assets/user/pack-v100/xeno-red-drone.jpg',
  'assets/user/pack-v100/xeno-red-queenchestbuster-1.jpg',
  'assets/user/pack-v100/xeno-rotenline-larvae.jpg',
  'assets/user/pack-v100/xeno-royal-facehugger-alternate-to-repair.jpg',
  'assets/user/pack-v100/xeno-sewer-drone.jpg',
  'assets/user/pack-v100/xeno-sewer-praetorian.jpg',
  'assets/user/pack-v100/xeno-sewer-queen.jpg',
  'assets/user/pack-v100/xeno-sewer-warrior.jpg',
  'assets/user/pack-v100/xeno-spacejockey.jpg',
  'assets/user/pack-v100/xeno-spacejokeygiant.jpg',
  'assets/user/pack-v100/xeno-titan-drone-legs.jpg',
  'assets/user/pack-v100/xeno-titan-drone-no-legs.jpg',
  'assets/user/pack-v100/xeno-titan-queen-legs.jpg',
  'assets/user/pack-v100/xeno-titan-queen-nolegs.jpg',
  'assets/user/pack-v100/xeno-toadpole.jpg',
  'assets/user/pack-v100/xeno-xenoearth-drone.jpg',
  'assets/user/pack-v100/xeno-xenoearth-juvenile.jpg',
  'assets/user/pack-v100/xeno-xenoearth-ovomorph.jpg',
  'assets/user/pack-v100/xeno-xenoearth-warrior.jpg',
  'assets/user/recovery-v100/bipede-biomecanique-brun-10.jpg',
  'assets/user/recovery-v100/neomorph-neomorph.jpg',
  'assets/user/recovery-v100/reference-composite-09.jpg',
  'assets/user/recovery-v100/xeno-abobimantion.jpg',
  'assets/user/recovery-v100/xeno-big-xeno-2.jpg',
  'assets/user/recovery-v100/xeno-bruiser-mecha.jpg',
  'assets/user/recovery-v100/xeno-carrier-empty.jpg',
  'assets/user/recovery-v100/xeno-drone-variante.jpg',
  'assets/user/recovery-v100/xeno-experiment-3headed.jpg',
  'assets/user/recovery-v100/xeno-experiment-xeno3head.jpg',
  'assets/user/recovery-v100/xeno-necromorph.jpg',
  'assets/user/recovery-v100/xeno-praetorian-1.jpg',
  'assets/user/recovery-v100/xeno-prowler.jpg',
  'assets/user/recovery-v100/xeno-serpentin-46.jpg',
  'assets/user/recovery-v100/xeno-snake.jpg',
  'assets/user/recovery-v100/xeno-soldier-brown.jpg',
  'assets/user/recovery-v100/xeno-spitter.jpg'
]);
const PRIVATE_SEGMENT = /^(?:docs?|tests?|captures?|screenshots?|exports?|references?|reference-masters|raw|frames|previews|metadata|node_modules|dist|\.git|\.vercel|\.env.*|\.qa.*|\.tmp.*)$/i;
const PRIVATE_FILENAME = /(?:^|[-_.])(?:audit|report|reports|prompt|prompts|receipt|receipts|capture|captures|screenshot|screenshots|export|exports|qa)(?:[-_.]|$)/i;
const AUDIO_FILES = new Set(Object.entries(AUDIO_SLOTS_V77).flatMap(([kind, ids]) => ids.flatMap(id =>
  AUDIO_FORMATS_V77.map(format => `assets/audio/${kind}/${id}.${format.extension}`))));
const PRIVATE_TEXT = [
  /chatgpt\.com(?:[/?#]|$)/i,
  /g-p-[a-f0-9]{16,}/i,
  /(?<![a-z])[a-z]:[\\/]+[^\s'"<>]+/i,
  /(?:\/Users\/|\/home\/)[a-z0-9._-]+\//i,
  /\.codex[\\/]|codex[-]remote[-]attachments/i,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
  /\b(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,})\b/,
  /(?:^|[\s,{])["']?(?:chatId|chatTitle|sourceProjectId|sourceConversation|promptDocument|promptPath|generationPrompt|privatePrompt)["']?\s*:/m,
  /['"]V\d+_(?:BATCH_\d+|[A-Z_]*IMAGEGEN)/
];

// V188 AI development tooling (Spec Kit, Claude Code Game Studios) stays
// source-only: exact adopted paths from .ai-tools/adopted-v188.json and their
// parent directories, never admitted in a built distribution.
const AI_TOOLS_ADOPTED_V188 = (() => {
  const manifest = JSON.parse(readFileSync(new URL('../.ai-tools/adopted-v188.json', import.meta.url), 'utf8'));
  const paths = new Set(['.ai-tools/adopted-v188.json']);
  for (const tool of manifest.tools) for (const { path } of tool.files) {
    const segments = path.split('/');
    for (let index = 1; index <= segments.length; index++) paths.add(segments.slice(0, index).join('/'));
  }
  for (const root of ['docs', '.ai-tools']) paths.delete(root);
  return Object.freeze(paths);
})();
const AI_TOOLS_FILE_SHA256_V188 = new Map(JSON.parse(readFileSync(new URL('../.ai-tools/adopted-v188.json', import.meta.url), 'utf8'))
  .tools.flatMap(tool => tool.files.map(({ path, sha256 }) => [path, sha256])));
export const AI_TOOLS_SOURCE_ONLY_PATHS_V188 = AI_TOOLS_ADOPTED_V188;
// Merge of the Xeno Trials line into the Tantalus line: the exact catalogue delta
// record used by the Xeno Trials i18n tests stays source-only.
const TANTALUS_XENO_MERGE_SOURCE_ONLY_V188 = new Set(['scripts/i18n-tantalus-xeno-merge-v188.mjs']);

const XENO_PRODUCTION_SOURCE_ONLY_V206 = new Set([
  'scripts/audit-xeno-production-assets-v206.mjs',
  'scripts/public-xeno-production-admissions-v206.mjs',
  'scripts/verify-xeno-production-assets-v206.mjs',
  'docs/forge/xeno-trials/ASSET_LOT_V206.json',
  'docs/forge/xeno-trials/V206-ASSETS.md'
]);

const XENO_VISUAL_SOURCE_ONLY_V205 = new Set([
  'scripts/audit-xeno-visual-assets-v205.mjs',
  'scripts/public-xeno-visual-admissions-v205.mjs',
  'scripts/verify-xeno-trials-visual-assets-v205.mjs',
  'scripts/verify-xeno-visual-assets-audit-v205.mjs',
  'docs/forge/xeno-trials/ASSET_LOT_V205.json',
  'docs/forge/xeno-trials/V205-ASSETS.md'
]);

const XENO_PRIORITIES_SOURCE_ONLY_V204 = new Set([
  'docs/forge/xeno-trials/V204-PRIORITIES.md',
  'scripts/audit-xeno-priorities-v204.mjs',
  'scripts/verify-xeno-priorities-audit-v204.mjs',
  'scripts/verify-xeno-trials-priority-actions-v204.mjs',
  'scripts/verify-xeno-trials-purge-presentation-v204.mjs',
  'scripts/verify-xeno-trials-defense-v204.mjs',
  'scripts/public-xeno-priority-admissions-v204.mjs'
]);

const XENO_PRIORITIES_SOURCE_ONLY_V203 = new Set([
  'docs/forge/xeno-trials/V203-PRIORITIES.md',
  'scripts/audit-xeno-priorities-v203.mjs',
  'scripts/verify-xeno-priorities-audit-v203.mjs',
  'scripts/verify-xeno-trials-priority-actions-v203.mjs',
  'scripts/verify-xeno-trials-extraction-presentation-v203.mjs',
  'scripts/verify-xeno-trials-defense-v203.mjs',
  'scripts/public-xeno-priority-admissions-v203.mjs'
]);

const XENO_PRIORITIES_SOURCE_ONLY_V202 = new Set([
  'docs/forge/xeno-trials/V202-PRIORITIES.md',
  'scripts/audit-xeno-priorities-v202.mjs',
  'scripts/verify-xeno-priorities-audit-v202.mjs',
  'scripts/verify-xeno-trials-priority-actions-v202.mjs',
  'scripts/verify-xeno-trials-beacon-windows-v202.mjs',
  'scripts/verify-xeno-trials-rig-v202.mjs',
  'scripts/public-xeno-priority-admissions-v202.mjs'
]);

const XENO_PRIORITIES_SOURCE_ONLY_V201 = new Set([
  'docs/forge/xeno-trials/V201-PRIORITIES.md',
  'scripts/audit-xeno-priorities-v201.mjs',
  'scripts/verify-xeno-priorities-audit-v201.mjs',
  'scripts/verify-xeno-trials-priority-actions-v201.mjs',
  'scripts/verify-xeno-trials-reinforcements-v201.mjs',
  'scripts/verify-xeno-trials-rig-v201.mjs',
  'scripts/public-xeno-priority-admissions-v201.mjs'
]);

const XENO_SUPERS_SOURCE_ONLY_V200 = new Set([
  'docs/forge/xeno-trials/V200-SUPERS.md',
  'scripts/audit-xeno-supers-v200.mjs',
  'scripts/verify-xeno-supers-audit-v200.mjs',
  'scripts/verify-xeno-trials-supers-v200.mjs',
  'scripts/public-xeno-super-admissions-v200.mjs'
]);

const XENO_PRIORITIES_SOURCE_ONLY_V199 = new Set([
  'docs/forge/xeno-trials/V199-PRIORITIES.md',
  'scripts/audit-xeno-priorities-v199.mjs',
  'scripts/public-xeno-action-admissions-v199.mjs',
  'scripts/verify-xeno-priorities-audit-v199.mjs',
  'scripts/verify-xeno-trials-actions-v199.mjs',
  'scripts/verify-xeno-trials-rig-v199.mjs'
]);

const XENO_PRIORITY_STAGES_SOURCE_ONLY_V198 = new Set([
  'docs/forge/xeno-trials/V198-PRIORITY-STAGES.md',
  'scripts/audit-xeno-priority-stages-v198.mjs',
  'scripts/public-xeno-priority-stage-admissions-v198.mjs',
  'scripts/verify-xeno-priority-stages-audit-v198.mjs',
  'scripts/verify-xeno-priority-stages-v198.mjs'
]);

const XENO_PRIORITIES_SOURCE_ONLY_V197 = new Set([
  'docs/forge/xeno-trials/V197-PRIORITIES.md',
  'scripts/audit-xeno-priorities-v197.mjs',
  'scripts/public-xeno-sprite-admissions-v197.mjs',
  'scripts/verify-xeno-priorities-audit-v197.mjs',
  'scripts/verify-xeno-trials-priorities-v197.mjs',
  'scripts/verify-xeno-trials-duel-checkpoint-v197.mjs',
  'scripts/verify-xeno-trials-pilot-sequences-v197.mjs',
  'scripts/verify-xeno-trials-rig-v197.mjs'
]);

const XENO_REFERENCED_STAGE_SOURCE_ONLY_V196 = new Set([
  'docs/forge/xeno-trials/V196-REFERENCED-FILM-STAGES.md',
  'scripts/public-xeno-referenced-stage-admissions-v196.mjs',
  'scripts/audit-xeno-referenced-film-stages-v196.mjs',
  'scripts/verify-xeno-referenced-film-stages-audit-v196.mjs',
  'scripts/verify-xeno-referenced-film-stages-v196.mjs'
]);

const XENO_STAGE_CLASSIFICATION_SOURCE_ONLY_V195 = new Set([
  'docs/forge/xeno-trials/V195-STAGE-CLASSIFICATION.md',
  'scripts/audit-xeno-stage-classification-v195.mjs',
  'scripts/verify-xeno-stage-classification-audit-v195.mjs'
]);

const XENO_ICONIC_STAGE_SOURCE_ONLY_V194 = new Set([
  'docs/forge/xeno-trials/V194-ICONIC-STAGES.md',
  'scripts/public-xeno-iconic-stage-admissions-v194.mjs',
  'scripts/audit-xeno-iconic-stages-v194.mjs',
  'scripts/verify-xeno-iconic-stages-audit-v194.mjs',
  'scripts/verify-xeno-iconic-stages-v194.mjs'
]);

const XENO_ORIGINAL_ARENA_SOURCE_ONLY_V193 = new Set([
  'docs/forge/xeno-trials/V193-ORIGINAL-ARENAS.md',
  'scripts/public-xeno-original-arena-admissions-v193.mjs',
  'scripts/audit-xeno-original-arenas-v193.mjs',
  'scripts/verify-xeno-original-arenas-audit-v193.mjs',
  'scripts/verify-xeno-original-arenas-v193.mjs'
]);

// Pure checks are exported so adversarial cases can be verified without placing
// private fixtures anywhere inside the distribution tree.
export function isPublicDistributionPathV86(path, { directory = false, built = false } = {}) {
  const recoveryAdmission = projectRecoveryPathAdmission20261116(path, { directory, built });
  if (recoveryAdmission !== null) return recoveryAdmission;
  if (typeof path !== 'string' || !path || path.includes('\\') || path.startsWith('/')) return false;
  if (TANTALUS_XENO_MERGE_SOURCE_ONLY_V188.has(path)) return !built;
  if (XENO_PRODUCTION_SOURCE_ONLY_V206.has(path)) return !built;
  const productionAdmissionV206 = publicXenoProductionPathAdmissionV206(path, { directory, built });
  if (productionAdmissionV206 !== null) return productionAdmissionV206;
  if (XENO_VISUAL_SOURCE_ONLY_V205.has(path)) return !built;
  const visualAdmissionV205 = publicXenoVisualPathAdmissionV205(path, { directory, built });
  if (visualAdmissionV205 !== null) return visualAdmissionV205;
  if (XENO_PRIORITIES_SOURCE_ONLY_V204.has(path)) return !built;
  if (XENO_PRIORITIES_SOURCE_ONLY_V203.has(path)) return !built;
  if (XENO_PRIORITIES_SOURCE_ONLY_V202.has(path)) return !built;
  if (XENO_PRIORITIES_SOURCE_ONLY_V201.has(path)) return !built;
  if (XENO_SUPERS_SOURCE_ONLY_V200.has(path)) return !built;
  if (XENO_PRIORITIES_SOURCE_ONLY_V199.has(path)) return !built;
  if (XENO_PRIORITY_STAGES_SOURCE_ONLY_V198.has(path)) return !built;
  if (XENO_PRIORITIES_SOURCE_ONLY_V197.has(path)) return !built;
  if (XENO_REFERENCED_STAGE_SOURCE_ONLY_V196.has(path)) return !built;
  if (XENO_STAGE_CLASSIFICATION_SOURCE_ONLY_V195.has(path)) return !built;
  if (XENO_ICONIC_STAGE_SOURCE_ONLY_V194.has(path)) return !built;
  if (XENO_ORIGINAL_ARENA_SOURCE_ONLY_V193.has(path)) return !built;
  if (V179_SOURCE_ONLY_SCRIPTS.has(path)) return !built;
  if (XENO_COMPLETION_SOURCE_ONLY_V186.has(path)) return !built;
  if (XENO_OPERATIONS_SOURCE_ONLY_V188.has(path)) return !built;
  if (XENO_ARBITER_SOURCE_ONLY_V191.has(path)) return !built;
  if (XENO_ARBITER_SOURCE_ONLY_V190.has(path)) return !built;
  if (XENO_ANIMATION_SOURCE_ONLY_V189.has(path)) return !built;
  if (!built && FORGE_TOOLING_V140.has(path)) return true;
  if (!built && AI_TOOLS_ADOPTED_V188.has(path)) return true;
  if (FORGE_STYLES_V140.has(path)) return true;
  const segments = path.split('/');
  if (segments.some(part => !part || part === '.' || part === '..' || PRIVATE_SEGMENT.test(part))) return false;
  const priorityAdmissionV204 = publicXenoPriorityPathAdmissionV204(path, { directory });
  if (priorityAdmissionV204 !== null) return priorityAdmissionV204;
  const priorityAdmissionV203 = publicXenoPriorityPathAdmissionV203(path, { directory });
  if (priorityAdmissionV203 !== null) return priorityAdmissionV203;
  const priorityAdmissionV202 = publicXenoPriorityPathAdmissionV202(path, { directory });
  if (priorityAdmissionV202 !== null) return priorityAdmissionV202;
  const priorityAdmissionV201 = publicXenoPriorityPathAdmissionV201(path, { directory });
  if (priorityAdmissionV201 !== null) return priorityAdmissionV201;
  const superAdmissionV200 = publicXenoSuperPathAdmissionV200(path, { directory });
  if (superAdmissionV200 !== null) return superAdmissionV200;
  const actionAdmissionV199 = publicXenoActionPathAdmissionV199(path, { directory });
  if (actionAdmissionV199 !== null) return actionAdmissionV199;
  const spriteAdmissionV197 = publicXenoSpritePathAdmissionV197(path, { directory });
  if (spriteAdmissionV197 !== null) return spriteAdmissionV197;
  const spriteAdmissionV191 = publicXenoSpritePathAdmissionV191(path, { directory });
  if (spriteAdmissionV191 !== null) return spriteAdmissionV191;
  const priorityStageAdmissionV198 = publicXenoPriorityStagePathAdmissionV198(path, { directory });
  if (priorityStageAdmissionV198 !== null) return priorityStageAdmissionV198;
  const referencedStageAdmissionV196 = publicXenoReferencedStagePathAdmissionV196(path, { directory });
  if (referencedStageAdmissionV196 !== null) return referencedStageAdmissionV196;
  const iconicStageAdmissionV194 = publicXenoIconicStagePathAdmissionV194(path, { directory });
  if (iconicStageAdmissionV194 !== null) return iconicStageAdmissionV194;
  const originalArenaAdmissionV193 = publicXenoOriginalArenaPathAdmissionV193(path, { directory });
  if (originalArenaAdmissionV193 !== null) return originalArenaAdmissionV193;
  const franchiseAdmissionV192 = publicXenoFranchiseStagePathAdmissionV192(path, { directory });
  if (franchiseAdmissionV192 !== null) return franchiseAdmissionV192;
  const arbiterAdmissionV190 = publicArbiterPathAdmissionV190(path, { directory });
  if (arbiterAdmissionV190 !== null) return arbiterAdmissionV190;
  const costumeAdmissionV165 = publicCostumePathAdmissionV165(path, { directory });
  if (costumeAdmissionV165 !== null) return costumeAdmissionV165;
  const xenoSpriteAdmissionV189 = publicXenoSpritePathAdmissionV189(path, { directory });
  if (xenoSpriteAdmissionV189 !== null) return xenoSpriteAdmissionV189;
  const xenoSpriteAdmissionV188 = publicXenoSpritePathAdmissionV188(path, { directory });
  if (xenoSpriteAdmissionV188 !== null) return xenoSpriteAdmissionV188;
  const campaignAdmissionV180 = publicCampaignArtPathAdmissionV180(path, { directory });
  if (campaignAdmissionV180 !== null) return campaignAdmissionV180;
  const v163Admission = publicReleasePathAdmissionV163(path, { directory });
  if (v163Admission !== null) return v163Admission;
  const v123Admission = publicReleasePathAdmissionV123(path, { directory });
  if (v123Admission !== null) return v123Admission;
  const v122Admission = publicReleasePathAdmissionV122(path, { directory });
  if (v122Admission !== null) return v122Admission;
  const v121Admission = publicReleasePathAdmissionV121(path, { directory });
  if (v121Admission !== null) return v121Admission;
  const v120Admission = publicReleasePathAdmissionV120(path, { directory });
  if (v120Admission !== null) return v120Admission;
  const v119Admission = publicReleasePathAdmissionV119(path, { directory });
  if (v119Admission !== null) return v119Admission;
  // V141 adds one reviewed original torso atlas, not an open candidate folder.
  if (path === 'assets/openai/sprites/player/v141') return directory;
  if (path.startsWith('assets/openai/sprites/player/v141/')) return !directory
    && path === 'assets/openai/sprites/player/v141/hudson-torso-candidate-v141.png';
  if (directory) {
    if (segments.length === 1) return ['src', 'scripts', 'assets'].includes(path);
    return segments[0] === 'assets' && segments.every(part => !part.startsWith('.') && !PRIVATE_FILENAME.test(part));
  }
  if (segments.length === 1) return ROOT_FILES.has(path) || built && path === 'build-info.json';
  if (segments[0] === 'src') return ['src/ship-port-v87.css', 'src/refuge-v87.css'].includes(path) || segments.length === 2 && /^[a-z0-9][a-z0-9-]*\.js$/i.test(segments[1]);
  if (segments[0] === 'scripts') return segments.length === 2 && SCRIPT_FILES.has(segments[1]);
  if (path === 'assets/audio/manifest.json' || AUDIO_FILES.has(path)) return true;
  if (USER_REFERENCE_JPG_PATHS_V100.has(path)) return true;
  return segments[0] === 'assets' && segments.every(part => !part.startsWith('.') && !PRIVATE_FILENAME.test(part))
    && /\.(?:png|webp)$/i.test(path);
}

export function isPublicDistributionTextV86(text) {
  return typeof text === 'string' && PRIVATE_TEXT.every(pattern => !pattern.test(text));
}

export async function verifyPublicReleaseV86(root = process.cwd(), { built = basename(resolve(root)) === 'dist' } = {}) {
  const validation = validateContent();
  assert.equal(validation.ok, true, `Gameplay registry invalid: ${validation.failures.join(', ')}`);
  assert.equal(RELEASE.releaseVersion, APP_RELEASE_V143.version);
  assert.equal(APP_RELEASE_V143.saveSchema, 52, 'Release version must not change the save format.');
  assert.equal((await lstat(resolve(root))).isSymbolicLink(), false, 'Distribution root must not be a symbolic link.');
  let files = 0, assets = 0, userReferenceJpgs = 0;
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = prefix + entry.name;
      assert.equal(entry.isSymbolicLink(), false, `Unexpected symbolic link: ${path}`);
      if (!prefix && ROOT_IGNORES.has(entry.name)) continue;
      assert.equal(isPublicDistributionPathV86(path, { directory: entry.isDirectory(), built }), true, `Unapproved distribution path: ${path}`);
      if (entry.isDirectory()) { await walk(join(directory, entry.name), path + '/'); continue; }
      assert.equal(entry.isFile(), true, `Unsupported filesystem entry: ${path}`);
      files++; if (path.startsWith('assets/')) assets++;
      if (USER_REFERENCE_JPG_PATHS_V100.has(path)) userReferenceJpgs++;
      if (!built && AI_TOOLS_FILE_SHA256_V188.has(path)) {
        // Third-party tooling keeps its exact upstream bytes (examples may name
        // generic home paths); it is source-only and rejected from any build.
        const digest = createHash('sha256').update(await readFile(join(directory, entry.name))).digest('hex');
        assert.equal(digest, AI_TOOLS_FILE_SHA256_V188.get(path), `Unreviewed AI tooling bytes: ${path}`);
        continue;
      }
      if (ROOT_FILES.has(path) || path === 'src/vendor/supabase-LICENSE.txt' || /\.(?:js|mjs|py|json|css|html|md|webmanifest)$/i.test(path)) {
        const text = await readFile(join(directory, entry.name), 'utf8');
        assert.equal(isPublicDistributionTextV86(text), true, `Private source metadata in distribution: ${path}`);
      }
    }
  }
  await walk(resolve(root));
  // Scan admitted paths and private text first, including partial adversarial
  // fixtures. A complete source validation still requires the exact archives.
  await verifyProjectRecoveryArchive20261116(root, { built });
  const { USER_REFERENCE_LIBRARY_V100 } = await import(pathToFileURL(join(resolve(root), 'src/user-reference-library-v100.js')).href);
  const registeredJpgs = USER_REFERENCE_LIBRARY_V100.map(entry => entry.path.replace(/^\//, '')).filter(path => path.endsWith('.jpg'));
  assert.deepEqual([...new Set(registeredJpgs)].sort(), [...USER_REFERENCE_JPG_PATHS_V100].sort(), 'Reference JPG allowlist differs from the runtime registry.');
  assert.equal(userReferenceJpgs, USER_REFERENCE_JPG_PATHS_V100.size, 'An approved original JPG is missing.');
  await verifyPublicAdmissionsV119(root, { strict: true });
  await verifyPublicAdmissionsV120(root, { strict: true });
  await verifyPublicAdmissionsV121(root, { strict: true });
  await verifyPublicAdmissionsV122(root, { strict: true });
  await verifyPublicAdmissionsV123(root, { strict: true });
  await verifyPublicAdmissionsV163(root);
  await verifyPublicCostumeAdmissionsV165(root, { strict: true, built });
  await verifyCampaignArtAdmissionsV180(root);
  await verifyXenoSpriteAdmissionsV188(root);
  await verifyXenoSpriteAdmissionsV189(root);
  await verifyArbiterImageAdmissionsV190(root);
  await verifyXenoSpriteAdmissionsV191(root);
  await verifyXenoSpriteAdmissionsV197(root);
  await verifyXenoActionAdmissionsV199(root);
  await verifyXenoSuperAdmissionsV200(root);
  await verifyXenoPriorityAdmissionsV201(root);
  await verifyXenoPriorityAdmissionsV202(root);
  await verifyXenoPriorityAdmissionsV203(root);
  await verifyXenoPriorityAdmissionsV204(root);
  await verifyXenoVisualAdmissionsV205(root);
  if (!built) await verifyXenoProductionAdmissionsV206(root);
  await verifyXenoFranchiseStageAdmissionsV192(root);
  await verifyXenoOriginalArenaAdmissionsV193(root);
  await verifyXenoIconicStageAdmissionsV194(root);
  await verifyXenoReferencedStageAdmissionsV196(root);
  await verifyXenoPriorityStageAdmissionsV198(root);
  return { ok: true, version: RELEASE.version, files, assets, privateDocuments: 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyPublicReleaseV86(), null, 2));
}
