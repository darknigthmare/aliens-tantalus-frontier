import { XENO_TRIALS_BASELINE_V230, XENO_TRIALS_DECLARATIONS_V230, XENO_TRIALS_SUCCESSORS_V230, XENO_TRIALS_NEW_INPUTS_V230,
  reviewedXenoTrialsDigestV230, xenoTrialsRuntimeSourcesV230, verifyXenoTrialsV230 } from './audit-xeno-trials-v230.mjs';
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
import { XENO_TRIALS_BASELINE_V219, XENO_TRIALS_DECLARATIONS_V219, XENO_TRIALS_SUCCESSORS_V219, XENO_TRIALS_NEW_INPUTS_V219,
  reviewedXenoTrialsDigestV219, xenoTrialsRuntimeSourcesV219, verifyXenoTrialsV219 } from './audit-xeno-trials-v219.mjs';
import { XENO_TRIALS_BASELINE_V220, XENO_TRIALS_DECLARATIONS_V220, XENO_TRIALS_SUCCESSORS_V220, XENO_TRIALS_NEW_INPUTS_V220,
  reviewedXenoTrialsDigestV220, xenoTrialsRuntimeSourcesV220, verifyXenoTrialsV220 } from './audit-xeno-trials-v220.mjs';
import { XENO_TRIALS_BASELINE_V221, XENO_TRIALS_DECLARATIONS_V221, XENO_TRIALS_SUCCESSORS_V221, XENO_TRIALS_NEW_INPUTS_V221,
  reviewedXenoTrialsDigestV221, xenoTrialsRuntimeSourcesV221, verifyXenoTrialsV221 } from './audit-xeno-trials-v221.mjs';
import { XENO_TRIALS_BASELINE_V222, XENO_TRIALS_DECLARATIONS_V222, XENO_TRIALS_SUCCESSORS_V222, XENO_TRIALS_NEW_INPUTS_V222,
  reviewedXenoTrialsDigestV222, xenoTrialsRuntimeSourcesV222, verifyXenoTrialsV222 } from './audit-xeno-trials-v222.mjs';
import { XENO_TRIALS_BASELINE_V223, XENO_TRIALS_DECLARATIONS_V223, XENO_TRIALS_SUCCESSORS_V223, XENO_TRIALS_NEW_INPUTS_V223,
  reviewedXenoTrialsDigestV223, xenoTrialsRuntimeSourcesV223, verifyXenoTrialsV223 } from './audit-xeno-trials-v223.mjs';
import { XENO_TRIALS_BASELINE_V224, XENO_TRIALS_DECLARATIONS_V224, XENO_TRIALS_SUCCESSORS_V224, XENO_TRIALS_NEW_INPUTS_V224,
  reviewedXenoTrialsDigestV224, xenoTrialsRuntimeSourcesV224, verifyXenoTrialsV224 } from './audit-xeno-trials-v224.mjs';
import { XENO_TRIALS_BASELINE_V225, XENO_TRIALS_DECLARATIONS_V225, XENO_TRIALS_SUCCESSORS_V225, XENO_TRIALS_NEW_INPUTS_V225,
  reviewedXenoTrialsDigestV225, xenoTrialsRuntimeSourcesV225, verifyXenoTrialsV225 } from './audit-xeno-trials-v225.mjs';
import { XENO_TRIALS_BASELINE_V226, XENO_TRIALS_DECLARATIONS_V226, XENO_TRIALS_SUCCESSORS_V226, XENO_TRIALS_NEW_INPUTS_V226,
  reviewedXenoTrialsDigestV226, xenoTrialsRuntimeSourcesV226, verifyXenoTrialsV226 } from './audit-xeno-trials-v226.mjs';
import { XENO_TRIALS_BASELINE_V227, XENO_TRIALS_DECLARATIONS_V227, XENO_TRIALS_SUCCESSORS_V227, XENO_TRIALS_NEW_INPUTS_V227,
  reviewedXenoTrialsDigestV227, xenoTrialsRuntimeSourcesV227, verifyXenoTrialsV227 } from './audit-xeno-trials-v227.mjs';
import { XENO_TRIALS_BASELINE_V228, XENO_TRIALS_DECLARATIONS_V228, XENO_TRIALS_SUCCESSORS_V228, XENO_TRIALS_NEW_INPUTS_V228,
  reviewedXenoTrialsDigestV228, xenoTrialsRuntimeSourcesV228, verifyXenoTrialsV228 } from './audit-xeno-trials-v228.mjs';
