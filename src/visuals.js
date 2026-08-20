import { V50_SPRITE_VISUALS } from './v50-visuals.js';

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
  ),
  makeAsset(
    'tantalus-hub-command-deck', 'tantalus-hub-command-deck.png', 'USS Tantalus — pont Commandement',
    'Passerelle, briefing, centre d’information tactique et cryogénie sur un sol continu.',
    { kind: 'environment', wave: 'v48', alt: 'Panorama latéral du pont Commandement du Tantalus' }
  ),
  makeAsset(
    'tantalus-hub-habitat-deck', 'tantalus-hub-habitat-deck.png', 'USS Tantalus — pont Habitat',
    'Quartiers, mess, bloc médical et laboratoire dans un niveau physique connecté.',
    { kind: 'environment', wave: 'v48', alt: 'Panorama latéral du pont Habitat du Tantalus' }
  ),
  makeAsset(
    'tantalus-hub-industrial-deck', 'tantalus-hub-industrial-deck.png', 'USS Tantalus — pont Industriel',
    'Quarantaine, armurerie, atelier et baie véhicules en coupe jouable.',
    { kind: 'environment', wave: 'v48', alt: 'Panorama latéral du pont Industriel du Tantalus' }
  ),
  makeAsset(
    'tantalus-hub-engineering-deck', 'tantalus-hub-engineering-deck.png', 'USS Tantalus — pont Ingénierie',
    'Hangar, réacteur, support-vie et capteurs reliés par le même corridor.',
    { kind: 'environment', wave: 'v48', alt: 'Panorama latéral du pont Ingénierie du Tantalus' }
  )
];

const HUB_ROOM_LIBRARY = [
  ['command-bridge', 'Passerelle modulaire', 'Salle de passerelle autonome avec sol continu et seuils latéraux.'],
  ['command-briefing', 'Briefing modulaire', 'Salle de briefing autonome, traversable et distincte de la passerelle.'],
  ['command-cic', 'CIC modulaire', 'Centre d’information tactique autonome avec équipements de fond.'],
  ['command-cryo', 'Cryogénie modulaire', 'Baie cryogénique autonome avec pods en retrait.'],
  ['habitat-quarters', 'Quartiers modulaires', 'Quartiers équipage autonomes avec couche de circulation dégagée.'],
  ['habitat-mess', 'Mess modulaire', 'Mess autonome avec mobilier au second plan.'],
  ['habitat-medical', 'Bloc médical modulaire', 'Salle médicale autonome avec route jouable lisible.'],
  ['habitat-lab', 'Laboratoire modulaire', 'Laboratoire autonome avec instruments et confinement en retrait.'],
  ['industrial-quarantine', 'Quarantaine modulaire', 'Compartiment de quarantaine autonome et traversable.'],
  ['industrial-armory', 'Armurerie modulaire', 'Armurerie autonome aux racks sécurisés.'],
  ['industrial-workshop', 'Atelier modulaire', 'Atelier autonome avec machines en fond.'],
  ['industrial-vehicle-bay', 'Baie véhicules modulaire', 'Baie de maintenance autonome sans véhicule au premier plan.'],
  ['engineering-hangar', 'Hangar modulaire', 'Hangar ingénierie autonome avec berceau vide.'],
  ['engineering-reactor', 'Réacteur modulaire', 'Chambre réacteur autonome et blindée.'],
  ['engineering-life-support', 'Support-vie modulaire', 'Salle de filtration et réservoirs autonome.'],
  ['engineering-sensors', 'Capteurs modulaires', 'Salle de traitement des capteurs autonome.']
];

export const HUB_ROOM_MODULES = HUB_ROOM_LIBRARY.map(([id, title, description]) => makeAsset(
  `hub-room-${id}`,
  `hub/rooms/${id}.png`,
  title,
  description,
  { kind: 'environment', wave: 'v49', alt: `${title} générée par OpenAI` }
));

const HUB_PARALLAX_LIBRARY = [
  ['command-far', 'Parallaxe Commandement'],
  ['habitat-far', 'Parallaxe Habitat'],
  ['industrial-far', 'Parallaxe Industriel'],
  ['engineering-far', 'Parallaxe Ingénierie']
];

export const HUB_PARALLAX_LAYERS = HUB_PARALLAX_LIBRARY.map(([id, title]) => makeAsset(
  `hub-parallax-${id}`,
  `hub/parallax/${id}.png`,
  title,
  'Couche lointaine indépendante déplacée à une vitesse différente de la salle et du premier plan.',
  { kind: 'environment', wave: 'v49', alt: `${title} générée par OpenAI` }
));

const HUB_PROP_LIBRARY = [
  ['bulkhead-door', 'Porte de cloison'], ['lift-door', 'Porte d’ascenseur'],
  ['bridge-terminal', 'Terminal passerelle'], ['briefing-table', 'Table de briefing'],
  ['cryopod', 'Cryopod'], ['bunk-module', 'Module couchettes'],
  ['mess-table', 'Table du mess'], ['medical-bed', 'Lit médical'],
  ['lab-console', 'Console laboratoire'], ['quarantine-unit', 'Unité de quarantaine'],
  ['armory-rack', 'Rack armurerie'], ['workbench', 'Établi'],
  ['vehicle-lift', 'Pont élévateur'], ['reactor-column', 'Colonne réacteur'],
  ['life-support-scrubber', 'Épurateur support-vie'], ['sensor-console', 'Console capteurs']
];

export const HUB_PROP_MODULES = HUB_PROP_LIBRARY.map(([id, title]) => makeAsset(
  `hub-prop-${id}`,
  `hub/props/${id}.png`,
  title,
  'Prop PNG transparent indépendant, extrait du master OpenAI v49 et utilisé par le niveau Canvas.',
  { kind: 'prop', wave: 'v49', alt: `${title} isolé sur fond transparent` }
));

export const SPRITE_SHEETS = [
  ...V50_SPRITE_VISUALS,
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
  makeAsset('interactive-props', 'interactive-props-animation-sheet.png', 'Props interactifs', 'Sas, sentry, terminal/réacteur et équipements de transit/quarantaine.', { kind: 'animation', grid: '4×4', frames: 16, wave: 'v47.1', alt: 'Plaque 4 par 4 des accessoires interactifs' }),
  makeAsset('tantalus-hub-crew', 'tantalus-hub-crew-animation-sheet.png', 'Équipage du hub Tantalus', 'Officier, technicien, corpsman et synthétique de service en cycles de marche.', { kind: 'animation', grid: '4×4', frames: 16, wave: 'v48', alt: 'Plaque 4 par 4 des PNJ du hub Tantalus' })
];

export const VISUAL_ASSETS = [...ENVIRONMENT_MASTERS, ...HUB_ROOM_MODULES, ...HUB_PARALLAX_LAYERS, ...HUB_PROP_MODULES, ...SPRITE_SHEETS];
export const NEW_SPRITE_SHEETS = SPRITE_SHEETS.filter((asset) => asset.wave);
export const NEW_SPRITE_FRAME_COUNT = NEW_SPRITE_SHEETS.reduce((total, asset) => total + asset.frames, 0);
