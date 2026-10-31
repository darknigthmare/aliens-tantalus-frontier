/** Byte-anchored V162 -> V163 continuation; historical documents stay immutable. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const AUDIT_PREDECESSOR_DOCUMENTS_V163 = Object.freeze({
  "docs/forge/xeno-trials/V162-NON-FORGE-CONTINUATION.md": "a67a133e6cf8249cbc832c1ed6ff69eb6da18ecbe9a0993ffaaea015727949c2",
  "docs/forge/xeno-trials/XENO_TRIALS_SUIVI_V162.xlsx": "994632af8d436fc1996eeec8b1f9fab20857391286bf81ba1b1f07a718e7ea72",
  "docs/forge/xeno-trials/progress-v162.json": "e6139378c57af0e2943ff98dad1fb4f1866c9de5dfc1dd50e46a1ff2415f000f"
});

export const AUDIT_DEFERRED_FORGE_SOURCES_V163 = Object.freeze({
  "src/forge-authoring-v133.js": "41a3f33249661d32caa841155d9947589ec9c6548068932553fb114c90ac3975",
  "src/forge-blueprints-v135.js": "dc91a4bb2250e6920740df0e89f087dbea1ab3c03f250259773f730cb8b161f3",
  "src/forge-campaign-ui-v161.js": "e9d82bc38f661260687e53affe1fb9c272ec7ec6906d645cb91034d6756ef01b",
  "src/forge-campaign-v161.js": "a0f7b6cd7f062d6b392d27befa55751a788959dcc00f01fc15c03c61ec967c12",
  "src/forge-construction-v135.css": "ee2d594d1a998272a34e57d591c101785c108ba0f710f2a6d82b2634ce5a48de",
  "src/forge-construction-v135.js": "718735298fd87d118c5739b9c157100bf5bd91ce3b913ae8c6c0eea6a7aefafe",
  "src/forge-control-v136.css": "631b345f60c7acbd5cf3ec47f516f259a0f0331a5d05dc307a0110f7303bdce1",
  "src/forge-control-v136.js": "eed31afd5468437a7a8b87078ca1f6ca2cf9bbf02fb6f3f783c077800321bf5f",
  "src/forge-decoration-v141.js": "8df7f9f306e2635547b4488198b1d3f6f815633999516bc5819d28cadff2cbfe",
  "src/forge-editor-base.js": "bcb438505c136e72d9c97ea05fca38331aac3738e935b2398dedd6ef0a946060",
  "src/forge-editor-v130.css": "26fbbe3ab81709df35eb90b0f3eca57829297673a935a1a3a95603a23fddedba",
  "src/forge-journey-admission-v141.js": "5bbc1fd5546e55c7f82c13d5f1b2962e8f49a00c5baf5c614b2a9ade81d14491",
  "src/forge-journey-v141.js": "415ec639f1fd2f7d57600f17f115de07cd30b99acf06e0c3328292490ced7a03",
  "src/forge-layout-v134.js": "8020db0f2e44328abbe535f978dc81f9a4ca93cf4da64a5294087e1ea34ae16d",
  "src/forge-mission-runtime-v141.js": "1335114f76ffd164a88bf6e2a8e7ef86d86d37ad36be726a8055cfc10a642cb0",
  "src/forge-model-v130.js": "9bc39547e1bb1b7add1489efab073d22302a64f6220a701eb6abcd1c084252c7",
  "src/forge-narrative-ui-v156.js": "766a0a9abf003514425260e361868701117831de3245289d97fae92d109fdaf4",
  "src/forge-narrative-v156.js": "2770cb180f398399193ea5074a9182fc51c08349029860a70a30a4ee74256ff7",
  "src/forge-navigator-v134.css": "6fe6df9faa252af683a6a0c8e47405905dd6ae5d9397332877e26f23c97d3f37",
  "src/forge-navigator-v134.js": "7a6517cbac3b19191d729ad07dd564541e349dff81af6c0827d0be479b31f62a",
  "src/forge-npcs-v158.js": "74866242ffe7d99b6b34771abf739fa639e46dac1b6b27712c3ca27eb68059b8",
  "src/forge-playtest-checkpoint-ui-v157.js": "85032efba0f8071afc69af9369682ce372c0ca6e718e6898c1ad456259ceafee",
  "src/forge-playtest-checkpoint-v157.js": "d7930fd9d9056970e63e02d54b6e70a3a4a00de931c26c7551db59ee15b4569c",
  "src/forge-playtest-v136.js": "71bba96af5b96be472c56a83166643dd1b62744f1a03328a87eb7d9b03d6676f",
  "src/forge-sandbox-v140.js": "8d8006ebf414c3a6402de3a7f2375fa3e17dcc712a55a494369bcb4ddc75827a",
  "src/forge-save-v62-base.js": "f7e758aee0731d0cb27274218d1a1dfbeac7905d8dcf964b069f374e39df7968",
  "src/forge-save-v62.js": "4d11c2a8ff64669b459675ec14c668344a216556dacaed3d28ce2ab245ac3bed",
  "src/forge-ship-runtime-v141.js": "20cf6a07e8deefcbdeefa276eb8d307f7abc9b6b55da9602195f43c5968cf32e",
  "src/forge-ui-v130.js": "d5bd35a344d577b0fce54649912ac71679fb5e09b78f274f77b326db6dd91378",
  "src/forge-versions-v136.js": "4e4d7a6db216a4d965dc5433272148dfa0792075c8472d69d17541a939c7be87",
  "src/forge-workbench-v133.css": "9fd1e811590d68cdfb135e3f16d073038a56c0157322984eec3a1404729dda0d",
  "src/forge-workbench-v133.js": "de6ff72f016b4b3dc91ddc8f8bb35656c59c0f7763b75d66c3259f48d3f9ed06"
});

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const keys = value => Object.keys(value).sort();
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

/** V167 arsenal continuation has its own exact byte successor. Historical V163
 * receipts remain unchanged; arbitrary future changes still fail closed.
 * Baseline hashes refer to the actual V163 sources at 69c13e5.
 */
