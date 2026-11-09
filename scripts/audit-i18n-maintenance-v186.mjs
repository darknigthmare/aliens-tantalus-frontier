/** V186 — FR/EN dynamic text repair and reproducible catalog maintenance.
 *
 * Baseline: ec2378df98a2d9af4394536a39ed943199ddcb8a (merged V185).
 * Each receipt identifies exact predecessor and reviewed successor bytes.
 * This terminal module imports no audit, preventing circular self-admission.
 * It makes no gameplay, workbook completion, translation coverage or art claim.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

export const I18N_MAINTENANCE_BASELINE_V186 = 'ec2378df98a2d9af4394536a39ed943199ddcb8a';
export const I18N_MAINTENANCE_SUCCESSORS_V186 = freeze({
  'package.json': {
    previousSha256: 'af8e6bff9fa01e8447a7c3d3446ac033eaee26250b6ce92d0bc91cc36284ccb8',
    currentSha256: 'b084cce34ad2816c3d53f9ba2232d1c0c8cc4bf9b51a92ae6220a8fafe900c00'
  },
  'scripts/audit-i18n-v185.mjs': {
    previousSha256: '359df78ae05b46016b7e7cc098bfbd92ee886109d40d381953094e03446fac01',
    currentSha256: 'ab30f7e5dc6bd1f1f95bf71808aef69d2aff3bb0e7c1d3d1e9e5e6f4ef12658d'
  },
  'scripts/verify-public-release-v86.mjs': {
    previousSha256: '3a3973d7398cb8d74a13f5248f273611093757af93417737de9c9d195ac1d54a',
    currentSha256: 'ba8ebd73bc43584058f8de938c06fda371f0870dcc962b1d3446ea3f277d2684'
  },
  'src/i18n-auto-v185.js': {
    previousSha256: '4ed3efebd63bf3448931184bfdb84978fb01429235af6a6dd2ee27c21e5f0a70',
    currentSha256: 'd9b0f2405eeae7eb2b1ea0d1f6a389ac736f89f4558e9e66c965b58498ebd90c'
  },
  'src/i18n-en-catalog-v185.js': {
    previousSha256: '98102ba8afc25f5fad11b45888c0e8daaae8a4739931f20244c0edf971e2c6e5',
    currentSha256: 'ac3632c302294c3e2869d673ad6d8cd861e1b0f62641d2d16335387746a6218a'
  }
});

export const I18N_MAINTENANCE_SOURCE_ONLY_PATHS_V186 = Object.freeze([
  'scripts/audit-i18n-maintenance-v186.mjs',
  'scripts/verify-i18n-audit-v186.mjs',
  'scripts/verify-i18n-auto-dynamic-v185.mjs',
  'scripts/i18n-catalog-maintenance-v186.mjs',
  'scripts/verify-i18n-maintenance-v186.mjs',
  'scripts/qa-i18n-dynamic-v186.py',
  'docs/development/I18N_MAINTENANCE_V186.md'
]);

export function reviewedI18nMaintenanceDigestV186(path, endpoint) {
  const receipt = I18N_MAINTENANCE_SUCCESSORS_V186[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken V185-to-V186 source chain: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid V186 source digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A V186 successor must identify changed bytes: ' + path);
  return receipt.currentSha256;
}

export function verifyI18nMaintenanceV186(readSource = readRepository) {
  for (const [path, receipt] of Object.entries(I18N_MAINTENANCE_SUCCESSORS_V186)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    const endpoint = reviewedI18nMaintenanceDigestV186(path, receipt.previousSha256);
    assert.equal(sha(readSource(path)), endpoint, 'Unreviewed V186 source bytes: ' + path);
  }
  return Object.freeze({ successors: Object.keys(I18N_MAINTENANCE_SUCCESSORS_V186).length });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  console.log(JSON.stringify(verifyI18nMaintenanceV186()));
}
