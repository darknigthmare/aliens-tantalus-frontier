// Deterministic planning only; native generation and visual review are separate.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { ENEMIES } from '../../../src/content.js';
import { resolveEnemyVisualProfile } from '../../../src/enemy-visual-runtime-v53.js';
import { resolveSpriteSheet } from '../../../src/sprite-animation-runtime.js';
import { ENEMY_DEDICATED_POSES_V98 } from '../../../src/enemy-dedicated-poses-v98.js';
const prior = JSON.parse(readFileSync(new URL('../v96-xeno-trials/production-manifest-v96.json', import.meta.url)));
const holds = ['v97', 'v98'].flatMap(v => JSON.parse(readFileSync(new URL(`../${v}-batch-050/ADMISSION.json`, import.meta.url))).outcomes.filter(p => p.status === 'held').map(p => p.profileId));
const excluded = new Set([...ENEMY_DEDICATED_POSES_V98.map(p => p.profileId), ...holds]);
const locks = {
  'Acid-Blooded': 'Original systemic acid-blooded project variant: preserve exact base anatomy, appendage count, equipment, silhouette and identity colors. Subtle olive-amber iridescence and restrained yellow-green subdermal seams suggest its fictional acidic physiology. All skin and carapace are intact. No injury, exposed organs, blood, spray, splatter, puddle, aura, glow outline or extra appendages. Newly authored material detail, not an automatic recolor. This is not a new official species.',
  'Cryo-Adapted': 'Original systemic cold-adapted project variant, not a new official species. Preserve exact base anatomy, appendage count, equipment, silhouette, identity colors and existing material relief. Add restrained pale blue-grey frost microtexture at exposed ridges and newly authored cold-weather material details without concealing the base design. People retain recognizable uniforms and practical insulated panels; organic creatures remain organic. No generic white recolor, ice armor, icicle weapons, snow scene, particles, mist, aura, glow outline, extra appendages, blood or injury.',
};
const jobs = prior.productionQueue.filter(p => !p.priorHoldSourceNames.length && !excluded.has(p.profileId)).slice(0, 50).map((p, i) => {
  const base = ENEMIES.find(e => e.modifier === 'Standard' && e.name === p.archetype);
  if (!base) throw new Error(`No exact base ${p.profileId}`);
  const visual = resolveEnemyVisualProfile(base);
  const sheet = resolveSpriteSheet(visual.sheetId);
  const referencePath = (visual.path || sheet?.path || prior.profiles.find(e => e.profileId === base.id)?.currentAsset.path)?.replace(/^\//, '');
  if (!referencePath) throw new Error(`No reference ${p.profileId}`);
  const bytes = readFileSync(new URL(`../../../${referencePath}`, import.meta.url));
  const variantLock = p.previousReference?.designLock || locks[p.modifier];
  if (!variantLock) throw new Error(`Unspecified modifier ${p.modifier}`);
  return { ordinal: i + 1, shard: i < 17 ? 'a' : i < 34 ? 'b' : 'c', profileId: p.profileId, name: p.name,
    archetype: p.archetype, modifier: p.modifier, biology: p.biology, provenance: p.provenance, baseProfileId: base.id,
    referencePath, referenceSha256: createHash('sha256').update(bytes).digest('hex'), variantLock,
    previousAnimationLockValid: p.referenceLockValid, priorHoldSourceNames: [],
    outputPath: `assets/openai/sprites/static-enemy-v99/${p.profileId}.png`, status: 'pending-native-generation',
    canonExact: false, animationStatus: 'missing', sourceFacing: 1,
    targetOpaqueHeight: visual.renderHeight || sheet?.renderHeight || (base.caste === 'parasite' ? 48 : base.caste === 'egg' ? 88 : base.caste === 'royal' ? 240 : 104) };
});
if (jobs.length !== 50) throw new Error('Expected exactly 50');
writeFileSync(new URL('batch-050.json', import.meta.url), JSON.stringify({ schema: 'v99-native-static-batch/1', date: '2026-09-27', targetCount: 50,
  scope: 'Next 50 historical profiles without dedicated art. Excludes all 17 pre-V97 held scopes, all seven V97 holds, all ten V98 holds and all 86 delivered poses. Static project variants only; no canonical or animation certification.',
  holdsUnchanged: 34, historicalProfilesSha256: createHash('sha256').update(JSON.stringify(jobs.map(j => ENEMIES.find(e => e.id === j.profileId)))).digest('hex'), jobs }, null, 2) + '\n');
console.log(jobs.map(j => `${j.ordinal} ${j.shard} ${j.profileId}`).join('\n'));