/** Pinned V167/V168 successors are verified byte-for-byte; prior V163 hashes are immutable. */
export const ARSENAL_V167_SUCCESSORS = Object.freeze({
  'src/game-production-runtime.js': Object.freeze({
    previousSha256: '710e0901b87b7961aa2bb661f138d16eb46d76b100ef2bc9913d7ebfbd143fde', currentSha256: '8e31b01c84ef7af0b810d3aa4d22afc429153f362627b9f31d0b7b6c75ad60fb'
  }),
  'src/weapon-actions-v130.js': Object.freeze({
    previousSha256: 'bed8071910771e0b017dedb2a842e435a47141c594126558f0eb65d907b22a10', currentSha256: 'f7ba5f603027c6d10fbf5f01eecf40e429f4d34a106c5fe6e5c306f4e6be933c'
  }),
  'src/weapon-actions-v131.js': Object.freeze({
    previousSha256: 'de53ad1d3e00099415407256fdbd7ff69d41b27a86b97b431e8f7d6e30a9d654', currentSha256: '4ff367efb3c919ba51fcb5595f119d54f462a3453dbd95ca1d6c40110f44172a'
  }),
  'src/tactical-reload-v77.js': Object.freeze({
    previousSha256: '73c3da2d2416a003600d5d54b4180f04f2456189eb5358ec452be6f4683eb982', currentSha256: 'f792032340ea32b017d3ffcfa935a4cd7fd1ec5eab277902e6c873aa49bb6dc3'
  }),
  'sw.js': Object.freeze({
    previousSha256: '732d8eca7c6a8e4443f5a4d26b6a4cd677f2ad5b3fc1c4e766b452606ce153e9', currentSha256: '956bb0319a903d5b18f10a76aadef648360e1ca48ead3fbc2a9bc21da889fc27'
  }),
  'src/app.js': Object.freeze({
    previousSha256: '1f0dbf0340728e653b90cb613c8e6676d611e25d0cfedaba15cae2602ac15525', currentSha256: '85294f9e50a75dcbe9bd2be8d1d8b5c57ae1e46f8060a44dbf4544a545f5c022'
  }),
  'src/mission-input-v77.js': Object.freeze({
    previousSha256: 'cb6c9ed206e0e4e13fd4a1f367f6e0b8722932b768c903e9df6ee7e0e5c09846', currentSha256: 'c564966b27980c6733b7024fa832e6b8dd64e4441b08104a50f4c43e459d49b4'
  })
});

export const ARSENAL_V167_NEW_SOURCES = Object.freeze({
  'src/weapon-magazine-inventory-v167.js': '2f9c281f886c93c7640d10a85f1550a1320bdedbd6f63ba57185739acc856928',
  'src/weapon-mastery-v167.js': 'efa0d34da1fb3d26491257b9ec9a4b3fb76cc3342c7e4425247abd2d55e83f29',
  'scripts/verify-weapon-arsenal-v167.mjs': '00ea47ff30bead48a1272689482cfd659a7f9b204343b0956a9a281687dfb509',
  'src/weapon-magazine-world-v168.js': '6024a584079bf6bac0d83ccc439e810afb4d6aadc33990d51ce72fcae715962a',
  'src/weapon-magazine-recovery-runtime-v168.js': '4dbf78d2a4aa096125dada27b2b5fff05c1b927777f705eaf7d57f7626b88889',
  'src/weapon-attachments-v168.js': '08462193b55e18132dbf14b72d1f50dc07a10bd4be6bf0b70cad83ec0338306d',
  'scripts/verify-weapon-magazine-world-v168.mjs': '3000f9087c459358c2ad59714283075e722c21ab88110c254434830652612a64',
  'scripts/verify-weapon-attachments-v168.mjs': '9021a0adf8c3037bc29e26812011d8988e0323adddd04e7c645103a8f088e9fe'
});

/** V169 follows, rather than overwrites, the reviewed V167/V168 app receipt.
 * Only the existing armory UI integration is admitted; historical pins stay intact.
 */
export const ARMORY_V169_SUCCESSORS = Object.freeze({
  'src/app.js': Object.freeze({
    previousSha256: ARSENAL_V167_SUCCESSORS['src/app.js'].currentSha256,
    currentSha256: '07f0c77bc2dfb2c333c5c394045895eb9c7ea4b7a28ab42ee190e0cac8399542',
    verifier: 'scripts/verify-hub-armory-v169.mjs',
    verifierSha256: '900a3310329440309e2dc316c06bf91637a4024b376f324999c0801a1de8021e'
  })
});
export const ARMORY_V169_NEW_SOURCES = Object.freeze({
  'src/hub-armory-storefront-v169.js': '5ed95c5d1d16b5a2870302d41e34aa62b0d395bc66bdb49953baea932fbf47ae'
});



/** Reviewed V170 successor receipts; never rewrite V163/V167/V169 history. */
export const ARSENAL_V170_SUCCESSORS = Object.freeze({
  'src/app.js': Object.freeze({
    previousSha256: ARMORY_V169_SUCCESSORS['src/app.js'].currentSha256,
    currentSha256: '54f330200299488dd6e15022a3cf888c4aab7c6d8a9eae81ce2c057c50a2a374'
  }),
  'sw.js': Object.freeze({
    previousSha256: ARSENAL_V167_SUCCESSORS['sw.js'].currentSha256,
    currentSha256: 'cfe14a1ec3aaed1282d2ea3f875f6c2684a14dc360064f2e0fd8fa875249c27f'
  })
});
export const ARMORY_V170_ASSET_SOURCE = Object.freeze({
  path: 'src/hub-armory-storefront-v169.js',
  previousSha256: ARMORY_V169_NEW_SOURCES['src/hub-armory-storefront-v169.js'],
  currentSha256: '84f9ad87c18dba85b338e7d55c42a014b78e20d19e489493acd5a0cbd4eec252',
  reason: 'Replace false image checksums with hashes of actually generated but uncommitted V169 PNGs.'
});
export const ARSENAL_V170_NEW_SOURCES = Object.freeze({
  'src/weapon-fidelity-ledger-v170.js': '812af20d137f2e61370e2f596024415187fb94e2daff7ab4589b82d3b3438f01',
  'scripts/verify-weapon-fidelity-v170.mjs': 'e1cb78f40e602021af6fd99c8488a7751e1a2af4322c6bbc6318818f0952653c',
  'docs/arsenal/data/tantalus_weapon_evidence_backlog_v170.csv': '5e77f3d790b3f29869ccb3b6a183ef0ed5524fa75400e86dfdbec39db446ae4b',
  'src/hub-armory-scene-v169.js': '8ce4284d8b45dc8c7bbfb53f538a6f88f9ce185a49a4097e134cc9b979862886',
  'src/hub-port-meridien-v90.js': 'bda67e445bbb428e4e8c204efcb832252e710bc4d80ede5aaf506d3a20d999b5'
});

/** V171 continuation: these are *new* exact successors, not overwritten old
 * V163/V167/V169/V170 receipts. A changed source must have this exact hash.
 * The original 129 proposals remain research-only and all art flags remain off.
 */
