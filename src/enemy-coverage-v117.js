import { AFE2_ROSTER_V110 } from './afe2-roster-v110.js';
import { getCatalogEntryV62 } from './catalog-runtime-v62.js';
import { getEnemyStaticPoseV96 } from './enemy-static-poses-v96.js';
import { getEnemyDedicatedPoseV99 } from './enemy-dedicated-poses-v99.js';
import { getEnemyImportAnimationV107 } from './enemy-import-animation-v107.js';
import { getCatalogGameplayScaleV72 } from './catalog-scale-v72.js';
import { playerCatalogNameV110 } from './player-surfaces-v110.js';

// Read-only dossier coverage, NOT admissions, spawn tables or inferred aliases.
// A linked illustration, a requested-work adaptation and an animated actor are
// separate facts. In particular, another game's Runner is not an AFE2 model.
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
export const ENEMY_COVERAGE_SOURCES_V117 = freeze({
  afe1Roster: { authority: 'community-roster-not-exhaustive-certification',
    url: 'https://avp.fandom.com/wiki/Aliens:_Fireteam_Elite' },
  darkDescentRoster: { authority: 'community-roster-not-exhaustive-certification',
    url: 'https://avp.fandom.com/wiki/Aliens:_Dark_Descent' },
  pathogen: { authority: 'developer-primary',
    url: 'https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/' },
  afe2LaunchNotes: { authority: 'publisher-primary',
    url: 'https://www.daybreakgames.com/press/afe2/article/afe2-82526-patchnotes' },
  afe2SeptemberNotes: { authority: 'publisher-primary',
    url: 'https://www.daybreakgames.com/press/afe2/article/afe2-91726-patchnotes' },
  darkDescent: { authority: 'publisher-primary',
    url: 'https://store.steampowered.com/app/1150440/Aliens_Dark_Descent/' }
});
export const ENEMY_COVERAGE_GROUPS_V117 = freeze({
  afe2: { name: 'Aliens: Fireteam Elite 2', scope: 'user-requested-35-not-exhaustive', sourceKeys: ['afe2LaunchNotes', 'afe2SeptemberNotes'] },
  afe1: { name: 'Aliens: Fireteam Elite', scope: 'community-listed-base-and-pathogen-contacts', sourceKeys: ['afe1Roster', 'pathogen'] },
  'dark-descent': { name: 'Aliens: Dark Descent', scope: 'community-listed-contacts', sourceKeys: ['darkDescentRoster', 'darkDescent'] },
  'afe2-additional': { name: 'Aliens: Fireteam Elite 2', scope: 'additional-publisher-names-identity-unresolved', sourceKeys: ['afe2LaunchNotes', 'afe2SeptemberNotes'] }
});
export const ENEMY_COVERAGE_LABELS_V117 = freeze({
  missing: 'Contact sans dossier relié',
  'shared-species': 'Espèce disponible — autre version',
  'afe1-adaptation': 'Illustration Fireteam Elite — pas la version AFE2',
  'afe2-adaptation': 'Adaptation AFE2 — fidélité non certifiée',
  'source-adaptation': 'Illustration de cette œuvre — fidélité non certifiée',
  'synth-adaptation': 'Adaptation de lignée synthétique — modèle exact non certifié',
  'project-interpretation': 'Interprétation de famille — identité visuelle non résolue',
  unresolved: 'Nom documenté — identité à résoudre'
});
const row = (group, id, name, family, status, profileId = null, note = null) => freeze({ group, id, name, family, status, profileId, note });
const shared = id => AFE2_ROSTER_V110.find(entry => entry.id === id)?.profileId || null;
const xeno = (group, id, name) => row(group, id, name, 'xenomorph', 'shared-species', shared(id));
const afe1 = (id, name, family, profileId, status = 'source-adaptation', note = null) => row('afe1', id, name, family, status, profileId, note);
const dd = (id, name, family, profileId = null, status = 'missing', note = null) => row('dark-descent', id, name, family, status, profileId, note);

