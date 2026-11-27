import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoSelectionDigestV214, xenoSelectionRuntimeSourcesV214, verifyXenoSelectionV214 } from './audit-xeno-selection-v214.mjs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_GAMEPLAY_BASELINE_V213 = 'de7d162658f14b3e5820a5bd5b1e72deeafdcc24';
export const XENO_GAMEPLAY_SUCCESSORS_V213 = freeze({
  ".github/workflows/xeno-trials-standalone-v207.yml": {
    "kind": "tooling",
    "sha256": "a58ac1fb18853e405d57aa29206c60cd470c78c26b97424c0ad0a3dca111703c",
    "previousSha256": "92a20b343089f0736cf3e900fd0cf0949a6b83d436f33f2dffc3846654c6763e"
  },
  "package.json": {
    "kind": "tooling",
    "sha256": "f7d46044e2314eda589d6e6c607e8ca918c3313628cb7622a937f22f919527e9",
    "previousSha256": "a0632f1e01cdedb74bec5a229737cde4dccb243aadceb747a57e2e2799ae5625"
  },
  "scripts/audit-xeno-gameplay-v212.mjs": {
    "kind": "tooling",
    "sha256": "32ba58fd20d1162675bba8321c30e5cecb65e1bc69ad9b970d6784469cfcbff1",
    "previousSha256": "f64dd364566d125f0f1cc13435b45fd5657159dcd91abedaf7ba8b41df48366d"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "97c7bbec335a589d43ec5891b750fd877ad27b667b8948424b7491d21283bd2c",
    "previousSha256": "2afb931b669bec43403e13462586ff328dd72fed023a4af5f1a09ac16eadad0a"
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "1252a68f0f567dac5ee33b9d0cfe3a015d573e5f196303766e515dc948b13791",
    "previousSha256": "08084cc018404f9166204225457b5ed803990e99b73db5c99f66771c96cdb7e8"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "891d48ee4da8e3ca8f3ec8f40da21a60791506bcc1911a94a8d7a5c8b7ef8979",
    "previousSha256": "b49d5863043f832e9a7693a00d693bf49ce4ece4acf1aaa9c815fcaa632a3f02"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "da9ca7abfee5b5f5ae7dc1c535f209499f85b00171abcefa92f514a613d31857",
    "previousSha256": "c9cd5f1057a588ffdafc35ed8a25dc6e74c5ab1364462d506fa25b2c075ae5a7"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "fb1ae3b003f80c57579aeefe4899515a838b6796f191666ef82e53e485077405",
    "previousSha256": "7e25dea3ceb98f8e368f4da3ad57ea094d29a033766c687bfd2bacd83bc2ab7f"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "8a3c9473baa3048b6ac75af5b65fe29daea0b9b0d72d66e7a02a4b8b582b6704",
    "previousSha256": "eb0c4ab451a0b8ba586de611c40de645959b201ed9a90bd309df2b9d40de818b"
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "e59e39a4ada0eb58cbb185dbd7c48c63928e7db55bc7217321d27c1198ba8d46",
    "previousSha256": "ebc74e52b443165c7e40927271c4b0a2d777f26ccc1f108cf1bbea859a6cad05"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "6fa8a3b4fceb54f82e551a28fce59ec6695dae416a4a73fe8508fb01899c0419",
    "previousSha256": "63e62216eba7eb24058015da1ae7a253903a2ce236622e530a306efec746ce57"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "e25cf960b78ffd198e11a1fe4b501c74274709d27d543be0b27297ac4ba5f554",
    "previousSha256": "94c8a94b49b5e499068febac8d9f0f53b848bf5b6cc25d36685ebc80d9453b6c"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "c5a869469b39280ad280748c95a20896d95f853adcb575d2551d2f57bca923c4",
    "previousSha256": "dabe0ae25a5d65604bbdccdfa88f9403c6fa32269f24efd83a366cd28f67dfeb"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "33d6774473c51ac176e1dfcd6d92bbe0b8de25fd7537410594a4ca0939760e4e",
    "previousSha256": "94bb2ef9ad5d1b6ab027cc64e7e166b6d1c8ca2c01e7f50f896d42e4c01b0769"
  },
  "scripts/verify-xeno-gameplay-audit-v208.mjs": {
    "kind": "tooling",
    "sha256": "0be62b2329b8df784ee94861b5caf860f7ceb9c6905196ace6928206c81ca3ff",
    "previousSha256": "8f83ddeba80f0a30127d1c8e9ac036f3ed2b6228adde3ce514ad930cf960554f"
  },
  "scripts/verify-xeno-gameplay-audit-v209.mjs": {
    "kind": "tooling",
    "sha256": "36ea5eb4a99433e3b001b7a40f6e2cfb9a9f19d7ad2346bbbf7d14bd06039069",
    "previousSha256": "da6585babb150e76681777d1442c41170e5c193dd2e1bcf507820b201472a20a"
  },
  "scripts/verify-xeno-gameplay-audit-v212.mjs": {
    "kind": "tooling",
    "sha256": "1e88640256689728c99d5bce7735210b3e9c1b2cc34e4b33478ebb4e0117c25a",
    "previousSha256": "2c284fcf19a3da3b50a5924c7acc3cc16c35ca6eff200f8d9367395114e360d0"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "ff6743de01097f6f8e41d271b536b4e31bd5be2cdba80b4ce8b393cc79a4730b",
    "previousSha256": "b496eef1452f4d21a7a85aff562f582d8c6309e9466c443beccbbdf4936e4d8b"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "e5bbbf6eceed34e0b9bbd9259fa09f796d0482b5771b5b065127f4ee841b3d4f",
    "previousSha256": "dbbbd77681e2f72ba41bf61f1f06adf7e1485201ead4f02a3d5111c65c45846e"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "06c514b36885fc56bf07807e38af0edf0dc669f435856c1f3180b59bade9f526",
    "previousSha256": "8867539ad034b4730f68cf6f6a774e39bd1c9a3ba1290c1890bd5509135e872b"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "bcb22ae263298e92afaa20f3269725bff3a26cc481b8b8eb51fe5f081c59340d",
    "previousSha256": "cb8b3b19705e07f23daebb3c29a9bef9a0a6ffaefc10cf08bfe643d5e0aff125"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "37a3cd0ea3d7568784f06387022f54cacd1288b79f88a60899ff2caffdbf2b1f",
    "previousSha256": "d9a0f1dafea8d825d12573a78eee8916601b9ecc95d15c973d8537ca817b85ef"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "468c8656de5860e5403621d16a24718ef4c3ac9136e8e4790122a88003f12953",
    "previousSha256": "2e703eb158dae0167bf61ff25fbba4254b43f709c2de2e3d0f7c9cad0e2380cf"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "16657c9a36df7e8150e9e44eca45ea5dae74b4edfb12faab1de3ef5ec8320284",
    "previousSha256": "64649a5961a8d0be219fada6ec94b369897ff4f229461bf42a20dfcae0de46f2"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "c389048fccd2fb534ad441026f10fbcdd943fd7e2539f479ad0a89f3df6f496b",
    "previousSha256": "78866f30e4be1013b21639f86571fc12e1fd64e826dd88fe800e17617710e5dd"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "8f0a2fc41066b813cb9bc324a4bbaab409419934e1d712683a06eec65259cf6d",
    "previousSha256": "0ecb077313d9fd2b220d0a8d75509382715086e2a04f063cf03aceb12ae1367d"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "437697ea7adf4280bce1e439414f4e2f8137f3ac0e6e03051b96d16d216eb17a",
    "previousSha256": "3495c51ac3c9ec886ab63160c5f55032a621ce0ff1e547699caba836577d979b"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "43b6bbc9615e59cc84be7d02017e5cd8d501bdf9ede1ab6a19f42a62182646a1",
    "previousSha256": "08685ff4e4dbe9cc33bdf0365a07cad2f701c22c78ff6b4e244e0ef3a42bfbb7"
  },
  "scripts/verify-xeno-trials-horde-ui-v180.mjs": {
    "kind": "tooling",
    "sha256": "ea34d0021184696e50a4682b037d1d709b7023a9ac1be457904fbc7179739386",
    "previousSha256": "ba82296cefeedbd6395b1d919bd6a10049af7572b23bb53a03ef050371d9da02"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "e4daa14d083ea937ce680ef5f7f7af2539606d5dc760088f23acd7d2b010d951",
    "previousSha256": "09d24f6846ce94b911ea2e34b494d0599e680051f672d64506d1d5dc1f451447"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "37250e12d3470055cc723fe17be3d0c1bf59ca1294a36e1706f11ba73f6d4288",
    "previousSha256": "b2ee5655fed2d821f9c54495ebc14913d98bb18f2f1818354b2051fafd49b65f"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "1a0f5833f44eafd44f9a58a0dd0af0cd312ca7c73c0806eb85b054233a460cc2",
    "previousSha256": "a008163742cca4f4eab690bed201de88064960424bcb76086343dbd4c2facf8a"
  },
  "src/xeno-trials-capture-v163.js": {
    "kind": "runtime",
    "sha256": "25a6254899e601bb917fa1f61b0d67af5e2242cf9a51bb70f5a1b523c0673a14",
    "previousSha256": "f7aeb002b6207bd074549f3e1d6959108d23268d7c12fa1765d788a6ba2079bd"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "6463f157095eac9e2873e7609ec9ed3b891a6e2a11c22bf421a52f53b0dc3d2c",
    "previousSha256": "6fcbf72ba6bbb04ca9c76b5922d2f42b3a2929e01f756138612e9a045a8d5f50"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "51e873c10c72c82dccea9214f9897ce831ce6bac83ca208eeaa622d6b0ca1273",
    "previousSha256": "fb7912cb88c0ffe670579f6c6fe7375a29361d1b277340739a6476de838ae35e"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "c47479fbea2cc830428f1efc0efe1eb91121ebb0816bd16baab60f62977e7898",
    "previousSha256": "bf0b81981c3099f4e93036523fcfa4872f35d35c48c0cd348daca9d79a32a67f"
  },
  "src/xeno-trials-finishers-v208.js": {
    "kind": "runtime",
    "sha256": "d94dd0a1ec0f44a66379efbe9f92f64341f7427f2c505b9077dc084df6ac0c3e",
    "previousSha256": "159b91d115f7a70a5093f7dc06da8c1e7fb510244a89b3e04b3945ccb7788f18"
  },
  "src/xeno-trials-finishers-v212.js": {
    "kind": "runtime",
    "sha256": "96655a9fc5b8b57f34565625e5085e9484edf31086178b78b5eb797ef1868218",
    "previousSha256": "0d0c037871fb1f5c8dab1f1b1d5ff014ef01a65f9faa1ac44e30abe920b14a69"
  },
  "src/xeno-trials-grapple-v153.js": {
    "kind": "runtime",
    "sha256": "32683be6ed15f983c1f11386caafab0da2df18aab22d9b975f20609728e53f5d",
    "previousSha256": "6e7d542504ea6bde0342877d403cca0b88c02d6090022152596f439461f26d4f"
  },
  "src/xeno-trials-horde-checkpoint-v186.js": {
    "kind": "runtime",
    "sha256": "91990133a8a1d43736c2e4d062d30207fcf2d2055188eb360090a0b9a917698e",
    "previousSha256": "319d9b2beb5a9192f1c3dbec833e515b274fb14d82ff5c7620a65e344f71c933"
  },
  "src/xeno-trials-horde-ui-v180.js": {
    "kind": "runtime",
    "sha256": "d763f258f08dabae261c54eff3dd43c9f4ac69707a173d29dd755fec053fff71",
    "previousSha256": "56d91c673b4246c208fe1aa45f125da8b5083a80f549993a1646883a5be45eed"
  },
  "src/xeno-trials-horde-v180.js": {
    "kind": "runtime",
    "sha256": "ca16df3ed8851afabfd25316c2cb6dc202533fdd22c90d041ab7b6cd52db5bee",
    "previousSha256": "1620a7da6f7f45b9ac8d68cfdeeb3e749d4680c1e5361882b518f6b4d974c9c8"
  },
  "src/xeno-trials-movement-v210.js": {
    "kind": "runtime",
    "sha256": "bed35e1c811e221ff58ba58e360cd6efe1f484c8bcdf34677f0f52161164194b",
    "previousSha256": "504b680444de803303a71afc0305a116926122dbec7747e733b30d1811475be3"
  },
  "src/xeno-trials-moveset-v207.js": {
    "kind": "runtime",
    "sha256": "a35092a9615c77262d77bca395e0dfeb1ae273ef08863eddf84ebf0bcc35ed88",
    "previousSha256": "4462d93f398bd1835c80026648e5313590d43561471b4218f5b2f9f650e25b35"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "fc548f529c48b60598a4be3f3c2252675bba39d949e13a499386cae95922702d",
    "previousSha256": "736ba8c14a03859ccf0d5380556abf3fa839dfccc827973970b4fa1b2c05a553"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "9c7cf690c9cc00c7d5d26d2a4510f8b1d90c1c0fae07b78f251f26b637232b9e",
    "previousSha256": "439e7eb91f694b37650623fd5fcfc17e0051823acc827ced753ef7f15c1057c4"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "sha256": "fcf46f34ccee6f5b535db6e3250111a82132db5d6a6f2114c17ca60ceb6aff48",
    "previousSha256": "589e209bb938baf00a1509ceb9d380f696b87dd1675247868b582c4ab94f414c"
  },
  "src/xeno-trials-reinforcements-v201.js": {
    "kind": "runtime",
    "sha256": "3aadf9c5101dbdda89eccf3e6ccdc5dd4e3399d4e16a065c26a5a852a487257b",
    "previousSha256": "c302c1a04b7254248cb598b0c9c32df8330a85c877896bb19cad9545b490b0e1"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "31b5d6a600dce31ae0fbc9dec6f64cf7bac4bc6a417226a5f0515a5b6e720a01",
    "previousSha256": "e7c7fc853bc397b7416a11009999559dc01a01a38ce2ab5ea1dc70e4c9072be8"
  },
  "src/xeno-trials-sprite-atlas-v189.js": {
    "kind": "runtime",
    "sha256": "67028b81b0285bdf40ccb7d4e1350efffa950ca26d5d8a3e864cad4ecd365caa",
    "previousSha256": "6767d93881bbabf91f60a87558278bd44ac343d554fff8314a618d1f10fecf41"
  },
  "src/xeno-trials-stage-hazards-render-v188.js": {
    "kind": "runtime",
    "sha256": "578f36faf3ddd7b4e7ac814f9418a567a521cad97106b6c0e543e33088e3a88b",
    "previousSha256": "17fb03fd50d60254d6ab505e64680378e231a53d0d7e4a866639f3285e8bf94f"
  },
  "src/xeno-trials-stage-hazards-v188.js": {
    "kind": "runtime",
    "sha256": "d6a1df8e41b5ffc567de4fb1d042ee8ca92bed1126373585d362b0bf6958bf79",
    "previousSha256": "cf3514a219aa9c6da4e8bf02fad96e429b42c16ae77e1d9322d48abfab68593a"
  },
  "src/xeno-trials-stage-isolation-v212.js": {
    "kind": "runtime",
    "sha256": "cf5f088e7ff0fc98e84e378000ccf2c421079477685b3a9e5156a9ca21757dac",
    "previousSha256": "e734c01080b2d1d78f06ae1c2f5d12f20054b2f85e7a484dde6b829ad6cc5ae6"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "7cb9edce05901878969e7dbf562fbcc25e35271bef7e5a21ddebbc7e3735ef1a",
    "previousSha256": "ee8b2abe8b9b4b0e891fa35ac661860c20ed54005b0efa77ce5c6fb87d21d68f"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "4d1d02071bba4e81aaf84e974d4b297e3835a1b524611e9d3db24606e0b5ab84",
    "previousSha256": "f8ccd2b19a7c915fb8efc788a73fed6d21135e55b041185bd4c326d869eac3f0"
  }
});
export const XENO_GAMEPLAY_NEW_INPUTS_V213 = freeze({
  "docs/forge/xeno-trials/V213-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "f8dbdb87fd03f0c0f465cdc7bffe4dd66dd41ed757e801bd7ca3cf4ae98ba4a1"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "991f6b2771bccb48ec0a61435e58fe94662164e44098ed610c129c9280fa3944"
  },
  "scripts/verify-xeno-trials-ai-v213.mjs": {
    "kind": "tooling",
    "sha256": "dd4568db5db5940cafd5a4d103b25a049715f58cb88dcbac750db5ecda6dd3a2"
  },
  "scripts/verify-xeno-trials-cargo-interlock-v213.mjs": {
    "kind": "tooling",
    "sha256": "e9f2ea35914ca9808d085c8d907ed23aff817341da235f003b7e8158cd426169"
  },
  "scripts/verify-xeno-trials-defense-v213.mjs": {
    "kind": "tooling",
    "sha256": "2060f845d1a23981dd29ba25114e4ebee81223b70d7b882c38de348ef478398f"
  },
  "scripts/verify-xeno-trials-finishers-v213.mjs": {
    "kind": "tooling",
    "sha256": "7ca573596a8cdbc666e6f0984702eafb2039eda56ea63ffad756c3b4ad1902ae"
  },
  "scripts/verify-xeno-trials-grapple-v213.mjs": {
    "kind": "tooling",
    "sha256": "a16b8f04875f394f12d711b207a4f426ce71c2b22f7cb8a72563779d42053833"
  },
  "scripts/verify-xeno-trials-horde-minigames-v213.mjs": {
    "kind": "tooling",
    "sha256": "a852aabbcfa3bffc51d493d8bcfc0589a3fb497490ac3aff1c9b085cf39f6c57"
  },
  "scripts/verify-xeno-trials-practice-v213.mjs": {
    "kind": "tooling",
    "sha256": "62080eb2883ef268b12d4638fa16bd1d26f4b974c3706fca6c75f6938f1d066f"
  },
  "src/xeno-trials-cargo-interlock-v213.js": {
    "kind": "runtime",
    "sha256": "54a31d0f83887b3e9361672e9c1b7a24fc7084e7fdf9b9d12c1f7515f551a4e3"
  },
  "src/xeno-trials-finishers-v213.js": {
    "kind": "runtime",
    "sha256": "de92224a72b750db159460168ed161ed2ed9ada6235ce945956271fc23d3aec7"
  },
  "src/xeno-trials-grapple-art-v213.js": {
    "kind": "runtime",
    "sha256": "ccd37798f20b48da2366f7d6c72b80db5837e5448cf27cbdba22b492883d1691"
  },
  "src/xeno-trials-grapple-v213.js": {
    "kind": "runtime",
    "sha256": "383cd6870a48afed5452e24d2144d1c69edeb3cb0e55ab39cf4d3e7e5bfad910"
  },
  "src/xeno-trials-horde-minigames-v213.js": {
    "kind": "runtime",
    "sha256": "a033a8c25eab7f039a08620ff4dedea07580f00015d077193d86c7e9fdc04d06"
  },
  "src/xeno-trials-practice-v213.js": {
    "kind": "runtime",
    "sha256": "e1a13310f6e5a84acf7212f745090407f63666c72ebd0d152692138d407cdb3e"
  }
});
export const XENO_GAMEPLAY_DECLARATIONS_V213 = freeze({
  "scripts/audit-xeno-gameplay-v212.mjs": {
    "start": "export const XENO_GAMEPLAY_BASELINE_V212",
    "end": "\nexport function reviewedXenoGameplayDigestV212",
    "sha256": "743966ad61fd89bc2689e86a0c3cd9654803b7eb2f33ce33a698adf085bea24f"
  }
});

