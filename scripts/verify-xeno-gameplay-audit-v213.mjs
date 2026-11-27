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
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

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
    assert.equal(reviewedXenoTabletSpriteDigestV216(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoTabletSpriteDigestV216(path, receipt.sha256), /Incorrect V215 endpoint for V216/);
    if (receipt.kind === 'runtime') assert.equal(runtime[path], receipt.sha256, path);
  }
  assert.deepEqual(xenoTabletSpriteRuntimeSourcesV216(runtime), runtime);
  assert.equal(verifyXenoTabletSpriteV216().historicalResultsTransferred, false);
  assert.throws(() => verifyXenoCombatTabletV215(path => path === css ? Buffer.from('unreviewed sprite styles') : read(path)),
    error => error.message.includes(css) && error.message.includes('Unreviewed'));
});

test('V216 admits only exact public sprite assets and keeps its terminal audit out of the build', () => {
  const terminal = 'scripts/audit-xeno-tablet-sprite-v216.mjs';
  assert.doesNotMatch(read(terminal).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  assert.ok(!Object.hasOwn(XENO_TABLET_SPRITE_SUCCESSORS_V216, terminal));
  assert.ok(!Object.hasOwn(XENO_TABLET_SPRITE_NEW_INPUTS_V216, terminal));
  assert.equal(isPublicDistributionPathV86(terminal), true);
  assert.equal(isPublicDistributionPathV86(terminal, { built: true }), false);
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
  const png = read(asset);
  assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(png.subarray(12, 16).toString(), 'IHDR');
  assert.equal(png[24], 8);
  assert.equal(png[25], 6);
  const css = read('xeno-trials-fullscreen-v119.css').toString();
  assert.match(css, /border-image:\s*url\(['"]?assets\/openai\/xeno-trials-v216\/tablet-chassis\.png['"]?\)/);
  assert.ok(read('sw.js').toString().includes("'/" + asset + "'"), 'The main shell precaches the tablet sprite');
});
