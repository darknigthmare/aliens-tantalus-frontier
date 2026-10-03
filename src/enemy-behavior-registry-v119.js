import { getEnemyCatalogPolicyV105 } from './enemy-catalog-taxonomy-v105.js';

// Authored 2D behavior contracts. Identity is explicit; array position, stats,
// sprite colour and random catalog generation are never biological evidence.
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const base = (id, runtimeBehavior, locomotion, combat, options = {}) => freeze({
  id, runtimeBehavior, locomotion, combat, awareness: 'proximity-and-visible-motion',
  pursuit: 'direct-approach', retreat: 'reposition', packBehavior: 'independent',
  environment: ['ground', 'obstacles'], psychology: null,
  perception: { vision: 620, noise: 420, proximity: 100, movement: true },
  ...options,
  trials: { aggression: .62, patience: .3, reactionTime: .26, spacingDiscipline: .7,
    guardProbability: .18, dodgeProbability: .18, jumpUsage: .08, antiAirAwareness: .5,
    punishAwareness: .55, specialUsage: .5, comboPressure: .45, retreatThreshold: .24,
    cornerPressure: .6, preferredRange: 38, minimumRange: 8, maximumRange: 150, ...options.trials }
});
export const ENEMY_BEHAVIOR_PROFILES_V119 = freeze({
  'safe-contact': base('safe-contact', 'stalker', 'ground', 'adapted-contact', { trials: { aggression: .4, specialUsage: .1, jumpUsage: 0, guardProbability: 0 } }),
  'egg-cycle': base('egg-cycle', 'egg', 'stationary', 'incubation-trigger', { pursuit: 'none', retreat: 'none', trials: { aggression: 0, jumpUsage: 0, guardProbability: 0 } }),
  parasite: base('parasite', 'pouncer', 'low-scramble', 'attachment-pounce', { pursuit: 'host-interception', trials: { aggression: .8, jumpUsage: .38, guardProbability: 0, preferredRange: 16 } }),
  juvenile: base('juvenile', 'hunter', 'low-crawl', 'low-bite', { retreat: 'escape-contact', trials: { guardProbability: 0, jumpUsage: 0, preferredRange: 12 } }),
  drone: base('drone', 'stalker', 'biped-stalk', 'claw-bite', { pursuit: 'stalk-and-approach', environment: ['ground', 'darkness', 'vents'], trials: { patience: .5, aggression: .5 } }),
  warrior: base('warrior', 'hunter', 'biped-run', 'tail-claw', { packBehavior: 'pressure-coordination', trials: { aggression: .78, comboPressure: .7 } }),
  runner: base('runner', 'pouncer', 'quadruped-fast', 'mobile-pounce', { pursuit: 'flank-and-pounce', verticality: 'high', packBehavior: 'mobile-pressure', trials: { aggression: .8, reactionTime: .2, jumpUsage: .3, dodgeProbability: .55, guardProbability: 0, spacingDiscipline: .9, specialUsage: .7 } }),
  guardian: base('guardian', 'bruiser', 'heavy-ground', 'territorial-melee', { pursuit: 'territorial-pressure', trials: { guardProbability: .6, jumpUsage: 0, preferredRange: 46 } }),
  royal: base('royal', 'boss', 'heavy-ground', 'royal-melee', { pursuit: 'hive-defense', packBehavior: 'hive-command-adaptation', trials: { aggression: .72, jumpUsage: 0, specialUsage: .72, preferredRange: 52, cornerPressure: .85 } }),
  charger: base('charger', 'charger', 'heavy-ground', 'telegraphed-charge', { pursuit: 'space-pressure', trials: { aggression: .88, guardProbability: .12, jumpUsage: 0, specialUsage: .85, preferredRange: 130, maximumRange: 220 } }),
  acid: base('acid', 'spitter', 'ground', 'acid-projectile', { pursuit: 'maintain-line-of-fire', trials: { preferredRange: 290, minimumRange: 130, maximumRange: 560, specialUsage: .9, spacingDiscipline: .95, jumpUsage: 0 } }),
  ambusher: base('ambusher', 'pouncer', 'ground-pounce', 'ambush-pounce', { pursuit: 'stalk-and-pounce', trials: { patience: .55, jumpUsage: .25, dodgeProbability: .4, guardProbability: 0, specialUsage: .75, preferredRange: 110 } }),
  explosive: base('explosive', 'exploder', 'ground', 'proximity-burst', { pursuit: 'close-and-burst', retreat: 'none', trials: { aggression: .95, guardProbability: 0, jumpUsage: 0, specialUsage: .9, preferredRange: 20 } }),
  grappler: base('grappler', 'grappler', 'biped-heavy', 'announced-grapple', { trials: { aggression: .7, jumpUsage: 0, preferredRange: 26 } }),
  'reach-hunter': base('reach-hunter', 'reach-hunter', 'biped-tall', 'long-reach-melee', { trials: { aggression: .68, jumpUsage: 0, preferredRange: 72 } }),
  'hybrid-boss': base('hybrid-boss', 'hybrid-boss', 'biped-heavy', 'hybrid-melee', { trials: { aggression: .8, jumpUsage: .02, preferredRange: 52 } }),
  synth: base('synth', 'shooter', 'humanoid-measured', 'ranged-synthetic', { awareness: 'visible-target-tracking', pursuit: 'firing-lane', trials: { preferredRange: 270, minimumRange: 120, maximumRange: 590, reactionTime: .22, guardProbability: .55, jumpUsage: .04, punishAwareness: .85, specialUsage: .8 } }),
  'synth-melee': base('synth-melee', 'bruiser', 'humanoid-measured', 'synthetic-contact', { trials: { jumpUsage: 0, guardProbability: .5, aggression: .65, preferredRange: 32 } }),
  human: base('human', 'shooter', 'humanoid', 'ranged-cover', { awareness: 'vision-and-noise', pursuit: 'cover-and-range', psychology: { morale: 'situational', retreat: 'regroup', fear: 'contextual' }, trials: { reactionTime: .29, preferredRange: 250, minimumRange: 105, maximumRange: 550, guardProbability: .65, dodgeProbability: .35, jumpUsage: .06, punishAwareness: .8, specialUsage: .7 } }),
  automaton: base('automaton', 'shooter', 'mechanical-ground', 'mechanical-ranged', { awareness: 'visible-target-tracking', trials: { preferredRange: 260, minimumRange: 100, maximumRange: 560, guardProbability: .15, jumpUsage: 0, reactionTime: .2, specialUsage: .8 } }),
  engineer: base('engineer', 'bruiser', 'biped-heavy', 'adapted-heavy-contact', { trials: { jumpUsage: 0, preferredRange: 50, guardProbability: .4 } }),
  aquatic: base('aquatic', 'aquatic', 'swim', 'aquatic-contact', { environment: ['water'], pursuit: 'water-interception', trials: { jumpUsage: 0, guardProbability: 0 } }),
  flying: base('flying', 'hunter', 'fly', 'aerial-contact', { environment: ['air'], trials: { guardProbability: 0, jumpUsage: .4 } }),
  fauna: base('fauna', 'hunter', 'quadruped-ground', 'animal-contact', { trials: { guardProbability: 0, jumpUsage: .12, aggression: .55 } })
});

