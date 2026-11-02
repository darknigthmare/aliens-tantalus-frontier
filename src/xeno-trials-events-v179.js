// Authored Tantalus simulations. A wave is one native two-round duel; the
// specimens recover between duels. These protocols do not spawn a simultaneous
// horde and do not claim to recreate a historical franchise incident.
const freeze = value => {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
};

const families = [
  {
    id: 'incoming', title: 'HORDE WAVE INCOMING', signal: 'CONTACTS EN APPROCHE',
    description: 'Intercepter les éclaireurs, les renforts puis la caste de commandement.',
    opponents: ['runner', 'warrior', 'prowler', 'burster', 'crusher-acm', 'queen'],
    stages: ['planet-surface', 'tantalus-cargo', 'containment-deck', 'tantalus-cargo', 'reactor-ring', 'hive-vault'],
    rules: [{ timeLimitSeconds: 60 }, {}, { specialLockSeconds: 20 }, {}, { timeLimitSeconds: 120 }, {}],
    instructions: ['Intercepter le premier contact avant la fin du chrono.', 'Stopper le renfort au contact.', 'Tenir vingt secondes sans spécial avant de contre-attaquer.', 'Garder ses distances avec la caste explosive.', 'Briser la charge dans le temps imparti.', 'Neutraliser le commandement royal.']
  },
  {
    id: 'quarantine', title: 'VERROUS DE QUARANTAINE', signal: 'CONFINEMENT DÉGRADÉ',
    description: 'Reprendre les cellules par le contact : aucun spécial pendant tout le protocole.',
    opponents: ['defender', 'chrysalis', 'smasher', 'synth-containment', 'royal-guard', 'armored-ripper-queen'],
    stages: ['containment-deck', 'containment-deck', 'tantalus-cargo', 'reactor-ring', 'tantalus-bridge', 'hive-vault'],
    rules: [{ noSpecial: true, timeLimitSeconds: 60 }, { noSpecial: true }, { noSpecial: true }, { noSpecial: true, timeLimitSeconds: 75 }, { noSpecial: true }, { noSpecial: true, timeLimitSeconds: 120 }],
    instructions: ['Fermer le premier verrou sans spécial.', 'Éprouver les ouvertures de la carapace au contact.', 'Punir la récupération du gardien lourd.', 'Réduire la menace synthétique avant expiration.', 'Franchir le dernier cordon de garde.', 'Rétablir le confinement royal sans spécial.']
  },
  {
    id: 'extraction', title: 'FENÊTRE D’EXTRACTION', signal: 'BALISE EN ATTENTE',
    description: 'Rester en vie jusqu’au signal de chaque manche. Le chrono de survie prime sur les PV comparés.',
    opponents: ['prowler', 'spitter', 'ravager', 'crusher-acm', 'royal-guard', 'queen'],
    stages: ['tantalus-cargo', 'planet-surface', 'tantalus-bridge', 'reactor-ring', 'containment-deck', 'hive-vault'],
    rules: [{ goal: 'survive', timeLimitSeconds: 30 }, { goal: 'survive', timeLimitSeconds: 30 }, { goal: 'survive', timeLimitSeconds: 60 }, { goal: 'survive', timeLimitSeconds: 30, specialLockSeconds: 20 }, { goal: 'survive', timeLimitSeconds: 60 }, { goal: 'survive', timeLimitSeconds: 60, noSpecial: true }],
    instructions: ['Survivre aux interceptions jusqu’à la première balise.', 'Éviter les trajectoires acides jusqu’au signal.', 'Conserver ses appuis pendant une minute.', 'Attendre la libération des spéciaux en tenant la ligne.', 'Temporiser face à la garde royale.', 'Tenir une minute face à la Reine sans spécial.']
  },
  {
    id: 'pursuit', title: 'PISTE À CHRONOMÈTRE', signal: 'CONTACT FUGITIF',
    description: 'Des cibles mobiles et trente secondes par manche : toute égalité brise la série.',
    opponents: ['runner', 'panther', 'grid', 'stalker-arcade', 'predalien', 'ultramorph'],
    stages: ['planet-surface', 'tantalus-cargo', 'tantalus-bridge', 'containment-deck', 'planet-surface', 'hive-vault'],
    rules: [{ timeLimitSeconds: 30 }, { timeLimitSeconds: 30 }, { timeLimitSeconds: 30, specialLockSeconds: 20 }, { timeLimitSeconds: 30 }, { timeLimitSeconds: 30, noSpecial: true }, { timeLimitSeconds: 30 }],
    instructions: ['Prendre l’avantage avant le signal.', 'Intercepter les changements de distance.', 'Ouvrir au contact avant de récupérer ses spéciaux.', 'Fermer la piste du traqueur.', 'Punir le prédateur hybride sans spécial.', 'Garder l’avantage malgré le gabarit extrême.']
  },
  {
    id: 'blackout', title: 'BLACKOUT SYNTHÉTIQUE', signal: 'CANAL ARMEMENT VERROUILLÉ',
    description: 'Vingt secondes de verrouillage des spéciaux à chaque manche, puis riposte contre les unités armées.',
    opponents: ['synth-guard', 'synth-trooper', 'synth-sniper', 'synth-incinerator', 'synth-heavy', 'synth-enforcer'],
    stages: ['tantalus-bridge', 'tantalus-cargo', 'planet-surface', 'reactor-ring', 'containment-deck', 'tantalus-bridge'],
    rules: [{ specialLockSeconds: 20, timeLimitSeconds: 60 }, { specialLockSeconds: 20 }, { specialLockSeconds: 20, timeLimitSeconds: 60 }, { specialLockSeconds: 20 }, { specialLockSeconds: 20, timeLimitSeconds: 75 }, { specialLockSeconds: 20, timeLimitSeconds: 120 }],
    instructions: ['Ouvrir le contrôle de sécurité au contact.', 'Approcher l’unité de tir pendant le verrouillage.', 'Réduire la distance avant la réactivation des armes.', 'Éviter le cône d’incinération après déverrouillage.', 'Briser la ligne de l’unité lourde.', 'Terminer la reprise du réseau face à l’Enforcer.']
  },
  {
    id: 'acid', title: 'INCIDENT CORROSIF', signal: 'RISQUE ACIDE',
    description: 'Alterner neutralisation et attente face aux castes acides. Les résidus existants restent actifs.',
    opponents: ['spitter', 'burster', 'boiler', 'acid-lurker', 'acid-ravager', 'acid-queen'],
    stages: ['containment-deck', 'tantalus-cargo', 'reactor-ring', 'planet-surface', 'containment-deck', 'hive-vault'],
    rules: [{ timeLimitSeconds: 60 }, { goal: 'survive', timeLimitSeconds: 30 }, { timeLimitSeconds: 75 }, { goal: 'survive', timeLimitSeconds: 30 }, { specialLockSeconds: 20 }, { goal: 'survive', timeLimitSeconds: 60 }],
    instructions: ['Neutraliser le cracheur en conservant une sortie.', 'Survivre à la caste explosive jusqu’au signal.', 'Éloigner le Boiler de ses propres résidus.', 'Tenir la zone pendant le relevé de contamination.', 'Passer le verrouillage initial puis contre-attaquer.', 'Maintenir une issue face à la Reine acide pendant une minute.']
  },
  {
    id: 'sudden-death', title: 'SIGNAL ROUGE · 1 PV', signal: 'INTÉGRITÉ CRITIQUE',
    description: 'Un seul PV par combattant à chaque manche. Trouver le premier contact décisif.',
    opponents: ['arachnoid', 'runner', 'warrior', 'synth-trooper', 'prowler', 'royal-guard'],
    stages: ['containment-deck', 'planet-surface', 'tantalus-cargo', 'tantalus-bridge', 'reactor-ring', 'hive-vault'],
    rules: [{ initialHp: 1, noSpecial: true, timeLimitSeconds: 30 }, { initialHp: 1, timeLimitSeconds: 30 }, { initialHp: 1, noSpecial: true, timeLimitSeconds: 30 }, { initialHp: 1, specialLockSeconds: 20, timeLimitSeconds: 30 }, { initialHp: 1, timeLimitSeconds: 30 }, { initialHp: 1, noSpecial: true, timeLimitSeconds: 30 }],
    instructions: ['Placer un contact ordinaire sans être touché.', 'Intercepter le coureur sans échanger les coups.', 'Lire la portée du Warrior sans spécial.', 'Atteindre le synthétique avant la remise en service.', 'Éviter le bond puis riposter.', 'Trouver l’ouverture de la garde royale au contact.']
  },
  {
    id: 'royal', title: 'ALERTE ROYALE', signal: 'PRIORITÉ APEX',
    description: 'Une ligne de défense croissante se termine toujours par un duel royal. Préserver la série jusqu’au boss.',
    opponents: ['warrior', 'chrysalis', 'crusher-acm', 'ravager', 'royal-guard', 'queen'],
    stages: ['tantalus-cargo', 'containment-deck', 'reactor-ring', 'planet-surface', 'tantalus-bridge', 'hive-vault'],
    rules: [{ noSpecial: true }, { specialLockSeconds: 20 }, { timeLimitSeconds: 75 }, { noSpecial: true }, { timeLimitSeconds: 60 }, { timeLimitSeconds: 120 }],
    instructions: ['Ouvrir le cordon extérieur sans spécial.', 'Percer la carapace pendant la restauration du canal.', 'Interrompre la charge avant expiration.', 'Gagner le contact face au Ravager.', 'Renverser la garde du trône dans le temps imparti.', 'Conclure face à la Reine mobile.']
  }
];

