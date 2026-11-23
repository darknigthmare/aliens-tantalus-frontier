// V188 — bilingual glossary of the catalog group ids (Armurerie, Xénobiologie,
// Véhicules trees). The ids stay the identifiers used by the content, the save
// and the search; only the displayed label changes. Each entry is keyed by
// catalog, then by hierarchy level (catalog-runtime-v62 segment kind), because
// one id can mean two things: weapons/family "melee" is a weapon class while
// enemies/role "melee" is a combat role.
//
// The labels are project wording, not franchise terminology certified 1:1.
// Caste names marked [PROPOSÉ] are invented in-universe wording for the project.
// The French label is what the DOM receives; the English catalog
// (i18n-en-catalog-v185.js) holds the same English text so the automatic layer
// can switch live. verify-bugfix-i18n-v188.mjs keeps the two in step.

const entry = (fr, en) => Object.freeze({ fr, en });

export const GROUP_GLOSSARY_V188 = Object.freeze({
  weapons: Object.freeze({
    family: Object.freeze({
      acid: entry('Acide', 'Acid'),
      ballistic: entry('Balistique', 'Ballistic'),
      chemical: entry('Chimique', 'Chemical'),
      cryo: entry('Cryogénique', 'Cryogenic'),
      electric: entry('Électrique', 'Electric'),
      energy: entry('Énergie', 'Energy'),
      explosive: entry('Explosifs', 'Explosives'),
      flame: entry('Incendiaire', 'Incendiary'),
      melee: entry('Mêlée', 'Melee'),
      sentry: entry('Tourelles', 'Sentry guns'),
      silent: entry('Silencieuses', 'Silent weapons'),
      smart: entry('Armes intelligentes', 'Smart weapons'),
      sonic: entry('Soniques', 'Sonic weapons'),
      tool: entry('Outils', 'Tools')
    }),
    category: Object.freeze({
      bow: entry('Arcs', 'Bows'),
      deployable: entry('Déployables', 'Deployables'),
      device: entry('Engins lancés', 'Thrown devices'), // V188 arsenal lot C
      energy: entry('Armes à énergie', 'Energy weapons'),
      explosive: entry('Explosifs', 'Explosives'),
      firearm: entry('Armes à feu', 'Firearms'),
      flame: entry('Lance-flammes', 'Flamethrowers'),
      grappling: entry('Grappins', 'Grapples'),
      heavy: entry('Armes lourdes', 'Heavy weapons'),
      launcher: entry('Lanceurs', 'Launchers'),
      melee: entry('Armes blanches', 'Melee weapons'),
      pistol: entry('Pistolets', 'Pistols'),
      rifle: entry('Fusils', 'Rifles'),
      shotgun: entry('Fusils à pompe', 'Shotguns'),
      sidearm: entry('Armes de poing', 'Sidearms'),
      smg: entry('Pistolets-mitrailleurs', 'Submachine guns'),
      sniper: entry('Fusils de précision', 'Sniper rifles'),
      tool: entry('Outils', 'Tools')
    })
  }),
  equipment: Object.freeze({
    family: Object.freeze({ equipment: entry('Équipement', 'Equipment') }),
    category: Object.freeze({
      control: entry('Contrôle', 'Control'),
      defense: entry('Défense', 'Defense'),
      engineering: entry('Génie', 'Engineering'),
      medical: entry('Médical', 'Medical'),
      recon: entry('Reconnaissance', 'Recon'),
      survival: entry('Survie', 'Survival')
    }),
    // Equipment uses its "type" level as a supply grade, not as an item name.
    type: Object.freeze({
      Civilian: entry('Civil', 'Civilian'),
      Field: entry('Terrain', 'Field'),
      Military: entry('Militaire', 'Military'),
      Research: entry('Recherche scientifique', 'Research')
    })
  }),
  enemies: Object.freeze({
    family: Object.freeze({
      automaton: entry('Automates', 'Automatons'),
      engineer: entry('Mala’kak / Engineers', 'Mala’kak / Engineers'),
      fauna: entry('Faune', 'Fauna'),
      human: entry('Humains', 'Humans'),
      hybrid: entry('Hybrides', 'Hybrids'),
      pathogen: entry('Pathogène', 'Pathogen'),
      synthetic: entry('Synthétiques', 'Synthetics'),
      xenomorph: entry('Xénomorphes', 'Xenomorphs')
    }),
    species: Object.freeze({ unknown: entry('NON DOCUMENTÉ', 'UNDOCUMENTED') }),
    subspecies: Object.freeze({ unknown: entry('NON DOCUMENTÉ', 'UNDOCUMENTED') }),
    stage: Object.freeze({
      adult: entry('Adulte', 'Adult'),
      egg: entry('Œuf', 'Egg'),
      juvenile: entry('Juvénile', 'Juvenile'),
      larval: entry('Larvaire', 'Larval'),
      'manufactured-unit': entry('Unité fabriquée', 'Manufactured unit'),
      parasite: entry('Stade parasite', 'Parasite stage'),
      unknown: entry('NON DOCUMENTÉ', 'UNDOCUMENTED')
    }),
    role: Object.freeze({
      ambush: entry('Embuscade', 'Ambush'),
      assault: entry('Assaut', 'Assault'),
      controller: entry('Contrôleur', 'Controller'),
      cult: entry('Culte', 'Cult'),
      melee: entry('Combat rapproché', 'Close combat'),
      ranged: entry('Appui à distance', 'Ranged support'),
      security: entry('Sécurité', 'Security')
    }),
    // [PROPOSÉ] French caste names for the project; English keeps the caste id wording.
    caste: Object.freeze({
      adaptive: entry('Adaptatif', 'Adaptive'),
      ambush: entry('Embuscade', 'Ambush'),
      apex: entry('Alpha', 'Apex'),
      aquatic: entry('Aquatique', 'Aquatic'),
      armored: entry('Blindé', 'Armored'),
      assault: entry('Assaut', 'Assault'),
      brute: entry('Brute', 'Brute'),
      carrier: entry('Porteur', 'Carrier'),
      'concept-acm': entry('Concept ACM', 'ACM concept'),
      'concept-crucible': entry('Concept Crucible', 'Crucible concept'),
      controlled: entry('Contrôlé', 'Controlled'),
      cybernetic: entry('Cybernétique', 'Cybernetic'),
      egg: entry('Œuf', 'Egg'),
      explosive: entry('Explosif', 'Explosive'),
      guardian: entry('Gardien', 'Guardian'),
      host: entry('Hôte', 'Host'),
      juvenile: entry('Juvénile', 'Juvenile'),
      parasite: entry('Parasitaire', 'Parasitic'),
      predator: entry('Prédateur', 'Predator'),
      queen: entry('Reine', 'Queen'),
      ranged: entry('Tireur à distance', 'Ranged'),
      'rival-hive': entry('Ruche rivale', 'Rival hive'),
      royal: entry('Lignée royale', 'Royal line'),
      runner: entry('Coureur', 'Runner'),
      siege: entry('Assiégeant', 'Besieger'),
      stalker: entry('Rôdeur', 'Stalker'),
      swarm: entry('Essaim', 'Swarm')
    })
  }),
  vehicles: Object.freeze({
    family: Object.freeze({
      air: entry('Aérien', 'Air'),
      exosuit: entry('Exosquelettes', 'Exosuits'),
      ground: entry('Terrestre', 'Ground'),
      maritime: entry('Maritime', 'Maritime'),
      rail: entry('Ferroviaire', 'Rail'),
      space: entry('Spatial', 'Space'),
      submersible: entry('Submersible', 'Submersible')
    }),
    category: Object.freeze({ vehicle: entry('Engins', 'Craft') })
  })
});

