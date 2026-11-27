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
    "bytes": 160941,
    "sha256": "7d0d953753d5e51112822dce17653d6b84318df5f40ed885398e78f00acabba3"
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
  },
  "archives/dlc-historical-recovery-20261126/RECONCILIATION_20261126.json": {
    "bytes": 62228,
    "sha256": "7fd6b4353e6e6bdd626bee75dad8ea0b593f7ac1c9e38197711e86f3970f2aa1"
  },
  "archives/local-recovery-20261125/MANIFEST.json": {
    "bytes": 49769,
    "sha256": "0b09331b5f8a5c1f4c4fd16a200e7aff88e773064e46258dee05641b3d3b5345"
  },
  "archives/local-recovery-20261125/alien-covenant/ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "819d6bbc6b91545a7b7dd53ed51010f407b5b79bf57584b1758ba97ce5ce1d37"
  },
  "archives/local-recovery-20261125/alien-covenant/ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip.part002": {
    "bytes": 10485760,
    "sha256": "255347aa6e955344004b2fda54a529044a48656feaa8e80936e2e2b7b2c9241e"
  },
  "archives/local-recovery-20261125/alien-covenant/ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip.part003": {
    "bytes": 10485760,
    "sha256": "e0499929c671d8cb35017ce4f3770f7766f0c0ff1b18ee4319b5a01e7a1e2e1d"
  },
  "archives/local-recovery-20261125/alien-covenant/ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip.part004": {
    "bytes": 10485760,
    "sha256": "03c6851fd8dedaa26e0ec79e208ec429ca2c6c5468d33546245cc5c7fd6373b2"
  },
  "archives/local-recovery-20261125/alien-covenant/ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip.part005": {
    "bytes": 10485760,
    "sha256": "71a884485076a065fcc2b3e8a60b9a8eef75615030707cbb41478c66fb4a41ae"
  },
  "archives/local-recovery-20261125/alien-covenant/ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip.part006": {
    "bytes": 10485760,
    "sha256": "6de2f9541be3904b0ebd397c54629e276a9426fd2b71801e75728141adf94318"
  },
  "archives/local-recovery-20261125/alien-covenant/ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip.part007": {
    "bytes": 10485760,
    "sha256": "208672b4f0edc0ca36551883332e2a8358f1356e5e32b98c00702ab62eb7211f"
  },
  "archives/local-recovery-20261125/alien-covenant/ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip.part008": {
    "bytes": 4035066,
    "sha256": "299c328472110eaae2641e10cf2bb351ed35f0db2b38de59a0f720ba815daaf7"
  },
  "archives/local-recovery-20261125/alien-earth/ALIEN_EARTH_DLC_V11_MODULE_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "617b87da33c483b191d62c1fb68da5e2a8100252f11d7774f7d6016f6873785b"
  },
  "archives/local-recovery-20261125/alien-earth/ALIEN_EARTH_DLC_V11_MODULE_COMPLET.zip.part002": {
    "bytes": 10485760,
    "sha256": "22ffd1258d0ebc88b288a76fea05488dc737699f07d13fae5ee1607d5fcbe6b0"
  },
  "archives/local-recovery-20261125/alien-earth/ALIEN_EARTH_DLC_V11_MODULE_COMPLET.zip.part003": {
    "bytes": 2924202,
    "sha256": "3c73fba993587e3fef936599a8d027db43e877c1e5d5747f563f872122e7eb36"
  },
  "archives/local-recovery-20261125/alien-hors-des-ombres/ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip.part001": {
    "bytes": 10485760,
    "sha256": "f2478a7a3e3ba286c7a366447a5d942469759453fb2c1d4189a9fd5ba5d02d07"
  },
  "archives/local-recovery-20261125/alien-hors-des-ombres/ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip.part002": {
    "bytes": 10485760,
    "sha256": "ea2310c27364f46ac7ee0e4a9c4546a46f8822a2166953d73d0d7829ffbe78d8"
  },
  "archives/local-recovery-20261125/alien-hors-des-ombres/ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip.part003": {
    "bytes": 10485760,
    "sha256": "a0427f6a534c1adbae7c86303698011c5697bda1aad863c3ccb3d9426154c157"
  },
  "archives/local-recovery-20261125/alien-hors-des-ombres/ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip.part004": {
    "bytes": 10485760,
    "sha256": "c76a00d2ba17bff3052e1f66afe9d3e8b5181ddd7579483e65f95579142b30da"
  },
  "archives/local-recovery-20261125/alien-hors-des-ombres/ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip.part005": {
    "bytes": 10485760,
    "sha256": "1ca602210b7dc3a12d2f7f64f75de5545ca8bcc8cde913fdba2736f659c94840"
  },
  "archives/local-recovery-20261125/alien-hors-des-ombres/ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip.part006": {
    "bytes": 10485760,
    "sha256": "22964de349b9e7770d7c8f31500c8bd4a62ea155e7b611dc4d01ecfc9d000eeb"
  },
  "archives/local-recovery-20261125/alien-hors-des-ombres/ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip.part007": {
    "bytes": 10485760,
    "sha256": "0990fc54f7c474e87c5cc6c2b45b825f6360aa21a786daac6a044899602ed50c"
  },
  "archives/local-recovery-20261125/alien-hors-des-ombres/ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip.part008": {
    "bytes": 10485760,
    "sha256": "83bba43d07ff02ceaec7392d81ec94d0ba69c539b010837012fe6ce705d4ea12"
  },
  "archives/local-recovery-20261125/alien-hors-des-ombres/ALIEN_HORS_DES_OMBRES_V0_10_LE_MARION_PIECE_PAR_PIECE.zip.part009": {
    "bytes": 9563135,
    "sha256": "75adc9798ebbfdde23546bb09b2411da87a6849420ac97decad5c50c2b742f7f"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.1.0_DLC_AUTONOME.zip": {
    "bytes": 8481728,
    "sha256": "28d0fae31df52d8b30b18c56b0ee42bcef919ece5a085a82c17c3eb0d0df8fc5"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part001": {
    "bytes": 10485760,
    "sha256": "c02dac5b04b4b6f4ca23236c56ce2aaca4896763b61a678b4dd174c26fe2cad5"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part002": {
    "bytes": 10485760,
    "sha256": "d7e847bd446cbd0920427051d610c205064b9a0e37ebc80a711c82e134b70307"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part003": {
    "bytes": 10485760,
    "sha256": "b7ccc588e76bf71dca036e8bfe2d6d5dc7f04ffff6385e8202c4e9439e993f4d"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part004": {
    "bytes": 10485760,
    "sha256": "f7461d7bf4f62f71519961f501337c1d3630f975a1e0b1d8b59073399e039ba4"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part005": {
    "bytes": 10485760,
    "sha256": "2dff631d9ffbbbb996ccc5f764c89c3fa0b5071e9f2562ba67dc0cc5e1f9adbc"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part006": {
    "bytes": 10485760,
    "sha256": "f1a1533f4253a0e6de0c2872589c8e7dc305fba70c57aa6d523a7de5b31d7e48"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part007": {
    "bytes": 10485760,
    "sha256": "77b14148ba0993319a63e960081206382ee0f1bec6de3e6875eec0ca9f267249"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part008": {
    "bytes": 10485760,
    "sha256": "9f6be9eca26ad23cb5836b8594fd54aa1461457021ea1de7d5c11535a0f6aca1"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part009": {
    "bytes": 10485760,
    "sha256": "da5f65e770b0b0401c20546680cbdea4f6ffaf4adb64baee1db86325509ca350"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part010": {
    "bytes": 10485760,
    "sha256": "45dab49f745fda56bf07126fb7b1ddafe2b4b6b40fcd44b84d28a06545594780"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.10.0_DLC_AUTONOME.zip.part011": {
    "bytes": 10312844,
    "sha256": "917294046b6ea09af639383d9ac10c80c6c3fe31b679a0d9e67f3889bd785874"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.2.0_DLC_AUTONOME.zip.part001": {
    "bytes": 10485760,
    "sha256": "4d39df305163e9b40ca684e74eafc19829000342447fb37fc490962b32aea8e3"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.2.0_DLC_AUTONOME.zip.part002": {
    "bytes": 1472786,
    "sha256": "3771cb300f6ed6f6ece1479713236585cb8df121982258b98b51f746d27f9ef3"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.3.0_DLC_AUTONOME.zip.part001": {
    "bytes": 10485760,
    "sha256": "870d15f92283616fb829d3cf2e7099d9c2ab88eccfc63df633fbe97f5e62fe50"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.3.0_DLC_AUTONOME.zip.part002": {
    "bytes": 10485760,
    "sha256": "26b4f053bb5b2b1b0d44920eef3aad38123cf626d4100d90f7da21a444111d39"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.3.0_DLC_AUTONOME.zip.part003": {
    "bytes": 7945436,
    "sha256": "5e61a8f0a11b168dc8560e96804d7c54db289110204a9137899952102c6e99a9"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.4.0_DLC_AUTONOME.zip.part001": {
    "bytes": 10485760,
    "sha256": "db57a9e350818a26eb72026babaf184d4e3f6ca5f90eeaaa56dc254f5da153bb"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.4.0_DLC_AUTONOME.zip.part002": {
    "bytes": 10485760,
    "sha256": "549671552168779b2948099b316b466aa0d41e9449d6f8237a0dd590c76cda09"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.4.0_DLC_AUTONOME.zip.part003": {
    "bytes": 10485760,
    "sha256": "e0fc8dc7c07011870b5ab51ecf817ef49f9cb26e5648c98eb8fa98a778fb33d6"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.4.0_DLC_AUTONOME.zip.part004": {
    "bytes": 10485760,
    "sha256": "164bc94e0b138e10d238bce3e0a60b2b64a8b06034d7a7e5a93dedfc08ba3bf4"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.4.0_DLC_AUTONOME.zip.part005": {
    "bytes": 515519,
    "sha256": "d34a040bef3da367ff9015e51932c92a9fdcd221162e1ba63b17c99ec1efb459"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.5.0_DLC_AUTONOME.zip.part001": {
    "bytes": 10485760,
    "sha256": "6eef2ed45ad42d57ce2fc399eb5edb6df3df8fa6a3465ddcdb8ec3b1530c8dfa"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.5.0_DLC_AUTONOME.zip.part002": {
    "bytes": 10485760,
    "sha256": "ac95df973ca5a83fb35633f7b4b63b3e5c9c7c1b93aed8863393c982da36173f"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.5.0_DLC_AUTONOME.zip.part003": {
    "bytes": 10485760,
    "sha256": "0cde0efc63d879568184f6a1aaa082802a7331531c0cd5c4e77d864174e1d727"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.5.0_DLC_AUTONOME.zip.part004": {
    "bytes": 10485760,
    "sha256": "d615726fbb40129a0d4f2d39e1ffe6c7db16ca42baa27c41af32b3bcc011051b"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.5.0_DLC_AUTONOME.zip.part005": {
    "bytes": 10485760,
    "sha256": "74295eb4bb887a36cdaa4fb246f03fcf6c743d022d764475c4e207cd4148ddb3"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.5.0_DLC_AUTONOME.zip.part006": {
    "bytes": 1964812,
    "sha256": "9e8294bc671c014ee0e53873ee0ccef4ce536e358fd438535c81b21f86903fc9"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.6.0_DLC_AUTONOME.zip.part001": {
    "bytes": 10485760,
    "sha256": "948cd7d2262f83cb23f415f28ce9ccc1e76929f72f8392d5163c8eef9e3844a8"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.6.0_DLC_AUTONOME.zip.part002": {
    "bytes": 10485760,
    "sha256": "7a18c6c78c2bcfb3969a0659e67fae545022f9e909430842cb54348f99ab6278"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.6.0_DLC_AUTONOME.zip.part003": {
    "bytes": 10485760,
    "sha256": "f55c02939f2b4acb3608bc02c5f6659be1571dcab0290c00231af24091d096bc"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.6.0_DLC_AUTONOME.zip.part004": {
    "bytes": 10485760,
    "sha256": "9c3659ca3b7082c91810d8dd4602eaad0ebda1ec2619d74f010b6c0769b81d74"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.6.0_DLC_AUTONOME.zip.part005": {
    "bytes": 10485760,
    "sha256": "7f8b6db5c40b968483f09e4e15b68b648d85a47775cf63a3d706c763e66169f0"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.6.0_DLC_AUTONOME.zip.part006": {
    "bytes": 6653414,
    "sha256": "4bebcd54598730492e5e01249019350b3774e2908c354135540103f8e6b7d447"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.7.0_DLC_AUTONOME.zip.part001": {
    "bytes": 10485760,
    "sha256": "114842b0a7b29215d86bbaee3fda5a553a1625c92bcceee2c37adaf86cccc8f5"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.7.0_DLC_AUTONOME.zip.part002": {
    "bytes": 10485760,
    "sha256": "32488d33b8f5eeaadd48afd9c9f692c4447c015f62a7eb0ba3caf1e6e53ffa10"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.7.0_DLC_AUTONOME.zip.part003": {
    "bytes": 10485760,
    "sha256": "d4da3623192feeb0d5321593379fc8819b56db233ac286826a2bf16e0ca87b5f"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.7.0_DLC_AUTONOME.zip.part004": {
    "bytes": 10485760,
    "sha256": "be2b56b213963afcdcb4b90e52c2ec45fd8ae6c5249d5824b60f0b2b97311d2e"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.7.0_DLC_AUTONOME.zip.part005": {
    "bytes": 10485760,
    "sha256": "5eaa03f9010c1aa5977ebb7bf5e2892cd9897f3fc96d0f5a41a1e324d4581472"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.7.0_DLC_AUTONOME.zip.part006": {
    "bytes": 10485760,
    "sha256": "2ba6b9c45989628a5c50a04f7a9a4b6b53972d58dc53f6cf8dc137826386fdf2"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.7.0_DLC_AUTONOME.zip.part007": {
    "bytes": 5168457,
    "sha256": "ba40079715c71257d868dda522e470f18f36b031999fc4fb4ce9402b63e7e738"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.8.0_DLC_AUTONOME.zip.part001": {
    "bytes": 10485760,
    "sha256": "b4af87b98aa8f7603106edad25a8bb3db7a2290b779506b459a170cb2e860724"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.8.0_DLC_AUTONOME.zip.part002": {
    "bytes": 10485760,
    "sha256": "97b8d772fb3cbc875c20877e49eecdcfb43ef88408dd4dcd7c12c232e4bca8e2"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.8.0_DLC_AUTONOME.zip.part003": {
    "bytes": 10485760,
    "sha256": "56e1587f7403a7abab0490adda9dab97951a903d43d7044facf1338df2bb935a"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.8.0_DLC_AUTONOME.zip.part004": {
    "bytes": 10485760,
    "sha256": "5c2e308095f588ccdcf8a96267fef665ef7fe2cdd7b0b2f7ef68845cff6be464"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.8.0_DLC_AUTONOME.zip.part005": {
    "bytes": 10485760,
    "sha256": "00c1b4a0356217ad425301490437b11a727be7ee4bf4e75df66bff40152e68fb"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.8.0_DLC_AUTONOME.zip.part006": {
    "bytes": 10485760,
    "sha256": "e98887479920ba69af83e523baa4daba6a0e3d672d7140efc89544a00bae7778"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.8.0_DLC_AUTONOME.zip.part007": {
    "bytes": 10485760,
    "sha256": "b9f3ec4cdb18b3397b72bc99874bdbb87a0ac4e425b32b2f8ee176c6c99ca934"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.8.0_DLC_AUTONOME.zip.part008": {
    "bytes": 6591644,
    "sha256": "06825b73120cedb8d55ea4a1de9961db9df93fb26197769f15f6ab7f5d69e868"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.9.0_DLC_AUTONOME.zip.part001": {
    "bytes": 10485760,
    "sha256": "24f5eea6cec5b9baa8b203eeebce3929fd67df9c424cbec70e4551ebd820251c"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.9.0_DLC_AUTONOME.zip.part002": {
    "bytes": 10485760,
    "sha256": "cfa0595454a03dbe61e6832d6bac530cfd67ff0e10fae6ad60e3e1a5ff85ca72"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.9.0_DLC_AUTONOME.zip.part003": {
    "bytes": 10485760,
    "sha256": "3afa03c7d9a23b36570ec7f34ae592c1609f112e757037b117d9ea7bc2d3818a"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.9.0_DLC_AUTONOME.zip.part004": {
    "bytes": 10485760,
    "sha256": "fa1bfa432115cbddb168ebd184b78dff5ed333140ec1f20017a44155d2122d4e"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.9.0_DLC_AUTONOME.zip.part005": {
    "bytes": 10485760,
    "sha256": "cec22a293d908e787ade96d99ae414bf12c82f7c35dca7d8b05b6396483b783f"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.9.0_DLC_AUTONOME.zip.part006": {
    "bytes": 10485760,
    "sha256": "8e1f244adb55b3c7ed6c048519089bda44710af6402a80bd3e6819bae77a3c92"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.9.0_DLC_AUTONOME.zip.part007": {
    "bytes": 10485760,
    "sha256": "9921b92754633585e79f3c0edd35399db7e88f553e29e294f005204bb3b124df"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.9.0_DLC_AUTONOME.zip.part008": {
    "bytes": 10485760,
    "sha256": "6b6e979674c08a4199a6d3f9851ab46e7370d65bf6d5e773f88a314043757889"
  },
  "archives/local-recovery-20261125/alien-mer-des-chagrins/ALIEN_MER_DES_CHAGRINS_v0.9.0_DLC_AUTONOME.zip.part009": {
    "bytes": 913412,
    "sha256": "cf774e1080c5b75e0703fa09bc04acb6f309bd6a25094fcf638c5ac774bf50d9"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part001": {
    "bytes": 10485760,
    "sha256": "e4e1a62c33ecf3801d797a7b9628df48f51c986a2d6beb6b2f5307ca4c82d7d8"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part002": {
    "bytes": 10485760,
    "sha256": "f64cbf7e44d523892f24082a0f6697fb3243236c2068daa640e2f9208b2498f2"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part003": {
    "bytes": 10485760,
    "sha256": "2fd12a4bec567234ad995916aa2c8345accf2a119fc1c58ea5f17847853e6a80"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part004": {
    "bytes": 10485760,
    "sha256": "c92804e50334257c092cafa998485add6c87476e7bda8ff7097716d2a5866e5f"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part005": {
    "bytes": 10485760,
    "sha256": "7ec181d233e3397b304ff38d8d2357f299c0b01c56231fbacb03a52897ccd148"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part006": {
    "bytes": 10485760,
    "sha256": "ed7a806ae447b8b8e1a6ace67a0e7a6dd8ce22d5a55dd5e22cf7bc18d3a8c7e5"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part007": {
    "bytes": 10485760,
    "sha256": "6be79db88f492b119b9ff9f5113507122567bc60e8d8bd07503cc9fbde7e03cd"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part008": {
    "bytes": 10485760,
    "sha256": "5343a7c247dac2eae6fc78c3695d78ffd26babe248e94454fd47ec4352d25235"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part009": {
    "bytes": 10485760,
    "sha256": "8b4c56667559f962ec27a04d075f6498437bce56845137c1987ac4c3e675b77d"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part010": {
    "bytes": 10485760,
    "sha256": "3df823b5b724eaf53aeab5588098df9883512a6452d5f2a567413af190092693"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part011": {
    "bytes": 10485760,
    "sha256": "f5ec10f7f8990c3ec35dae283776da8fdee1cfc44405a93f57869f55d9c1f973"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part012": {
    "bytes": 10485760,
    "sha256": "5923b6dd17c3504ea8cb857cc6643be6448ec3492b134751d8d22b1dc84195c9"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part013": {
    "bytes": 10485760,
    "sha256": "9ff08197bab94c0e4540c7ef02c42647fcda3744142e36810098f129a4b72699"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part014": {
    "bytes": 10485760,
    "sha256": "a8d06a8f70aa35d53eb951b31d40ed6e2ca87da97a36f792918e24f944612909"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part015": {
    "bytes": 10485760,
    "sha256": "8700f2fa0eaad2835523e0f367c81f61079c08a47328e72171931223d4103256"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part016": {
    "bytes": 10485760,
    "sha256": "64ff7d1eefe2accdddabc6d281fe36c95b245c004735018a8a6ca454ea3f6a4a"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part017": {
    "bytes": 10485760,
    "sha256": "6b86ac99ccae69e0dc6e163afe8ee9b34b7f4cfecb46b6e1282c0d57ec2e3463"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part018": {
    "bytes": 10485760,
    "sha256": "4ac4e2e536a00fec3d693209634f319b18b74bd6ea2ea8c19f0aefec607f2bd9"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part019": {
    "bytes": 10485760,
    "sha256": "b18ff7e978bec4455eee24530c8a3348b870db46a280ee792b473e13d34e4e2f"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part020": {
    "bytes": 10485760,
    "sha256": "e73628eb799cf76297c536c04950cf4eb62aad30990f3fdbc39a08728459f7a3"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part021": {
    "bytes": 10485760,
    "sha256": "8c78b28be78b02d46c7c351bfcb81114287ea237888245d18b184a97ec970c64"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part022": {
    "bytes": 10485760,
    "sha256": "68bd336bcb284fd997c0ffc714cea161db245a73a5fb32624bc0b45b6a5c7237"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part023": {
    "bytes": 10485760,
    "sha256": "dd86374eed69d6df43c225206846cb606adc36ff84d94ce8850505d01a5ffcce"
  },
  "archives/local-recovery-20261125/alien-resurrection/ALIENS_TANTALUS_DLC_ALIEN_RESURRECTION_V125.zip.part024": {
    "bytes": 8395416,
    "sha256": "2ab2846e8a743a6ae98fa92127b4a29a8bd470ffaff3019f45ba1b4265ec05c5"
  },
  "archives/local-recovery-20261125/avp-2004/ALIENS_TANTALUS_DLC_AVP_2004_v0.11.0.zip.part001": {
    "bytes": 6291456,
    "sha256": "6098da5c0b00edfaf12b980a96e85e3e8eb67323dd814f3b4f6cf2e8cae833f5"
  },
  "archives/local-recovery-20261125/avp-2004/ALIENS_TANTALUS_DLC_AVP_2004_v0.11.0.zip.part002": {
    "bytes": 10485760,
    "sha256": "eb9d7fd332a0e1ba40b730076a68945294535b3e857d7672abca5fea18620d87"
  },
  "archives/local-recovery-20261125/avp-2004/ALIENS_TANTALUS_DLC_AVP_2004_v0.11.0.zip.part003": {
    "bytes": 10485760,
    "sha256": "917377b6b8783c9aef80033c547008549917800e0dca54b94ec97da16a3ec6e5"
  },
  "archives/local-recovery-20261125/avp-2004/ALIENS_TANTALUS_DLC_AVP_2004_v0.11.0.zip.part004": {
    "bytes": 10485760,
    "sha256": "4d7b183e065dba1b3cac0ce1c434d4d5a9741ac54a2be00742a31f50d2841b19"
  },
  "archives/local-recovery-20261125/avp-2004/ALIENS_TANTALUS_DLC_AVP_2004_v0.11.0.zip.part005": {
    "bytes": 10485760,
    "sha256": "50a982166742f3bd71c6ab712fb61f1b2bd21c8eb1aba7e47c227d470ca04057"
  },
  "archives/local-recovery-20261125/avp-2004/ALIENS_TANTALUS_DLC_AVP_2004_v0.11.0.zip.part006": {
    "bytes": 10469518,
    "sha256": "bf6aab76e57b8bf4559b4f906befa6f1fbd139f588f7fdd06383bf19a58b1b30"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part001": {
    "bytes": 10485760,
    "sha256": "65c882a0afc4603dc60f3bb8a38d2dbcc43783c384582bbca6665e81388b0a32"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part002": {
    "bytes": 10485760,
    "sha256": "061277962ea92c166b814dd40554c5e18fb74b4d91d88508c2ecedf1ff818518"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part003": {
    "bytes": 10485760,
    "sha256": "314b8597158672f85a026cf997ebf9976dff5c2bff47889e8412c6198af16182"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part004": {
    "bytes": 10485760,
    "sha256": "770dbca5c80a051162f21d239083d7b45fbb9387c023bbe76af696911c055dba"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part005": {
    "bytes": 10485760,
    "sha256": "a8b524cce48cd4cb3beef5840b1a7100a0effab409b2c4fd24ab3e6fd733322c"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part006": {
    "bytes": 10485760,
    "sha256": "3db27e25dc05170d92edc8c4597cd1a1c091ead3feae616f069a0ad788eabf9f"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part007": {
    "bytes": 10485760,
    "sha256": "e554bfd55bf6956e22d58eba6783072508df770a6e1100d84f75aaf26643941c"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part008": {
    "bytes": 10485760,
    "sha256": "2876fcbce9c0f71d308f41e9591b2d62403e3786560ba94b999d98bafdc278db"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part009": {
    "bytes": 10485760,
    "sha256": "38bdf37ef8eedf8296ea3997956f5fcca5342b90ff8c1baf92a548bc2ccb1d58"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part010": {
    "bytes": 10485760,
    "sha256": "79683a5b3f573e45286caa5fbf10e5be5ee4bfab5c7f38c41b84a1839f61116d"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part011": {
    "bytes": 10485760,
    "sha256": "9423fc96038234984a24fdfe364af7f643df6f35cf08b40d79a235cb1aa8b168"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part012": {
    "bytes": 10485760,
    "sha256": "a7bebfc309d01ad7c1fa18274cff4d99cbfe2c736aae65025699f4435b46cf36"
  },
  "archives/local-recovery-20261125/mire-nostromo/ALIENS_TANTALUS_MIRE_NOSTROMO_V119_CONTINUITE_NOSTROMO.zip.part013": {
    "bytes": 7627414,
    "sha256": "73361ff73d2bbb0da68c525d27363300785306c076add0efa2537cc8649c241b"
  },
  "archives/local-recovery-20261125/reconstruct.py": {
    "bytes": 10133,
    "sha256": "2cc9140a15975de512e79ec4000fbe42b8d71bd37761bfcf5116d8681c6e8c3c"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/MANIFEST.json": {
    "bytes": 6903,
    "sha256": "88658b9933cea71f1362f8801be4b08fd3a7a3ae961d14e170c339d0ff66b87a"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/RAR_CONTENTS.json": {
    "bytes": 64842,
    "sha256": "ee7c76da0b3c7535fb0a998bbf083b3f6095ee030658b000b2db6d7168d63086"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/README.md": {
    "bytes": 2810,
    "sha256": "2bb9691cf5ecaf4b6e9dfcaf0fb74a03e22fa44faada2b0a6d630adb3317cbde"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part001": {
    "bytes": 10485760,
    "sha256": "99eeb0daa3f47199b7d786b8a12e17274c3e4eaeac8cf410299e71b8c86a2287"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part002": {
    "bytes": 10485760,
    "sha256": "bd7823dd220f5b71b150789ac3396c6ca9b8f958cfcc5a1a08293a1238ce24a1"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part003": {
    "bytes": 10485760,
    "sha256": "b2ad171c86f80831d6597752e6b1a008d31690a1d845b2561a122d6fe0452ae2"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part004": {
    "bytes": 10485760,
    "sha256": "7eae3c61ae1c7ae35932e9b4b1ffbe2ab9e27d933a618d4cd24b6b4ba9a2609c"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part005": {
    "bytes": 10485760,
    "sha256": "7346c167b5b3de1e626124688aa85933704e71453c1d0aba8c3ab937a8b371be"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part006": {
    "bytes": 10485760,
    "sha256": "b930d85de55699ee4ed8637d24d2911c99bcb27d4ae007b62723f2662e74710c"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part007": {
    "bytes": 10485760,
    "sha256": "6a9e1f881a3fd9b50e026c7cac152702716420a6cc5e6f9da7b796f361659aa8"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part008": {
    "bytes": 10485760,
    "sha256": "6e728dacd8b52c889ca3989619171b053395deea4c5d3ea282ff6b16ba6788b6"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part009": {
    "bytes": 10485760,
    "sha256": "e9e3ef7810f77ea2aa12136eaa3680b2a4706c91b51254e4bfad3a051a785823"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part010": {
    "bytes": 10485760,
    "sha256": "d11239f40e79381745b1996e8b2ff9ea725e1c307613ed622a84a6f68dae4784"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part011": {
    "bytes": 10485760,
    "sha256": "3c06e9befcfad8d5e8e1e2c3de16e34ceba3b16cfab88a2de3b5544be2cf73e6"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part012": {
    "bytes": 10485760,
    "sha256": "768217bb81e1548f9f06f8e556103d80e22ce232958692ff4297bad9e14ff3d9"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part013": {
    "bytes": 10485760,
    "sha256": "bc618ffbfca95647be73db3399414bfdad6d230657e3a00041530f9de4140c06"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part014": {
    "bytes": 10485760,
    "sha256": "2e7a9189a8d853ab35517f648405195167650eda98c7a119755c4088b6d4bf4c"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part015": {
    "bytes": 10485760,
    "sha256": "c1cef9dd443b1c6002ad0e155260e53c2fca5a974a92564ed0309edf4568067c"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part016": {
    "bytes": 10485760,
    "sha256": "9b4058011231e625cf4addeaef0a66abffdca93ba876a52453af24b9376d9897"
  },
  "archives/dlc-historical-recovery-20261126/conversation-images/2026-10-06/ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar.part017": {
    "bytes": 1019325,
    "sha256": "7e4a268b75e6e2edcc54b19d5fd446d81a5470deca6794368b24a6b5fa8491fd"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/README.md": {
    "bytes": 2261,
    "sha256": "a44d04495f4bee310b9a8d55d16ef3114ff0b0bcf3db46fc5ab63fd5822380cc"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.1.0/MANIFEST.json": {
    "bytes": 968,
    "sha256": "c3a1bb250f85a8a534f5da7059f94608d125f92f5f76c410299f3e7feaa2c4c9"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.1.0/ZIP_CONTENTS.json": {
    "bytes": 22303,
    "sha256": "bc8c12f26500bf13c9eb06fab819d80894ceee35d34865ae5d3e42657fbd36de"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.2.0/MANIFEST.json": {
    "bytes": 1317,
    "sha256": "d1e148c3bd3d593f80a14b679834297f9c3b8164f6b6c4d52550354645df60ec"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.2.0/ZIP_CONTENTS.json": {
    "bytes": 52423,
    "sha256": "5b19ea126897617b06243c729e6f1dab683bf5e9941c3dfe1a4e10b53beb61e7"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.3.0/MANIFEST.json": {
    "bytes": 1317,
    "sha256": "404f517c0f8480ee4a98e0efdbc4fd4e70cf61f40116b5dc0847bd5ed6db9a8b"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.3.0/ZIP_CONTENTS.json": {
    "bytes": 65227,
    "sha256": "af50d280f0f06b19ea53356e17c9b85596a44c12b2fa5e816e9ae12b642bc6f4"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.4.0/MANIFEST.json": {
    "bytes": 1318,
    "sha256": "a3da115c71f13821677dba4065fc55058805c2dfc58b5ab6fec1ac5c4358adcf"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.4.0/ZIP_CONTENTS.json": {
    "bytes": 83969,
    "sha256": "b385b99a95decbdd6e04d7bd5bbd732c0b803d05a0e2121d7057474062293fa9"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.5.0/MANIFEST.json": {
    "bytes": 1664,
    "sha256": "80098d426501752faf98c39343256546d3b9b79ce074ae781378df9a60653ef3"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.5.0/ZIP_CONTENTS.json": {
    "bytes": 100657,
    "sha256": "016bfa89681ae315397df78f534c62daf9135767bed77049dbf483a5c039c17b"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.6.0/MANIFEST.json": {
    "bytes": 1664,
    "sha256": "684c8505766fce98b1cfde0d7ad8e847de0c9e98b85bf0325a5772dc697cf50b"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.6.0/ZIP_CONTENTS.json": {
    "bytes": 90422,
    "sha256": "afe6777b6cf3fcd2285ad85cc94488af01e8b4e3ca47fcb7616a7169cb3e5f5b"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.1.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.1.0.zip.part001": {
    "bytes": 7604057,
    "sha256": "7c74c14e3e1e660b8285be220953e872e1745909465e8e937348d3129bebd304"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.2.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.2.0.zip.part001": {
    "bytes": 10485760,
    "sha256": "9ca8409ad9a43480ddf6cda3da6ef706c3e9e8797a90cd785f8936ed8dc36c9f"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.2.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.2.0.zip.part002": {
    "bytes": 8529764,
    "sha256": "0970342688e9725f213cc42ddbb26275bce41c334009cf0990e611ebedfde37b"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.3.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.3.0.zip.part001": {
    "bytes": 10485760,
    "sha256": "2be8d3269c3313b10465ec6e8a5f6ef2cef8e5c7aa4ff0b18b7a1e48ab6e4b69"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.3.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.3.0.zip.part002": {
    "bytes": 5207091,
    "sha256": "713f10cccae6d5a7090e07bd00e9548cfa68d7af83402f9011f0ca025d2d4b3c"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.4.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.4.0.zip.part001": {
    "bytes": 10485760,
    "sha256": "c3d218b378f6dd8bb62822385cf2163aa4183d6077f99c440ba0295ccd739bba"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.4.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.4.0.zip.part002": {
    "bytes": 10251833,
    "sha256": "1be05acd0aaa6843f53187689ede41f4610d91a52bd891d69f7ee19ae501ebec"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.5.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.5.0.zip.part001": {
    "bytes": 10485760,
    "sha256": "333bde4f9957784d5729be58f359fb3da6276f63a22a8ab7720ce2ddfc6104c0"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.5.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.5.0.zip.part002": {
    "bytes": 10485760,
    "sha256": "616271a9e9c2014918cb8c939262944820a54e2e483aac9e27b6e5737184b9c4"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.5.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.5.0.zip.part003": {
    "bytes": 2827919,
    "sha256": "42a4dfebaeee134233f0465878d5604e26fadebc72d5a17ac39096d3383409d7"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.6.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.6.0.zip.part001": {
    "bytes": 10485760,
    "sha256": "20ca2b3c0439bbcf18c0880d3a7337ac65d4f911058be53c7fe821caad6cd75e"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.6.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.6.0.zip.part002": {
    "bytes": 10485760,
    "sha256": "8f962b0603ac74f9ec688f07f8109ae275426a3f42f44416a601f1faace05f9b"
  },
  "archives/dlc-historical-recovery-20261126/alien-blackout/v0.6.0/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.6.0.zip.part003": {
    "bytes": 4084548,
    "sha256": "e6a95b1d17cdaecce40e2b5f6d8f88522642580501104d0d4f3a469fdd21c81f"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/README.md": {
    "bytes": 2496,
    "sha256": "ae517c74cfde4e859320f69daec907cb495ed030316f3772843f38df3461ad10"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v1/MANIFEST.json": {
    "bytes": 1266,
    "sha256": "f7d9573d59beab1b3591e060243180ef324c8f3fbb7c65a917c4084a85723283"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v1/ZIP_CONTENTS.json": {
    "bytes": 12872,
    "sha256": "289d152e108d0379d39e3c027e8c22b69ca39b1fb4a4e58081120f43c7d597d9"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v10/MANIFEST.json": {
    "bytes": 1935,
    "sha256": "0185dd57b805228f231c82abebc9f9b22e7ee742121ac5a84ec432175f03d655"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v10/ZIP_CONTENTS.json": {
    "bytes": 61347,
    "sha256": "fe6f9277a021d5b9a74e09afe6ac7293fdb411c3ecf186eadad46e8e852c13ab"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v2/MANIFEST.json": {
    "bytes": 1258,
    "sha256": "b6107ec85476f9ca69bb81e70d40e4cb1a18b2fbf6e504c9885c730e4ca42a9d"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v2/ZIP_CONTENTS.json": {
    "bytes": 20549,
    "sha256": "a6a2a182d8547b3c90dd59c089aebe1c5d10e6f20126dc19deb175ab13ade9a1"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v3/MANIFEST.json": {
    "bytes": 1258,
    "sha256": "47845adff75209b0d5cc4d8a6f1d7b51026928906e2e2c9e6c5f8edbcd2da51c"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v3/ZIP_CONTENTS.json": {
    "bytes": 21717,
    "sha256": "837ab37df6571cd2b4e17fb4036d2d2fd6a7e2d22d7c7028eb02069b4d69de55"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v4/MANIFEST.json": {
    "bytes": 1258,
    "sha256": "26fd731e5df52d556c6396b8c2753b8cef3d9dde246d580c407a65f5458a2d14"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v4/ZIP_CONTENTS.json": {
    "bytes": 25030,
    "sha256": "8ad5cd2d0baf68410c40d98128cce2f240208d3e8595310e7ba931a8c9d88272"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v5/MANIFEST.json": {
    "bytes": 1259,
    "sha256": "fdb71c4b122fbd9cee0e31e0dc3af77ffc142b9936bb8680b4e75c90ccc29063"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v5/ZIP_CONTENTS.json": {
    "bytes": 31589,
    "sha256": "a8e03e14f334957a4860cf503ee60549c84d9bb3995bab50518fd3c989d5c044"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v6/MANIFEST.json": {
    "bytes": 1591,
    "sha256": "0f9078859a7318977b14ecad20379e504e8b63289eacbad592b6115d2c32edb3"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v6/ZIP_CONTENTS.json": {
    "bytes": 42912,
    "sha256": "0accb707e1985e7e928153af6af3aee26df61b8c7cc072be3857b83be36ddd51"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v7/MANIFEST.json": {
    "bytes": 1591,
    "sha256": "eea5f0570aaf06a45e0969671403502b3a3c3846c7140415b151ecb2127ccce9"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v7/ZIP_CONTENTS.json": {
    "bytes": 51572,
    "sha256": "b84d8190f4d50dd6f7bebd79fa655a169933d3a7a27141e107bf327e056bfc53"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v8/MANIFEST.json": {
    "bytes": 1591,
    "sha256": "f06ade72bc429c0cb9bdd9ea6451d4f7a1bc2f1bf149b9c42d4da491ddce7fd0"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v8/ZIP_CONTENTS.json": {
    "bytes": 60238,
    "sha256": "7d3844a32918010b3bbccb4b2cd860b7e08488d415a103568a64fefd128ea73c"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v9/MANIFEST.json": {
    "bytes": 1923,
    "sha256": "84ae67033e860f76f13f8b6dbcb290968543bcd699ef862555fc70738b17fcf9"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v9/ZIP_CONTENTS.json": {
    "bytes": 67838,
    "sha256": "28960ecef1bca562a04084d02a03312804cffad923a12fb1bf275832dbe4db79"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v1/ALIEN_EARTH_DLC_V1_PROTOTYPE_JOUABLE.zip.part001": {
    "bytes": 10485760,
    "sha256": "433febe6130244f8766ef52d659dfd2e918c39d6797798575b193875f0dc799d"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v1/ALIEN_EARTH_DLC_V1_PROTOTYPE_JOUABLE.zip.part002": {
    "bytes": 603467,
    "sha256": "ba8a897acded09ac7607ff762f4637c0f058e5a4501d7695875e3e7bfdd9c4a4"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v2/ALIEN_EARTH_DLC_V2_MODULE_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "9d3a5f361f469ac760926c9d9146e045b358e165530e7f563ff46388ba954287"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v2/ALIEN_EARTH_DLC_V2_MODULE_COMPLET.zip.part002": {
    "bytes": 6416720,
    "sha256": "5540363a20fc411975f489473f70cb1495c5b2df40282a4b0ef43c6bd4322314"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v3/ALIEN_EARTH_DLC_V3_MODULE_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "9c003bd2c7e4cd2dae4c32e51eb9dadc8cc2d825ad5379963eb40d6f5051b6fd"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v3/ALIEN_EARTH_DLC_V3_MODULE_COMPLET.zip.part002": {
    "bytes": 5699428,
    "sha256": "90307e6e5c3f64c960077fbf338fa340985925fd4f76a9445d8c384916cdfb0a"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v4/ALIEN_EARTH_DLC_V4_MODULE_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "7fafb8db6523405243121fe9c99193d57b91a3c460c1b212e25e12def35028b0"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v4/ALIEN_EARTH_DLC_V4_MODULE_COMPLET.zip.part002": {
    "bytes": 3637022,
    "sha256": "84702d94c53e60837794f7f551103fe3d78c29bb86245687aabf2c86d10614d3"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v5/ALIEN_EARTH_DLC_V5_MODULE_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "148db2a969fc1a6dc66350b81cd699f67f8e15cfe3815009a4576f354a8769d0"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v5/ALIEN_EARTH_DLC_V5_MODULE_COMPLET.zip.part002": {
    "bytes": 8907054,
    "sha256": "bb57c7881d12d4b5259021216e8651262821b65a763ce644da22a5d56782678c"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v6/ALIEN_EARTH_DLC_V6_MODULE_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "85458427822e4f33a45a2a08ea5235ee8e6674b8f966b73b5d7407492cfc36a8"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v6/ALIEN_EARTH_DLC_V6_MODULE_COMPLET.zip.part002": {
    "bytes": 10485760,
    "sha256": "21993c5f11ab86f353b0ad3e47d5adc4611aad854cb30dbd6c3fabada895a0e5"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v6/ALIEN_EARTH_DLC_V6_MODULE_COMPLET.zip.part003": {
    "bytes": 1801153,
    "sha256": "f0e0bb5070662213fd8806377cf6d9aa6f18ee3944c332eb3d8800854187662c"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v7/ALIEN_EARTH_DLC_V7_MODULE_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "b0099f315558a649cd06e96ae436a678c69937e0ef14bd91eba4d455bd69afb0"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v7/ALIEN_EARTH_DLC_V7_MODULE_COMPLET.zip.part002": {
    "bytes": 10485760,
    "sha256": "d75e2e90a2651956dc78353b8c41425c67fd04859ad6c11476668f9d4d53b646"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v7/ALIEN_EARTH_DLC_V7_MODULE_COMPLET.zip.part003": {
    "bytes": 8134173,
    "sha256": "25f4d2e99188b284900666ba370060a5df7188613f4df7ac8a4c024d26374565"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v8/ALIEN_EARTH_DLC_V8_MODULE_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "85c574e16bc7ea20b114722cd3bdf84b466e28ee8f9e172a8f2292441f9c74e0"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v8/ALIEN_EARTH_DLC_V8_MODULE_COMPLET.zip.part002": {
    "bytes": 10485760,
    "sha256": "546eda106a46109452762fe28f9cdb7063cf9f3a859a871e054afeb88a8954c9"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v8/ALIEN_EARTH_DLC_V8_MODULE_COMPLET.zip.part003": {
    "bytes": 9624044,
    "sha256": "a633529e1f560fcbf9222aa51d9a4045dacfbb62999102482287fc45d5443732"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v9/ALIEN_EARTH_DLC_V9_MODULE_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "9605c55d76fe5c20adc0da0ab45a1e761a44b1ba733ac021c00ef0d2e7cd929c"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v9/ALIEN_EARTH_DLC_V9_MODULE_COMPLET.zip.part002": {
    "bytes": 10485760,
    "sha256": "66e7e9f1aa2be414caca7736c81a3d89368866f4f84f170f5b6887eebe802a32"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v9/ALIEN_EARTH_DLC_V9_MODULE_COMPLET.zip.part003": {
    "bytes": 10485760,
    "sha256": "1f306fdb094d515c3f5045c7c6831835e4832792ff99f8dffce88598e5241eb6"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v9/ALIEN_EARTH_DLC_V9_MODULE_COMPLET.zip.part004": {
    "bytes": 5361989,
    "sha256": "760b83dfb3ec804730a4b41bbd591303ed674773da4f9a02b2badc158a17a17e"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v10/ALIEN_EARTH_DLC_V10_MODULE_COMPLET.zip.part001": {
    "bytes": 10485760,
    "sha256": "93dccc81b938f81d0c51527d456d294a775b6f5be6fd055165c65e605926a780"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v10/ALIEN_EARTH_DLC_V10_MODULE_COMPLET.zip.part002": {
    "bytes": 10485760,
    "sha256": "27681beb895db7c58ce927a0c6f31c825d2057b0da7bab23289e811f4f562961"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v10/ALIEN_EARTH_DLC_V10_MODULE_COMPLET.zip.part003": {
    "bytes": 10485760,
    "sha256": "c8fcaf18d572c7c7d57fb40acd9e6940779a75170285df1ff0360e9128bf6b3e"
  },
  "archives/dlc-historical-recovery-20261126/alien-earth/v10/ALIEN_EARTH_DLC_V10_MODULE_COMPLET.zip.part004": {
    "bytes": 7879581,
    "sha256": "e7efdc526dd396a341d3bbd98ff5e6a42afaa7699a1d62211c053e546aac978b"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v1/documents/ALIEN5_PROJET_LAZARE_V1/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v1/documents/ALIEN5_PROJET_LAZARE_V1/README.md": {
    "bytes": 6535,
    "sha256": "c43ef5a5c398f291e04e9edeb2cfb1306c4477750b8005d70ede173791e6f775"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v1/documents/ALIEN5_PROJET_LAZARE_V1/docs/CODEX_ALIEN5.md": {
    "bytes": 115307,
    "sha256": "e41281a61664a314c6150c71a7a361363cfb24e5a13eeccf8db192f13e21eecc"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v1/documents/ALIEN5_PROJET_LAZARE_V1/docs/base-audit.json": {
    "bytes": 630,
    "sha256": "a9a03270acd567ea1826bb08a5ab7e885959360b57c60a7ee221efe90ef29799"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v1/documents/ALIEN5_PROJET_LAZARE_V1/docs/campaign.json": {
    "bytes": 141874,
    "sha256": "5eb2f6d8d081a29904d8ab2d5b20a5305bc16b98b53854dd7b3725e018f9559b"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v1/documents/ALIEN5_PROJET_LAZARE_V1/game/data.json": {
    "bytes": 141874,
    "sha256": "5eb2f6d8d081a29904d8ab2d5b20a5305bc16b98b53854dd7b3725e018f9559b"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v1/DLC_ALIEN5_PROJET_LAZARE_V1_CANDIDAT.zip.part001": {
    "bytes": 7262597,
    "sha256": "e83ca79e0d920a328db05f241855e50672bcee70ea4199e408f021f2a560a3b2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v1/ZIP_CONTENTS.json": {
    "bytes": 10177,
    "sha256": "b07707370d65a8a2a7df6d230360f50cd6cfe978c3264001d24f231e99ba040e"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v1/MANIFEST.json": {
    "bytes": 3116,
    "sha256": "859a4c23f707a034152e9f8507f8bf8d24262e44dbea5381a435b002f0370d99"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v2/documents/ALIEN5_PROJET_LAZARE_V2/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v2/documents/ALIEN5_PROJET_LAZARE_V2/README.md": {
    "bytes": 8071,
    "sha256": "bceff75be9e38218425760fba60922c78ef0b6201a3848f9bcca5270a090548b"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v2/documents/ALIEN5_PROJET_LAZARE_V2/docs/CODEX_ALIEN5_V2.md": {
    "bytes": 158305,
    "sha256": "2e4109bc80c91b7e6fa8f7484523c3ff11621297910ac5ee772fd4ce7c40ccee"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v2/documents/ALIEN5_PROJET_LAZARE_V2/docs/base-audit.json": {
    "bytes": 630,
    "sha256": "a9a03270acd567ea1826bb08a5ab7e885959360b57c60a7ee221efe90ef29799"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v2/documents/ALIEN5_PROJET_LAZARE_V2/docs/campaign.json": {
    "bytes": 253550,
    "sha256": "fc699adbd5a94f0c880329b099c884affd0fa0d17ebb62f5c1691b89c28fa6dd"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v2/documents/ALIEN5_PROJET_LAZARE_V2/game/data.json": {
    "bytes": 253550,
    "sha256": "fc699adbd5a94f0c880329b099c884affd0fa0d17ebb62f5c1691b89c28fa6dd"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v2/DLC_ALIEN5_PROJET_LAZARE_V2_CANDIDAT.zip.part001": {
    "bytes": 10485760,
    "sha256": "74c63688fbba2c265a3560a5bc011e87427a6430200ca63ac58b05b40efdae42"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v2/DLC_ALIEN5_PROJET_LAZARE_V2_CANDIDAT.zip.part002": {
    "bytes": 1846371,
    "sha256": "e07ae5b211e36481c9f0f3e9c3be13a9998482326f6e336016d78d017b62e791"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v2/ZIP_CONTENTS.json": {
    "bytes": 30617,
    "sha256": "e91c30f43fc17ab4d452282eb88948be590d07df7668bbf2ae0e6a600e1bdec5"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v2/MANIFEST.json": {
    "bytes": 3461,
    "sha256": "24318726201f76c556b1ad1a0016a681eb366682d15e45781b8db795f9fc9ab6"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/documents/ALIEN5_PROJET_LAZARE_V3/CHANGELOG_V3.md": {
    "bytes": 1732,
    "sha256": "2ad0eb6bc73593f9a9e6d594213c12d9959fd2642d655d774e37d27fa96dad7f"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/documents/ALIEN5_PROJET_LAZARE_V3/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/documents/ALIEN5_PROJET_LAZARE_V3/README.md": {
    "bytes": 8948,
    "sha256": "03e1823a073f025777b46ef76dab2fd7f5e962b36acd5e258d13f976c2fff4bf"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/documents/ALIEN5_PROJET_LAZARE_V3/docs/CODEX_ALIEN5_V3.md": {
    "bytes": 34379,
    "sha256": "02294eebf912746b3106e4ef7e8ebb53516f28188a846ac703fdfeebbb7b36b7"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/documents/ALIEN5_PROJET_LAZARE_V3/docs/base-audit.json": {
    "bytes": 773,
    "sha256": "124e7f7a8f15bc447073035dd955375a8375c3024d25a502540f311c41b420b1"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/documents/ALIEN5_PROJET_LAZARE_V3/docs/campaign.json": {
    "bytes": 291608,
    "sha256": "2e9edc030014f6b32f7b1789b9bc06f96931808db589ad2462e0e7610f4b75b8"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/documents/ALIEN5_PROJET_LAZARE_V3/game/data.json": {
    "bytes": 291608,
    "sha256": "2e9edc030014f6b32f7b1789b9bc06f96931808db589ad2462e0e7610f4b75b8"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/documents/ALIEN5_PROJET_LAZARE_V3/qa/README.md": {
    "bytes": 1252,
    "sha256": "0a032b7997e8d1f3606aa4ddf7e1d1a76397163667f2d8cc23936ad1e1ebbdee"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/DLC_ALIEN5_PROJET_LAZARE_V3_CANDIDAT.zip.part001": {
    "bytes": 10485760,
    "sha256": "e7e62066117780a44046b6b6351408a5769f35daac81cfee0ecc4d7d18156b41"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/DLC_ALIEN5_PROJET_LAZARE_V3_CANDIDAT.zip.part002": {
    "bytes": 8571792,
    "sha256": "d4a40b3074c7fa770c43b4b774045c2daae9137fa04f850643724a747ef293cb"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/ZIP_CONTENTS.json": {
    "bytes": 59213,
    "sha256": "3d21b386348ed39d74ae3c8d81f7bc824de9d316064f07f32845ea704b5f9bb0"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v3/MANIFEST.json": {
    "bytes": 4188,
    "sha256": "c55fc2391da6fbad2c305d47373ac8af14becc091edd4bd47890a235230f048c"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/CHANGELOG_V3.md": {
    "bytes": 1732,
    "sha256": "2ad0eb6bc73593f9a9e6d594213c12d9959fd2642d655d774e37d27fa96dad7f"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/CHANGELOG_V4.md": {
    "bytes": 2083,
    "sha256": "9ce526ebc01f35be8b289f69a0cd48be0d3387a4a7360a3f3e8ce2bc551324cf"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/README.md": {
    "bytes": 7179,
    "sha256": "53c9000241f27421cf3f8bc63b57040e2fb4a8fcf538667d719620a31b75e0e7"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/docs/CODEX_ALIEN5_V3.md": {
    "bytes": 34379,
    "sha256": "02294eebf912746b3106e4ef7e8ebb53516f28188a846ac703fdfeebbb7b36b7"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/docs/CODEX_REGLES_V4.md": {
    "bytes": 17898,
    "sha256": "2d2bd57f1f05992a3891c4e9117654ce2bb1d6617d3619f284b31bdf3aa7940e"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/docs/REGISTRE_CLOISONS_NICHES_V4.json": {
    "bytes": 6059,
    "sha256": "4165b96e5b9bad32a32cc0a23ecf2733b3c0a30998f8824bedd864732b3e42d3"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/docs/base-audit.json": {
    "bytes": 773,
    "sha256": "124e7f7a8f15bc447073035dd955375a8375c3024d25a502540f311c41b420b1"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/docs/campaign.json": {
    "bytes": 301733,
    "sha256": "4bb9735e1a04e4b807e2b469400fe1e3c6819d86d2e823787ef4a78e2b44d490"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/game/data.json": {
    "bytes": 301733,
    "sha256": "4bb9735e1a04e4b807e2b469400fe1e3c6819d86d2e823787ef4a78e2b44d490"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/documents/ALIEN5_PROJET_LAZARE_V4/qa/README.md": {
    "bytes": 2626,
    "sha256": "d0e0725660420937201fd23bf214a2ceb38d1061e4b2e91e136f7b764fa86eed"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/DLC_ALIEN5_PROJET_LAZARE_V4_CANDIDAT.zip.part001": {
    "bytes": 10485760,
    "sha256": "d508ff030da8f211ff6c717c018e421382f8ff6a5ff2159231dc96c14e0dee26"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/DLC_ALIEN5_PROJET_LAZARE_V4_CANDIDAT.zip.part002": {
    "bytes": 10485760,
    "sha256": "8f4a66c8a508e5d6380915d582e048d300a56236aa5756ce464a2b7d312b236e"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/DLC_ALIEN5_PROJET_LAZARE_V4_CANDIDAT.zip.part003": {
    "bytes": 10485760,
    "sha256": "230810f75b0504b735e494cac25e34c1c3ced7e092c597f20fcd04e426bf6303"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/DLC_ALIEN5_PROJET_LAZARE_V4_CANDIDAT.zip.part004": {
    "bytes": 2665975,
    "sha256": "aa604fcf829fdc9fbacad395cfed583fc5fe4f4d85486168ffdc7f2c96901357"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/ZIP_CONTENTS.json": {
    "bytes": 115987,
    "sha256": "167ab5e46e207579b12f9450c5b3054029d758233c23fef1e89468e8e06142c6"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v4/MANIFEST.json": {
    "bytes": 6024,
    "sha256": "2da768bdef3be143345f375a9dcb5e8546fb841500a38f07eb82c2fa3ec5e3ca"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/documents/ALIEN5_PROJET_LAZARE_V5/CHANGELOG_V5.md": {
    "bytes": 1506,
    "sha256": "ef34ebae97498aa0a586871b056855236d33665b4e2cf98bc9c8d823d2e7a2cc"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/documents/ALIEN5_PROJET_LAZARE_V5/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/documents/ALIEN5_PROJET_LAZARE_V5/README.md": {
    "bytes": 9759,
    "sha256": "7d78216c470bb6ddd20cb77db024da1df9c8a6136355c4bbbe513be56bcf25b4"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/documents/ALIEN5_PROJET_LAZARE_V5/docs/CODEX_REGLES_V4.md": {
    "bytes": 17898,
    "sha256": "2d2bd57f1f05992a3891c4e9117654ce2bb1d6617d3619f284b31bdf3aa7940e"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/documents/ALIEN5_PROJET_LAZARE_V5/docs/CODEX_REGLES_V5.md": {
    "bytes": 26049,
    "sha256": "31cd04f4044291e583cd6c76d3daedfd59c33daa84770a794ad8d9571483e1d4"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/documents/ALIEN5_PROJET_LAZARE_V5/docs/REGISTRE_CIVIL_V5.json": {
    "bytes": 2127,
    "sha256": "46cbfdfde07cb2acde7a60bad23b8e8f68ca70ead789a4e0d6d8ca92462d1390"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/documents/ALIEN5_PROJET_LAZARE_V5/docs/ROOMS_V5.json": {
    "bytes": 265909,
    "sha256": "50b7ce5e4f2855283d42b60299053bf48931df2eb2bebe3b5a04b081e52e3e36"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/documents/ALIEN5_PROJET_LAZARE_V5/game/data.json": {
    "bytes": 337299,
    "sha256": "58edd7c3c8661ce09597799344a8c0a5a55998f291f9132eab7dbc3617a04701"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/documents/ALIEN5_PROJET_LAZARE_V5/requirements-dev.txt": {
    "bytes": 33,
    "sha256": "2b2d72ac0940e74b20167fffac17de42f768c8851491460c556cccd71bc0b2c4"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/DLC_ALIEN5_PROJET_LAZARE_V5_CANDIDAT.zip.part001": {
    "bytes": 10485760,
    "sha256": "5fa49061c2079795e5832a890e6b5adfffbf7805feaf348203cfad03491c1d2a"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/DLC_ALIEN5_PROJET_LAZARE_V5_CANDIDAT.zip.part002": {
    "bytes": 1103674,
    "sha256": "c5be646a5bd88bd3b9c43175021d1aabe5cecc321f1c20ad1dff340abe024b60"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/ZIP_CONTENTS.json": {
    "bytes": 53809,
    "sha256": "76cb0be677d294e4d72113c2148ff498a56d947cdca505ba66963c263a125fbe"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v5/MANIFEST.json": {
    "bytes": 4601,
    "sha256": "b6e08b00baa54d2c08f72338636bc0304c2a995bd35352a491bc5dbfda7bf763"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/documents/ALIEN5_PROJET_LAZARE_V6/CHANGELOG_V6.md": {
    "bytes": 1970,
    "sha256": "47d8db1c25df305b9198abe9b7668153640936190ea4b8ff86cb141f49585d57"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/documents/ALIEN5_PROJET_LAZARE_V6/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/documents/ALIEN5_PROJET_LAZARE_V6/README.md": {
    "bytes": 7588,
    "sha256": "d6d492a1476ab8b3b338bbfd30ebd8469cdc166f2bf87ba20523f62fdaaf01fd"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/documents/ALIEN5_PROJET_LAZARE_V6/docs/CODEX_REGLES_V5.md": {
    "bytes": 26049,
    "sha256": "31cd04f4044291e583cd6c76d3daedfd59c33daa84770a794ad8d9571483e1d4"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/documents/ALIEN5_PROJET_LAZARE_V6/docs/CODEX_REGLES_V6.md": {
    "bytes": 34491,
    "sha256": "1c93ff03cb9223681ede3b98391e12731547daeae8879782c7ba2a4d8ffceb0b"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/documents/ALIEN5_PROJET_LAZARE_V6/docs/REGISTRE_CIVIL_V6.json": {
    "bytes": 2127,
    "sha256": "46cbfdfde07cb2acde7a60bad23b8e8f68ca70ead789a4e0d6d8ca92462d1390"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/documents/ALIEN5_PROJET_LAZARE_V6/docs/REGISTRE_MANUTENTION_V6.json": {
    "bytes": 1454,
    "sha256": "83ae7cf02d6feaf6a028975878ff18964b5bc6abf28fd571f55e4bb00883b3c9"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/documents/ALIEN5_PROJET_LAZARE_V6/docs/ROOMS_V6.json": {
    "bytes": 285171,
    "sha256": "6155b5d8492a37d0b15e0cf0edd85fb80312db2d8a53baeac157db51b816e147"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/documents/ALIEN5_PROJET_LAZARE_V6/game/data.json": {
    "bytes": 362046,
    "sha256": "70ff70e28006878f0aeb8bdf6587f7589626dfa613883713562c518f1de91f68"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/documents/ALIEN5_PROJET_LAZARE_V6/requirements-dev.txt": {
    "bytes": 33,
    "sha256": "2b2d72ac0940e74b20167fffac17de42f768c8851491460c556cccd71bc0b2c4"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/DLC_ALIEN5_PROJET_LAZARE_V6_CANDIDAT.zip.part001": {
    "bytes": 9004672,
    "sha256": "bddee773751646401c31cea82c7d2224559f15547ffeaf17863f00e9ca85c9d1"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/ZIP_CONTENTS.json": {
    "bytes": 66960,
    "sha256": "d6e1d118e88c520cc80cdd480f2c1bc8d8dc5e29f4eb002557d686fbee742435"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v6/MANIFEST.json": {
    "bytes": 4666,
    "sha256": "596f7f1382268efd8563f6acb93b434e8f65847aae41e1777c56b599977a988e"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/CHANGELOG_V7.md": {
    "bytes": 984,
    "sha256": "cbbc4f00ab8557110de39c2cf592dead14f16edc24b2ff7bfc4058289aea9b27"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/README.md": {
    "bytes": 5504,
    "sha256": "080cc6401597987fce432414daa8f2bbe37b4f09042a4ea476d3d209794e1e27"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/docs/CODEX_REGLES_V7.md": {
    "bytes": 42565,
    "sha256": "aeb63cc3ab7b3a07c8b4246976920b74a6a623922d80211c44501e0206379523"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/docs/REGISTRE_CIVIL_V7.json": {
    "bytes": 2127,
    "sha256": "46cbfdfde07cb2acde7a60bad23b8e8f68ca70ead789a4e0d6d8ca92462d1390"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/docs/REGISTRE_MANUTENTION_V7.json": {
    "bytes": 1454,
    "sha256": "83ae7cf02d6feaf6a028975878ff18964b5bc6abf28fd571f55e4bb00883b3c9"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/docs/REGISTRE_RECHERCHE_V7.json": {
    "bytes": 1849,
    "sha256": "0ad543d8eb4da0c1e12cd0d0841cb810ee9384bd35dcb8458e557013b1f2c40c"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/docs/ROOMS_V7.json": {
    "bytes": 306423,
    "sha256": "17b7d1cdc0d18681f9641dc9692ac0ba3dd4904143071acaeb854857280e5e24"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/docs/rules-v7.json": {
    "bytes": 43807,
    "sha256": "dd19a48139dd37ade134c8717b36903b3a9b70ed357773aa86999ced48d052c2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/game/data.json": {
    "bytes": 390285,
    "sha256": "952c4a5f905cdabd354634938da98ea23e4d98502bd55566def3f64f9447eabb"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/documents/ALIEN5_PROJET_LAZARE_V7/requirements-dev.txt": {
    "bytes": 33,
    "sha256": "2b2d72ac0940e74b20167fffac17de42f768c8851491460c556cccd71bc0b2c4"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/DLC_ALIEN5_PROJET_LAZARE_V7_CANDIDAT.zip.part001": {
    "bytes": 10485760,
    "sha256": "cbba213dd7aa29b5309b37b4a0857cf7e7a2cd980c4a769b446f128e19cc1247"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/DLC_ALIEN5_PROJET_LAZARE_V7_CANDIDAT.zip.part002": {
    "bytes": 103170,
    "sha256": "8fc71089dfe59512c2355db27b6140028828be479967a22f8f6ae4184c1cad4a"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/ZIP_CONTENTS.json": {
    "bytes": 94693,
    "sha256": "be9520dac38a2bb3f8ce9f407534f1a28ab85dea52a64bc9bbbd37cb7d15e1d5"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v7/MANIFEST.json": {
    "bytes": 5391,
    "sha256": "3d6ac39c7b17f585bc96cf2525066d2de4bb03e4bd08b0068c647c4654df0e63"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/documents/ALIEN5_PROJET_LAZARE_V8/CHANGELOG_V8.md": {
    "bytes": 1780,
    "sha256": "bd6bf7b579cb67241533e49fe63c5856832c29d37877664fc41a242b9eac8f32"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/documents/ALIEN5_PROJET_LAZARE_V8/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/documents/ALIEN5_PROJET_LAZARE_V8/README.md": {
    "bytes": 5764,
    "sha256": "84e5fa9c20913e5314ad460f82c5c09719d8f6b7d75e69c44d94d3287f4e2e8d"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/documents/ALIEN5_PROJET_LAZARE_V8/docs/CODEX_REGLES_V8.md": {
    "bytes": 48275,
    "sha256": "944cb977e63ef12a517cf2bdde7d94960a00a2b94d38f4377436f9e583e18cde"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/documents/ALIEN5_PROJET_LAZARE_V8/docs/ROOMS_V8.json": {
    "bytes": 332683,
    "sha256": "42b1561b3d2835e578de9864af98c2b570aeeaacfe710f9ce0b2eef77e1a2b68"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/documents/ALIEN5_PROJET_LAZARE_V8/docs/base-v7-contract.json": {
    "bytes": 1596,
    "sha256": "3f78f9e8214e3a49d3a5aac32b60930c79748a42e7e6185ea38c79e406e861af"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/documents/ALIEN5_PROJET_LAZARE_V8/docs/rules-v8.json": {
    "bytes": 49554,
    "sha256": "19a7f8763c66b2ea4e1fd8b6a3bbccad92f59a094d4befc2db1c70eeedd28d52"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/documents/ALIEN5_PROJET_LAZARE_V8/game/data.json": {
    "bytes": 391270,
    "sha256": "c446cd6bbf1e97e45a2d1b232227f84fc10f4830ecfce59ad99f9732b26c210f"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/DLC_ALIEN5_PROJET_LAZARE_V8_CANDIDAT.zip.part001": {
    "bytes": 8515512,
    "sha256": "3c79d05fc31134c0e2befb5caf6677e590f579f8d7c3332c04ffe819ea22275f"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/ZIP_CONTENTS.json": {
    "bytes": 91022,
    "sha256": "c56409d456538b68a7e90f531edd9cf4e2408da2d580351947a26a3a94d4b697"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v8/MANIFEST.json": {
    "bytes": 3876,
    "sha256": "7a7eaeaeaf25c79b6be8d1515881fd5dd7ec3209e203a6d3557e83a057d1c722"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/documents/ALIEN5_PROJET_LAZARE_V9/CHANGELOG_V9.md": {
    "bytes": 1600,
    "sha256": "2763c3038f2f314ec657d2d18aebab68909a68bc95badc823779ce959a671f6c"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/documents/ALIEN5_PROJET_LAZARE_V9/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/documents/ALIEN5_PROJET_LAZARE_V9/README.md": {
    "bytes": 6174,
    "sha256": "e3d15c2232d38d86b42e19fd98c0d5472f5f0ba1519dc30eb6da4431e753ed65"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/documents/ALIEN5_PROJET_LAZARE_V9/docs/CODEX_REGLES_V9.md": {
    "bytes": 55725,
    "sha256": "f163ae3750bf21957446fb29562122229d4e86bdaa48097049aed70c45d87206"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/documents/ALIEN5_PROJET_LAZARE_V9/docs/ROOMS_V9.json": {
    "bytes": 333020,
    "sha256": "4e064c54ba43f2b75079950cc659d8f5bf40069303f39ac7ce6ab4414fc7bd4d"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/documents/ALIEN5_PROJET_LAZARE_V9/docs/base-v8-contract.json": {
    "bytes": 1067,
    "sha256": "8357e3a4f1a55d71739eaf4b7b4e19bdff86c93ed1d68075ce74bf420e6b32f3"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/documents/ALIEN5_PROJET_LAZARE_V9/docs/rules-v9.json": {
    "bytes": 57206,
    "sha256": "3538c47c0a74294199cdb4a57b934b9e180e085cb3f19180d2d12e7c46506ba8"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/documents/ALIEN5_PROJET_LAZARE_V9/game/data.json": {
    "bytes": 391645,
    "sha256": "b973c74ec54a6031581284a928cead0c6cfecbc8ba318f3a7c923c438d4b5fd5"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/DLC_ALIEN5_PROJET_LAZARE_V9_CANDIDAT.zip.part001": {
    "bytes": 10485760,
    "sha256": "f8ad801e6658a1072f1249ae19c657bf35958c8d14c5f3294c6e93043f0c6ee9"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/DLC_ALIEN5_PROJET_LAZARE_V9_CANDIDAT.zip.part002": {
    "bytes": 198637,
    "sha256": "41099120d00647d3de06a9003756cd28202a2758dc269243eb211354aa909992"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/ZIP_CONTENTS.json": {
    "bytes": 109368,
    "sha256": "3576879dcabbe378c6df1fd1598e1e657963e9fbb21ff8cf19fe8e28503674fa"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v9/MANIFEST.json": {
    "bytes": 4213,
    "sha256": "31d679d8e2f8238ba2032e83143df14f8671552d6d96ccc50f67c5061db47f29"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/CHANGELOG_V10.md": {
    "bytes": 1742,
    "sha256": "732bf24f9b48a7f61a213b097764b34bfcfa4d78f27b9b92a82102b8a6a191a8"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/LICENSE_NOTICE.md": {
    "bytes": 667,
    "sha256": "0a0a802657b6c9823a0ebbcb2462c25958b26ec512fadb1f2cf044f3731077d2"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/README.md": {
    "bytes": 9826,
    "sha256": "eb7b93a6ca155e5a06d00971c2e2b3df50e96b0aaac67518c370efeaae71ff8f"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/docs/AUDIT_FIDELITE_V10.json": {
    "bytes": 98430,
    "sha256": "0c9be99f2341ff0f3ee9edb0fcceefaf6307301b63bed16b7ef945b0f87e8f0c"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/docs/CODEX_REGLES_V10.md": {
    "bytes": 59312,
    "sha256": "26b1630290151e684b7950c67d3e168b6922c4ae7e87cf1a7479cd8f18ea62a6"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/docs/ROOMS_V10.json": {
    "bytes": 438344,
    "sha256": "a0c3fc08f6419d98f6e808107b2a3e44b911077448ee72bf1ab72064e53001f4"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/docs/base-v9-contract.json": {
    "bytes": 378,
    "sha256": "1495ffb68b4b8de602cfb182e132e74190e6b0b81f79661a7a5e2533a33e529a"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/docs/base-v9-data.json": {
    "bytes": 391645,
    "sha256": "b973c74ec54a6031581284a928cead0c6cfecbc8ba318f3a7c923c438d4b5fd5"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/docs/reference-corpus-v10.json": {
    "bytes": 17310,
    "sha256": "275374176b830ff1f49bc93cce7bb1bee90924caaa82887121e38d4b62794a43"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/docs/rules-v10.json": {
    "bytes": 60983,
    "sha256": "6203ab7ff4a6cfffb0bab5e7a02b421fe34d028e094ea4c12c8b2980bb29b130"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/docs/rules-v9.json": {
    "bytes": 57206,
    "sha256": "3538c47c0a74294199cdb4a57b934b9e180e085cb3f19180d2d12e7c46506ba8"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/game/data.json": {
    "bytes": 525822,
    "sha256": "3963bb8a2696ebba1cb92be843dceb5a00313a8ecb427b468fcc2fe6f0073bf6"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/integration/README.md": {
    "bytes": 1225,
    "sha256": "2220784c0fc2ad147749bad18a1f8876ec58200e1c143016f4cc5bd3647d6e2d"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/qa/README.md": {
    "bytes": 1383,
    "sha256": "9b2b21867e96db6698d661c5f4a90930b4c99b3c5b598c4ff8d4ea80d70478f0"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/documents/ALIEN5_PROJET_LAZARE_V10/requirements-qa.txt": {
    "bytes": 117,
    "sha256": "c8af901bb16a938cfb79aec752b5ea3dee7921c38807b5a02e51f3f698f6733f"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/DLC_ALIEN5_PROJET_LAZARE_V10_CANDIDAT.zip.part001": {
    "bytes": 10485760,
    "sha256": "8626b34b4fa05b6a17ba0ea2e9c722cd914791ad12f1c0621110ef80101febb0"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/DLC_ALIEN5_PROJET_LAZARE_V10_CANDIDAT.zip.part002": {
    "bytes": 10485760,
    "sha256": "447ab64e18a7126f723b2920761f0dc912c8e71537dedb8d219d93918353e03e"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/DLC_ALIEN5_PROJET_LAZARE_V10_CANDIDAT.zip.part003": {
    "bytes": 5717999,
    "sha256": "21500a1e8e8d20695059d62ae2bad1f084accd48df7eb6d7529c3c21d0ba49a0"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/ZIP_CONTENTS.json": {
    "bytes": 154796,
    "sha256": "7c17dc4ba480743050e423ef614454a049f50786e97662fb3bbb0e6ef2db6add"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/v10/MANIFEST.json": {
    "bytes": 7276,
    "sha256": "9bebb81a2f8f9cc1491e310bd935437d69a3b071a285f8cd76a4cd28aefe07ba"
  },
  "archives/dlc-historical-recovery-20261126/alien5-lazare/README.md": {
    "bytes": 3680,
    "sha256": "7e591869816280b5818d66a787201841b550685d9b77e245331461dee700aebd"
  }
}).map(([path, value]) => [path, Object.freeze(value)])
));
const prefix = 'archives/dlc-historical-recovery-20261126';
const scripts = new Set(['scripts/historical-archive-admissions-20261126.mjs', 'scripts/verify-historical-archive-admissions-20261126.mjs',
  '.github/workflows/dlc-archive-preservation.yml']);
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
  // Reconciled local-recovery files are exact additions. Unrelated paths still
  // reach their established owners, including AVP's two historical records.
  if (Object.hasOwn(HISTORICAL_ARCHIVE_FILES_20261126, path)) return !built && !directory;
  if (typeof path !== 'string' || (path !== prefix && !path.startsWith(prefix + '/'))) return null;
  return false;
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