import { XENO_TRIALS_BASELINE_V229, XENO_TRIALS_DECLARATIONS_V229, XENO_TRIALS_SUCCESSORS_V229, XENO_TRIALS_NEW_INPUTS_V229,
  reviewedXenoTrialsDigestV229, xenoTrialsRuntimeSourcesV229, verifyXenoTrialsV229 } from './audit-xeno-trials-v229.mjs';
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
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V219}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV218(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV218(path, receipt.sha256), /Incorrect V217 endpoint for V218/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV219(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV218(runtime), runtime);
  assert.equal(verifyXenoTrialsV218().historicalResultsTransferred, false);
  const gameplay = Object.keys(XENO_TRIALS_SUCCESSORS_V218).find(path => XENO_TRIALS_SUCCESSORS_V218[path].kind === 'runtime');
  assert.ok(gameplay, 'V218 pins runtime source changes');
  assert.throws(() => verifyXenoTrialsV217(path => path === gameplay ? Buffer.from('unreviewed gameplay') : read(path)),
    error => error.message.includes(gameplay) && error.message.includes('Unreviewed'));
});

test('V218 exposes its reviewed runtime inputs and keeps the audit and tests out of the build', () => {
  const audit = 'scripts/audit-xeno-trials-v218.mjs';
  assert.match(read(audit).toString(), /from '\.\/audit-xeno-trials-v219\.mjs'/);
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V218, audit));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V218, audit));
  assert.equal(isPublicDistributionPathV86(audit), true);
  assert.equal(isPublicDistributionPathV86(audit, { built: true }), false);
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
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V219}:${path}`)), receipt.sha256, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV219(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV217(candidate => candidate === path ? Buffer.from('unreviewed V218 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V218 source bytes: ' + path);
  }
});

test('V219 preserves the published V218 declarations and projects exact gameplay successor bytes', () => {
  assert.equal(XENO_TRIALS_BASELINE_V219, '0d630718965c8cc17a5cbe0f1b6de729e4dd2518');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V219, XENO_TRIALS_BASELINE_V219);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V219)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V219}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V220}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV219(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV219(path, receipt.sha256), /Incorrect V218 endpoint for V219/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV220(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV219(runtime), runtime);
  assert.equal(verifyXenoTrialsV219().historicalResultsTransferred, false);
  const gameplay = Object.keys(XENO_TRIALS_SUCCESSORS_V219).find(path => XENO_TRIALS_SUCCESSORS_V219[path].kind === 'runtime');
  assert.ok(gameplay, 'V219 pins runtime source changes');
  assert.throws(() => verifyXenoTrialsV218(path => path === gameplay ? Buffer.from('unreviewed gameplay') : read(path)),
    error => error.message.includes(gameplay) && error.message.includes('Unreviewed'));
});

test('V219 exposes its reviewed runtime inputs and keeps the audit and tests out of the build', () => {
  const audit = 'scripts/audit-xeno-trials-v219.mjs';
  assert.match(read(audit).toString(), /from '\.\/audit-xeno-trials-v220\.mjs'/);
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V219, audit));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V219, audit));
  assert.equal(isPublicDistributionPathV86(audit), true);
  assert.equal(isPublicDistributionPathV86(audit, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v219.mjs'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V219['src/xeno-trials-finishers-v219.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V219['src/xeno-trials-practice-v219.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V219['scripts/verify-xeno-trials-beacon-battery-v219.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V219['scripts/verify-xeno-trials-finishers-v219.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V219['scripts/verify-xeno-trials-landing-v219.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V219['scripts/verify-xeno-trials-practice-v219.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V219['docs/forge/xeno-trials/V219-GAMEPLAY.md']?.kind, 'documentation');
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V219-DRAFT.md'), false);
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V219).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V219)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V220}:${path}`)), receipt.sha256, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV220(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV218(candidate => candidate === path ? Buffer.from('unreviewed V219 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V219 source bytes: ' + path);
  }
});