/** Label of one catalog group, or null when the id is not a glossary group
 * (item names, unknown catalogs): the caller then keeps its own label. */
export function groupLabelV188(id, { catalog, kind, language = 'fr' } = {}) {
  const levels = Object.hasOwn(GROUP_GLOSSARY_V188, catalog) ? GROUP_GLOSSARY_V188[catalog] : null;
  const table = levels && Object.hasOwn(levels, kind) ? levels[kind] : null;
  const found = table && Object.hasOwn(table, id) ? table[id] : null;
  return found ? found[language === 'en' ? 'en' : 'fr'] : null;
}

/** Every [catalog, kind, id, fr, en] row (tests and catalog maintenance). */
export function groupGlossaryRowsV188() {
  return Object.entries(GROUP_GLOSSARY_V188).flatMap(([catalog, levels]) => Object.entries(levels)
    .flatMap(([kind, table]) => Object.entries(table).map(([id, label]) => [catalog, kind, id, label.fr, label.en])));
}

// V188 — player labels of the catalog value enums shown in the dossier tables
// (FAITS DE RÉFÉRENCE, STATISTIQUES DE GAMEPLAY, developer source rows). The
// values stay the content ids; only the displayed text changes. Families,
// biology, castes, stages, grades and utilities reuse the group glossary above.
// Most wording is project wording [PROPOSÉ], not franchise terminology.
export const CATALOG_VALUE_GLOSSARY_V188 = Object.freeze({
  provenance: Object.freeze({
    'fan-made-user-import': entry('Création de fan importée', 'Imported fan creation'),
    'frontier-adaptation': entry('Adaptation Frontier', 'Frontier adaptation'),
    'frontier-fit': entry('Configuration Frontier', 'Frontier configuration'),
    'gameplay-variant': entry('Variante de jeu', 'Gameplay variant'),
    'licensed-concept-adaptation': entry('Adaptation d’un concept sous licence', 'Licensed concept adaptation'),
    'licensed-reference': entry('Référence sous licence', 'Licensed reference'),
    'licensed-reference-project-adaptation': entry('Référence sous licence adaptée au projet', 'Licensed reference adapted for the project'),
    'openai-integrated-reference-guided': entry('Générateur OpenAI intégré, références visuelles contrôlées', 'Integrated OpenAI generator, controlled visual references'),
    'production-design-reference': entry('Référence de conception de production', 'Production design reference'),
    'project-original': entry('Création Tantalus', 'Tantalus original'),
    'reference-openai-integrated': entry('Illustration générée sur référence', 'Illustration generated from a reference'),
    'systemic-variant': entry('Variante systémique', 'Systemic variant'),
    'user-provided-imported-native-cutout': entry('Détourage fourni, importé tel quel', 'Supplied cutout, imported as is'),
    'user-provided-reference-openai-integrated': entry('Référence fournie, illustration générée', 'Supplied reference, generated illustration')
  }),
  referenceStatus: Object.freeze({
    CANON_REFERENCE: entry('Référence canon', 'Canon reference'),
    CANON_REFERENCE_ADAPTATION: entry('Adaptation d’une référence canon', 'Canon reference adaptation'),
    CANON_REFERENCE_LICENSED_MULTIANGLE: entry('Référence canon, plusieurs angles sous licence', 'Canon reference, licensed multiple angles'),
    CANON_REFERENCE_VISIBLE_ANGLES: entry('Référence canon, angles visibles', 'Canon reference, visible angles'),
    FILMING_MINIATURE_REFERENCE_RECONSTRUCTION: entry('Reconstitution d’après la maquette de tournage', 'Reconstruction from the filming miniature'),
    IN_GAME_VISUAL_REFERENCE_RECONSTRUCTION: entry('Reconstitution d’après un visuel de jeu', 'Reconstruction from an in-game visual'),
    LICENSED_A2_SIDE_PROFILE_ADAPTATION: entry('Adaptation du profil latéral A2 sous licence', 'Licensed A2 side profile adaptation'),
    LICENSED_CD_FAMILY_PROFILE_ADAPTATION: entry('Adaptation du profil de famille CD sous licence', 'Licensed CD family profile adaptation'),
    LICENSED_FAMILY_REFERENCE: entry('Référence de famille sous licence', 'Licensed family reference'),
    LICENSED_FAMILY_REPRESENTATIVE: entry('Représentant d’une famille sous licence', 'Licensed family representative'),
    LICENSED_MODEL_REFERENCE: entry('Référence de modèle sous licence', 'Licensed model reference'),
    LICENSED_MODEL_REFERENCE_ADAPTATION: entry('Adaptation d’un modèle sous licence', 'Licensed model adaptation'),
    LICENSED_REFERENCE_RECONSTRUCTION: entry('Reconstitution d’après une référence sous licence', 'Reconstruction from a licensed reference'),
    LICENSED_REPLICA_REFERENCE_RECONSTRUCTION: entry('Reconstitution d’après une réplique sous licence', 'Reconstruction from a licensed replica'),
    PRIMARY_GAME_RENDER_ADAPTATION: entry('Adaptation d’un rendu de jeu', 'Adaptation of a game render'),
    PRIMARY_REFERENCE_RECONSTRUCTION: entry('Reconstitution d’après la source principale', 'Reconstruction from the primary source'),
    PRODUCTION_DESIGN_REFERENCE: entry('Référence de conception de production', 'Production design reference'),
    PRODUCTION_FAMILY_REFERENCE_RECONSTRUCTION: entry('Reconstitution d’après une famille de production', 'Reconstruction from a production family'),
    PRODUCTION_REFERENCE_RECONSTRUCTION: entry('Reconstitution d’après une référence de production', 'Reconstruction from a production reference'),
    PRODUCTION_SPECIMEN_ADAPTATION: entry('Adaptation d’un accessoire de production', 'Adaptation of a production prop'),
    PROJECT_ADAPTATION: entry('Adaptation du projet', 'Project adaptation'),
    PROJECT_DESIGN_ADAPTATION: entry('Adaptation de design du projet', 'Project design adaptation'),
    PROJECT_ORIGINAL: entry('Création Tantalus', 'Tantalus original'),
    PROJECT_ORIGINAL_ADAPTATION: entry('Adaptation d’une création Tantalus', 'Adaptation of a Tantalus original'),
    'native-alpha-reviewed': entry('Transparence native relue', 'Native transparency reviewed'),
    'sha256-dimensions-alpha-verified': entry('Fichier, dimensions et transparence vérifiés ; fidélité canonique non certifiée', 'File, dimensions and transparency verified; canonical fidelity not certified')
  }),
  rarity: Object.freeze({
    common: entry('Courante', 'Common'),
    epic: entry('Épique', 'Epic'),
    legendary: entry('Légendaire', 'Legendary'),
    prototype: entry('Prototype', 'Prototype'),
    rare: entry('Rare', 'Rare'),
    uncommon: entry('Peu courante', 'Uncommon'),
    unique: entry('Unique', 'Unique')
  }),
  frequency: Object.freeze({
    apex: entry('Alpha', 'Apex'),
    common: entry('Fréquente', 'Frequent'),
    contextual: entry('Contextuelle', 'Contextual'),
    rare: entry('Rare', 'Rare'),
    scripted: entry('Scénarisée', 'Scripted'),
    uncommon: entry('Occasionnelle', 'Occasional')
  }),
  behavior: Object.freeze({
    aquatic: entry('Aquatique', 'Aquatic'),
    boss: entry('Chef de meute', 'Pack leader'),
    bruiser: entry('Cogneur', 'Bruiser'),
    charger: entry('Fonceur', 'Charger'),
    control: entry('Contrôle à distance', 'Remote control'),
    egg: entry('Œuf', 'Egg'),
    exploder: entry('Kamikaze', 'Exploder'),
    grappler: entry('Agrippeur', 'Grappler'),
    guard: entry('Garde', 'Guard'),
    hunter: entry('Chasseur', 'Hunter'),
    'hybrid-boss': entry('Chef hybride', 'Hybrid leader'),
    pouncer: entry('Bondisseur', 'Leaper'),
    'reach-hunter': entry('Chasseur à allonge', 'Long-reach hunter'),
    shooter: entry('Tireur', 'Gunner'),
    spitter: entry('Cracheur', 'Spitter'),
    stalk: entry('Traque', 'Stalking'),
    stalker: entry('Rôdeur', 'Stalker')
  }),
  fit: Object.freeze({
    Apex: entry('Alpha', 'Apex'),
    Assault: entry('Assaut', 'Assault'),
    Colonial: entry('Coloniale', 'Colonial'),
    Frontier: entry('Frontière', 'Frontier'),
    Prototype: entry('Prototype', 'Prototype'),
    Recon: entry('Reconnaissance', 'Recon'),
    Rescue: entry('Sauvetage', 'Rescue'),
    Standard: entry('Standard', 'Standard')
  }),
  seatRole: Object.freeze({
    commander: entry('Commandant', 'Commander'),
    driver: entry('Pilote / conducteur', 'Pilot / driver'),
    gunner: entry('Tireur', 'Gunner'),
    operator: entry('Opérateur de chantier', 'Site operator'),
    passenger: entry('Passager', 'Passenger')
  }),
  actions: Object.freeze({
    aim: entry('Viser', 'Aim'),
    boost: entry('Accélérer', 'Accelerate'),
    brake: entry('Freiner', 'Brake'),
    disembark: entry('Débarquer', 'Disembark'),
    drive: entry('Conduire', 'Drive'),
    fire: entry('Tirer', 'Fire'),
    observe: entry('Observer', 'Observe'),
    reload: entry('Recharger', 'Reload'),
    'remote-drive': entry('Piloter à distance', 'Drive remotely'),
    scan: entry('Balayer', 'Scan'),
    support: entry('Soutenir', 'Support'),
    survey: entry('Relever le terrain', 'Survey')
  }),
  tags: Object.freeze({
    acid: entry('Acide', 'Acid'),
    'acid-safe': entry('Résiste à l’acide', 'Acid-safe'),
    autocannon: entry('Canon automatique', 'Autocannon'),
    automatic: entry('Automatique', 'Automatic'),
    ballistic: entry('Balistique', 'Ballistic'),
    breaching: entry('Ouverture de brèche', 'Breaching'),
    burst: entry('Rafales', 'Burst fire'),
    charged: entry('Tir chargé', 'Charged shot'),
    chemical: entry('Chimique', 'Chemical'),
    cqw: entry('Combat en espace clos', 'Close quarters'),
    cryo: entry('Cryogénique', 'Cryogenic'),
    electric: entry('Électrique', 'Electric'),
    energy: entry('Énergie', 'Energy'),
    explosive: entry('Explosif', 'Explosive'),
    field: entry('Terrain', 'Field'),
    flame: entry('Incendiaire', 'Incendiary'),
    'flame-projectile': entry('Projectile incendiaire', 'Incendiary projectile'),
    flamethrower: entry('Projection de flammes', 'Flame projection'),
    flechette: entry('Fléchettes', 'Flechettes'),
    'fuel-canister': entry('Bidon de carburant', 'Fuel canister'),
    handgun: entry('Arme de poing', 'Sidearm'),
    heavy: entry('Arme lourde', 'Heavy weapon'),
    laser: entry('Laser', 'Laser'),
    launcher: entry('Lanceur', 'Launcher'),
    melee: entry('Mêlée', 'Melee'),
    plasma: entry('Plasma', 'Plasma'),
    portable: entry('Portable', 'Portable'),
    precision: entry('Tir de précision', 'Precision fire'),
    revolver: entry('Revolver', 'Revolver'),
    rifle: entry('Fusil', 'Rifle'),
    rotary: entry('Canons rotatifs', 'Rotary barrels'),
    scattershot: entry('Tir dispersé', 'Scattershot'),
    sentry: entry('Tourelle', 'Sentry gun'),
    shotgun: entry('Fusil à pompe', 'Shotgun'),
    sidearm: entry('Arme de poing', 'Sidearm'),
    silent: entry('Silencieuse', 'Silent'),
    smart: entry('Arme intelligente', 'Smart weapon'),
    smg: entry('Pistolet-mitrailleur', 'Submachine gun'),
    sonic: entry('Sonique', 'Sonic'),
    tool: entry('Outil', 'Tool')
  }),
  animationStatus: Object.freeze({ missing: entry('Manquantes', 'Missing') }),
  missionAtlasStatus: Object.freeze({ 'not-created': entry('Aucun atlas d’action créé', 'No action atlas created') }),
  visualMode: Object.freeze({ 'static-pose': entry('Pose fixe', 'Static pose') }),
  encounterStatus: Object.freeze({
    'bioforge-only': entry('Bioforge uniquement', 'Bioforge only'),
    'documentary-only': entry('Référence documentaire, hors combat', 'Documentary reference, non-combat'),
    'project-adaptation': entry('Adaptation du projet', 'Project adaptation')
  }),
  specializedBehaviorStatus: Object.freeze({
    'project-synth-behavior-v110': entry('Comportement synthétique du projet', 'Project synthetic behavior'),
    'simplified-campaign-behavior': entry('Comportement simplifié', 'Simplified behavior'),
    'source-grounded-partial-v89': entry('Documentée, adaptation partielle', 'Documented, partial adaptation'),
    'source-grounded-partial-v90': entry('Documentée, adaptation partielle', 'Documented, partial adaptation'),
    'source-grounded-partial-v95': entry('Documentée, adaptation partielle', 'Documented, partial adaptation')
  }),
  statsPolicy: Object.freeze({
    'v121-original-project-tuning-not-source-statistics': entry('Réglages Tantalus ; performances officielles non attestées', 'Tantalus settings; official performance not attested'),
    'v122-original-project-tuning-not-source-statistics': entry('Réglages Tantalus ; performances officielles non attestées', 'Tantalus settings; official performance not attested')
  }),
  seatPolicy: Object.freeze({
    'uncrewed-remote-operation-no-human-seats': entry('Téléopération ; aucun siège humain', 'Teleoperation; no human seat'),
    'v121-simulation-crew-stations-not-source-certified-crew-count': entry('Postes de simulation ; équipage officiel non attesté', 'Simulation stations; official crew not attested'),
    'v122-simulation-stations-not-source-certified-crew-count': entry('Postes de simulation ; équipage officiel non attesté', 'Simulation stations; official crew not attested')
  }),
  controlMode: Object.freeze({
    'piloted-industrial-vehicle': entry('Véhicule de chantier piloté', 'Crewed construction vehicle'),
    'teleoperated-uncrewed-rover': entry('Rover téléopéré, sans pilote à bord', 'Teleoperated rover, no pilot aboard')
  })
});

