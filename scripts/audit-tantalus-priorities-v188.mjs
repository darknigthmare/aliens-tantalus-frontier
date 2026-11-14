/** V188 — owner-approved P0/P1 priorities of the campaign bible (§56).
 *
 * Baseline: 803db26dbd7ed453d9534eee237806053438f300 (main after PR #46). The predecessor of
 * every receipt is the reviewed V187 endpoint of that file at this baseline.
 * The owner lifted the save/catalogue protection for this lot on 2026-11-12
 * (bible §56.1): each changed byte still needs an exact receipt here, and
 * migrations stay additive. This terminal module imports no audit and has no
 * receipt for itself. It makes no art, translation-coverage or playtest claim.
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

export const TANTALUS_PRIORITIES_BASELINE_V188 = '803db26dbd7ed453d9534eee237806053438f300';
// BEGIN V188 SOURCE RECEIPTS
export const TANTALUS_PRIORITIES_SUCCESSORS_V188 = freeze({
  "LICENSE_NOTICE.md": {
    "previousSha256": "9a9f2b4bad2c4f0cd2a0b4b2b274607f12c80884489c41c30d1ea2fa1efea714",
    "currentSha256": "7cb68d12e9f47641c45c8d61d5dbf5ba846ff3688a1f5be2ed9a637cfc88fa74"
  },
  "assets/audio/manifest.json": {
    "previousSha256": "fe1591ced8f54e576de99963bb6034ee35a06d07cafa5022279bd04ac9fef8ab",
    "currentSha256": "d62af84b5e5732ae052f5d488790867880ec2cf16b22c15be5d4ae2570517edd"
  },
  "bioforge-v80.css": {
    "previousSha256": "7c81329084b7f189fc6893571ff50f1b806de302360c4a5a5ca9056732555d39",
    "currentSha256": "759e4893bdb3cbc163e4e24432adf1b582429ca7377f0aa153abe22cf6b64178"
  },
  "catalog-v62.css": {
    "previousSha256": "bfa4b96ed445e8274760e3f7ad9cf876d9eec5ee5ab958f0c66e88177b01c780",
    "currentSha256": "4d0b0b616d94531e2c03f1c8259dbf7efd33142a57650ea24d05496c84fae1da"
  },
  "command-v110.css": {
    "previousSha256": "4c22914bedd2d9de880126cd29dd5e458d37e85d56603fae15600b4621b94c42",
    "currentSha256": "fcd7c6d52cc691fbd22841a2488808f4024ac8a2b55a6bbad36977217b24aa21"
  },
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
    "previousSha256": "95287e9c3f9be2b88db9e391a9a143c4c69be8956b6763e4113645974b9e878d",
    "currentSha256": "ee5644bb1a8071c5b67dcedde105ac138bcc652e0c509154073e5d759d763e75"
  },
  "hub-level.css": {
    "previousSha256": "13e29b3719e1246d595dadca4c786cbeb5a471dece902104b0ccd29a1de9908d",
    "currentSha256": "12c8e9e7f561a2eaec89fe9dfac46a190b1cd801a303cd85e95820b66821c818"
  },
  "index.html": {
    "previousSha256": "337a0b230d0b075bf70e5122240f1ce8e0d2deaebbbd563a15496ea92b5f4d66",
    "currentSha256": "c8cf0bbaa80d8b33b69b10ca49f7b8fb631ef0c3f9320f1705857686d0f6e646"
  },
  "package.json": {
    "previousSha256": "ff133a405bfc1ef2afa7085fcb2a6cde27a9f52c4af0de5172a058b47082eb48",
    "currentSha256": "44d24efd7295dd92345b762403495573da31be0de0d5084678c2c8188ebe3707"
  },
  "player-onboarding-v84.css": {
    "previousSha256": "ae49e974d70f1a46dbd28da6d5515fac0124c992591cf0c1c50ad3e7e3d1cfbf",
    "currentSha256": "6777002acd6f07dc583388b59aecf11a03e7e254aca7dab3c93c3b21d49522a4"
  },
  "runtime-level.css": {
    "previousSha256": "28f938a757c83c1ca286d8520afd164fe1b6f8bc1524bfd9d3fb8e7e0f36f4f8",
    "currentSha256": "ef091c01725ac2d23ac7faf541d6ece9bce39c2752185ff6a778a978da6bfbb1"
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "previousSha256": "6be75d792e8ae0ba4d1ad6cbdaa4285e78bd958fda2eeaa23e510a5b2b49190d",
    "currentSha256": "4f2d15004b203a1171fe5cc0b1e67394a79b5a343f3a1360da5ef3604ca8dbd1"
  },
  "scripts/qa-hub-navigation-v133.mjs": {
    "previousSha256": "a6273b6ea62709fee62a2b5ab8996da2c1b967cad98c83f4cb497de07b8c7e40",
    "currentSha256": "962bcda0288d96fb3006a4c16dfb56562606ba170e69f184a310ac0d2dc10c53"
  },
  "scripts/verify-campaign-lethe-v163.mjs": {
    "previousSha256": "cb3ac8826d4f15bbab86e0c42dcd225aeee341c9b10950046fb14af104473049",
    "currentSha256": "d2df7436c236e19240bee69843d2f122693e60de34aec776f95bfb332385864c"
  },
  "scripts/verify-campaign-story-v160.mjs": {
    "previousSha256": "a8f09d16a1e137b36b95c1473910d228289c2515b26bd3704584a2f13cfabcf8",
    "currentSha256": "7bab9f00bfb5a57a667c240be8d0cd56628aa4729349bd080c85a2bf2d383418"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "previousSha256": "8f3342580f3969a7ddef8680af2bf4ab1df6cf64c61a67419ae8add7458e21e9",
    "currentSha256": "a3efc37fd10216930c26e9afb54c52d6a6b71050c233db87b5b1c224748c166a"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "previousSha256": "763a500bddbdbac72145b64fe88419280a9d6377b80cfb7f2333140f95bc7b14",
    "currentSha256": "0b67859c912f521a2d674140dd78ea3f2ba69736ac6d6be5f4d8b8ee3a6b1f50"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "328c764b2bf467d0bc21ae86abf415a7722bd0a88cba486eb2167c22fa8f0b84",
    "currentSha256": "cd259b6bc79d789f9556554b521c6577cc87f23aea164243ea954f3242a4b00f"
  },
  "src/app.js": {
    "previousSha256": "482835e65677c536085a1344cf61c3ffa5e09e2af1b8029b949e000a533038ae",
    "currentSha256": "b03f08cd1e5d71133e99a486a22fef2ce1a5162a0fb07d038c5bf4e446ec0d54"
  },
  "src/archive-relay-presentation-v160.js": {
    "previousSha256": "e628ccee6aa0a2ee40eea1fdd3b66b11800c3185c39bbd91c18d662c05749a30",
    "currentSha256": "c64c9e1a7167fe87ddf79b4f599ef4e99756bfa856ed4303e95ed24f257b5403"
  },
  "src/archive-relay-runtime-v122.js": {
    "previousSha256": "e77a3eeccb624e501e61d5c883e357a9e5ddfc0ce97a881e1a7ce488319666b2",
    "currentSha256": "0234fe37a68b2895755de98d48b1f36a1d677c421df92a09959a357914ea3c12"
  },
  "src/audio-assets-v77.js": {
    "previousSha256": "bbbc868dbf7e0715be6d717d1c5ff142246a95a52ba3ff2e97f4ad11c9f34ce2",
    "currentSha256": "fec1cd050aa97c1a0350954ece0945145ab84b77240b19f15fcca6eb8805c109"
  },
  "src/audio.js": {
    "previousSha256": "7dab1c16460a748543686d3a1fc4306e36fe0e2b28ce505663ff5d2a1a6584bc",
    "currentSha256": "eef946dd32472fb99c943018e546dcac799140f599a6b68003a5c719d88128bd"
  },
  "src/bioforge-runtime-v80.js": {
    "previousSha256": "a476e63ddd9e51429d6b29cd16da1799dce4bd8cd56e166009e0c7ef6de93df2",
    "currentSha256": "1a12c4fc94e85767e6744be8e01861b9e1a325fd05c793f50bedc8ac9ae7448d"
  },
  "src/crew-ui-v85.js": {
    "previousSha256": "f50ab347b6b209dedf954a0e5dcde236b16cf62360df502a1bea38a67edf453a",
    "currentSha256": "ca538c46b5134d1b9f2ff7d8f6d1e0392a5c729f73456051de3ad682aff01835"
  },
  "src/forge-mission-runtime-v141.js": {
    "previousSha256": "1335114f76ffd164a88bf6e2a8e7ef86d86d37ad36be726a8055cfc10a642cb0",
    "currentSha256": "84381eab709f8b75bd7b41a9c5fe40c5d3d05405051fefe18372a8ad9ff0b2ac"
  },
  "src/game-final-runtime.js": {
    "previousSha256": "fb94b1028dc182ccc97313064f2f47ad958733db47268ae7b308dc0085d4aba6",
    "currentSha256": "b2f0817d43bee94f4d40430e696277ac9272d7f97ad891ac77baf4cb083915fa"
  },
  "src/game-production-resume.js": {
    "previousSha256": "dbb0f31045e4da9a0acfa15e3ff334b3bf96da489a1c54db43e0d944664d2929",
    "currentSha256": "6b3fce1fd6c22f1472ea0952ee5aef6cf4905154c2c3715c5169bc0662066022"
  },
  "src/game-production-runtime.js": {
    "previousSha256": "f0c9ff64ce004cc0dd8d028e3a62a717364fa0c1425eafb16b2ae8f808715419",
    "currentSha256": "451c772f0cc9252eb05f2802cee12cbbcb4b3f327e69d9e00924a4f66bec0362"
  },
  "src/game-runtime.js": {
    "previousSha256": "9005aae32379ade306e187ea6c3d156f1a3083178bc0c0808d9963cdd6b8f379",
    "currentSha256": "a2dd71ff5cfc8b450172618f82a0f98710a4736e9cc64818a06b949ff7aba6d0"
  },
  "src/game-v51-runtime.js": {
    "previousSha256": "50551b2f20e6fabd825ab6c6865244f2a47e77aecd337fc0d79386fdd5d4f017",
    "currentSha256": "ddeaad7a61d699faa355f8605d442aff1edf6ea93e46b45501665b7a7ac2f876"
  },
  "src/game-v52-level-runtime.js": {
    "previousSha256": "f394cdc77d4684846cbfb5552ec950f4ba9948d75a09091177627ae7763112c4",
    "currentSha256": "177033fa9a35913bb7e866160126ff540dbda3b6d2970cdd9655ff62799f592d"
  },
  "src/game.js": {
    "previousSha256": "092e72bcffdbe66b1801c180c79b2f854d1ebbdc85d53ded138a88881c7404bd",
    "currentSha256": "554cc78f82a3b9a82d4b2c5102342cc7eb69aa74de94ebdbf0667f46da536e1f"
  },
  "src/hub-bulkhead-depth-v134.js": {
    "previousSha256": "b330fdbf92aa34f8cfb49b58a9229bdedbf4a17ec11663d9ae6e2146a1eec41b",
    "currentSha256": "7ad9e27e4623dde938aeea29272adc5a58362cdd3b5d996863430619ae8d7ff3"
  },
  "src/hub-depth-presentation-v116.js": {
    "previousSha256": "a8b53d01cc99acea92544bc50ef34360b03a47e80015158a60761ae9513b1314",
    "currentSha256": "d618f3d2d059a369caae3730fc47fa027f2cff9d3d1f2eb699fd82753fc6d68f"
  },
  "src/hub-destination-signage-v138.js": {
    "previousSha256": "42d26e99ad1a71134b051a2edf49f3b804f7d3d63ea6d5b7de2cfb5cae4fe8c7",
    "currentSha256": "4c9c018e696c6ffcaaf2f494e1455ffb0f0e55320f2f9e341b6c625fbbdc40e5"
  },
  "src/hub-port-meridien-v90.js": {
    "previousSha256": "9f3f75b8e8a9fbe77deb5afa428a5ba158db05b98ebe2e7af08b844af248eb93",
    "currentSha256": "2922a6de9cd9389c17f83a7b97be5d660bd4b2fd0616eecb1156b6c68c827021"
  },
  "src/hub-room-projection-v139.js": {
    "previousSha256": "2306aca239279dfc799902e4be4e973ca75a3e68170d455ab74df14e395b95ac",
    "currentSha256": "db89bf0d3434028f9e715a2c29670326d2d91d85041e330bf8cc8b5fc4ee847f"
  },
  "src/hub-support-planes-v139.js": {
    "previousSha256": "6663a4953375fd09385a77a84106b45346dc0c4d920ab96897e3100e20d4a605",
    "currentSha256": "1362a53d2f2d80c01a3835f651e7654982f5a4f941d958691fda4a8f1c58300a"
  },
  "src/hub-v51-runtime.js": {
    "previousSha256": "1cc35c82a83910dc154305f952118194162cde11382388734529bb5a73a54a4e",
    "currentSha256": "4ef079604de7e2d5a18057ddcd401219c786242484a59b5f77dd902f695d2588"
  },
  "src/hub-v52-runtime.js": {
    "previousSha256": "7b67eb2cb7c5281e3ae0acd69adfb252db555a00f879194a553012b8d53efb4c",
    "currentSha256": "013d80f0fac643ec67ea00947b936c49be856ead9fd453a4a0e8376c1d803c93"
  },
  "src/hub-v71-runtime.js": {
    "previousSha256": "0013ef68e3db38888a83e97b88ab5615b8a3b4ebe9f229c7d659a5381433956a",
    "currentSha256": "bddf73a89222aa36e8863deac625d3cf5a3d6b058778afbd838291a52cceca24"
  },
  "src/hub-v81-runtime.js": {
    "previousSha256": "26a75cc4fe0e7280146b370c9183cd89a52dabddd865f408289439fe824e4067",
    "currentSha256": "875c011f60f0bf69b5142007ac65f104a483ed76e93a15b55ddba207b315068b"
  },
  "src/i18n-en-catalog-v185.js": {
    "previousSha256": "ac3632c302294c3e2869d673ad6d8cd861e1b0f62641d2d16335387746a6218a",
    "currentSha256": "6b8825331dfddda3ce96c2e5f09abd5b7d9280cff8904bd9e93625cdf1adc2a6"
  },
  "src/narrative-collectables-runtime-v68.js": {
    "previousSha256": "a95591168a10032265fccb51333f5a2886f4f647f878005c8a84676b95eed809",
    "currentSha256": "6b3d6129a603011456e4e309098a59e396b4853f72f14623979072c03fad0a3c"
  },
  "src/narrative-evidence-v132.js": {
    "previousSha256": "cbc87304d7fa4169a1432564a9d83681a0e1d020e656a191bd44756da32a9b32",
    "currentSha256": "61ec802599eaa817d762a0a91b437b0414c7979ea4628a6142956c22ba2146c3"
  },
  "src/npc-cal-logistics-route-v165.js": {
    "previousSha256": "e8206918faeede321fac0b43275da1a62a80e9591c7ff97b86ec8cf9ed7f5acc",
    "currentSha256": "6f287422336468f2bd47f30043801efbac95d641b4c6e53c12abc9cac3438202"
  },
  "src/npc-dialogue-v62.js": {
    "previousSha256": "806cfb582c5506cf62d09fc1addbf9a2461839c8d38e0e8a24221ef8ec73ac21",
    "currentSha256": "8a6ae1df0901c682f37cf59fe494a865fe1a6316efef8b1e726985440d742afc"
  },
  "src/player-control-v124.js": {
    "previousSha256": "d024e6da1ad1f5f766c441e5be2e786553909bd9d921516d196b090bae4f446e",
    "currentSha256": "739c4b18f6253299ec1ed6d95db90b6edbea64117e7eb615cf2e1ca17d1083a7"
  },
  "src/player-creator-ui-v84.js": {
    "previousSha256": "0b5174e5ff3948b5ec987bc2fdee1aca277d64d4eb668ef369461df272bb566f",
    "currentSha256": "9236238396c302f012900efb31dff8fad515a36ecbe6c93e7d1a1aa473dd0482"
  },
  "src/port-meridien-v90.js": {
    "previousSha256": "85b74e81e8ba87b66cedaf7fd36a12ebf8d7c1bd40c4a25ab7e5f9d91fc86778",
    "currentSha256": "ec1482a6c8273d5a488d7504a263479adddd906dc7b9e71f685e8c01415ace42"
  },
  "src/refuge-v87.css": {
    "previousSha256": "fce1e18a977737d258969dac8bed077c9a65b58857e3e916248bd5c835e01751",
    "currentSha256": "af34f1b5237ad0103e2abf9707030eb65293ae2deb08853f6bc20ad258ee6f7d"
  },
  "src/save.js": {
    "previousSha256": "afd5b289887c3a6be5d704ad9b501d9cd7bfeae4514fdfb4eaf21095e6d42304",
    "currentSha256": "248d95f22207c3ae87336556dfc6b5d47f9ae663c911a012e88badaf35e37e5a"
  },
  "src/ship-port-v87.css": {
    "previousSha256": "280b758be54bcb9433fb8353dc73b6bb047b79ce9f1210c47e5bde05ec9f29b9",
    "currentSha256": "45bf14ef6d7ef549d4b88b732d199f85c05f2524dc34ae67e7617c88361971fa"
  },
  "src/vertical-world-v130.js": {
    "previousSha256": "9ba42f3fe1658abd5487eb6702744211faccbeec2ad6f1a8a65029cacb5ce641",
    "currentSha256": "613fda47d3edf9cc42770671542f6755511dcc77efac7e8bdcdd0efa2e317222"
  },
  "src/weapon-actions-v131.js": {
    "previousSha256": "4ff367efb3c919ba51fcb5595f119d54f462a3453dbd95ca1d6c40110f44172a",
    "currentSha256": "a6d08a042c3f7e220623db3bdbccca91b74ca87deb00def008eebd2f3e1757a2"
  },
  "src/weapon-magazine-recovery-runtime-v168.js": {
    "previousSha256": "73eb796bf6d9159239e8a8c499bc8b73db9975a69016df5b7d9ef2d2d4eccf13",
    "currentSha256": "8fb77f86e0f5a3f02ec756ad659fe86347927bb8c2de1d54798e04f71453dcdd"
  },
  "styles.css": {
    "previousSha256": "5d7f49517ea4377aaf2847e7ef5f5dd5f6e4b015301e1280072d41fd9edab36c",
    "currentSha256": "ef8a6c5e7a02a144b34769dadfd746a176fb9219e17896ce79ce84e1fc7d8e41"
  },
  "sw.js": {
    "previousSha256": "ff86bba365c3875c8ebaeb0abe13b2a6185ccd5f1a030b4ee5b15ac0e4a12f9b",
    "currentSha256": "405d789888437084d9ea7a1124b22f4212e03a9df919193261fd56e0d4d38610"
  },
  "title-screen-v61.css": {
    "previousSha256": "3a748b04d5e6c9a7e04c189b2c1910c3163a0840968be6bcbb6352e10e16369f",
    "currentSha256": "88fe408917883476acd0e645178319e231a53dbc4192d5d50d0af79a772be4fd"
  },
  "xeno-trials-fullscreen-v119.css": {
    "previousSha256": "861ce30fd8721d0406fdef9e6881ac3220f3a58ab4d46b7e1878463063b26682",
    "currentSha256": "972fb0679d394bfb5426a84cc748657a72ca0d567cad037899fd010819800712"
  },
  "xeno-trials-v96.css": {
    "previousSha256": "7b34c819ecd9f6843d59f7534e902603ad80fa1b02d55ecdfc1ee5ac82a4b5ea",
    "currentSha256": "8f682f017674d4078583fec043d4e85721700884606a7d16889d8d4512d7998a"
  }
});
// END V188 SOURCE RECEIPTS

export const TANTALUS_PRIORITIES_SOURCE_ONLY_PATHS_V188 = Object.freeze([
  'scripts/audit-tantalus-priorities-v188.mjs',
  'scripts/verify-tantalus-priorities-v188.mjs',
  '.ai-tools/adopted-v188.json',
  'docs/development/PRIORITIES_P0_P1_V188.md'
]);

export function reviewedTantalusPrioritiesDigestV188(path, endpoint) {
  const receipt = TANTALUS_PRIORITIES_SUCCESSORS_V188[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken V187-to-V188 source chain: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid V188 source digest: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A V188 successor must identify changed bytes: ' + path);
  return receipt.currentSha256;
}

export function verifyTantalusPrioritiesV188(readSource = readRepository) {
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_SUCCESSORS_V188)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(sha(readSource(path)), reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256),
      'Unreviewed V188 source bytes: ' + path);
  }
  return Object.freeze({ successors: Object.keys(TANTALUS_PRIORITIES_SUCCESSORS_V188).length });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  console.log(JSON.stringify(verifyTantalusPrioritiesV188()));
}
