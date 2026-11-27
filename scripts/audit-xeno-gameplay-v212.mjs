import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_GAMEPLAY_BASELINE_V212 = 'b32d3ca217c35a8fa532d2d48833a6f1ae3546ca';
export const XENO_GAMEPLAY_SUCCESSORS_V212 = freeze({
  ".github/workflows/xeno-trials-standalone-v207.yml": {
    "kind": "tooling",
    "sha256": "92a20b343089f0736cf3e900fd0cf0949a6b83d436f33f2dffc3846654c6763e",
    "previousSha256": "d52f7ada0e23b99c0d4aeb9b6e615f643f85a9f1f74eb7614ea2b99351fefc10"
  },
  "package.json": {
    "kind": "tooling",
    "sha256": "a0632f1e01cdedb74bec5a229737cde4dccb243aadceb747a57e2e2799ae5625",
    "previousSha256": "0d3e22202740c14924a9882e4764a16f8543979c4c8d0f4815747cadd0c44101"
  },
  "scripts/audit-xeno-gameplay-v211.mjs": {
    "kind": "tooling",
    "sha256": "5f6a05dfed56b1ef63e0ca9cd6538dfe11d2a0d85a2f8360bf2a96e0fd93afbc",
    "previousSha256": "c44b81deb0bf8fe08555498a2f848c1eda1fee5a9d0cb599fe7cc136637c6521"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "2afb931b669bec43403e13462586ff328dd72fed023a4af5f1a09ac16eadad0a",
    "previousSha256": "b903de17a88bb1eb17509a374d46b61109c6050aece8751a816e5050262bc491"
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "08084cc018404f9166204225457b5ed803990e99b73db5c99f66771c96cdb7e8",
    "previousSha256": "42ef7e3cd8039fd7963a9df5bc44991e84787ea19ed12ba1f142982149667132"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "b49d5863043f832e9a7693a00d693bf49ce4ece4acf1aaa9c815fcaa632a3f02",
    "previousSha256": "3f3214dbfe91d901044e8b41daaa5e13385b4d71a5897fee5921967a50d97943"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "c9cd5f1057a588ffdafc35ed8a25dc6e74c5ab1364462d506fa25b2c075ae5a7",
    "previousSha256": "4cb581ba3e11b8b6fc1e4d512ffcaeeef4b1b66dac5e83b1cbed1ae0baa08c19"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "7e25dea3ceb98f8e368f4da3ad57ea094d29a033766c687bfd2bacd83bc2ab7f",
    "previousSha256": "50d99f6fb0b2e0b1c328e3cc26a01b0734b66cca8c4cc3522a1698c755a69797"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "eb0c4ab451a0b8ba586de611c40de645959b201ed9a90bd309df2b9d40de818b",
    "previousSha256": "f1fbf0db76aaf1595fbc4ae54afac0caf2339f438c3edf3f6aa769903120b0c2"
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "ebc74e52b443165c7e40927271c4b0a2d777f26ccc1f108cf1bbea859a6cad05",
    "previousSha256": "31540949a783418f7e5541a5d067d712c257e0c1dba3057f7b147c4965a757c1"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "63e62216eba7eb24058015da1ae7a253903a2ce236622e530a306efec746ce57",
    "previousSha256": "3d171157dc9fdc9e834763c8f5673c6ca752884bd4eedc5c0f93d5efefc6ce46"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "94c8a94b49b5e499068febac8d9f0f53b848bf5b6cc25d36685ebc80d9453b6c",
    "previousSha256": "352c494648c4b7f2d0224ea329c6f8ad6140b0edcc3d773223b32f77d248160c"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "dabe0ae25a5d65604bbdccdfa88f9403c6fa32269f24efd83a366cd28f67dfeb",
    "previousSha256": "a999e8a1a53d3532de3415056f4c2c7fa360ab6ae3d1486b0cfcbf7bb4134314"
  },
  "scripts/verify-xeno-arbiter-protocols-v191.mjs": {
    "kind": "tooling",
    "sha256": "346eeae53f154b0c1b3d75627f61d056d5b4211859ea9eacad239704aab2f89a",
    "previousSha256": "85f50fc0e301128601cb71ecb032c93b76332cdd2f042d1ab382ca221afb212d"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "94bb2ef9ad5d1b6ab027cc64e7e166b6d1c8ca2c01e7f50f896d42e4c01b0769",
    "previousSha256": "b773296efbcfae1fc29ec8431f597dcfefbfc9792ca3d6759d4feb34f5bc307f"
  },
  "scripts/verify-xeno-gameplay-audit-v208.mjs": {
    "kind": "tooling",
    "sha256": "8f83ddeba80f0a30127d1c8e9ac036f3ed2b6228adde3ce514ad930cf960554f",
    "previousSha256": "b9d89b83e5f3680494d504e013158c241358bb5669bace8c3750d04960448328"
  },
  "scripts/verify-xeno-gameplay-audit-v209.mjs": {
    "kind": "tooling",
    "sha256": "da6585babb150e76681777d1442c41170e5c193dd2e1bcf507820b201472a20a",
    "previousSha256": "0455cd984a8da8dad4795059908d2c19578762ba7b3e7cb27e4c350abe5262ec"
  },
  "scripts/verify-xeno-gameplay-audit-v211.mjs": {
    "kind": "tooling",
    "sha256": "f3d21a187ff230544340321e13dce47f16e719a8b8d96354fa557f9baba68826",
    "previousSha256": "d3fd807dbce9036cd3502518940188065270c3ffc772bba880d9470414fcdd6b"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "b496eef1452f4d21a7a85aff562f582d8c6309e9466c443beccbbdf4936e4d8b",
    "previousSha256": "702ef7c131542a8ba55ee8eace28a3c77d4595c336ccfa1a4e2d4c70fdc2d217"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "dbbbd77681e2f72ba41bf61f1f06adf7e1485201ead4f02a3d5111c65c45846e",
    "previousSha256": "17069a2ac204e4201ab27c05c00291a274e26d62aee3fbfa8efa5bc1618406e6"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "8867539ad034b4730f68cf6f6a774e39bd1c9a3ba1290c1890bd5509135e872b",
    "previousSha256": "d7dece6ec1ed559b029b2d293724c7b86b5840fd398f41f4ce3db44011fee0f6"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "cb8b3b19705e07f23daebb3c29a9bef9a0a6ffaefc10cf08bfe643d5e0aff125",
    "previousSha256": "81ab66adcf030fb614c58eb58ca1a4399f036ac78a3c92976199b97c5ad0a158"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "d9a0f1dafea8d825d12573a78eee8916601b9ecc95d15c973d8537ca817b85ef",
    "previousSha256": "f3658d4b07b21204a4decf31a025361adad1300b7c0dbe4a69414acf9d8b9429"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "2e703eb158dae0167bf61ff25fbba4254b43f709c2de2e3d0f7c9cad0e2380cf",
    "previousSha256": "7609d3ade5f8a1920101d68aa2383c93b4090d0d121c9ec855ad31f2fd027101"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "64649a5961a8d0be219fada6ec94b369897ff4f229461bf42a20dfcae0de46f2",
    "previousSha256": "279b557762d8ea38729f3e024342e10392b9b53216b0432da822a2657f264433"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "78866f30e4be1013b21639f86571fc12e1fd64e826dd88fe800e17617710e5dd",
    "previousSha256": "c833033f8e9b23a125d57830a641659c68442651fe4001ffd2e1090736232011"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "0ecb077313d9fd2b220d0a8d75509382715086e2a04f063cf03aceb12ae1367d",
    "previousSha256": "fe30c97e2d3ee67f1b9c34049336c95d465f4d57513e5dd6720dcdcd2c37bc99"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "3495c51ac3c9ec886ab63160c5f55032a621ce0ff1e547699caba836577d979b",
    "previousSha256": "244670308be158333c0dc82966d6db5354cf2171881d884981a60c2716af435d"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "08685ff4e4dbe9cc33bdf0365a07cad2f701c22c78ff6b4e244e0ef3a42bfbb7",
    "previousSha256": "73f5c0af4250a5ae153ece99d9ac2b01c33f245aa99b4b0a67e7be29873aacdb"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "09d24f6846ce94b911ea2e34b494d0599e680051f672d64506d1d5dc1f451447",
    "previousSha256": "205aa2a9fe45c358086c1da63cdcb76de9c654c85793f81380209de3d08ee37f"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "b2ee5655fed2d821f9c54495ebc14913d98bb18f2f1818354b2051fafd49b65f",
    "previousSha256": "56a0a0b99f9288d38c55d67aa94fad3d434caf13e053eebe501b07e816c988d5"
  },
  "src/xeno-trials-action-atlas-v199.js": {
    "kind": "runtime",
    "sha256": "c8b2286d35a331be77fb1e9cdb1457759df9b19c696e014d023d13e35895a006",
    "previousSha256": "8e1eda7b2baabbc380c868eba4c59293afceb7c3458a46bcdc6f62b1d1e28141"
  },
  "src/xeno-trials-capture-v163.js": {
    "kind": "runtime",
    "sha256": "f7aeb002b6207bd074549f3e1d6959108d23268d7c12fa1765d788a6ba2079bd",
    "previousSha256": "14a2ed247f0f1b09b4c9a77a91005742a2ccd5a50017000f4b705aa67b92256d"
  },
  "src/xeno-trials-defense-v211.js": {
    "kind": "runtime",
    "sha256": "7ea5dd5ddc05702e2c7de60c06c09b05f5972482de9ed31c9384363197c08868",
    "previousSha256": "8183d76c5eae09defa5329fd4a73c4ece5840c3b3e43c283a2e1f91a6bab7680"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "6fcbf72ba6bbb04ca9c76b5922d2f42b3a2929e01f756138612e9a045a8d5f50",
    "previousSha256": "322d25f99aed654505e7996503859849bfb2aeb9ffc914f49ef8ed0616427d9d"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "fb7912cb88c0ffe670579f6c6fe7375a29361d1b277340739a6476de838ae35e",
    "previousSha256": "bee71f43007f007ae3d4824984283b6c96d4afc495fd25f0a78a96eaf2294980"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "bf0b81981c3099f4e93036523fcfa4872f35d35c48c0cd348daca9d79a32a67f",
    "previousSha256": "1c9b9fd7f744f9caf1cddff5f075c0e2a337d8f77be1c4b95026dbb267c76538"
  },
  "src/xeno-trials-finishers-v208.js": {
    "kind": "runtime",
    "sha256": "159b91d115f7a70a5093f7dc06da8c1e7fb510244a89b3e04b3945ccb7788f18",
    "previousSha256": "0199e4ce1d748086ab42cfe446626149bac2d93dd65c824efd782662dee10b6c"
  },
  "src/xeno-trials-finishers-v211.js": {
    "kind": "runtime",
    "sha256": "e36b7a98c1faf92275e365f56e0ce5c4e65460cd7f812f9268d6411dc4ca78bb",
    "previousSha256": "f5647a4b1d8f14c5110625d0c569105a70629e0310f0865daa630068fac3f311"
  },
  "src/xeno-trials-grapple-v153.js": {
    "kind": "runtime",
    "sha256": "6e7d542504ea6bde0342877d403cca0b88c02d6090022152596f439461f26d4f",
    "previousSha256": "a0d85cfeb6cac1b3b97f0334ca7656c324f43a9077cac04b22600fdf6cc6529a"
  },
  "src/xeno-trials-horde-checkpoint-v186.js": {
    "kind": "runtime",
    "sha256": "319d9b2beb5a9192f1c3dbec833e515b274fb14d82ff5c7620a65e344f71c933",
    "previousSha256": "007a3c997fa68b6f74d53e69bf3b56af52bf91eb121f105c203075d3eb4a88ab"
  },
  "src/xeno-trials-movement-v210.js": {
    "kind": "runtime",
    "sha256": "504b680444de803303a71afc0305a116926122dbec7747e733b30d1811475be3",
    "previousSha256": "3cf845464ddf02f5d0f7f7e1318c558f8ade03b4b7b6e249fc7d064a2c359042"
  },
  "src/xeno-trials-moveset-v207.js": {
    "kind": "runtime",
    "sha256": "4462d93f398bd1835c80026648e5313590d43561471b4218f5b2f9f650e25b35",
    "previousSha256": "915f78f0d06ad12bbf3c46af4955ea07706af4eba8de9a72c348b6764d68be53"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "bbf4b33f0728fa1ca49b6a8d32f6f91931cb916c48f68eb2977717ee5324e230",
    "previousSha256": "2baeb561c78a7db4f5d33e7d15671a844f4b688b2b0aee88219eff22004074d6"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "736ba8c14a03859ccf0d5380556abf3fa839dfccc827973970b4fa1b2c05a553",
    "previousSha256": "8048575ec19093b452e2acb5e0414bb9e3861ad7c7db2a983ea83199136e4375"
  },
  "src/xeno-trials-pilot-sequences-v197.js": {
    "kind": "runtime",
    "sha256": "fa647c7d1fc602d889740a553e89b5e6bc8be5824a2548946eb7085baaeb1cd5",
    "previousSha256": "32336bc74e228cb36415260dc2526d36fcda0988abc809e09aa4c1211cad7f47"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "439e7eb91f694b37650623fd5fcfc17e0051823acc827ced753ef7f15c1057c4",
    "previousSha256": "d52e4a38696ff6cb273389f466ea523f123ab8c2b1b2b26182f7a85dedf14113"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "sha256": "589e209bb938baf00a1509ceb9d380f696b87dd1675247868b582c4ab94f414c",
    "previousSha256": "8a309501af8f6f027d75feb9cc30c91e5ad3de2acf067eb4f534ac0dc95d1bf6"
  },
  "src/xeno-trials-rig-v154.js": {
    "kind": "runtime",
    "sha256": "045a393cc0bdfc43600052b0899926b1a88233d90453be045a422fd07eb2c5e0",
    "previousSha256": "b4025d39c0ed62d3892fcaff440fff710cfc913dc244f2cb0cf05aa57f412272"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "e7c7fc853bc397b7416a11009999559dc01a01a38ce2ab5ea1dc70e4c9072be8",
    "previousSha256": "aa39129ceb3040e71251ac075f2df066e24c4203015120e48e404676384c50cd"
  },
  "src/xeno-trials-signatures-v147.js": {
    "kind": "runtime",
    "sha256": "6433634ab652c3fbf3daf8cea974ae585f0a2f4041af36cee5f92f731c7fb189",
    "previousSha256": "040b7741e1161620dcfb281ef5cda11d81b7d450b24d34f4d9664624273fa6fc"
  },
  "src/xeno-trials-sprite-atlas-v189.js": {
    "kind": "runtime",
    "sha256": "6767d93881bbabf91f60a87558278bd44ac343d554fff8314a618d1f10fecf41",
    "previousSha256": "644449db2e752f29d5d798370a3bcdef53dcbb050dcc7496beafb70910705e97"
  },
  "src/xeno-trials-stage-hazards-render-v188.js": {
    "kind": "runtime",
    "sha256": "17fb03fd50d60254d6ab505e64680378e231a53d0d7e4a866639f3285e8bf94f",
    "previousSha256": "7f8e343a6726d02c38228b1dcc9a2ca584fb0cd9609d19901fad89377c48ae08"
  },
  "src/xeno-trials-stage-hazards-v188.js": {
    "kind": "runtime",
    "sha256": "cf3514a219aa9c6da4e8bf02fad96e429b42c16ae77e1d9322d48abfab68593a",
    "previousSha256": "aab48e1d966e6bfe202d9abbc17d7d4aa09c0bd0c87fc096e0e05091988755b4"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "ee8b2abe8b9b4b0e891fa35ac661860c20ed54005b0efa77ce5c6fb87d21d68f",
    "previousSha256": "6ca5a1e92fdf9c45497ee32081f35dc670dec09f7d7504fb736f95fe47376ed5"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "f8ccd2b19a7c915fb8efc788a73fed6d21135e55b041185bd4c326d869eac3f0",
    "previousSha256": "d52e45094550a13f8114a24695e69a6a22bb47753358a9fd38d245cfbbfe70f5"
  }
});
export const XENO_GAMEPLAY_NEW_INPUTS_V212 = freeze({
  "docs/forge/xeno-trials/V212-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "b408734cf62cf8431630836cc6de9ca762271a65daa83a088704cf633b78ecc9"
  },
  "scripts/verify-xeno-gameplay-audit-v212.mjs": {
    "kind": "tooling",
    "sha256": "2c284fcf19a3da3b50a5924c7acc3cc16c35ca6eff200f8d9367395114e360d0"
  },
  "scripts/verify-xeno-trials-finishers-v212.mjs": {
    "kind": "tooling",
    "sha256": "0a481e282bb631c15a30422271b5d269f6c5a977ac10a25af4ea56954357c569"
  },
  "scripts/verify-xeno-trials-grapple-v212.mjs": {
    "kind": "tooling",
    "sha256": "bbfd59b6d019fff980069623b2a2a546020c492b1127e26223bd70c9e12f06a5"
  },
  "scripts/verify-xeno-trials-movement-v212.mjs": {
    "kind": "tooling",
    "sha256": "980488402832ac8fd31e9a3ef3b79c7f1cd3b867626ec60382095b73ba40d94c"
  },
  "scripts/verify-xeno-trials-practice-v212.mjs": {
    "kind": "tooling",
    "sha256": "0f8522cdcedc1cc0bbe4fb1956e1a9445afa0745ed3050dcd88a0fe252833378"
  },
  "scripts/verify-xeno-trials-presentation-v212.mjs": {
    "kind": "tooling",
    "sha256": "3b3d35b534cf3a66ae4712a70f8e57047ffb9045502222acaa4cbe6df4b265f1"
  },
  "scripts/verify-xeno-trials-stage-isolation-v212.mjs": {
    "kind": "tooling",
    "sha256": "d43700b3fd51c5dea7612b71f93b4f0a2f98d7b6fe8f06f0e7be4b00ad44e9ea"
  },
  "src/xeno-trials-finishers-v212.js": {
    "kind": "runtime",
    "sha256": "0d0c037871fb1f5c8dab1f1b1d5ff014ef01a65f9faa1ac44e30abe920b14a69"
  },
  "src/xeno-trials-grapple-v212.js": {
    "kind": "runtime",
    "sha256": "c32bdff8454cc0efa0d1c843d581f28a89fc916b2cf9dff1a7f34e94a0f8abd8"
  },
  "src/xeno-trials-practice-v212.js": {
    "kind": "runtime",
    "sha256": "139f115f4fb4e3adc673d646a07ef69f5296095d792e54d9f3e61ffbb26bf366"
  },
  "src/xeno-trials-stage-isolation-v212.js": {
    "kind": "runtime",
    "sha256": "e734c01080b2d1d78f06ae1c2f5d12f20054b2f85e7a484dde6b829ad6cc5ae6"
  }
});
export const XENO_GAMEPLAY_DECLARATIONS_V212 = freeze({
  "scripts/audit-xeno-gameplay-v211.mjs": {
    "start": "export const XENO_GAMEPLAY_BASELINE_V211",
    "end": "\nexport function reviewedXenoGameplayDigestV211",
    "sha256": "b8f1f96ce4a83caa190bdc4a98bf7b551f5b88ca11355d597067e137a216cc3b"
  }
});

export function reviewedXenoGameplayDigestV212(path, endpoint) {
  if (!Object.hasOwn(XENO_GAMEPLAY_SUCCESSORS_V212, path)) return endpoint;
  const receipt = XENO_GAMEPLAY_SUCCESSORS_V212[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V211 endpoint for V212: ' + path);
  return receipt.sha256;
}

export function xenoGameplayRuntimeSourcesV212(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V212)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoGameplayDigestV212(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V212)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V212 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoGameplayV212(readSource = readRepository) {
  const successors = Object.entries(XENO_GAMEPLAY_SUCCESSORS_V212);
  const inputs = Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V212);
  assert.ok(successors.length > 0 && inputs.length > 0, 'Incomplete V212 source freeze');
  const paths = new Set(['scripts/audit-xeno-gameplay-v212.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V212 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V212 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256), 'Invalid V212 receipt: ' + path);
    if (Object.hasOwn(receipt, 'previousSha256'))
      assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V212 predecessor: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V212 source bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_DECLARATIONS_V212)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V211 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V211 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_GAMEPLAY_BASELINE_V212, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
