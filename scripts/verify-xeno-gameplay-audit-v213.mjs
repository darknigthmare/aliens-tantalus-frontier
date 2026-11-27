import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { XENO_GAMEPLAY_BASELINE_V213, XENO_GAMEPLAY_SUCCESSORS_V213, XENO_GAMEPLAY_NEW_INPUTS_V213,
  reviewedXenoGameplayDigestV213, xenoGameplayRuntimeSourcesV213, verifyXenoGameplayV213 } from './audit-xeno-gameplay-v213.mjs';
import { XENO_SELECTION_BASELINE_V214, XENO_SELECTION_DECLARATIONS_V214, XENO_SELECTION_SUCCESSORS_V214,
  reviewedXenoSelectionDigestV214, xenoSelectionRuntimeSourcesV214, verifyXenoSelectionV214 } from './audit-xeno-selection-v214.mjs';
import { XENO_COMBAT_TABLET_BASELINE_V215, XENO_COMBAT_TABLET_DECLARATIONS_V215, XENO_COMBAT_TABLET_SUCCESSORS_V215,
  reviewedXenoCombatTabletDigestV215, xenoCombatTabletRuntimeSourcesV215, verifyXenoCombatTabletV215 } from './audit-xeno-combat-tablet-v215.mjs';
import { XENO_TABLET_SPRITE_BASELINE_V216, XENO_TABLET_SPRITE_DECLARATIONS_V216, XENO_TABLET_SPRITE_SUCCESSORS_V216,
  XENO_TABLET_SPRITE_NEW_INPUTS_V216, reviewedXenoTabletSpriteDigestV216, xenoTabletSpriteRuntimeSourcesV216,
  verifyXenoTabletSpriteV216 } from './audit-xeno-tablet-sprite-v216.mjs';
import { XENO_TRIALS_BASELINE_V217, XENO_TRIALS_DECLARATIONS_V217, XENO_TRIALS_SUCCESSORS_V217, XENO_TRIALS_NEW_INPUTS_V217,
  reviewedXenoTrialsDigestV217, xenoTrialsRuntimeSourcesV217, verifyXenoTrialsV217 } from './audit-xeno-trials-v217.mjs';
import { XENO_TRIALS_BASELINE_V218, XENO_TRIALS_DECLARATIONS_V218, XENO_TRIALS_SUCCESSORS_V218, XENO_TRIALS_NEW_INPUTS_V218,
  reviewedXenoTrialsDigestV218, xenoTrialsRuntimeSourcesV218, verifyXenoTrialsV218 } from './audit-xeno-trials-v218.mjs';
import { isPublicDistributionPathV86, XENO_AUDIT_TERMINAL_PATH } from './verify-public-release-v86.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';

const root = new URL('..', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 8 * 1024 * 1024 });

function verifyHistoricalDeclarations(declarations, baseline) {
  for (const [path, receipt] of Object.entries(declarations)) {
    const extract = bytes => {
      const source = bytes.toString();
      const start = source.indexOf(receipt.start);
      const end = source.indexOf(receipt.end, start + receipt.start.length);
      assert.ok(start >= 0 && end > start, path);
      return source.slice(start, end);
    };
    const current = extract(read(path));
    assert.equal(current, extract(git('show', `${baseline}:${path}`)), path);
    assert.equal(sha(current), receipt.sha256, path);
  }
}

test('V213 continues the published V212 byte receipts and rejects forged predecessors', () => {
  assert.equal(XENO_GAMEPLAY_BASELINE_V213, 'de7d162658f14b3e5820a5bd5b1e72deeafdcc24');
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V213)) {
    assert.equal(sha(git('show', `${XENO_GAMEPLAY_BASELINE_V213}:${path}`)), receipt.previousSha256, path);
    assert.equal(reviewedXenoGameplayDigestV213(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoGameplayDigestV213(path, '0'.repeat(64)), /Incorrect V212 endpoint for V213/);
  }
  const historical = new Set(git('ls-tree', '-r', '--name-only', XENO_GAMEPLAY_BASELINE_V213).toString().split('\n'));
  for (const path of Object.keys(XENO_GAMEPLAY_NEW_INPUTS_V213)) assert.equal(historical.has(path), false, path);
  assert.equal(verifyXenoGameplayV213().historicalResultsTransferred, false);
});

