import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { COMPLETION_BASELINES_V186, COMPLETION_SOURCES_V186, reviewedCompletionDigestV186,
  completionRuntimeSourcesV186, verifyCompletionV186 } from './audit-xeno-trials-completion-v186.mjs';
import { V179_RUNTIME_SUCCESSORS, V179_NEW_RUNTIME_SOURCES } from './audit-succession-v179.mjs';
import { V180_RUNTIME_SUCCESSORS, V180_NEW_RUNTIME_SOURCES } from './audit-succession-v180.mjs';
import { loadAuditSuccessionV163, resolveAuditSourcesV163 } from './audit-succession-v163.mjs';
import { verifyI18nV185 } from './audit-i18n-v185.mjs';
import { verifyI18nMaintenanceV186 } from './audit-i18n-maintenance-v186.mjs';
import { verifyNativeQaResourcesV187 } from './audit-native-qa-resources-v187.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { reviewedStageOperationsDigestV188 } from './audit-xeno-stage-operations-v188.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('completion keeps the MainN language/QA baseline and restored Trials branches explicitly separate', () => {
  assert.equal(COMPLETION_BASELINES_V186.main803, '803db26dbd7ed453d9534eee237806053438f300');
  assert.equal(COMPLETION_BASELINES_V186.trials179, 'd516dda1f39d5112d46c638d2d58a06fdd2ecee3');
  assert.match(COMPLETION_BASELINES_V186.trials180, /^e0836d3/);
  assert.match(COMPLETION_BASELINES_V186.restoredBase, /^0ae6fc6/);
  const result = verifyCompletionV186(read);
  assert.equal(result.sources, Object.keys(COMPLETION_SOURCES_V186).length);
  assert.equal(result.historicalResultsTransferred, false);
  assert.ok(Object.isFrozen(COMPLETION_SOURCES_V186));
  for (const record of Object.values(COMPLETION_SOURCES_V186)) {
    assert.ok(Object.isFrozen(record));
    assert.ok(Object.isFrozen(record.predecessors));
  }
});

test('each named branch endpoint resolves only to the exact integrated bytes', () => {
  for (const [path, record] of Object.entries(COMPLETION_SOURCES_V186)) {
    for (const endpoint of Object.values(record.predecessors).filter(Boolean))
      assert.equal(reviewedCompletionDigestV186(path, endpoint), reviewedStageOperationsDigestV188(path, record.currentSha256), path);
    assert.throws(() => reviewedCompletionDigestV186(path, '0'.repeat(64)), /Incorrect V186 completion predecessor/, path);
    assert.throws(() => reviewedCompletionDigestV186(path, null), /Missing V186 completion predecessor/, path);
    assert.equal(sha(read(path)), reviewedStageOperationsDigestV188(path, record.currentSha256), path);
  }
  assert.equal(reviewedCompletionDigestV186('src/unreviewed-completion.js', 'untouched'), 'untouched');
});

test('every admitted source rejects a byte mutation without trusting its caller or an observed hash', () => {
  for (const path of Object.keys(COMPLETION_SOURCES_V186)) {
    const altered = Buffer.concat([read(path), Buffer.from('\nUNREVIEWED')]);
    const changed = candidate => candidate === path ? altered : read(candidate);
    assert.throws(() => verifyCompletionV186(changed), /Unreviewed V186 completion bytes/, path);
    assert.throws(() => reviewedCompletionDigestV186(path, sha(altered)), /Incorrect V186 completion predecessor/, path);
  }
});

test('the complete legacy bridge validates the joined view while default metadata stays historical', () => {
  const { previous, current } = loadAuditSuccessionV163(read);
  const effective = resolveAuditSourcesV163(previous, read, { effective: true });
  assert.deepEqual(resolveAuditSourcesV163(previous, read), current.runtimeSourceSha256);
  for (const path of new Set([...Object.keys(V179_RUNTIME_SUCCESSORS), ...Object.keys(V179_NEW_RUNTIME_SOURCES),
    ...Object.keys(V180_RUNTIME_SUCCESSORS), ...Object.keys(V180_NEW_RUNTIME_SOURCES)])) {
    assert.equal(effective[path], sha(read(path)), path);
  }
  const frozen = Object.freeze({ original: 'historic' });
  assert.equal(completionRuntimeSourcesV186(frozen).original, 'historic');
  assert.deepEqual(frozen, { original: 'historic' });
  assert.deepEqual(verifyI18nV185(read), { successors: 9 });
  assert.deepEqual(verifyI18nMaintenanceV186(read), { successors: 5 });
  assert.deepEqual(verifyNativeQaResourcesV187(read), { successors: 8, preserved: 7 });
});

test('the completion relays to the exact terminal V188 audit and remains source-only', () => {
  const terminal = 'scripts/audit-xeno-stage-operations-v188.mjs';
  assert.equal(/(?:from\s*|import\s*\(?\s*)['"]\.\//.test(read(terminal).toString()), false);
  assert.match(read('scripts/audit-xeno-trials-completion-v186.mjs').toString(), /from '\.\/audit-xeno-stage-operations-v188\.mjs'/);
  assert.equal(Object.hasOwn(COMPLETION_SOURCES_V186, terminal), false);
  for (const path of [terminal, 'scripts/verify-xeno-trials-completion-audit-v186.mjs']) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-trials-unreviewed-v186.mjs'), false);
});
