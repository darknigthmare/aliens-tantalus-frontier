import { avpPathAdmission, verifyAvpAdmission } from './dlc-admission-avp-2004.mjs';
import { DEV_TOOLS_FILES_V188, isDevToolsPublicPathV188 } from './build-dev-tools-v188.mjs';
import { publicAliens1986DlcPathAdmission, aliens1986RecoveryFile, verifyAliens1986DlcAdmissions } from './public-aliens1986-dlc-admissions.mjs';
import { publicFiorinaSpritePathAdmissionV115, verifyFiorinaSpriteAdmissionsV115 } from './public-fiorina-sprite-admissions-v115.mjs';
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
  // V188 no-shooting hearing (spec 010): suite, browser QA and spec, source-only exact paths.
  'scripts/verify-confrontation-v188.mjs',
  'scripts/qa-confrontation-v188.mjs',
  'specs/010-face-a-face',
  'specs/010-face-a-face/spec.md',
  'specs/010-face-a-face/plan.md',
  'specs/010-face-a-face/tasks.md',
  'scripts/verify-colony-crew-v188.mjs',
  // V188 dedicated colony levels C1-C4: suite and spec, source-only exact paths.
  'scripts/verify-colony-levels-v188.mjs',
  'scripts/qa-colony-levels-v188.mjs',
  // V188 the M577 to scale everywhere (owner decisions 2026-11-22, round 2): suite and browser pass, source-only exact paths.
  'scripts/verify-m577-everywhere-v188.mjs',
  'scripts/qa-apc-levels-v188.mjs',
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
  // V188 first side campaign « La Saison des Reines » (spec 011): suite, browser QA and spec, source-only exact paths.
  'scripts/verify-side-campaign-queens-v188.mjs',
  'scripts/qa-side-campaign-queens-v188.mjs',
  'scripts/qa-side-campaign-queens-arcs-v188.mjs',
  'specs/011-saison-des-reines',
  'specs/011-saison-des-reines/spec.md',
  'specs/011-saison-des-reines/plan.md',
  'specs/011-saison-des-reines/tasks.md',
  // V188 Bioforge containment-lab redesign (spec 013): audit, suite, browser QA and spec, source-only exact paths.
  'docs/development/BIOFORGE_AUDIT_V188.md',
  'scripts/verify-bioforge-lab-v188.mjs',
  'scripts/qa-bioforge-lab-v188.mjs',
  'specs/013-bioforge',
  'specs/013-bioforge/spec.md',
  'specs/013-bioforge/plan.md',
  'specs/013-bioforge/tasks.md',
  // V188 developer tools (spec 012): hidden scene launcher and shooting range. Source admission of
  // the exact paths; since the owner decision of 2026-11-23 the devtools/ files are also shipped,
  // under one hidden directory (see DEV_TOOLS_FILES_V188 below). Scripts, specs and docs stay source-only.
  'devtools',
  'devtools/dev-catalog-v188.js',
  'devtools/dev-fixtures-v188.js',
  'devtools/dev-launcher-v188.js',
  'devtools/dev-range-metrics-v188.js',
  'devtools/dev-range-v188.js',
  'devtools/dev-session-v188.js',
  'devtools/dev-storage-v188.js',
  'devtools/dev-v188.css',
  'devtools/index.html',
  'scripts/dev-tools-server-v188.mjs',
  'scripts/build-dev-tools-v188.mjs',
  'scripts/qa-dev-tools-built-v188.mjs',
  'scripts/verify-dev-tools-v188.mjs',
  'scripts/qa-dev-tools-v188.mjs',
  'specs/012-outils-dev',
  'specs/012-outils-dev/spec.md',
  'specs/012-outils-dev/plan.md',
  'specs/012-outils-dev/tasks.md',
  'scripts/qa-colony-crew-v188.mjs',
  // V188 arsenal completion (spec 014): suite, browser QA, inventory and spec, source-only exact paths.
  'scripts/verify-weapon-arsenal-v188.mjs',
  'scripts/qa-arsenal-v188.mjs',
  'scripts/verify-weapon-franchise-v188.mjs',
  'scripts/qa-arsenal-franchise-v188.mjs',
  'docs/development/ARSENAL_COMPLETION_V188.md',
  'specs/014-arsenal',
  'specs/014-arsenal/spec.md',
  'specs/014-arsenal/plan.md',
  'specs/014-arsenal/tasks.md',
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
  // V188 full main-campaign browser run of 2026-11-22 (regressions + run log), source-only exact paths.
  'scripts/verify-bugfix-full-run-v188.mjs',
  'scripts/verify-owner-decisions-20261123-v188.mjs',
  'docs/development/PLAYTHROUGH_V188_20261122.md',
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
const FIORINA_INTEGRATION_SOURCE_ONLY_V114 = new Set([
  'scripts/verify-fiorina-production-v114.mjs',
  'scripts/qa-fiorina-native-v114.mjs',
  'docs/development/FIORINA_GITHUB_INTEGRATION_V114.md',
  '.github/workflows/fiorina-native-v114.yml'
]);

