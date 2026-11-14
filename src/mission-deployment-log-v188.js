// V188 — the deployment line of the mission log (owner decision "check against the
// bible", 2026-11-14). The bible (docs/narrative/CAMPAGNE_PRINCIPALE.md §15.7,
// row 3.2 « Le faux fils ») has the player play Jeri, a segmented synthetic who
// infiltrates the hive with pheromone profiles; it says nothing about a squad.
// The squad is kept as deployed (the selected marines follow in support), and the
// line now says so instead of « ESCOUADE DÉPLOYÉE », which named the player as a
// squad leader. Other missions keep their line unchanged. English: i18n catalog.

export function missionDeploymentLogV188(engine, allies) {
  const count = Math.max(0, Number(allies) || 0);
  if (engine?.isHiveMissionV131?.() && engine.hiveV131?.operationId === 'jeri-false-son') {
    return count === 0 ? 'JERI EN INFILTRATION · aucun marine en appui'
      : count === 1 ? 'JERI EN INFILTRATION · 1 marine IA en appui'
        : `JERI EN INFILTRATION · ${count} marines IA en appui`;
  }
  return `ESCOUADE DÉPLOYÉE · ${count} alliés IA physiques · ${engine?.spriteRuntime?.report?.sheets || 0} plaques animées`;
}
