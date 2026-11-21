import { XENO_TRIALS_BOSS_STAGES_V179 } from './xeno-trials-boss-stages-v179.js';

/** Forty authored training evaluations. Each encounter is an existing admitted
 * fighter; rules use the real duel engine, never a claimed simultaneous horde. */
const tracks = [
  { id: 'pursuit', label: 'PISTES DE CHASSE', stageId: 'planet-surface', factionId: 'pursuit', difficulty: 'normal',
    opponents: ['runner', 'prowler', 'grid', 'stalker-arcade', 'panther'], briefing: 'Intercepter les chasseurs mobiles et garder une distance de riposte.' },
  { id: 'containment', label: 'VERROUS DE CONFINEMENT', stageId: 'containment-deck', factionId: 'containment', difficulty: 'normal',
    opponents: ['defender', 'chrysalis', 'smasher', 'crusher-acm', 'armored-ravager'], briefing: 'Lire les charges des spécimens lourds avant de s’engager au contact.' },
  { id: 'acid', label: 'PRESSION ACIDE', stageId: 'reactor-ring', factionId: 'hive', difficulty: 'normal',
    opponents: ['spitter', 'boiler', 'burster', 'acid-lurker', 'acid-queen'], briefing: 'Rejoindre les tireurs sans perdre la maîtrise des distances.' },
  { id: 'synthetic', label: 'DOCTRINES SYNTHÉTIQUES', stageId: 'tantalus-cargo', factionId: 'rival-lab', difficulty: 'normal',
    opponents: ['synth-trooper', 'synth-sniper', 'synth-heavy', 'synth-incinerator', 'synth-enforcer'], briefing: 'Comparer les doctrines de tir, de zone et de maintien de ligne.' },
  { id: 'reconstruction', label: 'FORMES RECONSTRUITES', stageId: 'containment-deck', factionId: 'containment', difficulty: 'normal',
    opponents: ['user-antilope', 'user-chameleon', 'user-spiker', 'user-brute', 'user-big-xeno'], briefing: 'Évaluer les gabarits des reconstructions admises au programme.' },
  { id: 'cryo', label: 'LIGNÉES CRYOGÉNIQUES', stageId: 'tantalus-bridge', factionId: 'containment', difficulty: 'hard',
    opponents: ['cryo-runner', 'cryo-lurker', 'cryo-boiler', 'cryo-ravager', 'cryo-ripper-queen'], briefing: 'Adapter la riposte aux variantes cryogéniques de la simulation.' },
  { id: 'hybrid', label: 'ANATOMIES ATYPIQUES', stageId: 'tantalus-cargo', factionId: 'rival-lab', difficulty: 'hard',
    opponents: ['predalien', 'afe2-engineer-hybrid', 'afe2-spider', 'afe2-huntsman', 'afe2-bombardier'], briefing: 'Observer les portées et les changements de rythme des profils atypiques.' },
  { id: 'royal', label: 'SEUIL ROYAL', stageId: 'hive-vault', factionId: 'hive', difficulty: 'hard',
    opponents: ['royal-guard', 'ultramorph', 'import-xeno-kingrogue', 'armored-ripper-queen', 'queen'], briefing: 'Conserver des fenêtres de dégagement face aux gabarits royaux.' }
];

const formats = [
  { id: 'contact', label: 'CONTACT CONTRÔLÉ', indices: [0, 1], rules: { noSpecial: true },
    objective: 'Deux duels successifs sans spécial. Une défaite ou un abandon interrompt la série.' },
  { id: 'interception', label: 'INTERCEPTION 60', indices: [1, 2], rules: { timeLimitSeconds: 60 },
    objective: 'Deux duels successifs, avec 60 secondes par manche. Au terme du chrono, la règle normale des PV départage les combattants.' },
  { id: 'precision', label: 'POINT DE RUPTURE', indices: [2], rules: { initialHp: 1 },
    objective: 'Les deux combattants commencent chaque manche à 1 PV. Remporter deux manches.' },
  { id: 'survival', label: 'TENIR LA LIGNE', indices: [4], rules: { goal: 'survive', timeLimitSeconds: 30 },
    objective: 'Rester en vie pendant 30 secondes, deux manches. Une élimination de l’adversaire valide aussi la manche.' },
  { id: 'gauntlet', label: 'PARCOURS COMPLET', indices: [0, 1, 2, 3, 4], rules: {},
    objective: 'Cinq duels successifs avec le même spécimen. La prime du parcours est accordée une seule fois, après le dernier duel.' }
];

export const XENO_TRIALS_CHALLENGE_CURRICULUM_V179 = Object.freeze(tracks.flatMap((track, trackIndex) => formats.map((format, formatIndex) => Object.freeze({
  id: `xt179-${track.id}-${format.id}`, title: `${track.label} · ${format.label}`,
  trackId: track.id, formatId: format.id, stageId: XENO_TRIALS_BOSS_STAGES_V179[trackIndex * formats.length + formatIndex].id, factionId: track.factionId, difficulty: track.difficulty,
  opponentIds: Object.freeze(format.indices.map(index => track.opponents[index])), rules: Object.freeze({ timeLimitSeconds: 99, ...format.rules }),
  description: `${track.briefing} ${format.objective}`, canonStatus: 'original-tantalus-simulation'
}))));
