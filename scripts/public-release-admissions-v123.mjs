import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { ENEMY_DRIVE_IMPORTS_V123 } from '../src/enemy-drive-imports-v123.js';
import { PERSONNEL_DRIVE_VISUALS_V123 } from '../src/personnel-drive-visuals-v123.js';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';

// Reviewed byte identities are independent of the runtime's mutable admission data.
// Original files stay unchanged; documentary plates never become combat sprites.
export const PUBLIC_MEDIA_FILES_V123 = Object.freeze([
  {
    "path": "assets/user/drive-v123/enemies/acm-boiler.png",
    "sha256": "aa46ca7430e0a61d8387217b07393609e82e36f52eea48dd2c5278bf20af8109",
    "width": 1536,
    "height": 1024,
    "bytes": 1886030,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/acm-crusher.png",
    "sha256": "7c4ec54415712f6ff0a03cda10d39c04b5114ae4fdf75f52fb5d46d2fb21db25",
    "width": 1536,
    "height": 1024,
    "bytes": 2081114,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/afe-burster.png",
    "sha256": "35387c3dd2b2f1ca1cc1e4d68fc2703b55c9fe8d4a5d50e621ecfec351a3f8bd",
    "width": 1536,
    "height": 1024,
    "bytes": 1859708,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/afe-prowler.png",
    "sha256": "ec7d6be2ecdbf0b02a6b6148ead52338f483b8a8813d7cf7b2cea6f07f6d2d1f",
    "width": 1536,
    "height": 1024,
    "bytes": 2054791,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/afe-runner.png",
    "sha256": "c361545e0844989ed704d29b9549cbc3c28fc95fe847c65226777841c695ddfd",
    "width": 1536,
    "height": 1024,
    "bytes": 2024786,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/afe-spitter.png",
    "sha256": "74b67a559ce5f6fb7ed7a3ee4ffdcb31163027480ed0ca3cbad188a85355ddca",
    "width": 1536,
    "height": 1024,
    "bytes": 1890192,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/comic-rogue-king.png",
    "sha256": "2a68e0b0a65555a137ae813ee143cb7aa11301211e9bf91a5f7c69e0e68d7744",
    "width": 1536,
    "height": 1024,
    "bytes": 2170180,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-alien3-runner.png",
    "sha256": "5b98514567e4e9d2ed3bdd6b5182634907d2ef0e2c1cd2548d61fa5c1a75b3c6",
    "width": 1536,
    "height": 1024,
    "bytes": 1807317,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-aliens-queen-mobile.png",
    "sha256": "08a4647601a947d94a09b6723363ececdac41a1a4411119a2fc83e02a8996568",
    "width": 1536,
    "height": 1024,
    "bytes": 1976689,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-lifecycle-chestburster-1979.png",
    "sha256": "e9007d7a6ddf9936d5ff3a40a03b7b379b046203a1cf04e17b0e2376f9e2f039",
    "width": 1536,
    "height": 1024,
    "bytes": 1557943,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-lifecycle-egg-closed.png",
    "sha256": "8148b0653b029fdd2b212f2e5143b401a11369ee2f2f3812ddcc7aaf09967ccf",
    "width": 1287,
    "height": 1222,
    "bytes": 1568189,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-lifecycle-egg-open.png",
    "sha256": "0b3bf9e4f4e3b0a37e84e5aba6b6a406ebc74b24474dbb616c7bf0fce2fdbc81",
    "width": 1286,
    "height": 1223,
    "bytes": 1888658,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-lifecycle-facehugger-1979.png",
    "sha256": "b325260b9f5d0304b941eaa08c42a8479b8ff17ae80ba927c9e11bc362186ad7",
    "width": 1774,
    "height": 887,
    "bytes": 1032677,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-lifecycle-queen-chestburster.png",
    "sha256": "7c17e676b4fc1638b22689d48e2f803594dc2e2036fa275e262c8b6f6d958b78",
    "width": 1536,
    "height": 1024,
    "bytes": 1885398,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-prometheus-engineer-biosuit.png",
    "sha256": "27e88b31e5a6089e8fc3f29030e60679adcd9f212a7c515b2baf1842f040c8b9",
    "width": 1024,
    "height": 1536,
    "bytes": 1362084,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-prometheus-hammerpede.png",
    "sha256": "c481d557caf1055a30025deff331d804deebc18155101429eae7c884e7235504",
    "width": 1536,
    "height": 1024,
    "bytes": 1385842,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-resurrection-newborn-v2.png",
    "sha256": "60350fb7a6097a4986dea51b2b4211d6cddac065dc4df8753e22af3a244eb3fd",
    "width": 1536,
    "height": 1024,
    "bytes": 1114319,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/creature-romulus-offspring.png",
    "sha256": "56e0a9200983dff0591fdd3dd9bce0d48d70c7b6f69f9720166ed21186e60eaf",
    "width": 1536,
    "height": 1024,
    "bytes": 1153748,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/fte-pathogen-brute-profile-v13.png",
    "sha256": "88ecdfbbbf8cf6e64aa210a646174e1989f675794561b5c0198df857733e992a",
    "width": 1536,
    "height": 1024,
    "bytes": 1982065,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/fte-pathogen-popper-profile-v13.png",
    "sha256": "2814abceca3840aa8a9e57595369e29a10864350c40a6e0d65c4fa0e24cd9bea",
    "width": 1585,
    "height": 992,
    "bytes": 1451664,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/fte-pathogen-queen-right-v13.png",
    "sha256": "fc89279a6f535760115052b5efd33935ab7ec4c4f974bdd865fbba6cda409827",
    "width": 1536,
    "height": 1024,
    "bytes": 2141114,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/fte-pathogen-runner-nodules-v13.png",
    "sha256": "4cdadb4fd4a9592c4015e931cf43593a40673eb55e068842a399f0db2a68732f",
    "width": 1672,
    "height": 941,
    "bytes": 1200334,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/fte-pathogen-stalker-profile-v13.png",
    "sha256": "31d64b37d7e8321e968ec2c4765386d289020969dff101cb2e6ec066d3f8221b",
    "width": 1536,
    "height": 1024,
    "bytes": 2302487,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/kenner-gorilla.png",
    "sha256": "262fbfcedf22db9973c99aa925c5b98bfeeffc57680efb61d7f66e917dff1602",
    "width": 1536,
    "height": 1024,
    "bytes": 2099223,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/neca-panther-kenner-tribute-v14.png",
    "sha256": "e9656951a04ad058bcd17ee80a829e7c201f0067aa18341a9120fdfc89c52b52",
    "width": 1536,
    "height": 1024,
    "bytes": 2344331,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/neca-rhino-kenner-orange-v14.png",
    "sha256": "9b46647433f09dc4c0e9494396ab4773472c2e0e6933ad2096e22ae4aaf13b85",
    "width": 1536,
    "height": 1024,
    "bytes": 2280225,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/neca-rhino-kenner-version2-blue-v14.png",
    "sha256": "bd955bec16dc7c4fb8d3502268109b02fa13efcc46ea76dbf83844958d6fcd91",
    "width": 1536,
    "height": 1024,
    "bytes": 2341741,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/neca-snake-series13-v14.png",
    "sha256": "3d2ffa2d4e41238b35f7f007f0490e195b54677b1dda1867106264acbe3fbb46",
    "width": 1122,
    "height": 1402,
    "bytes": 1239402,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/game-working-joe-hazard.png",
    "sha256": "15f264d12367d9bc3377839864ade8e9eb502126f16fc58bff832456ceec8b07",
    "width": 1024,
    "height": 1536,
    "bytes": 1349950,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/game-working-joe-standard.png",
    "sha256": "012742134db3e9844a9f3152cd5ef4bec5fd5fac26391a41aae75833a3503fc6",
    "width": 1024,
    "height": 1536,
    "bytes": 1216747,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/prometheus-engineer-chair-suit-v16.png",
    "sha256": "8c39f9677bd34a97ff3e64e8189c9c31dcbea8b34d792f5372312d340d8da743",
    "width": 1024,
    "height": 1536,
    "bytes": 1484005,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/enemies/game-combat-synthetic-avp2.png",
    "sha256": "152450addbfcb4bdd7e8ec35c7c1f43a465d51056028551b26261090cb091ed6",
    "width": 1024,
    "height": 1536,
    "bytes": 1343424,
    "kind": "enemy"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-001-ellen-ripley.png",
    "sha256": "d779c8e68934dcf7909ac1e9ffc33053046d334fcbf5f84eeebe8c93fd80c040",
    "width": 1254,
    "height": 1254,
    "bytes": 484542,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-002-hope.png",
    "sha256": "f2418217761e692d15a2a12b6e4ed7ab7aaa8ea085e56193181b9761470bc30d",
    "width": 1254,
    "height": 1254,
    "bytes": 493172,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-003-lorraine-hawkes.png",
    "sha256": "8dc7b104503176a69e4370efa4e28a0e4186474ff9c881c6753c65fb7e221378",
    "width": 1254,
    "height": 1254,
    "bytes": 662720,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-004-julie.png",
    "sha256": "74beb617732b14ae6a7179fcb96053c68b2daf2c27ad45613be9b6f062e54cd1",
    "width": 1254,
    "height": 1254,
    "bytes": 482061,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-007-chris-hooper.png",
    "sha256": "e6809c731d22ab1b1fd3757e7ecff699edd6ec9372fd41c1632928304923d79e",
    "width": 1254,
    "height": 1254,
    "bytes": 624534,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-008-anne-jorden.png",
    "sha256": "1486a8b9d63f13031c245c2724048b58cd1f3a2fc3014ae7fcb18ecb78244a49",
    "width": 1254,
    "height": 1254,
    "bytes": 565040,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-009-russell-russ-jorden.png",
    "sha256": "4890ca4206d3838f8940761a8cabe00311b8203365cae694e80b7719b0168b9e",
    "width": 1254,
    "height": 1254,
    "bytes": 514894,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-010-alan-decker.png",
    "sha256": "153cbbf73344545d275d3dc7930cbe356089050f22450261c55a7b1b2a398f07",
    "width": 1254,
    "height": 1254,
    "bytes": 601668,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-011-ellen-ripley.png",
    "sha256": "655e91fc54e7189c04622c0fca07e6c56edc6d8b4144b0983da639b86d56a859",
    "width": 1254,
    "height": 1254,
    "bytes": 524051,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-012-lorraine-hawkes.png",
    "sha256": "2f90c747804829284c6e28254fb1786ec6d03e5ae542e04aac3a9b34572555ba",
    "width": 1254,
    "height": 1254,
    "bytes": 718410,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-015-chris-hooper.png",
    "sha256": "e18ef54130829b5126ebffeb617154d48ed5c8cd091d888f8ecc1b7476b253b4",
    "width": 1254,
    "height": 1254,
    "bytes": 649800,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-016-anne-jorden.png",
    "sha256": "36db750994178abefe23f1e64100038827545b79dc1df322f5cbc88cfd1897c4",
    "width": 1254,
    "height": 1254,
    "bytes": 545748,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-017-alan-decker.png",
    "sha256": "9a5051c75320cfd3aa283b4eebeaf8d10817d4a9307830f86d4f764482433220",
    "width": 1254,
    "height": 1254,
    "bytes": 573795,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-018-andrea-rollins.png",
    "sha256": "a21fd8f5c1decce5dc611811540223561643f56ae55f9316cacc850f92a143da",
    "width": 1254,
    "height": 1254,
    "bytes": 384210,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-021-ellen-ripley.png",
    "sha256": "9662ee632877057e3f771f56aa70ea4b04d5798805fcc0c31a8e5a3271041349",
    "width": 1254,
    "height": 1254,
    "bytes": 452316,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-022-hope.png",
    "sha256": "26a87042d8da4bd14ad675bbe17dba8d00f23e8058c93ecac410f74d5b68c64c",
    "width": 1254,
    "height": 1254,
    "bytes": 526388,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-023-lorraine-hawkes.png",
    "sha256": "c4a62705580580b02fd5a0ab6fa2837759ba666cc824790ddeeae06535673566",
    "width": 1254,
    "height": 1254,
    "bytes": 663668,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-027-anne-jorden.png",
    "sha256": "dcba02c2748c6883bf212b2c27b5914cbb54261548d4eda694611e408a63d0fa",
    "width": 1254,
    "height": 1254,
    "bytes": 633622,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-028-chris-hooper.png",
    "sha256": "28d20da57f65dc9f7588a1a37308db6a7c72ea25b6338fe79623852400d7a24a",
    "width": 1254,
    "height": 1254,
    "bytes": 711094,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-029-alan-decker.png",
    "sha256": "948ac9e119747fd2fd1fe5eb759be441f1d31ae930d7bbd6edbeeaa03ce1baa2",
    "width": 1254,
    "height": 1254,
    "bytes": 506567,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-031-ward.png",
    "sha256": "7712e46aed322689c6a78a6f3f0c847b9010e27ee3184b6a039afc3755baa22f",
    "width": 1254,
    "height": 1254,
    "bytes": 541761,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-032-albrecht.png",
    "sha256": "fac83ebe20585cc55cc4d32516c9b109a08e63e1777d82a54b85037ed85ccf26",
    "width": 1254,
    "height": 1254,
    "bytes": 603889,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-033-nass.png",
    "sha256": "52aca7b9bc5835869ee4156da6f2c74c7fcef7841880c4161457b1069ae28318",
    "width": 1254,
    "height": 1254,
    "bytes": 567437,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-034-julie.png",
    "sha256": "31a598a6d33a7a0e85e446f649b14df9184775ace5edd139d5a9c0e5fbf46974",
    "width": 1254,
    "height": 1254,
    "bytes": 663278,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-035-hannah.png",
    "sha256": "369a17f070933d776e49c8a44d911ad0660fb27f8cefd0eb995cf8cc0efa1cdf",
    "width": 1254,
    "height": 1254,
    "bytes": 583016,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-036-mari.png",
    "sha256": "1bcd03326044c2a353853d86bf71ed41b756607e545fa9962ffe7b7dce24ab89",
    "width": 1254,
    "height": 1254,
    "bytes": 552268,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-037-alec.png",
    "sha256": "23f3098c3e40047e0d9f04d3ec1a1ce0ed16a8c14db254fc7956f5b96c594ae1",
    "width": 1254,
    "height": 1254,
    "bytes": 622266,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-038-sturgis.png",
    "sha256": "56b5a6acdeefeccc7d697b3cd754ebefbd295f1ee26de0d114db8f64ce7cb153",
    "width": 1254,
    "height": 1254,
    "bytes": 704029,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-039-rolly.png",
    "sha256": "af317659feeb70196abf59a2d8fe6f98bcad179e2c668a7225d4cf5e712ec2ad",
    "width": 1254,
    "height": 1254,
    "bytes": 597462,
    "kind": "documentary"
  },
  {
    "path": "assets/user/drive-v123/personnel/drive-v123-041-maggie.png",
    "sha256": "fcc7aec2cd4829fcc5aba9772d0d7a410a07d6463d8b77a82f951803e491916a",
    "width": 1536,
    "height": 1024,
    "bytes": 1738895,
    "kind": "documentary"
  }
].map(Object.freeze));
export const PUBLIC_RUNTIME_MODULE_PATHS_V123 = Object.freeze([
  'src/enemy-drive-imports-v123.js',
  'src/personnel-drive-data-v123.js','src/personnel-drive-visuals-v123.js','src/personnel-drive-ui-v123.js'
]);
export const PUBLIC_MEDIA_DIRECTORIES_V123 = Object.freeze([
  'assets/user/drive-v123','assets/user/drive-v123/enemies','assets/user/drive-v123/personnel'
]);
const paths=new Set(PUBLIC_MEDIA_FILES_V123.map(file=>file.path));
const directories=new Set(PUBLIC_MEDIA_DIRECTORIES_V123);
const modules=new Set(PUBLIC_RUNTIME_MODULE_PATHS_V123);

