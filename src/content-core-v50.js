export const RELEASE = Object.freeze({
  name: 'ALIENS: TANTALUS FRONTIER',
  version: '50.0.0',
  subtitle: 'Metroidvania Level & Normalized OpenAI Sprite Runtime',
  year: 2204,
  sourceVersion: '46.0.0'
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const slug = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const hash = (input) => {
  let value = 2166136261;
  for (const char of input) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
};

const pick = (list, index, salt = 0) => list[(index * 7 + salt * 11) % list.length];
const tier = (index) => 1 + (index % 5);
const rarity = (index) => ['common', 'uncommon', 'rare', 'prototype', 'unique'][index % 5];

export const FACTIONS = Object.freeze([
  { id: 'uscm', name: 'United States Colonial Marine Corps', stance: 'allied', color: '#8fb88c' },
  { id: 'weyland-yutani', name: 'Weyland-Yutani', stance: 'volatile', color: '#d6bd72' },
  { id: 'seegson', name: 'Seegson', stance: 'neutral', color: '#d67e55' },
  { id: 'upp', name: 'Union of Progressive Peoples', stance: 'rival', color: '#bb6666' },
  { id: 'colonists', name: 'Frontier Colonies', stance: 'allied', color: '#77b9c5' },
  { id: 'cult', name: 'Children of the Perfected Host', stance: 'hostile', color: '#ab74bd' },
  { id: 'hyperdyne', name: 'Hyperdyne Systems', stance: 'volatile', color: '#75a9cf' },
  { id: 'atarax', name: 'ATARAX Directorate', stance: 'hostile', color: '#cf6d7e' },
  { id: 'crucible', name: 'Crucible Salvage Compact', stance: 'volatile', color: '#c99c64' },
  { id: 'red-hive', name: 'Red Hive', stance: 'hostile', color: '#ca4c42' },
  { id: 'k-series', name: 'K-Series Brood', stance: 'hostile', color: '#d7c94e' },
  { id: 'echo-9', name: 'Echo-9', stance: 'player', color: '#82d8a0' }
]);

const worldSeeds = [
  ['Acheron / LV-426', 'Zeta II Reticuli', 'Hadley’s Hope, processeur atmosphérique et Derelict', 'screen-canon'],
  ['LV-223', 'Zeta II Reticuli', 'temples des Ingénieurs et biologie Pathogen', 'screen-canon'],
  ['Fiorina 161', 'Neroidia', 'fonderie carcérale et tunnels', 'screen-canon'],
  ['Sevastopol', 'KG-348', 'station commerciale en désintégration', 'licensed-continuity'],
  ['Lethe', 'Cerberus', 'Dead Hills, Olduvai, Pharos et Tantalus Base', 'licensed-continuity'],
  ['LV-895', 'Outer Veil', 'colonies, ruines et installations Pala', 'licensed-continuity'],
  ['Katanga', 'Frontier Line', 'raffinerie orbitale infestée', 'licensed-continuity'],
  ['Pioneer Station', 'Cerberus', 'station de recherche et réseau de défense', 'licensed-continuity'],
  ['Purdan', 'Far Spinward', 'monde colonial et ruines xénobiologiques', 'licensed-continuity'],
  ['Ceto', 'Frontier Line', 'océan, archipels et cité minière', 'licensed-continuity'],
  ['Freya’s Prospect', 'Frontier Line', 'colonie minière sous glace', 'licensed-continuity'],
  ['Jackson’s Star', 'Outer Systems', 'colonie industrielle pluvieuse', 'screen-canon'],
  ['Renaissance Station', 'Jackson System', 'laboratoires Renaissance et anneaux techniques', 'screen-canon'],
  ['USM Auriga', 'Deep Space', 'vaisseau-laboratoire militaire', 'screen-canon'],
  ['USCSS Nostromo', 'Zeta route', 'remorqueur, raffinerie et ponts techniques', 'screen-canon'],
  ['Sulaco Drift', 'Acheron orbit', 'épave militaire et baies de largage', 'screen-canon'],
  ['Gateway Station', 'Sol', 'quais civils et commandement colonial', 'screen-canon'],
  ['New Galveston', 'Frontier Line', 'ville-colonie et infrastructures profondes', 'licensed-continuity'],
  ['New Albion', 'Frontier Line', 'méga-colonie et réseau de métro', 'licensed-continuity'],
  ['LV-1201', 'Outer Rim', 'temples, jungle et laboratoires corporatifs', 'licensed-continuity'],
  ['BG-386', 'Outer Rim', 'raffinerie, pyramides et jungle', 'licensed-continuity'],
  ['Capua VII', 'Far Spinward', 'monde agricole et marais', 'licensed-continuity'],
  ['Ryushi', 'Chigusa', 'ranchs, désert et ruines', 'licensed-continuity'],
  ['Korari', 'Outer Veil', 'forêt hostile et laboratoires abandonnés', 'licensed-continuity'],
  ['LV-742', 'Outer Veil', 'station de terraformation assiégée', 'licensed-continuity'],
  ['MIRE-9', 'Tantalus Reach', 'monde-labyrinthe de la campagne fondatrice', 'project-canon'],
  ['Echo Basin', 'Tantalus Reach', 'canyons, relais et ruches souterraines', 'project-canon'],
  ['Palimpste', 'Far Spinward', 'archives MIRE et anomalies temporelles', 'project-canon'],
  ['Pallas Rift', 'Tantalus Reach', 'fracture minière et laboratoires Pathogen', 'project-canon'],
  ['Sable Meridian', 'Tantalus Reach', 'badlands et caravanes Crucible', 'project-canon'],
  ['Nacre-7', 'Tantalus Reach', 'océan noir et ruches récifales', 'project-canon'],
  ['Khepri Forge', 'Tantalus Reach', 'fonderies militaires et broods blindés', 'project-canon']
];

const worldSuffixes = ['Prime', 'Reach', 'Basin', 'Drift', 'Station', 'Colony', 'Depths', 'Frontier'];
export const WORLDS = Object.freeze(Array.from({ length: 64 }, (_, index) => {
  const seed = worldSeeds[index % worldSeeds.length];
  const secondPass = index >= worldSeeds.length;
  const name = secondPass ? `${seed[0]} — ${worldSuffixes[index % worldSuffixes.length]}` : seed[0];
  const danger = 1 + ((hash(name) >>> 3) % 10);
  const biomes = [
    pick(['industrial', 'colony', 'orbital', 'badlands', 'oceanic', 'jungle', 'cryogenic', 'foundry'], index),
    pick(['hive', 'laboratory', 'mines', 'ruins', 'reactor', 'habitation', 'caverns', 'shipyard'], index, 2)
  ];
  return {
    id: `world-${String(index + 1).padStart(2, '0')}-${slug(name)}`,
    name,
    sector: seed[1],
    description: seed[2],
    provenance: secondPass ? 'frontier-adaptation' : seed[3],
    danger,
    biomes,
    atmosphere: pick(['breathable', 'toxic', 'thin', 'corrosive', 'vacuum', 'storm'], index),
    infestation: clamp((hash(`${name}:infestation`) % 101), 0, 100),
    stability: clamp(100 - danger * 7 + (index % 13), 5, 95),
    faction: FACTIONS[index % (FACTIONS.length - 1)].id,
    kit: `kit-${String((index % 27) + 1).padStart(2, '0')}`
  };
}));

const sourceContinuities = [
  'Alien 1979', 'Aliens 1986', 'Alien 3', 'Alien Resurrection', 'Prometheus', 'Alien Covenant',
  'Alien Romulus', 'Alien Earth', 'Alien Isolation', 'Aliens Colonial Marines', 'Aliens Dark Descent',
  'Aliens Fireteam Elite', 'Aliens Rogue Incursion', 'AVP 2000', 'AVP 2010', 'AVP Jaguar',
  'AVP Arcade', 'Aliens Armageddon', 'Alien Infestation', 'Alien RPG', 'Dark Horse', 'Fire and Stone',
  'Kenner', 'NECA', 'Alien Crucible', 'William Gibson Alien III', 'Official Shorts', 'Alien 5 archives'
];
const missionObjectives = [
  'rescue survivors', 'restore atmospheric processing', 'seal the hive', 'recover black-box data',
  'escort a colony convoy', 'purge a reactor nest', 'board a drifting vessel', 'hold the extraction zone',
  'track an apex specimen', 'recover a synthetic', 'capture a live organism', 'destroy a neuro-link relay',
  'defend the colony', 'navigate the vent network', 'secure the power loader', 'escape the quarantine'
];

const lorePairs = Array.from({ length: 206 }, (_, index) => {
  const source = sourceContinuities[index % sourceContinuities.length];
  const world = WORLDS[index % WORLDS.length];
  const objective = missionObjectives[index % missionObjectives.length];
  const pairId = `pair-${String(index + 1).padStart(3, '0')}`;
  return [
    {
      id: `${pairId}-mire`, pairId, mode: 'MIRE',
      name: `${source} — Reconstitution ${String(index + 1).padStart(3, '0')}`,
      source, worldId: world.id, objective,
      year: null, canon: 'archive-reconstruction', routes: 5,
      summary: `Reconstitution isolée de ${source}, sans réécrire la chronologie Frontière.`
    },
    {
      id: `${pairId}-frontier`, pairId, mode: 'FRONTIER',
      name: `${world.name} — Écho ${String(index + 1).padStart(3, '0')}`,
      source, worldId: world.id, objective,
      year: RELEASE.year, canon: 'project-continuity', routes: 5,
      summary: `Conséquence contemporaine en 2204 : descendant, clone, trace ou programme corporatif lié à ${source}.`
    }
  ];
}).flat();

const signatureCampaigns = Array.from({ length: 24 }, (_, index) => {
  const world = WORLDS[(index * 5 + 3) % WORLDS.length];
  return {
    id: `signature-${String(index + 1).padStart(2, '0')}`,
    pairId: null,
    mode: index < 8 ? 'FRONTIER' : index < 16 ? 'SURVIVAL' : 'CRUCIBLE',
    name: `${pick(['Tantalus', 'Echo-9', 'Apex', 'Crucible', 'Neuro-Xeno', 'Red Hive'], index)}: ${world.name}`,
    source: 'Tantalus Frontier', worldId: world.id,
    objective: missionObjectives[(index + 7) % missionObjectives.length],
    year: RELEASE.year, canon: 'project-continuity', routes: 5,
    summary: 'Opération signature avec conséquences persistantes sur le vaisseau, la colonie et l’escouade.'
  };
});
export const CAMPAIGNS = Object.freeze([...lorePairs, ...signatureCampaigns]);

const weaponSeeds = [
  ['M41A Pulse Rifle', 'ballistic', 'USCM'], ['M41A2 Pulse Rifle', 'ballistic', 'USCM'],
  ['M4A3 Service Pistol', 'ballistic', 'USCM'], ['VP70 Combat Pistol', 'ballistic', 'USCM'],
  ['M56 Smartgun', 'smart', 'USCM'], ['M240 Incinerator Unit', 'flame', 'USCM'],
  ['M37A2 Pump Shotgun', 'ballistic', 'USCM'], ['M39 Submachine Gun', 'ballistic', 'USCM'],
  ['M42A Scope Rifle', 'ballistic', 'USCM'], ['M6B Rocket Launcher', 'explosive', 'USCM'],
  ['M83 SADAR', 'explosive', 'USCM'], ['M5 RPG', 'explosive', 'USCM'],
  ['M94 Impact Grenade', 'explosive', 'USCM'], ['M40 HEDP Grenade', 'explosive', 'USCM'],
  ['UA 571-C Sentry Gun', 'sentry', 'USCM'], ['Heavy Pulse Rifle', 'ballistic', 'USCM'],
  ['F44AA Pulse Rifle', 'ballistic', 'USCM'], ['Type 88 Heavy Assault Rifle', 'ballistic', 'UPP'],
  ['AK-4047 Pulse Rifle', 'ballistic', 'UPP'], ['ES-4 Electroshock Pistol', 'electric', 'Seegson'],
  ['.357 Magnum Revolver', 'ballistic', 'Sevastopol'], ['Bolt Gun', 'ballistic', 'Sevastopol'],
  ['Compound Bow', 'silent', 'Frontier'], ['Harpoon Gun', 'ballistic', 'Marine'],
  ['Plasma Rifle', 'energy', 'Yautja archive'], ['Combi-Stick', 'melee', 'Yautja archive'],
  ['Smart Disc', 'melee', 'Yautja archive'], ['Wrist Blades', 'melee', 'Yautja archive'],
  ['Cutting Torch', 'tool', 'Industrial'], ['Maintenance Jack', 'melee', 'Industrial'],
  ['Fire Axe', 'melee', 'Industrial'], ['Combat Knife', 'melee', 'USCM'],
  ['Stun Baton', 'electric', 'Security'], ['Sonic Harpoon', 'sonic', 'Crucible'],
  ['Neuro-Link Disruptor', 'electric', 'ATARAX'], ['Ripper Acid Projector', 'acid', 'ATARAX'],
  ['Reef Caster', 'acid', 'Concept line'], ['Foundry Nailgun', 'ballistic', 'Concept line'],
  ['Cryo Lance', 'cryo', 'Frontier'], ['Pathogen Containment Projector', 'chemical', 'Frontier']
];
const weaponMarks = ['Standard', 'Field', 'Veteran', 'Prototype'];
export const WEAPONS = Object.freeze(Array.from({ length: 146 }, (_, index) => {
  const seed = weaponSeeds[index % weaponSeeds.length];
  const mark = weaponMarks[Math.floor(index / weaponSeeds.length) % weaponMarks.length];
  const name = index < weaponSeeds.length ? seed[0] : `${seed[0]} — ${mark}`;
  const damage = 12 + ((hash(name) % 52) + tier(index) * 3);
  return {
    id: `weapon-${String(index + 1).padStart(3, '0')}-${slug(name)}`,
    name, family: seed[1], source: seed[2], mark,
    damage, fireRate: 2 + ((index * 13) % 110) / 10,
    magazine: 1 + ((index * 17) % 99), reload: 0.8 + ((index * 7) % 28) / 10,
    penetration: clamp(10 + (index * 19) % 95, 0, 100),
    rarity: rarity(index), provenance: index < weaponSeeds.length ? 'licensed-reference' : 'gameplay-variant',
    tags: [seed[1], index % 3 === 0 ? 'acid-safe' : 'field', index % 5 === 0 ? 'heavy' : 'portable']
  };
}));

const equipmentSeeds = [
  'Motion Tracker', 'Access Tuner', 'Maintenance Jack', 'Cutting Torch', 'Flashlight', 'Medkit',
  'Trauma Kit', 'Rebreather', 'M3 Personnel Armor', 'APE Suit', 'Pressure Suit', 'Hazmat Suit',
  'Welding Kit', 'Portable Battery', 'Seismic Surveyor', 'Pathogen Scanner', 'Neuro-Link Helmet',
  'ATARAX Control Rig', 'Ripper Xenoarmor', 'Portable Sentry', 'Ammo Satchel', 'Drone Controller',
  'Signal Jammer', 'Cryo Mine', 'Incinerator Fuel Pack', 'Electroshock Trap', 'Catch Pole',
  'Portable Quarantine', 'Synthetic Repair Kit', 'Colony Beacon'
];
const equipmentGrades = ['Civilian', 'Field', 'Military', 'Research'];
export const EQUIPMENT = Object.freeze(Array.from({ length: 106 }, (_, index) => {
  const seed = equipmentSeeds[index % equipmentSeeds.length];
  const grade = equipmentGrades[Math.floor(index / equipmentSeeds.length) % equipmentGrades.length];
  const name = index < equipmentSeeds.length ? seed : `${seed} — ${grade}`;
  return {
    id: `equipment-${String(index + 1).padStart(3, '0')}-${slug(name)}`,
    name, grade, rarity: rarity(index),
    utility: pick(['recon', 'survival', 'engineering', 'medical', 'control', 'defense'], index),
    charges: 1 + (index % 8), mass: 0.4 + ((index * 9) % 75) / 10,
    description: `${grade} equipment configured for ${pick(['colony', 'ship', 'hive', 'vacuum', 'frontier'], index)} operations.`,
    provenance: index < equipmentSeeds.length ? 'licensed-reference' : 'frontier-adaptation'
  };
}));

const enemySeeds = [
  ['Ovomorph', 'xenomorph', 'egg'], ['Facehugger', 'xenomorph', 'parasite'],
  ['Chestburster', 'xenomorph', 'juvenile'], ['Drone / Big Chap', 'xenomorph', 'stalker'],
  ['Warrior', 'xenomorph', 'assault'], ['Runner', 'xenomorph', 'runner'],
  ['Praetorian', 'xenomorph', 'guardian'], ['Queen', 'xenomorph', 'royal'],
  ['Crusher', 'xenomorph', 'siege'], ['Spitter', 'xenomorph', 'ranged'],
  ['Lurker', 'xenomorph', 'ambush'], ['Carrier', 'xenomorph', 'carrier'],
  ['Ravager', 'xenomorph', 'assault'], ['Boiler', 'xenomorph', 'explosive'],
  ['Prowler', 'xenomorph', 'ambush'], ['Burster', 'xenomorph', 'explosive'],
  ['Monica Line', 'xenomorph', 'stalker'], ['Specimen Six Line', 'xenomorph', 'adaptive'],
  ['Red Xenomorph', 'xenomorph', 'rival-hive'], ['K-Series Yellow Xenomorph', 'xenomorph', 'rival-hive'],
  ['Neuro-Xeno Drone', 'xenomorph', 'controlled'], ['Xenoborg', 'xenomorph', 'cybernetic'],
  ['ATARAX Ripper', 'xenomorph', 'armored'], ['Ripper Queen', 'xenomorph', 'royal'],
  ['Foundry Drone', 'xenomorph', 'concept-acm'], ['Foundry Crusher', 'xenomorph', 'concept-acm'],
  ['Reef Stalker', 'xenomorph', 'concept-acm'], ['Reef Spitter', 'xenomorph', 'concept-acm'],
  ['Siege Royal', 'xenomorph', 'concept-acm'], ['Pale Crucible Hunter', 'xenomorph', 'concept-crucible'],
  ['Dust Runner', 'xenomorph', 'concept-crucible'], ['Salvage Hive Brute', 'xenomorph', 'concept-crucible'],
  ['Arcology Lurker', 'xenomorph', 'concept-crucible'], ['Caravan Stalker', 'xenomorph', 'concept-crucible'],
  ['Trilobite Echo', 'pathogen', 'apex'], ['Deacon Line', 'pathogen', 'apex'],
  ['Neomorph', 'pathogen', 'stalker'], ['Protomorph', 'pathogen', 'assault'],
  ['Abomination', 'pathogen', 'brute'], ['Pathogen Mimic', 'pathogen', 'adaptive'],
  ['Working Joe', 'synthetic', 'security'], ['Combat Synthetic', 'synthetic', 'assault'],
  ['Weyland-Yutani Commando', 'human', 'assault'], ['UPP Vanguard', 'human', 'assault'],
  ['Seegson Security', 'human', 'security'], ['Colonial Raider', 'human', 'ambush'],
  ['ATARAX Controller', 'human', 'controller'], ['Cult Host', 'human', 'cult'],
  ['Wild Boar Host', 'fauna', 'host'], ['Korari Stalker', 'fauna', 'predator'],
  ['Ceto Reef Predator', 'fauna', 'aquatic'], ['Tantalus Tunnel Vermin', 'fauna', 'swarm']
];
const enemyModifiers = [
  'Standard', 'Albino', 'Armored', 'Acid-Blooded', 'Cryo-Adapted', 'Vacuum-Adapted',
  'Hive Guard', 'Apex', 'Juvenile', 'Elder', 'Neuro-Linked'
];
export const ENEMIES = Object.freeze(Array.from({ length: 568 }, (_, index) => {
  const seed = enemySeeds[index % enemySeeds.length];
  const cycle = Math.floor(index / enemySeeds.length);
  const modifier = enemyModifiers[cycle % enemyModifiers.length];
  const name = index < enemySeeds.length ? seed[0] : `${modifier} ${seed[0]}`;
  const base = 18 + tier(index) * 8;
  const world = WORLDS[(index * 9 + cycle) % WORLDS.length];
  return {
    id: `enemy-${String(index + 1).padStart(3, '0')}-${slug(name)}`,
    name, biology: seed[1], caste: seed[2], modifier,
    health: base + (hash(name) % 190), damage: 4 + (hash(`${name}:damage`) % 48),
    speed: 0.65 + ((index * 17) % 170) / 100,
    armor: clamp((index * 23 + cycle * 7) % 101, 0, 100),
    acid: seed[1] === 'xenomorph' ? 25 + (index % 76) : seed[1] === 'pathogen' ? 12 : 0,
    frequency: pick(['common', 'uncommon', 'rare', 'apex', 'scripted'], index),
    encounterWorldIds: [world.id, WORLDS[(index + 17) % WORLDS.length].id],
    habitats: [world.biomes[0], pick(['vents', 'hive', 'surface', 'reactor', 'water', 'ruins'], index)],
    behavior: pick(['stalk', 'rush', 'flank', 'ambush', 'guard', 'control', 'siege', 'swarm'], index),
    provenance: seed[2].startsWith('concept-') ? 'licensed-concept-adaptation' : index < enemySeeds.length ? 'licensed-reference' : 'systemic-variant'
  };
}));

const vehicleSeeds = [
  ['M577 Armored Personnel Carrier', 'ground', 8], ['M577 Command APC', 'ground', 7],
  ['M570 Series APC', 'ground', 13, 'M570 Armored Personnel Carrier', {
    canonicalVariant: 'Alien RPG M570 Series APC (non-M577 configuration unresolved)',
    referenceStatus: 'CANON_REFERENCE',
    visualStatus: 'BLOCKED_NO_PUBLISHED_SILHOUETTE',
    referenceNote: 'The licensed RPG establishes the series and passenger count, but publishes only the M577 standard-model profile.'
  }], ['M22A3 Jackson Tank', 'ground', 4],
  ['M40 Ridgeway Heavy Tank', 'ground', 3, 'M40 Ridgeway Tank'], ['M292 Self-Propelled Artillery', 'ground', 6, 'M292 Combat Buggy', {
    canonicalVariant: 'M292 baseline self-propelled artillery (not M292A2)',
    referenceStatus: 'CANON_REFERENCE',
    visualStatus: 'BLOCKED_SINGLE_LEFT_PROFILE',
    referenceNote: 'Only one licensed left elevation is available; a complete animation sheet would require invented geometry.'
  }],
  ['P-5000 Powered Work Loader', 'exosuit', 1], ['Combat Power Loader', 'exosuit', 1],
  ['UD-4L Cheyenne Dropship', 'air', 12], ['UA Northridge UD-4B Cheyenne', 'air', 10, 'UD-4B Dropship'],
  ['AD-19D Bearcat VTOL Strikeship', 'air', 4, 'AD-19CD Dropship', {
    canonicalVariant: 'UA Northridge AD-19D Bearcat',
    referenceStatus: 'CANON_REFERENCE',
    visualStatus: 'BLOCKED_VARIANT_AND_REAR_GEOMETRY_UNRESOLVED',
    referenceNote: 'The D variant has four crew; optional external medevac panniers are not passenger seats and are not illustrated from enough angles.'
  }], ['UA-571 Remote Sentry Carrier', 'ground', 2],
  ['Narcissus - Nostromo Lifeboat', 'space', 3, 'USCSS Nostromo Shuttle'], ['Lander One - Class E Lander-Type Drop Shuttle', 'air', 12, 'USCSS Covenant Lander'],
  ['RT Series Group Transport / RT01', 'ground', 21, 'USCSS Prometheus Rover'], ['NR-9 Series All Terrain Vehicle / EUV01', 'ground', 2, 'ATV Survey Rover'],
  ['Seegson Maintenance Tram', 'rail', 20], ['Daihotai Tractor / Colony Tractor', 'ground', 5, 'Acheron Colony Tractor'],
  ['Weyland EVA-7C Series Pressure Pod', 'submersible', 6, 'Submersible Survey Skiff'], ['Ceto Patrol Boat', 'maritime', 8],
  ['Tantalus Command Skiff', 'air', 6], ['Echo-9 Recon Bike', 'ground', 2],
  ['Crucible Caravan Crawler', 'ground', 10], ['Neuro-Xeno Transport Rig', 'ground', 5],
  ['USCM Assault Gunship', 'air', 8], ['Orbital Lifeboat', 'space', 12],
  ['Colony Cargo Lifter', 'air', 3], ['Weyland-Yutani Executive Shuttle', 'space', 10],
  ['UPP Combat Aerodyne', 'air', 6], ['Hyperdyne Synthetic Carrier', 'ground', 8],
  ['Mining Bore Crawler', 'ground', 9], ['Atmospheric Processor Elevator', 'rail', 30],
  ['Maglev Personnel Car', 'rail', 18], ['Ice Driller', 'ground', 5],
  ['Reef Hydrofoil', 'maritime', 5], ['Ripper Siege Loader', 'exosuit', 1]
];
const vehicleFits = ['Standard', 'Recon', 'Assault', 'Rescue', 'Colonial', 'Frontier', 'Prototype', 'Apex'];
export const VEHICLES = Object.freeze(Array.from({ length: 279 }, (_, index) => {
  const seed = vehicleSeeds[index % vehicleSeeds.length];
  const reference = seed[4] || null;
  const fit = vehicleFits[Math.floor(index / vehicleSeeds.length) % vehicleFits.length];
  const name = index < vehicleSeeds.length ? seed[0] : `${seed[0]} — ${fit}`;
  const stableBaseName = seed[3] || seed[0];
  const stableName = index < vehicleSeeds.length ? stableBaseName : `${stableBaseName} ${fit}`;
  const seats = Array.from({ length: seed[2] }, (_, seatIndex) => ({
    id: `seat-${seatIndex + 1}`,
    role: seatIndex === 0 ? 'driver' : seatIndex === 1 && seed[2] > 2 ? 'gunner' : seatIndex === 2 && seed[2] > 4 ? 'commander' : 'passenger',
    actions: seatIndex === 0 ? ['drive', 'boost', 'brake'] : seatIndex === 1 ? ['aim', 'fire', 'reload'] : ['observe', 'support', 'disembark']
  }));
  return {
    id: `vehicle-${String(index + 1).padStart(3, '0')}-${slug(stableName)}`,
    name, family: seed[1], fit, seats,
    legacyCatalogName: seed[3] || null,
    canonicalVariant: reference?.canonicalVariant || null,
    referenceStatus: index < vehicleSeeds.length ? (reference?.referenceStatus || 'CANON_REFERENCE') : 'PROJECT_ADAPTATION',
    visualStatus: reference?.visualStatus || 'ELIGIBLE_FOR_REFERENCE_AUDIT',
    referenceNote: reference?.referenceNote || null,
    hull: 90 + (index * 29) % 410, speed: 18 + (index * 17) % 180,
    cargo: (index * 7) % 60, armor: clamp((index * 13) % 101, 0, 100),
    actions: [...new Set(seats.flatMap((seat) => seat.actions))],
    provenance: index < vehicleSeeds.length ? 'licensed-reference' : 'frontier-fit'
  };
}));

export const CREW = Object.freeze([
  ['Mara Vega', 'Commander', 'human', 'command'], ['Tamsin Velez', 'Sergeant', 'human', 'assault'],
  ['Idris Kwan', 'Engineer', 'human', 'engineering'], ['Noor Okafor', 'Corpsman', 'human', 'medical'],
  ['BISHOP-9', 'Synthetic Science Officer', 'synthetic', 'science'], ['Rook', 'Recon Marine', 'human', 'recon'],
  ['Sanaa Doyle', 'Smartgunner', 'human', 'heavy'], ['Maksim Orlov', 'Pilot', 'human', 'pilot'],
  ['Inez Harlow', 'Xenobiologist', 'human', 'science'], ['DAVID-8R', 'Recovered Synthetic', 'synthetic', 'infiltration'],
  ['Jun Park', 'Technician', 'human', 'engineering'], ['Asha Mbaye', 'Colonial Liaison', 'human', 'diplomacy'],
  ['Pablo Reyes', 'Demolitions', 'human', 'demolition'], ['ECHO-A', 'Tactical Synthetic', 'synthetic', 'assault'],
  ['Leila Sørensen', 'Pathfinder', 'human', 'survival'], ['Cal Mercer', 'Vehicle Chief', 'human', 'vehicle']
].map(([name, role, species, specialty], index) => ({
  id: `crew-${String(index + 1).padStart(2, '0')}-${slug(name)}`,
  name, role, species, specialty,
  health: 100, stress: 0, fatigue: 0, loyalty: 55 + (index * 7) % 41,
  status: 'active', injuries: [], missions: 0, kills: 0
})));

export const NEURO_XENO_PROFILES = Object.freeze(ENEMIES
  .filter((enemy) => enemy.biology === 'xenomorph')
  .slice(0, 234)
  .map((enemy, index) => ({
    id: `neuro-${String(index + 1).padStart(3, '0')}`,
    enemyId: enemy.id,
    harness: pick(['Xeno-Zip', 'ATARAX', 'Ripper', 'Echo Override', 'W-Y Dominion'], index),
    controlDifficulty: 20 + (index * 17) % 81,
    signalRange: 15 + (index * 13) % 186,
    failureMode: pick(['frenzy', 'signal-loss', 'feedback', 'hive-takeover', 'acid-rupture'], index),
    playerClassCompatible: index % 4 !== 0
  })));

export const APEX_DOSSIERS = Object.freeze(ENEMIES.slice(0, 244).map((enemy, index) => ({
  id: `apex-${String(index + 1).padStart(3, '0')}`,
  enemyId: enemy.id,
  name: `${enemy.name} / Dossier ${String(index + 1).padStart(3, '0')}`,
  origin: index % 2 === 0 ? 'MIRE historical specimen' : 'Frontier descendant or reconstruction',
  spawnChance: Math.max(0.25, 12 - index * 0.035),
  restrictions: [pick(['reactor', 'hive', 'surface', 'laboratory', 'derelict'], index), `danger-${1 + index % 10}`],
  reward: 140 + index * 17
})));

const costumeParts = ['M3 armor', 'pressure suit', 'miner rig', 'flight suit', 'corporate uniform', 'hazmat suit', 'APE suit', 'synthetic shell'];
const costumePalettes = ['Hadley olive', 'Nostromo ivory', 'Sevastopol orange', 'UPP red', 'Tantalus green', 'Renaissance white', 'Fury soot'];
export const COSTUMES = Object.freeze(Array.from({ length: 392 }, (_, index) => ({
  id: `costume-${String(index + 1).padStart(3, '0')}`,
  name: `${costumeParts[index % costumeParts.length]} — ${costumePalettes[(index * 3) % costumePalettes.length]} ${1 + Math.floor(index / 56)}`,
  body: pick(['human-a', 'human-b', 'human-c', 'synthetic-a', 'synthetic-b'], index),
  part: costumeParts[index % costumeParts.length],
  palette: costumePalettes[(index * 3) % costumePalettes.length],
  wear: pick(['clean', 'field', 'damaged', 'acid-scarred'], index),
  provenance: index < 64 ? 'licensed-silhouette-reference' : 'modular-frontier-combination'
})));

export const SHIP_MODULES = Object.freeze(Array.from({ length: 158 }, (_, index) => ({
  id: `module-${String(index + 1).padStart(3, '0')}`,
  name: `${pick(['Command', 'Power', 'Life Support', 'Quarantine', 'Armory', 'Hangar', 'Science', 'Medical', 'Crew', 'Sensor'], index)} Module ${String(index + 1).padStart(3, '0')}`,
  deck: index % 4,
  category: pick(['room', 'system', 'defense', 'production', 'comfort'], index),
  level: 1 + index % 3,
  power: 2 + index % 18,
  effects: [pick(['morale', 'security', 'research', 'repair', 'healing', 'detection'], index)]
})));

export const LEVEL_SEEDS = Object.freeze(Array.from({ length: 800 }, (_, index) => {
  const world = WORLDS[index % WORLDS.length];
  return {
    id: `level-${String(index + 1).padStart(3, '0')}`,
    name: `${world.name} — Plan ${String(index + 1).padStart(3, '0')}`,
    worldId: world.id,
    kit: `kit-${String((index % 27) + 1).padStart(2, '0')}`,
    width: 3 + index % 9,
    height: 2 + (index * 3) % 6,
    seed: hash(`${world.id}:${index}`),
    objective: missionObjectives[index % missionObjectives.length],
    hazards: [pick(['acid', 'vacuum', 'fire', 'steam', 'radiation', 'flood', 'darkness'], index)],
    routes: 3 + index % 3
  };
}));

export const CONTENT_COUNTS = Object.freeze({
  worlds: WORLDS.length,
  campaigns: CAMPAIGNS.length,
  weapons: WEAPONS.length,
  equipment: EQUIPMENT.length,
  enemies: ENEMIES.length,
  vehicles: VEHICLES.length,
  apexDossiers: APEX_DOSSIERS.length,
  neuroXenoProfiles: NEURO_XENO_PROFILES.length,
  crew: CREW.length,
  costumes: COSTUMES.length,
  shipModules: SHIP_MODULES.length,
  levelSeeds: LEVEL_SEEDS.length
});

export const CONTENT_TARGETS = Object.freeze({
  worlds: 64,
  campaigns: 436,
  weapons: 146,
  equipment: 106,
  enemies: 568,
  vehicles: 279,
  apexDossiers: 244,
  neuroXenoProfiles: 234,
  crew: 16,
  costumes: 392,
  shipModules: 158,
  levelSeeds: 800
});

export function validateContent() {
  const failures = [];
  for (const [key, expected] of Object.entries(CONTENT_TARGETS)) {
    if (CONTENT_COUNTS[key] !== expected) failures.push(`${key}: ${CONTENT_COUNTS[key]} != ${expected}`);
  }
  const catalogs = { WORLDS, CAMPAIGNS, WEAPONS, EQUIPMENT, ENEMIES, VEHICLES, APEX_DOSSIERS, NEURO_XENO_PROFILES, CREW, COSTUMES, SHIP_MODULES, LEVEL_SEEDS };
  for (const [name, catalog] of Object.entries(catalogs)) {
    const ids = new Set(catalog.map((entry) => entry.id));
    if (ids.size !== catalog.length) failures.push(`${name}: duplicate ids`);
    if (catalog.some((entry) => !entry.name && !entry.enemyId)) failures.push(`${name}: unnamed entry`);
  }
  return { ok: failures.length === 0, failures, counts: CONTENT_COUNTS };
}
