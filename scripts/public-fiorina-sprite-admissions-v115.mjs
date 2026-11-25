import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { validateAlien3SpriteManifestV115 } from '../src/alien3-sprites-v115.js';

export const FIORINA_SPRITE_DIRECTORY_V115 = 'assets/openai/sprites/alien3-fiorina-v115';
export const FIORINA_SPRITE_MANIFEST_V115 = `${FIORINA_SPRITE_DIRECTORY_V115}/manifest.json`;

// BEGIN REVIEWED PINS — update only after inspecting the delivered pixels.
export const FIORINA_SPRITE_MANIFEST_SHA256_V115 = '7a13489288e96be84958a159844c5d550d0e4bfa285a8748b49ac19e5b7a72a7';
export const FIORINA_SPRITE_FILES_V115 = Object.freeze([
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/aaron-idle.png",
    "sha256": "eac18238c6df8bf7b9cb408049ac570130f7ecc24f26f3ed04b50e7efee365d1",
    "bytes": 1677354,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/andrews-idle.png",
    "sha256": "c7566fca89c76968de355bb25a748ab8c1a37102871b7a9e70c175cbb1f71423",
    "bytes": 1649480,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/arthur-idle.png",
    "sha256": "007e097b18420e4b58785b56bd4134301f2a7c7482921241898195eadafe281c",
    "bytes": 1815225,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/bishop-damaged.png",
    "sha256": "d9ac762365f330db4439ce4f148a88b82ec92f0943e5464257827522fd5196f5",
    "bytes": 1716084,
    "width": 1862,
    "height": 845
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/bishop-representative-idle.png",
    "sha256": "5df1ea8946a901a92b0e5597e0846699ee2ca35a53dfc80863ce87aae2dc7845",
    "bytes": 1387754,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/clemens-idle.png",
    "sha256": "8afc420f8af2598dd2917545c93c200ab9475cb950ecb33bff0b4b9515a25d9c",
    "bytes": 1409997,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/company-commando-idle.png",
    "sha256": "d01dd988cc783cc529b51eaea9a580ffe869bedc48d92447e98d2d949067c552",
    "bytes": 2187435,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/company-scientist-idle.png",
    "sha256": "ec9728de46d913c791f1aadeac39fe2419f32a5eb0a0983151977ed7466458ea",
    "bytes": 1832071,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/david-idle.png",
    "sha256": "6a647498795044e25dfc9e1ed2bec74b5cbd1ab1522e9c9a5911ebff2f97d518",
    "bytes": 1768386,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/dillon-fire-axe.png",
    "sha256": "96f5e1358fd83d0a80349ae5147cb4c2de079a38bbf57bbf4ff2198cecaa2188",
    "bytes": 422108,
    "width": 1592,
    "height": 988
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/dillon-idle.png",
    "sha256": "9280c3c37a3f47dabe17606c32372886898d77162878912c41a1596bfdce6c78",
    "bytes": 2162589,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/dillon-walk-a.png",
    "sha256": "dde10467a0ad1fb3c3805764c6e39e264269bcbbbfb06adecc8d23c3898b270b",
    "bytes": 1613599,
    "width": 1199,
    "height": 1312
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/dillon-walk-b.png",
    "sha256": "ad07c2b8451526028e7813478196f44ed7db4877cfc0a44ec7e4e7a6e1adf981",
    "bytes": 1082812,
    "width": 1199,
    "height": 1312
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/eric-idle.png",
    "sha256": "50555f9bcc5c811f036ef8e09930ef26f6d464c5e411611ca3f7ad4ebd041ab6",
    "bytes": 1659122,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/frank-idle.png",
    "sha256": "ca8d63fbd3ee31b9225a10f880f4c003b19bed6b79fff0ddc9f07b43f9baaf9b",
    "bytes": 1962269,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/golic-idle.png",
    "sha256": "198f7ceb34872bb43bda50898360a18a25ebca0739cbe837f5d64b325f8d961c",
    "bytes": 1263301,
    "width": 887,
    "height": 1774
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/gregor-idle.png",
    "sha256": "d2e116aa9eade2c1df548dbb3898f2ee9a49c99d9f1091a306fb5453be6080c1",
    "bytes": 1598640,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/jude-idle.png",
    "sha256": "e4e5e4a9c1093d585efb03b1b5e5b953e8ac933c81d774928b1a4aec88367dd1",
    "bytes": 1806863,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/junior-idle.png",
    "sha256": "8b34ef6ce5f54786103b28337a6152b17f03c8aaf56b975ae250d2bd3ef9046e",
    "bytes": 1637039,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/kevin-idle.png",
    "sha256": "d728905173a943d95bf1359415674d6fc0ff80f7ee43a8f7dd1cac0986abb10e",
    "bytes": 1342641,
    "width": 887,
    "height": 1774
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/morse-idle.png",
    "sha256": "39bd0eb7db35164155d78a37c2dfceadd31d5b7ad3ba0782a7275d5ea18503c4",
    "bytes": 1848723,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/morse-walk-a.png",
    "sha256": "9ac48ffb730e76ffb3ee23baf9187fa61bfc759959eaeff7db063bb7ea7938ad",
    "bytes": 2240315,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/morse-walk-b.png",
    "sha256": "f1d84d58c9cd8bade16e9f9cfe982a6cea93693d966e9f52686f986972de1062",
    "bytes": 1922187,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-coat-idle.png",
    "sha256": "f308e1234869175fd8100bf06e5e4d811060afd7a720c21fb600d759ff109d79",
    "bytes": 1096004,
    "width": 986,
    "height": 1595
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-crash-idle.png",
    "sha256": "129187cce0e1a346eef0b287f9f5148d29f390d65119a2de4ec5c664722b029b",
    "bytes": 760366,
    "width": 986,
    "height": 1594
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-climb-a.png",
    "sha256": "af6533431a7e98c837651271dcef8711db5e3a4d2735b34a25a59f426f57c9e0",
    "bytes": 854856,
    "width": 986,
    "height": 1594
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-crouch.png",
    "sha256": "89ecdf43bbdba52d8eaa648808f679bfcf3171e99a34753f5851773eb2b7791a",
    "bytes": 1202910,
    "width": 1312,
    "height": 1199
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-idle.png",
    "sha256": "6693f849c8706de1c042206d951cf74ab8bf415664a8f07308b45afd3fcd6488",
    "bytes": 844848,
    "width": 986,
    "height": 1595
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-jump.png",
    "sha256": "71119e557be0a9eb10662590b935449ab67e75b612eda53b8e30f88c8dcd6b66",
    "bytes": 1573681,
    "width": 1536,
    "height": 1024
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-run-a.png",
    "sha256": "8f0cc7d188896981c92876b4c95e78adcad9fce470189c1095921f6387effd7e",
    "bytes": 873274,
    "width": 1312,
    "height": 1199
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-run-b.png",
    "sha256": "a3b64ebabe95b429baea41b2be0f88ff61232f7cc9106b224b65991b650390f5",
    "bytes": 859667,
    "width": 1312,
    "height": 1199
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-walk-a.png",
    "sha256": "c08f45541bd3cc732fe018f5b0ae01b68573c1da8bd651e6c17c0203dd84edbc",
    "bytes": 918090,
    "width": 986,
    "height": 1594
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-walk-b.png",
    "sha256": "8cf1f89af25b1918a86dc24e997d2d2f7f49118261e12c4d9b193f09145c2cb9",
    "bytes": 916096,
    "width": 986,
    "height": 1594
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/runner-prowl.png",
    "sha256": "18f91c0958876a06c00a5ee613bfd8cec3f6d3bed5c645b15e420adffa60cb57",
    "bytes": 1057406,
    "width": 1983,
    "height": 793
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/runner-run-b.png",
    "sha256": "df8234fb8ba90267a49ab8a970e5422b3716939adfa31f34ec024e14091d1047",
    "bytes": 959156,
    "width": 2172,
    "height": 724
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/runner-walk-b.png",
    "sha256": "964e5eb301082fc1361b651a1a48811159f61f4ddb5542323569677193af11b9",
    "bytes": 1052134,
    "width": 1983,
    "height": 793
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/spike-idle.png",
    "sha256": "64f3f063548ab8f9ac57c4802332d54f9e259e6a5c677578915bb3b43133ad8e",
    "bytes": 2000179,
    "width": 1536,
    "height": 1024
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/troy-idle.png",
    "sha256": "5ccb678feb2ab3bf683bfda7067467c6d31f64d4384f7b28c13627276a1dd4f4",
    "bytes": 1604281,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/william-idle.png",
    "sha256": "f6ac9a573d24959390e05c67608daae4067edcc6fd83b2dea0aef5acf34942db",
    "bytes": 1715889,
    "width": 1024,
    "height": 1536
  }
].map(Object.freeze));
// END REVIEWED PINS

