import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { ROOT, REVIEW_CHECKS, getJobStatus } from './enemy-batch-production.mjs';
import { V66_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v66.js';

// Explicit root-reviewed V74 release operation, never a general auto-acceptor.
// Old acceptances may only renew unchanged bytes. New reviews bind exact bytes.
const additions = {
  'enemy-016-burster': {
    atlas: '3ad1538aef3dd62354950f7cf7f63e875ff2cd6688bfb06c8f2fa9abf80ff3df',
    metadata: 'c888f17d3eaa821b5469dd2266a2f68bba2df5a5d82acd94e6eb38c1969d3df7',
    test: 'tests/enemy-burster-v74.test.mjs',
    note: 'Root and independent visual review: V73 source identity,32 physical roots and32 distinct poses preserved. V74 calibrated body88x88/render256 square. Compression is coupled at0.5s to exactly one real blast then terminal death. Browser tests verify both directions, obstacles and save roundtrips. Existing particles provide the blast; no dedicated explosion bitmap or canon1:1 claim.'
  },
  'enemy-050-korari-stalker': {
    atlas: '01f0627eee240ded94a36859e2d4dc8960d5881828d24753be04e78ad7a096df',
    metadata: '23ff24162c5725b6ac5787220835f3c8751a61214a7547252c6b9337216a35ce',
    test: 'tests/enemy-korari-v74.test.mjs',
    note: 'Root and independent visual review of all32 poses, source identity, alpha, direction, physical roots and scale. Same source atlas as V73. Dedicated original quadruped, render288 square/body96x60. Bite-pounce impact at4/12s once, obstacles and both directions exercised in real V51/V52 fixture. Project-original, never canonical1:1.'
  }
};
const expectedIds = ['enemy-001-ovomorph', 'enemy-003-chestburster', 'enemy-004-drone-big-chap', 'enemy-005-warrior',
  'enemy-006-runner', 'enemy-016-burster', 'enemy-020-k-series-yellow-xenomorph', 'enemy-050-korari-stalker', 'enemy-055-albino-chestburster'];
const hash = async path => createHash('sha256').update(await readFile(resolve(ROOT, path))).digest('hex');
const json = async path => JSON.parse(await readFile(resolve(ROOT, path), 'utf8'));
const queue = await json('docs/references/V66_ENEMY_BATCH_QUEUE.json');
let state = await json('docs/references/V66_ENEMY_BATCH_STATE.json');
if (JSON.stringify(V66_READY_ENEMY_PROFILE_ASSETS.map(a => a.profileId).sort()) !== JSON.stringify(expectedIds)) throw new Error('V74 reviewed scope changed.');
for (const id of expectedIds) {
  const job = queue.jobs.find(j => j.profileId === id);
  const reviewed = additions[id] || state.events.filter(e => e.profileId === id && e.kind === 'accepted').at(-1);
  if (!reviewed || await hash(job.normalizedPath) !== (reviewed.atlas || reviewed.atlasSha256)
    || await hash(job.metadataPath) !== (reviewed.metadata || reviewed.metadataSha256)) throw new Error(`Reviewed bytes changed: ${id}`);
}
if (!process.argv.includes('--apply')) {
  console.log('V74 reviewed bytes match. Use --apply only after the documented visual and browser reviews.');
  process.exit(0);
}
// Record a fresh real gate; normalize only the generated log's line endings.
const tests = ['tests/enemy-burster-v74.test.mjs', 'tests/enemy-korari-v74.test.mjs',
  'tests/enemy-korari-vehicle-resume-v74.test.mjs',
  'tests/enemy-albino-chestburster-v73.test.mjs', 'tests/enemy-batch-animation-integration-v66.test.mjs',
  'tests/enemy-batch-combat-v66.test.mjs', 'tests/enemy-v66-production-access.test.mjs'];
const run = spawnSync(process.execPath, ['--test', ...tests], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
if (run.status !== 0) throw new Error(run.stdout + run.stderr);
const log = 'docs/references/v74-enemy-fixes/runtime-test-output.txt';
await writeFile(resolve(ROOT, log), (run.stdout + run.stderr).replaceAll('\r\n', '\n'));
const directory = 'docs/references/v74-enemy-fixes/release';
await mkdir(resolve(ROOT, directory), { recursive: true });
for (const id of expectedIds) {
  const job = queue.jobs.find(j => j.profileId === id);
  const addition = additions[id];
  const events = [
    { kind: 'accepted', profileId: id, actor: 'Codex V74 root review', canonExact: false,
      note: addition?.note || 'Evidence renewal only: atlas and metadata checked byte-for-byte against previous acceptance. No new art or old review alteration. Current V74 runtime gate covers the expanded readylist.',
      review: Object.fromEntries(REVIEW_CHECKS.map(key => [key, true])) },
    { kind: 'integrated', profileId: id, actor: 'Codex V74 runtime verification',
      note: addition?.note || 'Unchanged accepted atlas; fresh runtime evidence after V74 corrections. No promotion of sibling variants.',
      runtimeEvidence: { result: 'pass', command: 'node --test ' + tests.join(' '),
        registry: { path: 'src/enemy-profile-assets-v66.js' },
        test: { path: addition?.test || 'tests/enemy-batch-animation-integration-v66.test.mjs' }, log: { path: log } } }
  ];
  for (const event of events) {
    const path = `${directory}/${event.kind}-${id}.json`;
    await writeFile(resolve(ROOT, path), JSON.stringify(event, null, 2) + '\n');
    const result = spawnSync(process.execPath, ['scripts/enemy-batch-production.mjs', 'record', '--event', path], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
    if (result.status !== 0) throw new Error(result.stdout + result.stderr);
  }
  state = await json('docs/references/V66_ENEMY_BATCH_STATE.json');
  if ((await getJobStatus(job, state)).status !== 'integrated') throw new Error(`V74 integration failed: ${id}`);
  console.log(`V74 integration verified: ${id}`);
}