export function reviewedXenoGameplayDigestV213(path, endpoint) {
  if (!Object.hasOwn(XENO_GAMEPLAY_SUCCESSORS_V213, path)) return reviewedXenoSelectionDigestV214(path, endpoint);
  const receipt = XENO_GAMEPLAY_SUCCESSORS_V213[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V212 endpoint for V213: ' + path);
  return reviewedXenoSelectionDigestV214(path, receipt.sha256);
}

export function xenoGameplayRuntimeSourcesV213(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V213)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoSelectionDigestV214(path, receipt.sha256);
    if (result[path] !== undefined && result[path] !== receipt.sha256 && result[path] !== current)
      reviewedXenoGameplayDigestV213(path, result[path]);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V213)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoSelectionDigestV214(path, receipt.sha256);
    if (result[path] !== undefined && result[path] !== receipt.sha256)
      assert.equal(result[path], current, 'Incorrect V213 runtime input: ' + path);
    result[path] = current;
  }
  return xenoSelectionRuntimeSourcesV214(result);
}

export function verifyXenoGameplayV213(readSource = readRepository) {
  const successors = Object.entries(XENO_GAMEPLAY_SUCCESSORS_V213);
  const inputs = Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V213);
  assert.ok(successors.length > 0 && inputs.length > 0, 'Incomplete V213 source freeze');
  const paths = new Set(['scripts/audit-xeno-gameplay-v213.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V213 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V213 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256), 'Invalid V213 receipt: ' + path);
    if (Object.hasOwn(receipt, 'previousSha256'))
      assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V213 predecessor: ' + path);
    assert.equal(sha(readSource(path)), reviewedXenoSelectionDigestV214(path, receipt.sha256), 'Unreviewed V213 source bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_DECLARATIONS_V213)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V212 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V212 declarations changed: ' + path);
  }
  verifyXenoSelectionV214(readSource);
  return Object.freeze({ baseline: XENO_GAMEPLAY_BASELINE_V213, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
