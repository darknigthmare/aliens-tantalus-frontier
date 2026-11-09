/** Exact joins for the independent catalogue, native-QA and developer-tooling
 * branches. A branch receipt remains evidence for its own bytes; the integrated
 * bytes receive a separate admission and never inherit an old pass or art claim. */
import assert from 'node:assert/strict';
import { reviewedOriginalNamesDigestV183 } from './audit-original-names-v183.mjs';
import { reviewedNativeQaDependencyGuardDigestV187 } from './audit-native-qa-resources-v187.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const keys = value => Object.keys(value).sort();
const canonical = value => Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']'
  : value && typeof value === 'object' ? '{' + keys(value).map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}'
    : JSON.stringify(value);
const canonicalHash = value => sha(Buffer.from(canonical(value)));
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

// BEGIN V182_BRANCH_WITNESSES
export const INTEGRATION_BASELINE_V182 = freeze({
  "catalogue": {
    "commit": "e4ea86d54602e9ea08b169d4053a86565548386f",
    "progressSha256": "34e0d3758326131cde22fc1b95ba79a740be9766ed562babb9f0258b3409f214",
    "documentCanonicalSha256": "3182c7d696941a144d7fd492ad1ce48e04a7812121041836be371a16975a151b"
  },
  "qa": {
    "commit": "01c764a61e6ce7481acc3910685756b35141ee14",
    "progressSha256": "2f2af182c139dd395a6d19d4b7cc08e31b31a91abb2e0b31b6fce3fa56f8f841",
    "documentCanonicalSha256": "8da70a654b4e6e7045a8ff7f5ec748efb59b42e37a9c23493d7938d6676bf3e7",
    "constantsCanonicalSha256": "0bae25a01eb942e1a44ca6b7c07ed596710d87e5974e328b1219711aab728210"
  },
  "main": {
    "commit": "fbaa8ec4b2f3248bd1fd0206cc709641657b66db",
    "progressSha256": "cc61060d14f3e7b5ecceccb7d36f897da8175965e7e15fb71a5de2be0676644a",
    "documentCanonicalSha256": "d361f5fd827297f8eac2bf924fb34c65440d7b93456a7e600208f9a259fc5200"
  }
});
export const QA_BRANCH_CONSTANTS_V181 = freeze({
  "V178_BASELINE_WITNESS": {
    "mainCommit": "5d9f28f05df732a71a17cec013aa39ebab6d4de1",
    "baselineProgressSha256": "e6a0feb4df2aa9595c3dca1319f496af69c66d424b19f9d3a5fe401ab2897b80",
    "documentCanonicalSha256": "1b66994e4606deeccef90d565cefbefd9a83ab51f3abcfc93727aeb852eb0338",
    "runtimeMapSha256": "c7d161fc46fbd88bc18d5dd66021aa9a18f8b45078da20a433cbe6daa1bbaa6f",
    "followupV177Sha256": "7257069cc76a3b674704190041495b0b56a4a448143019138f52311c96f5d57e",
    "table27Sha256": "ac8a9645ab4de1c773cb2315a54926a6bcf8c155fc4d8eeadd8e6fc397fdd250",
    "candidateLocalV177Sha256": "366958bc4e60f36fcf3848da3289f1f8e3905549bb589b7bfffee3e71fa25574",
    "v177ConstantsSha256": "cd7292ba61ffbbbed18f78aff8fa2a02810337bcdd7473780cce50f7683a0a42"
  },
  "V178_MAIN_PREDECESSORS": {
    "src/npc-interdeck-routes-v165.js": "5330095a1f6d277e71e473c6b741c671fe02c4d4fc44133b3f5a37ccfebb103a",
    "sw.js": "282448609033fdb663983352987cee04c545e4fd4c66d67a227a83df6ec90675",
    "scripts/verify-npc-interdeck-routes-v165.mjs": "c6046941f7d20be320dec7603ee89d0c6b7c80f8149b89a42efd1c3be7a2e64b",
    "scripts/verify-audit-continuation-v163.mjs": "8e64247b3186d36a62352245ea6aadb6c2f6c7d117a8ffc13d4962990ba08dfd",
    "scripts/verify-public-release-v86.mjs": "e56b5473e6e3d9e1f45b64cd10489544886229853be1cc75bdf8e1b1a099e705",
    "scripts/qa-npc-interdeck-native-v165.py": "94cf93ca6257d2a5232b6fc2a5be6c7b3ceb74b6bd72a98f612a36e3fca7e8b3"
  },
  "V178_NEW_DOCUMENTS": {
    "docs/development/CLOTURE_EXCEL_20261101.xlsx": "2a607d9fe749056cb2099cc6776a5ccb227068186eb422b7ab6253b05a6609bd",
    "docs/development/EXCEL_CLOSURE_20261101.json": "4f5aaf3a4b7e927d34fd75acc3e096314280323a27d72d368572cf63b9dca1c8",
    "docs/development/EXCEL_CLOSURE_20261101.md": "284fae29f99bbf3fb23633510bfd0fb68fdb9350335db144e89b3ac6830e9f47"
  },
  "V178_QA_SUCCESSORS": {
    "scripts/qa-npc-interdeck-native-v165.py": {
      "previousSha256": "94cf93ca6257d2a5232b6fc2a5be6c7b3ceb74b6bd72a98f612a36e3fca7e8b3",
      "currentSha256": "1822cd7fa39ecb1d9ad6f692d8c9dea37993a1a0cdbb446963a3a544ea0f206a"
    }
  },
  "V178_RUNTIME_SUCCESSORS": {
    "src/npc-interdeck-routes-v165.js": {
      "previousSha256": "5330095a1f6d277e71e473c6b741c671fe02c4d4fc44133b3f5a37ccfebb103a",
      "currentSha256": "7fc995925c98d1a65fc75538d026320139b9f697f53e7b68d7701bde29bb01a4"
    },
    "sw.js": {
      "previousSha256": "282448609033fdb663983352987cee04c545e4fd4c66d67a227a83df6ec90675",
      "currentSha256": "cca2f58e7c34952e15d0238edeb9d5606d8766b4bea15da955b61aa3a718bfaf"
    }
  },
  "V178_VERIFIER_SUCCESSORS": {
    "scripts/verify-npc-interdeck-routes-v165.mjs": {
      "previousSha256": "c6046941f7d20be320dec7603ee89d0c6b7c80f8149b89a42efd1c3be7a2e64b",
      "currentSha256": "331b36f0b73a7c8bc8bc2792400216c832cd7a9355c16b211ec7619d051f2080"
    },
    "scripts/verify-audit-continuation-v163.mjs": {
      "previousSha256": "8e64247b3186d36a62352245ea6aadb6c2f6c7d117a8ffc13d4962990ba08dfd",
      "currentSha256": "da597b00722760cf102956851cbd14423a66d77a4fc04ff0a1f6bb000a441291"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "e56b5473e6e3d9e1f45b64cd10489544886229853be1cc75bdf8e1b1a099e705",
      "currentSha256": "bc913fdd26cd4af6eb67889002559e88e6e98f4952b2712c9186f006376222ab"
    }
  },
  "V179_BASELINE_WITNESS": {
    "mainCommit": "d41b5fc120da2e7a5938308f9d3c852d20e53cc5",
    "baselineProgressSha256": "cc61060d14f3e7b5ecceccb7d36f897da8175965e7e15fb71a5de2be0676644a",
    "documentCanonicalSha256": "d361f5fd827297f8eac2bf924fb34c65440d7b93456a7e600208f9a259fc5200",
    "workbookSha256": "55fac512962c1b1da719fdaf871e3a6b7cedd52ec1a3601a1709453d20c49f22",
    "historicalConstantsSha256": "9257e54ec41400fdcfad687efdb69f910a2028854b971f4c209f6b0fa0e26bc4"
  },
  "V179_MAIN_PREDECESSORS": {
    "scripts/qa-npc-interdeck-native-v165.py": "1822cd7fa39ecb1d9ad6f692d8c9dea37993a1a0cdbb446963a3a544ea0f206a",
    "scripts/qa-xeno-trials-capture-v163.py": "3681d567ee38d7acc00a5df59340ef3ee3c0423acd226694d041bca86881855d",
    "scripts/verify-npc-interdeck-routes-v165.mjs": "331b36f0b73a7c8bc8bc2792400216c832cd7a9355c16b211ec7619d051f2080",
    "scripts/verify-capture-observation-v177.mjs": "e07b131c2f0189592a87672d02d35a98308dc8034787bee55b64907b3dd26f4f",
    "scripts/verify-xeno-trials-capture-v163.mjs": "cd7674a94db3f8ce0c8166f5f1e38848d43b587a0be3c36323452c80e7ef4b28",
    "scripts/verify-audit-continuation-v163.mjs": "da597b00722760cf102956851cbd14423a66d77a4fc04ff0a1f6bb000a441291"
  },
  "V179_QA_SUCCESSORS": {
    "scripts/qa-npc-interdeck-native-v165.py": {
      "previousSha256": "1822cd7fa39ecb1d9ad6f692d8c9dea37993a1a0cdbb446963a3a544ea0f206a",
      "currentSha256": "a614f03fe889c62ca5b481a1079df000a598d34a1c5be65e420ee4d9475d51ec"
    },
    "scripts/qa-xeno-trials-capture-v163.py": {
      "previousSha256": "3681d567ee38d7acc00a5df59340ef3ee3c0423acd226694d041bca86881855d",
      "currentSha256": "f7108b5d1da2f06b9abe3dffdb5b8f93d2ebb534e11699e50aff25690498e09d"
    }
  },
  "V179_VERIFIER_SUCCESSORS": {
    "scripts/verify-npc-interdeck-routes-v165.mjs": {
      "previousSha256": "331b36f0b73a7c8bc8bc2792400216c832cd7a9355c16b211ec7619d051f2080",
      "currentSha256": "66b1f6cc8a2a018b2ddacecfb73c77eb52bb7784a51bc7addb43c8ec46832f8a"
    },
    "scripts/verify-capture-observation-v177.mjs": {
      "previousSha256": "e07b131c2f0189592a87672d02d35a98308dc8034787bee55b64907b3dd26f4f",
      "currentSha256": "ca0a7011de8a2f5a2f785263bb5fe3a0e173b20ac842e64e97eb82c2aa76ce6c"
    },
    "scripts/verify-xeno-trials-capture-v163.mjs": {
      "previousSha256": "cd7674a94db3f8ce0c8166f5f1e38848d43b587a0be3c36323452c80e7ef4b28",
      "currentSha256": "ab217ec8de87d3f6dbf497805bf3ab449b831f8b7c8e891bbf080b4e41b85d53"
    },
    "scripts/verify-audit-continuation-v163.mjs": {
      "previousSha256": "da597b00722760cf102956851cbd14423a66d77a4fc04ff0a1f6bb000a441291",
      "currentSha256": "cca73143317423dac2a2e0c9e97408ce093860a66b3722748b066d2f08e59fda"
    }
  },
  "V180_BASELINE_WITNESS": {
    "mainCommit": "86f202143ef3163ede025d668012d83aa0b62830",
    "baselineProgressSha256": "0b9e02917c3b1f1fa95853ab361d139cfaf8186b6dc0d1e4e5f9ca96a63396c9",
    "documentCanonicalSha256": "344e3328f5f615a05d9b8c24364f70940033e4594a8ade79e087585441379515",
    "workbookSha256": "55fac512962c1b1da719fdaf871e3a6b7cedd52ec1a3601a1709453d20c49f22",
    "historicalConstantsSha256": "e60f7b4ed1dce8d8d2ad3c6c86378ff9f450fef8bd3cef1118cef5f9ca3c662e",
    "dependencyGuardSha256": "9af73552e83c35e292762e1d3ad2c00f491290d76c8669856b5937d903ce470a"
  },
  "V180_MAIN_PREDECESSORS": {
    "scripts/qa-npc-annex-service-routes-v163.py": "01c60a654a5ed9126e1e62d17d2ddb352bff6ef437acbdec63f0b5ec879cd8e4",
    "scripts/verify-npc-annex-service-routes-v163.mjs": "24941d5d4f417864cdbfc4b7d13ec822b03f79207283fde56e3d507a8bf065a6",
    "scripts/verify-audit-continuation-v163.mjs": "cca73143317423dac2a2e0c9e97408ce093860a66b3722748b066d2f08e59fda"
  },
  "V180_QA_SUCCESSORS": {
    "scripts/qa-npc-annex-service-routes-v163.py": {
      "previousSha256": "01c60a654a5ed9126e1e62d17d2ddb352bff6ef437acbdec63f0b5ec879cd8e4",
      "currentSha256": "3a57f6bd0760a8930848badea22b66206779a2b89d4feae5e2659b4fde53cc22"
    }
  },
  "V180_VERIFIER_SUCCESSORS": {
    "scripts/verify-npc-annex-service-routes-v163.mjs": {
      "previousSha256": "24941d5d4f417864cdbfc4b7d13ec822b03f79207283fde56e3d507a8bf065a6",
      "currentSha256": "ae6cc98ad92ec740b05894f3ca7cad676b627d0c66f454cfb15efd8d0940fa30"
    },
    "scripts/verify-audit-continuation-v163.mjs": {
      "previousSha256": "cca73143317423dac2a2e0c9e97408ce093860a66b3722748b066d2f08e59fda",
      "currentSha256": "9c6b7b970f18c821d42b28d688c3928c477cffd12d2c9f42b37db18990047e3d"
    }
  },
  "V181_BASELINE_WITNESS": {
    "baseCommit": "b9886eccb7ea7fa9ea3c29230240965f54eea015",
    "baselineProgressSha256": "84ae4e27dc77a35d4a8b44a01ed18617f29228bdeece64b049b1f3119908e629",
    "documentCanonicalSha256": "44ef8b4cc1abeafbea5acd2c8727bc2584742323644760e5eafcbeb46034dcc0",
    "workbookSha256": "55fac512962c1b1da719fdaf871e3a6b7cedd52ec1a3601a1709453d20c49f22",
    "historicalConstantsSha256": "ed3ca16dd61509fc84aae85d2dec843f14ffc9d55d7c9bd8c766f01209192d13"
  },
  "V181_MAIN_PREDECESSORS": {
    "scripts/qa-xeno-trials-capture-v163.py": "f7108b5d1da2f06b9abe3dffdb5b8f93d2ebb534e11699e50aff25690498e09d",
    "scripts/qa-npc-cal-logistics-route-v165.py": "88e74456f97f7c171cfb4363660324a114b9093d3fbe03f6cc43b7e953f3af6a",
    "scripts/verify-capture-observation-v177.mjs": "ca0a7011de8a2f5a2f785263bb5fe3a0e173b20ac842e64e97eb82c2aa76ce6c",
    "scripts/verify-npc-cal-logistics-route-v165.mjs": "603cfed41ba98b20900eb70fda0f15428cc8a3dafc8284c1a979d67fcad54744",
    "scripts/verify-parallel-completion-v165.mjs": "7101cd9415b2455ce935beba92f062c4f86d08874d2ff19852cc162d093da0aa",
    "scripts/verify-audit-continuation-v163.mjs": "9c6b7b970f18c821d42b28d688c3928c477cffd12d2c9f42b37db18990047e3d",
    ".github/workflows/non-forge-regression-v163.yml": "2981bea5a655a3f9dc7b215bc8be55fd03711d7761297376b533b8d2e4df699f"
  },
  "V181_QA_SUCCESSORS": {
    "scripts/qa-xeno-trials-capture-v163.py": {
      "previousSha256": "f7108b5d1da2f06b9abe3dffdb5b8f93d2ebb534e11699e50aff25690498e09d",
      "currentSha256": "351aafba32f5aedc9f20bd9171da5f8f25ee5421a8b246afe8d1079c3cb8e64e"
    },
    "scripts/qa-npc-cal-logistics-route-v165.py": {
      "previousSha256": "88e74456f97f7c171cfb4363660324a114b9093d3fbe03f6cc43b7e953f3af6a",
      "currentSha256": "4a7e96f5e76e8221afd26c5fbc6a67b791d724215d0dd6685599ee34089649aa"
    }
  },
  "V181_VERIFIER_SUCCESSORS": {
    "scripts/verify-capture-observation-v177.mjs": {
      "previousSha256": "ca0a7011de8a2f5a2f785263bb5fe3a0e173b20ac842e64e97eb82c2aa76ce6c",
      "currentSha256": "b68c2c76ed78bdf63247ba3087a2f8b42ba9fc3a42d8b098ef6c5f984c73ef77"
    },
    "scripts/verify-npc-cal-logistics-route-v165.mjs": {
      "previousSha256": "603cfed41ba98b20900eb70fda0f15428cc8a3dafc8284c1a979d67fcad54744",
      "currentSha256": "8303fb51cf82f200432da621d21f8e80cbcefdc58e03623419a1acb362ed4775"
    },
    "scripts/verify-parallel-completion-v165.mjs": {
      "previousSha256": "7101cd9415b2455ce935beba92f062c4f86d08874d2ff19852cc162d093da0aa",
      "currentSha256": "92d1ce93e1b8b2e79ee53b3ecb9471c27386846ac13608adc5b07c5bcc7f391f"
    },
    "scripts/verify-audit-continuation-v163.mjs": {
      "previousSha256": "9c6b7b970f18c821d42b28d688c3928c477cffd12d2c9f42b37db18990047e3d",
      "currentSha256": "a5aaa5f2e96589954e7d7f3171715eace937a7d0a92fc7f0a55c874aa6054012"
    }
  },
  "V181_WORKFLOW_SUCCESSORS": {
    ".github/workflows/non-forge-regression-v163.yml": {
      "previousSha256": "2981bea5a655a3f9dc7b215bc8be55fd03711d7761297376b533b8d2e4df699f",
      "currentSha256": "f3b2c2665de69d67cbada9be935e8e34f89a9f9ebf32e48523947b3946a9439e"
    }
  }
});
export const AI_TOOLING_FOLLOWUP_20261104 = freeze({
  "baselineCommit": "d41b5fc120da2e7a5938308f9d3c852d20e53cc5",
  "scope": "Optional Spec Kit, Superpowers and Claude Game Studios tooling; source-only admission.",
  "runtimeChanged": false,
  "historicalEvidenceTransferred": false,
  "verifierChanges": {
    "scripts/verify-audit-continuation-v163.mjs": {
      "previousSha256": "da597b00722760cf102956851cbd14423a66d77a4fc04ff0a1f6bb000a441291",
      "currentSha256": "47317f937706b8b34fcd8862cb0e942dc365fc87c82747f5072c632f1b66480e"
    },
    "scripts/verify-public-release-v86.mjs": {
      "previousSha256": "bc913fdd26cd4af6eb67889002559e88e6e98f4952b2712c9186f006376222ab",
      "currentSha256": "4c3010a97ee506088a198c9693f8196c96f22a701a2723a40b367d43a9b7e122"
    }
  }
});
// END V182_BRANCH_WITNESSES

