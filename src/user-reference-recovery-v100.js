/**
 * Documentary recovery, not a combat admission. The seventeen JPEG concepts
 * retain their source backgrounds/cropping; no generation or cutout is implied.
 * Smasher/Chrysalis preserve the original supplied art as selectable Altered
 * dossiers without changing the active V92/V93 revisions or their save IDs.
 */
const CONCEPT_ROWS = [
  [9, 'reference-composite-09', 'Planche biomécanique composite — référence 09', 'Gemini_Generated_Image_5371if5371if5371.jpg', '8979c38d6fb8bf3069b4fb18a2a33c319b1ab0cb6436cf2bfb09f784550e0d21', 1410888, 2528, 1688, 'unknown'],
  [10, 'bipede-biomecanique-brun-10', 'Bipède biomécanique brun — référence 10', 'Gemini_Generated_Image_53feyo53feyo53fe.jpg', '7e4b9615fe19c2f5fac950955e6403579af9834f09a30c9a49b56b100d0296d2', 1803133, 1920, 2202, 'unknown'],
  [35, 'neomorph-neomorph', 'Neomorph — référence utilisateur', 'Neomorph-Neomorph.jpg', '84a92f198168968a42ba683cb7684222219770420dbf35e834c5624ac32d0fc3', 1667729, 2048, 2048, 'pathogen'],
  [39, 'xeno-abobimantion', 'Xeno abobimantion — nom fourni', 'Xeno abobimantion.jpg', '5417b7bd8d2fd81375d39081a5e2918de12d1aa1a8f3b61190bf3a6ddd802a35', 1879009, 2088, 2048, 'xenomorph'],
  [41, 'xeno-big-xeno-2', 'Big Xeno — pose 2 de référence', 'Xeno Big Xeno 2.jpg', 'c03df8287334047365c92962bf48b509195867da4aa9cf84feae9946a84503ab', 2766614, 2272, 1884, 'xenomorph'],
  [42, 'xeno-bruiser-mecha', 'Xeno Bruiser Mecha — référence', 'Xeno Bruiser Mecha.jpg', '1fd2fb070f8dd2985e29ba169e0d709d4acb81e83d3b7ed6843055d5b3453d1c', 2390588, 2730, 1536, 'synthetic'],
  [46, 'xeno-serpentin-46', 'Xeno serpentin — référence 46', 'Xeno-.jpg', 'b7d4bae4e0d71e9fa1eef15cc657b5fac271d1cf789f5a4a246b3add0839b550', 1990614, 2724, 1568, 'xenomorph'],
  [51, 'xeno-carrier-empty', 'Carrier — état vide de référence', 'Xeno-Carrier--Empty.jpg', '46772db9d0583aa073a6ae31b6c92f14e36504ef283f2af4825b37bf9baae02d', 1849771, 1792, 2334, 'xenomorph'],
  [57, 'xeno-drone-variante', 'Drone — variante de référence', 'Xeno-Drone-Variante.jpg', '4b7b51751bec1d4d2a435663d92e47282be582e25956f35fffdaaadd7eefeb01', 1685317, 2816, 1536, 'xenomorph'],
  [58, 'xeno-experiment-3headed', 'Xeno Experiment 3Headed — référence', 'Xeno-Experiment-3Headed.jpg', 'afc27cd9c5be630992a0f3c410edf1ec666d6af4590b8244091dc031227e3fd8', 2457216, 1842, 2304, 'xenomorph'],
  [62, 'xeno-experiment-xeno3head', 'Xeno Experiment Xeno3Head — référence', 'Xeno-Experiment-Xeno3Head.jpg', '900d8fe0bdfa6a36f844368165858350ef08f7dd5b0b609f5355c7a59e9c3130', 2116292, 2816, 1536, 'xenomorph'],
  [65, 'xeno-necromorph', 'Xeno Necromorph — nom fourni', 'Xeno-Necromorph.jpg', '7b9d8a643c6e8eabd426e449efa77eab91497911d46a983b055541ba29443553', 2514204, 1888, 2258, 'xenomorph'],
  [67, 'xeno-praetorian-1', 'Praetorian 1 — référence utilisateur', 'Xeno-Praetorian-1.jpg', '28b3bf594635ba182069993bc7526b926689fe98a8f7b1bf96f2d0a21467f3fa', 1952360, 2048, 2106, 'xenomorph'],
  [68, 'xeno-prowler', 'Prowler — référence utilisateur', 'Xeno-Prowler.jpg', '0649aa74b486e3db61c72abb20417019f42648c584cec6106f425f9b46e2ba28', 2108930, 1792, 2376, 'xenomorph'],
  [71, 'xeno-snake', 'Xeno Snake — référence utilisateur', 'Xeno-Snake.jpg', 'a072aa9baca449589fca1d5f36de53ba43264daba60652f7273755e98d05781f', 2011815, 1792, 2342, 'xenomorph'],
  [72, 'xeno-soldier-brown', 'Xeno Soldier Brown — référence', 'xeno-Soldier-Brown.jpg', '92ca6528eef327589717e3a5c0ec43be8cfd8b3b230fccbb1c44c2c5abfd1353', 2039108, 2816, 1536, 'xenomorph'],
  [74, 'xeno-spitter', 'Spitter — référence utilisateur', 'Xeno-Spitter.jpg', 'a3cbd57bc25e87dc7f9e9ff431023fb07c3f15c2a703c82c49e543116965cdd8', 1674166, 2016, 2142, 'xenomorph']
];

