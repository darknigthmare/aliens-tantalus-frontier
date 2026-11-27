import { getEnemyStaticPoseV95 } from './enemy-static-poses-v95.js';

const dossiers = [
  ['BIGCHAP', 'Big Chap', 'Alien (1979)', 'Pression à moyenne portée, queue et garde rapprochée.',
    { profile: 'v209-big-chap', sheet: '/assets/openai/sprites/normalized/enemy-profiles-v66/enemy-004-drone-big-chap.webp', bounds: [41, 107, 181, 240], pivot: [126, 240], body: [54, 146], height: 305, special: 'tail', hp: 232, speed: 228 }],
  ['SCORCHED', 'Scorched', 'Alien: Romulus', 'Travail de distance et d’anticipation en espace exigu. Silhouette adulte à valider.'],
  ['DEACON', 'Deacon', 'Prometheus', 'Entrée brève au contact et recul sur récupération.',
    { profile: 'castes-film_deacon_2012', special: 'slash', hp: 194, speed: 253 }],
  ['NEOMORPH', 'Neomorph adulte', 'Alien: Covenant', 'Pression mobile à courte portée, engagement risqué.',
    { profile: 'castes-film_neomorph_2017', special: 'pounce', hp: 171, speed: 304, role: 'agile' }],
  ['PREDALIEN-AVPR', 'Predalien AVPR', 'Aliens vs. Predator: Requiem', 'Contrepoids lourd à la lignée Primal Hunt. Pose adulte du film à valider.'],
  ['PRAETORIAN', 'Praetorian', 'Comparaison des éditions AVP, AFE et AFE2', 'Profil de comparaison historique jouable. Les éditions AVP, AFE et AFE2 ont des dossiers et des modèles à valider séparément.',
    { profile: 'v209-praetorian-comparison', sheet: '/assets/openai/sprites/normalized/enemies/xenomorph-praetorian-action-sheet.png', bounds: [50, 79, 206, 240], pivot: [128, 240], body: [72, 164], height: 300, special: 'ram', hp: 274, speed: 177, role: 'tank' }],
  ['SIX', 'Lignée Specimen Six', 'Aliens vs. Predator (2010)', 'Modèle du projet pour la lignée de base, avec pression mobile et frappe de queue.',
    { profile: 'v209-six-line', sheet: '/assets/openai/sprites/normalized/enemies/specimen-six-line-action-sheet-v56.png', bounds: [56, 105, 200, 240], pivot: [124, 240], body: [51, 138], height: 280, special: 'tail', hp: 205, speed: 251 }],
  ['SIREN', 'Siren', 'AFE2', 'Étudier la cadence d’un appel et son contre-jeu. Ressources propres au spécimen à valider.'],
  ['STRIKER', 'Striker', 'AFE2', 'Étudier l’approche engagée et la récupération. Ressources propres au spécimen à valider.'],
  ['BLIGHT', 'Pathogen Blight', 'Aliens: Fireteam Elite — Pathogen', 'Maintenir une distance de tir, puis défendre le temps de récupération.',
    { profile: 'castes-game_pathogen_blight', special: 'acid', hp: 184, speed: 208, role: 'ranged' }],
  ['FACEHUGGER', 'Facehugger', 'Alien (1979)', 'Épreuve asymétrique à faible santé. Approcher sous la garde et utiliser le saut.',
    { profile: 'castes-film_facehugger_alien_1979', special: 'pounce', hp: 48, speed: 272, jump: 315, role: 'agile', juvenile: true }],
  ['CHESTBURSTER', 'Chestburster', 'Alien (1979)', 'Épreuve asymétrique à faible santé. Franchir au sol et frapper à portée courte.',
    { profile: 'castes-film_chestburster_alien_1979', special: 'slash', hp: 58, speed: 258, jump: 330, role: 'agile', juvenile: true }],
  ['OVOMORPH', 'Ovomorph', 'Cycle de vie', 'Événement d’arène et objectif d’observation.'],
  ['ROMULUS-COCOON', 'Cocon', 'Alien: Romulus', 'Événement d’arène et objectif de lecture.'],
  ['TADPOLE', 'Tadpole', 'Affiliation à relever', 'Événement MIRE sur un écho expérimental, identité à confirmer.']
];

const arts = new Map();
const fighters = new Map();
const praetorianEditions = Object.freeze([
  Object.freeze({ label: 'AVP', note: 'Mesurer les appuis et la portée sur l’édition choisie.' }),
  Object.freeze({ label: 'AFE', note: 'Dossier dédié au comportement et à la silhouette de cette édition.' }),
  Object.freeze({ label: 'AFE2', note: 'Dossier à valider indépendamment avec la référence de cette édition.' }),
]);
export const XENO_TRIALS_RESEARCH_V209 = Object.freeze(dossiers.map(([id, label, source, briefing, spec]) => {
  const fighterId = spec ? 'mire-v209-' + id.toLowerCase() : null;
  if (spec) {
    const authored = spec.sheet ? Object.freeze({
      id: spec.profile, profileId: spec.profile, path: spec.sheet, sourceFacing: 1,
      sourceWidth: 256, sourceHeight: 256, sourceRectV209: Object.freeze([0, 0, 256, 256]),
      alphaBounds: Object.freeze(spec.bounds), pivot: Object.freeze({ x: spec.pivot[0] / 256, y: spec.pivot[1] / 256 }),
      renderWidth: spec.height, renderHeight: spec.height, bodyWidth: spec.body[0], bodyHeight: spec.body[1],
      biology: 'xenomorph', sourceWork: source,
    }) : getEnemyStaticPoseV95(spec.profile);
    if (!authored) throw new Error('Missing research artwork: ' + spec.profile);
    arts.set(fighterId, authored);
    fighters.set(fighterId, Object.freeze({ id: fighterId, profileId: spec.profile, label, role: spec.role ?? 'balanced',
      hp: spec.hp, speed: spec.speed, stamina: spec.juvenile ? 74 : 100, jump: spec.jump ?? 550,
      width: authored.bodyWidth, height: authored.bodyHeight, power: spec.juvenile ? .58 : 1, reach: spec.juvenile ? .52 : 1,
      special: spec.special, family: authored.biology, variants: Object.freeze([]), artStatus: 'research-adaptation', canonExact: false }));
  }
  const kind = !spec ? ['OVOMORPH', 'ROMULUS-COCOON', 'TADPOLE'].includes(id) ? 'event' : 'dossier' : spec.juvenile ? 'asymmetric' : 'duel';
  return Object.freeze({ id, label, source, briefing, fighterId, kind, ...(id === 'PRAETORIAN' ? { editions: praetorianEditions } : {}) });
}));
export const getXenoTrialsResearchFighterV209 = id => fighters.get(id) ?? null;
export const getXenoTrialsResearchArtV209 = id => arts.get(id) ?? null;
export const getXenoTrialsResearchAssetsV209 = () => [...new Set([...arts.values()].map(art => art.path))];

export function getXenoTrialsResearchEvaluationV209(id) {
  const specimen = XENO_TRIALS_RESEARCH_V209.find(entry => entry.id === id && entry.fighterId);
  if (!specimen) return null;
  const asymmetric = specimen.kind === 'asymmetric';
  return {
    playerId: specimen.fighterId, opponentId: asymmetric ? 'import-game-dd-wy-commando' : 'warrior',
    stageId: 'containment-deck', difficulty: asymmetric ? 'easy' : 'normal',
    roundSeconds: asymmetric ? 30 : 60, roundsToWin: 1, behavior: 'cpu',
  };
}
