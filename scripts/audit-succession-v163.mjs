/** Byte-anchored V162 -> V163 continuation; historical documents stay immutable. */
import assert from 'node:assert/strict';
import { reviewedOriginalNamesDigestV183 } from './audit-original-names-v183.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { historicalIntegrationViewV182, reviewedIntegrationDigestV182,
  integratedRuntimeSourcesV182, verifyIntegrationV182 } from './audit-pr-integration-v182.mjs';
import { V179_RUNTIME_SUCCESSORS, V179_NEW_RUNTIME_SOURCES, reviewedDigestV179, verifyFollowupV179 as verifyTrialsBatchV179 } from './audit-succession-v179.mjs';
import { V180_RUNTIME_SUCCESSORS, V180_NEW_RUNTIME_SOURCES, reviewedDigestV180, verifyFollowupV180 } from './audit-succession-v180.mjs';

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

/** V177 continues the exact reviewed V167..V176 source chains. The old
 * receipts above remain immutable; only these explicitly listed successors
 * may replace their final bytes. Current gameplay evidence is kept separate. */
export const V177_SOURCE_SUCCESSORS = Object.freeze({
  "scripts/verify-hub-armory-v169.mjs": Object.freeze({ previousSha256: "900a3310329440309e2dc316c06bf91637a4024b376f324999c0801a1de8021e", currentSha256: "7c5f2bfd49c85a314297855e2cabdf29387d21bb21621d656b06118496fab0a1" }),
  "src/game-production-runtime.js": Object.freeze({ previousSha256: "8e31b01c84ef7af0b810d3aa4d22afc429153f362627b9f31d0b7b6c75ad60fb", currentSha256: "f0c9ff64ce004cc0dd8d028e3a62a717364fa0c1425eafb16b2ae8f808715419" }),
  "src/hub-armory-scene-v169.js": Object.freeze({ previousSha256: "036374b5b38dcb0dd43e92ef869eddf9f6e0a2c167a4ddf330261fc92570b5df", currentSha256: "4d65ab9fb59eb0ad924c3efe21f133ac9e52a0cf77b2410e4251b5d6fca378fc" }),
  "src/hub-armory-storefront-v169.js": Object.freeze({ previousSha256: "6130f994f84099de1bedc9f071e2b4d57f014dded55f9a8a508b7347d08b8476", currentSha256: "8ef018c182f28e97fceda6aadd688d3678f5addd5eb5ed19129495a9207e01d7" }),
  "src/weapon-magazine-inventory-v167.js": Object.freeze({ previousSha256: "2f9c281f886c93c7640d10a85f1550a1320bdedbd6f63ba57185739acc856928", currentSha256: "4943b8ba1c16b4b1430e0383220f44a284ed893963281f51a6279eb04c689014" }),
  "src/weapon-magazine-recovery-runtime-v168.js": Object.freeze({ previousSha256: "4dbf78d2a4aa096125dada27b2b5fff05c1b927777f705eaf7d57f7626b88889", currentSha256: "73eb796bf6d9159239e8a8c499bc8b73db9975a69016df5b7d9ef2d2d4eccf13" }),
  "src/weapon-magazine-world-v168.js": Object.freeze({ previousSha256: "6024a584079bf6bac0d83ccc439e810afb4d6aadc33990d51ce72fcae715962a", currentSha256: "acf8396585e068d33569f42537c4420af7501093428e77824981c494491209e2" }),
  "sw.js": Object.freeze({ previousSha256: "88ba286c6e78add4c054175da085cf56ad93d982749c09ed237e18605ed901f0", currentSha256: "282448609033fdb663983352987cee04c545e4fd4c66d67a227a83df6ec90675" }),
});

export const V165_VERIFIER_SUCCESSORS_V177 = Object.freeze({
  "scripts/verify-audit-continuation-v163.mjs": Object.freeze({ previousSha256: "b37258cad1f33d02fa7c18fffb19449ce8b96e971433b517c806a6550ae9be3a", currentSha256: "8e64247b3186d36a62352245ea6aadb6c2f6c7d117a8ffc13d4962990ba08dfd" }),
  "scripts/verify-parallel-completion-v165.mjs": Object.freeze({ previousSha256: "efb67151cd5a3e00434e1889bfd782ae94547f9300f858583e18845a9683e701", currentSha256: "7101cd9415b2455ce935beba92f062c4f86d08874d2ff19852cc162d093da0aa" }),
  "scripts/verify-public-release-v86.mjs": Object.freeze({ previousSha256: "1419dcf0e47abd91288748ac7b222ba0f2b0d354e2997ced49cedc2c44bee77e", currentSha256: "e56b5473e6e3d9e1f45b64cd10489544886229853be1cc75bdf8e1b1a099e705" }),
});

/** Baseline467 source identities for the bounded V177 continuation. This
 * separate predecessor map prevents deleting its new source-change ledger. */
export const V177_RUNTIME_PREDECESSORS = Object.freeze({
  "src/campaign-lethe-continuity-ui-v163.js": "eebe0c5042736c6eeba51b6199946938e6bae7d8483901b78dc8f234c03341e1",
  "src/campaign-lethe-continuity-v163.js": "fea5be5799000bcea712a78685d5cbd54c5ae9ffbe3d55b05692d8809f4aceb7",
  "src/game-production-runtime.js": "8e31b01c84ef7af0b810d3aa4d22afc429153f362627b9f31d0b7b6c75ad60fb",
  "src/hub-armory-scene-v169.js": "036374b5b38dcb0dd43e92ef869eddf9f6e0a2c167a4ddf330261fc92570b5df",
  "src/hub-armory-storefront-v169.js": "6130f994f84099de1bedc9f071e2b4d57f014dded55f9a8a508b7347d08b8476",
  "src/hub-batch-command-v177.js": null,
  "src/hub-batch-engineering-v177.js": null,
  "src/hub-batch-habitat-v177.js": null,
  "src/hub-batch-industrial-v177.js": null,
  "src/hub-room-enrichment-v177.js": null,
  "src/hub-room-life-v136.js": "e4d6da6506eec8f9071850079dbf156270895f6fa22395b49dfe8cdf96fb79a2",
  "src/npc-interdeck-routes-v165.js": "85a4805f83ddaee04d830a80ca070d3903d7f5933720f859ffd5f7ca489f77c1",
  "src/npc-lift-transit-v165.js": "2b492180395b6d78a73414a345a89c109f796daf3e18644b7b8419db223cd55b",
  "src/npc-service-routes-v161.js": "d3a3c9e274dbf5a92d930c39583bb2a056ead0c1c5d0f9162ee6e632ccf70750",
  "src/npc-service-traffic-v163.js": "50b90764828ab341cabb0d5795addd06092beed00957e6abc2a8310675e8de5d",
  "src/npc-station-relays-v166.js": "371f5de036111531b79adffea4e6d5ffaf0c1f86f5773b18fed88b129ccaf156",
  "src/player-appearance-hub-v126.js": "7f056e474636f829e5309b1c52e68e04d3e2844b275fb001b574d6af90fb8b6f",
  "src/player-locomotion-rig-v129.js": "719b3fc6a0e9efa876d640f292794fc1766ceb646b7d74effb6914e4419f2cb0",
  "src/player-transit-rig-v128.js": "62a3b7466b5d851c95d31ef00da7e79d8b65f43c0331e9a9d7acbe960a8f3103",
  "src/player-weapon-runtime-v125.js": "8f18c50f16c5f00f9dae9c3210ef51bbe4671efce1512d5f0f86ae95b9ab6342",
  "src/weapon-feed-admission-v193.js": null,
  "src/weapon-magazine-inventory-v167.js": "2f9c281f886c93c7640d10a85f1550a1320bdedbd6f63ba57185739acc856928",
  "src/weapon-magazine-recovery-runtime-v168.js": "4dbf78d2a4aa096125dada27b2b5fff05c1b927777f705eaf7d57f7626b88889",
  "src/weapon-magazine-world-v168.js": "6024a584079bf6bac0d83ccc439e810afb4d6aadc33990d51ce72fcae715962a",
  "src/weapon-underbarrel-v174.js": "eec7229224c2445bca73b7586ca41ac4f4af8b1f19e98881d5161ebed04e81d1",
  "sw.js": "88ba286c6e78add4c054175da085cf56ad93d982749c09ed237e18605ed901f0",
});

