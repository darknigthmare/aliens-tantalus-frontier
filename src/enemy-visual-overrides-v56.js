const MODIFIER_PREFIXES = Object.freeze([
  'Acid-Blooded', 'Cryo-Adapted', 'Vacuum-Adapted', 'Neuro-Linked',
  'Hive Guard', 'Albino', 'Armored', 'Apex', 'Juvenile', 'Elder'
]);

export const ENEMY_VISUAL_OVERRIDE_IDENTITY_V56 = Object.freeze({
  exact: 'exact',
  family: 'authored-family',
  adaptation: 'project-adaptation',
  original: 'project-original'
});

const identityForReference = (referenceStatus) => referenceStatus === 'CANON_REFERENCE'
  ? ENEMY_VISUAL_OVERRIDE_IDENTITY_V56.exact
  : referenceStatus === 'PROJECT_ORIGINAL'
    ? ENEMY_VISUAL_OVERRIDE_IDENTITY_V56.original
    : ENEMY_VISUAL_OVERRIDE_IDENTITY_V56.adaptation;


const override = ({
  archetype, spriteKey, sheetId, path, hitboxId, width, height, baseProfileId, referenceStatus = 'CANON_REFERENCE'
}) => Object.freeze({
  archetype,
  spriteKey,
  sheetId,
  path,
  hitboxId,
  renderSize: Object.freeze({ width, height }),
  renderWidth: width,
  renderHeight: height,
  sourceFacing: 1,
  identityStatus: identityForReference(referenceStatus),
  approximate: false,
  fallbackReason: null,
  baseProfileId,
  catalogProfileId: baseProfileId,
  wave: 'v56',
  referenceLocked: true,
  referenceStatus,
  canonExact: referenceStatus === 'CANON_REFERENCE'
});

