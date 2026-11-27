/** V187 — bounded, explicit resource profile for the Jun prerequisite observer.
 *
 * Continues V186 and admits exact reviewed QA/tooling bytes, never gameplay.
 * The standard 900 s wall / 360 s native / 45 s stall contract stays the default.
 * ci-slow4 changes only the wall cap to 360 * 4 s. A native physical receipt
 * remains mandatory. The completion join now terminates this chain and has no receipt
 * for itself; the V187 constants below remain historical. Historical source/workbook admissions do not inherit a CI pass.
 */
import assert from 'node:assert/strict';
import { reviewedCompletionDigestV186 } from './audit-xeno-trials-completion-v186.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

// Aliens 1986 V116 follows the published main endpoint, with its own exact
// receipts. Earlier Fleuve/Obscura/V187 records retain their original bytes.
export const ALIENS1986_MAIN_BASELINE_V116 = '334fe15ba0b7e01de277a13bfc025b208163882d';
export const ALIENS1986_MAIN_SUCCESSORS_V116 = freeze({
  "index.html": {
    "previousSha256": "8df9ef8b6e8f36fef345f341d381e593cd6379701a0cc020fae92e9f62751765",
    "currentSha256": "875eb3c528c2fef7219372ae0eeb3782d72b30fbc7568bea131fa7496b4a49b3"
  },
  "package.json": {
    "previousSha256": "0234100bcf99e381765dc8febc1898e7e96f8b722bc164fdde7b193cf6bec508",
    "currentSha256": "a08d5461e62e106d581f1de31647727f11825636e56aa1af767a2746afb8e005"
  },
  "scripts/build.mjs": {
    "previousSha256": "1943a0c5045488048b4e361020b20761afc4bae73759b7fdd7ab41ebc279ec73",
    "currentSha256": "eba8f2c08906671478a191547540bfa865b1f29d3564cd4936082f1682739d00"
  },
  "scripts/dev.mjs": {
    "previousSha256": "e41cb61807edbddaf54dd015a7b1b9ca8d1a3ca5942b0c716e4db3b128d58d6a",
    "currentSha256": "3c7047f833713dc570242d7e8319a8309522ade1efbf82dcc317c028042e1aad"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "39af73bda1b4a2b6632814c4b6c9a2e56c6273b14dfafeee60c1401d610478fe",
    "currentSha256": "83b843ecfaefb08770258331018d18837628b59f9d86b647b2185be75a01327e"
  },
  "src/app.js": {
    "previousSha256": "b8332e8b8e4ae1af84177454175d57806dfa606dc48e8846892a6b383ad73313",
    "currentSha256": "7a3f989423e18ca0a531ccb50120ab0f074b01652ea0d797495f59299563d0df"
  },
  "src/title-screen-v61.js": {
    "previousSha256": "dffa0959d800ef2c8e13271408048b5350b624f570ad8928504d0a32b2ca4355",
    "currentSha256": "c9d13438e40802b6efbcacb5ff584f6c6e8be92b8801b8e33df11b25a4899120"
  }
});

export function reviewedAliens1986MainDigestV116(path, endpoint) {
  const receipt = ALIENS1986_MAIN_SUCCESSORS_V116[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken Aliens main predecessor: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid Aliens main digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Aliens main successor must change bytes: ' + path);
  return receipt.currentSha256;
}

export function verifyAliens1986MainSuccessionV116(readSource = readRepository) {
  for (const [path, receipt] of Object.entries(ALIENS1986_MAIN_SUCCESSORS_V116)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedAliens1986MainDigestV116(path, receipt.previousSha256),
      'Unreviewed Aliens main source bytes: ' + path);
  }
  return { successors: Object.keys(ALIENS1986_MAIN_SUCCESSORS_V116).length,
    historicalEvidenceTransferred: false };
}