// BEGIN REVIEWED V116 ADDITIONS
// These additions extend the frozen V115 pixels; calibration changes live in
// the separately pinned current manifest and the V116 provenance record.
export const FIORINA_SPRITE_MANIFEST_SHA256_V116 = 'db64e2b36aa8a0fa424adf112a1669a0e325c4497067fc38ddbfe140af418e6a';
export const FIORINA_SPRITE_ADDITIONS_V116 = Object.freeze([
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/boggs-idle.png",
    "sha256": "8318c9dfae6299095250f33a755f40696061d1fdcaa409cfd0cd5d01999652b4",
    "bytes": 2002234,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/company-scientist-goggles.png",
    "sha256": "3e06b1250b00f5c9a674b76230818b062d55f7d1eda3b3c17b3334661141f2fc",
    "bytes": 1133798,
    "width": 1774,
    "height": 887
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/dillon-glasses.png",
    "sha256": "fadc0da30854c40b00e8131a083f92f23487b4410ff2f66010edb26b25176f70",
    "bytes": 1094340,
    "width": 1774,
    "height": 887
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/dillon-run-a.png",
    "sha256": "4d3f92907e8dfbd964a8ce45e9660a834d5849a975cc917181adb1eb0074d949",
    "bytes": 2052298,
    "width": 1536,
    "height": 1024
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/dillon-run-b.png",
    "sha256": "5f80b6fadb6f43c6680df4bf030275c7573d7ea9b70a9b55bf905ac5c0b9ba1f",
    "bytes": 1486704,
    "width": 1199,
    "height": 1312
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/fire-flare.png",
    "sha256": "111952b339cd5c6ef566a7337dd8de208b14e46f0440ee93cca13b5773666bc0",
    "bytes": 1286902,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/morse-run-a.png",
    "sha256": "8c79ea34ce729ea1b9e476269e06abc2e93aa38926c10fe185852c1313cb9972",
    "bytes": 1856775,
    "width": 1536,
    "height": 1024
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/morse-run-b.png",
    "sha256": "d4a3cebe670db8edf635d98e1934ca53a8ef61d1d01074886f2715f21a43c52a",
    "bytes": 1333235,
    "width": 1312,
    "height": 1199
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/murphy-idle.png",
    "sha256": "518aaf21595c0724b808b324b0d1f2c043b2d8918b4db388fb8834a6e2727329",
    "bytes": 1742102,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ox-assembly-idle.png",
    "sha256": "421a8ef4fc9b3a0afbdb86c5306e1909dbef5fccdde096147f92ef22e2508a51",
    "bytes": 1965923,
    "width": 1536,
    "height": 1024
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/rains-idle.png",
    "sha256": "2347c1f64ddc568c3c296fcb05e57466142eb1b52fea27979e0d3e88e551475c",
    "bytes": 1821277,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-crash-run-a.png",
    "sha256": "56d4539bbba13c504ec7365aa6208edc3adfbb8ab316d351213e29f0feca106d",
    "bytes": 797953,
    "width": 1134,
    "height": 1387
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-crash-run-b.png",
    "sha256": "04c559dad497ee1d560485ede2fd13f7e0ba7a63135b376020fcba8f67e6b086",
    "bytes": 1581184,
    "width": 1024,
    "height": 1536
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-crash-walk-a.png",
    "sha256": "70f56bc433b4fbd37db810f15270401abcbfb159af0e10ebb67cf116ce6d062f",
    "bytes": 903417,
    "width": 987,
    "height": 1594
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-crash-walk-b.png",
    "sha256": "10fd764540582a9884da1879b88b86be5234784166b733ff1e7f7efd1a629acf",
    "bytes": 787330,
    "width": 987,
    "height": 1594
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-climb-b.png",
    "sha256": "ad58afb51c8dfa683f6dce574f13218c34c5ac11bd976e8d63d0969e1899c9a6",
    "bytes": 895383,
    "width": 987,
    "height": 1594
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-crouch-walk-a.png",
    "sha256": "f44999bde103f631334f7a05faade80e71867a8722f2b103c5a95cdf10f3a2a5",
    "bytes": 1294184,
    "width": 1659,
    "height": 948
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-crouch-walk-b.png",
    "sha256": "f7d905f9cc5af0632eae849ebfafd990e6d0fb581be4e7104f7e1025b902c545",
    "bytes": 1339067,
    "width": 1312,
    "height": 1199
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-hurt.png",
    "sha256": "4943fec35630d7342d399303d815d08935e522388f2911dc9c749b3b16d8099a",
    "bytes": 1007410,
    "width": 986,
    "height": 1594
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/ripley-prison-interact.png",
    "sha256": "c31ab78f727000fdf88db5e83694d337e80a2b998af8045fda36652b27cb4558",
    "bytes": 870693,
    "width": 986,
    "height": 1594
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/royal-facehugger-assembly.png",
    "sha256": "7d3ef42dba897af75eea1f9814bf96a1f15388dba13e7b4e018d03d0d3559e8d",
    "bytes": 1342849,
    "width": 2172,
    "height": 724
  },
  {
    "path": "assets/openai/sprites/alien3-fiorina-v115/weyland-yutani-matchbox.png",
    "sha256": "ce8967b10b7d623c6720a4633b0b9559c6b7f261b0bbb0c4272016375481be45",
    "bytes": 2535666,
    "width": 1536,
    "height": 1024
  }
].map(Object.freeze));
// END REVIEWED V116 ADDITIONS