export const ARSENAL_V171_SUCCESSORS = Object.freeze({
  'sw.js': Object.freeze({
    previousSha256: ARSENAL_V170_SUCCESSORS['sw.js'].currentSha256,
    currentSha256: '28a96943d75e091a0b16a7228d76dabc2458b8f86945e938a4c7f121d92f13f0'
  }),
  'src/weapon-fidelity-ledger-v170.js': Object.freeze({
    previousSha256: ARSENAL_V170_NEW_SOURCES['src/weapon-fidelity-ledger-v170.js'],
    currentSha256: '83649dcccc939a9a634c1e2ec8e9cde35e6f844ade4c9586cb5f4ebfb3f1f8cd'
  }),
  'src/hub-armory-storefront-v169.js': Object.freeze({
    previousSha256: ARMORY_V170_ASSET_SOURCE.currentSha256,
    currentSha256: '2f5e0f0dce98e952fd865b0a251afd3d2cfcb34d4ab5be926a68c81ca78a9886'
  }),
  'src/hub-armory-scene-v169.js': Object.freeze({
    previousSha256: ARSENAL_V170_NEW_SOURCES['src/hub-armory-scene-v169.js'],
    currentSha256: 'cd72fc6ad1ed75a9f60172918932ef9e18e709fb18f24edd878c97fc96841ab2'
  }),
  'src/hub-port-meridien-v90.js': Object.freeze({
    previousSha256: ARSENAL_V170_NEW_SOURCES['src/hub-port-meridien-v90.js'],
    currentSha256: 'ee6e1088da7e588567e72d909ab4a01a127b2e85021c8785c650ef80113a8f91'
  })
});
export const ARSENAL_V171_NEW_SOURCES = Object.freeze({
  'src/weapon-research-index-v171.js': '1a2d3f5ea0f3f19311fb8ec2e0d67d23bc5e2a6dd8ec62902d175f144b84de9b',
  'scripts/verify-weapon-research-v171.mjs': '6e5a03b8cbf5386d6fce50ac602c1fccb17ded1af8b4db54e0bd6d72e0b3e293',
  'src/weapon-special-feeds-v171.js': 'a4f3c56b1e6143befea8f625c032be0a576ae5c993bbe12e0c63a4d177d8d54e',
  'scripts/verify-weapon-special-feeds-v171.mjs': 'c6cebada4bfce82e7a2d557e8caa85555f065e9882b81e2eec83640d8d0b5e87',
  'scripts/install-armory-art-v171.mjs': '5f2311f0a980d770e312b2be2f532ea1e67b12617421fbd66103a12da990f0af',
  'scripts/verify-armory-art-installer-v171.mjs': '7bc84f3677aaea7afe044741a88d8911793dc0d5d886550894452e6e748d62ef'
});

/** V171: V165 test runner itself must evolve when runtime sources evolve.
 * The predecessor is still checked against the frozen V165 receipt. This
 * separate exact successor hash is never written into historical progress.
 */
export const V165_VERIFIER_SUCCESSORS_V171 = Object.freeze({
  'scripts/verify-parallel-completion-v165.mjs': Object.freeze({
    previousSha256: 'c49d78b68bae4f17844320dd73a119f056b97566101e79b8186c60e7026718bb',
    currentSha256: 'cf5c0d1c2a1c346a417930b5a405b461641199310e268647359e209492534939'
  }),
  'scripts/verify-public-release-v86.mjs': Object.freeze({
    previousSha256: '4b432c2bd6d5d30af744ae96103a678d96cf6839bfe76907ab56077d48cb7eb3',
    currentSha256: '0c124cc8ecd85c67a9aa13b9b09089ebaae58f0024dea5276344d4b699f448f0'
  }),
  'scripts/verify-audit-continuation-v163.mjs': Object.freeze({
    previousSha256: '0e62c205e45006c9adbf6f58850233b40d79aaaaefabd802fad3c845dc5eaaf1',
    currentSha256: '1b9ed6d7456243b1de8f61bd7798a895978ce22d3f0b84971f1895b2fa362593'
  })
});

/** V172 release admission: actual media bytes + native floor, staged after V171.
 * No historical V163/V169/V170/V171 source pin is rewritten. */
export const ARMORY_V172_RELEASE_SUCCESSORS = Object.freeze({
  'src/hub-armory-storefront-v169.js': Object.freeze({
    previousSha256: ARSENAL_V171_SUCCESSORS['src/hub-armory-storefront-v169.js'].currentSha256,
    currentSha256: '6130f994f84099de1bedc9f071e2b4d57f014dded55f9a8a508b7347d08b8476'
  }),
  'src/hub-armory-scene-v169.js': Object.freeze({
    previousSha256: ARSENAL_V171_SUCCESSORS['src/hub-armory-scene-v169.js'].currentSha256,
    currentSha256: '036374b5b38dcb0dd43e92ef869eddf9f6e0a2c167a4ddf330261fc92570b5df'
  }),
  'src/hub-port-meridien-v90.js': Object.freeze({
    previousSha256: ARSENAL_V171_SUCCESSORS['src/hub-port-meridien-v90.js'].currentSha256,
    currentSha256: '9f3f75b8e8a9fbe77deb5afa428a5ba158db05b98ebe2e7af08b844af248eb93'
  }),
  'scripts/verify-armory-art-installer-v171.mjs': Object.freeze({
    previousSha256: ARSENAL_V171_NEW_SOURCES['scripts/verify-armory-art-installer-v171.mjs'],
    currentSha256: 'bd282cf11014d647a41ac2e2897514d5f2ac0d43ffb6a087e5716b350b78abf5'
  })
});

/** V173 specialist-feed corrections and V172 shop research QA, independent
 * from frozen V171 receipts. Every successor requires an exact byte match.
 */
export const WEAPON_V173_SOURCE_SUCCESSORS = Object.freeze({
  'src/weapon-special-feeds-v171.js': Object.freeze({
    previousSha256: ARSENAL_V171_NEW_SOURCES['src/weapon-special-feeds-v171.js'],
    currentSha256: 'c1cc375650e2c41d7c54550bd798023417f3de3ca8c93dff57aea1c788509f0a'
  }),
  'scripts/verify-weapon-special-feeds-v171.mjs': Object.freeze({
    previousSha256: ARSENAL_V171_NEW_SOURCES['scripts/verify-weapon-special-feeds-v171.mjs'],
    currentSha256: '43e442b3ff6d4a658214e3fff62a8d968daa90b544b4c27b7e828ae7a18a2d78'
  }),
  'scripts/verify-weapon-research-v171.mjs': Object.freeze({
    previousSha256: ARSENAL_V171_NEW_SOURCES['scripts/verify-weapon-research-v171.mjs'],
    currentSha256: 'ba6292bbff00232d4f13f8f75b2dad7a016d88f8c20ad6d02bc951d964d070c3'
  })
});

