import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  QUEUE_PATH,
  ROOT,
  STATE_PATH,
  summarizeQueue
} from './enemy-batch-production.mjs';

export const V75_EXPECTED_COUNTS = Object.freeze({
  'pending-reference': 487,
  'ready-generation': 25,
  generated: 42,
  'review-rejected': 5,
  accepted: 0,
  integrated: 11
});

export const V75_EXPECTED_INTEGRATED_PROFILES = Object.freeze([
  'enemy-001-ovomorph',
  'enemy-003-chestburster',
  'enemy-004-drone-big-chap',
  'enemy-005-warrior',
  'enemy-006-runner',
  'enemy-015-prowler',
  'enemy-016-burster',
  'enemy-020-k-series-yellow-xenomorph',
  'enemy-050-korari-stalker',
  'enemy-051-ceto-reef-predator',
  'enemy-055-albino-chestburster'
]);

export const V75_EXPECTED_REJECTED_PROFILES = Object.freeze([
  'enemy-011-lurker',
  'enemy-023-atarax-ripper',
  'enemy-039-abomination',
  'enemy-071-albino-red-xenomorph',
  'enemy-072-albino-k-series-yellow-xenomorph'
]);

export const V75_EXPLICIT_REJECTIONS = Object.freeze([
  Object.freeze({
    profileId: 'enemy-011-lurker',
    decisionPath: 'docs/references/v75-enemy-fixes/release/rejected-enemy-011-lurker.json'
  }),
  Object.freeze({
    profileId: 'enemy-023-atarax-ripper',
    decisionPath: 'docs/references/v75-enemy-fixes/release/rejected-enemy-023-atarax-ripper.json'
  })
]);

const readJson = async (path) => JSON.parse(await readFile(resolve(ROOT, path), 'utf8'));
const same = (actual, expected) => JSON.stringify(actual) === JSON.stringify(expected);

function checkpointV74(previous) {
  return {
    path: 'docs/references/V74_ENEMY_PROGRESS.json',
    release: previous.release,
    scope: previous.scope,
    profileCount: previous.profileCount,
    requiredSheets: previous.requiredSheets,
    presentSheets: previous.presentSheets,
    provenanceVerifiedSheets: previous.provenanceVerifiedSheets,
    exactPromptGapSheets: previous.exactPromptGapSheets,
    normalizedCurrentProfiles: previous.normalizedCurrentProfiles,
    integratedProfiles: previous.integratedProfiles,
    unfinishedProfileCount: previous.unfinishedProfileCount
  };
}

async function validateExplicitRejections(integratedProfiles, rejectedProfiles) {
  const decisions = [];
  for (const expected of V75_EXPLICIT_REJECTIONS) {
    const decision = await readJson(expected.decisionPath);
    if (
      decision.kind !== 'review-rejected'
      || decision.profileId !== expected.profileId
      || decision.accepted !== false
      || decision.runtimeIntegrated !== false
      || decision.canonExact !== false
    ) {
      throw new Error(`Invalid V75 rejection evidence: ${expected.profileId}`);
    }
    if (integratedProfiles.includes(expected.profileId) || !rejectedProfiles.includes(expected.profileId)) {
      throw new Error(`Rejected V75 profile was promoted: ${expected.profileId}`);
    }
    decisions.push({
      profileId: expected.profileId,
      status: 'review-rejected',
      accepted: false,
      runtimeIntegrated: false,
      canonExact: false,
      evidence: expected.decisionPath,
      note: decision.note
    });
  }
  return decisions;
}