export const FIORINA_SPRITE_CURRENT = Object.freeze({
  revision: 'fiorina-sprites-v116',
  manifestSha256: FIORINA_SPRITE_MANIFEST_SHA256_V116,
  files: Object.freeze([...FIORINA_SPRITE_FILES_V115, ...FIORINA_SPRITE_ADDITIONS_V116]
    .sort((a, b) => a.path.localeCompare(b.path))),
});

export const FIORINA_SPRITE_SOURCE_ONLY_V115 = new Set([
  'scripts/public-fiorina-sprite-admissions-v115.mjs',
  'scripts/verify-fiorina-sprite-admissions-v115.mjs',
  'scripts/verify-fiorina-sprite-renderer-v115.mjs',
  'scripts/qa-fiorina-sprites-v115.mjs',
  'scripts/qa-fiorina-native-sprites-v115.mjs',
  'docs/development/FIORINA_SPRITES_V115.md',
  'docs/development/FIORINA_SPRITES_V115.json',
  'docs/development/FIORINA_SPRITES_V116.md',
  'docs/development/FIORINA_SPRITES_V116.json',
]);
const admitted = new Set([FIORINA_SPRITE_MANIFEST_V115, ...FIORINA_SPRITE_CURRENT.files.map(file => file.path)]);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