/** Development-only V177 tool successors are anchored to main467 bytes.
 * V175/V176 art receipts and admission policy remain separate and unchanged. */
export const V177_TOOL_SUCCESSORS = Object.freeze({
  "scripts/install-costume-art-v175.mjs": Object.freeze({ previousSha256: "9b6ef01e417485277aa83a6db17a37bb9a34609c1a97c27aa38d0338aaac4705", currentSha256: "0ffa2b6ed0e651263a2ac9e79f71dc18b16e6849027034705bd04de93605cb71" }),
  "scripts/verify-costume-art-installer-v175.mjs": Object.freeze({ previousSha256: "3dd3614861943c8cc02b5fcd7e39afe6b5bfe80caae5376964bf6706f5cb0435", currentSha256: "73cce3d4d6e62a43e7fe36fb960d03a0364a70dee8ea1916dbca71957d8d76f6" }),
});

export const V177_ARSENAL_SOURCE_INPUTS = Object.freeze({
  'docs/arsenal/ALIENS_TANTALUS_ARSENAL_EXHAUSTIF_SYSTEME_V1.xlsx': '3f9b5d0bee8bafd95819e7860d1a09a1357fb2bcd92facbe8ed0cc80fb6c4cbb',
  'docs/arsenal/data/tantalus_arsenal_master_v1.csv': '8f33064087e6025a450876db2068af285bd5251b180a4d8243fd5770aaeaa05a',
  'docs/arsenal/data/tantalus_arsenal_qa_v1.csv': 'c500389eb71811d543312c60a10bd4199843f7a5dea673de6beb0d140e95f091',
  'docs/arsenal/data/tantalus_weapon_evidence_backlog_v170.csv': '5e77f3d790b3f29869ccb3b6a183ef0ed5524fa75400e86dfdbec39db446ae4b'
});


/** Exact MainM tail; every V177 map/receipt remains a historical witness. */
export const V178_BASELINE_WITNESS = Object.freeze({
  "mainCommit": "5d9f28f05df732a71a17cec013aa39ebab6d4de1",
  "baselineProgressSha256": "e6a0feb4df2aa9595c3dca1319f496af69c66d424b19f9d3a5fe401ab2897b80",
  "documentCanonicalSha256": "1b66994e4606deeccef90d565cefbefd9a83ab51f3abcfc93727aeb852eb0338",
  "runtimeMapSha256": "c7d161fc46fbd88bc18d5dd66021aa9a18f8b45078da20a433cbe6daa1bbaa6f",
  "followupV177Sha256": "7257069cc76a3b674704190041495b0b56a4a448143019138f52311c96f5d57e",
  "table27Sha256": "ac8a9645ab4de1c773cb2315a54926a6bcf8c155fc4d8eeadd8e6fc397fdd250",
  "candidateLocalV177Sha256": "366958bc4e60f36fcf3848da3289f1f8e3905549bb589b7bfffee3e71fa25574",
  "v177ConstantsSha256": "cd7292ba61ffbbbed18f78aff8fa2a02810337bcdd7473780cce50f7683a0a42"
});
export const V178_MAIN_PREDECESSORS = Object.freeze({
  "src/npc-interdeck-routes-v165.js": "5330095a1f6d277e71e473c6b741c671fe02c4d4fc44133b3f5a37ccfebb103a",
  "sw.js": "282448609033fdb663983352987cee04c545e4fd4c66d67a227a83df6ec90675",
  "scripts/verify-npc-interdeck-routes-v165.mjs": "c6046941f7d20be320dec7603ee89d0c6b7c80f8149b89a42efd1c3be7a2e64b",
  "scripts/verify-audit-continuation-v163.mjs": "8e64247b3186d36a62352245ea6aadb6c2f6c7d117a8ffc13d4962990ba08dfd",
  "scripts/verify-public-release-v86.mjs": "e56b5473e6e3d9e1f45b64cd10489544886229853be1cc75bdf8e1b1a099e705",
  "scripts/qa-npc-interdeck-native-v165.py": "94cf93ca6257d2a5232b6fc2a5be6c7b3ceb74b6bd72a98f612a36e3fca7e8b3"
});
export const V178_RUNTIME_SUCCESSORS = Object.freeze({
  "src/npc-interdeck-routes-v165.js": Object.freeze({"previousSha256": "5330095a1f6d277e71e473c6b741c671fe02c4d4fc44133b3f5a37ccfebb103a", "currentSha256": "7fc995925c98d1a65fc75538d026320139b9f697f53e7b68d7701bde29bb01a4"}),
  "sw.js": Object.freeze({"previousSha256": "282448609033fdb663983352987cee04c545e4fd4c66d67a227a83df6ec90675", "currentSha256": "cca2f58e7c34952e15d0238edeb9d5606d8766b4bea15da955b61aa3a718bfaf"}),
});
export const V178_VERIFIER_SUCCESSORS = Object.freeze({
  "scripts/verify-npc-interdeck-routes-v165.mjs": Object.freeze({"previousSha256": "c6046941f7d20be320dec7603ee89d0c6b7c80f8149b89a42efd1c3be7a2e64b", "currentSha256": "331b36f0b73a7c8bc8bc2792400216c832cd7a9355c16b211ec7619d051f2080"}),
  "scripts/verify-audit-continuation-v163.mjs": Object.freeze({"previousSha256": "8e64247b3186d36a62352245ea6aadb6c2f6c7d117a8ffc13d4962990ba08dfd", "currentSha256": "da597b00722760cf102956851cbd14423a66d77a4fc04ff0a1f6bb000a441291"}),
  "scripts/verify-public-release-v86.mjs": Object.freeze({"previousSha256": "e56b5473e6e3d9e1f45b64cd10489544886229853be1cc75bdf8e1b1a099e705", "currentSha256": "bc913fdd26cd4af6eb67889002559e88e6e98f4952b2712c9186f006376222ab"}),
});
export const V178_QA_SUCCESSORS = Object.freeze({
  "scripts/qa-npc-interdeck-native-v165.py": Object.freeze({"previousSha256": "94cf93ca6257d2a5232b6fc2a5be6c7b3ceb74b6bd72a98f612a36e3fca7e8b3", "currentSha256": "1822cd7fa39ecb1d9ad6f692d8c9dea37993a1a0cdbb446963a3a544ea0f206a"}),
});
export const V178_NEW_DOCUMENTS = Object.freeze({
  "docs/development/CLOTURE_EXCEL_20261101.xlsx": "2a607d9fe749056cb2099cc6776a5ccb227068186eb422b7ab6253b05a6609bd",
  "docs/development/EXCEL_CLOSURE_20261101.json": "4f5aaf3a4b7e927d34fd75acc3e096314280323a27d72d368572cf63b9dca1c8",
  "docs/development/EXCEL_CLOSURE_20261101.md": "284fae29f99bbf3fb23633510bfd0fb68fdb9350335db144e89b3ac6830e9f47"
});
const canonicalV178 = value => Array.isArray(value) ? '[' + value.map(canonicalV178).join(',') + ']'
  : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonicalV178(value[key])).join(',') + '}'
    : JSON.stringify(value);
const canonicalHashV178 = value => sha(Buffer.from(canonicalV178(value)));

/** Resolve only an explicitly reviewed tail from the exact MainM endpoint.
 * Callers with a V165 digest must first complete their V171..V177 chain. */
