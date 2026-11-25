/** Explicit completion join for the independent MainN/FR-EN and Trials branches.
 * Versions 179/180 identify two source histories, not a linear replacement of
 * the already integrated reference/workshop, QA and language branches.
 * Every accepted endpoint is named and byte-pinned. No old execution or artistic
 * result is transferred. V188 explicitly succeeds this join; the V186 receipt
 * constants below remain unchanged and V188 pins the relay's changed bytes.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedStageOperationsDigestV188, stageOperationsRuntimeSourcesV188,
  verifyStageOperationsV188 } from './audit-xeno-stage-operations-v188.mjs';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export const COMPLETION_BASELINES_V186 = freeze({
  "main803": "803db26dbd7ed453d9534eee237806053438f300",
  "trials179": "d516dda1f39d5112d46c638d2d58a06fdd2ecee3",
  "trials180": "e0836d334a88b10efac06c4e7de31c6b5e9d4a68",
  "restoredBase": "0ae6fc6cd8140164acfc3daef90e6f9f0baad324"
});
export const COMPLETION_SOURCES_V186 = freeze({
  "assets/openai/campaign/v180/acheron-colony.webp": {
    "kind": "asset",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "51c21987bdcc73fb1d7744ba4bd42263cf7a37bb66e311632fa288b7de43729a",
      "restoredBase": "51c21987bdcc73fb1d7744ba4bd42263cf7a37bb66e311632fa288b7de43729a"
    },
    "currentSha256": "51c21987bdcc73fb1d7744ba4bd42263cf7a37bb66e311632fa288b7de43729a"
  },
  "assets/openai/campaign/v180/fiorina-foundry.webp": {
    "kind": "asset",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "45b496e9b36a6485635ed9bf36cd7474c114d8c3bdc591e781a3375d25de2114",
      "restoredBase": "45b496e9b36a6485635ed9bf36cd7474c114d8c3bdc591e781a3375d25de2114"
    },
    "currentSha256": "45b496e9b36a6485635ed9bf36cd7474c114d8c3bdc591e781a3375d25de2114"
  },
  "assets/openai/campaign/v180/lv223-engineer-temple.webp": {
    "kind": "asset",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "a2ea1f4807157deb2fd9c8d27f70beed1eee0963a7c04a8876ba443e53caed03",
      "restoredBase": "a2ea1f4807157deb2fd9c8d27f70beed1eee0963a7c04a8876ba443e53caed03"
    },
    "currentSha256": "a2ea1f4807157deb2fd9c8d27f70beed1eee0963a7c04a8876ba443e53caed03"
  },
  "assets/openai/campaign/v180/sevastopol-transit.webp": {
    "kind": "asset",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "02dad0a86ad3992e1253f567bb2e8b11018d7a280ea16df71cc51a070a6d50f3",
      "restoredBase": "02dad0a86ad3992e1253f567bb2e8b11018d7a280ea16df71cc51a070a6d50f3"
    },
    "currentSha256": "02dad0a86ad3992e1253f567bb2e8b11018d7a280ea16df71cc51a070a6d50f3"
  },
  "package.json": {
    "kind": "configuration",
    "predecessors": {
      "main803": "ff133a405bfc1ef2afa7085fcb2a6cde27a9f52c4af0de5172a058b47082eb48",
      "trials179": "b28a28d35e3bf81ffe9b59abcaf10892765a7cd378a5d8885b20f6c1ec4117a6",
      "trials180": "301a5657fafa604b2261fc322321f0553d4be2e4c86c7e467cda0f894842a5d0",
      "restoredBase": "62c0e2f7c47e72c909b3562d9f05475fc8fa909057f3ebfea3fd1e6d0b32d819"
    },
    "currentSha256": "f8b5758a406b7f2842ba8d39ef245eceb7b9d07c7a640df35cfd157413905a63"
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": "6be75d792e8ae0ba4d1ad6cbdaa4285e78bd958fda2eeaa23e510a5b2b49190d",
      "trials179": null,
      "trials180": null,
      "restoredBase": "6be75d792e8ae0ba4d1ad6cbdaa4285e78bd958fda2eeaa23e510a5b2b49190d"
    },
    "currentSha256": "8ec970927c3693f1183099ab7e006fca77b2b4cb0030f35111589022b1e1ebfe"
  },
  "scripts/audit-succession-v162.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": "fef7a42ad1e0548ea08cbf8b5417279abb46f23187f0e2ce0d27875b34f36481",
      "trials179": "fef7a42ad1e0548ea08cbf8b5417279abb46f23187f0e2ce0d27875b34f36481",
      "trials180": "c1ae7027138160852b39d5082ce0c49d635807f930c35771cb078ec37411b5df",
      "restoredBase": "c1ae7027138160852b39d5082ce0c49d635807f930c35771cb078ec37411b5df"
    },
    "currentSha256": "fef7a42ad1e0548ea08cbf8b5417279abb46f23187f0e2ce0d27875b34f36481"
  },
  "scripts/audit-succession-v163.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": "d69451f1d8848662cac1264b24640faec9346ff36c633e62802378fc9a981390",
      "trials179": "7ef9fd767712f8b24a41016cb41eb9df8b5fece6076b87a6abe4735f2ab1e346",
      "trials180": "bdc8ccb8d0b9a4dc3ff60b870894432c9223858c5d692882cff6aa1f70ab4e60",
      "restoredBase": "2d3dddeb572998b3c6e762b6fb1c1606108dc08d736a068810bdfc2fc0532ef3",
      "integration182": "467983aef6f72cfd208130b7671a36f6f06067d0d91b7baac85c64ff5cc6644f"
    },
    "currentSha256": "ca57080fe834777e4b40888801525523fb93f2f873ec93ab941101e4edb341bd"
  },
  "scripts/audit-succession-v179.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": "ffc287a474e65803a3ce52cee15347ceae331a056bb07882429373093e48e31f",
      "trials180": "59d8cb1b3f4cf0d0b42cb50bcd2d5d083b4ce9c149d80e2094bd9a605fb236ef",
      "restoredBase": "59d8cb1b3f4cf0d0b42cb50bcd2d5d083b4ce9c149d80e2094bd9a605fb236ef"
    },
    "currentSha256": "7774fb369b966d50bce7f3671b5aa9a781a49e0130b0eb861224018ba9bbcea7"
  },
  "scripts/audit-succession-v180.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "cafd226e6a68503eb3786b85126efe4183ebe0fc9d96391e4ac9ba7740abd706",
      "restoredBase": "cafd226e6a68503eb3786b85126efe4183ebe0fc9d96391e4ac9ba7740abd706"
    },
    "currentSha256": "0c8ef13c17dfbc68526b94adea6632fd6979e97c443094278a3654ec4630a65d"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": "437088c9f62a81c645876d6d57afe3146ef87623fcdca5f85d5a7f9119835146",
      "trials179": "437088c9f62a81c645876d6d57afe3146ef87623fcdca5f85d5a7f9119835146",
      "trials180": "62ebdd3ce0c5d1d1c0667b838f32847be6b810a26828632c2edbc73dea2882dc",
      "restoredBase": "62ebdd3ce0c5d1d1c0667b838f32847be6b810a26828632c2edbc73dea2882dc"
    },
    "currentSha256": "62ebdd3ce0c5d1d1c0667b838f32847be6b810a26828632c2edbc73dea2882dc"
  },
  "scripts/public-campaign-art-admissions-v180.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "9c278a1ddf7588064bb504289c62a114caf9473153649ff8470a2c5e85de92ba",
      "restoredBase": "9c278a1ddf7588064bb504289c62a114caf9473153649ff8470a2c5e85de92ba"
    },
    "currentSha256": "9c278a1ddf7588064bb504289c62a114caf9473153649ff8470a2c5e85de92ba"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": "7d1f368a4a6e5b3f8ae8a5161c8a8d819e32c33a14013dfed2ef8a1bb16cbd29",
      "trials179": "0b313656796b64fcdf61e80eecf53baaf0370ff4c9c5b7482678b0d8b017f672",
      "trials180": "3cfb3d121479254176d06bf7f8ba9a2cc5eee8f0712bb6ede17a6d9929449377",
      "restoredBase": "f53db6de673164020250a867da868c190348cf666dee79893b708eadc5c6d45f",
      "integration182": "a2e5a4036d4adcb7d66798652b7944b4898a6c55331b617ab98c993a8c383aa5"
    },
    "currentSha256": "b481b6b593cd875950d47312f15fa00ba1d1aa0f6c28f5233cff2983df62262f"
  },
  "scripts/verify-campaign-art-v179.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": "994769d1e8faff4a7ea90da1c136f96b0dba9ca8ecf2543ad50ec1430938ce53",
      "trials180": "bb611da3d6da3053e826a040b11e6fcfcf49011860758a1bd4aef2fcc06ff99a",
      "restoredBase": "bb611da3d6da3053e826a040b11e6fcfcf49011860758a1bd4aef2fcc06ff99a"
    },
    "currentSha256": "bb611da3d6da3053e826a040b11e6fcfcf49011860758a1bd4aef2fcc06ff99a"
  },
  "scripts/verify-campaign-art-v180.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "30172790d2329b5f96460e88e21ed06ceecc3a7476f7a307c1f982071f770668",
      "restoredBase": "30172790d2329b5f96460e88e21ed06ceecc3a7476f7a307c1f982071f770668"
    },
    "currentSha256": "30172790d2329b5f96460e88e21ed06ceecc3a7476f7a307c1f982071f770668"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": "8f3342580f3969a7ddef8680af2bf4ab1df6cf64c61a67419ae8add7458e21e9",
      "trials179": null,
      "trials180": null,
      "restoredBase": "8f3342580f3969a7ddef8680af2bf4ab1df6cf64c61a67419ae8add7458e21e9"
    },
    "currentSha256": "1e5cd4c3856773f906162e1dba9a1e0ed892735e86b9882f6c0cfbc22a52d6a9"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": "763a500bddbdbac72145b64fe88419280a9d6377b80cfb7f2333140f95bc7b14",
      "trials179": null,
      "trials180": null,
      "restoredBase": "763a500bddbdbac72145b64fe88419280a9d6377b80cfb7f2333140f95bc7b14"
    },
    "currentSha256": "d6c17d6f11c66d362e92c2607a745fd8ca0ff5e416514f2c2c9c1265d1bb3825"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": "328c764b2bf467d0bc21ae86abf415a7722bd0a88cba486eb2167c22fa8f0b84",
      "trials179": "28722b10d8ef0b6e54f43c31f91a5fa5de1135b843245ff6de6dc379592d86fc",
      "trials180": "99fddfab82b05d18b40a06961cd6f42b8977a462c218d3699edd50cc575220ce",
      "restoredBase": "06ebd5a2d94ca5d1a799650534bad41c6b8964fa2d6d6395c406974a7a3dc848",
      "integration182": "9204eed81123bc26eed9a517f1727733a36879e9963ca0202b8b8ceda2a1404a"
    },
    "currentSha256": "4dd749ca44ba2cc1ef792546596105c81b7ff46cd7d156a917ec14a025b36518"
  },
  "scripts/verify-xeno-trials-boss-stages-v179.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": "dacd2bf22f3616fbeba14dcd1a874e3ce287dc9f1c204a8b485dedf4a1294c2d",
      "trials180": "dacd2bf22f3616fbeba14dcd1a874e3ce287dc9f1c204a8b485dedf4a1294c2d",
      "restoredBase": "dacd2bf22f3616fbeba14dcd1a874e3ce287dc9f1c204a8b485dedf4a1294c2d"
    },
    "currentSha256": "dacd2bf22f3616fbeba14dcd1a874e3ce287dc9f1c204a8b485dedf4a1294c2d"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "2367ee66823951d8a86207b454fc15daf6028a85d93e5f28d55d6998cd2c038d"
  },
  "scripts/verify-xeno-trials-curriculum-v179.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": "b8a7a233c1ea0fc2206df69aca1e877ec74298d148e49ec561c630150d9bd820",
      "trials180": "b8a7a233c1ea0fc2206df69aca1e877ec74298d148e49ec561c630150d9bd820",
      "restoredBase": "b8a7a233c1ea0fc2206df69aca1e877ec74298d148e49ec561c630150d9bd820"
    },
    "currentSha256": "b8a7a233c1ea0fc2206df69aca1e877ec74298d148e49ec561c630150d9bd820"
  },
  "scripts/verify-xeno-trials-events-v179.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": "aad8646f247fef73f644a252329522f5c20a95524d6f033f5c7bbe104dda8be4",
      "trials180": "aad8646f247fef73f644a252329522f5c20a95524d6f033f5c7bbe104dda8be4",
      "restoredBase": "aad8646f247fef73f644a252329522f5c20a95524d6f033f5c7bbe104dda8be4"
    },
    "currentSha256": "aad8646f247fef73f644a252329522f5c20a95524d6f033f5c7bbe104dda8be4"
  },
  "scripts/verify-xeno-trials-feedback-v149.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": "e9b3f36763c67348a50d00b4e21fa3012e6c3554496004d3a14746b684a1e561",
      "trials179": "6cc6b2229a677233405effd1d5b02f4ac81e390e9a6df7e5fb523cb69b158d5f",
      "trials180": "6cc6b2229a677233405effd1d5b02f4ac81e390e9a6df7e5fb523cb69b158d5f",
      "restoredBase": "6cc6b2229a677233405effd1d5b02f4ac81e390e9a6df7e5fb523cb69b158d5f"
    },
    "currentSha256": "6cc6b2229a677233405effd1d5b02f4ac81e390e9a6df7e5fb523cb69b158d5f"
  },
  "scripts/verify-xeno-trials-gamepad-v186.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "ec6a311d0266a1bcf17943872846888c03ee53507566736ed8c59b00ffd25e77"
  },
  "scripts/verify-xeno-trials-horde-bosses-v186.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "90f0b7a2e3185025efa89cbbca61ed402387e385f14b1de88df2aef51eeeb858"
  },
  "scripts/verify-xeno-trials-horde-checkpoint-v186.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "eeecda7fc678300cbd0b2c1f8c7f459ab12e4201f7be000b271a97f41c637419"
  },
  "scripts/verify-xeno-trials-horde-runtime-v180.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "556aee90fae398fb2959dbaf833d533b2d132d6ef1f8530770e2a9f1859dc3eb",
      "restoredBase": "556aee90fae398fb2959dbaf833d533b2d132d6ef1f8530770e2a9f1859dc3eb"
    },
    "currentSha256": "556aee90fae398fb2959dbaf833d533b2d132d6ef1f8530770e2a9f1859dc3eb"
  },
  "scripts/verify-xeno-trials-horde-ui-v180.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "5726b712abe7debf99b99271f47022230ecaeb191bff108529105fb9cd5e2fd2",
      "restoredBase": "5726b712abe7debf99b99271f47022230ecaeb191bff108529105fb9cd5e2fd2"
    },
    "currentSha256": "ba82296cefeedbd6395b1d919bd6a10049af7572b23bb53a03ef050371d9da02"
  },
  "scripts/verify-xeno-trials-horde-v180.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "48dfaa5b94212ed6cff67e4e727c7d7f0632545628b83dc88733edb0c017ddf7",
      "restoredBase": "48dfaa5b94212ed6cff67e4e727c7d7f0632545628b83dc88733edb0c017ddf7"
    },
    "currentSha256": "48dfaa5b94212ed6cff67e4e727c7d7f0632545628b83dc88733edb0c017ddf7"
  },
  "scripts/verify-xeno-trials-i18n-v186.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "fd79387bb0875cc58243bb4c34a803b878c1dd426cbd8cc592331d74d030204a"
  },
  "scripts/verify-xeno-trials-plan-v146.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": "62b344b8572fbe7ebdcc733d846c17f356227aa49ee24084527b380902508b6a",
      "trials179": "b9cc15d2912840d8ee02dd469062081af0253d9c858f6e35a07e22effff7c09c",
      "trials180": "b9cc15d2912840d8ee02dd469062081af0253d9c858f6e35a07e22effff7c09c",
      "restoredBase": "b9cc15d2912840d8ee02dd469062081af0253d9c858f6e35a07e22effff7c09c"
    },
    "currentSha256": "b9cc15d2912840d8ee02dd469062081af0253d9c858f6e35a07e22effff7c09c"
  },
  "scripts/verify-xeno-trials-reactions-v186.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "3207f3e93f31afa353039a27b75158d2e89222a7e9efd8be14e086dcd041ca03"
  },
  "scripts/verify-xeno-trials-roster-v179.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": "9399d4156d69c03a86058a314d68738fd04ddfb8abba401ac8dfe070a5cc2989",
      "trials180": "9399d4156d69c03a86058a314d68738fd04ddfb8abba401ac8dfe070a5cc2989",
      "restoredBase": "9399d4156d69c03a86058a314d68738fd04ddfb8abba401ac8dfe070a5cc2989"
    },
    "currentSha256": "9399d4156d69c03a86058a314d68738fd04ddfb8abba401ac8dfe070a5cc2989"
  },
  "scripts/verify-xeno-trials-runtime-completion-v186.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "313788a9b15b8192c46219ef5ef9ab1b8f6a0da3f478f13d77880912f51e0b6c"
  },
  "scripts/verify-xeno-trials-stage-depth-v180.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "468f4cce9af4d5d8cc9110746045be9576ea40f0511c21efc88e1811160c9bd8",
      "restoredBase": "468f4cce9af4d5d8cc9110746045be9576ea40f0511c21efc88e1811160c9bd8"
    },
    "currentSha256": "468f4cce9af4d5d8cc9110746045be9576ea40f0511c21efc88e1811160c9bd8"
  },
  "scripts/verify-xeno-trials-swarm-sprites-v180.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "044e69ecd5a0cae4586394c0a876dd57d7aed7af54446abc36c606608398c28a",
      "restoredBase": "044e69ecd5a0cae4586394c0a876dd57d7aed7af54446abc36c606608398c28a"
    },
    "currentSha256": "044e69ecd5a0cae4586394c0a876dd57d7aed7af54446abc36c606608398c28a"
  },
  "scripts/verify-xeno-trials-tickets-v179.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": "941727b23339b64e578fc4e7177e1f7443c2de57bce8e9ffdcce6439cb33b506",
      "trials180": "941727b23339b64e578fc4e7177e1f7443c2de57bce8e9ffdcce6439cb33b506",
      "restoredBase": "941727b23339b64e578fc4e7177e1f7443c2de57bce8e9ffdcce6439cb33b506"
    },
    "currentSha256": "941727b23339b64e578fc4e7177e1f7443c2de57bce8e9ffdcce6439cb33b506"
  },
  "scripts/verify-xeno-trials-ui-v186.mjs": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "1c74c02d41bb5fd2c6aba4135eb3c5b89546afb9057dbfb9cf90be40d4e0cf6c"
  },
  "src/app.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "482835e65677c536085a1344cf61c3ffa5e09e2af1b8029b949e000a533038ae",
      "trials179": "65de8b68f03f1855fcaeb231491f88c23583e06038cc6c5c624208cee5b0c540",
      "trials180": "65de8b68f03f1855fcaeb231491f88c23583e06038cc6c5c624208cee5b0c540",
      "restoredBase": "0cac52e537a5cab042d8820dd689453dada7b2ba2a86ccb3f353bdcbc8d0c546"
    },
    "currentSha256": "0cac52e537a5cab042d8820dd689453dada7b2ba2a86ccb3f353bdcbc8d0c546"
  },
  "src/campaign-art-v179.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": "236176b3f18ae485b08ab79e32701829fdd4a284505231b7400ed7f972867d68",
      "trials180": "1b6b0e7a527b44af5c80e774a80917bad9e9f4df8191dad62793987f5e1ba79b",
      "restoredBase": "1b6b0e7a527b44af5c80e774a80917bad9e9f4df8191dad62793987f5e1ba79b"
    },
    "currentSha256": "1b6b0e7a527b44af5c80e774a80917bad9e9f4df8191dad62793987f5e1ba79b"
  },
  "src/campaign-art-v180.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "51cbbe5caecd9efe4a5a2ed972cb68cda6ea579cf3bf3997a09e85a70ae7d8ca",
      "restoredBase": "51cbbe5caecd9efe4a5a2ed972cb68cda6ea579cf3bf3997a09e85a70ae7d8ca"
    },
    "currentSha256": "51cbbe5caecd9efe4a5a2ed972cb68cda6ea579cf3bf3997a09e85a70ae7d8ca"
  },
  "src/i18n-en-catalog-v185.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "ac3632c302294c3e2869d673ad6d8cd861e1b0f62641d2d16335387746a6218a",
      "trials179": null,
      "trials180": null,
      "restoredBase": "ac3632c302294c3e2869d673ad6d8cd861e1b0f62641d2d16335387746a6218a"
    },
    "currentSha256": "acf9367feb5c28cfafec57f1a584c93fadf5733aceb0c706ad453b2131a43638"
  },
  "src/mission-insertion-ui-v62.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "1e8b4c42e6b5115ff75e86c50dbace7d649c8a4b244629c7788b963a6c690dc5",
      "trials179": "5de383b9379b5466c783abeabf1b800816adbd273d48dafc0d7b7c91caa639bf",
      "trials180": "5de383b9379b5466c783abeabf1b800816adbd273d48dafc0d7b7c91caa639bf",
      "restoredBase": "5de383b9379b5466c783abeabf1b800816adbd273d48dafc0d7b7c91caa639bf"
    },
    "currentSha256": "5de383b9379b5466c783abeabf1b800816adbd273d48dafc0d7b7c91caa639bf"
  },
  "src/xeno-trials-arena-layers-v119.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "3a2a12a55d1398cc16d039664c61f278a7b9f09779a92994c5efc79139bde2c8",
      "trials179": "3a2a12a55d1398cc16d039664c61f278a7b9f09779a92994c5efc79139bde2c8",
      "trials180": "43e7feec730713ae372295330631e1aeef3c5408287d8f7a295a7deba4716f47",
      "restoredBase": "43e7feec730713ae372295330631e1aeef3c5408287d8f7a295a7deba4716f47"
    },
    "currentSha256": "43e7feec730713ae372295330631e1aeef3c5408287d8f7a295a7deba4716f47"
  },
  "src/xeno-trials-boss-stages-v179.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": "3c4e7f8bf5289fe302e4a008307c842bb93c1ac49b0af9e83c1e073147e91247",
      "trials180": "3c4e7f8bf5289fe302e4a008307c842bb93c1ac49b0af9e83c1e073147e91247",
      "restoredBase": "3c4e7f8bf5289fe302e4a008307c842bb93c1ac49b0af9e83c1e073147e91247"
    },
    "currentSha256": "3c4e7f8bf5289fe302e4a008307c842bb93c1ac49b0af9e83c1e073147e91247"
  },
  "src/xeno-trials-challenge-curriculum-v179.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": "e35fc8003f9cacdc44085edc05c01b7576362e5c388484668219f95900862dae",
      "trials180": "e35fc8003f9cacdc44085edc05c01b7576362e5c388484668219f95900862dae",
      "restoredBase": "e35fc8003f9cacdc44085edc05c01b7576362e5c388484668219f95900862dae"
    },
    "currentSha256": "e35fc8003f9cacdc44085edc05c01b7576362e5c388484668219f95900862dae"
  },
  "src/xeno-trials-combat-contract-v186.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "545602a7521f147f4597103135c359049e6531c031eaff51e676428fd8498f03"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "14e11161a71b2a65a70c085f17e4c169df2f89b3cc196bc8aeaec07af1baf5be",
      "trials179": "e98af33016b8ba0503b70b7e6bd755f1127722d023dd5138fed8e133bf42f33b",
      "trials180": "e98af33016b8ba0503b70b7e6bd755f1127722d023dd5138fed8e133bf42f33b",
      "restoredBase": "e98af33016b8ba0503b70b7e6bd755f1127722d023dd5138fed8e133bf42f33b"
    },
    "currentSha256": "e98af33016b8ba0503b70b7e6bd755f1127722d023dd5138fed8e133bf42f33b"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "48e4e6cc8091e2f266f0b6831eb5d08f523a9acc27ba1f23cea3f227aaf0a007",
      "trials179": "48e4e6cc8091e2f266f0b6831eb5d08f523a9acc27ba1f23cea3f227aaf0a007",
      "trials180": "70fd084b65a5a2f1e8fa97754d6fb01651601c0221993e79d613ea7bf126e376",
      "restoredBase": "70fd084b65a5a2f1e8fa97754d6fb01651601c0221993e79d613ea7bf126e376"
    },
    "currentSha256": "1438853fa109ad48323c2758cc81b2b00fd26ae3dae56413b4ecce0609fc839d"
  },
  "src/xeno-trials-events-v179.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": "b5fe271f5e76c08215bd9a85b8f0bc65598e3771fa842bb22854b1625e625b69",
      "trials180": "b5fe271f5e76c08215bd9a85b8f0bc65598e3771fa842bb22854b1625e625b69",
      "restoredBase": "b5fe271f5e76c08215bd9a85b8f0bc65598e3771fa842bb22854b1625e625b69"
    },
    "currentSha256": "b5fe271f5e76c08215bd9a85b8f0bc65598e3771fa842bb22854b1625e625b69"
  },
  "src/xeno-trials-gamepad-v186.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "ce1d9218a58f78ac2e6700d61e83da10952573462c92617be57f734780e44095"
  },
  "src/xeno-trials-horde-bosses-v186.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "547214fc324d4e127d413b3c3aaaf11336db9c44ec9f9d0f8b04925c6adce288"
  },
  "src/xeno-trials-horde-checkpoint-v186.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "628a497e26f1abb1e86204c9d89528951db421aa668df08fc26fc560d124ea25"
  },
  "src/xeno-trials-horde-ui-v180.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "393d5fa4d849aa799df4fe84924cb06ec61c586ed860c4a69e13652284045b3b",
      "restoredBase": "393d5fa4d849aa799df4fe84924cb06ec61c586ed860c4a69e13652284045b3b"
    },
    "currentSha256": "6d0972f7203ebe9354765afe5f2a896072829b7c36589b9d3a6b78bba754805d"
  },
  "src/xeno-trials-horde-v180.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "2547bc192db6e69f8717aa822f1bba9aea4c1e16c942f3e86118cfe15218d0e6",
      "restoredBase": "2547bc192db6e69f8717aa822f1bba9aea4c1e16c942f3e86118cfe15218d0e6"
    },
    "currentSha256": "8672d5cb2dee9dfb36e772a3d6981ad209283a62763cd965830b07cc7344c844"
  },
  "src/xeno-trials-modes-v119.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "756af6bc90755f16a6afdf3e256082a3281698045ff16a642f2e8e2e0fce4dfd",
      "trials179": "fa5c8127fa546c9276af3087ee8d9f14a87ccdb618c82dbae23a3f41fca87fb1",
      "trials180": "bb7783b5027b5a37970c76db1fd17fbe8e48a1078d7468d2feac1d30aa5f8956",
      "restoredBase": "bb7783b5027b5a37970c76db1fd17fbe8e48a1078d7468d2feac1d30aa5f8956"
    },
    "currentSha256": "bb7783b5027b5a37970c76db1fd17fbe8e48a1078d7468d2feac1d30aa5f8956"
  },
  "src/xeno-trials-programs-v186.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "b3dfa1c73cdaede439f9b80dee10094655111d9f0fb334ea3363b24add7ae8e5"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "168a272b5c8b82cc4e5770cc48e261bd2725984eafeba566363b9b488a5da0fa",
      "trials179": "2a05fd87e03bc90fea07855a1673371a6b6cee2964ba55b6b63c5fe7bc7475b0",
      "trials180": "9ea6d01aa7cad055b5f45ebf6c62f85ab2d14e4e74e9bc8cd87ef9289c9150d9",
      "restoredBase": "9ea6d01aa7cad055b5f45ebf6c62f85ab2d14e4e74e9bc8cd87ef9289c9150d9"
    },
    "currentSha256": "be1ad44500c52952fad923fe60d313abd92d129100db896f56bcf971db9787fb"
  },
  "src/xeno-trials-reactions-v186.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "2495e92a7e481e726e558df4708439a4bcd9083dca215d00b9c1d99c1c870e1b"
  },
  "src/xeno-trials-roster-v179.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": "2b0c7eceb3acc605fb2077767b5fa5e9675fb7daadeb6f9b46067627e19c7234",
      "trials180": "2b0c7eceb3acc605fb2077767b5fa5e9675fb7daadeb6f9b46067627e19c7234",
      "restoredBase": "2b0c7eceb3acc605fb2077767b5fa5e9675fb7daadeb6f9b46067627e19c7234"
    },
    "currentSha256": "2b0c7eceb3acc605fb2077767b5fa5e9675fb7daadeb6f9b46067627e19c7234"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "ef87fa84ba5f085cd0fc973b40dfeb11cf832f88b5168e259c2bc406303a2867",
      "trials179": "ef87fa84ba5f085cd0fc973b40dfeb11cf832f88b5168e259c2bc406303a2867",
      "trials180": "ece4be24b60e91881292259c91c76f77f5f7da01d0cb196e4f6f4121a0306f41",
      "restoredBase": "ece4be24b60e91881292259c91c76f77f5f7da01d0cb196e4f6f4121a0306f41"
    },
    "currentSha256": "7997b47f24c40d955b0a9eab16b74ee7e0345b2372b55642e8606a8654b123f4"
  },
  "src/xeno-trials-stage-depth-v180.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "60daeb77b6986bea8b2a4b6cdae57b69b36da6085a6e7b0cee33868ec732e74a",
      "restoredBase": "60daeb77b6986bea8b2a4b6cdae57b69b36da6085a6e7b0cee33868ec732e74a"
    },
    "currentSha256": "60daeb77b6986bea8b2a4b6cdae57b69b36da6085a6e7b0cee33868ec732e74a"
  },
  "src/xeno-trials-stage-motion-v147.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "9a23ffd03d4997f14d81c4184000e47dfdf9d33d500f30a1b001db3600faacd7",
      "trials179": "4f7313115c2fb5e420ac86d5af537507a18a4e3f0542efd97a41dce582a9e847",
      "trials180": "4f7313115c2fb5e420ac86d5af537507a18a4e3f0542efd97a41dce582a9e847",
      "restoredBase": "4f7313115c2fb5e420ac86d5af537507a18a4e3f0542efd97a41dce582a9e847"
    },
    "currentSha256": "4f7313115c2fb5e420ac86d5af537507a18a4e3f0542efd97a41dce582a9e847"
  },
  "src/xeno-trials-swarm-sprites-v180.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": "4ca13173505d69e04a818b98f56b3b1de1e41e4bfaa3d1c236b3313f58bddf06",
      "restoredBase": "4ca13173505d69e04a818b98f56b3b1de1e41e4bfaa3d1c236b3313f58bddf06"
    },
    "currentSha256": "4ca13173505d69e04a818b98f56b3b1de1e41e4bfaa3d1c236b3313f58bddf06"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "205e7446f0f0ca4a92e33ed200fd2eedd9b0dfeeb4c61529a1e679dab1a000a1",
      "trials179": "b87beaa68aa701def2d0da4de5ef5ebedecf0ce03b3b5caf231de766963c61af",
      "trials180": "9cafc6217d0da3466f4a5e26809b70a8e68ae025eb7d779c58acb370f884fdd7",
      "restoredBase": "6ea0751f38608e8908599b28c2d67bbd388515a543ebf21ef39296844a56b261",
      "integration182": "205e7446f0f0ca4a92e33ed200fd2eedd9b0dfeeb4c61529a1e679dab1a000a1"
    },
    "currentSha256": "b758d08679ca76735eecaf1dfd7adda1b889b157f627952be314e8096a289a05"
  },
  "sw.js": {
    "kind": "runtime",
    "predecessors": {
      "main803": "ff86bba365c3875c8ebaeb0abe13b2a6185ccd5f1a030b4ee5b15ac0e4a12f9b",
      "trials179": "4be687c094d35f7487b92d40ede89504a60f9f5456999ab39367413e7bc6ca6d",
      "trials180": "9c24b8932ddcf30e836a363178be4148d6699cfbc631901255fdbd039225cc96",
      "restoredBase": "a5e472ab151303c4d3ac465283d94ab6926ede0fa8ae545789634ccf55ed5cfd"
    },
    "currentSha256": "8aacf705753116705acfffa7f60333219b2d9e772ef2f1f159797c3d069dcc5e"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "predecessors": {
      "main803": "861ce30fd8721d0406fdef9e6881ac3220f3a58ab4d46b7e1878463063b26682",
      "trials179": "861ce30fd8721d0406fdef9e6881ac3220f3a58ab4d46b7e1878463063b26682",
      "trials180": "bdd9199f651ef89eed8c9144acbf7a48351bcec8756b785df6e5d3c968f204c7",
      "restoredBase": "bdd9199f651ef89eed8c9144acbf7a48351bcec8756b785df6e5d3c968f204c7"
    },
    "currentSha256": "6021c148e22b50be250598903bc093487a4e7270354be975874b22c0f3ea7d8b"
  },
  "xeno-trials-v96.css": {
    "kind": "runtime",
    "predecessors": {
      "main803": "7b34c819ecd9f6843d59f7534e902603ad80fa1b02d55ecdfc1ee5ac82a4b5ea",
      "trials179": "7b34c819ecd9f6843d59f7534e902603ad80fa1b02d55ecdfc1ee5ac82a4b5ea",
      "trials180": "5ccc8bb23f3c16c8dfef230de5b05aa7d48ecd117df8a66fffe741b9f89bc2fa",
      "restoredBase": "5ccc8bb23f3c16c8dfef230de5b05aa7d48ecd117df8a66fffe741b9f89bc2fa"
    },
    "currentSha256": "b249efbc8e66d9c28c74414bf6f339af600634d0eb265ca5f002b9ba80022eb8"
  },
  "docs/forge/xeno-trials/progress-v163.json": {
    "kind": "document",
    "predecessors": {
      "main803": "c8b7f7d75cdd67bc1904b58775e3b93a8b1689c20723461162961a4fc1e73878",
      "trials179": "cc61060d14f3e7b5ecceccb7d36f897da8175965e7e15fb71a5de2be0676644a",
      "trials180": "cc61060d14f3e7b5ecceccb7d36f897da8175965e7e15fb71a5de2be0676644a",
      "restoredBase": "c8b7f7d75cdd67bc1904b58775e3b93a8b1689c20723461162961a4fc1e73878"
    },
    "currentSha256": "c8b7f7d75cdd67bc1904b58775e3b93a8b1689c20723461162961a4fc1e73878"
  },
  "docs/forge/xeno-trials/i18n-trials-review-v186.json": {
    "kind": "document",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "e1bba7b3aa1c3bef82795963d7257354adac72913d419432f26ed49db4336974"
  },
  "scripts/qa-xeno-trials-completion-v186.py": {
    "kind": "source",
    "predecessors": {
      "main803": null,
      "trials179": null,
      "trials180": null,
      "restoredBase": null
    },
    "currentSha256": "795b4903b6bb5aa7531dfe6b8da397edd7771f361465475db831e1c10b9527a0"
  }
});

export function reviewedCompletionDigestV186(path, endpoint) {
  const record = COMPLETION_SOURCES_V186[path];
  if (!record) return reviewedStageOperationsDigestV188(path, endpoint);
  assert.ok(validHash(endpoint), 'Missing V186 completion predecessor: ' + path);
  assert.ok(Object.values(record.predecessors).includes(endpoint), 'Incorrect V186 completion predecessor: ' + path);
  assert.ok(validHash(record.currentSha256), 'Invalid V186 completion digest: ' + path);
  return reviewedStageOperationsDigestV188(path, record.currentSha256);
}
/** Called only after the full historical admission has validated its sources. */
export function completionRuntimeSourcesV186(historical) {
  const result = { ...historical };
  for (const [path, record] of Object.entries(COMPLETION_SOURCES_V186))
    if (record.kind === 'runtime') result[path] = reviewedStageOperationsDigestV188(path, record.currentSha256);
  return stageOperationsRuntimeSourcesV188(result);
}
export function verifyCompletionV186(readSource = readRepository) {
  for (const [path, record] of Object.entries(COMPLETION_SOURCES_V186)) {
    assert.ok(!path.includes('..') && !path.startsWith('/'), 'Unsafe V186 completion path');
    assert.deepEqual(Object.keys(record).sort(), ['currentSha256','kind','predecessors']);
    assert.ok(['runtime','source','asset','configuration','document'].includes(record.kind));
    assert.deepEqual(Object.keys(record.predecessors).filter(key=>key!=='integration182').sort(), Object.keys(COMPLETION_BASELINES_V186).sort());
    for (const endpoint of Object.values(record.predecessors)) assert.ok(endpoint===null || validHash(endpoint), 'Invalid V186 completion predecessor: ' + path);
    assert.ok(validHash(record.currentSha256));
    assert.equal(sha(readSource(path)), reviewedStageOperationsDigestV188(path, record.currentSha256), 'Unreviewed V186 completion bytes: ' + path);
  }
  verifyStageOperationsV188(readSource);
  return Object.freeze({ sources: Object.keys(COMPLETION_SOURCES_V186).length,
    runtime: Object.values(COMPLETION_SOURCES_V186).filter(record=>record.kind==='runtime').length,
    historicalResultsTransferred: false });
}