// BEGIN V182_REVIEWED_SOURCES
export const INTEGRATION_SOURCES_V182 = freeze({
  ".ai-tools/.gitignore": {
    "predecessors": {
      "catalogue": null,
      "main": "6feaded4e28ea86e001a6751b4e3d960e8b7c31b9616ff9936b79297086e809b",
      "qa": null
    },
    "currentSha256": "6feaded4e28ea86e001a6751b4e3d960e8b7c31b9616ff9936b79297086e809b",
    "kind": "tooling"
  },
  ".ai-tools/README.md": {
    "predecessors": {
      "catalogue": null,
      "main": "518ee93aab27bb8c9ad58478a14ff5db6b24bfbcf0c1346dbd7e5b4fefd0176e",
      "qa": null
    },
    "currentSha256": "518ee93aab27bb8c9ad58478a14ff5db6b24bfbcf0c1346dbd7e5b4fefd0176e",
    "kind": "tooling"
  },
  ".ai-tools/setup.py": {
    "predecessors": {
      "catalogue": null,
      "main": "968ba2b95144071ec237eb1cf1253ea14292bf47255f506ef28083cd737eb2ca",
      "qa": null
    },
    "currentSha256": "968ba2b95144071ec237eb1cf1253ea14292bf47255f506ef28083cd737eb2ca",
    "kind": "tooling"
  },
  ".ai-tools/sources.json": {
    "predecessors": {
      "catalogue": null,
      "main": "1ec97f618019ad4d9fdc655ae647817d22466c35ade391ff3f5681331f86ccb5",
      "qa": null
    },
    "currentSha256": "1ec97f618019ad4d9fdc655ae647817d22466c35ade391ff3f5681331f86ccb5",
    "kind": "tooling"
  },
  ".ai-tools/tests/test_setup.py": {
    "predecessors": {
      "catalogue": null,
      "main": "fae354f034e04c63747eff525376fdd6e174e87851e73f6ad2101367c7037b75",
      "qa": null
    },
    "currentSha256": "fae354f034e04c63747eff525376fdd6e174e87851e73f6ad2101367c7037b75",
    "kind": "tooling"
  },
  ".github/workflows/non-forge-regression-v163.yml": {
    "predecessors": {
      "catalogue": "2981bea5a655a3f9dc7b215bc8be55fd03711d7761297376b533b8d2e4df699f",
      "main": "2981bea5a655a3f9dc7b215bc8be55fd03711d7761297376b533b8d2e4df699f",
      "qa": "f3b2c2665de69d67cbada9be935e8e34f89a9f9ebf32e48523947b3946a9439e"
    },
    "currentSha256": "dc4f45648f7850d58c52d8b89b28d5c87a53ac0d70e599d89c1c262a7a0d63f3",
    "kind": "workflow"
  },
  "AGENTS.md": {
    "predecessors": {
      "catalogue": "ae56da6de251f2af7d4c8d1626fad4259a020f7888f1b57bdde03c9e09124830",
      "main": "d8d93d1031a497ab88c3c17cff4828572d0a3f9029f5e62b983f295c769ca583",
      "qa": "ae56da6de251f2af7d4c8d1626fad4259a020f7888f1b57bdde03c9e09124830"
    },
    "currentSha256": "d8d93d1031a497ab88c3c17cff4828572d0a3f9029f5e62b983f295c769ca583",
    "kind": "tooling"
  },
  "CLAUDE.md": {
    "predecessors": {
      "catalogue": null,
      "main": "7b05a38d786af6850a14a1c768a2b2665726f0ab7503a40830e6c5c792202987",
      "qa": null
    },
    "currentSha256": "7b05a38d786af6850a14a1c768a2b2665726f0ab7503a40830e6c5c792202987",
    "kind": "tooling"
  },
  "docs/forge/xeno-trials/door-bay-continuation-v182.json": {
    "predecessors": {
      "catalogue": null,
      "main": null,
      "qa": null
    },
    "currentSha256": "b247fd91508111b8c3ba586e44022abd9a32aa1dd1d3b2c7b737c12591ece205",
    "kind": "document"
  },
  "scripts/audit-succession-v163.mjs": {
    "predecessors": {
      "catalogue": "48d70464bcc15b0e3827cb792fffd2f1d048ddfcab701901212d53d3411693b9",
      "main": "d337d609c748c83f20870d0091a2c27417cd591171e7a465b4ee31a2ea3fc675",
      "qa": "21108d8af17ea9fff5fe1263244d17050d563f58ccf8ec9eb6eaf935a1a977e0"
    },
    "currentSha256": "467983aef6f72cfd208130b7671a36f6f06067d0d91b7baac85c64ff5cc6644f",
    "kind": "tooling"
  },
  "scripts/export-alien-base-tantalus-v1.mjs": {
    "predecessors": {
      "catalogue": "5cf9d96709d96c53357f11bd59d24da53e58a25c11b5f7bb3ba09507d7869779",
      "main": null,
      "qa": null
    },
    "currentSha256": "1192580800ae6d790afaa42a7094089ae3067bcc698a744d381528c2b317950f",
    "kind": "tooling"
  },
  "scripts/qa-hub-door-bays-v182.py": {
    "predecessors": {
      "catalogue": null,
      "main": null,
      "qa": null
    },
    "currentSha256": "14992f627a83249d5e7e496326ff0e5e98f946123c086c09048502195bb8f84c",
    "kind": "qa"
  },
  "scripts/qa-npc-annex-service-routes-v163.py": {
    "predecessors": {
      "catalogue": "01c60a654a5ed9126e1e62d17d2ddb352bff6ef437acbdec63f0b5ec879cd8e4",
      "main": "01c60a654a5ed9126e1e62d17d2ddb352bff6ef437acbdec63f0b5ec879cd8e4",
      "qa": "3a57f6bd0760a8930848badea22b66206779a2b89d4feae5e2659b4fde53cc22"
    },
    "currentSha256": "3a57f6bd0760a8930848badea22b66206779a2b89d4feae5e2659b4fde53cc22",
    "kind": "qa"
  },
  "scripts/qa-npc-cal-logistics-route-v165.py": {
    "predecessors": {
      "catalogue": "88e74456f97f7c171cfb4363660324a114b9093d3fbe03f6cc43b7e953f3af6a",
      "main": "88e74456f97f7c171cfb4363660324a114b9093d3fbe03f6cc43b7e953f3af6a",
      "qa": "4a7e96f5e76e8221afd26c5fbc6a67b791d724215d0dd6685599ee34089649aa"
    },
    "currentSha256": "4a7e96f5e76e8221afd26c5fbc6a67b791d724215d0dd6685599ee34089649aa",
    "kind": "qa"
  },
  "scripts/qa-npc-interdeck-native-v165.py": {
    "predecessors": {
      "catalogue": "1822cd7fa39ecb1d9ad6f692d8c9dea37993a1a0cdbb446963a3a544ea0f206a",
      "main": "1822cd7fa39ecb1d9ad6f692d8c9dea37993a1a0cdbb446963a3a544ea0f206a",
      "qa": "a614f03fe889c62ca5b481a1079df000a598d34a1c5be65e420ee4d9475d51ec"
    },
    "currentSha256": "a614f03fe889c62ca5b481a1079df000a598d34a1c5be65e420ee4d9475d51ec",
    "kind": "qa"
  },
  "scripts/qa-npc-service-routes-v161.py": {
    "predecessors": {
      "catalogue": "5ee9795a6132ac6fad3724f7dfa7a9c5edcd75103390746f0708e30dd6a97e06",
      "main": "5ee9795a6132ac6fad3724f7dfa7a9c5edcd75103390746f0708e30dd6a97e06",
      "qa": "5ee9795a6132ac6fad3724f7dfa7a9c5edcd75103390746f0708e30dd6a97e06"
    },
    "currentSha256": "684fbe2af2c766747ab9423ca5bc9cc1fabdfa6132b7331c10b39fd2cdc38f32",
    "kind": "qa"
  },
  "scripts/qa-xeno-trials-capture-v163.py": {
    "predecessors": {
      "catalogue": "75fc1ea09b69ef14644769495439288cb247bd5452f9d6bbc080d05573e51fdc",
      "main": "3681d567ee38d7acc00a5df59340ef3ee3c0423acd226694d041bca86881855d",
      "qa": "351aafba32f5aedc9f20bd9171da5f8f25ee5421a8b246afe8d1079c3cb8e64e"
    },
    "currentSha256": "a6b4653534000439a743fd24455c01cfc73c4926b8ea8e28c77e770d675f8146",
    "kind": "qa"
  },
  "scripts/verify-alien-base-bridge-v1.mjs": {
    "predecessors": {
      "catalogue": "946f0cb8d36047483eb8056e19a51d62d74d839548d139eef71adaf1ae6a20ab",
      "main": null,
      "qa": null
    },
    "currentSha256": "b23993cf0521c5db063ba09217b0c229e57bac71f8b472fa415837c4927c0a53",
    "kind": "verifier"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "predecessors": {
      "catalogue": "3becc5518175893544c1c7aee7b8fc6cd521d4e3584b6b149a6b1691d4450e8c",
      "main": "47317f937706b8b34fcd8862cb0e942dc365fc87c82747f5072c632f1b66480e",
      "qa": "a5aaa5f2e96589954e7d7f3171715eace937a7d0a92fc7f0a55c874aa6054012"
    },
    "currentSha256": "a2e5a4036d4adcb7d66798652b7944b4898a6c55331b617ab98c993a8c383aa5",
    "kind": "verifier"
  },
  "scripts/verify-capture-observation-v177.mjs": {
    "predecessors": {
      "catalogue": "881f67af9a26ef83b223bea4aa7c185af9e9a2b5c757ae9549d67e3d6f3a4119",
      "main": "e07b131c2f0189592a87672d02d35a98308dc8034787bee55b64907b3dd26f4f",
      "qa": "b68c2c76ed78bdf63247ba3087a2f8b42ba9fc3a42d8b098ef6c5f984c73ef77"
    },
    "currentSha256": "e44f384d7d3a27f4dc17a9ef67ee9b84e076976c5bda46d2a265ac06a1944742",
    "kind": "verifier"
  },
  "scripts/verify-hub-circulation-v137.mjs": {
    "predecessors": {
      "catalogue": "12b3e7df85da93c8d103b7edf466d552842a9a909d647d0c537b4c8d593742ef",
      "main": "e7e91327b7ecdf99e93a8ebb95f543b9f1e1b1a7efdef0429c5cfef192e66d24",
      "qa": "e7e91327b7ecdf99e93a8ebb95f543b9f1e1b1a7efdef0429c5cfef192e66d24"
    },
    "currentSha256": "55bee56949dee8bd7cea297f7da23d163b9b08833ff76442e8af01e37e5b9386",
    "kind": "verifier"
  },
  "scripts/verify-hub-door-bay-v178.mjs": {
    "predecessors": {
      "catalogue": "775df80d68e5ddd8697e44bed32b82881b6ca288d35fd884efc035a06ba6bb65",
      "main": null,
      "qa": null
    },
    "currentSha256": "911a2b2cc34d5d085e1e3c530614b331dc332a41bbb536913f73fa8ef73c60bd",
    "kind": "verifier"
  },
  "scripts/verify-hub-room-furnishing-v137.mjs": {
    "predecessors": {
      "catalogue": "7122d778c80fb8874cf8116168ebc57f39dadc5883f8a88df9f4e4f291b3bde9",
      "main": "f4bf5aacfa26279abab6fe089f5d6860d449a8ff48ef0fee602684a3a3e9be1f",
      "qa": "f4bf5aacfa26279abab6fe089f5d6860d449a8ff48ef0fee602684a3a3e9be1f"
    },
    "currentSha256": "7a86388e5663923bd89912916812e04539396d658ab2a7b9ebb508c1c9880306",
    "kind": "verifier"
  },
  "scripts/verify-hub-room-life-v136.mjs": {
    "predecessors": {
      "catalogue": "b76f0fe9008656bb8b2b6dc4b24b40c0ef061a28c5da234f3b6cf36bbb35eec0",
      "main": "3a4bc2fdb88a38f712b7377c7a054195b0218965bf1c7bcaa6ab0bfbf8fe4d23",
      "qa": "3a4bc2fdb88a38f712b7377c7a054195b0218965bf1c7bcaa6ab0bfbf8fe4d23"
    },
    "currentSha256": "2937cc012873635317745972285e7ac369b25861cb32ab910f6a7f6861be7b34",
    "kind": "verifier"
  },
  "scripts/verify-hub-service-routes-v138.mjs": {
    "predecessors": {
      "catalogue": "b4929721d0aed65ee7f1cc882ebd43bc7a7a1f825a0ecc9cc9df49780d3035a6",
      "main": "6fa381291a721a891f964f86a4e95861bb267eaff5130416a3f1ecd451ed5173",
      "qa": "6fa381291a721a891f964f86a4e95861bb267eaff5130416a3f1ecd451ed5173"
    },
    "currentSha256": "671a520355b26e6098c386db451a2bd6a6706883d43b3b7291017bd2d5978d2e",
    "kind": "verifier"
  },
  "scripts/verify-npc-annex-service-routes-v163.mjs": {
    "predecessors": {
      "catalogue": "24941d5d4f417864cdbfc4b7d13ec822b03f79207283fde56e3d507a8bf065a6",
      "main": "24941d5d4f417864cdbfc4b7d13ec822b03f79207283fde56e3d507a8bf065a6",
      "qa": "ae6cc98ad92ec740b05894f3ca7cad676b627d0c66f454cfb15efd8d0940fa30"
    },
    "currentSha256": "ae6cc98ad92ec740b05894f3ca7cad676b627d0c66f454cfb15efd8d0940fa30",
    "kind": "verifier"
  },
  "scripts/verify-npc-cal-logistics-route-v165.mjs": {
    "predecessors": {
      "catalogue": "603cfed41ba98b20900eb70fda0f15428cc8a3dafc8284c1a979d67fcad54744",
      "main": "603cfed41ba98b20900eb70fda0f15428cc8a3dafc8284c1a979d67fcad54744",
      "qa": "8303fb51cf82f200432da621d21f8e80cbcefdc58e03623419a1acb362ed4775"
    },
    "currentSha256": "8303fb51cf82f200432da621d21f8e80cbcefdc58e03623419a1acb362ed4775",
    "kind": "verifier"
  },
  "scripts/verify-npc-interdeck-routes-v165.mjs": {
    "predecessors": {
      "catalogue": "331b36f0b73a7c8bc8bc2792400216c832cd7a9355c16b211ec7619d051f2080",
      "main": "331b36f0b73a7c8bc8bc2792400216c832cd7a9355c16b211ec7619d051f2080",
      "qa": "66b1f6cc8a2a018b2ddacecfb73c77eb52bb7784a51bc7addb43c8ec46832f8a"
    },
    "currentSha256": "66b1f6cc8a2a018b2ddacecfb73c77eb52bb7784a51bc7addb43c8ec46832f8a",
    "kind": "verifier"
  },
  "scripts/verify-npc-service-routes-v161.mjs": {
    "predecessors": {
      "catalogue": "f7f37ecd2a87fb2b2363260a2884b0a4394f8355260559483920e99a7193f4bb",
      "main": "f7f37ecd2a87fb2b2363260a2884b0a4394f8355260559483920e99a7193f4bb",
      "qa": "f7f37ecd2a87fb2b2363260a2884b0a4394f8355260559483920e99a7193f4bb"
    },
    "currentSha256": "fe7f0ed6faa0e3427678b39b38b3e5e109be86a9693e48101b9fd1cc18c808c9",
    "kind": "verifier"
  },
  "scripts/verify-parallel-completion-v165.mjs": {
    "predecessors": {
      "catalogue": "7101cd9415b2455ce935beba92f062c4f86d08874d2ff19852cc162d093da0aa",
      "main": "7101cd9415b2455ce935beba92f062c4f86d08874d2ff19852cc162d093da0aa",
      "qa": "92d1ce93e1b8b2e79ee53b3ecb9471c27386846ac13608adc5b07c5bcc7f391f"
    },
    "currentSha256": "af8b37199a2ba3d8557b78df3cb2db1062992d6c84b6de610249fb8e10fa3355",
    "kind": "verifier"
  },
  "scripts/verify-public-release-v86.mjs": {
    "predecessors": {
      "catalogue": "0c2be84858f46b7464b643bec5a05f49cef44b833d8139492b09f90b967a1d80",
      "main": "4c3010a97ee506088a198c9693f8196c96f22a701a2723a40b367d43a9b7e122",
      "qa": "bc913fdd26cd4af6eb67889002559e88e6e98f4952b2712c9186f006376222ab"
    },
    "currentSha256": "9204eed81123bc26eed9a517f1727733a36879e9963ca0202b8b8ceda2a1404a",
    "kind": "verifier"
  },
  "scripts/verify-tantalus-enrichment-v177.mjs": {
    "predecessors": {
      "catalogue": "7c7b6c66ef1baa7916f9d7000683a8857c80940d84d8d7c3b4c1fed240f18d5c",
      "main": "7c7b6c66ef1baa7916f9d7000683a8857c80940d84d8d7c3b4c1fed240f18d5c",
      "qa": "7c7b6c66ef1baa7916f9d7000683a8857c80940d84d8d7c3b4c1fed240f18d5c"
    },
    "currentSha256": "d8bdfd85b801213a0b4fe7d66efeb8a0eda96c685d2dfa50377feb382932519a",
    "kind": "verifier"
  },
  "scripts/verify-trials-navigation-v163.mjs": {
    "predecessors": {
      "catalogue": "80929bd7a61393ee456a1623ccdb84c26e2b00dc83c7f733e2d0bad725e64d78",
      "main": "80929bd7a61393ee456a1623ccdb84c26e2b00dc83c7f733e2d0bad725e64d78",
      "qa": "80929bd7a61393ee456a1623ccdb84c26e2b00dc83c7f733e2d0bad725e64d78"
    },
    "currentSha256": "2f87256ada6f134c20c83af4cac5bb432e1a6a3baf6e66fa4f6027985fa21c6a",
    "kind": "verifier"
  },
  "scripts/verify-xeno-trials-capture-v163.mjs": {
    "predecessors": {
      "catalogue": "9c544d59ef95c88c15c7f4291ddb2ac2ea2e0dbfb1aed5d3a39b1e23f04a66bd",
      "main": "cd7674a94db3f8ce0c8166f5f1e38848d43b587a0be3c36323452c80e7ef4b28",
      "qa": "ab217ec8de87d3f6dbf497805bf3ab449b831f8b7c8e891bbf080b4e41b85d53"
    },
    "currentSha256": "728bd4c20a529ff4253dff432523368d6d301bf082377e4cfe5c6c303ca4cb0a",
    "kind": "verifier"
  },
  "scripts/verify-xeno-trials-supers-v148.mjs": {
    "predecessors": {
      "catalogue": "1bf875531201c3669f90722e9a890cb86c92dbff7b68bab07a5c5e127915335b",
      "main": "1bf875531201c3669f90722e9a890cb86c92dbff7b68bab07a5c5e127915335b",
      "qa": "1bf875531201c3669f90722e9a890cb86c92dbff7b68bab07a5c5e127915335b"
    },
    "currentSha256": "f9391f04e54787882823afb4201d5611c48ddad1ab72678a5926ae283a93e4b3",
    "kind": "verifier"
  },
  "src/hub-batch-industrial-v177.js": {
    "predecessors": {
      "catalogue": "27cfc9084399b77193b0361904d8fc89151dc56bd010e4fe34ec7bc02ba1e0bc",
      "main": "9355e187a6c83ba6457e983871945101f3654ab17a24c7ee998765bce201c1ab",
      "qa": "9355e187a6c83ba6457e983871945101f3654ab17a24c7ee998765bce201c1ab"
    },
    "currentSha256": "331616b92765ac25946dc563501e0b06b12f43069b28320c744058d899287522",
    "kind": "runtime"
  },
  "src/hub-furnishing-critical-v138.js": {
    "predecessors": {
      "catalogue": "bc3457cc5f77ba42363699a9d5dcb474dfcb9fca510d7f3ddc9687a980f1538d",
      "main": "bc3457cc5f77ba42363699a9d5dcb474dfcb9fca510d7f3ddc9687a980f1538d",
      "qa": "bc3457cc5f77ba42363699a9d5dcb474dfcb9fca510d7f3ddc9687a980f1538d"
    },
    "currentSha256": "43464c686f9ef9aada3549e4f3c16d2ee2da34386c55719849e5e8e62927d18a",
    "kind": "runtime"
  },
  "src/hub-room-composition-v142.js": {
    "predecessors": {
      "catalogue": "d0fdb04488e49b7be3fe59d5e078742b0190f6c2189d575e5c6f6b9d1bffe029",
      "main": "64bdf33f28110a655bea4a38bda4035a235590feb0b66be363ffb0b914611907",
      "qa": "64bdf33f28110a655bea4a38bda4035a235590feb0b66be363ffb0b914611907"
    },
    "currentSha256": "17759dc162da7e4c098d766734453e6c59c6e8417c355c0572529243dacb1c16",
    "kind": "runtime"
  },
  "src/hub-room-furnishing-v137.js": {
    "predecessors": {
      "catalogue": "9997f2c954dfe7b0c32ae3094d2e09cbc958bbc40d1844c52a9696cef0292e45",
      "main": "8b93181c9cb7662b80a5f8a05205a29abee2b7701e30a331527ed18083374664",
      "qa": "8b93181c9cb7662b80a5f8a05205a29abee2b7701e30a331527ed18083374664"
    },
    "currentSha256": "d76f0322f9bb55bf1ab845742bd1a20d0434ec01f53bacaffb2600b55ea2d4e8",
    "kind": "runtime"
  },
  "src/hub-service-geometry-v139.js": {
    "predecessors": {
      "catalogue": "cf67fa0507cc064d21799a467fe8a34b2f8e3352ee81abd43466cb762ec3a752",
      "main": "8f69ddd93564959ff44df15f3e4dcf553a626bc3568306d8ebdbb88985e03e9c",
      "qa": "8f69ddd93564959ff44df15f3e4dcf553a626bc3568306d8ebdbb88985e03e9c"
    },
    "currentSha256": "1f5ea8cec644fcd04a253bf9b04807721bd2d57eefecb83d824c60327fb97b27",
    "kind": "runtime"
  },
  "src/xeno-trials-ui-v96.js": {
    "predecessors": {
      "catalogue": "afcbe460f875f5f03285a4b2b509bbdebdbba081dd7d18447a33f97a0231568a",
      "main": "afcbe460f875f5f03285a4b2b509bbdebdbba081dd7d18447a33f97a0231568a",
      "qa": "afcbe460f875f5f03285a4b2b509bbdebdbba081dd7d18447a33f97a0231568a"
    },
    "currentSha256": "205e7446f0f0ca4a92e33ed200fd2eedd9b0dfeeb4c61529a1e679dab1a000a1",
    "kind": "runtime"
  }
});
// END V182_REVIEWED_SOURCES

