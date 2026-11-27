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
    "bytes": 72620,
    "sha256": "701203849831c5135c4ebecd8750de7b4c51f6311960fec936587e1d4ad62ffa"
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
  }
}).map(([path, value]) => [path, Object.freeze(value)])
));
const prefix = 'archives/dlc-historical-recovery-20261126';
const scripts = new Set(['scripts/historical-archive-admissions-20261126.mjs', 'scripts/verify-historical-archive-admissions-20261126.mjs']);
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
