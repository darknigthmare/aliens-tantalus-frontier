import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = records => Object.freeze(Object.fromEntries(Object.entries(records).map(([path, receipt]) =>
  [path, Object.freeze({ ...receipt, ...(receipt.parents ? { parents: Object.freeze(receipt.parents) } : {}) })])));

export const XENO_STANDALONE_PARENTS_V207 = Object.freeze({
  trials: 'fa2d62feed6f1042660914ac47998a96c1e2bdce',
  main: '07ee99d56480780044c74d4f1eb11f31b07fef13',
  merged: 'c0ea07347b125d8c416ab9102f3a2962201422f2'
});

// Exact receipts for the two lineages and the V207 release sources.
export const XENO_STANDALONE_SUCCESSORS_V207 = freeze({
  ".gitignore": {
    "kind": "tooling",
    "sha256": "c0798775b26a3f924b9982ac53a4f04c03a1445848ae2ae916976613d8d75e28",
    "parents": {
      "trials": "2219cdc6d637b0bd3d9344eaf06655dd8606aa0dda53c00303c19a61bb69aad7",
      "main": "2219cdc6d637b0bd3d9344eaf06655dd8606aa0dda53c00303c19a61bb69aad7",
      "merged": "2219cdc6d637b0bd3d9344eaf06655dd8606aa0dda53c00303c19a61bb69aad7"
    }
  },
  ".vercelignore": {
    "kind": "tooling",
    "sha256": "1cdfdbac8ecffe3f3a3a2f4abb2c40049587041f66e225eedce4919d4e3ec50e",
    "parents": {
      "trials": "0f02f4a68543feb83c3c9ca7796a662271c062d91c392b26687a8b90bd90b2e3",
      "main": "f0afc5e14402a0fbe419eb3bcdb710c397407d4c05a857515746188bee19a906",
      "merged": "f0afc5e14402a0fbe419eb3bcdb710c397407d4c05a857515746188bee19a906"
    }
  },
  "docs/forge/xeno-trials/ASSET_LOT_V205.json": {
    "kind": "documentation",
    "sha256": "903596cb1c5fd518806902f0cfb958b22fd6a9dd3aac33e0a9c53c48b3226658",
    "parents": {
      "trials": "5b9137d9bd660da8f78987e864c5381bb6ab39e24e6421042cd47704e6710d76",
      "merged": "5b9137d9bd660da8f78987e864c5381bb6ab39e24e6421042cd47704e6710d76"
    }
  },
  "index.html": {
    "kind": "runtime",
    "sha256": "5c76248546c9915374744afb2d715d44dec196a637dc71ae1cd24a4fa675fdf8",
    "parents": {
      "trials": "ee97f3a438cf92e3b4a34beb28ca9c5d7687a40fe5cab389fcf5876085a789e3",
      "main": "875eb3c528c2fef7219372ae0eeb3782d72b30fbc7568bea131fa7496b4a49b3",
      "merged": "5c76248546c9915374744afb2d715d44dec196a637dc71ae1cd24a4fa675fdf8"
    }
  },
  "package.json": {
    "kind": "tooling",
    "sha256": "d5b33ffb13e627f3eaea99a73ce762eb699495969bebe9921e8ddc7b754ab439",
    "parents": {
      "trials": "d5d2e4c965479a658b2289e7e51fff6456c099fb99e9b322ea289a3cd40a89ef",
      "main": "a08d5461e62e106d581f1de31647727f11825636e56aa1af767a2746afb8e005",
      "merged": "92dde87d1e86f54de2ddb4bfa38c1016b35d04df3ccf63fa11cc17b30162b7ef"
    }
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "92535753e1c41b19c39361a2543ea0dbabc56d9d99b226540053921cc36687d8",
    "parents": {
      "trials": "74908e96de43186a67240f9ac0590d3e9d3bee4418cce371cbd097478c7bd68a",
      "main": "c24e9c6b10888d2942bd97caf96309d02c394f02b3bc235bead4dc70e4c8d6fc",
      "merged": "23571f0e090bd34216af55f17b899f4062ce1e30fb4570a63b0afff4e398b750"
    }
  },
  "scripts/audit-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "d37b901791fe5c6e03d10a2fb2734ebf11a26734a9448e184186a72ae38af4bc",
    "parents": {
      "trials": "d84729e4c6672f8142c36ed82cf0c7d37c8b3b826615fa108ea4148a520ced29",
      "merged": "d84729e4c6672f8142c36ed82cf0c7d37c8b3b826615fa108ea4148a520ced29"
    }
  },
  "scripts/audit-xeno-visual-assets-v205.mjs": {
    "kind": "tooling",
    "sha256": "3b93a1bf6cdf2c178f9fe22f7112f3cd4d4bd86e0b335704d9f6ba582529676b",
    "parents": {
      "trials": "df20ceb51b521cb2b0f6a16c5ad6af6552cbbe0f8b6bbe5539275a8370bd0d14",
      "merged": "df20ceb51b521cb2b0f6a16c5ad6af6552cbbe0f8b6bbe5539275a8370bd0d14"
    }
  },
  "scripts/build-output-guard.mjs": {
    "kind": "tooling",
    "sha256": "cfc1b67d93e25459c722d3fda45b02dbbc02ab99f1fbd1ba63fb3e736a887b0c",
    "parents": {
      "trials": "db239f72ce71bb111d0b9a73b3efc2bd03b8a3fd937ecc8cc6113583f02965ec",
      "main": "db239f72ce71bb111d0b9a73b3efc2bd03b8a3fd937ecc8cc6113583f02965ec",
      "merged": "db239f72ce71bb111d0b9a73b3efc2bd03b8a3fd937ecc8cc6113583f02965ec"
    }
  },
  "scripts/build-release-v143.mjs": {
    "kind": "tooling",
    "sha256": "4b63bef0942d4671007faa7fe07e0e742f726f5062eeaa2fd8f5cd14565418e2",
    "parents": {
      "trials": "43973fc01590bd92556bee1a3d0ccbc109be7c5f8cf96e0ae2da662eb1530e95",
      "main": "43973fc01590bd92556bee1a3d0ccbc109be7c5f8cf96e0ae2da662eb1530e95",
      "merged": "43973fc01590bd92556bee1a3d0ccbc109be7c5f8cf96e0ae2da662eb1530e95"
    }
  },
  "scripts/build.mjs": {
    "kind": "tooling",
    "sha256": "47f7b9dbb85ff529afc50f666387453da3c1803ae5affa712a5d6041480cc36c",
    "parents": {
      "trials": "fa817256bc9832c9390055ddab431e8dd9e1320b273904c39f2489ff6807ab12",
      "main": "eba8f2c08906671478a191547540bfa865b1f29d3564cd4936082f1682739d00",
      "merged": "239c3a5a8826da1603e2a847e00ba595afb4074f2a32426259de6bb4f0b97e88"
    }
  },
  "scripts/dev.mjs": {
    "kind": "tooling",
    "sha256": "3447c13936cdbee73626673383edd91cb65f5a5b6eeb8fdf9ab1f965b2dfb8ee",
    "parents": {
      "trials": "d0788bdc0244f0d5cdfd8e20add46f15d0a79703559cd85d5088e3a0de31d6a4",
      "main": "3c7047f833713dc570242d7e8319a8309522ade1efbf82dcc317c028042e1aad",
      "merged": "3c7047f833713dc570242d7e8319a8309522ade1efbf82dcc317c028042e1aad"
    }
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "65e4e9123ae0ce0186bd7ce3058491ee1a4ca61363237d3c0f659bbc89d309e5",
    "parents": {
      "main": "68114c2923d598b181dd1472e9768f9e8001a601eac5a384a6a0c0cc0b11d8f9",
      "merged": "68114c2923d598b181dd1472e9768f9e8001a601eac5a384a6a0c0cc0b11d8f9"
    }
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "67a8fae99957e8f3d9ad37ef47a7519d12ab9a647bd28355daf332096d8ade2d",
    "parents": {
      "trials": "f10f3470e2511997f2bfb23a1f4d94ea9555f16991f1d2db867c67ce8ebdceaf",
      "main": "7d1f368a4a6e5b3f8ae8a5161c8a8d819e32c33a14013dfed2ef8a1bb16cbd29",
      "merged": "f10f3470e2511997f2bfb23a1f4d94ea9555f16991f1d2db867c67ce8ebdceaf"
    }
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "fe8280ac7c3ebb2d7fe5b3ba98c972e56f1592ff8c479e731e49f09ce3ff6d7d",
    "parents": {
      "trials": "f4d8ce2a42b33855527b8e3173c3999c2e294707e37b9f222da26fc0644039c8",
      "main": "8f3342580f3969a7ddef8680af2bf4ab1df6cf64c61a67419ae8add7458e21e9",
      "merged": "f4d8ce2a42b33855527b8e3173c3999c2e294707e37b9f222da26fc0644039c8"
    }
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "8f6ad0afed372acd251e4d1574b3d768936d46d52a79d84c3f2666bbfd2d4e22",
    "parents": {
      "trials": "7283bb82903a742f2dd662072b0bad6c1da4fb5ca60c3c56001b4e54e734ffd2",
      "main": "cecbd3f8929e30ccb39ff65192492823e5aa4c6b58fa8f6d2e7d46a23d030256",
      "merged": "113be1cce078320dfb9753a8f1fb93ce22a8b01973a6e8180a269ed1411319d1"
    }
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "b90535d7e9ce1dadda06f9ad27a761d41f434dd8786ed0c1bc3a866127390740",
    "parents": {
      "trials": "1b81da575ba68fcb5186cd5c47cd9d25f525904b84000b97e1b05ad796dab2cc",
      "main": "83b843ecfaefb08770258331018d18837628b59f9d86b647b2185be75a01327e",
      "merged": "d4cb46510542bbedcf280ca9065fb9c6e5bc5962e1400ac5686da708a9cdf673"
    }
  },
  "scripts/verify-release-artifact-v143.mjs": {
    "kind": "tooling",
    "sha256": "8edc629aa7a4106f1cd35aa910bc5eb3edf14bfc18df153f8193339ffc5258a0",
    "parents": {
      "trials": "09254927c58489597131b98f3c0dc26159ec01c8265045299f52bf73819e2e60",
      "main": "09254927c58489597131b98f3c0dc26159ec01c8265045299f52bf73819e2e60",
      "merged": "09254927c58489597131b98f3c0dc26159ec01c8265045299f52bf73819e2e60"
    }
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "05b7258d315accf781a848dbe5e1c2d76f931a6ac81877a30211e4661b9b52e0",
    "parents": {
      "main": "02a132c3a94be612d5e46ae65c1e17a6a2dbf4b3f3332bfff6e5bd7d0f87efd5",
      "merged": "02a132c3a94be612d5e46ae65c1e17a6a2dbf4b3f3332bfff6e5bd7d0f87efd5"
    }
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "8642765cf30c0f7c34e0a531f32bd866f79fba9d8f66b1a1b2a0a0121339e184",
    "parents": {
      "trials": "58eedf345dc2e98f1f4e67cba8558e1e5575d731b104c604c45f4a33bd8373b6",
      "merged": "58eedf345dc2e98f1f4e67cba8558e1e5575d731b104c604c45f4a33bd8373b6"
    }
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "9d47362efa03e3a2a12e06af702ef2898f721c0ca9e354ea3f21f9865fc5c3a3",
    "parents": {
      "trials": "bba7d655e9b21a5fdba4d59d89442b358dfe485047c00c9d2f03184886cf9f4d",
      "merged": "bba7d655e9b21a5fdba4d59d89442b358dfe485047c00c9d2f03184886cf9f4d"
    }
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "87de42c8945713bfd8ad674c08d1adb7fc68d840467f8c8852f791ec17c0e3e9",
    "parents": {
      "trials": "c44b244ba3bacb7657b7023e4ed97bfe4afa4aa9edcdefd21a6c99707c2c30e2",
      "merged": "c44b244ba3bacb7657b7023e4ed97bfe4afa4aa9edcdefd21a6c99707c2c30e2"
    }
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "fcdae46b0ec2edc943877d6aec42f28dd6a577047baeddd7c0ee793ee9ff952a",
    "parents": {
      "trials": "3b4a88a92b59daa19b7e8fb377f6b236904a94bf9ac107c4603c57dcf28eb522",
      "merged": "3b4a88a92b59daa19b7e8fb377f6b236904a94bf9ac107c4603c57dcf28eb522"
    }
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "54c41430bf30014ff217bcb5d9099c2f2f2ce08bf84bb2c6e892c02b8b326a20",
    "parents": {
      "trials": "273fffa43b99557eb5a08264697f4cce63ab3f85e7597ea1dbe85f0c4634eab8",
      "merged": "273fffa43b99557eb5a08264697f4cce63ab3f85e7597ea1dbe85f0c4634eab8"
    }
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "b7f10a57e125d06d3385646dd92cb716969519f0ae7dabf9290fd94fbf5a9127",
    "parents": {
      "trials": "0b9cdf68d5c356f25e14a355f262a5c620292ca8a300193573b7d6bc9c35bc92",
      "merged": "0b9cdf68d5c356f25e14a355f262a5c620292ca8a300193573b7d6bc9c35bc92"
    }
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "473129864a0b9a3449c876500b218a237e996cc5eac325739176a6cad357772a",
    "parents": {
      "trials": "23f218a916011b7d49cbc4d889f604b37ecadb713dea70d00e7cf9d4d7e8fdc0",
      "merged": "23f218a916011b7d49cbc4d889f604b37ecadb713dea70d00e7cf9d4d7e8fdc0"
    }
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "2b575f7ade33fa0a4bea35ed26f034f206581c6b7c6a55e0034fa6aead04a8fe",
    "parents": {
      "trials": "b39b36e1132d8d4e7f46cbcba9a44f0b99fc26b1d07eab42f37d8de58f180e91",
      "merged": "b39b36e1132d8d4e7f46cbcba9a44f0b99fc26b1d07eab42f37d8de58f180e91"
    }
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "db1cb148b8db62ef04ae200d30cf799312dd1720c26ec9e40ecbc98d8f3ccc4c",
    "parents": {
      "trials": "83d234514adf5adf9ea5fdc8f320b113df9a06c62ea1f2b91a027fc5a0f1cd25",
      "merged": "83d234514adf5adf9ea5fdc8f320b113df9a06c62ea1f2b91a027fc5a0f1cd25"
    }
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "d56b4ca4e3524e775de9b030201bde8dc838eaed9ae9674443d374b6b72809c8",
    "parents": {
      "trials": "5f231063b6a88420cfbacd170ad447da254e14ff18badd7771d89141afab07cb",
      "merged": "5f231063b6a88420cfbacd170ad447da254e14ff18badd7771d89141afab07cb"
    }
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "07a636a3b3ccfc2ce9247c8569403f44d8fcfe8758161825b7fbf3ac5d1c0e29",
    "parents": {
      "trials": "2ea616dd3c765de747b47d62bec31cdd4a8bf8d1e0be1d78920814a312263a4f",
      "merged": "2ea616dd3c765de747b47d62bec31cdd4a8bf8d1e0be1d78920814a312263a4f"
    }
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "21c325316b32d190c277d0ec83165587caa8abee51601ea3036d1ea88640081a",
    "parents": {
      "trials": "feafbe3d8222bb236fa73be5987b7032ab26b14979e849254d6b391509d7a29c",
      "merged": "feafbe3d8222bb236fa73be5987b7032ab26b14979e849254d6b391509d7a29c"
    }
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "b7959c943b167f6caede19b96ec9d369437cd54e62a932df9bc990ae353fbad9",
    "parents": {
      "trials": "66c6615e1b4ca620c778069af509b54402cfe2a0a0f85083615b7d3f2ea88a6d",
      "merged": "66c6615e1b4ca620c778069af509b54402cfe2a0a0f85083615b7d3f2ea88a6d"
    }
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "d111830df6cc6b7920424100329d567260d5f033bcac10692ea53b3c1853f15f",
    "parents": {
      "trials": "01430d9b819378a9d41d90771b3a6b00207ae01fa9f2c8be69768b0e51f7e008",
      "merged": "01430d9b819378a9d41d90771b3a6b00207ae01fa9f2c8be69768b0e51f7e008"
    }
  },
  "scripts/verify-xeno-trials-gamepad-v186.mjs": {
    "kind": "tooling",
    "sha256": "bd33adf7fb597d073eb79fa6796272b6e3b7f8647111f2fc964f1c8e33f9578b",
    "parents": {
      "trials": "ec6a311d0266a1bcf17943872846888c03ee53507566736ed8c59b00ffd25e77",
      "merged": "ec6a311d0266a1bcf17943872846888c03ee53507566736ed8c59b00ffd25e77"
    }
  },
  "scripts/verify-xeno-trials-v145.mjs": {
    "kind": "tooling",
    "sha256": "3086cc19cf63739023358ead9d553c928c0fb69466de2dff4a03da4ee8da570f",
    "parents": {
      "trials": "51b812939768ca3af6d0ac8cd0875292c2e1085d80ab626983f91a193204135a",
      "main": "51b812939768ca3af6d0ac8cd0875292c2e1085d80ab626983f91a193204135a",
      "merged": "51b812939768ca3af6d0ac8cd0875292c2e1085d80ab626983f91a193204135a"
    }
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "8ed64ca61b9b968e4027bcb14ad24b2bff9c813b7fd22c7365ef6975cfce7adc",
    "parents": {
      "trials": "ad5605b10105f185fd495929ffe7e674ea67cc178bae9a9d49d622b0732f4bd2",
      "merged": "ad5605b10105f185fd495929ffe7e674ea67cc178bae9a9d49d622b0732f4bd2"
    }
  },
  "src/app.js": {
    "kind": "runtime",
    "sha256": "7f6841a1e9c98430ef9191ec2d43b35c11262e5ca762efd1498f15c98b05a221",
    "parents": {
      "trials": "570a0bb52c52a92eefe596408ec6fb54f446c77998d69b80c4332576783a6c30",
      "main": "7a3f989423e18ca0a531ccb50120ab0f074b01652ea0d797495f59299563d0df",
      "merged": "7f6841a1e9c98430ef9191ec2d43b35c11262e5ca762efd1498f15c98b05a221"
    }
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "2383011b0be3c80fee049e224d09c412e32b37f4de8956dba217b7d763064f7a",
    "parents": {
      "trials": "efd03c160bef3d4fc96c7480087e736b99b6a2e9aafbe88db0d03f486e9c475e",
      "main": "d9b0f2405eeae7eb2b1ea0d1f6a389ac736f89f4558e9e66c965b58498ebd90c",
      "merged": "efd03c160bef3d4fc96c7480087e736b99b6a2e9aafbe88db0d03f486e9c475e"
    }
  },
  "src/title-screen-v61.js": {
    "kind": "runtime",
    "sha256": "c9d13438e40802b6efbcacb5ff584f6c6e8be92b8801b8e33df11b25a4899120",
    "parents": {
      "trials": "e0c10ca738df12c78b48a24d79cb049aea2ac3e1c08ec270d3eed750fe267342",
      "main": "c9d13438e40802b6efbcacb5ff584f6c6e8be92b8801b8e33df11b25a4899120",
      "merged": "c9d13438e40802b6efbcacb5ff584f6c6e8be92b8801b8e33df11b25a4899120"
    }
  },
  "src/xeno-trials-capture-v163.js": {
    "kind": "runtime",
    "sha256": "e193d2cb6e3d8fc44e96f01b0a17a010a4ba72b0dca9bcaa0ae8b4f8085113d7",
    "parents": {
      "trials": "2c7fb5a5111e6d2ddf5b89baa5232dc613767708ed523fc531a2ea72657cf775",
      "main": "2c7fb5a5111e6d2ddf5b89baa5232dc613767708ed523fc531a2ea72657cf775",
      "merged": "2c7fb5a5111e6d2ddf5b89baa5232dc613767708ed523fc531a2ea72657cf775"
    }
  },
  "src/xeno-trials-combat-contract-v186.js": {
    "kind": "runtime",
    "sha256": "da964588d740ce35b10a53f7ead3586def8a11dcc17e9d5c16536b7ce38c2e39",
    "parents": {
      "trials": "545602a7521f147f4597103135c359049e6531c031eaff51e676428fd8498f03",
      "merged": "545602a7521f147f4597103135c359049e6531c031eaff51e676428fd8498f03"
    }
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "64ba8a9016d9f9cacce4f9d5b656379e864b6950a5207afe9cf28c51351c7ad2",
    "parents": {
      "trials": "efbf6a21a06da266f0a98138cf2829411284d75514f2a2a01cf294dc728d2863",
      "merged": "efbf6a21a06da266f0a98138cf2829411284d75514f2a2a01cf294dc728d2863"
    }
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "dc2bf84ba6bbcc35db89e7392997625d7048a010731983ec4f440093891b70e1",
    "parents": {
      "trials": "c8cbc099dbd72e1c7e7bb651f88599e41f9066fb80a6643bf46343944eb1e9c2",
      "main": "48e4e6cc8091e2f266f0b6831eb5d08f523a9acc27ba1f23cea3f227aaf0a007",
      "merged": "c8cbc099dbd72e1c7e7bb651f88599e41f9066fb80a6643bf46343944eb1e9c2"
    }
  },
  "src/xeno-trials-gamepad-v186.js": {
    "kind": "runtime",
    "sha256": "f68db73229dfc444efe2dbad4d7db8caf07e7459ee6f3e331a49dc71aaa3f852",
    "parents": {
      "trials": "38ab717dc76d75d12cc73cb376980d60dc3d5a6a7f161f833b0b4b740490dd5b",
      "merged": "38ab717dc76d75d12cc73cb376980d60dc3d5a6a7f161f833b0b4b740490dd5b"
    }
  },
  "src/xeno-trials-horde-checkpoint-v186.js": {
    "kind": "runtime",
    "sha256": "81d392e1da50aaaadbbbf4147680d28f80e25ae1f9f1acfe0194caf69890586a",
    "parents": {
      "trials": "7e79e9b1dce5df4fd7f0765f48f258170af4b7b101ea5786f74dc549c8188861",
      "merged": "7e79e9b1dce5df4fd7f0765f48f258170af4b7b101ea5786f74dc549c8188861"
    }
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "sha256": "7491cbce212de599f3c934a7d6de47112c8a116da99020fb0736f6d9d715be5a",
    "parents": {
      "trials": "9d2384a6e568d63ecc1d0280e03bf6ed6b166b9a86d227dd7e912d81920bc8bc",
      "main": "168a272b5c8b82cc4e5770cc48e261bd2725984eafeba566363b9b488a5da0fa",
      "merged": "9d2384a6e568d63ecc1d0280e03bf6ed6b166b9a86d227dd7e912d81920bc8bc"
    }
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "541036498c5c8fbff2f547df51cfe93930c0c9b2360efbe58bfe009b065ab1a3",
    "parents": {
      "trials": "9725d80048699a6399b69a765c9d6b4dc3451014bf049b9b9f92484e53bdf6a3",
      "main": "ef87fa84ba5f085cd0fc973b40dfeb11cf832f88b5168e259c2bc406303a2867",
      "merged": "9725d80048699a6399b69a765c9d6b4dc3451014bf049b9b9f92484e53bdf6a3"
    }
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "3eb97a8587b0bb17e282ded49ff14152cc377b5c6d057c79743c8f5188baf5cb",
    "parents": {
      "trials": "ee90244bfe1a80290197d17533bc34660637c30632c1f7623eff6ab85c3e3ca0",
      "main": "205e7446f0f0ca4a92e33ed200fd2eedd9b0dfeeb4c61529a1e679dab1a000a1",
      "merged": "ee90244bfe1a80290197d17533bc34660637c30632c1f7623eff6ab85c3e3ca0"
    }
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "1f94a0018a6c8ce11b37b4757372bdb1eb6dc16e8e10d12c135bd951100770d4",
    "parents": {
      "trials": "8352d786320ead53a5cdcbb8582ee1d1d2212798a0b92b006f07d912ac254cec",
      "main": "ff86bba365c3875c8ebaeb0abe13b2a6185ccd5f1a030b4ee5b15ac0e4a12f9b",
      "merged": "8352d786320ead53a5cdcbb8582ee1d1d2212798a0b92b006f07d912ac254cec"
    }
  },
  "vercel.json": {
    "kind": "tooling",
    "sha256": "aa423e9cbdf0d5e7fa826dfa8a94ba18ca5acd7e6dadf179805bd5959b7e3207",
    "parents": {
      "trials": "823f49e24f76154f5b3dc82400dae1a154fc1cce81925c3dd52c4a535b1325f9",
      "main": "6fd9d38aab44bce3d31c3c19d1406e109857361e4333c69c2f4ce1d8ce51af03",
      "merged": "6fd9d38aab44bce3d31c3c19d1406e109857361e4333c69c2f4ce1d8ce51af03"
    }
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "52b15b5c7f4220be07e7c99ac489511f716632e669a57ef78950d54da9987ef8",
    "parents": {
      "trials": "a558da2c981d1a0be32e04b5204a23fec3941954e82658cc235372477b1550b6",
      "main": "861ce30fd8721d0406fdef9e6881ac3220f3a58ab4d46b7e1878463063b26682",
      "merged": "a558da2c981d1a0be32e04b5204a23fec3941954e82658cc235372477b1550b6"
    }
  },
  "xeno-trials-v96.css": {
    "kind": "runtime",
    "sha256": "892ddff2a969e79ccaa9b9507ca66a79854cef0bd95387bf65cd6a61399ae4a9",
    "parents": {
      "trials": "24344bdeced7e1602eab98a4df38e1d06ba92ef7d27f0a3a2a07f7dd0e4a027e",
      "main": "7b34c819ecd9f6843d59f7534e902603ad80fa1b02d55ecdfc1ee5ac82a4b5ea",
      "merged": "24344bdeced7e1602eab98a4df38e1d06ba92ef7d27f0a3a2a07f7dd0e4a027e"
    }
  }
});
export const XENO_STANDALONE_NEW_INPUTS_V207 = freeze({
  ".github/workflows/xeno-trials-standalone-v207.yml": {
    "kind": "tooling",
    "sha256": "ff52d876a9f50ef3a0967b33b215028ca6e1a5362947e7624a825ea7b859c940"
  },
  "docs/forge/xeno-trials/V207-STANDALONE-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "b29321a9f2ae960171599f3f917d4984eca96dca80c8f8eaa38cde652671e0f8"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "8f761f53c4cac71f56af764785a22f9daf3f6613ed8899d7fe04cd8f7e01e927"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "9eaef80c069389ad5159d09da77da740ed6716a4fdb7182762add69a008a0166"
  },
  "scripts/verify-xeno-trials-artifact-v207.mjs": {
    "kind": "tooling",
    "sha256": "8aa22943421b5283783ed5310ce3012141c4b287f55d2055daa95ca09c26a013"
  },
  "scripts/verify-xeno-trials-finishers-v207.mjs": {
    "kind": "tooling",
    "sha256": "22fa2bab0c843cf248cf7dc549839dafd230198ba9bc301db2efa73c1313c61d"
  },
  "scripts/verify-xeno-trials-moveset-v207.mjs": {
    "kind": "tooling",
    "sha256": "05da23d7aff153571eab046dcc4c708bac051c4fddb6b9fb2b2672f5976e4b2d"
  },
  "scripts/verify-xeno-trials-practice-v207.mjs": {
    "kind": "tooling",
    "sha256": "5a76be268c86b24a2584ac7c37104b3f2b83950a9fc90b29f2771fe8b182218f"
  },
  "scripts/verify-xeno-trials-standalone.mjs": {
    "kind": "tooling",
    "sha256": "ffe1be870fa8966edd983d7e0fcbe2237a38fde21b5f277725286bfc4818dfda"
  },
  "src/xeno-trials-archive-access-v207.js": {
    "kind": "runtime",
    "sha256": "22cfa3dbeb54d78136a3b15ea1b874542371671cb4950624b86a1945720526da"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "3fdcc7b26ed5c6e0929f7cbe7d47a978a529f3aa6b79e216e05cc575ba2b6214"
  },
  "src/xeno-trials-moveset-v207.js": {
    "kind": "runtime",
    "sha256": "47c19ec30d80061db0c10a47e37304f869a372b99a79d627f75a736a903833a4"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "dac6a2a4ab78f2ed5c9e7ca44378e9ce695515a9733d1796a4dd860161b11d33"
  },
  "src/xeno-trials-standalone-save.js": {
    "kind": "runtime",
    "sha256": "5eb792e435758f1ce7070a2c9b27e2b2af70f4568f23db9c7ed283120435945d"
  },
  "src/xeno-trials-standalone.js": {
    "kind": "runtime",
    "sha256": "106be7275941c68c2f330bc00280814a9919a6aa7436702dcb262ec0ece77770"
  },
  "xeno-trials-standalone.css": {
    "kind": "runtime",
    "sha256": "1f00e8860a129bf1d9e8d6353ec6ea1c3f74e2aef7315e6d45959b0b4385cd5f"
  },
  "xeno-trials.html": {
    "kind": "runtime",
    "sha256": "b7736a80f8c07bd04fb01494989290c8d239d05f0d21e3e1b0ac289551b3288e"
  }
});
export const XENO_STANDALONE_DECLARATIONS_V207 = freeze({
  "scripts/audit-xeno-production-assets-v206.mjs": {
    "start": "export const XENO_PRODUCTION_ASSETS_BASELINE_V206",
    "end": "\nexport function reviewedXenoProductionAssetsDigestV206",
    "sha256": "b64692cb4757bf66d077c8ade441d7475e328a48071fdfc41e003fd716345cda"
  },
  "scripts/audit-xeno-visual-assets-v205.mjs": {
    "start": "export const XENO_VISUAL_ASSETS_BASELINE_V205",
    "end": "\nexport function reviewedXenoVisualAssetsDigestV205",
    "sha256": "d90cab54a99ac4f8c3eb79d2e33b4441b80a17d87ebe86a4106296646eee30b2"
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "start": "export const NATIVE_QA_RESOURCES_BASELINE_V187",
    "end": "\nexport function reviewedNativeQaResourcesDigestV187",
    "sha256": "a1704b9d7c8381aec02750c5be09ae47f416bf51c4d1635952c1bdb2eaa3de5f"
  }
});