// Explicit legacy seed identities. A project-authored lineage can inherit a
// mechanical archetype, but never acquires a canonical biology by doing so.
const IDENTITIES = freeze({
  Ovomorph: 'egg-cycle', Facehugger: 'parasite', Chestburster: 'juvenile',
  'Drone / Big Chap': 'drone', Warrior: 'warrior', Runner: 'runner', Praetorian: 'guardian', Queen: 'royal',
  Crusher: 'charger', Spitter: 'acid', Lurker: 'ambusher', Carrier: 'guardian', Ravager: 'warrior',
  Boiler: 'explosive', Prowler: 'ambusher', Burster: 'explosive', 'Monica Line': 'drone', 'Specimen Six Line': 'warrior',
  'Red Xenomorph': 'warrior', 'K-Series Yellow Xenomorph': 'warrior', 'Neuro-Xeno Drone': 'drone', Xenoborg: 'synth',
  'ATARAX Ripper': 'warrior', 'Ripper Queen': 'royal', 'Foundry Drone': 'drone', 'Foundry Crusher': 'charger',
  'Reef Stalker': 'ambusher', 'Reef Spitter': 'acid', 'Siege Royal': 'royal', 'Pale Crucible Hunter': 'drone',
  'Dust Runner': 'runner', 'Salvage Hive Brute': 'guardian', 'Arcology Lurker': 'ambusher', 'Caravan Stalker': 'drone',
  'Trilobite Echo': 'parasite', 'Deacon Line': 'drone', Neomorph: 'ambusher', Protomorph: 'warrior',
  Abomination: 'hybrid-boss', 'Pathogen Mimic': 'ambusher', 'Working Joe': 'synth-melee', 'Combat Synthetic': 'synth',
  'Weyland-Yutani Commando': 'human', 'UPP Vanguard': 'human', 'Seegson Security': 'human', 'Colonial Raider': 'human',
  'ATARAX Controller': 'human', 'Cult Host': 'human', 'Wild Boar Host': 'fauna', 'Korari Stalker': 'ambusher',
  'Ceto Reef Predator': 'aquatic', 'Tantalus Tunnel Vermin': 'fauna', Newborn: 'grappler', Offspring: 'reach-hunter', Predalien: 'hybrid-boss'
});
const SOURCE_SUFFIXES = freeze([
  ['facehugger', 'parasite'], ['chestburster', 'juvenile'], ['ovomorph', 'egg-cycle'], ['ovomorphe', 'egg-cycle'],
  ['pathogen_runner', 'runner'], ['runner', 'runner'], ['prowler', 'ambusher'], ['crusher', 'charger'],
  ['spitter', 'acid'], ['queen', 'royal'], ['praetorian', 'guardian'], ['warrior', 'warrior'],
  ['drone', 'drone'], ['big_chap', 'drone'], ['lurker', 'ambusher'], ['burster', 'explosive'],
  ['boiler', 'explosive'], ['exploder', 'explosive'], ['ravager', 'warrior'], ['newborn', 'grappler'],
  ['offspring', 'reach-hunter'], ['predalien', 'hybrid-boss'], ['working_joe', 'synth-melee'],
  ['joe_battle', 'synth-melee'], ['synth_containment', 'guardian'], ['synth_detonator', 'explosive'],
  ['synth_incinerator', 'synth'], ['synth_trooper', 'synth'], ['synth_guard', 'synth-melee'],
  ['synth_heavy', 'synth'], ['synth_sniper', 'synth'], ['synth_enforcer', 'synth'], ['combat_synthetic', 'synth'],
  ['neomorph', 'ambusher'], ['deacon', 'drone'], ['xenoborg', 'synth'], ['abomination', 'hybrid-boss'],
  ['carrier', 'guardian'], ['pathogen_popper', 'explosive'], ['pathogen_stalker', 'ambusher'],
  ['arachnoid', 'warrior'], ['chrysalis', 'guardian'], ['razor_claws', 'warrior'],
  ['royal_guard', 'guardian'], ['smasher', 'guardian'], ['stalker', 'ambusher'], ['grid', 'warrior'],
  ['kenner_gorilla', 'guardian'], ['kenner_rhino', 'charger'], ['kenner_panther', 'runner'], ['kenner_mantis', 'warrior']
]);
const SPECIALIZED = freeze({
  'enemy-001-ovomorph': 'ovomorph-lifecycle-v66', 'enemy-002-facehugger': 'facehugger-combat-v65',
  'enemy-003-chestburster': 'enemy-batch-combat-v66', 'enemy-004-drone-big-chap': 'enemy-batch-combat-v66',
  'enemy-005-warrior': 'enemy-batch-combat-v66', 'enemy-006-runner': 'enemy-batch-combat-v66',
  'enemy-009-crusher': 'crusher-charge-v66', 'enemy-015-prowler': 'prowler-pounce-v66',
  'enemy-016-burster': 'burster-combat-v74', 'enemy-049-wild-boar-host': 'enemy-batch-combat-v81',
  'enemy-050-korari-stalker': 'enemy-batch-combat-v66', 'enemy-051-ceto-reef-predator': 'ceto-aquatic-v75',
  'enemy-569-newborn': 'enemy-combat-v64', 'enemy-570-offspring': 'enemy-combat-v64', 'enemy-571-predalien': 'enemy-combat-v64'
});
const MODIFIERS = freeze({
  Standard: { id: 'standard' }, Albino: { id: 'albino', scope: 'appearance-only' },
  Armored: { id: 'armored', scope: 'physical-armor', trials: { jumpUsage: .02 } },
  'Acid-Blooded': { id: 'acid-blooded', scope: 'blood-hazard-not-cognition' },
  'Cryo-Adapted': { id: 'cryo-adapted', scope: 'temperature-not-cognition' },
  'Vacuum-Adapted': { id: 'vacuum-adapted', scope: 'environment-not-cognition' },
  'Hive Guard': { id: 'hive-guard', scope: 'territorial-duty', trials: { retreatThreshold: .1 } },
  Apex: { id: 'apex', scope: 'project-physical-variant' }, Juvenile: { id: 'juvenile', scope: 'project-life-stage' },
  Elder: { id: 'elder', scope: 'project-life-stage' }, 'Neuro-Linked': { id: 'neuro-linked', scope: 'project-control-interface' }
});
const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
const ownValue = (registry, key) => typeof key === 'string' && Object.hasOwn(registry, key) ? registry[key] : null;
const FAMILIES = new Set(['human', 'synthetic', 'automaton', 'engineer', 'mala-kak', 'fauna', 'xenomorph', 'pathogen', 'hybrid']);
const UNKNOWN_SOURCE = new Set(['unknown', 'to_define', 'a_definir', 'unverified', '']);
const sourceText = value => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const text = value.trim();
  return UNKNOWN_SOURCE.has(normalize(text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) ? null : text;
};
function familyFor(entry) {
  // The shared authored policy already distinguishes autonomous machines and
  // the supplied Engineer reference from obsolete biology fields. Consult it
  // without changing the saved ID, source record, health or physical geometry.
  for (const family of [entry.taxonomy?.family, entry.catalogPolicyV105?.family,
    getEnemyCatalogPolicyV105(entry).family, entry.family]) {
    if (FAMILIES.has(family)) return family;
  }
  return 'to-define';
}
function compatibleIdentity(id, family, token = '') {
  // A title on human armour is not a xenomorph caste. Exact synthetic weapon
  // contracts remain eligible: Containment/Detonator are not organic guardians
  // or Bursters merely because their 2D mechanics share an archetype.
  if (family === 'human') return id === 'human';
  if (family === 'engineer' || family === 'mala-kak') return id === 'engineer';
  if (family === 'automaton') return id === 'automaton';
  if (family === 'synthetic') return ['synth', 'synth-melee'].includes(id)
    || /^synth_/.test(token) && ['guardian', 'explosive'].includes(id);
  return true;
}
function identify(entry, family) {
  const legacyId = String(entry.profileId || entry.id || '');
  const legacySuffix = legacyId.match(/^enemy-\d{3}-(.+)$/)?.[1];
  const declaredBase = entry.biologicalBase || entry.name;
  const expectedName = entry.modifier && entry.modifier !== 'Standard' ? `${entry.modifier} ${declaredBase}` : declaredBase;
  // Exact legacy identity is required for a specialized contract. Copying a
  // dossier then appending "-copy" must not smuggle its reviewed charger in.
  const unregisteredLegacyAlias = legacySuffix && declaredBase && !ownValue(SPECIALIZED, legacyId)
    && normalize(legacySuffix) !== normalize(expectedName);
  if (unregisteredLegacyAlias) return { id: 'safe-contact', explicit: false };
  for (const identity of [entry.biologicalBase, entry.name]) {
    const id = ownValue(IDENTITIES, identity);
    if (id && compatibleIdentity(id, family)) return { id, explicit: true };
  }
  const identity = normalize(entry.basename || entry.profileId || entry.id);
  for (const [token, id] of SOURCE_SUFFIXES) {
    if (compatibleIdentity(id, family, token) && new RegExp(`(?:^|_)${token}(?:_|$)`).test(identity)) return { id, explicit: true };
  }
  // Unknown drawings stay unknown. A safe family fallback does not certify a
  // caste, powers, locomotion or intelligence inferred from their illustration.
  const id = family === 'human' ? 'human' : family === 'synthetic' ? 'synth-melee'
    : family === 'automaton' ? 'automaton' : ['engineer', 'mala-kak'].includes(family) ? 'engineer'
      : family === 'fauna' ? 'fauna' : 'safe-contact';
  return { id, explicit: false };
}
export function resolveEnemyBehaviorV119(entry = {}) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) entry = {};
  const family = familyFor(entry), found = identify(entry, family), baseProfile = ENEMY_BEHAVIOR_PROFILES_V119[found.id];
  const specialized = ownValue(SPECIALIZED, entry.profileId || entry.id) || (entry.behaviorContractV110 ? 'synth-or-automaton-contract-v110'
    : entry.behaviorContractV90 ? 'user-behavior-v90' : entry.behaviorContractV89 ? 'user-behavior-v89'
      : entry.specializedBehaviorV95 ? 'user-behavior-v95' : null);
  const modifier = ownValue(MODIFIERS, entry.modifier) || { id: 'unclassified', scope: 'to-define' };
  const status = specialized ? 'specialized' : found.explicit ? 'adapted' : 'to-define';
  const trials = { ...baseProfile.trials, ...modifier.trials };
  if (['human', 'synthetic', 'automaton', 'engineer', 'mala-kak'].includes(family)
    && modifier.id === 'juvenile') Object.assign(trials, baseProfile.trials);
  const contactAutomaton = family === 'automaton' && entry.combatRole !== 'ranged';
  // Respect the existing authored armament; a mechanical family fallback must
  // not grant a gun to a hydraulic loader or remove Good Boy's ranged role.
  const mechanicalCombat = contactAutomaton ? { runtimeBehavior: 'bruiser', combat: 'mechanical-contact', pursuit: 'direct-approach' } : {};
  if (contactAutomaton) Object.assign(trials, { preferredRange: 32, minimumRange: 8, maximumRange: 150 });
  const source = [entry.sourceWork, entry.work, entry.continuity, entry.source,
    entry.source?.work, entry.canonFacts?.source?.work].map(sourceText).find(Boolean) || null;
  return freeze({ ...baseProfile, ...mechanicalCombat, family, profileId: entry.profileId || entry.id || 'unknown', biologicalBase: entry.biologicalBase || null,
    aiProfile: baseProfile.id, caste: entry.caste || 'to-define', modifier: modifier.id, modifierScope: modifier.scope || 'base',
    behaviorStatus: status, specializedRuntime: specialized, safeFallbackProfile: status === 'to-define' ? baseProfile.id : null,
    sourceWork: source || 'À DÉFINIR', sourceConfidence: source ? 'existing-reference-not-behavior-certification' : 'to-define',
    referenceStatus: entry.referenceStatus || 'adapted-gameplay', canonStatus: '2d-gameplay-adaptation-not-canon-certified',
    visualStatus: entry.animationStatus || (entry.artStatus || (entry.path ? 'existing-visual' : 'to-define')), trials,
    psychology: family === 'human' ? baseProfile.psychology : null,
    label: status === 'to-define' ? 'COMPORTEMENT : À DÉFINIR' : specialized ? 'Comportement spécialisé, adaptation 2D' : 'Comportement adapté au simulateur 2D'
  });
}
export function auditEnemyBehaviorsV119(entries = []) {
  return entries.map(entry => {
    const profile = entry.behaviorProfileV119 || resolveEnemyBehaviorV119(entry);
    return { id: entry.id, name: entry.name || entry.label || 'À DÉFINIR', family: entry.biology || entry.taxonomy?.family || 'to-define',
      caste: profile.caste, aiProfile: profile.aiProfile, behaviorStatus: profile.behaviorStatus,
      specializedRuntime: profile.specializedRuntime, locomotion: profile.locomotion, combatMode: profile.combat,
      sourceConfidence: profile.sourceConfidence, sourceWork: profile.sourceWork };
  });
}