export function reviewedLiveDigestV178(path, endpointMainM) {
  const receipts = [V178_RUNTIME_SUCCESSORS,V178_VERIFIER_SUCCESSORS,V178_QA_SUCCESSORS]
    .filter(map => Object.hasOwn(map,path)).map(map => map[path]);
  assert.ok(receipts.length <= 1, 'Ambiguous V178 successor: ' + path);
  if (!receipts.length) return endpointMainM;
  const receipt = receipts[0];
  assert.deepEqual(keys(receipt), ['currentSha256','previousSha256']);
  assert.equal(endpointMainM,V178_MAIN_PREDECESSORS[path], 'Incorrect MainM endpoint for V178: ' + path);
  assert.equal(receipt.previousSha256,endpointMainM, 'Broken MainM-to-V178 predecessor: ' + path);
  assert.ok(validHash(receipt.currentSha256));
  assert.notEqual(receipt.currentSha256,endpointMainM);
  return receipt.currentSha256;
}


// BEGIN V179_MAINN_PINS
function freezeManifestV179(value) { if(value&&typeof value==="object") { Object.values(value).forEach(freezeManifestV179); if(!Object.isFrozen(value))Object.freeze(value); } return value; }
export const V179_BASELINE_WITNESS = freezeManifestV179({
  "mainCommit": "d41b5fc120da2e7a5938308f9d3c852d20e53cc5",
  "progressSha256": "cc61060d14f3e7b5ecceccb7d36f897da8175965e7e15fb71a5de2be0676644a",
  "progressCanonicalSha256": "d361f5fd827297f8eac2bf924fb34c65440d7b93456a7e600208f9a259fc5200",
  "oldResolverSha256": "7fe71ebc20bd14fde1ab65ed834e294be151665715c3b18de5c68c6e21776a30",
  "v178ConstantsSha256": "9257e54ec41400fdcfad687efdb69f910a2028854b971f4c209f6b0fa0e26bc4",
  "auditLibraryPredecessors": {
    "scripts/audit-succession-v162.mjs": "6fd7253c4afea86d324de11cdb432772250f222c7e25cdd7df3be618135e0806",
    "scripts/audit-succession-v163.mjs": "f57a6f4cb1e76cd32d98f4824b26795e0445e5bfbc00aedd687ee18b67cf994c"
  },
  "protectedGameplayBytes": {
    "src/save.js": "afd5b289887c3a6be5d704ad9b501d9cd7bfeae4514fdfb4eaf21095e6d42304",
    "src/content-core-v50.js": "fc71b52d7dbe8b5ca69beb38cdbc19690fe67534372358b0998004e829cb3555",
    "src/cloud-sync-v119.js": "a3e41edade62db72897cfcd579c2efb4bd2928dc7136608542e95474ae722a68"
  }
});
export const V179_SOURCE_GROUPS = freezeManifestV179({
  "runtimeChanges": {
    "src/catalog-ui-v62.js": {
      "previousSha256": "998f8d92d2d32b236c37f9937167747ee7733b69dea45f1cbd97ec289a8060ba",
      "currentSha256": "97c6e8e1769a87881e125ea4766f0a102621c013f736d5219db7cb477a66b1c4"
    },
    "src/content.js": {
      "previousSha256": "4d98bbdaa3ed2cc297a1d715335b0cfa8edc7105c39ce3031a2db0fd77975d0b",
      "currentSha256": "916a3ee2c7c05a6a81e9de9eacb68e41ab9dd0aeac9be53e260c1024a369a701"
    },
    "src/hub-batch-industrial-v177.js": {
      "previousSha256": "9355e187a6c83ba6457e983871945101f3654ab17a24c7ee998765bce201c1ab",
      "currentSha256": "27cfc9084399b77193b0361904d8fc89151dc56bd010e4fe34ec7bc02ba1e0bc"
    },
    "src/hub-room-composition-v142.js": {
      "previousSha256": "64bdf33f28110a655bea4a38bda4035a235590feb0b66be363ffb0b914611907",
      "currentSha256": "d0fdb04488e49b7be3fe59d5e078742b0190f6c2189d575e5c6f6b9d1bffe029"
    },
    "src/hub-room-furnishing-v137.js": {
      "previousSha256": "8b93181c9cb7662b80a5f8a05205a29abee2b7701e30a331527ed18083374664",
      "currentSha256": "9997f2c954dfe7b0c32ae3094d2e09cbc958bbc40d1844c52a9696cef0292e45"
    },
    "src/hub-service-geometry-v139.js": {
      "previousSha256": "8f69ddd93564959ff44df15f3e4dcf553a626bc3568306d8ebdbb88985e03e9c",
      "currentSha256": "cf67fa0507cc064d21799a467fe8a34b2f8e3352ee81abd43466cb762ec3a752"
    },
    "sw.js": {
      "previousSha256": "cca2f58e7c34952e15d0238edeb9d5606d8766b4bea15da955b61aa3a718bfaf",
      "currentSha256": "c3e1b4a7f3bf10623f3e3962a309f981bd895f7ddb81d5a4dc03a79fa648b8aa"
    }
  },
  "verifierChanges": {
    "scripts/verify-audit-continuation-v162.mjs": {
      "previousSha256": "4a0f581c4cd915fbab05351d455b0b9a4d0e3722a659323026b4b021a488d9cc",
      "currentSha256": "553567e42de8ea0aa92ab44f98dce85113438a0fd1d931a45bff710f3799eb07"
    },
    "scripts/verify-audit-continuation-v163.mjs": {
      "previousSha256": "da597b00722760cf102956851cbd14423a66d77a4fc04ff0a1f6bb000a441291",
      "currentSha256": "3becc5518175893544c1c7aee7b8fc6cd521d4e3584b6b149a6b1691d4450e8c"
    },
    "scripts/verify-capture-observation-v177.mjs": {
      "previousSha256": "e07b131c2f0189592a87672d02d35a98308dc8034787bee55b64907b3dd26f4f",
      "currentSha256": "881f67af9a26ef83b223bea4aa7c185af9e9a2b5c757ae9549d67e3d6f3a4119"
    },
    "scripts/verify-hub-circulation-v137.mjs": {
      "previousSha256": "e7e91327b7ecdf99e93a8ebb95f543b9f1e1b1a7efdef0429c5cfef192e66d24",
      "currentSha256": "12b3e7df85da93c8d103b7edf466d552842a9a909d647d0c537b4c8d593742ef"
    },
    "scripts/verify-hub-room-furnishing-v137.mjs": {
      "previousSha256": "f4bf5aacfa26279abab6fe089f5d6860d449a8ff48ef0fee602684a3a3e9be1f",
      "currentSha256": "7122d778c80fb8874cf8116168ebc57f39dadc5883f8a88df9f4e4f291b3bde9"
    },
    "scripts/verify-hub-room-life-v136.mjs": {
      "previousSha256": "3a4bc2fdb88a38f712b7377c7a054195b0218965bf1c7bcaa6ab0bfbf8fe4d23",
      "currentSha256": "b76f0fe9008656bb8b2b6dc4b24b40c0ef061a28c5da234f3b6cf36bbb35eec0"
    },
    "scripts/verify-hub-service-routes-v138.mjs": {
      "previousSha256": "6fa381291a721a891f964f86a4e95861bb267eaff5130416a3f1ecd451ed5173",
      "currentSha256": "b4929721d0aed65ee7f1cc882ebd43bc7a7a1f825a0ecc9cc9df49780d3035a6"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "bc913fdd26cd4af6eb67889002559e88e6e98f4952b2712c9186f006376222ab",
      "currentSha256": "0c2be84858f46b7464b643bec5a05f49cef44b833d8139492b09f90b967a1d80"
    },
    "scripts/verify-xeno-trials-capture-v163.mjs": {
      "previousSha256": "cd7674a94db3f8ce0c8166f5f1e38848d43b587a0be3c36323452c80e7ef4b28",
      "currentSha256": "9c544d59ef95c88c15c7f4291ddb2ac2ea2e0dbfb1aed5d3a39b1e23f04a66bd"
    }
  },
  "qaChanges": {
    "scripts/qa-xeno-trials-capture-v163.py": {
      "previousSha256": "3681d567ee38d7acc00a5df59340ef3ee3c0423acd226694d041bca86881855d",
      "currentSha256": "75fc1ea09b69ef14644769495439288cb247bd5452f9d6bbc080d05573e51fdc"
    }
  },
  "dataChanges": {
    "docs/forge/xeno-trials/batch100-v177.json": {
      "previousSha256": "2fc2c3229920b3d425f50313270bc88afe1338213253451f6de544b0d3576d3a",
      "currentSha256": "2b1d3bb47423e738b1cf8f4e4844a5d717cdb70c695878bdce18beb6ffa3b734"
    }
  },
  "supportingChanges": {
    "package.json": {
      "previousSha256": "b4a470ef63e5a099aaadf4dac7bcde360a580c385de3b36e4c681acc8780dd7d",
      "currentSha256": "ff849b03809ae5f0e8bb0949cc76291330425f881d6cd113cca536a20c79cd61"
    }
  },
  "newRuntimeSources": {
    "src/alien-base-bridge-v1.js": {
      "previousSha256": null,
      "currentSha256": "9f4a07ea2dd944b6e4c75501023303ad1b5e100a1b49060f05d6526db30c9e02"
    },
    "src/alien-base-snapshot-v1.js": {
      "previousSha256": null,
      "currentSha256": "a5682c47485b2fcc7e68f4a21212038bac9c43861485471439894c263caae9b5"
    }
  },
  "newVerifiers": {
    "scripts/verify-alien-base-bridge-v1.mjs": {
      "previousSha256": null,
      "currentSha256": "946f0cb8d36047483eb8056e19a51d62d74d839548d139eef71adaf1ae6a20ab"
    },
    "scripts/verify-alien-base-import-contract-v179.mjs": {
      "previousSha256": null,
      "currentSha256": "09596031ea08e7169a32288a1f88b1a08758d62286f8cd1f3cbd4311995a1ad6"
    },
    "scripts/verify-alien-base-pr7-proposal-v1.mjs": {
      "previousSha256": null,
      "currentSha256": "c9f90078396d5f75f29a79e8d9b0c662cd59b250c8003a78de110c284af0df8f"
    },
    "scripts/verify-hub-door-bay-v178.mjs": {
      "previousSha256": null,
      "currentSha256": "775df80d68e5ddd8697e44bed32b82881b6ca288d35fd884efc035a06ba6bb65"
    }
  },
  "newTools": {
    "scripts/alien-base-pr7-proposal-v1.mjs": {
      "previousSha256": null,
      "currentSha256": "6193d695718e00abb6fadb3f0161ca40f2c15e462cfcf9ef679e8b7393564176"
    },
    "scripts/export-alien-base-tantalus-v1.mjs": {
      "previousSha256": null,
      "currentSha256": "5cf9d96709d96c53357f11bd59d24da53e58a25c11b5f7bb3ba09507d7869779"
    },
    "scripts/sync-alien-base-v1.mjs": {
      "previousSha256": null,
      "currentSha256": "39e137a193da5023549a0c01113dbcabff2d9f1d745cb1d77db9ad47a39f1b91"
    }
  },
  "newDocuments": {
    "docs/development/ALIEN_BASE_PR7_PROPOSAL_V1.md": {
      "previousSha256": null,
      "currentSha256": "495919983786f47d13edd1bcab4d3482ac27a9c0206f092e34c357c9a5f44247"
    },
    "docs/development/ALIEN_BASE_REFERENCE_REVIEW_20261102.md": {
      "previousSha256": null,
      "currentSha256": "14101044ccd9f75246cf32889e077a737d461002e793f5cd86ce565aed8040fa"
    },
    "docs/development/ALIEN_BASE_SOURCE_SNAPSHOTS_20261102.json": {
      "previousSha256": null,
      "currentSha256": "38a9b5b3ad87806a806283c991fcb82f31af826581fff796f001eb415e527928"
    },
    "docs/development/ALIEN_BASE_SYNC.md": {
      "previousSha256": null,
      "currentSha256": "7ea26f4c56ca5430af0e84e378284a03c2b87606b24c43bc97980c7a4cc53150"
    },
    "docs/development/Alien_Base_Current_Mapping_Gaps_20261102.csv": {
      "previousSha256": null,
      "currentSha256": "55ba485208350c762f444b849ebd36ee042e9e8dc6bd724386d4f52c9d4d62da"
    },
    "docs/development/Alien_Base_Import_Status.csv": {
      "previousSha256": null,
      "currentSha256": "b1c88d77814da689f8ad8c9fc1464dc155b6b7490c063fe0f034fa2db9e543a3"
    },
    "docs/development/data/ALIEN_BASE_PR7_PROVENANCE_V1.json": {
      "previousSha256": null,
      "currentSha256": "84d6d4ecf56c5b8797bb589bde1ff066ea768f757bf1832938c16ff8fb99e5ef"
    },
    "docs/development/data/ALIEN_BASE_PR7_REGISTRY_V1.json": {
      "previousSha256": null,
      "currentSha256": "ce669770c760960a7d3b07be4c4e9531e2656d3967ae435c62fe0f692952c977"
    },
    "docs/forge/xeno-trials/V179-REFERENCE-AND-WORKSHOP-CONTINUATION.md": {
      "previousSha256": null,
      "currentSha256": "35b6b731c1e393378e25cd9b6e2f8afe6826331ed583263cd4b656a719d38aa5"
    },
    "docs/forge/xeno-trials/tantalus-door-bay-v179.json": {
      "previousSha256": null,
      "currentSha256": "09d6e2ace1e8748435d49a808aac1754723e0cfb7ab52940779848113d8af27e"
    }
  },
  "newWorkflows": {
    ".github/workflows/alien-base-bridge.yml": {
      "previousSha256": null,
      "currentSha256": "fdf116ad4bcbb75993449f7bd8474d983562bb6b74a2930dc91525a76b122a06"
    }
  }
});
// END V179_MAINN_PINS