/** Source download only; the build still excludes every provenance document. */
export function reviewedFiorinaSpritePackFilesV115() {
  const documents = [...FIORINA_SPRITE_SOURCE_ONLY_V115]
    .filter(path => /^docs\/development\/FIORINA_SPRITES_V[0-9]+\.(?:md|json)$/.test(path));
  const paths = [FIORINA_SPRITE_MANIFEST_V115, ...FIORINA_SPRITE_CURRENT.files.map(file => file.path), ...documents];
  assert.equal(new Set(paths).size, paths.length, 'Duplicate file in the reviewed sprite download');
  return Object.freeze(paths);
}

export function publicFiorinaSpritePathAdmissionV115(path, { directory = false, built = false } = {}) {
  if (typeof path !== 'string') return null;
  if (FIORINA_SPRITE_SOURCE_ONLY_V115.has(path)) return !directory && !built;
  if (path === FIORINA_SPRITE_DIRECTORY_V115) return directory;
  if (!path.startsWith(FIORINA_SPRITE_DIRECTORY_V115 + '/')) return null;
  return !directory && admitted.has(path);
}

export async function verifyFiorinaSpriteAdmissionsV115(root) {
  const bytes = await readFile(join(root, FIORINA_SPRITE_MANIFEST_V115));
  assert.equal(digest(bytes), FIORINA_SPRITE_CURRENT.manifestSha256, 'Fiorina sprite manifest differs from the reviewed contract');
  const raw = JSON.parse(bytes);
  const valid = validateAlien3SpriteManifestV115(raw);
  assert.equal(valid.ok, true, `Invalid Fiorina sprite manifest: ${valid.errors.join(', ')}`);
  const paths = new Set(Object.values(valid.manifest.assets).flatMap(entry => [entry.src, ...entry.frames.map(frame => frame.src)]));
  assert.deepEqual([...paths].sort(), FIORINA_SPRITE_CURRENT.files.map(file => file.path).sort(), 'Fiorina manifest and exact PNG allowlist differ');
  const actualFiles = await readdir(join(root, FIORINA_SPRITE_DIRECTORY_V115), { withFileTypes: true });
  assert.deepEqual(actualFiles.map(file => `${FIORINA_SPRITE_DIRECTORY_V115}/${file.name}`).sort(), [...admitted].sort(), 'Unreviewed or missing file in the Fiorina sprite pack');
  assert.ok(actualFiles.every(file => file.isFile() && !file.isSymbolicLink()), 'Only regular files belong to the Fiorina sprite pack');
  const measured = new Map();
  for (const file of FIORINA_SPRITE_CURRENT.files) {
    const fullPath = join(root, file.path);
    assert.equal((await lstat(fullPath)).isSymbolicLink(), false, file.path);
    const image = await readFile(fullPath);
    assert.equal(image.length, file.bytes, `${file.path}: byte length changed`);
    assert.equal(digest(image), file.sha256, `${file.path}: PNG pixels changed`);
    assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', file.path);
    assert.equal(image.subarray(12, 16).toString(), 'IHDR', file.path);
    assert.equal(image.readUInt32BE(16), file.width, `${file.path}: width`);
    assert.equal(image.readUInt32BE(20), file.height, `${file.path}: height`);
    assert.equal(image[24], 8, `${file.path}: expected eight-bit pixels`);
    assert.equal(image[25], 6, `${file.path}: expected RGBA pixels`);
    measured.set(file.path, file);
  }
  for (const entry of Object.values(valid.manifest.assets)) {
    const source = measured.get(entry.src);
    assert.equal(entry.sha256, source.sha256, `${entry.id}: source fingerprint`);
    assert.equal(entry.bytes, source.bytes, `${entry.id}: source byte length`);
    for (const frame of entry.frames) {
      const file = measured.get(frame.src);
      assert.ok(frame.x + frame.w <= file.width && frame.y + frame.h <= file.height, `${entry.id}: frame exceeds ${frame.src}`);
    }
  }
  return { images: measured.size, entries: Object.keys(valid.manifest.assets).length, manifestSha256: digest(bytes) };
}