/** V173 verifier receipts: preserve earlier V165 and V171 fingerprints.
 * These two checks read current runtime bytes, and must be pinned separately.
 */
export const V165_VERIFIER_SUCCESSORS_V173 = Object.freeze({
  'scripts/verify-audit-continuation-v163.mjs': Object.freeze({
    previousSha256: V165_VERIFIER_SUCCESSORS_V171['scripts/verify-audit-continuation-v163.mjs'].currentSha256,
    currentSha256: '2265c8293a835a04149cc4e9123f13f4d6a5ae154141e4324163ed5d7bfb70d7'
  }),
  'scripts/verify-parallel-completion-v165.mjs': Object.freeze({
    previousSha256: V165_VERIFIER_SUCCESSORS_V171['scripts/verify-parallel-completion-v165.mjs'].currentSha256,
    currentSha256: 'efb67151cd5a3e00434e1889bfd782ae94547f9300f858583e18845a9683e701'
  })
});

/** V174: real armory supply lots are tracked with exact successors.
 * Historical V163/V170/V171 are never altered; these changes use existing
 * save schema 52, and are original Tantalus pricing rather than film canon.
 */
export const ARMORY_V174_ECONOMY_SUCCESSORS = Object.freeze({
  'src/app.js': Object.freeze({
    previousSha256: ARSENAL_V170_SUCCESSORS['src/app.js'].currentSha256,
    currentSha256: '6de0d078732aea1477034d9f67e71a112c57f8cf57b0d9bb2b750b776d8141e0'
  }),
  'sw.js': Object.freeze({
    previousSha256: ARSENAL_V171_SUCCESSORS['sw.js'].currentSha256,
    currentSha256: '88ba286c6e78add4c054175da085cf56ad93d982749c09ed237e18605ed901f0'
  })
});
export const ARMORY_V174_ECONOMY_NEW_SOURCES = Object.freeze({
  'src/armory-resupply-v174.js': 'acdad621ef6ba920ccb0781f472543861e2285747a4b214268bc1fb332bca9fe',
  'scripts/verify-armory-resupply-v174.mjs': '43acb1d0397940f76b211d27d91b2e3539a75293b4ab189cab14ebf344730617'
});

/** V174 authenticated source-only QA / distribution verifiers. */
export const V165_VERIFIER_SUCCESSORS_V174 = Object.freeze({
  'scripts/verify-audit-continuation-v163.mjs': Object.freeze({
    previousSha256: V165_VERIFIER_SUCCESSORS_V173['scripts/verify-audit-continuation-v163.mjs'].currentSha256,
    currentSha256: 'f2d3a326ef4f76327ad08ae0941a7095ebe55b691a2cf93151135c98812284a6'
  }),
  'scripts/verify-public-release-v86.mjs': Object.freeze({
    previousSha256: V165_VERIFIER_SUCCESSORS_V171['scripts/verify-public-release-v86.mjs'].currentSha256,
    currentSha256: '052283e5e54a28666025da10e4c3d49a349f5f5b653a9079a125851a677574b5'
  })
});

/** V176: admit the precise post-V174 distributor and test bytes.
 * Prior V171/V174 SHA receipts are immutable and remain checked explicitly.
 * Staging costume art does not admit it to public release or the native rig.
 */
export const V165_VERIFIER_SUCCESSORS_V176 = Object.freeze({
  'scripts/verify-audit-continuation-v163.mjs': Object.freeze({
    previousSha256: V165_VERIFIER_SUCCESSORS_V174['scripts/verify-audit-continuation-v163.mjs'].currentSha256,
    currentSha256: 'b37258cad1f33d02fa7c18fffb19449ce8b96e971433b517c806a6550ae9be3a'
  }),
  'scripts/verify-public-release-v86.mjs': Object.freeze({
    previousSha256: V165_VERIFIER_SUCCESSORS_V174['scripts/verify-public-release-v86.mjs'].currentSha256,
    currentSha256: '1419dcf0e47abd91288748ac7b222ba0f2b0d354e2997ced49cedc2c44bee77e'
  })
});

/** V177: the cumulative V165 QA itself must acknowledge every V176
 * successor. This pin is reviewable and chained to the untouched V173
 * verifier receipt rather than rewriting historical V165 data.
 */
export const V165_VERIFIER_SUCCESSORS_V177 = Object.freeze({
  'scripts/verify-parallel-completion-v165.mjs': Object.freeze({
    previousSha256: V165_VERIFIER_SUCCESSORS_V173['scripts/verify-parallel-completion-v165.mjs'].currentSha256,
    currentSha256: '00f689ca0bfcad751f62c131d31f939739367ce5ef388c78fb17b7f9b5d3af0e'
  })
});

/** V178: reviewed audit test correctly recognizes the V177 cumulative QA
 * receipt. Earlier V176/V177 receipts remain immutable, not overwritten.
 */
export const V165_VERIFIER_SUCCESSORS_V178 = Object.freeze({
  'scripts/verify-audit-continuation-v163.mjs': Object.freeze({
    previousSha256: V165_VERIFIER_SUCCESSORS_V176['scripts/verify-audit-continuation-v163.mjs'].currentSha256,
    currentSha256: '476f88b01955e8d406d50ff5dee33e63dd7b7390b22c6fe3746dfbef6479b162'
  })
});

/** V179: physical armory rear-wall service moved clear of the already
 * admitted V169 storefront facade. The V165 source receipt remains intact.
 * This is a positioning correction, not a new item, collision or canon claim.
 */
export const HUB_V179_SERVICE_SUCCESSOR = Object.freeze({
  path: 'src/hub-room-service-details-v165.js',
  previousSha256: 'b6eb5e20ca9c221399135afa5b5fc48d471df74daf9625c194fefe16099037b2',
  currentSha256: '3f7a4010e07a407e8082aceba9432476b31851fcf1864dd7c1498cb2b39818f5',
  roomId: 'armory',
  sourceCenterX: 880,
  correctedCenterX: 220,
  correctedTopY: 360,
  width: 96,
  height: 42,
  sourceWorkStatus: 'original-project-utility-not-licensed-film-1to1'
});

/** V187: grounded browser-V179 geometry displaces the blocked armory plaque,
 * retaining both V165 and V179 SHA records as immutable predecessors. */
export const HUB_V187_SERVICE_SUCCESSOR = Object.freeze({
  path: HUB_V179_SERVICE_SUCCESSOR.path,
  previousSha256: HUB_V179_SERVICE_SUCCESSOR.currentSha256,
  currentSha256: '34d73c753b0e397c58df4da5db6f0a0ac73962407a0c9014b647bb439f89533b',
  roomId: 'armory', correctedCenterX: 1096, correctedTopY: 300,
  width: 96, height: 42, validation: 'native-reservation-clearance-to-be-verified'
});

