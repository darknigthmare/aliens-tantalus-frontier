/** The 35 identities requested for the AFE2 collection, not a claim that the
 * publisher's roster is exhaustive. Shared species never count as dedicated
 * AFE2 visual adaptations. Missing contacts have no invented profile alias. */
const row = (id, name, family, status, profileId = null, sourceGame = null) => Object.freeze({ id, name, family, status, profileId, sourceGame });
export const AFE2_ROSTER_STATUS_V110 = Object.freeze({
  'afe2-adaptation': 'Adaptation AFE2 disponible',
  'synth-adaptation': 'Adaptation de synthétique disponible',
  'afe1-adaptation': 'Version Fireteam Elite disponible',
  'shared-species': 'Espèce présente — autre version',
  missing: 'Contact non disponible'
});
export const AFE2_ROSTER_V110 = Object.freeze([
  row('egg', 'Egg / Ovomorphe', 'xenomorph', 'shared-species', 'castes-film_ovomorphe_aliens_1986', 'Aliens (1986)'),
  row('facehugger', 'Facehugger', 'xenomorph', 'shared-species', 'castes-film_facehugger_alien_1979', 'Alien (1979)'),
  row('runner', 'Runner', 'xenomorph', 'shared-species', 'castes-film_runner_alien3_1992', 'Alien 3 (1992)'),
  row('prowler', 'Prowler', 'xenomorph', 'afe1-adaptation', 'castes-game_afe_prowler', 'Aliens: Fireteam Elite'),
  row('burster', 'Burster', 'xenomorph', 'afe1-adaptation', 'castes-game_afe_burster', 'Aliens: Fireteam Elite'),
  row('exploder', 'Exploder', 'xenomorph', 'afe2-adaptation', 'pose-v106-import-game-afe2-exploder', 'Aliens: Fireteam Elite 2'),
  row('spitter', 'Spitter', 'xenomorph', 'shared-species', 'castes-game_acm_spitter', 'Aliens: Colonial Marines'),
  row('drone', 'Drone', 'xenomorph', 'shared-species', 'enemy-004-drone-big-chap', 'Alien / profil historique'),
  row('warrior', 'Warrior', 'xenomorph', 'shared-species', 'castes-film_warrior_aliens_1986', 'Aliens (1986)'),
  row('crusher', 'Crusher', 'xenomorph', 'afe1-adaptation', 'castes-game_afe_crusher', 'Aliens: Fireteam Elite'),
  row('praetorian', 'Praetorian', 'xenomorph', 'shared-species', 'enemy-007-praetorian', 'Profil historique'),
  row('warden', 'Warden', 'xenomorph', 'afe2-adaptation', 'pose-v106-import-game-afe2-warden', 'Aliens: Fireteam Elite 2'),
  row('siren', 'Siren', 'xenomorph', 'missing'),
  row('queen', 'Queen', 'xenomorph', 'shared-species', 'castes-film_queen_aliens_1986', 'Aliens (1986)'),
  row('pathogen-popper', 'Pathogen Popper', 'pathogen', 'afe1-adaptation', 'castes-game_afe_pathogen_popper', 'Aliens: Fireteam Elite'),
  row('pathogen-runner', 'Pathogen Runner', 'pathogen', 'afe1-adaptation', 'castes-game_pathogen_runner', 'Aliens: Fireteam Elite — Pathogen'),
  row('gasbag', 'Gasbag', 'pathogen', 'missing'),
  row('pathogen-blight', 'Pathogen Blight', 'pathogen', 'afe1-adaptation', 'castes-game_pathogen_blight', 'Aliens: Fireteam Elite — Pathogen'),
  row('harbinger', 'Harbinger', 'pathogen', 'afe2-adaptation', 'pose-v106-import-game-afe2-harbinger', 'Aliens: Fireteam Elite 2'),
  row('pathogen-brute', 'Pathogen Brute', 'pathogen', 'afe1-adaptation', 'castes-game_pathogen_brute', 'Aliens: Fireteam Elite — Pathogen'),
  row('engineer-hybrid', 'Engineer hybrid', 'pathogen', 'afe2-adaptation', 'pose-v112-afe2-engineer-hybrid', 'AFE2 — adaptation guidée par observation'),
  row('wey-yu-worker', 'Wey-Yu Worker', 'synthetic', 'missing'),
  row('trooper', 'Trooper', 'synthetic', 'afe1-adaptation', 'pose-v94-afe-synth-trooper', 'Aliens: Fireteam Elite'),
  row('enforcer', 'Enforcer', 'synthetic', 'synth-adaptation', 'pose-v111-afe-synth-enforcer', 'Fireteam Elite — adaptation de lignée'),
  row('detonator', 'Detonator', 'synthetic', 'synth-adaptation', 'pose-v110-afe-synth-detonator', 'Fireteam Elite — adaptation de lignée'),
  row('sniper', 'Sniper', 'synthetic', 'afe1-adaptation', 'pose-v94-afe-synth-sniper', 'Aliens: Fireteam Elite'),
  row('containment', 'Containment', 'synthetic', 'synth-adaptation', 'pose-v110-afe-synth-containment', 'Fireteam Elite — adaptation de lignée'),
  row('incinerator', 'Incinerator', 'synthetic', 'synth-adaptation', 'pose-v110-afe-synth-incinerator', 'Fireteam Elite — Heavy avec Volcan'),
  row('heavy', 'Heavy', 'synthetic', 'afe1-adaptation', 'pose-v94-afe-synth-heavy', 'Aliens: Fireteam Elite'),
  row('spider', 'Spider', 'automaton', 'missing'),
  row('peacekeeper', 'Peacekeeper', 'automaton', 'afe2-adaptation', 'pose-v112-afe2-peacekeeper', 'AFE2 — adaptation guidée par observation'),
  row('huntsman', 'Huntsman', 'automaton', 'missing'),
  row('bulwark', 'Bulwark', 'automaton', 'afe2-adaptation', 'pose-v106-import-game-afe2-bulwark', 'Aliens: Fireteam Elite 2'),
  row('igniter', 'Igniter', 'automaton', 'missing'),
  row('bombardier', 'Bombardier', 'automaton', 'missing')
]);
export const getAfe2RosterEntryV110 = id => AFE2_ROSTER_V110.find(entry => entry.id === id) || null;
export function summarizeAfe2RosterV110() {
  return Object.freeze(AFE2_ROSTER_V110.reduce((counts, entry) => {
    counts[entry.status] = (counts[entry.status] || 0) + 1;
    return counts;
  }, { total: AFE2_ROSTER_V110.length }));
}