// Only explicit profile links. Maintenance/Worker never aliases Seegson's Joe;
// a custom Titan Queen does not establish the Dark Descent Titan's identity.
export const ENEMY_COVERAGE_REQUESTS_V117 = freeze([
  ...AFE2_ROSTER_V110.map(entry => ({ ...entry, group: 'afe2', note: null })),
  xeno('afe1', 'egg', 'Egg / Ovomorphe'), xeno('afe1', 'facehugger', 'Facehugger'), xeno('afe1', 'runner', 'Runner'),
  afe1('burster', 'Burster', 'xenomorph', shared('burster')),
  afe1('prowler', 'Prowler', 'xenomorph', shared('prowler')),
  xeno('afe1', 'spitter', 'Spitter'), xeno('afe1', 'drone', 'Drone'), xeno('afe1', 'queen', 'Queen'), xeno('afe1', 'warrior', 'Warrior'),
  afe1('irradiated-spitter', 'Irradiated Spitter', 'xenomorph', null, 'missing'),
  afe1('three', 'Three', 'xenomorph', null, 'missing', 'Identité nommée du relevé communautaire ; aucun alias de Praetorian inventé.'),
  afe1('crusher', 'Crusher', 'xenomorph', shared('crusher')), xeno('afe1', 'praetorian', 'Praetorian'),
  afe1('pathogen-husk', 'Pathogen Husk', 'pathogen', null, 'missing'),
  afe1('pathogen-popper', 'Pathogen Popper', 'pathogen', shared('pathogen-popper')),
  afe1('pathogen-runner', 'Pathogen Runner', 'pathogen', shared('pathogen-runner')),
  afe1('pathogen-blight', 'Pathogen Blight', 'pathogen', shared('pathogen-blight')),
  afe1('pathogen-stalker', 'Stalker — Pathogen', 'pathogen', 'castes-game_afe_pathogen_stalker'),
  afe1('pathogen-brute', 'Pathogen Brute', 'pathogen', shared('pathogen-brute')),
  afe1('pathogen-queen', 'Pathogen Queen', 'pathogen', 'castes-game_pathogen_queen'),
  afe1('maintenance-synth', 'Maintenance Synth', 'synthetic', null, 'missing', 'Aucun modèle Weyland-Yutani exact relié ; Working Joe reste Seegson.'),
  afe1('trooper', 'Synth Trooper', 'synthetic', shared('trooper')),
  afe1('guard', 'Synth Guard', 'synthetic', 'pose-v94-afe-synth-guard'),
  afe1('containment', 'Containment Synth', 'synthetic', shared('containment'), 'synth-adaptation'),
  afe1('synth-warden', 'Synth Warden', 'synthetic', 'pose-v106-import-game-afe-synth-warden'),
  afe1('overcharged-warden', 'Overcharged Warden', 'synthetic', null, 'missing'),
  afe1('detonator', 'Synth Detonator', 'synthetic', shared('detonator'), 'synth-adaptation'),
  afe1('sniper', 'Synth Sniper', 'synthetic', shared('sniper')),
  afe1('incinerator', 'Synth Incinerator', 'synthetic', shared('incinerator'), 'synth-adaptation'),
  afe1('heavy', 'Synth Heavy', 'synthetic', shared('heavy')),
  xeno('dark-descent', 'egg', 'Egg / Ovomorphe'), xeno('dark-descent', 'facehugger', 'Facehugger'),
  dd('chestburster', 'Chestburster', 'xenomorph', 'castes-film_chestburster_alien_1979', 'shared-species'),
  xeno('dark-descent', 'runner', 'Runner'), xeno('dark-descent', 'drone', 'Drone'), xeno('dark-descent', 'warrior', 'Warrior'),
  xeno('dark-descent', 'crusher', 'Crusher'), xeno('dark-descent', 'praetorian', 'Praetorian'), xeno('dark-descent', 'queen', 'Queen'),
  dd('titan', 'Titan', 'xenomorph'),
  dd('wy-commando', 'Weyland-Yutani Commando', 'human', 'pose-v106-import-game-dd-wy-commando', 'source-adaptation', 'Import Altered conservé ; pas de certification de modèle du jeu source.'),
  dd('wy-private-security', 'Weyland-Yutani private security', 'human'),
  dd('daniel-series', 'Synthetic — Daniel series', 'synthetic', 'pose-v106-import-game-dd-synthetic', 'source-adaptation', 'Dossier DD synthétique relié ; identification de série Daniel non vérifiée.'),
  dd('cultist', 'Cultist', 'human', 'pose-v118-dd-darwin-era-cultist', 'source-adaptation', 'Adaptation du concept de production Darwin Era ; pose fixe, pas une certification du modèle final 1:1.'),
  dd('guardian', 'Guardian — Darwin Era', 'human', 'pose-v106-import-game-dd-guardian', 'source-adaptation', 'Famille actuelle humaine ; transformations et physiologie à documenter, pas une évolution xénomorphe inventée.'),
  dd('numinous', 'Numinous', 'human', null, 'missing', 'Sous-type Guardian du relevé communautaire, sans fusion de profils.'),
  row('afe2-additional', 'crawler-turret', 'Crawler Turret', 'unresolved', 'unresolved', null, 'Notes officielles du 25/08/2026 ; aucune équivalence Huntsman établie.'),
  row('afe2-additional', 'engineer-husk', 'Engineer Husk', 'unresolved', 'unresolved', null, 'Notes officielles du 17/09/2026 ; aucune équivalence Engineer hybrid établie.'),
  row('afe2-additional', 'spore-thrower', 'Spore Thrower', 'unresolved', 'unresolved', null, 'Notes officielles du 17/09/2026 ; aucune équivalence Blight établie.')
]);
const defaults = freeze({
  catalog: getCatalogEntryV62,
  pose: id => getEnemyStaticPoseV96(id) || getEnemyDedicatedPoseV99(id),
  animation: getEnemyImportAnimationV107,
  scale: getCatalogGameplayScaleV72
});

