import { XENO_TRIALS_BIG_CHAP_ROUTE_V231, XENO_TRIALS_CHARACTER_ROUTES_BRANCH_V231,
  getXenoTrialsCharacterRouteViewV231 } from './xeno-trials-character-routes-v231.js';

export const XENO_TRIALS_CHARACTER_ROUTES_BRANCH_V232 = XENO_TRIALS_CHARACTER_ROUTES_BRANCH_V231;

const acts = [
  ['Chapitre 1 · Amorçage', 'Chapter 1 · Calibration'],
  ['Chapitre 2 · Rivalité', 'Chapter 2 · Rivalry'],
  ['Chapitre 3 · Revers', 'Chapter 3 · Setback'],
  ['Chapitre 4 · Finale', 'Chapter 4 · Finale']
];
function authorRoute(route, entries) {
  return Object.freeze({ ...route, sourceUrls: Object.freeze(route.sourceUrls),
    canonStatus: 'original-tantalus-simulation',
    chapters: Object.freeze(entries.map((chapter, index) => Object.freeze({ ...chapter,
      id: `xt232-${route.id}-${index + 1}`, routeId: route.id,
      branch: XENO_TRIALS_CHARACTER_ROUTES_BRANCH_V232, forcedPlayerId: route.fighterId,
      act: acts[index][0], actEn: acts[index][1], dossierId: chapter.opponentId,
      supervisor: 'MIRE / Analyse des lignées', supervisorEn: 'MIRE / Lineage Analysis',
      canonStatus: 'original-tantalus-simulation', rules: Object.freeze(chapter.rules),
      ...(index === 3 ? { unlockId: route.fighterId } : {})
    }))) });
}

