import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentHash } from '../../../scripts/enemy-batch-contracts.mjs';
import { ENEMIES } from '../../../src/content.js';
import { resolveEnemyArchetype, resolveEnemyVisualProfile } from '../../../src/enemy-visual-runtime-v53.js';
import { resolveSpriteSheet } from '../../../src/sprite-animation-runtime.js';
import { ENEMY_STATIC_POSES_V95, getEnemyStaticPoseStatesV95 } from '../../../src/enemy-static-poses-v95.js';
import { ENEMY_EXPANSION_CANDIDATES_V96, ENEMY_EXPANSION_SOURCES_V96 } from '../../../src/enemy-expansion-candidates-v96.js';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT_V96 = resolve(HERE, '../../..');
const HOLD_PATH = 'docs/references/v95-user-creatures/STATUS-20260926.json';
const QUEUE_PATH = 'docs/references/V66_ENEMY_BATCH_QUEUE.json';
const LEGACY_PATHS = Object.freeze({ human: '/assets/openai/human-factions-animation-sheet.png', synthetic: '/assets/openai/synthetic-android-animation-sheet.png', pathogen: '/assets/openai/pathogen-fauna-animation-sheet.png', neuroXeno: '/assets/openai/neuro-xeno-animation-sheet.png' });
export const PRIORITIZED_EXISTING_IDS_V96 = Object.freeze([
  'enemy-145-armored-working-joe', 'enemy-146-armored-combat-synthetic',
  'enemy-147-armored-weyland-yutani-commando', 'enemy-148-armored-upp-vanguard',
  'enemy-149-armored-seegson-security', 'enemy-150-armored-colonial-raider',
  'enemy-151-armored-atarax-controller', 'enemy-154-armored-korari-stalker'
]);
// Review routing only, not a new moderation verdict or permission to rephrase.
const HOLD_SCOPE_TERMS = Object.freeze([
  ['Neomorph', 'Neomorph-Neomorph.jpg'], ['Abomination', 'Xeno abobimantion.jpg'],
  ['Carrier', 'Xeno-Carrier--Empty.jpg'], ['Drone', 'Xeno-Drone-Variante.jpg'],
  ['Praetorian', 'Xeno-Praetorian-1.jpg'], ['Prowler', 'Xeno-Prowler.jpg'],
  ['Warrior', 'xeno-Soldier-Brown.jpg'], ['Spitter', 'Xeno-Spitter.jpg'], ['Xenoborg', 'Xeno Bruiser Mecha.jpg']
]);
const sha256 = value => createHash('sha256').update(value).digest('hex');
const count = (rows, key) => rows.reduce((totals, row) => { const value = String(row[key] ?? 'unknown'); totals[value] = (totals[value] || 0) + 1; return totals; }, {});
const canonicalName = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function classifyEnemyVisualV96(profile) {
  if (!profile || profile.approximate !== false) return 'shared-family-fallback';
  return profile.legacy ? 'identity-specific-legacy-row' : 'identity-specific-atlas';
}
export function holdScopeReviewV96(archetype, holds) {
  const known = new Set(holds.map(hold => hold.file));
  return [...new Set(HOLD_SCOPE_TERMS.filter(([term, file]) => String(archetype).includes(term) && known.has(file)).map(([, file]) => file))];
}

