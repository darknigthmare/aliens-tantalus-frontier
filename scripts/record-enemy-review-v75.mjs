import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { ROOT, REVIEW_CHECKS, getJobStatus } from './enemy-batch-production.mjs';
import { V66_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v66.js';

// Explicit V75 review. It promotes Prowler015/Ceto051 and renews the nine previous
// acceptances because their integration evidence binds the exact registry file.
const additions = {
  'enemy-015-prowler': {
    atlas: '5462eb30975dcdf83b29e02bf5aff8e65de5fbe92aecb0958c09af1e887e6b52',
    metadata: 'f34736d503e6631079548e9c72f5d7b30760472d9835a8cbdef0b99c7af5e711',
    test: 'tests/enemy-prowler-v75.test.mjs',
    note: 'Root and independent review of the licensed-reference adaptation: all32 poses, alpha cleanup, direction, measured cranial scale and physical ribcage roots. Render352 square/body96x88. The authored crouch, takeoff, airborne strike and landing are coupled to a100px swept pounce; impact occurs once on pose5, obstacles, unsupported gaps, vehicles, both directions and resume are tested. Generated adaptation, never an official-pixel or canon1:1 claim.'
  },
  'enemy-051-ceto-reef-predator': {
    atlas: '0f40a56669c6a151ea02ffdcdf9ee18331bf495545a816eab75572c062142168',
    metadata: 'c5b605b79c351209aaae59d344475f8a7c4558e3bb8acbfb01b465c9201d1200',
    test: 'tests/enemy-ceto-v75.test.mjs',
    note: 'Root and independent calibration review of all32 poses, alpha, right-facing identity, aquatic keel registration and cross-clip scale. Dedicated project-original fauna, render384 square/body156x100/pivot192. It spawns only inside the authored Ceto cave basin; movement cannot leave the volume, line-of-sight blocks bites and impact frame4 delivers damage once in both directions. Death holds frame31. No free-swim or canon1:1 claim.'
  }
};
const expectedIds = [
  'enemy-001-ovomorph', 'enemy-003-chestburster', 'enemy-004-drone-big-chap',
  'enemy-005-warrior', 'enemy-006-runner', 'enemy-015-prowler', 'enemy-016-burster',
  'enemy-020-k-series-yellow-xenomorph', 'enemy-050-korari-stalker',
  'enemy-051-ceto-reef-predator', 'enemy-055-albino-chestburster'
];
const hash = async (path) => createHash('sha256').update(await readFile(resolve(ROOT, path))).digest('hex');
const json = async (path) => JSON.parse(await readFile(resolve(ROOT, path), 'utf8'));
const queue = await json('docs/references/V66_ENEMY_BATCH_QUEUE.json');
let state = await json('docs/references/V66_ENEMY_BATCH_STATE.json');
if (JSON.stringify(V66_READY_ENEMY_PROFILE_ASSETS.map((asset) => asset.profileId).sort()) !== JSON.stringify([...expectedIds].sort())) {
  throw new Error('V75 reviewed scope changed.');
}
for (const id of expectedIds) {
  const job = queue.jobs.find((entry) => entry.profileId === id);
  const reviewed = additions[id] || state.events.filter((entry) => entry.profileId === id && entry.kind === 'accepted').at(-1);
  if (!job || !reviewed || await hash(job.normalizedPath) !== (reviewed.atlas || reviewed.atlasSha256)
    || await hash(job.metadataPath) !== (reviewed.metadata || reviewed.metadataSha256)) {
    throw new Error(`Reviewed bytes changed: ${id}`);
  }
}
if (!process.argv.includes('--apply')) {
  console.log('V75 reviewed bytes match. Use --apply only after the documented visual and runtime reviews.');
  process.exit(0);
}

const tests = [
  'tests/enemy-prowler-v75.test.mjs',
  'tests/enemy-ceto-v75.test.mjs', 'tests/enemy-ceto-pivot-v75.test.mjs',
  'tests/enemy-ceto-resume-v76.test.mjs', 'tests/water-movement-v76.test.mjs',
  'tests/enemy-burster-v74.test.mjs', 'tests/enemy-korari-v74.test.mjs',
  'tests/enemy-korari-vehicle-resume-v74.test.mjs',
  'tests/enemy-albino-chestburster-v73.test.mjs',
  'tests/enemy-batch-animation-integration-v66.test.mjs',
  'tests/enemy-batch-combat-v66.test.mjs', 'tests/enemy-v66-production-access.test.mjs'
];
const run = spawnSync(process.execPath, ['--test', ...tests], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
if (run.status !== 0) throw new Error(run.stdout + run.stderr);
const log = 'docs/references/v75-enemy-fixes/runtime-test-output.txt';
await writeFile(resolve(ROOT, log), (run.stdout + run.stderr).replaceAll('\r\n', '\n'));
const directory = 'docs/references/v75-enemy-fixes/release';
await mkdir(resolve(ROOT, directory), { recursive: true });
for (const id of expectedIds) {
  const job = queue.jobs.find((entry) => entry.profileId === id);
  const addition = additions[id];
  const note = addition?.note
    || 'Evidence renewal only: atlas and metadata are byte-identical to the previous accepted review. V75 changes only the registry membership and adds no sibling-variant promotion.';
  const events = [
    { kind: 'accepted', profileId: id, actor: 'Codex V75 root review', canonExact: false, note,
      review: Object.fromEntries(REVIEW_CHECKS.map((key) => [key, true])) },
    { kind: 'integrated', profileId: id, actor: 'Codex V75 runtime verification', note,
      runtimeEvidence: { result: 'pass', command: `node --test ${tests.join(' ')}`,
        registry: { path: 'src/enemy-profile-assets-v66.js' },
        test: { path: addition?.test || 'tests/enemy-batch-animation-integration-v66.test.mjs' },
        log: { path: log } } }
  ];
  for (const event of events) {
    const path = `${directory}/${event.kind}-${id}.json`;
    await writeFile(resolve(ROOT, path), JSON.stringify(event, null, 2) + '\n');
    const result = spawnSync(process.execPath, ['scripts/enemy-batch-production.mjs', 'record', '--event', path], {
      cwd: ROOT, encoding: 'utf8', windowsHide: true
    });
    if (result.status !== 0) throw new Error(result.stdout + result.stderr);
  }
  state = await json('docs/references/V66_ENEMY_BATCH_STATE.json');
  if ((await getJobStatus(job, state)).status !== 'integrated') throw new Error(`V75 integration failed: ${id}`);
  console.log(`V75 integration verified: ${id}`);
}