const neomorph = authorRoute({
  id: 'neomorph', fighterId: 'mire-v209-neomorph',
  label: 'Neomorph · Le signal pâle', labelEn: 'Neomorph · The Pale Signal',
  sourceWork: 'Alien: Covenant (2017)',
  sourceUrls: ['https://www.20thcenturystudios.com/movies/alien-covenant'],
  prologue: 'Une trace pâle traverse les relevés de la Planète 4. MIRE charge son modèle de Neomorph adulte et confronte sa mobilité à des contacts reconstruits. Les lieux viennent de Covenant ; la piste et les duels sont un montage du laboratoire. Aucun ordre transmis au terminal ne constitue un dressage de la créature.',
  prologueEn: 'A pale trace crosses the Planet 4 records. MIRE loads its adult Neomorph model and compares its mobility against reconstructed contacts. The locations come from Covenant; the trail and bouts are a laboratory composition. Terminal instructions do not imply that the creature is trained.',
  epilogue: 'Le modèle de David s’efface. MIRE isole le signal pâle des parasites de maintenance et archive les engagements brusques du Neomorph. Cette validation autorise le modèle permanent ; elle ne prolonge ni le destin du spécimen du film, ni une relation d’obéissance à David.',
  epilogueEn: 'The David model fades out. MIRE separates the pale signal from maintenance interference and archives the Neomorph’s sudden engagements. This validation authorizes the permanent model; it extends neither the film specimen’s fate nor a relationship of obedience to David.'
}, [
  {
    title: 'Les blés se séparent', titleEn: 'The Wheat Parts',
    briefing: 'Dans le champ de blé reconstruit, MIRE place un Runner de comparaison sur la trace pâle. Les spéciaux sont neutralisés : l’opérateur mesure les approches au sol avant de charger les impulsions du Neomorph.',
    briefingEn: 'In the reconstructed wheat field, MIRE places a comparison Runner across the pale trace. Specials are disabled: the operator measures grounded approaches before loading the Neomorph’s bursts.',
    event: 'La trace passe sous les arches de la nécropole. Un leurre synthétique y attend le prochain relevé.',
    eventEn: 'The trace passes beneath the necropolis arches. A synthetic decoy awaits the next reading there.',
    opponentId: 'runner', factionId: 'pursuit', stageId: 'xt192-planet4-wheat-field', difficulty: 'easy',
    rules: { noSpecial: true, timeLimitSeconds: 60 }, reward: 120
  },
  {
    title: 'Le leurre de David', titleEn: 'David’s Decoy',
    briefing: 'MIRE injecte une adaptation de David dans la nécropole pour comparer ses distances de contact aux entrées du Neomorph. Le synthétique est ici une cible de mesure, sans dialogue ni commande adressée à la créature.',
    briefingEn: 'MIRE introduces a David adaptation in the necropolis to compare its contact distances against the Neomorph’s entries. The synthetic is a measurement target here, with no dialogue or commands to the creature.',
    event: 'Le duel fait apparaître une seconde émission de David. MIRE coupe la liaison et déplace l’essai dans l’atelier du Covenant pour séparer les deux sources.',
    eventEn: 'The bout reveals a second David transmission. MIRE cuts the link and moves the trial to the Covenant workshop to separate the two sources.',
    opponentId: 'import-wy-covenant-david', factionId: 'rival-lab', stageId: 'xt192-planet4-necropolis', difficulty: 'normal',
    rules: { timeLimitSeconds: 75 }, reward: 160
  },
  {
    title: 'Écho dans l’atelier', titleEn: 'Workshop Echo',
    briefing: 'Un synthétique de confinement brouille la mesure dans l’atelier reconstruit. MIRE suspend l’identification du leurre. Éliminez ce contact ou préservez le Neomorph jusqu’au terme du chrono de chaque manche pour restaurer le relevé.',
    briefingEn: 'A containment synthetic disrupts the reading inside the reconstructed workshop. MIRE suspends identification of the decoy. Eliminate the contact or preserve the Neomorph until each round’s clock expires to restore the reading.',
    event: 'Le parasite est isolé. La signature du leurre de David est relocalisée dans la nécropole avec sa fenêtre de contre complète.',
    eventEn: 'The interference is isolated. The David decoy’s signature is relocated to the necropolis with its full counter window.',
    opponentId: 'synth-containment', factionId: 'containment', stageId: 'xt198-covenant-maintenance-workshop', difficulty: 'normal',
    rules: { goal: 'survive', timeLimitSeconds: 30 }, reward: 200
  },
  {
    title: 'Une trace sans maître', titleEn: 'A Trace Without a Master',
    briefing: 'La comparaison reprend face au modèle de David dans la nécropole. Sa difficulté est accrue, le chrono réduit. Validez les réactions du Neomorph avant que MIRE ne ferme ce dossier de télémétrie.',
    briefingEn: 'The comparison resumes against the David model in the necropolis. Difficulty rises and the clock shortens. Validate the Neomorph’s reactions before MIRE closes this telemetry dossier.',
    event: 'Les relevés convergent : le modèle Neomorph adulte reçoit son autorisation permanente, indépendamment du dossier de David.',
    eventEn: 'The readings converge: the adult Neomorph model receives permanent authorization independently of David’s dossier.',
    opponentId: 'import-wy-covenant-david', factionId: 'rival-lab', stageId: 'xt192-planet4-necropolis', difficulty: 'hard',
    rules: { timeLimitSeconds: 60 }, reward: 300
  }
]);