/** An additive V179 view can never rewrite any field delivered on MainN. */
export function historicalProgressViewV179(current) {
  current = historicalIntegrationViewV182(current);
  if (!Object.hasOwn(current, 'followupV179')) return current;
  const previous = { ...current }; delete previous.followupV179;
  assert.equal(canonicalHashV178(previous),V179_BASELINE_WITNESS.progressCanonicalSha256,
    'MainN/V177/V178 documentary witness was rewritten');
  return previous;
}

/** MainN is an endpoint, never the start of a replay of older receipt chains. */
export function reviewedMainNDigestV179(path, predecessorMainN) {
  const maps=['runtimeChanges','verifierChanges','qaChanges','dataChanges','supportingChanges'];
  const matches=maps.filter(group=>Object.hasOwn(V179_SOURCE_GROUPS[group],path)).map(group=>V179_SOURCE_GROUPS[group][path]);
  assert.ok(matches.length<=1,'Ambiguous V179 successor: '+path);
  if(!matches.length)return predecessorMainN;
  const receipt=matches[0];
  assert.equal(predecessorMainN,receipt.previousSha256,'Incorrect MainN endpoint for V179: '+path);
  assert.match(receipt.currentSha256,/^[a-f0-9]{64}$/);assert.notEqual(receipt.currentSha256,predecessorMainN);
  return receipt.currentSha256;
}

/** The V178 resolver remains unchanged; only its fully resolved endpoint gets a new tail. */
export function reviewedCurrentDigestV179(path, endpointMainM) {
  return reviewedIntegrationDigestV182(path, reviewedMainNDigestV179(path,reviewedLiveDigestV178(path,endpointMainM)));
}