test('V220 preserves the published V219 declarations and projects exact gameplay successor bytes', () => {
  assert.equal(XENO_TRIALS_BASELINE_V220, 'bd1cafad4b0ba8f006b0fed9ca0dbd4114c94193');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V220, XENO_TRIALS_BASELINE_V220);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V220)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V220}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V221}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV220(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV220(path, receipt.sha256), /Incorrect V219 endpoint for V220/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV221(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV220(runtime), runtime);
  assert.equal(verifyXenoTrialsV220().historicalResultsTransferred, false);
  const sequence = 'src/xeno-trials-sequences-v155.js';
  assert.equal(XENO_TRIALS_SUCCESSORS_V220[sequence]?.kind, 'runtime');
  assert.throws(() => verifyXenoTrialsV219(path => path === sequence ? Buffer.from('unreviewed presentation') : read(path)),
    error => error.message.includes(sequence) && error.message.includes('Unreviewed'));
});

test('V220 exposes its reviewed runtime inputs and keeps the audit and tests out of the build', () => {
  const audit = 'scripts/audit-xeno-trials-v220.mjs';
  assert.match(read(audit).toString(), /from '\.\/audit-xeno-trials-v221\.mjs'/);
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V220, audit));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V220, audit));
  assert.equal(isPublicDistributionPathV86(audit), true);
  assert.equal(isPublicDistributionPathV86(audit, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v220.mjs'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V220['src/xeno-trials-practice-v220.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V220['src/xeno-trials-spatial-outro-v220.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V220['scripts/verify-xeno-trials-grapple-v220.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V220['scripts/verify-xeno-trials-practice-v220.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V220['scripts/verify-xeno-trials-relief-hold-v220.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V220['scripts/verify-xeno-trials-spatial-outro-v220.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V220['docs/forge/xeno-trials/V220-GAMEPLAY.md']?.kind, 'documentation');
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V220-DRAFT.md'), false);
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V220).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V220)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V221}:${path}`)), receipt.sha256, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV221(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV219(candidate => candidate === path ? Buffer.from('unreviewed V220 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V220 source bytes: ' + path);
  }
});

test('V221 preserves the published V220 declarations and projects exact gameplay successor bytes', () => {
  assert.equal(XENO_TRIALS_BASELINE_V221, '410771c1f48c515a2361adb613a34c2406323f65');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V221, XENO_TRIALS_BASELINE_V221);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V221)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V221}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V222}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV221(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV221(path, receipt.sha256), /Incorrect V220 endpoint for V221/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV222(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV221(runtime), runtime);
  assert.equal(verifyXenoTrialsV221().historicalResultsTransferred, false);
  const superSource = 'src/xeno-trials-supers-v148.js';
  assert.equal(XENO_TRIALS_SUCCESSORS_V221[superSource]?.kind, 'runtime');
  assert.throws(() => verifyXenoTrialsV220(path => path === superSource ? Buffer.from('unreviewed super rules') : read(path)),
    error => error.message.includes(superSource) && error.message.includes('Unreviewed'));
});

test('V221 exposes its reviewed runtime inputs and keeps the audit and tests out of the build', () => {
  const audit = 'scripts/audit-xeno-trials-v221.mjs';
  assert.match(read(audit).toString(), /from '\.\/audit-xeno-trials-v222\.mjs'/);
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V221, audit));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V221, audit));
  assert.equal(isPublicDistributionPathV86(audit), true);
  assert.equal(isPublicDistributionPathV86(audit, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v221.mjs'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V221['src/xeno-trials-practice-v221.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V221['src/xeno-trials-finishers-v221.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V221['scripts/verify-xeno-trials-finishers-v221.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V221['scripts/verify-xeno-trials-practice-v221.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V221['scripts/verify-xeno-trials-hangar-bypass-v221.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V221['docs/forge/xeno-trials/V221-GAMEPLAY.md']?.kind, 'documentation');
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V221-DRAFT.md'), false);
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V221).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V221)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV222(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV220(candidate => candidate === path ? Buffer.from('unreviewed V221 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V221 source bytes: ' + path);
  }
});

test('V222 preserves the published V221 declarations and validates each successor from exact Git bytes', () => {
  assert.equal(XENO_TRIALS_BASELINE_V222, '88362fabe1a9d216085afa1337057517a5cf1f84');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V222, XENO_TRIALS_BASELINE_V222);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V222)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V222}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V223}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV222(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV222(path, receipt.sha256), /Incorrect V221 endpoint for V222/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV223(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV222(runtime), runtime);
  assert.equal(verifyXenoTrialsV222().historicalResultsTransferred, false);
  const defenseRuntime = 'src/xeno-trials-runtime-v96.js';
  assert.equal(XENO_TRIALS_SUCCESSORS_V222[defenseRuntime]?.kind, 'runtime');
  assert.equal(XENO_TRIALS_SUCCESSORS_V222['scripts/verify-xeno-trials-supers-v148.mjs']?.kind, 'tooling');
  assert.throws(() => verifyXenoTrialsV221(path => path === defenseRuntime ? Buffer.from('unreviewed defense HUD') : read(path)),
    error => error.message.includes(defenseRuntime) && error.message.includes('Unreviewed'));
});

test('V222 admits only its reviewed inputs and keeps its audit tools out of the build', () => {
  const audit = 'scripts/audit-xeno-trials-v222.mjs';
  assert.match(read(audit).toString(), /from '\.\/audit-xeno-trials-v223\.mjs'/);
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V222, audit));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V222, audit));
  assert.equal(isPublicDistributionPathV86(audit), true);
  assert.equal(isPublicDistributionPathV86(audit, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v222.mjs'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V222-DRAFT.md'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V222['src/xeno-trials-practice-v222.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V222['scripts/verify-xeno-trials-practice-v222.mjs']?.kind, 'tooling');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V222['scripts/generate-xeno-trials-menu-media-v222.mjs']?.kind, 'tooling');
  for (const kind of ['fighter', 'stage'])
    assert.equal(XENO_TRIALS_NEW_INPUTS_V222[`assets/openai/xeno-trials-menu-v222/${kind}.webp`]?.kind, 'asset');
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V222).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V222)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV223(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV221(candidate => candidate === path ? Buffer.from('unreviewed V222 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V222 source bytes: ' + path);
  }
});

test('V223 preserves the published V222 declarations and validates each successor from exact Git bytes', () => {
  assert.equal(XENO_TRIALS_BASELINE_V223, 'c71642176e92027790600eec631445ab6f82fcf2');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V223, XENO_TRIALS_BASELINE_V223);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V223)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V223}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V224}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV223(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV223(path, receipt.sha256), /Incorrect V222 endpoint for V223/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV224(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV223(runtime), runtime);
  assert.equal(verifyXenoTrialsV223().historicalResultsTransferred, false);
  const hardTactics = 'src/xeno-trials-ai-v209.js';
  assert.equal(XENO_TRIALS_SUCCESSORS_V223[hardTactics]?.kind, 'runtime');
  assert.equal(XENO_TRIALS_SUCCESSORS_V223['scripts/verify-xeno-trials-ai-v213.mjs']?.kind, 'tooling');
  assert.throws(() => verifyXenoTrialsV222(path => path === hardTactics ? Buffer.from('unreviewed AI rules') : read(path)),
    error => error.message.includes(hardTactics) && error.message.includes('Unreviewed'));
});

test('V223 admits only its reviewed inputs and keeps its audit tools out of the build', () => {
  const audit = 'scripts/audit-xeno-trials-v223.mjs';
  assert.match(read(audit).toString(), /from '\.\/audit-xeno-trials-v224\.mjs'/);
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V223, audit));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V223, audit));
  assert.equal(isPublicDistributionPathV86(audit), true);
  assert.equal(isPublicDistributionPathV86(audit, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v223.mjs'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V223-DRAFT.md'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V223['src/xeno-trials-practice-v223.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V223['scripts/verify-xeno-trials-practice-v223.mjs']?.kind, 'tooling');
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V223).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V223)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV224(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV222(candidate => candidate === path ? Buffer.from('unreviewed V223 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V223 source bytes: ' + path);
  }
});

test('V224 advances exact V223 bytes without transferring its historical results', () => {
  assert.equal(XENO_TRIALS_BASELINE_V224, '322dde60f662621588fc733adec98929136f2043');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V224, XENO_TRIALS_BASELINE_V224);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V224)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V224}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V225}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV224(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV224(path, receipt.sha256), /Incorrect V223 endpoint for V224/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV225(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV224(runtime), runtime);
  assert.equal(verifyXenoTrialsV224().historicalResultsTransferred, false);
  const offline = 'scripts/xeno-trials-offline-worker-v223.mjs';
  assert.equal(XENO_TRIALS_SUCCESSORS_V224[offline]?.kind, 'tooling');
  assert.throws(() => verifyXenoTrialsV223(path => path === offline ? Buffer.from('unreviewed cache commands') : read(path)),
    error => error.message.includes(offline) && error.message.includes('Unreviewed'));
});

test('V224 admits only its exact new inputs and excludes tooling from both builds', () => {
  const audit = 'scripts/audit-xeno-trials-v224.mjs';
  assert.ok(read(audit).toString().includes("from './audit-xeno-trials-v225.mjs'"));
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V224, audit));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V224, audit));
  assert.equal(isPublicDistributionPathV86(audit), true);
  assert.equal(isPublicDistributionPathV86(audit, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v224.mjs'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V224-DRAFT.md'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V224['src/xeno-trials-practice-v224.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V224['scripts/verify-xeno-trials-decompression-v224.mjs']?.kind, 'tooling');
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V224).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V224)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV225(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV223(candidate => candidate === path ? Buffer.from('unreviewed V224 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V224 source bytes: ' + path);
  }
});

test('V225 advances exact V224 bytes without transferring its historical results', () => {
  assert.equal(XENO_TRIALS_BASELINE_V225, 'cede59c2c927bde0188ac8eca8f56a6dc9be2f3c');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V225, XENO_TRIALS_BASELINE_V225);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V225)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V225}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V226}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV225(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV225(path, receipt.sha256), /Incorrect V224 endpoint for V225/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV226(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV225(runtime), runtime);
  assert.equal(verifyXenoTrialsV225().historicalResultsTransferred, false);
  const offline = 'scripts/xeno-trials-offline-worker-v223.mjs';
  assert.equal(XENO_TRIALS_SUCCESSORS_V225[offline]?.kind, 'tooling');
  assert.throws(() => verifyXenoTrialsV224(path => path === offline ? Buffer.from('unreviewed cache commands') : read(path)),
    error => error.message.includes(offline) && error.message.includes('Unreviewed'));
});

test('V225 admits only its exact new inputs and excludes tooling from both builds', () => {
  const audit = 'scripts/audit-xeno-trials-v225.mjs';
  assert.ok(read(audit).toString().includes("from './audit-xeno-trials-v226.mjs'"));
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V225, audit));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V225, audit));
  assert.equal(isPublicDistributionPathV86(audit), true);
  assert.equal(isPublicDistributionPathV86(audit, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v225.mjs'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V225-DRAFT.md'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V225['src/xeno-trials-practice-v225.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V225['scripts/verify-xeno-trials-archive-transfer-v225.mjs']?.kind, 'tooling');
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V225).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V225)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV226(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV224(candidate => candidate === path ? Buffer.from('unreviewed V225 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V225 source bytes: ' + path);
  }
});

test('V226 advances exact V225 bytes without transferring its historical results', () => {
  assert.equal(XENO_TRIALS_BASELINE_V226, '626945f65112c165f1ee469af200479f0e4f3971');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V226, XENO_TRIALS_BASELINE_V226);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V226)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V226}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V227}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV226(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV226(path, receipt.sha256), /Incorrect V225 endpoint for V226/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV227(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV226(runtime), runtime);
  assert.equal(verifyXenoTrialsV226().historicalResultsTransferred, false);
  const poses = 'src/xeno-trials-poses-v209.js';
  assert.equal(XENO_TRIALS_SUCCESSORS_V226[poses]?.kind, 'runtime');
  assert.throws(() => verifyXenoTrialsV225(path => path === poses ? Buffer.from('unreviewed painted phases') : read(path)),
    error => error.message.includes(poses) && error.message.includes('Unreviewed'));
});

test('V226 admits only its exact new inputs and excludes tooling from both builds', () => {
  const terminal = 'scripts/audit-xeno-trials-v226.mjs';
  assert.ok(read(terminal).toString().includes("from './audit-xeno-trials-v227.mjs'"));
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V226, terminal));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V226, terminal));
  assert.equal(isPublicDistributionPathV86(terminal), true);
  assert.equal(isPublicDistributionPathV86(terminal, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v226.mjs'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V226-DRAFT.md'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V226['src/xeno-trials-practice-v226.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V226['scripts/verify-xeno-trials-deflector-calibration-v226.mjs']?.kind, 'tooling');
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V226).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V226)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV227(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV225(candidate => candidate === path ? Buffer.from('unreviewed V226 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V226 source bytes: ' + path);
  }
});

test('V227 advances exact V226 bytes without transferring its historical results', () => {
  assert.equal(XENO_TRIALS_BASELINE_V227, 'ae84b7dcfbf3bd28cbf2c901b1e7e56c14111998');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V227, XENO_TRIALS_BASELINE_V227);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V227)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V227}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V228}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV227(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV227(path, receipt.sha256), /Incorrect V226 endpoint for V227/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV228(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV227(runtime), runtime);
  assert.equal(verifyXenoTrialsV227().historicalResultsTransferred, false);
  const poses = 'src/xeno-trials-poses-v209.js';
  assert.equal(XENO_TRIALS_SUCCESSORS_V227[poses]?.kind, 'runtime');
  assert.throws(() => verifyXenoTrialsV226(path => path === poses ? Buffer.from('unreviewed painted phases') : read(path)),
    error => error.message.includes(poses) && error.message.includes('Unreviewed'));
});

test('V227 admits only its exact new inputs and excludes tooling from both builds', () => {
  const terminal = 'scripts/audit-xeno-trials-v227.mjs';
  assert.ok(read(terminal).toString().includes("from './audit-xeno-trials-v228.mjs'"));
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V227, terminal));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V227, terminal));
  assert.equal(isPublicDistributionPathV86(terminal), true);
  assert.equal(isPublicDistributionPathV86(terminal, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v227.mjs'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V227-DRAFT.md'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V227['src/xeno-trials-power-v227.js']?.kind, 'runtime');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V227['scripts/verify-xeno-trials-roster-audit-v227.mjs']?.kind, 'tooling');
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V227).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V227)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV228(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV226(candidate => candidate === path ? Buffer.from('unreviewed V227 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V227 source bytes: ' + path);
  }
});

test('V228 advances exact V227 bytes without transferring its historical results', () => {
  assert.equal(XENO_TRIALS_BASELINE_V228, '3025d07ca305fcb8a2402c185c16e68d8d12ce2c');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V228, XENO_TRIALS_BASELINE_V228);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V228)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V228}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V229}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV228(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV228(path, receipt.sha256), /Incorrect V227 endpoint for V228/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV229(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV228(runtime), runtime);
  assert.equal(verifyXenoTrialsV228().historicalResultsTransferred, false);
  const poses = 'src/xeno-trials-poses-v209.js';
  assert.equal(XENO_TRIALS_SUCCESSORS_V228[poses]?.kind, 'runtime');
  assert.throws(() => verifyXenoTrialsV227(path => path === poses ? Buffer.from('unreviewed painted phases') : read(path)),
    error => error.message.includes(poses) && error.message.includes('Unreviewed'));
});

test('V228 admits only its exact new inputs and excludes tooling from both builds', () => {
  const terminal = 'scripts/audit-xeno-trials-v228.mjs';
  assert.ok(read(terminal).toString().includes("from './audit-xeno-trials-v229.mjs'"));
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V228, terminal));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V228, terminal));
  assert.equal(isPublicDistributionPathV86(terminal), true);
  assert.equal(isPublicDistributionPathV86(terminal, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v228.mjs'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V228-DRAFT.md'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V228['docs/forge/xeno-trials/V228-SPRITE-PHASES.md']?.kind, 'documentation');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V228['docs/forge/xeno-trials/sprite-production-v228.json']?.kind, 'documentation');
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V228).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V228)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV229(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV227(candidate => candidate === path ? Buffer.from('unreviewed V228 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V228 source bytes: ' + path);
  }
});

test('V229 advances exact V228 bytes without transferring its historical results', () => {
  assert.equal(XENO_TRIALS_BASELINE_V229, 'e9832e50b65e7b40170cc67c17e81503c3f4f271');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V229, XENO_TRIALS_BASELINE_V229);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V229)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V229}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V230}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoTrialsDigestV229(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV229(path, receipt.sha256), /Incorrect V228 endpoint for V229/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV230(path, receipt.sha256), path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV229(runtime), runtime);
  assert.equal(verifyXenoTrialsV229().historicalResultsTransferred, false);
  const poses = 'src/xeno-trials-poses-v209.js';
  assert.equal(XENO_TRIALS_SUCCESSORS_V229[poses]?.kind, 'runtime');
  assert.throws(() => verifyXenoTrialsV228(path => path === poses ? Buffer.from('unreviewed painted phases') : read(path)),
    error => error.message.includes(poses) && error.message.includes('Unreviewed'));
});

test('V229 admits only its exact new inputs and excludes tooling from both builds', () => {
  const terminal = 'scripts/audit-xeno-trials-v229.mjs';
  assert.ok(read(terminal).toString().includes("from './audit-xeno-trials-v230.mjs'"));
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V229, terminal));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V229, terminal));
  assert.equal(isPublicDistributionPathV86(terminal), true);
  assert.equal(isPublicDistributionPathV86(terminal, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v229.mjs'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V229-DRAFT.md'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V229['docs/forge/xeno-trials/V229-SPRITE-PHASES.md']?.kind, 'documentation');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V229['docs/forge/xeno-trials/sprite-production-v229.json']?.kind, 'documentation');
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V229).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V229)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], reviewedXenoTrialsDigestV230(path, receipt.sha256), path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV228(candidate => candidate === path ? Buffer.from('unreviewed V229 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V229 source bytes: ' + path);
  }
});

test('V230 advances exact V229 bytes without transferring its historical results', () => {
  assert.equal(XENO_TRIALS_BASELINE_V230, '0fb2ac0c03465fa76c977a4ef883374a4c791f16');
  verifyHistoricalDeclarations(XENO_TRIALS_DECLARATIONS_V230, XENO_TRIALS_BASELINE_V230);
  const runtime = xenoGameplayRuntimeSourcesV213({ historical: 'untouched' });
  assert.equal(runtime.historical, 'untouched');
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V230)) {
    assert.equal(sha(git('show', `${XENO_TRIALS_BASELINE_V230}:${path}`)), receipt.previousSha256, path);
    assert.equal(reviewedXenoTrialsDigestV230(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTrialsDigestV230(path, receipt.sha256), /Incorrect V229 endpoint for V230/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], receipt.sha256, path);
  }
  assert.deepEqual(xenoTrialsRuntimeSourcesV230(runtime), runtime);
  assert.equal(verifyXenoTrialsV230().historicalResultsTransferred, false);
  const poses = 'src/xeno-trials-data-v96.js';
  assert.equal(XENO_TRIALS_SUCCESSORS_V230[poses]?.kind, 'runtime');
  assert.throws(() => verifyXenoTrialsV229(path => path === poses ? Buffer.from('unreviewed painted phases') : read(path)),
    error => error.message.includes(poses) && error.message.includes('Unreviewed'));
});

test('V230 admits only its exact new inputs and excludes tooling from both builds', () => {
  const terminal = XENO_AUDIT_TERMINAL_PATH;
  assert.equal(terminal, 'scripts/audit-xeno-trials-v230.mjs');
  assert.doesNotMatch(read(terminal).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  assert.ok(!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V230, terminal));
  assert.ok(!Object.hasOwn(XENO_TRIALS_NEW_INPUTS_V230, terminal));
  assert.equal(isPublicDistributionPathV86(terminal), true);
  assert.equal(isPublicDistributionPathV86(terminal, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v230.mjs'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/V230-DRAFT.md'), false);
  assert.equal(XENO_TRIALS_NEW_INPUTS_V230['docs/forge/xeno-trials/V230-ROSTER-PRESENTATIONS.md']?.kind, 'documentation');
  assert.equal(XENO_TRIALS_NEW_INPUTS_V230['docs/forge/xeno-trials/combat-guide-coverage-v230.json']?.kind, 'documentation');
  const baseline = new Set(git('ls-tree', '-r', '--name-only', XENO_TRIALS_BASELINE_V230).toString().split('\n'));
  const runtime = xenoGameplayRuntimeSourcesV213({});
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V230)) {
    assert.equal(baseline.has(path), false, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(receipt.kind), path);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], receipt.sha256, path);
    if (path.startsWith('scripts/verify-')) assert.equal(tests.filter(testPath => testPath === path).length, 1, path);
    assert.throws(() => verifyXenoTrialsV229(candidate => candidate === path ? Buffer.from('unreviewed V230 input') : read(candidate)),
      error => error.message.split('\n', 1)[0] === 'Unreviewed V230 source bytes: ' + path);
  }
});