// Field keys whose values are group ids of the glossary above: [catalog|null, level].
// null keeps the record's own catalog (a weapon family is not a vehicle family).
const VALUE_GROUP_LEVELS_V188 = Object.freeze({
  family: [null, 'family'], biology: ['enemies', 'family'], caste: ['enemies', 'caste'],
  stage: ['enemies', 'stage'], role: ['enemies', 'role'], grade: ['equipment', 'type'],
  utility: ['equipment', 'category']
});

/** Player label of one dossier value, or null when the value is not a known
 * enum id (free text, names, numbers): the caller then keeps the value. */
export function catalogValueLabelV188(key, value, { catalog, language = 'fr' } = {}) {
  if (typeof value !== 'string') return null;
  if (Object.hasOwn(VALUE_GROUP_LEVELS_V188, key)) {
    const [fixed, kind] = VALUE_GROUP_LEVELS_V188[key];
    const label = groupLabelV188(value, { catalog: fixed || catalog, kind, language });
    if (label) return label;
  }
  const table = Object.hasOwn(CATALOG_VALUE_GLOSSARY_V188, key) ? CATALOG_VALUE_GLOSSARY_V188[key] : null;
  const found = table && Object.hasOwn(table, value) ? table[value] : null;
  return found ? found[language === 'en' ? 'en' : 'fr'] : null;
}

/** Every [key, id, fr, en] row of the value glossary (tests and catalog maintenance). */
export function catalogValueGlossaryRowsV188() {
  return Object.entries(CATALOG_VALUE_GLOSSARY_V188).flatMap(([key, table]) => Object.entries(table)
    .map(([id, label]) => [key, id, label.fr, label.en]));
}
