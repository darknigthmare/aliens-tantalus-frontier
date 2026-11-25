import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findBuiltDevToolsPathV188, DEV_TOOLS_DEFAULT_PATH_V188 } from './build-dev-tools-v188.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  HORS_DES_OMBRES_BASELINE_V010 as baseline,
  HORS_DES_OMBRES_PREDECESSORS_V010 as predecessors,
  HORS_DES_OMBRES_SUCCESSORS_V010 as successors,
  reviewedHorsDesOmbresDigestV010 as advance,
  horsDesOmbresRuntimeSourcesV010 as runtimeView,
  verifyHorsDesOmbresContinuationV010 as verify
} from './audit-hors-des-ombres-continuation-v010.mjs';
import { reviewedTantalusPrioritiesDigestV188, TANTALUS_PRIORITIES_SUCCESSORS_V188,
  TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188 } from './audit-tantalus-priorities-v188.mjs';
import { XENO_TRIALS_TANTALUS_JOIN_V206, reviewedXenoTrialsTantalusJoinV206,
  xenoTrialsTantalusJoinRuntimeSourcesV206 } from './audit-xeno-production-assets-v206.mjs';
import { reviewedI18nDigestV185, I18N_SUCCESSORS_V185 } from './audit-i18n-v185.mjs';
import { reviewedAfterNativeQaResourcesV187 } from './audit-native-qa-resources-v187.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const ownPath = 'scripts/audit-hors-des-ombres-continuation-v010.mjs';
const historicalBlocks = [
  {
    "path": "scripts/audit-tantalus-priorities-v188.mjs",
    "start": "export const TANTALUS_PRIORITIES_BASELINE_V188",
    "end": "export function reviewedTantalusPrioritiesDigestV188",
    "sha256": "193902152e4e5a352f8ee22503047d618a7d3e19001639dea6bdc2e22d704f0c"
  },
  {
    "path": "scripts/audit-xeno-production-assets-v206.mjs",
    "start": "export const XENO_PRODUCTION_ASSETS_BASELINE_V206",
    "end": "export function reviewedXenoTrialsTantalusJoinV206",
    "sha256": "55e71be67a26c0e81b4196dbd0aa6a5e513a3ae5e9c00796eb3630d2b951e405"
  }
];

test('Hors des ombres binds the exact cumulative parent and every reviewed current byte', () => {
  assert.equal(baseline, '001a20bdc0f9f1a3c835e84d8f3c9434bc159330');
  assert.deepEqual(verify(), { baselineCommit: baseline, successors: 15, historicalResultsTransferred: false });
  assert.equal(Object.isFrozen(successors), true);
  assert.equal(Object.hasOwn(successors, ownPath), false);
  assert.deepEqual(Object.keys(successors), Object.keys(predecessors));
  assert.doesNotMatch(read(ownPath).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//,
    'The common terminal has no audit dependency and cannot create a cycle');
});

test('All historical Tantalus and Xeno declarations retain their exact pre-integration bytes', () => {
  for (const block of historicalBlocks) {
    const source = read(block.path).toString(), start = source.indexOf(block.start), end = source.indexOf(block.end);
    assert.ok(start >= 0 && end > start, block.path);
    assert.equal(sha(source.slice(start, end)), block.sha256, block.path);
  }
});

test('Each integration receipt refuses arbitrary predecessors, already-advanced inputs and tampered bytes', () => {
  for (const [path, receipt] of Object.entries(successors)) {
    assert.equal(receipt.previousSha256, predecessors[path], path);
    assert.equal(advance(path, receipt.previousSha256), receipt.currentSha256, path);
    for (const invalid of ['0'.repeat(64), receipt.currentSha256])
      assert.throws(() => advance(path, invalid), /Broken 001a20b-to-hors-des-ombres source chain/, path);
    assert.throws(() => verify(candidate => candidate === path ? Buffer.concat([read(candidate), Buffer.from('\nchanged')]) : read(candidate)),
      /Unreviewed Hors des ombres source bytes/, path);
  }
  for (const path of ['src/unreviewed.js', 'constructor', '__proto__', 'toString'])
    assert.equal(advance(path, 'unchanged'), 'unchanged', path);
});

test('Independent unowned branches defer only before reaching the shared predecessor', () => {
  const path = '.gitattributes', receipt = successors[path];
  assert.equal(advance(path, 'before-neighbour-chain', { owned: false }), 'before-neighbour-chain');
  assert.equal(advance(path, receipt.previousSha256, { owned: false }), receipt.currentSha256);
  assert.throws(() => advance(path, 'before-neighbour-chain', { owned: true }), /Broken 001a20b/);
});

