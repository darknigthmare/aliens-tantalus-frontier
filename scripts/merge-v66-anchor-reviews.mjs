// Mechanical assembly of independently reviewed fragments; never grants art acceptance.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ROOT, scopedPath } from './enemy-batch-production.mjs';

const [batch, ...fragments] = process.argv.slice(2);
if (!/^batch-[0-9]{3}$/.test(batch || '') || !fragments.length) throw new Error('Usage: merge-v66-anchor-reviews.mjs batch-NNN fragment.json ...');
const readJson = async (path) => JSON.parse(await readFile(scopedPath(ROOT,path),'utf8'));
const queue = await readJson('docs/references/V66_ENEMY_BATCH_QUEUE.json');
const jobs = new Map(queue.jobs.filter((job) => job.batchId === batch).map((job) => [job.profileId,job]));
if (!jobs.size) throw new Error('Unknown batch');
const path = `docs/references/V66_BATCH_${batch.slice(-3)}_ANCHOR_REVIEW.json`;
const document = await readJson(path);
const seen = new Set();
for (const fragmentPath of fragments) {
  const fragment = await readJson(fragmentPath);
  if (fragment.schema !== 1 || fragment.batchId !== batch || fragment.coordinates !== 'nominal-source-cell') throw new Error('Wrong fragment scope: '+fragmentPath);
  for (const [id, entry] of Object.entries(fragment.profiles)) {
    if (seen.has(id)) throw new Error('Duplicate profile in incoming fragments: '+id);
    seen.add(id);
    const job = jobs.get(id);
    if (!job || !entry.reviewer || !entry.reviewedAt || !entry.method) throw new Error('Incomplete reviewer identity: '+id);
    if (Object.keys(entry.clips).length !== job.clips.length) throw new Error('Incomplete clip coverage: '+id);
    for (const clip of job.clips) {
      const record = entry.clips[clip.id];
      const sha = createHash('sha256').update(await readFile(scopedPath(ROOT,clip.sourcePath))).digest('hex');
      if (!record || record.sourceSha256 !== sha) throw new Error('Stale source in fragment: '+id+'/'+clip.id);
      const indices = Array.isArray(record.frames) ? Array.from(record.frames, (frame) => frame?.frame) : [];
      if (indices.length !== 8 || indices.some((index) => !Number.isInteger(index) || index < 0 || index > 7) || new Set(indices).size !== 8) throw new Error('Incomplete authored pose coverage: '+id+'/'+clip.id);
      if (entry.status === 'reviewed' && record.frames.some((frame) => frame.reviewed !== true)) throw new Error('Unreviewed physical pose in reviewed profile: '+id);
    }
    const actualPoseCount = job.clips.length * 8;
    if (entry.status === 'reviewed' && entry.reviewedPoseCount !== undefined && entry.reviewedPoseCount !== actualPoseCount) throw new Error('Reviewed pose count disagrees with frames: '+id);
    if (entry.status === 'reviewed') entry.reviewedPoseCount = actualPoseCount;
    // Pending fragments remain pending and are not consumed as certified physical roots.
    document.profiles[id] = entry;
  }
}
document.reviewScope = 'Physical registration only. Reviewed entries have individually inspected roots; pending entries remain unused by normalization. No artistic acceptance or runtime integration.';
await writeFile(scopedPath(ROOT,path),JSON.stringify(document,null,2)+'\n');
console.log(JSON.stringify({path,mergedProfiles:seen.size,reviewedProfiles:Object.values(document.profiles).filter((entry)=>entry.status==='reviewed').length,reviewedPoses:Object.values(document.profiles).filter((entry)=>entry.status==='reviewed').reduce((count,entry)=>count+entry.reviewedPoseCount,0),acceptedAutomatically:0}));
