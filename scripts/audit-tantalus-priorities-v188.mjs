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
    "currentSha256": "6ab2b5141eefb3defbba0b9c4e9b2f37ef0ca86b9e79fb7360c725392bae30b8"
  },
  "command-v110.css": {
    "previousSha256": "4c22914bedd2d9de880126cd29dd5e458d37e85d56603fae15600b4621b94c42",
    "currentSha256": "fcd7c6d52cc691fbd22841a2488808f4024ac8a2b55a6bbad36977217b24aa21"
  },
  "crew-v85.css": {
    "previousSha256": "1faf6a4bbe6b03ff639d22722837a401a043981dbbb3c64893b116f8c659bc59",
    "currentSha256": "1e7fc4a93232a8779c80aa008f88defe864b93c7253b84cb4db8694549f0d2bc"
  },
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
    "previousSha256": "95287e9c3f9be2b88db9e391a9a143c4c69be8956b6763e4113645974b9e878d",
    "currentSha256": "c2da8bf71518dc324f36b36f00b41bab24f91018f34f7049b98fd20eb03a8700"
  },
  "hub-level.css": {
    "previousSha256": "13e29b3719e1246d595dadca4c786cbeb5a471dece902104b0ccd29a1de9908d",
    "currentSha256": "12c8e9e7f561a2eaec89fe9dfac46a190b1cd801a303cd85e95820b66821c818"
  },
  "index.html": {
    "previousSha256": "337a0b230d0b075bf70e5122240f1ce8e0d2deaebbbd563a15496ea92b5f4d66",
    "currentSha256": "3ef0afc6493e26c7c483549ad2df64b59c96fcb5beaa8b1f2c35a99400fd35de"
  },
  "package.json": {
    "previousSha256": "ff133a405bfc1ef2afa7085fcb2a6cde27a9f52c4af0de5172a058b47082eb48",
    "currentSha256": "a028843de6844f649bfd8f64597a03c724e9a40639e18b1615fc8bd81612d9e6"
  },
  "player-appearance-v126.css": {
    "previousSha256": "da7045c7fd7d41da99eecf48d316150b2d16fac276fe635bb881034bd68c9320",
    "currentSha256": "d77e484c08e74e9094bb54489f06d1ca0c82a98b63b64d8c0367e15ceee0e9b8"
  },
  "player-onboarding-v84.css": {
    "previousSha256": "ae49e974d70f1a46dbd28da6d5515fac0124c992591cf0c1c50ad3e7e3d1cfbf",
    "currentSha256": "6777002acd6f07dc583388b59aecf11a03e7e254aca7dab3c93c3b21d49522a4"
  },
  "runtime-level.css": {
    "previousSha256": "28f938a757c83c1ca286d8520afd164fe1b6f8bc1524bfd9d3fb8e7e0f36f4f8",
    "currentSha256": "1f6bcc91957eadc2dedef5cab122a31a4be60bcef26ffcdc83130e625bd30fff"
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "previousSha256": "6be75d792e8ae0ba4d1ad6cbdaa4285e78bd958fda2eeaa23e510a5b2b49190d",
    "currentSha256": "4f2d15004b203a1171fe5cc0b1e67394a79b5a343f3a1360da5ef3604ca8dbd1"
  },
  "scripts/qa-hub-navigation-v133.mjs": {
    "previousSha256": "a6273b6ea62709fee62a2b5ab8996da2c1b967cad98c83f4cb497de07b8c7e40",
    "currentSha256": "962bcda0288d96fb3006a4c16dfb56562606ba170e69f184a310ac0d2dc10c53"
  },
  "scripts/verify-audit-v143.mjs": {
    "previousSha256": "825a8672e074c335568669ce8e5c496ed2fb70af9e11f3d834169da1a8d5a1c2",
    "currentSha256": "5fb943bf7878a2d6e8f39cc70fefb9ef64d8f2d95e9a916a111cee946d29cf25"
  },
  "scripts/verify-campaign-lethe-v163.mjs": {
    "previousSha256": "cb3ac8826d4f15bbab86e0c42dcd225aeee341c9b10950046fb14af104473049",
    "currentSha256": "fb8cbbd3dd9d6fb4f356a3e167f9537cf0f04619e6cb94feaebb5de5cca7cdde"
  },
  "scripts/verify-campaign-story-v160.mjs": {
    "previousSha256": "a8f09d16a1e137b36b95c1473910d228289c2515b26bd3704584a2f13cfabcf8",
    "currentSha256": "55b6b5ac7e045df047ccb6d867905e7cfec44a0f29e9dbda9a74778df9d39cad"
  },
  "scripts/verify-ecosystem-missions-v131.mjs": {
    "previousSha256": "c716b405a36ef91816d72e8f97a1fd431717e31ac5c98c37e6e02d20e5a26fb4",
    "currentSha256": "51fcb1f19305187be4a944a03e359c1c2e4c318dbc8a7f5d3f6c62aacaa3341b"
  },
  "scripts/verify-enemy-tactics-v130.mjs": {
    "previousSha256": "8fa1f8de291e353563d45d741d3563d71fdb1434101e8cc776123f5c2229c17a",
    "currentSha256": "e5bb1021d7e5b5dd62c98823d7eba1cb5e4b0de6a1101f9e28d3d8c6c2474cff"
  },
  "scripts/verify-hub-lift-transit-v163.mjs": {
    "previousSha256": "91c11a74e3ebdd63beb3147a959bee1e5f2b679de87ea811b3516d515f7a0f0a",
    "currentSha256": "75c66348aced19ffd5c9c95a5c2dd2224f27c9cbfcd238dd9737d8f774fc8553"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "previousSha256": "8f3342580f3969a7ddef8680af2bf4ab1df6cf64c61a67419ae8add7458e21e9",
    "currentSha256": "a3efc37fd10216930c26e9afb54c52d6a6b71050c233db87b5b1c224748c166a"
  },
  "scripts/verify-i18n-v185.mjs": {
    "previousSha256": "436bdd6dc79cb9e177f08d736661194dd42883b2f3240d2f75696319661c8d74",
    "currentSha256": "213b46c0fb271c8ced722882295c76b2130c1a847bb4d006ff8f0cc19f447ae6"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "previousSha256": "763a500bddbdbac72145b64fe88419280a9d6377b80cfb7f2333140f95bc7b14",
    "currentSha256": "0b67859c912f521a2d674140dd78ea3f2ba69736ac6d6be5f4d8b8ee3a6b1f50"
  },
  "scripts/verify-placeables-extension-v132.mjs": {
    "previousSha256": "961f003da975a98262df42df0c0801e27b0cd24ac37062b97676049afb12fc2a",
    "currentSha256": "ea484d509c56907a786a39bdd59dfc56144c77fe3f91c0c95b722e698387c6ac"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "328c764b2bf467d0bc21ae86abf415a7722bd0a88cba486eb2167c22fa8f0b84",
    "currentSha256": "841bbb00e39cbf67487573cc6aa4f40cf1c0f85651d027ce5975f3e44f8ce963"
  },
  "src/alien-survival-runtime-v70.js": {
    "previousSha256": "65d5c0c4ca446021b6ff58ed6be61fc622c0908ede9d9d74b730fa0efef2fd93",
    "currentSha256": "ce5457b475195eaa02020384d3d6355cdf34901e178eb9bc96ab4e2a8617e46b"
  },
  "src/alien-survival-ui-v70.js": {
    "previousSha256": "5a06adb0a5bf769e5d6bdf5c6438b0f7829df73d9b3e87655c9f574c876ea5ec",
    "currentSha256": "22f5bd37d5c8309f900b78d1f3b0f046eeecd3026d0917089ec16bd7328c6196"
  },
  "src/alpha-bravo-coop-runtime-v69.js": {
    "previousSha256": "85a9ca41d593a723bf0cc55c13bc1f40e5afae05e5b3085bf51423813b08aed1",
    "currentSha256": "2da4a5c7fafec2675ed92df47078ef47f30b776e83adf290210eb8483fe2dda9"
  },
  "src/apc-convoy-runtime-v121.js": {
    "previousSha256": "b1fa0c689763ca94ddb37b99020acedcd176d057b5d26f16ef24f9171c39a4a9",
    "currentSha256": "159df2391dddc71d7df5c0cfd789b497bd232ecdbac72eb1daf5800d6f5feb8a"
  },
  "src/app.js": {
    "previousSha256": "482835e65677c536085a1344cf61c3ffa5e09e2af1b8029b949e000a533038ae",
    "currentSha256": "13d9db7b981496456d3f6f335f47ebc3c08e8e037f93c8016bdad4721e85f915"
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
    "currentSha256": "ec544d2e6975093041c94e8587f4191d60cfa2d2ce787a902e697c4bbeba37ca"
  },
  "src/bioforge-runtime-v80.js": {
    "previousSha256": "a476e63ddd9e51429d6b29cd16da1799dce4bd8cd56e166009e0c7ef6de93df2",
    "currentSha256": "1a12c4fc94e85767e6744be8e01861b9e1a325fd05c793f50bedc8ac9ae7448d"
  },
  "src/black-cocoon-runtime-v121.js": {
    "previousSha256": "d2c40f3a1c5e03468d5a26bf30075f18f94914a0d8b0f7b6caec9fcc01abff05",
    "currentSha256": "42504a0d78f2fdb5e7b91c315d23d065e4f25d5e80fb7199bd060326a6188555"
  },
  "src/c12-horde-runtime-v121.js": {
    "previousSha256": "473351ede70a64f4a42260d7168d57d25461d589c03b5872e0c58108a69d52d2",
    "currentSha256": "08bf29cb6309f7e992a874b3f761edbf39a7b464a9e73edc930eddadb03ef327"
  },
  "src/campaign-consequences.js": {
    "previousSha256": "359a55917b4cb2cfa2be07485d202cbfc57ca993dbeaaec5097801bda4504f0e",
    "currentSha256": "05105a1165afa9ea1c1aad2196cbbc6e2c4a8339063ce35aa3d0fccb09b0a4f8"
  },
  "src/cargo-brutal-runtime-v67.js": {
    "previousSha256": "40332c0214212b5916d7880d8df64d5d84b270a7f4ed2e27ae3f7782d8903e9c",
    "currentSha256": "60f511f19a3359935a4317e359e66037330c77955834226732b14b1059696ab9"
  },
  "src/catalog-scale-v72.js": {
    "previousSha256": "f778ab5a45e01900c99b7912c8ddcab65597b76590e2168e8a0c7d36b84e8f1f",
    "currentSha256": "ed80e44ad26691b6009884ba370e96877192a8fc2b701d946681692dbda37e62"
  },
  "src/catalog-ui-v62.js": {
    "previousSha256": "97c6e8e1769a87881e125ea4766f0a102621c013f736d5219db7cb477a66b1c4",
    "currentSha256": "4308f0cb74a3a90ac55a78877386080a11cf84b6b0dc50e744bfdf5eaf01f06d"
  },
  "src/cloud-ui-v119.js": {
    "previousSha256": "66f76387285d3d7f65a5c10ffde93e23a92a2a4f962d4ee6b603af35b7b66b49",
    "currentSha256": "b828647d72de3dd0c1c1b070bee76d6f472dbed9d6b967e50ee5bc40546a995d"
  },
  "src/content-core-v50.js": {
    "previousSha256": "6d073593ea5854b17ae626556ba6bf6259f835bd4eb59ba3e0d1a5c785418fdb",
    "currentSha256": "720ddfcc4bcf9522877c555ae7a9958c18feca506567e00294b1703f72236589"
  },
  "src/content.js": {
    "previousSha256": "916a3ee2c7c05a6a81e9de9eacb68e41ab9dd0aeac9be53e260c1024a369a701",
    "currentSha256": "fa090839aedabdc5fbbc56b7205258e47b38fa313198293a56e81f6566d43494"
  },
  "src/crew-ui-v85.js": {
    "previousSha256": "f50ab347b6b209dedf954a0e5dcde236b16cf62360df502a1bea38a67edf453a",
    "currentSha256": "ca538c46b5134d1b9f2ff7d8f6d1e0392a5c729f73456051de3ad682aff01835"
  },
  "src/ecosystem-missions-v131.js": {
    "previousSha256": "63bb1d49b9ee5b34114ea3353897fe9a1fd6314a6841ab04ef221552d3a3c889",
    "currentSha256": "646012d4cd8465db13739b0df8a00407acf04cad8ffe5ee6f5035818b0c33ddc"
  },
  "src/ecosystem-systems-v131.js": {
    "previousSha256": "8ee1253920709a8d00ded0306b8937de490941a46abc718b9f0e2f89c34bb7a3",
    "currentSha256": "4e240a73054c5fefe872200f8b34a7055feff373d8f6c43b27e81d0c5ed621a3"
  },
  "src/enemy-dedicated-poses-v99.js": {
    "previousSha256": "2c8e366bb38b8a0e54e5376572f4fc6543ef9fd01e5ba9e0a6137a76a66e8ec5",
    "currentSha256": "200a21a8d6939cabdca388ad23449a88e97f14589470fc3e52e1e114939d33ec"
  },
  "src/enemy-user-campaign-runtime-v88.js": {
    "previousSha256": "3bb9a8086aba8e66f655d112a189580d541e5f287c03d9f1077c3d78d241384f",
    "currentSha256": "5732766c2b0e23ba2edd535f8c2bce9b4856cb4f8e7817da9cb686840aaf4436"
  },
  "src/field-media-ui-v135.js": {
    "previousSha256": "30c23b3543823af45377ecc75536a91a4bc770ee84ce075aad99e9edeff35435",
    "currentSha256": "ceb7f23f62c042e0dc6e9bddb1c32bd05469a0d24d934bf05ccb4f680611c346"
  },
  "src/game-complete-core.js": {
    "previousSha256": "219406a37f2c7750aaebe0b06646f7a659e8618b0fa562d83e07218798945b2c",
    "currentSha256": "287b638b3caf82cc8aceaacbe2e21837b5fb47f8535b08ebf486a61bf1f3d77a"
  },
  "src/game-final-runtime.js": {
    "previousSha256": "fb94b1028dc182ccc97313064f2f47ad958733db47268ae7b308dc0085d4aba6",
    "currentSha256": "b2f0817d43bee94f4d40430e696277ac9272d7f97ad891ac77baf4cb083915fa"
  },
  "src/game-production-base.js": {
    "previousSha256": "95b136fcc0caade82a784522dcedc635d6acb2ad91ba6517c6d07fb36ca89793",
    "currentSha256": "3166ac26df25719f6c35250a8e7f8964b5109c689edf9a28fd26ae30b15cc460"
  },
  "src/game-production-resume.js": {
    "previousSha256": "dbb0f31045e4da9a0acfa15e3ff334b3bf96da489a1c54db43e0d944664d2929",
    "currentSha256": "c73d044c8d19f3558a579148f3cf7c47e57075a58cbf53ee66695fb59995cf7b"
  },
  "src/game-production-runtime.js": {
    "previousSha256": "f0c9ff64ce004cc0dd8d028e3a62a717364fa0c1425eafb16b2ae8f808715419",
    "currentSha256": "5cfd2d4a4e5ca6d01529332d67f9afa0564cfa05dbcfabd06657f90559a7e141"
  },
  "src/game-runtime.js": {
    "previousSha256": "9005aae32379ade306e187ea6c3d156f1a3083178bc0c0808d9963cdd6b8f379",
    "currentSha256": "a2dd71ff5cfc8b450172618f82a0f98710a4736e9cc64818a06b949ff7aba6d0"
  },
  "src/game-v51-runtime.js": {
    "previousSha256": "50551b2f20e6fabd825ab6c6865244f2a47e77aecd337fc0d79386fdd5d4f017",
    "currentSha256": "8adb6bf47a43266b87227bf9539130b8dff2b8aaf09a3af59ae19cf69f188c19"
  },
  "src/game-v52-level-runtime.js": {
    "previousSha256": "f394cdc77d4684846cbfb5552ec950f4ba9948d75a09091177627ae7763112c4",
    "currentSha256": "ec3e2ecf4bdf90d9cdeaf6c432343123785376a2aedcc9be08517592fff10cf7"
  },
  "src/game-v52-runtime.js": {
    "previousSha256": "ac0049ef9ba4a732b126d2de85984e78e74a9fbef2ca36b428d0fbcf23fa821f",
    "currentSha256": "e609f9ebe6f63a526ad3706d359bb7478578470414e75b7c5aae5b35341f9558"
  },
  "src/game.js": {
    "previousSha256": "092e72bcffdbe66b1801c180c79b2f854d1ebbdc85d53ded138a88881c7404bd",
    "currentSha256": "554cc78f82a3b9a82d4b2c5102342cc7eb69aa74de94ebdbf0667f46da536e1f"
  },
  "src/hive-missions-v131.js": {
    "previousSha256": "b4538a7e3cd6fa58275a29e8585c52b3788000bbbb61bc39419e5dd6f5756b20",
    "currentSha256": "6358b7625e5958781916d592e1f1d0228eb43de53e570c48289fbb1a39d82557"
  },
  "src/hub-bulkhead-depth-v134.js": {
    "previousSha256": "b330fdbf92aa34f8cfb49b58a9229bdedbf4a17ec11663d9ae6e2146a1eec41b",
    "currentSha256": "7ad9e27e4623dde938aeea29272adc5a58362cdd3b5d996863430619ae8d7ff3"
  },
  "src/hub-circulation-v137.js": {
    "previousSha256": "e4aecbda986750a67926449a7fd392f2845ca913383690759ad7a5e5f25ebdb9",
    "currentSha256": "39997d5bcd4a93d9a2d23cabcf252fb6e448ca4f967f731e6073b35e0def07a1"
  },
  "src/hub-depth-presentation-v116.js": {
    "previousSha256": "a8b53d01cc99acea92544bc50ef34360b03a47e80015158a60761ae9513b1314",
    "currentSha256": "d618f3d2d059a369caae3730fc47fa027f2cff9d3d1f2eb699fd82753fc6d68f"
  },
  "src/hub-destination-signage-v138.js": {
    "previousSha256": "42d26e99ad1a71134b051a2edf49f3b804f7d3d63ea6d5b7de2cfb5cae4fe8c7",
    "currentSha256": "4c9c018e696c6ffcaaf2f494e1455ffb0f0e55320f2f9e341b6c625fbbdc40e5"
  },
  "src/hub-lift-transit-v163.js": {
    "previousSha256": "05c6efb9553eb7908a633b1c811651efe6c292c4a036c2f8628fa051c1bae824",
    "currentSha256": "95b5247498c581847207c7b477af94d7a289a5e1d19650d4490416807794acba"
  },
  "src/hub-port-meridien-v90.js": {
    "previousSha256": "9f3f75b8e8a9fbe77deb5afa428a5ba158db05b98ebe2e7af08b844af248eb93",
    "currentSha256": "a81ed4df17c3b91edaf52c66bf24bd3981190c2b73db22366c3e4076de76cabb"
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
    "currentSha256": "7ad8064b42b405f8194781e3926909aac77916a9eeda422ac2e5cb07e8332444"
  },
  "src/i18n-en-catalog-v185.js": {
    "previousSha256": "ac3632c302294c3e2869d673ad6d8cd861e1b0f62641d2d16335387746a6218a",
    "currentSha256": "28d42706b8ee4a3713532837328f33bdb2b6fc7b0517cd2dc911ac9a9a601c38"
  },
  "src/i18n-v185.js": {
    "previousSha256": "592b025ceca9008e73bff267be72a2a3b614767fc220f82cbf2a3ef792060e7e",
    "currentSha256": "5ca3bcd1416f0a342af209493b0d7e41613ac4a5efa8972ee6a451eda1502737"
  },
  "src/legacy-operations-v131.js": {
    "previousSha256": "ab9d4021dde9dcf8609f1a23e43643b0d4f94857836f9df8145641537ce0328d",
    "currentSha256": "7c7de1da1e5c1bd43c89a5dc1ecdc86ca777fb872283f0cf2d4cd9857ae49cc5"
  },
  "src/mecha-missions-v131.js": {
    "previousSha256": "0f420f4ba4c7a4af3ea55d0c735d613a531020e342a60b1bef355006ac064d35",
    "currentSha256": "872932986e98c5e25744a204e7a7297fcc98001fc6e5a7409beba4c106627ab2"
  },
  "src/mecha-systems-v131.js": {
    "previousSha256": "9b80b30a3f065eae669f809d9d19266e90078d79fcbc1450e07d4e636bc350a9",
    "currentSha256": "8b4392cc457b3365aa075be83ff5adcef63edc6de45f84fb4fe0f571b3487087"
  },
  "src/mission-insertion-ui-v62.js": {
    "previousSha256": "1e8b4c42e6b5115ff75e86c50dbace7d649c8a4b244629c7788b963a6c690dc5",
    "currentSha256": "b55874f7a3b8d7eeb933cdaedce431517920d60dd18b46895088dc4e211d5591"
  },
  "src/narrative-archives-ui-v68.js": {
    "previousSha256": "e4c8b6707eb40df6995f90629129275eda6d24557b7f44fd81a113d4bed80c2a",
    "currentSha256": "49b3dfd7770d956a639fab3bd80f2ae17f1cc45257ff9e18d5bf2859db43eec7"
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
    "currentSha256": "e946b9050d5346c3467e6af00821095a8e7929cc88025b1adad0fc8142ed640d"
  },
  "src/npc-dialogue-portraits-v168.js": {
    "previousSha256": "04a7f8db4f4bb7bd10b2da6d90b8a0e20f647c3c9d0b6123fee77fd65d1b56c7",
    "currentSha256": "5d7cf32c8b49f454d703e708dd29c344c530aaa4a8f58382c4e6de2313a08f98"
  },
  "src/npc-dialogue-v62.js": {
    "previousSha256": "806cfb582c5506cf62d09fc1addbf9a2461839c8d38e0e8a24221ef8ec73ac21",
    "currentSha256": "8a6ae1df0901c682f37cf59fe494a865fe1a6316efef8b1e726985440d742afc"
  },
  "src/npc-life-v136.js": {
    "previousSha256": "ccd320fd541abf156e59cac8e2af45322b908204e5141849252de487102c66d9",
    "currentSha256": "4ce51e73f59eddbc006fdde1b6bc754dd4d0b85e7f6cc8164a0b24c3ee56ea4e"
  },
  "src/npc-service-routes-v161.js": {
    "previousSha256": "a915ff8b546cc1066881e0ebf1b0e7a86b9fdf1af2748af5aa39e8ee396b9d4c",
    "currentSha256": "e977559b8fc6bfbedfffa2184f7a89057319fbcc595bc3f9a05bb0054f33cd8f"
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
    "currentSha256": "897e2d837cc512a24cb9093374a915cd1b0e6ab1d9f06336a9c5d7e7bd229c41"
  },
  "src/refuge-v87.css": {
    "previousSha256": "fce1e18a977737d258969dac8bed077c9a65b58857e3e916248bd5c835e01751",
    "currentSha256": "af34f1b5237ad0103e2abf9707030eb65293ae2deb08853f6bc20ad258ee6f7d"
  },
  "src/save.js": {
    "previousSha256": "afd5b289887c3a6be5d704ad9b501d9cd7bfeae4514fdfb4eaf21095e6d42304",
    "currentSha256": "6b8a71b39143f289775ad5b8a497fbdbcddacec774bb2387904d030274c1f125"
  },
  "src/ship-port-room-v87.js": {
    "previousSha256": "43b45bcd8e73446e7544651ba4f2e5850e0d1b5158d544438df93dd637db504c",
    "currentSha256": "0842577ad1707e108a5c0bb7ccd2eb93283d5d7c5fce208a54f836560c736498"
  },
  "src/ship-port-v87.css": {
    "previousSha256": "280b758be54bcb9433fb8353dc73b6bb047b79ce9f1210c47e5bde05ec9f29b9",
    "currentSha256": "45bf14ef6d7ef549d4b88b732d199f85c05f2524dc34ae67e7617c88361971fa"
  },
  "src/special-operations-v131.js": {
    "previousSha256": "4595ded20b4c7c44a7942039ca3ed8d12bba9f20a44a622ff840caca7a0e4bb5",
    "currentSha256": "0e9805fce4ecddc8dc00f694b7646885e8a8292f8460928639c4eb9ffae48f83"
  },
  "src/special-operations-v67.js": {
    "previousSha256": "3a6760b8d8629764ce078263a0538a95bcfa90fe23a63ec3df9b62e358afd0f2",
    "currentSha256": "28a8ff555e69859ec9e3445c05aa2544ff262132d910a0856ed1792c8ca4b11f"
  },
  "src/vertical-world-v130.js": {
    "previousSha256": "9ba42f3fe1658abd5487eb6702744211faccbeec2ad6f1a8a65029cacb5ce641",
    "currentSha256": "613fda47d3edf9cc42770671542f6755511dcc77efac7e8bdcdd0efa2e317222"
  },
  "src/weapon-actions-v131.js": {
    "previousSha256": "4ff367efb3c919ba51fcb5595f119d54f462a3453dbd95ca1d6c40110f44172a",
    "currentSha256": "58a11d9f471f1049e3db691f86581410ef1edbc603016bedf50427201e8f1b2a"
  },
  "src/weapon-magazine-recovery-runtime-v168.js": {
    "previousSha256": "73eb796bf6d9159239e8a8c499bc8b73db9975a69016df5b7d9ef2d2d4eccf13",
    "currentSha256": "8fb77f86e0f5a3f02ec756ad659fe86347927bb8c2de1d54798e04f71453dcdd"
  },
  "styles.css": {
    "previousSha256": "5d7f49517ea4377aaf2847e7ef5f5dd5f6e4b015301e1280072d41fd9edab36c",
    "currentSha256": "21f254351e30dd23c320bee7ecb29781496549fcc9df3c5ce42712ce4e678950"
  },
  "sw.js": {
    "previousSha256": "ff86bba365c3875c8ebaeb0abe13b2a6185ccd5f1a030b4ee5b15ac0e4a12f9b",
    "currentSha256": "0bf38279a39d3de22e08c32fb85a1f91299c8d07da76e45d60c4d54f20853b5b"
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