// Fleuve de la Douleur is a separate, bounded admission after Obscura.
// Only these five reviewed host entry/tooling files continue; historical
// receipts, workbooks, saved games and execution claims remain unchanged.
export const RIVER_OF_PAIN_BASELINE_20261125 = '882ffdee7ed83a549bf2c1c4b9fa38de8e70edc2';
export const RIVER_OF_PAIN_SUCCESSORS_20261125 = freeze({
  "index.html": {
    "previousSha256": "337a0b230d0b075bf70e5122240f1ce8e0d2deaebbbd563a15496ea92b5f4d66",
    "currentSha256": "8df9ef8b6e8f36fef345f341d381e593cd6379701a0cc020fae92e9f62751765"
  },
  "package.json": {
    "previousSha256": "ff133a405bfc1ef2afa7085fcb2a6cde27a9f52c4af0de5172a058b47082eb48",
    "currentSha256": "0234100bcf99e381765dc8febc1898e7e96f8b722bc164fdde7b193cf6bec508"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "a303c2a1d1ee26fb5fb0e9312efac2f6a093dc50d8c1c88a40ca99fefcd3f8e3",
    "currentSha256": "39af73bda1b4a2b6632814c4b6c9a2e56c6273b14dfafeee60c1401d610478fe"
  },
  "src/app.js": {
    "previousSha256": "482835e65677c536085a1344cf61c3ffa5e09e2af1b8029b949e000a533038ae",
    "currentSha256": "b8332e8b8e4ae1af84177454175d57806dfa606dc48e8846892a6b383ad73313"
  },
  "src/title-screen-v61.js": {
    "previousSha256": "e0c10ca738df12c78b48a24d79cb049aea2ac3e1c08ec270d3eed750fe267342",
    "currentSha256": "dffa0959d800ef2c8e13271408048b5350b624f570ad8928504d0a32b2ca4355"
  }
});

export function reviewedRiverOfPainDigest20261125(path, endpoint) {
  const receipt = RIVER_OF_PAIN_SUCCESSORS_20261125[path];
  if (!receipt) return reviewedAliens1986MainDigestV116(path, endpoint);
  assert.equal(endpoint, receipt.previousSha256, 'Broken Fleuve source predecessor: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid Fleuve source digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Fleuve successor must change bytes: ' + path);
  return reviewedAliens1986MainDigestV116(path, receipt.currentSha256);
}

export function verifyRiverOfPainSuccession20261125(readSource = readRepository) {
  for (const [path, receipt] of Object.entries(RIVER_OF_PAIN_SUCCESSORS_20261125)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256));
    assert.equal(sha(readSource(path)), reviewedRiverOfPainDigest20261125(path, receipt.previousSha256),
      'Unreviewed Fleuve source bytes: ' + path);
  }
  return Object.freeze({
    successors: Object.keys(RIVER_OF_PAIN_SUCCESSORS_20261125).length,
    recoveredDlcVersion: '0.9.0-candidate.1',
    historicalEvidenceTransferred: false,
  });
}

// Obscura is a separate source admission after the published V187 endpoint.
// The historical V187 maps below keep their original hashes and no execution
// result is transferred. This terminal audit still imports no other audit.
export const OBSCURA_BASELINE_20261115 = '803db26dbd7ed453d9534eee237806053438f300';
export const OBSCURA_VERIFIER_SUCCESSOR_20261115 = freeze({
  path: 'scripts/verify-public-release-v86.mjs',
  previousSha256: '328c764b2bf467d0bc21ae86abf415a7722bd0a88cba486eb2167c22fa8f0b84',
  currentSha256: 'a303c2a1d1ee26fb5fb0e9312efac2f6a093dc50d8c1c88a40ca99fefcd3f8e3'
});
export const OBSCURA_SOURCE_SHA256_20261115 = freeze({
  ".agents/skills/obscura/LICENSE": "50e6751797c50dedd75ef1b8a0d9e42f5f8472e9fbce91f34718e9f97b0c780a",
  ".agents/skills/obscura/SKILL.md": "2ab71d43ffa87c4d0fa0efcd895258a7319592f4949bf18a2294a9953ad9a065",
  ".ai-tools/obscura/README.md": "c856d14393876f06b04d579a4ea7e34add28522f943ffcf8edca0c105314ed6d",
  ".ai-tools/obscura/source.json": "272e03889f6bf42c5c77bb8718f49954d858d839266f7e4f6103d84d92e23368",
  ".claude/skills/obscura/LICENSE": "50e6751797c50dedd75ef1b8a0d9e42f5f8472e9fbce91f34718e9f97b0c780a",
  ".claude/skills/obscura/SKILL.md": "2ab71d43ffa87c4d0fa0efcd895258a7319592f4949bf18a2294a9953ad9a065"
});
export const OBSCURA_SOURCE_ONLY_PATHS_20261115 = Object.freeze([
  ".agents",
  ".agents/skills",
  ".agents/skills/obscura",
  ".agents/skills/obscura/SKILL.md",
  ".agents/skills/obscura/LICENSE",
  ".claude",
  ".claude/skills",
  ".claude/skills/obscura",
  ".claude/skills/obscura/SKILL.md",
  ".claude/skills/obscura/LICENSE",
  ".ai-tools/obscura",
  ".ai-tools/obscura/README.md",
  ".ai-tools/obscura/source.json"
]);