export const INTEGRATION_SOURCE_ONLY_PATHS_V182 = Object.freeze([
  'scripts/audit-pr-integration-v182.mjs',
  'scripts/qa-hub-door-bays-v182.py',
  'docs/development/PR_INTEGRATION_20261104.md',
  'docs/forge/xeno-trials/door-bay-continuation-v182.json',
  'CLAUDE.md', '.ai-tools', '.ai-tools/README.md', '.ai-tools/sources.json',
  '.ai-tools/setup.py', '.ai-tools/.gitignore', '.ai-tools/tests', '.ai-tools/tests/test_setup.py'
]);

/** A join accepts only named parent endpoints for this exact file. In particular
 * a SHA read from a caller-provided progress record cannot admit altered bytes. */
export function reviewedIntegrationDigestV182(path, branchEndpoint) {
  const receipt = INTEGRATION_SOURCES_V182[path];
  // V183 successors (scripts/audit-original-names-v183.mjs) continue this join.
  if (!receipt) return reviewedOriginalNamesDigestV183(path, branchEndpoint);
  assert.ok(validHash(branchEndpoint), 'Missing V182 branch endpoint: ' + path);
  assert.ok(Object.values(receipt.predecessors).includes(branchEndpoint),
    'Incorrect V182 branch endpoint: ' + path);
  assert.ok(validHash(receipt.currentSha256), 'Invalid V182 source digest: ' + path);
  return reviewedOriginalNamesDigestV183(path, receipt.currentSha256);
}