const deacon = authorRoute({
  id: 'deacon', fighterId: 'mire-v209-deacon',
  label: 'Deacon · L’empreinte incomplète', labelEn: 'Deacon · The Incomplete Imprint',
  sourceWork: 'Prometheus (2012)',
  sourceUrls: ['https://www.20thcenturystudios.com/movies/prometheus'],
  prologue: 'Le bref relevé du Deacon laisse des mouvements hors champ. MIRE teste son adaptation jouable dans des espaces de Prometheus et de LV-223. Les adversaires sont des modèles comparatifs ajoutés par le laboratoire : ces quatre épreuves ne racontent pas une suite canonique à son apparition.',
  prologueEn: 'The brief Deacon record leaves movement outside the frame. MIRE tests its playable adaptation in Prometheus and LV-223 spaces. Opponents are comparison models added by the laboratory: these four trials do not tell a canonical sequel to its appearance.',
  epilogue: 'L’empreinte reste partielle, mais les mesures du modèle sont stables. MIRE conserve les limites du relevé original et accorde l’autorisation permanente Deacon. L’Ingénieur rencontré n’était qu’une cible comparative ; aucune nouvelle rencontre historique n’est inscrite au dossier.',
  epilogueEn: 'The imprint remains partial, but the model’s readings are stable. MIRE retains the limits of the original record and grants permanent Deacon authorization. The encountered Engineer was a comparison target; no new historical encounter is entered in the dossier.'
}, [
  {
    title: 'Première empreinte', titleEn: 'First Imprint',
    briefing: 'Dans le module médical reconstruit, MIRE oppose un synthétique de garde au modèle Deacon. Sans spéciaux, le relevé porte sur les appuis et le retour de garde ; il ne reconstitue pas les circonstances de sa naissance.',
    briefingEn: 'Inside the reconstructed medical module, MIRE pits a guard synthetic against the Deacon model. With specials disabled, the reading concerns footwork and guard recovery; it does not recreate the circumstances of its birth.',
    event: 'Une empreinte exploitable est obtenue. MIRE charge un gabarit d’Ingénieur dans la chambre des urnes pour une comparaison de portée.',
    eventEn: 'A usable imprint is obtained. MIRE loads an Engineer body model in the ampule chamber for a reach comparison.',
    opponentId: 'synth-guard', factionId: 'containment', stageId: 'xt194-prometheus-medpod', difficulty: 'easy',
    rules: { noSpecial: true, timeLimitSeconds: 60 }, reward: 120
  },
  {
    title: 'Contre-épreuve des urnes', titleEn: 'Ampule Countertrial',
    briefing: 'Le modèle d’Ingénieur en biosuit contrôle la distance dans la chambre des urnes. MIRE compare son gabarit aux engagements du Deacon. Le duel est une hypothèse d’essai, sans attribuer au Deacon une chasse absente du film.',
    briefingEn: 'The biosuit Engineer model controls distance in the ampule chamber. MIRE compares its body scale against the Deacon’s engagements. The bout is a trial hypothesis, without assigning the Deacon a hunt absent from the film.',
    event: 'La portée est mesurée, mais une saturation des capteurs invalide la trajectoire suivante. Le laboratoire replie l’essai dans la salle de navigation.',
    eventEn: 'Reach is measured, but sensor saturation invalidates the next trajectory. The laboratory moves the trial back into the orrery.',
    opponentId: 'drive-v123-creature-prometheus-engineer-biosuit', factionId: 'containment', stageId: 'xt192-lv223-ampule-chamber', difficulty: 'normal',
    rules: { timeLimitSeconds: 75 }, reward: 160
  },
  {
    title: 'L’angle mort de l’orrery', titleEn: 'The Orrery Blind Spot',
    briefing: 'MIRE suspend la comparaison avec l’Ingénieur et charge un synthétique de confinement dans l’angle mort de la salle de navigation. Le laboratoire maintient une observation courte. Éliminez le modèle ou survivez au chrono de chaque manche pour récupérer les données perdues.',
    briefingEn: 'MIRE suspends the Engineer comparison and loads a containment synthetic in the orrery’s blind spot. The laboratory maintains a short observation. Eliminate the model or survive each round’s clock to recover the lost data.',
    event: 'Les données sont récupérées. MIRE réinstalle la première cible Ingénieur dans le module médical pour recouper l’empreinte initiale.',
    eventEn: 'The data is recovered. MIRE reinstalls the first Engineer target in the medical module to cross-check the initial imprint.',
    opponentId: 'synth-containment', factionId: 'containment', stageId: 'xt192-lv223-orrery', difficulty: 'normal',
    rules: { goal: 'survive', timeLimitSeconds: 30 }, reward: 200
  },
  {
    title: 'Le relevé se referme', titleEn: 'The Record Closes',
    briefing: 'Le modèle d’Ingénieur en biosuit reprend la comparaison, dans le même module que l’amorçage. MIRE resserre le chrono et augmente la difficulté. Cette finale valide une adaptation de tournoi, sans compléter artificiellement la biographie du Deacon.',
    briefingEn: 'The biosuit Engineer model resumes the comparison in the calibration module. MIRE shortens the clock and raises the difficulty. This finale validates a tournament adaptation without artificially completing the Deacon’s biography.',
    event: 'Le recoupement stabilise le dossier de simulation. L’autorisation permanente Deacon est accordée.',
    eventEn: 'The cross-check stabilizes the simulation dossier. Permanent Deacon authorization is granted.',
    opponentId: 'drive-v123-creature-prometheus-engineer-biosuit', factionId: 'containment', stageId: 'xt194-prometheus-medpod', difficulty: 'hard',
    rules: { timeLimitSeconds: 60 }, reward: 300
  }
]);

