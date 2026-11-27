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
  const allowed = ['src/i18n-auto-v185.js', 'src/xeno-trials-runtime-v96.js', 'src/xeno-trials-ui-v96.js', 'xeno-trials-fullscreen-v119.css'];
  const expected = allowed.filter(path => sha(read(path)) !== sha(git('show', `${XENO_COMBAT_TABLET_BASELINE_V215}:${path}`)));
  assert.deepEqual(runtimePaths, expected);
  assert.ok(runtimePaths.includes('src/xeno-trials-ui-v96.js'));
  assert.ok(runtimePaths.includes('src/xeno-trials-runtime-v96.js'));
  assert.ok(runtimePaths.includes('xeno-trials-fullscreen-v119.css'));
  for (const [path, receipt] of Object.entries(XENO_COMBAT_TABLET_SUCCESSORS_V215)) {
    assert.equal(sha(git('show', `${XENO_COMBAT_TABLET_BASELINE_V215}:${path}`)), receipt.previousSha256, path);
    assert.equal(reviewedXenoCombatTabletDigestV215(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoCombatTabletDigestV215(path, receipt.sha256), /Incorrect V214 endpoint for V215/);
  }
  verifyHistoricalDeclarations(XENO_COMBAT_TABLET_DECLARATIONS_V215, XENO_COMBAT_TABLET_BASELINE_V215);
  const runtime = xenoSelectionRuntimeSourcesV214({ historical: 'untouched' });
  for (const path of runtimePaths) assert.equal(runtime[path], XENO_COMBAT_TABLET_SUCCESSORS_V215[path].sha256);
  assert.deepEqual(xenoCombatTabletRuntimeSourcesV215(runtime), runtime);
  assert.equal(verifyXenoCombatTabletV215().historicalResultsTransferred, false);
  const css = 'xeno-trials-fullscreen-v119.css';
  assert.throws(() => verifyXenoSelectionV214(path => path === css ? Buffer.from('unreviewed styling') : read(path)),
    error => error.message.includes(css) && error.message.includes('Unreviewed'));
});

test('V215 remains the independent terminal and the audit is admitted only as source', () => {
  const path = 'scripts/audit-xeno-combat-tablet-v215.mjs';
  assert.doesNotMatch(read(path).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  assert.ok(!Object.hasOwn(XENO_COMBAT_TABLET_SUCCESSORS_V215, path));
  assert.equal(isPublicDistributionPathV86(path), true);
  assert.equal(isPublicDistributionPathV86(path, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v215.mjs'), false);
});