/** V188/V189 exact successors: do not mutate the historical V177/V178
 * verifier bytes. The two revised tests demand the V187 physical room fix. */
export const V165_VERIFIER_SUCCESSORS_V188 = Object.freeze({
  'scripts/verify-parallel-completion-v165.mjs': Object.freeze({
    previousSha256: V165_VERIFIER_SUCCESSORS_V177['scripts/verify-parallel-completion-v165.mjs'].currentSha256,
    currentSha256: 'f6d418de759916c6ead8357bd67ae0afee0c997e33a6da980eb0b1fb2c166f18'
  })
});
export const V165_VERIFIER_SUCCESSORS_V189 = Object.freeze({
  'scripts/verify-audit-continuation-v163.mjs': Object.freeze({
    previousSha256: V165_VERIFIER_SUCCESSORS_V178['scripts/verify-audit-continuation-v163.mjs'].currentSha256,
    currentSha256: 'b317ad3d82bafbd77ac161a13c60deb051bed6e02dbcb373840237f2ab384c0d'
  })
});

/** One maintenance correction follows the frozen Forge scope; it does not reopen that scope. */
export function verifyGamedevCorrectionV163(current, readSource = readRepository) {
  if (!Object.hasOwn(current, 'followupGamedev20261029')) return Object.freeze({});
  const record = current.followupGamedev20261029;
  assert.ok(record && typeof record === 'object' && !Array.isArray(record));
  assert.deepEqual(keys(record), ['baselineCommit', 'corrections', 'id', 'releaseEvidence',
    'runtimeValidation', 'schema', 'scope', 'state'].sort());
  assert.equal(record.schema, 1);
  assert.equal(record.id, 'GAMEDEV-20261029-FORGE-ADMISSION');
  assert.equal(record.baselineCommit, 'ffea37ad83ef1fa1fdd0a1e0549b4b4035bb4c52');
  assert.equal(record.state, 'PREPUBLICATION');
  assert.equal(record.runtimeValidation, 'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');
  assert.deepEqual(record.scope, { existingModuleMaintenance: true, newForgeRuntimeModules: 0,
    deferredForgePrioritiesReopened: 0, historicalForgeScope: 'V163' });
  assert.deepEqual(record.releaseEvidence, { nodeSuite: null, nativeCandidate: null, ci: null, review: null, merge: null });
  assert.ok(Array.isArray(record.corrections) && record.corrections.length === 1,
    'Exactly one Forge admission correction is authorized by this continuation');
  const correction = record.corrections[0];
  assert.ok(correction && typeof correction === 'object' && !Array.isArray(correction));
  assert.deepEqual(keys(correction), ['currentSha256', 'path', 'previousSha256', 'reason', 'verifier'].sort());
  const path = 'src/forge-journey-admission-v141.js';
  const previousSha256 = AUDIT_DEFERRED_FORGE_SOURCES_V163[path];
  assert.equal(correction.path, path, 'The maintenance continuation cannot admit another runtime path');
  assert.equal(correction.previousSha256, previousSha256);
  assert.equal(current.deferredForge?.sourceSha256?.[path], previousSha256);
  assert.equal(current.followupV165?.runtimeV164SourceSha256?.[path], previousSha256);
  assert.ok(validHash(correction.currentSha256));
  assert.notEqual(correction.currentSha256, previousSha256, 'A correction must identify changed source bytes');
  assert.equal(current.runtimeSourceSha256?.[path], correction.currentSha256);
  assert.ok(typeof correction.reason === 'string' && correction.reason.trim().length >= 60,
    'Explain the concrete admission behavior corrected after the historical Forge scope');
  const verifier = correction.verifier;
  assert.ok(verifier && typeof verifier === 'object' && !Array.isArray(verifier));
  assert.deepEqual(keys(verifier), ['path', 'sha256']);
  assert.equal(verifier.path, 'scripts/verify-forge-admission-v141.mjs');
  assert.ok(validHash(verifier.sha256));
  assert.equal(sha(readSource(path)), correction.currentSha256, 'Unreviewed Forge correction bytes: ' + path);
  assert.equal(sha(readSource(verifier.path)), verifier.sha256, 'Unreviewed Forge correction verifier bytes');
  return Object.freeze({ [path]: correction.currentSha256 });
}

function anchoredPredecessor(previous, readSource) {
  let anchored;
  for (const [path, expected] of Object.entries(AUDIT_PREDECESSOR_DOCUMENTS_V163)) {
    const bytes = readSource(path);
    assert.equal(sha(bytes), expected, 'Historical V162 document changed: ' + path);
    if (path.endsWith('/progress-v162.json')) anchored = JSON.parse(bytes);
  }
  assert.deepEqual(previous, anchored, 'Previous contract must be the byte-anchored V162 public record');
}

export const AUDIT_PRIORITY_IDS_V163 = Object.freeze([
  "verification-latest-ci",
  "trials-presentation-unmapped",
  "trials-capture-human",
  "trials-reference-and-art",
  "trials-roster-extension",
  "trials-remaining-pilot-art",
  "forge-narrative-events",
  "forge-test-persistence",
  "campaigns-not-playable",
  "costume-art",
  "excel-identity-and-motion",
  "master-encyclopedia-source",
  "dlc-v10-sources",
  "legacy-backlog-triage",
  "annex-crew-coverage",
  "trials-spatial-exit",
  "broodstorm-resume-projectile"
]);