test('V213 keeps QA and the Bible status outside the games and rejects modified bytes', () => {
  const runtime = xenoGameplayRuntimeSourcesV213({ legacy: 'untouched' });
  assert.equal(runtime.legacy, 'untouched');
  assert.deepEqual(xenoGameplayRuntimeSourcesV213(runtime), runtime);
  for (const [path, { kind }] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V213)) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(kind), path);
  }
  const path = 'src/xeno-trials-finishers-v213.js';
  assert.throws(() => verifyXenoGameplayV213(candidate => candidate === path ? Buffer.from('tampered') : read(candidate)),
    /Unreviewed V213 source bytes: src\/xeno-trials-finishers-v213\.js/);
});

test('V214 preserves V213 declarations and admits the selection sources from exact Git predecessors', () => {
  assert.equal(XENO_SELECTION_BASELINE_V214, '26608995d9619ff7c369c2a980e09d0bfbd181cc');
  const runtimePaths = ['src/i18n-auto-v185.js', 'src/xeno-trials-ui-v96.js', 'xeno-trials-fullscreen-v119.css'];
  assert.deepEqual(Object.entries(XENO_SELECTION_SUCCESSORS_V214).filter(([, row]) => row.kind === 'runtime')
    .map(([path]) => path).sort(), runtimePaths);
  for (const [path, receipt] of Object.entries(XENO_SELECTION_SUCCESSORS_V214)) {
    assert.equal(sha(git('show', `${XENO_SELECTION_BASELINE_V214}:${path}`)), receipt.previousSha256, path);
    assert.equal(reviewedXenoSelectionDigestV214(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoSelectionDigestV214(path, receipt.sha256), /Incorrect V213 endpoint for V214/);
  }
  verifyHistoricalDeclarations(XENO_SELECTION_DECLARATIONS_V214, XENO_SELECTION_BASELINE_V214);
  const runtime = xenoGameplayRuntimeSourcesV213({ legacy: 'untouched' });
  for (const path of runtimePaths)
    assert.equal(runtime[path], reviewedXenoCombatTabletDigestV215(path, XENO_SELECTION_SUCCESSORS_V214[path].sha256));
  assert.deepEqual(xenoSelectionRuntimeSourcesV214(runtime), runtime);
  assert.equal(verifyXenoSelectionV214().historicalResultsTransferred, false);
  const selection = 'src/xeno-trials-ui-v96.js';
  assert.throws(() => verifyXenoGameplayV213(path => path === selection ? Buffer.from('unreviewed UI') : read(path)),
    error => error.message.includes(selection) && error.message.includes('Unreviewed'));
});

test('V214 relays the V215 revision and keeps its audit tooling source-only', () => {
  const path = 'scripts/audit-xeno-selection-v214.mjs';
  assert.match(read('scripts/audit-xeno-gameplay-v213.mjs').toString(), /from '\.\/audit-xeno-selection-v214\.mjs'/);
  assert.match(read(path).toString(), /from '\.\/audit-xeno-combat-tablet-v215\.mjs'/);
  assert.ok(!Object.hasOwn(XENO_SELECTION_SUCCESSORS_V214, path));
  assert.equal(isPublicDistributionPathV86(path), true);
  assert.equal(isPublicDistributionPathV86(path, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v214.mjs'), false);
});

test('V215 binds the combat tablet changes to the V214 Git sources and rejects changed bytes', () => {
  assert.equal(XENO_COMBAT_TABLET_BASELINE_V215, '7e22ceb1134d79c5353080932aa7ae9c259327cb');
  const runtimePaths = Object.entries(XENO_COMBAT_TABLET_SUCCESSORS_V215)
    .filter(([, receipt]) => receipt.kind === 'runtime').map(([path]) => path).sort();
  assert.deepEqual(runtimePaths, ['src/i18n-auto-v185.js', 'src/xeno-trials-runtime-v96.js', 'src/xeno-trials-ui-v96.js',
    'xeno-trials-fullscreen-v119.css']);
  for (const [path, receipt] of Object.entries(XENO_COMBAT_TABLET_SUCCESSORS_V215)) {
    assert.equal(sha(git('show', `${XENO_COMBAT_TABLET_BASELINE_V215}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TABLET_SPRITE_BASELINE_V216}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoCombatTabletDigestV215(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoCombatTabletDigestV215(path, receipt.sha256), /Incorrect V214 endpoint for V215/);
  }
  verifyHistoricalDeclarations(XENO_COMBAT_TABLET_DECLARATIONS_V215, XENO_COMBAT_TABLET_BASELINE_V215);
  const runtime = xenoSelectionRuntimeSourcesV214({ historical: 'untouched' });
  for (const path of runtimePaths)
    assert.equal(runtime[path], reviewedXenoTabletSpriteDigestV216(path, XENO_COMBAT_TABLET_SUCCESSORS_V215[path].sha256));
  assert.deepEqual(xenoCombatTabletRuntimeSourcesV215(runtime), runtime);
  assert.equal(verifyXenoCombatTabletV215().historicalResultsTransferred, false);
  const css = 'xeno-trials-fullscreen-v119.css';
  assert.throws(() => verifyXenoSelectionV214(path => path === css ? Buffer.from('unreviewed styling') : read(path)),
    error => error.message.includes(css) && error.message.includes('Unreviewed'));
});

test('V215 relays the tablet sprite revision and the audit is admitted only as source', () => {
  const path = 'scripts/audit-xeno-combat-tablet-v215.mjs';
  assert.match(read(path).toString(), /from '\.\/audit-xeno-tablet-sprite-v216\.mjs'/);
  assert.ok(!Object.hasOwn(XENO_COMBAT_TABLET_SUCCESSORS_V215, path));
  assert.equal(isPublicDistributionPathV86(path), true);
  assert.equal(isPublicDistributionPathV86(path, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v215.mjs'), false);
});

test('V216 preserves the V215 declarations and projects the exact sprite styles into the runtime', () => {
  const css = 'xeno-trials-fullscreen-v119.css';
  assert.equal(XENO_TABLET_SPRITE_BASELINE_V216, 'fc2c6549295521cc731fa3d90b79b24c304d769a');
  assert.deepEqual(Object.entries(XENO_TABLET_SPRITE_SUCCESSORS_V216)
    .filter(([, receipt]) => receipt.kind === 'runtime').map(([path]) => path).sort(), ['sw.js', css]);
  verifyHistoricalDeclarations(XENO_TABLET_SPRITE_DECLARATIONS_V216, XENO_TABLET_SPRITE_BASELINE_V216);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TABLET_SPRITE_SUCCESSORS_V216)) {
    assert.equal(sha(git('show', `${XENO_TABLET_SPRITE_BASELINE_V216}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V217}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTabletSpriteDigestV216(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTabletSpriteDigestV216(path, receipt.sha256), /Incorrect V215 endpoint for V216/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV217(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTabletSpriteRuntimeSourcesV216(runtime), runtime);
  assert.equal(verifyXenoTabletSpriteV216().historicalResultsTransferred, false);
  assert.throws(() => verifyXenoCombatTabletV215(path => path === css ? Buffer.from('unreviewed sprite styles') : read(path)),
    error => error.message.includes(css) && error.message.includes('Unreviewed'));
});

test('V216 admits only exact public sprite assets and keeps its audit out of the build', () => {
  const path = 'scripts/audit-xeno-tablet-sprite-v216.mjs';
  assert.match(read(path).toString(), /from '\.\/audit-xeno-trials-v217\.mjs'/);
  assert.ok(!Object.hasOwn(XENO_TABLET_SPRITE_SUCCESSORS_V216, path));
  assert.ok(!Object.hasOwn(XENO_TABLET_SPRITE_NEW_INPUTS_V216, path));
  assert.equal(isPublicDistributionPathV86(path), true);
  assert.equal(isPublicDistributionPathV86(path, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v216.mjs'), false);
  const inputs = Object.entries(XENO_TABLET_SPRITE_NEW_INPUTS_V216);
  const directory = 'assets/openai/xeno-trials-v216';
  assert.deepEqual(inputs.map(([path]) => path), [directory + '/tablet-chassis.png']);
  for (const built of [false, true]) {
    assert.equal(isPublicDistributionPathV86(directory, { built, directory: true }), true);
    assert.equal(isPublicDistributionPathV86(directory + '/draft.png', { built }), false);
    assert.equal(isPublicDistributionPathV86(directory + '/tablet-chassis.png', { built, directory: true }), false);
  }
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TABLET_SPRITE_BASELINE_V216).toString().split('\n'));
  for (const [path, receipt] of inputs) {
    assert.equal(receipt.kind, 'asset', path);
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
    assert.throws(() => verifyXenoCombatTabletV215(candidate => candidate === path ? Buffer.from('unreviewed art') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V216 source bytes: ' + path);
  }
});

test('V216 connects the RGBA tablet sprite to the combat styles and offline shell', () => {
  const asset = 'assets/openai/xeno-trials-v216/tablet-chassis.png';
  const atV216 = path => git('show', `${XENO_TRIALS_BASELINE_V217}:${path}`);
  const png = atV216(asset);
  assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(png.subarray(12, 16).toString(), 'IHDR');
  assert.equal(png[24], 8);
  assert.equal(png[25], 6);
  const css = atV216('xeno-trials-fullscreen-v119.css').toString();
  assert.match(css, /border-image:\s*url\(['"]?assets\/openai\/xeno-trials-v216\/tablet-chassis\.png['"]?\)/);
  assert.ok(atV216('sw.js').toString().includes("'/" + asset + "'"), 'The main shell precaches the tablet sprite');
});

test('V217 preserves the V216 declarations and verifies the exact gameplay and UI source revisions', () => {
  assert.equal(XENO_TRIALS_BASELINE_V217, '55c98468250a409b5348a83165390af405f58170');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V217, XENO_TRIALS_BASELINE_V217);
  const css = 'xeno-trials-fullscreen-v119.css';
  const ui = 'src/xeno-trials-ui-v96.js';
  assert.equal(XENO_TRIALS_SUCCESSORS_V217[css]?.kind, 'runtime');
  assert.equal(XENO_TRIALS_SUCCESSORS_V217[ui]?.kind, 'runtime');
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V217)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V217}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V218}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV217(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV217(path, receipt.sha256), /Incorrect V216 endpoint for V217/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV218(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV217(runtime), runtime);
  assert.equal(verifyXenoTrialsV217().historicalResultsTransferred, false);
  assert.throws(() => verifyXenoTabletSpriteV216(path => path === css ? Buffer.from('unreviewed HUD styling') : read(path)),
    error => error.message.includes(css) && error.message.includes('Unreviewed'));
});

test('V217 admits exact new sources and ships runtime inputs without bundling audit tools', () => {
  const audit = 'scripts/audit-xeno-trials-v217.mjs';
  assert.match(read(audit).toString(), /from '\.\/audit-xeno-trials-v218\.mjs'/);
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V217, audit));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V217, audit));
  assert.equal(isPublicDistributionPathV86(audit), true);
  assert.equal(isPublicDistributionPathV86(audit, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v217.mjs'), false);
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V217).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const practice = 'scripts/verify-xeno-trials-practice-v217.mjs';
  assert.equal(XENO_TRIALS_NEW_INPUTS_V217[practice]?.kind, 'tooling');
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts).filter(path => path === practice).length, 1);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V217)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V218}:${path}`)), receipt.sha256, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV218(path, receipt.sha256), path);
    assert.throws(() => verifyXenoTabletSpriteV216(candidate => candidate === path ? Buffer.from('unreviewed input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V217 source bytes: ' + path);
  }
});

test('V218 preserves the published V217 declarations and projects exact gameplay successor bytes', () => {
  assert.equal(XENO_TRIALS_BASELINE_V218, 'f27167fa74fa89558cee7efbaf7f21a6367df4cb');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V218, XENO_TRIALS_BASELINE_V218);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V218)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V218}:${path}`)), receipt.previousSha256, path);
    assert.equal(reviewedXenoTrialsDigestV218(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV218(path, receipt.sha256), /Incorrect V217 endpoint for V218/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], receipt.sha256, path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV218(runtime), runtime);
  assert.equal(verifyXenoTrialsV218().historicalResultsTransferred, false);
  const gameplay = Object.keys(XENO_TRIALS_SUCCESSORS_V218).find(path => XENO_TRIALS_SUCCESSORS_V218[path].kind === 'runtime');
  assert.ok(gameplay, 'V218 pins runtime source changes');
  assert.throws(() => verifyXenoTrialsV217(path => path === gameplay ? Buffer.from('unreviewed gameplay') : read(path)),
    error => error.message.includes(gameplay) && error.message.includes('Unreviewed'));
});

test('V218 exposes its reviewed runtime inputs and keeps the audit and tests out of the build', () => {
  const terminal = XENO_AUDIT_TERMINAL_PATH;
  assert.doesNotMatch(read(terminal).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V218, terminal));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V218, terminal));
  assert.equal(isPublicDistributionPathV86(terminal), true);
  assert.equal(isPublicDistributionPathV86(terminal, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v218.mjs'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V218['src/xeno-trials-practice-v218.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V218['scripts/verify-xeno-trials-contact-v218.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V218['scripts/verify-xeno-trials-practice-v218.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V218['scripts/verify-xeno-trials-relay-pressure-v218.mjs']?.kind, 'tooling');
  const guide = 'docs/forge/xeno-trials/V218-GAMEPLAY.md';
  assert.equal(XENO_TRIALS_NEW_INPUTS_V218[guide]?.kind, 'documentation');
  assert.equal(isPublicDistributionPathV86(guide), true);
  assert.equal(isPublicDistributionPathV86(guide, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V218-DRAFT.md'), false);
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V218).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V218)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], receipt.sha256, path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV217(candidate => candidate === path ? Buffer.from('unreviewed V218 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V218 source bytes: ' + path);
  }
});
