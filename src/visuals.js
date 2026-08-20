const makeAsset = (id, file, title, description, options = {}) => ({
  id,
  file: `/assets/openai/${file}`,
  title,
  description,
  provider: 'OpenAI ImageGen',
  ...options
});

export const ENVIRONMENT_MASTERS = [
  makeAsset(
    'tantalus-base-environment',
    'tantalus-base-environment.png',
    'Décors & parallax',
    'Tantalus Base en coupe latérale : pluie, vapeur, sas, ascenseur et profondeur multi-plan.',
    { kind: 'environment', alt: 'Décor industriel latéral de Tantalus Base généré par OpenAI' }
  )
];

export const SPRITE_SHEETS = [
  makeAsset('echo9-master', 'echo9-sprite-sheet.png', 'Echo-9 — master historique', 'Marine et synthétique : déplacement, visée, tir, rechargement, conduit et dégâts.', { kind: 'animation', grid: '8×8', frames: 64, legacy: true, alt: 'Plaque historique des animations Echo-9' }),
  makeAsset('xenomorph-master', 'xenomorph-sprite-sheet.png', 'Xénomorphes — master historique', 'Cycle de vie, castes adultes, attaques acides, formes lourdes et Reine.', { kind: 'animation', grid: '8×8', frames: 64, legacy: true, alt: 'Plaque historique des animations xénomorphes' }),
  makeAsset('arsenal-props-master', 'arsenal-props-atlas.png', 'Arsenal & props — master historique', 'Armes, équipements, terminaux, portes, sentry et silhouettes de véhicules.', { kind: 'atlas', grid: '8×6', frames: 48, legacy: true, alt: 'Atlas historique des armes accessoires et véhicules' }),
  makeAsset('echo9-classes', 'echo9-classes-animation-sheet.png', 'Classes Echo-9', 'Commandement, smartgunner, ingénierie/démolition et corpsman/xénobiologie.', { kind: 'animation', grid: '4×4', frames: 16, wave: 'v47.1', alt: 'Plaque 4 par 4 des classes jouables Echo-9' }),
  makeAsset('human-factions', 'human-factions-animation-sheet.png', 'Factions humaines', 'USCM, commandos corporatistes, UPP/Seegson et survivants Crucible/ATARAX.', { kind: 'animation', grid: '4×4', frames: 16, wave: 'v47.1', alt: 'Plaque 4 par 4 des factions humaines' }),
  makeAsset('synthetic-androids', 'synthetic-android-animation-sheet.png', 'Synthétiques & androïdes', 'Synthétique de terrain, unité utilitaire, synthétique de combat et état endommagé.', { kind: 'animation', grid: '4×4', frames: 16, wave: 'v47.1', alt: 'Plaque 4 par 4 des synthétiques et androïdes' }),
  makeAsset('pathogen-fauna', 'pathogen-fauna-animation-sheet.png', 'Pathogènes & faune locale', 'Lignées néomorphe/deacon, abomination pathogène et faune de la Frontière.', { kind: 'animation', grid: '4×4', frames: 16, wave: 'v47.1', alt: 'Plaque 4 par 4 des créatures pathogènes et de la faune locale' }),
  makeAsset('neuro-xeno', 'neuro-xeno-animation-sheet.png', 'Neuro-Xeno & castes étendues', 'Red Hive, K-Series, Xenoborg/Ripper et contrôleurs ATARAX.', { kind: 'animation', grid: '4×4', frames: 16, wave: 'v47.1', alt: 'Plaque 4 par 4 des castes Neuro-Xeno' }),
  makeAsset('vehicles', 'vehicle-animation-sheet.png', 'Véhicules & châssis', 'Power loader, APC, dropship et rover/submersible : mouvement, action et dégâts.', { kind: 'animation', grid: '4×4', frames: 16, wave: 'v47.1', alt: 'Plaque 4 par 4 des véhicules animés' }),
  makeAsset('combat-vfx', 'combat-vfx-animation-sheet.png', 'Effets de combat', 'Tirs, flammes, acide, explosions, fumée et étincelles sur couches séparées.', { kind: 'vfx', grid: '4×4', frames: 16, wave: 'v47.1', alt: 'Plaque 4 par 4 des effets de combat' }),
  makeAsset('interactive-props', 'interactive-props-animation-sheet.png', 'Props interactifs', 'Sas, sentry, terminal/réacteur et équipements de transit/quarantaine.', { kind: 'animation', grid: '4×4', frames: 16, wave: 'v47.1', alt: 'Plaque 4 par 4 des accessoires interactifs' })
];

export const VISUAL_ASSETS = [...ENVIRONMENT_MASTERS, ...SPRITE_SHEETS];
export const NEW_SPRITE_SHEETS = SPRITE_SHEETS.filter((asset) => asset.wave === 'v47.1');
export const NEW_SPRITE_FRAME_COUNT = NEW_SPRITE_SHEETS.reduce((total, asset) => total + asset.frames, 0);