const NATIVE_REFUSALS = new Set([9, 10, 35, 39, 41, 42, 46, 51, 58, 62, 68]);
const common = Object.freeze({
  kind: 'concept', combatReady: false, automaticEncounter: false,
  selectable: true, selectionScope: 'reference-library',
  visualMode: 'static-reference', animationStatus: 'missing',
  canonExact: false, identityVerified: false, backgroundPreserved: true,
  sourceProvenance: 'user-provided', provenance: 'user-provided-source-unaltered'
});

const concepts = CONCEPT_ROWS.map(([legacySourceNumber, slug, name, sourceFile, sourceSha256,
  sourceBytes, sourceWidth, sourceHeight, biology]) => Object.freeze({
  ...common, id: 'reference-v100-recovery-' + slug, name,
  sourceFile, sourceSha256, sourceBytes, sourceWidth, sourceHeight,
  // This is relative provenance, never a user's private local filesystem path.
  sourcePath: 'AlienTentalusAintergrer/' + sourceFile,
  path: '/assets/user/recovery-v100/' + slug + '.jpg', sourceFormat: 'JPEG',
  biology, classificationBasis: biology === 'unknown' ? 'unidentified-reference' : 'qualified-user-label',
  lineage: [58, 62].includes(legacySourceNumber) ? 'experiment' : null,
  alteredOf: legacySourceNumber === 41 ? 'pose-v95-user-xeno-big-xeno-1'
    : legacySourceNumber === 51 ? 'pose-v95-user-xeno-carrier' : null,
  relationship: legacySourceNumber === 41 ? 'alternate-pose'
    : legacySourceNumber === 51 ? 'alternate-state' : 'unresolved-user-reference',
  legacySourceNumber, composite: legacySourceNumber === 9,
  visualStatus: 'source-concept-unaltered',
  previousAdmissionStatus: NATIVE_REFUSALS.has(legacySourceNumber)
    ? 'held-moderation' : 'held-prior-moderation-scope-review',
  reason: legacySourceNumber === 9
    ? 'Planche composite conservée entière, repère humain inclus ; identité non confirmée. Aucun sprite de combat admis après le refus historique du générateur.'
    : NATIVE_REFUSALS.has(legacySourceNumber)
      ? 'Référence originale conservée, fond et cadrage inclus. Aucun sprite de combat admis après le refus historique du générateur ; aucune nouvelle génération effectuée.'
      : 'Référence originale conservée, fond et cadrage inclus. Ancienne retenue de prudence dans un périmètre de génération déjà refusé ; aucune nouvelle génération ni admission de combat.'
}));

const originals = [
  ['smasher', 'Smasher', 'game_avp_capcom_smasher.png', '962806005136e2b82b1741cc77b4d9938886092dbd2c05fc2c45e7b5521bc96e'],
  ['chrysalis', 'Chrysalis', 'game_avp_capcom_chrysalis.png', 'adfbb16a1a28996d4e0668b8be5c9ed66e105bd5f8e43f0e226b1deea1e46a8b']
].map(([slug, name, sourceFile, sourceSha256]) => Object.freeze({
  ...common, id: 'reference-v100-altered-' + slug, name: name + ' — Altered (original fourni)',
  sourceFile, sourceSha256, sourcePath: 'ALIENS_CASTES_FILMS_JEUX_V1/' + sourceFile,
  path: '/assets/user/castes-v87/' + sourceFile, sourceFormat: 'PNG',
  sourceWidth: 1536, sourceHeight: 1024, biology: 'xenomorph', lineage: null,
  classificationBasis: 'existing-user-caste', alteredOf: 'castes-game_avp_capcom_' + slug,
  relationship: 'retained-altered-original', visualStatus: 'original-static-pose-documentary',
  legacySourceNumber: null, composite: false, previousAdmissionStatus: 'retained-original-superseded-visual',
  reason: 'PNG utilisateur original intact, conservé comme dossier Altered sélectionnable. La révision visuelle active et les identifiants de sauvegarde existants restent inchangés ; ce dossier ne crée pas de combattant.'
}));

export const USER_REFERENCE_RECOVERY_V100 = Object.freeze([...concepts, ...originals]);
const BY_ID = new Map(USER_REFERENCE_RECOVERY_V100.map(entry => [entry.id, entry]));
export function getUserReferenceRecoveryV100(id) {
  return typeof id === 'string' ? BY_ID.get(id) || null : null;
}