// Exact source archive recovery; no runtime or artwork approval.
const DLC_ARCHIVE_FILES_20261126 = Object.freeze({
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/README_V12.md": {
    "bytes": 989,
    "sha256": "06df53524a7ba010964866e4b1951b49b0e60ea01817be631a1988938826c2bc"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/src/dlc-prometheus/content.json": {
    "bytes": 272928,
    "sha256": "ff12e36d3c9cc347724dbfdd4a56dd76f998780077b651d4156ff6c5060e41c3"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/LICENSE_NOTICE.md": {
    "bytes": 619,
    "sha256": "03b3c02d5f1f6777dbd3faed36932b36b67b5091d025f574f962b6f205b83706"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/CODEX_PROMETHEUS_V12.md": {
    "bytes": 12598,
    "sha256": "a44a6f704ad2204d0c5aca6213c8674f847c6166c8448c15886ada57a86b3d09"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v8/README_V8.md": {
    "bytes": 5035,
    "sha256": "c86167f6075e355899a736d1efe68841365f103a8bed1f3f164ce34034f62f12"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v4/README.md": {
    "bytes": 8027,
    "sha256": "7d2bfd757ab119ca1db3539f29ade637c9fd1b69d483db6850946611b459f665"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v4/CODEX_PROMETHEUS_V4.md": {
    "bytes": 128357,
    "sha256": "3ca54ca793fb50546f11763cae9bad159ef6d25dc65a5953d057e3bacb909fe3"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v5/README_V5.md": {
    "bytes": 6937,
    "sha256": "4c294d23041a22f969410e274dbc012b14c95bfd54b8b8fbcfde13c2fb5dd4fb"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/development/README.md": {
    "bytes": 168,
    "sha256": "38682fa2277683e76b5ecf62ff1e401231f0401c2752d9c99271949f9799ef26"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/development/v6/README.md": {
    "bytes": 317,
    "sha256": "f0d8557b95cb0ca645a1ddca5d0681f5ea5e49fb9fa8c99dd29044ee18f087a0"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v1/content.json": {
    "bytes": 88163,
    "sha256": "1d715b1b0cf77f96a193b17d6576cb919c07e21208f7490562b64462a3c25c89"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v1/README.md": {
    "bytes": 4398,
    "sha256": "1948445911c228645bba449a8077b8d2eaa761d075756fe52a1fe84430363927"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v3/README.md": {
    "bytes": 8542,
    "sha256": "eadad6501572b8465536fc223cc62287afa32f20c4dd257cc6ea436151135a8c"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v3/CODEX_PROMETHEUS_V3.md": {
    "bytes": 111097,
    "sha256": "8308d5faf9b3d430ff3cc6b122b236233b5a0108ce11de24c5ac4b5dac4bd854"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v2/README.md": {
    "bytes": 5936,
    "sha256": "c97e91bda492d8d6fd8264b3b7b446496b2aa10ec72f77f0d83053ed96faf835"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v2/CODEX_PROMETHEUS_V2.md": {
    "bytes": 79559,
    "sha256": "1d520d8e98f06a3cba769c5a3a9996478f0c88658fd336b100ddcca83e37b8e6"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/RULES_V12.json": {
    "bytes": 51039,
    "sha256": "3904ab798b6cd3c15edf582bf2d956e9e20f9f3874afa39e4909d3621b8ac369"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/PORTAL_CLEARANCE_CHANGES.json": {
    "bytes": 937,
    "sha256": "682dacd63901579aba1053beb0fb97c0f52cca133b07a664a28358fd6bd4d83f"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/REFERENCE_MATRIX_V11.json": {
    "bytes": 78015,
    "sha256": "ceeda78894fbc1e3306fff2351a309dcf3ea5ea189e8659085447dce3633175e"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/RULES_V11.json": {
    "bytes": 47835,
    "sha256": "8360b79cb6db00f7a049f60d428b85ee3eed4c2dc987145b8fc9a1e97992e848"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/QA_SUMMARY_V12.json": {
    "bytes": 1097,
    "sha256": "6ae0948b98542765e923be34a1ad069bfbf1d697c9945fc953cfa26fc5142e5a"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/rules-v10.json": {
    "bytes": 44237,
    "sha256": "618924016a252946a454784b8220cf4cdb565a8d079f9310c8addc7bce11fb05"
  },
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/QA_SUMMARY_V11.json": {
    "bytes": 2797,
    "sha256": "5e55e26f5f1a7848f1d165330142319200d7852551256c1adbbb0a73b246bae3"
  },
  "archives/dlc-source-recovery-20261126/prometheus/parts/ALIENS_TANTALUS_DLC_PROMETHEUS_V12.zip.part-000": {
    "bytes": 10485760,
    "sha256": "bc7e9b94ae4bb2473153b686f16cc3525d1088f60c1b847fa7d7233f6ce5058f"
  },
  "archives/dlc-source-recovery-20261126/prometheus/parts/ALIENS_TANTALUS_DLC_PROMETHEUS_V12.zip.part-001": {
    "bytes": 4193236,
    "sha256": "96b9844af6a686ff87fcf4b2e079acc72fad5df4db586f9e1e9ef79e62eb7837"
  },
  "archives/dlc-source-recovery-20261126/prometheus/MANIFEST.json": {
    "bytes": 3721,
    "sha256": "948601cdaa13477c56fdb2b73ccde4f519126e9b6d22b348e123db6e02d41960"
  },
  "archives/dlc-source-recovery-20261126/prometheus/ZIP_CONTENTS.json": {
    "bytes": 82062,
    "sha256": "87756786283188684d0b95f5ed3c77917033f8a197ed90e7b214295144a106b1"
  },
  "archives/dlc-source-recovery-20261126/prometheus/IMAGE_CANDIDATES.json": {
    "bytes": 3015,
    "sha256": "fce2d1dbeecd8fef53c489210cd88869a37c15b38a44e6d60a4ab4875977929d"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/NOTICE_ASSETS.md": {
    "bytes": 1223,
    "sha256": "df56d70d2854a21d09441bd5349131329555445fc1c9b80445f0544add0e8914"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/README.md": {
    "bytes": 10326,
    "sha256": "1e871502a39370c38c6f2f928ecdb30ed2a782b6cace43b7ca327122fd5150bb"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/audio-incarnation/manifest.json": {
    "bytes": 3708,
    "sha256": "cadce3b3f831697a0aaec070c7f8c87298fd51f241a740621d809f57e271dbe7"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/concordance/manifest.json": {
    "bytes": 1307,
    "sha256": "a8e0b03bbbd789e337cafb90a96e11e55c26603dc77e56e969f8dfb7a4377719"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/incarnation/manifest.json": {
    "bytes": 14918,
    "sha256": "bfe61685f9590375b9633b56e6ec6f088dd08999092a3409ff639bd19e5b2506"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/BASE_PROVENANCE.json": {
    "bytes": 183,
    "sha256": "1773ae6935eb92ff43d3d0f2907cd500f62d19805d1979c996e2a81eef791bb7"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/BASE_PROVENANCE_V18.json": {
    "bytes": 272,
    "sha256": "4093f48f52622744cd6d4dfb7723e65a70e386e3ffedc1fde27d7409e85e071f"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/BASE_PROVENANCE_V19.json": {
    "bytes": 494,
    "sha256": "bfb66486b1ad8c2ff3a50354d8263877a82eadca6a69f2a4949664f455abf696"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/CAMPAGNE_ET_DIALOGUES_V20.md": {
    "bytes": 32879,
    "sha256": "faf2bdbf12edf0714638bc41aaa50baa096fdfe7a1f1670cc0207e7e7cfa49c1"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/REGISTRE_CONCORDANCE_V19.json": {
    "bytes": 69730,
    "sha256": "6372bbf7f264d4f5ae74c0cc4baca5963cfaffe0e980624b3b554624709ed053"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/REGISTRE_CONVERGENCES_V20.json": {
    "bytes": 56841,
    "sha256": "f9b63e7bd71b9709f2289d04d42d86e7ccd9f50bd63584d47c9a8bc65ad72e78"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V14.json": {
    "bytes": 849217,
    "sha256": "61ae8674c5dcb2ab37a1b625d307498d6f362e841b909b8d989838fb15c5ba38"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V15.json": {
    "bytes": 852569,
    "sha256": "55705b47349a2242f1ed4ca50cb2b31f2f2039962f2bf15db2724e6c3846ea8a"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V17.json": {
    "bytes": 858296,
    "sha256": "f4ef7105a5f67f751b46dfcf651895da54dcedbcfedc9f921c91c22c0d38fcf9"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V18.json": {
    "bytes": 859513,
    "sha256": "37e68e67a6d4328fef6f368acf7bb0bbeffbc0e0d1540c37030c8f80669f5862"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V19.json": {
    "bytes": 946602,
    "sha256": "e76e2a33f9dad1aa223b5e840fd37af91b25e24339677b35fd1daf2b3fa8066c"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V20.json": {
    "bytes": 953955,
    "sha256": "c8895a44dfcaef960d7597c3337daa68631f9eb9c6d9238f41de07defe7b4bb4"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/SOURCES_V14.json": {
    "bytes": 17287,
    "sha256": "2d480e9dce9a1c3622c9ea7cb8e8fdc71951b5b06bba59f86f24d1b0a29f9e45"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/SOURCES_V18.json": {
    "bytes": 1710,
    "sha256": "152bbb23fc1b5de7d6cc05622384231cd86c384b78633eeddd03e6b418accdb7"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v13/ROMULUS_MANIFEST_V13.json": {
    "bytes": 846497,
    "sha256": "d623cb564fe3b7aa4b1aeb8ea073e50c5a9c8f650c6d93e177b61ac05b1d0ee2"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v13/SOURCES_V13.json": {
    "bytes": 18225,
    "sha256": "83611a5485c826c368498317917fb78cec358935a4b6ea9d67147f1e3f92fbb8"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v15/SOURCES_V15.json": {
    "bytes": 18989,
    "sha256": "55805a6ccca94270733f501205ad16aed58f5977842541310b759e9d3dbf0312"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/ROMULUS_MANIFEST_V16.json": {
    "bytes": 856771,
    "sha256": "a8f6edf85ff5f55dca46b448e1175ea6e52a989ca51643910323592d874da772"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/SOURCES_V16.json": {
    "bytes": 2244,
    "sha256": "9eff56613b53d984ceb04a8a7ed4c24ddbe4263ae435e22f57a938369239b0d9"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/qa/ASSET_CONTINUITY_V16.json": {
    "bytes": 29037,
    "sha256": "82cafdff2de4c87ec2c74c3bbc272953abb62d2e36a951c7615fc2827f7e9143"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/qa/CAPTURES_V16.json": {
    "bytes": 110949,
    "sha256": "34176bc381afe54d44ea519a980c922d101eddaca32cf5f18d358630059e7521"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/qa/PDF_LAYOUT_V16.json": {
    "bytes": 757,
    "sha256": "5e57c27001a3049bdd350a9cd88372abccbaeda4511d133bf1cc6a8b83a6b41d"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/qa/TEST_SCHEMA_CHANGES_V16.json": {
    "bytes": 64882,
    "sha256": "3ef3b516e9be3cd083e5938b82f7b6e97da5d920cce514a89422199345f8bb4a"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v17/BASE_PROVENANCE_V17.json": {
    "bytes": 183,
    "sha256": "1773ae6935eb92ff43d3d0f2907cd500f62d19805d1979c996e2a81eef791bb7"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v17/SOURCES_V17.json": {
    "bytes": 1775,
    "sha256": "bc39ad7bb1b436baff903531cfc3047438132c7d1d8ddd5a09f6a12f46d4149f"
  },
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/qa/fixtures/v13/manifest.json": {
    "bytes": 846497,
    "sha256": "d623cb564fe3b7aa4b1aeb8ea073e50c5a9c8f650c6d93e177b61ac05b1d0ee2"
  },
  "archives/dlc-source-recovery-20261126/romulus/parts/ALIEN_ROMULUS_CONVERGENCES_v0.20.zip.part-000": {
    "bytes": 10485760,
    "sha256": "2b6293abcbbddba97c0ac5c885ccf42604e61fdd25e67c32dcb5e19859f50685"
  },
  "archives/dlc-source-recovery-20261126/romulus/parts/ALIEN_ROMULUS_CONVERGENCES_v0.20.zip.part-001": {
    "bytes": 10485760,
    "sha256": "e523bae96cc211de9ce20cd800c632d8dd335c22137ebee1230d59c98edd3639"
  },
  "archives/dlc-source-recovery-20261126/romulus/parts/ALIEN_ROMULUS_CONVERGENCES_v0.20.zip.part-002": {
    "bytes": 10485760,
    "sha256": "bc0c4a85087db25d86d837e0d437326a40083a5a45e929898a612c7ba506836b"
  },
  "archives/dlc-source-recovery-20261126/romulus/parts/ALIEN_ROMULUS_CONVERGENCES_v0.20.zip.part-003": {
    "bytes": 10485760,
    "sha256": "bf4932363772ce077d7b4e41d45d9cf99e95be9695bb98c7177b0952e85e7f7b"
  },
  "archives/dlc-source-recovery-20261126/romulus/parts/ALIEN_ROMULUS_CONVERGENCES_v0.20.zip.part-004": {
    "bytes": 5406159,
    "sha256": "6e04525c92f8b66b200cc9eaa9d2835c3f26b383b9f9421044eb0ecd07b18519"
  },
  "archives/dlc-source-recovery-20261126/romulus/MANIFEST.json": {
    "bytes": 6095,
    "sha256": "2de32cada778a17bc63f3745df36ef6bc3c2382a5d99b8103945ebbd2ebbb58b"
  },
  "archives/dlc-source-recovery-20261126/romulus/ZIP_CONTENTS.json": {
    "bytes": 120331,
    "sha256": "45ff0b1f423f82c7c811ee79b83b7950bc0dff41742865ad36a6646d50440950"
  },
  "archives/dlc-source-recovery-20261126/romulus/IMAGE_CANDIDATES.json": {
    "bytes": 19865,
    "sha256": "eb2394af524d1211957ff39472112848c389f437d10a470bf597f2c980c3c9c5"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/CHANGELOG.md": {
    "bytes": 9173,
    "sha256": "a3a87c3db941362b6ad9f862f4c4b4390a018130f604ba84fe58f417d8fdaca1"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/README_FR.md": {
    "bytes": 9204,
    "sha256": "2d5f06c8d8dc12dcce4827d77dfffe59e64a2c61c3bbc5518eed08d8cebcc3b4"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/docs/CODEX_ISOLATION.md": {
    "bytes": 281,
    "sha256": "4302a8d97fd2eeb9adfd88e03c8be2c8be3b311f77b631acfe2740d5c5fafda5"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/docs/METRIQUES.json": {
    "bytes": 499,
    "sha256": "b7bc3f53673b7fc25aa7e3d25c1f0dc8bf557fdcc6c38505f9755a3396e66436"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/docs/QA_RESUME.md": {
    "bytes": 670,
    "sha256": "f9f6d45a79962c4d4cb2269cbf7d4bc15db396d6b3f280454e671d7d646f24d1"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/src/content.json": {
    "bytes": 640411,
    "sha256": "8014f745999f55aff9ae129a6d63f33f15b9f9b1ff7426c0438cb59584ad3d9d"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-000": {
    "bytes": 10485760,
    "sha256": "56991c33f3c3946b73be7e1afe6331fcb1d1dc279238d768093965881271681a"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-001": {
    "bytes": 10485760,
    "sha256": "54f1fa7f92dea91fd33dd9a79a60c6ad8f103d1d97eb72dc70838ae9429dec92"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-002": {
    "bytes": 10485760,
    "sha256": "442e3de45c3e19aad0bf498ad301f43058247ffce3ff96481571bdfa5c22bcc3"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-003": {
    "bytes": 10485760,
    "sha256": "60a651893ed8fc53c9270c77964f59c107114bd24418e73633db0939727ff767"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-004": {
    "bytes": 10485760,
    "sha256": "4e873884d76c5241ae0415c7bb3281d983cbb5a4551dec912311b21321c20c5a"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-005": {
    "bytes": 10485760,
    "sha256": "1c2c19c8476bbea850a097fab7693e914f819f797307a3f4d566d9c0fd315b9b"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-006": {
    "bytes": 10485760,
    "sha256": "89dc34ef4d9dc564ffc217ba9072dbbfa6e53e4a23494089080c5209de4dda67"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-007": {
    "bytes": 10485760,
    "sha256": "34d6752b53f2bead21fd46139428b1c9c212ce2b5b1d03844c3a47539ee3f8fc"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-008": {
    "bytes": 1115698,
    "sha256": "52f7231014445b36848153c72202484e27fdafa1608d68240cbb6f98178434b6"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/MANIFEST.json": {
    "bytes": 4095,
    "sha256": "be500a9fa03141976cbff2eb29269299d228c29c950f0eed4f8e2ccca1c1a254"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/ZIP_CONTENTS.json": {
    "bytes": 181831,
    "sha256": "208d80727feda2ba41a1a8b13bdc26b359a033bc81c884d06b32a384be905fbb"
  },
  "archives/dlc-source-recovery-20261126/alien-isolation/IMAGE_CANDIDATES.json": {
    "bytes": 54001,
    "sha256": "43dcb4ac47b090791f6f6b1e2c0a92a2ee98633a95581ef4d9bdb09ff6dd9c5d"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/LIRE_DABORD.md": {
    "bytes": 4431,
    "sha256": "a37ea0303872a311d8fb12872b28aa7db55a0b0e99ef928424a3d1cfa56b4847"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/NOTICE.md": {
    "bytes": 593,
    "sha256": "ce7cdabffe7976acea8506d10510ab55e19a3a16a456f9bad4d28b8e6c3ed0d2"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/SHA256SUMS.txt": {
    "bytes": 33169,
    "sha256": "eca1ca064f26bf44f015d9ca1db60394627374f1b7d26a2840c65fb9286fb26a"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/AUDIT_FIDELITE_V0_10.md": {
    "bytes": 32016,
    "sha256": "13e9a2ca4bf2fab4157f99586b255d8ee8f9cc320c0f8f39a08f0f2e71181444"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_10.md": {
    "bytes": 12471,
    "sha256": "3e63e96a7257466077535cc3257a0703408832fd011029fb4614424ab77e1832"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_2.md": {
    "bytes": 1813,
    "sha256": "29dadfb71c640c890d7deaa9df0e9277f388e51e35e49addd4cd8c53599d2d76"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_3.md": {
    "bytes": 8051,
    "sha256": "6417574557c35bf4f1db50d8451a6d60d1538f9d5915603b2f57e8b5f08c9b50"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_4.md": {
    "bytes": 11048,
    "sha256": "36c069d3fb28194e5fb3007ff5b221280c9118ed6748f4416f82475d37312dbc"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_5.md": {
    "bytes": 17585,
    "sha256": "ea29b5dd0205f096ac711c20fa5813aca1dcb390d911b23fd033f813b6bbee4a"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_6.md": {
    "bytes": 13172,
    "sha256": "d296708f9948690f5e4a567e3aa1355ad2a1eff7e8ccae04d9ad657bb453008a"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_7.md": {
    "bytes": 11562,
    "sha256": "daa43ca3431bfc92a67fb1d27c8a3d69fde3e248f64ee027f6eaa23e0bcbf2b2"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_8.md": {
    "bytes": 14177,
    "sha256": "d75e2e5744600cfc72b01a75e12cebf46c62a4f633003be3ae85f1cbf00ab515"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_9.md": {
    "bytes": 12598,
    "sha256": "3c17a346b2374ac5f81c9ed9ab3a738494cee77f3688b5817e29dfd7ce42cf51"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CODEX_AVPR.md": {
    "bytes": 207,
    "sha256": "d1f611d26f87ea64d089e79ad1f8594cb61d7b4593b70b21ec1082708b9e4ac3"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CODEX_V0_10.md": {
    "bytes": 154461,
    "sha256": "5c5101e562df38bab2049668396d697a44c8ee0586d3002fd5e1ff40af006e0a"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CONTENT_MANIFEST.json": {
    "bytes": 564096,
    "sha256": "5e155bab97685a7a36ed4eab43474b6f819b2021c01865a3c54cb9be66236737"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/FIDELITY_CHANGES.json": {
    "bytes": 317904,
    "sha256": "0a3528763332ace1e210bbfc46efe00a5bdd0853e715760c275c690e9933e127"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/FIDELITY_MANIFEST.json": {
    "bytes": 88201,
    "sha256": "ad9435dff269cfe39d4e63795e4dee858bcf14112cce2833f8fde7d1b5182df2"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/STATUT_ET_SOURCES.md": {
    "bytes": 278,
    "sha256": "d2cae5600daf8ee240744bce8ba1ce68c94f8beaaea39bd20d963f1a6464b107"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v03/content.json": {
    "bytes": 309797,
    "sha256": "221126463f5d572164c5c5c80b441937224cee9f32890af167e9b679a5346853"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v04/content.json": {
    "bytes": 363948,
    "sha256": "8ae2ca76824e95dc7545766a11e13ca0c2017a089c013eec09572da5c977fa73"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v05/content.json": {
    "bytes": 246605,
    "sha256": "e74cd9b16e31f1efe3677d26000c7cd5bf468e547a6b7f22150488ce7b528534"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v06/content.json": {
    "bytes": 387664,
    "sha256": "462de3a5337f6cefc81fbb93c2b565e0752ed0816f69ff88a409d81b4a7ec330"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v07/content.json": {
    "bytes": 400017,
    "sha256": "c545d4bc1a0e8aa506a32aa8d89387f332a605b437bd63ba1fc95b4bacb4c027"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v08/content.json": {
    "bytes": 410479,
    "sha256": "3bb844edce3565796d00c63df819923fba6f33ddbb06c50d1e7467982a46b8d9"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v09/content.json": {
    "bytes": 417984,
    "sha256": "bdb6b4fd19d71a7c93ca470680dd8f951cfaabb831538a45a96f7ab94832d089"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/tests-v09-original/README.md": {
    "bytes": 498,
    "sha256": "291757f909ed8b37ded49c7f0fc3d591e4d8461b728af267bf60a75e4031e93b"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/rapport/ENVIRONNEMENT.md": {
    "bytes": 3846,
    "sha256": "52e3e5a2675b13292f890f1dc1880e1809482bb7cf02313f47fcb8da0a80033c"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/rapport/HISTORIQUE_VALIDATION_0_10.md": {
    "bytes": 1345,
    "sha256": "c74f61eaa75dab2c0c1a5c748622097da3036cab6ef099e4c2ecf0c6987e9c02"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/rapport/QA.md": {
    "bytes": 1200,
    "sha256": "a4d6b275c7185ecf160cb64ef7e1e4d866903e86a107d43024ed57f27961938e"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests/fixtures/previous-v07/PROVENANCE.md": {
    "bytes": 379,
    "sha256": "f02f976a230bbb371ea29345f3784b319821a1defa4347a4800bfe4cb120d5c2"
  },
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests/fixtures/previous-v09/PROVENANCE.md": {
    "bytes": 338,
    "sha256": "641e240ca98835acec276f1507ae2c268d4cbe126ab3473e4b611bc7f8cc0b25"
  },
  "archives/dlc-source-recovery-20261126/avpr/parts/ALIENS_TANTALUS_DLC_AVPR_V0_10.zip.part-000": {
    "bytes": 10485760,
    "sha256": "7c7a3ce0b8aff559174ae6d532f88ed61cbe1038cea0131262c47778b39306db"
  },
  "archives/dlc-source-recovery-20261126/avpr/parts/ALIENS_TANTALUS_DLC_AVPR_V0_10.zip.part-001": {
    "bytes": 10485760,
    "sha256": "60e054fda5109b54aa36233d43232b35ce9b7e4085d2b9b75d316b3ccbc5b933"
  },
  "archives/dlc-source-recovery-20261126/avpr/parts/ALIENS_TANTALUS_DLC_AVPR_V0_10.zip.part-002": {
    "bytes": 10485760,
    "sha256": "188d89043fe8d7d97fc2f66a164cc384d59d2b21dd7cf4344cf3df496d981694"
  },
  "archives/dlc-source-recovery-20261126/avpr/parts/ALIENS_TANTALUS_DLC_AVPR_V0_10.zip.part-003": {
    "bytes": 1049106,
    "sha256": "e147119e77a477f32d4dfc7dad84a9f2e50b888faf55de2cde1059601fa118f8"
  },
  "archives/dlc-source-recovery-20261126/avpr/MANIFEST.json": {
    "bytes": 5086,
    "sha256": "19a4c5ccde7f247bbd58ec309e0faaeb16b1fc0de2b6ce67b001a7a8953a321d"
  },
  "archives/dlc-source-recovery-20261126/avpr/ZIP_CONTENTS.json": {
    "bytes": 95616,
    "sha256": "cffc794b78eda2b1166811e877f0e837f7b467e9dbb94d24cfce7c4418b8413b"
  },
  "archives/dlc-source-recovery-20261126/avpr/IMAGE_CANDIDATES.json": {
    "bytes": 10023,
    "sha256": "0b0485634cecb90b8ea3614a1a909ee4b90fa9685b978bdd42bcb0d5276204e0"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_10_0.md": {
    "bytes": 1806,
    "sha256": "b1b3a47c5a0068abc8afa9b2478cc3bba6725e378277125fcee4401b3386cec0"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_2_0.md": {
    "bytes": 1705,
    "sha256": "8e0c5a0d2058e776775e80afafd2d22b7a9410075051429e6f387af3ffb38fd9"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_3_0.md": {
    "bytes": 1800,
    "sha256": "b03b4478e4c67d6610d51fcac46753e413f3dabaa452dbb49ef4df73c59fc618"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_4_0.md": {
    "bytes": 1699,
    "sha256": "62e777d98260ce0b89ebeb8587b359eb374d4841fd82e9c2aa2d6d3d31cd4e3d"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_5_0.md": {
    "bytes": 2056,
    "sha256": "3509506b446477e7256d2227c0a7c6c9ca30575a4a1b6c69a21131b3759e1594"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_6_0.md": {
    "bytes": 1849,
    "sha256": "0f3e6174ef716543b80957b6b0f534f8371975e08faa60cd1f17c3e39518eab4"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_7_0.md": {
    "bytes": 1631,
    "sha256": "bbc4676d445e20ff389735b40a54baf4620ef707bb79d2e2449ad8c2694416cd"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_8_0.md": {
    "bytes": 1324,
    "sha256": "ad88110f4f0191ec936480a875ee0e96b5ac14a64d18051ab9df78ade716adfc"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_9_0.md": {
    "bytes": 1833,
    "sha256": "3227ef4e65ffc93bf111f1f57fad3133b4689f9ca95f6ececb27fd27a70537ad"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/NOTICE.txt": {
    "bytes": 604,
    "sha256": "a155fe30d6463229e3c3c52b469b82debfa00a9fdaaede31b8ffc99c4fb77ed5"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/README.md": {
    "bytes": 8236,
    "sha256": "6de956e38d0981ebf58ff546a4e5ceb3b9744e5ef338eacf8cdd7253aa2faef7"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/ADAPTATION.md": {
    "bytes": 1054,
    "sha256": "397c9577dfd7956be3e7bb418813b791bba04376d51d2f5404111b44e83c2927"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/ASSETS_STATUS.md": {
    "bytes": 405,
    "sha256": "0cd0f74190c51610d1a59e829edc2714b950c538e8bcb567d6b2855c1391b350"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/CODEX_LEVEL_DESIGN.md": {
    "bytes": 153863,
    "sha256": "6a4325ce5371eae05fa2cabd22d8ac19c863e553c5e26105307cd8d875ff2e18"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/COUNTS.json": {
    "bytes": 228,
    "sha256": "c11327975569af6220bf93134f75addd1163df5fb7c0fc32df091062e3c19756"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/COUNTS_010.json": {
    "bytes": 228,
    "sha256": "c11327975569af6220bf93134f75addd1163df5fb7c0fc32df091062e3c19756"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/DOCUMENT_COUNTS.json": {
    "bytes": 241,
    "sha256": "545a591028883d01e270939ec419b62925e58abbf25c609f5a35106630ec3d28"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/FIDELITY_RULES_010.json": {
    "bytes": 8125,
    "sha256": "2d13892b7938eaf0fbe52e715343862c0c422d4cd169f1df59e6572385f9c27a"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/INTEGRATION_CODEX.md": {
    "bytes": 2756,
    "sha256": "b59c73c264eb5ca631f86843fc0ba08d48d70c08c6f0435d912d46a519f14c55"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/PROVENANCE.json": {
    "bytes": 3367,
    "sha256": "b691c196c0c39a800d81d98038cbf8e7014be4baffc61b7d6415dce5ea870b0f"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/SOURCES.md": {
    "bytes": 2002,
    "sha256": "9535b3f8ef3b76f0a77712334cccbdc731ab4df44c3fb3eb589eb30e1ac87ce3"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/content-manifest.json": {
    "bytes": 647563,
    "sha256": "410d7a9762225b0e4ac359978acc3fce15ccff2c17a196819dd28b7c3d2dd7ae"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/fidelity/REFERENCE_LEDGER.json": {
    "bytes": 50016,
    "sha256": "405192c51976e936da3d8f887883e80ae21cac0ef7136ae59e79a3f760bfc293"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/history-v09/CODEX_LEVEL_DESIGN_0_9.md": {
    "bytes": 214362,
    "sha256": "e2369507ad732df03c7cd065bb6dbeb448b078aff81908ebc1bbf21eb5f89e3b"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/legacy/README.md": {
    "bytes": 543,
    "sha256": "f59f6a84a99669b75db9bdca8c2ecf97e30e3e9cc998055bb906485ff9bcde18"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/DIAGNOSTIC_HISTORY.md": {
    "bytes": 3555,
    "sha256": "4b07fd41a9aa3815dfba55b807b7471cb53aee9cfc7c75b69124e42b94b9e479"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/QA_REPORT.md": {
    "bytes": 726,
    "sha256": "659c59d88dcb9a4400b111b938a2e5616686d1d725ad3e0cef98f2a99429a14f"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/history06/README.md": {
    "bytes": 216,
    "sha256": "dc6e06d399393c42e7938073aed07a15bb6657f74aa7f040ec509e436c6926ff"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/history08/DIAGNOSTIC_HISTORY_08.md": {
    "bytes": 948,
    "sha256": "9d5f4985ad0d58b88a350ac10a96d79c02c8e2d11ff35626f6558819e396e512"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/history08/README.md": {
    "bytes": 102,
    "sha256": "fa6ee936363c330c200d09a047a895b19a059fef292acfa050ed4322e234988f"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-000": {
    "bytes": 10485760,
    "sha256": "5a1a309d28bcfbda5c1f3f8b368cc9a3d5295ed48f95b920e190243bd0827455"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-001": {
    "bytes": 10485760,
    "sha256": "e9d10de8ae90fdbab6109446fb44815cc1c03a5778ba6d8a3662265443ba8f4a"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-002": {
    "bytes": 10485760,
    "sha256": "12a0cc381b3605d379d1e94745b842a61e639995525e35650e9757ef04a44622"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-003": {
    "bytes": 10485760,
    "sha256": "373df459d4c5a98f930e9fcb2c226945c9af9ea566e9494a029495b34f57a110"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-004": {
    "bytes": 10485760,
    "sha256": "0006d1040815b6053c6bc9d0ab68e7f3cb75a3cdcaeb42fee67cfa846186fe8d"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-005": {
    "bytes": 10192853,
    "sha256": "7c68594515ba28d87fb887bc78415b987e9cb51c879a913bbf5006918d81c684"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/MANIFEST.json": {
    "bytes": 6067,
    "sha256": "379fc0204fadd439f077f43ebf8a040af9690214a92440b8e58a23c39e0f2137"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/ZIP_CONTENTS.json": {
    "bytes": 128371,
    "sha256": "80e1aaa9197c3e75ae8909cf1d9d3cc0150bc15f22ad321736bb8e39855941d9"
  },
  "archives/dlc-source-recovery-20261126/colonial-marines/IMAGE_CANDIDATES.json": {
    "bytes": 23095,
    "sha256": "9dfc9886c17a631ef0cd8cea7bc229e7284cb3c5dd922de0c225e50bf42dea51"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/CHANGELOG_V11.md": {
    "bytes": 942,
    "sha256": "c4fa41947b92af109fc3917cec08472cb1e3341164c3bf61c9ccf8be21a49c60"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/README.md": {
    "bytes": 2329,
    "sha256": "1e7fd0587c3374f04fa16adcc1de0c63f4d16ee2c35bc70bf078dcb16eff09af"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/AUDIT_FIDELITE_V11.json": {
    "bytes": 31501,
    "sha256": "8860542fa8788b7f71b12d964b94e897b954861cb3087639af707c24d047c3ca"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/CODEX_REGLES_V11.md": {
    "bytes": 63351,
    "sha256": "ef2030b79f318bbf7574f05a61f7b0ed4264642a4f0342f0f94c49e1a3b476f8"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/ROOMS_V11.json": {
    "bytes": 491758,
    "sha256": "cfd6298ccc40599f29b8e4d157837730ef2a5dd4cb7d3bda391a7f6820838419"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/base-v10-data.json": {
    "bytes": 525822,
    "sha256": "3963bb8a2696ebba1cb92be843dceb5a00313a8ecb427b468fcc2fe6f0073bf6"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/reference-corpus-v10.json": {
    "bytes": 17310,
    "sha256": "275374176b830ff1f49bc93cce7bb1bee90924caaa82887121e38d4b62794a43"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/reference-corpus-v11.json": {
    "bytes": 19808,
    "sha256": "91da303d57e0a2a773d455b01fa08e9b8895ecf88a5fb93628e9d7443e02f2de"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/rules-v10.json": {
    "bytes": 60983,
    "sha256": "6203ab7ff4a6cfffb0bab5e7a02b421fe34d028e094ea4c12c8b2980bb29b130"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/rules-v11.json": {
    "bytes": 65249,
    "sha256": "e9b1c47320a07b5f66f5b662140f6ea46e992ebb8be49d5b46bb228411de5a66"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/game/data.json": {
    "bytes": 595355,
    "sha256": "253c6f195c01c304bd4afbde45dc1f3a803f41fe0a0ddd33bce123f26d3fc793"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/integration/README.md": {
    "bytes": 1225,
    "sha256": "2220784c0fc2ad147749bad18a1f8876ec58200e1c143016f4cc5bd3647d6e2d"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/qa/README.md": {
    "bytes": 1383,
    "sha256": "9b2b21867e96db6698d661c5f4a90930b4c99b3c5b598c4ff8d4ea80d70478f0"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/requirements-qa.txt": {
    "bytes": 117,
    "sha256": "c8af901bb16a938cfb79aec752b5ea3dee7921c38807b5a02e51f3f698f6733f"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/parts/DLC_ALIEN5_PROJET_LAZARE_V11_CANDIDAT.zip.part-000": {
    "bytes": 7330460,
    "sha256": "c90acf14976373a0bcdb28748f32a1abcf1d29693384d6258e36b38b1774841c"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/MANIFEST.json": {
    "bytes": 2610,
    "sha256": "a9594d7b15a4bae50e9cafdf1ca1061c043eea3b041dc6aec1dd3e2440b6aeb5"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/ZIP_CONTENTS.json": {
    "bytes": 48492,
    "sha256": "5661fdb2881b562786550669515b5f9da10a2d54030acf30424b25cf27c4adcd"
  },
  "archives/dlc-source-recovery-20261126/alien5-lazare/IMAGE_CANDIDATES.json": {
    "bytes": 7880,
    "sha256": "969c04123fbb8d143510402f2d2d062fe36c0aa21c390657d399e325ef33e2f4"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/README.md": {
    "bytes": 5999,
    "sha256": "46435eb5353954bc0c0066e126d288b6ea50025a7b4f2f3249215f954397a634"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/CHANGELOG.md": {
    "bytes": 1516,
    "sha256": "bc9084789e8722fa6a9097e490f2f8acd64442f184b359c29be04aa23081edad"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/CODEX_COMPLET_v0.6.0.md": {
    "bytes": 143192,
    "sha256": "d0019c7016710f3b5a59d22c87395b268d5dfb6923817f8627ad98b4448cfe9b"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/CODEX_COMPLET_v0.7.0.md": {
    "bytes": 242145,
    "sha256": "b8e937041f210c4d123e103d3ba7168a180089901b09761cd7540add54447688"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/CONTENT_MANIFEST.json": {
    "bytes": 290,
    "sha256": "6959d3732d5f33b364f7d8f8649d3a635beecbe3149c9dabbec8d0f464843bb3"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/INTEGRATION.md": {
    "bytes": 1737,
    "sha256": "2c40e6d5bb48c0cc51107e067e7f7b7e537dd4928cf9b568b3a858f9c8ec0699"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/KNOWN_LIMITS.md": {
    "bytes": 1979,
    "sha256": "8d49e9a1079b87f05a9e0533923522e659f727b4832163dda1d33b15fda33be0"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/REGISTRE_FIDELITE_V7.json": {
    "bytes": 26793,
    "sha256": "530801b24d12c0ab88929144a13545099519d67d84ef34a4dd254ac9e9106b6a"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SMOKE_TEST_MANUEL.md": {
    "bytes": 1734,
    "sha256": "9dbfe860d35cc772f209c2f234c3a10fa9440194fe7704721fafc3e8a52ee68b"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SOURCES_ET_FIDELITE.md": {
    "bytes": 4025,
    "sha256": "7558183813796e38b0504d92d27d43b4b4365a399aca8f7fb54c31d48ab5b73d"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SOURCE_PROVENANCE_V3_INHERITED.json": {
    "bytes": 1265,
    "sha256": "06977385d03830ff8847735ab88630d15786fb57fa70a3cd3bb326730a4a78f0"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SOURCE_V4.json": {
    "bytes": 232,
    "sha256": "66f982f29135db2946c628fe2fdd303cb431a4c6942808b52c85518528c911a4"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SOURCE_V5.json": {
    "bytes": 297,
    "sha256": "a93bc8c7ead46b3858354cfe54bf5df82da3a895e624f3bf3c7e248bdc278dbb"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SOURCE_V7.json": {
    "bytes": 3129,
    "sha256": "bacf6572236dc91fd15596f27c4b7804c1ee6f2dc4efe182ef4e7a324da817d1"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/content-v7.json": {
    "bytes": 513161,
    "sha256": "355b896cae3db50aa2bbe027a777b3c6b8031d3956a3bbb60562132b5a5a8ea8"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/qa/REPRODUCIBILITE.md": {
    "bytes": 1772,
    "sha256": "d4405eeb24639fa28ca042b32606dae576a569cfd4bf1f18924951b5672f584a"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/parts/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip.part-000": {
    "bytes": 10485760,
    "sha256": "53899e34f00eeaba4ae00a377450f2b807bfa365b2a2f0b4d6e1dc3ec4ddd16e"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/parts/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip.part-001": {
    "bytes": 10485760,
    "sha256": "9802aea249acda73c64b6b0c1b5350f8a9f10cbdce2eaa195b2e99776cd088f7"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/parts/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip.part-002": {
    "bytes": 10485760,
    "sha256": "10a9fc00c08d993bd8959971b9b0413902a5c9af74435816d54d9b5ba1ec9783"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/parts/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip.part-003": {
    "bytes": 1646472,
    "sha256": "709340dd800a1658fda66fa10c38b501fab89dc4436e838df5d973400ff030f3"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/MANIFEST.json": {
    "bytes": 3795,
    "sha256": "3b5753306437fcef0e560fc7432cbe3d87a0ab5ea06aa0d32cd7a952579d524e"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/ZIP_CONTENTS.json": {
    "bytes": 110132,
    "sha256": "3de069dd720f3c3f531adc946b2561615335490ec593ed2a5f30777eb3646b6c"
  },
  "archives/blackout-source-recovery-20261126/alien-blackout/IMAGE_CANDIDATES.json": {
    "bytes": 22234,
    "sha256": "7ea388357d3a69ec24d2e7e785d76f933f7ca4627d3f8b13c1e84b971ca5bbd5"
  },
  "archives/dlc-source-recovery-20261126/reconstruct.py": {
    "bytes": 2004,
    "sha256": "b29a54799cd8de96d4cabd05504a115e191b83751cf61b22927929d1cc68758d"
  },
  "archives/dlc-source-recovery-20261126/README.md": {
    "bytes": 3452,
    "sha256": "68b71442dba4f9e150b7f4f7e8a6f631f39195b4f0830e411de635e7b803719c"
  }
});
const DLC_ARCHIVE_DIRECTORIES_20261126 = new Set([
  "archives",
  "archives/blackout-source-recovery-20261126",
  "archives/blackout-source-recovery-20261126/alien-blackout",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/qa",
  "archives/blackout-source-recovery-20261126/alien-blackout/parts",
  "archives/dlc-source-recovery-20261126",
  "archives/dlc-source-recovery-20261126/alien-isolation",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/docs",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/src",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts",
  "archives/dlc-source-recovery-20261126/alien5-lazare",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/game",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/integration",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/qa",
  "archives/dlc-source-recovery-20261126/alien5-lazare/parts",
  "archives/dlc-source-recovery-20261126/avpr",
  "archives/dlc-source-recovery-20261126/avpr/documents",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v03",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v04",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v05",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v06",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v07",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v08",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v09",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/tests-v09-original",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/rapport",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests/fixtures",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests/fixtures/previous-v07",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests/fixtures/previous-v09",
  "archives/dlc-source-recovery-20261126/avpr/parts",
  "archives/dlc-source-recovery-20261126/colonial-marines",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/fidelity",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/history-v09",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/legacy",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/history06",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/history08",
  "archives/dlc-source-recovery-20261126/colonial-marines/parts",
  "archives/dlc-source-recovery-20261126/prometheus",
  "archives/dlc-source-recovery-20261126/prometheus/documents",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/development",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/development/v6",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v1",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v2",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v3",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v4",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v5",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v8",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/src",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/src/dlc-prometheus",
  "archives/dlc-source-recovery-20261126/prometheus/parts",
  "archives/dlc-source-recovery-20261126/romulus",
  "archives/dlc-source-recovery-20261126/romulus/documents",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/audio-incarnation",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/concordance",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/incarnation",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v13",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v15",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/qa",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v17",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/qa",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/qa/fixtures",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/qa/fixtures/v13",
  "archives/dlc-source-recovery-20261126/romulus/parts"
]);
const DLC_ARCHIVE_ROOTS_20261126 = ["archives/dlc-source-recovery-20261126", "archives/blackout-source-recovery-20261126"];

