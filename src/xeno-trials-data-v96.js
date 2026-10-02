import { getEnemyStaticPoseV96 as getEnemyStaticPoseV95 } from './enemy-static-poses-v96.js';
import { getEnemyDedicatedPoseV99 as getEnemyDedicatedPoseV97 } from './enemy-dedicated-poses-v99.js';
import { XENO_TRIALS_IMPORTS_V103 } from './enemy-user-imports-v103.js';
import { XENO_TRIALS_USER_ADMISSIONS_V105 } from './xeno-trials-user-admissions-v105.js';
import { XENO_TRIALS_IMPORTS_V105 } from './enemy-user-imports-v105.js';
import { XENO_TRIALS_IMPORTS_V106 } from './enemy-user-imports-v106.js';
import { XENO_TRIALS_SYNTHS_V110 } from './enemy-synth-adaptations-v110.js';
import { XENO_TRIALS_SYNTHS_V111 } from './enemy-synth-adaptations-v111.js';
import { XENO_TRIALS_AFE2_V112 } from './enemy-afe2-adaptations-v112.js';
import { XENO_TRIALS_AUTOMATONS_V112 } from './enemy-automaton-adaptations-v112.js';
import { XENO_TRIALS_AFE2_V113 } from './enemy-afe2-adaptations-v113.js';
import { XENO_TRIALS_RECONSTRUCTIONS_V113 } from './enemy-user-reconstructions-v113.js';
import { XENO_TRIALS_AUTOMATONS_V116 } from './enemy-automaton-adaptations-v116.js';

const ADAPTATIONS_V112 = Object.freeze([...XENO_TRIALS_AFE2_V112, ...XENO_TRIALS_AUTOMATONS_V112]);
const ADAPTATIONS_V113 = Object.freeze([...XENO_TRIALS_AFE2_V113, ...XENO_TRIALS_RECONSTRUCTIONS_V113]);

/** Xeno Trials is an original, non-canonical WY simulation, not a licensed story.
 * The dedicated source images remain static illustrations, never animation atlases.
 * Tournament statistics below are independent of the campaign's biological tuning. */
export const XENO_TRIALS_LORE_NOTICE_V96 = 'Xeno Trials est une simulation Weyland-Yutani originale du projet. Les doctrines, duels et statistiques ne sont pas canoniques. Visuels dédiés en poses fixes.';
const fighter = (id, profileId, label, role, hp, speed, power, reach, special) => {
  const art = getEnemyStaticPoseV95(profileId) || getEnemyDedicatedPoseV97(profileId);
  if (!art) throw new Error(`Xeno Trials requires an admitted dedicated pose: ${profileId}`);
  return Object.freeze({ id, profileId, label, role, hp, speed, power, reach, special,
    stamina: 100, jump: role === 'agile' ? 620 : 550, width: role === 'tank' ? 88 : 66,
    height: role === 'agile' ? 92 : 118, artStatus: 'dedicated-static-pose', canonExact: false,
    family: art.biology === 'human' ? 'human' : art.biology === 'engineer' ? 'engineer' : art.biology === 'synthetic' || /working-joe|combat-synthetic/.test(profileId) ? 'synthetic' : art.biology === 'pathogen' ? 'pathogen' : 'xenomorph',
    variants: id === 'arachnoid' ? Object.freeze(['grey', 'purple']) : Object.freeze([]) });
};
/** V101 reuses only accepted terrestrial poses. This is an arena admission,
 * not a new species, animation, canonical size or additional campaign encounter.
 * Carrier/chameleon/spiker names do not add spawning, invisibility or new powers. */