test('Tantalus and Xeno resolve shared joins through the same bounded successor', () => {
  let shared = 0;
  for (const [path, receipt] of Object.entries(successors)) {
    const xeno = XENO_TRIALS_TANTALUS_JOIN_V206.successors[path];
    const tantalus = TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188.successors[path];
    if (!xeno || !tantalus) continue;
    shared++;
    assert.equal(xeno.currentSha256, receipt.previousSha256, path);
    assert.equal(tantalus.currentSha256, receipt.previousSha256, path);
    assert.equal(reviewedXenoTrialsTantalusJoinV206(path, xeno.previousSha256), receipt.currentSha256, path);
    const first = TANTALUS_PRIORITIES_SUCCESSORS_V188[path];
    if (first) assert.equal(reviewedTantalusPrioritiesDigestV188(path, first.previousSha256), receipt.currentSha256, path);
  }
  assert.ok(shared >= 4, 'The common host sources remain owned by both historical chains');
  const path = 'src/title-screen-v61.js';
  assert.equal(reviewedI18nDigestV185(path, I18N_SUCCESSORS_V185[path].previousSha256), sha(read(path)));
  assert.equal(reviewedAfterNativeQaResourcesV187('src/unreviewed.js', 'unchanged'), 'unchanged');
});

test('Runtime source views accept only the baseline or current bytes and remain idempotent', () => {
  const path = 'index.html', receipt = successors[path];
  const first = runtimeView({ [path]: receipt.previousSha256, unrelated: 'retained' });
  assert.equal(first[path], receipt.currentSha256);
  assert.deepEqual(runtimeView(first), first);
  assert.equal(first.unrelated, 'retained');
  assert.throws(() => runtimeView({ [path]: '0'.repeat(64) }), /Incorrect Hors des ombres runtime view predecessor/);
  const join = XENO_TRIALS_TANTALUS_JOIN_V206.successors[path];
  const joined = xenoTrialsTantalusJoinRuntimeSourcesV206({ [path]: join.previousSha256 });
  assert.equal(joined[path], receipt.currentSha256);
  assert.deepEqual(xenoTrialsTantalusJoinRuntimeSourcesV206(joined), joined);
});

test('Mutated continuation receipts cannot alter the parent, add neighbours or admit their own file', async () => {
  const source = read(ownPath).toString();
  const marker = 'export const HORS_DES_OMBRES_SUCCESSORS_V010 = freeze(';
  const start = source.indexOf(marker), end = source.indexOf(');\n// END HORS DES OMBRES SOURCE RECEIPTS', start) + 2;
  assert.ok(start >= 0 && end > start);
  for (const [label, mutate, expected] of [
    ['changed predecessor', map => { map['index.html'].previousSha256 = '0'.repeat(64); }, /Changed 001a20b predecessor/],
    ['forged current bytes', map => { map['index.html'].currentSha256 = '0'.repeat(64); }, /Unreviewed Hors des ombres source bytes/],
    ['unchanged successor', map => { map['index.html'].currentSha256 = map['index.html'].previousSha256; }, /must identify changed bytes/],
    ['extra neighbour', map => { map['src/save.js'] = { previousSha256: '0'.repeat(64), currentSha256: '1'.repeat(64) }; }, /may supersede only/],
    ['self admission', map => { map[ownPath] = { previousSha256: '0'.repeat(64), currentSha256: '1'.repeat(64) }; }, /may supersede only/],
    ['missing source', map => { delete map['index.html']; }, /may supersede only/]
  ]) {
    const map = structuredClone(successors); mutate(map);
    const changed = source.slice(0, start) + marker + JSON.stringify(map) + ');' + source.slice(end);
    const mutant = await import('data:text/javascript;base64,' + Buffer.from(changed).toString('base64'));
    assert.throws(() => mutant.verifyHorsDesOmbresContinuationV010(read), expected, label);
  }
});

test('Built developer-tools discovery skips public DLC but still rejects unknown directories', async () => {
  const output = await mkdtemp(join(tmpdir(), 'oth-devtools-build-'));
  try {
    for (const directory of ['src', 'assets', 'dlc', DEV_TOOLS_DEFAULT_PATH_V188])
      await mkdir(join(output, directory));
    assert.equal(await findBuiltDevToolsPathV188(output), DEV_TOOLS_DEFAULT_PATH_V188);
    await mkdir(join(output, 'unreviewed-folder'));
    await assert.rejects(findBuiltDevToolsPathV188(output), /exactly one hidden directory/);
    await rm(join(output, 'unreviewed-folder'), { recursive: true });
    await rm(join(output, DEV_TOOLS_DEFAULT_PATH_V188), { recursive: true });
    await assert.rejects(findBuiltDevToolsPathV188(output), /exactly one hidden directory/,
      'The public DLC directory cannot stand in for the developer tools');
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
