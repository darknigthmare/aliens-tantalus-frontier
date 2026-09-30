import { ENEMY_IMPORT_ADMISSIONS_V105 } from './enemy-import-admissions-v105.js';
import { ENEMY_IMPORT_ADMISSIONS_V106 } from './enemy-import-admissions-v106.js';

/** Reviewed native PNGs only. Documentary imports and unsuccessful generations
 * never enter this list. Source files and their V100 identities stay unchanged. */
export const ENEMY_IMPORT_ADMISSIONS_V103 = Object.freeze([
  Object.freeze({
    slug: 'synth-workingjoe-classic',
    referenceId: 'pack-v100-synth-workingjoe-classic',
    path: '/assets/openai/sprites/static-import-v103/synth-workingjoe-classic.png',
    sourceWidth: 1671, sourceHeight: 941,
    sha256: 'c22e85f1bce901d74cd62f5616413ba0d1d365a354e3b5d601eb8d1c9a37f422',
    alphaBounds: Object.freeze([766, 19, 941, 928]),
    pivot: Object.freeze({ x: 854 / 1671, y: 928 / 941 }),
    sourceFacing: -1, reviewStatus: 'accepted-static-adaptation',
    reviewNote: 'Profil entier étroit conforme au dessin fourni ; grandes marges transparentes natives conservées, sans étirement horizontal.'
  }),
  Object.freeze({
    slug: 'synth-workingjoe-battle',
    referenceId: 'pack-v100-synth-workingjoe-battle',
    path: '/assets/openai/sprites/static-import-v103/synth-workingjoe-battle.png',
    sourceWidth: 1024, sourceHeight: 1536,
    sha256: '0d48c1824ae9fc62ec15fc62fa47e8ce48386c2482604e6be5af5aee8aaa53d9',
    alphaBounds: Object.freeze([332, 24, 726, 1494]),
    pivot: Object.freeze({ x: 508 / 1024, y: 1494 / 1536 }),
    sourceFacing: -1, reviewStatus: 'accepted-static-adaptation',
    reviewNote: 'Silhouette entière en tenue renforcée, mains abaissées ; détails de visage et petites inscriptions adaptés. Frange alpha très faible conservée dans le PNG natif.'
  }),
  Object.freeze({
    slug: 'synth-workingjoe-hazmat',
    referenceId: 'pack-v100-synth-workingjoe-hazmat',
    path: '/assets/openai/sprites/static-import-v103/synth-workingjoe-hazmat.png',
    sourceWidth: 1024, sourceHeight: 1536,
    sha256: '7aa651cff7b40f0b146a7643ec49e9b7949af276152ea8719431de3b8b2533e7',
    alphaBounds: Object.freeze([230, 16, 833, 1506]),
    pivot: Object.freeze({ x: 566 / 1024, y: 1506 / 1536 }),
    sourceFacing: 1, reviewStatus: 'accepted-static-adaptation',
    reviewNote: 'Référence couchée réinterprétée debout, tenue orange et outil industriel entiers ; plis, outil et petits détails adaptés. Orientation native vers la droite.'
  }),
  Object.freeze({
    slug: 'synth-workingjoe-tactical',
    referenceId: 'pack-v100-synth-workingjoe-tactical',
    path: '/assets/openai/sprites/static-import-v103/synth-workingjoe-tactical.png',
    sourceWidth: 1024, sourceHeight: 1535,
    sha256: '50d2e6fecdaf64c7bdf8632431dfb0e85ccfed12b1452f5cca42fe805b85fc0c',
    alphaBounds: Object.freeze([266, 34, 772, 1517]),
    pivot: Object.freeze({ x: 505 / 1024, y: 1517 / 1535 }),
    sourceFacing: -1, reviewStatus: 'accepted-static-adaptation',
    reviewNote: 'Silhouette entière avec lunettes, sac et terminal de poignet ; arme maintenue dans son étui. Petites inscriptions adaptées, hauteur native inhabituelle de 1535 pixels conservée.'
  }),
  Object.freeze({
    slug: 'xeno-blueluminescent-drone',
    referenceId: 'pack-v100-xeno-blueluminescent-drone',
    path: '/assets/openai/sprites/static-import-v103/xeno-blueluminescent-drone.png',
    sourceWidth: 1021, sourceHeight: 1540,
    sha256: '0538301caab64c8f4269782d465d08f54d778f1718e83ac0bf06e72aa8e8f46c',
    alphaBounds: Object.freeze([176, 40, 978, 1495]),
    pivot: Object.freeze({ x: .58, y: 1495 / 1540 }),
    sourceFacing: -1, reviewStatus: 'accepted-static-adaptation',
    reviewNote: 'Silhouette et queue entières, pose latérale conservée ; bleu plus saturé et contrasté que la référence. Franges très peu opaques natives conservées.'
  }),
  Object.freeze({
    slug: 'xeno-blueluminescent-queen',
    referenceId: 'pack-v100-xeno-blueluminescent-queen',
    path: '/assets/openai/sprites/static-import-v103/xeno-blueluminescent-queen.png',
    sourceWidth: 1021, sourceHeight: 1540,
    sha256: '68213cbc38e12efe1025ca89b3fd33f2348a82a53a37e062da651e8ba3655a69',
    alphaBounds: Object.freeze([127, 29, 1013, 1516]),
    pivot: Object.freeze({ x: .55, y: 1516 / 1540 }),
    sourceFacing: -1, reviewStatus: 'accepted-static-adaptation',
    reviewNote: 'Crête, grands bras, petits bras thoraciques et queue entiers ; bleu plus saturé et contrasté que la référence. Marge visible droite de 8 pixels, sans coupure de silhouette.'
  })
]);

/** Presentation viewport only: the href is always the admitted native PNG.
 * SVG viewBox removes unused display margins without raster editing, stretching,
 * synthesizing pixels or promoting any unaccepted documentary reference. */
export function renderEnemyImportPreviewV103(visual, label = '', height = '100%') {
  const art = getEnemyImportArtV103(visual?.path);
  if (!art) return null;
  const [left, top, right, bottom] = art.alphaBounds;
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const accessibility = label ? `role="img" aria-label="${escape(label)}"` : 'aria-hidden="true"';
  return `<svg xmlns="http://www.w3.org/2000/svg" data-import-preview-v103="${art.slug}" ${accessibility} viewBox="${left} ${top} ${right - left} ${bottom - top}" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:${escape(height)};overflow:hidden;pointer-events:none"><image href="${art.path}" width="${art.sourceWidth}" height="${art.sourceHeight}"/></svg>`;
}

export function getEnemyImportArtV103(path) {
  return [...ENEMY_IMPORT_ADMISSIONS_V103, ...ENEMY_IMPORT_ADMISSIONS_V105, ...ENEMY_IMPORT_ADMISSIONS_V106]
    .find(entry => entry.path === path) || null;
}
