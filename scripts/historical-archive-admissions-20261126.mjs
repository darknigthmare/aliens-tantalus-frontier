import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Closed recovery inventory: original bytes only, source-only, no runtime approval.
export const HISTORICAL_ARCHIVE_FILES_20261126 = Object.freeze(Object.fromEntries(
  Object.entries({
  "archives/dlc-historical-recovery-20261126/BATCH_001.json": {
    "bytes": 2617,
    "sha256": "9fae6f77cc78c926b85e17786ed10e02b30abc6dbbd02c0d8bb18ecbf0309848"
  },
  "archives/dlc-historical-recovery-20261126/INDEX.json": {
    "bytes": 72620,
    "sha256": "701203849831c5135c4ebecd8750de7b4c51f6311960fec936587e1d4ad62ffa"
  },
  "archives/dlc-historical-recovery-20261126/README.md": {
    "bytes": 2832,
    "sha256": "1fcbff73ff3bb4d2763e22f65988db9660d78c3f03700c7cecee74b5b44e9620"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v117/MANIFEST.json": {
    "bytes": 1252,
    "sha256": "f2ae41fc0c1c19d966938b964ee08c87dd89bba65752467de50d5c8c43574206"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v117/ZIP_CONTENTS.json": {
    "bytes": 88068,
    "sha256": "85cf324ffb0c85c8cd94472e433c84c9e2489f4ef9dac2f6e7662d5921a5ec91"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v118/MANIFEST.json": {
    "bytes": 1252,
    "sha256": "022788c174b8247c756b1239a6e161bd61a669fe3d6431c98eb628e1c81d78d1"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v118/ZIP_CONTENTS.json": {
    "bytes": 98325,
    "sha256": "fe78f4a3160191a71d75bf48cfea3cc12bc557442af036844ba1f034c8b86834"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v125/MANIFEST.json": {
    "bytes": 1261,
    "sha256": "5aef3f556b66eef372b171bc5731e641cebbaa9a637349d99e5bc2f06d95ddf8"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v125/ZIP_CONTENTS.json": {
    "bytes": 208079,
    "sha256": "31014b2a07ff5f4e118afeb037ab95241a775c45b41d438a505ed40c873e2e13"
  },
  "archives/dlc-historical-recovery-20261126/reconstruct.mjs": {
    "bytes": 2172,
    "sha256": "d6f2b66cad210c621dce750a660906dcde2330512bd60c9cfc571b6547a81f06"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v117/ALIEN_RESURRECTION_ASSETS_ANIMES_V117.zip.part001": {
    "bytes": 10485760,
    "sha256": "813039bf1d3b58f23636076f744813c04835dbd1aa839362bfc18f30d5df233d"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v117/ALIEN_RESURRECTION_ASSETS_ANIMES_V117.zip.part002": {
    "bytes": 2846022,
    "sha256": "85d7a787c29d596ca8facacee95f4595091ed63ea65bc9dbdccac75d168cb95c"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v118/ALIEN_RESURRECTION_ASSETS_ANIMES_V118.zip.part001": {
    "bytes": 10485760,
    "sha256": "33d382f24d779250c679a416051a137cded52e8e68de035b6797ffb95bd0d238"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v118/ALIEN_RESURRECTION_ASSETS_ANIMES_V118.zip.part002": {
    "bytes": 3629859,
    "sha256": "55634ec19fdea11c07132bdbfff6bca0337131f501aa76b37b2d81409f486998"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v125/ALIEN_RESURRECTION_IDENTITES_ASSETS_V125.zip.part001": {
    "bytes": 10485760,
    "sha256": "29bf3c65ee90883296f33086c87eeee750e9c8b51f7e71c2413d7548e5f6e331"
  },
  "archives/dlc-historical-recovery-20261126/alien-resurrection/v125/ALIEN_RESURRECTION_IDENTITES_ASSETS_V125.zip.part002": {
    "bytes": 6203211,
    "sha256": "d545d9da5a7773cbfe9e76f5f1ad8acfb453c44f013f840cf59faa6bf7934d3f"
  }
}).map(([path, value]) => [path, Object.freeze(value)])
));
const prefix = 'archives/dlc-historical-recovery-20261126';
const scripts = new Set(['scripts/historical-archive-admissions-20261126.mjs', 'scripts/verify-historical-archive-admissions-20261126.mjs']);
const directories = new Set(Object.keys(HISTORICAL_ARCHIVE_FILES_20261126).flatMap(path => {
  const segments = path.split('/');
  return segments.slice(0, -1).map((_, i) => segments.slice(0, i + 1).join('/'));
}));
export function historicalArchiveFile20261126(path) {
  return Object.hasOwn(HISTORICAL_ARCHIVE_FILES_20261126, path) ? HISTORICAL_ARCHIVE_FILES_20261126[path] : null;
}
export function publicHistoricalArchivePathAdmission20261126(path, { directory = false, built = false } = {}) {
  if (scripts.has(path)) return !built && !directory;
  if (directories.has(path)) return !built && directory;
  if (typeof path !== 'string' || (path !== prefix && !path.startsWith(prefix + '/'))) return null;
  return !built && !directory && Object.hasOwn(HISTORICAL_ARCHIVE_FILES_20261126, path);
}
export async function verifyHistoricalArchiveSources20261126(root, { built = false, readSource } = {}) {
  if (built) return { sourceOnly: true, files: 0 };
  let total = 0;
  for (const [path, expected] of Object.entries(HISTORICAL_ARCHIVE_FILES_20261126)) {
    const bytes = await (readSource ? readSource(path) : readFile(join(root, path)));
    assert.equal(bytes.length, expected.bytes, 'Changed historical archive size: ' + path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256, 'Changed historical archive bytes: ' + path);
    total += bytes.length;
  }
  return { sourceOnly: true, files: Object.keys(HISTORICAL_ARCHIVE_FILES_20261126).length, bytes: total };
}