export function auditEnemyRosterV96({ projectRoot = PROJECT_ROOT_V96, catalog = ENEMIES,
  staticDefinitions = ENEMY_STATIC_POSES_V95, candidates = ENEMY_EXPANSION_CANDIDATES_V96,
  visualResolver = resolveEnemyVisualProfile, sheetResolver = resolveSpriteSheet,
  stateResolver = getEnemyStaticPoseStatesV95, hashFiles = true } = {}) {
  const loadJson = path => JSON.parse(readFileSync(resolve(projectRoot, path), 'utf8'));
  const holds = loadJson(HOLD_PATH).entries.filter(entry => String(entry.status).startsWith('held')).map(entry => ({
    sourceNumber: entry.sourceNumber, file: entry.file, sourceSha256: entry.sourceSha256,
    status: entry.status, retry: false, receipt: entry.receipt || null
  }));
  const previousById = new Map(loadJson(QUEUE_PATH).jobs.map(job => [job.profileId, job]));
  const assetCache = new Map();
  function inspectAsset(path, expectedSha256 = null) {
    if (typeof path !== 'string' || !path) return { path: null, exists: false, sha256: null, hashMatches: null };
    const sourcePath = path.replace(/^\//, '');
    const absolutePath = resolve(projectRoot, sourcePath);
    const rel = relative(projectRoot, absolutePath);
    if (isAbsolute(rel) || rel === '..' || rel.startsWith('../') || rel.startsWith('..\\'))
      return { path, exists: false, sha256: null, hashMatches: false, invalidPath: true };
    if (!assetCache.has(sourcePath)) {
      const exists = existsSync(absolutePath);
      assetCache.set(sourcePath, { path: `/${sourcePath}`, exists, sha256: exists && hashFiles ? sha256(readFileSync(absolutePath)) : null });
    }
    const asset = assetCache.get(sourcePath);
    return { ...asset, hashMatches: expectedSha256 && asset.sha256 ? expectedSha256 === asset.sha256 : null };
  }
  const profiles = catalog.map(enemy => {
    const profile = visualResolver(enemy);
    const sheet = profile?.sheetId ? sheetResolver(profile.sheetId) : null;
    return {
      profileId: enemy.id, name: enemy.name, modifier: enemy.modifier, archetype: resolveEnemyArchetype(enemy),
      biology: enemy.biology, provenance: enemy.provenance, coverage: classifyEnemyVisualV96(profile),
      identityStatus: profile?.identityStatus || null, approximate: profile?.approximate !== false,
      sheetId: profile?.sheetId || null, legacyRow: profile?.legacy ? profile.row ?? null : null,
      currentAsset: inspectAsset(profile?.path || sheet?.path || LEGACY_PATHS[profile?.imageKey]),
      staticCounterpartIds: staticDefinitions.filter(definition => definition.legacyCounterpartId === enemy.id).map(definition => definition.id),
      fallbackReason: profile?.fallbackReason || null, legacyCanonExactFlag: profile?.canonExact === true, fidelityCertified: false
    };
  });
  const staticProfiles = staticDefinitions.map(definition => ({
    profileId: definition.id, name: definition.name, legacyCounterpartId: definition.legacyCounterpartId || null,
    visualMode: 'static-pose', animationStatus: 'missing', asset: inspectAsset(definition.path, definition.sha256),
    states: stateResolver(definition.id).map(state => ({ stateId: state.stateId || state.id,
      asset: inspectAsset(state.path, state.sha256), changesIdentity: false })), fidelityCertified: false
  }));
  const productionQueue = profiles.filter(profile => profile.approximate).map(profile => {
    const previous = previousById.get(profile.profileId);
    const scopeHolds = holdScopeReviewV96(profile.archetype, holds);
    const referenceLockValid = previous?.reference?.status === 'reviewed' && contentHash(previous.reference) === previous.referenceLockSha256;
    const blockedReasons = [
      ...(scopeHolds.length ? ['Potential overlap with a prior held source; review scope, never retry or rephrase that source.'] : []),
      ...(referenceLockValid ? [] : ['Variant-specific reference/design lock not yet approved or its hash is invalid.']),
      ...(!profile.currentAsset.exists ? ['Current fallback asset missing.'] : [])
    ];
    return {
      profileId: profile.profileId, name: profile.name, archetype: profile.archetype, modifier: profile.modifier,
      biology: profile.biology, provenance: profile.provenance, interpretation: 'project-systemic-variant', canonExact: false,
      prioritized: PRIORITIZED_EXISTING_IDS_V96.includes(profile.profileId), eligible: !blockedReasons.length,
      blocked: !!blockedReasons.length, eligibilityMeaning: 'native-animation-production',
      sourceStatus: scopeHolds.length ? 'held-scope-review' : referenceLockValid ? 'reviewed-legacy-design-lock-hash-verified' : 'variant-design-lock-pending',
      blockedReasons, priorHoldSourceNames: scopeHolds, currentFallback: profile.currentAsset,
      staticCounterpartIds: profile.staticCounterpartIds, previousBatchId: previous?.batchId || null,
      referenceLockSha256: previous?.referenceLockSha256 || null, referenceLockValid, previousReference: previous?.reference || null,
      targetAtlas: previous?.normalizedPath || null, metadataPath: previous?.metadataPath || null,
      admissionStatus: 'not-admitted-as-dedicated-animation',
      requiredClips: (previous?.clips || []).map(clip => ({ id: clip.id, frameCount: clip.frameCount,
        sourcePath: clip.sourcePath, sourcePresent: inspectAsset(clip.sourcePath).exists,
        normalizedPath: clip.normalizedPath, normalizedPresent: inspectAsset(clip.normalizedPath).exists, promptSha256: clip.promptSha256 }))
    };
  });
  const existingNames = new Set([...catalog, ...staticDefinitions].map(entry => canonicalName(entry.name)));
  const existingIds = new Set([...catalog, ...staticDefinitions].map(entry => entry.id));
  const expansionCandidates = candidates.map(candidate => ({ ...candidate,
    duplicateIdentity: existingIds.has(candidate.id) || candidate.aliases.some(alias => existingNames.has(canonicalName(alias))),
    absenceCheck: 'Exact normalized identity/alias match against ENEMIES and V95 static roster; not an exhaustive franchise ontology.' }));
  const staticAssets = staticProfiles.flatMap(profile => [profile.asset, ...profile.states.map(state => state.asset)]);
  return {
    schema: 'v96-enemy-roster-audit/1', baseline: 'V95 historical roster; V96 additions use separate admission overlays',
    scope: 'Complete known ENEMIES production queue plus six researched missing licensed identities. Not an exhaustive inventory of every franchise work.',
    deterministic: true, canonExact: false, rosterSha256: sha256(JSON.stringify(catalog)),
    holdsSha256: sha256(readFileSync(resolve(projectRoot, HOLD_PATH))), previousQueueSha256: sha256(readFileSync(resolve(projectRoot, QUEUE_PATH))),
    totals: {
      catalogProfiles: profiles.length, standardProfiles: catalog.filter(enemy => enemy.modifier === 'Standard').length,
      systemicVariants: catalog.filter(enemy => enemy.modifier !== 'Standard').length,
      catalogProvenance: count(catalog, 'provenance'), queuedProvenance: count(productionQueue, 'provenance'),
      coverage: count(profiles, 'coverage'), identityStatuses: count(profiles, 'identityStatus'),
      missingCurrentAssets: profiles.filter(profile => !profile.currentAsset.exists).length,
      staticIdentities: staticProfiles.length, staticProfilesWithCounterparts: staticProfiles.filter(profile => profile.legacyCounterpartId).length,
      staticVisualStateRecords: staticProfiles.reduce((total, profile) => total + profile.states.length, 0),
      uniqueStaticAssetPaths: new Set(staticAssets.map(asset => asset.path)).size,
      staticMissingAssets: staticAssets.filter(asset => !asset.exists).length, staticHashMismatches: staticAssets.filter(asset => asset.hashMatches === false).length,
      heldSourceFiles: holds.length, holdsByStatus: count(holds, 'status'), queuedDedicatedProfiles: productionQueue.length,
      queuedNativeClipBoards: productionQueue.reduce((total, job) => total + job.requiredClips.length, 0),
      eligibleProductionJobs: productionQueue.filter(job => job.eligible).length, blockedProductionJobs: productionQueue.filter(job => job.blocked).length,
      prioritizedProductionJobs: productionQueue.filter(job => job.prioritized).length, sourceStatuses: count(productionQueue, 'sourceStatus'),
      expansionCandidates: expansionCandidates.length, expansionDuplicateIdentities: expansionCandidates.filter(candidate => candidate.duplicateIdentity).length,
      expansionRuntimeEligible: expansionCandidates.filter(candidate => candidate.eligible).length
    }, safeguards: [
      'Static identities and colour states never automatically cover catalog profile IDs.',
      'Dedicated legacy rows are counted separately from modern identity-specific atlases.',
      'A raw image filename never proves admission, animation, or 1:1 fidelity.',
      'A native static pose never closes an animation-production job.',
      'All 17 V95 held sources remain held with retry=false.'
    ], holds, profiles, staticProfiles, productionQueue, expansionCandidates, sources: ENEMY_EXPANSION_SOURCES_V96
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditEnemyRosterV96({ hashFiles: !process.argv.includes('--no-hash') });
  if (process.argv.includes('--write')) writeFileSync(resolve(HERE, 'production-manifest-v96.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(process.argv.includes('--json') ? report : report.totals, null, 2));
  if (report.totals.missingCurrentAssets || report.totals.staticMissingAssets || report.totals.staticHashMismatches || report.totals.heldSourceFiles !== 17 || report.totals.expansionDuplicateIdentities) process.exitCode = 1;
}
