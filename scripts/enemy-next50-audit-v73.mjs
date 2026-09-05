import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, getJobStatus } from './enemy-batch-production.mjs';
import { selectNext50V73 } from '../docs/references/v73-next50-player/scope.mjs';
const hash = async (path) => createHash('sha256').update(await readFile(resolve(ROOT, path))).digest('hex');
export async function auditNext50V73() {
  const queue = JSON.parse(await readFile(resolve(ROOT, 'docs/references/V66_ENEMY_BATCH_QUEUE.json')));
  const state = JSON.parse(await readFile(resolve(ROOT, 'docs/references/V66_ENEMY_BATCH_STATE.json')));
  const profiles = [];
  for (const job of selectNext50V73(queue.jobs)) {
    const status = await getJobStatus(job, state, ROOT);
    const sources = [];
    for (const clip of job.clips) {
      try { sources.push({ clip: clip.id, path: clip.sourcePath, sha256: await hash(clip.sourcePath) }); }
      catch (error) { if (error.code !== 'ENOENT') throw error; sources.push({ clip: clip.id, path: clip.sourcePath, missing: true }); }
    }
    let normalization = { present: false, current: false, reviewedRoots: 0 };
    try {
      const metadata = JSON.parse(await readFile(resolve(ROOT, job.metadataPath)));
      const current = metadata.normalizedSha256 === await hash(job.normalizedPath)
        && sources.every((source) => metadata.sources?.some((entry) => entry.clip === source.clip && entry.sha256 === source.sha256));
      normalization = { present: true, current, metadataPath: job.metadataPath, atlasPath: job.normalizedPath,
        frameCount: metadata.frameCount, reviewedRoots: metadata.physicalAnchorReview?.reviewedPoseCount || 0,
        findings: metadata.validation?.findings || [], doesNotCertifyArt: true };
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    profiles.push({ profileId: job.profileId, name: job.name, ...status, sources, normalization });
  }
  return { schema: 1, scope: 'V73 next50 frozen:007..057 excluding020',
    warning: 'File existence and technical checks never certify visual fidelity, finished gameplay or commercial readiness.',
    profileCount: profiles.length, requiredSheets: profiles.reduce((n,p) => n+p.requiredClips,0),
    presentSheets: profiles.reduce((n,p) => n+p.sources.filter(s=>!s.missing).length,0),
    provenanceVerifiedSheets: profiles.reduce((n,p) => n+p.generatedClips,0),
    exactPromptGapSheets: profiles.reduce((n,p) => n+(p.recoveredPromptGaps||0),0),
    normalizedCurrentProfiles: profiles.filter(p=>p.normalization.current).length,
    integratedProfiles: profiles.filter(p=>p.status==='integrated').map(p=>p.profileId), profiles };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await auditNext50V73();
  const target = resolve(ROOT, 'docs/references/V73_NEXT50_STATUS.json');
  const output = JSON.stringify(report, null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (await readFile(target, 'utf8') !== output) throw new Error('V73 next50 snapshot is stale; run this script without --check.');
  } else await writeFile(target, output);
  const { profiles, ...summary } = report;
  console.log(JSON.stringify(summary, null, 2));
}