export function isPublicDistributionPathV86(path, { directory = false, built = false } = {}) {
  if (DLC_ARCHIVE_DIRECTORIES_20261126.has(path)) return !built && directory;
  if (typeof path === 'string' && DLC_ARCHIVE_ROOTS_20261126.some(root => path.startsWith(root + '/')))
    return !built && !directory && Object.hasOwn(DLC_ARCHIVE_FILES_20261126, path);
  const fiorinaSpriteAdmission = publicFiorinaSpritePathAdmissionV115(path, { directory, built });
  if (fiorinaSpriteAdmission !== null) return fiorinaSpriteAdmission;
  const aliens1986Admission = publicAliens1986DlcPathAdmission(path, { directory, built });
  if (aliens1986Admission !== null) return aliens1986Admission;
  const avpAdmission = avpPathAdmission(path, { directory, built });
  if (avpAdmission !== null) return avpAdmission;
  if (FIORINA_INTEGRATION_SOURCE_ONLY_V114.has(path)) return !built;
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
  // Built distribution: one hidden top-level directory with exactly the developer tool files
  // (scripts/verify-release-artifact-v143.mjs checks there is a single one and its fingerprint).
  if (built) {
    const [devDirectory, devFile, ...devRest] = path.split('/');
    if (isDevToolsPublicPathV188(devDirectory) && !PRIVATE_SEGMENT.test(devDirectory))
      return devFile === undefined ? directory : !directory && devRest.length === 0 && DEV_TOOLS_FILES_V188.includes(devFile);
  }
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
      if (!built && Object.hasOwn(DLC_ARCHIVE_FILES_20261126, path)) {
        const expected = DLC_ARCHIVE_FILES_20261126[path];
        const bytes = await readFile(join(directory, entry.name));
        assert.equal(bytes.length, expected.bytes, 'Changed source archive recovery size: ' + path);
        assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256,
          'Changed source archive recovery bytes: ' + path);
        continue;
      }
      const recoveredAliens1986 = !built && aliens1986RecoveryFile(path);
      if (recoveredAliens1986) {
        // Original QA receipts retain historical machine paths. The independently
        // pinned inventory permits only these exact bytes, outside every build.
        const bytes = await readFile(join(directory, entry.name));
        assert.equal(bytes.length, recoveredAliens1986.bytes, 'Changed Aliens 1986 recovery size: ' + path);
        assert.equal(createHash('sha256').update(bytes).digest('hex'), recoveredAliens1986.sha256,
          'Changed Aliens 1986 recovery bytes: ' + path);
        continue;
      }
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
  await verifyAliens1986DlcAdmissions(root, { built });
  await verifyFiorinaSpriteAdmissionsV115(root);
  await verifyAvpAdmission(root, { built });
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
