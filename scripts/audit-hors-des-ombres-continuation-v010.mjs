/** Exact source continuation for the Hors des ombres integration.
 * Historical Tantalus and Xeno Trials receipts remain unchanged. This common
 * terminal has no relative imports and cannot admit its own source bytes. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export const HORS_DES_OMBRES_BASELINE_V010 = '001a20bdc0f9f1a3c835e84d8f3c9434bc159330';
export const HORS_DES_OMBRES_PREDECESSORS_V010 = freeze({
  ".gitattributes": "1d4733487bb47787d8a5bcbf3839ce9e24c05e17f39ecde65303d7ab73ff8aae",
  "index.html": "1ab4a1fd0e2a090c287e501e12f6476a15644ca8455a1689133fc1bbeae7f2fd",
  "package.json": "6d261eda040a57d60f8b4039443517a0cfeddd55b657c77ae87d2c8f486a39be",
  "scripts/audit-tantalus-priorities-v188.mjs": "b75a3adbf7271c6c7d6b0ce817db43c12209c261e54cae08e8ae001167ff9568",
  "scripts/audit-xeno-production-assets-v206.mjs": "c309884e210d998dd1c8cd49355905f73fdf4f464ea2d0c15cac78a0f8cff307",
  "scripts/build.mjs": "fa817256bc9832c9390055ddab431e8dd9e1320b273904c39f2489ff6807ab12",
  "scripts/verify-native-qa-resources-v187.mjs": "05367a5372ae834063f6fce495b70d431553977c46efef28337921eb71525bde",
  "scripts/verify-public-release-v86.mjs": "c5f3c645310d030cf6f4e9b89d5a6b4012f30b61d06fe3f3af9fcfb73582e9ae",
  "scripts/verify-tantalus-priorities-v188.mjs": "cc0bda305eec62e3577e72091d2b6b7ca38a71d238950698f614e88b6ae84fc8",
  "scripts/verify-xeno-production-assets-v206.mjs": "5f231063b6a88420cfbacd170ad447da254e14ff18badd7771d89141afab07cb",
  "src/app.js": "da0588f8b64d8a1afd8f2e5ac3871cdc17336369fd87a743a1d9ae807b664798",
  "src/title-screen-v61.js": "e0c10ca738df12c78b48a24d79cb049aea2ac3e1c08ec270d3eed750fe267342",
  "sw.js": "31a06e95264d7280f823c1a78d6cebacb67260ea5468e8466e4bb2cbe0e916a5",
  "vercel.json": "823f49e24f76154f5b3dc82400dae1a154fc1cce81925c3dd52c4a535b1325f9",
  "scripts/build-dev-tools-v188.mjs": "888e76d1aa2a206c71696e69f58373197b8f7fff7179581b53f4dd5ea4fe94a2"
});
// Filled only after the final source review; no historical result is reused.
// BEGIN HORS DES OMBRES SOURCE RECEIPTS
export const HORS_DES_OMBRES_SUCCESSORS_V010 = freeze({
  ".gitattributes": {
    "previousSha256": "1d4733487bb47787d8a5bcbf3839ce9e24c05e17f39ecde65303d7ab73ff8aae",
    "currentSha256": "dda662cd40c359de04104176836a6bcefbff6935fa16ada1a89df21295470366"
  },
  "index.html": {
    "previousSha256": "1ab4a1fd0e2a090c287e501e12f6476a15644ca8455a1689133fc1bbeae7f2fd",
    "currentSha256": "283c6f968b9240f0429c582c149515f45825b3ce01766ae71654e5ec5ae53baf"
  },
  "package.json": {
    "previousSha256": "6d261eda040a57d60f8b4039443517a0cfeddd55b657c77ae87d2c8f486a39be",
    "currentSha256": "afbcc90092d59145b2affe73a9ee8e32dec7135988fe85aaabdf91c0b7c9784d"
  },
  "scripts/audit-tantalus-priorities-v188.mjs": {
    "previousSha256": "b75a3adbf7271c6c7d6b0ce817db43c12209c261e54cae08e8ae001167ff9568",
    "currentSha256": "74289d730a20177f0a3883e3b12ae11b416e668f997543a60efb683f5c659eef"
  },
  "scripts/audit-xeno-production-assets-v206.mjs": {
    "previousSha256": "c309884e210d998dd1c8cd49355905f73fdf4f464ea2d0c15cac78a0f8cff307",
    "currentSha256": "9fdca1128bb28140117e4c2154b9e12b49a53a9c637290d7ccc8deec52da5124"
  },
  "scripts/build.mjs": {
    "previousSha256": "fa817256bc9832c9390055ddab431e8dd9e1320b273904c39f2489ff6807ab12",
    "currentSha256": "4b40e7a5f0c2ec18238b3f7f2a90ac4e7686af8fd456cf211c92f7883064c6e1"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "previousSha256": "05367a5372ae834063f6fce495b70d431553977c46efef28337921eb71525bde",
    "currentSha256": "ab2ae394b944e09721019ac94bc53aa1d8fd6f065060d20ac6471eb3176f8919"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "c5f3c645310d030cf6f4e9b89d5a6b4012f30b61d06fe3f3af9fcfb73582e9ae",
    "currentSha256": "dd8f8f4ac6583de69ea0e87762a199d9c035e8f65bf8fea458b3b0a91bb2e7e4"
  },
  "scripts/verify-tantalus-priorities-v188.mjs": {
    "previousSha256": "cc0bda305eec62e3577e72091d2b6b7ca38a71d238950698f614e88b6ae84fc8",
    "currentSha256": "775420eb8e7c59bae4429c761d57c25df10f7ef2e02e65c69b1496ffbe22e594"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "previousSha256": "5f231063b6a88420cfbacd170ad447da254e14ff18badd7771d89141afab07cb",
    "currentSha256": "f6624639816ceee44f20a6361ec23b60525904432e33637d10a0ec785ef565c2"
  },
  "src/app.js": {
    "previousSha256": "da0588f8b64d8a1afd8f2e5ac3871cdc17336369fd87a743a1d9ae807b664798",
    "currentSha256": "c18c1e3c3dbaa8b6b3f877b9b52316650ae35a26b1f5f8d4714fe8ccde8bacc8"
  },
  "src/title-screen-v61.js": {
    "previousSha256": "e0c10ca738df12c78b48a24d79cb049aea2ac3e1c08ec270d3eed750fe267342",
    "currentSha256": "17c1527c13c94f5330dadacac7ca291e5dac06fed1eb66a1d720bcdafecce810"
  },
  "sw.js": {
    "previousSha256": "31a06e95264d7280f823c1a78d6cebacb67260ea5468e8466e4bb2cbe0e916a5",
    "currentSha256": "ed9d0fc9731f36fea47b402d6e868c87238b0bf3f9a73c31802987694b314cbb"
  },
  "vercel.json": {
    "previousSha256": "823f49e24f76154f5b3dc82400dae1a154fc1cce81925c3dd52c4a535b1325f9",
    "currentSha256": "44fb610c50058b930dd4f55d80835554d978f8dcc025244a655d62503a9a3924"
  },
  "scripts/build-dev-tools-v188.mjs": {
    "previousSha256": "888e76d1aa2a206c71696e69f58373197b8f7fff7179581b53f4dd5ea4fe94a2",
    "currentSha256": "73c7963635cfadc00bf2819df2ba6282d8a299025efb767cc8fc8bd28c8c2afa"
  }
});
// END HORS DES OMBRES SOURCE RECEIPTS

/** A parallel chain may have no receipt for a path changed by its neighbour.
 * In that case it must return its untouched input to the V187 join. A chain
 * which advanced the path, or already reached the exact shared baseline,
 * must traverse this continuation and cannot skip a predecessor. */