export function verifyFollowupV179(current, readSource = readRepository) {
  const record=current.followupV179;
  assert.ok(record&&typeof record==='object','Missing V179 continuation');
  historicalProgressViewV179(current);
  assert.equal(record.schema,179);assert.equal(record.baselineCommit,V179_BASELINE_WITNESS.mainCommit);
  assert.equal(record.baselineProgressSha256,V179_BASELINE_WITNESS.progressSha256);
  assert.equal(record.state,'PREPUBLICATION');assert.equal(record.runtimeValidation,'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');
  assert.equal(record.historicalRuntimeWitnessCount,147);assert.equal(record.historicalResultsTransferred,false);
  assert.equal(record.oldWorkbookBytesPreserved,true);assert.equal(record.forgeState,'DEFERRED_BY_USER');
  assert.deepEqual(record.releaseEvidence,{nodeSuite:null,nativeCandidate:null,ci:null,review:null,merge:null});
  assert.deepEqual([record.newPngAssets,record.approved1to1,record.fullArtTasksClosed,record.humanParticipants,record.primaryArchivesRecovered],[0,0,0,0,0]);
  assert.deepEqual(record.remaining,{sourceVersionProposals:45,inactivePr7Crosswalks:15,researchOnlyWeapons:129,sevenRoutesClosed:false,allFeedsCertifiedStable:false,driveContents:'UNKNOWN'});
  assert.ok(Object.hasOwn(record,'candidateLocalValidationV179'));
  assert.ok(typeof record.scope==='string'&&record.scope.length>=60);
  assert.equal(sha(Buffer.from(reviewedLiveDigestV178.toString())),V179_BASELINE_WITNESS.oldResolverSha256,'Historical V178 resolver changed');
  assert.equal(canonicalHashV178({V178_BASELINE_WITNESS,V178_MAIN_PREDECESSORS,V178_RUNTIME_SUCCESSORS,V178_VERIFIER_SUCCESSORS,V178_QA_SUCCESSORS,V178_NEW_DOCUMENTS}),V179_BASELINE_WITNESS.v178ConstantsSha256,'Historical V178 receipts changed');
  assert.deepEqual(Object.keys(record.sourceGroups).sort(),Object.keys(V179_SOURCE_GROUPS).sort(),'Incomplete V179 source groups');
  for(const [group,map]of Object.entries(V179_SOURCE_GROUPS)) {
    const rows=record.sourceGroups[group];assert.deepEqual(rows.map(row=>row.path).sort(),Object.keys(map).sort(),'Incomplete V179 '+group);
    assert.equal(rows.length,new Set(rows.map(row=>row.path)).size);
    for(const row of rows) {
      assert.deepEqual(Object.keys(row).sort(),['currentSha256','path','previousSha256']);
      assert.deepEqual([row.previousSha256,row.currentSha256],[map[row.path].previousSha256,map[row.path].currentSha256]);
      assert.equal(sha(readSource(row.path)),reviewedIntegrationDigestV182(row.path,row.currentSha256),'Unreviewed V179 '+group+': '+row.path);
      if(row.previousSha256!==null)assert.equal(reviewedMainNDigestV179(row.path,row.previousSha256),row.currentSha256);
    }
  }
  assert.deepEqual(record.auditLibraries.map(row=>row.path).sort(),Object.keys(V179_BASELINE_WITNESS.auditLibraryPredecessors).sort());
  for(const row of record.auditLibraries){assert.equal(row.previousSha256,V179_BASELINE_WITNESS.auditLibraryPredecessors[row.path]);assert.equal(sha(readSource(row.path)),reviewedIntegrationDigestV182(row.path,row.currentSha256),'Unreviewed V179 audit library: '+row.path);}
  assert.deepEqual(record.protectedGameplayBytes,V179_BASELINE_WITNESS.protectedGameplayBytes);
  // V183: an owner-validated successor (audit-original-names-v183.mjs) may replace protected bytes.
  for(const[path,expected]of Object.entries(record.protectedGameplayBytes))assert.equal(sha(readSource(path)),reviewedOriginalNamesDigestV183(path,expected),'MainN Save/catalogue/cloud contract changed: '+path);
  assert.deepEqual(record.visualOpenFindings,{basis:'HISTORICAL_SOURCE70_STATIC_READBACK_5PNGS_NOT_CURRENT_V179',openP2Areas:['briefing/Mire','cryo/pods','medical/morgue','quarantine/Bioforge'],currentV179VisualClosure:false,discardedFalsePositive:'hangar bracket: door painted after bracket'});
  assert.deepEqual(record.referenceAdmission,{activeMasterAliases:0,sourceVersionPending:45,pr7ProposalsActivated:0,newPlayableContent:0,upstreamCommit:'284e9da402b5be0da3f561459ea96224e9d59b6c',gameCatalogBaselineCommit:V179_BASELINE_WITNESS.mainCommit});
  assert.deepEqual(record.currentWorkstreams?.map(row=>row.id),['C179-REFERENCES','C179-WORKSHOP','C179-TRIALS-OBSERVATION']);
  for(const stream of record.currentWorkstreams){assert.equal(stream.codeState,'IMPLEMENTED_WITH_TARGETED_NODE_TESTS');assert.equal(stream.nativeState,'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');assert.ok(typeof stream.scope==='string'&&stream.scope.length>=24);}
  assert.equal(record.readableAddendum,'docs/forge/xeno-trials/V179-REFERENCE-AND-WORKSHOP-CONTINUATION.md');
  return Object.freeze({historicalRuntimeWitnesses:147,reviewedRuntimeSuccessors:Object.keys(V179_SOURCE_GROUPS.runtimeChanges).length,newRuntimeSources:Object.keys(V179_SOURCE_GROUPS.newRuntimeSources).length,sourceGroups:Object.keys(V179_SOURCE_GROUPS).length});
}

export function reviewedCurrentDigestV180(path, endpointMainM) {
  return reviewedDigestV180(path, reviewedCurrentDigestV179(path, endpointMainM));
}