export const ENEMY_VISUAL_OVERRIDES_V56 = Object.freeze({
  'Drone / Big Chap': override({
    archetype: 'Drone / Big Chap',
    spriteKey: 'xenoBigChapV56',
    sheetId: 'enemy.xenomorph-big-chap.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-big-chap-action-sheet-v56.png',
    hitboxId: 'xenomorph-standing',
    width: 148,
    height: 116,
    baseProfileId: 'enemy-004-drone-big-chap'
  }),
  Warrior: override({
    archetype: 'Warrior',
    spriteKey: 'xenoWarriorV56',
    sheetId: 'enemy.xenomorph-warrior.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-warrior-action-sheet-v56.png',
    hitboxId: 'xenomorph-standing',
    width: 162,
    height: 124,
    baseProfileId: 'enemy-005-warrior'
  }),
  Queen: override({
    archetype: 'Queen',
    spriteKey: 'xenoQueenV56',
    sheetId: 'enemy.xenomorph-queen.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-queen-action-sheet-v56.png',
    hitboxId: 'queen-standing',
    width: 448,
    height: 340,
    baseProfileId: 'enemy-008-queen'
  }),
  Xenoborg: override({
    archetype: 'Xenoborg',
    spriteKey: 'xenoborgV56',
    sheetId: 'enemy.xenoborg.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/xenoborg-action-sheet-v56.png',
    hitboxId: 'xenomorph-standing',
    width: 164,
    height: 136,
    baseProfileId: 'enemy-022-xenoborg'
  }),
  'Weyland-Yutani Commando': override({
    archetype: 'Weyland-Yutani Commando',
    spriteKey: 'weylandYutaniCommandoV56',
    sheetId: 'enemy.weyland-yutani-commando.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/weyland-yutani-commando-action-sheet-v56.png',
    hitboxId: 'npc-standing',
    width: 96,
    height: 132,
    baseProfileId: 'enemy-043-weyland-yutani-commando'
  }),
  'Seegson Security': override({
    archetype: 'Seegson Security',
    spriteKey: 'seegsonSecurityV56',
    sheetId: 'enemy.seegson-security.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/seegson-security-action-sheet-v56.png',
    hitboxId: 'npc-standing',
    width: 96,
    height: 132,
    baseProfileId: 'enemy-045-seegson-security'
  }),
  Boiler: override({
    archetype: 'Boiler',
    spriteKey: 'xenoBoilerV56',
    sheetId: 'enemy.xenomorph-boiler.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-boiler-action-sheet-v56.png',
    hitboxId: 'xenomorph-standing',
    width: 152,
    height: 110,
    baseProfileId: 'enemy-014-boiler'
  }),
  Prowler: override({
    archetype: 'Prowler',
    spriteKey: 'xenoProwlerV56',
    sheetId: 'enemy.xenomorph-prowler.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-prowler-action-sheet-v56.png',
    hitboxId: 'runner-ground',
    width: 174,
    height: 96,
    baseProfileId: 'enemy-015-prowler'
  }),
  Burster: override({
    archetype: 'Burster',
    spriteKey: 'xenoBursterV56',
    sheetId: 'enemy.xenomorph-burster.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-burster-action-sheet-v56.png',
    hitboxId: 'runner-ground',
    width: 162,
    height: 92,
    baseProfileId: 'enemy-016-burster'
  }),
  'Monica Line': override({
    archetype: 'Monica Line',
    spriteKey: 'monicaLineV56',
    sheetId: 'enemy.monica-line.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/monica-line-action-sheet-v56.png',
    hitboxId: 'xenomorph-standing',
    width: 164,
    height: 126,
    baseProfileId: 'enemy-017-monica-line',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Specimen Six Line': override({
    archetype: 'Specimen Six Line',
    spriteKey: 'specimenSixLineV56',
    sheetId: 'enemy.specimen-six-line.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/specimen-six-line-action-sheet-v56.png',
    hitboxId: 'xenomorph-standing',
    width: 160,
    height: 122,
    baseProfileId: 'enemy-018-specimen-six-line',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Neuro-Xeno Drone': override({
    archetype: 'Neuro-Xeno Drone',
    spriteKey: 'neuroXenoDroneV56',
    sheetId: 'enemy.neuro-xeno-drone.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/neuro-xeno-drone-action-sheet-v56.png',
    hitboxId: 'neuro-xeno-ground',
    width: 176,
    height: 104,
    baseProfileId: 'enemy-021-neuro-xeno-drone',
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  'ATARAX Ripper': override({
    archetype: 'ATARAX Ripper',
    spriteKey: 'ataraxRipperV56',
    sheetId: 'enemy.atarax-ripper.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/atarax-ripper-action-sheet-v56.png',
    hitboxId: 'atarax-ripper-ground',
    width: 184,
    height: 112,
    baseProfileId: 'enemy-023-atarax-ripper',
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  'Dust Runner': override({
    archetype: 'Dust Runner',
    spriteKey: 'dustRunnerV56',
    sheetId: 'enemy.dust-runner.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/dust-runner-action-sheet-v56.png',
    hitboxId: 'runner-ground',
    width: 170,
    height: 88,
    baseProfileId: 'enemy-031-dust-runner',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Trilobite Echo': override({
    archetype: 'Trilobite Echo',
    spriteKey: 'trilobiteEchoV56',
    sheetId: 'enemy.trilobite-echo.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/trilobite-echo-action-sheet-v56.png',
    hitboxId: 'trilobite-sprawl',
    width: 184,
    height: 104,
    baseProfileId: 'enemy-035-trilobite-echo',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Deacon Line': override({
    archetype: 'Deacon Line',
    spriteKey: 'deaconLineV56',
    sheetId: 'enemy.deacon-line.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/deacon-line-action-sheet-v56.png',
    hitboxId: 'xenomorph-standing',
    width: 148,
    height: 136,
    baseProfileId: 'enemy-036-deacon-line',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  Protomorph: override({
    archetype: 'Protomorph',
    spriteKey: 'protomorphV56',
    sheetId: 'enemy.protomorph.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/protomorph-action-sheet-v56.png',
    hitboxId: 'xenomorph-standing',
    width: 164,
    height: 136,
    baseProfileId: 'enemy-038-protomorph',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  Abomination: override({
    archetype: 'Abomination',
    spriteKey: 'pathogenAbominationV56',
    sheetId: 'enemy.abomination-pathogen-brute.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/abomination-pathogen-brute-action-sheet-v56.png',
    hitboxId: 'crusher-large',
    width: 190,
    height: 132,
    baseProfileId: 'enemy-039-abomination',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'UPP Vanguard': override({
    archetype: 'UPP Vanguard',
    spriteKey: 'uppVanguardV56',
    sheetId: 'enemy.upp-vanguard.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/upp-vanguard-action-sheet-v56.png',
    hitboxId: 'npc-standing',
    width: 98,
    height: 134,
    baseProfileId: 'enemy-044-upp-vanguard',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Wild Boar Host': override({
    archetype: 'Wild Boar Host',
    spriteKey: 'wildBoarHostV56',
    sheetId: 'enemy.wild-boar-host.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/wild-boar-host-action-sheet-v56.png',
    hitboxId: 'boar-ground',
    width: 158,
    height: 88,
    baseProfileId: 'enemy-049-wild-boar-host',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Colonial Raider': override({
    archetype: 'Colonial Raider',
    spriteKey: 'colonialRaiderV56',
    sheetId: 'enemy.colonial-raider.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/colonial-raider-action-sheet-v56.png',
    hitboxId: 'npc-standing',
    width: 98,
    height: 138,
    baseProfileId: 'enemy-046-colonial-raider',
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  'ATARAX Controller': override({
    archetype: 'ATARAX Controller',
    spriteKey: 'ataraxControllerV56',
    sheetId: 'enemy.atarax-controller.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/atarax-controller-action-sheet-v56.png',
    hitboxId: 'npc-standing',
    width: 100,
    height: 142,
    baseProfileId: 'enemy-047-atarax-controller',
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  'Korari Stalker': override({
    archetype: 'Korari Stalker',
    spriteKey: 'korariStalkerV56',
    sheetId: 'enemy.korari-stalker.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/korari-stalker-action-sheet-v56.png',
    hitboxId: 'korari-stalker-ground',
    width: 176,
    height: 88,
    baseProfileId: 'enemy-050-korari-stalker',
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  'Ceto Reef Predator': override({
    archetype: 'Ceto Reef Predator',
    spriteKey: 'cetoReefPredatorV56',
    sheetId: 'enemy.ceto-reef-predator.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/ceto-reef-predator-action-sheet-v56.png',
    hitboxId: 'ceto-reef-predator-water',
    width: 186,
    height: 82,
    baseProfileId: 'enemy-051-ceto-reef-predator',
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  'Tantalus Tunnel Vermin': override({
    archetype: 'Tantalus Tunnel Vermin',
    spriteKey: 'tantalusTunnelVerminV56',
    sheetId: 'enemy.tantalus-tunnel-vermin.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/tantalus-tunnel-vermin-action-sheet-v56.png',
    hitboxId: 'tantalus-tunnel-vermin-ground',
    width: 180,
    height: 76,
    baseProfileId: 'enemy-052-tantalus-tunnel-vermin',
    referenceStatus: 'PROJECT_ORIGINAL'
  }),
  'Foundry Drone': override({
    archetype: 'Foundry Drone',
    spriteKey: 'foundryDroneV56',
    sheetId: 'enemy.foundry-drone.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/foundry-drone-action-sheet-v56.png',
    hitboxId: 'xenomorph-standing',
    width: 164,
    height: 126,
    baseProfileId: 'enemy-025-foundry-drone',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Foundry Crusher': override({
    archetype: 'Foundry Crusher',
    spriteKey: 'foundryCrusherV56',
    sheetId: 'enemy.foundry-crusher.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/foundry-crusher-action-sheet-v56.png',
    hitboxId: 'crusher-large',
    width: 190,
    height: 128,
    baseProfileId: 'enemy-026-foundry-crusher',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Reef Stalker': override({
    archetype: 'Reef Stalker',
    spriteKey: 'reefStalkerV56',
    sheetId: 'enemy.reef-stalker.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/reef-stalker-action-sheet-v56.png',
    hitboxId: 'lurker-medium',
    width: 174,
    height: 92,
    baseProfileId: 'enemy-027-reef-stalker',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Reef Spitter': override({
    archetype: 'Reef Spitter',
    spriteKey: 'reefSpitterV56',
    sheetId: 'enemy.reef-spitter.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/reef-spitter-action-sheet-v56.png',
    hitboxId: 'spitter-medium',
    width: 172,
    height: 120,
    baseProfileId: 'enemy-028-reef-spitter',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Siege Royal': override({
    archetype: 'Siege Royal',
    spriteKey: 'siegeRoyalV56',
    sheetId: 'enemy.siege-royal.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/siege-royal-action-sheet-v56.png',
    hitboxId: 'praetorian-large',
    width: 180,
    height: 142,
    baseProfileId: 'enemy-029-siege-royal',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Salvage Hive Brute': override({
    archetype: 'Salvage Hive Brute',
    spriteKey: 'salvageHiveBruteV56',
    sheetId: 'enemy.salvage-hive-brute.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/salvage-hive-brute-action-sheet-v56.png',
    hitboxId: 'crusher-large',
    width: 184,
    height: 124,
    baseProfileId: 'enemy-032-salvage-hive-brute',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Arcology Lurker': override({
    archetype: 'Arcology Lurker',
    spriteKey: 'arcologyLurkerV56',
    sheetId: 'enemy.arcology-lurker.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/arcology-lurker-action-sheet-v56.png',
    hitboxId: 'lurker-medium',
    width: 166,
    height: 96,
    baseProfileId: 'enemy-033-arcology-lurker',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Caravan Stalker': override({
    archetype: 'Caravan Stalker',
    spriteKey: 'caravanStalkerV56',
    sheetId: 'enemy.caravan-stalker.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/caravan-stalker-action-sheet-v56.png',
    hitboxId: 'runner-ground',
    width: 174,
    height: 92,
    baseProfileId: 'enemy-034-caravan-stalker',
    referenceStatus: 'PROJECT_ADAPTATION'
  }),
  'Cult Host': override({
    archetype: 'Cult Host',
    spriteKey: 'cultHostV56',
    sheetId: 'enemy.cult-host.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/cult-host-action-sheet-v56.png',
    hitboxId: 'npc-standing',
    width: 98,
    height: 140,
    baseProfileId: 'enemy-048-cult-host',
    referenceStatus: 'PROJECT_ADAPTATION'
  })
});

export const ENEMY_VISUAL_OVERRIDE_ARCHETYPES_V56 = Object.freeze(
  Object.keys(ENEMY_VISUAL_OVERRIDES_V56)
);

export const ENEMY_VISUAL_OVERRIDE_BASE_PROFILE_IDS_V56 = Object.freeze(
  Object.values(ENEMY_VISUAL_OVERRIDES_V56).map((entry) => entry.baseProfileId)
);

const familyReuse = (entry, catalogProfileId, label) => Object.freeze({
  ...entry,
  catalogProfileId: catalogProfileId || null,
  identityStatus: ENEMY_VISUAL_OVERRIDE_IDENTITY_V56.family,
  approximate: true,
  fallbackReason: `La plaque exacte de ${entry.archetype} est réemployée pour ${label}; le modifier systémique n'est pas dessiné séparément.`
});

const sourceName = (source) => typeof source === 'string'
  ? source.trim()
  : String(source?.archetype ?? source?.name ?? '').trim();

export function resolveEnemyVisualOverrideV56(source = {}) {
  const rawName = sourceName(source);
  if (!rawName) return null;
  const profileId = typeof source === 'object' && source !== null
    ? String(source.id ?? '').trim()
    : '';

  const direct = ENEMY_VISUAL_OVERRIDES_V56[rawName];
  if (direct) {
    const modifier = typeof source === 'object' && source !== null
      ? String(source.modifier ?? '').trim()
      : '';
    const systemic = typeof source === 'object' && source !== null
      && source.provenance === 'systemic-variant';
    return systemic || (modifier && modifier !== 'Standard')
      ? familyReuse(direct, profileId, rawName)
      : direct;
  }

  for (const prefix of MODIFIER_PREFIXES) {
    const marker = `${prefix} `;
    if (!rawName.startsWith(marker)) continue;
    const archetype = rawName.slice(marker.length).trim();
    const entry = ENEMY_VISUAL_OVERRIDES_V56[archetype];
    return entry ? familyReuse(entry, profileId, rawName) : null;
  }
  return null;
}
