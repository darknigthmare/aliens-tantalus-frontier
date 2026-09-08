import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildEnemyBatchQueue } from '../scripts/enemy-batch-production.mjs';
test('V75 only Ceto051 has an aquatic pivot, all historical job pivots remain byte-equivalent', async () => {
  const references=JSON.parse(await readFile(new URL('../docs/references/V66_ENEMY_BATCH_REFERENCES.json',import.meta.url),'utf8'));
  const previous=JSON.parse(await readFile(new URL('../docs/references/V66_ENEMY_BATCH_QUEUE.json',import.meta.url),'utf8'));
  const queue=buildEnemyBatchQueue({references});
  assert.equal(queue.jobs.length,previous.jobs.length);
  for(const job of queue.jobs){
    const prior=previous.jobs.find(entry=>entry.profileId===job.profileId);
    assert.ok(prior,job.profileId);
    assert.deepEqual(job.pivot,{x:128,y:job.profileId==='enemy-051-ceto-reef-predator'?192:240});
    if(job.profileId!=='enemy-051-ceto-reef-predator') assert.deepEqual(job.pivot,prior.pivot);
  }
});