export function reviewedHorsDesOmbresDigestV010(path, endpoint, { owned = true } = {}) {
  if (!Object.hasOwn(HORS_DES_OMBRES_SUCCESSORS_V010, path)) return endpoint;
  const receipt = HORS_DES_OMBRES_SUCCESSORS_V010[path];
  if (!owned && endpoint !== receipt.previousSha256) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken 001a20b-to-hors-des-ombres source chain: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid Hors des ombres source digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A Hors des ombres successor must identify changed bytes: ' + path);
  return receipt.currentSha256;
}

/** Existing runtime views are idempotent; only the baseline or the admitted
 * successor may be encountered. Unknown paths retain their original value. */
export function horsDesOmbresRuntimeSourcesV010(view) {
  const result = { ...view };
  for (const [path, receipt] of Object.entries(HORS_DES_OMBRES_SUCCESSORS_V010)) {
    if (!Object.hasOwn(result, path)) continue;
    if (result[path] === receipt.previousSha256) result[path] = receipt.currentSha256;
    else assert.equal(result[path], receipt.currentSha256, 'Incorrect Hors des ombres runtime view predecessor: ' + path);
  }
  return Object.freeze(result);
}

export function verifyHorsDesOmbresContinuationV010(readSource = readRepository) {
  assert.equal(HORS_DES_OMBRES_BASELINE_V010, '001a20bdc0f9f1a3c835e84d8f3c9434bc159330', 'The integration must retain its exact reviewed baseline');
  assert.deepEqual(Object.keys(HORS_DES_OMBRES_SUCCESSORS_V010).sort(), Object.keys(HORS_DES_OMBRES_PREDECESSORS_V010).sort(),
    'The integration may supersede only its reviewed source paths');
  assert.equal(Object.hasOwn(HORS_DES_OMBRES_SUCCESSORS_V010, 'scripts/audit-hors-des-ombres-continuation-v010.mjs'), false,
    'The continuation cannot admit its own source bytes');
  for (const [path, receipt] of Object.entries(HORS_DES_OMBRES_SUCCESSORS_V010)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.equal(receipt.previousSha256, HORS_DES_OMBRES_PREDECESSORS_V010[path], 'Changed 001a20b predecessor: ' + path);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'An integration receipt must identify changed bytes: ' + path);
    assert.equal(sha(readSource(path)), receipt.currentSha256, 'Unreviewed Hors des ombres source bytes: ' + path);
  }
  return Object.freeze({ baselineCommit: HORS_DES_OMBRES_BASELINE_V010,
    successors: Object.keys(HORS_DES_OMBRES_SUCCESSORS_V010).length, historicalResultsTransferred: false });
}
