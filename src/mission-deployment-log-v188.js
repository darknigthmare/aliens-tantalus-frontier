// V188 — the deployment line of the mission log (owner decision "check against the
// bible", 2026-11-14). The bible (docs/narrative/CAMPAGNE_PRINCIPALE.md §15.7,
// row 3.2 « Le faux fils ») has the player play Jeri, a segmented synthetic who
// infiltrates the hive with pheromone profiles; it says nothing about a squad.
// Owner decision (2026-11-15): the chapter is solo (isSoloSpecialOperationV131,
// hive-missions-v131.js configureMissionSquad); the line says so instead of
// « ESCOUADE DÉPLOYÉE ». Other missions keep their line. English: i18n catalog.

/** Operation plan notice of « Le faux fils » (owner decision 2026-11-15: solo). */
export const JERI_SOLO_BRIEFING_V188 = 'Infiltration solo · Jeri entre seul dans la ruche, aucun marine IA n’est déployé · profils phéromonaux, inspections de castes, captif à sauver et SAINT.';

export function missionDeploymentLogV188(engine, allies) {
  const count = Math.max(0, Number(allies) || 0);
  // Owner decision (2026-11-15): the chapter is solo; no AI squad is deployed.
  if (engine?.isHiveMissionV131?.() && engine.hiveV131?.operationId === 'jeri-false-son') return 'JERI EN INFILTRATION SOLO · aucun marine IA déployé';
  // P2 text pass (2026-11-15): the line no longer prints the sprite-sheet count.
  return count === 0 ? 'ESCOUADE DÉPLOYÉE · aucun allié IA physique' : count === 1 ? 'ESCOUADE DÉPLOYÉE · 1 allié IA physique' : `ESCOUADE DÉPLOYÉE · ${count} alliés IA physiques`;
}