export function verifyAuditCoverageV163(previous, current) {
  const classes = new Set(['REALISABLE_MAINTENANT', 'VERIFICATION_NECESSAIRE', 'REFERENCES_MEDIAS_ABSENTS', 'FORGE_DIFFEREE']);
  const taskIds = [...previous.inheritedPresentationIds, ...previous.inheritedArt153Ids];
  assert.equal(taskIds.length, 68);
  const rows = current.tables?.['24_CouvertureV163']?.rows;
  assert.ok(Array.isArray(rows));
  assert.deepEqual(rows.map(row => [row[0], row[1]]), [
    ...taskIds.map(id => ['task', id]), ...AUDIT_PRIORITY_IDS_V163.map(id => ['priority', id])]);
  const counts = {};
  for (const row of rows) {
    assert.equal(row.length, 12);
    assert.ok(classes.has(row[4]), 'Unknown need category: ' + row[1]);
    assert.ok(typeof row[5] === 'string' && row[5].trim(), 'Coverage owner missing: ' + row[1]);
    for (const index of [6, 7, 8]) assert.ok(typeof row[index] === 'string' && row[index].trim(), 'Coverage state/limit/action missing: ' + row[1]);
    assert.equal(row[4] === 'FORGE_DIFFEREE', row[1].startsWith('forge-'));
    assert.deepEqual(row.slice(-2), [0, 0]);
    counts[row[4]] = (counts[row[4]] || 0) + 1;
  }
  assert.deepEqual(current.coverageV163.classifications, counts);
  assert.deepEqual([current.coverageV163.tasks, current.coverageV163.priorities, current.coverageV163.roster,
    current.coverageV163.rows, current.coverageV163.unownedRows], [68, 17, 189, 85, 0]);
  assert.equal(current.coverageV163.notACompletionClaim, true);
  const roster = current.tables?.['25_RosterEtatV163']?.rows;
  assert.deepEqual(roster.map(row => row[0]), previous.rosterIds);
  const pilots = new Set(['prowler', 'import-game-dd-wy-commando', 'import-game-dd-guardian', 'dd-darwin-era-cultist']);
  for (const row of roster) {
    assert.equal(row.length, 7);
    assert.equal(row[1], pilots.has(row[0]));
    assert.ok(classes.has(row[2]) && typeof row[3] === 'string' && row[3].trim() && typeof row[4] === 'string' && row[4].trim());
    assert.deepEqual(row.slice(-2), [0, 0]);
  }
  const assets = current.projectAssetCoverageV163;
  assert.deepEqual(assets.roster.map(row => row.id), previous.rosterIds);
  assert.equal(assets.observedBaselineCommit, current.baseCommit);
  assert.deepEqual([assets.spritesPresent, assets.spritesMissing, assets.dedicatedRigsAtBaseline, assets.withoutDedicatedRigAtBaseline], [189, 0, 4, 185]);
  for (const row of assets.roster) {
    assert.match(row.path, /^assets\/[a-zA-Z0-9_./-]+\.png$/);
    assert.ok(!row.path.includes('..'));
    assert.match(row.sha256, /^[a-f0-9]{64}$/);
    assert.equal(row.exists, true);
    assert.equal(Boolean(row.dedicatedRigAtBaseline), pilots.has(row.id));
    assert.equal(typeof row.newScopedPresentationRigV163, 'boolean');
    assert.equal(row.newFullLocomotionV163, false);
    if (row.newScopedPresentationRigV163) {
      assert.equal(row.dedicatedRigAtBaseline, false);
      assert.equal(row.newRigSourceSha256, row.sha256);
      assert.equal(row.newRigAdmissionScope, 'presentation-upper-body-fixed-support');
    } else {
      assert.equal(row.newRigSourceSha256, null);
      assert.equal(row.newRigAdmissionScope, null);
    }
    assert.equal(row.approved1to1, false);
  }
  const newRigCount = assets.roster.filter(row => row.newScopedPresentationRigV163).length;
  assert.equal(assets.newScopedPresentationRigsV163, newRigCount);
  assert.equal(assets.remainingScopedPresentationRigAuthoringV163, 185 - newRigCount);
  assert.equal(assets.newFullLocomotionAdmissionsV163, 0);
  assert.deepEqual([assets.costumeSets, assets.completeCostumeSetsAtBaseline, assets.missingDedicatedCostumeSetsAtBaseline], [31, 1, 30]);
  assert.equal(assets.countsAreCurrentRuntimeResults, false);
  assert.equal(current.documentaryReferencesV163.length, current.newExternalSourcesRetrieved);
  assert.equal(current.documentaryReferencesV163.length, 13);
  assert.equal(new Set(current.documentaryReferencesV163.map(row => row.id)).size, 13);
  for (const reference of current.documentaryReferencesV163) {
    assert.match(reference.url, /^https:\/\//);
    assert.match(reference.sourceSnapshotSha256, /^[a-f0-9]{64}$/);
    assert.equal(reference.status, 'CONTENT_REVIEWED_DOCUMENTARY_REFERENCE');
    assert.equal(reference.assetReuseLicenceEstablished, false);
    assert.equal(reference.motion1to1Established, false);
    assert.equal(reference.rawArchiveRecovered, false);
  }
  const streams = current.newWorkstreamsV163;
  assert.ok(Array.isArray(streams) && streams.length > 0);
  assert.equal(new Set(streams.map(row => row.id)).size, streams.length);
  assert.deepEqual(current.tables['23_ChantiersV163'].rows.map(row => row[0]), streams.map(row => row.id));
  for (const stream of streams) {
    assert.match(stream.id, /^C163-[A-Z0-9-]+$/);
    assert.ok(stream.implementedScope && stream.limits && stream.profileNames?.length);
    assert.equal(new Set(stream.profileNames).size, stream.profileNames.length);
    assert.ok(!stream.priorityLinks.some(id => id.startsWith('forge-')));
    assert.ok(stream.priorityLinks.every(id => AUDIT_PRIORITY_IDS_V163.includes(id)));
    for (const path of stream.modules) assert.ok(Object.hasOwn(current.runtimeSourceSha256, path));
  }
  return Object.freeze({ tasks: 68, priorities: 17, roster: 189, rows: 85, unowned: 0 });
}

export function verifyAuditSuccessionV163(previous, current, readSource = readRepository) {
  anchoredPredecessor(previous, readSource);
  assert.equal(previous.lot, 'V162');
  assert.equal(current?.lot, 'V163');
  assert.equal(current.publicationState, 'PREPUBLICATION');
  verifyAuditCoverageV163(previous, current);
  const bridge = current.runtimeSuccession;
  assert.equal(bridge?.schema, 1);
  assert.equal(bridge.from, 'V162');
  assert.equal(bridge.to, 'V163');
  assert.deepEqual(bridge.predecessorDocuments, AUDIT_PREDECESSOR_DOCUMENTS_V163);
  assert.equal(current.deferredForge?.state, 'DEFERRED_BY_USER');
  assert.deepEqual(current.deferredForge.sourceSha256, AUDIT_DEFERRED_FORGE_SOURCES_V163);
  const corrections = verifyGamedevCorrectionV163(current, readSource);
  for (const [path, expected] of Object.entries(AUDIT_DEFERRED_FORGE_SOURCES_V163))
    assert.equal(sha(readSource(path)), corrections[path] ?? expected, 'Deferred Forge module changed: ' + path);
  const before = previous.runtimeSourceSha256, after = current.runtimeSourceSha256;
  assert.equal(keys(before).length, 87);
  assert.ok(after && keys(after).length >= 87);
  for (const path of keys(before)) assert.ok(Object.hasOwn(after, path), 'Inherited V162 source omitted: ' + path);
  for (const [path, expected] of Object.entries(after)) {
    assert.ok(/^src\/[a-zA-Z0-9._-]+\.(?:js|css)$/.test(path)
      || /^[a-zA-Z0-9._-]+\.css$/.test(path) || ['index.html', 'sw.js'].includes(path),
    'Source path outside the reviewed runtime scope: ' + path);
    assert.ok(validHash(expected), 'Invalid source hash: ' + path);
    const successor = Object.hasOwn(ARSENAL_V167_SUCCESSORS, path) ? ARSENAL_V167_SUCCESSORS[path] : null;
    if (successor) {
      assert.equal(expected, successor.previousSha256, 'Incorrect V163 baseline for V167 successor: ' + path);
      const armory = ARMORY_V169_SUCCESSORS[path];
      const newest = ARSENAL_V170_SUCCESSORS[path];
      const current = ARSENAL_V171_SUCCESSORS[path];
      const economy = ARMORY_V174_ECONOMY_SUCCESSORS[path];
      if (armory) assert.equal(armory.previousSha256, successor.currentSha256,
        'Broken V167-to-V169 successor chain: ' + path);
      if (newest) assert.equal(newest.previousSha256, (armory || successor).currentSha256,
        'Broken reviewed V169/V167-to-V170 successor chain: ' + path);
      if (current) assert.equal(current.previousSha256, (newest || armory || successor).currentSha256,
        'Broken V170-to-V171 successor chain: ' + path);
      if (economy) assert.equal(economy.previousSha256, (current || newest || armory || successor).currentSha256,
        'Broken V170/V171-to-V174 economy successor chain: ' + path);
      assert.equal(sha(readSource(path)),
        (economy || current || newest || armory || successor).currentSha256,
        economy ? 'Unreviewed V174 economy successor: ' + path
          : current ? 'Unreviewed V171 runtime successor: ' + path
            : newest ? 'Unreviewed V170 runtime successor: ' + path
              : armory ? 'Unreviewed V169 runtime successor: ' + path
                : 'Unreviewed V167 runtime successor: ' + path);
    } else {
      // V179 changes one existing non-arsenal V165 room module. Keep the
      // historical V163 receipt exact and require the reviewed successor
      // bytes, not a wildcard or retroactive modification of the archive.
      const v179 = path === HUB_V179_SERVICE_SUCCESSOR.path
        ? HUB_V179_SERVICE_SUCCESSOR : null;
      const v187 = v179 ? HUB_V187_SERVICE_SUCCESSOR : null;
      if (v179) assert.equal(expected, v179.previousSha256,
        'Incorrect V165-to-V179 service predecessor: ' + path);
      if (v187) assert.equal(v187.previousSha256,v179.currentSha256,
        'Broken V179-to-V187 armory wall mount chain: ' + path);
      assert.equal(sha(readSource(path)), v187?.currentSha256 || v179?.currentSha256 || expected,
        v187 ? 'Unreviewed V187 armory service location: ' + path
          : v179 ? 'Unreviewed V179 armory service location: ' + path
            : 'Current V163 source changed: ' + path);
    }
  }
  // New V167 modules are not retroactively called historical V163 sources.
  for (const [path, expected] of Object.entries(ARSENAL_V167_NEW_SOURCES))
    assert.equal(sha(readSource(path)), expected, 'Unreviewed V167 added source: ' + path);
  for (const [path, expected] of Object.entries(ARMORY_V169_NEW_SOURCES)) {
    const extra = path === ARMORY_V170_ASSET_SOURCE.path ? ARMORY_V170_ASSET_SOURCE : null;
    if (extra) assert.equal(extra.previousSha256, expected, 'Invalid V169 authored source history');
    const current = ARSENAL_V171_SUCCESSORS[path];
    if (current) assert.equal(current.previousSha256, extra?.currentSha256 || expected,
      'Broken V169/V170-to-V171 source chain: ' + path);
    const release = ARMORY_V172_RELEASE_SUCCESSORS[path];
    if (release) assert.equal(release.previousSha256, current?.currentSha256 || extra?.currentSha256 || expected,
      'Broken V171-to-V172 source chain: ' + path);
    assert.equal(sha(readSource(path)), release?.currentSha256 || current?.currentSha256 || extra?.currentSha256 || expected,
      release ? 'Unreviewed V172 art source: ' + path
        : current ? 'Unreviewed V171 source correction: ' + path
          : extra ? 'Unreviewed V170 source correction: ' + path
            : 'Unreviewed V169 added source: ' + path);
  }
  for (const [path, expected] of Object.entries(ARSENAL_V170_NEW_SOURCES)) {
    const current = ARSENAL_V171_SUCCESSORS[path];
    if (current) assert.equal(current.previousSha256, expected,
      'Unreviewed V171 predecessor for V170 source: ' + path);
    const release = ARMORY_V172_RELEASE_SUCCESSORS[path];
    if (release) assert.equal(release.previousSha256, current?.currentSha256 || expected,
      'Broken V171-to-V172 source chain: ' + path);
    assert.equal(sha(readSource(path)), release?.currentSha256 || current?.currentSha256 || expected,
      release ? 'Unreviewed V172 art source: ' + path
        : current ? 'Unreviewed V171 source successor: ' + path
          : 'Unreviewed V170 added source: ' + path);
  }
  for (const [path, expected] of Object.entries(ARSENAL_V171_NEW_SOURCES)) {
    const release = ARMORY_V172_RELEASE_SUCCESSORS[path];
    const revision = WEAPON_V173_SOURCE_SUCCESSORS[path];
    if (release) assert.equal(release.previousSha256,expected,
      'Incorrect V172 verifier predecessor: ' + path);
    if (revision) assert.equal(revision.previousSha256,expected,
      'Incorrect V173 source predecessor: ' + path);
    if (release && revision) throw new Error('Ambiguous artifact successor: ' + path);
    assert.equal(sha(readSource(path)), revision?.currentSha256 || release?.currentSha256 || expected,
      revision ? 'Unreviewed V173 specialist source: ' + path
        : release ? 'Unreviewed V172 verifier: ' + path
          : 'Unreviewed V171 added source: ' + path);
  }
  for (const [path, expected] of Object.entries(ARMORY_V174_ECONOMY_NEW_SOURCES))
    assert.equal(sha(readSource(path)), expected, 'Unreviewed V174 economy source: ' + path);
  assert.equal(HUB_V187_SERVICE_SUCCESSOR.previousSha256,HUB_V179_SERVICE_SUCCESSOR.currentSha256,
    'Broken V179-to-V187 service chain');
  assert.equal(sha(readSource(HUB_V187_SERVICE_SUCCESSOR.path)),
    HUB_V187_SERVICE_SUCCESSOR.currentSha256,
    'Unreviewed V187 armory service location: ' + HUB_V187_SERVICE_SUCCESSOR.path);
  for (const [path, receipt] of Object.entries(V165_VERIFIER_SUCCESSORS_V171)) {
    const revision = V165_VERIFIER_SUCCESSORS_V173[path];
    const latest = V165_VERIFIER_SUCCESSORS_V174[path];
    const approvedV176 = V165_VERIFIER_SUCCESSORS_V176[path];
    const approvedV177 = V165_VERIFIER_SUCCESSORS_V177[path];
    const approvedV178 = V165_VERIFIER_SUCCESSORS_V178[path];
    const approvedV188 = V165_VERIFIER_SUCCESSORS_V188[path];
    const approvedV189 = V165_VERIFIER_SUCCESSORS_V189[path];
    if (revision) assert.equal(revision.previousSha256, receipt.currentSha256,
      'Broken V171-to-V173 verifier chain: ' + path);
    if (latest) assert.equal(latest.previousSha256, (revision || receipt).currentSha256,
      'Broken V171/V173-to-V174 verifier chain: ' + path);
    if (approvedV176) assert.equal(approvedV176.previousSha256,
      (latest || revision || receipt).currentSha256,
      'Broken V174-to-V176 verifier chain: ' + path);
    if (approvedV177) assert.equal(approvedV177.previousSha256,
      (approvedV176 || latest || revision || receipt).currentSha256,
      'Broken V173-to-V177 cumulative verifier chain: ' + path);
    if (approvedV178) assert.equal(approvedV178.previousSha256,
      (approvedV177 || approvedV176 || latest || revision || receipt).currentSha256,
      'Broken V176-to-V178 audit verifier chain: ' + path);
    if (approvedV188) assert.equal(approvedV188.previousSha256,
      (approvedV178 || approvedV177 || approvedV176 || latest || revision || receipt).currentSha256,
      'Broken V177-to-V188 cumulative verifier chain: ' + path);
    if (approvedV189) assert.equal(approvedV189.previousSha256,
      (approvedV188 || approvedV178 || approvedV177 || approvedV176 || latest || revision || receipt).currentSha256,
      'Broken V178-to-V189 audit verifier chain: ' + path);
    assert.equal(sha(readSource(path)),
      approvedV189?.currentSha256 || approvedV188?.currentSha256
        || approvedV178?.currentSha256 || approvedV177?.currentSha256 || approvedV176?.currentSha256
        || latest?.currentSha256 || revision?.currentSha256 || receipt.currentSha256,
      approvedV189 ? 'Unreviewed V189 audit verifier successor: ' + path
        : approvedV188 ? 'Unreviewed V188 cumulative verifier successor: ' + path
          : approvedV178 ? 'Unreviewed V178 audit verifier successor: ' + path
            : approvedV177 ? 'Unreviewed V177 cumulative verifier successor: ' + path
              : approvedV176 ? 'Unreviewed V176 verifier successor: ' + path
                : latest ? 'Unreviewed V174 verifier successor: ' + path
                  : revision ? 'Unreviewed V173 verifier successor: ' + path
                    : 'Unreviewed V171 verification successor: ' + path);
  }
  for (const [path, receipt] of Object.entries(ARMORY_V169_SUCCESSORS)) {
    assert.ok(Object.hasOwn(ARSENAL_V167_SUCCESSORS, path), 'Missing V167 predecessor: ' + path);
    assert.equal(receipt.previousSha256, ARSENAL_V167_SUCCESSORS[path].currentSha256,
      'Incorrect V169 predecessor: ' + path);
    assert.equal(sha(readSource(receipt.verifier)), receipt.verifierSha256,
      'Unreviewed V169 behavioral verifier: ' + receipt.verifier);
  }
  const changed = keys(before).filter(path => before[path] !== after[path]);
  const added = keys(after).filter(path => !Object.hasOwn(before, path));
  for (const path of [...changed, ...added]) assert.ok(!path.startsWith('src/forge') || Object.hasOwn(corrections, path),
    'Forge is deferred by the user outside the verified maintenance correction: ' + path);
  assert.ok(Array.isArray(bridge.transitions) && Array.isArray(bridge.addedSources));
  assert.deepEqual(bridge.transitions.map(row => row.path), changed, 'Declare every changed inherited V162 source exactly once');
  assert.deepEqual(bridge.addedSources.map(row => row.path), added, 'Declare every new V163 source exactly once');
  for (const row of [...bridge.transitions, ...bridge.addedSources]) {
    assert.equal(row.previousSha256, before[row.path] ?? null);
    assert.equal(row.currentSha256, after[row.path]);
    assert.equal(typeof row.reason, 'string');
    assert.ok(row.reason.trim().length >= 24, 'Explain the deliberate change: ' + row.path);
    assert.ok(Array.isArray(row.verifiers) && row.verifiers.length > 0);
    assert.equal(new Set(row.verifiers).size, row.verifiers.length);
    for (const verifier of row.verifiers) {
      assert.match(verifier, /^scripts\/verify-[a-zA-Z0-9._-]+\.mjs$/);
      assert.ok(readSource(verifier).length > 0, 'Missing behavioral verifier: ' + verifier);
    }
  }
  return Object.freeze({ inherited: 87, changed: changed.length, unchanged: 87 - changed.length,
    added: added.length, current: keys(after).length });
}

/** A missing successor preserves the anchored record; invalid content never falls back. */
export function resolveAuditSourcesV163(previous, readSource = readRepository, { effective = false } = {}) {
  anchoredPredecessor(previous, readSource);
  let current;
  try {
    current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v163.json'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return previous.runtimeSourceSha256;
  }
  verifyAuditSuccessionV163(previous, current, readSource);
  // Never mutate V163 archival hashes. An explicit effective read exports the
  // exact, previously validated successor set to legacy audit callers.
  return effective ? Object.freeze({ ...current.runtimeSourceSha256,
    ...Object.fromEntries(Object.entries(ARSENAL_V167_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARMORY_V169_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARSENAL_V170_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARSENAL_V171_SUCCESSORS)
      .filter(([path]) => Object.hasOwn(current.runtimeSourceSha256, path))
      .map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARMORY_V174_ECONOMY_SUCCESSORS)
      .filter(([path]) => Object.hasOwn(current.runtimeSourceSha256, path))
      .map(([path, receipt]) => [path, receipt.currentSha256])) })
    : current.runtimeSourceSha256;
}

export function loadAuditSuccessionV163(readSource = readRepository) {
  const previous = JSON.parse(readSource('docs/forge/xeno-trials/progress-v162.json'));
  const current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v163.json'));
  return { previous, current, result: verifyAuditSuccessionV163(previous, current, readSource) };
}