export function reviewedXenoStandaloneDigestV207(path, endpoint) {
  if (!Object.hasOwn(XENO_STANDALONE_SUCCESSORS_V207, path)) return endpoint;
  const receipt = XENO_STANDALONE_SUCCESSORS_V207[path];
  assert.ok(Object.values(receipt.parents).includes(endpoint), 'Incorrect V207 predecessor: ' + path);
  return receipt.sha256;
}

export function xenoStandaloneRuntimeSourcesV207(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_STANDALONE_SUCCESSORS_V207)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256)
      reviewedXenoStandaloneDigestV207(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_STANDALONE_NEW_INPUTS_V207)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect new V207 runtime digest: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoStandaloneV207(readSource = readRepository) {
  const successors = Object.entries(XENO_STANDALONE_SUCCESSORS_V207);
  const inputs = Object.entries(XENO_STANDALONE_NEW_INPUTS_V207);
  const paths = new Set();
  assert.ok(successors.length && inputs.length, 'Incomplete V207 source freeze');
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V207 receipt path: ' + path);
    assert.ok(!paths.has(path) && path !== 'scripts/audit-xeno-standalone-v207.mjs', 'Duplicate or self-referencing V207 receipt');
    paths.add(path);
    assert.ok(['runtime', 'tooling', 'documentation'].includes(receipt.kind));
    assert.ok(isHash(receipt.sha256) && (!receipt.parents || (Object.keys(receipt.parents).length > 0
      && Object.entries(receipt.parents).every(([parent, hash]) => Object.hasOwn(XENO_STANDALONE_PARENTS_V207, parent)
        && isHash(hash)))), 'Invalid V207 receipt digest: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V207 source bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_STANDALONE_DECLARATIONS_V207)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical declarations changed: ' + path);
  }
  return Object.freeze({ successors: successors.length, addedInputs: inputs.length, historicalResultsTransferred: false });
}