/** Resolver injection lets tests prove that a missing/admitted-media change
 * affects coverage without mutating the historical roster or importing files. */
export function inspectEnemyCoverageV117(request, resolvers = defaults) {
  if (!request || !ENEMY_COVERAGE_GROUPS_V117[request.group]) return null;
  const record = request.profileId ? resolvers.catalog(request.profileId) : null;
  const dossierPresent = Boolean(record?.catalog === 'enemies' && record.id === request.profileId);
  const dossierAvailable = dossierPresent && record.catalogPolicyV105?.archived !== true;
  const visual = dossierAvailable ? record.visual : null;
  const pose = dossierAvailable ? resolvers.pose(request.profileId) : null;
  const matchedPose = pose && (pose.id || pose.profileId) === request.profileId && pose.path === visual?.path ? pose : null;
  const animation = matchedPose ? resolvers.animation(matchedPose) : null;
  const moveFrames = animation?.clips?.move?.frames || [];
  const reviewedWalk = Boolean(animation?.reviewStatus === 'accepted-multi-pose-adaptation'
    && animation.posesVerified === true && animation.alphaVerified === true
    && animation.profileId === request.profileId && animation.sourcePoseSha256 === matchedPose?.sha256
    && new Set(moveFrames).size > 1);
  const assetRegistered = Boolean(visual?.path);
  const dedicatedPose = Boolean(matchedPose);
  const appearanceWork = dossierPresent ? record.canonFacts?.source?.work || 'unknown' : null;
  const sourcePatterns = { afe1: /^Aliens:\s*Fireteam Elite(?!\s*2)/i,
    afe2: /^(?:Aliens:\s*Fireteam Elite 2|AFE2\b)/i, 'dark-descent': /^Aliens:\s*Dark Descent/i };
  const sourceMatched = ['source-adaptation', 'afe2-adaptation'].includes(request.status)
    && sourcePatterns[request.group]?.test(appearanceWork || '') === true;
  const scale = assetRegistered ? resolvers.scale(visual, 1, request.profileId) : null;
  const physical = dossierAvailable ? record.physicalSize : null;
  const clips = [visual?.idleClip, ...(visual?.previewClips || [])].filter(Boolean);
  const actions = reviewedWalk ? ['move'] : dedicatedPose ? [] : [...new Set(clips.map(clip => clip.clip?.id).filter(Boolean))];
  const issues = [];
  if (!dossierAvailable) issues.push(dossierPresent ? 'archived-dossier' : 'missing-dossier');
  if (dossierAvailable && !assetRegistered) issues.push('missing-registered-media');
  if (dossierAvailable && !sourceMatched) issues.push('requested-work-model-not-covered');
  if (dossierAvailable && record.taxonomy.family !== request.family) issues.push('family-mismatch');
  if (dossierAvailable && record.canonFacts?.source?.work === 'unknown') issues.push('appearance-source-undocumented');
  if (dossierAvailable && record.taxonomy.stage === 'unknown') issues.push('life-stage-undocumented');
  if (assetRegistered && visual.identity?.canonExact !== true) issues.push('visual-fidelity-not-certified');
  if (dossierAvailable && !physical?.canonVerified && !record.dimensions) issues.push('physical-measurement-unverified');
  return freeze({ group: request.group, id: request.id, name: request.name, family: request.family,
    profileId: request.profileId, requestedWork: ENEMY_COVERAGE_GROUPS_V117[request.group].name,
    declaredCoverage: request.status, label: ENEMY_COVERAGE_LABELS_V117[request.status], note: request.note || null,
    dossierPresent, dossierAvailable, displayName: dossierPresent ? playerCatalogNameV110(record.name) : request.name,
    appearanceWork,
    observedFamily: dossierPresent ? record.taxonomy.family : null,
    observedStage: dossierPresent ? record.taxonomy.stage : null,
    assetRegistered, mediaPath: visual?.path || null,
    mediaKind: !assetRegistered ? 'missing' : dedicatedPose ? 'dedicated-fixed-pose'
      : visual.sheetId ? 'registered-legacy-atlas' : 'registered-media-unclassified',
    dedicatedPose, requestedWorkAdaptation: sourceMatched && dedicatedPose && record.taxonomy.family === request.family,
    canonExact: sourceMatched && dedicatedPose && record.taxonomy.family === request.family && visual.identity?.canonExact === true,
    animationStatus: !assetRegistered ? 'missing' : reviewedWalk ? 'reviewed-walk-only'
      : dedicatedPose ? 'fixed-pose-only' : visual.sheetId ? 'registered-atlas-not-directional-certification'
      : 'unclassified-media-not-animation-certification',
    animationPath: reviewedWalk ? animation.path : null, animationActions: actions,
    reviewedMoveFrames: reviewedWalk ? new Set(moveFrames).size : 0,
    displayHeight: scale?.worldVisibleHeight || null,
    displaySizeStatus: scale ? 'project-staging-units-not-metres' : 'unknown',
    physicalSizeStatus: physical?.canonVerified === true ? 'verified-measurement'
      : physical ? 'estimated-unverified' : 'unknown', issues });
}
export function getEnemyCoverageV117(group, id, resolvers = defaults) {
  const request = ENEMY_COVERAGE_REQUESTS_V117.find(entry => entry.group === group && entry.id === id);
  return inspectEnemyCoverageV117(request, resolvers);
}
export function getEnemyCoverageGroupV117(group, resolvers = defaults) {
  return freeze(ENEMY_COVERAGE_REQUESTS_V117.filter(entry => entry.group === group).map(entry => inspectEnemyCoverageV117(entry, resolvers)));
}
export function summarizeEnemyCoverageV117(group, resolvers = defaults) {
  const entries = getEnemyCoverageGroupV117(group, resolvers);
  const count = predicate => entries.filter(predicate).length;
  return freeze({ group, total: entries.length,
    dossiersAvailable: count(entry => entry.dossierAvailable), assetRegistrations: count(entry => entry.assetRegistered),
    dedicatedPoses: count(entry => entry.dedicatedPose), requestedWorkAdaptations: count(entry => entry.requestedWorkAdaptation),
    certifiedCanonVisuals: count(entry => entry.canonExact), reviewedWalks: count(entry => entry.reviewedMoveFrames > 1),
    fixedPoseOnly: count(entry => entry.animationStatus === 'fixed-pose-only'),
    registeredLegacyAtlases: count(entry => entry.mediaKind === 'registered-legacy-atlas'),
    missing: entries.filter(entry => !entry.dossierAvailable).map(entry => entry.id),
    byDeclaredCoverage: entries.reduce((counts, entry) => { counts[entry.declaredCoverage] = (counts[entry.declaredCoverage] || 0) + 1; return counts; }, {}) });
}

/** Qualitative source constraint, not an inferred height or automatic resize:
 * posture/width may matter, so equal authored heights require visual review. */
export function getEnemyRelativeSizeReviewV117() {
  const runner = getEnemyCoverageV117('afe1', 'runner'), pathogen = getEnemyCoverageV117('afe1', 'pathogen-runner');
  return freeze({ id: 'pathogen-runner-relative-size', status: 'needs-visual-review',
    sourceUrl: ENEMY_COVERAGE_SOURCES_V117.pathogen.url,
    sourceConstraint: 'Pathogen Runner is larger than the average Xenomorph Runner; no numerical measurement is supplied.',
    runnerDisplayHeight: runner?.displayHeight ?? null, pathogenDisplayHeight: pathogen?.displayHeight ?? null,
    basis: 'project-authored-visible-height-not-canonical-volume', appliesToPhysics: false });
}
