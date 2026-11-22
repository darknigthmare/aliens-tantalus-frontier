/** V188 — owner-approved P0/P1 priorities of the campaign bible (§56).
 *
 * Baseline: 803db26dbd7ed453d9534eee237806053438f300 (main after PR #46). The predecessor of
 * each original receipt is the reviewed V187 endpoint at this baseline. The
 * continuation blocks separately anchor later changed sources to their exact
 * published bytes; historical predecessors and earlier endpoints stay intact.
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
    "currentSha256": "64a13e855d68cda96d0541c78202b77bdcf0703eaf1c91a786fd93e21cc3a271"
  },
  "hub-level.css": {
    "previousSha256": "13e29b3719e1246d595dadca4c786cbeb5a471dece902104b0ccd29a1de9908d",
    "currentSha256": "12c8e9e7f561a2eaec89fe9dfac46a190b1cd801a303cd85e95820b66821c818"
  },
  "hub-stations-v61.css": {
    "previousSha256": "eaf2b041ec39337b763d6d919859a7f79276c5eff920049980428b365202dfd5",
    "currentSha256": "863d52f5e9b27f5c2395e4619a855a613eeec68290148b09ccbf965593269e57"
  },
  "index.html": {
    "previousSha256": "337a0b230d0b075bf70e5122240f1ce8e0d2deaebbbd563a15496ea92b5f4d66",
    "currentSha256": "3ef0afc6493e26c7c483549ad2df64b59c96fcb5beaa8b1f2c35a99400fd35de"
  },
  "package.json": {
    "previousSha256": "ff133a405bfc1ef2afa7085fcb2a6cde27a9f52c4af0de5172a058b47082eb48",
    "currentSha256": "d10e191570b28fe0e2a6213c1ee1e0b75b49ad152f0024e81feb45fb4f9f760e"
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
    "currentSha256": "9939371033f1654e51a73366a4d129c63f85d0871a40ca7014afe1f228a4fce0"
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
    "currentSha256": "db03102b96ba14c20a265f83e39f1223657a6b2fc38b31f00983eb5fb80a16d5"
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
    "currentSha256": "afcdfd3f15db9ca405e40bee563a2d1ffff5d90bcaa2c6db377385e22a77b32b"
  },
  "src/app.js": {
    "previousSha256": "482835e65677c536085a1344cf61c3ffa5e09e2af1b8029b949e000a533038ae",
    "currentSha256": "2db6b8019a1e5fd30d96a43f89f09da34d1246c7127e2e89bd2d3cbab6735968"
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
    "currentSha256": "147141d9b25c9ff873ccf53eb6b19199d55879bff1eca983bdfa4e539565915c"
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
    "currentSha256": "20f87df7565d64fc36ebef8a24ef94695cf41fabcc80a1ee9706fa854615f842"
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

// Reviewed V188 continuation. These predecessors are the exact published
// bytes at this commit, not replacements for any historical V187 witness.
export const TANTALUS_PRIORITIES_CONTINUATION_V188 = freeze({
  "baseline": "da8b29fa4b7688d18686b1e28be4065c3a821d3b",
  "successors": {
    "scripts/verify-audit-continuation-v158.mjs": {
      "previousSha256": "87ca45b2c3c48d96e9ae02f4a57241b723372e3e12cd172ef4f978f34ba3eb98",
      "currentSha256": "86d8781274bc77362ad291d6a638c02c74c0521e8bcee5776c913b8fef06400e"
    },
    "scripts/verify-black-cocoon-presentation-v158.mjs": {
      "previousSha256": "96029dc66cb8781bd30bd91482dbfbc7466679020fd22420784e7baaac43bfa5",
      "currentSha256": "635ee8e4463e32676dbd7be409a5f92cb9ed4d40b0ee59097251e90819645b99"
    },
    "scripts/verify-cinematic-coherence-v188.mjs": {
      "previousSha256": "fd1f943ea6b50c339073a936eaed60dafa0618b472988353b93edd31d106d07f",
      "currentSha256": "5f5bd9495aa0d7e7de6de16ee2f20b0064e4a9fc2ddb54f7f3f0c8ad7d6d72de"
    },
    "scripts/verify-dropship-handover-v188.mjs": {
      "previousSha256": "3f644dcaf173647081d3f1dab2c8fd642fc82d6839a7d1b26de129e567a3ca05",
      "currentSha256": "6fe5f58c1dba4b070a67aa2ed9db09163c8e1364f40f7f247f8790fdec387730"
    },
    "scripts/verify-qz17-coherence-v188.mjs": {
      "previousSha256": "c06ba96c8b6e400f71da707ba18beed8c9f47afffb867d432c704bc8f2f92fcd",
      "currentSha256": "9ff1d74e8f5b3f41bb043d4abe3ed7b65f656a254cc6ae639e4f6cfbd6b3b815"
    },
    "scripts/verify-story-cinematics-v188.mjs": {
      "previousSha256": "4047f1f7607812751ea8314f81e0cfa5171fc5cf43abd3f3e6afd62f478aeaa6",
      "currentSha256": "66dd489ef35c8ffcb53eee350e1234f34669cfd1f0abb75949a83a47651a295d"
    },
    "src/black-cocoon-presentation-v158.js": {
      "previousSha256": "69169757f789461886aed3788b79e5ba9adcbd8bfa41b5cab81af85ff0be0767",
      "currentSha256": "b82fd90a95873e4ae9a48ed27f1ed7f15c72dbd38a13bdb47bc17a6ef19fae0b"
    },
    "src/mission-dropship-handover-v188.js": {
      "previousSha256": "ea7aba8f264a931fe71de296b444f2c7810c214f7b825f6f7e56c11865f17b95",
      "currentSha256": "33105db7fba9625779121edbb5ccdb1cce6ba0f1f1dd93069e064750b30243c7"
    },
    "src/qz17-level-dressing-v188.js": {
      "previousSha256": "2a5ad6d33e9ecabd0d26a7510b19d1ab396927516491d8a636ffc2aacd33806b",
      "currentSha256": "3b435206e6ae12ae37d0d78469696e4bd2ffd7e5a9aee817d3bde521e90162af"
    },
    "src/story-cinematics-v188.js": {
      "previousSha256": "1b0783003a58b4dca02193b6c9048750b068ac99c3023534479786f6009c6465",
      "currentSha256": "921e3a8ae80b0000e1ee4eed5af38bc84312d7458109db879a33ebad1b1221cc"
    }
  },
  "addedSources": {
    "src/biological-art-v188.js": "5547ba7e1a2d924eb5ca4c9862c4b73003a6eca2ee0498893649d5d67b7a1afe"
  }
});

// Prologue art and native QA continuation from the published Chromium-tested
// lot. Earlier receipt blocks remain byte-for-byte historical; this block
// records only this lot's changed endpoints and its separately added helper.
export const TANTALUS_PRIORITIES_PROLOGUE_V188 = freeze({
  "baseline": "d54f13cc55983ddb5f55851071c9144198fe1155",
  "successors": {
    "scripts/qa-black-cocoon-browser-v158.mjs": {
      "previousSha256": "ebb81a7deeab1c1a2d8ce47d1f14759889638b9af2f42859ef26119e2f459b0b",
      "currentSha256": "fc5b73f2315d19766cf1a609066f3f4fa89b557caf64e6b4e4bf618e1702cef8"
    },
    "scripts/qa-campaign-story-v160.py": {
      "previousSha256": "0a6cd23cdcc3bf32e8209258e4920e7897264883e10877401f787f010cde5a4e",
      "currentSha256": "0483f3b99b6d0b05cd7a7bbb984e2a662360a3828ad532d0c0fbbd201072e49f"
    },
    "scripts/qa-forge-npcs-v158.py": {
      "previousSha256": "5c0b24aed9faf3e0921cfdb698735329063f5d93e1bb2a6b49c5c74e9afc677b",
      "currentSha256": "0d6bcda73a5ee085eb9a886ca755e56ec1a2195a13e6f0fff9c4014e562193f1"
    },
    "scripts/qa-title-compositions-v163.py": {
      "previousSha256": "9444fe218aa06dfdef566bf996ebc43c6cd91a6b33a203ec2d3471f2af7b0b1a",
      "currentSha256": "2c854d3190619b506b45fe1e22d21014f8f12af56a6966598a327c3fbdc2554a"
    },
    "scripts/qa-trials-continuity-v163.py": {
      "previousSha256": "173f2e35f826970cee84ac967a44715f991efd7665f1dbf46f8c0db384b95e31",
      "currentSha256": "a5a3ae0189e2ad47c5d2f2b12985f9e935e8f8c27bc9fe92001b5886deae4a0b"
    },
    "scripts/verify-audit-v143.mjs": {
      "previousSha256": "9939371033f1654e51a73366a4d129c63f85d0871a40ca7014afe1f228a4fce0",
      "currentSha256": "b2283b440d2be425eaadebc919dde1495656d875e31025ecd475e27428ad5efb"
    },
    "scripts/verify-black-cocoon-presentation-v158.mjs": {
      "previousSha256": "635ee8e4463e32676dbd7be409a5f92cb9ed4d40b0ee59097251e90819645b99",
      "currentSha256": "5b4a2e933b81654f746e8a94c7214523bd7dbb92cdb92dc3adef8dbd3031cedd"
    },
    "scripts/verify-campaign-story-v160.mjs": {
      "previousSha256": "55b6b5ac7e045df047ccb6d867905e7cfec44a0f29e9dbda9a74778df9d39cad",
      "currentSha256": "63fd6e24dc57561e3d88f0d549906a8a1b891ace8767675cb4ca42699bbcbe1b"
    },
    "scripts/verify-cinematic-coherence-v188.mjs": {
      "previousSha256": "5f5bd9495aa0d7e7de6de16ee2f20b0064e4a9fc2ddb54f7f3f0c8ad7d6d72de",
      "currentSha256": "947ff56e984fd27bf9781ecb4ba03bc1116cc4c6b9a30198dd5287785299b67c"
    },
    "scripts/verify-legacy-operations-v131.mjs": {
      "previousSha256": "950fbaa2c7b92d1b062ac7b933862c52c7787ca00671e1922213686100ec3e28",
      "currentSha256": "c8823fea400d848cd1d90c65ff841a5a6f6833b84515ab799eb2bf41627706e5"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "db03102b96ba14c20a265f83e39f1223657a6b2fc38b31f00983eb5fb80a16d5",
      "currentSha256": "0376088c873ed60751b81d646cadd0e965476df5e61b88c0d83a40670d45dce5"
    },
    "scripts/verify-story-cinematics-v188.mjs": {
      "previousSha256": "66dd489ef35c8ffcb53eee350e1234f34669cfd1f0abb75949a83a47651a295d",
      "currentSha256": "1da532f57ba644b790a22e8ed9b64c0cee08cca6dd9ef60c435bf97e2b7d712a"
    },
    "src/story-cinematics-v188.js": {
      "previousSha256": "921e3a8ae80b0000e1ee4eed5af38bc84312d7458109db879a33ebad1b1221cc",
      "currentSha256": "6f1715c07ce920fc375eeb2fb3668b6826ac437cf8b61daf854fdb753556e47f"
    },
    "sw.js": {
      "previousSha256": "20f87df7565d64fc36ebef8a24ef94695cf41fabcc80a1ee9706fa854615f842",
      "currentSha256": "082f8d2e6b94053c5e080256f359c1fbad4b787d6e3b6a052001724b8cd54f66"
    }
  },
  "addedSources": {
    "src/prologue-art-v188.js": "df4ff4fc5a69c8f1834eae84a3687ab374e00591af0531be95b7bc19538986de"
  }
});

// Port-Méridien quay art and native QA drivers continue the published endpoints.
// Historical receipt blocks and separately added helpers remain unchanged.
export const TANTALUS_PRIORITIES_QUAY_V188 = freeze({
  "baseline": "ee565717bdc698594c41f76fe1e1c72c2a730656",
  "successors": {
    "scripts/qa-campaign-story-v160.py": {
      "previousSha256": "0483f3b99b6d0b05cd7a7bbb984e2a662360a3828ad532d0c0fbbd201072e49f",
      "currentSha256": "7d3ded62763a4db3f5fa1a2554c91d46656f87d0f18459896e2b804301ee3e71"
    },
    "scripts/qa-forge-npcs-v158.py": {
      "previousSha256": "0d6bcda73a5ee085eb9a886ca755e56ec1a2195a13e6f0fff9c4014e562193f1",
      "currentSha256": "a0adc5378c5a79df12fab12987e87970804e9e38c0d7895369629db3203bef82"
    },
    "scripts/qa-trials-continuity-v163.py": {
      "previousSha256": "a5a3ae0189e2ad47c5d2f2b12985f9e935e8f8c27bc9fe92001b5886deae4a0b",
      "currentSha256": "be26d35484c30516f1a6a243d4a74e993389c551bb57fddd1121caf0252d3e76"
    },
    "scripts/verify-audit-v143.mjs": {
      "previousSha256": "b2283b440d2be425eaadebc919dde1495656d875e31025ecd475e27428ad5efb",
      "currentSha256": "9dc8947f8b6d3dfb568777307390e561874e213c41edd501b6b4835cb3531a7a"
    },
    "scripts/verify-campaign-story-v160.mjs": {
      "previousSha256": "63fd6e24dc57561e3d88f0d549906a8a1b891ace8767675cb4ca42699bbcbe1b",
      "currentSha256": "147d29402ef405c00b52f8453f991373c7ab869651d6b36046b54ee1c6340863"
    },
    "scripts/verify-forge-npcs-v158.mjs": {
      "previousSha256": "ae3813cbb02f125e450fcf08217c2ffa8512915d98bb983961d1a2810a9ec34d",
      "currentSha256": "f4a31b5e47c01e150aaa0b26a819130f560a717b157a0e307d58e17dbc6f0dab"
    },
    "scripts/verify-legacy-operations-v131.mjs": {
      "previousSha256": "c8823fea400d848cd1d90c65ff841a5a6f6833b84515ab799eb2bf41627706e5",
      "currentSha256": "5f6d68c9ebf657650f7700d40d512fd939c7d1bc32b0968af8e457e6669cc2fe"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "0376088c873ed60751b81d646cadd0e965476df5e61b88c0d83a40670d45dce5",
      "currentSha256": "dac556b3f8fa6ce714732094dda492c4f7c6b25422b32901a72e219ca10fe67f"
    },
    "scripts/verify-quay-coherence-v188.mjs": {
      "previousSha256": "d69f271f5db777ade2b32f4608f58675d405ed84b1015992a850c083bd4da929",
      "currentSha256": "a0c770e096a727bdb68718b6787f4ab02aeb0e4cc670b3eca5f4979a4d28bc97"
    },
    "src/hub-port-meridien-v90.js": {
      "previousSha256": "a81ed4df17c3b91edaf52c66bf24bd3981190c2b73db22366c3e4076de76cabb",
      "currentSha256": "c6b38c0fd78f8576cfc72769b6b3b0a8bda12764dfdffb2b35f20bbf23ff1fc9"
    },
    "sw.js": {
      "previousSha256": "082f8d2e6b94053c5e080256f359c1fbad4b787d6e3b6a052001724b8cd54f66",
      "currentSha256": "50b6526783bce8a799d19123059dcee6dc535cf4b2ac45534e0b9bcea2726a41"
    }
  },
  "addedSources": {
    "src/port-quay-art-v188.js": "dbae88f45d2b296994841c561f438b314c6c5556fdb79a26eebfac5d19e32997"
  }
});

// Cargo Matriarch art, the MANTA hull, the native title QA entry and their
// verification continue the exact published R endpoints. Historical reports stay immutable;
// the separate registry contract below permits only Cargo's declared art delta.
export const TANTALUS_PRIORITIES_CARGO_ABYSS_V188 = freeze({
  "baseline": "232693f1e0ed24e404bb2fb0dbcd779611ccd2fc",
  "successors": {
    "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
      "previousSha256": "64a13e855d68cda96d0541c78202b77bdcf0703eaf1c91a786fd93e21cc3a271",
      "currentSha256": "af84940ea813e6307086101b0a1439c1e02f84fd2cc6afee8f69b0527d79c812"
    },
    "package.json": {
      "previousSha256": "d10e191570b28fe0e2a6213c1ee1e0b75b49ad152f0024e81feb45fb4f9f760e",
      "currentSha256": "386949dd02f996625f0ec7317fe4355f1316b3cadb000d7ee837a3ea4c0a570d"
    },
    "scripts/qa-title-compositions-v163.py": {
      "previousSha256": "2c854d3190619b506b45fe1e22d21014f8f12af56a6966598a327c3fbdc2554a",
      "currentSha256": "e5ea9bd5a6dddf15ad3c4993f7233ff1ec3f8aac497ab815e16b19df86d381d3"
    },
    "scripts/verify-audit-continuation-v157.mjs": {
      "previousSha256": "641676a21373c30747555d01f180a8c38f07819091860c6c1924bf6f5c08b5cf",
      "currentSha256": "1c1987e69cc44577a44a49182f79522a886ef00fd5758d7d1538e9fc3f90dedb"
    },
    "scripts/verify-audit-continuation-v158.mjs": {
      "previousSha256": "86d8781274bc77362ad291d6a638c02c74c0521e8bcee5776c913b8fef06400e",
      "currentSha256": "41393b57bbd863f90bec5af9c367193954bd0bba1048e87c8d0b48a8c9804525"
    },
    "scripts/verify-audit-v143.mjs": {
      "previousSha256": "9dc8947f8b6d3dfb568777307390e561874e213c41edd501b6b4835cb3531a7a",
      "currentSha256": "2eb58ef20c62f91c392827358da0062063efcbe793695d14d221e63de7768c87"
    },
    "scripts/verify-black-cocoon-presentation-v158.mjs": {
      "previousSha256": "5b4a2e933b81654f746e8a94c7214523bd7dbb92cdb92dc3adef8dbd3031cedd",
      "currentSha256": "112c504b77d81943596e21d13caef1df9d8ed4e47968e22443fea87687cefbf5"
    },
    "scripts/verify-intro-v188.mjs": {
      "previousSha256": "49a813bcfed5f5065c2e9bac02eb53e566eb17d22d53cb55257b940d8f8e37a9",
      "currentSha256": "2d1cb7bcd706969a484e68773407ccbb6e45ffed82a32a186c88e31ac6a013f0"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "dac556b3f8fa6ce714732094dda492c4f7c6b25422b32901a72e219ca10fe67f",
      "currentSha256": "71f4efa64f734ff6e378f378b90071f0159bbb54c817f7e2e42c176d08f8a5bc"
    },
    "src/cargo-brutal-runtime-v67.js": {
      "previousSha256": "60f511f19a3359935a4317e359e66037330c77955834226732b14b1059696ab9",
      "currentSha256": "9487c281d5f07e40b1771c18033ac68928a96a7cfb51c1efda37791173b1af8a"
    },
    "src/i18n-en-catalog-v185.js": {
      "previousSha256": "28d42706b8ee4a3713532837328f33bdb2b6fc7b0517cd2dc911ac9a9a601c38",
      "currentSha256": "c4d72221b1455a84c43112171a28cae38f74000baa2a2609f1d3f236f9944218"
    },
    "src/legacy-operation-state-v131.js": {
      "previousSha256": "95c3759015297bd0c6e5120222758ded484675d41610db68c40faa7d75c7a0f1",
      "currentSha256": "54cd1b9305cdeab348acb9b050f004a5278b8e295f3670ad23ff5d43de23e1ae"
    },
    "src/legacy-operations-v131.js": {
      "previousSha256": "7c7de1da1e5c1bd43c89a5dc1ecdc86ca777fb872283f0cf2d4cd9857ae49cc5",
      "currentSha256": "ae50089c68584ef983e7fd9ab70537eeb824ba4fb1b0a427fab9e2d9d2948bb4"
    },
    "src/special-operations-v131.js": {
      "previousSha256": "0e9805fce4ecddc8dc00f694b7646885e8a8292f8460928639c4eb9ffae48f83",
      "currentSha256": "5c412f4c3adb8df674b25740ce7b2227a0ead01844c82d219a226a3497035243"
    },
    "sw.js": {
      "previousSha256": "50b6526783bce8a799d19123059dcee6dc535cf4b2ac45534e0b9bcea2726a41",
      "currentSha256": "85c8f787966610c1cd17570f137717222334a01d337da30ed2898a1385610b24"
    }
  },
  "addedSources": {
    "scripts/verify-cargo-matriarch-art-v188.mjs": "23e595a75d98bde1c392f7415d371ffd8a551e5c1b4f38e44eb9209f983ab97e",
    "scripts/verify-manta-art-v188.mjs": "640b2872d3fde367d13ef251e347da791b349f5678a891aef24e1766ae1de084",
    "src/cargo-matriarch-art-v188.js": "e2322b5183fa4b31700184bcdf623526004587e088db07ec75755fa22ea4b8d4",
    "src/manta-art-v188.js": "e8ad760a1d3c5b64d1f686fcc7c49b568b2fa507caee9b77d82eafd9932ed97c"
  }
});

// HADAL adds a contextual local Abyss presentation and the existing native
// field-action advance. These exact C predecessors remain separate from the
// published Cargo receipts; no registry promotion or new swim cycle is claimed.
export const TANTALUS_PRIORITIES_HADAL_V188 = freeze({
  "baseline": "a3634de7c294ae82554d899057fab96088ccf769",
  "successors": {
    "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
      "previousSha256": "af84940ea813e6307086101b0a1439c1e02f84fd2cc6afee8f69b0527d79c812",
      "currentSha256": "2438b8895b36a729434264e0488c4687cdf2e9a377160bdbf476a073a57e5c9c"
    },
    "package.json": {
      "previousSha256": "386949dd02f996625f0ec7317fe4355f1316b3cadb000d7ee837a3ea4c0a570d",
      "currentSha256": "48c789b2740a9b1a2b2b128699051ef3df5ae4b20efa3c35b1b277771f3b7510"
    },
    "scripts/verify-audit-v143.mjs": {
      "previousSha256": "2eb58ef20c62f91c392827358da0062063efcbe793695d14d221e63de7768c87",
      "currentSha256": "e0830aced7f0172ac455b2caa1f01fab29a886a98323ef9dffac1942eadcd999"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "71f4efa64f734ff6e378f378b90071f0159bbb54c817f7e2e42c176d08f8a5bc",
      "currentSha256": "43d082f94a0ee3fdba5b40c55c2d663220d9f92af615e0dfd0b6196f1734faef"
    },
    "src/i18n-en-catalog-v185.js": {
      "previousSha256": "c4d72221b1455a84c43112171a28cae38f74000baa2a2609f1d3f236f9944218",
      "currentSha256": "3148d98764e42a05192d72ad7c64e565ca3648c6922704a9db7fba99b8d8ee2d"
    },
    "src/legacy-operation-state-v131.js": {
      "previousSha256": "54cd1b9305cdeab348acb9b050f004a5278b8e295f3670ad23ff5d43de23e1ae",
      "currentSha256": "68d888f3725d4fb06be41c30bee84e776cdc7dcad92e52f725e8511a8cb157ab"
    },
    "src/legacy-operations-v131.js": {
      "previousSha256": "ae50089c68584ef983e7fd9ab70537eeb824ba4fb1b0a427fab9e2d9d2948bb4",
      "currentSha256": "e3233ae75f5e81436cf920e28b9cf7ea52e03b3a99860992dd3d74449eda8d29"
    },
    "src/player-appearance-runtime-v126.js": {
      "previousSha256": "cce67f9128241fcf6e8f6932a57ec73b080c7e875acf024e15259450dbd9188b",
      "currentSha256": "8bb9769611a9c117fdebd039343d59a57e2e3c9c97a508224134c079cf1b5c11"
    },
    "src/player-body-rig-v125.js": {
      "previousSha256": "401f81aaf0b2f1ab3b90353486782aa755fb54fd16084a5beda964c5d6c8a1df",
      "currentSha256": "f281fa6f7ff16263b5b6dc5a249e5db0a76e994bd2d680af7b637deaf26e0f71"
    },
    "src/player-locomotion-rig-v129.js": {
      "previousSha256": "4af0bb1aaca511418267e0e5fead565de6ec739263c35ffa84eeb85573416dda",
      "currentSha256": "e3001bebca64500ccd12a0ba50fc3c16fe1700acbf89845a694f52e16f62bd06"
    },
    "src/player-modular-rig-v126.js": {
      "previousSha256": "2fef117a684b16b6c426ed93f932ce91e660648682f50600c799f5cd6126c8f9",
      "currentSha256": "a63248ee1295dd786ac030c3825e596fe4927f202c4cf7ccd82b5c9d9a4699c5"
    },
    "src/player-transit-rig-v128.js": {
      "previousSha256": "5aceb439b4d5b5421073e4a9bd0fa0e5a7f8d2673fbbf3e88dbc69ebd98472fd",
      "currentSha256": "9ac395f6122f45f1c96b70238f81129bf501eab61d11c0529415cf71115f6b08"
    },
    "src/player-weapon-runtime-v125.js": {
      "previousSha256": "a2d11f762b1064be9b888e7d1e9502e161784be9f09012376b11426fe88b2032",
      "currentSha256": "88ab2fb9c476a8d07b1cecd961c9b7844833283406ea74b9fa1915401d534ca6"
    },
    "sw.js": {
      "previousSha256": "85c8f787966610c1cd17570f137717222334a01d337da30ed2898a1385610b24",
      "currentSha256": "024d58728b16a4485dcf618a822280003b7eeb966561df0eac3b1e17c44b4b19"
    }
  },
  "addedSources": {
    "scripts/verify-hadal-player-art-v188.mjs": "e0b4bd68e153235ece159b282b77f8e7682f580598e8940b98bafd5d88ef72bd",
    "src/hadal-player-art-v188.js": "7cc75eefd3b187c166368d037696865cc8072eefd827b8b0cd4da818ee33c5f3"
  }
});

// Broodstorm adds local winged-queen art without promoting the chapter or its
// dropship corpus. The H source endpoints remain separate historical receipts.
export const TANTALUS_PRIORITIES_BROODSTORM_V188 = freeze({
  "baseline": "361e40670c393dd548b4faa081f12edb0e9b05c4",
  "successors": {
    "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
      "previousSha256": "2438b8895b36a729434264e0488c4687cdf2e9a377160bdbf476a073a57e5c9c",
      "currentSha256": "5460541da3d8b8f45e59ea584afb00e8be32378f19e82bcceb0fab688d527471"
    },
    "package.json": {
      "previousSha256": "48c789b2740a9b1a2b2b128699051ef3df5ae4b20efa3c35b1b277771f3b7510",
      "currentSha256": "de4535cf179efd3fe86b6a73622b979ef0f75892d1865aad18d407fa7700b3d2"
    },
    "scripts/verify-audit-continuation-v157.mjs": {
      "previousSha256": "1c1987e69cc44577a44a49182f79522a886ef00fd5758d7d1538e9fc3f90dedb",
      "currentSha256": "afb20cffa2a0214c7802b7c9b36f5dadcc7c8eef795452e1c08bf0bdd19c6697"
    },
    "scripts/verify-audit-continuation-v158.mjs": {
      "previousSha256": "41393b57bbd863f90bec5af9c367193954bd0bba1048e87c8d0b48a8c9804525",
      "currentSha256": "1bc844e8a063004fdd64141d8e3d908fd10163fb6c9e2ef39a8353581c172406"
    },
    "scripts/verify-audit-v143.mjs": {
      "previousSha256": "e0830aced7f0172ac455b2caa1f01fab29a886a98323ef9dffac1942eadcd999",
      "currentSha256": "50a8b5904d59e82b788c23738d8a9ec809f69fd20beb965d7328b70698ce217d"
    },
    "scripts/verify-black-cocoon-presentation-v158.mjs": {
      "previousSha256": "112c504b77d81943596e21d13caef1df9d8ed4e47968e22443fea87687cefbf5",
      "currentSha256": "fe489fab18e96fa26ba31cb3f39ea61e8f70ba4daa120613b4d564faa60eb0a5"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "43d082f94a0ee3fdba5b40c55c2d663220d9f92af615e0dfd0b6196f1734faef",
      "currentSha256": "4c92d631018952c243a3c3ac49b64cdf18bf04f609daf322ec99c2c6ce333425"
    },
    "src/i18n-en-catalog-v185.js": {
      "previousSha256": "3148d98764e42a05192d72ad7c64e565ca3648c6922704a9db7fba99b8d8ee2d",
      "currentSha256": "73d71fb68c960c112c3bf1cd792e5a522279de76f4f7d634a0d33257303d63ae"
    },
    "src/legacy-operation-state-v131.js": {
      "previousSha256": "68d888f3725d4fb06be41c30bee84e776cdc7dcad92e52f725e8511a8cb157ab",
      "currentSha256": "bda3ae3681cf383b1a8100e9110ba931ab62ba4d4f0f94a02d4a98ed80add7da"
    },
    "src/legacy-operations-v131.js": {
      "previousSha256": "e3233ae75f5e81436cf920e28b9cf7ea52e03b3a99860992dd3d74449eda8d29",
      "currentSha256": "ebeb8393217142382d16f0319df409eea4f3775aba25e62867000dedadcc4aec"
    },
    "src/special-operations-v131.js": {
      "previousSha256": "5c412f4c3adb8df674b25740ce7b2227a0ead01844c82d219a226a3497035243",
      "currentSha256": "99a629ceba7042ca320e50d384fe9b9e734bdefa452bd5485899661adca5b45a"
    },
    "sw.js": {
      "previousSha256": "024d58728b16a4485dcf618a822280003b7eeb966561df0eac3b1e17c44b4b19",
      "currentSha256": "6bf7972ff27396e71d850cdb13d449d187d35ec170e2c217122dde630fa6cdd3"
    }
  },
  "addedSources": {
    "scripts/verify-broodstorm-queen-art-v188.mjs": "bd82cf599d623cf2e9ed9db608a5577a8e229aee411c6c3c00dcf3e2159b5a6f",
    "src/broodstorm-queen-art-v188.js": "634572ca055f5a82900d77b7c03f0c6f6124246336d56bcbf761e15767f05702"
  }
});

// V157/V158 remain immutable reports. This records only the reviewed registry
// declaration after Cargo's dedicated art; clip/pixel evidence is verified
// separately. Neither Cocon nor HADAL gains a completed scope or canon claim.
export const TANTALUS_PRIORITIES_CARGO_REGISTRY_V188 = freeze({
  baseline: '232693f1e0ed24e404bb2fb0dbcd779611ccd2fc',
  historicalSnapshot: {
    path: 'docs/forge/xeno-trials/progress-v158.json',
    sha256: '4af5ae6469aa13ec1ea999eaa1fced2f616f23363a3df806cf2d34deb6c67ef7'
  },
  operationId: 'cargo-brutal',
  removedDebt: 'dedicated-cargo-matriarch-art',
  // These two title changes were already published in the R baseline. They
  // do not alter identity, route, status, remaining scope or adaptation flags.
  titlesAlreadyPublishedAtBaseline: {
    'hive-world': 'TR-0 : LA RUCHE-MONDE',
    'narrative-collectables': 'QZ-17 — LA CARGAISON FANTÔME'
  },
  previousCounts: { total: 21, effective: 1, partial: 20, missing: 0, playable: 21 },
  currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 }
});

export function verifyCargoRegistryContinuationV188(operations, counts, readSource = readRepository) {
  const transition = TANTALUS_PRIORITIES_CARGO_REGISTRY_V188;
  const bytes = readSource(transition.historicalSnapshot.path);
  assert.equal(sha(bytes), transition.historicalSnapshot.sha256, 'Changed historical V158 operations snapshot');
  const snapshot = JSON.parse(bytes.toString());
  assert.deepEqual(snapshot.runtimeContracts.operations.counts, transition.previousCounts);
  const rows = snapshot.tables['10_Operations'].rows;
  assert.equal(rows.length, 21);
  assert.deepEqual(rows.find(row => row[0] === transition.operationId),
    ['cargo-brutal', 'CARGO BRUTAL', 'special-cargo-brutal', 'partial', 1, transition.removedDebt, 0]);
  const expected = rows.map(([id, promisedTitle, route, implementationStatus, playable, remaining, canonExact]) => ({
    id, promisedTitle: transition.titlesAlreadyPublishedAtBaseline[id] || promisedTitle, route,
    implementationStatus: id === transition.operationId ? 'effective' : implementationStatus,
    playable: playable === 1,
    remainingMechanics: id === transition.operationId ? [] : remaining ? remaining.split('; ') : [],
    canonExact: canonExact === 1
  }));
  const actual = operations.map(operation => {
    assert.ok(Array.isArray(operation.remainingMechanics), 'Missing explicit remaining scope: ' + operation.id);
    return {
      id: operation.id, promisedTitle: operation.promisedTitle,
      route: operation.campaignId || operation.accessSurface || '',
      implementationStatus: operation.implementationStatus, playable: operation.playable,
      remainingMechanics: [...operation.remainingMechanics], canonExact: operation.canonExact
    };
  });
  assert.deepEqual(actual, expected, 'Only the Cargo art debt and its local implementation status may change');
  const derivedCounts = {
    total: actual.length, effective: actual.filter(row => row.implementationStatus === 'effective').length,
    partial: actual.filter(row => row.implementationStatus === 'partial').length,
    missing: actual.filter(row => row.implementationStatus === 'missing').length,
    playable: actual.filter(row => row.playable).length
  };
  assert.deepEqual(derivedCounts, transition.currentCounts);
  assert.deepEqual(counts, derivedCounts, 'Registry counters must describe its exact current rows');
  return freeze({ historicalCounts: transition.previousCounts, currentCounts: transition.currentCounts,
    changedIds: [transition.operationId], unchangedOperations: rows.length - 1 });
}

// The H registry retains Cargo's reviewed transition. Broodstorm now removes
// only its dedicated queen-art debt; its dropship scope and partial status stay
// explicit. This declaration does not certify pixels, canon or a whole campaign.
export const TANTALUS_PRIORITIES_BROODSTORM_REGISTRY_V188 = freeze({
  baseline: '361e40670c393dd548b4faa081f12edb0e9b05c4',
  baselineRegistry: {
    path: 'src/special-operations-v131.js',
    sha256: '5c412f4c3adb8df674b25740ce7b2227a0ead01844c82d219a226a3497035243',
    declarationsSha256: 'b9fb8c67c5cb0e06b2c8a75fb8bfc39765b8b78357e445acca702ec92ba32a14'
  },
  operationId: 'broodstorm',
  removedDebt: 'dedicated-flying-queen-art',
  previousRemainingMechanics: ['dedicated-flying-queen-art', 'complete-modular-dropship-corpus'],
  currentRemainingMechanics: ['complete-modular-dropship-corpus'],
  previousCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
  currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 }
});

export function verifyBroodstormRegistryContinuationV188(operations, counts, readSource = readRepository) {
  const transition = TANTALUS_PRIORITIES_BROODSTORM_REGISTRY_V188;
  const matches = operations.filter(operation => operation.id === transition.operationId);
  assert.equal(matches.length, 1, 'Exactly one Broodstorm registry declaration is required');
  const operation = matches[0];
  assert.deepEqual(operation.remainingMechanics, transition.currentRemainingMechanics,
    'Only the dedicated Broodstorm queen-art debt may be removed');
  assert.equal(operation.implementationStatus, 'partial', 'Broodstorm remains a partial chapter');
  assert.equal(operation.canonExact, false, 'Broodstorm remains an original adaptation');
  assert.equal(operation.playable, true);
  assert.deepEqual(counts, transition.currentCounts, 'Broodstorm art does not promote a whole operation');
  const projected = operations.map(entry => entry === operation
    ? { ...entry, remainingMechanics: [...transition.previousRemainingMechanics] } : entry);
  // Pin every declaration field, including production order and required scope.
  // The nested campaign object has separate source receipts (including notices);
  // its route ID remains part of this exact H declaration projection.
  const declarations = projected.map(entry => Object.keys(entry).filter(key => key !== 'campaign').sort()
    .map(key => [key, entry[key]]));
  assert.equal(sha(JSON.stringify(declarations)), transition.baselineRegistry.declarationsSha256,
    'Only the reviewed Broodstorm debt may differ from the exact H registry declarations');
  const historical = verifyCargoRegistryContinuationV188(projected, counts, readSource);
  assert.deepEqual(historical.currentCounts, transition.previousCounts);
  const changedIds = [...historical.changedIds, transition.operationId];
  return freeze({ historicalCounts: historical.historicalCounts, currentCounts: transition.currentCounts,
    changedIds, unchangedOperations: operations.length - changedIds.length });
}

export const TANTALUS_PRIORITIES_SOURCE_ONLY_PATHS_V188 = Object.freeze([
  'scripts/audit-tantalus-priorities-v188.mjs',
  'scripts/verify-tantalus-priorities-v188.mjs',
  '.ai-tools/adopted-v188.json',
  'docs/development/PRIORITIES_P0_P1_V188.md'
]);

// Queen Mother source continuation from exact B2. These receipts identify
// frozen candidate bytes; runtime/visual QA and publication remain separate.
export const TANTALUS_PRIORITIES_QUEEN_MOTHER_V188 = freeze({
  "baseline": "b9aee06a0783bc7c0cf7094268a08618364df781",
  "successors": {
    "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
      "previousSha256": "5460541da3d8b8f45e59ea584afb00e8be32378f19e82bcceb0fab688d527471",
      "currentSha256": "f8f0b2d4d67183b09f9d8be7f989d8032ad3e4796295367e4a07fc11bf86ab7e"
    },
    "package.json": {
      "previousSha256": "de4535cf179efd3fe86b6a73622b979ef0f75892d1865aad18d407fa7700b3d2",
      "currentSha256": "2f1841faceabf92adbe9f829bac3e66ad81c7900064bdc1b382d0470e1717e4f"
    },
    "scripts/verify-audit-continuation-v157.mjs": {
      "previousSha256": "afb20cffa2a0214c7802b7c9b36f5dadcc7c8eef795452e1c08bf0bdd19c6697",
      "currentSha256": "6a88297b6d018c5086f2cdd92b88ff408eafc9fbf869be52365988edbb8a76c0"
    },
    "scripts/verify-audit-continuation-v158.mjs": {
      "previousSha256": "1bc844e8a063004fdd64141d8e3d908fd10163fb6c9e2ef39a8353581c172406",
      "currentSha256": "4fbb9c96780e8d46143f87997963246b9c634e4503a692742bacec7c8dad7f24"
    },
    "scripts/verify-audit-v143.mjs": {
      "previousSha256": "50a8b5904d59e82b788c23738d8a9ec809f69fd20beb965d7328b70698ce217d",
      "currentSha256": "32df0186eeb4bd76263a46c6517f1f2f92fcb0aa25fa47c41292d7e178bc0ca7"
    },
    "scripts/verify-black-cocoon-presentation-v158.mjs": {
      "previousSha256": "fe489fab18e96fa26ba31cb3f39ea61e8f70ba4daa120613b4d564faa60eb0a5",
      "currentSha256": "488aa7cfe2b50a2f0c40a20793b50dcded23f5babe0634208c204d573444f175"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "4c92d631018952c243a3c3ac49b64cdf18bf04f609daf322ec99c2c6ce333425",
      "currentSha256": "11fc3b2d559034519dcb66c678e70c489f0b9132a7797142513860e81d654647"
    },
    "src/ecosystem-missions-v131.js": {
      "previousSha256": "646012d4cd8465db13739b0df8a00407acf04cad8ffe5ee6f5035818b0c33ddc",
      "currentSha256": "3b90f5739b4ff282d29304f0dc2aa7ad12150efb80e4b7459d60071ad4f03ec7"
    },
    "src/ecosystem-systems-v131.js": {
      "previousSha256": "4e240a73054c5fefe872200f8b34a7055feff373d8f6c43b27e81d0c5ed621a3",
      "currentSha256": "4fda558fd365aa872cc656c5565bef204dd967da9a2fb3b8f673d87678b8353f"
    },
    "src/i18n-en-catalog-v185.js": {
      "previousSha256": "73d71fb68c960c112c3bf1cd792e5a522279de76f4f7d634a0d33257303d63ae",
      "currentSha256": "4c75f584d9a2a4fc1d7328f0b85a38bd037f75f416131af9cca135012d1daee7"
    },
    "src/special-operations-v131.js": {
      "previousSha256": "99a629ceba7042ca320e50d384fe9b9e734bdefa452bd5485899661adca5b45a",
      "currentSha256": "433ddc7b821c98b973c10fc9e3aa39bc66c77e8cf9364dd9f1a25d03b70b08af"
    },
    "sw.js": {
      "previousSha256": "6bf7972ff27396e71d850cdb13d449d187d35ec170e2c217122dde630fa6cdd3",
      "currentSha256": "881f6a320f57315bdd5f8985a091cc967ba6d8090b02290997c43e9fd7eeeac5"
    }
  },
  "addedSources": {
    "scripts/verify-queen-mother-art-v188.mjs": "cabf01a56b817a86ff16f026a51f4614e9ff78764a76c391bbdf86d64a121d80",
    "src/queen-mother-art-v188.js": "a22492e65b278c4bce30552e8fd85a748a8171305e73aae87d151cd1b0841187"
  }
});

export const TANTALUS_PRIORITIES_QUEEN_MOTHER_REGISTRY_V188 = freeze({
  baseline: 'b9aee06a0783bc7c0cf7094268a08618364df781',
  baselineRegistry: {
    path: 'src/special-operations-v131.js',
    sha256: '99a629ceba7042ca320e50d384fe9b9e734bdefa452bd5485899661adca5b45a',
    declarationsSha256: 'bc90066e0fa20fc3222d5f252354622af72df66f5670f868ea29fb582ccbebec'
  },
  operationId: 'queen-mother-song',
  removedDebt: 'dedicated-queen-mother-animation',
  previousRemainingMechanics: ['dedicated-queen-mother-animation', 'complete-royal-cast'],
  currentRemainingMechanics: ['complete-royal-cast'],
  previousCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
  currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 }
});

export function verifyQueenMotherRegistryContinuationV188(operations, counts, readSource = readRepository) {
  const transition = TANTALUS_PRIORITIES_QUEEN_MOTHER_REGISTRY_V188;
  const matches = operations.filter(operation => operation.id === transition.operationId);
  assert.equal(matches.length, 1, 'Exactly one Queen Mother registry declaration is required');
  const operation = matches[0];
  assert.deepEqual(operation.remainingMechanics, transition.currentRemainingMechanics,
    'Only the dedicated Queen Mother animation debt may be removed');
  assert.equal(operation.implementationStatus, 'partial', 'Queen Mother remains a partial chapter');
  assert.equal(operation.canonExact, false, 'Queen Mother remains an original adaptation');
  assert.equal(operation.playable, true);
  assert.deepEqual(counts, transition.currentCounts, 'Queen Mother art does not promote a whole operation');
  const projected = operations.map(entry => entry === operation
    ? { ...entry, remainingMechanics: [...transition.previousRemainingMechanics] } : entry);
  // Restore only Queen Mother's debt to B2. Campaign descriptions have their own
  // source receipts; every other declaration field and its order remain exact.
  const declarations = projected.map(entry => Object.keys(entry).filter(key => key !== 'campaign').sort()
    .map(key => [key, entry[key]]));
  assert.equal(sha(JSON.stringify(declarations)), transition.baselineRegistry.declarationsSha256,
    'Only the reviewed Queen Mother debt may differ from the exact B2 registry declarations');
  const historical = verifyBroodstormRegistryContinuationV188(projected, counts, readSource);
  assert.deepEqual(historical.currentCounts, transition.previousCounts);
  const changedIds = [...historical.changedIds, transition.operationId];
  return freeze({ historicalCounts: historical.historicalCounts, currentCounts: transition.currentCounts,
    changedIds, unchangedOperations: operations.length - changedIds.length });
}


// Queen Mother guard source continuation from exact Q. No registry debt is
// closed by this presentation-only lot; the historical Q receipts stay intact.
export const TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188 = freeze({
  "baseline": "c1d4c636347275d2d3a6ecbc15ebfcfeadfb035c",
  "successors": {
    "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
      "previousSha256": "f8f0b2d4d67183b09f9d8be7f989d8032ad3e4796295367e4a07fc11bf86ab7e",
      "currentSha256": "c1c14fc8e850a7bbfd4946196edd233db6324b7898c4878298554f2ad0bbd438"
    },
    "package.json": {
      "previousSha256": "2f1841faceabf92adbe9f829bac3e66ad81c7900064bdc1b382d0470e1717e4f",
      "currentSha256": "3066253712f123ae2008fced03a1473b849f67a8d364bbc0864f30588f35d609"
    },
    "scripts/verify-audit-continuation-v157.mjs": {
      "previousSha256": "6a88297b6d018c5086f2cdd92b88ff408eafc9fbf869be52365988edbb8a76c0",
      "currentSha256": "a3230677a0ea8bcafab21917da2823e49777bcc2c1e406bb9dc6b91e396c2155"
    },
    "scripts/verify-audit-continuation-v158.mjs": {
      "previousSha256": "4fbb9c96780e8d46143f87997963246b9c634e4503a692742bacec7c8dad7f24",
      "currentSha256": "80f296774fff4bbd1eaecca48fdd4c63cb1beaca03ed0c44a3d674ebfae87a28"
    },
    "scripts/verify-audit-v143.mjs": {
      "previousSha256": "32df0186eeb4bd76263a46c6517f1f2f92fcb0aa25fa47c41292d7e178bc0ca7",
      "currentSha256": "3a2ad226bf0ae4076e3fbd526f2d03fa3bd7459f8811f0d27d6a1a33a3626e85"
    },
    "scripts/verify-black-cocoon-presentation-v158.mjs": {
      "previousSha256": "488aa7cfe2b50a2f0c40a20793b50dcded23f5babe0634208c204d573444f175",
      "currentSha256": "a35cab0472f11b1e656aec251a035dc1cd3a4b9df6e6803ab0f2da83ab313cb1"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "11fc3b2d559034519dcb66c678e70c489f0b9132a7797142513860e81d654647",
      "currentSha256": "0d663f627b878c05ecd067c417d2bd2895ffeede9de0b21e6ad3852134d10a7d"
    },
    "src/ecosystem-missions-v131.js": {
      "previousSha256": "3b90f5739b4ff282d29304f0dc2aa7ad12150efb80e4b7459d60071ad4f03ec7",
      "currentSha256": "34fc724a8b7c758153b42f7f1542512056a12aef6b6c119f6e8cea7ce9fa5c7d"
    },
    "src/ecosystem-systems-v131.js": {
      "previousSha256": "4fda558fd365aa872cc656c5565bef204dd967da9a2fb3b8f673d87678b8353f",
      "currentSha256": "577e12210793abf2ea46df9afef38aeab26bbce12a960073379cf6a639993d5c"
    },
    "src/game-production-runtime.js": {
      "previousSha256": "5cfd2d4a4e5ca6d01529332d67f9afa0564cfa05dbcfabd06657f90559a7e141",
      "currentSha256": "48604c22ea4a37dc33270a190bc9e8b4a36a8edd35c9e0d2707d2d90866055bb"
    },
    "src/i18n-en-catalog-v185.js": {
      "previousSha256": "4c75f584d9a2a4fc1d7328f0b85a38bd037f75f416131af9cca135012d1daee7",
      "currentSha256": "4b3e6552f422a1a7d30b9940eebd81880e292bcbae5067cf1e2697284dbca917"
    },
    "sw.js": {
      "previousSha256": "881f6a320f57315bdd5f8985a091cc967ba6d8090b02290997c43e9fd7eeeac5",
      "currentSha256": "e31f82016ae97434c8805dd00d35279c6246bc9c52ddc32faa3c678996db8d22"
    }
  },
  "addedSourceSuccessors": {
    "scripts/verify-queen-mother-art-v188.mjs": {
      "previousSha256": "cabf01a56b817a86ff16f026a51f4614e9ff78764a76c391bbdf86d64a121d80",
      "currentSha256": "889d7e7a91eecb6fa9ba780982a164c458c394b8174d59514ce8baf5125f15b3"
    }
  },
  "addedSources": {
    "scripts/verify-queen-mother-guard-art-v188.mjs": "ec26cb25201477732fd747eda4a88a7bdaf88e88acd2e36e3cdef710b17f7d38",
    "src/queen-mother-guard-art-v188.js": "fa5a6c5f123a826f97675e50c02a2f48cabc4010dbceafac82e16c42bf9bd540"
  }
});

export const TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_REGISTRY_V188 = freeze({
  baseline: 'c1d4c636347275d2d3a6ecbc15ebfcfeadfb035c',
  baselineRegistry: {
    path: 'src/special-operations-v131.js',
    sha256: '433ddc7b821c98b973c10fc9e3aa39bc66c77e8cf9364dd9f1a25d03b70b08af',
    declarationsSha256: '46cdb671b6cc3cb1591c5fe4cd124d85335278d93b79a386cddbd9cc4995618a'
  },
  operationId: 'queen-mother-song',
  projection: 'identity',
  removedDebts: [],
  newChangedIds: [],
  historicalChangedIds: ['cargo-brutal', 'broodstorm', 'queen-mother-song'],
  previousRemainingMechanics: ['complete-royal-cast'],
  currentRemainingMechanics: ['complete-royal-cast'],
  previousCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
  currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 }
});

export function verifyQueenMotherGuardRegistryContinuationV188(operations, counts, readSource = readRepository) {
  const continuation = TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_REGISTRY_V188;
  assert.equal(sha(readSource(continuation.baselineRegistry.path)), continuation.baselineRegistry.sha256,
    'Guard presentation must retain the exact Q registry source bytes');
  const matches = operations.filter(operation => operation.id === continuation.operationId);
  assert.equal(matches.length, 1, 'Exactly one Queen Mother registry declaration is required');
  const operation = matches[0];
  assert.deepEqual(operation.remainingMechanics, continuation.currentRemainingMechanics,
    'Guard presentation leaves the complete royal cast debt open');
  assert.equal(operation.implementationStatus, 'partial', 'Guard presentation does not promote Queen Mother');
  assert.equal(operation.canonExact, false, 'Guard presentation assigns no canonical identity');
  assert.equal(operation.playable, true);
  assert.deepEqual(counts, continuation.currentCounts, 'Guard presentation does not change registry counts');
  const declarations = operations.map(entry => Object.keys(entry).filter(key => key !== 'campaign').sort()
    .map(key => [key, entry[key]]));
  assert.equal(sha(JSON.stringify(declarations)), continuation.baselineRegistry.declarationsSha256,
    'Guard presentation must preserve every exact Q registry declaration');
  // R projects identically to Q. In particular, do not append Queen Mother a
  // second time to the historical set of operations whose registry changed.
  const historical = verifyQueenMotherRegistryContinuationV188(operations, counts, readSource);
  assert.deepEqual(historical.currentCounts, continuation.previousCounts);
  assert.deepEqual(historical.changedIds, continuation.historicalChangedIds);
  assert.equal(new Set(historical.changedIds).size, historical.changedIds.length);
  assert.equal(historical.unchangedOperations, 18);
  return historical;
}

// Queen Mother choir source continuation from exact R. The original presentation
// does not close complete-royal-cast or change any registry declaration.
// Lead continuation after PR #49 (b6e01ef1): merge of main (Obscura, PR #48) and later work.
// Each receipt maps the reviewed b6e01ef1 endpoint to the current bytes; regenerated by the lead.
// BEGIN LEAD CONTINUATION RECEIPTS
export const TANTALUS_PRIORITIES_LEAD_CONTINUATION_V188 = freeze({ baseline: 'b6e01ef1ca22700479b535313a575a0aa30680aa', successors: {
  "scripts/audit-native-qa-resources-v187.mjs": {
    "previousSha256": "4f2d15004b203a1171fe5cc0b1e67394a79b5a343f3a1360da5ef3604ca8dbd1",
    "currentSha256": "11c877212a478982dcfc0157e54a66ac478812ab35c4fda44cf31b5bfc23f28a"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "previousSha256": "0b67859c912f521a2d674140dd78ea3f2ba69736ac6d6be5f4d8b8ee3a6b1f50",
    "currentSha256": "eead35d778af227d4a7809baa0fc10ff0ddec0d4fc3f07f2cef8b6d7cf6c63b6"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "d3e7ef7d42dc48cd69d6f0ffc7c577545b5682a82f0411ea753c1b44c248268a",
    "currentSha256": "d3db745228acb958a138e62562fe4ea056dbc8f7bd61ca9cf203df74eaf62ca0"
  },
  "scripts/verify-tantalus-priorities-v188.mjs": {
    "previousSha256": "483cf05fe48e002eb4e3ac02a35dd1fea752e896192d3ebdb5868c43cbbc176e",
    "currentSha256": "9496d07fe2693a3c92d35a9050a4a984c67d0fbaa3855029e2997678b2eb440d"
  }
} });
// END LEAD CONTINUATION RECEIPTS
// Xeno Trials join after 0d1d9950 (Tantalus V188 + PR #49 + main merge): merge of
// feat/xeno-trials-priorities-v204 (V186 completion to V206, PR #50). Each receipt maps
// the exact 0d1d9950 endpoint, the bytes the lead continuation reviews, to the merged bytes.
// The Xeno Trials chain ends with its own XENO_TRIALS_TANTALUS_JOIN_V206; V187 requires
// both chains to agree wherever both pin a path. Historical receipt blocks stay unchanged.
// BEGIN XENO TRIALS JOIN RECEIPTS
export const TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188 = freeze({ baseline: '0d1d9950ea7c6f4120d6133b6d0f4cafa2c97921', successors: {
  ".github/workflows/full-release-v143.yml": {
    "previousSha256": "0ec3deb5a88aac2e6bae73f51f41ed653ce3ff202254fb318bcff98034fbe8a2",
    "currentSha256": "16ef2b6b1b1b1c5268b278ccfc703cb7316b09fe2089a9820c5e3f96aa81982b"
  },
  ".github/workflows/non-forge-regression-v163.yml": {
    "previousSha256": "6b7270ac2cd8f5d84ba529de5f3675cedf0e430898823c1d107872980b7a6002",
    "currentSha256": "3db6cc53887a07224afacb2a0e15df9889d4bd09319d2cf3b2ff91767463e518"
  },
  "docs/arsenal/README.md": {
    "previousSha256": "61c87b06e64ba5d2bdb3d91d22fb33b0fb8038309be8c3d98a43547444e13b4f",
    "currentSha256": "112cf2ec236f1fc8da0af8268db1ffc857741d028560942e0413a66e0562a336"
  },
  "docs/development/AUDIT_CONTENU_V188.md": {
    "previousSha256": "68d3f8c15a10195a773b0ec826d32341d01f7b554bef1370777dfbee219e3923",
    "currentSha256": "589a5129dc3dd3330195ea320fe12e7f03b3ba180a7fc55aa844b196a39d0bbd"
  },
  "docs/development/QUESTIONS_PROPRIETAIRE_V188.md": {
    "previousSha256": "15018c92727c164872514278c03acb8ffab23ab0d1501b8ba663018caf497951",
    "currentSha256": "fef59d634f8dc6c2a5ae6224829eb0ee87fbe53de1aad8ac17723c9f4fa7285b"
  },
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
    "previousSha256": "d03dcc6e75b22a69890b389d5c0ef84311d5ea2e12d9dbe8233c2ff78bd419cb",
    "currentSha256": "6e82fed41e729416864239f70b77793ad070873ed820fae3c10cb4845c1768eb"
  },
  "index.html": {
    "previousSha256": "3ef0afc6493e26c7c483549ad2df64b59c96fcb5beaa8b1f2c35a99400fd35de",
    "currentSha256": "a3655c982389d7a0af384f484254db817b04dfd9d3a2af0518a79714244314d2"
  },
  "package.json": {
    "previousSha256": "b74e5e7d949a29976fb562f1a8215a01426a1b950301cc37b25939421e2becf1",
    "currentSha256": "8d66d435f46a60a686ecb4dfa4ac63940a0e7f747cfd67b4d2ea7a95f369c8b5"
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "previousSha256": "11c877212a478982dcfc0157e54a66ac478812ab35c4fda44cf31b5bfc23f28a",
    "currentSha256": "e230ff8baf9dc681dace32ff9beb3c24eb5d4dda464128dbbcbe8e7d86930e47"
  },
  "scripts/audit-succession-v163.mjs": {
    "previousSha256": "d69451f1d8848662cac1264b24640faec9346ff36c633e62802378fc9a981390",
    "currentSha256": "ca57080fe834777e4b40888801525523fb93f2f873ec93ab941101e4edb341bd"
  },
  "scripts/build-asset-filter.mjs": {
    "previousSha256": "dbdc1d49628142db4953ebce8e752fb351cb05b1224db29ba3e7c1aa795a898e",
    "currentSha256": "384b67baf7303dd12f74e90836510fd2a884068a18ceaf96cc89412a0ce50073"
  },
  "scripts/build.mjs": {
    "previousSha256": "99314d444b6866c54f3c9552919e083c303cf300840de5baaddebf9426e681be",
    "currentSha256": "fa817256bc9832c9390055ddab431e8dd9e1320b273904c39f2489ff6807ab12"
  },
  "scripts/qa-xeno-trials-capture-v163.py": {
    "previousSha256": "a6b4653534000439a743fd24455c01cfc73c4926b8ea8e28c77e770d675f8146",
    "currentSha256": "3f338ef56a2a0389ad28e0724ab510521eb9aa1f0acc26be3ca6ff8dcdc135b5"
  },
  "scripts/verify-act5-endings-v188.mjs": {
    "previousSha256": "104b74cf27bdc521269d387cb13dcc69852eb9525767ce6da8820eb1d7b42c83",
    "currentSha256": "dcf4e06bbfa3e9f26aab0f036157b89f44d8eb813e1ec3fe76ded24d6e0469dc"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "previousSha256": "7d1f368a4a6e5b3f8ae8a5161c8a8d819e32c33a14013dfed2ef8a1bb16cbd29",
    "currentSha256": "f10f3470e2511997f2bfb23a1f4d94ea9555f16991f1d2db867c67ce8ebdceaf"
  },
  "scripts/verify-audit-v143.mjs": {
    "previousSha256": "38cc0350f341d18a3536944e19391285e4756195e3c82af6e923d4072a615d08",
    "currentSha256": "99e6b467f42523a1ae2bb16d763547a41c93e7f4155ed4b8cc48dff25cfe1e6b"
  },
  "scripts/verify-campaign-lethe-v163.mjs": {
    "previousSha256": "fb8cbbd3dd9d6fb4f356a3e167f9537cf0f04619e6cb94feaebb5de5cca7cdde",
    "currentSha256": "dcd9ef0b0814546780eed9fbf40ffbe90444d673d782025b0405df77951161c0"
  },
  "scripts/verify-campaign-story-v160.mjs": {
    "previousSha256": "147d29402ef405c00b52f8453f991373c7ab869651d6b36046b54ee1c6340863",
    "currentSha256": "1a2c71beee2bc19433d6c67120ce582067e31ed2181309448d00398e454b06d0"
  },
  "scripts/verify-capture-observation-v177.mjs": {
    "previousSha256": "e44f384d7d3a27f4dc17a9ef67ee9b84e076976c5bda46d2a265ac06a1944742",
    "currentSha256": "3bcc9fac691aa886d4d5ce1c2918edccca0d8ff8b5e9b8c81e0099718a1de669"
  },
  "scripts/verify-colony-crew-v188.mjs": {
    "previousSha256": "b5a676c106ebef34cad714d87706ccc628617a6ae1998b42ea2130be91b880b1",
    "currentSha256": "a5374622c4cf0cade4e198669b19bf1ac10845867706b8e68a744fafe2a02a58"
  },
  "scripts/verify-depth-holds-v188.mjs": {
    "previousSha256": "4f372e48c2a48bbba551b20f9268b121c313e2e0871fc9b0e0385886687dc1ae",
    "currentSha256": "7279c2f7af0c7db2d4479b2c0c3d0522995e7833136661faca3adaeae8360346"
  },
  "scripts/verify-dropship-handover-v188.mjs": {
    "previousSha256": "6fe5f58c1dba4b070a67aa2ed9db09163c8e1364f40f7f247f8790fdec387730",
    "currentSha256": "99e146ee54262d3f9602d66fa323eb1841511a767c99b703c20c6498c9ff0b03"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "previousSha256": "a3efc37fd10216930c26e9afb54c52d6a6b71050c233db87b5b1c224748c166a",
    "currentSha256": "4abcfb2e30d5cc770e9299c5af4b766fc5b1f20de1628f4f7a17b611ce428263"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "previousSha256": "eead35d778af227d4a7809baa0fc10ff0ddec0d4fc3f07f2cef8b6d7cf6c63b6",
    "currentSha256": "05367a5372ae834063f6fce495b70d431553977c46efef28337921eb71525bde"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "d3db745228acb958a138e62562fe4ea056dbc8f7bd61ca9cf203df74eaf62ca0",
    "currentSha256": "30ede6fa1cc7c8d8cba5f30bc6b440e44f814bbc5e19072e5510dd88546e338a"
  },
  "scripts/verify-tantalus-priorities-v188.mjs": {
    "previousSha256": "9496d07fe2693a3c92d35a9050a4a984c67d0fbaa3855029e2997678b2eb440d",
    "currentSha256": "26618e6dd185cc260b2faea41df8d7a3194b61d77e0d9ebd2bbb095ac7079f5b"
  },
  "scripts/verify-xeno-trials-feedback-v149.mjs": {
    "previousSha256": "e9b3f36763c67348a50d00b4e21fa3012e6c3554496004d3a14746b684a1e561",
    "currentSha256": "2cc60dbd099da623eac050029484ba4cae97b6e921e624a5dccee00fd9d27f50"
  },
  "scripts/verify-xeno-trials-plan-v146.mjs": {
    "previousSha256": "62b344b8572fbe7ebdcc733d846c17f356227aa49ee24084527b380902508b6a",
    "currentSha256": "b9cc15d2912840d8ee02dd469062081af0253d9c858f6e35a07e22effff7c09c"
  },
  "scripts/verify-xeno-trials-signatures-v147.mjs": {
    "previousSha256": "87bfad249fd6331e49959f9f02b4f56b34703ba81126cd7f506be731182e4a12",
    "currentSha256": "cc07ea22c0520bbd88cf1a0319cdbd8b6d41f83166e7790764e013293543cf7e"
  },
  "specs/006-acte-v-fins/tasks.md": {
    "previousSha256": "488a46d90525d764a41689b81467be6d74bf8bc778b893c8861b04d850b69e2b",
    "currentSha256": "43d49a37df84bc10fefdcc2441906d0c0128f591e550d0c2bbf40a17f4b2b4ff"
  },
  "src/apc-convoy-runtime-v121.js": {
    "previousSha256": "afcdfd3f15db9ca405e40bee563a2d1ffff5d90bcaa2c6db377385e22a77b32b",
    "currentSha256": "166567754ff9a6b1a5c03d6bc3c36937324835ba371bc2b7718716604ca03200"
  },
  "src/app.js": {
    "previousSha256": "2db6b8019a1e5fd30d96a43f89f09da34d1246c7127e2e89bd2d3cbab6735968",
    "currentSha256": "0c27a5b5b1c285b91d8688a0a78e9615f740e8108d355b3f773a616c5504e981"
  },
  "src/content.js": {
    "previousSha256": "fa090839aedabdc5fbbc56b7205258e47b38fa313198293a56e81f6566d43494",
    "currentSha256": "3541cb9916316e755e998c95ff61bee23acb867f333c572fed122809c40708a5"
  },
  "src/depth-hold-deck-v188.js": {
    "previousSha256": "d6bad4be1cb32a4c7d8ad1dd3a2c4a9c7b65b5a5899655efd608e106ae898703",
    "currentSha256": "00ae578d126e324cfe538a07312eff26ff54f4316f0bfcfbb994cb1bb04d9651"
  },
  "src/depth-hold-sections-v188.js": {
    "previousSha256": "a5f56c0632ca39d23b24652647bf2e533577ebad8a4d0647fc8b25255786afb0",
    "currentSha256": "2ffedb778d7afce81321168a16e84bea5d8b571814c260f15441214f2d945b1a"
  },
  "src/game-production-runtime.js": {
    "previousSha256": "48604c22ea4a37dc33270a190bc9e8b4a36a8edd35c9e0d2707d2d90866055bb",
    "currentSha256": "54c0c0d1107e620c52680adf091918b27c78d8b7744242be96368d333eafeee6"
  },
  "src/i18n-auto-v185.js": {
    "previousSha256": "d9b0f2405eeae7eb2b1ea0d1f6a389ac736f89f4558e9e66c965b58498ebd90c",
    "currentSha256": "efd03c160bef3d4fc96c7480087e736b99b6a2e9aafbe88db0d03f486e9c475e"
  },
  "src/i18n-en-catalog-v185.js": {
    "previousSha256": "11a0ec21f4ac8a04b65af1a3532d190996eed9c806fdbede9a9334975dc8e5dd",
    "currentSha256": "a50b3e75396a614517240d70fbea8ebee9aa60505cd64b5f86e8dccb054f0152"
  },
  "src/level-dropship-slots-v188.js": {
    "previousSha256": "6103bed0a62aefb0da1f86e56737281e1ceb059cbaab38354edd32718eb3dfe4",
    "currentSha256": "d3e4c41a58848e606e2a56c298e3d00a2003628e2b9ab44b039145b3d4689693"
  },
  "src/mission-dropship-handover-v188.js": {
    "previousSha256": "33105db7fba9625779121edbb5ccdb1cce6ba0f1f1dd93069e064750b30243c7",
    "currentSha256": "a9254499a4bf318b3cf9a0535d20ff72ec65916ea8532701829db82390fd2326"
  },
  "src/mission-insertion-ui-v62.js": {
    "previousSha256": "b55874f7a3b8d7eeb933cdaedce431517920d60dd18b46895088dc4e211d5591",
    "currentSha256": "c875da1636078baa8ef2e84059112579d7d6945eef75b23430cd29dfb32fa2ce"
  },
  "src/player-surfaces-v110.js": {
    "previousSha256": "88cf09a67c5fc21a7a55c49209dcdd5c84b9362f21e1618a7b30aed11c5453d4",
    "currentSha256": "4b0772b9ffc5d616635b4704d7a88c8cd1bb16fafbbb599293fb9000c65ea160"
  },
  "src/save.js": {
    "previousSha256": "6b8a71b39143f289775ad5b8a497fbdbcddacec774bb2387904d030274c1f125",
    "currentSha256": "711bc839d8f57c6390c6d5752ba82773bdd36f9e8743ea16a623115ec593a4e2"
  },
  "src/story-act5-state-v188.js": {
    "previousSha256": "b6492959505e1193548c9bc86e0c10c469229dc7b17800e7185b5c1a5168b70b",
    "currentSha256": "59686d15f83e83dcec473bfc5315c79df18bec2c8e4582416751b4129d3c8f61"
  },
  "src/story-act5-v188.js": {
    "previousSha256": "fcfa4b3c538ccf658ed9199231705ab20ac13df62cb20930683d94f65a0748ce",
    "currentSha256": "f4edd7429ba6ef4fc715b37ca0383003a040838010e68340d7a9bf53b38613ab"
  },
  "src/story-campaign-v188.js": {
    "previousSha256": "9a2f8d96989a654fa231f5990bfe9f7341a0522f9b3e204ed878d9c6208f0e88",
    "currentSha256": "eaaf4a702789c5d997ee61e61c2e29c1747ab4da04f53cf69276bd2c2739d602"
  },
  "src/xeno-trials-acid-pools-v152.js": {
    "previousSha256": "1995962ffc6618f7a94910f6f49f92a2560b4562a033deea418930201d22354b",
    "currentSha256": "35e3c771aae245986cf3e22b92514380874db68a5843e45f956629273012be56"
  },
  "src/xeno-trials-arena-layers-v119.js": {
    "previousSha256": "3a2a12a55d1398cc16d039664c61f278a7b9f09779a92994c5efc79139bde2c8",
    "currentSha256": "1bac81e30e980bf6f5f3b982290c63600a3ed75f108a4324c779a207535caae4"
  },
  "src/xeno-trials-data-v96.js": {
    "previousSha256": "14e11161a71b2a65a70c085f17e4c169df2f89b3cc196bc8aeaec07af1baf5be",
    "currentSha256": "35187237611c078a13f9710c72e8d211fce5db1be63e45d7f4b17f4904f3bb7d"
  },
  "src/xeno-trials-engine-v96.js": {
    "previousSha256": "48e4e6cc8091e2f266f0b6831eb5d08f523a9acc27ba1f23cea3f227aaf0a007",
    "currentSha256": "c8cbc099dbd72e1c7e7bb651f88599e41f9066fb80a6643bf46343944eb1e9c2"
  },
  "src/xeno-trials-modes-v119.js": {
    "previousSha256": "756af6bc90755f16a6afdf3e256082a3281698045ff16a642f2e8e2e0fce4dfd",
    "currentSha256": "03485b8db260cdddbbce04ab4c2f622bccef7c7fa1e615043b605d35d406e232"
  },
  "src/xeno-trials-progress-v96.js": {
    "previousSha256": "168a272b5c8b82cc4e5770cc48e261bd2725984eafeba566363b9b488a5da0fa",
    "currentSha256": "9d2384a6e568d63ecc1d0280e03bf6ed6b166b9a86d227dd7e912d81920bc8bc"
  },
  "src/xeno-trials-rig-v154.js": {
    "previousSha256": "c380d8b4613ef37cb978880050c37a183b4113bfa7e833817810fc95ef1a93a5",
    "currentSha256": "014776eebd5748f5b1b16fd04c0e1cad419e4a7a497b2f922f86817801be887f"
  },
  "src/xeno-trials-runtime-v96.js": {
    "previousSha256": "ef87fa84ba5f085cd0fc973b40dfeb11cf832f88b5168e259c2bc406303a2867",
    "currentSha256": "9725d80048699a6399b69a765c9d6b4dc3451014bf049b9b9f92484e53bdf6a3"
  },
  "src/xeno-trials-scale-v110.js": {
    "previousSha256": "1980a559dec2c744f841b0557b911464a178cf67b8245c0fe7dcd274aea39b81",
    "currentSha256": "de01e4cf4c1e63693b3d7599c97e9d5af45a85ce9cc8a2a071582e37deed794c"
  },
  "src/xeno-trials-stage-motion-v147.js": {
    "previousSha256": "9a23ffd03d4997f14d81c4184000e47dfdf9d33d500f30a1b001db3600faacd7",
    "currentSha256": "4f7313115c2fb5e420ac86d5af537507a18a4e3f0542efd97a41dce582a9e847"
  },
  "src/xeno-trials-ui-v96.js": {
    "previousSha256": "205e7446f0f0ca4a92e33ed200fd2eedd9b0dfeeb4c61529a1e679dab1a000a1",
    "currentSha256": "ee90244bfe1a80290197d17533bc34660637c30632c1f7623eff6ab85c3e3ca0"
  },
  "sw.js": {
    "previousSha256": "41c8c1094fd4ae3edd95abb3d3921de4342e6475aed0eada96f97f0c36321eb4",
    "currentSha256": "abecd3ecad3c160175d2af1816b07aaf98f360bc87990c78b591f2d7f43e5985"
  },
  "xeno-trials-fullscreen-v119.css": {
    "previousSha256": "972fb0679d394bfb5426a84cc748657a72ca0d567cad037899fd010819800712",
    "currentSha256": "bd5ef078de84720b02e7a08522b89fc11632aa606bef3eac5287a545a99c324a"
  },
  "xeno-trials-v96.css": {
    "previousSha256": "8f682f017674d4078583fec043d4e85721700884606a7d16889d8d4512d7998a",
    "currentSha256": "a1744d001fadd8a2ea3917b5c79cfcc3a4794987c0ef9e8310c23389b0acb15c"
  }
} });
// END XENO TRIALS JOIN RECEIPTS
export const TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188 = freeze({
  "baseline": "ded6ef34dd35a659313e9361b407f6b94b62fb96",
  "successors": {
    "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
      "previousSha256": "c1c14fc8e850a7bbfd4946196edd233db6324b7898c4878298554f2ad0bbd438",
      "currentSha256": "d03dcc6e75b22a69890b389d5c0ef84311d5ea2e12d9dbe8233c2ff78bd419cb"
    },
    "package.json": {
      "previousSha256": "3066253712f123ae2008fced03a1473b849f67a8d364bbc0864f30588f35d609",
      "currentSha256": "b74e5e7d949a29976fb562f1a8215a01426a1b950301cc37b25939421e2becf1"
    },
    "scripts/verify-audit-continuation-v157.mjs": {
      "previousSha256": "a3230677a0ea8bcafab21917da2823e49777bcc2c1e406bb9dc6b91e396c2155",
      "currentSha256": "a92ffa1c385c12159293a1d18d36c881180f48291bc58947076ed2f7b67784d3"
    },
    "scripts/verify-audit-continuation-v158.mjs": {
      "previousSha256": "80f296774fff4bbd1eaecca48fdd4c63cb1beaca03ed0c44a3d674ebfae87a28",
      "currentSha256": "09977386675167a50d8e399532c948c344d753237ca50383d93bb5cda112fc68"
    },
    "scripts/verify-audit-v143.mjs": {
      "previousSha256": "3a2ad226bf0ae4076e3fbd526f2d03fa3bd7459f8811f0d27d6a1a33a3626e85",
      "currentSha256": "38cc0350f341d18a3536944e19391285e4756195e3c82af6e923d4072a615d08"
    },
    "scripts/verify-black-cocoon-presentation-v158.mjs": {
      "previousSha256": "a35cab0472f11b1e656aec251a035dc1cd3a4b9df6e6803ab0f2da83ab313cb1",
      "currentSha256": "cb52f555918b941d0eed87a3e4b10fcfdab8563536e47187b8b42dad3db6e930"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "0d663f627b878c05ecd067c417d2bd2895ffeede9de0b21e6ad3852134d10a7d",
      "currentSha256": "d3e7ef7d42dc48cd69d6f0ffc7c577545b5682a82f0411ea753c1b44c248268a"
    },
    "src/ecosystem-missions-v131.js": {
      "previousSha256": "34fc724a8b7c758153b42f7f1542512056a12aef6b6c119f6e8cea7ce9fa5c7d",
      "currentSha256": "bced08c735be1c49f01afab83cc0e134960f2bdc90a480dca2d056eabc3e0be3"
    },
    "src/ecosystem-systems-v131.js": {
      "previousSha256": "577e12210793abf2ea46df9afef38aeab26bbce12a960073379cf6a639993d5c",
      "currentSha256": "b3719aaea2f23be2a031c15cb66d857386f11a3f410230d5885f6c9f21e16272"
    },
    "src/i18n-en-catalog-v185.js": {
      "previousSha256": "4b3e6552f422a1a7d30b9940eebd81880e292bcbae5067cf1e2697284dbca917",
      "currentSha256": "11a0ec21f4ac8a04b65af1a3532d190996eed9c806fdbede9a9334975dc8e5dd"
    },
    "sw.js": {
      "previousSha256": "e31f82016ae97434c8805dd00d35279c6246bc9c52ddc32faa3c678996db8d22",
      "currentSha256": "41c8c1094fd4ae3edd95abb3d3921de4342e6475aed0eada96f97f0c36321eb4"
    }
  },
  "addedSourceSuccessors": {
    "scripts/verify-queen-mother-art-v188.mjs": {
      "previousSha256": "889d7e7a91eecb6fa9ba780982a164c458c394b8174d59514ce8baf5125f15b3",
      "currentSha256": "2bfd94395adcd5ca0b6d6b6ae9ed8dd9bf9d550e3cb90b3dc52b903e63de2b24"
    }
  },
  "addedSources": {
    "scripts/verify-queen-mother-choir-art-v188.mjs": "c2d672e1d1e671042d799712f94bbcdac86a66a39ee2a358beaeab403f20c81d",
    "src/queen-mother-choir-art-v188.js": "d5258e5b3c571f571a87ca4b1345d32c79504888c994fa0774adef68bdf85ed6"
  }
});

export const TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_REGISTRY_V188 = freeze({
  baseline: 'ded6ef34dd35a659313e9361b407f6b94b62fb96',
  baselineRegistry: {
    path: 'src/special-operations-v131.js',
    sha256: '433ddc7b821c98b973c10fc9e3aa39bc66c77e8cf9364dd9f1a25d03b70b08af',
    declarationsSha256: '46cdb671b6cc3cb1591c5fe4cd124d85335278d93b79a386cddbd9cc4995618a'
  },
  operationId: 'queen-mother-song',
  projection: 'identity',
  removedDebts: [],
  newChangedIds: [],
  historicalChangedIds: ['cargo-brutal', 'broodstorm', 'queen-mother-song'],
  previousRemainingMechanics: ['complete-royal-cast'],
  currentRemainingMechanics: ['complete-royal-cast'],
  previousCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 },
  currentCounts: { total: 21, effective: 2, partial: 19, missing: 0, playable: 21 }
});

export function verifyQueenMotherChoirRegistryContinuationV188(operations, counts, readSource = readRepository) {
  const continuation = TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_REGISTRY_V188;
  assert.equal(sha(readSource(continuation.baselineRegistry.path)), continuation.baselineRegistry.sha256,
    'Choir presentation must retain the exact R registry source bytes');
  const matches = operations.filter(operation => operation.id === continuation.operationId);
  assert.equal(matches.length, 1, 'Exactly one Queen Mother registry declaration is required');
  const operation = matches[0];
  assert.deepEqual(operation.remainingMechanics, continuation.currentRemainingMechanics,
    'Choir presentation leaves the complete royal cast debt open');
  assert.equal(operation.implementationStatus, 'partial', 'Choir presentation does not promote Queen Mother');
  assert.equal(operation.canonExact, false, 'Choir presentation assigns no canonical identity');
  assert.equal(operation.playable, true);
  assert.deepEqual(counts, continuation.currentCounts, 'Choir presentation does not change registry counts');
  const declarations = operations.map(entry => Object.keys(entry).filter(key => key !== 'campaign').sort()
    .map(key => [key, entry[key]]));
  assert.equal(sha(JSON.stringify(declarations)), continuation.baselineRegistry.declarationsSha256,
    'Choir presentation must preserve every exact R registry declaration');
  const historical = verifyQueenMotherGuardRegistryContinuationV188(operations, counts, readSource);
  assert.deepEqual(historical.currentCounts, continuation.previousCounts);
  assert.deepEqual(historical.changedIds, continuation.historicalChangedIds);
  assert.equal(new Set(historical.changedIds).size, historical.changedIds.length);
  assert.equal(historical.unchangedOperations, 18);
  return historical;
}

export function reviewedTantalusPrioritiesDigestV188(path, endpoint) {
  const historical = TANTALUS_PRIORITIES_SUCCESSORS_V188[path];
  const receipt = historical || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path];
  let current = endpoint;
  if (receipt) {
    assert.equal(current, receipt.previousSha256,
      (historical ? 'Broken V187-to-V188 source chain: ' : 'Broken published-V188 source chain: ') + path);
    assert.ok(validHash(receipt.currentSha256), 'Invalid V188 source digest: ' + path);
    assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A V188 successor must identify changed bytes: ' + path);
    current = receipt.currentSha256;
  }
  const prologue = TANTALUS_PRIORITIES_PROLOGUE_V188.successors[path];
  if (prologue) {
    assert.equal(current, prologue.previousSha256, 'Broken d54f13cc-to-prologue source chain: ' + path);
    assert.ok(validHash(prologue.currentSha256), 'Invalid prologue source digest: ' + path);
    assert.notEqual(prologue.currentSha256, prologue.previousSha256, 'A prologue successor must identify changed bytes: ' + path);
    current = prologue.currentSha256;
  }
  const quay = TANTALUS_PRIORITIES_QUAY_V188.successors[path];
  if (quay) {
    assert.equal(current, quay.previousSha256, 'Broken ee565717-to-quay source chain: ' + path);
    assert.ok(validHash(quay.currentSha256), 'Invalid quay source digest: ' + path);
    assert.notEqual(quay.currentSha256, quay.previousSha256, 'A quay successor must identify changed bytes: ' + path);
    current = quay.currentSha256;
  }
  const cargoAbyss = TANTALUS_PRIORITIES_CARGO_ABYSS_V188.successors[path];
  if (cargoAbyss) {
    assert.equal(current, cargoAbyss.previousSha256, 'Broken 232693f1-to-cargo-abyss source chain: ' + path);
    assert.ok(validHash(cargoAbyss.currentSha256), 'Invalid cargo-abyss source digest: ' + path);
    assert.notEqual(cargoAbyss.currentSha256, cargoAbyss.previousSha256, 'A cargo-abyss successor must identify changed bytes: ' + path);
    current = cargoAbyss.currentSha256;
  }
  const hadal = TANTALUS_PRIORITIES_HADAL_V188.successors[path];
  if (hadal) {
    assert.equal(current, hadal.previousSha256, 'Broken a3634de7-to-hadal source chain: ' + path);
    assert.ok(validHash(hadal.currentSha256), 'Invalid hadal source digest: ' + path);
    assert.notEqual(hadal.currentSha256, hadal.previousSha256, 'A hadal successor must identify changed bytes: ' + path);
    current = hadal.currentSha256;
  }
  const broodstorm = TANTALUS_PRIORITIES_BROODSTORM_V188.successors[path];
  if (broodstorm) {
    assert.equal(current, broodstorm.previousSha256, 'Broken 361e4067-to-broodstorm source chain: ' + path);
    assert.ok(validHash(broodstorm.currentSha256), 'Invalid broodstorm source digest: ' + path);
    assert.notEqual(broodstorm.currentSha256, broodstorm.previousSha256, 'A broodstorm successor must identify changed bytes: ' + path);
    current = broodstorm.currentSha256;
  }
  const queenMother = TANTALUS_PRIORITIES_QUEEN_MOTHER_V188.successors[path];
  if (queenMother) {
    assert.equal(current, queenMother.previousSha256, 'Broken b9aee06a-to-queen-mother source chain: ' + path);
    assert.ok(validHash(queenMother.currentSha256), 'Invalid queen-mother source digest: ' + path);
    assert.notEqual(queenMother.currentSha256, queenMother.previousSha256, 'A queen-mother successor must identify changed bytes: ' + path);
    current = queenMother.currentSha256;
  }
  const guards = TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188;
  const guard = guards.successors[path] || guards.addedSourceSuccessors[path];
  if (guard) {
    assert.equal(current, guard.previousSha256, 'Broken c1d4c636-to-queen-mother-guard source chain: ' + path);
    assert.ok(validHash(guard.currentSha256), 'Invalid queen-mother-guard source digest: ' + path);
    assert.notEqual(guard.currentSha256, guard.previousSha256, 'A queen-mother-guard successor must identify changed bytes: ' + path);
    current = guard.currentSha256;
  }
  const choirs = TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188;
  const choir = choirs.successors[path] || choirs.addedSourceSuccessors[path];
  if (choir) {
    assert.equal(current, choir.previousSha256, 'Broken ded6ef34-to-queen-mother-choir source chain: ' + path);
    assert.ok(validHash(choir.currentSha256), 'Invalid queen-mother-choir source digest: ' + path);
    assert.notEqual(choir.currentSha256, choir.previousSha256, 'A queen-mother-choir successor must identify changed bytes: ' + path);
    current = choir.currentSha256;
  }
  const lead = TANTALUS_PRIORITIES_LEAD_CONTINUATION_V188.successors[path];
  if (lead) {
    assert.equal(current, lead.previousSha256, 'Broken b6e01ef1-to-lead-continuation source chain: ' + path);
    assert.ok(validHash(lead.currentSha256), 'Invalid lead-continuation source digest: ' + path);
    assert.notEqual(lead.currentSha256, lead.previousSha256, 'A lead-continuation successor must identify changed bytes: ' + path);
    current = lead.currentSha256;
  }
  if (!Object.hasOwn(TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188.successors, path)) return current;
  const join = TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188.successors[path];
  assert.equal(current, join.previousSha256, 'Broken 0d1d9950-to-xeno-trials-join source chain: ' + path);
  assert.ok(validHash(join.currentSha256), 'Invalid xeno-trials-join source digest: ' + path);
  assert.notEqual(join.currentSha256, join.previousSha256, 'A xeno-trials-join successor must identify changed bytes: ' + path);
  return join.currentSha256;
}

export function verifyTantalusPrioritiesV188(readSource = readRepository) {
  const continuation = TANTALUS_PRIORITIES_CONTINUATION_V188;
  for (const path of Object.keys(continuation.successors)) {
    assert.equal(Object.hasOwn(TANTALUS_PRIORITIES_SUCCESSORS_V188, path), false,
      'A published-V188 receipt must not replace a historical receipt: ' + path);
  }
  const successors = new Map([...Object.entries(TANTALUS_PRIORITIES_SUCCESSORS_V188), ...Object.entries(continuation.successors)]);
  const prologue = TANTALUS_PRIORITIES_PROLOGUE_V188;
  for (const [path, receipt] of Object.entries(prologue.successors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(Object.hasOwn(continuation.addedSources, path), false, 'A prologue successor cannot replace a separately added V188 source: ' + path);
    if (successors.has(path)) assert.equal(receipt.previousSha256, successors.get(path).currentSha256,
      'Broken historical-to-d54f13cc endpoint: ' + path);
    else successors.set(path, receipt);
  }
  const quay = TANTALUS_PRIORITIES_QUAY_V188;
  for (const [path, receipt] of Object.entries(quay.successors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(Object.hasOwn(continuation.addedSources, path) || Object.hasOwn(prologue.addedSources, path), false,
      'A quay successor cannot replace a separately added V188 source: ' + path);
    const previous = prologue.successors[path] || successors.get(path);
    if (previous) assert.equal(receipt.previousSha256, previous.currentSha256,
      'Broken historical-to-ee565717 endpoint: ' + path);
    else successors.set(path, receipt);
  }
  const cargoAbyss = TANTALUS_PRIORITIES_CARGO_ABYSS_V188;
  for (const [path, receipt] of Object.entries(cargoAbyss.successors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(Object.hasOwn(continuation.addedSources, path) || Object.hasOwn(prologue.addedSources, path)
      || Object.hasOwn(quay.addedSources, path), false,
    'A cargo-abyss successor cannot replace a separately added V188 source: ' + path);
    const previous = quay.successors[path] || prologue.successors[path] || successors.get(path);
    if (previous) assert.equal(receipt.previousSha256, previous.currentSha256,
      'Broken historical-to-232693f1 endpoint: ' + path);
    else successors.set(path, receipt);
  }
  const hadal = TANTALUS_PRIORITIES_HADAL_V188;
  for (const [path, receipt] of Object.entries(hadal.successors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(Object.hasOwn(continuation.addedSources, path) || Object.hasOwn(prologue.addedSources, path)
      || Object.hasOwn(quay.addedSources, path) || Object.hasOwn(cargoAbyss.addedSources, path), false,
    'A hadal successor cannot replace a separately added V188 source: ' + path);
    const previous = cargoAbyss.successors[path] || quay.successors[path] || prologue.successors[path] || successors.get(path);
    if (previous) assert.equal(receipt.previousSha256, previous.currentSha256,
      'Broken historical-to-a3634de7 endpoint: ' + path);
    else successors.set(path, receipt);
  }
  const broodstorm = TANTALUS_PRIORITIES_BROODSTORM_V188;
  for (const [path, receipt] of Object.entries(broodstorm.successors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(Object.hasOwn(continuation.addedSources, path) || Object.hasOwn(prologue.addedSources, path)
      || Object.hasOwn(quay.addedSources, path) || Object.hasOwn(cargoAbyss.addedSources, path)
      || Object.hasOwn(hadal.addedSources, path), false,
    'A broodstorm successor cannot replace a separately added V188 source: ' + path);
    const previous = hadal.successors[path] || cargoAbyss.successors[path] || quay.successors[path]
      || prologue.successors[path] || successors.get(path);
    if (previous) assert.equal(receipt.previousSha256, previous.currentSha256,
      'Broken historical-to-361e4067 endpoint: ' + path);
    else successors.set(path, receipt);
  }
  const queenMother = TANTALUS_PRIORITIES_QUEEN_MOTHER_V188;
  for (const [path, receipt] of Object.entries(queenMother.successors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(Object.hasOwn(continuation.addedSources, path) || Object.hasOwn(prologue.addedSources, path)
      || Object.hasOwn(quay.addedSources, path) || Object.hasOwn(cargoAbyss.addedSources, path)
      || Object.hasOwn(hadal.addedSources, path) || Object.hasOwn(broodstorm.addedSources, path), false,
    'A queen-mother successor cannot replace a separately added V188 source: ' + path);
    const previous = broodstorm.successors[path] || hadal.successors[path] || cargoAbyss.successors[path]
      || quay.successors[path] || prologue.successors[path] || successors.get(path);
    if (previous) assert.equal(receipt.previousSha256, previous.currentSha256,
      'Broken historical-to-b9aee06a endpoint: ' + path);
    else successors.set(path, receipt);
  }
  const guards = TANTALUS_PRIORITIES_QUEEN_MOTHER_GUARD_V188;
  const historicalAddedSources = new Map([...Object.entries(continuation.addedSources), ...Object.entries(prologue.addedSources),
    ...Object.entries(quay.addedSources), ...Object.entries(cargoAbyss.addedSources), ...Object.entries(hadal.addedSources),
    ...Object.entries(broodstorm.addedSources), ...Object.entries(queenMother.addedSources)]);
  assert.deepEqual(Object.keys(guards.addedSourceSuccessors), ['scripts/verify-queen-mother-art-v188.mjs'],
    'The guard continuation may supersede only the explicitly reviewed Q notice test');
  for (const [path, receipt] of Object.entries(guards.successors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(historicalAddedSources.has(path), false,
      'A guard successor cannot replace a separately added V188 source: ' + path);
    const previous = queenMother.successors[path] || broodstorm.successors[path] || hadal.successors[path]
      || cargoAbyss.successors[path] || quay.successors[path] || prologue.successors[path] || successors.get(path);
    assert.ok(previous, 'A guard successor needs a reviewed historical endpoint: ' + path);
    assert.equal(receipt.previousSha256, previous.currentSha256, 'Broken historical-to-c1d4c636 endpoint: ' + path);
  }
  for (const [path, receipt] of Object.entries(guards.addedSourceSuccessors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(successors.has(path) || Object.hasOwn(guards.successors, path) || Object.hasOwn(guards.addedSources, path), false,
      'An added-source successor cannot disguise or duplicate another source: ' + path);
    assert.equal(receipt.previousSha256, queenMother.addedSources[path], 'Broken Q added-source predecessor: ' + path);
    assert.notEqual(receipt.currentSha256, receipt.previousSha256,
      'An added-source successor must identify changed bytes: ' + path);
  }
  const choirs = TANTALUS_PRIORITIES_QUEEN_MOTHER_CHOIR_V188;
  const priorAddedSources = new Map([...historicalAddedSources, ...Object.entries(guards.addedSources)]);
  assert.deepEqual(Object.keys(choirs.addedSourceSuccessors), ['scripts/verify-queen-mother-art-v188.mjs'],
    'The choir continuation may supersede only the explicitly reviewed Q notice test');
  for (const [path, receipt] of Object.entries(choirs.successors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(priorAddedSources.has(path), false,
      'A choir successor cannot replace a separately added V188 source: ' + path);
    const previous = guards.successors[path];
    assert.ok(previous, 'A choir successor needs a reviewed R endpoint: ' + path);
    assert.equal(receipt.previousSha256, previous.currentSha256, 'Broken historical-to-ded6ef34 endpoint: ' + path);
  }
  for (const [path, receipt] of Object.entries(choirs.addedSourceSuccessors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(successors.has(path) || Object.hasOwn(choirs.successors, path) || Object.hasOwn(choirs.addedSources, path), false,
      'A choir added-source successor cannot disguise or duplicate another source: ' + path);
    assert.ok(Object.hasOwn(guards.addedSourceSuccessors, path), 'A choir added-source successor must preserve its R predecessor');
    assert.equal(receipt.previousSha256, guards.addedSourceSuccessors[path].currentSha256,
      'Broken R added-source predecessor; Unreviewed V188 source bytes: ' + path);
    assert.notEqual(receipt.currentSha256, receipt.previousSha256,
      'A choir added-source successor must identify changed bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.equal(sha(readSource(path)), reviewedTantalusPrioritiesDigestV188(path, receipt.previousSha256),
      'Unreviewed V188 source bytes: ' + path);
  }
  const addedSources = new Set();
  for (const [path, digest] of [...Object.entries(continuation.addedSources), ...Object.entries(prologue.addedSources),
    ...Object.entries(quay.addedSources), ...Object.entries(cargoAbyss.addedSources), ...Object.entries(hadal.addedSources),
    ...Object.entries(broodstorm.addedSources), ...Object.entries(queenMother.addedSources), ...Object.entries(guards.addedSources),
    ...Object.entries(choirs.addedSources)]) {
    assert.equal(successors.has(path) || addedSources.has(path), false, 'A new V188 source cannot replace a successor or added source: ' + path);
    addedSources.add(path);
    assert.ok(validHash(digest), 'Invalid new V188 source digest: ' + path);
    const endpoint = Object.hasOwn(guards.addedSourceSuccessors, path) || Object.hasOwn(choirs.addedSourceSuccessors, path)
      ? reviewedTantalusPrioritiesDigestV188(path, digest) : digest;
    assert.equal(sha(readSource(path)), endpoint, 'Unreviewed V188 source bytes: ' + path);
  }
  const join = TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188;
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_LEAD_CONTINUATION_V188.successors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    // The lead endpoint is the reviewed 0d1d9950 predecessor of the Xeno Trials join.
    const joined = join.successors[path];
    if (joined) assert.equal(joined.previousSha256, receipt.currentSha256, 'Broken lead-to-xeno-trials-join endpoint: ' + path);
    assert.equal(sha(readSource(path)), joined ? joined.currentSha256 : receipt.currentSha256,
      'Unreviewed lead-continuation source bytes: ' + path);
  }
  assert.match(join.baseline, /^[a-f0-9]{40}$/, 'The Xeno Trials join needs its exact 0d1d9950 baseline');
  for (const [path, receipt] of Object.entries(join.successors)) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A xeno-trials-join successor must identify changed bytes: ' + path);
    assert.equal(sha(readSource(path)), receipt.currentSha256, 'Unreviewed xeno-trials-join source bytes: ' + path);
  }
  return Object.freeze({ successors: successors.size, addedSources: addedSources.size });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  console.log(JSON.stringify(verifyTantalusPrioritiesV188()));
}
