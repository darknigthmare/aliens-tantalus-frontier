import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENEMIES } from '../src/content-core-v50.js';
import { V65_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v65.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v66.js';
import { V81_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v81.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { SPRITE_HITBOXES, resolveSpriteClip, resolveSpriteSheet } from '../src/sprite-animation-runtime.js';
import { ENEMY_BATCH_COMBAT_CONTRACTS_V66, ENEMY_COMBAT_CONTRACTS_V81, BURSTER_COMBAT_V74 } from '../src/enemy-batch-combat-v66.js';
import { FACEHUGGER_COMBAT_V65 } from '../src/enemy-facehugger-combat-v65.js';
import { CETO_V75 } from '../src/enemy-ceto-v75.js';
import { OVOMORPH_CYCLE_V66 } from '../src/enemy-ovomorph-cycle-v66.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const V82_PROGRESS_PATH = 'docs/references/V82_ENEMY_PROGRESS.json';
const CHECKPOINT = 'docs/references/V75_ENEMY_PROGRESS.json';
const QUEUE = 'docs/references/V66_ENEMY_BATCH_QUEUE.json';
const MANIFEST = 'assets/openai/sprites/metadata/v81/enemy-wave-manifest.json';
const FACEHUGGER = 'enemy-002-facehugger';
const REVIEW_KEYS = ['identity', 'anatomy', 'direction', 'scale', 'clipSemantics', 'continuity', 'alpha', 'cellBounds'];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const requireEvidence = (condition, message) => { if (!condition) throw new Error(message); };
const stripSlash = path => path.replace(/^\//, '');
const sourceAssets = () => [
  ...V65_READY_ENEMY_PROFILE_ASSETS.map(asset => ({ ...asset, wave: 'v65' })),
  ...V66_READY_ENEMY_PROFILE_ASSETS.map(asset => ({ ...asset, wave: 'v66' })),
  ...V81_READY_ENEMY_PROFILE_ASSETS
];

function scopedPath(root, path) {
  requireEvidence(typeof path === 'string' && !path.includes('\\'), 'Expected a repository asset path');
  const target = resolve(root, stripSlash(path));
  const local = relative(root, target);
  requireEvidence(local && !local.startsWith('..') && !isAbsolute(local), `Path outside repository: ${path}`);
  return target;
}

// A normalized candidate is deliberately absent from this input until its
// exact profile receives acceptance in a runtime allowlist. No folder scan.
export function reconcileEnemyCoverageV82({ catalogIds, productionIds, baselineIds, verifiedIds }) {
  for (const [name, ids] of Object.entries({ catalogIds, productionIds, baselineIds, verifiedIds })) {
    requireEvidence(new Set(ids).size === ids.length, `Duplicate ${name}`);
  }
  const catalog = new Set(catalogIds);
  const jobs = new Set(productionIds);
  requireEvidence([...productionIds, ...baselineIds].every(id => catalog.has(id)), 'Unknown queued profile');
  requireEvidence(baselineIds.every(id => !jobs.has(id)), 'Baseline counted as a production job');
  requireEvidence(productionIds.length + baselineIds.length === catalog.size, 'Incomplete production roster');
  requireEvidence(verifiedIds.every(id => catalog.has(id)), 'Unknown accepted profile');
  const integratedProductionIds = verifiedIds.filter(id => jobs.has(id)).sort();
  const integratedBaselineIds = verifiedIds.filter(id => baselineIds.includes(id)).sort();
  return {
    totalProfiles: catalog.size,
    productionJobs: jobs.size,
    integratedProductionProfiles: integratedProductionIds.length,
    integratedBaselineProfiles: integratedBaselineIds.length,
    integratedTotalProfiles: verifiedIds.length,
    notIntegratedProfiles: catalog.size - verifiedIds.length,
    integratedProductionIds,
    integratedBaselineIds
  };
}

export async function auditEnemyProgressV82({ root = ROOT, readBytes, assets = sourceAssets(), createRuntimeActor } = {}) {
  const read = readBytes || (path => readFile(scopedPath(root, path)));
  const json = async path => JSON.parse((await read(path)).toString('utf8'));
  const verifyHash = async (path, expected) => {
    requireEvidence(/^[a-f0-9]{64}$/.test(expected || ''), `Missing expected hash: ${path}`);
    const actual = sha256(await read(path));
    requireEvidence(actual === expected, `Hash mismatch: ${path}`);
    return actual;
  };
  const [checkpoint, queue, manifest] = await Promise.all([json(CHECKPOINT), json(QUEUE), json(MANIFEST)]);
  requireEvidence(checkpoint.release === '75.0.0', 'V75 historical checkpoint missing');
  requireEvidence(manifest.review?.status === 'accepted-project-visual-review' && manifest.canonExact === false,
    'V81 acceptance review missing');
  requireEvidence(new Set(assets.map(asset => asset.profileId)).size === assets.length, 'Duplicate accepted profile');
  const engine = Object.assign(Object.create(GameEngine.prototype), {
    difficultyRuntime: { id: 'standard' }, random: () => 0.5, initializeEnemyMissionNavigation() {}
  });
  const runtimeActor = createRuntimeActor || (source => engine.createEnemy(source, 0, 600, 930));
  const contracts = new Map([
    ...Object.values(ENEMY_BATCH_COMBAT_CONTRACTS_V66), ...Object.values(ENEMY_COMBAT_CONTRACTS_V81),
    BURSTER_COMBAT_V74, FACEHUGGER_COMBAT_V65, CETO_V75, OVOMORPH_CYCLE_V66
  ].map(contract => [contract.sheetId, contract]));
  const profiles = [];
  for (const asset of [...assets].sort((a, b) => a.profileId.localeCompare(b.profileId))) {
    const { profileId, wave } = asset;
    const source = ENEMIES.find(entry => entry.id === profileId);
    requireEvidence(source && asset.identityVerified === true, `Unverified profile: ${profileId}`);
    requireEvidence(asset.canonExact !== true, `Unproven exact fidelity: ${profileId}`);
    const baseline = profileId === FACEHUGGER && wave === 'v65';
    requireEvidence(baseline || asset.reviewStatus === 'accepted', `Missing acceptance: ${profileId}`);
    const metadataPath = baseline
      ? 'assets/openai/sprites/metadata/v65/facehugger-motion/enemy-002-facehugger.json'
      : `assets/openai/sprites/metadata/${wave}/${profileId}.json`;
    const metadata = await json(metadataPath);
    requireEvidence(metadata.profileId === profileId && metadata.normalizationStatus === 'validated'
      && metadata.canonExact === false, `Invalid normalization evidence: ${profileId}`);
    requireEvidence(stripSlash(metadata.normalized) === stripSlash(asset.path), `Atlas identity mismatch: ${profileId}`);
    const atlasHash = await verifyHash(asset.path, asset.normalizedSha256 || metadata.normalizedSha256);
    requireEvidence(metadata.normalizedSha256 === atlasHash, `Stale atlas metadata: ${profileId}`);
    let acceptanceEvidence;
    if (baseline) {
      requireEvidence(queue.baseline.some(entry => entry.profileId === profileId && entry.status === 'integrated-baseline-v65')
        && typeof metadata.identityReview === 'string' && metadata.identityReview.length > 0,
      'Facehugger baseline acceptance missing');
      acceptanceEvidence = metadataPath;
    } else if (wave === 'v81') {
      const entry = manifest.profiles.find(profile => profile.profileId === profileId);
      requireEvidence(entry && entry.normalizedSha256 === atlasHash, `V81 manifest mismatch: ${profileId}`);
      await verifyHash(metadataPath, entry.metadataSha256);
      acceptanceEvidence = MANIFEST;
    } else {
      requireEvidence(wave === 'v66', `Unreviewed wave: ${wave}`);
      acceptanceEvidence = `docs/references/v75-enemy-fixes/release/accepted-${profileId}.json`;
      const accepted = await json(acceptanceEvidence);
      const integrated = await json(`docs/references/v75-enemy-fixes/release/integrated-${profileId}.json`);
      requireEvidence(accepted.kind === 'accepted' && accepted.profileId === profileId && accepted.canonExact === false
        && REVIEW_KEYS.every(key => accepted.review?.[key] === true), `Incomplete acceptance review: ${profileId}`);
      requireEvidence(integrated.kind === 'integrated' && integrated.profileId === profileId
        && integrated.runtimeEvidence?.result === 'pass', `Missing runtime evidence: ${profileId}`);
    }
    requireEvidence(metadata.sources?.length > 0, `Missing authored sources: ${profileId}`);
    for (const item of metadata.sources) await verifyHash(item.path, item.sha256);
    const actor = runtimeActor(source);
    const sheetId = `enemy.profile.${profileId}.${wave}`;
    requireEvidence(actor.visualSheetId === sheetId, `Production runtime mismatch: ${profileId}`);
    const sheet = resolveSpriteSheet(sheetId);
    requireEvidence(sheet && sheet.path === asset.path && sheet.sourceFacing === asset.sourceFacing
      && SPRITE_HITBOXES[sheet.hitbox] && contracts.has(sheetId), `Incomplete runtime contract: ${profileId}`);
    requireEvidence(metadata.frameCount === sheet.columns * sheet.rows, `Frame count mismatch: ${profileId}`);
    for (const clip of metadata.clips) {
      // V65 names the authored locomotion source scuttle; the runtime uses chase.
      const clipId = baseline && clip.id === 'scuttle' ? 'chase' : clip.id;
      const runtimeClip = resolveSpriteClip(sheetId, clipId);
      requireEvidence(runtimeClip && JSON.stringify(runtimeClip.frames) === JSON.stringify(clip.frames),
        `Runtime clip mismatch: ${profileId}/${clip.id}`);
    }
    profiles.push({ profileId, wave, baseline, atlasPath: stripSlash(asset.path), atlasSha256: atlasHash,
      frameCount: metadata.frameCount, sourceHashesVerified: metadata.sources.length,
      acceptanceEvidence, metadataPath, runtimeSheetId: sheetId, runtimeBehavior: actor.behavior,
      gameplayContract: contracts.get(sheetId).action || (baseline ? 'facehugger-pounce' : profileId === OVOMORPH_CYCLE_V66.profileId ? 'ovomorph-lifecycle' : 'ceto-aquatic-bite'),
      status: 'accepted-runtime-integrated', commercialCompletionCertified: false, canonExact: false });
  }
  const coverage = reconcileEnemyCoverageV82({ catalogIds: ENEMIES.map(entry => entry.id),
    productionIds: queue.jobs.map(entry => entry.profileId), baselineIds: queue.baseline.map(entry => entry.profileId),
    verifiedIds: profiles.map(entry => entry.profileId) });
  const integrated = new Set(profiles.map(entry => entry.profileId));
  return {
    schema: 1, release: '82.0.0', generatedBy: 'scripts/enemy-progress-v82.mjs',
    scope: 'Current accepted runtime coverage, reconciled with V65 baseline and V66/V81 allowlists; historical V75 is read-only.',
    warning: 'Integrated means accepted atlas, matching source hashes and effective runtime contracts. This audit does not certify commercial completion, animation quality or 1:1 fidelity and does not rerun browser gameplay QA.',
    ...coverage,
    historicalCheckpoint: { path: CHECKPOINT, sha256: sha256(await read(CHECKPOINT)), release: checkpoint.release,
      integratedProductionProfiles: checkpoint.integratedProfileCount, notIntegratedProfiles: checkpoint.unfinishedProfileCount },
    integratedSinceV75: coverage.integratedProductionIds.filter(id => !checkpoint.integratedProfiles.includes(id)),
    historicalRejectedStillNotIntegrated: checkpoint.reviewRejectedProfiles.filter(id => !integrated.has(id)),
    profiles
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await auditEnemyProgressV82();
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    requireEvidence(await readFile(resolve(ROOT, V82_PROGRESS_PATH), 'utf8') === serialized, 'V82 progress report is stale');
  } else if (process.argv.includes('--write')) {
    await writeFile(resolve(ROOT, V82_PROGRESS_PATH), serialized);
  }
  const { profiles, ...summary } = report;
  console.log(JSON.stringify(summary, null, 2));
}