const six = authorRoute({
  id: 'specimen-six', fighterId: 'mire-v209-six',
  label: 'Lignée Six · Le double du relevé', labelEn: 'Six Lineage · The Duplicate Record',
  sourceWork: 'Aliens vs. Predator (2010)',
  sourceUrls: ['https://store.steampowered.com/app/10680/Aliens_vs_Predator/'],
  prologue: 'MIRE extrait une série d’essais de ses modèles de BG-386. Le spécimen prêté est la lignée Six du projet, pas une nouvelle identité ni la promesse de rejouer toute la campagne de 2010. Une variante albino injectée dans les relevés servira de rival de comparaison ; les décisions appartiennent au laboratoire, pas à une créature devenue membre de son équipe.',
  prologueEn: 'MIRE extracts a trial series from its BG-386 models. The loaned specimen is the project’s Six lineage, neither a new identity nor a promise to replay the entire 2010 campaign. An albino variant inserted into the records will serve as a comparison rival; decisions belong to the laboratory, not to a creature made part of its team.',
  epilogue: 'Les deux traces sont enfin séparées. MIRE archive la variante albino comme modèle de comparaison et autorise définitivement la lignée Six. Ce résultat ne constitue ni une évolution canonique de Specimen Six, ni une nouvelle fin pour Aliens vs. Predator.',
  epilogueEn: 'The two traces are finally separated. MIRE archives the albino variant as a comparison model and permanently authorizes the Six lineage. This result establishes neither a canonical Specimen Six evolution nor a new ending for Aliens vs. Predator.'
}, [
  {
    title: 'Numéro de cellule', titleEn: 'Cell Number',
    briefing: 'Dans le relevé de Freya’s Prospect, un Synth Trooper de comparaison ferme la ligne d’essai. MIRE neutralise les spéciaux pour identifier les appuis du modèle Six avant d’introduire son double.',
    briefingEn: 'In the Freya’s Prospect record, a comparison Synth Trooper closes the trial lane. MIRE disables specials to identify the Six model’s footwork before introducing its duplicate.',
    event: 'La trace de base est enregistrée. Une signature albino est chargée dans le relevé de la pyramide.',
    eventEn: 'The base trace is recorded. An albino signature is loaded into the pyramid record.',
    opponentId: 'synth-trooper', factionId: 'rival-lab', stageId: 'xt192-bg386-freya-prospect', difficulty: 'easy',
    rules: { noSpecial: true, timeLimitSeconds: 60 }, reward: 120
  },
  {
    title: 'La marque blanche', titleEn: 'The White Mark',
    briefing: 'La variante albino de la lignée Six occupe le modèle de la pyramide. MIRE compare les deux signatures à armes égales. Le double est une adaptation du projet, sans prétendre constituer un autre individu canonique de la campagne.',
    briefingEn: 'The Six lineage’s albino variant occupies the pyramid model. MIRE compares the two signatures on equal terms. The duplicate is a project adaptation, with no claim to be another canonical individual from the campaign.',
    event: 'Les traces se superposent. Le laboratoire coupe l’échantillon de la pyramide et relance le tri à Freya’s Prospect.',
    eventEn: 'The traces overlap. The laboratory cuts the pyramid sample and restarts the sorting process at Freya’s Prospect.',
    opponentId: 'albino-six', factionId: 'rival-lab', stageId: 'xt192-bg386-pyramid', difficulty: 'normal',
    rules: { timeLimitSeconds: 75 }, reward: 160
  },
  {
    title: 'Purge du doublon', titleEn: 'Purging the Duplicate',
    briefing: 'Un Enforcer MIRE exerce la pression à Freya’s Prospect pendant le tri des signatures. Éliminez ce contact ou survivez au chrono de chaque manche. Cette rupture de protocole est propre au laboratoire, pas un épisode retrouvé du jeu.',
    briefingEn: 'A MIRE Enforcer applies pressure at Freya’s Prospect while the signatures are sorted. Eliminate the contact or survive each round’s clock. This protocol break belongs to the laboratory, not to a recovered episode of the game.',
    event: 'Le tri restitue deux pistes distinctes. Le modèle Six retrouve son double albino au même point d’observation de la pyramide.',
    eventEn: 'Sorting restores two separate trails. The Six model encounters its albino duplicate at the same pyramid observation point.',
    opponentId: 'synth-enforcer', factionId: 'rival-lab', stageId: 'xt192-bg386-freya-prospect', difficulty: 'normal',
    rules: { goal: 'survive', timeLimitSeconds: 30 }, reward: 200
  },
  {
    title: 'Deux traces, un dossier', titleEn: 'Two Traces, One Dossier',
    briefing: 'Le double albino revient dans la pyramide avec la difficulté maximale du parcours. MIRE réduit la fenêtre de mesure. La dernière comparaison doit distinguer les réactions de la lignée Six avant l’archivage du dossier.',
    briefingEn: 'The albino duplicate returns to the pyramid at the route’s highest difficulty. MIRE reduces the measurement window. The last comparison must distinguish the Six lineage’s reactions before the dossier is archived.',
    event: 'La signature de la lignée Six est isolée et reçoit son autorisation permanente. La variante albino conserve son dossier distinct.',
    eventEn: 'The Six lineage’s signature is isolated and receives permanent authorization. The albino variant retains its separate dossier.',
    opponentId: 'albino-six', factionId: 'rival-lab', stageId: 'xt192-bg386-pyramid', difficulty: 'hard',
    rules: { timeLimitSeconds: 60 }, reward: 300
  }
]);

