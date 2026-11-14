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