export function reviewedObscuraDigest20261115(path, endpoint) {
  const receipt = OBSCURA_VERIFIER_SUCCESSOR_20261115;
  if (path !== receipt.path) return reviewedRiverOfPainDigest20261125(path, endpoint);
  assert.equal(endpoint, receipt.previousSha256, 'Broken V187-to-Obscura source chain: ' + path);
  assert.ok(validHash(receipt.currentSha256));
  assert.notEqual(receipt.currentSha256, receipt.previousSha256);
  return reviewedRiverOfPainDigest20261125(path, receipt.currentSha256);
}

export function verifyObscuraSources20261115(readSource = readRepository) {
  for (const [path, expected] of Object.entries(OBSCURA_SOURCE_SHA256_20261115)) {
    assert.equal(sha(readSource(path)), expected, 'Unreviewed Obscura source bytes: ' + path);
  }
  return Object.freeze({ sources: Object.keys(OBSCURA_SOURCE_SHA256_20261115).length,
    runtimeChanged: false, historicalEvidenceTransferred: false });
}

export const NATIVE_QA_RESOURCES_BASELINE_V187 = '8219837892fc8c5ede58f2c500a934192fea1ae0';
// BEGIN V187 SOURCE RECEIPTS
export const NATIVE_QA_RESOURCES_SUCCESSORS_V187 = freeze({
  ".github/workflows/non-forge-regression-v163.yml": {
    "previousSha256": "dc4f45648f7850d58c52d8b89b28d5c87a53ac0d70e599d89c1c262a7a0d63f3",
    "currentSha256": "6b7270ac2cd8f5d84ba529de5f3675cedf0e430898823c1d107872980b7a6002"
  },
  "package.json": {
    "previousSha256": "b084cce34ad2816c3d53f9ba2232d1c0c8cc4bf9b51a92ae6220a8fafe900c00",
    "currentSha256": "ff133a405bfc1ef2afa7085fcb2a6cde27a9f52c4af0de5172a058b47082eb48"
  },
  "scripts/audit-i18n-maintenance-v186.mjs": {
    "previousSha256": "de7a468d40b4dca6c16a3827b8ef087709d22661eda011b00db904883f2de924",
    "currentSha256": "aff0ff6a837d5cedb3ac0917a1adac66d86b935071a24e5c09dae5a314503e66"
  },
  "scripts/audit-pr-integration-v182.mjs": {
    "previousSha256": "8662e7a399ec550e398ae18f41c36ef9803c55abbc21a9de2e30606c0032acd1",
    "currentSha256": "5cda300d363f84ebd5e67e3c34ef01bdccb09e1396f5249c5afb1acd506b73cd"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "previousSha256": "a4faf87d3da6873bc4b5ffef907838ca6793f27384072ec381bcf5b34cc559a2",
    "currentSha256": "8f3342580f3969a7ddef8680af2bf4ab1df6cf64c61a67419ae8add7458e21e9"
  },
  "scripts/qa-npc-annex-service-routes-v163.py": {
    "previousSha256": "3a57f6bd0760a8930848badea22b66206779a2b89d4feae5e2659b4fde53cc22",
    "currentSha256": "0e711d80ac79e53409e6b073823f25be648dd89447b54233c4f685ecc06ed167"
  },
  "scripts/verify-npc-annex-service-routes-v163.mjs": {
    "previousSha256": "ae6cc98ad92ec740b05894f3ca7cad676b627d0c66f454cfb15efd8d0940fa30",
    "currentSha256": "0293cf8e2c3035afa8b60768dbd0c01ba84361626fa3e33c8d78262dea440844"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "ba8ebd73bc43584058f8de938c06fda371f0870dcc962b1d3446ea3f277d2684",
    "currentSha256": "328c764b2bf467d0bc21ae86abf415a7722bd0a88cba486eb2167c22fa8f0b84"
  }
});
// END V187 SOURCE RECEIPTS

export const NATIVE_QA_DEPENDENCY_GUARD_SUCCESSOR_V187 = freeze({
  previousSha256: '9af73552e83c35e292762e1d3ad2c00f491290d76c8669856b5937d903ce470a',
  currentSha256: '6a82f0962c5fedbb0c5546096ced030a828600a4527450aadade9b990613b47c'
});

// Identical UTF-8 bytes in 8219837 and V187: from the two spaces before
// "let first=" inclusive to the two spaces before "const snapshot=" exclusive.
// This retains the observations, physical checks and completion criteria.
export const NATIVE_QA_DEPENDENCY_BODY_SHA256_V187 = '65cc17c519a8d307e17e606828b6155a526033fd15e0cd3391ad84dbfde76e63';

