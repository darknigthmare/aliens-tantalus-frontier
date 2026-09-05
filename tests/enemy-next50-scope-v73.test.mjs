import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { selectNext50V73 } from '../docs/references/v73-next50-player/scope.mjs';
const queue = JSON.parse(await readFile(new URL('../docs/references/V66_ENEMY_BATCH_QUEUE.json', import.meta.url)));
test('V73 freezes exactly50 identities,216 sheets and1728 authored poses', () => {
  const jobs = selectNext50V73(queue.jobs);
  assert.equal(jobs.length, 50);
  assert.equal(jobs[0].profileId, 'enemy-007-praetorian');
  assert.equal(jobs.at(-1).profileId, 'enemy-057-albino-warrior');
  assert.equal(jobs.reduce((sum, job) => sum + job.clips.length, 0), 216);
  assert.ok(!jobs.some((job) => job.profileId.startsWith('enemy-020-')));
  assert.ok(jobs.some((job) => job.profileId === 'enemy-055-albino-chestburster'));
});
test('V73 cannot silently publish a smaller or duplicated scope', () => {
  assert.throws(() => selectNext50V73([]), /exactement50/);
  const jobs = selectNext50V73(queue.jobs);
  assert.throws(() => selectNext50V73([...jobs.slice(1), jobs[1]]), /distincts/);
});
