import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_GAMEPLAY_BASELINE_V211 = 'b721fe98bc62b2374e9aac012c302e42e9768b4b';
export const XENO_GAMEPLAY_SUCCESSORS_V211 = freeze({
  ".github/workflows/xeno-trials-standalone-v207.yml": {
    "kind": "tooling",
    "sha256": "d52f7ada0e23b99c0d4aeb9b6e615f643f85a9f1f74eb7614ea2b99351fefc10",
    "previousSha256": "457bc64ad48fae17246d3e161595cb7d5d555bbb4a1e14c9e4ea8d327c0dc9aa"
  },
  "package.json": {
    "kind": "tooling",
    "sha256": "0d3e22202740c14924a9882e4764a16f8543979c4c8d0f4815747cadd0c44101",
    "previousSha256": "5799266c3c27cb3dad2ab49c63c1314c87b278aef00e5d07682a0cb4517df443"
  },
  "scripts/audit-xeno-gameplay-v210.mjs": {
    "kind": "tooling",
    "sha256": "911949b5fe816f681d3c10db7394c3cdc40c2c1416bf8fef16bbf75358c56b5d",
    "previousSha256": "209e57a189d26d06f0ce5a8630d77526be32ea38de4efe19803b0fa412203ffb"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "b903de17a88bb1eb17509a374d46b61109c6050aece8751a816e5050262bc491",
    "previousSha256": "0156ae32f36e9410c9b4111c3f1c01a9adccd2af63cc6d2ed5f5c21a4c39c970"
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "42ef7e3cd8039fd7963a9df5bc44991e84787ea19ed12ba1f142982149667132",
    "previousSha256": "972f40d33e928e0859f8ecbb0165a07f3f0e39b63c6391a27c2293523d6118d9"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "3f3214dbfe91d901044e8b41daaa5e13385b4d71a5897fee5921967a50d97943",
    "previousSha256": "4ed06b0a6db3c0a88c5e71767da4124a7a52bde7f150bd3451ac83d98af0c0f6"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "4cb581ba3e11b8b6fc1e4d512ffcaeeef4b1b66dac5e83b1cbed1ae0baa08c19",
    "previousSha256": "c620ad923820d65754d018a6cda383c3c027f1906f0f861c7ff96641c4b8aa31"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "50d99f6fb0b2e0b1c328e3cc26a01b0734b66cca8c4cc3522a1698c755a69797",
    "previousSha256": "7f46fb36849a43f6c94d52c0d392c64341a0d0cfd56696613fdfa142177c6555"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "f1fbf0db76aaf1595fbc4ae54afac0caf2339f438c3edf3f6aa769903120b0c2",
    "previousSha256": "87c162dfcb7e93ba7f17ada883c8da846926528fbb64b2889cd8c8dee63ee026"
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "31540949a783418f7e5541a5d067d712c257e0c1dba3057f7b147c4965a757c1",
    "previousSha256": "a5636abda346f6f3fe4c58b40517b0b8f981cf571463b4d63d52be77c7631259"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "3d171157dc9fdc9e834763c8f5673c6ca752884bd4eedc5c0f93d5efefc6ce46",
    "previousSha256": "f8ab388470c385f539d637b0ede1bf3b23e97faa04f20000ef2781ff0d3a9526"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "352c494648c4b7f2d0224ea329c6f8ad6140b0edcc3d773223b32f77d248160c",
    "previousSha256": "72f649c34de5411d0cf9a4278e9798e3aeffbc7534c557ab5326515ee911f313"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "a999e8a1a53d3532de3415056f4c2c7fa360ab6ae3d1486b0cfcbf7bb4134314",
    "previousSha256": "ac87196e3b25738ded7fa384d4db4423ebabfcd41d33fd8d977139a0ca1e4338"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "b773296efbcfae1fc29ec8431f597dcfefbfc9792ca3d6759d4feb34f5bc307f",
    "previousSha256": "ade9e483559b083b852a6fc7f8c6b176bf9315f441eb3155e5509cc914cfc135"
  },
  "scripts/verify-xeno-gameplay-audit-v208.mjs": {
    "kind": "tooling",
    "sha256": "b9d89b83e5f3680494d504e013158c241358bb5669bace8c3750d04960448328",
    "previousSha256": "bbf1999b567a95878755eb8cd5ffdc78153253230ebb4e8916b9991f9380b784"
  },
  "scripts/verify-xeno-gameplay-audit-v209.mjs": {
    "kind": "tooling",
    "sha256": "0455cd984a8da8dad4795059908d2c19578762ba7b3e7cb27e4c350abe5262ec",
    "previousSha256": "fd9e82166aa3b8ebb6e9c5ae47e339c989dd053ba6b74035140733ce0d90839f"
  },
  "scripts/verify-xeno-gameplay-audit-v210.mjs": {
    "kind": "tooling",
    "sha256": "b82edae0b56a2681863c1b2b70834bfb88090c9ad322a5a23f8939b5a2dfd53e",
    "previousSha256": "afee06844c514f4c1277f11641203f817e687765aea854b711517ad9ec964cbd"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "702ef7c131542a8ba55ee8eace28a3c77d4595c336ccfa1a4e2d4c70fdc2d217",
    "previousSha256": "ccc87bce6e03dc3919ba92f79c733c1277eade71169fedddeff37286ce62bbdd"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "17069a2ac204e4201ab27c05c00291a274e26d62aee3fbfa8efa5bc1618406e6",
    "previousSha256": "b3a54ae6f9e35268806212f81ece1680184570648d961130480a89d4caa99738"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "d7dece6ec1ed559b029b2d293724c7b86b5840fd398f41f4ce3db44011fee0f6",
    "previousSha256": "2e5509b46080f0563d020988d0b9db78fb7d8943330724816e480875814bce17"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "81ab66adcf030fb614c58eb58ca1a4399f036ac78a3c92976199b97c5ad0a158",
    "previousSha256": "c50fe6d7f2e28651a5d8e47b3d4a8ce82c1b2b66e995802d8d15c9a816bc3aa5"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "f3658d4b07b21204a4decf31a025361adad1300b7c0dbe4a69414acf9d8b9429",
    "previousSha256": "21e81e273d75dee30bf73fe8f63af9441914ac7095f2d4dd9e9c072d5f4b59f6"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "7609d3ade5f8a1920101d68aa2383c93b4090d0d121c9ec855ad31f2fd027101",
    "previousSha256": "709d310c180e8de3c48b2c6a4f7992c6384278c43336bad60864fceb9c5a22e7"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "279b557762d8ea38729f3e024342e10392b9b53216b0432da822a2657f264433",
    "previousSha256": "56c149e193a274157d6dfffaeec1e50595e240855b2311dcb67eec94022f4b9f"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "c833033f8e9b23a125d57830a641659c68442651fe4001ffd2e1090736232011",
    "previousSha256": "d06e340536d9234627000494fe3a0460b5a918adbf002ffdcedb3e98c5645df2"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "fe30c97e2d3ee67f1b9c34049336c95d465f4d57513e5dd6720dcdcd2c37bc99",
    "previousSha256": "be370c620902eb909595a7260f905100a6ce21c90d4873232b62c17d17fba018"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "244670308be158333c0dc82966d6db5354cf2171881d884981a60c2716af435d",
    "previousSha256": "1b392f39dce6e963b85ed7cc4b7218f481d54c7e34527fb534dae9673560d2c5"
  },
  "scripts/verify-xeno-trials-castes-v151.mjs": {
    "kind": "tooling",
    "sha256": "7431d76647b0d4b4c108faa6584d9c0b35c6a7e758c3802094092cd9fff5f48c",
    "previousSha256": "c3ee55a5f487c911bde7df6f135160c50bf2c6210bfd9c50cd1bd0e7d335a869"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "73f5c0af4250a5ae153ece99d9ac2b01c33f245aa99b4b0a67e7be29873aacdb",
    "previousSha256": "91aaebb0178367d583ca27f12016991e10f22be2d25059de8c21cb6dc551e943"
  },
  "scripts/verify-xeno-trials-grapple-v153.mjs": {
    "kind": "tooling",
    "sha256": "7d9bfb26ad6b0aeea3b21ae0d7c60774a74780b9f2f49bb10a9b8dd4aa54ba76",
    "previousSha256": "ca64879779da758ff58bfdbe3b3288a6b4a47a94492eac27fc8e3ea7f4925c9a"
  },
  "scripts/verify-xeno-trials-presentations-v156.mjs": {
    "kind": "tooling",
    "sha256": "3e9dfb0ffda695cb321c3d00ca5662c805713b3f851124f91cb7510cfad3f111",
    "previousSha256": "acfa6c0e57c6e72f15e56ecabb909248e0b64219622e23643b417040635e1ed9"
  },
  "scripts/verify-xeno-trials-ripostes-v208.mjs": {
    "kind": "tooling",
    "sha256": "f4f445df5eeb7b8e31056d6621b2c7f4511187ddd9702e05f03e319c76f91628",
    "previousSha256": "d1a2a7609967ca239784030e045cad1677918047d8287fecc8e3b49dc90672c8"
  },
  "scripts/verify-xeno-trials-roster-v179.mjs": {
    "kind": "tooling",
    "sha256": "e90a0823d75245cb48b070d1c131d3da16ccf0dd6bd1577c186050a02fb8058a",
    "previousSha256": "cbc986297622323323658776c2270aed7b9ace697ad0ff30a803f11f042039b1"
  },
  "scripts/verify-xeno-trials-sequences-v155.mjs": {
    "kind": "tooling",
    "sha256": "1a758b0533212c6f8716fb005260304e80311b78bc363f8eb3c2d7a67e370fec",
    "previousSha256": "bec375e3b26bfbf59f08ce798053105e49b58446f9c732fe366749ac88c06328"
  },
  "scripts/verify-xeno-trials-signature-kit-v208.mjs": {
    "kind": "tooling",
    "sha256": "439463e8bdeb0e6bee12ca8e802b823657ee39aa41387554e24c91e88f3133df",
    "previousSha256": "723d89ce8493b90743c2be79e13401a2e980dad191baa1804902a9716ae2cc5b"
  },
  "scripts/verify-xeno-trials-super-kits-v209.mjs": {
    "kind": "tooling",
    "sha256": "2b0394dc8f24525717fca618d00ac3287318b2a75193ded7539690092073a425",
    "previousSha256": "4f6bfbfe8634353f86a353c368dea4d8a5e1fb513fb26d06e9ed20571d4f57e7"
  },
  "scripts/verify-xeno-trials-super-kits-v210.mjs": {
    "kind": "tooling",
    "sha256": "84a6fc5ef5da02b9e87118b5c3e3155f6b93004cf6c6ebb78b262d53b7c3026a",
    "previousSha256": "59fcf0a39468d4a037af7b23292b3629575a2b5fff7ed6485544ecd35188246b"
  },
  "scripts/verify-xeno-trials-supers-v148.mjs": {
    "kind": "tooling",
    "sha256": "34c4dc519d8602b3bb8c92e36500251cf79b00722235c46399630134c8b91d34",
    "previousSha256": "0adfc00cd062a4ad3dbeb9ce57666fb2036e4e82f2f213c7184756ded73d745a"
  },
  "scripts/verify-xeno-trials-v145.mjs": {
    "kind": "tooling",
    "sha256": "6969fa5698d071f100203195b20915538d8baa8b6cfc91bf74b82792637594e2",
    "previousSha256": "3086cc19cf63739023358ead9d553c928c0fb69466de2dff4a03da4ee8da570f"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "205aa2a9fe45c358086c1da63cdcb76de9c654c85793f81380209de3d08ee37f",
    "previousSha256": "500b785badab7bfc96e5ee7438d2c77eb451a65b65232b1d2158da40e5c9fb7e"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "56a0a0b99f9288d38c55d67aa94fad3d434caf13e053eebe501b07e816c988d5",
    "previousSha256": "6a5dd00ace5d5701372b366dcbfa8a96ef426ce161fdcd0152abf94d151273c2"
  },
  "src/xeno-trials-ai-v119.js": {
    "kind": "runtime",
    "sha256": "77876e1a269fa8ac64b7e1c161fd98f5230265172e462fdbcaa737d0ea3bf2e8",
    "previousSha256": "0bf3bab2ab874c138f4a948cac2a9b8aadfae254de3f2169ea2e10b2651d6a43"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "a008163742cca4f4eab690bed201de88064960424bcb76086343dbd4c2facf8a",
    "previousSha256": "d834033a8c0a98ec32ca8eaf4ed0f45240526f003c71dd43e4875c19169ef74c"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "322d25f99aed654505e7996503859849bfb2aeb9ffc914f49ef8ed0616427d9d",
    "previousSha256": "fb619549aef4c1f1d0252113dc0fe9c62f12bfc3807c6ed6a7979fc73ab1b42a"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "bee71f43007f007ae3d4824984283b6c96d4afc495fd25f0a78a96eaf2294980",
    "previousSha256": "19dbb0777f0a6bc9c418fc5b2ba58b97e606ec716ee8f150c2b5f915f7d34898"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "1c9b9fd7f744f9caf1cddff5f075c0e2a337d8f77be1c4b95026dbb267c76538",
    "previousSha256": "e77c88bd73bf68126df17a83d1a6f06aa66acaecdd541a3b748d8b6984e3c7c3"
  },
  "src/xeno-trials-finishers-v208.js": {
    "kind": "runtime",
    "sha256": "0199e4ce1d748086ab42cfe446626149bac2d93dd65c824efd782662dee10b6c",
    "previousSha256": "d821ef70bd56421388cac1aee69f01a7dbbde6138b8e10247ab9d92211a43e4a"
  },
  "src/xeno-trials-horde-checkpoint-v186.js": {
    "kind": "runtime",
    "sha256": "007a3c997fa68b6f74d53e69bf3b56af52bf91eb121f105c203075d3eb4a88ab",
    "previousSha256": "af11ad03a2c5db0e5453866b926f4058beff6b930356015d979c68111b795a4b"
  },
  "src/xeno-trials-moveset-v207.js": {
    "kind": "runtime",
    "sha256": "915f78f0d06ad12bbf3c46af4955ea07706af4eba8de9a72c348b6764d68be53",
    "previousSha256": "6b99d2e85f84eca6e46e67ad23637979ed033df6b0ce3228cbe8adf072f202de"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "d52e4a38696ff6cb273389f466ea523f123ab8c2b1b2b26182f7a85dedf14113",
    "previousSha256": "56ac685a2a7f03e01cb4e7545eed39c70c7ff1fe95410d880947e5d636e56834"
  },
  "src/xeno-trials-rig-v154.js": {
    "kind": "runtime",
    "sha256": "b4025d39c0ed62d3892fcaff440fff710cfc913dc244f2cb0cf05aa57f412272",
    "previousSha256": "014776eebd5748f5b1b16fd04c0e1cad419e4a7a497b2f922f86817801be887f"
  },
  "src/xeno-trials-ripostes-v208.js": {
    "kind": "runtime",
    "sha256": "19218dae16474e0ce9796ecf3304505aa7592b4b1a0d6b6f8bd97564335b4790",
    "previousSha256": "421bca494f308b034d74600d24c325924fd6e9b6d27dce67ccc71329c4307a0b"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "aa39129ceb3040e71251ac075f2df066e24c4203015120e48e404676384c50cd",
    "previousSha256": "7d612b8ebd07f67daeab833bbc53aaf9b1041c7ee3db64e8786f296ee20421a1"
  },
  "src/xeno-trials-sequences-v155.js": {
    "kind": "runtime",
    "sha256": "7397652a06e87332374bad342ad117c8df8738d1d75c16a2dcd9c4d25a3d3472",
    "previousSha256": "ed140f0788d4d13b91ddd0aaa8a955c7ca50507185f9eee3debd537385ad2321"
  },
  "src/xeno-trials-signature-kit-v208.js": {
    "kind": "runtime",
    "sha256": "d63c359a32258b042a84133c643334b139eb9328bb103ef83f061370433ee3a9",
    "previousSha256": "1440af20e9d1e3455cfbb635f0a3cfcfe5ac79f9a5238a8e936e909ac66973ae"
  },
  "src/xeno-trials-signatures-v147.js": {
    "kind": "runtime",
    "sha256": "040b7741e1161620dcfb281ef5cda11d81b7d450b24d34f4d9664624273fa6fc",
    "previousSha256": "2e06a2dfda9b52189cf8137f5ce836d04e11d9f8b0500141e7c25e3d0635c446"
  },
  "src/xeno-trials-sprite-atlas-v188.js": {
    "kind": "runtime",
    "sha256": "fe502fb242864d6ae8e68aa73344ae85d81de7f0baa84399e7349b739b2ee037",
    "previousSha256": "b4173e052eb172c136213fd5fbb8519dc448b376719046287c9d63bd92bb528a"
  },
  "src/xeno-trials-sprite-atlas-v189.js": {
    "kind": "runtime",
    "sha256": "644449db2e752f29d5d798370a3bcdef53dcbb050dcc7496beafb70910705e97",
    "previousSha256": "5e17f98ec7c4c27c6f567d11a88850cda3defcd5866ad7aea1da75bf727b2b97"
  },
  "src/xeno-trials-sprite-atlas-v191.js": {
    "kind": "runtime",
    "sha256": "24e984f892ddddb30ec8a54637aaee227486eb37b121163f4789fb6fbfabbd11",
    "previousSha256": "1a871905320679057363740920f7f56ad087b3a29a781574f211cfd3f34e2256"
  },
  "src/xeno-trials-super-kits-v209.js": {
    "kind": "runtime",
    "sha256": "5be54e444e98c71904148928e9b5d2c1d5b47307afe480ceba698750b4e81c22",
    "previousSha256": "97bb3ad765c9756bba2fe0c6ed1b204447920b3f8d509f24f58635c245b07fd2"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "6ca5a1e92fdf9c45497ee32081f35dc670dec09f7d7504fb736f95fe47376ed5",
    "previousSha256": "5d64749af753a8a39dc9ccfcfcf181f15281272506347636bfe3a93d9504cec1"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "d52e45094550a13f8114a24695e69a6a22bb47753358a9fd38d245cfbbfe70f5",
    "previousSha256": "3c73fffc15981ccf0cef41421586f5b759e07fdb2724a998094e4b10166b5d9f"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "b0b16b695c2dca9e343b938c2d47a58449799748b8b9a8462747448dcaddd066",
    "previousSha256": "a61904ec7ee1c43169e9c4bef1eab2cc2e2bae13725289ab93b8d4949fa855c1"
  }
});
export const XENO_GAMEPLAY_NEW_INPUTS_V211 = freeze({
  "docs/forge/xeno-trials/V211-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "9f009250fcc58986c8364cc58755bc05ca70060c0f7f82aee0f798f0e2a3d7e8"
  },
  "scripts/verify-xeno-gameplay-audit-v211.mjs": {
    "kind": "tooling",
    "sha256": "d3fd807dbce9036cd3502518940188065270c3ffc772bba880d9470414fcdd6b"
  },
  "scripts/verify-xeno-trials-defense-v211.mjs": {
    "kind": "tooling",
    "sha256": "98fbb360128b8869d6da48400a537229d023de583ac41e018851f7f5fb9aa975"
  },
  "scripts/verify-xeno-trials-finishers-v211.mjs": {
    "kind": "tooling",
    "sha256": "5cac060e05131d848d27b5f4feec9765ad576a27d5280d9ff4e52f09cec4c1db"
  },
  "scripts/verify-xeno-trials-practice-v211.mjs": {
    "kind": "tooling",
    "sha256": "30d2c2b0773e72d03a12e0763a2460f9773c9302315eacbb0afd497c71fec494"
  },
  "scripts/verify-xeno-trials-presentation-v211.mjs": {
    "kind": "tooling",
    "sha256": "7e2faf5f96aab6e1d1371a69f80603d2d71caf816130dc1814d8c60aedd4ba8d"
  },
  "scripts/verify-xeno-trials-signature-kit-v211.mjs": {
    "kind": "tooling",
    "sha256": "67496482943c612b44de901808ae75668ea31eafd298f17d775b801f67c094d5"
  },
  "scripts/verify-xeno-trials-stage-events-v211.mjs": {
    "kind": "tooling",
    "sha256": "57846e3a8fc006b7ae054d0fe71ab9591956810f70a9cc69da2c2c759a859298"
  },
  "scripts/verify-xeno-trials-super-kits-v211.mjs": {
    "kind": "tooling",
    "sha256": "d7f7e699da6b0fdf528a665c6b840de857349647ff250e9218478539c2aff1fb"
  },
  "src/xeno-trials-defense-v211.js": {
    "kind": "runtime",
    "sha256": "8183d76c5eae09defa5329fd4a73c4ece5840c3b3e43c283a2e1f91a6bab7680"
  },
  "src/xeno-trials-finishers-v211.js": {
    "kind": "runtime",
    "sha256": "f5647a4b1d8f14c5110625d0c569105a70629e0310f0865daa630068fac3f311"
  },
  "src/xeno-trials-practice-v211.js": {
    "kind": "runtime",
    "sha256": "0d15f27d22f092371722a6532afc92a1fc7e8d238b435d6f86033b83f3b99e6f"
  },
  "src/xeno-trials-presentation-v211.js": {
    "kind": "runtime",
    "sha256": "7e74678fd19c682a2f48b9df6c7fd378a3acca9b28c8046b8905ba3161195f40"
  },
  "src/xeno-trials-signature-kit-v211.js": {
    "kind": "runtime",
    "sha256": "a3485ce66770060ccb642918310a2264d2c26be6c2c6eff59fc8db69d0ea3275"
  },
  "src/xeno-trials-stage-events-v211.js": {
    "kind": "runtime",
    "sha256": "dfa8c45c76c6f8e309db476483986184d585d1c133caf735e432018aff249d27"
  },
  "src/xeno-trials-super-kits-v211.js": {
    "kind": "runtime",
    "sha256": "cbc2696a4ee9e92f6edf09da5e3e657c2342070beaaa3b6c7aba426664f375ac"
  }
});
export const XENO_GAMEPLAY_DECLARATIONS_V211 = freeze({
  "scripts/audit-xeno-gameplay-v210.mjs": {
    "start": "export const XENO_GAMEPLAY_BASELINE_V210",
    "end": "\nexport function reviewedXenoGameplayDigestV210",
    "sha256": "4fdc3074fae6c1eda5931b2472d4703d6cb87e0495398211a7f47510c16b4046"
  }
});

export function reviewedXenoGameplayDigestV211(path, endpoint) {
  if (!Object.hasOwn(XENO_GAMEPLAY_SUCCESSORS_V211, path)) return endpoint;
  const receipt = XENO_GAMEPLAY_SUCCESSORS_V211[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V210 endpoint for V211: ' + path);
  return receipt.sha256;
}

export function xenoGameplayRuntimeSourcesV211(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V211)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoGameplayDigestV211(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V211)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V211 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoGameplayV211(readSource = readRepository) {
  const successors = Object.entries(XENO_GAMEPLAY_SUCCESSORS_V211);
  const inputs = Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V211);
  assert.ok(successors.length > 0 && inputs.length > 0, 'Incomplete V211 source freeze');
  const paths = new Set(['scripts/audit-xeno-gameplay-v211.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V211 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V211 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256), 'Invalid V211 receipt: ' + path);
    if (Object.hasOwn(receipt, 'previousSha256'))
      assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V211 predecessor: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V211 source bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_DECLARATIONS_V211)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V210 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V210 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_GAMEPLAY_BASELINE_V211, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