const terrestrialFighterV101 = (...args) => {
  const profileId = args[1];
  const art = getEnemyStaticPoseV95(profileId) || getEnemyDedicatedPoseV97(profileId);
  if (!art || art.reviewStatus !== 'accepted-static-adaptation'
    || !['ground', 'terrestrial'].includes(art.locomotion) || art.bioforgeEligible === false
    || art.groundContact === false || (art.biology && !['xenomorph', 'synthetic'].includes(art.biology))
    || /ovomorph|facehugger|chestburster|winged|aquatic|ceto/.test(profileId))
    throw new Error(`V101 requires an admitted terrestrial adult pose: ${profileId}`);
  return fighter(...args);
};
// This gate is separate from V101: only individually admitted V106 adults,
// never documentary siblings, empty equipment or a water-only/larval form.
const terrestrialFighterV106 = entry => {
  const art = getEnemyStaticPoseV95(entry.profileId);
  if (!art || art.visualRevision !== 106 || art.reviewStatus !== 'accepted-static-adaptation'
    || art.kind !== 'organism' || art.arenaEligible !== true || art.locomotion !== 'ground' || art.groundContact !== true
    || art.bioforgeEligible !== true || !['xenomorph', 'synthetic', 'human', 'engineer', 'pathogen'].includes(art.biology))
    throw new Error(`V106 requires a reviewed terrestrial combatant: ${entry.profileId}`);
  return Object.freeze({ ...fighter(entry.id, entry.profileId, entry.label, entry.role,
    entry.hp, entry.speed, entry.power, entry.reach, entry.special),
    importRevision: 106, referenceIdV100: entry.referenceIdV100,
    sourceReferenceId: entry.sourceReferenceId, alteredOf: entry.alteredOf });
};
export const XENO_TRIALS_FIGHTERS_V96 = Object.freeze([
  fighter('warrior', 'castes-film_warrior_aliens_1986', 'Warrior', 'balanced', 220, 225, 1, 1, 'tail'),
  fighter('runner', 'castes-film_runner_alien3_1992', 'Runner', 'agile', 180, 295, .9, .9, 'pounce'),
  fighter('arachnoid', 'castes-game_avp_capcom_arachnoid', 'Arachnoid', 'balanced', 215, 240, .95, 1, 'pounce'),
  fighter('defender', 'pose-v95-user-xeno-defender', 'Defender', 'tank', 270, 165, .95, .95, 'ram'),
  fighter('grid', 'castes-film_grid_avp_2004', 'Grid', 'agile', 205, 270, 1.05, .95, 'tail'),
  fighter('spitter', 'castes-game_acm_spitter', 'Spitter', 'ranged', 185, 210, .9, .85, 'acid'),
  fighter('prowler', 'castes-game_afe_prowler', 'Prowler', 'agile', 185, 300, .95, .85, 'pounce'),
  fighter('razor-claws', 'castes-game_avp_capcom_razor_claws', 'Razor Claws', 'agile', 195, 265, 1.15, 1.05, 'slash'),
  fighter('chrysalis', 'castes-game_avp_capcom_chrysalis', 'Chrysalis', 'tank', 260, 185, 1.05, 1, 'ram'),
  fighter('smasher', 'castes-game_avp_capcom_smasher', 'Smasher', 'tank', 275, 160, 1.2, .9, 'ram'),
  fighter('predalien', 'castes-game_predalien_avp2_primal_hunt', 'Predalien — Primal Hunt', 'balanced', 240, 220, 1.1, 1.15, 'slash'),
  fighter('xenoborg', 'castes-game_xenoborg_avp1999', 'Xenoborg', 'ranged', 245, 175, 1.05, 1, 'pulse'),
  fighter('royal-guard', 'castes-game_avp_capcom_royal_guard', 'Royal Guard', 'tank', 290, 165, 1.1, 1.2, 'tail'),
  fighter('queen', 'castes-film_queen_aliens_1986', 'Reine mobile', 'tank', 310, 150, 1.15, 1.25, 'tail'),
  fighter('ravager', 'castes-game_avp_extinction_ravager', 'Ravager', 'tank', 270, 185, 1.15, 1.12, 'slash'),
  fighter('crusher-acm', 'castes-game_acm_crusher', 'Crusher — ACM', 'tank', 290, 155, 1.1, 1, 'ram'),
  fighter('boiler', 'castes-game_acm_boiler', 'Boiler', 'ranged', 175, 195, 1.08, .9, 'acid'),
  fighter('burster', 'castes-game_afe_burster', 'Burster', 'agile', 175, 265, 1, .85, 'acid'),
  fighter('stalker-arcade', 'castes-game_avp_capcom_stalker', 'Stalker — arcade', 'agile', 195, 280, 1, .95, 'pounce'),
  fighter('gorilla', 'pose-v94-kenner-gorilla', 'Gorilla Alien', 'tank', 265, 185, 1.1, 1, 'ram'),
  fighter('rhino', 'pose-v94-kenner-rhino', 'Rhino Alien', 'tank', 280, 175, 1.08, 1, 'ram'),
  fighter('panther', 'pose-v94-kenner-panther', 'Panther Alien', 'agile', 185, 300, 1, .9, 'pounce'),
  fighter('mantis', 'pose-v96-kenner-mantis', 'Mantis Alien', 'agile', 195, 255, 1.12, 1.15, 'slash'),
  fighter('ultramorph', 'pose-v95-user-xeno-ultramorph', 'Ultramorph — adaptation', 'tank', 285, 165, 1.1, 1.2, 'tail'),
  fighter('synth-trooper', 'pose-v94-afe-synth-trooper', 'Synth Trooper', 'ranged', 205, 210, .95, 1, 'pulse'),
  fighter('synth-guard', 'pose-v94-afe-synth-guard', 'Synth Guard', 'balanced', 230, 205, 1, .95, 'ram'),
  fighter('synth-sniper', 'pose-v94-afe-synth-sniper', 'Synth Sniper', 'ranged', 180, 220, 1.12, .9, 'pulse'),
  fighter('synth-heavy', 'pose-v94-afe-synth-heavy', 'Synth Heavy', 'tank', 280, 145, 1.05, 1, 'pulse'),
  fighter('armored-joe', 'enemy-145-armored-working-joe', 'Working Joe blindé', 'tank', 265, 150, 1.05, .9, 'ram'),
  fighter('combat-synth', 'enemy-146-armored-combat-synthetic', 'Synthétique de combat blindé', 'balanced', 235, 200, 1.05, 1, 'ram'),
  fighter('mecha', 'pose-v95-user-xeno-mecha', 'Xeno Mecha', 'ranged', 250, 175, 1.05, 1, 'pulse'),
  fighter('mecha-2', 'pose-v95-user-xeno-mecha-2', 'Xeno Mecha II', 'balanced', 245, 200, 1.08, 1.05, 'slash'),
  fighter('mechanoid', 'pose-v95-user-xeno-mechanoid', 'Xeno Mechanoid', 'tank', 275, 165, 1.05, 1.1, 'pulse'),
  // Append only: historical unlock prices and saved fighter IDs remain stable.
  // These existing V97 poses are systemic variants, not additional canon species.
  fighter('albino-joe', 'enemy-093-albino-working-joe', 'Working Joe — variante albino', 'tank', 250, 160, 1, .9, 'ram'),
  fighter('albino-combat-synth', 'enemy-094-albino-combat-synthetic', 'Synthétique de combat — albino', 'balanced', 225, 210, 1, 1, 'ram'),
  fighter('albino-runner', 'enemy-058-albino-runner', 'Runner — variante albino', 'agile', 180, 290, .95, .9, 'pounce'),
  fighter('albino-crusher', 'enemy-061-albino-crusher', 'Crusher — variante albino', 'tank', 285, 160, 1.08, 1, 'ram'),
  fighter('albino-ravager', 'enemy-065-albino-ravager', 'Ravager — variante albino', 'tank', 265, 190, 1.12, 1.1, 'slash'),
  fighter('albino-burster', 'enemy-068-albino-burster', 'Burster — variante albino', 'agile', 180, 255, 1, .85, 'acid'),
  fighter('albino-six', 'enemy-070-albino-specimen-six-line', 'Lignée Six — variante albino', 'balanced', 220, 235, 1, 1, 'tail'),
  fighter('albino-ripper', 'enemy-075-albino-atarax-ripper', 'ATARAX Ripper — albino', 'agile', 195, 270, 1.05, 1, 'slash'),
  fighter('armored-runner', 'enemy-110-armored-runner', 'Runner blindé', 'balanced', 220, 235, 1, .95, 'pounce'),
  fighter('armored-ravager', 'enemy-117-armored-ravager', 'Ravager blindé', 'tank', 290, 160, 1.1, 1.1, 'slash'),
  // V99 append-only selection: admitted V98/V99 project variants, not canon species.
  fighter('armored-red', 'enemy-123-armored-red-xenomorph', 'Xénomorphe rouge — variante blindée', 'balanced', 240, 210, 1.05, 1, 'tail'),
  fighter('armored-k-series', 'enemy-124-armored-k-series-yellow-xenomorph', 'K-Series jaune — variante blindée', 'tank', 270, 185, 1.05, 1, 'tail'),
  fighter('armored-ripper', 'enemy-127-armored-atarax-ripper', 'ATARAX Ripper — variante blindée', 'agile', 215, 245, 1.06, 1, 'slash'),
  fighter('armored-ripper-queen', 'enemy-128-armored-ripper-queen', 'Reine Ripper — variante blindée', 'tank', 300, 155, 1.1, 1.2, 'tail'),
  fighter('acid-runner', 'enemy-162-acid-blooded-runner', 'Runner — variante acide', 'agile', 185, 290, .95, .9, 'pounce'),
  fighter('acid-lurker', 'enemy-167-acid-blooded-lurker', 'Lurker — variante acide', 'balanced', 220, 225, 1.03, 1, 'slash'),
  fighter('acid-ravager', 'enemy-169-acid-blooded-ravager', 'Ravager — variante acide', 'tank', 275, 180, 1.15, 1.1, 'slash'),
  fighter('acid-boiler', 'enemy-170-acid-blooded-boiler', 'Boiler — variante acide', 'ranged', 180, 190, 1.08, .9, 'acid'),
  fighter('acid-joe', 'enemy-197-acid-blooded-working-joe', 'Working Joe — variante acide', 'tank', 250, 155, 1, .9, 'ram'),
  fighter('acid-combat-synth', 'enemy-198-acid-blooded-combat-synthetic', 'Synthétique de combat — variante acide', 'ranged', 235, 190, 1.05, 1, 'pulse'),
  // V101: 50 append-only arena entries; 20 supplied V95 identities and 30
  // already admitted V98/V99 systemic poses. All use the existing fixed-pose engine.
  terrestrialFighterV101('user-antilope', 'pose-v95-user-xeno-antilope', 'Xeno-Antilope — référence utilisateur', 'agile', 185, 290, .95, 1, 'pounce'),
  terrestrialFighterV101('user-brute', 'pose-v95-user-xeno-brute', 'Xeno-Brute — référence utilisateur', 'tank', 285, 165, 1.1, 1, 'ram'),
  terrestrialFighterV101('user-carrier', 'pose-v95-user-xeno-carrier', 'Carrier chargé — référence utilisateur', 'balanced', 235, 205, 1, 1.1, 'tail'),
  terrestrialFighterV101('user-spiker', 'pose-v95-user-xeno-spiker', 'Spiker — référence utilisateur', 'balanced', 240, 205, 1.08, 1.1, 'slash'),
  terrestrialFighterV101('user-warrior-red', 'pose-v95-user-xeno-warrior-red', 'Warrior Red — référence utilisateur', 'balanced', 225, 225, 1.02, 1, 'tail'),
  terrestrialFighterV101('user-phantera-black', 'pose-v95-user-xeno-phantera-black', 'Phantera Black — référence utilisateur', 'agile', 190, 295, 1, .95, 'pounce'),
  terrestrialFighterV101('user-rhino', 'pose-v95-user-xeno-rhino', 'Xeno-Rhino — référence utilisateur', 'tank', 285, 170, 1.08, 1, 'ram'),
  terrestrialFighterV101('user-chameleon', 'pose-v95-user-xeno-chameleon', 'Chameleon — référence utilisateur', 'balanced', 205, 235, 1, 1.05, 'tail'),
  terrestrialFighterV101('user-chameleon-2', 'pose-v95-user-xeno-chameleon-2', 'Chameleon II — référence utilisateur', 'agile', 190, 270, .98, .95, 'pounce'),
  terrestrialFighterV101('user-trex-king', 'pose-v95-user-xeno-trex-king', 'TRex King — référence utilisateur', 'tank', 300, 150, 1.15, 1.1, 'ram'),
  terrestrialFighterV101('user-trex-queen', 'pose-v95-user-xeno-trex-queen', 'TRex Queen — référence utilisateur', 'tank', 305, 145, 1.1, 1.2, 'tail'),
  terrestrialFighterV101('user-big-xeno', 'pose-v95-user-xeno-big-xeno-1', 'Big Xeno — référence utilisateur', 'tank', 290, 160, 1.1, 1.15, 'tail'),
  terrestrialFighterV101('user-pale-spined', 'pose-v95-user-quadrupede-pale-epineux', 'Quadrupède pâle épineux — référence 25', 'balanced', 220, 220, 1.05, 1, 'slash'),
  terrestrialFighterV101('user-tiger-biped', 'pose-v95-user-bipede-tigre', 'Bipède tigre — référence 06', 'agile', 195, 265, 1.05, 1, 'slash'),
  terrestrialFighterV101('user-raised-crest', 'pose-v95-user-bipede-crete-relevee', 'Bipède à crête relevée — référence 07', 'balanced', 225, 220, 1, 1.1, 'tail'),
  terrestrialFighterV101('user-bulbous-quadruped', 'pose-v95-user-quadrupede-bulbeux', 'Quadrupède bulbeux — référence 08', 'tank', 270, 180, 1.05, 1, 'ram'),
  terrestrialFighterV101('user-black-bone-raptor', 'pose-v95-user-rapace-noir-os', 'Rapace noir et os — référence 11', 'agile', 185, 290, 1, .95, 'pounce'),
  terrestrialFighterV101('user-blue-violet-biped', 'pose-v95-user-bipede-bleu-violet', 'Bipède bleu-violet — référence 12', 'balanced', 220, 230, 1, 1, 'tail'),
  terrestrialFighterV101('user-skeletal-quadruped', 'pose-v95-user-quadrupede-squelettique', 'Quadrupède squelettique — référence 13', 'agile', 180, 290, .98, .95, 'pounce'),
  terrestrialFighterV101('user-red-horned', 'pose-v95-user-quadrupede-rouge-corne', 'Quadrupède rouge corné — référence 17', 'balanced', 235, 215, 1.05, 1, 'ram'),
  terrestrialFighterV101('cryo-runner', 'enemy-214-cryo-adapted-runner', 'Runner — variante cryo', 'agile', 185, 285, .95, .9, 'pounce'),
  terrestrialFighterV101('cryo-crusher', 'enemy-217-cryo-adapted-crusher', 'Crusher — variante cryo', 'tank', 285, 155, 1.1, 1, 'ram'),
  terrestrialFighterV101('cryo-lurker', 'enemy-219-cryo-adapted-lurker', 'Lurker — variante cryo', 'balanced', 220, 220, 1.03, 1, 'slash'),
  terrestrialFighterV101('cryo-ravager', 'enemy-221-cryo-adapted-ravager', 'Ravager — variante cryo', 'tank', 275, 180, 1.12, 1.1, 'slash'),
  terrestrialFighterV101('cryo-boiler', 'enemy-222-cryo-adapted-boiler', 'Boiler — variante cryo', 'ranged', 180, 190, 1.08, .9, 'acid'),
  terrestrialFighterV101('cryo-burster', 'enemy-224-cryo-adapted-burster', 'Burster — variante cryo', 'agile', 180, 255, 1, .85, 'acid'),
  terrestrialFighterV101('cryo-monica', 'enemy-225-cryo-adapted-monica-line', 'Lignée Monica — variante cryo', 'agile', 200, 265, 1, 1, 'pounce'),
  terrestrialFighterV101('cryo-ripper', 'enemy-231-cryo-adapted-atarax-ripper', 'ATARAX Ripper — variante cryo', 'agile', 205, 255, 1.05, 1, 'slash'),
  terrestrialFighterV101('cryo-ripper-queen', 'enemy-232-cryo-adapted-ripper-queen', 'Reine Ripper — variante cryo', 'tank', 300, 150, 1.1, 1.2, 'tail'),
  terrestrialFighterV101('cryo-foundry-crusher', 'enemy-234-cryo-adapted-foundry-crusher', 'Foundry Crusher — variante cryo', 'tank', 285, 160, 1.08, 1.05, 'ram'),
  terrestrialFighterV101('cryo-reef-stalker', 'enemy-235-cryo-adapted-reef-stalker', 'Reef Stalker — variante cryo', 'agile', 195, 265, 1, 1, 'pounce'),
  terrestrialFighterV101('cryo-pale-hunter', 'enemy-238-cryo-adapted-pale-crucible-hunter', 'Pale Crucible Hunter — variante cryo', 'balanced', 225, 220, 1.05, 1.05, 'slash'),
  terrestrialFighterV101('cryo-dust-runner', 'enemy-239-cryo-adapted-dust-runner', 'Dust Runner — variante cryo', 'agile', 185, 290, .98, .95, 'pounce'),
  terrestrialFighterV101('cryo-salvage-brute', 'enemy-240-cryo-adapted-salvage-hive-brute', 'Salvage Hive Brute — variante cryo', 'tank', 275, 170, 1.1, 1.05, 'ram'),
  terrestrialFighterV101('cryo-caravan-stalker', 'enemy-242-cryo-adapted-caravan-stalker', 'Caravan Stalker — variante cryo', 'balanced', 220, 230, 1, 1, 'slash'),
  terrestrialFighterV101('cryo-joe', 'enemy-249-cryo-adapted-working-joe', 'Working Joe — variante cryo', 'tank', 250, 155, 1, .9, 'ram'),
  terrestrialFighterV101('cryo-combat-synth', 'enemy-250-cryo-adapted-combat-synthetic', 'Synthétique de combat — variante cryo', 'ranged', 235, 190, 1.05, 1, 'pulse'),
  terrestrialFighterV101('armored-foundry-crusher', 'enemy-130-armored-foundry-crusher', 'Foundry Crusher — variante blindée', 'tank', 290, 155, 1.08, 1.05, 'ram'),
  terrestrialFighterV101('armored-reef-stalker', 'enemy-131-armored-reef-stalker', 'Reef Stalker — variante blindée', 'balanced', 225, 220, 1.03, 1, 'pounce'),
  terrestrialFighterV101('armored-pale-hunter', 'enemy-134-armored-pale-crucible-hunter', 'Pale Crucible Hunter — variante blindée', 'tank', 265, 185, 1.08, 1.05, 'slash'),
  terrestrialFighterV101('armored-dust-runner', 'enemy-135-armored-dust-runner', 'Dust Runner — variante blindée', 'balanced', 220, 235, 1, .95, 'pounce'),
  terrestrialFighterV101('armored-salvage-brute', 'enemy-136-armored-salvage-hive-brute', 'Salvage Hive Brute — variante blindée', 'tank', 290, 160, 1.1, 1.05, 'ram'),
  terrestrialFighterV101('armored-caravan-stalker', 'enemy-138-armored-caravan-stalker', 'Caravan Stalker — variante blindée', 'balanced', 240, 210, 1.03, 1, 'slash'),
  terrestrialFighterV101('acid-queen', 'enemy-164-acid-blooded-queen', 'Reine mobile — variante acide', 'tank', 310, 145, 1.12, 1.25, 'tail'),
  terrestrialFighterV101('acid-crusher', 'enemy-165-acid-blooded-crusher', 'Crusher — variante acide', 'tank', 290, 155, 1.1, 1, 'ram'),
  terrestrialFighterV101('acid-burster', 'enemy-172-acid-blooded-burster', 'Burster — variante acide', 'agile', 180, 260, 1.02, .85, 'acid'),
  terrestrialFighterV101('acid-k-series', 'enemy-176-acid-blooded-k-series-yellow-xenomorph', 'K-Series jaune — variante acide', 'balanced', 230, 220, 1.05, 1, 'tail'),
  terrestrialFighterV101('acid-ripper', 'enemy-179-acid-blooded-atarax-ripper', 'ATARAX Ripper — variante acide', 'agile', 205, 260, 1.08, 1, 'slash'),
  terrestrialFighterV101('acid-ripper-queen', 'enemy-180-acid-blooded-ripper-queen', 'Reine Ripper — variante acide', 'tank', 300, 150, 1.12, 1.2, 'tail'),
  terrestrialFighterV101('acid-foundry-crusher', 'enemy-182-acid-blooded-foundry-crusher', 'Foundry Crusher — variante acide', 'tank', 285, 160, 1.1, 1.05, 'ram'),
  // V103 imports append after all 103 historical entries, preserving their
  // prices and unlock IDs. Unaccepted documentary references never enter here.
  ...XENO_TRIALS_IMPORTS_V103.map(entry => Object.freeze({
    ...terrestrialFighterV101(entry.id, entry.profileId, entry.label, entry.role,
      entry.hp, entry.speed, entry.power, entry.reach, entry.special),
    importRevision: 103, referenceIdV100: entry.referenceIdV100, alteredOf: entry.alteredOf
  })),
  // Existing user poses append after the complete 109-entry V103 baseline.
  ...XENO_TRIALS_USER_ADMISSIONS_V105.map(entry => Object.freeze({
    ...terrestrialFighterV101(entry.id, entry.profileId, entry.label, entry.role,
      entry.hp, entry.speed, entry.power, entry.reach, entry.special),
    arenaAdmissionRevision: 105, sourceNumberV95: entry.sourceNumber
  })),
  // V105 native Engineer admission has its own biological contract. It does
  // not broaden the V101 xenomorph/synthetic gate or reclassify old fighters.
  ...XENO_TRIALS_IMPORTS_V105.map(entry => Object.freeze({
    ...fighter(entry.id, entry.profileId, entry.label, entry.role,
      entry.hp, entry.speed, entry.power, entry.reach, entry.special),
    importRevision: 105, referenceIdV100: entry.referenceIdV100, alteredOf: entry.alteredOf
  })),
  ...XENO_TRIALS_IMPORTS_V106.map(terrestrialFighterV106),
  ...XENO_TRIALS_SYNTHS_V110.map(entry => Object.freeze({
    ...fighter(entry.id, entry.profileId, entry.label, entry.role, entry.hp, entry.speed, entry.power, entry.reach, entry.special),
    importRevision: 110
  })),
  // V111 is a distinct adapted rifleman, never a replacement for the old Guard.
  ...XENO_TRIALS_SYNTHS_V111.map(entry => Object.freeze({
    ...fighter(entry.id, entry.profileId, entry.label, entry.role, entry.hp, entry.speed, entry.power, entry.reach, entry.special),
    importRevision: 111
  })),
  // Observational adaptations append without changing any historical save ID.
  ...ADAPTATIONS_V112.map(entry => Object.freeze({
    ...fighter(entry.id, entry.profileId, entry.label, entry.role, entry.hp, entry.speed, entry.power, entry.reach, entry.special),
    importRevision: 112
  })),
  ...ADAPTATIONS_V113.map(entry => Object.freeze({
    ...fighter(entry.id, entry.profileId, entry.label, entry.role, entry.hp, entry.speed, entry.power, entry.reach, entry.special),
    importRevision:113, referenceIdV100:entry.referenceIdV100 || null,
    alteredOf:entry.alteredOf || null
  })),
  ...XENO_TRIALS_AUTOMATONS_V116.map(entry => Object.freeze({
    ...fighter(entry.id, entry.profileId, entry.label, entry.role, entry.hp, entry.speed, entry.power, entry.reach, entry.special),
    importRevision: 116
  }))
]);
const FIGHTERS = new Map(XENO_TRIALS_FIGHTERS_V96.map(entry => [entry.id, entry]));
export function getXenoTrialsFighterV96(id) { return FIGHTERS.get(id) || null; }
export function getXenoTrialsArtV96(id, variant) {
  const entry = getXenoTrialsFighterV96(id);
  return entry ? getEnemyStaticPoseV95(entry.profileId, entry.variants.includes(variant) ? variant : null) || getEnemyDedicatedPoseV97(entry.profileId) : null;
}

