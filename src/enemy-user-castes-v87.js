/**
 * User-supplied single poses, independently audited on 2026-09-23.
 * Stats and geometry are project adaptations, not claims of canonical accuracy.
 * Existing IDs and sprite assets remain unchanged.
 */
const ROWS = [
  ["film_chestburster_alien_1979","Chestburster","Alien (1979)","Films","enemy-003-chestburster","melee",35,6,1.7,0,1,32,22,132,88,0.72,0.935],
  ["film_facehugger_alien_1979","Facehugger","Alien (1979)","Films","enemy-002-facehugger","melee",30,7,1.8,0,1,30,16,120,80,0.67,0.9],
  ["film_queen_chestburster_alien3_1992","Queen chestburster","Alien 3 (1992)","Films",null,"melee",45,8,1.4,2,1,38,28,144,96,0.67,0.9],
  ["film_runner_alien3_1992","Runner / Dog Alien","Alien 3 (1992)","Films","enemy-006-runner","melee",115,15,1.7,5,2,82,58,240,160,0.71,0.84],
  ["film_runner_juvenile_alien3_1992","Runner juvénile — Bambi-burster","Alien 3 (1992)","Films",null,"melee",40,7,1.8,0,1,36,30,120,80,0.7,0.92],
  ["film_grid_avp_2004","Grid","Alien vs. Predator (2004)","Films",null,"melee",175,22,1.2,12,3,56,100,216,144,0.73,0.96],
  ["film_neomorph_2017","Neomorph adulte","Alien: Covenant (2017)","Films","enemy-037-neomorph","melee",125,19,1.6,3,2,48,92,204,136,0.67,0.93],
  ["film_ovomorphe_aliens_1986","Ovomorphe fermé","Aliens (1986)","Films","enemy-001-ovomorph","idle",90,0,0,8,1,48,80,76,114,0.5,0.945],
  ["film_queen_aliens_1986","Reine mobile","Aliens (1986)","Films","enemy-008-queen","melee",520,34,0.8,24,6,142,258,570,380,0.7,0.97],
  ["film_warrior_aliens_1986","Warrior","Aliens (1986)","Films","enemy-005-warrior","melee",160,20,1.2,10,3,56,96,210,140,0.71,0.97],
  ["film_deacon_2012","Deacon","Prometheus (2012)","Films","enemy-036-deacon-line","melee",145,20,1.1,5,3,46,94,198,132,0.52,0.974],
  ["game_xenoborg_avp1999","Xenoborg","Aliens versus Predator (1999)","Jeux","enemy-022-xenoborg","ranged",260,25,0.6,26,4,72,122,270,180,0.62,0.946],
  ["game_predalien_avp2_primal_hunt","Predalien — Primal Hunt","Aliens versus Predator 2: Primal Hunt (2002)","Jeux",null,"melee",300,28,1.1,18,4,88,134,294,196,0.73,0.945],
  ["game_abomination_avp2010","Abomination","Aliens vs. Predator (2010)","Jeux",null,"melee",340,30,1,20,5,98,150,330,220,0.78,0.987],
  ["game_avp_extinction_carrier","Carrier","Aliens vs. Predator: Extinction (2003)","Jeux","enemy-012-carrier","melee",245,18,0.7,18,4,110,134,300,200,0.68,0.94],
  ["game_avp_extinction_ravager","Ravager","Aliens vs. Predator: Extinction (2003)","Jeux","enemy-013-ravager","melee",300,29,0.9,22,4,108,142,318,212,0.69,0.94],
  ["game_acm_boiler","Boiler","Aliens: Colonial Marines (2013)","Jeux","enemy-014-boiler","melee",95,18,0.6,2,2,62,92,210,140,0.72,0.985],
  ["game_acm_crusher","Crusher","Aliens: Colonial Marines (2013)","Jeux","enemy-009-crusher","melee",340,28,0.8,26,5,152,102,330,220,0.76,0.88],
  ["game_acm_spitter","Spitter","Aliens: Colonial Marines (2013)","Jeux","enemy-010-spitter","ranged",145,18,0.9,8,3,62,98,222,148,0.68,0.966],
  ["game_afe_burster","Burster","Aliens: Fireteam Elite (2021)","Jeux","enemy-016-burster","melee",105,20,1.5,3,2,76,58,198,132,0.68,0.912],
  ["game_afe_crusher","Crusher","Aliens: Fireteam Elite (2021)","Jeux",null,"melee",355,29,0.8,26,5,160,110,348,232,0.68,0.974],
  ["game_afe_prowler","Prowler","Aliens: Fireteam Elite (2021)","Jeux","enemy-015-prowler","melee",130,19,1.5,7,3,84,58,210,140,0.65,0.98],
  ["game_afe_pathogen_popper","Popper","Aliens: Fireteam Elite (2021)","Pathogen",null,"melee",55,12,1.2,0,1,38,32,132,88,0.56,0.904],
  ["game_afe_pathogen_stalker","Stalker — Pathogen","Aliens: Fireteam Elite (2021)","Pathogen",null,"melee",175,22,1.4,8,3,88,72,228,152,0.57,0.97],
  ["game_pathogen_blight","Pathogen Blight","Aliens: Fireteam Elite — Pathogen (2022)","Pathogen",null,"ranged",175,21,0.9,8,3,78,72,228,152,0.5,0.989],
  ["game_pathogen_brute","Pathogen Brute","Aliens: Fireteam Elite — Pathogen (2022)","Pathogen",null,"melee",300,28,0.8,20,4,108,118,282,188,0.46,0.97],
  ["game_pathogen_queen","Pathogen Queen","Aliens: Fireteam Elite — Pathogen (2022)","Pathogen",null,"melee",540,35,0.7,24,6,156,246,552,368,0.67,0.985],
  ["game_pathogen_runner","Pathogen Runner","Aliens: Fireteam Elite — Pathogen (2022)","Pathogen",null,"melee",120,17,1.7,5,2,84,58,204,136,0.66,0.97],
  ["game_alien3_thegun_super_facehugger","Super Face-Hugger","Alien 3: The Gun (1993)","Arcade",null,"melee",185,22,1.2,12,3,108,46,246,164,0.61,0.91],
  ["game_avp_capcom_arachnoid","Arachnoid","Alien vs. Predator — Capcom (1994)","Arcade",null,"melee",170,21,1.2,10,3,96,62,234,156,0.56,0.997],
  ["game_avp_capcom_chrysalis","Chrysalis","Alien vs. Predator — Capcom (1994)","Arcade",null,"melee",240,24,0.8,24,4,94,100,264,176,0.57,0.98],
  ["game_avp_capcom_razor_claws","Razor Claws","Alien vs. Predator — Capcom (1994)","Arcade",null,"melee",225,26,1.2,12,4,76,116,270,180,0.58,0.98],
  ["game_avp_capcom_royal_guard","Royal Guard","Alien vs. Predator — Capcom (1994)","Arcade",null,"melee",320,29,0.9,22,5,104,168,372,248,0.59,0.96],
  ["game_avp_capcom_smasher","Smasher","Alien vs. Predator — Capcom (1994)","Arcade",null,"melee",245,25,0.9,18,4,98,104,276,184,0.64,0.925],
  ["game_avp_capcom_stalker","Stalker","Alien vs. Predator — Capcom (1994)","Arcade",null,"melee",180,22,1.3,10,3,62,106,234,156,0.59,0.95]
];
export const ENEMY_USER_CASTES_V87 = Object.freeze(ROWS.map((row) => {
  const [basename, name, work, group, legacyCounterpartId, combatRole, health, damage, speed, armor,
    cost, bodyWidth, bodyHeight, renderWidth, renderHeight, pivotX, pivotY] = row;
  const portrait = basename === 'film_ovomorphe_aliens_1986';
  const id = 'castes-' + basename;
  return Object.freeze({
    id, profileId: id, basename, name, work, group, legacyCounterpartId,
    filename: basename + '.png', path: '/assets/user/castes-v87/' + basename + '.png',
    imageKey: 'user-caste:' + basename, family: 'enemy',
    biology: group === 'Pathogen' || /neomorph|deacon/.test(basename) ? 'pathogen' : 'xenomorph',
    combatRole, health, damage, speed, armor, cost, bodyWidth, bodyHeight, renderWidth, renderHeight,
    pivot: Object.freeze({ x: pivotX, y: pivotY }), sourceFacing: 1,
    sourceWidth: portrait ? 1024 : 1536, sourceHeight: portrait ? 1536 : 1024,
    visualMode: 'static-pose', animationStatus: 'missing', specializedBehaviorStatus: 'not-implemented',
    identityStatus: 'user-supplied-static-pose', identityVerified: false, canonExact: false,
    provenance: 'fan-made-user-import', assetVerificationStatus: 'sha256-dimensions-alpha-verified',
    reviewStatus: 'static-import', geometryStatus: 'project-adaptation',
    automaticEncounter: false, encounterWorldIds: Object.freeze([])
  });
}));
const BY_ID = new Map(ENEMY_USER_CASTES_V87.map(entry => [entry.id, entry]));
const ALTERED = new Set(ENEMY_USER_CASTES_V87.map(entry => entry.legacyCounterpartId).filter(Boolean));
export const ENEMY_USER_CASTES_IDS_V87 = Object.freeze(ENEMY_USER_CASTES_V87.map(entry => entry.id));
export const ENEMY_USER_CASTES_PATHS_V87 = Object.freeze(ENEMY_USER_CASTES_V87.map(entry => entry.path));
/** Strict identity lookup: never infer an organism from a similar name. */
export function getEnemyUserCasteV87(id) {
  return typeof id === 'string' ? BY_ID.get(id) || null : null;
}
export function getLegacyEnemyAlteredLabelV87(id, originalName) {
  const label = typeof originalName === 'string' ? originalName : '';
  return ALTERED.has(id) && label && !/(?:^|\s|—|-)Altered$/i.test(label) ? label + ' — Altered' : label;
}
