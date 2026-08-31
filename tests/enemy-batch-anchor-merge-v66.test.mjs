import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Exercise the actual CLI body with in-memory fs and argv, never production files.
const source = await readFile(new URL('../scripts/merge-v66-anchor-reviews.mjs', import.meta.url), 'utf8');
let cliBody = source;
for (const declaration of [
  "import { readFile, writeFile } from 'node:fs/promises';",
  "import { createHash } from 'node:crypto';",
  "import { ROOT, scopedPath } from './enemy-batch-production.mjs';"
]) {
  assert.ok(cliBody.includes(declaration), 'CLI dependencies changed: update the explicit test doubles');
  cliBody = cliBody.replace(declaration, '');
}
assert.doesNotMatch(cliBody, /^import\s/m, 'Every CLI import must be explicitly mocked');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const runCli = new AsyncFunction('readFile', 'writeFile', 'createHash', 'ROOT', 'scopedPath', 'process', 'console', cliBody);
const globalPath = 'docs/references/V66_BATCH_002_ANCHOR_REVIEW.json';
const frameRecords = (indices) => indices.map((frame) => ({ frame, reviewed: true, anchor: [40, 80], landmark: [40, 50], confidence: 'medium', evidence: 'Synthetic fixture only.' }));

function fixture(frames) {
  const sourcePath = 'synthetic/death.png';
  const bytes = Buffer.from('synthetic source receipt, not production art');
  const profileId = 'enemy-026-foundry-crusher';
  const sourceSha256 = createHash('sha256').update(bytes).digest('hex');
  const fragment = {
    schema: 1, batchId: 'batch-002', coordinates: 'nominal-source-cell',
    profiles: {
      [profileId]: {
        status: 'reviewed', reviewer: 'test', reviewedAt: '2026-08-31', method: 'Synthetic unit test.',
        clips: { death: { sourceSha256, sourceSize: [400, 200], frames } }
      }
    }
  };
  const existing = { schema: 1, batchId: 'batch-002', coordinates: 'nominal-source-cell', profiles: { unchanged: { status: 'pending', note: 'Keep existing evidence.' } } };
  const files = new Map([
    ['docs/references/V66_ENEMY_BATCH_QUEUE.json', Buffer.from(JSON.stringify({ jobs: [{ profileId, batchId: 'batch-002', clips: [{ id: 'death', sourcePath }] }] }))],
    [globalPath, Buffer.from(JSON.stringify(existing))],
    ['fragment.json', Buffer.from(JSON.stringify(fragment))],
    [sourcePath, bytes]
  ]);
  const writes = [], logs = [];
  const mockedReadFile = async (path, encoding) => {
    assert.ok(files.has(path), 'Unexpected fixture read: ' + path);
    const value = Buffer.from(files.get(path));
    return encoding ? value.toString(encoding) : value;
  };
  const mockedWriteFile = async (path, value) => {
    assert.equal(path, globalPath, 'Only the global anchor document may be assembled');
    writes.push({ path, value });
  };
  return {
    writes, logs, existing, profileId,
    execute: () => runCli(mockedReadFile, mockedWriteFile, createHash, 'memory-only', (_root, path) => path,
      { argv: ['node', 'merge-v66-anchor-reviews.mjs', 'batch-002', 'fragment.json'] },
      { log: (value) => logs.push(JSON.parse(value)) })
  };
}

test('anchor merge rejects invalid pose indices and non-array frames before any write', async (t) => {
  const cases = [
    ['one-based1..8', frameRecords([1, 2, 3, 4, 5, 6, 7, 8])],
    ['duplicate', frameRecords([0, 1, 2, 3, 4, 5, 6, 6])],
    ['floating index', frameRecords([0, 1, 2, 3, 4, 5, 6, 7.5])],
    ['string index', frameRecords([0, 1, 2, 3, 4, 5, 6, '7'])],
    ['negative index', frameRecords([0, 1, 2, 3, 4, 5, 6, -1])],
    ['boolean index', frameRecords([0, 1, 2, 3, 4, 5, 6, true])],
    ['missing pose', frameRecords([0, 1, 2, 3, 4, 5, 6])],
    ['null pose', [...frameRecords([0, 1, 2, 3, 4, 5, 6]), null]],
    ['null frames', null],
    ['undefined frames', undefined],
    ['array-like object', { length: 8, ...Object.fromEntries(frameRecords([0, 1, 2, 3, 4, 5, 6, 7]).map((frame, index) => [index, frame])) }]
  ];
  for (const [label, frames] of cases) await t.test(label, async () => {
    const fix = fixture(frames);
    await assert.rejects(fix.execute(), /Incomplete authored pose coverage/);
    assert.equal(fix.writes.length, 0);
    assert.equal(fix.logs.length, 0);
  });
});

test('anchor merge accepts exactly integer0..7 and preserves existing evidence', async () => {
  for (const indices of [[0, 1, 2, 3, 4, 5, 6, 7], [7, 5, 3, 1, 6, 4, 2, 0]]) {
    const fix = fixture(frameRecords(indices));
    await fix.execute();
    assert.equal(fix.writes.length, 1);
    const document = JSON.parse(fix.writes[0].value);
    assert.deepEqual(document.profiles.unchanged, fix.existing.profiles.unchanged);
    assert.deepEqual(document.profiles[fix.profileId].clips.death.frames.map((frame) => frame.frame), indices);
    assert.equal(document.profiles[fix.profileId].reviewedPoseCount, 8);
    assert.deepEqual(fix.logs, [{ path: globalPath, mergedProfiles: 1, reviewedProfiles: 1, reviewedPoses: 8, acceptedAutomatically: 0 }]);
  }
});

