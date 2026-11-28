export const XENO_TRIALS_CHARACTER_ROUTES_BRANCH_V231 = 'character-routes';

const routeId = 'big-chap';
const fighterId = 'mire-v209-bigchap';
const chapters = [
  {
    title: 'Signal dans les cloisons', titleEn: 'Signal Behind the Bulkheads',
    act: 'Chapitre 1 · Amorçage', actEn: 'Chapter 1 · Calibration',
    briefing: 'MIRE injecte un modèle de Working Joe sur le pont de maintenance. Mesurez les approches et les contres de Big Chap avec les spéciaux désactivés.',
    briefingEn: 'MIRE introduces a Working Joe model on the maintenance deck. Measure Big Chap’s approaches and counters with specials disabled.',
    event: 'Victoire validée, une seconde trace se détache de la télémétrie du vaisseau.',
    eventEn: 'The win reveals a second trace in the ship’s telemetry.',
    opponentId: 'import-joe-classic', factionId: 'containment', stageId: 'xt198-nostromo-maintenance', difficulty: 'easy',
    rules: { noSpecial: true, timeLimitSeconds: 60 }, reward: 120
  },
  {
    title: 'Une seconde trace', titleEn: 'A Second Trace',
    act: 'Chapitre 2 · Rivalité', actEn: 'Chapter 2 · Rivalry',
    briefing: 'Dans la salle des chaînes, les capteurs distinguent enfin un autre xénomorphe. MIRE lui attribue le modèle comparatif Six pour mesurer les réactions de Big Chap face à une attaque de sa propre famille.',
    briefingEn: 'The sensors in the chain room finally distinguish another xenomorph. MIRE assigns it the Six comparison model to measure Big Chap’s response to an attacker of its own family.',
    event: 'Le duel est validé. Le cloisonnement de sécurité coupe le suivi de Six et relance Big Chap dans le module médical.',
    eventEn: 'The bout is validated. The security bulkheads cut off Six’s tracking feed and reload Big Chap in the medical module.',
    opponentId: 'mire-v209-six', factionId: 'pursuit', stageId: 'xt192-nostromo-chain-room', difficulty: 'normal',
    rules: { timeLimitSeconds: 75 }, reward: 160
  },
  {
    title: 'Le confinement se referme', titleEn: 'Containment Closes In',
    act: 'Chapitre 3 · Revers', actEn: 'Chapter 3 · Setback',
    briefing: 'Le suivi passe en mode confinement. Un synthétique contrôle l’infirmerie pendant que MIRE récupère la piste. Éliminez ce contact ou restez en vie jusqu’à la fin du chrono de chaque manche.',
    briefingEn: 'Tracking switches to containment. A synthetic controls the infirmary while MIRE recovers the trace. Eliminate the contact or stay alive until the clock expires in each round.',
    event: 'Le signal de Six réapparaît en aval, dans le modèle de la navette Narcissus.',
    eventEn: 'Six’s signal reappears farther along the route, inside the Narcissus shuttle model.',
    opponentId: 'synth-containment', factionId: 'containment', stageId: 'xt196-nostromo-infirmary', difficulty: 'normal',
    rules: { goal: 'survive', timeLimitSeconds: 30 }, reward: 200
  },
  {
    title: 'Le seuil du sas', titleEn: 'The Airlock Threshold',
    act: 'Chapitre 4 · Finale', actEn: 'Chapter 4 · Finale',
    briefing: 'Six réapparaît dans la cabine du Narcissus. MIRE augmente la difficulté de la comparaison et réduit le temps disponible. Remportez le dernier duel avant la fermeture de la fenêtre d’observation.',
    briefingEn: 'Six reappears inside the Narcissus cabin. MIRE raises the comparison difficulty and shortens the round clock. Win the final bout before the observation window closes.',
    event: 'La dernière mesure valide le dossier et autorise Big Chap dans le registre permanent.',
    eventEn: 'The final reading validates the dossier and authorizes Big Chap in the permanent roster.',
    opponentId: 'mire-v209-six', factionId: 'pursuit', stageId: 'xt194-narcissus-cabin', difficulty: 'hard',
    rules: { timeLimitSeconds: 60 }, reward: 300, unlockId: fighterId
  }
].map((chapter, index) => Object.freeze({ ...chapter, id: `xt231-big-chap-${index + 1}`, routeId,
  branch: XENO_TRIALS_CHARACTER_ROUTES_BRANCH_V231, forcedPlayerId: fighterId, dossierId: chapter.opponentId,
  supervisor: 'MIRE / Journal d’observation', supervisorEn: 'MIRE / Observation Log',
  canonStatus: 'original-tantalus-simulation', rules: Object.freeze(chapter.rules) }));

export const XENO_TRIALS_BIG_CHAP_ROUTE_V231 = Object.freeze({
  id: routeId, fighterId, label: 'Big Chap · Trace résiduelle', labelEn: 'Big Chap · Residual Trace',
  sourceWork: 'Alien (1979)',
  sourceUrls: Object.freeze(['https://www.20thcenturystudios.com/movies/alien', 'https://theasc.com/article/behind-the-scenes-of-alien/']),
  canonStatus: 'original-tantalus-simulation',
  prologue: 'L’équipe MIRE charge un relevé du Nostromo et de sa navette. Elle suit Big Chap dans quatre scénarios de comparaison assemblés à partir de ces espaces. Les cibles sont des modèles du laboratoire.',
  prologueEn: 'The MIRE team loads a record of the Nostromo and its shuttle. It follows Big Chap through four comparison scenarios assembled from those spaces. The targets are laboratory models.',
  epilogue: 'MIRE clôt le dossier. Dans le relevé simulé, les capteurs ont perdu Big Chap à la fermeture du sas. La cellule conserve les mesures de posture et de réaction pour les prochaines évaluations.',
  epilogueEn: 'MIRE closes the dossier. In the simulated record, the sensors lost Big Chap when the airlock shut. The team retains its posture and response readings for future evaluations.',
  chapters: Object.freeze(chapters)
});

/** The stored chapters must form a contiguous prefix of the authored route. */
export function normalizeXenoTrialsCharacterRouteClearsV231(value) {
  if (!Array.isArray(value)) return [];
  const claimed = new Set(value);
  const gap = chapters.findIndex(chapter => !claimed.has(chapter.id));
  return chapters.slice(0, gap === -1 ? chapters.length : gap).map(chapter => chapter.id);
}

export function getXenoTrialsCharacterRouteViewV231(id, modes) {
  if (id !== routeId) return null;
  const clears = normalizeXenoTrialsCharacterRouteClearsV231(modes?.characterRoutesClearedV231);
  return { ...XENO_TRIALS_BIG_CHAP_ROUTE_V231, clearedCount: clears.length,
    completed: clears.length === chapters.length, nextChapterId: chapters[clears.length]?.id ?? null,
    chapters: chapters.map((chapter, index) => ({ ...chapter, open: index <= clears.length, cleared: index < clears.length })) };
}

export function resolveXenoTrialsCharacterRouteChapterV231(id, modes) {
  return getXenoTrialsCharacterRouteViewV231(routeId, modes).chapters.find(chapter => chapter.id === id && chapter.open) ?? null;
}