/** Big Chap keeps its V231 identifiers, authored values and save field. */
export const XENO_TRIALS_CHARACTER_ROUTES_V232 = Object.freeze([
  XENO_TRIALS_BIG_CHAP_ROUTE_V231, neomorph, deacon, six
]);
const additions = XENO_TRIALS_CHARACTER_ROUTES_V232.slice(1);
const record = value => value && typeof value === 'object' && !Array.isArray(value);

/** Each route stores only a contiguous prefix. Foreign route/chapter IDs are discarded. */
export function normalizeXenoTrialsCharacterRouteClearsV232(value) {
  const result = {};
  if (!record(value)) return result;
  for (const route of additions) {
    if (!Object.hasOwn(value, route.id) || !Array.isArray(value[route.id])) continue;
    const claimed = new Set(value[route.id]);
    const gap = route.chapters.findIndex(chapter => !claimed.has(chapter.id));
    const clears = route.chapters.slice(0, gap === -1 ? route.chapters.length : gap).map(chapter => chapter.id);
    if (clears.length) result[route.id] = clears;
  }
  return result;
}

export function getXenoTrialsCharacterRouteViewV232(id, modes) {
  if (id === XENO_TRIALS_BIG_CHAP_ROUTE_V231.id) return getXenoTrialsCharacterRouteViewV231(id, modes);
  const route = additions.find(entry => entry.id === id);
  if (!route) return null;
  const clears = normalizeXenoTrialsCharacterRouteClearsV232(modes?.characterRoutesClearedV232)[id] || [];
  return { ...route, clearedCount: clears.length, completed: clears.length === route.chapters.length,
    nextChapterId: route.chapters[clears.length]?.id ?? null,
    chapters: route.chapters.map((chapter, index) => ({ ...chapter, open: index <= clears.length, cleared: index < clears.length })) };
}

export function resolveXenoTrialsCharacterRouteChapterV232(id, modes) {
  const route = XENO_TRIALS_CHARACTER_ROUTES_V232.find(entry => entry.chapters.some(chapter => chapter.id === id));
  return route ? getXenoTrialsCharacterRouteViewV232(route.id, modes).chapters.find(chapter => chapter.id === id && chapter.open) ?? null : null;
}