/** Strip only this additive continuation. Unexpected roots and modified old
 * receipts stay visible to the complete PR36 documentary hash. */
export function historicalIntegrationViewV182(current) {
  if (!Object.hasOwn(current, 'followupV182')) return current;
  const previous = { ...current }; delete previous.followupV182;
  assert.equal(canonicalHash(previous), INTEGRATION_BASELINE_V182.catalogue.documentCanonicalSha256,
    'MainN/V177/V178 documentary witness was rewritten (V182 catalogue branch)');
  return previous;
}

export function qaProgressViewV181(current) {
  const branch = current.followupV182?.qaBranch;
  assert.ok(branch && typeof branch === 'object', 'Missing V181 QA branch continuation');
  const previous = { ...historicalIntegrationViewV182(current) }; delete previous.followupV179;
  assert.equal(canonicalHash(previous), INTEGRATION_BASELINE_V182.main.documentCanonicalSha256,
    'The common d41b documentary witness was rewritten');
  for (const version of [179, 180, 181]) {
    const field = 'followupV' + version;
    assert.ok(branch.followups?.[field], 'Missing V' + version + ' continuation');
    previous[field] = branch.followups[field];
  }
  return previous;
}

/** Historical QA branch resolver, independent of the catalogue and AI forks. */
export function reviewedQaBranchDigestV181(path, endpointV178) {
  let expected = endpointV178;
  for (const version of [179, 180, 181]) {
    const maps = ['QA', 'VERIFIER', 'WORKFLOW']
      .map(kind => QA_BRANCH_CONSTANTS_V181['V' + version + '_' + kind + '_SUCCESSORS'])
      .filter(Boolean).filter(map => Object.hasOwn(map, path));
    assert.ok(maps.length <= 1, 'Ambiguous QA V' + version + ' successor: ' + path);
    if (!maps.length) continue;
    const receipt = maps[0][path];
    assert.equal(expected, receipt.previousSha256, 'Incorrect QA V' + version + ' predecessor: ' + path);
    assert.equal(expected, QA_BRANCH_CONSTANTS_V181['V' + version + '_MAIN_PREDECESSORS'][path],
      'Incorrect QA branch endpoint: ' + path);
    assert.ok(validHash(receipt.currentSha256));
    expected = receipt.currentSha256;
  }
  return expected;
}

