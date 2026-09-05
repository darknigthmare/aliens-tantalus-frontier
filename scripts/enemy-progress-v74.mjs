import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from './enemy-batch-production.mjs';
import { auditNext50V73 } from './enemy-next50-audit-v73.mjs';

// Same frozen fifty: do not silently choose a fresh fifty after each acceptance.
// The V73 snapshot remains historical; this separate snapshot follows V74.
export async function auditEnemyProgressV74() {
  const current = await auditNext50V73();
  return { ...current, release: '74.0.0',
    unfinishedProfileCount: current.profileCount - current.integratedProfiles.length,
    visualReviewRequired: true,
    currentCorrections: [
      { profileId: 'enemy-016-burster', work: 'Compression telegraph, single blast, terminal animation, body scale and symmetric range.',
        evidence: 'docs/references/v74-enemy-fixes/016/README.md',
        remainingPolish: 'Blast uses existing runtime particles; no dedicated explosion sprite sheet was produced.' },
      { profileId: 'enemy-050-korari-stalker', work: 'Dedicated32-pose atlas, calibrated quadruped body, symmetric bite/pounce and collision tests.',
        evidence: 'docs/references/v74-enemy-fixes/050/FINAL_QA.md', identity: 'project-original-not-canon-copy' },
      { profileId: 'enemy-049-wild-boar-host', work: 'Measured residual interclip scale corrected without changing source PNGs.',
        evidence: 'docs/references/v74-enemy-fixes/049/FINAL_QA.md',
        blocked: 'Dark purple edge fringe remains; runtime integration and final alpha review are still required.' },
      { profileId: 'enemy-054-albino-facehugger', work: 'Two actual OpenAI attack cleanup candidates generated and independently reviewed.',
        evidence: 'docs/references/v74-enemy-fixes/054/README_R2_BLOCKED.md',
        blocked: 'R1 has a baked checkerboard. R2 retains opaque pink/violet material between fingers and changes the opening. Neither replaces the active source.' }
    ] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await auditEnemyProgressV74();
  const target = resolve(ROOT, 'docs/references/V74_ENEMY_PROGRESS.json');
  const serialized = JSON.stringify(report, null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (await readFile(target, 'utf8') !== serialized) throw new Error('V74 progress snapshot is stale. Regenerate this snapshot; preserve the historical V73 report.');
  } else await writeFile(target, serialized);
  const { profiles, ...summary } = report;
  console.log(JSON.stringify(summary, null, 2));
}
