/** Exact source-only preservation of the six original 40th-anniversary ZIPs.
 * These pins are independent of the archived manifest and historical reports.
 * They authorize no runtime, restored integration commit or fidelity claim.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const FORTIETH_RECOVERY_ROOT_20261126 = 'archives/40th-anniversary-recovery-20261126';
export const FORTIETH_RECOVERY_COMMIT_20261126 = '8ec16d6448e0833e932294456e3393674a4a79ad';
export const FORTIETH_RECOVERY_FILES_20261126 = Object.freeze([
  {
    "path": "archives/40th-anniversary-recovery-20261126/MANIFEST.json",
    "bytes": 7888,
    "sha256": "2a5b706d4a33e22ea7e658f6ab9761f6fe64636b72601de68aefd5b9aa0d9d9a"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/README.md",
    "bytes": 2255,
    "sha256": "098e28f53197b6de523f777cd487645ff23c5834e0883467c0bc084c945f9adc"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/VERIFICATION.json",
    "bytes": 9510,
    "sha256": "be5fd0de1b384e76914da6d4a27310a9cfc955f31ff6e345bb7487e545c5fe19"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/PACK_MANIFEST.json",
    "bytes": 62886,
    "sha256": "418bacbb6223b8062aba2f4c6b0ba4e9f320f7cd13d83b4982e0ca96279b77b7"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/README.md",
    "bytes": 3856,
    "sha256": "310d98f115ad829680a53e7dfc629c5957400b934c897a79ae90434c9b270473"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/ARCHITECTURE_CHANGES.json",
    "bytes": 78300,
    "sha256": "a29f685dcfbddd87c45c9d8dbbc2d2e6258949388a4a803c716ef47c5b5ca56f"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/CHANGELOG_V0_2.md",
    "bytes": 2808,
    "sha256": "d579a73fc53cb1b8c79eac87e98962c71f721fa3a30a07a68dde561491d9b32f"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/CHANGELOG_V0_3.md",
    "bytes": 2431,
    "sha256": "643aaa5b9842a9fbda70fff95636db52e9a8ad9ec0fabcfe97160e45be9f340d"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/CHANGELOG_V0_4.md",
    "bytes": 2603,
    "sha256": "69fa97b10ca0f4a1c0fa8625859afbeda51a79b4a6f280ea9f4a8e110787311f"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/CHANGELOG_V0_5.md",
    "bytes": 2506,
    "sha256": "bf612cac90fa1858c884a1bb50dd194d60ce79027a8e4ec0cefcb01554f4d66f"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/CHANGELOG_V0_6.md",
    "bytes": 830,
    "sha256": "a2368a3f5ab977aca27310d76946138204636517481afd5eb44685fd7aa6ff2a"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/CODEX_40TH_V0_5.md",
    "bytes": 126232,
    "sha256": "b6149e187ce8a21f27a9e927924036bf0f036c39353acc4ea93483396bb94145"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/CODEX_40TH_V0_6.md",
    "bytes": 70562,
    "sha256": "14b50741a2128eb633c506b4b35e4f51179480e236f64952be11dd5101f37ec7"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/CONTENT_COUNTS.json",
    "bytes": 623,
    "sha256": "48a98ad97a5a32892e553c1b1f1e5b977a7ac8b2e5df4115e694802124588e8f"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/QA_SCOPE.md",
    "bytes": 1452,
    "sha256": "f247aa3f80aa142aad14b58f2b05eb3bb3505a8494dee3be51c0ce3244ca93f1"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/documents/docs/SOURCES_ET_ADAPTATION.md",
    "bytes": 3759,
    "sha256": "7220020274057e66c2a44b76ec5992e7cac1e6f8423b7769603f9695a39a28ff"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.1.0/archive.zip.part001",
    "bytes": 10485760,
    "sha256": "836fe578de2c8cd70485e2d355d5e299870c75bc5807e95472a0adaff4e39e31"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.1.0/archive.zip.part002",
    "bytes": 5151874,
    "sha256": "5cf7b514a9bad36619acfa4073bc79866275bf278cec253017e10891d08421d1"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.2.0/archive.zip.part001",
    "bytes": 10485760,
    "sha256": "ad177d9c176fbfdcc226a8faab6b8508aa6d9157f6596b536406853f6bcb7266"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.2.0/archive.zip.part002",
    "bytes": 3519952,
    "sha256": "4651f61a682ca5b6b1236093b28b86c065d244d2931f8f76eb5ec120fc61a367"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.3.0/archive.zip.part001",
    "bytes": 10485760,
    "sha256": "8b17afd52efd5145fd5a7e0df6031da03e285cdb38f2b558904ef6ae1cfc97de"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.3.0/archive.zip.part002",
    "bytes": 2681800,
    "sha256": "507e05e7a0f491d175d0d7dd20689c7151cbd140cae052300163e89c9c25b1e0"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.4.0/archive.zip.part001",
    "bytes": 10485760,
    "sha256": "f2309a211a845a4613d229c2c6f84c65a71bd833ea9b92e6063b5ecc2ff6e7aa"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.4.0/archive.zip.part002",
    "bytes": 10445736,
    "sha256": "d9218f184f1eb0eabcfb306c53aaeac93cb5202e92c9232b1f1c1973a6929389"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.5.0/archive.zip.part001",
    "bytes": 10485760,
    "sha256": "a1c17b2f29a939c3a262469b754567672aee3add3eacacf2c0d77d96a1b83490"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.5.0/archive.zip.part002",
    "bytes": 10485760,
    "sha256": "f7e0dfc177a7e9432dd05a149e534c29973b261a6eafe8a17469351489e3691a"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.5.0/archive.zip.part003",
    "bytes": 2231153,
    "sha256": "195bfb81ea827e57c6dfe4ca84bef9d02e3bd618da965bad7ce68a7fa1bd20c0"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.6.0/archive.zip.part001",
    "bytes": 10485760,
    "sha256": "660626448d6d531704ec21d383ab359c729bbef56c9e01aa74bd0b4ad26a3d3d"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.6.0/archive.zip.part002",
    "bytes": 10485760,
    "sha256": "c1d9976f74287ed7cab09665241865d21b07e77f2b696a862e84cb447046401e"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.6.0/archive.zip.part003",
    "bytes": 10485760,
    "sha256": "1ad5296098b376bb15c7230007dc02bef1fa294870f3a5626c41b3839a5f96eb"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.6.0/archive.zip.part004",
    "bytes": 10485760,
    "sha256": "a781aae94d702252883bdf15a4bc95d4267df4e5ae281483728d50d9d5e9c80d"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.6.0/archive.zip.part005",
    "bytes": 10485760,
    "sha256": "22d6e2c1e11387f2d7eb17848e77d207cff11338505285a6ad871dbe0475b77f"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.6.0/archive.zip.part006",
    "bytes": 10485760,
    "sha256": "c843c079c2efb9c0cfbab3e824641a1cf0bbde159ffe17173306d7d9eea5b94b"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.6.0/archive.zip.part007",
    "bytes": 10485760,
    "sha256": "4925d27b66868cb3da1f0ae1dcb29902b4b78f9d166ed2e0b541c2f4b876a100"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.6.0/archive.zip.part008",
    "bytes": 10485760,
    "sha256": "2a3ff80cafcd5a5906f00256315882b6bf934e2c8bf17c90c5469e892a94694d"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/parts/v0.6.0/archive.zip.part009",
    "bytes": 3412756,
    "sha256": "de9774879832c2ea69372df8d7cec2b43bacecdfba687e519df8971410e2bb67"
  },
  {
    "path": "archives/40th-anniversary-recovery-20261126/restore.py",
    "bytes": 2774,
    "sha256": "01c35c77f43ffe4f9f63168784fedc30115773de1faafa8da0181bccef50c9c4"
  }
].map(row => Object.freeze(row)));
const sourceFiles = new Map(FORTIETH_RECOVERY_FILES_20261126.map(row => [row.path, row]));
const directories = new Set();
for (const { path } of FORTIETH_RECOVERY_FILES_20261126) {
  const segments = path.split('/');
  while (segments.length > 1) { segments.pop(); directories.add(segments.join('/')); }
}
const validPath = path => typeof path === 'string' && path.length > 0
  && !/[\\\x00-\x1f]/.test(path) && !path.startsWith('/')
  && path.split('/').every(part => part && part !== '.' && part !== '..');

export function fortiethRecoveryFile20261126(path) {
  return validPath(path) ? sourceFiles.get(path) || null : null;
}

/** null delegates unrelated files to the established policy. No prefix grant. */
export function fortiethRecoveryPathAdmission20261126(path, { directory = false, built = false } = {}) {
  if (!validPath(path)) return false;
  if (path === 'scripts/public-40th-source-recovery-20261126.mjs') return !built && !directory;
  if (directories.has(path)) return !built && directory;
  if (path === FORTIETH_RECOVERY_ROOT_20261126 || path.startsWith(FORTIETH_RECOVERY_ROOT_20261126 + '/'))
    return !built && !directory && sourceFiles.has(path);
  return null;
}

/** Only independently pinned original bytes may retain historical QA metadata. */
export function verifyFortiethRecoveryBytes20261126(path, bytes) {
  const expected = fortiethRecoveryFile20261126(path);
  assert.ok(expected, 'Unapproved 40th recovery file: ' + path);
  assert.equal(bytes.length, expected.bytes, 'Changed 40th recovery size: ' + path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256,
    'Changed 40th recovery bytes: ' + path);
  return true;
}