/** The full original QA document and all three receipt stages are preserved.
 * Their successes remain dated, and the integrated files are checked separately. */
export function verifyQaBranchV181(current, readSource = readRepository) {
  const record = current.followupV182?.qaBranch;
  const historical = qaProgressViewV181(current);
  assert.deepEqual(keys(record), ['baselineCommit', 'documentCanonicalSha256', 'followups', 'progressSha256']);
  assert.equal(record.baselineCommit, INTEGRATION_BASELINE_V182.qa.commit);
  assert.equal(record.progressSha256, INTEGRATION_BASELINE_V182.qa.progressSha256);
  assert.equal(record.documentCanonicalSha256, INTEGRATION_BASELINE_V182.qa.documentCanonicalSha256);
  assert.deepEqual(keys(record.followups), ['followupV179', 'followupV180', 'followupV181']);
  assert.equal(canonicalHash(historical), record.documentCanonicalSha256,
    'The complete QA V181 documentary witness was rewritten');
  assert.equal(canonicalHash(QA_BRANCH_CONSTANTS_V181), INTEGRATION_BASELINE_V182.qa.constantsCanonicalSha256,
    'Historical QA V179/V180/V181 constants were rewritten');
  const stages = new Map();
  for (const version of [179, 180, 181]) {
    const field = 'followupV' + version, followup = historical[field];
    const prior = { ...historical };
    for (const later of [179, 180, 181].filter(value => value >= version)) delete prior['followupV' + later];
    const witness = QA_BRANCH_CONSTANTS_V181['V' + version + '_BASELINE_WITNESS'];
    assert.equal(canonicalHash(prior), witness.documentCanonicalSha256, 'QA V' + version + ' predecessor document changed');
    assert.equal(followup.baselineProgressSha256, witness.baselineProgressSha256);
    assert.equal(followup.baselineCommit, witness.mainCommit ?? witness.baseCommit);
    for (const [name, kind] of [['qaChanges', 'QA'], ['verifierChanges', 'VERIFIER'], ['workflowChanges', 'WORKFLOW']]) {
      const map = QA_BRANCH_CONSTANTS_V181['V' + version + '_' + kind + '_SUCCESSORS'];
      if (!map) continue;
      assert.deepEqual(followup[name]?.map(row => row.path).sort(), keys(map), 'Incomplete V' + version + ' ' + name);
      assert.equal(new Set(followup[name].map(row => row.path)).size, followup[name].length);
      for (const row of followup[name]) {
        assert.deepEqual(keys(row), ['currentSha256', 'path', 'previousSha256']);
        assert.deepEqual([row.previousSha256, row.currentSha256], [map[row.path].previousSha256, map[row.path].currentSha256]);
        if (!stages.has(row.path)) stages.set(row.path, row.previousSha256);
      }
    }
  }
  for (const [path, original] of stages) {
    const endpoint = reviewedQaBranchDigestV181(path, original);
    assert.equal(sha(readSource(path)), reviewedIntegrationDigestV182(path, endpoint),
      'Unreviewed QA V181 source after V182 integration: ' + path);
  }
  const guard = [...readSource('scripts/qa-npc-annex-service-routes-v163.py').toString()
    .matchAll(/^NATIVE_ASHA_DEPENDENCY_V163 = '''[\s\S]*?'''/gm)];
  assert.equal(guard.length, 1, 'Asha dependency guard must have one exact definition');
  assert.equal(sha(guard[0][0]), reviewedNativeQaDependencyGuardDigestV187(
    QA_BRANCH_CONSTANTS_V181.V180_BASELINE_WITNESS.dependencyGuardSha256),
    'Unreviewed successor of the V180 dependency guard or budgets');
  assert.equal(sha(readSource('docs/forge/xeno-trials/' + current.workbook)),
    QA_BRANCH_CONSTANTS_V181.V181_BASELINE_WITNESS.workbookSha256, 'QA historical workbook bytes changed');
  return Object.freeze({ runtimeSuccessors: 0, qaSuccessors: 2, verifierSuccessors: 4,
    workflowSuccessors: 1, workbookChanged: false, sevenRoutesClosed: false, approved1to1: 0 });
}

