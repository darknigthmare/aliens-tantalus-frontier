import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  I18N_MAINTENANCE_BASELINE_V186, I18N_MAINTENANCE_SUCCESSORS_V186,
  I18N_MAINTENANCE_SOURCE_ONLY_PATHS_V186,
  reviewedI18nMaintenanceDigestV186, verifyI18nMaintenanceV186
} from './audit-i18n-maintenance-v186.mjs';
import { I18N_SUCCESSORS_V185, reviewedI18nDigestV185, verifyI18nV185 } from './audit-i18n-v185.mjs';
import { verifyAudioSlotsV184 } from './audit-audio-slots-v184.mjs';
import { verifyOriginalNamesV183 } from './audit-original-names-v183.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { NATIVE_QA_RESOURCES_SUCCESSORS_V187 } from './audit-native-qa-resources-v187.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = value => createHash('sha256').update(value).digest('hex');

test('V186 verifies exact bytes and preserves the V183 through V185 succession chain', () => {
  assert.equal(I18N_MAINTENANCE_BASELINE_V186, 'ec2378df98a2d9af4394536a39ed943199ddcb8a');
  assert.deepEqual(verifyI18nMaintenanceV186(), { successors: 5 });
  assert.deepEqual(verifyI18nV185(), { successors: 9 });
  assert.deepEqual(verifyAudioSlotsV184(), { successors: 6 });
  assert.deepEqual(verifyOriginalNamesV183(), { successors: 12 });
  for (const path of ['package.json', 'scripts/verify-public-release-v86.mjs']) {
    const predecessor = I18N_SUCCESSORS_V185[path];
    assert.equal(predecessor.currentSha256, I18N_MAINTENANCE_SUCCESSORS_V186[path].previousSha256);
    assert.equal(reviewedI18nDigestV185(path, predecessor.previousSha256), sha(read(path)));
  }
});

test('V186 rejects changed reviewed bytes and arbitrary predecessor endpoints', () => {
  for (const [path, receipt] of Object.entries(I18N_MAINTENANCE_SUCCESSORS_V186)) {
    assert.throws(() => verifyI18nMaintenanceV186(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V186 source bytes/);
    assert.throws(() => reviewedI18nMaintenanceDigestV186(path, '0'.repeat(64)), /Broken V185-to-V186 source chain/);
    assert.throws(() => reviewedI18nMaintenanceDigestV186(path, receipt.currentSha256), /Broken V185-to-V186 source chain/);
    assert.ok(Object.isFrozen(receipt));
  }
  assert.equal(reviewedI18nMaintenanceDigestV186('src/unreviewed.js', 'unchanged'), 'unchanged');
  assert.equal(Object.hasOwn(I18N_MAINTENANCE_SUCCESSORS_V186, 'scripts/audit-i18n-maintenance-v186.mjs'), false);
  assert.equal(Object.hasOwn(I18N_MAINTENANCE_SUCCESSORS_V186, 'src/save.js'), false);
  assert.equal(Object.hasOwn(NATIVE_QA_RESOURCES_SUCCESSORS_V187, 'scripts/audit-native-qa-resources-v187.mjs'), false);
  const relay = read('scripts/audit-native-qa-resources-v187.mjs').toString();
  assert.match(relay, /from '\.\/audit-xeno-trials-completion-v186\.mjs'/);
  const terminal = read('scripts/audit-xeno-trials-completion-v186.mjs').toString();
  assert.equal(/(?:from\s*|import\s*\(?\s*)['"]\.\//.test(terminal), false, 'The terminal audit must not import another audit.');
});

test('V186 source-only admissions are exact and do not admit neighbouring documents or tools', () => {
  for (const path of I18N_MAINTENANCE_SOURCE_ONLY_PATHS_V186) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    read(path);
  }
  for (const path of ['scripts/i18n-unreviewed-v186.mjs', 'scripts/qa-i18n-unreviewed-v186.py',
    'docs/development/I18N_UNREVIEWED_V186.md']) {
    assert.equal(isPublicDistributionPathV86(path), false, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  assert.equal(isPublicDistributionPathV86('src/i18n-auto-v185.js', { built: true }), true);
});

test('V186 regression and maintenance tests are collected by the actual release runner', () => {
  const pkg = JSON.parse(read('package.json'));
  const files = collectReleaseTestsV143(pkg.scripts);
  for (const path of ['scripts/verify-i18n-auto-dynamic-v185.mjs',
    'scripts/verify-i18n-maintenance-v186.mjs', 'scripts/verify-i18n-audit-v186.mjs']) {
    assert.equal(files.filter(file => file === path).length, 1, path);
  }
  assert.equal(pkg.scripts['i18n:check'], 'node scripts/i18n-catalog-maintenance-v186.mjs check');
});