// BEGIN V187 PRESERVED SOURCES
export const NATIVE_QA_PRESERVED_SHA256_V187 = freeze({
  "docs/forge/xeno-trials/progress-v163.json": "c8b7f7d75cdd67bc1904b58775e3b93a8b1689c20723461162961a4fc1e73878",
  "docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V163.xlsx": "55fac512962c1b1da719fdaf871e3a6b7cedd52ec1a3601a1709453d20c49f22",
  "src/save.js": "afd5b289887c3a6be5d704ad9b501d9cd7bfeae4514fdfb4eaf21095e6d42304",
  "src/hub-game.js": "2e6c4101e04579252bc6045e22cb9305921fbe20c931072732d9a9e045e15b3e",
  "src/npc-annex-service-routes-v163.js": "25d7efed89dc1134a79cabe8fad259c029c2db8db58f43d1a2fa4be487a0f92f",
  "src/npc-interdeck-routes-v165.js": "7fc995925c98d1a65fc75538d026320139b9f697f53e7b68d7701bde29bb01a4",
  "src/npc-interdeck-passage-v165.js": "d2db8cee7f823db24a79f6125dbe06cf872b05344995bcb2d7a14e42e9bcdd9f"
});
// END V187 PRESERVED SOURCES

export const NATIVE_QA_RESOURCES_SOURCE_ONLY_PATHS_V187 = Object.freeze([
  'scripts/audit-native-qa-resources-v187.mjs',
  'scripts/verify-native-qa-resources-v187.mjs',
  'docs/development/NATIVE_QA_RESOURCES_V187.md'
]);

export function reviewedNativeQaResourcesDigestV187(path, endpoint) {
  const receipt = NATIVE_QA_RESOURCES_SUCCESSORS_V187[path];
  if (!receipt) return reviewedCompletionDigestV186(path, endpoint);
  assert.equal(endpoint, receipt.previousSha256, 'Broken V186-to-V187 source chain: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid V187 source digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A V187 successor must identify changed bytes: ' + path);
  return reviewedCompletionDigestV186(path, receipt.currentSha256);
}

export function reviewedNativeQaDependencyGuardDigestV187(endpoint) {
  const receipt = NATIVE_QA_DEPENDENCY_GUARD_SUCCESSOR_V187;
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V180 prerequisite guard predecessor');
  assert.ok(validHash(receipt.currentSha256));
  assert.notEqual(receipt.currentSha256, receipt.previousSha256);
  return receipt.currentSha256;
}

export function verifyNativeQaDependencyBodyV187(guard) {
  const start = guard.indexOf('  let first='), end = guard.indexOf('  const snapshot=');
  assert.ok(start >= 0 && end > start, 'Missing exact native prerequisite body boundaries');
  assert.equal(sha(guard.slice(start, end)), NATIVE_QA_DEPENDENCY_BODY_SHA256_V187,
    'Native prerequisite physical guard body changed');
}

export function verifyNativeQaResourcesV187(readSource = readRepository) {
  for (const [path, receipt] of Object.entries(NATIVE_QA_RESOURCES_SUCCESSORS_V187)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(sha(readSource(path)), reviewedNativeQaResourcesDigestV187(path, receipt.previousSha256),
      'Unreviewed V187 source bytes: ' + path);
  }
  const guard = [...readSource('scripts/qa-npc-annex-service-routes-v163.py').toString()
    .matchAll(/^NATIVE_ASHA_DEPENDENCY_V163 = '''[\s\S]*?'''/gm)];
  assert.equal(guard.length, 1, 'Asha dependency guard must have one exact definition');
  assert.equal(sha(guard[0][0]), reviewedNativeQaDependencyGuardDigestV187(
    NATIVE_QA_DEPENDENCY_GUARD_SUCCESSOR_V187.previousSha256), 'Unreviewed V187 prerequisite guard');
  verifyNativeQaDependencyBodyV187(guard[0][0]);
  for (const [path, expected] of Object.entries(NATIVE_QA_PRESERVED_SHA256_V187)) {
    assert.equal(sha(readSource(path)), reviewedCompletionDigestV186(path, expected), 'V187 must preserve these source bytes: ' + path);
  }
  verifyObscuraSources20261115(readSource);
  return Object.freeze({ successors: Object.keys(NATIVE_QA_RESOURCES_SUCCESSORS_V187).length,
    preserved: Object.keys(NATIVE_QA_PRESERVED_SHA256_V187).length });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  console.log(JSON.stringify(verifyNativeQaResourcesV187()));
}