export function verifyFollowupV178(current, readSource = readRepository) {
  current = historicalProgressViewV179(current);
  const record = current.followupV178;
  assert.ok(record && typeof record === 'object', 'Missing V178 continuation');
  assert.equal(record.schema,178);
  assert.equal(record.baselineCommit,V178_BASELINE_WITNESS.mainCommit);
  assert.equal(record.baselineProgressSha256,V178_BASELINE_WITNESS.baselineProgressSha256);
  assert.equal(record.state,'PREPUBLICATION');
  assert.equal(record.runtimeValidation,'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');
  assert.equal(record.runtimeSourceCount,147);
  assert.equal(record.historicalV177ResultsTransferred,false);
  assert.equal(record.sourceByteIdenticalToV177,false);
  assert.deepEqual(record.releaseEvidence,{nodeSuite:null,nativeCandidate:null,ci:null,review:null,merge:null});
  assert.deepEqual([record.newPngAssets,record.approved1to1,record.fullArtTasksClosed,record.humanParticipants,record.primaryArchivesRecovered],[0,0,0,0,0]);
  assert.deepEqual([record.sevenRoutesClosed,record.allFeedsCertifiedStable],[false,false]);
  assert.equal(record.forgeState,'DEFERRED_BY_USER');
  assert.ok(record.scope.length >= 60);
  const old = { ...current }; delete old.followupV178;
  assert.equal(canonicalHashV178(old),V178_BASELINE_WITNESS.documentCanonicalSha256,
    'MainM/V177 documentary witness was rewritten');
  assert.equal(canonicalHashV178(current.runtimeSourceSha256),V178_BASELINE_WITNESS.runtimeMapSha256);
  assert.equal(Object.keys(current.runtimeSourceSha256).length,147);
  assert.equal(canonicalHashV178(current.followupV177),V178_BASELINE_WITNESS.followupV177Sha256);
  assert.equal(canonicalHashV178(current.tables['27_RepriseV177']),V178_BASELINE_WITNESS.table27Sha256);
  assert.equal(canonicalHashV178(current.candidateLocalValidationV177),V178_BASELINE_WITNESS.candidateLocalV177Sha256);
  assert.equal(canonicalHashV178({V177_SOURCE_SUCCESSORS,V165_VERIFIER_SUCCESSORS_V177,
    V177_RUNTIME_PREDECESSORS,V177_TOOL_SUCCESSORS}),V178_BASELINE_WITNESS.v177ConstantsSha256,
    'MainM V177 receipt constants were rewritten');
  assert.deepEqual(keys(V178_RUNTIME_SUCCESSORS),['src/npc-interdeck-routes-v165.js','sw.js']);
  assert.deepEqual(keys(V178_VERIFIER_SUCCESSORS),['scripts/verify-audit-continuation-v163.mjs',
    'scripts/verify-npc-interdeck-routes-v165.mjs','scripts/verify-public-release-v86.mjs']);
  assert.deepEqual(keys(V178_QA_SUCCESSORS),['scripts/qa-npc-interdeck-native-v165.py']);
  for (const [field,map] of [['runtimeChanges',V178_RUNTIME_SUCCESSORS],
    ['verifierChanges',V178_VERIFIER_SUCCESSORS],['qaChanges',V178_QA_SUCCESSORS]]) {
    assert.deepEqual(record[field]?.map(row => row.path).sort(),keys(map),'Incomplete V178 '+field);
    assert.equal(new Set(record[field].map(row => row.path)).size,record[field].length);
    for (const row of record[field]) {
      assert.deepEqual(keys(row),['currentSha256','path','previousSha256']);
      const receipt=map[row.path];
      assert.deepEqual([row.previousSha256,row.currentSha256],[receipt.previousSha256,receipt.currentSha256]);
      assert.equal(reviewedLiveDigestV178(row.path,V178_MAIN_PREDECESSORS[row.path]),receipt.currentSha256);
      assert.equal(sha(readSource(row.path)),reviewedIntegrationDigestV182(row.path,reviewedMainNDigestV179(row.path,receipt.currentSha256)),'Unreviewed V178 '+field+': '+row.path);
      if(field==='runtimeChanges') assert.ok(Object.hasOwn(current.runtimeSourceSha256,row.path));
    }
  }
  assert.deepEqual(record.documentarySnapshots?.map(row=>row.path).sort(),keys(V178_NEW_DOCUMENTS));
  for(const row of record.documentarySnapshots) {
    assert.equal(row.sha256,V178_NEW_DOCUMENTS[row.path]);
    assert.equal(row.state,'DATED_IMPORTED_SNAPSHOT_NOT_CURRENT_GAMEPLAY_VALIDATION');
    assert.equal(sha(readSource(row.path)),row.sha256,'Unreviewed V178 documentary snapshot: '+row.path);
  }
  return Object.freeze({historicalRuntimeSources:147,runtimeSuccessors:2,verifierSuccessors:3,qaSuccessors:1,documentarySnapshots:3});
}


function sourceDigestV177(path, previous) {
  const receipt = V177_SOURCE_SUCCESSORS[path];
  if (!receipt) return reviewedCurrentDigestV180(path, previous);
  assert.deepEqual(keys(receipt), ['currentSha256', 'previousSha256']);
  assert.equal(receipt.previousSha256, previous, 'Broken V176-to-V177 source chain: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid V177 source digest: ' + path);
  assert.notEqual(receipt.currentSha256, previous, 'A V177 source successor must identify changed bytes: ' + path);
  return reviewedCurrentDigestV180(path, receipt.currentSha256);
}

/** One verifier resolver serves the cumulative guard and the source auditor.
 * This prevents a valid newer receipt being missed by either caller. */
export function verifyReviewedVerifierV177(path, original, readSource = readRepository) {
  assert.ok(validHash(original), 'Missing reviewed verifier predecessor: ' + path);
  let expected = original, version = 'V165';
  for (const [id, receipts] of [
    ['V171', V165_VERIFIER_SUCCESSORS_V171], ['V173', V165_VERIFIER_SUCCESSORS_V173],
    ['V174', V165_VERIFIER_SUCCESSORS_V174], ['V176', V165_VERIFIER_SUCCESSORS_V176],
    ['V177', V165_VERIFIER_SUCCESSORS_V177]
  ]) {
    if (!Object.hasOwn(receipts, path)) continue;
    const receipt = receipts[path];
    assert.deepEqual(keys(receipt), ['currentSha256', 'previousSha256']);
    assert.equal(receipt.previousSha256, expected, 'Broken ' + version + '-to-' + id + ' verifier chain: ' + path);
    assert.ok(validHash(receipt.currentSha256), 'Invalid ' + id + ' verifier digest: ' + path);
    assert.notEqual(receipt.currentSha256, expected, 'A verifier successor must identify changed bytes: ' + path);
    expected = receipt.currentSha256; version = id;
  }
  const live = reviewedCurrentDigestV180(path, expected);
  if (live !== expected) version = 'V178';
  assert.equal(sha(readSource(path)), live, 'Unreviewed ' + version + ' verifier successor: ' + path);
  return live;
}

/** The new tracker records bounded corrections, not artistic or release
 * completion. Rebuilding hashes or a workbook cannot manufacture a QA receipt. */