export const XENO_TRIALS_FACTIONS_V96 = Object.freeze([
  Object.freeze({ id: 'containment', label: 'WY / Confinement', description: 'Cellule simulée défensive : attente, garde et riposte.', doctrine: 'guard', color: '#60d6db',
    roster: Object.freeze(['defender', 'chrysalis', 'royal-guard', 'crusher-acm', 'rhino', 'synth-guard', 'armored-joe', 'albino-joe', 'albino-crusher', 'armored-ravager', 'smasher', 'armored-k-series', 'armored-ripper-queen', 'acid-joe',
      'user-brute', 'user-rhino', 'user-bulbous-quadruped', 'cryo-crusher', 'cryo-foundry-crusher', 'cryo-joe', 'armored-foundry-crusher', 'armored-salvage-brute', 'acid-crusher', 'acid-foundry-crusher',
      ...XENO_TRIALS_IMPORTS_V103.filter(entry => entry.factionId === 'containment').map(entry => entry.id),
      ...XENO_TRIALS_USER_ADMISSIONS_V105.filter(entry => entry.factionId === 'containment').map(entry => entry.id),
      ...XENO_TRIALS_IMPORTS_V105.filter(entry => entry.factionId === 'containment').map(entry => entry.id),
      ...XENO_TRIALS_IMPORTS_V106.filter(entry => entry.factionId === 'containment').map(entry => entry.id),
      ...XENO_TRIALS_SYNTHS_V110.filter(entry => entry.factionId === 'containment').map(entry => entry.id)]), projectOriginal: true }),
  Object.freeze({ id: 'pursuit', label: 'WY / Poursuite', description: 'Cellule simulée mobile : pression rapprochée et bonds.', doctrine: 'rush', color: '#f5a64b',
    roster: Object.freeze(['runner', 'prowler', 'razor-claws', 'panther', 'mantis', 'stalker-arcade', 'albino-runner', 'albino-ripper', 'armored-runner', 'armored-ripper', 'acid-runner',
      'user-antilope', 'user-phantera-black', 'user-chameleon-2', 'user-tiger-biped', 'user-black-bone-raptor', 'user-skeletal-quadruped', 'cryo-runner', 'cryo-monica', 'cryo-ripper', 'cryo-reef-stalker', 'cryo-dust-runner', 'armored-reef-stalker', 'armored-dust-runner', 'acid-ripper',
      ...XENO_TRIALS_IMPORTS_V103.filter(entry => entry.factionId === 'pursuit').map(entry => entry.id),
      ...XENO_TRIALS_USER_ADMISSIONS_V105.filter(entry => entry.factionId === 'pursuit').map(entry => entry.id),
      ...XENO_TRIALS_IMPORTS_V106.filter(entry => entry.factionId === 'pursuit').map(entry => entry.id),
      ...XENO_TRIALS_SYNTHS_V110.filter(entry => entry.factionId === 'pursuit').map(entry => entry.id)]), projectOriginal: true }),
  Object.freeze({ id: 'rival-lab', label: 'Laboratoire rival / simulé', description: 'Adversaire corporatiste fictif : maintien à distance et tirs.', doctrine: 'range', color: '#b88aff',
    roster: Object.freeze(['spitter', 'xenoborg', 'arachnoid', 'synth-trooper', 'synth-sniper', 'synth-heavy', 'combat-synth', 'mecha', 'mecha-2', 'mechanoid', 'albino-combat-synth', 'albino-six', 'acid-combat-synth', 'acid-boiler',
      'user-spiker', 'user-chameleon', 'cryo-boiler', 'cryo-burster', 'cryo-combat-synth', 'armored-pale-hunter', 'acid-burster',
      ...XENO_TRIALS_IMPORTS_V103.filter(entry => entry.factionId === 'rival-lab').map(entry => entry.id),
      ...XENO_TRIALS_USER_ADMISSIONS_V105.filter(entry => entry.factionId === 'rival-lab').map(entry => entry.id),
      ...XENO_TRIALS_IMPORTS_V106.filter(entry => entry.factionId === 'rival-lab').map(entry => entry.id),
      ...XENO_TRIALS_SYNTHS_V110.filter(entry => entry.factionId === 'rival-lab').map(entry => entry.id),
      ...XENO_TRIALS_SYNTHS_V111.filter(entry => entry.factionId === 'rival-lab').map(entry => entry.id),
      ...ADAPTATIONS_V112.filter(entry => entry.factionId === 'rival-lab').map(entry => entry.id),
      ...ADAPTATIONS_V113.filter(entry => entry.factionId === 'rival-lab').map(entry => entry.id),
      ...XENO_TRIALS_AUTOMATONS_V116.map(entry => entry.id)]), projectOriginal: true }),
  Object.freeze({ id: 'hive', label: 'Ruche / simulation hostile', description: 'Modèle de pression de ruche ; aucun dressage canonique revendiqué.', doctrine: 'balanced', color: '#ed717d',
    roster: Object.freeze(['warrior', 'grid', 'predalien', 'queen', 'ravager', 'boiler', 'burster', 'gorilla', 'ultramorph', 'albino-ravager', 'albino-burster', 'armored-red', 'acid-lurker', 'acid-ravager',
      'user-carrier', 'user-warrior-red', 'user-trex-king', 'user-trex-queen', 'user-big-xeno', 'user-pale-spined', 'user-raised-crest', 'user-blue-violet-biped', 'user-red-horned', 'cryo-lurker', 'cryo-ravager', 'cryo-ripper-queen', 'cryo-pale-hunter', 'cryo-salvage-brute', 'cryo-caravan-stalker', 'armored-caravan-stalker', 'acid-queen', 'acid-k-series', 'acid-ripper-queen',
      ...XENO_TRIALS_IMPORTS_V103.filter(entry => entry.factionId === 'hive').map(entry => entry.id),
      ...XENO_TRIALS_USER_ADMISSIONS_V105.filter(entry => entry.factionId === 'hive').map(entry => entry.id),
      ...XENO_TRIALS_IMPORTS_V106.filter(entry => entry.factionId === 'hive').map(entry => entry.id),
      ...ADAPTATIONS_V112.filter(entry => entry.factionId === 'hive').map(entry => entry.id),
      ...ADAPTATIONS_V113.filter(entry => entry.factionId === 'hive').map(entry => entry.id)]), projectOriginal: true })
]);
export const XENO_TRIALS_STAGES_V96 = Object.freeze([
  Object.freeze({ id: 'containment-deck', label: 'Banc de confinement', background: '#101d24', accent: '#48aab1', floor: '#23343c' }),
  Object.freeze({ id: 'reactor-ring', label: 'Anneau réacteur simulé', background: '#241a18', accent: '#ce7645', floor: '#42302c' }),
  Object.freeze({ id: 'hive-vault', label: 'Chambre de ruche simulée', background: '#191b23', accent: '#9970b7', floor: '#302b38' }),
  // Existing project backdrops reused as simulation skins: no DLC mission or depth gameplay.
  Object.freeze({ id: 'tantalus-bridge', label: 'Tantalus / Passerelle simulée', background: '#101d24', accent: '#74d9e7', floor: '#23343c', backdrop: '/assets/openai/metroidvania/zones/ship-command-far.png' }),
  Object.freeze({ id: 'tantalus-cargo', label: 'Tantalus / Soute simulée', background: '#241d18', accent: '#e2b56b', floor: '#352d25', backdrop: '/assets/openai/metroidvania/zones/ship-cargo-far.png' }),
  Object.freeze({ id: 'planet-surface', label: 'Surface planétaire simulée', background: '#1b2425', accent: '#b3d39b', floor: '#2d3431', backdrop: '/assets/openai/metroidvania/planet-exterior-far.png' })
]);
export const XENO_TRIALS_CONTROLS_V96 = Object.freeze({
  left: '← / Q / A', right: '→ / D', jump: '↑ / Z / W / Espace',
  guard: '↓ / S', light: 'J', heavy: 'K', special: 'L', pause: 'P / Échap'
});