function createEvent(family, level) {
  const count = level + 1;
  // Each royal event ends at the throne, even the introductory two-duel route.
  const indices = family.id === 'royal'
    ? [...Array.from({ length: count - 1 }, (_, index) => index), 5]
    : Array.from({ length: count }, (_, index) => index);
  const waves = indices.map((index, bout) => ({
    opponentId: family.opponents[index], stageId: family.stages[index],
    difficulty: level === 1 ? 'easy' : level >= 4 || index === 5 ? 'hard' : 'normal',
    rules: { ...family.rules[index] },
    label: `${family.signal} · VAGUE ${bout + 1}/${count}`,
    briefing: family.instructions[index]
  }));
  return freeze({
    id: `xte179-${family.id}-${level}`, title: `${family.title} · ${String(level).padStart(2, '0')}`,
    act: `ÉVÉNEMENT · ${family.signal}`, eventV179: true, eventFamily: family.id,
    description: `${family.description} ${count} vagues successives, chacune un duel en deux manches gagnantes. Récupération complète entre les duels ; une défaite, une égalité ou un abandon réinitialise la série.`,
    waves, opponentIds: waves.map(wave => wave.opponentId), rules: { ...waves[0].rules },
    reward: 300 + level * 100 + (family.id === 'royal' ? 100 : 0),
    canonStatus: 'original-tantalus-simulation'
  });
}

export const XENO_TRIALS_EVENTS_V179 = freeze(families.flatMap(family =>
  Array.from({ length: 5 }, (_, index) => createEvent(family, index + 1))));

export function getXenoTrialsEventV179(id) {
  return XENO_TRIALS_EVENTS_V179.find(event => event.id === id) || null;
}

/** Resolve only an authored wave. Invalid saved indices never wrap or repeat. */
export function getXenoTrialsEventWaveV179(id, bout = 0) {
  if (!Number.isInteger(bout) || bout < 0) return null;
  return getXenoTrialsEventV179(id)?.waves[bout] || null;
}