export function verifyOpenWorkstreamsV177(current, readSource = readRepository) {
  const followup = current.followupV177;
  assert.ok(followup && typeof followup === 'object' && !Array.isArray(followup), 'Missing V177 open-work tracker');
  assert.equal(followup.schema, 177);
  assert.equal(followup.baselineCommit, '4676a78746d8becdb5d6836701e96cc37d7d462f');
  assert.equal(followup.baselineProgressSha256, '767f5aab50f0c90d27ace678942d4ca62d5033cfda3c13aa92e441cc6630c86e');
  assert.equal(followup.state, 'PREPUBLICATION');
  assert.equal(followup.runtimeValidation, 'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');
  assert.deepEqual(followup.releaseEvidence, { nodeSuite: null, nativeCandidate: null, ci: null, review: null, merge: null });
  assert.deepEqual([followup.approved1to1, followup.fullArtTasksClosed, followup.humanParticipants], [0, 0, 0]);
  assert.deepEqual(followup.remaining, { costumeReferences: 18, fullNativeLocomotionNotCertified: true,
    newArchivesRecovered: 0, driveContents: 'UNKNOWN', forgeState: 'DEFERRED_BY_USER' });
  const ids = ['C177-ARSENAL','C177-PLAYER','C177-ROUTES','C177-CAMPAIGN','C177-SHIP','C177-AUDIT'];
  assert.deepEqual(followup.workstreams?.map(row => row.id), ids);
  assert.equal(followup.workbookTable, '27_RepriseV177');
  const table = current.tables?.[followup.workbookTable];
  assert.equal(table?.headers?.length, 12);
  assert.deepEqual(table.rows.map(row => row[0]), [...ids, 'H168-DELIVERY']);
  for (const [index, stream] of followup.workstreams.entries()) {
    assert.equal(stream.codeState, 'IMPLEMENTATION_AND_TARGETED_TESTS_REPORTED');
    assert.equal(stream.nativeState, 'REQUIRES_OWN_EXACT_HEAD_RECEIPTS');
    assert.ok(stream.problem.length >= 24 && stream.implementedScope.length >= 24 && stream.limits.length >= 24);
    assert.deepEqual([stream.approved1to1, stream.artClosed, stream.humanParticipants], [0, 0, 0]);
    assert.equal(table.rows[index].length, 12);
    assert.deepEqual(table.rows[index].slice(-3), [0, 0, 0]);
    assert.deepEqual(table.rows[index].slice(6, 8), [stream.codeState, stream.nativeState]);
    for (const path of stream.modules) {
      assert.match(path, /^src\/[a-zA-Z0-9._-]+\.js$/);
      assert.ok(!path.startsWith('src/forge'), 'Forge cannot be reopened by V177');
      assert.ok(readSource(path).length > 0, path);
    }
    assert.ok(stream.verifiers.length > 0);
    for (const verifier of stream.verifiers) {
      assert.match(verifier, /^scripts\/verify-[a-zA-Z0-9._-]+\.mjs$/);
      assert.equal(sha(readSource(verifier)), reviewedCurrentDigestV180(verifier, followup.verifierHashes[verifier]), 'Unreviewed V177 behavioral verifier: ' + verifier);
    }
  }
  assert.deepEqual(followup.sourceChanges.map(row => row.path), Object.keys(V177_RUNTIME_PREDECESSORS).sort(),
    'Incomplete V177 source-change ledger');
  for (const row of followup.sourceChanges) {
    assert.ok(Object.hasOwn(current.runtimeSourceSha256, row.path) || Object.hasOwn(V177_SOURCE_SUCCESSORS, row.path),
      'Unregistered V177 runtime source: ' + row.path);
    assert.equal(row.previousSha256, V177_RUNTIME_PREDECESSORS[row.path], 'Unreviewed V177 runtime predecessor: ' + row.path);
    assert.ok(validHash(row.currentSha256)); assert.notEqual(row.previousSha256, row.currentSha256);
    assert.equal(sha(readSource(row.path)), reviewedCurrentDigestV180(row.path, row.currentSha256), 'Unreviewed V177 runtime bytes: ' + row.path);
    assert.ok(row.reason.length >= 60 && row.verifiers.length > 0);
  }
  const previousQaDrivers = {
    'scripts/qa-npc-matte-apertures-v164.py': 'ad16416f864867a27bb189fe6d5f6fda9d456cecb64050c3072831266058d57a',
    'scripts/qa-xeno-trials-capture-v163.py': 'cfb189f420d1967951faaa50d7a186abf1905b167ab7bd1fef68ead58aa91252',
    'scripts/qa-tantalus-enrichment-v177.py': null,
    'scripts/qa-hub-service-details-v165.py': 'e461ba03888a7da7c0f6204cc67f4bfd91f00a83f451cc00b6ea7fabea6c3dd6',
    'scripts/qa-npc-service-routes-v161.py': '15d51ddde8d37a18e3c4f529401220e03229bdb8fadeac93b4c0c982fe9cb73d',
    'scripts/qa-npc-annex-service-routes-v163.py': 'bebefcd0e80cc81229ba0008bef8945b653e85fa414343412ba2127594fa8fdc'
  };
  assert.deepEqual(followup.qaDriverChanges?.map(row => row.path), Object.keys(previousQaDrivers));
  for (const row of followup.qaDriverChanges) {
    assert.equal(row.state, 'PILOT_SOURCE_REVIEWED_NO_RUN_RESULT_INFERRED');
    assert.equal(row.previousSha256, previousQaDrivers[row.path], 'Unreviewed V177 QA predecessor: ' + row.path);
    assert.ok(validHash(row.currentSha256)); assert.notEqual(row.previousSha256, row.currentSha256);
    assert.equal(sha(readSource(row.path)), reviewedCurrentDigestV180(row.path, row.currentSha256), 'Unreviewed V177 QA pilot bytes: ' + row.path);
    assert.ok(row.reason.length >= 60 && row.verifiers.length > 0);
    for (const verifier of row.verifiers)
      assert.equal(sha(readSource(verifier)), reviewedCurrentDigestV180(verifier, followup.verifierHashes[verifier]), 'Unreviewed V177 QA behavioral verifier: ' + verifier);
  }
  const toolPredecessors = {
    'scripts/install-costume-art-v175.mjs': '9b6ef01e417485277aa83a6db17a37bb9a34609c1a97c27aa38d0338aaac4705',
    'scripts/verify-costume-art-installer-v175.mjs': '3dd3614861943c8cc02b5fcd7e39afe6b5bfe80caae5376964bf6706f5cb0435'
  };
  assert.deepEqual(Object.keys(V177_TOOL_SUCCESSORS).sort(), Object.keys(toolPredecessors).sort());
  assert.deepEqual(followup.developmentToolChanges?.map(row => row.path), Object.keys(toolPredecessors).sort());
  for (const row of followup.developmentToolChanges) {
    const receipt = V177_TOOL_SUCCESSORS[row.path];
    assert.equal(receipt.previousSha256, toolPredecessors[row.path], 'Unreviewed V177 tool predecessor: ' + row.path);
    assert.deepEqual([row.previousSha256, row.currentSha256], [receipt.previousSha256, receipt.currentSha256]);
    assert.notEqual(receipt.previousSha256, receipt.currentSha256);
    assert.equal(sha(readSource(row.path)), receipt.currentSha256, 'Unreviewed V177 tool bytes: ' + row.path);
    assert.ok(row.reason.length >= 60 && row.verifiers.length > 0);
    for (const verifier of row.verifiers)
      assert.equal(sha(readSource(verifier)), reviewedCurrentDigestV180(verifier, followup.verifierHashes[verifier]), 'Unreviewed V177 tool verifier: ' + verifier);
  }
  const arsenal = followup.arsenalTracking;
  assert.equal(arsenal?.jsonPath, 'docs/arsenal/progress-v177.json');
  assert.equal(arsenal?.workbookPath, 'docs/arsenal/ARSENAL_SUIVI_V177.xlsx');
  assert.equal(sha(readSource(arsenal.jsonPath)), arsenal.jsonSha256, 'V177 arsenal JSON changed');
  assert.equal(sha(readSource(arsenal.workbookPath)), arsenal.workbookSha256, 'V177 arsenal workbook changed');
  assert.deepEqual([arsenal.tables, arsenal.sheets, arsenal.cachedFormulas], [4, 5, 5]);
  assert.deepEqual(arsenal.sourceInputs, V177_ARSENAL_SOURCE_INPUTS);
  for (const [path, digest] of Object.entries(arsenal.sourceInputs))
    assert.equal(sha(readSource(path)), digest, 'Original arsenal specification changed: ' + path);
  const ship = followup.shipTracking;
  assert.deepEqual(ship, {
    ledgerPath: 'docs/forge/xeno-trials/batch100-v177.json',
    ledgerSha256: '2fc2c3229920b3d425f50313270bc88afe1338213253451f6de544b0d3576d3a',
    batchId: 'T177-BATCH-002', installations: 100, rooms: 35, kinds: 16,
    newPngAssets: 0, geometryChanged: false, artistic1to1Approved: false,
    humanParticipants: 0, state: 'IMPLEMENTED_PENDING_NATIVE_QA'
  });
  assert.equal(sha(readSource(ship.ledgerPath)), reviewedIntegrationDigestV182(ship.ledgerPath,reviewedMainNDigestV179(ship.ledgerPath,ship.ledgerSha256)), 'Unreviewed V177 ship ledger bytes');
  const shipRow = table.rows.find(row => row[0] === 'C177-SHIP');
  assert.ok(shipRow[4].includes(ship.ledgerPath) && shipRow[4].includes(ship.ledgerSha256));
  const delivery = current.historicalDeliveryV168;
  assert.equal(sha(Buffer.from(JSON.stringify(delivery))),
    '0a8957b3e9312606039ffa15a2fffd3c45e08554a44ffa694629431b7a869896',
    'Historical V168 recovered delivery differs from its verified durable archive and merge receipt');
  const historicalRow = table.rows.at(-1);
  assert.equal(historicalRow.length, 12);
  assert.equal(historicalRow[6], 'MERGED_WITH_SCOPED_LOCAL_VALIDATION_AND_OPEN_GLOBAL_CI');
  assert.equal(historicalRow[7], 'HISTORICAL_RESULTS_NOT_TRANSFERRED');
  assert.ok(historicalRow[4].includes(delivery.durableArchive.sha256));
  assert.ok(historicalRow[4].includes(delivery.mergeReceipt.sha256));
  assert.deepEqual(historicalRow.slice(-3), [0, 0, 0]);
  return Object.freeze({ streams: ids.length, sources: followup.sourceChanges.length, trialSheets: 28, arsenalSheets: 5 });
}

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
  verifyIntegrationV182(current, readSource);
  verifyFollowupV179(current, readSource);
  current = historicalProgressViewV179(current);
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
  const protectedSources = new Set([
    ...keys(ARSENAL_V167_SUCCESSORS), ...keys(ARSENAL_V167_NEW_SOURCES), ...keys(ARMORY_V169_NEW_SOURCES),
    ...keys(ARSENAL_V170_NEW_SOURCES), ...keys(ARSENAL_V171_NEW_SOURCES), ...keys(ARMORY_V174_ECONOMY_NEW_SOURCES),
    ...Object.values(ARMORY_V169_SUCCESSORS).map(receipt => receipt.verifier)
  ]);
  for (const path of keys(V177_SOURCE_SUCCESSORS))
    assert.ok(protectedSources.has(path), 'V177 source has no immutable predecessor: ' + path);
  for (const path of keys(V165_VERIFIER_SUCCESSORS_V177))
    assert.ok(Object.hasOwn(V165_VERIFIER_SUCCESSORS_V171, path), 'V177 verifier has no immutable predecessor: ' + path);
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
        sourceDigestV177(path, (economy || current || newest || armory || successor).currentSha256),
        V177_SOURCE_SUCCESSORS[path] ? 'Unreviewed V177 source successor: ' + path
          : economy ? 'Unreviewed V174 economy successor: ' + path
          : current ? 'Unreviewed V171 runtime successor: ' + path
            : newest ? 'Unreviewed V170 runtime successor: ' + path
              : armory ? 'Unreviewed V169 runtime successor: ' + path
                : 'Unreviewed V167 runtime successor: ' + path);
    } else {
      assert.equal(sha(readSource(path)), reviewedCurrentDigestV180(path,expected), 'Current V163 source changed: ' + path);
    }
  }
  // New V167 modules are not retroactively called historical V163 sources.
  for (const [path, expected] of Object.entries(ARSENAL_V167_NEW_SOURCES))
    assert.equal(sha(readSource(path)), sourceDigestV177(path, expected),
      V177_SOURCE_SUCCESSORS[path] ? 'Unreviewed V177 source successor: ' + path : 'Unreviewed V167 added source: ' + path);
  for (const [path, expected] of Object.entries(ARMORY_V169_NEW_SOURCES)) {
    const extra = path === ARMORY_V170_ASSET_SOURCE.path ? ARMORY_V170_ASSET_SOURCE : null;
    if (extra) assert.equal(extra.previousSha256, expected, 'Invalid V169 authored source history');
    const current = ARSENAL_V171_SUCCESSORS[path];
    if (current) assert.equal(current.previousSha256, extra?.currentSha256 || expected,
      'Broken V169/V170-to-V171 source chain: ' + path);
    const release = ARMORY_V172_RELEASE_SUCCESSORS[path];
    if (release) assert.equal(release.previousSha256, current?.currentSha256 || extra?.currentSha256 || expected,
      'Broken V171-to-V172 source chain: ' + path);
    assert.equal(sha(readSource(path)), sourceDigestV177(path, release?.currentSha256 || current?.currentSha256 || extra?.currentSha256 || expected),
      V177_SOURCE_SUCCESSORS[path] ? 'Unreviewed V177 source successor: ' + path
        : release ? 'Unreviewed V172 art source: ' + path
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
    assert.equal(sha(readSource(path)), sourceDigestV177(path, release?.currentSha256 || current?.currentSha256 || expected),
      V177_SOURCE_SUCCESSORS[path] ? 'Unreviewed V177 source successor: ' + path
        : release ? 'Unreviewed V172 art source: ' + path
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
    assert.equal(sha(readSource(path)), sourceDigestV177(path, revision?.currentSha256 || release?.currentSha256 || expected),
      V177_SOURCE_SUCCESSORS[path] ? 'Unreviewed V177 source successor: ' + path
        : revision ? 'Unreviewed V173 specialist source: ' + path
        : release ? 'Unreviewed V172 verifier: ' + path
          : 'Unreviewed V171 added source: ' + path);
  }
  for (const [path, expected] of Object.entries(ARMORY_V174_ECONOMY_NEW_SOURCES))
    assert.equal(sha(readSource(path)), sourceDigestV177(path, expected),
      V177_SOURCE_SUCCESSORS[path] ? 'Unreviewed V177 source successor: ' + path : 'Unreviewed V174 economy source: ' + path);
  for (const [path, receipt] of Object.entries(V165_VERIFIER_SUCCESSORS_V171))
    verifyReviewedVerifierV177(path, receipt.previousSha256, readSource);
  for (const [path, receipt] of Object.entries(ARMORY_V169_SUCCESSORS)) {
    assert.ok(Object.hasOwn(ARSENAL_V167_SUCCESSORS, path), 'Missing V167 predecessor: ' + path);
    assert.equal(receipt.previousSha256, ARSENAL_V167_SUCCESSORS[path].currentSha256,
      'Incorrect V169 predecessor: ' + path);
    assert.equal(sha(readSource(receipt.verifier)), sourceDigestV177(receipt.verifier, receipt.verifierSha256),
      V177_SOURCE_SUCCESSORS[receipt.verifier] ? 'Unreviewed V177 source successor: ' + receipt.verifier
        : 'Unreviewed V169 behavioral verifier: ' + receipt.verifier);
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
  verifyOpenWorkstreamsV177(current, readSource);
  verifyFollowupV178(current, readSource);
  verifyTrialsBatchV179(readSource);
  verifyFollowupV180(readSource);
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
  return effective ? integratedRuntimeSourcesV182({ ...current.runtimeSourceSha256,
    ...Object.fromEntries(Object.entries(ARSENAL_V167_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARMORY_V169_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARSENAL_V170_SUCCESSORS).map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARSENAL_V171_SUCCESSORS)
      .filter(([path]) => Object.hasOwn(current.runtimeSourceSha256, path))
      .map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(ARMORY_V174_ECONOMY_SUCCESSORS)
      .filter(([path]) => Object.hasOwn(current.runtimeSourceSha256, path))
      .map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(V177_SOURCE_SUCCESSORS)
      .filter(([path]) => Object.hasOwn(current.runtimeSourceSha256, path))
      .map(([path, receipt]) => [path, receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(V178_RUNTIME_SUCCESSORS).map(([path,receipt]) => [path,receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(V179_SOURCE_GROUPS.runtimeChanges).map(([path,receipt])=>[path,receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(V179_SOURCE_GROUPS.newRuntimeSources).map(([path,receipt])=>[path,receipt.currentSha256])),
    ...Object.fromEntries(Object.entries(V179_RUNTIME_SUCCESSORS).map(([path,receipt]) => [path,receipt.currentSha256])),
    ...V179_NEW_RUNTIME_SOURCES,
    ...Object.fromEntries(Object.entries(V180_RUNTIME_SUCCESSORS).map(([path,receipt]) => [path,receipt.currentSha256])),
    ...V180_NEW_RUNTIME_SOURCES })
    : current.runtimeSourceSha256;
}

export function loadAuditSuccessionV163(readSource = readRepository) {
  const previous = JSON.parse(readSource('docs/forge/xeno-trials/progress-v162.json'));
  const current = JSON.parse(readSource('docs/forge/xeno-trials/progress-v163.json'));
  return { previous, current, result: verifyAuditSuccessionV163(previous, current, readSource) };
}
