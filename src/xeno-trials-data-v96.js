import { getEnemyStaticPoseV96 as getEnemyStaticPoseV95 } from './enemy-static-poses-v96.js';
import { getEnemyDedicatedPoseV98 as getEnemyDedicatedPoseV97 } from './enemy-dedicated-poses-v98.js';

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
    family: art.biology === 'synthetic' || /working-joe|combat-synthetic/.test(profileId) ? 'synthetic' : art.biology === 'pathogen' ? 'pathogen' : 'xenomorph',
    variants: id === 'arachnoid' ? Object.freeze(['grey', 'purple']) : Object.freeze([]) });
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
  fighter('armored-ravager', 'enemy-117-armored-ravager', 'Ravager blindé', 'tank', 290, 160, 1.1, 1.1, 'slash')
]);
const FIGHTERS = new Map(XENO_TRIALS_FIGHTERS_V96.map(entry => [entry.id, entry]));
export function getXenoTrialsFighterV96(id) { return FIGHTERS.get(id) || null; }
export function getXenoTrialsArtV96(id, variant) {
  const entry = getXenoTrialsFighterV96(id);
  return entry ? getEnemyStaticPoseV95(entry.profileId, entry.variants.includes(variant) ? variant : null) || getEnemyDedicatedPoseV97(entry.profileId) : null;
}

export const XENO_TRIALS_FACTIONS_V96 = Object.freeze([
  Object.freeze({ id: 'containment', label: 'WY / Confinement', description: 'Cellule simulée défensive : attente, garde et riposte.', doctrine: 'guard', color: '#60d6db',
    roster: Object.freeze(['defender', 'chrysalis', 'royal-guard', 'crusher-acm', 'rhino', 'synth-guard', 'armored-joe', 'albino-joe', 'albino-crusher', 'armored-ravager', 'smasher']), projectOriginal: true }),
  Object.freeze({ id: 'pursuit', label: 'WY / Poursuite', description: 'Cellule simulée mobile : pression rapprochée et bonds.', doctrine: 'rush', color: '#f5a64b',
    roster: Object.freeze(['runner', 'prowler', 'razor-claws', 'panther', 'mantis', 'stalker-arcade', 'albino-runner', 'albino-ripper', 'armored-runner']), projectOriginal: true }),
  Object.freeze({ id: 'rival-lab', label: 'Laboratoire rival / simulé', description: 'Adversaire corporatiste fictif : maintien à distance et tirs.', doctrine: 'range', color: '#b88aff',
    roster: Object.freeze(['spitter', 'xenoborg', 'arachnoid', 'synth-trooper', 'synth-sniper', 'synth-heavy', 'combat-synth', 'mecha', 'mecha-2', 'mechanoid', 'albino-combat-synth', 'albino-six']), projectOriginal: true }),
  Object.freeze({ id: 'hive', label: 'Ruche / simulation hostile', description: 'Modèle de pression de ruche ; aucun dressage canonique revendiqué.', doctrine: 'balanced', color: '#ed717d',
    roster: Object.freeze(['warrior', 'grid', 'predalien', 'queen', 'ravager', 'boiler', 'burster', 'gorilla', 'ultramorph', 'albino-ravager', 'albino-burster']), projectOriginal: true })
]);
export const XENO_TRIALS_STAGES_V96 = Object.freeze([
  Object.freeze({ id: 'containment-deck', label: 'Banc de confinement', background: '#101d24', accent: '#48aab1', floor: '#23343c' }),
  Object.freeze({ id: 'reactor-ring', label: 'Anneau réacteur simulé', background: '#241a18', accent: '#ce7645', floor: '#42302c' }),
  Object.freeze({ id: 'hive-vault', label: 'Chambre de ruche simulée', background: '#191b23', accent: '#9970b7', floor: '#302b38' })
]);
export const XENO_TRIALS_CONTROLS_V96 = Object.freeze({
  left: '← / Q / A', right: '→ / D', jump: '↑ / Z / W / Espace',
  guard: '↓ / S', light: 'J', heavy: 'K', special: 'L', pause: 'P / Échap'
});
