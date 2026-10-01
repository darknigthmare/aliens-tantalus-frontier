// Native transparent reconstructions of cropped user references. These are
// documentary views, not animated side-view fighters or verified canon copies.
export const USER_SPECIMEN_RECORDS_V112 = Object.freeze([
  {
    slug: 'xeno-ovomorph-red',
    referenceId: 'pack-v100-xeno-ovomorph-red',
    path: '/assets/openai/sprites/static-import-v112/xeno-ovomorph-red.png',
    sha256: '18574822af43f6ea2b2d84b73025b06789241776657fe3661ab146b0094be40d',
    sourceWidth: 1698, sourceHeight: 926,
    alphaBounds: [485, 48, 1219, 911],
    pivot: { x: 852 / 1698, y: 911 / 926 },
    sourceFacing: -1,
    reviewStatus: 'accepted-static-adaptation',
    reviewNote: 'Œuf rouge conservé en pose fixe ; bord inférieur de la base tronquée reconstruit. Silhouette entière sur alpha natif, contrôlée dans le navigateur sur blanc et noir. Adaptation non certifiée 1:1 ; aucune éclosion animée.',
    reconstruction: 'cropped-lower-root-base',
    role: 'contained-specimen',
    groupId: 'pack-v100-xeno-ovomorph-red'
  },
  {
    slug: 'xeno-titan-ovomorph-egg',
    referenceId: 'pack-v100-xeno-titan-ovomorph-egg',
    path: '/assets/openai/sprites/static-import-v112/xeno-titan-ovomorph-egg.png',
    sha256: 'e7864033dea9dd8055f93efa0380a8639a24fb92a4e2a2c977706b6e9e962245',
    sourceWidth: 1211, sourceHeight: 1299,
    alphaBounds: [66, 89, 1146, 1257],
    pivot: { x: 606 / 1211, y: 1257 / 1299 },
    sourceFacing: -1,
    reviewStatus: 'accepted-static-adaptation',
    reviewNote: 'Œuf Titan fermé conservé ; petites extrémités manquantes du socle organique reconstruites. Silhouette entière sur alpha natif, contrôlée dans le navigateur sur blanc et noir. Adaptation non certifiée 1:1 ; aucune éclosion animée.',
    reconstruction: 'cropped-root-tips',
    role: 'contained-specimen',
    groupId: 'pack-v100-xeno-titan-ovomorph-egg'
  },
  {
    slug: 'xeno-mutated-facehugger',
    referenceId: 'pack-v100-xeno-mutated-facehugger',
    path: '/assets/openai/sprites/static-import-v112/xeno-mutated-facehugger.png',
    sha256: 'b1328341c3e285cbf31262fb01504d74aaec972b8982fbc67af3745a93b74253',
    sourceWidth: 1343, sourceHeight: 1171,
    alphaBounds: [21, 13, 1334, 1139],
    pivot: { x: 677.5 / 1343, y: 1139 / 1171 },
    sourceFacing: -1,
    reviewStatus: 'accepted-static-adaptation',
    reviewNote: 'Vue ventrale fixe : huit pattes et queue entières, extrémité supérieure droite tronquée reconstruite. Les filaments translucides sont conservés ; aucune frange rouge/jaune visible dans le navigateur sur blanc ou noir. Ne remplace pas la vue latérale existante, ne constitue pas une marche de profil. Adaptation non certifiée 1:1.',
    reconstruction: 'cropped-upper-right-leg-tip',
    role: 'contained-specimen',
    groupId: 'pack-v100-xeno-mutated-facehugger'
  }
].map(record => Object.freeze({ ...record, revision: 112,
  alphaBounds: Object.freeze(record.alphaBounds), pivot: Object.freeze(record.pivot) })));