export function publicReleasePathAdmissionV123(path,{directory=false}={}) {
  if(typeof path!=='string' || !path || path.includes('\\') || path.startsWith('/')
    || path.split('/').some(part=>!part || part==='.' || part==='..')) return false;
  if(/^assets\/user\/drive-v123(?:\/|$)/i.test(path))
    return directory ? directories.has(path) : paths.has(path);
  if(modules.has(path) || path==='scripts/public-release-admissions-v123.mjs') return !directory;
  if(/^(?:docs|src|scripts)\//i.test(path)
    && path.split('/').slice(1).some(part=>/v123(?:[^0-9]|$)/i.test(part))) return false;
  return null;
}

async function checkedBytes(root,filename) {
  let current=root; const parts=filename.split('/');
  for(const [index,part] of parts.entries()) {
    current=join(current,part); const stat=await lstat(current);
    assert.equal(stat.isSymbolicLink(),false,filename);
    assert.equal(index===parts.length-1 ? stat.isFile() : stat.isDirectory(),true,filename);
  }
  return readFile(current);
}
export async function verifyPublicAdmissionsV123(projectRoot,{strict=false}={}) {
  const root=resolve(projectRoot);
  assert.equal((await lstat(root)).isSymbolicLink(),false);
  assert.equal(ENEMY_DRIVE_IMPORTS_V123.length,32,'A contract fixture is not shipping content');
  assert.equal(PERSONNEL_DRIVE_VISUALS_V123.length,30);
  assert.equal(paths.size,62);
  assert.equal(new Set(PUBLIC_MEDIA_FILES_V123.map(file=>file.sha256)).size,62,'No duplicate source bytes admitted');
  for(const file of PUBLIC_MEDIA_FILES_V123) {
    const profile=(file.kind==='enemy' ? ENEMY_DRIVE_IMPORTS_V123 : PERSONNEL_DRIVE_VISUALS_V123)
      .find(entry=>entry.path===`/${file.path}`);
    assert.ok(profile,`Unowned V123 media: ${file.path}`);
    assert.equal(profile.sha256,file.sha256);
    if(file.kind==='enemy') {
      assert.equal(profile.reviewStatus,'accepted-static-adaptation');
      assert.equal(profile.frames,1); assert.equal(profile.canonExact,false);
      assert.equal(profile.animationStatus,'missing');
      assert.equal(profile.automaticEncounter,false);
      assert.ok(profile.legacyCounterpartId && profile.id!==profile.legacyCounterpartId);
      assert.equal(profile.pivot.y*profile.sourceHeight,profile.alphaBounds[3]);
    } else {
      assert.equal(profile.admission,'documentary-reference-only');
      assert.equal(profile.playable,false);
      assert.equal(profile.originalPixelsModified,false);
      assert.equal(profile.fidelity,'not-certified-1:1');
    }
    const bytes=await checkedBytes(root,file.path);
    assert.equal(bytes.length,file.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
    assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[file.width,file.height]);
    if(file.kind==='enemy') {
      const audit=await auditWeaponPngV120(join(root,file.path));
      assert.deepEqual(audit.alphaBounds,profile.alphaBounds);
      assert.equal(audit.alphaBoundsThreshold,profile.alphaBoundsThreshold);
      assert.ok(audit.transparentPixels>0);
      assert.ok(audit.edgeAlphaMax<16,'Opaque native cutout touches the canvas');
    }
  }
  for(const filename of PUBLIC_RUNTIME_MODULE_PATHS_V123) {
    const bytes=await checkedBytes(root,filename);
    assert.doesNotMatch(bytes.toString('utf8'),/(?:drive\.google\.com|docs\.google\.com|chatgpt\.com|https?:\/\/[^\s]*[?&](?:token|auth|signature)=|[A-Z]:[\\/](?:Users|CodexWork))/i,'Private source data in a public module');
  }
  if(strict) {
    for(const folder of ['assets/user/drive-v123/enemies','assets/user/drive-v123/personnel']) {
      for(const entry of await readdir(join(root,folder),{withFileTypes:true})) {
        assert.equal(entry.isSymbolicLink(),false); assert.equal(entry.isFile(),true);
        assert.ok(paths.has(`${folder}/${entry.name}`),`Unapproved media: ${entry.name}`);
      }
    }
    const top=await readdir(join(root,'assets/user/drive-v123'));
    assert.deepEqual(top.sort(),['enemies','personnel']);
    async function checkPublicTree(folder) {
      let entries; try { entries=await readdir(join(root,folder),{withFileTypes:true}); }
      catch(error) { if(error.code==='ENOENT')return; throw error; }
      for(const entry of entries) {
        const path=`${folder}/${entry.name}`;
        assert.equal(entry.isSymbolicLink(),false,path);
        assert.notEqual(publicReleasePathAdmissionV123(path,{directory:entry.isDirectory()}),false,`Unapproved V123 source: ${path}`);
        if(entry.isDirectory()) await checkPublicTree(path);
      }
    }
    for(const folder of ['docs','src']) await checkPublicTree(folder);
  }
  return {ok:true,enemyStaticVariants:32,documentaryOriginals:30,animationsAdded:0,exactCertified:0};
}
