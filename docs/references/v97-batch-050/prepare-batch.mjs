import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { ENEMIES } from '../../../src/content.js';
import { resolveEnemyVisualProfile } from '../../../src/enemy-visual-runtime-v53.js';
import { resolveSpriteSheet } from '../../../src/sprite-animation-runtime.js';
import { ENEMY_DEDICATED_POSES_V96 } from '../../../src/enemy-dedicated-poses-v96.js';
const prior = JSON.parse(readFileSync(new URL('../v96-xeno-trials/production-manifest-v96.json', import.meta.url)));
const covered = new Set(ENEMY_DEDICATED_POSES_V96.map(p => p.profileId));
const jobs = prior.productionQueue.filter(p => !p.priorHoldSourceNames.length && !covered.has(p.profileId)).slice(0, 50).map((p, i) => {
  const base = ENEMIES.find(e => e.modifier === 'Standard' && e.name === p.archetype);
  if (!base) throw new Error(`No exact base ${p.profileId}`);
  const visual = resolveEnemyVisualProfile(base);
  const sheet = resolveSpriteSheet(visual.sheetId);
  const referencePath = (visual.path || sheet?.path || prior.profiles.find(e => e.profileId === base.id)?.currentAsset.path)?.replace(/^\//, '');
  if (!referencePath) throw new Error(`No reference ${p.profileId}`);
  const bytes = readFileSync(new URL(`../../../${referencePath}`, import.meta.url));
  const variantLock = p.previousReference?.designLock || (p.modifier === 'Albino'
    ? 'Original systemic pale-material variant of the exact existing base anatomy and equipment: warm ivory, ash-gray and restrained pink-beige material accents; preserve surface relief and readability. For humans this means pale field equipment, not a claim about ethnicity or a canonical faction uniform. No extra appendages, invented anatomy or new weapons.'
    : 'Original systemic armored variant: preserve exact base anatomy, equipment and silhouette family, add practical layered protection consistent with the base. Organic creatures have dark natural carapace plates, not mechanical suits; people retain recognizable uniform and equipment with additional guards. No extra appendages or new weapons.');
  return { ordinal: i + 1, shard: i < 17 ? 'a' : i < 34 ? 'b' : 'c', profileId: p.profileId, name: p.name,
    archetype: p.archetype, modifier: p.modifier, biology: p.biology, provenance: p.provenance, baseProfileId: base.id,
    referencePath, referenceSha256: createHash('sha256').update(bytes).digest('hex'), variantLock,
    previousAnimationLockValid: p.referenceLockValid, priorHoldSourceNames: [],
    outputPath: `assets/openai/sprites/static-enemy-v97/${p.profileId}.png`, status: 'pending-native-generation',
    canonExact: false, animationStatus: 'missing', sourceFacing: 1,
    targetOpaqueHeight: visual.renderHeight || sheet?.renderHeight || (base.caste === 'parasite' ? 48 : base.caste === 'egg' ? 88 : base.caste === 'royal' ? 240 : 104) };
});
if (jobs.length !== 50) throw new Error('Expected exactly 50');
writeFileSync(new URL('batch-050.json', import.meta.url), JSON.stringify({ schema: 'v97-native-static-batch/1', date: '2026-09-26', targetCount: 50,
  scope: 'First 50 historical profiles without dedicated art, excluding all prior held scopes and V96 delivered replacements. Static reference-guided project variants; not canonical certification, not animation admission.',
  holdsUnchanged: 17, jobs }, null, 2) + '\n');
console.log(jobs.map(j => `${j.ordinal} ${j.shard} ${j.profileId}`).join('\n'));