export async function auditEnemyProgressV75() {
  // V74 is historical evidence. Read its recorded snapshot instead of
  // recalculating it against the mutable V66 production state.
  const previous = await readJson('docs/references/V74_ENEMY_PROGRESS.json');
  if (previous.release !== '74.0.0') throw new Error('V75 requires the recorded V74 checkpoint.');

  const queue = await readJson(QUEUE_PATH);
  const state = await readJson(STATE_PATH);
  const central = await summarizeQueue(queue, state, ROOT);
  const integratedProfiles = central.jobs
    .filter((profile) => profile.status === 'integrated')
    .map((profile) => profile.profileId);
  const reviewRejectedProfiles = central.jobs
    .filter((profile) => profile.status === 'review-rejected')
    .map((profile) => profile.profileId);

  if (!same(central.counts, V75_EXPECTED_COUNTS)) {
    throw new Error(`V75 central counts changed: ${JSON.stringify(central.counts)}`);
  }
  if (!same(integratedProfiles, V75_EXPECTED_INTEGRATED_PROFILES)) {
    throw new Error(`V75 integrated scope changed: ${JSON.stringify(integratedProfiles)}`);
  }
  if (!same(reviewRejectedProfiles, V75_EXPECTED_REJECTED_PROFILES)) {
    throw new Error(`V75 rejected scope changed: ${JSON.stringify(reviewRejectedProfiles)}`);
  }

  const rejectedDecisions = await validateExplicitRejections(integratedProfiles, reviewRejectedProfiles);
  const profileById = new Map(central.jobs.map((profile) => [profile.profileId, profile]));
  const promoted = [
    {
      profileId: 'enemy-015-prowler',
      status: 'integrated',
      accepted: true,
      runtimeIntegrated: true,
      canonExact: false,
      evidence: 'docs/references/v75-enemy-fixes/release/integrated-enemy-015-prowler.json',
      test: 'tests/enemy-prowler-v75.test.mjs'
    },
    {
      profileId: 'enemy-051-ceto-reef-predator',
      status: 'integrated',
      accepted: true,
      runtimeIntegrated: true,
      canonExact: false,
      evidence: 'docs/references/v75-enemy-fixes/release/integrated-enemy-051-ceto-reef-predator.json',
      test: 'tests/enemy-ceto-v75.test.mjs'
    }
  ];
  for (const entry of promoted) {
    if (profileById.get(entry.profileId)?.status !== 'integrated') {
      throw new Error(`V75 promoted profile is not integrated: ${entry.profileId}`);
    }
  }

  return {
    schema: 1,
    release: '75.0.0',
    generatedBy: 'scripts/enemy-progress-v75.mjs',
    scope: 'V75 central enemy production state; V74 frozen next50 is retained as an immutable checkpoint.',
    warning: 'File existence and technical checks never certify visual fidelity, finished gameplay or commercial readiness.',
    totalProfiles: central.totalProfiles,
    baselineAlreadyIntegrated: central.baselineAlreadyIntegrated,
    profileCount: central.productionJobs,
    batchCount: central.batchCount,
    requiredSheets: central.requiredBoards,
    presentSheets: central.verifiedGeneratedBoards,
    provenanceVerifiedSheets: central.verifiedGeneratedBoards,
    exactPromptGapSheets: central.recoveredPromptGapBoards,
    counts: central.counts,
    integratedProfileCount: integratedProfiles.length,
    integratedProfiles,
    reviewRejectedProfileCount: reviewRejectedProfiles.length,
    reviewRejectedProfiles,
    unfinishedProfileCount: central.productionJobs - integratedProfiles.length,
    visualReviewRequired: true,
    previousReleaseCheckpoint: checkpointV74(previous),
    currentCorrections: [...promoted, ...rejectedDecisions],
    profiles: central.jobs
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await auditEnemyProgressV75();
  const target = resolve(ROOT, 'docs/references/V75_ENEMY_PROGRESS.json');
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    if (await readFile(target, 'utf8') !== serialized) {
      throw new Error('V75 progress snapshot is stale. Regenerate V75 only; preserve the historical V74 report.');
    }
  } else {
    await writeFile(target, serialized);
  }
  const { profiles, ...summary } = report;
  console.log(JSON.stringify(summary, null, 2));
}