export function integratedRuntimeSourcesV182(historical) {
  const result = {};
  for (const [path, digest] of Object.entries(historical)) result[path] = reviewedIntegrationDigestV182(path, digest);
  for (const [path, receipt] of Object.entries(INTEGRATION_SOURCES_V182))
    if (receipt.kind === 'runtime') result[path] = receipt.currentSha256;
  return Object.freeze(result);
}

export function verifyIntegrationV182(current, readSource = readRepository) {
  const record = current.followupV182;
  assert.ok(record && typeof record === 'object', 'Missing V182 integration admission');
  assert.deepEqual(keys(record), ['aiTooling', 'approved1to1', 'auditLibraries', 'baselineCommits',
    'historicalEvidenceTransferred', 'newArtTasksClosed', 'oldWorkbookBytesPreserved', 'qaBranch',
    'releaseEvidence', 'resultSources', 'runtimeValidation', 'schema', 'scope', 'sourceChanges', 'sourceOnlyPaths', 'state']);
  assert.equal(record.schema, 182);
  assert.equal(record.state, 'SOURCE_ADMISSION_ONLY');
  assert.equal(record.runtimeValidation, 'REPORTED_SEPARATELY_FOR_TESTED_COMMIT');
  assert.equal(record.historicalEvidenceTransferred, false);
  assert.equal(record.oldWorkbookBytesPreserved, true);
  assert.deepEqual([record.approved1to1, record.newArtTasksClosed], [0, 0]);
  assert.deepEqual(record.releaseEvidence, { nodeSuite: null, nativeCandidate: null, ci: null, review: null, merge: null });
  assert.deepEqual(record.resultSources, {
    actions: 'https://github.com/darknigthmare/aliens-tantalus-frontier/actions',
    integrationReport: 'docs/development/PR_INTEGRATION_20261104.md',
    scope: 'These immutable source admissions do not record execution outcomes. Read the report and GitHub Actions for the explicitly tested commit.'
  });
  assert.ok(typeof record.scope === 'string' && record.scope.length >= 60);
  assert.deepEqual(record.baselineCommits, Object.fromEntries(Object.entries(INTEGRATION_BASELINE_V182)
    .map(([name, value]) => [name, value.commit])));
  historicalIntegrationViewV182(current);
  assert.deepEqual(record.aiTooling, AI_TOOLING_FOLLOWUP_20261104, 'Historical AI tooling receipt changed');
  assert.deepEqual(record.sourceOnlyPaths, INTEGRATION_SOURCE_ONLY_PATHS_V182);
  assert.deepEqual(record.sourceChanges, Object.entries(INTEGRATION_SOURCES_V182).map(([path, receipt]) => ({ path, ...receipt })),
    'Unreviewed V182 source manifest; caller values cannot admit their own bytes');
  for (const [path, receipt] of Object.entries(INTEGRATION_SOURCES_V182)) {
    assert.deepEqual(keys(receipt), ['currentSha256', 'kind', 'predecessors']);
    assert.deepEqual(keys(receipt.predecessors), ['catalogue', 'main', 'qa']);
    assert.ok(['runtime', 'verifier', 'qa', 'workflow', 'document', 'tooling', 'configuration'].includes(receipt.kind));
    for (const predecessor of Object.values(receipt.predecessors)) assert.ok(predecessor === null || validHash(predecessor));
    assert.equal(sha(readSource(path)), reviewedOriginalNamesDigestV183(path, receipt.currentSha256), 'Unreviewed V182 source bytes: ' + path);
  }
  assert.deepEqual(record.auditLibraries.map(row => row.path), ['scripts/audit-pr-integration-v182.mjs']);
  for (const row of record.auditLibraries) {
    assert.deepEqual(keys(row), ['path', 'sha256']);
    assert.ok(validHash(row.sha256));
    assert.equal(sha(readSource(row.path)), reviewedOriginalNamesDigestV183(row.path, row.sha256), 'Unreviewed V182 integration library: ' + row.path);
  }
  verifyQaBranchV181(current, readSource);
  return Object.freeze({ joinedSources: Object.keys(INTEGRATION_SOURCES_V182).length,
    historicalQaStages: 3, workbookChanged: false, approved1to1: 0 });
}
